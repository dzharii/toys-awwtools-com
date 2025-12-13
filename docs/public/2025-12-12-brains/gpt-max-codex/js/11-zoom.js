(function (B) {
  if (!B.guardInit('zoom')) return;

  const dom = B.dom;

  let viewBox = { x: 0, y: 0, w: 800, h: 800 };
  let isDragging = false;
  let startPoint = { x: 0, y: 0 };
  let currentScale = 1;

  function getPointFromEvent(e, svg) {
    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    return point.matrixTransform(svg.getScreenCTM().inverse());
  }

  function updateViewBox(svg) {
    svg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);
  }

  function initZoom() {
    const svg = dom.get('svgRoot');
    if (!svg) return;

    // Initialize viewBox from current attribute
    const vb = svg.getAttribute('viewBox').split(' ').map(parseFloat);
    if (vb.length === 4) {
      viewBox = { x: vb[0], y: vb[1], w: vb[2], h: vb[3] };
    }

    svg.addEventListener('wheel', (e) => {
      e.preventDefault();
      const w = viewBox.w;
      const h = viewBox.h;
      const mx = e.offsetX; // Mouse relative to SVG element
      const my = e.offsetY;

      // We need to zoom towards the mouse pointer.
      // But since we are manipulating viewBox, it's a bit tricky with just offsetX/Y if the SVG is scaled by CSS.
      // Let's use a simpler approach: Zoom towards center of view, or use the point logic.

      const dw = w * Math.sign(e.deltaY) * 0.1;
      const dh = h * Math.sign(e.deltaY) * 0.1;

      // Clamp zoom
      if (viewBox.w + dw < 100 || viewBox.w + dw > 2000) return;

      // Simple center zoom for now to be robust
      // viewBox.x -= dw / 2;
      // viewBox.y -= dh / 2;
      // viewBox.w += dw;
      // viewBox.h += dh;

      // Mouse-centric zoom
      // 1. Get mouse position in SVG coordinates *before* zoom
      // We can't easily get exact SVG coords without CTM, but we can approximate if we assume the SVG fills the container.
      // Let's stick to a robust center-zoom or simple pan-zoom.

      // Let's try the standard viewBox zoom logic
      const scaleFactor = e.deltaY > 0 ? 1.1 : 0.9;

      // New width and height
      const newW = viewBox.w * scaleFactor;
      const newH = viewBox.h * scaleFactor;

      // Mouse position ratio within the element
      const rect = svg.getBoundingClientRect();
      const mouseXRel = (e.clientX - rect.left) / rect.width;
      const mouseYRel = (e.clientY - rect.top) / rect.height;

      // Calculate new X and Y to keep mouse position stable
      viewBox.x += (viewBox.w - newW) * mouseXRel;
      viewBox.y += (viewBox.h - newH) * mouseYRel;
      viewBox.w = newW;
      viewBox.h = newH;

      updateViewBox(svg);
    }, { passive: false });

    svg.addEventListener('mousedown', (e) => {
      isDragging = true;
      startPoint = { x: e.clientX, y: e.clientY };
      svg.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      e.preventDefault();

      const dx = e.clientX - startPoint.x;
      const dy = e.clientY - startPoint.y;

      startPoint = { x: e.clientX, y: e.clientY };

      // Convert screen pixels to viewBox units
      const rect = svg.getBoundingClientRect();
      const scaleX = viewBox.w / rect.width;
      const scaleY = viewBox.h / rect.height;

      viewBox.x -= dx * scaleX;
      viewBox.y -= dy * scaleY;

      updateViewBox(svg);
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
      svg.style.cursor = 'grab';
    });

    svg.style.cursor = 'grab';
  }

  B.zoom = { initZoom };
})(window.BrainJoke);
