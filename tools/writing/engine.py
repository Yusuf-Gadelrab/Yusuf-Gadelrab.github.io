"""Blog post generator for public/writing/.

One content module in -> one fully-schema'd essay page out. The shell (meta, OG,
Twitter card, BlogPosting JSON-LD, the one Person @id node, nav, footer, CTA) is
identical across posts on purpose, and matches the hand-written posts already in
public/writing/ exactly.

Content modules are glob-discovered: drop a `content_*.py` next to this file that
exposes a top-level `POST` dict and it renders on the next run. That makes adding
a post conflict-free when several agents are working in the repo at once.

Usage: python3 tools/writing/engine.py    (writes public/writing/*.html)
"""
import glob
import html
import importlib.util
import json
import os
import re
import sys

BASE = "https://yusuf-gadelrab.github.io"
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, "..", "..", "public", "writing"))

STYLES = """  .art{max-width:44rem;margin:0 auto;padding:var(--s6) var(--s5)}
  .art h1{font-size:var(--t-h2);line-height:1.15;margin:0 0 var(--s3)}
  .art .meta{color:var(--muted);font-size:var(--t-small);margin:0 0 var(--s5);
    letter-spacing:.06em;text-transform:uppercase}
  .art p{color:var(--muted);font-size:1.02rem;line-height:1.75;margin:0 0 var(--s4)}
  .art .lede{color:#f5f3ee;font-size:1.14rem}
  .art a{color:var(--gold-2)}
  .art h2{font-family:var(--display-pro);font-weight:700;color:var(--gold-2);
    font-size:1.3rem;line-height:1.3;letter-spacing:-.01em;margin:var(--s6) 0 var(--s3)}
  .art h3{font-family:var(--display-pro);font-weight:600;color:#f5f3ee;
    font-size:1.06rem;margin:var(--s5) 0 var(--s3)}
  .art ul,.art ol{color:var(--muted);font-size:1.02rem;line-height:1.75;
    margin:0 0 var(--s4);padding-left:1.2rem}
  .art li{margin-bottom:.55rem}
  .art li strong{color:#f5f3ee;font-weight:600}
  .art hr{border:0;border-top:1px solid var(--line-soft);margin:var(--s6) 0}
  .art blockquote{margin:var(--s5) 0;padding:0 0 0 var(--s4);
    border-left:2px solid var(--gold-2);color:#f5f3ee;font-size:1.06rem;line-height:1.7}
  .note{border:1px solid var(--line-soft);border-left:3px solid var(--gold-2);
    border-radius:12px;padding:var(--s4) var(--s5);margin:0 0 var(--s6);
    color:var(--muted);font-size:.92rem;line-height:1.65}
  .note b{color:var(--gold-2);font-family:var(--display-pro);
    letter-spacing:.08em;text-transform:uppercase;font-size:.74rem;display:block;margin-bottom:.4rem}
  .note p:last-child{margin-bottom:0}
  .tw{overflow-x:auto;margin:0 0 var(--s5);border:1px solid var(--line-soft);border-radius:12px}
  .art table{border-collapse:collapse;width:100%;min-width:34rem;font-size:.94rem}
  .art th{font-family:var(--display-pro);font-weight:600;color:var(--gold-2);text-align:left;
    padding:.85rem var(--s4);border-bottom:1px solid var(--line-soft);white-space:nowrap;
    letter-spacing:.02em}
  .art td{padding:.8rem var(--s4);color:var(--muted);border-bottom:1px solid var(--line-soft);
    vertical-align:top;line-height:1.55}
  .art tr:last-child td{border-bottom:0}
  .verdict{border:1px solid var(--line-soft);border-radius:14px;padding:var(--s5);
    margin:var(--s6) 0;background:rgba(233,201,106,.035)}
  .verdict strong{font-family:var(--display-pro);color:var(--gold-2);display:block;
    margin-bottom:var(--s2);letter-spacing:.01em}
  .verdict p:last-child{margin-bottom:0}
  .cta{border:1px solid var(--line-soft);border-radius:14px;padding:var(--s5);margin-top:var(--s6)}
  .cta strong{font-family:var(--display-pro);color:var(--gold-2);display:block;margin-bottom:var(--s2)}
  .cta p:last-child{margin-bottom:0}
  .related{margin-top:var(--s6);border-top:1px solid var(--line-soft);padding-top:var(--s5)}
  .related strong{font-family:var(--display-pro);color:var(--gold-2);display:block;margin-bottom:var(--s3)}
  .related ul{list-style:none;padding:0;margin:0}"""

