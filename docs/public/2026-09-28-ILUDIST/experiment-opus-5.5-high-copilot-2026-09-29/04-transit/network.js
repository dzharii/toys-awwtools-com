/* ══════════════════════════════════════════════════════════════════
   ILUD TRANSIT — the network
   Eighty-seven stops laid out as a diagram: four lines (the four
   approaches), eight gold interchanges (the eight parts of ordinary
   digital life). Pan, zoom, choose a line, ride it.
   ══════════════════════════════════════════════════════════════════ */
window.NET = (function () {
'use strict';
var T = window.TRN; if (!T) return null;
var $ = T.$, $$ = T.$$, clamp = T.clamp, esc = T.esc, D = T.D;

var NS = 'http://www.w3.org/2000/svg';
function el(n, a) {
  var e = document.createElementNS(NS, n);
  if (a) for (var k in a) if (a.hasOwnProperty(k)) e.setAttribute(k, a[k]);
  return e;
}

/* ── geometry constants ────────────────────────────────────────── */
var STEP = 30,        /* between consecutive stops on one line      */
    GAP  = 90,        /* between one category band and the next     */
    TOP  = 206,       /* room above the first band for the termini  */
    BOT  = 120,
    WIG  = [0, 22, 0, -22];

/* ══ layout ══════════════════════════════════════════════════════ */
var bands = [];      /* one per category                            */
var lines = {};      /* lineId -> { stops:[], pts:[], path, len[] } */
var WORLD = { w: 1100, h: 2000, top: 0, bottom: 0 };

function build() {
  /* 1 — who stops where */
  D.categories.forEach(function (c, k) {
    var b = { cat: c, k: k, byLine: {}, max: 0, count: 0 };
    T.LINES.forEach(function (L) {
      var list = D.fixes.filter(function (f) {
        return f.category === c.id && f.approach === L.id;
      }).sort(function (a, b2) { return T.weight(b2) - T.weight(a); });
      b.byLine[L.id] = list;
      if (list.length > b.max) b.max = list.length;
      b.count += list.length;
    });
    bands.push(b);
  });

  /* 2 — vertical rhythm */
  var y = TOP;
  bands.forEach(function (b) {
    b.top = y;
    b.h = Math.max(0, b.max - 1) * STEP;
    b.mid = y + b.h / 2;
    y += b.h + GAP;
  });
  WORLD.h = y - GAP + BOT;
  WORLD.top = TOP;
  WORLD.bottom = y - GAP;

  /* 3 — each line's stops, with a small meander between bands */
  T.LINES.forEach(function (L, li) {
    var stops = [];
    bands.forEach(function (b, k) {
      var list = b.byLine[L.id];
      if (!list.length) return;
      var x = L.lane + WIG[(k + li * 2) % WIG.length];
      list.forEach(function (f, i) {
        stops.push({ fix: f, x: x, y: b.top + i * STEP, band: k, i: stops.length });
      });
    });
    stops.forEach(function (s, i) { s.i = i; });

    /* 4 — the rail itself */
    var pts = [];
    if (stops.length) {
      pts.push([stops[0].x, stops[0].y - (L.drop || 54)]);
      var lastX = stops[0].x;
      stops.forEach(function (s) {
        if (s.x !== lastX) {
          var ad = Math.abs(s.x - lastX);
          pts.push([lastX, s.y - ad - 20]);
          pts.push([s.x, s.y - 20]);
          lastX = s.x;
        }
        pts.push([s.x, s.y]);
      });
      var last = stops[stops.length - 1];
      pts.push([last.x, last.y + 48]);
    }
    lines[L.id] = { L: L, stops: stops, pts: pts };
  });
}

/* rounded metro corners */
function pathFrom(pts, r) {
  var p = [], i;
  for (i = 0; i < pts.length; i++) {
    if (!p.length || p[p.length - 1][0] !== pts[i][0] || p[p.length - 1][1] !== pts[i][1]) p.push(pts[i]);
  }
  if (p.length < 2) return '';
  var d = 'M' + p[0][0] + ' ' + p[0][1];
  for (i = 1; i < p.length - 1; i++) {
    var a = p[i - 1], b = p[i], c = p[i + 1];
    var v1x = b[0] - a[0], v1y = b[1] - a[1], l1 = Math.sqrt(v1x * v1x + v1y * v1y);
    var v2x = c[0] - b[0], v2y = c[1] - b[1], l2 = Math.sqrt(v2x * v2x + v2y * v2y);
    if (!l1 || !l2) continue;
    var rr = Math.min(r, l1 / 2, l2 / 2);
    d += ' L' + (b[0] - v1x / l1 * rr).toFixed(1) + ' ' + (b[1] - v1y / l1 * rr).toFixed(1) +
         ' Q' + b[0] + ' ' + b[1] + ' ' +
         (b[0] + v2x / l2 * rr).toFixed(1) + ' ' + (b[1] + v2y / l2 * rr).toFixed(1);
  }
  d += ' L' + p[p.length - 1][0] + ' ' + p[p.length - 1][1];
  return d;
}

/* ══ render ══════════════════════════════════════════════════════ */
var map, world, gTies, gSpine, gTracks, gJourney, gTrain;
var stationEls = {};   /* fixId -> <g> */

function shorten(s, n) { return s.length > n ? s.slice(0, n - 1).replace(/[ ,]+$/, '') + '…' : s; }

/* greedy word wrap, for the terminus roundels */
function wrap(s, n) {
  var words = s.split(' '), out = [], line = '';
  words.forEach(function (w) {
    if (!line) line = w;
    else if ((line + ' ' + w).length <= n) line += ' ' + w;
    else { out.push(line); line = w; }
  });
  if (line) out.push(line);
  return out;
}

function render() {
  map = $('#map');
  map.innerHTML = '';
  var defs = el('defs');
  defs.innerHTML =
    '<radialGradient id="glow"><stop offset="0" stop-color="#fff" stop-opacity=".55"/>' +
    '<stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>';
  map.appendChild(defs);

  world = el('g', { id: 'world' });
  map.appendChild(world);

  gTies    = el('g', { class: 'ties' });
  gSpine   = el('g', { class: 'spineg' });
  gTracks  = el('g', { class: 'tracks' });
  gJourney = el('g', { class: 'journey' });
  gTrain   = el('g', { class: 'train' });
  [gTies, gSpine, gTracks, gJourney, gTrain].forEach(function (g) { world.appendChild(g); });

  /* the gold spine */
  gSpine.appendChild(el('path', {
    class: 'spine',
    d: 'M0 ' + (TOP - 84) + ' V' + (WORLD.bottom + 54)
  }));

  bands.forEach(function (b) {
    /* dashed ties out to each line that calls at this band */
    T.LINES.forEach(function (L) {
      if (!b.byLine[L.id].length) return;
      var x = L.lane;
      var from = x < 0 ? -22 : 22, to = x < 0 ? x + 12 : x - 12;
      gTies.appendChild(el('path', { class: 'tie', d: 'M' + from + ' ' + b.mid + ' H' + to }));
    });

    var g = el('g', { class: 'xchg', 'data-cat': b.cat.id, tabindex: '0', role: 'button' });
    g.setAttribute('aria-label', b.cat.name + ' interchange, ' + b.count + ' stops');
    g.appendChild(el('circle', { class: 'hit', cx: 0, cy: b.mid, r: 34 }));
    g.appendChild(el('circle', { class: 'xch', cx: 0, cy: b.mid, r: 21 }));
    var gl = el('path', { class: 'xch__g', d: T.CATG[b.cat.id] });
    gl.setAttribute('transform', 'translate(' + (-12 * 1.06) + ' ' + (b.mid - 12 * 1.06) + ') scale(1.06)');
    g.appendChild(gl);
    var lab = el('text', { class: 'xch__lab', x: 0, y: b.mid - 32 });
    lab.textContent = b.cat.short;
    g.appendChild(lab);
    var n = el('text', { class: 'xch__n', x: 0, y: b.mid + 40 });
    n.textContent = b.count + (b.count === 1 ? ' stop' : ' stops');
    g.appendChild(n);
    gSpine.appendChild(g);
  });

  /* the four lines */
  T.LINES.forEach(function (L) {
    var ln = lines[L.id];
    if (!ln.stops.length) return;
    var g = el('g', { class: 'ln', 'data-line': L.id });
    g.style.color = L.colour;
    var d = pathFrom(ln.pts, 13);
    g.appendChild(el('path', { class: 'trk trk--halo', d: d, 'stroke-width': 14 }));
    var trk = el('path', { class: 'trk', d: d, stroke: L.colour, 'stroke-width': 8.5 });
    g.appendChild(trk);
    ln.path = trk;

    /* terminus roundel */
    var t0 = ln.pts[0];
    var tg = el('g', { class: 'term', 'data-line': L.id, tabindex: '0', role: 'button' });
    tg.setAttribute('aria-label', L.name + ' line, ' + ln.stops.length + ' stops');
    tg.appendChild(el('circle', { class: 'term__r', cx: t0[0], cy: t0[1], r: 20, stroke: L.colour }));
    var tgl = el('g', { class: 'term__g' });
    tgl.innerHTML = T.TERMG[L.id];
    tgl.setAttribute('stroke', L.colour);
    tgl.setAttribute('transform', 'translate(' + (t0[0] - 12) + ' ' + (t0[1] - 12) + ')');
    tg.appendChild(tgl);
    var rows = wrap(L.name.toUpperCase(), 11);
    rows.forEach(function (r, i) {
      var tx = el('text', { class: 'term__lab', x: t0[0], y: t0[1] - 34 - (rows.length - 1 - i) * 16, fill: L.colour });
      tx.textContent = r;
      tg.appendChild(tx);
    });
    g.appendChild(tg);

    /* the end of the line */
    var tn = ln.pts[ln.pts.length - 1];
    g.appendChild(el('circle', { class: 'cap', cx: tn[0], cy: tn[1], r: 5.5, stroke: L.colour }));

    /* the stops */
    ln.stops.forEach(function (s) {
      var sg = el('g', { class: 'st', 'data-id': s.fix.id, 'data-line': L.id, tabindex: '-1', role: 'button' });
      sg.setAttribute('aria-label', s.fix.title + ' — ' + s.fix.service);
      sg.appendChild(el('circle', { class: 'st__hit', cx: s.x, cy: s.y, r: 26 }));
      sg.appendChild(el('circle', { class: 'st__o', cx: s.x, cy: s.y, r: 7, stroke: L.colour }));
      sg.appendChild(el('circle', { class: 'st__i', cx: s.x, cy: s.y, r: 3.4 }));
      var left = s.x < 0;
      var lab = el('text', {
        class: 'st__lab', x: s.x + (left ? -17 : 17), y: s.y,
        'text-anchor': left ? 'end' : 'start', 'dominant-baseline': 'middle'
      });
      lab.textContent = shorten(s.fix.service, 17);
      sg.appendChild(lab);
      g.appendChild(sg);
      stationEls[s.fix.id] = sg;
      s.g = sg;
    });

    gTracks.appendChild(g);
    ln.g = g;
  });

  /* the token that rides the line */
  gTrain.appendChild(el('circle', { class: 'train__h', cx: 0, cy: 0, r: 26 }));
  gTrain.appendChild(el('circle', { class: 'train__c', cx: 0, cy: 0, r: 9 }));

  /* arc-length lookup for each stop, so the token can travel */
  T.LINES.forEach(function (L) {
    var ln = lines[L.id];
    if (!ln.path) return;
    var total = 0;
    try { total = ln.path.getTotalLength(); } catch (e) { total = 0; }
    ln.total = total;
    ln.stops.forEach(function (s) { s.len = total ? lenForY(ln.path, s.y, total) : 0; });
  });
}

function lenForY(path, y, total) {
  var lo = 0, hi = total, mid, p;
  for (var i = 0; i < 26; i++) {
    mid = (lo + hi) / 2;
    p = path.getPointAtLength(mid);
    if (p.y < y) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

/* ══ the view ════════════════════════════════════════════════════ */
var V = { k: 0.62, tx: 0, ty: 0 };
var vw = 0, vh = 0;

function measure() {
  var r = map.getBoundingClientRect();
  vw = r.width; vh = r.height;
}
function apply() {
  world.setAttribute('transform', 'translate(' + V.tx.toFixed(2) + ' ' + V.ty.toFixed(2) + ') scale(' + V.k.toFixed(4) + ')');
}
function clampView() {
  var xmin = -560 * V.k, xmax = 560 * V.k;
  var ymin = 40 * V.k, ymax = WORLD.h * V.k;
  var padX = Math.min(vw * 0.42, 220), padY = Math.min(vh * 0.42, 260);
  var loX = vw - xmax - padX, hiX = -xmin + padX;
  V.tx = loX > hiX ? (loX + hiX) / 2 : clamp(V.tx, loX, hiX);
  var loY = vh - ymax - padY, hiY = -ymin + padY;
  V.ty = loY > hiY ? (loY + hiY) / 2 : clamp(V.ty, loY, hiY);
}
function setView(k, tx, ty) {
  V.k = clamp(k, 0.26, 2.4); V.tx = tx; V.ty = ty;
  clampView(); apply();
}
function centreOn(wx, wy, k, yFrac) {
  k = k || V.k;
  setView(k, vw / 2 - wx * k, vh * (yFrac || 0.42) - wy * k);
}

/* an eased journey of the viewport itself */
var glideRAF = 0;
function glideTo(wx, wy, k, yFrac, ms) {
  cancelAnimationFrame(glideRAF);
  k = clamp(k || V.k, 0.26, 2.4);
  var from = { k: V.k, tx: V.tx, ty: V.ty };
  var save = { k: V.k, tx: V.tx, ty: V.ty };
  setView(k, vw / 2 - wx * k, vh * (yFrac || 0.42) - wy * k);
  var to = { k: V.k, tx: V.tx, ty: V.ty };
  V.k = save.k; V.tx = save.tx; V.ty = save.ty; apply();
  if (T.reduced()) { V.k = to.k; V.tx = to.tx; V.ty = to.ty; apply(); return; }
  var dur = ms || 620, t0 = performance.now();
  (function step(now) {
    var p = clamp((now - t0) / dur, 0, 1);
    var e = 1 - Math.pow(1 - p, 3);
    V.k = from.k + (to.k - from.k) * e;
    V.tx = from.tx + (to.tx - from.tx) * e;
    V.ty = from.ty + (to.ty - from.ty) * e;
    apply();
    if (p < 1) glideRAF = requestAnimationFrame(step);
  })(t0);
}

function fitAll(animate) {
  measure();
  var k = clamp(Math.min(vw / 760, vh / 900), 0.32, 1);
  if (animate) glideTo(0, (TOP - 40) + (vh * 0.34) / k, k, 0.34, 700);
  else { V.k = k; V.tx = vw / 2; V.ty = 118; clampView(); apply(); }
}

/* ══ pan, pinch, wheel, double tap ═══════════════════════════════ */
var ptrs = {}, panning = false, moved = false;
var start = null, pinch = null, lastTap = 0;

function stagePoint(e) {
  var r = map.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}
function toWorld(px, py) { return { x: (px - V.tx) / V.k, y: (py - V.ty) / V.k }; }

function wire() {
  map.addEventListener('pointerdown', function (e) {
    T.Snd.unlock();
    ptrs[e.pointerId] = stagePoint(e);
    var ids = Object.keys(ptrs);
    if (ids.length === 1) {
      panning = true; moved = false;
      start = { p: ptrs[e.pointerId], tx: V.tx, ty: V.ty, t: Date.now(), target: e.target };
      map.classList.add('dragging');
    } else if (ids.length === 2) {
      var a = ptrs[ids[0]], b = ptrs[ids[1]];
      pinch = {
        d: Math.hypot(a.x - b.x, a.y - b.y),
        cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2,
        k: V.k, tx: V.tx, ty: V.ty
      };
      pinch.w = toWorld(pinch.cx, pinch.cy);
      panning = false;
    }
  });

  map.addEventListener('pointermove', function (e) {
    if (!ptrs[e.pointerId]) return;
    ptrs[e.pointerId] = stagePoint(e);
    var ids = Object.keys(ptrs);
    if (ids.length >= 2 && pinch) {
      var a = ptrs[ids[0]], b = ptrs[ids[1]];
      var d = Math.hypot(a.x - b.x, a.y - b.y);
      var cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
      var k = clamp(pinch.k * (d / (pinch.d || 1)), 0.26, 2.4);
      V.k = k; V.tx = cx - pinch.w.x * k; V.ty = cy - pinch.w.y * k;
      clampView(); apply();
      moved = true;
      return;
    }
    if (!panning || !start) return;
    var p = ptrs[e.pointerId];
    var dx = p.x - start.p.x, dy = p.y - start.p.y;
    if (!moved && Math.hypot(dx, dy) > 7) { moved = true; hideHint(); }
    if (moved) { V.tx = start.tx + dx; V.ty = start.ty + dy; clampView(); apply(); }
  });

  function up(e) {
    delete ptrs[e.pointerId];
    var ids = Object.keys(ptrs);
    if (ids.length < 2) pinch = null;
    if (!ids.length) {
      map.classList.remove('dragging');
      if (panning && !moved && start) resolveTap(e, start.target);
      panning = false; start = null;
    }
  }
  map.addEventListener('pointerup', up);
  map.addEventListener('pointercancel', up);

  map.addEventListener('wheel', function (e) {
    e.preventDefault();
    var p = stagePoint(e), w = toWorld(p.x, p.y);
    var k = clamp(V.k * (e.deltaY < 0 ? 1.13 : 1 / 1.13), 0.26, 2.4);
    V.k = k; V.tx = p.x - w.x * k; V.ty = p.y - w.y * k;
    clampView(); apply();
  }, { passive: false });

  function zoomBy(mult) {
    var w = toWorld(vw / 2, vh / 2);
    var k = clamp(V.k * mult, 0.26, 2.4);
    V.k = k; V.tx = vw / 2 - w.x * k; V.ty = vh / 2 - w.y * k;
    clampView(); apply(); T.Snd.play('click');
  }
  $('#zIn').addEventListener('click', function () { zoomBy(1.4); });
  $('#zOut').addEventListener('click', function () { zoomBy(1 / 1.4); });
  $('#zFit').addEventListener('click', function () {
    T.Snd.play('glide'); clearFocus(); fitAll(true);
  });

  window.addEventListener('resize', function () {
    measure(); clampView(); apply();
  });
}

/* a tap that was not a drag */
function resolveTap(e, target) {
  var st = target && target.closest ? target.closest('.st') : null;
  if (st) { select(st.getAttribute('data-id'), true); return; }
  var tm = target && target.closest ? target.closest('.term') : null;
  if (tm) { focusLine(tm.getAttribute('data-line'), true); return; }
  var xc = target && target.closest ? target.closest('.xchg') : null;
  if (xc) { openInterchange(xc.getAttribute('data-cat')); return; }
  /* tapped empty track */
  var now = Date.now();
  if (now - lastTap < 300) {
    var p = stagePoint(e), w = toWorld(p.x, p.y);
    var k = clamp(V.k * 1.5, 0.26, 2.4);
    V.k = k; V.tx = p.x - w.x * k; V.ty = p.y - w.y * k; clampView(); apply();
    T.Snd.play('click');
  } else if (cur) { deselect(); }
  lastTap = now;
}

function hideHint() { var h = $('#hint'); if (h) h.classList.add('hint--off'); }

/* ══ choosing a line ═════════════════════════════════════════════ */
var focusId = null, cur = null, curIdx = -1;

function focusLine(id, fly) {
  if (!lines[id]) return;
  var changed = focusId !== id;
  focusId = id;
  map.setAttribute('data-focus', id);
  document.body.setAttribute('data-focus', '1');
  T.LINES.forEach(function (L) {
    var g = lines[L.id].g;
    if (!g) return;
    g.classList.toggle('ln--on', L.id === id);
    lines[L.id].stops.forEach(function (s) {
      s.g.setAttribute('tabindex', L.id === id ? '0' : '-1');
    });
  });
  paintChips();
  gTrain.style.color = T.lineById[id].colour;
  document.documentElement.style.setProperty('--line', T.lineById[id].colour);
  showRide(true);
  hideHint();
  if (changed) T.Snd.play('chime');
  if (fly !== false && changed) {
    var s = lines[id].stops[0];
    curIdx = -1;
    glideTo(s.x, s.y, Math.max(V.k, 0.86), 0.36, 680);
  }
}

function clearFocus() {
  focusId = null; cur = null; curIdx = -1;
  map.removeAttribute('data-focus');
  document.body.removeAttribute('data-focus');
  T.LINES.forEach(function (L) {
    var ln = lines[L.id];
    if (ln.g) ln.g.classList.remove('ln--on');
    ln.stops.forEach(function (s) {
      s.g.classList.remove('st--sel');
      s.g.setAttribute('tabindex', '-1');
    });
  });
  gTrain.classList.remove('train--on');
  stopRide();
  showRide(false);
  hideCard();
  paintChips();
}

function deselect() {
  if (!cur) return;
  var s = stopOf(cur);
  if (s) s.g.classList.remove('st--sel');
  cur = null; curIdx = -1;
  hideCard();
  gTrain.classList.remove('train--on');
  T.Snd.play('click');
}

function stopOf(id) {
  for (var k in lines) {
    if (!lines.hasOwnProperty(k)) continue;
    for (var i = 0; i < lines[k].stops.length; i++) if (lines[k].stops[i].fix.id === id) return lines[k].stops[i];
  }
  return null;
}

function select(id, fly, quiet) {
  var s = stopOf(id);
  if (!s) return;
  var lineId = s.fix.approach;
  if (focusId !== lineId) focusLine(lineId, false);
  T.LINES.forEach(function (L) {
    lines[L.id].stops.forEach(function (o) { o.g.classList.remove('st--sel'); });
  });
  s.g.classList.add('st--sel');
  cur = id; curIdx = s.i;
  moveToken(lineId, s.len);
  gTrain.classList.add('train--on');
  if (fly !== false) glideTo(s.x, s.y, Math.max(V.k, 0.92), 0.34, 560);
  showCard(s);
  paintRideN();
  if (!quiet) { T.Snd.play('click'); T.buzz(8); }
  T.remember(id);
}

/* ══ the token ═══════════════════════════════════════════════════ */
function moveToken(lineId, len) {
  var ln = lines[lineId];
  if (!ln.path || !ln.total) return;
  var p = ln.path.getPointAtLength(clamp(len, 0, ln.total));
  gTrain.setAttribute('transform', 'translate(' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ')');
}

var rideRAF = 0, rideTimer = 0, playing = false;

function travel(toIdx, then) {
  var ln = lines[focusId];
  if (!ln) return;
  var from = curIdx >= 0 ? ln.stops[curIdx] : ln.stops[0];
  var to = ln.stops[toIdx];
  if (!to) return;
  cancelAnimationFrame(rideRAF);
  hideCard();
  var l0 = curIdx >= 0 ? from.len : to.len - 1, l1 = to.len;
  var dist = Math.abs(l1 - l0);
  var ms = T.reduced() ? 1 : clamp(dist * 2.0, 380, 1250);
  var t0 = performance.now(), lastJoint = 0;
  gTrain.classList.add('train--on');
  (function step(now) {
    var p = clamp((now - t0) / ms, 0, 1);
    var e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    var l = l0 + (l1 - l0) * e;
    moveToken(focusId, l);
    var pt = ln.path.getPointAtLength(clamp(l, 0, ln.total));
    centreOn(pt.x, pt.y, V.k, 0.34);
    if (now - lastJoint > 260 && p < 0.92) { lastJoint = now; T.Snd.play('joint'); }
    if (p < 1) rideRAF = requestAnimationFrame(step);
    else { select(to.fix.id, false, true); T.Snd.play('click'); if (then) then(); }
  })(t0);
}

function step(dir) {
  if (!focusId) { focusLine(T.LINES[0].id, true); return; }
  var ln = lines[focusId];
  var next = clamp((curIdx < 0 ? -1 : curIdx) + dir, 0, ln.stops.length - 1);
  if (next === curIdx) { T.Snd.play('err'); return; }
  travel(next, function () {
    if (playing) {
      clearTimeout(rideTimer);
      rideTimer = setTimeout(function () {
        if (!playing) return;
        if (curIdx >= ln.stops.length - 1) { stopRide(); T.Snd.play('bong'); T.toast('End of the line. ' + ln.stops.length + ' stops visited.'); return; }
        step(1);
      }, 2600);
    }
  });
}

function startRide() {
  if (!focusId) focusLine(T.LINES[0].id, true);
  playing = true;
  $('#ride').setAttribute('data-play', '1');
  T.Snd.play('bong');
  step(1);
}
function stopRide() {
  playing = false;
  clearTimeout(rideTimer);
  cancelAnimationFrame(rideRAF);
  var r = $('#ride'); if (r) r.removeAttribute('data-play');
}
function showRide(on) {
  var r = $('#ride');
  if (!r) return;
  r.hidden = !on;
  document.body.setAttribute('data-ride', on ? '1' : '0');
  if (on) paintRideN();
}
function paintRideN() {
  var n = $('#rideN');
  if (!n || !focusId) return;
  var ln = lines[focusId];
  n.textContent = (curIdx < 0 ? '—' : curIdx + 1) + ' / ' + ln.stops.length;
}

/* ══ the station card ════════════════════════════════════════════ */
function hideCard() {
  var c = $('#card');
  if (!c || c.hidden) return;
  c.classList.add('card--out');
  setTimeout(function () { c.hidden = true; c.classList.remove('card--out'); c.innerHTML = ''; }, 200);
}

function showCard(s) {
  var f = s.fix, c = $('#card');
  var L = T.lineById[f.approach], cat = T.catById[f.category];
  var a = f.action;
  c.hidden = false;
  c.classList.remove('card--out');
  c.style.color = L.colour;
  var kept = T.isKept(f.id);
  var tag = a.kind === 'query' ? 'One tap' :
            f.effort === 'instant' ? 'Instant' : f.effort === 'minute' ? 'A minute' : 'Set up once';
  var html =
    '<div class="card__top">' +
      '<span class="card__bul"></span>' +
      '<span class="card__line">' + esc(L.name) + '</span>' +
      '<span class="card__st">STOP ' + (s.i + 1) + ' / ' + lines[L.id].stops.length + '</span>' +
      '<button class="card__more" type="button" aria-label="Open the full record">' +
        '<svg viewBox="0 0 24 24"><circle cx="6" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="18" cy="12" r="1.7"/></svg>' +
      '</button>' +
    '</div>' +
    '<h2 class="card__h">' + esc(f.title) + '</h2>' +
    '<p class="card__svc">' + esc(f.service) + ' &middot; ' + esc(cat.name) + '</p>' +
    '<p class="card__p">' + esc(f.summary) + '</p>';

  if (a.kind === 'query') {
    html += '<div class="card__q" hidden>' +
      '<input type="search" inputmode="search" autocomplete="off" placeholder="' + esc(a.placeholder || 'What are you looking for?') + '" aria-label="What are you looking for?">' +
      '<button type="button">Go</button></div>';
  }
  html += '<button class="card__act" type="button">' +
    '<span>' + (a.kind === 'steps' ? 'Show me how' : 'Use this fix') + '</span>' + T.ICON.arrow + '</button>';
  html += '<div class="card__row">' +
      '<span class="card__tag">' + esc(tag) + '</span>' +
      '<span class="card__tag">' + esc(T.confById[f.confidence].name) + '</span>' +
      '<button class="card__keep" type="button" data-on="' + (kept ? '1' : '0') + '">' +
        '<svg viewBox="0 0 24 24"><path d="M6.4 3.6h11.2v17l-5.6-4-5.6 4Z"/></svg>' +
        '<span>' + (kept ? 'On card' : 'Keep') + '</span></button>' +
    '</div>';
  c.innerHTML = html;

  c.querySelector('.card__more').addEventListener('click', function () {
    window.PANELS.record(f);
  });
  var keep = c.querySelector('.card__keep');
  keep.addEventListener('click', function () {
    var on = T.toggleKeep(f.id);
    keep.setAttribute('data-on', on ? '1' : '0');
    keep.querySelector('span').textContent = on ? 'On card' : 'Keep';
  });
  var act = c.querySelector('.card__act');
  var qr = c.querySelector('.card__q');
  act.addEventListener('click', function () {
    if (a.kind === 'steps') { window.PANELS.record(f, true); return; }
    if (a.kind === 'query') {
      if (qr.hidden) {
        qr.hidden = false;
        act.querySelector('span').textContent = a.label || 'Open it';
        T.Snd.play('click');
        setTimeout(function () { qr.querySelector('input').focus(); }, 60);
        return;
      }
      T.launch(f, qr.querySelector('input').value);
      return;
    }
    T.launch(f);
  });
  if (qr) {
    qr.querySelector('button').addEventListener('click', function () {
      T.launch(f, qr.querySelector('input').value);
    });
    qr.querySelector('input').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); T.launch(f, this.value); }
    });
  }
  hideHint();
}

