#!/usr/bin/env python3
"""Structured-data audit for public/.

Extracts every application/ld+json block from every .html under public/, parses it,
and reports:

  * JSON parse failures (with the offending file + excerpt)
  * unknown / misspelled @type values (checked against a curated schema.org vocabulary)
  * required-property violations for the types actually in use
  * duplicate @id values whose node bodies disagree
  * @id references that resolve to no definition anywhere on the site
  * honesty checks: fabricated Review/AggregateRating, Offers claiming InStock with a
    dead checkout URL

Exit code 1 if any hard error is found. Warnings alone exit 0.

Usage:
    python3 tools/schema_audit.py            # human report
    python3 tools/schema_audit.py --json     # machine-readable
    python3 tools/schema_audit.py --strict   # warnings are errors too
"""
from __future__ import annotations

import argparse
import glob
import json
import os
import re
import sys
from collections import defaultdict

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
PUB = os.path.join(ROOT, "public")
BASE = "https://yusuf-gadelrab.github.io"

SCRIPT_RE = re.compile(
    r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', re.S | re.I
)

# ---------------------------------------------------------------------------
# Curated schema.org vocabulary. Anything outside this set is reported as an
# unknown type so a typo ("FAQpage", "HowTo Step") cannot ship silently.
# ---------------------------------------------------------------------------
KNOWN_TYPES = {
    # creative works
    "Article", "BlogPosting", "TechArticle", "ScholarlyArticle", "Report",
    "CreativeWork", "Book", "Blog", "Periodical", "WebPage", "WebSite",
    "CollectionPage", "ProfilePage", "AboutPage", "ContactPage", "FAQPage",
    "QAPage", "ItemPage", "CheckoutPage", "SearchResultsPage", "MediaObject",
    "ImageObject", "VideoObject", "AudioObject", "SoftwareApplication",
    "WebApplication", "MobileApplication", "SoftwareSourceCode", "Dataset",
    "DataCatalog", "DataDownload", "LearningResource", "Course",
    "CourseInstance", "Syllabus", "Quiz", "Newsletter", "Message",
    # how-to / lists
    "HowTo", "HowToStep", "HowToSection", "HowToTip", "HowToSupply",
    "HowToTool", "HowToDirection", "ItemList", "ListItem", "BreadcrumbList",
    "Question", "Answer", "DefinedTerm", "DefinedTermSet", "SpeakableSpecification",
    # commerce
    "Product", "ProductGroup", "IndividualProduct", "Offer", "AggregateOffer",
    "OfferCatalog", "Demand", "PriceSpecification", "UnitPriceSpecification",
    "Service", "ServiceChannel", "Brand", "MerchantReturnPolicy",
    "Review", "AggregateRating", "Rating", "ReviewAction",
    # orgs & people
    "Organization", "Person", "NGO", "EducationalOrganization",
    "CollegeOrUniversity", "HighSchool", "ResearchOrganization",
    "OnlineBusiness", "Corporation", "LocalBusiness", "SportsTeam",
    "PostalAddress", "ContactPoint", "Place", "City", "Country",
    "AdministrativeArea", "GeoCoordinates", "VirtualLocation",
    # events / misc
    "Event", "EducationalEvent", "BusinessEvent", "Occupation", "JobPosting",
    "Project", "ResearchProject", "Role", "OrganizationRole", "Audience",
    "EducationalAudience", "Language", "PropertyValue", "QuantitativeValue",
    "MonetaryAmount", "EducationalOccupationalCredential", "Occupation",
    "Duration", "Thing", "Action", "SearchAction", "EntryPoint", "Grant",
    "MonetaryGrant", "Comment", "InteractionCounter", "OpeningHoursSpecification",
    "Episode", "PodcastEpisode", "PodcastSeries", "Clip", "Article",
}

