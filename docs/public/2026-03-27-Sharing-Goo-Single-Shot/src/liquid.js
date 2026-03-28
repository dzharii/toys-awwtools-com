import { clamp, lerp } from "./utils.js";

export class LiquidSimulation {
  constructor(config, geometry, reducedMotion = false) {
    this.config = config;
    this.geometry = geometry;
    this.reducedMotion = reducedMotion;

    this.cols = 0;
    this.rows = 0;
    this.width = 0;
    this.height = 0;

    this.heightField = new Float32Array(0);
    this.velocityField = new Float32Array(0);
    this.tempField = new Float32Array(0);

    this.pointer = {
      active: false,
      over: false,
      dragOver: false,
      x: 0.5,
      y: 0.5,
      sx: 0.5,
      sy: 0.5,
      lastInside: false,
    };

    this.activity = 0;
    this.time = 0;
  }

  resize() {
    const portrait = this.geometry.mode === "portrait";
    const cols = portrait
      ? this.config.simulation.portraitCols
      : this.config.simulation.baseCols;
    const rows = portrait
      ? this.config.simulation.portraitRows
      : this.config.simulation.baseRows;

    if (cols === this.cols && rows === this.rows) return;

    this.cols = cols;
    this.rows = rows;
    const size = cols * rows;

    this.heightField = new Float32Array(size);
    this.velocityField = new Float32Array(size);
    this.tempField = new Float32Array(size);
    this.width = cols;
    this.height = rows;
    this.activity = 0;
  }

  setReducedMotion(reduced) {
    this.reducedMotion = reduced;
  }

  setPointer(nx, ny, active = true) {
    this.pointer.x = clamp(nx, 0, 1);
    this.pointer.y = clamp(ny, 0, 1);
    this.pointer.active = active;
    this.pointer.over = active;
  }

  setPointerOutside() {
    this.pointer.active = false;
    this.pointer.over = false;
  }

  setDragOver(isDragOver, nx = this.pointer.x, ny = this.pointer.y) {
    this.pointer.dragOver = isDragOver;
    if (isDragOver) {
      this.pointer.x = clamp(nx, 0, 1);
      this.pointer.y = clamp(ny, 0, 1);
      this.pointer.active = true;
      this.pointer.over = true;
    }
  }

