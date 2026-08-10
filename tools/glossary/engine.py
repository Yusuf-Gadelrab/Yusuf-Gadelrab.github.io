"""Glossary generator.

One cluster spec in -> one fully-schema'd cluster page out, plus the A-Z hub.
Granularity is deliberate: terms are grouped into topic clusters rather than
exploded into one page per term, because a 120-word page per term is thin
content by any modern quality signal. Each term still gets its own stable deep
anchor and its own DefinedTerm node, so an answer engine can cite
/glossary/trading-risk.html#r-multiple directly and a link to it lands on the
definition. Cluster pages carry DefinedTermSet + CollectionPage +
BreadcrumbList; the hub carries CollectionPage + ItemList over every term.

Every page references the one canonical Person entity by @id and never
redefines it.

Usage: python3 tools/glossary/engine.py    (writes public/glossary/*.html
                                            + public/glossary.html)
"""
import glob as _glob
import html
import importlib
import json
import os
import re
import sys

BASE = "https://yusuf-gadelrab.github.io"
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", ".."))
OUT = os.path.join(ROOT, "public", "glossary")
HUB = os.path.join(ROOT, "public", "glossary.html")
DATE = "2026-08-01"

NAV = [("/", "Work"), ("/guides.html", "Guides"), ("/glossary.html", "Glossary"),
       ("/apps.html", "Apps"), ("/store.html", "Store")]

STYLES = """  .prose{max-width:var(--maxw-prose)}
  .prose h2{margin:var(--s7) 0 var(--s4);font-size:var(--t-h2)}
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
  .jump{display:flex;flex-wrap:wrap;gap:var(--s2) var(--s4);margin:var(--s5) 0 0;padding:0;list-style:none}
  .jump li{margin:0}
  .jump a{font-size:var(--t-small);color:var(--muted)}
  .jump a:hover{color:var(--gold-2)}
  .term{max-width:var(--maxw-prose);padding:var(--s6) 0;border-top:1px solid var(--line-soft);
    scroll-margin-top:var(--s8)}
  .term__head{display:flex;align-items:baseline;gap:var(--s3);flex-wrap:wrap;margin:0 0 var(--s4)}
  .term__head h3{margin:0;font-size:var(--t-h3)}
  .term__hash{font-family:var(--display-pro);font-size:var(--t-small);color:var(--gold-dim);
    text-decoration:none;opacity:0;transition:opacity .2s var(--ease)}
  .term:hover .term__hash,.term__hash:focus-visible{opacity:1;color:var(--gold-2)}
  .term__aka{font-size:var(--t-small);color:var(--muted)}
  .term__def{color:var(--fg);font-size:17px;margin:0 0 var(--s4)}
  .term p{color:var(--muted);margin:0 0 var(--s4)}
  .term p:last-child{margin-bottom:0}
  .term ul,.term ol{color:var(--muted);padding-left:1.2em;margin:0 0 var(--s4)}
  .term li{margin-bottom:var(--s2)}
  .term a{color:var(--gold-2)}
  .term strong{color:var(--fg)}
  .note{font-size:var(--t-small);color:var(--muted);margin:0 0 var(--s3)}
  .tag{font-family:var(--display-pro);font-size:var(--t-micro);font-weight:600;letter-spacing:2px;
    text-transform:uppercase;color:var(--gold-2);margin-right:var(--s2)}
  .az{margin:0;padding:0;list-style:none}
  .az__group{margin:0 0 var(--s6)}
  .az__letter{font-family:var(--display-pro);font-weight:700;font-size:var(--t-h3);
    color:var(--gold-2);margin:0 0 var(--s3)}
  .az__list{display:grid;gap:var(--s2) var(--s5);margin:0;padding:0;list-style:none;
    grid-template-columns:repeat(auto-fill,minmax(min(230px,100%),1fr))}
  .az__list li{font-size:var(--t-small);color:var(--muted)}
  .az__list a{color:var(--muted)}
  .az__list a:hover{color:var(--gold-2)}
  .az__where{color:var(--gold-dim)}
  .rail{display:flex;flex-wrap:wrap;gap:var(--s2) var(--s3);margin:var(--s5) 0 0;padding:0;list-style:none}
  .rail a{font-family:var(--display-pro);font-weight:600;font-size:var(--t-small);
    color:var(--gold-2);border:1px solid var(--line-soft);border-radius:var(--radius);
    padding:6px 12px;display:inline-block}
  .rail a:hover{border-color:var(--gold-2)}
  .cl{display:flex;flex-direction:column;padding:var(--s5)}
  .cl h3{margin:0 0 var(--s3);font-size:var(--t-h3)}
  .cl p{color:var(--muted);font-size:var(--t-small);flex:1;margin:0}
  .cl .go{margin-top:var(--s4);font-family:var(--display-pro);font-weight:600;
    font-size:var(--t-small);color:var(--gold-2)}
  a.cl:hover .go{color:var(--gold)}
  .cl__n{color:var(--muted);font-size:var(--t-small);margin-top:var(--s3)}"""

