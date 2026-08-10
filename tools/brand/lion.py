"""DHAHAB lion-mane mark generator.

One source of truth for every lion asset (site, apps, KXNG SEF, product covers).
Geometry is deterministic: re-running reproduces byte-identical SVGs.

    python3 tools/brand/lion.py            # write SVGs
    python3 tools/brand/lion.py --png      # + rasterize icons/OG card (needs rsvg-convert)
"""
import math
import os
import subprocess
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(ROOT, "public", "img", "brand")

INK = "#0a0a0b"
GOLD = "#d4af37"
GOLD_HI = "#f4e2a1"
GOLD_LO = "#a9821f"
BONE = "#f2ede4"

S = 256           # canvas
CX, CY = 128, 115  # face center (offset up: the mane hangs, so the bbox is bottom-heavy)
R_FACE = 60
R_MANE_IN = 54
R_LONG = 124
R_SHORT = 104
N_RAYS = 14


def p(a_deg, r, cx=CX, cy=CY):
    """Polar point, 0 deg = up, clockwise."""
    a = math.radians(a_deg)
    return (cx + r * math.sin(a), cy - r * math.cos(a))


def f(v):
    return f"{v:.2f}".rstrip("0").rstrip(".")


def mane_reach(a_deg):
    """Mane silhouette: hangs at the jaw, cropped over the brow, with two low
    harmonics so the outline is organic. A constant radius reads as a sun."""
    a = math.radians(a_deg)
    d = abs(((a_deg + 180) % 360) - 180)
    t = d / 180.0
    base = 0.80 + 0.20 * (t ** 0.6)
    return base * (1 + 0.055 * math.cos(3 * a) + 0.035 * math.cos(5 * a))


def tuft(a_deg, scale=1.0, w_in=13.5, inset=0.22):
    """One mane shard: wide at the collar, concave sides, sharp tip."""
    r_out = R_LONG * mane_reach(a_deg) * scale
    a1 = p(a_deg - w_in, R_MANE_IN)
    a4 = p(a_deg + w_in, R_MANE_IN)
    tip = p(a_deg, r_out)
    c_l = p(a_deg - w_in * (1 - inset), R_MANE_IN + (r_out - R_MANE_IN) * 0.55)
    c_r = p(a_deg + w_in * (1 - inset), R_MANE_IN + (r_out - R_MANE_IN) * 0.55)
    return (
        f'<path d="M{f(a1[0])} {f(a1[1])} Q{f(c_l[0])} {f(c_l[1])} {f(tip[0])} {f(tip[1])} '
        f'Q{f(c_r[0])} {f(c_r[1])} {f(a4[0])} {f(a4[1])} Z"/>'
    )


def mane():
    """Two tiers, offset by half a step — inner first so the outer shards read on top."""
    out = []
    for i in range(N_RAYS):
        a = (i + 0.5) * 360.0 / N_RAYS
        out.append(tuft(a, scale=0.78 + 0.06 * abs(math.sin(2.1 * i)), w_in=11.5))
    for i in range(N_RAYS):
        a = i * 360.0 / N_RAYS
        # deterministic length jitter: uniform petals read as a flower, not a mane
        out.append(tuft(a, scale=1.0 - 0.15 * abs(math.sin(2.7 * i)), w_in=13.0))
    return "".join(out)


def face_path():
    """Shield head: broad brow, tapered cheeks, rounded chin."""
    return (
        f"M{CX} {CY - 58} "
        f"C{CX + 34} {CY - 58} {CX + 58} {CY - 38} {CX + 58} {CY - 8} "
        f"C{CX + 58} {CY + 26} {CX + 38} {CY + 52} {CX} {CY + 64} "
        f"C{CX - 38} {CY + 52} {CX - 58} {CY + 26} {CX - 58} {CY - 8} "
        f"C{CX - 58} {CY - 38} {CX - 34} {CY - 58} {CX} {CY - 58} Z"
    )


