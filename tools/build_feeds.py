"""Build the site's RSS 2.0 feeds from the rendered pages on disk.

One generator, two feeds — writing (public/rss.xml) and guides
(public/guides.xml) — because both sections are parsed exactly the same way and
duplicating that in two places is how the two feeds drift apart.

Source of truth is the filesystem, matching tools/writing/build_hub.py: a page
dropped into public/writing/ or public/guides/ is in the feed on the next build
with no registry to update. Fields are read from the page itself — <h1> for the
title, the JSON-LD datePublished/dateModified for the dates, and the meta
description for the item summary.

Deterministic on purpose: lastBuildDate is derived from the newest item rather
than the wall clock, so a rebuild with no content change produces a byte-
identical file and never shows up as deploy noise.

Both feeds are summary-only (<description>, no content:encoded). Mixing full
text into one feed and summaries into the other is what makes readers render
the two sections inconsistently.

Usage:  python3 tools/build_feeds.py [--check]
        --check verifies the files on disk are current without writing.
"""

from __future__ import annotations

import argparse
import glob
import html
import os
import re
import sys
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, ".."))
PUB = os.path.join(ROOT, "public")
BASE = "https://yusuf-gadelrab.github.io"

# RFC-822 needs C-locale day/month abbreviations. strftime honours LC_TIME, so
# the names are tabled instead of formatted — a non-English locale would
# otherwise emit a pubDate no reader can parse.
DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

FEEDS = [
    dict(
        key="writing",
        src="writing",
        out="rss.xml",
        hub="writing.html",
        title="Yusuf Gadelrab — Writing",
        description=(
            "Building in public: AI tooling, CS education research, trading "
            "systems, and free tools."
        ),
    ),
    dict(
        key="guides",
        src="guides",
        out="guides.xml",
        hub="guides.html",
        title="Yusuf Gadelrab — Guides",
        description=(
            "Long-form guides on trading risk, AI tooling, freight brokerage, "
            "security and the student career stack. Every formula shown."
        ),
    ),
]


def _tag(pattern: str, text: str, group: int = 1) -> str:
    m = re.search(pattern, text, re.S)
    return m.group(group).strip() if m else ""


def _strip(markup: str) -> str:
    return html.unescape(re.sub(r"<[^>]+>", "", markup)).strip()


def rfc822(value: str) -> str:
    """'2026-07-31' or an ISO timestamp -> 'Fri, 31 Jul 2026 00:00:00 +0000'."""
    v = value.strip()
    try:
        dt = datetime.fromisoformat(v.replace("Z", "+00:00"))
    except ValueError:
        dt = datetime.strptime(v[:10], "%Y-%m-%d")
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    dt = dt.astimezone(timezone.utc)
    return (f"{DAYS[dt.weekday()]}, {dt.day:02d} {MONTHS[dt.month - 1]} "
            f"{dt.year} {dt:%H:%M:%S} +0000")


def collect(src: str) -> list[dict]:
    """Every rendered page in public/<src>/, newest first."""
    items = []
    for path in sorted(glob.glob(os.path.join(PUB, src, "*.html"))):
        slug = os.path.basename(path)
        if slug in ("index.html", "404.html"):
            continue
        text = open(path, encoding="utf-8").read()
        # Redirect stubs are not feed items. When a post is renamed we leave a
        # noindexed meta-refresh stub at the old address so inbound links still
        # land somewhere, but it has no h1, date or description by design and is
        # not a thing anyone should receive in a feed. Require BOTH signals so a
        # real post can never be dropped by a stray meta refresh.
        if re.search(r'<meta[^>]+http-equiv=["\']refresh["\']', text, re.I) and \
           re.search(r'<meta[^>]+name=["\']robots["\'][^>]*noindex', text, re.I):
            continue
        title = _strip(_tag(r"<h1[^>]*>(.*?)</h1>", text)) or _strip(
            _tag(r"<title>(.*?)</title>", text))
        published = _tag(r'"datePublished":\s*"([^"]+)"', text)
        modified = _tag(r'"dateModified":\s*"([^"]+)"', text) or published
        summary = html.unescape(
            _tag(r'<meta name="description" content="(.*?)"', text))
        if not (title and published and summary):
            raise SystemExit(
                f"{src}/{slug}: missing h1, datePublished or meta description")
        items.append(dict(slug=slug, title=title, published=published,
                          modified=modified, summary=summary,
                          url=f"{BASE}/{src}/{slug}"))
    items.sort(key=lambda i: (i["published"], i["title"]), reverse=True)
    return items


