/* ══════════════════════════════════════════════════════════════════
   ILUD TRANSIT — panels
   The full record, Find, Plan a route, the Travelcard, Notices.
   ══════════════════════════════════════════════════════════════════ */
window.PANELS = (function () {
'use strict';
var T = window.TRN, N = window.NET;
if (!T) return null;
var $ = T.$, $$ = T.$$, esc = T.esc, D = T.D;

function node(html) { var d = document.createElement('div'); d.innerHTML = html; return d.firstElementChild; }

/* ── little shared pieces ──────────────────────────────────────── */
function pills(f) {
  var out = [];
  var c = T.confById[f.confidence];
  out.push('<span class="pill pill--' + (f.confidence === 'high' ? 'hi' : f.confidence === 'medium' ? 'md' : 'ex') +
    '"><i></i>' + esc(c.name) + '</span>');
  out.push('<span class="pill">' + esc(T.effortById[f.effort].name) + '</span>');
  if (f.install === 'none') out.push('<span class="pill">Nothing to install</span>');
  else out.push('<span class="pill">Needs ' + esc(f.install === 'extension' ? 'an extension' : f.install === 'app' ? 'an app' : 'an account') + '</span>');
  (f.platforms || []).forEach(function (p) { out.push('<span class="pill">' + esc(T.platById[p].name) + '</span>'); });
  return '<div class="pmeta">' + out.join('') + '</div>';
}

function actionBlock(f, id) {
  var a = f.action;
  if (a.kind === 'query') {
    return '<div class="card__q" style="margin-top:18px">' +
      '<input type="search" id="' + id + '" inputmode="search" autocomplete="off" placeholder="' +
      esc(a.placeholder || 'What are you looking for?') + '" aria-label="What are you looking for?">' +
      '<button type="button" data-go="1">Go</button></div>' +
      '<p style="margin:9px 0 0;font-size:.78rem;color:#83765d">' + esc(a.note || 'Opens in a new tab.') + '</p>';
  }
  if (a.kind === 'steps') return '';
  return '<button class="pact" type="button" data-go="1"><span>' + esc(a.label) + '</span>' +
    (a.kind === 'copy' ? T.ICON.copy : T.ICON.ext) + '</button>' +
    (a.note ? '<p style="margin:9px 0 0;font-size:.78rem;color:#83765d">' + esc(a.note) + '</p>' : '');
}

function wireAction(body, f) {
  var input = body.querySelector('.card__q input');
  body.querySelectorAll('[data-go]').forEach(function (b) {
    b.addEventListener('click', function () { T.launch(f, input ? input.value : ''); });
  });
  if (input) input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); T.launch(f, this.value); }
  });
}

/* ══ the full record ═════════════════════════════════════════════ */
function record(f, openSteps) {
  T.panelOpen({
    kicker: T.lineById[f.approach].name + ' line',
    render: function (body) { drawRecord(body, f, openSteps); }
  });
}

