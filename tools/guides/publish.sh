#!/usr/bin/env bash
# Full guide publish pipeline: render -> hub -> llms.txt -> sitemap -> validate.
# Deploy and IndexNow are separate deliberate steps (see the tail of this script).
set -euo pipefail
cd "$(dirname "$0")/../.."

python3 tools/guides/engine.py
python3 tools/guides/build_hub.py
python3 tools/guides/build_llms.py
python3 tools/sitemap.py
python3 tools/validate.py

echo
echo "next: npm run deploy && python3 tools/indexnow.py"
