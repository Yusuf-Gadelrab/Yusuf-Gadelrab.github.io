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
import re
import sys

BASE = "https://yusuf-gadelrab.github.io"
OUT = os.path.join(os.path.dirname(__file__), "..", "..", "public", "guides")
DATE = "2026-07-29"

# --- related guides ---------------------------------------------------------
# Relatedness is DERIVED from each spec's `about` tags and its eyebrow topic, so
# a guide added to any content_*.py module joins the graph on the next build with
# no edit here. Nothing about which guide relates to which is written by hand.

RELATED_N = 4
RELATED_START = "<!-- related:auto:start -->"
RELATED_END = "<!-- related:auto:end -->"

# The three hand-written guides that predate the generator. They are not
# rendered by this engine, but they carry the same metadata so they can appear
# in — and receive — a related block. Mirrors build_hub.LEGACY.
LEGACY_META = [
    {"slug": "r-multiple-expectancy",
     "h1": "R-multiple &amp; expectancy, explained",
     "crumb": "R-Multiple &amp; Expectancy",
     "og_desc": "Size from the stop, score in R, and judge a setup on expectancy instead of win rate.",
     "desc": "Position sizing from the stop, results in R, expectancy per trade, and why a 70% win rate can still lose money.",
     "eyebrow": "Guide · Risk",
     "about": ["Risk management", "Position sizing", "Expectancy", "Trading systems"]},
    {"slug": "freight-broker-margin",
     "h1": "Freight broker margin &amp; rate per mile",
     "crumb": "Freight Broker Margin",
     "og_desc": "Margin versus markup, all-in rate per mile, deadhead, fuel surcharge, and the break-even on a load.",
     "desc": "Margin versus markup, all-in rate per mile, what deadhead really costs, and the break-even on a load.",
     "eyebrow": "Guide · Freight",
     "about": ["Freight brokerage", "Unit economics", "Operations", "Logistics"]},
    {"slug": "cpt-vs-opt",
     "h1": "CPT vs OPT for F-1 students",
     "crumb": "CPT vs OPT",
     "og_desc": "Who authorizes what, the one-academic-year rule, the 12-month limits, and the STEM extension.",
     "desc": "Who authorizes what, the one-academic-year rule, the 12-month limits, the STEM extension, and unemployment days.",
     "eyebrow": "Guide · Career",
     "about": ["International students", "Work authorization", "Job search", "CPT", "OPT"]},
]

# Commercial surfaces, matched by keyword against a guide's topic + about tags.
# Same principle: a new guide inherits the right money page from its own tags.
CROSS_SILO = [
    (("position sizing", "risk management", "stop loss", "expectancy", "kelly",
      "risk", "monte carlo", "sharpe", "drawdown"),
     "/risk-tools.html", "the free position-size and expectancy calculators"),
    (("swing trading", "technical analysis", "anchored vwap", "volume profile",
      "market profile", "walk-forward", "backtesting", "trading systems",
      "volatility contraction pattern", "base patterns"),
     "/swing-screener.html", "the screener and its no-lookahead backtest harness"),
    (("trading journal", "trade review", "paper trading", "execution"),
     "/apps/tradelog/", "TradeLog, the offline R-multiple journal"),
    (("leveraged etfs", "options", "volatility drag", "instruments", "derivatives"),
     "/store.html", "the Swing Trading Operating System course"),
    (("progressive web apps", "offline-first design", "service workers",
      "local-first software", "static hosting", "privacy by design", "web", "architecture"),
     "/apps.html", "the three installable offline apps"),
    (("local large language models", "ollama", "retrieval-augmented generation",
      "applied ai", "automation", "small business", "ai", "video processing"),
     "/services.html", "the automation work I take on"),
    (("startup security", "security", "secrets", "vulnerability"),
     "/dira.html", "DIRA, the zero-dependency security scanner"),
    (("resume writing", "job search", "technical interviews", "software portfolios",
      "software engineering internships", "personal branding", "linkedin",
      "career", "technical hiring", "quantitative research"),
     "/hire.html", "what I am open to for Summer 2027"),
    (("international students", "scholarships", "student funding", "cpt", "opt",
      "work authorization"),
     "/visa.html", "the visa timeline planner"),
    (("freight brokerage", "freight", "logistics", "back office", "operations"),
     "/freightdesk.html", "FreightDesk, the AI back office for brokers"),
    (("print on demand", "media", "unit economics", "pricing", "outreach",
      "personal brand", "business"),
     "/templates.html", "the business document templates"),
    (("undergraduate research", "computer science education", "inclusive pedagogy",
      "research", "student projects"),
     "/research.html", "the research behind two SIGCSE 2026 papers"),
    (("calorie", "body", "nutrition", "weight"),
     "/apps/cut/", "Cut, the offline weight tracker"),
    (("technical seo", "structured data", "search"),
     "/everything.html", "everything else that is live and free"),
]

