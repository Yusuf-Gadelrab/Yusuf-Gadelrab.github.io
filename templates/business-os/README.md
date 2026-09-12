# Freelance Business OS — Midnight Gold

A single self-contained HTML file that is a real working app — not a Notion template, not a link to a hosted board. Double-click `business-os.html`, it opens in your browser, and it just works. No account, no login, no subscription, no Notion workspace to set up. You own the file.

## What it is

Seven panels covering the day-to-day of running a freelance/consulting business:

| Tab | What it does |
|---|---|
| **Dashboard** | KPI tiles (active clients, weighted pipeline, outstanding invoices, revenue this month/YTD), a 12-month revenue bar chart, and a "Needs Attention" list of overdue invoices and stale leads |
| **Clients / CRM** | Add, edit, delete client records — name, contact, status, value, next action, notes. Filter by status, sort any column by clicking its header |
| **Pipeline** | Kanban board: Lead → Proposal → Negotiation → Won, plus a Lost column. Click "Advance →" to move a deal to the next stage, or "Mark Lost"/"Reopen." The weighted pipeline total applies a probability weight per stage (Lead 10%, Proposal 40%, Negotiation 70%, Won 100%) |
| **Projects** | Project rows linked to a client, with a deadline (auto-flags "LATE" once past due and not complete) and a draggable percent-complete meter |
| **Invoices** | Invoice log — number, client, amount, issued, due, status. Overdue is computed automatically from the due date, not something you have to set by hand. "Mark Paid" one-click. Totals row shows total billed / paid / outstanding |
| **Time Log** | Date, client, hours, rate, billable toggle. Computes total unbilled value (billable hours × rate) so you always know what to invoice next |
| **Goals** | Monthly revenue target with an SVG progress ring driven by this month's paid invoices, plus a weekly habit checklist you can add to and check off |

## How storage works

Everything lives in your browser's `localStorage`, under one namespaced key (`midnightGold_businessOS_v1`). There's no server, no sync, no tracking — the data never leaves your machine. That also means:

- It's tied to **this browser, this device**. Opening the file in a different browser or a different computer starts fresh (or shows the demo data) until you import a backup.
- Clearing your browser's site data / cache for this file will erase it. **Export a backup regularly** (see below) — treat it like any other local file you care about.
- The app ships with a **schema version** baked into the saved data, so future updates to this file can safely upgrade older saved data without corrupting it.

## Backing up and moving your data

Top-right of the app:

- **Export JSON** — downloads your entire dataset (clients, pipeline, projects, invoices, time log, goals) as a timestamped `.json` file. This is your full backup and also how you move data to another browser or computer — open the app there and use Import.
- **Import JSON** — loads a previously exported `.json` file and replaces the current data with it.
- **Export Invoices CSV** — downloads just the invoice log as a `.csv` for your accountant, spreadsheet, or tax software.

## Demo data / starting clean

The file ships pre-loaded with a believable demo dataset (six fictional clients, a pipeline, projects, a year of invoices, time entries) so it looks alive the moment you open it and you can see every feature working with real-looking numbers.

When you're ready to use it for real: click **Reset to Empty** (top right). It asks for an inline confirmation (click "Confirm") before it wipes anything — there's no browser popup to click through by accident. After reset, every panel starts empty and ready for your real clients.

## Editing / customizing

Everything editable is inside `<style>` at the top of the file if you want to retheme it, and the demo dataset is a plain JavaScript array near the top of the `<script>` block (`demoState()`) if you want to change what ships as the starting sample. No build step — edit the file in any text editor, save, reload the browser tab.

## Accessibility

Every interactive control is keyboard-reachable and has a visible focus ring. Respects `prefers-reduced-motion` (transitions are skipped for users who've asked for reduced motion at the OS level). Text and UI colors meet AA contrast against the dark background.

## Privacy note

This app makes no network requests. There is no backend, no analytics, no telemetry, nothing phoning home. All of your client names, deal values, invoice amounts, and notes stay in `localStorage` on the device where you opened the file — the only way that data ever leaves your machine is if you click Export and send the file yourself.
