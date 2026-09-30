/* ══════════════════════════════════════════════════════════════════
   ILUD FOLIO — the page sheet
   The full record, the index, the pocket, the colophon. And the boot.
   ══════════════════════════════════════════════════════════════════ */
(function () {
'use strict';
var F = window.FOL;
if (!F) return;
var $ = F.$, $$ = F.$$, D = F.D, esc = F.esc, I = F.ICON;

/* ── small builders ────────────────────────────────────────────── */
function chip(text, mod) {
  return '<span class="chip' + (mod ? ' chip--' + mod : '') + '">' + esc(text) + '</span>';
}
function sec(title, inner) {
  return '<section class="sec"><h4 class="sec__h">' + esc(title) + '</h4>' + inner + '</section>';
}
function confMod(c) { return c === 'high' ? 'good' : c === 'medium' ? 'mid' : 'risk'; }

function hitRow(f, n) {
  return '<button class="hit" type="button" data-open="' + esc(f.id) + '">' +
    '<span class="hit__n">' + (n < 10 ? '0' + n : n) + '</span>' +
    '<span class="hit__t"><b>' + esc(f.title) + '</b>' +
      '<i>' + esc((f.service || 'Several services') + ' · ' +
        (F.catById[f.category] ? F.catById[f.category].name : '')) + '</i></span>' +
    I.chev + '</button>';
}

/* ══ the full record ═════════════════════════════════════════════ */
function record(f) {
  F.remember(f.id);
  F.pageOpen({
    kicker: (F.catById[f.category] ? F.catById[f.category].name : 'Card') + ' · ' +
            (F.appById[f.approach] ? F.appById[f.approach].name : ''),
    render: function (body) { drawRecord(body, f); }
  });
}

function drawRecord(body, f) {
  var a = f.action;
  var conf = F.confById[f.confidence] || { name: f.confidence, blurb: '' };
  var eff = F.effortById[f.effort] || { name: f.effort };
  var h = '';

  h += '<h2 class="rec__title">' + esc(f.title) + '</h2>';
  h += '<p class="rec__sum">' + esc(f.summary) + '</p>';

  h += '<div class="rec__meta">' +
       chip(f.service || 'Several services') +
       chip(eff.name) +
       chip(conf.name, confMod(f.confidence)) +
       (f.install && f.install !== 'none' ? chip(f.install === 'extension' ? 'Needs an extension' :
            f.install === 'app' ? 'Needs an app' : 'Needs an account') : chip('Nothing to install')) +
       chip((f.platforms || []).length >= 3 ? 'Any device'
            : (f.platforms || []).map(function (p) { return F.platById[p] ? F.platById[p].name : p; }).join(' & ')) +
       '</div>';

  /* the action */
  h += '<div class="act">';
  h += '<p class="act__lab">' + esc(a.kind === 'steps' ? 'Do it yourself' : 'Do it now') + '</p>';
  if (a.kind === 'query') {
    h += '<div class="act__row">' +
         '<input type="search" id="recQ" enterkeyhint="go" autocomplete="off" autocapitalize="off" spellcheck="false" ' +
           'placeholder="' + esc(a.placeholder || 'What are you looking for?') + '" aria-label="Your search">' +
         '<button class="act__go" type="button" data-launch>Go</button></div>';
  } else if (a.kind === 'link') {
    h += '<button class="act__go act__go--wide" type="button" data-launch>' +
         '<span>' + esc(a.label || 'Open it') + '</span>' + I.ext + '</button>';
  } else if (a.kind === 'copy') {
    h += '<div class="mech">' + esc(a.text) + '</div>' +
         '<button class="act__go act__go--wide" type="button" data-launch>' +
         '<span>' + esc(a.label || 'Copy it') + '</span>' + I.copy + '</button>';
  } else {
    h += '<button class="act__go act__go--wide" type="button" data-steps>' +
         '<span>' + esc(a.label || 'Show me the steps') + '</span>' + I.list + '</button>';
  }
  if (a.note) h += '<p class="act__note">' + esc(a.note) + '</p>';
  h += '</div>';

  if (f.changes) h += sec('What changes', '<p>' + esc(f.changes) + '</p>');

  if (f.steps && f.steps.length) {
    h += sec('Step by step', '<ol id="recSteps">' + f.steps.map(function (s) {
      return '<li>' + esc(s) + '</li>';
    }).join('') + '</ol>');
  }

  if (f.how) {
    h += '<section class="sec"><details class="how"><summary>Why this works</summary>' +
         '<p>' + esc(f.how) + '</p>' +
         (a.kind === 'query' && a.url ? '<div class="mech">' + esc(a.url) + '</div>' : '') +
         '</details></section>';
  }

  if (f.caveats && f.caveats.length) {
    h += sec('Worth knowing', '<ul class="warn">' + f.caveats.map(function (c) {
      return '<li>' + esc(c) + '</li>';
    }).join('') + '</ul>');
  }

  if (f.alternatives && f.alternatives.length) {
    h += sec('If that is not for you', f.alternatives.map(function (alt) {
      var t = F.byId[alt.ref];
      if (!t) return '';
      return '<button class="alt" type="button" data-open="' + esc(t.id) + '">' +
        '<span><b>' + esc(t.title) + '</b><i>' + esc(alt.note || t.summary) + '</i></span>' + I.chev + '</button>';
    }).join(''));
  }

  var prov = '<p style="margin:0 0 .5em;font-size:.88rem;color:#5d5146">' +
    esc(F.freshness(f.verified)) + ' · ' + esc(conf.blurb || conf.name) + '</p>';
  prov += (f.sources || []).map(function (s) {
    return '<a class="src" href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer">' +
      '<b>' + esc(s.title) + '</b>' + esc(s.publisher || '') + (s.date ? ' · ' + esc(F.fmtDate(s.date)) : '') + '</a>';
  }).join('');
  h += sec('Where this came from', prov);

  var on = F.isKept(f.id);
  h += '<button class="keep' + (on ? ' keep--on' : '') + '" type="button" id="recKeep" aria-pressed="' + on + '">' +
       (on ? I.pinned : I.pin) + '<span>' + (on ? 'In your pocket' : 'Keep this card') + '</span></button>';

  body.innerHTML = h;

  var input = $('#recQ', body);
  body.addEventListener('click', function (e) {
    if (e.target.closest('[data-launch]')) {
      F.launch(f, input ? input.value : '');
      return;
    }
    if (e.target.closest('[data-steps]')) {
      var s = $('#recSteps', body);
      if (s) { s.scrollIntoView({ behavior: F.reduced() ? 'auto' : 'smooth', block: 'center' }); F.Snd.play('tick'); }
      return;
    }
    var o = e.target.closest('[data-open]');
    if (o) { var t = F.byId[o.dataset.open]; if (t) record(t); return; }
    var k = e.target.closest('#recKeep');
    if (k) {
      var nowOn = F.toggleKeep(f.id);
      k.classList.toggle('keep--on', nowOn);
      k.setAttribute('aria-pressed', String(nowOn));
      k.innerHTML = (nowOn ? I.pinned : I.pin) + '<span>' + (nowOn ? 'In your pocket' : 'Keep this card') + '</span>';
      F.toast(nowOn ? 'Kept. It is in the pocket.' : 'Taken out of the pocket.');
    }
  });
  if (input) {
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); F.launch(f, input.value); }
    });
  }
}

