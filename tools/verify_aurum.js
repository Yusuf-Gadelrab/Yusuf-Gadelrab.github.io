/* Verify every AURUM surface against the module contract.
 *
 * The claim each surface makes is easy to state and easy to get subtly wrong:
 * "facet counts are computed against every OTHER facet". If that's broken,
 * selecting one value silently zeroes its own siblings and multi-select dies —
 * and it still LOOKS fine, because you get a plausible number of results.
 * So this asserts the arithmetic: after a selection, some other facet's counts
 * must sum exactly to the filtered result total.
 *
 *   node tools/verify_aurum.js
 * Exit 1 on any failure.
 */
'use strict';
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..', 'public', 'aurum');

// Minimal DOM: core.js only ever touches innerHTML/value/textContent.
const painted = {};
global.window = {};
global.location = { search: '' };
global.history = { replaceState() {} };
global.URLSearchParams = require('url').URLSearchParams;
global.document = {
  querySelector: (s) => ({
    set innerHTML(v) { painted[s] = v; },
    get innerHTML() { return painted[s] || ''; },
    value: '', textContent: '', addEventListener() {},
  }),
  querySelectorAll: () => [],
  addEventListener() {},
};

require(path.join(ROOT, 'js', 'core.js'));
require(path.join(ROOT, 'js', 'art.js'));

const dataDir = path.join(ROOT, 'data');
fs.readdirSync(dataDir).filter((f) => f.endsWith('.js')).sort()
  .forEach((f) => require(path.join(dataDir, f)));

const A = global.window.Aurum;
const strip = (s) => String(s || '').replace(/<[^>]+>/g, '');
let failures = 0;

function ok(cond, label, detail) {
  console.log(`  ${cond ? '✓' : '✗'} ${label}${detail ? '  ' + detail : ''}`);
  if (!cond) failures++;
  return cond;
}

function countsIn(label) {
  const rail = painted['#a-rail'] || '';
  const i = rail.indexOf('>' + label + '<');
  if (i === -1) return null;
  const block = rail.slice(i).split('</details>')[0];
  return [...block.matchAll(/class="a-count">(\d+)/g)].map((m) => Number(m[1]));
}

const keys = Object.keys(A.modules);
console.log(`AURUM — verifying ${keys.length} surfaces\n`);

keys.forEach((key) => {
  const m = A.modules[key];
  console.log(`${m.title} (${key})`);

  ok(m.data.length > 0, 'has data', `${m.data.length} ${m.noun || 'items'}`);
  ok(m.facets.length >= 10, 'facet count >= 10', `${m.facets.length}`);
  ok(typeof m.card === 'function' && m.card(m.data[0]).length > 200, 'card renders');

  // Contract: cards may only use system classes. A module inventing its own
  // class is invisible until the design drifts, so catch it here.
  const html = m.data.slice(0, 25).map(m.card).join('');
  const bad = [...html.matchAll(/class="([^"]+)"/g)]
    .flatMap((x) => x[1].split(/\s+/))
    .filter((c) => c && !/^a-/.test(c));
  ok(bad.length === 0, 'only system CSS classes', bad.length ? [...new Set(bad)].join(',') : '');

  // No raw unescaped angle brackets leaking from data into markup.
  ok(!/<script/i.test(html), 'no script injection from data');

  A.current = m;
  A.state = { __sort: m.defaultSort || 'relevance' };
  A.paint();
  const unf = Number((painted['#a-count'].match(/<b>(\d+)</) || [])[1]);
  ok(unf === m.data.length, 'unfiltered count == data length', `${unf}`);

  // --- the real test: faceted self-exclusion -------------------------------
  const termFacets = m.facets.filter((f) => f.kind === 'terms');
  const arrayFacet = termFacets.find((f) => Array.isArray(m.data[0][f.field])) || termFacets[0];
  const someVal = (() => {
    const v = m.data[0][arrayFacet.field];
    return Array.isArray(v) ? v[0] : v;
  })();

  A.state = { __sort: m.defaultSort || 'relevance' };
  A.state[arrayFacet.key] = [someVal];
  A.paint();
  const total = Number((painted['#a-count'].match(/<b>(\d+)</) || [])[1]);

  const own = countsIn(arrayFacet.label) || [];
  ok(own.filter((n) => n > 0).length > 1,
    `siblings stay selectable in "${arrayFacet.label}"`,
    `${own.filter((n) => n > 0).length}/${own.length} non-zero`);

  const other = termFacets.find((f) => f.key !== arrayFacet.key && !Array.isArray(m.data[0][f.field]));
  if (other) {
    const sum = (countsIn(other.label) || []).reduce((a, b) => a + b, 0);
    ok(sum === total, `"${other.label}" counts sum to filtered total`, `${sum} == ${total}`);
  }

  // determinism of generated art
  ok(A.art(m.data[0].id) === A.art(m.data[0].id), 'art deterministic');
  ok(A.art(m.data[0].id) !== A.art(m.data[1].id), 'art varies per item');

  console.log('');
});

console.log(failures === 0
  ? `ALL SURFACES PASS (${keys.length} modules)`
  : `${failures} FAILURE(S)`);
process.exit(failures ? 1 : 0);