/* ══ interchange ═════════════════════════════════════════════════ */
function openInterchange(catId) {
  T.Snd.play('click');
  window.PANELS.interchange(catId);
}

/* ══ the line chips ══════════════════════════════════════════════ */
function buildChips() {
  var box = $('#lines');
  box.innerHTML = '';
  T.LINES.forEach(function (L) {
    var b = document.createElement('button');
    b.className = 'lchip';
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('data-line', L.id);
    b.style.color = L.colour;
    b.innerHTML = '<i></i>' + esc(L.chip || L.name) + ' <span class="lchip__n">' + lines[L.id].stops.length + '</span>';
    b.addEventListener('click', function () {
      if (focusId === L.id) { clearFocus(); T.Snd.play('shut'); fitAll(true); return; }
      focusLine(L.id, true);
    });
    box.appendChild(b);
  });
  paintChips();
}
function paintChips() {
  $$('.lchip').forEach(function (b) {
    var id = b.getAttribute('data-line');
    var on = id === focusId;
    b.setAttribute('data-on', on ? '1' : '0');
    b.setAttribute('aria-selected', on ? 'true' : 'false');
    b.style.background = on ? T.lineById[id].colour : '';
    b.style.color = on ? '#140f07' : T.lineById[id].colour;
  });
}

