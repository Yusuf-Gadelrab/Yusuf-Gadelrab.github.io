/* ============================================================================
   AURUM · ATELIER — retail surface. REFERENCE MODULE.

   This file is the contract every other surface follows:
     key / nav / title / blurb / noun   — identity
     searchFields                       — which fields free-text search scans
     facets[]                           — declared as DATA; core.js does the work
     sorts / defaultSort
     data[]                             — generated deterministically at load
     card(item)                         — one result card, using system classes only

   All names, houses, prices and ratings are fictional. Nothing here refers to a
   real brand or product — the point is the engine and the design system.
   ========================================================================== */
(function () {
  'use strict';
  const A = window.Aurum, U = A.util, esc = U.esc, money = U.money;

  const HOUSES = ['MaisonVell', 'Corvane', 'Atelier Sud', 'Rive & Noor', 'Halcyon',
    'Duvall Frères', 'Serein', 'Обри Atelier'.replace('Обри ', 'Aubry '), 'Lorenne', 'Vasque'];
  const CATEGORY = ['Outerwear', 'Knitwear', 'Tailoring', 'Leather goods', 'Footwear', 'Accessories'];
  const MATERIAL = ['Cashmere', 'Merino', 'Calfskin', 'Suede', 'Silk', 'Linen', 'Shearling', 'Wool flannel'];
  const COLOR = ['Obsidian', 'Bone', 'Camel', 'Ink', 'Moss', 'Oxblood', 'Fog', 'Champagne'];
  const ORIGIN = ['Italy', 'France', 'Japan', 'Portugal', 'Scotland'];
  const SIZES = ['XS', 'S', 'M', 'L', 'XL'];

  const ADJ = ['Draped', 'Unstructured', 'Double-faced', 'Hand-finished', 'Raw-edge',
    'Bias-cut', 'Boxy', 'Longline', 'Padded', 'Cropped'];
  const NOUN = { Outerwear: ['Overcoat', 'Parka', 'Trench', 'Bomber', 'Peacoat'],
    Knitwear: ['Crewneck', 'Cardigan', 'Roll-neck', 'Vest'],
    Tailoring: ['Blazer', 'Trouser', 'Suit', 'Waistcoat'],
    'Leather goods': ['Holdall', 'Tote', 'Belt', 'Card case', 'Weekender'],
    Footwear: ['Derby', 'Chelsea boot', 'Loafer', 'Trainer'],
    Accessories: ['Scarf', 'Glove', 'Beanie', 'Sunglasses'] };

  function build(n) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const id = 'atl-' + i;
      const r = U.rng(id);
      const cat = CATEGORY[Math.floor(r() * CATEGORY.length)];
      const nouns = NOUN[cat];
      const house = HOUSES[Math.floor(r() * HOUSES.length)];
      const mat = MATERIAL[Math.floor(r() * MATERIAL.length)];
      // Price scales with category and material so the range filter has a real
      // distribution rather than uniform noise.
      const base = { Outerwear: 900, Knitwear: 420, Tailoring: 780, 'Leather goods': 640,
        Footwear: 520, Accessories: 180 }[cat];
      const lux = mat === 'Cashmere' || mat === 'Shearling' ? 1.9 : mat === 'Silk' ? 1.4 : 1;
      const price = Math.round((base * lux * (0.7 + r() * 1.5)) / 10) * 10;
      const rating = Math.round((3.4 + r() * 1.6) * 10) / 10;
      const sizes = SIZES.filter(function () { return r() > 0.28; });
      out.push({
        id: id,
        title: ADJ[Math.floor(r() * ADJ.length)] + ' ' + nouns[Math.floor(r() * nouns.length)],
        house: house,
        category: cat,
        material: mat,
        color: COLOR[Math.floor(r() * COLOR.length)],
        origin: ORIGIN[Math.floor(r() * ORIGIN.length)],
        sizes: sizes.length ? sizes : ['M'],
        price: price,
        rating: rating,
        reviews: 4 + Math.floor(r() * 260),
        year: 2023 + Math.floor(r() * 4),
        exclusive: r() > 0.82,
        sustainable: r() > 0.66,
      });
    }
    return out;
  }

  A.register({
    key: 'atelier',
    nav: 'Atelier',
    title: 'Atelier',
    blurb: 'Ready-to-wear and leather goods from fictional houses. Ten facets, live counts, ' +
           'and a shareable URL for every combination you land on.',
    noun: 'pieces',
    searchFields: ['title', 'house', 'material', 'color', 'category'],
    defaultSort: 'relevance',
    sorts: ['relevance', 'price-asc', 'price-desc', 'rating-desc', 'newest', 'title-asc'],
    facets: [
      { key: 'cat', label: 'Category', kind: 'terms', field: 'category', values: CATEGORY },
      { key: 'house', label: 'House', kind: 'terms', field: 'house', values: HOUSES },
      { key: 'mat', label: 'Material', kind: 'terms', field: 'material', values: MATERIAL },
      { key: 'col', label: 'Colour', kind: 'terms', field: 'color', values: COLOR },
      { key: 'size', label: 'Size', kind: 'terms', field: 'sizes', values: SIZES },
      { key: 'org', label: 'Made in', kind: 'terms', field: 'origin', values: ORIGIN },
      { key: 'price', label: 'Max price', kind: 'range', field: 'price', min: 100, max: 4000, step: 50, format: 'money' },
      { key: 'rat', label: 'Rating', kind: 'atleast', field: 'rating', values: [3, 3.5, 4, 4.5] },
      { key: 'exc', label: 'Exclusive to Aurum', kind: 'toggle', field: 'exclusive' },
      { key: 'sus', label: 'Responsibly sourced', kind: 'toggle', field: 'sustainable' },
    ],
    data: build(420),
    card: function (it) {
      return '<article class="a-card">' +
        '<div class="a-card-media">' + A.art(it.id, 'arcs') +
          (it.exclusive ? '<span class="a-badge">Exclusive</span>' : '') +
        '</div>' +
        '<div class="a-card-body">' +
          '<div class="a-eyebrow" style="margin-bottom:6px">' + esc(it.house) + '</div>' +
          '<h3>' + esc(it.title) + '</h3>' +
          '<p class="a-sub">' + esc(it.material) + ' · ' + esc(it.color) + ' · ' + esc(it.origin) + '</p>' +
          '<div class="a-card-foot">' +
            '<span class="a-price">' + money(it.price) + '</span>' +
            '<span class="a-rating"><svg viewBox="0 0 24 24"><path d="M12 2l3 6.6 7 .7-5.2 4.8 1.5 7L12 17.6 5.7 21l1.5-7L2 9.3l7-.7z"/></svg>' +
              it.rating.toFixed(1) + ' <span class="a-faint">(' + it.reviews + ')</span></span>' +
          '</div>' +
        '</div></article>';
    },
  });
})();
