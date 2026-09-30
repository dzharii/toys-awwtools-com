/* ══════════════════════════════════════════════════════════════════
   ILUD INSTRUMENT — drawers: specification, find, kept, about
   ══════════════════════════════════════════════════════════════════ */
(function () {
'use strict';
var I = window.INS; if (!I) return;
var $ = I.$, $$ = I.$$, D = I.D, esc = I.esc;

/* ── splash ────────────────────────────────────────────────────── */
var splash = $('#splash'), face = $('#face');
function begin() {
  I.Snd.unlock();
  I.Snd.play('engage');
  splash.classList.add('splash--off');
  face.hidden = false;
  setTimeout(function () { splash.hidden = true; }, 760);
  I.keptCount();
  var h = (location.hash || '').replace('#', '');
  if (h && I.byId[h]) setTimeout(function () { openSpec(h); }, 700);
}
$('#splashGo').addEventListener('click', begin);
splash.addEventListener('keydown', function (e) { if (e.key === 'Enter') begin(); });

/* ── the specification drawer ──────────────────────────────────── */
var current = null;

function chips(f) {
  var out = ['<li class="chip chip--cat">' + esc(I.catById[f.category].short) + '</li>'];
  out.push('<li class="chip">' + esc(I.appById[f.approach].name) + '</li>');
  out.push('<li class="chip">' + esc(I.effortById[f.effort].name) + '</li>');
  if (f.install !== 'none') out.push('<li class="chip">' + esc({ extension: 'Extension', app: 'App', account: 'Account' }[f.install]) + '</li>');
  if (f.confidence !== 'high') out.push('<li class="chip chip--warn">' + esc(I.confById[f.confidence].name) + '</li>');
  if (f.cost && f.cost !== 'free') out.push('<li class="chip">' + esc(f.cost === 'paid' ? 'Paid' : 'Free tier') + '</li>');
  if (f.region) out.push('<li class="chip chip--warn">' + esc(f.region) + '</li>');
  return '<ul class="chips">' + out.join('') + '</ul>';
}

function openSpec(id) {
  var f = I.byId[id]; if (!f) return;
  current = f;
  var a = f.action, h = [];

  h.push('<p class="sp__eyebrow"><span>' + esc(f.service) + '</span><i aria-hidden="true">·</i><span>' + esc(I.appById[f.approach].name) + '</span></p>');
  h.push('<h2 class="sp__title" id="specTitle">' + esc(f.title) + '</h2>');
  h.push('<p class="sp__sum">' + esc(f.summary) + '</p>');
  h.push(chips(f));

  h.push('<div class="doit">');
  if (a.kind === 'query') {
    h.push('<p class="doit__label">Do it now</p><div class="doit__row">' +
      '<input class="doit__in" id="qIn" type="search" enterkeyhint="go" autocomplete="off" ' +
      'placeholder="' + esc(a.placeholder || 'Type here') + '" aria-label="' + esc(a.placeholder || 'Your query') + '">' +
      '<button class="doit__go" id="qGo">' + esc(a.label) + '</button></div>');
  } else if (a.kind === 'link') {
    h.push('<p class="doit__label">Do it now</p><button class="doit__go" id="qGo">' + esc(a.label) + '</button>');
  } else if (a.kind === 'copy') {
    h.push('<p class="doit__label">Do it now</p><button class="doit__go" id="qGo">' + esc(a.label) + '</button>' +
      '<code class="mono">' + esc(a.text) + '</code>' +
      (a.note ? '<p class="note">' + esc(a.note) + '</p>' : ''));
  } else {
    h.push('<p class="doit__label">' + esc(a.label) + '</p>' +
      '<p class="note" style="margin-top:0">This one lives inside an app, so there is no address to open. The steps are below.</p>');
  }
  h.push('</div>');

  h.push('<section class="sec"><h3 class="sec__h">What will change</h3><p>' + esc(f.changes) + '</p></section>');

  if (f.steps && f.steps.length) {
    h.push('<section class="sec"><h3 class="sec__h">' + (a.kind === 'steps' ? 'Where to find it' : 'By hand, if you prefer') + '</h3><ol>' +
      f.steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol></section>');
  }
  if (f.how) {
    h.push('<details class="fold"><summary>How this works</summary><div class="fold__in"><p style="font-family:var(--serif);font-size:.95rem;line-height:1.6;color:#b3a289;margin:0">' + esc(f.how) + '</p>' +
      (a.kind === 'query' ? '<p class="doit__label" style="margin:14px 0 6px">The address it opens</p><code class="mono">' + esc(a.url.replace('{q}', '…')) + '</code>' : '') +
      '</div></details>');
  }
  if (f.caveats && f.caveats.length) {
    h.push('<section class="sec"><h3 class="sec__h">Worth knowing</h3><ul class="warn">' +
      f.caveats.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul></section>');
  }
  if (f.alternatives && f.alternatives.length) {
    h.push('<section class="sec"><h3 class="sec__h">If that does not suit</h3><ul class="alts">' +
      f.alternatives.map(function (alt) {
        if (alt.ref && I.byId[alt.ref]) {
          return '<li><button class="alt" data-fix="' + esc(alt.ref) + '"><span>' + esc(alt.label) + '</span>' +
            '<svg viewBox="0 0 24 24"><path d="m9 5 7 7-7 7"/></svg></button></li>';
        }
        return '<li><a class="alt" href="' + esc(alt.url) + '" target="_blank" rel="noopener noreferrer" data-alturl="' + esc(alt.url) + '">' +
          '<span>' + esc(alt.label) + '</span>' + I.ICON.ext + '</a></li>';
      }).join('') + '</ul></section>');
  }

  var conf = I.confById[f.confidence];
  h.push('<section class="sec"><h3 class="sec__h">Where this came from</h3>' +
    '<p style="font-size:.86rem">Last checked ' + esc(I.fmtDate(f.verified)) + '. Confidence: <strong style="color:#dccfb0">' + esc(conf.name.toLowerCase()) + '</strong> — ' + esc(conf.blurb) + '</p>' +
    (f.sources && f.sources.length ? '<ul class="srcs">' + f.sources.map(function (s) {
      return '<li><a href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer">' + esc(s.title) + '</a>' +
        '<small>' + esc(s.url.replace(/^https?:\/\//, '').split('/')[0]) + '</small></li>';
    }).join('') + '</ul>' : '') + '</section>');

  var on = I.kept.indexOf(f.id) > -1;
  h.push('<div class="sp__foot">' +
    '<button id="keepBtn" aria-pressed="' + on + '">' + (on ? 'Kept' : 'Keep this fix') + '</button>' +
    '<button id="linkBtn">Copy link</button></div>');

  $('#specBody').innerHTML = h.join('');
  $('#specBody').scrollTop = 0;
  wire(f);
  I.openDrawer('spec');
}

function wire(f) {
  var a = f.action, go = $('#qGo'), input = $('#qIn');
  function fire() {
    I.Snd.play('press');
    if (a.kind === 'query') {
      var q = (input.value || '').trim();
      if (!q) { input.focus(); I.Snd.play('err'); I.toast('Type what you are looking for first.'); return; }
      I.remember(f.id);
      window.open(a.url.replace('{q}', encodeURIComponent(q)), '_blank', 'noopener');
    } else if (a.kind === 'link') {
      I.remember(f.id);
      window.open(a.url, '_blank', 'noopener');
    } else if (a.kind === 'copy') {
      I.copy(a.text).then(function (ok) {
        I.toast(ok ? 'Copied. Paste it into your address bar — a web page is not allowed to open it for you.' : 'Select the address below and copy it by hand.');
      });
    }
  }
  if (go) go.addEventListener('click', fire);
  if (input) input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); fire(); } });

  $$('[data-alturl]', $('#specBody')).forEach(function (el) {
    el.addEventListener('click', function (e) {
      var u = el.dataset.alturl;
      if (u.indexOf('{q}') > -1) {
        e.preventDefault();
        var q = input && input.value.trim();
        if (!q) { I.Snd.play('err'); I.toast('Type a query in the box above first, then try this.'); if (input) input.focus(); return; }
        window.open(u.replace('{q}', encodeURIComponent(q)), '_blank', 'noopener');
      }
    });
  });

  var kb = $('#keepBtn');
  kb.addEventListener('click', function () {
    var i = I.kept.indexOf(f.id);
    if (i > -1) { I.kept.splice(i, 1); I.Snd.play('unmark'); I.toast('Taken off the rack.'); }
    else { I.kept.unshift(f.id); I.Snd.play('mark'); I.buzz(9); I.toast('Hung on the rack of kept fixes.'); }
    I.store.set('kept', I.kept);
    var on = I.kept.indexOf(f.id) > -1;
    kb.setAttribute('aria-pressed', String(on));
    kb.textContent = on ? 'Kept' : 'Keep this fix';
    I.keptCount();
  });
  $('#linkBtn').addEventListener('click', function () {
    var url = location.href.split('#')[0] + '#' + f.id;
    I.copy(url).then(function (ok) { I.toast(ok ? 'Link copied.' : url); });
  });
}

$('#useFix').addEventListener('click', function () {
  var f = window.INS_DIAL && window.INS_DIAL.current();
  if (f) { I.Snd.play('press'); openSpec(f.id); }
});

/* jump between fixes from anywhere */
document.addEventListener('click', function (e) {
  var b = e.target.closest('[data-fix]');
  if (!b) return;
  var id = b.dataset.fix;
  if (b.closest('#specBody')) { openSpec(id); return; }
  I.closeTop();
  setTimeout(function () {
    if (window.INS_DIAL) window.INS_DIAL.show(id);
    openSpec(id);
  }, 260);
});

/* ── rows ──────────────────────────────────────────────────────── */
function rowHTML(f, showCat) {
  var c = I.catById[f.category];
  return '<li><button class="row" data-fix="' + esc(f.id) + '">' +
    '<span class="row__ic"><svg viewBox="0 0 24 24">' + (I.G[f.category] || I.G.search) + '</svg></span>' +
    '<span class="row__tx"><span class="row__t">' + esc(f.title) + '</span>' +
    '<span class="row__s">' + esc(f.service) + (showCat ? ' · ' + esc(c.short) : '') + ' · ' + esc(I.appById[f.approach].name) + '</span></span>' +
    '<svg viewBox="0 0 24 24" class="row__go" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>' +
    '</button></li>';
}

/* ── find ──────────────────────────────────────────────────────── */
var INTENT_ICON = {
  answering: 'search', deciding: 'shopping', generating: 'images',
  interrupting: 'writing', learning: 'everyday'
};
function score(f, q) {
  var s = 0, t = q.toLowerCase();
  if (f.title.toLowerCase().indexOf(t) > -1) s += 12;
  if (f.service.toLowerCase().indexOf(t) > -1) s += 10;
  if (f.summary.toLowerCase().indexOf(t) > -1) s += 6;
  if ((f.changes || '').toLowerCase().indexOf(t) > -1) s += 3;
  if ((f.how || '').toLowerCase().indexOf(t) > -1) s += 2;
  if ((f.tags || []).join(' ').toLowerCase().indexOf(t) > -1) s += 4;
  if (I.catById[f.category].name.toLowerCase().indexOf(t) > -1) s += 4;
  return s + (f.popularity || 0) * 0.4;
}
function renderFind(q) {
  var body = $('#findBody');
  q = (q || '').trim();
  $('#findClear').hidden = !q;
  if (!q) {
    var h = [];
    h.push('<p class="group__h">Where does it bother you?</p><ul class="rows">');
    h.push(D.intents.map(function (it) {
      return '<li><button class="row" data-intent="' + esc(it.id) + '">' +
        '<span class="row__ic"><svg viewBox="0 0 24 24">' + (I.G[INTENT_ICON[it.id]] || I.G.search) + '</svg></span>' +
        '<span class="row__tx"><span class="row__t">' + esc(it.question) + '</span>' +
        '<span class="row__s">' + esc(it.blurb) + '</span></span>' +
        '<svg viewBox="0 0 24 24" class="row__go" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></button></li>';
    }).join(''));
    h.push('</ul>');
    var feat = D.fixes.filter(function (f) { return f.featured; }).slice(0, 8);
    h.push('<p class="group__h">Most asked for</p><ul class="rows">' + feat.map(function (f) { return rowHTML(f, true); }).join('') + '</ul>');
    body.innerHTML = h.join('');
    return;
  }
  var hits = D.fixes.map(function (f) { return { f: f, s: score(f, q) }; })
    .filter(function (x) { return x.s > 2; })
    .sort(function (a, b) { return b.s - a.s; })
    .slice(0, 24);
  if (!hits.length) {
    body.innerHTML = '<p class="empty">Nothing here answers to “' + esc(q) + '”. Try the name of a service — Google, Instagram, Word — or what is in your way, such as “summaries” or “generated images”.</p>';
    return;
  }
  body.innerHTML = '<p class="group__h">' + hits.length + ' ' + (hits.length === 1 ? 'remedy' : 'remedies') + '</p>' +
    '<ul class="rows">' + hits.map(function (x) { return rowHTML(x.f, true); }).join('') + '</ul>';
}
var findT = null;
$('#findIn').addEventListener('input', function () {
  clearTimeout(findT);
  var v = this.value;
  findT = setTimeout(function () { renderFind(v); }, 110);
});
$('#findClear').addEventListener('click', function () {
  $('#findIn').value = ''; renderFind(''); $('#findIn').focus();
});
$('#btnFind').addEventListener('click', function () {
  I.Snd.unlock(); renderFind($('#findIn').value); I.openDrawer('find');
});

document.addEventListener('click', function (e) {
  var b = e.target.closest('[data-intent]');
  if (!b) return;
  var it = D.intents.filter(function (x) { return x.id === b.dataset.intent; })[0];
  if (!it) return;
  var fixes = it.fixes.map(function (id) { return I.byId[id]; }).filter(Boolean);
  $('#findBody').innerHTML =
    '<p class="group__h">' + esc(it.question) + '</p>' +
    '<p style="margin:0 0 14px;font-family:var(--serif);color:#9b8c72;font-size:.94rem;line-height:1.55">' + esc(it.blurb) + '</p>' +
    '<ul class="rows">' + fixes.map(function (f) { return rowHTML(f, true); }).join('') + '</ul>' +
    '<button class="alt" id="findBack" style="margin-top:18px;justify-content:center"><span>Back to all questions</span></button>';
  $('#findBody').scrollTop = 0;
  I.Snd.play('press');
  $('#findBack').addEventListener('click', function () { renderFind(''); I.Snd.play('press'); });
});

/* ── kept ──────────────────────────────────────────────────────── */
function renderKept() {
  var body = $('#keptBody');
  var list = I.kept.map(function (id) { return I.byId[id]; }).filter(Boolean);
  var recent = I.store.get('recent', []).map(function (id) { return I.byId[id]; }).filter(Boolean).slice(0, 6);
  var h = [];
  if (!list.length) {
    h.push('<p class="empty">Nothing kept yet. Open a fix and press <em>Keep this fix</em>, and it will hang here so you can reach it in one turn next time.</p>');
  } else {
    h.push('<p class="group__h">' + list.length + ' kept</p><ul class="rows">' + list.map(function (f) { return rowHTML(f, true); }).join('') + '</ul>');
  }
  if (recent.length) {
    h.push('<p class="group__h">Recently used</p><ul class="rows">' + recent.map(function (f) { return rowHTML(f, true); }).join('') + '</ul>');
  }
  body.innerHTML = h.join('');
}
$('#btnKept').addEventListener('click', function () { I.Snd.unlock(); renderKept(); I.openDrawer('kept'); });

/* ── about ─────────────────────────────────────────────────────── */
function renderAbout() {
  var m = D.meta;
  var h = ['<div class="ab">'];
  h.push('<p><strong>' + esc(m.tagline) + '</strong></p>');
  h.push('<p>' + esc(m.description) + '</p>');
  h.push('<p>This is the <strong>Instrument</strong> — one of ten interpretations of the same catalogue. ' +
    'The outer ring chooses a part of your day. The hub chooses a remedy within it. ' +
    'Both are detented: they will not settle between two things.</p>');

  h.push('<div class="switches">');
  h.push('<button class="sw" id="swSound" aria-pressed="' + I.prefs.sound + '">' +
    '<span class="sw__t">Mechanical sound<span class="sw__s">Clicks and detents, synthesised — no files, no network</span></span>' +
    '<span class="sw__led" aria-hidden="true"></span></button>');
  h.push('<button class="sw" id="swMotion" aria-pressed="' + I.prefs.noMotion + '">' +
    '<span class="sw__t">Still movement<span class="sw__s">Removes momentum and animation</span></span>' +
    '<span class="sw__led" aria-hidden="true"></span></button>');
  h.push('</div>');

  h.push('<p class="meta">' + esc(m.disclaimer) + '</p>');
  h.push('<p class="meta" style="border:0;padding-top:0;margin-top:12px">' + esc(m.maintenance) + '</p>');
  h.push('<p class="meta" style="border:0;padding-top:0;margin-top:12px">' +
    m.total + ' remedies across ' + D.categories.length + ' categories. Catalogue compiled ' + esc(I.fmtDate(m.compiled)) + '. ' +
    'Version ' + esc(m.version) + '. Nothing you do here leaves this device — the kept rack lives in your browser alone.</p>');
  h.push('</div>');
  $('#aboutBody').innerHTML = h.join('');

  $('#swSound').addEventListener('click', function () {
    I.prefs.sound = !I.prefs.sound;
    I.store.set('sound', I.prefs.sound);
    this.setAttribute('aria-pressed', String(I.prefs.sound));
    if (I.prefs.sound) { I.Snd.unlock(); I.Snd.play('detent'); }
  });
  $('#swMotion').addEventListener('click', function () {
    I.prefs.noMotion = !I.prefs.noMotion;
    I.store.set('noMotion', I.prefs.noMotion);
    this.setAttribute('aria-pressed', String(I.prefs.noMotion));
    document.body.classList.toggle('no-motion', I.reduced());
    I.Snd.play('press');
  });
}
$('#btnAbout').addEventListener('click', function () { I.Snd.unlock(); renderAbout(); I.openDrawer('about'); });

/* unlock audio on the very first gesture anywhere */
window.addEventListener('pointerdown', function once() {
  I.Snd.unlock();
  window.removeEventListener('pointerdown', once);
}, { passive: true });

I.keptCount();
})();
