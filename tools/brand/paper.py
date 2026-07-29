"""DHAHAB business paper — letterhead and invoices, on the lion mark.

    uv run --with markdown python tools/brand/paper.py letterhead
    uv run --with markdown python tools/brand/paper.py invoice --to "Acme Freight" \
        --item "FreightDesk AI pilot setup:999" --item "Monthly retainer (Aug):249" \
        --number 2026-001 --due "Aug 15, 2026"

Output goes to ~/Desktop/Money-Machine-Assets/paper/, never into public/ — this
paper carries a phone number and, on an invoice, payment details.

Letterhead prints light (ink on bone). A black-flooded A4 is ~£/$ of toner per
page and reads as a flyer, not correspondence; the gold rule and the mark carry
the brand instead.
"""
import argparse
import base64
import os
import subprocess
import sys
from datetime import date

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lion  # noqa: E402

OUT = os.path.expanduser("~/Desktop/Money-Machine-Assets/paper")
BRAND = lion.OUT
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

NAME = "Yusuf Gadelrab"
EMAIL = "yusuf.gadelrab06@gmail.com"
PHONE = "(669) 328-1148"
SITE = "yusuf-gadelrab.github.io"
CITY = "San Jose, California"

INK, GOLD, BONE = "#14140f", lion.GOLD, "#ffffff"
GOLD_DARK = "#8a7328"


def _lion_uri(variant="lion-mark-ink.svg"):
    with open(os.path.join(BRAND, variant), "rb") as fh:
        return "data:image/svg+xml;base64," + base64.b64encode(fh.read()).decode()


CSS = """
@page {{ size: letter; margin: 0; }}
* {{ box-sizing: border-box; margin: 0; padding: 0; }}
html {{ overflow: hidden; }}
html, body {{ width: 8.5in; -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
body {{ background: #fff; color: {ink}; font-family: Georgia, "Times New Roman", serif;
  font-size: 10.6pt; line-height: 1.62; }}
.sheet {{ width: 8.5in; min-height: 10.98in; padding: 0.78in 0.9in 1.05in;
  position: relative; display: flex; flex-direction: column; }}
.head {{ display: flex; align-items: flex-start; gap: 16pt; padding-bottom: 14pt;
  border-bottom: 1.2pt solid {gold}; }}
.head img {{ width: 46pt; height: 46pt; flex: none; }}
.head .who {{ flex: 1; }}
.head .nm {{ font-size: 17pt; font-weight: 700; letter-spacing: .3pt; }}
.head .rl {{ font-family: -apple-system, "Helvetica Neue", sans-serif; font-size: 7pt;
  letter-spacing: 2pt; text-transform: uppercase; color: {golddark}; margin-top: 3pt; }}
.head .ct {{ text-align: right; font-family: ui-monospace, Menlo, monospace;
  font-size: 7.6pt; line-height: 1.75; color: #55514a; }}
.body {{ flex: 1; padding-top: 26pt; }}
.body p {{ margin-bottom: 11pt; }}
.body h2 {{ font-size: 12.5pt; margin: 18pt 0 8pt; }}
.foot {{ border-top: 1px solid #e2ded3; padding-top: 9pt; margin-top: 26pt;
  font-family: ui-monospace, Menlo, monospace; font-size: 7pt; color: #7d7870;
  display: flex; justify-content: space-between; gap: 12pt; }}

/* ---- invoice ---- */
.meta {{ display: flex; justify-content: space-between; gap: 24pt; margin-top: 24pt; }}
.meta .blk {{ font-size: 9.6pt; }}
.meta .lbl {{ font-family: -apple-system, sans-serif; font-size: 6.6pt; letter-spacing: 1.8pt;
  text-transform: uppercase; color: {golddark}; margin-bottom: 4pt; }}
table {{ width: 100%; border-collapse: collapse; margin-top: 26pt; }}
th {{ font-family: -apple-system, sans-serif; font-size: 6.8pt; letter-spacing: 1.6pt;
  text-transform: uppercase; color: {golddark}; text-align: left; padding: 0 0 7pt;
  border-bottom: 1pt solid {gold}; }}
th.r, td.r {{ text-align: right; }}
td {{ padding: 9pt 0; border-bottom: 1px solid #e8e4da; font-size: 10pt; }}
tfoot td {{ border: none; padding-top: 12pt; font-size: 11pt; }}
tfoot .tot {{ font-weight: 700; font-size: 13.5pt; }}
tfoot .tot td {{ border-top: 1.2pt solid {gold}; padding-top: 12pt; }}
.pay {{ margin-top: 30pt; padding: 13pt 15pt; border: 1px solid #e2ded3;
  border-left: 2.5pt solid {gold}; font-size: 9.4pt; }}
.pay b {{ color: {golddark}; }}
.terms {{ margin-top: 16pt; font-size: 8.4pt; color: #6d6860; }}
"""

