#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["pillow>=10.4"]
# ///
"""Portfolio OG/social card generator — one design system, 1200x630.

Everything is drawn in code from the site's own design tokens (css/site.css).
No stock imagery, no downloaded assets, no external fonts (macOS system faces
only). Deterministic: no timestamps, no randomness — rerunning is byte-stable.

Layout is FOOTER-ANCHORED: the rule and the URL sit on the same baseline on
every card, and the headline block grows upward from a fixed bottom. That is
what makes 1-line and 2-line cards read as one set, and it removes the
subtitle/rule collision the old freightdesk + store cards had.

Two sources of cards:

  CARDS       hand-written specs for the top-level marketing pages, where the
              headline is copy, not the page title.
  derived()   every page in public/guides/ and public/writing/, read straight
              off disk. A new guide gets a card on the next run with nothing to
              register — the same filesystem-as-registry rule the hub builders
              and the sitemap use.

Usage:  uv run tools/gen_og_cards.py [--out public/og] [--only store,guides]
        uv run tools/gen_og_cards.py --missing     # only cards not on disk yet
        uv run tools/gen_og_cards.py --manifest    # print og:image URL per page
"""

from __future__ import annotations

import argparse
import html
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "og"

# ------------------------------------------------------------------ tokens
# lifted from public/css/site.css :root
BG = (0x0B, 0x0B, 0x0D)
PANEL = (0x14, 0x14, 0x16)
BONE = (0xF2, 0xED, 0xE4)
GOLD = (0xD4, 0xAF, 0x37)
GOLD_2 = (0xE9, 0xC9, 0x6A)
MUTED = (0xB4, 0xAE, 0xA2)
LINE = (0x3A, 0x33, 0x1E)

W, H = 1200, 630
SS = 2  # supersample factor for crisp vector edges

PAD = 96          # content left edge
INSET = 24        # outer card inset
URL_BASE = 556    # baseline of the mono url  (footer anchor)
RULE_Y = 512      # hairline
SUB_BASE = 484    # subtitle baseline
HEAD_BOTTOM = 430 # bottom of the headline block; it grows upward
ICON_XY = (96, 118)
ICON_SIZE = 106

F_HEAD = "/System/Library/Fonts/Supplemental/Iowan Old Style.ttc"
F_HEAD_IDX = 1  # Bold
F_SANS = "/System/Library/Fonts/HelveticaNeue.ttc"
F_SANS_IDX = 0  # Regular
F_MONO = "/System/Library/Fonts/Menlo.ttc"
F_MONO_IDX = 1  # Bold
# Helvetica Neue has no geometric-symbol coverage; Arial Unicode does, and PIL
# does no font fallback — so symbol glyphs get their own face or they render tofu.
F_GLYPH = "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"


def font(path: str, idx: int, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size * SS, index=idx)


