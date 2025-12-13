(function (B) {
  if (!B.guardInit('scene')) return;

  const dom = B.dom;

  function ensureMask(cavityPath) {
    let mask = dom.get('cavityMask');
    if (!mask) {
      const svg = dom.get('svgRoot');
      if (!svg) return null;
      const defs = svg.querySelector('defs') || (() => {
        const d = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        svg.insertBefore(d, svg.firstChild);
        return d;
      })();
      mask = document.createElementNS('http://www.w3.org/2000/svg', 'mask');
      mask.id = 'cavity-mask';
      defs.appendChild(mask);
    }

    if (!mask.querySelector('use')) {
      const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      use.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#cavity-path');
      use.setAttribute('href', '#cavity-path');
      // Force white fill for the mask, overriding any gradient on the path
      use.style.fill = 'white';
      use.style.stroke = 'none';
      use.style.opacity = '1';
      mask.appendChild(use);
    }
    return mask;
  }

  function initScene() {
    const svg = dom.get('svgRoot');
    const cavityPath = dom.get('cavityPath');
    const brainLayer = dom.get('brainTextLayer');
    const rim = dom.get('rim');
    const rimTop = dom.get('rimTop');

    if (!svg || !cavityPath || !brainLayer) {
      return null;
    }

    const mask = ensureMask(cavityPath);
    if (mask) {
      brainLayer.parentElement?.setAttribute('mask', 'url(#cavity-mask)');
    }

    // Keep rim above brain contents
    if (rim && rim.parentNode) rim.parentNode.appendChild(rim);
    if (rimTop && rimTop.parentNode) rimTop.parentNode.appendChild(rimTop);

    return {
      svg,
      cavityPath,
      brainLayer,
      rim,
      rimTop,
      mask,
    };
  }

  B.scene = { initScene };
})(window.BrainJoke);
