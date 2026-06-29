// Clippy assistant controller - event-driven, rate-limited, graceful
(function () {
  'use strict';
  var bus = window.BUS, plat = window.PLATFORM;
  var agent = null, hidden = false, muted = false;
  var seen = {}, lastTip = 0, tips = [], suppressUntil = 0, launchCount = {}, copyCount = 0, openCount = 0;
  var COOL = 20000, WINDOW = 300000, MAX = 5;

  function now() { return Date.now(); }
  function canAuto() {
    var t = now(); if (hidden || muted || t < suppressUntil) return false;
    if (t - lastTip < COOL) return false;
    tips = tips.filter(function (x) { return t - x < WINDOW; });
    return tips.length < MAX;
  }
  function say(id, msg, opt) {
    opt = opt || {}; if (hidden) return;
    if (!opt.manual && !opt.critical) { if (seen[id]) return; if (!canAuto()) return; }
    seen[id] = 1; lastTip = now(); tips.push(lastTip);
    window.STATUS_MSG(msg);
    if (agent) { try { agent.show(); agent.speak(msg); agent.play('Greeting'); } catch (e) {} }
  }
  window.CLIPPY = {
    hide: function () { hidden = true; if (agent) try { agent.hide(); } catch (e) {} window.STATUS_MSG('Assistant hidden for this session.'); },
    show: function () { hidden = false; if (agent) try { agent.show(); } catch (e) {} },
    mute: function () { muted = !muted; window.STATUS_MSG(muted ? 'Automatic tips muted. Manual Help remains available.' : 'Automatic tips enabled.'); },
    manualHelp: function () { say('help', 'This launcher organizes Windows URI links into retro program groups. Open a group, select an item, then launch or copy its URI.', { manual: true }); }
  };

  // ---- subscribe events ----
  bus.on('app.ready', function (p) {
    setTimeout(function () {
      if (plat === 'windows') say('first', 'Double-click a program group to open it. Launch links ask Windows to open real apps, Settings pages, or system surfaces.', { critical: true });
      else if (plat === 'other') say('first', 'This system does not appear to be Windows. You can browse and copy URI links, but launch buttons may not open Windows apps here.', { critical: true });
      else say('first', 'Platform detection is inconclusive. Launch links are still available, but Windows-specific URIs may not open on this system.', { critical: true });
    }, 1200);
    setTimeout(function () { if (!openCount) say('idle', 'Start with Capture for a visible demo, or open Settings if you want practical Windows shortcuts.'); }, 45000);
  });
  bus.on('window.opened', function (p) { openCount = p.count; if (p.count === 1) say('firstwin', 'Group windows collect related URI launchers. Select an item to see its URI and limitations in the status bar.'); if (p.count > 5) say('many', 'Use Arrange Windows to clean up the desktop without closing your groups.'); });
  bus.on('category.opened', function (p) { var m = window.CLIPPY_FIRST[p.categoryId]; if (m) say('cat-' + p.categoryId, m); });
  bus.on('item.templateSelected', function () { say('tmpl', 'This URI needs values before it can launch. Open Details to fill the placeholders.'); });
  bus.on('item.selected', function (p) { var s = p.item.status.join(' '); if (/Deprecated/.test(s)) say('dep', 'This link may be unavailable on current Windows builds.'); else if (/Legacy/.test(s)) say('leg', 'Legacy links are kept for reference and may work only on older or specially configured systems.'); else if (/Install dependent/.test(s)) say('inst', 'This link depends on the target app being installed and registered.'); else if (/Hardware/.test(s)) say('hw', 'This link depends on hardware support.'); });
  bus.on('launch.requested', function (p) {
    say('launch1', 'The browser may ask before opening an external app. Approve the prompt if you want Windows to handle this URI.');
    suppressUntil = now() + 10000;
    launchCount[p.uri] = (launchCount[p.uri] || 0) + 1;
    if (launchCount[p.uri] >= 3) say('relaunch-' + p.uri, 'If nothing opened, Windows may not have a handler for this URI. Copy it and test it from Win+R.', { critical: true });
  });
  bus.on('copy.done', function (p) { copyCount++; if (copyCount === 1) say('copy1', 'Copied. You can paste this into Win+R, a browser address bar, or a script that opens URI links on Windows.'); else if (p.template) say('copytmpl', 'Template copied. Replace placeholder values before using it as a launcher.'); });
  bus.on('copy.failed', function () { say('copyfail', 'Clipboard access is unavailable. Select the URI text and copy it manually.', { critical: true }); });
  bus.on('search.focused', function () { say('searchf', 'Search matches names, URI text, descriptions, tags, categories, and status labels.'); });
  bus.on('search.run', function (p) { if (p.q && p.count === 0) say('noresult', 'No matching URI found. Try a shorter term such as camera, update, privacy, snip, wifi, or store.'); else if (p.count > 80) say('many2', 'Many links match. Add another word or filter by Apps, Settings, Store, Legacy, or Official.'); });
  bus.on('template.placeholderLeft', function () { say('phleft', 'A placeholder is still present. Replace it before launching this URI.', { critical: true }); });
  bus.on('windows.arranged', function () { suppressUntil = now() + 3000; });

  // ---- load Clippy agent (graceful) ----
  function load() {
    if (!window.clippy || !window.$) return fail();
    clippy.BASE_PATH = 'vendor/clippy/agents/';
    clippy.load('Clippy', function (a) { agent = a; a.show(); a.moveTo(window.innerWidth - 140, window.innerHeight - 160); }, fail);
  }
  function fail() { var s = document.getElementById('asst-state'); }
  if (document.readyState !== 'loading') load(); else document.addEventListener('DOMContentLoaded', load);
})();
