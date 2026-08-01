#!/usr/bin/env python3
"""SERP click-through audit: title/description/OG/heading hygiene for every page under public/.

Usage:
  python3 tools/meta_audit.py            # summary + flagged pages
  python3 tools/meta_audit.py --all      # every page, flagged or not
  python3 tools/meta_audit.py --owned    # only the pages this pass owns (root + writing + apps + templates)
  python3 tools/meta_audit.py --json     # machine-readable
  python3 tools/meta_audit.py --scope guides
"""
import argparse, glob, html as H, json, os, re, sys
from collections import defaultdict

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
PUB = os.path.join(ROOT, "public")

# Pages that are intentionally not indexed / not marketing surfaces.
SKIP = {
    "404.html", "offline.html", "googlebb78e2fba04aed48.html",
}

TITLE_MAX, TITLE_MIN = 60, 30
DESC_MAX, DESC_MIN = 160, 70

# Descriptions must read like a promise, not a label: a finite verb + a reason to click.
# Participles used as adjectives ("Documented transformation") deliberately do NOT count —
# a noun-phrase description is a label, and labels underperform on SERP click-through.
VERBS = re.compile(
    r"\b(is|are|was|were|be|been|has|have|had|can|will|does|do|did|"
    r"get|gets|got|give|gives|gave|built|build|builds|ship|ships|run|runs|ran|"
    r"see|sees|read|reads|download|downloads|scan|scans|find|finds|found|track|tracks|"
    r"use|uses|make|makes|turn|turns|cut|cuts|save|saves|show|shows|score|scores|"
    r"hire|hires|write|writes|wrote|learn|learns|copy|steal|start|starts|open|opens|"
    r"check|checks|fix|fixes|answer|answers|cover|covers|include|includes|"
    r"explain|explains|walk|walks|break|breaks|prove|proves|take|takes|took|"
    r"work|works|need|needs|want|wants|log|logs|pick|picks|catch|catches|"
    r"send|sends|price|prices|pay|pays|cost|costs|charge|charges|teach|teaches|taught|"
    r"replace|replaces|beat|beats|keep|keeps|kept|hold|holds|stop|stops|kill|kills|killed|"
    r"tell|tells|ask|asks|lets|let|means|mean|comes|come|goes|go|lives|live|"
    r"handle|handles|flag|flags|audit|audits|plan|plans|apply|applies|"
    r"sit|sits|stay|stays|leave|leaves|left|match|matches|rewrite|rewrites|"
    r"generate|generates|automate|automates|export|exports|import|imports|"
    r"install|installs|deploy|deploys|test|tests|measure|measures|compare|compares|"
    r"trade|trades|sell|sells|buy|buys|earn|earns|owe|owes|file|files|refund|refunds|"
    r"try|tries|browse|book|books|reach|reaches|store|stores|collect|collects|"
    r"sourced|verified|priced|reads)\b", re.I)
# Something that gives a reason to click: an imperative, a number, or a named artifact.
CTA = re.compile(
    r"(\b\d|\bfree\b|\bno\b|\bhow\b|\bwhy\b|\bwhat\b|\bsee\b|\bread\b|\bget\b|\bdownload\b|"
    r"\bcopy\b|\bsteal\b|\bstart\b|\bhire\b|\btry\b|\brun\b|\bopen\b|\bscan\b|\bbuild\b|"
    r"\bcheck\b|\blearn\b|\bbook\b|\bapply\b|\buse\b|\bfix\b|\bship\b|\bbrowse\b|\bexplore\b)", re.I)

STOP = {"the", "a", "an", "and", "of", "for", "to", "in", "on", "with", "html", "index", "my", "your"}


def txt(s):
    """Strip tags + unescape, collapse whitespace."""
    s = re.sub(r"<[^>]+>", "", s)
    return re.sub(r"\s+", " ", H.unescape(s)).strip()


def meta(src, attr, key):
    m = re.search(r'<meta\s+%s=["\']%s["\']\s+content=["\'](.*?)["\']\s*/?>' % (attr, re.escape(key)), src, re.S | re.I)
    if not m:
        m = re.search(r'<meta\s+content=["\'](.*?)["\']\s+%s=["\']%s["\']' % (attr, re.escape(key)), src, re.S | re.I)
    return H.unescape(re.sub(r"\s+", " ", m.group(1)).strip()) if m else None


def slug_keywords(rel):
    """Primary keyword tokens implied by the URL slug."""
    base = os.path.basename(os.path.dirname(rel)) if os.path.basename(rel) == "index.html" else os.path.basename(rel)
    base = base.replace(".html", "")
    parts = [p for p in re.split(r"[-_]", base.lower()) if p and p not in STOP]
    return parts


def scope_of(rel):
    if rel.startswith("guides/"):
        return "guides"
    if rel.startswith("writing/"):
        return "writing"
    if rel.startswith("apps/"):
        return "apps"
    if rel.startswith("templates/"):
        return "templates"
    if rel.startswith("aurum/") or rel.startswith("projects/") or rel.startswith("codeswitch/"):
        return "spa"
    return "root"


OWNED = {"root", "writing", "apps", "templates"}


def headings(src):
    """Ordered list of (level, text) for h1..h6, body only, ignoring template/noscript."""
    body = src
    m = re.search(r"<body[^>]*>(.*)</body>", src, re.S | re.I)
    if m:
        body = m.group(1)
    body = re.sub(r"<template[^>]*>.*?</template>", "", body, flags=re.S | re.I)
    body = re.sub(r"<noscript[^>]*>.*?</noscript>", "", body, flags=re.S | re.I)
    body = re.sub(r"<script[^>]*>.*?</script>", "", body, flags=re.S | re.I)
    out = []
    for mm in re.finditer(r"<h([1-6])\b[^>]*>(.*?)</h\1>", body, re.S | re.I):
        out.append((int(mm.group(1)), txt(mm.group(2))))
    return out


