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

  function updateViewBox(svg, onZoom) {
    svg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);

    // Calculate zoom level (assuming initial width 1000)
    // Zoom = 1 when width is 1000.
    // Zoom = 2 when width is 500.
    const zoom = 1000 / viewBox.w;
    B.state.zoom = zoom;

    if (onZoom) {
      onZoom(zoom);
    }
  }

  function initZoom(onZoom) {
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

      // Limit zoom range
      // Max zoom (closest): width 100 -> zoom 10
      // Min zoom (farthest): width 2000 -> zoom 0.5

      const scaleFactor = e.deltaY > 0 ? 1.1 : 0.9;
      const newW = viewBox.w * scaleFactor;

      if (newW < 100 || newW > 2000) return;

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

      updateViewBox(svg, onZoom);
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

      updateViewBox(svg, onZoom);
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
      svg.style.cursor = 'grab';
    });

    svg.style.cursor = 'grab';
  }

  B.zoom = { initZoom };
})(window.BrainJoke);
