"""DHAHAB brand kit — everything downstream of the lion mark.

Avatars, banners, maskable app icons, the downloadable kit zip, and the
print-ready business card. Geometry comes from lion.py; nothing here redraws
the mark, so the whole kit moves when the mark moves.

    uv run --with segno python tools/brand/kit.py all
    uv run --with segno python tools/brand/kit.py avatars banners icons zip card

The business card is written to ~/Desktop/Career/, NOT into public/ — it
carries a phone number, and publish-safety rules keep that off the website.
"""
import os
import subprocess
import sys
import zipfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lion  # noqa: E402

ROOT = lion.ROOT
BRAND = lion.OUT
KIT = os.path.join(BRAND, "kit")
DOWNLOADS = os.path.join(ROOT, "public", "downloads")
CAREER = os.path.expanduser("~/Desktop/Career")
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

INK, GOLD, BONE = lion.INK, lion.GOLD, lion.BONE
SITE = "yusuf-gadelrab.github.io"


def _svg(body, w, h):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" '
        f'width="{w}" height="{h}">{body}</svg>'
    )


def _mark_body(gold="url(#dg)", flat=False, knockout=False, ink=None):
    """Inner markup of the mark, with its <defs>, ready to transform."""
    s = lion.mark(gold=gold, flat=flat, knockout=knockout,
                  **({"ink": ink} if ink else {}))
    return s.split(">", 1)[1].rsplit("</svg>", 1)[0]


def _render(svg_text, out_png, w, h=None):
    tmp = out_png + ".svg"
    with open(tmp, "w") as fh:
        fh.write(svg_text)
    cmd = ["rsvg-convert", "-w", str(w)]
    if h:
        cmd += ["-h", str(h)]
    cmd += [tmp, "-o", out_png]
    subprocess.run(cmd, check=True)
    os.remove(tmp)
    print("  ", os.path.relpath(out_png, ROOT))


# ---------------------------------------------------------------- avatars
def avatars():
    """Square profile pictures. Full-bleed ink field, mark inset ~18% so a
    circular crop (LinkedIn, GitHub, Instagram) never clips the mane."""
    os.makedirs(KIT, exist_ok=True)
    body = _mark_body()
    svg = _svg(
        f'<rect width="1024" height="1024" fill="{INK}"/>'
        f'<g transform="translate(512 512) scale(3.2) translate(-128 -128)">{body}</g>',
        1024, 1024,
    )
    for size in (400, 800, 1024):
        _render(svg, os.path.join(KIT, f"avatar-{size}.png"), size, size)

    # bone-ground variant for light-mode profiles and print directories.
    # ink=BONE matters: without it the face disc renders ink-on-ink and the
    # eyes, brow and muzzle vanish into the silhouette.
    body_ink = _mark_body(gold=INK, flat=True, ink=BONE)
    svg_l = _svg(
        f'<rect width="1024" height="1024" fill="{BONE}"/>'
        f'<g transform="translate(512 512) scale(3.2) translate(-128 -128)">{body_ink}</g>',
        1024, 1024,
    )
    _render(svg_l, os.path.join(KIT, "avatar-light-800.png"), 800, 800)


# ---------------------------------------------------------------- banners
def _banner(w, h, headline, sub, mark_scale, mark_x, text_x, hsize, ssize):
    body = _mark_body()
    cy = h / 2
    return _svg(
        f'<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">'
        f'<stop offset="0" stop-color="#0a0a0b"/><stop offset="0.55" stop-color="#111114"/>'
        f'<stop offset="1" stop-color="#0a0a0b"/></linearGradient>'
        f'<radialGradient id="bloom" cx="0.18" cy="0.5" r="0.6">'
        f'<stop offset="0" stop-color="{GOLD}" stop-opacity="0.16"/>'
        f'<stop offset="1" stop-color="{GOLD}" stop-opacity="0"/></radialGradient></defs>'
        f'<rect width="{w}" height="{h}" fill="url(#bg)"/>'
        f'<rect width="{w}" height="{h}" fill="url(#bloom)"/>'
        f'<rect x="16" y="16" width="{w-32}" height="{h-32}" fill="none" '
        f'stroke="{GOLD}" stroke-opacity="0.28" stroke-width="1.5"/>'
        f'<g transform="translate({mark_x} {cy}) scale({mark_scale}) translate(-128 -128)">{body}</g>'
        f'<text x="{text_x}" y="{cy - 6}" font-family="Georgia,\'Times New Roman\',serif" '
        f'font-weight="700" font-size="{hsize}" letter-spacing="2" fill="{BONE}">{headline}</text>'
        f'<text x="{text_x}" y="{cy + ssize + 14}" font-family="Georgia,serif" '
        f'font-size="{ssize}" letter-spacing="4" fill="{GOLD}" fill-opacity="0.92">{sub}</text>',
        w, h,
    )


