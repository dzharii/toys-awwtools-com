/* ══════════════════════════════════════════════════════════════════
   ILUD FOLIO — core
   Indices, preferences, paper sounds, the page sheet. No dependencies.
   ══════════════════════════════════════════════════════════════════ */
window.FOL = (function () {
'use strict';

var D = window.ILUD_DATA;
if (!D) {
  document.body.innerHTML = '<p style="padding:40px;font:16px Georgia,serif;color:#a2917c">' +
    'The tray is empty — data.js did not load.</p>';
  return null;
}

var $  = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
var esc = function (s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
};

/* ── indices ───────────────────────────────────────────────────── */
var byId = {}; D.fixes.forEach(function (f) { byId[f.id] = f; });
var catById = {}; D.categories.forEach(function (c) { catById[c.id] = c; });
var appById = {}; D.approaches.forEach(function (a) { appById[a.id] = a; });
var confById = {}; D.confidence.forEach(function (c) { confById[c.id] = c; });
var effortById = {}; D.effort.forEach(function (e) { effortById[e.id] = e; });
var platById = {}; D.platforms.forEach(function (p) { platById[p.id] = p; });

function weight(f) {
  return (f.featured ? 40 : 0) + (f.popularity || 0) * 6 +
         (f.confidence === 'high' ? 8 : f.confidence === 'medium' ? 3 : 0) +
         (f.advanced ? -8 : 0) + (f.install === 'none' ? 4 : 0);
}
var byCat = {};
D.categories.forEach(function (c) { byCat[c.id] = []; });
D.fixes.forEach(function (f) { if (byCat[f.category]) byCat[f.category].push(f); });
Object.keys(byCat).forEach(function (k) {
  byCat[k].sort(function (a, b) { return weight(b) - weight(a); });
});

/* ── glyph library ─────────────────────────────────────────────── */
var ICON = {
  arrow:'<svg viewBox="0 0 24 24"><path d="M4 12h15"/><path d="m13 6 6 6-6 6"/></svg>',
  chev:'<svg viewBox="0 0 24 24"><path d="m9 5 7 7-7 7"/></svg>',
  ext:'<svg viewBox="0 0 24 24"><path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M18 14v5a1.6 1.6 0 0 1-1.6 1.6H5.6A1.6 1.6 0 0 1 4 19V8.2a1.6 1.6 0 0 1 1.6-1.6H10"/></svg>',
  copy:'<svg viewBox="0 0 24 24"><rect x="8.6" y="3.4" width="12" height="14" rx="2"/><path d="M15.4 20.6H5.6A2 2 0 0 1 3.6 18.6V7.8"/></svg>',
  list:'<svg viewBox="0 0 24 24"><path d="M8.6 7h11.8M8.6 12h11.8M8.6 17h11.8"/><circle cx="4.4" cy="7" r="1.1" fill="currentColor" stroke="none"/><circle cx="4.4" cy="12" r="1.1" fill="currentColor" stroke="none"/><circle cx="4.4" cy="17" r="1.1" fill="currentColor" stroke="none"/></svg>',
  phone:'<svg viewBox="0 0 24 24"><rect x="7" y="2.6" width="10" height="18.8" rx="2.2"/><path d="M11 18.6h2"/></svg>',
  clock:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.6"/><path d="M12 7v5.4l3.4 2"/></svg>',
  pin:'<svg viewBox="0 0 24 24"><path d="M12 21s6.4-6 6.4-10.6A6.4 6.4 0 0 0 5.6 10.4C5.6 15 12 21 12 21Z"/><circle cx="12" cy="10.4" r="2.3"/></svg>',
  pinned:'<svg viewBox="0 0 24 24"><path d="M12 21s6.4-6 6.4-10.6A6.4 6.4 0 0 0 5.6 10.4C5.6 15 12 21 12 21Z" fill="currentColor"/></svg>',
  plug:'<svg viewBox="0 0 24 24"><rect x="4.6" y="8.6" width="14.8" height="11" rx="2"/><path d="M8.6 8.6V5.2M15.4 8.6V5.2"/></svg>',
  back:'<svg viewBox="0 0 24 24"><path d="M20 12H5"/><path d="m11 6-6 6 6 6"/></svg>'
};
var CATG = {
  search:'M12 4.4a6 6 0 1 1 0 12 6 6 0 0 1 0-12ZM16.4 15.2 21 20',
  social:'M9.4 5.7a2.9 2.9 0 1 1 0 5.8 2.9 2.9 0 0 1 0-5.8ZM4.2 18.6a5.2 5.2 0 0 1 10.4 0',
  images:'M3.8 5.4h16.4v13.2H3.8ZM4.8 16.6l4.2-4 3.2 3 2.9-2.5 4 3.4',
  writing:'M5.4 3.8h8.4l4.8 4.8v11.6H5.4ZM8 13h8M8 16.4h5',
  shopping:'M4.8 8h14.4l-1 11H5.8ZM8.8 10.2V7.4a3.2 3.2 0 0 1 6.4 0v2.8',
  browsing:'M12 3.6a8.4 8.4 0 1 1 0 16.8 8.4 8.4 0 0 1 0-16.8ZM3.6 12h16.8M12 3.6c2.3 2.4 3.5 5.3 3.5 8.4s-1.2 6-3.5 8.4c-2.3-2.4-3.5-5.3-3.5-8.4s1.2-6 3.5-8.4Z',
  video:'M3 6h13v12H3ZM16 11l5-3v8l-5-3Z',
  everyday:'M4.4 5h6a2.6 2.6 0 0 1 2.6 2.6v11.6a2 2 0 0 0-2-2H4.4ZM19.6 5h-6a2.6 2.6 0 0 0-2.6 2.6v11.6a2 2 0 0 1 2-2h6.6Z'
};

/* ── preferences ───────────────────────────────────────────────── */
var store = {
  get: function (k, d) {
    try { var v = localStorage.getItem('ilud.fol.' + k); return v === null ? d : JSON.parse(v); }
    catch (e) { return d; }
  },
  set: function (k, v) { try { localStorage.setItem('ilud.fol.' + k, JSON.stringify(v)); } catch (e) {} }
};
var kept = store.get('kept', []);
var prefs = { sound: store.get('sound', true), noMotion: store.get('noMotion', false) };
var sysReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function reduced() { return sysReduced || prefs.noMotion; }
function applyMotion() { document.documentElement.setAttribute('data-motion', reduced() ? '0' : '1'); }
applyMotion();

/* ══ sound ═══════════════════════════════════════════════════════
   Paper, not metal: a card sliding out of a stack, a flick against
   a thumb, a soft cardboard thud, a pencil tick, a rubber stamp.
   All synthesised — no files, unlocked by the first gesture.       */
var Snd = (function () {
  var ctx = null, master = null;
  function boot() {
    if (ctx) return;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try { ctx = new AC(); } catch (e) { return; }
    var comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20; comp.ratio.value = 6;
    master = ctx.createGain(); master.gain.value = 0.30;
    master.connect(comp); comp.connect(ctx.destination);
  }
  function live() { return prefs.sound && ctx && ctx.state === 'running'; }
  function env(node, t, a, d, peak) {
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
    node.connect(g); g.connect(master);
    return g;
  }
  function tone(f, t, a, d, peak, type) {
    var o = ctx.createOscillator(); o.type = type || 'sine';
    o.frequency.setValueAtTime(f, t);
    env(o, t, a, d, peak); o.start(t); o.stop(t + a + d + 0.05);
    return o;
  }
  /* shaped noise — the raw material of every paper sound */
  function noise(t, dur, opts) {
    opts = opts || {};
    var n = Math.max(8, Math.floor(ctx.sampleRate * dur));
    var buf = ctx.createBuffer(1, n, ctx.sampleRate), ch = buf.getChannelData(0);
    var sh = opts.shape || 'decay';
    for (var i = 0; i < n; i++) {
      var p = i / n, a;
      if (sh === 'swell') a = Math.sin(Math.PI * p);
      else if (sh === 'flat') a = 1;
      else a = Math.pow(1 - p, opts.decay || 2.4);
      ch[i] = (Math.random() * 2 - 1) * a;
    }
    var s = ctx.createBufferSource(); s.buffer = buf;
    var f = ctx.createBiquadFilter();
    f.type = opts.type || 'bandpass';
    f.frequency.setValueAtTime(opts.f0 || 2000, t);
    if (opts.f1) f.frequency.exponentialRampToValueAtTime(opts.f1, t + dur);
    f.Q.value = opts.q || 1;
    s.connect(f); env(f, t, opts.attack || 0.004, dur, opts.peak || 0.3);
    s.start(t); s.stop(t + dur + 0.03);
  }
  var lib = {
    /* a card dragged off the top of the stack */
    slide: function (t) { noise(t, 0.30, { type:'bandpass', f0: 900, f1: 2800, q: 0.8, peak: 0.30, attack: 0.05, shape:'swell' }); },
    /* the corner of a card flicked past the thumb */
    flick: function (t) { noise(t, 0.075, { f0: 2600, f1: 5200, q: 1.1, peak: 0.34, decay: 3 }); },
    /* a whole handful riffled */
    riffle: function (t) {
      for (var i = 0; i < 9; i++) {
        var d = i * (0.024 + Math.random() * 0.016);
        noise(t + d, 0.05, { f0: 2400 + Math.random() * 1800, q: 1.4, peak: 0.20, decay: 3 });
      }
    },
    /* a card landing back in the tray */
    thud:  function (t) { noise(t, 0.10, { type:'lowpass', f0: 620, q: 0.7, peak: 0.34, decay: 2.6 }); tone(96, t + 0.004, 0.002, 0.09, 0.13, 'sine'); },
    /* raising a card */
    lift:  function (t) { noise(t, 0.13, { f0: 1500, f1: 3400, q: 0.9, peak: 0.22, attack: 0.03 }); },
    /* the sheet opening */
    open:  function (t) { noise(t, 0.34, { type:'lowpass', f0: 500, f1: 2000, q: 0.6, peak: 0.24, attack: 0.07 }); tone(294, t + 0.03, 0.01, 0.22, 0.05, 'sine'); },
    close: function (t) { noise(t, 0.16, { type:'lowpass', f0: 1400, f1: 420, q: 0.6, peak: 0.26, attack: 0.02 }); tone(147, t + 0.02, 0.004, 0.12, 0.08, 'sine'); },
    /* a pencil tick against the tab edge */
    tick:  function (t) { noise(t, 0.026, { f0: 3400, q: 2.4, peak: 0.26, decay: 3 }); tone(520, t, 0.001, 0.02, 0.04, 'triangle'); },
    /* the card turning over */
    turn:  function (t) { noise(t, 0.22, { f0: 1200, f1: 3800, q: 0.8, peak: 0.26, attack: 0.05, shape:'swell' }); },
    /* rubber stamp — saving to the pocket */
    stamp: function (t) { noise(t, 0.06, { type:'lowpass', f0: 900, q: 0.8, peak: 0.42, decay: 2 }); tone(150, t + 0.006, 0.002, 0.07, 0.15, 'sine'); tone(660, t + 0.01, 0.003, 0.14, 0.05, 'triangle'); },
    unstamp: function (t) { noise(t, 0.05, { type:'lowpass', f0: 700, q: 0.8, peak: 0.24, decay: 2 }); tone(330, t, 0.003, 0.11, 0.05, 'triangle'); },
    /* launching the remedy */
    go:    function (t) { tone(392, t, 0.004, 0.14, 0.09, 'triangle'); tone(587, t + 0.06, 0.004, 0.2, 0.065, 'triangle'); noise(t, 0.04, { f0: 2400, q: 1.4, peak: 0.2, decay: 3 }); },
    err:   function (t) { tone(180, t, 0.004, 0.1, 0.09, 'square'); tone(150, t + 0.09, 0.004, 0.12, 0.07, 'square'); }
  };
  return {
    unlock: function () { boot(); if (ctx && ctx.state === 'suspended') ctx.resume(); },
    play: function (n) { if (!live() || !lib[n]) return; try { lib[n](ctx.currentTime); } catch (e) {} },
    have: function () { return !!(window.AudioContext || window.webkitAudioContext); }
  };
})();
function buzz(ms) { if (navigator.vibrate && prefs.sound) { try { navigator.vibrate(ms); } catch (e) {} } }

/* ── toast ─────────────────────────────────────────────────────── */
var toastT = null;
function toast(msg) {
  var t = $('#toast');
  t.textContent = msg; t.classList.add('toast--on');
  clearTimeout(toastT);
  toastT = setTimeout(function () { t.classList.remove('toast--on'); }, 3200);
}

/* ══ the page sheet ══════════════════════════════════════════════
   One element serves the full record, the index, the pocket and the
   colophon. A small stack lets a record open on top of a search.    */
var pages = [];          /* [{kicker, render, restore}] */
var lastFocus = null;

function pageOpen(spec) {
  var page = $('#page'), dim = $('#dim');
  if (!pages.length) {
    lastFocus = document.activeElement;
    dim.hidden = false;
    requestAnimationFrame(function () { dim.classList.add('dim--on'); });
    page.hidden = false;
    requestAnimationFrame(function () { page.classList.add('page--on'); });
    Snd.play('open');
  } else {
    Snd.play('turn');
  }
  pages.push(spec);
  paint();
  try { history.pushState({ folio: pages.length }, ''); } catch (e) {}
}

function paint() {
  var spec = pages[pages.length - 1];
  if (!spec) return;
  $('#pageKicker').textContent = spec.kicker || '';
  /* a fresh node each time: renderers attach their own listeners and
     must not inherit the previous screen's */
  var old = $('#pageBody');
  var body = old.cloneNode(false);
  old.parentNode.replaceChild(body, old);
  body.scrollTop = 0;
  spec.render(body);
}

var closing = false;
function pageClose() {
  if (!pages.length || closing) return;
  closing = true;
  var depth = pages.length;
  try { history.back(); } catch (e) {}
  /* if the browser gives us no popstate, close anyway */
  setTimeout(function () {
    closing = false;
    if (pages.length === depth) doClose();
  }, 340);
}

function doClose() {
  if (!pages.length) return;
  closing = false;
  pages.pop();
  if (pages.length) { paint(); Snd.play('turn'); return; }
  var page = $('#page'), dim = $('#dim');
  page.classList.remove('page--on');
  dim.classList.remove('dim--on');
  setTimeout(function () {
    if (!pages.length) { page.hidden = true; dim.hidden = true; $('#pageBody').innerHTML = ''; }
  }, 480);
  Snd.play('close');
  if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
}
function pageDepth() { return pages.length; }

window.addEventListener('popstate', function () { if (pages.length) doClose(); });
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && pages.length) { e.preventDefault(); pageClose(); }
});

