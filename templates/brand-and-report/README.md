# Brand Guidelines & Case Study Report Pack — Midnight Gold

Three self-contained HTML documents (no build step, no internet connection required):

- `brand-guidelines.html` — 9-page brand guide, Letter landscape, dark Midnight Gold. Logo usage, clear space, palette, type, voice, photography, iconography, application mockups.
- `case-study.html` — 4-page client case study, Letter portrait, paper-white. Cover, challenge/approach, results + client quote, next-steps CTA.
- `one-page-report.html` — 1-page monthly client report, Letter portrait, paper-white. KPI tiles, trend bars, wins/risks/next-month.

Sample content ships pre-filled for a fictional agency, **Halloway Studio**, reporting on a fictional client, **Cascade Freight Brokers** — replace with your own.

## How to edit

All three documents ship **pre-filled with sample content** — no raw `{{TOKEN}}` placeholders are visible anywhere on the page (this is what buyers see in the live preview). The sample copy uses a fictional agency, **Halloway Studio**, reporting on a fictional client, **Cascade Freight Brokers**. To make it yours, open any file in a text editor (or right-click → Open With → TextEdit / VS Code / Notepad) and find-and-replace the exact literal sample strings listed below. Each file also has an `<!-- ===== EDIT BELOW ===== -->` comment marking where the sample copy starts.

No coding knowledge required to swap text. To change colors, fonts, or layout, edit the `:root { }` block and the CSS rules below it — every file uses the same token names.

## Full token list

Paste this into the `:root` of any file to keep the three documents in sync:

```css
:root{
  --bg:#0a0a0b; --bg2:#111114; --panel:#141417; --panel2:#191920;
  --gold:#d4af37; --gold-2:#f4d47a; --gold-dim:#8a7328;
  --ink:#f5f2e8; --muted:#a39f94;
  --line:rgba(212,175,55,.16); --glow:rgba(212,175,55,.35);
  --paper:#fbfaf7; --paper-ink:#14140f; --paper-muted:#6b675c; --paper-line:rgba(20,20,15,.12);
}
```

| Token | Hex | Used for |
|---|---|---|
| `--bg` | #0a0a0b | Midnight background (dark pages) |
| `--bg2` | #111114 | Secondary dark panel |
| `--panel` / `--panel2` | #141417 / #191920 | Cards, tiles on dark pages |
| `--gold` | #d4af37 | Primary accent, rules, icons |
| `--gold-2` | #f4d47a | Light gold — gradient highlight, eyebrows |
| `--gold-dim` | #8a7328 | Secondary gold — labels, subtle strokes |
| `--ink` | #f5f2e8 | Primary text on dark backgrounds |
| `--muted` | #a39f94 | Secondary text on dark backgrounds |
| `--line` | rgba(212,175,55,.16) | Hairline dividers on dark backgrounds |
| `--paper` | #fbfaf7 | Paper-white page background (print docs) |
| `--paper-ink` | #14140f | Primary text on paper |
| `--paper-muted` | #6b675c | Secondary text on paper |
| `--paper-line` | rgba(20,20,15,.12) | Hairline dividers on paper |

## Sample strings to find-and-replace (was `{{PLACEHOLDER}}`, now pre-filled)

Each row shows the exact sample text sitting in the files today. Search for the left-hand string and replace every occurrence with your own value — this keeps the three documents in sync since they share the same fictional entities.

| Sample string in the files | Original token | What it represents |
|---|---|---|
| `Halloway Studio` | `{{COMPANY}}` | The agency's name |
| `Brand systems and growth infrastructure for logistics and B2B service companies.` | `{{TAGLINE}}` | Agency one-liner |
| `2026` | `{{YEAR}}` | Edition year (brand-guidelines cover) |
| `2021` | `{{FOUNDED_YEAR}}` | Agency founding year |
| `Austin, TX` | `{{CITY}}` | Agency city |
| `Dana Halloway` | `{{FOUNDER}}` | Agency principal/founder name |
| `dana@hallowaystudio.com` | `{{EMAIL}}` | Agency contact email |
| `(512) 555-0118` | `{{PHONE}}` | Agency contact phone |
| `hallowaystudio.com` | `{{SITE}}` | Agency site |
| `Cascade Freight Brokers` | `{{CLIENT}}` | The client's name |
| `Spokane, WA` | `{{CLIENT_CITY}}` | Client city |
| `Ray Delgado` | `{{CLIENT_CONTACT_NAME}}` | Client contact name (quoted in case study) |
| `Director of Operations` | `{{CLIENT_CONTACT_TITLE}}` | Client contact title |
| `From 4-hour quotes to 22 minutes.` | `{{HEADLINE_RESULT}}` | Case-study cover headline |
| `One quarter (Q2 2026)` | `{{ENGAGEMENT_LENGTH}}` | Case-study engagement length |
| `June 2026` | `{{MONTH}}` | Report month (one-page-report) |
| `Spokane–Portland` | `{{LANE_NAME}}` | Lane referenced in the report's Risks column |

`{{PHOTO_URL}}` remains as a literal token — it only appears inside HTML comments in `brand-guidelines.html`'s Photography section (not visible on the page), marking where you can drop in a real image URL or replace the placeholder box with an `<img>` tag.

## How to export to PDF

1. Open the `.html` file by double-clicking it (opens in your default browser).
2. `Cmd+P` (Mac) or `Ctrl+P` (Windows) → choose **Save as PDF**.
3. `brand-guidelines.html` is formatted for **Letter — Landscape**; `case-study.html` and `one-page-report.html` are formatted for **Letter — Portrait**. Set the print dialog's orientation to match, and turn on "Background graphics" so the gold/dark colors print correctly.
4. Margins should stay at "None" / "Default" — the templates already build in their own margins.

## Notes

- All three files are fully self-contained: inline CSS, inline SVG icons, no fonts or scripts loaded from the internet. They will render offline.
- The brand mark (gold diamond monogram) is inline SVG in every file — copy the `<svg class="mark">...</svg>` block anywhere you need the logo.