DISCLAIMER = (
    '<section aria-labelledby="compliance-h" style="max-width:1080px;margin:0 auto;'
    'padding:28px 20px 8px;border-top:1px solid rgba(212,175,55,.18)">'
    '<h2 id="compliance-h" style="font-family:Georgia,\'Times New Roman\',serif;font-size:15px;'
    'letter-spacing:.06em;text-transform:uppercase;color:#d4af37;margin:0 0 10px">Disclaimer</h2>'
    '<p style="font-size:13.5px;line-height:1.65;color:#9a958c;margin:0 0 8px">This glossary is '
    'educational and informational only. Nothing here is financial, investment, tax, legal or '
    'immigration advice, or a recommendation to buy or sell any security. Trading carries '
    'substantial risk of loss. Any backtested or example figure is hypothetical, does not represent '
    'live trading, and past performance does not guarantee future results. Definitions of legal, '
    'regulatory and immigration terms change; verify anything time-sensitive against the primary '
    'source, your DSO, or a licensed professional before acting on it.</p>'
    '<p style="font-size:13.5px;line-height:1.65;color:#9a958c;margin:0">'
    '<a style="color:#d4af37" href="/terms.html">Terms of Use</a> · '
    '<a style="color:#d4af37" href="/privacy.html">Privacy Policy</a></p></section>'
)

FOOTER = """<footer class="site-footer">
  <div class="site-footer__links">
    <a href="/">Work</a>
    <a href="/about.html">About</a>
    <a href="/guides.html">Guides</a>
    <a href="/glossary.html">Glossary</a>
    <a href="/apps.html">Apps</a>
    <a href="/store.html">Store</a>
    <a href="/privacy.html">Privacy</a>
    <a href="/terms.html">Terms</a>
    <a href="mailto:yusuf.gadelrab06@gmail.com">yusuf.gadelrab06@gmail.com</a>
  </div>
</footer>"""


def _blocks(body, indent="      "):
    out = []
    for kind, val in body:
        if kind == "h2":
            out.append(f"{indent}<h2>{val}</h2>")
        elif kind == "p":
            out.append(f"{indent}<p>{val}</p>")
        elif kind == "formula":
            out.append(f'{indent}<span class="formula">{val}</span>')
        elif kind == "ul":
            li = "\n".join(f"{indent}  <li>{x}</li>" for x in val)
            out.append(f"{indent}<ul>\n{li}\n{indent}</ul>")
        elif kind == "ol":
            li = "\n".join(f"{indent}  <li>{x}</li>" for x in val)
            out.append(f"{indent}<ol>\n{li}\n{indent}</ol>")
        elif kind == "table":
            heads, rows = val
            th = "".join(f"<th>{h}</th>" for h in heads)
            tr = "\n".join(f"{indent}    <tr>" + "".join(f"<td>{c}</td>" for c in r) + "</tr>"
                           for r in rows)
            out.append(f'{indent}<div class="tblwrap"><table class="tbl">\n{indent}  <thead><tr>'
                       + th + f"</tr></thead>\n{indent}  <tbody>\n" + tr
                       + f"\n{indent}  </tbody>\n{indent}</table></div>")
        elif kind == "callout":
            out.append(f'{indent}<p class="callout">{val}</p>')
        elif kind == "warn":
            out.append(f'{indent}<p class="callout callout--warn">{val}</p>')
        else:
            raise ValueError(f"unknown block: {kind}")
    return "\n".join(out)


