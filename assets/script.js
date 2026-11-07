(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // Live donor registry (Rakt Setu). Change this one line if the address changes.
  var APP = 'https://rakt-setugov.netlify.app';
  $$('[data-app]').forEach(function (a) { a.href = a.getAttribute('href').replace('https://rakt-setugov.netlify.app', APP); a.target = '_blank'; a.rel = 'noopener'; });

  // Mobile menu
  var btn = $('.menu-btn'), menu = $('#menu');
  btn.addEventListener('click', function () {
    var open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });
  $$('#menu a').forEach(function (a) { a.addEventListener('click', function () { menu.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }); });

  // Eligibility checker
  var form = $('#checker form'), out = $('#checker .result');
  var reasons = {
    q1: 'Donors need to be 18 to 65 years old.',
    q2: 'Donors need to weigh at least 45 kg.',
    q3: 'Wait until you feel completely well.',
    q4: 'Wait until 3 months (men) or 4 months (women) have passed since your last donation.',
    q5: 'Wait 12 months after major surgery, a transfusion, a tattoo or a piercing.',
    q6: 'Wait until 12 months after delivery and until you have stopped breastfeeding.',
  };
  form.addEventListener('change', function () {
    var answers = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'].map(function (q) { var c = form.querySelector('input[name=' + q + ']:checked'); return [q, c && c.value]; });
    var no = answers.filter(function (a) { return a[1] === 'n'; });
    var done = answers.every(function (a) { return a[1]; });
    out.className = 'result';
    out.innerHTML = '';
    if (no.length) {
      out.classList.add('no');
      out.innerHTML = '<b>Not right now.</b> ' + no.map(function (a) { return reasons[a[0]]; }).join(' ') + ' Thank you for wanting to help. You can still <a href="#top" class="share-link">share this page</a> with someone who can donate.';
      var l = $('.share-link', out); l.addEventListener('click', function (e) { e.preventDefault(); $('.share').scrollIntoView({ behavior: 'smooth' }); });
    } else if (done) {
      out.classList.add('ok');
      out.innerHTML = '<b>You can most likely donate!</b> The blood bank will confirm with a quick check-up. <a href="' + APP + '/register" target="_blank" rel="noopener">Register as a donor →</a>';
    }
  });

  // Blood group matcher (red cells / whole blood)
  var GIVE = {
    'O−': ['O−', 'O+', 'A−', 'A+', 'B−', 'B+', 'AB−', 'AB+'], 'O+': ['O+', 'A+', 'B+', 'AB+'],
    'A−': ['A−', 'A+', 'AB−', 'AB+'], 'A+': ['A+', 'AB+'],
    'B−': ['B−', 'B+', 'AB−', 'AB+'], 'B+': ['B+', 'AB+'],
    'AB−': ['AB−', 'AB+'], 'AB+': ['AB+'],
  };
  var NOTES = {
    'O−': 'O− is the universal red-cell donor: hospitals use it in emergencies when there is no time to test.',
    'AB+': 'AB+ is the universal red-cell recipient, but can only give red cells to other AB+ patients.',
  };
  function receiveFrom(g) { return Object.keys(GIVE).filter(function (d) { return GIVE[d].indexOf(g) > -1; }); }
  function pills(el, list) { el.innerHTML = ''; list.forEach(function (g) { var s = document.createElement('span'); s.textContent = g; el.appendChild(s); }); }
  var groupBtns = $$('.groups button');
  function pick(b) {
    groupBtns.forEach(function (x) { x.setAttribute('aria-checked', String(x === b)); x.tabIndex = x === b ? 0 : -1; });
    var g = b.textContent.trim();
    pills($('#giveTo'), GIVE[g]); pills($('#getFrom'), receiveFrom(g));
    $('#matchNote').textContent = NOTES[g] || (g.indexOf('−') > -1 ? 'Rh-negative groups are rare in India, so negative donors are especially valuable.' : 'Positive groups are the most common in India.');
  }
  groupBtns.forEach(function (b, i) {
    b.addEventListener('click', function () { pick(b); });
    b.addEventListener('keydown', function (e) {
      var d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (d) { e.preventDefault(); var n = groupBtns[(i + d + groupBtns.length) % groupBtns.length]; pick(n); n.focus(); }
    });
  });
  pick($('.groups [aria-checked=true]'));

  // Share
  var url = location.href.split('#')[0];
  var text = 'Did you know one blood donation can help up to 3 patients? Check if you can donate and find donors near you: ' + url;
  $('#shareWa').href = 'https://wa.me/?text=' + encodeURIComponent(text);
  $('#shareCopy').addEventListener('click', function () {
    var b = this;
    if (navigator.share) { navigator.share({ title: document.title, text: text, url: url }).catch(function () {}); return; }
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { b.textContent = 'Copied ✓'; setTimeout(function () { b.textContent = 'Copy link'; }, 2000); });
  });
})();
