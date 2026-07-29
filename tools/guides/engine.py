"""Guide page generator.

One content spec in -> one fully-schema'd guide page out. The shell (meta, JSON-LD,
nav, footer, prose styles) is identical across guides on purpose: every guide gets
TechArticle/Article + FAQPage + BreadcrumbList, a visible FAQ that mirrors the
FAQPage node exactly (schema-only FAQ markup violates Google's guidelines), and a
canonical reference back to the one Person entity.

Usage: python3 tools/guides/engine.py    (writes public/guides/*.html + the hub)
"""
import html
import json
import os
import sys

BASE = "https://yusuf-gadelrab.github.io"
OUT = os.path.join(os.path.dirname(__file__), "..", "..", "public", "guides")
DATE = "2026-07-29"

STYLES = """  .prose{max-width:68ch}
  .prose h2{margin:var(--s7) 0 var(--s4);font-size:var(--t-h2)}
  .prose h3{margin:var(--s6) 0 var(--s3);font-size:var(--t-h3)}
  .prose p{color:var(--muted);margin:0 0 var(--s4)}
  .prose ul,.prose ol{color:var(--muted);padding-left:1.2em;margin:0 0 var(--s4)}
  .prose li{margin-bottom:var(--s2)}
  .prose a{color:var(--gold-2)}
  .prose strong{color:var(--fg)}
  .formula{display:block;padding:var(--s4);margin:0 0 var(--s4);border:1px solid var(--line-soft);
    border-radius:var(--radius);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
    font-size:var(--t-small);color:var(--gold-2);overflow-x:auto;white-space:pre-wrap}
  .tblwrap{overflow-x:auto;margin:0 0 var(--s4)}
  .tbl{width:100%;border-collapse:collapse;font-size:var(--t-small)}
  .tbl th,.tbl td{text-align:left;padding:var(--s3);border-bottom:1px solid var(--line-soft);
    color:var(--muted);vertical-align:top}
  .tbl th{font-family:var(--display-pro);color:var(--gold-2);font-weight:600}
  .callout{padding:var(--s4);border:1px solid var(--line-soft);border-radius:var(--radius);
    color:var(--muted);font-size:var(--t-small);margin:0 0 var(--s5)}
  .callout--warn{border-color:var(--gold-2)}
  .faq-card{padding:var(--s5)}
  .faq-card h3{font-size:var(--t-h3);margin:0}
  .faq-card p{color:var(--muted);font-size:var(--t-small);margin:var(--s3) 0 0}"""


def _blocks(body):
    out = []
    for kind, val in body:
        if kind == "h2":
            out.append(f"      <h2>{val}</h2>")
        elif kind == "h3":
            out.append(f"      <h3>{val}</h3>")
        elif kind == "p":
            out.append(f"      <p>{val}</p>")
        elif kind == "formula":
            out.append(f'      <span class="formula">{val}</span>')
        elif kind == "ul":
            li = "\n".join(f"        <li>{x}</li>" for x in val)
            out.append(f"      <ul>\n{li}\n      </ul>")
        elif kind == "ol":
            li = "\n".join(f"        <li>{x}</li>" for x in val)
            out.append(f"      <ol>\n{li}\n      </ol>")
        elif kind == "table":
            heads, rows = val
            th = "".join(f"<th>{h}</th>" for h in heads)
            tr = "\n".join("          <tr>" + "".join(f"<td>{c}</td>" for c in r) + "</tr>" for r in rows)
            out.append('      <div class="tblwrap"><table class="tbl">\n        <thead><tr>'
                       + th + "</tr></thead>\n        <tbody>\n" + tr
                       + "\n        </tbody>\n      </table></div>")
        elif kind == "callout":
            out.append(f'      <p class="callout">{val}</p>')
        elif kind == "warn":
            out.append(f'      <p class="callout callout--warn">{val}</p>')
        else:
            raise ValueError(f"unknown block: {kind}")
    return "\n".join(out)


