"""Backfill breadcrumbs on any page that is missing them.

Two things have to stay in lockstep for a breadcrumb rich result: the
BreadcrumbList JSON-LD and a visible trail on the page. Google treats the
visible element as the ground truth the markup must match, so this tool never
writes one without the other — the visible trail is *derived from the schema*,
which makes a mismatch structurally impossible.

Idempotent: a page that already has both is left untouched, so this is safe to
re-run after new pages land. Guides are skipped because tools/guides/engine.py
already emits both from the same spec.

Usage:
  python3 tools/breadcrumbs.py --dry    # report what would change
  python3 tools/breadcrumbs.py          # write
"""
import glob
import html as H
import json
import os
import re
import sys

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
PUB = os.path.join(ROOT, "public")
BASE = "https://yusuf-gadelrab.github.io"
LD = '<script type="application/ld+json">'

# Home needs no trail; the rest are not crawl surfaces.
SKIP_FILES = {"404.html", "offline.html", "googlebb78e2fba04aed48.html"}
# templates/ and downloads/ are product deliverables served for preview, not
# pages meant to rank; guides/ gets both halves from tools/guides/engine.py.
SKIP_PREFIX = ("templates/", "downloads/", "guides/")

# Trails that cannot be inferred from the page itself.
MANUAL = {
    "writing.html": [("Home", "/"), ("Writing", None)],
    "kxngsef-lookbook.html": [("Home", "/"), ("KXNG SEF", "/kxngsef.html"), ("Lookbook", None)],
    "kxngsef-shipping.html": [("Home", "/"), ("KXNG SEF", "/kxngsef.html"), ("Shipping & returns", None)],
    "accessibility.html": [("Home", "/"), ("Legal", "/legal.html"), ("Accessibility", None)],
    "refunds.html": [("Home", "/"), ("Legal", "/legal.html"), ("Refunds", None)],
    "dmca.html": [("Home", "/"), ("Legal", "/legal.html"), ("DMCA", None)],
}
# Section parents, keyed by directory.
PARENT = {
    "writing": ("Writing", "/writing.html"),
    "glossary": ("Glossary", "/glossary.html"),
    "apps": ("Apps", "/apps.html"),
    "codeswitch": ("CODESWITCH", "/codeswitch.html"),
}

# A breadcrumb label that ends on a conjunction reads like a truncation bug.
DANGLING = {"and", "then", "the", "a", "an", "on", "in", "of", "for", "to", "with",
            "instead", "into", "it", "its", "is", "was", "that", "but", "or", "by",
            "isn't", "isnt", "what", "how", "why", "when", "so", "at", "from", "as",
            "my", "his", "her", "their", "your", "our", "here's", "about"}


def rel(p):
    return os.path.relpath(p, PUB).replace(os.sep, "/")


def skipped(r):
    return (r == "index.html" or os.path.basename(r) in SKIP_FILES
            or r.startswith(SKIP_PREFIX))


def label(raw, cap=58):
    t = re.sub(r"\s+", " ", H.unescape(re.sub("<[^>]+>", "", raw))).strip()
    for sep in (". ", "? ", " — ", ": ", ", and "):
        if sep in t and len(t) > cap:
            head = t.split(sep)[0]
            if 12 <= len(head) <= cap:
                t = head
                break
    if len(t) > cap:
        t = t[:cap].rsplit(" ", 1)[0]
    while True:
        t = t.rstrip(" ,;:.—-")
        parts = t.split(" ")
        if len(parts) > 3 and parts[-1].lower().strip(",.;:") in DANGLING:
            t = " ".join(parts[:-1])
            continue
        break
    return t.rstrip(" ,;:.?!—-")


def infer_trail(r, src):
    if r in MANUAL:
        return MANUAL[r]
    m = re.search(r"<h1[^>]*>(.*?)</h1>", src, re.S)
    if not m:
        return None
    leaf = label(m.group(1))
    head = r.split("/", 1)[0] if "/" in r else ""
    if head in PARENT:
        name, url = PARENT[head]
        return [("Home", "/"), (name, url), (leaf, None)]
    return [("Home", "/"), (leaf, None)]


