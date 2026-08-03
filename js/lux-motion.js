/* ============================================================================
   lux-motion.js — DHAHAB shared luxury motion layer
   Vanilla, dependency-free, no network calls. Load on a page after site.js:

     <link rel="stylesheet" href="/css/lux-motion.css">      (in <head>, after site.css)
     <script src="/js/lux-motion.js" defer></script>          (after site.js, before </body>)

   Progressive enhancement only: every effect adds classes or inline transform/
   opacity/transition-delay at runtime. Nothing here is present in the static
   HTML, so if this file 404s or throws, the page renders exactly as if it had
   never been linked — no hidden content, no broken layout.

   Plays deliberately nice with site.js instead of duplicating it:
     - site.js already reveals .card/.panel/h2/h3/.grid>div/img via its own
       .reveal/.is-in system with its own IntersectionObserver. This file
       never re-reveals those elements — it only ever ADDS a transition-delay
       utility class (.lux-d1..d6) to stagger the ones site.js is already
       fading in, grouped by shared parent.
     - This file's OWN reveal system (.lux-reveal/.lux-in, own observer)
       targets what site.js does not: <section> wrappers and opt-in
       [data-lux-reveal] elements.
     - Card tilt / magnetic buttons / parallax / count-up / smooth-anchor are
       new, so they're fully owned here.

   Every motion effect is gated on prefers-reduced-motion at boot — none of
   the classes/listeners below are ever attached for a reduced-motion user;
   the plain static (already-correct) markup is what they see.
   ========================================================================= */
