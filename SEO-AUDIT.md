# Technical SEO Audit — yusuf-gadelrab.github.io

Date: 2026-07-30
Scope: `public/**/*.html` — **131 HTML files**, of which **95 are indexable** (all 95 in `sitemap.xml`) and **36 are deliberately excluded** (`404.html`, `offline.html`, the Search Console stub, and 33 files under `/templates/` which `robots.txt` disallows).
Method: static parse of every file (title, description, canonical, OG/Twitter, `html lang`, heading tree, `img alt`, JSON-LD), plus a sitemap↔filesystem reconciliation, an internal link/asset resolver, and a live `curl` of the deployed site.

**Nothing was committed, pushed, or deployed.** File edits only.

---

## 0. Headline verdict (read this if you read nothing else)

**This site does not have a technical SEO problem.** It has an *authority and indexing* problem.

The metadata layer is already better than the overwhelming majority of personal sites. Before I touched anything: 130/131 pages had a unique title, zero duplicate titles site-wide, 102/131 had descriptions, 96/131 had canonicals, `<html lang="en">` was correct on 130/131, every `og:url` matched its canonical, and there were **zero broken internal links and zero broken asset references** across 131 files. The `Person` JSON-LD on the homepage is genuinely well-built — `sameAs`, `alumniOf`, `knowsAbout`, and `subjectOf` with both SIGCSE papers and the real DOI.

So the fixes below are real but small. **They will not, on their own, move you up a single position for "Yusuf Gadelrab."** For a new personal site on a `github.io` subdomain, the binding constraints are, in order:

1. **Is it indexed at all?** Unverified — and only Search Console can answer it. Needs your Google login.
2. **Do authoritative external domains point at it?** Right now: essentially none. This is the single biggest lever and none of it happens in this repo.
3. **Is the entity consistent across the web?** Partly. The site declares the cluster; the other end of the cluster mostly doesn't exist yet.

Meta-description tuning is roughly item #9. I did it because you asked and because it's cheap, not because it's the constraint. Section 3 is the part that matters.

---

## 1. What I checked, and what was already correct

Reporting these plainly rather than padding — most of this was already right.

| Check | Result |
|---|---|
| `<title>` present | 130/131 (only the Search Console stub lacks one — **correct**, it must stay a bare text file) |
| `<title>` unique | **0 duplicates** across all 131 files, before and after |
| `<meta name="description">` unique | **0 duplicates** among the 95 indexable pages |
| `<link rel="canonical">` correct | 96/131 present; **0 pointing at a wrong URL**. `templates/index.html` → `templates.html` is an intentional consolidation, not an error |
| `og:url` vs canonical | **0 mismatches** |
| `<html lang="en">` | 130/131 (stub excluded — correct) |
| Exactly one `<h1>` | 121/131 (see §2 and §4 for the exceptions) |
| Broken internal links | **0**. The 2 flagged by the crawler are JS template strings in `au.html` and `index.html`, not links |
| Missing OG/Twitter image files | **0** real. The 4 flagged are `{{OG_IMAGE_URL}}` placeholders in sellable template products — intentional |
| Sitemap URLs that 404 | **0** — all 95 `<loc>` entries resolve to a real file |
| Real pages missing from sitemap | **0** — all 36 omissions are deliberate |
| Orphan pages | **0** among indexable pages. The 11 flagged are all in the robots-disallowed/excluded set |
| `img` missing `alt` | **0** real. The 3 flagged in `templates/` are `<img>` mentioned inside HTML/CSS *comments* |
| Empty `alt=""` | 95 files — **all correct.** Every one is the decorative DHAHAB lion mark or an `aria-hidden` background. Empty alt on decorative imagery is the right call; I changed none of them |
| `robots.txt` | Well-built. Named AI-crawler blocks, `/templates/` disallowed to stop preview files outranking `templates.html`, sitemap declared |
| Live homepage without JS | **Passes.** `curl` of the live site returns 1 `<h1>`, 286 words of real hero copy inside `#root`, the `Person` JSON-LD, and a canonical. The CRA boot snapshot is doing its job |
| Live sitemap vs repo | **Identical** — 95 URLs, byte-for-byte. No pending regression |