/* ══ keyboard ════════════════════════════════════════════════════ */
function keys() {
  document.addEventListener('keydown', function (e) {
    if (T.panelDepth()) return;
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;
    if (e.key === 'ArrowDown') { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); step(-1); }
    else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      var i = focusId ? T.LINES.map(function (l) { return l.id; }).indexOf(focusId) : -1;
      var n = clamp(i + (e.key === 'ArrowRight' ? 1 : -1), 0, T.LINES.length - 1);
      if (i < 0) n = 0;
      focusLine(T.LINES[n].id, true);
    }
    else if (e.key === '/' ) { e.preventDefault(); window.PANELS.find(); }
    else if (e.key === 'Escape') { if (cur) deselect(); else if (focusId) { clearFocus(); fitAll(true); } }
  });
  /* enter / space on a focused station or terminus */
  map.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var st = e.target.closest ? e.target.closest('.st') : null;
    if (st) { e.preventDefault(); select(st.getAttribute('data-id'), true); return; }
    var tm = e.target.closest ? e.target.closest('.term') : null;
    if (tm) { e.preventDefault(); focusLine(tm.getAttribute('data-line'), true); return; }
    var xc = e.target.closest ? e.target.closest('.xchg') : null;
    if (xc) { e.preventDefault(); openInterchange(xc.getAttribute('data-cat')); }
  });
}

