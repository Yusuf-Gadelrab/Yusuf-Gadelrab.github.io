"""Pre-deploy checks: JSON-LD parses, titles/descriptions in range, internal links resolve."""
import glob, json, os, re, sys, html as H
ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
PUB = os.path.join(ROOT, "public")
SKIP = {"404.html", "offline.html", "googlebb78e2fba04aed48.html"}
files = sorted(glob.glob(os.path.join(PUB, "*.html")) + glob.glob(os.path.join(PUB, "guides", "*.html"))
               + glob.glob(os.path.join(PUB, "apps", "*", "index.html")))
bad = []
blocks = 0
for f in files:
    rel = os.path.relpath(f, PUB)
    if os.path.basename(f) in SKIP: continue
    s = open(f, encoding="utf-8").read()
    for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', s, re.S):
        blocks += 1
        try: json.loads(m.group(1))
        except Exception as e: bad.append(f"{rel}: invalid JSON-LD ({str(e)[:50]})")
    t = re.search(r"<title>(.*?)</title>", s, re.S)
    if not t: bad.append(f"{rel}: no <title>")
    elif len(H.unescape(t.group(1))) > 60: bad.append(f"{rel}: title {len(H.unescape(t.group(1)))} chars")
    d = re.search(r'<meta name="description" content="(.*?)"', s, re.S)
    if not d: bad.append(f"{rel}: no meta description")
    elif len(H.unescape(d.group(1))) > 160: bad.append(f"{rel}: description {len(H.unescape(d.group(1)))} chars")
    if "https://yusuf-gadelrab.github.io/#person" not in s: bad.append(f"{rel}: no canonical #person entity")
    if s.count("<h1") != 1: bad.append(f"{rel}: {s.count('<h1')} h1 tags")
    if "<link rel=\"canonical\"" not in s: bad.append(f"{rel}: no canonical link")
    for href in set(re.findall(r'href="(/[^"#?]*)"', s)):
        tgt = os.path.join(PUB, href.lstrip("/"))
        if href.endswith("/"): tgt = os.path.join(tgt, "index.html")
        if not os.path.exists(tgt) and not href.startswith("/mailto"):
            bad.append(f"{rel}: dead internal link {href}")
print(f"{len(files)} pages, {blocks} JSON-LD blocks")
if bad:
    print(f"\n{len(bad)} issues:"); [print(" -", b) for b in bad[:60]]
    sys.exit(1)
print("all checks passed")