def _strip(s):
    return re.sub("<[^>]+>", "", html.unescape(s)).strip()


def _head(*, title, desc, url, og_title, og_desc, og_type, ld, extra_style=""):
    ld_tags = "\n".join(
        f'<script type="application/ld+json">'
        f"{json.dumps(g, ensure_ascii=False, separators=(',', ':'))}</script>" for g in ld)
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="preload" href="/css/site.css" as="style">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
<meta property="og:locale" content="en_US">
<title>{title}</title>
<meta name="description" content="{html.escape(desc, quote=True)}">
<link rel="canonical" href="{url}">
<link rel="icon" type="image/svg+xml" href="{BASE}/favicon.svg">
<link rel="apple-touch-icon" sizes="180x180" href="{BASE}/apple-touch-icon.png">
<meta name="theme-color" content="#0B0B0D">
<meta name="author" content="Yusuf Gadelrab">
<meta property="og:type" content="{og_type}">
<meta property="og:site_name" content="Yusuf Gadelrab">
<meta property="og:title" content="{html.escape(og_title, quote=True)}">
<meta property="og:description" content="{html.escape(og_desc, quote=True)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{BASE}/og-card.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{html.escape(og_title, quote=True)}">
<meta name="twitter:description" content="{html.escape(og_desc, quote=True)}">
<meta name="twitter:image" content="{BASE}/og-card.png">
<link rel="alternate" type="text/plain" href="{BASE}/llms-full.txt" title="Plain-text profile for language models">

{ld_tags}

<link rel="stylesheet" href="/css/site.css">
<style>
{STYLES}{extra_style}
</style>
</head>
<body class="pro">

<a class="skip-link" href="#main">Skip to content</a>

<nav class="site-nav">
  <a class="site-nav__brand" href="/"><img class="site-nav__lion" src="/img/brand/lion-mark.svg" alt="" width="34" height="34" decoding="async"><span>YUSUF GADELRAB</span></a>
  <div class="site-nav__links">
""" + "\n".join(
        f'    <a href="{h}"{" aria-current=\"page\"" if h == url.replace(BASE, "") or (h == "/glossary.html" and "/glossary" in url) else ""}>{t}</a>'
        for h, t in NAV) + """
  </div>
