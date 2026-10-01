/* ══════════════════════════════════════════════════════════════════
   ILUD QUARTERLY — the article
   A leaf unfolds over the issue: the whole entry, its workings, its
   footnotes and its provenance. Also the index, the marked pages and
   the colophon, which share the same sheet.
   ══════════════════════════════════════════════════════════════════ */
window.ART = (function () {
'use strict';
var E = window.ED, P = window.PLATES, L = window.LEAF;
var $ = E.$, $$ = E.$$, esc = E.esc;

var art, scrim, run, body;
var stack = [], openedAt = 0, closingAll = false, lastFocus = null;

var SHIELD = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2 5 5.8v5.5c0 4.3 2.9 7.6 7 9.5 4.1-1.9 7-5.2 7-9.5V5.8Z"/><path d="m9 12 2.2 2.2L15.4 10"/></svg>';
var ARROW  = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-5.6-6 6 6-6 6"/></svg>';
var RIBBON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10v18l-5-4-5 4Z"/></svg>';
var OUT    = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>';

/* ══ the sheet ═══════════════════════════════════════════════════ */
function push(view) {
  var fresh = !stack.length;
  stack.push(view);
  if (fresh) {
    lastFocus = document.activeElement;
    art.hidden = false; scrim.hidden = false;
    document.body.classList.add('is-open');
    openedAt = Date.now();
    requestAnimationFrame(function () { art.classList.add('art--on'); scrim.classList.add('scrim--on'); });
    E.Snd.play('open');
  } else {
    art.classList.add('art--flip');
    setTimeout(function () { art.classList.remove('art--flip'); }, 260);
    E.Snd.play('turn');
  }
  try { history.pushState({ ilud: stack.length }, ''); } catch (e) {}
  render();
}

function pop() {
  if (!stack.length) return;
  try { history.back(); } catch (e) { drop(); }
}
function popAll() {
  var d = stack.length;
  if (!d) return;
  closingAll = true;
  try { history.go(-d); } catch (e) { stack.length = 0; teardown(); closingAll = false; }
  setTimeout(function () {
    if (closingAll) { closingAll = false; stack.length = 0; teardown(); }
  }, 420);
}
function drop() {
  stack.pop();
  if (!stack.length) teardown();
  else { render(); E.Snd.play('back'); }
}
function teardown() {
  art.classList.remove('art--on'); scrim.classList.remove('scrim--on');
  document.body.classList.remove('is-open');
  E.Snd.play('shut');
  setTimeout(function () {
    if (stack.length) return;
    art.hidden = true; scrim.hidden = true; body.innerHTML = '';
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus({ preventScroll: true }); } catch (e) {} }
  }, 320);
}

function render() {
  var v = stack[stack.length - 1];
  if (!v) return;
  body.scrollTop = 0;
  if (v.kind === 'fix') { run.textContent = runHead(E.byId[v.id]); body.innerHTML = fixHTML(E.byId[v.id]); wireFix(E.byId[v.id], v.focus); }
  else if (v.kind === 'index') { run.textContent = 'Index of services'; body.innerHTML = indexHTML(); wireIndex(); }
  else if (v.kind === 'marked') { run.textContent = 'Marked pages'; body.innerHTML = markedHTML(); wireMarked(); }
  else if (v.kind === 'colophon') { run.textContent = 'Colophon'; body.innerHTML = colophonHTML(); wireColophon(); }
  body.focus({ preventScroll: true });
}

function runHead(f) {
  var ch = E.chapterOf[f.category];
  return ch.cat.name + ' · page ' + E.folioOf[f.id];
}