/* ══ the index ═══════════════════════════════════════════════════ */
function index(seed) {
  F.pageOpen({
    kicker: 'The index',
    render: function (body) { drawIndex(body, seed); }
  });
}

function drawIndex(body, seed) {
  body.innerHTML =
    '<div class="find"><input type="search" id="findQ" enterkeyhint="search" autocomplete="off" ' +
      'autocapitalize="off" spellcheck="false" placeholder="What is bothering you?" aria-label="Search the index"></div>' +
    '<div id="findAsks"></div>' +
    '<div id="findOut" aria-live="polite"></div>';

  var q = $('#findQ', body), asks = $('#findAsks', body), out = $('#findOut', body);

  function suggestions() {
    var h = '<section class="sec"><h4 class="sec__h">Start from a nuisance</h4><div class="asks">' +
      D.intents.map(function (it) {
        return '<button class="ask" type="button" data-intent="' + esc(it.id) + '">' + esc(it.question) + '</button>';
      }).join('') + '</div></section>';
    var recent = F.store.get('recent', []).map(function (id) { return F.byId[id]; }).filter(Boolean).slice(0, 5);
    if (recent.length) {
      h += sec('Cards you looked at', recent.map(function (f, i) { return hitRow(f, i + 1); }).join(''));
    }
    var pop = D.fixes.filter(function (f) { return f.featured; })
      .sort(function (a, b) { return F.weight(b) - F.weight(a); }).slice(0, 8);
    h += sec('Most asked for', pop.map(function (f, i) { return hitRow(f, i + 1); }).join(''));
    asks.innerHTML = h;
    out.innerHTML = '';
  }

  function run(term) {
    if (!term.trim()) { suggestions(); return; }
    asks.innerHTML = '';
    var res = F.search(term);
    out.innerHTML = res.length
      ? sec(res.length + ' card' + (res.length === 1 ? '' : 's'),
            res.map(function (f, i) { return hitRow(f, i + 1); }).join(''))
      : '<p class="empty">Nothing under that word yet.<br>Try a service — Google, Instagram, Word — or a nuisance, like “summaries”.</p>';
  }

  var t = null;
  q.addEventListener('input', function () {
    clearTimeout(t);
    t = setTimeout(function () { run(q.value); }, 110);
  });
  q.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); run(q.value); q.blur(); } });

  body.addEventListener('click', function (e) {
    var it = e.target.closest('[data-intent]');
    if (it) {
      var intent = D.intents.filter(function (x) { return x.id === it.dataset.intent; })[0];
      if (!intent) return;
      F.Snd.play('tick');
      asks.innerHTML = '';
      q.value = '';
      out.innerHTML = '<p class="rec__sum" style="margin:0 0 1em">' + esc(intent.blurb) + '</p>' +
        sec(intent.question, intent.fixes.map(function (id, i) {
          var f = F.byId[id];
          return f ? hitRow(f, i + 1) : '';
        }).join(''));
      return;
    }
    var o = e.target.closest('[data-open]');
    if (o) { var f = F.byId[o.dataset.open]; if (f) record(f); }
  });

  if (seed) { q.value = seed; run(seed); }
  else suggestions();
  setTimeout(function () { if (!F.reduced()) try { q.focus({ preventScroll: true }); } catch (e) {} }, 520);
}

