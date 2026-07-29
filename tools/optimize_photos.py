#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["pillow>=10.4"]
# ///
"""Photographic + product-preview optimizer for the portfolio.

Rules (deliberately narrow — these are photos of a real person):
  * NO generative editing of any kind. Re-encode only.
  * Pixel dimensions are preserved exactly, because the HTML hard-codes
    width/height on every <img> and this script must never touch HTML.
  * EXIF is stripped (the iPhone originals carry live GPS coordinates).
  * The ICC profile is PRESERVED — several shots are Display P3 and
    flattening them to sRGB would visibly dull them on modern screens.

Usage:  uv run tools/optimize_photos.py [--dry-run]
"""

from __future__ import annotations

import argparse
import io
from pathlib import Path

from PIL import Image
from PIL.JpegImagePlugin import get_sampling

ROOT = Path(__file__).resolve().parent.parent
PUB = ROOT / "public"

TARGETS = [
    "img/yusuf-headshot.jpg",
    "img/yusuf-gym.jpg",
    "img/yusuf-candid.jpg",
    "img/yusuf-hwyhaul.jpg",
    "img/sunset-hills.jpg",
    "img/fd/founder-hwyhaul.jpg",
    "img/fd/sunset-backdrop.jpg",
    "img/products/claude-preview-1.jpg",
    "img/products/claude-preview-2.jpg",
    "img/products/course-preview-1.jpg",
    "img/products/course-preview-2.jpg",
    "img/products/playbook-preview-1.jpg",
    "img/products/playbook-preview-2.jpg",
]

# product pages are flat text/chart renders — they tolerate less compression
# before ringing shows up around glyph edges, so they get a higher floor.
QUALITY = {"products": 88, "photo": 84}
MAX_RMSE = 3.0  # 0-255 scale; above this we step quality back up


def rmse(a: Image.Image, b: Image.Image) -> float:
    from PIL import ImageChops
    import math

    diff = ImageChops.difference(a.convert("RGB"), b.convert("RGB"))
    h = diff.histogram()
    total = 0
    n = 0
    for band in range(3):
        for v, count in enumerate(h[band * 256:(band + 1) * 256]):
            total += count * v * v
            n += count
    return math.sqrt(total / n) if n else 0.0


def encode(im: Image.Image, quality: int, icc: bytes | None, sub: int) -> bytes:
    buf = io.BytesIO()
    im.save(buf, format="JPEG", quality=quality, optimize=True,
            progressive=True, subsampling=sub, icc_profile=icc)
    return buf.getvalue()


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    tot_before = tot_after = 0
    print(f"{'file':38} {'before':>9} {'after':>9} {'save':>7}  q  rmse  size")
    for rel in TARGETS:
        p = PUB / rel
        before = p.stat().st_size
        src = Image.open(p)
        icc = src.info.get("icc_profile")
        # keep the source chroma sampling: forcing 4:2:0 on a 4:4:4 original
        # would smear coloured text edges in the product page renders.
        sub = get_sampling(src)
        ref = src.convert("RGB")
        base = QUALITY["products" if "/products/" in rel else "photo"]

        chosen, data = None, None
        for q in range(base, 97):
            data = encode(ref, q, icc, sub)
            err = rmse(ref, Image.open(io.BytesIO(data)))
            chosen = (q, err)
            if err <= MAX_RMSE:
                break

        # Never grow a file. A couple of sources were already saved past our
        # target quality, so re-encoding at `base` inflates them; walk the
        # quality back down until we are at least as lean as the original
        # while still inside the RMSE budget.
        if len(data) >= before:
            for q in range(chosen[0] - 1, 69, -1):
                cand = encode(ref, q, icc, sub)
                err = rmse(ref, Image.open(io.BytesIO(cand)))
                chosen = (q, err)
                data = cand
                if len(cand) < before and err <= MAX_RMSE:
                    break

        # If there is nothing meaningful to win and no metadata to remove,
        # leave the original bytes alone rather than pay a generation of
        # JPEG loss for a rounding error.
        note = ""
        if len(data) > before * 0.98 and not src.getexif():
            data = p.read_bytes()
            chosen = (0, 0.0)
            note = "  (untouched: no EXIF, no win)"

        after = len(data)
        if not a.dry_run:
            p.write_bytes(data)
        tot_before += before
        tot_after += after
        pct = (before - after) / before * 100
        print(f"{rel:38} {before:9,} {after:9,} {pct:6.1f}% "
              f"{chosen[0]:3} {chosen[1]:5.2f}  {ref.size[0]}x{ref.size[1]}{note}")

    print(f"{'TOTAL':38} {tot_before:9,} {tot_after:9,} "
          f"{(tot_before - tot_after) / tot_before * 100:6.1f}%")


if __name__ == "__main__":
    main()
