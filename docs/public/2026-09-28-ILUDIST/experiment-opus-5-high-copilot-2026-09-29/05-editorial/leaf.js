/* ══════════════════════════════════════════════════════════════════
   ILUD QUARTERLY — the leaf
   Chapters are pages. They turn about the spine, under the finger or
   under the arrow keys, and the contents rail keeps its place.
   ══════════════════════════════════════════════════════════════════ */
window.LEAF = (function () {
'use strict';
var E = window.ED, P = window.PLATES;
var $ = E.$, $$ = E.$$, esc = E.esc;

var stage, leaf, page, ghost, gutter, rail;
var idx = 0, turning = false;

var WORD = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight',
  'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen', 'twenty'];
function word(n) { return WORD[n] || String(n); }
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function two(n) { return (n < 10 ? '0' : '') + n; }

var SHIELD = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2 5 5.8v5.5c0 4.3 2.9 7.6 7 9.5 4.1-1.9 7-5.2 7-9.5V5.8Z"/><path d="m9 12 2.2 2.2L15.4 10"/></svg>';
var ARROW  = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-5.6-6 6 6-6 6"/></svg>';

/* ══ rendering a chapter ═════════════════════════════════════════ */
function chapterHTML(ch) {
  var lead = ch.lead;
  var rest = ch.entries.slice(1);
  var h = '';

  h += '<p class="ch__bar"><span>Chapter ' + word(ch.n) + '</span>' +
       '<span class="ch__bar-n">' + cap(word(ch.entries.length)) + ' entries</span></p>';

  h += '<h2 class="ch__name">' + esc(ch.cat.name) + '</h2>' +
       '<p class="ch__blurb">' + esc(ch.cat.blurb) + '</p>';

  /* the lead entry, set large, with its plate */
  h += '<article class="lead" data-fix="' + esc(lead.id) + '">' +
    '<div class="lead__plate">' + P.plate(lead.id, 'arch') + '</div>' +
    '<div class="lead__text">' +
      '<p class="ent__n">01 <i>/</i></p>' +
      '<h3 class="lead__h">' + esc(lead.title) + '</h3>' +
      '<p class="lead__deck">' + esc(lead.summary) + '</p>' +
      '<button class="usefix" type="button" data-use="' + esc(lead.id) + '">' +
        '<span>' + esc(actionWord(lead)) + '</span>' + ARROW + '</button>' +
      '<p class="lead__meta"><span class="ver">' + SHIELD + 'Verified ' + esc(E.shortDate(lead.verified)) + '</span>' +
        '<button class="lead__more" type="button" data-fix="' + esc(lead.id) + '">Read the entry</button></p>' +
    '</div>' +
  '</article>';

  /* the rest of the chapter */
  h += '<ol class="ents">';
  rest.forEach(function (f, i) {
    h += '<li><button class="ent" type="button" data-fix="' + esc(f.id) + '">' +
      '<span class="ent__p">' + P.plate(f.id, 'square') + '</span>' +
      '<span class="ent__t">' +
        '<span class="ent__n">' + two(i + 2) + ' <i>/</i></span>' +
        '<b>' + esc(f.title) + '</b>' +
        '<span class="ent__svc">' + esc(f.service) + '</span>' +
        '<span class="ver">' + SHIELD + 'Verified ' + esc(E.shortDate(f.verified)) + '</span>' +
      '</span>' +
      '<span class="ent__go">' + ARROW + '</span>' +
      (E.isMarked(f.id) ? '<span class="ent__rib" aria-label="Marked"></span>' : '') +
    '</button></li>';
  });
  h += '</ol>';

  /* the foot of the chapter, and the way onward */
  var next = E.CHAPTERS[(ch.n) % E.CHAPTERS.length];
  h += '<footer class="ch__foot">' +
    '<span class="ch__folio">' + ch.folio + '&ndash;' + ch.folioEnd + '</span>' +
    '<button class="ch__next" type="button" data-to="' + esc(next.cat.id) + '">' +
      '<span><i>Next chapter</i><b>' + esc(next.cat.name) + '</b></span>' + ARROW + '</button>' +
  '</footer>';

  return h;
}

function actionWord(f) {
  var k = f.action.kind;
  if (k === 'query') return 'Use this fix';
  if (k === 'copy') return f.action.label || 'Copy it';
  if (k === 'steps') return 'Show me how';
  return f.action.label || 'Use this fix';
}

/* ══ painting ════════════════════════════════════════════════════ */
function paint(container, ch) {
  container.innerHTML = chapterHTML(ch);
  wire(container);
}

function wire(root) {
  $$('[data-use]', root).forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var f = E.byId[b.getAttribute('data-use')];
      if (f.action.kind === 'query' || f.action.kind === 'steps') window.ART.open(f, true);
      else E.launch(f);
    });
  });
  $$('[data-fix]', root).forEach(function (b) {
    if (b.hasAttribute('data-use')) return;
    b.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('[data-use]')) return;
      window.ART.open(E.byId[b.getAttribute('data-fix')]);
    });
  });
  $$('[data-to]', root).forEach(function (b) {
    b.addEventListener('click', function () { go(b.getAttribute('data-to')); });
  });
}

