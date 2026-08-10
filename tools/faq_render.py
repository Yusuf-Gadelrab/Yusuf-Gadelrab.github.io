#!/usr/bin/env python3
"""Make every page's FAQPage JSON-LD exactly mirror its visible FAQ.

Google requires FAQPage rich-result content to be visibly present on the page.
Four pages violated that, but in two different ways:

  * hisn.html had schema and NO visible FAQ at all  -> render the visible block
    from the schema.
  * about/hire/codeswitch had a visible FAQ whose questions and answers the
    schema merely PARAPHRASED ("What is the fastest way to reach him?" in
    markup vs "What's the fastest way to reach him?" on the page)
    -> regenerate the schema from the visible blocks.

Deriving one side from the other means the two cannot drift. Idempotent.
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"

START = "<!-- FAQ:AUTO:START -->"
END = "<!-- FAQ:AUTO:END -->"

# pages whose schema is regenerated FROM their visible Q&A cards
FROM_VISIBLE = {
    "about.html": "card qa",
    "hire.html": "card qa",
    "dira.html": "card qa",
    "projects.html": "card qa",
    "codeswitch.html": "card geo-qa",
    "circle.html": "card geo-qa",
}

# pages with schema but no visible FAQ: render the visible block FROM the schema
FROM_SCHEMA = {
    "hisn.html": ("Questions", 'What HISN <span class="gold-fill">actually does.</span>',
                  "Including the parts that rule it out for you."),
}

BASE = "https://yusuf-gadelrab.github.io"


def strip(fragment):
    """Visible text of an HTML fragment, whitespace-normalised."""
    # tags become a SPACE, not nothing — otherwise `</p><p>` welds two
    # paragraphs into one word and every multi-paragraph answer false-negatives.
    t = re.sub(r"<[^>]+>", " ", fragment)
    return re.sub(r"\s+", " ", html.unescape(t)).strip()


def visible_qa(src, cls):
    """(question, answer) for each visible Q&A card, in document order."""
    out = []
    pattern = re.compile(
        r'<article class="' + re.escape(cls) + r'">\s*'
        r"<h([23])>(.*?)</h\1>\s*(.*?)</article>", re.S)
    for m in pattern.finditer(src):
        q = strip(m.group(2))
        paras = [strip(p) for p in re.findall(r"<p\b[^>]*>(.*?)</p>", m.group(3), re.S)]
        paras = [p for p in paras if p]
        if q and paras:
            out.append((q, "\n\n".join(paras)))
    return out


def faq_blocks(src):
    """Every (span, FAQPage-node, whole-parsed-doc) in the page."""
    for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', src, re.S):
        try:
            data = json.loads(m.group(1))
        except json.JSONDecodeError:
            continue
        for node in (data if isinstance(data, list) else [data]):
            for g in (node.get("@graph") or [node]):
                if g.get("@type") == "FAQPage":
                    yield m, g, data


def schema_qa(src):
    return [(e["name"], e["acceptedAnswer"]["text"])
            for _, g, _ in faq_blocks(src) for e in g.get("mainEntity", [])]


def rebuild_schema(path):
    src = path.read_text()
    pairs = visible_qa(src, FROM_VISIBLE[path.name])
    if not pairs:
        print(f"  !! {path.name}: no visible Q&A cards found", file=sys.stderr)
        return False

    for m, node, data in faq_blocks(src):
        node["mainEntity"] = [
            {"@type": "Question", "name": q,
             "acceptedAnswer": {"@type": "Answer", "text": a}}
            for q, a in pairs
        ]
        node.setdefault("@context", "https://schema.org")
        node.setdefault("@id", f"{BASE}/{path.name}#faq")
        new_json = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
        src = src[:m.start()] + f'<script type="application/ld+json">{new_json}</script>' + src[m.end():]
        path.write_text(src)
        print(f"  {path.name}: schema regenerated from {len(pairs)} visible cards")
        return True
    return False


def render_visible(path):
    src = path.read_text()
    entries = schema_qa(src)
    if not entries:
        return False
    eyebrow, heading, lede = FROM_SCHEMA[path.name]
    rows = []
    for q, a in entries:
        paras = "".join(f"<p>{html.escape(p)}</p>" for p in a.split("\n\n") if p.strip())
        rows.append("      <details>\n"
                    f"        <summary>{html.escape(q)}</summary>\n"
                    f'        <div class="a">{paras}</div>\n'
                    "      </details>")
    block = (f"{START}\n"
             '  <section class="section" id="faq">\n'
             '    <div class="sec-head reveal">\n'
             f'      <div class="eyebrow">{eyebrow}</div>\n'
             f"      <h2>{heading}</h2>\n"
             f"      <p>{lede}</p>\n"
             "    </div>\n"
             '    <div class="yg-faq reveal">\n'
             + "\n\n".join(rows) + "\n    </div>\n  </section>\n  " + END)

    if START in src:
        new = re.sub(re.escape(START) + r".*?" + re.escape(END), lambda _: block, src, flags=re.S)
    else:
        new = src.replace("</main>", block + "\n</main>", 1)
    if new != src:
        path.write_text(new)
    print(f"  {path.name}: {len(entries)} Q&A rendered visible")
    return True


def squash(text):
    """Whitespace-insensitive key.

    Block tags (`</p><p>`) contribute no whitespace when stripped while inline
    tags (`<b>`, `<code>`, `<a>`) sit mid-sentence, so no single tag->separator
    rule reproduces the visible string. Dropping whitespace entirely sidesteps
    both and still catches genuine wording drift.
    """
    return re.sub(r"\s+", "", html.unescape(text))


def verify():
    """Every schema Q&A on every page must appear as visible text."""
    problems = []
    for path in sorted(PUBLIC.rglob("*.html")):
        src = path.read_text()
        pairs = schema_qa(src)
        if not pairs:
            continue
        visible = squash(re.sub(r"<[^>]+>", "", re.sub(r"<script.*?</script>", " ", src, flags=re.S)))
        rel = path.relative_to(PUBLIC)
        for q, a in pairs:
            if squash(q) not in visible:
                problems.append(f"{rel}: Q not visible — {q}")
                continue
            for para in a.split("\n\n"):
                if para.strip() and squash(para) not in visible:
                    problems.append(f"{rel}: A not visible — {q}")
                    break
    return problems


def main():
    for name in FROM_VISIBLE:
        rebuild_schema(PUBLIC / name)
    for name in FROM_SCHEMA:
        render_visible(PUBLIC / name)

    problems = verify()
    print()
    if problems:
        print(f"FAQ MIRROR FAILURES ({len(problems)}):")
        for p in problems:
            print("  ✗", p)
        return 1
    print("every FAQPage Q&A site-wide is visible on its own page")
    return 0


if __name__ == "__main__":
    sys.exit(main())
