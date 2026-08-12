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
      { value: 'NLP', label: 'Equity sentiment scoring · IBM Watson Studio' },
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
      "On the research side, I am a co-author on a peer-reviewed poster at ACM SIGCSE 2026 on bilingual coding education. The IBM project is probably the best example of my technical work right now: an NLP pipeline that pulls sentiment from public market news sources and scores equities across five quantitative factors, built on IBM Watson Studio.",
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
        'Pitched Silicon Valley firms on technology partnerships and sponsorship for club programming.',
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
        'Built an NLP equity-scoring pipeline with IBM Watson Studio that ingests sentiment from public market news sources and generates signals across five quantitative factors.',
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
      venue: 'SIGCSE TS 2026 · ACM · 2 pages',
      role: 'Co-Author',
      image: '',
      link: 'https://dl.acm.org/doi/10.1145/3770761.3777339',
      abstract:
        'Investigated how bilingual programming workshops influence student attitudes, perceived understanding, and comfort. Across 60 SJSU participants (40 novice, 20 experienced) using the multilingual Hedy platform, novice learners showed the largest gains in confidence and enjoyment. Contributed to survey design and mixed-methods analysis; pre-to-post gains in confidence, computing identity, enjoyment and motivation were statistically significant.',
      citation:
        'Tshukudu, E., Shah, N., Kieu, T., Deeb, L., Venkateswaran, H., Ghai, A., Gadelrab, Y., & Hada, P. (2026). "Exploring Bilingual Coding for Inclusive Computer Science Learning." SIGCSE TS 2026, ACM. doi.org/10.1145/3770761.3777339',
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
        'Ingests sentiment from public market news sources and scores equities across five quantitative factors, with an automated signal pipeline on IBM Watson Studio. Prototype built during the IBM AI Creator program; not evaluated as a live trading strategy.',
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
    {
      title: 'IntakeKit',
      stack: 'Open source · MIT license',
      image: '',
      link: 'https://github.com/Yusuf-Gadelrab/IntakeKit',
      linkLabel: 'View on GitHub →',
      desc:
        'Prototype, no live users. Open source under MIT.',
    },
    {
      title: 'LoadLink',
      stack: 'Open source · MIT license',
      image: '',
      link: 'https://github.com/Yusuf-Gadelrab/LoadLink',
      linkLabel: 'View on GitHub →',
      desc:
        'Prototype extracted from unpaid research work at Hwy Haul. MIT-licensed.',
    },
    {
      title: 'Bilingual CS Prerequisite Map',
      stack: 'Hugging Face Space · Publishing once pushed',
      image: '',
      link: 'https://huggingface.co/spaces/YusufGadelrab/bilingual-cs-prereq-map',
      linkLabel: 'Open the Hugging Face Space →',
      desc:
        'A public Hugging Face Space link for the bilingual CS prerequisite map. It will become available once the Space is pushed.',
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
      { label: 'LinkedIn', url: 'https://www.linkedin.com/in/yusuf-gadelrab' },
      { label: 'GitHub', url: 'https://github.com/Yusuf-Gadelrab' },
      { label: 'Instagram', url: 'https://www.instagram.com/_kxng_sef/' },
      { label: 'Hudl', url: 'https://www.hudl.com/profile/18612951/Yusuf-Gadelrab' },
    ],
  },
  resume: {
    // After deploy, drop both PDFs in /public and these paths resolve.
    // Apex domain (yusuf-gadelrab.github.io): use '/Yusuf_Gadelrab_Resume.pdf'
    // Project path (…github.io/yusuf-portfolio): prefix '/yusuf-portfolio/…'
    files: [
      { label: 'Software / AI résumé', url: '/Yusuf_Gadelrab_Resume.pdf' },
      { label: 'Finance / fintech résumé', url: '/Yusuf_Gadelrab_Resume.pdf' },
    ],
    summary:
      'CS undergraduate at SJSU (B.S., 2028) with applied work in AI/ML, quantitative finance, and inclusive-computing research. Co-author of a peer-reviewed ACM SIGCSE 2026 publication. Two résumés below — one tuned for software/AI roles, one for finance and fintech.',
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
      handle: 'in/yusuf-gadelrab',
      meta: '705 followers · 500+ connections',
      url: 'https://www.linkedin.com/in/yusuf-gadelrab',
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
    { value: '5', label: 'Quantitative factors scored — NLP equity model on IBM Watson Studio' },
    { value: '60%', label: 'Reduction in manual equity-research time once the signal pipeline shipped' },
    { value: '40%', label: 'Lift in monthly web engagement after rebuilding the SVEC site end to end' },
    { value: '60', label: 'Participants in the IRB-approved bilingual-coding study, with statistically significant pre-to-post confidence gains' },
    { value: 'SVEC', label: 'Project Manager — website and technical operations' },
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
        'Own the club’s website and technical operations end to end, including sponsorship outreach to Silicon Valley technology firms.',
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
      title: 'Valedictorian, 4.0 high school GPA, graduation speaker',
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
        Figures shown on this site are research and engineering results, not live trading performance. The equity-scoring
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
        <a href="https://www.linkedin.com/in/yusuf-gadelrab" target="_blank" rel="noopener noreferrer">LinkedIn</a>
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
            <a href="https://www.linkedin.com/in/yusuf-gadelrab">LinkedIn</a>
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
      eyebrow="Research & Publications"
      title="A peer-reviewed publication at ACM SIGCSE 2026"
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

// resume page — the PDFs are real files in /public. They used to be base64 blobs
// inline in this bundle, which cost every single homepage visitor ~118 KB gzipped
// for a tab most of them never open. The b64 branch below is kept only because an
// older localStorage export can still carry one.
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
          {/* iframe, not <embed>: every page ships a CSP with object-src 'none',
              which silently blanked the preview pane for anyone who opened it. */}
          <iframe src={primary} title="Software / AI résumé preview" loading="lazy"
            style={{ width: '100%', height: 840, display: 'block', border: 0 }} />
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
      <SectionTitle eyebrow="Publications & Poster" title="Research" />
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
      <div style={{ marginTop: 'var(--s8)' }}>
        <SectionTitle eyebrow="Funding" title="Support Open Source" />
        <p className="lead">The public funding listing for this portfolio is available on floss.fund.</p>
        <a className="btn btn-gold" style={{ marginTop: 'var(--s4)' }} href="https://dir.floss.fund/view/project/@yusuf-gadelrab.github.io/yusuf-portfolio" target="_blank" rel="noreferrer">
          View the funding listing →
        </a>
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
        A peer-reviewed publication at the ACM SIGCSE Technical Symposium 2026, written as an
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
