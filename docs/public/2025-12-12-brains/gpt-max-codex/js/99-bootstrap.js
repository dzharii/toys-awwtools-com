(function (B) {
  const dom = B.dom;

  function showFatal(message) {
    const container = document.querySelector('.layout');
    if (container) {
      container.innerHTML = `<div style="padding:20px;font-family:'Baloo 2',sans-serif;color:#2d1b54;font-size:18px;">${message}</div>`;
    } else {
      alert(message); // graceful fallback
    }
  }

  function initReducedMotion() {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const toggle = dom.get('motionToggle');
    const apply = (flag) => {
      B.scheduler.setReducedMotion(flag);
      if (toggle) toggle.checked = flag;
    };
    apply(media.matches);
    media.addEventListener('change', (e) => apply(e.matches));
  }

  function startApp() {
    const ready = dom.ready();
    if (!ready) {
      showFatal('Missing required SVG pieces. The head refuses to render.');
      return;
    }

    const scene = B.scene.initScene();
    if (!scene) {
      showFatal('Could not initialize the scene.');
      return;
    }

    initReducedMotion();
    B.animCharacter.startIdle();
    B.uiInput.wire();

    function applyLayout(text) {
      const hint = dom.get('inputHint');
      hint && hint.classList.toggle('hidden', !!text);
      const plan = B.textLayout.layoutText(text);
      B.state.text = text;
      B.uiInput.setGauge(plan.empty ? 0.08 : plan.occupancy * 0.96 + 0.04);
      if (B.config.debug) {
        B.debug.renderOverlay(plan);
      }
      if (plan.empty) {
        B.renderBrain.clearBrain(true);
      } else {
        B.renderBrain.render(plan, { first: !B.state.hasBrain });
      }
    }

    B.uiInput.onTextChange((text) => {
      B.scheduler.scheduleLayoutUpdate(() => applyLayout(text));
    });

    // initial render of empty state
    applyLayout(B.uiInput.getText());

    // expose quick smoke tests to console
    window.BrainJoke.runSmokeTests = B.debug.runSmokeTests;
  }

  document.addEventListener('DOMContentLoaded', startApp);
})(window.BrainJoke);
