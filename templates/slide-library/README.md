# Midnight Gold — Slide Library

60 standalone, mix-and-match slide layouts in the Midnight Gold visual system (dark, gold-on-black, serif display type). Unlike the Investor Deck, this pack isn't a fixed narrative — it's a library. Pull any slide into any deck: sales, QBR, board update, training, conference talk.

One file: `slide-library.html`. Self-contained, no external requests, no chart libraries (every chart is hand-built CSS/inline SVG). Opens by double-click, prints/exports to PDF at 1280×720 per slide — identical to the Investor Deck's slide mechanics (`.deck` flex column, `gap:24px; padding:24px 0`, each `.slide` is `break-after:page`).

## How to use a slide in another deck

1. Open `slide-library.html` and find the slide you want (see the full index below, or use the on-slide index label, e.g. `"24 · Horizontal Bar Chart"`).
2. Select and copy the entire block from `<section class="slide...">` to its matching `</section>`.
3. Paste it inside the `<div class="deck">...</div>` of the target Midnight Gold file, in the position you want it to appear.
4. If the target file doesn't already have the shared `:root` tokens, the `.slide`/`.content`/`.footer`/`.mono` base rules, or the `#gGold` SVG gradient def, copy those in too (they're all in the `<style>` block and the small `<svg class="defs-svg">` block near the top of `<body>`).
5. Edit the sample copy in place — every slide ships pre-filled with believable placeholder business content, not `{{TOKENS}}`, so just overwrite it directly.

## How to hide the index labels

Every slide has a small corner label like `24 · Funnel` so you can find slides fast while browsing. To remove them everywhere at once (e.g. before sending a real client deck), open `slide-library.html`, find this line near the top of `<style>`:

```css
.idx{ position:absolute; top:60px; left:72px; z-index:2; font-size:10px; letter-spacing:1px; color:var(--gold-dim); text-transform:uppercase; font-family:-apple-system,sans-serif; }
```

...and add `display:none !important;` to it (or delete the rule). That's the only edit needed — it's one shared class, so it disables every label in the file at once.

## How to recolor

All color comes from CSS custom properties defined once in `:root` at the top of the `<style>` block:

```css
:root{
  --bg:#0a0a0b; --bg2:#111114; --panel:#141417; --panel2:#191920;
  --gold:#d4af37; --gold-2:#f4d47a; --gold-dim:#8a7328;
  --ink:#f5f2e8; --muted:#a39f94;
  --line:rgba(212,175,55,.16); --glow:rgba(212,175,55,.35);
}
```

Swap `--gold` / `--gold-2` / `--gold-dim` for your own accent (e.g. a blue or green), and every gradient text, chart fill, border, and glow updates across all 60 slides automatically. Keep `--bg`/`--panel` dark for the luxury read, or swap to the `--paper` tokens if you want a light/print variant (see the Investor Deck for a paper-mode example).

## PDF export

`Cmd+P` (or `Ctrl+P`) → destination "Save as PDF" → paper size will show as ~13.3in × 7.5in (1280×720px at 96dpi) if your browser respects the embedded `@page` rule. Chrome and Edge handle this correctly out of the box. Each slide lands on its own PDF page with no orphaned content, matching the screen view exactly.

## Full slide index (60 + 7 section dividers)

### Title & Section (6)
1. Cover — Dark Hero
2. Cover — Minimal Mark
3. Section Break
4. Quote Slide (full-bleed)
5. Closing — Thank You
6. Closing — Contact Card

### Text & Layout (10)
7. Statement
8. Two-Column
9. Three-Column
10. Big Quote (body layout)
11. Bulleted List
12. Numbered List
13. Definition / Term
14. Before / After
15. Do / Don't
16. Agenda

### Data (14)
17. Single Big Stat
18. 3-Stat Row
19. Bar Chart
20. Grouped Bar Chart
21. Horizontal Bar Chart
22. Line Chart
23. Area Chart
24. Donut Chart
25. Progress Rings
26. Funnel
27. Waterfall
28. Gauge
29. Sparkline Row
30. KPI Grid

### Comparison (8)
31. 2×2 Matrix
32. Feature Table
33. Pricing Tiers
34. Us vs. Them
35. Pros / Cons
36. Scorecard
37. Ranked List
38. Heat Grid

### Process & Time (8)
39. Horizontal Steps
40. Vertical Steps
41. Circular Process
42. Timeline
43. Roadmap / Gantt
44. Milestone Markers
45. Cycle
46. Swimlane

### People & Org (5)
47. Team Grid
48. Single Bio
49. Org Chart
50. Testimonial
51. Logo Wall

### Structure (9)
52. Map / Geo Abstract
53. Hierarchy Tree
54. Stack Diagram
55. Architecture Boxes
56. Flow with Branches
57. Card Grid
58. Image Placeholder — Split
59. Image Placeholder — Full Bleed
60. Thank You / Contact

A labeled divider slide precedes each of the 7 groups above, for a total of 67 slides in the file.

## Support

Yusuf Gadelrab · Automation Studio · San Jose, CA
yusuf.gadelrab06@gmail.com
https://yusuf-gadelrab.github.io/store.html
