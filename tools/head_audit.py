#!/usr/bin/env python3
"""Head-hygiene + script-blocking audit for every .html under public/.

Answers, per page: is the <head> ordered the way browsers want it (charset first
and early, viewport present, title before description/canonical, stylesheets
before scripts), and is anything in the document parse-blocking (a classic
render-blocking <script src> with no defer/async/module, especially one sitting
in <head> before first paint)?

Stdlib only (uses html.parser.HTMLParser — script/style contents are treated as
raw CDATA so embedded '<'/'>' in JSON-LD or JS never confuses tag boundaries).

Covers in one parse pass per file:
  1. Head element ORDER (first-occurrence index) for: meta charset, meta viewport,
     link preload/preconnect/dns-prefetch, title, meta description, link canonical,
     link stylesheet, inline <style>, <script> (any), ld+json.
  2. VIOLATIONS (a)-(h) — see README below / --help.
  3. Whole-document <script> tag classification: inline / defer / async / neither
     (parse-blocking) / ld+json, with file:line for every parse-blocking hit, and
     whether it sits in <head> or at the end of <body>.
  4. Inline <script> blocks in <head> checked for document.write(...) or
     synchronous DOM/layout-touching calls (innerHTML, getElementById+immediate
     use, getBoundingClientRect, appendChild, etc).
  5. Stylesheet inventory per page (which /css/*.css hrefs are loaded) and any
     page with ZERO reachable <link rel="stylesheet">.

Usage:
  python3 tools/head_audit.py                # full human report (all 5 sections)
  python3 tools/head_audit.py --json         # machine-readable dump of everything
  python3 tools/head_audit.py --cap 20       # examples per violation type (default 12)
  python3 tools/head_audit.py --file public/index.html   # single-file deep dump
"""
import argparse, glob, json, os, sys
from collections import defaultdict, Counter
from html.parser import HTMLParser

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
PUB = os.path.join(ROOT, "public")

HEAD_ORDER_KEYS = [
    "meta_charset", "meta_viewport", "link_preload", "link_preconnect",
    "link_dns_prefetch", "title", "meta_description", "link_canonical",
    "link_stylesheet", "style_inline", "script_any", "ldjson",
]

DOM_SYNC_PATTERNS = [
    "document.write(", "document.writeln(", ".innerhtml", ".outerhtml",
    "document.getelementbyid(", "document.queryselector(", "document.queryselectorall(",
    ".appendchild(", ".insertbefore(", ".removechild(", ".replacechild(",
    ".getboundingclientrect(", ".offsetheight", ".offsetwidth", ".offsettop",
    ".offsetleft", ".clientheight", ".clientwidth", ".scrollheight", ".scrollwidth",
    "document.body.classlist", "document.documentelement.classlist",
]


def rel(path):
    return os.path.relpath(path, ROOT)