function drawRecord(body, f, openSteps) {
  var a = f.action, cat = T.catById[f.category], L = T.lineById[f.approach];
  var h = '';
  h += '<h2 class="ptitle">' + esc(f.title) + '</h2>';
  h += '<p class="psub">' + esc(f.summary) + '</p>';
  h += '<div class="pmeta" style="margin-top:12px"><span class="pill" style="color:' + L.colour +
       ';border-color:' + L.colour + '55"><i></i>' + esc(f.service) + '</span>' +
       '<span class="pill">' + esc(cat.name) + '</span></div>';
  h += actionBlock(f, 'recQ');
  h += pills(f);

  h += '<section class="sec"><h3>What changes</h3><p>' + esc(f.changes) + '</p></section>';

  if (f.steps && f.steps.length) {
    h += '<section class="sec"><h3>Step by step</h3><ol class="steps">' +
      f.steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol></section>';
  }

  h += '<details class="fold"' + (openSteps ? '' : '') + '><summary>How it works</summary><div class="fold__in"><p style="font-family:var(--serif);font-size:.95rem;line-height:1.6;color:#a4957c;margin:0">' +
    esc(f.how) + '</p>' +
    (a.kind === 'copy' ? '<code class="code">' + esc(a.text) + '</code>' : '') +
    (a.kind === 'query' ? '<code class="code">' + esc(a.url.replace('{q}', '…')) + '</code>' : '') +
    '</div></details>';

  if (f.caveats && f.caveats.length) {
    h += '<section class="sec"><h3>Good to know</h3><ul class="bul">' +
      f.caveats.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul></section>';
  }

  var alts = (f.alternatives || []).map(function (id) { return T.byId[id]; }).filter(Boolean);
  if (alts.length) {
    h += '<section class="sec"><h3>Other ways to the same place</h3><ul class="rows">' +
      alts.map(function (o) {
        var OL = T.lineById[o.approach];
        return '<li><button class="row" type="button" data-fix="' + esc(o.id) + '" style="color:' + OL.colour + '">' +
          '<span class="row__bul"></span><span class="row__t"><b>' + esc(o.title) + '</b>' +
          '<i>' + esc(o.service) + ' &middot; ' + esc(OL.name) + '</i></span>' +
          '<span class="row__go">' + T.ICON.chev + '</span></button></li>';
      }).join('') + '</ul></section>';
  }

  h += '<section class="sec"><h3>Where this came from</h3><ul class="srcs">' +
    (f.sources || []).map(function (s) {
      return '<li><a href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer">' +
        '<b>' + esc(s.kind) + '</b>' + esc(s.title) + ' <i>&nearr;</i></a></li>';
    }).join('') +
    '</ul><p style="margin:12px 0 0;font-size:.76rem;color:#6f6450;letter-spacing:.04em">' +
    esc(T.freshness(f.verified)) + '</p></section>';

  var kept = T.isKept(f.id);
  h += '<button class="pact pact--ghost" type="button" data-keep="1">' +
    '<span>' + (kept ? 'Remove from travelcard' : 'Keep on my travelcard') + '</span></button>';
  h += '<button class="pact pact--ghost" type="button" data-show="1"><span>Show this stop on the map</span></button>';

  body.innerHTML = h;
  wireAction(body, f);

  body.querySelectorAll('[data-fix]').forEach(function (b) {
    b.addEventListener('click', function () { record(T.byId[b.getAttribute('data-fix')]); });
  });
  var kb = body.querySelector('[data-keep]');
  kb.addEventListener('click', function () {
    var on = T.toggleKeep(f.id);
    kb.querySelector('span').textContent = on ? 'Remove from travelcard' : 'Keep on my travelcard';
  });
  body.querySelector('[data-show]').addEventListener('click', function () {
    T.panelCloseAll();
    setTimeout(function () { N.select(f.id, true); }, 400);
  });
}

/* ══ Find ════════════════════════════════════════════════════════ */
function find() {
  T.panelOpen({
    kicker: 'Find a stop', focus: '.sfield input',
    render: function (body) {
      body.innerHTML =
        '<h2 class="ptitle" style="font-size:1.5rem">What is bothering you?</h2>' +
        '<div class="sfield" style="margin-top:14px">' +
          '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.4"/><path d="m15.8 15.8 4.4 4.4"/></svg>' +
          '<input type="search" inputmode="search" autocomplete="off" spellcheck="false" placeholder="google, instagram, summaries…" aria-label="Search the network">' +
          '<button type="button" hidden>Clear</button>' +
        '</div>' +
        '<div id="findOut"></div>';
      var input = body.querySelector('input');
      var clear = body.querySelector('.sfield button');
      var out = body.querySelector('#findOut');
      function idle() {
        var recent = (T.store.get('recent', []) || []).map(function (id) { return T.byId[id]; }).filter(Boolean).slice(0, 6);
        var pop = D.fixes.slice().sort(function (a, b) { return T.weight(b) - T.weight(a); }).slice(0, 8);
        out.innerHTML =
          (recent.length ? '<section class="sec"><h3>Where you have been</h3>' + rowsOf(recent) + '</section>' : '') +
          '<section class="sec"><h3>Busiest stops</h3>' + rowsOf(pop) + '</section>';
        wireRows(out);
      }
      function run() {
        var q = input.value.trim();
        clear.hidden = !q;
        if (!q) { idle(); return; }
        var hits = T.search(q);
        out.innerHTML = hits.length
          ? '<section class="sec"><h3>' + hits.length + (hits.length === 1 ? ' stop' : ' stops') + '</h3>' + rowsOf(hits) + '</section>'
          : '<p class="empty">Nothing on the network matches that. Try the service name — “youtube”, “gmail”, “word” — or the nuisance itself, like “summaries”.</p>';
        wireRows(out);
      }
      input.addEventListener('input', run);
      clear.addEventListener('click', function () { input.value = ''; input.focus(); run(); });
      idle();
    }
  });
}

