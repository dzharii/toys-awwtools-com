(function () {
  "use strict";

  var BJ = window.BrainJoke;
  if (!BJ) return;

  var SVG_NS = "http://www.w3.org/2000/svg";

  function svgEl(tag) {
    return document.createElementNS(SVG_NS, tag);
  }

  function clearLayer(layer) {
    while (layer.firstChild) layer.removeChild(layer.firstChild);
  }

  function drawDebug(plan, metrics) {
    var scene = BJ.services.scene.get();
    var layer = scene.debugLayer;
    clearLayer(layer);

    var b = metrics.bbox;
    var rect = svgEl("rect");
    rect.setAttribute("x", b.x);
    rect.setAttribute("y", b.y);
    rect.setAttribute("width", b.width);
    rect.setAttribute("height", b.height);
    rect.setAttribute("fill", "none");
    rect.setAttribute("stroke", "rgba(255,0,120,0.7)");
    rect.setAttribute("stroke-width", "2");
    layer.appendChild(rect);

    var midCount = 18;
    for (var i = 0; i <= midCount; i++) {
      var y = b.y + (i / midCount) * b.height;
      var span = metrics.spanAtY(y);
      var line = svgEl("line");
      line.setAttribute("x1", span.minX);
      line.setAttribute("x2", span.maxX);
      line.setAttribute("y1", y);
      line.setAttribute("y2", y);
      line.setAttribute("stroke", "rgba(16,22,47,0.18)");
      line.setAttribute("stroke-width", "2");
      layer.appendChild(line);
    }

    if (plan && plan.paths) {
      for (var p = 0; p < plan.paths.length; p++) {
        var path = svgEl("path");
        path.setAttribute("d", plan.paths[p].d);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", p === 0 ? "rgba(122,76,255,0.85)" : "rgba(255,111,169,0.85)");
        path.setAttribute("stroke-width", "3");
        path.setAttribute("stroke-linecap", "round");
        path.setAttribute("stroke-linejoin", "round");
        path.setAttribute("stroke-dasharray", "6 6");
        layer.appendChild(path);
      }
    }
  }

  BJ.debug = (function () {
    var on = false;

    function toggleDebug(force) {
      on = force == null ? !on : !!force;
      BJ.state.debugOn = on;
      var scene = BJ.services.scene.get();
      scene.debugLayer.setAttribute("visibility", on ? "visible" : "hidden");
      if (on) drawDebug(BJ.state.lastPlan, BJ.state.cavityMetrics);
    }

    function runSmokeTests() {
      var inputs = [
        "a",
        "put a thought in my head",
        "https://example.com/this/is/a/very/silly/url?with=params&and=more",
        "A longer paragraph lands here. It should get smaller and denser, but never spill outside the skull. The rim stays on top. The character keeps breathing. The joke holds.",
        new Array(900).join("brains "),
      ];

      // eslint-disable-next-line no-console
      console.group("BrainJoke smoke tests");
      for (var i = 0; i < inputs.length; i++) {
        BJ.ui.input.setText(inputs[i]);
        var plan = BJ.services.textLayout.layoutText(BJ.ui.input.getText(), BJ.state.cavityMetrics);
        // eslint-disable-next-line no-console
        console.log("case", i, { len: inputs[i].length, tier: plan.tier, paths: plan.paths.length, fontSize: plan.fontSize });
      }
      // eslint-disable-next-line no-console
      console.groupEnd();
    }

    return { toggleDebug: toggleDebug, runSmokeTests: runSmokeTests, isOn: function () { return on; }, _draw: drawDebug };
  })();
})();
