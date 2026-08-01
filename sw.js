/* ============================================================================
   Root service worker — yusuf-gadelrab.github.io
   ---------------------------------------------------------------------------
   Design rule: a bad SW can pin users to a broken build forever, so this one is
   deliberately conservative.

     HTML / navigations   -> NETWORK FIRST. A redeploy is always picked up on the
                             very next load. The cache copy exists only so an
                             offline reload of an already-visited page still works.
     Hashed CRA bundles   -> CACHE FIRST. /static/**.<hash>.<ext> is immutable by
                             construction; a new build emits a new filename.
     /css/*.css, /js/*.js -> NETWORK FIRST. These are the only first-party code
                             assets NOT content-hashed, so they must never be
                             served stale while a network is available.
     Other static assets  -> STALE-WHILE-REVALIDATE (images, og cards, icons,
                             downloads). Instant paint, refreshed in background.
     /apps/**             -> BYPASSED ENTIRELY. Those PWAs ship their own,
                             narrower-scoped workers and must keep owning them.

   Bump VERSION on any change to this file or to the precache list. install()
   calls skipWaiting() and activate() calls clients.claim() + deletes every cache
   whose name is not in the current set, so one reload fully retires the old one.
   ========================================================================= */

var VERSION = "v5";
var SHELL = "yg-shell-" + VERSION;   // precached offline fallback + chrome
var RUNTIME = "yg-runtime-" + VERSION; // opportunistic assets
var PAGES = "yg-pages-" + VERSION;     // last-known-good HTML, offline only
var CURRENT = [SHELL, RUNTIME, PAGES];

var OFFLINE_URL = "/offline.html";
var PRECACHE = [
  OFFLINE_URL,
  "/css/site.css",
  "/js/site.js",
  "/manifest.webmanifest",
  "/favicon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(SHELL).then(function (cache) {
      // addAll is all-or-nothing; a single 404 would abort the whole install and
      // leave the site with no offline page at all. Cache each entry on its own.
      return Promise.all(PRECACHE.map(function (url) {
        return cache.add(new Request(url, { cache: "reload" })).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (key) {
        // Only ever touch our own caches — /apps/* workers own theirs.
        if (key.indexOf("yg-") === 0 && CURRENT.indexOf(key) === -1) {
          return caches.delete(key);
        }
      }));
    }).then(function () {
      return self.registration.navigationPreload
        && self.registration.navigationPreload.enable().catch(function () {});
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("message", function (event) {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

function isHashedBundle(path) {
  return /^\/static\/.+\.[0-9a-f]{8,}\.(js|css|map|woff2?|png|jpg|svg)$/i.test(path);
}

function isStaticAsset(path) {
  return /\.(png|jpe?g|gif|svg|webp|avif|ico|woff2?|pdf)$/i.test(path);
}

function putIn(cacheName, request, response) {
  if (!response || !response.ok || response.type === "opaque") return response;
  var copy = response.clone();
  caches.open(cacheName).then(function (c) { c.put(request, copy); });
  return response;
}

self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET") return;

  var url;
  try { url = new URL(req.url); } catch (e) { return; }
  if (url.origin !== self.location.origin) return;      // never touch third parties
  if (url.pathname.indexOf("/apps/") === 0) return;     // sub-PWAs own their scope

  // ---- navigations: network first, cached page next, branded offline page last
  if (req.mode === "navigate") {
    event.respondWith(
      (event.preloadResponse || Promise.resolve(null))
        .then(function (preload) { return preload || fetch(req); })
        .then(function (res) { return putIn(PAGES, req, res); })
        .catch(function () {
          return caches.match(req).then(function (hit) {
            return hit || caches.match(OFFLINE_URL) || Response.error();
          });
        })
    );
    return;
  }

  // ---- immutable hashed build output: cache first
  if (isHashedBundle(url.pathname)) {
    event.respondWith(
      caches.match(req).then(function (hit) {
        return hit || fetch(req).then(function (res) { return putIn(RUNTIME, req, res); });
      })
    );
    return;
  }

  // ---- unhashed shared css/js: never serve stale while online. These are the
  // only first-party code assets without a content hash in the filename, so a
  // cache-first strategy here would pin users to an old build's behaviour.
  if (/^\/(css|js)\/[^/]+\.(css|js)$/.test(url.pathname)) {
    event.respondWith(
      fetch(req).then(function (res) { return putIn(SHELL, req, res); })
        .catch(function () { return caches.match(req); })
    );
    return;
  }

  // ---- everything else static: stale-while-revalidate
  if (isStaticAsset(url.pathname)) {
    event.respondWith(
      caches.match(req).then(function (hit) {
        var net = fetch(req).then(function (res) { return putIn(RUNTIME, req, res); })
          .catch(function () { return hit; });
        return hit || net;
      })
    );
    return;
  }

  // Anything else (JSON, .txt, .xml…) goes straight to the network, uncached.
});
