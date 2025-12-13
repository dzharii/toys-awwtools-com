(function () {
  "use strict";

  var BJ = window.BrainJoke;
  if (!BJ) return;

  function byId(id) {
    return document.getElementById(id);
  }

  function validateIds(ids) {
    var missing = [];
    for (var i = 0; i < ids.length; i++) {
      if (!byId(ids[i])) missing.push(ids[i]);
    }
    return missing;
  }

  var cache = null;

  BJ.services.dom = {
    ready: function () {
      if (cache) return cache;

      var required = [
        "toySvg",
        "character",
        "cavityPath",
        "skullRim",
        "brainHost",
        "pupil",
        "eyelid",
        "emptyOverlay",
        "brainInput",
        "inputHint",
        "meterFill",
        "meterPct",
        "reducedMotion",
        "wiggleMode",
        "fatalError",
        "fatalErrorMsg",
      ];

      var missing = validateIds(required);
      if (missing.length) {
        return { ok: false, missing: missing };
      }

      cache = {
        ok: true,
        svg: byId("toySvg"),
        character: byId("character"),
        cavityPath: byId("cavityPath"),
        skullRim: byId("skullRim"),
        brainHost: byId("brainHost"),
        pupil: byId("pupil"),
        eyelid: byId("eyelid"),
        emptyOverlay: byId("emptyOverlay"),
        input: byId("brainInput"),
        hint: byId("inputHint"),
        meterFill: byId("meterFill"),
        meterPct: byId("meterPct"),
        reducedMotionToggle: byId("reducedMotion"),
        wiggleToggle: byId("wiggleMode"),
        fatalError: byId("fatalError"),
        fatalErrorMsg: byId("fatalErrorMsg"),
      };

      return cache;
    },
  };
})();

