#!/usr/bin/env python3
"""Measure the numeric claims the site publishes, and fail when they drift.

Why this exists: build_llms.py already blocks *retired* claims (RETIRED_CLAIMS),
but nothing checks whether a *current* claim is still true. Test counts are the
worst offender because they change every time a test is added and they are
copy-pasted into meta descriptions, OG tags, JSON-LD and llms.txt, so one new
test silently falsifies ~20 published strings at once.

This script does the opposite of a blocklist: it runs the real suites, counts
the real files, and reports every published number that no longer matches.

    python3 tools/claims_drift.py            # report, exit 1 on drift
    python3 tools/claims_drift.py --json     # machine-readable

It never edits anything. Fixes are deliberate, because several of these numbers
appear inside JSON-LD that must stay valid.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"

# repo -> (path, venv python). Counted by running the suite, not by grepping for
# "def test_", because parametrize/fixtures make the source count wrong.
SUITES = {
    "dira": Path.home() / "Startups" / "dira",
    "trading-bot": Path.home() / "trading-bot",
}


def suite_count(repo: Path) -> int | None:
    """Number of tests pytest actually collects, or None if unrunnable here."""
    py = repo / ".venv" / "bin" / "python"
    if not py.exists() or not repo.exists():
        return None
    try:
        out = subprocess.run(
            [str(py), "-m", "pytest", "--collect-only", "-q"],
            cwd=repo, capture_output=True, text=True, timeout=300,
        ).stdout
    except (subprocess.TimeoutExpired, OSError):
        return None
    m = re.search(r"(\d+)\s+tests?\s+collected", out)
    return int(m.group(1)) if m else None


def dira_rule_counts() -> dict[str, int | None]:
    repo = SUITES["dira"]
    py = repo / ".venv" / "bin" / "python"
    if not py.exists():
        return {"secret": None, "config": None, "total": None}
    code = (
        "from dira import rules;"
        "import json;"
        "print(json.dumps({'secret':len(rules.SECRET_RULES),"
        "'config':len(rules.CONFIG_RULES)}))"
    )
    try:
        out = subprocess.run([str(py), "-c", code], cwd=repo,
                             capture_output=True, text=True, timeout=60).stdout
        d = json.loads(out.strip().splitlines()[-1])
    except Exception:
        return {"secret": None, "config": None, "total": None}
    d["total"] = d["secret"] + d["config"]
    return d


def dira_version() -> str | None:
    f = SUITES["dira"] / "dira" / "_version.py"
    if not f.exists():
        return None
    m = re.search(r'__version__\s*=\s*"([^"]+)"', f.read_text())
    return m.group(1) if m else None


def counted_pages() -> dict[str, int]:
    return {
        "guides": len(list((PUBLIC / "guides").glob("*.html"))),
        "writing": len(list((PUBLIC / "writing").glob("*.html"))),
        "html_total": len(list(PUBLIC.rglob("*.html"))),
    }


def published(pattern: str) -> list[tuple[str, int, str]]:
    """Every place in public/ and tools/ that publishes a matching string."""
    hits: list[tuple[str, int, str]] = []
    rx = re.compile(pattern)
    roots = [PUBLIC, ROOT / "tools"]
    for root in roots:
        for f in root.rglob("*"):
            if not f.is_file() or f.suffix not in {".html", ".txt", ".xml", ".py", ".md"}:
                continue
            if "node_modules" in f.parts or "__pycache__" in f.parts:
                continue
            try:
                text = f.read_text(errors="replace")
            except OSError:
                continue
            for i, line in enumerate(text.splitlines(), 1):
                if rx.search(line):
                    hits.append((str(f.relative_to(ROOT)), i, line.strip()[:160]))
    return hits


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()

    measured = {
        "dira_tests": suite_count(SUITES["dira"]),
        "trading_bot_tests": suite_count(SUITES["trading-bot"]),
        "dira_version": dira_version(),
        **{f"dira_rules_{k}": v for k, v in dira_rule_counts().items()},
        **counted_pages(),
    }

    # (label, measured key, regex that finds the PUBLISHED claim)
    # Regexes are deliberately anchored to the subject so that a *different*
    # project's test count on the same line is not reported as this one's drift.
    checks = [
        ("DIRA test count", "dira_tests",
         r"(?:DIRA|dira[- ]scan|zero[- ]dependency(?:\s+\w+){0,3}\s+security scanner)"
         r"[^\n]{0,200}?\b(\d+)\s*(?:passing\s+)?tests?\b"
         r"|\b(\d+)\s*(?:passing\s+)?tests?\b[^\n]{0,60}?zero[- ]depend"),
        ("trading-bot test count", "trading_bot_tests",
         r"(?:trading bot|trading[- ]bot\.html|execution engine)[^\n]{0,220}?"
         r"\b(\d+)\s*(?:passing\s+)?tests?\b"
         r"|\b(\d+)\s*tests?\.\s*No live capital"
         r"|pytest\s*·\s*(\d+)\s*tests?"),
        ("guide count", "guides",
         r"\b(\d+)\s+published guides\b|\bbrowse\s+(\d+)\s+guides\b"
         r"|\bstore,?\s*or\s+(\d+)\s+guides\b|\b(\d+)\s+published guides\b"),
    ]

    # Historical titles that legitimately name a past count, plus HwyHaul, whose
    # 77-test figure is private employer work that cannot be measured from here.
    EXEMPT = ("what-schema-markup-taught-me-writing-30-guides",
              "tools/writing/content_schema.py",
              "public/hwyhaul.html")

    report = {"measured": measured, "drift": []}

    for label, key, rx in checks:
        truth = measured.get(key)
        if truth is None:
            report["drift"].append({"claim": label, "status": "UNMEASURABLE",
                                    "detail": "suite or venv not available here"})
            continue
        bad = []
        for path, line_no, line in published(rx):
            if any(e in path for e in EXEMPT):
                continue
            for m in re.finditer(rx, line):
                val = next((g for g in m.groups() if g), None)
                if val and int(val) != truth:
                    bad.append({"file": path, "line": line_no,
                                "published": int(val), "text": line})
                    break
        report["drift"].append({
            "claim": label, "measured": truth,
            "stale_locations": len(bad), "hits": bad,
            "status": "OK" if not bad else "STALE",
        })

    if args.json:
        print(json.dumps(report, indent=2))
    else:
        print("MEASURED")
        for k, v in measured.items():
            print(f"  {k:24s} {v}")
        print("\nDRIFT")
        for d in report["drift"]:
            print(f"  [{d['status']:12s}] {d['claim']}"
                  + (f" — measured {d.get('measured')}, "
                     f"{d.get('stale_locations')} stale location(s)"
                     if d["status"] == "STALE" else ""))
            for h in d.get("hits", [])[:40]:
                print(f"      {h['file']}:{h['line']}  publishes {h['published']}")

    return 1 if any(d["status"] == "STALE" for d in report["drift"]) else 0


if __name__ == "__main__":
    sys.exit(main())