/* ══ the pocket ══════════════════════════════════════════════════ */
function pocket() {
  F.pageOpen({ kicker: 'The pocket', render: drawPocket });
}
function drawPocket(body) {
  var list = F.kept.map(function (id) { return F.byId[id]; }).filter(Boolean);
  if (!list.length) {
    body.innerHTML = '<h2 class="rec__title">Nothing kept yet</h2>' +
      '<p class="rec__sum">When a card is worth coming back to, keep it. It waits here, on this device only ' +
      '— nothing about you leaves the browser.</p>' +
      '<p class="empty">Open any card and press <b>Keep this card</b>.</p>';
    return;
  }
  body.innerHTML = '<h2 class="rec__title">Your pocket</h2>' +
    '<p class="rec__sum">' + list.length + ' card' + (list.length === 1 ? '' : 's') +
    ', stored on this device only.</p>' +
    sec('Kept', list.map(function (f, i) { return hitRow(f, i + 1); }).join('')) +
    '<button class="keep" type="button" id="pkClear"><span>Empty the pocket</span></button>';

  body.addEventListener('click', function (e) {
    var o = e.target.closest('[data-open]');
    if (o) { var f = F.byId[o.dataset.open]; if (f) record(f); return; }
    if (e.target.closest('#pkClear')) {
      F.kept.slice().forEach(function (id) { F.toggleKeep(id); });
      F.Snd.play('unstamp');
      F.toast('The pocket is empty.');
      body.innerHTML = '';
      drawPocket(body);
    }
  });
}