def _ear_paths(inner):
    """inner=False -> outer ear shells; inner=True -> the cavity inside each ear."""
    out = []
    for sign in (-1, 1):
        cx = CX + sign * 53
        cy = CY - 42
        if inner:
            out.append(
                f'M{f(cx - sign * 8)} {f(cy + 11)} '
                f'Q{f(cx - sign * 8)} {f(cy - 13)} {f(cx + sign * 8)} {f(cy - 7)} '
                f'Q{f(cx + sign * 16)} {f(cy - 1)} {f(cx + sign * 7)} {f(cy + 13)} Z'
            )
        else:
            out.append(
                f'M{f(cx - sign * 16)} {f(cy + 16)} '
                f'Q{f(cx - sign * 16)} {f(cy - 24)} {f(cx + sign * 12)} {f(cy - 14)} '
                f'Q{f(cx + sign * 26)} {f(cy - 3)} {f(cx + sign * 12)} {f(cy + 20)} Z'
            )
    return out


def ears(gold, ink):
    """Ears break the mane line at the temples."""
    out = [f'<path d="{d}" fill="{gold}"/>' for d in _ear_paths(False)]
    if ink != "none":
        out += [f'<path d="{d}" fill="{ink}"/>' for d in _ear_paths(True)]
    return "".join(out)


def crest(gold):
    """Forehead tuft — the one detail that stops the head reading as a cat."""
    return (
        f'<path d="M{CX} {CY - 78} '
        f'Q{CX + 14} {CY - 60} {CX + 4} {CY - 46} '
        f'Q{CX} {CY - 42} {CX - 4} {CY - 46} '
        f'Q{CX - 14} {CY - 60} {CX} {CY - 78} Z" fill="{gold}"/>'
    )


def face_features(gold):
    """Angled eyes, heavy brow, broad nose, muzzle that dips — never a smile."""
    out = []
    for sign in (-1, 1):
        ex = CX + sign * 24
        ey = CY - 10
        outer_x = ex + sign * 15
        inner_x = ex - sign * 14
        out.append(
            f'<path d="M{f(outer_x)} {f(ey - 7)} '
            f'Q{f(ex)} {f(ey - 10)} {f(inner_x)} {f(ey + 5)} '
            f'Q{f(ex)} {f(ey + 8)} {f(outer_x)} {f(ey - 7)} Z" fill="{gold}"/>'
        )
        out.append(
            f'<path d="M{f(outer_x + sign * 4)} {f(ey - 21)} '
            f'Q{f(ex)} {f(ey - 23)} {f(inner_x - sign * 2)} {f(ey - 11)}" fill="none" '
            f'stroke="{gold}" stroke-width="6" stroke-linecap="round"/>'
        )
    ny = CY + 17
    out.append(
        f'<path d="M{f(CX - 15)} {f(ny - 9)} L{f(CX + 15)} {f(ny - 9)} '
        f'Q{f(CX + 12)} {f(ny + 9)} {f(CX)} {f(ny + 13)} '
        f'Q{f(CX - 12)} {f(ny + 9)} {f(CX - 15)} {f(ny - 9)} Z" fill="{gold}"/>'
    )
    out.append(
        f'<path d="M{f(CX)} {f(ny + 13)} L{f(CX)} {f(ny + 24)}" fill="none" '
        f'stroke="{gold}" stroke-width="5" stroke-linecap="round"/>'
    )
    for sign in (-1, 1):
        out.append(
            f'<path d="M{f(CX)} {f(ny + 24)} '
            f'Q{f(CX + sign * 9)} {f(ny + 31)} {f(CX + sign * 19)} {f(ny + 25)}" '
            f'fill="none" stroke="{gold}" stroke-width="5" stroke-linecap="round"/>'
        )
    return "".join(out)


def defs(flat=False):
    if flat:
        return ""
    return (
        '<defs><linearGradient id="dg" x1="0" y1="0" x2="0" y2="1">'
        f'<stop offset="0" stop-color="{GOLD_HI}"/>'
        f'<stop offset="0.5" stop-color="{GOLD}"/>'
        f'<stop offset="1" stop-color="{GOLD_LO}"/>'
        "</linearGradient></defs>"
    )


