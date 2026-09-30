/* ══════════════════════════════════════════════════════════════════
   ILUD INSTRUMENT — the dial
   Two concentric detented controls: the ring chooses a part of your
   day, the hub chooses a remedy within it. Both turn beneath the
   finger with momentum, resistance and a mechanical stop.
   ══════════════════════════════════════════════════════════════════ */
(function () {
'use strict';
var I = window.INS; if (!I) return;
var $ = I.$, $$ = I.$$, D = I.D, esc = I.esc;

/* ── geometry, in the 440-unit dial space ──────────────────────── */
var C = 220;
var R_RIM = 208, R_KNURL_O = 202, R_KNURL_I = 184;
var R_GRAD_O = 180, R_GRAD_I = 170;
var R_SEC_O = 166, R_SEC_I = 84;
var R_LABEL = 130;
var R_HUB_O = 80, R_HUB_I = 72;
var WEDGE = 22;                       /* half-angle of the lit sector */

var CATS = D.categories.slice(0, 8);
var N = CATS.length;
var STEP = 360 / N;

var dial = $('#dial'), box = $('#dialbox');
var ringA = 0, hubA = 0;              /* current angles, degrees */
var sel = 0, idx = 0;                 /* selected category / remedy */
var touched = false;                  /* has the user turned anything yet */
var list = I.byCat[CATS[0].id];

/* ── build the plate ───────────────────────────────────────────── */
function polar(r, deg) {
  var a = (deg - 90) * Math.PI / 180;
  return [C + r * Math.cos(a), C + r * Math.sin(a)];
}
function ring(rO, rI, a0, a1) {
  var p0 = polar(rO, a0), p1 = polar(rO, a1), p2 = polar(rI, a1), p3 = polar(rI, a0);
  var big = (a1 - a0) > 180 ? 1 : 0;
  return 'M' + p0[0].toFixed(2) + ' ' + p0[1].toFixed(2) +
         'A' + rO + ' ' + rO + ' 0 ' + big + ' 1 ' + p1[0].toFixed(2) + ' ' + p1[1].toFixed(2) +
         'L' + p2[0].toFixed(2) + ' ' + p2[1].toFixed(2) +
         'A' + rI + ' ' + rI + ' 0 ' + big + ' 0 ' + p3[0].toFixed(2) + ' ' + p3[1].toFixed(2) + 'Z';
}

var defs = [
  '<defs>',
  '<linearGradient id="brass" x1="0" y1="0" x2="0" y2="1">',
  '<stop offset="0" stop-color="#fdf3d8"/><stop offset=".18" stop-color="#e9cf9b"/>',
  '<stop offset=".48" stop-color="#c49c58"/><stop offset=".74" stop-color="#8d6a33"/>',
  '<stop offset="1" stop-color="#e4caA0"/></linearGradient>',
  '<linearGradient id="brassLo" x1="0" y1="0" x2="1" y2="1">',
  '<stop offset="0" stop-color="#8c6c3c"/><stop offset=".5" stop-color="#5c421d"/>',
  '<stop offset="1" stop-color="#9c7b45"/></linearGradient>',
  '<radialGradient id="plate" cx="50%" cy="34%" r="72%">',
  '<stop offset="0" stop-color="#262019"/><stop offset=".55" stop-color="#171412"/>',
  '<stop offset="1" stop-color="#0c0a09"/></radialGradient>',
  '<radialGradient id="hubface" cx="42%" cy="30%" r="80%">',
  '<stop offset="0" stop-color="#2c2620"/><stop offset=".6" stop-color="#171412"/>',
  '<stop offset="1" stop-color="#0a0908"/></radialGradient>',
  '<linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">',
  '<stop offset="0" stop-color="#ffffff" stop-opacity=".1"/>',
  '<stop offset=".45" stop-color="#ffffff" stop-opacity="0"/>',
  '<stop offset="1" stop-color="#ffffff" stop-opacity=".035"/></linearGradient>',
  '<filter id="glow" x="-40%" y="-40%" width="180%" height="180%">',
  '<feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>',
  '</defs>'
].join('');

function knurl(rO, rI, n, w) {
  var out = [];
  for (var i = 0; i < n; i++) {
    var a = i * 360 / n;
    var p0 = polar(rI, a), p1 = polar(rO, a);
    out.push('<path d="M' + p0[0].toFixed(1) + ' ' + p0[1].toFixed(1) + 'L' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1) +
      '" stroke="#e6cc98" stroke-width="' + w + '" opacity="' + (0.1 + 0.26 * Math.abs(Math.cos(a * Math.PI / 180))).toFixed(3) + '"/>');
  }
  return out.join('');
}
function grads() {
  var out = [];
  for (var i = 0; i < 120; i++) {
    var a = i * 3, major = (i % 15) === 0;
    var len = major ? 11 : 5;
    var p0 = polar(R_GRAD_O, a), p1 = polar(R_GRAD_O - len, a);
    out.push('<path d="M' + p0[0].toFixed(1) + ' ' + p0[1].toFixed(1) + 'L' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1) +
      '" stroke="#d9bd88" stroke-width="' + (major ? 1.7 : 0.9) + '" opacity="' + (major ? 0.62 : 0.26) + '"/>');
  }
  return out.join('');
}

