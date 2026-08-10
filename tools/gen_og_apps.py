#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["pillow>=10.4"]
# ///
"""OG cards for the installable PWAs under public/apps/.

gen_og_cards.derived() globs public/*.html plus the two derived SECTIONS, so
the four app shells in public/apps/<name>/index.html fall through it and end up
pointing og:image at /apple-touch-icon.png — a 180x180 image. Facebook,
LinkedIn and Slack all drop an og:image below 200x200, so those four pages
unfurl with no image at all. Same design system, one card each.

    uv run tools/gen_og_apps.py --out ~/Desktop/SEO/brand-assets/og
"""
from __future__ import annotations

import argparse
import importlib.util
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

_spec = importlib.util.spec_from_file_location("gen_og_cards",
                                               ROOT / "tools" / "gen_og_cards.py")
og = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(og)

ICONS = {
    "tradelog": "◑",
    "cut": "△",
    "fire": "✦",
    "grampa": "◆",
}


def specs() -> dict[str, dict]:
    out: dict[str, dict] = {}
    for d in sorted((ROOT / "public" / "apps").iterdir()):
        page = d / "index.html"
        if not page.is_dir() and page.exists():
            text = page.read_text(encoding="utf-8")
            head = og._meta(text, "og:title") or og._h1(text) or d.name
            sub = (og._meta(text, "og:description")
                   or og._meta(text, "description", attr="name"))
            head = re.sub(r"\s*[—|-]\s*Yusuf Gadelrab\s*$", "", head).strip()
            out[f"apps/{d.name}-card"] = dict(
                icon=ICONS.get(d.name, "◆"),
                headline=head,
                sub=sub or "Installable, offline, no account and no server.",
                url=f"{og.BASE_URL}/apps/{d.name}/",
                page=f"/apps/{d.name}/",
            )
    return out


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=str(og.OUT))
    a = ap.parse_args()
    out = Path(a.out)
    for name, spec in sorted(specs().items()):
        p = out / f"{name}.png"
        p.parent.mkdir(parents=True, exist_ok=True)
        img = og.build(spec)
        q = img.convert("RGB").quantize(colors=256, method=og.Image.MEDIANCUT,
                                        dither=og.Image.FLOYDSTEINBERG)
        q.save(p, format="PNG", optimize=True)
        print(f"{name}.png  {p.stat().st_size:,} B   <- {spec['page']}")


if __name__ == "__main__":
    main()