class HeadParser(HTMLParser):
    """Single-pass tokenizer that records everything head_audit.py needs:
    ordered tag events with char offsets/line numbers, head boundaries, style
    sizes, and raw text of every <script> (for doc.write / sync-DOM scanning)."""

    def __init__(self, raw_text):
        super().__init__(convert_charrefs=False)
        self.raw = raw_text
        # precompute line-start char offsets so getpos() -> absolute char offset
        self._line_starts = [0]
        for line in raw_text.splitlines(keepends=True):
            self._line_starts.append(self._line_starts[-1] + len(line))

        self.events = []          # (offset, kind, attrs_dict, line)  kind = tag name lowercase
        self.in_head = False
        self.head_start_off = None
        self.head_end_off = None
        self.saw_head_open = False
        self.saw_head_close = False
        self.doctype_seen = False
        self.pre_charset_events = []   # tags/text seen before first meta-charset
        self.charset_offset = None
        self.charset_found = False

        self._cur_script = None    # dict while inside a <script>
        self.scripts = []          # list of script dicts (see handle for shape)
        self._cur_style = None
        self.styles = []           # list of {offset,line,in_head,text}

        self._stack = []           # open-tag name stack (lowercase)
        self.body_end_scripts_zone = False  # heuristic, computed after full parse instead

    # -- helpers --------------------------------------------------------
    def _offset(self):
        line, col = self.getpos()
        return self._line_starts[line - 1] + col

    @staticmethod
    def _attrs_dict(attrs):
        d = {}
        for k, v in attrs:
            d[k.lower()] = v if v is not None else ""
        return d

    # -- HTMLParser hooks -------------------------------------------------
    def handle_decl(self, decl):
        off = self._offset()
        if decl.strip().lower().startswith("doctype"):
            self.doctype_seen = True
        if not self.charset_found:
            self.pre_charset_events.append(("decl", decl, off))

    def handle_starttag(self, tag, attrs):
        self._generic_start(tag, attrs, self_closing=False)

    def handle_startendtag(self, tag, attrs):
        self._generic_start(tag, attrs, self_closing=True)

    def _generic_start(self, tag, attrs, self_closing):
        tag = tag.lower()
        off = self._offset()
        line = self.getpos()[0]
        a = self._attrs_dict(attrs)
        is_charset_tag = tag == "meta" and a.get("charset") is not None

        if not self.charset_found and not is_charset_tag:
            self.pre_charset_events.append(("tag", tag, off))

        if tag == "head":
            self.in_head = True
            self.saw_head_open = True
            self.head_start_off = off

        rel_attr = a.get("rel", "").lower()

        if is_charset_tag:
            if not self.charset_found:
                self.charset_offset = off
                self.charset_found = True
            self.events.append((off, "meta_charset", a, line))
        elif tag == "meta" and a.get("name", "").lower() == "viewport":
            self.events.append((off, "meta_viewport", a, line))
        elif tag == "meta" and a.get("name", "").lower() == "description":
            self.events.append((off, "meta_description", a, line))
        elif tag == "link" and "preload" in rel_attr.split():
            self.events.append((off, "link_preload", a, line))
        elif tag == "link" and "preconnect" in rel_attr.split():
            self.events.append((off, "link_preconnect", a, line))
        elif tag == "link" and "dns-prefetch" in rel_attr.split():
            self.events.append((off, "link_dns_prefetch", a, line))
        elif tag == "link" and "canonical" in rel_attr.split():
            self.events.append((off, "link_canonical", a, line))
        elif tag == "link" and "stylesheet" in rel_attr.split():
            self.events.append((off, "link_stylesheet", a, line))
        elif tag == "title":
            self.events.append((off, "title", a, line))
        elif tag == "style":
            self._cur_style = {"offset": off, "line": line, "in_head": self.in_head, "text": ""}
        elif tag == "script":
            is_ldjson = a.get("type", "").lower() == "application/ld+json"
            self.events.append((off, "ldjson" if is_ldjson else "script_any", a, line))
            self._cur_script = {
                "offset": off, "line": line, "in_head": self.in_head,
                "attrs": a, "text": "", "self_closing": self_closing,
            }
            if self_closing:
                self.scripts.append(self._cur_script)
                self._cur_script = None

        self._stack.append(tag)

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag == "head":
            self.in_head = False
            self.saw_head_close = True
            self.head_end_off = self._offset() + len(f"</{tag}>")
        elif tag == "style" and self._cur_style is not None:
            self.styles.append(self._cur_style)
            self._cur_style = None
        elif tag == "script" and self._cur_script is not None:
            self.scripts.append(self._cur_script)
            self._cur_script = None
        if self._stack and tag in self._stack:
            while self._stack and self._stack.pop() != tag:
                pass

    def handle_data(self, data):
        if self._cur_script is not None:
            self._cur_script["text"] += data
        elif self._cur_style is not None:
            self._cur_style["text"] += data
        elif not self.charset_found:
            if data.strip():
                self.pre_charset_events.append(("text", data.strip()[:40], self._offset()))