# ------------------------------------------------------------------- cards
# headline is written as [line1, line2]; line1 renders bone, line2 gold.
# icon is a single glyph drawn in the gold token square.
CARDS: dict[str, dict] = {
    "about-card": dict(
        icon="◉",
        head=["Who is", "Yusuf Gadelrab?"],
        sub="Answer-first biography, credentials and sourced numbers.",
        url="yusuf-gadelrab.github.io/about",
    ),
    "brand-card": dict(
        icon="✷",
        head=["The DHAHAB", "lion mark"],
        sub="One generated mark: why a lion, the rules, and the files.",
        url="yusuf-gadelrab.github.io/brand",
    ),
    "circle-card": dict(
        icon="◎",
        head=["DHAHAB Circle"],
        sub="A community for builders and traders. Receipts over opinions.",
        url="yusuf-gadelrab.github.io/circle",
    ),
    "dira-card": dict(
        icon="⛨",
        head=["DIRA — security", "audit in one command"],
        sub="Secrets, CVEs, misconfigs and a startup readiness score.",
        url="yusuf-gadelrab.github.io/dira",
    ),
    "guides-card": dict(
        icon="§",
        head=["Guides, with", "every formula shown"],
        sub="Long-form answers, each paired with a free calculator.",
        url="yusuf-gadelrab.github.io/guides",
    ),
    "hire-card": dict(
        icon="→",
        head=["Two ways to", "work with me"],
        sub="Recruiters get proof. Founders get a freelance builder.",
        url="yusuf-gadelrab.github.io/hire",
    ),
    "media-kit-card": dict(
        icon="◐",
        head=["Creator", "media kit"],
        sub="Audience, formats, past work and how to book a collaboration.",
        url="yusuf-gadelrab.github.io/media-kit",
    ),
    "modeling-card": dict(
        icon="◑",
        head=["Model portfolio", "& digitals"],
        sub="Athletic and commercial, San Jose. Digitals and measurements.",
        url="yusuf-gadelrab.github.io/modeling",
    ),
    "acting-card": dict(
        icon="◒",
        head=["Actor &", "model"],
        sub="Bilingual performer, athlete, builder. San Jose / Bay Area.",
        url="yusuf-gadelrab.github.io/acting",
    ),
    "stack-card": dict(
        icon="⌘",
        head=["My stack —", "what I actually use"],
        sub="The tools behind the trading, the code and the cut.",
        url="yusuf-gadelrab.github.io/stack",
    ),
    "kxngsef-lookbook-card": dict(
        icon="♛",
        head=["KXNG SEF", "lookbook"],
        sub="Every printable design in the line, grouped by placement.",
        url="yusuf-gadelrab.github.io/kxngsef-lookbook",
    ),
    "ecoimpact-card": dict(
        icon="♺",
        head=["EcoImpact"],
        sub="A trash map and an impact meter for real cleanup work.",
        url="yusuf-gadelrab.github.io/ecoimpact",
    ),
    "eventreels-card": dict(
        icon="▶",
        head=["EventReels"],
        sub="Your night, already edited — an automated reel pipeline.",
        url="yusuf-gadelrab.github.io/eventreels",
    ),
    "spartaneats-card": dict(
        icon="◍",
        head=["SpartanEats"],
        sub="Campus-priced student food delivery, built for SJSU.",
        url="yusuf-gadelrab.github.io/spartaneats",
    ),
    "apply-card": dict(
        icon="◈",
        head=["Apply OS —", "Deadline Radar"],
        sub="Free, private application tracker. No account, no server.",
        url="yusuf-gadelrab.github.io/apply",
    ),
    "apps-card": dict(
        icon="▤",
        head=["Apps & Projects"],
        sub="Everything built, each with an honest status label.",
        url="yusuf-gadelrab.github.io/apps",
    ),
    "au-card": dict(
        icon="AU",
        head=["A feed without", "the outrage"],
        sub="Chronological only. No vanity metrics. Posts carry proof.",
        url="yusuf-gadelrab.github.io/au",
    ),
    "everything-card": dict(
        icon="✦",
        head=["Everything I do,", "one gold map"],
        sub="Projects, research, trading and content — in public.",
        url="yusuf-gadelrab.github.io/everything",
    ),
    "freight-tools-card": dict(
        icon="▦",
        head=["Freight broker", "calculators"],
        sub="Margin, RPM, fuel surcharge, factoring and aging math.",
        url="yusuf-gadelrab.github.io/freight-tools",
    ),
    "freightdesk-card": dict(
        icon="$",
        head=["Your back office,", "on autopilot"],
        sub="FreightDesk AI reads the billing inbox and drafts every reply — locally.",
        url="yusuf-gadelrab.github.io/freightdesk",
    ),
    "freight-card": dict(
        icon="F",
        head=["The golden standard", "of freight"],
        sub="DHAHAB Freight. An AI-native brokerage built for founding shippers.",
        url="yusuf-gadelrab.github.io/freight",
    ),
    "heft-card": dict(
        icon="H",
        head=["Weight is", "the design"],
        sub="450+ GSM heavyweight hoodies. Minimal, maximum weight.",
        url="yusuf-gadelrab.github.io/heft",
    ),
    "hwyhaul-card": dict(
        icon="◧",
        head=["The freight back", "office, run by AI"],
        sub="HwyHaul LoadLink — an engineering case study.",
        url="yusuf-gadelrab.github.io/hwyhaul",
    ),
    "resume-card": dict(
        icon="▤",
        head=["Your resume is", "what's getting cut"],
        sub="ATS resume rebuilds and application engineering for students.",
        url="yusuf-gadelrab.github.io/resume",
    ),
    "risk-tools-card": dict(
        icon="△",
        head=["The Trader's", "Risk Toolkit"],
        sub="Position size, R-multiples, expectancy and drawdown math.",
        url="yusuf-gadelrab.github.io/risk-tools",
    ),
    "sprint-card": dict(
        icon="↗",
        head=["LinkedIn profile,", "rewritten to convert"],
        sub="Headline, About and metric-first bullets in 48 hours.",
        url="yusuf-gadelrab.github.io/sprint",
    ),
    "store-card": dict(
        icon="$",
        head=["Automation software", "& AI tools store"],
        sub="Twelve downloads from $19 — local AI, zero API fees.",
        url="yusuf-gadelrab.github.io/store",
    ),
    "swing-screener-card": dict(
        icon="◑",
        head=["I killed my own", "trading strategy"],
        sub="The walk-forward harness that only validated one setup.",
        url="yusuf-gadelrab.github.io/swing-screener",
    ),
    "templates-card": dict(
        icon="◆",
        head=["The Midnight", "Gold Vault"],
        sub="Decks, proposals, contracts, resumes. Nothing to install.",
        url="yusuf-gadelrab.github.io/templates",
    ),
    "trading-bot-card": dict(
        icon="◆",
        head=["The interesting part", "isn't the strategy"],
        sub="Execution, risk gates and failure handling in a live bot.",
        url="yusuf-gadelrab.github.io/trading-bot",
    ),
    "visa-card": dict(
        icon="✈",
        head=["Visa Navigator"],
        sub="Map F-1, OPT, CPT and H-1B timing before the deadline moves.",
        url="yusuf-gadelrab.github.io/visa",
    ),
}