/* ══ the contents rail ═══════════════════════════════════════════ */
function buildRail() {
  var list = $('#railList');
  list.innerHTML = E.CHAPTERS.map(function (ch, i) {
    return '<li><button class="rl" type="button" data-ch="' + esc(ch.cat.id) + '"' +
      ' aria-current="' + (i === idx ? 'true' : 'false') + '">' +
      '<i>' + two(ch.n) + '</i><span>' + esc(ch.cat.short) + '</span></button></li>';
  }).join('');
  $$('.rl', list).forEach(function (b) {
    b.addEventListener('click', function () { go(b.getAttribute('data-ch')); });
  });
  paintRail();
}
function paintRail() {
  $$('.rl').forEach(function (b, i) {
    b.setAttribute('aria-current', i === idx ? 'true' : 'false');
  });
  var cur = $$('.rl')[idx];
  if (cur && cur.scrollIntoView) {
    try { cur.scrollIntoView({ block: 'nearest', behavior: E.prefs.noMotion ? 'auto' : 'smooth' }); } catch (e) {}
  }
  var ch = E.CHAPTERS[idx];
  $('#footId').innerHTML = 'ILUD &middot; ' + esc(ch.cat.name) + ' &middot; ' + ch.folio + '&ndash;' + ch.folioEnd;
}

/* ══ turning ═════════════════════════════════════════════════════ */
var DEG = 172;

function prepGhost(ch, offset) {
  ghost.innerHTML = '<div class="ghost__front"><div class="ghost__in"></div></div><div class="ghost__back"></div>';
  var front = ghost.firstChild, inner = front.firstChild;
  paint(inner, ch);
  inner.style.transform = 'translateY(' + (-(offset || 0)) + 'px)';
  ghost.hidden = false;
}

/* commit a turn: dir +1 forward (to a later chapter), -1 back */
function turn(to, dir, fromDrag) {
  if (turning || to === idx) return;
  turning = true;
  var from = idx;
  var quick = E.prefs.noMotion;
  var off = stage.scrollTop;

  if (dir > 0) {
    /* the current leaf lifts and falls to the left; the new one waits beneath */
    prepGhost(E.CHAPTERS[from], off);
    ghost.style.zIndex = '4';
    paint(page, E.CHAPTERS[to]);
    stage.scrollTop = 0;
    idx = to; paintRail();
    animate(ghost, fromDrag ? currentAngle() : 0, -DEG, quick, function () {
      ghost.hidden = true; ghost.style.transform = ''; turning = false;
    });
  } else {
    /* the earlier leaf swings back over the top */
    prepGhost(E.CHAPTERS[to], 0);
    ghost.style.zIndex = '6';
    animate(ghost, fromDrag ? currentAngle() : -DEG, 0, quick, function () {
      paint(page, E.CHAPTERS[to]);
      stage.scrollTop = 0;
      idx = to; paintRail();
      ghost.hidden = true; ghost.style.transform = '';
      turning = false;
    });
  }
  E.Snd.play(dir > 0 ? 'turn' : 'back');
  hideTurnHint();
}

var raf = 0;
function currentAngle() {
  var m = /rotateY\((-?[\d.]+)deg\)/.exec(ghost.style.transform || '');
  return m ? parseFloat(m[1]) : 0;
}
function setAngle(a) {
  ghost.style.transform = 'rotateY(' + a.toFixed(2) + 'deg)';
  var t = Math.min(1, Math.abs(a) / DEG);
  ghost.style.filter = 'brightness(' + (1 - t * 0.28).toFixed(3) + ')';
  gutter.style.opacity = (Math.sin(t * Math.PI) * 0.5).toFixed(3);
}
function animate(el, a0, a1, quick, done) {
  cancelAnimationFrame(raf);
  if (quick) { setAngle(a1); gutter.style.opacity = '0'; done(); return; }
  var t0 = performance.now(), ms = 620 * Math.min(1, Math.abs(a1 - a0) / DEG + 0.25);
  var ticked = false;
  (function step(now) {
    var p = Math.min(1, (now - t0) / ms);
    var e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    var a = a0 + (a1 - a0) * e;
    setAngle(a);
    if (!ticked && Math.abs(a) > DEG * 0.52) { ticked = true; E.Snd.play('tick'); }
    if (p < 1) raf = requestAnimationFrame(step);
    else { gutter.style.opacity = '0'; E.Snd.play('settle'); done(); }
  })(t0);
}

