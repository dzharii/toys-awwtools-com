(function (B) {
  if (!B.guardInit('scheduler')) return;

  const cfg = B.config;
  const tickers = new Set();
  let rafId = null;
  let layoutTimer = null;

  function loop(timestamp) {
    tickers.forEach((fn) => fn(timestamp));
    rafId = requestAnimationFrame(loop);
  }

  function ensureLoop() {
    if (!rafId && tickers.size > 0) {
      rafId = requestAnimationFrame(loop);
    }
  }

  function addTick(fn) {
    tickers.add(fn);
    ensureLoop();
    return fn;
  }

  function removeTick(fn) {
    tickers.delete(fn);
    if (tickers.size === 0 && rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function scheduleLayoutUpdate(fn) {
    clearTimeout(layoutTimer);
    layoutTimer = setTimeout(() => {
      if (B.state.reducedMotion) {
        fn();
      } else {
        requestAnimationFrame(fn);
      }
    }, cfg.scheduler.layoutDebounce);
  }

  function setReducedMotion(flag) {
    B.state.reducedMotion = !!flag;
  }

  B.scheduler = { addTick, removeTick, scheduleLayoutUpdate, setReducedMotion };
})(window.BrainJoke);