function rowsOf(list) {
  return '<ul class="rows">' + list.map(function (f) {
    var L = T.lineById[f.approach];
    return '<li><button class="row" type="button" data-fix="' + esc(f.id) + '" style="color:' + L.colour + '">' +
      '<span class="row__bul"></span><span class="row__t"><b>' + esc(f.title) + '</b>' +
      '<i>' + esc(f.service) + ' &middot; ' + esc(L.name) + '</i></span>' +
      '<span class="row__go">' + T.ICON.chev + '</span></button></li>';
  }).join('') + '</ul>';
}
function wireRows(root) {
  root.querySelectorAll('[data-fix]').forEach(function (b) {
    b.addEventListener('click', function () { record(T.byId[b.getAttribute('data-fix')]); });
  });
}

/* ══ Plan a route ════════════════════════════════════════════════ */
function plan() {
  T.panelOpen({
    kicker: 'Plan a route',
    render: function (body) {
      body.innerHTML =
        '<h2 class="ptitle" style="font-size:1.5rem">Where would you like to get to?</h2>' +
        '<p class="psub" style="font-size:.94rem">Choose the nuisance. ILUD plots a route through the stops that deal with it, and you can ride it one stop at a time.</p>' +
        '<div class="plan" style="margin-top:20px">' +
        D.intents.map(function (it, i) {
          return '<button class="pcard" type="button" data-intent="' + esc(it.id) + '">' +
            '<span class="pcard__n">' + (i + 1) + '</span>' +
            '<span><b>' + esc(it.question) + '</b><span>' + esc(it.blurb) + '</span>' +
            '<em>' + it.fixes.length + ' stops</em></span></button>';
        }).join('') + '</div>';
      body.querySelectorAll('[data-intent]').forEach(function (b) {
        b.addEventListener('click', function () { route(b.getAttribute('data-intent')); });
      });
    }
  });
}

function route(intentId) {
  var it = D.intents.filter(function (x) { return x.id === intentId; })[0];
  if (!it) return;
  var fixes = it.fixes.map(function (id) { return T.byId[id]; }).filter(Boolean);
  T.panelOpen({
    kicker: 'Your route',
    render: function (body) {
      body.innerHTML =
        '<h2 class="ptitle" style="font-size:1.45rem">' + esc(it.question) + '</h2>' +
        '<p class="psub" style="font-size:.94rem">' + esc(it.blurb) + '</p>' +
        '<ul class="itin">' + fixes.map(function (f) {
          var L = T.lineById[f.approach];
          return '<li style="color:' + L.colour + '"><span class="itin__d"></span>' +
            '<button type="button" data-fix="' + esc(f.id) + '" style="text-align:left;width:100%">' +
            '<b>' + esc(f.title) + '</b><i>' + esc(f.service) + ' &middot; ' + esc(L.name) + ' line</i></button></li>';
        }).join('') + '</ul>' +
        '<button class="pact" type="button" data-draw="1"><span>Show the route on the map</span>' + T.ICON.arrow + '</button>' +
        '<p class="note">Stops on different lines are still one journey. Change at the gold interchange for the part of life you are in.</p>';
      wireRows(body);
      body.querySelector('[data-draw]').addEventListener('click', function () {
        T.panelCloseAll();
        setTimeout(function () {
          N.drawJourney(fixes);
          T.Snd.play('bong');
          T.toast('Route plotted — ' + fixes.length + ' stops. Tap any one of them.');
        }, 430);
      });
    }
  });
}