function go(catId) {
  var to = E.CHAPTERS.map(function (c) { return c.cat.id; }).indexOf(catId);
  if (to < 0 || to === idx || turning) return;
  turn(to, to > idx ? 1 : -1, false);
}
function next() { if (idx < E.CHAPTERS.length - 1) turn(idx + 1, 1, false); else E.Snd.play('err'); }
function prev() { if (idx > 0) turn(idx - 1, -1, false); else E.Snd.play('err'); }

/* ══ dragging a page ═════════════════════════════════════════════ */
function wireDrag() {
  var x0 = 0, y0 = 0, dragging = false, axis = '', dir = 0, w = 1, target = -1;

  stage.addEventListener('pointerdown', function (e) {
    if (turning || e.pointerType === 'mouse' && e.button !== 0) return;
    if (e.target.closest && e.target.closest('button,a,input')) { /* still allow, resolved on move */ }
    E.Snd.unlock();
    x0 = e.clientX; y0 = e.clientY; axis = ''; dragging = true;
    w = stage.clientWidth || 1;
  });

  stage.addEventListener('pointermove', function (e) {
    if (!dragging || turning) return;
    var dx = e.clientX - x0, dy = e.clientY - y0;
    if (!axis) {
      if (Math.abs(dx) < 9 && Math.abs(dy) < 9) return;
      axis = Math.abs(dx) > Math.abs(dy) * 1.35 ? 'x' : 'y';
      if (axis === 'x') {
        dir = dx < 0 ? 1 : -1;
        target = idx + dir;
        if (target < 0 || target >= E.CHAPTERS.length) { axis = 'n'; return; }
        if (dir > 0) {
          prepGhost(E.CHAPTERS[idx], stage.scrollTop);
          ghost.style.zIndex = '4';
          paint(page, E.CHAPTERS[target]);
        } else {
          prepGhost(E.CHAPTERS[target], 0);
          ghost.style.zIndex = '6';
        }
        setAngle(dir > 0 ? 0 : -DEG);
        stage.classList.add('stage--turning');
      }
    }
    if (axis !== 'x') return;
    e.preventDefault();
    var t = Math.max(0, Math.min(1, Math.abs(dx) / (w * 0.72)));
    setAngle(dir > 0 ? -DEG * t : -DEG * (1 - t));
  }, { passive: false });

  function release(e) {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove('stage--turning');
    if (axis !== 'x' || turning) { axis = ''; return; }
    var dx = e.clientX - x0;
    var t = Math.abs(dx) / (w * 0.72);
    var done = t > 0.34;
    if (done) {
      turning = true;
      var from = idx, to = target;
      if (dir > 0) {
        idx = to; paintRail(); stage.scrollTop = 0;
        animate(ghost, currentAngle(), -DEG, E.prefs.noMotion, function () {
          ghost.hidden = true; ghost.style.transform = ''; turning = false;
        });
      } else {
        animate(ghost, currentAngle(), 0, E.prefs.noMotion, function () {
          paint(page, E.CHAPTERS[to]); stage.scrollTop = 0;
          idx = to; paintRail();
          ghost.hidden = true; ghost.style.transform = ''; turning = false;
        });
      }
      hideTurnHint();
    } else {
      /* it falls back */
      turning = true;
      animate(ghost, currentAngle(), dir > 0 ? 0 : -DEG, E.prefs.noMotion, function () {
        if (dir > 0) paint(page, E.CHAPTERS[idx]);
        ghost.hidden = true; ghost.style.transform = ''; turning = false;
      });
    }
    axis = '';
  }
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', function (e) { release(e); });
}

/* ══ the hint ════════════════════════════════════════════════════ */
var hintT = 0;
function hideTurnHint() {
  var h = $('#turnhint');
  if (h) { h.classList.add('turnhint--off'); h.classList.remove('turnhint--on'); }
  clearTimeout(hintT);
  E.store.set('turned', true);
}
function showTurnHint() {
  if (E.store.get('turned', false)) return;
  var h = $('#turnhint');
  if (!h) return;
  hintT = setTimeout(function () { h.classList.add('turnhint--on'); }, 2600);
}

/* ══ keyboard ════════════════════════════════════════════════════ */
function keys() {
  document.addEventListener('keydown', function (e) {
    if (window.ART && window.ART.depth()) return;
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prev(); }
  });
}

function init() {
  stage = $('#stage'); leaf = $('#leaf'); page = $('#page');
  ghost = $('#ghost'); gutter = $('#gutter'); rail = $('#rail');
  buildRail();
  paint(page, E.CHAPTERS[0]);
  wireDrag();
  keys();
  showTurnHint();
}

return {
  init: init, go: go, next: next, prev: prev,
  repaint: function () { paint(page, E.CHAPTERS[idx]); },
  chapterHTML: chapterHTML, word: word, two: two, cap: cap,
  SHIELD: SHIELD, ARROW: ARROW, actionWord: actionWord,
  get index() { return idx; }
};
})();
