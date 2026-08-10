#!/usr/bin/env python3
"""Accessibility + mobile-UX audit over public/**/*.html. Zero dependencies.

Twelve structural checks plus a real WCAG contrast pass that resolves the
custom properties in public/css/site.css and computes actual ratios rather
than eyeballing the palette.

    python3 tools/a11y_audit.py                 # grouped summary
    python3 tools/a11y_audit.py --full          # every finding
    python3 tools/a11y_audit.py --contrast      # contrast section only
    python3 tools/a11y_audit.py --by-page       # prioritised, grouped by page
    python3 tools/a11y_audit.py --json          # machine readable
    python3 tools/a11y_audit.py --only IMG_NO_ALT,TABLE_NO_HEADER
    python3 tools/a11y_audit.py --page 'guides/*'
"""
from __future__ import annotations

import argparse
import fnmatch
import glob
import html as H
import json
import os
import re
import sys
from html.parser import HTMLParser

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
PUB = os.path.join(ROOT, "public")
CSS = os.path.join(PUB, "css", "site.css")

# Pages that are legitimately exempt from a given check.
SKIP_FILES = {"googlebb78e2fba04aed48.html"}  # Google Search Console verification stub

VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link",
        "meta", "param", "source", "track", "wbr"}

# ---------------------------------------------------------------------------
# category metadata: (severity, one-line description)
# ---------------------------------------------------------------------------
CATEGORIES = {
    "IMG_NO_ALT":        ("high", "<img> with no alt attribute at all (alt=\"\" is fine and not flagged)"),
    "INPUT_NO_LABEL":    ("high", "form control with no <label>, aria-label or aria-labelledby"),
    "LINK_VAGUE":        ("med",  "link whose whole accessible name is 'click here' / 'read more' / a bare URL"),
    "FAKE_INTERACTIVE":  ("high", "div/span with a click handler but no role and no tabindex"),
    "HEADING_SKIP":      ("med",  "heading level skipped (h2 -> h4)"),
    "H1_COUNT":          ("med",  "page has zero or more than one <h1>"),
    "HTML_NO_LANG":      ("high", "<html> missing lang attribute"),
    "SKIP_LINK":         ("med",  "no skip link, or skip link points at an anchor that does not exist"),
    "TABINDEX_POSITIVE": ("high", "tabindex greater than 0 breaks natural tab order"),
    "TABLE_NO_HEADER":   ("med",  "<table> with no <th> and no <caption>"),
    "ARIA_INVALID":      ("high", "invalid aria-* value, unknown role, or aria reference to a missing id"),
    "VIEWPORT_NO_ZOOM":  ("high", "viewport meta blocks pinch-zoom (user-scalable=no / maximum-scale=1)"),
    "OVERFLOW_RISK":     ("med",  "table/pre/code block not inside an overflow-x:auto container"),
}

# ---------------------------------------------------------------------------
# ARIA vocabulary (WAI-ARIA 1.2)
# ---------------------------------------------------------------------------
ARIA_ROLES = {
    # abstract roles are deliberately excluded - they are invalid in markup
    "alert", "alertdialog", "application", "article", "banner", "blockquote",
    "button", "caption", "cell", "checkbox", "code", "columnheader", "combobox",
    "command", "comment", "complementary", "contentinfo", "definition",
    "deletion", "dialog", "directory", "document", "emphasis", "feed", "figure",
    "form", "generic", "grid", "gridcell", "group", "heading", "img",
    "insertion", "link", "list", "listbox", "listitem", "log", "main", "mark",
    "marquee", "math", "menu", "menubar", "menuitem", "menuitemcheckbox",
    "menuitemradio", "meter", "navigation", "none", "note", "option",
    "paragraph", "presentation", "progressbar", "radio", "radiogroup", "region",
    "row", "rowgroup", "rowheader", "scrollbar", "search", "searchbox",
    "separator", "slider", "spinbutton", "status", "strong", "subscript",
    "suggestion", "superscript", "switch", "tab", "table", "tablist", "tabpanel",
    "term", "textbox", "time", "timer", "toolbar", "tooltip", "tree", "treegrid",
    "treeitem",
}

TRUE_FALSE = {"true", "false"}
ARIA_ENUM = {
    "aria-hidden": {"true", "false", "undefined"},
    "aria-expanded": {"true", "false", "undefined"},
    "aria-selected": {"true", "false", "undefined"},
    "aria-pressed": {"true", "false", "mixed", "undefined"},
    "aria-checked": {"true", "false", "mixed", "undefined"},
    "aria-disabled": TRUE_FALSE,
    "aria-readonly": TRUE_FALSE,
    "aria-required": TRUE_FALSE,
    "aria-multiline": TRUE_FALSE,
    "aria-multiselectable": TRUE_FALSE,
    "aria-atomic": TRUE_FALSE,
    "aria-busy": TRUE_FALSE,
    "aria-modal": TRUE_FALSE,
    "aria-grabbed": {"true", "false", "undefined"},
    "aria-invalid": {"true", "false", "grammar", "spelling"},
    "aria-live": {"off", "polite", "assertive"},
    "aria-orientation": {"horizontal", "vertical", "undefined"},
    "aria-sort": {"ascending", "descending", "none", "other"},
    "aria-autocomplete": {"inline", "list", "both", "none"},
    "aria-haspopup": {"false", "true", "menu", "listbox", "tree", "grid", "dialog"},
    "aria-current": {"page", "step", "location", "date", "time", "true", "false"},
    "aria-dropeffect": {"copy", "execute", "link", "move", "none", "popup"},
}
ARIA_IDREF = {"aria-labelledby", "aria-describedby", "aria-controls", "aria-owns",
              "aria-flowto", "aria-activedescendant", "aria-details", "aria-errormessage"}
