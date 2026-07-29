"""Regenerate public/sitemap.xml from what is actually on disk."""
import glob, os
BASE = "https://yusuf-gadelrab.github.io"; DATE = "2026-07-29"
ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
PUB = os.path.join(ROOT, "public")
SKIP = {"404.html", "offline.html", "googlebb78e2fba04aed48.html"}
PRIO = {"index.html": ("1.0", "daily"), "about.html": ("0.9", "monthly"), "guides.html": ("0.9", "weekly"),
        "freightdesk.html": ("0.9", "weekly"), "store.html": ("0.9", "weekly"), "kxngsef.html": ("0.9", "weekly"),
        "templates.html": ("0.9", "weekly"), "apps.html": ("0.8", "weekly"), "everything.html": ("0.8", "monthly"),
        "resume.html": ("0.8", "monthly"), "sprint.html": ("0.8", "monthly"), "writing.html": ("0.8", "weekly")}
urls = []
for f in sorted(glob.glob(os.path.join(PUB, "*.html"))):
    b = os.path.basename(f)
    if b in SKIP: continue
    loc = f"{BASE}/" if b == "index.html" else f"{BASE}/{b}"
    p, c = PRIO.get(b, ("0.6", "monthly")); urls.append((loc, p, c))
for f in sorted(glob.glob(os.path.join(PUB, "guides", "*.html"))):
    urls.append((f"{BASE}/guides/{os.path.basename(f)}", "0.8", "monthly"))
for f in sorted(glob.glob(os.path.join(PUB, "apps", "*", "index.html"))):
    urls.append((f"{BASE}/apps/{os.path.basename(os.path.dirname(f))}/", "0.5", "monthly"))
urls.sort(key=lambda u: (-float(u[1]), u[0]))
out = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for loc, p, c in urls:
    out += ["  <url>", f"    <loc>{loc}</loc>", f"    <lastmod>{DATE}</lastmod>",
            f"    <changefreq>{c}</changefreq>", f"    <priority>{p}</priority>", "  </url>"]
out.append("</urlset>")
open(os.path.join(PUB, "sitemap.xml"), "w").write("\n".join(out) + "\n")
print(len(urls), "urls in sitemap")
