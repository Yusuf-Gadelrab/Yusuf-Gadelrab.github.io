"""Internal link-graph audit for public/.

Builds the site's internal link graph starting from public/index.html and reports:
  - broken internal links (href points at a file that does not exist)
  - orphan pages (indexable page with zero inbound internal links)
  - crawl depth (pages more than MAX_DEPTH clicks from home)
  - inbound-link counts per page

Usage:
  python3 tools/link_audit.py            # human-readable report
  python3 tools/link_audit.py --json     # machine-readable
  python3 tools/link_audit.py --quiet    # summary + exit code only

Exit code is 1 when there are broken links or orphans, so it can gate a deploy.
"""
import argparse
import collections
import glob
import json
import os
import posixpath
import re
import sys

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
PUB = os.path.join(ROOT, "public")
HOME = "index.html"
MAX_DEPTH = 3

# Pages that are intentionally not part of the crawl surface.
SKIP_FILES = {
    "404.html",
    "offline.html",
    "googlebb78e2fba04aed48.html",
}
# Whole subtrees that are product artifacts / previews, not site pages.
# public/templates/ is the noindex document vault shipped with the templates
# product and public/downloads/ holds sample deliverables; their files are
# artifacts, not pages meant to rank or be crawled.
SKIP_PREFIXES = ("templates/", "downloads/")

# Only read hrefs that sit inside a real tag. An href written as escaped text —
# `&lt;link rel="canonical" href="..."&gt;` in a <code> sample — is documentation,
# not a link, and a bare attribute regex would flag it as broken.
TAG_RE = re.compile(r"<[a-zA-Z][^>]*>")
HREF_RE = re.compile(r'(?:href|src)\s*=\s*"([^"]+)"', re.I)
# hrefs built inside <script>/<style> are runtime template strings, not crawlable links
INLINE_RE = re.compile(r"<(script|style)\b[^>]*>.*?</\1>", re.S | re.I)
ROBOTS_RE = re.compile(r'<meta\s+name="robots"\s+content="([^"]*)"', re.I)
TITLE_RE = re.compile(r"<title>(.*?)</title>", re.S | re.I)
BASE_HOST = "yusuf-gadelrab.github.io"


def rel(path):
    return os.path.relpath(path, PUB).replace(os.sep, "/")


def is_skipped(r):
    return os.path.basename(r) in SKIP_FILES or r.startswith(SKIP_PREFIXES)


def all_pages():
    return sorted(rel(p) for p in glob.glob(os.path.join(PUB, "**", "*.html"), recursive=True))


def normalize(href, from_rel):
    """Map an href to a repo-relative path under public/, or None if external/non-page."""
    href = href.strip()
    if not href or href.startswith(("#", "mailto:", "tel:", "javascript:", "data:")):
        return None
    # Absolute URLs to our own host count as internal.
    m = re.match(r"^https?://([^/]+)(/.*)?$", href, re.I)
    if m:
        if m.group(1).lower() != BASE_HOST:
            return None
        href = m.group(2) or "/"
    elif "://" in href:
        return None
    href = href.split("#", 1)[0].split("?", 1)[0]
    if not href:
        return None
    if href.startswith("/"):
        target = href.lstrip("/")
    else:
        target = posixpath.normpath(posixpath.join(posixpath.dirname(from_rel), href))
        if target == ".":
            target = ""
    if target.endswith("/") or target == "":
        target = posixpath.join(target, "index.html")
    return target


