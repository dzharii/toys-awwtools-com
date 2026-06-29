// Windows 3.11 URI Launcher - core app
(function () {
  'use strict';
  var L = window.LINKS, GROUPS = window.GROUPS, AREAS = window.SETTINGS_AREAS;
  L.forEach(function (it) { it._search = (it.title + ' ' + it.uri + ' ' + it.description + ' ' + it.category + ' ' + (it.area || '') + ' ' + it.status.join(' ') + ' ' + it.tags.join(' ')).toLowerCase(); });

  // ---- event bus (for Clippy) ----
  var bus = { h: {}, on: function (n, f) { (this.h[n] = this.h[n] || []).push(f); }, emit: function (n, p) { (this.h[n] || []).forEach(function (f) { try { f(p); } catch (e) {} }); } };
  window.BUS = bus;

  // ---- platform ----
  var plat = detectPlatform();
  function detectPlatform() {
    var p = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
    var ua = navigator.userAgent || '';
    if (/win/i.test(p) || /windows/i.test(ua)) return 'windows';
    if (/mac|linux|android|iphone|ipad/i.test(p + ua)) return 'other';
    return 'unknown';
  }
  window.PLATFORM = plat;

  // ---- groups -> items ----
  function items(gid) {
    if (gid === 'all') return L;
    return L.filter(function (x) { return x.group === gid; });
  }
  function areaItems(area) { return L.filter(function (x) { return x.area === area; }); }

  var $ = function (s, r) { return (r || document).querySelector(s); };
  function el(t, c, h) { var e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; }
  window.STATUS_MSG = function (m) { $('#statusmain').textContent = m; };

  // ---- status badges ----
  function badges(it) {
    return it.status.map(function (s) {
      var cls = /Deprecated|Legacy/.test(s) ? 'bad' : /dependent|Conditional|Policy|Internal|Enterprise/.test(s) ? 'warn' : it.template ? 'tmpl' : '';
      return '<span class="badge ' + cls + '">' + s + '</span>';
    }).join('');
  }

  // ====================== WINDOW MANAGER ======================
  var wins = {}, z = 100, active = null, off = 0;
  function focusWin(id) {
    active = id;
    Object.keys(wins).forEach(function (k) { wins[k].dom.classList.toggle('active', k === id); });
    wins[id].dom.style.zIndex = ++z;
    renderTaskbar();
  }
  function openWindow(opt) {
    if (wins[opt.id]) { focusWin(opt.id); return wins[opt.id]; }
    var d = el('div', 'window pmwin'); d.style.left = (40 + off) + 'px'; d.style.top = (20 + off) + 'px'; off = (off + 26) % 160;
    d.style.width = (opt.w || 520) + 'px'; d.style.height = (opt.h || 360) + 'px';
    d.innerHTML = '<div class="title-bar"><div class="title-bar-buttons"><button class="mn" data-minimize aria-label="Minimize"></button></div><div class="title-bar-text"></div><div class="title-bar-buttons"><button class="cl" data-close aria-label="Close"></button></div></div>'
      + '<div class="window-body"><div class="body"></div><div class="status-bar"><span class="s1"></span></div></div><div class="resz"></div>';
    $('.title-bar-text', d).textContent = opt.title; $('.body', d).appendChild(opt.body);
    document.body.appendChild(d);
    var w = { id: opt.id, dom: d, body: $('.body', d), st: $('.s1', d), title: opt.title };
    wins[opt.id] = w;
    d.addEventListener('mousedown', function () { focusWin(opt.id); });
    $('.cl', d).onclick = function () { closeWindow(opt.id); };
    $('.mn', d).onclick = function (e) { e.stopPropagation(); d.style.display = 'none'; renderTaskbar(); };
    drag(d, $('.title-bar', d)); resize(d, $('.resz', d));
    focusWin(opt.id);
    bus.emit('window.opened', { count: Object.keys(wins).length });
    return w;
  }
  function closeWindow(id) { if (wins[id]) { wins[id].dom.remove(); delete wins[id]; renderTaskbar(); } }
  function drag(d, h) {
    h.addEventListener('mousedown', function (e) {
      if (e.target.tagName === 'BUTTON') return; e.preventDefault();
      var sx = e.clientX, sy = e.clientY, l = d.offsetLeft, t = d.offsetTop;
      function mv(ev) { d.style.left = Math.max(0, l + ev.clientX - sx) + 'px'; d.style.top = Math.max(22, t + ev.clientY - sy) + 'px'; }
      function up() { document.removeEventListener('mousemove', mv); document.removeEventListener('mouseup', up); }
      document.addEventListener('mousemove', mv); document.addEventListener('mouseup', up);
    });
  }
  function resize(d, h) {
    h.addEventListener('mousedown', function (e) {
      e.preventDefault(); e.stopPropagation(); var sx = e.clientX, sy = e.clientY, w = d.offsetWidth, ht = d.offsetHeight;
      function mv(ev) { d.style.width = Math.max(240, w + ev.clientX - sx) + 'px'; d.style.height = Math.max(140, ht + ev.clientY - sy) + 'px'; }
      function up() { document.removeEventListener('mousemove', mv); document.removeEventListener('mouseup', up); }
      document.addEventListener('mousemove', mv); document.addEventListener('mouseup', up);
    });
  }
  function renderTaskbar() {
    var tb = $('#tasks'); tb.innerHTML = '';
    Object.keys(wins).forEach(function (k) {
      var b = el('button', 'tb' + (k === active ? ' active' : ''), wins[k].title);
      b.onclick = function () { wins[k].dom.style.display = 'flex'; focusWin(k); };
      tb.appendChild(b);
    });
  }
  function arrange() { var i = 0; Object.keys(wins).forEach(function (k) { var d = wins[k].dom; d.style.display = 'flex'; d.style.left = (30 + i * 26) + 'px'; d.style.top = (24 + i * 26) + 'px'; i++; }); bus.emit('windows.arranged', {}); }
  function closeAll() { Object.keys(wins).slice().forEach(closeWindow); }
  window.WM = { open: openWindow, close: closeWindow, arrange: arrange, closeAll: closeAll, focus: focusWin };

  // ====================== RENDER WINDOWS ======================
  var firstOpen = {};
  function openGroup(gid) {
    var g = GROUPS.find(function (x) { return x.id === gid; });
    var w = openWindow({ id: 'g-' + gid, title: g.title, body: el('div'), w: g.view === 'details' ? 760 : 620, h: 460 });
    w.body.innerHTML = '';
    if (g.view === 'subgroups') renderSubgroups(w);
    else if (g.view === 'help') renderHelp(w.body);
    else { var its = items(gid); g.view === 'details' ? detailsView(w, its) : iconView(w, its); w.st.textContent = its.length + ' launchers - ' + g.blurb; }
    if (!firstOpen[gid]) { firstOpen[gid] = 1; bus.emit('category.opened', { categoryId: gid }); }
  }
  function renderSubgroups(w) {
    var grid = el('div', 'icon-grid'); w.st.textContent = AREAS.length + ' setting groups - double-click to open';
    AREAS.forEach(function (a) {
      var it = el('div', 'icon'); it.setAttribute('role', 'option'); it.tabIndex = 0;
      it.innerHTML = window.getIcon('gear') + '<span class="icon-label">' + a + '</span>';
      it.ondblclick = function () { openArea(a); };
      it.onclick = function () { sel(grid, it); w.st.textContent = areaItems(a).length + ' settings in ' + a; };
      grid.appendChild(it);
    });
    w.body.appendChild(grid);
  }
  function openArea(a) { var its = areaItems(a); var w = openWindow({ id: 'a-' + a, title: 'Settings - ' + a, body: el('div'), w: 600, h: 360 }); detailsView(w, its); w.st.textContent = its.length + ' Settings links'; }
  function sel(c, n) { Array.prototype.forEach.call(c.querySelectorAll('[aria-selected=true]'), function (x) { x.removeAttribute('aria-selected'); }); n.setAttribute('aria-selected', 'true'); }
  function iconView(w, its) {
    var grid = el('div', 'icon-grid'); grid.tabIndex = 0;
    its.forEach(function (it) {
      var d = el('div', 'icon'); d.setAttribute('role', 'option'); d.tabIndex = 0;
      d.innerHTML = window.getIcon(it.iconKey) + '<span class="icon-label">' + esc(it.title) + '</span>';
      d.onclick = function () { sel(grid, d); selectItem(it, w); };
      d.ondblclick = function () { launch(it); };
      grid.appendChild(d);
    });
    w.body.appendChild(grid);
  }
  function detailsView(w, its) {
    var t = el('table', 'detailed', '<thead><tr><th>Name</th><th>URI</th><th>Group</th><th>Status</th></tr></thead><tbody></tbody>');
    var tb = t.querySelector('tbody');
    its.forEach(function (it) {
      var tr = el('tr', '', '<td>' + esc(it.title) + '</td><td>' + esc(it.uri) + '</td><td>' + it.group + '</td><td>' + it.status.join(', ') + '</td>');
      tr.tabIndex = 0;
      tr.onclick = function () { sel(tb, tr); selectItem(it, w); };
      tr.ondblclick = function () { launch(it); };
      tb.appendChild(tr);
    });
    w.body.appendChild(t);
  }
  function selectItem(it, w) {
    var n = it.template ? 'Template link - edit placeholder values before launching.' : it.uri + ' - ' + it.description;
    if (w) w.st.textContent = n; window.STATUS_MSG(it.uri);
    bus.emit('item.selected', { item: it });
  }
  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  window.openGroup = openGroup;

  // ====================== LAUNCH / COPY / DETAILS ======================
  function launch(it) {
    if (it.template) { bus.emit('item.templateSelected', { item: it }); return editTemplate(it); }
    bus.emit('launch.requested', { item: it, uri: it.openUri, platform: plat, status: it.status });
    var a = document.createElement('a'); a.href = it.openUri; document.body.appendChild(a); a.click(); a.remove();
    window.STATUS_MSG('Launch requested: ' + it.openUri);
  }
  function copy(uri, tmpl) {
    function done() { window.STATUS_MSG('Copied: ' + uri); bus.emit('copy.done', { uri: uri, template: tmpl }); }
    if (navigator.clipboard) navigator.clipboard.writeText(uri).then(done, fail); else fail();
    function fail() { bus.emit('copy.failed', {}); window.prompt('Copy this URI:', uri); }
  }
  window.launchItem = launch;
  function details(it) {
    var b = el('div', 'help');
    b.innerHTML = '<p><b>' + esc(it.title) + '</b></p><p>' + esc(it.description) + '</p><p>URI: <code>' + esc(it.uri) + '</code></p><p>Group: ' + it.group + '</p><p>Status: ' + badges(it) + '</p><p>Tags: ' + esc(it.tags.join(', ')) + '</p>';
    var f = el('div', 'dfoot');
    var ob = el('button', '', it.template ? 'Edit Template' : (plat === 'other' ? 'Open Anyway' : 'Open'));
    ob.onclick = function () { launch(it); };
    var cb = el('button', '', it.template ? 'Copy Template' : 'Copy');
    cb.onclick = function () { copy(it.uri, it.template); };
    f.appendChild(ob); f.appendChild(cb); b.appendChild(f);
    dialog('Details - ' + it.title, b);
  }
  window.openDetails = details;

  // ---- template editor ----
  function editTemplate(it) {
    bus.emit('template.opened', { item: it });
    var b = el('div', 'dbody'); var ph = (it.uri.match(/[<{][^>}]*[>}]/g) || []);
    var uri = it.uri;
    b.innerHTML = '<p>Replace placeholder values before launching.</p>';
    var inputs = [];
    ph.forEach(function (p, i) { var r = el('div', 'drow'); r.innerHTML = '<label>' + esc(p) + '<br></label>'; var inp = el('input'); inp.type = 'text'; inp.dataset.ph = p; r.appendChild(inp); b.appendChild(r); inputs.push(inp); });
    if (!ph.length) { var r = el('div', 'drow'); r.innerHTML = 'Value:<br>'; var inp = el('input'); inp.type = 'text'; inp.value = uri; r.appendChild(inp); b.appendChild(r); inputs.push(inp); }
    var prev = el('div', 'drow'); prev.innerHTML = 'URI: <code class="pv"></code>'; b.appendChild(prev);
    function build() { var u = ph.length ? uri : inputs[0].value; inputs.forEach(function (inp) { if (inp.dataset.ph) u = u.split(inp.dataset.ph).join(inp.value || inp.dataset.ph); }); prev.querySelector('.pv').textContent = u; return u; }
    inputs.forEach(function (i) { i.oninput = build; }); build();
    var f = el('div', 'dfoot');
    var op = el('button', '', 'Open'); op.onclick = function () { var u = build(); if (/[<{]/.test(u)) { bus.emit('template.placeholderLeft', {}); window.STATUS_MSG('Replace placeholder values first.'); return; } var a = document.createElement('a'); a.href = u; a.click(); window.STATUS_MSG('Launch requested: ' + u); };
    var cp = el('button', '', 'Copy'); cp.onclick = function () { copy(build(), true); };
    f.appendChild(op); f.appendChild(cp); b.appendChild(f);
    dialog('Template Editor - ' + it.title, b);
  }

  // ---- generic dialog ----
  function dialog(title, body) {
    var bg = el('div', 'modalbg'); var d = el('div', 'dialog active');
    d.innerHTML = '<div class="title-bar"><div class="title-bar-text"></div></div>'; $('.title-bar-text', d).textContent = title;
    var bw = el('div', 'dialog-body'); bw.appendChild(body); d.appendChild(bw);
    bg.appendChild(d); document.body.appendChild(bg);
    var close = el('div', 'dfoot'); var ok = el('button', '', 'Close'); ok.onclick = function () { bg.remove(); }; close.appendChild(ok); bw.appendChild(close);
    bg.onclick = function (e) { if (e.target === bg) bg.remove(); };
    document.addEventListener('keydown', function k(e) { if (e.key === 'Escape') { bg.remove(); document.removeEventListener('keydown', k); } });
  }
  window.appDialog = dialog;

  // ====================== SEARCH ======================
  var ALIAS = { wifi: 'wi-fi network', bt: 'bluetooth', snip: 'screenclip snipping', screenshot: 'screenclip snipping capture', mic: 'microphone', defender: 'security windowsdefender', cast: 'projection', printer: 'print', cam: 'camera' };
  function search(q) {
    q = q.toLowerCase().trim(); if (!q) return [];
    var terms = (ALIAS[q] || q).split(/\s+/).map(function (t) { return t.replace(/[^a-z0-9]/g, ''); });
    return L.filter(function (it) { var s = it._search; return terms.every(function (t) { return s.indexOf(t) >= 0; }); });
  }
  function openSearch(q) {
    var w = openWindow({ id: 'search', title: 'Find - Search Results', body: el('div'), w: 600, h: 360 });
    w.body.innerHTML = '';
    var bar = el('div', 'searchbar'); bar.innerHTML = '<input id="sq" type="search" placeholder="Search title, URI, tag, status..."><button class="fbtn">Find</button>';
    var res = el('div'); w.body.appendChild(bar); w.body.appendChild(res);
    var inp = $('#sq', bar); inp.value = q || '';
    function run() {
      var r = search(inp.value); res.innerHTML = ''; w.st.textContent = r.length + ' result(s)';
      bus.emit('search.run', { q: inp.value, count: r.length });
      if (!inp.value) return;
      if (!r.length) { res.appendChild(el('p', '', 'No matching URI. Try: camera, update, privacy, snip, wifi, store.')); return; }
      detailsView({ body: res, st: w.st }, r);
    }
    bar.querySelector('button').onclick = run; inp.oninput = run; inp.focus(); bus.emit('search.focused', {}); if (q) run();
  }
  window.openSearch = openSearch;

  // ====================== HELP ======================
  function renderHelp(b) {
    b.className = 'body help';
    b.innerHTML = '<h3>What is a URI protocol?</h3><p>Links such as <code>ms-settings:display</code> ask Windows to open an app or Settings page.</p>'
      + '<h3>Why does my browser ask for permission?</h3><p>Browsers confirm before handing a URI to an external app. Approve it to let Windows open the target.</p>'
      + '<h3>Why did nothing open?</h3><p>Possible causes: cancelled prompt, missing app, unsupported Windows build, blocked policy, or unregistered handler.</p>'
      + '<h3>Copy into Win+R</h3><p>Use Copy, then paste into Win+R or a browser address bar on Windows.</p>'
      + '<h3>Templates</h3><p>Template links need real values (file path, product ID). Use the editor before launching.</p>'
      + '<h3>Try these first</h3><p>Display Settings, Bluetooth, Paint, Calculator, Store Home, Snipping Tool, Windows Update, Camera Privacy.</p>'
      + '<p id="asst-state"></p>';
  }

  // ====================== DESKTOP ======================
  function buildDesktop() {
    var grid = $('#deskgrid'); var first = ['apps','settings','capture','store','system','network'];
    GROUPS.forEach(function (g) {
      var d = el('div', 'deskicon'); d.tabIndex = 0; d.innerHTML = '<div class="ic">' + window.getIcon(g.icon) + '</div><span class="lbl">' + g.title + '</span>';
      d.onclick = function () { selDesk(d); window.STATUS_MSG(g.blurb); if (window.innerWidth < 760) openGroup(g.id); };
      d.ondblclick = function () { openGroup(g.id); };
      d.onkeydown = function (e) { if (e.key === 'Enter') openGroup(g.id); };
      grid.appendChild(d);
    });
  }
  function selDesk(d) { Array.prototype.forEach.call(document.querySelectorAll('.deskicon.sel'), function (x) { x.classList.remove('sel'); }); d.classList.add('sel'); }

  // ====================== MENU ======================
  function menu() {
    var defs = {
      File: [['Open Selected', function () { var s = $('.deskicon.sel'); if (s) s.dispatchEvent(new Event('dblclick')); }], ['Close Window', function () { if (active) closeWindow(active); }], ['sep'], ['Exit Demo', function () { closeAll(); dialog('Exit', el('p', '', '<p>It is now safe to close this browser tab.</p>')); }]],
      View: [['Desktop Icons', function () {}], ['All Links', function () { openGroup('all'); }], ['Arrange Windows', arrange], ['Close All', closeAll]],
      Search: [['Find...', function () { openSearch(''); }], ['Clear Search', function () { closeWindow('search'); }]],
      Assistant: [['Show Clippy', function () { CLIPPY.show(); }], ['Hide Clippy', function () { CLIPPY.hide(); }], ['Mute Tips', function () { CLIPPY.mute(); }], ['Help', function () { CLIPPY.manualHelp(); }]],
      Help: [['Help Topics', function () { openGroup('help'); }], ['About', function () { dialog('About', el('div', '', '<p><b>Program Manager - Windows URI Launcher</b></p><p>Retro Windows 3.11 launcher for ' + L.length + ' Windows URI links.</p>')); }], ['What is a URI?', function () { openGroup('help'); }]]
    };
    var bar = el('ul'); bar.setAttribute('role', 'menubar');
    Object.keys(defs).forEach(function (name) {
      var top = el('li'); top.tabIndex = 0; top.setAttribute('aria-haspopup', 'true'); top.appendChild(document.createTextNode(name));
      var ul = el('ul'); ul.setAttribute('role', 'menu');
      defs[name].forEach(function (mi) {
        if (mi[0] === 'sep') { var s = el('li'); s.setAttribute('role', 'separator'); ul.appendChild(s); return; }
        var li = el('li'); li.tabIndex = 0; li.textContent = mi[0]; li.onclick = function () { mi[1](); li.blur(); }; ul.appendChild(li);
      });
      top.appendChild(ul); bar.appendChild(top);
    });
    $('#menubar').appendChild(bar);
  }

  // ====================== INIT ======================
  function init() {
    buildDesktop(); menu(); renderTaskbar();
    if (plat !== 'windows') { var b = $('#banner'); b.classList.add('show'); b.textContent = plat === 'other' ? 'This browser does not look like Windows. Launch links may not open apps, but you can still browse and copy URIs.' : 'Platform detection is inconclusive. Windows-specific URIs may not open here.'; }
    window.STATUS_MSG('Ready - Double-click a group to open a launcher window.');
    document.addEventListener('keydown', function (e) {
      var t = e.target.tagName; if (e.key === '/' && t !== 'INPUT' && t !== 'TEXTAREA') { e.preventDefault(); openSearch(''); }
    });
    bus.emit('app.ready', { platform: plat });
  }
  if (document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);
})();
