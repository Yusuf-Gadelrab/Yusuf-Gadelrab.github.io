#!/usr/bin/env python3
"""Crawl-discovery generator: sitemap index + section sitemaps, fully derived from disk.

Everything here is derived by walking `public/`. There is no static page list
anywhere in this file, so pages added by any other tool are picked up on the next
run without editing this script.

    python3 tools/sitemap.py             regenerate + verify + print the loc diff
    python3 tools/sitemap.py --check     verify what is already on disk, write nothing
    python3 tools/sitemap.py --allow-removals   acknowledge genuine page deletions

Anti-regression contract (this is the whole point of the file)
--------------------------------------------------------------
A previous version of this generator silently dropped 14 URLs — the entire
`/writing/`, `/aurum/` and `/codeswitch/` sections — because the glob list and
the site drifted apart. So every run diffs the new `<loc>` set against the
previous one and classifies each removal:

  * file still on disk and still indexable  -> FATAL, exit 1 with a diff
  * file still on disk but now noindex/robots-disallowed -> allowed, announced
  * file gone from disk -> genuine deletion, allowed only with --allow-removals

The previous set is read from tools/.sitemap-manifest.json, falling back to the
sitemaps already in public/ on a first run, so the guard is live immediately.

Exclusions are *read*, never assumed: robots.txt Disallow rules for `User-agent: *`
are parsed and applied, and each page's own `<meta name="robots">` is inspected for
`noindex`.

`<changefreq>` and `<priority>` are deliberately omitted — Google confirmed in 2023
that it ignores both, Bing treats priority as spam-prone and ignores it, and a
self-reported priority on a 140-URL personal site carries no information a crawler
would act on. `<lastmod>` is the one hint that still moves crawl scheduling, so it
is derived per-file from git's last commit touching that file (filesystem mtime for
untracked or locally-modified files) rather than a blanket today's-date, which
trains crawlers to distrust the field.
"""
from __future__ import annotations

import argparse
import json
import os
import posixpath
import re
import subprocess
import sys
import xml.etree.ElementTree as ET
from datetime import datetime, timezone

BASE = "https://yusuf-gadelrab.github.io"
ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
PUB = os.path.join(ROOT, "public")
MANIFEST = os.path.join(ROOT, "tools", ".sitemap-manifest.json")

# Ordered: the first matching prefix wins, everything else falls through to "pages".
# A new top-level content directory therefore lands in "pages" rather than vanishing.
SECTIONS = [("guides", "/guides/"), ("writing", "/writing/"), ("apps", "/apps/")]
DEFAULT_SECTION = "pages"

# Search-verification stubs are pages by accident, not by intent. Matched by shape
# (provider-issued token filenames) so a new stub does not need a code change.
STUB_RE = re.compile(r"^(google[0-9a-f]{16}|BingSiteAuth|yandex_[0-9a-f]+|pinterest-[0-9a-f]+)\.html$")

IMG_EXT_OK = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}
MAX_IMAGES_PER_PAGE = 40


# --------------------------------------------------------------------------- robots


def load_disallows() -> list[str]:
    """Parse the `User-agent: *` group out of public/robots.txt."""
    path = os.path.join(PUB, "robots.txt")
    if not os.path.exists(path):
        return []
    rules: list[str] = []
    agents: list[str] = []      # user-agents of the group currently being read
    reading_rules = False       # consecutive User-agent lines share one group
    for raw in open(path, encoding="utf-8"):
        line = raw.split("#", 1)[0].strip()
        if not line or ":" not in line:
            continue
        field, _, value = line.partition(":")
        field, value = field.strip().lower(), value.strip()
        if field == "user-agent":
            if reading_rules:
                agents, reading_rules = [], False
            agents.append(value.lower())
        elif field in ("allow", "disallow"):
            reading_rules = True
            if field == "disallow" and value and "*" in agents:
                rules.append(value)
    return rules


def robots_blocks(url_path: str, rules: list[str]) -> str | None:
    """Return the matching Disallow rule, or None. Supports `*` and `$` wildcards."""
    for rule in rules:
        pattern = "".join(".*" if ch == "*" else re.escape(ch) for ch in rule.rstrip("$"))
        pattern = "^" + pattern + ("$" if rule.endswith("$") else "")
        if re.match(pattern, url_path):
            return rule
    return None


