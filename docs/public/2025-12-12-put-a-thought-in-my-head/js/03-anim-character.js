(function (B) {
  if (!B.guardInit('animCharacter')) return;

  const dom = B.dom;
  const cfg = B.config;

  let tickHandle = null;
  let rafFallback = null;
  let blinkTimer = null;
  let saccadeTimer = null;
  let intensity = 1;
  let startTime = null;

  const head = () => dom.get('headBob');
  const root = () => dom.get('characterRoot');
  const pupil = () => dom.get('pupil');
  const eyelid = () => dom.get('eyelid');

  function updateTransforms(t) {
    if (!startTime) startTime = t;
    const elapsed = (t - startTime) || 0;
    const motionScale = B.state.reducedMotion ? 0.2 : 1;
    const wiggle = B.state.wiggle ? 1.45 : 1;

    const bobAmp = cfg.animation.idleBobPx * intensity * wiggle * motionScale;
    const swayAmp = cfg.animation.idleSwayDeg * intensity * wiggle * motionScale;

    const bobY = Math.sin(elapsed / 1200) * bobAmp;
    const swayDeg = Math.sin(elapsed / 1700) * swayAmp;

    const h = head();
    const r = root();
    if (h) h.style.transform = `translateY(${bobY.toFixed(2)}px)`;
    if (r) r.style.transform = `rotate(${swayDeg.toFixed(2)}deg)`;
  }

  function tick(timestamp) {
    updateTransforms(timestamp);
    if (!B.scheduler) {
      rafFallback = requestAnimationFrame(tick);
    }
  }

  function scheduleBlink() {
    clearTimeout(blinkTimer);
    const delay = 2000 + Math.random() * 3000;
    blinkTimer = setTimeout(() => {
      const lid = eyelid();
      if (lid) {
        lid.classList.remove('blink');
        // force reflow so blink retriggers reliably
        // eslint-disable-next-line no-unused-expressions
        lid.offsetWidth;
        lid.classList.add('blink');
      }
      scheduleBlink();
    }, delay);
  }

  function scheduleSaccade() {
    clearTimeout(saccadeTimer);
    const delay = 800 + Math.random() * 1700;
    saccadeTimer = setTimeout(() => {
      const p = pupil();
      if (p) {
        const hop = cfg.animation.pupilHop;
        const wiggle = B.state.wiggle ? 1.4 : 1;
        const x = (Math.random() * 2 - 1) * hop * wiggle;
        const y = (Math.random() * 2 - 1) * (hop * 0.6) * wiggle;
        p.style.transition = 'transform 180ms ease';
        p.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      }
      scheduleSaccade();
    }, delay);
  }

  function startIdle() {
    if (tickHandle || rafFallback) return;

    const schedule = B.scheduler && B.scheduler.addTick;
    if (schedule) {
      tickHandle = (t) => updateTransforms(t);
      B.scheduler.addTick(tickHandle);
    } else {
      rafFallback = requestAnimationFrame(tick);
    }
    scheduleBlink();
    scheduleSaccade();
  }

  function stopIdle() {
    if (tickHandle && B.scheduler) {
      B.scheduler.removeTick(tickHandle);
      tickHandle = null;
    }
    if (rafFallback) {
      cancelAnimationFrame(rafFallback);
      rafFallback = null;
    }
    clearTimeout(blinkTimer);
    clearTimeout(saccadeTimer);
    blinkTimer = null;
    saccadeTimer = null;
  }

  function setIntensity(value) {
    intensity = value;
  }

  B.animCharacter = { startIdle, stopIdle, setIntensity };
})(window.BrainJoke);
