"""Submit every sitemap URL to IndexNow (Bing, Copilot, DuckDuckGo, Yandex)."""
import json, os, re, urllib.request
ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
KEY = "4a2347c9e733088a05101b1e481fa1fe"
urls = re.findall(r"<loc>(.*?)</loc>", open(os.path.join(ROOT, "public", "sitemap.xml")).read())
urls += [f"https://yusuf-gadelrab.github.io/{p}" for p in ("llms.txt", "llms-full.txt", "ai.txt")]
body = json.dumps({"host": "yusuf-gadelrab.github.io", "key": KEY,
                   "keyLocation": f"https://yusuf-gadelrab.github.io/{KEY}.txt", "urlList": urls}).encode()
r = urllib.request.urlopen(urllib.request.Request(
    "https://api.indexnow.org/indexnow", data=body,
    headers={"Content-Type": "application/json; charset=utf-8"}), timeout=30)
print("IndexNow", r.status, "·", len(urls), "URLs")
