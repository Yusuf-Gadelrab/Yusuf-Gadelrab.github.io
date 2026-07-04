#!/bin/bash
# Usage: bash add-adsense.sh pub-XXXXXXXXXXXXXXXX
# Injects Google AdSense (Auto Ads) into the site + creates ads.txt, then deploys.
set -e
PUB="$1"
[[ "$PUB" =~ ^pub-[0-9]{16}$ ]] || { echo "Usage: bash add-adsense.sh pub-XXXXXXXXXXXXXXXX (get it at adsense.google.com after signup)"; exit 1; }

cd "$(dirname "$0")"
TAG="<script async src=\"https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-$PUB\" crossorigin=\"anonymous\"></script>"

for f in public/index.html public/hwyhaul.html public/freightdesk.html; do
  grep -q "adsbygoogle" "$f" && { echo "skip $f (already injected)"; continue; }
  perl -0pi -e "s|</head>|$TAG\n</head>|" "$f"
  echo "injected $f"
done

echo "google.com, $PUB, DIRECT, f08c47fec0942fa0" > public/ads.txt
echo "wrote public/ads.txt"

git add public/ && git commit -m "add adsense + ads.txt

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
git push origin main
npm run deploy
echo "DONE — now click 'Verify' in the AdSense dashboard."
