(function () {
  'use strict';

  var BT = window.BrainToy;
  if (!BT) return;

  var running = false;
  var intensity = 1;

  var blinkTimer = 0;
  var saccadeTimer = 0;
  var animFrame = 0;
  var animToken = 0;

  var rig = null;
  var eyeGroup = null;
  var pupil = null;

  var pupilOffset = { x: 0, y: 0 };

  function clearTimers() {
    if (blinkTimer) window.clearTimeout(blinkTimer);
    if (saccadeTimer) window.clearTimeout(saccadeTimer);
    blinkTimer = 0;
    saccadeTimer = 0;
  }

  function cancelAnim() {
    animToken++;
    if (animFrame) window.cancelAnimationFrame(animFrame);
    animFrame = 0;
  }

  function setRigIntensityVars() {
    if (!rig) rig = BT.services.dom.byId('characterRig');
    if (!rig) return;
    rig.style.setProperty('--breathe-y', 4 * intensity + 'px');
    rig.style.setProperty('--breathe-rot', -0.6 * intensity + 'deg');
  }

  function setPupilOffset(dx, dy) {
    pupilOffset.x = dx;
    pupilOffset.y = dy;
    if (!pupil) return;
    pupil.setAttribute('transform', 'translate(' + dx.toFixed(2) + ' ' + dy.toFixed(2) + ')');
  }

  function animatePupil(toX, toY, durationMs, easeFn, done) {
    cancelAnim();
    var token = ++animToken;
    var fromX = pupilOffset.x;
    var fromY = pupilOffset.y;
    var start = BT.util.now();
    var dur = Math.max(1, durationMs || 1);
    var ease = easeFn || BT.util.easeInOutCubic;

    function step(now) {
      if (token !== animToken) return;
      var t = (now - start) / dur;
      if (t >= 1) {
        setPupilOffset(toX, toY);
        animFrame = 0;
        if (done) done();
        return;
      }
      var k = ease(BT.util.clamp(t, 0, 1));
      setPupilOffset(BT.util.lerp(fromX, toX, k), BT.util.lerp(fromY, toY, k));
      animFrame = window.requestAnimationFrame(step);
    }

    animFrame = window.requestAnimationFrame(step);
  }

  function scheduleBlink() {
    if (!running) return;
    var cfg = BT.config.character.blink;
    blinkTimer = window.setTimeout(doBlink, BT.util.rand(cfg.minMs, cfg.maxMs));
  }

  function doBlink() {
    if (!running) return;
    scheduleBlink();
    if (BT.config.motion.reduced) return;
    if (!eyeGroup) return;

    var cfg = BT.config.character.blink;
    eyeGroup.classList.add('blink');
    window.setTimeout(function () {
      if (eyeGroup) eyeGroup.classList.remove('blink');
    }, cfg.downMs + cfg.upMs);
  }

  function scheduleSaccade() {
    if (!running) return;
    var cfg = BT.config.character.saccade;
    saccadeTimer = window.setTimeout(doSaccade, BT.util.rand(cfg.minMs, cfg.maxMs));
  }

  function doSaccade() {
    if (!running) return;
    if (BT.config.motion.reduced) {
      setPupilOffset(0, 0);
      scheduleSaccade();
      return;
    }

    var cfg = BT.config.character.saccade;
    var max = cfg.maxOffset * intensity;
    var angle = Math.random() * Math.PI * 2;
    var r = Math.random() * max;
    var toX = Math.cos(angle) * r;
    var toY = Math.sin(angle) * r * 0.65;

    var driftX = pupilOffset.x + (toX - pupilOffset.x) * cfg.drift;
    var driftY = pupilOffset.y + (toY - pupilOffset.y) * cfg.drift;

    animatePupil(driftX, driftY, 240, BT.util.easeInOutCubic, function () {
      window.setTimeout(function () {
        animatePupil(toX, toY, 70, BT.util.easeOutCubic, function () {
          scheduleSaccade();
        });
      }, 120);
    });
  }

  function startIdle() {
    if (running) return;
    running = true;

    var dom = BT.services.dom;
    rig = dom.byId('characterRig');
    eyeGroup = dom.byId('eyeGroup');
    pupil = dom.byId('pupil');

    setRigIntensityVars();
    setPupilOffset(0, 0);

    scheduleBlink();
    scheduleSaccade();
  }

  function stopIdle() {
    running = false;
    clearTimers();
    cancelAnim();
    if (eyeGroup) eyeGroup.classList.remove('blink');
    setPupilOffset(0, 0);
  }

  function setIntensity(mult) {
    intensity = typeof mult === 'number' && isFinite(mult) ? BT.util.clamp(mult, 0.6, 1.8) : 1;
    setRigIntensityVars();
  }

  BT.services.characterAnim = {
    startIdle: startIdle,
    stopIdle: stopIdle,
    setIntensity: setIntensity,
  };
})();