</nav>
"""


def _term_html(t, index, cluster_slug):
    """One term block. `index` maps global term slug -> (cluster_slug, display name)."""
    tid = t["slug"]
    parts = [f'    <article class="term" id="{tid}">',
             '      <div class="term__head">',
             f'        <h3>{t["term"]}</h3>',
             f'        <a class="term__hash" href="#{tid}" aria-label="Permalink to {_strip(t["term"])}">#</a>']
    if t.get("aka"):
        parts.append(f'        <span class="term__aka">also: {", ".join(t["aka"])}</span>')
    parts.append("      </div>")
    parts.append(f'      <p class="term__def">{t["short"]}</p>')
    parts.append(_blocks(t["body"], indent="      "))
    if t.get("example"):
        parts.append(f'      <p class="note"><span class="tag">Example</span>{t["example"]}</p>')
    if t.get("misconception"):
        parts.append(f'      <p class="note"><span class="tag">Common misconception</span>'
                     f'{t["misconception"]}</p>')
    if t.get("guide"):
        href, label = t["guide"]
        parts.append(f'      <p class="note"><span class="tag">Go deeper</span>'
                     f'<a href="{href}">{label}</a></p>')
    if t.get("see"):
        links = []
        for ref in t["see"]:
            if ref not in index:
                print(f"  ! unresolved cross-ref '{ref}' in {cluster_slug}#{tid}")
                continue
            cs, name = index[ref]
            href = f"#{ref}" if cs == cluster_slug else f"/glossary/{cs}.html#{ref}"
            links.append(f'<a href="{href}">{name}</a>')
        if links:
            parts.append(f'      <p class="note"><span class="tag">See also</span>'
                         f'{", ".join(links)}</p>')
    parts.append("    </article>")
    return "\n".join(parts)


def render_cluster(c, index):
    url = f"{BASE}/glossary/{c['slug']}.html"
    terms = c["terms"]

    defined = [{
        "@type": "DefinedTerm",
        "@id": f"{url}#{t['slug']}",
        "name": _strip(t["term"]),
        "description": _strip(t["short"]),
        "url": f"{url}#{t['slug']}",
        "inDefinedTermSet": {"@id": f"{url}#termset"},
        **({"alternateName": [_strip(a) for a in t["aka"]]} if t.get("aka") else {}),
    } for t in terms]

    graph = {"@context": "https://schema.org", "@graph": [
        {"@type": "DefinedTermSet",
         "@id": f"{url}#termset",
         "name": c["set_name"],
         "description": _strip(c["desc"]),
         "url": url,
         "inLanguage": "en",
         "author": {"@id": f"{BASE}/#person"},
         "publisher": {"@id": f"{BASE}/#person"},
         "hasDefinedTerm": defined},
        {"@type": "CollectionPage",
         "@id": f"{url}#page",
         "url": url,
         "name": c["set_name"],
         "description": _strip(c["desc"]),
         "datePublished": c.get("published", DATE),
         "dateModified": DATE,
         "inLanguage": "en",
         "isAccessibleForFree": True,
         "about": c["about"],
         "author": {"@id": f"{BASE}/#person"},
         "publisher": {"@id": f"{BASE}/#person"},
         "mainEntity": {"@id": f"{url}#termset"},
         "breadcrumb": {"@id": f"{url}#crumbs"},
         "isPartOf": {"@id": f"{BASE}/#website"}},
        {"@type": "BreadcrumbList",
         "@id": f"{url}#crumbs",
         "itemListElement": [
             {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{BASE}/"},
             {"@type": "ListItem", "position": 2, "name": "Glossary", "item": f"{BASE}/glossary.html"},
             {"@type": "ListItem", "position": 3, "name": c["crumb"]}]},
    ]}

    head = _head(title=c["title"], desc=c["desc"], url=url, og_title=c["og_title"],
                 og_desc=c["og_desc"], og_type="website", ld=[graph])

    jump = "\n".join(f'      <li><a href="#{t["slug"]}">{t["term"]}</a></li>' for t in terms)
    intro = _blocks(c.get("intro", []), indent="      ")
    warn = (f'      <p class="callout callout--warn">{c["disclaimer"]}</p>\n'
            if c.get("disclaimer") else "")
    body = "\n\n".join(_term_html(t, index, c["slug"]) for t in terms)

    others = "\n".join(
        f'      <li><a href="/glossary/{s}.html">{n}</a></li>'
        for s, n in c["siblings"])

    return head + f"""
<main id="main">

  <header class="section">
    <img class="page-lion" src="/img/brand/lion-mark.svg" alt="" width="46" height="46">
    <p class="eyebrow">{c['eyebrow']}</p>
    <h1 style="margin:var(--s4) 0">{c['h1']}</h1>
    <p class="lead">{c['lead']}</p>
  </header>

  <hr class="divider">

  <section class="section section--tight">
    <div class="prose">
{warn}{intro}
      <h2>{len(terms)} terms on this page</h2>
    </div>
    <ul class="jump">
{jump}
    </ul>
  </section>

  <hr class="divider">

  <section class="section section--tight" aria-label="Definitions">

{body}

  </section>

  <hr class="divider">

  <section class="section section--tight">
    <div class="grp-head">
      <p class="eyebrow">Keep reading</p>
      <h2>Other glossary clusters</h2>
    </div>
    <ul class="rail">
{others}
    </ul>
    <p class="note" style="margin-top:var(--s5)"><a href="/glossary.html">Full A–Z index of every term</a> · <a href="/guides.html">Long-form guides</a></p>
  </section>

