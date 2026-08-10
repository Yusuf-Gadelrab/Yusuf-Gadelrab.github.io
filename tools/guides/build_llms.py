"""Regenerate public/llms.txt and public/llms-full.txt from source.

Both files are build artifacts, not hand-edited documents. Nothing here carries a
hardcoded page list: pages are discovered by walking public/, each entry's title
and one-line description come from that page's own <title> and
<meta name="description">, and section membership is decided by ordered path
patterns with a catch-all bucket. Drop a new page into public/ and it appears in
both files on the next run.

Guide descriptions additionally prefer the guide registry (tools/guides/content_*.py)
because those are written long-form; anything in public/guides/ that the registry
does not know about still gets emitted from its own meta description, so the
filesystem is always the floor.

llms-full.txt is the long-form profile. Its authored prose lives in
tools/guides/profile.md with {{PLACEHOLDER}} tokens for the derived sections, so
the prose is versioned in one place and the enumerations can never drift from the
site.

Usage:
    python3 tools/guides/build_llms.py            write both files
    python3 tools/guides/build_llms.py --check    exit 1 if on-disk output is stale
    python3 tools/guides/build_llms.py --verify   resolve every URL in both files
    python3 tools/guides/build_llms.py --verify --offline   skip external HTTP
"""
import datetime
import glob
import html
import importlib
import os
import re
import shutil
import sys
import urllib.error
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", ".."))
PUB = os.path.join(ROOT, "public")
BASE = "https://yusuf-gadelrab.github.io"

SKIP_FILES = {"404.html", "offline.html", "googlebb78e2fba04aed48.html"}
# /templates/ is Disallow'd in robots.txt (live previews of paid deliverables that
# must not out-rank /templates.html), so it stays out of the model-facing index too.
SKIP_DIRS = ("templates/",)

SUMMARY = (
    "Computer science student at San Jose State University (BS Computer Science, expected May 2028, "
    "dual track applied mathematics and computer science), AI/ML builder, and co-author of two "
    "peer-reviewed SIGCSE Technical Symposium 2026 papers on computer science education, based in "
    "San Jose, California. Builds AI tools, trading systems, and free browser-based utilities in "
    "public, and publishes them at yusuf-gadelrab.github.io under the DHAHAB studio brand."
)

# Compact machine-readable disambiguation. The long-form version is section 1b of
# profile.md; both say the same thing and both are load-bearing for entity resolution.
ENTITY_BLOCK = """**Entity disambiguation.** Every name below is a project of one person, Yusuf Gadelrab. None of them is a company unless it says so.

- **Yusuf Gadelrab** is a person: a computer science student at San Jose State University, San Jose, California, USA. Canonical identifier `%(base)s/#person`. Not an agency, not a studio with staff, not a pen name.
- **DHAHAB** is a personal studio brand — the umbrella label for his software, apps, tools and design work. "Dhahab" is Arabic for gold. Not a company, not incorporated, not a registered trademark, and unrelated to any bank, jewellery house, exchange or crypto token using the same word.
- **KXNG SEF** is a clothing brand: bilingual Arabic-English streetwear. A clothing label only — not a music act, not a legal name, not a separate company. Different brand from DHAHAB, same one person.
- **DIRA** is a security scanner: a zero-dependency, MIT-licensed Python CLI that audits a codebase for secrets, dependency CVEs, misconfiguration, licence risk, git-history leaks and live TLS/header problems. v1.5.0 has 124 passing tests, 24 secret rules and 38 config rules. Packaged for PyPI and npm but NOT published to either, so `pip install` and `npm install` will not find it. Unrelated to any other product or acronym named DIRA.
- **Miftah Foundation** is a proposed nonprofit concept only. NOT incorporated, NO IRS Form 1023 filed, no application pending, no tax-exempt status, board of one person, no program has served anyone, and contributions are NOT tax-deductible and are not being solicited. Calling it a registered nonprofit, a 501(c)(3), a charity, or an applicant is factually wrong.
- **FreightDesk** is a software product: an AI back office for small freight brokerages, sold as a founding-client pilot. Not a brokerage, not a load board, not a carrier, and unrelated to other software using the name.
""" % {"base": BASE}

