#!/usr/bin/env python3
"""Visibility audit — everything that decides whether a page can be found.

Runs against build/ (what actually ships), not public/, so it catches anything
the build drops or rewrites.

    npm run build && python3 tools/visibility_audit.py
    python3 tools/visibility_audit.py --json      # machine-readable, for cron

Checks, in the order they cost you traffic:
  1. indexability   robots/noindex/canonical — a page nobody can index earns nothing
  2. sitemap        in the sitemap, and the sitemap has no dead entries
  3. snippet        title and description length, so SERPs are not truncated
  4. social         og:image + twitter card, so shares are not a grey box
  5. structure      exactly one h1, JSON-LD present
  6. graph          inbound internal links — an orphan is crawled last or never
  7. assets         every local src/href resolves
  8. weight         page + its images, since LCP is a ranking input
  9. answer-engine  llms.txt covers every indexable page

Exit code is the number of ERROR findings, so it can gate a deploy.
"""
import argparse
import glob
import json
import os
import re
import sys
from collections import defaultdict

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BUILD = os.path.join(ROOT, "build")
HOST = "https://yusuf-gadelrab.github.io"

# noindex by design — they must not be flagged as missing from the sitemap
UTILITY = {"404.html", "offline.html", "googlebb78e2fba04aed48.html"}

TITLE_MAX, DESC_MAX, DESC_MIN = 62, 165, 70
PAGE_KB_WARN = 220          # HTML only
LCP_IMG_KB_WARN = 400       # any single image referenced above the fold-ish


def rx(pat, s, default=""):
    m = re.search(pat, s, re.S | re.I)
    return m.group(1).strip() if m else default


