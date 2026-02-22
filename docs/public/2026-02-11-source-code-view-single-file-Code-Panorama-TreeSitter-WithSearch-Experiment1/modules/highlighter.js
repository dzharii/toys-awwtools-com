/**
 * Creates a lazy syntax-highlighting controller for code blocks.
 * It highlights when blocks become visible, retries bounded times when microlight loads late, and keeps per-element work idempotent.
 *
 * Side effects include observer registration, retry timer scheduling, and dataset or class updates on observed nodes.
 * The options object controls retry timing and observer sensitivity.
 *
 * @returns {{observe(code: HTMLElement): void, disconnect(): void, attemptHighlight(code: HTMLElement, attempt: number): void, highlightCodeBlock(code: HTMLElement): boolean}} Highlighter API.
 */
export function createCodeHighlighter({
  retryDelayMs = 1800,
  maxRetries = 3,
  pendingClassPrefix = "microlight-pending",
  rootMargin = "0px",
  threshold = 0,
  getNextSequence = () => Date.now(),
} = {}) {
  let observer = null;
  const retryTimers = new WeakMap();
  const activeTimers = new Set();

  /**
   * Clears pending retry state for one code element.
   * Invariant: after this call, the element has no queued retry timer.
   */
  function clearRetry(code) {
    const timer = retryTimers.get(code);
    if (!timer) return;
    clearTimeout(timer);
    activeTimers.delete(timer);
    retryTimers.delete(code);
  }

  /**
   * Attempts immediate highlighting for a single code block.
   * Returns false when highlighting is unavailable so callers can retry safely.
   */
  function highlightCodeBlock(code) {
    const microlight = window.microlight;
    if (!microlight || typeof microlight.reset !== "function" || !code)
      return false;
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

  /**
   * Schedules the next bounded retry for a code block that could not be highlighted yet.
   */
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

  /**
   * Drives highlight lifecycle for one code element until success or retry limit.
   */
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

  /**
   * Lazily creates the intersection observer so many observe calls stay cheap.
   */
  function ensureObserver() {
    if (observer) return;
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const target = entry.target;
          if (target.dataset.hasBeenHighlighted === "true") {
            observer.unobserve(target);
            return;
          }
          attemptHighlight(target, 0);
        });
      },
      { rootMargin, threshold },
    );
  }

  /**
   * Starts tracking a code element and triggers immediate work when already visible.
   */
  function observe(code) {
    if (!code) return;
    ensureObserver();
    if (!code.dataset.hasBeenHighlighted)
      code.dataset.hasBeenHighlighted = "false";
    observer.observe(code);
    const rect = code.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight || 0;
    if (rect.bottom > 0 && rect.top < vh) {
      attemptHighlight(code, 0);
    }
  }

  /**
   * Releases observer and timers so no highlight work remains pending.
   */
  function disconnect() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    activeTimers.forEach((timer) => clearTimeout(timer));
    activeTimers.clear();
  }

  return {
    observe,
    disconnect,
    attemptHighlight,
    highlightCodeBlock,
  };
}