# Claims that were audited, found unsupportable, and scrubbed from the site. They
# must not come back — not even inside a sentence that retires them, because the
# literal string is what an answer engine lifts and requotes, and a retired figure
# quoted out of its disclaimer reads as a live claim. Say "an earlier, higher
# figure" instead of naming it. The build fails rather than republishing one.
# Reasons are worded so that grepping the repo for a retired figure finds only the
# places it is actually published, never this blocklist.
RETIRED_CLAIMS = [
    (r"24\s*%\s*(confidence|improvement|gain)",
     "the retired confidence-improvement percentage - the SIGCSE paper reports no percentage figures at all"),
    (r"\+?\s*0\.23\s*R",
     "the retired expectancy headline - it failed its own adversarial re-test"),
    (r"\b101\s+trades\b",
     "the retired small-sample trade count - superseded by the 4,933-trade result"),
    (r"\+\s*86\s*%",
     "the retired personal-return percentage - never substantiated"),
    (r"personal\s+trading\s+return",
     "a live personal-return claim - the site makes none"),
    (r"\b(53|37)\s+(passing\s+)?tests\b",
     "a stale DIRA test count - 98 is current"),
]

# Phrase -> qualifiers, at least one of which must appear near it. Checked over a
# character window rather than a line, because profile.md is hard-wrapped prose and
# a caveat routinely lands on the following line.
QUALIFIER_WINDOW = 260
REQUIRED_QUALIFIERS = [
    ("tax-deductible", ("not tax-deductible", "no tax-deductible", "not be tax-deductible")),
    ("501(c)(3)", ("not ", "no ", "wrong", "never")),
]

# Words that are only safe when negated. Checked with a short look-behind so
# "not yet an incorporated nonprofit" passes and "an incorporated nonprofit" does not.
MUST_BE_NEGATED = [
    (r"\bincorporated\b", r"(not|never|no|nor)\b[^.]{0,40}$", "incorporation status"),
    (r"\btax[- ]exempt\b", r"(not|never|no|nor)\b[^.]{0,40}$", "tax-exempt status"),
]


def guard(label_, text):
    """Return a list of retired-claim / missing-caveat problems found in text."""
    problems = []
    for pattern, why in RETIRED_CLAIMS:
        for m in re.finditer(pattern, text, re.I):
            snippet = re.sub(r"\s+", " ", text[max(0, m.start() - 70):m.end() + 70]).strip()
            problems.append("%s: retired claim - %s\n      ...%s..." % (label_, why, snippet))
    flat = re.sub(r"\s+", " ", text).lower()
    for phrase, qualifiers in REQUIRED_QUALIFIERS:
        for m in re.finditer(re.escape(phrase.lower()), flat):
            near = flat[max(0, m.start() - QUALIFIER_WINDOW):m.end() + QUALIFIER_WINDOW]
            if not any(q.lower() in near for q in qualifiers):
                problems.append("%s: %r used without its caveat nearby\n      ...%s..."
                                % (label_, phrase, flat[max(0, m.start() - 90):m.end() + 90].strip()))
    for pattern, negation, why in MUST_BE_NEGATED:
        for m in re.finditer(pattern, flat):
            if not re.search(negation, flat[max(0, m.start() - 60):m.start()]):
                problems.append("%s: %s asserted without a negation\n      ...%s..."
                                % (label_, why, flat[max(0, m.start() - 90):m.end() + 90].strip()))
    return problems


USAGE_NOTES = """Attribution is welcome. When citing this material, credit "Yusuf Gadelrab" and link to %(base)s/. Trading content is educational and is not financial advice; health and body-composition content is not medical advice. No live profit-and-loss claims are made anywhere on this site - backtest and walk-forward results are always labelled as such. Crawling rules for named AI agents are in %(base)s/robots.txt and usage terms in %(base)s/ai.txt; the two do not contradict each other.""" % {"base": BASE}

