/* ══════════════════════════════════════════════════════════════════
   ILUD INSTRUMENT — core
   Shared state, synthesised sound, drawers. No dependencies.
   ══════════════════════════════════════════════════════════════════ */
window.INS = (function () {
'use strict';

var D = window.ILUD_DATA;
if (!D) {
  document.body.innerHTML = '<p style="padding:40px;font:16px system-ui;color:#a5947a">' +
    'The instrument has no dial plate — data.js did not load.</p>';
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

/* remedies per category, best first — this is the order of the hub dial */
var byCat = {};
D.categories.forEach(function (c) { byCat[c.id] = []; });
D.fixes.forEach(function (f) { if (byCat[f.category]) byCat[f.category].push(f); });
Object.keys(byCat).forEach(function (k) {
  byCat[k].sort(function (a, b) {
    var w = function (f) {
      return (f.featured ? 40 : 0) + (f.popularity || 0) * 6 +
             (f.confidence === 'high' ? 8 : f.confidence === 'medium' ? 3 : 0) +
             (f.advanced ? -6 : 0) + (f.install === 'none' ? 4 : 0);
    };
    return w(b) - w(a);
  });
});

/* ── glyphs ────────────────────────────────────────────────────── */
var G = {
  search:'<circle cx="12" cy="10.6" r="6"/><path d="M16.4 15.2 21 20"/>',
  social:'<circle cx="9.4" cy="8.6" r="2.9"/><path d="M4.2 18.6a5.2 5.2 0 0 1 10.4 0"/><circle cx="17" cy="9.8" r="2.2"/><path d="M15.8 18.6h4.2a4.1 4.1 0 0 0-2.4-3.7"/>',
  images:'<rect x="3.8" y="5.4" width="16.4" height="13.2" rx="2"/><circle cx="8.8" cy="10" r="1.4"/><path d="m4.8 16.6 4.2-4 3.2 3 2.9-2.5 4 3.4"/>',
  writing:'<path d="M5.4 3.8h8.4l4.8 4.8v11.6H5.4Z"/><path d="M13.4 4v4.8h4.6"/><path d="M8 13h8M8 16.4h5"/>',
  shopping:'<path d="M4.8 8h14.4l-1 11a1.4 1.4 0 0 1-1.4 1.2H7.2A1.4 1.4 0 0 1 5.8 19Z"/><path d="M8.8 10.2V7.4a3.2 3.2 0 0 1 6.4 0v2.8"/>',
  browsing:'<circle cx="12" cy="12" r="8.4"/><path d="M3.6 12h16.8"/><path d="M12 3.6c2.3 2.4 3.5 5.3 3.5 8.4s-1.2 6-3.5 8.4c-2.3-2.4-3.5-5.3-3.5-8.4s1.2-6 3.5-8.4Z"/>',
  video:'<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 11 5-3v8l-5-3Z"/>',
  everyday:'<path d="M4.4 5h6a2.6 2.6 0 0 1 2.6 2.6v11.6a2 2 0 0 0-2-2H4.4Z"/><path d="M19.6 5h-6a2.6 2.6 0 0 0-2.6 2.6v11.6a2 2 0 0 1 2-2h6.6Z"/>'
};
var ICON = {
  arrow:'<svg viewBox="0 0 24 24" class="row__go"><path d="m9 5 7 7-7 7"/></svg>',
  ext:'<svg viewBox="0 0 24 24"><path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M18 14v5a1.6 1.6 0 0 1-1.6 1.6H5.6A1.6 1.6 0 0 1 4 19V8.2a1.6 1.6 0 0 1 1.6-1.6H10"/></svg>',
  phone:'<svg viewBox="0 0 24 24"><rect x="7" y="2.6" width="10" height="18.8" rx="2.2"/><path d="M11 18.6h2"/></svg>',
  install:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.6"/><path d="m6 6 12 12"/></svg>',
  shield:'<svg viewBox="0 0 24 24"><path d="M12 2.8 19.4 6v6.2c0 4.4-3.1 7.6-7.4 9-4.3-1.4-7.4-4.6-7.4-9V6Z"/><path d="m8.8 12 2.3 2.3 4.1-4.6"/></svg>',
  clock:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.6"/><path d="M12 7v5.4l3.4 2"/></svg>'
};

/* ── preferences ───────────────────────────────────────────────── */
var store = {
  get: function (k, d) {
    try { var v = localStorage.getItem('ilud.ins.' + k); return v === null ? d : JSON.parse(v); }
    catch (e) { return d; }
  },
  set: function (k, v) { try { localStorage.setItem('ilud.ins.' + k, JSON.stringify(v)); } catch (e) {} }
};
var kept = store.get('kept', []);
var prefs = {
  sound: store.get('sound', true),
  noMotion: store.get('noMotion', false)
};
var sysReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function reduced() { return sysReduced || prefs.noMotion; }
if (reduced()) document.body.classList.add('no-motion');

/* ══ sound ═══════════════════════════════════════════════════════
   An instrument should be heard as well as felt. Everything here is
   synthesised at runtime — no files, works offline, unlocked by the
   first gesture as mobile browsers require.                        */
var Snd = (function () {
  var ctx = null, master = null, comp = null;
  function boot() {
    if (ctx) return;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try { ctx = new AC(); } catch (e) { return; }
    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18; comp.ratio.value = 6;
    master = ctx.createGain(); master.gain.value = 0.34;
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
    env(o, t, a, d, peak); o.start(t); o.stop(t + a + d + 0.04);
    return o;
  }
  function burst(t, dur, freq, q, peak, decay) {
    var n = Math.max(8, Math.floor(ctx.sampleRate * dur));
    var buf = ctx.createBuffer(1, n, ctx.sampleRate), ch = buf.getChannelData(0);
    for (var i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay || 2);
    var s = ctx.createBufferSource(); s.buffer = buf;
    var f = ctx.createBiquadFilter(); f.type = 'bandpass';
    f.frequency.setValueAtTime(freq, t); f.Q.value = q;
    s.connect(f); env(f, t, 0.001, dur, peak);
    s.start(t); s.stop(t + dur + 0.02);
  }
  var lib = {
    /* the outer ring: a heavy, machined detent */
    detent: function (t) { burst(t, 0.035, 2100, 1.1, 0.5, 3); tone(168, t, 0.001, 0.045, 0.16, 'triangle'); },
    /* the hub: lighter, higher, a jeweller's tick */
    tick:   function (t) { burst(t, 0.022, 3500, 2.2, 0.32, 3); tone(430, t, 0.001, 0.025, 0.05, 'triangle'); },
    press:  function (t) { burst(t, 0.016, 1500, 1.4, 0.3, 3); tone(120, t + 0.004, 0.001, 0.05, 0.12, 'sine'); },
    engage: function (t) { tone(392, t, 0.004, 0.13, 0.1, 'triangle'); tone(587, t + 0.055, 0.004, 0.2, 0.07, 'triangle'); burst(t, 0.02, 2600, 1.6, 0.26, 3); },
    open:   function (t) {
      var n = Math.floor(ctx.sampleRate * 0.36), buf = ctx.createBuffer(1, n, ctx.sampleRate), ch = buf.getChannelData(0);
      for (var i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / n);
      var s = ctx.createBufferSource(); s.buffer = buf;
      var f = ctx.createBiquadFilter(); f.type = 'lowpass';
      f.frequency.setValueAtTime(420, t); f.frequency.exponentialRampToValueAtTime(1500, t + 0.3);
      s.connect(f); env(f, t, 0.06, 0.3, 0.2); s.start(t); s.stop(t + 0.4);
      tone(262, t + 0.02, 0.01, 0.2, 0.05, 'sine');
    },
    close:  function (t) { burst(t, 0.05, 900, 1, 0.3, 2.4); tone(147, t + 0.02, 0.005, 0.12, 0.09, 'sine'); },
    mark:   function (t) { tone(880, t, 0.003, 0.16, 0.09, 'triangle'); tone(1318, t + 0.05, 0.003, 0.22, 0.055, 'triangle'); },
    unmark: function (t) { tone(392, t, 0.003, 0.14, 0.07, 'triangle'); },
    err:    function (t) { tone(180, t, 0.004, 0.1, 0.1, 'square'); tone(150, t + 0.09, 0.004, 0.12, 0.08, 'square'); }
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
  toastT = setTimeout(function () { t.classList.remove('toast--on'); }, 3000);
}

/* ── drawers ───────────────────────────────────────────────────── */
var openStack = [];
var lastFocus = null;
function openDrawer(id) {
  if (openStack.indexOf(id) > -1) return;
  var d = $('#' + id), veil = $('#veil');
  if (!d) return;
  if (!openStack.length) { lastFocus = document.activeElement; veil.hidden = false; requestAnimationFrame(function () { veil.classList.add('veil--on'); }); }
  d.hidden = false;
  requestAnimationFrame(function () { d.classList.add('drawer--on'); });
  openStack.push(id);
  Snd.play('open');
  try { history.pushState({ drawer: id }, ''); } catch (e) {}
  setTimeout(function () {
    var f = d.querySelector('input,button:not(.shut)');
    if (f && id === 'find') f.focus();
  }, 420);
}
function closeDrawer(id, fromPop) {
  var i = openStack.indexOf(id);
  if (i < 0) return;
  openStack.splice(i, 1);
  var d = $('#' + id);
  d.classList.remove('drawer--on');
  setTimeout(function () { if (openStack.indexOf(id) < 0) d.hidden = true; }, 440);
  if (!openStack.length) {
    var veil = $('#veil');
    veil.classList.remove('veil--on');
    setTimeout(function () { if (!openStack.length) veil.hidden = true; }, 360);
    if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) {}
  }
  Snd.play('close');
  if (!fromPop) { try { history.back(); } catch (e) {} }
}
function closeTop(fromPop) {
  if (openStack.length) closeDrawer(openStack[openStack.length - 1], fromPop);
}
window.addEventListener('popstate', function () { if (openStack.length) closeTop(true); });
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && openStack.length) { e.preventDefault(); closeTop(); }
});
document.addEventListener('click', function (e) {
  var s = e.target.closest('[data-shut]');
  if (s) { closeDrawer(s.dataset.shut); return; }
  if (e.target.id === 'veil') closeTop();
});

/* drag a drawer down by its head to dismiss it */
$$('.drawer').forEach(function (d) {
  var y0 = 0, dy = 0, dragging = false, t0 = 0;
  var handle = d.querySelector('.drawer__head');
  function start(e) {
    if (e.target.closest('button,input,a')) return;
    dragging = true; y0 = e.clientY; dy = 0; t0 = Date.now();
    d.style.transition = 'none';
  }
  function move(e) {
    if (!dragging) return;
    dy = Math.max(0, e.clientY - y0);
    d.style.transform = 'translateY(' + dy + 'px)';
    if (window.innerWidth >= 700) d.style.transform = 'translate(-50%,' + dy + 'px)';
  }
  function end() {
    if (!dragging) return;
    dragging = false;
    d.style.transition = '';
    var fast = (Date.now() - t0) < 320 && dy > 40;
    if (dy > 110 || fast) { d.style.transform = ''; closeTop(); }
    else d.style.transform = '';
  }
  if (handle) {
    handle.addEventListener('pointerdown', start);
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);
    handle.addEventListener('pointerdown', function (e) {
      if (!e.target.closest('button,input,a')) handle.setPointerCapture(e.pointerId);
    });
  }
});