def parse_file(path):
    with open(path, "rb") as fh:
        raw_bytes = fh.read()
    text = raw_bytes.decode("utf-8", errors="replace")
    p = HeadParser(text)
    try:
        p.feed(text)
        p.close()
    except Exception as e:
        return {"error": str(e)}
    return audit_page(path, text, raw_bytes, p)


def audit_page(path, text, raw_bytes, p: HeadParser):
    violations = []  # list of (code, detail)
    order = {}
    for off, kind, attrs, line in p.events:
        if kind not in order:
            order[kind] = {"offset": off, "line": line}
    for off, line, in_head, txt in [(s["offset"], s["line"], s["in_head"], s["text"]) for s in p.styles]:
        if "style_inline" not in order:
            order["style_inline"] = {"offset": off, "line": line}

    # (a) anything other than DOCTYPE/html/head before meta charset
    bad_pre = []
    for kind, val, off in p.pre_charset_events:
        if kind == "decl":
            continue
        if kind == "tag" and val in ("html", "head"):
            continue
        bad_pre.append((kind, val, off))
    if not p.charset_found:
        violations.append(("no_charset", "no <meta charset> found at all"))
    elif bad_pre:
        first = bad_pre[0]
        violations.append(("pre_charset_content",
                            f"{'<' + first[1] + '>' if first[0]=='tag' else 'text ' + repr(first[1])} "
                            f"appears before <meta charset> at offset {first[2]}"))

    # (b) charset not within first 1024 bytes
    if p.charset_found:
        charset_bytes = len(text[:p.charset_offset].encode("utf-8"))
        if charset_bytes >= 1024:
            violations.append(("charset_too_late", f"<meta charset> at byte {charset_bytes} (>=1024)"))

    # (c) viewport missing
    if "meta_viewport" not in order:
        violations.append(("no_viewport", "no <meta name=viewport> found"))

    # (d) title missing or after description/canonical
    if "title" not in order:
        violations.append(("no_title", "no <title> found"))
    else:
        t_off = order["title"]["offset"]
        for k in ("meta_description", "link_canonical"):
            if k in order and order[k]["offset"] < t_off:
                violations.append(("title_after_" + k, f"<title> appears after {k} (line {order['title']['line']})"))

    # (e) script src in head without defer/async/module
    head_script_no_defer = []
    for s in p.scripts:
        if not s["in_head"]:
            continue
        a = s["attrs"]
        if "src" not in a:
            continue
        if a.get("type", "").lower() == "application/ld+json":
            continue
        has_defer = "defer" in a
        has_async = "async" in a
        is_module = a.get("type", "").lower() == "module"
        if not (has_defer or has_async or is_module):
            head_script_no_defer.append((s["line"], a.get("src", "")))
            violations.append(("head_script_blocking",
                                f"<script src={a.get('src','')!r}> in head, line {s['line']}, no defer/async/module"))

    # (f) link stylesheet AFTER a script src, within head
    seen_head_script_src = False
    for off, kind, attrs, line in p.events:
        if kind == "script_any" and "src" in attrs:
            seen_head_script_src = True
        elif kind == "link_stylesheet" and seen_head_script_src:
            violations.append(("stylesheet_after_script",
                                f"<link stylesheet href={attrs.get('href','')!r}> at line {line} comes after a <script src> earlier in head"))

    # (g) inline style block > 2KB
    big_styles = []
    for s in p.styles:
        size = len(s["text"].encode("utf-8"))
        if size > 2048:
            big_styles.append((s["line"], size))
            violations.append(("big_inline_style", f"<style> at line {s['line']} is {size} bytes (>2048)"))

    # (h) render-blocking stylesheet count (head, no media=print, no disabled)
    render_blocking_links = 0
    stylesheet_hrefs = []
    for off, kind, attrs, line in p.events:
        if kind == "link_stylesheet":
            stylesheet_hrefs.append(attrs.get("href", ""))
            media = attrs.get("media", "").lower()
            if "disabled" not in attrs and media != "print":
                render_blocking_links += 1

    # head byte size
    head_bytes = None
    if p.head_start_off is not None and p.head_end_off is not None:
        head_bytes = len(text[p.head_start_off:p.head_end_off].encode("utf-8"))

    # step 3: whole-document script classification
    script_rows = []
    for s in p.scripts:
        a = s["attrs"]
        stype = a.get("type", "").lower()
        if stype == "application/ld+json":
            cls = "ldjson"
        elif "src" not in a:
            cls = "inline"
        elif "defer" in a:
            cls = "defer"
        elif "async" in a:
            cls = "async"
        elif stype == "module":
            cls = "module"
        else:
            cls = "blocking"
        script_rows.append({
            "line": s["line"], "class": cls, "in_head": s["in_head"],
            "src": a.get("src"), "text": s["text"],
        })

    # step 4: doc.write / sync DOM in head inline scripts
    sync_hits = []
    for s in p.scripts:
        if not s["in_head"]:
            continue
        if "src" in s["attrs"]:
            continue
        if s["attrs"].get("type", "").lower() == "application/ld+json":
            continue
        low = s["text"].lower()
        for pat in DOM_SYNC_PATTERNS:
            if pat in low:
                sync_hits.append((s["line"], pat))

    return {
        "path": path,
        "order": {k: order[k]["line"] for k in HEAD_ORDER_KEYS if k in order},
        "order_sequence": sorted(order.items(), key=lambda kv: kv[1]["offset"]),
        "violations": violations,
        "head_bytes": head_bytes,
        "render_blocking_stylesheets": render_blocking_links,
        "stylesheet_hrefs": stylesheet_hrefs,
        "scripts": script_rows,
        "sync_dom_hits": sync_hits,
        "total_scripts": len(p.scripts),
    }


