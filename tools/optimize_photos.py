#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["pillow>=10.4"]
# ///
"""Photographic + product-preview optimizer for the portfolio.

Two passes, selected by flag:

  (default)  JPEG re-encode of the hand-picked TARGETS list.
  --webp     Emit a sibling .webp for every raster the site actually
             references, which is what the HTML is wired to serve.

Rules (deliberately narrow — these are photos of a real person):
  * NO generative editing of any kind. Re-encode / rescale only.
  * The JPEG pass preserves pixel dimensions exactly. The --webp pass may
    downscale, but only for paths listed in MAX_EDGE, and it prints the new
    dimensions so the HTML width/height attributes can be kept truthful.
  * EXIF is stripped (the iPhone originals carry live GPS coordinates).
  * The ICC profile is PRESERVED — several shots are Display P3 and
    flattening them to sRGB would visibly dull them on modern screens.

Usage:  uv run tools/optimize_photos.py [--dry-run]
        uv run tools/optimize_photos.py --webp [--dry-run] [--force]
"""

from __future__ import annotations

import argparse
import io
import re
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

# ---------------------------------------------------------------- webp pass
WEBP_QUALITY = 82

# Long-edge caps, keyed by path prefix. Only listed prefixes are ever
# rescaled; everything else keeps its native size. The size charts are the
# only assets whose intrinsic width overshoots the 1180px page column badly
# enough to be worth the resample.
MAX_EDGE = {
    "img/kxngsef/tee-black-sizes.jpg": 1600,
    "img/kxngsef/hoodie-black-sizes.jpg": 1600,
}

# Never emit a webp sibling for these — they are consumed by crawlers and
# OS-level surfaces that either ignore or actively mishandle webp.
#   og/          social-card scrapers (LinkedIn/X still prefer png/jpg)
#   splash-      iOS apple-touch-startup-image
#   icon-        web app manifest / apple-touch-icon
WEBP_SKIP = ("og/", "img/brand/kit/splash-", "icon-", "apple-touch-icon")

REF_RE = re.compile(r"(?:^|[\"'(/])((?:img|projects|og)/[A-Za-z0-9_./-]+\.(?:jpg|jpeg|png))")


def referenced_rasters() -> list[str]:
    """Every raster path the built site actually points an <img>/url() at."""
    seen: set[str] = set()
    sources = list(PUB.rglob("*.html")) + list(PUB.rglob("*.css")) + [ROOT / "src" / "App.js"]
    for f in sources:
        if not f.exists():
            continue
        for m in REF_RE.finditer(f.read_text(encoding="utf-8", errors="ignore")):
            rel = m.group(1)
            if rel.startswith(WEBP_SKIP) or any(s in rel for s in WEBP_SKIP):
                continue
            if (PUB / rel).exists():
                seen.add(rel)
    # og/codeswitch-card.png is the one og/ asset also rendered as a real
    # <img> on everything.html, so it earns a webp despite the skip rule.
    if (PUB / "og/codeswitch-card.png").exists():
        seen.add("og/codeswitch-card.png")
    return sorted(seen)


def webp_pass(dry_run: bool, force: bool) -> None:
    rels = referenced_rasters()
    tot_src = tot_webp = 0
    made = skipped = resized = 0
    print(f"{'file':46} {'source':>9} {'webp':>9} {'save':>7}  dims")
    for rel in rels:
        src_p = PUB / rel
        out_p = src_p.with_suffix(".webp")
        before = src_p.stat().st_size

        im = Image.open(src_p)
        icc = im.info.get("icc_profile")
        w, h = im.size
        cap = MAX_EDGE.get(rel)
        note = ""
        if cap and max(w, h) > cap:
            scale = cap / max(w, h)
            src_dims = f"{w}x{h}"
            w, h = round(w * scale), round(h * scale)
            im = im.resize((w, h), Image.LANCZOS)
            note = f"  <- resized from {src_dims}"
            resized += 1

        if out_p.exists() and not force and out_p.stat().st_mtime >= src_p.stat().st_mtime and not cap:
            tot_src += before
            tot_webp += out_p.stat().st_size
            skipped += 1
            continue

        mode = "RGBA" if im.mode in ("RGBA", "LA", "P") and "A" in im.getbands() else "RGB"
        buf = io.BytesIO()
        im.convert(mode).save(buf, format="WEBP", quality=WEBP_QUALITY,
                              method=6, icc_profile=icc)
        data = buf.getvalue()
        if not dry_run:
            out_p.write_bytes(data)
        made += 1
        tot_src += before
        tot_webp += len(data)
        print(f"{rel:46} {before:9,} {len(data):9,} "
              f"{(before - len(data)) / before * 100:6.1f}%  {w}x{h}{note}")

    print(f"\n{len(rels)} referenced rasters · {made} encoded · {skipped} up-to-date "
          f"· {resized} resized")
    print(f"{'SERVED BYTES':46} {tot_src:9,} {tot_webp:9,} "
          f"{(tot_src - tot_webp) / tot_src * 100:6.1f}%")


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
    ap.add_argument("--webp", action="store_true",
                    help="emit .webp siblings for every HTML-referenced raster")
    ap.add_argument("--force", action="store_true",
                    help="re-encode webp even when the sibling is already current")
    a = ap.parse_args()

    if a.webp:
        webp_pass(a.dry_run, a.force)
        return

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