/* ══ an entry, entire ════════════════════════════════════════════ */
function fixHTML(f) {
  var ch = E.chapterOf[f.category];
  var ap = E.appById[f.approach];
  var ef = E.effortById[f.effort];
  var cf = E.confById[f.confidence];
  var deck = f.summary || '';
  var drop = deck.charAt(0), restDeck = deck.slice(1);
  var h = '';

  h += '<p class="a__eye">' + L.two(ch.n) + ' <i>/</i> ' + esc(ch.cat.name) +
       ' <span class="a__dot">&middot;</span> ' + esc(f.service) + '</p>';
  h += '<h2 class="a__h" id="artHead">' + esc(f.title) + '</h2>';
  h += '<p class="a__deck"><span class="a__drop">' + esc(drop) + '</span>' + esc(restDeck) + '</p>';

  h += '<p class="a__tags">' +
    '<span class="tag tag--' + esc(f.approach) + '">' + esc(ap.name) + '</span>' +
    '<span class="tag">' + esc(ef.name) + '</span>' +
    (f.install !== 'none' ? '<span class="tag">Needs ' + esc(f.install === 'extension' ? 'an extension' : f.install === 'app' ? 'an app' : 'an account') + '</span>' : '') +
    (f.platforms || []).map(function (p) { return '<span class="tag tag--q">' + esc(E.platById[p].name) + '</span>'; }).join('') +
  '</p>';

  /* the act itself */
  h += '<div class="act" id="act">' + actHTML(f) + '</div>';

  if (f.changes) {
    h += '<p class="a__chg"><i>What changes.</i> ' + esc(f.changes) + '</p>';
  }

  h += sect('How it works', '<p>' + esc(f.how) + '</p>');

  if (f.steps && f.steps.length) {
    h += sect('Step by step', '<ol class="a__steps">' +
      f.steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>');
  }

  if (f.caveats && f.caveats.length) {
    h += sect('If it stops working', '<ul class="a__cav">' +
      f.caveats.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>');
  }

  if (f.alternatives && f.alternatives.length) {
    h += sect('Other ways', '<ul class="a__alts">' +
      f.alternatives.map(function (a) {
        var label = esc(a.service || a.title || 'Another option');
        return '<li>' + (a.url
          ? '<a href="' + esc(a.url) + '" target="_blank" rel="noopener noreferrer">' + label + OUT + '</a>'
          : '<b>' + label + '</b>') +
          (a.note ? '<span>' + esc(a.note) + '</span>' : '') + '</li>';
      }).join('') + '</ul>');
  }

  /* footnotes */
  if (f.sources && f.sources.length) {
    h += sect('Sources', '<ol class="a__src">' +
      f.sources.map(function (s) {
        return '<li><a href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer">' +
          esc(s.title) + '<span>' + esc(s.kind) + '</span></a></li>';
      }).join('') + '</ol>');
  }

  /* the colophon line of the entry */
  h += '<p class="a__col"><span class="ver ver--lg">' + SHIELD + esc(E.freshness(f.verified)) + '</span>' +
    '<span class="a__conf">Confidence: ' + esc(cf.name.toLowerCase()) + ' &mdash; ' + esc(cf.blurb) + '</span></p>';

  if (f.confidence === 'experimental') {
    h += '<p class="a__warn">This one is a curiosity rather than a guarantee. It has been seen to work, ' +
      'it does no harm, and it may stop working without notice.</p>';
  }

  /* marking, and the neighbours */
  h += '<div class="a__end">' +
    '<button class="mark' + (E.isMarked(f.id) ? ' mark--on' : '') + '" id="markBtn" type="button" aria-pressed="' +
      (E.isMarked(f.id) ? 'true' : 'false') + '">' + RIBBON +
      '<span>' + (E.isMarked(f.id) ? 'Marked' : 'Mark this page') + '</span></button>' +
    '<button class="a__chapter" type="button" data-ch="' + esc(ch.cat.id) + '">' +
      'Go to ' + esc(ch.cat.name) + ARROW + '</button>' +
  '</div>';

  /* related, from the same chapter */
  var near = ch.entries.filter(function (x) { return x.id !== f.id; }).slice(0, 3);
  if (near.length) {
    h += '<div class="a__near"><p class="sect__h">Also in this chapter</p><ul class="lst">' +
      near.map(rowHTML).join('') + '</ul></div>';
  }
  return h;
}

function sect(title, inner) {
  return '<section class="sect"><p class="sect__h">' + esc(title) + '</p>' + inner + '</section>';
}

function actHTML(f) {
  var a = f.action;
  if (a.kind === 'query') {
    return '<label class="act__lab" for="qIn">' + esc(a.label || 'Search without the extras') + '</label>' +
      '<div class="act__row">' +
        '<input class="act__in" id="qIn" type="search" enterkeyhint="go" autocomplete="off" ' +
          'placeholder="' + esc(a.placeholder || 'What are you looking for?') + '">' +
        '<button class="act__go" id="qGo" type="button" aria-label="Open it">' + ARROW + '</button>' +
      '</div>' +
      (a.note ? '<p class="act__note">' + esc(a.note) + '</p>' : '') +
      '<details class="mech"><summary>Show the mechanism</summary><p><code>' +
        esc(String(a.url).replace(/\{q\}/g, '\u2026')) + '</code></p></details>';
  }
  if (a.kind === 'copy') {
    return '<label class="act__lab">' + esc(a.label || 'Copy this') + '</label>' +
      '<div class="act__row act__row--copy"><code class="act__code" id="qCode">' + esc(a.text) + '</code>' +
      '<button class="act__go" id="qCopy" type="button" aria-label="Copy">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/>' +
        '<path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg></button></div>' +
      (a.note ? '<p class="act__note">' + esc(a.note) + '</p>' : '');
  }
  if (a.kind === 'link') {
    return '<button class="act__big" id="qLink" type="button"><span>' + esc(a.label || 'Open it') + '</span>' + OUT + '</button>' +
      (a.note ? '<p class="act__note">' + esc(a.note) + '</p>' : '');
  }
  return '<p class="act__steps">' + esc(a.label || 'Follow the steps below.') +
    (a.note ? ' ' + esc(a.note) : '') + '</p>';
}

function wireFix(f, focusAct) {
  var a = f.action;
  if (a.kind === 'query') {
    var inp = $('#qIn', body), go = $('#qGo', body);
    var fire = function () { if (E.launch(f, inp.value)) inp.blur(); };
    go.addEventListener('click', fire);
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); fire(); } });
    inp.addEventListener('input', function () { E.Snd.play('nib'); });
    if (focusAct) setTimeout(function () { try { inp.focus(); } catch (e) {} }, 360);
  } else if (a.kind === 'copy') {
    $('#qCopy', body).addEventListener('click', function () { E.copy(a.text); });
    $('#qCode', body).addEventListener('click', function () { E.copy(a.text); });
  } else if (a.kind === 'link') {
    $('#qLink', body).addEventListener('click', function () { E.launch(f); });
  }
  var m = $('#markBtn', body);
  m.addEventListener('click', function () {
    var on = E.toggleMark(f.id);
    m.classList.toggle('mark--on', on);
    m.setAttribute('aria-pressed', on ? 'true' : 'false');
    $('span', m).textContent = on ? 'Marked' : 'Mark this page';
    if (window.LEAF) window.LEAF.repaint();
  });
  $$('[data-ch]', body).forEach(function (b) {
    b.addEventListener('click', function () {
      var id = b.getAttribute('data-ch');
      popAll();
      setTimeout(function () { window.LEAF.go(id); }, 380);
    });
  });
  wireList();
  E.noteRead(f.id);
}

