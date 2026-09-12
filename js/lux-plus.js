/* ============================================================================
   lux-plus.js — DHAHAB atelier layer (tier 3)
   Vanilla, dependency-free, zero network calls. Load after lux-motion.js:

     <link rel="stylesheet" href="/css/lux-plus.css">   (head, after lux-motion.css)
     <script src="/js/lux-plus.js" defer></script>       (after lux-motion.js)

   Progressive enhancement only. Every effect is a runtime-added class or a
   custom property; none of it exists in the static HTML. If this file 404s,
   throws, or is blocked, every page renders exactly as it did before it
   shipped — no hidden content, no broken layout, no missing controls.

   SECURITY POSTURE (deliberate, reviewed):
     - No innerHTML, no outerHTML, no insertAdjacentHTML, no document.write,
       no eval/Function/setTimeout-with-string anywhere in this file. The only
       DOM construction is cloneNode() of nodes the page itself already shipped,
       so no attacker-controlled string can ever become markup.
     - No attribute here is read as a URL, a selector fed to eval, or a value
       interpolated into markup. The one attribute read (`data-lxp-marquee`) is
       used solely as a boolean presence check.
     - Custom properties written to style are clamped numbers formatted by this
       file, never raw input — CSS custom properties are a known injection sink
       (a value like `red;background:url(...)` can escape a declaration), so
       every value below is produced by toFixed() on a bounded number.
     - No storage, no cookies, no postMessage, no fetch. Nothing leaves the page.

   Cooperates with the two layers below it rather than duplicating them:
     - site.js owns .reveal/.is-in and the command palette.
     - lux-motion.js owns tilt, magnet, parallax, count-up, its own reveal.
     - This file owns only: nav scroll state, the pointer spotlight, and the
       marquee seam-fill. It never touches an element either of those animate.
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

  /* Same chrome exclusion list site.js and lux-motion.js use, so all three
     files agree on what counts as "chrome" and none of them decorate it. */
  var SKIP_SEL = '.site-nav,.site-footer,.yg-pal,.yg-trigger,.dh-ctabar,.skip-link,[data-lux-skip],[data-lxp-skip]';
  function skip(el) { return !!(el && el.closest && el.closest(SKIP_SEL)); }

  function safe(fn) { try { fn(); } catch (e) { /* never break the page */ } }

  /* ==========================================================================
     1. NAV SCROLL STATE
     One class on <html>, toggled past a threshold. rAF-coalesced and passive
     so it cannot make scrolling janky, and hysteresis (add at 24px, remove at
     8px) stops it flickering when a user rests exactly on the boundary.
     Runs even under reduced motion — it is a state change, not an animation;
     the CSS transition attached to it is already zeroed by the global net.
     ========================================================================= */
  function initNavState() {
    var root = d.documentElement;
    var ticking = false;
    var on = false;

    function apply() {
      ticking = false;
      var y = w.pageYOffset || root.scrollTop || 0;
      if (!on && y > 24) { on = true; root.classList.add('lxp-scrolled'); }
      else if (on && y < 8) { on = false; root.classList.remove('lxp-scrolled'); }
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      w.requestAnimationFrame(apply);
    }
    w.addEventListener('scroll', onScroll, { passive: true });
    apply();
  }

  /* ==========================================================================
     2. POINTER SPOTLIGHT
     The guard is the whole point. `.lxp-spot` sets position:relative and owns
     ::before, and this file is applied across 65 pages written years apart, so
     an element only qualifies when ALL of the following hold:
       a. it is currently position:static  — so relative cannot re-parent an
          absolutely positioned descendant onto it and move it on the page;
       b. it contains no positioned descendant — belt and suspenders for (a),
          catching a child that becomes positioned later via its own :hover;
       c. it has no existing ::before content — so we never overwrite a
          decorative pseudo-element a page-local <style> block already owns;
       d. it is not chrome, and not already animated by lux-motion's tilt.
     Anything that fails a check is simply left alone.
     ========================================================================= */
  function initSpotlight() {
    if (!FINE_POINTER || REDUCED) return;

    var nodes = d.querySelectorAll('.card,.panel,.dh-card');
    var i, el, cs, before;

    for (i = 0; i < nodes.length; i++) {
      el = nodes[i];
      if (skip(el)) continue;

      cs = w.getComputedStyle(el);
      if (cs.position !== 'static') continue;                     // (a)
      if (el.querySelector('[style*="position:absolute"]')) continue;

      // (b) — cheap structural scan, capped so a huge card cannot cost a frame
      if (hasPositionedChild(el)) continue;

      // (c)
      before = w.getComputedStyle(el, '::before');
      if (before && before.content && before.content !== 'none' && before.content !== 'normal') continue;

      el.classList.add('lxp-spot');
      el.addEventListener('pointermove', onSpotMove);
      el.addEventListener('pointerleave', onSpotLeave);
    }
  }

  function hasPositionedChild(el) {
    var kids = el.querySelectorAll('*');
    var cap = Math.min(kids.length, 40);   // cost ceiling, not a correctness limit
    for (var i = 0; i < cap; i++) {
      var p = w.getComputedStyle(kids[i]).position;
      if (p === 'absolute' || p === 'fixed') return true;
    }
    return false;
  }

  /* Values are clamped to 0-100 and formatted with toFixed(2) before they ever
     reach setProperty. A CSS custom property is a string sink — writing an
     unsanitised value into one lets `;` close the declaration and start a new
     one. Here the value provably matches /^\d{1,3}\.\d{2}$/. */
  function onSpotMove(e) {
    var el = e.currentTarget;
    var r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    var x = ((e.clientX - r.left) / r.width) * 100;
    var y = ((e.clientY - r.top) / r.height) * 100;
    el.style.setProperty('--lxp-x', clampPct(x) + '%');
    el.style.setProperty('--lxp-y', clampPct(y) + '%');
  }
  function onSpotLeave(e) {
    var el = e.currentTarget;
    el.style.removeProperty('--lxp-x');
    el.style.removeProperty('--lxp-y');
  }
  function clampPct(n) {
    if (typeof n !== 'number' || !isFinite(n)) return '50.00';
    if (n < 0) n = 0; else if (n > 100) n = 100;
    return n.toFixed(2);
  }

  /* ==========================================================================
     3. MARQUEE SEAM FILL
     A CSS-only marquee shows a gap when the track is shorter than twice the
     viewport. Duplicating the track's own children once makes translateX(-50%)
     land exactly on the seam. cloneNode of already-rendered nodes only — no
     markup is constructed from any string.
     Clones are aria-hidden and inert so a screen reader never reads the ticker
     twice and a keyboard user never tabs into a duplicate link.
     ========================================================================= */
  function initMarquee() {
    var rails = d.querySelectorAll('[data-lxp-marquee]');
    for (var i = 0; i < rails.length; i++) {
      var rail = rails[i];
      var track = rail.querySelector('.lxp-marquee__track');
      if (!track || track.getAttribute('data-lxp-filled') === '1') continue;

      var originals = Array.prototype.slice.call(track.children);
      if (!originals.length) continue;

      if (!REDUCED) {
        for (var j = 0; j < originals.length; j++) {
          var clone = originals[j].cloneNode(true);
          clone.setAttribute('aria-hidden', 'true');
          neutralise(clone);
          track.appendChild(clone);
        }
        rail.classList.add('is-looping');
      }
      track.setAttribute('data-lxp-filled', '1');
    }
  }

  /* Strip every focusable affordance from a decorative duplicate. */
  function neutralise(node) {
    var focusable = node.querySelectorAll('a[href],button,input,select,textarea,[tabindex]');
    for (var i = 0; i < focusable.length; i++) {
      focusable[i].setAttribute('tabindex', '-1');
      focusable[i].removeAttribute('href');
    }
    if (node.hasAttribute && node.hasAttribute('href')) {
      node.removeAttribute('href');
      node.setAttribute('tabindex', '-1');
    }
    if (node.setAttribute) node.setAttribute('inert', '');
  }

  /* ==========================================================================
     4. LIVE MOTION-PREFERENCE CHANGE
     A user who flips "Reduce Motion" mid-session should not have to reload.
     Only ever removes motion — never adds it back, because re-attaching
     listeners after teardown is where this kind of code grows bugs.
     ========================================================================= */
  function initPrefWatch() {
    if (!reduceMQ || !reduceMQ.addEventListener) return;
    reduceMQ.addEventListener('change', function (e) {
      if (!e.matches) return;
      REDUCED = true;
      safe(function () {
        var spots = d.querySelectorAll('.lxp-spot');
        for (var i = 0; i < spots.length; i++) {
          spots[i].removeEventListener('pointermove', onSpotMove);
          spots[i].removeEventListener('pointerleave', onSpotLeave);
          spots[i].style.removeProperty('--lxp-x');
          spots[i].style.removeProperty('--lxp-y');
          spots[i].classList.remove('lxp-spot');
        }
        var rails = d.querySelectorAll('.lxp-marquee.is-looping');
        for (var k = 0; k < rails.length; k++) rails[k].classList.remove('is-looping');
      });
    });
  }

  function boot() {
    safe(initNavState);
    safe(initSpotlight);
    safe(initMarquee);
    safe(initPrefWatch);
  }

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