/* ══ the interchange ═════════════════════════════════════════════ */
function interchange(catId) {
  var cat = T.catById[catId];
  var band = N.bands.filter(function (b) { return b.cat.id === catId; })[0];
  T.panelOpen({
    kicker: 'Interchange',
    render: function (body) {
      var h = '<h2 class="ptitle">' + esc(cat.name) + '</h2>' +
              '<p class="psub">' + esc(cat.blurb) + '</p>';
      T.LINES.forEach(function (L) {
        var list = band.byLine[L.id];
        if (!list.length) return;
        h += '<section class="sec"><h3 style="color:' + L.colour + '">' + esc(L.name) +
             ' &middot; ' + list.length + '</h3>' + rowsOf(list) + '</section>';
      });
      body.innerHTML = h;
      wireRows(body);
    }
  });
}

/* ══ the travelcard ══════════════════════════════════════════════ */
function travelcard() {
  T.panelOpen({
    kicker: 'Travelcard',
    render: function (body) {
      var list = T.kept.map(function (id) { return T.byId[id]; }).filter(Boolean);
      if (!list.length) {
        body.innerHTML = '<h2 class="ptitle" style="font-size:1.5rem">Your travelcard</h2>' +
          '<p class="empty">Nothing kept yet. When a stop is one you will want again, press <b style="color:#c5ae83">Keep</b> on its card and it will wait here.</p>';
        return;
      }
      body.innerHTML = '<h2 class="ptitle" style="font-size:1.5rem">Your travelcard</h2>' +
        '<p class="psub" style="font-size:.92rem">' + list.length + (list.length === 1 ? ' stop kept' : ' stops kept') +
        ' on this device, and nowhere else.</p>' +
        '<div style="margin-top:16px">' + rowsOf(list) + '</div>' +
        '<button class="pact" type="button" data-journey="1"><span>Ride them as one route</span>' + T.ICON.arrow + '</button>';
      wireRows(body);
      var j = body.querySelector('[data-journey]');
      if (j) j.addEventListener('click', function () {
        if (list.length < 2) { T.toast('Keep at least two stops to make a route.'); T.Snd.play('err'); return; }
        T.panelCloseAll();
        setTimeout(function () { N.drawJourney(list); T.Snd.play('bong'); T.toast('Your travelcard, plotted.'); }, 430);
      });
    }
  });
}