# ------------------------------------------------------- derived (per-page)
# Sections whose cards come from the pages themselves. Icons reuse glyphs
# already proven to render in Arial Unicode elsewhere in this file.
SECTIONS = {"guides": "§", "writing": "✦"}
BASE_URL = "yusuf-gadelrab.github.io"

# Top-level pages that are legal/utility surfaces. Nobody shares a refund
# policy, and a card for one is dead weight in the repo.
ROOT_SKIP = {
    "404", "offline", "googlebb78e2fba04aed48", "legal", "dmca", "refunds",
    "accessibility", "privacy", "terms", "dhahab-prompt-vault-privacy",
    "index",  # the homepage keeps the house card, og-card.png
}
ROOT_ICON = "◆"


def _meta(text: str, prop: str, attr: str = "property") -> str:
    m = re.search(rf'<meta {attr}="{prop}" content="(.*?)"\s*/?>', text, re.S)
    return html.unescape(m.group(1)).strip() if m else ""


def _h1(text: str) -> str:
    m = re.search(r"<h1[^>]*>(.*?)</h1>", text, re.S)
    return html.unescape(re.sub(r"<[^>]+>", "", m.group(1))).strip() if m else ""


def derived() -> dict[str, dict]:
    """One spec per rendered page in each derived section.

    og:title is preferred over <h1> because it is already written short for a
    social card; the h1 is the long SEO headline and would wrap to four lines.
    """
    out: dict[str, dict] = {}
    for section, icon in SECTIONS.items():
        for path in sorted((ROOT / "public" / section).glob("*.html")):
            if path.name in ("index.html", "404.html"):
                continue
            text = path.read_text(encoding="utf-8")
            head = _meta(text, "og:title") or _h1(text) or path.stem
            sub = (_meta(text, "og:description")
                   or _meta(text, "description", attr="name"))
            head = re.sub(r"\s*[—|-]\s*Yusuf Gadelrab\s*$", "", head).strip()
            out[f"{section}/{path.stem}-card"] = dict(
                icon=icon, headline=head, sub=sub,
                url=f"{BASE_URL}/{section}/{path.stem}",
                page=f"/{section}/{path.name}",
            )

    # Top-level pages with no hand-written spec fall back to their own meta,
    # so a new page ships with a real card instead of the generic one.
    for path in sorted((ROOT / "public").glob("*.html")):
        name = f"{path.stem}-card"
        if path.stem in ROOT_SKIP or name in CARDS:
            continue
        text = path.read_text(encoding="utf-8")
        head = _meta(text, "og:title") or _h1(text) or path.stem
        sub = _meta(text, "og:description") or _meta(text, "description",
                                                     attr="name")
        head = re.sub(r"\s*[—|-]\s*Yusuf Gadelrab\s*$", "", head).strip()
        out[name] = dict(icon=ROOT_ICON, headline=head, sub=sub,
                         url=f"{BASE_URL}/{path.stem}",
                         page=f"/{path.name}")
    return out


# ---------------------------------------------------------------- painting


