/* ══════════════════════════════════════════════════════════════════
   ILUD ATLAS — an archipelago you can sail
   Vanilla JS, no dependencies, works from the file system.
   ══════════════════════════════════════════════════════════════════ */
(function () {
'use strict';

var D = window.ILUD_DATA;
if (!D) { document.body.innerHTML = '<p style="padding:40px;font:16px system-ui;color:#c3b69a">The chart room is empty — data.js did not load.</p>'; return; }

var $  = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
var byId = {}; D.fixes.forEach(function (f) { byId[f.id] = f; });
var catById = {}; D.categories.forEach(function (c) { catById[c.id] = c; });
var appById = {}; D.approaches.forEach(function (a) { appById[a.id] = a; });
var confById = {}; D.confidence.forEach(function (c) { confById[c.id] = c; });
var effortById = {}; D.effort.forEach(function (e) { effortById[e.id] = e; });

/* ── icons ─────────────────────────────────────────────────────── */
var GLYPH = {
  search:'<circle cx="10.5" cy="10.5" r="6.4"/><path d="M15.4 15.4 21 21"/>',
  people:'<circle cx="9" cy="8" r="3.1"/><path d="M3.4 19a5.6 5.6 0 0 1 11.2 0"/><circle cx="17.2" cy="9.4" r="2.4"/><path d="M15.8 19h4.8a4.4 4.4 0 0 0-2.6-4"/>',
  image:'<rect x="3.5" y="5" width="17" height="14" rx="2.2"/><circle cx="8.6" cy="10" r="1.5"/><path d="m4.5 17 4.4-4.2 3.4 3.2 3-2.6 4.2 3.6"/>',
  pen:'<path d="M5 3.6h9l5 5V20a1.4 1.4 0 0 1-1.4 1.4H5A1.4 1.4 0 0 1 3.6 20V5A1.4 1.4 0 0 1 5 3.6Z"/><path d="M13.6 3.8V9h5.2"/><path d="M7.6 13h8M7.6 16.6h5.4"/>',
  bag:'<path d="M4.6 8h14.8l-1.1 11.4a1.5 1.5 0 0 1-1.5 1.3H7.2a1.5 1.5 0 0 1-1.5-1.3Z"/><path d="M8.6 10.4V7.2a3.4 3.4 0 0 1 6.8 0v3.2"/>',
  globe:'<circle cx="12" cy="12" r="8.6"/><path d="M3.4 12h17.2"/><path d="M12 3.4c2.4 2.5 3.6 5.5 3.6 8.6S14.4 18.1 12 20.6C9.6 18.1 8.4 15.1 8.4 12S9.6 5.9 12 3.4Z"/>',
  play:'<circle cx="12" cy="12" r="8.6"/><path d="M10.2 8.6 16 12l-5.8 3.4Z"/>',
  book:'<path d="M4.4 4.6h6.2a2.6 2.6 0 0 1 2.6 2.6v12a2 2 0 0 0-2-2H4.4Z"/><path d="M19.6 4.6h-6.2a2.6 2.6 0 0 0-2.6 2.6v12a2 2 0 0 1 2-2h6.8Z"/>'
};
var ARROW = '<svg viewBox="0 0 24 24"><path d="m9 5 7 7-7 7"/></svg>';
var EXT   = '<svg viewBox="0 0 24 24"><path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M18 14v5a1.6 1.6 0 0 1-1.6 1.6H5.6A1.6 1.6 0 0 1 4 19V8.2a1.6 1.6 0 0 1 1.6-1.6H10"/></svg>';

/* ── preferences ───────────────────────────────────────────────── */
var store = {
  get: function (k, d) { try { var v = localStorage.getItem('ilud.atlas.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set: function (k, v) { try { localStorage.setItem('ilud.atlas.' + k, JSON.stringify(v)); } catch (e) {} }
};
var saved = store.get('saved', []);
var soundOn = store.get('sound', true);
var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches || store.get('noMotion', false);
if (reduced) document.body.classList.add('no-motion');

/* ══ sound ═══════════════════════════════════════════════════════
   Everything is synthesised: no audio files, nothing to download,
   and it works offline. Unlocked by the first real gesture, per the
   autoplay rules every mobile browser enforces.                   */
var Audio2 = (function () {
  var ctx = null, master = null, ready = false;
  function boot() {
    if (ctx) return;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try { ctx = new AC(); } catch (e) { return; }
    master = ctx.createGain(); master.gain.value = 0.3; master.connect(ctx.destination);
    ready = true;
  }
  function on() { return soundOn && ready && ctx && ctx.state === 'running'; }
  function env(node, t, a, d, peak) {
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
    node.connect(g); g.connect(master);
    return g;
  }
  function tone(freq, t, a, d, peak, type) {
    var o = ctx.createOscillator(); o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
    env(o, t, a, d, peak); o.start(t); o.stop(t + a + d + 0.05);
    return o;
  }
  function noise(dur) {
    var n = Math.floor(ctx.sampleRate * dur);
    var buf = ctx.createBuffer(1, n, ctx.sampleRate), ch = buf.getChannelData(0);
    for (var i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var s = ctx.createBufferSource(); s.buffer = buf; return s;
  }
  var lib = {
    tap: function (t) { tone(760, t, 0.002, 0.035, 0.12, 'triangle'); },
    click: function (t) { tone(1500, t, 0.001, 0.02, 0.09, 'square'); },
    water: function (t) {
      var s = noise(0.55), f = ctx.createBiquadFilter();
      f.type = 'bandpass'; f.frequency.setValueAtTime(420, t);
      f.frequency.exponentialRampToValueAtTime(1500, t + 0.4); f.Q.value = 0.8;
      s.connect(f); env(f, t, 0.09, 0.45, 0.22); s.start(t); s.stop(t + 0.6);
    },
    land: function (t) {
      tone(196, t, 0.01, 0.5, 0.11, 'sine');
      tone(294, t + 0.05, 0.01, 0.45, 0.075, 'sine');
      tone(392, t + 0.11, 0.01, 0.6, 0.05, 'sine');
    },
    open: function (t) { tone(440, t, 0.006, 0.16, 0.08, 'sine'); tone(660, t + 0.04, 0.006, 0.18, 0.055, 'sine'); },
    close: function (t) { tone(392, t, 0.005, 0.14, 0.07, 'sine'); tone(262, t + 0.04, 0.005, 0.16, 0.05, 'sine'); },
    mark: function (t) { tone(880, t, 0.004, 0.22, 0.1, 'sine'); tone(1320, t + 0.06, 0.004, 0.3, 0.06, 'sine'); },
    unmark: function (t) { tone(330, t, 0.004, 0.18, 0.07, 'sine'); },
    sail: function (t) {
      var s = noise(0.9), f = ctx.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.setValueAtTime(900, t);
      f.frequency.exponentialRampToValueAtTime(260, t + 0.85);
      s.connect(f); env(f, t, 0.2, 0.75, 0.14); s.start(t); s.stop(t + 1);
    }
  };
  return {
    unlock: function () {
      boot();
      if (ctx && ctx.state === 'suspended') ctx.resume();
    },
    play: function (name) {
      if (!on() || !lib[name]) return;
      try { lib[name](ctx.currentTime); } catch (e) {}
    },
    available: function () { return !!(window.AudioContext || window.webkitAudioContext); }
  };
})();

function buzz(ms) { if (navigator.vibrate && soundOn) { try { navigator.vibrate(ms); } catch (e) {} } }

/* ══ deterministic island geometry ═══════════════════════════════ */
function rng(seed) {
  var s = seed >>> 0;
  return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
function hash(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

/* smooth closed path through points (catmull-rom → cubic bezier) */
function closedPath(pts) {
  var n = pts.length, d = 'M' + pts[0][0].toFixed(1) + ',' + pts[0][1].toFixed(1);
  for (var i = 0; i < n; i++) {
    var p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    var c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    var c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += 'C' + c1x.toFixed(1) + ',' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ',' + c2y.toFixed(1) + ' ' + p2[0].toFixed(1) + ',' + p2[1].toFixed(1);
  }
  return d + 'Z';
}
function blob(cx, cy, rx, ry, seed, wob, lobes) {
  var r = rng(seed), n = 28, pts = [];
  var ph1 = r() * 6.28, ph2 = r() * 6.28, ph3 = r() * 6.28;
  for (var i = 0; i < n; i++) {
    var a = i / n * Math.PI * 2;
    var k = 1
      + Math.sin(a * (lobes || 3) + ph1) * wob
      + Math.sin(a * 5 + ph2) * wob * 0.45
      + Math.sin(a * 9 + ph3) * wob * 0.2;
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  return { d: closedPath(pts), pts: pts };
}

var W = 1550, H = 2760, CX = 775, CY = 1380;
var isles = D.categories.map(function (cat, i) {
  var seed = hash(cat.id);
  var r = rng(seed);
  var ang = (-90 + i * 45) * Math.PI / 180;
  var jr = 0.96 + r() * 0.09;
  var x = CX + Math.cos(ang) * 500 * jr + (r() - 0.5) * 30;
  var y = CY + Math.sin(ang) * 980 * jr + (r() - 0.5) * 30;
  var n = D.fixes.filter(function (f) { return f.category === cat.id; }).length;
  var size = 148 + n * 4.2;
  return {
    cat: cat, seed: seed, x: clamp(x, 240, W - 240), y: clamp(y, 280, H - 280),
    rx: size * (0.94 + r() * 0.12), ry: size * (0.82 + r() * 0.13), n: n,
    rot: (r() - 0.5) * 0.5
  };
});

/* ══ draw the world ══════════════════════════════════════════════ */
var svg = $('#worldSvg');
var NS = 'http://www.w3.org/2000/svg';
function el(tag, attrs, html) {
  var e = document.createElementNS(NS, tag);
  for (var k in attrs) e.setAttribute(k, attrs[k]);
  if (html != null) e.innerHTML = html;
  return e;
}

function drawWorld() {
  var defs = el('defs');
  defs.innerHTML =
    '<radialGradient id="shallow"><stop offset="0%" stop-color="#2a6d7e" stop-opacity=".55"/><stop offset="55%" stop-color="#17485a" stop-opacity=".3"/><stop offset="100%" stop-color="#0d2b39" stop-opacity="0"/></radialGradient>' +
    '<linearGradient id="landg" x1="0" y1="0" x2=".3" y2="1"><stop offset="0%" stop-color="#516542"/><stop offset="45%" stop-color="#2d3b2a"/><stop offset="100%" stop-color="#161f18"/></linearGradient>' +
    '<linearGradient id="ridge" x1=".2" y1="0" x2=".8" y2="1"><stop offset="0%" stop-color="#6d7a55"/><stop offset="50%" stop-color="#40492f"/><stop offset="100%" stop-color="#1c2318"/></linearGradient>' +
    '<linearGradient id="goldl" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f6e3b0"/><stop offset="50%" stop-color="#c9a24a"/><stop offset="100%" stop-color="#7d5f20"/></linearGradient>' +
    '<filter id="soft" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="16"/></filter>' +
    '<filter id="glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
  svg.appendChild(defs);

  var gSea = el('g', { 'class': 'l-sea' });
  var gRoute = el('g', { 'class': 'l-route' });
  var gLand = el('g', { 'class': 'l-land' });
  var gShip = el('g', { 'class': 'l-ship' });
  svg.appendChild(gSea); svg.appendChild(gRoute); svg.appendChild(gLand); svg.appendChild(gShip);

  /* latitude/longitude hairlines — a chart, not a photograph */
  for (var gx = 200; gx < W; gx += 200) gSea.appendChild(el('line', { x1: gx, y1: 0, x2: gx, y2: H, stroke: '#7fb6cc', 'stroke-width': .5, opacity: .05 }));
  for (var gy = 200; gy < H; gy += 200) gSea.appendChild(el('line', { x1: 0, y1: gy, x2: W, y2: gy, stroke: '#7fb6cc', 'stroke-width': .5, opacity: .05 }));

  /* scattered islets for depth */
  var sr = rng(4242);
  for (var s = 0; s < 34; s++) {
    var sx = 80 + sr() * (W - 160), sy = 120 + sr() * (H - 240);
    var near = isles.some(function (I) { return Math.abs(I.x - sx) < I.rx * 1.9 && Math.abs(I.y - sy) < I.ry * 1.9; });
    if (near || (Math.abs(sx - CX) < 430 && Math.abs(sy - CY) < 430)) continue;
    var rr = 7 + sr() * 16;
    var b = blob(sx, sy, rr, rr * 0.72, hash('islet' + s), 0.34, 4);
    gLand.appendChild(el('path', { d: b.d, fill: '#18211a', opacity: .85 }));
    gLand.appendChild(el('path', { d: b.d, fill: 'none', stroke: '#c9a24a', 'stroke-width': .6, opacity: .22 }));
  }

  /* routes from the heart to every island */
  isles.forEach(function (I) {
    var mx = (CX + I.x) / 2 + (I.y - CY) * 0.13;
    var my = (CY + I.y) / 2 - (I.x - CX) * 0.13;
    var d = 'M' + CX + ',' + CY + ' Q' + mx.toFixed(0) + ',' + my.toFixed(0) + ' ' + I.x.toFixed(0) + ',' + I.y.toFixed(0);
    var p = el('path', { d: d, fill: 'none', stroke: '#c9a24a', 'stroke-width': 2.2, 'stroke-dasharray': '2 15', 'stroke-linecap': 'round', opacity: .5 });
    p.setAttribute('id', 'route-' + I.cat.id);
    gRoute.appendChild(p);
    I.route = p;
  });

  /* the eight islands */
  isles.forEach(function (I) { drawIsle(gLand, I); });

  /* the heart — ILUD itself */
  var hb = blob(CX, CY, 205, 178, 9911, 0.13, 4);
  gLand.appendChild(el('ellipse', { cx: CX, cy: CY + 22, rx: 240, ry: 206, fill: '#02080c', opacity: .8, filter: 'url(#soft)' }));
  gLand.appendChild(el('ellipse', { cx: CX, cy: CY, rx: 282, ry: 248, fill: 'url(#shallow)' }));
  gLand.appendChild(el('path', { d: hb.d, fill: 'url(#landg)' }));
  gLand.appendChild(el('path', { d: hb.d, fill: 'none', stroke: 'url(#goldl)', 'stroke-width': 2, opacity: .75 }));
  var hb2 = blob(CX, CY - 5, 160, 136, 9912, 0.1, 4);
  gLand.appendChild(el('path', { d: hb2.d, fill: '#0a0f0b', opacity: .55 }));
  gLand.appendChild(el('path', { d: hb2.d, fill: 'none', stroke: '#c9a24a', 'stroke-width': .8, opacity: .35 }));

  /* the ship that carries you */
  var ship = el('g', { opacity: 0 });
  ship.innerHTML = '<path d="M-11 4 L11 4 L7 10 L-7 10 Z" fill="#e6d3a3"/><path d="M0 -13 L0 4" stroke="#e6d3a3" stroke-width="1.6"/><path d="M1 -12 L9 1 L1 1 Z" fill="#c9a24a"/><path d="M-1 -9 L-8 1 L-1 1 Z" fill="#a8863a"/>';
  gShip.appendChild(ship);
  window.__ship = ship;
}

function drawIsle(g, I) {
  var r = rng(I.seed + 77);
  var base = blob(I.x, I.y, I.rx, I.ry, I.seed, 0.185, 3 + Math.floor(r() * 3));

  g.appendChild(el('ellipse', { cx: I.x, cy: I.y + I.ry * 0.16, rx: I.rx * 1.16, ry: I.ry * 1.16, fill: '#02080c', opacity: .75, filter: 'url(#soft)' }));
  g.appendChild(el('ellipse', { cx: I.x, cy: I.y, rx: I.rx * 1.42, ry: I.ry * 1.42, fill: 'url(#shallow)' }));

  var grp = el('g', { 'class': 'isle-art', 'data-cat': I.cat.id });
  grp.appendChild(el('path', { d: base.d, fill: 'url(#landg)' }));

  /* inland ridge */
  var ridge = blob(I.x - I.rx * 0.06, I.y - I.ry * 0.1, I.rx * 0.62, I.ry * 0.58, I.seed + 3, 0.3, 4);
  grp.appendChild(el('path', { d: ridge.d, fill: 'url(#ridge)', opacity: .55 }));

  /* mountains */
  var mts = 3 + Math.floor(r() * 4);
  for (var m = 0; m < mts; m++) {
    var a = r() * Math.PI * 2, rad = r() * 0.42;
    var mx = I.x + Math.cos(a) * I.rx * rad, my = I.y + Math.sin(a) * I.ry * rad;
    var hgt = I.ry * (0.15 + r() * 0.2), wid = hgt * (0.7 + r() * 0.5);
    grp.appendChild(el('path', { d: 'M' + (mx - wid) + ',' + my + ' L' + mx + ',' + (my - hgt) + ' L' + (mx + wid) + ',' + my + ' Z', fill: '#9aa77d', opacity: .46 }));
    grp.appendChild(el('path', { d: 'M' + mx + ',' + my + ' L' + mx + ',' + (my - hgt) + ' L' + (mx + wid) + ',' + my + ' Z', fill: '#141c14', opacity: .62 }));
  }

  /* forest speckle, clipped to the coast by rejection sampling */
  for (var t = 0; t < 110; t++) {
    var ta = r() * Math.PI * 2, tr = Math.sqrt(r()) * 0.86;
    var tx = I.x + Math.cos(ta) * I.rx * tr, ty = I.y + Math.sin(ta) * I.ry * tr;
    var sz = 2 + r() * 3.4;
    grp.appendChild(el('circle', { cx: tx.toFixed(1), cy: ty.toFixed(1), r: sz.toFixed(1), fill: r() > .45 ? '#4c6540' : '#33452c', opacity: (.42 + r() * .42).toFixed(2) }));
  }

  /* coastline */
  grp.appendChild(el('path', { d: base.d, fill: 'none', stroke: 'url(#goldl)', 'stroke-width': 1.8, opacity: .72 }));
  var inner = blob(I.x, I.y, I.rx * 0.9, I.ry * 0.9, I.seed + 11, 0.24, 3);
  grp.appendChild(el('path', { d: inner.d, fill: 'none', stroke: '#c9a24a', 'stroke-width': .6, opacity: .2, 'stroke-dasharray': '3 6' }));

  g.appendChild(grp);
  I.art = grp;
}

/* ══ labels in world space ═══════════════════════════════════════ */
var labels = $('#labels');
function drawLabels() {
  isles.forEach(function (I) {
    var b = document.createElement('button');
    b.className = 'isle';
    b.setAttribute('data-cat', I.cat.id);
    b.setAttribute('aria-label', I.cat.name + ' — ' + I.n + ' entries. ' + I.cat.blurb);
    b.innerHTML =
      '<span class="isle__icon"><svg viewBox="0 0 24 24">' + GLYPH[I.cat.glyph] + '</svg></span>' +
      '<h2 class="isle__name">' + I.cat.name + '</h2>' +
      '<p class="isle__blurb">' + I.cat.blurb + '</p>' +
      '<span class="isle__n">' + I.n + ' ways</span>' +
      '<span class="isle__chev">' + ARROW + '</span>';
    labels.appendChild(b);
    I.label = b;
    I.ly = I.y + I.ry * 0.1;
  });

  var h = document.createElement('div');
  h.className = 'heart';
  h.innerHTML = '<p class="heart__word">ILUD</p><p class="heart__sub">Iludist</p><div class="heart__rule"></div>' +
                '<p class="heart__count">' + D.meta.total + ' charted remedies</p>';
  labels.appendChild(h);
  window.__heart = h;
}

/* labels are drawn in screen space each frame; the chart declutters as
   you pull back, exactly as a paper chart's type would if it could. */
var lod = '', measured = false;
function measureLabels() {
  for (var i = 0; i < isles.length; i++) {
    isles[i].lw = isles[i].label.offsetWidth;
    isles[i].lh = isles[i].label.offsetHeight;
  }
  measured = true;
}
function placeLabels() {
  var vw = viewport.clientWidth, vh = viewport.clientHeight;
  var k = clamp(view.s / startS, 0.68, 1.08);
  var nl = view.s >= startS * 1.6 ? 'near' : (view.s >= startS * 0.78 ? 'mid' : 'far');
  if (nl !== lod) {
    lod = nl; labels.setAttribute('data-lod', nl);
    requestAnimationFrame(measureLabels);
  }
  for (var i = 0; i < isles.length; i++) {
    var I = isles[i];
    var w = (I.lw || 150) * k, h = (I.lh || 90) * k;
    var sx = I.x * view.s + view.x, sy = I.ly * view.s + view.y;
    var seen = sx > -w && sx < vw + w && sy > -h && sy < vh + h;
    if (!seen) { if (I.label.style.visibility !== 'hidden') I.label.style.visibility = 'hidden'; continue; }
    if (I.label.style.visibility) I.label.style.visibility = '';
    /* keep type on screen, the way a chart's place names never run off the sheet */
    sx = clamp(sx, w / 2 + 10, Math.max(w / 2 + 10, vw - w / 2 - 10));
    sy = clamp(sy, h / 2 + 76, Math.max(h / 2 + 76, vh - h / 2 - 78));
    I.label.style.transform =
      'translate3d(' + sx.toFixed(1) + 'px,' + sy.toFixed(1) + 'px,0)' +
      ' translate(-50%,-50%) scale(' + k.toFixed(3) + ')';
  }
  if (window.__heart) {
    window.__heart.style.transform =
      'translate3d(' + (CX * view.s + view.x).toFixed(1) + 'px,' + (CY * view.s + view.y).toFixed(1) + 'px,0)' +
      ' translate(-50%,-50%) scale(' + k.toFixed(3) + ')';
  }
}

/* ══ pan & zoom ══════════════════════════════════════════════════ */
var viewport = $('#viewport'), world = $('#world');
var view = { x: 0, y: 0, s: 1 }, minS = 0.25, maxS = 2.2, fitS = 1, startS = 1;
var vel = { x: 0, y: 0 }, raf = null, anim = null;

function apply() {
  world.style.transform = 'translate3d(' + view.x.toFixed(2) + 'px,' + view.y.toFixed(2) + 'px,0) scale(' + view.s.toFixed(4) + ')';
  placeLabels();
  var c = $('#compass svg');
  if (c) c.style.transform = 'rotate(' + (view.x * 0.012).toFixed(2) + 'deg)';
}
function bounds() {
  var vw = viewport.clientWidth, vh = viewport.clientHeight;
  var ww = W * view.s, wh = H * view.s;
  var padX = Math.min(vw * 0.32, 200), padY = Math.min(vh * 0.32, 220);
  return { x0: vw - ww - padX, x1: padX, y0: vh - wh - padY, y1: padY };
}
function clampView() {
  var b = bounds();
  view.x = clamp(view.x, Math.min(b.x0, b.x1), Math.max(b.x0, b.x1));
  view.y = clamp(view.y, Math.min(b.y0, b.y1), Math.max(b.y0, b.y1));
}
function fit(immediate) {
  var vw = viewport.clientWidth, vh = viewport.clientHeight;
  fitS = Math.min(vw / W, vh / H);
  startS = fitS * (vw < 620 ? 1.12 : 1.85);
  minS = fitS * 0.92; maxS = fitS * 5.4;
  goTo(CX, CY, startS, immediate);
}
/* pull all the way back to the whole archipelago */
function fitAll(immediate) {
  goTo(CX, CY, fitS * 0.99, immediate);
}
function goTo(wx, wy, s, immediate) {
  var vw = viewport.clientWidth, vh = viewport.clientHeight;
  s = clamp(s, minS, maxS);
  var tx = vw / 2 - wx * s, ty = vh / 2 - wy * s;
  if (immediate || reduced) { view.x = tx; view.y = ty; view.s = s; clampView(); apply(); return; }
  animateTo(tx, ty, s, 780);
}
function animateTo(tx, ty, ts, dur) {
  if (anim) cancelAnimationFrame(anim);
  var s0 = { x: view.x, y: view.y, s: view.s }, t0 = performance.now();
  (function step(now) {
    var k = clamp((now - t0) / dur, 0, 1);
    var e = 1 - Math.pow(1 - k, 3);
    view.x = s0.x + (tx - s0.x) * e; view.y = s0.y + (ty - s0.y) * e; view.s = s0.s + (ts - s0.s) * e;
    apply();
    if (k < 1) anim = requestAnimationFrame(step); else { anim = null; clampView(); apply(); }
  })(t0);
}

/* pointers */
var pointers = new Map(), last = null, pinch = null, moved = 0, downAt = 0, downIsle = null;
viewport.addEventListener('pointerdown', function (e) {
  Audio2.unlock();
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  viewport.setPointerCapture(e.pointerId);
  if (pointers.size === 1) {
    last = { x: e.clientX, y: e.clientY, t: performance.now() };
    moved = 0; downAt = performance.now();
    downIsle = e.target.closest ? e.target.closest('.isle') : null;
    vel.x = vel.y = 0; if (raf) cancelAnimationFrame(raf); if (anim) { cancelAnimationFrame(anim); anim = null; }
    viewport.classList.add('dragging');
    hideNudge();
  } else if (pointers.size === 2) {
    downIsle = null;
    var p = Array.from(pointers.values());
    pinch = { d: dist(p[0], p[1]), mid: mid(p[0], p[1]), s: view.s, x: view.x, y: view.y };
  }
});
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function mid(a, b) { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; }

viewport.addEventListener('pointermove', function (e) {
  if (!pointers.has(e.pointerId)) return;
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pointers.size >= 2 && pinch) {
    var p = Array.from(pointers.values());
    var nd = dist(p[0], p[1]), nm = mid(p[0], p[1]);
    var ns = clamp(pinch.s * (nd / pinch.d), minS, maxS);
    view.x = nm.x - (pinch.mid.x - pinch.x) * (ns / pinch.s);
    view.y = nm.y - (pinch.mid.y - pinch.y) * (ns / pinch.s);
    view.s = ns; clampView(); apply();
    return;
  }
  if (!last) return;
  var dx = e.clientX - last.x, dy = e.clientY - last.y;
  var now = performance.now(), dt = Math.max(1, now - last.t);
  vel.x = dx / dt * 16; vel.y = dy / dt * 16;
  view.x += dx; view.y += dy; moved += Math.abs(dx) + Math.abs(dy);
  last = { x: e.clientX, y: e.clientY, t: now };
  clampView(); apply();
});
function release(e) {
  pointers.delete(e.pointerId);
  if (pointers.size < 2) pinch = null;
  if (pointers.size === 0) {
    viewport.classList.remove('dragging');
    last = null;
    /* the viewport captures the pointer for smooth dragging, which means the
       browser retargets the following click to the viewport — so a tap on an
       island has to be resolved here instead. */
    if (moved < 12 && downIsle && e.type === 'pointerup') {
      var cat = downIsle.dataset.cat; downIsle = null;
      sailTo(cat);
      return;
    }
    downIsle = null;
    if (moved > 12 && !reduced) glide();
  }
}
viewport.addEventListener('pointerup', release);
viewport.addEventListener('pointercancel', release);
function glide() {
  var v = { x: vel.x, y: vel.y };
  (function step() {
    v.x *= 0.93; v.y *= 0.93;
    view.x += v.x; view.y += v.y; clampView(); apply();
    if (Math.abs(v.x) + Math.abs(v.y) > 0.4) raf = requestAnimationFrame(step); else raf = null;
  })();
}
viewport.addEventListener('wheel', function (e) {
  e.preventDefault();
  var f = Math.exp(-e.deltaY * 0.0016);
  var ns = clamp(view.s * f, minS, maxS);
  view.x = e.clientX - (e.clientX - view.x) * (ns / view.s);
  view.y = e.clientY - (e.clientY - view.y) * (ns / view.s);
  view.s = ns; clampView(); apply(); hideNudge();
}, { passive: false });

var nudgeGone = false;
function hideNudge() { if (nudgeGone) return; nudgeGone = true; var n = $('#nudge'); if (n) { n.style.transition = 'opacity .6s'; n.style.opacity = '0'; setTimeout(function () { n.hidden = true; }, 700); } }

/* ══ sailing to an island ════════════════════════════════════════ */
var sailing = false;
function sailTo(catId) {
  var I = isles.filter(function (x) { return x.cat.id === catId; })[0];
  if (!I || sailing) return;
  sailing = true;
  Audio2.play('sail'); buzz(12);
  I.art.classList.add('isle--hit');
  setTimeout(function () { I.art.classList.remove('isle--hit'); }, 700);

  var ship = window.__ship, route = I.route;
  var dur = reduced ? 0 : 820;
  if (ship && route && !reduced) {
    var len = route.getTotalLength(), t0 = performance.now();
    ship.setAttribute('opacity', '1');
    (function step(now) {
      var k = clamp((now - t0) / dur, 0, 1), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      var p = route.getPointAtLength(len * e);
      var p2 = route.getPointAtLength(Math.min(len, len * e + 4));
      var ang = Math.atan2(p2.y - p.y, p2.x - p.x) * 180 / Math.PI + 90;
      ship.setAttribute('transform', 'translate(' + p.x + ',' + p.y + ') rotate(' + ang + ') scale(' + (1 / Math.max(.4, view.s) * 0.9 + 0.6) + ')');
      if (k < 1) requestAnimationFrame(step);
      else { ship.setAttribute('opacity', '0'); }
    })(t0);
  }

  goTo(I.x, I.y + I.ry * 0.05, fitS * 2.3);
  setTimeout(function () {
    sailing = false;
    Audio2.play('land');
    openHarbour(catId);
  }, reduced ? 30 : dur);
}

/* ══ sheets ══════════════════════════════════════════════════════ */
var openSheets = [];
function openSheet(id) {
  var s = $('#' + id);
  if (!s || openSheets.indexOf(id) > -1) return;
  s.hidden = false;
  s.__opener = document.activeElement;
  requestAnimationFrame(function () { s.classList.add('open'); });
  openSheets.push(id);
  Audio2.play('open');
  document.body.style.touchAction = 'none';
  setTimeout(function () {
    var f = s.querySelector('input, button:not([data-close])');
    if (f && id === 'find') f.focus();
  }, 340);
  if (!history.state || history.state.sheet !== id) {
    try { history.pushState({ sheet: id }, ''); } catch (e) {}
  }
}
function closeSheet(id, fromPop) {
  id = id || openSheets[openSheets.length - 1];
  var s = $('#' + id); if (!s) return;
  s.classList.remove('open');
  var panel = s.querySelector('.sheet__panel'); if (panel) panel.style.transform = '';
  openSheets = openSheets.filter(function (x) { return x !== id; });
  Audio2.play('close');
  setTimeout(function () { if (!s.classList.contains('open')) s.hidden = true; }, 480);
  if (!openSheets.length) document.body.style.touchAction = '';
  if (s.__opener && s.__opener.focus) { try { s.__opener.focus(); } catch (e) {} }
  if (!fromPop && history.state && history.state.sheet === id) { try { history.back(); } catch (e) {} }
}
window.addEventListener('popstate', function () {
  if (openSheets.length) closeSheet(openSheets[openSheets.length - 1], true);
});
document.addEventListener('click', function (e) {
  var c = e.target.closest('[data-close]');
  if (c) { var sh = c.closest('.sheet'); if (sh) closeSheet(sh.id); }
});
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && openSheets.length) closeSheet();
});

/* drag a sheet down to dismiss */
$$('.sheet').forEach(function (sheet) {
  var grab = sheet.querySelector('[data-drag]');
  if (!grab) return;
  var y0 = 0, dy = 0, on = false;
  var panel = sheet.querySelector('.sheet__panel');
  grab.addEventListener('pointerdown', function (e) {
    on = true; y0 = e.clientY; dy = 0; grab.setPointerCapture(e.pointerId);
    sheet.classList.add('dragging');
  });
  grab.addEventListener('pointermove', function (e) {
    if (!on) return;
    dy = Math.max(0, e.clientY - y0);
    panel.style.transform = 'translateY(' + dy + 'px)';
  });
  function end() {
    if (!on) return; on = false; sheet.classList.remove('dragging');
    if (dy > 110) { panel.style.transform = ''; closeSheet(sheet.id); }
    else panel.style.transform = '';
  }
  grab.addEventListener('pointerup', end);
  grab.addEventListener('pointercancel', end);
});

/* ══ rendering entries ═══════════════════════════════════════════ */
function tagsFor(f) {
  var t = [];
  t.push('<span class="tag tag--conf-' + f.confidence + '">' + confById[f.confidence].name + '</span>');
  t.push('<span class="tag">' + effortById[f.effort].name + '</span>');
  if (f.install === 'extension') t.push('<span class="tag">Needs an add-on</span>');
  if (f.install === 'app') t.push('<span class="tag">Needs an app</span>');
  if (f.cost === 'paid') t.push('<span class="tag">Paid</span>');
  if (f.region) t.push('<span class="tag">' + f.region + '</span>');
  return t.join('');
}
function chipHTML(f, showCat) {
  return '<button class="chip" data-fix="' + f.id + '">' +
    '<span class="chip__svc">' + f.service + '</span>' +
    '<span class="chip__title">' + f.title + '</span>' +
    '<span class="chip__sum">' + f.summary + '</span>' +
    '<span class="chip__meta">' + (showCat ? '<span class="tag tag--cat">' + catById[f.category].short + '</span>' : '') + tagsFor(f) + '</span>' +
    '<span class="chip__go">' + ARROW + '</span>' +
    '</button>';
}
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

/* ── harbour ─────────────────────────────────────────────────── */
var harbourCat = null, harbourFilter = 'all';
function openHarbour(catId) {
  harbourCat = catId; harbourFilter = 'all';
  var cat = catById[catId];
  $('#harbourTitle').textContent = cat.name;
  $('#harbourBlurb').textContent = cat.blurb;
  $('#harbourCrest').innerHTML = '<svg viewBox="0 0 24 24">' + GLYPH[cat.glyph] + '</svg>';

  var pool = D.fixes.filter(function (f) { return f.category === catId; });
  var apps = D.approaches.filter(function (a) { return pool.some(function (f) { return f.approach === a.id; }); });
  $('#harbourFilters').innerHTML =
    '<button class="filt" role="tab" data-filt="all" aria-selected="true">All ' + pool.length + '</button>' +
    apps.map(function (a) {
      return '<button class="filt" role="tab" data-filt="' + a.id + '" aria-selected="false">' + a.name + '</button>';
    }).join('');
  renderHarbour();
  openSheet('harbour');
}
function renderHarbour() {
  var pool = D.fixes.filter(function (f) {
    return f.category === harbourCat && (harbourFilter === 'all' || f.approach === harbourFilter);
  });
  var main = pool.filter(function (f) { return !f.advanced; });
  var adv = pool.filter(function (f) { return f.advanced; });
  var html = main.map(function (f) { return '<li>' + chipHTML(f) + '</li>'; }).join('');
  if (adv.length) {
    html += '<li><details class="disclose"><summary>Unreliable and unofficial &mdash; ' + adv.length + ' more</summary>' +
      '<div class="disclose__body"><p class="chart__p">These work sometimes. They are here because when they work they are genuinely useful, and because pretending they do not exist would be a poorer service.</p>' +
      adv.map(function (f) { return chipHTML(f); }).join('') + '</div></details></li>';
  }
  $('#charts').innerHTML = html || '<li class="empty">Nothing charted here yet.</li>';
  $('#charts').scrollTop = 0;
}
$('#harbourFilters').addEventListener('click', function (e) {
  var b = e.target.closest('.filt'); if (!b) return;
  harbourFilter = b.dataset.filt;
  $$('.filt', this).forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
  Audio2.play('tap'); renderHarbour();
});

/* ── chart (detail) ──────────────────────────────────────────── */
var currentFix = null;
function openChart(id) {
  var f = byId[id]; if (!f) return;
  currentFix = f;
  var cat = catById[f.category], ap = appById[f.approach], conf = confById[f.confidence];
  var h = [];

  h.push('<p class="chart__eyebrow"><span>' + esc(f.service) + '</span><span aria-hidden="true">&middot;</span><span>' + ap.name + '</span></p>');
  h.push('<h2 class="chart__title" id="chartTitle">' + esc(f.title) + '</h2>');
  h.push('<p class="chart__sum">' + esc(f.summary) + '</p>');
  h.push('<div class="chart__meta"><span class="tag tag--cat">' + cat.short + '</span>' + tagsFor(f) + '</div>');

  /* the primary action — outcome first, mechanism later */
  var a = f.action;
  h.push('<div class="act">');
  if (a.kind === 'query') {
    h.push('<p class="act__label">Do it now</p><div class="act__row">' +
      '<input class="act__input" id="qIn" type="search" placeholder="' + esc(a.placeholder || 'Type here') + '" autocomplete="off" enterkeyhint="go">' +
      '<button class="act__go" id="qGo">' + esc(a.label) + '</button></div>');
  } else if (a.kind === 'link') {
    h.push('<p class="act__label">Do it now</p><button class="act__go act__go--wide" id="qGo">' + esc(a.label) + '</button>');
  } else if (a.kind === 'copy') {
    h.push('<p class="act__label">Do it now</p><button class="act__go act__go--wide" id="qGo">' + esc(a.label) + '</button>' +
      '<code class="act__mono">' + esc(a.text) + '</code>' +
      (a.note ? '<p class="act__note">' + esc(a.note) + '</p>' : ''));
  } else {
    h.push('<p class="act__label">' + esc(a.label) + '</p><p class="act__note" style="margin-top:0">Follow the steps below. There is no link for this one &mdash; it lives inside an app.</p>');
  }
  h.push('</div>');

  h.push('<div class="chart__section"><h3 class="chart__h">What will change</h3><p class="chart__p">' + esc(f.changes) + '</p></div>');

  if (f.steps && f.steps.length) {
    h.push('<div class="chart__section"><h3 class="chart__h">' + (a.kind === 'steps' ? 'Where to find it' : 'By hand, if you prefer') + '</h3><ol class="chart__ol">' +
      f.steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol></div>');
  }
  if (f.how) {
    h.push('<details class="disclose"><summary>How this works</summary><div class="disclose__body"><p class="chart__p">' + esc(f.how) + '</p>' +
      (a.kind === 'query' ? '<p class="chart__h" style="margin-top:1em">The address ILUD opens</p><code class="act__mono">' + esc(a.url.replace('{q}', '…')) + '</code>' : '') +
      '</div></details>');
  }
  if (f.caveats && f.caveats.length) {
    h.push('<div class="chart__section"><h3 class="chart__h">Worth knowing</h3><ul class="chart__ul chart__ul--warn">' +
      f.caveats.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul></div>');
  }
  if (f.alternatives && f.alternatives.length) {
    h.push('<div class="chart__section"><h3 class="chart__h">Other courses</h3><ul class="altlist">' +
      f.alternatives.map(function (alt) {
        if (alt.ref && byId[alt.ref]) return '<li><button class="alt" data-fix="' + alt.ref + '">' + esc(alt.label) + ARROW + '</button></li>';
        return '<li><a class="alt" href="' + esc(alt.url) + '" target="_blank" rel="noopener noreferrer" data-alturl="' + esc(alt.url) + '">' + esc(alt.label) + EXT + '</a></li>';
      }).join('') + '</ul></div>');
  }
  h.push('<div class="chart__section"><h3 class="chart__h">Provenance</h3>' +
    '<p class="chart__p" style="font-size:.85rem">Checked ' + fmtDate(f.verified) + '. Confidence: <strong style="color:var(--ink)">' + conf.name.toLowerCase() + '</strong> &mdash; ' + esc(conf.blurb) + '</p>' +
    (f.sources && f.sources.length ? '<ul class="srcs">' + f.sources.map(function (s) {
      return '<li><a href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer">' + esc(s.title) + '</a><small>' + esc(s.url.replace(/^https?:\/\//, '').split('/')[0]) + '</small></li>';
    }).join('') + '</ul>' : '') + '</div>');

  var isSaved = saved.indexOf(f.id) > -1;
  h.push('<div class="chart__foot">' +
    '<button id="saveBtn" aria-pressed="' + isSaved + '">' + (isSaved ? 'In the logbook' : 'Add to logbook') + '</button>' +
    '<button id="shareBtn">Copy link</button></div>');

  $('#chartBody').innerHTML = h.join('');
  $('#chartBody').scrollTop = 0;
  wireChart(f);
  openSheet('chart');
}
function fmtDate(d) {
  var p = d.split('-'), m = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return parseInt(p[2], 10) + ' ' + m[parseInt(p[1], 10) - 1] + ' ' + p[0];
}
function wireChart(f) {
  var a = f.action;
  var go = $('#qGo'), input = $('#qIn');
  function fire() {
    Audio2.play('click');
    if (a.kind === 'query') {
      var q = (input.value || '').trim();
      if (!q) { input.focus(); toast('Type what you are looking for first.'); return; }
      remember(f.id);
      window.open(a.url.replace('{q}', encodeURIComponent(q)), '_blank', 'noopener');
    } else if (a.kind === 'link') {
      remember(f.id);
      window.open(a.url, '_blank', 'noopener');
    } else if (a.kind === 'copy') {
      copy(a.text).then(function (ok) { toast(ok ? 'Copied. Paste it into the address bar.' : 'Select the text below and copy it by hand.'); });
    }
  }
  if (go) go.addEventListener('click', fire);
  if (input) input.addEventListener('keydown', function (e) { if (e.key === 'Enter') fire(); });

  $$('[data-alturl]', $('#chartBody')).forEach(function (el2) {
    el2.addEventListener('click', function (e) {
      var u = el2.dataset.alturl;
      if (u.indexOf('{q}') > -1) {
        e.preventDefault();
        var q = input && input.value.trim();
        if (!q) { toast('Type a search above first, then try this.'); if (input) input.focus(); return; }
        window.open(u.replace('{q}', encodeURIComponent(q)), '_blank', 'noopener');
      }
    });
  });

  var sb = $('#saveBtn');
  sb.addEventListener('click', function () {
    var i = saved.indexOf(f.id);
    if (i > -1) { saved.splice(i, 1); Audio2.play('unmark'); toast('Removed from the logbook.'); }
    else { saved.unshift(f.id); Audio2.play('mark'); buzz(8); toast('Kept in the logbook.'); }
    store.set('saved', saved);
    sb.setAttribute('aria-pressed', String(saved.indexOf(f.id) > -1));
    sb.textContent = saved.indexOf(f.id) > -1 ? 'In the logbook' : 'Add to logbook';
    updateLogCount();
  });
  $('#shareBtn').addEventListener('click', function () {
    var url = location.href.split('#')[0] + '#' + f.id;
    copy(url).then(function (ok) { toast(ok ? 'Link copied.' : url); });
  });
}
function copy(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return fallbackCopy(text); });
  }
  return Promise.resolve(fallbackCopy(text));
}
function fallbackCopy(text) {
  try {
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    var ok = document.execCommand('copy'); document.body.removeChild(ta); return ok;
  } catch (e) { return false; }
}
function remember(id) {
  var r = store.get('recent', []).filter(function (x) { return x !== id; });
  r.unshift(id); store.set('recent', r.slice(0, 12));
}

/* ── search ──────────────────────────────────────────────────── */
function score(f, q) {
  var s = 0, t = q.toLowerCase();
  if (f.title.toLowerCase().indexOf(t) > -1) s += 12;
  if (f.service.toLowerCase().indexOf(t) > -1) s += 10;
  if (f.summary.toLowerCase().indexOf(t) > -1) s += 6;
  if ((f.changes || '').toLowerCase().indexOf(t) > -1) s += 3;
  if ((f.how || '').toLowerCase().indexOf(t) > -1) s += 2;
  if ((f.tags || []).join(' ').toLowerCase().indexOf(t) > -1) s += 3;
  if (catById[f.category].name.toLowerCase().indexOf(t) > -1) s += 4;
  return s + (f.popularity || 0) * 0.4;
}
function runSearch(q) {
  var out = $('#findResults');
  q = (q || '').trim();
  if (!q) {
    var feat = D.fixes.filter(function (f) { return f.featured; });
    var rec = store.get('recent', []).map(function (i) { return byId[i]; }).filter(Boolean);
    out.innerHTML =
      (rec.length ? '<li class="empty" style="padding:6px 6px 10px;text-align:left;font-size:.68rem;letter-spacing:.18em;text-transform:uppercase;font-style:normal;color:var(--gold-dim)">Lately used</li>' +
        rec.slice(0, 4).map(function (f) { return '<li>' + chipHTML(f, true) + '</li>'; }).join('') : '') +
      '<li class="empty" style="padding:14px 6px 10px;text-align:left;font-size:.68rem;letter-spacing:.18em;text-transform:uppercase;font-style:normal;color:var(--gold-dim)">Most useful</li>' +
      feat.map(function (f) { return '<li>' + chipHTML(f, true) + '</li>'; }).join('');
    return;
  }
  var terms = q.split(/\s+/);
  var hits = D.fixes.map(function (f) {
    var s = terms.reduce(function (acc, t) { return acc + score(f, t); }, 0);
    return { f: f, s: s };
  }).filter(function (x) { return x.s > 2; }).sort(function (a, b) { return b.s - a.s; }).slice(0, 26);
  out.innerHTML = hits.length
    ? hits.map(function (x) { return '<li>' + chipHTML(x.f, true) + '</li>'; }).join('')
    : '<li class="empty">Nothing charted under that name.<br>Try “summaries”, “feed”, “images”, “Copilot”.</li>';
}
$('#findInput').addEventListener('input', function () { runSearch(this.value); });
$('#findIntents').innerHTML = D.intents.map(function (i) {
  return '<button class="filt" data-intent="' + i.id + '">' + i.question + '</button>';
}).join('');
$('#findIntents').addEventListener('click', function (e) {
  var b = e.target.closest('[data-intent]'); if (!b) return;
  Audio2.play('tap');
  var intent = D.intents.filter(function (i) { return i.id === b.dataset.intent; })[0];
  $('#findInput').value = '';
  $('#findResults').innerHTML =
    '<li class="empty" style="padding:6px 6px 12px;text-align:left;font-style:normal;color:var(--ink-soft);font-family:var(--serif)">' + intent.blurb + '</li>' +
    intent.fixes.map(function (id) { return byId[id]; }).filter(Boolean)
      .sort(function (a, b2) { return (b2.popularity || 0) - (a.popularity || 0); })
      .map(function (f) { return '<li>' + chipHTML(f, true) + '</li>'; }).join('');
});

/* ── logbook ─────────────────────────────────────────────────── */
function renderLog() {
  var list = saved.map(function (i) { return byId[i]; }).filter(Boolean);
  $('#logList').innerHTML = list.length
    ? list.map(function (f) { return '<li>' + chipHTML(f, true) + '</li>'; }).join('')
    : '<li class="empty">The logbook is empty.<br>Open any entry and press “Add to logbook”.</li>';
}
function updateLogCount() {
  var b = $('#logCount');
  b.textContent = saved.length; b.hidden = saved.length === 0;
}

/* ── about ───────────────────────────────────────────────────── */
$('#aboutBody').innerHTML =
  '<p>' + esc(D.meta.description) + '</p>' +
  '<p>This is the <strong>Atlas</strong> — one of ten interpretations of the same catalogue. Here the collection is a sea: eight islands, one for each part of ordinary digital life, with a charted course to each. ' + D.meta.total + ' remedies in all, compiled ' + fmtDate(D.meta.compiled) + '.</p>' +
  '<h3>How to use it</h3>' +
  '<ul><li>Drag the sea to sail. Pinch, or scroll, to zoom.</li><li>Tap an island to land and see what is charted there.</li><li>Tap any entry for the full chart: what changes, how it works, what to watch for, and where the claim came from.</li><li>The logbook keeps the ones you want again.</li></ul>' +
  '<h3>Settings</h3>' +
  '<button class="toggle" id="tSound" aria-pressed="' + soundOn + '">Sound <em id="tSoundS">' + (soundOn ? 'on' : 'off') + '</em></button>' +
  '<button class="toggle" id="tMotion" aria-pressed="' + reduced + '">Reduced motion <em id="tMotionS">' + (reduced ? 'on' : 'off') + '</em></button>' +
  '<button class="toggle" id="tClear">Clear the logbook <em>' + saved.length + ' kept</em></button>' +
  '<h3>A word of caution</h3>' +
  '<p>' + esc(D.meta.disclaimer) + '</p>' +
  '<h3>Freshness</h3>' +
  '<p>' + esc(D.meta.maintenance) + '</p>' +
  '<p style="color:var(--ink-faint);font-size:.82rem;margin-top:2em">ILUD Atlas &middot; version ' + D.meta.version + ' &middot; no accounts, no tracking, no network requests except the links you choose to open. Everything you keep is stored in this browser alone.</p>';

$('#aboutBody').addEventListener('click', function (e) {
  var b = e.target.closest('button'); if (!b) return;
  if (b.id === 'tSound') {
    soundOn = !soundOn; store.set('sound', soundOn);
    b.setAttribute('aria-pressed', String(soundOn));
    $('#tSoundS').textContent = soundOn ? 'on' : 'off';
    $('#soundBtn').setAttribute('aria-pressed', String(soundOn));
    if (soundOn) { Audio2.unlock(); setTimeout(function () { Audio2.play('mark'); }, 60); }
  }
  if (b.id === 'tMotion') {
    reduced = !reduced; store.set('noMotion', reduced);
    document.body.classList.toggle('no-motion', reduced);
    b.setAttribute('aria-pressed', String(reduced));
    $('#tMotionS').textContent = reduced ? 'on' : 'off';
  }
  if (b.id === 'tClear') {
    saved = []; store.set('saved', saved); updateLogCount(); renderLog();
    b.querySelector('em').textContent = '0 kept'; toast('Logbook cleared.');
  }
});

/* ── toast ───────────────────────────────────────────────────── */
var toastT = null;
function toast(msg) {
  var t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('show'); }, 2600);
}

/* ── global delegation ───────────────────────────────────────── */
document.addEventListener('click', function (e) {
  var isle = e.target.closest('.isle');
  if (isle) { if (e.detail === 0) { Audio2.unlock(); sailTo(isle.dataset.cat); } return; }
  var fix = e.target.closest('[data-fix]');
  if (fix) { Audio2.play('tap'); openChart(fix.dataset.fix); }
});
$('#searchBtn').addEventListener('click', function () { runSearch(''); openSheet('find'); });
$('#logBtn').addEventListener('click', function () { renderLog(); openSheet('log'); });
$('#aboutBtn').addEventListener('click', function () { openSheet('about'); });
$('#homeBtn').addEventListener('click', function () { Audio2.play('water'); fit(false); });
$('#compass').addEventListener('click', function () {
  Audio2.play('water');
  var wide = view.s <= startS * 1.02;
  if (wide) goTo(CX, CY, startS * 1.75, false); else fit(false);
  toast(wide ? 'Closer in.' : 'The whole archipelago.');
});
$('#soundBtn').addEventListener('click', function () {
  soundOn = !soundOn; store.set('sound', soundOn);
  this.setAttribute('aria-pressed', String(soundOn));
  if (soundOn) { Audio2.unlock(); setTimeout(function () { Audio2.play('mark'); }, 60); }
  toast(soundOn ? 'Sound on.' : 'Sound off.');
});

/* ── boot ────────────────────────────────────────────────────── */
drawWorld();
drawLabels();
measureLabels();
updateLogCount();
$('#soundBtn').setAttribute('aria-pressed', String(soundOn));
if (!Audio2.available()) $('#soundBtn').hidden = true;

fit(true);
window.addEventListener('resize', function () {
  var vw = viewport.clientWidth, vh = viewport.clientHeight;
  fitS = Math.min(vw / W, vh / H);
  startS = fitS * (vw < 620 ? 1.12 : 1.85);
  minS = fitS * 0.92; maxS = fitS * 5.4;
  clampView(); apply();
});
window.addEventListener('orientationchange', function () { setTimeout(function () { fit(true); }, 260); });

$('#splashGo').addEventListener('click', function () {
  Audio2.unlock();
  document.body.classList.add('sailing');
  setTimeout(function () { Audio2.play('water'); }, 120);
  setTimeout(function () {
    var h = location.hash.slice(1);
    if (h && byId[h]) openChart(h);
    else if (h && catById[h]) openHarbour(h);
  }, 900);
  setTimeout(function () { $('#splash').remove(); }, 1200);
});
document.addEventListener('keydown', function (e) {
  if (!document.body.classList.contains('sailing') && (e.key === 'Enter' || e.key === ' ')) $('#splashGo').click();
  if (e.key === '/' && document.body.classList.contains('sailing') && !openSheets.length) {
    e.preventDefault(); runSearch(''); openSheet('find');
  }
});

})();