var html = [defs];
/* body of the instrument */
html.push('<circle cx="220" cy="220" r="' + R_RIM + '" fill="#080707"/>');
html.push('<circle cx="220" cy="220" r="' + (R_RIM - 1) + '" fill="none" stroke="url(#brassLo)" stroke-width="2.4" opacity=".85"/>');
html.push('<circle cx="220" cy="220" r="' + R_SEC_O + '" fill="url(#plate)"/>');
html.push('<circle cx="220" cy="220" r="' + R_SEC_O + '" fill="url(#sheen)"/>');

/* the lit sector — fixed at twelve o'clock, the selection window */
html.push('<g id="wedge">');
html.push('<path d="' + ring(R_SEC_O - 2, R_SEC_I + 2, -WEDGE, WEDGE) + '" fill="url(#brass)"/>');
html.push('<path d="' + ring(R_SEC_O - 2, R_SEC_I + 2, -WEDGE, WEDGE) + '" fill="none" stroke="#4a3517" stroke-width="1" opacity=".55"/>');
html.push('</g>');

/* rotating grip: knurl and graduations */
html.push('<g id="ringRot">');
html.push('<circle cx="220" cy="220" r="' + ((R_KNURL_O + R_KNURL_I) / 2) + '" fill="none" stroke="#141210" stroke-width="' + (R_KNURL_O - R_KNURL_I) + '"/>');
html.push(knurl(R_KNURL_O - 1, R_KNURL_I + 1, 88, 1.7));
html.push(grads());
html.push('</g>');

/* rims */
html.push('<circle cx="220" cy="220" r="' + R_KNURL_O + '" fill="none" stroke="#3b2a12" stroke-width="1.2" opacity=".9"/>');
html.push('<circle cx="220" cy="220" r="' + R_KNURL_I + '" fill="none" stroke="#3b2a12" stroke-width="1.2" opacity=".9"/>');
html.push('<circle cx="220" cy="220" r="' + R_SEC_O + '" fill="none" stroke="#000" stroke-width="2" opacity=".65"/>');
html.push('<circle cx="220" cy="220" r="' + (R_SEC_O + 1.6) + '" fill="none" stroke="#6b4f24" stroke-width=".9" opacity=".7"/>');

/* labels — positioned every frame, always upright */
html.push('<g id="labels">');
for (var i = 0; i < N; i++) {
  var c = CATS[i];
  html.push('<g class="lbl" id="lbl' + i + '">' +
    '<g class="lbl__ic" transform="translate(-14,-34) scale(1.16)">' +
      '<g fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' + (I.G[c.id] || I.G.search) + '</g>' +
    '</g>' +
    '<text class="lbl__t" y="14">' + esc(c.short) + '</text>' +
    '</g>');
}
html.push('</g>');

