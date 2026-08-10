import React, { useState, useEffect, useRef, useCallback } from 'react';

/*
  =====================================================================
  YUSUF GADELRAB — PORTFOLIO
  =====================================================================
  started this as a weekend thing, ended up spending way more time
  than I planned. worth it though — beats a google doc resume.

  HOW TO EDIT:
  1. EASY WAY: Click the "Edit" button (bottom-right), make changes,
     then click "Export Data" to copy the new JSON. Paste it over the
     `siteData` object below and redeploy. (localStorage edits only show
     on YOUR browser until you export + redeploy — read the note in chat.)
  2. CODE WAY: Edit the `siteData` object below directly.

  TO ADD A PHOTO: paste an image URL into any "image" field (see Gallery
  guide in chat for grabbing Instagram/Hudl URLs).
  TO ADD A BLOG POST: use the admin panel's Blog section, or add an
  object to siteData.blog.posts.
  =====================================================================
*/

// all my actual info lives here — just change this object and redeploy, nothing else to touch
const siteData = {
  brand: {
    name: 'Yusuf Gadelrab',
    initials: 'YG',
    role: 'Computer Science @ SJSU',
  },
  home: {
    eyebrow: 'Computer Science · AI/ML · Quantitative Finance',
    headline: 'I build AI systems for markets and classrooms.',
    highlight: 'AI systems',
    sub:
      'CS undergraduate at San José State University. I co-authored a peer-reviewed ACM SIGCSE 2026 paper, built an NLP equity-scoring model on IBM Watson, and trade equities, options, and futures on the side. I care about turning noisy data into signals you can actually defend.',
    availability: 'Wrapped my HwyHaul internship · July 2026 — building in public & open to what’s next',
    heroImage: '/img/yusuf-headshot.webp',
    stats: [
      { value: '78%', label: 'Model directional accuracy · 6-mo backtest' },
      { value: '60', label: 'Research study participants' },
      { value: '40%', label: 'Web engagement lift · SVEC' },
      { value: '+0.117R', label: 'Walk-forward result over 4,933 trades, 129-symbol 10-yr universe (95% CI +0.057-+0.174; mostly market drift)' },
    ],
  },
  now: {
    intro: 'A snapshot of what I’m focused on right now.',
    items: [
      'Just wrapped my software engineering internship at HwyHaul (July 2026) — shipped an AI load-intake pipeline and a full billing/AR automation suite before I left. The whole build is written up in the case study on the Projects page.',
      'On a new journey: taking what I learned in freight and building for myself — FreightDesk AI for brokers, a digital-products store, and shipping something in public every week.',
      'Building Founder AI: an app that turns founders’ raw footage into ready-to-post clips with Whisper, ffmpeg, and a local LLM.',
      'Running technical operations and the web presence for the Silicon Valley Entrepreneurship Club.',
      'Continuing inclusive-computing research at the SJSU CSEd Research Lab.',
      'Sharpening swing-trading systems — setup logging, R-multiple journaling, and backtesting discipline.',
    ],
  },
  about: {
    bio: [
      "I study CS at San José State (graduating 2028) and spend most of my time where AI/ML and finance overlap — building models, running backtests, and trading my own account in equities, options, and futures.",
      "On the research side, I co-authored a paper at ACM SIGCSE 2026 on bilingual coding education and presented a second poster on LLM-driven curriculum mapping. The IBM project is probably the best example of my technical work right now: an NLP model that pulls sentiment from 50+ live market sources daily and scores equities across five factors — 78% directional accuracy on six-month backtests.",
      "Outside of that, I grew up between cultures (Arabic is my first language), played varsity football and wrestled, and spoke at my graduation. I tend to approach things the same way I competed — show up prepared and go hard.",
    ],
    education: [
      {
        school: 'San José State University',
        detail: 'B.S. Computer Science',
        meta: 'Expected May 2028',
        note: 'Coursework: Data Structures & Algorithms, Discrete Mathematics, Object-Oriented Programming (Java/Python).',
      },
      {
        school: 'Lynbrook High School',
        detail: 'Valedictorian — 4.0 GPA · Graduation Speaker',
        meta: 'Class of 2024',
        note: 'Varsity Football (WR / RB / OLB) · League MVP. Wrestling. Selected Poster Student 2023–24 alongside Andrew Li. Combines: 4.7s 40-yd, 255 bench, 315 squat.',
      },
    ],
    recognition: [
      {
        outlet: 'The Lynbrook Epic',
        title: 'Poster Student — honored at Feb. 27 board meeting',
        quote: '"He is an ideal athlete due to his competitiveness without being selfish and his humility to seek rehabilitation when he is injured instead of hiding his injuries." — Scott Leveau, Athletic Trainer',
        link: 'https://lhsepic.com/50933/news/teachers-and-students-honored-at-feb-27-board-meeting/',
        year: '2024',
      },
      {
        outlet: 'The Lynbrook Epic',
        title: 'Graduation Speaker — Class of 2024 ceremony',
        quote: 'Delivered a commencement address to the Class of 2024 alongside co-speaker Anshul Singh before the FUHSD Superintendent and Board Trustee.',
        link: 'https://lhsepic.com/52925/web-exclusive/class-of-2024-graduation-ceremony/',
        year: '2024',
      },
    ],
    skills: [
      { group: 'AI / ML', items: ['LLMs', 'NLP', 'Machine Learning', 'IBM Watson Studio', 'Financial Sentiment Analysis', 'RAG'] },
      { group: 'Quant / Markets', items: ['Equities', 'Options', 'Futures', 'Backtesting', 'Quantitative Modeling', 'Signal Design'] },
      { group: 'Programming', items: ['Python', 'Java', 'JavaScript', 'SQL'] },
      { group: 'Web & Tools', items: ['React', 'FastAPI', 'Ollama / Local LLMs', 'Full-Stack Dev', 'Git / GitHub', 'Hedy'] },
      { group: 'Research', items: ['Survey Design', 'Mixed-Methods Analysis', 'Statistical Analysis', 'IRB Protocol', 'Data Visualization', 'HCI'] },
      { group: 'Languages', items: ['Arabic (Native)', 'English (Fluent)'] },
    ],
  },
  experience: [
    {
      title: 'Software Engineering Intern',
      org: 'HwyHaul (freight-tech startup)',
      meta: 'May – Jul 2026 · Internship · Completed',
      tag: 'AI / Backend',
      image: '',
      bullets: [
        'Built an AI load-intake pipeline (FastAPI + local LLM) that turns carrier WhatsApp messages and emails into structured load requests with per-field confidence gating.',
        'Automated the billing/AR back office: POD verification, portal-vs-TMS rate reconciliation, advance deductions, the 30-day payment clock, and weekly AR recovery runs — covered by 77 automated tests.',
        'Shipped per-customer document packaging that normalizes POD/invoice PDFs to each TMS portal’s requirements, plus LLM-drafted carrier and customer emails reviewed by the billing team.',
      ],
    },
    {
      title: 'Technical Operations & Web Lead',
      org: 'Silicon Valley Entrepreneurship Club',
      meta: 'Dec 2025 – Present · Internship',
      tag: 'Engineering / Ops',
      image: '',
      bullets: [
        'Engineered and deployed the club\u2019s official website end-to-end, boosting monthly visitor engagement 40% via optimized UI/UX and full-stack performance.',
        'Secured 4 corporate technology sponsors, expanding the operational budget 35% through partnership pitching and negotiation.',
        'Grew social following 30% and event attendance 25% with cross-channel campaigns across 3 platforms.',
        'Coordinated 6+ events for 150+ attendees end-to-end \u2014 venue logistics, speaker booking, and live execution.',
      ],
    },
    {
      title: 'AI/ML Developer',
      org: 'IBM SkillsBuild AI Experiential Learning Lab',
      meta: 'Jan 2026 – May 2026',
      tag: 'AI / ML',
      image: '',
      bullets: [
        'Built an NLP equity-scoring model with IBM Watson that ingests sentiment from 50+ live market sources daily and generates signals across 5 quantitative factors — 78% directional accuracy on 6-month backtests.',
        'Cut manual equity-research time ~60% by engineering an automated signal-generation pipeline on IBM Watson Studio, applying supervised and unsupervised ML to structured financial data.',
        'Earned IBM AI Fundamentals credentials in NLP, model evaluation, and responsible AI design.',
      ],
    },
    {
      title: 'Undergraduate Researcher',
      org: 'SJSU CSEd Research Lab',
      meta: '2024 – Present',
      tag: 'Research',
      image: '',
      bullets: [
        'Measured statistically significant pre-to-post gains in programming confidence across 60 SJSU students by co-designing and analyzing pre/post surveys for a bilingual programming workshop on the Hedy multilingual platform; novice learners gained significantly more than experienced ones.',
        'Expanded CS accessibility for underrepresented learners by facilitating 3+ inclusive-computing workshops and conducting qualitative research on structural barriers.',
      ],
    },
    {
      title: 'Curriculum & Workshop Lead',
      org: 'Coding Warriors, SJSU',
      meta: '2024 – Present',
      tag: 'Teaching',
      image: '',
      bullets: [
        'Boosted weekly participation 20% by designing 5+ challenge-based programming events with novel formats spanning all skill levels.',
        'Improved beginner outcomes by facilitating 10+ Python and Java workshops for 30+ students, translating advanced concepts into accessible formats.',
      ],
    },
    {
      title: 'Board Treasurer',
      org: 'Kappa Sigma Fraternity, SJSU',
      meta: 'Aug 2025 – Present',
      tag: 'Leadership',
      image: '',
      bullets: [
        'Optimized operations for 50+ members by centralizing communication and scheduling, improving cross-board alignment.',
        'Executed 10+ large-scale events by coordinating cross-functional teams under tight deadlines.',
        'Maintained 100% university compliance by enforcing safety protocols and risk policies.',
      ],
    },
    {
      title: 'House Improvement Chair',
      org: 'Kappa Sigma Fraternity, SJSU',
      meta: 'Aug 2024 – Jan 2025',
      tag: 'Leadership',
      image: '',
      bullets: [
        'Delivered 5+ facility-improvement projects on time and within budget, coordinating with 3+ vendors.',
        'Developed space-optimization plans and sustainable maintenance schedules aligned to programming.',
      ],
    },
  ],
  research: [
    {
      title: 'Exploring Bilingual Coding for Inclusive Computer Science Learning',
      venue: 'SIGCSE TS 2026 · ACM · pp. 1559–1560',
      role: 'Co-Author',
      image: '',
      link: 'https://dl.acm.org/doi/10.1145/3770761.3777339',
      abstract:
        'Investigated how bilingual programming workshops influence student attitudes, perceived understanding, and comfort. Across 60 SJSU participants (40 novice, 20 experienced) using the multilingual Hedy platform, novice learners showed the largest gains in confidence and enjoyment. Contributed to survey design and mixed-methods analysis; pre-to-post gains in confidence, computing identity, enjoyment and motivation were statistically significant.',
      citation:
        'Tshukudu, E., Shah, N., Kieu, T., Deeb, L., Venkateswaran, H., Ghai, A., Gadelrab, Y., & Hada, P. (2026). "Exploring Bilingual Coding for Inclusive Computer Science Learning." SIGCSE TS 2026, ACM. doi.org/10.1145/3770761.3777339',
    },
    {
      title: 'Adaptive Curriculum Maps: Graph-Augmented Retrieval-Oriented LLMs for Education',
      venue: 'SIGCSE TS 2026 · ACM · St. Louis, MO',
      role: 'Poster Co-Presenter',
      image: '',
      link: '',
      abstract:
        'Co-presented research on using graph-augmented retrieval with large language models to generate adaptive curriculum maps, exploring how LLMs can personalize and structure educational pathways.',
      citation:
        'Bainapalepu, S., Mondal, M., Desai, J., Bathula, K., & Gadelrab, Y. (2026). "Adaptive Curriculum Maps: Graph-Augmented Retrieval-Oriented LLMs for Education." Poster, SIGCSE TS 2026, ACM, Feb 2026.',
    },
  ],
  projects: [
    {
      title: 'Modeling & Creator Portfolio',
      stack: 'Athletic/Commercial · 650K+ IG Views/30d · San Jose',
      image: process.env.PUBLIC_URL + '/img/yusuf-candid.webp',
      link: process.env.PUBLIC_URL + '/modeling.html',
      linkLabel: 'View portfolio & digitals →',
      desc:
        'The other side of the grind: athletic and commercial modeling built on a documented 260→200 lb transformation, all filmed. Digitals, measurements, and booking on one page — plus a creator media kit for brands who want the reach (@_kxng_sef, 650K+ views in the last 30 days).',
    },
    {
      title: 'Automation Studio — Software & Template Store',
      stack: '6 Products · Local LLM · Live Now',
      image: '',
      link: process.env.PUBLIC_URL + '/store.html',
      linkLabel: 'Visit the store →',
      desc:
        'My product studio: FreightDesk (an AI AR/billing assistant for freight brokers), a Python automation kit, a Next.js 16 SaaS boilerplate, a swing-trade screener, a local-AI cold outreach engine, and the Midnight Gold template vault. Solo builder, real products, launch pricing live now.',
    },
    {
      title: 'FreightDesk AI — AR/Billing Copilot for Freight Brokers',
      stack: 'Local LLM (Ollama) · Python · Zero API Cost',
      image: '',
      link: process.env.PUBLIC_URL + '/freightdesk.html',
      linkLabel: 'Visit FreightDesk →',
      privateRepo: true,
      desc:
        'My flagship product — an AI back-office clerk freight brokerages install on their own machine, now taking founding-client pilots ($999 setup + $249/mo). It drafts POD-chasing, dispute, reconciliation, and past-due emails with a local LLM — no per-seat SaaS fees, no metered API bills.',
    },
    {
      title: 'DHAHAB Studio · Productized Services',
      stack: 'Launch Sites · Security Audits · Automation Builds',
      image: '',
      link: process.env.PUBLIC_URL + '/services.html',
      linkLabel: 'See the services →',
      desc:
        'Three fixed-scope builds for early founders: a conversion-ready launch site live in about a week, a DIRA-powered Shield Audit with a scored report in 48 hours, and an AI automation build shipped with a QC gate and a runbook. One builder end to end, founding cohort open now.',
    },
    {
      title: 'HwyHaul LoadLink — AI Freight Back Office',
      stack: 'FastAPI · Local LLM (Ollama) · SQLAlchemy',
      image: '',
      link: process.env.PUBLIC_URL + '/hwyhaul.html',
      linkLabel: 'Explore the case study →',
      privateRepo: true,
      desc:
        'The internship build (May–Jul 2026): AI intake for carrier WhatsApp/email load requests plus a billing & AR automation suite — POD verification, rate reconciliation, payment-clock tracking, document packaging per customer TMS, and LLM-drafted carrier emails. 77 automated tests.',
    },
    {
      title: 'EventReels — Your Night, Already Edited',
      stack: 'Python · ffmpeg · FastAPI · Scene + Audio Analysis',
      image: process.env.PUBLIC_URL + '/projects/eventreels.webp',
      link: process.env.PUBLIC_URL + '/eventreels.html',
      linkLabel: 'Explore the case study →',
      privateRepo: true,
      desc:
        'Drop in raw event footage, get back a finished 9:16 highlight reel. The pipeline watches (scene-change detection) and listens (per-half-second loudness) to find the best moments, then cuts a vertical reel normalized to -14 LUFS for IG/TikTok. 100% local, zero API keys, zero Python dependencies — just ffmpeg. CLI plus a gold/black web studio with a live four-stage pipeline view.',
    },
    {
      title: 'EdgeLog — Your Edge as a Number, Not a Vibe',
      stack: 'FastAPI · SQLite · SVG Charts · Quant Metrics',
      image: process.env.PUBLIC_URL + '/projects/edgelog.webp',
      link: 'https://github.com/Yusuf-Gadelrab/edgelog',
      linkLabel: 'View on GitHub →',
      desc:
        'A trade journal analyzer I run my own trades through: import a CSV, get expectancy in R, win rate, profit factor, max drawdown, an animated equity curve, R distribution, and a per-setup edge table with a plain-English verdict on whether you actually have an edge.',
    },
    {
      title: 'EcoImpact — Fix the World, See the Proof',
      stack: 'FastAPI · Leaflet · OpenStreetMap · SQLite',
      image: process.env.PUBLIC_URL + '/projects/ecoimpact.webp',
      link: process.env.PUBLIC_URL + '/ecoimpact.html',
      linkLabel: 'Explore the case study →',
      privateRepo: true,
      desc:
        'A trash map with a "world fixed" meter: report litter, claim cleanups, log daily eco actions, and watch quantified impact (kg waste diverted, kg CO₂e avoided) climb — with streaks and a campus leaderboard. EPA/DOE-based impact factors; user GPS never collected.',
    },
    {
      title: 'swing-screener — Setups as Numbers, Not Gut Feel',
      stack: 'Python · pandas · uv · Backtest Harness',
      image: '',
      link: 'https://github.com/Yusuf-Gadelrab/swing-screener',
      linkLabel: 'View on GitHub →',
      privateRepo: false,
      desc:
        'A swing-trading screener that scans OHLC price history for three classic setups — anchored-VWAP reclaim, VCP contraction, and opening-range breakout — and flags candidates instead of me eyeballing charts. A built-in backtest harness replays each setup over historical data and reports hit-rate and expectancy in R, so a pattern earns its place by the numbers or gets cut. Finance-aware, stdlib-and-pandas light, packaged with uv.',
    },
    {
      title: 'Founder AI — Auto Video Editor for Founders',
      stack: 'FastAPI · Expo / React Native · Whisper · ffmpeg',
      image: '',
      link: '',
      privateRepo: true,
      desc:
        'Records a founder’s day and turns raw footage into ready-to-post clips: Whisper transcription, LLM highlight selection in the founder’s own voice, frame-accurate ffmpeg cuts, async job pipeline, per-user rate limits, and Stripe billing.',
    },
    {
      title: 'JobPilot — AI Job-Application Automation',
      stack: 'Next.js · React · TypeScript · Prisma · .NET',
      image: '',
      link: '',
      privateRepo: true,
      desc:
        'A full-stack app that takes the grind out of applying: it parses a job posting, matches it against a stored profile, and drafts a tailored application so the candidate edits instead of starting from a blank page. I contribute on a React 19 / Next.js front end with type-safe forms and validation, a Prisma data layer, and a .NET service tier — a real production-shaped codebase, not a toy.',
    },
    {
      title: 'NLP Equity-Scoring Model',
      stack: 'IBM Watson · NLP · Python',
      image: '',
      link: '',
      privateRepo: true,
      desc:
        'Ingests sentiment from 50+ live market sources daily and scores equities across five quantitative factors, with an automated signal pipeline on IBM Watson Studio. 78% directional accuracy on six-month backtests; ~60% less manual research time.',
    },
    {
      title: 'Silicon Valley Entrepreneurship Club — Official Site',
      stack: 'Web · UX · Deployment',
      image: '',
      link: 'https://sventclub.org/',
      desc:
        'Built and shipped the club’s official website end-to-end and ran its digital presence — a 40% lift in monthly visitor engagement, plus four corporate sponsors and a 25% rise in event attendance.',
    },
    {
      title: 'Data Structures & Algorithms (Java)',
      stack: 'Java · OOP · Unit Testing',
      image: '',
      link: '',
      privateRepo: true,
      desc:
        'Core data structures (arrays, lists, trees, graphs) and algorithms implemented with an emphasis on clean OOP design, exception handling, and test coverage.',
    },
  ],
  gallery: [
    { image: '/img/gallery/lynbrook-feature.webp', caption: 'Featured — Lynbrook High “Meet Our Students”', category: 'Recognition' },
    { image: '/img/gallery/santa-cruz-dusk.webp', caption: 'Santa Cruz Mountains at dusk', category: 'Off the clock' },
    { image: '/img/gallery/pacific-coast.webp', caption: 'Pacific Coast, California', category: 'Off the clock' },
    { image: '/img/gallery/lunar-halo.webp', caption: 'Lunar halo over the South Bay', category: 'Off the clock' },
  ],
  blog: {
    intro:
      'Essays on CS education, AI/ML, and the road from athlete to engineer. New writing is on the way.',
    posts: [
      // No posts yet. Add via the Edit panel or push objects here:
      // { title: '...', date: 'May 2026', summary: '...', body: '...', image: '' }
    ],
  },
  contact: {
    blurb:
      "Always interested in strong research collaborations, technically ambitious engineering projects, and good conversations about markets and data.",
    email: 'yusuf.gadelrab06@gmail.com',
    phone: '(669) 328-1148',
    links: [
      { label: 'LinkedIn', url: 'https://www.linkedin.com/in/yusuf-gadelrab-76246b221' },
      { label: 'GitHub', url: 'https://github.com/Yusuf-Gadelrab' },
      { label: 'Instagram', url: 'https://www.instagram.com/_kxng_sef/' },
      { label: 'Hudl', url: 'https://www.hudl.com/profile/18612951/Yusuf-Gadelrab' },
    ],
  },
  resume: {
    // After deploy, drop both PDFs in /public and these paths resolve.
    // Apex domain (yusuf-gadelrab.github.io): use '/Yusuf_Gadelrab_CS.pdf'
    // Project path (…github.io/yusuf-portfolio): prefix '/yusuf-portfolio/…'
    files: [
      { label: 'Software / AI résumé', url: '/Yusuf_Gadelrab_CS.pdf', b64: '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h4b+Nb7F0N9KDP0Nckv6G8SU9K/hWab+r8H030kM/Y3EJH/0rUz+cCvpX67l0abXieeL+fozFqq7hxBHQoZQZgFTMIz+75zO04ws+f0Gu47sIgplbmRzdHJlYW0KZW5kb2JqCgoxMTEgMCBvYmoKPDwvVHlwZS9Gb250L1N1YnR5cGUvVHJ1ZVR5cGUvQmFzZUZvbnQvQkFBQUFBK0xpYmVyYXRpb25TYW5zLUJvbGQKL0ZpcnN0Q2hhciAwCi9MYXN0Q2hhciA1NQovV2lkdGhzWzAgNjY2IDYxMCA1NTYgMzMzIDI3NyA3NzcgNTU2IDYxMCA1NTYgMjc3IDM4OSA2MTAgNjY2IDcyMiA4MzMKNzIyIDcyMiA2NjYgNjY2IDY2NiAyNzcgNzIyIDcyMiA2MTAgNTU2IDYxMCA2MTAgMjc3IDc3NyA2MTAgMzMzCjYxMCA3MjIgOTQzIDYxMCA2MTAgMjc3IDcyMiA1NTYgODg5IDU1NiA3MjIgNjY2IDcyMiA1NTYgNjEwIDMzMwozMzMgMjc5IDU1NiA1NTYgMjc3IDI3NyA3MjIgMzMzIF0KL0ZvbnREZXNjcmlwdG9yIDEwOSAwIFIKL1RvVW5pY29kZSAxMTAgMCBSCj4+CmVuZG9iagoKMTEyIDAgb2JqCjw8L0YxIDExMSAwIFIvRjIgMTAxIDAgUi9GMyAxMDYgMCBSCj4+CmVuZG9iagoKMTEzIDAgb2JqCjw8Ci9Gb250IDExMiAwIFIKL1Byb2NTZXRbL1BERi9UZXh0XQo+PgplbmRvYmoKCjEgMCBvYmoKPDwvVHlwZS9QYWdlL1BhcmVudCA5NiAwIFIvUmVzb3VyY2VzIDExMyAwIFIvTWVkaWFCb3hbMCAwIDYxMiA3OTJdL1RhYnMvUwovU3RydWN0UGFyZW50cyAwCi9Db250ZW50cyAyIDAgUj4+CmVuZG9iagoKNSAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvU3RhbmRhcmQKL1AgNCAwIFIKL1BnIDEgMCBSCi9BIDw8L08vTGF5b3V0L1BsYWNlbWVudC9CbG9jawovVGV4dEFsaWduL0NlbnRlcgo+PgovS1swIF0KPj4KZW5kb2JqCgo2IDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9TdGFuZGFyZAovUCA0IDAgUgovUGcgMSAwIFIKL0EgPDwvTy9MYXlvdXQvUGxhY2VtZW50L0Jsb2NrCi9TcGFjZUJlZm9yZSAwLjAyCi9UZXh0QWxpZ24vQ2VudGVyCj4+Ci9LWzEgXQo+PgplbmRvYmoKCjcgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL1N0YW5kYXJkCi9QIDQgMCBSCi9QZyAxIDAgUgovQSA8PC9PL0xheW91dC9QbGFjZW1lbnQvQmxvY2sKL1NwYWNlQmVmb3JlIDAuMDkKL1NwYWNlQWZ0ZXIgMC4wNgo+PgovS1syIF0KPj4KZW5kb2JqCgo4IDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9TdGFuZGFyZAovUCA0IDAgUgovUGcgMSAwIFIKL0EgPDwvTy9MYXlvdXQvUGxhY2VtZW50L0Jsb2NrCi9TcGFjZUJlZm9yZSAwLjAzNAo+PgovS1szIDQgNSBdCj4+CmVuZG9iagoKOSAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvU3RhbmRhcmQKL1AgNCAwIFIKL1BnIDEgMCBSCi9BIDw8L08vTGF5b3V0L1BsYWNlbWVudC9CbG9jawovU3BhY2VCZWZvcmUgMC4wOQovU3BhY2VBZnRlciAwLjA2Cj4+Ci9LWzYgXQo+PgplbmRvYmoKCjEwIDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9TdGFuZGFyZAovUCA0IDAgUgovUGcgMSAwIFIKL0EgPDwvTy9MYXlvdXQvUGxhY2VtZW50L0Jsb2NrCi9TcGFjZUJlZm9yZSAwLjA3Mgo+PgovS1s3IDggOSBdCj4+CmVuZG9iagoKMTMgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0xibAovUCAxMiAwIFIKL1BnIDEgMCBSCi9LWzEwIF0KPj4KZW5kb2JqCgoxNSAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvTGlzdCMyMFBhcmFncmFwaAovUCAxNCAwIFIKL1BnIDEgMCBSCi9BIDw8L08vTGF5b3V0L1BsYWNlbWVudC9CbG9jawovU3RhcnRJbmRlbnQgMC4xNAo+PgovS1sxMSAxMiBdCj4+CmVuZG9iagoKMTQgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0xCb2R5Ci9QIDEyIDAgUgovUGcgMSAwIFIKL0tbMTUgMCBSICBdCj4+CmVuZG9iagoKMTIgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0xJCi9QIDExIDAgUgovUGcgMSAwIFIKL0tbMTMgMCBSICAxNCAwIFIgIF0KPj4KZW5kb2JqCgoxNyAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvTGJsCi9QIDE2IDAgUgovUGcgMSAwIFIKL0tbMTMgXQo+PgplbmRvYmoKCjE5IDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9MaXN0IzIwUGFyYWdyYXBoCi9QIDE4IDAgUgovUGcgMSAwIFIKL0EgPDwvTy9MYXlvdXQvUGxhY2VtZW50L0Jsb2NrCi9TdGFydEluZGVudCAwLjE0Cj4+Ci9LWzE0IDE1IF0KPj4KZW5kb2JqCgoxOCAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvTEJvZHkKL1AgMTYgMCBSCi9QZyAxIDAgUgovS1sxOSAwIFIgIF0KPj4KZW5kb2JqCgoxNiAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvTEkKL1AgMTEgMCBSCi9QZyAxIDAgUgovS1sxNyAwIFIgIDE4IDAgUiAgXQo+PgplbmRvYmoKCjIxIDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9MYmwKL1AgMjAgMCBSCi9QZyAxIDAgUgovS1sxNiBdCj4+CmVuZG9iagoKMjMgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0xpc3QjMjBQYXJhZ3JhcGgKL1AgMjIgMCBSCi9QZyAxIDAgUgovQSA8PC9PL0xheW91dC9QbGFjZW1lbnQvQmxvY2sKL1N0YXJ0SW5kZW50IDAuMTQKPj4KL0tbMTcgMTggXQo+PgplbmRvYmoKCjIyIDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9MQm9keQovUCAyMCAwIFIKL1BnIDEgMCBSCi9LWzIzIDAgUiAgXQo+PgplbmRvYmoKCjIwIDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9MSQovUCAxMSAwIFIKL1BnIDEgMCBSCi9LWzIxIDAgUiAgMjIgMCBSICBdCj4+CmVuZG9iagoKMjUgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0xibAovUCAyNCAwIFIKL1BnIDEgMCBSCi9LWzE5IF0KPj4KZW5kb2JqCgoyNyAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvTGlzdCMyMFBhcmFncmFwaAovUCAyNiAwIFIKL1BnIDEgMCBSCi9BIDw8L08vTGF5b3V0L1BsYWNlbWVudC9CbG9jawovU3RhcnRJbmRlbnQgMC4xNAo+PgovS1syMCAyMSBdCj4+CmVuZG9iagoKMjYgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0xCb2R5Ci9QIDI0IDAgUgovUGcgMSAwIFIKL0tbMjcgMCBSICBdCj4+CmVuZG9iagoKMjQgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0xJCi9QIDExIDAgUgovUGcgMSAwIFIKL0tbMjUgMCBSICAyNiAwIFIgIF0KPj4KZW5kb2JqCgoxMSAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvTAovUCA0IDAgUgovUGcgMSAwIFIKL0EgPDwvTy9MaXN0L0xpc3ROdW1iZXJpbmcvRGlzYwo+PgovS1sxMiAwIFIgIDE2IDAgUiAgMjAgMCBSICAyNCAwIFIgIF0KPj4KZW5kb2JqCgoyOCAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvU3RhbmRhcmQKL1AgNCAwIFIKL1BnIDEgMCBSCi9BIDw8L08vTGF5b3V0L1BsYWNlbWVudC9CbG9jawovU3BhY2VCZWZvcmUgMC4wNzIKPj4KL0tbMjIgMjMgMjQgXQo+PgplbmRvYmoKCjMxIDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9MYmwKL1AgMzAgMCBSCi9QZyAxIDAgUgovS1syNSBdCj4+CmVuZG9iagoKMzMgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0xpc3QjMjBQYXJhZ3JhcGgKL1AgMzIgMCBSCi9QZyAxIDAgUgovQSA8PC9PL0xheW91dC9QbGFjZW1lbnQvQmxvY2sKL1N0YXJ0SW5kZW50IDAuMTQKPj4KL0tbMjYgMjcgXQo+PgplbmRvYmoKCjMyIDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9MQm9keQovUCAzMCAwIFIKL1BnIDEgMCBSCi9LWzMzIDAgUiAgXQo+PgplbmRvYmoKCjMwIDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9MSQovUCAyOSAwIFIKL1BnIDEgMCBSCi9LWzMxIDAgUiAgMzIgMCBSICBdCj4+CmVuZG9iagoKMzUgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0xibAovUCAzNCAwIFIKL1BnIDEgMCBSCi9LWzI4IF0KPj4KZW5kb2JqCgozNyAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvTGlzdCMyMFBhcmFncmFwaAovUCAzNiAwIFIKL1BnIDEgMCBSCi9BIDw8L08vTGF5b3V0L1BsYWNlbWVudC9CbG9jawovU3RhcnRJbmRlbnQgMC4xNAo+PgovS1syOSAzMCBdCj4+CmVuZG9iagoKMzYgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0xCb2R5Ci9QIDM0IDAgUgovUGcgMSAwIFIKL0tbMzcgMCBSICBdCj4+CmVuZG9iagoKMzQgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0xJCi9QIDI5IDAgUgovUGcgMSAwIFIKL0tbMzUgMCBSICAzNiAwIFIgIF0KPj4KZW5kb2JqCgoyOSAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvTAovUCA0IDAgUgovUGcgMSAwIFIKL0EgPDwvTy9MaXN0L0xpc3ROdW1iZXJpbmcvRGlzYwo+PgovS1szMCAwIFIgIDM0IDAgUiAgXQo+PgplbmRvYmoKCjM4IDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9TdGFuZGFyZAovUCA0IDAgUgovUGcgMSAwIFIKL0EgPDwvTy9MYXlvdXQvUGxhY2VtZW50L0Jsb2NrCi9TcGFjZUJlZm9yZSAwLjA3Mgo+PgovS1szMSAzMiAzMyBdCj4+CmVuZG9iagoKNDEgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0xibAovUCA0MCAwIFIKL1BnIDEgMCBSCi9LWzM0IF0KPj4KZW5kb2JqCgo0MyAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvTGlzdCMyMFBhcmFncmFwaAovUCA0MiAwIFIKL1BnIDEgMCBSCi9BIDw8L08vTGF5b3V0L1BsYWNlbWVudC9CbG9jawovU3RhcnRJbmRlbnQgMC4xNAo+PgovS1szNSAzNiBdCj4+CmVuZG9iagoKNDIgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0xCb2R5Ci9QIDQwIDAgUgovUGcgMSAwIFIKL0tbNDMgMCBSICBdCj4+CmVuZG9iagoKNDAgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0xJCi9QIDM5IDAgUgovUGcgMSAwIFIKL0tbNDEgMCBSICA0MiAwIFIgIF0KPj4KZW5kb2JqCgo0NSAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvTGJsCi9QIDQ0IDAgUgovUGcgMSAwIFIKL0tbMzcgXQo+PgplbmRvYmoKCjQ3IDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9MaXN0IzIwUGFyYWdyYXBoCi9QIDQ2IDAgUgovUGcgMSAwIFIKL0EgPDwvTy9MYXlvdXQvUGxhY2VtZW50L0Jsb2NrCi9TdGFydEluZGVudCAwLjE0Cj4+Ci9LWzM4IDM5IF0KPj4KZW5kb2JqCgo0NiAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvTEJvZHkKL1AgNDQgMCBSCi9QZyAxIDAgUgovS1s0NyAwIFIgIF0KPj4KZW5kb2JqCgo0NCAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvTEkKL1AgMzkgMCBSCi9QZyAxIDAgUgovS1s0NSAwIFIgIDQ2IDAgUiAgXQo+PgplbmRvYmoKCjM5IDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9MCi9QIDQgMCBSCi9QZyAxIDAgUgovQSA8PC9PL0xpc3QvTGlzdE51bWJlcmluZy9EaXNjCj4+Ci9LWzQwIDAgUiAgNDQgMCBSICBdCj4+CmVuZG9iagoKNDggMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL1N0YW5kYXJkCi9QIDQgMCBSCi9QZyAxIDAgUgovQSA8PC9PL0xheW91dC9QbGFjZW1lbnQvQmxvY2sKL1NwYWNlQmVmb3JlIDAuMDcyCj4+Ci9LWzQwIDQxIDQyIF0KPj4KZW5kb2JqCgo1MSAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvTGJsCi9QIDUwIDAgUgovUGcgMSAwIFIKL0tbNDMgXQo+PgplbmRvYmoKCjUzIDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9MaXN0IzIwUGFyYWdyYXBoCi9QIDUyIDAgUgovUGcgMSAwIFIKL0EgPDwvTy9MYXlvdXQvUGxhY2VtZW50L0Jsb2NrCi9TdGFydEluZGVudCAwLjE0Cj4+Ci9LWzQ0IDQ1IF0KPj4KZW5kb2JqCgo1MiAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvTEJvZHkKL1AgNTAgMCBSCi9QZyAxIDAgUgovS1s1MyAwIFIgIF0KPj4KZW5kb2JqCgo1MCAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvTEkKL1AgNDkgMCBSCi9QZyAxIDAgUgovS1s1MSAwIFIgIDUyIDAgUiAgXQo+PgplbmRvYmoKCjU1IDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9MYmwKL1AgNTQgMCBSCi9QZyAxIDAgUgovS1s0NiBdCj4+CmVuZG9iagoKNTcgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0xpc3QjMjBQYXJhZ3JhcGgKL1AgNTYgMCBSCi9QZyAxIDAgUgovQSA8PC9PL0xheW91dC9QbGFjZW1lbnQvQmxvY2sKL1N0YXJ0SW5kZW50IDAuMTQKPj4KL0tbNDcgNDggXQo+PgplbmRvYmoKCjU2IDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9MQm9keQovUCA1NCAwIFIKL1BnIDEgMCBSCi9LWzU3IDAgUiAgXQo+PgplbmRvYmoKCjU0IDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9MSQovUCA0OSAwIFIKL1BnIDEgMCBSCi9LWzU1IDAgUiAgNTYgMCBSICBdCj4+CmVuZG9iagoKNDkgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0wKL1AgNCAwIFIKL1BnIDEgMCBSCi9BIDw8L08vTGlzdC9MaXN0TnVtYmVyaW5nL0Rpc2MKPj4KL0tbNTAgMCBSICA1NCAwIFIgIF0KPj4KZW5kb2JqCgo1OCAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvU3RhbmRhcmQKL1AgNCAwIFIKL1BnIDEgMCBSCi9BIDw8L08vTGF5b3V0L1BsYWNlbWVudC9CbG9jawovU3BhY2VCZWZvcmUgMC4wOQovU3BhY2VBZnRlciAwLjA2Cj4+Ci9LWzQ5IF0KPj4KZW5kb2JqCgo1OSAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvU3RhbmRhcmQKL1AgNCAwIFIKL1BnIDEgMCBSCi9BIDw8L08vTGF5b3V0L1BsYWNlbWVudC9CbG9jawovU3BhY2VCZWZvcmUgMC4wNzIKPj4KL0tbNTAgNTEgNTIgXQo+PgplbmRvYmoKCjYyIDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9MYmwKL1AgNjEgMCBSCi9QZyAxIDAgUgovS1s1MyBdCj4+CmVuZG9iagoKNjQgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0xpc3QjMjBQYXJhZ3JhcGgKL1AgNjMgMCBSCi9QZyAxIDAgUgovQSA8PC9PL0xheW91dC9QbGFjZW1lbnQvQmxvY2sKL1N0YXJ0SW5kZW50IDAuMTQKPj4KL0tbNTQgNTUgXQo+PgplbmRvYmoKCjYzIDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9MQm9keQovUCA2MSAwIFIKL1BnIDEgMCBSCi9LWzY0IDAgUiAgXQo+PgplbmRvYmoKCjYxIDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9MSQovUCA2MCAwIFIKL1BnIDEgMCBSCi9LWzYyIDAgUiAgNjMgMCBSICBdCj4+CmVuZG9iagoKNjYgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0xibAovUCA2NSAwIFIKL1BnIDEgMCBSCi9LWzU2IF0KPj4KZW5kb2JqCgo2OCAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvTGlzdCMyMFBhcmFncmFwaAovUCA2NyAwIFIKL1BnIDEgMCBSCi9BIDw8L08vTGF5b3V0L1BsYWNlbWVudC9CbG9jawovU3RhcnRJbmRlbnQgMC4xNAo+PgovS1s1NyA1OCBdCj4+CmVuZG9iagoKNjcgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0xCb2R5Ci9QIDY1IDAgUgovUGcgMSAwIFIKL0tbNjggMCBSICBdCj4+CmVuZG9iagoKNjUgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0xJCi9QIDYwIDAgUgovUGcgMSAwIFIKL0tbNjYgMCBSICA2NyAwIFIgIF0KPj4KZW5kb2JqCgo3MCAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvTGJsCi9QIDY5IDAgUgovUGcgMSAwIFIKL0tbNTkgXQo+PgplbmRvYmoKCjcyIDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9MaXN0IzIwUGFyYWdyYXBoCi9QIDcxIDAgUgovUGcgMSAwIFIKL0EgPDwvTy9MYXlvdXQvUGxhY2VtZW50L0Jsb2NrCi9TdGFydEluZGVudCAwLjE0Cj4+Ci9LWzYwIF0KPj4KZW5kb2JqCgo3MSAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvTEJvZHkKL1AgNjkgMCBSCi9QZyAxIDAgUgovS1s3MiAwIFIgIF0KPj4KZW5kb2JqCgo2OSAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvTEkKL1AgNjAgMCBSCi9QZyAxIDAgUgovS1s3MCAwIFIgIDcxIDAgUiAgXQo+PgplbmRvYmoKCjYwIDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9MCi9QIDQgMCBSCi9QZyAxIDAgUgovQSA8PC9PL0xpc3QvTGlzdE51bWJlcmluZy9EaXNjCj4+Ci9LWzYxIDAgUiAgNjUgMCBSICA2OSAwIFIgIF0KPj4KZW5kb2JqCgo3MyAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvU3RhbmRhcmQKL1AgNCAwIFIKL1BnIDEgMCBSCi9BIDw8L08vTGF5b3V0L1BsYWNlbWVudC9CbG9jawovU3BhY2VCZWZvcmUgMC4wNzIKPj4KL0tbNjEgNjIgNjMgXQo+PgplbmRvYmoKCjc2IDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9MYmwKL1AgNzUgMCBSCi9QZyAxIDAgUgovS1s2NCBdCj4+CmVuZG9iagoKNzggMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0xpc3QjMjBQYXJhZ3JhcGgKL1AgNzcgMCBSCi9QZyAxIDAgUgovQSA8PC9PL0xheW91dC9QbGFjZW1lbnQvQmxvY2sKL1N0YXJ0SW5kZW50IDAuMTQKPj4KL0tbNjUgNjYgXQo+PgplbmRvYmoKCjc3IDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9MQm9keQovUCA3NSAwIFIKL1BnIDEgMCBSCi9LWzc4IDAgUiAgXQo+PgplbmRvYmoKCjc1IDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9MSQovUCA3NCAwIFIKL1BnIDEgMCBSCi9LWzc2IDAgUiAgNzcgMCBSICBdCj4+CmVuZG9iagoKODAgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0xibAovUCA3OSAwIFIKL1BnIDEgMCBSCi9LWzY3IF0KPj4KZW5kb2JqCgo4MiAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvTGlzdCMyMFBhcmFncmFwaAovUCA4MSAwIFIKL1BnIDEgMCBSCi9BIDw8L08vTGF5b3V0L1BsYWNlbWVudC9CbG9jawovU3RhcnRJbmRlbnQgMC4xNAo+PgovS1s2OCA2OSBdCj4+CmVuZG9iagoKODEgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0xCb2R5Ci9QIDc5IDAgUgovUGcgMSAwIFIKL0tbODIgMCBSICBdCj4+CmVuZG9iagoKNzkgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0xJCi9QIDc0IDAgUgovUGcgMSAwIFIKL0tbODAgMCBSICA4MSAwIFIgIF0KPj4KZW5kb2JqCgo3NCAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvTAovUCA0IDAgUgovUGcgMSAwIFIKL0EgPDwvTy9MaXN0L0xpc3ROdW1iZXJpbmcvRGlzYwo+PgovS1s3NSAwIFIgIDc5IDAgUiAgXQo+PgplbmRvYmoKCjgzIDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9TdGFuZGFyZAovUCA0IDAgUgovUGcgMSAwIFIKL0EgPDwvTy9MYXlvdXQvUGxhY2VtZW50L0Jsb2NrCi9TcGFjZUJlZm9yZSAwLjA2Mgo+PgovS1s3MCA3MSA3MiBdCj4+CmVuZG9iagoKODQgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL1N0YW5kYXJkCi9QIDQgMCBSCi9QZyAxIDAgUgovQSA8PC9PL0xheW91dC9QbGFjZW1lbnQvQmxvY2sKL1NwYWNlQmVmb3JlIDAuMDkKL1NwYWNlQWZ0ZXIgMC4wNgo+PgovS1s3MyBdCj4+CmVuZG9iagoKODUgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL1N0YW5kYXJkCi9QIDQgMCBSCi9QZyAxIDAgUgovQSA8PC9PL0xheW91dC9QbGFjZW1lbnQvQmxvY2sKL1NwYWNlQmVmb3JlIDAuMDUKPj4KL0tbNzQgNzUgNzYgXQo+PgplbmRvYmoKCjg2IDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9TdGFuZGFyZAovUCA0IDAgUgovUGcgMSAwIFIKL0EgPDwvTy9MYXlvdXQvUGxhY2VtZW50L0Jsb2NrCi9TdGFydEluZGVudCAwLjE2Cj4+Ci9LWzc3IF0KPj4KZW5kb2JqCgo4NyAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvU3RhbmRhcmQKL1AgNCAwIFIKL1BnIDEgMCBSCi9BIDw8L08vTGF5b3V0L1BsYWNlbWVudC9CbG9jawovU3BhY2VCZWZvcmUgMC4wMzgKPj4KL0tbNzggNzkgODAgXQo+PgplbmRvYmoKCjg4IDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9TdGFuZGFyZAovUCA0IDAgUgovUGcgMSAwIFIKL0EgPDwvTy9MYXlvdXQvUGxhY2VtZW50L0Jsb2NrCi9TcGFjZUJlZm9yZSAwLjA5Ci9TcGFjZUFmdGVyIDAuMDYKPj4KL0tbODEgXQo+PgplbmRvYmoKCjg5IDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9TdGFuZGFyZAovUCA0IDAgUgovUGcgMSAwIFIKL0EgPDwvTy9MYXlvdXQvUGxhY2VtZW50L0Jsb2NrCi9TcGFjZUJlZm9yZSAwLjAzNAo+PgovS1s4MiA4MyA4NCA4NSA4NiA4NyBdCj4+CmVuZG9iagoKOTAgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL1N0YW5kYXJkCi9QIDQgMCBSCi9QZyAxIDAgUgovQSA8PC9PL0xheW91dC9QbGFjZW1lbnQvQmxvY2sKL1NwYWNlQmVmb3JlIDAuMDI4Cj4+Ci9LWzg4IDg5IDkwIDkxIDkyIDkzIF0KPj4KZW5kb2JqCgo5MSAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvU3RhbmRhcmQKL1AgNCAwIFIKL1BnIDEgMCBSCi9BIDw8L08vTGF5b3V0L1BsYWNlbWVudC9CbG9jawovU3BhY2VCZWZvcmUgMC4wOQovU3BhY2VBZnRlciAwLjA2Cj4+Ci9LWzk0IF0KPj4KZW5kb2JqCgo5MiAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvU3RhbmRhcmQKL1AgNCAwIFIKL1BnIDEgMCBSCi9BIDw8L08vTGF5b3V0L1BsYWNlbWVudC9CbG9jawovU3BhY2VCZWZvcmUgMC4wMwo+PgovS1s5NSA5NiBdCj4+CmVuZG9iagoKOTMgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL1N0YW5kYXJkCi9QIDQgMCBSCi9QZyAxIDAgUgovQSA8PC9PL0xheW91dC9QbGFjZW1lbnQvQmxvY2sKL1NwYWNlQmVmb3JlIDAuMDE3Cj4+Ci9LWzk3IDk4IF0KPj4KZW5kb2JqCgo5NCAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvU3RhbmRhcmQKL1AgNCAwIFIKL1BnIDEgMCBSCi9BIDw8L08vTGF5b3V0L1BsYWNlbWVudC9CbG9jawovU3BhY2VCZWZvcmUgMC4wMTcKPj4KL0tbOTkgMTAwIF0KPj4KZW5kb2JqCgo5NSAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvU3RhbmRhcmQKL1AgNCAwIFIKL1BnIDEgMCBSCi9BIDw8L08vTGF5b3V0L1BsYWNlbWVudC9CbG9jawovU3BhY2VCZWZvcmUgMC4wMTcKPj4KL0tbMTAxIDEwMiBdCj4+CmVuZG9iagoKNCAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvRG9jdW1lbnQKL1AgMTE0IDAgUgovUGcgMSAwIFIKL0tbNSAwIFIgIDYgMCBSICA3IDAgUiAgOCAwIFIgIDkgMCBSICAxMCAwIFIgIDExIDAgUiAgMjggMCBSICAyOSAwIFIgIDM4IDAgUiAgMzkgMCBSICA0OCAwIFIgIDQ5IDAgUiAgNTggMCBSICA1OSAwIFIgIDYwIDAgUiAKNzMgMCBSICA3NCAwIFIgIDgzIDAgUiAgODQgMCBSICA4NSAwIFIgIDg2IDAgUiAgODcgMCBSICA4OCAwIFIgIDg5IDAgUiAgOTAgMCBSICA5MSAwIFIgIDkyIDAgUiAgOTMgMCBSICA5NCAwIFIgIDk1IDAgUiAgXQo+PgplbmRvYmoKCjExNCAwIG9iago8PC9UeXBlL1N0cnVjdFRyZWVSb290Ci9QYXJlbnRUcmVlIDExNSAwIFIKL1JvbGVNYXA8PC9MaXN0IzIwUGFyYWdyYXBoL1AKL1N0YW5kYXJkL1AKPj4KL0tbNCAwIFIgIF0KPj4KZW5kb2JqCgoxMTUgMCBvYmoKPDwvTnVtc1sKMCBbIDUgMCBSIDYgMCBSIDcgMCBSIDggMCBSIDggMCBSIDggMCBSIDkgMCBSIDEwIDAgUiAxMCAwIFIgMTAgMCBSCjEzIDAgUiAxNSAwIFIgMTUgMCBSIDE3IDAgUiAxOSAwIFIgMTkgMCBSIDIxIDAgUiAyMyAwIFIgMjMgMCBSIDI1IDAgUgoyNyAwIFIgMjcgMCBSIDI4IDAgUiAyOCAwIFIgMjggMCBSIDMxIDAgUiAzMyAwIFIgMzMgMCBSIDM1IDAgUiAzNyAwIFIKMzcgMCBSIDM4IDAgUiAzOCAwIFIgMzggMCBSIDQxIDAgUiA0MyAwIFIgNDMgMCBSIDQ1IDAgUiA0NyAwIFIgNDcgMCBSCjQ4IDAgUiA0OCAwIFIgNDggMCBSIDUxIDAgUiA1MyAwIFIgNTMgMCBSIDU1IDAgUiA1NyAwIFIgNTcgMCBSIDU4IDAgUgo1OSAwIFIgNTkgMCBSIDU5IDAgUiA2MiAwIFIgNjQgMCBSIDY0IDAgUiA2NiAwIFIgNjggMCBSIDY4IDAgUiA3MCAwIFIKNzIgMCBSIDczIDAgUiA3MyAwIFIgNzMgMCBSIDc2IDAgUiA3OCAwIFIgNzggMCBSIDgwIDAgUiA4MiAwIFIgODIgMCBSCjgzIDAgUiA4MyAwIFIgODMgMCBSIDg0IDAgUiA4NSAwIFIgODUgMCBSIDg1IDAgUiA4NiAwIFIgODcgMCBSIDg3IDAgUgo4NyAwIFIgODggMCBSIDg5IDAgUiA4OSAwIFIgODkgMCBSIDg5IDAgUiA4OSAwIFIgODkgMCBSIDkwIDAgUiA5MCAwIFIKOTAgMCBSIDkwIDAgUiA5MCAwIFIgOTAgMCBSIDkxIDAgUiA5MiAwIFIgOTIgMCBSIDkzIDAgUiA5MyAwIFIgOTQgMCBSCjk0IDAgUiA5NSAwIFIgOTUgMCBSIF0KXT4+CmVuZG9iagoKOTYgMCBvYmoKPDwvVHlwZS9QYWdlcwovUmVzb3VyY2VzIDExMyAwIFIKL0tpZHNbIDEgMCBSIF0KL0NvdW50IDE+PgplbmRvYmoKCjExNiAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgOTYgMCBSCi9QYWdlTW9kZS9Vc2VPdXRsaW5lcwovT3BlbkFjdGlvblsxIDAgUiAvWFlaIG51bGwgbnVsbCAwXQovU3RydWN0VHJlZVJvb3QgMTE0IDAgUgovTGFuZyhlbi1VUykKL01hcmtJbmZvPDwvTWFya2VkIHRydWU+Pgo+PgplbmRvYmoKCjExNyAwIG9iago8PC9BdXRob3I8RkVGRjAwNTUwMDZFMDAyRDAwNkUwMDYxMDA2RDAwNjUwMDY0PgovQ3JlYXRvcjxGRUZGMDA1NzAwNzIwMDY5MDA3NDAwNjUwMDcyPgovUHJvZHVjZXI8RkVGRjAwNEMwMDY5MDA2MjAwNzIwMDY1MDA0RjAwNjYwMDY2MDA2OTAwNjMwMDY1MDAyMDAwMzIwMDM0MDAyRTAwMzI+Ci9DcmVhdGlvbkRhdGUoRDoyMDI2MDUyODE5NTUwNFonKT4+CmVuZG9iagoKeHJlZgowIDExOAowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwNDU2MDQgMDAwMDAgbiAKMDAwMDAwMDAxOSAwMDAwMCBuIAowMDAwMDA1MDE4IDAwMDAwIG4gCjAwMDAwNTU2ODMgMDAwMDAgbiAKMDAwMDA0NTcyOSAwMDAwMCBuIAowMDAwMDQ1ODU3IDAwMDAwIG4gCjAwMDAwNDYwMDMgMDAwMDAgbiAKMDAwMDA0NjE0OCAwMDAwMCBuIAowMDAwMDQ2MjgxIDAwMDAwIG4gCjAwMDAwNDY0MjYgMDAwMDAgbiAKMDAwMDA0ODA5MiAwMDAwMCBuIAowMDAwMDQ2ODU3IDAwMDAwIG4gCjAwMDAwNDY1NjAgMDAwMDAgbiAKMDAwMDA0Njc3NiAwMDAwMCBuIAowMDAwMDQ2NjM0IDAwMDAwIG4gCjAwMDAwNDcyNDAgMDAwMDAgbiAKMDAwMDA0Njk0MyAwMDAwMCBuIAowMDAwMDQ3MTU5IDAwMDAwIG4gCjAwMDAwNDcwMTcgMDAwMDAgbiAKMDAwMDA0NzYyMyAwMDAwMCBuIAowMDAwMDQ3MzI2IDAwMDAwIG4gCjAwMDAwNDc1NDIgMDAwMDAgbiAKMDAwMDA0NzQwMCAwMDAwMCBuIAowMDAwMDQ4MDA2IDAwMDAwIG4gCjAwMDAwNDc3MDkgMDAwMDAgbiAKMDAwMDA0NzkyNSAwMDAwMCBuIAowMDAwMDQ3NzgzIDAwMDAwIG4gCjAwMDAwNDgyMjcgMDAwMDAgbiAKMDAwMDA0OTEzMCAwMDAwMCBuIAowMDAwMDQ4NjYxIDAwMDAwIG4gCjAwMDAwNDgzNjQgMDAwMDAgbiAKMDAwMDA0ODU4MCAwMDAwMCBuIAowMDAwMDQ4NDM4IDAwMDAwIG4gCjAwMDAwNDkwNDQgMDAwMDAgbiAKMDAwMDA0ODc0NyAwMDAwMCBuIAowMDAwMDQ4OTYzIDAwMDAwIG4gCjAwMDAwNDg4MjEgMDAwMDAgbiAKMDAwMDA0OTI0OSAwMDAwMCBuIAowMDAwMDUwMTUyIDAwMDAwIG4gCjAwMDAwNDk2ODMgMDAwMDAgbiAKMDAwMDA0OTM4NiAwMDAwMCBuIAowMDAwMDQ5NjAyIDAwMDAwIG4gCjAwMDAwNDk0NjAgMDAwMDAgbiAKMDAwMDA1MDA2NiAwMDAwMCBuIAowMDAwMDQ5NzY5IDAwMDAwIG4gCjAwMDAwNDk5ODUgMDAwMDAgbiAKMDAwMDA0OTg0MyAwMDAwMCBuIAowMDAwMDUwMjcxIDAwMDAwIG4gCjAwMDAwNTExNzQgMDAwMDAgbiAKMDAwMDA1MDcwNSAwMDAwMCBuIAowMDAwMDUwNDA4IDAwMDAwIG4gCjAwMDAwNTA2MjQgMDAwMDAgbiAKMDAwMDA1MDQ4MiAwMDAwMCBuIAowMDAwMDUxMDg4IDAwMDAwIG4gCjAwMDAwNTA3OTEgMDAwMDAgbiAKMDAwMDA1MTAwNyAwMDAwMCBuIAowMDAwMDUwODY1IDAwMDAwIG4gCjAwMDAwNTEyOTMgMDAwMDAgbiAKMDAwMDA1MTQ0MCAwMDAwMCBuIAowMDAwMDUyNzIzIDAwMDAwIG4gCjAwMDAwNTE4NzQgMDAwMDAgbiAKMDAwMDA1MTU3NyAwMDAwMCBuIAowMDAwMDUxNzkzIDAwMDAwIG4gCjAwMDAwNTE2NTEgMDAwMDAgbiAKMDAwMDA1MjI1NyAwMDAwMCBuIAowMDAwMDUxOTYwIDAwMDAwIG4gCjAwMDAwNTIxNzYgMDAwMDAgbiAKMDAwMDA1MjAzNCAwMDAwMCBuIAowMDAwMDUyNjM3IDAwMDAwIG4gCjAwMDAwNTIzNDMgMDAwMDAgbiAKMDAwMDA1MjU1NiAwMDAwMCBuIAowMDAwMDUyNDE3IDAwMDAwIG4gCjAwMDAwNTI4NTAgMDAwMDAgbiAKMDAwMDA1Mzc1MyAwMDAwMCBuIAowMDAwMDUzMjg0IDAwMDAwIG4gCjAwMDAwNTI5ODcgMDAwMDAgbiAKMDAwMDA1MzIwMyAwMDAwMCBuIAowMDAwMDUzMDYxIDAwMDAwIG4gCjAwMDAwNTM2NjcgMDAwMDAgbiAKMDAwMDA1MzM3MCAwMDAwMCBuIAowMDAwMDUzNTg2IDAwMDAwIG4gCjAwMDAwNTM0NDQgMDAwMDAgbiAKMDAwMDA1Mzg3MiAwMDAwMCBuIAowMDAwMDU0MDA5IDAwMDAwIG4gCjAwMDAwNTQxNTYgMDAwMDAgbiAKMDAwMDA1NDI5MiAwMDAwMCBuIAowMDAwMDU0NDIyIDAwMDAwIG4gCjAwMDAwNTQ1NTkgMDAwMDAgbiAKMDAwMDA1NDcwNiAwMDAwMCBuIAowMDAwMDU0ODUyIDAwMDAwIG4gCjAwMDAwNTQ5OTggMDAwMDAgbiAKMDAwMDA1NTE0NSAwMDAwMCBuIAowMDAwMDU1Mjc4IDAwMDAwIG4gCjAwMDAwNTU0MTIgMDAwMDAgbiAKMDAwMDA1NTU0NyAwMDAwMCBuIAowMDAwMDU2ODc0IDAwMDAwIG4gCjAwMDAwMDUwMzkgMDAwMDAgbiAKMDAwMDAyMDE1OSAwMDAwMCBuIAowMDAwMDIwMTgyIDAwMDAwIG4gCjAwMDAwMjAzNzggMDAwMDAgbiAKMDAwMDAyMTAyOCAwMDAwMCBuIAowMDAwMDIxNTIwIDAwMDAwIG4gCjAwMDAwMzE2OTMgMDAwMDAgbiAKMDAwMDAzMTcxNyAwMDAwMCBuIAowMDAwMDMxOTI3IDAwMDAwIG4gCjAwMDAwMzI0MjMgMDAwMDAgbiAKMDAwMDAzMjc3MyAwMDAwMCBuIAowMDAwMDQ0MzM4IDAwMDAwIG4gCjAwMDAwNDQzNjIgMDAwMDAgbiAKMDAwMDA0NDU2NyAwMDAwMCBuIAowMDAwMDQ1MTAxIDAwMDAwIG4gCjAwMDAwNDU0ODkgMDAwMDAgbiAKMDAwMDA0NTU0NiAwMDAwMCBuIAowMDAwMDU2MDAyIDAwMDAwIG4gCjAwMDAwNTYxMjMgMDAwMDAgbiAKMDAwMDA1Njk1MCAwMDAwMCBuIAowMDAwMDU3MTIxIDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSAxMTgvUm9vdCAxMTYgMCBSCi9JbmZvIDExNyAwIFIKL0lEIFsgPEUxQjA0QjA5NkQzMzlCMUIwNkE4MEY2OEYwQUZBMDYyPgo8RTFCMDRCMDk2RDMzOUIxQjA2QTgwRjY4RjBBRkEwNjI+IF0KL0RvY0NoZWNrc3VtIC8wRUQzNTIxMTdBRUQ5QjExNDkzOTg0QURFQTREODg3Ngo+PgpzdGFydHhyZWYKNTczNDIKJSVFT0YK' },
      { label: 'Finance / fintech résumé', url: '/Yusuf_Gadelrab_Resume.pdf', b64: 'JVBERi0xLjcKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nOVcXa8juXF9n18hIG8BoiWLX93AxQBqqRXEsIE4HiAPhh8m2dix4RjJZAH//VSdItnsFlut0QbIQ3YxcyXdFptdrDrnVLE45mxPf/30w+XbT3/8/dd//ek0/er66b9O5mTOhoZTtPY8JntKo/789m+f/vlvT3/5NPNVP/zmp69/+fHrtx8/Pn741fUfbifz+fN0w7fPlmyIQ6Tk+Q3ZMZo0eGf5jRvLr07f/vBp+vKJrDuncEqOziGcvvx4+uFuT8Svfv9hrCHj+I83wfAQZjCjuZiJX10/f/nTp/nLp1/3p2KXqbj635M3OhVrhrM/JTvIhDATOg08kd+WmbTz8DKTz39nP/iVN1f8fTMz/3b+zB/erbH8JUtmsM56Q/yhDTZaHt5aO8o1ZC/8O2MnE+24DGOvfFGyN/nGzG/vJOPIAOT4f0+2udbZi3EU+C4kr8poFPF5LFMydwywnpINRJTk48S38HzPwD8Nuc+/+/KLJ9altxbaRXa1ZNw51mUez0HNK7O8L2azBxNwdQL4vxk/DsN5XBavjD+JG1lnbjSwzSd5Le/YfmS9GOBCI6+qw6ravKozm1Ns5Xm9POw2G6KBr/P46dkrgl5NF1k2WSF1CSsOQsZGWTosIlaFHUDWSP7wGtJVBuRV4jnxcISfMg3PtxvgZnl2E93gcRicZiKZdjPnuwwpQ9mJX8mDenaomFdabyffJzyRN5Hu8lx6S/ZoNY4/sLrft3oaz/bB6jzkkN1NnsIkuvGceYX50dVMswQALInocjw9xy7Js4vOYYYD5juIqWAkXjKTYExfzXjnG8l63OVTMdfovFqcxJ1nGth8/Ct5cL5IbubFAHIDjQq5w8jjDbir3HEyFxc+ww0szS4Wt3CprKtNGGXmNXXqU8WY8oD8rYDozgNigbwj8UCZDb8bxfswcTo0fdg3fRzP7tHhqTg8W+vCrtSufsdbeBp3seP6QTDBQbyMr2GfsfA3/i0/oKvOyaiJL2AxANaWrTIqxOWlb2wGXILt+QbZJYp92qllkL3X60sQxDykDQJt+IIESxLPoOzVfLk1N2sOzBrfB7IYfHX5Bch4FCduYgVYLLsG4Z2gPh3MJe0vMf+9xcwPy+ZhI/N6MV2M/PQXE+yNoWYUfrR3eyWhAmcC0wXjPH9+5Z/idgwsz9lz6E3FDuM5reZS3A0M6JTALJxevAj+4y4ZahG5HDwOKzSwL3lg18Cu4hc3MPxtCSm+dmKnmR9d5fnMx7d4P5jAvL95NHkwdxW/K97r5BFmieKKzzy99YR++S9/rhrE9MzonawoxTOVO40w4UbQ/PKP//3T35D5x6/fvv7h29f//Pc6qO0NGmg7aAUCiyeYC5RSRkYr2JUjKXNaDTKOdYl3iSDE1B1rmcrlCiaDY8BQSKmxv0MrEqgSDoITeCe8e3c3b4CB+l7mxGOpzLkL1stcGlhR7HKI7Igb0AI7MhXMjuBUrUupAykapQeg3bUz7dvZxrN74DrRch4GHFRZOCcPQWJCMMezwNgx/V3GzDPfzrvxs64aUj8z8WzCe47WZXs1wGrUYgEJboY8heOFuvPCgUiEqEWRKiNOGureArqFme+As0xJoOIgAJ8l12DgH/xOeB3vsv9EEeWLM6jFogQnOwEWA+yuQ6kQGHApnLKwWnFFFsLRi0aRb8vEZmtlGenCeAQnh4jkET21XLnwK38DQuZVX+uyO0wdxtgRVvKwPPeJZb/XkIN0hijSxCITqJd5AmsjWLw86TNvirveFIZwHt9zpi656RO2g1ZfuuojxSyH77oiwKBW4WrSI84kCp01Yw64vBIC2fjeQHWNZcXgUHJFYyeoIfELArAXWBJHY79hP3EPWMQQqODauN4Ej2E1QoSAFh3moJ88IMKq1Nf5aw7oJXtbhnjVabokrSZN8QGeJOUZgZJ4FoQcLbMVG3eV9FNXGfddJYYmh/4uX6EubeqDrUat0SDxF6G4IB4BpuITiRMKLzQg8Uvy5CPIBaGTEYVy8ECR4EURJU3GsvKghAgHipBzN/ZMt/GqAeIAUhVRl1lTplVcaIVl+baYM8BfsConqjpOQrpCSPO9rpxmRIppGYEaja+e/B0YRPu6IoRwHraSTyEQuLzD+pvw4M+fSzfqMi4EMHNEUxuqWtvYwHLmjroIS9tgRopSIGK1Bhl8VMXo8iYvj9yrvWXjalXochI+uVC4veZ6qU1sNZEU0nAJamlA0qpeV1jOapa/wIsTWgpHc/fvCV3rWbpsng3LqaUKnwVuYD+6LUnbrsSlLnMpAjjLf78FAF0GUldsBy2LQlNTR5ikOvJa/QBln14JQYHZl+wSF+Tl9ppdpiziUK+ACNHrhlaGlAQh404VGTXnNxlyUPwrSCIiMbPeuJCDcp/AEvgq6TDy1Kbhu1dj/Qkbk33MIfBgrolx9VOGVFOwFHCIhPxGEdUWwTeUShEXvpAovD616piSuH+mx6KgWxwRmpoKIvMbPLFWJ4Rlx6L0MAGoIiBxeq5zqMuf6roMAeOb5NWlRDXtatRiW4/KLT/dlElrhGSYC4a2jttWBSEu/ILCKle8FBoglfS9ytxFkzcun+vZKI/BAytvrpbKPyw+LI8M7V6qiwz1vq0hlXF47KJOVYCvc4IX3dU9EQTGdjIRKdwuN2/vjJKes0i4Yq0XzXDhmiJ3q6klaBOiMRUP7OOCsRhP9Eg8qmR3eRes54dY1U4t+6inCLtRwkYIJsXibTQBRV4t8EySnoADn3Ku63KuDYNYtb1/jwK1+i2VbymOuiS2E3feFq5fYzTn3mM0BqzhYa4dSnutZuO6WS9Qwacm7f8uUHD7+d1q0Epo8yppQ8QsQhI5a6l4qEpELFKmFy0wSCqtSTLym8J5mTs0z2XjIDtCHqAps6YCjCGr5U3qzosAPk6OLLZPmr0OFPwoopiUMqHNEp1aAXkoWDf0u3jOxoIpSHLcsSF76YtLs681fIxn/0CFHFaQtVqoEuzNuwsCDU92dGpKelVsf2XHBwJB8jbsS0RogSeM5rq0rr4b2jLC9znvfp65HnWpAy2Vwey9DA+Vx1GqZ59RxVwkWU6oli23sitzb8M2U6QrknnJrQrfQY/UkRu1Yu8QV5rmO/WtbHndL723afxibllb/l1qPFsrla4qlWYvr7Oui9qTDOiJJwuKdQz6uivvSw/WBWfqVpFW7FeKtSIvkKhU62a6LEqlCoGjDcMucyu5sZIft+RmExtqMrqjQQYV3rJ/QYYpbxRAQXr34k6G79Ir3wfA0cyhS3AXieuywkLx2TDiq5qYNxvAR7agn8Vv66m+zW9+v1bs+U7vQYTfLxWvBm0StlyxzaoM6pRzaC3VPhBbsx0ZSlqqxFUKcU0xl3K50PV4a13yIqfXabSLSF0F/D7JuRvABPW9XMRH9qecEFQmAu3B4rl9ANt131Xj80+Eg7Xnhyrfukq1pFhIEUgJV6QYZtzg6LKBAxAEIGrGuqWbB6/+GTuobqwEuxR1eE10y9RQ2Ty1nFMKX3hUVgAH0kijlRZ7I0eTXolSUN1xHY6mvr/h6tJQatIVm+jKCCSSmxHJDvxT0McBrw5ltu9vqFrT3qmHQD5pUqW76nkXqTQP8a+X3W4gdeHTsVytCu7IEO9umrLk3jyATj9obklGluNh37QUQwWmdrVM2N87dXE4+/eAKuwXOdej1ux8bAu45GrUyx5QrsX2skWUMbQmvZIOq43QjB1x3XGxhqhVRI/dYuuqt6P2lalc2vRSDJoXN60zGAqb60DdWqOC9CqouIgclQE671dBLOzvpDpONLdF1o913ZhKdSOCfSmjOkrhpc6k+727nBf2Oc/54c2cLuxz3mrQVhWXp8rc4ErBr22kIWRqlBF65WtalFxB/LJ3XgqadQ+k3ZGquR0qdqKxNzU2+AqhjWSsNSjSylH2k1LELBWfTU/R1pf13ipJYi7eldLlovLzyLI9M7zuUPus6Nywzdk+Nt0Hmh7nRqEcJ098Z383lL/4bk4V9guw61FXXRxaRqsltKTyAgVACd1bbgYlpM9FLvFDq7wCIkvIDNutmU6IFTRJtXFxhJYYMFJRPpcqgx+ABdiHntnNLrmWNaMN/lISKNw/5Q1/nyvfipCKiAn30+QDcfGqo+ynrs4ODxnRR3nsIpxyT9re/hZKKvK75+QfunmZ6gzjHpIglkCc4SAApaQX+KYzZz5GtrZIer4mi0bZYFEnsdfDfa7Y5VJeAekbbKfwf6ZA4nvt2sEYqVNuHqE0/M4ArpwkATtFgyziRJXJvgSJXd5C6NPo3kyVYpeL4JKrQZdGCEVclSE5XUL2sSl13HZ7PXzZ2Y4l5NrkQH2826H1yAJj3qauHZg+U0IrR/KWuTJJhwD6uqfhksf51n2OhnxeBYG4T9QMjZ0cak9/rQtAo1b/MkBpT8EL+VLcb+SlOJ6HByyYkHM4e0XUMwwGmqVvxd7NFU2fF/7kTrJ2shkuv73qK2RGV2cAFiY4KVXkqglJnYXRxdxJ1MHBlLsUyPqLmbaZc6cZ1EkXm5PMTfSJNCv5Sdle0AGgLrrloC8gpvfAwUmCvJ5gUzYxCgcVH55PYXg/yyXGWb+tc4l8nRnAjR2sdO3Gg/vvUwi5B59BCX3iFZeaGRuE1/nG7pKUN2TZZ2kaRq9E61pH/ck7NEJCpHUaaw7xOKPCTmzzgZlaaV0ErUXelHcqjubwLlFIf287x7ZSrRiT9wfbxgexytFJlPReWc97WTsaCuK7/jkjLW7pmacrT+zKr2aZILiWKUA6RrO8D+ZijRFyFnlCJpfQb1IrEbUgg1gZWNqZonxHwu9ikZBf5TpenWiu+I0VfsGXtMcc7Zk31GU9Slo3+TYrk4u9m1w5xjiWx2DpJ22XF+lQMFf2wivnOnfCXPijGyptR3bdP+JDNm5rM45JRyw04fgSuzhd2MFFIInvi3aViL88j7LUZQrrkhQG6k17Dq7NvNqNWNohdKtdZZy0lBrZU3PR0aFeS+E9Jw+SdrbzbKvEB4/+M8p4bNhz3GKQ7CuQLHtoUc7ccvlO+jW1ZHfj20X+fXPNkXn263a220s6oKg7A3LlCJc02yStMapORZINzeqMfub19wJLev2gn4scQ1eyvLb5M+3oCrmNPjnk82XlmfH0qqgp03KMSz8/ethuCsO3lrpJ87h28crNOUnnyxaFO4y5HZqxkpF2bYsnlL6TCee80ArlSI4H6WG43D9m5USkfOpnxVzIv6UKNS398fikdL+s9l/KHuHBQwz7e042xU732Py4JahEpb2i+1y1NO/lzAe9Nsbfj+fY35UavCBNM0vXtLQQh50crOLpyCwZeTlPnPjPFSityZY9rHoP3ayGg/2cevbBCqOtx2i7q7vZm5vR+Jo4cNG3xcYS6kHKz9N08rmeVHU3ioz8LDjZEZJNJOdT8Z7kiNKdueD5QaR9FrDRP/ojTaYUwO4KybKCGuU5DgNO6BF+i/dNZKcaoflTQooi6AFKBTJkhLjpIdEjc3c5hdwo3SrNI/yvxO/QTS5owAHBrr0kTpcg1QgVZ9aAJK09NlEhFR5lNnTkyfkNtanYOwUR1fVM0V16rjUPb/sfh9ImRLkblkZtVPbj0h2rVx09bjcxUecI4THSnaSdIe9oFzTJTLDZ134tirtEZG1kOzcTWILYShUlQHaJMcVDr5rUVQnXCCsIPjY5dpdr8MPrAAD51QoEXgGALqPQGHiSHbN9ZIrUM58WqXw+T+qCHxEKoEQ0/OQ6ZHUpcxDe4/uyw3IMjQ+yY8jbf4kFYFTxQUiA2C+DYNKhvBif8AeFJZUr1WVjg+bbnEw7l0w4OKDYhf6I49PN+K3XNtsD2ktXOVI/CdpDjLPe2BS4qqczn6l4QZcy3GUsl1M5XNfSWN0IHrWxMYOOwNx+f6N6QOdEsTJS7YCuVRRtkH84nRzsXuvU6gG3HWF9I+8fJbDWN02VwyJXJXVAR6WUucXcVzZRwoIe3KzLUWOEQmvu1izp5hS41CQFBVevtdY6lX+dQPaAalFVTpwfzWr/sD6DW4nyxQL1gLDIc6CMpkzGvWKCLvGMBJJb7tbsqw71iJyoFtyunmgTKn48cw4/C2bIDeeQ1ChhRv3pJ5wbHvWwBdqpj9qTxn0CGV3dDV5Cfdteq8YyOKVzkcOb9mpegYA+byD4m/uudn/muvuDo6XXpSelxvSqMdGFdWPi8g9gNP8egK0tcuW0kUZu59pehPMsSmvbTkzT7ANLKN34j8iL0TyXBVf+trvkZCuVFrrVjtFxkjT2kyRZx8E9nlZnT7nQfLBG+xW35B4k283OKDuMUnZjjpENKyneSKF1FJdADfbgKZhg+3piPFO9aftPmuReHlk3TbecWWAzQ7+eyXVY4lu+zA/IdhSZ582sVv8O0Ius/E9/z3O2p7/ynH/BP/+EdsYxnOIIWvsPtlt5/efTb9D82Lvaj7JWerW+fnK1G9EQh6vz6ydXs7isV+fXT662eugWV+fXz652QWJWr9bXz57y/7dNxMd+ffofVhhVgQplbmRzdHJlYW0KZW5kb2JqCgozIDAgb2JqCjQ4OTIKZW5kb2JqCgo5MCAwIG9iago8PC9MZW5ndGggOTEgMCBSL0ZpbHRlci9GbGF0ZURlY29kZS9MZW5ndGgxIDIzMzQwPj4Kc3RyZWFtCnic1bx5YBTF8jjeNcfem70PMoGdsEk4NiQhmwABJMMVg4CEO0sMSSCBRCEJ2YAiSsIpBBFQBBEEVFRAkOUQ8CQq3vDA+/l8SvThO7xAH56QybemZzcERD+f3/f3++e3YXZ6uqurq6urqquqZ6mvm1tBTKSRsESaPrusdv6465IJIScIAfv0efUiO/KDFCy3EMKsmFE7c/aDR266QAhXSYj20MxZ82fMTDJmEGJKIOS6lsqKsvJRU4amETLiEuLoU4kVj8iLtYTckIXPSZWz628bldh/KD4XIs5Rs2qml92w6g7ENXIHtu+cXXZb7Uq2miFk1Ch8FqvLZlfMtC6Ix+dZhBiLamvC9RtIcxshk99Q2mvrKmrvHnHwKD7/mxAW8RLAP+VjwqJGeWZYjtdodXqD0WSOs1htdofT5fZ4O8ULCZ27+MTErv6k5JRu3Xv0DKT2SkvP6J0ZzMru07dfTv8B1w3KlQYPGTpseN71+SNuGDlq9I1jCsaOI/8/+/An+BPkTn4RcZH59PuKD9efOMmthLR9ozxd/pYn/39LhU69HSIvkH1k+xVNK8hC/N5zRd0x8gp5kpY2k9V/gvYZsjtaWk82kbv+EO5msgTx7MDxL39KsXY+eQBHPkqeQEHpCkEc9ZZo6yfkzWujgs/hTXIv2YmQ95Ij+L0ZNWMB8wO5lxlHqpmP2EVkMVmJc9wGVWQNwpeSHVBEpmKt+plKKkjNVUibyFryGLkdtbD9wy9q+y8xXzqIlK9EPBtIFZmDK2m51KXtB5LF/ZOY5ffJMdaHtD9FnqZdFsX6avPZm5nDDNN6Hz6sIzPxKoOPkc7V7OA/4eb/649mEdoFJ/e2IkNt78kNSPsnuELPIjdOSdcXTQkVTpwwftzYgjE3jh418oYR+dfnDR82dMhgKXfQdQMH9M/p17dPdu+M9LReqd27pSQn+bsm+rxOm9USZzYa9DqthudYBkiqGIHS4RE2WbTllfmH+8vye6WKw72Vw3qlDvfnlUbEMjGCNy7Fn59Pq/xlEbFUjKTgraxDdWlEQsgZV0FKKqTUDglWcSAZqAzhFyMnh/nFozBlbCGWVw/zh8TIt7Q8mpa5FPpgxofEROxBqVKoFYdH8uZVNg0vRRphv9Ew1D+0wtArlew3GLFoxFKku792P3QfBLTAdB/efz9DdGZlWJzp8LLySMHYwuHDhMTEUK/UEZE4/zDaRIZSlBHN0IiWohSrFNLJKnF/anPT3UetZFppwFTuLy+7qTDClmHfJnZ4U9NdEVsg0sM/LNLj9rNenHlFJNU/bHgkoGAdOa59nJGXh4QIn2z1i00/EpyO/9tvrqwpi9Zokq0/EqUYYYZGYFxhovIR8pDXTU15fjGvqbSp7Ghb4zS/aPU37TeZmmqHI7tJQSGiONr27Cohknd3KGItrYT+oejU88aNjDjGFhVGmOQ8sbIMa/Bfrj+xn5Boa4cp+KNmgmxB5iCHExMVNqw6KpFp+BBpHFuoPotkmnCASOmBUIQpVVqaYy2uiUpLY6ylvXupH9d25PjCpgiXPKLcPxw5vqos0jgNpetmZWH81kjcT0Kiv8luE3PSQxRWRKpGlFeJET4FmYS9OnZAuVG6NFnpQ9xP6u1bAQdIsdnFHD+iUfAM9w8vjf6bV+lFBCIyOj+gCsKEwog0DAtSWXTFhu/PSMceZaW4YFXD6GJG0v21Ead/SPvqKmQNrxpfSLtEu0WcQyOkdHq0VyR9ONUrcXhT6TCVBAWXf2zhMyTY1rI/SxQOBkkWCQ1TgN1DUcpShjcVls+I+EqFctS7GWKhkBiRQrjCIX9hRUgRO+RQjxaBCkeIysqEwpHj/SPHTinsFyVEbVDQccnDr0LjLxRUNCiAEV2yTixkBDaEgFasEPOw4B8yEL8j2mQdXlZkOK1VBHfIQLEQBBKDRjIiPcThFcOicMrzFUh5RZyG5sewaZRHxDM0X0gMJaqfXqkMNovRgbGHTmFqfqwJzRQ26FA+h+bTKoWXXkXoxUJ/hT/krxQjUkGhMjeFPZTLUWZQnkfXasIVTx2YhWwiidgce1CYGckLCB2ZG7mePrc/5l/VPCLWLDbp/CPHNynI/VGEBCkfESGKCEv9bAK1BYpC+9H2ilZUaarQTfslSVHmyv4KEv+I8ib/+MKBFBrtyZ3C7cpYdjISRk4Y0isVTduQ/X5YMXa/BCvGTyl8xoq+3IoJhQcYYIaWDgntT8K2wmdEQiRayyi1SqXyICoPCqZx+KCj8MIzEiGNtJWjFfR5+lEgtE4XqwMy/Sij1lnVgVLoQBJhsIVTW6QYNId1OrWukdbRz36isEwy8JJO0ksmxswI+0GpOoA1z6LvqQdy0ARmEPZjr3G0+ig07tdLggrRiBCSSuGKiZeHnjil8KCJYDf6jQMNUT4oLt5KXGzcVoaL5Yqg3BGqbCoNKcpG3Lg0+A8i4B+Ey+QfhIRoTBGDv2JIxOgfotTnKvW5ar1GqdeiiIIbsHsjrn1BBBQJKCpMRJUU498UmqzfKisVQqPSZP2yFxJ3Ej2RTPQbWaIlPsnMaHhWw+p1PMthVe7J9JM2O+Tk2IK2YO8MR6It0WFLtJ3kKi5uHsWe5Bf91sBnX/Rw/1GcAyDFbd9wv/AbSC9yj+Qzkc4JfreG590JhEtPM1kd7vwRppCpysRaTOA/2nZeysGqPP8k/ww/a/aDiTP52U6dxJJQTWcIdYaRnYElnUHPd+7EsfqSUKkGxmlgmAY0rIPkBouLiwPEmxssmVpcopRtdpKTgw/FAfoAHkq0Sjg4uUSR7dsFgpl9srPSmG5pbHZWUmKm26NNA39XjcvZBTxdeO4X+ZT8dWvruGfE0wefeTO3bmvpE3vLs8EFzHk5+LzvqQd3HRi++OXBi+bNHBWAZa98CDOSG25tWDB8Ur8Ud/INRbePefr4ffsTaytqawZPHBCw+AL9J9QhjycjX8LcjcRPMpAzk8QePbRaV5wljWUtrngus3dn79hQZ7dIbNoeY0NarY3kxoElriaOMbJxcTabsSBks5KkghBxN2fC9kxYmwmNmVCbCaWZUJAJGbSyeE70Q3IVvgRsJOhNR37Msdlz0il3lMqOfFE4w3dNyc7qkwvZWSnIB203OzLFZXO6g5l9XRp/15Ru/jjoljkIrgNtHONyumHrozs+/em/tbfNrzY+nwZLT/yl54D4xGHXlxdpNMOPTJn+YOjVhiV5Jc49G3Ye0nADltaNm2KDpOf2y2kFY7W11qraO2beNeWh8SGOySgfW1iqys0KjO2+Q/7EkzJpoF2vN5B4A4Zvdjdx8wUht9VsMRDX6QRoToBIApyn320J0JIA7ZXbE6A2AYrVz5w5dXV1JDczN5fOu12ClQkn2rLUJbf5bVndgl0YT3AQigVOms3peVNo8YZDmt0YUzLsoEfnH3iMeeqWeVkHtrauZse/0JNPzRlTW7z/RGs60iy2fcNWot5YSZ7Uk2X0cXFGhrXZTcaSkIklmpKQxALLEodoh1I7FNhBsgOWKXlIWnqxukix9cCVaBdQW2J2os2pgTflB4c+Z19YUnmb/D2c/MwJdb76xWvQwdtyyX/ya5SrSShXnZFvBuIm+VKqTWMkGuLx6uIKQjor6ywIse7tXljrhUYv1Hqh1AsFXsjwwhlvu7TEhOWykoOV8XdlbNbETDtLhcKlSEMfrvNv3337A3z5y1cvLHto6+pV9z+yiukin5W/gkSwMRnyOfnzlrdP/f3Dj06ra5qD/DnMjSQ9Sbk0UKvp6koQzIQILg0XSDV3Zb1eX0EowWtlDQUhLeu2pqLfD+dToSUVmlOhNBUaUyEXffNUoOuprCjqPFV4VdN/p+FUWmMqnpIOaQwKdvAqFWfZw/86/dYnids8axtXNhROW7R5yQ3vvXXwvYRHLEuqb6/PmLpxzcIR3SGw6fFlq32Tx06YIBXEd+0+urpg/eaFq5z5o28YmTawZ3LSdTeUkahee5H/dtKJ3CrlOWwabSdCTCatjRXiNRrCdiIFIXMntD6dOuktFndByGLVswUhvfu0AM0CbBdgrQCNAtQKUCpAgQAZAsy5Wo8VzVUUOVr63cSV1enrYRKVRbMHRZurG52wFpwPrp+7utPWMnnn+YsX/wOfPmtZe9eSTRr4+dm3pub3aiPQBeLBBF1aX/I2PfnQvk103Y7Kv8EijOr0pKtk43ii43UGI+F3FunIZrzSAx1lJdnl1Gj9fbL92bAopfuCqYWf7Lz5nsErFn6iykBl2zf8fNwPOpGpUg5r9bh1er3bysYLFg+YWY/H4SAlIQdHdFadpCvQrdVt153Wteh0JhYvE+qQySEKUEwuG7PLpQ5sQCZ0JWghg6LDo+H8XZOYbCtJzOSUlWe9X8mXwPIv6H7/lsnyq6c/kN98FGbBkM8h7fqne3/M/Sa/J/8mt8qvQvKNh1/cDyM+h7GwMLJ34AIazjPoJRB+HOq5FjW9SOpjBmJiWA2vIyzH6bSs3WZikE4T3TDtEarp5+3QbIe1VPEz7JBuh5hZUmxSkFpjSnymLRi05+TgP7RLbCLrh6AetBotFlO6cWsebl34yGtM7sdMn9YifafehxjL0wkJsEUuV/Zd7vuE8Yvl3vDO8MmU12NhHXMH+zwxElGyaYjJvIYFwmagIbPoQU/Si08WF9OVi+mKqh3MHY/Om/PwI7X1jzG75+x8PBze9rC6drw8mb3E9SduOCu1OXQWm92g17MWO+f16BwWh8emtxA0zkS41wuLvVDvhXIvjPPCEC9keSHJC3YvMF644IWzXnjXCy974ZAXdnihI/ykDvBuCj9T7fBhhw4b/rRDR3iIeAEN3novLI0ZvAleGEZtnugFpxc4L5z3QosX3vfCce//Cr5vi1eaEoVvB26HbAdrx9kRhimI4SJeaI6ZYqxM94KVVmqntu9Zc+aURDW/rsMn1t7+mdPhU3I19P/QQzUpqDKK3lxWIMW169otGw1JLkDQgXtiX0cQ4phjN2SmpO2cZpPHN5/l40axed++KJcOrV8tTzbepfk5wGW37o7r9pn5VWb/xdf27hpP5WYZ2v2vUW7iSYk0wK7TGaGTsVOCYOfpVu42u/TE8n+5lZPgFTs52JzR/TJoc3r86NWhr6IItg36/34n5/q3jqN7ORO+tPfyXs68gzR3RkUfyL9FXGSNVGl2gAYYxsW5OI/bYCkIGdA70aDVdmgs4PJ50j1jPCWeBs8azzaP1uLJxeI+zzHPGc85j3ZACZYYtY21IOg+Ws97pEnl+R6pW2q+6MnwlHpYyYM7cCBQPAdXC1dF2dTQrqn7cCY6bHSFMpU5+m3+7CDVVY9L2Y07Q9AFVYceeGDx8pFZvfzDB73HHrk0gj2y5Pb1i00rdXk3lS2h6/Acfi1EO84Sj2RgCUFTDpuLCKHGJ0fhXzA76HrulU8+Ue3cJNT3c7hfiySNbJPKEz16vY9ju9tsrI/NSE+weAzOOGdyQchpjQsUhOLcRFsQcnGg4cDIEUHKADEDTmVAJAPW0jLJgIIzGdCcAWMyYHsGNGZAegZYMuB8BpymBd3U9q09KrPUQE5V/fr2vQ/d1iu2PGru1Z1etGXTJacbH+70waw+fYPo2VnZqI+n7I2DgEna/26Xp+0LysHMBA/c+vpzb54M70pjdNyTmoP5S8Y3LZy3ZuLSfHnyqsb4kWNhwFOVVaADAXxgqyrrsl7bZ/elV+V+7GtLj1W80fLZy+XPqfxCOT/Hn0DPqyuZJPXuTOLiLB6NRZPkt7viCDHiFiZSNyxeccPWJkFtEviSoC0JWpKgOSnq1pAr5pnbQb6V3TU6NyVOCXaLSjlkqzu+6rCz2ZmP3X7yJbhnwY5Mhjmk2cNqW/92212bmpo2rpj/VOUUcIKX6TNl2nx46aJjVx9rfU+o/cfx98989MabKCNNKCODcA4smSeNRRnhOYxvXed5aOHhDA/NPER42MZDIw+1PPh4sPBwvkPTdh7W8jCGhzba5TStbwe+0vpctk9EnScVQZxU0yH+xG9ZsTiAWYH+lIP4JasGvQNicrosGoOVs6Bu5qKaBDs4H0HFf3e7qPuu6obLdo9mt44L1M5ISk4aWDuPHVTXdDR51QzDY4aXDrWeoOu2VPGZcc4ejMaKpb5d+Lg4s5eYSVIyb2NcLgGl2momBheTWBBi3JFkyE2GtclQmwy+ZGhLhpZkaE6Orp4yF2X9onFGzpXLB9ZEJX5SPSRl9bSU1Ku8arluwaNBRsc8pTnEcXQxX7jtrgdWrdi0Yj7TtfWt0HRfg6HPLu5bOTS4sHKK/I38xT+On/7ig7ffxLkU4Fz86F8ZcTbdJaddY0L/34uuZjik17KucAgd0D/07+2Kgx8rI1mc/9f//vfCt0B+/fbI6kceX3ff9m3rmZfkbfLdUAfT4Ra4Wb5X3gS9wS7/IL8tv4+efwLSgD4e1wlpUPSgQAp0tmlMRg/Kv4b1J9ninfFzQ04nq9fHhUMW0xoTY+BNSJp4mbTgZc82auE77ErgVOlTXDttilKksZq2Iwc7/fDBd5dA8wPkjt+TffDBXb0PhF/58siG5Qs3P7xw8Xo4eUaWYRqMg2pYIX/u2yN/Lp8vKrnw4abH71v06Ol9VCYelr/UVqNM5JIbyUIpT9D26He9RStJHo83kZDeXks/fkwB1/mDEMeZTDd8GHIM/TDkcVhMPhNG6CaHyZE1cGDyh6GBhMkAO5eRldXrw1AWofPB2bXrdzr1W4MB1Ye9OhaPufMMdc76RveyLLti+YN9gyzOVzFm2VlMkr8rh7G4nQtmJvVt93jtistr5xXWxIHKm759tNXhkw3TZ7GaIa/MeWjvon+v/mScptuW+uSxBXfd+KD82cs/yHe//xD0eG0d9Nzed52896nv5Y3HfoVnwf49TH2m9ZGl1RUPTSmZfufp7h7mv8/K7+0oLMxbsODE0zsg/vHD22XNjtDUph/uOwiu+z+UZ//2kvzx1pGTaycXHYOyf4IX3iJtT8uHv5hxZ8PnS25b8e5DN6k6rvGjjveAhVKbtwchifpE0a7Ti/pAzwTcXxKsXhtxuThFD02WRD1xlQdgZAByAxAIgC8AlgB8HYAzAXguAE8GYFUAFgSgJgADaKsxADdj89u0eR9tbghAUQDGBEAIwMUAnKOd2wHWB0AdIEABuABcCMAnMdTY95YAZNEmHDjnIm3Dnttpz3qKemSMNCMdQB1+B6VLbRUo0tMBYJppz7UBKFUokoyQEYD0AJCAuhvST8llj+2aXl1HB/BaTl/M1cuM5T9yLhsA6vflUN1KtKladFUepD0d4o+1s2RSbXj5wagz1X/DrAVrEth+2+bsuP/ApNp5S5inHrotsv1yhiQ8Zdots0sPvN2arrTse7h1NdWxlWjgr6N7jZZUS/msVkswgNLzFs4FZHwISJseWvRwRg/NeojoYZseGvVQqwefHogezndo2q6HtXoYQ5uutb1Qk6xuMWraEh0dFie+8tChQ7y4Z89vLVz/i6+hLGL8zr6FstiJzJCGE7PTodFqHWaMT62egpDP2eBc4zzj5JxOq1XU1GoaNac1LRqeaKyaUvrYjBVaPavRGAzoHhrcvitj1Tm5wfQrMpGXg/WOTouangDHipWliyyHXS17/nHufMvjnyQ8E1dXtaaR6frX05WzTFueRXfEATbw7dkYN+XmF9UYrUEuZLYiT+MwVrdqidHAcgaOsBarQcDdPDf3irEdVjs6R8qoHn8KY2t4+vmnntu394WnXjjEOCERTrx9Wk6Vv5K/ltPeOwEnwYdrVoq23Y623UOSyAQprYtdq/GaUH/tbHKKKdGSiDbd4rMwcazFwuLWGQ65tKw+HPJoQauY92Dx1QmMdvse44eV0KwNcsXuoEyhnq69g4EfBJxd/vnHx14P7OlzdPNurvvL9S+e/eXTr384vmXJ4g0bGm9cPpr5VL5fvn3VZiECIhinzAbuo09b5R37dp/av/HBg9cvprwyIa8Cl3nFckYD4QwKrwgrXM0r3CNx07bbrAx6GHYbE0BmPf/UvucUZlnlM3LW2+/CO+DBv3ffOSEH5c/V9bgxuhd2J9OlHK1GSHB1RXZ1TbYmaDQ9eibbrDZrfcjmdSwejV8w2mIDK48OtuDzecMhH+WdyrhYAtceZVwglse8VsrLnUi9wQBkt7uF2m6qEqPv4eoCXKdf/vlhm/fZJLCs2Lz/iRnT1j+6bMmt95medv788vtfb1y7NaLksl96wfbb8qXhRVsW1c1ZcntN3N6XX43ctasLZztA5zYTQwgTzq0LGSSJCSTOonN1dlkI5xN1CXF2uzEcsmuBJJCE+hDxktz2hLMyiSt4G8wexF9FZRxo8V+ia2bwvke2NY5ZMT98v/koEvfBlyPXvxNe0YU50zD34Lo77lgxqb7xzjm2XW+8+cy4Rx7ZPXVjnpKzYkkI+R5P80xJJJ1MlNICGp853pFMiMOtN2s0Gb3d+q7du3afG7J0BYema1fWak2YG7Jq2V5zO/pIHRNt1+Y2imffbPTBae4kyl42KzHmjDhUuUWPvQ8X/8u/v2jbuiC87Pu3T3+/vP6uDZ/JvzUsW3lnwzL/ltUrH4Qe962Fla/87cNXm553csKh+Q+/cfyJ+Yc8nPsZxnzutlvnN8xtvbRk2Zo75U9XK/wvgtPMGKYWZ+uTbCi+PIZ4oW1wCph0ACDpGE5G0zuO7ERXEVyA09u3Y78tuG4WfhExkIDk5HQMYzTxHIdGSwcEYmulxJ7BYHowajSVRUq08dnJQVuiawvMlF+G0Y/D5E3cwH/s/vKid5Niz9MRb1+K1076SPE23s4wOuDB4SScjQuHdDYbGDUa8CrRrT0nPdghfm8P4P22xGzAsgtw/cECieyc3a2VzLIXXpPXMllmeWMfK6BjJ78EuXezhy+Nuoe9VTPV0frNDU4qkxi/cCzqtJGslmbq9GDQo/kzGrUsx5lNPnOumVG+SsxtZs5iVosNZj7HLI2flF9qbjRvNzebT5v5M2YgZvWZI2arOcMsRRtbzOfNei0DWgOns/CEc6lhSK4nB6YqqYkAftepG2qmTUnlRc8YQItTC9qUdB6bId+79NAh+OQ9eQT8Bb6bLTfwJy6VMWY5vXWj8i5b2zdMDt0XHUcYHAJrHIo5AorJBUGAzVvlKiff8puozLmK6uEinHNPyanjeJ7o9cRkJnqDvj5k0HAKvy+zWiFNSSMYGJffaofE7ETO9NcDoee/BFOrkX2UOycflpvk9a9AHDMRlm1C/L628wzu48RJhktJZqfTaLHoOc7tiuN1fEHIaNGDidVLOgtjV+KjRjfd8lB94k+i5rQvspq/oCliVJtsJYfRN+gKuvzq0RLTM1T81zuXZt/2xhvB3KRhOu+PzLtLfvhhSevEG3PjVFuqRcX+letPDHCT9AsQjd7AMozGwBpNesaiAddmEyw1QakJJphgmAlEEzhNwJmgxQTvm+C4CbabYP2VMCrATLVZbevY8AmtV/EW0XrhyvpVtH4krTeaoC82vH1lQ+7/jpB2mN8DMAUmSDeB1YQ7VjQ5WPInbt9lv+/qpo5ZwMvpv2DuVRFWoh+CDrcnFxxBpuID+dbm78z9/N1+Osb1b5W6vzp3HvMyrsXWtm/4HihzDjJCSjVbtZyVQ6PNs8RQEiIO0QXNLoi4YLsLGl1Q64JSFxS4AOvbCYglHi+HoXzXpBQaFbtjKTwNx3yyV5bvOXb8mRffe3Gd/LNz4fnH2UWX1rz0xqnX2fJL6578RUltoabsRB34CukxY9TZhVRK/Y0OnUMQuDgdRp46jvWJRke8I74k5EhyMKMtDmAHOYDDu5V3OFBl7CUhnuWEkhBnv9r2lxSXzLnGbouKRE+R/Ym2RBFJ1XYBQFuPT4rR7wHKnftK/u5C63GGwPm7G3celr/bsl4+BoM3bRwrPyJvgfC+7bD6+Xf4RfLuO3d3dj4Dv9VNk4eEW9t+lbnFl3Nw59EfVWLp5dIED9pQa2fWyib5rYLJqnPwhI8vCPFWIipnwVISiElwKgkiSbCWlkkSFJyh2aUxSbA9CRqTIB03/SQ4nwSnaeHaObc/yUHx7QmoaG7Nb1NCU0eHCBzO/qUZ7lmwvQ+j4/ZqD3FMn63vNm1cedv85ZuanOAGN9NnckWX+/gB31zsA0d23FLEDHrvxIkz/zj+N0XP71HOftH+eUmpNMBls9l1Wru2U7wDq+1aF2suCLHW0/HQHA+ReDhPv9vioSUe2iu3x0Nt/FX5Yipt9pzcKxPGlyOb9iNgRe60cF3/R++MPPF0z9KJDZsOHdICu+jm6fv+okQwdTVZkftbF/Mn5IXXLTYgvS8g0XfQ9yXulspoXhVYYpd4yOBB5FHCgPCQcz6WH6vloZSHAh4k2nC+Q+pMrbTG6vfRZFpHeJGHP9fuqzJpLxxTDoaUHJc8mevMjaZ+e7HU10t8Np1OT/QpyTbOxag5LpNFJzBdaY4rBXJTYG0K1KaALwXaUqAlBZpT/qccV9RRTuzaze9uDyJdHVJcsSyEkuP6bRLPHdI8BRzPZWxd9MZrL9y+7Jb5uSs2LV+gJLme1z0ih3jNE3243jMc5cXyBfnTL16ecmzTB2+9SvcC1HdepPpeIKUTg8Gs5TjezFvijKBhdYS3ixZotkDEAtst0GiBWguUWqDAAljfwQQFgx0TiLGt2qe4IUGgxgitXhzP7/6M+c20h4uUPXGpkF90Mf94IbsF+Urp4NKRDh59sDhl7VF0WMKiEYzakShydTkSXTuPMW8gAmELrknMZhmIjQyURAvP09N6u8PClWAYxWu1cSXo/eNcHID/6KlAe17sCimmVgg9p0xOa1Usj4iG52KLPO0YM/Zb4Jrlo/IyWAIS+/Eb37R+wi/67ATYWt9X+NjWqrwtrrwRDk9JbUBsWo3JEsc69CbWxjp1WieGpzodGHUuNs7B6ixgsrFa1zw3zHDDBDfkuaGPG5JQod3AueGCG/7phuNuOOCGHW7Y4IblMchhFNLpBo0bqn5ywxdueN8Nr7nhMIVb6oZ6CtoRoyaG8TBFt56iq3LDpBg6BDjrhg/pkAjzuBtWuqHODVBKx0yiRPW7QIc6TnE00nFGuiGDNiM9F2nTdgW9lAEL3FBOsWe5QXDDeTrA2244RIdfSltz3cBY3UDc1HSW/C4Hc9VOXHJ1+9XHc1cezl3emD1B/IdOn5IgLLbZPTn0cFj9p+zSbLc4YNW9uq8j6FC+uA3vvJCkT3nmtPzOgSPaJNsXL72Q5jsZYVp39drVmoGinOh96ga2qLXTi6vYeLq/0LN9XH89alKa1MmMm6VBx7NxFqNhS5HRop7yb1FP+a96O+XySb8tG9119bT/lVNb6HH/KWbLqVOqfmgYlPF4GCed85J4qzkuPi5BYA1eg4UlWicbZ1+bAEvp+V55AgxLgKwEEBPAmQAX6AHg8QTYQQHqE6A0ASZQAGsCcAkw8yxtPpQA62lzAe2fRNuw8/u0aWkHvCpSFeMq2kVFh/B9EdfbHXCpiIwxRM/FEI2MIbqYAGdjuBoTgKml40sJkEvpJwnt57glf+6M/Vne7kppiB7RRsMlNV/XF+2NH9JjJqsLeAZBXwwU+En63t3k9cvlNf0SWW73RbjVmazRYfBR+yO7Z8vagxWXJLZ5d3XNC5cm8IsupQ+4q0v3R13sO9SmzUTfbjuN66dJA7QaM3F4vRqXEte7XWjY3OBl3W6BFawlIcHBosOXoZW0zFpti5bRYqDVKEKpCKIIdDsKKmHo1bH0FTmo2HsZfvWNjUwMp5W3ndQk9kyohdFfQdKYwwPfe+iCLIP9h6ZzN8hFzMRa+bkXP5WbdzGvw2S4betTfW6rlj/GfeJH+e0J+fJ2Ob7uzgiMjO4VnEzjowlSJo+xkYHVYsRk5nUloTU8PMvDfH4lz1h40LEYPAGg+UUjrleMuGiORTOXJ1CsBtYxPVDMemL02sn1unQvm3npL+xGftEWeeCDsmsL3a/SkIZDyjsjkCF9DAzHaFm9Dj0FTvE7wb5ADyP1MEAPSXq4qIe39fCcHjbrYZUeGvTAlNDcZoYeMNaaeUYPp2jSc40e1AZLLBmK9ftonrSWNkk0H3qONmFlDa3MjeVP+2LDaZo3baRtBXpIpw2nKZa1dGi1HhGJerDqQc3IHoslXEtpUy5tRSK0v0s5/5nAz+nY0CGiuRytenIu5wQSXczpF+UEbjn35UWB+3LLFjUmPCLfCMVKrAyDpX8rnhchS3mopy7TBB6G8ZDFQxI9i3yfh+M8HOJhBw8qTDl1qJw8+iBQeYGHs7S5lja0d1adM+yzPtZtAA+BmJfGnO9wztnAQ03MU+vo+/U7daXv54s5eC0dvD61wzl6lorwx2Lun3p4igDpsfNW7RU7xjWYGfuUzPnjVbjck6RTJwVVEeX5yOPyjdqFvyxWeKtH32A0yqyODJJStDqkGeNtXsca9KKhwMBkGEoNaw3NhvMGPt0AWoblwU7DSVT8Ocp+1e4SKhEleNAssXGvtb70JiyfMAGWvol2R/z1V7aFkLY28l94EQ4zD9o0ZGA/QoxHSAmpIQ2ELc5W1/k5bF/IPIg+tl9yqj422RyyoN1jQLKk5ANuUMXt7zE46HsM8OLf/05UP4uvwHnoMVpNlTwW3oDumtOlQe9Kw/IW1EC7Ephe41zUyajhHWGtRI3o7HzFbvmNE63fw7swA5Y1K2eH8vfQf/PXC5lTf5OfeQqDuU3y06ABx8X9K4DSPo6eLy8iCWSqlG13eD1OJ3FoNV6HiRC3Q8N17hJvCYfi41mn01MfcmqUpO9MLbi1ENYuQZuqJs6LO6bOrzgpVDI60Wi0PXcey/r6HWiYWCU1iT73z1+/+oN4OOebdTseu3vEwtxIOpvYukSY+9Tpn+HtM21kz6Oud/ZtWrYjrS/z0yZ58JQLSi4KXuHqmFHI995SV8IobH+Wsj0XxgCXjrca2AdnACU0JaCuQnvW0YZKy9XBKytXqmuIkTj7FfoaRpggbSdGnd7AgVbDMyzLa/VG3mxaaoZ5ZhhmnmAuN7N9zJBkBrcZODP8ZIazZvjQDMfNcNgMOxS45eYNZrbcDBqz25xizjNPMvMzNfSutLxm/tD8T7Nuk/ljM4NAkxS00BGl0vyTmT2uIEgx98GOXN8Z5sfNh2k9bz7a1iz1uW5Ifo4ZupoBlCQgc8EMSnawxcweMkOjea15u5mtN0OpGSaYQTJDlhlwv6Bdu9q9+dvNwCj9Csy1ZgVao8UJc1qW0WkshHFRXaFqAkqSIdBBWUvq6gJ1U4s7OAe/O+uLKRiqWCxu0YNfr+QXlRRjovyp/MnLsEhe9zrEgelNeR0sh+flYUwqEycXwWOtF1rfRbUgI9ouaN7nV+PeaCEC6UaCZLKUnUC6auIsJnN3R1qnTg6zRUM02Vnu3odDVvfRImsA71wca7brfYdDrP5oEZuMdweqTyAaFQZ+f5B95SuG6LIEk2m2XK2CjrmDDmXN+49s3bJt0+M7Hrg4YDP74EMXz2x7cNvWrdse5ItHFxWNHVNUOO7i+VFTphYU3DR5LBz46F+ff3r2zJettfwiU8tnH3/170/OnLmUfPDhrYeffOwJ5rXII9sO7n1sp3pOxh6FfGoT/JJdg/ZEpzMadFr0dNldeCmT6XBcCDFPNwj5qpvLna9aI62441UF13iU6wcVHxqmSZcYdMiA1eg4o0HDcmxBiLOAVnkzirjeN8JxIxwywg4jrDfCUiPUG6EctcEIkhGyjCAawWkE1I8LRmgxAsI3/wH8MAqfZATOCGdjaLdTsMZrgTkpZN8LFFqlYwfFWE6BODpke1PHIVUAdSSkiTlNiYrQ0dYaodYIBZRwpLrDvlTyPx5JXxUS/T4sih1CXPEKiHIMoaSsXZDoGs8Ut77KWlsfYcIr2ZRVKy/9bZVqZ8rJIe56bivK9FApBTcxDcuaTbsYYC1MCcOYNIzid+0N6T/UQl/tXWhg+YPUwNJUtfrjkY5rr7ofNHpntt0nF8LO+2AnUypPgD33wh55wr3RvVK7HOWpE1yS2ryddMoBjFNrA50VbFZOp9WCkdWaDXq9mXN24oX4VQIIzXc05OcI0FOATgIYBPhVgK8E+FiAtwQ4KsBKYZOwS2BvE6BKgP7CDcIUge0hQLwAJgEqWwX4RoBPBTghwAsCPCnAFgEQ6x0C3CLATQKMFGCgAAEBEgQwCnBJgK8F+LsAbwvwfAyerBagQYDZApQIMFqAdCFXYDoLYBEA8Z+j+E9R/PsEeEiANQrsnQJTRKEHCNALpyGAWYB+FwX4VoBPBDgpSDXwnAB7BdgsAA6wgA4wUigSmBxKUCdK0K+UoE8pQeoEHqITuJNOoJhO4DoBlA4+AV1goUHYJhwTzghtgoYIoPNaOT3rNJtBp3gduFT4pVhSxesp+RO5+t3LsDGwa71q+zt4BSDQbnyV8w0Uk+Ji5Uv1dNiUy2F5H7uDRueDAIL8v85e8KbFJ7Wdlcteb+2V4s396ciP/US90BV0r7MNEz6u33KpHF2iRTsPVAPHzrx030f3+8Pr2ANqHljxYSqj+e3JUjqYTA69g2W5OAzczXqO9XhNjIMpCTkcJJbMJnb1Nx6iV43EMnOv/VJV1INQEl/RJJIS2AMbS2Zzd8v3yiOOMRu/A/bIw7D2lycekgfAyY2PMSNaj/CLPnjxoQ8TWh9mv1mwqPUXei55E9ODK2C7IaU1kl7n8HiJbW9Ih7vioZSB+TqChYOehHx6j3PSu5SqN+UTySH1GJjvMBr5vSGfcYxxm5GtMTbgbZ/xlPGcsc2oNUp6c75RdTKI13o8EP8pbjbHAzGPQ3kLlLo92fRnHsq7wH1duByjhq8bsahwaP3gmgeyGhb7buu1uK7/XKZHanyvHulrJsSnmRJvur9nSiyvmEtjxSxJUHwULTLZiJ4KxosGLQZunI5nCWdv37yvPBLueMzHjWs9efTYMeaJz1t3Mvh3d+tZflHrIObl1i2X/hGLS9fRPaiP1Bl4XqNjNKzBSMNP4LVaEs3+GRXf9Peen2KalKgTl8wFM1n7pe+Osf/hvmy9sLX1VQw+Vbkpw1j+I4zl40g8yZDiXToLuvNCghFFxMhx3pIQ52ikCYviP/J/2387Ydcqr2aoMTrhP9olH//oY/nVx6EObvgIBj7xivzr+R/kX8D47QXgmdc/lQ8diMDoz2Ac3Pmk/OxnoIVU+a8Ynf8svwm9FNra/iJPjr7/YyU/S3sMLMeRuDib3WLRGgtCWkF9CeiUHY7ZYY0diB1qztnhNH3ItUObHfbZYRt9rIn9niqD/qTqjB0idthOf3ExhgKn0/7XYZ9ztPkUhcDmRjvU2sFnBwvFqDYdo6jVzljZQkdt7gB8zdjrD4NcWhtlbzQlHHubW4lUbIob1C3bQw+9Vh667bbRmYOG91PfS5qyqUm/SpNfyT1Grsh7G0md5FFkU4fREmc0mbWo/AVaaNGC9mjb51KaY8R87UotY9ECbj56ag5ExX2FiBm2K94r1FLPtYD6rO1kR3+OQn8zOSdwdWbclkilW9kMubJWDQr3b8eY1a1hlOs9zITfGlQaMWbQkVjMwNBXiP8fxQw6EosZWJKP8tuHX0n8JJ3kkLlSXpaupznJES8kCo7OXibDnZppMOvM/Qe4M7vx1m5jQ6kGa18mo7OXi4/n11qh2QoWa66V0bNWvu/YEO8mPuWgrH0xaD5njj0nXVHlnJxrvufBd+2mvnlpTe74ngfa974evNHfRca8Vs8gBneA2Iuou/bPH9lc9dE3MDkx48jOjc8c+aLm8Jz+63LvL629Pq2fPLN8Umn54CULcm94bf43m5dff4+pYXDeqaPg3jhod96Gxx5YOu/olJOnHr8Q+PXv06x3ubn5+UUzi+oWZ9845dIjX50pf3P+6r6Kjo9kjzIl0fj2BinF4nAYeL2WEL3NoDe40Asx2LYUEWKwGHYVcRZ2nwu2uai+B2OvnZIrz0Ci2p+tnu8FXYntJdiY1PP2qYWtPyQH5peE2KP3ltw/dMXCV+4tu2/oyjtf+T0tVoPBrtGjc62Ps+vtCi12pAX9MbsZ3Wz7/56Wdgecby8xJV17zZ9a+LL8dMwlL753BBKzTvHMF76i2j/6mwf0zZV3DLtJDlar5Qin13H8liIUyy1FYKGikN7R7NGXA2kG4ZVX2FtOnbp0/6lT1JbKd1Jb6iVJJFdK8tk7EaJj4+x8cooroSTk4uK6Ik/iHEYNGtfGFBCVAzOUbvoLxauS52AlvLo90Te2Uv7AyMrvyz/2WDaj78DiiRtfGfSa/PnGPzC38odyo39hrXm5+8k3DE/D0A/+0O4qOQmm06Zq8VtfiWXgj8Sn/j89b0i/Phj7P13QMt+oI7zydjwqcrQS+2kHyTeSoe3/9Qtc9V/BjMc46iQ/iRRzYTIZrxVMDlF+LCdieRLec5R6rDvKv04qEY5jTpKxyo/psH4Z1nfG6zkKixe8TpqY3WQFlpfiVYBXpc5HHtZgHbatxH6Tsb0B60vxbsL7jXjNxCuEz0V434JXOsI1UTrCpArvPnzW4vhbcfyd0bHuwfoXlHGwXqnbqbTxr7e1KrTieDs1OWQmhf8HSWOc5AiW9TjGfxV6o33G4aXM1aPtTEYgfQ1YHs/tIeXa1URPYfaQm6I4FHxl8HrbX5R6hftYn4/4RtILcSrtWJ1CDsAQ2IJ/n2HYvpXVsWnsWvYsZ+K784v5bzScZotG1uZpb9N+phN1i/X9DFmGhYbPjHHGeuPjJqdpmul903lzgnmqudn81zhd3CiL3TLF8ppVsj5g/co2zrbBdsj2k/0nR4qTOCudu12T3Jy7v/sGd6V7p0fjSfX85K3zPtCptNOD8W8JorBQOCT8MyEr4S+dxc55nf/apUuXGV3u7nKeSsF4MobwOH1AabGipb4JRWwHw9EaQrpAdbusTG6XGyAWfFLLDGrnjGiZRU9ldrTMIcxd0TKPvu+GaFmD/syj0bKW3E72R8s64oRAtKwncZAbLRugCkZHy0aSwBxu/x/D0ph3o2UzyWZjtKG3xGYjJcBhXEeeYsdEy0C6sK3RMkPiOCFaZkkW1yNa5kgXrjha5kk8tyBa1pAE7v5oWUsucPujZR3pzj8WLetJAn8yWjYw7/L/iZaNpJ/uuWjZRG7S/TdaNpOb9THa4kiW/plhVTOr6qturygXy8vqy8TpNbXz66pmVtaL3af3EDMzemeI19fUzJxVIQ6tqautqSurr6qpThMNQ6+GyxTHIY78svpUcUT19LRRVdMqVGBxfFl1eFzFzLmzyuoGh6dXVJdX1Im9xKsArnqcVFEXVsqZab3Tsi+3XQVZFRbLxPq6svKK2WV1t4g1M66kQayrmFkVrq+ow8qqanFi2vg0saCsvqK6XiyrLhcntHccM2NG1fQKWjm9oq6+DIFr6iuRzJvn1lWFy6umK6OF09qp78CK8fUV8yrE0WX19RXhmuohZWEcCykbXFc1uyZVvLWyanqleGtZWCyvCFfNrMbGafPFK/uI2FqGc6murpmHKOdVpCLdM+oqwpVV1TPFMM5YDFfUVc2IohDrK8vqlZnPrqivq5peNmvWfFy02bXYdRqu0q1V9ZXK6GWzdqepVCBbZiA3xarZtXU18yh5vcLT6yoqqnGcsvKyaVWzquoRR2VZXdl0ZBZyrGp6mDIDeSDWllX3Gj63rqa2AomcfP2oy4BIlsrIcM2seRVhCl1dUVEeVhaiHKc4CzvhwLNqam5RpjKjpg7JK6+v7NWB3hk11fXYtUYsKy/HOSOjaqbPna0sEXK4PkZc2fS6GmyrnVVWj1hmh9Mq6+tr+6en33rrrWll0VWZjouShpjT/6ytfn5tRXQp6hQss2eNwpWvVlZtLl1aZRLjR4wSx9Qif/KQODEKkCrGZLJ3Wu/oEMjGqtr6cFq4alZaTd3M9DF5o8gwUkVm4lWP1+2kgpQTEa8yfC7D0nRSQ2rJfFJHoSqxVlRe9CY98J5JMkhvvERyPULVYPss7C/i9lmD8LX0u4zirSHVJA1bDLTtz/FlYmlclI582j8VSyMQw3TEMQr7TcPWjphFNM5leA/TfjPJXKSjDCEGY810rKlGXEoPkfTC688x/HnrJNoSbq/PRIp645V9zX5/jrMKW0TK43raotA4m9J9C9bV4GbxZ3wQEa6CrlsYWyroUznFquCeiBDjKVQB7anwoJ6OVk2hJlxjxDE44gzsP52uYQxyOsWtyIKKuQbLlVFu3oycrqMUlNN+sbmFceTf8/7aUjGeUjePjjma1ivPYdo2BJ/D0XmpPBtMx5uNTwovbkVKlHErabmM8rOc9lZkqzracxpKm/in44jRvmXRdanGvxqEValU+qRG+T2DfofpuNU4hohldY1FSqlC3YyrqBApx8oo/9U1n42t9RR2OtbPwr/5UU2bjfxRR50W1aVbqWZWts8d4RO70pW9zAtVWmZEZVOktbVYrqG0x7jXi66IQn8FpUoplVFNn4Y9ZtFxVDoqqUyU0RWtiK5wPaU2xqXy6KwUCmtpTS8ynEqDot0VUU5ORrsw6poYVW51lEhlJWZResMdcFdTastpXU07ZxWoWdGR1BnPovbnlvZVmUGlTOVeOcXW6w/4O4Pypj46ag2lqBz/1HVWJaoG+86lq6ZqkSrD9b/jXBnlb020Xy21QvVRWmZTraikcldL+qMDmY7UKX9pVPo66sr0qKakRWlO/7/up9BVSznYUSvq2mmZjTSOiup8dbuuze2gtbGVGI+WZxS1ErVR+cmLck68CoOiK1fbyd7UTl45C1Uaq/C5ntITprxMo3OYie1jcIRRiq+sxmsvoGd8jc/gRKJXfGDIIRNhUPQ+BCTiJD4YjHcf3geQIPTH+n54x3YigVZ5559+bwNO2g3NrbCvFUgrGMZcBPEi/FjQ3fdDXnff93k9fefzAr6Scw3nGMu5MedKzq05t+8cb/zybBffP77I81m+AOmLPLfv85Y836mWMy3nWlipJdgnryXP6/vu2zbft/Dvid/kfz3xq0wy8T///vfEf+WTif8kbb5Przsz8QywEz+7jp34d7bNZ/nA9wFDv6S3vELeqZfhheaBvpcKUnzPv9jd1/YMFBytPdp4lFUyyW1H7Zl5viO5R8YcqTnScGTbkX1HtN7DUHtg+4HIAdZyANY+DZGnwfI06CwHcw+eO8g2RtZGmEikOXI6wqbvy93HbN8b2cs07z29l0nfk7uH2fYkNO8+vZsZs2vNLiZ9V82uY7vadnFbNif5CjZDzQY4tgE25HX23b/e47Os961vWL9mfdt6PmOdtI5pXAe1axrXMGvXQPOa02uYMXeX3F1zN7s8r823bRksXdLbVx/O9YVxIjXVA33Vedm+ePBO7BT0TtQG2YkanHoptpXgdVNeb1/RlHzfFLw7Mu0TeWQPl8lOnMWCiR3IjmJnsXew/LmxbVL5WEYam90vTxqb3D3vVAGMyBN9+Yj5erz25cGZvHN5TGMeuDNdE21gmWjNtExkANefgM9nybWUWBosnMWSbhljqbGssZyxtFm0uVh3zsLWEBhDlFcoeTgKa/dPGB8IjDyqbRs3MqItKIrAikjyeOVbGjslolkRIROnFBXuB7gntGz1ajKk88hI5vjCSGnn0MhIORYkpdCIBWvn/W4yJBSuD9fPDSgfUAukPhAIh5USKE8BtY2WIBDGZgTDTvhQP5eEA+F6CIdRWeqxPgxTsRxGU4P1YYwIEQhBovjbMeEAUxERftWrQ4TD2C+MeMLR4bxTyf8BqxWo0QplbmRzdHJlYW0KZW5kb2JqCgo5MSAwIG9iagoxNDgwOAplbmRvYmoKCjkyIDAgb2JqCjw8L1R5cGUvRm9udERlc2NyaXB0b3IvRm9udE5hbWUvQ0FBQUFBK0xpYmVyYXRpb25TYW5zCi9GbGFncyA0Ci9Gb250QkJveFstNTQzIC0zMDMgMTMwMSA5ODBdL0l0YWxpY0FuZ2xlIDAKL0FzY2VudCA5MDUKL0Rlc2NlbnQgLTIxMQovQ2FwSGVpZ2h0IDk3OQovU3RlbVYgODAKL0ZvbnRGaWxlMiA5MCAwIFIKPj4KZW5kb2JqCgo5MyAwIG9iago8PC9MZW5ndGggNTc4L0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nF2UzY6bQBCE7zwFx81hBdMzgFeyLPlX8iE/ijcPgGHsRVoDwvjgt89U1ySRcrBVmOqer9s9nW2Pu2PfzdmPaWhOfk4vXd9O/j48psanZ3/t+sRI2nbNHJ/0u7nVY5KF2NPzPvvbsb8My2WS/Qzv7vP0TF/W7XD2X5Ls+9T6qeuv6cuv7Sk8nx7j+Olvvp/TPFmt0tZfQp6v9fitvvlMo16PbXjdzc/XEPLP8P4cfSr6bIjSDK2/j3Xjp7q/+mSZ56t0eTisEt+3/71bxJDzpfmop2A1wZrnhV0FLapLA22p99BOteTQhWq3hi7pOUBXqivNs+DvBfQbY7fQa8aqZ0OtZ22DllwEesc8b9B7as1zYM4yaJMzJ9gM+csKOvI76MiPcw35K+Q35C9Vk9+iLkN+q/nJ7/R38pc7aPKXYDPkL1GL2ZJnAU1+qx7yi2ryW/iF/BYMQn6LWCG/4Cwhv0V/hPwWdUnk30CTX9B/ifzog5C/Uj/5K9Ql5C/QT4n9VwbyV3oW+UvlIb8Dv5C/Qk8s+R36b8nv0GdL/kI95K/AYyM/mG2cH9Roye/UQ34HNkv+Avw28mv+yI9aLPk3Gkt+p/7Yf82z17ky6LmN/KjLxfmBxxl6UKMjf4XZduQXMDvyFzjLkb9A3xz5K/TBRX71x/kBpyO/w3/k4vxo/th/5eH8G/A78ovGRn7U7g7U6FsR5wd5inh/jV72eKtx7bGX/qyTtHlMU1glurx0h2B7dL3/u9/GYUSUfn4De+gpPgplbmRzdHJlYW0KZW5kb2JqCgo5NCAwIG9iago8PC9UeXBlL0ZvbnQvU3VidHlwZS9UcnVlVHlwZS9CYXNlRm9udC9DQUFBQUErTGliZXJhdGlvblNhbnMKL0ZpcnN0Q2hhciAwCi9MYXN0Q2hhciA4MQovV2lkdGhzWzAgNjY2IDU1NiA1NTYgMjc3IDUwMCA1NTYgNTAwIDU1NiAyNzcgNzIyIDY2NiAzNTAgNTAwIDU1NiAyNzcKMjc3IDU1NiA1NTYgMjIyIDMzMyA1NTYgNTU2IDU1NiAxMDE1IDgzMyAyMjIgNTAwIDMzMyA1NTYgMzMzIDU1Ngo1NTYgNTU2IDMzMyA1NTYgNTU2IDUwMCAyNzcgNTU2IDI3NyA1MDAgNzIyIDY2NiA1NTYgNTU2IDI3NyA1NTYKNzIyIDU1NiA2NjYgNzIyIDI3NyA4MzMgNzc3IDY2NiA2MTAgMjU5IDY2NiAzMzMgNzIyIDU1NiA1NTYgNTAwCjg4OSAyMjIgNTAwIDU4MyA5NDMgNzIyIDU4MyA2NjYgNjEwIDc3NyAyMjIgNzIyIDEwMDAgNjY2IDMzMyAzMzMKMjc3IDc3NyBdCi9Gb250RGVzY3JpcHRvciA5MiAwIFIKL1RvVW5pY29kZSA5MyAwIFIKPj4KZW5kb2JqCgo5NSAwIG9iago8PC9MZW5ndGggOTYgMCBSL0ZpbHRlci9GbGF0ZURlY29kZS9MZW5ndGgxIDE1MDk2Pj4Kc3RyZWFtCnic3Xp7XFTV2vBa+zJ35s7AMMDsYQDBAQYZBDGTrcKE4QVElNEURhhkChlkRk1Lxcoy1NQyu2ipXb1kDl6K6pR26lR2LD1dTydLu9t79HhOr/ZWyvA+a+8NosfT9/t9v++vb8Pee12e9TzPeu5rQ6RjQQBpUCeiEd84z9+epYz9hBA6ihA2Ni6McEMb94+G9imEqFXN7XPnPfriTecRYloQkh+Y27q4+UPDhxGENMkIpWS1BPxNoa9vzEEouwxwFLXAwBexh+TQvx366S3zIrfmqp/aBn240b7WUKP/kz3P7ERo6FToz57nv7U9iUmioX8A+lybf14gMDvtLPQ/Qki9vD0UjmzCB2OAmsBz7R2B9sYTr7PQBx6YO2EMww+5NNCUkT5FM6xMrlCq1Jo4rU5vMJrM8ZaERGuSLTkl1c450pzpGZlDsrKHunJy0f+HF3uU/RItZVegeLRYeF5xMSORGS1CqO8M6V1+xqb/v+VCIb4OoFfRXrQNfYK60WNoB9qE7kGr0DIYee4yv5hDh9AbaDd0/oA2o7Vo1zX3tQIb0UuArQPtQzvRRvQI2PB/grsZbUDPA/WZaAKKoCb8GV4BYz1A9UHUhQPoZ6zAadiDzqIfgfLTwNPn6Bg6Au0S5ALuBl34K3wE3Q+83wLPF+G5mYxSP6Eu6n7URn1CrwAa98Ka2TD8qbDkKTwTencAZXLNRgEUuorJVbDLp9GSyzuIfceu6PtvFHdpP7pTmN2Egmg+exTpLqX2/YQKme9RXOwjdIi2w94ROigsWtG/Wl5B30y9QFG9D0BnA5oLtx9/BlyupcfADmpwOX4IfYMWM3+h/yIfEjuHJgGN6agJ7QH9HKBvQlp0K1B5GNX/H9R61SVbAXHBzPyZ2FDfh7HlwPsXoL2XQRrH+BtmzvDV1U6tmVJdNXnSxAmVN46vuMFbXjZu7Bi+dPT1o64bWTKiuGj4sHx3Xm5O1pDMjHRnmsOeaDboddo4tUqpkMtYhqYwyuGiuKE8SmdwBq/fWe70V+TmcOWJLWW5OeVOb0OU83NReDGZzooKYcjpj3INXDQTXv5Bww1RHiCbr4LkRUh+ABLruVFoFCHh5KLvlTm5Hjyjug7aa8ucPi56VmhPFNpMptCJg47DASsErgi3XHnUu7Clq7wBeMTdatU457iAKjcHdavU0FRDK5rlbO/GWaOx0KCyykd2U0gRR8jCTsv9TdGq6rryMpvD4cvNGR/VOsuEKTROQBmVjYvKBZRckLCOVnPdOYe71vTo0ZwGl6bJ2eS/qS5K+2FtF13e1XVP1OCKZjvLotlLvk2EnQeiOc6y8qiLYK2cMkCn8jJJHGUz9E6u6wKC7TjPnrlyxC+NyDL0FxBpRqlxUTylzkEumxdk3dXldXLeroYuf09f5xwnp3d2dWs0Xe3lIG5UVQcoevpeXm2Letf4ovqGFjzSJ23dO6UyaqqeWRelMrxcix9G4LfU6RhhcxgGYKr+0zQCsYBwQMIOBxHD6h4ezYFOtLO6TuxzaI5tH+LdLl+UaiAzh/tn4mvJTGf/zMDyBifotrKmrivKZIxvcpaDxFf7o51zwLpuJopx6qPan20OZ5fRwJW4fQIsB1yNbwpyUTYThASrBi8AuyFLuvRCR/uz+DprAwKZBiNX4gQ0BE+5s7xB+l3YkggIOBB0hUs0hKl1Ub4MGrxf0lh5d74bVvgbQGHBMkGZUbezPWp2jh3QLmGrPFhTJyyRlkXN46KooVFaFXWXC37FlXc1lIksEFzO6rqXkKfvVHchZ9vvQYXIV0aALePAyjLLu+qamqP2BlsT+F0zV2dzRHkfaNjnrAv4iNmBhLJP2QTj8Am2MrWussZZWT2jboTEiDhB0DEZ5VehcdbZRDRggFFFhoKro2y0DwD1MMB5oeEcOwqeUXmGAm49CFwYJYY7dhRXh22oHxrYiGZz5YEyCY70r0DKEnMaV9GPTUa6gGdchc3hc4hXbg4F05xEGFYoiFAr+qcgTMGEAuxzXIUwRGSZSIyeq3MGnD5nCxflq+rI3oh4BClLwhBkLulq6hW9QcICMSEHTPd3iDCjXpdtsHCjNwj9gW7FVdPj+6e5LoWzsqaLIHdKCBFwPj6KiAnzIww2IRYQh3ZC7OX04NKCQ3d18zxx5paRBIlzfFOXs6ZulAAN8WSpbQmhZUSVuHLq2NwcCG1ju514VXU3j1fVzKh7SQ+13KqpdfsoTI1rGOvrToe5upc4hHhhlCKjZJB0ONIhmKZARyHA217iEeoUZhlhQOg39mAkjCn6xzBq7KHEMb1IKFMgxCMKZhhxhu+HZmBMIY51CmPC1Y2IyHgVyyt4Ja+h4ihbNyZD+2DkZag9lRjt1+A4bOuGVVOE4R7c2a3kbSJEJ0DwIoerai+Trp1Rt1+DYJnwBEJjyQXmktgCyoa0Us41EUO53dfS1eAjzoYsoBr4xVHsHA1qco4GRmSaqMoZGBtVO8eS8VIyXiqOy8i4HEwUWzAs7wTdV0UxsYCZdQ5wSS7piK1Lf5ZoygdBpUv/XS5IbH7fGfYDdhNKRhV8jtYiR/LUFLWx3mfXuXWUTqdmULI+mUuuSl6fvC1ZpqGTk2naWu+jTajUZUCeRHf97FmlHvcsl8GIS0oMnoJh+VjGONPSqeGFxnRPAZMgz8PONIaKN1s8BenF7KRlscMfHYxdWP0BXvD9Z9iVfyD92EM9sdOb/vb6Rozm4Oo/7NyANdGf8X2fHXyquP2u7tihD9754YH1IMhxfWeYAmYiVC/JqIC36VC8AilSU1CqPpWy0xpDlU+jZxOrfKwFmEOJpS4MzBmMhC2DB/gyU1pgJXN4kbHIU2CR651pMpGt0RRTUPXgX7ve/JZZ88uLH3z58i/3PDmjc8ncpbOvo3bfEfvhDf+ZPx/Fo574/G2cujr2/V0bN5c/8K1QLKJpfWeZG6HKtqHr+VQ6UWFQarVxcUpVoio5xRCP4tkqX7xFG69UIh0qLXCXgtSMqEQSFrAlsgfM0bJ4s6egqNjkoWVyZ2FRsVNktrDYhLcuM+5fdphbeOAZs2lXvJyueTa88cH45czI3tvqRj97+Clq9qU99avUK7PDvvu7+CZqrchbGlSE55hJyAi82TWsWq5WqWRyudFkNLMKDa2X6akqn16v0sll8ajUI/KWUGLAhKsB7oC3TJCUnHaaSrFH7hmNPQUJ1Ps5ecGdqW0HnrAadzmZsZ1T84bRu+JOPNt7lB7d1fHFylatyAPbd4b+hKlEQ9AkfqhcxpnjUJLViswyJis7jqMTElKqfSipPYlS00lJCXpaVe2Ty2lQoMdNVOgh9iWIjMgsQdBkvzZlIJ4hxanATtHwwswheWBxRR5OtDcQZipOSKXo1b/81/PvZT/gWL1g3cbmpzs7y05/iOfkPGlZMvf2lUMnr1u+ogJf/8TeBctG1FX5Z42u8QytuuWGDY/1WSd7J1cMHZmbmzWlnZT/qBxsbwjIMhFxyMfncVaEdFaLQqm06CyONIUCsRyq8sVxKRxlZjhOYzKlVPlMeg3oX9NvjmQbiQMbSnRLViD9GImkZXJij0XFCZLyiQtZ4s3yIcWFghIwktEr7/Y/ntM1/qttR07eh6nt732buJVZsfjuFzPw/zgnrbyvoab0zltPvnsEl3a//4dgU1fF7XftfkzQRTNU8MPJiRAP44tMCBu0cWBraqVCocBqWmFgzPFyM46jzRaZxWLxWhZa7rZsssi+t+CXLEcsVJMFW3r6DvNDgq0VSguea+HnBCoWWrDPgmUATZ234CJLM6z4xMKkS7BjyisqHrHshOX03RZcRiAzLUUWunin5UcLtcmCSyzjLT7LYgtjseBfLfgTy/cWKgj9ey10EUEqYNHEJ1bcb8G404LFAbtaW6GzlFooudlkUoDDKQxqWi1XKnQIgwyJNXvcnlKP5Ptu4cYg+PpZ9bNc8+HqgGv2LLhcYscFk9Cbb/AIMSOhZBZZKP1CUHM46SFajJ20x5RQjD0mS3wR9jA5f8mQpebHosdv2pclr8a1r+fIHPiuKPXymcr5vRbwT8dbr1E/9Fpbp0ymp/X7JDMNznkatISfOIKqoKhifAOejukR6gp1nZouocZT1Eh8I56BaUpOy2QsSzNYjTQaNUNDXFFpS7WTtfVaOCnJ1YxSpZOxiGYYDRz8SwsKyJ5LPQklWODe2O8vA56MYIt41iwHBm/GHho2osTUX2Lnd1Tsx9yB/Udx8Mvef+Aq/PPtsbvZo5dueQ2Xx9y9D4H9VwPzP4Dt0EiOhvAmeDGIUSoYdstMBqMtM7FOMHK3a8Coh+Wbij1yDPfF7DeyYw/Ag77l2LFLDx47BvhK4eS+kl2BlMiEsnizjlYpaEW8WWmq9ylpharepzAOeM0AQswhg5linA5MOwrSjeD1LkydxiNw4P3Y0gsxsOjhOPkNPHTrpW9+YlfEXoydPBN7/Ai74mLiZuz84+fngW4e+HEu+HE2KkYNfGG+OiFxqI7hhnCJamZEidZV7WMUWq1NUZWAdQngFQkJNpu5ymfTD8nwKDxVPqQgsYmkPk/i5QxIsozbWOKSYpRHilEsuPBAHE/PKCZxinjxEBJDiVuLQb9YLqPlWlpMRbiY3jqrlpXV7Fu2Zi9W4rTTpptnL1pi25d78g+73zbdqK62ObRjD7y9aFWlyz/Rv6VZr5o4gV8W2HHHS68x9JyUmdNrp6c8sHLbPfys2N35WePl7XoqjaEzSqaPrpxdc/dEsMFZfWeoTjYHYlkp79AolUZI6UkoSZ9EmWmdTCmr9mnA0JQ6BBtHUvDyuA3CrqWUKtiUuEFIUM5iD6jZI3cO7Aebav26ZUuTlgdvdb+T9M5SzYyhI02N5uapxZXUujt/+unO3ttGOeu0KxOJT4yEGoSHGiQLzeFLrImqzFQjQ9PGzERmaDafiiGSq1NxiQrrVDiOSVVBVk1u8Fmt8QyS1/t4poqhGAbMCNLrLJFVMWHUC/4966q8waalDySNPCxkjXSHVKZwUtaINzNUy6+xs2ndtpdf+PzdkWt27945HXuw7ARWpe1x7F4fW+VZ8Pwbu2fG3jV3H8xYEbnznnHVY/LdjWvmvHDs4fs9waYzoyaUuIua1gXf/1LMg1C70D8K+aOCz0pQUDSt1yl01iSNqcpn12O9XqNHULU2UDS4NsWySCpjrlVjSTvJKChOoBxCliD1jJT4qHg9/vi9qVsWx3oOv7/h3PM7/6TqlrXOXLZl2pLvh8Ve/duf3sF1T+7aaPUH74n9bV3sAni0A3ziNHsvykD56Ho0nx9jdnm4LE0apcjIyzMMs4xIzkAo2WJgRpdyrrQsis00e6wZGZlW63XVvsNWrLOWWiklbdWwmdrMap9Ke9lFCOvzpXQHEYhEpMHqIIEW3JqSE4WA2TjThsgEZykqJg/BSWQ6bEkAt8AFxaAvLQY3MZkTRtOiLzGnVj+cFcgbVRg3asyDS/Z99+rfXv7v5M9e6Nrz5AdLJ9w3qmNSb8uTXePvztlx572XTJO75l43c3z7Euq52J+2Z2br77EsuePIrsfem7UotOf4+oWR52oKTr1R9ocdvWsCMy50jt3QFrqLfmJSU0ohP2XkmJp7oA7o2wzx+zTELTmKQzzPqTU0QnK5TgsxWIspNVXv06jVChlL04ychsqrNKEAclGJW5AHqazE2koMxw7aQeKwEkNmcdBMRmXvin8ep6s+w+mxaXH5secpXTPeEmtiV/y2nPlX0rTeKJVNbMkBjwuQQ2hUyKcBfYZtYHEne5ylJrPYzrrZrexe9hDbx8owwJDEUIpnQZYTKA/L94AlOyDcx06yR38rhJjIxKYzfqirnagA3cJfR1PphpTUVJfC4TBQtKcQFUYLKQPNORQ0Sk3RKV1W2qK15FX5LHqa1iLtkCqfNh5BoQNF8OBCRyonwSFBy1hKq/3BUQznQ4pJtVOKnVpKLHeEwJgANWaxR4dpEItQDhkFXYN88drYnqInnW/ft4VLo0bXL5r4yCuVd7y8fPGziZQ8nd1tSt2e/0tsS7C5NervbJ9x65QRsemXhj72wI7nfZOGHnlmJS486u+YkbFaOeW+S3/66RM6dfHyx7Bx49LVNz4e+1X4zDtItnJ0I69GDKNQtisPKyklqTsc7hEVpUqsU9qV65RblXuV55QyFS1jdXImHqMaH5wPxWhZKgTK+a75ksxJGsRQ2mN72oG02KQPDnzIcs8999spZuTFtwbqgniga0XlvDNOhowWsyU+3mSWmW1JlnhkVCusDG02qZTxtK7KR+slOh4i21LPNc4TAynGaYJIJxbwmJwt8HLp+HBQOlWQ1F9pTKFXiKeH3jC1UjhV9D7BHo0tawr08yerBBvJxQ38RaNSp9JptSp1jpWmc1Gm3Y7UdJ77fjeUaG481R1xU5wbm8XmXe6n3AfcH7nPu+Uu93VuCrn1bmrueTc+5cYfuXHUjcsAaiNAMXo3ZsjgeTf1ihtH3HimG+e7cbobIzeGFcfd+E033i1MNbhxoXuqm1K7cTFMfe7GG934FjeuIvBlwvhUoE0ofwsIZWq3y01ddONv3Xiz+89uSsRe6MZ6N+emgCuoiZKzq3zJeqtRmYPTHRqj3IIsMmLmWl2a06lSq3P7qyxSaPWfljzSQbN+lniJtWV/eSmOzO8vOaVh0q2fb5AKtIFfKSqY+usEortij1kmHrpIFBysUxGE2ni7dcK0yB7bwv3S6XD8A82L79PWbG+5Z0P88n3C7HPJC6klS4dVTn5rW+9TdI1wVuyYsWj+Hc2SxoXJN7b1bie6zoj9hivR51CbpfNGGc0izGK1ikU7ZjLs5pkMcrsuF2WkzHPCYRXsW4u33XartW7oG5xxbOy3e5d+vqN+k2A7UOvJdkHMTMBOPhslJFjkMlO8CdNyE9aY9PHxFr0qLg7sKZG2WKztVjzV2mSlrOBv+xffXkHe/LjIoor1Vmy2llmnWiPWu6wssuLgP6043VpoJeAR65vWb63yj+BBRa2Y4q1V1gbreus2K7veGrUet9ICnpqKyop6a8hKIStn5a10CaDYa8X5ANtu7bQy26yHraesdKl1nZXSW/E5K4b0tty61UrlAzgFHgmFqkqvo01wjtYmIBSnNQpnjQJywACv94jHDSypXVS3axYoe76oeRecN4TavGSQ0onxDKR1UH8xeKmTzoRkR3zWZIEThwMzZw+kp8ws6j1x+0syp3Lo/l3YcOZVRWILlY1R7By97aXwqzMvTaAPpFwc1XcpxK645B7yzMf0kd+WC3Et1HdGhqDGioMgDfW2lTaqaFVKsjy+3ic3IW29DzHXrrdVmHHCC06iCQNfcUg8pnfheDyG/SS25kzs29hbH+Il370T+3Hjx3/+E45/5DN2U+yt2P/EzscWf4Svw5ZzeMNnj+6LPX7wL5/vwTNeP/alwFMK1B2FEPOSoBq/hTcNoRM4Fa01w5FOq9MpVHEVdE/fL3w2aehcQ3Uuu8vtotUQBZFOG68ycglQAMqdVT7wUxtkH/3l7CNkndL+YrUE7NUjVRvCtogTUcLnAyjO5U7INsJXF/CyhDStuEch51CnH9t728k9tz3K0fI0ag+bortwoEaRxIx/Ylzj2jkjls+/ff2U2cykV5/+c+zOnpbZGV207u4bmbMxX97s+mmrq5+84F+6+iE8/rbbyF/HqT5bbDr+WcgtBlTCp8CZzmjSmeCQoWM0Sm2cjlFW+Rjb4DwixHhjibFkoOyWUkmamDkJ36R2cBxw9L49YnxCof26UYYfDpy1ryHp5ddi7SrF1JuYpy/yj68EPwzi49TtVDvQt/MGGrFwcHvFtxUfwxQEbgixQqWGSQgyFTvkQTs+b8fHt20byE8WiP82dAOfQScaFFqV9J0rJVmBk9QGVvrYpYeN2FRKMVJC7dMfJv8tQzku56UrohyJb9R71/7iNZCZpBjWn7GQ9I3m78xOkG8CykST+Ox02pwC9mQEPg1G2jgky2iI18YhMihHcg7sRo8SL59wBtnNYGZFk2Evl9me/k905GQ3pGA0JUZiYjZ4g2gvmzk2ecqBCynK5+LZ8U+MFW1lyX3TZseDqeClYCpP4CcvmtZO8cwbsJMNsRdXiHYinI3HQ7xUQf04gk9WaxUKpZZW0iazXA3uKleoVMZ6n4pWkjOyp7/cuuy44qekAgaOMdkkgpgcnAF4dNBTf8Da2LHYL7G6mw9hQxG+Ey97/NHYk+yK4wdPXOz9nF3Rex0uXrSM6LshVkdPB1mqkIVXUnK5WsPYgLnSUkJFMENk0JuclEGPMujpva8de/4TnINToGKge4tjt8U+xVl4E45QzSeE80/fRfB1PezJgMbwaRparTWRI55Oi1RquRZ2paWvfZiTPpeWiKWzp8BQIihDOsIVmxzFDuIBS7ceSdqR0N4UvCP1sdgXqfir113fml/udiy4fcM2OnfLpcxTn4vnsHaw4znMSKRBo3iO/LlZTsnj1BqNltPy2iptp5aB+l2OaUqHsPBRFNxPCOhi0O4/+DrIhyCLHRcXFUM1ffHjF14JKFVMUm4+7nyTGdnLl0WGD59dR/1R2PsaOG//KPr9CzQCryMmVwo7KhiWL4flEerQ471lZvbUb5wID/X4XOAxAXn5dKNZqVOrdCpToslKshalpk1Go04JY2blFWX3AK8kVnj6v3sTIqa0/kIbuIYT7mgMVLWUvmKUPZer3+C1ffZiuy4Jqzh88O3e+0L3PBCbrr1b0bnEzeT17qo6aLPwNHfxrdc3TxR1WRKro/KvtA1EmBiwDdionvYYwTbYt6mxYBqxj2LfxOpwL3UEr8TZsb/Gbo6t6X30BOijGgw+DeyCRsW8EkJSlD3MUizJ/ZlDK8ib1yU6K0pZrGeh/KeFIxVEFUwy6SzB0MlxphobD8X+Qc5JRMeBvjPsV5Dr7KiMT7cmG2lalZTMOLhka70vORlyBqQ7UDKDIPklpqQI1mbwDPp0IDpTgpQFWTH9Xf23DJAmMT4ZQ30PPhX9AK/45UucXPx6xh8fPBw7+eiZT7suzfLEZnJUbdOa2BtmPAJbf8X3frrjqaJw+LnYG8c//GHyxNi2mOHWNqlGYoMgBzXE1yxKCZWFhlXU+15m8b0svpXFOhYraBZKMczU+zCNlJCxjVd/Vyb1haiDAiIXhxwOmMJdig2MNfXSM3V0auqlr+vpO1PZFVtiox6NxW8B2j1A+ybhTDuUN2OKoRRyuRIMlQVSLPiIFGXgPC/+aUD6g4WTOJ+cnnH+tfOx5FTm7lTmu4s25rstW4iNkP8hqwUdcGgCn52KVAl6gyHBTkMacej0WKe36yktrdebzXFhn1mOU1FqxEc+SAkfPC5/9pgvUOz/YDAs31k8Wn7VRzTI4PDrkGsSi1dtfGTd0tlFS2+e90TGrqJfXnnhm+b33n/gYB71acryWfcvmjNzRvPiCXMWL1qUsWv/m1tu/uO+O2Y9XPGIEHN9EJ/mAL/kb0tQHyWpVCkmmk6V68I+uRVZwj6QjiRtLJVvYiGhpxhnGuSAJFxE959UhWRAnXjx2JbY10cPvu/b+vfqhw51LGolD3bTzyf6UMzxK6a+OYAjWL/2tx8/wode2bzlo9gYeAIvYeAlDLwkoSFoMj/UkWAz0Al0llqlyjanh30GndquppS0WW1WE2MGDuUoFTi0DrIHMAgiP08/u5e/2El/mJO+F1G0JEZKJp61+4/alte/fhanvbrpdecz1o7qp74vHPXi/Oc+Wvn32OJVHat7FrXPeuwmM9b89V/409i6VenVdbETsZ9n1H+w4+FY33r80p1Pf/Vc+J7aLULd8x7Es2HMJOAvC43j0zMtlqHZcruOViiyaXiZkClJ+FuJWidX2FDaoI+Ol8sH2EWCR6qASPx3mmX/VjdQMvrK8m0oycSG2ft/TdA8G8dA2baI5OfMy7WbuWW2ujWWzMpCbbZQQv00sZKjP72qdBP+55CyPnLi2RvfrteNuoDs4v+7vTNpxcH+/40i1R2cco6C/hRwixesk4+OTULjBv6Fqumq/9BzkX9iZN9G85kwGgf3NGoXSoNwykK7HMaboZ1GlaBquAlcKYznQXsWOw2NhLlx8Haw0/o247eRA+YY6Z0m2yWsy4B3qawEhWAsBb/dZwP8QTIv4J+GSqHfwKC+i4CrnSrpWwPtNdSuvhJCE9YFCAzzDephwuDTPrDN9yTOp6Ft6B84H2/EP1M9tJkeBT+30r8xY5kDEMEfZv8mo2SrZG/KzQqVokBxXjla+YLyZ5VZ1ax6V61RF6pvVe9Tv6tJ0vCamzVvxlFxOXF3xb2rLdBulOSdh0ZDVhArOz1yo5sQAvy74JxCZlNxm/SfoIQTJLUx0kEPS6tkKCC1afClW6Q2A9a1UmqzcB7aLLVloJkdUluOlqBXpbYCmXGx1FYiLZyMxbYKB7FPaqtRMuT6/v9MzaO+lNpxaDitkdpalESPAU4wA9EdPUfPlNoYpTJyqU0hDZMhtWlUyAyT2gzKYQJSm0VJzAapLUNDmd1SW47OMx9LbQXKYo9IbSVKZv8ltVXUB7I4qa1GIxQnpbYG3aRMkNpx6GZlWGprUaHyi7Lg3GAkuCTQxDX5I36uMdS+uCM4tyXCZTVmcwX5w/K5G0Khua0Bblyooz3U4Y8EQ215qnFXgxVwUwBFhT+Sw41va8ybEJwTEGG5Gn9beHzE3xpsHBNuDLQ1BTq4XO6q+au6nAg/LdARJkMFecPyhl8GIRC5IsSgdcEw5+ciHf6mwDx/xy1cqPlKhriOwNxgOBLogMFgG1ebV5PHVfkjgbYI529r4qYOLJzc3BxsDAiDjYGOiB+AQ5EWYPrmBR3BcFOwkVAL5w3sZZBYaiKBhQFuoj8SCYRDbWP9YaAFnI3pCM4L5XCLWoKNLdwif5hrCoSDc9tgcs5i7so1HMz6YS9tbaGFgHJhIAf4bu4IhFuCbXO5MBFNONARbJZQcJEWf4TsfF4g0hFs9Le2LgYFzmuHpXNAY4uCkRZC3d+6K0/kAsTSDELlgvPaO0ILBfZyw40dgUAb0PE3+ecEW4MRwNHi7/A3grBAYsHGsCAMkAHX7m/LLV/QEWoPAJPTb5hwGRDYEgUZDrUuDIQF6LZAoClMFNEEW2yFRUC4NRS6hWylOdQB7DVFWnIH8dscaovA0hDnb2qCPYOgQo0L5hEVgYQj/cz5GztCMNfe6o8AlnnhvJZIpH2k271o0aI8v6SVRlBKHmB2/95cZHF7QFJFB8Eyr3UCaL6NaG2BoFqyiZrxE7jJ7SAfLzDHSQA5XL9pDssbJpEAMQbbI+G8cLA1L9Qx1z3ZOwGVoSCaC3cE7iUQrpqgYGpCfuj7odWIQnBgWYw6BKgWGOUghTaibHgXoHw0DG4O3QBQIZhvhfUcpJoQwLcLT7+AN4TaIJiqhJnfx1YArSkSFxXC6hxojYf1jYBhAqybA7OD8XKoBnptKAxQhOdWGG9EY6DfCJBtgInAcyiXFIK/u/73Z7kr8E8T4MIDUAXA3TC4h18TSz+O3CtwXJteUKBFZB8RZgj/8+DdAemDA5jm35UQB3ABQZ9hmAkIvSYBK8FdCxA1AlSVsJLIJyJQaxOgpl6D4mSg2CzwGxgE2SjgJnsRMYeg3SJJ+ma0QNBwGCDJuv69QdlwDb1c21pqBO4WCjQnCuOkHxbmxkI/LO1LlNkYgd486BFZLAJOCN0Woe0X5NkkrCZW1yatnAN2yP0uHU5a65f00gY/IYAVuSRrciR5NwvPsEC3DWhw0O63mrCwz6Cgt8FccILE/IL8RZ3Pg9mIANso2EirwCHxwHkgH5HqHMnHFgke2zKwd4B3pAmavSwL0VqaJUvlhNF2aIcE3vullytohPAfELgiLb8QAebAilaBjshHi2ATfkGjAUnDEYHbfik1SbsiHLYLI7moXLAG4vcBSZLTIV5MuCZGUVqDLZJoolXgNzwId5vAbZMwFhqQLIFqlSiJO24V4tItA1ppFqxMlF6TgC33P8i3WZBNRKIaEjhqgh9Rz6JFhWDtAkFroheJNhz5N8n5BfmGpHXtMENoibzME7yiRbC7djQSikw3cEd+8gTrG+wrjZKn5Ek8u/+v1xG+2gUJDvaKjgFe5gGPEySfbxvwtQWDvLZfEzUQeSYIUaJdsh+vJDnuKgzEV66OmsOEqHnlLkRrDEI/IvATFmSZJ+xhLsxPBgoTSD2NyAm/71W0CV3jGjMCKXEpwrgE1eLR0nss5pEZ2fEYeNvhfR3y4JEwPgLeMI86sQ5q4X8Kz8nw3As3hc4JfXGuVHgi4cljOTztwnMrZvgp+HAv3tuLUS9WTb6IuYv4QlWW/Sdvlv2fXpe9/tzyc5Tu3ORz9efWndt7jlV/922q/ZuvvXbd15j/2muxf3XKaz906tipk6do/pSnyHvKm2h/DSej67ENWEyCt5Wvq/3H2T77Wep07ZmKv9f+VwGq/fH06drTGNX+UIFqv0d99i+uP1l7EtO1X15P156g++y6j7Hu476Pqb6P8daP8IcfjLIf+iN+vSrT3vBa+2udr9F8T0NPew9NvnL5eowFXt2LpS9Suv2l+8/tp5UN0fYotT66LRqN0p171u+htu2J7qGW78bbdkV3Ue6doZ2UbufknVt3ntzJqLdtddn5rUqDF23Xb6dG8turtlPR7Ye3H98uYOe2c+nexzen2x+DewvcVZvxwzMq7A9tSrcf33RqEwVABzbFGby6Hqzip2Hdg8sfpOo3hjYe23hyI6PbaN+4fOO6jX0b2QfuH2Xn709I8fL3KzVe3QZcv2Hrhr0bDm04t6Fvg4zfkJzh3bYuuo46vO74ulPr6PvWeu35a/m1VOdaHHoNk6PQKfLsO4w1/KNag5fryu+iVt7lta+Y12fvBJEdW3BywbkF9LkFOBIutYdBVh3e4fb5cPPtmTlerj2/nQpBrw3uJJxYa/Uk1so9dK0M1j47D2fPw63Q8te77Q31Y+31sH72jAL7Td5h9pmw3xnwNhUYa1lQElNA14ZorKNL6cl0iF5Os5t8ODrl8JTjU4jM9k/JLfQS2W2eArI7V91XTfHVw0d4+eqMLO+xKsxNynZ7FZPsaV7lROtEqmJi3cS/Tjw98ZeJ7MMTceKE9Fxv4oQUzvvwhB0TqEpvsX28l7NXANM3wL3Xi096z3mpTi+2FMTXGrCuVl+gq6XAlDDCdruuVFevW65jdDq3brIupFunO6nr08lLYeycjg4hPBmR/4VkcQ9e3z21xuWq7JH3TamMyqtmRvGqaEYNefLVM6KyVVFUO2NmXTfG9/lWrl2LxqZURgtq6qINKb7KaBM0eNLohIY+pduCxvrCkXBkgYtcWGwgV9jlEpoRl9DEEEnJBBYmyRUOu8R+RBwIR0gvDG8ETfGXjIbDZNSFBPDwgtnQdaHZ4QgOA0qgOxsQEfQuAof6+Ri4BAKu2WEgQhYJrIVhDSwhCOCK9C9JnI3+F5xsBvwKZW5kc3RyZWFtCmVuZG9iagoKOTYgMCBvYmoKMTAwODQKZW5kb2JqCgo5NyAwIG9iago8PC9UeXBlL0ZvbnREZXNjcmlwdG9yL0ZvbnROYW1lL0RBQUFBQStMaWJlcmF0aW9uU2Fucy1JdGFsaWMKL0ZsYWdzIDY4Ci9Gb250QkJveFstNjY0IC0zMDMgMTM2MCAxMDE1XS9JdGFsaWNBbmdsZSAtMzAKL0FzY2VudCA5MDUKL0Rlc2NlbnQgLTIxMQovQ2FwSGVpZ2h0IDEwMTQKL1N0ZW1WIDgwCi9Gb250RmlsZTIgOTUgMCBSCj4+CmVuZG9iagoKOTggMCBvYmoKPDwvTGVuZ3RoIDQyNS9GaWx0ZXIvRmxhdGVEZWNvZGU+PgpzdHJlYW0KeJxdk8FuozAQhu88hY/dQwUewGmkCClNGimH7lab7gMQmGSRNgY55JC3r/8Zt5X2APpsz9jfmCHf7Ld7P8z5Wxi7A8/mNPg+8HW8hY7Nkc+DzyyZfujmNJJ3d2mnLI+5h/t15sven8bVKst/x7XrHO7mYd2PR/6R5b9Cz2HwZ/PwZ3OI48Ntmv7xhf1siqxpTM+nuM9rO/1sL5xL1uO+j8vDfH+MKd8B7/eJDcnYqko39nyd2o5D68+crYqiMavdrsnY9/+tVbWmHE/d3zbEUBtDi6Iqm8gk7HbgUnhRgytlAtfKEu80XmIWOr8AP+n8M3gpXK7Ba2EqwM96bgXeaLwFb3UfmX8RruWsncaAbaH7OHDyR65N/huw+jv4WPV3S7D6uydw8t+C1Z8kV/0rmVf/Cndi1d/hHqz6O9Rl1Z8kXv3dC1j9HWqx6l+jdkr+cKDkj31I/Reoi9SfcC6l+4c/qT8Jq38lrP4V6qXkj+9C6l/DgdS/hD+pfyk+6l/Kuen+C2me1CVoI/T5Z3ua7hZCbE35GaQn0Y2D56//ZRonZMnzAUjW1J4KZW5kc3RyZWFtCmVuZG9iagoKOTkgMCBvYmoKPDwvVHlwZS9Gb250L1N1YnR5cGUvVHJ1ZVR5cGUvQmFzZUZvbnQvREFBQUFBK0xpYmVyYXRpb25TYW5zLUl0YWxpYwovRmlyc3RDaGFyIDAKL0xhc3RDaGFyIDQ1Ci9XaWR0aHNbMCA3MjIgNTU2IDU1NiAzMzMgNTAwIDU1NiA3MjIgNTAwIDI3NyAyNzcgNzIyIDU1NiAyNzcgNjY2IDUwMAo2NjYgNjY2IDIyMiA1NTYgMjIyIDU1NiA4MzMgMjc3IDgzMyA3NzcgNTU2IDIyMiAzMzMgNTU2IDU1NiA2NjYKMzMzIDUwMCA1MDAgMjc3IDUwMCAzMzMgMjc3IDc3NyA2NjYgNjEwIDU1NiA1NTYgNTU2IDU1NiBdCi9Gb250RGVzY3JpcHRvciA5NyAwIFIKL1RvVW5pY29kZSA5OCAwIFIKPj4KZW5kb2JqCgoxMDAgMCBvYmoKPDwvTGVuZ3RoIDEwMSAwIFIvRmlsdGVyL0ZsYXRlRGVjb2RlL0xlbmd0aDEgMTgxNTI+PgpzdHJlYW0KeJzde3t8VNW18F7nMc8zmfdMJgPMmQx5mSd5AOGVQ0hCEDQhBMiAmAx5kGCSGTMDiMUS1FYJarDa1lYFarnW4oMBUfCN9dV7kSu+qtZaqGKt1RbaordXyMm39p6ZEBHb3+/7fX99k5yzX2utvfZaa6+91p4kNrCuk0hkkPBEae8LRYbDP9lKCHmVELC1r4/Jj6wNVmH9BCHczV2RNX0/PXjFGUKEbkK0B9b0buy65Y/3riJEmkBI7rvdnaGOt/5TX0RIOcKQqd3YcbN6vZaQigJsT+7ui12z0jf3Y2w3Yvtkb7g9NDpzvg9By7Ed6wtdE/kDP8Jj+wFsy/2hvs5dw3f+Bdu/JsTYFwlHY+8AjBJSPZ2ORwY6I2TkoUpstyBP27EP8Id+JKxqaJvjBVGj1ekNRsmUZrZYbXaH0+VO92R4J0yc5JP9mYHJWdk5uXmX5BcUFhWXTCktq5g6bTr5/+Yjviq+Sq4TtxAn2cjeX/sIM4iDbCBk9HPaOv9Wl4/+z/9LLnTsDR7IIl+Qz8YNPE/eJE+SOHltPDTkQB7VHtjISXKGvPxtVJGeDxax6nHyOnmJPPYtcBz5JYyQd8GDdn4Qa7SvirwPq5CfPdi3jtwK52Aj+MkusLDRKUg7DYSL0JqN9ncCubuTnCB3Qg05IUZ5Dw68y71E7uG3cEfJEeT5cu5W7Bsl75BXoQRqSZQcIPczAlGc79bxFNHc7yN3kRvO94qPqE+LW0ZKiHX0S/I4eZpJYDMZIm1jSKfhr7Ad96QHdJDS6bOpQW09v5Z7nONG7sDG7WQNPiF4D6Fv5edesJw9aljtBpHcgRx8CIvJMFJ5RH1C3U2uJHu5t8lS8ndyv+DU4K7i/0As3FfErL4Ffx79BznEeG8nxhHz6BcJYpotwgbiFN6jNjT6kroZ5XqU/B2l/zZ4lPkrVwRbljYvaVrc2HD5ZYsWXrqgfn5dbc286rlK1ZzZs2bOqJw+bWrFlJLiosKC3JzsrMmBTL8v3WG1mNNMRoNep9WIAs8BKZDj0FYb57Nka10oUBsI1RcWyLXp3TWFBbWBura4HJLjWAjZgfp61hUIxeU2OZ6NRWhcd1tcQciuCyCVBKQyBgkWeRaZRacIyPGjNQH5EKxY3IL1W2sCQTn+F1a/jNWFbNYwYcPvRwzGFeVWro3Xre8eqm1DHmGf0TAvMK/TUFhA9hmMWDViLZ4biOyD3DnAKlxu7Yx9HNGZ6LS40tpQR7xxcUttjdfvDxYWLIinBWrYEJnHSMY18+JaRlLuoayTbfK+gsNDtxyykNVt+VJHoCN0RUucDyHuEF87NHRT3JofzwvUxPOuPZmOK++MFwRqauP5lOrCprF5Fp6fEuJiliUgD31BcDmBv3z+9Z5QskeTZfmC0GqcmxeHphY//XjrUNZDQ3UBuW6obSh0aHRwdUC2BIb2SdJQpBbFTRpbkMSh0Se3eeN1twTjlrZumBFMLr2uaWHcvnhlS5zLqpO7Q9iDv1UB/3Sv3zoG0/htwwTFgsJBCfv9VAzbDilkNTbig4tbEm2ZrPbuJ0pxfjDOtdGRw6kR51I6MpgaGUNvC6BuFy5pGYoLWQs6ArUo8W2h+OBqtK61VDEBSzztS68/MGSzypXFQQYrI1cLOnrkuJiNQkKs8QhoNxRlyMIaaV8mir94cYJsq02uDCAZSqc2UNuW/F3fnY4EZBR0fX7CEJpb4koNVpRQUmO1+0qKESPUhgrrqWHKjBcHInFHoHpMu5St2p4lLQwliRZ3zIuTtvYkVry4lu0ruXaorSbBAqUVWNzyBCkbPbGvXPY+WkbKSbCGArvmoZVl1w61dHTFfW3eDtx3XXKL1x9XgqjhYKClM0jNDiWUd8LLjCPIbKW5ZeGSwMLFK1qmJxlJDFByQlbtBWQCLd4EGTTAuC5LJ7dwXj6IgBbskOuwEqiehe+4NkuHjwUFznqp4VbPklvAS1LQyEY8T67trEnC0fbXiIrUnObVp6hpaBPpzKv3+oP+xKewgMNhOTkxYuioUOtTQ+imcECH9jmvnnVRWaZTo5dbAp2BYKBbjiuNLXRtVDxMyklhMJknddX8tdY4YaGYiB+HUw0qzHhdvne8cOPzWXusWX/B8ILUsDykCyxcMkSJB5IECXK+IE6oCSvTrV7mC+iGDqDvlS24pdmGHtqnKHQzd8+gRAILOoYCS1pmMWj0J9d5r6Vz2chCWNhcXViArq16XwBuXrxPgZuXrGh5Ao9c+ebmlv0ccPPaqoP7JuNYyxMyIQrr5Wgv7aQNmTYopSZs6Bi89wmFkEE2KrAO1m4/BIT16VJ9QNoPcYk+S2KibDaRQjgcERIjSgpawD5dom+Q9bHPPkJFphhERafoFYkzcd59QLv2Y8+TeErqgTwqgQm8+xCriXUfgsF9esWbgBhECCXB4c1Lz0+9dEXLoxJBNPbGiarpB80lvRuVjcdKrdxBDWVTsHuoLUg3G3GhavAX4hCYg2oKzEFGNFLcEOisjhsD1bS/ivZXJfo1tF+LJgouQPRB1H1jHKgFrGzx45aUM/7TO2T5C9VUEJ3KkOXjQmTuKEYjpRg38kRLfIpJw4k8x+t1Ii9gV9XR4qNWG1RWWsusZVNK7H6r3271W48KnWfvXsQfFbd8tVmsOOsWPmWBEwkgrQqkpYPpynsaAI4TtDpR0AkGvUZDeB50ghZs5QaYbADBAGcM8KIBdhvgRgPEDFBjABxysKHekwZ4ywAH2PA2A0QMwLUZoMQAxACnDXDCAHED7DTAIBtTUv3HDXDYANtZPwJbWP+MUYZwzAC7DLDZAI0GkA1gHkdomFHBCRoYmo8NHR43QSubIzH9qtTn6tRnIPm58sIR7Gu9YIiOkaqqMltlcVlZ8ZhwbZX0mVICKF7w68HPV6m/VQ1QAU2wDCq46pFnuWq+auQhrjkh682jnwtXYHTvIg1KcZpWqyMunSvdnWaz8Y1Bm0tyaol5VzpsT4fT6RBPh0Q9kg6n0mFVkjlSVVpVlW8lZWNsUC2D1VJWOrUCGXG4/dkVgTQIZGZXWOGuw13XgUennpHE6Q9veOiQMGPkZ+pHe7dyNecODXVvn/+dyJuvcnspb/XIm09oILlkQKnVavwOb4aJkAyHRsi7xG9y8+5Ji4O/8kKbF3iz1+flDILX67bwhsVBh3ayltNqeVfjJRC/BEouAeUSKL4EqNiQ3bLiVfkkHYvWK1e1rlqVb7UR5NsG7iTzjH2HgPzmTJsEdBXl2TlFXEX51LJSl1tbhCvROB0u9yRe8KmjHx3/S87/ONcMru9d3v3X+5efev/5zyb+r3RlV0fHZSs3v7RhPsy699Fbf5h1mTJLKZ/tLF685cq7H/7RbRnVc8tmFU+zZUxbtCFh89wjmIE5yTxlsskOGrR6p+AU3C6DeXHQgBmYKDQE7aIZnM+5YdCNwqfqp1JPR9mj4EutVPnIe2lC/YGKMsaw25mN7E6EMie8p/5px457dja05+XVz3yb33TuRn7Ts1ffcZvlMX1l/dJnqcybRz8XnxR/RCaQS5W8jDSHXdCm2UWtMGmiRmwNajRGq9XdGnQ4rIKRtAaN9pJJIE9CuZKqhESZLNNpMSbNKSVZpVOnVfgr/FaNEJCJ1UL8sl1MStHGZ0ffnak+wHVF1J+8pD6g3gYxzLdO36SeLnh687F3j785r/yF3458Fb0eroMr4QqIqrc3XdV/7rNT6ln0O7PQRgaFy0k2KSN9StXknByt1plmLuB5s5OvKNfkNiHTJJjWk8YVpqGdpPnSOL2A5m1cHLRZPMWkuCE42U9cz1VAQwUTamlpSqikLGEftgsWlFiUiNZcPrUK0DZwIdqsOWgoLqfV4SorneZM46nxBDR2bRrnpF1zcAtuvTf+/rFPL22+fIFefd/72ZGjv88rkSd5cnMLJ63tNGjWB7evbsqfP7O6b47jwbsfiHPCtLVr5jel7fj5fz2prl9Zq7lLY9AI3Z1vc3pOCNTPumxh/eb5aDZUZ8IVaDsu4idzFNnN22z2iXq7PjNgI1JGQ9AsWTS+hiCvcRFnJAAJw6Haoq9xexYX5S+CioAmkMlZLTZq62U5bP8CW6OTbmh+kWAUVo4+89/vvRL9RSHH0a380bqBq/s/CF9r3pj7IubkejzWstpa98O2s3LHzVxg7zMHn1a3v0Aor43IayHqy0Y8JKzMcxssVpfRyPNWA+/NcBmbgi6/xVpvdkGa6HIRjcaO+rOQtMXBzRaw0F/i2umFsBdavdDghWJvwo+i2opXsU2dNEDUXH7+BVtazKS2V1Zqszr9TE0iB6g5XDN36Rn1KzCc+fTLkUvX9f4QlxBVd7VfxcNuXb8D/OAECWT1iPob3Y6fbXGrv+X3DW264Qa6X4bx9QDKnid1SiFm6KKAZ7uzUQRFxMwHdomwWYQ2EXwinBLhmAiHWf+gCOc9PPWgTA+UyTIU+DB4xFe/Kqf0b0KhqegDXajZLB2KhJjT3SZbY1Bnsohm4tyZDpvT4Vg67E2H1nQoTocEWaRIvcP5Q7fMij7MPwmcZXO4lFNwWodFHiTeIOQpLdVT/TXlPev4WcENRbaDkwZWFZo/M+/5xchfmN5uQr0NJ21sliJP1JjNJjcxkUCmAy3M6rCkEaOTlxuCGt6VsDFmXV9jglkYWDi2NRwoeHY6aMvQSdmSFkbVIgy/8+voA4WcXlRP6cAjCK1nDx9V3++9emDDuoHjnF89o77TcWXgWuuqnwpvq6vjx9QP1C8P7X/uwEOHE2faTPRhGvRhl5AmpVgiEydkurQajWsCEQrypUze45FbgxMnegTe0Bq0aGVtiZYv0SrswLCzw+Hqcb7sIueCX56ck4XnglxRXgQ5RUJF+WS/LLipR5OdjkmA54KoUY+q76h/U18tgIkTH/ghVMzfcnDHpo66HPCBDb27Nlv90HXTd9UzlZEHj+ztmgo/eu39wy8URzqfnnV5eVZW4exlsYXPHdn9TM7KKx6YVjclK39B6Ca6tu/g2i7F2MhKFigFpjRRSBPsNpPAE31rkNjb7NBoB8UOg3aI2OGwHXbZocQOsj1pFgPU1tjqxpmGKBMP+JnnYhqxEO5NlOkRyNn50x17IEd9zAETQMdffe7+Xzz82C/5xnM7UAfvMVlvJUTjR37c0KeMOonbYkpzp3nSBYPW7rbn2HmdId2Qa+D1BrvTzKfpiG2bB67ywEIPzPSA1wNnPXDKAy964EEP7PQAjsY8sNIDDR4o94DRA2tGPXDSA0c88JQH9nrgTg98xwNhD9R4IN8DPgZ0xgPve+A1BvPNCY4w6tsY4krWX+wBwQPTPmNjBzxwN5sWcSYzcojzVmq+Gxm5Vg9wigeq2ISnPXCCzbbLA5sZq9gve+BRFKP2axFa67dFdt8M+r4+nASgp1FVWWUlDlhTGks6amv51Gmclg8YAQ8dGlD7YBoqUfSCfn6m+oZ6lYQebds5V0kV8LCVXzZxxu/Uf6w991feBhv+tPDcHnHLuc8XPfMhP/OrzXR/l6Hruh31iOEep1VGTUAkTofBPC9oRJ2g0/IWq1biWoMmnShJGhrW275vhZgVOqywxArzrFBuhSwruKzAWeEfVjhphbes8JIVHrfCz61whxVutMI6K3RZodkKtQx+shWcVhCs0P2FFT5OITxqBbLLCj9gGDjDais0WqHaCqUMIzHDaSt8yBBetMJ+K+y2wnYrXJ+Cb7JCjRWmMngLgz/DOPpNCv4+K9xpBVzBeraCBDxylG0FhxU0StgK0/+eQvmVFQ5Y4X7GTwIeV1DHgG1WAMKoI924FXYxugmxNKaIOhihFxmVOxmVCAOoSTCH+DoWZ1xoGmgcrQPfZh8Xgl5oTK3/BoMG7WWVxbZK6qeLk04u4eVsaGaVmET4efyhWYQWIyc/nyP0XTfyyXXqe3joX8GRkSaNYcIO+OG2fOhW76I5nPCAa/IVajn88GbCzgz0DeK9aFMmjGpXKWUgSTa9jeeFND0xmfQC73ZJNo6ztQY5joiitTXIzCrihl1uKHGD7KZOizF6PqokX/fHLOZFTtHy8adUcOKxoofyPAyAS6cKi9Un1PuR38PnwPbAMFyn3q6eU78P128a5Nwjn4pb3jty5zuZI3H+9SNqW4Sk/BmeHVuIkcSUS0W9Hitg1Bh4LREkk6hrDZrFzeJOkTeLw+IoFrzoci4wi+AQRZe0QBQJgNAahIQ/tikmKDGBbIJVqQg5tRIan+BzdSJGwVrqlPY7/clnq9B87k3u9IiFXyZuOanuOKneepLxaEMeaxiPeYqTGDlep8cdKeqNgkFjkkQeAVg8Mf7Yorlg6ldIU3fgz6/hT+pcmA6V+DNVbYa3uSkjr3Efc/eoafD3kY4Rb0qHFjaXndQreWaNRiuhk3A6RAvqS9TodObWoI7X2AadEHFCmxNKnOBzQtLGxmlufGrowGQwqTExqSzRsumTnep9qK2NI2DFs/Mr9TWovPZG/oWbf7NORRY+/e3v1WkbkzrCGIreNXQptTxNjVDethOpgGs7C68SIRgR4XQq5sKhSCoWO/Ftsdj5PXRBTLYVcqiNp2xkNrPrRqWYGAwmrSCIJtGcBjqjhheJrc0MjWZQzDBohogZDpthlxlKzCCbxx/DzLOPk0vCkBPeHLLpQcx/NPJTG7rxxVwYYwZh9o62c8+LW84++eNNfBllJZmvDWOsk46xTqlLbzFzvN7M8xkeyY7BjUUSCGfB7cUp3CB3mDvGiUae4zAjwlzOXpIB1CpptkPj5asTIc/4vA3TtLGUrTQR4SRyNi8YuwGWqM+dUB9Sb4UuaP4nTK9Sz/mfv+HXr739FkihV1+BLbACVkLslefnr73un6f+MUr5daO6jtJzBmqUPwEn4BGm19Hklu5+sDXqQcH9q4fJaKZ6OKOHk3o4rIcDetith216iOihQw/NepiZguk+y4CO6GGXHrbr4UY2XMOoJEi8z0YPMPyYHlamkI16QNzP9HBMDy/q4W6G5WX9084wnKdYL6J9Rw9hPSxkmPmMLhJ9kA2tZP2IM6oH7rgeXtPDMOOzRA+yHoj+fEzQuuobbvobdz3jR6/8hucmYxct7srEJQsaS4XfyYvqe2ql8Lhw79l24d6TCT9Bc61pmGulk2plssNpoIahd6JtaEwNQYMB8ypHm4Mz8Q4HIdaGIMb2543hG7aQSp5cCStglzvTxDSOa/pSPQNp/3zuK1n9WGpree+Dxl4TZJi3vOGALAx0Jcg//Mu0Je3qD9Whzg5T+JFWksybhA5234F7yGY2W3Rai9btshKL1unkeWNjkLfgMbDdDafdEGdHAtbxbDjlHnfvlMjUy6q+7l2SmTgGsizHoY7GoYXdlQ9teOiQ+qfnu65TP8GslV+9KfLWqyNN3JUwce/WkWfEV9Wr+rqTOZfQgTlXOr0TI+kWrVanS8/wWBwOvjHosEhmHXHuyoDtGXA6A+IZkKhHMuBUxr+5EzvP0lgyluCVX8TYSmZjjFOulfH1NF+/PFxg/w8f43Yx9cnnc04tWaZM5bV4OAk6vWgWnECWBFHxbBfF2Y7YrIc2Pfj0cIrZ+WHWP6i/IP1kuVrC3SWuaNGmIJGJUmEJI6+9dpYXZpx9OXnfIH6EPkdCCdUrBXatCRnxZBjwRDAIgqs1KNhRJINMJG0ZoGRACROVnAEpOx87DMeSEHBwY5dDBMoxSeTQ0WBmKH70iPr0u+oB9Sa4BhrwZ6P65rsvvPzuB8+9/A73yu/U/fvgJmiGJbBJHVT3nQReHf3jn9Qv2HfymLeqy4VhYTH6HZa3phPbRL3eSIyBTCfmrTanJc1s8P6bvDXBXzJvZYZVnlAeS1wt5/PW914e+GWhRqN+ogOrqMW89Zlj6vvHIxs29P+By8Rk8L32VZPuUkPCn3/SZltb/grmWGeg98X43ucSsYdn9K/c7eJ03BMzlYl2STKYdCaUp9uEEQluWDxrNeaxjcoyVGtZysQSeUHqXope/k0rc5Y5A8n7KA3s3vT9rT9uiR89OqvKP7vbdtNW7rvPquqzI//dsDDtkcyxu5k70F8YkYMSJcOqkYiGuF16c0NQb+EdDUEUkRva3HBR/aHiMsfUlx2Q6cyycIf6O1UdUU+AjGmIHtzqb797zSi5bj3w3CT1f9W3oQB9hAj56nH1b88/ot7+2DOJP3VYgTZ2k7iVTCYlZAbpVGbbHVnGfLECj16jw1vIm8usLnmKadbMMjNfKOjSp2dObwjKU1xWIdNs99m5NN5u103MdOlym4I6ISkvWyV1bTZ3JZUaFhfESHZMqbITl7xOjFC0LvfUaW6NNiFAqnz6Sl1UuOdwPPYwzU9dcV/80hcfe+CFy4cfbL+9e+rrNdctu2Ju+bRFyx6ev+f1T1ReWjT3ssVTe1ZOabp/7UPXR+b2wJab3mz60ZZ7frlr62Wb1jbu/dmOo3WfPrXAcsQ1Z+aWt/l7K+uXzV++tnBO3bkXnzi8+Cft15SgfXCEaLexXFtRPna5gdgtZkzNJINeLwl2t+hJT2Sq5SzxHcuJD7DcV/BM9tR4OjzC2rHsdnsqu21MZdOYFH/GsvFtngc9nMNT7mn2xDzC+Hx4LP8ej1R5wPOW54yHT+XRKz1cSSqZxmyZG0uXGzxhz7CHt7Du4x6Is6w/4gGzp8HT6uF1LrOg5+1SlgSSjsaxpaUYGVeVlZXBleOOwdarL3JCXvTspJ1Wmzu1j1ObJA9QeTSrAb/dPQfsfrvLXoWFxqfe91wgPX3SyxiK/hDyXy2aUPEwXLrfWeqp2AP5fPH2e2/Yeg6Dz3MDv9s2wn04YmtW3439kbck40JhN+pHJAHFSuNSjRYDU54mAo1aSCYAyS2TCCoxyIcc7gzGdO0nEz7AMfoOl8V8u+1xTiT0NpEUV1mBce2GMnBA4K/qh3niF18ZU/H51TinHoVVrkw0iwac3mHXpGGAx4sYm4u2QQeUOEB2AEumLup3kRO2a/PBSj3u1Q+qr/zXyMugQgd8X33n8/df/+rZE9yR36pPPSRuUX+i7vvo1Ln57A+v6B9sCWuFGcQAS5RR+mc3Gj1GFhxvlO6UYFCC1dKAxDVLUC1BuQTZEtgkECQ4I8EfJXhDAjgswW7pgMQNStslrkOKSZwiNUocAlsY5BoEPSadkLgD0osSt0uCG5Ey1yZBjdQscbIEDgnekk5K3BEJtku7JO5GCdqkiMQlx0skDiFOJ4HiEtA57pR2S4IiwWSpXOKIBNO4iDQoxaXD0mlJbJWASBZJkfhjEuylVCEsQaMExVKVxG2WhqXnpFPSqCRil1nyYSev1XNmDcSdeHpUJSz1/Bd3V46P38ab6Jjtto4P/8YZKzVTtE8XM1DufTWuXgd5z5inG+a8AtnCjJGfl/4677+5Nua7m9XLhRUYs/hJPgkpM9IzDQafwOfYbLyPLyzwmp1ZDUG302LOawhKZifRLg4uE7qE9QKfKZQKnCg4BU4g3kghPQFLVyWu0r/2JcF5R0mNBp1hFvtmbDZMO/99gbsMPagf4xuHwFM3yYJErvnlv00Aj7m9cV0vx60afebYb179fKWoF8GgUb8y49mIJ6R6+Y9v8c+9dPttlVe9Qu8a8aiQXwhcY++97dwfPvmc//0vnlLvUnc+ldgjGJ9pduBas8kdypXubEJ8Ot8ki1Y3SZebk8nTIM3izuBpoObDSO1kLryVCzfmQnMuzMyF93PhqVy4O9UszgXOlwskF07kwrFciOfCzlwYzIU2Njamu9ZxymO3clXusnHhXeoq4ltjPHfZ16JSrZWXdi+9aiziK7+7958Vmmk/3bDjfvXT3U09Io3+HhkaH/19/t3+d/5zZDEd2HnLyN5kDL0OfYWRTFO8BAw6vd5gNGp5QTBJoNWZ0X0QZ7GJeh7kN5FrIoultsTeL6XpppaFx/RWgK9Wj2+kwR5cD0XqjfAT+HOzulZ89dwjcFhdMdJ7/n5kNrsP6FPqtDwvoAMwCkbJpOXaglrZef1l+ILLntTCXVqYoQWtVs9uddpM0GgCxQSDJoiY4LAJdo27GxmfEhdT68vPvzAxtp7/EVwjP1XfQ8fZhc8VI+hyR17jpiRy8zTkrx75M5Dpik9vQH9E810DLxnR0eykrgG3Meg5XgO2xG6l039j04HLXYUFyuTtkf+Bcsj0FjvLsHsKev4NLfuXHeC3JuIUKo+1OF8aRpg+8j1lsWTX271ewaxPJ0Qv8H5Zcngd3tag2eFzcA7R4ZIWOByCKNrZddcEDJZtu/yw3Q+Dfoj4oc0PjX5Q/FDCfmU/nPcN37xButh9GPuKgt6pyOw2bBLQiIVetUy1p65a1qonRslIFfc94ED/vZsffFT9/sYNahyarru6ST2pDsGW226AHxx+Q9zy6N5r/mOiYy+83dqo/ny5qn9Z7V3D7MCCcXU3+n0nPKmMGg12fZrVZktDS3a5rQazPU1PxMYg8f7IDd93Q9QN7RiuNLqh2g2lbpjsBocbNG74uxtOuOGYG37lhgNu2O0GRLjeDTEWZjYx+HI3ZLvB5gbBjYeBGz50wxtueJEh3OeGO91woxvWu6HLDc1uqGETZKYm+NINb7nhZZZCIvAPxgErF4NEPva7IZlt3si4SBBN3Ec6GBfTkIsjbP4YayszseMk63vKDQ8ynnBkJlsoRmvcabbMxPf2GEE3MnIWNjbu+4LWsTPg6gtjm9ZvXvYOXPD5lpve1jHDKS4rqyobM5bE2Z+ZU8G+m57GjhkaAEEagLdzUUXBrIaqHLUZ8vbkzvbM3QXZavOyJ9Tlpl/rslt6hGJV7PtD62cwevbWY7tSfkG4i8Uh9colQC8GOQ1vMNLLUDOAkcetP6UeQMRctTWo5UVbiRFkI/vDgQssOskgu9twsg3vhDj3+kix+p5gFu5VF50cOStuOYlzdqnLOZoHm0imYiEmjdbAm9AlmdMwMvGevwKdUkLpQTY9o/B0ooUbhu+95ZZ7wbNj+Lad6vIP4VeQDm54/g8n1VnqX9VTatWnNN5G+jUp+pjj4oIIupIL6SeTh6k2q4XL8btooeV23bqdkt+2bYe6/M/wHNjADi99+JE6R/1c/bM65ySV2T1qJdzHYr0KxU9vMQlJ3FqWiCB/4ypzTKk0HkTniFOicO4BjVqpveOffUjPN/o5/wn7bnCqMkngjWlpJp6320xSa9DEEy26GoHYI+wLQXb/X5yKBVMSF8eO9Qp6q2R1aDjp/c9yIMu2elnLSvUTruorx7Nv5ff1rO/nPvrk3OzffUnI6GjiO33x97Zs1D6xakk5LESbcCgSl2HN5jJWZ0zk9Vn51gqSX8FsZbmwk1sq/h4D1Rwlg2i0InfLSrMIZrFYrBJb2f36KVErkuLE9ThdaYUdrWD5OeDUh4SdPpDz1c8T59E29QWIwxT095kYcwsGnaCTjDr93St1wgMrdaQ4f3ysm4X+MDAHKgJWP8TLKp+YeekW8Fdfc6hh/p5FSIPRw9dDWOeJWzGwu2UCd6/EGDx//GXwNnoUqK8lz8MD7DwsU7z0PDSATk+MRj0I9AsDDONTh9yFd/KJ697z56/QomoeYcfad6Bl5H5uG3fT90ZUPNu2cJtHHjr3ZuI7lZeQv48FA737gWrlE16rFYig16ExrTRDMTRAGIZBlHC/uTLrQRDvWSkMsxugRnYJZGbXlGNXQTjUqocGdldJ9ND9mh6e08Nedo86yC4xq1I4J9hVUpghJG42kcpxBp+4dy1mEyCV6acZNFLZyWbYPG7+BM5hhpCYuYrRsjDMxPQ7U3MnrrHM4y5QL3ZLeuHYt3zXSqi1j/mYsT9FpMLH5yWQ6R0Fdxoy1D+OWOitV8K+6L9O/OSz+x7paTXP+gIDTfb/C79e0J19/l8jcP9tQ2umuRCX7EI87Rz1cjJvDAgu+H+KSvQhR8VlJCB8RDYLUVLP7SEBrhIj20rSjO1Z2E/LRuwb5ieSm7B9E8LPFF8h39HsIVuxLMNnK/bRx0ZLhN3K+l5B3I+Im+JjOUxxKR1Gm9b3EA+WjQi3Qnsr4bBOcR0UF3F0dG4tnTNKhpNzpCXHLAx2D+nCh+Nmk3uwz8f43EOWI41t9KGw2EZbxRj9d3AJ7IKTcJKbxT2L0fkm/iH+tFAnHBDOiSe0Bm2H9nHt57qpuvW6p/UO/X8Z0g1dhscNXxoXGe8zfijlSvtN15t2m542nUs7bJ5qftJ8xlJj2WT5p43YZtjW2n5q+5VNxeR9lr3Dvsl+wNHLJF1JZuIOkfHhiIUUkyswVLuMb8Z4mI5Ogv4xfSwb0w0QM7YSdQ4hO5N1nmSQnmRdIA5yQ7Iu4rnw42RdQ+xkd7KuJdeSg8m6jjjQlyTqepIGtcm6AXpgSbJuJBO4p8f+G62IezdZN5EKXpOsp5EMnq4IBPSw5CF+abIOZJIAyTqHevMl6zwpF3KSdYHkCiuTdZFkCDck6xqSLdybrGvJGeGFZF1HcsWDybqeTBCPJ+sG7g3xbLJuJNN1R5N1iVyhF5N1E1mrDyXraaRcf6SmZ01PrOfazg65IxQLye3hyMaBnjXdMTm3PU8uLZlSIs8Ph9f0dsrzwgOR8EAo1hPuLzLMuxCsVG5CEvWhWIG8oL+9aFHP6s4ErLwk1B+tDvd2zI22d/Z3dA7IhfIFoxc0ZQq9rHMgSjtKi6YUVZwHoOOFdHwcTk9UDsmxgVBHZ19o4Co53PV1VuSBzjU90VjnAHb29MtLi5YUyY2hWGd/TA71d8jNY4gNXV097Z2ss71zIBZC4HCsGxleu26gJ9rR005nixaNrWOcQJbEOtd3ypeFYrHOaLi/OhTFuZCzuQM9feECeUN3T3u3vCEUlTs6oz1r+nFw9Ub56zgyjoZwLf394fVIcn1nAfLdNdAZ7e7pXyNHqViinQM9XUkScqw7FKMr7+uMDfS0h3p7N6Lq+iKIuhp1taEn1k1nD/XuKUpwgWLpQpHKPX2RgfB6xl5htH2gs7Mf5wl1hFb39PbEkEZ3aCDUjsJCifW0R5kwUAZyJNRfWLtuIBzpRCaXz190HhDZSggyGu5d3xll0P2dnR1RqogOXGIvIuHEveHwVXQpXeEBZK8j1l04jt+ucH8MUcNyqKMD14yCCrev66MqQgnHUsyF2gfCOBbpDcWQSl+0qDsWi8woLt6wYUNRKKmVdlRKEVIu/ldjsY2RzqQqBiiVvt5FqPl+qrV1TLV0EUsWLJIbIiifOmROTgIUyCnDnFI0JTkFirEnEosWRXt6i8IDa4ob6haRGnRIa/CJ4XMtOqoOdHUdJITtENbaSZhEyEYywKC6sVcmudibh2UpKSFT8JHJfIQK43gv4st4UIURPsLeIUY3TPpJEYZV8/4ttVKsNSW5qGfYBVhbgPjtSGER4q3G0fF0ZbIEW/0kSqqx3YuYc7HejlD9WKewMinE51/j/utReYz2MgYTHYMoRa6m4FNxUQop/MIx/IvP08PmoPKOsRHKdx+WA+Qq7AuTrn8pFRnhOpkOozjSyVodjCqlvRQhljCoRoZJ5RJjs/UzqOaLzNiAM3YhfjvTZwqyndGmdpGgHMZ6d1LCa8k6ptUoQlK81NqiOPM39XFxC1nCuFvP5ryM9dN2lI1VYzuaXFdCZnPZfH3YorLYgJzQebtZPcTk2cGwqaX1JzFXo+3J/3IeOYkbSuqlH3/CCJvgkuIUJOXdxd5RNm8/ziFjPWUtUbbOHqa38VzITGIhJv+EzvtwNMZg27G/F382JnddH8onMevq5L7awHZp99jaEd6fyTR7XhYJa+lKWqnMeiNYDzPeU9IrZBqh/HcyrmgtxHb9asToZfMk+OhmNhFiGu1MajjGuE1JqSO5KsphhPUUklpmDXSvdyYluRx9xKKLUkxIa7xFRtleWc/kdp52P+O2g/WFxyRLoXqTMyVW3Mt80VVjWuliVpaQXgejVvgt8u1isoklZw0zjjrwJ6HnhEWFEXcd01piFyVsOPYNyYWYfMNJvAiO0LkSvPSxXdHN7C5CZmBIWYzc0Z8iZn3j90p7cqcUJXku/r/Go3xFmATH74qBMV76kMdFyT3fP7bX1o3btSlNLEHPs4h5iUjSfuqSkpMvoED3yoUecwrzmF9fRcIae7AdY/xEmSyL2BrW4HgDzrAoET+zz6hK3iEX+cxdClUEoJIshTnJshoUjLN9MBdLH5YzSRnMwP7pWOI42Y3vM/hwUEpmY3y9lMbYUIxlCbZpWQB5ZBQx87D/EmznYn8OljnJdja2s7DMSrYDkMngM5PtfBzHkjSCFmPsYvbeC4LSCMdG4LkRsIxA+CwoZ2Hwi+1f7PqC/9vpCl/x6Z2nudZTUHyq9VT41M5Tx0+Jfzwp+z4+Odv34Ykc3x9OzPYdn/3B0t/Pxuj9g5IPuA+AX1o81wiT6G0qvmV8FHz40cMwScn1TKj7HT/qI+/Db4VZvrfemOB7841sX9vr218//DpPizhWTrwuHho9/Ojrnol1WB543WCqMx8Cl2KG557N9ilP5c2tU57KzKk7BH4l+/HZPnIIwofg0EGDjxwEclA+qBxsOxg5KNJi+8FjB08fFA+BrJjqEfSxtse4XY8de4xDykraY8a0OvP+1v3cPn6Wj7LtIVX4NODDk2F8AzLvUXKz8+p8e4v3Vu3duVcw7wVlb5qrjjwceXjwYf7Ew6cf5h7cU+Hb05jtewK8kLF/FuUo43Ew/xLMD8DT4AY7mYV6cCrfbZzl23F3ju9efO7BZ/BuuKsu17fzx3t/zP2orsJnvtN3J3fH9mzfD27P9pmHfcPh4c3Dw8Pibbdk+xpuBfMtoNxiNNeZt/q2ct//ntnX+j2Yen3d9dx6nHsdPjF8ovjkRcAbAT4CZyLwm8gfI1x3BIIRODR6WrkuguIM99f7+utKfRmQvtRTlr5UW8Yv1aBeQojb1lrqa8XyyhX1vivqcnwrV1zjW1E3xWcvtS0VUbtCKb80zIOZr+Ib+DC/mRdbl4CyJLegTlkyKRNf9vS6q5q+07StiV/cMMHXiI+nIa+BCzb0NHCHwKYU1mX5FtR5fPV1ft98XPQ/61AIMKHeu9RV6lxqBfNSS6l5KQdosWTUdwis+716LCxKIZY+c5W51bzZLJjNxeYGc9g8bD5uHjVrq7DvlJkPE2ggMOgCEQ7B9n3NS/LzFx7SjjYtjGsbV8bh5njWEvpWFq+Ia26Ok6UrVrbsA7gt+L1bbyXVExfGS5e0xNsmBhfGO7Ci0MogViwT97lIdTAai8bW5Sc/EI3RgtAiipVolA4B7RoDYd3RaCwWIwmUaH6U5NM3DgC+SZQBIgwFprSSv0DfhE7HpgEGGY1RIIa8jr5Zi/ZSQuyDM0THpmeUE0X6/wGPQmpYCmVuZHN0cmVhbQplbmRvYmoKCjEwMSAwIG9iagoxMTQ3OAplbmRvYmoKCjEwMiAwIG9iago8PC9UeXBlL0ZvbnREZXNjcmlwdG9yL0ZvbnROYW1lL0JBQUFBQStMaWJlcmF0aW9uU2Fucy1Cb2xkCi9GbGFncyA0Ci9Gb250QkJveFstNDgxIC0zNzYgMTMwNCAxMDM0XS9JdGFsaWNBbmdsZSAwCi9Bc2NlbnQgOTA1Ci9EZXNjZW50IC0yMTEKL0NhcEhlaWdodCAxMDMzCi9TdGVtViA4MAovRm9udEZpbGUyIDEwMCAwIFIKPj4KZW5kb2JqCgoxMDMgMCBvYmoKPDwvTGVuZ3RoIDQ2My9GaWx0ZXIvRmxhdGVEZWNvZGU+PgpzdHJlYW0KeJxdk8uOozAQRfd8hZc9ixbY2NAtRUjpPKQs5qFJzwcQcNJIHUAOWeTvx7euZ0aaBegYV5UPJVe+OWwP47DkP8LUHf2izsPYB3+b7qHz6uQvw5hpo/qhW9JK3t21nbM85h4ft8VfD+N5Wq2y/Gfcuy3hoZ7W/XTyX7L8e+h9GMaLevq1Ocb18T7Pn/7qx0UVWdOo3p9jna/t/K29+lyyng993B6Wx3NM+Rfw/pi9MrLWVOmm3t/mtvOhHS8+WxVFo1b7fZP5sf9vzzmmnM7dRxtiqI6hReFem8hGuHbgklyCrXBVgZ2wKcCVsK3BNWM0+IVswa9kqbkmb8BvrG/AG34X3tJHzt2RJXfPs7aRdUHGWTr5I1fT3yJe09+9gOnv4Kzpb/G/OvnvwPS3OFfT38FfJ3/5nvylJv0ryU3+UpP+dg+mfy3n0r9GTUP/CjGG/ga9NfR36Kehv0WvDP2NxCd/qUP/WnJT/yU39R+9Msn/DUx/C39Dfye59LfooaF/jX8x9LcSQ3+D3JL+BjEl/Wt4lqn/azD9dxKT/CUm3R/0rUz9h1tJ/3ItlzbdTlxfzNefsVDdPYQ4EjKEMguYgmH0f+d0nmZkyfMbu9bsIgplbmRzdHJlYW0KZW5kb2JqCgoxMDQgMCBvYmoKPDwvVHlwZS9Gb250L1N1YnR5cGUvVHJ1ZVR5cGUvQmFzZUZvbnQvQkFBQUFBK0xpYmVyYXRpb25TYW5zLUJvbGQKL0ZpcnN0Q2hhciAwCi9MYXN0Q2hhciA1NQovV2lkdGhzWzAgNjY2IDYxMCA1NTYgMzMzIDI3NyA3NzcgNTU2IDYxMCA1NTYgMjc3IDM4OSA2MTAgNjY2IDcyMiA4MzMKNzIyIDcyMiA2NjYgNjY2IDY2NiAyNzcgNzIyIDcyMiA2MTAgNTU2IDYxMCA2MTAgMjc3IDc3NyA2MTAgMzMzCjYxMCA3MjIgOTQzIDYxMCAyNzcgNzIyIDU1NiA2MTAgODg5IDU1NiA3MjIgNjY2IDcyMiA1NTYgNjEwIDMzMwozMzMgMjc5IDU1NiA1NTYgMjc3IDI3NyA3MjIgMzMzIF0KL0ZvbnREZXNjcmlwdG9yIDEwMiAwIFIKL1RvVW5pY29kZSAxMDMgMCBSCj4+CmVuZG9iagoKMTA1IDAgb2JqCjw8L0YxIDEwNCAwIFIvRjIgOTQgMCBSL0YzIDk5IDAgUgo+PgplbmRvYmoKCjEwNiAwIG9iago8PAovRm9udCAxMDUgMCBSCi9Qcm9jU2V0Wy9QREYvVGV4dF0KPj4KZW5kb2JqCgoxIDAgb2JqCjw8L1R5cGUvUGFnZS9QYXJlbnQgODkgMCBSL1Jlc291cmNlcyAxMDYgMCBSL01lZGlhQm94WzAgMCA2MTIgNzkyXS9UYWJzL1MKL1N0cnVjdFBhcmVudHMgMAovQ29udGVudHMgMiAwIFI+PgplbmRvYmoKCjUgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL1N0YW5kYXJkCi9QIDQgMCBSCi9QZyAxIDAgUgovQSA8PC9PL0xheW91dC9QbGFjZW1lbnQvQmxvY2sKL1RleHRBbGlnbi9DZW50ZXIKPj4KL0tbMCBdCj4+CmVuZG9iagoKNiAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvU3RhbmRhcmQKL1AgNCAwIFIKL1BnIDEgMCBSCi9BIDw8L08vTGF5b3V0L1BsYWNlbWVudC9CbG9jawovU3BhY2VCZWZvcmUgMC4wMgovVGV4dEFsaWduL0NlbnRlcgo+PgovS1sxIF0KPj4KZW5kb2JqCgo3IDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9TdGFuZGFyZAovUCA0IDAgUgovUGcgMSAwIFIKL0EgPDwvTy9MYXlvdXQvUGxhY2VtZW50L0Jsb2NrCi9TcGFjZUJlZm9yZSAwLjA5Ci9TcGFjZUFmdGVyIDAuMDYKPj4KL0tbMiBdCj4+CmVuZG9iagoKOCAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvU3RhbmRhcmQKL1AgNCAwIFIKL1BnIDEgMCBSCi9BIDw8L08vTGF5b3V0L1BsYWNlbWVudC9CbG9jawovU3BhY2VCZWZvcmUgMC4wMzQKPj4KL0tbMyA0IDUgXQo+PgplbmRvYmoKCjkgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL1N0YW5kYXJkCi9QIDQgMCBSCi9QZyAxIDAgUgovQSA8PC9PL0xheW91dC9QbGFjZW1lbnQvQmxvY2sKL1NwYWNlQmVmb3JlIDAuMDkKL1NwYWNlQWZ0ZXIgMC4wNgo+PgovS1s2IF0KPj4KZW5kb2JqCgoxMCAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvU3RhbmRhcmQKL1AgNCAwIFIKL1BnIDEgMCBSCi9BIDw8L08vTGF5b3V0L1BsYWNlbWVudC9CbG9jawovU3BhY2VCZWZvcmUgMC4wNzIKPj4KL0tbNyA4IDkgXQo+PgplbmRvYmoKCjEzIDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9MYmwKL1AgMTIgMCBSCi9QZyAxIDAgUgovS1sxMCBdCj4+CmVuZG9iagoKMTUgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0xpc3QjMjBQYXJhZ3JhcGgKL1AgMTQgMCBSCi9QZyAxIDAgUgovQSA8PC9PL0xheW91dC9QbGFjZW1lbnQvQmxvY2sKL1N0YXJ0SW5kZW50IDAuMTQKPj4KL0tbMTEgMTIgXQo+PgplbmRvYmoKCjE0IDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9MQm9keQovUCAxMiAwIFIKL1BnIDEgMCBSCi9LWzE1IDAgUiAgXQo+PgplbmRvYmoKCjEyIDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9MSQovUCAxMSAwIFIKL1BnIDEgMCBSCi9LWzEzIDAgUiAgMTQgMCBSICBdCj4+CmVuZG9iagoKMTcgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0xibAovUCAxNiAwIFIKL1BnIDEgMCBSCi9LWzEzIF0KPj4KZW5kb2JqCgoxOSAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvTGlzdCMyMFBhcmFncmFwaAovUCAxOCAwIFIKL1BnIDEgMCBSCi9BIDw8L08vTGF5b3V0L1BsYWNlbWVudC9CbG9jawovU3RhcnRJbmRlbnQgMC4xNAo+PgovS1sxNCAxNSBdCj4+CmVuZG9iagoKMTggMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0xCb2R5Ci9QIDE2IDAgUgovUGcgMSAwIFIKL0tbMTkgMCBSICBdCj4+CmVuZG9iagoKMTYgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0xJCi9QIDExIDAgUgovUGcgMSAwIFIKL0tbMTcgMCBSICAxOCAwIFIgIF0KPj4KZW5kb2JqCgoyMSAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvTGJsCi9QIDIwIDAgUgovUGcgMSAwIFIKL0tbMTYgXQo+PgplbmRvYmoKCjIzIDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9MaXN0IzIwUGFyYWdyYXBoCi9QIDIyIDAgUgovUGcgMSAwIFIKL0EgPDwvTy9MYXlvdXQvUGxhY2VtZW50L0Jsb2NrCi9TdGFydEluZGVudCAwLjE0Cj4+Ci9LWzE3IDE4IF0KPj4KZW5kb2JqCgoyMiAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvTEJvZHkKL1AgMjAgMCBSCi9QZyAxIDAgUgovS1syMyAwIFIgIF0KPj4KZW5kb2JqCgoyMCAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvTEkKL1AgMTEgMCBSCi9QZyAxIDAgUgovS1syMSAwIFIgIDIyIDAgUiAgXQo+PgplbmRvYmoKCjI1IDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9MYmwKL1AgMjQgMCBSCi9QZyAxIDAgUgovS1sxOSBdCj4+CmVuZG9iagoKMjcgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0xpc3QjMjBQYXJhZ3JhcGgKL1AgMjYgMCBSCi9QZyAxIDAgUgovQSA8PC9PL0xheW91dC9QbGFjZW1lbnQvQmxvY2sKL1N0YXJ0SW5kZW50IDAuMTQKPj4KL0tbMjAgMjEgXQo+PgplbmRvYmoKCjI2IDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9MQm9keQovUCAyNCAwIFIKL1BnIDEgMCBSCi9LWzI3IDAgUiAgXQo+PgplbmRvYmoKCjI0IDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9MSQovUCAxMSAwIFIKL1BnIDEgMCBSCi9LWzI1IDAgUiAgMjYgMCBSICBdCj4+CmVuZG9iagoKMTEgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0wKL1AgNCAwIFIKL1BnIDEgMCBSCi9BIDw8L08vTGlzdC9MaXN0TnVtYmVyaW5nL0Rpc2MKPj4KL0tbMTIgMCBSICAxNiAwIFIgIDIwIDAgUiAgMjQgMCBSICBdCj4+CmVuZG9iagoKMjggMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL1N0YW5kYXJkCi9QIDQgMCBSCi9QZyAxIDAgUgovQSA8PC9PL0xheW91dC9QbGFjZW1lbnQvQmxvY2sKL1NwYWNlQmVmb3JlIDAuMDcyCj4+Ci9LWzIyIDIzIDI0IF0KPj4KZW5kb2JqCgozMSAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvTGJsCi9QIDMwIDAgUgovUGcgMSAwIFIKL0tbMjUgXQo+PgplbmRvYmoKCjMzIDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9MaXN0IzIwUGFyYWdyYXBoCi9QIDMyIDAgUgovUGcgMSAwIFIKL0EgPDwvTy9MYXlvdXQvUGxhY2VtZW50L0Jsb2NrCi9TdGFydEluZGVudCAwLjE0Cj4+Ci9LWzI2IDI3IF0KPj4KZW5kb2JqCgozMiAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvTEJvZHkKL1AgMzAgMCBSCi9QZyAxIDAgUgovS1szMyAwIFIgIF0KPj4KZW5kb2JqCgozMCAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvTEkKL1AgMjkgMCBSCi9QZyAxIDAgUgovS1szMSAwIFIgIDMyIDAgUiAgXQo+PgplbmRvYmoKCjM1IDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9MYmwKL1AgMzQgMCBSCi9QZyAxIDAgUgovS1syOCBdCj4+CmVuZG9iagoKMzcgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0xpc3QjMjBQYXJhZ3JhcGgKL1AgMzYgMCBSCi9QZyAxIDAgUgovQSA8PC9PL0xheW91dC9QbGFjZW1lbnQvQmxvY2sKL1N0YXJ0SW5kZW50IDAuMTQKPj4KL0tbMjkgMzAgXQo+PgplbmRvYmoKCjM2IDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9MQm9keQovUCAzNCAwIFIKL1BnIDEgMCBSCi9LWzM3IDAgUiAgXQo+PgplbmRvYmoKCjM0IDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9MSQovUCAyOSAwIFIKL1BnIDEgMCBSCi9LWzM1IDAgUiAgMzYgMCBSICBdCj4+CmVuZG9iagoKMjkgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0wKL1AgNCAwIFIKL1BnIDEgMCBSCi9BIDw8L08vTGlzdC9MaXN0TnVtYmVyaW5nL0Rpc2MKPj4KL0tbMzAgMCBSICAzNCAwIFIgIF0KPj4KZW5kb2JqCgozOCAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvU3RhbmRhcmQKL1AgNCAwIFIKL1BnIDEgMCBSCi9BIDw8L08vTGF5b3V0L1BsYWNlbWVudC9CbG9jawovU3BhY2VCZWZvcmUgMC4wNzIKPj4KL0tbMzEgMzIgMzMgXQo+PgplbmRvYmoKCjQxIDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9MYmwKL1AgNDAgMCBSCi9QZyAxIDAgUgovS1szNCBdCj4+CmVuZG9iagoKNDMgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0xpc3QjMjBQYXJhZ3JhcGgKL1AgNDIgMCBSCi9QZyAxIDAgUgovQSA8PC9PL0xheW91dC9QbGFjZW1lbnQvQmxvY2sKL1N0YXJ0SW5kZW50IDAuMTQKPj4KL0tbMzUgMzYgXQo+PgplbmRvYmoKCjQyIDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9MQm9keQovUCA0MCAwIFIKL1BnIDEgMCBSCi9LWzQzIDAgUiAgXQo+PgplbmRvYmoKCjQwIDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9MSQovUCAzOSAwIFIKL1BnIDEgMCBSCi9LWzQxIDAgUiAgNDIgMCBSICBdCj4+CmVuZG9iagoKNDUgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0xibAovUCA0NCAwIFIKL1BnIDEgMCBSCi9LWzM3IF0KPj4KZW5kb2JqCgo0NyAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvTGlzdCMyMFBhcmFncmFwaAovUCA0NiAwIFIKL1BnIDEgMCBSCi9BIDw8L08vTGF5b3V0L1BsYWNlbWVudC9CbG9jawovU3RhcnRJbmRlbnQgMC4xNAo+PgovS1szOCAzOSBdCj4+CmVuZG9iagoKNDYgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0xCb2R5Ci9QIDQ0IDAgUgovUGcgMSAwIFIKL0tbNDcgMCBSICBdCj4+CmVuZG9iagoKNDQgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0xJCi9QIDM5IDAgUgovUGcgMSAwIFIKL0tbNDUgMCBSICA0NiAwIFIgIF0KPj4KZW5kb2JqCgozOSAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvTAovUCA0IDAgUgovUGcgMSAwIFIKL0EgPDwvTy9MaXN0L0xpc3ROdW1iZXJpbmcvRGlzYwo+PgovS1s0MCAwIFIgIDQ0IDAgUiAgXQo+PgplbmRvYmoKCjQ4IDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9TdGFuZGFyZAovUCA0IDAgUgovUGcgMSAwIFIKL0EgPDwvTy9MYXlvdXQvUGxhY2VtZW50L0Jsb2NrCi9TcGFjZUJlZm9yZSAwLjA3Mgo+PgovS1s0MCA0MSA0MiBdCj4+CmVuZG9iagoKNTEgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0xibAovUCA1MCAwIFIKL1BnIDEgMCBSCi9LWzQzIF0KPj4KZW5kb2JqCgo1MyAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvTGlzdCMyMFBhcmFncmFwaAovUCA1MiAwIFIKL1BnIDEgMCBSCi9BIDw8L08vTGF5b3V0L1BsYWNlbWVudC9CbG9jawovU3RhcnRJbmRlbnQgMC4xNAo+PgovS1s0NCA0NSBdCj4+CmVuZG9iagoKNTIgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0xCb2R5Ci9QIDUwIDAgUgovUGcgMSAwIFIKL0tbNTMgMCBSICBdCj4+CmVuZG9iagoKNTAgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0xJCi9QIDQ5IDAgUgovUGcgMSAwIFIKL0tbNTEgMCBSICA1MiAwIFIgIF0KPj4KZW5kb2JqCgo0OSAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvTAovUCA0IDAgUgovUGcgMSAwIFIKL0EgPDwvTy9MaXN0L0xpc3ROdW1iZXJpbmcvRGlzYwo+PgovS1s1MCAwIFIgIF0KPj4KZW5kb2JqCgo1NCAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvU3RhbmRhcmQKL1AgNCAwIFIKL1BnIDEgMCBSCi9BIDw8L08vTGF5b3V0L1BsYWNlbWVudC9CbG9jawovU3BhY2VCZWZvcmUgMC4wOQovU3BhY2VBZnRlciAwLjA2Cj4+Ci9LWzQ2IF0KPj4KZW5kb2JqCgo1NSAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvU3RhbmRhcmQKL1AgNCAwIFIKL1BnIDEgMCBSCi9BIDw8L08vTGF5b3V0L1BsYWNlbWVudC9CbG9jawovU3BhY2VCZWZvcmUgMC4wNzIKPj4KL0tbNDcgNDggNDkgXQo+PgplbmRvYmoKCjU4IDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9MYmwKL1AgNTcgMCBSCi9QZyAxIDAgUgovS1s1MCBdCj4+CmVuZG9iagoKNjAgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0xpc3QjMjBQYXJhZ3JhcGgKL1AgNTkgMCBSCi9QZyAxIDAgUgovQSA8PC9PL0xheW91dC9QbGFjZW1lbnQvQmxvY2sKL1N0YXJ0SW5kZW50IDAuMTQKPj4KL0tbNTEgNTIgXQo+PgplbmRvYmoKCjU5IDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9MQm9keQovUCA1NyAwIFIKL1BnIDEgMCBSCi9LWzYwIDAgUiAgXQo+PgplbmRvYmoKCjU3IDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9MSQovUCA1NiAwIFIKL1BnIDEgMCBSCi9LWzU4IDAgUiAgNTkgMCBSICBdCj4+CmVuZG9iagoKNjIgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0xibAovUCA2MSAwIFIKL1BnIDEgMCBSCi9LWzUzIF0KPj4KZW5kb2JqCgo2NCAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvTGlzdCMyMFBhcmFncmFwaAovUCA2MyAwIFIKL1BnIDEgMCBSCi9BIDw8L08vTGF5b3V0L1BsYWNlbWVudC9CbG9jawovU3RhcnRJbmRlbnQgMC4xNAo+PgovS1s1NCA1NSBdCj4+CmVuZG9iagoKNjMgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0xCb2R5Ci9QIDYxIDAgUgovUGcgMSAwIFIKL0tbNjQgMCBSICBdCj4+CmVuZG9iagoKNjEgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0xJCi9QIDU2IDAgUgovUGcgMSAwIFIKL0tbNjIgMCBSICA2MyAwIFIgIF0KPj4KZW5kb2JqCgo2NiAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvTGJsCi9QIDY1IDAgUgovUGcgMSAwIFIKL0tbNTYgXQo+PgplbmRvYmoKCjY4IDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9MaXN0IzIwUGFyYWdyYXBoCi9QIDY3IDAgUgovUGcgMSAwIFIKL0EgPDwvTy9MYXlvdXQvUGxhY2VtZW50L0Jsb2NrCi9TdGFydEluZGVudCAwLjE0Cj4+Ci9LWzU3IDU4IF0KPj4KZW5kb2JqCgo2NyAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvTEJvZHkKL1AgNjUgMCBSCi9QZyAxIDAgUgovS1s2OCAwIFIgIF0KPj4KZW5kb2JqCgo2NSAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvTEkKL1AgNTYgMCBSCi9QZyAxIDAgUgovS1s2NiAwIFIgIDY3IDAgUiAgXQo+PgplbmRvYmoKCjU2IDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9MCi9QIDQgMCBSCi9QZyAxIDAgUgovQSA8PC9PL0xpc3QvTGlzdE51bWJlcmluZy9EaXNjCj4+Ci9LWzU3IDAgUiAgNjEgMCBSICA2NSAwIFIgIF0KPj4KZW5kb2JqCgo2OSAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvU3RhbmRhcmQKL1AgNCAwIFIKL1BnIDEgMCBSCi9BIDw8L08vTGF5b3V0L1BsYWNlbWVudC9CbG9jawovU3BhY2VCZWZvcmUgMC4wNzIKPj4KL0tbNTkgNjAgNjEgXQo+PgplbmRvYmoKCjcyIDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9MYmwKL1AgNzEgMCBSCi9QZyAxIDAgUgovS1s2MiBdCj4+CmVuZG9iagoKNzQgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0xpc3QjMjBQYXJhZ3JhcGgKL1AgNzMgMCBSCi9QZyAxIDAgUgovQSA8PC9PL0xheW91dC9QbGFjZW1lbnQvQmxvY2sKL1N0YXJ0SW5kZW50IDAuMTQKPj4KL0tbNjMgNjQgXQo+PgplbmRvYmoKCjczIDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9MQm9keQovUCA3MSAwIFIKL1BnIDEgMCBSCi9LWzc0IDAgUiAgXQo+PgplbmRvYmoKCjcxIDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9MSQovUCA3MCAwIFIKL1BnIDEgMCBSCi9LWzcyIDAgUiAgNzMgMCBSICBdCj4+CmVuZG9iagoKNzAgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL0wKL1AgNCAwIFIKL1BnIDEgMCBSCi9BIDw8L08vTGlzdC9MaXN0TnVtYmVyaW5nL0Rpc2MKPj4KL0tbNzEgMCBSICBdCj4+CmVuZG9iagoKNzUgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL1N0YW5kYXJkCi9QIDQgMCBSCi9QZyAxIDAgUgovQSA8PC9PL0xheW91dC9QbGFjZW1lbnQvQmxvY2sKL1NwYWNlQmVmb3JlIDAuMDYyCj4+Ci9LWzY1IDY2IDY3IF0KPj4KZW5kb2JqCgo3NiAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvU3RhbmRhcmQKL1AgNCAwIFIKL1BnIDEgMCBSCi9BIDw8L08vTGF5b3V0L1BsYWNlbWVudC9CbG9jawovU3BhY2VCZWZvcmUgMC4wOQovU3BhY2VBZnRlciAwLjA2Cj4+Ci9LWzY4IF0KPj4KZW5kb2JqCgo3NyAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvU3RhbmRhcmQKL1AgNCAwIFIKL1BnIDEgMCBSCi9BIDw8L08vTGF5b3V0L1BsYWNlbWVudC9CbG9jawovU3BhY2VCZWZvcmUgMC4wNQo+PgovS1s2OSA3MCA3MSBdCj4+CmVuZG9iagoKNzggMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL1N0YW5kYXJkCi9QIDQgMCBSCi9QZyAxIDAgUgovQSA8PC9PL0xheW91dC9QbGFjZW1lbnQvQmxvY2sKL1N0YXJ0SW5kZW50IDAuMTYKPj4KL0tbNzIgXQo+PgplbmRvYmoKCjc5IDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9TdGFuZGFyZAovUCA0IDAgUgovUGcgMSAwIFIKL0EgPDwvTy9MYXlvdXQvUGxhY2VtZW50L0Jsb2NrCi9TcGFjZUJlZm9yZSAwLjAzOAo+PgovS1s3MyA3NCA3NSBdCj4+CmVuZG9iagoKODAgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL1N0YW5kYXJkCi9QIDQgMCBSCi9QZyAxIDAgUgovQSA8PC9PL0xheW91dC9QbGFjZW1lbnQvQmxvY2sKL1NwYWNlQmVmb3JlIDAuMDkKL1NwYWNlQWZ0ZXIgMC4wNgo+PgovS1s3NiBdCj4+CmVuZG9iagoKODEgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL1N0YW5kYXJkCi9QIDQgMCBSCi9QZyAxIDAgUgovQSA8PC9PL0xheW91dC9QbGFjZW1lbnQvQmxvY2sKL1NwYWNlQmVmb3JlIDAuMDM0Cj4+Ci9LWzc3IDc4IDc5IDgwIDgxIDgyIF0KPj4KZW5kb2JqCgo4MiAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvU3RhbmRhcmQKL1AgNCAwIFIKL1BnIDEgMCBSCi9BIDw8L08vTGF5b3V0L1BsYWNlbWVudC9CbG9jawovU3BhY2VCZWZvcmUgMC4wMjgKPj4KL0tbODMgODQgODUgODYgODcgODggXQo+PgplbmRvYmoKCjgzIDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9TdGFuZGFyZAovUCA0IDAgUgovUGcgMSAwIFIKL0EgPDwvTy9MYXlvdXQvUGxhY2VtZW50L0Jsb2NrCi9TcGFjZUJlZm9yZSAwLjA5Ci9TcGFjZUFmdGVyIDAuMDYKPj4KL0tbODkgXQo+PgplbmRvYmoKCjg0IDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9TdGFuZGFyZAovUCA0IDAgUgovUGcgMSAwIFIKL0EgPDwvTy9MYXlvdXQvUGxhY2VtZW50L0Jsb2NrCi9TcGFjZUJlZm9yZSAwLjAzCj4+Ci9LWzkwIDkxIF0KPj4KZW5kb2JqCgo4NSAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvU3RhbmRhcmQKL1AgNCAwIFIKL1BnIDEgMCBSCi9BIDw8L08vTGF5b3V0L1BsYWNlbWVudC9CbG9jawovU3BhY2VCZWZvcmUgMC4wMTcKPj4KL0tbOTIgOTMgXQo+PgplbmRvYmoKCjg2IDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9TdGFuZGFyZAovUCA0IDAgUgovUGcgMSAwIFIKL0EgPDwvTy9MYXlvdXQvUGxhY2VtZW50L0Jsb2NrCi9TcGFjZUJlZm9yZSAwLjAxNwo+PgovS1s5NCA5NSBdCj4+CmVuZG9iagoKODcgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL1N0YW5kYXJkCi9QIDQgMCBSCi9QZyAxIDAgUgovQSA8PC9PL0xheW91dC9QbGFjZW1lbnQvQmxvY2sKL1NwYWNlQmVmb3JlIDAuMDE3Cj4+Ci9LWzk2IDk3IDk4IF0KPj4KZW5kb2JqCgo4OCAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1MvU3RhbmRhcmQKL1AgNCAwIFIKL1BnIDEgMCBSCi9BIDw8L08vTGF5b3V0L1BsYWNlbWVudC9CbG9jawovU3BhY2VCZWZvcmUgMC4wMTcKPj4KL0tbOTkgMTAwIF0KPj4KZW5kb2JqCgo0IDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9Eb2N1bWVudAovUCAxMDcgMCBSCi9QZyAxIDAgUgovS1s1IDAgUiAgNiAwIFIgIDcgMCBSICA4IDAgUiAgOSAwIFIgIDEwIDAgUiAgMTEgMCBSICAyOCAwIFIgIDI5IDAgUiAgMzggMCBSICAzOSAwIFIgIDQ4IDAgUiAgNDkgMCBSICA1NCAwIFIgIDU1IDAgUiAgNTYgMCBSIAo2OSAwIFIgIDcwIDAgUiAgNzUgMCBSICA3NiAwIFIgIDc3IDAgUiAgNzggMCBSICA3OSAwIFIgIDgwIDAgUiAgODEgMCBSICA4MiAwIFIgIDgzIDAgUiAgODQgMCBSICA4NSAwIFIgIDg2IDAgUiAgODcgMCBSICA4OCAwIFIgCl0KPj4KZW5kb2JqCgoxMDcgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RUcmVlUm9vdAovUGFyZW50VHJlZSAxMDggMCBSCi9Sb2xlTWFwPDwvTGlzdCMyMFBhcmFncmFwaC9QCi9TdGFuZGFyZC9QCj4+Ci9LWzQgMCBSICBdCj4+CmVuZG9iagoKMTA4IDAgb2JqCjw8L051bXNbCjAgWyA1IDAgUiA2IDAgUiA3IDAgUiA4IDAgUiA4IDAgUiA4IDAgUiA5IDAgUiAxMCAwIFIgMTAgMCBSIDEwIDAgUgoxMyAwIFIgMTUgMCBSIDE1IDAgUiAxNyAwIFIgMTkgMCBSIDE5IDAgUiAyMSAwIFIgMjMgMCBSIDIzIDAgUiAyNSAwIFIKMjcgMCBSIDI3IDAgUiAyOCAwIFIgMjggMCBSIDI4IDAgUiAzMSAwIFIgMzMgMCBSIDMzIDAgUiAzNSAwIFIgMzcgMCBSCjM3IDAgUiAzOCAwIFIgMzggMCBSIDM4IDAgUiA0MSAwIFIgNDMgMCBSIDQzIDAgUiA0NSAwIFIgNDcgMCBSIDQ3IDAgUgo0OCAwIFIgNDggMCBSIDQ4IDAgUiA1MSAwIFIgNTMgMCBSIDUzIDAgUiA1NCAwIFIgNTUgMCBSIDU1IDAgUiA1NSAwIFIKNTggMCBSIDYwIDAgUiA2MCAwIFIgNjIgMCBSIDY0IDAgUiA2NCAwIFIgNjYgMCBSIDY4IDAgUiA2OCAwIFIgNjkgMCBSCjY5IDAgUiA2OSAwIFIgNzIgMCBSIDc0IDAgUiA3NCAwIFIgNzUgMCBSIDc1IDAgUiA3NSAwIFIgNzYgMCBSIDc3IDAgUgo3NyAwIFIgNzcgMCBSIDc4IDAgUiA3OSAwIFIgNzkgMCBSIDc5IDAgUiA4MCAwIFIgODEgMCBSIDgxIDAgUiA4MSAwIFIKODEgMCBSIDgxIDAgUiA4MSAwIFIgODIgMCBSIDgyIDAgUiA4MiAwIFIgODIgMCBSIDgyIDAgUiA4MiAwIFIgODMgMCBSCjg0IDAgUiA4NCAwIFIgODUgMCBSIDg1IDAgUiA4NiAwIFIgODYgMCBSIDg3IDAgUiA4NyAwIFIgODcgMCBSIDg4IDAgUgo4OCAwIFIgXQpdPj4KZW5kb2JqCgo4OSAwIG9iago8PC9UeXBlL1BhZ2VzCi9SZXNvdXJjZXMgMTA2IDAgUgovS2lkc1sgMSAwIFIgXQovQ291bnQgMT4+CmVuZG9iagoKMTA5IDAgb2JqCjw8L1R5cGUvQ2F0YWxvZy9QYWdlcyA4OSAwIFIKL1BhZ2VNb2RlL1VzZU91dGxpbmVzCi9PcGVuQWN0aW9uWzEgMCBSIC9YWVogbnVsbCBudWxsIDBdCi9TdHJ1Y3RUcmVlUm9vdCAxMDcgMCBSCi9MYW5nKGVuLVVTKQovTWFya0luZm88PC9NYXJrZWQgdHJ1ZT4+Cj4+CmVuZG9iagoKMTEwIDAgb2JqCjw8L0F1dGhvcjxGRUZGMDA1NTAwNkUwMDJEMDA2RTAwNjEwMDZEMDA2NTAwNjQ+Ci9DcmVhdG9yPEZFRkYwMDU3MDA3MjAwNjkwMDc0MDA2NTAwNzI+Ci9Qcm9kdWNlcjxGRUZGMDA0QzAwNjkwMDYyMDA3MjAwNjUwMDRGMDA2NjAwNjYwMDY5MDA2MzAwNjUwMDIwMDAzMjAwMzQwMDJFMDAzMj4KL0NyZWF0aW9uRGF0ZShEOjIwMjYwNTI4MTk1NTA2WicpPj4KZW5kb2JqCgp4cmVmCjAgMTExCjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDA0NTMyNiAwMDAwMCBuIAowMDAwMDAwMDE5IDAwMDAwIG4gCjAwMDAwMDQ5ODIgMDAwMDAgbiAKMDAwMDA1NDc2MSAwMDAwMCBuIAowMDAwMDQ1NDUxIDAwMDAwIG4gCjAwMDAwNDU1NzkgMDAwMDAgbiAKMDAwMDA0NTcyNSAwMDAwMCBuIAowMDAwMDQ1ODcwIDAwMDAwIG4gCjAwMDAwNDYwMDMgMDAwMDAgbiAKMDAwMDA0NjE0OCAwMDAwMCBuIAowMDAwMDQ3ODE0IDAwMDAwIG4gCjAwMDAwNDY1NzkgMDAwMDAgbiAKMDAwMDA0NjI4MiAwMDAwMCBuIAowMDAwMDQ2NDk4IDAwMDAwIG4gCjAwMDAwNDYzNTYgMDAwMDAgbiAKMDAwMDA0Njk2MiAwMDAwMCBuIAowMDAwMDQ2NjY1IDAwMDAwIG4gCjAwMDAwNDY4ODEgMDAwMDAgbiAKMDAwMDA0NjczOSAwMDAwMCBuIAowMDAwMDQ3MzQ1IDAwMDAwIG4gCjAwMDAwNDcwNDggMDAwMDAgbiAKMDAwMDA0NzI2NCAwMDAwMCBuIAowMDAwMDQ3MTIyIDAwMDAwIG4gCjAwMDAwNDc3MjggMDAwMDAgbiAKMDAwMDA0NzQzMSAwMDAwMCBuIAowMDAwMDQ3NjQ3IDAwMDAwIG4gCjAwMDAwNDc1MDUgMDAwMDAgbiAKMDAwMDA0Nzk0OSAwMDAwMCBuIAowMDAwMDQ4ODUyIDAwMDAwIG4gCjAwMDAwNDgzODMgMDAwMDAgbiAKMDAwMDA0ODA4NiAwMDAwMCBuIAowMDAwMDQ4MzAyIDAwMDAwIG4gCjAwMDAwNDgxNjAgMDAwMDAgbiAKMDAwMDA0ODc2NiAwMDAwMCBuIAowMDAwMDQ4NDY5IDAwMDAwIG4gCjAwMDAwNDg2ODUgMDAwMDAgbiAKMDAwMDA0ODU0MyAwMDAwMCBuIAowMDAwMDQ4OTcxIDAwMDAwIG4gCjAwMDAwNDk4NzQgMDAwMDAgbiAKMDAwMDA0OTQwNSAwMDAwMCBuIAowMDAwMDQ5MTA4IDAwMDAwIG4gCjAwMDAwNDkzMjQgMDAwMDAgbiAKMDAwMDA0OTE4MiAwMDAwMCBuIAowMDAwMDQ5Nzg4IDAwMDAwIG4gCjAwMDAwNDk0OTEgMDAwMDAgbiAKMDAwMDA0OTcwNyAwMDAwMCBuIAowMDAwMDQ5NTY1IDAwMDAwIG4gCjAwMDAwNDk5OTMgMDAwMDAgbiAKMDAwMDA1MDUxMyAwMDAwMCBuIAowMDAwMDUwNDI3IDAwMDAwIG4gCjAwMDAwNTAxMzAgMDAwMDAgbiAKMDAwMDA1MDM0NiAwMDAwMCBuIAowMDAwMDUwMjA0IDAwMDAwIG4gCjAwMDAwNTA2MjQgMDAwMDAgbiAKMDAwMDA1MDc3MSAwMDAwMCBuIAowMDAwMDUyMDU3IDAwMDAwIG4gCjAwMDAwNTEyMDUgMDAwMDAgbiAKMDAwMDA1MDkwOCAwMDAwMCBuIAowMDAwMDUxMTI0IDAwMDAwIG4gCjAwMDAwNTA5ODIgMDAwMDAgbiAKMDAwMDA1MTU4OCAwMDAwMCBuIAowMDAwMDUxMjkxIDAwMDAwIG4gCjAwMDAwNTE1MDcgMDAwMDAgbiAKMDAwMDA1MTM2NSAwMDAwMCBuIAowMDAwMDUxOTcxIDAwMDAwIG4gCjAwMDAwNTE2NzQgMDAwMDAgbiAKMDAwMDA1MTg5MCAwMDAwMCBuIAowMDAwMDUxNzQ4IDAwMDAwIG4gCjAwMDAwNTIxODQgMDAwMDAgbiAKMDAwMDA1MjcwNCAwMDAwMCBuIAowMDAwMDUyNjE4IDAwMDAwIG4gCjAwMDAwNTIzMjEgMDAwMDAgbiAKMDAwMDA1MjUzNyAwMDAwMCBuIAowMDAwMDUyMzk1IDAwMDAwIG4gCjAwMDAwNTI4MTUgMDAwMDAgbiAKMDAwMDA1Mjk1MiAwMDAwMCBuIAowMDAwMDUzMDk5IDAwMDAwIG4gCjAwMDAwNTMyMzUgMDAwMDAgbiAKMDAwMDA1MzM2NSAwMDAwMCBuIAowMDAwMDUzNTAyIDAwMDAwIG4gCjAwMDAwNTM2NDkgMDAwMDAgbiAKMDAwMDA1Mzc5NSAwMDAwMCBuIAowMDAwMDUzOTQxIDAwMDAwIG4gCjAwMDAwNTQwODggMDAwMDAgbiAKMDAwMDA1NDIyMSAwMDAwMCBuIAowMDAwMDU0MzU1IDAwMDAwIG4gCjAwMDAwNTQ0ODkgMDAwMDAgbiAKMDAwMDA1NDYyNiAwMDAwMCBuIAowMDAwMDU1OTQ2IDAwMDAwIG4gCjAwMDAwMDUwMDMgMDAwMDAgbiAKMDAwMDAxOTg5OCAwMDAwMCBuIAowMDAwMDE5OTIxIDAwMDAwIG4gCjAwMDAwMjAxMTcgMDAwMDAgbiAKMDAwMDAyMDc2NSAwMDAwMCBuIAowMDAwMDIxMjUxIDAwMDAwIG4gCjAwMDAwMzE0MjIgMDAwMDAgbiAKMDAwMDAzMTQ0NSAwMDAwMCBuIAowMDAwMDMxNjUzIDAwMDAwIG4gCjAwMDAwMzIxNDggMDAwMDAgbiAKMDAwMDAzMjQ5NSAwMDAwMCBuIAowMDAwMDQ0MDYyIDAwMDAwIG4gCjAwMDAwNDQwODYgMDAwMDAgbiAKMDAwMDA0NDI5MSAwMDAwMCBuIAowMDAwMDQ0ODI1IDAwMDAwIG4gCjAwMDAwNDUyMTMgMDAwMDAgbiAKMDAwMDA0NTI2OCAwMDAwMCBuIAowMDAwMDU1MDg4IDAwMDAwIG4gCjAwMDAwNTUyMDkgMDAwMDAgbiAKMDAwMDA1NjAyMiAwMDAwMCBuIAowMDAwMDU2MTkzIDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSAxMTEvUm9vdCAxMDkgMCBSCi9JbmZvIDExMCAwIFIKL0lEIFsgPDlEOTQwRjAyRkUxRjMwQjNFQUFGNzZBRkJFMEZGNjY2Pgo8OUQ5NDBGMDJGRTFGMzBCM0VBQUY3NkFGQkUwRkY2NjY+IF0KL0RvY0NoZWNrc3VtIC9GNURCODQyQjBFQ0JDNENCRUI2NjQzRUE4RTg2OEJFMgo+PgpzdGFydHhyZWYKNTY0MTQKJSVFT0YK' },
    ],
    summary:
      'CS undergraduate at SJSU (B.S., 2028) with applied work in AI/ML, quantitative finance, and inclusive-computing research. Co-author of a peer-reviewed ACM SIGCSE 2026 publication and conference poster presenter. Two résumés below — one tuned for software/AI roles, one for finance and fintech.',
  },
};


// nav order matters — put the most important stuff first so recruiters don't have to hunt
// 'Blog' is hidden until I actually write something, empty pages look bad
// 'Professional' sits third because it is the page a recruiter actually wants;
// 'Goofy Corner' sits second-to-last because it is the page a human actually wants.
const PAGES = ['Home', 'About', 'Professional', 'Working On', 'Research', 'Projects', 'Resume', 'Goofy Corner', 'Legal'];

// in-app section tabs read better with an accent on the résumé page, which is the
// PDF viewer — /resume.html in the site nav is the separate services page.
const TAB_LABEL = { Resume: 'Résumé' };

// Canonical cross-site nav — plain anchors to the static pages, identical on every
// page in /public. "Work" is this SPA, so it stays client-side instead of reloading.
const SITE_LINKS = [
  { label: 'Resume', href: '/resume.html' },
  { label: 'Store', href: '/store.html' },
  { label: 'CODESWITCH', href: '/codeswitch.html' },
  { label: 'KXNG SEF', href: '/kxngsef.html' },
  { label: 'Hire', href: '/hire.html' },
  { label: 'Media Kit', href: '/media-kit.html' },
];

// ---------- Professional page content ----------
// Deliberately NOT part of `siteData`: that object round-trips through
// localStorage via the admin panel, so an older saved copy in someone's browser
// would arrive here missing these keys and take the page down. Module constants
// can't be stale. Every number below is one of the five figures I can show a
// method for — nothing else goes on this page.
const PROFESSIONAL = {
  eyebrow: 'The Professional File',
  title: 'Everything a recruiter asks for, on one page',
  lead:
    'Profiles, publications, the things I have actually shipped, and the roles I hold — with the measurement behind every number. No figure appears here unless I can tell you the window it was measured over.',
  presence: [
    {
      label: 'LinkedIn',
      handle: 'in/yusuf-gadelrab-76246b221',
      meta: '705 followers · 500+ connections',
      url: 'https://www.linkedin.com/in/yusuf-gadelrab-76246b221',
      cta: 'Connect →',
      icon: 'M6.94 5a2 2 0 11-4-.02 2 2 0 014 .02zM7 8.48H3V21h4V8.48zm6.32 0H9.34V21h3.94v-6.57c0-3.66 4.77-4 4.77 0V21H22v-7.93c0-6.17-7.06-5.94-8.72-2.91l.04-1.68z',
    },
    {
      label: 'GitHub',
      handle: '@Yusuf-Gadelrab',
      meta: 'EventReels · EcoImpact · EdgeLog · swing-screener',
      url: 'https://github.com/Yusuf-Gadelrab',
      cta: 'View the code →',
      icon: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0019.4 5a5.07 5.07 0 00-.09-3.77S18.09.65 15.5 2.4a13.4 13.4 0 00-7 0C5.91.65 4.69 1.23 4.69 1.23A5.07 5.07 0 004.6 5a5.44 5.44 0 00-1.1 3.55c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22',
    },
    {
      label: 'ORCID',
      handle: '0009-0001-6579-1179',
      meta: 'Persistent researcher identifier',
      url: 'https://orcid.org/0009-0001-6579-1179',
      cta: 'Open the record →',
      icon: 'M12 2a10 10 0 100 20 10 10 0 000-20zM8 8v9M8 5.6v.1M12 8h2.4a4.5 4.5 0 010 9H12V8z',
    },
  ],
  metrics: [
    { value: '78%', label: 'Directional accuracy — NLP equity-scoring model, six-month backtest on IBM Watson' },
    { value: '60%', label: 'Reduction in manual equity-research time once the signal pipeline shipped' },
    { value: '40%', label: 'Lift in monthly web engagement after rebuilding the SVEC site end to end' },
    { value: '60', label: 'Participants in the IRB-approved bilingual-coding study, with statistically significant pre-to-post confidence gains' },
    { value: '35%', label: 'Operational budget expansion at SVEC, via four corporate technology sponsors' },
  ],
  publications: [
    {
      kind: 'Peer-reviewed paper',
      role: 'Co-author',
      title: 'Exploring Bilingual Coding for Inclusive Computer Science Learning',
      venue: 'SIGCSE TS 2026 · 57th ACM Technical Symposium on Computer Science Education',
      doi: '10.1145/3770761.3777339',
      url: 'https://doi.org/10.1145/3770761.3777339',
      note:
        'A 60-participant, IRB-approved mixed-methods study run in Dr. Ethel Tshukudu’s CS-education lab at San José State. Participants showed statistically significant pre-to-post gains in programming confidence, computing identity, enjoyment and motivation, and novice learners gained significantly more than experienced programmers. I contributed to survey design and mixed-methods analysis.',
    },
    {
      kind: 'Poster',
      role: 'Poster co-presenter',
      title: 'Adaptive Curriculum Maps: Graph-Augmented Retrieval-Oriented LLMs for Education',
      venue: 'SIGCSE TS 2026 · ACM · poster session, St. Louis, MO',
      doi: '',
      url: '',
      note:
        'Co-presented work on pairing graph-augmented retrieval with large language models to generate adaptive curriculum maps — how an LLM can structure and personalise a learning pathway rather than just answer questions. This was a poster rather than an archival paper, so no DOI is claimed for it.',
    },
  ],
  ventures: [
    {
      name: 'DHAHAB Studio',
      tag: 'Productized services',
      href: '/services.html',
      desc:
        'Three fixed-scope builds for early founders: a conversion-ready launch site in about a week, a Shield security audit with a scored report in 48 hours, and an AI automation build shipped with a QC gate and a runbook. One builder end to end.',
    },
    {
      name: 'DIRA',
      tag: 'Security scanner · Python',
      href: '/dira.html',
      desc:
        'A seven-scanner security audit for small teams — secrets, dependency CVEs, config and IaC rules, license risk, git-history leaks, and live TLS and headers — with SBOM output, safe auto-remediation, PR diff gating, and a startup-readiness score.',
    },
    {
      name: 'FreightDesk AI',
      tag: 'Flagship product',
      href: '/freightdesk.html',
      desc:
        'An AR and billing copilot that freight brokerages install on their own machine. It drafts POD-chasing, dispute, reconciliation and past-due email with a local LLM, so there are no per-seat SaaS fees and no metered API bills.',
    },
    {
      name: 'KXNG SEF',
      tag: 'Clothing brand',
      href: '/kxngsef.html',
      desc:
        'The streetwear side of the house: a full brand kit and garment prints generated from the same lion mark that runs everything else, with a storefront currently taking waitlist signups.',
    },
    {
      name: 'EventReels',
      tag: 'Prototype · Python + ffmpeg',
      href: '/eventreels.html',
      desc:
        'Raw event footage in, finished 9:16 highlight reel out. Scene-change detection plus per-half-second loudness analysis picks the moments, and the output is normalised to −14 LUFS for social. No API keys, no Python dependencies — just ffmpeg.',
    },
    {
      name: 'Automation Studio',
      tag: 'Digital product store',
      href: '/store.html',
      desc:
        'The storefront: interactive, fillable playbooks and template kits across trading systems, Claude workflows, resumes and internship prep — all built from one PDF engine and sold from one place.',
    },
  ],
  leadership: [
    {
      role: 'Technical Operations & Web Lead',
      org: 'Silicon Valley Entrepreneurship Club',
      meta: 'Dec 2025 – Present',
      note:
        'Own the club’s website and technical operations end to end. Monthly visitor engagement up 40%, four corporate technology sponsors signed, operational budget expanded 35%.',
    },
    {
      role: 'Board Treasurer',
      org: 'Kappa Sigma at San José State University',
      meta: 'Aug 2025 – Present',
      note: '',
    },
    {
      role: 'CS Tutor & Curriculum Lead',
      org: 'SJSU Coding Warriors + Computer Science Department',
      meta: 'Aug 2024 – Present',
      note:
        'Design challenge-based programming events and run Python and Java workshops for beginners, translating advanced concepts into formats that land at every skill level.',
    },
    {
      role: 'Undergraduate Researcher',
      org: 'CSEd Research Lab, SJSU — Dr. Ethel Tshukudu',
      meta: 'Aug 2024 – Present',
      note:
        'Mixed-methods research under IRB protocol, plus CS programming at Yerba Buena High School and an expansion into Lynbrook High School.',
    },
    {
      role: 'Campus Ambassador',
      org: 'Mathos AI',
      meta: 'Feb 2025 – Present',
      note: '',
    },
  ],
  docs: [
    { label: 'Hire me', href: '/hire.html', note: 'Scope, engagement shapes, and how I work with founders and teams.' },
    { label: 'Resume services', href: '/resume.html', note: 'The public resume page — services, packages and turnaround.' },
    { label: 'Media kit', href: '/media-kit.html', note: 'Creator reach, digitals, and everything brand-facing in one PDF-ready page.' },
    { label: 'Brand system', href: '/brand.html', note: 'The DHAHAB lion mark, its variants, and the rules that keep it consistent.' },
  ],
  integrity:
    'On measurement: every figure above has a method behind it — a backtest window, a participant count, or a documented before-and-after. My swing-trading research is where that line gets tested hardest. The defensible figure is +0.117R over 4,933 trades across a 129-symbol, ten-year universe (95% CI +0.057 to +0.174), and I do not present it as a validated standalone edge: a risk-matched random entry already captures most of it, so the signal’s own contribution has a confidence interval that crosses zero. An earlier, far smaller-sample result did not survive my own adversarial re-test and was pulled from this site rather than quietly left up.',
};

// ---------- Goofy Corner content ----------
// Same brand, lower blood pressure. Rule for anything added here: self-deprecating
// or wholesome only — the joke is always on me.
const GOOFY = {
  lore: [
    {
      chapter: 'Chapter I',
      title: 'Confidently wrong in two languages',
      body:
        'Arabic first, English second. Which sounds impressive on a résumé and mostly meant that as a kid I got to be completely certain about the wrong thing twice as often as everybody else.',
    },
    {
      chapter: 'Chapter II',
      title: 'League MVP, three positions, one huddle problem',
      body:
        'Wide receiver, running back, outside linebacker. League MVP. I was fast and I was fearless and I once ran an immaculate route on a play that had been audibled out of in the huddle. Nobody threw it. I have thought about it since.',
    },
    {
      chapter: 'Chapter III',
      title: 'Valedictorian, 4.0, graduation speaker',
      body:
        'I stood in front of an entire football field of people and gave a speech I had rehearsed about ninety times. I still brought the notes. I still looked at the notes.',
    },
    {
      chapter: 'Chapter IV',
      title: 'And then I chose spreadsheets',
      body:
        'Every direction available and I picked cell references, R-multiples, and a backtest harness that tells me my ideas are bad. Genuinely love it here. I have the CSV to prove it.',
    },
    {
      chapter: 'Chapter V',
      title: 'Building in public, one green test suite at a time',
      body:
        'Now I ship things with names like FreightDesk and DIRA, and the single best feeling available to me on any given day is a terminal full of passing tests. This is who I am now. I have made peace with it.',
    },
    {
      chapter: 'Chapter VI',
      title: 'Present day',
      body:
        'Somewhere in San José, explaining a race condition out loud to a small plastic duck, at an hour that no longer qualifies as either night or morning.',
    },
  ],
  duck: [
    'So the function works. The function definitely works. Why does the function not work.',
    'Okay, walk me through it. No, you can’t talk. That is the entire premise of you.',
    'It was a typo. It was a typo the whole time. We are never speaking of this again.',
    'I am going to explain this to you very slowly, so that I understand it.',
    'This is either a caching issue or a character flaw. Possibly both. Probably both.',
    'If I rename the variable, do you think the bug will feel differently about itself?',
    'I fixed it. I do not know what I did. We do not touch it. We back away slowly.',
    'You are the only member of this team who has never once introduced a regression.',
    'I know it is 3am. I know. I have one more idea and then I promise I will sleep.',
    'The tests pass locally. Which means the tests are lying locally.',
    'Let the record show that I read the error message. Just... not all the way to the end.',
    'What if the bug is not in the code. What if the bug is in me.',
  ],
  takes: [
    { heat: 1, text: 'Nobody in the history of software has ever regretted naming the variable properly.' },
    { heat: 2, text: 'Reading the error message all the way to the end is, and I say this with love, an advanced technique.' },
    { heat: 3, text: 'The best debugging tool is a walk around the block. The second best is a rubber duck. The IDE is a distant third.' },
    { heat: 4, text: '“It works on my machine” is a perfectly valid finding. It is simply not a valid fix.' },
    { heat: 5, text: 'Commenting what the code does is optional. Commenting why it does it is the actual job.' },
    { heat: 6, text: 'Football taught me more about shipping software than any lecture: show up prepared, run the route, get hit, run it again.' },
    { heat: 7, text: 'Dark mode is not a personality — a thing I say while shipping exclusively black-and-gold pages, so take it up with me later.' },
    { heat: 8, text: 'A four-hour backtest that says “no edge” is worth more than a four-minute one that says “yes”. The second one is just a compliment.' },
    { heat: 9, text: 'If a number on a portfolio has no method attached to it, it is decoration. Decoration is fine — just don’t call it evidence.' },
  ],
};

// A caveman-mode "translator" that is, transparently, a lookup table and two
// regexes. Half the joke is how obviously dumb it is; the other half is that it
// still mostly works.
const CAVE_WORDS = {
  i: 'me', "i'm": 'me be', "i've": 'me', "i'll": 'me', "i'd": 'me', my: 'me', mine: 'me', myself: 'me',
  we: 'us', our: 'us', ours: 'us', "we're": 'us be',
  am: 'be', is: 'be', are: 'be', was: 'be', were: 'be', been: 'be', "isn't": 'no be', "aren't": 'no be',
  "don't": 'no', "doesn't": 'no', "didn't": 'no', not: 'no', never: 'no', cannot: 'no can', "can't": 'no can',
  the: '', a: '', an: '', of: '', to: '', that: '', which: '', would: '', could: '', should: '',
  very: 'much', really: 'much', extremely: 'much', entire: 'big', entirely: 'much', completely: 'much',
  computer: 'thinking rock', laptop: 'glow rock', machine: 'metal box', terminal: 'black window',
  code: 'rock word', coding: 'rock word', codebase: 'rock word pile', software: 'rock word',
  algorithm: 'rock magic', function: 'rock spell', variable: 'name box', bug: 'bad bug', bugs: 'bad bug',
  debugging: 'bug hunt', internet: 'sky web', spreadsheet: 'number grid', data: 'numbers',
  research: 'thinking work', paper: 'thinking scroll', publication: 'thinking scroll', resume: 'brag scroll',
  portfolio: 'brag cave', backtest: 'past-check', money: 'shiny', budget: 'shiny pile', gold: 'shiny',
  luxury: 'shiny', football: 'run-ball', wrestling: 'ground fight', speech: 'loud talk', duck: 'small bird',
  sleep: 'cave nap', night: 'dark time', morning: 'light time', hour: 'sun move',
  understand: 'get it', explain: 'point and grunt', genuinely: 'for real', probably: 'maybe',
  yes: 'ugh yes', no: 'ugh no', hello: 'ugh hello', because: 'so', however: 'but', therefore: 'so',
};

function cavemanize(text) {
  if (!text) return text;
  return String(text)
    .split(/(\s+)/)
    .map((tok) => {
      if (!tok || /^\s+$/.test(tok)) return tok;
      const m = tok.match(/^([^A-Za-z']*)([A-Za-z']*)([^A-Za-z']*)$/);
      if (!m) return tok;
      const [, pre, word, post] = m;
      const key = word.toLowerCase().replace(/[’]/g, "'");
      if (!Object.prototype.hasOwnProperty.call(CAVE_WORDS, key)) return pre + word + post;
      const rep = CAVE_WORDS[key];
      if (!rep) return pre + post; // dropped word — keep its punctuation
      const cased = /^[A-Z]/.test(word) ? rep.charAt(0).toUpperCase() + rep.slice(1) : rep;
      return pre + cased + post;
    })
    .join('')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([.,;:!?…])/g, '$1')
    .replace(/^\s+/, '')
    .trim();
}

// ---------- Styles ----------
// Tokens, reset, nav, footer, buttons, cards, badges, stat tiles, grid, type scale,
// reveal and print rules all come from /css/site.css. Everything below is genuinely
// homepage-only (the SPA tab strip, list/gallery/marquee bits, hidden admin panel)
// and is written entirely with var(--*) tokens so it can never drift from the system.
// The hero, stat-grid and section-tab layout lives in index.html's <style id="yg-boot-css">
// because the pre-hydration snapshot and this app share it — one definition, no swap on load.
const StyleTag = () => (
  <style>{`
    /* gold-dot bullet list — used for "working on" and experience achievements */
    .bullets{list-style:none;margin-top:var(--s4)}
    .bullets li{position:relative;padding-left:var(--s5);margin-bottom:var(--s3);
      color:var(--muted);font-size:var(--t-small)}
    .bullets li::before{content:"";position:absolute;left:0;top:.62em;
      width:6px;height:6px;background:var(--gold);border-radius:1px}

    /* skill chips */
    .chips{display:flex;flex-wrap:wrap;gap:var(--s2);margin-top:var(--s3)}
    .chip{border:1px solid var(--line-soft);border-radius:var(--radius);
      padding:5px 11px;font-size:var(--t-small);color:var(--muted);background:var(--bg2)}

    /* card artwork strip (real photo or generated SVG placeholder) */
    .card-art{height:180px;background:var(--panel2) center/cover;position:relative;overflow:hidden;
      border-radius:var(--radius-lg) var(--radius-lg) 0 0;margin:calc(var(--s6) * -1) calc(var(--s6) * -1) var(--s5)}
    .genart{position:absolute;inset:0;width:100%;height:100%;display:block}
    .card-ic{display:inline-flex;align-items:center;justify-content:center;
      width:34px;height:34px;border-radius:var(--radius);color:var(--gold-2);
      background:var(--bg2);border:1px solid var(--line);flex-shrink:0}

    /* photo gallery (About) */
    .gallery{display:grid;gap:var(--s4);grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr))}
    .gallery-tile{position:relative;aspect-ratio:1;overflow:hidden;background:var(--panel2);
      border:1px solid var(--line-soft);border-radius:var(--radius-lg)}
    .gallery-tile img{width:100%;height:100%;object-fit:cover;transition:transform .4s var(--ease)}
    .gallery-tile:hover img{transform:scale(1.06)}
    .gallery-cap{position:absolute;inset:auto 0 0 0;padding:var(--s3);font-size:var(--t-small);
      background:linear-gradient(transparent,var(--bg))}

    /* skills ticker */
    .marquee{overflow:hidden;margin-top:var(--s8);padding:var(--s3) 0;
      border-top:1px solid var(--line);border-bottom:1px solid var(--line);
      -webkit-mask:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent);
      mask:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)}
    .marquee-track{display:inline-flex;white-space:nowrap;animation:tickerScroll 38s linear infinite}
    .marquee-track span{font-size:var(--t-micro);letter-spacing:.14em;
      text-transform:uppercase;color:var(--muted)}
    .marquee:hover .marquee-track{animation-play-state:paused}
    @keyframes tickerScroll{to{transform:translateX(-50%)}}

    /* hidden admin panel — Ctrl+Shift+E, never shown to visitors */
    .admin-wrap{position:fixed;inset:0;z-index:90;background:var(--bg);
      overflow-y:auto;padding:var(--s7) var(--section-x)}
    .admin-box{max-width:820px;margin:0 auto}
    .admin-card{background:var(--panel);border:1px solid var(--line-soft);
      border-radius:var(--radius-lg);padding:var(--s5);margin-bottom:var(--s4)}
    .admin-label{display:block;font-size:var(--t-small);color:var(--gold-2);margin:var(--s3) 0 var(--s1)}
    .admin-text{min-height:80px;resize:vertical}
    .row-tools{display:flex;justify-content:space-between;align-items:center;
      gap:var(--s3);margin-bottom:var(--s2)}
    .mini{font-size:var(--t-micro);border:1px solid var(--line-soft);background:none;
      color:var(--muted);border-radius:var(--radius);padding:5px 10px;cursor:pointer;font-family:inherit}
    .mini:hover{color:var(--gold-2);border-color:var(--line)}
    .mini.danger:hover{color:var(--bad);border-color:var(--bad)}

    /* ================= motion polish (SPA-wide) =================
       Everything here is additive and token-driven. The site-wide
       prefers-reduced-motion block in site.css already flattens transitions;
       the explicit guards below kill the looping keyframes too, because a
       .01ms duration on an infinite animation still repaints forever. */

    /* page-transition choreography — the section content lifts in behind the
       existing opacity crossfade in <main>, keyed on the page name so React
       remounts it and the animation actually replays. */
    .page-swap{animation:pageIn .55s var(--ease) both}
    @keyframes pageIn{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}

    /* gold shimmer — sweeps the existing .gold-fill gradient rather than
       introducing a second one, so the colour ramp can never drift */
    .gold-fill.shimmer{background-size:260% 100%;animation:goldShimmer 6.5s linear infinite}
    @keyframes goldShimmer{from{background-position:190% 0}to{background-position:-90% 0}}

    /* pointer-driven magnetism/tilt: usePointerMotion writes an inline transform
       while the pointer is inside an element, so it needs a fast transition to
       track; on leave the class comes off and the stylesheet's slower ease
       returns it to rest. */
    .pm-live{transition:transform .09s linear}

    /* link-styled button — for inline "go to page" affordances inside prose */
    .linkish{background:none;border:0;padding:0;font:inherit;cursor:pointer;color:var(--gold-2);
      text-decoration:underline;text-underline-offset:3px;text-decoration-color:var(--line)}
    .linkish:hover{text-decoration-color:var(--gold)}

    /* ================= Professional ================= */
    .pres{display:grid;gap:var(--s4);grid-template-columns:repeat(auto-fit,minmax(min(260px,100%),1fr));
      margin-top:var(--s5)}
    .pres-card{display:flex;flex-direction:column;gap:var(--s2)}
    .pres-top{display:flex;align-items:center;gap:var(--s3)}
    .pres-handle{font-family:var(--mono);font-size:var(--t-small);color:var(--ink);word-break:break-all}
    .doi{display:inline-flex;align-items:center;gap:var(--s2);font-family:var(--mono);
      font-size:var(--t-micro);letter-spacing:.04em;color:var(--gold-2);
      border:1px solid var(--line);border-radius:var(--radius);padding:5px 10px;background:rgba(212,175,55,.06)}
    .no-doi{border-style:dashed;color:var(--faint);background:none}
    /* column flex stretches children to full width — badges must hug their text */
    .venture{display:flex;flex-direction:column}
    .venture>.badge{align-self:flex-start}
    .venture h3{margin-top:var(--s3)}
    .lead-list{list-style:none;margin-top:var(--s5);display:grid;gap:var(--s3)}
    .lead-row{display:flex;flex-wrap:wrap;align-items:baseline;gap:var(--s2) var(--s4);
      padding:var(--s4) 0;border-bottom:1px solid var(--line-soft)}
    .lead-row:last-child{border-bottom:0}
    .lead-role{font-weight:600;color:var(--ink);flex:1 1 260px}
    .lead-meta{font-size:var(--t-small);color:var(--faint);font-family:var(--mono)}
    .lead-note{flex:1 1 100%;font-size:var(--t-small);color:var(--muted);margin-top:var(--s1)}
    .rail{display:grid;gap:var(--s3);grid-template-columns:repeat(auto-fit,minmax(min(230px,100%),1fr));
      margin-top:var(--s5)}
    .rail a{display:block;padding:var(--s4);border:1px solid var(--line-soft);border-radius:var(--radius-lg);
      background:var(--bg2);transition:border-color .3s var(--ease),transform .3s var(--ease)}
    .rail a:hover{border-color:var(--gold);transform:translateY(-3px)}
    .rail strong{color:var(--gold-2);display:block;margin-bottom:var(--s1)}
    .rail span{font-size:var(--t-small);color:var(--muted)}

    /* ================= Goofy Corner ================= */
    /* Per-letter gradient rather than wrapping the whole thing in .gold-fill:
       background-clip:text on a parent whose children are individually
       transformed is unreliable across engines (the letters can clip away to
       nothing). Each <b> owning its own background box cannot do that. */
    .wobble{display:inline-block}
    .wobble-w{display:inline-block;white-space:nowrap}
    .wobble b{display:inline-block;font-weight:inherit;transform-origin:50% 85%;
      background:linear-gradient(120deg,var(--gold-2),var(--gold) 45%,var(--gold-dim));
      background-size:260% 100%;
      -webkit-background-clip:text;background-clip:text;
      -webkit-text-fill-color:transparent;color:var(--gold);
      animation:wobbleLetter 2.8s var(--ease) infinite,goldShimmer 6.5s linear infinite}
    @keyframes wobbleLetter{0%,100%{transform:none}
      22%{transform:translateY(-9px) rotate(-5deg)}
      50%{transform:translateY(0) rotate(0)}
      74%{transform:translateY(5px) rotate(4deg)}}

    .goof-hero{display:flex;flex-wrap:wrap;align-items:center;gap:var(--s7);margin-top:var(--s5)}
    .goof-hero>div{flex:1 1 340px;min-width:min(100%,280px)}

    /* googly lion — pupil offsets are written inline by GooglyLion. Eye centres
       (41.7% / 58.3% x, 41.2% y) are measured off lion-mark.svg's own eye paths
       after its translate/scale group transform, not eyeballed. */
    .googly{position:relative;flex:0 0 auto;width:min(230px,54vw);margin:0 auto;
      filter:drop-shadow(0 14px 38px rgba(212,175,55,.22))}
    .googly img{width:100%;height:auto;display:block}
    .eye{position:absolute;width:17%;aspect-ratio:1;border-radius:50%;
      background:#f6f2e8;border:2px solid #0a0a0b;box-shadow:inset 0 3px 6px rgba(0,0,0,.4)}
    .eye--l{left:33.2%;top:32.7%}
    .eye--r{left:49.8%;top:32.7%}
    .pupil{position:absolute;left:50%;top:50%;width:46%;aspect-ratio:1;border-radius:50%;
      background:#0a0a0b;transform:translate(-50%,-50%);transition:transform .09s linear}
    .party .googly{animation:partySpin 1.5s var(--ease) infinite}
    @keyframes partySpin{0%,100%{transform:rotate(0) scale(1)}
      25%{transform:rotate(8deg) scale(1.05)}
      50%{transform:rotate(0) scale(1)}
      75%{transform:rotate(-8deg) scale(1.05)}}

    .lore{list-style:none;margin-top:var(--s6);border-left:2px solid var(--line);padding-left:var(--s6)}
    .lore li{position:relative;padding-bottom:var(--s6)}
    .lore li:last-child{padding-bottom:0}
    .lore li::before{content:"";position:absolute;left:calc(var(--s6) * -1 - 9px);top:8px;
      width:12px;height:12px;border-radius:50%;background:var(--bg);
      border:2px solid var(--gold);box-shadow:0 0 12px var(--glow)}
    .lore h3{font-size:var(--t-h3)}

    .duck{display:flex;flex-wrap:wrap;align-items:center;gap:var(--s5)}
    .duck-quote{flex:1 1 320px;font-size:clamp(17px,1.9vw,22px);line-height:1.55;color:var(--ink);
      font-style:italic;min-height:3.2em}
    .duck-mark{font-size:44px;line-height:1;color:var(--gold-2);font-family:var(--display)}

    .deck{position:relative;margin-top:var(--s5)}
    /* Deliberately NOT .reveal: the card remounts on every take, and useReveal
       only re-runs on page change, so a fresh .reveal node would sit at
       opacity:0 forever. A keyed entry animation is the right tool here. */
    .hot-card{min-height:220px;display:flex;flex-direction:column;justify-content:space-between;
      animation:pageIn .35s var(--ease) both}
    .heat{display:flex;gap:3px;margin-top:var(--s3)}
    .heat i{width:16px;height:5px;border-radius:1px;background:var(--line-soft);font-style:normal}
    .heat i.on{background:linear-gradient(90deg,var(--gold-dim),var(--gold-2))}
    .deck-nav{display:flex;flex-wrap:wrap;align-items:center;gap:var(--s3);margin-top:var(--s4)}
    .tally{font-family:var(--mono);font-size:var(--t-micro);color:var(--faint);margin-left:auto}

    .toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:95;
      max-width:min(460px,92vw);padding:var(--s4) var(--s5);text-align:center;
      background:var(--panel);border:1px solid var(--gold);border-radius:var(--radius-lg);
      box-shadow:0 18px 50px -10px var(--glow);font-size:var(--t-small);color:var(--ink);
      animation:toastIn .45s var(--ease) both}
    @keyframes toastIn{from{opacity:0;transform:translate(-50%,18px)}to{opacity:1;transform:translate(-50%,0)}}

    @media(prefers-reduced-motion:reduce){
      .page-swap,.wobble b,.gold-fill.shimmer,.party .googly,.toast,.hot-card{animation:none!important}
      .pupil{transition:none}
    }
  `}</style>
);

// ---------- Scroll reveal (animates .reveal elements into view) ----------
// site.css owns the .reveal / .reveal.is-in transition; this only flips the class.
function useReveal(dep) {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll('.reveal:not(.is-in)'));
    if (!('IntersectionObserver' in window)) {
      nodes.forEach((n) => n.classList.add('is-in')); // safe fallback
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    nodes.forEach((n) => io.observe(n));
    // safety: ensure anything still hidden after a beat becomes visible —
    // re-query at fire time so nodes mounted after the effect ran are covered too
    const t = setTimeout(() => {
      document.querySelectorAll('.reveal:not(.is-in)').forEach((n) => n.classList.add('is-in'));
    }, 1200);
    return () => { io.disconnect(); clearTimeout(t); };
  }, [dep]);
}

const reducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Staggered-reveal delay, so the cadence is identical everywhere instead of
// each page picking its own number out of the air.
const stagger = (i, step = 80) => ({ transitionDelay: `${i * step}ms` });

// ---------- Magnetic buttons + subtle card tilt ----------
// ONE delegated pointermove for the whole document, rAF-throttled, rather than
// listeners per node — the Projects page alone has 14 cards. The element gets an
// inline transform while the pointer is inside it (inline beats the stylesheet's
// :hover transform, so the hover lift is folded into the same matrix instead of
// fighting it) and hands control back to CSS on leave.
// Skipped entirely for reduced-motion and for coarse pointers: a tilt that keys
// off cursor position is meaningless on a touchscreen and just costs battery.
function usePointerMotion(dep) {
  useEffect(() => {
    if (typeof window === 'undefined' || reducedMotion()) return;
    if (!window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let active = null, raf = 0, last = null;

    const release = () => {
      if (!active) return;
      active.style.transform = '';
      active.classList.remove('pm-live');
      active = null;
    };

    const paint = () => {
      raf = 0;
      if (!active || !last) return;
      const r = active.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const dx = (last.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (last.clientY - (r.top + r.height / 2)) / (r.height / 2);
      active.style.transform = active.classList.contains('btn')
        // magnetic: the button leans toward the cursor, keeping site.css's -3px lift
        ? `translate3d(${(dx * 7).toFixed(2)}px, ${(dy * 4 - 3).toFixed(2)}px, 0)`
        // tilt: capped at ~3deg. Anything more and text starts to look bent.
        : `perspective(900px) rotateX(${(-dy * 3).toFixed(2)}deg) rotateY(${(dx * 3).toFixed(2)}deg) translateY(-4px)`;
    };

    const onMove = (e) => {
      const t = e.target;
      const el = t && t.closest ? t.closest('.btn, .card, .rail a, .hot-card') : null;
      if (el !== active) { release(); active = el; if (el) el.classList.add('pm-live'); }
      if (!active) return;
      last = e;
      if (!raf) raf = requestAnimationFrame(paint);
    };

    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', release);
    window.addEventListener('blur', release);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', release);
      window.removeEventListener('blur', release);
      if (raf) cancelAnimationFrame(raf);
      release();
    };
  }, [dep]);
}

// deterministic PRNG so the generative artwork renders the same every time
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// drives the CountUp animation below — tracks "has this element been seen"
function useInView() {
  const ref = React.useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    if (!('IntersectionObserver' in window)) { setSeen(true); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } });
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);
  return [ref, seen];
}

// animates the stat numbers when they scroll into view; keeps prefixes/suffixes intact
function CountUp({ value }) {
  const [ref, seen] = useInView();
  const [display, setDisplay] = useState(value);
  const m = String(value).match(/^([^\d-]*)([\d,.]+)(.*)$/);
  useEffect(() => {
    if (!m) { setDisplay(value); return; }
    const prefix = m[1], suffix = m[3];
    const target = parseFloat(m[2].replace(/,/g, ''));
    const hasComma = m[2].includes(',');
    if (!seen || reducedMotion() || isNaN(target)) {
      setDisplay(value);
      return;
    }
    let raf; const start = performance.now(); const dur = 1400;
    const ease = (t) => 1 - Math.pow(1 - t, 4); // easeOutQuart
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const cur = Math.round(target * ease(p));
      const formatted = hasComma ? cur.toLocaleString('en-US') : String(cur);
      setDisplay(prefix + formatted + suffix);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, value]); // eslint-disable-line
  return <span ref={ref}>{display}</span>;
}

// Wraps the highlighted phrase of the headline in the shared .gold-fill treatment,
// exactly like the pre-hydration snapshot in index.html — so nothing shifts on mount.
function Headline({ text, highlight }) {
  if (!highlight || !text.includes(highlight)) return text;
  const i = text.indexOf(highlight);
  return (
    <>
      {text.slice(0, i)}
      {/* `shimmer` only animates background-position on the gradient that is
          already there — no new colours, no layout, so the boot snapshot's
          static .gold-fill and this one occupy identical pixels on hydration. */}
      <span className="gold-fill shimmer">{highlight}</span>
      {text.slice(i + highlight.length)}
    </>
  );
}

// continuous skills ticker — the "markets" vibe, literally
function Marquee({ groups }) {
  const items = (groups || []).flatMap((g) => g.items);
  if (!items.length) return null;
  const row = items.join('  ·  ');
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        <span>{row}&nbsp;&nbsp;·&nbsp;&nbsp;</span>
        <span>{row}&nbsp;&nbsp;·&nbsp;&nbsp;</span>
      </div>
    </div>
  );
}

function GenArt({ seed = 1, variant = 'flow' }) {
  const r = mulberry32((seed + 1) * 2654435761 + variant.length * 40503);
  const W = 400, H = 220;
  const gid = `g${seed}-${variant}`;
  let shapes = null;

  if (variant === 'finance') {
    // layered area "chart"
    const layer = (base, op) => {
      const pts = Array.from({ length: 9 }, (_, i) => [i * (W / 8), H - base - r() * 70]);
      const d = `M0,${H} ` + pts.map((p) => `L${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') + ` L${W},${H} Z`;
      return <path d={d} fill={`url(#${gid})`} opacity={op} />;
    };
    shapes = <>{layer(20, 0.18)}{layer(55, 0.30)}{layer(90, 0.5)}</>;
  } else if (variant === 'web') {
    // overlapping rounded windows
    shapes = Array.from({ length: 4 }, (_, i) => (
      <rect key={i} x={30 + i * 26} y={26 + i * 18} width={150 + r() * 90} height={70 + r() * 50}
        rx="14" fill="none" stroke={`url(#${gid})`} strokeWidth="1.4" opacity={0.25 + i * 0.18} />
    ));
  } else if (variant === 'code') {
    // node graph
    const nodes = Array.from({ length: 9 }, () => [40 + r() * (W - 80), 30 + r() * (H - 60)]);
    shapes = <>
      {nodes.flatMap((a, i) => nodes.slice(i + 1).map((b, j) =>
        (Math.hypot(a[0] - b[0], a[1] - b[1]) < 150)
          ? <line key={`e${i}-${j}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="var(--gold-dim)" strokeWidth="0.7" opacity="0.5" /> : null))}
      {nodes.map((n, i) => <circle key={`n${i}`} cx={n[0]} cy={n[1]} r={2.5 + r() * 4} fill={`url(#${gid})`} />)}
    </>;
  } else { // 'flow' — concentric arcs, default
    const cx = W * (0.3 + r() * 0.4), cy = H * (0.4 + r() * 0.3);
    shapes = Array.from({ length: 7 }, (_, i) => (
      <circle key={i} cx={cx} cy={cy} r={18 + i * 22} fill="none" stroke={`url(#${gid})`} strokeWidth="1.2" opacity={0.5 - i * 0.05} />
    ));
  }

  return (
    <svg className="genart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--gold-2)" />
          <stop offset="1" stopColor="var(--gold-dim)" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="var(--panel2)" />
      {shapes}
    </svg>
  );
}

// ── ⌘K Command palette ───────────────────────────────────────────────────────
function useCommandPalette(setPage, pages) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen((o) => !o); }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) { setQuery(''); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [open]);

  const results = pages.filter((p) => p.toLowerCase().includes(query.toLowerCase()));

  const select = useCallback((p) => { setPage(p); setOpen(false); window.scrollTo(0, 0); }, [setPage]);

  const Palette = open ? (
    <div style={{ position: 'fixed', inset: 0, zIndex: 80, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '18vh',
      background: 'rgba(11,11,13,.82)', backdropFilter: 'blur(10px)' }}
      onClick={() => setOpen(false)}>
      <div className="panel" style={{ width: '100%', maxWidth: 520, padding: 0, overflow: 'hidden', boxShadow: 'var(--shadow)' }}
        onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)', padding: 'var(--s4)', borderBottom: '1px solid var(--line-soft)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold-2)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Go to section…" aria-label="Go to section"
            style={{ background: 'transparent', border: 'none', padding: 0 }} />
          <kbd className="mono faint" style={{ fontSize: 'var(--t-micro)' }}>esc</kbd>
        </div>
        <div style={{ padding: 'var(--s2) 0', maxHeight: 280, overflowY: 'auto' }}>
          {results.length === 0
            ? <div className="muted" style={{ padding: 'var(--s3) var(--s4)', fontSize: 'var(--t-small)' }}>No sections match "{query}"</div>
            : results.map((p) => (
                <button key={p} className="page-tab" onClick={() => select(p)}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: 'var(--s3) var(--s4)', borderRadius: 0 }}>
                  {TAB_LABEL[p] || p}
                </button>
              ))}
        </div>
        <div className="faint" style={{ padding: 'var(--s3) var(--s4)', borderTop: '1px solid var(--line-soft)', display: 'flex', gap: 'var(--s4)', fontSize: 'var(--t-micro)' }}>
          <span>↵ select</span><span>esc close</span><span style={{ marginLeft: 'auto' }}>⌘K anywhere</span>
        </div>
      </div>
    </div>
  ) : null;

  return { Palette };
}

// ---------- App ----------
// `pro` (the calmer, recruiter-facing register of the design system) is set on
// <body class="pro"> in public/index.html rather than from a useEffect here: the
// class then applies to the very first paint, so the boot snapshot and the hydrated
// app share one typeface and there is no flash of the streetwear display font.
export default function App() {
  const [visible, setVisible] = useState('Home');
  const [fading, setFading] = useState(false);
  const [admin, setAdmin] = useState(false); // Ctrl+Shift+E to open, not shown to visitors
  const [data, setData] = useState(siteData);
  useReveal(visible);
  usePointerMotion(visible);

  // goTo must be declared before useCommandPalette call; function hoisting handles it
  function goTo(p) {
    if (p === visible) return;
    setFading(true);
    setTimeout(() => {
      setVisible(p);
      setFading(false);
      // Smooth only when motion is welcome — an instant jump is the correct
      // behaviour under prefers-reduced-motion, not a slower animation.
      try { window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' }); }
      catch (e) { window.scrollTo(0, 0); }
    }, 220);
    try { window.history.replaceState(null, '', `#${p.toLowerCase().replace(/\s+/g, '-')}`); } catch (e) {}
  }

  // Deep links: #projects, #research, #working-on… land on the right page,
  // and back/forward navigation follows the hash.
  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.replace('#', '').replace(/-/g, ' ').toLowerCase();
      const match = PAGES.find((p) => p.toLowerCase() === h);
      if (match) setVisible(match);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, []);

  const { Palette } = useCommandPalette(goTo, PAGES);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('yg_portfolio');
      if (saved) setData(JSON.parse(saved));
    } catch (e) { /* preview mode */ }
    // Secret admin shortcut: Ctrl+Shift+E (not visible to visitors)
    const onKey = (e) => { if (e.ctrlKey && e.shiftKey && e.key === 'E') setAdmin((a) => !a); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const save = (next) => {
    setData(next);
    try { localStorage.setItem('yg_portfolio', JSON.stringify(next)); } catch (e) {}
  };

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <SiteNav page={visible} go={goTo} brand={data.brand} />
      <PageTabs page={visible} go={goTo} />
      {Palette}
      <main id="main" style={{ opacity: fading ? 0 : 1, transition: 'opacity .22s ease' }}>
        {/* keyed on the page name so React tears the subtree down and remounts it —
            without that the CSS entry animation only ever plays once, on load */}
        <div className="page-swap" key={visible}>
          {visible === 'Home' && <Home d={data} go={goTo} />}
          {visible === 'About' && <About d={data} />}
          {visible === 'Professional' && <Professional d={data} go={goTo} />}
          {visible === 'Working On' && <Now d={data} />}
          {visible === 'Research' && <Research d={data} />}
          {visible === 'Projects' && <Projects d={data} />}
          {visible === 'Resume' && <Resume d={data} />}
          {visible === 'Goofy Corner' && <Goofy go={goTo} />}
          {visible === 'Blog' && <Blog d={data} />}
          {visible === 'Legal' && <Legal />}
        </div>
      </main>
      <SiteFooter contact={data.contact} brand={data.brand} />
      <StyleTag />

      {admin && <Admin data={data} save={save} close={() => setAdmin(false)} />}
    </>
  );
}

// Canonical site nav — same markup and links as every static page in /public.
// "Work" points at "/" (a real href, so it works without JS and looks right to
// crawlers) but is intercepted so the SPA switches sections instead of reloading.
function SiteNav({ page, go, brand }) {
  const home = (e) => { e.preventDefault(); go('Home'); };
  return (
    <nav className="site-nav">
      <a className="site-nav__brand" href="/" onClick={home}>
        <img className="site-nav__lion" src="/img/brand/lion-mark.svg" alt="" width="34" height="34" decoding="async" />
        <span>{brand.name.toUpperCase()}</span>
      </a>
      <div className="site-nav__links">
        <a href="/" onClick={home} aria-current={page === 'Home' ? 'page' : undefined}>Work</a>
        {SITE_LINKS.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}
      </div>
    </nav>
  );
}

// Client-side section switcher for this page only (state + hash routing, no router lib)
function PageTabs({ page, go }) {
  return (
    <div className="page-tabs" role="navigation" aria-label="Sections">
      {PAGES.map((p) => (
        <button key={p} type="button" className="page-tab"
          aria-current={page === p ? 'page' : undefined} onClick={() => go(p)}>
          {TAB_LABEL[p] || p}
        </button>
      ))}
    </div>
  );
}

function ComplianceNote() {
  return (
    <section aria-labelledby="compliance-h"
      style={{ maxWidth: 1080, margin: '0 auto', padding: '28px 20px 8px', borderTop: '1px solid rgba(212,175,55,.18)' }}>
      <h2 id="compliance-h" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 15, letterSpacing: '.06em', textTransform: 'uppercase', color: '#d4af37', margin: '0 0 10px' }}>
        Disclosures
      </h2>
      <p style={{ fontSize: 13.5, lineHeight: 1.65, color: '#9a958c', margin: '0 0 8px' }}>
        Figures shown on this site are research and engineering results, not live trading performance. The 78% directional
        accuracy is a six-month backtest of a model. An early +0.23R result over 101 trades did not survive my own adversarial
        re-test; the defensible figure is +0.117R over 4,933 trades (95% CI +0.057-+0.174), and most of that is market drift
        rather than the signal itself. Backtested and simulated results do not represent live
        trading, and past performance does not guarantee future results. No live profit-and-loss figures are claimed anywhere
        on this site. Nothing here is financial, investment, tax or legal advice.
      </p>
      <p style={{ fontSize: 13.5, lineHeight: 1.65, color: '#9a958c', margin: 0 }}>
        <a style={{ color: '#d4af37' }} href="/terms.html">Terms of Use</a>{' · '}
        <a style={{ color: '#d4af37' }} href="/privacy.html">Privacy Policy</a>{' · '}
        <a style={{ color: '#d4af37' }} href="/refunds.html">Refund Policy</a>
      </p>
    </section>
  );
}

function SiteFooter({ contact, brand }) {
  return (
    <>
    <ComplianceNote />
    <footer className="site-footer">
      <div>
        <img className="lion-mark" src="/img/brand/lion-mark.svg" alt="" width="40" height="40" loading="lazy" decoding="async"
             style={{ opacity: .85, marginBottom: 12 }} />
        <div>{brand.name} — San Jose, CA</div>
        <div><a href={`mailto:${contact.email}`}>{contact.email}</a> · {contact.phone}</div>
      </div>
      <div className="site-footer__links">
        <a href="/">Work</a>
        <a href="/about.html">About</a>
        <a href="/guides.html">Guides</a>
        <a href="/resume.html">Resume</a>
        <a href="/hire.html">Hire</a>
        <a href="/store.html">Store</a>
        <a href="/codeswitch.html">CODESWITCH</a>
        <a href="/circle.html">Circle</a>
        <a href="/waitlist.html">Waitlists</a>
        <a href="/kxngsef.html">KXNG SEF</a>
        <a href="/media-kit.html">Media Kit</a>
        <a href="/brand.html">Brand</a>
        <a href="https://github.com/Yusuf-Gadelrab" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="https://www.linkedin.com/in/yusuf-gadelrab-76246b221" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a href="/privacy.html">Privacy</a>
        <a href="/terms.html">Terms</a>
      </div>
    </footer>
    </>
  );
}

// ---------- Pages ----------
// homepage — mirrors the pre-hydration snapshot in index.html one-for-one so the
// swap to React is invisible. `.yg-page`/`.hero-row` are kept as hooks: the sunset
// backdrop and the injected-content scripts in index.html key off them, and
// #yg-hero-cta below tells that script the CTA already exists (no duplicate).
function Home({ d, go }) {
  return (
    <section className="section yg-page">
      <div className="hero-row">
        <div className="hero-text">
          <p className="eyebrow">{d.home.eyebrow}</p>
          <h1 className="hero-type" style={{ margin: 'var(--s4) 0 var(--s5)', maxWidth: '16ch' }}>
            <Headline text={d.home.headline} highlight={d.home.highlight} />
          </h1>
          <p className="lead">{d.home.sub}</p>
          {d.home.availability && (
            <p className="badge" style={{ marginTop: 'var(--s5)' }}>
              <span className="dot" aria-hidden="true" />{d.home.availability}
            </p>
          )}
          <div className="row" id="yg-hero-cta" style={{ marginTop: 'var(--s6)' }}>
            <a className="btn btn-gold" href="/store.html">See what I'm shipping →</a>
            <a className="btn btn-ghost" href="/resume.html">Resume services</a>
          </div>
          <p className="muted" style={{ fontSize: 'var(--t-micro)', marginTop: 'var(--s3)' }}>
            Launch pricing ends Aug 15 · 12 template packs · 273 template assets
          </p>
          <p className="hero-links">
            <a href="https://doi.org/10.1145/3770761.3777339">Co-author, SIGCSE TS 2026 — DOI: 10.1145/3770761.3777339</a> ·{' '}
            <a href="hwyhaul.html">ex-HwyHaul — case study</a> ·{' '}
            <a href="https://github.com/Yusuf-Gadelrab">GitHub</a> ·{' '}
            <a href="https://www.linkedin.com/in/yusuf-gadelrab-76246b221">LinkedIn</a>
          </p>
        </div>
        {d.home.heroImage && (
          <img className="hero-photo" src={d.home.heroImage} alt={`${d.brand.name}, professional headshot in a suit with a gold frame border`} decoding="async"
            width="700" height="749" fetchPriority="high" />
        )}
      </div>

      <div className="stat-grid">
        {d.home.stats.map((s, i) => (
          <div className="card stat reveal" key={i} style={{ transitionDelay: `${i * 90}ms` }}>
            <span className="stat__value"><CountUp value={s.value} /></span>
            <span className="stat__label">{s.label}</span>
          </div>
        ))}
      </div>
      <Marquee groups={d.about?.skills} />

      <HomeWork d={d} go={go} />
      <HomeResearch d={d} go={go} />
      <HomeNow d={d} go={go} />
      <HomeClose d={d} go={go} />
    </section>
  );
}

// The homepage used to stop at the stat grid, so everything below the fold was a
// dead scroll. These blocks reuse the same data the inner pages render, then hand
// off to the full page rather than duplicating it.
function HomeBand({ eyebrow, title, intro, children }) {
  return (
    <div className="home-band" style={{ marginTop: 'var(--s7)' }}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 style={{ marginTop: 'var(--s3)' }}>{title}</h2>
      {intro && <p className="lead" style={{ marginTop: 'var(--s3)' }}>{intro}</p>}
      {children}
    </div>
  );
}

function HomeWork({ d, go }) {
  const picks = (d.projects || []).slice(0, 3);
  if (!picks.length) return null;
  return (
    <HomeBand
      eyebrow="Selected Work"
      title="Things I've actually shipped"
      intro="Products with users, a paid internship build, and research that went through peer review — not coursework."
    >
      <div className="grid grid--2" style={{ marginTop: 'var(--s5)' }}>
        {picks.map((p, i) => (
          <article className="card reveal" key={i} style={{ transitionDelay: `${i * 90}ms` }}>
            <p className="eyebrow">{p.stack}</p>
            <h3 style={{ marginTop: 'var(--s2)' }}>{p.title}</h3>
            <p className="muted" style={{ marginTop: 'var(--s3)' }}>{p.desc}</p>
            {p.link && (
              <p style={{ marginTop: 'var(--s4)' }}>
                <a href={p.link}>{p.linkLabel || 'Read more →'}</a>
              </p>
            )}
          </article>
        ))}
      </div>
      <div className="row" style={{ marginTop: 'var(--s5)' }}>
        <button className="btn btn-ghost" onClick={() => go('Projects')}>See every project →</button>
      </div>
    </HomeBand>
  );
}

function HomeResearch({ d, go }) {
  const papers = d.research || [];
  if (!papers.length) return null;
  return (
    <HomeBand
      eyebrow="Peer-Reviewed Research"
      title="Two papers at ACM SIGCSE 2026"
      intro="Written as an undergraduate in Dr. Ethel Tshukudu's CS-education lab at SJSU, under IRB protocol."
    >
      <div className="grid grid--2" style={{ marginTop: 'var(--s5)' }}>
        {papers.map((p, i) => (
          <article className="card reveal" key={i} style={{ transitionDelay: `${i * 90}ms` }}>
            <p className="eyebrow">{p.venue}</p>
            <h3 style={{ marginTop: 'var(--s2)' }}>{p.title}</h3>
            <p className="muted" style={{ marginTop: 'var(--s3)' }}>{p.abstract}</p>
            {p.link && (
              <p style={{ marginTop: 'var(--s4)' }}>
                <a href={p.link} target="_blank" rel="noreferrer">Read the paper →</a>
              </p>
            )}
          </article>
        ))}
      </div>
      <div className="row" style={{ marginTop: 'var(--s5)' }}>
        <button className="btn btn-ghost" onClick={() => go('Research')}>Full research page →</button>
      </div>
    </HomeBand>
  );
}

function HomeNow({ d, go }) {
  const items = (d.now?.items || []).slice(0, 4);
  if (!items.length) return null;
  return (
    <HomeBand eyebrow="Now & Next" title="What I'm building this month" intro={d.now?.intro}>
      <ul className="bullets" style={{ marginTop: 'var(--s5)' }}>
        {items.map((it, i) => <li key={i}>{it}</li>)}
      </ul>
      <div className="row" style={{ marginTop: 'var(--s5)' }}>
        <button className="btn btn-ghost" onClick={() => go('Working On')}>The full picture →</button>
      </div>
    </HomeBand>
  );
}

function HomeClose({ d, go }) {
  const email = d.contact?.email;
  return (
    <HomeBand
      eyebrow="How I work"
      title="Measured, or it didn't happen"
      intro="Every number on this page has a method behind it — a backtest window, a participant count, a before-and-after. If I can't tell you how it was measured, I don't put it up."
    >
      <div className="row" style={{ marginTop: 'var(--s5)' }}>
        {email && <a className="btn btn-gold" href={`mailto:${email}`}>Get in touch →</a>}
        <button className="btn btn-ghost" onClick={() => go('Professional')}>The professional file →</button>
        <button className="btn btn-ghost" onClick={() => go('Resume')}>See my resume →</button>
      </div>
      <p className="faint" style={{ marginTop: 'var(--s5)', fontSize: 'var(--t-small)', maxWidth: 'var(--maxw-prose)' }}>
        Still scrolling? There is a{' '}
        <button type="button" className="linkish" onClick={() => go('Goofy Corner')}>Goofy Corner</button>{' '}
        on this site. Same gold, considerably less composure.
      </p>
    </HomeBand>
  );
}

// "working on" page — honest snapshot of what I'm actually building right now
function Now({ d }) {
  const li = d.contact.links.find((l) => l.label === 'LinkedIn');
  const gh = d.contact.links.find((l) => l.label === 'GitHub');
  return (
    <section className="section">
      <SectionTitle eyebrow="Now & Next" title="What I'm Working On" />
      <p className="lead">{d.now.intro}</p>
      <ul className="bullets" style={{ marginTop: 'var(--s5)' }}>
        {d.now.items.map((it, i) => <li key={i}>{it}</li>)}
      </ul>
      <div className="row" style={{ marginTop: 'var(--s6)' }}>
        {li && <a className="btn btn-gold" href={li.url} target="_blank" rel="noreferrer">Connect on LinkedIn →</a>}
        {gh && <a className="btn btn-ghost" href={gh.url} target="_blank" rel="noreferrer">See my GitHub →</a>}
      </div>
    </section>
  );
}

// resume page — both PDFs are base64-embedded so they work without a /public folder
function Resume({ d }) {
  const [urls, setUrls] = useState([]);
  const files = d.resume.files || [];

  useEffect(() => {
    const created = files.map((f) => {
      if (!f.b64) return f.url || null;
      try {
        const bin = atob(f.b64);
        const arr = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
        return URL.createObjectURL(new Blob([arr], { type: 'application/pdf' }));
      } catch { return null; }
    });
    setUrls(created);
    return () => created.forEach((u) => { if (u?.startsWith('blob:')) URL.revokeObjectURL(u); });
  }, [files.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const primary = urls[0]; // CS / AI résumé shown in preview
  return (
    <section className="section">
      <SectionTitle eyebrow="The One-Pager" title="Résumé" />
      <p className="lead">{d.resume.summary}</p>
      <div className="row" style={{ margin: 'var(--s6) 0' }}>
        {urls.length > 0
          ? files.map((f, i) => urls[i] ? (
              <a key={i} className={`btn ${i === 0 ? 'btn-gold' : 'btn-ghost'}`}
                href={urls[i]} download={`${f.label}.pdf`}>⬇ {f.label}</a>
            ) : null)
          : <span className="muted">Loading…</span>}
      </div>
      {primary && (
        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="row" style={{ padding: 'var(--s3) var(--s4)', borderBottom: '1px solid var(--line-soft)' }}>
            <span className="muted" style={{ fontSize: 'var(--t-small)' }}>Software / AI résumé</span>
            <a href={primary} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm"
              style={{ marginLeft: 'auto' }}>Open full screen ↗</a>
          </div>
          <embed src={primary} type="application/pdf" style={{ width: '100%', height: 840, display: 'block' }} />
        </div>
      )}
    </section>
  );
}

// about page — bio, experience, education, press, skills, gallery
function About({ d }) {
  return (
    <section className="section">
      <SectionTitle eyebrow="Background" title="About" />
      {/* #yg-about-photo is the hook index.html's photo script styles (and skips
          injecting into, because it is already here) */}
      <figure id="yg-about-photo">
        <img src={`${process.env.PUBLIC_URL}/img/yusuf-headshot.webp`}
          alt="Yusuf Gadelrab, professional headshot in a suit with a gold frame border"
          width="700" height="749" loading="lazy" decoding="async" />
        <figcaption>Yusuf Gadelrab · San Jose, CA</figcaption>
      </figure>
      <div className="row" style={{ marginBottom: 'var(--s5)' }}>
        <a className="badge" href="https://doi.org/10.1145/3770761.3777339" target="_blank" rel="noreferrer">
          Co-author, SIGCSE TS 2026 — DOI: 10.1145/3770761.3777339
        </a>
        <span className="badge">IBM SkillsBuild</span>
        <a className="badge" href="hwyhaul.html">ex-HwyHaul — case study →</a>
      </div>
      {d.about.bio.map((p, i) => <p className="lead" key={i} style={{ marginTop: 'var(--s4)' }}>{p}</p>)}

      <hr className="divider" />
      <h2>Experience</h2>
      <div className="stack-lg" style={{ marginTop: 'var(--s5)' }}>
        {d.experience.map((x, i) => (
          <article className="card reveal" key={i} style={{ transitionDelay: `${i * 80}ms` }}>
            <div className="row" style={{ gap: 'var(--s3)' }}>
              <CardIcon kind={x.tag} />
              <span className="badge">{x.tag}</span>
            </div>
            <h3 style={{ marginTop: 'var(--s4)' }}>{x.title}</h3>
            <div className="gold">{x.org}</div>
            <div className="muted" style={{ fontSize: 'var(--t-small)' }}>{x.meta}</div>
            <ul className="bullets">{x.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>
          </article>
        ))}
      </div>

      <hr className="divider" />
      <h2>Education</h2>
      <div className="grid grid--2" style={{ marginTop: 'var(--s5)' }}>
        {d.about.education.map((e, i) => (
          <article className="card reveal" key={i} style={{ transitionDelay: `${i * 80}ms` }}>
            <h3>{e.school}</h3>
            <div className="muted" style={{ margin: 'var(--s2) 0' }}>{e.detail} · {e.meta}</div>
            <div className="muted" style={{ fontSize: 'var(--t-small)' }}>{e.note}</div>
          </article>
        ))}
      </div>

      {d.about.recognition && d.about.recognition.length > 0 && (
        <>
          <hr className="divider" />
          <h2>Press &amp; Recognition</h2>
          <p className="muted" style={{ margin: 'var(--s3) 0 var(--s5)' }}>
            Third-party coverage — before the research and the IBM work, this is where it started.
          </p>
          <div className="stack-lg">
            {d.about.recognition.map((r, i) => (
              <article className="card reveal" key={i} style={{ transitionDelay: `${i * 80}ms` }}>
                <span className="badge">{r.outlet} · {r.year}</span>
                <h3 style={{ marginTop: 'var(--s3)' }}>{r.title}</h3>
                <p className="muted" style={{ marginTop: 'var(--s3)', fontStyle: 'italic', fontSize: 'var(--t-small)' }}>{r.quote}</p>
                {r.link && (
                  <a className="btn btn-ghost btn-sm" style={{ marginTop: 'var(--s4)' }}
                    href={r.link} target="_blank" rel="noreferrer">Read article →</a>
                )}
              </article>
            ))}
          </div>
        </>
      )}

      <hr className="divider" />
      <h2>Skills</h2>
      <div className="grid grid--2" style={{ marginTop: 'var(--s5)' }}>
        {d.about.skills.map((s, i) => (
          <article className="card reveal" key={i} style={{ transitionDelay: `${i * 80}ms` }}>
            <span className="badge">{s.group}</span>
            <div className="chips">{s.items.map((it, j) => <span className="chip" key={j}>{it}</span>)}</div>
          </article>
        ))}
      </div>

      <hr className="divider" />
      <h2>Off the clock</h2>
      <p className="muted" style={{ margin: 'var(--s3) 0 var(--s5)', maxWidth: 'var(--maxw-prose)' }}>
        A little recognition, and the California I get out into when I close the laptop.
      </p>
      <GalleryGrid items={d.gallery} />
    </section>
  );
}

// research page — ACM papers with DOI links
function Research({ d }) {
  return (
    <section className="section">
      <SectionTitle eyebrow="Publications & Presentations" title="Research" />
      <div className="stack-lg" style={{ marginTop: 'var(--s5)' }}>
        {d.research.map((r, i) => (
          <article className="card reveal" key={i} style={{ transitionDelay: `${i * 80}ms` }}>
            <div className="row" style={{ gap: 'var(--s3)' }}>
              <CardIcon kind="Publication" />
              <span className="badge">{r.role}</span>
            </div>
            <h3 style={{ marginTop: 'var(--s4)' }}>{r.title}</h3>
            <div className="gold" style={{ fontSize: 'var(--t-small)' }}>{r.venue}</div>
            <p className="muted" style={{ marginTop: 'var(--s3)' }}>{r.abstract}</p>
            <p className="faint" style={{ fontSize: 'var(--t-small)', marginTop: 'var(--s3)', fontStyle: 'italic' }}>{r.citation}</p>
            {r.link && <a className="btn btn-ghost btn-sm" style={{ marginTop: 'var(--s4)' }} href={r.link} target="_blank" rel="noreferrer">Read on ACM →</a>}
          </article>
        ))}
      </div>
    </section>
  );
}

// projects page — first project in the array gets the big featured card, rest go in a 2-col grid.
// ProjectCard must stay at module scope: defining it inside Projects gave it a new identity on
// every App re-render, remounting the cards and wiping the reveal state.
const ProjectCard = ({ p, i }) => (
  <article className="card reveal" style={{ transitionDelay: `${i * 80}ms` }}>
    <div className="card-art" style={p.image ? { backgroundImage: `url(${p.image})` } : {}}>
      {!p.image && <GenArt seed={i + 3} variant={/[Ww]atson|[Ff]inanc|NLP|equit/.test(p.stack + p.desc) ? 'finance' : /[Rr]eact|[Ww]eb|UI/.test(p.stack) ? 'web' : 'code'} />}
    </div>
    <h3>{p.title}</h3>
    <div className="badge" style={{ marginTop: 'var(--s3)' }}>{p.stack}</div>
    <p className="muted" style={{ marginTop: 'var(--s3)' }}>{p.desc}</p>
    {p.link && <a className="btn btn-ghost btn-sm" style={{ marginTop: 'var(--s4)' }} href={p.link} target="_blank" rel="noreferrer">{p.linkLabel || 'Visit site →'}</a>}
    {!p.link && p.privateRepo && (
      <p className="faint" style={{ marginTop: 'var(--s4)', fontSize: 'var(--t-small)' }}>
        Private repository — walkthrough available on request
      </p>
    )}
  </article>
);

function Projects({ d }) {
  return (
    <section className="section">
      <SectionTitle eyebrow="Selected Work" title="Projects" />
      <div className="grid grid--2" style={{ marginTop: 'var(--s5)' }}>
        {d.projects.map((p, i) => <ProjectCard key={i} p={p} i={i} />)}
      </div>
    </section>
  );
}

// ---------- Professional ----------
// The page a recruiter is actually looking for: profiles, publications, the
// things that exist and have users, and the roles I hold. Content lives in the
// PROFESSIONAL constant at the top of this file, not in siteData — see the note
// there for why.

function PresenceCard({ p, i }) {
  // LinkedIn's glyph is a solid mark; the other two are line icons. One flag
  // beats maintaining two icon components.
  const filled = p.label === 'LinkedIn';
  return (
    <a className="card pres-card reveal" style={stagger(i)} href={p.url} target="_blank" rel="noreferrer">
      <span className="pres-top">
        <span className="card-ic" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24"
            fill={filled ? 'currentColor' : 'none'} stroke={filled ? 'none' : 'currentColor'}
            strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={p.icon} /></svg>
        </span>
        <span className="badge">{p.label}</span>
      </span>
      <span className="pres-handle">{p.handle}</span>
      <span className="muted" style={{ fontSize: 'var(--t-small)' }}>{p.meta}</span>
      <span className="gold" style={{ marginTop: 'var(--s3)', fontSize: 'var(--t-small)' }}>{p.cta}</span>
    </a>
  );
}

function PublicationCard({ p, i }) {
  return (
    <article className="card reveal" style={stagger(i)}>
      <div className="row" style={{ gap: 'var(--s3)' }}>
        <CardIcon kind="Publication" />
        <span className="badge">{p.kind}</span>
        <span className="muted" style={{ fontSize: 'var(--t-small)' }}>{p.role}</span>
      </div>
      <h3 style={{ marginTop: 'var(--s4)' }}>{p.title}</h3>
      <div className="gold" style={{ fontSize: 'var(--t-small)', marginTop: 'var(--s2)' }}>{p.venue}</div>
      <p className="muted" style={{ marginTop: 'var(--s3)' }}>{p.note}</p>
      <div className="row" style={{ marginTop: 'var(--s4)' }}>
        {p.doi
          ? <span className="doi">DOI {p.doi}</span>
          : <span className="doi no-doi">Poster — no DOI claimed</span>}
        {p.url && (
          <a className="btn btn-ghost btn-sm" href={p.url} target="_blank" rel="noreferrer">Read on ACM →</a>
        )}
      </div>
    </article>
  );
}

function Professional({ d, go }) {
  const P = PROFESSIONAL;
  return (
    <section className="section">
      <SectionTitle eyebrow={P.eyebrow} title={P.title} />
      <p className="lead">{P.lead}</p>

      <div className="pres">
        {P.presence.map((p, i) => <PresenceCard key={p.label} p={p} i={i} />)}
      </div>

      <hr className="divider" />
      <h2>The numbers, with their methods</h2>
      <p className="muted" style={{ margin: 'var(--s3) 0 var(--s5)', maxWidth: 'var(--maxw-prose)' }}>
        Five figures. Each one names the thing it was measured on, because a percentage
        without a denominator is just a mood.
      </p>
      {/* maxWidth override: .stat-grid is capped at 960px for the homepage's four
          tiles. Five tiles under that cap leave a lone orphan on the second row. */}
      <div className="stat-grid" style={{ marginTop: 0, maxWidth: 'none' }}>
        {P.metrics.map((m, i) => (
          <div className="card stat reveal" key={m.value + i} style={stagger(i, 90)}>
            <span className="stat__value"><CountUp value={m.value} /></span>
            <span className="stat__label">{m.label}</span>
          </div>
        ))}
      </div>

      <hr className="divider" />
      <h2>Research</h2>
      <p className="muted" style={{ margin: 'var(--s3) 0 var(--s5)', maxWidth: 'var(--maxw-prose)' }}>
        Two accepted contributions at the ACM SIGCSE Technical Symposium 2026, written as an
        undergraduate in the CS-education lab at San José State under IRB protocol.
      </p>
      <div className="stack-lg">
        {P.publications.map((p, i) => <PublicationCard key={p.title} p={p} i={i} />)}
      </div>
      <div className="row" style={{ marginTop: 'var(--s5)' }}>
        <button className="btn btn-ghost" onClick={() => go('Research')}>Full research page →</button>
      </div>

      <hr className="divider" />
      <h2>What I build and run</h2>
      <p className="muted" style={{ margin: 'var(--s3) 0 var(--s5)', maxWidth: 'var(--maxw-prose)' }}>
        Six things with names, surfaces and users — under one studio brand, DHAHAB.
      </p>
      <div className="grid grid--2">
        {P.ventures.map((v, i) => (
          <article className="card venture reveal" key={v.name} style={stagger(i)}>
            <span className="badge">{v.tag}</span>
            <h3>{v.name}</h3>
            <p className="muted" style={{ marginTop: 'var(--s3)' }}>{v.desc}</p>
            <p style={{ marginTop: 'var(--s4)' }}>
              <a className="btn btn-ghost btn-sm" href={v.href}
                {...(v.external ? { target: '_blank', rel: 'noreferrer' } : {})}>
                {v.external ? 'View on GitHub →' : `Visit ${v.name} →`}
              </a>
            </p>
          </article>
        ))}
      </div>

      <hr className="divider" />
      <h2>Leadership &amp; roles</h2>
      <ul className="lead-list">
        {P.leadership.map((l, i) => (
          <li className="lead-row reveal" key={l.role + l.org} style={stagger(i, 60)}>
            <span className="lead-role">{l.role}</span>
            <span className="gold" style={{ fontSize: 'var(--t-small)' }}>{l.org}</span>
            <span className="lead-meta">{l.meta}</span>
            {l.note && <span className="lead-note">{l.note}</span>}
          </li>
        ))}
      </ul>

      <hr className="divider" />
      <h2>Documents &amp; surfaces</h2>
      <div className="rail">
        {P.docs.map((doc, i) => (
          <a key={doc.href} href={doc.href} className="reveal" style={stagger(i, 60)}>
            <strong>{doc.label}</strong>
            <span>{doc.note}</span>
          </a>
        ))}
      </div>
      <div className="row" style={{ marginTop: 'var(--s5)' }}>
        <button className="btn btn-gold" onClick={() => go('Resume')}>Both résumés, in-page →</button>
        {d.contact?.email && (
          <a className="btn btn-ghost" href={`mailto:${d.contact.email}`}>Email me →</a>
        )}
      </div>

      <hr className="divider" />
      <div className="panel">
        <span className="badge">Measurement note</span>
        <p className="muted" style={{ marginTop: 'var(--s3)', maxWidth: 'var(--maxw-prose)' }}>{P.integrity}</p>
      </div>

      <p className="faint" style={{ marginTop: 'var(--s6)', fontSize: 'var(--t-small)' }}>
        That is the composed version.{' '}
        <button type="button" className="linkish" onClick={() => go('Goofy Corner')}>
          The Goofy Corner
        </button>{' '}
        is where the rest of me lives.
      </p>
    </section>
  );
}

// ---------- Goofy Corner ----------
// Rule for anything that goes here: the joke is on me, and it stays wholesome.
// Still the brand palette — this is a wink, not a different website.

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

// Cursor-following pupils on the house lion. Pupil travel is clamped to a small
// radius so the eyes never leave their whites, and the whole thing no-ops for
// reduced-motion (a jittering mascot is exactly the kind of thing that guard is for).
function GooglyLion({ party }) {
  const wrap = useRef(null);
  const [off, setOff] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (reducedMotion()) return;
    let raf = 0, last = null;
    const paint = () => {
      raf = 0;
      const el = wrap.current;
      if (!el || !last) return;
      const r = el.getBoundingClientRect();
      const dx = last.clientX - (r.left + r.width / 2);
      const dy = last.clientY - (r.top + r.height / 2);
      const dist = Math.hypot(dx, dy) || 1;
      const reach = Math.min(1, dist / 260) * (r.width * 0.026); // px of travel
      setOff({ x: (dx / dist) * reach, y: (dy / dist) * reach });
    };
    const onMove = (e) => { last = e; if (!raf) raf = requestAnimationFrame(paint); };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => { window.removeEventListener('pointermove', onMove); if (raf) cancelAnimationFrame(raf); };
  }, []);

  const pupil = { transform: `translate(calc(-50% + ${off.x.toFixed(1)}px), calc(-50% + ${off.y.toFixed(1)}px))` };
  return (
    <div className={`googly${party ? ' party' : ''}`} ref={wrap}>
      <img src="/img/brand/lion-mark.svg" alt="The DHAHAB lion mark, wearing googly eyes" width="256" height="256" />
      <span className="eye eye--l" aria-hidden="true"><span className="pupil" style={pupil} /></span>
      <span className="eye eye--r" aria-hidden="true"><span className="pupil" style={pupil} /></span>
    </div>
  );
}

// Per-letter wobble. Words are grouped and nowrap'd on purpose: inline-block
// letters are individually breakable, so without this the headline happily
// wraps as "Certified G / oofy". The only break opportunities are the real
// space text nodes sitting between the word groups.
function WobbleType({ text }) {
  const words = text.split(' ');
  let n = 0;
  return (
    <span className="wobble" aria-label={text}>
      {words.map((word, w) => (
        <React.Fragment key={w}>
          {w > 0 ? ' ' : null}
          <span className="wobble-w" aria-hidden="true">
            {word.split('').map((ch, i) => (
              <b key={i} style={{ animationDelay: `${(n++ * 90) % 1400}ms` }}>{ch}</b>
            ))}
          </span>
        </React.Fragment>
      ))}
    </span>
  );
}

function DuckDeck({ T }) {
  const [i, setI] = useState(0);
  const q = GOOFY.duck;
  return (
    <div className="card duck reveal">
      <span className="duck-mark" aria-hidden="true">“</span>
      <p className="duck-quote">{T(q[i])}</p>
      <button className="btn btn-ghost btn-sm"
        onClick={() => setI((n) => (n + 1) % q.length)}>
        {T('Another one')} ({i + 1}/{q.length})
      </button>
    </div>
  );
}

function HotTakes({ T }) {
  const [i, setI] = useState(0);
  const [tally, setTally] = useState({ fair: 0, hot: 0 });
  const takes = GOOFY.takes;
  const t = takes[i];
  const next = (key) => {
    setTally((s) => ({ ...s, [key]: s[key] + 1 }));
    setI((n) => (n + 1) % takes.length);
  };
  return (
    <div className="deck">
      <article className="card hot-card reveal" key={i}>
        <div>
          <span className="badge">Take {i + 1} of {takes.length}</span>
          <p style={{ marginTop: 'var(--s4)', fontSize: 'clamp(17px,1.7vw,21px)', lineHeight: 1.5 }}>{T(t.text)}</p>
        </div>
        <div>
          <p className="faint" style={{ fontSize: 'var(--t-micro)', letterSpacing: '.14em', textTransform: 'uppercase' }}>
            {T('Spice level')}
          </p>
          <div className="heat" aria-label={`Spice level ${t.heat} of 9`}>
            {Array.from({ length: 9 }, (_, n) => <i key={n} className={n < t.heat ? 'on' : ''} />)}
          </div>
        </div>
      </article>
      <div className="deck-nav">
        <button className="btn btn-ghost btn-sm" onClick={() => next('fair')}>{T('Fair enough')}</button>
        <button className="btn btn-ghost btn-sm" onClick={() => next('hot')}>{T('Absolutely not')}</button>
        <span className="tally">fair {tally.fair} · nope {tally.hot}</span>
      </div>
    </div>
  );
}

function Goofy({ go }) {
  const [caveman, setCaveman] = useState(false);
  const [party, setParty] = useState(false);
  const T = useCallback((s) => (caveman ? cavemanize(s) : s), [caveman]);

  // Konami code. There is no reward. That is the bit.
  useEffect(() => {
    let hit = 0;
    const onKey = (e) => {
      if (!e.key) return;
      const want = KONAMI[hit];
      if (e.key === want || e.key.toLowerCase() === want) {
        hit += 1;
        if (hit === KONAMI.length) { hit = 0; setParty(true); }
      } else {
        hit = e.key === KONAMI[0] ? 1 : 0;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!party) return;
    const t = setTimeout(() => setParty(false), 7000);
    return () => clearTimeout(t);
  }, [party]);

  return (
    <section className="section">
      <p className="eyebrow">{T('Off the record · still gold, just goofier')}</p>

      <div className="goof-hero">
        <div>
          <h1 className="hero-type" style={{ margin: 'var(--s4) 0 var(--s5)' }}>
            <WobbleType text={caveman ? 'ME GOOFY' : 'Certified Goofy'} />
          </h1>
          <p className="lead">
            {T('The rest of this site is measured, sourced and defensible. This page is where I keep the personality. Everything here is true, which is somehow worse.')}
          </p>
          <div className="row" style={{ marginTop: 'var(--s6)' }}>
            <button className="btn btn-gold" onClick={() => setCaveman((c) => !c)}>
              {caveman ? 'Ugh. Words back to normal' : 'Caveman mode'}
            </button>
            <button className="btn btn-ghost" onClick={() => go('Professional')}>
              {T('Take me back to the serious page')}
            </button>
          </div>
          {caveman && (
            <p className="faint" style={{ marginTop: 'var(--s4)', fontSize: 'var(--t-small)', maxWidth: 'var(--maxw-prose)' }}>
              Caveman mode be one lookup table and two regexes. No AI. It do its best. Sometimes it just delete word and walk away.
            </p>
          )}
        </div>
        <GooglyLion party={party} />
      </div>

      <hr className="divider" />
      <h2>{T('The lore')}</h2>
      <p className="muted" style={{ marginTop: 'var(--s3)', maxWidth: 'var(--maxw-prose)' }}>
        {T('A valedictorian who was also the League MVP at three positions, and who then looked at every available path and chose, freely and with enthusiasm, spreadsheets.')}
      </p>
      <ul className="lore">
        {GOOFY.lore.map((l, i) => (
          <li key={l.chapter} className="reveal" style={stagger(i, 70)}>
            <p className="eyebrow">{l.chapter}</p>
            <h3 style={{ marginTop: 'var(--s2)' }}>{T(l.title)}</h3>
            <p className="muted" style={{ marginTop: 'var(--s3)', maxWidth: 'var(--maxw-prose)' }}>{T(l.body)}</p>
          </li>
        ))}
      </ul>

      <hr className="divider" />
      <h2>{T('Things I have said out loud to a rubber duck')}</h2>
      <p className="muted" style={{ margin: 'var(--s3) 0 var(--s5)', maxWidth: 'var(--maxw-prose)' }}>
        {T('Rubber duck debugging works. It works so well that I have stopped being embarrassed about it, which is its own kind of milestone.')}
      </p>
      <DuckDeck T={T} />

      <hr className="divider" />
      <h2>{T('Hot takes, sorted by spice')}</h2>
      <p className="muted" style={{ margin: 'var(--s3) 0 0', maxWidth: 'var(--maxw-prose)' }}>
        {T('Opinions I will defend at a whiteboard. The counter is local to your browser and I will never see it, which is probably for the best.')}
      </p>
      <HotTakes T={T} />

      <hr className="divider" />
      <div className="panel">
        <span className="badge">{T('There is an easter egg')}</span>
        <p className="muted" style={{ marginTop: 'var(--s3)', maxWidth: 'var(--maxw-prose)' }}>
          {T('Up, up, down, down, left, right, left, right, B, A. It does not unlock anything. It never has. Nintendo has been getting away with that for forty years and I respect it enormously.')}
        </p>
      </div>

      <p className="faint" style={{ marginTop: 'var(--s7)', fontSize: 'var(--t-small)' }}>
        {T('Still gold. Just goofier.')}{' '}
        <button type="button" className="linkish" onClick={() => go('Home')}>{T('Back to the front')}</button>
      </p>

      {party && (
        <div className="toast" role="status">
          🦁 <b>DHAHAB DISCO MODE.</b> There is no reward. That was the reward.
        </div>
      )}
    </section>
  );
}

function GalleryGrid({ items }) {
  return (
    <div className="gallery">
      {items.map((g, i) => (
        <div className="gallery-tile reveal" key={i} style={{ transitionDelay: `${i * 70}ms` }}>
          {g.image
            ? <img src={g.image} alt={g.caption || ''} loading="lazy" decoding="async" />
            : <GenArt seed={i + 11} variant={['flow', 'code', 'web', 'finance'][i % 4]} />}
          {g.caption && <div className="gallery-cap">{g.caption}</div>}
        </div>
      ))}
    </div>
  );
}

// Line-art icons for cards, keyed by category/tag
const ICONS = {
  'Engineering / Ops': 'M8 3v3M16 3v3M3 9h18M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z',
  'AI / ML': 'M12 2a3 3 0 013 3 3 3 0 013 3 3 3 0 010 6 3 3 0 01-3 3 3 3 0 01-6 0 3 3 0 01-3-3 3 3 0 010-6 3 3 0 013-3 3 3 0 013-3zM12 8v8M9 12h6',
  'Research': 'M9 2v6l-5 9a2 2 0 002 3h12a2 2 0 002-3l-5-9V2M8 2h8',
  'Teaching': 'M12 3L2 9l10 6 10-6-10-6zM5 11v5c0 1 3 3 7 3s7-2 7-3v-5',
  'Leadership': 'M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6',
  'Finance': 'M3 3v18h18M7 15l4-4 3 3 5-6',
  'Publication': 'M6 2h9l5 5v15a0 0 0 010 0H6a2 2 0 01-2-2V4a2 2 0 012-2zM15 2v5h5M8 13h8M8 17h6',
  'Project': 'M3 7h6l2 2h10v10a2 2 0 01-2 2H3a2 2 0 01-2-2V7z',
};
function CardIcon({ kind }) {
  const path = ICONS[kind] || ICONS['Project'];
  return (
    <span className="card-ic" aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={path} /></svg>
    </span>
  );
}

function Blog({ d }) {
  const posts = d.blog.posts || [];
  return (
    <section className="section">
      <SectionTitle eyebrow="Writing" title="Blog" />
      <p className="lead">{d.blog.intro}</p>
      {posts.length > 0 && (
        <div className="grid grid--2" style={{ marginTop: 'var(--s6)' }}>
          {posts.map((post, i) => (
            <article className="card reveal" key={i} style={{ transitionDelay: `${i * 80}ms` }}>
              {post.image && <div className="card-art" style={{ backgroundImage: `url(${post.image})` }} />}
              <h3>{post.title}</h3>
              <div className="muted" style={{ fontSize: 'var(--t-small)', margin: 'var(--s2) 0' }}>{post.date}</div>
              <p className="muted">{post.summary}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function SectionTitle({ eyebrow, title }) {
  return (
    <header style={{ marginBottom: 'var(--s5)' }}>
      <p className="eyebrow">{eyebrow}</p>
      <h1 style={{ marginTop: 'var(--s3)' }}>{title}</h1>
    </header>
  );
}

// ---------- Legal page ----------
function Legal() {
  const item = (title, body) => (
    <div style={{ marginTop: 'var(--s6)' }}>
      <h3>{title}</h3>
      <p className="muted" style={{ marginTop: 'var(--s2)', maxWidth: 'var(--maxw-prose)' }}>{body}</p>
    </div>
  );
  return (
    <section className="section">
      <SectionTitle eyebrow="Legal & Privacy" title="The fine print" />
      <p className="lead">Short version: I don't collect your data, and nothing here is financial advice.</p>
      {item('Privacy', 'This site has no backend, analytics, or ads. The Edit panel saves to your browser\'s localStorage only — I never see it. GitHub Pages may log IPs for security; see github.com/privacy.')}
      {item('Financial disclaimer', 'I publish backtested and walk-forward simulation results only. No live profit-and-loss or personal return figures are claimed anywhere on this site. Hypothetical results do not represent live trading, and past performance is not indicative of future results. I am not a licensed financial advisor and nothing here is investment advice — consult a professional before risking capital.')}
      {item('Copyright & IP', 'All content is mine. You can link to it freely; you can\'t copy or republish it without permission. Code follows the license in each individual repo.')}
      {item('Everything else', 'Opinions here are my own and don\'t represent any employer or school. The site is provided as-is, with no warranties. External links go places I don\'t control. Terms may change.')}
      <hr className="divider" />
      <p className="faint" style={{ fontSize: 'var(--t-micro)' }}>
        © {new Date().getFullYear()} Yusuf Gadelrab. Not legal advice.
      </p>
    </section>
  );
}

// ---------- Admin ----------
// Hidden behind Ctrl+Shift+E — live content editing that exports clean JSON
// to paste back over siteData.
function Admin({ data, save, close }) {
  const [d, setD] = useState(JSON.parse(JSON.stringify(data)));
  const [copied, setCopied] = useState(false);

  const commit = (next) => { setD(next); save(next); };
  const setField = (path, val) => {
    const next = JSON.parse(JSON.stringify(d));
    const keys = path.split('.'); let cur = next;
    for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
    cur[keys[keys.length - 1]] = val;
    commit(next);
  };
  const exportData = () => {
    // Strip embedded b64 PDF data before export — these are large and don't belong in JSON
    const clean = JSON.parse(JSON.stringify(d));
    if (clean.resume?.files) clean.resume.files = clean.resume.files.map(({ b64, ...rest }) => rest);
    const text = 'const siteData = ' + JSON.stringify(clean, null, 2) + ';';
    try { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2500); }
    catch (e) { window.prompt('Copy this and paste over siteData in the code:', text); }
  };

  // generic list helpers
  const addTo = (key, template) => { const n = JSON.parse(JSON.stringify(d)); n[key].push(template); commit(n); };
  const addPost = () => { const n = JSON.parse(JSON.stringify(d)); n.blog.posts.unshift({ title: 'New Post', date: 'Month Year', summary: '', body: '', image: '' }); commit(n); };
  const addGallery = () => { const n = JSON.parse(JSON.stringify(d)); n.gallery.push({ image: '', caption: '', category: 'General' }); commit(n); };
  const removeFrom = (key, idx) => { const n = JSON.parse(JSON.stringify(d)); n[key].splice(idx, 1); commit(n); };
  const removePost = (idx) => { const n = JSON.parse(JSON.stringify(d)); n.blog.posts.splice(idx, 1); commit(n); };

  const F = ({ label, val, onChange, area }) => (
    <>
      <span className="admin-label">{label}</span>
      {area
        ? <textarea className="admin-text" defaultValue={val} onBlur={(e) => onChange(e.target.value)} />
        : <input defaultValue={val} onBlur={(e) => onChange(e.target.value)} />}
    </>
  );

  return (
    <div className="admin-wrap">
      <div className="admin-box">
        <div className="row-tools" style={{ marginBottom: 'var(--s5)' }}>
          <h2>Edit Site</h2>
          <div className="row">
            <button className="btn btn-gold btn-sm" onClick={exportData}>{copied ? '✓ Copied!' : '⬇ Export Data'}</button>
            <button className="btn btn-ghost btn-sm" onClick={close}>Done</button>
          </div>
        </div>
        <p className="muted" style={{ fontSize: 'var(--t-small)', marginBottom: 'var(--s5)' }}>
          Edits preview live & save to this browser. To make them <b>permanent for visitors</b>, click <b>Export Data</b>, paste over the <code>siteData</code> object in your code, and redeploy.
        </p>

        {/* HOME */}
        <div className="admin-card">
          <h3 className="gold">Home</h3>
          <F label="Eyebrow" val={d.home.eyebrow} onChange={(v) => setField('home.eyebrow', v)} />
          <F label="Headline" val={d.home.headline} onChange={(v) => setField('home.headline', v)} area />
          <F label="Availability badge" val={d.home.availability} onChange={(v) => setField('home.availability', v)} />
          <F label="Hero photo URL (e.g. /yusuf-portfolio/me.jpg)" val={d.home.heroImage} onChange={(v) => setField('home.heroImage', v)} />
          <F label="Subtext" val={d.home.sub} onChange={(v) => setField('home.sub', v)} area />
        </div>

        {/* GALLERY */}
        <div className="admin-card">
          <div className="row-tools"><h3 className="gold">Gallery (shown in About)</h3>
            <button className="mini" onClick={addGallery}>+ Add Photo</button></div>
          {d.gallery.map((g, i) => (
            <div key={i} style={{ borderTop: '1px solid var(--line-soft)', paddingTop: 'var(--s3)', marginTop: 'var(--s3)' }}>
              <div className="row-tools"><span className="muted" style={{ fontSize: 'var(--t-small)' }}>Photo {i + 1}</span>
                <button className="mini danger" onClick={() => removeFrom('gallery', i)}>Delete</button></div>
              <F label="Image URL" val={g.image} onChange={(v) => { const n = JSON.parse(JSON.stringify(d)); n.gallery[i].image = v; commit(n); }} />
              <F label="Caption" val={g.caption} onChange={(v) => { const n = JSON.parse(JSON.stringify(d)); n.gallery[i].caption = v; commit(n); }} />
              <F label="Category" val={g.category} onChange={(v) => { const n = JSON.parse(JSON.stringify(d)); n.gallery[i].category = v; commit(n); }} />
            </div>
          ))}
        </div>

        {/* ABOUT */}
        <div className="admin-card">
          <h3 className="gold">About — Bio</h3>
          {d.about.bio.map((p, i) => (
            <F key={i} label={`Paragraph ${i + 1}`} val={p} area
              onChange={(v) => { const n = JSON.parse(JSON.stringify(d)); n.about.bio[i] = v; commit(n); }} />
          ))}
        </div>

        {/* EXPERIENCE */}
        <ListEditor title="Experience" items={d.experience} onAdd={() => addTo('experience', { title: 'Role', org: 'Org', meta: 'Dates', tag: 'Tag', image: '', bullets: ['Achievement'] })}
          onRemove={(i) => removeFrom('experience', i)}
          fields={[['title', 'Title'], ['org', 'Organization'], ['meta', 'Dates'], ['tag', 'Tag'], ['image', 'Image URL']]}
          d={d} commit={commit} arrKey="experience" hasBullets />

        {/* RESEARCH */}
        <ListEditor title="Research" items={d.research} onAdd={() => addTo('research', { title: 'Title', venue: 'Venue', role: 'Role', image: '', link: '', abstract: '', citation: '' })}
          onRemove={(i) => removeFrom('research', i)}
          fields={[['title', 'Title'], ['venue', 'Venue'], ['role', 'Role'], ['link', 'Link'], ['abstract', 'Abstract'], ['citation', 'Citation']]}
          d={d} commit={commit} arrKey="research" />

        {/* PROJECTS */}
        <ListEditor title="Projects" items={d.projects} onAdd={() => addTo('projects', { title: 'Project', stack: 'Stack', image: '', link: '', desc: '' })}
          onRemove={(i) => removeFrom('projects', i)}
          fields={[['title', 'Title'], ['stack', 'Tech Stack'], ['image', 'Image URL'], ['link', 'Link'], ['desc', 'Description']]}
          d={d} commit={commit} arrKey="projects" />

        {/* BLOG */}
        <div className="admin-card">
          <div className="row-tools"><h3 className="gold">Blog</h3>
            <button className="mini" onClick={addPost}>+ Add Post</button></div>
          <F label="Blog intro" val={d.blog.intro} onChange={(v) => setField('blog.intro', v)} area />
          {d.blog.posts.length === 0 && <p className="muted" style={{ fontSize: 'var(--t-small)', marginTop: 'var(--s3)' }}>No posts yet. Click “Add Post” when you’re ready to write.</p>}
          {d.blog.posts.map((post, i) => (
            <div key={i} style={{ borderTop: '1px solid var(--line-soft)', paddingTop: 'var(--s3)', marginTop: 'var(--s3)' }}>
              <div className="row-tools"><span className="muted" style={{ fontSize: 'var(--t-small)' }}>Post {i + 1}</span>
                <button className="mini danger" onClick={() => removePost(i)}>Delete</button></div>
              <F label="Title" val={post.title} onChange={(v) => { const n = JSON.parse(JSON.stringify(d)); n.blog.posts[i].title = v; commit(n); }} />
              <F label="Date" val={post.date} onChange={(v) => { const n = JSON.parse(JSON.stringify(d)); n.blog.posts[i].date = v; commit(n); }} />
              <F label="Image URL" val={post.image} onChange={(v) => { const n = JSON.parse(JSON.stringify(d)); n.blog.posts[i].image = v; commit(n); }} />
              <F label="Summary" val={post.summary} area onChange={(v) => { const n = JSON.parse(JSON.stringify(d)); n.blog.posts[i].summary = v; commit(n); }} />
              <F label="Body" val={post.body} area onChange={(v) => { const n = JSON.parse(JSON.stringify(d)); n.blog.posts[i].body = v; commit(n); }} />
            </div>
          ))}
        </div>

        {/* RESUME */}
        <div className="admin-card">
          <h3 className="gold">Résumé</h3>
          <F label="Résumé PDF URL (e.g. /yusuf-portfolio/resume.pdf)" val={d.resume.url} onChange={(v) => setField('resume.url', v)} />
          <F label="Résumé summary" val={d.resume.summary} onChange={(v) => setField('resume.summary', v)} area />
        </div>

        {/* CONTACT */}
        <div className="admin-card">
          <h3 className="gold">Contact (shown in footer)</h3>
          <F label="Blurb" val={d.contact.blurb} onChange={(v) => setField('contact.blurb', v)} area />
          <F label="Email" val={d.contact.email} onChange={(v) => setField('contact.email', v)} />
          <F label="Phone" val={d.contact.phone} onChange={(v) => setField('contact.phone', v)} />
        </div>

        <div className="center" style={{ padding: 'var(--s5) 0 var(--s7)' }}>
          <button className="btn btn-gold" onClick={exportData}>{copied ? '✓ Copied to clipboard!' : '⬇ Export Data (to save permanently)'}</button>
        </div>
      </div>
    </div>
  );
}

function ListEditor({ title, items, onAdd, onRemove, fields, d, commit, arrKey, hasBullets }) {
  return (
    <div className="admin-card">
      <div className="row-tools"><h3 className="gold">{title}</h3>
        <button className="mini" onClick={onAdd}>+ Add</button></div>
      {items.map((item, i) => (
        <div key={i} style={{ borderTop: '1px solid var(--line-soft)', paddingTop: 'var(--s3)', marginTop: 'var(--s3)' }}>
          <div className="row-tools"><span className="muted" style={{ fontSize: 'var(--t-small)' }}>{title} {i + 1}</span>
            <button className="mini danger" onClick={() => onRemove(i)}>Delete</button></div>
          {fields.map(([k, lbl]) => (
            <React.Fragment key={k}>
              <span className="admin-label">{lbl}</span>
              {['abstract', 'citation', 'desc'].includes(k)
                ? <textarea className="admin-text" defaultValue={item[k]} onBlur={(e) => { const n = JSON.parse(JSON.stringify(d)); n[arrKey][i][k] = e.target.value; commit(n); }} />
                : <input defaultValue={item[k]} onBlur={(e) => { const n = JSON.parse(JSON.stringify(d)); n[arrKey][i][k] = e.target.value; commit(n); }} />}
            </React.Fragment>
          ))}
          {hasBullets && (
            <>
              <span className="admin-label">Bullets (one per line)</span>
              <textarea className="admin-text" defaultValue={item.bullets.join('\n')}
                onBlur={(e) => { const n = JSON.parse(JSON.stringify(d)); n[arrKey][i].bullets = e.target.value.split('\n').filter(Boolean); commit(n); }} />
            </>
          )}
        </div>
      ))}
    </div>
  );
}
