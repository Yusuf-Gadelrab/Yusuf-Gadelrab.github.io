"""Favicon completeness pass for the DHAHAB lion.

Fixes two measured defects in the shipped icon set and fills the one missing
format. Everything still comes out of lion.py — no geometry is redrawn here.

    python3 tools/brand/favicons.py --out ~/Desktop/SEO/brand-assets/icons

1. safari-pinned-tab.svg is wrong today. kit.py builds it with
   `mark(gold="#000000", flat=True)`, which leaves the face shield and the ear
   cavities painted in INK (#0a0a0b). Safari's pinned-tab mask ignores colour
   entirely — any painted pixel is mask — so the head fills solid and the face
   disappears. The knockout variant (already used for garment print, for the
   same reason) masks the face out of the mane instead, which is what a
   single-colour mask actually needs.

2. The tile turns to mud at 16px. 28 shards and a five-element face cannot
   resolve into 16 device pixels. `micro()` is a reduced cut for <=20px: half
   the shards, fatter, plus a two-element face. Same silhouette family, still
   generated.

3. favicon.ico does not exist on the live site (404). Browsers, RSS readers,
   Slack/Discord unfurlers and a lot of scrapers still probe /favicon.ico
   before they read <link rel="icon">. The ICO written here is a standard
   PNG-payload multi-image ICO (16/32/48), which every browser since IE11
   reads.
"""
from __future__ import annotations

import argparse
import math
import os
import struct
import subprocess
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lion  # noqa: E402

INK, GOLD = lion.INK, lion.GOLD
S, CX, CY = lion.S, lion.CX, lion.CY


def pinned_tab() -> str:
    """Safari pinned-tab mask: one flat colour, face knocked out, no plate.

    Apple's spec wants a single 100%-black vector on a transparent field. The
    knockout mask is what makes the face read as face rather than as more mask.
    """
    body = lion.mark(gold="#000000", ink="none", flat=True, knockout=True)
    body = body.split(">", 1)[1].rsplit("</svg>", 1)[0]
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" '
        'width="256" height="256" role="img" aria-label="DHAHAB lion mark">'
        "<title>DHAHAB lion mark</title>"
        f"{body}</svg>\n"
    )


def _micro_tuft(a_deg: float, w_in: float, r_out: float) -> str:
    a1 = lion.p(a_deg - w_in, 62)
    a4 = lion.p(a_deg + w_in, 62)
    tip = lion.p(a_deg, r_out)
    c_l = lion.p(a_deg - w_in * 0.72, 62 + (r_out - 62) * 0.5)
    c_r = lion.p(a_deg + w_in * 0.72, 62 + (r_out - 62) * 0.5)
    fm = lion.f
    return (
        f'<path d="M{fm(a1[0])} {fm(a1[1])} Q{fm(c_l[0])} {fm(c_l[1])} '
        f'{fm(tip[0])} {fm(tip[1])} Q{fm(c_r[0])} {fm(c_r[1])} '
        f'{fm(a4[0])} {fm(a4[1])} Z"/>'
    )


