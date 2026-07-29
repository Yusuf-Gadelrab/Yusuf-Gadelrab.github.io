#!/usr/bin/env python3
"""DHAHAB CIRCLE community assets — Discord icon, banner, invite splash, OG card.

    python3 tools/brand/circle_assets.py

Writes SVGs to public/img/brand/circle/ and rasterizes PNGs with rsvg-convert
(Discord only accepts raster for the server icon and banner).

WHY generated: same rule as the lion mark itself — nothing in this brand is
hand-drawn, so every surface stays pixel-identical when the mark changes.
"""
import os
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lion  # noqa: E402

GOLD = lion.GOLD
INK = lion.INK
BONE = lion.BONE
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "public", "img", "brand", "circle")


def _body():
    return lion.mark().split(">", 1)[1].rsplit("</svg>", 1)[0]


def icon(size=512):
    """Discord server icon — square, mark centred, hairline gold ring."""
    r = size / 2
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" width="{size}" height="{size}">'
        f'{lion.defs()}<rect width="{size}" height="{size}" fill="{INK}"/>'
        f'<circle cx="{r}" cy="{r}" r="{r - size * 0.045}" fill="none" stroke="{GOLD}" '
        f'stroke-width="{size * 0.006:.2f}" opacity="0.4"/>'
        f'<g transform="translate({r} {r}) scale({size / 256 * 0.72:.4f}) translate(-128 -128)">{_body()}</g>'
        "</svg>"
    )


def banner(W=960, H=540):
    """Discord server banner / invite background."""
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">'
        f'{lion.defs()}<rect width="{W}" height="{H}" fill="{INK}"/>'
        f'<rect x="20" y="20" width="{W-40}" height="{H-40}" fill="none" stroke="{GOLD}" '
        'stroke-width="1.5" opacity="0.3"/>'
        f'<g transform="translate({W/2} {H*0.40}) scale(0.82) translate(-128 -128)">{_body()}</g>'
        f'<text x="{W/2}" y="{H*0.735}" font-family="Georgia,serif" font-weight="700" font-size="52" '
        f'letter-spacing="7" fill="{BONE}" text-anchor="middle">DHAHAB CIRCLE</text>'
        f'<text x="{W/2}" y="{H*0.815}" font-family="Georgia,serif" font-size="20" letter-spacing="8" '
        f'fill="{GOLD}" text-anchor="middle">THE GOLDEN STANDARD</text>'
        f'<text x="{W/2}" y="{H*0.895}" font-family="Georgia,serif" font-size="17" letter-spacing="2" '
        f'fill="{BONE}" opacity="0.55" text-anchor="middle">BUILD · TRADE · CLIMB · LOOK</text>'
        "</svg>"
    )


def og_card(W=1200, H=630):
    """Social card for circle.html."""
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">'
        f'{lion.defs()}<rect width="{W}" height="{H}" fill="{INK}"/>'
        f'<rect x="24" y="24" width="{W-48}" height="{H-48}" fill="none" stroke="{GOLD}" '
        'stroke-width="2" opacity="0.35"/>'
        f'<g transform="translate(600 190) scale(1.0) translate(-128 -128)">{_body()}</g>'
        f'<text x="600" y="470" font-family="Georgia,serif" font-weight="700" font-size="62" '
        f'letter-spacing="6" fill="{BONE}" text-anchor="middle">DHAHAB CIRCLE</text>'
        f'<text x="600" y="524" font-family="Georgia,serif" font-size="25" letter-spacing="8" '
        f'fill="{GOLD}" text-anchor="middle">RECEIPTS OVER OPINIONS</text>'
        f'<text x="600" y="570" font-family="Georgia,serif" font-size="20" letter-spacing="2" '
        f'fill="{BONE}" opacity="0.6" text-anchor="middle">Build · Trade · Climb · Look — free to join</text>'
        "</svg>"
    )