/* the hub */
html.push('<g id="hubRot">');
html.push('<circle cx="220" cy="220" r="' + ((R_HUB_O + R_HUB_I) / 2) + '" fill="none" stroke="#1a1714" stroke-width="' + (R_HUB_O - R_HUB_I) + '"/>');
html.push(knurl(R_HUB_O - 1, R_HUB_I + 1, 56, 1.5));
html.push('</g>');
html.push('<circle cx="220" cy="220" r="' + R_HUB_I + '" fill="url(#hubface)"/>');
html.push('<circle cx="220" cy="220" r="' + R_HUB_I + '" fill="none" stroke="#000" stroke-width="1.6" opacity=".7"/>');
html.push('<circle cx="220" cy="220" r="' + (R_HUB_O + 1) + '" fill="none" stroke="#5c421d" stroke-width=".9" opacity=".8"/>');
html.push('<circle cx="220" cy="220" r="' + (R_HUB_I - 5) + '" fill="none" stroke="#6b4f24" stroke-width=".7" opacity=".45"/>');

/* the index mark */
html.push('<g id="pointer">' +
  '<path d="M220 ' + (C - R_SEC_O - 2) + ' L228.5 ' + (C - R_SEC_O - 18) + ' L211.5 ' + (C - R_SEC_O - 18) + ' Z" fill="url(#brass)"/>' +
  '<path d="M220 ' + (C - R_SEC_O - 2) + ' L228.5 ' + (C - R_SEC_O - 18) + ' L211.5 ' + (C - R_SEC_O - 18) + ' Z" fill="none" stroke="#3b2a12" stroke-width=".8"/>' +
  '</g>');

dial.innerHTML = html.join('');

/* keyboard-reachable sector buttons (invisible, pointer-transparent) */
var sectors = $('#sectors');
sectors.innerHTML = CATS.map(function (c, n) {
  return '<button type="button" data-sec="' + n + '" aria-label="' + esc(c.name) + ' — ' + esc(c.blurb) + '">' + esc(c.name) + '</button>';
}).join('');
var secBtns = $$('button', sectors);
var lblEls = [];
for (var k = 0; k < N; k++) lblEls.push($('#lbl' + k));

/* ── painting ──────────────────────────────────────────────────── */
var ringRot = $('#ringRot'), hubRot = $('#hubRot');
function norm(a) { a = a % 360; if (a > 180) a -= 360; if (a < -180) a += 360; return a; }

function paint() {
  ringRot.setAttribute('transform', 'rotate(' + ringA.toFixed(2) + ' ' + C + ' ' + C + ')');
  hubRot.setAttribute('transform', 'rotate(' + hubA.toFixed(2) + ' ' + C + ' ' + C + ')');

  var top = -1, best = 999;
  for (var i = 0; i < N; i++) {
    var a = ringA + i * STEP;
    var p = polar(R_LABEL, a);
    lblEls[i].setAttribute('transform', 'translate(' + p[0].toFixed(2) + ' ' + p[1].toFixed(2) + ')');
    var d = Math.abs(norm(a));
    if (d < best) { best = d; top = i; }
    /* fade the labels at the far side a little, like type on a curved plate */
    lblEls[i].setAttribute('opacity', (d > 150 ? 0.52 : d > 100 ? 0.72 : 1).toFixed(2));
    lblEls[i].classList.toggle('lit', d < WEDGE);
    var b = secBtns[i];
    b.style.left = (p[0] / 440 * 100).toFixed(2) + '%';
    b.style.top = (p[1] / 440 * 100).toFixed(2) + '%';
  }
  if (top !== sel) setCategory(top, true);
}