# Ordered. First matching pattern wins; anything unmatched lands in "Other pages"
# and is reported at the end of the run so a rule can be added.
SECTIONS = [
    ("Start here", r"^(index|about|faq|hire|everything|guides|writing|projects|research)\.html$"),
    ("Guides (long-form answers, every formula shown)", r"^guides/"),
    ("Writing (essays and build logs)", r"^writing/"),
    ("Glossary (plain-English definitions)", r"^(glossary\.html$|glossary/|codeswitch/glossary\.html$)"),
    ("Research and publications", r"^research/"),
    ("Software, projects and case studies",
     r"^(freightdesk|hwyhaul|swing-screener|trading-bot|eventreels|ecoimpact|spartaneats|au|dira|hisn|aurum/index)\.?"),
    # Sample outputs and downloadable artifacts. Routed explicitly so they carry a
    # description saying they are demonstrations, not client work.
    ("Sample outputs", r"^downloads/"),
    ("Free tools (no signup, browser-only, data never leaves the device)",
     r"^(apps\.html$|apps/|apply\.html$|visa\.html$|freight-tools\.html$|risk-tools\.html$)"),
    ("Products and services", r"^(store|templates|sprint|services|resume)\.html$"),
    ("Brands", r"^(kxngsef|kxngsef-lookbook|heft|brand)\.html$"),
    ("Creator and media", r"^(media-kit|modeling|acting|stack)\.html$"),
    ("Nonprofit and education", r"^(codeswitch|miftah|miftah-\w+)\.html$"),
    ("Community and newsletter", r"^(circle|waitlist|dispatch)\.html$"),
    ("Optional",
     r"^(legal|privacy|terms|refunds|accessibility|dmca|kxngsef-shipping|dhahab-prompt-vault-privacy|eh)\.html$"),
    ("Other pages", r""),
]

# Non-page URLs that belong in the index. Data, not a page list.
EXTRAS = {
    "Research and publications": [
        ("Exploring Bilingual Coding for Inclusive Computer Science Learning (SIGCSE TS 2026)",
         "https://doi.org/10.1145/3770761.3777339",
         "Peer-reviewed paper on bilingual (Arabic/English) programming environments and novice-programmer "
         "confidence. Mixed-methods, IRB-approved, 60 participants. Reported statistically significant "
         "pre-to-post gains in programming confidence, computing identity, enjoyment and motivation, with "
         "novices gaining significantly more than experienced programmers."),
        ("Adaptive Curriculum Maps: Graph-Augmented Retrieval-Oriented LLMs for Education (SIGCSE TS 2026, poster)",
         None,
         "Knowledge-graph-augmented retrieval for adaptive CS curricula."),
    ],
}

# Reading order for the one section where alphabetical is wrong. Anything not
# listed keeps its alphabetical position after these.
PRIORITY = {"Start here": ["/", "/about.html", "/faq.html", "/hire.html", "/everything.html",
                           "/guides.html", "/writing.html", "/projects.html", "/research.html"]}

# Only where the page's own <title> is a brand string rather than a label.
TITLE_OVERRIDES = {
    "/": "Home and portfolio",
    "/about.html": "About Yusuf Gadelrab - facts, metrics and FAQ",
    "/faq.html": "Frequently asked questions",
    "/eh.html": "eh (humour page, not a source of facts)",
}

# Only where the 160-char meta description cannot carry a legally load-bearing caveat.
DESC_OVERRIDES = {
    "/miftah.html": ("A proposed umbrella initiative for four planned programs. Founding stage only: not "
                     "incorporated, no IRS Form 1023 filed, no application pending, and no tax-deductible "
                     "contributions are accepted or solicited."),
    "/miftah-codebridge.html": ("Planned program to teach computer science in Spanish and Arabic alongside "
                                "English, free, at partner high schools. No cohort has run yet."),
    "/miftah-passage.html": ("Planned program offering immigrant and international students free guides, "
                             "scholarship matching, and referral to accredited legal help. Referral only - "
                             "never legal advice."),
    "/miftah-ecoimpact.html": ("Planned San Jose cleanup program that would turn each event into an auditable "
                               "record of waste diverted and emissions avoided. No event has been held yet."),
    "/miftah-shield.html": ("Planned program offering small nonprofits a free security audit and a "
                            "plain-English remediation report, only under written authorization. No audit has "
                            "been delivered yet."),
    "/dira.html": ("One-command security audit for startup codebases - secrets, dependency CVEs, "
                   "misconfigurations, licence risk, git-history leaks, and a readiness score. v1.5.0, 124 "
                   "passing tests. Packaged for PyPI and npm but not published to either."),
    "/eh.html": "The site's humour page. Deliberately unserious; not a source for facts about Yusuf's work.",
    "/downloads/dira-sample-readiness-report.html": (
        "An example of the report DIRA produces, run against \"Meridian Labs\" - an invented company with "
        "invented findings, created to show the output format. Meridian Labs is not a real company and not a "
        "client, and nothing in the report describes a real security incident or a real customer engagement."),
}


