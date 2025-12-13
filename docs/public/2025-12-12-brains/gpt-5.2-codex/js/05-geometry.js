(function () {
  "use strict";

  var BJ = window.BrainJoke;
  if (!BJ) return;

  function measureCavity(pathEl) {
    var bbox = pathEl.getBBox();
    var total = pathEl.getTotalLength();
    var samples = 520;
    var bins = 140;

    var minByBin = new Array(bins);
    var maxByBin = new Array(bins);
    for (var i = 0; i < bins; i++) {
      minByBin[i] = Infinity;
      maxByBin[i] = -Infinity;
    }

    for (var s = 0; s <= samples; s++) {
      var p = pathEl.getPointAtLength((s / samples) * total);
      var ny = (p.y - bbox.y) / bbox.height;
      var bi = Math.max(0, Math.min(bins - 1, Math.floor(ny * (bins - 1))));
      if (p.x < minByBin[bi]) minByBin[bi] = p.x;
      if (p.x > maxByBin[bi]) maxByBin[bi] = p.x;
    }

    for (var b = 0; b < bins; b++) {
      if (minByBin[b] !== Infinity && maxByBin[b] !== -Infinity) continue;
      var left = b - 1;
      while (left >= 0 && minByBin[left] === Infinity) left--;
      var right = b + 1;
      while (right < bins && minByBin[right] === Infinity) right++;

      if (left >= 0 && right < bins) {
        var t = (b - left) / (right - left);
        minByBin[b] = BJ.util.lerp(minByBin[left], minByBin[right], t);
        maxByBin[b] = BJ.util.lerp(maxByBin[left], maxByBin[right], t);
      } else {
        minByBin[b] = bbox.x;
        maxByBin[b] = bbox.x + bbox.width;
      }
    }

    function spanAtY(y) {
      var ny2 = (y - bbox.y) / bbox.height;
      var t2 = BJ.util.clamp(ny2, 0, 1) * (bins - 1);
      var i2 = Math.floor(t2);
      var f2 = t2 - i2;
      var i3 = Math.min(bins - 1, i2 + 1);
      var minX = BJ.util.lerp(minByBin[i2], minByBin[i3], f2);
      var maxX = BJ.util.lerp(maxByBin[i2], maxByBin[i3], f2);
      return { minX: minX, maxX: maxX };
    }

    return {
      bbox: bbox,
      center: { x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height / 2 },
      spanAtY: spanAtY,
    };
  }

  BJ.services.geometry = {
    measureCavity: function () {
      var dom = BJ.services.dom.ready();
      if (!dom.ok) throw new Error("DOM not ready");
      return measureCavity(dom.cavityPath);
    },
  };
})();