/* ── clipboard ─────────────────────────────────────────────────── */
function copy(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return fallback(text); });
  }
  return Promise.resolve(fallback(text));
}
function fallback(text) {
  try {
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    var ok = document.execCommand('copy');
    document.body.removeChild(ta); return ok;
  } catch (e) { return false; }
}

/* ── misc ──────────────────────────────────────────────────────── */
var MONTH = ['January','February','March','April','May','June','July','August','September','October','November','December'];
function fmtDate(d) { var p = d.split('-'); return parseInt(p[2], 10) + ' ' + MONTH[parseInt(p[1], 10) - 1] + ' ' + p[0]; }
function daysSince(d) { return Math.round((Date.now() - new Date(d + 'T00:00:00Z').getTime()) / 86400000); }
function remember(id) {
  var r = store.get('recent', []).filter(function (x) { return x !== id; });
  r.unshift(id); store.set('recent', r.slice(0, 12));
}
function keptCount() {
  var n = $('#keptN');
  n.textContent = kept.length;
  n.hidden = kept.length === 0;
}

return {
  D: D, $: $, $$: $$, clamp: clamp, esc: esc,
  byId: byId, catById: catById, appById: appById, confById: confById, effortById: effortById,
  byCat: byCat, G: G, ICON: ICON,
  store: store, prefs: prefs, reduced: reduced,
  get kept() { return kept; },
  Snd: Snd, buzz: buzz, toast: toast,
  openDrawer: openDrawer, closeDrawer: closeDrawer, closeTop: closeTop,
  copy: copy, fmtDate: fmtDate, daysSince: daysSince, remember: remember, keptCount: keptCount
};
})();
