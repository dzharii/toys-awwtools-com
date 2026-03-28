import {
  clamp,
  mixColor,
  rgbToCss,
  seededRandom,
  smoothstep,
} from "./utils.js";

export class SceneRenderer {
  constructor(config, geometry, simulation) {
    this.config = config;
    this.geometry = geometry;
    this.simulation = simulation;
    this.staticCanvas = document.createElement("canvas");
    this.staticCtx = this.staticCanvas.getContext("2d", { alpha: true });
    this.cachedWidth = 0;
    this.cachedHeight = 0;
    this.cachedDpr = 1;
    this.qualityScale = 1;
  }

  resize(width, height, dpr) {
    const pixelWidth = Math.max(1, Math.round(width * dpr));
    const pixelHeight = Math.max(1, Math.round(height * dpr));
    if (
      pixelWidth !== this.cachedWidth ||
      pixelHeight !== this.cachedHeight ||
      dpr !== this.cachedDpr
    ) {
      this.cachedWidth = pixelWidth;
      this.cachedHeight = pixelHeight;
      this.cachedDpr = dpr;
      this.staticCanvas.width = pixelWidth;
      this.staticCanvas.height = pixelHeight;
      this.#renderStaticLayers(width, height, dpr);
    }
  }

  draw(ctx, width, height, dpr, state) {
    ctx.clearRect(0, 0, width, height);

    this.#drawEnvironment(ctx, width, height, state);
    this.#drawLiquid(ctx, width, height, state);
    ctx.drawImage(this.staticCanvas, 0, 0, width, height);
    this.#drawTokens(ctx, state);
    this.#drawFocusAura(ctx, state);
  }

  setQualityScale(scale) {
    this.qualityScale = clamp(scale, 0.55, 1);
  }

  #drawEnvironment(ctx, width, height, state) {
    const { opening } = this.geometry;
    const env = ctx.createRadialGradient(
      opening.cx,
      opening.cy,
      opening.radius * 0.15,
      opening.cx,
      opening.cy,
      Math.max(width, height) * 0.8
    );
    env.addColorStop(0, "rgba(43, 10, 31, 0.11)");
    env.addColorStop(0.45, "rgba(16, 7, 13, 0.08)");
    env.addColorStop(1, "rgba(3, 3, 4, 0.0)");

    ctx.save();
    ctx.fillStyle = env;
    ctx.fillRect(0, 0, width, height);

    const shadow = ctx.createRadialGradient(
      opening.cx,
      opening.cy,
      opening.radius * 0.7,
      opening.cx,
      opening.cy,
      opening.radius * 1.6
    );
    shadow.addColorStop(0, "rgba(0, 0, 0, 0)");
    shadow.addColorStop(0.75, "rgba(0, 0, 0, 0.08)");
    shadow.addColorStop(1, "rgba(0, 0, 0, 0.26)");
    ctx.fillStyle = shadow;
    ctx.fillRect(0, 0, width, height);

    if (state.dragOver) {
      const pulse = 0.07 + Math.sin(state.time * 0.0037) * 0.015;
      const glow = ctx.createRadialGradient(
        opening.cx,
        opening.cy,
        opening.radius * 0.2,
        opening.cx,
        opening.cy,
        opening.radius * 1.05
      );
      glow.addColorStop(0, `rgba(255, 100, 212, ${pulse * 1.2})`);
      glow.addColorStop(0.45, `rgba(255, 72, 179, ${pulse})`);
      glow.addColorStop(1, "rgba(255, 72, 179, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);
    }

    ctx.restore();
  }

  #drawLiquid(ctx, width, height, state) {
    const { opening } = this.geometry;
    ctx.save();
    this.geometry.createOpeningPath(ctx);
    ctx.clip();

    const base = ctx.createRadialGradient(
      opening.cx - opening.rx * 0.18,
      opening.cy - opening.ry * 0.22,
      opening.radius * 0.08,
      opening.cx,
      opening.cy,
      opening.radius * 1.1
    );
    base.addColorStop(0, "rgba(151, 27, 110, 0.42)");
    base.addColorStop(0.45, "rgba(96, 12, 72, 0.62)");
    base.addColorStop(1, "rgba(15, 3, 17, 0.94)");
    ctx.fillStyle = base;
    ctx.fillRect(opening.x, opening.y, opening.width, opening.height);