# --------------------------------------------------------------------------- discovery


def url_for(rel: str) -> str:
    """public/-relative path -> absolute site URL. index.html collapses to its directory."""
    parts = rel.replace(os.sep, "/")
    if parts == "index.html":
        return BASE + "/"
    if parts.endswith("/index.html"):
        return f"{BASE}/{parts[: -len('index.html')]}"
    return f"{BASE}/{parts}"


def path_for(url: str) -> str:
    """Inverse of url_for: absolute site URL -> the file that must exist on disk."""
    rel = url[len(BASE) :].lstrip("/")
    if rel == "" or rel.endswith("/"):
        rel += "index.html"
    return os.path.join(PUB, rel.replace("/", os.sep))


def walk_html() -> list[str]:
    out = []
    for dirpath, dirnames, filenames in os.walk(PUB):
        dirnames[:] = [d for d in dirnames if not d.startswith(".") and d != "node_modules"]
        for name in filenames:
            if name.endswith(".html"):
                out.append(os.path.relpath(os.path.join(dirpath, name), PUB))
    return sorted(out)


def indexable(rel: str, text: str, rules: list[str]) -> tuple[bool, str]:
    """(keep?, reason-if-dropped). Reads the page rather than assuming anything."""
    url_path = url_for(rel)[len(BASE) :]
    if STUB_RE.match(os.path.basename(rel)):
        return False, "search-verification stub"
    hit = robots_blocks(url_path, rules)
    if hit:
        return False, f"robots.txt Disallow: {hit}"
    m = re.search(r'<meta[^>]+name=["\']robots["\'][^>]*>', text, re.I)
    if m and re.search(r"content=[\"'][^\"']*\bnoindex\b", m.group(0), re.I):
        return False, "meta robots noindex"
    can = re.search(r'<link[^>]+rel=["\']canonical["\'][^>]*href=["\']([^"\']+)', text, re.I)
    if can:
        target = can.group(1).strip()
        if target.startswith("http") and target.rstrip("/") not in (
            url_for(rel).rstrip("/"),
            url_for(rel),
        ):
            return False, f"canonical points elsewhere ({target})"
    return True, ""


# --------------------------------------------------------------------------- lastmod


def git_lastmod_map() -> dict[str, str]:
    """One `git log` walk -> {public-relative path: ISO date of last commit touching it}."""
    try:
        out = subprocess.run(
            ["git", "-C", ROOT, "log", "--pretty=format:@%cI", "--name-only", "--no-renames", "--", "public"],
            capture_output=True, text=True, timeout=90,
        )
    except Exception:
        return {}
    if out.returncode != 0:
        return {}
    dates, cur = {}, None
    for line in out.stdout.splitlines():
        if line.startswith("@"):
            cur = line[1:]
        elif line.strip() and cur:
            p = line.strip()
            if p.startswith("public/"):
                dates.setdefault(p[len("public/") :], cur)
    return dates


def dirty_paths() -> set[str]:
    """Tracked-but-modified + untracked files: their git date is stale, so use mtime."""
    try:
        out = subprocess.run(["git", "-C", ROOT, "status", "--porcelain", "--", "public"],
                             capture_output=True, text=True, timeout=60)
    except Exception:
        return set()
    dirty = set()
    for line in out.stdout.splitlines():
        p = line[3:].strip().strip('"')
        if " -> " in p:
            p = p.split(" -> ")[-1]
        if p.startswith("public/"):
            dirty.add(p[len("public/") :])
    return dirty


def mtime_iso(abs_path: str) -> str:
    ts = datetime.fromtimestamp(os.path.getmtime(abs_path), tz=timezone.utc).astimezone()
    return ts.replace(microsecond=0).isoformat()


# --------------------------------------------------------------------------- images


IMG_RE = re.compile(r"<img\b[^>]*>", re.I)
SRC_RE = re.compile(r"<source\b[^>]*>", re.I)
ATTR_RE = re.compile(r'(\w[\w:-]*)\s*=\s*"([^"]*)"|(\w[\w:-]*)\s*=\s*\'([^\']*)\'')