  addImpulse(nx, ny, strength, radius = this.config.simulation.impactRadius) {
    const cx = clamp(nx, 0, 1) * (this.cols - 1);
    const cy = clamp(ny, 0, 1) * (this.rows - 1);
    const r = Math.max(1, radius * Math.min(this.cols, this.rows));
    const rSq = r * r;
    const minX = Math.max(0, Math.floor(cx - r - 1));
    const maxX = Math.min(this.cols - 1, Math.ceil(cx + r + 1));
    const minY = Math.max(0, Math.floor(cy - r - 1));
    const maxY = Math.min(this.rows - 1, Math.ceil(cy + r + 1));

    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const dx = x - cx;
        const dy = y - cy;
        const distSq = dx * dx + dy * dy;
        if (distSq > rSq) continue;
        const falloff = 1 - Math.sqrt(distSq) / r;
        const index = y * this.cols + x;
        this.velocityField[index] += strength * falloff * falloff;
      }
    }

    this.activity = clamp(this.activity + Math.abs(strength) * 0.18, 0, 1);
  }

  step(deltaMs) {
    if (!this.cols || !this.rows) return;
    const dt = Math.min(33, Math.max(8, deltaMs || 16.67));
    this.time += dt;

    const lag = this.config.simulation.pointerLag;
    this.pointer.sx = lerp(this.pointer.sx, this.pointer.x, lag);
    this.pointer.sy = lerp(this.pointer.sy, this.pointer.y, lag);

    const idleAmplitude = this.reducedMotion
      ? this.config.simulation.idleAmplitudeReduced
      : this.config.simulation.idleAmplitude;

    for (let pass = 0; pass < this.config.simulation.solverPasses; pass += 1) {
      this.#injectIdle(idleAmplitude, pass);
      this.#injectPointerInfluence();
      this.#solveField();
    }

    this.activity *= this.config.simulation.activityDecay;
  }

  getActivity() {
    return clamp(this.activity, 0, 1);
  }

  sample(nx, ny) {
    const x = clamp(nx, 0, 1) * (this.cols - 1);
    const y = clamp(ny, 0, 1) * (this.rows - 1);
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const x1 = Math.min(this.cols - 1, x0 + 1);
    const y1 = Math.min(this.rows - 1, y0 + 1);
    const tx = x - x0;
    const ty = y - y0;

    const i00 = y0 * this.cols + x0;
    const i10 = y0 * this.cols + x1;
    const i01 = y1 * this.cols + x0;
    const i11 = y1 * this.cols + x1;

    const a = lerp(this.heightField[i00], this.heightField[i10], tx);
    const b = lerp(this.heightField[i01], this.heightField[i11], tx);
    return lerp(a, b, ty);
  }

  sampleGradient(nx, ny) {
    const stepX = 1 / Math.max(2, this.cols - 1);
    const stepY = 1 / Math.max(2, this.rows - 1);
    const left = this.sample(nx - stepX, ny);
    const right = this.sample(nx + stepX, ny);
    const up = this.sample(nx, ny - stepY);
    const down = this.sample(nx, ny + stepY);
    return {
      dx: right - left,
      dy: down - up,
    };
  }

  #injectIdle(amplitude, pass) {
    const speedA = this.config.simulation.idleSpeedA;
    const speedB = this.config.simulation.idleSpeedB;
    const phaseA = this.time * speedA + pass * 0.4;
    const phaseB = this.time * speedB + pass * 0.7;

    for (let y = 1; y < this.rows - 1; y += 1) {
      const ny = y / (this.rows - 1);
      for (let x = 1; x < this.cols - 1; x += 1) {
        const nx = x / (this.cols - 1);
        if (!this.geometry.containsNormalizedPoint(nx, ny)) continue;
        const index = y * this.cols + x;
        const waveA = Math.sin((nx * 2.9 + ny * 1.7) * Math.PI + phaseA);
        const waveB = Math.sin((nx * 1.2 - ny * 2.6) * Math.PI + phaseB);
        this.velocityField[index] += (waveA * 0.55 + waveB * 0.45) * amplitude * 0.014;
      }
    }
  }

  #injectPointerInfluence() {
    if (!this.pointer.over && !this.pointer.dragOver) return;

    const radiusNormalized = this.config.simulation.pointerRadius;
    const radius = radiusNormalized * Math.min(this.cols, this.rows);
    const radiusSq = radius * radius;

    const px = this.pointer.sx * (this.cols - 1);
    const py = this.pointer.sy * (this.rows - 1);
    const minX = Math.max(1, Math.floor(px - radius - 1));
    const maxX = Math.min(this.cols - 2, Math.ceil(px + radius + 1));
    const minY = Math.max(1, Math.floor(py - radius - 1));
    const maxY = Math.min(this.rows - 2, Math.ceil(py + radius + 1));

    const dragBoost = this.pointer.dragOver ? this.config.simulation.dragGlowStrength : 0;
    const strengthBase = this.reducedMotion
      ? this.config.simulation.pointerStrength * 0.4
      : this.config.simulation.pointerStrength;

    for (let y = minY; y <= maxY; y += 1) {
      const ny = y / (this.rows - 1);
      for (let x = minX; x <= maxX; x += 1) {
        const nx = x / (this.cols - 1);
        if (!this.geometry.containsNormalizedPoint(nx, ny)) continue;
        const dx = x - px;
        const dy = y - py;
        const distSq = dx * dx + dy * dy;
        if (distSq > radiusSq) continue;
        const dist = Math.sqrt(distSq);
        const falloff = 1 - dist / radius;
        const index = y * this.cols + x;
        this.velocityField[index] += (strengthBase * falloff * falloff + dragBoost * falloff);
      }
    }

    this.activity = clamp(this.activity + (this.pointer.dragOver ? 0.022 : 0.012), 0, 1);
  }

  #solveField() {
    const damping = this.config.simulation.damping;
    const spring = this.config.simulation.spring;
    const coupling = this.config.simulation.neighborCoupling;

    for (let y = 1; y < this.rows - 1; y += 1) {
      for (let x = 1; x < this.cols - 1; x += 1) {
        const index = y * this.cols + x;
        const nx = x / (this.cols - 1);
        const ny = y / (this.rows - 1);

        if (!this.geometry.containsNormalizedPoint(nx, ny)) {
          this.tempField[index] = this.heightField[index] * 0.88;
          this.velocityField[index] *= 0.82;
          continue;
        }

        const left = this.heightField[index - 1];
        const right = this.heightField[index + 1];
        const up = this.heightField[index - this.cols];
        const down = this.heightField[index + this.cols];
        const center = this.heightField[index];
        const laplacian = ((left + right + up + down) * 0.25 - center) * coupling;

        this.velocityField[index] += laplacian;
        this.velocityField[index] += -center * spring;
        this.velocityField[index] *= damping;

        this.tempField[index] = center + this.velocityField[index];
      }
    }

    const swap = this.heightField;
    this.heightField = this.tempField;
    this.tempField = swap;
  }
}