def find_pages():
    return sorted(glob.glob(os.path.join(PUB, "**", "*.html"), recursive=True))


def human_report(results, cap):
    n = len(results)
    print(f"head_audit.py — {n} pages scanned under public/\n")

    viol_files = defaultdict(list)
    for r in results:
        if "error" in r:
            continue
        for code, detail in r["violations"]:
            viol_files[code].append((rel(r["path"]), detail))

    print("=" * 70)
    print("STEP 1-2: HEAD ORDER + VIOLATIONS")
    print("=" * 70)
    labels = {
        "no_charset": "(missing) no <meta charset> at all",
        "pre_charset_content": "(a) content before <meta charset>",
        "charset_too_late": "(b) charset appears at/after byte 1024",
        "no_viewport": "(c) missing <meta viewport>",
        "no_title": "(d) missing <title>",
        "title_after_meta_description": "(d) <title> after <meta description>",
        "title_after_link_canonical": "(d) <title> after <link canonical>",
        "head_script_blocking": "(e) head <script src> without defer/async/module",
        "stylesheet_after_script": "(f) <link stylesheet> after a <script src> in head",
        "big_inline_style": "(g) inline <style> block > 2KB",
    }
    order_codes = list(labels.keys())
    for code in order_codes:
        files = viol_files.get(code, [])
        print(f"\n[{labels[code]}] — {len(files)} page(s)")
        for f, detail in files[:cap]:
            print(f"  {f}: {detail}")
        if len(files) > cap:
            print(f"  ... and {len(files) - cap} more")

    render_counts = Counter()
    for r in results:
        if "error" not in r:
            render_counts[r["render_blocking_stylesheets"]] += 1
    print(f"\n(h) render-blocking <link stylesheet> count distribution across {n} pages:")
    for k in sorted(render_counts):
        print(f"  {k} stylesheet(s): {render_counts[k]} page(s)")

    sizes = [(rel(r["path"]), r["head_bytes"]) for r in results if "error" not in r and r["head_bytes"] is not None]
    sizes.sort(key=lambda x: -x[1])
    print(f"\nTotal <head> byte size — top {min(cap,len(sizes))} largest:")
    for f, sz in sizes[:cap]:
        print(f"  {sz:6d}B  {f}")
    if sizes:
        avg = sum(s for _, s in sizes) / len(sizes)
        print(f"  avg={avg:.0f}B  min={min(s for _,s in sizes)}B  max={max(s for _,s in sizes)}B")

    print("\n" + "=" * 70)
    print("STEP 3: SCRIPT TAG CLASSIFICATION (whole document)")
    print("=" * 70)
    cls_counts = Counter()
    blocking_rows = []
    for r in results:
        if "error" in r:
            continue
        for s in r["scripts"]:
            cls_counts[s["class"]] += 1
            if s["class"] == "blocking":
                blocking_rows.append((rel(r["path"]), s["line"], s["src"], s["in_head"]))
    total_scripts = sum(cls_counts.values())
    print(f"\nTotals across {total_scripts} <script> tags:")
    label_map = {
        "inline": "(a) inline (no src)",
        "defer": "(b) external src WITH defer",
        "async": "(c) external src WITH async",
        "blocking": "(d) external src, NEITHER (parse-blocking)",
        "module": "(type=module, implicitly deferred)",
        "ldjson": "(e) application/ld+json (inert)",
    }
    for k in ("inline", "defer", "async", "blocking", "module", "ldjson"):
        print(f"  {label_map[k]}: {cls_counts.get(k,0)}")

    print(f"\n(d) EVERY parse-blocking external <script src> hit ({len(blocking_rows)} total):")
    head_ct = sum(1 for *_, in_head in blocking_rows if in_head)
    body_ct = len(blocking_rows) - head_ct
    print(f"  in <head>: {head_ct}   at end of <body>/elsewhere: {body_ct}")
    for f, line, src, in_head in blocking_rows:
        loc = "HEAD" if in_head else "body"
        print(f"  [{loc}] {f}:{line}  src={src!r}")

    print("\n" + "=" * 70)
    print("STEP 4: doc.write / synchronous DOM work in <head> inline scripts")
    print("=" * 70)
    any_hits = False
    for r in results:
        if "error" in r:
            continue
        if r["sync_dom_hits"]:
            any_hits = True
            print(f"  {rel(r['path'])}:")
            for line, pat in r["sync_dom_hits"]:
                print(f"    line {line}: matched {pat!r}")
    if not any_hits:
        print("  none found — no head inline <script> calls document.write() or touches the DOM synchronously.")

    print("\n" + "=" * 70)
    print("STEP 5: STYLESHEET INVENTORY")
    print("=" * 70)
    sheet_counts = Counter()
    zero_sheet_pages = []
    for r in results:
        if "error" in r:
            continue
        hrefs = r["stylesheet_hrefs"]
        if not hrefs:
            zero_sheet_pages.append(rel(r["path"]))
        for h in hrefs:
            sheet_counts[h] += 1
    print("\nStylesheet href usage across all pages:")
    for href, ct in sheet_counts.most_common():
        print(f"  {ct:3d} page(s)  {href}")
    print(f"\nPages with ZERO <link rel=stylesheet>: {len(zero_sheet_pages)}")
    for f in zero_sheet_pages[:cap]:
        print(f"  {f}")
    if len(zero_sheet_pages) > cap:
        print(f"  ... and {len(zero_sheet_pages) - cap} more")

    errors = [rel(r2["path"]) if False else r for r in results if "error" in r]
    if errors:
        print(f"\nParse errors: {len(errors)}")
        for r in errors:
            print(f"  {rel(r['path'])}: {r['error']}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--json", action="store_true", help="dump full machine-readable results")
    ap.add_argument("--cap", type=int, default=12, help="max example files per violation type (default 12)")
    ap.add_argument("--file", help="audit a single file (relative to repo root or absolute)")
    args = ap.parse_args()

    if args.file:
        path = args.file if os.path.isabs(args.file) else os.path.join(ROOT, args.file)
        paths = [path]
    else:
        paths = find_pages()

    results = []
    for path in paths:
        r = parse_file(path)
        r["path"] = path
        results.append(r)

    if args.json:
        def default(o):
            return str(o)
        print(json.dumps(results, indent=2, default=default))
    else:
        human_report(results, args.cap)


if __name__ == "__main__":
    main()
