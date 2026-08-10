# The DHAHAB Lion — mark system

One mark, one generator. Everything below comes out of `tools/brand/lion.py`; nothing is
hand-drawn, so a tweak to the geometry propagates to every surface on the next run.

```bash
python3 tools/brand/lion.py            # all SVGs -> public/img/brand/
python3 tools/brand/lion.py --png      # + favicons, app icons, OG card (needs rsvg-convert)
python3 tools/brand/lion.py --kxngsef  # + garment print files -> ~/Desktop/KXNGSEF/designs/

# downstream of the mark
uv run --with segno python tools/brand/kit.py all       # avatars, banners, maskable icons,
                                                        # iOS splashes, kit zip, business card
python3 tools/brand/paper.py all                        # letterhead + invoice
```

Three files, one direction of flow: `lion.py` owns the geometry, `kit.py` and `paper.py`
only ever consume it. Nothing downstream redraws the mark, so a tweak upstream moves
everything.

## Why a lion

KXNG SEF is already king + sword (سيف). DHAHAB is gold. A lion's mane is the one figure that
carries both without a word: a crowned head made of gold. It also survives scale — the mane
silhouette is recognisable at 16px where a monogram is not.

## Construction

- **Mane** — two tiers of tapered shards. Reach is a function of angle: cropped over the brow,
  heaviest at the jaw, plus two low harmonics. A constant radius reads as a sun, which is the
  failure mode this geometry exists to avoid. Shard lengths carry a deterministic jitter for the
  same reason — uniform petals read as a flower.
- **Head** — a shield, not a circle: broad brow, tapered cheeks, rounded chin, set at 87% of the
  mane's inner radius so the mane stays visible.
- **Face** — angled eyes (outer corner lifted), heavy brow bars, broad nose, philtrum, and a
  muzzle whose lobes fall away. Drop the philtrum or lift the lobe ends and the mark turns into a
  smiley; that is the single most fragile detail in the design.

## Files (`public/img/brand/`)

| File | Use |
|---|---|
| `lion-mark.svg` | Master. Gold gradient, transparent field. Site nav, page headers, footers. |
| `lion-mark-flat.svg` | Single flat gold — anywhere a gradient would band (small sizes, print). |
| `lion-mark-bone.svg` | Bone on ink — dark garments, dark decks. |
| `lion-mark-ink.svg` | Ink on bone — light garments, white paper, invoices. |
| `lion-monogram.svg` | Mane with a `YG` serif monogram instead of a face. Formal/resume use. |
| `lion-tile.svg` | Rounded-square app tile → `favicon.svg`, `icon-192/512.png`, `apple-touch-icon.png`. |
| `lockup-yg.svg` / `-light.svg` | `YUSUF GADELRAB` + `DHAHAB · ذهب`. Personal wordmark. |
| `lockup-dhahab.svg` / `-light.svg` | Studio lockup + `THE GOLDEN STANDARD`. |
| `lockup-kxngsef.svg` | `KXNG SEF` + `EARNED. NEVER GIVEN.` |
| `og-card.svg` → `og-card.png` | 1200×630 social card. |

Lockup canvases size themselves to the word, so a longer name never overflows the viewBox.

## Rules

1. **Gold on black, or ink on bone.** No third colourway. The gradient runs light→dark top to
   bottom; never rotate it.
2. **Clear space** = one ear-width (about 12% of the mark) on all sides.
3. **Minimum size** 24px for the master mark, 16px for the tile. Below 24px use the tile — the
   loose shards blur.
4. **Never** recolour the mane per-shard, add an outline, place the mark on a busy photo, or
   stretch it non-uniformly.
5. **KXNG SEF garments keep the brand's one-hero-element rule.** The lion prints gold only when
   it is the largest graphic in the piece with no competing hero word (design 23). Beside a giant
   word, the lion prints bone like any other supporting element.

## The kit (`kit.py`)

| Output | Where it goes | Note |
|---|---|---|
| `avatar-400/800/1024.png` | `public/img/brand/kit/` | LinkedIn, GitHub, Instagram. Inset so a circular crop never clips the mane. |
| `avatar-light-800.png` | same | Ink on bone. **Must** pass `ink=BONE` — ink-on-ink swallows the face. |
| `banner-linkedin-1584x396.png` | same | Content sits right of centre: LinkedIn drops the profile photo over the lower-left. |
| `banner-x-1500x500.png` | same | X and GitHub headers. |
| `splash-*.png` | same | iOS PWA launch images; without them iOS flashes white. |
| `icon-maskable-192/512.png` | `public/` | Middle-80% safe zone — Android crops adaptive icons. Separate file, not a relabel. |
| `safari-pinned-tab.svg` | `public/` | Single flat colour, no background. |
| `dhahab-lion-kit.zip` | `public/downloads/` | Public download from `/brand.html`. |
| `business-card-{front,back}.pdf` | `~/Desktop/Career/` | **Not** published: carries the phone number. |

Business card: 3.5×2in trim + 0.125in bleed (sheets are 3.75×2.25in), everything inside a
0.25in safe margin. The QR is dark-on-light at error level H — inverted QR codes fail on a
lot of scanners, so the bone panel behind it is load-bearing, not decoration. Verified by
decoding a 150dpi render back to `https://yusuf-gadelrab.github.io/`.

## Business paper (`paper.py`)

Letterhead and invoices, ink-on-bone, output to `~/Desktop/Money-Machine-Assets/paper/`
(also unpublished — phone number, and invoices carry payment details). `letterhead.html`
is the editable blank. Prints light on purpose: a black-flooded sheet drinks toner and
reads as a flyer rather than correspondence.

## Where it ships

- Site: nav brand and page header on 29 pages, SPA footer, favicon, OG card.
- PWAs: TradeLog / Cut / Fire manifests + apple-touch-icon (caches bumped to v6).
- KXNG SEF: `designs/23-lion-dhahab-{dark,light}.svg`, 4500×5400 POD print area.
  Outline the text before POD upload — the condensed stack will not embed.
  (Renumbered 15→23 in the 2026-07-31 designs.json renumber; print plates cut 2026-08-01.)
- Products: cover stamp via `digital-products/_assets/engine`.
