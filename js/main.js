/* =====================================================================
   CLIMATE HABITS — the only JavaScript file
   It does three small jobs:
     1. Opens and closes the menu on phones.
     2. Runs the habit checklist (remembers ticks, "Clear my choices").
     3. Daily reminders (calendar file) and the "Did it?" check-in pop-up.
   The site still works if JavaScript is turned off; ticks just
   aren't remembered.
   ===================================================================== */

/* ---------- 0. Page editor (only on your own computer) ----------
   When the page is opened from your computer (not the live website),
   load js/editor.js, which adds an "Edit this page" button.
   It must run first, so the editor can copy the page before anything
   below changes it (for example re-ticking saved checklist boxes). */
(function () {
  var isLocal = location.protocol === 'file:' ||
    location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  if (!isLocal) return;
  window.__ORIGINAL_HTML__ = document.documentElement.outerHTML;
  var s = document.createElement('script');
  s.src = 'js/editor.js';
  document.body.appendChild(s);
})();

/* ---------- 1. Mobile menu ---------- */
(function () {
  var button = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (!button || !nav) return;

  function setOpen(open) {
    nav.classList.toggle('is-open', open);
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  // Tap the Menu button: flip between open and closed
  button.addEventListener('click', function () {
    setOpen(!nav.classList.contains('is-open'));
  });

  // Tap any link in the menu: close it
  nav.addEventListener('click', function (event) {
    if (event.target.closest('a')) setOpen(false);
  });

  // Press Escape: close it and put focus back on the button
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      setOpen(false);
      button.focus();
    }
  });
})();

/* ---------- 2. Habit checklist ---------- */
(function () {
  var form = document.getElementById('habit-checklist');
  if (!form) return; // this page has no checklist

  var boxes = form.querySelectorAll('input[type="checkbox"]');
  var resetButton = document.getElementById('check-reset');
  var STORAGE_KEY = 'climate-habits-checklist';

  // Read saved ticks. Saved as a list of checkbox ids, e.g. ["food-1","move-3"]
  function load() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      boxes.forEach(function (box) {
        box.checked = saved.indexOf(box.id) !== -1;
      });
    } catch (error) {
      // Storage is blocked (private window, etc). The checklist still works,
      // it just will not remember.
    }
  }

  function save() {
    var ticked = [];
    boxes.forEach(function (box) {
      if (box.checked) ticked.push(box.id);
    });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ticked));
    } catch (error) { /* see note above */ }
  }

  // Any tick or untick anywhere in the form
  form.addEventListener('change', function () {
    save();
  });

  resetButton.addEventListener('click', function () {
    boxes.forEach(function (box) { box.checked = false; });
    save();
  });

  load();
})();

/* ---------- 3. Daily reminders + check-in ----------
   A website can't send phone notifications on its own schedule without a
   paid push server. So "Remind me" downloads a calendar file with one
   reminder a day for 7 days, and the phone's calendar does the notifying.
   Each reminder links back here, where a pop-up asks "Did you do it?"
   for every ticked habit. The pop-up also opens by itself on the first
   visit each day during that week.
   Everything is stored in this browser only (localStorage). */