def audit():
    findings = []          # (level, page, code, detail)
    def err(p, c, d): findings.append(("ERROR", p, c, d))
    def warn(p, c, d): findings.append(("WARN", p, c, d))

    pages = sorted(os.path.basename(f) for f in glob.glob(os.path.join(BUILD, "*.html")))
    if not pages:
        sys.exit("no build/ — run `npm run build` first")

    sm_path = os.path.join(BUILD, "sitemap.xml")
    sm = open(sm_path).read() if os.path.exists(sm_path) else ""
    sm_urls = re.findall(r"<loc>([^<]+)</loc>", sm)
    if not sm:
        err("-", "no-sitemap", "build/sitemap.xml missing")

    llms = ""
    for n in ("llms.txt", "llms-full.txt"):
        p = os.path.join(BUILD, n)
        if os.path.exists(p):
            llms += open(p).read()

    inbound = defaultdict(int)
    src = {}
    for name in pages:
        src[name] = open(os.path.join(BUILD, name), errors="ignore").read()

    for name, s in src.items():
        for href in set(re.findall(r'href="/?([a-z0-9-]+\.html)"', s)):
            if href != name:
                inbound[href] += 1
        if re.search(r'href="/"', s):
            inbound["index.html"] += 1

    for name in pages:
        s = src[name]
        util = name in UTILITY
        noindex = "noindex" in s

        title = rx(r"<title>(.*?)</title>", s)
        desc = rx(r'<meta name="description" content="(.*?)"', s)
        canon = rx(r'<link rel="canonical" href="(.*?)"', s)
        ogimg = rx(r'<meta property="og:image" content="(.*?)"', s)
        h1 = len(re.findall(r"<h1[ >]", s))
        ld = len(re.findall(r"application/ld\+json", s))

        if util:
            continue

        # 1 indexability
        if noindex:
            warn(name, "noindex", "page is marked noindex")
        if not canon:
            err(name, "no-canonical", "no canonical URL")

        # 2 sitemap
        want = f"{HOST}/" if name == "index.html" else f"{HOST}/{name}"
        if not noindex and want not in sm_urls:
            err(name, "not-in-sitemap", want)

        # 3 snippet
        if not title:
            err(name, "no-title", "")
        elif len(title) > TITLE_MAX:
            warn(name, "title-long", f"{len(title)} chars (>{TITLE_MAX})")
        if not desc:
            err(name, "no-description", "")
        elif len(desc) > DESC_MAX:
            warn(name, "desc-long", f"{len(desc)} chars (>{DESC_MAX})")
        elif len(desc) < DESC_MIN:
            warn(name, "desc-short", f"{len(desc)} chars (<{DESC_MIN})")

        # 4 social
        if not ogimg:
            err(name, "no-og-image", "shares render as a grey box")
        elif ogimg.startswith("/"):
            warn(name, "og-image-relative", "og:image should be absolute")
        if "twitter:card" not in s:
            warn(name, "no-twitter-card", "")

        # 5 structure
        if h1 != 1:
            warn(name, "h1-count", f"{h1} h1 elements (want exactly 1)")
        if not ld:
            warn(name, "no-jsonld", "no structured data")

        # 6 graph
        if not noindex and inbound[name] == 0 and name != "index.html":
            err(name, "orphan", "no inbound internal links")
        elif not noindex and inbound[name] == 1:
            warn(name, "weak-links", "only 1 inbound internal link")

        # 8 weight
        kb = len(s.encode()) // 1024
        if kb > PAGE_KB_WARN:
            warn(name, "heavy-html", f"{kb} KB of HTML")

        # 9 answer engines
        if not noindex and llms and name not in llms and not (
                name == "index.html" and f"{HOST}/)" in llms):
            warn(name, "not-in-llms", "absent from llms.txt / llms-full.txt")

    # 2b dead sitemap entries
    have = {f"{HOST}/" if p == "index.html" else f"{HOST}/{p}" for p in pages}
    for u in sm_urls:
        if u in have:
            continue
        rel = u[len(HOST):].lstrip("/")
        if not rel or os.path.exists(os.path.join(BUILD, rel)) or \
           os.path.exists(os.path.join(BUILD, rel, "index.html")):
            continue
        err("sitemap.xml", "dead-sitemap-entry", u)

    # 7 assets
    refs = set()
    for name, s in src.items():
        for u in re.findall(r'(?:src|href)="(/[^"#?]*\.[a-z0-9]{2,5})"', s):
            refs.add(u)
    for man in glob.glob(os.path.join(BUILD, "**", "*.webmanifest"), recursive=True):
        for u in re.findall(r'"src"\s*:\s*"(/[^"]+)"', open(man).read()):
            refs.add(u)
    for u in sorted(refs):
        if not os.path.exists(os.path.join(BUILD, u.lstrip("/"))):
            err("assets", "missing-asset", u)

    # 8b heavy images
    for img in glob.glob(os.path.join(BUILD, "img", "**", "*"), recursive=True):
        if not os.path.isfile(img):
            continue
        kb = os.path.getsize(img) // 1024
        if kb > LCP_IMG_KB_WARN:
            warn("assets", "heavy-image", f"{os.path.relpath(img, BUILD)} — {kb} KB")

    return findings, len(pages)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()

    findings, n = audit()
    errors = [f for f in findings if f[0] == "ERROR"]
    warns = [f for f in findings if f[0] == "WARN"]

    if a.json:
        print(json.dumps({
            "pages": n, "errors": len(errors), "warnings": len(warns),
            "findings": [dict(level=l, page=p, code=c, detail=d) for l, p, c, d in findings],
        }, indent=2))
    else:
        print(f"visibility audit — {n} pages · {len(errors)} errors · {len(warns)} warnings\n")
        for level in ("ERROR", "WARN"):
            group = [f for f in findings if f[0] == level]
            if not group:
                continue
            print(f"{level}S")
            for _, p, c, d in group:
                print(f"  {p:30} {c:22} {d}")
            print()
        if not findings:
            print("clean.")
    return len(errors)


if __name__ == "__main__":
    sys.exit(main())
