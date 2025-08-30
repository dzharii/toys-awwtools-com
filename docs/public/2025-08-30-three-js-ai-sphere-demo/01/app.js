// AI Sphere — three.js (vanilla, CDN)
// -------------------------------------------------------------
// Imports: pin to a specific three.js version to avoid future breakage.
// We use jsDelivr CDN and the examples/jsm add-ons for controls/bloom/environment.
// Version pin as verified via CDN directory listings.
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.179.1/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "https://cdn.jsdelivr.net/npm/three@0.179.1/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://cdn.jsdelivr.net/npm/three@0.179.1/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://cdn.jsdelivr.net/npm/three@0.179.1/examples/jsm/postprocessing/UnrealBloomPass.js";
import { RoomEnvironment } from "https://cdn.jsdelivr.net/npm/three@0.179.1/examples/jsm/environments/RoomEnvironment.js";

// -------------------------------------------------------------
// Utilities

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const TAU = Math.PI * 2;

// Deterministic PRNG for repeatable animations across runs (no user input).
// Mulberry32: simple, fast, good enough for visuals.
function createRng(seed = 123456789) {
  let t = seed >>> 0;
  return function rng() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = createRng(0xA15EF00D);

// -------------------------------------------------------------
// ChartPanel: manages a high-DPI canvas, a CanvasTexture, and animated drawing.

class ChartPanel {
  /**
   * @param {Object} options
   * @param {'line'|'gauge'|'bars'|'logo'} options.kind
   * @param {number} options.width  - world units for the plane width
   * @param {number} options.height - world units for the plane height
   * @param {number} options.dprCap - cap for devicePixelRatio to limit GPU memory
   * @param {THREE.ColorRepresentation} options.tint - base neon color
   */
  constructor({ kind, width = 0.7, height = 0.42, dprCap = 2, tint = 0x66e0ff }) {
    this.kind = kind;
    this.worldWidth = width;
    this.worldHeight = height;
    this.tint = new THREE.Color(tint);

    // Internal canvas at high DPI
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d", { alpha: true, desynchronized: true });

    // Configure DPR-aware sizing
    this.basePx = 512; // logical baseline for width; height scales with aspect
    this.setCanvasSize();

    // Texture
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.anisotropy = 8;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.minFilter = THREE.LinearMipmapLinearFilter;
    this.texture.generateMipmaps = true;
    this.texture.needsUpdate = true;

    // Material with Additive blending for glow feel
    const mat = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    // Geometry (flat plane; we position inside the sphere)
    const geom = new THREE.PlaneGeometry(this.worldWidth, this.worldHeight, 1, 1);
    this.mesh = new THREE.Mesh(geom, mat);
    this.mesh.frustumCulled = true;
    this.mesh.renderOrder = 2;

    // Data buffers for animations
    this.time = 0;
    this.paused = false;
    this._initData();
  }

  setCanvasSize() {
    const dpr = clamp(window.devicePixelRatio || 1, 1, 2);
    const pxW = this.basePx * dpr;
    const aspect = this.worldWidth / this.worldHeight;
    this.canvas.width = Math.round(pxW);
    this.canvas.height = Math.round(pxW / aspect);
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // uniform scale for drawing in "logical" units
    this.scale = this.canvas.width / this.basePx;
    this.ctx.scale(this.scale, this.scale);
  }

  _initData() {
    this.samples = new Array(120).fill(0).map(() => 0.35 + 0.6 * rng());
    this.gaugeValue = 142;
    this.bars = new Array(8).fill(0).map(() => 0.4 + 0.6 * rng());
    this.activity = 0.0;
  }

  setPaused(v) {
    this.paused = !!v;
  }

  update(dt) {
    if (this.paused) return;
    this.time += dt;

    // Update fake data with smooth noise
    if (this.kind === "line" || this.kind === "bars") {
      const t = this.time * 0.7;
      const next =
        0.5 +
        0.35 * Math.sin(t * 1.23 + Math.sin(t * 0.7) * 0.5) +
        0.15 * (rng() - 0.5);
      this.samples.push(clamp(next, 0, 1));
      if (this.samples.length > 120) this.samples.shift();
    }
    if (this.kind === "gauge") {
      // slow oscillation + noise
      const base = 140 + Math.sin(this.time * 0.6) * 8;
      this.gaugeValue = Math.round(base + (rng() - 0.5) * 10);
    }
    if (this.kind === "bars") {
      for (let i = 0; i < this.bars.length; i++) {
        const b = this.bars[i];
        this.bars[i] = clamp(b + (rng() - 0.5) * 0.08, 0.05, 1);
      }
    }
    this.activity = (Math.sin(this.time * 1.2) + 1) / 2; // 0..1 pulsing

    this.draw();
  }

  draw() {
    const ctx = this.ctx;
    const w = this.basePx;
    const h = (this.canvas.height / this.scale) | 0;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Panel background frame (subtle)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, "rgba(10,16,32,0.35)");
    bgGrad.addColorStop(1, "rgba(10,16,24,0.1)");
    ctx.fillStyle = bgGrad;
    roundRect(ctx, 0, 0, w, h, 18);
    ctx.fill();

    // Top bar
    ctx.fillStyle = "rgba(70,150,255,0.06)";
    roundRect(ctx, 0, 0, w, 40, { tl: 18, tr: 18, br: 0, bl: 0 });
    ctx.fill();

    // Neon accent line
    const neon = this.tint.clone().multiplyScalar(1).getStyle();
    ctx.strokeStyle = neon;
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 18;
    ctx.shadowColor = this.tint.getStyle();
    ctx.beginPath();
    ctx.moveTo(16, 42);
    ctx.lineTo(w - 16, 42);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    // Title text
    ctx.font = "700 22px/1.1 system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif";
    ctx.fillStyle = "rgba(188,215,255,0.95)";
    ctx.fillText(this._titleText(), 16, 28);

    // Draw content area
    if (this.kind === "line") this._drawLineChart(w, h);
    if (this.kind === "gauge") this._drawGauge(w, h);
    if (this.kind === "bars") this._drawBars(w, h);
    if (this.kind === "logo") this._drawLogo(w, h);

    // Flag texture update
    this.texture.needsUpdate = true;
  }

  _titleText() {
    switch (this.kind) {
      case "line": return "Active Use";
      case "gauge": return "Models";
      case "bars": return "Overview";
      case "logo": return "AISphere";
      default: return "Panel";
    }
  }

  _drawLineChart(w, h) {
    const ctx = this.ctx;
    const pad = 18;
    const x0 = pad, y0 = 68, x1 = w - pad, y1 = h - pad - 14;

    // Grid
    ctx.strokeStyle = "rgba(120,160,230,0.12)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    for (let i = 0; i <= 5; i++) {
      const y = y0 + ((y1 - y0) * i) / 5;
      ctx.moveTo(x0, y);
      ctx.lineTo(x1, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Area/line
    const data = this.samples;
    const n = data.length;
    ctx.lineWidth = 2;

    // Neon glow pass
    ctx.shadowBlur = 22;
    ctx.shadowColor = this.tint.getStyle();
    ctx.strokeStyle = this.tint.getStyle();
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const x = lerp(x0, x1, t);
      const y = lerp(y1, y0, data[i] * 0.85 + 0.05);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Moving cursor pulse
    const time = this.time || 0;
    const cursorT = (time * 0.25) % 1;
    const cx = lerp(x0, x1, cursorT);
    ctx.strokeStyle = "rgba(120,190,255,0.35)";
    ctx.beginPath(); ctx.moveTo(cx, y0); ctx.lineTo(cx, y1); ctx.stroke();

    // Readout
    const val = data[(data.length * cursorT) | 0];
    ctx.fillStyle = "rgba(200,230,255,0.95)";
    ctx.font = "600 18px/1 Segoe UI, Roboto, Helvetica, Arial, sans-serif";
    ctx.fillText(`${(val * 100).toFixed(1)}%`, x0 + 6, y0 + 22);
  }

  _drawGauge(w, h) {
    const ctx = this.ctx;
    const cx = w * 0.28, cy = h * 0.6;
    const r0 = Math.min(w, h) * 0.24;
    const start = -Math.PI * 0.75, end = Math.PI * 0.75;

    // Track
    ctx.lineCap = "round";
    ctx.lineWidth = 18;
    ctx.strokeStyle = "rgba(60,100,180,0.22)";
    ctx.beginPath();
    ctx.arc(cx, cy, r0, start, end);
    ctx.stroke();

    // Value arc
    const vNorm = clamp(this.gaugeValue / 200, 0, 1);
    const a = lerp(start, end, vNorm);
    const grad = ctx.createLinearGradient(cx - r0, cy - r0, cx + r0, cy + r0);
    grad.addColorStop(0, this.tint.getStyle());
    grad.addColorStop(1, "#9f7aff");
    ctx.shadowBlur = 28;
    ctx.shadowColor = this.tint.getStyle();
    ctx.strokeStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r0, start, a);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Needle
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(180,220,255,0.8)";
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * (r0 + 6), cy + Math.sin(a) * (r0 + 6));
    ctx.stroke();

    // Numeric readout
    ctx.fillStyle = "rgba(210,235,255,0.95)";
    ctx.font = "800 34px/1.1 system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif";
    ctx.fillText(String(this.gaugeValue), cx - 8, cy + 10);
    ctx.font = "600 14px/1 Segoe UI, Roboto, Helvetica, Arial, sans-serif";
    ctx.fillStyle = "rgba(160,200,255,0.8)";
    ctx.fillText("Models", cx - 12, cy + 28);

    // Side mini bars
    const bx = w * 0.62, by = h * 0.35, bw = w * 0.3, bh = h * 0.45;
    ctx.fillStyle = "rgba(70,150,255,0.06)";
    roundRect(ctx, bx - 8, by - 12, bw + 16, bh + 24, 12); ctx.fill();

    for (let i = 0; i < 6; i++) {
      const t = (i + 1) / 6;
      const y = lerp(by + bh, by, t);
      ctx.strokeStyle = "rgba(120,160,230,0.12)";
      ctx.beginPath(); ctx.moveTo(bx, y); ctx.lineTo(bx + bw, y); ctx.stroke();
    }
    ctx.shadowBlur = 18;
    ctx.shadowColor = this.tint.getStyle();
    for (let i = 0; i < 8; i++) {
      const hN = (0.3 + 0.7 * ((Math.sin(this.time * 0.9 + i) + 1) / 2)) * bh * 0.9;
      const x = bx + i * (bw / 8) + 6;
      const barW = bw / 10;
      const y = by + bh - hN;
      ctx.fillStyle = "rgba(100,220,255,0.7)";
      roundRect(ctx, x, y, barW, hN, 6); ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  _drawBars(w, h) {
    const ctx = this.ctx;
    const pad = 18;
    const x0 = pad, y0 = 68, x1 = w - pad, y1 = h - pad - 14;

    // Bars
    const n = this.bars.length;
    const bw = (x1 - x0) / (n * 1.4);
    for (let i = 0; i < n; i++) {
      const x = x0 + i * bw * 1.4;
      const hN = this.bars[i] * (y1 - y0);
      ctx.shadowBlur = 18;
      ctx.shadowColor = this.tint.getStyle();
      ctx.fillStyle = i % 2 ? "rgba(120,210,255,0.9)" : "rgba(160,130,255,0.85)";
      roundRect(ctx, x, y1 - hN, bw, hN, 6);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // Sparkline overlay
    const data = this.samples;
    ctx.strokeStyle = "rgba(200,230,255,0.7)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const t = i / (data.length - 1);
      const x = lerp(x0, x1, t);
      const y = lerp(y1, y0, data[i] * 0.85 + 0.05);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Sub-labels
    ctx.fillStyle = "rgba(170,200,240,0.85)";
    ctx.font = "600 14px/1 Segoe UI, Roboto, Helvetica, Arial, sans-serif";
    ctx.fillText("Active Users", x0, y0 - 10);
    ctx.fillText("Inferences/min", x0 + 140, y0 - 10);
  }

  _drawLogo(w, h) {
    const ctx = this.ctx;
    // Centered circular logo with 'AI'
    const cx = w * 0.15, cy = h * 0.22;
    const r = 36;

    // Glow
    ctx.shadowBlur = 24;
    ctx.shadowColor = this.tint.getStyle();
    const grad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    grad.addColorStop(0, "#7affff");
    grad.addColorStop(1, "#9f7aff");
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
    ctx.shadowBlur = 0;

    // 'AI'
    ctx.fillStyle = "#0b0e1a";
    ctx.font = "800 26px/1 Segoe UI, Roboto, Helvetica, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("AI", cx, cy + 1);

    // Headline
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(190,210,255,0.96)";
    ctx.font = "800 34px/1 system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif";
    ctx.fillText("AISphere", cx + 56, cy + 3);

    // Sub-waveform
    const x0 = 24, x1 = w - 24, y = cy + 56;
    const amp = 20 + 6 * Math.sin(this.time * 2.0);
    ctx.strokeStyle = "rgba(130,200,255,0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 60; i++) {
      const t = i / 60;
      const xx = lerp(x0, x1, t);
      const yy = y + Math.sin(t * 6 * Math.PI + this.time * 2.4) * amp * (1 - Math.abs(t - 0.5) * 1.6);
      i === 0 ? ctx.moveTo(xx, yy) : ctx.lineTo(xx, yy);
    }
    ctx.stroke();

    // Mini stat blocks
    ctx.fillStyle = "rgba(70,150,255,0.06)";
    roundRect(ctx, w - 230, 18, 210, 84, 12); ctx.fill();

    ctx.fillStyle = "rgba(200,230,255,0.95)";
    ctx.font = "700 16px/1 Segoe UI, Roboto, Helvetica, Arial, sans-serif";
    ctx.fillText("Uptime", w - 215, 44);
    ctx.fillText("Latency", w - 215, 76);

    ctx.fillStyle = "rgba(120,200,255,0.95)";
    ctx.font = "800 22px/1 Segoe UI, Roboto, Helvetica, Arial, sans-serif";
    ctx.fillText(`${(99.9 + 0.08 * Math.sin(this.time)).toFixed(2)}%`, w - 130, 44);
    ctx.fillText(`${(42 + 6 * Math.sin(this.time * 1.8)).toFixed(0)} ms`, w - 130, 76);
  }
}

// Rounded rect helper
function roundRect(ctx, x, y, w, h, r) {
  let rx = r, ry = r;
  if (typeof r === "object") {
    rx = r; // allow per-corner when r is object
  }
  const radii = {
    tl: typeof rx === "object" ? (rx.tl ?? 8) : rx,
    tr: typeof rx === "object" ? (rx.tr ?? 8) : rx,
    br: typeof rx === "object" ? (rx.br ?? 8) : rx,
    bl: typeof rx === "object" ? (rx.bl ?? 8) : rx
  };
  const { tl, tr, br, bl } = radii;
  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + w - tr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + tr);
  ctx.lineTo(x + w, y + h - br);
  ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
  ctx.lineTo(x + bl, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - bl);
  ctx.lineTo(x, y + tl);
  ctx.quadraticCurveTo(x, y, x + tl, y);
  ctx.closePath();
}