def micro() -> str:
    """16px cut. Twelve fat shards, solid head, two-element face.

    At 16 device pixels one shard is ~1px wide in the shipped tile, so the mane
    averages into a ring and the face averages into nothing. Halving the shard
    count and doubling their width keeps a silhouette that still survives a
    box filter; the eyes become two solid bars because anything thinner than
    2px at 16 is gone.
    """
    n = 12
    shards = "".join(
        _micro_tuft(i * 360.0 / n, 13.0, 118 - 8 * abs(math.sin(1.7 * i)))
        for i in range(n)
    )
    head = (
        f'<path d="M{CX} {CY - 52} C{CX + 40} {CY - 52} {CX + 56} {CY - 30} '
        f'{CX + 56} {CY - 2} C{CX + 56} {CY + 30} {CX + 34} {CY + 54} '
        f'{CX} {CY + 64} C{CX - 34} {CY + 54} {CX - 56} {CY + 30} '
        f'{CX - 56} {CY - 2} C{CX - 56} {CY - 30} {CX - 40} {CY - 52} '
        f'{CX} {CY - 52} Z" fill="{INK}"/>'
    )
    eyes = "".join(
        f'<rect x="{CX + s * 34 - 15}" y="{CY - 18}" width="30" height="12" '
        f'rx="6" fill="{GOLD}"/>' if False else
        f'<path d="M{CX + s * 12} {CY - 14} L{CX + s * 40} {CY - 20} '
        f'L{CX + s * 40} {CY - 4} L{CX + s * 12} {CY - 2} Z" fill="{GOLD}"/>'
        for s in (-1, 1)
    )
    muzzle = (
        f'<path d="M{CX - 22} {CY + 20} L{CX + 22} {CY + 20} '
        f'Q{CX + 16} {CY + 48} {CX} {CY + 54} '
        f'Q{CX - 16} {CY + 48} {CX - 22} {CY + 20} Z" fill="{GOLD}"/>'
    )
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" '
        'width="256" height="256" role="img" aria-label="DHAHAB lion mark">'
        "<title>DHAHAB lion mark</title>"
        f'<rect width="256" height="256" rx="56" fill="{INK}"/>'
        f'<g transform="translate(128 132) scale(0.9) translate(-128 -115)">'
        f'<g fill="{GOLD}">{shards}</g>{head}{eyes}{muzzle}</g></svg>\n'
    )


def tile_titled() -> str:
    """The shipped tile, with the accessible name lion.py drops.

    favicon() slices the outer <svg> off mark(), which is where role/aria-label
    live, so public/favicon.svg ships with no accessible name at all.
    """
    svg = lion.favicon()
    return svg.replace(
        'width="256" height="256">',
        'width="256" height="256" role="img" aria-label="DHAHAB lion mark">'
        "<title>DHAHAB lion mark</title>",
        1,
    ) + "\n"


def _png(svg_path: str, size: int, out: str) -> None:
    subprocess.run(
        ["rsvg-convert", "-w", str(size), "-h", str(size), svg_path, "-o", out],
        check=True,
    )


def write_ico(pngs: list[str], out: str) -> None:
    """Multi-image ICO with PNG payloads (Vista+ / all modern browsers)."""
    blobs = [open(p, "rb").read() for p in pngs]
    n = len(blobs)
    hdr = struct.pack("<HHH", 0, 1, n)
    offset = 6 + 16 * n
    entries, body = b"", b""
    for p, b in zip(pngs, blobs):
        w, h = struct.unpack(">II", b[16:24])
        entries += struct.pack(
            "<BBBBHHII",
            0 if w >= 256 else w,
            0 if h >= 256 else h,
            0, 0, 1, 32, len(b), offset,
        )
        body += b
        offset += len(b)
    with open(out, "wb") as fh:
        fh.write(hdr + entries + body)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=os.path.expanduser(
        "~/Desktop/SEO/brand-assets/icons"))
    a = ap.parse_args()
    out = os.path.abspath(os.path.expanduser(a.out))
    os.makedirs(out, exist_ok=True)

    for name, svg in (
        ("safari-pinned-tab.svg", pinned_tab()),
        ("favicon-micro.svg", micro()),
        ("favicon.svg", tile_titled()),
    ):
        with open(os.path.join(out, name), "w") as fh:
            fh.write(svg)
        print("wrote", os.path.join(out, name))

    with tempfile.TemporaryDirectory() as tmp:
        parts = []
        # 16px gets the reduced cut; 32/48 get the full tile.
        _png(os.path.join(out, "favicon-micro.svg"), 16, f"{tmp}/16.png")
        parts.append(f"{tmp}/16.png")
        for size in (32, 48):
            _png(os.path.join(out, "favicon.svg"), size, f"{tmp}/{size}.png")
            parts.append(f"{tmp}/{size}.png")
        write_ico(parts, os.path.join(out, "favicon.ico"))
    print("wrote", os.path.join(out, "favicon.ico"))

    # PNG fallbacks some crawlers prefer over SVG
    for size in (32, 96):
        _png(os.path.join(out, "favicon.svg"), size,
             os.path.join(out, f"favicon-{size}.png"))
        print("wrote", os.path.join(out, f"favicon-{size}.png"))


if __name__ == "__main__":
    main()
