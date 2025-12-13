(function (B) {
  if (!B.guardInit('uiInput')) return;

  const dom = B.dom;
  const cfg = B.config;
  const state = B.state;

  const subs = [];

  function normalize(text) {
    if (!text) return '';
    return text.replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim();
  }

  function emit(value) {
    subs.forEach((fn) => {
      try {
        fn(value);
      } catch (err) {
        console.error(err);
      }
    });
  }

  function handleInput() {
    const el = dom.get('input');
    const hint = dom.get('inputHint');
    if (!el) return;
    const next = normalize(el.value.slice(0, cfg.scheduler.maxChars));
    hint && hint.classList.toggle('hidden', next.length > 0);
    emit(next);
  }

  function onTextChange(fn) {
    subs.push(fn);
  }

  function getText() {
    const el = dom.get('input');
    return normalize(el ? el.value : '');
  }

  function setText(value) {
    const el = dom.get('input');
    if (!el) return;
    el.value = value;
    handleInput();
  }

  function clearText() {
    setText('');
  }

  function wire() {
    const el = dom.get('input');
    if (el) {
      el.addEventListener('input', handleInput);
      el.addEventListener('paste', () => setTimeout(handleInput, 0));
    }

    const button = dom.get('wiggle');
    if (button) {
      button.addEventListener('click', () => {
        state.wiggle = !state.wiggle;
        button.classList.toggle('active', state.wiggle);
      });
    }

    const motionToggle = dom.get('motionToggle');
    if (motionToggle) {
      motionToggle.addEventListener('change', (e) => {
        const flag = !!e.target.checked;
        B.scheduler.setReducedMotion(flag);
      });
    }
  }

  function setGauge(fill) {
    const g = dom.get('gauge');
    if (!g) return;
    const pct = `${(fill * 100).toFixed(0)}%`;
    g.style.width = pct;
    g.style.filter = `hue-rotate(${fill * 65}deg)`;
  }

  B.uiInput = {
    wire,
    onTextChange,
    getText,
    setText,
    clearText,
    setGauge,
  };
})(window.BrainJoke);