// -------------------------------------------------------------
// Scene setup

const container = document.getElementById("app");

// Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  powerPreference: "high-performance",
  stencil: false,
  depth: true
});
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.physicallyCorrectLights = true;
renderer.setPixelRatio(clamp(window.devicePixelRatio || 1, 1, 2));
renderer.setSize(container.clientWidth, container.clientHeight, false);
container.appendChild(renderer.domElement);

// Guard against context loss
renderer.domElement.addEventListener("webglcontextlost", (e) => {
  e.preventDefault();
  console.warn("WebGL context lost.");
});
renderer.domElement.addEventListener("webglcontextrestored", () => {
  console.warn("WebGL context restored.");
});

// Scene & camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  container.clientWidth / container.clientHeight,
  0.1,
  50
);
camera.position.set(2.3, 1.4, 3.2);

// Environment (no external HDR assets)
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
scene.background = null;

// Lights
const hemi = new THREE.HemisphereLight(0xaad4ff, 0x0b0f18, 0.6);
scene.add(hemi);
const dir = new THREE.DirectionalLight(0xffffff, 1.1);
dir.position.set(4, 6, 3);
dir.castShadow = false;
scene.add(dir);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 1.8;
controls.maxDistance = 6.5;
controls.enablePan = true;
controls.target.set(0, 0.4, 0);