def waitlist_card(W=1200, H=630):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">'
        f'{lion.defs()}<rect width="{W}" height="{H}" fill="{INK}"/>'
        f'<rect x="24" y="24" width="{W-48}" height="{H-48}" fill="none" stroke="{GOLD}" '
        'stroke-width="2" opacity="0.35"/>'
        f'<g transform="translate(600 190) scale(1.0) translate(-128 -128)">{_body()}</g>'
        f'<text x="600" y="470" font-family="Georgia,serif" font-weight="700" font-size="58" '
        f'letter-spacing="5" fill="{BONE}" text-anchor="middle">FIRST ACCESS</text>'
        f'<text x="600" y="524" font-family="Georgia,serif" font-size="24" letter-spacing="7" '
        f'fill="{GOLD}" text-anchor="middle">SEVEN THINGS LAUNCHING NEXT</text>'
        f'<text x="600" y="570" font-family="Georgia,serif" font-size="20" letter-spacing="2" '
        f'fill="{BONE}" opacity="0.6" text-anchor="middle">Pick what you want to hear about. Nothing else.</text>'
        "</svg>"
    )


def codeswitch_card(W=1200, H=630):
    """CODESWITCH social card.

    WHY no lion: CODESWITCH is the nonprofit program, deliberately outside the DHAHAB
    commercial brand. Its mark is the switch motif — two brackets and a crossing rule.
    """
    cx, cy = W / 2, 205
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">'
        f'<rect width="{W}" height="{H}" fill="{INK}"/>'
        f'<rect x="24" y="24" width="{W-48}" height="{H-48}" fill="none" stroke="{GOLD}" '
        'stroke-width="2" opacity="0.35"/>'
        # the mark: { } with a rule crossing between them
        f'<text x="{cx-118}" y="{cy+42}" font-family="Georgia,serif" font-size="150" '
        f'fill="{GOLD}" text-anchor="middle">{{</text>'
        f'<text x="{cx+118}" y="{cy+42}" font-family="Georgia,serif" font-size="150" '
        f'fill="{GOLD}" text-anchor="middle">}}</text>'
        f'<line x1="{cx-62}" y1="{cy}" x2="{cx+62}" y2="{cy}" stroke="{BONE}" '
        'stroke-width="3" opacity="0.75"/>'
        f'<circle cx="{cx-62}" cy="{cy}" r="7" fill="{BONE}" opacity="0.75"/>'
        f'<circle cx="{cx+62}" cy="{cy}" r="7" fill="{GOLD}"/>'
        f'<text x="{cx}" y="400" font-family="Georgia,serif" font-weight="700" font-size="66" '
        f'letter-spacing="9" fill="{BONE}" text-anchor="middle">CODESWITCH</text>'
        f'<text x="{cx}" y="460" font-family="Georgia,serif" font-size="26" letter-spacing="3" '
        f'fill="{GOLD}" text-anchor="middle">Learn to code in the language you think in.</text>'
        f'<text x="{cx}" y="530" font-family="Georgia,serif" font-size="21" letter-spacing="2" '
        f'fill="{BONE}" opacity="0.55" text-anchor="middle">Free bilingual intro CS for high schoolers still learning English</text>'
        f'<text x="{cx}" y="566" font-family="Georgia,serif" font-size="19" letter-spacing="4" '
        f'fill="{BONE}" opacity="0.4" text-anchor="middle">español · tiếng việt · العربية</text>'
        "</svg>"
    )


FILES = {
    "codeswitch-og.svg": codeswitch_card,
    "circle-icon.svg": lambda: icon(512),
    "circle-banner.svg": banner,
    "circle-og.svg": og_card,
    "waitlist-og.svg": waitlist_card,
}

RASTER = [
    ("codeswitch-og.svg", "../../../og/codeswitch-card.png", 1200),
    ("circle-icon.svg", "circle-icon-512.png", 512),
    ("circle-banner.svg", "circle-banner.png", 960),
    ("circle-og.svg", "../../../og/circle-card.png", 1200),
    ("waitlist-og.svg", "../../../og/waitlist-card.png", 1200),
]


def main():
    os.makedirs(OUT, exist_ok=True)
    for name, fn in FILES.items():
        path = os.path.join(OUT, name)
        with open(path, "w") as f:
            f.write(fn())
        print("wrote", os.path.relpath(path))

    if not subprocess.run(["which", "rsvg-convert"], capture_output=True).returncode == 0:
        print("! rsvg-convert not found — SVGs written, PNGs skipped (brew install librsvg)")
        return
    for src, dst, w in RASTER:
        s, d = os.path.join(OUT, src), os.path.join(OUT, dst)
        os.makedirs(os.path.dirname(d), exist_ok=True)
        subprocess.run(["rsvg-convert", "-w", str(w), "-o", d, s], check=True)
        print("wrote", os.path.relpath(d))


if __name__ == "__main__":
    main()
