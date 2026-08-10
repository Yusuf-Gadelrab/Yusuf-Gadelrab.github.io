#!/usr/bin/env python3
"""Generate the DHAHAB Freight illustration set.

Procedural, not hand-drawn, so the ridge silhouettes and the US map stay
reproducible. Outputs SVG files to public/img/freight/ plus the inline map
markup (map needs to be inline in the page so freight.js can drive the arcs).
"""
import math, random, os, json

OUT = "/Users/yusuf/Yusuf-Gadelrab.github.io/public/img/freight"
INLINE = "/private/tmp/claude-501/-Users-yusuf/fcce2a48-7869-42ce-93ef-2f4cd5838488/scratchpad/map-inline.svg"
os.makedirs(OUT, exist_ok=True)

GOLD = "#D4AF37"
GOLD2 = "#e9c96a"


def w(name, body):
    p = os.path.join(OUT, name)
    with open(p, "w") as f:
        f.write(body)
    print(f"wrote {p} ({len(body)} bytes)")


# ── ridge silhouettes ────────────────────────────────────────────────────────
def ridge(seed, w_, h_, base, amp, roughness, octaves=5):
    """1D midpoint-displacement ridge. Returns a polygon point list."""
    rnd = random.Random(seed)
    n = 2 ** octaves
    pts = [0.0] * (n + 1)
    pts[0] = rnd.uniform(-0.2, 0.2)
    pts[n] = rnd.uniform(-0.2, 0.2)
    step = n
    scale = 1.0
    while step > 1:
        half = step // 2
        for i in range(half, n, step):
            pts[i] = (pts[i - half] + pts[i + half]) / 2 + rnd.uniform(-scale, scale)
        step = half
        scale *= roughness
    lo, hi = min(pts), max(pts)
    rng = (hi - lo) or 1
    out = []
    for i, v in enumerate(pts):
        x = i / n * w_
        y = base - ((v - lo) / rng) * amp
        out.append((round(x, 1), round(y, 1)))
    return out


def ridge_svg(seed, amp, base, fill, rim, rim_op, sw):
    """Filled silhouette plus a rim-lit crest. Without the crest stroke a dark
    ridge on a dark sky is invisible; the rim is what makes it read as a ridge
    rather than as nothing at all."""
    W, H = 1600, 420
    pts = ridge(seed, W, H, base, amp, 0.62, 6)
    crest = " L".join(f"{x},{y}" for x, y in pts)
    d = f"M0,{H} L{crest} L{W},{H} Z"
    gid = f"rg{seed}"
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
        f'width="{W}" height="{H}" preserveAspectRatio="none" role="presentation" aria-hidden="true">'
        f'<defs><linearGradient id="{gid}" x1="0" y1="0" x2="1" y2="0">'
        f'<stop offset="0" stop-color="{rim}" stop-opacity="0"/>'
        f'<stop offset=".22" stop-color="{rim}" stop-opacity="{rim_op}"/>'
        f'<stop offset=".5" stop-color="{rim}" stop-opacity="{min(1.0, rim_op*1.7):.2f}"/>'
        f'<stop offset=".78" stop-color="{rim}" stop-opacity="{rim_op}"/>'
        f'<stop offset="1" stop-color="{rim}" stop-opacity="0"/></linearGradient></defs>'
        f'<path d="{d}" fill="{fill}"/>'
        f'<path d="M{crest}" fill="none" stroke="url(#{gid})" stroke-width="{sw}" '
        f'stroke-linejoin="round" vector-effect="non-scaling-stroke"/>'
        f'</svg>'
    )


w("ridge-far.svg", ridge_svg(11, 120, 300, "#191922", "#D4AF37", .30, 1.4))
w("ridge-near.svg", ridge_svg(29, 175, 360, "#0d0d12", "#e9c96a", .42, 1.6))

