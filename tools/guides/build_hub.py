"""Rebuild only the card grid inside public/guides.html.

The hub page is hand-maintained (nav, footer, copy) but the guide list is derived
from the same content_*.py registry the pages come from, so a new guide never has
to be added in two places. Everything between the two marker comments is replaced;
everything outside them is left exactly as found.
"""
import glob
import html
import importlib
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", ".."))
HUB = os.path.join(ROOT, "public", "guides.html")
BASE = "https://yusuf-gadelrab.github.io"

START = "<!-- guides:auto:start -->"
END = "<!-- guides:auto:end -->"

# Display order: topic groups, then registry order within each group.
GROUPS = [
    ("Trading &amp; risk", "Sizing, expectancy, setups, and the tests that killed most of them."),
    ("AI &amp; engineering", "Local models, retrieval, automation, and shipping things that stay shipped."),
    ("Career &amp; students", "Applications, interviews, work authorization, and research."),
    ("Business &amp; freight", "The arithmetic and the operations behind small businesses, brands, and brokerages."),
    ("Body", "Calorie math and tracking that survives a bad week."),
]

GROUP_OF = {
    "r-multiple-expectancy": 0, "anchored-vwap": 0, "walk-forward-backtest": 0,
    "trading-journal": 0, "kelly-criterion": 0, "vcp-base-patterns": 0,
    "stop-loss-placement": 0, "volume-profile": 0, "leveraged-etf-decay": 0,
    "paper-to-live-trading": 0,
    "local-llm-ollama": 1, "rag-explained": 1, "ai-automation-small-business": 1,
    "offline-pwa": 1, "client-side-only-tools": 1, "ffmpeg-auto-editing": 1,
    "ai-search-optimization": 1,
    "student-founder-security-checklist": 1,
    "ats-resume": 2, "swe-internship-international-student": 2,
    "linkedin-profile-recruiters": 2, "cpt-vs-opt": 2,
    "portfolio-that-gets-interviews": 2, "coding-interview-patterns": 2,
    "undergraduate-research": 2, "bilingual-coding-cs-education": 2,
    "scholarships-international-students": 2,
    "verify-visa-sponsorship-internships": 2,
    "quant-internship-timeline": 2,
    "f1-cpt-one-year-rule": 2,
    "cold-email-professor-research": 2,
    "technical-portfolio-8-seconds": 2,
    "freight-broker-margin": 3, "freight-back-office": 3,
    "print-on-demand-economics": 3,
    "sharpe-and-risk-metrics": 0,
    "monte-carlo-portfolio": 0,
    "options-spreads-basics": 0,
    "financial-sentiment-nlp": 1,
    "outreach-quality-gates": 1,
    "quant-internship-prep": 2,
    "cold-outreach-that-works": 3,
    "pricing-a-productized-service": 3,
    "media-kit-essentials": 3,
    "build-in-public": 3,
    "cut-calorie-math": 4,
    "position-sizing-per-trade": 0,
    "drawdown-recovery-math": 0,
    "backtest-overfitting": 0,
    "reading-a-backtest-report": 0,
    "options-vertical-spreads": 0,
    "snyk-vs-trivy-vs-dira": 1,
    "ollama-vs-lm-studio-vs-llama-cpp": 1,
    "notion-vs-obsidian-vs-markdown-files": 1,
    "lemon-squeezy-vs-gumroad-vs-payhip-vs-etsy": 3,
    "alpaca-vs-interactive-brokers-vs-robinhood": 0,
    "free-vs-paid-student-tools": 2,
    # Previously unmapped, so `GROUP_OF.get(slug, 1)` below silently dropped all
    # eight into group 1 and grew it into a 24-card catch-all holding tee
    # margins, detention billing and daily weigh-ins. Mapped explicitly so a
    # regen reproduces the shipped grouping instead of reverting it.
    "carrier-vetting-checklist": 3,
    "detention-demurrage-accessorials": 3,
    "pricing-a-digital-product": 3,
    "clothing-brand-pod-margins": 3,
    "landing-page-that-converts": 3,
    "reading-a-scientific-paper": 2,
    "technical-interview-study-system": 2,
    "weight-tracking-signal-vs-noise": 4,
}