_WORD_STOP = {"and", "the", "for", "of", "in", "to", "a", "an", "with"}


def _topic(g):
    """Topic group derived from the eyebrow: 'Guide - Trading' -> 'trading'."""
    eb = g.get("eyebrow", "")
    return (eb.split("·")[-1] if "·" in eb else eb).strip().lower()


def _tags(g):
    return {t.strip().lower() for t in g.get("about", []) if t.strip()}


def _tag_words(g):
    out = set()
    for t in _tags(g):
        out |= {w for w in re.split(r"[^a-z0-9+]+", t) if len(w) > 3 and w not in _WORD_STOP}
    return out


def _tool_hrefs(g):
    return {h for h, _, _ in g.get("tools", [])}


def _affinity(a, b):
    """Higher = more related. Exact shared topic tags dominate; word overlap and a
    shared tool are soft signals that keep the ranking sane for sparse tag sets."""
    return (6 * len(_tags(a) & _tags(b))
            + (4 if _topic(a) and _topic(a) == _topic(b) else 0)
            + 2 * len(_tag_words(a) & _tag_words(b))
            + 1 * len(_tool_hrefs(a) & _tool_hrefs(b)))


def related_for(g, pool, n=RELATED_N):
    """The n most related guides, always exactly n when the pool allows it.

    Ranked by affinity, tie-broken on slug so the output is byte-stable across
    builds. If affinity alone cannot fill n slots, the remainder is topped up
    deterministically: same-topic guides first, then the rest in slug order.
    """
    others = [o for o in pool if o["slug"] != g["slug"]]
    scored = sorted(((_affinity(g, o), o) for o in others), key=lambda x: (-x[0], x[1]["slug"]))
    picked = [o for s, o in scored if s > 0][:n]
    if len(picked) < n:
        have = {o["slug"] for o in picked}
        same = sorted((o for o in others if _topic(o) == _topic(g) and o["slug"] not in have),
                      key=lambda o: o["slug"])
        rest = sorted((o for o in others if o["slug"] not in have),
                      key=lambda o: o["slug"])
        for o in same + rest:
            if len(picked) >= n:
                break
            if o["slug"] not in have:
                picked.append(o)
                have.add(o["slug"])
    return picked[:n]


def cross_silo_for(g, limit=2):
    """Commercial pages this guide's own tags say it supports."""
    hay = " | ".join([_topic(g)] + sorted(_tags(g)))
    hits = []
    for i, (keys, href, anchor) in enumerate(CROSS_SILO):
        score = sum(1 for k in keys if k in hay)
        if score:
            hits.append((-score, i, href, anchor))
    return [(h, a) for _, _, h, a in sorted(hits)[:limit]]


def _blurb(o, cap=118):
    """Short, complete-looking card copy. og_desc is already written short."""
    text = o.get("og_desc") or o.get("desc", "")
    if len(text) <= cap:
        return text
    cut = text[:cap].rsplit(" ", 1)[0].rstrip(" ,;:.")
    return cut + "…"


