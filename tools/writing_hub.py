"""Rebuild the post list inside public/writing.html from the posts on disk.

The guides hub has been derived from its registry for a while; the writing hub
was still hand-maintained, so every time a post was added by hand the index and
the directory drifted apart and posts silently became orphans. This closes that
loop: public/writing/*.html IS the registry.

Everything between the two markers is replaced, everything outside is left as
found. Newest first, by the date in each post's <p class="meta">, then by title
so the output is stable when several posts share a date.

Usage: python3 tools/writing_hub.py [--check]
  --check exits 1 if the hub is out of date instead of writing.
"""
import glob
import html as H
import os
import re
import sys

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
PUB = os.path.join(ROOT, "public")
HUB = os.path.join(PUB, "writing.html")
START = "<!-- posts:auto:start -->"
END = "<!-- posts:auto:end -->"
TITLE_CAP = 96


def posts():
    out = []
    for p in sorted(glob.glob(os.path.join(PUB, "writing", "*.html"))):
        src = open(p, encoding="utf-8").read()
        m = re.search(r"<h1[^>]*>(.*?)</h1>", src, re.S)
        if not m:
            print("!! no <h1>, skipped:", os.path.basename(p))
            continue
        title = re.sub(r"\s+", " ", re.sub("<[^>]+>", "", m.group(1))).strip()
        d = re.search(r'<p class="meta">\s*([0-9]{4}-[0-9]{2}-[0-9]{2})', src)
        out.append({"slug": os.path.basename(p),
                    "title": title,
                    "date": d.group(1) if d else "1970-01-01"})
    out.sort(key=lambda x: (x["date"], x["title"]), reverse=True)
    return out


def li(it):
    t = H.unescape(it["title"])
    if len(t) > TITLE_CAP:
        t = t[:TITLE_CAP].rsplit(" ", 1)[0].rstrip(" ,;:.—-") + "..."
    return (f'    <li><a href="/writing/{it["slug"]}">{H.escape(t)}</a>'
            f'<span>{it["date"]}</span></li>')


def main():
    items = posts()
    body = START + "\n" + "\n".join(li(i) for i in items) + "\n    " + END
    src = open(HUB, encoding="utf-8").read()

    if START in src and END in src:
        new = re.sub(re.escape(START) + r".*?" + re.escape(END), lambda _: body, src, flags=re.S)
    else:
        # First run: wrap whatever <ol> currently holds the post list.
        m = None
        for cand in re.finditer(r"<ol>\n(.*?)\n\s*</ol>", src, re.S):
            if "/writing/" in cand.group(1):
                m = cand
                break
        if not m:
            raise SystemExit("could not find the post <ol> in public/writing.html")
        new = src[:m.start()] + "<ol>\n" + body + "\n  </ol>" + src[m.end():]

    if "--check" in sys.argv:
        if new != src:
            missing = [i["slug"] for i in items if i["slug"] not in src]
            print(f"writing.html OUT OF DATE — {len(missing)} post(s) not listed")
            for s in missing:
                print("  -", s)
            return 1
        print(f"writing.html up to date ({len(items)} posts)")
        return 0

    open(HUB, "w", encoding="utf-8").write(new)
    print(f"writing hub rebuilt with {len(items)} posts")
    return 0


if __name__ == "__main__":
    sys.exit(main())