NAV = """<nav class="site-nav">
  <a class="site-nav__brand" href="/"><img class="site-nav__lion" src="/img/brand/lion-mark.svg" alt="" width="34" height="34"><span>YUSUF GADELRAB</span></a>
  <div class="site-nav__links">
    <a href="/">Work</a>
    <a href="/writing.html">Writing</a>
    <a href="/apps.html">Apps</a>
    <a href="/about.html">About</a>
  </div>
</nav>"""

FOOTER = """<footer class="site-footer">
  <div class="site-footer__links">
    <a href="/">Work</a>
    <a href="/about.html">About</a>
    <a href="/writing.html">Writing</a>
    <a href="/guides.html">Guides</a>
    <a href="/resume.html">Resume</a>
    <a href="/apps.html">Apps</a>
    <a href="/everything.html">Free Tools</a>
    <a href="/privacy.html">Privacy</a>
    <a href="/terms.html">Terms</a>
    <a href="mailto:yusuf.gadelrab06@gmail.com">yusuf.gadelrab06@gmail.com</a>
    <a href="https://github.com/Yusuf-Gadelrab" target="_blank" rel="noopener">GitHub</a>
  </div>
</footer>"""

CTA = """<div class="cta">
  <strong>Built by one CS student in San Jose.</strong>
  <p>Free tools, three installable offline apps, and two SIGCSE 2026 papers.
  <a href="/">See the work</a> or <a href="/about.html">read the facts</a>.
  Open to Summer 2027 software engineering, AI/ML, and quant internships.</p>
</div>"""


def _blocks(body):
    out = []
    for kind, val in body:
        if kind == "lede":
            out.append(f'  <p class="lede">{val}</p>')
        elif kind == "p":
            out.append(f"  <p>{val}</p>")
        elif kind == "h2":
            out.append(f"  <h2>{val}</h2>")
        elif kind == "h3":
            out.append(f"  <h3>{val}</h3>")
        elif kind == "quote":
            out.append(f"  <blockquote>{val}</blockquote>")
        elif kind == "hr":
            out.append("  <hr>")
        elif kind == "ul":
            li = "\n".join(f"    <li>{x}</li>" for x in val)
            out.append(f"  <ul>\n{li}\n  </ul>")
        elif kind == "ol":
            li = "\n".join(f"    <li>{x}</li>" for x in val)
            out.append(f"  <ol>\n{li}\n  </ol>")
        elif kind == "note":
            label, paras = val
            ps = "\n".join(f"  <p>{p}</p>" for p in paras)
            out.append(f'  <div class="note">\n  <b>{label}</b>\n{ps}\n  </div>')
        elif kind == "verdict":
            label, paras = val
            ps = "\n".join(f"    <p>{p}</p>" for p in paras)
            out.append(f'  <div class="verdict">\n    <strong>{label}</strong>\n{ps}\n  </div>')
        elif kind == "table":
            head, rows = val
            th = "".join(f"<th>{h}</th>" for h in head)
            trs = "\n".join("    <tr>" + "".join(f"<td>{c}</td>" for c in r) + "</tr>" for r in rows)
            out.append(f'  <div class="tw">\n  <table>\n    <tr>{th}</tr>\n{trs}\n  </table>\n  </div>')
        else:
            raise SystemExit(f"unknown block kind: {kind}")
    return "\n\n".join(out)