/* dismiss the sheet by dragging its head down */
(function () {
  var page = $('#page');
  var head = page.querySelector('.page__top'), grab = page.querySelector('.page__grab');
  var y0 = 0, dy = 0, on = false, t0 = 0, wide = false;
  function base() { return wide ? 'translate(-50%,' : 'translateY('; }
  function start(e) {
    if (e.target.closest('button,input,a')) return;
    on = true; y0 = e.clientY; dy = 0; t0 = Date.now();
    wide = window.innerWidth >= 720;
    page.style.transition = 'none';
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
  }
  function move(e) {
    if (!on) return;
    dy = Math.max(0, e.clientY - y0);
    page.style.transform = base() + dy + 'px' + (wide ? ')' : ')');
  }
  function end() {
    if (!on) return;
    on = false;
    page.style.transition = '';
    page.style.transform = '';
    if (dy > 110 || ((Date.now() - t0) < 320 && dy > 44)) pageClose();
  }
  [head, grab].forEach(function (h) {
    if (!h) return;
    h.addEventListener('pointerdown', start);
    h.addEventListener('pointermove', move);
    h.addEventListener('pointerup', end);
    h.addEventListener('pointercancel', end);
  });
})();

document.addEventListener('click', function (e) {
  if (e.target.id === 'dim') pageClose();
  if (e.target.closest('#pageX')) pageClose();
});