def banners():
    """LinkedIn (1584x396), X/GitHub (1500x500), and a 1200x400 generic strip."""
    os.makedirs(KIT, exist_ok=True)
    # LinkedIn drops the profile photo over the banner's lower-left, so that
    # corner has to stay empty — hence the LinkedIn mark sits far right of the
    # others rather than at a shared x.
    specs = [
        ("banner-linkedin-1584x396.png", 1584, 396, 0.95, 560, 700, 52, 21),
        ("banner-x-1500x500.png", 1500, 500, 1.15, 210, 380, 58, 23),
        ("banner-wide-1200x400.png", 1200, 400, 0.92, 160, 290, 46, 19),
    ]
    for name, w, h, sc, mx, tx, hs, ss in specs:
        svg = _banner(
            w, h,
            "YUSUF GADELRAB",
            "CS @ SJSU · AI SYSTEMS · TRADING · BUILT IN PUBLIC",
            sc, mx, tx, hs, ss,
        )
        _render(svg, os.path.join(KIT, name), w, h)


# ------------------------------------------------------------ app icons
def icons():
    """Maskable PWA icons.

    Android crops an adaptive icon to whatever shape the launcher wants, so a
    maskable icon must keep everything inside the middle 80% — the mark is
    scaled down accordingly, which is why this is a separate file from the
    normal tile rather than the same PNG relabelled.
    """
    os.makedirs(KIT, exist_ok=True)
    body = _mark_body(gold=GOLD, flat=True)
    svg = _svg(
        f'<rect width="1024" height="1024" fill="{INK}"/>'
        f'<g transform="translate(512 512) scale(2.05) translate(-128 -128)">{body}</g>',
        1024, 1024,
    )
    for size in (192, 512):
        _render(svg, os.path.join(ROOT, "public", f"icon-maskable-{size}.png"), size, size)

    # monochrome mark for Safari pinned tabs — one flat colour, no background
    mono = _svg(_mark_body(gold="#000000", flat=True), 256, 256)
    p = os.path.join(ROOT, "public", "safari-pinned-tab.svg")
    with open(p, "w") as fh:
        fh.write(mono + "\n")
    print("  ", os.path.relpath(p, ROOT))


# ------------------------------------------------------------- splashes
def splashes():
    """iOS standalone launch images. iOS shows a blank white screen without
    them once a PWA is on the home screen."""
    os.makedirs(KIT, exist_ok=True)
    body = _mark_body()
    for w, h in ((1170, 2532), (1290, 2796), (828, 1792), (1536, 2048)):
        cy = h / 2
        svg = _svg(
            f'<rect width="{w}" height="{h}" fill="{INK}"/>'
            f'<g transform="translate({w/2} {cy - h*0.04}) scale({w/640:.3f}) '
            f'translate(-128 -128)">{body}</g>'
            f'<text x="{w/2}" y="{cy + h*0.12}" font-family="Georgia,serif" '
            f'font-size="{int(w*0.038)}" letter-spacing="{int(w*0.012)}" fill="{GOLD}" '
            f'text-anchor="middle">DHAHAB</text>',
            w, h,
        )
        _render(svg, os.path.join(KIT, f"splash-{w}x{h}.png"), w, h)


# ------------------------------------------------------------- kit zip
KIT_README = """DHAHAB — LION MARK KIT
======================

The house mark of Yusuf Gadelrab (DHAHAB / ذهب — "gold").

FILES
  lion-mark.svg          master, gradient gold, transparent field
  lion-mark-flat.svg     one flat gold — small sizes and print
  lion-mark-bone.svg     bone on ink — dark garments and decks
  lion-mark-ink.svg      near-black on bone — light garments, paper
  lion-monogram.svg      mane with a YG monogram instead of a face
  lion-tile.svg          rounded app tile — favicons, home-screen icons
  lockup-*.svg           mark + wordmark, dark and light text variants
  avatar-*.png           square profile pictures (circular-crop safe)
  banner-*.png           LinkedIn / X / generic header images

RULES
  1. Two colourways only: gold on black, or ink on bone. Never a third.
  2. Clear space of one ear-width (~12% of the mark) on every side.
  3. Minimum 24px for the master mark, 16px for the tile. Below that, use the tile.
  4. Never recolour individual shards, add an outline, stretch it unevenly, or
     place it on a busy photograph.
  5. The gradient runs light-to-dark, top to bottom. It never rotates.

Full spec: https://yusuf-gadelrab.github.io/brand.html
© 2026 Yusuf Gadelrab. The mark is his identity — use it to refer to him or his
work, not as your own brand.
"""


