/* ══════════════════════════════════════════════════════════════════
   ILUD TRANSIT — core
   Indices, preferences, rolling-stock sounds, the detail panel.
   ══════════════════════════════════════════════════════════════════ */
window.TRN = (function () {
'use strict';

var D = window.ILUD_DATA;
if (!D) {
  document.body.innerHTML = '<p style="padding:40px;font:16px Georgia,serif;color:#9b8d70">' +
    'The network is closed — data.js did not load.</p>';
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

/* the four lines of the network, in map order left → right */
var LINES = [
  { id:'turn-off', name:'Turn it off',      chip:'Turn it off',  short:'Turn off',  colour:'#d46a25', lane:-276, drop:54 },
  { id:'replace',  name:'Use something else',chip:'Replace',     short:'Replace',   colour:'#6f93bc', lane:-140, drop:108 },
  { id:'avoid',    name:'Work around it',   chip:'Work around',  short:'Avoid',     colour:'#9dc4a2', lane: 140, drop:54 },
  { id:'human',    name:'Find human-made',  chip:'Human-made',   short:'Human-made',colour:'#c08a4e', lane: 276, drop:108 }
];
var lineById = {}; LINES.forEach(function (l) { lineById[l.id] = l; });

function weight(f) {
  return (f.featured ? 40 : 0) + (f.popularity || 0) * 6 +
         (f.confidence === 'high' ? 8 : f.confidence === 'medium' ? 3 : 0) +
         (f.advanced ? -8 : 0) + (f.install === 'none' ? 4 : 0);
}

/* ── glyphs ────────────────────────────────────────────────────── */
var ICON = {
  arrow:'<svg viewBox="0 0 24 24"><path d="M4 12h15"/><path d="m13 6 6 6-6 6"/></svg>',
  ext:'<svg viewBox="0 0 24 24"><path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M18 14v5a1.6 1.6 0 0 1-1.6 1.6H5.6A1.6 1.6 0 0 1 4 19V8.2a1.6 1.6 0 0 1 1.6-1.6H10"/></svg>',
  copy:'<svg viewBox="0 0 24 24"><rect x="8.6" y="3.4" width="12" height="14" rx="2"/><path d="M15.4 20.6H5.6A2 2 0 0 1 3.6 18.6V7.8"/></svg>',
  list:'<svg viewBox="0 0 24 24"><path d="M8.6 7h11.8M8.6 12h11.8M8.6 17h11.8"/><circle cx="4.4" cy="7" r="1.1" fill="currentColor" stroke="none"/><circle cx="4.4" cy="12" r="1.1" fill="currentColor" stroke="none"/><circle cx="4.4" cy="17" r="1.1" fill="currentColor" stroke="none"/></svg>',
  chev:'<svg viewBox="0 0 24 24"><path d="m9 5 7 7-7 7"/></svg>',
  card:'<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="2.4"/><path d="M3 10.4h18"/></svg>'
};
/* terminus glyphs, echoing the four roundels on the map */
var TERMG = {
  'turn-off':'<path d="M12 4.4v7.2"/><path d="M17.4 6.8a7.2 7.2 0 1 1-10.8 0"/>',
  'avoid':'<path d="M2.8 12S6.6 5.6 12 5.6 21.2 12 21.2 12 17.4 18.4 12 18.4 2.8 12 2.8 12Z"/><circle cx="12" cy="12" r="2.7"/>',
  'replace':'<path d="M4 9.4A8 8 0 0 1 18.6 7.6"/><path d="M20 14.6A8 8 0 0 1 5.4 16.4"/><path d="M19.4 3.6v4.2h-4.2M4.6 20.4v-4.2h4.2"/>',
  'human':'<circle cx="9" cy="8.6" r="3"/><path d="M3.4 19.2a5.6 5.6 0 0 1 11.2 0"/><path d="M16.2 7.2a2.6 2.6 0 0 1 0 5"/><path d="M17.4 14.4a5 5 0 0 1 3.4 4.8"/>'
};
/* category glyphs for the gold interchanges */
var CATG = {
  search:'M11.4 4.6a6 6 0 1 1 0 12 6 6 0 0 1 0-12ZM15.9 15.4 20.6 20',
  social:'M9.4 5.7a2.9 2.9 0 1 1 0 5.8 2.9 2.9 0 0 1 0-5.8ZM4.2 18.6a5.2 5.2 0 0 1 10.4 0M16 7.4a2.4 2.4 0 0 1 0 4.8M17.2 14a4.6 4.6 0 0 1 2.9 4.6',
  images:'M3.8 5.4h16.4v13.2H3.8ZM4.8 16.6l4.2-4 3.2 3 2.9-2.5 4 3.4M8.4 9.6a1.3 1.3 0 1 0 0-.01',
  writing:'M5.4 3.8h8.4l4.8 4.8v11.6H5.4ZM13.4 3.8v5h5M8 13.4h8M8 16.6h5',
  shopping:'M4.8 8h14.4l-1 11H5.8ZM8.8 10.2V7.4a3.2 3.2 0 0 1 6.4 0v2.8',
  browsing:'M12 3.6a8.4 8.4 0 1 1 0 16.8 8.4 8.4 0 0 1 0-16.8ZM3.6 12h16.8M12 3.6c2.3 2.4 3.5 5.3 3.5 8.4s-1.2 6-3.5 8.4c-2.3-2.4-3.5-5.3-3.5-8.4s1.2-6 3.5-8.4Z',
  video:'M3 6h13v12H3ZM16 11l5-3v8l-5-3Z',
  everyday:'M4.4 5h6a2.6 2.6 0 0 1 2.6 2.6v11.6a2 2 0 0 0-2-2H4.4ZM19.6 5h-6a2.6 2.6 0 0 0-2.6 2.6v11.6a2 2 0 0 1 2-2h6.6Z'
};

/* ── preferences ───────────────────────────────────────────────── */
var store = {
  get: function (k, d) {
    try { var v = localStorage.getItem('ilud.trn.' + k); return v === null ? d : JSON.parse(v); }
    catch (e) { return d; }
  },
  set: function (k, v) { try { localStorage.setItem('ilud.trn.' + k, JSON.stringify(v)); } catch (e) {} }
};
var kept = store.get('kept', []);
var prefs = { sound: store.get('sound', true), noMotion: store.get('noMotion', false) };
var sysReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function reduced() { return sysReduced || prefs.noMotion; }
function applyMotion() { document.documentElement.setAttribute('data-motion', reduced() ? '0' : '1'); }
applyMotion();

/* ══ sound ═══════════════════════════════════════════════════════
   Rolling stock: a rail joint under the wheels, a door chime, the
   two-note bell before an announcement, a ticket validator.
   All synthesised at run time — no audio files anywhere.           */
var Snd = (function () {
  var ctx = null, master = null;
  function boot() {
    if (ctx) return;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try { ctx = new AC(); } catch (e) { return; }
    var comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -19; comp.ratio.value = 6;
    master = ctx.createGain(); master.gain.value = 0.28;
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
    env(o, t, a, d, peak); o.start(t); o.stop(t + a + d + 0.06);
    return o;
  }
  /* a struck bell: fundamental plus an inharmonic partial */
  function bell(f, t, peak, dur) {
    tone(f, t, 0.003, dur, peak, 'sine');
    tone(f * 2.76, t, 0.003, dur * 0.42, peak * 0.30, 'sine');
    tone(f * 5.4, t, 0.002, dur * 0.2, peak * 0.12, 'sine');
  }
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
    s.start(t); s.stop(t + dur + 0.04);
  }
  var lib = {
    /* one rail joint passing under the wheels */
    joint: function (t) {
      noise(t, 0.05, { type:'bandpass', f0: 260, q: 1.6, peak: 0.30, decay: 3 });
      noise(t + 0.055, 0.05, { type:'bandpass', f0: 230, q: 1.6, peak: 0.22, decay: 3 });
      tone(74, t, 0.002, 0.07, 0.10, 'sine');
    },
    /* a detent as the map settles on a station */
    click: function (t) {
      noise(t, 0.022, { f0: 3100, q: 2.6, peak: 0.24, decay: 3.2 });
      tone(880, t, 0.001, 0.016, 0.035, 'triangle');
    },
    /* the door chime: two notes, falling */
    chime: function (t) { bell(1318.5, t, 0.10, 0.5); bell(987.8, t + 0.15, 0.085, 0.72); },
    /* the announcement bell before a platform message */
    bong:  function (t) { bell(659.3, t, 0.11, 1.05); bell(880, t + 0.2, 0.08, 1.2); },
    /* closing: the chime inverted */
    shut:  function (t) { bell(987.8, t, 0.08, 0.42); bell(740, t + 0.13, 0.07, 0.6); },
    /* air brakes — the map moving a long way */
    glide: function (t) { noise(t, 0.44, { type:'lowpass', f0: 1500, f1: 300, q: 0.7, peak: 0.16, attack: 0.09 }); },
    /* the ticket validator */
    stamp: function (t) {
      noise(t, 0.05, { type:'lowpass', f0: 1100, q: 0.8, peak: 0.36, decay: 2 });
      tone(180, t + 0.005, 0.002, 0.06, 0.13, 'sine');
      bell(1568, t + 0.02, 0.05, 0.3);
    },
    unstamp: function (t) { noise(t, 0.05, { type:'lowpass', f0: 800, q: 0.8, peak: 0.22, decay: 2 }); tone(300, t, 0.003, 0.1, 0.05, 'triangle'); },
    /* departure */
    go:    function (t) { bell(880, t, 0.09, 0.4); bell(1318.5, t + 0.1, 0.08, 0.66); noise(t, 0.05, { f0: 2600, q: 1.3, peak: 0.16, decay: 3 }); },
    err:   function (t) { tone(150, t, 0.004, 0.13, 0.10, 'square'); tone(124, t + 0.1, 0.004, 0.16, 0.08, 'square'); }
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
  toastT = setTimeout(function () { t.classList.remove('toast--on'); }, 3400);
}

/* ══ the panel ═══════════════════════════════════════════════════
   One sheet serves the full record, Find, Plan, the Travelcard and
   Notices. A small stack lets a record open on top of a search.     */
var pages = [];
var lastFocus = null;
var openedAt = 0;

function panelOpen(spec) {
  var panel = $('#panel'), dim = $('#dim');
  openedAt = Date.now();
  if (!pages.length) {
    lastFocus = document.activeElement;
    dim.hidden = false;
    requestAnimationFrame(function () { dim.classList.add('dim--on'); });
    panel.hidden = false;
    requestAnimationFrame(function () { panel.classList.add('panel--on'); });
    Snd.play('chime');
  } else {
    Snd.play('click');
  }
  pages.push(spec);
  paint();
  try { history.pushState({ trn: pages.length }, ''); } catch (e) {}
}

function paint() {
  var spec = pages[pages.length - 1];
  if (!spec) return;
  $('#panelKicker').textContent = spec.kicker || '';
  /* a fresh node each time — renderers bind their own listeners */
  var old = $('#panelBody');
  var body = old.cloneNode(false);
  old.parentNode.replaceChild(body, old);
  body.scrollTop = 0;
  spec.render(body);
  if (spec.focus) {
    setTimeout(function () { var el = body.querySelector(spec.focus); if (el) el.focus(); }, 380);
  }
}

var closing = false;
var closingAll = false;
function panelClose() {
  if (!pages.length || closing) return;
  closing = true;
  var depth = pages.length;
  try { history.back(); } catch (e) {}
  setTimeout(function () {
    closing = false;
    if (pages.length === depth) doClose();
  }, 340);
}

/* dismiss the whole stack — used when a sheet hands the job to the map */
function panelCloseAll() {
  if (!pages.length) return;
  closingAll = true; closing = true;
  var depth = pages.length;
  try { history.go(-depth); } catch (e) {}
  setTimeout(function () {
    closing = false;
    if (pages.length) { pages.length = 0; teardown(); }
    closingAll = false;
  }, 380);
}

function doClose() {
  if (!pages.length) return;
  closing = false;
  if (closingAll) { pages.length = 0; closingAll = false; teardown(); return; }
  pages.pop();
  if (pages.length) { paint(); Snd.play('click'); return; }
  teardown();
}

function teardown() {
  var panel = $('#panel'), dim = $('#dim');
  panel.classList.remove('panel--on');
  dim.classList.remove('dim--on');
  setTimeout(function () {
    if (!pages.length) { panel.hidden = true; dim.hidden = true; $('#panelBody').innerHTML = ''; }
  }, 520);
  Snd.play('shut');
  $$('.dock__b').forEach(function (b) { b.removeAttribute('data-on'); });
  if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
}
function panelDepth() { return pages.length; }

window.addEventListener('popstate', function () { if (pages.length) doClose(); });
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && pages.length) { e.preventDefault(); panelClose(); }
});
document.addEventListener('click', function (e) {
  /* a tap that opened the panel also emits a trailing click; ignore it */
  if (e.target.id === 'dim' && Date.now() - openedAt > 420) panelClose();
  if (e.target.closest('#panelX')) panelClose();
});

/* drag the panel head down to dismiss */
(function () {
  var panel = $('#panel');
  var head = panel.querySelector('.panel__top');
  var y0 = 0, dy = 0, on = false, t0 = 0, wide = false;
  head.addEventListener('pointerdown', function (e) {
    if (e.target.closest('button,input,a')) return;
    on = true; y0 = e.clientY; dy = 0; t0 = Date.now();
    wide = window.innerWidth >= 720;
    panel.style.transition = 'none';
    try { head.setPointerCapture(e.pointerId); } catch (err) {}
  });
  head.addEventListener('pointermove', function (e) {
    if (!on) return;
    dy = Math.max(0, e.clientY - y0);
    panel.style.transform = wide ? 'translate(-50%,' + dy + 'px)' : 'translateY(' + dy + 'px)';
  });
  function end() {
    if (!on) return;
    on = false;
    panel.style.transition = '';
    panel.style.transform = '';
    if (dy > 110 || ((Date.now() - t0) < 320 && dy > 44)) panelClose();
  }
  head.addEventListener('pointerup', end);
  head.addEventListener('pointercancel', end);
})();

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

/* ── dates, history, travelcard ────────────────────────────────── */
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
  paintCard();
  return i < 0;
}
function paintCard() {
  var n = $('#dockN');
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
    if (!q) { Snd.play('err'); toast('Type what you are looking for first.'); return; }
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
    .slice(0, 30).map(function (x) { return x.f; });
}

return {
  D: D, $: $, $$: $$, clamp: clamp, esc: esc,
  byId: byId, catById: catById, appById: appById, confById: confById,
  effortById: effortById, platById: platById, weight: weight,
  LINES: LINES, lineById: lineById,
  ICON: ICON, CATG: CATG, TERMG: TERMG,
  store: store, prefs: prefs, reduced: reduced, applyMotion: applyMotion,
  get kept() { return kept; },
  Snd: Snd, buzz: buzz, toast: toast,
  panelOpen: panelOpen, panelClose: panelClose, panelCloseAll: panelCloseAll, panelDepth: panelDepth,
  copy: copy, fmtDate: fmtDate, daysSince: daysSince, freshness: freshness,
  remember: remember, isKept: isKept, toggleKeep: toggleKeep, paintCard: paintCard,
  launch: launch, search: search
};
})();