def _attrs(tag: str) -> dict[str, str]:
    d = {}
    for m in ATTR_RE.finditer(tag):
        k = (m.group(1) or m.group(3) or "").lower()
        d[k] = m.group(2) if m.group(2) is not None else (m.group(4) or "")
    return d


def page_images(rel: str, text: str, page_url: str) -> list[str]:
    """Meaningful image URLs on a page, parsed from the built HTML.

    Parsed at build time on purpose: another pass is converting JPG/PNG to WebP,
    so a directory listing would go stale. Decorative marks (empty alt) and SVG
    are skipped — Google Images indexes neither usefully. `<picture>` variants of
    the same image collapse to one entry so a photo is not submitted twice.
    """
    base_dir = posixpath.dirname(page_url[len(BASE) :]) or "/"
    found: dict[tuple[str, str], str] = {}

    def consider(src: str, decorative: bool, is_fallback: bool) -> None:
        src = src.strip()
        if not src or src.startswith(("data:", "#")) or decorative:
            return
        if src.startswith("http") and not src.startswith(BASE):
            return
        path = src[len(BASE) :] if src.startswith(BASE) else src
        path = path.split("?")[0].split("#")[0]
        if not path.startswith("/"):
            path = posixpath.normpath(posixpath.join(base_dir, path))
            if not path.startswith("/"):
                path = "/" + path
        ext = posixpath.splitext(path)[1].lower()
        if ext not in IMG_EXT_OK:
            return
        if not os.path.exists(os.path.join(PUB, path.lstrip("/").replace("/", os.sep))):
            return
        key = (posixpath.dirname(path), posixpath.splitext(posixpath.basename(path))[0])
        # <img src> is the fallback every crawler can fetch, so it wins over <source>.
        if key not in found or is_fallback:
            found[key] = BASE + path

    for tag in IMG_RE.finditer(text):
        a = _attrs(tag.group(0))
        consider(a.get("src", ""), a.get("alt", "").strip() == "", True)
    for tag in SRC_RE.finditer(text):
        a = _attrs(tag.group(0))
        for cand in a.get("srcset", "").split(","):
            consider(cand.strip().split(" ")[0], False, False)

    return list(dict.fromkeys(found.values()))[:MAX_IMAGES_PER_PAGE]


# --------------------------------------------------------------------------- emit


def esc(s: str) -> str:
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def write_urlset(path: str, entries: list[dict]) -> None:
    has_img = any(e["images"] for e in entries)
    ns = ' xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'
    if has_img:
        ns += ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"'
    out = ['<?xml version="1.0" encoding="UTF-8"?>', f"<urlset{ns}>"]
    for e in entries:
        out += ["  <url>", f"    <loc>{esc(e['loc'])}</loc>", f"    <lastmod>{e['lastmod']}</lastmod>"]
        for img in e["images"]:
            out += ["    <image:image>", f"      <image:loc>{esc(img)}</image:loc>", "    </image:image>"]
        out.append("  </url>")
    out.append("</urlset>")
    open(path, "w", encoding="utf-8").write("\n".join(out) + "\n")


def write_index(path: str, sitemaps: list[tuple[str, str]]) -> None:
    out = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for loc, lastmod in sitemaps:
        out += ["  <sitemap>", f"    <loc>{esc(loc)}</loc>", f"    <lastmod>{lastmod}</lastmod>", "  </sitemap>"]
    out.append("</sitemapindex>")
    open(path, "w", encoding="utf-8").write("\n".join(out) + "\n")


# --------------------------------------------------------------------------- previous state


def read_existing_locs() -> list[str]:
    """Every <loc> currently published, whether sitemap.xml is a flat urlset or an index."""
    top = os.path.join(PUB, "sitemap.xml")
    if not os.path.exists(top):
        return []
    try:
        root = ET.parse(top).getroot()
    except ET.ParseError:
        return []
    tag = root.tag.split("}")[-1]
    ns = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
    if tag == "sitemapindex":
        locs = []
        for sm in root.findall(f"{ns}sitemap"):
            child_url = (sm.findtext(f"{ns}loc") or "").strip()
            child = os.path.join(PUB, child_url[len(BASE) :].lstrip("/"))
            if os.path.exists(child):
                try:
                    locs += [(u.findtext(f"{ns}loc") or "").strip()
                             for u in ET.parse(child).getroot().findall(f"{ns}url")]
                except ET.ParseError:
                    pass
        return [l for l in locs if l]
    return [(u.findtext(f"{ns}loc") or "").strip() for u in root.findall(f"{ns}url")]