(function () {
  var PLAN_KEY = 'climate-habits-plan';
  var DAYS = 7, HOUR = 19;   // reminders at 7:00 pm, for 7 days

  function readPlan() {
    try { return JSON.parse(localStorage.getItem(PLAN_KEY)); } catch (e) { return null; }
  }
  function writePlan(plan) {
    try { localStorage.setItem(PLAN_KEY, JSON.stringify(plan)); } catch (e) { /* storage blocked */ }
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function dayKey(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function dayNumber(plan, d) {   // 1..7 during the week
    var start = new Date(plan.start + 'T00:00:00');
    var today = new Date(dayKey(d) + 'T00:00:00');
    return Math.round((today - start) / 86400000) + 1;
  }

  /* ----- The calendar file ----- */
  function icsText(s) { return s.replace(/\\/g, '\\\\').replace(/[,;]/g, '\\$&').replace(/\n/g, '\\n'); }
  function fold(line) {   // calendar lines must be at most 75 bytes long
    var out = '', bytes = 0, enc = new TextEncoder();
    for (var ch of line) {
      var b = enc.encode(ch).length;
      if (bytes + b > 74) { out += '\r\n '; bytes = 1; }
      out += ch; bytes += b;
    }
    return out;
  }
  function buildCalendar(plan, link) {
    var stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    var list = plan.habits.map(function (h) { return '- ' + h.text; }).join('\n');
    var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Climate Habits//Reminders//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
    for (var i = 0; i < DAYS; i++) {
      var d = new Date(plan.start + 'T00:00:00');
      d.setDate(d.getDate() + i);
      var date = dayKey(d).replace(/-/g, '');
      lines.push('BEGIN:VEVENT',
        'UID:climate-habits-' + plan.id + '-' + i + '@climate-habits',
        'DTSTAMP:' + stamp,
        'DTSTART:' + date + 'T' + pad(HOUR) + '0000',
        'DTEND:' + date + 'T' + pad(HOUR) + '1500',
        'SUMMARY:' + icsText('Climate habits check-in (day ' + (i + 1) + ' of ' + DAYS + ')'),
        'DESCRIPTION:' + icsText('Did you do your habits today?\n' + list + '\n\nTap to check in: ' + link),
        'URL:' + link,
        'BEGIN:VALARM', 'ACTION:DISPLAY', 'TRIGGER:PT0M',
        'DESCRIPTION:' + icsText('Climate habits: did you do it today?'),
        'END:VALARM', 'END:VEVENT');
    }
    lines.push('END:VCALENDAR');
    return lines.map(fold).join('\r\n') + '\r\n';
  }
  window.__buildCalendar = buildCalendar;   // used for testing only

  /* ----- "Remind me" button ----- */
  var remindButton = document.getElementById('remind-me');
  if (remindButton) {
    var status = document.createElement('p');
    status.id = 'remind-status';
    status.setAttribute('aria-live', 'polite');
    remindButton.parentNode.appendChild(status);

    remindButton.addEventListener('click', function () {
      var ticked = document.querySelectorAll('#habit-checklist input[type="checkbox"]:checked');
      if (!ticked.length) { status.textContent = 'Tick at least one habit first.'; return; }

      var first = new Date();
      if (first.getHours() >= HOUR) first.setDate(first.getDate() + 1);   // too late today: start tomorrow
      var plan = {
        id: Date.now().toString(36),
        start: dayKey(first),
        habits: Array.prototype.map.call(ticked, function (box) {
          return { id: box.id, text: box.parentNode.textContent.trim() };
        }),
        log: {},
        lastShown: dayKey(new Date())   // don't pop up right after signing up
      };
      writePlan(plan);

      var link = location.href.split('#')[0] + '#checkin';
      var a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([buildCalendar(plan, link)], { type: 'text/calendar' }));
      a.download = 'climate-habit-reminders.ics';
      document.body.appendChild(a);
      a.click();
      a.remove();
      status.textContent = 'Downloaded! Open the file and add the events to your calendar: 7 daily reminders at 7 pm. Each one links back here so you can check in.';
    });
  }

  /* ----- Check-in pop-up ----- */
  function openCheckin(plan, day) {
    var old = document.getElementById('checkin');
    if (old) old.remove();
    var today = dayKey(new Date());
    var answers = plan.log[today] || {};

    var dlg = document.createElement('dialog');
    dlg.id = 'checkin';
    dlg.className = 'checkin';
    dlg.setAttribute('aria-labelledby', 'checkin-title');
    dlg.innerHTML = '<h2 id="checkin-title"></h2><ul class="checkin-list"></ul>' +
      '<p class="checkin-score"></p><button type="button" class="btn checkin-close">Close</button>';
    dlg.querySelector('h2').textContent = (day >= 1 && day <= DAYS)
      ? 'Day ' + day + ' of ' + DAYS + ': did you do it today?' : 'Did you do it today?';
    var ul = dlg.querySelector('ul');

    plan.habits.forEach(function (h) {
      var li = document.createElement('li');
      var label = document.createElement('span');
      label.textContent = h.text;
      li.appendChild(label);
      var row = document.createElement('div');
      row.className = 'checkin-buttons';
      [['done', 'Did it ✓'], ['notyet', 'Not yet']].forEach(function (opt) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'checkin-btn checkin-' + opt[0];
        b.textContent = opt[1];
        b.setAttribute('aria-pressed', answers[h.id] === opt[0] ? 'true' : 'false');
        b.addEventListener('click', function () {
          answers[h.id] = opt[0];
          plan.log[today] = answers;
          writePlan(plan);
          row.querySelectorAll('button').forEach(function (x) {
            x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
          });
          updateScore();
        });
        row.appendChild(b);
      });
      li.appendChild(row);
      ul.appendChild(li);
    });

    function updateScore() {
      var done = 0;
      Object.keys(plan.log).forEach(function (k) {
        Object.keys(plan.log[k]).forEach(function (id) { if (plan.log[k][id] === 'done') done++; });
      });
      dlg.querySelector('.checkin-score').textContent = done ? 'Habits done so far this week: ' + done : '';
    }
    updateScore();

    dlg.querySelector('.checkin-close').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('close', function () { dlg.remove(); });
    document.body.appendChild(dlg);
    dlg.showModal();
  }

  var plan = readPlan();
  if (!plan || !plan.habits || !plan.habits.length) return;
  var now = new Date();
  var day = dayNumber(plan, now);
  var fromReminder = location.hash === '#checkin';
  var firstVisitToday = plan.lastShown !== dayKey(now);
  if (fromReminder || (day >= 1 && day <= DAYS && firstVisitToday)) {
    plan.lastShown = dayKey(now);
    writePlan(plan);
    openCheckin(plan, day);
  }
})();
