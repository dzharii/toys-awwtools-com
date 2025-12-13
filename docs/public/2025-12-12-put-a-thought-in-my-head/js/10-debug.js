(function (B) {
  if (!B.guardInit('debug')) return;

  const cfg = B.config;
  const dom = B.dom;

  function ensureOverlay() {
    const svg = dom.get('svgRoot');
    if (!svg) return null;
    let layer = svg.querySelector('#debug-layer');
    if (!layer) {
      layer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      layer.id = 'debug-layer';
      svg.appendChild(layer);
    }
    return layer;
  }

  function renderOverlay(plan) {
    const layer = ensureOverlay();
    if (!layer) return;
    layer.innerHTML = '';
    if (!cfg.debug || !plan || plan.empty) return;

    const inset = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    inset.setAttribute('d', B.geometry.getInsetPath());
    inset.setAttribute('fill', 'none');
    inset.setAttribute('stroke', '#ff7f50');
    inset.setAttribute('stroke-width', '2');
    inset.setAttribute('stroke-dasharray', '6 6');
    inset.setAttribute('opacity', '0.6');
    layer.appendChild(inset);

    plan.segments.forEach((segment, idx) => {
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', segment.d);
      p.setAttribute('fill', 'none');
      p.setAttribute('stroke', idx % 2 === 0 ? '#4cc9f0' : '#f72585');
      p.setAttribute('stroke-width', '2');
      p.setAttribute('opacity', '0.8');
      layer.appendChild(p);
    });
  }

  function toggleDebug(flag, plan) {
    cfg.debug = flag;
    renderOverlay(plan);
  }

  function runSmokeTests() {
    const cases = [
      '',
      'A',
      'Tiny brain',
      'https://example.com/that/needs/wrapping',
      'This is a slightly longer paragraph that really wants to fill the cavity in a pleasing coil with round turns.',
      'Super'.repeat(120),
    ];
    cases.forEach((sample) => {
      const plan = B.textLayout.layoutText(sample);
      const status = plan.empty ? 'empty' : `density=${plan.density} font=${plan.fontSize.toFixed(1)}`;
      console.log('[SmokeTest]', sample.slice(0, 30), '->', status);
    });
  }

  B.debug = { toggleDebug, runSmokeTests, renderOverlay };
})(window.BrainJoke);
