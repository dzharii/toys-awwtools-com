(function (B) {
  if (!B.guardInit('geometry')) return;

  const dom = B.dom;

  function getCavityPath() {
    return dom.get('cavityPath');
  }

  function measureCavity() {
    const path = getCavityPath();
    if (!path) return null;
    const bbox = path.getBBox();
    const inset = 10;
    const insetBox = {
      x: bbox.x + inset,
      y: bbox.y + inset,
      width: Math.max(12, bbox.width - inset * 2),
      height: Math.max(12, bbox.height - inset * 2),
    };
    const metrics = {
      bbox,
      insetBox,
      area: bbox.width * bbox.height,
      length: path.getTotalLength(),
      path,
    };
    B.state.cavityMetrics = metrics;
    return metrics;
  }

  function pointAt(percent) {
    const path = getCavityPath();
    if (!path) return { x: 0, y: 0 };
    const length = path.getTotalLength();
    const p = path.getPointAtLength(Math.max(0, Math.min(1, percent)) * length);
    return { x: p.x, y: p.y };
  }

  function getInsetPath() {
    const metrics = B.state.cavityMetrics || measureCavity();
    if (!metrics) return '';
    const { x, y, width, height } = metrics.insetBox;
    const r = Math.min(width, height) * 0.14;
    return [
      `M${x + r} ${y}`,
      `H${x + width - r}`,
      `Q${x + width} ${y} ${x + width} ${y + r}`,
      `V${y + height - r}`,
      `Q${x + width} ${y + height} ${x + width - r} ${y + height}`,
      `H${x + r}`,
      `Q${x} ${y + height} ${x} ${y + height - r}`,
      `V${y + r}`,
      `Q${x} ${y} ${x + r} ${y}`,
      'Z',
    ].join(' ');
  }

  B.geometry = {
    getCavityPath,
    measureCavity,
    getInsetPath,
    pointAt,
  };
})(window.BrainJoke);
