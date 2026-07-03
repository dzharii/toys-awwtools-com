// Accessibility helpers: reduced-motion detection, focus trapping for the
// settings dialog, and the keyboard shortcut reference text.

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Current system reduced-motion preference. */
export function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Subscribe to system reduced-motion changes. Returns an unsubscribe fn. */
export function onReducedMotionChange(handler) {
  if (!window.matchMedia) return () => {};
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const listener = (e) => handler(e.matches);
  if (mq.addEventListener) mq.addEventListener("change", listener);
  else if (mq.addListener) mq.addListener(listener);
  return () => {
    if (mq.removeEventListener) mq.removeEventListener("change", listener);
    else if (mq.removeListener) mq.removeListener(listener);
  };
}

export function getFocusable(container) {
  return Array.from(container.querySelectorAll(FOCUSABLE)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement
  );
}

/**
 * Trap focus inside a container (for the settings dialog).
 * Returns a release function that also restores focus to the prior element.
 */
export function trapFocus(container) {
  const previouslyFocused = document.activeElement;
  const focusable = getFocusable(container);
  if (focusable.length) focusable[0].focus();

  const onKeydown = (e) => {
    if (e.key !== "Tab") return;
    const items = getFocusable(container);
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  container.addEventListener("keydown", onKeydown);

  return function release() {
    container.removeEventListener("keydown", onKeydown);
    if (previouslyFocused && typeof previouslyFocused.focus === "function") {
      previouslyFocused.focus();
    }
  };
}

export const KEYBOARD_REFERENCE = [
  ["→ / Space", "Next page"],
  ["← / Shift+Space", "Previous page"],
  ["PageDown / PageUp", "Scroll or page"],
  ["Home / End", "Start / end"],
  ["S", "Open settings"],
  ["O", "Open file"],
  ["Esc", "Close settings"],
];