def render(feed: dict, items: list[dict]) -> str:
    e = lambda s: html.escape(s, quote=True)
    self_url = f"{BASE}/{feed['out']}"
    # newest dateModified, not now() — keeps the build reproducible
    built = rfc822(max(i["modified"] for i in items)) if items else rfc822(
        "1970-01-01")

    out = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
        "<channel>",
        f"<title>{e(feed['title'])}</title>",
        f"<link>{BASE}/{feed['hub']}</link>",
        f"<description>{e(feed['description'])}</description>",
        f'<atom:link href="{self_url}" rel="self" type="application/rss+xml"/>',
        "<language>en-us</language>",
        f"<lastBuildDate>{built}</lastBuildDate>",
        "<generator>tools/build_feeds.py</generator>",
        "<docs>https://www.rssboard.org/rss-specification</docs>",
        "<ttl>1440</ttl>",
        f"<copyright>Copyright {datetime.now().year} Yusuf Gadelrab</copyright>",
    ]
    for i in items:
        out += [
            "<item>",
            f"<title>{e(i['title'])}</title>",
            f"<link>{i['url']}</link>",
            f'<guid isPermaLink="true">{i["url"]}</guid>',
            f"<pubDate>{rfc822(i['published'])}</pubDate>",
            f"<description>{e(i['summary'])}</description>",
            "</item>",
        ]
    out += ["</channel>", "</rss>", ""]
    return "\n".join(out)


def verify() -> int:
    """Parse the feeds as a reader would and prove every claim in them.

    Checks the things that silently break a feed: XML well-formedness, a
    self-referencing atom:link, RFC-822 dates a parser will accept, GUID
    uniqueness and stability, and — the one that actually costs traffic —
    every <link> resolving to a real file on disk.
    """
    import email.utils
    import xml.etree.ElementTree as ET

    ATOM = "{http://www.w3.org/2005/Atom}"
    bad = []
    for feed in FEEDS:
        path = os.path.join(PUB, feed["out"])
        if not os.path.exists(path):
            bad.append(f"{feed['out']}: missing")
            continue
        ch = ET.parse(path).getroot().find("channel")
        items = ch.findall("item")
        links = [l.get("href") for l in ch.findall(f"{ATOM}link")
                 if l.get("rel") == "self"]
        if links != [f"{BASE}/{feed['out']}"]:
            bad.append(f"{feed['out']}: self atom:link is {links}")
        if not ch.findtext("lastBuildDate") or email.utils.parsedate_tz(
                ch.findtext("lastBuildDate")) is None:
            bad.append(f"{feed['out']}: unparseable lastBuildDate")

        guids, resolved = [], 0
        for it in items:
            link = (it.findtext("link") or "").strip()
            guid = (it.findtext("guid") or "").strip()
            guids.append(guid)
            if guid != link:
                bad.append(f"{feed['out']}: guid != link for {link}")
            if email.utils.parsedate_tz(it.findtext("pubDate") or "") is None:
                bad.append(f"{feed['out']}: bad pubDate on {link}")
            if not (it.findtext("title") or "").strip():
                bad.append(f"{feed['out']}: empty title on {link}")
            if not (it.findtext("description") or "").strip():
                bad.append(f"{feed['out']}: empty description on {link}")
            rel = link.removeprefix(BASE + "/")
            target = os.path.join(PUB, rel)
            if rel.endswith("/"):
                target = os.path.join(target, "index.html")
            if os.path.isfile(target):
                resolved += 1
            else:
                bad.append(f"{feed['out']}: dead link {link}")
        if len(set(guids)) != len(guids):
            bad.append(f"{feed['out']}: duplicate GUIDs")

        on_disk = len([p for p in glob.glob(os.path.join(PUB, feed["src"], "*.html"))
                       if os.path.basename(p) not in ("index.html", "404.html")])
        if len(items) != on_disk:
            bad.append(f"{feed['out']}: {len(items)} items vs {on_disk} pages on disk")
        print(f"{feed['out']:12} {len(items):3} items · {resolved} links resolve "
              f"· {on_disk} pages on disk")

    if bad:
        print(f"\n{len(bad)} problems:")
        for b in bad[:40]:
            print(" -", b)
        return 1
    print("feeds valid")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true",
                    help="fail if the feeds on disk are stale; write nothing")
    ap.add_argument("--verify", action="store_true",
                    help="parse the feeds on disk and check every URL resolves")
    a = ap.parse_args()

    if a.verify:
        return verify()

    stale = []
    for feed in FEEDS:
        items = collect(feed["src"])
        body = render(feed, items)
        path = os.path.join(PUB, feed["out"])
        current = open(path, encoding="utf-8").read() if os.path.exists(path) else None
        if a.check:
            if current != body:
                stale.append(feed["out"])
            print(f"{feed['out']:12} {len(items):3} items  "
                  f"{'STALE' if current != body else 'current'}")
            continue
        open(path, "w", encoding="utf-8").write(body)
        print(f"{feed['out']:12} {len(items):3} items  {len(body):,} B")

    if stale:
        print("\nstale: " + ", ".join(stale) + "  → run: python3 tools/build_feeds.py")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
