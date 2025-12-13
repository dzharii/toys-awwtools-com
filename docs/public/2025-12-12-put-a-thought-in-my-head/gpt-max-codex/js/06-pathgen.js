(function (B) {
  if (!B.guardInit('pathgen')) return;

  // Helper to generate a snake-like path that fills the box
  function generateSnake(box, density) {
    const points = [];

    // Density determines rows
    // Level 1: 3 rows (big text)
    // Level 2: 6 rows
    // Level 3: 10 rows
    const rows = density === 1 ? 3 : (density === 2 ? 6 : 10);

    // Inset slightly more to be safe
    const safeW = box.width * 0.9;
    const safeH = box.height * 0.9;
    const startX = box.x + (box.width - safeW) / 2;
    const startY = box.y + (box.height - safeH) / 2;

    const rowHeight = safeH / rows;

    for (let r = 0; r < rows; r++) {
      const y = startY + (r + 0.5) * rowHeight;
      const isRight = r % 2 === 0;

      // Add points across the row
      const steps = 8;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const xT = isRight ? t : (1 - t);
        const x = startX + xT * safeW;

        // Add a gentle wave
        const wave = Math.sin(t * Math.PI * 1.5) * (rowHeight * 0.1);

        points.push({ x, y: y + wave });
      }

      // Add a turning point if not the last row
      if (r < rows - 1) {
        const nextY = startY + (r + 1.5) * rowHeight;
        const turnX = isRight ? (startX + safeW) : startX;
        // Control point for turn?
        // We just add points, the spline handles the curve.
        // Add an intermediate point for the turn
        points.push({ x: turnX, y: (y + nextY) / 2 });
      }
    }

    return points;
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

  function generatePathsForDensity(densityLevel, cavityMetrics) {
    const metrics = cavityMetrics || B.state.cavityMetrics;
    if (!metrics) return [];

    const box = metrics.insetBox || metrics.bbox;
    const points = generateSnake(box, densityLevel);

    // Ensure we have enough points
    if (!points || points.length < 2) {
       // Fallback to a simple line across center
       const cy = box.y + box.height / 2;
       return [`M${box.x} ${cy} L${box.x + box.width} ${cy}`];
    }

    const d = catmullRomToBezier(points);
    return [d];
  }

  B.pathgen = { generatePathsForDensity };
})(window.BrainJoke);
