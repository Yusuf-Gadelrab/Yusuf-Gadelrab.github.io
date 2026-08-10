"""Rebuild the post list and Blog JSON-LD inside public/writing.html.

The hub is hand-maintained (nav, lead copy, footer) but the post list is derived
from the rendered pages in public/writing/, so a new post never has to be added
in two places. Posts written straight to disk by an older workflow are picked up
too, because the source of truth here is the filesystem rather than a registry.

Ordering: datePublished descending, then title, so the output is stable.

Usage: python3 tools/writing/build_hub.py
"""
import glob
import html
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", ".."))
HUB = os.path.join(ROOT, "public", "writing.html")
POSTS = os.path.join(ROOT, "public", "writing")
BASE = "https://yusuf-gadelrab.github.io"


def _tag(pattern, text, group=1):
    m = re.search(pattern, text, re.S)
    return m.group(group).strip() if m else ""


def _strip(markup):
    return html.unescape(re.sub(r"<[^>]+>", "", markup)).strip()


def collect():
    out = []
    for path in sorted(glob.glob(os.path.join(POSTS, "*.html"))):
        text = open(path, encoding="utf-8").read()
        slug = os.path.basename(path)
        title = _strip(_tag(r"<h1[^>]*>(.*?)</h1>", text)) or _strip(
            _tag(r"<title>(.*?)</title>", text)
        )
        date = _tag(r'"datePublished":\s*"([^"]+)"', text)
        if not title or not date:
            raise SystemExit(f"{slug}: missing h1 or datePublished")
        out.append({"slug": slug, "title": title, "date": date})
    out.sort(key=lambda p: (p["date"], p["title"]), reverse=True)
    return out


def render_list(posts):
    lines = []
    for p in posts:
        t = html.escape(p["title"], quote=True)
        lines.append(
            f'    <li><a href="/writing/{p["slug"]}">{t}</a>'
            f'<span>{p["date"]}</span></li>'
        )
    return "  <ol>\n" + "\n".join(lines) + "\n  </ol>"


def render_schema(posts):
    node = {
        "@context": "https://schema.org",
        "@type": "Blog",
        "@id": f"{BASE}/writing.html#blog",
        "name": "Yusuf Gadelrab — Writing",
        "url": f"{BASE}/writing.html",
        "author": {"@id": f"{BASE}/#person"},
        "blogPost": [
            {
                "@type": "BlogPosting",
                "headline": p["title"],
                "url": f"{BASE}/writing/{p['slug']}",
                "datePublished": p["date"],
            }
            for p in posts
        ],
    }
    body = json.dumps(node, ensure_ascii=True)
    return f'<script type="application/ld+json">{body}</script>'


def main():
    posts = collect()
    text = open(HUB, encoding="utf-8").read()

    new_list = render_list(posts)
    # Anchor to the <main> list. A bare "first <ol>" match silently ate the
    # breadcrumb nav's <ol>, which sits earlier in the document.
    text, n_list = re.subn(r"(<main\b[^>]*>.*?)  <ol>.*?  </ol>",
                           lambda m: m.group(1) + new_list, text, count=1, flags=re.S)
    if not n_list:
        raise SystemExit("could not find the <ol> post list inside <main> in writing.html")
    if "crumbs" not in text.split("<main", 1)[0]:
        raise SystemExit("breadcrumb nav went missing — refusing to write writing.html")

    new_schema = render_schema(posts)
    # Whitespace-tolerant: a later minify pass strips the spaces json.dumps emits,
    # and a strict pattern silently breaks every future hub rebuild.
    pattern = (r'<script type="application/ld\+json">\s*\{\s*"@context":\s*"https://schema\.org",'
               r'\s*"@type":\s*"Blog".*?</script>')
    text, n_schema = re.subn(pattern, lambda _: new_schema, text, count=1, flags=re.S)
    if not n_schema:
        raise SystemExit("could not find the Blog JSON-LD block in writing.html")

    open(HUB, "w", encoding="utf-8").write(text)
    print(f"writing.html rebuilt with {len(posts)} posts")


if __name__ == "__main__":
    sys.exit(main())
