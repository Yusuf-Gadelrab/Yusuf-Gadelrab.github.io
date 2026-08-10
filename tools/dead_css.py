#!/usr/bin/env python3
"""
dead_css.py — dead/single-page CSS report for public/css/site.css.

Stdlib only. Conservative by design: prefers false "used" over false "dead".

Usage:
    python3 tools/dead_css.py [--verbose]

What it does
------------
1. Parses site.css into rule blocks (tracking @media/@supports/@keyframes
   brace nesting with a simple depth counter), splits comma-separated
   selector lists into individual selectors, and skips @keyframes bodies
   (0%/50%/100%/from/to are not selectors).
2. From each selector extracts the class names (.foo), id names (#bar), and
   custom-property names (--baz) it references.
3. Builds a usage corpus from:
     - public/**/*.html
     - public/**/*.js
     - public/**/*.svg
     - public/**/*.webmanifest
     - src/**/*.js               (CRA app also renders class names)
     - tools/**/*.py             (HTML-emitting generator scripts)
4. A class/id/custom-prop is "used" if its literal name appears anywhere in
   the corpus on a word boundary (substring match, conservative).
5. Reports:
     (a) selectors whose ALL classes are unused anywhere = candidate dead
     (b) classes used, but only on exactly 1 distinct public/*.html page
         ("single-page CSS shipped site-wide")
     (c) byte-weight estimate per candidate-dead rule block
6. Prints a summary: total CSS bytes, candidate-dead bytes, single-page-only
   bytes.
"""

import argparse
import pathlib
import re
import sys

REPO = pathlib.Path(__file__).resolve().parent.parent
CSS_PATH = REPO / "public" / "css" / "site.css"

CLASS_RE = re.compile(r"\.([a-zA-Z_][a-zA-Z0-9_-]*)")
ID_RE = re.compile(r"#([a-zA-Z_][a-zA-Z0-9_-]*)")
CUSTOM_PROP_RE = re.compile(r"(--[a-zA-Z0-9_-]+)")

# selectors that are pseudo-classes / functions, not actual class refs
# (CLASS_RE already requires a leading dot, so :not(.foo) etc. still match
# correctly — no special-casing needed there)


def split_top_level_commas(selector_list):
    """Split a selector list on commas that are not inside ( ) or [ ]."""
    parts = []
    depth = 0
    buf = []
    for ch in selector_list:
        if ch in "([":
            depth += 1
            buf.append(ch)
        elif ch in ")]":
            depth = max(0, depth - 1)
            buf.append(ch)
        elif ch == "," and depth == 0:
            parts.append("".join(buf))
            buf = []
        else:
            buf.append(ch)
    if buf:
        parts.append("".join(buf))
    return [p.strip() for p in parts if p.strip()]


def strip_comments(css_text):
    """Blank out comment bodies but keep every character position (and every
    newline) intact, so byte offsets / line numbers computed later against
    this cleaned text still match the ORIGINAL file exactly."""
    def repl(m):
        return "".join(ch if ch == "\n" else " " for ch in m.group(0))
    return re.sub(r"/\*.*?\*/", repl, css_text, flags=re.DOTALL)


class Rule:
    __slots__ = ("selector_text", "start", "end", "at_stack")

    def __init__(self, selector_text, start, end, at_stack):
        self.selector_text = selector_text
        self.start = start  # offset of the first non-whitespace char (for
                             # accurate line numbers and a fair byte count —
                             # excludes blank/indentation padding before it)
        self.end = end
        self.at_stack = list(at_stack)