def audit_file(path):
    rel = os.path.relpath(path, PUB).replace(os.sep, "/")
    src = open(path, encoding="utf-8").read()
    t = re.search(r"<title>(.*?)</title>", src, re.S)
    title = txt(t.group(1)) if t else None
    desc = meta(src, "name", "description")
    r = {
        "file": rel,
        "scope": scope_of(rel),
        "title": title,
        "title_len": len(title) if title else 0,
        "desc": desc,
        "desc_len": len(desc) if desc else 0,
        "og_title": meta(src, "property", "og:title") or meta(src, "name", "og:title"),
        "og_desc": meta(src, "property", "og:description") or meta(src, "name", "og:description"),
        "tw_title": meta(src, "name", "twitter:title") or meta(src, "property", "twitter:title"),
        "tw_desc": meta(src, "name", "twitter:description") or meta(src, "property", "twitter:description"),
        "flags": [],
    }
    hs = headings(src)
    h1s = [h for lvl, h in hs if lvl == 1]
    r["h1"] = h1s
    f = r["flags"]

    if not title:
        f.append("TITLE_MISSING")
    else:
        if r["title_len"] > TITLE_MAX:
            f.append(f"TITLE_LONG({r['title_len']})")
        elif r["title_len"] < TITLE_MIN:
            f.append(f"TITLE_SHORT({r['title_len']})")
        kws = slug_keywords(rel)
        low = title.lower()
        if kws and not any(k in low or k.rstrip("s") in low for k in kws):
            f.append("TITLE_NO_KEYWORD(%s)" % "/".join(kws))

    if not desc:
        f.append("DESC_MISSING")
    else:
        if r["desc_len"] > DESC_MAX:
            f.append(f"DESC_LONG({r['desc_len']})")
        elif r["desc_len"] < DESC_MIN:
            f.append(f"DESC_SHORT({r['desc_len']})")
        if not VERBS.search(desc):
            f.append("DESC_NO_VERB")
        if not CTA.search(desc):
            f.append("DESC_NO_HOOK")
        if title and desc.lower().startswith(title.lower()[:28]):
            f.append("DESC_ECHOES_TITLE")
        if desc.endswith(("...", "…")) or (len(desc) > DESC_MAX - 2 and not desc.endswith((".", "!", "?"))):
            f.append("DESC_TRUNCATED")

    if not r["og_title"]:
        f.append("OG_TITLE_MISSING")
    if not r["og_desc"]:
        f.append("OG_DESC_MISSING")
    if not r["tw_title"]:
        f.append("TW_TITLE_MISSING")
    if not r["tw_desc"]:
        f.append("TW_DESC_MISSING")

    if len(h1s) == 0:
        f.append("H1_MISSING")
    elif len(h1s) > 1:
        f.append(f"H1_MULTIPLE({len(h1s)})")
    elif title and h1s[0].strip() == title.strip():
        f.append("H1_EQUALS_TITLE")

    # heading hierarchy: no level jumps > 1 going down
    prev = None
    jumps = []
    for lvl, text in hs:
        if prev is not None and lvl > prev + 1:
            jumps.append(f"h{prev}->h{lvl}:{text[:34]}")
        prev = lvl
    if jumps:
        f.append("HEAD_SKIP(%s)" % "; ".join(jumps[:3]))
    return r


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--owned", action="store_true")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--scope", default=None)
    a = ap.parse_args()

    files = sorted(p for p in glob.glob(os.path.join(PUB, "**", "*.html"), recursive=True)
                   if os.path.basename(p) not in SKIP)
    rows = [audit_file(p) for p in files]
    if a.scope:
        rows = [r for r in rows if r["scope"] == a.scope]
    if a.owned:
        rows = [r for r in rows if r["scope"] in OWNED]

    # duplicates
    for key, flag in (("title", "TITLE_DUPLICATE"), ("desc", "DESC_DUPLICATE")):
        seen = defaultdict(list)
        for r in rows:
            if r[key]:
                seen[r[key].strip().lower()].append(r)
        for v, group in seen.items():
            if len(group) > 1:
                names = ",".join(g["file"] for g in group)
                for g in group:
                    g["flags"].append(f"{flag}[{names}]")

    if a.json:
        print(json.dumps(rows, indent=1))
        return 0

    counts = defaultdict(int)
    for r in rows:
        for fl in r["flags"]:
            counts[re.sub(r"[(\[].*", "", fl)] += 1

    flagged = [r for r in rows if r["flags"]]
    show = rows if a.all else flagged
    for r in show:
        print(f"\n{r['file']}  [{r['scope']}]")
        print(f"  title({r['title_len']}): {r['title']}")
        print(f"  desc ({r['desc_len']}): {r['desc']}")
        if r["h1"]:
            print(f"  h1: {r['h1'][0][:80]}")
        for fl in r["flags"]:
            print(f"  ! {fl}")

    print("\n" + "=" * 64)
    print(f"pages audited: {len(rows)}   clean: {len(rows) - len(flagged)}   flagged: {len(flagged)}")
    for k in sorted(counts, key=lambda x: -counts[x]):
        print(f"  {counts[k]:>4}  {k}")
    by_scope = defaultdict(lambda: [0, 0])
    for r in rows:
        by_scope[r["scope"]][0] += 1
        if r["flags"]:
            by_scope[r["scope"]][1] += 1
    print("  --- by scope (total/flagged) ---")
    for s in sorted(by_scope):
        print(f"  {s:>10}: {by_scope[s][0]:>3} / {by_scope[s][1]}")
    return 1 if flagged else 0


if __name__ == "__main__":
    sys.exit(main())