ARIA_INT = {"aria-level", "aria-posinset", "aria-setsize", "aria-colcount",
            "aria-colindex", "aria-colspan", "aria-rowcount", "aria-rowindex",
            "aria-rowspan"}
ARIA_NUM = {"aria-valuemax", "aria-valuemin", "aria-valuenow"}
# every aria-* attribute defined by ARIA 1.2, used to catch typos
ARIA_KNOWN = (set(ARIA_ENUM) | ARIA_IDREF | ARIA_INT | ARIA_NUM | {
    "aria-label", "aria-valuetext", "aria-placeholder", "aria-roledescription",
    "aria-keyshortcuts", "aria-relevant", "aria-description",
})

VAGUE_NAMES = {"click here", "click", "read more", "more", "here", "learn more",
               "this", "link", "more info", "more information", "see more",
               "continue", "details", "download", "go", "view", "read this"}
BARE_URL = re.compile(r"^(https?://|www\.)\S+$", re.I)

LABELLED_INPUT_TYPES_SKIP = {"hidden", "submit", "reset", "button", "image"}


# ---------------------------------------------------------------------------
# colour maths
# ---------------------------------------------------------------------------
def _srgb_channel(c: float) -> float:
    c = c / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def luminance(rgb):
    r, g, b = rgb
    return (0.2126 * _srgb_channel(r) + 0.7152 * _srgb_channel(g)
            + 0.0722 * _srgb_channel(b))


def contrast(fg, bg):
    """WCAG 2.x contrast ratio. fg/bg are (r,g,b) 0-255 tuples."""
    l1, l2 = luminance(fg), luminance(bg)
    if l1 < l2:
        l1, l2 = l2, l1
    return (l1 + 0.05) / (l2 + 0.05)


def parse_color(value):
    """-> ((r,g,b), alpha) or None. Handles #rgb, #rrggbb, #rrggbbaa, rgb(), rgba()."""
    if value is None:
        return None
    v = value.strip().lower()
    m = re.fullmatch(r"#([0-9a-f]{3,8})", v)
    if m:
        h = m.group(1)
        if len(h) == 3:
            h = "".join(ch * 2 for ch in h)
        elif len(h) == 4:
            h = "".join(ch * 2 for ch in h)
        if len(h) == 6:
            return ((int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)), 1.0)
        if len(h) == 8:
            return ((int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)),
                    int(h[6:8], 16) / 255.0)
        return None
    m = re.fullmatch(r"rgba?\(\s*([^)]+)\)", v)
    if m:
        parts = re.split(r"[,\s/]+", m.group(1).strip())
        parts = [p for p in parts if p]
        if len(parts) >= 3:
            try:
                rgb = tuple(int(round(float(p.rstrip("%")) * (2.55 if p.endswith("%") else 1)))
                            for p in parts[:3])
                a = 1.0
                if len(parts) >= 4:
                    a = float(parts[3].rstrip("%")) / (100.0 if parts[3].endswith("%") else 1.0)
                return (rgb, max(0.0, min(1.0, a)))
            except ValueError:
                return None
    named = {"white": (255, 255, 255), "black": (0, 0, 0), "transparent": None}
    if v in named:
        return (named[v], 1.0) if named[v] else None
    return None


def composite(fg_rgba, bg_rgb):
    """Flatten a semi-transparent colour over an opaque backdrop."""
    (r, g, b), a = fg_rgba
    br, bg_, bb = bg_rgb
    return (round(r * a + br * (1 - a)),
            round(g * a + bg_ * (1 - a)),
            round(b * a + bb * (1 - a)))


def hexs(rgb):
    return "#%02X%02X%02X" % rgb


# ---------------------------------------------------------------------------
# CSS parsing
# ---------------------------------------------------------------------------
def strip_css_comments(css: str) -> str:
    return re.sub(r"/\*.*?\*/", " ", css, flags=re.S)


def parse_root_vars(css: str) -> dict:
    """Custom properties from :root (ignores the @media print override block)."""
    css = strip_css_comments(css)
    out = {}
    # only :root blocks that are NOT inside @media print
    depth_safe = re.sub(r"@media\s+print\s*\{.*?\n\}", " ", css, flags=re.S)
    for m in re.finditer(r":root\s*\{([^}]*)\}", depth_safe, re.S):
        for decl in m.group(1).split(";"):
            if ":" not in decl:
                continue
            k, _, v = decl.partition(":")
            k, v = k.strip(), v.strip()
            if k.startswith("--"):
                out[k] = v
    return out