# ── distant skyline + pylons (mid layer) ─────────────────────────────────────
def skyline():
    W, H = 1600, 300
    rnd = random.Random(7)
    parts = []
    x = 0
    while x < W:
        bw = rnd.choice([26, 34, 42, 20, 56])
        bh = rnd.randint(30, 118)
        y = H - bh
        parts.append(f'<rect x="{x}" y="{y}" width="{bw - 4}" height="{bh}" fill="#1a1a23"/>')
        parts.append(f'<rect x="{x}" y="{y}" width="{bw - 4}" height="1.4" fill="#D4AF37" fill-opacity=".22"/>')
        # a few lit windows, gold, very dim
        for _ in range(rnd.randint(0, 3)):
            wx = x + rnd.randint(4, max(5, bw - 12))
            wy = y + rnd.randint(6, max(7, bh - 8))
            parts.append(f'<rect x="{wx}" y="{wy}" width="3" height="4" fill="{GOLD}" fill-opacity="{rnd.choice([.35,.5,.7])}"/>')
        x += bw + rnd.randint(2, 14)
    # transmission pylons on the rhythm
    for px in range(120, W, 380):
        parts.append(
            f'<g stroke="#23232e" stroke-width="2.5" fill="none">'
            f'<path d="M{px} {H} L{px} {H-150} M{px-26} {H} L{px} {H-150} M{px+26} {H} L{px} {H-150}"/>'
            f'<path d="M{px-34} {H-118} L{px+34} {H-118} M{px-28} {H-92} L{px+28} {H-92}"/></g>'
        )
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" '
        f'preserveAspectRatio="none" role="presentation" aria-hidden="true">' + "".join(parts) + "</svg>"
    )


w("skyline.svg", skyline())

# ── US map + CA-centric lanes (inline markup) ────────────────────────────────
K = 15.5
XO, YO = 30.0, 40.0
LAT0 = 49.5


def proj(lon, lat):
    return round((lon + 125.5) * K + XO, 1), round((LAT0 - lat) * 20.5 + YO, 1)


BORDER = [
    (-124.7, 48.4), (-123.1, 48.2), (-122.8, 49.0), (-117.0, 49.0), (-110.0, 49.0),
    (-104.0, 49.0), (-99.0, 49.0), (-95.15, 49.0), (-95.15, 48.6), (-93.5, 48.6),
    (-92.3, 48.2), (-90.8, 48.1), (-89.6, 48.0), (-88.4, 48.3), (-86.9, 47.5),
    (-85.0, 46.6), (-84.4, 46.5),
    # Lake Michigan: west along the UP shore, down Wisconsin, around Chicago,
    # back up the mitten's west shore. The fjord is what makes the map read
    # as the US rather than a generic blob.
    (-85.6, 45.95), (-86.6, 45.9), (-87.6, 45.35), (-87.4, 45.1), (-87.9, 44.6),
    (-87.9, 43.9), (-87.7, 43.2), (-87.8, 42.5), (-87.5, 41.7), (-86.9, 41.6),
    (-86.4, 42.1), (-86.2, 43.1), (-86.5, 44.3), (-86.2, 45.1), (-85.1, 45.75),
    (-84.7, 45.75), (-83.9, 45.05), (-83.3, 44.3), (-82.9, 44.0), (-82.4, 43.6),
    (-82.5, 42.9), (-83.1, 42.3), (-82.5, 41.7), (-81.0, 42.2), (-79.8, 42.4),
    (-78.9, 42.9), (-77.0, 43.4), (-76.4, 44.1), (-75.3, 44.8), (-74.3, 45.0),
    (-71.5, 45.0), (-71.1, 45.3), (-70.3, 46.3), (-69.2, 47.4), (-68.3, 47.3),
    (-67.8, 47.1), (-67.4, 45.6), (-67.0, 44.8), (-68.8, 44.3), (-69.8, 43.8),
    (-70.6, 43.1), (-70.8, 42.6), (-70.1, 42.0), (-70.0, 41.7), (-71.4, 41.4),
    (-72.9, 41.2), (-74.0, 40.6), (-74.1, 39.7), (-74.9, 38.9), (-75.0, 38.0),
    (-76.0, 37.2), (-75.9, 36.6), (-75.5, 35.3), (-76.8, 34.7), (-78.0, 33.9),
    (-79.2, 33.2), (-79.9, 32.8), (-81.1, 31.5), (-81.4, 30.7), (-81.1, 29.2),
    (-80.4, 28.0), (-80.1, 26.5), (-80.3, 25.2), (-81.2, 25.2), (-81.8, 26.4),
    (-82.7, 27.8), (-82.8, 29.0), (-83.8, 29.9), (-85.0, 29.7), (-86.0, 30.4),
    (-87.5, 30.3), (-88.9, 30.4), (-89.4, 29.2), (-90.5, 29.1), (-91.9, 29.6),
    (-93.3, 29.8), (-94.7, 29.3), (-95.4, 28.8), (-97.1, 27.9), (-97.3, 26.1),
    (-98.4, 26.1), (-99.5, 27.6), (-100.8, 29.3), (-102.4, 29.8), (-103.1, 29.0),
    (-104.7, 30.2), (-106.5, 31.8), (-108.2, 31.3), (-111.1, 31.3), (-114.8, 32.5),
    (-117.1, 32.5), (-118.4, 33.7), (-119.5, 34.4), (-120.6, 34.5), (-121.0, 35.5),
    (-121.9, 36.6), (-122.4, 37.2), (-122.5, 37.9), (-123.0, 38.3), (-123.8, 39.8),
    (-124.4, 40.4), (-124.1, 41.8), (-124.2, 43.3), (-124.0, 45.0), (-123.9, 46.2),
    (-124.1, 47.0), (-124.7, 48.4),
]