def parse_css(css_text):
    """
    Walk the CSS text tracking brace depth. Maintain a stack of at-rule
    contexts (e.g. ['@media(max-width:620px)', '@keyframes yg-vt-out']).
    Whenever we hit a '{' preceded by a selector-looking chunk at the TOP of
    an at-rule (i.e. not immediately inside a @keyframes body), record a Rule
    for that selector text with its byte span (used for size estimation).
    Skip recording rules whose innermost at-context is @keyframes (percentage
    / from / to are not real selectors).
    """
    rules = []
    at_stack = []  # each entry: (name, is_keyframes)
    i = 0
    n = len(css_text)
    buf_start = 0

    while i < n:
        ch = css_text[i]
        if ch == "{":
            chunk = css_text[buf_start:i]
            chunk_stripped = chunk.strip()
            if chunk_stripped.startswith("@"):
                # at-rule header, e.g. @media(...), @supports(...), @keyframes name
                is_kf = bool(re.match(r"@keyframes\b", chunk_stripped))
                at_stack.append((chunk_stripped, is_kf))
            else:
                # this is a regular rule (selector list) OR a keyframes step
                innermost_kf = at_stack[-1][1] if at_stack else False
                if chunk_stripped and not innermost_kf:
                    leading_ws = len(chunk) - len(chunk.lstrip())
                    content_start = buf_start + leading_ws
                    rules.append(Rule(chunk_stripped, content_start, None, at_stack))
                # push a placeholder marker so we know how to pop on '}'
                at_stack.append((None, innermost_kf))
            buf_start = i + 1
            i += 1
        elif ch == "}":
            if at_stack:
                name, is_kf = at_stack.pop()
                if name is None:
                    # closed a regular rule or keyframes-step body; find the
                    # most recently opened Rule without an end and close it
                    for r in reversed(rules):
                        if r.end is None:
                            r.end = i + 1
                            break
            buf_start = i + 1
            i += 1
        else:
            i += 1

    # Any rules still missing an end (malformed CSS) — close at EOF
    for r in rules:
        if r.end is None:
            r.end = n
    return rules


def extract_refs(selector):
    classes = set(CLASS_RE.findall(selector))
    ids = set(ID_RE.findall(selector))
    # custom props inside selectors are rare (e.g. var() doesn't appear in
    # selectors), but keep the hook for completeness / future-proofing
    customs = set(CUSTOM_PROP_RE.findall(selector))
    return classes, ids, customs


# ---------------------------------------------------------------------------
# Corpus
# ---------------------------------------------------------------------------

WORD_BOUNDARY_CHARS = set(
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-"
)


def name_appears(name, text):
    """Conservative word-boundary substring match: `name` must appear in
    `text` and not be immediately extended by another identifier char on
    either side (so `.card` doesn't false-negative-match against `.card--flat`
    usage sites, and `.btn` doesn't get confused — we WANT `.btn` to count as
    used if `.btn-gold` appears, so boundary chars are permissive: we check
    that `name` itself appears as the class token, i.e. preceded/followed by
    a non [a-zA-Z0-9_-] char, OR string start/end. This still trivially
    matches `.btn` inside `.btn-gold` used in an HTML class="btn-gold" — for
    class NAMES we do exact token matching instead; see class_appears()).
    """
    idx = 0
    while True:
        idx = text.find(name, idx)
        if idx == -1:
            return False
        before_ok = idx == 0 or text[idx - 1] not in WORD_BOUNDARY_CHARS
        after_idx = idx + len(name)
        after_ok = after_idx >= len(text) or text[after_idx] not in WORD_BOUNDARY_CHARS
        if before_ok and after_ok:
            return True
        idx += 1


