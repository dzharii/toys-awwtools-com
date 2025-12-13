(function () {
  'use strict';

  var BT = window.BrainToy;
  if (!BT) return;

  var cache = {};

  function byId(id) {
    if (cache[id]) return cache[id];
    var el = document.getElementById(id);
    if (el) cache[id] = el;
    return el;
  }

  function clearCache() {
    cache = {};
  }

  function validate(requiredIds) {
    var missing = [];
    for (var i = 0; i < requiredIds.length; i++) {
      if (!byId(requiredIds[i])) missing.push(requiredIds[i]);
    }
    return { ok: missing.length === 0, missing: missing };
  }

  BT.services.dom = {
    byId: byId,
    validate: validate,
    clearCache: clearCache,
  };
})();

