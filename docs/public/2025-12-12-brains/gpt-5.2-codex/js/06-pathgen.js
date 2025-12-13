(function () {
  "use strict";

  var BJ = window.BrainJoke;
  if (!BJ) return;

  function arcForTiny(metrics) {
    var b = metrics.bbox;
    var pad = BJ.config.insetMargin + 10;
    var x1 = b.x + pad;
    var x2 = b.x + b.width - pad;
    var y = b.y + b.height * 0.55;
    var cx = metrics.center.x;
    var cy = metrics.center.y - b.height * 0.06;
    return "M " + x1 + " " + y + " Q " + cx + " " + cy + " " + x2 + " " + y;
  }

  function snakePath(metrics, rows, extraInset) {
    var b = metrics.bbox;
    var inset = BJ.config.insetMargin + (extraInset || 0);

    var top = b.y + inset;
    var bottom = b.y + b.height - inset;
    var usableH = Math.max(1, bottom - top);
    var step = usableH / Math.max(1, rows - 1);
    var turnDepth = Math.min(26, Math.max(10, step * 0.7));

    var d = "";
    var dir = 1;
    var x = 0;
    var y = top;

    for (var r = 0; r < rows; r++) {
      y = top + r * step;
      var span = metrics.spanAtY(y);
      var left = span.minX + inset;
      var right = span.maxX - inset;
      if (right - left < 30) {
        left = b.x + inset;
        right = b.x + b.width - inset;
      }

      var startX = dir > 0 ? left : right;
      var endX = dir > 0 ? right : left;
      if (r === 0) {
        x = startX;
        d += "M " + x.toFixed(2) + " " + y.toFixed(2);
      }

      var dx = endX - x;
      var wobble = Math.sin(r * 1.45) * Math.min(8, step * 0.18);
      d +=
        " C " +
        (x + dx * 0.33).toFixed(2) +
        " " +
        (y + wobble).toFixed(2) +
        ", " +
        (x + dx * 0.66).toFixed(2) +
        " " +
        (y - wobble).toFixed(2) +
        ", " +
        endX.toFixed(2) +
        " " +
        y.toFixed(2);

      if (r < rows - 1) {
        var y2 = top + (r + 1) * step;
        var span2 = metrics.spanAtY(y2);
        var left2 = span2.minX + inset;
        var right2 = span2.maxX - inset;
        if (right2 - left2 < 30) {
          left2 = b.x + inset;
          right2 = b.x + b.width - inset;
        }

        var tuck = Math.min(turnDepth, Math.max(10, (right2 - left2) * 0.08));
        var nextStart = dir > 0 ? right2 : left2;
        var nextInner = dir > 0 ? right2 - tuck : left2 + tuck;

        d +=
          " C " +
          endX.toFixed(2) +
          " " +
          (y + turnDepth * 0.25).toFixed(2) +
          ", " +
          nextStart.toFixed(2) +
          " " +
          (y2 - turnDepth * 0.25).toFixed(2) +
          ", " +
          nextInner.toFixed(2) +
          " " +
          y2.toFixed(2);

        x = nextInner;
        dir *= -1;
      }
    }

    return d;
  }

  BJ.services.pathgen = {
    generatePathsForTier: function (tier, metrics) {
      if (tier === 0) return [{ d: arcForTiny(metrics), insetExtra: 0 }];

      var rows = BJ.config.densityTiers[tier].rows;
      if (rows >= 12) {
        return [
          { d: snakePath(metrics, rows, 0), insetExtra: 0 },
          { d: snakePath(metrics, Math.max(6, rows - 4), BJ.config.insetExtraForInnerPath), insetExtra: BJ.config.insetExtraForInnerPath },
        ];
      }

      return [{ d: snakePath(metrics, rows, 0), insetExtra: 0 }];
    },
  };
})();

