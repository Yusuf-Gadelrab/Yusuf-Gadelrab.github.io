#!/usr/bin/env python3
"""verify_checkout.py — audit every CHECKOUT map in the site's public/ HTML files.

WHY: 2026-07-29, every value in these maps once held a guessed Lemon Squeezy URL.
Every one of them 404'd, so every buy button on the live site silently sent real
buyers to a dead page. commerce.js only "lights up" a button when its CHECKOUT
value matches ^https?:// (see public/js/commerce.js:199) — it never checks that
the URL actually resolves. This script is the missing check: for every non-empty
value, curl -sI it and assert HTTP 200 before it's safe to deploy.

Usage:
    python3 tools/verify_checkout.py            # human-readable PASS/FAIL table
    python3 tools/verify_checkout.py --json      # machine-readable
    python3 tools/verify_checkout.py --exit-code # nonzero exit if any FAIL (for CI/hooks)

Exit codes:
    0 — no non-200 URLs found (includes the all-empty case; nothing to fail)
    1 — at least one non-empty CHECKOUT URL did not return 200
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
PUBLIC_DIR = REPO_ROOT / "public"

# File -> relative path under public/. Add new pages here if a new CHECKOUT map ships.
TARGET_FILES = [
    "store.html",
    "templates.html",
    "kxngsef.html",
    "dira.html",
    "resume.html",
    "sprint.html",
]

# Matches:  const CHECKOUT = { ... };   (non-greedy, first closing brace-semicolon)
CHECKOUT_BLOCK_RE = re.compile(r"const\s+CHECKOUT\s*=\s*\{(.*?)\n\s*\}\s*;", re.DOTALL)

# Matches a single entry: 'key': 'value'  or  "key": "value"  or  key: 'value'
ENTRY_RE = re.compile(
    r"""['"]?([A-Za-z0-9_\-]+)['"]?\s*:\s*['"]([^'"]*)['"]"""
)


def find_checkout_block(text: str) -> tuple[str, int] | None:
    """Return (block_text, line_number_of_const_declaration) or None."""
    m = CHECKOUT_BLOCK_RE.search(text)
    if not m:
        return None
    line_no = text.count("\n", 0, m.start()) + 1
    return m.group(1), line_no


def parse_entries(block: str) -> list[tuple[str, str]]:
    entries = []
    for line in block.splitlines():
        stripped = line.strip()
        if stripped.startswith("//") or stripped.startswith("/*") or not stripped:
            continue
        m = ENTRY_RE.search(line)
        if m:
            entries.append((m.group(1), m.group(2)))
    return entries


def curl_status(url: str, timeout: int = 10) -> str:
    """Return 'HTTP/x NNN' style status line, or an error marker."""
    try:
        result = subprocess.run(
            ["curl", "-sI", "--max-time", str(timeout), url],
            capture_output=True,
            text=True,
            timeout=timeout + 2,
        )
    except subprocess.TimeoutExpired:
        return "TIMEOUT"
    except FileNotFoundError:
        return "ERROR: curl not found"

    if result.returncode != 0:
        return f"ERROR: curl exit {result.returncode}"

    first_line = result.stdout.splitlines()[0].strip() if result.stdout else ""
    m = re.search(r"\b(\d{3})\b", first_line)
    if not m:
        return f"ERROR: no status in response ({first_line or 'empty'})"
    return m.group(1)


def audit() -> list[dict]:
    rows = []
    for fname in TARGET_FILES:
        fpath = PUBLIC_DIR / fname
        if not fpath.exists():
            rows.append({
                "file": fname, "line": None, "key": None, "url": None,
                "state": "MISSING_FILE", "status": None, "ok": False,
            })
            continue

        text = fpath.read_text(encoding="utf-8")
        found = find_checkout_block(text)
        if not found:
            rows.append({
                "file": fname, "line": None, "key": None, "url": None,
                "state": "NO_CHECKOUT_MAP", "status": None, "ok": False,
            })
            continue

        block, line_no = found
        entries = parse_entries(block)
        if not entries:
            rows.append({
                "file": fname, "line": line_no, "key": None, "url": None,
                "state": "EMPTY_MAP", "status": None, "ok": False,
            })
            continue

        for key, url in entries:
            if not url:
                rows.append({
                    "file": fname, "line": line_no, "key": key, "url": "",
                    "state": "EMPTY", "status": None, "ok": True,
                })
                continue
            if not re.match(r"^https?://", url):
                rows.append({
                    "file": fname, "line": line_no, "key": key, "url": url,
                    "state": "INVALID_SCHEME", "status": None, "ok": False,
                })
                continue

            status = curl_status(url)
            ok = status == "200"
            rows.append({
                "file": fname, "line": line_no, "key": key, "url": url,
                "state": "WIRED", "status": status, "ok": ok,
            })
    return rows


def print_table(rows: list[dict]) -> None:
    wired = [r for r in rows if r["state"] == "WIRED"]
    empty = [r for r in rows if r["state"] == "EMPTY"]
    problems = [r for r in rows if r["state"] not in ("WIRED", "EMPTY")]
    failed_wired = [r for r in wired if not r["ok"]]

    col_file = max([len("FILE")] + [len(r["file"]) for r in rows]) + 2
    col_key = max([len("KEY")] + [len(r["key"] or "-") for r in rows]) + 2

    print(f"{'FILE':<{col_file}}{'KEY':<{col_key}}{'STATE':<16}{'HTTP':<8}RESULT")
    print("-" * (col_file + col_key + 16 + 8 + 8))
    for r in rows:
        key = r["key"] or "-"
        status = r["status"] or "-"
        if r["state"] == "EMPTY":
            result = "PASS (inert, no URL to check)"
        elif r["state"] == "WIRED":
            result = "PASS" if r["ok"] else "FAIL"
        else:
            result = "FAIL"
        print(f"{r['file']:<{col_file}}{key:<{col_key}}{r['state']:<16}{status:<8}{result}")

    print()
    print(f"Slots total:     {len(rows)}")
    print(f"Empty (inert):   {len(empty)}")
    print(f"Wired:           {len(wired)}  ({len(wired) - len(failed_wired)} pass / {len(failed_wired)} fail)")
    if problems:
        print(f"Structural problems (missing file/map): {len(problems)}")

    if failed_wired:
        print()
        print("FAILING WIRED URLS — do not deploy until fixed:")
        for r in failed_wired:
            print(f"  {r['file']}:{r['line']}  {r['key']} -> {r['url']}  [{r['status']}]")

    if problems:
        print()
        print("STRUCTURAL ISSUES:")
        for r in problems:
            print(f"  {r['file']}: {r['state']}")


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--json", action="store_true", help="print machine-readable JSON instead of a table")
    ap.add_argument("--exit-code", action="store_true", help="exit 1 if any wired URL fails or a structural problem exists")
    args = ap.parse_args()

    rows = audit()

    if args.json:
        print(json.dumps(rows, indent=2))
    else:
        print_table(rows)

    if args.exit_code:
        bad = [r for r in rows if not r["ok"]]
        return 1 if bad else 0
    return 0


if __name__ == "__main__":
    sys.exit(main())
