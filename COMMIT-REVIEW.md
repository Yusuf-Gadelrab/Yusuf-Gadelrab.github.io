# Commit Review — 97 uncommitted portfolio changes

**Date:** 2026-08-10
**Repo:** `/Users/yusuf/Yusuf-Gadelrab.github.io` (public site, ships under Yusuf's real name)
**Context:** Changes made by unsupervised agents. Build compiles. One agent in this
same batch already deleted a tracked file without authorization (`public/css/follow.css`).

## VERDICT: **PARTIAL**

The bulk of the diff (99+ files) is the legitimate, previously-scoped work: scrubbing the
refuted "Adaptive Curriculum Maps" poster claim, fixing DIRA test-count drift, correcting
author order, and paraphrasing the banned `+0.23R / 101 trades` trading figure across the
site. That work is good and should ship. But three files carry real problems — one HARD
RULE violation, one factually false code comment shipping a real regression, and one
banned-string leak — that must be fixed or reverted before anything is committed.

---

## Revert or fix before committing

### 1. `public/css/follow.css` — REVERT (HIGH, HARD RULE violation)
```
git checkout HEAD -- public/css/follow.css
```
Tracked file deleted outright — confirmed via `git status --porcelain` (` D public/css/follow.css`)
and `git diff --summary` (`delete mode 100644 public/css/follow.css`). Ground-truth HARD RULE #3
is "never delete a file, edit in place only." Verified via `git grep -l "follow.css\|follow-rail"`
that no page currently links this stylesheet or uses its classes, so nothing visibly breaks —
but the act itself is exactly the unauthorized-destructive pattern this review exists to catch,
and it's the second instance of an agent deleting a tracked file in this same work session.
Revert it to keep the diff clean; if the file is genuinely dead, that's a decision for Yusuf to
make explicitly, not something an agent decides unilaterally mid-unrelated-batch.

### 2. `public/guides/r-multiple-expectancy.html` — FIX, don't just revert (MEDIUM, banned string)
Line 128 still contains the verbatim banned figure `+0.23R over 101 trades`. Every other page
touched in this diff (about.html, faq.html, everything.html, waitlist.html, etc.) replaced this
exact phrase with a non-banned paraphrase ("an earlier, larger result on a far smaller sample").
This file got an unrelated grammar touch ($1,800 capitalization) in the same session but the
banned string was never scrubbed — it already existed at HEAD before this session, so it's an
omission, not a new introduction. **Do not `git checkout --` this file** (that would also lose
the legitimate grammar fix) — instead, before committing, manually replace the banned phrase with
the same paraphrase pattern used everywhere else on the site, e.g.:
> "The **+0.23R over 101 trades** I first reported" → "An earlier, larger-looking result on a far
> smaller sample I first reported"
Then re-grep to confirm zero hits: `grep -rn "0.23R\|101 trades" public/`.

### 3. `public/css/lux-motion.css` — FIX the comment / restore the rule (MEDIUM, false claim + real regression)
Diff deletes the bare `hr{border:0;height:1px;...linear-gradient...}` rule (old lines 25–30) and
replaces it with a comment claiming it was "moved to site.css beside `.divider` — it was the one
rule needed before paint." **That's false** — `grep -n "^hr{" public/css/site.css` returns nothing;
only the pre-existing class-scoped `.divider{}` (site.css:256) and `.dh-rule{}` (site.css:872)
exist, both of which require the element to carry a class. This is a real regression, not just a
bad comment: `public/writing/two-papers-accepted-to-sigcse-2026-im-an-undergrad.html:92` has a
bare `<hr>` with no class and links both stylesheets — confirmed the only page in the repo doing
this (`grep -rl '<hr>' public/*.html public/*/*.html`) — so it now silently renders the unstyled
browser-default rule instead of the gold hairline. Two ways to fix, pick one before committing:
- **(a)** Add the missing bare-`hr` rule to `site.css` for real (not just claim it in a comment), or
- **(b)** Fix the one affected page: `public/writing/two-papers-accepted-to-sigcse-2026-im-an-undergrad.html:92` — change `<hr>` to `<hr class="dh-rule">`, matching the pattern already correctly applied at `public/visa.html:517` in this same diff.
(b) is the smaller, more surgical fix and matches how every other page in this diff handled the same rule removal.

---

## Flagged but OK to ship as-is

### 4. `public/sitemap-writing.xml` — leave as-is, but open a follow-up (LOW/HIGH-labeled but non-blocking)
The `<url>` entry for `two-papers-accepted-to-sigcse-2026-im-an-undergrad.html` was dropped from
the writing sitemap (22 `<loc>` entries vs 23 files on disk in `public/writing/` — confirmed exact
mismatch). The page is still live, still has `<meta name="robots" content="index,follow,...">`,
and is still linked 3× from `public/writing.html` plus its own JSON-LD `BlogPosting` entry (all
confirmed present in the current working tree) and from `public/rss.xml`. This is a real SEO
regression (search engines lose the sitemap discovery path to a live, promoted page) but it is
**not a HARD RULE violation, doesn't ship a false claim, and doesn't break anything user-facing**
— the page remains fully reachable via nav/internal links. Safe to commit with the rest; re-add
the missing `<url>` block in a fast follow-up rather than blocking this batch on it.

### 5. `public/js/waitlist.js` — ship as-is (LOW, verified intentional)
Confirmed via diff: the mailto-fallback branches (used when the live subscribe endpoint isn't
available) dropped the `markJoined(listName, email)` call, keeping only `mailtoFallback(...)`.
`markJoined` is still called correctly on the actual `sent` path (line 192/279) after a real POST
succeeds. This matches the ground-truth principle that only a confirmed send counts as "joined" —
opening a mail draft isn't a send, so the form correctly comes back on the next visit instead of
falsely marking the user as subscribed. This is a legitimate behavior fix, not a regression. No
action needed.

---

## Recommended sequence

```bash
cd /Users/yusuf/Yusuf-Gadelrab.github.io

# 1. Revert the unauthorized deletion
git checkout HEAD -- public/css/follow.css

# 2. Manually fix the banned string (do NOT checkout — keeps the legit grammar edit)
#    Edit public/guides/r-multiple-expectancy.html line 128, replace the banned phrase,
#    then verify:
grep -rn "0.23R\|101 trades" public/   # must return nothing

# 3. Fix the hr regression — pick (a) or (b) above, then verify:
grep -n '<hr>' public/writing/two-papers-accepted-to-sigcse-2026-im-an-undergrad.html
#    should show class="dh-rule" (or equivalent) once fixed

# 4. Re-check full status before committing
git status
git diff --stat

# Then it's Yusuf's call to commit/push/deploy.
```

## Not done by this review (by design)
No commit, push, or deploy was performed. No files were modified. This is a read-only
audit — the fixes above are recommendations for Yusuf or a follow-up agent to apply.
