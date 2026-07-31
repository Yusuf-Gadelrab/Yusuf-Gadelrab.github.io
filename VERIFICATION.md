# Independent Verification — uncommitted working tree

Date: 2026-07-31
Scope: `public/**/*.html` + working-tree diff (`git diff` + untracked files)
Method: every number below was re-derived by an independent script
(`verify.py`, own HTML/JSON/XML parsers). No other agent's report was trusted.

## VERDICT: **DO NOT SHIP YET** — one transient blocker, otherwise clean

The site itself is in good shape. The only blocker is that **another agent is
still mid-flight**: `public/research.html` links to `public/projects.html`,
which does not exist yet. That is 3 broken internal links and 1 sitemap orphan.
This is an in-progress state, not a defect in completed work.

**Ship as soon as `public/projects.html` lands and `sitemap.xml` is regenerated
to include `/research.html` and `/projects.html`.** Nothing else needs fixing.

### Mid-run file appearance (observed)
`public/research.html` appeared **during** this verification run — the file
count went 131 -> 132 between the first and second sweep. The numbers below are
from the **second (later)** sweep. `public/projects.html` was still absent at
final re-read.

---

## 1. Correctness sweep

| Metric | Value |
|---|---|
| Total HTML files in `public/` | **132** |
| Robots-disallowed | **35** (`/templates/*` = 33, `/offline.html`, `/404.html`) |
| Indexable | **97** |
| Additionally `noindex` via meta | 3 (`/404.html`, `/offline.html`, `/templates/index.html`) |
| JSON-LD blocks total | **240** |
| JSON-LD parse failures | **0** ✅ |
| Internal links checked | **3178** |
| Broken internal links | **3** (all `/projects.html`, all from `/research.html`) |
| `sitemap.xml` valid XML | yes ✅ |
| `<loc>` entries | **95** (was 94 at HEAD; +1, none removed) |
| `<loc>` with no backing file | **0** ✅ |
| Duplicate `<loc>` | **0** ✅ |
| Sitemap entries pointing at disallowed pages | **0** ✅ |
| Indexable pages missing from sitemap | **1** (`/research.html`) |

### Titles / descriptions (indexable pages only, n=97)
Robots-disallowed pages are **excluded** from the missing counts, as specified.

| Check | Titles | Descriptions |
|---|---|---|
| Missing | **1** | **1** |
| Duplicates | **0** ✅ | **0** ✅ |
| Over limit (65 / 165 chars) | **0** ✅ | **0** ✅ |

The single missing title+description is `/googlebb78e2fba04aed48.html` — the
Google Search Console verification stub. It is a non-page by design and must
stay contentless. **Not a defect.**

### JSON-LD Person entity consolidation ✅
- **59 Person nodes** across the site; **all 59** use `@id` =
  `https://yusuf-gadelrab.github.io/#person`. The canonical `@id` string appears
  **207** times in total.
- **2 full canonical definitions**: `/index.html` and `/about.html`. These were
  compared field-by-field and are **identical** — same key set, zero differing
  values, identical `name`, `jobTitle`, and `description`.
- **57 minimal stubs** carrying only `@context`, `@type`, `@id`, `name`, `url`.
  They omit `jobTitle` and `description` entirely, so they **cannot** conflict.
- **Conflicting Person definitions found: 0.** Entity consolidation is intact.

### The 3 broken links (the blocker)
```
/research.html -> /projects.html   (x3, missing)
```

### The 26 `{{MUSTACHE}}` placeholders — NOT broken links
An earlier pass flagged 26 additional unresolvable `href`s such as
`{{SIGNUP_URL}}`, `{{PRIVACY_URL}}`, `{{INSTAGRAM_URL}}` in
`public/templates/landing-page-kit/*`, `.../media-kit/*`. These are:
1. intentional fill-in tokens in the **paid template pack**,
2. under robots-disallowed `/templates/`, and
3. **completely untouched by this session** (`git diff -- public/templates/`
   returns 0 lines).

They are excluded from the broken-link count. Correct as-is.

### Sitemap regression check ✅
The known historical gotcha is that regenerating `tools/sitemap.py` drops
`/writing/`, `/aurum/`, and `/codeswitch/` URLs. **It did not recur.**
Present in the current sitemap: `/writing/` 12, `/aurum/` 1, `/codeswitch` 2,
`/guides/` 30, `/apps/` 4. A diff of the `<loc>` list against HEAD shows
**zero removals** and one addition.

### Build output (re-derived, not taken on trust)
I did not re-run `npm run build`, but I **did** independently verify the
metadata-survival claim against the existing `build/` output rather than
accepting it:
- `application/ld+json` occurrences: **5 in `public/index.html`, 5 in
  `build/index.html`** ✅
- All 5 build blocks parse as JSON: `ProfilePage`, `Person`, `ScholarlyArticle`,
  `ScholarlyArticle`, `WebSite` ✅
- `rel="canonical"` present, `#person` `@id` survives (6 occurrences).

Caveat: a naive `grep -c` reports `1` for the build file because the build
minifies to a single line — count occurrences (`grep -o | wc -l`), not lines.