Two things worth calling out as genuinely good and rare: the **boot snapshot** inside `#root` means a JS-less crawler still gets a real headline and hero paragraph, which is the main SPA failure mode avoided. And `llms.txt` / `llms-full.txt` plus the AI-crawler allowlist in `robots.txt` is forward-looking work most people haven't done.

---

## 2. What I fixed — 18 files

### 2a. Empty `<h1>` on an indexable page (1 file)

`public/aurum/index.html` shipped with a literally empty `<h1></h1>` and an empty lead `<p>`, both filled in at runtime by `public/aurum/js/core.js:295-296`. A crawler that doesn't execute the page's JS saw a headline-less page.

Fixed by seeding the server-side default with the first module's real values (`Atelier` + its blurb, taken verbatim from `public/aurum/data/atelier.js:76-77`). **Zero visual change** — `core.js` overwrites both via `textContent` on load, exactly as before.

### 2b. Titles truncated mid-word (10 files)

Every post in `public/writing/` had its `<title>` machine-cut at 58 characters, mid-word, and the same cut string mirrored into `og:title`, `twitter:title`, and the JSON-LD `headline`. In a SERP these render as e.g. `Built a position size calculator that refuses to let you r`.

Rewritten as complete, self-contained headlines ≤60 chars in his existing sentence-case voice, and propagated to all four locations per file:

| File (`public/writing/`) | New title |
|---|---|
| `built-a-position-size-calculator-…` | A position size calculator that won't let you round up |
| `how-an-undergrad-with-no-connections-…` | How an undergrad with no connections joins a research lab |
| `i-built-a-visa-timeline-planner-…` | I built a visa timeline planner for my own status clock |
| `i-built-three-apps-this-week-…` | I built three apps and put zero of them in the App Store |
| `i-shipped-a-brand-across-30-pages-…` | I shipped one brand across 30 pages and 3 apps in a day |
| `i-skipped-the-app-store-…` | I skipped the App Store and shipped 3 offline PWAs |
| `i-spent-a-day-making-my-portfolio-…` | I made my portfolio readable by AI instead of by humans |
| `i-spent-months-building-trading-strategies-…` | What walk-forward testing did to my trading strategies |
| `i-wrote-a-security-scanner-…` | I wrote a security scanner with zero dependencies |
| `the-hardest-part-of-an-internship-search-…` | The hardest part of an internship search is the timing |
| `zero-dependency-security-scanner-…` | Zero-dependency security scanner: secrets, CVEs, IaC |

### 2c. `<h1>` headlines truncated with a literal "..." (4 files + 2 index files)

Four posts had their **on-page** headline cut mid-sentence with a trailing `,...` — the page's own visible headline was incomplete. Completed without inventing any claim (three were just a dropped tail; one was closed from the post's own first paragraph):

- `i-shipped-a-brand-…` → "…and a clothing line in one day"
- `i-spent-months-building-trading-strategies-…` → "…the results that killed most of them"
- `the-hardest-part-…` → "…nobody tells you when it starts"
- `zero-dependency-security-scanner-…` → "…git-history leaks, SBOM"

Mirrored into the anchor text in `public/writing.html` and the `<title>` entries in `public/rss.xml` so the headline is identical in all three places.

### 2d. Truncated or thin descriptions (14 files)

Post descriptions were the first ~160 characters of the body, cut mid-word (`…because 200 looks `). Rewritten as complete, compelling sentences under 160 chars, propagated to `description`, `og:description`, `twitter:description`, and the JSON-LD `description`.

Also fixed, outside `/writing/`:

- `public/stack.html` — description was **36 characters** ("The real tools behind Yusuf Gadelrab"), too thin for Google to use. Rewritten to 158 chars naming the actual stack.
- `public/codeswitch/glossary.html` — 162 chars → 149.
- `public/apps/grampa/index.html` — 177 chars → 156.
- `public/writing/i-spent-months-…` — 54 chars → 141.
- `public/writing/i-built-a-visa-timeline-planner-…` — 170 chars → 151.

