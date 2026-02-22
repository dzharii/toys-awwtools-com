2026-02-21

A00 Request: Replace existing JSDoc with essential intent-focused documentation across specified modules

A01 Scope and files to modify
Apply the documentation changes described below to these files only:

modules/app-runtime.js
modules/dom-elements.js
modules/file-helpers.js
modules/file-references.js
modules/highlighter.js
modules/line-index.js
modules/persistence.js
modules/runtime/panels-controller.js
modules/runtime/preview-controller.js
modules/runtime/references-controller.js
modules/runtime/runtime-context.js
modules/runtime/search-controller.js
modules/runtime/symbol-controller.js
modules/runtime/toc-controller.js
modules/runtime/tree-sitter-controller.js
modules/search-helpers.js
modules/symbol-references.js
modules/tree-sitter-helpers.js

A02 Goal
Replace the current JSDoc comments with a more thoughtful version that improves readability by stating purpose and value. Comments must explain what the code does and why it exists, not how it is implemented. Prefer fewer, higher-signal comments over many low-value comments.

A03 What "good" looks like
Write essential comments that help a reader understand intent and contract quickly. Keep comments short for small helpers, and only use detailed JSDoc for public entry points, exported functions, and factory/controller-style functions with meaningful lifecycle or side effects.

Focus on these kinds of information:

* Purpose: what the function/module is responsible for, in one sentence.
* Value/why: why this exists in the system, what problem it solves.
* Contract: key inputs/outputs, observable side effects, lifecycle expectations.
* Invariants: critical "always/never" facts (idempotent behavior, bounded retries, caching semantics, cleanup requirements).
* Failure behavior at a high level (non-fatal, returns false, no-ops on missing deps), without describing control flow.

Avoid these kinds of information:

* Step-by-step descriptions of the implementation.
* Comments that restate the function name or obvious code.
* Excessive parameter narration for internal helpers.
* Redundant comments on every line or block.

A04 Editing rules

* Replace existing JSDoc in the files within scope with the new style. Remove low-value comments that only label a block.
* Do not change runtime behavior. This task is documentation-only.
* Keep comments consistent across modules: same tone, same idea of "essential".
* Use ASCII punctuation only.
* Prefer full sentences and short paragraphs over heavily structured formatting.
* Do not introduce nested markdown lists in any generated documentation text (this instruction applies to any new doc blocks you add).

A05 Decision guide for how much to document

* Exported function, module entry point, controller/factory returning an API: provide a JSDoc header that includes purpose, key contract notes, and only the most important options/return shape.
* Small internal helper: use a 1-2 sentence block comment only if the purpose is not obvious from the name. Include one contract/invariant if it prevents misuse.
* Data structures or state (observer, maps, caches): comment only when the reason it exists is not obvious (for example, tracking timers so disconnect can cancel pending work).

A06 Approved example to follow: modules/highlighter.js (use this style as the reference)
Use the following as the reference style for how to balance "factory-level detail" with "helper-level brevity". Apply the same principles across the other modules in scope.

```js
/**
 * Creates a lazy syntax-highlighting controller for <code> blocks.
 *
 * Design intent:
 * - Highlight only when a block is visible (IntersectionObserver) to reduce upfront work.
 * - Tolerate late-loading `window.microlight` by retrying a bounded number of times.
 * - Make highlighting idempotent per element using `data-has-been-highlighted`.
 *
 * Side effects:
 * - Adds/removes CSS classes on the observed element ("microlight" and a temporary pending class).
 * - Writes `code.dataset.hasBeenHighlighted` as "false" or "true".
 * - Allocates an IntersectionObserver and schedules timers for retries.
 *
 * Requirements:
 * - Browser environment with IntersectionObserver.
 * - A global `window.microlight.reset(className)` function when highlighting is possible.
 *
 * @param {Object} [options]
 * @param {number} [options.retryDelayMs=1800]
 *   Base delay for retry attempts when microlight is not available. Effective delay grows with attempt.
 * @param {number} [options.maxRetries=3]
 *   Max number of retry attempts per element before giving up.
 * @param {string} [options.pendingClassPrefix="microlight-pending"]
 *   Prefix for a temporary class used to target a single element when calling microlight.reset.
 * @param {string} [options.rootMargin="0px"]
 *   IntersectionObserver rootMargin; increase to highlight slightly before a block enters view.
 * @param {number|number[]} [options.threshold=0]
 *   IntersectionObserver threshold.
 * @param {() => number|string} [options.getNextSequence=() => Date.now()]
 *   Produces a unique suffix for the pending class to avoid collisions across elements.
 *
 * @returns {{
 *   observe(code: HTMLElement): void,
 *   disconnect(): void,
 *   attemptHighlight(code: HTMLElement, attempt: number): void,
 *   highlightCodeBlock(code: HTMLElement): boolean
 * }}
 *   observe: start tracking an element and attempt an immediate highlight if already in view.
 *   disconnect: stop observing and cancel all pending retry timers.
 *   attemptHighlight/highlightCodeBlock are exposed for advanced use and testing.
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
   * Cancels any scheduled retry for this element.
   * Invariant: after this runs, the element has no pending timer tracked in retryTimers.
   */
  function clearRetry(code) {}

  /**
   * Attempts to highlight one code block immediately.
   *
   * Returns true only when microlight was present and successfully applied highlighting.
   * Failure is non-fatal: errors are logged and the caller may choose to retry.
   */
  function highlightCodeBlock(code) {}

  /**
   * Schedules a bounded retry with increasing delay.
   * Purpose: handle cases where microlight loads after the code block becomes visible.
   */
  function scheduleRetry(code, attempt) {}

  /**
   * Drives the highlight lifecycle for a single element.
   * Guarantee: once an element is marked highlighted, it is unobserved and never retried again.
   */
  function attemptHighlight(code, attempt) {}

  /**
   * Lazily creates the IntersectionObserver once, so consumers can call observe many times cheaply.
   */
  function ensureObserver() {}

  /**
   * Starts observing a code element and triggers an immediate attempt if it is already visible.
   * Idempotent behavior: repeated calls will not re-highlight once data flag is true.
   */
  function observe(code) {}

  /**
   * Stops all work and releases resources.
   * Guarantee: after disconnect, no observers remain and no pending retry timers will fire.
   */
  function disconnect() {}

  return {
    observe,
    disconnect,
    attemptHighlight,
    highlightCodeBlock,
  };
}
```

A07 Module-level guidance
For each file in scope, add or revise a short top-level module comment only if it improves orientation for a new reader. Keep it to 1-2 sentences about responsibility and value.

Example pattern:

```js
/**
 * Runtime context orchestration for the app.
 * Centralizes state and wiring needed by runtime controllers.
 */
```

Do not add module headers that simply repeat the filename.

A08 Acceptance criteria

* Existing JSDoc in the listed files is replaced with the new intent-first style.
* Comments are fewer but more informative; obvious "label" comments are removed.
* Exported/public entry points have clear purpose and contract notes.
* Internal helpers have minimal comments, only where they add non-obvious intent or constraints.
* No functional code changes beyond comment edits.

A09 Deliverable
Provide a patch that updates only the listed files and only documentation (comments and JSDoc).
