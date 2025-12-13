(function (B) {
  if (!B.guardInit('textLayout')) return;

  const dom = B.dom;
  const cfg = B.config;
  const util = B.util;
  const geometry = B.geometry;
  const pathgen = B.pathgen;

  const svgNS = 'http://www.w3.org/2000/svg';

  function chooseDensity(len) {
    // Adjust effective length based on zoom
    // If zoom is high, we want to behave as if text is longer (to trigger higher density)
    const zoom = Math.max(1, B.state.zoom || 1);
    const effectiveLen = len * Math.sqrt(zoom);

    if (effectiveLen <= cfg.density.level1Max) return 1;
    if (effectiveLen <= cfg.density.level2Max) return 2;
    return 3;
  }

  function measurePathLength(d) {
    const svg = dom.get('svgRoot');
    if (!svg) return 1;
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    svg.appendChild(path);
    const len = path.getTotalLength() || 1;
    svg.removeChild(path);
    return len;
  }

  function splitTextAcrossPaths(text, lengths) {
    if (lengths.length === 1) return [text];
    const total = lengths.reduce((sum, n) => sum + n, 0);
    const pieces = [];
    let cursor = 0;
    lengths.forEach((len, idx) => {
      const take = Math.round((len / total) * text.length);
      const slice = text.slice(cursor, cursor + take);
      pieces.push(slice);
      cursor += take;
    });
    // ensure last piece takes remainder
    const remainder = text.slice(cursor);
    if (remainder) {
      pieces[pieces.length - 1] += remainder;
    }
    return pieces;
  }

  function computeFontSize(len, metrics) {
    const zoom = Math.max(1, B.state.zoom || 1);
    const base = Math.sqrt(metrics.area || 40000) * 0.9;
    const size = base / Math.sqrt(Math.max(1, len * 0.8));

    // Scale font size down as zoom increases
    // "Scaled 2x slower" -> size / sqrt(zoom)
    const zoomedSize = size / Math.sqrt(zoom);

    return util.clamp(zoomedSize, cfg.fonts.minSize, cfg.fonts.maxSize);
  }

  function layoutText(text) {
    const clean = (text || '').trim();
    const metrics = geometry.measureCavity();
    if (!clean.length || !metrics) {
      return { empty: true, metrics };
    }

    const density = chooseDensity(clean.length);
    const paths = pathgen.generatePathsForDensity(density, metrics);
    const lengths = paths.map(measurePathLength);
    const chunks = splitTextAcrossPaths(clean, lengths);

    const fontSize = computeFontSize(clean.length, metrics);
    const occupancy = Math.min(1, Math.tanh(clean.length / 90));

    return {
      empty: false,
      text: clean,
      density,
      fontSize,
      metrics,
      occupancy,
      segments: paths.map((d, idx) => ({
        d,
        text: chunks[idx] || '',
        length: lengths[idx],
      })),
    };
  }

  B.textLayout = { layoutText };
})(window.BrainJoke);