def ld_block(trail):
    items = []
    for i, (name, url) in enumerate(trail):
        it = {"@type": "ListItem", "position": i + 1, "name": name}
        if url and i < len(trail) - 1:
            it["item"] = BASE + url
        items.append(it)
    return (LD + json.dumps({"@context": "https://schema.org", "@type": "BreadcrumbList",
                             "itemListElement": items}, ensure_ascii=False,
                            separators=(",", ":")) + "</script>")


def read_trail(src):
    """The trail the page already declares, so the visible markup can mirror it."""
    for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', src, re.S):
        try:
            d = json.loads(m.group(1))
        except Exception:
            continue
        for node in (d.get("@graph") or [d]) if isinstance(d, dict) else []:
            if isinstance(node, dict) and node.get("@type") == "BreadcrumbList":
                out = []
                for it in sorted(node["itemListElement"], key=lambda x: x.get("position", 0)):
                    u = it.get("item")
                    if isinstance(u, dict):
                        u = u.get("@id") or u.get("url")
                    if isinstance(u, str) and u.startswith(BASE):
                        u = u[len(BASE):] or "/"
                    out.append((it.get("name", ""), u))
                return out
    return None


def visible(trail, indent=""):
    lis = []
    for i, (name, url) in enumerate(trail):
        n = H.escape(H.unescape(name))
        lis.append(f'{indent}    <li><span aria-current="page">{n}</span></li>'
                   if i == len(trail) - 1 else
                   f'{indent}    <li><a href="{url}">{n}</a></li>')
    return (f'{indent}<nav class="crumbs" aria-label="Breadcrumb">\n{indent}  <ol>\n'
            + "\n".join(lis) + f"\n{indent}  </ol>\n{indent}</nav>")


def insert_ld(src, block):
    head_end = src.find("</head>")
    ends = [m.end() for m in re.finditer(r"</script>", src[:head_end])] if head_end > 0 else []
    if ends:
        return src[:ends[-1]] + "\n" + block + src[ends[-1]:]
    return src.replace("</head>", block + "\n</head>", 1)


def main():
    dry = "--dry" in sys.argv
    schema, vis, problems = [], [], []
    for p in sorted(glob.glob(os.path.join(PUB, "**", "*.html"), recursive=True)):
        r = rel(p)
        if skipped(r):
            continue
        src = open(p, encoding="utf-8").read()
        changed = False

        # Parse rather than substring-match: a post *about* structured data
        # mentions "BreadcrumbList" in its prose without carrying the schema.
        if read_trail(src) is None:
            trail = infer_trail(r, src)
            if not trail:
                problems.append(f"{r}: no <h1> and no manual trail")
                continue
            src = insert_ld(src, ld_block(trail))
            changed = True
            schema.append((r, " > ".join(n for n, _ in trail)))

        if 'class="crumbs"' not in src:
            trail = read_trail(src)
            if not trail or len(trail) < 2:
                problems.append(f"{r}: no usable BreadcrumbList to mirror")
            elif any(u is None for _, u in trail[:-1]):
                problems.append(f"{r}: a non-final crumb has no url")
            else:
                anchor = None
                if r.startswith("apps/") and r.endswith("/index.html"):
                    anchor = re.search(r"</header>\s*\n", src)
                    if anchor:
                        src = (src[:anchor.end()] + "\n" + visible(trail, "  ") + "\n"
                               + src[anchor.end():])
                if anchor is None:
                    m = (re.search(r"\n\s*<main\b", src)
                         or re.search(r'\n\s*<article class="art"', src))
                    if not m:
                        problems.append(f"{r}: no <main> or <article> to anchor to")
                        m = None
                    else:
                        src = src[:m.start()] + "\n\n" + visible(trail) + src[m.start():]
                if anchor is not None or m:
                    changed = True
                    vis.append((r, " > ".join(n for n, _ in trail)))

        if changed and not dry:
            open(p, "w", encoding="utf-8").write(src)

    print(f"schema added: {len(schema)}")
    for r, t in schema:
        print(f"  {r:64} {t}")
    print(f"visible trails added: {len(vis)}")
    for r, t in vis:
        print(f"  {r:64} {t}")
    if problems:
        print(f"\nneeds a human ({len(problems)}):")
        for x in problems:
            print("  -", x)
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
