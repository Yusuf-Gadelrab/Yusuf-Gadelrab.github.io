/* ============================================================================
   AURUM · TABLE — fine-dining reservation surface.

   Mirrors the atelier.js contract exactly: identity, searchFields, facets
   declared as DATA, sorts, deterministic data, and a card() built from system
   classes only.

   Every restaurant, chef, district and accolade below is invented. There is no
   reference to any real venue or any real dining guide — the in-world accolade
   is the fictional "Aurum Laurel", awarded by this fictional platform.
   ========================================================================== */
(function () {
  'use strict';
  const A = window.Aurum, U = A.util, esc = U.esc, money = U.money;

  const CUISINE = ['Modern Coastal', 'Neo-Kaiseki', 'Levantine', 'Alpine', 'Nordic Root',
    'Andalusian', 'Creole Fine', 'Cantonese Modern', 'Piedmontese', 'Vegetal'];
  const DISTRICT = ['Verrine Quarter', 'Old Salt Row', 'Lantern Hill', 'The Embankment',
    'Marbury Green', 'Cassin Docks', 'Highfield', 'Nocturne Lane'];
  const BAND = ['$$', '$$$', '$$$$', '$$$$$'];
  const DIET = ['Vegetarian', 'Vegan', 'Gluten-free', 'Halal', 'Kosher'];
  const SETTING = ['Rooftop', 'Cellar', 'Garden', 'Counter', 'Conservatory', 'Dining room'];
  const OCCASION = ['Anniversary', 'Business', 'Celebration', 'Quiet dinner', 'Group table'];
  const STYLE = ['Tasting menu', 'À la carte', 'Omakase', 'Chef\'s table', 'Prix fixe'];
  const BOOKING = ['Same day', 'Within a week', '30 days out', '90 days out'];

  const FIRST = ['Maison', 'Casa', 'The', 'Villa', 'Auberge', 'Salon', 'Table'];
  const NAME = ['Verrine', 'Aubade', 'Solenne', 'Kestrel', 'Marbury', 'Nocturne', 'Halcyon',
    'Cassin', 'Orvieto', 'Lumen', 'Sable', 'Perrine', 'Thistle', 'Ombra', 'Nerine'];
  const SUFFIX = ['', '', '', ' & Co.', ' House', ' No. 9', ' Room', ' Twelve'];

  // Spend is driven by service style and price band, then jittered — so the
  // range filter sees a realistic, clustered distribution rather than noise.
  const STYLE_BASE = { 'Tasting menu': 165, 'À la carte': 85, Omakase: 195,
    'Chef\'s table': 240, 'Prix fixe': 110 };
  const BAND_MULT = { '$$': 0.55, '$$$': 0.9, '$$$$': 1.35, '$$$$$': 2.1 };

  function build(n) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const id = 'tbl-' + i;
      const r = U.rng(id);
      const style = STYLE[Math.floor(r() * STYLE.length)];
      // Long-format menus skew to the upper bands; à la carte skews down.
      const bandRoll = r() + (style === 'À la carte' ? -0.22 : 0) +
        (style === 'Chef\'s table' || style === 'Omakase' ? 0.2 : 0);
      const band = BAND[Math.max(0, Math.min(BAND.length - 1,
        Math.floor(Math.max(0, Math.min(0.999, bandRoll)) * BAND.length)))];
      const spend = Math.round((STYLE_BASE[style] * BAND_MULT[band] * (0.8 + r() * 0.5)) / 5) * 5;

      const diets = DIET.filter(function () { return r() > 0.55; });
      const setting = SETTING[Math.floor(r() * SETTING.length)];
      const rating = Math.round((3.5 + r() * 1.5) * 10) / 10;

      out.push({
        id: id,
        title: (function () {
          const pre = r() > 0.45 ? FIRST[Math.floor(r() * FIRST.length)] + ' ' : '';
          return pre + NAME[Math.floor(r() * NAME.length)] +
            SUFFIX[Math.floor(r() * SUFFIX.length)];
        })(),
        chef: 'Chef ' + NAME[Math.floor(r() * NAME.length)],
        cuisine: CUISINE[Math.floor(r() * CUISINE.length)],
        district: DISTRICT[Math.floor(r() * DISTRICT.length)],
        band: band,
        diets: diets.length ? diets : ['Vegetarian'],
        setting: setting,
        occasion: OCCASION[Math.floor(r() * OCCASION.length)],
        style: style,
        booking: BOOKING[Math.floor(r() * BOOKING.length)],
        seats: 14 + Math.floor(r() * 90),
        price: spend,
        rating: rating,
        reviews: 12 + Math.floor(r() * 400),
        year: 2019 + Math.floor(r() * 8),
        walkins: r() > 0.62,
        counter: setting === 'Counter' || r() > 0.8,
        laurel: rating >= 4.6 && r() > 0.5,
      });
    }
    return out;
  }

  A.register({
    key: 'table',
    nav: 'Table',
    title: 'Table',
    blurb: 'Invented restaurants across an invented city. Twelve facets, live counts, and a ' +
           'shareable URL for whatever combination you settle on.',
    noun: 'restaurants',
    searchFields: ['title', 'cuisine', 'district', 'chef', 'style', 'setting'],
    defaultSort: 'relevance',
    sorts: ['relevance', 'price-asc', 'price-desc', 'rating-desc', 'newest', 'title-asc'],
    facets: [
      { key: 'cui', label: 'Cuisine', kind: 'terms', field: 'cuisine', values: CUISINE },
      { key: 'dis', label: 'District', kind: 'terms', field: 'district', values: DISTRICT },
      { key: 'bnd', label: 'Price band', kind: 'terms', field: 'band', values: BAND },
      { key: 'diet', label: 'Dietary options', kind: 'terms', field: 'diets', values: DIET },
      { key: 'set', label: 'Setting', kind: 'terms', field: 'setting', values: SETTING },
      { key: 'occ', label: 'Occasion', kind: 'terms', field: 'occasion', values: OCCASION },
      { key: 'sty', label: 'Service style', kind: 'terms', field: 'style', values: STYLE },
      { key: 'bk', label: 'Booking window', kind: 'terms', field: 'booking', values: BOOKING },
      { key: 'rat', label: 'Rating', kind: 'atleast', field: 'rating', values: [3.5, 4, 4.5, 4.8] },
      { key: 'spend', label: 'Max spend per head', kind: 'range', field: 'price', min: 40, max: 700, step: 10, format: 'money' },
      { key: 'walk', label: 'Accepts walk-ins', kind: 'toggle', field: 'walkins' },
      { key: 'cnt', label: 'Chef\'s counter', kind: 'toggle', field: 'counter' },
    ],
    data: build(300),
    card: function (it) {
      return '<article class="a-card">' +
        '<div class="a-card-media">' + A.art(it.id, 'facets') +
          (it.style === 'Tasting menu' ? '<span class="a-badge">Tasting menu</span>'
            : it.laurel ? '<span class="a-badge">Aurum Laurel</span>' : '') +
        '</div>' +
        '<div class="a-card-body">' +
          '<div class="a-eyebrow" style="margin-bottom:6px">' + esc(it.chef) + '</div>' +
          '<h3>' + esc(it.title) + '</h3>' +
          '<p class="a-sub">' + esc(it.cuisine) + ' · ' + esc(it.district) + '</p>' +
          '<p class="a-sub a-faint">' + esc(it.style) + ' · ' + esc(it.setting) + ' · ' +
            esc(it.booking) + '</p>' +
          '<div class="a-card-foot">' +
            '<span class="a-price">' + money(it.price) + ' pp</span>' +
            '<span class="a-rating"><svg viewBox="0 0 24 24"><path d="M12 2l3 6.6 7 .7-5.2 4.8 1.5 7L12 17.6 5.7 21l1.5-7L2 9.3l7-.7z"/></svg>' +
              it.rating.toFixed(1) + ' <span class="a-faint">(' + it.reviews + ')</span></span>' +
          '</div>' +
        '</div></article>';
    },
  });
})();