def kit_zip():
    os.makedirs(DOWNLOADS, exist_ok=True)
    out = os.path.join(DOWNLOADS, "dhahab-lion-kit.zip")
    members = [
        "lion-mark.svg", "lion-mark-flat.svg", "lion-mark-bone.svg",
        "lion-mark-ink.svg", "lion-monogram.svg", "lion-tile.svg",
        "lockup-yg.svg", "lockup-yg-light.svg", "lockup-dhahab.svg",
        "lockup-dhahab-light.svg", "lockup-kxngsef.svg",
    ]
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        for m in members:
            p = os.path.join(BRAND, m)
            if os.path.exists(p):
                z.write(p, f"dhahab-lion-kit/{m}")
        for m in ("avatar-400.png", "avatar-800.png", "avatar-light-800.png",
                  "banner-linkedin-1584x396.png", "banner-x-1500x500.png"):
            p = os.path.join(KIT, m)
            if os.path.exists(p):
                z.write(p, f"dhahab-lion-kit/{m}")
        z.writestr("dhahab-lion-kit/README.txt", KIT_README)
    print("  ", os.path.relpath(out, ROOT), f"{os.path.getsize(out)//1024} KB")


# ---------------------------------------------------------- business card
CARD_CSS = """
@page {{ size: 3.75in 2.25in; margin: 0; }}
* {{ box-sizing: border-box; margin: 0; padding: 0; }}
html, body {{ width: 3.75in; height: 2.25in; -webkit-print-color-adjust: exact;
  print-color-adjust: exact; overflow: hidden; }}
body {{ font-family: Georgia, "Times New Roman", serif; }}
/* 3.5x2in card + 0.125in bleed on every side = 3.75x2.25in trim sheet */
.bleed {{ position: relative; width: 3.75in; height: 2.25in; background: {bg};
  color: {fg}; }}
.safe {{ position: absolute; inset: 0.25in; }}
.rule {{ position: absolute; left: 0.25in; right: 0.25in; height: 1px;
  background: {gold}; opacity: .45; }}
.name {{ font-size: 19.5pt; font-weight: 700; letter-spacing: .5pt; }}
.role {{ font-family: -apple-system, "Helvetica Neue", sans-serif; font-size: 7.2pt;
  letter-spacing: 1.9pt; text-transform: uppercase; color: {gold}; margin-top: 5pt; }}
.mark {{ position: absolute; width: 0.62in; height: 0.62in; }}
.lines {{ font-family: ui-monospace, Menlo, monospace; font-size: 7.4pt;
  line-height: 1.85; letter-spacing: .2pt; }}
.lines b {{ color: {gold}; font-weight: 400; }}
.tag {{ font-size: 8.6pt; font-style: italic; color: {gold}; }}
.qr {{ position: absolute; right: 0.26in; top: 0.42in; width: 0.80in; height: 0.80in;
  background: {bone}; border-radius: 3pt; }}
.qrcap {{ position: absolute; right: 0.26in; top: 1.26in; width: 0.80in;
  font-family: ui-monospace, Menlo, monospace; font-size: 5pt; text-align: center;
  letter-spacing: 1pt; color: {gold}; opacity: .8; }}
.backmark {{ position: absolute; left: 0.26in; bottom: 0.24in; width: 0.30in; height: 0.30in;
  opacity: .9; }}
.backline {{ position: absolute; left: 0.64in; bottom: 0.27in; font-size: 6.6pt;
  letter-spacing: 2.2pt; text-transform: uppercase;
  font-family: -apple-system, "Helvetica Neue", sans-serif; color: {gold}; opacity: .85; }}
"""

CARD_FRONT = """<!doctype html><html><head><meta charset="utf-8"><style>{css}</style></head>
<body><div class="bleed">
  <img class="mark" src="{lion}" style="left:.25in;top:.30in">
  <div class="safe" style="display:flex;flex-direction:column;justify-content:center;
       align-items:flex-start;padding-left:.78in">
    <div class="name">Yusuf Gadelrab</div>
    <div class="role">Computer Science · SJSU</div>
  </div>
  <div class="rule" style="bottom:.52in"></div>
  <div class="safe" style="top:auto;bottom:.22in;height:auto">
    <div class="tag">AI systems, trading infrastructure, built in public.</div>
  </div>
</div></body></html>"""