def background() -> Image.Image:
    """Near-black base + a soft warm bloom in the top-right, drawn per-pixel
    on a small tile and upscaled — cheap, smooth, no external gradient asset."""
    tile = 80
    g = Image.new("RGB", (tile, tile))
    px = g.load()
    for y in range(tile):
        for x in range(tile):
            fy = y / (tile - 1)
            fx = x / (tile - 1)
            # radial bloom centred just off the top-right corner
            dx, dy = fx - 0.92, fy - 0.02
            d = (dx * dx * 0.55 + dy * dy) ** 0.5
            bloom = max(0.0, 1.0 - d / 0.85) ** 2.4
            # gentle top-to-bottom lift so the card is not flat
            vert = (1.0 - fy) * 0.35
            r = BG[0] + bloom * 26 + vert * 5
            gg = BG[1] + bloom * 21 + vert * 5
            b = BG[2] + bloom * 8 + vert * 6
            px[x, y] = (int(r), int(gg), int(b))
    return g.resize((W * SS, H * SS), Image.BICUBIC)


def rounded(draw: ImageDraw.ImageDraw, box, radius, **kw):
    draw.rounded_rectangle([c * SS for c in box], radius=radius * SS, **kw)


def fit_headline(lines: list[str], max_w: int):
    """Largest size at which every line fits the measure. Set-wide range keeps
    cards visually comparable instead of one card shouting."""
    for size in range(56, 41, -1):
        f = font(F_HEAD, F_HEAD_IDX, size)
        if all(f.getlength(t) <= max_w * SS for t in lines):
            return f, size
    return font(F_HEAD, F_HEAD_IDX, 42), 42


MAX_LINES = 3


def _wrap(text: str, f: ImageFont.FreeTypeFont, max_w: int) -> list[str]:
    lines, cur = [], ""
    for word in text.split():
        trial = f"{cur} {word}".strip()
        if not cur or f.getlength(trial) <= max_w * SS:
            cur = trial
        else:
            lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    return lines


def _balance(text: str, f: ImageFont.FreeTypeFont, max_w: int,
             n: int) -> list[str]:
    """Re-break the same text into n lines using the narrowest measure that
    still fits in n lines. Greedy wrapping leaves widows — a headline ending on
    a single short word reads as a mistake at thumbnail size."""
    if n < 2:
        return _wrap(text, f, max_w)
    lo, hi, best = 1, max_w, max_w
    while lo <= hi:
        mid = (lo + hi) // 2
        if len(_wrap(text, f, mid)) <= n:
            best, hi = mid, mid - 1
        else:
            lo = mid + 1
    return _wrap(text, f, best)


def wrap_headline(text: str, max_w: int):
    """Wrap a page title to at most three lines at the largest size that fits.

    Derived cards start one step smaller than the hand-written ones (52 vs 56)
    because a page title is prose, not a two-word slogan, and matching the
    slogan size would push every guide card to three tight lines.
    """
    for size in range(52, 33, -1):
        f = font(F_HEAD, F_HEAD_IDX, size)
        lines = _wrap(text, f, max_w)
        if len(lines) <= MAX_LINES and all(
                f.getlength(t) <= max_w * SS for t in lines):
            return f, size, _balance(text, f, max_w, len(lines))
    f = font(F_HEAD, F_HEAD_IDX, 34)
    lines = _wrap(text, f, max_w)[:MAX_LINES]
    if lines:
        lines[-1] = _ellipsize(lines[-1], f, max_w)
    return f, 34, lines


def _ellipsize(text: str, f: ImageFont.FreeTypeFont, max_w: int) -> str:
    """Trim at a word boundary until it fits, then mark the cut."""
    if f.getlength(text) <= max_w * SS:
        return text
    words = text.split()
    while words:
        words.pop()
        trial = " ".join(words) + "…"
        if f.getlength(trial) <= max_w * SS:
            return trial
    return "…"


LION_PNG = ROOT / "public" / "img" / "brand" / "lion-mark-1024.png"
LION_SIZE = 92
LION_XY = (W - INSET - 48 - LION_SIZE, INSET + 44)


def paste_lion(im: Image.Image) -> None:
    """House mark, top-right. Silently skipped if the PNG has not been
    generated yet (tools/brand/lion.py --png), so card builds never hard-fail
    on a missing asset."""
    if not LION_PNG.exists():
        return
    lion = Image.open(LION_PNG).convert("RGBA").resize(
        (LION_SIZE * SS, LION_SIZE * SS), Image.LANCZOS)
    # paste-with-mask, not alpha_composite: background() hands back an RGB image
    im.paste(lion, (LION_XY[0] * SS, LION_XY[1] * SS), lion)


