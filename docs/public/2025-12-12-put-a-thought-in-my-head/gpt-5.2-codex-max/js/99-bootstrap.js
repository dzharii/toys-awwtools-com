(function () {
  'use strict';

  var BT = window.BrainToy;
  if (!BT) return;

  function showError(message) {
    var errorBox = BT.services.dom.byId('errorBox');
    if (!errorBox) return;
    errorBox.hidden = false;
    BT.util.safeSetText(errorBox, message);
  }

  function updateMeter(occupancy) {
    var dom = BT.services.dom;
    var fill = dom.byId('occupancyFill');
    var pct = dom.byId('occupancyPct');
    var bar = dom.byId('occupancyBar');
    var p = Math.round(BT.util.clamp(occupancy, 0, 1) * 100);
    if (fill) fill.style.width = p + '%';
    if (pct) BT.util.safeSetText(pct, p + '%');
    if (bar) bar.setAttribute('aria-valuenow', String(p));
  }

  function requestLayout(reason) {
    var metrics = BT.services.geometry.measureCavity();
    if (!metrics) return;
    var plan = BT.services.textLayout.layoutText(BT.state.text, metrics);
    var isFirst = BT.state.lastPlan && BT.state.lastPlan.mode === 'empty' && plan.mode !== 'empty';

    BT.services.brainRenderer.render(plan, { appear: isFirst, reason: reason });
    BT.state.lastPlan = plan;
    BT.state.occupancy = plan.occupancy || 0;
    updateMeter(BT.state.occupancy);
    if (BT.config.debug && BT.services.debug && BT.services.debug.refreshOverlay) {
      BT.services.debug.refreshOverlay();
    }
  }

  function init() {
    if (BT.state.booted) return;
    BT.state.booted = true;

    var required = [
      'brainToySvg',
      'cavityPath',
      'brainHost',
      'skullRim',
      'pupil',
      'thoughtInput',
      'occupancyFill',
      'occupancyPct',
      'occupancyBar',
      'emptyHint',
    ];
    var res = BT.services.dom.validate(required);
    if (!res.ok) {
      showError('Missing required elements: ' + res.missing.join(', '));
      return;
    }

    try {
      BT.services.sceneState = BT.services.scene.initScene();
      BT.services.input.initInput();
      if (BT.services.scheduler && BT.services.scheduler.initGlobalListeners) {
        BT.services.scheduler.initGlobalListeners();
      }

      var reducedToggle = BT.services.dom.byId('reducedMotionToggle');
      var prefersReduced =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced && reducedToggle && !reducedToggle.checked) {
        reducedToggle.checked = true;
      }
      if (BT.services.scheduler && BT.services.scheduler.setReducedMotion) {
        BT.services.scheduler.setReducedMotion(!!(reducedToggle && reducedToggle.checked));
      }

      BT.services.input.onTextChange(function () {
        if (BT.services.scheduler) BT.services.scheduler.scheduleLayoutUpdate('input');
        else requestLayout('input');
      });

      requestLayout('boot');

      if (BT.services.characterAnim && BT.services.characterAnim.startIdle && !BT.config.motion.reduced) {
        BT.services.characterAnim.startIdle();
      }
    } catch (err) {
      showError('Brain malfunction: ' + (err && err.message ? err.message : String(err)));
      throw err;
    }
  }

  BT.services.bootstrap = { init: init, requestLayout: requestLayout };

  document.addEventListener('DOMContentLoaded', init);
})();