/* ── selection ─────────────────────────────────────────────────── */
function setCategory(n, fromTurn) {
  sel = n;
  list = I.byCat[CATS[n].id];
  idx = 0; hubA = 0; lastHubDet = 0;
  $('#hubCat').textContent = CATS[n].short;
  secBtns.forEach(function (b, i) { b.setAttribute('aria-current', String(i === n)); });
  showFix(fromTurn);
}
function setIndex(n, silent) {
  var t = list.length;
  idx = ((n % t) + t) % t;
  showFix(true);
  if (!silent) I.Snd.play('tick');
}

var plaqueBody = $('#plaqueBody'), plaque = $('#plaque');
function showFix(animate) {
  var f = list[idx];
  $('#hubN').textContent = String(idx + 1).padStart(2, '0');
  $('#hubT').textContent = String(list.length).padStart(2, '0');
  if (!f) return;
  $('#pService').textContent = f.service;
  $('#pApproach').textContent = I.appById[f.approach].name;
  $('#pTitle').textContent = f.title;
  $('#pSum').textContent = f.summary;
  $('#useLabel').textContent = f.action.kind === 'query' ? 'Use fix' : f.action.kind === 'steps' ? 'Show me how' : 'Use fix';
  $('#prevFix').disabled = false;
  $('#nextFix').disabled = false;
  $('#useFix').disabled = false;
  drawFacts(f);
  if (animate && !I.reduced()) {
    plaque.classList.remove('plaque--flip');
    void plaque.offsetWidth;
    plaque.classList.add('plaque--flip');
  }
  window.INS_CURRENT = f;
}

function drawFacts(f) {
  var plats = (f.platforms || []).map(function (p) {
    var m = { iphone: 'iPhone', android: 'Android', desktop: 'desktop' };
    return m[p] || p;
  });
  var inst = { none: 'No install', extension: 'Needs an extension', app: 'Needs an app', account: 'Needs an account' }[f.install] || 'No install';
  var age = I.daysSince(f.verified);
  var vTxt = age <= 120 ? 'Recently verified' : 'Checked ' + f.verified.slice(0, 7).replace('-', ' · ');
  var items = [
    ['phone', plats.length === 3 ? 'Works on any device' : 'Works on ' + plats.join(' & ')],
    ['install', inst],
    [f.confidence === 'high' ? 'shield' : 'clock', vTxt]
  ];
  $('#facts').innerHTML = items.map(function (it) {
    return '<li>' + I.ICON[it[0]] + '<span>' + esc(it[1]) + '</span></li>';
  }).join('');
}

/* ── turning ───────────────────────────────────────────────────── */
var drag = null;
function angleAt(e) {
  var r = box.getBoundingClientRect();
  var x = e.clientX - (r.left + r.width / 2);
  var y = e.clientY - (r.top + r.height / 2);
  return { a: Math.atan2(y, x) * 180 / Math.PI + 90, r: Math.hypot(x, y) / (r.width / 2) };
}
function down(e) {
  if (e.button !== undefined && e.button > 0) return;
  I.Snd.unlock();
  var p = angleAt(e);
  if (p.r > 1.02) return;
  var inner = p.r < (R_HUB_O + 6) / 220;
  if (inner && !touched) { hint('Turn the outer ring first'); return; }
  drag = {
    id: e.pointerId, inner: inner, last: p.a, a0: p.a, moved: 0,
    v: 0, t: performance.now(), startAngle: inner ? hubA : ringA, mark: 0
  };
  cancelGlide();
  box.setPointerCapture(e.pointerId);
  box.style.cursor = 'grabbing';
}
function move(e) {
  if (!drag || e.pointerId !== drag.id) return;
  var p = angleAt(e);
  var d = norm(p.a - drag.last);
  drag.last = p.a;
  drag.moved += Math.abs(d);
  var now = performance.now(), dt = Math.max(1, now - drag.t);
  drag.v = d / dt * 0.7 + drag.v * 0.3;
  drag.t = now;

  if (drag.inner) { hubA += d; detentHub(); }
  else { ringA += d; detentRing(); }
  paint();
  e.preventDefault();
}
function release(e) {
  if (!drag || (e && e.pointerId !== drag.id)) return;
  var d = drag; drag = null;
  box.style.cursor = '';
  try { box.releasePointerCapture(e.pointerId); } catch (x) {}

  if (d.moved < 4) {                       /* a tap, not a turn */
    var p = angleAt(e);
    if (!d.inner && p.r > (R_SEC_I - 4) / 220 && p.r < 1.02) {
      var a = norm(p.a - ringA);
      var n = Math.round(a / STEP);
      n = ((n % N) + N) % N;
      if (n !== sel) { turnTo(n); }
      else { pulse(); }
    } else if (d.inner && touched) {
      $('#useFix').click();
    }
    return;
  }
  markTouched();
  glide(d.inner, d.v);
}

