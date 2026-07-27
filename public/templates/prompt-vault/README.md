# AI Prompt Vault for Founders & Freelancers

150 copy-paste prompts for running a small business with an LLM (Claude, ChatGPT, Gemini, or any capable model) — sales, marketing, product, ops, finance, hiring, support, research, writing, and personal productivity.

## How to use it

1. Open `prompt-vault.html` in any browser (double-click it — no install, no internet needed).
2. Use the search box or the category nav at the top to find what you need.
3. Click **Copy prompt** on any card — it copies the full prompt to your clipboard with an inline "Copied" confirmation.
4. Paste into your LLM of choice, fill in the bracketed fields (see below), and send.

## How to adapt the prompts

Every prompt uses **square-bracket merge fields** like `[your product]`, `[client name]`, or `[paste your draft]`. These are intentional placeholders for *you* to fill in with your own details — replace the whole bracketed phrase before sending the prompt. That's the only editing required; the surrounding structure (role, task, constraints, output format) is what makes these prompts hold up better than generic ones, so keep it intact.

Each entry also has:
- **Use when** — the specific situation this prompt is built for (skip it if that's not your situation).
- **Make it better** — the one piece of context that most improves the output. Almost always: more specific input in, more specific output out.

## The honest limitations

- These prompts make AI output *better*, not *correct by default*. Always verify facts, numbers, and claims before anything goes external — see the "How to verify AI output" section on the page.
- The "When not to use AI" section on the page is not boilerplate — read it. Legal, medical, tax, and immigration questions need a licensed professional, not a prompt.
- No prompt here replaces judgment on decisions involving real accountability (hiring/firing, contracts, compliance). AI can help you think; it shouldn't make the call.
- Model behavior drifts over time. If an output style stops matching what's described here, tighten the constraints section of the prompt rather than assuming the prompt is broken.

## Technical notes

- Single self-contained HTML file — no external requests, fonts, or CDN dependencies. Works fully offline.
- Click-to-copy uses `navigator.clipboard` with an automatic fallback (hidden textarea + `execCommand`) for browsers or contexts where the clipboard API isn't available — no popup alerts, just an inline "Copied" state on the button.
- Search box filters all 150 prompts live by title, prompt text, and use-case as you type.
- Respects `prefers-reduced-motion`, keyboard accessible, AA contrast dark theme.

---
Yusuf Gadelrab · Automation Studio · San Jose, CA · yusuf.gadelrab06@gmail.com