/* ══ notices ═════════════════════════════════════════════════════ */
function notices() {
  T.panelOpen({
    kicker: 'Notices',
    render: function (body) {
      var m = D.meta;
      body.innerHTML =
        '<h2 class="ptitle">' + esc(m.name) + '<span style="font-size:.42em;letter-spacing:.34em;color:#7d7058;display:block;margin-top:.8em">' + esc(m.expanded) + '</span></h2>' +
        '<p class="psub">' + esc(m.description) + '</p>' +
        '<div class="tot">' +
          '<span><b>' + m.total + '</b><i>stops</i></span>' +
          '<span><b>4</b><i>lines</i></span>' +
          '<span><b>' + D.categories.length + '</b><i>interchanges</i></span>' +
        '</div>' +
        '<section class="sec"><h3>Riding the network</h3><ul class="bul">' +
          '<li>Drag to pan, pinch or double-tap to zoom, and use the buttons on the right to frame the whole map.</li>' +
          '<li>Tap a coloured chip at the top, or a terminus roundel, to take a line. Everything else quietens and the stop names appear.</li>' +
          '<li>Tap a stop for its card. The ▸ button rides the line on its own, one stop every few seconds.</li>' +
          '<li>The gold roundels down the middle are interchanges — one for each part of ordinary digital life.</li>' +
          '<li>On a keyboard: ↑ ↓ move along the line, ← → change line, <b>/</b> opens Find, Esc steps back.</li>' +
        '</ul></section>' +
        '<section class="sec"><h3>The four lines</h3><ul class="rows">' +
          T.LINES.map(function (L) {
            var ap = T.appById[L.id];
            return '<li><div class="row" style="color:' + L.colour + '"><span class="row__bul"></span>' +
              '<span class="row__t"><b>' + esc(ap.name) + '</b><i>' + esc(ap.blurb || '') + '</i></span></div></li>';
          }).join('') + '</ul></section>' +
        '<section class="sec"><h3>Settings</h3>' +
          '<button class="sw" type="button" role="switch" data-sw="sound" aria-checked="' + (T.prefs.sound ? 'true' : 'false') + '" data-on="' + (T.prefs.sound ? '1' : '0') + '">' +
            '<span class="sw__t"><b>Sound</b><span>Rail joints, door chimes and the validator. Synthesised in the browser; no files are downloaded.</span></span>' +
            '<span class="sw__k"></span></button>' +
          '<button class="sw" type="button" role="switch" data-sw="motion" aria-checked="' + (T.prefs.noMotion ? 'true' : 'false') + '" data-on="' + (T.prefs.noMotion ? '1' : '0') + '">' +
            '<span class="sw__t"><b>Calm the motion</b><span>Stops the map gliding and the token travelling. Your system setting is respected either way.</span></span>' +
            '<span class="sw__k"></span></button>' +
        '</section>' +
        '<section class="sec"><h3>How this is kept</h3><p>' + esc(m.maintenance) + '</p>' +
          '<p>' + esc(m.disclaimer) + '</p>' +
          '<p style="font-size:.8rem;color:#6f6450">Research window ' + esc(m.researchWindow) + ' &middot; compiled ' + esc(T.fmtDate(m.compiled)) + ' &middot; version ' + esc(m.version) + '</p>' +
        '</section>' +
        '<button class="pact pact--ghost" type="button" data-forget="1"><span>Forget everything on this device</span></button>';

      body.querySelectorAll('[data-sw]').forEach(function (b) {
        b.addEventListener('click', function () {
          var k = b.getAttribute('data-sw');
          if (k === 'sound') {
            T.prefs.sound = !T.prefs.sound;
            T.store.set('sound', T.prefs.sound);
            b.setAttribute('data-on', T.prefs.sound ? '1' : '0');
            b.setAttribute('aria-checked', T.prefs.sound ? 'true' : 'false');
            if (T.prefs.sound) { T.Snd.unlock(); T.Snd.play('chime'); }
          } else {
            T.prefs.noMotion = !T.prefs.noMotion;
            T.store.set('noMotion', T.prefs.noMotion);
            b.setAttribute('data-on', T.prefs.noMotion ? '1' : '0');
            b.setAttribute('aria-checked', T.prefs.noMotion ? 'true' : 'false');
            T.applyMotion();
            T.Snd.play('click');
          }
        });
      });
      body.querySelector('[data-forget]').addEventListener('click', function () {
        try {
          Object.keys(localStorage).forEach(function (k) {
            if (k.indexOf('ilud.trn.') === 0) localStorage.removeItem(k);
          });
        } catch (e) {}
        T.toast('Forgotten. Reloading…');
        setTimeout(function () { location.reload(); }, 900);
      });
    }
  });
}

/* ══ boot ════════════════════════════════════════════════════════ */
function boot() {
  N.build();
  N.render();
  N.measure();
  N.fitAll(false);
  N.wire();
  N.buildChips();
  N.keys();
  N.rideWire();
  T.paintCard();

  var splashN = $('#splashN');
  if (splashN) splashN.textContent = D.meta.total;

  function dock(id, fn) {
    $(id).addEventListener('click', function () {
      $$('.dock__b').forEach(function (b) { b.removeAttribute('data-on'); });
      $(id).setAttribute('data-on', '1');
      fn();
    });
  }
  dock('#dFind', find);
  dock('#dPlan', plan);
  dock('#dCard', travelcard);
  dock('#dInfo', notices);

  var splash = $('#splash');
  function enter() {
    T.Snd.unlock();
    T.Snd.play('chime');
    splash.classList.add('splash--off');
    setTimeout(function () { splash.hidden = true; }, 760);
    N.hideHintSoon();
  }
  $('#splashGo').addEventListener('click', enter);
  splash.addEventListener('click', function (e) { if (e.target === splash || e.target.classList.contains('splash__in')) enter(); });

  /* returning visitors do not need the curtain twice in one session */
  if (sessionStorage.getItem('ilud.trn.seen')) {
    splash.hidden = true;
    N.hideHintSoon();
  }
  try { sessionStorage.setItem('ilud.trn.seen', '1'); } catch (e) {}
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

return {
  record: record, find: find, plan: plan, travelcard: travelcard,
  notices: notices, interchange: interchange
};
})();
