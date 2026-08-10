POST = {
    "slug": "free-first-paid-second-the-build-stack.html",
    "title": "Free first: the zero dollar build stack",
    "headline": "Free-first, paid-second: the build stack a broke CS student actually needs",
    "desc": "Not licences, not AI subscriptions. The inference, hosting, data, and distribution a student needs to actually ship, for close to zero dollars.",
    "date": "2026-07-31",
    "keywords": [
        "student developer stack",
        "free hosting",
        "local llm",
        "ollama",
        "github pages",
        "zero dependency tooling",
        "free tier traps",
    ],
    "related": [
        ("/writing/student-software-stack-free-first-paid-second.html", "The licence list: student software, free first"),
        ("/writing/ai-tools-i-pay-for-vs-what-i-run-locally.html", "The AI subscription list: what I pay for vs run locally"),
        ("/guides/local-llm-ollama.html", "Running a local LLM with Ollama"),
        ("/dira.html", "DIRA, the zero-dependency security scanner"),
    ],
    "body": [
        ("lede", "I have written two of these posts already. One is the licence list: the student "
                 "software you should claim before you buy anything. The other is the AI subscription "
                 "list: which paid tools survived next to a model I run for free on my own laptop. "
                 "Neither one answers the question I actually get asked most, which is how a student "
                 "ships something real with no budget at all."),

        ("p", "So this is the third post, and it is a different list. Not licences, not chat "
              "subscriptions. This is the infrastructure underneath a shipped product: inference, "
              "hosting, data, tooling, security, and distribution. If you want the desk software, "
              "read <a href=\"/writing/student-software-stack-free-first-paid-second.html\">the "
              "licence list</a>. If you want the AI subscription breakdown, read "
              "<a href=\"/writing/ai-tools-i-pay-for-vs-what-i-run-locally.html\">the AI subscription "
              "list</a>. This one is the build stack, and if I catch myself mentioning an IDE licence "
              "or a grammar checker anywhere below, assume I have wandered off topic."),

        ("h2", "What actually ships my stuff"),

        ("p", "Here is the honest inventory, in the order a product actually needs it: something to "
              "think with, somewhere to live, something to talk to, data to run on, protection from "
              "shipping a hole, and a way for someone to install it. All six are free in my current "
              "stack. Not free-trial free. Actually free, every month, indefinitely."),

        ("h3", "Inference: a model that runs while I sleep"),

        ("p", "I run Ollama with a Qwen3 30B mixture-of-experts model on my own laptop. Zero cost "
              "per token, no rate limit, and it keeps working at 4am when I am not. I talk to it "
              "over the local HTTP API on <code>localhost:11434</code> rather than shelling out to "
              "the CLI, because capturing CLI output from a long-running model is a trap that costs "
              "you an afternoon the first time it silently hangs. The setup notes are in the "
              "<a href=\"/guides/local-llm-ollama.html\">local LLM guide</a>."),

        ("p", "It powers the nightly batch work: drafting, classification, summarizing, first "
              "passes on anything repetitive. Where it loses, honestly, is hard reasoning, long "
              "context synthesis, code it has never seen, and anything I am about to publish under "
              "my own name. That is where a paid API token is worth spending."),

        ("p", "The rule I actually use: local for volume, paid for judgment. Volume is where a "
              "token bill comes from. Move the volume to local and most of the bill disappears "
              "without touching the quality that matters, because the work that was inflating the "
              "bill was never the work that needed judgment in the first place."),

        ("h3", "Hosting: free, static, and enough"),

        ("p", "The entire portfolio runs on GitHub Pages. Ninety-plus pages, three installable "
              "apps, a guide library, all of it, on a plan that costs nothing and has never once "
              "been the bottleneck. Static hosting is not a compromise tier you graduate out of. "
              "For almost everything a student builds, it is the correct architecture, not the cheap "
              "one."),

        ("h3", "Backend: the one I do not have"),

        ("p", "The bigger decision was not which backend to pick. It was refusing to have one. The "
              "three apps I have shipped, a trading journal, a weight tracker, and a ritual "
              "checklist, are progressive web apps that keep everything in <code>localStorage</code> "
              "and work offline. No server, no database, no auth system to keep patched, and no "
              "user data sitting on a machine I am responsible for securing. I wrote the reasoning "
              "up in the <a href=\"/guides/client-side-only-tools.html\">client-side-only tools "
              "guide</a>, and the apps themselves are at <a href=\"/apps.html\">the apps hub</a>: "
              "<a href=\"/apps/tradelog/\">TradeLog</a>, <a href=\"/apps/cut/\">Cut</a>, and "
              "<a href=\"/apps/fire/\">Fire</a>."),

        ("p", "This is a cost strategy dressed as an architecture choice. No backend means no "
              "server bill, which means the free tier never expires, which means I never have to "
              "make the month-thirteen decision about whether the product is worth paying to keep "
              "alive. A product with no bill cannot get shut off for non-payment."),

        ("h3", "Data: the free public API nobody puts in the pitch deck"),

        ("p", "Every build stack eventually needs data from somewhere that is not your own head, "
              "and the unglamorous foundation under a lot of what I ship is free public APIs. My "
              "security scanner queries OSV.dev, the open-source vulnerability database, for CVEs. "
              "It is free, public, and maintained by people who are not trying to sell me a seat. "
              "Nobody writes a blog post about the API they call for free, so I am writing this "
              "paragraph instead: check for a free public data source before you assume the data "
              "layer is where the budget goes."),

        ("h3", "Tooling: fast enough that speed becomes a budget line"),

        ("p", "Python through <code>uv</code>, JavaScript through Bun. Both free, both fast enough "
              "that the speed itself starts acting like money. Minutes not spent waiting on an "
              "install or a build are the one currency I actually have a lot of as a student, and "
              "tooling that wastes it is a real cost even when the sticker price is zero."),

        ("h3", "Security: writing the scanner instead of installing one"),

        ("p", "I built <a href=\"/dira.html\">DIRA</a>, a zero-dependency security scanner, MIT "
              "licensed, currently at v1.5.0 with 124 passing tests, pure standard library Python. "
              "The alternative was installing a dependency tree just to go looking for supply chain "
              "risk in my own dependency tree, which is a strange trade to make in the name of "
              "security. Zero dependencies means nothing it scans with can itself be the "
              "vulnerability."),

        ("h3", "Distribution: skipping the store entirely"),

        ("p", "Apple charges $99 a year for a developer account before you can put anything in the "
              "App Store. I skipped it and shipped installable PWAs through the browser share menu "
              "instead: open the app, tap share, add to home screen, done. No review queue, no "
              "annual fee, no gatekeeper between a finished app and someone's phone. The tradeoffs "
              "are real, no App Store search traffic and no push notification API, but for three "
              "tools built to prove I can ship rather than to top a store chart, the tradeoff was "
              "obviously worth it."),

        ("h2", "The traps"),

        ("p", "This is the part that actually matters, because free-first only works if you can "
              "tell the difference between free and free-shaped. I have paid the tuition on most of "
              "these."),

        ("ul", [
            "<strong>Free tiers that require a card up front.</strong> The card is the product, "
            "the free tier is the funnel. That is not automatically a bad trade, but decide it on "
            "day one, not on the renewal date when the charge already cleared.",
            "<strong>Cloud credits that expire.</strong> A year of free credits will happily let "
            "you build a year of architecture you cannot afford in month thirteen. If the free "
            "thing locks in a dependency on infrastructure with a real price once the credits run "
            "out, the price was deferred, not avoided.",
            "<strong>Paying per token for something a local model already does fine.</strong> Most "
            "automation work is volume: drafts, tags, summaries, first passes. Volume is exactly "
            "what a local model is good at, so a token bill for volume work is usually a bill for "
            "convenience you did not need to buy.",
            "<strong>Seat-based tools for a team of one.</strong> Per-seat pricing is a team-scale "
            "problem. A team of one paying per seat is paying a team price for a solo workload.",
            "<strong>Anything bought for a gap you have not actually hit yet.</strong> The "
            "hypothetical scaling problem, the hypothetical traffic spike. Build for the load you "
            "have.",
            "<strong>Building your own version of everything.</strong> The trap runs both "
            "directions. \"Just build it yourself\" is not free, it is paid in time, and time is "
            "the one budget a student is also short on.",
        ]),

        ("quote", "A paid tool has to remove a specific hour I am currently losing, and I have to "
                  "be able to name the hour."),

        ("p", "On the last trap, honesty is worth more than a clean narrative. I have written my "
              "own security scanner and my own trading screener from scratch, and both cost real "
              "weeks I could have spent elsewhere. I think it was worth it, because I learned the "
              "domain I was scanning or trading well enough that I now own the tool instead of "
              "renting a black box. But I am not going to pretend that was free. It was paid for in "
              "time at a rate I did not track closely enough at the start, and if your deadline is "
              "measured in days rather than months, borrowing an existing library is often the "
              "financially correct move even though it costs money and building your own costs "
              "none."),

        ("h2", "The build stack, need by need"),

        ("table", (
            ["Need", "Free answer", "When paying is defensible"],
            [
                ["LLM inference", "Local model via Ollama, HTTP API", "Hard reasoning, long context, or anything published under your name"],
                ["Hosting", "GitHub Pages, static, custom domain", "You need server-side compute or a database, not just files"],
                ["Database / backend", "Client-side only, localStorage, offline", "Multiple users must share and sync live state"],
                ["Vulnerability data", "OSV.dev public API", "You need a commercial SLA or private advisory feeds"],
                ["Mobile distribution", "Installable PWA via browser share menu", "You need App Store search traffic or native APIs"],
                ["Monitoring / analytics", "Free-tier error logging, manual log review", "Traffic or paying users make blind spots expensive"],
                ["Package tooling", "uv for Python, Bun for JavaScript", "Basically never, both are free and fast at any scale"],
            ],
        )),

        ("h2", "How to evaluate any tool before you add it"),

        ("ol", [
            "Name the specific hour it removes. If you cannot name the hour, it is not solving a "
            "problem you have, it is solving a problem you might have.",
            "Check whether a local model or a free public API already does the job at acceptable "
            "quality. Acceptable, not perfect, for the volume tier of the work.",
            "Ask what happens at the free tier's ceiling. If the honest answer is \"I would have to "
            "pay anyway,\" decide that today instead of on the day you hit it.",
            "Check whether it wants a card before it gives you anything. If yes, put a cancellation "
            "date on your calendar the same minute you sign up.",
            "Estimate the build-it-yourself cost in actual hours, not enthusiasm. Compare that "
            "number, honestly, against the subscription price.",
            "If you are a team of one, reject seat-based pricing on sight unless the seat count is "
            "genuinely about to grow.",
        ]),

        ("h2", "What this stack has actually cost"),

        ("p", "In dollars: the Apple developer fee I chose not to pay, and that is close to the "
              "whole list. Everything else above is a laptop I already owned, electricity, and "
              "time. That is not a boast, it is a constraint speaking. I budget in tens of dollars, "
              "not hundreds, and a stack that bills nothing is the only kind of stack that survives "
              "a semester where the budget is that tight."),

        ("p", "It has cost time, and I want to be straight about where. Setting up local inference "
              "correctly took a weekend the first time. DIRA took real weeks. The client-side-only "
              "architecture is fast to build but has a ceiling I have already hit once, on a "
              "feature that genuinely needed shared state, and I chose to leave that feature out "
              "rather than add a backend for it. That is the honest tradeoff of free-first: it is "
              "not free of cost, it is free of billing, and those are different things that happen "
              "to look identical on a bank statement."),

        ("verdict", ("If you are building your first shipped thing", [
            "Start with the free-first version of every layer: local inference, static hosting, "
            "no backend, free public data, free security tooling, browser-installed distribution. "
            "It gets you further than it looks like it should.",
            "Then evaluate every paid addition against one test: name the specific hour it removes. "
            "If you cannot name the hour, you have not found a gap yet, you have found a want.",
        ])),

        ("p", "The full setup notes for the pieces above live in "
              "<a href=\"/guides/local-llm-ollama.html\">the local LLM guide</a>, "
              "<a href=\"/guides/client-side-only-tools.html\">the client-side-only tools guide</a>, "
              "and <a href=\"/guides/offline-pwa.html\">the offline PWA guide</a>. The rest of what "
              "I build with is on <a href=\"/stack.html\">the stack page</a>, and the free tools "
              "themselves are indexed at <a href=\"/everything.html\">everything I have shipped</a>."),
    ],
}