def resolve_var(value, vars_, depth=0):
    """Expand var(--x[, fallback]) recursively."""
    if value is None or depth > 8:
        return value
    def sub(m):
        name = m.group(1).strip()
        fallback = m.group(2)
        if name in vars_:
            return resolve_var(vars_[name], vars_, depth + 1)
        return (fallback or "").strip()
    prev = None
    out = value
    while prev != out and depth < 8:
        prev = out
        out = re.sub(r"var\(\s*(--[\w-]+)\s*(?:,([^()]*(?:\([^()]*\)[^()]*)*))?\)", sub, out)
        depth += 1
    return out


def iter_css_rules(css: str):
    """Yield (selector, declarations-dict) for every top-level-ish rule."""
    css = strip_css_comments(css)
    # drop at-rule preludes but keep their inner rules (good enough for media queries)
    for m in re.finditer(r"([^{}@][^{}]*?)\{([^{}]*)\}", css, re.S):
        sel = " ".join(m.group(1).split())
        if not sel or sel.startswith("@"):
            continue
        decls = {}
        for decl in m.group(2).split(";"):
            if ":" not in decl:
                continue
            k, _, v = decl.partition(":")
            k = k.strip().lower()
            if k and not k.startswith("--"):
                decls[k] = v.strip()
        if decls:
            yield sel, decls


def overflow_classes(css: str) -> set:
    """Class names whose rule sets overflow-x/overflow to auto|scroll."""
    out = set()
    for sel, decls in iter_css_rules(css):
        ov = (decls.get("overflow-x") or decls.get("overflow") or "").lower()
        if "auto" in ov or "scroll" in ov:
            for cls in re.findall(r"\.([\w-]+)", sel):
                out.add(cls)
    return out


