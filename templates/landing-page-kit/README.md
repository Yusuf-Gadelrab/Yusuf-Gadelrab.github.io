# Midnight Gold — Landing Page Kit

Four premium black & gold landing pages. Each is a single self-contained
`.html` file — no CDN, no webfonts, no external images, no JS framework.
Double-click to open, or drop straight into GitHub Pages / Netlify.

## Which page for which use case

| File | Use case |
|---|---|
| `saas-launch.html` | B2B SaaS product page — sticky nav, feature grid, 3-tier pricing table, FAQ accordion, testimonials. Use for software, tools, or subscription products with a self-serve signup flow. |
| `agency-services.html` | Consultancy / agency / freelance services — credibility strip, services grid, process timeline, case studies with metrics, team row, and a working-looking contact form. Use to book calls or capture leads for service-based businesses. |
| `personal-brand.html` | Creator / consultant / personal site — portrait hero, stat tiles, "what I do" pillars, media mentions, newsletter signup, link-in-bio style button stack. Use as a link-in-bio hub, personal homepage, or coaching page. |
| `product-waitlist.html` | Pre-launch product — full-viewport hero, email capture with inline validation, social-proof counter, benefit cards, roadmap, FAQ. Use to build a launch waitlist before you ship. |

## Ships pre-filled with sample content

All four pages render as finished, believable sites out of the box — no visible `{{TOKEN}}` placeholders in the body text — using a fictional business per page. Find-and-replace these exact sample strings with your own:

**`saas-launch.html`** — fictional B2B finance-ops SaaS, "Ledgerline"
- Product name: `Ledgerline` (nav brand, hero copy, testimonials heading, FAQ answer, footer)
- Copyright year: `2026`
- Pricing, feature copy, customer logos (Northwind, Cascade, Amberlane, Fieldstone, Harlow & Co), and testimonials (Maya Reyes, Daniel Kwon, Sarah Liu) were already believable sample content and are unchanged.

**`agency-services.html`** — fictional automation/ops consultancy, "Ironvale Ops"
- Agency name: `Ironvale Ops` (nav brand, hero lede, footer)
- Copyright year: `2026`
- Credibility stats, service cards, process timeline, case studies (Northwind Freight, Cascade Supply, Amberlane), and team names were already believable sample content and are unchanged.

**`personal-brand.html`** — fictional ops consultant, "Renata Voss"
- Full name: `Renata Voss` (portrait initials, eyebrow role, `<h1>`, footer)
- Initials: `RV` (portrait circle)
- Role line: `Ops Consultant & Systems Builder`
- Copyright year: `2026`

**`product-waitlist.html`** — fictional pre-launch expense-tracking product, "Outlay"
- Product name: `Outlay` (hero eyebrow lede, roadmap, FAQ, footer)
- Launch date: `March 2026` (hero eyebrow, roadmap milestone, FAQ answer)
- Copyright year: `2026`
- Waitlist counter stays baked into the static HTML as `2,847` (crawler-visible, not animated from zero) — do not change this to a live/animated value.

## Tokens that deliberately remain

These never render as visible on-page text — they only ever appear inside `href`/`action`/`src` attributes, HTML comments, or `<head>` meta tags — so they stay as literal `{{TOKEN}}` placeholders. A buyer must supply their own real values (form endpoints, domains, contact info):

**Shared across all four files**
- `{{SITE_URL}}` — canonical URL of the deployed page (footer link `href`, `<head>` meta)
- `{{META_DESCRIPTION}}` — SEO description (`<head>` meta only)
- `{{OG_IMAGE_URL}}` — social preview image, 1200×630 (`<head>` meta only)
- `{{PRIVACY_URL}}`, `{{TERMS_URL}}`, `{{CONTACT_EMAIL}}` — footer legal/contact link targets

**`saas-launch.html`**
- `{{PRODUCT_TAGLINE}}` — `<head>` title/meta only
- `{{LOGIN_URL}}`, `{{SIGNUP_URL}}`, `{{DEMO_URL}}` — button `href` targets

**`agency-services.html`**
- `{{AGENCY_TAGLINE}}` — `<head>` title/meta only
- `{{FORM_ACTION}}` — where the booking form POSTs (Formspree, Netlify Forms, your own endpoint)
- `{{PHOTO_URL}}` — HTML comments mark each case-study photo slot; swap the placeholder `<div class="case-photo">` for a real `<img>` if you have photos

**`personal-brand.html`**
- `{{PERSONAL_TAGLINE}}` — `<head>` title/meta only
- `{{NEWSLETTER_URL}}`, `{{BOOKING_URL}}`, `{{LINKEDIN_URL}}`, `{{PORTFOLIO_URL}}` — link-stack `href` targets
- `{{FORM_ACTION}}` — newsletter signup form target
- `{{PHOTO_URL}}` — comment above `.portrait` marks where to swap in a real `<img>`

**`product-waitlist.html`**
- `{{WAITLIST_TAGLINE}}` — `<head>` title/meta only
- `{{FORM_ACTION}}` — email capture form target

## Deploy free

**GitHub Pages**
1. Create a public repo (or use an existing `username.github.io` repo).
2. Drop the `.html` file in, rename to `index.html` if it should be the root page.
3. Settings → Pages → Deploy from branch → `main` / `root`.
4. Live at `https://username.github.io/repo-name/`.

**Netlify**
1. Drag the folder containing your `.html` file onto [app.netlify.com/drop](https://app.netlify.com/drop).
2. Netlify assigns a free `*.netlify.app` URL instantly — no build step needed since these are static files.
3. Optional: connect a custom domain in Site settings → Domain management.

Both forms (`{{FORM_ACTION}}`) need a real endpoint to actually receive
submissions — Netlify Forms (add `data-netlify="true"` to the `<form>` tag
if hosting on Netlify) or a free tier of Formspree/Getform both work without
a backend.

## Swap the gold accent to another color

Every color in every file is driven by CSS custom properties at the top of
the `<style>` block, in `:root`. To recolor the whole page, change exactly
one variable:

```css
:root{
  --gold:#d4af37;    /* ← change this single line */
  --gold-2:#f4d47a;  /* lighter highlight — keep it ~2 shades lighter than --gold */
  --gold-dim:#8a7328; /* darker/muted variant — keep it ~2 shades darker than --gold */
  --glow:rgba(212,175,55,.35); /* update the RGB to match your new --gold */
}
```

Fastest path: pick your new hue for `--gold`, then generate a lighter tint
(`--gold-2`) and a darker shade (`--gold-dim`) of the same hue, and update
the RGB values inside `--glow` and `--line` to match. All gradients,
buttons, icon strokes, and the gradient headline text reference these four
variables — nothing else needs to change.

## Accessibility notes

- All animations (scroll-cue bob) respect `prefers-reduced-motion: reduce`.
- The social-proof counter on `product-waitlist.html` renders its final
  number directly in the HTML (`2,847`) — it is not animated from zero via
  JS, so crawlers and social-preview bots see the real value.
- FAQ accordions use native `<details>/<summary>` — no JS required, fully
  keyboard operable.
- All icon-only controls carry `aria-hidden` or `aria-label`; interactive
  elements have visible `:focus-visible` outlines.
