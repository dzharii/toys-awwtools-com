/**
 * Lifecycle manager. Central registry for every listener, observer, timer, and
 * disposable the app creates, plus the lifecycle state string. cleanup() tears
 * everything down so close() leaves no lingering UI, timers, or observers.
 */

export function createLifecycle(state) {
  const disposers = [];
  let closed = false;

  function setState(next) {
    if (state && state.app) state.app.lifecycle = next;
  }

  /** Register a teardown function. Returns the function for convenience. */
  function register(disposeFn) {
    if (typeof disposeFn === "function") disposers.push(disposeFn);
    return disposeFn;
  }

  /** Register a DOM listener and its removal in one call. */
  function addListener(target, type, handler, options) {
    target.addEventListener(type, handler, options);
    register(() => {
      try {
        target.removeEventListener(type, handler, options);
      } catch (_e) {
        /* ignore */
      }
    });
  }

  /** Register a MutationObserver for disconnection on cleanup. */
  function trackObserver(observer) {
    register(() => {
      try {
        observer.disconnect();
      } catch (_e) {
        /* ignore */
      }
    });
    return observer;
  }

  function cleanup() {
    if (closed) return;
    closed = true;
    setState("closing");
    // Dispose in reverse registration order.
    for (let i = disposers.length - 1; i >= 0; i--) {
      try {
        disposers[i]();
      } catch (_e) {
        /* fail open on cleanup */
      }
    }
    disposers.length = 0;
  }

  function isClosed() {
    return closed;
  }

  return { register, addListener, trackObserver, cleanup, setState, isClosed };
}
