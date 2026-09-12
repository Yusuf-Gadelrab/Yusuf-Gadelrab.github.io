# Freelance Business Paperwork Pack — Midnight Gold

> **⚠️ DISCLAIMER — READ FIRST**
> These are **templates, not legal advice**. `retainer-agreement.html` and `late-payment-letters.html` in particular contain contract and collections language that is regulated differently by state, province, and country. **Have a licensed attorney review and adapt every document to your own jurisdiction and specific engagement before you send it to a client or rely on it in a dispute.** Yusuf Gadelrab / Automation Studio is not a law firm and this pack is sold as-is with no warranty of legal sufficiency.

Five matching documents, one visual system ("Halloway Studio" billing "Cascade Freight Brokers" in the sample content — replace with your own).

| File | What it is |
|---|---|
| `invoice.html` | Full invoice with a self-computing line-item table (edit Qty/Rate/Discount/Tax and totals update live), gold-boxed total, payment instructions, late-fee terms |
| `receipt.html` | Half-page matching PAID receipt with a CSS-drawn gold stamp |
| `retainer-agreement.html` | 4-page monthly retainer contract — scope, hours cap, fees, overage rate, term, termination, IP, confidentiality, liability, governing law, signatures |
| `estimate-quote.html` | Tiered quote (3 pricing options) with an expiry date banner |
| `late-payment-letters.html` | Three escalating collection letters (day 7 / day 14 / day 30), one per printed page, same letterhead |

## Ships pre-filled — find and replace the sample content

These documents ship with realistic **sample content already filled in** (not raw `{{TOKENS}}`) so they look like finished, real paperwork the moment you open them — this is what buyers see in the storefront preview, and it's the fastest way to see the visual system with actual numbers instead of placeholder holes.

The sample story used across all five files: **Halloway Studio** (a design studio, the service provider) billing **Cascade Freight Brokers** (the client). To make it yours, find-and-replace these exact literal strings everywhere they appear:

| Find this sample string | Replace with |
|---|---|
| `Halloway Studio` | Your company name |
| `Brand & Web Design Studio` | Your tagline |
| `214 Ashcombe Lane, Suite 3B` / `Portland, OR 97205` | Your address |
| `hello@hallowaystudio.com` | Your email |
| `(503) 555-0148` | Your phone |
| `payments@hallowaystudio.com` | Your Zelle email |
| `Cascadia Community Bank` | Your bank |
| `••••8834` / `••••4021` | Your masked account/routing (never post real numbers on a public preview) |
| `pay.hallowaystudio.com/inv-1042` | Your payment link |
| `Elena Halloway` / `Founder & Creative Director` | Your signatory name/title |
| `Cascade Freight Brokers` | Your client's company name |
| `Grant Delgado` / `Operations Director` | Your client's contact name/title |
| `880 Harborview Road, Suite 210` / `Tacoma, WA 98402` | Your client's address |
| `INV-1042`, `INV-1039`, `REC-1042`, `RA-0219`, `EST-0087` | Your own document numbers |
| Dates (e.g. `July 14, 2026`, `May 15, 2026`) | Your real dates |
| Dollar amounts and line items | Your real project scope and pricing |

A handful of placeholders are intentionally left as `{{TOKENS}}` — those live in the `<head>` (page `<title>`) or inside HTML comments, never in the visible page body, so they're safe to leave until you're customizing for real use.

## How to edit

Every file is a **single self-contained HTML file** — no build step, no dependencies, works offline by double-clicking. Open it in any browser, then:

1. Open the file in a code/text editor (VS Code, Sublime, even TextEdit in plain-text mode).
2. Find the `<!-- ===== EDIT BELOW ===== -->` comment near the top of the body — that's where the editable letterhead/parties/meta fields live.
3. Use find-and-replace on the sample strings in the table above (or any remaining `{{TOKEN_LIKE_THIS}}` placeholders — full token list below for reference).
4. Save, then reopen in a browser to check the result. Repeat until it looks right.
5. In `invoice.html`, edit the line-item rows directly in the table (description text, and the Qty/Rate number inputs) — the Subtotal/Discount/Tax/Total boxes recalculate automatically as you type, no formulas to touch.

