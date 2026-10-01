/* ══════════════════════════════════════════════════════════════════
   ILUD FOLIO — the tray
   Cards are laid out by rank. Everything else is a change of rank.
   ══════════════════════════════════════════════════════════════════ */
(function () {
'use strict';
var F = window.FOL;
if (!F) return;

var $ = F.$, D = F.D, esc = F.esc, clamp = F.clamp;
var stack = $('#stack'), tray = $('#tray'), tabsEl = $('#tabs'), deepEl = $('#deep');
var hintEl = $('#hintline');

/* short, vertical-friendly tab words */
var LAB = {
  search:'SEARCH', social:'SOCIAL', images:'IMAGE', writing:'WRITE',
  shopping:'SHOP', browsing:'WEB', video:'VIDEO', everyday:'DAILY'
};

var cats = D.categories;
var catIx = 0;
var order = [];
var elById = {};
var exp = 340, col = 62, gap = 8, maxC = 4;
var busy = false;

/* ── measurement ───────────────────────────────────────────────── */
function measure() {
  var h = stack.clientHeight || 420;
  exp = Math.round(clamp(h * 0.52, 250, 430));
  col = h < 420 ? 54 : 62;
  gap = 8;
  maxC = Math.max(1, Math.floor((h - exp - 12) / (col + gap)));
  if (maxC > 4) maxC = 4;
}

/* ── card construction ─────────────────────────────────────────── */
function platLine(f) {
  var p = f.platforms || [];
  if (p.length >= 3) return 'Works everywhere';
  return 'Works on ' + p.map(function (id) {
    return F.platById[id] ? F.platById[id].name : id;
  }).join(' & ');
}

function actionWord(f) {
  var k = f.action.kind;
  return k === 'copy' ? 'Copy it' : k === 'steps' ? 'Show me how' : 'Use fix';
}

function makeCard(f) {
  var el = document.createElement('article');
  el.className = 'card';
  el.dataset.fix = f.id;
  el.tabIndex = 0;
  el.setAttribute('role', 'button');
  el.setAttribute('aria-label', f.title + ' — ' + f.summary);
  el.innerHTML =
    '<div class="card__in">' +
      '<div class="face">' +
        '<span class="eyelet" aria-hidden="true"></span>' +
        '<div class="layer mini">' +
          '<span class="cnum">01</span>' +
          '<h3 class="mtitle">' + esc(f.title) + '</h3>' +
        '</div>' +
        '<div class="layer full">' +
          '<div class="chead">' +
            '<span class="cnum">01</span>' +
            '<span class="cbrand"><b>ILUD</b><em>CARD INDEX</em></span>' +
          '</div>' +
          '<h3 class="ctitle">' + esc(f.title) + '</h3>' +
          '<hr class="crule">' +
          '<p class="csum">' + esc(f.summary) + '</p>' +
          '<div class="cfoot">' +
            '<button class="usefix" type="button" data-use>' +
              '<span>' + esc(actionWord(f)) + '</span>' + F.ICON.arrow +
            '</button>' +
            '<span class="badge">' + F.ICON.phone + '<span>' + esc(platLine(f)) + '</span></span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="back" aria-hidden="true"></div>' +
    '</div>';
  return el;
}

function buildBack(el, f) {
  var b = el.querySelector('.back');
  var a = f.action;
  var html = '<span class="eyelet eyelet--back" aria-hidden="true"></span>';
  if (a.kind === 'query') {
    html +=
      '<p class="bkicker">' + esc(a.label || 'Use fix') + '</p>' +
      '<p class="bq">What are you looking for?</p>' +
      '<div class="line">' +
        '<input type="search" enterkeyhint="go" autocomplete="off" autocapitalize="off" ' +
          'spellcheck="false" placeholder="' + esc(a.placeholder || 'Type it here') + '" aria-label="Your search">' +
        '<button class="go" type="button" data-go>Go</button>' +
      '</div>' +
      '<p class="bhint">' + esc(a.note || 'Opens in a new tab, already in the plain mode.') + '</p>';
  } else {
    html += '<p class="bkicker">How to do it</p>' +
           '<p class="bq">' + esc(f.title) + '</p>' +
           '<ol class="bsteps">' + (f.steps || []).map(function (s) {
             return '<li>' + esc(s) + '</li>';
           }).join('') + '</ol>';
  }
  html += '<button class="turnback" type="button" data-turnback>Turn back</button>';
  b.innerHTML = html;
  b.setAttribute('aria-hidden', 'false');
}

/* ── layout ────────────────────────────────────────────────────── */
function place(el, y, h, op, z, top, animate) {
  if (!animate) el.style.transition = 'none';
  el.__y = y;
  el.style.transform = 'translate3d(0,' + y + 'px,0)';
  el.style.height = h + 'px';
  el.style.opacity = op;
  el.style.zIndex = z;
  el.style.pointerEvents = op ? 'auto' : 'none';
  el.tabIndex = op ? 0 : -1;
  el.classList.toggle('card--top', !!top);
  el.setAttribute('aria-hidden', op ? 'false' : 'true');
  if (!animate) { void el.offsetHeight; el.style.transition = ''; }
}

function layout(animate) {
  var n = order.length;
  order.forEach(function (f, r) {
    var el = elById[f.id];
    if (!el) return;
    var num = el.querySelectorAll('.cnum');
    var label = (r + 1) < 10 ? '0' + (r + 1) : '' + (r + 1);
    num[0].textContent = label; num[1].textContent = label;
    if (r === 0) place(el, 0, exp, 1, n + 10, true, animate);
    else if (r <= maxC) place(el, exp + 10 + (r - 1) * (col + gap), col, 1, n + 10 - r, false, animate);
    else place(el, exp + 10 + maxC * (col + gap), col, 0, 1, false, animate);
  });
  paintDeep();
}

function paintDeep() {
  var rest = order.length - 1 - maxC;
  deepEl.textContent = rest > 0 ? '+ ' + rest + ' more in this drawer' : '';
}

/* ── loading a category ────────────────────────────────────────── */
function loadCat(ix) {
  catIx = ix;
  order = F.byCat[cats[ix].id].slice();
  stack.innerHTML = '';
  elById = {};
  order.forEach(function (f) {
    var el = makeCard(f);
    elById[f.id] = el;
    stack.appendChild(el);
  });
  measure();
  layout(false);
  paintTabs();
  stack.setAttribute('aria-label', cats[ix].name + ' — ' + order.length + ' remedies');
}

function swapCat(ix, focusId) {
  if (busy || ix === catIx) { if (focusId) raiseById(focusId); return; }
  if (F.reduced()) {
    loadCat(ix);
    if (focusId) raiseById(focusId, true);
    F.Snd.play('tick');
    return;
  }
  busy = true;
  F.Snd.play('riffle');
  order.forEach(function (f, r) {
    if (r > maxC) return;
    var el = elById[f.id];
    el.style.transition = 'transform .24s ease-in,opacity .24s ease-in';
    el.style.transitionDelay = (r * 26) + 'ms';
    el.style.transform = 'translate3d(30%,' + el.__y + 'px,0) rotate(3.5deg)';
    el.style.opacity = '0';
  });
  setTimeout(function () {
    loadCat(ix);
    if (focusId) {
      var r = order.map(function (x) { return x.id; }).indexOf(focusId);
      if (r > 0) { order.splice(r, 1); order.unshift(F.byId[focusId]); }
    }
    order.forEach(function (f, r) {
      var el = elById[f.id];
      if (r > maxC) return;
      el.style.transition = 'none';
      el.style.transform = 'translate3d(-22%,' + el.__y + 'px,0) rotate(-2.5deg)';
      el.style.opacity = '0';
    });
    void stack.offsetHeight;
    order.forEach(function (f, r) {
      var el = elById[f.id];
      if (r > maxC) return;
      el.style.transition = '';
      el.style.transitionDelay = (r * 48) + 'ms';
    });
    layout(true);
    F.Snd.play('slide');
    setTimeout(function () {
      order.forEach(function (f) { if (elById[f.id]) elById[f.id].style.transitionDelay = ''; });
      busy = false;
    }, 640);
  }, 26 * Math.min(order.length, maxC + 1) + 200);
}

/* ── tabs ──────────────────────────────────────────────────────── */
function paintTabs() {
  if (!tabsEl.children.length) {
    cats.forEach(function (c, i) {
      var b = document.createElement('button');
      b.className = 'tab';
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.dataset.cat = String(i);
      b.title = c.name;
      b.textContent = LAB[c.id] || c.short.toUpperCase();
      tabsEl.appendChild(b);
    });
  }
  F.$$('.tab', tabsEl).forEach(function (b, i) {
    b.setAttribute('aria-selected', i === catIx ? 'true' : 'false');
  });
}
tabsEl.addEventListener('click', function (e) {
  var b = e.target.closest('.tab');
  if (!b) return;
  F.Snd.unlock();
  swapCat(parseInt(b.dataset.cat, 10));
  hint('Cards are ordered by how well they work. The top one is the best bet.');
});

/* ── rank changes ──────────────────────────────────────────────── */
function sendBack(dir) {
  if (busy || order.length < 2) return;
  busy = true;
  var f = order[0], el = elById[f.id];
  el.style.transition = 'transform .32s ease-out,opacity .32s ease';
  el.style.transform = 'translate3d(' + (dir * 125) + '%,-4%,0) rotate(' + (dir * 9) + 'deg)';
  el.style.opacity = '0';
  F.Snd.play('flick');
  setTimeout(function () {
    order.push(order.shift());
    el.classList.remove('card--flipped');
    el.style.transition = 'none';
    layout(true);
    F.Snd.play('slide');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { el.style.transition = ''; busy = false; });
    });
    progress('swiped');
  }, F.reduced() ? 10 : 330);
}

