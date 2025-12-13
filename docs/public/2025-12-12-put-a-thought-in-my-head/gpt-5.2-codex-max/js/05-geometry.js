(function () {
  'use strict';

  var BT = window.BrainToy;
  if (!BT) return;

  var cached = null;
  var cachedKey = '';

  function cacheSignature(cavityPath) {
    var cfg = BT.config.geometry;
    return [
      cavityPath ? cavityPath.getAttribute('d') || '' : '',
      cfg.sampleStep,
      cfg.insetX,
      cfg.insetY,
      cfg.edgePad || 0,
    ].join('|');
  }

  function measureCavity(force) {
    var dom = BT.services.dom;
    var cavityPath = dom.byId('cavityPath');
    var svg = dom.byId('brainToySvg');
    if (!cavityPath || !svg) return null;

    var sig = cacheSignature(cavityPath);
    if (!force && cached && cachedKey === sig) return cached;

    var bbox = cavityPath.getBBox();
    var inset = {
      x: bbox.x + BT.config.geometry.insetX,
      y: bbox.y + BT.config.geometry.insetY,
      width: Math.max(1, bbox.width - BT.config.geometry.insetX * 2),
      height: Math.max(1, bbox.height - BT.config.geometry.insetY * 2),
    };

    var sharedPoint = svg.createSVGPoint ? svg.createSVGPoint() : null;
    function pointInFill(x, y) {
      if (!cavityPath.isPointInFill) return true;
      if (!sharedPoint) return true;
      sharedPoint.x = x;
      sharedPoint.y = y;
      return cavityPath.isPointInFill(sharedPoint);
    }

    cached = {
      svg: svg,
      cavityPath: cavityPath,
      bbox: bbox,
      inset: inset,
      pointInFill: pointInFill,
    };
    cachedKey = sig;
    return cached;
  }

  function findSpanAtY(metrics, y) {
    var inset = metrics.inset;
    var step = BT.config.geometry.sampleStep;

    if (y < inset.y || y > inset.y + inset.height) return null;

    var xMin = inset.x;
    var xMax = inset.x + inset.width;

    var left = null;
    var right = null;
    for (var x = xMin; x <= xMax; x += step) {
      if (metrics.pointInFill(x, y)) {
        left = x;
        break;
      }
    }
    if (left === null) return null;
    for (var xr = xMax; xr >= xMin; xr -= step) {
      if (metrics.pointInFill(xr, y)) {
        right = xr;
        break;
      }
    }
    if (right === null || right <= left) return null;

    return { left: left, right: right, width: right - left };
  }

  BT.services.geometry = {
    measureCavity: measureCavity,
    findSpanAtY: findSpanAtY,
    invalidate: function () {
      cached = null;
      cachedKey = '';
    },
  };
})();
