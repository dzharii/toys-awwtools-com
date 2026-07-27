(() => {
  "use strict";

  const VERSION = "1.0.0";
  const COLS = 72;
  const ROWS = 24;
  const GLYPH_SET = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#$%&*+-/=?[]{}<>";
  const PRINTABLE = /^[\x20-\x7E]*$/;

  const PROFILES = {
    user: { cps: 22, variation: 0.13, sound: "key", intensity: 1.0 },
    computer: { cps: 29, variation: 0.10, sound: "print", intensity: 0.86 },
    heading: { cps: 16, variation: 0.055, sound: "printHeavy", intensity: 1.0 },
    burst: { cps: 78, variation: 0.16, sound: "printLight", intensity: 0.76 },
    slow: { cps: 10, variation: 0.06, sound: "printHeavy", intensity: 1.0 }
  };

  const EFFECT_LEVELS = ["FULL", "LOW", "OFF"];

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function seededUnit(seed) {
    let x = seed | 0;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return ((x >>> 0) % 100000) / 100000;
  }

  function hashCell(x, y, salt = 0) {
    return ((x + 1) * 73856093) ^ ((y + 1) * 19349663) ^ (salt * 83492791);
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randomGlyph() {
    return GLYPH_SET[Math.floor(Math.random() * GLYPH_SET.length)];
  }

  class TerminalBuffer {
    constructor(cols, rows) {
      this.cols = cols;
      this.rows = rows;
      this.cells = [];
      this.cursor = { x: 0, y: 0, visible: false, hotUntil: 0 };
      this.clear();
    }

    createCell() {
      return {
        char: " ",
        writtenAt: -Infinity,
        intensity: 0,
        mode: "normal",
        seed: 0,
        corruptUntil: 0
      };
    }

    clear(now = performance.now()) {
      this.cells = Array.from({ length: this.rows }, () =>
        Array.from({ length: this.cols }, () => this.createCell())
      );
      this.cursor = { x: 0, y: 0, visible: false, hotUntil: now };
    }

    get(x, y) {
      if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return null;
      return this.cells[y][x];
    }

    write(x, y, char, options = {}) {
      const cell = this.get(x, y);
      if (!cell) return;
      const now = options.now ?? performance.now();
      cell.char = String(char || " ").slice(0, 1);
      cell.writtenAt = now;
      cell.intensity = options.intensity ?? 0.88;
      cell.mode = options.mode ?? "normal";
      cell.seed = options.seed ?? hashCell(x, y, Math.floor(now));
      cell.corruptUntil = options.corruptFor ? now + options.corruptFor : 0;
    }

    writeText(x, y, text, options = {}) {
      let px = x;
      let py = y;
      for (const char of String(text)) {
        if (char === "\n") {
          px = x;
          py += 1;
          continue;
        }
        if (px >= this.cols) {
          px = 0;
          py += 1;
        }
        if (py >= this.rows) break;
        this.write(px, py, char, options);
        px += 1;
      }
      return { x: px, y: py };
    }

    clearCell(x, y) {
      if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return;
      this.cells[y][x] = this.createCell();
    }

    clearRow(y, fromX = 0, toX = this.cols - 1) {
      if (y < 0 || y >= this.rows) return;
      for (let x = clamp(fromX, 0, this.cols - 1); x <= clamp(toX, 0, this.cols - 1); x += 1) {
        this.clearCell(x, y);
      }
    }

    drawRule(x1, x2, y, options = {}) {
      const from = clamp(Math.min(x1, x2), 0, this.cols - 1);
      const to = clamp(Math.max(x1, x2), 0, this.cols - 1);
      for (let x = from; x <= to; x += 1) {
        this.write(x, y, "_", { ...options, mode: "rule" });
      }
    }

    scroll(lines = 1) {
      const count = clamp(lines, 0, this.rows);
      for (let i = 0; i < count; i += 1) {
        this.cells.shift();
        this.cells.push(Array.from({ length: this.cols }, () => this.createCell()));
      }
      this.cursor.y = Math.max(0, this.cursor.y - count);
    }

    setCursor(x, y, visible = true, now = performance.now()) {
      this.cursor.x = clamp(x, 0, this.cols - 1);
      this.cursor.y = clamp(y, 0, this.rows - 1);
      this.cursor.visible = visible;
      this.cursor.hotUntil = now + 100;
    }
  }

  class TerminalRenderer {
    constructor(canvas, buffer) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
      this.buffer = buffer;
      this.coreCanvas = document.createElement("canvas");
      this.glowCanvas = document.createElement("canvas");
      this.historyCanvas = document.createElement("canvas");
      this.coreCtx = this.coreCanvas.getContext("2d");
      this.glowCtx = this.glowCanvas.getContext("2d");
      this.historyCtx = this.historyCanvas.getContext("2d");
      this.width = 0;
      this.height = 0;
      this.dpr = 1;
      this.cellW = 0;
      this.cellH = 0;
      this.marginX = 0;
      this.marginY = 0;
      this.fontPx = 20;
      this.effectLevel = matchMedia("(prefers-reduced-motion: reduce)").matches ? "LOW" : "FULL";
      this.frame = 0;
      this.lastTime = performance.now();
      this.glitchPulse = 0;
      this.whiteStreaks = [];
      this.boundRender = this.render.bind(this);
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this.canvas.parentElement);
      this.resize();
      requestAnimationFrame(this.boundRender);
    }

    setEffectLevel(level) {
      this.effectLevel = EFFECT_LEVELS.includes(level) ? level : "FULL";
      if (level === "OFF") {
        this.whiteStreaks.length = 0;
        this.glitchPulse = 0;
      }
    }

    pulseGlitch(amount = 1) {
      if (this.effectLevel === "OFF") return;
      this.glitchPulse = Math.max(this.glitchPulse, amount);
    }

    addStreak(row, from = 2, to = COLS - 3, duration = 180, white = false) {
      if (this.effectLevel === "OFF") return;
      this.whiteStreaks.push({
        row: clamp(row, 0, ROWS - 1),
        from,
        to,
        startedAt: performance.now(),
        duration,
        white
      });
    }

    resize() {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      const nextDpr = Math.min(window.devicePixelRatio || 1, 2);
      const nextWidth = Math.max(1, Math.round(rect.width * nextDpr));
      const nextHeight = Math.max(1, Math.round(rect.height * nextDpr));
      if (nextWidth === this.width && nextHeight === this.height && nextDpr === this.dpr) return;

      this.width = nextWidth;
      this.height = nextHeight;
      this.dpr = nextDpr;
      for (const layer of [this.canvas, this.coreCanvas, this.glowCanvas, this.historyCanvas]) {
        layer.width = nextWidth;
        layer.height = nextHeight;
      }

      this.marginX = this.width * 0.052;
      this.marginY = this.height * 0.075;
      const usableW = this.width - this.marginX * 2;
      const usableH = this.height - this.marginY * 2;
      this.cellW = usableW / this.buffer.cols;
      this.cellH = usableH / this.buffer.rows;
      this.fontPx = Math.min(this.cellH * 0.82, this.cellW * 1.72);

      this.historyCtx.fillStyle = "#010705";
      this.historyCtx.fillRect(0, 0, this.width, this.height);
    }

    configureTextContext(ctx) {
      ctx.font = `600 ${this.fontPx}px "Courier New", Courier, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = Math.max(0.5, this.dpr * 0.34);
    }

    glyphForCell(cell, age) {
      if (cell.corruptUntil > performance.now()) return randomGlyph();
      if (this.effectLevel === "FULL" && age < 85 && cell.char.trim()) {
        const chance = seededUnit(cell.seed);
        if (chance < 0.18 && Math.floor(age / 22) % 2 === 0) {
          return GLYPH_SET[Math.abs(cell.seed) % GLYPH_SET.length];
        }
      }
      return cell.char;
    }

    renderCell(ctx, cell, x, y, now, layer) {
      if (!cell || cell.char === " " || cell.intensity <= 0) return;
      const age = Math.max(0, now - cell.writtenAt);
      const strike = clamp(1 - age / 85, 0, 1);
      const settle = clamp(1 - age / 360, 0, 1);
      const persistent = 0.58 + cell.intensity * 0.34;
      const flickerScale = this.effectLevel === "FULL" ? 0.020 : this.effectLevel === "LOW" ? 0.006 : 0;
      const localFlicker = 1 + Math.sin(now * 0.019 + cell.seed * 0.001) * flickerScale;
      let alpha = clamp((persistent + strike * 0.30 + settle * 0.09) * localFlicker, 0, 1);
      const glyph = this.glyphForCell(cell, age);
      const cx = this.marginX + (x + 0.5) * this.cellW;
      const cy = this.marginY + (y + 0.52) * this.cellH;
      let jitterX = 0;
      let jitterY = 0;

      if (this.effectLevel === "FULL" && age < 100) {
        jitterX = (seededUnit(cell.seed + Math.floor(age / 18)) - 0.5) * this.dpr * 1.2;
        jitterY = (seededUnit(cell.seed - Math.floor(age / 17)) - 0.5) * this.dpr * 0.7;
      }

      if (layer === "glow") {
        alpha *= 0.54 + strike * 0.66;
        ctx.fillStyle = `rgba(30, 255, 151, ${alpha})`;
        ctx.fillText(glyph, cx + jitterX, cy + jitterY);
        if (strike > 0.4) {
          ctx.fillStyle = `rgba(215, 255, 232, ${strike * 0.72})`;
          ctx.fillText(glyph, cx + jitterX, cy + jitterY);
        }
        return;
      }

      const hot = strike > 0.12;
      ctx.fillStyle = hot
        ? `rgba(${Math.round(lerp(64, 238, strike))}, 255, ${Math.round(lerp(172, 234, strike))}, ${alpha})`
        : `rgba(61, 255, 174, ${alpha})`;
      ctx.strokeStyle = `rgba(25, 160, 104, ${alpha * 0.26})`;
      ctx.strokeText(glyph, cx + jitterX, cy + jitterY);
      ctx.fillText(glyph, cx + jitterX, cy + jitterY);

      if (cell.mode === "rule") {
        const yy = cy + this.cellH * 0.27;
        ctx.fillStyle = `rgba(68, 255, 190, ${alpha * 0.68})`;
        ctx.fillRect(cx - this.cellW * 0.49, yy, this.cellW * 0.98, Math.max(1, this.dpr));
      }
    }

    drawCursor(ctx, now, layer) {
      const cursor = this.buffer.cursor;
      if (!cursor.visible) return;
      const cycle = Math.floor(now / 520) % 2;
      const pulse = now < cursor.hotUntil ? 1 : cycle ? 0.72 : 0.30;
      const x = this.marginX + cursor.x * this.cellW + this.cellW * 0.14;
      const y = this.marginY + cursor.y * this.cellH + this.cellH * 0.18;
      const w = this.cellW * 0.72;
      const h = this.cellH * 0.62;

      if (layer === "glow") {
        ctx.fillStyle = `rgba(49, 255, 165, ${pulse * 0.72})`;
        ctx.fillRect(x, y, w, h);
      } else {
        ctx.fillStyle = `rgba(226, 255, 233, ${pulse})`;
        ctx.fillRect(x, y, w, h);
      }
    }

    drawStreaks(ctx, now, layer) {
      this.whiteStreaks = this.whiteStreaks.filter((streak) => now - streak.startedAt <= streak.duration);
      for (const streak of this.whiteStreaks) {
        const age = now - streak.startedAt;
        const t = clamp(age / streak.duration, 0, 1);
        const alpha = Math.sin(t * Math.PI);
        const y = this.marginY + (streak.row + 0.72) * this.cellH;
        const x1 = this.marginX + streak.from * this.cellW;
        const x2 = this.marginX + streak.to * this.cellW;
        if (layer === "glow") {
          ctx.strokeStyle = `rgba(44, 255, 166, ${alpha * 0.82})`;
          ctx.lineWidth = this.dpr * 5;
        } else {
          ctx.strokeStyle = streak.white
            ? `rgba(241, 255, 232, ${alpha})`
            : `rgba(75, 255, 192, ${alpha})`;
          ctx.lineWidth = this.dpr * (streak.white ? 1.9 : 1.2);
        }
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.stroke();
      }
    }

    drawNoise(ctx, now) {
      if (this.effectLevel === "OFF") return;
      const count = this.effectLevel === "FULL" ? 14 : 4;
      ctx.save();
      for (let i = 0; i < count; i += 1) {
        const seed = hashCell(i, this.frame, Math.floor(now / 60));
        const x = seededUnit(seed) * this.width;
        const y = seededUnit(seed ^ 0xabcdef) * this.height;
        const alpha = seededUnit(seed ^ 0x12345) * 0.055;
        ctx.fillStyle = `rgba(112, 255, 202, ${alpha})`;
        ctx.fillRect(x, y, Math.max(1, this.dpr), Math.max(1, this.dpr));
      }
      ctx.restore();
    }

    render(now) {
      this.frame += 1;
      const dt = clamp(now - this.lastTime, 0, 50);
      this.lastTime = now;
      this.resize();

      const core = this.coreCtx;
      const glow = this.glowCtx;
      core.clearRect(0, 0, this.width, this.height);
      glow.clearRect(0, 0, this.width, this.height);
      this.configureTextContext(core);
      this.configureTextContext(glow);

      for (let y = 0; y < this.buffer.rows; y += 1) {
        for (let x = 0; x < this.buffer.cols; x += 1) {
          const cell = this.buffer.cells[y][x];
          this.renderCell(glow, cell, x, y, now, "glow");
          this.renderCell(core, cell, x, y, now, "core");
        }
      }

      this.drawCursor(glow, now, "glow");
      this.drawCursor(core, now, "core");
      this.drawStreaks(glow, now, "glow");
      this.drawStreaks(core, now, "core");

      const history = this.historyCtx;
      const persistence = this.effectLevel === "FULL" ? 0.90 : this.effectLevel === "LOW" ? 0.83 : 0.0;
      history.globalCompositeOperation = "source-over";
      history.fillStyle = `rgba(1, 7, 5, ${1 - Math.pow(persistence, dt / 16.67)})`;
      history.fillRect(0, 0, this.width, this.height);
      history.globalCompositeOperation = "lighter";
      history.globalAlpha = this.effectLevel === "OFF" ? 0 : 0.36;
      history.drawImage(this.coreCanvas, 0, 0);
      history.globalAlpha = 1;
      history.globalCompositeOperation = "source-over";

      const ctx = this.ctx;
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#010705";
      ctx.fillRect(0, 0, this.width, this.height);

      const ambientFlicker = this.effectLevel === "FULL"
        ? 0.985 + Math.sin(now * 0.021) * 0.009 + (Math.random() - 0.5) * 0.006
        : 1;
      ctx.globalAlpha = clamp(ambientFlicker, 0.94, 1.03);
      ctx.drawImage(this.historyCanvas, 0, 0);

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = this.effectLevel === "OFF" ? 0.20 : this.effectLevel === "LOW" ? 0.42 : 0.74;
      ctx.filter = this.effectLevel === "FULL"
        ? `blur(${Math.max(2, this.dpr * 4.8)}px)`
        : `blur(${Math.max(1, this.dpr * 2.2)}px)`;
      ctx.drawImage(this.glowCanvas, 0, 0);
      ctx.restore();

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = this.effectLevel === "OFF" ? 0.92 : 0.98;
      if (this.glitchPulse > 0.01 && this.effectLevel !== "OFF") {
        const shift = (Math.random() - 0.5) * this.glitchPulse * this.dpr * 3.6;
        ctx.drawImage(this.coreCanvas, shift, 0);
        ctx.globalAlpha = 0.16 * this.glitchPulse;
        ctx.drawImage(this.coreCanvas, -shift * 1.6, this.dpr);
        this.glitchPulse *= 0.88;
      } else {
        ctx.drawImage(this.coreCanvas, 0, 0);
      }
      ctx.restore();

      this.drawNoise(ctx, now);
      ctx.globalAlpha = 1;
      requestAnimationFrame(this.boundRender);
    }
  }

  class AudioEngine {
    constructor() {
      this.context = null;
      this.master = null;
      this.filter = null;
      this.highpass = null;
      this.compressor = null;
      this.noiseBuffer = null;
      this.enabled = false;
      this.muted = false;
      this.activeVoices = 0;
      this.maxVoices = 16;
    }

    createContext() {
      if (this.context) return;
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) return;
      this.context = new Context({ latencyHint: "interactive" });

      this.master = this.context.createGain();
      this.master.gain.value = 0.085;

      this.highpass = this.context.createBiquadFilter();
      this.highpass.type = "highpass";
      this.highpass.frequency.value = 85;

      this.filter = this.context.createBiquadFilter();
      this.filter.type = "lowpass";
      this.filter.frequency.value = 4700;
      this.filter.Q.value = 0.55;

      this.compressor = this.context.createDynamicsCompressor();
      this.compressor.threshold.value = -22;
      this.compressor.knee.value = 16;
      this.compressor.ratio.value = 5;
      this.compressor.attack.value = 0.003;
      this.compressor.release.value = 0.15;

      this.highpass.connect(this.filter);
      this.filter.connect(this.compressor);
      this.compressor.connect(this.master);
      this.master.connect(this.context.destination);
      this.noiseBuffer = this.createNoiseBuffer(0.45);
    }

    createNoiseBuffer(seconds) {
      const length = Math.floor(this.context.sampleRate * seconds);
      const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
      const data = buffer.getChannelData(0);
      let previous = 0;
      for (let i = 0; i < length; i += 1) {
        const white = Math.random() * 2 - 1;
        previous = previous * 0.72 + white * 0.28;
        data[i] = previous;
      }
      return buffer;
    }

    async enable() {
      this.createContext();
      if (!this.context) return false;
      if (this.context.state === "suspended") await this.context.resume();
      this.enabled = this.context.state === "running";
      return this.enabled;
    }

    setMuted(muted) {
      this.muted = Boolean(muted);
      if (!this.master || !this.context) return;
      const now = this.context.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setTargetAtTime(this.muted ? 0.0001 : 0.085, now, 0.018);
    }

    withVoice(callback) {
      if (!this.enabled || this.muted || !this.context || this.activeVoices >= this.maxVoices) return;
      this.activeVoices += 1;
      try {
        callback(() => {
          this.activeVoices = Math.max(0, this.activeVoices - 1);
        });
      } catch (error) {
        this.activeVoices = Math.max(0, this.activeVoices - 1);
        console.error(error);
      }
    }

    tone({ type = "square", frequency = 800, endFrequency = null, duration = 0.03, gain = 0.05, delay = 0 }) {
      this.withVoice((release) => {
        const now = this.context.currentTime + delay;
        const osc = this.context.createOscillator();
        const amp = this.context.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, now);
        if (endFrequency) osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), now + duration);
        amp.gain.setValueAtTime(0.0001, now);
        amp.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), now + Math.min(0.003, duration * 0.2));
        amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        osc.connect(amp);
        amp.connect(this.highpass);
        osc.start(now);
        osc.stop(now + duration + 0.01);
        osc.onended = release;
      });
    }

    noise({ duration = 0.02, gain = 0.035, frequency = 1700, q = 1.2, delay = 0, sweepTo = null }) {
      this.withVoice((release) => {
        const now = this.context.currentTime + delay;
        const source = this.context.createBufferSource();
        const band = this.context.createBiquadFilter();
        const amp = this.context.createGain();
        source.buffer = this.noiseBuffer;
        band.type = "bandpass";
        band.frequency.setValueAtTime(frequency, now);
        band.Q.value = q;
        if (sweepTo) band.frequency.exponentialRampToValueAtTime(Math.max(1, sweepTo), now + duration);
        amp.gain.setValueAtTime(0.0001, now);
        amp.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), now + Math.min(0.004, duration * 0.18));
        amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        source.connect(band);
        band.connect(amp);
        amp.connect(this.highpass);
        source.start(now, Math.random() * 0.12, duration + 0.02);
        source.stop(now + duration + 0.025);
        source.onended = release;
      });
    }

    play(type) {
      if (!this.enabled || this.muted) return;
      switch (type) {
        case "key":
          this.tone({ type: "square", frequency: 880 + Math.random() * 180, duration: 0.018, gain: 0.027 });
          this.noise({ duration: 0.011, gain: 0.018, frequency: 2300 + Math.random() * 900, q: 1.8 });
          break;
        case "space":
          this.noise({ duration: 0.010, gain: 0.008, frequency: 1400, q: 0.9 });
          break;
        case "backspace":
          this.tone({ type: "square", frequency: 760, endFrequency: 330, duration: 0.045, gain: 0.036 });
          this.noise({ duration: 0.018, gain: 0.018, frequency: 1100, q: 1.1 });
          break;
        case "print":
          this.tone({ type: "triangle", frequency: 620 + Math.random() * 120, duration: 0.015, gain: 0.020 });
          break;
        case "printLight":
          this.tone({ type: "triangle", frequency: 910 + Math.random() * 220, duration: 0.009, gain: 0.012 });
          break;
        case "printHeavy":
          this.tone({ type: "square", frequency: 470 + Math.random() * 70, duration: 0.024, gain: 0.025 });
          this.noise({ duration: 0.014, gain: 0.012, frequency: 1800, q: 1.5 });
          break;
        case "enter":
          this.noise({ duration: 0.028, gain: 0.041, frequency: 780, q: 0.8 });
          this.tone({ type: "triangle", frequency: 510, duration: 0.055, gain: 0.027, delay: 0.018 });
          this.tone({ type: "triangle", frequency: 720, duration: 0.075, gain: 0.023, delay: 0.07 });
          break;
        case "error":
          this.tone({ type: "sawtooth", frequency: 148, endFrequency: 118, duration: 0.24, gain: 0.033 });
          this.tone({ type: "square", frequency: 155, endFrequency: 126, duration: 0.21, gain: 0.021, delay: 0.015 });
          break;
        case "ready":
          this.tone({ type: "sine", frequency: 630, duration: 0.08, gain: 0.024 });
          this.tone({ type: "sine", frequency: 945, duration: 0.10, gain: 0.019, delay: 0.085 });
          break;
        case "wipe":
          this.noise({ duration: 0.20, gain: 0.035, frequency: 360, sweepTo: 3800, q: 2.4 });
          break;
        case "boot":
          this.noise({ duration: 0.62, gain: 0.036, frequency: 180, sweepTo: 3100, q: 1.7 });
          this.tone({ type: "sine", frequency: 66, endFrequency: 94, duration: 0.55, gain: 0.028 });
          break;
        default:
          break;
      }
    }
  }

  class Sequencer {
    constructor() {
      this.events = [];
      this.generation = 0;
      this.tail = performance.now();
    }

    cancel() {
      this.events.length = 0;
      this.generation += 1;
      this.tail = performance.now();
    }

    at(time, fn, generation = this.generation) {
      this.events.push({ time, fn, generation });
      this.events.sort((a, b) => a.time - b.time);
      return time;
    }

    after(delay, fn) {
      const start = Math.max(this.tail, performance.now());
      this.tail = start + delay;
      this.at(this.tail, fn);
      return this.tail;
    }

    wait(duration) {
      this.tail = Math.max(this.tail, performance.now()) + duration;
      return this.tail;
    }

    scheduleText(text, profileName, writeChar, options = {}) {
      const profile = PROFILES[profileName] || PROFILES.computer;
      let cursor = Math.max(this.tail, performance.now());
      const generation = this.generation;
      for (const char of String(text)) {
        const base = 1000 / profile.cps;
        const jitter = base * profile.variation * (Math.random() * 2 - 1);
        const punctuationPause = /[.,:;]/.test(char) ? base * 2.4 : char === " " ? base * 0.20 : 0;
        cursor += Math.max(5, base + jitter + punctuationPause);
        this.at(cursor, () => writeChar(char, profile, options), generation);
      }
      this.tail = cursor;
      return cursor;
    }

    tick(now) {
      while (this.events.length && this.events[0].time <= now) {
        const event = this.events.shift();
        if (event.generation !== this.generation) continue;
        event.fn();
      }
    }
  }

  class CommandProcessor {
    constructor(controller) {
      this.controller = controller;
    }

    execute(raw) {
      const input = raw.trim();
      if (!input) return [{ type: "text", value: "NO INQUIRY RECEIVED.", profile: "computer" }];
      const [command, ...args] = input.split(/\s+/);
      const cmd = command.toUpperCase();
      const argument = args.join(" ");

      switch (cmd) {
        case "HELP":
          return [
            { type: "text", value: "AVAILABLE INQUIRIES", profile: "heading" },
            { type: "rule", length: 23 },
            { type: "text", value: "STATUS      SHIP SYSTEM SUMMARY", profile: "burst" },
            { type: "text", value: "MATRIX      ADDRESS MATRIX DISPLAY", profile: "burst" },
            { type: "text", value: "DIAGNOSTIC  SIGNAL AND BUS TEST", profile: "burst" },
            { type: "text", value: "CLEAR       CLEAR DISPLAY", profile: "burst" },
            { type: "text", value: "SOUND ON|OFF", profile: "burst" },
            { type: "text", value: "EFFECTS FULL|LOW|OFF", profile: "burst" },
            { type: "text", value: "ABOUT       IMPLEMENTATION DATA", profile: "burst" },
            { type: "text", value: "ECHO <TEXT> RETURN TEXT", profile: "burst" }
          ];
        case "STATUS":
          return [
            { type: "text", value: "SHIP SYSTEM STATUS", profile: "heading" },
            { type: "rule", length: 20 },
            { type: "text", value: "LIFE SUPPORT ............ NOMINAL", profile: "computer" },
            { type: "text", value: "INERTIAL DAMPING ........ NOMINAL", profile: "computer" },
            { type: "text", value: "NAVIGATION .............. LOCKED", profile: "computer" },
            { type: "text", value: "WASTE HEAT .............. 37.4 PCT", profile: "computer" },
            { type: "text", value: "INTERFACE 2037 .......... READY", profile: "computer" }
          ];
        case "MATRIX":
          this.controller.scheduleMatrixDemo();
          return [];
        case "DIAGNOSTIC":
          return [
            { type: "glitch", amount: 1.4 },
            { type: "text", value: "DIAGNOSTIC BUS TEST", profile: "heading" },
            { type: "rule", length: 19 },
            { type: "text", value: "A0 7F 20 37 11 9C 4E .... PASS", profile: "burst" },
            { type: "text", value: "PHOSPHOR PERSISTENCE .... PASS", profile: "burst" },
            { type: "text", value: "AUDIO RELAY ............. PASS", profile: "burst" },
            { type: "text", value: "INQUIRY CHANNEL ......... OPEN", profile: "burst" }
          ];
        case "CLEAR":
          return [{ type: "clear" }];
        case "SOUND": {
          const value = argument.toUpperCase();
          if (value === "ON") {
            this.controller.setMuted(false);
            return [{ type: "text", value: "AUDIO CIRCUIT ENABLED.", profile: "computer" }];
          }
          if (value === "OFF") {
            this.controller.setMuted(true);
            return [{ type: "text", value: "AUDIO CIRCUIT MUTED.", profile: "computer" }];
          }
          return [{ type: "text", value: "USAGE: SOUND ON OR SOUND OFF", profile: "computer" }];
        }
        case "EFFECTS": {
          const level = argument.toUpperCase();
          if (EFFECT_LEVELS.includes(level)) {
            this.controller.setEffects(level);
            return [{ type: "text", value: `DISPLAY EFFECTS SET TO ${level}.`, profile: "computer" }];
          }
          return [{ type: "text", value: "USAGE: EFFECTS FULL, LOW, OR OFF", profile: "computer" }];
        }
        case "ABOUT":
          return [
            { type: "text", value: `INTERFACE 2037 // BUILD ${VERSION}`, profile: "heading" },
            { type: "rule", length: 31 },
            { type: "text", value: "STATIC HTML, CSS, AND JAVASCRIPT", profile: "computer" },
            { type: "text", value: "CANVAS 2D PHOSPHOR COMPOSITOR", profile: "computer" },
            { type: "text", value: "PROCEDURAL WEB AUDIO SYNTHESIS", profile: "computer" },
            { type: "text", value: "ZERO RUNTIME DEPENDENCIES", profile: "computer" }
          ];
        case "ECHO":
          return [{ type: "text", value: argument || "NO PAYLOAD.", profile: "computer" }];
        case "TIME":
          return [{ type: "text", value: new Date().toLocaleString().toUpperCase(), profile: "computer" }];
        default:
          this.controller.audio.play("error");
          return [
            { type: "glitch", amount: 0.85 },
            { type: "text", value: `UNRECOGNIZED INQUIRY: ${cmd}`, profile: "computer" },
            { type: "text", value: "ENTER HELP FOR COMMAND INDEX.", profile: "burst" }
          ];
      }
    }
  }

  class TerminalController {
    constructor() {
      this.canvas = document.getElementById("terminal-canvas");
      this.screen = document.getElementById("terminal-screen");
      this.input = document.getElementById("terminal-input");
      this.transcript = document.getElementById("terminal-transcript");
      this.audioNotice = document.getElementById("audio-notice");
      this.audioButton = document.getElementById("audio-toggle");
      this.effectsButton = document.getElementById("effects-toggle");
      this.replayButton = document.getElementById("replay-boot");
      this.skipButton = document.getElementById("skip-boot");
      this.buffer = new TerminalBuffer(COLS, ROWS);
      this.renderer = new TerminalRenderer(this.canvas, this.buffer);
      this.audio = new AudioEngine();
      this.sequencer = new Sequencer();
      this.commands = new CommandProcessor(this);
      this.cursor = { x: 0, y: 0 };
      this.promptStart = null;
      this.currentInput = "";
      this.history = [];
      this.historyIndex = 0;
      this.acceptingInput = false;
      this.booting = false;
      this.muted = false;
      this.effects = this.renderer.effectLevel;
      this.lastTranscript = "";
      this.bindEvents();
      this.updateControls();
      this.startLoop();
      this.startBoot();
    }

    bindEvents() {
      this.screen.addEventListener("pointerdown", async () => {
        await this.activateAudio();
        this.focusInput();
      });

      window.addEventListener("keydown", async (event) => {
        if (event.key === "F2") {
          event.preventDefault();
          this.setMuted(!this.muted);
          return;
        }
        if (event.key === "Escape") {
          this.input.blur();
          return;
        }
        if (!event.metaKey && !event.ctrlKey && !event.altKey) {
          await this.activateAudio();
          if (this.acceptingInput) this.focusInput();
        }
      }, { capture: true });

      this.input.addEventListener("keydown", (event) => this.onInputKeyDown(event));
      this.input.addEventListener("input", (event) => this.onInput(event));

      this.audioButton.addEventListener("click", async (event) => {
        event.stopPropagation();
        await this.activateAudio();
        this.setMuted(!this.muted);
      });

      this.effectsButton.addEventListener("click", (event) => {
        event.stopPropagation();
        const index = EFFECT_LEVELS.indexOf(this.effects);
        this.setEffects(EFFECT_LEVELS[(index + 1) % EFFECT_LEVELS.length]);
      });

      this.replayButton.addEventListener("click", (event) => {
        event.stopPropagation();
        this.startBoot();
      });

      this.skipButton.addEventListener("click", (event) => {
        event.stopPropagation();
        this.skipBoot();
      });

      window.addEventListener("blur", () => {
        if (this.buffer.cursor.visible) this.buffer.cursor.hotUntil = performance.now();
      });
    }

    async activateAudio() {
      if (this.audio.enabled) return;
      const enabled = await this.audio.enable();
      if (enabled) {
        this.audioNotice.classList.add("is-hidden");
        this.audio.play("ready");
        this.updateControls();
      }
    }

    setMuted(muted) {
      this.muted = Boolean(muted);
      this.audio.setMuted(this.muted);
      this.updateControls();
    }

    setEffects(level) {
      this.effects = EFFECT_LEVELS.includes(level) ? level : "FULL";
      this.renderer.setEffectLevel(this.effects);
      document.body.dataset.effects = this.effects.toLowerCase();
      this.updateControls();
    }

    updateControls() {
      const audioLabel = !this.audio.enabled
        ? "AUDIO: ARMED"
        : this.muted
          ? "AUDIO: OFF"
          : "AUDIO: ON";
      this.audioButton.textContent = audioLabel;
      this.audioButton.setAttribute("aria-pressed", String(this.audio.enabled && !this.muted));
      this.effectsButton.textContent = `EFFECTS: ${this.effects}`;
      this.skipButton.hidden = !this.booting;
    }

    focusInput() {
      if (!this.acceptingInput) return;
      this.input.focus({ preventScroll: true });
      const length = this.input.value.length;
      this.input.setSelectionRange(length, length);
    }

    startLoop() {
      const loop = (now) => {
        this.sequencer.tick(now);
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }

    resetTerminal() {
      this.buffer.clear();
      this.cursor = { x: 0, y: 0 };
      this.promptStart = null;
      this.currentInput = "";
      this.input.value = "";
      this.acceptingInput = false;
      this.buffer.cursor.visible = false;
    }

    startBoot() {
      this.sequencer.cancel();
      this.resetTerminal();
      this.booting = true;
      this.updateControls();
      this.audio.play("boot");
      const base = performance.now() + 120;
      const generation = this.sequencer.generation;

      this.sequencer.at(base, () => this.seedBootNoise(0.32), generation);
      for (let i = 0; i < 9; i += 1) {
        this.sequencer.at(base + 230 + i * 180, () => {
          this.seedBootNoise(0.12 + i * 0.035);
          if (i % 2 === 0) {
            this.renderer.addStreak(randomInt(2, ROWS - 3), randomInt(0, 8), randomInt(48, COLS - 1), 150, i % 4 === 0);
          }
          this.renderer.pulseGlitch(0.7 + i * 0.05);
        }, generation);
      }

      this.sequencer.at(base + 1950, () => this.showPartialMatrix(), generation);
      this.sequencer.at(base + 2600, () => this.showAddressMatrix(true), generation);
      this.sequencer.at(base + 3850, () => this.showAddressMatrix(false), generation);
      this.sequencer.at(base + 5000, () => {
        this.buffer.clear();
        this.cursor = { x: 3, y: 10 };
        this.renderer.addStreak(10, 3, 30, 240, false);
        this.writeImmediate("INTERFACE", { x: 3, y: 10, intensity: 0.94 });
        this.writeImmediate("2037", { x: 21, y: 10, intensity: 0.94 });
      }, generation);
      this.sequencer.at(base + 5650, () => this.showReadyScreen(), generation);
    }

    skipBoot() {
      if (!this.booting) return;
      this.sequencer.cancel();
      this.resetTerminal();
      this.showReadyScreen(true);
    }

    seedBootNoise(density) {
      const now = performance.now();
      for (let y = 1; y < ROWS - 1; y += 1) {
        for (let x = 1; x < COLS - 1; x += 1) {
          if (Math.random() < density * 0.12) {
            const isBlock = Math.random() < 0.06;
            this.buffer.write(x, y, isBlock ? "■" : randomGlyph(), {
              now,
              intensity: isBlock ? 1 : 0.55 + Math.random() * 0.35,
              corruptFor: randomInt(60, 240)
            });
          } else if (Math.random() < density * 0.025) {
            this.buffer.write(x, y, "_", { now, intensity: 0.78, mode: "rule" });
          }
        }
      }
    }

    showPartialMatrix() {
      this.buffer.clear();
      const fragments = [
        [2, 2, "OVERMONITO"],
        [2, 5, "CRFX"],
        [2, 7, "WASTE HEAT"],
        [2, 9, "VENT"],
        [2, 12, "TIME"],
        [2, 14, "COMMAND"],
        [2, 17, "ATTN"],
        [2, 20, "MARTIAL"],
        [25, 7, "2 67DD 444"],
        [47, 7, "N3 EEEE"],
        [56, 3, "ZZZZ"]
      ];
      for (const [x, y, text] of fragments) {
        this.buffer.writeText(x, y, text, { intensity: 0.78, corruptFor: 180 });
      }
      this.renderer.addStreak(6, 2, 57, 260, true);
      this.renderer.addStreak(11, 3, 41, 190, false);
      this.audio.play("wipe");
    }

    showAddressMatrix(corrupted) {
      this.buffer.clear();
      const left = [
        ["CRFX", "OM2077AM"],
        ["ATTITUDE", "SM2078"],
        ["WASTE HEAT", "2080"],
        ["RAD", "2081"],
        ["VENT", "2082AM"],
        ["NAVIGATION", "M2083"],
        ["TIME", "M2084"],
        ["GAL POS", ""],
        ["COMMAND", "2086SC"],
        ["INTERFACE", "2037"],
        ["ATTN", "2087SC"],
        ["ALERT", "2088SC"],
        ["MARTIAL", "2090"],
        ["OVERLOCK", "M2091"]
      ];
      const right = [
        ["L ALIGNMENT", "SM2093"],
        ["PHOTO F", "SM2094"],
        ["MAINS", ""],
        ["IUA", "SM2096"],
        ["2LA", "SM2097"],
        ["3HA", "SM2098"],
        ["4LHA", "SM2099"],
        ["GRAY GRIDS", ""],
        ["INERTIAL DAMP", "3002AM"],
        ["DECK A", "A3003"],
        ["DECK B", "A3004"],
        ["DECK C", "A3005"],
        ["LIFE SUPPORT", ""],
        ["0%", "M3003AM"]
      ];

      this.buffer.writeText(2, 1, "OVERMONITORING ADDRESS MATRIX", { intensity: 0.93, corruptFor: corrupted ? 100 : 0 });
      left.forEach(([label, value], index) => {
        const y = 3 + index;
        this.buffer.writeText(2, y, label, { intensity: 0.86, corruptFor: corrupted ? randomInt(40, 220) : 0 });
        this.buffer.writeText(20, y, value, { intensity: 0.82, corruptFor: corrupted ? randomInt(40, 220) : 0 });
      });
      right.forEach(([label, value], index) => {
        const y = 3 + index;
        this.buffer.writeText(37, y, label, { intensity: 0.86, corruptFor: corrupted ? randomInt(40, 220) : 0 });
        this.buffer.writeText(57, y, value, { intensity: 0.82, corruptFor: corrupted ? randomInt(40, 220) : 0 });
      });
      if (corrupted) {
        for (let i = 0; i < 22; i += 1) {
          const x = randomInt(1, COLS - 2);
          const y = randomInt(2, 19);
          this.buffer.write(x, y, randomGlyph(), { intensity: 0.9, corruptFor: 600 });
        }
        this.renderer.pulseGlitch(1.2);
        this.renderer.addStreak(randomInt(5, 17), 2, 66, 220, true);
      }
    }

    showReadyScreen(immediate = false) {
      this.sequencer.cancel();
      this.buffer.clear();
      this.cursor = { x: 2, y: 3 };
      this.booting = false;
      this.updateControls();

      if (immediate) {
        this.writeImmediate("INTERFACE 2037 READY FOR INQUIRY", { x: 2, y: 3, intensity: 1 });
        this.buffer.drawRule(2, 39, 4, { intensity: 0.92 });
        this.cursor = { x: 2, y: 8 };
        this.printPrompt();
        return;
      }

      this.sequencer.tail = performance.now() + 80;
      this.scheduleLine("INTERFACE 2037 READY FOR INQUIRY", "heading", { x: 2, y: 3, newline: false });
      this.sequencer.wait(130);
      this.sequencer.after(0, () => {
        this.buffer.drawRule(2, 39, 4, { intensity: 0.94 });
        this.renderer.addStreak(4, 2, 39, 220, false);
        this.audio.play("wipe");
      });
      this.sequencer.wait(720);
      this.sequencer.after(0, () => {
        this.cursor = { x: 2, y: 8 };
        this.printPrompt();
        this.audio.play("ready");
      });
      this.appendTranscript("INTERFACE 2037 READY FOR INQUIRY");
    }

    writeImmediate(text, options = {}) {
      const startX = options.x ?? this.cursor.x;
      const startY = options.y ?? this.cursor.y;
      const end = this.buffer.writeText(startX, startY, String(text).toUpperCase(), {
        intensity: options.intensity ?? 0.86,
        corruptFor: options.corruptFor ?? 0
      });
      this.cursor = end;
      return end;
    }

    scheduleLine(text, profile = "computer", options = {}) {
      if (options.x !== undefined) this.cursor.x = options.x;
      if (options.y !== undefined) this.cursor.y = options.y;
      this.ensureRows(1);
      const lineText = String(text).toUpperCase();
      this.sequencer.scheduleText(lineText, profile, (char, profileData) => {
        this.putChar(char, profileData.intensity, true, profileData.sound);
      });
      if (options.newline !== false) {
        this.sequencer.after(30, () => this.newLine());
      }
      return this.sequencer.tail;
    }

    putChar(char, intensity = 0.88, makeSound = false, sound = "print") {
      if (char === "\n") {
        this.newLine();
        return;
      }
      if (this.cursor.x >= COLS - 1) this.newLine();
      this.ensureRows(1);
      this.buffer.write(this.cursor.x, this.cursor.y, char, {
        intensity,
        corruptFor: this.effects === "FULL" && Math.random() < 0.035 ? randomInt(30, 75) : 0
      });
      this.cursor.x += 1;
      this.buffer.setCursor(this.cursor.x, this.cursor.y, this.acceptingInput);
      if (makeSound) this.audio.play(char === " " ? "space" : sound);
    }

    newLine() {
      this.cursor.x = 2;
      this.cursor.y += 1;
      this.ensureRows(1);
      this.buffer.setCursor(this.cursor.x, this.cursor.y, this.acceptingInput);
    }

    ensureRows(extra = 1) {
      const lastSafeRow = ROWS - 2;
      if (this.cursor.y + extra > lastSafeRow) {
        const lines = this.cursor.y + extra - lastSafeRow;
        this.buffer.scroll(lines);
        this.cursor.y -= lines;
        if (this.promptStart) this.promptStart.y -= lines;
      }
    }

    printPrompt() {
      this.ensureRows(2);
      this.acceptingInput = true;
      this.currentInput = "";
      this.input.value = "";
      this.buffer.write(this.cursor.x, this.cursor.y, ">", { intensity: 1 });
      this.buffer.write(this.cursor.x + 1, this.cursor.y, " ", { intensity: 0.9 });
      this.promptStart = { x: this.cursor.x + 2, y: this.cursor.y };
      this.cursor = { ...this.promptStart };
      this.buffer.setCursor(this.cursor.x, this.cursor.y, true);
      this.focusInput();
    }

    onInputKeyDown(event) {
      if (!this.acceptingInput) {
        event.preventDefault();
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        this.submitInput();
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        if (!this.history.length) return;
        this.historyIndex = Math.max(0, this.historyIndex - 1);
        this.replaceInput(this.history[this.historyIndex] || "");
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (!this.history.length) return;
        this.historyIndex = Math.min(this.history.length, this.historyIndex + 1);
        this.replaceInput(this.history[this.historyIndex] || "");
        return;
      }
    }

    onInput(event) {
      if (!this.acceptingInput) return;
      let next = this.input.value.toUpperCase().replace(/[\r\n]/g, " ");
      if (!PRINTABLE.test(next)) next = next.replace(/[^\x20-\x7E]/g, "");
      next = next.slice(0, COLS - this.promptStart.x - 1);
      this.input.value = next;
      const previous = this.currentInput;
      const common = this.commonPrefixLength(previous, next);

      for (let i = common; i < previous.length; i += 1) {
        this.buffer.clearCell(this.promptStart.x + i, this.promptStart.y);
      }
      for (let i = common; i < next.length; i += 1) {
        const char = next[i];
        this.buffer.write(this.promptStart.x + i, this.promptStart.y, char, {
          intensity: 1,
          corruptFor: this.effects === "FULL" && Math.random() < 0.08 ? randomInt(25, 70) : 0
        });
        this.audio.play(char === " " ? "space" : "key");
      }

      if (next.length < previous.length) this.audio.play("backspace");
      this.currentInput = next;
      this.cursor = { x: this.promptStart.x + next.length, y: this.promptStart.y };
      this.buffer.setCursor(this.cursor.x, this.cursor.y, true);
      if (event.inputType === "insertFromPaste") this.renderer.pulseGlitch(0.25);
    }

    commonPrefixLength(a, b) {
      const max = Math.min(a.length, b.length);
      let i = 0;
      while (i < max && a[i] === b[i]) i += 1;
      return i;
    }

    replaceInput(value) {
      this.input.value = String(value).toUpperCase();
      this.input.dispatchEvent(new InputEvent("input", { inputType: "insertReplacementText", data: null }));
    }

    submitInput() {
      const command = this.currentInput;
      this.acceptingInput = false;
      this.buffer.cursor.visible = false;
      this.audio.play("enter");
      this.appendTranscript(`> ${command}`);
      if (command.trim()) {
        if (this.history[this.history.length - 1] !== command) this.history.push(command);
        this.history = this.history.slice(-30);
      }
      this.historyIndex = this.history.length;
      this.input.value = "";
      this.currentInput = "";
      this.newLine();
      this.newLine();
      const output = this.commands.execute(command);
      this.runOutput(output);
    }

    runOutput(events) {
      if (!events.length) return;
      this.sequencer.tail = Math.max(this.sequencer.tail, performance.now() + 80);
      for (const event of events) {
        switch (event.type) {
          case "text":
            this.scheduleLine(event.value, event.profile || "computer");
            this.appendTranscript(event.value);
            break;
          case "rule":
            this.sequencer.after(0, () => {
              const start = this.cursor.x;
              this.buffer.drawRule(start, Math.min(COLS - 2, start + event.length), this.cursor.y, { intensity: 0.9 });
              this.renderer.addStreak(this.cursor.y, start, Math.min(COLS - 2, start + event.length), 160, false);
              this.audio.play("wipe");
              this.newLine();
            });
            break;
          case "glitch":
            this.sequencer.after(0, () => this.renderer.pulseGlitch(event.amount || 1));
            break;
          case "pause":
            this.sequencer.wait(event.duration || 200);
            break;
          case "clear":
            this.sequencer.after(0, () => {
              this.buffer.clear();
              this.cursor = { x: 2, y: 3 };
              this.renderer.addStreak(3, 2, 66, 220, true);
              this.audio.play("wipe");
            });
            break;
          default:
            break;
        }
      }
      this.sequencer.wait(240);
      this.sequencer.after(0, () => {
        this.newLine();
        this.printPrompt();
      });
    }

    scheduleMatrixDemo() {
      this.sequencer.cancel();
      this.acceptingInput = false;
      this.buffer.cursor.visible = false;
      this.buffer.clear();
      this.audio.play("wipe");
      const start = performance.now() + 80;
      const generation = this.sequencer.generation;
      for (let i = 0; i < 11; i += 1) {
        this.sequencer.at(start + i * 115, () => {
          this.seedBootNoise(0.20 + i * 0.02);
          this.renderer.pulseGlitch(0.45);
          if (i % 3 === 0) this.renderer.addStreak(randomInt(2, 20), 1, randomInt(42, 70), 130, i % 2 === 0);
        }, generation);
      }
      this.sequencer.at(start + 1450, () => this.showAddressMatrix(false), generation);
      this.sequencer.at(start + 3050, () => {
        this.buffer.clear();
        this.cursor = { x: 2, y: 3 };
        this.scheduleLine("ADDRESS MATRIX CLOSED", "heading");
        this.sequencer.wait(320);
        this.sequencer.after(0, () => {
          this.newLine();
          this.printPrompt();
        });
      }, generation);
    }

    appendTranscript(text) {
      const clean = String(text).trim();
      if (!clean || clean === this.lastTranscript) return;
      this.lastTranscript = clean;
      const line = document.createElement("div");
      line.textContent = clean;
      this.transcript.appendChild(line);
      while (this.transcript.children.length > 80) this.transcript.firstChild.remove();
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("build-label").textContent = `BUILD ${VERSION}`;
    new TerminalController();
  });
})();