function raise(f) {
  var r = order.indexOf(f);
  if (busy || r < 1) return;
  busy = true;
  order.splice(r, 1);
  order.unshift(f);
  F.$$('.card--flipped', stack).forEach(function (c) { c.classList.remove('card--flipped'); });
  layout(true);
  F.Snd.play('lift');
  setTimeout(function () { busy = false; }, F.reduced() ? 10 : 440);
}
function raiseById(id, quiet) {
  var f = F.byId[id];
  if (!f) return;
  if (order.indexOf(f) < 0) return;
  if (order.indexOf(f) === 0) { flash(elById[id]); return; }
  raise(f);
  if (!quiet) setTimeout(function () { flash(elById[id]); }, 460);
}
function flash(el) {
  if (!el) return;
  el.animate
    ? el.animate([{ filter: 'brightness(1)' }, { filter: 'brightness(1.18)' }, { filter: 'brightness(1)' }],
                 { duration: 640, easing: 'ease-out' })
    : null;
}

/* expose for page.js */
window.FOLTRAY = {
  show: function (fix) {
    var ix = cats.map(function (c) { return c.id; }).indexOf(fix.category);
    if (ix < 0) return;
    if (ix === catIx) raiseById(fix.id);
    else swapCat(ix, fix.id);
  },
  categoryIndex: function () { return catIx; },
  relayout: function () { measure(); layout(true); }
};

