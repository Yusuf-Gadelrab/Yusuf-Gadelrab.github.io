# Client Proposal & Statement of Work — Midnight Gold

Two self-contained HTML files. No build step, no internet connection required — double-click to open in any browser.

- **`client-proposal.html`** — the full 9-page sell-and-close proposal (cover → executive summary → problem → solution → scope → deliverables → investment → terms → signature).
- **`sow-standalone.html`** — a tighter 3-page SOW-only version (scope → deliverables/timeline → terms/signature) for a client who has already agreed on price and just needs the paperwork.

Both ship pre-filled with a believable sample engagement — **Haulwright AI back-office pilot for Cascade Freight Brokers** (an entirely fictional vendor, product and client) ($999 setup + $249/mo, Growth Partner tier) — so you can see real spacing and line lengths instead of lorem ipsum. Dates, tiers, and totals are internally consistent; use them as your editing reference.

## How to edit

Every editable field lives inside an `<!-- ===== EDIT BELOW ===== -->` comment block near the top of the `<body>` in each file. There is no `{{BRACE}}` templating layer — search-and-replace the sample strings below directly in your text editor (Cmd/Ctrl+F):

| Find this sample value | Replace with |
|---|---|
| `Cascade Freight Brokers` | Your client's company name (appears in cover, footers, sig block) |
| `Marcus Reyes, Director of Operations` | Your client contact's name & title |
| `Haulwright AI` / `Back-Office Automation Pilot` | Your project/product name |
| `Devin Marsh` / `Halloway Studio` | Your name / studio name |
| `hello@hallowaystudio.com`, `(503) 555-0182`, `hallowaystudio.com` | Your contact details |
| `July 31, 2026` | Proposal date |
| `CFB-2026-0731` / `CFB-2026-0731-SOW` | Your proposal/SOW numbering scheme |
| `Aug 4, 2026` … `Oct 19, 2026` | Every phase/milestone date — keep them chronologically consistent |
| `$699` / `$999` / `$1,899` (setup) and `$149` / `$249` / `$449` (monthly) | Your three pricing tiers |
| Body copy in Executive Summary, Findings, Terms | Rewrite per client — keep sentence lengths similar so layout doesn't reflow badly |

The 3 numbered findings, the IN/OUT scope tables, the milestone table rows, and the tier `<ul>` bullets are the sections you'll touch most often — each is a plain HTML block, safe to duplicate/delete a `<tr>` or `<li>` without breaking layout.

## Design tokens

Both files share the Midnight Gold token set in `:root`:

```css
:root{
  --bg:#0a0a0b; --bg2:#111114; --panel:#141417; --panel2:#191920;
  --gold:#d4af37; --gold-2:#f4d47a; --gold-dim:#8a7328;
  --ink:#f5f2e8; --muted:#a39f94;
  --line:rgba(212,175,55,.16); --glow:rgba(212,175,55,.35);
  --paper:#fbfaf7; --paper-ink:#14140f; --paper-muted:#6b675c; --paper-line:rgba(20,20,15,.12);
}
```

- The **cover page** (and the SOW's letterhead band) use the dark `--bg`/`--gold` palette.
- **Interior pages** use the `--paper` palette (paper-white background, ink-black text, gold accents/hairlines) so the document reads as a premium printed document, not a slide deck.
- Display type is Georgia/serif; body/UI is system sans-serif; eyebrows are 11px uppercase gold.

To re-theme for a different brand, change `--gold`/`--gold-2`/`--gold-dim` only — every other token is structural (dark/paper split) and should stay put per the shared suite spec.

## Exporting to PDF

1. Open the `.html` file in Chrome or Safari.
2. `Cmd+P` (Mac) / `Ctrl+P` (Windows) → destination **Save as PDF**.
3. Set margins to **None** (the page already has its own 56px+ inner padding built in) and make sure **Background graphics** is checked — otherwise the gold accents and dark cover won't print.
4. Paper size: **Letter**. Each `<section class="page">` is exactly one PDF page, with `break-after:page` handling pagination automatically — no manual page breaks needed.

## Notes

- Fully self-contained: inline `<style>`, inline SVG monogram, no external fonts, no CDN, no JS. Works completely offline.
- `break-inside:avoid` is applied to table rows, finding blocks, pricing tiers, and term blocks so nothing splits awkwardly across a page boundary during PDF export.