/* detent bookkeeping so the click lands exactly on the stop */
var lastRingDet = 0, lastHubDet = 0;
function detentRing() {
  var n = Math.round(-ringA / STEP);
  if (n !== lastRingDet) { lastRingDet = n; I.Snd.play('detent'); I.buzz(7); }
}
function detentHub() {
  if (!list || !list.length) return;
  var per = 360 / Math.max(6, list.length);
  var n = Math.round(-hubA / per);
  if (n !== lastHubDet) {
    lastHubDet = n;
    I.Snd.play('tick'); I.buzz(4);
    setIndex(n, true);
  }
}

/* ── momentum and snap ─────────────────────────────────────────── */
var raf = 0;
function cancelGlide() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
function glide(inner, v) {
  if (I.reduced() || Math.abs(v) < 0.04) { snap(inner); return; }
  v = I.clamp(v, -2.2, 2.2);
  var last = performance.now();
  (function step(now) {
    var dt = Math.min(34, now - last); last = now;
    v *= Math.pow(0.9955, dt);
    var d = v * dt;
    if (inner) { hubA += d; detentHub(); } else { ringA += d; detentRing(); }
    paint();
    if (Math.abs(v) > 0.012) raf = requestAnimationFrame(step);
    else { raf = 0; snap(inner); }
  })(last);
}
function snap(inner) {
  if (inner) {
    var per = 360 / Math.max(6, list.length);
    animate(function (x) { hubA = x; }, hubA, Math.round(hubA / per) * per, 260);
  } else {
    var t = Math.round(ringA / STEP) * STEP;
    animate(function (x) { ringA = x; }, ringA, t, 300, function () { I.Snd.play('detent'); });
  }
}
function animate(set, from, to, dur, done) {
  cancelGlide();
  if (I.reduced()) { set(to); paint(); if (done) done(); return; }
  var t0 = performance.now();
  (function step(now) {
    var k = Math.min(1, (now - t0) / dur);
    /* a slight overshoot, as a sprung detent has */
    var e = k < 1 ? 1 - Math.pow(1 - k, 3) : 1;
    var o = k < 1 ? Math.sin(k * Math.PI) * 0.055 * Math.sign(to - from) : 0;
    set(from + (to - from) * e + o * STEP * 0.18);
    paint();
    if (k < 1) raf = requestAnimationFrame(step);
    else { raf = 0; set(to); paint(); if (done) done(); }
  })(t0);
}
function turnTo(n) {
  markTouched();
  var target = -n * STEP;
  var d = norm(target - ringA);
  animate(function (x) { ringA = x; }, ringA, ringA + d, 420, function () { I.Snd.play('detent'); I.buzz(9); });
}
function pulse() {
  var w = $('#wedge');
  w.style.filter = 'url(#glow)';
  setTimeout(function () { w.style.filter = ''; }, 260);
  I.Snd.play('press');
}
function markTouched() {
  if (touched) return;
  touched = true;
  $('#hubRest').hidden = true;
  $('#hubLive').hidden = false;
  var n = $('#nudge');
  if (!n.hidden) {
    n.querySelector('span').textContent = 'Turn the hub for another remedy';
    setTimeout(hideNudge, 5200);
  }
}
var nudgeGone = false;
function hideNudge() {
  if (nudgeGone) return;
  nudgeGone = true;
  var n = $('#nudge');
  n.style.opacity = '0';
  setTimeout(function () { n.hidden = true; }, 600);
}
var hintT = null;
function hint(msg) {
  var n = $('#nudge');
  if (n.hidden) { I.toast(msg); return; }
  n.querySelector('span').textContent = msg;
  clearTimeout(hintT);
  hintT = setTimeout(function () { if (!n.hidden) n.querySelector('span').textContent = 'Turn the outer ring'; }, 2400);
}

