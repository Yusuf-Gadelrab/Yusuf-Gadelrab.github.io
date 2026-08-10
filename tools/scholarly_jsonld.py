#!/usr/bin/env python3
"""Emit ScholarlyArticle JSON-LD for a DOI, generated from Crossref.

Why generated: the hand-written blocks on index/about/research declare
`"author": {"@id": ".../#person"}` — schema.org reads that as sole authorship.
The bilingual-coding paper has eight authors and Yusuf is seventh. Anything
hand-maintained drifts; this reads the authoritative record every time.

  uv run tools/scholarly_jsonld.py 10.1145/3770761.3777339
  uv run tools/scholarly_jsonld.py 10.1145/3770761.3777339 --minified

Writes to stdout only. It never touches public/.
"""
import argparse
import json
import sys
import urllib.request

PERSON_ID = "https://yusuf-gadelrab.github.io/#person"
LAB_ID = "https://yusuf-gadelrab.github.io/#csed-lab"
SJSU_ID = "https://yusuf-gadelrab.github.io/#sjsu"
SELF_ORCID = "https://orcid.org/0009-0001-6579-1179"


def crossref(doi):
    req = urllib.request.Request(
        f"https://api.crossref.org/works/{doi}",
        headers={"User-Agent": "yusuf-gadelrab.github.io/1.0 (mailto:yusuf.gadelrab06@gmail.com)"},
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)["message"]


def person(a):
    """One Crossref author -> one schema.org Person.

    Yusuf collapses to a bare @id reference so the site graph keeps exactly one
    canonical node for him; every co-author is a fresh node carrying their ORCID.
    """
    orcid = a.get("ORCID")
    if orcid == SELF_ORCID:
        return {"@id": PERSON_ID}
    node = {"@type": "Person", "name": f"{a.get('given','')} {a.get('family','')}".strip()}
    if orcid:
        node["sameAs"] = orcid
        node["identifier"] = {"@type": "PropertyValue", "propertyID": "ORCID", "value": orcid}
    if any("San Jose State" in (x.get("name") or "") for x in a.get("affiliation", [])):
        node["affiliation"] = {"@id": SJSU_ID}
    return node


def build(m):
    doi = m["DOI"]
    parts = m["issued"]["date-parts"][0]
    date = "-".join(f"{p:02d}" if i else str(p) for i, p in enumerate(parts))
    out = {
        "@context": "https://schema.org",
        "@type": "ScholarlyArticle",
        "@id": f"https://doi.org/{doi}",
        "name": m["title"][0],
        "headline": m["title"][0],
        "author": [person(a) for a in m.get("author", [])],
        "datePublished": date,
        "inLanguage": "en",
        "publisher": {
            "@type": "Organization",
            "name": "Association for Computing Machinery",
            "alternateName": m.get("publisher", "ACM"),
        },
        "isPartOf": {
            "@type": "CreativeWork",
            "@id": "https://doi.org/10.1145/3770761",
            "name": m["container-title"][0],
        },
        "sourceOrganization": {"@id": LAB_ID},
        "identifier": [{"@type": "PropertyValue", "propertyID": "DOI", "value": doi}],
        "sameAs": f"https://doi.org/{doi}",
        "url": f"https://doi.org/{doi}",
    }
    if m.get("page"):
        out["pagination"] = m["page"]
    ev = m.get("event") or {}
    if ev.get("name"):
        loc = ev.get("location")
        pub_ev = {"@type": "PublicationEvent", "name": ev["name"], "startDate": date}
        if loc:
            pub_ev["location"] = {"@type": "Place", "name": loc}
        out["publication"] = pub_ev
    out["about"] = ["Computer science education", "Bilingual learners", "Inclusive pedagogy"]
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("doi")
    ap.add_argument("--minified", action="store_true", help="one line, ready to paste into a <script> tag")
    a = ap.parse_args()
    m = crossref(a.doi)
    d = build(m)
    if a.minified:
        sys.stdout.write(json.dumps(d, separators=(",", ":"), ensure_ascii=False) + "\n")
    else:
        sys.stdout.write(json.dumps(d, indent=2, ensure_ascii=False) + "\n")
    names = [x.get("name", "Yusuf Gadelrab (@id ref)") for x in d["author"]]
    sys.stderr.write(f"[{len(names)} authors] {' | '.join(names)}\n")


if __name__ == "__main__":
    main()