def mark(gold="url(#dg)", ink=INK, flat=False, plate=None, features=True, monogram=None,
         knockout=False):
    """Master mark. plate=hex draws a background square.

    knockout=True masks the mane out of the head instead of covering it with an
    ink disc — required for garment print, where the face must be bare fabric
    rather than a slab of ink on an already-black tee.
    """
    bg = f'<rect width="{S}" height="{S}" fill="{plate}"/>' if plate else ""
    inner = ""
    if monogram:
        inner = (
            f'<text x="{CX}" y="{CY + 15}" font-family="Georgia,\'Times New Roman\',serif" '
            f'font-weight="700" font-size="46" letter-spacing="1" fill="{gold}" '
            f'text-anchor="middle">{monogram}</text>'
        )
    elif features:
        inner = face_features(gold)
    head_tf = f"translate({CX} {CY}) scale(0.87) translate({-CX} {-CY})"
    ko_defs = mask_attr = ""
    if knockout:
        ko_defs = (
            f'<mask id="ko" maskUnits="userSpaceOnUse" x="0" y="0" width="{S}" height="{S}">'
            f'<rect width="{S}" height="{S}" fill="#fff"/>'
            f'<g transform="{head_tf}"><path d="{face_path()}" fill="#000"/>'
            + "".join(f'<path d="{d}" fill="#000"/>' for d in _ear_paths(True))
            + "</g></mask>"
        )
        mask_attr = ' mask="url(#ko)"'
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {S} {S}" '
        f'width="{S}" height="{S}" role="img" aria-label="DHAHAB lion mark">'
        f"{defs(flat)}{ko_defs}{bg}"
        f"<g{mask_attr}>"
        f'<g fill="{gold}">{mane()}</g>'
        f'<g transform="{head_tf}">{ears(gold, ink)}{crest(gold)}</g>'
        "</g>"
        f'<g transform="{head_tf}">'
        f'<path d="{face_path()}" fill="{"none" if knockout else ink}" '
        f'stroke="{gold}" stroke-width="4"/>'
        f"{inner}</g></svg>"
    )


def favicon():
    """Rounded-square app tile, mane cropped tight so it survives 16px."""
    body = mark(gold=GOLD, flat=True, features=True)
    body = body.split(">", 1)[1].rsplit("</svg>", 1)[0]
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">'
        f'<rect width="256" height="256" rx="56" fill="{INK}"/>'
        f'<g transform="translate(128 128) scale(0.94) translate(-128 -122)">{body}</g>'
        "</svg>"
    )


def lockup(word, sub=None, gold="url(#dg)", ink_text=BONE, plate=None, flat=False, tag=None):
    """Horizontal lockup: mark + serif wordmark. Canvas grows with the word so
    long names (YUSUF GADELRAB) never overflow the viewBox."""
    fs = 62 if len(word) <= 8 else 48
    ls = 3
    x0 = 238
    text_w = len(word) * (fs * 0.70 + ls)
    W = int(x0 + text_w + 64)
    H = 220
    bg = f'<rect width="{W}" height="{H}" fill="{plate}"/>' if plate else ""
    body = mark(gold=gold, flat=flat).split(">", 1)[1].rsplit("</svg>", 1)[0]
    ty = 112 if (sub or tag) else 128
    sub_el = (
        f'<text x="{x0}" y="152" font-family="Georgia,serif" font-size="21" letter-spacing="6" '
        f'fill="{GOLD}" opacity="0.9">{sub}</text>'
        if sub
        else ""
    )
    tag_el = (
        f'<text x="{x0}" y="{186 if sub else 152}" font-family="Georgia,serif" font-size="17" '
        f'letter-spacing="3" fill="{ink_text}" opacity="0.55">{tag}</text>'
        if tag
        else ""
    )
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">'
        f"{defs(flat)}{bg}"
        f'<g transform="translate(8 -18) scale(0.78)">{body}</g>'
        f'<text x="{x0}" y="{ty}" font-family="Georgia,\'Times New Roman\',serif" font-weight="700" '
        f'font-size="{fs}" letter-spacing="{ls}" fill="{ink_text}">{word}</text>'
        f"{sub_el}{tag_el}</svg>"
    )


def og_card():
    W, H = 1200, 630
    body = mark().split(">", 1)[1].rsplit("</svg>", 1)[0]
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">'
        f'{defs()}<rect width="{W}" height="{H}" fill="{INK}"/>'
        f'<rect x="24" y="24" width="{W-48}" height="{H-48}" fill="none" stroke="{GOLD}" '
        'stroke-width="2" opacity="0.35"/>'
        f'<g transform="translate(600 186) scale(1.06) translate(-128 -128)">{body}</g>'
        f'<text x="600" y="470" font-family="Georgia,serif" font-weight="700" font-size="66" '
        f'letter-spacing="4" fill="{BONE}" text-anchor="middle">YUSUF GADELRAB</text>'
        f'<text x="600" y="522" font-family="Georgia,serif" font-size="26" letter-spacing="9" '
        f'fill="{GOLD}" text-anchor="middle">DHAHAB · ذهب · THE GOLDEN STANDARD</text>'
        f'<text x="600" y="566" font-family="Georgia,serif" font-size="21" letter-spacing="2" '
        f'fill="{BONE}" opacity="0.6" text-anchor="middle">CS @ SJSU · Trading systems · AI research · Built in public</text>'
        "</svg>"
    )


