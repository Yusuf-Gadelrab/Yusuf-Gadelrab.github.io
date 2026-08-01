POST = {
    "slug": "the-internship-deadline-panic-was-mostly-fictional.html",
    "title": "The internship deadline panic was mostly fake",
    "headline": "The internship deadline panic was mostly fictional",
    "desc": "I re-verified 18 firms against primary sources. Only two had real deadlines. One panic-inducing date belonged to a different program entirely.",
    "date": "2026-07-31",
    "keywords": [
        "internship deadlines",
        "Summer 2027 internships",
        "sponsorship requisition",
        "job search",
        "international student internships",
        "application tracking",
    ],
    "related": [
        ("/writing/the-hardest-part-of-an-internship-search-isnt-the-applications-its-tha.html",
         "The earlier post this one corrects"),
        ("/apply.html", "The application board these 18 firms live on"),
        ("/guides/swe-internship-international-student.html", "Sponsorship, requisition by requisition"),
        ("/guides/cpt-vs-opt.html", "CPT vs OPT, for the timing math underneath all of this"),
    ],
    "body": [
        ("lede", "In late June I had a deadline list for Summer 2027 internships. I assembled it the "
                 "way most students assemble one: roundup posts, someone else's spreadsheet, a Discord "
                 "server, a thread I saved and never rechecked. In late July I sat down and "
                 "re-verified all 18 firms on it against the actual requisition page. Most of the "
                 "panic on that list was fictional."),

        ("p", "I want to be honest about my own part in this before I get to anyone else's. I had "
              "repeated at least one of these wrong dates out loud, to another student, with a "
              "straight face, before I ever checked it myself. This post is the sequel and the "
              "correction to <a href=\"/writing/the-hardest-part-of-an-internship-search-isnt-the-applications-its-tha.html\">the "
              "earlier piece I wrote about internship timing</a>, which leaned hard on urgency "
              "without doing the work I'm about to describe. Some of what that post implied turned "
              "out to be wrong, and this is me fixing it in public instead of quietly editing the "
              "old one."),

        ("h2", "What re-verification actually found"),

        ("p", "Eighteen firms, checked one at a time against the actual job requisition page or the "
              "firm's own careers site, not a roundup that summarized it for me. Of those eighteen, "
              "exactly two publish a real, firm deadline."),

        ("table", (
            ["Program", "Deadline", "The catch"],
            [
                ["Bain, ACI program", "August 31", "Office-level dates can differ from the headline date. Confirm in-portal for the specific office."],
                ["D. E. Shaw", "Effectively December 31, 2026", "Far enough out that it barely functions as urgency yet."],
            ],
        )),

        ("p", "Everything else, all sixteen remaining firms, was genuinely rolling. Not \"rolling but "
              "actually closing soon,\" not \"rolling with a soft internal cutoff nobody publishes.\" "
              "Rolling, as of late July 2026, on the requisition page I personally read that day. I "
              "keep repeating that qualifier because it matters: this is a point-in-time observation, "
              "not a permanent fact about these programs. A role that's rolling today can post a hard "
              "close tomorrow. The fix isn't memorizing my table, it's rechecking the source yourself "
              "before you act on it."),

        ("h2", "The deadline hiding after you submit"),

        ("p", "BlackRock was the one that changed how I think about the word \"deadline\" entirely. "
              "The role is open now, with no application deadline listed anywhere. But once you "
              "submit, a five-day clock starts on an assessment, and if you don't complete it in "
              "time, your application auto-withdraws."),

        ("p", "That's a real deadline. It just lives in a place a deadline list would never show you, "
              "because it doesn't exist until after you've already applied. No roundup post captures "
              "this, because the person writing the roundup never got far enough into the pipeline to "
              "see it."),

        ("h2", "Two deadlines that were just wrong"),

        ("p", "This is the part that actually embarrasses me. Two of the scariest dates on my "
              "original list weren't slightly off. They were for a completely different program."),

        ("p", "The widely repeated one was \"McKinsey, August 11.\" That date belongs to McKinsey's "
              "full-time business analyst program, which targets a different graduation window than "
              "mine. The actual Summer 2027 intern window had already closed in March 2026, months "
              "before I ever wrote the date down, and the next one doesn't open until January 1, 2027. "
              "So the famous date wasn't just the wrong program, it pointed urgency in the wrong "
              "direction. Nobody needed to panic about August. They needed to know the real window "
              "had already closed."),

        ("p", "The second was \"HRT closes in August.\" August is when the program ends, not when "
              "applications close. Somewhere upstream, someone read a program end date off a page and "
              "it propagated as an application deadline, and it kept propagating because it sounds "
              "exactly like the kind of fact a deadline list should contain."),

        ("h2", "The firm that wasn't even on my list"),

        ("p", "Palantir never made my original spreadsheet. It turned up during the re-verification "
              "pass, and it's arguably my single best fit on the entire board. The role is in Palo "
              "Alto, and the requisition states, verbatim, \"Must be planning on graduating in 2028.\" "
              "That's my exact graduation year. Listed compensation is $10,500 a month."),

        ("p", "One caveat worth stating plainly: avoid the government, defense, and intelligence "
              "variants of the same role. Those require a security clearance I'm not eligible for, "
              "and it's easy to click into the wrong variant if you're skimming rather than reading."),

        ("h2", "Sponsorship is a requisition fact, not a company fact"),

        ("p", "Because I'll need US sponsorship, this was the check I cared about most, and it's also "
              "where secondhand lists fail hardest, because they tend to answer at the company level "
              "when the real answer lives one level down. I wrote the fuller version of this in the "
              "<a href=\"/guides/swe-internship-international-student.html\">sponsorship guide</a>, "
              "but the short version came directly out of this pass."),

        ("ul", [
            "<strong>Optiver</strong> states sponsorship explicitly across all three of its "
            "requisitions. No ambiguity, no per-role variation.",
            "<strong>SIG</strong> does the same, on requisitions 10717 and 10837 specifically. These "
            "were not on my original list at all.",
            "<strong>DRW</strong> is the clean example of why this has to be checked per requisition. "
            "The Strategy role explicitly refuses sponsorship. The software engineering requisition, "
            "3467328, has no such restriction. Same company, opposite answer, one line apart.",
        ]),

        ("p", "That DRW pair is the whole lesson in miniature. \"Does this company sponsor\" is "
              "usually the wrong question. \"Does this specific requisition sponsor\" is the one that "
              "matters, and it's answered on the page, not in anyone's memory of the company's "
              "reputation."),

        ("h2", "The listings a script can't even see"),

        ("p", "Six of the eighteen, Goldman Sachs, Google, TikTok, Citadel, Cubist, and Apple, sit "
              "behind JavaScript-gated portals. Nothing I ran could read them directly. Checking those "
              "requires an actual browser session, a human clicking through, which takes real time per "
              "listing."),

        ("p", "That's not a minor annoyance, it's a structural reason bad deadline data spreads in the "
              "first place. The listings that are hardest to verify are exactly the ones people quote "
              "secondhand the most, because almost nobody has the patience to open a real browser "
              "session for all six. So the secondhand version becomes the only version anyone sees."),

        ("h2", "Why secondhand deadline lists manufacture urgency"),

        ("p", "None of this happened because anyone was lying. A specific date is more shareable than "
              "\"rolling, apply whenever,\" and urgency gets more engagement than accuracy does. Once a "
              "date is posted, it gets reposted, and almost nobody who reposts it goes back to the "
              "requisition to recheck. Each repost looks like independent confirmation. It isn't. It's "
              "the same unverified fact, copied."),

        ("p", "The cost of that lands entirely on the reader, and it lands in one of two ways. Either "
              "you panic about a deadline that was never real, or worse, you relax about one that "
              "actually is, because it got buried under ten fake ones that trained you to distrust "
              "the whole category."),

        ("h2", "How to verify a deadline yourself"),

        ("p", "This is the reusable part, the checklist I now run on anything before I let it into my "
              "own head as urgent."),

        ("ol", [
            "<strong>Go to the requisition, not the roundup.</strong> The firm's own careers page or "
            "the specific req link. A summary of a summary is not a source.",
            "<strong>Check that the program name matches the one you actually want.</strong> "
            "\"Full-time business analyst\" and \"summer intern\" are different programs even when the "
            "firm name is identical, and their dates have nothing to do with each other.",
            "<strong>Check the graduation-year requirement first.</strong> It's usually stated "
            "verbatim, and it's the fastest disqualifier. No point reading the rest of a listing you "
            "don't qualify for.",
            "<strong>Check sponsorship at the requisition level, not the company level.</strong> DRW "
            "proved a single company can hold both answers at once.",
            "<strong>Look for clocks that start after you submit.</strong> Assessments and video "
            "interviews can carry their own expiration, and those never show up on a pre-application "
            "deadline list.",
            "<strong>Write down the URL and the date you checked it.</strong> A rolling role can close "
            "on any given day. Your note has a shelf life, and pretending otherwise is how stale dates "
            "end up back on someone's spreadsheet.",
        ]),

        ("h2", "The actual bottleneck"),

        ("p", "Here's what the re-verification pass surfaced that the original panic never would "
              "have: 25 roles on my board were applyable immediately, right now, no waiting on "
              "anything. I had submitted zero of them. Materials were done. Resume was done. The "
              "bottleneck was never the dates. It was throughput, the unglamorous work of actually "
              "clicking submit 25 times."),

        ("p", "All 25, along with the rolling-versus-hard-deadline split above, live on "
              "<a href=\"/apply.html\">the application board</a>. If you're running your own search "
              "right now, this is the number worth counting. Not how many deadlines are approaching. "
              "How many submittable applications are sitting unsubmitted."),

        ("verdict", ("The one line to take away", [
            "A deadline you found secondhand is a rumor until you've read it on the requisition "
            "yourself, on today's date, for the exact program and role you're applying to.",
            "Sixteen of eighteen firms were rolling. The panic wasn't wrong because deadlines don't "
            "exist. It was wrong because almost nobody had checked which two firms actually had one.",
        ])),
    ],
}
