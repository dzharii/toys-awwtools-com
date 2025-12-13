(function () {
  'use strict';

  var BT = window.BrainToy;
  if (!BT) return;

  function generateHeroPath(metrics) {
    var inset = metrics.inset;
    var cx = inset.x + inset.width * 0.5;
    var cy = inset.y + inset.height * 0.52;
    var rx = inset.width * 0.42;
    var ry = inset.height * 0.28;
    var x0 = cx - rx;
    var x1 = cx + rx;
    var y0 = cy;
    return 'M ' + x0 + ' ' + y0 + ' C ' + (cx - rx * 0.2) + ' ' + (cy - ry) + ' ' + (cx + rx * 0.2) + ' ' + (cy + ry) + ' ' + x1 + ' ' + y0;
  }

  function generateSnakePath(metrics, rowCount) {
    var geom = BT.services.geometry;
    var inset = metrics.inset;
    var top = inset.y;
    var height = inset.height;
    var rows = Math.max(2, rowCount);
    var d = '';
    var rowSpacing = rows <= 1 ? height : height / (rows - 1);
    var turn = Math.min(18, rowSpacing * 0.55);
    var totalSpan = 0;
    var validRows = 0;
    var pad = BT.config.geometry.edgePad || 0;

    for (var i = 0; i < rows; i++) {
      var t = rows === 1 ? 0 : i / (rows - 1);
      var y = top + t * height;
      var span = geom.findSpanAtY(metrics, y);
      if (!span) continue;
      var left = span.left + pad;
      var right = span.right - pad;
      if (right <= left + 10) continue;
      totalSpan += right - left;
      validRows++;

      var dirLeftToRight = i % 2 === 0;
      var xStart = dirLeftToRight ? left : right;
      var xEnd = dirLeftToRight ? right : left;

      if (!d) d = 'M ' + xStart + ' ' + y;
      var midX = (xStart + xEnd) * 0.5;
      var curveAmp = rowSpacing * 0.18;
      var bend = i % 2 === 0 ? 1 : -1;
      d += ' Q ' + midX + ' ' + (y + bend * curveAmp) + ' ' + xEnd + ' ' + y;

      if (i < rows - 1) {
        var t2 = (i + 1) / (rows - 1);
        var y2 = top + t2 * height;
        var span2 = geom.findSpanAtY(metrics, y2);
        if (!span2) continue;
        var left2 = span2.left + pad;
        var right2 = span2.right - pad;
        var nextDirLeftToRight = (i + 1) % 2 === 0;
        var nextStart = nextDirLeftToRight ? left2 : right2;

        var ctrl1x = xEnd;
        var ctrl1y = y + turn;
        var ctrl2x = nextStart;
        var ctrl2y = y2 - turn;
        d += ' C ' + ctrl1x + ' ' + ctrl1y + ' ' + ctrl2x + ' ' + ctrl2y + ' ' + nextStart + ' ' + y2;
      }
    }

    var estimatedLen = totalSpan + validRows * turn * 1.7;
    return { d: d || 'M 0 0', estimatedLen: estimatedLen };
  }

  BT.services.pathgen = {
    generateHeroPath: generateHeroPath,
    generateSnakePath: generateSnakePath,
  };
})();
