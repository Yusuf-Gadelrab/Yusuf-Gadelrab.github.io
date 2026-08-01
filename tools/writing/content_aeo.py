POST = {
    "slug": "why-my-robots-txt-says-allow-to-ai-crawlers.html",
    "title": "Why my robots.txt says allow to AI crawlers",
    "headline": "Why my portfolio has a robots.txt block list for AI crawlers that says allow",
    "desc": "In mid-2026 everyone blocked GPTBot and ClaudeBot. I named 29 AI crawlers and allowed all of them. Here is the reasoning, and the part I can't measure.",
    "date": "2026-07-31",
    "keywords": [
        "robots.txt",
        "AI crawlers",
        "answer engine optimization",
        "GPTBot",
        "ClaudeBot",
        "Google-Extended",
        "llms.txt",
    ],
    "related": [
        ("/writing/i-spent-a-day-making-my-portfolio-readable-by-ai-instead-of-by-humans.html", "The implementation day this post explains the reasoning for"),
        ("/guides/ai-search-optimization.html", "AI search optimization guide"),
        ("/guides/rag-explained.html", "How RAG and retrieval actually work"),
        ("/about.html", "The answer-first bio these crawlers are reading"),
    ],
    "body": [
        ("lede", "Sometime in mid-2026, blocking AI crawlers became the default move. Every "
                 "week another site added a wall of Disallow rules for GPTBot, ClaudeBot, "
                 "PerplexityBot, the whole roster, usually with a post explaining that their "
                 "content was being stolen and they were done feeding the machine. I read a few "
                 "of those posts, opened my own robots.txt, and did the opposite."),

        ("p", "Mine now names about 29 AI and answer-engine user agents individually and "
              "allows every one of them. Not a wildcard shrug, a named list: GPTBot, "
              "OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-Web, Claude-User, "
              "Claude-SearchBot, anthropic-ai, PerplexityBot, Perplexity-User, "
              "Google-Extended, GoogleOther, Googlebot, Bingbot, Applebot, "
              "Applebot-Extended, meta-externalagent, meta-externalfetcher, FacebookBot, "
              "cohere-ai, cohere-training-data-crawler, DuckAssistBot, YouBot, Amazonbot, "
              "MistralAI-User, Diffbot, Timpibot, omgili, PetalBot. Every group ends the "
              "same way: <code>Allow: /</code>."),

        ("p", "This is a personal portfolio, not a media company, so the stakes and the "
              "reasoning are different from a publisher's. I still think the reasoning is "
              "worth writing down, including the part where I am not sure I got it right."),

        ("h2", "What actually changed, mechanically"),

        ("p", "The default state of my robots.txt used to be nothing special: a "
              "<code>User-agent: *</code> block, a couple of Disallow lines for utility "
              "pages, done. That is still in there. The only Disallow rules on the entire "
              "site are for <code>/offline.html</code>, <code>/404.html</code>, "
              "<code>/*?src=pwa</code>, and <code>/templates/</code>, which is a folder of "
              "live previews for a paid product that should never outrank the actual "
              "templates page in search. Everything else is open."),

        ("p", "What I added on top is the named block. And the reason a named block is not "
              "redundant with the wildcard is the part most people skip past when they are "
              "editing robots.txt in five minutes between other things: several of these "
              "agents look for a group that matches their own user agent by name before they "
              "ever fall back to <code>*</code>. If you only write rules under the wildcard, "
              "you are trusting that every crawler treats an unmatched name the same way. Some "
              "do. You cannot verify which ones from your own site, so writing the rule "
              "explicitly removes the guess."),

        ("h3", "Google-Extended and Applebot-Extended are not crawlers"),

        ("p", "This is the detail that made me rewrite the file instead of leaving it alone. "
              "Google-Extended and Applebot-Extended do not fetch your pages. Googlebot and "
              "Applebot already did that. Google-Extended and Applebot-Extended are usage "
              "controls: they gate whether content that was already crawled is allowed to "
              "feed AI answers and AI training, separately from whether it can be indexed for "
              "search at all."),

        ("p", "Which means disallowing them does nothing to your search visibility. Your "
              "pages still get crawled and indexed exactly as before. What it does is opt you "
              "out of showing up when the AI answer box tries to cite you. Allowing them is "
              "not a bigger risk than the wildcard already carries, it is a separate and much "
              "narrower decision that a lot of people are making by accident, either by "
              "copying a robots.txt template that blocks everything with \"AI\" in the name, "
              "or by not realizing these two directives exist at all."),

        ("h2", "Three jobs wearing three names"),

        ("p", "The other thing that got clearer once I sat down and listed every agent by "
              "name is that \"AI crawler\" is not one job. It is at least three, and they "
              "show up as different user agents on purpose:"),

        ("ul", [
            "<strong>Training crawlers.</strong> These fetch your pages to become part of a "
            "future model's training data. anthropic-ai and cohere-training-data-crawler are "
            "explicit about this in their names.",
            "<strong>Search-index crawlers.</strong> These build a retrieval index the model "
            "queries live, closer to how a search engine works than how training works. "
            "OAI-SearchBot and Claude-SearchBot are this category.",
            "<strong>User-triggered fetches.</strong> Someone asks an assistant a question "
            "right now, and the assistant fetches your specific page live to answer it. "
            "ChatGPT-User and Perplexity-User and Claude-User are this one, and it is the "
            "closest thing to a human clicking a link that AI crawling has.",
        ]),

        ("p", "Those are genuinely different transactions with different stakes. Feeding a "
              "training run happens once, gets baked into a model, and you get nothing back "
              "at the moment it happens. Showing up in a live answer to somebody's actual "
              "question is closer to a referral, even an invisible one. Blocking all three "
              "because you are annoyed at one of them, usually the training crawler, is the "
              "most common mistake I saw when I went looking at what other people's robots.txt "
              "files were doing. You can hold different opinions about training-use and "
              "answer-citation. Most robots.txt files, mine included until this rewrite, do "
              "not have the resolution to express that."),

        ("h2", "Why I opted in instead of copying the wall"),

        ("p", "My honest starting premise: nobody arrives at a personal portfolio site by "
              "accident. They arrive because a recruiter, a hiring manager, or a prospective "
              "client asked a question and something, increasingly an assistant rather than a "
              "search results page, pointed them here. If the answer engine cannot read me, I "
              "am not in the answer. Not ranked lower. Absent."),

        ("p", "So the site is built to be read by both audiences on purpose, and the robots.txt "
              "change is one piece of a larger pass I wrote up separately as "
              "<a href=\"/writing/i-spent-a-day-making-my-portfolio-readable-by-ai-instead-of-by-humans.html\">the "
              "day I made the portfolio readable by AI instead of by humans</a>. That post is "
              "the implementation log: the "
              "<a href=\"/about.html\">answer-first about page</a>, the plain-text "
              "<code>/llms.txt</code> index and the fuller <code>/llms-full.txt</code> "
              "profile, a <code>rel=\"alternate\"</code> link to the plain-text version on "
              "every page, one canonical JSON-LD Person node with a stable "
              "<code>@id</code> that ninety-plus pages all point back to instead of each page "
              "reading as an unrelated author, and an IndexNow ping after every deploy so "
              "search and answer engines see a change fast instead of waiting for the next "
              "crawl. This post is the argument for why any of that is worth doing. Go there "
              "for the how, stay here for the why."),

        ("p", "The case for opting out is not stupid, and I want to state it fairly instead of "
              "knocking down a strawman. If your content is the product, if people come to "
              "read the essay itself and that attention is how you make money or build an "
              "audience, then a model that reads your essay, answers the question, and never "
              "sends anyone to click through is a real loss. You did the work, the model got "
              "the value, you got nothing. That argument is correct for a lot of publishers "
              "and a lot of newsletters."),

        ("p", "It is not my situation. My pages are not the product, they are a proof-of-work "
              "index: a resume that shows receipts instead of adjectives, guides that show the "
              "formula instead of gesturing at it, an <a href=\"/everything.html\">everything "
              "index</a> and a <a href=\"/hire.html\">hire page</a> that exist so a recruiter or "
              "a client can verify a claim in under a minute. If a model reads that and answers "
              "\"does this guy actually know what he's talking about\" with a yes, sourced to "
              "me, that is the win condition. Nobody needed to click through to get value from "
              "that exchange. The click, if it happens, is a bonus on top of an outcome I "
              "already wanted."),

        ("quote", "The bet is that being quotable beats being scarce. For a portfolio, I think "
                  "that is true. For a content business, I do not think it is, and I would not "
                  "tell someone running one to copy this file."),

        ("h2", "The honest part: I cannot measure any of this"),

        ("p", "Here is where the post has to stop sounding confident. When an answer engine "
              "cites a page, it typically does not pass a referrer the way a normal browser "
              "click does. So if someone asks an assistant about me and it answers using my "
              "site, that event mostly does not show up in my analytics. I do not have a "
              "citation count. I do not have an impressions number from any AI answer surface. "
              "I do not have a before-and-after traffic comparison, because the mechanism this "
              "change is targeting is close to invisible to the tools I have."),

        ("p", "I want to be specific about what I am not claiming, because the easy failure "
              "mode here is to publish a build log about opening the crawlers up and quietly "
              "let the reader assume it worked. It might be doing nothing. It might be doing a "
              "lot. I do not currently have a way to tell the difference, and saying otherwise "
              "would be exactly the kind of unverifiable number I try not to put on this site."),

        ("h2", "What I would do differently"),

        ("p", "Three things, in hindsight."),

        ("ol", [
            "<strong>I treated 29 agents as one decision when they deserve at least two.</strong> "
            "Training-use and answer-citation are different transactions with different "
            "value exchanges, and I allowed both for every agent uniformly. A more careful "
            "version of this file would let the training crawlers through on the same "
            "reasoning I already apply to my own writing being public, while treating the "
            "search and user-triggered fetches as the higher-value group worth actively "
            "cultivating. I collapsed a two-variable decision into one Allow line.",
            "<strong>I shipped before I had a measurement plan.</strong> I made the change, "
            "then wrote this post, then noticed I have no way to check if it worked. The order "
            "should have been the reverse: figure out what signal would tell me this mattered, "
            "referral-adjacent language in inbound emails, a spike in direct traffic to deep "
            "pages with no obvious search-referral path, anything, before shipping the change "
            "that was supposed to produce it.",
            "<strong>The whole thing is an unproven bet.</strong> Being quotable beats being "
            "scarce is a reasonable-sounding sentence, but I have zero evidence for it "
            "specific to a personal site with no existing audience to leverage. It could be "
            "true. It could also be a rationalization for doing the easy thing, which is "
            "leaving the file open, instead of the effortful thing, which is writing a "
            "differentiated policy and then tracking it.",
        ]),

        ("h2", "The file itself"),

        ("p", "If you want to see it instead of trusting my summary, the live file is at "
              "<a href=\"/robots.txt\">/robots.txt</a>. The named block sits below the "
              "wildcard rules, ends in <code>Allow: /</code>, and the comments in the file say "
              "the same thing this post says, shorter. There is also a "
              "<a href=\"/guides/ai-search-optimization.html\">longer guide on answer-engine "
              "optimization</a> if you want the general playbook rather than my specific file, "
              "and a <a href=\"/guides/rag-explained.html\">guide to how retrieval and RAG "
              "actually work</a> if the mechanics of how a model decides what to fetch and cite "
              "are the part you are curious about."),

        ("verdict", ("The one line to take away", [
            "Blocking every AI crawler by reflex and allowing every AI crawler by reflex are "
            "the same mistake in opposite directions: neither one is a decision, both are a "
            "default dressed up as one.",
            "I named 29 agents and allowed all of them because my pages are a proof-of-work "
            "index, not a content business, so being cited is the win and the click is a "
            "bonus. I cannot measure whether it worked, and anyone building this file for a "
            "different kind of site should draw the training-versus-citation line somewhere "
            "other than where I drew mine.",
        ])),
    ],
}