// -------------------------------------------------------------
// AI Sphere assembly

const root = new THREE.Group();
scene.add(root);

const sphereGroup = new THREE.Group();
sphereGroup.position.y = 0.55;
root.add(sphereGroup);

// Outer glassy sphere
const R = 1.0;
const outerGeo = new THREE.SphereGeometry(R, 80, 80);
const glassMat = new THREE.MeshPhysicalMaterial({
  transmission: 1.0,
  transparent: true,
  opacity: 1.0,
  roughness: 0.18,
  metalness: 0.05,
  thickness: 0.7,
  attenuationColor: new THREE.Color(0x223a6b),
  attenuationDistance: 2.5,
  clearcoat: 0.8,
  clearcoatRoughness: 0.2,
  reflectivity: 0.5,
  color: new THREE.Color(0x0a0f1e),
  envMapIntensity: 0.6
});
const outerSphere = new THREE.Mesh(outerGeo, glassMat);
outerSphere.renderOrder = 1;
sphereGroup.add(outerSphere);

// Inner particles (activity)
const pCount = 800;
const pGeo = new THREE.BufferGeometry();
const pos = new Float32Array(pCount * 3);
for (let i = 0; i < pCount; i++) {
  // spherical distribution inside the sphere
  const r = Math.cbrt(rng()) * (R * 0.78);
  const u = rng(), v = rng();
  const theta = u * TAU;
  const phi = Math.acos(2 * v - 1);
  pos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
  pos[i * 3 + 1] = r * Math.cos(phi);
  pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
}
pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
const pMat = new THREE.PointsMaterial({
  size: 0.01,
  color: new THREE.Color(0x6be0ff),
  transparent: true,
  opacity: 0.9,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});
