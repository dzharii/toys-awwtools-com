(function () {
  "use strict";

  var BJ = window.BrainJoke;
  if (!BJ) return;

  function pickTier(len) {
    if (len <= 0) return -1;
    if (len <= 2) return 0;
    if (len <= 10) return 1;
    if (len <= 30) return 2;
    if (len <= 80) return 3;
    if (len <= 180) return 4;
    if (len <= 420) return 5;
    return 6;
  }

  function splitTextForPaths(text, pathLengths) {
    if (pathLengths.length <= 1) return [text];
    var total = 0;
    for (var i = 0; i < pathLengths.length; i++) total += pathLengths[i];
    var idx = Math.floor((text.length * pathLengths[0]) / total);
    var split = BJ.util.nearestSpace(text, idx, 14);
    if (split === -1) split = idx;
    var a = text.slice(0, split).trim();
    var b = text.slice(split).trim();
    return [a, b];
  }

  BJ.services.textLayout = {
    layoutText: function (rawText, metrics) {
      var text = String(rawText || "");
      if (!text) return { empty: true, occupancy: 0, tier: -1, paths: [] };

      var truncated = false;
      if (text.length > BJ.config.maxTextChars) {
        text = text.slice(0, BJ.config.maxTextChars) + " …";
        truncated = true;
      }

      var tier = pickTier(text.length);
      var paths = BJ.services.pathgen.generatePathsForTier(tier, metrics);
      var pathLengths = paths.map(function (p) {
        return BJ.services.scene.measurePathLength(p.d);
      });

      var totalPath = 0;
      for (var i = 0; i < pathLengths.length; i++) totalPath += pathLengths[i];

      var measureAt = 18;
      var baseLen = BJ.services.scene.measureTextLength(text, measureAt);
      var perPx = baseLen / measureAt;

      var desired = (totalPath * BJ.config.render.occupancyFillTarget) / Math.max(0.001, perPx);
      var fontSize = BJ.util.clamp(desired, BJ.config.minFontSize, BJ.config.maxFontSize);

      if (tier === 0) {
        fontSize = BJ.util.clamp(fontSize * 1.25, BJ.config.minFontSize, BJ.config.maxFontSize);
      }

      var chunks = splitTextForPaths(text, pathLengths);

      var occupancy = BJ.util.clamp(text.length / 240, 0, 1);
      if (tier <= 1) occupancy = BJ.util.clamp(text.length / 12, 0, 1);
      if (tier >= 6) occupancy = 1;

      return {
        empty: false,
        tier: tier,
        truncated: truncated,
        fontSize: fontSize,
        paths: paths.map(function (p, idx) {
          return {
            d: p.d,
            text: chunks[idx] || "",
            startOffset: tier === 0 ? "12%" : "0%",
          };
        }),
        occupancy: occupancy,
      };
    },
  };
})();

