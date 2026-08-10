#!/usr/bin/env python3
"""Answer-engine-optimization (AEO) audit for public/.

An LLM or answer engine that only reads the top of a page, or only reads one
heading + the next sentence, should still be able to extract a real answer.
This flags pages where that fails in one of three ways:

  LEDE   the first substantive paragraph doesn't answer the h1/title question
  QH2    a question-shaped h2/h3 isn't followed by a direct-answer sentence
  NODEF  the page has no extractable definition/summary block at all

Advisory by default (exit 0) — this is a linter, not a gate.

Usage:
  python3 tools/aeo_audit.py                # prioritized report, worst first
  python3 tools/aeo_audit.py --json         # machine-readable
  python3 tools/aeo_audit.py --limit 20     # cap rows shown
  python3 tools/aeo_audit.py --path "writing/*.html"
  python3 tools/aeo_audit.py --strict       # exit 1 if anything fired
"""
from __future__ import annotations

import argparse
import glob
import html as H
import json
import os
import re
import sys
from collections import defaultdict
from html.parser import HTMLParser

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
PUB = os.path.join(ROOT, "public")

SKIP_FILES = {"offline.html", "404.html", "googlebb78e2fba04aed48.html"}
MIN_BODY_CHARS = 300

# Phrases a page (or a following-sentence) opens with that signal throat-clearing
# rather than an answer. Kept as a flat, editable list rather than one regex so
# new offenders are a one-line addition.
HEDGE_OPENERS = [
    "in this guide", "in this article", "in this post", "in this piece",
    "in this section", "in today's", "in today’s", "welcome", "welcome to",
    "this page", "this guide", "this article", "let's", "let us",
    "have you ever", "have you wondered", "there are many", "there are several",
    "before we", "first, some context", "so you want to", "did you know",
    "imagine", "picture this", "it's no secret", "it is no secret",
    "for years,", "for decades,", "as an ai", "in the world of",
    "when it comes to", "everyone knows", "we've all been there",
]

# Openers on the sentence right after a question heading that defer the answer
# instead of giving one. "it depends" is deliberately absent — that IS a direct
# (if qualified) answer and must never be flagged.
DEFERRAL_OPENERS = [
    "in this section", "below", "below is", "below are", "let's look",
    "let's take a look", "let's break", "we'll cover", "we will cover",
    "first,", "read on", "the following", "here's a breakdown",
    "in the next section", "keep reading", "as we'll see", "as you'll see",
]

# Used to judge whether a HEADING is question-shaped: both "ends in ?" and a
# leading interrogative word count, since headings like "How refunds work" are
# meant as questions even without the punctuation.
QUESTION_START = re.compile(
    r"^(what|why|how|when|where|who|which|is|are|do|does|can|should|will|if)\b",
    re.I,
)


def norm(s: str) -> str:
    return re.sub(r"\s+", " ", H.unescape(s)).strip()


def txt(s: str) -> str:
    return norm(re.sub(r"<[^>]+>", "", s))


def meta_content(src: str, attr: str, key: str):
    m = re.search(r'<meta\s+%s=["\']%s["\']\s+content=["\'](.*?)["\']\s*/?>' % (attr, re.escape(key)), src, re.S | re.I)
    if not m:
        m = re.search(r'<meta\s+content=["\'](.*?)["\']\s+%s=["\']%s["\']' % (attr, re.escape(key)), src, re.S | re.I)
    return norm(m.group(1)) if m else None


def body_text_len(src: str) -> int:
    m = re.search(r"<body[^>]*>(.*)</body>", src, re.S | re.I)
    body = m.group(1) if m else src
    for tag in ("script", "style", "template", "noscript"):
        body = re.sub(rf"<{tag}\b[^>]*>.*?</{tag}>", "", body, flags=re.S | re.I)
    return len(txt(body))


def extract_main_html(src: str) -> str:
    m = re.search(r"<body[^>]*>(.*)</body>", src, re.S | re.I)
    body = m.group(1) if m else src
    scoped = re.search(r"<main\b[^>]*>(.*)</main>", body, re.S | re.I)
    if not scoped:
        scoped = re.search(r"<article\b[^>]*>(.*)</article>", body, re.S | re.I)
    frag = scoped.group(1) if scoped else body
    if not scoped:
        for tag in ("nav", "header", "footer"):
            frag = re.sub(rf"<{tag}\b[^>]*>.*?</{tag}>", "", frag, flags=re.S | re.I)
    for tag in ("script", "style", "template", "noscript"):
        frag = re.sub(rf"<{tag}\b[^>]*>.*?</{tag}>", "", frag, flags=re.S | re.I)
    return frag


