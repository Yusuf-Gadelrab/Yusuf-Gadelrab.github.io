/* YGWaitlist — one waitlist rail for every product surface.
 *
 * WHY a shared file: every product page (Circle, KXNG SEF, FreightDesk, courses,
 * apps) needs identical capture behaviour, and the backend should be swappable in
 * exactly one place.
 *
 * SETUP — see ~/Desktop/Community/WAITLIST-BACKEND.md (2 minutes, free).
 *   Chosen backend: Web3Forms. Paste the access key into W3F_KEY below and every
 *   form on every page goes live at once. 250 submissions/month on the free tier.
 *   Until then the rail falls back to a pre-filled mailto, which works today.
 *
 * Nothing here takes money. Every list is free to join.
 */
(function () {
  "use strict";

  /* ── config ─────────────────────────────────────────────────────────────── */
  var W3F_KEY = "";                                    // ← paste Web3Forms access key
  var ENDPOINT = "";                                   // ← or any generic form backend
  var GFORM_FIELDS = { email: "", list: "" };          // ← only if ENDPOINT is a Google Form
  var FALLBACK_TO = "yusuf.gadelrab06@gmail.com";
  var W3F_URL = "https://api.web3forms.com/submit";

  var STORE_KEY = "yg.waitlist.v1";        // lists this browser has joined
  var LOG_KEY = "yg.waitlist.log.v1";      // full local backup of every submission
  var QUEUE_KEY = "yg.waitlist.queue.v1";  // failed sends, retried on next load

  var live = !!(W3F_KEY || ENDPOINT);

  /* ── storage helpers ────────────────────────────────────────────────────── */
  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || fallback); }
    catch (e) { return JSON.parse(fallback); }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { return false; }  // private browsing — never fail a signup over storage
  }

  function joined() { return read(STORE_KEY, "[]"); }
  function log() { return read(LOG_KEY, "[]"); }
  function queue() { return read(QUEUE_KEY, "[]"); }

  function record(list, email, status) {
    var entries = log();
    entries.push({ list: list, email: email, ts: new Date().toISOString(), status: status, page: location.pathname });
    if (entries.length > 200) entries = entries.slice(-200);
    write(LOG_KEY, entries);
  }

  function markJoined(list, email) {
    var all = joined();
    if (all.indexOf(list) === -1) all.push(list);
    write(STORE_KEY, all);
    write(STORE_KEY + ".email", email);
  }

  function enqueue(list, email) {
    var q = queue();
    for (var i = 0; i < q.length; i++) if (q[i].list === list && q[i].email === email) return;
    q.push({ list: list, email: email, ts: new Date().toISOString() });
    write(QUEUE_KEY, q.slice(-50));
  }

  function dequeue(list, email) {
    write(QUEUE_KEY, queue().filter(function (e) { return !(e.list === list && e.email === email); }));
  }

  /* ── validation ─────────────────────────────────────────────────────────── */
  function clean(value) { return (value || "").trim().replace(/\s+/g, ""); }

  function valid(email) {
    if (email.length < 6 || email.length > 254) return false;
    if (!/^[^\s@,;<>]+@[^\s@,;<>]+\.[A-Za-z]{2,24}$/.test(email)) return false;
    if (/\.\.|^\.|\.@|@\./.test(email)) return false;
    return true;
  }

  /* ── transport ──────────────────────────────────────────────────────────── */
  function post(list, email) {
    if (W3F_KEY) {
      return fetch(W3F_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: W3F_KEY,
          subject: "Waitlist: " + list,
          from_name: "DHAHAB waitlist",
          list: list,
          email: email,
          source: location.href,
          botcheck: ""
        })
      }).then(function (r) { return r.json().catch(function () { return { success: r.ok }; }); })
        .then(function (j) { if (!j || j.success !== true) throw new Error(j && j.message || "rejected"); return true; });
    }

    if (ENDPOINT && GFORM_FIELDS.email) {
      var gd = new FormData();
      gd.append(GFORM_FIELDS.email, email);
      if (GFORM_FIELDS.list) gd.append(GFORM_FIELDS.list, list);
      // Google Forms blocks CORS reads but accepts the POST — no-cors is the only route,
      // so this path is fire-and-hope and cannot report a real server error.
      return fetch(ENDPOINT, { method: "POST", mode: "no-cors", body: gd }).then(function () { return true; });
    }

    if (ENDPOINT) {
      var fd = new FormData();
      fd.append("email", email);
      fd.append("list", list);
      fd.append("source", location.href);
      return fetch(ENDPOINT, { method: "POST", body: fd, headers: { Accept: "application/json" } })
        .then(function (r) { if (!r.ok) throw new Error("http " + r.status); return true; });
    }

    return Promise.reject(new Error("no-endpoint"));
  }

  function mailtoFallback(list, email) {
    var subject = encodeURIComponent("Waitlist: " + list);
    var body = encodeURIComponent("Add me to the " + list + " waitlist.\n\nEmail: " + email + "\n");
    window.location.href = "mailto:" + FALLBACK_TO + "?subject=" + subject + "&body=" + body;
  }

  /* ── retry anything stranded by a dropped connection ────────────────────── */
  function flushQueue() {
    if (!live) return;
    queue().forEach(function (e) {
      post(e.list, e.email).then(function () {
        dequeue(e.list, e.email);
        record(e.list, e.email, "sent-retry");
      }).catch(function () { /* stays queued for the next load */ });
    });
  }

  /* ── presentation ───────────────────────────────────────────────────────── */
  var CSS = [
    ".yg-wl-msg{margin:0;display:flex;align-items:center;gap:10px;",
    "font-family:var(--display-pro,'Inter',system-ui,sans-serif);font-size:13px;",
    "letter-spacing:.4px;line-height:1.5;color:var(--gold-2,#e6c766);",
    "animation:ygwlIn .5s cubic-bezier(.2,.7,.3,1) both}",
    ".yg-wl-msg--pad{padding:14px 16px;border:1px solid var(--line,rgba(212,175,55,.22));",
    "border-left:2px solid var(--gold,#d4af37);border-radius:var(--radius,4px);",
    "background:linear-gradient(90deg,rgba(212,175,55,.07),rgba(212,175,55,0))}",
    ".yg-wl-mark{flex:0 0 auto;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;",
    "border:1px solid var(--gold,#d4af37);color:var(--gold,#d4af37);font-size:11px;line-height:1}",
    ".yg-wl-err{color:var(--warn,#e0b341)}",
    ".yg-wl-err a{color:inherit}",
    ".yg-wl-hp{position:absolute!important;left:-9999px!important;width:1px;height:1px;overflow:hidden;opacity:0}",
    "@keyframes ygwlIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}",
    "@media (prefers-reduced-motion:reduce){.yg-wl-msg{animation:none}}"
  ].join("");

  function injectCSS() {
    if (document.getElementById("yg-wl-css")) return;
    var s = document.createElement("style");
    s.id = "yg-wl-css";
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  function successBlock(text) {
    return '<p class="yg-wl-msg yg-wl-msg--pad" role="status"><span class="yg-wl-mark">&#10003;</span>' +
      '<span>' + text + '</span></p>';
  }

  /* ── wiring ─────────────────────────────────────────────────────────────── */
  function attach(formId, emailId, noteId, listName) {
    var form = document.getElementById(formId);
    var input = document.getElementById(emailId);
    var note = document.getElementById(noteId);
    if (!form || !input) return;

    injectCSS();

    if (joined().indexOf(listName) !== -1) {
      form.innerHTML = successBlock("You’re on the " + listName + " list.");
      return;
    }

    // Honeypot: bots fill every field they find, humans never see this one.
    var hp = document.createElement("input");
    hp.type = "text";
    hp.name = "botcheck";
    hp.className = "yg-wl-hp";
    hp.tabIndex = -1;
    hp.setAttribute("autocomplete", "off");
    hp.setAttribute("aria-hidden", "true");
    form.appendChild(hp);

    var btn = form.querySelector("button, input[type=submit]");
    var btnLabel = btn ? (btn.textContent || btn.value || "Save my spot") : "";
    var busy = false;

    function say(text, isError) {
      if (!note) return;
      note.innerHTML = text;
      note.className = (note.className || "").replace(/\s*yg-wl-err/g, "") + (isError ? " yg-wl-err" : "");
    }

    function done(text) {
      form.innerHTML = successBlock(text);
      form.setAttribute("aria-live", "polite");
    }

    input.addEventListener("input", function () {
      if (note && /yg-wl-err/.test(note.className)) say(note.getAttribute("data-original") || "", false);
    });
    if (note) note.setAttribute("data-original", note.innerHTML);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (busy) return;                        // double-submit guard #1: in-flight lock

      if (hp.value) { done("You’re on the list."); return; }   // silent bot drop

      var email = clean(input.value).toLowerCase();
      input.value = email;

      if (!valid(email)) {
        say("That email doesn’t look right — check it and try again.", true);
        input.focus();
        input.select();
        return;
      }

      busy = true;                             // double-submit guard #2: disabled control
      if (btn) { btn.disabled = true; btn.setAttribute("aria-busy", "true"); if (btn.textContent !== undefined) btn.textContent = "Saving…"; }
      input.readOnly = true;

      record(listName, email, live ? "attempt" : "mailto");

      if (!live) {
        mailtoFallback(listName, email);
        markJoined(listName, email);
        done("Your email app is open with the message ready.");
        say("Hit send in your mail app and you’re on the list — I reply to every one.", false);
        return;
      }

      enqueue(listName, email);                // banked before the network call, so a
                                               // dropped connection never loses a signup
      post(listName, email).then(function () {
        dequeue(listName, email);
        record(listName, email, "sent");
        markJoined(listName, email);
        done("You’re on the list.");
        say("One email when this opens. Nothing else, ever.", false);
      }).catch(function () {
        record(listName, email, "failed");     // stays in the queue, retried next visit
        busy = false;
        input.readOnly = false;
        if (btn) { btn.disabled = false; btn.removeAttribute("aria-busy"); if (btn.textContent !== undefined) btn.textContent = btnLabel; }
        say('Couldn’t reach the server — saved locally and retried automatically. ' +
          'Or email me now: <a href="mailto:' + FALLBACK_TO + '?subject=Waitlist:%20' +
          encodeURIComponent(listName) + '">' + FALLBACK_TO + "</a>", true);
      });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", flushQueue);
  else flushQueue();

  window.YGWaitlist = {
    attach: attach,
    joined: joined,
    log: log,
    queue: queue,
    valid: valid,
    endpointConfigured: live,
    exportCSV: function () {
      return ["list,email,timestamp,status,page"].concat(log().map(function (e) {
        return [e.list, e.email, e.ts, e.status, e.page].map(function (v) {
          return '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
        }).join(",");
      })).join("\n");
    }
  };
})();
