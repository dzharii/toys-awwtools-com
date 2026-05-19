(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const canvas = $('#canvas');
  const viewport = $('#viewport');
  const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
  const marqueeEl = $('#marquee');
  const imageInput = $('#imageInput');
  const projectInput = $('#projectInput');
  const statusText = $('#statusText');
  const zoomText = $('#zoomText');
  const layersList = $('#layersList');
  const selectionInfo = $('#selectionInfo');

  const controls = {
    fillColor: $('#fillColor'),
    fillColor2: $('#fillColor2'),
    strokeColor: $('#strokeColor'),
    shadowColor: $('#shadowColor'),
    fillType: $('#fillType'),
    material: $('#material'),
    strokeWidth: $('#strokeWidth'),
    opacity: $('#opacity'),
    shadowBlur: $('#shadowBlur'),
    shadowX: $('#shadowX'),
    shadowY: $('#shadowY'),
    glow: $('#glow'),
    blur: $('#blur'),
    bevel: $('#bevel'),
    extrude: $('#extrude'),
    blendMode: $('#blendMode'),
    fontSize: $('#fontSize')
  };

  const APP_VERSION = 1;
  const LOCAL_KEY = 'realdrawer-suite-document-v1';
  const DPR_MAX = 2;
  const HANDLE_SIZE = 8;

  let idCounter = 1;
  let renderPending = false;
  let styleHistoryTimer = 0;
  let spaceDown = false;
  let pendingImagePoint = null;

  const imageCache = new Map();

  const state = {
    objects: [],
    layers: [],
    activeLayerId: '',
    selectedIds: [],
    tool: 'select',
    camera: { x: 120, y: 90, zoom: 1 },
    document: { width: 1600, height: 1000, background: 'transparent' },
    defaultStyle: defaultStyle(),
    pointer: null,
    history: [],
    historyIndex: -1,
    clipboard: []
  };

  function nextId(prefix = 'id') {
    return `${prefix}_${Date.now().toString(36)}_${idCounter++}`;
  }

  function defaultStyle() {
    return {
      fill: '#f0b65a',
      fill2: '#783fd7',
      stroke: '#1f2430',
      strokeWidth: 3,
      fillType: 'linear',
      material: 'plastic',
      opacity: 1,
      blend: 'source-over',
      shadowColor: '#000000',
      shadowBlur: 10,
      shadowX: 8,
      shadowY: 10,
      glow: 0,
      blur: 0,
      bevel: 5,
      extrude: 0,
      fontSize: 54,
      fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
      brush: 'round'
    };
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function createLayer(name = 'Layer') {
    return {
      id: nextId('layer'),
      name,
      visible: true,
      locked: false,
      opacity: 1
    };
  }

  function initializeDocument(withDemo = true) {
    idCounter = 1;
    imageCache.clear();
    state.objects = [];
    state.layers = [createLayer('Background'), createLayer('Artwork'), createLayer('Details')];
    state.activeLayerId = state.layers[1].id;
    state.selectedIds = [];
    state.camera = { x: 120, y: 90, zoom: 1 };
    state.defaultStyle = defaultStyle();
    state.clipboard = [];
    if (withDemo) addDemoArtwork();
    syncControlsFromDefault();
    renderLayers();
    pushHistory('Initial document');
    requestRender();
  }

  function addDemoArtwork() {
    const art = state.layers.find(layer => layer.name === 'Artwork').id;
    const details = state.layers.find(layer => layer.name === 'Details').id;

    state.objects.push({
      id: nextId('obj'),
      type: 'rect',
      layerId: art,
      x: 120,
      y: 120,
      w: 460,
      h: 260,
      radius: 38,
      rotation: 0,
      style: {
        ...defaultStyle(),
        fill: '#ffb455',
        fill2: '#7c4dff',
        fillType: 'linear',
        material: 'plastic',
        shadowBlur: 28,
        shadowX: 24,
        shadowY: 30,
        bevel: 12,
        extrude: 18
      }
    });

    state.objects.push({
      id: nextId('obj'),
      type: 'ellipse',
      layerId: art,
      x: 410,
      y: 240,
      w: 340,
      h: 220,
      rotation: 0,
      style: {
        ...defaultStyle(),
        fill: '#7df2ff',
        fill2: '#1b60ff',
        fillType: 'material',
        material: 'glass',
        stroke: '#dffbff',
        strokeWidth: 2,
        shadowBlur: 24,
        shadowX: 12,
        shadowY: 18,
        glow: 16,
        bevel: 16,
        opacity: 0.86
      }
    });

    state.objects.push({
      id: nextId('obj'),
      type: 'text',
      layerId: details,
      x: 170,
      y: 275,
      text: 'RealDrawer',
      style: {
        ...defaultStyle(),
        fill: '#ffffff',
        fill2: '#9ec4ff',
        fillType: 'linear',
        stroke: '#141823',
        strokeWidth: 2,
        fontSize: 68,
        shadowBlur: 16,
        shadowX: 5,
        shadowY: 8,
        glow: 10,
        bevel: 3
      }
    });

    state.objects.push({
      id: nextId('obj'),
      type: 'path',
      layerId: details,
      points: [
        { x: 155, y: 470 }, { x: 205, y: 520 }, { x: 300, y: 495 },
        { x: 376, y: 560 }, { x: 485, y: 525 }, { x: 595, y: 585 }
      ],
      closed: false,
      seed: 12019,
      style: {
        ...defaultStyle(),
        fillType: 'none',
        stroke: '#212433',
        strokeWidth: 18,
        brush: 'watercolor',
        opacity: 0.78,
        shadowBlur: 0,
        glow: 0,
        bevel: 0
      }
    });
  }

  function serializeDocument() {
    return {
      app: 'RealDrawer Suite',
      version: APP_VERSION,
      document: clone(state.document),
      layers: clone(state.layers),
      objects: state.objects.map(object => {
        const clean = clone(object);
        delete clean.imgEl;
        return clean;
      })
    };
  }

  function loadDocument(data, push = true) {
    if (!data || !Array.isArray(data.objects) || !Array.isArray(data.layers)) {
      setStatus('Invalid document');
      return;
    }
    state.document = data.document || { width: 1600, height: 1000, background: 'transparent' };
    state.layers = data.layers.length ? data.layers : [createLayer('Layer 1')];
    state.objects = data.objects;
    state.activeLayerId = state.layers[0].id;
    state.selectedIds = [];
    state.objects.forEach(reviveObject);
    syncControlsFromDefault();
    renderLayers();
    if (push) pushHistory('Load document');
    requestRender();
    setStatus('Document loaded');
  }

  function reviveObject(object) {
    if (!object.style) object.style = defaultStyle();
    object.style = { ...defaultStyle(), ...object.style };
    if (object.type === 'image' && object.src) loadImage(object.src);
  }

  function pushHistory(label = 'Change') {
    const snapshot = JSON.stringify(serializeDocument());
    if (state.history[state.historyIndex] === snapshot) return;
    state.history = state.history.slice(0, state.historyIndex + 1);
    state.history.push(snapshot);
    if (state.history.length > 80) state.history.shift();
    state.historyIndex = state.history.length - 1;
    setStatus(label);
  }

  function undo() {
    if (state.historyIndex <= 0) return;
    state.historyIndex -= 1;
    restoreHistorySnapshot();
    setStatus('Undo');
  }

  function redo() {
    if (state.historyIndex >= state.history.length - 1) return;
    state.historyIndex += 1;
    restoreHistorySnapshot();
    setStatus('Redo');
  }

  function restoreHistorySnapshot() {
    const data = JSON.parse(state.history[state.historyIndex]);
    state.objects = data.objects;
    state.layers = data.layers;
    state.document = data.document;
    state.selectedIds = [];
    state.objects.forEach(reviveObject);
    if (!state.layers.some(layer => layer.id === state.activeLayerId)) {
      state.activeLayerId = state.layers[0]?.id || '';
    }
    renderLayers();
    updateSelectionInfo();
    requestRender();
  }

  function requestRender() {
    if (renderPending) return;
    renderPending = true;
    requestAnimationFrame(() => {
      renderPending = false;
      render();
    });
  }

  function render() {
    const rect = viewport.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_MAX);
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    drawViewportBackground(ctx, width, height);

    ctx.save();
    ctx.translate(state.camera.x, state.camera.y);
    ctx.scale(state.camera.zoom, state.camera.zoom);
    drawDocumentSurface(ctx);
    drawGrid(ctx, width, height);
    drawSceneObjects(ctx);
    drawSelectionOverlay(ctx);
    ctx.restore();

    zoomText.textContent = `${Math.round(state.camera.zoom * 100)}%`;
  }

  function drawViewportBackground(target, width, height) {
    target.save();
    target.fillStyle = '#0b0f18';
    target.fillRect(0, 0, width, height);
    const size = 24;
    target.globalAlpha = 0.14;
    for (let y = 0; y < height; y += size) {
      for (let x = 0; x < width; x += size) {
        target.fillStyle = ((x / size + y / size) % 2 === 0) ? '#ffffff' : '#000000';
        target.fillRect(x, y, size, size);
      }
    }
    target.restore();
  }

  function drawDocumentSurface(target) {
    target.save();
    target.fillStyle = '#ffffff';
    target.shadowColor = 'rgba(0,0,0,0.45)';
    target.shadowBlur = 40;
    target.shadowOffsetY = 18;
    target.fillRect(0, 0, state.document.width, state.document.height);
    target.restore();
  }

  function drawGrid(target, screenWidth, screenHeight) {
    const zoom = state.camera.zoom;
    if (zoom < 0.35) return;
    const step = zoom > 1.4 ? 25 : 50;
    const left = screenToWorld({ x: 0, y: 0 }).x;
    const top = screenToWorld({ x: 0, y: 0 }).y;
    const right = screenToWorld({ x: screenWidth, y: screenHeight }).x;
    const bottom = screenToWorld({ x: screenWidth, y: screenHeight }).y;
    target.save();
    target.lineWidth = 1 / zoom;
    target.strokeStyle = 'rgba(16, 24, 38, 0.08)';
    target.beginPath();
    for (let x = Math.floor(left / step) * step; x <= right; x += step) {
      target.moveTo(x, top);
      target.lineTo(x, bottom);
    }
    for (let y = Math.floor(top / step) * step; y <= bottom; y += step) {
      target.moveTo(left, y);
      target.lineTo(right, y);
    }
    target.stroke();
    target.restore();
  }

  function drawSceneObjects(target, options = {}) {
    const onlyIds = options.onlyIds ? new Set(options.onlyIds) : null;
    for (const layer of state.layers) {
      if (!layer.visible) continue;
      target.save();
      target.globalAlpha *= layer.opacity;
      for (const object of state.objects) {
        if (object.layerId !== layer.id) continue;
        if (onlyIds && !onlyIds.has(object.id)) continue;
        drawObject(target, object);
      }
      target.restore();
    }
  }

  function drawObject(target, object) {
    const style = { ...defaultStyle(), ...object.style };
    const bounds = objectBounds(object);
    target.save();
    target.globalAlpha *= clamp(style.opacity, 0, 1);
    target.globalCompositeOperation = style.blend || 'source-over';
    if (style.blur > 0) target.filter = `blur(${style.blur}px)`;

    if (style.extrude > 0 && isVectorLike(object)) {
      drawExtrusion(target, object, style, bounds);
    }

    if (style.glow > 0 && isVectorLike(object)) {
      target.save();
      target.shadowColor = style.fill2 || style.stroke;
      target.shadowBlur = style.glow;
      target.shadowOffsetX = 0;
      target.shadowOffsetY = 0;
      target.globalAlpha *= 0.95;
      drawObjectShape(target, object, style, bounds, true, true);
      target.restore();
    }

    if (style.shadowBlur > 0) {
      target.shadowColor = hexToRgba(style.shadowColor || '#000000', 0.45);
      target.shadowBlur = style.shadowBlur;
      target.shadowOffsetX = style.shadowX || 0;
      target.shadowOffsetY = style.shadowY || 0;
    }

    drawObjectShape(target, object, style, bounds, true, true);

    target.shadowColor = 'transparent';
    target.shadowBlur = 0;
    target.shadowOffsetX = 0;
    target.shadowOffsetY = 0;

    if (style.bevel > 0 && isVectorLike(object)) {
      drawBevel(target, object, style, bounds);
    }

    target.restore();
  }

  function isVectorLike(object) {
    return ['rect', 'ellipse', 'line', 'path', 'text'].includes(object.type);
  }

  function drawObjectShape(target, object, style, bounds, doFill, doStroke) {
    switch (object.type) {
      case 'rect':
      case 'ellipse':
      case 'line':
        target.save();
        beginShapePath(target, object);
        if (doFill && object.type !== 'line' && style.fillType !== 'none') {
          target.fillStyle = createFill(target, style, bounds);
          target.fill();
        }
        if (doStroke && style.strokeWidth > 0) {
          target.lineWidth = style.strokeWidth;
          target.lineJoin = 'round';
          target.lineCap = 'round';
          target.strokeStyle = style.stroke;
          target.stroke();
        }
        target.restore();
        break;
      case 'path':
        drawPathBrush(target, object, style);
        break;
      case 'text':
        drawTextObject(target, object, style, doFill, doStroke);
        break;
      case 'image':
        drawImageObject(target, object);
        break;
    }
  }

  function beginShapePath(target, object) {
    target.beginPath();
    if (object.type === 'rect') {
      const b = normalizedRect(object.x, object.y, object.w, object.h);
      const radius = Math.min(object.radius || 0, Math.abs(b.w) / 2, Math.abs(b.h) / 2);
      if (target.roundRect) {
        target.roundRect(b.x, b.y, b.w, b.h, radius);
      } else {
        roundedRect(target, b.x, b.y, b.w, b.h, radius);
      }
    }
    if (object.type === 'ellipse') {
      const b = normalizedRect(object.x, object.y, object.w, object.h);
      target.ellipse(b.x + b.w / 2, b.y + b.h / 2, Math.abs(b.w / 2), Math.abs(b.h / 2), 0, 0, Math.PI * 2);
    }
    if (object.type === 'line') {
      target.moveTo(object.x1, object.y1);
      target.lineTo(object.x2, object.y2);
    }
  }

  function roundedRect(target, x, y, w, h, r) {
    target.moveTo(x + r, y);
    target.lineTo(x + w - r, y);
    target.quadraticCurveTo(x + w, y, x + w, y + r);
    target.lineTo(x + w, y + h - r);
    target.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    target.lineTo(x + r, y + h);
    target.quadraticCurveTo(x, y + h, x, y + h - r);
    target.lineTo(x, y + r);
    target.quadraticCurveTo(x, y, x + r, y);
  }

  function drawPathBrush(target, object, style) {
    const points = object.points || [];
    if (points.length < 2) return;
    const brush = style.brush || 'round';
    target.save();
    target.lineCap = 'round';
    target.lineJoin = 'round';

    if (brush === 'watercolor') {
      const rng = createRng(object.seed || 1);
      for (let pass = 0; pass < 5; pass++) {
        target.globalAlpha *= pass === 0 ? 0.36 : 0.82;
        target.strokeStyle = pass % 2 ? hexToRgba(style.stroke, 0.18) : hexToRgba(style.stroke, 0.24);
        target.lineWidth = style.strokeWidth * (1.15 + pass * 0.18);
        drawSmoothPolyline(target, jitterPoints(points, rng, style.strokeWidth * 0.16));
      }
    } else if (brush === 'pencil') {
      const rng = createRng(object.seed || 2);
      for (let pass = 0; pass < 4; pass++) {
        target.strokeStyle = hexToRgba(style.stroke, 0.35);
        target.lineWidth = Math.max(1, style.strokeWidth * 0.26);
        drawSmoothPolyline(target, jitterPoints(points, rng, style.strokeWidth * 0.18));
      }
    } else if (brush === 'marker') {
      target.globalAlpha *= 0.55;
      target.strokeStyle = style.stroke;
      target.lineWidth = style.strokeWidth * 1.65;
      drawSmoothPolyline(target, points);
      target.globalAlpha *= 0.8;
      target.lineWidth = style.strokeWidth * 0.72;
      drawSmoothPolyline(target, points);
    } else if (brush === 'oil') {
      const rng = createRng(object.seed || 3);
      target.strokeStyle = style.stroke;
      target.lineWidth = style.strokeWidth * 1.12;
      drawSmoothPolyline(target, points);
      for (let pass = 0; pass < 6; pass++) {
        target.strokeStyle = pass % 2 ? hexToRgba(style.fill2, 0.18) : hexToRgba('#ffffff', 0.12);
        target.lineWidth = Math.max(1, style.strokeWidth * 0.12);
        drawSmoothPolyline(target, jitterPoints(points, rng, style.strokeWidth * 0.25));
      }
    } else {
      target.strokeStyle = style.stroke;
      target.lineWidth = style.strokeWidth;
      drawSmoothPolyline(target, points);
    }

    target.restore();
  }

  function drawSmoothPolyline(target, points) {
    if (points.length < 2) return;
    target.beginPath();
    target.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length - 1; i++) {
      const midX = (points[i].x + points[i + 1].x) / 2;
      const midY = (points[i].y + points[i + 1].y) / 2;
      target.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
    }
    const last = points[points.length - 1];
    target.lineTo(last.x, last.y);
    target.stroke();
  }

  function jitterPoints(points, rng, amount) {
    return points.map((point, index) => {
      if (index === 0 || index === points.length - 1) return point;
      return {
        x: point.x + (rng() - 0.5) * amount,
        y: point.y + (rng() - 0.5) * amount
      };
    });
  }

  function drawTextObject(target, object, style, doFill, doStroke) {
    const lines = String(object.text || '').split('\n');
    const fontSize = style.fontSize || 54;
    target.save();
    target.font = `700 ${fontSize}px ${style.fontFamily || 'sans-serif'}`;
    target.textBaseline = 'top';
    target.lineJoin = 'round';
    const lineHeight = fontSize * 1.16;
    for (let i = 0; i < lines.length; i++) {
      const y = object.y + i * lineHeight;
      if (doStroke && style.strokeWidth > 0) {
        target.lineWidth = style.strokeWidth;
        target.strokeStyle = style.stroke;
        target.strokeText(lines[i], object.x, y);
      }
      if (doFill && style.fillType !== 'none') {
        target.fillStyle = createFill(target, style, objectBounds(object));
        target.fillText(lines[i], object.x, y);
      }
    }
    target.restore();
  }

  function drawImageObject(target, object) {
    const image = imageCache.get(object.src);
    if (!image || !image.complete) return;
    const b = normalizedRect(object.x, object.y, object.w, object.h);
    target.drawImage(image, b.x, b.y, b.w, b.h);
  }

  function drawExtrusion(target, object, style, bounds) {
    target.save();
    target.shadowColor = 'transparent';
    target.shadowBlur = 0;
    const steps = Math.max(1, Math.floor(style.extrude / 3));
    for (let i = steps; i >= 1; i--) {
      target.save();
      target.translate(i * 2.2, i * 2.2);
      target.globalAlpha *= 0.18 + (i / steps) * 0.28;
      const extrudeStyle = {
        ...style,
        fillType: 'solid',
        fill: shadeColor(style.fill, -34),
        stroke: shadeColor(style.stroke, -40),
        shadowBlur: 0,
        glow: 0,
        bevel: 0
      };
      drawObjectShape(target, object, extrudeStyle, bounds, true, false);
      target.restore();
    }
    target.restore();
  }

  function drawBevel(target, object, style, bounds) {
    target.save();
    const width = Math.max(1, style.bevel);
    target.lineJoin = 'round';
    target.lineCap = 'round';
    if (object.type === 'text') return;
    if (object.type === 'path') return;

    beginShapePath(target, object);
    target.lineWidth = width;
    target.strokeStyle = 'rgba(255,255,255,0.38)';
    target.setLineDash([]);
    target.save();
    target.translate(-width * 0.15, -width * 0.15);
    target.stroke();
    target.restore();

    beginShapePath(target, object);
    target.lineWidth = width;
    target.strokeStyle = 'rgba(0,0,0,0.28)';
    target.save();
    target.translate(width * 0.2, width * 0.2);
    target.stroke();
    target.restore();
    target.restore();
  }

  function createFill(target, style, bounds) {
    const b = bounds || { x: 0, y: 0, w: 1, h: 1 };
    if (style.fillType === 'none') return 'transparent';
    if (style.fillType === 'linear') {
      const gradient = target.createLinearGradient(b.x, b.y, b.x + b.w, b.y + b.h);
      gradient.addColorStop(0, style.fill);
      gradient.addColorStop(1, style.fill2 || style.fill);
      return gradient;
    }
    if (style.fillType === 'radial') {
      const cx = b.x + b.w * 0.4;
      const cy = b.y + b.h * 0.36;
      const gradient = target.createRadialGradient(cx, cy, 1, b.x + b.w / 2, b.y + b.h / 2, Math.max(Math.abs(b.w), Math.abs(b.h)) * 0.62);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.2, style.fill);
      gradient.addColorStop(1, style.fill2 || shadeColor(style.fill, -25));
      return gradient;
    }
    if (style.fillType === 'material') {
      return createMaterialFill(target, style, b);
    }
    return style.fill || '#ffffff';
  }

  function createMaterialFill(target, style, b) {
    const material = style.material || 'plastic';
    const gradient = target.createLinearGradient(b.x, b.y, b.x + b.w, b.y + b.h);
    if (material === 'chrome') {
      gradient.addColorStop(0, '#0d1118');
      gradient.addColorStop(0.15, '#f8fbff');
      gradient.addColorStop(0.34, '#5b6473');
      gradient.addColorStop(0.52, '#ffffff');
      gradient.addColorStop(0.74, '#2e3644');
      gradient.addColorStop(1, '#c7ced8');
      return gradient;
    }
    if (material === 'glass') {
      gradient.addColorStop(0, hexToRgba('#ffffff', 0.94));
      gradient.addColorStop(0.25, hexToRgba(style.fill, 0.72));
      gradient.addColorStop(0.55, hexToRgba(style.fill2, 0.42));
      gradient.addColorStop(1, hexToRgba('#ffffff', 0.24));
      return gradient;
    }
    if (material === 'wood') {
      gradient.addColorStop(0, '#4d2b14');
      gradient.addColorStop(0.22, '#9b5a2e');
      gradient.addColorStop(0.37, '#6e3c1e');
      gradient.addColorStop(0.66, '#c17b3b');
      gradient.addColorStop(1, '#3f2411');
      return gradient;
    }
    if (material === 'paper') {
      gradient.addColorStop(0, '#fff8e8');
      gradient.addColorStop(0.5, style.fill);
      gradient.addColorStop(1, '#e4d3af');
      return gradient;
    }
    if (material === 'neon') {
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.2, style.fill);
      gradient.addColorStop(0.6, style.fill2);
      gradient.addColorStop(1, '#090a12');
      return gradient;
    }
    gradient.addColorStop(0, shadeColor(style.fill, 36));
    gradient.addColorStop(0.42, style.fill);
    gradient.addColorStop(1, shadeColor(style.fill2 || style.fill, -28));
    return gradient;
  }

  function drawSelectionOverlay(target) {
    const selected = selectedObjects();
    if (!selected.length) return;
    target.save();
    const zoom = state.camera.zoom;
    target.lineWidth = 1 / zoom;
    target.strokeStyle = '#3b82f6';
    target.fillStyle = '#ffffff';
    for (const object of selected) {
      const b = objectBounds(object);
      target.setLineDash([6 / zoom, 4 / zoom]);
      target.strokeRect(b.x, b.y, b.w, b.h);
    }
    const total = selectionBounds();
    if (total) {
      target.setLineDash([]);
      target.strokeStyle = '#93c5fd';
      target.strokeRect(total.x, total.y, total.w, total.h);
      if (selected.length === 1) {
        for (const handle of handlesForBounds(total)) {
          const size = HANDLE_SIZE / zoom;
          target.fillStyle = '#ffffff';
          target.strokeStyle = '#1d4ed8';
          target.lineWidth = 1.2 / zoom;
          target.fillRect(handle.x - size / 2, handle.y - size / 2, size, size);
          target.strokeRect(handle.x - size / 2, handle.y - size / 2, size, size);
        }
      }
    }
    target.restore();
  }

  function objectBounds(object) {
    if (!object) return null;
    if (object.type === 'rect' || object.type === 'ellipse' || object.type === 'image') {
      return normalizedRect(object.x, object.y, object.w, object.h);
    }
    if (object.type === 'line') {
      const pad = (object.style?.strokeWidth || 1) / 2 + 3;
      const x = Math.min(object.x1, object.x2) - pad;
      const y = Math.min(object.y1, object.y2) - pad;
      return {
        x,
        y,
        w: Math.abs(object.x2 - object.x1) + pad * 2,
        h: Math.abs(object.y2 - object.y1) + pad * 2
      };
    }
    if (object.type === 'path') {
      const points = object.points || [];
      if (!points.length) return { x: 0, y: 0, w: 0, h: 0 };
      const pad = (object.style?.strokeWidth || 1) + 4;
      const xs = points.map(point => point.x);
      const ys = points.map(point => point.y);
      const minX = Math.min(...xs) - pad;
      const maxX = Math.max(...xs) + pad;
      const minY = Math.min(...ys) - pad;
      const maxY = Math.max(...ys) + pad;
      return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
    }
    if (object.type === 'text') {
      const style = { ...defaultStyle(), ...object.style };
      const lines = String(object.text || '').split('\n');
      const longest = lines.reduce((max, line) => Math.max(max, line.length), 1);
      const width = Math.max(10, longest * style.fontSize * 0.62);
      const height = Math.max(style.fontSize, lines.length * style.fontSize * 1.16);
      return { x: object.x, y: object.y, w: width, h: height };
    }
    return { x: 0, y: 0, w: 0, h: 0 };
  }

  function normalizedRect(x, y, w, h) {
    return {
      x: w < 0 ? x + w : x,
      y: h < 0 ? y + h : y,
      w: Math.abs(w),
      h: Math.abs(h)
    };
  }

  function selectionBounds() {
    const objects = selectedObjects();
    if (!objects.length) return null;
    const bounds = objects.map(objectBounds);
    const minX = Math.min(...bounds.map(b => b.x));
    const minY = Math.min(...bounds.map(b => b.y));
    const maxX = Math.max(...bounds.map(b => b.x + b.w));
    const maxY = Math.max(...bounds.map(b => b.y + b.h));
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  }

  function handlesForBounds(b) {
    return [
      { name: 'nw', x: b.x, y: b.y },
      { name: 'n', x: b.x + b.w / 2, y: b.y },
      { name: 'ne', x: b.x + b.w, y: b.y },
      { name: 'e', x: b.x + b.w, y: b.y + b.h / 2 },
      { name: 'se', x: b.x + b.w, y: b.y + b.h },
      { name: 's', x: b.x + b.w / 2, y: b.y + b.h },
      { name: 'sw', x: b.x, y: b.y + b.h },
      { name: 'w', x: b.x, y: b.y + b.h / 2 }
    ];
  }

  function selectedObjects() {
    const ids = new Set(state.selectedIds);
    return state.objects.filter(object => ids.has(object.id));
  }

  function getObject(id) {
    return state.objects.find(object => object.id === id);
  }

  function getLayer(id) {
    return state.layers.find(layer => layer.id === id);
  }

  function activeLayer() {
    return getLayer(state.activeLayerId) || state.layers[0];
  }

  function layerIsEditable(id) {
    const layer = getLayer(id);
    return !!layer && layer.visible && !layer.locked;
  }

  function screenToWorld(point) {
    return {
      x: (point.x - state.camera.x) / state.camera.zoom,
      y: (point.y - state.camera.y) / state.camera.zoom
    };
  }

  function clientToCanvas(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function pointerWorld(event) {
    return screenToWorld(clientToCanvas(event));
  }

  function hitTest(point) {
    for (let layerIndex = state.layers.length - 1; layerIndex >= 0; layerIndex--) {
      const layer = state.layers[layerIndex];
      if (!layer.visible || layer.locked) continue;
      for (let i = state.objects.length - 1; i >= 0; i--) {
        const object = state.objects[i];
        if (object.layerId !== layer.id) continue;
        if (pointHitsObject(point, object)) return object;
      }
    }
    return null;
  }

  function pointHitsObject(point, object) {
    const b = objectBounds(object);
    const tolerance = 6 / state.camera.zoom;
    if (!rectContains({ x: b.x - tolerance, y: b.y - tolerance, w: b.w + tolerance * 2, h: b.h + tolerance * 2 }, point)) return false;
    if (object.type === 'ellipse') {
      const cx = b.x + b.w / 2;
      const cy = b.y + b.h / 2;
      const rx = Math.max(1, b.w / 2 + tolerance);
      const ry = Math.max(1, b.h / 2 + tolerance);
      return ((point.x - cx) ** 2) / (rx ** 2) + ((point.y - cy) ** 2) / (ry ** 2) <= 1;
    }
    if (object.type === 'line') {
      return distanceToSegment(point, { x: object.x1, y: object.y1 }, { x: object.x2, y: object.y2 }) <= Math.max(tolerance, (object.style?.strokeWidth || 1) / 2 + 4);
    }
    if (object.type === 'path') {
      const points = object.points || [];
      for (let i = 1; i < points.length; i++) {
        if (distanceToSegment(point, points[i - 1], points[i]) <= Math.max(tolerance, (object.style?.strokeWidth || 1) / 2 + 5)) return true;
      }
      return false;
    }
    return true;
  }

  function hitHandle(point) {
    if (state.selectedIds.length !== 1) return null;
    const b = selectionBounds();
    if (!b) return null;
    const size = HANDLE_SIZE / state.camera.zoom;
    for (const handle of handlesForBounds(b)) {
      if (Math.abs(point.x - handle.x) <= size && Math.abs(point.y - handle.y) <= size) return handle.name;
    }
    return null;
  }

  function rectContains(rect, point) {
    return point.x >= rect.x && point.x <= rect.x + rect.w && point.y >= rect.y && point.y <= rect.y + rect.h;
  }

  function rectIntersects(a, b) {
    return !(a.x + a.w < b.x || b.x + b.w < a.x || a.y + a.h < b.y || b.y + b.h < a.y);
  }

  function distanceToSegment(point, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    if (dx === 0 && dy === 0) return Math.hypot(point.x - a.x, point.y - a.y);
    const t = clamp(((point.x - a.x) * dx + (point.y - a.y) * dy) / (dx * dx + dy * dy), 0, 1);
    const x = a.x + t * dx;
    const y = a.y + t * dy;
    return Math.hypot(point.x - x, point.y - y);
  }

  function onPointerDown(event) {
    viewport.focus();
    const screen = clientToCanvas(event);
    const world = screenToWorld(screen);
    const tool = spaceDown || event.button === 1 ? 'pan' : state.tool;
    canvas.setPointerCapture(event.pointerId);

    if (tool === 'pan') {
      state.pointer = { mode: 'pan', startScreen: screen, cameraStart: clone(state.camera) };
      return;
    }

    if (tool === 'select') {
      const handle = hitHandle(world);
      if (handle) {
        state.pointer = {
          mode: 'resize',
          startWorld: world,
          handle,
          selectionStart: selectionBounds(),
          originals: selectedObjects().map(clone)
        };
        return;
      }

      const hit = hitTest(world);
      if (hit) {
        if (event.shiftKey) {
          if (state.selectedIds.includes(hit.id)) {
            state.selectedIds = state.selectedIds.filter(id => id !== hit.id);
          } else {
            state.selectedIds.push(hit.id);
          }
        } else if (!state.selectedIds.includes(hit.id)) {
          state.selectedIds = [hit.id];
        }
        syncControlsFromSelection();
        updateSelectionInfo();
        state.pointer = {
          mode: 'move',
          startWorld: world,
          originals: selectedObjects().map(clone)
        };
        requestRender();
        return;
      }

      state.selectedIds = [];
      updateSelectionInfo();
      syncControlsFromDefault();
      state.pointer = { mode: 'marquee', startScreen: screen, currentScreen: screen, startWorld: world, currentWorld: world };
      updateMarquee(screen, screen);
      requestRender();
      return;
    }

    if (tool === 'eraser') {
      eraseAt(world);
      state.pointer = { mode: 'eraser' };
      return;
    }

    if (['rect', 'ellipse', 'line'].includes(tool)) {
      if (!layerIsEditable(state.activeLayerId)) return setStatus('Active layer is locked or hidden');
      const object = createDraftShape(tool, world);
      state.objects.push(object);
      state.selectedIds = [object.id];
      state.pointer = { mode: 'drawShape', objectId: object.id, startWorld: world };
      updateSelectionInfo();
      requestRender();
      return;
    }

    if (['brush', 'pencil', 'marker', 'watercolor', 'oil'].includes(tool)) {
      if (!layerIsEditable(state.activeLayerId)) return setStatus('Active layer is locked or hidden');
      const object = createPathObject(world, tool);
      state.objects.push(object);
      state.selectedIds = [object.id];
      state.pointer = { mode: 'drawPath', objectId: object.id, lastWorld: world };
      updateSelectionInfo();
      requestRender();
      return;
    }

    if (tool === 'text') {
      if (!layerIsEditable(state.activeLayerId)) return setStatus('Active layer is locked or hidden');
      startTextEditor(event, world);
      return;
    }

    if (tool === 'image') {
      if (!layerIsEditable(state.activeLayerId)) return setStatus('Active layer is locked or hidden');
      pendingImagePoint = world;
      imageInput.click();
    }
  }

  function onPointerMove(event) {
    if (!state.pointer) return;
    const screen = clientToCanvas(event);
    const world = screenToWorld(screen);
    const pointer = state.pointer;

    if (pointer.mode === 'pan') {
      state.camera.x = pointer.cameraStart.x + (screen.x - pointer.startScreen.x);
      state.camera.y = pointer.cameraStart.y + (screen.y - pointer.startScreen.y);
      requestRender();
      return;
    }

    if (pointer.mode === 'move') {
      const dx = world.x - pointer.startWorld.x;
      const dy = world.y - pointer.startWorld.y;
      for (const original of pointer.originals) {
        const object = getObject(original.id);
        if (object) applyTranslation(object, original, dx, dy);
      }
      requestRender();
      return;
    }

    if (pointer.mode === 'resize') {
      resizeSelection(pointer, world);
      requestRender();
      return;
    }

    if (pointer.mode === 'drawShape') {
      const object = getObject(pointer.objectId);
      if (!object) return;
      if (object.type === 'line') {
        object.x2 = world.x;
        object.y2 = world.y;
      } else {
        object.w = world.x - pointer.startWorld.x;
        object.h = world.y - pointer.startWorld.y;
      }
      requestRender();
      return;
    }

    if (pointer.mode === 'drawPath') {
      const object = getObject(pointer.objectId);
      if (!object) return;
      if (Math.hypot(world.x - pointer.lastWorld.x, world.y - pointer.lastWorld.y) > 2 / state.camera.zoom) {
        object.points.push(world);
        pointer.lastWorld = world;
        requestRender();
      }
      return;
    }

    if (pointer.mode === 'eraser') {
      eraseAt(world, false);
      return;
    }

    if (pointer.mode === 'marquee') {
      pointer.currentScreen = screen;
      pointer.currentWorld = world;
      updateMarquee(pointer.startScreen, pointer.currentScreen);
      selectWithinMarquee(pointer.startWorld, pointer.currentWorld);
      requestRender();
    }
  }

  function onPointerUp(event) {
    if (!state.pointer) return;
    const pointer = state.pointer;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);

    if (pointer.mode === 'drawShape') {
      const object = getObject(pointer.objectId);
      if (object && object.type !== 'line') normalizeObjectRect(object);
      if (object && objectTooSmall(object)) removeObject(object.id);
      else pushHistory('Draw object');
    }

    if (pointer.mode === 'drawPath') {
      const object = getObject(pointer.objectId);
      if (object && (object.points || []).length < 2) removeObject(object.id);
      else pushHistory('Draw stroke');
    }

    if (pointer.mode === 'move' || pointer.mode === 'resize') pushHistory(pointer.mode === 'move' ? 'Move selection' : 'Resize selection');
    if (pointer.mode === 'eraser') pushHistory('Erase');
    if (pointer.mode === 'marquee') marqueeEl.classList.add('hidden');

    state.pointer = null;
    updateSelectionInfo();
    requestRender();
  }

  function createDraftShape(type, point) {
    const base = {
      id: nextId('obj'),
      type,
      layerId: state.activeLayerId,
      style: { ...clone(state.defaultStyle) }
    };
    if (type === 'line') {
      return { ...base, x1: point.x, y1: point.y, x2: point.x, y2: point.y };
    }
    return { ...base, x: point.x, y: point.y, w: 1, h: 1, radius: type === 'rect' ? 8 : 0 };
  }

  function createPathObject(point, tool) {
    const style = { ...clone(state.defaultStyle) };
    style.fillType = 'none';
    style.brush = tool === 'brush' ? 'round' : tool;
    if (tool === 'pencil') style.strokeWidth = Math.max(1, style.strokeWidth * 0.8);
    if (tool === 'marker') style.strokeWidth = Math.max(8, style.strokeWidth * 2.4);
    if (tool === 'watercolor') style.strokeWidth = Math.max(14, style.strokeWidth * 3.2);
    if (tool === 'oil') style.strokeWidth = Math.max(12, style.strokeWidth * 2.6);
    return {
      id: nextId('obj'),
      type: 'path',
      layerId: state.activeLayerId,
      points: [point],
      closed: false,
      seed: Math.floor(Math.random() * 1000000),
      style
    };
  }

  function normalizeObjectRect(object) {
    const b = normalizedRect(object.x, object.y, object.w, object.h);
    object.x = b.x;
    object.y = b.y;
    object.w = b.w;
    object.h = b.h;
  }

  function objectTooSmall(object) {
    const b = objectBounds(object);
    return b.w < 3 && b.h < 3;
  }

  function applyTranslation(object, original, dx, dy) {
    if (['rect', 'ellipse', 'image', 'text'].includes(object.type)) {
      object.x = original.x + dx;
      object.y = original.y + dy;
    } else if (object.type === 'line') {
      object.x1 = original.x1 + dx;
      object.y1 = original.y1 + dy;
      object.x2 = original.x2 + dx;
      object.y2 = original.y2 + dy;
    } else if (object.type === 'path') {
      object.points = original.points.map(point => ({ x: point.x + dx, y: point.y + dy }));
    }
  }

  function resizeSelection(pointer, world) {
    const start = pointer.selectionStart;
    if (!start || !start.w || !start.h) return;
    let x1 = start.x;
    let y1 = start.y;
    let x2 = start.x + start.w;
    let y2 = start.y + start.h;
    const dx = world.x - pointer.startWorld.x;
    const dy = world.y - pointer.startWorld.y;

    if (pointer.handle.includes('w')) x1 += dx;
    if (pointer.handle.includes('e')) x2 += dx;
    if (pointer.handle.includes('n')) y1 += dy;
    if (pointer.handle.includes('s')) y2 += dy;
    if (pointer.handle === 'n' || pointer.handle === 's') {
      x1 = start.x;
      x2 = start.x + start.w;
    }
    if (pointer.handle === 'e' || pointer.handle === 'w') {
      y1 = start.y;
      y2 = start.y + start.h;
    }

    if (Math.abs(x2 - x1) < 4) x2 = x1 + 4;
    if (Math.abs(y2 - y1) < 4) y2 = y1 + 4;
    const sx = (x2 - x1) / start.w;
    const sy = (y2 - y1) / start.h;
    const newOrigin = { x: x1, y: y1 };

    for (const original of pointer.originals) {
      const object = getObject(original.id);
      if (!object) continue;
      transformObjectFromBounds(object, original, start, newOrigin, sx, sy);
    }
  }

  function transformPointFromBounds(point, start, newOrigin, sx, sy) {
    return {
      x: newOrigin.x + (point.x - start.x) * sx,
      y: newOrigin.y + (point.y - start.y) * sy
    };
  }

  function transformObjectFromBounds(object, original, start, newOrigin, sx, sy) {
    if (['rect', 'ellipse', 'image'].includes(object.type)) {
      const p1 = transformPointFromBounds({ x: original.x, y: original.y }, start, newOrigin, sx, sy);
      object.x = p1.x;
      object.y = p1.y;
      object.w = original.w * sx;
      object.h = original.h * sy;
      normalizeObjectRect(object);
    } else if (object.type === 'text') {
      const p = transformPointFromBounds({ x: original.x, y: original.y }, start, newOrigin, sx, sy);
      object.x = p.x;
      object.y = p.y;
      object.style.fontSize = Math.max(6, original.style.fontSize * Math.max(Math.abs(sx), Math.abs(sy)));
    } else if (object.type === 'line') {
      const p1 = transformPointFromBounds({ x: original.x1, y: original.y1 }, start, newOrigin, sx, sy);
      const p2 = transformPointFromBounds({ x: original.x2, y: original.y2 }, start, newOrigin, sx, sy);
      object.x1 = p1.x;
      object.y1 = p1.y;
      object.x2 = p2.x;
      object.y2 = p2.y;
    } else if (object.type === 'path') {
      object.points = original.points.map(point => transformPointFromBounds(point, start, newOrigin, sx, sy));
      object.style.strokeWidth = Math.max(1, original.style.strokeWidth * Math.max(Math.abs(sx), Math.abs(sy)));
    }
  }

  function updateMarquee(start, current) {
    const x = Math.min(start.x, current.x);
    const y = Math.min(start.y, current.y);
    const w = Math.abs(current.x - start.x);
    const h = Math.abs(current.y - start.y);
    Object.assign(marqueeEl.style, { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` });
    marqueeEl.classList.remove('hidden');
  }

  function selectWithinMarquee(a, b) {
    const rect = normalizedRect(a.x, a.y, b.x - a.x, b.y - a.y);
    state.selectedIds = state.objects
      .filter(object => layerIsEditable(object.layerId) && rectIntersects(rect, objectBounds(object)))
      .map(object => object.id);
    updateSelectionInfo();
  }

  function eraseAt(point, commit = true) {
    const hit = hitTest(point);
    if (!hit) return;
    removeObject(hit.id);
    state.selectedIds = state.selectedIds.filter(id => id !== hit.id);
    updateSelectionInfo();
    requestRender();
    if (commit) pushHistory('Erase');
  }

  function removeObject(id) {
    state.objects = state.objects.filter(object => object.id !== id);
  }

  function startTextEditor(event, world) {
    const editor = document.createElement('textarea');
    editor.className = 'text-input-float';
    editor.placeholder = 'Type text';
    const rect = viewport.getBoundingClientRect();
    editor.style.left = `${event.clientX - rect.left}px`;
    editor.style.top = `${event.clientY - rect.top}px`;
    editor.style.fontSize = `${Math.max(16, state.defaultStyle.fontSize * state.camera.zoom)}px`;
    viewport.appendChild(editor);
    editor.focus();

    const commit = () => {
      const text = editor.value.trim();
      editor.remove();
      if (!text) return;
      const object = {
        id: nextId('obj'),
        type: 'text',
        layerId: state.activeLayerId,
        x: world.x,
        y: world.y,
        text,
        style: { ...clone(state.defaultStyle) }
      };
      state.objects.push(object);
      state.selectedIds = [object.id];
      syncControlsFromSelection();
      updateSelectionInfo();
      pushHistory('Add text');
      requestRender();
    };

    editor.addEventListener('keydown', e => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) editor.blur();
      if (e.key === 'Escape') {
        editor.value = '';
        editor.blur();
      }
    });
    editor.addEventListener('blur', commit, { once: true });
  }

  function syncControlsFromDefault() {
    writeStyleToControls(state.defaultStyle);
  }

  function syncControlsFromSelection() {
    const object = selectedObjects()[0];
    if (!object) return syncControlsFromDefault();
    writeStyleToControls({ ...defaultStyle(), ...object.style });
  }

  function writeStyleToControls(style) {
    controls.fillColor.value = style.fill || '#ffffff';
    controls.fillColor2.value = style.fill2 || '#000000';
    controls.strokeColor.value = style.stroke || '#000000';
    controls.shadowColor.value = style.shadowColor || '#000000';
    controls.fillType.value = style.fillType || 'solid';
    controls.material.value = style.material || 'plastic';
    controls.strokeWidth.value = style.strokeWidth ?? 0;
    controls.opacity.value = Math.round((style.opacity ?? 1) * 100);
    controls.shadowBlur.value = style.shadowBlur ?? 0;
    controls.shadowX.value = style.shadowX ?? 0;
    controls.shadowY.value = style.shadowY ?? 0;
    controls.glow.value = style.glow ?? 0;
    controls.blur.value = style.blur ?? 0;
    controls.bevel.value = style.bevel ?? 0;
    controls.extrude.value = style.extrude ?? 0;
    controls.blendMode.value = style.blend || 'source-over';
    controls.fontSize.value = style.fontSize || 54;
  }

  function readStyleFromControls() {
    return {
      fill: controls.fillColor.value,
      fill2: controls.fillColor2.value,
      stroke: controls.strokeColor.value,
      strokeWidth: Number(controls.strokeWidth.value),
      fillType: controls.fillType.value,
      material: controls.material.value,
      opacity: Number(controls.opacity.value) / 100,
      blend: controls.blendMode.value,
      shadowColor: controls.shadowColor.value,
      shadowBlur: Number(controls.shadowBlur.value),
      shadowX: Number(controls.shadowX.value),
      shadowY: Number(controls.shadowY.value),
      glow: Number(controls.glow.value),
      blur: Number(controls.blur.value),
      bevel: Number(controls.bevel.value),
      extrude: Number(controls.extrude.value),
      fontSize: Number(controls.fontSize.value),
      fontFamily: state.defaultStyle.fontFamily,
      brush: state.defaultStyle.brush
    };
  }

  function applyControlStyle(live = true) {
    const style = readStyleFromControls();
    state.defaultStyle = { ...state.defaultStyle, ...style };
    const selected = selectedObjects();
    for (const object of selected) {
      const existingBrush = object.style.brush;
      object.style = { ...object.style, ...style };
      if (object.type === 'path') object.style.brush = existingBrush || object.style.brush;
    }
    requestRender();
    if (selected.length && live) scheduleStyleHistory();
  }

  function scheduleStyleHistory() {
    clearTimeout(styleHistoryTimer);
    styleHistoryTimer = setTimeout(() => pushHistory('Change style'), 320);
  }

  function updateSelectionInfo() {
    const selected = selectedObjects();
    if (!selected.length) {
      selectionInfo.textContent = 'No selection';
      return;
    }
    const b = selectionBounds();
    selectionInfo.textContent = `${selected.length} selected - ${Math.round(b.w)} x ${Math.round(b.h)} at ${Math.round(b.x)}, ${Math.round(b.y)}`;
  }

  function renderLayers() {
    layersList.innerHTML = '';
    for (const layer of state.layers) {
      const item = document.createElement('div');
      item.className = `layer-item${layer.id === state.activeLayerId ? ' active' : ''}`;
      item.dataset.layerId = layer.id;

      const visible = document.createElement('button');
      visible.textContent = layer.visible ? 'Eye' : '-';
      visible.title = 'Toggle visibility';
      visible.addEventListener('click', event => {
        event.stopPropagation();
        layer.visible = !layer.visible;
        renderLayers();
        pushHistory('Toggle layer visibility');
        requestRender();
      });

      const locked = document.createElement('button');
      locked.textContent = layer.locked ? 'Lock' : 'Ok';
      locked.title = 'Toggle lock';
      locked.addEventListener('click', event => {
        event.stopPropagation();
        layer.locked = !layer.locked;
        renderLayers();
        pushHistory('Toggle layer lock');
      });

      const name = document.createElement('div');
      name.className = 'layer-name';
      name.textContent = layer.name;
      name.title = 'Double-click to rename';
      name.addEventListener('dblclick', event => {
        event.stopPropagation();
        const next = prompt('Layer name', layer.name);
        if (next && next.trim()) {
          layer.name = next.trim();
          renderLayers();
          pushHistory('Rename layer');
        }
      });

      const opacity = document.createElement('input');
      opacity.className = 'layer-opacity';
      opacity.type = 'range';
      opacity.min = '0';
      opacity.max = '100';
      opacity.value = Math.round(layer.opacity * 100);
      opacity.title = 'Layer opacity';
      opacity.addEventListener('input', event => {
        layer.opacity = Number(event.target.value) / 100;
        requestRender();
      });
      opacity.addEventListener('change', () => pushHistory('Layer opacity'));

      item.append(visible, locked, name, opacity);
      item.addEventListener('click', () => {
        state.activeLayerId = layer.id;
        renderLayers();
        setStatus(`Active layer: ${layer.name}`);
      });
      layersList.appendChild(item);
    }
  }

  function setTool(tool) {
    state.tool = tool;
    $$('.tool').forEach(button => button.classList.toggle('active', button.dataset.tool === tool));
    canvas.style.cursor = tool === 'pan' ? 'grab' : tool === 'select' ? 'default' : 'crosshair';
    setStatus(`Tool: ${tool}`);
  }

  function runAction(action, button) {
    switch (action) {
      case 'new':
        if (confirm('Create a new document? Unsaved changes will be lost.')) initializeDocument(true);
        break;
      case 'openProject':
        projectInput.click();
        break;
      case 'saveProject':
        downloadText('realdrawer-project.json', JSON.stringify(serializeDocument(), null, 2), 'application/json');
        break;
      case 'saveLocal':
        localStorage.setItem(LOCAL_KEY, JSON.stringify(serializeDocument()));
        setStatus('Saved to local storage');
        break;
      case 'loadLocal': {
        const stored = localStorage.getItem(LOCAL_KEY);
        if (!stored) return setStatus('No local document found');
        loadDocument(JSON.parse(stored));
        break;
      }
      case 'exportPng':
        exportPng();
        break;
      case 'exportSvg':
        exportSvg();
        break;
      case 'duplicate':
        duplicateSelection();
        break;
      case 'deleteSelection':
        deleteSelection();
        break;
      case 'bringForward':
        reorderSelection(1);
        break;
      case 'sendBackward':
        reorderSelection(-1);
        break;
      case 'smoothPath':
        smoothSelectedPaths();
        break;
      case 'flattenSelection':
        flattenSelection();
        break;
      case 'addLayer':
        addLayer();
        break;
      case 'duplicateLayer':
        duplicateLayer();
        break;
      case 'deleteLayer':
        deleteLayer();
        break;
      case 'layerUp':
        moveLayer(1);
        break;
      case 'layerDown':
        moveLayer(-1);
        break;
      case 'applyPreset':
        applyPreset(button.dataset.preset);
        break;
    }
  }

  function duplicateSelection() {
    const selected = selectedObjects();
    if (!selected.length) return;
    const copies = selected.map(object => {
      const copy = clone(object);
      copy.id = nextId('obj');
      offsetObject(copy, 28, 28);
      if (copy.type === 'image' && copy.src) loadImage(copy.src);
      return copy;
    });
    state.objects.push(...copies);
    state.selectedIds = copies.map(object => object.id);
    updateSelectionInfo();
    pushHistory('Duplicate selection');
    requestRender();
  }

  function deleteSelection() {
    if (!state.selectedIds.length) return;
    const ids = new Set(state.selectedIds);
    state.objects = state.objects.filter(object => !ids.has(object.id));
    state.selectedIds = [];
    updateSelectionInfo();
    pushHistory('Delete selection');
    requestRender();
  }

  function offsetObject(object, dx, dy) {
    if (['rect', 'ellipse', 'image', 'text'].includes(object.type)) {
      object.x += dx;
      object.y += dy;
    } else if (object.type === 'line') {
      object.x1 += dx;
      object.y1 += dy;
      object.x2 += dx;
      object.y2 += dy;
    } else if (object.type === 'path') {
      object.points = object.points.map(point => ({ x: point.x + dx, y: point.y + dy }));
    }
  }

  function reorderSelection(direction) {
    if (!state.selectedIds.length) return;
    const ids = new Set(state.selectedIds);
    const ordered = direction > 0 ? [...state.objects.keys()].reverse() : [...state.objects.keys()];
    for (const i of ordered) {
      const j = i + direction;
      if (j < 0 || j >= state.objects.length) continue;
      const a = state.objects[i];
      const b = state.objects[j];
      if (!ids.has(a.id) || ids.has(b.id) || a.layerId !== b.layerId) continue;
      state.objects[i] = b;
      state.objects[j] = a;
    }
    pushHistory(direction > 0 ? 'Bring forward' : 'Send backward');
    requestRender();
  }

  function smoothSelectedPaths() {
    let changed = false;
    for (const object of selectedObjects()) {
      if (object.type !== 'path' || object.points.length < 3) continue;
      object.points = chaikin(object.points);
      changed = true;
    }
    if (changed) {
      pushHistory('Smooth path');
      requestRender();
    }
  }

  function chaikin(points) {
    const result = [points[0]];
    for (let i = 0; i < points.length - 1; i++) {
      const p = points[i];
      const q = points[i + 1];
      result.push({ x: p.x * 0.75 + q.x * 0.25, y: p.y * 0.75 + q.y * 0.25 });
      result.push({ x: p.x * 0.25 + q.x * 0.75, y: p.y * 0.25 + q.y * 0.75 });
    }
    result.push(points[points.length - 1]);
    return result;
  }

  function flattenSelection() {
    const selected = selectedObjects();
    if (!selected.length) return;
    const bounds = selectionBounds();
    if (!bounds || bounds.w < 1 || bounds.h < 1) return;
    const padding = 80;
    const scale = Math.min(2, 4096 / Math.max(bounds.w + padding * 2, bounds.h + padding * 2));
    const offscreen = document.createElement('canvas');
    offscreen.width = Math.ceil((bounds.w + padding * 2) * scale);
    offscreen.height = Math.ceil((bounds.h + padding * 2) * scale);
    const off = offscreen.getContext('2d');
    off.setTransform(scale, 0, 0, scale, 0, 0);
    off.translate(-bounds.x + padding, -bounds.y + padding);
    drawSceneObjects(off, { onlyIds: state.selectedIds });
    const src = offscreen.toDataURL('image/png');
    const ids = new Set(state.selectedIds);
    state.objects = state.objects.filter(object => !ids.has(object.id));
    const imageObject = {
      id: nextId('obj'),
      type: 'image',
      layerId: state.activeLayerId,
      x: bounds.x - padding,
      y: bounds.y - padding,
      w: bounds.w + padding * 2,
      h: bounds.h + padding * 2,
      src,
      style: { ...defaultStyle(), shadowBlur: 0, bevel: 0, fillType: 'none' }
    };
    state.objects.push(imageObject);
    loadImage(src);
    state.selectedIds = [imageObject.id];
    updateSelectionInfo();
    pushHistory('Flatten selection');
    requestRender();
  }

  function addLayer() {
    const layer = createLayer(`Layer ${state.layers.length + 1}`);
    state.layers.push(layer);
    state.activeLayerId = layer.id;
    renderLayers();
    pushHistory('Add layer');
  }

  function duplicateLayer() {
    const layer = activeLayer();
    if (!layer) return;
    const copy = { ...clone(layer), id: nextId('layer'), name: `${layer.name} copy` };
    const index = state.layers.findIndex(item => item.id === layer.id);
    state.layers.splice(index + 1, 0, copy);
    const clones = state.objects
      .filter(object => object.layerId === layer.id)
      .map(object => ({ ...clone(object), id: nextId('obj'), layerId: copy.id }));
    clones.forEach(reviveObject);
    state.objects.push(...clones);
    state.activeLayerId = copy.id;
    renderLayers();
    pushHistory('Duplicate layer');
    requestRender();
  }

  function deleteLayer() {
    if (state.layers.length <= 1) return setStatus('Cannot delete the last layer');
    const layer = activeLayer();
    if (!layer) return;
    state.layers = state.layers.filter(item => item.id !== layer.id);
    state.objects = state.objects.filter(object => object.layerId !== layer.id);
    state.activeLayerId = state.layers[Math.max(0, state.layers.length - 1)].id;
    state.selectedIds = [];
    renderLayers();
    updateSelectionInfo();
    pushHistory('Delete layer');
    requestRender();
  }

  function moveLayer(direction) {
    const index = state.layers.findIndex(layer => layer.id === state.activeLayerId);
    const next = index + direction;
    if (index < 0 || next < 0 || next >= state.layers.length) return;
    const [layer] = state.layers.splice(index, 1);
    state.layers.splice(next, 0, layer);
    renderLayers();
    pushHistory('Move layer');
    requestRender();
  }

  function applyPreset(name) {
    const presets = {
      softCard: {
        fill: '#ffe0a3', fill2: '#d581ff', fillType: 'linear', material: 'plastic',
        stroke: '#2b3142', strokeWidth: 2, shadowBlur: 22, shadowX: 15, shadowY: 18,
        glow: 0, blur: 0, bevel: 12, extrude: 8, opacity: 1
      },
      chromeBadge: {
        fill: '#d8e2ef', fill2: '#303846', fillType: 'material', material: 'chrome',
        stroke: '#111827', strokeWidth: 2, shadowBlur: 18, shadowX: 10, shadowY: 15,
        glow: 0, blur: 0, bevel: 18, extrude: 14, opacity: 1
      },
      neonGlow: {
        fill: '#ffffff', fill2: '#7c3aed', fillType: 'material', material: 'neon',
        stroke: '#22d3ee', strokeWidth: 4, shadowBlur: 0, shadowX: 0, shadowY: 0,
        glow: 34, blur: 0, bevel: 3, extrude: 0, opacity: 1
      },
      waterInk: {
        fill: '#cbe9ff', fill2: '#5468ff', fillType: 'radial', material: 'paper',
        stroke: '#111827', strokeWidth: 11, shadowBlur: 4, shadowX: 2, shadowY: 3,
        glow: 0, blur: 0, bevel: 0, extrude: 0, opacity: 0.82
      }
    };
    const preset = presets[name];
    if (!preset) return;
    state.defaultStyle = { ...state.defaultStyle, ...preset };
    writeStyleToControls(state.defaultStyle);
    applyControlStyle(false);
    pushHistory('Apply preset');
    requestRender();
  }

  function loadImage(src) {
    if (imageCache.has(src)) return imageCache.get(src);
    const img = new Image();
    img.onload = requestRender;
    img.src = src;
    imageCache.set(src, img);
    return img;
  }

  function addImageFromFile(file, point) {
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result);
      const img = loadImage(src);
      img.onload = () => {
        const width = Math.min(520, img.naturalWidth || 400);
        const ratio = img.naturalHeight / Math.max(1, img.naturalWidth);
        const object = {
          id: nextId('obj'),
          type: 'image',
          layerId: state.activeLayerId,
          x: point.x,
          y: point.y,
          w: width,
          h: width * ratio,
          src,
          style: { ...defaultStyle(), fillType: 'none', strokeWidth: 0, shadowBlur: 0, bevel: 0 }
        };
        state.objects.push(object);
        state.selectedIds = [object.id];
        updateSelectionInfo();
        pushHistory('Add image');
        requestRender();
      };
    };
    reader.readAsDataURL(file);
  }

  function exportPng() {
    const bounds = documentBoundsOfVisibleObjects() || { x: 0, y: 0, w: state.document.width, h: state.document.height };
    const padding = 40;
    const targetMax = 4200;
    const scale = Math.min(3, targetMax / Math.max(bounds.w + padding * 2, bounds.h + padding * 2));
    const out = document.createElement('canvas');
    out.width = Math.ceil((bounds.w + padding * 2) * scale);
    out.height = Math.ceil((bounds.h + padding * 2) * scale);
    const outCtx = out.getContext('2d');
    outCtx.setTransform(scale, 0, 0, scale, 0, 0);
    outCtx.clearRect(0, 0, out.width, out.height);
    outCtx.translate(-bounds.x + padding, -bounds.y + padding);
    drawSceneObjects(outCtx);
    const url = out.toDataURL('image/png');
    downloadUrl('realdrawer-export.png', url);
    setStatus('PNG exported');
  }

  function documentBoundsOfVisibleObjects() {
    const visibleLayerIds = new Set(state.layers.filter(layer => layer.visible).map(layer => layer.id));
    const objects = state.objects.filter(object => visibleLayerIds.has(object.layerId));
    if (!objects.length) return null;
    const bounds = objects.map(objectBounds);
    const minX = Math.min(...bounds.map(b => b.x));
    const minY = Math.min(...bounds.map(b => b.y));
    const maxX = Math.max(...bounds.map(b => b.x + b.w));
    const maxY = Math.max(...bounds.map(b => b.y + b.h));
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  }

  function exportSvg() {
    const bounds = documentBoundsOfVisibleObjects() || { x: 0, y: 0, w: state.document.width, h: state.document.height };
    const svg = [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(bounds.w)}" height="${Math.ceil(bounds.h)}" viewBox="${bounds.x} ${bounds.y} ${bounds.w} ${bounds.h}">`,
      `  <desc>Exported from RealDrawer Suite. Canvas-only effects are approximated.</desc>`
    ];
    for (const layer of state.layers) {
      if (!layer.visible) continue;
      svg.push(`  <g id="${escapeXml(layer.name)}" opacity="${layer.opacity}">`);
      for (const object of state.objects.filter(item => item.layerId === layer.id)) {
        svg.push(objectToSvg(object));
      }
      svg.push('  </g>');
    }
    svg.push('</svg>');
    downloadText('realdrawer-export.svg', svg.join('\n'), 'image/svg+xml');
    setStatus('SVG exported');
  }

  function objectToSvg(object) {
    const style = { ...defaultStyle(), ...object.style };
    const attrs = `fill="${style.fillType === 'none' ? 'none' : escapeXml(style.fill)}" stroke="${escapeXml(style.stroke)}" stroke-width="${style.strokeWidth}" opacity="${style.opacity}"`;
    if (object.type === 'rect') {
      const b = normalizedRect(object.x, object.y, object.w, object.h);
      return `    <rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="${object.radius || 0}" ${attrs}/>`;
    }
    if (object.type === 'ellipse') {
      const b = normalizedRect(object.x, object.y, object.w, object.h);
      return `    <ellipse cx="${b.x + b.w / 2}" cy="${b.y + b.h / 2}" rx="${b.w / 2}" ry="${b.h / 2}" ${attrs}/>`;
    }
    if (object.type === 'line') {
      return `    <line x1="${object.x1}" y1="${object.y1}" x2="${object.x2}" y2="${object.y2}" ${attrs} fill="none" stroke-linecap="round"/>`;
    }
    if (object.type === 'path') {
      const path = (object.points || []).map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
      return `    <path d="${path}" fill="none" stroke="${escapeXml(style.stroke)}" stroke-width="${style.strokeWidth}" opacity="${style.opacity}" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    if (object.type === 'text') {
      return `    <text x="${object.x}" y="${object.y}" font-size="${style.fontSize}" font-family="Arial, sans-serif" font-weight="700" ${attrs}>${escapeXml(object.text || '')}</text>`;
    }
    if (object.type === 'image') {
      const b = normalizedRect(object.x, object.y, object.w, object.h);
      return `    <image x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" href="${object.src}" opacity="${style.opacity}"/>`;
    }
    return '';
  }

  function downloadText(filename, text, type) {
    const blob = new Blob([text], { type });
    downloadUrl(filename, URL.createObjectURL(blob), true);
  }

  function downloadUrl(filename, url, revoke = false) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    if (revoke) setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function setStatus(text) {
    statusText.textContent = text;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function hexToRgba(hex, alpha = 1) {
    const normalized = hex.replace('#', '').trim();
    const full = normalized.length === 3
      ? normalized.split('').map(char => char + char).join('')
      : normalized.padEnd(6, '0').slice(0, 6);
    const value = parseInt(full, 16);
    const r = (value >> 16) & 255;
    const g = (value >> 8) & 255;
    const b = value & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function shadeColor(hex, percent) {
    const normalized = hex.replace('#', '').trim();
    const full = normalized.length === 3
      ? normalized.split('').map(char => char + char).join('')
      : normalized.padEnd(6, '0').slice(0, 6);
    const value = parseInt(full, 16);
    let r = (value >> 16) & 255;
    let g = (value >> 8) & 255;
    let b = value & 255;
    r = clamp(Math.round(r + (percent / 100) * 255), 0, 255);
    g = clamp(Math.round(g + (percent / 100) * 255), 0, 255);
    b = clamp(Math.round(b + (percent / 100) * 255), 0, 255);
    return `#${[r, g, b].map(n => n.toString(16).padStart(2, '0')).join('')}`;
  }

  function escapeXml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&apos;');
  }

  function createRng(seed) {
    let value = seed % 2147483647;
    if (value <= 0) value += 2147483646;
    return () => {
      value = value * 16807 % 2147483647;
      return (value - 1) / 2147483646;
    };
  }

  function onWheel(event) {
    event.preventDefault();
    const screen = clientToCanvas(event);
    const before = screenToWorld(screen);
    const direction = event.deltaY < 0 ? 1 : -1;
    const factor = direction > 0 ? 1.1 : 1 / 1.1;
    state.camera.zoom = clamp(state.camera.zoom * factor, 0.08, 8);
    state.camera.x = screen.x - before.x * state.camera.zoom;
    state.camera.y = screen.y - before.y * state.camera.zoom;
    requestRender();
  }

  function copySelection() {
    state.clipboard = selectedObjects().map(clone);
    setStatus(`${state.clipboard.length} object(s) copied`);
  }

  function pasteSelection() {
    if (!state.clipboard.length) return;
    const copies = state.clipboard.map(object => {
      const copy = clone(object);
      copy.id = nextId('obj');
      copy.layerId = state.activeLayerId;
      offsetObject(copy, 32, 32);
      reviveObject(copy);
      return copy;
    });
    state.objects.push(...copies);
    state.selectedIds = copies.map(object => object.id);
    updateSelectionInfo();
    pushHistory('Paste');
    requestRender();
  }

  function onKeyDown(event) {
    if (event.target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) return;
    if (event.code === 'Space') {
      spaceDown = true;
      canvas.style.cursor = 'grab';
      event.preventDefault();
      return;
    }
    const key = event.key.toLowerCase();
    if ((event.ctrlKey || event.metaKey) && key === 'z' && !event.shiftKey) return void (event.preventDefault(), undo());
    if ((event.ctrlKey || event.metaKey) && (key === 'y' || (key === 'z' && event.shiftKey))) return void (event.preventDefault(), redo());
    if ((event.ctrlKey || event.metaKey) && key === 's') return void (event.preventDefault(), localStorage.setItem(LOCAL_KEY, JSON.stringify(serializeDocument())), setStatus('Saved to local storage'));
    if ((event.ctrlKey || event.metaKey) && key === 'c') return void (event.preventDefault(), copySelection());
    if ((event.ctrlKey || event.metaKey) && key === 'v') return void (event.preventDefault(), pasteSelection());
    if ((event.ctrlKey || event.metaKey) && key === 'd') return void (event.preventDefault(), duplicateSelection());
    if (event.key === 'Delete' || event.key === 'Backspace') return void (event.preventDefault(), deleteSelection());
    if (key === 'v') setTool('select');
    if (key === 'm') setTool('pan');
    if (key === 'r') setTool('rect');
    if (key === 'o') setTool('ellipse');
    if (key === 'l') setTool('line');
    if (key === 'b') setTool('brush');
    if (key === 't') setTool('text');
    if (key === 'e') setTool('eraser');
    if (key === '0') {
      state.camera = { x: 120, y: 90, zoom: 1 };
      requestRender();
    }
  }

  function onKeyUp(event) {
    if (event.code === 'Space') {
      spaceDown = false;
      canvas.style.cursor = state.tool === 'pan' ? 'grab' : state.tool === 'select' ? 'default' : 'crosshair';
    }
  }

  function bindEvents() {
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', requestRender);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    $$('.tool').forEach(button => button.addEventListener('click', () => setTool(button.dataset.tool)));
    $$('[data-action]').forEach(button => button.addEventListener('click', () => runAction(button.dataset.action, button)));

    Object.values(controls).forEach(control => {
      control.addEventListener('input', () => applyControlStyle(true));
      control.addEventListener('change', () => applyControlStyle(true));
    });

    imageInput.addEventListener('change', () => {
      const file = imageInput.files?.[0];
      if (file && pendingImagePoint) addImageFromFile(file, pendingImagePoint);
      imageInput.value = '';
      pendingImagePoint = null;
    });

    projectInput.addEventListener('change', () => {
      const file = projectInput.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          loadDocument(JSON.parse(String(reader.result)));
        } catch (error) {
          setStatus(`Could not open project: ${error.message}`);
        }
      };
      reader.readAsText(file);
      projectInput.value = '';
    });
  }

  bindEvents();
  initializeDocument(true);
})();