SHELL = """<!doctype html><html><head><meta charset="utf-8"><style>{css}</style></head>
<body><div class="sheet">
  <div class="head">
    <img src="{lion}" alt="">
    <div class="who">
      <div class="nm">{name}</div>
      <div class="rl">{role}</div>
    </div>
    <div class="ct">{site}<br>{email}<br>{phone}<br>{city}</div>
  </div>
  {body}
  <div class="foot"><span>{name} · {city}</span><span>{footright}</span></div>
</div></body></html>"""


def _render(html, out_pdf):
    os.makedirs(OUT, exist_ok=True)
    tmp = out_pdf.replace(".pdf", ".html")
    with open(tmp, "w") as fh:
        fh.write(html)
    subprocess.run([
        CHROME, "--headless", "--disable-gpu", "--no-pdf-header-footer",
        f"--print-to-pdf={out_pdf}", "file://" + tmp,
    ], check=True, capture_output=True)
    os.remove(tmp)
    print("  ", out_pdf)


def letterhead():
    body = """
  <div class="body">
    <p style="font-family:ui-monospace,Menlo,monospace;font-size:8.4pt;color:#7d7870">
      {today}</p>
    <p style="margin-top:20pt">Recipient Name<br>Company<br>Address</p>
    <p style="margin-top:20pt">Dear ______,</p>
    <p>Body copy starts here. This sheet is the blank — duplicate it, write into
      this block, and print or export to PDF. Everything above and below the body
      is fixed so every letter you send looks like it came from the same desk.</p>
    <p>Keep paragraphs short. One idea each. Close with a single, specific ask.</p>
    <p style="margin-top:24pt">Sincerely,</p>
    <p style="margin-top:26pt">{name}</p>
  </div>
""".format(today=date.today().strftime("%B %-d, %Y"), name=NAME)
    html = SHELL.format(
        css=CSS.format(ink=INK, gold=GOLD, golddark=GOLD_DARK),
        lion=_lion_uri(), name=NAME,
        role="Computer Science · SJSU · AI Systems",
        site=SITE, email=EMAIL, phone=PHONE, city=CITY,
        body=body, footright="DHAHAB",
    )
    _render(html, os.path.join(OUT, "letterhead.pdf"))
    with open(os.path.join(OUT, "letterhead.html"), "w") as fh:
        fh.write(html)
    print("   editable:", os.path.join(OUT, "letterhead.html"))


