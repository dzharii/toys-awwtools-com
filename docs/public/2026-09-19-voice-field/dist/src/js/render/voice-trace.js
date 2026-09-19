const clamp01 = (value) => Math.min(1, Math.max(0, value));
const mix = (a, b, amount) => a + (b - a) * amount;
const STYLE_SHAPES = Object.freeze({
  bars: { minimal: 0, poles: 0, soft: 0, width: 0.48, opacity: 0.88 },
  "soft-bars": { minimal: 0, poles: 0, soft: 1, width: 0.38, opacity: 0.82 },
  poles: { minimal: 0, poles: 1, soft: 0.15, width: 0.13, opacity: 0.8 },
  minimal: { minimal: 1, poles: 0, soft: 0.2, width: 0.3, opacity: 0.6 },
});

export class VoiceTrace {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d", { alpha: true });
    this.history = new Float32Array(72);
    this.lastSampleAt = 0;
    this.style = "soft-bars";
    this.previousStyle = this.style;
    this.styleChangedAt = 0;
    this.enabledAmount = 1;
    this.width = 1;
    this.height = 1;
    this.pixelRatio = 1;
  }

  resize(width, height, pixelRatio) {
    const safeRatio = Math.min(pixelRatio, 2);
    const nextWidth = Math.max(1, Math.round(width * safeRatio));
    const nextHeight = Math.max(1, Math.round(height * safeRatio));
    if (this.canvas.width !== nextWidth || this.canvas.height !== nextHeight) {
      this.canvas.width = nextWidth;
      this.canvas.height = nextHeight;
    }
    this.width = width;
    this.height = height;
    this.pixelRatio = safeRatio;
  }

  setStyle(style, nowMs = performance.now()) {
    if (style === this.style) return;
    this.previousStyle = this.style;
    this.style = style;
    this.styleChangedAt = nowMs;
  }

  update(audio, nowMs) {
    if (nowMs - this.lastSampleAt < 28) return;
    this.lastSampleAt = nowMs;
    this.history.copyWithin(1, 0, this.history.length - 1);
    const tonalShape = audio.envelope * 0.58 + audio.low * 0.18 + audio.mid * 0.16 + audio.high * 0.08;
    this.history[0] = clamp01(tonalShape + audio.impulse * 0.28 + audio.phraseActivity * 0.08);
  }

  draw({ audio, palette, enabled, style, smoothing, intensity, nowMs }) {
    this.update(audio, nowMs);
    this.setStyle(style, nowMs);
    this.enabledAmount = mix(this.enabledAmount, enabled ? 1 : 0, 0.12);
    const context = this.context;
    const ratio = this.pixelRatio;
    const width = this.width;
    const height = this.height;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    if (this.enabledAmount < 0.01) return;

    const mobile = width < 500;
    const count = mobile ? 46 : Math.min(82, Math.max(54, Math.round(width / 14)));
    const baseline = height * 0.865;
    const availableHeight = height * 0.115;
    const sidePadding = width * 0.055;
    const traceWidth = width - sidePadding * 2;
    const slot = traceWidth / count;
    const styleMix = clamp01((nowMs - this.styleChangedAt) / 480);
    const previousShape = STYLE_SHAPES[this.previousStyle] ?? STYLE_SHAPES.bars;
    const nextShape = STYLE_SHAPES[this.style] ?? STYLE_SHAPES.bars;
    const shape = Object.fromEntries(Object.keys(previousShape).map((name) => [name, mix(previousShape[name], nextShape[name], styleMix)]));
    const colorA = palette.colors[0];
    const colorB = palette.colors[2];
    const gradient = context.createLinearGradient(sidePadding, 0, width - sidePadding, 0);
    gradient.addColorStop(0, colorA);
    gradient.addColorStop(0.48, colorB);
    gradient.addColorStop(0.75, palette.colors[1]);
    gradient.addColorStop(1, colorA);

    const values = [];
    for (let index = 0; index < count; index += 1) {
      const normalized = index / Math.max(1, count - 1);
      const distanceFromCenter = Math.abs(normalized * 2 - 1);
      const historyIndex = Math.min(this.history.length - 2, Math.floor(distanceFromCenter * (this.history.length - 2)));
      const fraction = distanceFromCenter * (this.history.length - 2) - historyIndex;
      let value = mix(this.history[historyIndex], this.history[historyIndex + 1], fraction);
      const neighbor = (this.history[Math.max(0, historyIndex - 2)] + this.history[Math.min(this.history.length - 1, historyIndex + 2)]) * 0.5;
      value = mix(value, neighbor, smoothing * 0.68);
      const designedWave = 0.018 + Math.pow(Math.sin((index * 0.67 + nowMs * 0.0012) + historyIndex * 0.13) * 0.5 + 0.5, 3) * 0.018;
      values.push(clamp01(value + designedWave));
    }

    context.save();
    const baseAlpha = this.enabledAmount * shape.opacity;
    context.globalAlpha = baseAlpha;
    if (shape.soft > 0.01) {
      context.shadowBlur = 13 * shape.soft;
      context.shadowColor = palette.accent;
    }
    context.fillStyle = gradient;
    context.strokeStyle = gradient;
    context.lineCap = "round";
    for (let index = 0; index < count; index += 1) {
      const value = values[index];
      const barHeight = mix(1, 0.28, shape.minimal) * availableHeight * intensity * (0.12 + Math.pow(value, 0.82) * 1.04);
      const x = sidePadding + index * slot + slot * 0.5;
      if (shape.poles > 0.001) {
        context.globalAlpha = baseAlpha * shape.poles;
        context.lineWidth = Math.max(1, slot * 0.13);
        context.beginPath();
        context.moveTo(x, baseline + barHeight * 0.16);
        context.lineTo(x, baseline - barHeight);
        context.stroke();
      }
      if (shape.poles < 0.999) {
        context.globalAlpha = baseAlpha * (1 - shape.poles);
        const barWidth = Math.max(1.2, slot * shape.width);
        context.fillRect(x - barWidth * 0.5, baseline - barHeight, barWidth, barHeight);
      }
    }
    context.restore();

    context.save();
    context.translate(0, baseline * 2 + 3);
    context.scale(1, -0.22);
    context.globalAlpha = this.enabledAmount * 0.16;
    context.filter = "blur(4px)";
    context.fillStyle = gradient;
    for (let index = 0; index < count; index += 1) {
      const barHeight = mix(1, 0.28, shape.minimal) * availableHeight * intensity * (0.09 + Math.pow(values[index], .85));
      const x = sidePadding + index * slot + slot * .5;
      context.fillRect(x - slot * .16, baseline - barHeight, slot * .32, barHeight);
    }
    context.restore();
  }
}