### 2e. Post-fix state of all 95 indexable pages

```
no title: 0    title >60 chars: 0    duplicate titles: 0
no desc:  0    desc >160 chars: 0    desc <80 chars:  0    duplicate descs: 0
truncated-with-ellipsis headlines remaining: 0
```

### ⚠️ Note before you commit

`git status` shows **64 modified files**, but only **18 are mine**. The rest (`about.html`, `index.html`, `llms.txt`, `sitemap.xml`, `js/waitlist.js`, `store.html`, and others) were already uncommitted in the working tree from earlier sessions. Review the diff before staging — don't blanket `git add .` assuming it's all this audit.

My 18: `aurum/index.html`, `stack.html`, `codeswitch/glossary.html`, `apps/grampa/index.html`, `writing.html`, `rss.xml`, and the 12 files in `writing/`.

---

## 3. What is still broken or weak — ranked by actual search impact

### 🔴 1. You cannot confirm the site is indexed, and Search Console is not set up

The verification stub `public/googlebb78e2fba04aed48.html` exists and is live, which means verification was *started*. Whether it was ever completed, and whether the sitemap was ever submitted, cannot be determined from this repo — and I could not check (the session's web-search budget was exhausted before I could run a name query).

Everything else on this list is worthless if the answer to "is it indexed" is no.

**Fix — requires YOUR Google account, an agent cannot do this:**
1. https://search.google.com/search-console → confirm the property `https://yusuf-gadelrab.github.io/` shows as verified.
2. Sitemaps → submit `sitemap.xml`.
3. URL Inspection → run the homepage, `about.html`, and `hire.html`. If any says "URL is not on Google", hit **Request Indexing**.
4. Coverage report → this is the only place that will tell you how many of the 95 are actually in the index.

Also do **Bing Webmaster Tools** (separate login, 5 minutes) — it feeds ChatGPT search, which for your target audience is not a rounding error.

### 🔴 2. Almost no external links from authoritative domains

This is the real ceiling. Nothing in this repo can fix it.

You already wrote the playbook — `tools/external-profiles.md` — and its own header says: *"Nothing here has been submitted or created."* That file is the highest-ROI unexecuted work you own. Its analysis is correct: Google resolves a person's identity from a cluster of high-authority profiles that all point at one canonical URL, and right now the site declares that cluster in `sameAs` while the other end of it is mostly empty.

Highest value first, roughly by domain authority and relevance:

- **ACM Digital Library author profile** — you have a real DOI (`10.1145/3770761.3777339`). An ACM DL author page linking to your site is about the strongest possible signal for a CS student. Claim it.
- **Google Scholar profile** — free, indexed fast, and it is frequently the *first* result for an academic's name. Two SIGCSE TS 2026 papers is enough to justify one.
- **ORCID iD** — free, permanent, high-authority, and it links out to your site. Ten minutes.
- **GitHub profile "Website" field + bio** — your `about-yusuf` notes say the bio update is still pending and needs `gh auth refresh -h github.com -s user`. GitHub profiles rank extremely well for name queries. The Website field is the single cheapest authoritative backlink you can create.
- **`Yusuf-Gadelrab/Yusuf-Gadelrab` profile README** — copy is already drafted in `tools/external-profiles.md`.
- **LinkedIn** — Featured section + the website field, pointing at the canonical URL. Also pending in your notes.
- **SJSU CSEd Research Lab page** — ask Dr. Tshukudu to list you with a link. A `.edu` backlink is worth more than a hundred meta-tag tweaks, and it is a two-sentence email.
- **SJSU / SVEC club pages** — you're Technical Ops & Web Lead at SVEC and you maintain sventclub.org. Put a link to your canonical URL on it.

Every one of these must use the identical name, city, school, and canonical URL — the "canonical facts" block already at the top of `tools/external-profiles.md`. Consistency is what makes the cluster resolve.

### 🟠 3. Your strongest content is hash-routed and invisible to crawlers

`src/App.js:372` defines seven homepage sections — `Home, About, Working On, Research, Projects, Resume, Legal` — switched client-side and routed by **hash** (`window.history.replaceState(null, '', '#research')`, line 693). Google discards fragments for indexing: `/#research` and `/#projects` are both just `/`.

The static boot snapshot only contains the **Home** section (286 words). So the rendered Research and Projects sections — including the SIGCSE work, which is your best E-E-A-T signal — exist only inside the JS bundle at a URL that can never rank independently.

Partly mitigated already, which is why this is orange not red: both papers appear in the homepage `Person` JSON-LD `subjectOf` array with the DOI, and `about.html`, `resume.html`, `apps.html`, and `everything.html` cover the same ground as real crawlable URLs.

**Fix (cheapest first):**
- **Do nothing structural.** Instead make sure `about.html` carries the full research narrative in visible HTML — it is the page your `Person` schema names as `mainEntityOfPage`, so it is the one Google will treat as canonical for the entity. Verify both paper titles and the DOI appear as visible text there, not only in JSON-LD.
- Optional, larger: extend the boot snapshot in `public/index.html` to include a short static Research block. This is the only change here that touches layout, so it's your call, not mine.

### 🟠 4. Keyword cannibalization — two pairs of near-duplicate posts

Two topics are each covered by two separate posts competing for the same query:

- **App Store / PWA:** `i-built-three-apps-this-week-and-put-zero-of-them-in-the-app-store.html` and `i-skipped-the-app-store-and-shipped-3-offline-pwas-instead-heres-what-.html`
- **Security scanner:** `i-wrote-a-security-scanner-with-zero-dependencies-on-purpose.html` and `zero-dependency-security-scanner-secrets-osv-cves-iac-rules-git-histor.html`

Both pairs share a thesis and a first paragraph. Google will pick one and suppress the other, and split whatever link equity either earns.

I did **not** fix this — deleting or merging your writing is an editorial decision, not a safe metadata fix.

**Fix:** pick the stronger post in each pair, merge anything unique from the weaker one into it, then point the weaker one's `<link rel="canonical">` at the winner (keep the page live so existing links don't break). Update `writing.html`, `rss.xml`, and `sitemap.xml` to match.