/* ══ ride controls ═══════════════════════════════════════════════ */
function rideWire() {
  $('#ridePrev').addEventListener('click', function () { stopRide(); step(-1); });
  $('#rideNext').addEventListener('click', function () { stopRide(); step(1); });
  $('#ridePlay').addEventListener('click', function () {
    if (playing) { stopRide(); T.Snd.play('shut'); } else startRide();
  });
  $('#rideX').addEventListener('click', function () {
    T.Snd.play('shut'); clearFocus(); fitAll(true);
  });
}

/* ══ the journey overlay ═════════════════════════════════════════ */
var journey = null;
function drawJourney(fixes) {
  gJourney.innerHTML = '';
  journey = null;
  if (!fixes || fixes.length < 2) return;
  var pts = fixes.map(function (f) { return stopOf(f.id); }).filter(Boolean);
  if (pts.length < 2) return;
  var d = 'M' + pts[0].x + ' ' + pts[0].y;
  for (var i = 1; i < pts.length; i++) d += ' L' + pts[i].x + ' ' + pts[i].y;
  gJourney.appendChild(el('path', { class: 'jrny', d: d }));
  pts.forEach(function (p) {
    gJourney.appendChild(el('circle', { cx: p.x, cy: p.y, r: 13, fill: 'none', stroke: '#f3e0b4', 'stroke-width': 2, opacity: '.8' }));
  });
  journey = pts;
  /* frame the whole journey */
  var xs = pts.map(function (p) { return p.x; }), ys = pts.map(function (p) { return p.y; });
  var cx = (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2;
  var cy = (Math.min.apply(null, ys) + Math.max.apply(null, ys)) / 2;
  var spanY = Math.max(240, Math.max.apply(null, ys) - Math.min.apply(null, ys) + 260);
  measure();
  glideTo(cx, cy, clamp((vh - 220) / spanY, 0.3, 1.1), 0.42, 760);
}
function clearJourney() { gJourney.innerHTML = ''; journey = null; }

function hideHintSoon() { setTimeout(hideHint, 6500); }

return {
  el: el, build: build, render: render, wire: wire, fitAll: fitAll,
  glideTo: glideTo, centreOn: centreOn, measure: measure, hideHint: hideHint,
  focusLine: focusLine, clearFocus: clearFocus, select: select, deselect: deselect,
  buildChips: buildChips, keys: keys, rideWire: rideWire, hideHintSoon: hideHintSoon,
  drawJourney: drawJourney, clearJourney: clearJourney,
  stopOf: stopOf, stopRide: stopRide,
  get lines() { return lines; }, get bands() { return bands; },
  get focusId() { return focusId; },
  get V() { return V; }, get map() { return map; },
  stationEls: stationEls
};
})();