# ---------------------------------------------------------------------------
# HTML scanning
# ---------------------------------------------------------------------------
class PageScanner(HTMLParser):
    def __init__(self, rel, overflow_cls):
        super().__init__(convert_charrefs=True)
        self.rel = rel
        self.overflow_cls = set(overflow_cls)
        self.findings = []
        self.stack = []                 # [(tag, attrs_dict)]
        self.ids = set()
        self.label_for = set()          # ids referenced by <label for=...>
        self.headings = []              # (level, text, line)
        self.h1 = 0
        self.lang = None
        self.saw_html = False
        self.viewports = []
        self.skiplinks = []             # (href, line)
        self.tables_open = []           # per-table {'th':bool,'caption':bool,'line':int,'wrapped':bool}
        self._text_target = None        # collecting accessible name for a link
        self._link = None
        self.pre_count = 0
        self.nav_links = 0              # links inside a <nav> / .site-nav before <main>

    # ---- helpers ----
    def line(self):
        return self.getpos()[0]

    def add(self, cat, msg, line=None, detail=None):
        self.findings.append({
            "page": self.rel, "cat": cat, "line": line if line is not None else self.line(),
            "msg": msg, "detail": detail,
        })

    def in_label(self):
        return any(t == "label" for t, _ in self.stack)

    def ancestor_scrolls(self):
        for tag, a in self.stack:
            classes = set((a.get("class") or "").split())
            if classes & self.overflow_cls:
                return True
            st = (a.get("style") or "").lower().replace(" ", "")
            if re.search(r"overflow(-x)?:(auto|scroll)", st):
                return True
        return False

    # ---- parser hooks ----
    def handle_decl(self, decl):
        pass

    def handle_startendtag(self, tag, attrs):
        self._start(tag, attrs, self_closing=True)

    def handle_starttag(self, tag, attrs):
        self._start(tag, attrs, self_closing=tag in VOID)

    def _start(self, tag, attrs, self_closing):
        a = {}
        for k, v in attrs:
            a[k.lower()] = v  # v is None when the attribute is valueless
        line = self.line()

        if a.get("id"):
            self.ids.add(a["id"])

        # 6. lang
        if tag == "html":
            self.saw_html = True
            self.lang = a.get("lang")

        # 11. viewport
        if tag == "meta" and (a.get("name") or "").lower() == "viewport":
            self.viewports.append((a.get("content") or "", line))

        # 1. images
        if tag == "img":
            if "alt" not in a:
                src = (a.get("src") or "")[:70]
                if a.get("aria-hidden") == "true" or a.get("role") in ("presentation", "none"):
                    pass  # explicitly removed from the tree; alt still preferred but not a failure
                else:
                    self.add("IMG_NO_ALT", f"<img> without alt: src={src or '(no src)'}", line)

        # inline SVG used as an image with no accessible name
        if tag == "svg":
            role = a.get("role")
            hidden = a.get("aria-hidden") == "true"
            if role == "img" and not (a.get("aria-label") or a.get("aria-labelledby")):
                # a <title> child may still supply it - checked lazily below
                a["_svg_needs_title"] = "1"
            elif not hidden and not role:
                pass  # decorative-by-omission; noisy to flag, reported separately in summary

        # 8. tabindex > 0
        ti = a.get("tabindex")
        if ti is not None:
            try:
                if int(ti.strip()) > 0:
                    self.add("TABINDEX_POSITIVE", f"<{tag} tabindex=\"{ti}\">", line)
            except (ValueError, AttributeError):
                self.add("ARIA_INVALID", f"<{tag}> non-numeric tabindex=\"{ti}\"", line)

        # 10. aria + role validation
        role = a.get("role")
        if role is not None:
            for r in (role or "").split():
                if r and r.lower() not in ARIA_ROLES:
                    self.add("ARIA_INVALID", f"<{tag}> unknown role=\"{r}\"", line)
        for k, v in a.items():
            if not k.startswith("aria-"):
                continue
            if k not in ARIA_KNOWN:
                self.add("ARIA_INVALID", f"<{tag}> unknown attribute {k}", line)
                continue
            if v is None:
                self.add("ARIA_INVALID", f"<{tag}> {k} has no value", line)
                continue
            val = v.strip()
            if k in ARIA_ENUM:
                if val.lower() not in ARIA_ENUM[k]:
                    self.add("ARIA_INVALID",
                             f"<{tag}> {k}=\"{val}\" (allowed: {', '.join(sorted(ARIA_ENUM[k]))})", line)
            elif k in ARIA_INT:
                if not re.fullmatch(r"-?\d+", val):
                    self.add("ARIA_INVALID", f"<{tag}> {k}=\"{val}\" must be an integer", line)
            elif k in ARIA_NUM:
                if not re.fullmatch(r"-?\d+(\.\d+)?", val):
                    self.add("ARIA_INVALID", f"<{tag}> {k}=\"{val}\" must be a number", line)
            elif k in {"aria-label", "aria-roledescription", "aria-placeholder",
                       "aria-valuetext", "aria-description"}:
                if not val:
                    self.add("ARIA_INVALID", f"<{tag}> {k} is empty", line)
            # IDREF targets are resolved after the whole document is parsed
            if k in ARIA_IDREF and val:
                self.findings.append({"page": self.rel, "cat": "_IDREF", "line": line,
                                      "msg": f"<{tag}> {k}", "detail": val})

        # 4. fake interactive elements
        if tag in ("div", "span", "li", "p", "td"):
            has_handler = any(k.startswith("on") for k in a) or \
                          "cursor:pointer" in (a.get("style") or "").replace(" ", "")
            handlerish = any(k in a for k in ("onclick", "onkeydown", "onkeypress", "onmousedown"))
            if handlerish and role is None and "tabindex" not in a:
                self.add("FAKE_INTERACTIVE",
                         f"<{tag}> has a click handler but no role and no tabindex", line)
            elif has_handler and not handlerish and role is None and "tabindex" not in a:
                # cursor:pointer only - weaker signal, still keyboard-inaccessible if wired in JS
                self.add("FAKE_INTERACTIVE",
                         f"<{tag}> styled cursor:pointer with no role/tabindex (verify JS handler)", line)

        # 2. form controls
        if tag in ("input", "select", "textarea"):
            itype = (a.get("type") or "text").lower()
            # `hidden`/display:none controls are not exposed to assistive tech, so
            # they have nothing to label. The PWAs use the standard pattern of a
            # visible button that click()s a hidden file input; flagging those was
            # a false positive that made the real count look worse than it is.
            concealed = ("hidden" in a
                         or a.get("type", "").lower() == "hidden"
                         or "display:none" in (a.get("style") or "").replace(" ", ""))
            if concealed:
                pass
            elif not (tag == "input" and itype in LABELLED_INPUT_TYPES_SKIP):
                named = bool(a.get("aria-label") or a.get("aria-labelledby")
                             or a.get("title") or self.in_label())
                if not named:
                    if a.get("id") and a["id"] in self.label_for:
                        named = True
                    else:
                        # <label for> may appear after the control - defer
                        self.findings.append({
                            "page": self.rel, "cat": "_MAYBE_LABEL", "line": line,
                            "msg": f"<{tag}{' type='+itype if tag=='input' else ''}>",
                            "detail": a.get("id") or "",
                        })
                        named = True
                if not named:
                    self.add("INPUT_NO_LABEL", f"<{tag}> unlabelled", line)

        if tag == "label" and a.get("for"):
            self.label_for.add(a["for"])

        # 3. link accessible names
        if tag == "a":
            self._link = {"attrs": a, "line": line, "text": []}
            href = a.get("href") or ""
            if href.startswith("#") and len(href) > 1:
                self.skiplinks.append((href, line, a))
            # a skip link only earns its keep when there is nav to skip over
            if any(t == "nav" or "site-nav" in (at.get("class") or "")
                   for t, at in self.stack):
                self.nav_links += 1

        if tag == "button":
            self._link = self._link or None

        # 9. tables
        if tag == "table":
            self.tables_open.append({"th": False, "caption": False, "line": line,
                                     "wrapped": self.ancestor_scrolls()})
        if tag == "th" and self.tables_open:
            self.tables_open[-1]["th"] = True
        if tag == "caption" and self.tables_open:
            self.tables_open[-1]["caption"] = True
        if tag == "table" and self.tables_open and not self.tables_open[-1]["wrapped"]:
            st = (a.get("style") or "").lower().replace(" ", "")
            if "overflow" in st or "display:block" in st:
                self.tables_open[-1]["wrapped"] = True

        # 12. horizontal overflow risk on pre
        if tag == "pre":
            self.pre_count += 1
            st = (a.get("style") or "").lower().replace(" ", "")
            own = bool(re.search(r"overflow(-x)?:(auto|scroll)", st))
            classes = set((a.get("class") or "").split())
            own = own or bool(classes & self.overflow_cls)
            if not own and not self.ancestor_scrolls():
                self.add("OVERFLOW_RISK", "<pre> not inside an overflow-x:auto container", line)

        # 5. headings
        if tag in ("h1", "h2", "h3", "h4", "h5", "h6"):
            lvl = int(tag[1])
            self.headings.append([lvl, "", line])
            if lvl == 1:
                self.h1 += 1
            self._text_target = ("heading", len(self.headings) - 1)

        if not self_closing:
            self.stack.append((tag, a))

    def handle_endtag(self, tag):
        if tag == "a" and self._link:
            self._finish_link()
        if tag in ("h1", "h2", "h3", "h4", "h5", "h6"):
            self._text_target = None
        if tag == "table" and self.tables_open:
            t = self.tables_open.pop()
            if not t["th"] and not t["caption"]:
                self.add("TABLE_NO_HEADER", "<table> with no <th> and no <caption>", t["line"])
            if not t["wrapped"]:
                self.add("OVERFLOW_RISK", "<table> not inside an overflow-x:auto container", t["line"])
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                break

    def handle_data(self, data):
        if self._link is not None:
            self._link["text"].append(data)
        if self._text_target and self._text_target[0] == "heading":
            self.headings[self._text_target[1]][1] += data

    def _finish_link(self):
        lk, self._link = self._link, None
        a = lk["attrs"]
        name = (a.get("aria-label") or "").strip()
        if not name and a.get("aria-labelledby"):
            return  # resolved elsewhere; assume intentional
        if not name:
            name = " ".join("".join(lk["text"]).split())
        if not name:
            name = (a.get("title") or "").strip()
        if not name:
            return  # empty-name links are a separate (rarer) issue; not in the 12
        low = name.lower().strip(" .:!→–—>»")
        if low in VAGUE_NAMES or BARE_URL.match(name):
            self.add("LINK_VAGUE", f'link text "{name[:60]}" -> {(a.get("href") or "")[:50]}',
                     lk["line"])

    # ---- post-pass ----
    def finish(self):
        # deferred label resolution
        kept = []
        for f in self.findings:
            if f["cat"] == "_MAYBE_LABEL":
                if not f["detail"] or f["detail"] not in self.label_for:
                    kept.append({**f, "cat": "INPUT_NO_LABEL",
                                 "msg": f["msg"] + " has no label/aria-label/aria-labelledby"})
            elif f["cat"] == "_IDREF":
                missing = [t for t in f["detail"].split() if t not in self.ids]
                if missing:
                    kept.append({**f, "cat": "ARIA_INVALID",
                                 "msg": f['msg'] + f"=\"{f['detail']}\" -> no element with id "
                                                   f"{', '.join(missing)}"})
            else:
                kept.append(f)
        self.findings = kept

        # 6. lang
        if self.saw_html and not (self.lang or "").strip():
            self.findings.append({"page": self.rel, "cat": "HTML_NO_LANG", "line": 1,
                                  "msg": "<html> has no lang attribute", "detail": None})

        # 5. h1 count + heading order
        if self.h1 != 1:
            self.findings.append({"page": self.rel, "cat": "H1_COUNT", "line": 1,
                                  "msg": f"page has {self.h1} <h1> elements (want exactly 1)",
                                  "detail": None})
        prev = None
        for lvl, text, line in self.headings:
            if prev is not None and lvl > prev + 1:
                self.findings.append({
                    "page": self.rel, "cat": "HEADING_SKIP", "line": line,
                    "msg": f"h{prev} -> h{lvl} skips h{prev+1} "
                           f"(\"{' '.join(text.split())[:45]}\")", "detail": None})
            prev = lvl

        # 7. skip link
        skip = None
        for href, line, a in self.skiplinks:
            cls = (a.get("class") or "").lower()
            txt = (a.get("aria-label") or "").lower()
            if "skip" in cls or "skip" in txt:
                skip = (href, line)
                break
        if skip is None:
            # fall back: first in-page anchor whose target is main-ish
            for href, line, a in self.skiplinks:
                if href.lower() in ("#main", "#content", "#main-content"):
                    skip = (href, line)
                    break
        if skip is None:
            # Standalone printable documents (the template pack) ship no nav at
            # all, so there is nothing for a skip link to skip. Only flag pages
            # that actually make a keyboard user tab through navigation first.
            if self.nav_links >= 2:
                self.findings.append({"page": self.rel, "cat": "SKIP_LINK", "line": 1,
                                      "msg": f"no skip link, but {self.nav_links} nav links "
                                             f"precede the content", "detail": None})
        elif skip[0][1:] not in self.ids:
            self.findings.append({"page": self.rel, "cat": "SKIP_LINK", "line": skip[1],
                                  "msg": f"skip link targets {skip[0]} but no element has that id",
                                  "detail": None})

        # 11. viewport
        for content, line in self.viewports:
            c = content.lower().replace(" ", "")
            bad = []
            if "user-scalable=no" in c or "user-scalable=0" in c:
                bad.append("user-scalable=no")
            m = re.search(r"maximum-scale=([\d.]+)", c)
            if m:
                try:
                    if float(m.group(1)) < 2:
                        bad.append(f"maximum-scale={m.group(1)}")
                except ValueError:
                    pass
            if bad:
                self.findings.append({"page": self.rel, "cat": "VIEWPORT_NO_ZOOM", "line": line,
                                      "msg": "viewport blocks zoom: " + ", ".join(bad),
                                      "detail": content})
        return self.findings