### 🟡 5. Thin pages

Under 300 words of body text, among indexable pages: `aurum/index.html` (62), `apps/cut/index.html` (98), `apps/fire/index.html` (99), `apps/tradelog/index.html` (122), `spartaneats.html` (211), `writing.html` (234), and six writing posts in the 250–295 range.

The app pages are a defensible case — they're app shells, most of the content is interactive, and they exist to be *used* not read. Aurum at 62 words is the weakest, since almost all of its content is JS-generated fictional catalogue data.

**Fix:** low priority. If you touch any, add 150–200 words of genuine "what this is and why I built it" copy to `apps/cut`, `apps/fire`, and `apps/tradelog` — they're linked from `apps.html` and target real queries ("free offline weight tracker", "R-multiple trade journal"). Do not pad the rest.

### 🟡 6. `apps/grampa/index.html` has 9 `<h1>` elements

Lines 174, 199, 224, 241, 252, 259, 271, 278, 301 — one per screen of a client-side screen-switcher, all present in the source, only one visible at a time.

I did **not** fix this. The correct fix is to demote eight of them to `<h2>` and their nested `<h2>`s to `<h3>`, but the page's CSS styles `h1` and `h2` differently, so that would visibly shrink eight screen headings — and you told me not to change layout. On a 156-word app page it is not worth a visual regression.

**Fix if you want it:** keep `<h1>What do you need?</h1>` on the landing screen, demote the other eight to `<h2>`, demote their child `<h2>`s to `<h3>`, then add `.screen h2 { font: <whatever h1 was> }` scoped to the non-landing screens so nothing moves. Requires a CSS edit, which was out of scope here.