def render(g):
    url = f"{BASE}/guides/{g['slug']}.html"
    schema_type = g.get("type", "TechArticle")
    article = {
        "@type": schema_type,
        "@id": f"{url}#article",
        "headline": g["headline"],
        "name": g["headline"],
        "description": g["desc"],
        "datePublished": g.get("published", DATE),
        "dateModified": DATE,
        "inLanguage": "en",
        "author": {"@id": f"{BASE}/#person"},
        "publisher": {"@id": f"{BASE}/#person"},
        "about": g["about"],
        "mainEntityOfPage": url,
        "isAccessibleForFree": True,
    }
    if schema_type == "TechArticle":
        article["proficiencyLevel"] = g.get("level", "Beginner")
    if g.get("citation"):
        article["citation"] = g["citation"]
    graph = {"@context": "https://schema.org", "@graph": [article, {
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{BASE}/"},
            {"@type": "ListItem", "position": 2, "name": "Guides", "item": f"{BASE}/guides.html"},
            {"@type": "ListItem", "position": 3, "name": g["crumb"]},
        ]}]}
    faq = {"@context": "https://schema.org", "@type": "FAQPage", "@id": f"{url}#faq",
           "mainEntity": [{"@type": "Question", "name": q,
                           "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in g["faqs"]]}

    nav = "\n".join(f'    <a href="{h}">{t}</a>' for h, t in g["nav"])
    tools = "\n".join(
        f'        <li><a href="{h}">{t}</a> — {d}</li>' for h, t, d in g.get("tools", []))
    tools_block = (f"      <h2>Tools referenced in this guide</h2>\n      <ul>\n{tools}\n      </ul>\n"
                   if tools else "")
    cards = "\n".join(
        f'      <article class="card faq-card"><h3>{html.escape(short)}</h3>'
        f"<p>{html.escape(ans)}</p></article>"
        for short, ans in g["faq_cards"])

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="preload" href="/css/site.css" as="style">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
<meta property="og:locale" content="en_US">
<title>{g['title']}</title>
<meta name="description" content="{html.escape(g['desc'], quote=True)}">
<link rel="canonical" href="{url}">
<link rel="icon" type="image/svg+xml" href="{BASE}/favicon.svg">
<link rel="apple-touch-icon" sizes="180x180" href="{BASE}/apple-touch-icon.png">
<meta name="theme-color" content="#0B0B0D">
<meta name="author" content="Yusuf Gadelrab">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Yusuf Gadelrab">
<meta property="og:title" content="{html.escape(g['og_title'], quote=True)}">
<meta property="og:description" content="{html.escape(g['og_desc'], quote=True)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{BASE}/og-card.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{html.escape(g['og_title'], quote=True)}">
<meta name="twitter:description" content="{html.escape(g['og_desc'], quote=True)}">
<meta name="twitter:image" content="{BASE}/og-card.png">
<link rel="alternate" type="text/plain" href="{BASE}/llms-full.txt" title="Plain-text profile for language models">

<script type="application/ld+json">{json.dumps(graph, ensure_ascii=False, separators=(',', ':'))}</script>
<script type="application/ld+json">{json.dumps(faq, ensure_ascii=False, separators=(',', ':'))}</script>

<link rel="stylesheet" href="/css/site.css">
<style>
{STYLES}
</style>
</head>
<body class="pro">

<a class="skip-link" href="#main">Skip to content</a>

<nav class="site-nav">
  <a class="site-nav__brand" href="/"><img class="site-nav__lion" src="/img/brand/lion-mark.svg" alt="" width="34" height="34"><span>YUSUF GADELRAB</span></a>
  <div class="site-nav__links">
{nav}
  </div>
</nav>

<main id="main">

  <header class="section">
    <p class="eyebrow">{g['eyebrow']}</p>
    <h1 style="margin:var(--s4) 0">{g['h1']}</h1>
    <p class="lead">{g['lead']}</p>
  </header>

  <hr class="divider">

  <section class="section section--tight">
    <div class="prose">
{_blocks(g['body'])}

{tools_block}    </div>
  </section>

  <hr class="divider">

  <section class="section section--tight" id="faq">
    <div class="grp-head">
      <p class="eyebrow">FAQ</p>
      <h2>Quick answers</h2>
    </div>
    <div class="grid" style="margin-top:var(--s6)">
{cards}
    </div>
  </section>

</main>

<footer class="site-footer">
  <div class="site-footer__links">
    <a href="/">Work</a>
    <a href="/about.html">About</a>
    <a href="/guides.html">Guides</a>
    <a href="/apps.html">Apps</a>
    <a href="/store.html">Store</a>
    <a href="/privacy.html">Privacy</a>
    <a href="/terms.html">Terms</a>
    <a href="mailto:yusuf.gadelrab06@gmail.com">yusuf.gadelrab06@gmail.com</a>
  </div>
</footer>

<script src="/js/site.js" defer></script>
</body>
</html>
"""


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, here)
    import glob as _glob
    import importlib
    guides = []
    for mod in sorted(os.path.basename(p)[:-3] for p in _glob.glob(os.path.join(here, "content_*.py"))):
        guides.extend(importlib.import_module(mod).GUIDES)
    os.makedirs(OUT, exist_ok=True)
    for g in guides:
        path = os.path.join(OUT, g["slug"] + ".html")
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(render(g))
        print("wrote", os.path.relpath(path))
    print(len(guides), "guides generated")


if __name__ == "__main__":
    main()
