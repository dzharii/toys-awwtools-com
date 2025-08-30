/* AI Sphere — plain three.js globals (no imports) */
/* Everything below assumes THREE and its add-ons are available on window. */

(function () {
  'use strict';

  // ---------- Utilities ----------
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  var TAU = Math.PI * 2;

  // Deterministic RNG (Mulberry32-like)
  function createRng(seed) {
    var t = (seed >>> 0) >>> 0;
    return function rng() {
      t += 0x6d2b79f5;
      var r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }
  var rng = createRng(0xA15EF00D);

  // ---------- ChartPanel (CanvasTexture-powered HUD panel) ----------
  function ChartPanel(opts) {
    opts = opts || {};
    this.kind = opts.kind || 'line';
    this.worldWidth = opts.width || 0.7;
    this.worldHeight = opts.height || 0.42;
    this.tint = new THREE.Color(opts.tint != null ? opts.tint : 0x66e0ff);

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { alpha: true, desynchronized: true });

    this.basePx = 512;
    this.setCanvasSize();

    this.texture = new THREE.CanvasTexture(this.canvas);
    // Handle both modern and older renderer color spaces
    if ('SRGBColorSpace' in THREE && 'colorSpace' in this.texture) {
      this.texture.colorSpace = THREE.SRGBColorSpace;
    } else if ('sRGBEncoding' in THREE && 'encoding' in this.texture) {
      this.texture.encoding = THREE.sRGBEncoding;
    }
    this.texture.anisotropy = 8;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.minFilter = THREE.LinearMipmapLinearFilter;
    this.texture.generateMipmaps = true;

    var mat = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    var geom = new THREE.PlaneGeometry(this.worldWidth, this.worldHeight, 1, 1);
    this.mesh = new THREE.Mesh(geom, mat);
    this.mesh.frustumCulled = true;
    this.mesh.renderOrder = 2;

    this.time = 0;
    this.paused = false;
    this._initData();
  }

  ChartPanel.prototype.setCanvasSize = function () {
    var dpr = clamp(window.devicePixelRatio || 1, 1, 2);
    var pxW = this.basePx * dpr;
    var aspect = this.worldWidth / this.worldHeight;
    this.canvas.width = Math.round(pxW);
    this.canvas.height = Math.round(pxW / aspect);
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.scale = this.canvas.width / this.basePx;
    this.ctx.scale(this.scale, this.scale);
  };

  ChartPanel.prototype._initData = function () {
    this.samples = new Array(120).fill(0).map(function () { return 0.35 + 0.6 * rng(); });
    this.gaugeValue = 142;
    this.bars = new Array(8).fill(0).map(function () { return 0.4 + 0.6 * rng(); });
    this.activity = 0.0;
  };

  ChartPanel.prototype.setPaused = function (v) { this.paused = !!v; };

  ChartPanel.prototype.update = function (dt) {
    if (this.paused) return;
    this.time += dt;

    if (this.kind === 'line' || this.kind === 'bars') {
      var t = this.time * 0.7;
      var next = 0.5 + 0.35 * Math.sin(t * 1.23 + Math.sin(t * 0.7) * 0.5) + 0.15 * (rng() - 0.5);
      this.samples.push(clamp(next, 0, 1));
      if (this.samples.length > 120) this.samples.shift();
    }
    if (this.kind === 'gauge') {
      var base = 140 + Math.sin(this.time * 0.6) * 8;
      this.gaugeValue = Math.round(base + (rng() - 0.5) * 10);
    }
    if (this.kind === 'bars') {
      for (var i = 0; i < this.bars.length; i++) {
        var b = this.bars[i];
        this.bars[i] = clamp(b + (rng() - 0.5) * 0.08, 0.05, 1);
      }
    }
    this.activity = (Math.sin(this.time * 1.2) + 1) / 2;
    this.draw();
  };

  ChartPanel.prototype.draw = function () {
    var ctx = this.ctx;
    var w = this.basePx;
    var h = (this.canvas.height / this.scale) | 0;

    ctx.clearRect(0, 0, w, h);

    var bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, "rgba(10,16,32,0.35)");
    bgGrad.addColorStop(1, "rgba(10,16,24,0.1)");
    ctx.fillStyle = bgGrad;
    roundRect(ctx, 0, 0, w, h, 18); ctx.fill();

    ctx.fillStyle = "rgba(70,150,255,0.06)";
    roundRect(ctx, 0, 0, w, 40, { tl: 18, tr: 18, br: 0, bl: 0 }); ctx.fill();

    var neon = this.tint.clone().multiplyScalar(1).getStyle();
    ctx.strokeStyle = neon;
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 18;
    ctx.shadowColor = this.tint.getStyle();
    ctx.beginPath(); ctx.moveTo(16, 42); ctx.lineTo(w - 16, 42); ctx.stroke();
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;

    ctx.font = "700 22px/1.1 system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif";
    ctx.fillStyle = "rgba(188,215,255,0.95)";
    ctx.fillText(this._titleText(), 16, 28);

    if (this.kind === 'line') this._drawLineChart(w, h);
    if (this.kind === 'gauge') this._drawGauge(w, h);
    if (this.kind === 'bars') this._drawBars(w, h);
    if (this.kind === 'logo') this._drawLogo(w, h);

    this.texture.needsUpdate = true;
  };

  ChartPanel.prototype._titleText = function () {
    switch (this.kind) {
      case 'line': return 'Active Use';
      case 'gauge': return 'Models';
      case 'bars': return 'Overview';
      case 'logo': return 'AISphere';
      default: return 'Panel';
    }
  };

  ChartPanel.prototype._drawLineChart = function (w, h) {
    var ctx = this.ctx;
    var pad = 18;
    var x0 = pad, y0 = 68, x1 = w - pad, y1 = h - pad - 14;

    ctx.strokeStyle = "rgba(120,160,230,0.12)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    for (var i = 0; i <= 5; i++) {
      var y = y0 + ((y1 - y0) * i) / 5;
      ctx.moveTo(x0, y); ctx.lineTo(x1, y);
    }
    ctx.stroke(); ctx.setLineDash([]);

    var data = this.samples;
    var n = data.length;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 22;
    ctx.shadowColor = this.tint.getStyle();
    ctx.strokeStyle = this.tint.getStyle();
    ctx.beginPath();
    for (var j = 0; j < n; j++) {
      var t = j / (n - 1);
      var x = lerp(x0, x1, t);
      var y = lerp(y1, y0, data[j] * 0.85 + 0.05);
      if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke(); ctx.shadowBlur = 0;

    var time = this.time || 0;
    var cursorT = (time * 0.25) % 1;
    var cx = lerp(x0, x1, cursorT);
    ctx.strokeStyle = "rgba(120,190,255,0.35)";
    ctx.beginPath(); ctx.moveTo(cx, y0); ctx.lineTo(cx, y1); ctx.stroke();

    var val = data[(data.length * cursorT) | 0];
    ctx.fillStyle = "rgba(200,230,255,0.95)";
    ctx.font = "600 18px/1 Segoe UI, Roboto, Helvetica, Arial, sans-serif";
    ctx.fillText((val * 100).toFixed(1) + "%", x0 + 6, y0 + 22);
  };

  ChartPanel.prototype._drawGauge = function (w, h) {
    var ctx = this.ctx;
    var cx = w * 0.28, cy = h * 0.6;
    var r0 = Math.min(w, h) * 0.24;
    var start = -Math.PI * 0.75, end = Math.PI * 0.75;

    ctx.lineCap = "round";
    ctx.lineWidth = 18;
    ctx.strokeStyle = "rgba(60,100,180,0.22)";
    ctx.beginPath(); ctx.arc(cx, cy, r0, start, end); ctx.stroke();

    var vNorm = clamp(this.gaugeValue / 200, 0, 1);
    var a = lerp(start, end, vNorm);
    var grad = ctx.createLinearGradient(cx - r0, cy - r0, cx + r0, cy + r0);
    grad.addColorStop(0, this.tint.getStyle());
    grad.addColorStop(1, "#9f7aff");
    ctx.shadowBlur = 28; ctx.shadowColor = this.tint.getStyle();
    ctx.strokeStyle = grad;
    ctx.beginPath(); ctx.arc(cx, cy, r0, start, a); ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(180,220,255,0.8)";
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * (r0 + 6), cy + Math.sin(a) * (r0 + 6)); ctx.stroke();

    ctx.fillStyle = "rgba(210,235,255,0.95)";
    ctx.font = "800 34px/1.1 system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif";
    ctx.fillText(String(this.gaugeValue), cx - 8, cy + 10);
    ctx.font = "600 14px/1 Segoe UI, Roboto, Helvetica, Arial, sans-serif";
    ctx.fillStyle = "rgba(160,200,255,0.8)";
    ctx.fillText("Models", cx - 12, cy + 28);

    var bx = w * 0.62, by = h * 0.35, bw = w * 0.3, bh = h * 0.45;
    ctx.fillStyle = "rgba(70,150,255,0.06)";
    roundRect(ctx, bx - 8, by - 12, bw + 16, bh + 24, 12); ctx.fill();

    for (var i = 0; i < 6; i++) {
      var t = (i + 1) / 6;
      var y = lerp(by + bh, by, t);
      ctx.strokeStyle = "rgba(120,160,230,0.12)";
      ctx.beginPath(); ctx.moveTo(bx, y); ctx.lineTo(bx + bw, y); ctx.stroke();
    }
    ctx.shadowBlur = 18; ctx.shadowColor = this.tint.getStyle();
    for (var j = 0; j < 8; j++) {
      var hN = (0.3 + 0.7 * ((Math.sin(this.time * 0.9 + j) + 1) / 2)) * bh * 0.9;
      var x = bx + j * (bw / 8) + 6;
      var barW = bw / 10;
      var y2 = by + bh - hN;
      ctx.fillStyle = j % 2 ? "rgba(100,220,255,0.7)" : "rgba(160,130,255,0.85)";
      roundRect(ctx, x, y2, barW, hN, 6); ctx.fill();
    }
    ctx.shadowBlur = 0;
  };

  ChartPanel.prototype._drawBars = function (w, h) {
    var ctx = this.ctx;
    var pad = 18;
    var x0 = pad, y0 = 68, x1 = w - pad, y1 = h - pad - 14;

    var n = this.bars.length;
    var bw = (x1 - x0) / (n * 1.4);
    for (var i = 0; i < n; i++) {
      var x = x0 + i * bw * 1.4;
      var hN = this.bars[i] * (y1 - y0);
      ctx.shadowBlur = 18; ctx.shadowColor = this.tint.getStyle();
      ctx.fillStyle = i % 2 ? "rgba(120,210,255,0.9)" : "rgba(160,130,255,0.85)";
      roundRect(ctx, x, y1 - hN, bw, hN, 6); ctx.fill();
    }
    ctx.shadowBlur = 0;

    var data = this.samples;
    ctx.strokeStyle = "rgba(200,230,255,0.7)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (var j = 0; j < data.length; j++) {
      var t = j / (data.length - 1);
      var xx = lerp(x0, x1, t);
      var yy = lerp(y1, y0, data[j] * 0.85 + 0.05);
      if (j === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
    }
    ctx.stroke();

    ctx.fillStyle = "rgba(170,200,240,0.85)";
    ctx.font = "600 14px/1 Segoe UI, Roboto, Helvetica, Arial, sans-serif";
    ctx.fillText("Active Users", x0, y0 - 10);
    ctx.fillText("Inferences/min", x0 + 140, y0 - 10);
  };

  ChartPanel.prototype._drawLogo = function (w, h) {
    var ctx = this.ctx;
    var cx = w * 0.15, cy = h * 0.22;
    var r = 36;

    ctx.shadowBlur = 24; ctx.shadowColor = this.tint.getStyle();
    var grad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    grad.addColorStop(0, "#7affff"); grad.addColorStop(1, "#9f7aff");
    ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#0b0e1a";
    ctx.font = "800 26px/1 Segoe UI, Roboto, Helvetica, Arial, sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("AI", cx, cy + 1);

    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(190,210,255,0.96)";
    ctx.font = "800 34px/1 system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif";
    ctx.fillText("AISphere", cx + 56, cy + 3);

    var x0 = 24, x1 = w - 24, y = cy + 56;
    var amp = 20 + 6 * Math.sin(this.time * 2.0);
    ctx.strokeStyle = "rgba(130,200,255,0.8)"; ctx.lineWidth = 2;
    ctx.beginPath();
    for (var i = 0; i <= 60; i++) {
      var t = i / 60;
      var xx = lerp(x0, x1, t);
      var yy = y + Math.sin(t * 6 * Math.PI + this.time * 2.4) * amp * (1 - Math.abs(t - 0.5) * 1.6);
      if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
    }
    ctx.stroke();

    ctx.fillStyle = "rgba(70,150,255,0.06)";
    roundRect(ctx, w - 230, 18, 210, 84, 12); ctx.fill();

    ctx.fillStyle = "rgba(200,230,255,0.95)";
    ctx.font = "700 16px/1 Segoe UI, Roboto, Helvetica, Arial, sans-serif";
    ctx.fillText("Uptime", w - 215, 44);
    ctx.fillText("Latency", w - 215, 76);

    ctx.fillStyle = "rgba(120,200,255,0.95)";
    ctx.font = "800 22px/1 Segoe UI, Roboto, Helvetica, Arial, sans-serif";
    ctx.fillText((99.9 + 0.08 * Math.sin(this.time)).toFixed(2) + "%", w - 130, 44);
    ctx.fillText((42 + 6 * Math.sin(this.time * 1.8)).toFixed(0) + " ms", w - 130, 76);
  };

  // Rounded rect helper
  function roundRect(ctx, x, y, w, h, r) {
    var tl, tr, br, bl;
    if (typeof r === "object") {
      tl = r.tl != null ? r.tl : 8;
      tr = r.tr != null ? r.tr : 8;
      br = r.br != null ? r.br : 8;
      bl = r.bl != null ? r.bl : 8;
    } else {
      tl = tr = br = bl = r || 8;
    }
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

  // ---------- Scene setup ----------
  var container = document.getElementById('app');

  var renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
    stencil: false,
    depth: true
  });

  // Set color space compatibly across versions
  if ('outputColorSpace' in renderer && 'SRGBColorSpace' in THREE) {
    renderer.outputColorSpace = THREE.SRGBColorSpace;
  } else if ('outputEncoding' in renderer && 'sRGBEncoding' in THREE) {
    renderer.outputEncoding = THREE.sRGBEncoding;
  }
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  if ('physicallyCorrectLights' in renderer) renderer.physicallyCorrectLights = true;

  renderer.setPixelRatio(clamp(window.devicePixelRatio || 1, 1, 2));
  renderer.setSize(container.clientWidth, container.clientHeight, false);
  container.appendChild(renderer.domElement);

  renderer.domElement.addEventListener('webglcontextlost', function (e) { e.preventDefault(); console.warn('WebGL context lost'); });
  renderer.domElement.addEventListener('webglcontextrestored', function () { console.warn('WebGL context restored'); });

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 50);
  camera.position.set(2.3, 1.4, 3.2);

  // Lights
  var hemi = new THREE.HemisphereLight(0xaad4ff, 0x0b0f18, 0.6); scene.add(hemi);
  var dir = new THREE.DirectionalLight(0xffffff, 1.1); dir.position.set(4, 6, 3); scene.add(dir);

  var controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 1.8;
  controls.maxDistance = 6.5;
  controls.enablePan = true;
  controls.target.set(0, 0.4, 0);

  // ---------- AI Sphere ----------
  var root = new THREE.Group(); scene.add(root);

  var sphereGroup = new THREE.Group(); sphereGroup.position.y = 0.55; root.add(sphereGroup);

  var R = 1.0;
  var outerGeo = new THREE.SphereGeometry(R, 80, 80);
  var glassMat = new THREE.MeshPhysicalMaterial({
    transmission: 1.0,
    transparent: true,
    opacity: 1.0,
    roughness: 0.18,
    metalness: 0.05,
    thickness: 0.7,
    clearcoat: 0.8,
    clearcoatRoughness: 0.2,
    reflectivity: 0.5,
    color: new THREE.Color(0x0a0f1e)
  });
  var outerSphere = new THREE.Mesh(outerGeo, glassMat);
  outerSphere.renderOrder = 1;
  sphereGroup.add(outerSphere);

  // Particles inside
  var pCount = 800;
  var pGeo = new THREE.BufferGeometry();
  var pos = new Float32Array(pCount * 3);
  for (var i = 0; i < pCount; i++) {
    var r = Math.pow(rng(), 1/3) * (R * 0.78);
    var u = rng(), v = rng();
    var theta = u * TAU;
    var phi = Math.acos(2 * v - 1);
    pos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.cos(phi);
    pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  var pMat = new THREE.PointsMaterial({
    size: 0.01,
    color: new THREE.Color(0x6be0ff),
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  var points = new THREE.Points(pGeo, pMat);
  points.renderOrder = 0; sphereGroup.add(points);

  // Neon pedestal ring
  var ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.6, 0.045, 32, 96),
    new THREE.MeshStandardMaterial({
      color: 0x0c1222,
      emissive: 0x2ee6ff,
      emissiveIntensity: 0.4,
      metalness: 0.4, roughness: 0.3
    })
  );
  ring.position.y = 0.02; root.add(ring);

  // Ground
  var ground = new THREE.Mesh(
    new THREE.CylinderGeometry(2.4, 2.4, 0.08, 64),
    new THREE.MeshStandardMaterial({ color: 0x0b0f18, metalness: 0.0, roughness: 0.9 })
  );
  ground.position.y = -0.03; root.add(ground);

  // ---------- Panels ----------
  var panels = [];

  function createPanel(kind, width, height, color) {
    var panel = new ChartPanel({ kind: kind, width: width, height: height, tint: color });
    panels.push(panel);
    sphereGroup.add(panel.mesh);
    return panel;
  }

  var panelLogo = createPanel('logo', 0.95, 0.48, 0x7ae7ff);
  var panelLine = createPanel('line', 0.85, 0.44, 0x6be0ff);
  var panelGauge = createPanel('gauge', 0.85, 0.5, 0x8f7aff);
  var panelBars = createPanel('bars', 0.78, 0.42, 0x83f1ff);

  function placePanel(panel, latDeg, lonDeg, radius) {
    // FIX: use MathUtils.degToRad (THREE.Math is undefined in this build)
    var lat = THREE.MathUtils.degToRad(latDeg);
    var lon = THREE.MathUtils.degToRad(lonDeg);
    var r = radius != null ? radius : (R * 0.82);
    var x = r * Math.cos(lat) * Math.sin(lon);
    var y = r * Math.sin(lat);
    var z = r * Math.cos(lat) * Math.cos(lon);
    panel.mesh.position.set(x, y, z);
    var outward = new THREE.Vector3(x, y, z).normalize();
    panel.mesh.lookAt(outward.clone().multiplyScalar(2)); // face outwards
    var tiltAxis = new THREE.Vector3().crossVectors(outward, new THREE.Vector3(0, 1, 0)).normalize();
    panel.mesh.rotateOnAxis(tiltAxis, THREE.MathUtils.degToRad(-8));
  }

  placePanel(panelLogo, 12, -20, R * 0.82);
  placePanel(panelLine, -2, 45, R * 0.82);
  placePanel(panelGauge, -8, -80, R * 0.82);
  placePanel(panelBars, 15, 110, R * 0.82);

  // ---------- Postprocessing (Bloom) ----------
  var composer = new THREE.EffectComposer(renderer);
  var renderPass = new THREE.RenderPass(scene, camera);
  composer.addPass(renderPass);

  var bloom = new THREE.UnrealBloomPass(
    new THREE.Vector2(container.clientWidth, container.clientHeight),
    0.65, // strength
    0.9,  // radius
    0.25  // threshold
  );
  composer.addPass(bloom);

  // ---------- Animation ----------
  var last = performance.now() / 1000;
  var paused = false;

  function frame() {
    var now = performance.now() / 1000;
    var dt = now - last; last = now;

    sphereGroup.rotation.y += dt * 0.15;
    sphereGroup.rotation.x = Math.sin(now * 0.35) * 0.06;
    points.rotation.y -= dt * 0.2;
    ring.material.emissiveIntensity = 0.35 + 0.2 * (Math.sin(now * 2.2) * 0.5 + 0.5);

    if (!paused) {
      for (var i = 0; i < panels.length; i++) panels[i].update(dt);
    }

    controls.update();
    composer.render();

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // ---------- Events ----------
  window.addEventListener('resize', function () {
    var w = container.clientWidth, h = container.clientHeight;
    var pr = clamp(window.devicePixelRatio || 1, 1, 2);
    renderer.setPixelRatio(pr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    composer.setSize(w, h);
    bloom.setSize(w, h);
    for (var i = 0; i < panels.length; i++) { panels[i].setCanvasSize(); panels[i].draw(); }
  });

  window.addEventListener('keydown', function (e) {
    if (e.code === 'Space') {
      paused = !paused;
      for (var i = 0; i < panels.length; i++) panels[i].setPaused(paused);
    }
  });

  container.addEventListener('pointerdown', function () {
    container.focus({ preventScroll: true });
  }, { passive: true });

  function dispose() {
    for (var i = 0; i < panels.length; i++) {
      var p = panels[i];
      p.texture.dispose();
      p.mesh.geometry.dispose();
      if (p.mesh.material.map && p.mesh.material.map.dispose) p.mesh.material.map.dispose();
      p.mesh.material.dispose();
    }
    outerGeo.dispose(); glassMat.dispose();
    pGeo.dispose(); pMat.dispose();
    if (composer && composer.dispose) composer.dispose();
  }
  window.addEventListener('pagehide', dispose, { once: true });
  window.addEventListener('beforeunload', dispose, { once: true });
})();

