"""Submit URLs to IndexNow (Bing, Copilot, DuckDuckGo, Yandex, Seznam).

Two modes:

  full      every canonical URL the sitemap index knows about, plus the
            machine-readable extras (llms.txt, ai.txt, the feeds).
  --changed derive the URL list from `git diff --name-only <ref>` so a deploy
            pings only what actually changed. IndexNow explicitly asks
            publishers not to resubmit unchanged URLs, and a smaller, honest
            payload is treated better than a full-site blast on every push.

The sitemap is a <sitemapindex>, so this walks the index into its child
sitemaps rather than reading <loc> off the top level — reading the index
directly would submit four sitemap files instead of every page.

Safety:
  * --dry-run (or INDEXNOW_DRY_RUN=1) prints the exact payload and exits
    without touching the network.
  * The key file on disk must contain the key being submitted, or the run
    aborts. A mismatch makes search engines reject the whole batch, silently —
    this turns that into a loud local failure instead.
  * An empty URL list is a no-op, never an empty POST.

Usage:
  python3 tools/indexnow.py                     # full submit (npm postdeploy)
  python3 tools/indexnow.py --dry-run           # print, submit nothing
  python3 tools/indexnow.py --changed HEAD~1    # only what that diff touched
  python3 tools/indexnow.py --changed --dry-run
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import urllib.request

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
PUB = os.path.join(ROOT, "public")
HOST = "yusuf-gadelrab.github.io"
BASE = f"https://{HOST}"
KEY = "4a2347c9e733088a05101b1e481fa1fe"
ENDPOINT = "https://api.indexnow.org/indexnow"
BATCH = 10000  # IndexNow caps a single request at 10,000 URLs

# Machine-readable surfaces that are deliberately not in the sitemap.
EXTRAS = ("llms.txt", "llms-full.txt", "ai.txt", "rss.xml", "guides.xml")


def _locs(path: str) -> list[str]:
    if not os.path.exists(path):
        return []
    return re.findall(r"<loc>\s*(.*?)\s*</loc>", open(path, encoding="utf-8").read())


def sitemap_urls() -> list[str]:
    """Every page URL, walking a <sitemapindex> down into its children."""
    root = os.path.join(PUB, "sitemap.xml")
    text = open(root, encoding="utf-8").read() if os.path.exists(root) else ""
    if "<sitemapindex" not in text:
        return _locs(root)
    out: list[str] = []
    for child in _locs(root):
        local = os.path.join(PUB, child.removeprefix(BASE + "/"))
        found = _locs(local)
        if not found:
            print(f"  ! child sitemap empty or missing: {child}", file=sys.stderr)
        out += found
    return out


def changed_urls(ref: str, known: set[str]) -> list[str]:
    """Map `git diff --name-only <ref>` onto canonical URLs.

    Candidates are intersected with the sitemap's own URL set, so a renamed or
    unpublished file can never produce a 404 submission — if the sitemap does
    not list it, it does not get pinged.
    """
    try:
        diff = subprocess.run(["git", "-C", ROOT, "diff", "--name-only", ref],
                              capture_output=True, text=True, check=True).stdout
    except (subprocess.CalledProcessError, FileNotFoundError) as exc:
        print(f"git diff failed ({exc}); nothing to submit", file=sys.stderr)
        return []

    urls: list[str] = []
    for rel in filter(None, (line.strip() for line in diff.splitlines())):
        if not rel.startswith("public/"):
            continue
        tail = rel[len("public/"):]
        cands = {f"{BASE}/{tail}"}
        if tail.endswith("index.html"):
            cands.add(f"{BASE}/{tail[:-len('index.html')]}")
        for c in sorted(cands):
            if c in known and c not in urls:
                urls.append(c)
    return urls


def submit(urls: list[str], dry: bool) -> int:
    if not urls:
        print("IndexNow: 0 URLs, nothing to submit")
        return 0

    keyfile = os.path.join(PUB, f"{KEY}.txt")
    on_disk = open(keyfile).read().strip() if os.path.exists(keyfile) else ""
    if on_disk != KEY:
        print(f"IndexNow ABORT: {os.path.basename(keyfile)} holds "
              f"{on_disk!r}, script submits {KEY!r}", file=sys.stderr)
        return 2

    for i in range(0, len(urls), BATCH):
        chunk = urls[i:i + BATCH]
        body = {"host": HOST, "key": KEY,
                "keyLocation": f"{BASE}/{KEY}.txt", "urlList": chunk}
        if dry:
            print(f"DRY RUN — would POST {ENDPOINT}")
            print(f"  host={HOST} key={KEY} keyLocation={body['keyLocation']}")
            print(f"  urlList: {len(chunk)} URLs")
            for u in chunk:
                print(f"    {u}")
            print(f"  payload {len(json.dumps(body).encode()):,} bytes")
            continue
        r = urllib.request.urlopen(urllib.request.Request(
            ENDPOINT, data=json.dumps(body).encode(),
            headers={"Content-Type": "application/json; charset=utf-8"}), timeout=30)
        print(f"IndexNow {r.status} · {len(chunk)} URLs")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--changed", nargs="?", const="HEAD~1", metavar="REF",
                    help="submit only URLs touched by `git diff <REF>` "
                         "(default REF: HEAD~1)")
    ap.add_argument("--dry-run", action="store_true",
                    help="print the payload, submit nothing")
    a = ap.parse_args()
    dry = a.dry_run or os.environ.get("INDEXNOW_DRY_RUN") == "1"

    known = sitemap_urls()
    urls = list(dict.fromkeys(known + [f"{BASE}/{p}" for p in EXTRAS
                                       if os.path.exists(os.path.join(PUB, p))]))
    if a.changed:
        urls = changed_urls(a.changed, set(urls))
        print(f"changed since {a.changed}: {len(urls)} URLs")
    else:
        print(f"full submit: {len(known)} sitemap URLs + extras = {len(urls)}")

    return submit(urls, dry)


if __name__ == "__main__":
    sys.exit(main())