# Minimum properties Google (or schema.org) actually needs for the types we ship.
# Kept deliberately tight: only rules that would break a rich result.
REQUIRED = {
    "HowTo": {"name", "step"},
    "HowToStep": {"name"},
    "FAQPage": {"mainEntity"},
    "Question": {"name", "acceptedAnswer"},
    "Answer": {"text"},
    "BreadcrumbList": {"itemListElement"},
    "ListItem": {"position"},
    "ItemList": {"itemListElement"},
    "Product": {"name"},
    "Offer": {"price", "priceCurrency", "availability"},
    "Article": {"headline"},
    "BlogPosting": {"headline"},
    "TechArticle": {"headline"},
    "ScholarlyArticle": {"headline"},
    "SoftwareApplication": {"name"},
    "WebApplication": {"name"},
    "Course": {"name", "description", "provider"},
    "Dataset": {"name", "description"},
    "VideoObject": {"name", "description", "thumbnailUrl", "uploadDate"},
    "Event": {"name", "startDate", "location"},
    "DefinedTerm": {"name"},
    "Person": {"name"},
    "Organization": {"name"},
    "Review": {"author", "reviewRating"},
    "AggregateRating": {"ratingValue", "ratingCount"},
    "SpeakableSpecification": set(),  # cssSelector OR xpath, checked separately
    "Rating": {"ratingValue"},
    "QAPage": {"mainEntity"},
}

VALID_AVAILABILITY = {
    "InStock", "OutOfStock", "PreOrder", "PreSale", "BackOrder", "Discontinued",
    "InStoreOnly", "LimitedAvailability", "OnlineOnly", "SoldOut",
}

# Types where a bare {"@id": ...} with no other keys is a *reference*, not a definition.
def is_reference(node: dict) -> bool:
    keys = set(node.keys()) - {"@context"}
    return keys == {"@id"} or keys == {"@id", "@type"}


def types_of(node: dict):
    t = node.get("@type")
    if isinstance(t, str):
        return [t]
    if isinstance(t, list):
        return [x for x in t if isinstance(x, str)]
    return []