BLOCK_TAGS = {"h1", "h2", "h3", "h4", "h5", "h6", "p", "ul", "ol", "table", "blockquote", "dl", "pre"}
LIST_LIKE = {"ul", "ol", "table", "dl"}


class BlockWalker(HTMLParser):
    """Sequential (tag, text, start_offset) blocks over a continuous visible-text
    stream. The offset stream includes ALL text (including bare <div> boilerplate
    like affiliate disclosures) so "distance from h1" reflects what a reader (or
    crawler) actually has to pass through, not just tracked tags. Tracked block
    tags are assumed non-nesting on this site (verified: no <p> inside <li>/
    <blockquote> in current content) — a nested open is merged into the outer
    block rather than starting a new one, so ordering never has to be resorted.
    """

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.chunks = []
        self.pos = 0
        self.blocks = []
        self._open = None  # (tag, classes, start_pos, chunk_start_idx)
        self._depth = 0

    def handle_data(self, data):
        chunk = re.sub(r"\s+", " ", data).strip()
        if not chunk:
            return
        self.chunks.append(chunk)
        self.pos += len(chunk) + 1

    def handle_starttag(self, tag, attrs):
        if tag not in BLOCK_TAGS:
            return
        if self._open is None:
            classes = dict(attrs).get("class", "")
            self._open = (tag, classes, self.pos, len(self.chunks))
            self._depth = 1
        else:
            self._depth += 1

    def handle_endtag(self, tag):
        if tag not in BLOCK_TAGS or self._open is None:
            return
        self._depth -= 1
        if self._depth <= 0:
            btag, classes, start_pos, chunk_idx = self._open
            text = " ".join(self.chunks[chunk_idx:]).strip()
            self.blocks.append({"tag": btag, "text": text, "classes": classes, "start": start_pos})
            self._open = None
            self._depth = 0


def parse_blocks(main_html: str):
    w = BlockWalker()
    try:
        w.feed(main_html)
    except Exception:
        pass
    return w.blocks


def first_sentence(text: str) -> str:
    m = re.match(r"(.{1,400}?[.!?])(\s|$)", text)
    return m.group(1).strip() if m else text[:200].strip()


def is_question(text: str) -> bool:
    t = text.strip()
    return t.endswith("?") or bool(QUESTION_START.match(t))


def ends_as_question(text: str) -> bool:
    # Declarative answers routinely open with "When/If/Which/Where" as a
    # conjunction ("Where a product is paid, ..."), so a leading-word test
    # (is_question) over-fires here. Only a trailing "?" reliably means the
    # answer sentence is itself an unanswered question.
    return text.strip().endswith("?")


def starts_with_any(text: str, phrases) -> bool:
    low = text.strip().lower().lstrip("\"'“”")
    return any(low.startswith(p) for p in phrases)


