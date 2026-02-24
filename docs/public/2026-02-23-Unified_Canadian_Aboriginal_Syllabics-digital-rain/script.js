(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const dom = {
      canvas: document.getElementById("matrixCanvas"),
      ui: document.getElementById("ui"),
      sampleSelect: document.getElementById("sampleSelect"),
      loadSampleBtn: document.getElementById("loadSampleBtn"),
      runBtn: document.getElementById("runBtn"),
      liveBtn: document.getElementById("liveBtn"),
      shareBtn: document.getElementById("shareBtn"),
      dimBtn: document.getElementById("dimBtn"),
      pauseBtn: document.getElementById("pauseBtn"),
      perfBtn: document.getElementById("perfBtn"),
      helpBtn: document.getElementById("helpBtn"),
      status: document.getElementById("status"),
      errorBanner: document.getElementById("errorBanner"),
      runtimeFlags: document.getElementById("runtimeFlags"),
      editor: document.getElementById("editor"),
      stateDetails: document.getElementById("stateDetails"),
      effectiveStateText: document.getElementById("effectiveStateText"),
      paletteGroups: document.getElementById("paletteGroups"),
      macroNameInput: document.getElementById("macroNameInput"),
      saveMacroBtn: document.getElementById("saveMacroBtn"),
      macroList: document.getElementById("macroList"),
      helpPanel: document.getElementById("help"),
      helpSearch: document.getElementById("helpSearch"),
      helpFilters: document.getElementById("helpFilters"),
      helpBody: document.getElementById("helpBody"),
    };

    const ctx = dom.canvas.getContext("2d", { alpha: true });

    const STORAGE_KEYS = {
      script: "sts.script",
      sampleName: "sts.sampleName",
      live: "sts.live",
      helpOpen: "sts.ui.helpOpen",
      dimBackground: "sts.ui.dimBackground",
      pauseRain: "sts.ui.pauseRain",
      performanceMode: "sts.ui.performanceMode",
      helpSearch: "sts.ui.helpSearch",
      userMacros: "sts.macros.user",
    };

    const URL_PARAMS = {
      script: "s",
      sample: "sample",
      live: "live",
    };

    const LIMITS = {
      speed: [0.2, 6.0],
      fontPx: [10, 72],
      fadeAlpha: [0.01, 0.25],
      hueDeg: [0, 360],
      saturationPct: [30, 100],
      lightnessPct: [20, 85],
      jitter: [0, 1.5],
      wave: [0, 4],
      density: [0.5, 2.0],
      driftStrength: [0, 2.0],
      noise: [0, 2.0],
      perspective: [0, 1.5],
      repeat: [1, 256],
      macroDepth: 16,
      expandedNodes: 10000,
    };

    const SMOOTH_K = {
      speed: 8,
      angleRad: 4,
      fontPx: 3,
      fadeAlpha: 7,
      hueDeg: 5,
      saturationPct: 5,
      lightnessPct: 5,
      jitter: 6,
      wave: 6,
      density: 3,
      driftStrength: 5,
      noise: 5,
      perspective: 4,
    };

    const SELECTOR_DEFS = {
      S: { channel: "speed", label: "speed", parse(value) { return clamp(value / 100, LIMITS.speed[0], LIMITS.speed[1]); } },
      A: { channel: "angleRad", label: "angle", parse(value) { return degToRad(value % 360); } },
      H: { channel: "hueDeg", label: "hue", parse(value) { return wrapDeg(value); } },
      F: { channel: "fontPx", label: "font", parse(value) { return clamp(value, LIMITS.fontPx[0], LIMITS.fontPx[1]); } },
      T: { channel: "fadeAlpha", label: "fade", parse(value) { return clamp(value / 100, LIMITS.fadeAlpha[0], LIMITS.fadeAlpha[1]); } },
      J: { channel: "jitter", label: "jitter", parse(value) { return clamp(value / 100, LIMITS.jitter[0], LIMITS.jitter[1]); } },
      W: { channel: "wave", label: "wave", parse(value) { return clamp(value / 100, LIMITS.wave[0], LIMITS.wave[1]); } },
      D: { channel: "density", label: "density", parse(value) { return clamp(value / 100, LIMITS.density[0], LIMITS.density[1]); } },
      R: { channel: "driftStrength", label: "drift", parse(value) { return clamp(value / 100, LIMITS.driftStrength[0], LIMITS.driftStrength[1]); } },
      U: { channel: "saturationPct", label: "saturation", parse(value) { return clamp(value, LIMITS.saturationPct[0], LIMITS.saturationPct[1]); } },
      L: { channel: "lightnessPct", label: "lightness", parse(value) { return clamp(value, LIMITS.lightnessPct[0], LIMITS.lightnessPct[1]); } },
      E: { channel: "seed", label: "seed", parse(value) { return value >>> 0; } },
      N: { channel: "noise", label: "noise", parse(value) { return clamp(value / 100, LIMITS.noise[0], LIMITS.noise[1]); } },
      P: { channel: "perspective", label: "perspective", parse(value) { return clamp(value / 100, LIMITS.perspective[0], LIMITS.perspective[1]); } },
    };

    const SYNTAX_TOKENS = [
      { label: "(", insert: "(", title: "Group start" },
      { label: ")", insert: ")", title: "Group end" },
      { label: "=", insert: "=", title: "Commit numeric literal" },
      { label: "$name", insert: "$macro", title: "Invoke macro" },
      { label: "@name=", insert: "@macro = ", title: "Define macro (line)" },
      { label: "#", insert: "# ", title: "Comment (line-start)" },
    ];

    const SELECTOR_PALETTE = Object.keys(SELECTOR_DEFS).map((k) => ({
      label: k,
      insert: k,
      title: `Selector ${k}: ${SELECTOR_DEFS[k].label}`,
    }));

    function defaultState() {
      return {
        angleRad: Math.PI / 2,
        speed: 1.0,
        fontPx: 20,
        fadeAlpha: 0.06,
        hueDeg: 120,
        saturationPct: 90,
        lightnessPct: 62,
        jitter: 0.10,
        wave: 0.0,
        density: 1.0,
        driftStrength: 0.0,
        charsetMode: "mixed",
        seed: null,
        noise: 0.0,
        perspective: 0.0,
        snapNext: false,
        freezeMotion: false,
        freezeColor: false,
        freezeGeometry: false,
      };
    }

    function copyState(s) {
      return {
        angleRad: s.angleRad,
        speed: s.speed,
        fontPx: s.fontPx,
        fadeAlpha: s.fadeAlpha,
        hueDeg: s.hueDeg,
        saturationPct: s.saturationPct,
        lightnessPct: s.lightnessPct,
        jitter: s.jitter,
        wave: s.wave,
        density: s.density,
        driftStrength: s.driftStrength,
        charsetMode: s.charsetMode,
        seed: s.seed == null ? null : (s.seed >>> 0),
        noise: s.noise,
        perspective: s.perspective,
        snapNext: !!s.snapNext,
        freezeMotion: !!s.freezeMotion,
        freezeColor: !!s.freezeColor,
        freezeGeometry: !!s.freezeGeometry,
      };
    }

    function clamp(v, lo, hi) {
      return Math.max(lo, Math.min(hi, v));
    }

    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    function expApproach(curr, target, dt, k) {
      const t = 1 - Math.exp(-Math.max(0, dt) * k);
      return lerp(curr, target, t);
    }

    function wrapDeg(deg) {
      let d = deg % 360;
      if (d < 0) d += 360;
      return d;
    }

    function degToRad(deg) {
      return (deg * Math.PI) / 180;
    }

    function radToDeg(rad) {
      return (rad * 180) / Math.PI;
    }

    function wrapAngleRad(rad) {
      let v = rad % (Math.PI * 2);
      if (v <= -Math.PI) v += Math.PI * 2;
      if (v > Math.PI) v -= Math.PI * 2;
      return v;
    }

    function angleLerp(curr, target, dt, k) {
      let diff = wrapAngleRad(target - curr);
      const t = 1 - Math.exp(-Math.max(0, dt) * k);
      return wrapAngleRad(curr + diff * t);
    }

    function hueLerp(curr, target, dt, k) {
      let diff = wrapDeg(target) - wrapDeg(curr);
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      const t = 1 - Math.exp(-Math.max(0, dt) * k);
      return wrapDeg(curr + diff * t);
    }

    function safeJsonParse(text, fallback) {
      try {
        return JSON.parse(text);
      } catch (_err) {
        return fallback;
      }
    }

    function escapeHtml(text) {
      return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    function formatStateSummary(state) {
      return [
        `mode=${state.charsetMode}`,
        `speed=${state.speed.toFixed(2)}`,
        `angle=${radToDeg(state.angleRad).toFixed(0)}deg`,
        `font=${Math.round(state.fontPx)}px`,
        `fade=${state.fadeAlpha.toFixed(3)}`,
        `h=${Math.round(wrapDeg(state.hueDeg))}`,
        `s=${Math.round(state.saturationPct)}`,
        `l=${Math.round(state.lightnessPct)}`,
        `j=${state.jitter.toFixed(2)}`,
        `w=${state.wave.toFixed(2)}`,
        `d=${state.density.toFixed(2)}`,
        `dr=${state.driftStrength.toFixed(2)}`,
        `n=${state.noise.toFixed(2)}`,
        `p=${state.perspective.toFixed(2)}`,
        `seed=${state.seed == null ? "none" : state.seed}`,
      ].join(" ");
    }

    class XorShift32 {
      constructor(seed) {
        this.state = (seed >>> 0) || 0x9e3779b9;
      }

      nextUint() {
        let x = this.state >>> 0;
        x ^= (x << 13) >>> 0;
        x ^= x >>> 17;
        x ^= (x << 5) >>> 0;
        this.state = x >>> 0;
        return this.state;
      }

      next() {
        return this.nextUint() / 0x100000000;
      }

      clone() {
        const c = new XorShift32(1);
        c.state = this.state >>> 0;
        return c;
      }
    }

    function hashString32(str) {
      let h = 2166136261 >>> 0;
      for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619) >>> 0;
      }
      return h >>> 0;
    }

    function utf8ToBase64Url(str) {
      const bytes = new TextEncoder().encode(str);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
      return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
    }

    function base64UrlToUtf8(s) {
      const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return new TextDecoder().decode(bytes);
    }

    function makeSyllabicsCharset() {
      const chars = [];
      for (let cp = 0x1400; cp <= 0x167f; cp++) {
        const ch = String.fromCodePoint(cp);
        if (/\s/.test(ch)) continue;
        chars.push(ch);
      }
      return chars;
    }

    const CHARSET_SYLLABICS = makeSyllabicsCharset();
    const CHARSET_GUID = Array.from("{0123456789abcdef-}");
    const CHARSET_MIXED = CHARSET_SYLLABICS.concat(CHARSET_GUID);
    const CHARSETS = {
      syllabics: CHARSET_SYLLABICS,
      guid: CHARSET_GUID,
      mixed: CHARSET_MIXED,
    };

    const GLYPH_DEFS = [
      { glyph: "ᐊ", op: "speed_up", name: "SpeedUp", category: "motion", effect: "+0.12 speed", bounds: "[0.2,6.0]", smoothing: "k=8", notes: "Increase fall speed" },
      { glyph: "ᐃ", op: "speed_down", name: "SpeedDown", category: "motion", effect: "-0.12 speed", bounds: "[0.2,6.0]", smoothing: "k=8", notes: "Decrease fall speed" },
      { glyph: "ᐅ", op: "rotate_cw", name: "RotateCW", category: "motion", effect: "+0.09 rad angle", bounds: "wrapped", smoothing: "k=4", notes: "Rotate flow clockwise" },
      { glyph: "ᐁ", op: "rotate_ccw", name: "RotateCCW", category: "motion", effect: "-0.09 rad angle", bounds: "wrapped", smoothing: "k=4", notes: "Rotate flow counterclockwise" },
      { glyph: "ᒋ", op: "drift_up", name: "DriftUp", category: "motion", effect: "+0.08 drift", bounds: "[0,2.0]", smoothing: "k=5", notes: "Increase lateral drift strength" },
      { glyph: "ᒍ", op: "drift_down", name: "DriftDown", category: "motion", effect: "-0.08 drift", bounds: "[0,2.0]", smoothing: "k=5", notes: "Decrease lateral drift strength" },

      { glyph: "ᐳ", op: "font_up", name: "FontUp", category: "geometry", effect: "+1 fontPx", bounds: "[10,72]", smoothing: "k=3", notes: "Increase glyph size" },
      { glyph: "ᐱ", op: "font_down", name: "FontDown", category: "geometry", effect: "-1 fontPx", bounds: "[10,72]", smoothing: "k=3", notes: "Decrease glyph size" },
      { glyph: "ᑲ", op: "density_up", name: "DensityUp", category: "geometry", effect: "+0.08 density", bounds: "[0.5,2.0]", smoothing: "k=3", notes: "Increase stream density" },
      { glyph: "ᑭ", op: "density_down", name: "DensityDown", category: "geometry", effect: "-0.08 density", bounds: "[0.5,2.0]", smoothing: "k=3", notes: "Decrease stream density" },
      { glyph: "ᘁ", op: "perspective_up", name: "PerspectiveUp", category: "geometry", effect: "+0.08 perspective", bounds: "[0,1.5]", smoothing: "k=4", notes: "Increase depth scaling" },
      { glyph: "ᘂ", op: "perspective_down", name: "PerspectiveDown", category: "geometry", effect: "-0.08 perspective", bounds: "[0,1.5]", smoothing: "k=4", notes: "Decrease depth scaling" },

      { glyph: "ᕿ", op: "trail_longer", name: "TrailLonger", category: "trails", effect: "-0.006 fadeAlpha", bounds: "[0.01,0.25]", smoothing: "k=7", notes: "Longer trails" },
      { glyph: "ᕼ", op: "trail_shorter", name: "TrailShorter", category: "trails", effect: "+0.006 fadeAlpha", bounds: "[0.01,0.25]", smoothing: "k=7", notes: "Shorter trails" },

      { glyph: "ᓯ", op: "hue_fwd", name: "HueForward", category: "color", effect: "+7.2 hueDeg", bounds: "wrap 0..360", smoothing: "k=5", notes: "Shift hue forward" },
      { glyph: "ᓴ", op: "hue_back", name: "HueBackward", category: "color", effect: "-7.2 hueDeg", bounds: "wrap 0..360", smoothing: "k=5", notes: "Shift hue backward" },
      { glyph: "ᔭ", op: "sat_up", name: "SaturationUp", category: "color", effect: "+3 saturation", bounds: "[30,100]", smoothing: "k=5", notes: "Increase saturation" },
      { glyph: "ᔪ", op: "sat_down", name: "SaturationDown", category: "color", effect: "-3 saturation", bounds: "[30,100]", smoothing: "k=5", notes: "Decrease saturation" },
      { glyph: "ᓓ", op: "light_up", name: "LightnessUp", category: "color", effect: "+2 lightness", bounds: "[20,85]", smoothing: "k=5", notes: "Increase lightness" },
      { glyph: "ᓕ", op: "light_down", name: "LightnessDown", category: "color", effect: "-2 lightness", bounds: "[20,85]", smoothing: "k=5", notes: "Decrease lightness" },

      { glyph: "ᖅ", op: "jitter_up", name: "JitterUp", category: "distortion", effect: "+0.04 jitter", bounds: "[0,1.5]", smoothing: "k=6", notes: "Increase jitter" },
      { glyph: "ᖃ", op: "jitter_down", name: "JitterDown", category: "distortion", effect: "-0.04 jitter", bounds: "[0,1.5]", smoothing: "k=6", notes: "Decrease jitter" },
      { glyph: "ᗅ", op: "wave_up", name: "WaveUp", category: "distortion", effect: "+0.12 wave", bounds: "[0,4.0]", smoothing: "k=6", notes: "Increase wave" },
      { glyph: "ᗆ", op: "wave_down", name: "WaveDown", category: "distortion", effect: "-0.12 wave", bounds: "[0,4.0]", smoothing: "k=6", notes: "Decrease wave" },
      { glyph: "ᘃ", op: "noise_up", name: "NoiseUp", category: "distortion", effect: "+0.08 noise", bounds: "[0,2.0]", smoothing: "k=5", notes: "Increase low-frequency noise modulation" },
      { glyph: "ᘄ", op: "noise_down", name: "NoiseDown", category: "distortion", effect: "-0.08 noise", bounds: "[0,2.0]", smoothing: "k=5", notes: "Decrease low-frequency noise modulation" },

      { glyph: "ᓂ", op: "charset_syllabics", name: "CharsetSyllabics", category: "glyphset", effect: "set charsetMode=syllabics", bounds: "enum", smoothing: "crossfade", notes: "Syllabics-only glyph set" },
      { glyph: "ᓄ", op: "charset_guid", name: "CharsetGuid", category: "glyphset", effect: "set charsetMode=guid", bounds: "enum", smoothing: "crossfade", notes: "GUID/hex glyph set" },
      { glyph: "ᓇ", op: "charset_mixed", name: "CharsetMixed", category: "glyphset", effect: "set charsetMode=mixed", bounds: "enum", smoothing: "crossfade", notes: "Mixed glyph set" },
      { glyph: "᙭", op: "randomize", name: "Randomize", category: "glyphset", effect: "randomize state within bounds", bounds: "all clamps", smoothing: "all k", notes: "Uses seeded PRNG when seed is set" },
      { glyph: "ᙅ", op: "clear_seed", name: "ClearSeed", category: "glyphset", effect: "seed=null", bounds: "n/a", smoothing: "n/a", notes: "Disable deterministic randomize" },

      { glyph: "᙮", op: "reset", name: "Reset", category: "meta", effect: "reset to defaults", bounds: "n/a", smoothing: "target reset", notes: "Restores base state" },
      { glyph: "ᙆ", op: "snap", name: "Snap", category: "meta", effect: "snap next apply", bounds: "one-shot", smoothing: "bypass once", notes: "Apply target immediately on next frame" },
      { glyph: "ᙁ", op: "freeze_motion", name: "FreezeMotion", category: "meta", effect: "toggle freezeMotion", bounds: "boolean", smoothing: "n/a", notes: "Freeze motion parameter evolution" },
      { glyph: "ᙂ", op: "freeze_color", name: "FreezeColor", category: "meta", effect: "toggle freezeColor", bounds: "boolean", smoothing: "n/a", notes: "Freeze color parameter evolution" },
      { glyph: "ᙃ", op: "freeze_geometry", name: "FreezeGeometry", category: "meta", effect: "toggle freezeGeometry", bounds: "boolean", smoothing: "n/a", notes: "Freeze geometry parameter evolution" },
    ];

    const GLYPH_BY_CHAR = new Map(GLYPH_DEFS.map((g) => [g.glyph, g]));
    const GLYPH_CATEGORIES = ["motion", "geometry", "trails", "color", "distortion", "glyphset", "meta"];

    const SAMPLES = [
      {
        name: "Calm mixed",
        description: "Baseline mixed rain with long trails and gentle hue drift.",
        code: "# Calm mixed baseline\nᓇᕿᕿᐃᐃᓴᓴᒍᑭ",
      },
      {
        name: "Fast vertical syllabics",
        description: "High speed, syllabics-only, bright green regime.",
        code: "# Fast vertical syllabics\nᓂᐊᐊᐊᐊᐊᕿᓯᓯᔭᔭᑲ",
      },
      {
        name: "Diagonal drift",
        description: "Rotate + drift + wave + jitter for slanted flow.",
        code: "# Diagonal drift\nᓇᐅᐅᐅᐊᐊᒋᒋᖅᖅᗅᗅᗅᑲ",
      },
      {
        name: "GUID storm",
        description: "GUID glyphs, faster motion, short trails, higher noise.",
        code: "# GUID storm\nᓄᐊᐊᐊᐊᕼᕼᓯᓯᖅᖅᘃᘃ",
      },
      {
        name: "Color cycle",
        description: "Color-heavy sample using v2 selectors for explicit values.",
        code: "# Explicit color and trails\nH210=U78=L62=T5=\nᓇᔭᔪᓯᓯ",
      },
      {
        name: "Controlled chaos",
        description: "Randomize then clamp and steer with seeded deterministic replay.",
        code: "# Seed + randomize + steer\nE12345=᙭\nS260=A110=J35=W140=N45=P35=D125=R60=\nᓇ",
      },
      {
        name: "Grouping + repeat",
        description: "v3 syntax for grouped repeats and macro use.",
        code: "# Group/repeat and macro\n@diag = ᐅᐅᒋᒋᗅᖅ\n($diag)3\n(H170=U88=)2\nᓇ",
      },
    ];

    const HELP_TROUBLESHOOTING = [
      "Missing glyphs may be a font support issue. Try a browser/system font with Unified Canadian Aboriginal Syllabics coverage.",
      "If a script seems to do nothing: check Live mode, comments-only script, unknown glyph count, or frozen parameter toggles.",
      "Performance drops: enable Perf mode, reduce density/wave/jitter, or pause rain while editing.",
      "Deterministic randomize requires setting a seed (selector E...=) before using ᙭.",
    ];

    const HELP_CONCEPT = [
      "STS is a symbolic transformation language for controlling digital rain rendering in real time.",
      "Whitespace is ignored. Lines whose first non-space character is # are comments.",
      "v2 adds numeric selectors and commit syntax (example: S250= sets speed to 2.50).",
      "v3 adds grouping/repeats and local macros (@name = ..., invoke with $name).",
    ];

    function codePointHex(ch) {
      return `U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`;
    }

    function createDiagnostics() {
      return {
        tokenCount: 0,
        unknownCount: 0,
        firstUnknown: null,
        warnings: [],
        errors: [],
        durationMs: 0,
      };
    }

    function pushWarning(diag, code, message, token) {
      if (diag.warnings.length < 60) {
        diag.warnings.push({
          code,
          message,
          line: token && token.line,
          col: token && token.col,
        });
      }
    }

    function pushError(diag, code, message) {
      if (diag.errors.length < 20) {
        diag.errors.push({ code, message });
      }
    }

    function tokenizeLine(line, lineNo, diag) {
      const tokens = [];
      for (let i = 0; i < line.length; ) {
        const code = line.codePointAt(i);
        const ch = String.fromCodePoint(code);
        const width = code > 0xffff ? 2 : 1;
        const col = i + 1;

        if (/\s/.test(ch)) {
          i += width;
          continue;
        }

        if (ch === "$") {
          let j = i + 1;
          let name = "";
          while (j < line.length) {
            const cj = line[j];
            if (!/[A-Za-z0-9_]/.test(cj)) break;
            name += cj;
            j += 1;
          }
          if (name && /^[A-Za-z_]/.test(name)) {
            tokens.push({ kind: "macroRef", text: `$${name}`, name, line: lineNo, col });
            i = j;
            continue;
          }
          tokens.push({ kind: "other", text: ch, line: lineNo, col });
          i += width;
          continue;
        }

        if (ch === "(") {
          tokens.push({ kind: "lparen", text: ch, line: lineNo, col });
          i += width;
          continue;
        }
        if (ch === ")") {
          tokens.push({ kind: "rparen", text: ch, line: lineNo, col });
          i += width;
          continue;
        }
        if (ch === "=") {
          tokens.push({ kind: "commit", text: ch, line: lineNo, col });
          i += width;
          continue;
        }

        if (/^[0-9]$/.test(ch)) {
          tokens.push({ kind: "digit", text: ch, line: lineNo, col, value: ch.charCodeAt(0) - 48 });
          i += width;
          continue;
        }

        if (/^[A-Z]$/.test(ch) && SELECTOR_DEFS[ch]) {
          tokens.push({ kind: "selector", text: ch, selector: ch, line: lineNo, col });
          i += width;
          continue;
        }

        if (GLYPH_BY_CHAR.has(ch)) {
          tokens.push({ kind: "glyph", text: ch, glyph: ch, line: lineNo, col });
          i += width;
          continue;
        }

        // Keep unknown visible; interpreter will count and warn without crashing.
        tokens.push({ kind: "unknown", text: ch, line: lineNo, col });
        i += width;
      }
      diag.tokenCount += tokens.length;
      return tokens;
    }

    function parseMacroDefLine(line, lineNo) {
      const m = line.match(/^\s*@([A-Za-z_][A-Za-z0-9_]{0,31})\s*=\s*(.*)$/);
      if (!m) return null;
      return { name: m[1], bodyText: m[2], lineNo };
    }

    function parseGroups(tokens, diag) {
      let index = 0;

      function readDigitsAsInt(startIndex) {
        let i = startIndex;
        let text = "";
        while (i < tokens.length && tokens[i].kind === "digit") {
          text += tokens[i].text;
          i += 1;
        }
        if (!text) return null;
        return { value: parseInt(text, 10), nextIndex: i, text };
      }

      function parseSequence(stopOnRParen) {
        const nodes = [];
        while (index < tokens.length) {
          const t = tokens[index];
          if (stopOnRParen && t.kind === "rparen") {
            index += 1;
            return nodes;
          }
          if (t.kind === "lparen") {
            const openToken = t;
            index += 1;
            const body = parseSequence(true);
            let repeat = 1;
            const rep = readDigitsAsInt(index);
            if (rep) {
              repeat = clamp(rep.value, LIMITS.repeat[0], LIMITS.repeat[1]);
              if (repeat !== rep.value) {
                pushWarning(diag, "repeat_clamped", `Repeat count ${rep.value} clamped to ${repeat}`, openToken);
              }
              index = rep.nextIndex;
            }
            nodes.push({ type: "group", body, repeat, line: openToken.line, col: openToken.col });
            continue;
          }
          if (t.kind === "rparen") {
            pushWarning(diag, "unmatched_rparen", "Unmatched ')' ignored", t);
            index += 1;
            continue;
          }
          nodes.push({ type: "token", token: t });
          index += 1;
        }
        if (stopOnRParen) {
          pushWarning(diag, "missing_rparen", "Missing ')' for group; group parsed to end of line", tokens[tokens.length - 1] || null);
        }
        return nodes;
      }

      return parseSequence(false);
    }

    function loadUserMacros() {
      const raw = localStorage.getItem(STORAGE_KEYS.userMacros);
      const parsed = safeJsonParse(raw || "{}", {});
      if (!parsed || typeof parsed !== "object") return {};
      const out = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (/^[A-Za-z_][A-Za-z0-9_]{0,31}$/.test(k) && typeof v === "string") {
          out[k] = v;
        }
      }
      return out;
    }

    function saveUserMacros(macros) {
      localStorage.setItem(STORAGE_KEYS.userMacros, JSON.stringify(macros));
    }

    function compileScript(source, externalMacros) {
      const started = performance.now();
      const diag = createDiagnostics();
      const lines = String(source || "").split(/\r?\n/);
      const scriptLocalMacroTexts = {};
      const macroOrder = [];
      const programTokens = [];

      for (let lineNo = 1; lineNo <= lines.length; lineNo++) {
        const line = lines[lineNo - 1];
        const trimmed = line.trimStart();
        if (trimmed.startsWith("#")) continue;

        const macroDef = parseMacroDefLine(line, lineNo);
        if (macroDef) {
          if (Object.prototype.hasOwnProperty.call(scriptLocalMacroTexts, macroDef.name)) {
            pushWarning(diag, "macro_redefined", `Macro '${macroDef.name}' redefined; latest definition wins`, { line: lineNo, col: 1 });
          }
          scriptLocalMacroTexts[macroDef.name] = macroDef.bodyText;
          if (!macroOrder.includes(macroDef.name)) macroOrder.push(macroDef.name);
          continue;
        }

        const tokens = tokenizeLine(line, lineNo, diag);
        for (const t of tokens) programTokens.push(t);
      }

      const macroNodesByName = {};
      const allMacroTexts = Object.assign({}, externalMacros || {}, scriptLocalMacroTexts);
      for (const [name, bodyText] of Object.entries(allMacroTexts)) {
        const fakeLineNo = 1;
        const bodyDiag = diag;
        const tokens = tokenizeLine(bodyText, fakeLineNo, bodyDiag);
        macroNodesByName[name] = parseGroups(tokens, diag);
      }

      const rootNodes = parseGroups(programTokens, diag);

      const state = defaultState();
      let activeSelector = null;
      let digitBuffer = "";
      let deterministic = true;
      let expandedNodeCount = 0;
      let rng = null;

      function ensureRng(seed) {
        rng = new XorShift32(seed >>> 0);
      }

      function maybeConsumePostfixRepeat(nodes, idx) {
        const node = nodes[idx];
        if (!node || node.type !== "token") return null;
        const t = node.token;
        if (!(t.kind === "glyph" || t.kind === "macroRef" || t.kind === "unknown")) return null;
        if (activeSelector || digitBuffer) return null;
        let j = idx + 1;
        let text = "";
        while (j < nodes.length && nodes[j].type === "token" && nodes[j].token.kind === "digit") {
          text += nodes[j].token.text;
          j += 1;
        }
        if (!text) return null;
        if (j < nodes.length && nodes[j].type === "token" && nodes[j].token.kind === "commit") {
          return null;
        }
        const raw = parseInt(text, 10);
        const repeat = clamp(raw, LIMITS.repeat[0], LIMITS.repeat[1]);
        if (repeat !== raw) pushWarning(diag, "repeat_clamped", `Repeat count ${raw} clamped to ${repeat}`, t);
        return { repeat, nextIndex: j };
      }

      function applyRandomize() {
        const rand = rng ? () => rng.next() : Math.random;
        if (!rng) deterministic = false;
        state.angleRad = rand() * Math.PI * 2 - Math.PI;
        state.speed = lerp(LIMITS.speed[0], 3.4, rand());
        state.fontPx = Math.round(lerp(14, 40, rand()));
        state.fadeAlpha = lerp(0.02, 0.14, rand());
        state.hueDeg = rand() * 360;
        state.saturationPct = lerp(55, 100, rand());
        state.lightnessPct = lerp(45, 75, rand());
        state.jitter = lerp(0, 0.9, rand());
        state.wave = lerp(0, 2.8, rand());
        state.density = lerp(0.7, 1.6, rand());
        state.driftStrength = lerp(0, 1.1, rand());
        state.noise = lerp(0, 0.9, rand());
        state.perspective = lerp(0, 0.8, rand());
        const modes = ["syllabics", "guid", "mixed"];
        state.charsetMode = modes[Math.floor(rand() * modes.length)] || "mixed";
      }

      function applyGlyph(def, token) {
        switch (def.op) {
          case "speed_up":
            state.speed = clamp(state.speed + 0.12, LIMITS.speed[0], LIMITS.speed[1]);
            break;
          case "speed_down":
            state.speed = clamp(state.speed - 0.12, LIMITS.speed[0], LIMITS.speed[1]);
            break;
          case "rotate_cw":
            state.angleRad = wrapAngleRad(state.angleRad + 0.09);
            break;
          case "rotate_ccw":
            state.angleRad = wrapAngleRad(state.angleRad - 0.09);
            break;
          case "drift_up":
            state.driftStrength = clamp(state.driftStrength + 0.08, LIMITS.driftStrength[0], LIMITS.driftStrength[1]);
            break;
          case "drift_down":
            state.driftStrength = clamp(state.driftStrength - 0.08, LIMITS.driftStrength[0], LIMITS.driftStrength[1]);
            break;
          case "font_up":
            state.fontPx = clamp(state.fontPx + 1, LIMITS.fontPx[0], LIMITS.fontPx[1]);
            break;
          case "font_down":
            state.fontPx = clamp(state.fontPx - 1, LIMITS.fontPx[0], LIMITS.fontPx[1]);
            break;
          case "density_up":
            state.density = clamp(state.density + 0.08, LIMITS.density[0], LIMITS.density[1]);
            break;
          case "density_down":
            state.density = clamp(state.density - 0.08, LIMITS.density[0], LIMITS.density[1]);
            break;
          case "perspective_up":
            state.perspective = clamp(state.perspective + 0.08, LIMITS.perspective[0], LIMITS.perspective[1]);
            break;
          case "perspective_down":
            state.perspective = clamp(state.perspective - 0.08, LIMITS.perspective[0], LIMITS.perspective[1]);
            break;
          case "trail_longer":
            state.fadeAlpha = clamp(state.fadeAlpha - 0.006, LIMITS.fadeAlpha[0], LIMITS.fadeAlpha[1]);
            break;
          case "trail_shorter":
            state.fadeAlpha = clamp(state.fadeAlpha + 0.006, LIMITS.fadeAlpha[0], LIMITS.fadeAlpha[1]);
            break;
          case "hue_fwd":
            state.hueDeg = wrapDeg(state.hueDeg + 7.2);
            break;
          case "hue_back":
            state.hueDeg = wrapDeg(state.hueDeg - 7.2);
            break;
          case "sat_up":
            state.saturationPct = clamp(state.saturationPct + 3, LIMITS.saturationPct[0], LIMITS.saturationPct[1]);
            break;
          case "sat_down":
            state.saturationPct = clamp(state.saturationPct - 3, LIMITS.saturationPct[0], LIMITS.saturationPct[1]);
            break;
          case "light_up":
            state.lightnessPct = clamp(state.lightnessPct + 2, LIMITS.lightnessPct[0], LIMITS.lightnessPct[1]);
            break;
          case "light_down":
            state.lightnessPct = clamp(state.lightnessPct - 2, LIMITS.lightnessPct[0], LIMITS.lightnessPct[1]);
            break;
          case "jitter_up":
            state.jitter = clamp(state.jitter + 0.04, LIMITS.jitter[0], LIMITS.jitter[1]);
            break;
          case "jitter_down":
            state.jitter = clamp(state.jitter - 0.04, LIMITS.jitter[0], LIMITS.jitter[1]);
            break;
          case "wave_up":
            state.wave = clamp(state.wave + 0.12, LIMITS.wave[0], LIMITS.wave[1]);
            break;
          case "wave_down":
            state.wave = clamp(state.wave - 0.12, LIMITS.wave[0], LIMITS.wave[1]);
            break;
          case "noise_up":
            state.noise = clamp(state.noise + 0.08, LIMITS.noise[0], LIMITS.noise[1]);
            break;
          case "noise_down":
            state.noise = clamp(state.noise - 0.08, LIMITS.noise[0], LIMITS.noise[1]);
            break;
          case "charset_syllabics":
            state.charsetMode = "syllabics";
            break;
          case "charset_guid":
            state.charsetMode = "guid";
            break;
          case "charset_mixed":
            state.charsetMode = "mixed";
            break;
          case "randomize":
            applyRandomize();
            break;
          case "clear_seed":
            state.seed = null;
            rng = null;
            break;
          case "reset":
            Object.assign(state, defaultState());
            rng = state.seed == null ? null : new XorShift32(state.seed);
            activeSelector = null;
            digitBuffer = "";
            break;
          case "snap":
            state.snapNext = true;
            break;
          case "freeze_motion":
            state.freezeMotion = !state.freezeMotion;
            break;
          case "freeze_color":
            state.freezeColor = !state.freezeColor;
            break;
          case "freeze_geometry":
            state.freezeGeometry = !state.freezeGeometry;
            break;
          default:
            pushWarning(diag, "unimplemented_glyph", `Glyph ${def.glyph} is defined but not implemented`, token);
            break;
        }
      }

      function applyCommit(token) {
        if (!activeSelector) {
          pushWarning(diag, "commit_without_selector", "Commit '=' without active selector", token);
          digitBuffer = "";
          return;
        }
        if (!digitBuffer) {
          pushWarning(diag, "commit_without_digits", `Commit '=' for selector ${activeSelector} without digits`, token);
          return;
        }
        const raw = parseInt(digitBuffer, 10);
        const def = SELECTOR_DEFS[activeSelector];
        if (!def) {
          pushWarning(diag, "bad_selector", `Unknown selector '${activeSelector}'`, token);
          digitBuffer = "";
          activeSelector = null;
          return;
        }
        const parsed = def.parse(raw);
        state[def.channel] = parsed;
        if (def.channel === "seed") {
          state.seed = parsed >>> 0;
          ensureRng(state.seed);
        }
        digitBuffer = "";
      }

      function applyToken(token) {
        switch (token.kind) {
          case "selector":
            activeSelector = token.selector;
            digitBuffer = "";
            return;
          case "digit":
            if (activeSelector) {
              if (digitBuffer.length < 12) digitBuffer += token.text;
              else pushWarning(diag, "digit_buffer_long", "Numeric literal buffer truncated to 12 digits", token);
            } else {
              pushWarning(diag, "stray_digit", `Stray digit '${token.text}' ignored (select a channel first)`, token);
            }
            return;
          case "commit":
            applyCommit(token);
            return;
          case "glyph": {
            const def = GLYPH_BY_CHAR.get(token.glyph);
            if (def) {
              applyGlyph(def, token);
              return;
            }
            break;
          }
          case "unknown":
          case "other":
            break;
          case "macroRef":
          case "lparen":
          case "rparen":
            // handled elsewhere or parser recovered; warn if leaked into execution.
            break;
          default:
            break;
        }

        diag.unknownCount += 1;
        if (!diag.firstUnknown) {
          diag.firstUnknown = { line: token.line, col: token.col, ch: token.text };
        }
        pushWarning(diag, "unknown_token", `Unknown token '${token.text}' ignored`, token);
      }

      function evalNodes(nodes, depth, macroStack) {
        if (depth > LIMITS.macroDepth) {
          pushError(diag, "macro_depth", `Macro expansion depth exceeded (${LIMITS.macroDepth})`);
          return;
        }
        for (let i = 0; i < nodes.length; i++) {
          if (expandedNodeCount > LIMITS.expandedNodes) {
            pushError(diag, "program_too_large", `Expanded node count exceeded ${LIMITS.expandedNodes}`);
            return;
          }
          const node = nodes[i];
          if (!node) continue;
          if (node.type === "group") {
            const repeat = clamp(node.repeat || 1, LIMITS.repeat[0], LIMITS.repeat[1]);
            for (let n = 0; n < repeat; n++) {
              evalNodes(node.body, depth, macroStack);
              if (diag.errors.length) return;
            }
            expandedNodeCount += 1;
            continue;
          }
          if (node.type !== "token") continue;

          const t = node.token;
          if (t.kind === "macroRef") {
            const name = t.name;
            if (macroStack.includes(name)) {
              pushWarning(diag, "macro_cycle", `Macro cycle detected for '${name}'`, t);
              continue;
            }
            const macroNodes = macroNodesByName[name];
            if (!macroNodes) {
              pushWarning(diag, "macro_missing", `Macro '${name}' not found`, t);
              continue;
            }
            let repeat = 1;
            const repeatInfo = maybeConsumePostfixRepeat(nodes, i);
            if (repeatInfo) {
              repeat = repeatInfo.repeat;
              i = repeatInfo.nextIndex - 1;
            }
            for (let n = 0; n < repeat; n++) {
              evalNodes(macroNodes, depth + 1, macroStack.concat(name));
              if (diag.errors.length) return;
            }
            expandedNodeCount += 1;
            continue;
          }

          let repeat = 1;
          const repeatInfo = maybeConsumePostfixRepeat(nodes, i);
          if (repeatInfo && t.kind !== "digit") {
            repeat = repeatInfo.repeat;
            i = repeatInfo.nextIndex - 1;
          }
          for (let n = 0; n < repeat; n++) {
            applyToken(t);
          }
          expandedNodeCount += 1;
        }
      }

      // Script-local macros override external macros.
      for (const name of Object.keys(scriptLocalMacroTexts)) {
        if (Object.prototype.hasOwnProperty.call(externalMacros || {}, name)) {
          pushWarning(diag, "macro_shadow", `Script macro '${name}' shadows saved macro`, { line: 1, col: 1 });
        }
      }

      evalNodes(rootNodes, 0, []);
      if (activeSelector && digitBuffer) {
        pushWarning(diag, "literal_no_commit", `Selector ${activeSelector} has digits '${digitBuffer}' but no '=' commit`, { line: 1, col: 1 });
      }
      if (activeSelector && !digitBuffer) {
        pushWarning(diag, "selector_no_value", `Selector ${activeSelector} set but no numeric literal committed`, { line: 1, col: 1 });
      }

      state.speed = clamp(state.speed, LIMITS.speed[0], LIMITS.speed[1]);
      state.fontPx = clamp(state.fontPx, LIMITS.fontPx[0], LIMITS.fontPx[1]);
      state.fadeAlpha = clamp(state.fadeAlpha, LIMITS.fadeAlpha[0], LIMITS.fadeAlpha[1]);
      state.hueDeg = wrapDeg(state.hueDeg);
      state.saturationPct = clamp(state.saturationPct, LIMITS.saturationPct[0], LIMITS.saturationPct[1]);
      state.lightnessPct = clamp(state.lightnessPct, LIMITS.lightnessPct[0], LIMITS.lightnessPct[1]);
      state.jitter = clamp(state.jitter, LIMITS.jitter[0], LIMITS.jitter[1]);
      state.wave = clamp(state.wave, LIMITS.wave[0], LIMITS.wave[1]);
      state.density = clamp(state.density, LIMITS.density[0], LIMITS.density[1]);
      state.driftStrength = clamp(state.driftStrength, LIMITS.driftStrength[0], LIMITS.driftStrength[1]);
      state.noise = clamp(state.noise, LIMITS.noise[0], LIMITS.noise[1]);
      state.perspective = clamp(state.perspective, LIMITS.perspective[0], LIMITS.perspective[1]);
      state.angleRad = wrapAngleRad(state.angleRad);

      diag.durationMs = performance.now() - started;
      if (diag.durationMs > 12) {
        pushWarning(diag, "compile_slow", `Compile time ${diag.durationMs.toFixed(1)}ms (consider shorter script or Live OFF)`, { line: 1, col: 1 });
      }

      return {
        targetState: copyState(state),
        diagnostics: diag,
        programMeta: {
          macroCount: Object.keys(allMacroTexts).length,
          localMacroCount: Object.keys(scriptLocalMacroTexts).length,
          expandedNodeCount,
          macroOrder: macroOrder.slice(),
        },
        deterministic,
      };
    }

    class RainRenderer {
      constructor(canvas, context) {
        this.canvas = canvas;
        this.ctx = context;
        this.width = 0;
        this.height = 0;
        this.time = 0;
        this.current = defaultState();
        this.target = defaultState();
        this.streams = [];
        this.layoutFontPx = this.current.fontPx;
        this.layoutDensity = this.current.density;
        this.layoutCooldown = 0;
        this.seedForStreams = null;
        this.manualPerfMode = false;
        this.paused = false;
        this.qualityLevel = 0;
        this.fpsAvg = 60;
        this.frameTimes = [];
        this.fpsSampleAccum = 0;
        this.lowFpsMs = 0;
        this.highFpsMs = 0;
        this.charsetVisibleMode = this.current.charsetMode;
        this.charsetFromMode = this.current.charsetMode;
        this.charsetToMode = this.current.charsetMode;
        this.charsetBlend = 1;
        this.charsetBlendDuration = 0.35;
        this._reseedNonce = 0;
      }

      setSize(w, h) {
        this.width = this.canvas.width = Math.max(1, Math.floor(w));
        this.height = this.canvas.height = Math.max(1, Math.floor(h));
        this.rebuildStreams(true);
      }

      setPaused(paused) {
        this.paused = !!paused;
      }

      setManualPerformanceMode(on) {
        this.manualPerfMode = !!on;
      }

      setTargetState(next) {
        const prevTargetMode = this.target.charsetMode;
        this.target = copyState(next);
        if (this.target.seed !== this.seedForStreams) {
          this.seedForStreams = this.target.seed;
          this.reseedStreams();
        }
        if (prevTargetMode !== this.target.charsetMode || this.charsetToMode !== this.target.charsetMode) {
          this.charsetFromMode = this.getCurrentVisibleCharsetMode();
          this.charsetToMode = this.target.charsetMode;
          this.charsetBlend = 0;
        }
      }

      getCurrentVisibleCharsetMode() {
        if (this.charsetBlend >= 1) return this.charsetToMode;
        if (this.charsetBlend <= 0) return this.charsetFromMode;
        return this.charsetToMode;
      }

      getStats() {
        return {
          fpsAvg: this.fpsAvg,
          qualityLevel: this.getEffectiveQualityLevel(),
          streamCount: this.streams.length,
          paused: this.paused,
        };
      }

      getEffectiveQualityLevel() {
        return this.manualPerfMode ? Math.max(this.qualityLevel, 2) : this.qualityLevel;
      }

      getQualityLabel() {
        const q = this.getEffectiveQualityLevel();
        if (this.manualPerfMode) return `manual-${q}`;
        return `auto-${q}`;
      }

      trackFps(dt) {
        if (dt <= 0) return;
        this.frameTimes.push(dt);
        if (this.frameTimes.length > 60) this.frameTimes.shift();
        let sum = 0;
        for (let i = 0; i < this.frameTimes.length; i++) sum += this.frameTimes[i];
        this.fpsAvg = sum > 0 ? this.frameTimes.length / sum : this.fpsAvg;

        if (this.manualPerfMode) return;
        if (this.fpsAvg < 40) {
          this.lowFpsMs += dt * 1000;
          this.highFpsMs = 0;
        } else if (this.fpsAvg > 52) {
          this.highFpsMs += dt * 1000;
          this.lowFpsMs = 0;
        } else {
          this.lowFpsMs = Math.max(0, this.lowFpsMs - dt * 500);
          this.highFpsMs = Math.max(0, this.highFpsMs - dt * 500);
        }

        if (this.lowFpsMs > 2000 && this.qualityLevel < 3) {
          this.qualityLevel += 1;
          this.lowFpsMs = 0;
        }
        if (this.highFpsMs > 3000 && this.qualityLevel > 0) {
          this.qualityLevel -= 1;
          this.highFpsMs = 0;
        }
      }

      seededUint(index) {
        const seed = this.seedForStreams == null ? 0 : this.seedForStreams;
        let x = (seed ^ Math.imul(index + 1 + this._reseedNonce, 0x45d9f3b)) >>> 0;
        x ^= x >>> 16;
        x = Math.imul(x, 0x7feb352d) >>> 0;
        x ^= x >>> 15;
        x = Math.imul(x, 0x846ca68b) >>> 0;
        x ^= x >>> 16;
        return x >>> 0;
      }

      seededFloat(index) {
        return this.seededUint(index) / 0x100000000;
      }

      reseedStreams() {
        this._reseedNonce += 1;
        for (let i = 0; i < this.streams.length; i++) {
          const s = this.streams[i];
          const base = this.seedForStreams == null ? ((Math.random() * 0xffffffff) >>> 0) : this.seededUint(i * 17 + 3);
          s.randState = base || 0x9e3779b9;
          s.phase = (this.seedForStreams == null ? Math.random() : this.seededFloat(i * 23 + 9)) * Math.PI * 2;
        }
      }

      nextStreamRand(stream) {
        if (this.seedForStreams == null) return Math.random();
        let x = stream.randState >>> 0;
        x ^= (x << 13) >>> 0;
        x ^= x >>> 17;
        x ^= (x << 5) >>> 0;
        stream.randState = x >>> 0;
        return stream.randState / 0x100000000;
      }

      computeLaneCount(fontPx, density) {
        const effectiveDensity = clamp(density, LIMITS.density[0], LIMITS.density[1]);
        const q = this.getEffectiveQualityLevel();
        let capFactor = 1.0;
        if (q >= 1) capFactor *= 0.92;
        if (q >= 2) capFactor *= 0.82;
        if (q >= 3) capFactor *= 0.72;
        const spacing = Math.max(6, fontPx / effectiveDensity);
        let count = Math.floor(this.width / spacing);
        const hardCap = Math.floor((this.width / Math.max(8, fontPx * 0.5)) * capFactor);
        count = Math.min(count, Math.max(10, hardCap));
        return Math.max(10, count);
      }

      rebuildStreams(force) {
        if (!this.width || !this.height) return;
        const fontPx = Math.round(this.current.fontPx || this.target.fontPx || 20);
        const density = this.current.density || this.target.density || 1.0;
        const nextCount = this.computeLaneCount(fontPx, density);
        const prev = this.streams;
        const next = new Array(nextCount);
        for (let i = 0; i < nextCount; i++) {
          const old = prev[i % Math.max(1, prev.length)] || null;
          next[i] = old
            ? this.cloneRemapStream(old, i, nextCount)
            : this.makeStream(i, nextCount);
        }
        this.streams = next;
        this.layoutFontPx = fontPx;
        this.layoutDensity = density;
        if (force) {
          for (let i = 0; i < this.streams.length; i++) {
            this.resetStreamEdge(this.streams[i], i, true);
          }
        }
      }

      cloneRemapStream(old, i, count) {
        const stream = Object.assign({}, old);
        stream.laneIndex = i;
        stream.laneCount = count;
        stream.laneXNorm = count > 1 ? i / (count - 1) : 0.5;
        stream.randState = (stream.randState ^ ((i + 1) * 0x9e3779b9)) >>> 0;
        return stream;
      }

      makeStream(i, count) {
        const seeded = this.seedForStreams != null;
        const rnd = (n) => (seeded ? this.seededFloat(i * 101 + n) : Math.random());
        return {
          laneIndex: i,
          laneCount: count,
          laneXNorm: count > 1 ? i / (count - 1) : 0.5,
          x: rnd(1) * this.width,
          y: rnd(2) * this.height,
          speedMul: 0.6 + rnd(3) * 1.8,
          phase: rnd(4) * Math.PI * 2,
          headLen: 7 + Math.floor(rnd(5) * 10),
          trailBias: rnd(6),
          randState: (rnd(7) * 0xffffffff) >>> 0 || 0x9e3779b9,
          tick: 0,
        };
      }

      resetStreamEdge(stream, i, randomizeInside) {
        stream.laneIndex = i;
        stream.laneCount = this.streams.length;
        stream.laneXNorm = this.streams.length > 1 ? i / (this.streams.length - 1) : 0.5;
        if (randomizeInside) {
          stream.x = stream.laneXNorm * this.width;
          stream.y = Math.random() * this.height;
        }
        stream.speedMul = clamp(0.55 + this.nextStreamRand(stream) * 1.9, 0.4, 2.8);
        stream.phase = this.nextStreamRand(stream) * Math.PI * 2;
        stream.headLen = 7 + Math.floor(this.nextStreamRand(stream) * 10);
        stream.trailBias = this.nextStreamRand(stream);
        stream.tick = 0;
      }

      maybeRebuildLayout() {
        if (this.layoutCooldown > 0) {
          this.layoutCooldown -= 1;
          return;
        }
        const fontDelta = Math.abs(this.current.fontPx - this.layoutFontPx);
        const densityDelta = Math.abs(this.current.density - this.layoutDensity);
        if (fontDelta >= 1.5 || densityDelta >= 0.12) {
          this.rebuildStreams(false);
          this.layoutCooldown = 8;
        }
      }

      smoothTowardTarget(dt) {
        const c = this.current;
        const t = this.target;

        const snap = !!t.snapNext;
        if (snap) {
          const next = copyState(t);
          next.snapNext = false;
          this.current = next;
          this.target.snapNext = false;
          if (t.charsetMode !== this.charsetToMode) {
            this.charsetFromMode = this.getCurrentVisibleCharsetMode();
            this.charsetToMode = t.charsetMode;
            this.charsetBlend = 0;
          }
          this.maybeRebuildLayout();
          return;
        }

        if (!c.freezeMotion) {
          c.speed = expApproach(c.speed, t.speed, dt, SMOOTH_K.speed);
          c.angleRad = angleLerp(c.angleRad, t.angleRad, dt, SMOOTH_K.angleRad);
          c.wave = expApproach(c.wave, t.wave, dt, SMOOTH_K.wave);
          c.jitter = expApproach(c.jitter, t.jitter, dt, SMOOTH_K.jitter);
          c.driftStrength = expApproach(c.driftStrength, t.driftStrength, dt, SMOOTH_K.driftStrength);
          c.noise = expApproach(c.noise, t.noise, dt, SMOOTH_K.noise);
          c.freezeMotion = t.freezeMotion;
        } else {
          c.freezeMotion = t.freezeMotion;
        }

        if (!c.freezeColor) {
          c.hueDeg = hueLerp(c.hueDeg, t.hueDeg, dt, SMOOTH_K.hueDeg);
          c.saturationPct = expApproach(c.saturationPct, t.saturationPct, dt, SMOOTH_K.saturationPct);
          c.lightnessPct = expApproach(c.lightnessPct, t.lightnessPct, dt, SMOOTH_K.lightnessPct);
          c.freezeColor = t.freezeColor;
        } else {
          c.freezeColor = t.freezeColor;
        }

        if (!c.freezeGeometry) {
          c.fontPx = expApproach(c.fontPx, t.fontPx, dt, SMOOTH_K.fontPx);
          c.density = expApproach(c.density, t.density, dt, SMOOTH_K.density);
          c.perspective = expApproach(c.perspective, t.perspective, dt, SMOOTH_K.perspective);
          c.freezeGeometry = t.freezeGeometry;
        } else {
          c.freezeGeometry = t.freezeGeometry;
        }

        c.fadeAlpha = expApproach(c.fadeAlpha, t.fadeAlpha, dt, SMOOTH_K.fadeAlpha);
        c.charsetMode = t.charsetMode;
        c.seed = t.seed;
        c.snapNext = false;

        if (this.charsetToMode !== t.charsetMode && this.charsetBlend >= 1) {
          this.charsetFromMode = this.charsetVisibleMode;
          this.charsetToMode = t.charsetMode;
          this.charsetBlend = 0;
        }

        if (this.charsetBlend < 1) {
          this.charsetBlend = clamp(this.charsetBlend + dt / this.charsetBlendDuration, 0, 1);
          if (this.charsetBlend >= 1) {
            this.charsetVisibleMode = this.charsetToMode;
          }
        } else {
          this.charsetVisibleMode = t.charsetMode;
        }

        this.maybeRebuildLayout();
      }

      getCharsetsForBlend() {
        const fromSet = CHARSETS[this.charsetFromMode] || CHARSET_MIXED;
        const toSet = CHARSETS[this.charsetToMode] || CHARSET_MIXED;
        return { fromSet, toSet, blend: this.charsetBlend };
      }

      sampleChar(stream, segmentIndex, charsets) {
        const { fromSet, toSet, blend } = charsets;
        const q = this.getEffectiveQualityLevel();
        let chooseTo = true;
        if (blend < 1) {
          const thresholdRand = this.nextStreamRand(stream);
          chooseTo = thresholdRand < blend;
        }
        const set = chooseTo ? toSet : fromSet;
        const idx = Math.floor(this.nextStreamRand(stream) * set.length) % set.length;
        const ch = set[idx];
        if (q >= 2 && segmentIndex > 0 && this.nextStreamRand(stream) < 0.05) return "";
        return ch;
      }

      respawnIfOffscreen(stream, dirX, dirY, fontPx) {
        const margin = fontPx * 6;
        if (
          stream.x > this.width + margin ||
          stream.x < -margin ||
          stream.y > this.height + margin ||
          stream.y < -margin
        ) {
          const alongX = dirX;
          const alongY = dirY;
          const r = this.nextStreamRand(stream);
          if (Math.abs(alongY) >= Math.abs(alongX)) {
            stream.y = alongY >= 0 ? -margin - r * this.height * 0.2 : this.height + margin + r * this.height * 0.2;
            stream.x = stream.laneXNorm * this.width;
          } else {
            stream.x = alongX >= 0 ? -margin - r * this.width * 0.2 : this.width + margin + r * this.width * 0.2;
            stream.y = this.nextStreamRand(stream) * this.height;
          }
          stream.speedMul = clamp(0.55 + this.nextStreamRand(stream) * 1.9, 0.4, 2.8);
          stream.phase = this.nextStreamRand(stream) * Math.PI * 2;
          stream.headLen = 7 + Math.floor(this.nextStreamRand(stream) * 10);
          stream.tick = 0;
        }
      }

      drawFrame(dt) {
        if (!this.width || !this.height) return;
        const effectiveDt = this.paused ? 0 : dt;
        if (!this.paused) this.time += effectiveDt;
        this.trackFps(Math.max(0.0001, dt));
        this.smoothTowardTarget(effectiveDt);

        const q = this.getEffectiveQualityLevel();
        let fadeAlpha = clamp(this.current.fadeAlpha, LIMITS.fadeAlpha[0], LIMITS.fadeAlpha[1]);
        if (q >= 1) fadeAlpha = clamp(fadeAlpha + 0.004, LIMITS.fadeAlpha[0], LIMITS.fadeAlpha[1] + 0.02);
        if (q >= 3) fadeAlpha = clamp(fadeAlpha + 0.01, LIMITS.fadeAlpha[0], LIMITS.fadeAlpha[1] + 0.03);

        if (!this.paused) {
          this.ctx.fillStyle = `rgba(0,0,0,${fadeAlpha.toFixed(3)})`;
          this.ctx.fillRect(0, 0, this.width, this.height);
        }

        const charsets = this.getCharsetsForBlend();
        const fontPx = Math.max(10, Math.round(this.current.fontPx));
        const baseFont = fontPx;
        const baseHue = wrapDeg(this.current.hueDeg);
        const baseSat = clamp(this.current.saturationPct, LIMITS.saturationPct[0], LIMITS.saturationPct[1]);
        const baseLight = clamp(this.current.lightnessPct, LIMITS.lightnessPct[0], LIMITS.lightnessPct[1]);
        const angle = this.current.angleRad;
        const dirX = Math.cos(angle);
        const dirY = Math.sin(angle);
        const perpX = -dirY;
        const perpY = dirX;
        let density = this.current.density;
        if (q >= 2) density = Math.min(density, 1.2);
        if (q >= 3) density = Math.min(density, 1.0);

        const speed = this.current.speed;
        let jitter = this.current.jitter;
        let wave = this.current.wave;
        let noise = this.current.noise;
        if (q >= 2) {
          jitter *= 0.88;
          wave *= 0.9;
          noise *= 0.9;
        }
        if (q >= 3) {
          jitter *= 0.75;
          wave *= 0.75;
          noise *= 0.75;
        }

        const driftStrength = this.current.driftStrength;
        const perspective = this.current.perspective;

        const desiredCount = this.computeLaneCount(baseFont, density);
        if (desiredCount !== this.streams.length && this.layoutCooldown === 0) {
          this.rebuildStreams(false);
          this.layoutCooldown = 8;
        }

        const maxSegmentsBase = 13;
        const maxSegments = q >= 3 ? 7 : q >= 2 ? 9 : q >= 1 ? 11 : maxSegmentsBase;
        const drawCount = this.streams.length;

        for (let i = 0; i < drawCount; i++) {
          const s = this.streams[i];
          const laneTargetX = s.laneXNorm * this.width;
          s.x = lerp(s.x, laneTargetX, 0.08);

          if (!this.paused) {
            const noiseField = noise * Math.sin(this.time * 0.9 + s.phase + (s.x * 0.003) + (s.y * 0.002));
            const noiseTurn = noiseField * 0.25;
            const ndx = Math.cos(angle + noiseTurn);
            const ndy = Math.sin(angle + noiseTurn);
            const lateral = driftStrength * Math.sin(this.time * 1.1 + s.phase * 1.9) * baseFont * 0.08;
            const v = speed * baseFont * (1.7 + s.speedMul * 0.7);
            s.x += (ndx + perpX * lateral * 0.02) * v * effectiveDt;
            s.y += (ndy + perpY * lateral * 0.02) * v * effectiveDt;
            s.tick += 1;
          }

          const waveX = wave * Math.sin(this.time * 1.4 + s.phase) * baseFont;
          const waveY = wave * Math.cos(this.time * 1.15 + s.phase * 1.13) * baseFont;

          for (let seg = 0; seg < Math.min(maxSegments, s.headLen + 4); seg++) {
            const tSeg = seg / Math.max(1, maxSegments - 1);
            const backDist = seg * baseFont * (0.95 + 0.15 * s.trailBias);
            const bx = s.x - dirX * backDist;
            const by = s.y - dirY * backDist;
            const jitterScale = jitter * baseFont * (seg === 0 ? 0.65 : 0.4);
            const jx = (this.nextStreamRand(s) - 0.5) * jitterScale;
            const jy = (this.nextStreamRand(s) - 0.5) * jitterScale;

            const px = bx + waveX * (0.35 + tSeg * 0.65) + jx;
            const py = by + waveY * (0.35 + tSeg * 0.65) + jy;

            if (px < -baseFont * 4 || px > this.width + baseFont * 4 || py < -baseFont * 4 || py > this.height + baseFont * 4) {
              continue;
            }

            const depthNorm = clamp(py / Math.max(1, this.height), 0, 1);
            const depthScale = 1 + perspective * (depthNorm - 0.5) * 0.7;
            const fontSeg = clamp(Math.round(baseFont * depthScale), 8, 120);
            this.ctx.font = `${fontSeg}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", monospace`;

            const headBoost = seg === 0 ? 16 : Math.max(0, 10 - seg * 1.3);
            const light = clamp(baseLight + headBoost + perspective * depthNorm * 6, 18, 96);
            const sat = clamp(baseSat - seg * 0.3, 24, 100);
            const alpha = clamp(0.2 + (1 - tSeg) * 0.8, 0.08, 1);

            const ch = this.sampleChar(s, seg, charsets);
            if (!ch) continue;
            this.ctx.fillStyle = `hsla(${Math.round(baseHue)}, ${sat.toFixed(0)}%, ${light.toFixed(0)}%, ${alpha.toFixed(3)})`;
            this.ctx.fillText(ch, px, py);
          }

          this.respawnIfOffscreen(s, dirX, dirY, baseFont);
        }
      }
    }

    const renderer = new RainRenderer(dom.canvas, ctx);

    function selectorHelpRows() {
      const rows = [];
      for (const [k, def] of Object.entries(SELECTOR_DEFS)) {
        let rule = "";
        switch (k) {
          case "S": rule = "literal / 100 -> speed"; break;
          case "A": rule = "degrees -> angle"; break;
          case "H": rule = "degrees, wrapped 0..360"; break;
          case "F": rule = "font pixels"; break;
          case "T": rule = "fade percent / 100"; break;
          case "J": rule = "literal / 100 -> jitter"; break;
          case "W": rule = "literal / 100 -> wave"; break;
          case "D": rule = "literal / 100 -> density"; break;
          case "R": rule = "literal / 100 -> drift"; break;
          case "U": rule = "saturation percent"; break;
          case "L": rule = "lightness percent"; break;
          case "E": rule = "seed integer (uint32)"; break;
          case "N": rule = "literal / 100 -> noise"; break;
          case "P": rule = "literal / 100 -> perspective"; break;
          default: rule = def.label;
        }
        rows.push(`<tr><td><code>${k}</code></td><td>${escapeHtml(def.label)}</td><td>${escapeHtml(rule)}</td></tr>`);
      }
      return rows.join("");
    }

    let helpFilterCategory = "all";
    let helpSearchText = "";

    function renderHelpFilters() {
      const items = ["all"].concat(GLYPH_CATEGORIES, ["syntax", "examples"]);
      dom.helpFilters.innerHTML = "";
      for (const key of items) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "chip" + (helpFilterCategory === key ? " active" : "");
        btn.textContent = key;
        btn.dataset.filter = key;
        btn.addEventListener("click", () => {
          helpFilterCategory = key;
          renderHelpFilters();
          renderHelpBody();
          persistUiPrefs();
        });
        dom.helpFilters.appendChild(btn);
      }
    }

    function matchesHelpSearch(strings) {
      if (!helpSearchText) return true;
      const hay = strings.join(" ").toLowerCase();
      return hay.includes(helpSearchText.toLowerCase());
    }

    function renderHelpBody() {
      const parts = [];

      const showSyntax = helpFilterCategory === "all" || helpFilterCategory === "syntax";
      const showExamples = helpFilterCategory === "all" || helpFilterCategory === "examples";
      const categoryFilter = helpFilterCategory === "all" ? null : GLYPH_CATEGORIES.includes(helpFilterCategory) ? helpFilterCategory : null;

      if (showSyntax && matchesHelpSearch([HELP_CONCEPT.join(" "), "selector syntax grouping macros"])) {
        parts.push(
          `<section class="help-section"><h3>Concept + Syntax</h3>` +
            `<ul>${HELP_CONCEPT.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ul>` +
            `<p><strong>Examples:</strong> <code>S250=</code> <code>A135=</code> <code>(ᐊᐊᐅ)3</code> <code>@diag = ᐅᐅᗅ</code> <code>$diag</code></p>` +
            `</section>`
        );

        parts.push(
          `<section class="help-section"><h3>Numeric Selectors (v2)</h3>` +
            `<table><thead><tr><th>Sel</th><th>Channel</th><th>Scaling</th></tr></thead><tbody>${selectorHelpRows()}</tbody></table>` +
            `</section>`
        );
      }

      const glyphItems = GLYPH_DEFS.filter((g) => {
        if (categoryFilter && g.category !== categoryFilter) return false;
        return matchesHelpSearch([g.glyph, g.name, g.category, g.effect, g.notes, g.bounds]);
      });

      if ((helpFilterCategory === "all" || categoryFilter) && glyphItems.length) {
        parts.push('<section class="help-section"><h3>Glyph Reference</h3>');
        for (const g of glyphItems) {
          parts.push(
            `<div class="help-item">` +
              `<div class="help-item-header">` +
              `<div>` +
              `<div class="glyph">${escapeHtml(g.glyph)} <span class="name">${escapeHtml(g.name)}</span></div>` +
              `<div class="meta">${escapeHtml(codePointHex(g.glyph))} · ${escapeHtml(g.category)} · ${escapeHtml(g.smoothing)}</div>` +
              `</div>` +
              `<button type="button" class="palette-btn" data-insert="${escapeHtml(g.glyph)}" title="Insert ${escapeHtml(g.name)}">${escapeHtml(g.glyph)}</button>` +
              `</div>` +
              `<div class="desc">${escapeHtml(g.notes)}. Effect: ${escapeHtml(g.effect)}. Bounds: ${escapeHtml(g.bounds)}.</div>` +
              `</div>`
          );
        }
        parts.push("</section>");
      } else if ((helpFilterCategory === "all" || categoryFilter) && !glyphItems.length) {
        parts.push('<section class="help-section"><h3>Glyph Reference</h3><p>No glyphs match the current filter/search.</p></section>');
      }

      if (showExamples) {
        const examples = SAMPLES.filter((s) => matchesHelpSearch([s.name, s.description, s.code]));
        parts.push('<section class="help-section"><h3>Examples</h3>');
        if (!examples.length) {
          parts.push("<p>No examples match the current search.</p>");
        } else {
          for (const s of examples) {
            parts.push(
              `<div class="help-example">` +
                `<div>` +
                  `<div class="name">${escapeHtml(s.name)}</div>` +
                  `<div class="meta">${escapeHtml(s.description)}</div>` +
                  `<div class="help-example-code">${escapeHtml(s.code)}</div>` +
                `</div>` +
                `<button type="button" data-sample-load="${escapeHtml(s.name)}">Load</button>` +
              `</div>`
            );
          }
        }
        parts.push("</section>");
      }

      if (showSyntax && matchesHelpSearch([HELP_TROUBLESHOOTING.join(" "), "troubleshooting"])) {
        parts.push(
          `<section class="help-section"><h3>Troubleshooting</h3><ul>${HELP_TROUBLESHOOTING.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ul></section>`
        );
      }

      dom.helpBody.innerHTML = parts.join("");

      dom.helpBody.querySelectorAll("[data-insert]").forEach((btn) => {
        btn.addEventListener("click", () => insertAtCursor(btn.getAttribute("data-insert") || ""));
      });
      dom.helpBody.querySelectorAll("[data-sample-load]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const name = btn.getAttribute("data-sample-load");
          if (name) loadSampleByName(name);
        });
      });
    }

    function buildPaletteGroups() {
      const groups = [];
      for (const category of GLYPH_CATEGORIES) {
        const items = GLYPH_DEFS.filter((g) => g.category === category).map((g) => ({
          label: g.glyph,
          insert: g.glyph,
          title: `${g.name}: ${g.notes}`,
        }));
        groups.push({ title: category, items });
      }
      groups.push({ title: "selectors", items: SELECTOR_PALETTE });
      groups.push({ title: "syntax", items: SYNTAX_TOKENS });
      return groups;
    }

    function renderPalette() {
      const groups = buildPaletteGroups();
      dom.paletteGroups.innerHTML = "";
      for (const group of groups) {
        const wrap = document.createElement("div");
        wrap.className = "palette-group";
        const title = document.createElement("div");
        title.className = "palette-group-title";
        title.textContent = group.title;
        wrap.appendChild(title);
        const grid = document.createElement("div");
        grid.className = "palette-grid";
        for (const item of group.items) {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "palette-btn" + (item.label.length > 2 ? " small" : "");
          btn.textContent = item.label;
          btn.title = item.title || item.label;
          btn.addEventListener("click", (ev) => {
            const suffix = ev.shiftKey ? " " : "";
            insertAtCursor(item.insert + suffix);
          });
          grid.appendChild(btn);
        }
        wrap.appendChild(grid);
        dom.paletteGroups.appendChild(wrap);
      }
    }

    function insertAtCursor(text) {
      const el = dom.editor;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const before = el.value.slice(0, start);
      const after = el.value.slice(end);
      el.value = before + text + after;
      const nextPos = start + text.length;
      el.focus();
      el.setSelectionRange(nextPos, nextPos);
      onEditorChanged("insert");
    }

    function setAriaPressed(btn, on, labelWhenOn, labelWhenOff) {
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.textContent = on ? labelWhenOn : labelWhenOff;
    }

    function setHelpOpen(open) {
      dom.helpPanel.hidden = !open;
      dom.helpBtn.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) {
        renderHelpBody();
      }
      persistUiPrefs();
    }

    function setDim(on) {
      dom.ui.classList.toggle("dim-on", !!on);
      dom.ui.classList.toggle("dim-off", !on);
      setAriaPressed(dom.dimBtn, !!on, "Dim BG: ON", "Dim BG: OFF");
      state.ui.dimBackground = !!on;
      persistUiPrefs();
    }

    function setPaused(on) {
      renderer.setPaused(!!on);
      setAriaPressed(dom.pauseBtn, !!on, "Pause Rain: ON", "Pause Rain: OFF");
      state.ui.pauseRain = !!on;
      persistUiPrefs();
      updateRuntimeFlags();
    }

    function setPerfMode(on) {
      renderer.setManualPerformanceMode(!!on);
      dom.perfBtn.setAttribute("aria-pressed", on ? "true" : "false");
      dom.perfBtn.textContent = on ? "Perf: Manual" : "Perf: Auto";
      state.ui.performanceMode = !!on;
      persistUiPrefs();
      updateRuntimeFlags();
    }

    function setLive(on) {
      state.live = !!on;
      setAriaPressed(dom.liveBtn, state.live, "Live: ON", "Live: OFF");
      localStorage.setItem(STORAGE_KEYS.live, state.live ? "1" : "0");
      updateRuntimeFlags();
    }

    function showErrorBanner(message) {
      if (!message) {
        dom.errorBanner.hidden = true;
        dom.errorBanner.textContent = "";
        return;
      }
      dom.errorBanner.hidden = false;
      dom.errorBanner.textContent = message;
    }

    function flashStatusMessage(text) {
      state.transientStatus = { text, until: performance.now() + 2000 };
      updateStatus();
    }

    function persistUiPrefs() {
      localStorage.setItem(STORAGE_KEYS.helpOpen, dom.helpPanel.hidden ? "0" : "1");
      localStorage.setItem(STORAGE_KEYS.dimBackground, state.ui.dimBackground ? "1" : "0");
      localStorage.setItem(STORAGE_KEYS.pauseRain, state.ui.pauseRain ? "1" : "0");
      localStorage.setItem(STORAGE_KEYS.performanceMode, state.ui.performanceMode ? "1" : "0");
      localStorage.setItem(STORAGE_KEYS.helpSearch, dom.helpSearch.value || "");
    }

    function persistScript() {
      localStorage.setItem(STORAGE_KEYS.script, dom.editor.value);
    }

    function persistSampleName(name) {
      if (name) localStorage.setItem(STORAGE_KEYS.sampleName, name);
    }

    function updateRuntimeFlags() {
      const flags = [];
      flags.push({ label: state.live ? "live" : "run-only", active: state.live });
      if (state.lastCompile) {
        flags.push({ label: state.lastCompile.deterministic ? "deterministic" : "non-deterministic", active: state.lastCompile.deterministic });
        if (state.lastCompile.targetState.seed != null) flags.push({ label: `seed=${state.lastCompile.targetState.seed}`, active: true });
      }
      if (state.ui.pauseRain) flags.push({ label: "paused", active: true });
      if (state.ui.performanceMode) flags.push({ label: "perf-manual", active: true });
      dom.runtimeFlags.innerHTML = flags.map((f) => `<span class="chip${f.active ? " active" : ""}">${escapeHtml(f.label)}</span>`).join("");
    }

    function updateStatus() {
      const parts = [];
      if (state.transientStatus && performance.now() < state.transientStatus.until) {
        parts.push(state.transientStatus.text);
      }
      const c = state.lastCompile;
      if (c) {
        const d = c.diagnostics;
        parts.push(`tokens=${d.tokenCount}`);
        parts.push(`unknown=${d.unknownCount}`);
        parts.push(`warnings=${d.warnings.length}`);
        parts.push(`compile=${d.durationMs.toFixed(1)}ms`);
        parts.push(c.deterministic ? "deterministic" : "non-deterministic");
        if (d.firstUnknown) {
          parts.push(`firstUnknown=${d.firstUnknown.line}:${d.firstUnknown.col}`);
        }
      }
      const rs = renderer.getStats();
      parts.push(`fps=${rs.fpsAvg.toFixed(0)}`);
      parts.push(`quality=${renderer.getQualityLabel()}`);
      parts.push(`streams=${rs.streamCount}`);
      dom.status.textContent = parts.join(" | ");

      if (state.lastCompile) {
        const t = state.lastCompile.targetState;
        dom.effectiveStateText.textContent = [
          formatStateSummary(t),
          "",
          `freezeMotion=${t.freezeMotion} freezeColor=${t.freezeColor} freezeGeometry=${t.freezeGeometry}`,
          `snapNext=${t.snapNext}`,
          `macros(local/total)=${state.lastCompile.programMeta.localMacroCount}/${state.lastCompile.programMeta.macroCount}`,
          `expandedNodes=${state.lastCompile.programMeta.expandedNodeCount}`,
          state.lastCompile.diagnostics.warnings.slice(0, 10).map((w) => `warn ${w.code}${w.line ? ` @${w.line}:${w.col}` : ""}: ${w.message}`).join("\n"),
        ].filter(Boolean).join("\n");
      }
    }

    function debounce(fn, ms) {
      let timer = 0;
      return function debounced() {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          timer = 0;
          fn();
        }, ms);
      };
    }

    function loadSampleOptions() {
      dom.sampleSelect.innerHTML = "";
      for (const s of SAMPLES) {
        const opt = document.createElement("option");
        opt.value = s.name;
        opt.textContent = s.name;
        dom.sampleSelect.appendChild(opt);
      }
    }

    function findSample(name) {
      return SAMPLES.find((s) => s.name === name) || null;
    }

    function loadSampleByName(name) {
      const sample = findSample(name) || SAMPLES[0];
      if (!sample) return;
      dom.sampleSelect.value = sample.name;
      dom.editor.value = sample.code;
      persistSampleName(sample.name);
      persistScript();
      compileAndApply("sample-load", true);
    }

    function getSelectedOrAllText() {
      const el = dom.editor;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      if (start !== end) return el.value.slice(start, end);
      return el.value;
    }

    const state = {
      live: true,
      ui: {
        dimBackground: false,
        pauseRain: false,
        performanceMode: false,
      },
      userMacros: loadUserMacros(),
      lastCompile: null,
      lastGoodTargetState: defaultState(),
      transientStatus: null,
    };

    function renderMacroList() {
      const entries = Object.entries(state.userMacros).sort((a, b) => a[0].localeCompare(b[0]));
      if (!entries.length) {
        dom.macroList.innerHTML = '<div class="subtle">No saved macros yet.</div>';
        return;
      }
      dom.macroList.innerHTML = entries.map(([name, code]) => (
        `<div class="macro-item">` +
          `<div class="macro-head">` +
            `<div class="macro-name">$${escapeHtml(name)}</div>` +
            `<div class="macro-actions">` +
              `<button type="button" data-macro-insert="${escapeHtml(name)}">Insert</button>` +
              `<button type="button" data-macro-delete="${escapeHtml(name)}">Delete</button>` +
            `</div>` +
          `</div>` +
          `<div class="macro-code">${escapeHtml(code)}</div>` +
        `</div>`
      )).join("");

      dom.macroList.querySelectorAll("[data-macro-insert]").forEach((btn) => {
        btn.addEventListener("click", () => insertAtCursor(`$${btn.getAttribute("data-macro-insert")}`));
      });
      dom.macroList.querySelectorAll("[data-macro-delete]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const name = btn.getAttribute("data-macro-delete");
          if (!name) return;
          delete state.userMacros[name];
          saveUserMacros(state.userMacros);
          renderMacroList();
          flashStatusMessage(`Deleted macro ${name}`);
        });
      });
    }

    function compileAndApply(reason, immediate) {
      try {
        showErrorBanner("");
        const result = compileScript(dom.editor.value, state.userMacros);
        state.lastCompile = result;
        state.lastGoodTargetState = copyState(result.targetState);
        renderer.setTargetState(result.targetState);
        updateRuntimeFlags();
        updateStatus();
        if (reason !== "restore") {
          persistScript();
        }
        if (result.diagnostics.errors.length) {
          showErrorBanner(result.diagnostics.errors[0].message);
        }
      } catch (err) {
        console.error(err);
        showErrorBanner(`Internal error while compiling script. Continuing with last known good state. ${err && err.message ? err.message : String(err)}`);
        renderer.setTargetState(state.lastGoodTargetState);
      }
      if (immediate) updateStatus();
    }

    const debouncedCompile = debounce(() => compileAndApply("live", false), 100);

    function onEditorChanged(sourceTag) {
      persistScript();
      if (state.live) {
        debouncedCompile();
      }
      if (sourceTag === "insert") {
        updateStatus();
      }
    }

    async function copyShareLink() {
      const encoded = utf8ToBase64Url(dom.editor.value || "");
      const url = new URL(window.location.href);
      url.searchParams.set(URL_PARAMS.script, encoded);
      url.searchParams.delete(URL_PARAMS.sample);
      if (!state.live) url.searchParams.set(URL_PARAMS.live, "0");
      else url.searchParams.delete(URL_PARAMS.live);
      const text = url.toString();
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          const temp = document.createElement("input");
          temp.value = text;
          document.body.appendChild(temp);
          temp.select();
          document.execCommand("copy");
          temp.remove();
        }
        flashStatusMessage("Share link copied");
      } catch (err) {
        flashStatusMessage("Copy failed; link available in console");
        console.log("Share link:", text);
      }
      updateStatus();
    }

    function resizeCanvas() {
      renderer.setSize(window.innerWidth, window.innerHeight);
      updateStatus();
    }

    function restoreFromUrlOrStorage() {
      const params = new URLSearchParams(window.location.search);
      const scriptParam = params.get(URL_PARAMS.script);
      const sampleParam = params.get(URL_PARAMS.sample);
      const liveParam = params.get(URL_PARAMS.live);

      if (liveParam === "0") setLive(false);
      else if (liveParam === "1") setLive(true);
      else setLive(localStorage.getItem(STORAGE_KEYS.live) !== "0");

      helpSearchText = localStorage.getItem(STORAGE_KEYS.helpSearch) || "";
      dom.helpSearch.value = helpSearchText;
      state.ui.dimBackground = localStorage.getItem(STORAGE_KEYS.dimBackground) === "1";
      state.ui.pauseRain = localStorage.getItem(STORAGE_KEYS.pauseRain) === "1";
      state.ui.performanceMode = localStorage.getItem(STORAGE_KEYS.performanceMode) === "1";
      const helpOpen = localStorage.getItem(STORAGE_KEYS.helpOpen) === "1";

      setDim(state.ui.dimBackground);
      setPaused(state.ui.pauseRain);
      setPerfMode(state.ui.performanceMode);
      setHelpOpen(helpOpen);

      let loaded = false;
      if (scriptParam) {
        try {
          dom.editor.value = base64UrlToUtf8(scriptParam);
          loaded = true;
          flashStatusMessage("Loaded script from URL");
        } catch (err) {
          console.warn("Failed to decode share script", err);
          showErrorBanner("Failed to decode ?s= share link; using local/default script.");
        }
      }

      if (!loaded) {
        const storedScript = localStorage.getItem(STORAGE_KEYS.script);
        if (typeof storedScript === "string" && storedScript.length) {
          dom.editor.value = storedScript;
          loaded = true;
        }
      }

      if (!loaded && sampleParam && findSample(sampleParam)) {
        loadSampleByName(sampleParam);
        loaded = true;
      }

      if (!loaded) {
        const storedSample = localStorage.getItem(STORAGE_KEYS.sampleName);
        if (storedSample && findSample(storedSample)) {
          loadSampleByName(storedSample);
        } else if (SAMPLES[0]) {
          loadSampleByName(SAMPLES[0].name);
        }
      } else {
        const selected = localStorage.getItem(STORAGE_KEYS.sampleName);
        if (selected && findSample(selected)) dom.sampleSelect.value = selected;
      }
    }

    function saveMacroFromSelectionOrAll() {
      const rawName = dom.macroNameInput.value.trim();
      if (!/^[A-Za-z_][A-Za-z0-9_]{0,31}$/.test(rawName)) {
        flashStatusMessage("Macro name must match [A-Za-z_][A-Za-z0-9_]{0,31}");
        updateStatus();
        return;
      }
      const code = getSelectedOrAllText().trim();
      if (!code) {
        flashStatusMessage("Nothing to save (selection/script is empty)");
        updateStatus();
        return;
      }
      state.userMacros[rawName] = code;
      saveUserMacros(state.userMacros);
      renderMacroList();
      flashStatusMessage(`Saved macro ${rawName}`);
      compileAndApply("macro-save", true);
    }

    function bindEvents() {
      window.addEventListener("resize", resizeCanvas);

      dom.editor.addEventListener("input", () => onEditorChanged("input"));

      dom.editor.addEventListener("keydown", (ev) => {
        const mod = ev.ctrlKey || ev.metaKey;
        if (mod && ev.key === "Enter") {
          ev.preventDefault();
          compileAndApply("run-shortcut", true);
          return;
        }
        if (ev.key === "Escape" && !dom.helpPanel.hidden) {
          ev.preventDefault();
          setHelpOpen(false);
          return;
        }
      });

      dom.loadSampleBtn.addEventListener("click", () => {
        loadSampleByName(dom.sampleSelect.value);
      });

      dom.runBtn.addEventListener("click", () => {
        compileAndApply("run", true);
      });

      dom.liveBtn.addEventListener("click", () => {
        setLive(!state.live);
        if (state.live) compileAndApply("live-toggle", true);
      });

      dom.shareBtn.addEventListener("click", () => {
        copyShareLink();
      });

      dom.dimBtn.addEventListener("click", () => setDim(!state.ui.dimBackground));
      dom.pauseBtn.addEventListener("click", () => setPaused(!state.ui.pauseRain));
      dom.perfBtn.addEventListener("click", () => setPerfMode(!state.ui.performanceMode));

      dom.helpBtn.addEventListener("click", () => setHelpOpen(dom.helpPanel.hidden));

      dom.helpSearch.addEventListener("input", () => {
        helpSearchText = dom.helpSearch.value || "";
        renderHelpBody();
        persistUiPrefs();
      });

      dom.saveMacroBtn.addEventListener("click", saveMacroFromSelectionOrAll);
    }

    function loop() {
      let last = performance.now();
      function frame(now) {
        const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
        last = now;
        renderer.drawFrame(dt);
        if (state.transientStatus && performance.now() > state.transientStatus.until) {
          state.transientStatus = null;
        }
        updateStatus();
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }

    function init() {
      loadSampleOptions();
      renderPalette();
      renderHelpFilters();
      renderHelpBody();
      renderMacroList();
      bindEvents();
      restoreFromUrlOrStorage();
      if (!dom.editor.value && SAMPLES[0]) {
        dom.editor.value = SAMPLES[0].code;
      }
      resizeCanvas();
      compileAndApply("restore", true);
      updateRuntimeFlags();
      updateStatus();
      loop();
    }

    init();
  });
})();
