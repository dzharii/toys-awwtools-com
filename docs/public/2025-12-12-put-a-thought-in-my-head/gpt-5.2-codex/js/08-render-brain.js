(function () {
  "use strict";

  var BJ = window.BrainJoke;
  if (!BJ) return;

  var SVG_NS = "http://www.w3.org/2000/svg";

  function svgEl(tag) {
    return document.createElementNS(SVG_NS, tag);
  }

  function createPathDef(scene, d, id) {
    var p = svgEl("path");
    p.setAttribute("id", id);
    p.setAttribute("d", d);
    scene.brainDefs.appendChild(p);
    return p;
  }

  function removeByPrefix(scene, prefix) {
    var nodes = scene.brainDefs.querySelectorAll("[id^='" + prefix + "']");
    for (var i = 0; i < nodes.length; i++) nodes[i].remove();
  }

  BJ.services.brainRenderer = (function () {
    var currentLayer = null;
    var currentPrefix = null;

    function setHasBrain(svg, hasBrain) {
      if (hasBrain) svg.classList.add("has-brain");
      else svg.classList.remove("has-brain");
    }

    function clearBrain(animated) {
      var scene = BJ.services.scene.get();
      setHasBrain(scene.svg, false);
      if (!currentLayer) return;

      if (animated && !BJ.state.reducedMotion) {
        currentLayer.classList.remove("is-live");
        currentLayer.classList.add("is-drain");
        var toRemove = currentLayer;
        var prefix = currentPrefix;
        currentLayer = null;
        currentPrefix = null;
        setTimeout(function () {
          toRemove.remove();
          if (prefix) removeByPrefix(scene, prefix);
        }, 420);
      } else {
        currentLayer.remove();
        if (currentPrefix) removeByPrefix(scene, currentPrefix);
        currentLayer = null;
        currentPrefix = null;
      }
    }

    function render(plan, options) {
      var scene = BJ.services.scene.get();
      options = options || {};

      if (!plan || plan.empty || !plan.paths || !plan.paths.length) {
        clearBrain(options.animated !== false);
        return;
      }

      setHasBrain(scene.svg, true);

      var prefix = "brainPath_" + Date.now().toString(36) + "_";
      var layer = svgEl("g");
      layer.setAttribute("class", "brain-layer");

      var content = svgEl("g");
      content.setAttribute("class", "brain-content" + (options.ripple ? " brain-ripple" : ""));

      var isFirst = !currentLayer;
      if (isFirst) layer.classList.add("is-inflate");

      for (var i = 0; i < plan.paths.length; i++) {
        var pathId = prefix + i;
        createPathDef(scene, plan.paths[i].d, pathId);

        var textEl = svgEl("text");
        var isNoise = plan.tier >= 6;
        textEl.setAttribute("class", "brain-text" + (isNoise ? " is-noise" : ""));
        textEl.setAttribute("font-size", String(plan.fontSize));
        textEl.setAttribute("dominant-baseline", "middle");

        var tp = svgEl("textPath");
        tp.setAttribute("href", "#" + pathId);
        tp.setAttribute("startOffset", plan.paths[i].startOffset || "0%");
        tp.textContent = plan.paths[i].text;
        textEl.appendChild(tp);
        content.appendChild(textEl);
      }

      layer.appendChild(content);
      scene.brainLayers.appendChild(layer);

      // Trigger transition.
      requestAnimationFrame(function () {
        layer.classList.add("is-live");
        if (isFirst) layer.classList.remove("is-inflate");
      });

      if (currentLayer) {
        var oldLayer = currentLayer;
        var oldPrefix = currentPrefix;
        oldLayer.classList.remove("is-live");
        oldLayer.classList.add("is-drain");
        setTimeout(function () {
          oldLayer.remove();
          if (oldPrefix) removeByPrefix(scene, oldPrefix);
        }, 420);
      }

      currentLayer = layer;
      currentPrefix = prefix;

      BJ.state.lastPlan = plan;
    }

    return { render: render, clearBrain: clearBrain };
  })();
})();
