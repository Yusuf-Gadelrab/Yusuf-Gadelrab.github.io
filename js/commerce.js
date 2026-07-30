/* YGCommerce — one rail behind every buy button on the site.
 *
 * WHY this file exists: store.html, templates.html, kxngsef.html, resume.html and
 * sprint.html each had their own copy of the same "look the key up in CHECKOUT,
 * otherwise fall back to a mailto" loop. Five copies, five slightly different
 * behaviours, and three different fallback wordings. This is the single copy.
 *
 * Two states, decided per SKU by whether CHECKOUT[key] holds a real URL:
 *
 *   live    — a verified checkout URL exists. The button is a buy button.
 *   pending — no URL. The button becomes a waitlist join, handled inline by
 *             YGWaitlist so the address lands in the same list, the same local
 *             backup and the same swappable backend as every other form on the
 *             site. It does not call itself a purchase, because it isn't one.
 *
 * Pending is the default and currently the state of every SKU. Only paste a URL
 * into a page's CHECKOUT map after curl-verifying it returns 200 — the Jul 29
 * cleanup existed because guessed URLs sent real people to 404s.
 */
(function () {
  "use strict";

  /* Pages declare `const CHECKOUT = {...}` in an inline head script. A top-level
     const lands in global lexical scope, not on window, so it is reachable by
     bare identifier from this classic script but not as window.CHECKOUT. */
  function checkoutMap() {
    try { return (typeof CHECKOUT !== "undefined" && CHECKOUT) || {}; }
    catch (e) { return {}; }
  }

  function label(el, key) {
    var name = el.getAttribute("data-name") || key || "product";
    return name.replace(/^tpl-/, "").replace(/-/g, " ").trim();
  }

  var CSS = [
    ".yg-cm{margin-top:12px}",
    ".yg-cm[hidden]{display:none}",
    ".yg-cm form{display:flex;gap:8px;flex-wrap:wrap}",
    ".yg-cm input[type=email]{flex:1 1 190px;min-width:0;padding:11px 13px;",
    "border:1px solid var(--line,rgba(212,175,55,.28));border-radius:var(--radius,4px);",
    "background:rgba(0,0,0,.35);color:var(--ink,#f4f1e8);font:inherit;font-size:14px}",
    ".yg-cm input[type=email]:focus{outline:2px solid var(--gold,#d4af37);outline-offset:1px}",
    ".yg-cm button{flex:0 0 auto;padding:11px 18px;border:1px solid var(--gold,#d4af37);",
    "border-radius:var(--radius,4px);background:transparent;color:var(--gold,#d4af37);",
    "font:inherit;font-size:13px;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}",
    ".yg-cm button:hover{background:var(--gold,#d4af37);color:#0a0a0a}",
    ".yg-cm button[disabled]{opacity:.55;cursor:default}",
    ".yg-cm .yg-cm-note{margin:8px 0 0;font-size:12px;line-height:1.5;",
    "color:var(--muted,#9c9483);letter-spacing:.02em}",
    ".yg-cm .yg-cm-note.is-err{color:var(--warn,#e0b341)}"
  ].join("");

  function injectCSS() {
    if (document.getElementById("yg-cm-css")) return;
    var s = document.createElement("style");
    s.id = "yg-cm-css";
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  /* Mail-client fallback for the no-JS-backend, no-YGWaitlist edge case. Kept so a
     button is never a dead end even if waitlist.js failed to load. */
  function mailtoHref(name) {
    return "mailto:yusuf.gadelrab06@gmail.com" +
      "?subject=" + encodeURIComponent("Waitlist: " + name) +
      "&body=" + encodeURIComponent("Add me to the waitlist for \"" + name + "\".\n");
  }

  function buildPanel(name, listName) {
    var wrap = document.createElement("div");
    wrap.className = "yg-cm";
    wrap.hidden = true;

    var form = document.createElement("form");
    form.setAttribute("novalidate", "");

    var input = document.createElement("input");
    input.type = "email";
    input.required = true;
    input.placeholder = "you@email.com";
    input.setAttribute("aria-label", "Email for the " + name + " waitlist");
    input.autocomplete = "email";

    var btn = document.createElement("button");
    btn.type = "submit";
    btn.textContent = "Notify me";

    var note = document.createElement("p");
    note.className = "yg-cm-note";
    note.textContent = "One email when this opens. Nothing else, ever.";

    form.appendChild(input);
    form.appendChild(btn);
    wrap.appendChild(form);
    wrap.appendChild(note);

    function say(text, isError) {
      note.textContent = text;
      note.className = "yg-cm-note" + (isError ? " is-err" : "");
    }

    function settle(text) {
      form.remove();
      say(text, false);
      wrap.setAttribute("role", "status");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (btn.disabled) return;

      var email = (input.value || "").trim().toLowerCase();

      if (!window.YGWaitlist || typeof window.YGWaitlist.join !== "function") {
        window.location.href = mailtoHref(name);
        return;
      }
      if (!window.YGWaitlist.valid(email)) {
        say("That email doesn’t look right — check it and try again.", true);
        input.focus();
        input.select();
        return;
      }

      btn.disabled = true;
      btn.setAttribute("aria-busy", "true");
      input.readOnly = true;

      window.YGWaitlist.join(listName, email).then(function (res) {
        if (res.status === "mailto") {
          settle("Your email app is open with the message ready — hit send and you’re on the list.");
        } else if (res.status === "already") {
          settle("You’re already on this list.");
        } else {
          settle("You’re on the list. One email when it opens.");
        }
      }).catch(function () {
        btn.disabled = false;
        btn.removeAttribute("aria-busy");
        input.readOnly = false;
        say("Couldn’t reach the server — saved locally and retried automatically.", true);
      });
    });

    return { el: wrap, focus: function () { input.focus(); } };
  }

  function wirePending(el, key) {
    var name = label(el, key);
    var listName = el.getAttribute("data-list") || name;

    el.setAttribute("data-pending", "1");
    el.setAttribute("aria-expanded", "false");
    el.removeAttribute("target");
    el.href = mailtoHref(name);   // real destination if JS below fails or is blocked

    /* Nothing here is for sale yet, so nothing here says "buy". Purchase wording on
       a page that cannot take a payment is both untrue and, given the pending I-539,
       the kind of claim worth not making. */
    if (!/waitlist|notify|notified/i.test(el.textContent)) {
      el.textContent = "Join the waitlist →";
    }

    var panel = null;
    el.addEventListener("click", function (e) {
      e.preventDefault();
      injectCSS();
      if (!panel) {
        panel = buildPanel(name, listName);
        (el.parentNode || document.body).insertBefore(panel.el, el.nextSibling);
      }
      var show = panel.el.hidden;
      panel.el.hidden = !show;
      el.setAttribute("aria-expanded", show ? "true" : "false");
      if (show) panel.focus();
    });
  }

  function wireLive(el, url) {
    el.href = url;
    el.target = "_blank";
    el.rel = "noopener";
    el.removeAttribute("data-pending");
    document.documentElement.classList.add("store-live");
  }

  function init() {
    var map = checkoutMap();
    var nodes = document.querySelectorAll("[data-buy]");
    if (!nodes.length) return;

    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var key = el.getAttribute("data-buy");
      var url = map[key];
      /* Guessed vendor URLs are why every button 404'd in July. A value only counts
         as live if it is an absolute http(s) URL. */
      if (url && /^https?:\/\//.test(url)) wireLive(el, url);
      else wirePending(el, key);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.YGCommerce = { init: init };
})();