def load_corpus_files():
    files = []
    pub = REPO / "public"
    for pattern in ("**/*.html", "**/*.js", "**/*.svg", "**/*.webmanifest"):
        files.extend(sorted(pub.glob(pattern)))
    src = REPO / "src"
    if src.exists():
        files.extend(sorted(src.glob("**/*.js")))
    tools_dir = REPO / "tools"
    if tools_dir.exists():
        this_file = pathlib.Path(__file__).resolve()
        files.extend(
            sorted(f for f in tools_dir.glob("**/*.py") if f.resolve() != this_file)
        )
    return files


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--verbose", action="store_true")
    ap.add_argument("--check", metavar="NAME", help="debug: report usage sites for one class/id name")
    ap.add_argument("--rank", action="store_true",
                     help="debug: list every class sorted by ascending corpus-file usage count")
    args = ap.parse_args()

    css_text = CSS_PATH.read_text(encoding="utf-8")
    total_css_bytes = len(css_text.encode("utf-8"))
    clean = strip_comments(css_text)
    rules = parse_css(clean)

    # Expand every rule into individual selectors, tagging each with the
    # rule's byte span (for size estimation) and at-rule context.
    selector_entries = []  # (selector_str, classes, ids, customs, rule)
    for r in rules:
        for sel in split_top_level_commas(r.selector_text):
            # drop leading combinators/pseudo junk from at-rule headers that
            # slipped through (shouldn't happen, but be defensive)
            if not sel:
                continue
            classes, ids, customs = extract_refs(sel)
            selector_entries.append((sel, classes, ids, customs, r))

    # Collect the universe of class/id names referenced by selectors.
    all_classes = set()
    all_ids = set()
    for _, classes, ids, _, _ in selector_entries:
        all_classes |= classes
        all_ids |= ids

    corpus_files = load_corpus_files()
    html_files = [f for f in corpus_files if f.suffix == ".html" and "/public/" in str(f).replace("\\", "/")]

    if args.verbose:
        print(f"[info] corpus files: {len(corpus_files)} "
              f"(html={sum(1 for f in corpus_files if f.suffix=='.html')}, "
              f"js={sum(1 for f in corpus_files if f.suffix=='.js')}, "
              f"svg={sum(1 for f in corpus_files if f.suffix=='.svg')}, "
              f"webmanifest={sum(1 for f in corpus_files if f.suffix=='.webmanifest')}, "
              f"py={sum(1 for f in corpus_files if f.suffix=='.py')})",
              file=sys.stderr)

    file_texts = {}
    for f in corpus_files:
        try:
            file_texts[f] = f.read_text(encoding="utf-8", errors="ignore")
        except Exception as e:
            if args.verbose:
                print(f"[warn] could not read {f}: {e}", file=sys.stderr)

    if args.check:
        name = args.check
        hits = []
        for f, text in file_texts.items():
            if name_appears(name, text):
                hits.append(str(f.relative_to(REPO)))
        print(f"'{name}' appears in {len(hits)} corpus file(s):")
        for h in hits:
            print(f"  {h}")
        return

    # Determine usage: for each class name, which files contain it, and
    # specifically which public/*.html pages contain it.
    class_used_in_files = {c: [] for c in all_classes}
    class_used_in_pages = {c: [] for c in all_classes}
    id_used_in_files = {i: [] for i in all_ids}

    for f, text in file_texts.items():
        is_public_html = f.suffix == ".html" and f in html_files
        for c in all_classes:
            if name_appears(c, text):
                class_used_in_files[c].append(f)
                if is_public_html:
                    class_used_in_pages[c].append(f)
        for i in all_ids:
            if name_appears(i, text):
                id_used_in_files[i].append(f)

    if args.rank:
        counts = sorted(
            ((c, len(files), [str(f.relative_to(REPO)) for f in files]) for c, files in class_used_in_files.items()),
            key=lambda x: x[1],
        )
        for c, n, files in counts:
            print(f"{n:>3}  .{c:<28} {', '.join(files[:4])}{' ...' if len(files) > 4 else ''}")
        return

    dead_classes = {c for c, files in class_used_in_files.items() if not files}
    dead_ids = {i for i, files in id_used_in_files.items() if not files}

    single_page_classes = {
        c: pages for c, pages in class_used_in_pages.items()
        if len(pages) == 1 and class_used_in_files[c]  # used, and only on 1 page
    }

    # A selector is "candidate dead" if EVERY class/id it references is dead.
    # Selectors with no class/id at all (bare element/pseudo selectors like
    # `body`, `a`, `::selection`) are never flagged — impossible to prove
    # dead this way and almost certainly load-bearing base styles.
    dead_rule_spans = []  # (rule, selector, size)
    for sel, classes, ids, customs, r in selector_entries:
        refs = classes | ids
        if not refs:
            continue
        if refs.issubset(dead_classes | dead_ids):
            dead_rule_spans.append((r, sel))

    # De-dup by rule object for byte-size accounting (a rule with multiple
    # comma-separated selectors that are ALL dead counts once for size, but
    # if only SOME of its selectors are dead we still just flag those
    # selector names — the shared body isn't separately removable anyway).
    # Group selectors by rule
    rule_all_selectors = {}
    for sel, classes, ids, customs, r in selector_entries:
        rule_all_selectors.setdefault(id(r), []).append((sel, classes, ids))

    dead_rule_objs = set()
    for r, sel in dead_rule_spans:
        all_sels_for_rule = rule_all_selectors[id(r)]
        # rule fully dead only if EVERY selector in the rule is dead-eligible
        all_dead = all(
            (c | i2) and (c | i2).issubset(dead_classes | dead_ids)
            for _, c, i2 in all_sels_for_rule
        )
        if all_dead:
            dead_rule_objs.add(id(r))

    seen_rule_ids = set()
    dead_bytes = 0
    dead_rule_report = []
    for r, sel in dead_rule_spans:
        if id(r) in dead_rule_objs and id(r) not in seen_rule_ids:
            seen_rule_ids.add(id(r))
            size = len(css_text[r.start:r.end].encode("utf-8"))
            dead_bytes += size
            line_no = css_text.count("\n", 0, r.start) + 1
            at_ctx = " > ".join(n for n, _ in r.at_stack if n)
            dead_rule_report.append({
                "selector": r.selector_text,
                "line": line_no,
                "size": size,
                "context": at_ctx,
            })

    # Simpler dead-class-name list (the more actionable unit for the report)
    dead_class_list = sorted(dead_classes)
    dead_id_list = sorted(dead_ids)

    # single-page CSS byte estimate: sum unique rule byte-spans that
    # reference AT LEAST ONE single-page-only class (conservative: this is
    # an upper bound per rule, rules aren't split sub-selector).
    single_page_rule_ids = set()
    for sel, classes, ids, customs, r in selector_entries:
        if classes & single_page_classes.keys():
            single_page_rule_ids.add(id(r))
    single_page_bytes = 0
    rule_by_id = {id(r): r for r in rules}
    for rid in single_page_rule_ids:
        if rid not in dead_rule_objs:  # don't double-count dead rules
            rr = rule_by_id[rid]
            single_page_bytes += len(css_text[rr.start:rr.end].encode("utf-8"))

    # ---------------- report ----------------
    print("=" * 78)
    print("DEAD CSS / SINGLE-PAGE CSS REPORT")
    print(f"Source: {CSS_PATH.relative_to(REPO)}")
    print("=" * 78)
    print(f"Total CSS bytes:            {total_css_bytes:,}")
    print(f"Total selectors parsed:     {len(selector_entries):,}")
    print(f"Distinct classes in CSS:    {len(all_classes):,}")
    print(f"Distinct IDs in CSS:        {len(all_ids):,}")
    print(f"Corpus files scanned:       {len(corpus_files):,}")
    print(f"Public HTML pages scanned:  {len(html_files):,}")
    print()

    print("-" * 78)
    print(f"(1) CANDIDATE-DEAD selectors (all referenced classes/ids unused anywhere)")
    print("-" * 78)
    if not dead_rule_report:
        print("  none found")
    else:
        for item in sorted(dead_rule_report, key=lambda x: -x["size"]):
            print(f"  L{item['line']:<4} {item['selector']:<45} "
                  f"~{item['size']:>4}B  [{item['context'] or 'top-level'}]")
    print()
    print(f"  Dead class names ({len(dead_class_list)}): {', '.join(dead_class_list) if dead_class_list else '(none)'}")
    print(f"  Dead id names ({len(dead_id_list)}): {', '.join(dead_id_list) if dead_id_list else '(none)'}")
    print()

    print("-" * 78)
    print(f"(2) SINGLE-PAGE-ONLY classes (used, but on exactly 1 public/*.html page)")
    print("-" * 78)
    if not single_page_classes:
        print("  none found")
    else:
        for c, pages in sorted(single_page_classes.items()):
            page_names = ", ".join(str(p.relative_to(REPO)) for p in pages)
            other_files = [f for f in class_used_in_files[c] if f not in pages]
            print(f"  .{c:<30} page: {page_names}"
                  + (f"  (+{len(other_files)} non-html corpus hit(s))" if other_files else ""))
    print()

    print("-" * 78)
    print("(3) SUMMARY")
    print("-" * 78)
    print(f"  Total CSS:              {total_css_bytes:,} bytes")
    print(f"  Candidate-dead CSS:     {dead_bytes:,} bytes "
          f"({dead_bytes/total_css_bytes*100:.1f}%)")
    print(f"  Single-page-only CSS:   {single_page_bytes:,} bytes "
          f"({single_page_bytes/total_css_bytes*100:.1f}%) [rules not already counted dead]")
    print()
    print("NOTE: this is a conservative, substring/word-boundary heuristic, not a")
    print("real CSS/DOM analyzer. Selectors combined with :is()/:where()/JS-built")
    print("class-name concatenation (e.g. base + '__variant' built at runtime) can")
    print("still cause false positives in the dead list. Manually verify before")
    print("deleting anything this script reports.")


if __name__ == "__main__":
    main()