/* ══ a row in any list ═══════════════════════════════════════════ */
function rowHTML(f) {
  var ch = E.chapterOf[f.category];
  return '<li><button class="row" type="button" data-fix="' + esc(f.id) + '">' +
    '<span class="row__p">' + P.plate(f.id, 'square') + '</span>' +
    '<span class="row__t"><b>' + esc(f.title) + '</b>' +
      '<span class="row__m">' + esc(f.service) + ' <i>&middot;</i> ' + esc(ch.cat.name) +
      ' <i>&middot;</i> p.' + E.folioOf[f.id] + '</span></span>' +
    '<span class="row__go">' + ARROW + '</span>' +
    (E.isMarked(f.id) ? '<span class="row__rib"></span>' : '') +
  '</button></li>';
}
function wireList() {
  $$('[data-fix]', body).forEach(function (b) {
    if (b.__w) return; b.__w = 1;
    b.addEventListener('click', function () { open(E.byId[b.getAttribute('data-fix')]); });
  });
}

/* ══ the index, at the back of the book ══════════════════════════ */
function indexHTML() {
  var h = '<p class="a__eye">The back of the book</p>' +
    '<h2 class="a__h a__h--sm" id="artHead">Index</h2>' +
    '<p class="a__deck a__deck--sm">Every service in the issue, and the pages on which it appears. ' +
    'Type to narrow it, or read it as one would read any index &mdash; by running a finger down the column.</p>' +
    '<div class="idx__find"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/></svg>' +
    '<input id="idxIn" type="search" enterkeyhint="search" autocomplete="off" placeholder="A service, a bother, a word&hellip;">' +
    '<button id="idxX" type="button" aria-label="Clear" hidden>&times;</button></div>' +
    '<div id="idxOut"></div>';
  return h;
}

