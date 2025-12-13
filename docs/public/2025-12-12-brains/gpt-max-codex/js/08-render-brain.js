(function (B) {
  if (!B.guardInit('renderBrain')) return;

  const dom = B.dom;
  const cfg = B.config;
  const svgNS = 'http://www.w3.org/2000/svg';

  let activeInstance = null;
  let pathIdCounter = 0;

  function updateDecorations(isFilled) {
    const shimmer = dom.get('shimmer');
    const dust = dom.get('dust');
    const web = dom.get('web');
    if (shimmer) shimmer.style.opacity = isFilled ? '0.12' : '0.6';
    if (dust) dust.style.opacity = isFilled ? '0.12' : '0.55';
    if (web) web.style.opacity = isFilled ? '0.15' : '0.65';
    const wrap = document.querySelector('.svg-wrap');
    if (wrap) wrap.classList.toggle('filled', isFilled);
  }

  function makeSegmentNodes(segment, fontSize) {
    const path = document.createElementNS(svgNS, 'path');
    const pathId = `brain-path-${pathIdCounter += 1}`;
    path.id = pathId;
    path.setAttribute('d', segment.d);
    path.setAttribute('fill', 'none');

    const text = document.createElementNS(svgNS, 'text');
    text.setAttribute('font-size', fontSize.toFixed(1));
    text.setAttribute('font-weight', segment.text.length <= 3 ? '800' : '700');

    const textPath = document.createElementNS(svgNS, 'textPath');
    textPath.setAttribute('href', `#${pathId}`);
    textPath.setAttribute('startOffset', '2%');
    const minLen = segment.length * 0.35;
    const maxLen = segment.length * 0.96;
    const desired = fontSize * (segment.text.length + 2);
    const targetLength = Math.min(maxLen, Math.max(minLen, desired));
    textPath.setAttribute('textLength', targetLength.toFixed(1));
    textPath.setAttribute('lengthAdjust', 'spacing');
    textPath.textContent = segment.text || ' ';

    text.appendChild(textPath);
    return { path, text };
  }

  function clearBrain(animated = true) {
    if (!activeInstance) return;
    const node = activeInstance;
    if (animated) {
      node.style.opacity = '0';
      node.style.transform = 'scale(0.88)';
      setTimeout(() => node.remove(), cfg.animation.fadeDuration + 40);
    } else {
      node.remove();
    }
    activeInstance = null;
    B.state.hasBrain = false;
    updateDecorations(false);
  }

  function render(plan, options = {}) {
    if (!plan || plan.empty) {
      clearBrain(true);
      return;
    }
    const layer = dom.get('brainTextLayer');
    if (!layer) return;

    const instance = document.createElementNS(svgNS, 'g');
    instance.classList.add('brain-text-instance', 'brain-reflow');
    instance.style.opacity = '0';
    instance.style.transform = options.first ? 'scale(0.84)' : 'scale(1.02)';

    plan.segments.forEach((segment) => {
      const { path, text } = makeSegmentNodes(segment, plan.fontSize);
      instance.appendChild(path);
      instance.appendChild(text);
    });

    layer.appendChild(instance);
    // fade previous instance
    if (activeInstance) {
      activeInstance.style.opacity = '0';
      activeInstance.style.transform = 'scale(0.96)';
      setTimeout(() => activeInstance && activeInstance.remove(), cfg.animation.fadeDuration + 60);
    }

    requestAnimationFrame(() => {
      instance.style.opacity = '1';
      instance.style.transform = 'scale(1)';
    });

    activeInstance = instance;
    B.state.hasBrain = true;
    updateDecorations(true);
  }

  B.renderBrain = { render, clearBrain };
})(window.BrainJoke);