/* ══ the colophon ════════════════════════════════════════════════ */
function colophon() {
  F.pageOpen({ kicker: 'Colophon', render: drawColophon });
}
function drawColophon(body) {
  var m = D.meta;
  var services = {};
  D.fixes.forEach(function (f) { if (f.service) services[f.service] = 1; });
  var h = '<h2 class="rec__title">' + esc(m.expanded || 'ILUD') + '</h2>' +
    '<p class="rec__sum">' + esc(m.description) + '</p>' +
    '<div class="tot">' +
      '<div><b>' + m.total + '</b><i>cards</i></div>' +
      '<div><b>' + D.categories.length + '</b><i>drawers</i></div>' +
      '<div><b>' + Object.keys(services).length + '</b><i>services</i></div>' +
    '</div>';

  h += sec('How to use the tray',
    '<ul><li>Swipe the top card aside to see the next one.</li>' +
    '<li>Tap a card to read the whole entry.</li>' +
    '<li>Drag the top card upward for the same thing.</li>' +
    '<li>The tabs on the right change the drawer.</li>' +
    '<li>The sun at the top deals a card at random.</li>' +
    '<li>With a keyboard: arrow keys move through cards and drawers.</li></ul>');

  h += '<section class="sec"><h4 class="sec__h">Settings</h4>' +
    '<button class="sw" type="button" id="swSound" aria-pressed="' + F.prefs.sound + '">' +
      '<span><b>Paper sounds</b><i>' + (F.Snd.have() ? 'Card slides, riffles and stamps, made by the browser.'
        : 'This browser has no audio engine.') + '</i></span><span class="sw__t"></span></button>' +
    '<button class="sw" type="button" id="swMotion" aria-pressed="' + F.prefs.noMotion + '">' +
      '<span><b>Calm the motion</b><i>Cards move instantly instead of sliding.</i></span>' +
      '<span class="sw__t"></span></button></section>';

  h += sec('About the research',
    '<p>' + esc(m.maintenance) + '</p>' +
    '<p>' + esc(m.disclaimer) + '</p>' +
    '<p>Every card carries the date it was last checked and the sources it came from. ' +
    'Where a remedy is fragile, the card says so rather than pretending otherwise.</p>');

  h += sec('Privacy',
    '<p>Nothing is sent anywhere. The pocket, the settings and the list of cards you have opened ' +
    'live in this browser\'s own storage and go no further. There is no account, no analytics, no network ' +
    'call of any kind except the ones you make by opening a card\'s destination.</p>' +
    '<button class="keep" type="button" id="cpReset"><span>Forget everything on this device</span></button>');

  h += '<p class="empty" style="margin-top:2.4em">' + esc(m.name) + ' · version ' + esc(m.version) +
       '<br>Research window ' + esc(m.researchWindow) + '</p>';

  body.innerHTML = h;

  body.addEventListener('click', function (e) {
    var s = e.target.closest('#swSound');
    if (s) {
      F.prefs.sound = !F.prefs.sound;
      F.store.set('sound', F.prefs.sound);
      s.setAttribute('aria-pressed', String(F.prefs.sound));
      if (F.prefs.sound) { F.Snd.unlock(); F.Snd.play('riffle'); }
      return;
    }
    var mo = e.target.closest('#swMotion');
    if (mo) {
      F.prefs.noMotion = !F.prefs.noMotion;
      F.store.set('noMotion', F.prefs.noMotion);
      mo.setAttribute('aria-pressed', String(F.prefs.noMotion));
      F.applyMotion();
      if (window.FOLTRAY) window.FOLTRAY.relayout();
      return;
    }
    if (e.target.closest('#cpReset')) {
      try {
        Object.keys(localStorage).filter(function (k) { return k.indexOf('ilud.fol.') === 0; })
          .forEach(function (k) { localStorage.removeItem(k); });
      } catch (err) {}
      F.kept.length = 0;
      F.paintPocket();
      F.toast('Forgotten. The tray is as it was.');
    }
  });
}

window.FOLPAGE = { record: record, index: index, pocket: pocket, colophon: colophon };

/* ══ boot ════════════════════════════════════════════════════════ */
var splash = $('#splash'), room = $('#room');
function enter() {
  F.Snd.unlock();
  F.Snd.play('slide');
  splash.classList.add('splash--off');
  room.hidden = false;
  requestAnimationFrame(function () {
    window.FOLTRAY.start();
    setTimeout(function () { splash.hidden = true; }, 760);
  });
}
$('#splashGo').addEventListener('click', enter);
splash.addEventListener('keydown', function (e) { if (e.key === 'Enter') enter(); });

$('#btnIndex').addEventListener('click', function () { F.Snd.unlock(); index(); });
$('#btnPocket').addEventListener('click', function () { F.Snd.unlock(); pocket(); });
$('#btnColophon').addEventListener('click', function () { F.Snd.unlock(); colophon(); });

/* first gesture anywhere unlocks the audio engine */
document.addEventListener('pointerdown', function once() {
  F.Snd.unlock();
  document.removeEventListener('pointerdown', once);
}, { passive: true });
})();
