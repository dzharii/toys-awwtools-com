2026-02-21

A00 App.js refactor specification: extract UI and feature logic into modules

A00.01 Goal
Refactor the current app.js, which is a large, multi-responsibility file, into a set of focused modules under modules/ (and optionally additional folders) so that app.js becomes primarily a top-level bootstrap and glue layer. The target size for app.js after refactor is 200 to 400 lines, excluding imports. The refactor must preserve existing runtime behavior and UI features.

A00.02 Non-goals
Do not change product behavior, feature set, or UX flows as part of this refactor, except where small changes are required to keep behavior identical while moving code. Do not redesign the visual layout. Do not introduce new dependencies unless strictly necessary.

A00.03 Constraints
This is a browser-based single page application. Some logic necessarily interacts with DOM and browser APIs; the refactor must improve testability by isolating pure logic from DOM operations and by wrapping DOM access behind explicit modules. The refactor must keep load performance and responsiveness at least as good as current behavior. Keep interfaces stable for existing modules where possible, and prefer additive changes over breaking changes unless app.js is the only caller.

B00 Current signals in the codebase
B00.01 Existing module style
There is already a modules/ folder with helper-style modules such as config.js, dom-elements.js, file-helpers.js, search-helpers.js, persistence.js, highlighter.js, file-references.js, symbol-references.js, and tree-sitter-helpers.js. These modules suggest a direction: utilities and feature-specific helpers live in modules/ while app.js orchestrates.

B00.02 App.js likely responsibilities to extract
Based on the product shape and the existing module set, app.js likely contains several categories of code that are candidates for extraction: DOM querying and element caching, UI state management for panels and toggles, event binding and event handlers, file loading and incremental processing pipelines, search UI and search execution glue, Tree-sitter window UI and dispatch, preview UI and interactions, logging and stats rendering, navigation tree rendering and selection, and cross-feature state wiring.

B00.03 Refactor objective for testability
The new structure should isolate pure functions (inputs to outputs) away from the DOM, and isolate browser effects (DOM mutations, localStorage, clipboard, file system access, timers, IntersectionObserver) behind explicit boundaries. This enables unit testing of core logic with minimal mocking.

C00 Proposed architecture and module boundaries
C00.01 App.js as a thin composition root
After refactor, app.js should do only the following: create the app-wide state container, obtain DOM element references via getDomElements, initialize feature controllers with dependencies, connect controllers through a small number of explicit events/callbacks, register top-level event listeners, and start initial render. App.js should not contain large blocks of UI manipulation, and it should not implement heavy business logic directly.

C00.02 Prefer feature controllers over scattered functions
For UI-heavy features, create controller modules that own their sub-state and expose a small interface. A controller can be implemented as a factory function returning an object with methods, or as a class if that fits existing style. The controller should accept dependencies explicitly, including dom elements it needs, configuration, and a shared app event bus (or callback hooks), so it is testable.

C00.03 Suggested modules to introduce or expand
This section describes intended boundaries. Codex must confirm exact extraction points by inspecting app.js and adjusting names to match the codebase conventions.

C00.03.01 modules/ui-root.js
Purpose: centralize DOM element acquisition and minimal shared UI operations. This likely wraps getDomElements and provides small helpers like show/hide, enable/disable, setText, setHtml, toggleClass, and safe query wrappers. It must not include feature logic.

C00.03.02 modules/panels-controller.js
Purpose: manage open/close/minimize state for panels such as settings, stats, log, preview, tree-sitter window, TOC, and search. This should be a thin state machine per panel with DOM effects. This removes scattered toggling code from app.js.

C00.03.03 modules/files-controller.js
Purpose: orchestrate file loading, file inventory updates, and file selection. It should depend on lower-level helpers (file-helpers, file-references, persistence) and publish events such as onFilesLoaded, onFileSelected, onActiveFileChanged. It should not render the file tree itself; it should provide the data model.

C00.03.04 modules/tree-controller.js
Purpose: render and manage the project tree UI (navigator). It should accept a tree model and handle selection, expansion, pin/unpin, resizing, and updates. The goal is to remove tree DOM manipulation from app.js.

C00.03.05 modules/viewer-controller.js
Purpose: manage the main code viewer area for active file rendering, line gutters, highlighting integration, scroll, and jump-to-line operations. It should use createCodeHighlighter and any line mapping utilities. It should expose methods like renderFile(file), scrollToLine(lineNumber), and applyDecorations(fileId).

C00.03.06 modules/search-controller.js
Purpose: manage search UI state, query validation, mode toggles, running/canceling, and rendering results into the DOM. It should rely on search-helpers for validation and matchers, and consume the file inventory from files-controller. It should publish onNavigateToResult(fileId, lineNumber, startCol, endCol).

