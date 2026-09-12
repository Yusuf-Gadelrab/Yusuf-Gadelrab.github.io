# Executive Resume & Cover Letter Pack — Midnight Gold

Five self-contained HTML documents. No installs, no accounts, no internet connection needed — double-click any file to open it in a browser, edit the text, and print to PDF.

## Which version to use when

| File | Use it for | Why |
|---|---|---|
| **`resume-ats.html`** | Applying through a company career site / job board (Workday, Greenhouse, Lever, Taleo, LinkedIn Easy Apply) | Single-column flow, real selectable text (no text-in-images), standard section headings (Experience / Education / Skills / Projects), no tables or CSS columns. This is the one that actually **parses correctly** in applicant tracking systems — the others may get mangled or skipped by a parser. |
| **`resume-executive.html`** | Emailing a hiring manager or recruiter directly, referral submissions, printed leave-behinds at interviews | Two-column paper-white layout with a serif masthead and hairline gold rules — reads as senior/considered without looking "designed" in a way that spooks a corporate parser. Use when a human, not software, opens it first. |
| **`resume-dark.html`** | Portfolio site embed, PDF attachment for design/creative/founder/agency roles, or anywhere the reviewer explicitly values visual craft | The full Midnight Gold dark showpiece treatment. Do **not** use this for ATS-gated applications — dark backgrounds and heavier styling raise parsing risk. |
| **`cover-letter.html`** | Any application that accepts a cover letter | Matches the executive resume's letterhead exactly so the pair reads as one document set. |
| **`thank-you-note.html`** | Sent within 24 hours of an interview | Half-page, same letterhead system, quick to personalize. |

**Rule of thumb:** if a machine reads it first, use `resume-ats.html`. If a person reads it first, use `resume-executive.html` or `resume-dark.html`.

## Ships pre-filled — find & replace the sample content

All five documents ship fully filled in with a complete fictional sample application (candidate "Maren Ochoa") so every file previews as a finished, ready-to-send document — not a form with blanks. There are no visible `{{TOKEN}}` placeholders left in the body text; the only remaining tokens live in `<head>` (page `<title>`) and HTML comments, which nothing but a text editor ever sees.

1. Open the file in any text editor (or right-click → Open With → TextEdit / VS Code / Notepad).
2. Every file has an `<!-- ===== EDIT BELOW ===== -->` comment marking where personal content starts.
3. Find and replace Maren's sample strings (exact list below) with your real information.
4. The Experience, Education, Skills, and Projects sections are pre-filled with realistic sample content for "Maren Ochoa." Edit that text directly — replace her jobs, dates, and bullets with your own using the "resume content rules" below.
5. Save, then open the file in a browser to preview.

### Exact sample strings to find & replace

| Field | Sample value used throughout | Appears in |
|---|---|---|
| Candidate name | `Maren Ochoa` | all 5 files |
| Title | `Senior Product Engineer` | all 5 files |
| Location | `Austin, TX` | resume-ats, resume-executive, resume-dark |
| Phone | `(512) 555-0148` | resume-ats, resume-executive, resume-dark, thank-you-note |
| Email | `maren.ochoa@example.com` | resume-ats, resume-executive, resume-dark, thank-you-note |
| LinkedIn | `linkedin.com/in/maren-ochoa` | resume-ats, resume-executive, resume-dark, cover-letter, thank-you-note |
| Portfolio | `marenochoa.dev` | resume-ats, resume-executive, resume-dark |
| Monogram initials | `MO` | resume-executive, resume-dark, cover-letter, thank-you-note |
| Letter date | `March 16, 2026` | cover-letter, thank-you-note |
| Hiring manager name | `Dana Whitmore` | cover-letter |
| Hiring manager title | `Director of Engineering` | cover-letter |
| Target company | `Lumen Harbor` | cover-letter, thank-you-note |
| Role title | `Senior Product Engineer` | cover-letter, thank-you-note |
| Team/product context | `platform team's checkout modernization initiative` | cover-letter |
| Interviewer first name | `Dana` | thank-you-note |
| Discussion topic | `the team's roadmap for checkout modernization` | thank-you-note |
| Relevant skill area | `event-driven systems and checkout optimization` | thank-you-note |
| Employers (in bullets/sections) | `Northlane Systems`, `Fieldstone Analytics`, `Cobalt Ridge Software` | resume-ats, resume-executive, resume-dark, cover-letter, thank-you-note |

### Remaining `{{TOKEN}}` placeholders (invisible — head/comments only)
`{{CANDIDATE_NAME}}` still appears in each file's `<title>` tag (browser tab / saved-PDF filename hint) and in the `<!-- ===== EDIT BELOW ===== -->` comment. Neither is visible on the rendered page; update the `<title>` tag too if you want the browser tab and PDF metadata to match your name.

## Exporting to PDF

1. Open the `.html` file in Chrome, Edge, or Safari.
2. `Cmd+P` (Mac) or `Ctrl+P` (Windows) → destination **Save as PDF**.
3. Set margins to **None** and disable headers/footers — the templates already build their own page margins and footer, so browser-added ones will duplicate them.
4. Enable "Background graphics" (Chrome/Edge) so the gold rules and dark background render — without it, colors print as plain black text.
5. Save. One-click PDF, letter-size, ready to attach.

## Resume content rules (cheat sheet)

Every bullet should follow this formula:

**Action verb + what you did + quantified result.**

- ❌ "Responsible for checkout redesign"
- ✅ "Led redesign of the checkout flow serving 4.2M monthly users, cutting cart abandonment 23% and recovering $6.1M in annualized revenue."

Quick checklist per bullet:
- Starts with a strong past-tense verb (Led, Built, Cut, Grew, Shipped, Reduced, Automated) — never "Responsible for" or "Helped with."
- Names the concrete thing you built or changed.
- Ends with a number — revenue, %, time saved, users affected, team size. No number, no bullet.
- One line, no more than ~2 lines when printed. If it needs 3+ lines, split it or cut it.
- Cut anything that doesn't show impact — task lists don't belong on a senior resume.