No coding knowledge required beyond find-and-replace.

## Exporting to PDF

1. Open the `.html` file in Chrome or Safari.
2. Press **Cmd+P** (Mac) or **Ctrl+P** (Windows).
3. Set Destination to **Save as PDF**.
4. Confirm paper size is **Letter**, margins **Default/None** — the templates size themselves to the page automatically.
5. Save. The PDF will match the on-screen layout exactly, including the gold accent colors (this requires "Background graphics" to be checked in the print dialog — it's on by default in Chrome/Safari).

## Full token list (for reference — documents ship pre-filled with sample values, not raw tokens)

### Company (your business)
`{{COMPANY_NAME}}` `{{COMPANY_TAGLINE}}` `{{COMPANY_ADDRESS}}` `{{COMPANY_ADDRESS_LINE1}}` `{{COMPANY_ADDRESS_LINE2}}` `{{COMPANY_EMAIL}}` `{{COMPANY_PHONE}}`

### Client
`{{CLIENT_NAME}}` `{{CLIENT_CONTACT}}` `{{CLIENT_CONTACT_FIRST}}` `{{CLIENT_TITLE}}` `{{CLIENT_ADDRESS_LINE1}}` `{{CLIENT_ADDRESS_LINE2}}`

### Invoice
`{{INVOICE_NUMBER}}` `{{ISSUE_DATE}}` `{{DUE_DATE}}` `{{PAYMENT_TERMS}}` `{{PROJECT_NAME}}` `{{NET_TERMS_DAYS}}` `{{LATE_FEE_GRACE_DAYS}}` `{{LATE_FEE_PERCENT}}`

### Payment details
`{{ZELLE_EMAIL}}` `{{BANK_NAME}}` `{{BANK_ACCOUNT_LAST4}}` `{{BANK_ROUTING}}` `{{PAYMENT_LINK}}`

### Receipt
`{{RECEIPT_NUMBER}}` `{{PAID_DATE}}` `{{PAYMENT_METHOD}}` `{{PAYMENT_REFERENCE}}`

### Retainer agreement
`{{AGREEMENT_NUMBER}}` `{{EFFECTIVE_DATE}}` `{{RENEWAL_NOTICE_DAYS}}` `{{MONTHLY_HOURS_CAP}}` `{{MONTHLY_DELIVERABLES_CAP}}` `{{OVERAGE_HOURLY_RATE}}` `{{MONTHLY_RETAINER_FEE}}` `{{BILLING_DATE}}` `{{RETAINER_NET_DAYS}}` `{{TERMINATION_NOTICE_DAYS}}` `{{CONFIDENTIALITY_SURVIVAL_YEARS}}` `{{GOVERNING_STATE}}` `{{GOVERNING_COUNTY}}` `{{PROVIDER_SIGNATORY_NAME}}` `{{PROVIDER_SIGNATORY_TITLE}}` `{{CLIENT_SIGNATORY_NAME}}` `{{CLIENT_SIGNATORY_TITLE}}` `{{SIGNATURE_DATE}}`

### Estimate
`{{ESTIMATE_NUMBER}}` `{{PROJECT_SUMMARY}}` `{{EXPIRY_DATE}}`

### Late payment letters
`{{OVERDUE_INVOICE_NUMBER}}` `{{OVERDUE_DUE_DATE}}` `{{OVERDUE_AMOUNT}}` `{{OVERDUE_AMOUNT_WITH_FEE}}` `{{OVERDUE_AMOUNT_FINAL}}` `{{LETTER1_DATE}}` `{{LETTER2_DATE}}` `{{LETTER3_DATE}}` `{{FINAL_NOTICE_DEADLINE_DAYS}}`

## Design system

Paper-white background, gold (`#d4af37`) accents, Georgia serif headings, hairline gold rules, gold-gradient text on the single most important line per page. Matches the rest of the Midnight Gold suite — see `../DESIGN-SPEC.md` for the full token/type/detail rules if you're customizing further.