def previous_locs() -> tuple[list[str], str]:
    if os.path.exists(MANIFEST):
        try:
            data = json.load(open(MANIFEST, encoding="utf-8"))
            return list(data.get("locs", [])), f"manifest ({data.get('generated', '?')})"
        except Exception:
            pass
    return read_existing_locs(), "published sitemaps on disk"


# --------------------------------------------------------------------------- verify


def verify(strict: bool = True) -> list[str]:
    """Every loc in every sitemap resolves on disk, parses, and is robots-allowed."""
    rules = load_disallows()
    problems, seen_files, total = [], set(), 0
    ns = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
    top = os.path.join(PUB, "sitemap.xml")
    if not os.path.exists(top):
        return ["public/sitemap.xml missing"]
    try:
        root = ET.parse(top).getroot()
    except ET.ParseError as e:
        return [f"sitemap.xml does not parse: {e}"]

    children = []
    if root.tag.endswith("sitemapindex"):
        for sm in root.findall(f"{ns}sitemap"):
            loc = (sm.findtext(f"{ns}loc") or "").strip()
            p = os.path.join(PUB, loc[len(BASE) :].lstrip("/"))
            if not os.path.exists(p):
                problems.append(f"sitemap index references missing file: {loc}")
            else:
                children.append(p)
    else:
        children = [top]

    for child in children:
        try:
            croot = ET.parse(child).getroot()
        except ET.ParseError as e:
            problems.append(f"{os.path.relpath(child, ROOT)} does not parse: {e}")
            continue
        for u in croot.findall(f"{ns}url"):
            loc = (u.findtext(f"{ns}loc") or "").strip()
            total += 1
            if not loc.startswith(BASE):
                problems.append(f"loc outside site host: {loc}")
                continue
            if loc in seen_files:
                problems.append(f"duplicate loc across sitemaps: {loc}")
            seen_files.add(loc)
            fp = path_for(loc)
            if not os.path.exists(fp):
                problems.append(f"loc has no file on disk: {loc} -> {os.path.relpath(fp, ROOT)}")
            hit = robots_blocks(loc[len(BASE) :], rules)
            if hit:
                problems.append(f"loc is robots-disallowed ({hit}): {loc}")
            if not (u.findtext(f"{ns}lastmod") or "").strip():
                problems.append(f"loc missing lastmod: {loc}")
            for img in u.findall("{http://www.google.com/schemas/sitemap-image/1.1}image"):
                iloc = (img.findtext("{http://www.google.com/schemas/sitemap-image/1.1}loc") or "").strip()
                ip = os.path.join(PUB, iloc[len(BASE) :].lstrip("/").replace("/", os.sep))
                if not iloc.startswith(BASE) or not os.path.exists(ip):
                    problems.append(f"image loc has no file on disk: {iloc}")
    print(f"verify: {total} locs across {len(children)} sitemap(s), {len(problems)} problem(s)")
    return problems