def scan_file(path, overflow_cls):
    rel = os.path.relpath(path, PUB)
    src = open(path, encoding="utf-8", errors="replace").read()
    # page-local <style> blocks can also supply overflow containers
    local = set(overflow_cls)
    for m in re.finditer(r"<style[^>]*>(.*?)</style>", src, re.S | re.I):
        local |= overflow_classes(m.group(1))
    p = PageScanner(rel, local)
    try:
        p.feed(src)
        p.close()
    except Exception as e:  # never let one malformed page kill the run
        p.findings.append({"page": rel, "cat": "ARIA_INVALID", "line": 0,
                           "msg": f"parser error: {e}", "detail": None})
    return p.finish()


# ---------------------------------------------------------------------------
# contrast audit
# ---------------------------------------------------------------------------
FG_TOKENS = ["--ink", "--bone", "--muted", "--faint", "--gold", "--gold-2",
             "--gold-dim", "--ok", "--warn", "--bad"]
BG_TOKENS = ["--bg", "--bg2", "--panel", "--panel2"]

# where each foreground token is actually used for text, and at what size.
# Populated from site.css; this table records the *smallest* font-size found so
# the strictest threshold applies.
LARGE_TEXT_PT = 18.0        # 24px normal
LARGE_TEXT_BOLD_PT = 14.0   # ~18.66px bold