const points = new THREE.Points(pGeo, pMat);
points.renderOrder = 0;
sphereGroup.add(points);

// Glowing base ring pedestal
const ring = new THREE.Mesh(
  new THREE.TorusGeometry(0.6, 0.045, 32, 96),
  new THREE.MeshStandardMaterial({
    color: 0x0c1222,
    emissive: 0x2ee6ff,
    emissiveIntensity: 0.4,
    metalness: 0.4,
    roughness: 0.3
  })
);
ring.position.y = 0.02;
root.add(ring);

// Ground (matte) for subtle reflection illusion
const ground = new THREE.Mesh(
  new THREE.CylinderGeometry(2.4, 2.4, 0.08, 64),
  new THREE.MeshStandardMaterial({ color: 0x0b0f18, metalness: 0.0, roughness: 0.9 })
);
ground.position.y = -0.03;
root.add(ground);

// -------------------------------------------------------------
// HUD Panels inside the sphere (animated CanvasTextures)

const panels = [];

function createPanel(kind, width, height, color) {
  const panel = new ChartPanel({ kind, width, height, tint: color });
  panel.mesh.position.set(0, 0, 0);
  panels.push(panel);
  sphereGroup.add(panel.mesh);
  return panel;
}

// Create 4 panels with different sizes/kinds
const panelLogo = createPanel("logo", 0.95, 0.48, 0x7ae7ff);
const panelLine = createPanel("line", 0.85, 0.44, 0x6be0ff);
const panelGauge = createPanel("gauge", 0.85, 0.5, 0x8f7aff);
const panelBars = createPanel("bars", 0.78, 0.42, 0x83f1ff);

