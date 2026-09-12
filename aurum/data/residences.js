/* ============================================================================
   AURUM · RESIDENCES — luxury stays surface.

   Same contract as atelier.js: identity, searchFields, facets declared as DATA,
   sorts, deterministic data, and a card() built from system classes only.

   Every place, house and host here is invented. No real property, destination
   brand, operator or person is referenced — the point is the facet engine and
   the design system, not a booking catalogue.
   ========================================================================== */
(function () {
  'use strict';
  const A = window.Aurum, U = A.util, esc = U.esc, money = U.money;

  const REGION = ['Costa Ilara', 'Vantre Coast', 'Isle of Merrow', 'Alderhorn Alps',
    'Sorrel Valley', 'Kaimana Atoll', 'Northmere Fjords', 'Palua Highlands'];
  const TYPE = ['Villa', 'Chalet', 'Penthouse', 'Estate', 'Overwater suite',
    'Riad', 'Lodge', 'Loft'];
  const BEDROOMS = ['Studio', '1', '2', '3', '4', '5', '6+'];
  const VIEW = ['Ocean', 'Mountain', 'Vineyard', 'Skyline', 'Lagoon', 'Forest', 'Harbour'];
  const STYLE = ['Modernist', 'Heritage', 'Coastal minimal', 'Alpine timber',
    'Moorish', 'Art deco', 'Pavilion'];
  const AMENITY = ['Infinity pool', 'Private chef', 'Spa', 'Screening room', 'Wine cellar',
    'Helipad', 'Gym', 'Sauna', 'Private beach', 'Tennis court'];
  const BOARD = ['Room only', 'Breakfast included', 'Half board', 'Full staff'];

  const FIRST = ['Solenne', 'Verrine', 'Halcyon', 'Marenne', 'Oravel', 'Caldera',
    'Ilaria', 'Thessen', 'Nordvik', 'Palua', 'Serein', 'Aubry', 'Vantre', 'Merrow',
    'Cassine', 'Lumen', 'Orenda', 'Sable'];
  const SECOND = ['House', 'Residence', 'Retreat', 'Pavilion', 'Terrace', 'Refuge',
    'Quarters', 'Rooms'];

  // Regional multipliers: atolls and alpine tops price above valley stays, so the
  // range slider lands on a shaped distribution rather than uniform noise.
  const REGION_MULT = { 'Costa Ilara': 1.15, 'Vantre Coast': 1.25, 'Isle of Merrow': 1.0,
    'Alderhorn Alps': 1.35, 'Sorrel Valley': 0.8, 'Kaimana Atoll': 1.6,
    'Northmere Fjords': 0.95, 'Palua Highlands': 0.85 };
  const TYPE_BASE = { Villa: 720, Chalet: 640, Penthouse: 880, Estate: 1500,
    'Overwater suite': 1100, Riad: 380, Lodge: 300, Loft: 260 };
  const VIEW_MULT = { Ocean: 1.18, Lagoon: 1.22, Skyline: 1.1, Vineyard: 1.05,
    Mountain: 1.08, Harbour: 1.0, Forest: 0.94 };

  function build(n) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const id = 'res-' + i;
      const r = U.rng(id);
      const region = REGION[Math.floor(r() * REGION.length)];
      const type = TYPE[Math.floor(r() * TYPE.length)];
      const view = VIEW[Math.floor(r() * VIEW.length)];
      const style = STYLE[Math.floor(r() * STYLE.length)];

      // Bedroom count is skewed small, then nudged up for estates and villas.
      let beds = Math.floor(Math.pow(r(), 1.7) * 7);
      if (type === 'Estate') beds = Math.min(6, beds + 3);
      if (type === 'Villa') beds = Math.min(6, beds + 1);
      if (type === 'Loft' || type === 'Overwater suite') beds = Math.min(beds, 2);
      const bedLabel = BEDROOMS[beds];
      const guests = Math.max(2, beds * 2 + (r() > 0.5 ? 2 : 1));

      const amenities = AMENITY.filter(function (a) {
        const gate = a === 'Helipad' ? 0.91 : a === 'Private beach' ? 0.78
          : a === 'Tennis court' ? 0.82 : a === 'Wine cellar' ? 0.7 : 0.5;
        return r() > gate;
      });
      if (!amenities.length) amenities.push('Spa');

      // Nightly rate: type floor × region × view × bedroom scaling × modest noise.
      const bedScale = 1 + beds * 0.34;
      const raw = TYPE_BASE[type] * REGION_MULT[region] * VIEW_MULT[view] * bedScale *
        (0.78 + r() * 0.55) * (1 + amenities.length * 0.045);
      const price = Math.round(raw / 25) * 25;

      out.push({
        id: id,
        title: FIRST[Math.floor(r() * FIRST.length)] + ' ' +
               SECOND[Math.floor(r() * SECOND.length)],
        region: region,
        type: type,
        style: style,
        view: view,
        board: BOARD[Math.floor(r() * BOARD.length)],
        bedrooms: bedLabel,
        beds: beds,
        guests: guests,
        amenities: amenities,
        price: price,
        rating: Math.round((3.5 + r() * 1.5) * 10) / 10,
        reviews: 6 + Math.floor(r() * 340),
        year: 2021 + Math.floor(r() * 6),
        nights: 2 + Math.floor(r() * 3),
        instant: r() > 0.55,
        pets: r() > 0.7,
        oceanfront: r() > 0.74,
      });
    }
    return out;
  }

  A.register({
    key: 'residences',
    nav: 'Residences',
    title: 'Residences',
    blurb: 'Private stays across invented coastlines and ranges. Thirteen facets, live ' +
           'co-occurring counts, and a shareable URL for every combination.',
    noun: 'residences',
    searchFields: ['title', 'region', 'type', 'style', 'view', 'amenities'],
    defaultSort: 'relevance',
    sorts: ['relevance', 'price-asc', 'price-desc', 'rating-desc', 'newest', 'title-asc'],
    facets: [
      { key: 'reg', label: 'Region', kind: 'terms', field: 'region', values: REGION },
      { key: 'typ', label: 'Property type', kind: 'terms', field: 'type', values: TYPE },
      { key: 'bed', label: 'Bedrooms', kind: 'terms', field: 'bedrooms', values: BEDROOMS },
      { key: 'vue', label: 'View', kind: 'terms', field: 'view', values: VIEW },
      { key: 'sty', label: 'Architecture', kind: 'terms', field: 'style', values: STYLE },
      { key: 'amn', label: 'Amenities', kind: 'terms', field: 'amenities', values: AMENITY },
      { key: 'brd', label: 'Board', kind: 'terms', field: 'board', values: BOARD },
      { key: 'price', label: 'Max per night', kind: 'range', field: 'price', min: 150, max: 12000, step: 50, format: 'money' },
      { key: 'gst', label: 'Sleeps', kind: 'atleast', field: 'guests', values: [2, 4, 6, 8, 12] },
      { key: 'rat', label: 'Rating', kind: 'atleast', field: 'rating', values: [3.5, 4, 4.5] },
      { key: 'ins', label: 'Instant book', kind: 'toggle', field: 'instant' },
      { key: 'pet', label: 'Pets welcome', kind: 'toggle', field: 'pets' },
      { key: 'ocn', label: 'Direct water access', kind: 'toggle', field: 'oceanfront' },
    ],
    data: build(360),
    card: function (it) {
      return '<article class="a-card">' +
        '<div class="a-card-media">' + A.art(it.id, 'bands') +
          (it.instant ? '<span class="a-badge">Instant book</span>' : '') +
        '</div>' +
        '<div class="a-card-body">' +
          '<div class="a-eyebrow" style="margin-bottom:6px">' + esc(it.region) + '</div>' +
          '<h3>' + esc(it.title) + '</h3>' +
          '<p class="a-sub">' + esc(it.type) + ' · ' +
            esc(it.bedrooms === 'Studio' ? 'Studio' : it.bedrooms + ' bed') +
            ' · sleeps ' + it.guests + ' · ' + esc(it.view) + ' view</p>' +
          '<div class="a-card-foot">' +
            '<span class="a-price">' + money(it.price) + ' / night</span>' +
            '<span class="a-rating"><svg viewBox="0 0 24 24"><path d="M12 2l3 6.6 7 .7-5.2 4.8 1.5 7L12 17.6 5.7 21l1.5-7L2 9.3l7-.7z"/></svg>' +
              it.rating.toFixed(1) + ' <span class="a-faint">(' + it.reviews + ')</span></span>' +
          '</div>' +
        '</div></article>';
    },
  });
})();
