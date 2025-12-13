(function (window) {
  if (window.BrainJoke && window.BrainJoke.__initialized) return;

  const root = window.BrainJoke || {};

  const config = {
    debug: false,
    palette: {
      text: '#2d1b54',
      accent: '#7a5cff',
    },
    density: {
      level1Max: 60,
      level2Max: 200,
    },
    fonts: {
      minSize: 24,
      maxSize: 240,
    },
    animation: {
      inflateDuration: 260,
      fadeDuration: 220,
      rippleDuration: 180,
      idleBobPx: 6,
      idleSwayDeg: 2,
      pupilHop: 8,
    },
    scheduler: {
      layoutDebounce: 80,
      maxChars: 900,
    },
  };

  const state = {
    text: '',
    hasBrain: false,
    renderId: 0,
    cavityMetrics: null,
    reducedMotion: false,
    wiggle: false,
    zoom: 1,
    __inits: {},
  };

  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const lerp = (a, b, t) => a + (b - a) * t;
  const mapRange = (value, inMin, inMax, outMin, outMax) => {
    if (inMax === inMin) return outMin;
    const t = (value - inMin) / (inMax - inMin);
    return lerp(outMin, outMax, clamp(t, 0, 1));
  };

  root.config = config;
  root.state = state;
  root.util = { clamp, lerp, mapRange };
  root.log = (...args) => {
    if (config.debug) {
      console.log('[BrainJoke]', ...args);
    }
  };
  root.guardInit = (name) => {
    if (state.__inits[name]) return false;
    state.__inits[name] = true;
    return true;
  };

  root.__initialized = true;
  window.BrainJoke = root;
})(window);