    const sampleStep = Math.max(
      6,
      Math.round((this.geometry.mode === "portrait" ? 7 : 8) / this.qualityScale)
    );
    const peak = this.config.shading.palette.peak;
    const mid = this.config.shading.palette.mid;
    const valley = this.config.shading.palette.valley;
    const deep = this.config.shading.palette.deep;
    const electric = this.config.shading.palette.electric;

    for (let y = opening.y; y < opening.y + opening.height; y += sampleStep) {
      for (let x = opening.x; x < opening.x + opening.width; x += sampleStep) {
        const n = this.geometry.pixelToNormalized(x, y);
        if (!n || !this.geometry.containsNormalizedPoint(n.x, n.y)) continue;

        const h = this.simulation.sample(n.x, n.y);
        const g = this.simulation.sampleGradient(n.x, n.y);
        const slope = clamp(Math.sqrt(g.dx * g.dx + g.dy * g.dy) * 8.5, 0, 1);
        const heightT = clamp(h * 2.6 + 0.5, 0, 1);

        let color = mixColor(valley, mid, smoothstep(0.08, 0.68, heightT));
        color = mixColor(color, peak, smoothstep(0.62, 0.98, heightT));
        color = mixColor(color, deep, smoothstep(0, 0.22, 1 - heightT));
        color = mixColor(color, electric, slope * 0.16);

        const brightness =
          0.75 +
          slope * this.config.shading.slopeLightStrength +
          Math.max(0, h) * this.config.shading.highlightStrength;

        const alpha = clamp(
          this.config.shading.baseAlpha - (1 - heightT) * 0.18,
          0.68,
          1
        );

        const size = sampleStep + 1;
        ctx.fillStyle = rgbToCss(
          color[0] * brightness,
          color[1] * brightness,
          color[2] * brightness,
          alpha
        );
        ctx.fillRect(x - 0.5, y - 0.5, size, size);

        if (heightT > 0.72 || slope > 0.3) {
          const highlightAlpha =
            Math.max(0, h) * 0.13 + slope * 0.06 + state.dragGlow * 0.04;
          if (highlightAlpha > 0.01) {
            ctx.fillStyle = `rgba(255, 150, 227, ${highlightAlpha})`;
            ctx.fillRect(x - 0.5, y - 0.5, size, size);
          }
        }
      }
    }

    const lumens = ctx.createRadialGradient(
      opening.cx - opening.rx * 0.24,
      opening.cy - opening.ry * 0.28,
      opening.radius * 0.04,
      opening.cx,
      opening.cy,
      opening.radius * 1.1
    );
    lumens.addColorStop(0, `rgba(255, 112, 217, ${0.14 + state.dragGlow * 0.1})`);
    lumens.addColorStop(0.35, "rgba(227, 66, 176, 0.06)");
    lumens.addColorStop(1, "rgba(30, 0, 22, 0)");
    ctx.fillStyle = lumens;
    ctx.fillRect(opening.x, opening.y, opening.width, opening.height);

    const vignette = ctx.createRadialGradient(
      opening.cx,
      opening.cy,
      opening.radius * 0.52,
      opening.cx,
      opening.cy,
      opening.radius * 1.08
    );
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(0.7, `rgba(16, 0, 12, ${this.config.shading.vignetteStrength * 0.42})`);
    vignette.addColorStop(1, `rgba(0,0,0, ${this.config.shading.vignetteStrength})`);
    ctx.fillStyle = vignette;
    ctx.fillRect(opening.x, opening.y, opening.width, opening.height);

