(function () {
  "use strict";

  var BJ = window.BrainJoke;
  if (!BJ) return;

  function fail(dom, message) {
    dom.fatalError.hidden = false;
    dom.fatalErrorMsg.textContent = message;
  }

  function updateMeter(dom, occupancy) {
    var pct = Math.round(BJ.util.clamp(occupancy, 0, 1) * 100);
    dom.meterFill.style.width = pct + "%";
    dom.meterPct.textContent = pct + "%";
  }

  function computeAndRender(reason) {
    var dom = BJ.services.dom.ready();
    if (!BJ.state.cavityMetrics || reason === "resize") BJ.state.cavityMetrics = BJ.services.geometry.measureCavity();
    var plan = BJ.services.textLayout.layoutText(BJ.state.text, BJ.state.cavityMetrics);
    BJ.services.brainRenderer.render(plan, { ripple: reason === "input", animated: true });
    updateMeter(dom, plan.occupancy || 0);
    if (BJ.debug && BJ.debug._draw && BJ.state.cavityMetrics && BJ.debug.isOn && BJ.debug.isOn()) {
      BJ.debug._draw(BJ.state.lastPlan, BJ.state.cavityMetrics);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var dom = BJ.services.dom.ready();
    if (!dom.ok) {
      // Minimal fallback, even if fatalError nodes are missing.
      // eslint-disable-next-line no-console
      console.error("Missing required DOM ids:", dom.missing);
      return;
    }

    try {
      BJ.services.scene.initScene();

      var prefersReduced = false;
      try {
        prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      } catch (e) {
        prefersReduced = false;
      }

      BJ.services.scheduler.setReducedMotion(prefersReduced);
      dom.reducedMotionToggle.checked = prefersReduced;

      BJ.ui.input.init();
      BJ.state.text = "";

      dom.reducedMotionToggle.addEventListener("change", function () {
        BJ.services.scheduler.setReducedMotion(dom.reducedMotionToggle.checked);
      });

      dom.wiggleToggle.addEventListener("change", function () {
        BJ.state.wiggleMode = dom.wiggleToggle.checked;
      });

      BJ.ui.input.onTextChange(function (text) {
        BJ.state.text = text;
        BJ.services.scheduler.scheduleLayoutUpdate(function () {
          computeAndRender("input");
        });
      });

      window.addEventListener("resize", function () {
        BJ.services.scheduler.scheduleLayoutUpdate(function () {
          computeAndRender("resize");
        });
      });

      document.addEventListener("keydown", function (e) {
        if (e.key === "d" || e.key === "D") BJ.debug.toggleDebug();
      });

      BJ.services.characterAnim.startIdle();

      computeAndRender("init");
      BJ.state.initialized = true;

      var qs = new URLSearchParams(window.location.search);
      if (qs.get("debug") === "1") BJ.debug.toggleDebug(true);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      fail(dom, err && err.message ? err.message : "Initialization failed.");
    }
  });
})();