(function () {
  'use strict';
  if (typeof document === 'undefined') return;

  var d = document;
  var w = window;

  var reduceMQ = w.matchMedia ? w.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var REDUCED = !!(reduceMQ && reduceMQ.matches);
  var fineMQ = w.matchMedia ? w.matchMedia('(hover: hover) and (pointer: fine)') : null;
  var FINE_POINTER = !!(fineMQ && fineMQ.matches);

  /* Elements/regions this file never touches — nav, footer, the command
     palette and its trigger, the sticky CTA bar, copy-link buttons. Matches
     site.js's own exclusion list so the two files agree on what "chrome"
     means on this site. */
  var SKIP_SEL = '.site-nav, .site-footer, .yg-pal, .yg-cmd, .yg-cta-bar, .yg-anchor, .skip-link';
  function skip(el) { return !!(el && el.closest && el.closest(SKIP_SEL)); }

  var scope = d.querySelector('main') || d.body;

  /* =======================================================================
     1. SCROLL REVEAL — sections + opt-in [data-lux-reveal]
     ===================================================================== */
  function initReveal() {
    var io = w.IntersectionObserver
      ? new IntersectionObserver(onIntersect, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 })
      : null;

    function onIntersect(entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          entries[i].target.classList.add('lux-in');
          io.unobserve(entries[i].target);
        }
      }
    }

    function reveal(el, delayMs) {
      if (!el || el.classList.contains('lux-reveal')) return;
      el.classList.add('lux-reveal');
      if (delayMs) el.style.transitionDelay = delayMs + 'ms';
      if (io) io.observe(el);
      else el.classList.add('lux-in'); /* no IO support: show immediately */
    }

    /* Auto-target <section>s inside the content scope. Skip the first one —
       it's almost always the hero, already above the fold at load, and
       fading it in would just be a flash of invisible content on first
       paint for zero benefit. */
    var sections = scope.querySelectorAll('section');
    for (var i = 1; i < sections.length; i++) {
      var s = sections[i];
      if (skip(s) || s.hasAttribute('data-lux-reveal')) continue;
      reveal(s, 0);
    }

    /* Opt-in. data-lux-reveal="stagger" reveals the element's direct children
       in sequence instead of the container itself — for hand-marked grids
       that want a cascade without waiting on the .reveal/.grid>div heuristic. */
    var optIn = scope.querySelectorAll('[data-lux-reveal]');
    for (var j = 0; j < optIn.length; j++) {
      var el = optIn[j];
      if (skip(el)) continue;
      if (el.getAttribute('data-lux-reveal') === 'stagger') {
        var kids = el.children;
        for (var k = 0; k < kids.length; k++) reveal(kids[k], Math.min(k, 5) * 90);
      } else {
        reveal(el, 0);
      }
    }
  }

  /* =======================================================================
     2. STAGGER for elements site.js ALREADY reveals (.reveal). Adds only a
        transition-delay class, grouped by shared parent — never touches
        opacity/transform, so it can't fight site.js's own transition.
     ===================================================================== */
  function initStagger() {
    var els = scope.querySelectorAll('.reveal');
    var parents = [];
    var buckets = [];
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (skip(el)) continue;
      var p = el.parentElement;
      if (!p) continue;
      var idx = parents.indexOf(p);
      if (idx === -1) { parents.push(p); buckets.push([el]); }
      else buckets[idx].push(el);
    }
    for (var b = 0; b < buckets.length; b++) {
      var group = buckets[b];
      if (group.length < 2) continue; /* nothing to stagger against */
      for (var g = 0; g < group.length; g++) {
        group[g].classList.add('lux-d' + ((g % 6) + 1));
      }
    }
  }

  /* =======================================================================
     3. CARD HOVER TILT — perspective tilt, max ~4deg either axis
     ===================================================================== */
  function initTilt() {
    var cards = scope.querySelectorAll('.card');
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      if (skip(card)) continue;
      card.classList.add('lux-tilt');
      card.addEventListener('pointerenter', tiltEnter, { passive: true });
      card.addEventListener('pointermove', tiltMove, { passive: true });
      card.addEventListener('pointerleave', tiltLeave, { passive: true });
    }
    function tiltEnter(e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      this.style.transitionDuration = '0s';
    }
    function tiltMove(e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      var r = this.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width;
      var py = (e.clientY - r.top) / r.height;
      var ry = Math.max(-4, Math.min(4, (px - 0.5) * 8));
      var rx = Math.max(-4, Math.min(4, (0.5 - py) * 8));
      this.style.transform =
        'perspective(700px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) +
        'deg) translateY(-4px) translateZ(0)';
    }
    function tiltLeave() {
      this.style.transitionDuration = '';
      this.style.transform = '';
    }
  }

  /* =======================================================================
     4. MAGNETIC BUTTONS — small pull toward the cursor, max ~6px
     ===================================================================== */
  function initMagnet() {
    var btns = scope.querySelectorAll('.btn');
    for (var i = 0; i < btns.length; i++) {
      var btn = btns[i];
      if (skip(btn)) continue;
      btn.classList.add('lux-magnet');
      btn.addEventListener('pointerenter', magEnter, { passive: true });
      btn.addEventListener('pointermove', magMove, { passive: true });
      btn.addEventListener('pointerleave', magLeave, { passive: true });
    }
    function magEnter(e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      this.style.transitionDuration = '0s';
    }
    function magMove(e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      var r = this.getBoundingClientRect();
      var mx = Math.max(-6, Math.min(6, ((e.clientX - r.left) / r.width - 0.5) * 12));
      var my = Math.max(-5, Math.min(5, ((e.clientY - r.top) / r.height - 0.5) * 10));
      this.style.transform = 'translate(' + mx.toFixed(1) + 'px,' + my.toFixed(1) + 'px)';
    }
    function magLeave() {
      this.style.transitionDuration = '';
      this.style.transform = '';
    }
  }

  /* =======================================================================
     5. HERO PARALLAX — opt-in [data-lux-parallax], value = speed (default .15)
        Scroll listener is only attached while a marked element is actually
        near the viewport, and removed the moment none are — passive, rAF
        throttled, translate3d only (no reflow).
     ===================================================================== */
  function initParallax() {
    var els = scope.querySelectorAll('[data-lux-parallax]');
    if (!els.length || !w.IntersectionObserver) return;
    var active = [];
    var ticking = false;

    function update() {
      ticking = false;
      for (var i = 0; i < active.length; i++) {
        var el = active[i];
        var speed = parseFloat(el.getAttribute('data-lux-parallax')) || 0.15;
        var rect = el.getBoundingClientRect();
        var center = rect.top + rect.height / 2 - w.innerHeight / 2;
        var shift = Math.max(-24, Math.min(24, center * -speed * 0.12));
        el.style.transform = 'translate3d(0,' + shift.toFixed(1) + 'px,0)';
      }
    }
    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }
    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        var t = entries[i].target;
        var idx = active.indexOf(t);
        if (entries[i].isIntersecting) { if (idx === -1) active.push(t); }
        else { if (idx !== -1) active.splice(idx, 1); t.style.transform = ''; }
      }
      if (active.length) { w.addEventListener('scroll', onScroll, { passive: true }); onScroll(); }
      else { w.removeEventListener('scroll', onScroll); }
    }, { rootMargin: '20% 0px' });
    for (var j = 0; j < els.length; j++) io.observe(els[j]);
  }

  /* =======================================================================
     6. COUNT-UP — opt-in [data-countup]. Parses the number ALREADY in the
        element's text (prefix/comma/decimal/suffix all preserved) and, on
        the final frame, snaps back to the exact original string byte-for-
        byte — so the animation can never drift the displayed figure away
        from whatever number the page actually shipped with.
     ===================================================================== */
  function initCountUp() {
    var els = scope.querySelectorAll('[data-countup]');
    if (!els.length) return;

    function animate(el) {
      var raw = el.textContent;
      var m = raw.match(/^(\D*)([\d,]*\.?\d+)(\D*)$/);
      if (!m) return; /* nothing parseable — leave the static text alone */
      var prefix = m[1], numStr = m[2], suffix = m[3];
      var target = parseFloat(numStr.replace(/,/g, ''));
      if (isNaN(target)) return;
      var hasComma = numStr.indexOf(',') !== -1;
      var decimals = (numStr.split('.')[1] || '').length;
      var dur = parseInt(el.getAttribute('data-countup-duration'), 10) || 1400;
      var start = null;

      function fmt(v) {
        var s = v.toFixed(decimals);
        if (hasComma) {
          var parts = s.split('.');
          parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          s = parts.join('.');
        }
        return prefix + s + suffix;
      }
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min(1, (ts - start) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(target * eased);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = raw; /* exact original string — zero drift */
      }
      requestAnimationFrame(step);
    }

    if (!w.IntersectionObserver) return; /* static original text is already correct */
    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          io.unobserve(entries[i].target);
          animate(entries[i].target);
        }
      }
    }, { threshold: 0.4 });
    for (var j = 0; j < els.length; j++) io.observe(els[j]);
  }

  /* =======================================================================
     7. SMOOTH ANCHOR SCROLL — corrects for the sticky nav's height.
        html{scroll-behavior:smooth} already ships site-wide, but a bare
        anchor jump can land a heading right under the sticky header. This
        is a functional offset fix rather than a motion effect, so it stays
        active even under reduced motion — it just jumps instead of easing.
     ===================================================================== */
  function initSmoothAnchor() {
    d.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a || skip(a)) return;
      var hash = a.getAttribute('href');
      if (!hash || hash.length < 2) return;
      var id;
      try { id = decodeURIComponent(hash.slice(1)); } catch (err) { return; }
      var target = id && d.getElementById(id);
      if (!target) return;
      e.preventDefault();
      var nav = d.querySelector('.site-nav');
      var navH = nav ? nav.getBoundingClientRect().height : 0;
      var top = target.getBoundingClientRect().top + w.pageYOffset - navH - 12;
      w.scrollTo({ top: Math.max(0, top), behavior: REDUCED ? 'auto' : 'smooth' });
      if (w.history && w.history.pushState) w.history.pushState(null, '', hash);
    }, { passive: false });
  }

  /* =======================================================================
     BOOT
     ===================================================================== */
  function boot() {
    if (!REDUCED) {
      initReveal();
      initStagger();
      if (FINE_POINTER) { initTilt(); initMagnet(); }
      initParallax();
      initCountUp();
    }
    initSmoothAnchor();
  }

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
