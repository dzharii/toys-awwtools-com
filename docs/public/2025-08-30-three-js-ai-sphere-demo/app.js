/* AI Sphere — polished plain three.js version (no imports) */

(function () {
  'use strict';

  // ---------- Utilities ----------
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  var TAU = Math.PI * 2;

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

  // ---------- ChartPanel (CanvasTexture HUD) ----------
  function ChartPanel(opts) {
    opts = opts || {};
    this.kind = opts.kind || 'line';
    this.worldWidth = opts.width || 0.7;
    this.worldHeight = opts.height || 0.42;
    this.tint = new THREE.Color(opts.tint != null ? opts.tint : 0x66e0ff);

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { alpha: true, desynchronized: true });

    this.basePx = 640; // a bit sharper than 512
    this.setCanvasSize();

    this.texture = new THREE.CanvasTexture(this.canvas);
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
    this.mesh.renderOrder = 3;

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
    this.samples = new Array(140).fill(0).map(function () { return 0.35 + 0.6 * rng(); });
    this.gaugeValue = 142;
    this.bars = new Array(8).fill(0).map(function () { return 0.4 + 0.6 * rng(); });
  };

  ChartPanel.prototype.setPaused = function (v) { this.paused = !!v; };

  ChartPanel.prototype.update = function (dt) {
    if (this.paused) return;
    this.time += dt;

    if (this.kind === 'line' || this.kind === 'bars') {
      var t = this.time * 0.7;
      var next = 0.5 + 0.35 * Math.sin(t * 1.23 + Math.sin(t * 0.7) * 0.5) + 0.15 * (rng() - 0.5);
      this.samples.push(clamp(next, 0, 1));
      if (this.samples.length > 140) this.samples.shift();
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
    this.draw();
  };

  ChartPanel.prototype.draw = function () {
    var ctx = this.ctx;
    var w = this.basePx;
    var h = (this.canvas.height / this.scale) | 0;

    ctx.clearRect(0, 0, w, h);

    // Brighter background with subtle vignette
    var bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, "rgba(20,42,80,0.45)");
    bgGrad.addColorStop(1, "rgba(12,24,44,0.25)");
    ctx.fillStyle = bgGrad;
    roundRect(ctx, 0, 0, w, h, 22); ctx.fill();

    // Top header strip
    ctx.fillStyle = "rgba(70,150,255,0.10)";
    roundRect(ctx, 0, 0, w, 48, { tl: 22, tr: 22, br: 0, bl: 0 }); ctx.fill();

    // Neon divider
    var neon = this.tint.clone().multiplyScalar(1).getStyle();
    ctx.strokeStyle = neon; ctx.globalAlpha = 0.9; ctx.lineWidth = 2;
    ctx.shadowBlur = 18; ctx.shadowColor = this.tint.getStyle();
    ctx.beginPath(); ctx.moveTo(18, 50); ctx.lineTo(w - 18, 50); ctx.stroke();
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;

    // Title
    ctx.font = "800 24px/1.1 system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif";
    ctx.fillStyle = "rgba(190,220,255,0.97)";
    ctx.fillText(this._titleText(), 18, 30);

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
    var pad = 20;
    var x0 = pad, y0 = 76, x1 = w - pad, y1 = h - pad - 18;

    // Grid
    ctx.strokeStyle = "rgba(140,170,230,0.12)"; ctx.lineWidth = 1; ctx.setLineDash([4, 6]);
    ctx.beginPath();
    for (var i = 0; i <= 5; i++) {
      var y = y0 + ((y1 - y0) * i) / 5;
      ctx.moveTo(x0, y); ctx.lineTo(x1, y);
    }
    ctx.stroke(); ctx.setLineDash([]);

    // Area under curve (soft)
    var data = this.samples, n = data.length;
    var path = new Path2D(); var first = true;
    for (var j = 0; j < n; j++) {
      var t = j / (n - 1);
      var x = lerp(x0, x1, t);
      var y = lerp(y1, y0, data[j] * 0.85 + 0.05);
      if (first) { path.moveTo(x, y); first = false; } else { path.lineTo(x, y); }
    }
    var g = ctx.createLinearGradient(0, y0, 0, y1);
    g.addColorStop(0, "rgba(99,225,255,0.35)");
    g.addColorStop(1, "rgba(99,225,255,0.00)");
    ctx.globalAlpha = 0.7; ctx.fillStyle = g;
    ctx.save(); ctx.lineTo(x1, y1); ctx.lineTo(x0, y1); ctx.clip(); ctx.fill(path); ctx.restore();
    ctx.globalAlpha = 1;

    // Stroke with glow
    ctx.shadowBlur = 22; ctx.shadowColor = this.tint.getStyle();
    ctx.strokeStyle = this.tint.getStyle(); ctx.lineWidth = 2.2; ctx.beginPath();
    for (var k = 0; k < n; k++) {
      var t2 = k / (n - 1);
      var x2 = lerp(x0, x1, t2);
      var y2 = lerp(y1, y0, data[k] * 0.85 + 0.05);
      if (k === 0) ctx.moveTo(x2, y2); else ctx.lineTo(x2, y2);
    }
    ctx.stroke(); ctx.shadowBlur = 0;

    // Cursor and readout
    var time = this.time || 0;
    var cursorT = (time * 0.25) % 1;
    var cx = lerp(x0, x1, cursorT);
    ctx.strokeStyle = "rgba(120,190,255,0.45)";
    ctx.beginPath(); ctx.moveTo(cx, y0); ctx.lineTo(cx, y1); ctx.stroke();

    var val = data[(data.length * cursorT) | 0];
    ctx.fillStyle = "rgba(220,240,255,0.98)";
    ctx.font = "800 20px/1 Segoe UI, Roboto, Helvetica, Arial, sans-serif";
    ctx.fillText((val * 100).toFixed(1) + "%", x0 + 6, y0 - 10);
  };

  ChartPanel.prototype._drawGauge = function (w, h) {
    var ctx = this.ctx;
    var cx = w * 0.28, cy = h * 0.6;
    var r0 = Math.min(w, h) * 0.24;
    var start = -Math.PI * 0.75, end = Math.PI * 0.75;

    ctx.lineCap = "round";
    ctx.lineWidth = 18; ctx.strokeStyle = "rgba(60,100,180,0.22)";
    ctx.beginPath(); ctx.arc(cx, cy, r0, start, end); ctx.stroke();

    var vNorm = clamp(this.gaugeValue / 200, 0, 1);
    var a = lerp(start, end, vNorm);
    var grad = ctx.createLinearGradient(cx - r0, cy - r0, cx + r0, cy + r0);
    grad.addColorStop(0, this.tint.getStyle()); grad.addColorStop(1, "#9f7aff");
    ctx.shadowBlur = 28; ctx.shadowColor = this.tint.getStyle();
    ctx.strokeStyle = grad; ctx.beginPath(); ctx.arc(cx, cy, r0, start, a); ctx.stroke(); ctx.shadowBlur = 0;

    ctx.lineWidth = 4; ctx.strokeStyle = "rgba(180,220,255,0.85)";
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * (r0 + 6), cy + Math.sin(a) * (r0 + 6)); ctx.stroke();

    ctx.fillStyle = "rgba(220,240,255,0.98)";
    ctx.font = "800 36px/1.1 system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif";
    ctx.fillText(String(this.gaugeValue), cx - 8, cy + 10);
    ctx.font = "700 14px/1 Segoe UI, Roboto, Helvetica, Arial, sans-serif";
    ctx.fillStyle = "rgba(170,200,255,0.9)";
    ctx.fillText("Models", cx - 12, cy + 28);

    var bx = w * 0.62, by = h * 0.35, bw = w * 0.3, bh = h * 0.45;
    ctx.fillStyle = "rgba(70,150,255,0.06)";
    roundRect(ctx, bx - 8, by - 12, bw + 16, bh + 24, 12); ctx.fill();

    for (var i = 0; i < 6; i++) {
      var t = (i + 1) / 6, y = lerp(by + bh, by, t);
      ctx.strokeStyle = "rgba(120,160,230,0.12)";
      ctx.beginPath(); ctx.moveTo(bx, y); ctx.lineTo(bx + bw, y); ctx.stroke();
    }
    ctx.shadowBlur = 18; ctx.shadowColor = this.tint.getStyle();
    for (var j = 0; j < 8; j++) {
      var hN = (0.3 + 0.7 * ((Math.sin(this.time * 0.9 + j) + 1) / 2)) * bh * 0.9;
      var x = bx + j * (bw / 8) + 6; var barW = bw / 10; var y2 = by + bh - hN;
      ctx.fillStyle = j % 2 ? "rgba(100,220,255,0.7)" : "rgba(160,130,255,0.85)";
      roundRect(ctx, x, y2, barW, hN, 6); ctx.fill();
    }
    ctx.shadowBlur = 0;
  };

  ChartPanel.prototype._drawBars = function (w, h) {
    var ctx = this.ctx;
    var pad = 20;
    var x0 = pad, y0 = 76, x1 = w - pad, y1 = h - pad - 18;

    var n = this.bars.length, bw = (x1 - x0) / (n * 1.4);
    for (var i = 0; i < n; i++) {
      var x = x0 + i * bw * 1.4;
      var hN = this.bars[i] * (y1 - y0);
      ctx.shadowBlur = 18; ctx.shadowColor = this.tint.getStyle();
      ctx.fillStyle = i % 2 ? "rgba(120,210,255,0.9)" : "rgba(160,130,255,0.85)";
      roundRect(ctx, x, y1 - hN, bw, hN, 6); ctx.fill();
    }
    ctx.shadowBlur = 0;

    var data = this.samples;
    ctx.strokeStyle = "rgba(200,230,255,0.8)"; ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (var j = 0; j < data.length; j++) {
      var t = j / (data.length - 1);
      var xx = lerp(x0, x1, t);
      var yy = lerp(y1, y0, data[j] * 0.85 + 0.05);
      if (j === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
    }
    ctx.stroke();

    ctx.fillStyle = "rgba(180,205,245,0.9)";
    ctx.font = "700 14px/1 Segoe UI, Roboto, Helvetica, Arial, sans-serif";
    ctx.fillText("Active Users", x0, y0 - 12);
    ctx.fillText("Inferences/min", x0 + 160, y0 - 12);
  };

  ChartPanel.prototype._drawLogo = function (w, h) {
    var ctx = this.ctx;
    var cx = w * 0.17, cy = h * 0.24, r = 42;

    ctx.shadowBlur = 28; ctx.shadowColor = this.tint.getStyle();
    var grad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    grad.addColorStop(0, "#7affff"); grad.addColorStop(1, "#9f7aff");
    ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#0b0e1a";
    ctx.font = "900 28px/1 Segoe UI, Roboto, Helvetica, Arial, sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("AI", cx, cy + 1);

    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(190,210,255,0.99)";
    ctx.font = "900 40px/1 system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif";
    ctx.fillText("AISphere", cx + 66, cy + 3);

    // Waveform
    var x0 = 24, x1 = w - 24, y = cy + 62;
    var amp = 22 + 7 * Math.sin(this.time * 2.0);
    ctx.strokeStyle = "rgba(130,200,255,0.9)"; ctx.lineWidth = 2;
    ctx.beginPath();
    for (var i = 0; i <= 60; i++) {
      var t = i / 60;
      var xx = lerp(x0, x1, t);
      var yy = y + Math.sin(t * 6 * Math.PI + this.time * 2.4) * amp * (1 - Math.abs(t - 0.5) * 1.6);
      if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
    }
    ctx.stroke();

    // Small stat card
    ctx.fillStyle = "rgba(70,150,255,0.08)";
    roundRect(ctx, w - 240, 20, 220, 92, 12); ctx.fill();
    ctx.fillStyle = "rgba(200,230,255,0.98)";
    ctx.font = "800 16px/1 Segoe UI, Roboto, Helvetica, Arial, sans-serif";
    ctx.fillText("Uptime", w - 224, 50);
    ctx.fillText("Latency", w - 224, 86);
    ctx.fillStyle = "rgba(120,200,255,0.98)";
    ctx.font = "900 24px/1 Segoe UI, Roboto, Helvetica, Arial, sans-serif";
    ctx.fillText((99.9 + 0.08 * Math.sin(this.time)).toFixed(2) + "%", w - 136, 50);
    ctx.fillText((42 + 6 * Math.sin(this.time * 1.8)).toFixed(0) + " ms", w - 136, 86);
  };

  // Rounded rect helper
  function roundRect(ctx, x, y, w, h, r) {
    var tl, tr, br, bl;
    if (typeof r === "object") { tl = r.tl||8; tr = r.tr||8; br = r.br||8; bl = r.bl||8; }
    else { tl = tr = br = bl = r || 8; }
    ctx.beginPath();
    ctx.moveTo(x + tl, y); ctx.lineTo(x + w - tr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + tr);
    ctx.lineTo(x + w, y + h - br);
    ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
    ctx.lineTo(x + bl, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - bl);
    ctx.lineTo(x, y + tl);
    ctx.quadraticCurveTo(x, y, x + tl, y);
    ctx.closePath();
  }

  // ---------- Scene ----------
  var container = document.getElementById('app');

  var renderer = new THREE.WebGLRenderer({
    antialias: true, alpha: true, powerPreference: "high-performance", stencil: false, depth: true
  });
  if ('outputColorSpace' in renderer && 'SRGBColorSpace' in THREE) {
    renderer.outputColorSpace = THREE.SRGBColorSpace;
  } else if ('outputEncoding' in renderer && 'sRGBEncoding' in THREE) {
    renderer.outputEncoding = THREE.sRGBEncoding;
  }
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2; // brighter overall
  if ('physicallyCorrectLights' in renderer) renderer.physicallyCorrectLights = true;
  renderer.setPixelRatio(clamp(window.devicePixelRatio || 1, 1, 2));
  renderer.setSize(container.clientWidth, container.clientHeight, false);
  container.appendChild(renderer.domElement);

  renderer.domElement.addEventListener('webglcontextlost', function (e) { e.preventDefault(); });
  renderer.domElement.addEventListener('webglcontextrestored', function () {});

  var scene = new THREE.Scene();
  // HDR environment for reflections
  try {
    var pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    if (THREE.RGBELoader) {
      new THREE.RGBELoader()
        .setDataType(THREE.UnsignedByteType)
        .load('https://cdn.jsdelivr.net/gh/mrdoob/three.js@r146/examples/textures/equirectangular/royal_esplanade_1k.hdr', function (hdr) {
          var env = pmrem.fromEquirectangular(hdr).texture;
          scene.environment = env;
          hdr.dispose(); pmrem.dispose();
        });
    }
  } catch (e) {}
  var camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 50);
  camera.position.set(2.4, 1.5, 3.4);

  // Core lighting: ambient + hemisphere
  scene.add(new THREE.AmbientLight(0x4e6a9f, 0.35));
  var hemi = new THREE.HemisphereLight(0xaad4ff, 0x0b0f18, 0.65);
  scene.add(hemi);

  var controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = 0.06;
  controls.minDistance = 1.8; controls.maxDistance = 6.5; controls.enablePan = true;
  controls.target.set(0, 0.5, 0);

  // ---------- AI Sphere group ----------
  var root = new THREE.Group(); scene.add(root);

  var sphereGroup = new THREE.Group(); sphereGroup.position.y = 0.64; root.add(sphereGroup);

  var R = 1.0;

  // Glass sphere — tuned for visibility
  var outerGeo = new THREE.SphereGeometry(R, 96, 96);
  var glassMat = new THREE.MeshPhysicalMaterial({
    transmission: 0.95,
    thickness: 0.45,
    ior: 1.2,
    transparent: true,
    opacity: 0.42,
    roughness: 0.18,
    metalness: 0.1,
    clearcoat: 0.9,
    clearcoatRoughness: 0.3,
    reflectivity: 0.6,
    color: new THREE.Color(0x13325a),
    depthWrite: false, // key: panels remain visible through glass
    // polished values for premium glass look
    opacity: 1.0,
    roughness: 0.08,
    metalness: 0.0,
    clearcoatRoughness: 0.15,
    color: new THREE.Color(0x0f213d),
    envMapIntensity: 1.2
  });
  var outerSphere = new THREE.Mesh(outerGeo, glassMat);
  outerSphere.renderOrder = 1;
  sphereGroup.add(outerSphere);

  // Fresnel rim glow (additive)
  var fresnelMat = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(0x6be0ff) },
      power: { value: 2.2 }
    },
    vertexShader: [
      'varying vec3 vNormal; varying vec3 vView;',
      'void main(){',
      'vNormal = normalize(normalMatrix * normal);',
      'vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);',
      'vView = normalize(-mvPosition.xyz);',
      'gl_Position = projectionMatrix * mvPosition;',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform vec3 color; uniform float power;',
      'varying vec3 vNormal; varying vec3 vView;',
      'void main(){',
      'float f = pow(1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0), power);',
      'gl_FragColor = vec4(color * f * 1.4, f * 1.2);',
      '}'
    ].join('\n'),
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.FrontSide
  });
  var fresnelShell = new THREE.Mesh(new THREE.SphereGeometry(R * 1.005, 96, 96), fresnelMat);
  fresnelShell.renderOrder = 2;
  sphereGroup.add(fresnelShell);

  // Inner particles
  var pCount = 900;
  var pGeo = new THREE.BufferGeometry();
  var pos = new Float32Array(pCount * 3);
  var col = new Float32Array(pCount * 3);
  for (var i = 0; i < pCount; i++) {
    var r = Math.pow(rng(), 1/3) * (R * 0.78);
    var u = rng(), v = rng();
    var theta = u * TAU;
    var phi = Math.acos(2 * v - 1);
    pos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.cos(phi);
    pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    // slight color variance
    var c = new THREE.Color().setHSL(0.55 + (rng()-0.5)*0.05, 1.0, 0.6);
    col[i*3+0]=c.r; col[i*3+1]=c.g; col[i*3+2]=c.b;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  var pMat = new THREE.PointsMaterial({
    size: 0.012,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  var points = new THREE.Points(pGeo, pMat);
  points.renderOrder = 0; sphereGroup.add(points);

  // Lights around the sphere for glossy reflections
  if (THREE.RectAreaLightUniformsLib) THREE.RectAreaLightUniformsLib.init();
  var rect1 = new THREE.RectAreaLight(0x7fd2ff, 22, 1.2, 0.6); // color, intensity, width, height
  rect1.position.set(1.6, 1.8, 1.2); rect1.lookAt(0, 0.6, 0); scene.add(rect1);
  var rect2 = new THREE.RectAreaLight(0x9f7aff, 18, 1.0, 0.5);
  rect2.position.set(-1.2, 1.5, 2.0); rect2.lookAt(0, 0.6, 0); scene.add(rect2);

  var innerCyan = new THREE.PointLight(0x66e0ff, 0.8, 3.0); innerCyan.position.set(0.0, 0.2, 0.0); sphereGroup.add(innerCyan);
  var backMagenta = new THREE.PointLight(0x9b6bff, 0.6, 6.0); backMagenta.position.set(-2.0, 1.0, -2.0); scene.add(backMagenta);

  // Neon pedestal ring
  var ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.62, 0.05, 32, 96),
    new THREE.MeshStandardMaterial({
      color: 0x0c1222, emissive: 0x2ee6ff, emissiveIntensity: 0.9, metalness: 0.4, roughness: 0.3, envMapIntensity: 0.8
    })
  );
  ring.position.y = 0.06; root.add(ring);

  // Desk (warm) and LED under-glow disc
  var desk = new THREE.Mesh(
    new THREE.CircleGeometry(4.2, 96),
    new THREE.MeshStandardMaterial({ color: 0xc29a6a, roughness: 0.95, metalness: 0.0 })
  );
  desk.rotation.x = -Math.PI/2; desk.position.y = -0.02; scene.add(desk);

  // Under-glow shader plane
  var glowMat = new THREE.ShaderMaterial({
    uniforms: { color: { value: new THREE.Color(0x6bd2ff) } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: [
      'uniform vec3 color; varying vec2 vUv;',
      'void main(){',
      'vec2 c = vUv - 0.5;',
      'float d = length(c)*2.0;',
      'float a = smoothstep(0.9, 0.1, d);',
      'gl_FragColor = vec4(color * a * 1.3, a*0.8);',
      '}'
    ].join('\n'),
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
  });
  var glow = new THREE.Mesh(new THREE.CircleGeometry(1.4, 64), glowMat);
  glow.rotation.x = -Math.PI/2; glow.position.y = 0.03; root.add(glow);

  // Soft contact shadow to better ground the sphere
  var shadowMat = new THREE.ShaderMaterial({
    uniforms: {},
    vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: [
      'varying vec2 vUv;',
      'void main(){',
      '  vec2 c = vUv - 0.5;',
      '  float d = length(c)*2.0;',
      '  float a = smoothstep(1.2, 0.2, d);',
      '  gl_FragColor = vec4(0.0,0.0,0.0, a*0.35);',
      '}'
    ].join('\n'),
    transparent: true, depthWrite: false
  });
  var contactShadow = new THREE.Mesh(new THREE.CircleGeometry(1.2, 64), shadowMat);
  contactShadow.rotation.x = -Math.PI/2; contactShadow.position.y = 0.029; root.add(contactShadow);

  // ---------- Panels ----------
  var panels = [];
  function createPanel(kind, width, height, color) {
    var panel = new ChartPanel({ kind: kind, width: width, height: height, tint: color });
    panels.push(panel); sphereGroup.add(panel.mesh); return panel;
  }

  var panelLogo = createPanel('logo', 1.05, 0.54, 0x7ae7ff);
  var panelLine = createPanel('line', 0.88, 0.46, 0x6be0ff);
  var panelGauge = createPanel('gauge', 0.88, 0.52, 0x8f7aff);
  var panelBars = createPanel('bars', 0.82, 0.44, 0x83f1ff);

  function placePanel(panel, latDeg, lonDeg, radius) {
    var lat = THREE.MathUtils.degToRad(latDeg);
    var lon = THREE.MathUtils.degToRad(lonDeg);
    var r = radius != null ? radius : (R * 0.83);
    var x = r * Math.cos(lat) * Math.sin(lon);
    var y = r * Math.sin(lat);
    var z = r * Math.cos(lat) * Math.cos(lon);
    panel.mesh.position.set(x, y, z);
    var outward = new THREE.Vector3(x, y, z).normalize();
    panel.mesh.lookAt(outward.clone().multiplyScalar(2));
    var tiltAxis = new THREE.Vector3().crossVectors(outward, new THREE.Vector3(0, 1, 0)).normalize();
    panel.mesh.rotateOnAxis(tiltAxis, THREE.MathUtils.degToRad(-8));
  }

  // Front-hemisphere layout similar to the reference
  placePanel(panelLogo, 10,   0,  R * 0.82);
  placePanel(panelLine, -2,  42,  R * 0.82);
  placePanel(panelGauge, -6, -52, R * 0.82);
  placePanel(panelBars,  14, 104, R * 0.82);

  // ---------- Postprocessing (Bloom) ----------
  var composer = new THREE.EffectComposer(renderer);
  var renderPass = new THREE.RenderPass(scene, camera);
  composer.addPass(renderPass);

  var bloom = new THREE.UnrealBloomPass(
    new THREE.Vector2(container.clientWidth, container.clientHeight),
    0.95,
    0.7,
    0.2
  );
  composer.addPass(bloom);

  // FXAA anti-aliasing (last pass)
  var fxaa = null;
  if (THREE.FXAAShader) {
    fxaa = new THREE.ShaderPass(THREE.FXAAShader);
    var prInit = clamp(window.devicePixelRatio || 1, 1, 2);
    fxaa.material.uniforms['resolution'].value.set(1/(container.clientWidth*prInit), 1/(container.clientHeight*prInit));
    composer.addPass(fxaa);
  }

  // ---------- Animation ----------
  var last = performance.now() / 1000;
  var paused = false;

  function frame() {
    var now = performance.now() / 1000;
    var dt = now - last; last = now;

    // Gentle idle motion
    sphereGroup.rotation.y += dt * 0.14;
    sphereGroup.rotation.x = Math.sin(now * 0.35) * 0.06;
    points.rotation.y -= dt * 0.20;

    // Pulse the ring and inner light for life
    ring.material.emissiveIntensity = 0.8 + 0.4 * (Math.sin(now * 2.2) * 0.5 + 0.5);
    innerCyan.intensity = 0.6 + 0.3 * (Math.sin(now * 2.0) * 0.5 + 0.5);

    if (!paused) for (var i = 0; i < panels.length; i++) panels[i].update(dt);

    controls.update();
    composer.render();

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // ---------- Events ----------
  window.addEventListener('resize', function () {
    var w = container.clientWidth, h = container.clientHeight;
    var pr = clamp(window.devicePixelRatio || 1, 1, 2);
    renderer.setPixelRatio(pr); renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    composer.setSize(w, h); bloom.setSize(w, h);
    if (typeof fxaa !== 'undefined' && fxaa) {
      fxaa.material.uniforms['resolution'].value.set(1/(w*pr), 1/(h*pr));
    }
    for (var i = 0; i < panels.length; i++) { panels[i].setCanvasSize(); panels[i].draw(); }
  });

  window.addEventListener('keydown', function (e) {
    if (e.code === 'Space') { paused = !paused; for (var i = 0; i < panels.length; i++) panels[i].setPaused(paused); }
    if (e.key === 'b' || e.key === 'B') { bloom.enabled = !bloom.enabled; }
  });

  container.addEventListener('pointerdown', function () { container.focus({ preventScroll: true }); }, { passive: true });

  // Cleanup
  function dispose() {
    for (var i = 0; i < panels.length; i++) {
      var p = panels[i];
      p.texture.dispose(); p.mesh.geometry.dispose();
      if (p.mesh.material.map && p.mesh.material.map.dispose) p.mesh.material.map.dispose();
      p.mesh.material.dispose();
    }
    outerGeo.dispose(); glassMat.dispose();
    pGeo.dispose(); pMat.dispose();
    fresnelShell.geometry.dispose(); fresnelMat.dispose();
    if (composer && composer.dispose) composer.dispose();
  }
  window.addEventListener('pagehide', dispose, { once: true });
  window.addEventListener('beforeunload', dispose, { once: true });
})();

