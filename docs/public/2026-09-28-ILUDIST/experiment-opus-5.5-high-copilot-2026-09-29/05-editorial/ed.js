/* ══════════════════════════════════════════════════════════════════
   ILUD QUARTERLY — the press
   Shared machinery: the catalogue indices, the paper sounds, what the
   reader has marked, and the act of actually using a fix.
   ══════════════════════════════════════════════════════════════════ */
window.ED = (function () {
'use strict';

var D = window.ILUD_DATA;
var $  = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

/* ── indices ───────────────────────────────────────────────────── */
var byId = {}, catById = {}, appById = {}, confById = {}, effortById = {}, platById = {};
D.fixes.forEach(function (f) { byId[f.id] = f; });
D.categories.forEach(function (c) { catById[c.id] = c; });
D.approaches.forEach(function (a) { appById[a.id] = a; });
D.confidence.forEach(function (c) { confById[c.id] = c; });
D.effort.forEach(function (e) { effortById[e.id] = e; });
D.platforms.forEach(function (p) { platById[p.id] = p; });

/* how prominent an entry is: popularity, then confidence, then ease */
function weight(f) {
  return (f.popularity || 0) * 10 +
    (f.confidence === 'high' ? 6 : f.confidence === 'medium' ? 3 : 0) +
    (f.effort === 'instant' ? 3 : f.effort === 'minute' ? 2 : 0) +
    (f.action.kind === 'query' ? 2 : 0) +
    (f.featured ? 4 : 0);
}

/* the issue: one chapter per category, its entries in order of merit */
var CHAPTERS = D.categories.map(function (c, i) {
  var list = D.fixes.filter(function (f) { return f.category === c.id; })
    .sort(function (a, b) { return weight(b) - weight(a); });
  return { n: i + 1, cat: c, entries: list, lead: list[0] };
});
var chapterOf = {};
CHAPTERS.forEach(function (ch) { chapterOf[ch.cat.id] = ch; });

/* page numbering, as a printed issue would have it */
var folioOf = {};
(function () {
  var page = 1;
  CHAPTERS.forEach(function (ch) {
    ch.folio = page;
    ch.entries.forEach(function (f) { folioOf[f.id] = page; page += 1; });
    ch.folioEnd = page - 1;
  });
})();

/* ── what the browser remembers ────────────────────────────────── */
var store = {
  get: function (k, d) {
    try { var v = localStorage.getItem('ilud.ed.' + k); return v === null ? d : JSON.parse(v); }
    catch (e) { return d; }
  },
  set: function (k, v) { try { localStorage.setItem('ilud.ed.' + k, JSON.stringify(v)); } catch (e) {} },
  wipe: function () {
    try {
      Object.keys(localStorage).filter(function (k) { return k.indexOf('ilud.ed.') === 0; })
        .forEach(function (k) { localStorage.removeItem(k); });
    } catch (e) {}
  }
};

var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var prefs = {
  sound: store.get('sound', true),
  noMotion: store.get('noMotion', reduce)
};
function applyMotion() {
  document.body.setAttribute('data-motion', prefs.noMotion ? '0' : '1');
}

var marked = store.get('marked', []);
function isMarked(id) { return marked.indexOf(id) > -1; }
function toggleMark(id) {
  var i = marked.indexOf(id);
  if (i > -1) { marked.splice(i, 1); Snd.play('unstamp'); }
  else { marked.unshift(id); Snd.play('stamp'); }
  store.set('marked', marked);
  paintMarkCount();
  return i < 0;
}
function paintMarkCount() {
  var n = $('#markN');
  if (!n) return;
  n.textContent = marked.length;
  n.hidden = !marked.length;
}

var read = store.get('read', []);
function noteRead(id) {
  var i = read.indexOf(id);
  if (i > -1) read.splice(i, 1);
  read.unshift(id);
  read = read.slice(0, 14);
  store.set('read', read);
}

/* ── the sound of paper ────────────────────────────────────────── */
var Snd = (function () {
  var ctx = null, noise = null, ready = false;

  function makeNoise() {
    var n = ctx.sampleRate * 1.2, b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }
  function unlock() {
    if (ready) return;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      noise = makeNoise();
      ready = true;
      if (ctx.state === 'suspended') ctx.resume();
    } catch (e) { ready = false; }
  }
  function env(g, t, a, d, peak) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  }
  /* a sheet of paper moving: band-passed noise with a rising sweep */
  function sweep(dur, f0, f1, peak, q) {
    var t = ctx.currentTime;
    var src = ctx.createBufferSource(); src.buffer = noise;
    var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = q || 0.9;
    bp.frequency.setValueAtTime(f0, t);
    bp.frequency.exponentialRampToValueAtTime(f1, t + dur);
    var g = ctx.createGain();
    env(g, t, dur * 0.22, dur * 0.78, peak);
    src.connect(bp); bp.connect(g); g.connect(ctx.destination);
    src.start(t); src.stop(t + dur + 0.05);
  }
  /* a small wooden tap: two short sines */
  function tap(f, dur, peak) {
    var t = ctx.currentTime;
    [1, 2.4].forEach(function (m, i) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = i ? 'triangle' : 'sine';
      o.frequency.setValueAtTime(f * m, t);
      o.frequency.exponentialRampToValueAtTime(f * m * 0.7, t + dur);
      env(g, t, 0.004, dur, peak * (i ? 0.4 : 1));
      o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t + dur + 0.05);
    });
  }

  var LIB = {
    turn:    function () { sweep(0.34, 900, 2600, 0.05, 0.7); },
    back:    function () { sweep(0.34, 2400, 800, 0.045, 0.7); },
    settle:  function () { sweep(0.16, 520, 240, 0.05, 1.3); tap(180, 0.09, 0.05); },
    tick:    function () { tap(1500, 0.035, 0.035); },
    open:    function () { sweep(0.4, 420, 1500, 0.055, 0.6); },
    shut:    function () { sweep(0.26, 1400, 380, 0.05, 0.7); },
    stamp:   function () { tap(150, 0.11, 0.1); sweep(0.08, 2200, 700, 0.04, 1.6); },
    unstamp: function () { tap(120, 0.08, 0.05); },
    nib:     function () { sweep(0.07, 3200, 1600, 0.022, 2.2); },
    err:     function () { tap(110, 0.16, 0.06); }
  };

  return {
    unlock: unlock,
    play: function (name) {
      if (!prefs.sound) return;
      unlock();
      if (!ready || !LIB[name]) return;
      try { LIB[name](); } catch (e) {}
    }
  };
})();