// Position panels just inside the sphere and curve their orientation slightly outward.
// We'll place them at different longitudes/latitudes.
function placePanel(panel, latDeg, lonDeg, radius) {
  const lat = THREE.MathUtils.degToRad(latDeg);
  const lon = THREE.MathUtils.degToRad(lonDeg);
  const r = radius ?? (R * 0.86);
  // Spherical to Cartesian (Y up)
  const x = r * Math.cos(lat) * Math.sin(lon);
  const y = r * Math.sin(lat);
  const z = r * Math.cos(lat) * Math.cos(lon);
  panel.mesh.position.set(x, y, z);
  // Orient the panel to face outward (towards the camera origin by default):
  const outward = new THREE.Vector3(x, y, z).normalize();
  const center = new THREE.Vector3(0, 0, 0);
  panel.mesh.lookAt(outward.clone().multiplyScalar(2)); // face out
  // Slight tilt so that it "wraps" around the sphere visually
  const tiltAxis = new THREE.Vector3().crossVectors(outward, new THREE.Vector3(0, 1, 0)).normalize();
  panel.mesh.rotateOnAxis(tiltAxis, THREE.MathUtils.degToRad(-8));
}

// Distribute panels
placePanel(panelLogo, 12, -20, R * 0.82);
placePanel(panelLine, -2, 45, R * 0.82);
placePanel(panelGauge, -8, -80, R * 0.82);
placePanel(panelBars, 15, 110, R * 0.82);