function idxByService() {
  var m = {};
  E.D.fixes.forEach(function (f) { (m[f.service] = m[f.service] || []).push(f); });
  return Object.keys(m).sort(function (a, b) { return a.localeCompare(b); })
    .map(function (k) {
      return { service: k, fixes: m[k].sort(function (a, b) { return E.folioOf[a.id] - E.folioOf[b.id]; }) };
    });
}

function idxListHTML() {
  var groups = idxByService();
  var letter = '';
  var h = '<ol class="idx">';
  groups.forEach(function (g) {
    var l = g.service.charAt(0).toUpperCase();
    if (l !== letter) { letter = l; h += '<li class="idx__l" aria-hidden="true">' + esc(letter) + '</li>'; }
    h += '<li class="idx__g"><b>' + esc(g.service) + '</b><span class="idx__lead" aria-hidden="true"></span>' +
      '<span class="idx__p">' + g.fixes.map(function (f) {
        return '<button type="button" data-fix="' + esc(f.id) + '" aria-label="' + esc(f.title) + '">' +
          E.folioOf[f.id] + '</button>';
      }).join('') + '</span></li>';
  });
  return h + '</ol>';
}

function idxResultsHTML(q) {
  var r = E.search(q);
  if (!r.length) {
    return '<p class="idx__none">Nothing under that heading. Try the name of a website, ' +
      'or what bothers you about it &mdash; <i>summaries</i>, <i>suggestions</i>, <i>generated</i>.</p>';
  }
  return '<p class="idx__n">' + r.length + (r.length === 1 ? ' entry' : ' entries') + '</p>' +
    '<ul class="lst">' + r.slice(0, 40).map(rowHTML).join('') + '</ul>';
}

function wireIndex() {
  var out = $('#idxOut', body), inp = $('#idxIn', body), x = $('#idxX', body);
  var draw = function () {
    var q = inp.value.trim();
    x.hidden = !q;
    out.innerHTML = q ? idxResultsHTML(q) : idxListHTML();
    wireList();
  };
  draw();
  var t = 0;
  inp.addEventListener('input', function () {
    E.Snd.play('nib');
    clearTimeout(t); t = setTimeout(draw, 110);
  });
  inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') e.preventDefault(); });
  x.addEventListener('click', function () { inp.value = ''; draw(); inp.focus(); });
}

/* ══ marked pages ════════════════════════════════════════════════ */
function markedHTML() {
  var list = E.marked.map(function (id) { return E.byId[id]; }).filter(Boolean);
  var h = '<p class="a__eye">Kept by you</p>' +
    '<h2 class="a__h a__h--sm" id="artHead">Marked pages</h2>';
  if (!list.length) {
    h += '<p class="a__deck a__deck--sm">Nothing marked yet. Open any entry and press ' +
      '<b>Mark this page</b>; a ribbon will be laid in, and it will wait for you here. ' +
      'The ribbons live in this browser alone &mdash; we keep no account of you.</p>' +
      '<div class="a__end"><button class="a__chapter" type="button" id="mkStart">Start at chapter one' + ARROW + '</button></div>';
    return h;
  }
  h += '<p class="a__deck a__deck--sm">' + list.length + (list.length === 1 ? ' ribbon' : ' ribbons') +
    ', most recent first. They are kept in this browser only.</p>' +
    '<ul class="lst">' + list.map(rowHTML).join('') + '</ul>';

  var reads = E.read.filter(function (id) { return E.marked.indexOf(id) < 0; })
    .map(function (id) { return E.byId[id]; }).filter(Boolean).slice(0, 6);
  if (reads.length) {
    h += sect('Recently read', '<ul class="lst">' + reads.map(rowHTML).join('') + '</ul>');
  }
  return h;
}

function wireMarked() {
  wireList();
  var start = $('#mkStart', body);
  if (start) start.addEventListener('click', function () { popAll(); });
}

