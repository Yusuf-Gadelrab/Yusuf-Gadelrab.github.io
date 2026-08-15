#!/usr/bin/env bash
# Refuse to deploy when local main is behind origin/main.
#
# Why this exists: on 2026-08-15 a deploy ran from a local main that was 10
# commits behind origin. gh-pages serves whatever you build, so that single
# command silently REVERTED 239 files of accuracy fixes on the live site —
# including the SIGCSE "Paper" -> "Poster Abstract" correction. Nothing warned.
#
# Bypass (only if you know the remote is wrong): DEPLOY_GUARD=off npm run deploy
set -euo pipefail
[ "${DEPLOY_GUARD:-on}" = "off" ] && { echo "deploy-guard: BYPASSED"; exit 0; }
git fetch -q origin 2>/dev/null || { echo "deploy-guard: cannot reach origin; refusing"; exit 1; }
behind=$(git rev-list --count HEAD..origin/main 2>/dev/null || echo 0)
if [ "$behind" -gt 0 ]; then
  echo "──────────────────────────────────────────────────────────────"
  echo "⛔ DEPLOY BLOCKED — local is $behind commit(s) behind origin/main."
  echo "   Deploying now would publish stale content and revert whatever"
  echo "   those $behind commits fixed."
  echo "   Fix:  git pull --ff-only origin main   (or merge, then rebuild)"
  echo "   Override: DEPLOY_GUARD=off npm run deploy"
  echo "──────────────────────────────────────────────────────────────"
  exit 1
fi
echo "deploy-guard: OK — up to date with origin/main"
