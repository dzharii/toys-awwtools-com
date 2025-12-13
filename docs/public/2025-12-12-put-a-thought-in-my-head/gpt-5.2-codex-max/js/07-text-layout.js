(function () {
  'use strict';

  var BT = window.BrainToy;
  if (!BT) return;

  function estimateAvgSpanWidth(metrics) {
    var geom = BT.services.geometry;
    var inset = metrics.inset;
    var samples = 7;
    var total = 0;
    var count = 0;
    for (var i = 0; i < samples; i++) {
      var t = (i + 1) / (samples + 1);
      var y = inset.y + inset.height * t;
      var span = geom.findSpanAtY(metrics, y);
      if (!span || !isFinite(span.width)) continue;
      total += span.width;
      count++;
    }
    if (!count) return inset.width * 0.8;
    return total / count;
  }

  function computeRowCount(len, metrics) {
    var cfg = BT.config.brain;
    var inset = metrics.inset;
    var avgSpan = Math.max(1, estimateAvgSpanWidth(metrics));
    var constant = (inset.height * cfg.avgCharWidthFactor * cfg.fillBias) / (avgSpan * cfg.lineHeight);
    var rows = (1 + Math.sqrt(1 + 4 * len * constant)) / 2;
    return Math.round(BT.util.clamp(rows, cfg.minRows, cfg.maxRows));
  }

  function repeatToTarget(text, targetChars) {
    var sep = BT.config.brain.repeatSeparator;
    var out = text;
    if (!text) return '';
    var guard = 0;
    while (out.length < targetChars && guard < 2000) {
      out += sep + text;
      guard++;
    }
    return out;
  }

  function computeFillRatio(len, fontSize, estimatedLen) {
    if (!estimatedLen) return 0;
    return (len * fontSize * BT.config.brain.avgCharWidthFactor) / Math.max(1, estimatedLen);
  }

  function layoutText(text, metrics) {
    var clean = text || '';
    var len = clean.length;
    if (!clean.trim()) {
      return { mode: 'empty', text: '', fontSize: 0, pathD: 'M 0 0', occupancy: 0 };
    }

    var cfg = BT.config.brain;
    var inset = metrics.inset;
    var minSide = Math.min(inset.width, inset.height);

    if (len <= 1) {
      return {
        mode: 'hero',
        text: clean,
        fontSize: BT.util.clamp(minSide * 0.5, 30, cfg.maxFont),
        pathD: BT.services.pathgen.generateHeroPath(metrics),
        occupancy: 0.22,
      };
    }

    if (len <= cfg.bandMaxLen) {
      var bandSize = minSide * (0.56 - 0.011 * Math.min(len, cfg.bandMaxLen));
      return {
        mode: 'band',
        text: clean,
        fontSize: BT.util.clamp(bandSize, 22, cfg.maxFont),
        pathD: BT.services.pathgen.generateHeroPath(metrics),
        occupancy: BT.util.clamp(Math.log10(len + 1) / 3.2, 0, 1),
      };
    }

    var rows = computeRowCount(len, metrics);
    var snake = null;
    var fontSize = 0;
    var estimatedLen = 0;
    var ratio = 0;
    for (var tries = 0; tries < 6; tries++) {
      var rowSpacing = inset.height / Math.max(1, rows - 1);
      fontSize = BT.util.clamp(rowSpacing / cfg.lineHeight, cfg.minFont, cfg.maxFont);
      snake = BT.services.pathgen.generateSnakePath(metrics, rows);
      estimatedLen = snake.estimatedLen || inset.width * rows;
      ratio = computeFillRatio(len, fontSize, estimatedLen);
      if (ratio > 1.08 && rows < cfg.maxRows) {
        rows++;
        continue;
      }
      if (ratio < 0.92 && rows > cfg.minRows) {
        rows--;
        continue;
      }
      break;
    }

    var filledText = clean;
    var needRepeat = ratio > 0 && ratio < 0.7;
    if (needRepeat) {
      var repeatCount = Math.min(cfg.maxRepeats, Math.ceil(0.9 / Math.max(0.08, ratio)));
      if (repeatCount > 1) {
        var targetChars = Math.min(BT.config.maxTextChars, clean.length * repeatCount + (cfg.repeatSeparator.length * (repeatCount - 1)));
        filledText = repeatToTarget(clean, targetChars);
      }
    }
    if (filledText.length > BT.config.maxTextChars) filledText = filledText.slice(0, BT.config.maxTextChars);
    var occupancy = BT.util.clamp(Math.log10(len + 1) / 3.2, 0, 1);

    return {
      mode: 'snake',
      text: filledText,
      fontSize: fontSize,
      pathD: snake.d,
      occupancy: occupancy,
      rows: rows,
    };
  }

  BT.services.textLayout = { layoutText: layoutText };
})();