</main>

{DISCLAIMER}
{FOOTER}

<script src="/js/site.js" defer></script>
</body>
</html>
"""


def render_hub(clusters, index):
    url = f"{BASE}/glossary.html"
    all_terms = [(t, c) for c in clusters for t in c["terms"]]
    total = len(all_terms)

    items = [{"@type": "ListItem", "position": i + 1,
              "name": _strip(t["term"]),
              "url": f"{BASE}/glossary/{c['slug']}.html#{t['slug']}"}
             for i, (t, c) in enumerate(sorted(all_terms, key=lambda x: _strip(x[0]["term"]).lower()))]

    desc = ("Plain-English definitions for trading, options, AI, security, SEO, "
            "student visas, freight and careers — one sentence each, then the real explanation.")
    graph = {"@context": "https://schema.org", "@graph": [
        {"@type": "CollectionPage",
         "@id": f"{url}#page",
         "url": url,
         "name": "Glossary",
         "description": desc,
         "datePublished": DATE,
         "dateModified": DATE,
         "inLanguage": "en",
         "isAccessibleForFree": True,
         "author": {"@id": f"{BASE}/#person"},
         "publisher": {"@id": f"{BASE}/#person"},
         "mainEntity": {"@id": f"{url}#terms"},
         "breadcrumb": {"@id": f"{url}#crumbs"},
         "hasPart": [{"@type": "DefinedTermSet",
                      "@id": f"{BASE}/glossary/{c['slug']}.html#termset"}
                     for c in clusters],
         "isPartOf": {"@id": f"{BASE}/#website"}},
        {"@type": "ItemList", "@id": f"{url}#terms",
         "name": f"{total} defined terms", "numberOfItems": total,
         "itemListOrder": "https://schema.org/ItemListOrderAscending",
         "itemListElement": items},
        {"@type": "BreadcrumbList",
         "@id": f"{url}#crumbs",
         "itemListElement": [
             {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{BASE}/"},
             {"@type": "ListItem", "position": 2, "name": "Glossary"}]},
    ]}

    head = _head(title="Glossary — 120+ Terms, Defined in One Sentence Each",
                 desc=desc, url=url,
                 og_title="Glossary — Trading, AI, Security, Visas, Freight",
                 og_desc="Over 120 terms, each with a one-sentence definition, a real explanation, "
                         "a worked example, and the misconception that trips people up.",
                 og_type="website", ld=[graph])

    # Cluster cards.
    cards = "\n\n".join(
        f'      <a class="card cl" href="/glossary/{c["slug"]}.html">\n'
        f'        <h3>{c["card_title"]}</h3>\n'
        f'        <p>{c["card_desc"]}</p>\n'
        f'        <p class="cl__n">{len(c["terms"])} terms · '
        + ", ".join(_strip(t["term"]) for t in c["terms"][:4]) + " …</p>\n"
        f'        <span class="go">Open the cluster →</span>\n'
        f"      </a>" for c in clusters)

    # A-Z index.
    groups = {}
    for t, c in all_terms:
        name = _strip(t["term"])
        key = name[0].upper()
        if not key.isalpha():
            key = "#"
        groups.setdefault(key, []).append((name, c, t))
    az = []
    for letter in sorted(groups, key=lambda k: (k == "#", k)):
        lis = "\n".join(
            f'          <li><a href="/glossary/{c["slug"]}.html#{t["slug"]}">{t["term"]}</a> '
            f'<span class="az__where">{c["short_name"]}</span></li>'
            for name, c, t in sorted(groups[letter], key=lambda x: x[0].lower()))
        az.append(f'      <li class="az__group">\n'
                  f'        <h3 class="az__letter" id="az-{letter.lower() if letter.isalpha() else "sym"}">{letter}</h3>\n'
                  f'        <ul class="az__list">\n{lis}\n        </ul>\n      </li>')
    letters = " ".join(
        f'<a href="#az-{k.lower() if k.isalpha() else "sym"}">{k}</a>'
        for k in sorted(groups, key=lambda k: (k == "#", k)))

    return head + f"""
