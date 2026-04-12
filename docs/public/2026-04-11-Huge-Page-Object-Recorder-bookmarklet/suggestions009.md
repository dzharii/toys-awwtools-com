2026-04-12

A00

Objective: establish a practical Bun DOM-integration testing layer for this bookmarklet project using Bun's documented Happy DOM preload model, then ship a first reliable wave of real-DOM tests.

B00

Primary references used.

[1] Bun DOM testing docs: Happy DOM registrator + preload pattern, advanced setup mocks, and cleanup guidance.
https://bun.com/docs/test/dom

[2] Bun lifecycle docs: global setup/teardown hooks via preload file.
https://bun.com/docs/test/lifecycle

[3] Bun guide: "Write browser DOM tests with Bun and happy-dom" (same recommended preload shape).
https://bun.com/guides/test/happy-dom

[4] Happy DOM wiki: setup as test environment, Bun compatibility notes, and global registrator guidance.
https://github.com/capricorn86/happy-dom/wiki/Setup-as-Test-Environment

C00

Rollout plan (pragmatic and staged).

Phase 1 (implemented now):
1. Add Bun preload configuration for DOM test environment.
2. Register Happy DOM globally before tests.
3. Add minimal shared shims (`ResizeObserver`, `matchMedia`, clipboard write stub).
4. Add global DOM cleanup after each test.
5. Add first real-DOM fixture builders and initial DOM suites for high-value surfaces.
6. Adjust source code where fake-object assumptions blocked real DOM behavior.

Phase 2 (next):
1. Expand fixture catalog (form, dialog, noisy surface, repeated collection page).
2. Add DOM suites for `heuristics.js`, `regions.js`, `export.js`, and a constrained `overlay.js` smoke layer.
3. Convert repeated scenarios into data-driven tables.
4. Keep assertions behavioral (stable authored selectors / coverage signals), not brittle string snapshots.

D00

Implemented changes in this repository.

1. Bun preload wiring
- Added `bunfig.toml`:
  - `[test]`
  - `preload = ["./test/setup/happydom.js"]`

2. Global DOM test setup
- Added `test/setup/happydom.js`:
  - `GlobalRegistrator.register()`
  - Shim `ResizeObserver` when missing
  - Shim `window.matchMedia` when missing
  - Stub `navigator.clipboard.writeText` when missing
  - `afterEach()` cleanup for `document.body` and `document.head`

3. Real-DOM fixture infrastructure
- Added `test/dom/fixtures/pages.js`:
  - `placeRect()` to provide deterministic geometry
  - `makeChatPage()`
  - `makeNavigationPage()`
  - `makeDecorativeIcon()`

4. New DOM integration tests
- Added `test/dom/features.dom.test.js`
  - validates authored attributes (`data-*`, `aria-*`) from real DOM
  - validates descendant summary collection via `querySelectorAll`
  - validates repeated link detection from navigation DOM
  - validates empty-string `disabled` attribute handling
  - validates computed-style visibility fallback

- Added `test/dom/scanner.dom.test.js`
  - validates scanner discovers meaningful controls in real DOM
  - validates ignored overlay nodes are excluded
  - validates decorative `aria-hidden` nodes are excluded

- Added `test/dom/selectors.dom.test.js`
  - validates selector generation against real `document.querySelectorAll`
  - validates manual selector mode with XPath type

5. Source updates required for real DOM correctness
- Updated `src/features.js`:
  - `isElementDisabled()` now handles present-but-empty `disabled` attributes (`hasAttribute`)
  - `isElementVisible()` now supports computed-style fallback without misclassifying empty opacity values
  - `collectNamedAttributes()` now supports real `NamedNodeMap` attributes
  - descendant summaries now work from either synthetic `element.descendants` or real `querySelectorAll("*")`
  - descendant role/contenteditable checks now use DOM-safe attribute readers

E00

Verification run.

Command:
`bun test`

Result:
- 47 passing
- 0 failing

This confirms the preload setup, new DOM suites, and compatibility with all existing tests.

F00

Scope boundaries kept intentionally.

This implementation does not try to force pixel/layout fidelity, exact rendering behavior, or full browser hit-testing parity. It targets logic-level DOM confidence in the areas where Happy DOM is strong, consistent with Bun's DOM testing guidance [1][3].

G00

Recommended next step for the next change request.

Expand DOM coverage with fixture matrices for `heuristics`, `regions`, and `overlay` structural flows while keeping tests deterministic through authored geometry and cleanup discipline.
