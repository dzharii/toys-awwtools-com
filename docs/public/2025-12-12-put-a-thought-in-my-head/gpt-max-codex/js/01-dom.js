(function (B) {
  if (!B.guardInit('dom')) return;

  const ids = {
    svgRoot: 'head-svg',
    cavityPath: 'cavity-path',
    cavityMask: 'cavity-mask',
    cavityLayer: 'cavity-layer',
    brainTextLayer: 'brain-text-layer',
    headBob: 'head-bob',
    characterRoot: 'character-root',
    pupil: 'pupil',
    eyelid: 'eyelid',
    shimmer: 'cavity-shimmer',
    dust: 'cavity-dust',
    web: 'cavity-web',
    input: 'brain-input',
    inputHint: 'input-hint',
    gauge: 'gauge-fill',
    wiggle: 'wiggle-toggle',
    motionToggle: 'motion-toggle',
    rim: 'cavity-rim',
    rimTop: 'rim-top',
  };

  const refs = {};
  const idsList = Object.entries(ids);

  function collect() {
    idsList.forEach(([key, id]) => {
      refs[key] = document.getElementById(id) || null;
    });
  }

  function validate() {
    collect();
    const missing = idsList
      .filter(([key]) => !refs[key])
      .map(([key]) => key);
    return {
      ok: missing.length === 0,
      missing,
    };
  }

  function get(name) {
    if (!refs[name]) {
      refs[name] = document.getElementById(ids[name]) || null;
    }
    return refs[name];
  }

  function ready() {
    const report = validate();
    if (!report.ok) {
      console.error('Missing required elements:', report.missing);
    }
    return report.ok;
  }

  B.dom = { get, ready, validate, ids };
})(window.BrainJoke);