/* ══ the colophon ════════════════════════════════════════════════ */
function colophonHTML() {
  var m = E.D.meta;
  var counts = E.D.categories.map(function (c) {
    var ch = E.chapterOf[c.id];
    return '<li><b>' + L.two(ch.n) + '</b><span>' + esc(c.name) + '</span><i>' + ch.entries.length + '</i></li>';
  }).join('');
  var h = '<p class="a__eye">About this issue</p>' +
    '<h2 class="a__h a__h--sm" id="artHead">Colophon</h2>' +
    '<p class="a__deck a__deck--sm"><span class="a__drop">I</span>LUD is a catalogue of practical ways to use ' +
    'ordinary websites with less machine assistance than they now offer by default. It takes no view on whether ' +
    'that assistance is good or bad. It only assumes that the choice belongs to the person using the machine.</p>';

  h += sect('The issue', '<ul class="col__facts">' +
    '<li><span>Entries</span><b>' + m.total + '</b></li>' +
    '<li><span>Chapters</span><b>' + E.CHAPTERS.length + '</b></li>' +
    '<li><span>Compiled</span><b>' + esc(E.fmtDate(m.compiled)) + '</b></li>' +
    '<li><span>Version</span><b>' + esc(m.version) + '</b></li>' +
    '</ul><ol class="col__ch">' + counts + '</ol>');

  h += sect('How entries are chosen', '<p>Each entry had to be lawful, safe for ordinary use, and checked to ' +
    'work at the time of compilation. Official settings are preferred where they exist, because they last longer. ' +
    'Where none exists, an unofficial method is acceptable &mdash; a query operator, an address, a filter list, ' +
    'a substitute service &mdash; provided it can be explained and verified. Every entry carries its sources and ' +
    'the date it was last checked.</p><p>The web moves. A method that was dependable in September may fail by ' +
    'November. Where an entry is fragile, tied to one browser, or plainly odd, it says so on its own page.</p>');

  h += sect('What this does not do', '<p>It does not ask who you are. It does not send anything anywhere. ' +
    'There is no account, no analytics, no server: the whole issue is a handful of files, and your marked pages ' +
    'sit in this browser\u2019s own storage where you may erase them at any moment.</p>');

  h += '<section class="sect"><p class="sect__h">Setting</p><div class="sw">' +
    swHTML('cSound', 'Paper sounds', 'The turn of a leaf, a nib, the press of a stamp.', E.prefs.sound) +
    swHTML('cMotion', 'Reduce motion', 'Pages change without the turn. Everything still works.', E.prefs.noMotion) +
    '</div></section>';

  h += '<div class="a__end a__end--col">' +
    '<button class="a__chapter a__chapter--warn" id="cWipe" type="button">Forget everything</button></div>';

  h += '<p class="a__col col__last">' + esc(m.disclaimer || '') + '</p>';
  return h;
}

function swHTML(id, name, note, on) {
  return '<button class="sw__b" id="' + id + '" type="button" role="switch" aria-checked="' + (on ? 'true' : 'false') + '">' +
    '<span class="sw__t"><b>' + esc(name) + '</b><i>' + esc(note) + '</i></span>' +
    '<span class="sw__k" aria-hidden="true"></span></button>';
}

function wireColophon() {
  var s = $('#cSound', body), m2 = $('#cMotion', body), w = $('#cWipe', body);
  s.addEventListener('click', function () {
    E.prefs.sound = !E.prefs.sound;
    E.store.set('sound', E.prefs.sound);
    s.setAttribute('aria-checked', E.prefs.sound ? 'true' : 'false');
    if (E.prefs.sound) { E.Snd.unlock(); E.Snd.play('settle'); }
  });
  m2.addEventListener('click', function () {
    E.prefs.noMotion = !E.prefs.noMotion;
    E.store.set('noMotion', E.prefs.noMotion);
    m2.setAttribute('aria-checked', E.prefs.noMotion ? 'true' : 'false');
    E.applyMotion();
    E.Snd.play('tick');
  });
  w.addEventListener('click', function () {
    if (w.dataset.sure !== '1') {
      w.dataset.sure = '1';
      w.textContent = 'Tap again to erase the ribbons';
      E.Snd.play('err');
      setTimeout(function () { if (w.dataset.sure === '1') { w.dataset.sure = ''; w.textContent = 'Forget everything'; } }, 4200);
      return;
    }
    E.store.wipe();
    E.marked.length = 0;
    E.paintMarkCount();
    if (window.LEAF) window.LEAF.repaint();
    w.dataset.sure = '';
    w.textContent = 'Forget everything';
    E.toast('Erased. The issue is as you first found it.');
    E.Snd.play('unstamp');
  });
  var start = $('#mkStart', body);
  if (start) start.addEventListener('click', function () { popAll(); });
}