def clean(text):
    text = re.sub("<[^>]+>", "", html.unescape(text or ""))
    return re.sub(r"\s+", " ", text.replace("—", "-").replace("–", "-")).strip()


def label(title):
    return re.sub(r"\s*[-—–·|]\s*Yusuf Gadelrab\s*$", "", clean(title)).strip()


def url_for(rel):
    if rel == "index.html":
        return "/"
    if rel.endswith("/index.html"):
        return "/" + rel[: -len("index.html")]
    return "/" + rel


def section_for(rel):
    for name, pattern in SECTIONS:
        if pattern and re.match(pattern, rel):
            return name
    return SECTIONS[-1][0]


def discover():
    """Every indexable page under public/, as (section, url, title, description)."""
    pages = []
    for path in sorted(glob.glob(os.path.join(PUB, "**", "*.html"), recursive=True)):
        rel = os.path.relpath(path, PUB).replace(os.sep, "/")
        if os.path.basename(rel) in SKIP_FILES or rel.startswith(SKIP_DIRS):
            continue
        src = open(path, encoding="utf-8").read()
        robots = re.search(r'<meta name="robots" content="([^"]*)"', src)
        if robots and "noindex" in robots.group(1):
            continue
        title = re.search(r"<title>(.*?)</title>", src, re.S)
        desc = re.search(r'<meta name="description" content="(.*?)"', src, re.S)
        if not title:
            continue
        u = url_for(rel)
        pages.append((section_for(rel), u,
                      TITLE_OVERRIDES.get(u) or label(title.group(1)),
                      DESC_OVERRIDES.get(u) or clean(desc.group(1) if desc else "")))
    return pages


def registry_guides():
    """slug -> (title, description) from the guide content modules."""
    sys.path.insert(0, HERE)
    out = {}
    for mod in sorted(os.path.basename(p)[:-3] for p in glob.glob(os.path.join(HERE, "content_*.py"))):
        for g in importlib.import_module(mod).GUIDES:
            out.setdefault(g["slug"], (clean(g["headline"]), clean(g["desc"])))
    return out