Note: `build/index.html` (09:28) predates the arrival of `research.html`, so a
rebuild is required before deploy regardless — which is already the standing rule.

---

## 2. Sensitive-content check — **CLEAN** ✅

Scanned all 410 added diff lines plus the full contents of 5 untracked paths
(`SEO-AUDIT.md`, `public/js/commerce.js`, `public/apps/grampa/`,
`tools/checkout_test.js`, `tools/waitlist_test.js`) — 1623 lines total.

**No secrets, keys, tokens, credentials, or `.env` content were introduced.**

Every pattern hit was a false positive, verified by hand:

| Hit | File | Reality |
|---|---|---|
| `secret`, `token`, `api key` | `dira.html`, writing posts, `SEO-AUDIT.md` | Prose *about* the DIRA secret-scanner. No secret values. |
| `(408) 555-0134`, `(408) 555-0199` | `public/apps/grampa/index.html` L1173, L1175, L1473 | Reserved-for-fiction `555-01xx` placeholders in form fields. |
| `1-877-382-4357` | `public/apps/grampa/index.html` L1419 | Public FTC fraud hotline. |
| `password` | `public/apps/grampa/index.html` L1248, L1281, L1308 | Scam-awareness copy telling users *not* to share theirs. |
| `localhost:8934` | `tools/waitlist_test.js` L864 | Local test harness. Not under `public/`, never deployed. |
| `HwyHaul` | `public/hwyhaul.html` | Diff is **JSON-LD whitespace minification only**. No schemas, keys, or internal URLs added. |

**Real phone number `(669) 328-1148`**: present in `public/freightdesk.html`,
`public/store.html`, `public/index.html`, `public/resume.html`,
`public/js/site.js` — but it is **pre-existing, deliberately published business
contact info**, not a new leak. Occurrence count went **down**, never up
(`resume.html` 4 -> 3). The one `+telephone` diff line replaces two `-telephone`
lines; it is a reformat, not an introduction.

No home street address, no ZIP, no DOB, no government ID numbers, no
employer-internal data.

---

## 3. Factual-claim spot check — **CLEAN** ✅

Extracted every percentage, dollar figure, and credential word from the added
lines, then checked each against HEAD to separate *new* claims from
*reformatted existing* ones.

**The retired `+86%` / "Personal trading return" claim does NOT reappear.**
Zero hits. ✅

| Claim | Where | Status |
|---|---|---|
| ~~`24% improvement in learner confidence`~~, `60 participants`, IRB-approved | research/publication copy | **REMOVED site-wide 2026-07-30 — UNSOURCED.** The accepted SIGCSE paper (`~/Downloads/Bilingual coding.pdf`) contains no percentage figures at all; its only numeric effect is Cohen's d = 0.25–0.40 for a bilingual-vs-English comparison that was *not* statistically significant. Replaced with "statistically significant pre-to-post gains in confidence, computing identity, enjoyment and motivation across 60 participants, largest among novices." `60 participants` / IRB-approved remain sourced. |
| `7% increase in risk` (rounding 187 -> 200 shares) | position-sizer post meta | Arithmetic fact about a worked example, not a personal-performance claim. Self-evident. |
| `$99 a year` App Store fee | 2 PWA writing posts | True, publicly documented Apple Developer fee. |
| `$999` + `$249/mo` | FreightDesk JSON-LD | His own published pricing. |
| `from $24` | store.html | His own published pricing. |
| `100%` (x11) | CSS / JSON-LD | Layout values and `"price":"0"`-style fields. Not claims. |

**Newly introduced unsourceable claims: 0.**

### Miftah / CODESWITCH legal-status honesty ✅
The added copy moves in the **correct** direction. It explicitly states the
organization *is not* incorporated, *is not* a registered charity, that
contributions are **NOT** tax-deductible and none are solicited, that no program
has delivered yet, and that programs are "proposed" / "planned". A targeted grep
for affirmative claims of incorporation, 501(c)(3) status, a pending Form 1023,
or deductible donations returned **zero** hits across all `miftah*.html` and
`codeswitch.html`.

One genuinely good catch already in the added copy: the Shield program is
described as auditing "only under written authorization."

---

## Summary of everything that FAILED

1. **`/research.html` -> `/projects.html` — 3 broken links.** Target file does
   not exist. Another agent is still writing it.
2. **`/research.html` is a sitemap orphan.** Not among the 95 `<loc>` entries.

That is the complete failure list. Both are the same in-flight cause, and both
resolve when the other agent finishes.

## Everything that PASSED
240/240 JSON-LD blocks parse · 59/59 Person nodes consolidated on one `@id` with
zero conflicts · 0 duplicate titles · 0 duplicate descriptions · 0 over-length
titles or descriptions · 3175/3178 internal links resolve · sitemap valid with 0
dead `<loc>`, 0 duplicates, 0 disallowed entries, 0 regressions · 0 secrets ·
0 PII introduced · 0 new unverifiable claims · retired `86%` claim stays gone.

No other agent's work was reverted or modified during this verification.
