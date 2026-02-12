export function createCodeHighlighter({
  retryDelayMs = 1800,
  maxRetries = 3,
  pendingClassPrefix = "microlight-pending",
  rootMargin = "0px",
  threshold = 0,
  getNextSequence = () => Date.now()
} = {}) {
  let observer = null;
  const retryTimers = new WeakMap();
  const activeTimers = new Set();

  function clearRetry(code) {
    const timer = retryTimers.get(code);
    if (!timer) return;
    clearTimeout(timer);
    activeTimers.delete(timer);
    retryTimers.delete(code);
  }

  function highlightCodeBlock(code) {
    const microlight = window.microlight;
    if (!microlight || typeof microlight.reset !== "function" || !code) return false;
    const tempClass = `${pendingClassPrefix}-${getNextSequence()}`;
    code.classList.add("microlight");
    code.classList.add(tempClass);
    try {
      microlight.reset(tempClass);
      code.dataset.hasBeenHighlighted = "true";
      return true;
    } catch (err) {
      console.warn("Microlight failed to highlight a block", err);
      return false;
    } finally {
      code.classList.remove(tempClass);
    }
  }

  function scheduleRetry(code, attempt) {
    if (!code || code.dataset.hasBeenHighlighted === "true") return;
    clearRetry(code);
    const delay = retryDelayMs * (attempt + 1);
    const timer = setTimeout(() => {
      activeTimers.delete(timer);
      retryTimers.delete(code);
      attemptHighlight(code, attempt + 1);
    }, delay);
    activeTimers.add(timer);
    retryTimers.set(code, timer);
  }

  function attemptHighlight(code, attempt) {
    if (!code) return;
    if (code.dataset.hasBeenHighlighted === "true") {
      clearRetry(code);
      observer?.unobserve(code);
      return;
    }
    const highlighted = highlightCodeBlock(code);
    if (highlighted) {
      clearRetry(code);
      observer?.unobserve(code);
      return;
    }
    if (attempt < maxRetries) {
      scheduleRetry(code, attempt);
    }
  }

  function ensureObserver() {
    if (observer) return;
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const target = entry.target;
        if (target.dataset.hasBeenHighlighted === "true") {
          observer.unobserve(target);
          return;
        }
        attemptHighlight(target, 0);
      });
    }, { rootMargin, threshold });
  }

  function observe(code) {
    if (!code) return;
    ensureObserver();
    if (!code.dataset.hasBeenHighlighted) code.dataset.hasBeenHighlighted = "false";
    observer.observe(code);
    const rect = code.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight || 0;
    if (rect.bottom > 0 && rect.top < vh) {
      attemptHighlight(code, 0);
    }
  }

  function disconnect() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    activeTimers.forEach(timer => clearTimeout(timer));
    activeTimers.clear();
  }

  return {
    observe,
    disconnect,
    attemptHighlight,
    highlightCodeBlock
  };
}
