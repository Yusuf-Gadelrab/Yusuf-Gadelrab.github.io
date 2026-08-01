POST = {
    "slug": "robustness-test-on-my-trading-strategy-and-it-failed.html",
    "title": "My trading strategy failed its robustness test",
    "headline": "I ran a robustness test on my own trading strategy and it failed",
    "desc": "Positive expectancy is not an edge. A risk-matched random entry captured most of mine, and what was left had a confidence interval crossing zero.",
    "date": "2026-07-31",
    "keywords": [
        "robustness testing",
        "random entry benchmark",
        "walk-forward testing",
        "expectancy",
        "R-multiple",
        "anchored VWAP",
    ],
    "related": [
        ("/guides/walk-forward-backtest.html", "Walk-forward testing and lookahead bias: how backtests lie"),
        ("/guides/r-multiple-expectancy.html", "R-multiple and expectancy, explained with the formulas"),
        ("/guides/paper-to-live-trading.html", "Going from paper trading to live, without lying to yourself"),
        ("/swing-screener.html", "The swing screener this was tested on"),
    ],
    "body": [
        ("lede", "The number I was proud of survived a walk-forward test, a ten-year universe, and "
                 "nearly five thousand trades. Then I ran one more test, the one almost nobody runs, "
                 "and it took most of the number away."),

        ("p", "This is the writeup of that second test. I am publishing it because the first "
              "version of this result is the kind of thing people put in a pinned post, and the "
              "second version is the kind of thing people quietly delete."),

        ("h2", "What I was actually testing"),

        ("p", "I spent months building swing trading setups and then testing them properly, which "
              "in practice means testing them until they stop working. Three candidates made it far "
              "enough to be measured seriously:"),

        ("ul", [
            "<strong>A gap and opening range breakout proxy</strong>, run on daily bars. The classic "
            "day trading structure, approximated at a resolution I could test across a decade.",
            "<strong>VCP</strong>, the volatility contraction pattern. This is the one I wanted to "
            "work, because the literature around it is genuinely beautiful and because it is the "
            "setup that made me want to build a screener in the first place.",
            "<strong>An anchored VWAP reclaim</strong>. Price loses the anchored volume weighted "
            "average price from a defined event, then takes it back.",
        ]),

        ("p", "Everything is measured in R, where 1R is the amount risked from entry to the stop. "
              "Expectancy is the average R per trade. If you want the arithmetic behind that, I wrote "
              "it out in the <a href=\"/guides/r-multiple-expectancy.html\">R-multiple and expectancy "
              "guide</a>. The short version: expectancy is the only performance number that does not "
              "care how big your account is, which is why it is the only one I trust from a student "
              "with a small one."),

        ("h2", "Round one: walk-forward"),

        ("p", "Walk-forward testing means you fit on a window, test on the window after it, roll "
              "forward, and repeat, so the model never sees the data it is graded on. It is the "
              "minimum bar. It is not a high bar. I wrote up the mechanics and the specific ways "
              "backtests lie in the <a href=\"/guides/walk-forward-backtest.html\">walk-forward "
              "guide</a>."),

        ("table", (
            ["Setup", "Walk-forward result", "Decision"],
            [
                ["Gap / opening range breakout proxy", "Negative expectancy, -0.28R", "Ruled out"],
                ["VCP", "Roughly breakeven", "Not tradeable"],
                ["Anchored VWAP reclaim", "Positive expectancy", "Survivor"],
            ],
        )),

        ("p", "Losing the gap proxy did not hurt. Losing VCP did. That was the setup I had read the "
              "most about, drawn the most charts of, and quietly assumed I would end up trading. "
              "Breakeven is a specific kind of insult: it is not wrong enough to be interesting and "
              "not right enough to use."),

        ("p", "So I had one survivor, and I ran it across a proper universe: 129 symbols, ten years, "
              "4,933 trades. Expectancy came out at <strong>+0.117R</strong>, with a 95% confidence "
              "interval of <strong>+0.057R to +0.174R</strong>. The whole interval sits above zero. "
              "An earlier version of this result came from a far smaller sample and a much prettier "
              "number, and the bigger sample cut it down. That is what bigger samples do, and I have "
              "retired the old figure everywhere it appeared."),

        ("p", "At that point I had what most retail writeups would call an edge. Positive expectancy, "
              "large sample, tight enough interval, out-of-sample tested. I nearly stopped there."),

        ("h2", "The test almost nobody runs"),

        ("p", "Here is the question I could not put down. My strategy has two parts: a signal that "
              "says when to enter, and a risk structure that says how much to risk, where the stop "
              "goes, and when to get out. When the whole thing makes +0.117R, which part earned it?"),

        ("p", "The way to find out is to keep the risk structure and destroy the signal. Enter at "
              "random. Same universe, same position sizing, same stop distance, same exit logic, "
              "same number of trades. The only thing removed is the reason for entering."),

        ("p", "That risk-matched random entry captured <strong>+0.086R</strong>."),

        ("quote", "A random entry with my risk rules kept roughly three quarters of the "
                  "expectancy that I had been attributing to my signal."),

        ("p", "Subtract, and the signal's own contribution is <strong>+0.030R</strong>, with a "
              "confidence interval that crosses zero. Crossing zero is the part that matters. It "
              "means the data I have cannot rule out that the signal contributes nothing at all, "
              "and that everything the system earned came from the risk management wrapped around it."),

        ("h2", "Why this is not a technicality"),

        ("p", "A confidence interval that crosses zero is not a slightly weaker result. It is a "
              "different category of result. \"Probably positive, magnitude uncertain\" and \"cannot "
              "distinguish from nothing\" are not neighbours."),

        ("p", "And notice what the random benchmark implies about the original number. The +0.117R "
              "was real. It was measured correctly, out of sample, over a large sample. It just was "
              "not evidence of what I thought it was evidence of. Beating zero and beating a "
              "benchmark are different tests, and almost every published retail edge only runs the "
              "first one."),

        ("p", "This is the same failure mode as a drug trial with no placebo arm. Patients got "
              "better. Nobody checked whether they would have gotten better anyway."),

        ("h2", "Two filters I was certain would help"),

        ("p", "Before the random test, I had also tried to improve the survivor with two filters that "
              "every book recommends. A market regime filter, so the system only trades when the "
              "broad market is healthy. And a new market leader filter, restricting entries to names "
              "showing leadership characteristics."),

        ("p", "Both are intuitively obvious. Both are standard advice. Both made expectancy worse on "
              "my own data, so I removed them. That result surprised me more than the random "
              "benchmark did, and it taught me something specific: advice that is universally "
              "repeated is not thereby tested, and it is definitely not tested on your setup, your "
              "universe, and your holding period."),

        ("h2", "What I actually did about it"),

        ("p", "I did not delete the system. A +0.030R signal contribution that cannot be "
              "distinguished from zero is not proof of no edge, it is proof of insufficient evidence. "
              "Those are different, and the correct response to insufficient evidence is to gather "
              "more of it under conditions where being wrong is cheap."),

        ("p", "So the engine has a promotion gate, and the gate lives in the code rather than in my "
              "judgment: no live broker connection until 60 closed paper trades with positive "
              "realized expectancy. There is an override environment variable, because a gate with no "
              "documented override just gets edited out at 2am, and an override that logs a warning "
              "is at least honest about what you are doing."),

        ("p", "Current count of closed paper trades: zero. The paper engine has been running dry "
              "because the broker keys were never dropped in. I could pretend that was discipline. It "
              "was not, it was a config gap, and I would rather say so than construct a story about "
              "patience. I wrote up the full promotion sequence in the "
              "<a href=\"/guides/paper-to-live-trading.html\">paper to live trading guide</a>, and "
              "the journal I log trades in is a free "
              "<a href=\"/apps/tradelog/\">offline R-multiple app</a> with no account and no backend."),

        ("h2", "How to run this test on your own system"),

        ("p", "This is the part worth stealing. It takes an afternoon and it is the highest value "
              "afternoon you will spend on a strategy."),

        ("ol", [
            "<strong>Express results in R, not dollars or percent.</strong> Otherwise position sizing "
            "quietly contaminates the performance number and you cannot separate the two effects.",
            "<strong>Build the random arm properly.</strong> Same universe, same bar frequency, same "
            "stop distance distribution, same exit rules, same trade count, same date range. If your "
            "random arm risks differently than your real arm, you have benchmarked nothing.",
            "<strong>Run it many times.</strong> One random seed is an anecdote. Run enough "
            "repetitions to get a distribution, then compare against that distribution rather than "
            "against a single run.",
            "<strong>Report the difference, with an interval.</strong> Strategy expectancy minus "
            "benchmark expectancy, with a confidence interval on the difference. That number, not "
            "the headline expectancy, is your actual claim.",
            "<strong>Decide the gate before you see the answer.</strong> Write down what result "
            "would make you trade it and what result would make you stop, while you still do not "
            "know which one you are about to get.",
        ]),

        ("h2", "Why publish a failure"),

        ("p", "Because the absence of negative results is exactly why retail traders keep "
              "rediscovering the same dead ideas. If every writeup you read is a winner, you conclude "
              "that finding winners is easy, and then you interpret your own losses as a personal "
              "failing rather than as the base rate."),

        ("p", "There is also a selfish reason. I am a computer science student applying to quant and "
              "software internships, and I would rather be the candidate who ran the placebo arm on "
              "his own work than the candidate with a prettier number and no benchmark. One of those "
              "survives a follow-up question."),

        ("verdict", ("The one line to take away", [
            "Positive expectancy that beats zero is not an edge. Positive expectancy that beats a "
            "risk-matched random entry, with a confidence interval that stays above zero, is a "
            "candidate for one.",
            "If you have never run the second test on your own strategy, you do not yet know which "
            "half of your system is working.",
        ])),

        ("p", "The full walk-forward writeup, including what happened to VCP and the filters, is in "
              "<a href=\"/writing/i-spent-months-building-trading-strategies-and-then-published-the-resu.html\">the "
              "earlier post on what walk-forward did to my strategies</a>. The screener itself, the "
              "position sizer, and the free risk tools are on "
              "<a href=\"/risk-tools.html\">the risk tools page</a>."),

        ("note", ("Not financial advice", [
            "Everything here describes historical testing on historical data. Nothing on this page is "
            "a recommendation to trade anything. Backtested results are not predictive, the system "
            "described has never been run with real money, and I am a student publishing his own "
            "research, not an advisor.",
        ])),
    ],
}
