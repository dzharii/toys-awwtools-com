(function () {
  "use strict";

  var BJ = window.BrainJoke;
  if (!BJ) return;

  var SVG_NS = "http://www.w3.org/2000/svg";

  function svgEl(tag) {
    return document.createElementNS(SVG_NS, tag);
  }

  function ensureDefs(svg) {
    var defs = svg.querySelector("defs");
    if (defs) return defs;
    defs = svgEl("defs");
    svg.insertBefore(defs, svg.firstChild);
    return defs;
  }

  function ensureClipPath(defs) {
    var clip = defs.querySelector("#cavityClip");
    if (clip) return clip;

    clip = svgEl("clipPath");
    clip.setAttribute("id", "cavityClip");
    clip.setAttribute("clipPathUnits", "userSpaceOnUse");

    var use = svgEl("use");
    use.setAttribute("href", "#cavityPath");
    clip.appendChild(use);

    defs.appendChild(clip);
    return clip;
  }

  function ensureGroup(defs, id) {
    var g = defs.querySelector("#" + id);
    if (g) return g;
    g = svgEl("g");
    g.setAttribute("id", id);
    defs.appendChild(g);
    return g;
  }

  function ensureMeasureText(defs) {
    var t = defs.querySelector("#measureText");
    if (t) return t;
    t = svgEl("text");
    t.setAttribute("id", "measureText");
    t.setAttribute("x", "-9999");
    t.setAttribute("y", "-9999");
    t.setAttribute("visibility", "hidden");
    t.setAttribute("class", "brain-text");
    defs.appendChild(t);
    return t;
  }

  function ensureDebugLayer(svg) {
    var layer = svg.querySelector("#debugLayer");
    if (layer) return layer;
    layer = svgEl("g");
    layer.setAttribute("id", "debugLayer");
    layer.setAttribute("visibility", "hidden");
    svg.appendChild(layer);
    return layer;
  }

  BJ.services.scene = (function () {
    var initialized = false;
    var scene = null;

    function initScene() {
      if (initialized) return scene;

      var dom = BJ.services.dom.ready();
      if (!dom.ok) throw new Error("DOM not ready: " + dom.missing.join(", "));

      var svg = dom.svg;
      var defs = ensureDefs(svg);
      ensureClipPath(defs);

      var brainDefs = ensureGroup(defs, "brainPathDefs");
      var measureText = ensureMeasureText(defs);
      var debugLayer = ensureDebugLayer(svg);

      dom.brainHost.setAttribute("clip-path", "url(#cavityClip)");
      var brainLayers = svgEl("g");
      brainLayers.setAttribute("id", "brainLayers");
      dom.brainHost.appendChild(brainLayers);

      scene = {
        svg: svg,
        defs: defs,
        brainDefs: brainDefs,
        brainLayers: brainLayers,
        measureText: measureText,
        debugLayer: debugLayer,
      };

      initialized = true;
      return scene;
    }

    function measureTextLength(text, fontSize, letterSpacing) {
      if (!scene) throw new Error("Scene not initialized");
      scene.measureText.textContent = text;
      scene.measureText.setAttribute("font-size", String(fontSize));
      if (letterSpacing != null) scene.measureText.setAttribute("letter-spacing", String(letterSpacing));
      return scene.measureText.getComputedTextLength();
    }

    function measurePathLength(d) {
      if (!scene) throw new Error("Scene not initialized");
      var p = svgEl("path");
      p.setAttribute("d", d);
      scene.brainDefs.appendChild(p);
      var length = p.getTotalLength();
      scene.brainDefs.removeChild(p);
      return length;
    }

    return {
      initScene: initScene,
      get: function () {
        if (!scene) throw new Error("Scene not initialized");
        return scene;
      },
      measureTextLength: measureTextLength,
      measurePathLength: measurePathLength,
    };
  })();
})();

