(function () {
  "use strict";

  var existing = window.BrainJoke;
  if (existing) return;

  var BrainJoke = {
    config: {
      debug: false,
      log: false,

      maxTextChars: 1200,
      layoutDebounceMs: 45,

      insetMargin: 18,
      insetExtraForInnerPath: 14,

      minFontSize: 12,
      maxFontSize: 76,

      densityTiers: [
        { name: "tiny", rows: 1 },
        { name: "small", rows: 2 },
        { name: "medium", rows: 3 },
        { name: "coily", rows: 5 },
        { name: "dense", rows: 7 },
        { name: "packed", rows: 10 },
        { name: "noise", rows: 14 },
      ],

      breathe: { ampPx: 3.5, periodMs: 3400 },
      sway: { ampDeg: 1.1, periodMs: 4800 },
      saccade: { rangePx: 6.5, settleMs: 180, idleMsMin: 650, idleMsMax: 1400 },
      blink: { closeMs: 75, holdMs: 35, openMs: 120, idleMsMin: 2800, idleMsMax: 5200 },

      render: {
        occupancyFillTarget: 0.92,
        rippleMs: 320,
      },
    },

    state: {
      initialized: false,
      reducedMotion: false,
      wiggleMode: false,
      text: "",
      cavityMetrics: null,
      lastPlan: null,
    },

    services: {},
    ui: {},
    debug: {},
    util: {},
  };

  BrainJoke.util.clamp = function (value, min, max) {
    return Math.max(min, Math.min(max, value));
  };

  BrainJoke.util.lerp = function (a, b, t) {
    return a + (b - a) * t;
  };

  BrainJoke.util.now = function () {
    return typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
  };

  BrainJoke.util.rand = function (min, max) {
    return min + Math.random() * (max - min);
  };

  BrainJoke.util.pick = function (arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  };

  BrainJoke.util.easeOutCubic = function (t) {
    return 1 - Math.pow(1 - t, 3);
  };

  BrainJoke.util.nearestSpace = function (text, index, radius) {
    var start = Math.max(0, index - radius);
    var end = Math.min(text.length, index + radius);
    var best = -1;
    for (var i = index; i >= start; i--) {
      if (text[i] === " ") {
        best = i;
        break;
      }
    }
    if (best !== -1) return best;
    for (var j = index; j <= end; j++) {
      if (text[j] === " ") return j;
    }
    return -1;
  };

  BrainJoke._once = (function () {
    var ran = Object.create(null);
    return function (key, fn) {
      if (ran[key]) return;
      ran[key] = true;
      fn();
    };
  })();

  BrainJoke.log = function () {
    if (!BrainJoke.config.log) return;
    // eslint-disable-next-line no-console
    console.log.apply(console, arguments);
  };

  window.BrainJoke = BrainJoke;
})();

