(function () {
  "use strict";

  var BJ = window.BrainJoke;
  if (!BJ) return;

  BJ.services.scheduler = (function () {
    var rafId = 0;
    var tasks = Object.create(null);
    var layoutTimer = 0;
    var scheduledLayoutFn = null;

    function tick(nowMs) {
      var keys = Object.keys(tasks);
      for (var i = 0; i < keys.length; i++) tasks[keys[i]](nowMs);
      rafId = requestAnimationFrame(tick);
    }

    function ensureRaf() {
      if (rafId) return;
      rafId = requestAnimationFrame(tick);
    }

    function addRafTask(name, fn) {
      tasks[name] = fn;
      ensureRaf();
    }

    function removeRafTask(name) {
      delete tasks[name];
    }

    function scheduleLayoutUpdate(fn) {
      scheduledLayoutFn = fn;
      if (layoutTimer) clearTimeout(layoutTimer);
      layoutTimer = setTimeout(function () {
        layoutTimer = 0;
        var f = scheduledLayoutFn;
        scheduledLayoutFn = null;
        if (typeof f === "function") f();
      }, BJ.config.layoutDebounceMs);
    }

    function setReducedMotion(on) {
      BJ.state.reducedMotion = !!on;
      document.body.classList.toggle("reduced-motion", BJ.state.reducedMotion);
    }

    return {
      addRafTask: addRafTask,
      removeRafTask: removeRafTask,
      scheduleLayoutUpdate: scheduleLayoutUpdate,
      setReducedMotion: setReducedMotion,
    };
  })();
})();

