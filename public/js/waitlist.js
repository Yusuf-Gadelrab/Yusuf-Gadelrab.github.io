/* YGWaitlist — one waitlist rail for every product surface.
 *
 * WHY a shared file: every product page (Circle, KXNG SEF, FreightDesk, courses,
 * apps) needs the same capture behaviour, and the endpoint should be swappable in
 * exactly one place when the real form backend is wired up.
 *
 * SETUP (5 minutes, free):
 *   Option A — Formspree: create a form at formspree.io, paste the endpoint below.
 *   Option B — Google Form: create a form with one short-answer "email" field and one
 *              "list" field, take the formResponse URL and the two entry.NNN ids, and
 *              set ENDPOINT + GFORM_FIELDS accordingly.
 *   Option C — leave ENDPOINT empty. The form falls back to a pre-filled mailto, which
 *              works today with zero signups and zero cost.
 */
(function () {
  "use strict";

  var ENDPOINT = "";                                   // paste form backend URL here
  var GFORM_FIELDS = { email: "", list: "" };          // only for Google Forms
  var FALLBACK_TO = "yusuf.gadelrab06@gmail.com";
  var STORE_KEY = "yg.waitlist.v1";

  function joined() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || "[]"); }
    catch (e) { return []; }
  }

  function remember(list, email) {
    try {
      var all = joined();
      if (all.indexOf(list) === -1) all.push(list);
      localStorage.setItem(STORE_KEY, JSON.stringify(all));
      localStorage.setItem(STORE_KEY + ".email", email);
    } catch (e) { /* private browsing — not worth failing the signup over */ }
  }

  function valid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }

  function send(list, email) {
    if (!ENDPOINT) {
      var subject = encodeURIComponent("Waitlist: " + list);
      var body = encodeURIComponent(
        "Add me to the " + list + " waitlist.\n\nEmail: " + email + "\n"
      );
      window.location.href = "mailto:" + FALLBACK_TO + "?subject=" + subject + "&body=" + body;
      return Promise.resolve(true);
    }
    var data = new FormData();
    if (GFORM_FIELDS.email) {
      data.append(GFORM_FIELDS.email, email);
      if (GFORM_FIELDS.list) data.append(GFORM_FIELDS.list, list);
      // Google Forms rejects CORS reads but accepts the POST; no-cors is the only way.
      return fetch(ENDPOINT, { method: "POST", mode: "no-cors", body: data }).then(function () { return true; });
    }
    data.append("email", email);
    data.append("list", list);
    return fetch(ENDPOINT, { method: "POST", body: data, headers: { Accept: "application/json" } })
      .then(function (r) { return r.ok; });
  }

  function attach(formId, emailId, noteId, listName) {
    var form = document.getElementById(formId);
    var input = document.getElementById(emailId);
    var note = document.getElementById(noteId);
    if (!form || !input) return;

    if (joined().indexOf(listName) !== -1) {
      form.innerHTML = '<p style="margin:0;color:var(--gold-2);font-family:var(--display-pro);' +
        'letter-spacing:.4px">You’re on the ' + listName + ' list. ✓</p>';
      return;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = (input.value || "").trim();
      if (!valid(email)) {
        if (note) { note.textContent = "That email doesn’t look right — check it and try again."; note.style.color = "var(--warn)"; }
        input.focus();
        return;
      }
      var btn = form.querySelector("button");
      if (btn) { btn.disabled = true; btn.textContent = "Saving…"; }

      send(listName, email).then(function () {
        remember(listName, email);
        form.innerHTML = '<p style="margin:0;color:var(--gold-2);font-family:var(--display-pro);' +
          'letter-spacing:.4px">You’re on the list. ✓</p>';
        if (note) {
          note.textContent = ENDPOINT
            ? "You’ll hear from me the hour this opens. Nothing else, ever."
            : "Your email app just opened with the message ready — hit send and you’re on the list.";
          note.style.color = "";
        }
      }).catch(function () {
        if (btn) { btn.disabled = false; btn.textContent = "Save my spot"; }
        if (note) {
          note.innerHTML = 'Something went wrong on my end. Email me directly: ' +
            '<a href="mailto:' + FALLBACK_TO + '?subject=Waitlist:%20' + encodeURIComponent(listName) + '">' +
            FALLBACK_TO + '</a>';
          note.style.color = "var(--warn)";
        }
      });
    });
  }

  window.YGWaitlist = { attach: attach, joined: joined, endpointConfigured: !!ENDPOINT };
})();