def render(post):
    url = f"{BASE}/writing/{post['slug']}"
    t = html.escape(post["title"], quote=True)
    d = html.escape(post["desc"], quote=True)
    ld = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post["headline"],
        "datePublished": post["date"],
        "dateModified": post.get("modified", post["date"]),
        "url": url,
        "mainEntityOfPage": url,
        "description": post["desc"],
        "image": f"{BASE}/og-card.png",
        "author": {"@id": f"{BASE}/#person"},
        "publisher": {"@id": f"{BASE}/#person"},
        "isPartOf": {
            "@type": "Blog",
            "@id": f"{BASE}/writing.html#blog",
            "name": "Yusuf Gadelrab — Writing",
        },
    }
    if post.get("keywords"):
        ld["keywords"] = ", ".join(post["keywords"])
    person = {
        "@context": "https://schema.org",
        "@type": "Person",
        "@id": f"{BASE}/#person",
        "name": "Yusuf Gadelrab",
        "url": f"{BASE}/",
    }
    related = ""
    if post.get("related"):
        items = "\n".join(f'    <li><a href="{h}">{lab}</a></li>' for h, lab in post["related"])
        related = f'<div class="related">\n  <strong>Related</strong>\n  <ul>\n{items}\n  </ul>\n</div>\n\n'
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
<title>{t}</title>
<meta name="description" content="{d}">
<link rel="canonical" href="{url}">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<meta name="theme-color" content="#0B0B0D">
<meta name="author" content="Yusuf Gadelrab">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Yusuf Gadelrab">
<meta property="og:title" content="{t}">
<meta property="og:description" content="{d}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{BASE}/og-card.png">
<meta property="article:published_time" content="{post['date']}">
<meta property="article:author" content="Yusuf Gadelrab">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{t}">
<meta name="twitter:description" content="{d}">
<meta name="twitter:image" content="{BASE}/og-card.png">
<link rel="alternate" type="application/rss+xml" title="Yusuf Gadelrab" href="/rss.xml">
<link rel="alternate" type="text/plain" href="{BASE}/llms-full.txt">
<script type="application/ld+json">{json.dumps(ld)}</script>
<script type="application/ld+json">{json.dumps(person)}</script>
<link rel="stylesheet" href="/css/site.css">
<style>
{STYLES}
</style>
</head>
<body>
{NAV}
<article class="art">
  <h1>{post['headline']}</h1>
  <p class="meta">{post['date']} &middot; Yusuf Gadelrab</p>

{_blocks(post['body'])}

{related}{CTA}
</article>
{FOOTER}
<script src="/js/site.js" defer></script>
</body>
</html>
"""


def load_posts():
    posts = []
    for path in sorted(glob.glob(os.path.join(HERE, "content_*.py"))):
        name = "writing_" + os.path.splitext(os.path.basename(path))[0]
        spec = importlib.util.spec_from_file_location(name, path)
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        got = getattr(mod, "POSTS", None) or [getattr(mod, "POST")]
        posts.extend(got)
    return posts


def words(post):
    txt = re.sub(r"<[^>]+>", " ", _blocks(post["body"]))
    return len(html.unescape(txt).split())


def main():
    os.makedirs(OUT, exist_ok=True)
    posts = load_posts()
    if not posts:
        print("no content_*.py modules found")
        return
    seen = set()
    for p in posts:
        for field in ("slug", "title", "headline", "desc", "date", "body"):
            if not p.get(field):
                raise SystemExit(f"{p.get('slug', '?')}: missing {field}")
        if len(p["title"]) > 60:
            raise SystemExit(f"{p['slug']}: title {len(p['title'])} chars (max 60)")
        if len(p["desc"]) > 160:
            raise SystemExit(f"{p['slug']}: description {len(p['desc'])} chars (max 160)")
        if p["slug"] in seen:
            raise SystemExit(f"duplicate slug: {p['slug']}")
        seen.add(p["slug"])
        open(os.path.join(OUT, p["slug"]), "w", encoding="utf-8").write(render(p))
        print(f"  {p['slug']}  {words(p)} words")
    print(f"{len(posts)} posts written to public/writing/")


if __name__ == "__main__":
    sys.exit(main())