def build(spec: dict) -> Image.Image:
    im = background()
    d = ImageDraw.Draw(im, "RGBA")

    # inner panel + hairline border
    rounded(d, (INSET, INSET, W - INSET, H - INSET), 22,
            fill=(*PANEL, 150), outline=(*GOLD, 46), width=1 * SS)

    paste_lion(im)

    # icon chip
    ix, iy = ICON_XY
    rounded(d, (ix, iy, ix + ICON_SIZE, iy + ICON_SIZE), 26,
            fill=(*GOLD, 16), outline=(*GOLD, 130), width=2 * SS)
    glyph = spec["icon"]
    alnum = glyph.isalnum() or glyph == "$"
    if alnum:
        gf = font(F_SANS, 1, 34 if len(glyph) > 1 else 46)
    else:
        # Arial Unicode draws geometric shapes small relative to the em, so fit
        # by measured ink height instead of nominal point size — otherwise the
        # symbol chips read visibly weaker than the letter chips.
        target = 40 * SS
        gf = ImageFont.truetype(F_GLYPH, 44 * SS)
        bb = gf.getbbox(glyph)
        ink = max(bb[3] - bb[1], 1)
        gf = ImageFont.truetype(F_GLYPH, max(1, round(44 * SS * target / ink)))
    bb = gf.getbbox(glyph)
    d.text(((ix + ICON_SIZE / 2) * SS - (bb[0] + bb[2]) / 2,
            (iy + ICON_SIZE / 2) * SS - (bb[1] + bb[3]) / 2),
           glyph, font=gf, fill=GOLD_2)

    # headline — bottom-anchored so the footer never moves
    measure = W - PAD * 2 - 24
    if "headline" in spec:
        hf, hsize, lines = wrap_headline(spec["headline"], measure)
    else:
        lines = spec["head"]
        hf, hsize = fit_headline(lines, measure)
    leading = int(hsize * 1.16)
    y = HEAD_BOTTOM - leading * (len(lines) - 1)
    last = len(lines) - 1
    for i, text in enumerate(lines):
        # last line gold: on a 2-line card that is the existing bone/gold
        # split, and it still reads as one system at 1 or 3 lines.
        d.text((PAD * SS, (y + i * leading) * SS), text, font=hf,
               fill=GOLD if (i == last and last > 0) else BONE, anchor="ls")

    # subtitle — one line only; the rule sits 28px below it
    sf = font(F_SANS, F_SANS_IDX, 25)
    d.text((PAD * SS, SUB_BASE * SS), _ellipsize(spec["sub"], sf, measure),
           font=sf, fill=MUTED, anchor="ls")

    # hairline + url
    d.line([(PAD * SS, RULE_Y * SS), ((W - PAD) * SS, RULE_Y * SS)],
           fill=LINE, width=1 * SS)
    mf = font(F_MONO, F_MONO_IDX, 21)
    d.text((PAD * SS, URL_BASE * SS), spec["url"], font=mf, fill=GOLD, anchor="ls")

    return im.resize((W, H), Image.LANCZOS)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=str(OUT))
    ap.add_argument("--only", default="",
                    help="card names, or a section: --only guides,store")
    ap.add_argument("--missing", action="store_true",
                    help="skip cards whose PNG already exists")
    ap.add_argument("--manifest", action="store_true",
                    help="print page -> og:image URL for every derived card")
    a = ap.parse_args()
    out = Path(a.out)
    keep = {s.strip() for s in a.only.split(",") if s.strip()}

    specs = dict(CARDS)
    specs.update(derived())

    if a.manifest:
        for name, spec in sorted(specs.items()):
            if "page" in spec:
                print(f"{spec['page']}\thttps://{BASE_URL}/og/{name}.png")
        return

    made = skipped = 0
    for name in sorted(specs):
        section = name.split("/")[0] if "/" in name else ""
        if keep and not (name in keep
                         or name.removesuffix("-card") in keep
                         or section in keep):
            continue
        p = out / f"{name}.png"
        if a.missing and p.exists():
            skipped += 1
            continue
        p.parent.mkdir(parents=True, exist_ok=True)
        img = build(specs[name])
        # adaptive palette: these are flat brand graphics, 256 colours is
        # indistinguishable here and roughly halves the byte count.
        q = img.convert("RGB").quantize(colors=256, method=Image.MEDIANCUT, dither=Image.FLOYDSTEINBERG)
        q.save(p, format="PNG", optimize=True)
        made += 1
        print(f"{name}.png  {p.stat().st_size:,} B")
    print(f"\n{made} written, {skipped} already present")


if __name__ == "__main__":
    main()
