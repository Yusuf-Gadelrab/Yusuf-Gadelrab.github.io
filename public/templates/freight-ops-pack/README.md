# Freight Broker Ops Pack — Midnight Gold

> **⚠️ DISCLAIMER — READ FIRST**
> These are **templates, not legal advice**. `carrier-packet.html` in particular contains a Broker-Carrier Agreement summary, insurance requirements, and a Notice of Assignment acknowledgment — contract and compliance language that is regulated differently by state and by FMCSA rule. **Have a licensed attorney and/or your insurance broker review and adapt every document to your own operating authority and specific carrier relationships before you send it or rely on it in a dispute.** Yusuf Gadelrab / Automation Studio is not a law firm and this pack is sold as-is with no warranty of legal or regulatory sufficiency.
>
> **MC/DOT numbers are fictional.** Every MC #, DOT #, EIN, and account number in this pack (e.g. `MC-887210`, `DOT-2203871`) is invented for sample purposes and does not correspond to a real motor carrier or broker. Replace with your own real, verified numbers before use — never operate under a fabricated authority number.

Six matching documents, one visual system: **Ridgeline Freight Partners** (a fictional property broker) tendering to **Copper State Carriers, LLC** (a fictional motor carrier) in the sample content — replace both with your own.

| File | What it is | When it's used in the load lifecycle |
|---|---|---|
| `load-tender.html` | One-page load offer a dispatcher can accept or decline in ten seconds | First contact — sent the moment a load needs coverage, before anything is confirmed |
| `rate-confirmation.html` | Full broker→carrier rate confirmation: stops, appointment windows, rate breakdown, required docs, obligations, signatures | Sent the instant a carrier accepts the tender — this is the binding paperwork that locks the load |
| `carrier-packet.html` | 6-page onboarding packet: carrier profile, W-9 request, insurance requirements, agreement summary, NOA acknowledgment, safety attestation | Once, before a new carrier's first load — required before the first tender ever goes out |
| `pod-request.html` | Two-page POD request + escalation notice | After delivery — sent when paperwork hasn't come back, then escalated if it's still missing days later |
| `ar-aging-report.html` | Accounts-receivable aging by bucket (current/1-30/31-60/61-90/90+), CSS stacked bar, DSO, top-5 past-due callout | Ongoing — the weekly/monthly view into what customers owe and how overdue it is |
| `carrier-scorecard.html` | Quarterly carrier performance: on-time pickup/delivery, tender acceptance, claims ratio, letter grade, renew/probation/terminate call | End of quarter — the review that decides whether a carrier gets more freight, a warning, or gets cut |

**The figures are internally consistent.** Load `#RFP-58231` on the Rate Confirmation (Fresno → Columbus, $3,335 all-in) is the same load referenced on the Load Tender and the POD Request/Escalation. The consignee on that load, Midwest Grocery Distribution, is also the top "Current" customer on the AR Aging Report — so if you're demoing the pack end-to-end, the numbers hold together across all three documents.

## Ships pre-filled — find and replace the sample content

These documents ship with **realistic sample content already filled in** (not raw `{{TOKENS}}`) so they look like finished, real paperwork the moment you open them — this is what buyers see in the storefront preview. A handful of placeholders are intentionally left as `{{TOKENS}}` inside the `<title>` tag or HTML comments only, never in the visible page body, so they're safe to leave until you're customizing for real use.

To make it yours, find-and-replace these exact literal strings everywhere they appear:

| Find this sample string | Replace with |
|---|---|
| `Ridgeline Freight Partners` | Your brokerage name |
| `4400 Newport Ave, Suite 220, San Jose, CA 95118` | Your address |
| `dispatch@ridgelinefreight.com` / `ap@ridgelinefreight.com` / `insurance@ridgelinefreight.com` | Your email addresses |
| `(408) 555-0173` | Your phone |
| `MC-702841` / `DOT-3388120` | Your real, verified MC/DOT numbers (never fabricate these) |
| `Elena Marsh` | Your dispatcher/signatory name |
| `Copper State Carriers, LLC` | Your carrier's company name |
| `MC-887210` / `DOT-2203871` | Your carrier's real MC/DOT numbers |
| `Renata Ford` / `Marcus Webb` | Your carrier's dispatcher / driver names |
| `RFP-58231` | Your own load number |
| `Valley Fresh Produce Co.` / `Midwest Grocery Distribution` | Your real shipper/consignee names |
| Dates (e.g. `Jul 28, 2026`) | Your real dates |
| Dollar amounts, weights, temps, mileage | Your real load figures |
| Bank/account details (`••••7215`, `••••0091`, EIN `••-•••4471`) | Your carrier's real banking details — never post real account numbers on a public preview |

## How to edit

Every file is a **single self-contained HTML file** — no build step, no dependencies, works offline by double-clicking. Open it in any browser, then:

1. Open the file in a code/text editor (VS Code, Sublime, even TextEdit in plain-text mode).
2. Look for `<!-- ===== EDIT BELOW ===== -->` comments near the top of each section — that's where the editable letterhead, party, and field data live.
3. Use find-and-replace on the sample strings in the table above.
4. Save, then reopen in a browser to check the result. Repeat until it looks right.
5. In `carrier-packet.html`, six pages share one letterhead pattern — search for `Ridgeline Freight Partners` and `Copper State Carriers` to catch every instance across all six pages at once.

No coding knowledge required beyond find-and-replace.

## Exporting to PDF

1. Open the `.html` file in Chrome or Safari.
2. Press **Cmd+P** (Mac) or **Ctrl+P** (Windows).
3. Set Destination to **Save as PDF**.
4. Confirm paper size is **Letter**, margins **Default/None** — the templates size themselves to the page automatically.
5. Save. The PDF will match the on-screen layout exactly, including the gold accent colors (requires "Background graphics" checked in the print dialog — on by default in Chrome/Safari).
6. `carrier-packet.html` and `pod-request.html` are multi-page — confirm the page count in the print preview matches what's expected (6 pages and 2 pages respectively) before saving.

## Full token list (for reference — documents ship pre-filled with sample values, not raw tokens)

### Broker (your business)
`{{COMPANY_NAME}}`

### Load / shipment
`{{LOAD_NUMBER}}` `{{CARRIER_NAME}}` `{{QUARTER}}` `{{REPORT_PERIOD}}`

## Design system

Paper-white background, gold (`#d4af37`) accents, Georgia serif headings, hairline gold rules, gold-gradient text on the single most important line per page. Matches the rest of the Midnight Gold suite — see `../DESIGN-SPEC.md` for the full token/type/detail rules if you're customizing further.
