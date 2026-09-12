# Investor Pitch Deck — Midnight Gold

A 16-slide, 16:9 investor pitch deck template. Single self-contained HTML file — no build step, no CDN, no fonts to install. Double-click `investor-deck.html` to open it in any browser.

Sample-filled with a fictional company, **Northbay Logistics AI** (B2B AI for freight brokerages, raising a seed round), so you can see exactly how the layout reads with real content before you swap in your own.

## How to edit

1. Open `investor-deck.html` in any text editor (VS Code, Sublime, even TextEdit).
2. Every editable block is inside `<!-- ===== EDIT BELOW ===== -->` near the top of `<body>`.
3. Find-and-replace the sample strings in the table below (e.g. "Northbay Logistics AI", "Marcus Reyes") with your own copy. The only literal `{{TOKEN}}` placeholders left in the file are `{{SCREENSHOT_1}}` / `{{SCREENSHOT_2}}`, which live inside HTML comments and are invisible on the page.
4. Slide-specific numbers (pain stats, pricing, bar chart values, financial table, matrix dot positions) are written directly in the HTML near each slide's `<section>` — edit the visible text/numbers in place. They aren't tokenized because they're unique per business, not swappable boilerplate.
5. Save and refresh your browser — no build step required.

## Ships pre-filled — find-and-replace these sample strings

The deck no longer shows raw `{{TOKENS}}` anywhere you can see them — every visible placeholder is filled in with sample copy for the fictional company **Northbay Logistics AI**, so the deck reads as a finished document out of the box (this is what buyers see in the live preview). To make it yours, find-and-replace the literal strings below with your own — search for each one across `investor-deck.html`:

| Sample string in the file | Used on slide(s) | Replace with |
|---|---|---|
| `Northbay Logistics AI` | 1, 2, 3, 4, 6–16 | Your company name |
| `The AI operations layer that automates freight brokerage back-office work, from inbound rate confirmations to booked loads.` | 1 | One-line description of what you do |
| `Seed Round` | 1, 15 | Your round stage, e.g. "Series A" |
| `$3.5M` | 1, 15 | Your round amount |
| `July 2026` | 1 | Month + year of this version |
| `Overline Ventures` | 1 | Name of the fund/investor this copy is prepared for (or "select investors") |
| `38%` | 2 | The headline % or figure in pain point #1 |
| `{{SCREENSHOT_1}}`, `{{SCREENSHOT_2}}` | 6 | HTML comments (not visible on the page) marking where to drop real product screenshots (see below) — these two remain as tokens on purpose |
| `Marcus Reyes`, `Aisha Khan`, `Sofia Tran` | 13, 16 | Team member names |
| `SAFE, $18M cap` | 15 | Your round terms |
| `Q4 2027` | 15 | Target quarter for next raise |
| `We're raising $3.5M to bring full freight-desk automation to 500 brokerages by 2028.` | 16 | Final CTA line |
| `marcus@northbaylogistics.ai` | 16 | Your email |
| `(415) 555-0142` | 16 | Your phone |
| `northbaylogistics.ai` | 16 | Your site/deck landing page |

Slide-specific numbers (pain stats, pricing, bar chart values, financial table, matrix dot positions) are also pre-filled with sample figures written directly in the HTML near each slide's `<section>` — edit the visible text/numbers in place. They aren't tokenized because they're unique per business, not swappable boilerplate.

## Swapping in real product screenshots (slide 6)

Slide 6 ships with two styled placeholder frames (dot-toolbar + diagonal texture) instead of external images, per the no-external-assets rule. To use real screenshots:

1. Convert your screenshot to a Base64 data URI (e.g. `base64 -i screenshot.png | pbcopy` on macOS).
2. Replace the contents of a `.screen-body` div with:
   `<img src="data:image/png;base64,PASTE_HERE" style="width:100%;height:100%;object-fit:cover;">`
3. Keep the `.screen-frame` / `.screen-bar` wrapper so the browser-chrome framing stays intact.

This keeps the file 100% self-contained — no broken links if someone opens it years from now.

## Exporting to PDF

1. Open `investor-deck.html` in **Chrome** (best print fidelity).
2. `Cmd+P` → Destination: **Save as PDF**.
3. In "More settings": Paper size **must** read as 1280×720px landscape — the file's `@page` rule sets this automatically, so leave Chrome's own paper-size dropdown on "Default."
4. Margins: **None**. Background graphics: **On** (this is required — it's what makes the gold gradients and dark background print instead of white).
5. Each of the 16 `<section class="slide">` elements is forced to its own page via `break-after: page`, so you'll get exactly 16 PDF pages, one slide each, no orphaned content.

## Switching dark → light (paper variant)

This template ships in the **dark Midnight Gold** variant (for on-screen pitching / data rooms). To produce a light "paper" version for printed leave-behinds:

1. In the `:root` block, swap the active background/ink variables to the paper set already defined in the tokens:
   - `--bg` → `var(--paper)`
   - `--bg2` → `var(--paper)`
   - `--panel` / `--panel2` → a very light gray, e.g. `#f3f1ea`
   - `--ink` → `var(--paper-ink)`
   - `--muted` → `var(--paper-muted)`
   - `--line` → `var(--paper-line)`
2. The gold accent colors (`--gold`, `--gold-2`, `--gold-dim`) stay the same in both variants — that's the brand thread.
3. Reduce `.glow` opacity to near-zero or delete the `.glow` divs — the radial gold glow is a dark-mode-only micro-texture per the design spec.

## File structure

```
investor-deck/
  investor-deck.html   ← the template (this file), sample-filled
  README.md            ← this file
  PREVIEW.md            ← sales description + suggested price
```

No other files, no dependencies, nothing to install.
