/* analytics.js — one paste-away, privacy-respecting pageview counter.
 *
 * Backend: GoatCounter (https://www.goatcounter.com). Picked over Umami Cloud
 * and Cloudflare Web Analytics because it needs nothing but this one script —
 * no Cloudflare account/dashboard hop, no per-project event quota to watch.
 * Free for non-commercial personal sites, no cookies, no cross-site tracking,
 * IP address is not stored, and it never ships anything to an ad network.
 * See ~/Yusuf-Gadelrab.github.io/ANALYTICS-SETUP.md for the 5-minute setup.
 *
 * Until GOATCOUNTER_CODE is filled in, this file does nothing at all — no
 * request leaves the browser, so analytics is truly OFF, not silently broken.
 */
(function () {
  "use strict";

  var GOATCOUNTER_CODE = "";   // ← paste your GoatCounter site code, e.g. "yusufgadelrab"

  if (!GOATCOUNTER_CODE) return;

  // Respect Do Not Track — GoatCounter already counts no PII, but honouring DNT
  // costs nothing and matches the site's own privacy promises.
  if (navigator.doNotTrack === "1" || window.doNotTrack === "1") return;

  var s = document.createElement("script");
  s.async = true;
  s.src = "https://gc.zgo.at/count.js";
  s.setAttribute("data-goatcounter", "https://" + GOATCOUNTER_CODE + ".goatcounter.com/count");
  document.head.appendChild(s);
})();