Same pattern, same reasoning, in `templates/client-proposal/client-proposal.html` (9), `templates/freight-ops-pack/carrier-packet.html` (6), and 4 other template files — but those are `Disallow`ed in `robots.txt`, so their heading structure has no search consequence at all.

### 🟡 7. All 12 writing posts share one `og:image`

Every post uses `og-card.png`. Per-post cards would lift click-through when these get shared. `tools/gen_og_cards.py` already exists and already generates 17 per-page cards, so the machinery is built — it just doesn't cover `/writing/`.

**Fix:** extend `tools/gen_og_cards.py` to emit one card per writing post, then point each post's `og:image` and `twitter:image` at it. Genuinely optional.

### ⚪ 8. Non-issues — do not spend time on these

- **`/templates/` metadata.** 33 files with no description, no canonical, no OG, no JSON-LD. This is **correct as-is** — `robots.txt` disallows the whole directory precisely so these previews don't outrank `templates.html`. Adding meta tags to disallowed pages does nothing. Leave them.
- **Empty `alt=""`.** 95 files. All decorative lion marks and `aria-hidden` backgrounds. Correct. Adding alt text here would make the site *worse* for screen readers.
- **`404.html` / `offline.html` missing canonical and OG.** Both are `Disallow`ed. Correct.
- **The `github.io` subdomain.** `github.io` is on the Public Suffix List, so your site is treated as its own registrable entity — there is no "subdomain penalty." A custom domain would help brand recall and is more portable, but it costs money and it is not a ranking constraint. Given money is tight, skip it for now.
- **Meta keywords, keyword density, title-tag micro-tuning.** All dead. You are already at the point of diminishing returns here; that was true before this audit.

---

## 4. Do this next, in order

**Needs YOUR Google account — no agent can do these. Do them first; they gate everything else.**

1. **Search Console** — confirm verification, submit `sitemap.xml`, inspect + request indexing for `/`, `/about.html`, `/hire.html`, then read the Coverage report to find out how many of the 95 are actually indexed. *(15 min)*
2. **Bing Webmaster Tools** — add the property, submit the same sitemap. Feeds ChatGPT search. *(5 min)*

**Then, in descending order of impact — all off-site, none of it in this repo:**

3. **Google Scholar profile.** Two SIGCSE TS 2026 papers. Often outranks everything else for an academic name query. *(20 min)*
4. **ORCID iD.** Free, permanent, authoritative, links to your site. *(10 min)*
5. **ACM DL author profile.** Claim it against DOI `10.1145/3770761.3777339`. *(15 min)*
6. **GitHub bio + Website field + profile README.** Run `gh auth refresh -h github.com -s user` first; copy is already written in `tools/external-profiles.md`. *(15 min)*
7. **LinkedIn** — website field + Featured section pointing at the canonical URL. *(10 min)*
8. **Email Dr. Tshukudu** asking for a link from the CSEd Research Lab page. A `.edu` backlink outweighs this entire audit. *(5 min)*
9. **Add a link from sventclub.org** to your canonical URL — you maintain that site, so this is a one-line change you fully control. *(5 min)*

**Then, on-site, only after the above:**

10. Verify `about.html` states both paper titles and the DOI as **visible text**, not just JSON-LD (§3.3).
11. Resolve the two cannibalization pairs with canonical tags (§3.4).
12. Deploy. `npm run deploy` from the repo root — `predeploy` rebuilds, so `public/` edits ship. Committing to `main` alone does **not** publish; the live site serves from `gh-pages`.

Items 1–9 are worth more than items 10–12 combined, and more than everything I fixed in §2. That is the honest ranking.

---

## Appendix — how to re-run this

No tooling was added. The audit was a one-off parse; `tools/validate.py` and `tools/visibility_audit.py` already exist in the repo and cover overlapping ground. Ground truth for the live site:

```bash
curl -s https://yusuf-gadelrab.github.io/sitemap.xml | grep -c '<loc>'   # expect 95
curl -s https://yusuf-gadelrab.github.io/ | grep -c '<h1'                # expect 1
```

Both were verified against the deployed site on 2026-07-30 and matched the repo exactly.
