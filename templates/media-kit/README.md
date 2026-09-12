# Creator Media Kit & Rate Card — Midnight Gold

Two self-contained HTML files, no build step, no internet connection needed.

- `media-kit.html` — full media kit (hero, stats, demographics, content pillars, past collabs, case study, rate card, process, testimonial, CTA)
- `one-pager.html` — condensed single-page version for cold-email attachments

Both open by double-clicking in any browser and print cleanly to US Letter (Cmd/Ctrl+P → Save as PDF).

## How to edit

Open either file in a text editor. Every editable block is wrapped like this:

```html
<!-- ===== EDIT BELOW: name + positioning ===== -->
... content here ...
<!-- ===== EDIT ABOVE ===== -->
```

Just replace the sample text (currently filled with a fictional creator, "Dara Whitfield") with your own numbers and copy. No CSS or layout knowledge required — leave everything outside the EDIT markers alone.

## Ships pre-filled with sample content

Both files render as a finished, filled-in media kit out of the box — no visible `{{TOKEN}}` placeholders — using a fictional creator, "Dara Whitfield" (fitness & recovery, 84K IG / 51K TikTok). Find-and-replace these exact sample strings with your own:

- **Name / positioning**: `Dara Whitfield`, "Fitness & recovery creator helping 135K+ followers train hard without breaking down..."
- **Stats**: `135K` followers, `62K` avg. reach, `6.8%` engagement, `210K` avg. views
- **Demographics**: age/gender/geo bar percentages (18–24 22%, 25–34 41%, etc.)
- **Content pillars**: "Injury-Proof Training", "Mobility & Recovery", "Real Talk Fitness"
- **Past collaborations**: `Recover Well Co.`, `Fernhollow Athletics`, `Cairn Supplements`, `Baseline Recovery`, `Anchorpoint Gear`, `Wildgrain Nutrition` — all fictional, invented for this template. Swap for your own real brand partners.
- **Case study**: "Recover Well Co. — Recovery Sleeve Launch" with before/after metrics
- **Rate card**: Instagram Reel $850, Story Set $350, TikTok Video $700, UGC Pack $600, Full Bundle $1,600
- **Process steps**: Discovery Call → Concept & Script → Film & Edit → Deliver & Report
- **Testimonial**: quote attributed to "Maya Lindqvist · Brand Partnerships Lead, Recover Well Co."
- **Contact email**: `hello@darawhitfield.com` (shown both as link text and as the `mailto:` target in the CTA button, both files)

## Tokens that deliberately remain

These can't be filled with sample data — they need your real assets/links, and they only ever appear inside `href`/`src` attributes (never as visible on-page text) — so they stay as literal `{{TOKEN}}` placeholders:

| Token | Where it appears | What to do |
|---|---|---|
| `{{PHOTO_URL}}` | Hero portrait frame (both files, inside an HTML comment) | Replace the `.portrait-frame` `<div>` with `<img src="{{PHOTO_URL}}">` sized to match (168×168 in media-kit.html, 108×108 in one-pager.html). Keep the same border-radius/border/shadow rules. |
| `{{INSTAGRAM_URL}}` | CTA button `href`, both files | Your Instagram profile link. |
| `{{TIKTOK_URL}}` | CTA button `href`, media-kit.html | Your TikTok profile link. |

Everything else — name, positioning line, follower counts, engagement stats, demographic percentages, content pillars, case study numbers, rate card prices, process steps, testimonial, brand names, contact email — is plain text inside the EDIT BELOW blocks. Search-and-replace "Dara Whitfield" (and `hello@darawhitfield.com`) and the sample numbers/brands with your own.

## Swapping the numbers

- **Stat tiles / chips**: just replace the digits, keep the `K`/`%` suffixes for consistent formatting.
- **Demographic bars**: each bar is one `<div class="bar-row">` with a `<b>` percentage label and a `<div class="bar-fill" style="width:XX%">`. Update both the label text and the `width` percentage together — they're pure CSS, no chart library involved.
- **Rate card**: each row is one `<tr>`. Add or remove rows freely; keep the `bundle` class on your highlighted row to preserve the gold background and "Most Booked" badge.

## Exporting to PDF

1. Open the file in Chrome or Safari.
2. Cmd+P (Mac) / Ctrl+P (Windows).
3. Destination → Save as PDF, Paper size → Letter.
4. Background graphics must be **on** (Chrome: "More settings" → check "Background graphics") to keep the dark theme and gold accents in the export.

The print stylesheet already handles page margins and keeps cards/table rows from splitting across a page break — no extra setup needed.

## Notes

- Fully offline: no CDN scripts, no webfonts, no external images. Safe to email as an attachment or host anywhere.
- Colors and type follow the Midnight Gold shared design spec — gold (`#d4af37`) and black only, serif display type, sans-serif body.
- Template built by Yusuf Gadelrab — Automation Studio · yusuf.gadelrab06@gmail.com