<main id="main">

  <header class="section">
    <img class="page-lion" src="/img/brand/lion-mark.svg" alt="" width="46" height="46">
    <p class="eyebrow">DHAHAB · ذهب</p>
    <h1 style="margin:var(--s4) 0">Glossary</h1>
    <p class="lead">{total} terms across {len(clusters)} fields I actually work in. Every entry opens with one sentence that stands on its own, then explains the thing properly, shows a worked example where the arithmetic matters, and names the misconception that trips most people up. Nothing here is a guess: a definition I could not state accurately would be dropped rather than hedged.</p>
  </header>

  <hr class="divider">

  <section class="section section--tight">
    <div class="grp-head">
      <p class="eyebrow">01 · By field</p>
      <h2>Clusters</h2>
      <p>Related terms live on one page, so you can read a whole vocabulary in one sitting instead of bouncing between {total} stubs. Every term still has its own permanent anchor.</p>
    </div>
    <div class="grid" style="margin-top:var(--s6)">

{cards}

    </div>
  </section>

  <hr class="divider">

  <section class="section section--tight">
    <div class="grp-head">
      <p class="eyebrow">02 · A–Z</p>
      <h2>Every term</h2>
      <p>Alphabetical across all clusters. Each link jumps straight to the definition.</p>
    </div>
    <p class="note" style="margin-top:var(--s5)">{letters}</p>
    <ul class="az" style="margin-top:var(--s6)">
{chr(10).join(az)}
    </ul>
  </section>

  <hr class="divider">

  <section class="section section--tight">
    <div class="grp-head">
      <p class="eyebrow">03 · Next</p>
      <h2>When a definition is not enough</h2>
      <p>The glossary answers "what is this." The guides answer "how do I do it," with every formula printed on the page and every example worked out.</p>
    </div>
    <ul class="rail">
      <li><a href="/guides.html">All guides</a></li>
      <li><a href="/risk-tools.html">Risk calculators</a></li>
      <li><a href="/freight-tools.html">Freight calculators</a></li>
      <li><a href="/apps.html">Free apps</a></li>
      <li><a href="/visa.html">Visa timeline tool</a></li>
    </ul>
  </section>

</main>

{DISCLAIMER}
{FOOTER}

<script src="/js/site.js" defer></script>
</body>
</html>
"""


def load():
    sys.path.insert(0, HERE)
    clusters = []
    for mod in sorted(os.path.basename(p)[:-3]
                      for p in _glob.glob(os.path.join(HERE, "terms_*.py"))):
        clusters.append(importlib.import_module(mod).CLUSTER)
    clusters.sort(key=lambda c: c["order"])
    return clusters


def main():
    clusters = load()
    if not clusters:
        raise SystemExit("no terms_*.py modules found")

    index, dupes = {}, []
    for c in clusters:
        for t in c["terms"]:
            if t["slug"] in index:
                dupes.append(t["slug"])
            index[t["slug"]] = (c["slug"], _strip(t["term"]))
    if dupes:
        raise SystemExit(f"duplicate term slugs: {sorted(set(dupes))}")

    names = [c["short_name"] for c in clusters]
    for c in clusters:
        c["siblings"] = [(o["slug"], o["short_name"]) for o in clusters if o["slug"] != c["slug"]]

    os.makedirs(OUT, exist_ok=True)
    for c in clusters:
        path = os.path.join(OUT, c["slug"] + ".html")
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(render_cluster(c, index))
        print("wrote", os.path.relpath(path, ROOT))
    with open(HUB, "w", encoding="utf-8") as fh:
        fh.write(render_hub(clusters, index))
    print("wrote", os.path.relpath(HUB, ROOT))
    print(f"{len(index)} terms across {len(clusters)} clusters: {', '.join(names)}")


if __name__ == "__main__":
    main()