JSONLD_RE = re.compile(r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', re.S | re.I)
FAQ_HOWTO_DEFTERM = {"FAQPage", "HowTo", "DefinedTerm"}
ARTICLE_LIKE = {"Article", "BlogPosting", "TechArticle", "ScholarlyArticle", "WebPage"}


def jsonld_signals(src: str):
    has_structured_answer = False
    for m in JSONLD_RE.finditer(src):
        try:
            data = json.loads(m.group(1).strip())
        except Exception:
            continue
        if _walk_jsonld(data):
            has_structured_answer = True
    return has_structured_answer


def _walk_jsonld(node) -> bool:
    if isinstance(node, list):
        return any(_walk_jsonld(n) for n in node)
    if not isinstance(node, dict):
        return False
    t = node.get("@type")
    types = t if isinstance(t, list) else ([t] if isinstance(t, str) else [])
    if any(x in FAQ_HOWTO_DEFTERM for x in types):
        return True
    if any(x in ARTICLE_LIKE for x in types) and node.get("description"):
        return True
    for k, v in node.items():
        if isinstance(v, (dict, list)) and _walk_jsonld(v):
            return True
    return False


SUMMARY_CLASS_HINTS = re.compile(
    r'class="[^"]*\b(lede|lead|summary|answer|tldr|key-takeaway|definition|dek|note)\b',
    re.I,
)
# "lead" is not in the spec's literal list, but it's this site's dominant intro-
# paragraph convention (189 uses vs 26 for "lede") — excluding it would make
# NODEF fire on almost every writing/guide page for a naming difference, not a
# real extractability gap.

LEDE_WINDOW = 1200
LEDE_MIN_CHARS = 120
LEDE_MIN_CANDIDATE = 40
QH2_MIN_CHARS = 40
DESC_MIN_FOR_NODEF = 50
# The spec's fourth LEDE condition (shares < 2 content-word tokens with the
# h1/title) is dropped entirely, not just softened. Hand-checked every page it
# fired on in the first pass (leveraged-etf-decay.html, apps.html, media-kit.html,
# and 30+ others) and every single one was a well-written, direct lede that
# elaborates on the h1 rather than echoing its keywords — the exact style
# meta_audit.py's own DESC_ECHOES_TITLE flag already rewards. Keyword overlap
# and "answers the question" are not the same thing on a site this deliberately
# non-repetitive, so the check produced only false positives, not signal.


def audit_lede(blocks) -> list:
    h1_end = 0
    for b in blocks:
        if b["tag"] == "h1" and h1_end == 0:
            h1_end = b["start"] + len(b["text"]) + 1
    # Look at the first few paragraphs after the h1, not just the very first:
    # a short kicker/byline line ("Case study from a real brokerage...") often
    # sits between the h1 and the real answer and can itself clear the 40-char
    # bar, so picking strictly the first candidate mis-selects the kicker.
    after_h1 = [b for b in blocks if b["tag"] == "p" and b["start"] >= h1_end
                and len(b["text"]) >= LEDE_MIN_CANDIDATE]
    if not after_h1:
        return ["no paragraph >=%d chars found in main content after the h1" % LEDE_MIN_CANDIDATE]
    candidate = max(after_h1[:3], key=lambda b: len(b["text"]))

    reasons = []
    distance = candidate["start"] - h1_end
    if distance > LEDE_WINDOW:
        reasons.append(f"opens {distance} chars after the h1 (outside the {LEDE_WINDOW}-char window)")
    if len(candidate["text"]) < LEDE_MIN_CHARS:
        reasons.append(f"only {len(candidate['text'])} chars, too thin to be an answer")
    if starts_with_any(candidate["text"], HEDGE_OPENERS):
        reasons.append("opens with a hedge/throat-clearing phrase")
    return reasons


def audit_qh2(blocks) -> list:
    out = []
    headings = [(i, b) for i, b in enumerate(blocks) if b["tag"] in ("h2", "h3")]
    for i, h in headings:
        if not is_question(h["text"]):
            continue
        nxt = blocks[i + 1] if i + 1 < len(blocks) else None
        label = h["text"][:60]
        if nxt is None:
            out.append(f'"{label}" has no content after it')
            continue
        if nxt["tag"] in ("h2", "h3", "h4", "h5", "h6"):
            out.append(f'"{label}" is followed immediately by another heading, no answer')
            continue
        # A list/table right after the heading is NOT auto-flagged: this site's
        # dominant reference-content pattern is "Where the money leaks" -> a
        # comparison table, which is a legitimately extractable direct answer
        # (arguably the preferred shape for a featured-snippet-style pull).
        # Hand-checked ~10 of these; every one was a real breakdown table, not
        # a deferral. It's still scored below on the same bar as a paragraph —
        # a list/table whose aggregate text is thin or itself a question still
        # fires, just not merely for existing.
        sent = first_sentence(nxt["text"])
        # Length is judged on the WHOLE answer block, not just its first
        # sentence: this site's best FAQ pattern is a crisp lead sentence
        # ("No.", "42.86%.") followed by the explanation, which is exactly
        # the AEO-friendly shape — first-sentence length would flag it as
        # thin when the answer as a whole is substantial.
        if ends_as_question(sent):
            out.append(f'"{label}" is answered with another question')
        elif len(nxt["text"]) < QH2_MIN_CHARS:
            out.append(f'"{label}" answer block is only {len(nxt["text"])} chars')
        elif starts_with_any(sent, DEFERRAL_OPENERS):
            out.append(f'"{label}" opens with a deferral instead of answering')
    return out


def audit_nodef(src: str, main_html: str, desc: str) -> bool:
    if desc and len(desc) >= DESC_MIN_FOR_NODEF:
        return False
    if SUMMARY_CLASS_HINTS.search(main_html):
        return False
    bq = re.search(r"<blockquote\b", main_html, re.I)
    if bq and bq.start() < 4000:
        return False
    if jsonld_signals(src):
        return False
    return True


def audit_file(path: str):
    rel = os.path.relpath(path, PUB).replace(os.sep, "/")
    src = open(path, encoding="utf-8").read()

    if rel in SKIP_FILES or rel.split("/")[0] == "templates":
        return {"file": rel, "skipped": "excluded surface"}
    blen = body_text_len(src)
    if blen < MIN_BODY_CHARS:
        return {"file": rel, "skipped": f"visible body text only {blen} chars"}

    t = re.search(r"<title>(.*?)</title>", src, re.S | re.I)
    title = txt(t.group(1)) if t else ""
    desc = meta_content(src, "name", "description")

    main_html = extract_main_html(src)
    blocks = parse_blocks(main_html)
    h1_blocks = [b for b in blocks if b["tag"] == "h1"]
    h1 = h1_blocks[0]["text"] if h1_blocks else title

    flags = {}
    lede_reasons = audit_lede(blocks)
    if lede_reasons:
        flags["LEDE"] = lede_reasons
    qh2_reasons = audit_qh2(blocks)
    if qh2_reasons:
        flags["QH2"] = qh2_reasons
    if audit_nodef(src, main_html, desc):
        flags["NODEF"] = ["no meta description >=%d chars, no lede/summary element, "
                           "no FAQPage/HowTo/DefinedTerm/Article-description in JSON-LD" % DESC_MIN_FOR_NODEF]

    score = 100
    if "LEDE" in flags:
        score -= 35
    if "NODEF" in flags:
        score -= 40
    if "QH2" in flags:
        score -= min(40, 12 * len(flags["QH2"]))
    score = max(0, score)

    return {
        "file": rel, "skipped": None, "score": score,
        "h1": h1[:80], "title": title, "flags": flags,
    }


def one_liner(r) -> str:
    for kind in ("NODEF", "LEDE", "QH2"):
        if kind in r["flags"]:
            return f"{kind}: {r['flags'][kind][0]}"
    return ""


def severity(score: int) -> str:
    if score <= 40:
        return "CRITICAL"
    if score <= 70:
        return "NEEDS WORK"
    return "MINOR"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--limit", type=int, default=None)
    ap.add_argument("--path", default="**/*.html")
    ap.add_argument("--strict", action="store_true")
    a = ap.parse_args()

    files = sorted(
        p for p in glob.glob(os.path.join(PUB, a.path), recursive=True)
        if os.path.isfile(p) and p.endswith(".html")
    )
    rows = [audit_file(p) for p in files]
    skipped = [r for r in rows if r["skipped"]]
    scanned = [r for r in rows if not r["skipped"]]
    flagged = [r for r in scanned if r["flags"]]
    flagged.sort(key=lambda r: r["score"])
    if a.limit:
        shown = flagged[: a.limit]
    else:
        shown = flagged

    counts = defaultdict(int)
    for r in scanned:
        for k in r["flags"]:
            counts[k] += 1

    if a.json:
        print(json.dumps({
            "scanned": len(scanned), "clean": len(scanned) - len(flagged),
            "flagged": [{"file": r["file"], "score": r["score"], "h1": r["h1"],
                         "flags": r["flags"]} for r in shown],
            "skipped": [{"file": r["file"], "reason": r["skipped"]} for r in skipped],
            "counts": dict(counts),
        }, indent=1))
        return 1 if (a.strict and flagged) else 0

    print(f"AEO audit — {len(scanned)} pages scanned, {len(skipped)} skipped\n")
    last_sev = None
    for r in shown:
        sev = severity(r["score"])
        if sev != last_sev:
            print(f"--- {sev} ---")
            last_sev = sev
        print(f"\n{r['file']}  score {r['score']}")
        print(f"  h1: {r['h1']}")
        for kind, reasons in r["flags"].items():
            for reason in reasons[:3]:
                print(f"  ! {kind}: {reason}")
            if len(reasons) > 3:
                print(f"  ! {kind}: ... +{len(reasons) - 3} more")

    if skipped:
        print("\n--- SKIPPED ---")
        for r in skipped:
            print(f"  {r['file']}: {r['skipped']}")

    print("\n" + "=" * 64)
    print(f"pages scanned: {len(scanned)}   clean: {len(scanned) - len(flagged)}   flagged: {len(flagged)}   skipped: {len(skipped)}")
    for k in sorted(counts, key=lambda x: -counts[x]):
        print(f"  {counts[k]:>4}  {k}")

    return 1 if (a.strict and flagged) else 0


if __name__ == "__main__":
    sys.exit(main())