CARD_BACK = """<!doctype html><html><head><meta charset="utf-8"><style>{css}</style></head>
<body><div class="bleed">
  <div class="safe">
    <div class="lines" style="margin-top:.10in">
      <div><b>web</b>&nbsp;&nbsp;{site}</div>
      <div><b>mail</b>&nbsp;{email}</div>
      <div><b>tel</b>&nbsp;&nbsp;{phone}</div>
      <div><b>git</b>&nbsp;&nbsp;github.com/Yusuf-Gadelrab</div>
      <div><b>in</b>&nbsp;&nbsp;&nbsp;in/yusuf-gadelrab-76246b221</div>
    </div>
  </div>
  <img class="qr" src="{qr}">
  <div class="qrcap">PORTFOLIO</div>
  <img class="backmark" src="{lion}">
  <div class="backline">DHAHAB</div>
</div></body></html>"""


def _b64(path, mime):
    import base64
    with open(path, "rb") as fh:
        return f"data:{mime};base64," + base64.b64encode(fh.read()).decode()


def card():
    """Print-ready business card, 3.5x2in + 0.125in bleed, front and back.

    Written to ~/Desktop/Career/ and deliberately NOT into public/: it carries
    a phone number, and that stays off the website.
    """
    try:
        import segno
    except ImportError:
        print("  card: needs segno — run with `uv run --with segno`")
        return
    os.makedirs(CAREER, exist_ok=True)
    qr_path = os.path.join(CAREER, "_card-qr.png")
    segno.make(f"https://{SITE}/", error="h").save(
        qr_path, scale=14, border=2, dark=lion.INK, light=BONE)

    lion_uri = _b64(os.path.join(BRAND, "lion-mark-flat.svg"), "image/svg+xml")
    qr_uri = _b64(qr_path, "image/png")
    css = CARD_CSS.format(bg=INK, fg=BONE, gold=GOLD, bone=BONE)

    pages = {
        "business-card-front.pdf": CARD_FRONT.format(css=css, lion=lion_uri),
        "business-card-back.pdf": CARD_BACK.format(
            css=css, qr=qr_uri, lion=lion_uri, site=SITE,
            email="yusuf.gadelrab06@gmail.com", phone="(669) 328-1148"),
    }
    for name, html in pages.items():
        html_path = os.path.join(CAREER, name.replace(".pdf", ".html"))
        with open(html_path, "w") as fh:
            fh.write(html)
        out = os.path.join(CAREER, name)
        subprocess.run([
            CHROME, "--headless", "--disable-gpu", "--no-pdf-header-footer",
            f"--print-to-pdf={out}", "file://" + html_path,
        ], check=True, capture_output=True)
        os.remove(html_path)
        print("  ", out)
    os.remove(qr_path)

    with open(os.path.join(CAREER, "business-card-README.md"), "w") as fh:
        fh.write(CARD_README)
    print("   ", os.path.join(CAREER, "business-card-README.md"))


CARD_README = """# Business card — DHAHAB lion

`business-card-front.pdf` · `business-card-back.pdf`

- **Trim size 3.5 × 2 in** (US standard) with **0.125 in bleed on all sides**, so the
  sheets are 3.75 × 2.25 in. Every printer asks for bleed; supplying it is what stops a
  white hairline appearing along an edge after cutting.
- Everything important sits inside a 0.25 in safe margin, so a 1/16 in cutting drift
  costs nothing.
- Back carries the phone number. This is why the card lives here and **not** in the
  website repo — the same publish-safety rule that keeps the phone off modeling.html.
- The QR points at `https://yusuf-gadelrab.github.io/` at error-correction level H, so it
  still scans if a corner scuffs in a pocket.

## Printing (cheapest first)
| Where | ~100 cards | Notes |
|---|---|---|
| SJSU print shop | usually cheapest for students | ask for 16pt matte, full bleed |
| VistaPrint | ~$20–30 | upload both PDFs, choose "no border" |
| MOO | ~$40+ | better stock, worth it only if you want the heavier feel |

Ask for **matte or soft-touch, 16pt**. Gloss blows out the gold and fingerprints show
on a black card.

## Before the Sep 9–10 SJSU STEM fair
Order by **late August** — standard shipping is 5–10 business days. 100 is plenty for a
two-day fair; you will hand out 30–50.

Regenerate after any change to the mark:
`cd ~/Yusuf-Gadelrab.github.io && uv run --with segno python tools/brand/kit.py card`
"""


STAGES = {
    "avatars": avatars, "banners": banners, "icons": icons,
    "splashes": splashes, "zip": kit_zip, "card": card,
}


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("-")]
    if not args or args == ["all"]:
        args = list(STAGES)
    os.makedirs(KIT, exist_ok=True)
    for a in args:
        fn = STAGES.get(a)
        if not fn:
            print("unknown stage:", a, "— have:", ", ".join(STAGES))
            continue
        print(f"=== {a} ===")
        fn()


if __name__ == "__main__":
    main()