/* ── clipboard ─────────────────────────────────────────────────── */
function fallbackCopy(text) {
  try {
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    var ok = document.execCommand('copy');
    document.body.removeChild(ta); return ok;
  } catch (e) { return false; }
}
function copy(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).then(
      function () { return true; },
      function () { return fallbackCopy(text); }
    );
  }
  return Promise.resolve(fallbackCopy(text));
}

/* ── dates, history, pocket ────────────────────────────────────── */
var MONTH = ['January','February','March','April','May','June','July','August','September','October','November','December'];
function fmtDate(d) { var p = String(d).split('-'); return parseInt(p[2], 10) + ' ' + MONTH[parseInt(p[1], 10) - 1] + ' ' + p[0]; }
function daysSince(d) { return Math.round((Date.now() - new Date(d + 'T00:00:00Z').getTime()) / 86400000); }
function freshness(d) {
  var n = daysSince(d);
  if (n <= 1) return 'Checked today';
  if (n < 45) return 'Checked ' + fmtDate(d);
  return 'Last checked ' + fmtDate(d);
}
function remember(id) {
  var r = store.get('recent', []).filter(function (x) { return x !== id; });
  r.unshift(id); store.set('recent', r.slice(0, 14));
}
function isKept(id) { return kept.indexOf(id) > -1; }
function toggleKeep(id) {
  var i = kept.indexOf(id);
  if (i > -1) { kept.splice(i, 1); Snd.play('unstamp'); }
  else { kept.push(id); Snd.play('stamp'); buzz(12); }
  store.set('kept', kept);
  paintPocket();
  return i < 0;
}
function paintPocket() {
  var n = $('#pocketN');
  if (!n) return;
  n.textContent = kept.length;
  n.hidden = kept.length === 0;
}

