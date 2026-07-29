/* ============================================================================
   AURUM · MOTORS — vehicle marketplace surface.

   Follows the atelier.js contract exactly: identity, searchFields, facets as
   DATA, sorts, generated data, card(). Every marque, model, spec and price is
   invented — nothing here refers to a real manufacturer or vehicle.

   Pricing is modelled rather than random: marque tier sets the base, then year,
   powertrain and mileage move it. Without that the range sliders would only be
   filtering uniform noise and the distribution would tell you nothing.
   ========================================================================== */
(function () {
  'use strict';
  const A = window.Aurum, U = A.util, esc = U.esc, money = U.money;

  // tier drives base price: 3 = flagship, 2 = premium, 1 = accessible
  const MARQUES = [
    { name: 'Veytra', tier: 3 },
    { name: 'Ossiane', tier: 3 },
    { name: 'Corradine', tier: 3 },
    { name: 'Halberd Motive', tier: 2 },
    { name: 'Strandvik', tier: 2 },
    { name: 'Aurelio Vance', tier: 2 },
    { name: 'Kestrel & Roe', tier: 2 },
    { name: 'Noctis Auto', tier: 2 },
    { name: 'Barrowe', tier: 1 },
    { name: 'Feldspar', tier: 1 },
    { name: 'Vireo Motorworks', tier: 1 },
  ];
  const MARQUE_NAMES = MARQUES.map(function (m) { return m.name; });
  const TIER = {};
  MARQUES.forEach(function (m) { TIER[m.name] = m.tier; });

  const BODY = ['Grand tourer', 'Saloon', 'Estate', 'Coupé', 'Roadster',
    'Sport utility', 'Shooting brake', 'Hatchback'];
  const POWERTRAIN = ['Electric', 'Hybrid', 'Petrol'];
  const DRIVETRAIN = ['Rear-wheel drive', 'All-wheel drive', 'Front-wheel drive'];
  const TRANSMISSION = ['Automatic', 'Dual-clutch', 'Manual', 'Single-speed'];
  const EXTERIOR = ['Obsidian Black', 'Glacier White', 'Storm Graphite', 'Verdant Green',
    'Oxide Red', 'Bleu Marin', 'Champagne Gold', 'Ash Silver'];
  const INTERIOR = ['Ivory leather', 'Ebony leather', 'Tan hide', 'Alcantara noir',
    'Slate wool', 'Cognac hide'];
  const FEATURES = ['Panoramic roof', 'Adaptive suspension', 'Carbon package',
    'Night vision', 'Massaging seats', 'Head-up display', 'Ceramic brakes',
    'Rear-axle steering', 'Air suspension', 'Premium audio'];

  const MODEL = {
    'Grand tourer': ['Solenne', 'Calibre GT', 'Aventine', 'Marovane'],
    Saloon: ['Aurelian', 'Meridian S', 'Voltane', 'Castellan'],
    Estate: ['Longmoor', 'Serrata', 'Wayfarer E', 'Brenhall'],
    'Coupé': ['Falcata', 'Sable C', 'Ravello', 'Nocturne'],
    Roadster: ['Zephyrine', 'Aerlin', 'Cabriole R', 'Windrose'],
    'Sport utility': ['Ferrand X', 'Ardennes', 'Tessaly', 'Ironvale'],
    'Shooting brake': ['Vandermere', 'Halcy SB', 'Onyx Brake', 'Larkspur'],
    Hatchback: ['Piccolo', 'Wren H', 'Osmund', 'Tinder T'],
  };
  const TRIM = ['Signature', 'Reserve', 'Anniversary', 'Competizione', 'Touring',
    'Black Series', 'Lusso', 'Sport'];

  // powertrain multiplier: EV drivetrains carry a premium, hybrids a small one
  const PT_MULT = { Electric: 1.28, Hybrid: 1.1, Petrol: 1.0 };
  const BODY_MULT = { 'Grand tourer': 1.35, Saloon: 1.0, Estate: 0.95, 'Coupé': 1.15,
    Roadster: 1.2, 'Sport utility': 1.25, 'Shooting brake': 1.1, Hatchback: 0.7 };
  const TIER_BASE = { 3: 168000, 2: 82000, 1: 36000 };

  function build(n) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const id = 'mtr-' + i;
      const r = U.rng(id);
      const marque = MARQUE_NAMES[Math.floor(r() * MARQUE_NAMES.length)];
      const tier = TIER[marque];
      const body = BODY[Math.floor(r() * BODY.length)];
      const models = MODEL[body];
      const model = models[Math.floor(r() * models.length)];

      // Newer cars skew electric; older stock skews petrol.
      const year = 2014 + Math.floor(r() * 11);            // 2014–2024
      const age = 2025 - year;
      const ptRoll = r();
      const powertrain = year >= 2021
        ? (ptRoll > 0.55 ? 'Electric' : ptRoll > 0.25 ? 'Hybrid' : 'Petrol')
        : (ptRoll > 0.86 ? 'Electric' : ptRoll > 0.62 ? 'Hybrid' : 'Petrol');

      const transmission = powertrain === 'Electric'
        ? 'Single-speed'
        : (r() > 0.86 ? 'Manual' : r() > 0.55 ? 'Dual-clutch' : 'Automatic');

      const drivetrain = body === 'Sport utility'
        ? (r() > 0.15 ? 'All-wheel drive' : 'Rear-wheel drive')
        : DRIVETRAIN[Math.floor(r() * DRIVETRAIN.length)];

      // Mileage grows with age plus a per-car usage rate.
      const perYear = 3200 + Math.floor(r() * 11000);
      const mileage = Math.round((age * perYear + Math.floor(r() * 4200)) / 100) * 100;

      const features = FEATURES.filter(function () {
        return r() > (tier === 3 ? 0.45 : tier === 2 ? 0.62 : 0.78);
      });

      // Price: tier base × body × powertrain, aged down and mileage-penalised.
      const depreciation = Math.pow(0.885, age);
      const milePenalty = Math.max(0.42, 1 - (mileage / 100000) * 0.19);
      const featureLift = 1 + features.length * 0.022;
      const spread = 0.86 + r() * 0.3;
      const raw = TIER_BASE[tier] * BODY_MULT[body] * PT_MULT[powertrain] *
        depreciation * milePenalty * featureLift * spread;
      const price = Math.max(7500, Math.round(raw / 500) * 500);

      const rating = Math.round((3.3 + r() * 1.7) * 10) / 10;

      out.push({
        id: id,
        title: model + ' ' + TRIM[Math.floor(r() * TRIM.length)],
        marque: marque,
        body: body,
        powertrain: powertrain,
        drivetrain: drivetrain,
        transmission: transmission,
        exterior: EXTERIOR[Math.floor(r() * EXTERIOR.length)],
        interior: INTERIOR[Math.floor(r() * INTERIOR.length)],
        features: features.length ? features : ['Premium audio'],
        year: year,
        mileage: mileage,
        price: price,
        rating: rating,
        reviews: 3 + Math.floor(r() * 180),
        singleOwner: r() > 0.62,
        certified: tier === 3 ? r() > 0.4 : r() > 0.7,
      });
    }
    return out;
  }

  A.register({
    key: 'motors',
    nav: 'Motors',
    title: 'Motors',
    blurb: 'A fictional marketplace of collectable and modern vehicles. Fourteen facets — ' +
           'marque, powertrain, mileage, features — all counted live against each other.',
    noun: 'vehicles',
    searchFields: ['title', 'marque', 'body', 'powertrain', 'exterior', 'features'],
    defaultSort: 'relevance',
    sorts: ['relevance', 'price-asc', 'price-desc', 'rating-desc', 'newest', 'title-asc'],
    facets: [
      { key: 'mrq', label: 'Marque', kind: 'terms', field: 'marque', values: MARQUE_NAMES },
      { key: 'bdy', label: 'Body style', kind: 'terms', field: 'body', values: BODY },
      { key: 'pwr', label: 'Powertrain', kind: 'terms', field: 'powertrain', values: POWERTRAIN },
      { key: 'drv', label: 'Drivetrain', kind: 'terms', field: 'drivetrain', values: DRIVETRAIN },
      { key: 'trn', label: 'Transmission', kind: 'terms', field: 'transmission', values: TRANSMISSION },
      { key: 'ext', label: 'Exterior colour', kind: 'terms', field: 'exterior', values: EXTERIOR },
      { key: 'int', label: 'Interior', kind: 'terms', field: 'interior', values: INTERIOR },
      { key: 'ftr', label: 'Features', kind: 'terms', field: 'features', values: FEATURES },
      { key: 'yr', label: 'Model year', kind: 'range', field: 'year', min: 2014, max: 2024, step: 1 },
      { key: 'prc', label: 'Max price', kind: 'range', field: 'price', min: 7500, max: 400000, step: 2500, format: 'money' },
      { key: 'mil', label: 'Max mileage', kind: 'range', field: 'mileage', min: 0, max: 160000, step: 2500 },
      { key: 'rat', label: 'Rating', kind: 'atleast', field: 'rating', values: [3, 3.5, 4, 4.5] },
      { key: 'own', label: 'Single owner', kind: 'toggle', field: 'singleOwner' },
      { key: 'cert', label: 'Certified', kind: 'toggle', field: 'certified' },
    ],
    data: build(380),
    card: function (it) {
      const badge = it.certified ? 'Certified' : it.singleOwner ? 'Single owner' : '';
      return '<article class="a-card">' +
        '<div class="a-card-media">' + A.art(it.id, 'facets') +
          (badge ? '<span class="a-badge">' + esc(badge) + '</span>' : '') +
        '</div>' +
        '<div class="a-card-body">' +
          '<div class="a-eyebrow" style="margin-bottom:6px">' + esc(it.marque) + ' · ' + it.year + '</div>' +
          '<h3>' + esc(it.title) + '</h3>' +
          '<p class="a-sub">' + esc(it.powertrain) + ' · ' + esc(it.drivetrain) + ' · ' +
            it.mileage.toLocaleString('en-US') + ' mi</p>' +
          '<div class="a-card-foot">' +
            '<span class="a-price">' + money(it.price) + '</span>' +
            '<span class="a-rating"><svg viewBox="0 0 24 24"><path d="M12 2l3 6.6 7 .7-5.2 4.8 1.5 7L12 17.6 5.7 21l1.5-7L2 9.3l7-.7z"/></svg>' +
              it.rating.toFixed(1) + ' <span class="a-faint">(' + it.reviews + ')</span></span>' +
          '</div>' +
        '</div></article>';
    },
  });
})();
