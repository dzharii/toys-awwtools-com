<!-- RetroOS UI v001 editable vendored framework source.
This file may be changed inside this repository, but changes should remain
generic, reusable, and suitable to merge back into the standalone RetroOS UI
framework. Do not add this browser extension's feature-specific business
logic here. Put project-specific integration in an adapter or bridge layer
outside src/vendor/retroos-ui-v001/. -->

# RetroOS UI v001 — Agent Instructions

This folder contains the editable vendored source for RetroOS UI v001.

This is **not** a frozen third-party dependency. The code belongs to this project and can be extended, fixed, or refactored when needed. Agents are allowed to edit files in this folder when the change is generic framework work: reusable components, reusable controllers, core helpers, framework bug fixes, accessibility improvements, keyboard/focus improvements, theme improvements, demo improvements, test improvements, documentation improvements, build fixes, or refactors that keep the framework reusable.

Keep this folder mergeable back to the standalone RetroOS UI repository. Preserve file names, component names, custom element names, public events, public attributes, public CSS parts, and internal directory structure unless a structural change is explicitly requested. Prefer small, reviewable framework improvements over large rewrites.

Do not hardcode this browser extension's feature-specific behavior into the framework. Do not add extension-only message names, extension-only storage schemas, reminder scheduling logic, session tab capture logic, link-preview business rules, project-specific settings schema, or one-off workflow assumptions directly into RetroOS UI.

When project-specific integration is needed, create or use a bridge layer outside this folder. The framework may expose generic hooks, providers, events, controllers, slots, or helper functions that make integration clean, but the project-specific adapter should live outside the vendored framework.

Generated distribution files should not be hand-edited unless the build/release workflow explicitly requires committed generated output.

## Build

Run inside this folder:

```sh
bun run build
```

Output goes to `dist/`. The build produces:
- `dist/bookmarklet/index.js` — the runtime bookmarklet bundle
- `dist/demo/catalog.js` — the component catalog demo bundle
- `dist/demo/storybook.js` — the component storybook bundle

Run the build after any source change to verify the output compiles without errors. A passing build is required before committing any framework change.

## Code comment conventions

**JavaScript — exported functions and public API:**
Add JSDoc to every exported function. Include what it does, its parameters, return value, and any side effects or constraints.

```js
/**
 * Shows a transient toast notification at the bottom of the overlay layer.
 * @param {object} opts
 * @param {string} opts.message - Text to display.
 * @param {'success'|'error'|'info'} [opts.tone='info'] - Visual tone.
 * @param {number} [opts.timeout=3000] - Auto-dismiss delay in ms. 0 = no auto-dismiss.
 */
export function showToast(opts) { ... }
```

**JavaScript — non-obvious behavior:**
Add inline comments explaining:
- Why a design choice was made (especially when it looks wrong but is intentional).
- Shadow DOM edge cases (e.g., portaling, slot mutation, host attribute reflection).
- Event bubbling and composition choices.
- Any timing or microtask dependency.

**CSS — section markers:**
Mark logical sections with block comments:

```css
/* --- Layout --- */
/* --- Typography --- */
/* --- State variants --- */
/* --- CSS custom properties --- */
```

**Component source files — public API header:**
At the top of each component JS file, after the imports, add a comment block listing the component's full public API:

```js
/**
 * awwbookmarklet-button
 *
 * Attributes:
 *   variant  — 'primary' | 'ghost' | '' (default/secondary)
 *   size     — 'small' | '' (default)
 *   disabled — boolean
 *
 * Events:
 *   (none — use native 'click')
 *
 * Slots:
 *   default — button label text or content
 *
 * CSS parts:
 *   button — the inner <button> element
 */
```

This comment is the single authoritative reference for the component's API within the source file. Keep it in sync when attributes, events, slots, or parts change.

## Documentation maintenance checklist

**Run this checklist whenever you add a new component or change an existing one:**

1. **JSDoc in component source** — Add or update the public API header comment (attributes, events, slots, CSS parts). Add JSDoc to any new or changed exported functions.

2. **Catalog** (`src/demo/catalog.js`) — If visual behavior changed (new variant, new state, layout change), add or update the relevant demo section so the change is visible in the catalog. Open `demo/index.html` in a browser to verify.

3. **Storybook** (`src/demo/storybook.js`) — Find the story for the changed component and update:
   - The `attrs` array if attributes were added, removed, or changed.
   - The `events` array if custom events changed.
   - The `slots` array if slots changed.
   - The `parts` array if CSS parts changed.
   - The `examples` array — add an example for any new variant or state.
   Open `storybook/index.html` in a browser to verify the story looks correct.

4. **New component only** — Register the component in `src/components/register-all.js`. Add a story to the correct category in `src/demo/storybook.js`. If a category does not fit, create a new one.

5. **Tests** (`test/`) — Add or update tests for any changed logic (attribute reflection, event dispatch, state management, helper functions). Avoid tests that require a real browser unless explicitly requested.

6. **Build** — Run `bun run build` inside this folder. Verify exit code 0 and that all three dist files are emitted.

Skipping any step risks the catalog, storybook, or tests drifting out of sync with the actual component behavior.

## Developer resources

**Component Catalog** — `demo/index.html` + `src/demo/catalog.js`
A workflow-oriented showcase of components organized by use case (Overview, Primitives, App Patterns, Content States, Command Surfaces, Theming, Migration Proof). Good for visual validation and seeing how components combine in real layouts. Loads `dist/demo/catalog.js`.

**Component Storybook** — `storybook/index.html` + `src/demo/storybook.js`
A developer and agent reference organized by component. Each entry includes: purpose description, usage note, all observed attributes, custom events, slots, CSS parts, and live renderable examples. Use the storybook to:
- Discover whether the framework has a component for a given need.
- Understand the full API before writing integration code.
- See rendered examples of every attribute variant.

Open `storybook/index.html` in a browser after running `bun run build`. Navigate with the sidebar or deep-link via URL hash (e.g., `storybook/index.html#dialog`, `storybook/index.html#button`).

When adding a new component, follow the Documentation maintenance checklist above.