/* ── opening a remedy ──────────────────────────────────────────── */
function launch(fix, term) {
  var a = fix.action;
  remember(fix.id);
  if (a.kind === 'copy') {
    copy(a.text).then(function (ok) {
      Snd.play(ok ? 'go' : 'err');
      toast(ok ? 'Copied. ' + (a.note || 'Paste it where it is needed.') : 'Could not copy — here it is: ' + a.text);
    });
    return;
  }
  if (a.kind === 'steps') { Snd.play('go'); return; }
  var url = a.url;
  if (a.kind === 'query') {
    var q = (term || '').trim();
    if (!q) { Snd.play('err'); toast('Write what you are looking for first.'); return; }
    url = url.replace('{q}', encodeURIComponent(q));
  }
  Snd.play('go');
  var w = window.open(url, '_blank', 'noopener');
  if (!w) { copy(url); toast('Your browser blocked the new tab — the address is copied.'); }
}

/* ── search ────────────────────────────────────────────────────── */
function score(f, q) {
  var t = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!t.length) return 0;
  var hay = {
    title: f.title.toLowerCase(),
    service: (f.service || '').toLowerCase(),
    summary: (f.summary || '').toLowerCase(),
    tags: (f.tags || []).join(' ').toLowerCase(),
    cat: (catById[f.category] ? catById[f.category].name : '').toLowerCase(),
    how: (f.how || '').toLowerCase()
  };
  var s = 0, all = true;
  t.forEach(function (w) {
    var hit = 0;
    if (hay.title.indexOf(w) === 0) hit += 26;
    else if (hay.title.indexOf(w) > -1) hit += 18;
    if (hay.service.indexOf(w) > -1) hit += 14;
    if (hay.tags.indexOf(w) > -1) hit += 9;
    if (hay.cat.indexOf(w) > -1) hit += 6;
    if (hay.summary.indexOf(w) > -1) hit += 5;
    if (hay.how.indexOf(w) > -1) hit += 2;
    if (!hit) all = false;
    s += hit;
  });
  if (!all) s = s * 0.35;
  return s + weight(f) * 0.12;
}
function search(q) {
  if (!q || !q.trim()) return [];
  return D.fixes.map(function (f) { return { f: f, s: score(f, q) }; })
    .filter(function (x) { return x.s > 4; })
    .sort(function (a, b) { return b.s - a.s; })
    .slice(0, 28).map(function (x) { return x.f; });
}

return {
  D: D, $: $, $$: $$, clamp: clamp, esc: esc,
  byId: byId, catById: catById, appById: appById, confById: confById,
  effortById: effortById, platById: platById, byCat: byCat, weight: weight,
  ICON: ICON, CATG: CATG,
  store: store, prefs: prefs, reduced: reduced, applyMotion: applyMotion,
  get kept() { return kept; },
  Snd: Snd, buzz: buzz, toast: toast,
  pageOpen: pageOpen, pageClose: pageClose, pageDepth: pageDepth,
  copy: copy, fmtDate: fmtDate, daysSince: daysSince, freshness: freshness,
  remember: remember, isKept: isKept, toggleKeep: toggleKeep, paintPocket: paintPocket,
  launch: launch, search: search
};
})();