def invoice(args):
    rows, total = [], 0.0
    for it in args.item:
        desc, _, amt = it.rpartition(":")
        if not desc:
            print(f"  skipping malformed --item {it!r} (want 'Description:999')")
            continue
        try:
            val = float(amt)
        except ValueError:
            print(f"  skipping --item {it!r}: {amt!r} is not a number")
            continue
        total += val
        rows.append(f'<tr><td>{desc}</td><td class="r">${val:,.2f}</td></tr>')
    if not rows:
        print("  no valid line items — nothing written")
        return

    num = args.number or f"{date.today():%Y}-001"
    body = f"""
  <div class="meta">
    <div class="blk"><div class="lbl">Billed to</div>{args.to.replace(chr(10), '<br>')}</div>
    <div class="blk" style="text-align:right">
      <div class="lbl">Invoice</div>{num}<br>
      <span style="color:#6d6860">Issued {date.today():%b %-d, %Y}</span><br>
      <span style="color:#6d6860">Due {args.due}</span>
    </div>
  </div>
  <div class="body" style="padding-top:0">
    <table>
      <thead><tr><th>Description</th><th class="r">Amount</th></tr></thead>
      <tbody>{''.join(rows)}</tbody>
      <tfoot><tr class="tot"><td>Total due</td><td class="r">${total:,.2f}</td></tr></tfoot>
    </table>
    <div class="pay">
      <b>Payment</b> — {args.pay}<br>
      Reference invoice <b>{num}</b> so it reconciles on both sides.
    </div>
    <p class="terms">{args.terms}</p>
  </div>
"""
    html = SHELL.format(
        css=CSS.format(ink=INK, gold=GOLD, golddark=GOLD_DARK),
        lion=_lion_uri(), name=NAME,
        role="Invoice · Independent Contractor",
        site=SITE, email=EMAIL, phone=PHONE, city=CITY,
        body=body, footright=f"INVOICE {num}",
    )
    out = os.path.join(OUT, f"invoice-{num}.pdf")
    _render(html, out)


README = """# Business paper — DHAHAB

Generated from the lion mark, so letterhead and invoices always match the site,
the products and the cards.

    cd ~/Yusuf-Gadelrab.github.io
    uv run --with markdown python tools/brand/paper.py letterhead
    uv run --with markdown python tools/brand/paper.py invoice \\
        --to "Acme Freight Brokerage\\n123 Main St\\nSan Jose, CA" \\
        --item "FreightDesk AI pilot — setup:999" \\
        --item "FreightDesk AI — monthly retainer, August:249" \\
        --number 2026-001 --due "Aug 15, 2026"

`letterhead.html` is the editable blank: open it, type into the `.body` block,
print to PDF. That keeps the header, footer and rule fixed across every letter.

## Why this prints light
Ink-on-bone, not the site's black-and-gold. A black-flooded sheet drinks toner,
smudges, and reads as a flyer rather than correspondence. The gold rule under the
header plus the mark carry the brand at a fraction of the coverage.

## Notes
- Lives here and **not** in the website repo: it carries a phone number, and an
  invoice also carries payment details.
- Set `--pay` to whatever you actually want to be paid through (Zelle to the
  email, a Stripe/Wise link, ACH). The default is deliberately a placeholder so a
  wrong account never ships silently.
- ⚠ Invoicing is income. The TD income gate is signed off as of Jul 27, 2026 —
  keep the attorney's written confirmation on file before billing a US client.
"""


def main():
    ap = argparse.ArgumentParser(description="DHAHAB letterhead and invoices")
    ap.add_argument("stage", choices=["letterhead", "invoice", "all"])
    ap.add_argument("--to", default="Client Name\nCompany\nAddress")
    ap.add_argument("--item", action="append", default=[],
                    help="'Description:amount', repeatable")
    ap.add_argument("--number", default="")
    ap.add_argument("--due", default="Net 15")
    ap.add_argument("--pay", default="Zelle to " + EMAIL + " (confirm before sending)")
    ap.add_argument("--terms", default=(
        "Payment due per the date above. Work product transfers on payment in full. "
        "Independent contractor; no employment relationship is created by this invoice."))
    args = ap.parse_args()

    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, "README.md"), "w") as fh:
        fh.write(README)

    if args.stage in ("letterhead", "all"):
        print("=== letterhead ===")
        letterhead()
    if args.stage in ("invoice", "all"):
        print("=== invoice ===")
        if not args.item:
            args.item = ["FreightDesk AI pilot — setup:999",
                         "FreightDesk AI — monthly retainer:249"]
            print("   (no --item given; writing a sample invoice)")
        invoice(args)


if __name__ == "__main__":
    main()