/* ── gestures ──────────────────────────────────────────────────── */
var g = null;
stack.addEventListener('pointerdown', function (e) {
  var card = e.target.closest('.card');
  if (!card || busy) return;
  F.Snd.unlock();
  if (e.target.closest('button,input,a,details,summary')) return;
  var f = F.byId[card.dataset.fix];
  var top = order[0] === f;
  g = {
    el: card, f: f, top: top, flipped: card.classList.contains('card--flipped'),
    x0: e.clientX, y0: e.clientY, dx: 0, dy: 0, axis: '', t0: Date.now(), drag: false, id: e.pointerId
  };
});
stack.addEventListener('pointermove', function (e) {
  if (!g || e.pointerId !== g.id) return;
  g.dx = e.clientX - g.x0;
  g.dy = e.clientY - g.y0;
  if (!g.axis && (Math.abs(g.dx) > 8 || Math.abs(g.dy) > 8)) {
    g.axis = Math.abs(g.dx) > Math.abs(g.dy) ? 'x' : 'y';
    if (!g.top || g.flipped) { g.axis = 'dead'; return; }
    g.drag = true;
    try { g.el.setPointerCapture(e.pointerId); } catch (err) {}
    g.el.style.transition = 'none';
  }
  if (!g.drag) return;
  e.preventDefault();
  if (g.axis === 'x') {
    var rot = clamp(g.dx / 26, -11, 11);
    g.el.style.transform = 'translate3d(' + g.dx + 'px,0,0) rotate(' + rot + 'deg)';
    g.el.style.opacity = String(clamp(1 - Math.abs(g.dx) / 520, 0.45, 1));
  } else if (g.axis === 'y') {
    var up = clamp(g.dy, -110, 26);
    g.el.style.transform = 'translate3d(0,' + up + 'px,0) scale(' + (1 - up / 5400) + ')';
  }
});
function endGesture(e) {
  if (!g || (e && e.pointerId !== g.id)) return;
  var d = g; g = null;
  if (!d.drag) {
    if (Math.abs(d.dx) < 10 && Math.abs(d.dy) < 10 && (Date.now() - d.t0) < 900) {
      if (d.top) { if (!d.flipped) openRecord(d.f); }
      else raise(d.f);
    }
    return;
  }
  d.el.style.transition = '';
  d.el.style.opacity = '';
  var fast = (Date.now() - d.t0) < 300;
  if (d.axis === 'x' && (Math.abs(d.dx) > 96 || (fast && Math.abs(d.dx) > 42))) {
    d.el.style.transform = 'translate3d(' + d.dx + 'px,0,0)';
    sendBack(d.dx < 0 ? -1 : 1);
    return;
  }
  if (d.axis === 'y' && (d.dy < -70 || (fast && d.dy < -34))) {
    layout(true);
    openRecord(d.f);
    return;
  }
  layout(true);
}
stack.addEventListener('pointerup', endGesture);
stack.addEventListener('pointercancel', endGesture);