box.addEventListener('pointerdown', down);
box.addEventListener('pointermove', move);
box.addEventListener('pointerup', release);
box.addEventListener('pointercancel', release);
box.addEventListener('wheel', function (e) {
  e.preventDefault();
  I.Snd.unlock(); markTouched(); cancelGlide();
  ringA -= Math.sign(e.deltaY) * STEP;
  detentRing(); paint();
  clearTimeout(wheelT); wheelT = setTimeout(function () { snap(false); }, 140);
}, { passive: false });
var wheelT = null;

/* steppers under the plaque move the hub, and the hub follows */
$('#prevFix').addEventListener('click', function () { step(-1); });
$('#nextFix').addEventListener('click', function () { step(1); });
function step(dir) {
  markTouched();
  var per = 360 / Math.max(6, list.length);
  var to = hubA - dir * per;
  lastHubDet = Math.round(-to / per);
  setIndex(idx + dir, true);
  I.Snd.play('tick'); I.buzz(5);
  animate(function (x) { hubA = x; }, hubA, to, 240);
}

/* keyboard */
secBtns.forEach(function (b) {
  b.addEventListener('click', function () { I.Snd.unlock(); turnTo(parseInt(b.dataset.sec, 10)); });
});
box.setAttribute('tabindex', '0');
box.setAttribute('role', 'application');
box.setAttribute('aria-label', 'Dial. Left and right arrows change the category; up and down change the remedy.');
box.addEventListener('keydown', function (e) {
  var k = e.key;
  if (k === 'ArrowRight') { e.preventDefault(); I.Snd.unlock(); turnTo((sel + 1) % N); }
  else if (k === 'ArrowLeft') { e.preventDefault(); I.Snd.unlock(); turnTo((sel + N - 1) % N); }
  else if (k === 'ArrowDown' || k === 'PageDown') { e.preventDefault(); I.Snd.unlock(); step(1); }
  else if (k === 'ArrowUp' || k === 'PageUp') { e.preventDefault(); I.Snd.unlock(); step(-1); }
  else if (k === 'Enter' || k === ' ') { e.preventDefault(); $('#useFix').click(); }
});

/* ── boot ──────────────────────────────────────────────────────── */
setCategory(0, false);
paint();

/* let other files drive the dial (search results jump straight here) */
window.INS_DIAL = {
  show: function (fixId) {
    var f = I.byId[fixId]; if (!f) return;
    var ci = -1;
    for (var i = 0; i < N; i++) if (CATS[i].id === f.category) ci = i;
    if (ci < 0) return;
    markTouched();
    var target = -ci * STEP, d = norm(target - ringA);
    var newList = I.byCat[CATS[ci].id];
    var ni = newList.indexOf(f);
    animate(function (x) { ringA = x; }, ringA, ringA + d, 480, function () {
      I.Snd.play('detent');
      var per = 360 / Math.max(6, newList.length);
      lastHubDet = -ni;
      setIndex(ni, true);
      animate(function (x) { hubA = x; }, hubA, -ni * per, 320);
    });
    if (I.reduced()) { setIndex(ni, true); }
  },
  current: function () { return list[idx]; }
};
})();
