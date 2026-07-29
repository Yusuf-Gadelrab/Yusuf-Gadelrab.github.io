/* ============================================================================
   AURUM · CINEMA — streaming catalogue surface.

   Same contract as atelier.js: identity, searchFields, facets declared as data,
   sorts, generated data, card(). Nothing bespoke leaks into the engine.

   Every title, studio, house and person here is invented. No real film, series,
   studio or service is referenced, quoted or "inspired by" — the point of the
   surface is the faceting engine and the design system, not a real catalogue.

   Note on price: this surface has no retail price. Included titles carry
   price 0 and rentals carry a rental fee, so price sorts would be meaningless
   noise — the sorts list deliberately omits them.
   ========================================================================== */
(function () {
  'use strict';
  const A = window.Aurum, U = A.util, esc = U.esc, money = U.money;

  const GENRE = ['Drama', 'Thriller', 'Science fiction', 'Comedy', 'Documentary',
    'Romance', 'Crime', 'Fantasy', 'Horror', 'Historical', 'Animation', 'Musical'];
  const FORMAT = ['Film', 'Limited series', 'Series'];
  const LANG = ['English', 'French', 'Japanese', 'Arabic', 'Spanish', 'Korean',
    'Italian', 'Icelandic'];
  const CERT = ['G', 'PG', 'PG-13', 'R', 'NC-17'];
  const MOOD = ['Meditative', 'Tense', 'Playful', 'Melancholy', 'Sweeping',
    'Unsettling', 'Warm', 'Cerebral'];
  const AVAIL = ['Included', 'Rental', 'Leaving soon'];
  const STUDIO = ['Vantour Pictures', 'Halcyon Reel', 'Nordlys Film', 'Sable & Kite',
    'Meridian Foundry', 'Okapi Studios', 'Verano Cinema', 'Lantern Nine',
    'Corvane Motion', 'Petrichor Works'];
  const DECADE = ['1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];

  const T1 = ['The Salt', 'The Quiet', 'Nine', 'A Slow', 'The Last', 'Northern',
    'The Paper', 'Blue', 'The Glass', 'Winter', 'The Long', 'Amber', 'The Hollow',
    'Second', 'The Bright', 'Low', 'The Iron', 'Every', 'The Soft', 'Third'];
  const T2 = ['Meridian', 'Harvest', 'Lanterns', 'Country', 'Ferry', 'Signal',
    'Orchard', 'Hours', 'Tide', 'Chorus', 'Archive', 'Weather', 'Runners',
    'Pilgrim', 'Fields', 'Machine', 'Sisters', 'Winter', 'Kingdom', 'Descent'];
  const SUFFIX = ['', '', '', '', ': Part One', ': The Return', ' (Restored)', ': Coda'];

  function build(n) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const id = 'cin-' + i;
      const r = U.rng(id);
      const format = FORMAT[Math.floor(r() * FORMAT.length)];
      // Genres are an array so the engine's multi-value term matching gets
      // exercised: a film is "Crime + Drama", not one bucket.
      const primary = GENRE[Math.floor(r() * GENRE.length)];
      const genres = [primary];
      const extra = 1 + Math.floor(r() * 2);
      for (let g = 0; g < extra; g++) {
        const cand = GENRE[Math.floor(r() * GENRE.length)];
        if (genres.indexOf(cand) === -1) genres.push(cand);
      }
      const year = 1962 + Math.floor(r() * 63);
      const decade = Math.floor(year / 10) * 10 + 's';
      // Runtime distribution differs by format so the range slider has shape:
      // features run long, episodic entries are per-episode minutes.
      const runtime = format === 'Film'
        ? 78 + Math.floor(r() * 106)
        : format === 'Limited series' ? 42 + Math.floor(r() * 24) : 24 + Math.floor(r() * 34);
      const avail = r() > 0.74 ? (r() > 0.55 ? 'Rental' : 'Leaving soon') : 'Included';
      const price = avail === 'Rental' ? 3 + Math.floor(r() * 10) : 0;
      const original = r() > 0.79;
      out.push({
        id: id,
        title: T1[Math.floor(r() * T1.length)] + ' ' + T2[Math.floor(r() * T2.length)] +
          SUFFIX[Math.floor(r() * SUFFIX.length)],
        studio: original ? 'Aurum Originals' : STUDIO[Math.floor(r() * STUDIO.length)],
        format: format,
        genres: genres,
        language: LANG[Math.floor(r() * LANG.length)],
        cert: CERT[Math.floor(r() * CERT.length)],
        mood: MOOD[Math.floor(r() * MOOD.length)],
        availability: avail,
        decade: decade,
        year: year,
        runtime: runtime,
        episodes: format === 'Film' ? 0 : 4 + Math.floor(r() * 18),
        price: price,
        rating: Math.round((5.2 + r() * 4.6) * 10) / 10,
        reviews: 30 + Math.floor(r() * 4200),
        uhd: r() > 0.42,
        original: original,
        subtitled: r() > 0.3,
      });
    }
    return out;
  }

  function runtimeLabel(it) {
    return it.format === 'Film'
      ? it.runtime + ' min'
      : it.episodes + ' eps · ' + it.runtime + ' min';
  }

  A.register({
    key: 'cinema',
    nav: 'Cinema',
    title: 'Cinema',
    blurb: 'A fictional streaming catalogue — films and series across six decades. ' +
           'Thirteen facets, live co-occurring counts, and a shareable URL for every cut.',
    noun: 'titles',
    searchFields: ['title', 'studio', 'genres', 'language', 'mood', 'format'],
    defaultSort: 'relevance',
    // No price sorts: most titles are included and price 0, so ordering by it
    // would just clump the catalogue rather than say anything.
    sorts: ['relevance', 'rating-desc', 'newest', 'title-asc'],
    facets: [
      { key: 'gen', label: 'Genre', kind: 'terms', field: 'genres', values: GENRE },
      { key: 'fmt', label: 'Format', kind: 'terms', field: 'format', values: FORMAT },
      { key: 'dec', label: 'Decade', kind: 'terms', field: 'decade', values: DECADE },
      { key: 'lang', label: 'Language', kind: 'terms', field: 'language', values: LANG },
      { key: 'cert', label: 'Certificate', kind: 'terms', field: 'cert', values: CERT },
      { key: 'mood', label: 'Mood', kind: 'terms', field: 'mood', values: MOOD },
      { key: 'avail', label: 'Availability', kind: 'terms', field: 'availability', values: AVAIL },
      { key: 'stu', label: 'Studio', kind: 'terms', field: 'studio', values: ['Aurum Originals'].concat(STUDIO) },
      { key: 'yr', label: 'Released up to', kind: 'range', field: 'year', min: 1962, max: 2024, step: 1 },
      { key: 'run', label: 'Max runtime', kind: 'range', field: 'runtime', min: 24, max: 190, step: 2 },
      { key: 'rat', label: 'Rating', kind: 'atleast', field: 'rating', values: [6, 7, 8, 9] },
      { key: 'uhd', label: '4K HDR', kind: 'toggle', field: 'uhd' },
      { key: 'org', label: 'Aurum Original', kind: 'toggle', field: 'original' },
      { key: 'sub', label: 'Subtitles available', kind: 'toggle', field: 'subtitled' },
    ],
    data: build(450),
    card: function (it) {
      const badge = it.original ? 'Aurum Original' : (it.uhd ? '4K' : '');
      return '<article class="a-card">' +
        '<div class="a-card-media">' + A.art(it.id, 'rules') +
          (badge ? '<span class="a-badge">' + esc(badge) + '</span>' : '') +
        '</div>' +
        '<div class="a-card-body">' +
          '<div class="a-eyebrow" style="margin-bottom:6px">' + esc(it.studio) + ' · ' + it.year + '</div>' +
          '<h3>' + esc(it.title) + '</h3>' +
          '<p class="a-sub">' + esc(it.cert) + ' · ' + esc(runtimeLabel(it)) + ' · ' +
            esc(it.format) + ' · ' + esc(it.genres.join(', ')) + '</p>' +
          '<div class="a-card-foot">' +
            '<span class="a-price">' + (it.price ? money(it.price) + ' rental' : esc(it.availability)) + '</span>' +
            '<span class="a-rating"><svg viewBox="0 0 24 24"><path d="M12 2l3 6.6 7 .7-5.2 4.8 1.5 7L12 17.6 5.7 21l1.5-7L2 9.3l7-.7z"/></svg>' +
              it.rating.toFixed(1) + ' <span class="a-faint">(' + it.reviews + ')</span></span>' +
          '</div>' +
        '</div></article>';
    },
  });
})();
