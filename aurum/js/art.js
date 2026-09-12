/* ============================================================================
   AURUM art — deterministic generated cover art.

   Every card needs an image. Stock photography would mean licensing risk on a
   public portfolio, and remote images would break the "no third-party requests"
   rule, so each card's art is drawn in SVG from a seed derived from its id.
   Same id, same art, every reload — which also means no layout flicker.
   ========================================================================== */
(function (global) {
  'use strict';
  const rng = global.Aurum.util.rng;

  // Palettes stay inside the design system: one warm accent against the surface
  // ramp, so 400 generated covers still read as one catalogue.
  const PALETTES = [
    ['#1A1A20', '#2A2A33', '#C9A961'],
    ['#131317', '#26262E', '#8E7539'],
    ['#16161B', '#2F2A24', '#E3C888'],
    ['#101014', '#242430', '#A8A498'],
    ['#181419', '#302733', '#C9A961'],
  ];

  function pick(r, arr) { return arr[Math.floor(r() * arr.length) % arr.length]; }

  const MOTIFS = {
    // concentric arcs — reads as fabric / topography
    arcs(r, p) {
      let s = '';
      const n = 4 + Math.floor(r() * 4);
      for (let i = 0; i < n; i++) {
        const cx = 20 + r() * 60, cy = 30 + r() * 50, rad = 12 + r() * 44;
        s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + rad + '" fill="none" stroke="' +
          (i === n - 1 ? p[2] : p[1]) + '" stroke-width="' + (i === n - 1 ? 1.4 : .7) + '" opacity="' +
          (0.35 + r() * 0.5).toFixed(2) + '"/>';
      }
      return s;
    },
    // stacked horizon bands — reads as architecture / landscape
    bands(r, p) {
      let s = '', y = 18;
      while (y < 96) {
        const h = 3 + r() * 13;
        s += '<rect x="0" y="' + y.toFixed(1) + '" width="100" height="' + h.toFixed(1) +
          '" fill="' + (r() > .82 ? p[2] : p[1]) + '" opacity="' + (0.25 + r() * 0.45).toFixed(2) + '"/>';
        y += h + 1.5 + r() * 5;
      }
      return s;
    },
    // angular facets — reads as gemstone / motor
    facets(r, p) {
      let s = '';
      for (let i = 0; i < 7; i++) {
        const x = r() * 100, y = 20 + r() * 60, w = 14 + r() * 34;
        s += '<path d="M' + x.toFixed(1) + ' ' + y.toFixed(1) +
          ' l' + w.toFixed(1) + ' ' + (-w * (0.3 + r() * .6)).toFixed(1) +
          ' l' + (w * .5).toFixed(1) + ' ' + (w * .8).toFixed(1) + ' z" fill="' +
          (i === 3 ? p[2] : p[1]) + '" opacity="' + (0.2 + r() * 0.45).toFixed(2) + '"/>';
      }
      return s;
    },
    // vertical rule field — reads as film / barcode
    rules(r, p) {
      let s = '';
      for (let x = 4; x < 100; x += 2.2 + r() * 4) {
        const h = 20 + r() * 66;
        s += '<rect x="' + x.toFixed(1) + '" y="' + ((100 - h) / 2).toFixed(1) +
          '" width="' + (0.6 + r() * 1.6).toFixed(1) + '" height="' + h.toFixed(1) +
          '" fill="' + (r() > .9 ? p[2] : p[1]) + '" opacity="' + (0.3 + r() * 0.5).toFixed(2) + '"/>';
      }
      return s;
    },
  };
  const KINDS = Object.keys(MOTIFS);

  /** Cover art for an item. `motif` may be forced by a module for coherence. */
  global.Aurum.art = function (seed, motif) {
    const r = rng(seed);
    const p = pick(r, PALETTES);
    const kind = motif && MOTIFS[motif] ? motif : pick(r, KINDS);
    const id = 'g' + (global.Aurum.util.hash(String(seed)) % 100000);
    return '<svg viewBox="0 0 100 125" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' + p[0] + '"/><stop offset="1" stop-color="' + p[1] + '"/>' +
      '</linearGradient></defs>' +
      '<rect width="100" height="125" fill="url(#' + id + ')"/>' +
      '<g transform="translate(0,12)">' + MOTIFS[kind](r, p) + '</g>' +
      '<rect width="100" height="125" fill="url(#' + id + ')" opacity="0.28"/>' +
      '</svg>';
  };
})(window);