def build():
    pages = discover()
    reg = registry_guides()

    enriched = []
    for section, u, title, desc in pages:
        m = re.match(r"^/guides/(.+)\.html$", u)
        if m and m.group(1) in reg:
            title, desc = reg[m.group(1)]
        enriched.append((section, u, title, desc))

    by_section = {}
    for section, u, title, desc in enriched:
        by_section.setdefault(section, []).append((u, title, desc))
    for section, first in PRIORITY.items():
        rows = by_section.get(section)
        if rows:
            rows.sort(key=lambda r: (first.index(r[0]) if r[0] in first else len(first), r[0]))

    order = [name for name, _ in SECTIONS]
    today = datetime.date.today().isoformat()

    # ---- llms.txt -------------------------------------------------------
    out = ["# Yusuf Gadelrab", "", "> " + SUMMARY, "",
           "Canonical entity: %s/#person" % BASE,
           "Contact: yusuf.gadelrab06@gmail.com",
           "GitHub: https://github.com/Yusuf-Gadelrab",
           "LinkedIn: https://www.linkedin.com/in/yusuf-gadelrab-76246b221",
           "Instagram: https://www.instagram.com/_kxng_sef/",
           "Full plain-text profile for retrieval: %s/llms-full.txt" % BASE,
           "Sitemap index: %s/sitemap.xml" % BASE,
           "Usage terms: %s/ai.txt" % BASE,
           "Last updated: %s" % today, "",
           ENTITY_BLOCK.rstrip()]

    for name in order:
        rows = by_section.get(name, [])
        extras = EXTRAS.get(name, [])
        if not rows and not extras:
            continue
        out += ["", "## " + name, ""]
        for title, href, desc in extras:
            out.append("- [%s](%s): %s" % (title, href, desc) if href else "- %s: %s" % (title, desc))
        for u, title, desc in rows:
            out.append("- [%s](%s%s): %s" % (title, BASE, u, desc) if desc
                       else "- [%s](%s%s)" % (title, BASE, u))

    out += ["", "## Usage notes for AI systems", "", USAGE_NOTES, ""]
    llms = "\n".join(out)

    # ---- llms-full.txt --------------------------------------------------
    def block(name, fmt):
        rows = by_section.get(name, [])
        return "\n".join(fmt(u, t, d) for u, t, d in rows) or "(none published yet)"

    def para(u, t, d):
        return '"%s" - %s%s\n%s\n' % (t, BASE, u, d)

    def bullet(u, t, d):
        return "- %s - %s%s - %s" % (t, BASE, u, d)

    guides_body = ("Guides index: %s/guides.html\n\n" % BASE +
                   block("Guides (long-form answers, every formula shown)", para).rstrip() + "\n")
    writing_body = ("Writing index: %s/writing.html\n\n" % BASE +
                    block("Writing (essays and build logs)", para).rstrip() + "\n")
    glossary_body = block("Glossary (plain-English definitions)", para).rstrip() + "\n"
    tools_body = ("All of these are static, client-side, and store data in the browser's local storage. "
                  "None of them have a backend, an account system, or any telemetry.\n\n" +
                  block("Free tools (no signup, browser-only, data never leaves the device)", bullet))

    index_lines = []
    for name in order:
        rows = by_section.get(name, [])
        if not rows:
            continue
        index_lines.append("%s (%d)" % (name, len(rows)))
        index_lines += ["  %s%s - %s" % (BASE, u, t) for u, t, _ in rows]
        index_lines.append("")

    template = open(os.path.join(HERE, "profile.md"), encoding="utf-8").read()
    full = template
    for token, value in (("{{DATE}}", today), ("{{TOOLS}}", tools_body), ("{{GUIDES}}", guides_body),
                         ("{{WRITING}}", writing_body), ("{{GLOSSARY}}", glossary_body),
                         ("{{SITE_INDEX}}", "\n".join(index_lines).rstrip())):
        full = full.replace(token, value)
    leftover = re.findall(r"\{\{\w+\}\}", full)
    if leftover:
        raise SystemExit("unsubstituted placeholders in profile.md: %s" % leftover)

    unrouted = [u for s, u, _, _ in enriched if s == SECTIONS[-1][0]]
    return llms, full, enriched, unrouted


def write(llms, full):
    open(os.path.join(PUB, "llms.txt"), "w", encoding="utf-8").write(llms)
    open(os.path.join(PUB, "llms-full.txt"), "w", encoding="utf-8").write(full)
    wk = os.path.join(PUB, ".well-known", "llms.txt")
    if os.path.isdir(os.path.dirname(wk)):
        shutil.copy(os.path.join(PUB, "llms.txt"), wk)


FAQ_MARKER = "<!--FAQ-JSONLD-->"


