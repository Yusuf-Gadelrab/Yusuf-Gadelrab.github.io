"""Rewrite only the Guides sections of llms.txt and llms-full.txt from the registry.

Both files are edited by hand and by other processes, so this replaces exactly one
section in each and leaves the rest byte-identical.
"""
import glob
import html
import importlib
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", ".."))
BASE = "https://yusuf-gadelrab.github.io"

LEGACY = {
    "r-multiple-expectancy": (
        "R-multiple and expectancy explained",
        "Position sizing from the stop, results expressed in R, expectancy per trade, the break-even win rate table (50% at 1R, 33.3% at 2R, 25% at 3R), why a 70% win rate can still lose money, and risk of ruin."),
    "freight-broker-margin": (
        "Freight broker margin, rate per mile and fuel surcharge",
        "Margin versus markup, all-in rate per mile including deadhead, deadhead cost, FSC = (diesel - base) / MPG, detention and free time, and load break-even."),
    "cpt-vs-opt": (
        "CPT vs OPT for F-1 students",
        "Who authorizes each, the one-academic-year rule, the 12-month OPT allowance per education level, the 24-month STEM extension, the 90/150 unemployment days, and how to plan the timeline backwards. Not legal advice."),
}


def strip(t):
    return re.sub("<[^>]+>", "", html.unescape(t)).replace("—", "-").strip()


def load():
    sys.path.insert(0, HERE)
    out = [(s, t, d) for s, (t, d) in LEGACY.items()]
    for mod in sorted(os.path.basename(p)[:-3] for p in glob.glob(os.path.join(HERE, "content_*.py"))):
        for g in importlib.import_module(mod).GUIDES:
            out.append((g["slug"], strip(g["headline"]), strip(g["desc"])))
    seen, uniq = set(), []
    for row in out:
        if row[0] in seen:
            continue
        seen.add(row[0])
        uniq.append(row)
    return uniq


def replace_section(path, header, body):
    src = open(path, encoding="utf-8").read()
    pat = re.compile(re.escape(header) + r"\n.*?(?=\n## )", re.S)
    if not pat.search(src):
        raise SystemExit(f"section {header!r} not found in {path}")
    open(path, "w", encoding="utf-8").write(pat.sub(lambda _: header + "\n" + body, src, count=1))


def main():
    guides = load()

    short = "\n- [Guides index](%s/guides.html): Every guide, each paired with a free calculator or tool.\n" % BASE
    for slug, title, desc in guides:
        short += f"- [{title}]({BASE}/guides/{slug}.html): {desc}\n"
    replace_section(os.path.join(ROOT, "public", "llms.txt"),
                    "## Guides (long-form answers, every formula shown)", short)

    full = "\n" + f"Guides index: {BASE}/guides.html\n\n"
    for slug, title, desc in guides:
        full += f'"{title}" - {BASE}/guides/{slug}.html\n{desc}\n\n'
    full += "---\n"
    replace_section(os.path.join(ROOT, "public", "llms-full.txt"),
                    "## 6b. Guides (long-form, formulas shown on the page)", full)

    wk = os.path.join(ROOT, "public", ".well-known", "llms.txt")
    if os.path.exists(wk):
        import shutil
        shutil.copy(os.path.join(ROOT, "public", "llms.txt"), wk)

    print(f"llms.txt + llms-full.txt updated with {len(guides)} guides")


if __name__ == "__main__":
    main()
