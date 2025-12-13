(function (B) {
  if (!B.guardInit('pathgen')) return;

  const templates = {
    1: [
      [0.1, 0.62],
      [0.36, 0.28],
      [0.8, 0.34],
      [0.86, 0.58],
      [0.6, 0.76],
      [0.2, 0.64],
    ],
    2: [
      [0.12, 0.64],
      [0.32, 0.42],
      [0.66, 0.28],
      [0.86, 0.44],
      [0.76, 0.62],
      [0.44, 0.7],
      [0.2, 0.54],
    ],
    3: [
      [
        [0.12, 0.24],
        [0.4, 0.18],
        [0.78, 0.26],
        [0.84, 0.48],
        [0.58, 0.58],
        [0.24, 0.5],
      ],
      [
        [0.14, 0.68],
        [0.42, 0.72],
        [0.78, 0.8],
        [0.74, 0.92],
        [0.4, 0.88],
        [0.18, 0.72],
      ],
    ],
  };

  function scalePoint(pt, box) {
    return {
      x: box.x + pt[0] * box.width,
      y: box.y + pt[1] * box.height,
    };
  }

  function catmullRomToBezier(points) {
    if (points.length < 2) return '';
    const path = [`M${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`];
    for (let i = 0; i < points.length - 1; i += 1) {
      const p0 = points[i - 1] || points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      path.push(
        `C${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
      );
    }
    return path.join(' ');
  }

  function buildPath(points, box) {
    const scaled = points.map((pt) => scalePoint(pt, box));
    return catmullRomToBezier(scaled);
  }

  function generatePathsForDensity(densityLevel, cavityMetrics) {
    const metrics = cavityMetrics || B.state.cavityMetrics;
    if (!metrics) return [];
    const box = metrics.insetBox || metrics.bbox;
    const template = templates[densityLevel] || templates[2];
    if (Array.isArray(template[0][0])) {
      return template.map((points) => buildPath(points, box));
    }
    return [buildPath(template, box)];
  }

  B.pathgen = { generatePathsForDensity };
})(window.BrainJoke);