def load(pages):
    """Return {page: {"links": [(target, raw)], "robots": str, "title": str}}."""
    info = {}
    for r in pages:
        src = open(os.path.join(PUB, r), encoding="utf-8", errors="replace").read()
        robots = ROBOTS_RE.search(src)
        title = TITLE_RE.search(src)
        markup = INLINE_RE.sub(" ", src)
        links = []
        for raw in (h for tag in TAG_RE.findall(markup) for h in HREF_RE.findall(tag)):
            t = normalize(raw, r)
            if t is not None:
                links.append((t, raw))
        info[r] = {
            "links": links,
            "robots": (robots.group(1) if robots else ""),
            "title": (title.group(1).strip() if title else ""),
        }
    return info


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--quiet", action="store_true")
    ap.add_argument("--max-depth", type=int, default=MAX_DEPTH)
    args = ap.parse_args()

    pages = all_pages()
    pageset = set(pages)
    info = load(pages)

    # --- broken internal links -------------------------------------------------
    broken = []
    for r in pages:
        if is_skipped(r):
            continue
        for target, raw in sorted(set(info[r]["links"])):
            if not os.path.exists(os.path.join(PUB, target)):
                broken.append({"page": r, "href": raw, "resolved": target})

    # --- graph over crawlable HTML pages ---------------------------------------
    graph = collections.defaultdict(set)
    inbound = collections.Counter()
    for r in pages:
        if is_skipped(r):
            continue
        for target, _ in info[r]["links"]:
            if target in pageset and target != r and not is_skipped(target):
                graph[r].add(target)
                inbound[target] += 1

    crawlable = [r for r in pages if not is_skipped(r)]
    for r in crawlable:
        inbound.setdefault(r, 0)

    # --- BFS depth from home ---------------------------------------------------
    depth = {HOME: 0}
    queue = collections.deque([HOME])
    while queue:
        cur = queue.popleft()
        for nxt in sorted(graph[cur]):
            if nxt not in depth:
                depth[nxt] = depth[cur] + 1
                queue.append(nxt)

    noindex = {r for r in crawlable if "noindex" in info[r]["robots"].lower()}
    orphans = sorted(r for r in crawlable if inbound[r] == 0 and r != HOME and r not in noindex)
    unreachable = sorted(r for r in crawlable if r not in depth and r not in noindex)
    too_deep = sorted(
        ((r, depth[r]) for r in crawlable if depth.get(r, 0) > args.max_depth and r not in noindex),
        key=lambda x: (-x[1], x[0]))

    counts = [inbound[r] for r in crawlable]
    avg_in = sum(counts) / len(counts) if counts else 0
    reached = [depth[r] for r in crawlable if r in depth]
    maxd = max(reached) if reached else 0
    hist = collections.Counter(reached)

    result = {
        "pages": len(crawlable),
        "total_html": len(pages),
        "broken": broken,
        "orphans": orphans,
        "unreachable": unreachable,
        "too_deep": [{"page": p, "depth": d} for p, d in too_deep],
        "max_depth": maxd,
        "avg_inbound": round(avg_in, 2),
        "depth_histogram": dict(sorted(hist.items())),
        "inbound": {r: inbound[r] for r in sorted(crawlable, key=lambda x: (inbound[x], x))},
    }

    if args.json:
        print(json.dumps(result, indent=2))
    elif args.quiet:
        print(f"pages={len(crawlable)} broken={len(broken)} orphans={len(orphans)} "
              f"deep={len(too_deep)} max_depth={maxd} avg_inbound={avg_in:.2f}")
    else:
        print(f"=== LINK AUDIT — {len(crawlable)} crawlable pages "
              f"({len(pages)} HTML files, {len(pages) - len(crawlable)} skipped) ===\n")
        print(f"BROKEN INTERNAL LINKS: {len(broken)}")
        for b in broken:
            print(f'  {b["page"]}  ->  {b["href"]}')
        print(f"\nORPHANS (0 inbound links): {len(orphans)}")
        for o in orphans:
            print(f"  {o}")
        if unreachable:
            print(f"\nUNREACHABLE FROM HOME: {len(unreachable)}")
            for u in unreachable:
                print(f"  {u}")
        print(f"\nDEEPER THAN {args.max_depth} CLICKS: {len(too_deep)}")
        for p, d in too_deep:
            print(f"  depth {d}  {p}")
        print(f"\nmax depth: {maxd}")
        print("depth histogram: " + ", ".join(f"{k}:{v}" for k, v in sorted(hist.items())))
        print(f"average inbound links per page: {avg_in:.2f}")
        low = [(r, inbound[r]) for r in sorted(crawlable, key=lambda x: (inbound[x], x))][:15]
        print("\nlowest inbound counts:")
        for r, c in low:
            print(f"  {c:>3}  {r}")

    return 1 if (broken or orphans or unreachable) else 0


if __name__ == "__main__":
    sys.exit(main())