CITIES = {
    "SJC": (-121.89, 37.34), "OAK": (-122.27, 37.80), "LAX": (-118.24, 34.05),
    "SEA": (-122.33, 47.61), "PHX": (-112.07, 33.45), "SLC": (-111.89, 40.76),
    "DEN": (-104.99, 39.74), "DFW": (-96.80, 32.78), "HOU": (-95.37, 29.76),
    "CHI": (-87.63, 41.88), "ATL": (-84.39, 33.75), "EWR": (-74.17, 40.73),
    "MEM": (-90.05, 35.15), "PDX": (-122.68, 45.52),
}

LANES = [
    ("OAK", "CHI", .20), ("LAX", "DFW", .15), ("LAX", "PHX", .16),
    ("SJC", "SEA", -.20), ("LAX", "ATL", .13), ("OAK", "SLC", -.20),
    ("LAX", "EWR", .12), ("SJC", "DEN", -.15), ("LAX", "HOU", -.10),
    ("OAK", "PDX", -.22), ("SJC", "MEM", .17),
]


def arc(a, b, bow):
    x1, y1 = proj(*CITIES[a])
    x2, y2 = proj(*CITIES[b])
    mx, my = (x1 + x2) / 2, (y1 + y2) / 2
    dx, dy = x2 - x1, y2 - y1
    cx, cy = mx - dy * bow, my + dx * bow
    return f"M{x1},{y1} Q{round(cx,1)},{round(cy,1)} {x2},{y2}"


border_d = "M" + " L".join(f"{proj(lo,la)[0]},{proj(lo,la)[1]}" for lo, la in BORDER) + " Z"

lane_paths = "".join(
    f'<path class="lane__arc" data-lane="{i}" d="{arc(a,b,bow)}"/>' for i, (a, b, bow) in enumerate(LANES)
)
node_dots = "".join(
    f'<circle class="lane__node{" lane__node--home" if k in ("SJC","OAK","LAX") else ""}" '
    f'cx="{proj(*v)[0]}" cy="{proj(*v)[1]}" r="{4 if k in ("SJC","OAK","LAX") else 3}"/>'
    for k, v in CITIES.items()
)
pulses = "".join(f'<circle class="lane__pulse" data-lane="{i}" r="3.2"/>' for i in range(len(LANES)))

map_svg = f'''<svg class="lanemap" viewBox="0 0 960 600" role="img" aria-labelledby="lanemapTitle lanemapDesc" preserveAspectRatio="xMidYMid meet">
<title id="lanemapTitle">Continental United States with the founding lane corridors marked</title>
<desc id="lanemapDesc">A stylised map of the lower 48 states. Gold arcs run out of Northern and Southern California to Seattle, Portland, Salt Lake City, Denver, Phoenix, Dallas, Houston, Memphis, Chicago, Atlanta and the New York metro.</desc>
<defs>
  <linearGradient id="lmFill" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#1a1a20"/><stop offset="1" stop-color="#101014"/>
  </linearGradient>
  <linearGradient id="lmArc" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="{GOLD}" stop-opacity=".15"/>
    <stop offset=".5" stop-color="{GOLD2}" stop-opacity=".95"/>
    <stop offset="1" stop-color="{GOLD}" stop-opacity=".15"/>
  </linearGradient>
  <filter id="lmGlow" x="-40%" y="-40%" width="180%" height="180%">
    <feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
</defs>
<path class="lanemap__land" d="{border_d}"/>
<g class="lanemap__arcs" filter="url(#lmGlow)">{lane_paths}</g>
<g class="lanemap__nodes">{node_dots}</g>
<g class="lanemap__pulses">{pulses}</g>
</svg>'''

with open(INLINE, "w") as f:
    f.write(map_svg)
print(f"wrote {INLINE} ({len(map_svg)} bytes, {len(LANES)} lanes)")