FILES = {
    "lion-mark.svg": lambda: mark(),
    "lion-mark-flat.svg": lambda: mark(gold=GOLD, flat=True),
    "lion-mark-bone.svg": lambda: mark(gold=BONE, ink=INK, flat=True),
    "lion-mark-ink.svg": lambda: mark(gold=INK, ink=BONE, flat=True),
    "lion-monogram.svg": lambda: mark(monogram="YG"),
    "lion-tile.svg": favicon,
    "lockup-yg.svg": lambda: lockup("YUSUF GADELRAB", sub="DHAHAB · ذهب"),
    "lockup-yg-light.svg": lambda: lockup("YUSUF GADELRAB", sub="DHAHAB · ذهب", ink_text=INK),
    "lockup-dhahab-light.svg": lambda: lockup(
        "DHAHAB", sub="ذهب", tag="THE GOLDEN STANDARD", ink_text=INK
    ),
    "lockup-dhahab.svg": lambda: lockup("DHAHAB", sub="ذهب", tag="THE GOLDEN STANDARD"),
    "lockup-kxngsef.svg": lambda: lockup(
        "KXNG SEF", sub=None, gold=GOLD, ink_text=BONE, flat=True, tag="EARNED. NEVER GIVEN."
    ),
    "og-card.svg": og_card,
}


KX_DIR = os.path.expanduser("~/Desktop/KXNGSEF/designs")
KX_INK = "#0B0B0D"
KX_BONE = "#F2EDE4"


def kxngsef_print(dark=True):
    """Design 23 — Lion of Dhahab back print, 4500x5400 POD print area.

    Follows the KXNG SEF one-hero-element rule: the lion IS the largest graphic
    here and no wordmark competes with it, so on dark garments the lion carries
    the single gold hit and every supporting line prints bone.
    """
    W, H = 4500, 5400
    hero = GOLD if dark else KX_INK
    supp = KX_BONE if dark else KX_INK
    # knockout, not an ink disc: the face and ear cavities stay bare fabric
    body = mark(gold=hero, ink="none", flat=True, knockout=True)
    body = body.split(">", 1)[1].rsplit("</svg>", 1)[0]
    scale = 2400.0 / S
    tx = (W - 2400) / 2
    cond = "'Arial Narrow', Impact, Haettenschweiler, 'Helvetica Neue Condensed', sans-serif"
    mono = "ui-monospace, Menlo, monospace"
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">\n'
        f"  <title>KXNG SEF — Lion of Dhahab ({'Dark Garment / Bone + Gold' if dark else 'Bone Tee / Single Ink'})</title>\n"
        "  <!-- Back print. Lion is the sole hero element and takes the gold; all copy is bone. -->\n"
        f'  <g transform="translate({tx} 1180) scale({scale:.4f})">{body}</g>\n'
        f'  <text x="{W//2}" y="4290" text-anchor="middle" font-family="{cond}" font-weight="900" '
        f'font-size="430" letter-spacing="46" fill="{supp}">KXNG SEF</text>\n'
        f'  <text x="{W//2}" y="4620" text-anchor="middle" font-family="{mono}" '
        f'font-size="150" letter-spacing="26" fill="{supp}">EARNED. NEVER GIVEN.</text>\n'
        f'  <text x="{W//2}" y="4900" text-anchor="middle" font-family="{cond}" font-weight="700" '
        f'font-size="210" letter-spacing="20" fill="{supp}">ذهب · GOLD</text>\n'
        "</svg>\n"
    )


def _kx_head(title, note, W=4500, H=5400):
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">\n'
        f"  <title>{title}</title>\n  <!-- {note} -->\n"
    )