def px_of(value, root_px=16.0):
    if not value:
        return None
    v = value.strip().lower()
    m = re.search(r"clamp\(\s*([\d.]+)px", v)     # clamp() min is the phone size
    if m:
        return float(m.group(1))
    m = re.fullmatch(r"([\d.]+)px", v)
    if m:
        return float(m.group(1))
    m = re.fullmatch(r"([\d.]+)r?em", v)
    if m:
        return float(m.group(1)) * root_px
    m = re.search(r"max\(\s*([\d.]+)px", v)
    if m:
        return float(m.group(1))
    return None


def contrast_report(css_text):
    vars_ = parse_root_vars(css_text)
    resolved = {}
    for k in set(FG_TOKENS + BG_TOKENS
                 + ["--line", "--line-soft", "--line-control", "--glow"]):
        if k in vars_:
            c = parse_color(resolve_var(vars_[k], vars_))
            if c:
                resolved[k] = c

    bg_rgb = {}
    for k in BG_TOKENS:
        if k in resolved:
            rgb, a = resolved[k]
            bg_rgb[k] = rgb if a >= 1 else composite(resolved[k], resolved["--bg"][0])

    # --- where is each fg token used as text, and at what size ---
    usage = {}   # token -> list of (selector, px, bold)
    body_px = px_of(resolve_var(vars_.get("--t-body", "16px"), vars_)) or 16.0
    for sel, decls in iter_css_rules(css_text):
        col = decls.get("color")
        if not col:
            continue
        m = re.search(r"var\(\s*(--[\w-]+)", col)
        token = m.group(1) if m else None
        if token not in FG_TOKENS:
            continue
        fs = decls.get("font-size")
        px = px_of(resolve_var(fs, vars_)) if fs else None
        if px is None:
            px = body_px
        # inherit from a sibling rule that only sets font-size on the same class
        weight = decls.get("font-weight", "")
        bold = weight in ("bold", "600", "700", "800", "900")
        usage.setdefault(token, []).append((sel, px, bold))

    # a token's own declared surface, when the rule sets one
    rows = []
    for fg in FG_TOKENS:
        if fg not in resolved:
            continue
        frgb, fa = resolved[fg]
        uses = usage.get(fg, [])
        min_px = min([u[1] for u in uses], default=body_px)
        any_bold = any(u[2] for u in uses)
        pt = min_px * 0.75
        large = pt >= LARGE_TEXT_PT or (any_bold and pt >= LARGE_TEXT_BOLD_PT)
        need = 3.0 if large else 4.5
        for bgt in BG_TOKENS:
            if bgt not in bg_rgb:
                continue
            f = frgb if fa >= 1 else composite(resolved[fg], bg_rgb[bgt])
            ratio = contrast(f, bg_rgb[bgt])
            rows.append({
                "fg": fg, "fg_hex": hexs(frgb), "bg": bgt, "bg_hex": hexs(bg_rgb[bgt]),
                "ratio": round(ratio, 2), "min_px": min_px, "large": large,
                "need": need, "pass": ratio >= need,
                "pass_aa_body": ratio >= 4.5, "pass_aa_large": ratio >= 3.0,
                "uses": len(uses),
                "selectors": sorted({u[0] for u in uses})[:6],
            })

    # --- non-text / UI component contrast ---
    # WCAG 1.4.11 applies to "visual information required to identify UI
    # components and states" — i.e. the boundary of a control a user must find
    # and operate. Purely decorative rules, card edges and table hairlines carry
    # no such information and have NO ratio requirement; scoring them 3:1 would
    # be a false failure, so they are reported for information only.
    ui = []
    for name, need, note in [
            ("--gold", 3.0, "focus-visible outline (2px solid var(--gold))"),
            ("--gold-2", 3.0, ".btn:focus-visible outline"),
            ("--line-control", 3.0, "input/textarea/select + icon-button boundaries"),
            ("--line", None, "decorative: card, nav and section rules (no 1.4.11 duty)"),
            ("--line-soft", None, "decorative: table row + panel hairlines (no 1.4.11 duty)")]:
        if name not in resolved:
            continue
        rgb, a = resolved[name]
        # Control borders must clear 3:1 against whatever sits on each side; the
        # input fill (--bg2) is the tighter of the two, so score against that.
        base = bg_rgb.get("--bg2" if name == "--line-control" else "--bg")
        flat = rgb if a >= 1 else composite(resolved[name], base)
        r = contrast(flat, base)
        ui.append({"token": name, "flat_hex": hexs(flat), "ratio": round(r, 2),
                   "need": need, "pass": None if need is None else r >= need,
                   "note": note})

    # --- gold-on-gold: the .btn-gold pill puts --bg text on a gold gradient ---
    special = []
    if "--gold" in resolved and "--bg" in resolved:
        g = resolved["--gold"][0]
        for stop, lbl in [(resolved["--gold"][0], "--gold"), (resolved["--gold-2"][0], "--gold-2")]:
            r = contrast(bg_rgb["--bg"], stop)
            special.append({"pair": f"--bg text on {lbl} (.btn-gold / .skip-link)",
                            "ratio": round(r, 2), "need": 4.5, "pass": r >= 4.5})
    if "--gold" in resolved:
        r = contrast(bg_rgb["--bg"], resolved["--gold-dim"][0])
        special.append({"pair": "--bg text on --gold-dim (gradient tail of .btn-gold)",
                        "ratio": round(r, 2), "need": 4.5, "pass": r >= 4.5})
    return {"vars": {k: hexs(v[0]) + (f" @{v[1]}" if v[1] < 1 else "")
                     for k, v in resolved.items()},
            "rows": rows, "ui": ui, "special": special}