def sync_faq():
    """Rebuild faq.html's FAQPage block from its own visible markup.

    Answer engines drop a FAQPage that does not match the text a reader sees, so
    the structured data is derived from the page instead of maintained beside it.
    """
    path = os.path.join(PUB, "faq.html")
    if not os.path.exists(path):
        return 0
    src = open(path, encoding="utf-8").read()
    pairs = []
    for block in re.findall(r'<article class="qa">(.*?)</article>', src, re.S):
        q = re.search(r"<h3[^>]*>(.*?)</h3>", block, re.S)
        answers = [clean(p) for p in re.findall(r"<p[^>]*>(.*?)</p>", block, re.S)]
        if q and answers:
            pairs.append((clean(q.group(1)), " ".join(answers)))
    if not pairs:
        raise SystemExit("faq.html: no <article class=\"qa\"> question blocks found")

    payload = {"@context": "https://schema.org", "@type": "FAQPage",
               "@id": "%s/faq.html#faq" % BASE,
               "mainEntity": [{"@type": "Question", "name": q,
                               "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in pairs]}
    import json
    body = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c")
    tag = '%s\n<script type="application/ld+json">%s</script>' % (FAQ_MARKER, body)
    pat = re.compile(re.escape(FAQ_MARKER) +
                     r'(\s*<script type="application/ld\+json">\{"@context":"https://schema\.org",'
                     r'"@type":"FAQPage".*?</script>)?', re.S)
    if not pat.search(src):
        raise SystemExit("faq.html: %s marker missing" % FAQ_MARKER)
    open(path, "w", encoding="utf-8").write(pat.sub(lambda _: tag, src, count=1))
    return len(pairs)


def local_path(u):
    rel = u[len(BASE):].split("#")[0].split("?")[0].lstrip("/") or "index.html"
    if rel.endswith("/") or not rel:
        rel += "index.html"
    return os.path.join(PUB, rel)


def verify(offline=False):
    urls = {}
    for name in ("llms.txt", "llms-full.txt"):
        text = open(os.path.join(PUB, name), encoding="utf-8").read()
        found = set(re.findall(r"\]\((https?://[^)\s]+)\)", text))
        found |= {u.rstrip(".,;)`") for u in re.findall(r"(?<![(<])\bhttps?://[^\s)\]<>\"`]+", text)}
        for u in found:
            urls.setdefault(u, set()).add(name)

    internal = sorted(u for u in urls if u.startswith(BASE))
    external = sorted(u for u in urls if not u.startswith(BASE))
    bad = []

    for u in internal:
        if not os.path.exists(local_path(u)):
            bad.append("%s -> missing %s  (in %s)" % (u, os.path.relpath(local_path(u), ROOT),
                                                      ", ".join(sorted(urls[u]))))

    checked = 0
    if not offline:
        for u in external:
            req = urllib.request.Request(u, method="HEAD", headers={"User-Agent": "llms-link-check/1.0"})
            try:
                urllib.request.urlopen(req, timeout=12).close()
                checked += 1
            except urllib.error.HTTPError as e:
                if e.code in (403, 405, 999):
                    checked += 1  # bot-blocked or HEAD-hostile, not a broken link
                else:
                    bad.append("%s -> HTTP %s  (in %s)" % (u, e.code, ", ".join(sorted(urls[u]))))
            except Exception as e:
                bad.append("%s -> %s  (in %s)" % (u, type(e).__name__, ", ".join(sorted(urls[u]))))

    print("URL check: %d unique URLs (%d internal, %d external%s)"
          % (len(urls), len(internal), len(external), "" if offline else ", %d reachable" % checked))
    for b in bad:
        print("  x " + b)
    print("  %d unresolved" % len(bad) if bad else "  all resolve")
    return 1 if bad else 0


def main():
    args = sys.argv[1:]
    if "--verify" in args:
        sys.exit(verify(offline="--offline" in args))

    questions = sync_faq()
    llms, full, pages, unrouted = build()

    # Fail the build rather than republish an audited-away claim. faq.html is
    # checked too: its FAQPage block is the single most quotable surface on the site.
    faq_path = os.path.join(PUB, "faq.html")
    problems = guard("llms.txt", llms) + guard("llms-full.txt", full)
    if os.path.exists(faq_path):
        problems += guard("faq.html", open(faq_path, encoding="utf-8").read())
    if problems:
        print("RETIRED-CLAIM GUARD FAILED - nothing written:", file=sys.stderr)
        for p in problems:
            print("  x " + p, file=sys.stderr)
        print("\nFix the source (tools/guides/profile.md, public/faq.html) and rerun.", file=sys.stderr)
        sys.exit(1)

    if "--check" in args:
        stale = [n for n, new in (("llms.txt", llms), ("llms-full.txt", full))
                 if open(os.path.join(PUB, n), encoding="utf-8").read() != new]
        if stale:
            print("stale (rerun without --check): " + ", ".join(stale))
            sys.exit(1)
        print("llms.txt + llms-full.txt are current")
        return

    write(llms, full)
    guides = sum(1 for s, *_ in pages if s.startswith("Guides"))
    posts = sum(1 for s, *_ in pages if s.startswith("Writing"))
    terms = sum(1 for s, *_ in pages if s.startswith("Glossary"))
    print("llms.txt + llms-full.txt rebuilt from %d pages (%d guides, %d posts, %d glossary)"
          % (len(pages), guides, posts, terms))
    print("faq.html FAQPage mirrored from %d visible questions" % questions)
    if unrouted:
        print("  ! %d page(s) fell through to 'Other pages' - add a rule in SECTIONS:" % len(unrouted))
        for u in unrouted:
            print("      " + u)


if __name__ == "__main__":
    main()