# --------------------------------------------------------------------------- main


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--check", action="store_true", help="verify what is on disk, write nothing")
    ap.add_argument("--allow-removals", action="store_true",
                    help="accept URLs disappearing because their file was genuinely deleted")
    ap.add_argument("--quiet", action="store_true")
    args = ap.parse_args()

    if args.check:
        problems = verify()
        for p in problems:
            print("  -", p)
        return 1 if problems else 0

    rules = load_disallows()
    gitdates, dirty = git_lastmod_map(), dirty_paths()
    entries, dropped = [], []

    for rel in walk_html():
        abs_path = os.path.join(PUB, rel)
        try:
            text = open(abs_path, encoding="utf-8", errors="replace").read()
        except OSError as e:
            dropped.append((rel, f"unreadable: {e}"))
            continue
        keep, why = indexable(rel, text, rules)
        if not keep:
            dropped.append((rel, why))
            continue
        posix_rel = rel.replace(os.sep, "/")
        lastmod = (mtime_iso(abs_path) if posix_rel in dirty or posix_rel not in gitdates
                   else gitdates[posix_rel])
        loc = url_for(rel)
        entries.append({"loc": loc, "lastmod": lastmod, "rel": rel,
                        "images": page_images(rel, text, loc)})

    # Every discovered URL lands in exactly one section; "pages" is the catch-all so a
    # new content directory can never fall through the cracks the way /writing/ once did.
    buckets: dict[str, list[dict]] = {name: [] for name, _ in SECTIONS}
    buckets[DEFAULT_SECTION] = []
    for e in entries:
        path = e["loc"][len(BASE) :]
        for name, prefix in SECTIONS:
            if path.startswith(prefix):
                buckets[name].append(e)
                break
        else:
            buckets[DEFAULT_SECTION].append(e)
    assert sum(len(v) for v in buckets.values()) == len(entries), "section split lost URLs"

    new_locs = sorted(e["loc"] for e in entries)
    prev, prev_src = previous_locs()
    prev_set, new_set = set(prev), set(new_locs)
    added, removed = sorted(new_set - prev_set), sorted(prev_set - new_set)

    # ---- the regression guard -------------------------------------------------
    fatal, benign = [], []
    for url in removed:
        fp = path_for(url)
        if not os.path.exists(fp):
            benign.append((url, "file deleted from disk"))
            continue
        try:
            text = open(fp, encoding="utf-8", errors="replace").read()
        except OSError:
            benign.append((url, "file unreadable"))
            continue
        keep, why = indexable(os.path.relpath(fp, PUB), text, rules)
        if keep:
            fatal.append((url, "file is still on disk and still indexable"))
        else:
            benign.append((url, f"de-indexed on purpose: {why}"))

    print(f"loc diff vs {prev_src}: {len(prev)} -> {len(new_locs)} "
          f"(+{len(added)} / -{len(removed)})")
    for url in added:
        print(f"  + {url}")
    for url, why in benign:
        print(f"  - {url}   [{why}]")
    for url, why in fatal:
        print(f"  ! {url}   [{why}]")

    if fatal:
        print(f"\nFATAL: {len(fatal)} URL(s) vanished from the sitemap while their pages are "
              f"still live and indexable. This is the /writing/ /aurum/ /codeswitch/ regression "
              f"repeating. Nothing was written.", file=sys.stderr)
        return 1
    if benign and not args.allow_removals:
        deleted = [u for u, w in benign if w == "file deleted from disk"]
        if deleted:
            print(f"\nSTOP: {len(deleted)} URL(s) dropped because their file is gone from disk. "
                  f"If that was intentional, re-run with --allow-removals. Nothing was written.",
                  file=sys.stderr)
            return 1

    # ---- write ----------------------------------------------------------------
    order = [DEFAULT_SECTION] + [n for n, _ in SECTIONS]
    index_rows = []
    for name in order:
        rows = sorted(buckets[name], key=lambda e: e["loc"])
        path = os.path.join(PUB, f"sitemap-{name}.xml")
        if not rows:
            if os.path.exists(path):
                os.remove(path)
            continue
        write_urlset(path, rows)
        index_rows.append((f"{BASE}/sitemap-{name}.xml", max(r["lastmod"] for r in rows)))
        imgs = sum(len(r["images"]) for r in rows)
        print(f"  sitemap-{name}.xml   {len(rows):>3} urls, {imgs:>3} images")
    write_index(os.path.join(PUB, "sitemap.xml"), index_rows)

    json.dump({"generated": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
               "count": len(new_locs), "locs": new_locs},
              open(MANIFEST, "w", encoding="utf-8"), indent=1)

    if not args.quiet and dropped:
        print(f"\nexcluded {len(dropped)} html file(s):")
        for rel, why in sorted(dropped):
            print(f"  x {rel}  [{why}]")

    print(f"\nsitemap.xml is a sitemap index over {len(index_rows)} section sitemap(s), "
          f"{len(new_locs)} urls total")
    problems = verify()
    for p in problems:
        print("  -", p)
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
