(function () {
  'use strict';

  if (window.BrainToy) return;

  var BrainToy = {
    version: '0.1.0',
    config: {
      debug: false,
      maxTextChars: 2200,
      ui: {
        hintHideDelayMs: 700,
      },
      motion: {
        reduced: false,
        wiggle: false,
      },
      character: {
        blink: {
          minMs: 2600,
          maxMs: 5200,
          downMs: 70,
          upMs: 110,
        },
        saccade: {
          minMs: 600,
          maxMs: 1400,
          maxOffset: 7,
          drift: 0.25,
        },
      },
      brain: {
        lineHeight: 1.28,
        minRows: 4,
        maxRows: 22,
        avgCharWidthFactor: 0.58,
        fillBias: 1.12,
        bandMaxLen: 16,
        minFont: 10,
        maxFont: 120,
        maxRepeats: 3,
        repeatSeparator: ' · ',
      },
      geometry: {
        sampleStep: 4,
        insetX: 10,
        insetY: 10,
        edgePad: 4,
      },
      transitions: {
        reflowMs: 320,
        appearMs: 460,
        drainMs: 260,
      },
    },
    state: {
      booted: false,
      text: '',
      occupancy: 0,
      lastPlan: null,
    },
    services: {},
    ui: {},
    util: {},
  };

  BrainToy.util.now = function () {
    return typeof performance !== 'undefined' ? performance.now() : Date.now();
  };

  BrainToy.util.clamp = function (value, min, max) {
    return Math.max(min, Math.min(max, value));
  };

  BrainToy.util.lerp = function (a, b, t) {
    return a + (b - a) * t;
  };

  BrainToy.util.rand = function (min, max) {
    return min + Math.random() * (max - min);
  };

  BrainToy.util.choice = function (items) {
    return items[(Math.random() * items.length) | 0];
  };

  BrainToy.util.easeOutCubic = function (t) {
    return 1 - Math.pow(1 - t, 3);
  };

  BrainToy.util.easeInOutCubic = function (t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  BrainToy.util.safeSetText = function (node, text) {
    if (!node) return;
    while (node.firstChild) node.removeChild(node.firstChild);
    node.appendChild(document.createTextNode(text));
  };

  BrainToy.util.setAttr = function (node, name, value) {
    if (!node) return;
    if (value === null || value === undefined) node.removeAttribute(name);
    else node.setAttribute(name, String(value));
  };

  BrainToy.util.svgEl = function (tag) {
    return document.createElementNS('http://www.w3.org/2000/svg', tag);
  };

  BrainToy.log = function () {
    if (!BrainToy.config.debug) return;
    var args = Array.prototype.slice.call(arguments);
    args.unshift('[BrainToy]');
    // eslint-disable-next-line no-console
    console.log.apply(console, args);
  };

  window.BrainToy = BrainToy;
})();