def kxngsef_chest(dark=True):
    """Design 24 — small left-chest lion.

    Chest hits print ~3.5in wide, so the art is deliberately small inside the
    same 4500x5400 area: POD editors position by the artboard, and keeping the
    canvas identical across designs means one saved placement works for all.
    """
    hero = GOLD if dark else KX_INK
    supp = KX_BONE if dark else KX_INK
    body = mark(gold=hero, ink="none", flat=True, knockout=True)
    body = body.split(">", 1)[1].rsplit("</svg>", 1)[0]
    size = 900
    scale = size / S
    x, y = 700, 900
    mono = "ui-monospace, Menlo, monospace"
    return (
        _kx_head(
            f"KXNG SEF — Chest Lion ({'Dark Garment' if dark else 'Bone Tee'})",
            "Left-chest hit. Lion is the only graphic, so it takes the gold; "
            "the sign-off prints bone.",
        )
        + f'  <g transform="translate({x} {y}) scale({scale:.4f})">{body}</g>\n'
        f'  <text x="{x + size/2}" y="{y + size + 190}" text-anchor="middle" '
        f'font-family="{mono}" font-size="112" letter-spacing="20" fill="{supp}">KXNG SEF</text>\n'
        "</svg>\n"
    )


def kxngsef_sleeve(dark=True):
    """Design 25 — sleeve strip: lion over a vertical wordmark."""
    W = 4500
    hero = GOLD if dark else KX_INK
    supp = KX_BONE if dark else KX_INK
    body = mark(gold=hero, ink="none", flat=True, knockout=True)
    body = body.split(">", 1)[1].rsplit("</svg>", 1)[0]
    size = 760
    scale = size / S
    cx = W / 2
    x = cx - size / 2
    y = 1500
    mono = "ui-monospace, Menlo, monospace"
    # rotated so the wordmark reads top-to-bottom down the sleeve
    return (
        _kx_head(
            f"KXNG SEF — Sleeve Lion ({'Dark Garment' if dark else 'Bone Tee'})",
            "Sleeve hit. Lion above a vertical wordmark; lion is the largest "
            "graphic so it carries the gold.",
        )
        + f'  <g transform="translate({x} {y}) scale({scale:.4f})">{body}</g>\n'
        f'  <text transform="translate({cx} {y + size + 300}) rotate(90)" '
        f'font-family="{mono}" font-size="126" letter-spacing="34" fill="{supp}">'
        "KXNG SEF · 408</text>\n"
        "</svg>\n"
    )


KX_DESIGNS = {
    "23-lion-dhahab": kxngsef_print,
    "24-chest-lion": kxngsef_chest,
    "25-sleeve-lion": kxngsef_sleeve,
}


def write_kxngsef():
    if not os.path.isdir(KX_DIR):
        print("skip KXNG SEF: designs dir not found")
        return
    for stem, fn in KX_DESIGNS.items():
        for dark in (True, False):
            name = f"{stem}-{'dark' if dark else 'light'}.svg"
            with open(os.path.join(KX_DIR, name), "w") as fh:
                fh.write(fn(dark))
            print("wrote", os.path.join(KX_DIR, name))
    return


def main():
    os.makedirs(OUT, exist_ok=True)
    if "--kxngsef" in sys.argv:
        write_kxngsef()
    for name, fn in FILES.items():
        path = os.path.join(OUT, name)
        with open(path, "w") as fh:
            fh.write(fn() + "\n")
        print("wrote", os.path.relpath(path, ROOT))

    if "--png" not in sys.argv:
        return
    raster = [
        ("lion-tile.svg", "../../icon-192.png", 192),
        ("lion-tile.svg", "../../icon-512.png", 512),
        ("lion-tile.svg", "../../apple-touch-icon.png", 180),
        ("lion-tile.svg", "lion-tile-1024.png", 1024),
        ("lion-mark.svg", "lion-mark-1024.png", 1024),
        ("og-card.svg", "../../og-card.png", 1200),
    ]
    for src, dst, w in raster:
        s = os.path.join(OUT, src)
        d = os.path.normpath(os.path.join(OUT, dst))
        cmd = ["rsvg-convert", "-w", str(w), s, "-o", d]
        if "og-card" in src:
            cmd = ["rsvg-convert", "-w", "1200", "-h", "630", s, "-o", d]
        subprocess.run(cmd, check=True)
        print("raster", os.path.relpath(d, ROOT))


if __name__ == "__main__":
    main()
