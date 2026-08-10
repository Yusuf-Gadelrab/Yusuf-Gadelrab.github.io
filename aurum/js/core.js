/* ============================================================================
   AURUM core — module registry, faceted filter engine, URL state, renderer.

   The interesting problem here is faceted counts. A filter sidebar that shows
   static counts is lying: once you tick "Leather", the count next to "Under $200"
   should become the number of LEATHER items under $200, not the global number.
   Getting that right means each facet must be counted against the result set
   filtered by every OTHER facet but not by itself — otherwise ticking a value
   inside a facet would zero out its own siblings and you could never select two.

   Everything is client-side and dependency-free: this runs on GitHub Pages with
   no build step and no third-party requests.
   ========================================================================== */
(function (global) {
  'use strict';

  const Aurum = {
    modules: {},
    current: null,
    state: {},
  };

  /* ---------------------------------------------------------------- utils */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));

  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  const money = (n) => '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 });

  // Deterministic pseudo-random from a string. Demo data must look varied but
  // must not change between reloads, or every card would shuffle its own art.
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) {
    let s = hash(String(seed)) || 1;
    return function () { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; };
  }

  const debounce = (fn, ms) => {
    let t; return function () { clearTimeout(t); const a = arguments, c = this;
      t = setTimeout(() => fn.apply(c, a), ms); };
  };

  /* ------------------------------------------------------- filter engine */

  // A predicate per facet kind. Adding a kind here makes it available to every
  // module — modules declare facets as data, never as bespoke filtering code.
  const MATCHERS = {
    // value is one of a set the item declares (string or array field)
    terms(item, facet, selected) {
      if (!selected || !selected.length) return true;
      const v = item[facet.field];
      if (Array.isArray(v)) return v.some((x) => selected.indexOf(x) !== -1);
      return selected.indexOf(v) !== -1;
    },
    // numeric window
    range(item, facet, sel) {
      if (!sel) return true;
      const v = Number(item[facet.field]);
      if (sel.min != null && v < sel.min) return false;
      if (sel.max != null && v > sel.max) return false;
      return true;
    },
    // boolean flag, only constrains when switched on
    toggle(item, facet, sel) {
      if (!sel) return true;
      return !!item[facet.field];
    },
    // at-least numeric (ratings)
    atleast(item, facet, sel) {
      if (sel == null) return true;
      return Number(item[facet.field]) >= Number(sel);
    },
  };

  function passes(item, facets, sel, skipKey) {
    for (let i = 0; i < facets.length; i++) {
      const f = facets[i];
      if (f.key === skipKey) continue;               // self-excluded, see counts()
      const m = MATCHERS[f.kind];
      if (m && !m(item, f, sel[f.key])) return false;
    }
    return true;
  }

  function searchMatch(item, q, fields) {
    if (!q) return true;
    const needle = q.toLowerCase();
    for (let i = 0; i < fields.length; i++) {
      const v = item[fields[i]];
      if (v == null) continue;
      const s = Array.isArray(v) ? v.join(' ') : String(v);
      if (s.toLowerCase().indexOf(needle) !== -1) return true;
    }
    return false;
  }

  function filter(mod, sel) {
    const q = sel.__q || '';
    const out = [];
    for (let i = 0; i < mod.data.length; i++) {
      const it = mod.data[i];
      if (!searchMatch(it, q, mod.searchFields || ['title'])) continue;
      if (!passes(it, mod.facets, sel, null)) continue;
      out.push(it);
    }
    return out;
  }

  /* Facet counts, each computed against every OTHER facet.
     This is what makes multi-select inside one facet behave: "Leather" and
     "Suede" both stay clickable and show their true co-occurring counts. */
  function counts(mod, sel) {
    const res = {};
    const q = sel.__q || '';
    mod.facets.forEach(function (f) {
      if (f.kind !== 'terms') return;
      const tally = {};
      for (let i = 0; i < mod.data.length; i++) {
        const it = mod.data[i];
        if (!searchMatch(it, q, mod.searchFields || ['title'])) continue;
        if (!passes(it, mod.facets, sel, f.key)) continue;
        const v = it[f.field];
        const vals = Array.isArray(v) ? v : [v];
        for (let j = 0; j < vals.length; j++) {
          if (vals[j] == null) continue;
          tally[vals[j]] = (tally[vals[j]] || 0) + 1;
        }
      }
      res[f.key] = tally;
    });
    return res;
  }

  const SORTS = {
    relevance: null,
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    'rating-desc': (a, b) => b.rating - a.rating,
    newest: (a, b) => (b.year || 0) - (a.year || 0),
    'title-asc': (a, b) => String(a.title).localeCompare(String(b.title)),
  };

  /* ------------------------------------------------------------ url state */
  // State lives in the URL so a filtered view is shareable and the back button
  // works. Compact encoding keeps it readable rather than a base64 blob.
  function encode(modKey, sel) {
    const p = new URLSearchParams();
    p.set('m', modKey);
    Object.keys(sel).forEach(function (k) {
      const v = sel[k];
      if (v == null || (Array.isArray(v) && !v.length) || v === '' || v === false) return;
      if (k === '__q') { p.set('q', v); return; }
      if (k === '__sort') { p.set('sort', v); return; }
      if (Array.isArray(v)) p.set(k, v.join('~'));
      else if (typeof v === 'object') p.set(k, (v.min != null ? v.min : '') + '..' + (v.max != null ? v.max : ''));
      else p.set(k, String(v));
    });
    return '?' + p.toString();
  }

  function decode(mod) {
    const p = new URLSearchParams(location.search);
    const sel = {};
    if (p.get('q')) sel.__q = p.get('q');
    if (p.get('sort')) sel.__sort = p.get('sort');
    (mod.facets || []).forEach(function (f) {
      const raw = p.get(f.key);
      if (raw == null) return;
      if (f.kind === 'terms') sel[f.key] = raw.split('~').filter(Boolean);
      else if (f.kind === 'range') {
        const parts = raw.split('..');
        sel[f.key] = { min: parts[0] ? Number(parts[0]) : null, max: parts[1] ? Number(parts[1]) : null };
      } else if (f.kind === 'toggle') sel[f.key] = raw === '1' || raw === 'true';
      else if (f.kind === 'atleast') sel[f.key] = Number(raw);
    });
    return sel;
  }

  /* ------------------------------------------------------------- registry */
  Aurum.register = function (mod) {
    if (!mod || !mod.key) throw new Error('module needs a key');
    mod.facets = mod.facets || [];
    Aurum.modules[mod.key] = mod;
    return mod;
  };

  /* -------------------------------------------------------------- render */
  function renderRail(mod, sel, cnt) {
    return mod.facets.map(function (f) {
      let body = '';
      if (f.kind === 'terms') {
        const tally = cnt[f.key] || {};
        const chosen = sel[f.key] || [];
        // Values the module declares, ordered as declared; unknown values that
        // appear in data are appended so nothing becomes unreachable.
        const vals = (f.values && f.values.length ? f.values.slice() : Object.keys(tally).sort());
        Object.keys(tally).forEach(function (v) { if (vals.indexOf(v) === -1) vals.push(v); });
        body = vals.map(function (v) {
          const n = tally[v] || 0;
          const on = chosen.indexOf(v) !== -1;
          return '<label class="a-check' + (n === 0 && !on ? ' is-empty' : '') + '">' +
            '<input type="checkbox" data-facet="' + esc(f.key) + '" value="' + esc(v) + '"' +
            (on ? ' checked' : '') + (n === 0 && !on ? ' disabled' : '') + '>' +
            '<span>' + esc(v) + '</span><span class="a-count">' + n + '</span></label>';
        }).join('');
      } else if (f.kind === 'range') {
        const cur = sel[f.key] || {};
        const lo = cur.min != null ? cur.min : f.min;
        const hi = cur.max != null ? cur.max : f.max;
        body = '<div class="a-range">' +
          '<div class="a-range-out"><span>' + (f.format === 'money' ? money(f.min) : f.min) +
          '</span><span data-out="' + esc(f.key) + '">' +
          (f.format === 'money' ? money(hi) : hi) + '</span></div>' +
          '<input type="range" aria-label="' + esc(f.label || f.key) + ' — maximum" ' +
          'data-facet="' + esc(f.key) + '" min="' + f.min + '" max="' + f.max +
          '" step="' + (f.step || 1) + '" value="' + hi + '"' +
          ' aria-valuemin="' + f.min + '" aria-valuemax="' + f.max + '" aria-valuenow="' + hi + '"></div>';
      } else if (f.kind === 'toggle') {
        body = '<label class="a-check"><input type="checkbox" data-facet="' + esc(f.key) + '"' +
          (sel[f.key] ? ' checked' : '') + '><span>' + esc(f.label) + '</span></label>';
      } else if (f.kind === 'atleast') {
        const cur = sel[f.key];
        body = '<div class="a-chips">' + (f.values || []).map(function (v) {
          return '<button class="a-chip" data-facet="' + esc(f.key) + '" data-value="' + v +
            '" aria-pressed="' + (Number(cur) === Number(v)) + '">' + esc(f.prefix || '') + v + '+</button>';
        }).join('') + '</div>';
      }
      return '<details class="a-facet" open><summary>' + esc(f.label) +
        '</summary><div class="a-facet-body">' + body + '</div></details>';
    }).join('');
  }

  function renderActive(mod, sel) {
    const pills = [];
    if (sel.__q) pills.push({ k: '__q', label: '“' + sel.__q + '”' });
    mod.facets.forEach(function (f) {
      const v = sel[f.key];
      if (v == null) return;
      if (Array.isArray(v)) v.forEach(function (x) { pills.push({ k: f.key, v: x, label: x }); });
      else if (f.kind === 'range' && (v.min != null || v.max != null))
        pills.push({ k: f.key, label: f.label + ' ≤ ' + (f.format === 'money' ? money(v.max) : v.max) });
      else if (f.kind === 'toggle' && v) pills.push({ k: f.key, label: f.label });
      else if (f.kind === 'atleast' && v != null) pills.push({ k: f.key, label: f.label + ' ' + v + '+' });
    });
    if (!pills.length) return '';
    return pills.map(function (p) {
      return '<span class="a-pill">' + esc(p.label) +
        '<button data-clear="' + esc(p.k) + '"' + (p.v ? ' data-val="' + esc(p.v) + '"' : '') +
        ' aria-label="Remove filter">×</button></span>';
    }).join('') + '<button class="a-chip" data-clear="__all">Clear all</button>';
  }

  function renderResults(mod, rows) {
    if (!rows.length) {
      return '<div class="a-empty"><h3>Nothing matches that combination.</h3>' +
        '<p class="a-dim">Try removing a filter — the counts beside each option show ' +
        'how many results it would leave.</p></div>';
    }
    return '<div class="a-grid">' + rows.map(mod.card).join('') + '</div>';
  }

  Aurum.paint = function () {
    const mod = Aurum.current;
    if (!mod) return;
    const sel = Aurum.state;
    const cnt = counts(mod, sel);
    let rows = filter(mod, sel);
    const sorter = SORTS[sel.__sort];
    if (sorter) rows = rows.slice().sort(sorter);

    $('#a-rail').innerHTML = renderRail(mod, sel, cnt);
    $('#a-active').innerHTML = renderActive(mod, sel);
    $('#a-count').innerHTML = '<b>' + rows.length + '</b> of ' + mod.data.length + ' ' +
      (mod.noun || 'results');
    $('#a-results').innerHTML = renderResults(mod, rows);

    history.replaceState(null, '', encode(mod.key, sel));
  };

  Aurum.go = function (key, keepState) {
    const mod = Aurum.modules[key];
    if (!mod) return;
    Aurum.current = mod;
    Aurum.state = keepState ? Aurum.state : decode(mod);
    if (!Aurum.state.__sort) Aurum.state.__sort = mod.defaultSort || 'relevance';

    $$('.a-mode').forEach(function (b) {
      b.setAttribute('aria-current', String(b.dataset.mode === key));
    });
    $('#a-module-title').textContent = mod.title;
    $('#a-module-sub').textContent = mod.blurb || '';
    const sortSel = $('#a-sort');
    sortSel.innerHTML = (mod.sorts || ['relevance', 'price-asc', 'price-desc', 'rating-desc'])
      .map(function (s) {
        return '<option value="' + s + '"' + (s === Aurum.state.__sort ? ' selected' : '') + '>' +
          ({ relevance: 'Curated', 'price-asc': 'Price ↑', 'price-desc': 'Price ↓',
             'rating-desc': 'Top rated', newest: 'Newest', 'title-asc': 'A–Z' }[s] || s) + '</option>';
      }).join('');
    $('#a-search').value = Aurum.state.__q || '';
    Aurum.paint();
  };

  /* --------------------------------------------------------------- events */
  Aurum.bind = function () {
    // Delegated: the rail is re-rendered constantly, so per-node listeners
    // would leak and go stale.
    document.addEventListener('change', function (e) {
      const el = e.target;
      const key = el.dataset && el.dataset.facet;
      if (!key) return;
      const mod = Aurum.current;
      const f = mod.facets.filter(function (x) { return x.key === key; })[0];
      if (!f) return;
      if (f.kind === 'terms') {
        const cur = Aurum.state[key] || [];
        Aurum.state[key] = el.checked
          ? cur.concat([el.value])
          : cur.filter(function (v) { return v !== el.value; });
        if (!Aurum.state[key].length) delete Aurum.state[key];
      } else if (f.kind === 'range') {
        Aurum.state[key] = { min: null, max: Number(el.value) };
      } else if (f.kind === 'toggle') {
        if (el.checked) Aurum.state[key] = true; else delete Aurum.state[key];
      }
      Aurum.paint();
    });

    document.addEventListener('input', function (e) {
      const el = e.target;
      if (el.dataset && el.dataset.facet && el.type === 'range') {
        const out = $('[data-out="' + el.dataset.facet + '"]');
        const mod = Aurum.current;
        const f = mod.facets.filter(function (x) { return x.key === el.dataset.facet; })[0];
        if (out) out.textContent = f && f.format === 'money' ? money(el.value) : el.value;
      }
    });

    document.addEventListener('click', function (e) {
      const t = e.target.closest ? e.target.closest('[data-mode],[data-clear],[data-facet].a-chip,#a-rail-toggle') : null;
      if (!t) return;
      if (t.dataset.mode) { Aurum.go(t.dataset.mode); return; }
      if (t.id === 'a-rail-toggle') { $('#a-rail').classList.toggle('is-open'); return; }
      if (t.dataset.clear) {
        const k = t.dataset.clear;
        if (k === '__all') Aurum.state = { __sort: Aurum.state.__sort };
        else if (t.dataset.val && Array.isArray(Aurum.state[k])) {
          Aurum.state[k] = Aurum.state[k].filter(function (v) { return v !== t.dataset.val; });
          if (!Aurum.state[k].length) delete Aurum.state[k];
        } else delete Aurum.state[k];
        Aurum.paint(); return;
      }
      if (t.classList.contains('a-chip') && t.dataset.facet) {
        const k = t.dataset.facet, v = Number(t.dataset.value);
        Aurum.state[k] = Aurum.state[k] === v ? undefined : v;
        if (Aurum.state[k] === undefined) delete Aurum.state[k];
        Aurum.paint(); return;
      }
    });

    $('#a-search').addEventListener('input', debounce(function (e) {
      const v = e.target.value.trim();
      if (v) Aurum.state.__q = v; else delete Aurum.state.__q;
      Aurum.paint();
    }, 160));

    $('#a-sort').addEventListener('change', function (e) {
      Aurum.state.__sort = e.target.value;
      Aurum.paint();
    });
  };

  Aurum.util = { esc: esc, money: money, rng: rng, hash: hash, $: $, $$: $$ };
  global.Aurum = Aurum;
})(window);
