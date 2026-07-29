/* ============================================================================
   site.js — shared UX layer for every page in public/
   Vanilla, no dependencies, no network calls. Loaded once per page with
   <script src="/js/site.js" defer></script> immediately before </body>.

   Everything here is additive and defensive: it only ever appends elements it
   owns (all prefixed `yg-`) and never removes or rewrites page markup, because
   several pages ship their own reveal / tab / count-up / checkout scripts that
   query for specific ids and would throw if anything disappeared.

   Ships:
     1. Command palette (Cmd/Ctrl-K) — pages, in-page sections, quick actions
     2. Scroll progress hairline   (skipped if the page already has one)
     3. Sticky contextual CTA      (commercial pages only, session-dismissible)
     4. Copy-link buttons on section headings
     5. Back to top
     6. Reading time + last-updated on long case studies
   View transitions are CSS-only (@view-transition in site.css) so unsupported
   browsers are a silent no-op instead of a broken JS navigation shim.
   ========================================================================= */
(function () {
  'use strict';

  var d = document;
  var w = window;
  var MQ_MOTION = w.matchMedia ? w.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var reduced = function () { return !!MQ_MOTION.matches; };

  /* ---------- page identity -------------------------------------------- */
  function pageKey() {
    var p = location.pathname.replace(/\/+$/, '');
    var last = p.split('/').pop() || 'index.html';
    return last.replace(/\.html$/, '') || 'index';
  }
  var KEY = pageKey();

  /* ---------- site map --------------------------------------------------
     Hand-maintained so the palette can list pages the current document has no
     link to. `k` is extra fuzzy-match vocabulary, not user-visible copy. */
  var PAGES = [
    { t: 'Home — Work',            u: '/',                     g: 'Site',     k: 'index portfolio yusuf gadelrab about' },
    { t: 'Apps & Projects',        u: '/apps.html',            g: 'Site',     k: 'everything built index projects software' },
    { t: 'Everything I Do',        u: '/everything.html',      g: 'Site',     k: 'overview map all' },
    { t: 'AU — build feed',        u: '/au.html',              g: 'Site',     k: 'log chronological journal updates' },
    { t: 'Resume services',        u: '/resume.html',          g: 'Services', k: 'rebuild tailored applications cv' },
    { t: 'LinkedIn Profile Sprint', u: '/sprint.html',         g: 'Services', k: 'rewrite profile 48 hours ghostwriting' },
    { t: 'Store — tools & automation', u: '/store.html',       g: 'Store',    k: 'buy products software ai downloads' },
    { t: 'Business template vault', u: '/templates.html',      g: 'Store',    k: 'decks slides packs midnight gold' },
    { t: 'KXNG SEF — clothing',    u: '/kxngsef.html',         g: 'Store',    k: 'streetwear hoodie tee drop merch brand' },
    { t: 'HEFT — hoodies',         u: '/heft.html',            g: 'Store',    k: 'heavyweight clothing' },
    { t: 'FreightDesk AI',         u: '/freightdesk.html',     g: 'Products', k: 'broker back office ar billing pilot' },
    { t: 'Freight broker calculators', u: '/freight-tools.html', g: 'Products', k: 'rate per mile deadhead margin detention fsc free' },
    { t: "Trader's risk toolkit",  u: '/risk-tools.html',      g: 'Products', k: 'position sizer expectancy risk of ruin free' },
    { t: 'Apply OS — tracker',     u: '/apply.html',           g: 'Products', k: 'application deadline radar internship free' },
    { t: 'Visa Navigator',         u: '/visa.html',            g: 'Products', k: 'change of status cpt opt timeline planner f-1' },
    { t: 'Creator media kit',      u: '/media-kit.html',       g: 'Creator',  k: 'rates booking brand sponsor instagram' },
    { t: 'Model portfolio & digitals', u: '/modeling.html',    g: 'Creator',  k: 'modelling agency comp card' },
    { t: 'HwyHaul LoadLink — case study', u: '/hwyhaul.html',  g: 'Case studies', k: 'internship freight ai back office' },
    { t: 'Trading bot — case study', u: '/trading-bot.html',   g: 'Case studies', k: 'alpaca execution engine broker agnostic' },
    { t: 'Swing screener — case study', u: '/swing-screener.html', g: 'Case studies', k: 'walk forward backtest avwap vcp' },
    { t: 'EventReels — case study', u: '/eventreels.html',     g: 'Case studies', k: 'ffmpeg highlight reels video editing' },
    { t: 'EcoImpact — case study', u: '/ecoimpact.html',       g: 'Case studies', k: 'trash map impact meter sustainability' },
    { t: 'SpartanEats — concept',  u: '/spartaneats.html',     g: 'Case studies', k: 'sjsu food delivery app' },
    { t: 'Privacy policy',         u: '/privacy.html',         g: 'Legal',    k: 'data gdpr' },
    { t: 'Terms & disclaimers',    u: '/terms.html',           g: 'Legal',    k: 'legal disclaimer' }
  ];

  var EMAIL = 'yusuf.gadelrab06@gmail.com';
  var ACTIONS = [
    { t: 'Email Yusuf',      u: 'mailto:' + EMAIL, g: 'Actions', k: 'contact hire reach out message', ext: 1 },
    { t: 'Call (669) 328-1148', u: 'tel:+16693281148', g: 'Actions', k: 'phone contact', ext: 1 },
    { t: 'GitHub',           u: 'https://github.com/Yusuf-Gadelrab', g: 'Actions', k: 'code repos source', ext: 1 },
    { t: 'LinkedIn',         u: 'https://www.linkedin.com/in/yusuf-gadelrab-76246b221', g: 'Actions', k: 'social profile connect', ext: 1 },
    { t: 'Copy link to this page', g: 'Actions', k: 'share url clipboard', fn: function () { copyText(location.href); } },
    { t: 'Print this page',  g: 'Actions', k: 'pdf save export', fn: function () { w.print(); } },
    { t: 'Back to top',      g: 'Actions', k: 'scroll up start', fn: function () { scrollToTop(); } }
  ];

  /* ---------- tiny helpers ---------------------------------------------- */
  function el(tag, attrs, html) {
    var n = d.createElement(tag);
    if (attrs) for (var a in attrs) if (attrs[a] != null) n.setAttribute(a, attrs[a]);
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function scrollToTop() {
    try { w.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' }); }
    catch (e) { w.scrollTo(0, 0); }
  }
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(function () { return legacyCopy(text); });
    }
    return legacyCopy(text);
  }
  function legacyCopy(text) {
    var ta = el('textarea');
    ta.value = text;
    ta.setAttribute('aria-hidden', 'true');
    ta.style.cssText = 'position:fixed;top:-1000px;left:-1000px;opacity:0';
    d.body.appendChild(ta);
    ta.select();
    try { d.execCommand('copy'); } catch (e) {}
    d.body.removeChild(ta);
  }
  function slug(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
  }
  /* rAF-throttled scroll handler — keeps the progress bar and the sticky bits
     off the main thread's critical path. */
  var scrollSubs = [];
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var y = w.scrollY || d.documentElement.scrollTop || 0;
      var max = d.documentElement.scrollHeight - d.documentElement.clientHeight;
      for (var i = 0; i < scrollSubs.length; i++) scrollSubs[i](y, max);
    });
  }
  function onScrollSub(fn) { scrollSubs.push(fn); }

  var live = null;
  function announce(msg) {
    if (!live) {
      live = el('div', { class: 'sr-only', role: 'status', 'aria-live': 'polite', 'data-pv2-skip': '' });
      d.body.appendChild(live);
    }
    live.textContent = msg;
  }

  /* =======================================================================
     1. COMMAND PALETTE
     ===================================================================== */
  var Palette = (function () {
    var root, input, list, countEl, openerEl = null, items = [], results = [], active = -1, isOpen = false;

    /* Subsequence fuzzy match. Returns a score (higher = better) or -1.
       Bonuses for consecutive runs and word-boundary hits so "frd" ranks
       "FReightDesk" above an incidental letter scatter. */
    function score(needle, hay) {
      if (!needle) return 0;
      var n = needle.toLowerCase(), h = hay.toLowerCase();
      var idx = h.indexOf(n);
      if (idx > -1) return 1000 - idx * 2 + (idx === 0 || /[\s\-—·/]/.test(h[idx - 1] || ' ') ? 60 : 0);
      var hi = 0, s = 0, run = 0;
      for (var i = 0; i < n.length; i++) {
        var c = n[i];
        if (c === ' ') continue;
        var f = h.indexOf(c, hi);
        if (f < 0) return -1;
        run = f === hi ? run + 1 : 0;
        s += 12 + run * 8 + (f === 0 || /[\s\-—·/]/.test(h[f - 1] || ' ') ? 14 : 0) - Math.min(f - hi, 8);
        hi = f + 1;
      }
      return s;
    }

    /* Sections are re-read every open so React-rendered pages and tab panes
       that were empty at load still contribute jump targets. */
    function collectSections() {
      var out = [];
      var scope = d.querySelector('main') || d.body;
      var heads = scope.querySelectorAll('h2, h3');
      for (var i = 0; i < heads.length && out.length < 60; i++) {
        var h = heads[i];
        if (h.closest('nav, .site-footer, #yg-palette, [hidden]')) continue;
        var label = (h.textContent || '').replace(/\s+/g, ' ').trim();
        if (!label || label.length > 80) continue;
        var target = h.id ? h : (h.closest('section[id]') || h.closest('[id]'));
        var id = target && target.id;
        if (!id) { id = 'yg-s-' + slug(label); if (!id || d.getElementById(id)) continue; h.id = id; }
        out.push({ t: label, u: '#' + id, g: 'On this page', k: '', jump: 1 });
      }
      return out;
    }

    function build() {
      items = collectSections().concat(PAGES, ACTIONS);
    }

    /* Every whitespace-separated token must hit something (AND), so
       "swing case" finds the swing-screener case study regardless of word
       order, while a typo in one token correctly drops the row. */
    function scoreItem(tokens, it) {
      var total = 0;
      for (var t = 0; t < tokens.length; t++) {
        var best = Math.max(score(tokens[t], it.t), score(tokens[t], it.k || '') - 60, score(tokens[t], it.g) - 120);
        if (best < 0) return -1;
        total += best;
      }
      return total;
    }

    function render(q) {
      var tokens = q ? q.split(/\s+/).filter(Boolean) : [];
      var scored = [];
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        var s = tokens.length ? scoreItem(tokens, it) : 0;
        if (s >= 0) scored.push({ it: it, s: s, i: i });
      }
      scored.sort(function (a, b) { return b.s - a.s || a.i - b.i; });
      results = scored.slice(0, 40).map(function (x) { return x.it; });

      var html = '', lastGroup = '';
      for (var j = 0; j < results.length; j++) {
        var r = results[j];
        if (r.g !== lastGroup) { html += '<li class="yg-pal__group" role="presentation">' + esc(r.g) + '</li>'; lastGroup = r.g; }
        html += '<li class="yg-pal__opt" role="option" id="yg-pal-o' + j + '" aria-selected="false" data-i="' + j + '">' +
          '<span class="yg-pal__t">' + esc(r.t) + '</span>' +
          '<span class="yg-pal__hint" aria-hidden="true">' + (r.jump ? '#' : r.ext ? '↗' : r.fn ? '⏎' : '→') + '</span></li>';
      }
      list.innerHTML = html || '<li class="yg-pal__empty" role="presentation">No matches</li>';
      setActive(results.length ? 0 : -1);
      countEl.textContent = results.length + (results.length === 1 ? ' result' : ' results');
    }

    function setActive(i) {
      var opts = list.querySelectorAll('.yg-pal__opt');
      for (var k = 0; k < opts.length; k++) opts[k].setAttribute('aria-selected', 'false');
      active = i;
      if (i < 0 || !opts[i]) { input.removeAttribute('aria-activedescendant'); return; }
      opts[i].setAttribute('aria-selected', 'true');
      input.setAttribute('aria-activedescendant', opts[i].id);
      var r = opts[i].getBoundingClientRect(), lr = list.getBoundingClientRect();
      if (r.top < lr.top) list.scrollTop -= lr.top - r.top + 8;
      else if (r.bottom > lr.bottom) list.scrollTop += r.bottom - lr.bottom + 8;
    }

    function choose(i) {
      var r = results[i];
      if (!r) return;
      close();
      if (r.fn) { r.fn(); return; }
      if (r.jump) {
        var t = d.querySelector(r.u);
        if (t) {
          if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '-1');
          t.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
          t.focus({ preventScroll: true });
          history.replaceState(null, '', r.u);
        }
        return;
      }
      if (r.ext) { w.open(r.u, '_blank', 'noopener'); return; }
      location.href = r.u;
    }

    function ensure() {
      if (root) return;
      root = el('div', { id: 'yg-palette', class: 'yg-pal', hidden: 'hidden', 'data-pv2-skip': '' });
      root.innerHTML =
        '<div class="yg-pal__scrim" data-close="1"></div>' +
        '<div class="yg-pal__box" role="dialog" aria-modal="true" aria-label="Site command palette">' +
          '<div class="yg-pal__head">' +
            '<span class="yg-pal__icon" aria-hidden="true">⌘</span>' +
            '<input class="yg-pal__input" type="text" role="combobox" aria-expanded="true" aria-controls="yg-pal-list" aria-autocomplete="list" autocomplete="off" spellcheck="false" placeholder="Jump to a page, section or action…" aria-label="Search pages, sections and actions">' +
            '<button class="yg-pal__esc" type="button" data-close="1">Esc</button>' +
          '</div>' +
          '<ul class="yg-pal__list" id="yg-pal-list" role="listbox" aria-label="Results"></ul>' +
          '<div class="yg-pal__foot"><span><kbd>↑</kbd><kbd>↓</kbd> navigate · <kbd>↵</kbd> open · <kbd>esc</kbd> close</span>' +
          '<span class="yg-pal__count sr-only" role="status" aria-live="polite"></span></div>' +
        '</div>';
      d.body.appendChild(root);
      input = root.querySelector('.yg-pal__input');
      list = root.querySelector('.yg-pal__list');
      countEl = root.querySelector('.yg-pal__count');

      root.addEventListener('mousedown', function (e) {
        if (e.target.closest('[data-close]')) { e.preventDefault(); close(); }
      });
      list.addEventListener('mousemove', function (e) {
        var o = e.target.closest('.yg-pal__opt');
        if (o) setActive(+o.dataset.i);
      });
      list.addEventListener('click', function (e) {
        var o = e.target.closest('.yg-pal__opt');
        if (o) choose(+o.dataset.i);
      });
      input.addEventListener('input', function () { render(input.value.trim()); });
      root.addEventListener('keydown', onKey);
    }

    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); return; }
      if (e.key === 'ArrowDown' || (e.key === 'n' && e.ctrlKey)) {
        e.preventDefault(); if (results.length) setActive((active + 1) % results.length); return;
      }
      if (e.key === 'ArrowUp' || (e.key === 'p' && e.ctrlKey)) {
        e.preventDefault(); if (results.length) setActive((active - 1 + results.length) % results.length); return;
      }
      if (e.key === 'Home' && results.length) { e.preventDefault(); setActive(0); return; }
      if (e.key === 'End' && results.length) { e.preventDefault(); setActive(results.length - 1); return; }
      if (e.key === 'Enter') { e.preventDefault(); choose(active); return; }
      /* Focus trap: only two tabbables live in the dialog, so Tab just cycles
         between them and can never escape to the page behind the scrim. */
      if (e.key === 'Tab') {
        var f = [input, root.querySelector('.yg-pal__esc')];
        var i = f.indexOf(d.activeElement);
        e.preventDefault();
        f[(i + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus();
      }
    }

    function open(opener) {
      ensure();
      if (isOpen) return;
      openerEl = opener || (d.activeElement && d.activeElement !== d.body ? d.activeElement : null);
      isOpen = true;
      build();
      root.hidden = false;
      d.documentElement.classList.add('yg-pal-open');
      input.value = '';
      render('');
      input.focus();
      var trig = d.querySelector('.yg-cmd');
      if (trig) trig.setAttribute('aria-expanded', 'true');
    }

    function close() {
      if (!isOpen) return;
      isOpen = false;
      root.hidden = true;
      d.documentElement.classList.remove('yg-pal-open');
      var trig = d.querySelector('.yg-cmd');
      if (trig) trig.setAttribute('aria-expanded', 'false');
      /* Restore focus to whatever opened it — required so keyboard users are
         not dumped at the top of the document. */
      if (openerEl && d.contains(openerEl)) { try { openerEl.focus({ preventScroll: true }); } catch (e) {} }
      openerEl = null;
    }

    return { open: open, close: close, isOpen: function () { return isOpen; } };
  })();

  /* Global hotkey. Ignored while typing so Cmd-K never eats a form field. */
  d.addEventListener('keydown', function (e) {
    var k = (e.key || '').toLowerCase();
    if (k === 'k' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      Palette.isOpen() ? Palette.close() : Palette.open();
      return;
    }
    if (k === '/' && !Palette.isOpen()) {
      var t = e.target;
      if (t && (t.matches('input, textarea, select') || t.isContentEditable)) return;
      e.preventDefault();
      Palette.open();
    }
  });

  /* Nav trigger — re-injected on mutation because the React homepage rebuilds
     its own nav after hydration. */
  function injectTrigger() {
    var navs = d.querySelectorAll('.site-nav');
    for (var i = 0; i < navs.length; i++) {
      var nav = navs[i];
      if (nav.querySelector('.yg-cmd')) continue;
      var b = el('button', {
        class: 'yg-cmd', type: 'button', 'aria-haspopup': 'dialog', 'aria-expanded': 'false',
        'aria-label': 'Open command palette (Control or Command K)', 'data-pv2-skip': ''
      }, '<span class="yg-cmd__label">Search</span><kbd class="yg-cmd__kbd">' + (/Mac|iP(hone|ad|od)/.test(navigator.platform || navigator.userAgent) ? '⌘' : 'Ctrl ') + 'K</kbd>');
      b.addEventListener('click', function (ev) { Palette.open(ev.currentTarget); });
      var links = nav.querySelector('.site-nav__links');
      if (links) links.appendChild(b); else nav.appendChild(b);
    }
  }

  /* =======================================================================
     2. SCROLL PROGRESS — only if the page does not already draw one
     ===================================================================== */
  function initProgress() {
    if (d.getElementById('pv2-bar') || d.getElementById('progress') || d.getElementById('yg-progress')) return;
    var bar = el('div', { id: 'yg-progress', 'aria-hidden': 'true', 'data-pv2-skip': '' });
    d.body.appendChild(bar);
    onScrollSub(function (y, max) { bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')'; });
  }
  /* Late guard: pv2-bar is appended by an inline script that may run after us.
     Also de-dupes pages that historically ended up with BOTH a markup #progress
     and an injected #pv2-bar stacked on the same 2px of screen. */
  function progressGuard() {
    var mine = d.getElementById('yg-progress');
    var pv2 = d.getElementById('pv2-bar');
    var legacy = d.getElementById('progress');
    if (mine && (pv2 || legacy)) { mine.remove(); mine = null; }
    if (pv2 && legacy) pv2.remove();
  }

  /* =======================================================================
     3. STICKY CONTEXTUAL CTA — commercial pages only
     Mirrors an action the page already offers. No countdowns, no scarcity,
     no invented deadlines: label and destination are both static.
     ===================================================================== */
  var CTAS = {
    'store':      { label: 'Browse the tools',        href: '#products' },
    'templates':  { label: 'Open the template vault', href: '#vault' },
    'sprint':     { label: 'See the Sprint options',  href: '#pricing' },
    'kxngsef':    { label: 'Join the waitlist',       href: '#waitlist' },
    'freightdesk':{ label: 'Book a pilot walkthrough', href: '#book' },
    'resume':     { label: 'See the packs',           href: '#packs' },
    'media-kit':  { label: 'See rates & book',        href: '#rates' },
    'modeling':   { label: 'Email a brief',           href: 'mailto:' + EMAIL + '?subject=Modeling%20Inquiry' }
  };

  function initStickyCta() {
    var cfg = CTAS[KEY];
    if (!cfg) return;
    var store;
    try { store = w.sessionStorage; } catch (e) { store = null; }
    var dismissKey = 'yg-cta-off:' + KEY;
    if (store && store.getItem(dismissKey)) return;
    /* If the intended anchor is missing (page edited), fall back to the page's
       own first gold button rather than shipping a dead link. */
    var href = cfg.href;
    if (href.charAt(0) === '#' && !d.querySelector(href)) {
      var fallback = d.querySelector('main .btn-gold[href], .btn-gold[href]');
      if (!fallback) return;
      href = fallback.getAttribute('href');
    }

    var bar = el('div', { id: 'yg-cta', class: 'yg-cta-bar', 'data-pv2-skip': '', hidden: 'hidden' });
    bar.innerHTML =
      '<a class="yg-cta-bar__go" href="' + esc(href) + '">' + esc(cfg.label) + ' →</a>' +
      '<button class="yg-cta-bar__x" type="button" aria-label="Dismiss this bar">✕</button>';
    d.body.appendChild(bar);

    bar.querySelector('.yg-cta-bar__x').addEventListener('click', function () {
      bar.remove();
      d.body.classList.remove('yg-has-cta');
      if (store) { try { store.setItem(dismissKey, '1'); } catch (e) {} }
    });

    /* Appear once the hero is behind you; hide again near the footer so it can
       never sit on top of the final call to action or the legal links. */
    var hero = d.querySelector('main section, main, .section');
    function threshold() {
      var h = hero ? hero.getBoundingClientRect().height : 0;
      return Math.max(320, Math.min(h * 0.8, 900));
    }
    var shown = false;
    onScrollSub(function (y, max) {
      var footer = d.querySelector('.site-footer');
      var nearEnd = footer ? footer.getBoundingClientRect().top < w.innerHeight + 40 : (max - y) < 200;
      var want = y > threshold() && !nearEnd;
      if (want === shown) return;
      shown = want;
      if (want) { bar.hidden = false; requestAnimationFrame(function () { bar.classList.add('is-in'); }); d.body.classList.add('yg-has-cta'); }
      else { bar.classList.remove('is-in'); d.body.classList.remove('yg-has-cta'); }
    });
  }

  /* =======================================================================
     4. COPY-LINK BUTTONS ON SECTION HEADINGS
     ===================================================================== */
  function initAnchors() {
    var scope = d.querySelector('main') || d.body;
    var heads = scope.querySelectorAll('h2, h3');
    for (var i = 0; i < heads.length; i++) {
      var h = heads[i];
      if (h.querySelector('.yg-anchor')) continue;
      if (h.closest('nav, .site-footer, #yg-palette, .yg-cta-bar')) continue;
      var label = (h.textContent || '').replace(/\s+/g, ' ').trim();
      if (!label) continue;
      var host = h.id ? h : (h.closest('section[id]') || h.closest('[id]'));
      var id = host && host.id;
      if (!id) {
        id = 'yg-s-' + slug(label);
        if (!id || d.getElementById(id)) continue;
        h.id = id;
      }
      var btn = el('button', {
        class: 'yg-anchor', type: 'button', 'data-target': id, 'data-pv2-skip': '',
        'aria-label': 'Copy link to section: ' + label, title: 'Copy link to this section'
      }, '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M10 13.5a4 4 0 0 0 5.7 0l2.8-2.8a4 4 0 0 0-5.7-5.7l-1.3 1.3"/><path d="M14 10.5a4 4 0 0 0-5.7 0l-2.8 2.8a4 4 0 0 0 5.7 5.7l1.3-1.3"/></svg>');
      h.appendChild(d.createTextNode(' '));
      h.appendChild(btn);
    }
  }
  d.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.yg-anchor');
    if (!b) return;
    e.preventDefault();
    var url = location.origin + location.pathname + location.search + '#' + b.dataset.target;
    copyText(url);
    history.replaceState(null, '', '#' + b.dataset.target);
    b.classList.add('is-copied');
    announce('Link copied');
    setTimeout(function () { b.classList.remove('is-copied'); }, 1400);
  });

  /* =======================================================================
     5. BACK TO TOP
     ===================================================================== */
  function initTop() {
    if (d.getElementById('yg-top')) return;
    var b = el('button', { id: 'yg-top', type: 'button', 'aria-label': 'Back to top', hidden: 'hidden', 'data-pv2-skip': '' },
      '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>');
    b.addEventListener('click', function () {
      scrollToTop();
      var first = d.querySelector('.skip-link, .site-nav a, h1');
      if (first) { try { first.focus({ preventScroll: true }); } catch (e) {} }
    });
    d.body.appendChild(b);
    var shown = false;
    onScrollSub(function (y) {
      var want = y > w.innerHeight * 1.25;
      if (want === shown) return;
      shown = want;
      if (want) { b.hidden = false; requestAnimationFrame(function () { b.classList.add('is-in'); }); }
      else { b.classList.remove('is-in'); }
    });
  }

  /* =======================================================================
     6. READING TIME + LAST UPDATED (long case studies)
     Word count is measured from the rendered document. The date comes from the
     source file's real modification time, baked in at authoring time — never
     "today", never generated, so it cannot drift into a fake freshness signal.
     ===================================================================== */
  var UPDATED = {
    'hwyhaul': '2026-07-29',
    'trading-bot': '2026-07-29',
    'swing-screener': '2026-07-29',
    'eventreels': '2026-07-29',
    'ecoimpact': '2026-07-29'
  };
  function initMeta() {
    var iso = UPDATED[KEY];
    if (!iso || d.getElementById('yg-meta')) return;
    var h1 = d.querySelector('main h1') || d.querySelector('h1');
    if (!h1) return;
    var main = d.querySelector('main') || d.body;
    var text = (main.innerText || main.textContent || '').replace(/\s+/g, ' ').trim();
    var words = text ? text.split(' ').length : 0;
    var mins = Math.max(1, Math.round(words / 225));
    var pretty = new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
    var p = el('p', { id: 'yg-meta', class: 'yg-meta', 'data-pv2-skip': '' },
      '<span>' + mins + ' min read</span><span class="yg-meta__sep" aria-hidden="true">·</span>' +
      '<span>Updated <time datetime="' + iso + '">' + pretty + '</time></span>');
    var anchorEl = h1.parentElement === main ? h1 : h1;
    anchorEl.insertAdjacentElement('afterend', p);
  }

  /* =======================================================================
     BOOT
     ===================================================================== */
  function boot() {
    injectTrigger();
    initProgress();
    initStickyCta();
    initAnchors();
    initTop();
    initMeta();
    w.addEventListener('scroll', onScroll, { passive: true });
    w.addEventListener('resize', onScroll, { passive: true });
    onScroll();
    setTimeout(progressGuard, 0);

    /* The React homepage swaps out #root; re-run the DOM-dependent bits. */
    var r = d.getElementById('root');
    if (r && w.MutationObserver) {
      var t;
      new MutationObserver(function () {
        clearTimeout(t);
        t = setTimeout(function () { injectTrigger(); initAnchors(); }, 150);
      }).observe(r, { childList: true, subtree: true });
    }
  }

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot);
  else boot();

  w.YGSite = { openPalette: function () { Palette.open(); } };
})();