# The three hand-written guides that predate the generator.
LEGACY = [
    {"slug": "r-multiple-expectancy",
     "card_title": "R-multiple &amp; expectancy, explained",
     "card_desc": "Position sizing from the stop, results in R, expectancy per trade, the break-even win rate table, and why a 70% win rate can still lose money.",
     "qs": ["What is an R-multiple?", "How do you calculate expectancy?", "What is risk of ruin?"]},
    {"slug": "freight-broker-margin",
     "card_title": "Freight broker margin &amp; rate per mile",
     "card_desc": "Margin versus markup, all-in rate per mile, what deadhead really costs, how a fuel surcharge is built, when detention gets paid, and the break-even on a load.",
     "qs": ["How is broker margin calculated?", "How is a fuel surcharge calculated?", "What is the break-even rate on a load?"]},
    {"slug": "cpt-vs-opt",
     "card_title": "CPT vs OPT for F-1 students",
     "card_desc": "Who authorizes what, the one-academic-year rule, the 12-month limits, the STEM extension, unemployment days, and how to plan the timeline backwards.",
     "qs": ["What is the difference between CPT and OPT?", "Does CPT affect OPT eligibility?", "When should you file for OPT?"]},
]


def load():
    sys.path.insert(0, HERE)
    items = list(LEGACY)
    for mod in sorted(os.path.basename(p)[:-3] for p in glob.glob(os.path.join(HERE, "content_*.py"))):
        for g in importlib.import_module(mod).GUIDES:
            items.append({
                "slug": g["slug"],
                "card_title": g["h1"],
                "card_desc": g["desc"],
                "qs": [q for q, _ in g["faqs"][:3]],
            })
    return items


def card(it):
    qs = "\n".join(f"          <li>{html.escape(q)}</li>" for q in it["qs"])
    return (f'      <a class="card guide" href="/guides/{it["slug"]}.html">\n'
            f'        <h3>{it["card_title"]}</h3>\n'
            f'        <p>{it["card_desc"]}</p>\n'
            f'        <ul class="qs">\n{qs}\n        </ul>\n'
            f'        <span class="go">Read the guide →</span>\n'
            f"      </a>")


def main():
    items = load()
    seen, uniq = set(), []
    for it in items:
        if it["slug"] in seen:
            continue
        seen.add(it["slug"])
        uniq.append(it)

    blocks = []
    for idx, (name, blurb) in enumerate(GROUPS):
        group = [it for it in uniq if GROUP_OF.get(it["slug"], 1) == idx]
        if not group:
            continue
        cards = "\n\n".join(card(it) for it in group)
        blocks.append(
            f'  <section class="section section--tight">\n'
            f'    <div class="grp-head">\n'
            f'      <p class="eyebrow">{idx + 1:02d} · {name}</p>\n'
            f"      <h2>{name}</h2>\n"
            f"      <p>{blurb}</p>\n"
            f"    </div>\n"
            f'    <div class="grid" style="margin-top:var(--s6)">\n\n{cards}\n\n    </div>\n'
            f"  </section>\n\n  <hr class=\"divider\">")

    body = START + "\n\n" + "\n\n".join(blocks) + "\n\n  " + END

    src = open(HUB, encoding="utf-8").read()
    if START in src and END in src:
        src = re.sub(re.escape(START) + r".*?" + re.escape(END), lambda _: body, src, flags=re.S)
    else:
        raise SystemExit(f"markers not found in {HUB} — add {START} / {END} around the card grid first")

    # ItemList schema mirrors the visible list, in the same order.
    items_ld = {"@type": "ItemList", "name": "Guides by Yusuf Gadelrab",
                "itemListElement": [
                    {"@type": "ListItem", "position": i + 1,
                     "name": re.sub("<[^>]+>", "", html.unescape(it["card_title"])),
                     "url": f"{BASE}/guides/{it['slug']}.html"}
                    for i, it in enumerate(uniq)]}
    src = re.sub(r'\{"@type":"ItemList".*?\]\}', lambda _: json.dumps(items_ld, ensure_ascii=False, separators=(",", ":")), src, count=1, flags=re.S)

    open(HUB, "w", encoding="utf-8").write(src)
    print(f"hub rebuilt with {len(uniq)} guides")
    return uniq


if __name__ == "__main__":
    main()
