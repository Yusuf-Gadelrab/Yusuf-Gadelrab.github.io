"""HowTo registry for guide pages.

Only guides that contain a genuine, visible, ordered procedure appear here.
Marking a non-procedure page as HowTo is a manual-action risk, so the rule is
strict: the entry names an existing `("ol", [...])` block in that guide's own
body spec, and engine.render() builds the HowToStep list *from that list's
actual <li> text*. The markup therefore cannot drift away from what a reader
sees on the page — if the content module changes the steps, the schema changes
with it.

Format:  slug -> (ol_index, howto_name, total_time_or_None)

`ol_index` counts only ("ol", ...) blocks within that guide's body, in order.
`total_time` is an ISO-8601 duration and is only set where the page itself
states a time (e.g. "in ten minutes", "in two minutes"); never invented.

This file is intentionally separate from the content_*.py modules so the two
can be edited independently.
"""

HOWTO = {
    # --- trading & risk -----------------------------------------------------
    "position-sizing-per-trade": (
        0, "How to size a position for a single trade", None),
    "trading-journal": (
        0, "How to run a weekly trading-journal review", None),
    "paper-to-live-trading": (
        1, "How to promote a trading strategy from paper trading to real money", None),
    "backtest-overfitting": (
        2, "How to run an honest backtest robustness protocol", None),
    "reading-a-backtest-report": (
        1, "How to read a backtest report in the right order", None),
    "anchored-vwap": (
        0, "How to use anchored VWAP without fooling yourself", None),
    "vcp-base-patterns": (
        0, "How to trade a VCP base without over-trusting the pattern", None),

    # --- AI & engineering ---------------------------------------------------
    "moe-model-macbook": (
        0, "How to run a mixture-of-experts model locally on a MacBook", None),
    "rag-explained": (
        1, "How to build a first RAG pipeline", None),
    "ai-automation-small-business": (
        0, "How to sequence an AI automation build for a small business", None),
    "static-site-ai-search": (
        0, "How to verify a static site is readable by AI search", "PT2M"),
    "ai-search-optimization": (
        1, "How to optimise a site for AI search engines", None),
    "offline-pwa": (
        0, "How to version a service worker cache without shipping a stale app", None),
    "client-side-only-tools": (
        0, "How to keep a client-side-only tool trustworthy", None),

    # --- career & students --------------------------------------------------
    "ats-resume": (
        0, "How to mirror a job description on your resume honestly", None),
    "portfolio-that-gets-interviews": (
        0, "How to write a project case study for a portfolio", None),
    "technical-portfolio-8-seconds": (
        2, "How to audit a technical portfolio", "PT10M"),
    "undergraduate-research": (
        0, "How to find an undergraduate research lab", None),
    "scholarships-international-students": (
        0, "How to build a scholarship application pipeline", None),
    "coding-interview-patterns": (
        0, "How to keep a coding-interview failure log by pattern", None),
    "quant-internship-timeline": (
        0, "How to build a quant internship application calendar", None),
    "reading-a-scientific-paper": (
        0, "How to read a scientific paper in the order that works", None),
    "f1-cpt-one-year-rule": (
        1, "How to get CPT work authorization", None),
    "verify-visa-sponsorship-internships": (
        1, "How to verify whether an internship sponsors visas", None),

    # --- business, freight & brand ------------------------------------------
    "student-founder-security-checklist": (
        0, "How to secure a student-founder project before your first user", None),
    "carrier-vetting-checklist": (
        1, "How to systematise carrier vetting so no step gets skipped", None),
    "detention-demurrage-accessorials": (
        2, "How to systematise detention and accessorial billing", None),
    "landing-page-that-converts": (
        2, "How to run a pre-publish check on a landing page", None),
    "clothing-brand-pod-margins": (
        1, "How to test demand for a clothing brand before spending money", None),

    # --- body ---------------------------------------------------------------
    # cut-calorie-math is deliberately NOT registered: the guide has no visible
    # ordered list, and HowTo markup with no procedure on the page is the exact
    # schema-without-visible-content violation this registry exists to avoid.
    "weight-tracking-signal-vs-noise": (
        1, "How to triage a weight-loss plateau", None),
}
