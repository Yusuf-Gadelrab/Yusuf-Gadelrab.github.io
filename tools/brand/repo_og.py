"""Per-repository GitHub social-preview cards in the DHAHAB identity.

GitHub renders a grey auto-generated placeholder for any repo without a custom
social preview, so every share of a repo link on LinkedIn/X/Slack burns a first
impression. GitHub's uploader accepts PNG/JPG/GIF only (not SVG) and recommends
1280x640, so this emits SVG and rasterizes with rsvg-convert.

Geometry is imported from lion.py, not redrawn, so the mark on a repo card is the
same program as the mark on the site, the apps and the garment prints.

    python3 tools/brand/repo_og.py                    # -> ~/Desktop/SEO/repo-og
    python3 tools/brand/repo_og.py --out /some/dir
    python3 tools/brand/repo_og.py --svg-only         # skip rasterization

Writes ONLY to the output dir. Never touches public/.
"""
import argparse
import os
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lion  # noqa: E402

W, H = 1280, 640
INK = lion.INK
GOLD = lion.GOLD
BONE = lion.BONE

SERIF = "Georgia,'Times New Roman',serif"
MONO = "ui-monospace,Menlo,monospace"

# name -> (display title, one-line subtitle, three proof chips)
# Every chip below is a measured fact, not a marketing number.
REPOS = {
    "dira": (
        "DIRA",
        "Startup security audit in one command",
        # 134 = tests in the PUBLIC repo. The local tree has 138 (one untracked
        # test file), so never copy the local pytest count onto a public card.
        ["7 SCANNERS", "134 TESTS", "ZERO DEPENDENCIES"],
    ),
    "adaptive-cs-tutor": (
        "ADAPTIVE CS TUTOR",
        "Concept-graph diagnostic for intro CS",
        ["KNOWLEDGE GRAPH", "BILINGUAL RAG", "SIGCSE TS 2026"],
    ),
    "eventreels": (
        "EVENTREELS",
        "Raw footage in, 9:16 highlight reel out",
        ["FFMPEG", "SCENE DETECTION", "NO API KEYS"],
    ),
    "edgelog": (
        "EDGELOG",
        "Trade journal analyzer with an honest verdict",
        ["EXPECTANCY IN R", "PROFIT FACTOR", "EDGE BY SETUP"],
    ),
    "ecoimpact": (
        "ECOIMPACT",
        "Litter map with a quantified impact meter",
        ["LEAFLET", "OPENSTREETMAP", "LOCAL-FIRST"],
    ),
    "Yusuf-Gadelrab.github.io": (
        "YUSUF GADELRAB",
        "Portfolio, tools and writing",
        ["65 PAGES", "4 PWAs", "BUILT IN PUBLIC"],
    ),
}


def esc(s):
    return (
        s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    )


def chip(x, y, label):
    """Outlined pill. Width is estimated from the glyph count because there is no
    text-measuring API in plain SVG; the mono face makes the estimate reliable."""
    w = int(len(label) * 10.6 + 40)
    return (
        f'<g transform="translate({x} {y})">'
        f'<rect x="0" y="0" width="{w}" height="42" rx="21" fill="none" '
        f'stroke="{GOLD}" stroke-width="1.4" opacity="0.55"/>'
        f'<text x="{w/2:.0f}" y="28" font-family="{MONO}" font-size="15" '
        f'letter-spacing="1.6" fill="{GOLD}" text-anchor="middle" opacity="0.92">'
        f"{esc(label)}</text></g>",
        w,
    )


def card(title, subtitle, chips, url="github.com/Yusuf-Gadelrab"):
    body = lion.mark().split(">", 1)[1].rsplit("</svg>", 1)[0]
    # Long repo names would overflow a fixed size, so step the display face down.
    fs = 76 if len(title) <= 14 else (58 if len(title) <= 22 else 46)

    row, x = [], 92
    for c in chips:
        el, w = chip(x, 466, c)
        row.append(el)
        x += w + 16

    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
        f'width="{W}" height="{H}" role="img" aria-label="{esc(title)} — {esc(subtitle)}">'
        f"{lion.defs()}"
        f'<rect width="{W}" height="{H}" fill="{INK}"/>'
        f'<rect x="26" y="26" width="{W-52}" height="{H-52}" fill="none" '
        f'stroke="{GOLD}" stroke-width="2" opacity="0.32"/>'
        # hairline rule under the wordmark, the one horizontal the layout needs
        f'<rect x="92" y="404" width="360" height="1" fill="{GOLD}" opacity="0.45"/>'
        f'<g transform="translate(1004 172) scale(1.28) translate(-128 -128)" '
        f'opacity="0.97">{body}</g>'
        f'<text x="92" y="196" font-family="{MONO}" font-size="17" letter-spacing="7" '
        f'fill="{GOLD}" opacity="0.85">DHAHAB · ذهب</text>'
        f'<text x="92" y="{196 + fs + 24}" font-family="{SERIF}" font-weight="700" '
        f'font-size="{fs}" letter-spacing="3" fill="{BONE}">{esc(title)}</text>'
        f'<text x="92" y="{196 + fs + 78}" font-family="{SERIF}" font-size="30" '
        f'fill="{BONE}" opacity="0.72">{esc(subtitle)}</text>'
        + "".join(row)
        + f'<text x="92" y="566" font-family="{MONO}" font-size="17" letter-spacing="2.5" '
        f'fill="{BONE}" opacity="0.42">{esc(url)}</text>'
        "</svg>"
    )


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=os.path.expanduser("~/Desktop/SEO/repo-og"))
    ap.add_argument("--svg-only", action="store_true")
    args = ap.parse_args()

    os.makedirs(args.out, exist_ok=True)
    have_rsvg = subprocess.run(
        ["which", "rsvg-convert"], capture_output=True
    ).returncode == 0

    for name, (title, sub, chips) in REPOS.items():
        url = f"github.com/Yusuf-Gadelrab/{name}"
        if name == "Yusuf-Gadelrab.github.io":
            url = "yusuf-gadelrab.github.io"
        svg_path = os.path.join(args.out, f"{name}.svg")
        with open(svg_path, "w") as fh:
            fh.write(card(title, sub, chips, url) + "\n")
        print("wrote", svg_path)

        if args.svg_only or not have_rsvg:
            continue
        png_path = os.path.join(args.out, f"{name}.png")
        subprocess.run(
            ["rsvg-convert", "-w", str(W), "-h", str(H), svg_path, "-o", png_path],
            check=True,
        )
        kb = os.path.getsize(png_path) / 1024
        # GitHub's social-preview uploader rejects anything over 1 MB.
        flag = "  <-- OVER 1MB, GitHub will reject" if kb > 1024 else ""
        print(f"raster {png_path}  {kb:.0f} KB{flag}")


if __name__ == "__main__":
    main()
