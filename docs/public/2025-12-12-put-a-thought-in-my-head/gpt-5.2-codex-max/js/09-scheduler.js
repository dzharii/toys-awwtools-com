(function () {
  'use strict';

  var BT = window.BrainToy;
  if (!BT) return;

  var rafId = 0;
  var layoutRaf = 0;
  var pendingReason = 'input';

  function setReducedMotion(on) {
    BT.config.motion.reduced = !!on;
    document.documentElement.classList.toggle('reduced-motion', BT.config.motion.reduced);
    if (BT.config.motion.reduced) document.documentElement.classList.remove('is-thinking');
    var rig = BT.services.dom.byId('characterRig');
    if (rig) {
      if (BT.config.motion.reduced) rig.classList.remove('character-breathe');
      else rig.classList.add('character-breathe');
    }

    if (BT.services.characterAnim) {
      if (BT.config.motion.reduced && BT.services.characterAnim.stopIdle) BT.services.characterAnim.stopIdle();
      if (!BT.config.motion.reduced && BT.services.characterAnim.startIdle) BT.services.characterAnim.startIdle();
    }
  }

  function scheduleLayoutUpdate(reason) {
    pendingReason = reason || pendingReason;
    if (layoutRaf) return;
    layoutRaf = window.requestAnimationFrame(function () {
      layoutRaf = 0;
      if (BT.services.bootstrap && BT.services.bootstrap.requestLayout) {
        BT.services.bootstrap.requestLayout(pendingReason);
      }
    });
  }

  function startRafLoop(tick) {
    if (rafId) return;
    function loop(ts) {
      rafId = window.requestAnimationFrame(loop);
      tick(ts);
    }
    rafId = window.requestAnimationFrame(loop);
  }

  function stopRafLoop() {
    if (!rafId) return;
    window.cancelAnimationFrame(rafId);
    rafId = 0;
  }

  function initGlobalListeners() {
    window.addEventListener('resize', function () {
      scheduleLayoutUpdate('resize');
    });
  }

  BT.services.scheduler = {
    scheduleLayoutUpdate: scheduleLayoutUpdate,
    setReducedMotion: setReducedMotion,
    startRafLoop: startRafLoop,
    stopRafLoop: stopRafLoop,
    initGlobalListeners: initGlobalListeners,
  };
})();