C00.03.07 modules/toc-controller.js
Purpose: manage TOC panel behavior and filtering, and provide navigation into the viewer. If TOC uses Tree-sitter outlines, it should consume outline models from tree-sitter-specific modules and handle UI only.

C00.03.08 modules/stats-controller.js and modules/log-controller.js
Purpose: isolate stats computation/rendering and log rendering. Stats computation should be pure where possible and separate from DOM.

C00.03.09 modules/settings-controller.js
Purpose: settings panel UI and persistence integration. It should wrap persistence.loadSettings/saveSettings and update defaults, allow/ignore lists, toggles, and numeric limits. It should publish onSettingsChanged with a normalized settings object.

C00.03.10 modules/tree-sitter-controller.js (if not already present)
Purpose: Tree-sitter window state, initialization, language loading, parse triggers, outline/include views, and status indicators. This should consume persistence.loadTreeSitterState/saveTreeSitterState, TREE_SITTER_LANGUAGES config, and tree-sitter-helpers. UI operations remain here, not in app.js.

D00 Codex research tasks and refactor method
D00.01 Inventory app.js responsibilities
Codex must open app.js and produce an internal map of responsibilities by feature. The deliverable is a short refactor plan with approximate line ranges and which new module will own each block. The goal is to avoid moving code blindly and to ensure no responsibilities are missed.

D00.02 Define an explicit shared state shape
Codex must identify the current global state variables in app.js. Replace implicit globals with a single shared appState object passed to controllers, or with per-controller state encapsulated in each controller. The preferred direction is to keep per-feature state inside controllers and keep appState as a small shared model containing: settings, files inventory, active file id/path, and feature-level status flags.

D00.03 Introduce a simple app event bus (optional but recommended)
If app.js currently wires features through direct function calls scattered across handlers, introduce a small event bus module that supports subscribe and emit. This reduces coupling between controllers. Keep the API minimal and synchronous unless existing behavior requires async. If the project already has an internal pattern for events, follow it.

D00.04 Extract modules incrementally with behavior-preserving steps
Codex must refactor in small steps to reduce risk. The recommended sequence is: extract DOM element access and common UI helpers, extract settings controller, extract stats and log controllers, extract panels controller, extract tree controller, extract viewer controller, extract search controller, and finally extract files controller orchestration. This order reduces the chance of breaking core navigation early while still shrinking app.js continuously.

D00.05 Ensure imports and exports remain clean
Each new module must export a single primary factory or class plus any small pure helpers. Avoid circular dependencies. If a circular dependency appears, resolve it by moving shared pure helpers into a lower-level utility module.

E00 Testing and verification requirements
E00.01 No-behavior-change checks
Codex must verify that the following workflows behave identically before and after refactor: loading a folder and building the project tree, selecting files and rendering in the viewer, opening and closing settings/stats/log panels, search execution and navigation to results, preview open behavior if present, and tree-sitter window open and any parsing triggers.

E00.02 Unit tests for extracted pure logic
When extracting non-DOM logic, Codex must add or extend unit tests where feasible. Focus areas that can be tested without a browser include: settings normalization and validation, stats calculation from file inventories, search matching and snippet building, and any model transforms for tree rendering.

E00.03 DOM-facing controllers should be structured for testability
Controllers should accept a doc parameter (document) or a dom adapter so they can be tested with a minimal DOM environment if the repo supports it. If there is no test harness for DOM, keep DOM logic thin and keep pure logic outside.

F00 Acceptance criteria
F00.01 App.js size and role
After refactor, app.js is between 200 and 400 lines and is primarily orchestration. It contains no large blocks of feature logic and minimal direct DOM manipulation beyond initial wiring.

F00.02 Module cohesion
Each major UI feature has a clear module owner with a small exported interface. Code is logically separated by feature responsibility, and low-level DOM effects are localized.

F00.03 Stability
All existing user-visible features continue to work. No new regressions in responsiveness during file loading, navigation, or panel interactions.

F00.04 Maintainability
The new module layout allows a developer to locate feature logic quickly. Cross-feature interactions are expressed through explicit interfaces or events rather than shared mutable globals spread across app.js.

G00 Deliverables
G00.01 Code changes
Codex must implement the refactor, creating new modules as needed, moving logic out of app.js, and updating imports. Existing helper modules may be extended, but app.js should not remain the place where new helpers are added.

G00.02 Developer notes
Codex must include a short refactor note in the final change description identifying: which controllers/modules were introduced, what responsibilities were moved, and any intentionally deferred cleanup items that were discovered but kept out-of-scope to avoid behavior changes.
