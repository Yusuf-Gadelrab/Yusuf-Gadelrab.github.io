# Cold Email Swipe File — Midnight Gold

One file: `swipe-file.html`. A single self-contained HTML reference document — 50 ready-to-send cold email templates, a subject line bank, a personalization guide, a cadence table, and deliverability rules. No software, no dependencies, works offline by double-clicking.

## What's inside

| Section | What it covers |
|---|---|
| Anatomy of a cold email | One annotated teardown — subject, opener, proof, ask, signature, labeled with connector lines |
| 50 templates, 8 scenarios | First-touch cold (10), referral/warm intro (6), follow-up 1/2/3 (9), breakup (6), re-engagement of a dead lead (6), inbound-reply handling (6), pricing objection (4), post-meeting recap (3) |
| Subject line bank | 40 lines grouped by mechanism — curiosity, specificity, mutual connection, direct value, question |
| Personalization tokens | What to research and exactly where to find it, plus good-vs-lazy examples side by side |
| Cadence table | Day-by-day sequence — channel and intent per touch, Day 0 through Day 90 |
| Deliverability rules | Sending caps, jitter, inbox warmup, opt-out handling, CAN-SPAM footer requirements |
| Spam do/don't table | The patterns that get an inbox flagged, independent of content |

## Where this came from

The structure — the opener mechanics, the Day 4 / Day 9 follow-up cadence, the QC gate that decides what's good enough to send, the sending caps and jitter — is pulled from a real outreach system that drafts and sends cold email every week. **Every company name, contact name, and email address in this file is fictional**, invented for illustration. No real lead, company, or message from that system appears anywhere in this product.

## How to use each template

1. Every template has a **when to use** line — check it fits where this specific contact actually is (first touch vs. third follow-up vs. gone cold two months ago). The wrong stage reads as tone-deaf even with perfect copy.
2. Fill in the styled `[bracket]` chips with your own real details. These are the only things you should change — the surrounding sentence structure is doing the work.
3. Read the **why it works** note under each template if you want to adapt the wording further without breaking the mechanism.

## Merge-field chips (what they mean)

`[first name]` `[company]` `[title]` `[specific pain]` `[their mantra/tagline]` `[product one-liner]` `[proof point]` `[price point]` `[cta]` `[sender name]` `[phone]` `[email]` `[city, state]` — these are shown as styled inline chips in the rendered page, not raw `{{TOKENS}}`, so the document reads as finished copy rather than a fill-in-the-blank form. Replace each with your own real detail before sending.

## Exporting / printing

Open `swipe-file.html` in Chrome or Safari, press **Cmd+P** (Mac) or **Ctrl+P** (Windows), set Destination to **Save as PDF**. The document is screen-first (scrolls as one long page with jump links) but the print stylesheet reflows it to a clean, paginated black-on-white document — confirm "Background graphics" is checked in the print dialog if you want the gold accent color to carry over.

## Cross-sell: pairs with the Cold Outreach Engine

This swipe file is the **content layer**. If you're sending more than a handful of emails a week, pair it with the **Cold Outreach Engine** (sold separately by the same author) — the automation layer that turns a lead list into personalized drafts, enforces the Day 4 / Day 9 cadence automatically, runs a QC gate before anything sends (checks for real personalization evidence, blocks placeholder/template-dupe drafts, verifies the recipient matches your lead list), and caps + jitters sends to stay inbox-safe. Load these 50 templates in as your starting library, then let the engine handle personalization, scheduling, and the safety rails at scale. See the Cold Outreach Engine product listing for setup.

## Design system

Dark background, gold (`#d4af37`) accents, Georgia serif headings, hairline gold rules, gold-gradient text on the single most important line per section. Matches the rest of the Midnight Gold suite — see `../DESIGN-SPEC.md` for the full token/type/detail rules if you're customizing further.