    ctx.restore();
  }

  #renderStaticLayers(width, height, dpr) {
    const ctx = this.staticCtx;
    const pixelWidth = Math.max(1, Math.round(width * dpr));
    const pixelHeight = Math.max(1, Math.round(height * dpr));
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, pixelWidth, pixelHeight);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const { opening } = this.geometry;
    const rim = this.config.vessel.rimOuter;
    const lip = this.config.vessel.rimInner;
    const throat = this.config.vessel.throatDepth;

    ctx.save();

    this.geometry.createInnerLipPath(ctx, -rim);
    const outerGradient = ctx.createRadialGradient(
      opening.cx - opening.rx * 0.22,
      opening.cy - opening.ry * 0.28,
      opening.radius * 0.3,
      opening.cx,
      opening.cy,
      opening.radius * 1.2 + rim
    );
    outerGradient.addColorStop(0, this.config.shading.stone.topA);
    outerGradient.addColorStop(0.5, this.config.shading.stone.outerA);
    outerGradient.addColorStop(1, this.config.shading.stone.outerB);
    ctx.fillStyle = outerGradient;
    ctx.fill();

    ctx.globalCompositeOperation = "destination-out";
    this.geometry.createOpeningPath(ctx);
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";

    this.geometry.createInnerLipPath(ctx, lip);
    const throatGradient = ctx.createRadialGradient(
      opening.cx,
      opening.cy,
      opening.radius * 0.3,
      opening.cx,
      opening.cy,
      opening.radius + throat
    );
    throatGradient.addColorStop(0, this.config.shading.stone.throatA);
    throatGradient.addColorStop(1, this.config.shading.stone.throatB);
    ctx.fillStyle = throatGradient;
    ctx.fill();

    ctx.globalCompositeOperation = "destination-out";
    this.geometry.createOpeningPath(ctx);
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";

    this.geometry.createOpeningPath(ctx);
    const lipGradient = ctx.createLinearGradient(
      opening.cx,
      opening.y - lip,
      opening.cx,
      opening.y + opening.height + lip
    );
    lipGradient.addColorStop(0, "rgba(255, 249, 244, 0.08)");
    lipGradient.addColorStop(0.22, "rgba(255, 243, 238, 0.03)");
    lipGradient.addColorStop(0.55, "rgba(0, 0, 0, 0)");
    lipGradient.addColorStop(1, "rgba(0, 0, 0, 0.22)");
    ctx.lineWidth = lip * 1.45;
    ctx.strokeStyle = lipGradient;
    ctx.stroke();

    this.#drawStoneVariation(ctx);

    ctx.restore();
  }

  #drawStoneVariation(ctx) {
    const { opening } = this.geometry;
    const rand = seededRandom(
      Math.floor(opening.width * 31 + opening.height * 17 + opening.cx * 7)
    );

    ctx.save();
    ctx.globalAlpha = 1;

    for (let i = 0; i < 86; i += 1) {
      const angle = rand() * Math.PI * 2;
      const band = 1 + rand() * 0.08;
      const offset = this.config.vessel.rimOuter * band;
      const radiusX = opening.rx + offset;
      const radiusY = opening.ry + offset * 0.95;
      const px = opening.cx + Math.cos(angle) * radiusX;
      const py = opening.cy + Math.sin(angle) * radiusY;
      const w = 6 + rand() * 18;
      const h = 1.2 + rand() * 3.6;
      const rotation = angle + (rand() - 0.5) * 0.7;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(rotation);
      ctx.fillStyle = rand() > 0.5
        ? this.config.shading.stone.seam
        : this.config.shading.stone.dust;
      ctx.fillRect(-w * 0.5, -h * 0.5, w, h);
      ctx.restore();
    }

    for (let i = 0; i < 16; i += 1) {
      const angle = rand() * Math.PI * 2;
      const offset = this.config.vessel.rimOuter * (0.82 + rand() * 0.22);
      const radiusX = opening.rx + offset;
      const radiusY = opening.ry + offset * 0.92;
      const px = opening.cx + Math.cos(angle) * radiusX;
      const py = opening.cy + Math.sin(angle) * radiusY;
      const size = 12 + rand() * 20;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(rand() * Math.PI);
      ctx.fillStyle = this.config.shading.stone.moss;
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.75, size * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const occlusion = ctx.createRadialGradient(
      opening.cx,
      opening.cy,
      opening.radius * 0.88,
      opening.cx,
      opening.cy,
      opening.radius * 1.25
    );
    occlusion.addColorStop(0, "rgba(0,0,0,0)");
    occlusion.addColorStop(1, "rgba(0,0,0,0.34)");
    ctx.fillStyle = occlusion;
    ctx.fillRect(
      opening.x - this.config.vessel.rimOuter * 2,
      opening.y - this.config.vessel.rimOuter * 2,
      opening.width + this.config.vessel.rimOuter * 4,
      opening.height + this.config.vessel.rimOuter * 4
    );

    ctx.restore();
  }

  #drawTokens(ctx, state) {
    const items = state.visibleItems;
    const now = state.now;
    for (const item of items) {
      const token = state.tokenVisuals.get(item.id);
      if (!token) continue;

      const pos = this.geometry.normalizedToPixel(token.x, token.y);
      const sink = clamp(token.sink, 0, 1);
      const phase = (now * 0.0012 + token.seed * 0.00001) % (Math.PI * 2);
      const bob = Math.sin(phase) * this.config.tokens.bobAmplitude * (1 - sink);
      const driftDepthBias = sink * 8;
      const hover = token.hovered ? this.config.tokens.hoverLift : 0;
      const px = pos.x + token.offsetX;
      const py = pos.y + token.offsetY + bob * this.geometry.opening.height - hover * this.geometry.opening.height + driftDepthBias;
      const scale = 1 - sink * 0.18 + (token.hovered ? 0.03 : 0);
      const alpha = clamp(1 - sink * 0.9, 0, 1);
      const readable = 1 - smoothstep(0.55, 1, sink);

      if (alpha <= 0.01) continue;

      const plaqueWidth = 86 + Math.min(54, item.label.length * 5.1);
      const plaqueHeight = 24;
      const blur = sink > 0.72 ? (sink - 0.72) * 8 : 0;

      ctx.save();
      ctx.translate(px, py);
      ctx.scale(scale, scale);
      if (blur > 0.05) {
        ctx.filter = `blur(${blur.toFixed(2)}px)`;
      }

      const shadowAlpha = 0.18 * alpha * (1 - sink * 0.5);
      ctx.fillStyle = `rgba(0,0,0,${shadowAlpha})`;
      ctx.beginPath();
      ctx.roundRect(
        -plaqueWidth * 0.5 + 2,
        -plaqueHeight * 0.5 + 8,
        plaqueWidth,
        plaqueHeight,
        10
      );
      ctx.fill();

      const glowAlpha = token.hovered ? 0.24 * alpha : 0.1 * alpha;
      const glowGrad = ctx.createRadialGradient(0, 0, 6, 0, 0, plaqueWidth * 0.58);
      glowGrad.addColorStop(0, token.hovered
        ? this.config.tokens.plaqueColors.hoverGlow
        : this.config.tokens.plaqueColors.glow);
      glowGrad.addColorStop(1, "rgba(255, 112, 217, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.ellipse(0, 2, plaqueWidth * 0.44, plaqueHeight * 0.88, 0, 0, Math.PI * 2);
      ctx.fill();

      const plaqueGrad = ctx.createLinearGradient(0, -plaqueHeight * 0.5, 0, plaqueHeight * 0.5);
      plaqueGrad.addColorStop(0, this.config.tokens.plaqueColors.face);
      plaqueGrad.addColorStop(1, this.config.tokens.plaqueColors.face2);

      ctx.fillStyle = plaqueGrad;
      ctx.strokeStyle = this.config.tokens.plaqueColors.edge;
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.roundRect(
        -plaqueWidth * 0.5,
        -plaqueHeight * 0.5,
        plaqueWidth,
        plaqueHeight,
        10
      );
      ctx.fill();
      ctx.stroke();

      const topSheen = ctx.createLinearGradient(0, -plaqueHeight * 0.5, 0, 2);
      topSheen.addColorStop(0, `rgba(255,255,255,${0.08 * alpha})`);
      topSheen.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = topSheen;
      ctx.beginPath();
      ctx.roundRect(
        -plaqueWidth * 0.5 + 1,
        -plaqueHeight * 0.5 + 1,
        plaqueWidth - 2,
        plaqueHeight * 0.52,
        9
      );
      ctx.fill();

      if (readable > 0.03) {
        ctx.fillStyle = token.hovered
          ? this.config.tokens.plaqueColors.text
          : `rgba(255, 238, 247, ${0.45 + readable * 0.49})`;
        ctx.font = "12px 'IBM Plex Sans', 'Avenir Next', system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(item.label, 0, 0.5);
      } else {
        ctx.fillStyle = this.config.tokens.plaqueColors.textDeep;
        ctx.beginPath();
        ctx.roundRect(-plaqueWidth * 0.24, -2, plaqueWidth * 0.48, 4, 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  #drawFocusAura(ctx, state) {
    if (!state.focused) return;
    const { opening } = this.geometry;
    ctx.save();
    const aura = ctx.createRadialGradient(
      opening.cx,
      opening.cy,
      opening.radius * 0.72,
      opening.cx,
      opening.cy,
      opening.radius * 1.04
    );
    aura.addColorStop(0, "rgba(255, 156, 222, 0)");
    aura.addColorStop(0.8, "rgba(255, 156, 222, 0.04)");
    aura.addColorStop(1, "rgba(255, 156, 222, 0.12)");
    ctx.fillStyle = aura;
    ctx.fillRect(0, 0, this.geometry.viewport.width, this.geometry.viewport.height);
    ctx.restore();
  }
}