def related_block(g, pool):
    """The full <section> injected into every guide. Same markup for generated
    and legacy guides, so the two never drift apart."""
    picks = related_for(g, pool)
    if not picks:
        return ""
    cards = "\n".join(
        f'      <a class="related__item" href="/guides/{o["slug"]}.html">'
        f'<strong>{o["h1"]}</strong><span>{_blurb(o)}</span></a>'
        for o in picks)
    silo = cross_silo_for(g)
    if len(silo) >= 2:
        tail = (f' Or put it to work in <a href="{silo[0][0]}">{silo[0][1]}</a> '
                f'and <a href="{silo[1][0]}">{silo[1][1]}</a>.')
    elif silo:
        tail = f' Or put it to work in <a href="{silo[0][0]}">{silo[0][1]}</a>.'
    else:
        tail = ""
    return f"""  <hr class="divider">

  <section class="section section--tight related" id="related" aria-labelledby="related-h">
    <div class="grp-head">
      <p class="eyebrow">Keep reading</p>
      <h2 id="related-h">Related guides</h2>
    </div>
    <div class="related__grid">
{cards}
    </div>
    <p class="related__more">Every guide is indexed on <a href="/guides.html">the guides hub</a>.{tail}</p>
  </section>
"""


def crumbs_block(crumb):
    """Visible trail that mirrors the BreadcrumbList JSON-LD one-for-one."""
    return f"""<nav class="crumbs" aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/guides.html">Guides</a></li>
    <li><span aria-current="page">{crumb}</span></li>
  </ol>
</nav>"""

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


def render(g, pool=()):
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
    related = related_block(g, pool) if pool else ""
    related_section = f"\n{RELATED_START}\n{related}{RELATED_END}\n" if related else ""
    crumbs = crumbs_block(g["crumb"])

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

{crumbs}

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
{related_section}
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


def registry():
    """Every guide spec, generated + legacy, read fresh from disk each build so a
    module added by anyone shows up in the related graph with no edit here."""
    here = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, here)
    import glob as _glob
    import importlib
    guides = []
    for mod in sorted(os.path.basename(p)[:-3] for p in _glob.glob(os.path.join(here, "content_*.py"))):
        guides.extend(importlib.import_module(mod).GUIDES)
    return guides


def patch_legacy(pool):
    """Inject the same related block into the three hand-written guides.

    They are not rendered by this engine, so the block is written between
    markers and replaced wholesale on every build. Markers are created on first
    run, just before the closing </main>.
    """
    done = 0
    for meta in LEGACY_META:
        path = os.path.join(OUT, meta["slug"] + ".html")
        if not os.path.exists(path):
            continue
        src = open(path, encoding="utf-8").read()
        block = f"{RELATED_START}\n{related_block(meta, pool)}{RELATED_END}"
        if RELATED_START in src and RELATED_END in src:
            src = re.sub(re.escape(RELATED_START) + r".*?" + re.escape(RELATED_END),
                         lambda _: block, src, flags=re.S)
        elif "</main>" in src:
            src = src.replace("</main>", block + "\n\n</main>", 1)
        else:
            continue
        if "class=\"crumbs\"" not in src:
            src = src.replace("</nav>\n", "</nav>\n\n" + crumbs_block(meta["crumb"]) + "\n", 1)
        open(path, "w", encoding="utf-8").write(src)
        done += 1
    return done


def main():
    guides = registry()
    pool = guides + [m for m in LEGACY_META
                     if m["slug"] not in {g["slug"] for g in guides}]
    os.makedirs(OUT, exist_ok=True)
    for g in guides:
        path = os.path.join(OUT, g["slug"] + ".html")
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(render(g, pool))
        print("wrote", os.path.relpath(path))
    n = patch_legacy(pool)
    print(f"{len(guides)} guides generated, {n} legacy guides patched, "
          f"{len(pool)} in the related graph")


if __name__ == "__main__":
    main()