/* ── dates, plainly ────────────────────────────────────────────── */
var MON = ['January', 'February', 'March', 'April', 'May', 'June',
           'July', 'August', 'September', 'October', 'November', 'December'];
function fmtDate(iso) {
  var p = String(iso || '').split('-');
  if (p.length !== 3) return String(iso || '');
  return Number(p[2]) + ' ' + MON[Number(p[1]) - 1] + ' ' + p[0];
}
function shortDate(iso) {
  var p = String(iso || '').split('-');
  if (p.length !== 3) return String(iso || '');
  return MON[Number(p[1]) - 1].slice(0, 3) + ' ' + p[0];
}

/* ── using a fix ───────────────────────────────────────────────── */
function fill(tpl, q) {
  return String(tpl).replace(/\{q\}/g, encodeURIComponent(q))
                    .replace(/\{q\+\}/g, encodeURIComponent(q).replace(/%20/g, '+'));
}
function openTab(url) {
  var w = window.open(url, '_blank', 'noopener,noreferrer');
  if (!w) toast('Your browser blocked the new tab. Allow pop-ups for this page, or copy the address.');
}
function copy(text) {
  var done = function () { toast('Copied.'); Snd.play('stamp'); };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, function () { fallback(text, done); });
  } else fallback(text, done);
}
function fallback(text, done) {
  var ta = document.createElement('textarea');
  ta.value = text; ta.setAttribute('readonly', '');
  ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
  document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); done(); }
  catch (e) { toast('Copy did not work. Select the text and copy it by hand.'); }
  document.body.removeChild(ta);
}

function launch(f, q) {
  var a = f.action;
  noteRead(f.id);
  if (a.kind === 'query') {
    var v = (q || '').trim();
    if (!v) { toast('Type what you are looking for first.'); Snd.play('err'); return false; }
    openTab(fill(a.url, v)); Snd.play('open'); return true;
  }
  if (a.kind === 'copy') { copy(a.text); return true; }
  if (a.kind === 'link') { openTab(a.url); Snd.play('open'); return true; }
  return false;
}

var toastT = 0;
function toast(msg) {
  var t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('toast--on');
  clearTimeout(toastT);
  toastT = setTimeout(function () { t.classList.remove('toast--on'); }, 3400);
}

/* ── searching the issue ───────────────────────────────────────── */
var HAY = {};
D.fixes.forEach(function (f) {
  HAY[f.id] = [f.title, f.service, f.summary, f.changes, f.how,
    (f.tags || []).join(' '), catById[f.category].name, appById[f.approach].name,
    (f.alternatives || []).map(function (a) { return a.service || a.title || ''; }).join(' ')
  ].join(' ').toLowerCase();
});
function search(q) {
  var t = q.trim().toLowerCase();
  if (!t) return [];
  var words = t.split(/\s+/);
  return D.fixes.map(function (f) {
      var h = HAY[f.id], sc = 0;
      words.forEach(function (w) {
        if (h.indexOf(w) < 0) { sc = -999; return; }
        if (f.title.toLowerCase().indexOf(w) > -1) sc += 6;
        if (f.service.toLowerCase().indexOf(w) > -1) sc += 5;
        sc += 1;
      });
      return { f: f, sc: sc };
    })
    .filter(function (x) { return x.sc > 0; })
    .sort(function (a, b) { return (b.sc - a.sc) || (weight(b.f) - weight(a.f)); })
    .map(function (x) { return x.f; });
}

/* ── the freshness line ────────────────────────────────────────── */
function freshness(iso) {
  var d = new Date(iso + 'T00:00:00Z');
  if (isNaN(d)) return 'Verified ' + iso;
  var days = Math.round((Date.now() - d.getTime()) / 86400000);
  if (days < 0) return 'Verified ' + fmtDate(iso);
  if (days < 45) return 'Verified ' + fmtDate(iso);
  if (days < 200) return 'Verified ' + fmtDate(iso) + ' — worth re-checking';
  return 'Verified ' + fmtDate(iso) + ' — old enough to doubt';
}

return {
  D: D, $: $, $$: $$, esc: esc,
  byId: byId, catById: catById, appById: appById,
  confById: confById, effortById: effortById, platById: platById,
  CHAPTERS: CHAPTERS, chapterOf: chapterOf, folioOf: folioOf,
  weight: weight, store: store, prefs: prefs, applyMotion: applyMotion,
  get marked() { return marked; },
  isMarked: isMarked, toggleMark: toggleMark, paintMarkCount: paintMarkCount,
  get read() { return read; }, noteRead: noteRead,
  Snd: Snd, fmtDate: fmtDate, shortDate: shortDate, freshness: freshness,
  launch: launch, copy: copy, openTab: openTab, toast: toast, search: search
};
})();