// -------------------------------------------------------------
// Postprocessing (bloom)

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloom = new UnrealBloomPass(
  new THREE.Vector2(container.clientWidth, container.clientHeight),
  0.65, // strength
  0.9,  // radius
  0.25  // threshold
);
composer.addPass(bloom);

// -------------------------------------------------------------
// Animation loop

let last = performance.now() / 1000;
let paused = false;

function animate() {
  const now = performance.now() / 1000;
  const dt = now - last;
  last = now;

  // Gentle idle motion
  sphereGroup.rotation.y += dt * 0.15;
  sphereGroup.rotation.x = Math.sin(now * 0.35) * 0.06;
  points.rotation.y -= dt * 0.2;
  ring.material.emissiveIntensity = 0.35 + 0.2 * (Math.sin(now * 2.2) * 0.5 + 0.5);

  // Update panels (and their textures)
  if (!paused) {
    for (const p of panels) p.update(dt);
  }

  // Controls & render
  controls.update();
  composer.render();

  // Next frame
  renderer.setAnimationLoop(animate);
}
animate();

// -------------------------------------------------------------
// Events

window.addEventListener("resize", () => {
  const w = container.clientWidth;
  const h = container.clientHeight;
  const pr = clamp(window.devicePixelRatio || 1, 1, 2);
  renderer.setPixelRatio(pr);
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  composer.setSize(w, h);
  bloom.setSize(w, h);
  // Refresh canvases to adapt to DPR changes
  for (const p of panels) {
    p.setCanvasSize();
    p.draw();
  }
});

window.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    paused = !paused;
    for (const p of panels) p.setPaused(paused);
  }
});

// Ensure the app container is focusable for keyboard controls
container.addEventListener("pointerdown", () => container.focus({ preventScroll: true }), { passive: true });

// Clean up on page hide/unload
function dispose() {
  renderer.setAnimationLoop(null);
  controls.dispose();
  for (const p of panels) {
    p.texture.dispose();
    p.mesh.geometry.dispose();
    if (p.mesh.material.map) p.mesh.material.map.dispose?.();
    p.mesh.material.dispose();
  }
  outerGeo.dispose(); glassMat.dispose();
  pGeo.dispose(); pMat.dispose();
  composer.dispose();
}
window.addEventListener("pagehide", dispose, { once: true });
window.addEventListener("beforeunload", dispose, { once: true });

// -------------------------------------------------------------
// End of app.js

