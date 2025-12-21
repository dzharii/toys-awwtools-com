# Development Decisions and Plan Log

This log captures the implementation plan, key decisions, and the rationale behind major changes made while implementing `spec-main.md`.

## Plan Used

1) Set up core files and layout
- Create `index.html`, `styles.css`, `app.js`, and `lessons.js`.
- Implement the two-column layout with fixed panel order and the header controls (theme toggle, reset all).
- Establish core state model, persistence, and default lesson state.

2) Build lesson data and visualization specs
- Populate 15 lessons (dp-01 to dp-15) with full statements, input schemas, examples, hints, and self-checks.
- Define visualization specs for each lesson with table type, size resolver, iteration order, dependencies, base cases, and output extraction.
- Provide initial code templates for tabulation and memoization.

3) Implement runtime UI behavior
- Input editor rendering, validation, and randomization.
- Hint drawer behavior with progressive reveal.
- State builder and transition builder with validation and dependency preview.
- Visualization system (table rendering, stepper, playback controls, reconstruction).
- Examples and self-checks, progress tracking, and localStorage persistence.

4) Generate practice templates
- Create `templates/js` and `templates/c99` with 15 problems each.
- Add header comments, function stubs, deterministic tests, random tests with reference solvers, and a test runner.
- Provide a README with exact run commands for JS and C99.

## Core Decisions and Rationale

### UI + Layout
- **Two-column layout with fixed panel order** to match spec-driven UX flow and keep mental model consistent across lessons.
- **System font stack** only, no external assets, to satisfy offline constraints.
- **High-contrast, light theme by default** with a manual dark toggle stored in `localStorage`.
- **Responsive stack under 960px** for mobile usability without altering panel order.

### State Model
- **Single global state object in `app.js`** (`state`) with per-lesson data, theme, and progress. This is serialized to `localStorage` on every meaningful change.
- **Runtime state separated from persisted state** for playback (steps, index, snapshots, output) to avoid storing large transient data.
- **Lesson reset vs reset-all**: reset lesson rebuilds only that lesson state; reset-all clears `localStorage` and reloads.

### Validation and Run States
- **Explicit run-state machine**: Editing → Ready → Running/Paused → Completed or Error. This ensures inputs lock while running and prevents invalid stepping.
- **Inline validation per input** with field-specific errors and a general error summary.
- **Lesson-specific validation hook** added for inputs with cross-field constraints (e.g., dp-12 weights/values length must match).

### Transition Builder
- **Constrained template editor** instead of free-form code; validated against allowed dependency offsets.
- **Allowed references derived from `visualizationSpec`** to keep the builder deterministic and safe.
- **Reset-to-default** lets users recover quickly from invalid transitions.

### Visualization Engine
- **Template engine (Engine A) only** to keep deterministic and offline, per spec. Code engine is intentionally omitted; code is read-only with a copy button and UI notice.
- **Step list as source of truth** to ensure visualization does not depend on runtime evaluation order.
- **Status highlights**: current write, dependency reads, base, computed, unreachable, and error.
- **Reduced motion support** disables animations and steps immediately on Play when the user prefers reduced motion.

### Reconstruction
- **Optional reconstruction toggle** for lessons that naturally support predecessor paths (e.g., min path sum, LCS, LIS, word break).
- **Stored predecessor pointers** during step generation to avoid recomputation.

### 0/1 Knapsack Pitfall Demo
- **1D optimized view toggle** with direction selector. Descending iteration is the correct approach; ascending is labeled a pitfall.
- **Built-in failure example** text included to explain why ascending is wrong.

### Examples and Progress
- **Run Example** loads inputs and expected outputs, then shows pass/fail after completion.
- **Progress markers**: Not Started → In Progress when user edits or reveals hints, and Completed after passing a run example.

## Notable Implementation Choices

- **Dependency preview** renders a 3x3 grid and adapts for 1D vs 2D offset patterns to match spec guidance.
- **Transition validation** for 1D and 2D transitions ensures exactly one dp cell is written and only allowed dependencies are read.
- **Input randomization** respects bounds and ensures dp-12 weights/values have matching lengths.
- **Example output display** includes expected vs actual comparison when available.

## Template Files (JS and C99)

### JS Templates
- **Single file per problem** with a `solve(...)` stub, reference solver for random tests, deterministic tests, and a minimal test runner.
- **Deterministic PRNG** (LCG) used for random tests to keep runs repeatable.
- **Random tests bounded** to match spec safety requirements.

### C99 Templates
- **Single file per problem** with `solve(...)` stub, reference solver, and ad hoc tests.
- **No GCC nested functions** used; recursive or helper functions are implemented as static functions with module-level state for compatibility.
- **Memory safety**: all heap allocations freed in tests and reference implementations.

## Issues Found and Fixed

- **Syntax error in `app.js`** due to leftover patch markers in the dependency preview function; removed invalid tokens.
- **Nested template literal collision in `lessons.js`**: `const key = \`${i},${s}\`` inside backticks broke parsing. Replaced with string concatenation in all memoization templates.
- **C99 word break tests** originally emitted invalid identifiers; corrected to use proper dictionary arrays.
- **C99 0/1 knapsack tests** missing `n` argument; fixed calls to include length.

## Final File Inventory

- `index.html`: page layout and panel structure.
- `styles.css`: theme, layout, panels, visualization, and controls.
- `app.js`: state, rendering, validation, controls, visualization engine, persistence.
- `lessons.js`: lesson catalog, examples, hints, specs, and step generators.
- `templates/js/*.js`: 15 JS practice templates.
- `templates/c99/*.c`: 15 C99 practice templates.
- `templates/README.md`: run instructions for all templates.

## Follow-Up Ideas (Optional)

1) Add optional deep-linking to a lesson via URL hash.
2) Add a minimal export/import of per-lesson state JSON for offline sharing.
3) Implement a small snapshot toggle for Back/forward memory use on large grids.

