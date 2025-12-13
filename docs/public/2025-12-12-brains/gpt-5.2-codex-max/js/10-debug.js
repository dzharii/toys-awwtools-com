(function () {
  'use strict';

  var BT = window.BrainToy;
  if (!BT) return;

  var overlay = null;

  function ensureOverlay(scene) {
    if (overlay) return overlay;
    overlay = BT.util.svgEl('g');
    overlay.id = 'debugOverlay';
    overlay.setAttribute('opacity', '0.9');
    overlay.style.display = 'none';
    scene.brainGroup.appendChild(overlay);
    return overlay;
  }

  function toggleDebug(on) {
    BT.config.debug = on === undefined ? !BT.config.debug : !!on;
    var scene = BT.services.sceneState;
    if (!scene) return;
    var ov = ensureOverlay(scene);
    ov.style.display = BT.config.debug ? 'block' : 'none';
    if (BT.config.debug) refreshOverlay();
  }

  function refreshOverlay() {
    var scene = BT.services.sceneState;
    if (!scene || !overlay) return;
    while (overlay.firstChild) overlay.removeChild(overlay.firstChild);
    var metrics = BT.services.geometry.measureCavity();
    if (!metrics) return;

    var rect = BT.util.svgEl('rect');
    rect.setAttribute('x', metrics.inset.x);
    rect.setAttribute('y', metrics.inset.y);
    rect.setAttribute('width', metrics.inset.width);
    rect.setAttribute('height', metrics.inset.height);
    rect.setAttribute('fill', 'none');
    rect.setAttribute('stroke', '#ff4fa1');
    rect.setAttribute('stroke-width', '2');
    overlay.appendChild(rect);

    var cavityOutline = BT.util.svgEl('path');
    cavityOutline.setAttribute('d', metrics.cavityPath.getAttribute('d') || '');
    cavityOutline.setAttribute('fill', 'none');
    cavityOutline.setAttribute('stroke', 'rgba(255, 79, 161, 0.55)');
    cavityOutline.setAttribute('stroke-width', '2');
    cavityOutline.setAttribute('stroke-dasharray', '8 6');
    overlay.appendChild(cavityOutline);

    var activeKey = scene.activeLayerKey || 'A';
    var activeLayer = scene.layers && scene.layers[activeKey];
    if (activeLayer && activeLayer.path) {
      var d = activeLayer.path.getAttribute('d') || '';
      if (d && d !== 'M 0 0') {
        var p = BT.util.svgEl('path');
        p.setAttribute('d', d);
        p.setAttribute('fill', 'none');
        p.setAttribute('stroke', 'rgba(108, 65, 255, 0.85)');
        p.setAttribute('stroke-width', '2.5');
        p.setAttribute('stroke-linecap', 'round');
        p.setAttribute('stroke-linejoin', 'round');
        overlay.appendChild(p);

        if (typeof activeLayer.path.getTotalLength === 'function') {
          var total = activeLayer.path.getTotalLength();
          var dots = 14;
          for (var i = 0; i <= dots; i++) {
            var pt = activeLayer.path.getPointAtLength((total * i) / dots);
            var c = BT.util.svgEl('circle');
            c.setAttribute('cx', pt.x);
            c.setAttribute('cy', pt.y);
            c.setAttribute('r', i === 0 || i === dots ? '3.2' : '2.2');
            c.setAttribute('fill', i === 0 ? '#00c2a8' : i === dots ? '#ff4fa1' : 'rgba(108, 65, 255, 0.45)');
            overlay.appendChild(c);
          }
        }
      }
    }
  }

  function runSmokeTests() {
    var samples = [
      '',
      'A',
      'tiny thought',
      'https://example.com/something?brain=true#lol',
      'This is a slightly longer paragraph of words that should coil up nicely inside the head cavity.',
      Array(800).join('brains '),
    ];

    var dom = BT.services.dom;
    var input = dom.byId('thoughtInput');
    if (!input) return { ok: false, error: 'missing input' };

    var results = [];
    var failed = [];
    for (var i = 0; i < samples.length; i++) {
      var clean = BT.services.input.normalizeText(samples[i]);
      var metrics = BT.services.geometry.measureCavity();
      var plan = BT.services.textLayout.layoutText(clean, metrics);
      results.push({
        i: i,
        len: clean.length,
        mode: plan.mode,
        fontSize: Math.round(plan.fontSize),
        rows: plan.rows || 0,
      });

      var expected = i === 0 ? 'empty' : i === 1 ? 'hero' : i === 2 ? 'band' : 'snake';
      if (plan.mode !== expected) failed.push({ i: i, expected: expected, got: plan.mode });
      if (expected !== 'empty' && (!plan.pathD || plan.pathD === 'M 0 0')) {
        failed.push({ i: i, expected: 'non-trivial path', got: plan.pathD || '' });
      }
    }

    // eslint-disable-next-line no-console
    console.table(results);
    if (failed.length) {
      // eslint-disable-next-line no-console
      console.warn('[BrainToy] Smoke test failures:', failed);
    }
    return { ok: failed.length === 0, results: results, failed: failed };
  }

  BT.services.debug = {
    toggleDebug: toggleDebug,
    runSmokeTests: runSmokeTests,
    refreshOverlay: refreshOverlay,
  };
})();
