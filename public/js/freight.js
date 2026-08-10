/* DHAHAB Freight — page motion.
 *
 * Everything in here is decoration. The page is fully readable and every CTA
 * works with this file blocked, which is why nothing below creates content or
 * moves a form. One rule governs the whole file: if the visitor asked for
 * reduced motion, the animated systems never start at all — they are not
 * started and then throttled, they are skipped, so no rAF loop ever runs.
 */
(function () {
  "use strict";

  var d = document;
  var w = window;
  var root = d.querySelector(".freight");
  if (!root) return;

  var mq = w.matchMedia ? w.matchMedia("(prefers-reduced-motion: reduce)") : null;
  var REDUCED = !!(mq && mq.matches);
  var IO = w.IntersectionObserver;

  function $(sel, ctx) { return (ctx || d).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || d).querySelectorAll(sel)); }
  function raf(fn) { return (w.requestAnimationFrame || function (f) { return setTimeout(f, 16); })(fn); }

  /* ── 0. take the shared auto-reveal off anything that owns its own transform
     site.js tags every <img>/<h2>/<h3> with .reveal. On this page the hero
     layers, the rig and the map are driven by inline transforms, so the class
     would fight them for one frame. Strip it rather than out-specify it. */
  function unclaim() {
    $$(".fr-hero img, .fr-hero h1, .fr-map svg, .fr-dockband, .fr-compliance__seal, .fr-close__lion")
      .forEach(function (el) {
        el.classList.remove("reveal", "reveal-zoom", "reveal-left", "reveal-right");
        el.classList.add("is-in");
      });
  }

  /* ── 1. staggered reveals ────────────────────────────────────────────────
     One observer for the page. Delay is derived from the element's index among
     its own siblings so a grid cascades left-to-right without any hand-written
     per-card delay. */
  function reveals() {
    var items = $$("[data-fr]");
    if (REDUCED || !IO) {
      items.forEach(function (el) { el.classList.add("is-fr-in"); });
      return;
    }
    var obs = new IO(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var group = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
        var step = parseInt(el.getAttribute("data-fr-step") || "70", 10);
        el.style.setProperty("--d", Math.min(group * step, 480) + "ms");
        el.classList.add("is-fr-in");
        obs.unobserve(el);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
    items.forEach(function (el) { obs.observe(el); });
  }

  /* ── 2. hero canvas: night highway ───────────────────────────────────────
     Light streaks run out of a vanishing point and accelerate toward the
     viewer, which is what a long-exposure shot of a night interstate looks
     like. Gold going away, warm white coming toward you. */
  function highway() {
    var cv = $(".fr-hero__canvas");
    if (!cv) return;
    if (REDUCED) { cv.remove(); return; }

    var ctx = cv.getContext("2d", { alpha: true });
    if (!ctx) { cv.remove(); return; }

    var hero = $(".fr-hero");
    var W = 0, H = 0, dpr = 1, vpx = 0, vpy = 0;
    var streaks = [];
    var running = false, visible = true, frame = 0;

    function resize() {
      var r = hero.getBoundingClientRect();
      W = Math.max(1, Math.round(r.width));
      H = Math.max(1, Math.round(r.height));
      dpr = Math.min(w.devicePixelRatio || 1, 2);
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      cv.style.width = W + "px";
      cv.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      vpx = W * 0.5;
      vpy = H * 0.60;
      build();
    }

    function build() {
      var target = W < 700 ? 26 : W < 1200 ? 44 : 62;
      streaks = [];
      for (var i = 0; i < target; i++) streaks.push(spawn(Math.random()));
    }

    function spawn(seed) {
      // lanes: negative = the outbound (gold) side, positive = inbound (white)
      var side = Math.random() < 0.56 ? -1 : 1;
      var lane = (0.06 + Math.random() * 0.94) * side;
      return {
        lane: lane,
        t: seed === undefined ? 0 : seed,           // 0 at the horizon, 1 at the viewer
        v: 0.0016 + Math.random() * 0.0042,
        len: 0.05 + Math.random() * 0.13,
        gold: side < 0,
        drift: (Math.random() - 0.5) * 0.16,
        a: 0.35 + Math.random() * 0.65
      };
    }

    function project(s, t) {
      // t in [0,1]; depth curve so points bunch at the horizon like real perspective
      var k = Math.pow(t, 2.35);
      var spread = W * 0.92;
      var x = vpx + s.lane * spread * k + s.drift * W * k;
      var y = vpy + (H - vpy) * k * 1.02;
      return [x, y, k];
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      for (var i = 0; i < streaks.length; i++) {
        var s = streaks[i];
        s.t += s.v;
        if (s.t > 1.08) { streaks[i] = spawn(0); continue; }

        var head = project(s, s.t);
        var tail = project(s, Math.max(0, s.t - s.len));
        var k = head[2];
        var alpha = s.a * Math.min(1, k * 3.2) * (1 - Math.max(0, (s.t - 0.86) / 0.22));
        if (alpha <= 0.004) continue;

        var g = ctx.createLinearGradient(tail[0], tail[1], head[0], head[1]);
        if (s.gold) {
          g.addColorStop(0, "rgba(212,175,55,0)");
          g.addColorStop(0.72, "rgba(212,175,55," + (alpha * 0.55).toFixed(3) + ")");
          g.addColorStop(1, "rgba(255,236,175," + alpha.toFixed(3) + ")");
        } else {
          g.addColorStop(0, "rgba(242,237,228,0)");
          g.addColorStop(0.72, "rgba(242,237,228," + (alpha * 0.34).toFixed(3) + ")");
          g.addColorStop(1, "rgba(255,251,240," + (alpha * 0.72).toFixed(3) + ")");
        }
        ctx.strokeStyle = g;
        ctx.lineWidth = Math.max(0.6, 3.4 * k);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(tail[0], tail[1]);
        ctx.lineTo(head[0], head[1]);
        ctx.stroke();
      }
      ctx.globalCompositeOperation = "source-over";
    }

    function loop() {
      if (!running) return;
      frame = raf(loop);
      draw();
    }
    function start() { if (running || REDUCED) return; running = true; loop(); }
    function stop() { running = false; if (frame) cancelAnimationFrame(frame); }

    resize();
    var rt;
    w.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(resize, 180); }, { passive: true });
    d.addEventListener("visibilitychange", function () { (d.hidden || !visible) ? stop() : start(); });

    if (IO) {
      new IO(function (e) {
        visible = e[0].isIntersecting;
        visible && !d.hidden ? start() : stop();
      }, { threshold: 0 }).observe(hero);
    } else { start(); }
  }

  /* ── 3. parallax ─────────────────────────────────────────────────────────
     Transform-only, read in one rAF pass, so scrolling never triggers layout. */
  function parallax() {
    if (REDUCED) return;
    var nodes = $$("[data-par]").map(function (el) {
      return { el: el, k: parseFloat(el.getAttribute("data-par")) || 0 };
    });
    if (!nodes.length) return;
    var ticking = false, hero = $(".fr-hero");

    function apply() {
      ticking = false;
      var y = w.pageYOffset || d.documentElement.scrollTop || 0;
      var h = hero ? hero.offsetHeight : w.innerHeight;
      if (y > h * 1.2) return;                       // hero is gone, stop paying for it
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.el.style.transform = "translate3d(0," + (y * n.k).toFixed(2) + "px,0)";
      }
    }
    w.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; raf(apply); }
    }, { passive: true });
    apply();
  }

  /* ── 4. magnetic buttons ─────────────────────────────────────────────────
     Inline transform beats site.css's :hover lift, so the lift is folded into
     the same value instead of fighting it. */
  function magnets() {
    if (REDUCED || !w.matchMedia || !w.matchMedia("(hover: hover)").matches) return;
    $$("[data-mag]").forEach(function (el) {
      var pull = parseFloat(el.getAttribute("data-mag")) || 0.28;
      function move(e) {
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) * pull;
        var dy = (e.clientY - (r.top + r.height / 2)) * pull;
        el.style.transform = "translate3d(" + dx.toFixed(1) + "px," + (dy - 2).toFixed(1) + "px,0)";
      }
      el.addEventListener("pointerenter", move);
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
      el.addEventListener("blur", function () { el.style.transform = ""; });
    });
  }

  /* ── 5. service cards: tilt + pointer glow + icon stroke-draw ───────────── */
  function cards() {
    var list = $$(".fr-svc");
    if (!list.length) return;

    // icon draw lengths are measured, never guessed: an SVG path's length is
    // not derivable from its `d` string by eye.
    list.forEach(function (card) {
      $$("[data-draw]", card).forEach(function (p) {
        var len = 0;
        try { len = Math.ceil(p.getTotalLength()) + 2; } catch (e) { len = 400; }
        p.style.setProperty("--len", len);
      });
    });

    if (REDUCED || !IO) {
      list.forEach(function (c) { c.classList.add("is-drawn"); });
    } else {
      var obs = new IO(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          en.target.classList.add("is-drawn");
          obs.unobserve(en.target);
        });
      }, { threshold: 0.3 });
      list.forEach(function (c) { obs.observe(c); });
    }

    if (REDUCED || !w.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    list.forEach(function (card) {
      var pending = false, lx = 0, ly = 0;
      function paint() {
        pending = false;
        var r = card.getBoundingClientRect();
        var px = (lx - r.left) / r.width;
        var py = (ly - r.top) / r.height;
        card.style.setProperty("--px", (px * 100).toFixed(1) + "%");
        card.style.setProperty("--py", (py * 100).toFixed(1) + "%");
        card.style.transform =
          "perspective(1000px) rotateX(" + ((0.5 - py) * 7).toFixed(2) +
          "deg) rotateY(" + ((px - 0.5) * 9).toFixed(2) + "deg) translate3d(0,-4px,0)";
      }
      card.addEventListener("pointermove", function (e) {
        lx = e.clientX; ly = e.clientY;
        if (!pending) { pending = true; raf(paint); }
      });
      card.addEventListener("pointerleave", function () { card.style.transform = ""; });
    });
  }

  /* ── 6. lane map: draw the arcs, then run a load along each one ─────────── */
  function lanes() {
    var map = $(".lanemap");
    if (!map) return;
    var arcs = $$(".lane__arc", map);
    var pulses = $$(".lane__pulse", map);
    if (!arcs.length) return;

    var lens = arcs.map(function (p) {
      var l = 900;
      try { l = Math.ceil(p.getTotalLength()); } catch (e) {}
      p.style.setProperty("--len", l);
      return l;
    });

    var wrap = $(".fr-map") || map;
    if (REDUCED || !IO) { wrap.classList.add("is-lanes-in"); return; }

    var live = false, id = 0, t0 = 0;
    function tick(ts) {
      if (!live) return;
      id = raf(tick);
      if (!t0) t0 = ts;
      var el = (ts - t0) / 1000;
      for (var i = 0; i < pulses.length; i++) {
        var path = arcs[i]; if (!path) continue;
        var L = lens[i];
        var speed = 130 + (i % 4) * 26;                       // px of path per second
        var pos = ((el * speed) + (i * L) / 3.3) % L;
        var pt;
        try { pt = path.getPointAtLength(pos); } catch (e) { continue; }
        pulses[i].setAttribute("cx", pt.x.toFixed(1));
        pulses[i].setAttribute("cy", pt.y.toFixed(1));
      }
    }

    new IO(function (e) {
      if (e[0].isIntersecting) {
        wrap.classList.add("is-lanes-in");
        if (!live) { live = true; t0 = 0; id = raf(tick); }
      } else if (live) { live = false; cancelAnimationFrame(id); }
    }, { threshold: 0.16 }).observe(wrap);

    d.addEventListener("visibilitychange", function () {
      if (d.hidden && live) { live = false; cancelAnimationFrame(id); }
      else if (!d.hidden && wrap.classList.contains("is-lanes-in") && !live) { live = true; t0 = 0; id = raf(tick); }
    });
  }

  /* ── 7. process timeline: a progress line tied to scroll position ───────── */
  function timeline() {
    var proc = $(".fr-proc");
    if (!proc) return;
    var fill = $(".fr-proc__fill", proc);
    var steps = $$(".fr-step", proc);
    if (!fill) return;
    if (REDUCED) {
      fill.style.setProperty("--p", 1);
      steps.forEach(function (s) { s.classList.add("is-lit"); });
      return;
    }
    var ticking = false;
    function apply() {
      ticking = false;
      var r = proc.getBoundingClientRect();
      var line = w.innerHeight * 0.62;                 // the reading line
      var p = (line - r.top) / Math.max(1, r.height);
      p = Math.max(0, Math.min(1, p));
      fill.style.setProperty("--p", p.toFixed(4));
      for (var i = 0; i < steps.length; i++) {
        var sr = steps[i].getBoundingClientRect();
        steps[i].classList.toggle("is-lit", sr.top < line);
      }
    }
    w.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; raf(apply); }
    }, { passive: true });
    w.addEventListener("resize", apply, { passive: true });
    apply();
  }

  /* ── 8. anchor scroll that also moves keyboard focus ─────────────────────
     html{scroll-behavior:smooth} already animates the scroll; what it does not
     do is move focus, so a keyboard user lands back at the top of the document
     on the next Tab. */
  function anchors() {
    d.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#" || id.length < 2) return;
      var target = d.getElementById(id.slice(1));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "start" });
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      if (history.replaceState) history.replaceState(null, "", id);
    });
  }

  function boot() {
    unclaim();
    reveals();
    highway();
    parallax();
    magnets();
    cards();
    lanes();
    timeline();
    anchors();
  }

  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