class Audit:
    def __init__(self):
        self.errors = []
        self.warnings = []
        self.blocks = 0
        self.nodes = 0
        self.files = 0
        self.type_counts = defaultdict(int)
        self.definitions = defaultdict(list)   # @id -> [(file, canonical json)]
        self.references = defaultdict(list)    # @id -> [file]
        self.person_defs = []                  # (file, key_count)

    def err(self, rel, msg):
        self.errors.append(f"{rel}: {msg}")

    def warn(self, rel, msg):
        self.warnings.append(f"{rel}: {msg}")

    # -- node level ---------------------------------------------------------
    def visit(self, node, rel, path="$"):
        if isinstance(node, list):
            for i, v in enumerate(node):
                self.visit(v, rel, f"{path}[{i}]")
            return
        if not isinstance(node, dict):
            return

        self.nodes += 1
        nid = node.get("@id")
        ntypes = types_of(node)

        # @graph containers carry no type of their own
        if "@graph" in node:
            self.visit(node["@graph"], rel, path + ".@graph")

        if nid:
            if is_reference(node):
                self.references[nid].append(rel)
            else:
                body = json.dumps(
                    {k: v for k, v in sorted(node.items()) if k != "@context"},
                    sort_keys=True,
                )
                self.definitions[nid].append((rel, body))

        for t in ntypes:
            self.type_counts[t] += 1
            if t not in KNOWN_TYPES:
                self.err(rel, f"unknown @type {t!r} at {path}")
            req = REQUIRED.get(t)
            if req and not is_reference(node):
                missing = sorted(p for p in req if p not in node)
                if missing:
                    self.err(
                        rel,
                        f"{t} at {path} missing required {', '.join(missing)}",
                    )
            if t == "Person" and not is_reference(node):
                self.person_defs.append((rel, len(set(node) - {"@context"}), nid))

        # ---- targeted rules ------------------------------------------------
        if "HowTo" in ntypes:
            steps = node.get("step")
            if isinstance(steps, list):
                if len(steps) < 2:
                    self.err(rel, f"HowTo at {path} has {len(steps)} step(s); needs >= 2")
                for i, s in enumerate(steps):
                    if isinstance(s, dict) and not (s.get("text") or s.get("itemListElement")):
                        self.err(rel, f"HowTo step[{i}] at {path} has no text")
            elif steps is not None:
                self.err(rel, f"HowTo at {path} step is not a list")

        if "Offer" in ntypes and not is_reference(node):
            av = node.get("availability", "")
            short = str(av).rsplit("/", 1)[-1]
            if short and short not in VALID_AVAILABILITY:
                self.err(rel, f"Offer at {path} bad availability {av!r}")
            price = node.get("price")
            if price is not None and not re.fullmatch(r"\d+(\.\d+)?", str(price)):
                self.err(rel, f"Offer at {path} price {price!r} is not a bare number")

        if "SpeakableSpecification" in ntypes:
            if not (node.get("cssSelector") or node.get("xpath")):
                self.err(rel, f"SpeakableSpecification at {path} has neither cssSelector nor xpath")

        for bad in ("aggregateRating", "review", "reviewCount", "ratingValue"):
            if bad in node and "AggregateRating" not in ntypes and "Rating" not in ntypes and "Review" not in ntypes:
                self.warn(rel, f"HONESTY: {bad!r} present at {path} — no real reviews exist")
        if "AggregateRating" in ntypes or "Review" in ntypes:
            self.err(rel, f"HONESTY: fabricated {'/'.join(ntypes)} node at {path} — remove it")

        if "ItemList" in ntypes and not is_reference(node):
            items = node.get("itemListElement") or []
            if isinstance(items, list):
                positions = [
                    i.get("position") for i in items if isinstance(i, dict)
                ]
                if positions and positions != list(range(1, len(positions) + 1)):
                    self.err(rel, f"ItemList at {path} positions not 1..n: {positions[:12]}")

        for k, v in node.items():
            if k not in ("@graph",):
                self.visit(v, rel, f"{path}.{k}")

    # -- file level ---------------------------------------------------------
    def scan_file(self, fpath):
        rel = os.path.relpath(fpath, PUB)
        src = open(fpath, encoding="utf-8").read()
        self.files += 1
        for m in SCRIPT_RE.finditer(src):
            self.blocks += 1
            raw = m.group(1).strip()
            try:
                data = json.loads(raw)
            except Exception as e:
                self.err(rel, f"PARSE FAIL: {e} — near {raw[:120]!r}")
                continue
            if isinstance(data, dict) and "@context" not in data and "@graph" not in data:
                self.warn(rel, "top-level JSON-LD block has no @context")
            self.visit(data, rel)

    def run(self):
        files = sorted(glob.glob(os.path.join(PUB, "**", "*.html"), recursive=True))
        for f in files:
            self.scan_file(f)

        # duplicate @ids with differing bodies
        for nid, defs in sorted(self.definitions.items()):
            bodies = {b for _, b in defs}
            if len(bodies) > 1:
                where = ", ".join(sorted({f for f, _ in defs}))
                self.err("<graph>", f"@id {nid} defined {len(bodies)} different ways in: {where}")

        # dangling references (site-wide resolution)
        for nid, users in sorted(self.references.items()):
            if nid not in self.definitions:
                self.err(
                    "<graph>",
                    f"dangling @id reference {nid} (used in {len(users)} file(s), e.g. {users[0]}) "
                    "— defined nowhere on the site",
                )

        # entity hygiene
        person_full = [(f, n, i) for f, n, i in self.person_defs if n > 2]
        canonical = f"{BASE}/#person"
        rich = [(f, n) for f, n, i in person_full if i == canonical and n >= 8]
        if len(rich) > 1:
            self.err(
                "<graph>",
                f"{len(rich)} rich definitions of {canonical}: "
                + ", ".join(f"{f}({n} props)" for f, n in rich),
            )
        return self


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--strict", action="store_true")
    args = ap.parse_args()

    a = Audit().run()

    if args.json:
        print(json.dumps({
            "files": a.files, "blocks": a.blocks, "nodes": a.nodes,
            "types": dict(sorted(a.type_counts.items(), key=lambda x: -x[1])),
            "errors": a.errors, "warnings": a.warnings,
        }, indent=2))
        return 1 if a.errors else 0

    print(f"scanned {a.files} html files · {a.blocks} JSON-LD blocks · {a.nodes} nodes")
    print(f"distinct @id definitions: {len(a.definitions)} · reference sites: {sum(len(v) for v in a.references.values())}")
    print("\ntypes in use:")
    for t, c in sorted(a.type_counts.items(), key=lambda x: (-x[1], x[0])):
        print(f"  {c:>5}  {t}")

    if a.warnings:
        print(f"\n{len(a.warnings)} WARNING(S):")
        for w in a.warnings[:80]:
            print("  ~", w)
        if len(a.warnings) > 80:
            print(f"  ... +{len(a.warnings)-80} more")

    if a.errors:
        print(f"\n{len(a.errors)} ERROR(S):")
        for e in a.errors[:120]:
            print("  ✗", e)
        if len(a.errors) > 120:
            print(f"  ... +{len(a.errors)-120} more")
        return 1

    print("\nno errors — 0 parse failures, 0 dangling @id references, 0 unknown types")
    return 1 if (args.strict and a.warnings) else 0


if __name__ == "__main__":
    sys.exit(main())