/* ══ opening ═════════════════════════════════════════════════════ */
function open(f, focusAct) { push({ kind: 'fix', id: f.id, focus: !!focusAct }); }

return {
  open: open, push: push, pop: pop, popAll: popAll,
  depth: function () { return stack.length; },
  rowHTML: rowHTML, wireList: wireList, sect: sect,
  SHIELD: SHIELD, ARROW: ARROW, RIBBON: RIBBON, OUT: OUT,
  _bind: function (o) { art = o.art; scrim = o.scrim; run = o.run; body = o.body; },
  _drop: drop,
  _state: function () { return { stack: stack, openedAt: openedAt, get closingAll() { return closingAll; },
    setClosing: function (v) { closingAll = v; }, teardown: teardown }; },
  _body: function () { return body; }
};
})();

/* ══════════════════════════════════════════════════════════════════
   BOOT — the issue is opened
   ══════════════════════════════════════════════════════════════════ */
(function () {
'use strict';
var E = window.ED, A = window.ART, P = window.PLATES;
var $ = E.$;

A._bind({ art: $('#art'), scrim: $('#scrim'), run: $('#artRun'), body: $('#artBody') });
var S = A._state();

/* the article sheet closes on the scrim, on the cross, on Escape and on back */
$('#scrim').addEventListener('click', function () {
  if (Date.now() - S.openedAt < 420) return;
  A.pop();
});
$('#artX').addEventListener('click', function () { A.pop(); });
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && A.depth()) { e.preventDefault(); A.pop(); }
});
window.addEventListener('popstate', function () {
  if (S.closingAll) { S.stack.length = 0; S.setClosing(false); S.teardown(); return; }
  if (A.depth()) A._drop();
});

/* the running foot */
$('#fIndex').addEventListener('click', function () { A.push({ kind: 'index' }); });
$('#fMarked').addEventListener('click', function () { A.push({ kind: 'marked' }); });
$('#fColophon').addEventListener('click', function () { A.push({ kind: 'colophon' }); });
$('#mastWm').addEventListener('click', function () {
  if (A.depth()) { A.popAll(); return; }
  var r = $('#rail');
  r.classList.add('rail--flash');
  setTimeout(function () { r.classList.remove('rail--flash'); }, 900);
  E.Snd.play('tick');
});

/* the title page */
var title = $('#title'), opened = false;
$('#titlePlate').innerHTML = P.plate('ilud-quarterly', 'band');

function openIssue() {
  if (opened) return;
  opened = true;
  E.Snd.unlock();
  E.Snd.play('open');
  title.classList.add('title--off');
  document.body.classList.add('is-issue');
  setTimeout(function () { title.hidden = true; }, E.prefs.noMotion ? 0 : 900);
  window.LEAF.init();
  E.paintMarkCount();
}
$('#titleGo').addEventListener('click', openIssue);
title.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openIssue(); }
});

/* a returning reader is not made to look at the cover again */
if (E.store.get('opened', false)) {
  title.classList.add('title--skip');
  setTimeout(openIssue, 30);
} else {
  $('#titleGo').addEventListener('click', function () { E.store.set('opened', true); }, { once: true });
}

E.applyMotion();
E.paintMarkCount();
document.addEventListener('pointerdown', function unlock() {
  E.Snd.unlock();
  document.removeEventListener('pointerdown', unlock);
}, { passive: true });

/* a link straight to an entry, should anyone share one */
(function () {
  var h = (location.hash || '').replace(/^#/, '');
  if (!h) return;
  var f = E.byId[h];
  if (!f) return;
  setTimeout(function () {
    if (!opened) openIssue();
    window.LEAF.go(f.category);
    setTimeout(function () { A.open(f); }, 700);
  }, 120);
})();
})();