def suggest_fix(fg_rgb, bg_rgb, need):
    """Lightest-touch fix: keep hue+saturation, walk lightness until it passes."""
    import colorsys
    r, g, b = [c / 255 for c in fg_rgb]
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    bl = luminance(bg_rgb)
    up = bl < 0.18  # dark backdrop -> lighten the text
    step = 0.005
    for i in range(1, 400):
        nl = min(1.0, l + step * i) if up else max(0.0, l - step * i)
        nr, ng, nb = colorsys.hls_to_rgb(h, nl, s)
        cand = (round(nr * 255), round(ng * 255), round(nb * 255))
        if contrast(cand, bg_rgb) >= need:
            return cand, round(contrast(cand, bg_rgb), 2), round((nl - l) * 100, 1)
        if nl in (0.0, 1.0):
            break
    return None, None, None


# ---------------------------------------------------------------------------
# reporting
# ---------------------------------------------------------------------------
def group_for_page(page):
    if page.startswith("guides/"):
        return "guides/ (generated by tools/guides/engine.py)"
    if page.startswith("writing/"):
        return "writing/ (generated by tools/writing/engine.py)"
    if page.startswith("glossary/"):
        return "glossary/ (generated by tools/glossary/)"
    if page.startswith("apps/"):
        return "apps/ (PWAs)"
    if page.startswith("templates/"):
        return "templates/ (product downloads)"
    return "root pages"


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--full", action="store_true", help="print every finding")
    ap.add_argument("--by-page", action="store_true", help="group findings by page")
    ap.add_argument("--contrast", action="store_true", help="contrast section only")
    ap.add_argument("--no-contrast", action="store_true")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--only", default="", help="comma-separated category filter")
    ap.add_argument("--page", default="", help="glob against the path relative to public/")
    ap.add_argument("--limit", type=int, default=8, help="examples per category in summary")
    ap.add_argument("--fail-on", default="", help="exit 1 if any of these categories has findings")
    args = ap.parse_args()

    css_text = open(CSS, encoding="utf-8").read() if os.path.exists(CSS) else ""
    ov = overflow_classes(css_text)

    files = sorted(glob.glob(os.path.join(PUB, "**", "*.html"), recursive=True))
    files = [f for f in files if os.path.basename(f) not in SKIP_FILES]
    if args.page:
        files = [f for f in files
                 if fnmatch.fnmatch(os.path.relpath(f, PUB), args.page)
                 or fnmatch.fnmatch(os.path.relpath(f, PUB), args.page + "*")]

    findings = []
    if not args.contrast:
        for f in files:
            findings.extend(scan_file(f, ov))

    only = {c.strip().upper() for c in args.only.split(",") if c.strip()}
    if only:
        findings = [f for f in findings if f["cat"] in only]

    con = contrast_report(css_text) if css_text and not args.no_contrast else None

    if args.json:
        print(json.dumps({"files": len(files), "findings": findings, "contrast": con},
                         indent=2))
        return 0

    counts = {}
    for f in findings:
        counts[f["cat"]] = counts.get(f["cat"], 0) + 1

    if not args.contrast:
        print(f"a11y_audit — {len(files)} HTML files under public/\n")
        print(f"{'CATEGORY':<20} {'SEV':<5} {'COUNT':>6}  {'PAGES':>6}")
        print("-" * 72)
        total = 0
        for cat, (sev, desc) in CATEGORIES.items():
            n = counts.get(cat, 0)
            pages = len({f["page"] for f in findings if f["cat"] == cat})
            total += n
            flag = "" if n == 0 else ("  <-- " + desc if n else "")
            print(f"{cat:<20} {sev:<5} {n:>6}  {pages:>6}{flag}")
        print("-" * 72)
        print(f"{'TOTAL':<20} {'':<5} {total:>6}\n")

        if args.by_page:
            bygroup = {}
            for f in findings:
                bygroup.setdefault(group_for_page(f["page"]), {}).setdefault(f["page"], []).append(f)
            sev_rank = {"high": 0, "med": 1, "low": 2}
            for grp in sorted(bygroup, key=lambda g: -sum(len(v) for v in bygroup[g].values())):
                pages = bygroup[grp]
                print(f"\n=== {grp} — {sum(len(v) for v in pages.values())} findings "
                      f"across {len(pages)} pages ===")
                for page in sorted(pages, key=lambda p: -len(pages[p])):
                    fs = sorted(pages[page],
                                key=lambda f: (sev_rank[CATEGORIES[f['cat']][0]], f["line"]))
                    print(f"\n  {page}  ({len(fs)})")
                    for f in fs[:40]:
                        print(f"    [{CATEGORIES[f['cat']][0]:>4}] L{f['line']:<5} "
                              f"{f['cat']:<18} {f['msg'][:92]}")
                    if len(fs) > 40:
                        print(f"    ... {len(fs)-40} more")
        elif args.full:
            for f in sorted(findings, key=lambda f: (f["cat"], f["page"], f["line"])):
                print(f"{f['cat']:<18} {f['page']}:{f['line']}  {f['msg']}")
        else:
            for cat in CATEGORIES:
                fs = [f for f in findings if f["cat"] == cat]
                if not fs:
                    continue
                print(f"\n--- {cat} ({len(fs)}) — {CATEGORIES[cat][1]}")
                for f in fs[:args.limit]:
                    print(f"    {f['page']}:{f['line']}  {f['msg'][:100]}")
                if len(fs) > args.limit:
                    print(f"    ... {len(fs)-args.limit} more (--full / --by-page)")

    # ---- contrast ----
    if con:
        print("\n" + "=" * 78)
        print("WCAG CONTRAST — computed from public/css/site.css custom properties")
        print("=" * 78)
        print("tokens: " + ", ".join(f"{k}={v}" for k, v in sorted(con["vars"].items())))
        print(f"\n{'FOREGROUND':<12} {'ON':<9} {'RATIO':>7} {'NEED':>6} {'MIN-PX':>7}  RESULT")
        print("-" * 78)
        fails = []
        for r in con["rows"]:
            if r["uses"] == 0 and r["bg"] != "--bg":
                continue
            verdict = "PASS" if r["pass"] else "FAIL"
            if not r["pass"]:
                fails.append(r)
            print(f"{r['fg']:<12} {r['bg']:<9} {r['ratio']:>7} {r['need']:>6} "
                  f"{r['min_px']:>7.0f}  {verdict}"
                  f"{'' if r['pass'] else '  *** ' + ('AA body' if r['need']==4.5 else 'AA large')}")
        print("\nNON-TEXT / UI COMPONENT CONTRAST (WCAG 1.4.11 — controls need 3:1)")
        print("-" * 78)
        for u in con["ui"]:
            need = "  n/a" if u["need"] is None else f"{u['need']:>6}"
            verdict = "info" if u["pass"] is None else ("PASS" if u["pass"] else "FAIL")
            print(f"{u['token']:<14} {u['flat_hex']:<9} {u['ratio']:>7} {need} "
                  f"  {verdict:<4}  {u['note']}")
        print("\nSPECIFIC COMPONENT PAIRS")
        print("-" * 78)
        for s in con["special"]:
            print(f"{s['ratio']:>7} / {s['need']}  {'PASS' if s['pass'] else 'FAIL'}   {s['pair']}")

        if fails:
            print("\nPROPOSED MINIMUM FIXES (hue + saturation preserved, lightness only)")
            print("-" * 78)
            seen = set()
            for r in fails:
                key = (r["fg"], r["bg"])
                if key in seen:
                    continue
                seen.add(key)
                fg = parse_color(r["fg_hex"])[0]
                bg = parse_color(r["bg_hex"])[0]
                cand, newr, dl = suggest_fix(fg, bg, r["need"])
                if cand:
                    print(f"{r['fg']:<12} {r['fg_hex']} -> {hexs(cand)}  "
                          f"{r['ratio']} -> {newr} on {r['bg']}  (lightness {dl:+.1f}%)")
                    if r["selectors"]:
                        print(f"             used by: {', '.join(r['selectors'][:4])}")
                else:
                    print(f"{r['fg']:<12} {r['fg_hex']}  no in-hue fix reaches {r['need']}:1 "
                          f"on {r['bg']} — change the surface or the size instead")

    if args.fail_on:
        want = {c.strip().upper() for c in args.fail_on.split(",")}
        if any(counts.get(c) for c in want):
            return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