/* keyboard: the tray is operable without a single gesture */
stack.addEventListener('keydown', function (e) {
  var card = e.target.closest('.card');
  if (!card) return;
  var f = F.byId[card.dataset.fix];
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    if (order[0] === f) openRecord(f); else raise(f);
  }
});
document.addEventListener('keydown', function (e) {
  if (F.pageDepth()) return;
  if (e.target.matches('input,textarea')) return;
  if (e.key === 'ArrowRight') { e.preventDefault(); sendBack(1); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); sendBack(-1); }
  else if (e.key === 'ArrowDown') { e.preventDefault(); swapCat((catIx + 1) % cats.length); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); swapCat((catIx + cats.length - 1) % cats.length); }
});

/* ── buttons on a card ─────────────────────────────────────────── */
stack.addEventListener('click', function (e) {
  var card = e.target.closest('.card');
  if (!card) return;
  var f = F.byId[card.dataset.fix];
  if (e.target.closest('[data-use]')) {
    F.Snd.unlock();
    if (order[0] !== f) { raise(f); return; }
    useFix(card, f);
    return;
  }
  if (e.target.closest('[data-turnback]')) {
    card.classList.remove('card--flipped');
    F.Snd.play('turn');
    return;
  }
  if (e.target.closest('[data-go]')) {
    var inp = card.querySelector('.line input');
    F.launch(f, inp ? inp.value : '');
    progress('used');
    return;
  }
});
stack.addEventListener('keydown', function (e) {
  if (e.key !== 'Enter') return;
  var inp = e.target.closest('.line input');
  if (!inp) return;
  e.preventDefault();
  var card = inp.closest('.card');
  F.launch(F.byId[card.dataset.fix], inp.value);
  progress('used');
});

function useFix(card, f) {
  var a = f.action;
  if (a.kind === 'link' || a.kind === 'copy') { F.launch(f); progress('used'); return; }
  buildBack(card, f);
  card.classList.add('card--flipped');
  F.Snd.play('turn');
  if (a.kind === 'query' && !F.reduced()) {
    setTimeout(function () {
      var i = card.querySelector('.line input');
      if (i) try { i.focus({ preventScroll: true }); } catch (e) { i.focus(); }
    }, 620);
  }
  hint(a.kind === 'query' ? 'Fill the line, then Go. Tap Turn back to return.'
                          : 'Follow the steps. Tap Turn back to return.');
}

function openRecord(f) {
  if (window.FOLPAGE) window.FOLPAGE.record(f);
  progress('opened');
}

/* ── hints ─────────────────────────────────────────────────────── */
var hintT = null;
function hint(msg) {
  if (!hintEl) return;
  hintEl.innerHTML = '<span>' + esc(msg) + '</span>';
  hintEl.style.opacity = '1';
  clearTimeout(hintT);
  hintT = setTimeout(function () { hintEl.style.opacity = '.001'; }, 6000);
}
var seen = F.store.get('seen', {});
function progress(what) {
  if (seen[what]) return;
  seen[what] = 1;
  F.store.set('seen', seen);
  if (what === 'swiped') hint('Tap a card to read the whole entry.');
  else if (what === 'opened') hint('The tabs on the right change the subject.');
  else if (what === 'used') hint('Keep a card in the pocket to find it again.');
}

/* ── the riffle button: deal a card from anywhere ──────────────── */
$('#btnRiffle').addEventListener('click', function () {
  F.Snd.unlock();
  var pool = D.fixes.filter(function (f) { return !f.advanced && f.confidence !== 'experimental'; });
  var pick = pool[Math.floor(Math.random() * pool.length)];
  window.FOLTRAY.show(pick);
  hint('Dealt at random: ' + pick.title);
});

/* ── boot ──────────────────────────────────────────────────────── */
var rz = null;
window.addEventListener('resize', function () {
  clearTimeout(rz);
  rz = setTimeout(function () { measure(); layout(false); }, 160);
});
window.addEventListener('orientationchange', function () {
  setTimeout(function () { measure(); layout(false); }, 320);
});

function start() {
  measure();
  loadCat(0);
  F.paintPocket();
}
window.FOLTRAY.start = start;
})();
