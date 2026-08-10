POST = {
    "slug": "what-schema-markup-taught-me-writing-30-guides.html",
    "title": "What schema markup taught me across 30 guides",
    "headline": "I wrote 30 guides in a week and here is what the schema markup taught me",
    "desc": "TechArticle vs Article vs BlogPosting, the FAQ rule most people break, and how one Person node turned 90 pages into a single entity instead of 90 authors.",
    "date": "2026-07-31",
    "keywords": [
        "structured data",
        "schema.org",
        "TechArticle",
        "FAQPage",
        "BreadcrumbList",
        "entity SEO",
        "JSON-LD",
    ],
    "related": [
        ("/guides.html", "The guide library this was built for"),
        ("/guides/ai-search-optimization.html", "How to get cited by AI answer engines"),
        ("/writing/i-spent-a-day-making-my-portfolio-readable-by-ai-instead-of-by-humans.html",
         "The day I made my portfolio readable by machines"),
        ("/guides/portfolio-that-gets-interviews.html", "Building a portfolio that gets interviews"),
    ],
    "body": [
        ("lede", "I did not write 30 guides by hand. I wrote one generator and 30 content specs, "
                 "which means I had to decide the structured data contract exactly once, for every "
                 "page at the same time. That constraint taught me more about schema markup than "
                 "any individual page ever could have."),

        ("p", "When you hand-write structured data you make 30 small decisions and never notice the "
              "contradictions. When you write it once for 30 pages, every inconsistency becomes a "
              "code path you have to justify. Here is what survived that."),

        ("h2", "TechArticle, Article, BlogPosting: it is about the reader, not the writing"),

        ("p", "I assumed for a long time that TechArticle meant \"technical writing\" and that the "
              "distinction was about how hard the content is. It is not. The type is a statement "
              "about what job the page does for the person who landed on it."),

        ("p", "A page that teaches a procedure, shows a formula, and expects you to go do something "
              "afterwards is a TechArticle. A dated first-person piece with an argument in it is a "
              "BlogPosting. A general informational page that is neither is an Article. Nobody "
              "penalizes you for choosing wrong. You just waste the signal, which is worse in a "
              "quiet way, because you will never see the miss."),

        ("p", "The rule I settled on and encoded in the generator: if the page contains a procedure "
              "or a formula and its value does not decay with time, TechArticle. If it is an opinion "
              "with a publication date attached, BlogPosting. This post is a BlogPosting. The "
              "<a href=\"/guides/r-multiple-expectancy.html\">R-multiple and expectancy guide</a> is "
              "a TechArticle, and it should still be correct in three years."),

        ("table", (
            ["Type", "Use it when", "Example on this site"],
            [
                ["TechArticle", "A procedure or formula the reader will apply",
                 "<a href=\"/guides/walk-forward-backtest.html\">Walk-forward testing guide</a>"],
                ["BlogPosting", "A dated, first-person argument or build log", "This post"],
                ["Article", "General informational content that is neither",
                 "<a href=\"/about.html\">Reference pages</a>"],
            ],
        )),

        ("h2", "The FAQ rule almost everyone breaks"),

        ("p", "This is the one that matters most and gets ignored most. FAQPage structured data has "
              "to mirror a frequently asked questions section that a human visitor can actually see "
              "on the page. Marking up questions and answers that exist only inside a script tag is "
              "against Google's structured data guidelines. It is not a gray area and it is not a "
              "clever growth hack, it is the documented rule."),

        ("p", "Plenty of sites do it anyway because it is easy and the failure is invisible. Nothing "
              "breaks. You just accumulate a page that says one thing to a parser and another thing "
              "to a person, which is the exact category of thing search engines are built to catch "
              "eventually."),

        ("p", "My fix was structural rather than disciplinary. The generator takes one list of "
              "question and answer pairs and emits both the visible FAQ section and the FAQPage node "
              "from that same list. Drift is not something I remember to check. It is impossible."),

        ("quote", "Any invariant you enforce by discipline will eventually break. Generate both "
                  "sides from one source and the invariant stops being your job."),

        ("p", "That was the real lesson of the week, and it generalizes past schema. Every place I "
              "had two representations of the same fact, I eventually found them disagreeing."),

        ("h2", "Be honest about FAQ rich results"),

        ("p", "I want to be careful here because a lot of SEO writing is quietly dishonest about "
              "this. Google sharply restricted FAQ rich results, and they now mostly appear for "
              "authoritative government and health sites. If you are a personal site adding FAQPage "
              "markup because you saw a screenshot of an expanding accordion in someone's search "
              "listing, you are probably not getting that."),

        ("p", "I still write the visible FAQ. Two reasons, neither of which is the rich result. "
              "First, a real FAQ is genuinely the best format for the questions people actually "
              "arrive with, and writing one forces me to answer the question in the first sentence "
              "instead of the fifth paragraph. Second, answer engines read the page, and a page "
              "structured as question then direct answer is trivially quotable. Being quotable is "
              "the point, which I argued at length in "
              "<a href=\"/guides/ai-search-optimization.html\">the answer engine guide</a>."),

        ("h2", "BreadcrumbList is the cheapest markup that actually renders"),

        ("p", "Breadcrumbs are three lines of JSON and they are the one piece of structured data on "
              "my pages that reliably changes what a search result looks like: the trail replaces "
              "the raw URL. Home, then Guides, then this guide."),

        ("p", "There is a second benefit that has nothing to do with search. You cannot emit a "
              "BreadcrumbList without having a real hierarchy, and most personal sites do not have "
              "one. They have a pile of pages and a nav bar. Being forced to answer \"what is the "
              "parent of this page\" for 30 pages in a row is a site architecture exercise wearing a "
              "markup costume."),

        ("h2", "The highest-leverage piece: one Person node, referenced by @id"),

        ("p", "If you only take one thing from this post, take this one."),

        ("p", "The obvious way to mark up authorship is to put an author object on every page with a "
              "name and a URL in it. Do that across 90 pages and you have told a parser that 90 "
              "similar-looking authors exist. Nothing links them. Nothing accumulates."),

        ("p", "The better way is to define the Person once, give it a stable "
              "<strong>@id</strong> at a canonical fragment URL, and have every other page reference "
              "that @id rather than restating the entity. On this site the id is "
              "<strong>https://yusuf-gadelrab.github.io/#person</strong>, and both "
              "<strong>author</strong> and <strong>publisher</strong> on every page point at it. The "
              "blog itself gets its own @id at /writing.html#blog, and each post declares "
              "<strong>isPartOf</strong> against it."),

        ("p", "The difference is the difference between 90 unrelated pages and one entity with 90 "
              "pieces of evidence attached to it. Guides about position sizing, a security scanner, "
              "CS education research, and a set of offline apps stop being four unrelated topics and "
              "start being four things the same person did. That is what you want when a model is "
              "asked who you are and has to assemble an answer from fragments."),

        ("h2", "None of it survives without a validator"),

        ("p", "Here is the failure mode that convinced me to write a pre-deploy check. Invalid JSON "
              "inside a script tag does not throw. The browser ignores it. The page looks perfect. "
              "Parsers skip the block entirely and you get exactly zero feedback, forever."),

        ("p", "So there is a validator that runs before deploy, and it checks every page on the site:"),

        ("ol", [
            "<strong>Every JSON-LD block actually parses.</strong> This catches the silent failure "
            "above and it is the single highest-value check in the file.",
            "<strong>The title is 60 characters or fewer</strong> and the meta description is 160 or "
            "fewer, so nothing gets truncated in a result.",
            "<strong>There is exactly one h1.</strong> Not zero, not three.",
            "<strong>A canonical link exists</strong> on every page.",
            "<strong>The canonical Person @id is referenced</strong>, so no page can quietly drift "
            "out of the entity graph.",
            "<strong>Every internal link resolves to a real file on disk.</strong> Dead internal "
            "links are the cheapest possible bug to prevent and the most embarrassing to ship.",
        ]),

        ("p", "It runs in about a second and it has caught things I would never have found by "
              "looking. The general principle: if a correctness property is invisible in the "
              "browser, it needs a test, or it is not a property, it is a hope."),

        ("h2", "What actually showed up, honestly"),

        ("p", "I am not going to show you a traffic chart, because the honest answer is that most of "
              "this is unmeasurable from where I sit."),

        ("ul", [
            "<strong>Breadcrumbs render.</strong> That one is visible and real.",
            "<strong>FAQ rich results are unlikely</strong> for a personal site, and I did not build "
            "the FAQ sections expecting them.",
            "<strong>Entity consolidation is a bet</strong>, not a measured win. I believe being "
            "resolvable to one entity is worth more over time than any single page ranking, and I "
            "cannot prove that with my own data.",
            "<strong>Answer engine citations are largely invisible</strong>, because those referrers "
            "mostly do not reach analytics. If a model cited a guide of mine yesterday I would not "
            "know.",
        ]),

        ("p", "So I shipped the contract because it is cheap, correct, and machine-checkable, not "
              "because I have a before and after. That is a worse story and a more accurate one. If "
              "you want the philosophical argument for why I optimized for machine readers at all, "
              "it is in "
              "<a href=\"/writing/i-spent-a-day-making-my-portfolio-readable-by-ai-instead-of-by-humans.html\">the "
              "post about making my portfolio readable by AI</a>, and the tooling patterns behind "
              "the pages themselves are in "
              "<a href=\"/guides/client-side-only-tools.html\">the client-side-only tools guide</a>."),

        ("verdict", ("If you do one thing", [
            "Pick one canonical @id for yourself, put the full Person node on your homepage, and "
            "make every other page reference that id instead of restating your name. It takes an "
            "afternoon and it is the only piece of this that compounds.",
            "Then write a validator that fails your build when the JSON does not parse. Everything "
            "else on this page is optional. That one is not.",
        ])),
    ],
}
