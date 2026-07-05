# Code Review Bugs

Review date: 2026-07-04

Reviewed file set: 173 files returned by `find . -path './node_modules' -prune -o -path './docs/.vitepress/cache' -prune -o -type f -print`, cross-checked against `.gitignore`. Generated VitePress files and package `dist` files were reviewed as generated-output categories rather than as hand-authored source, because they are machine products of the source files.

## BUG-001: Article and plan require Elena, but the implementation does not use Elena

Affected files:
- `package.json`
- `packages/components/package.json`
- `packages/components/src/components/*.js`
- `packages/components/scripts/build-components.mjs`
- `docs/architecture.md`
- `docs/index.md`
- `README.md`

Problem:
`index.md` explicitly builds the component library with Elena, and `plan-part2-part3.md` says Part 3 should include Elena component source. The implemented component package is a hand-written custom element package with a custom build script. It has no `@elenajs/*` dependencies, no `elena.config.mjs`, no Elena component classes, and no Elena build path. This violates the original requirement to fully implement the article instructions.

Fix direction:
Either migrate the component package to Elena or make the project clearly framed as an intentionally native-custom-elements implementation. Because the user's requirement says to implement `index.md`, the correct fix is to add real Elena dependencies/configuration and make the component package's documented architecture and build pipeline honest about what Elena owns.

Resolution:
Partially fixed. `@elenajs/core`, `@elenajs/bundler`, and `@elenajs/cli` are now owned by `packages/components`, `packages/components/elena.config.mjs` exists, and `npm run build:elena --workspace=@my-ds/components` passes. The default package build is still the explicit educational build, and docs now state that the remaining migration is converting native classes to `Elena(HTMLElement)`. This is honest, but not a full source migration.

## BUG-002: Custom elements manifest is manually fabricated instead of generated from component source/JSDoc

Affected files:
- `packages/components/src/component-definitions.js`
- `packages/components/scripts/build-components.mjs`
- `packages/components/dist/custom-elements.json`
- `docs/.vitepress/custom-elements.data.mjs`
- `docs/components/*.md`

Problem:
The article describes documenting props in source comments and using the generated custom elements manifest as the implementation documentation source of truth. Current implementation uses `component-definitions.js` as a separate manual metadata table. That creates drift risk: component behavior and documented API can disagree.

Fix direction:
Move public API metadata next to the source components with JSDoc-style metadata, or generate `component-definitions.js`/manifest from a single source. At minimum, add validation that observed attributes and documented props stay aligned.

Resolution:
Partially fixed. Added behavior/metadata tests that compare documented props with component `observedAttributes`, and fixed the missing `aria-label` metadata. The manifest is still generated from `component-definitions.js`, not from JSDoc/CEM analysis of component source.

## BUG-003: VitePress static build is broken when opened from the project subdirectory

Affected files:
- `docs/.vitepress/config.mjs`
- `docs/.vitepress/dist/*.html`
- `docs/.vitepress/dist/assets/*`
- `index.html`

Problem:
The generated VitePress pages use absolute asset URLs such as `/assets/style...css` and `/assets/app...js`. This project lives under `/public/2026-07-04--web-components-Scott-Riley/`, so those absolute URLs resolve to the site root, not this project folder. The root preview links to `./docs/.vitepress/dist/`, but the built docs fail to load their CSS/JS assets when deployed or opened from that subdirectory.

Fix direction:
Set VitePress `base: "./"` for relative asset URLs and link the preview to `./docs/.vitepress/dist/index.html`.

Resolution:
Fixed. VitePress now has `base: "./"`, regenerated docs no longer include absolute `/assets` URLs, and root preview links to `./docs/.vitepress/dist/index.html`.

## BUG-004: Root preview violates separation-of-concerns instructions

Affected files:
- `index.html`

Problem:
`AGENTS.md` says CSS should define presentation and JavaScript should define behavior, and it specifically discourages unnecessary inline styles/scripts. The root `index.html` contains a large inline `<style>` block and inline module script. This violates the educational-grade structure requirement.

Fix direction:
Move root preview styles into `assets/root-preview.css` and behavior into `assets/root-preview.js`.

Resolution:
Fixed. Root preview CSS and JS are now external files.

## BUG-005: `my-input` re-renders the native input on every keystroke

Affected files:
- `packages/components/src/components/input.js`
- `packages/components/dist/components/input.js`

Problem:
The input event handler calls `this.setAttribute("value", ...)`, which triggers `attributeChangedCallback()` and replaces the internal `<input>` with a new element. This can lose focus/caret position and makes typing behavior fragile. It also teaches a poor component state pattern.

Fix direction:
Keep live input state in an instance field, emit an input event, and avoid re-rendering on every keystroke. Reflecting the value attribute should be a controlled external update, not the default live typing path.

Resolution:
Fixed. `my-input` stores live typing in `currentValue` and no longer calls `setAttribute("value", ...)` on every input event. Added a DOM behavior test that verifies the native input node is not replaced while typing.

## BUG-006: Composite components reinsert consumer HTML through `innerHTML`

Affected files:
- `packages/components/src/components/disclosure.js`
- `packages/components/src/components/field.js`
- matching files under `packages/components/dist/components/`

Problem:
`my-disclosure` and `my-field` save initial child markup into `dataset.initialHtml` and later inject it back with `innerHTML`. This violates the security/trust-boundary guidance in `AGENTS.md`, exposes internal HTML in data attributes, and can destroy event listeners or state on slotted consumer controls.

Fix direction:
Use DOM node movement or slots/shadow DOM instead of serializing consumer content. Preserve existing child nodes, move them into wrapper elements, and only render trusted component chrome.

Resolution:
Fixed. `my-disclosure` and `my-field` now preserve child nodes through `DocumentFragment` movement and DOM APIs instead of serializing consumer markup into `data-*` attributes and reinserting it through `innerHTML`. Added DOM behavior tests for both.

## BUG-007: Documentation examples use absolute links that break under subdirectory deployment

Affected files:
- `docs/index.md`
- `docs/components/button.md`
- generated `docs/.vitepress/dist/**`

Problem:
Links such as `/architecture`, `/foundations/color`, and `<my-button href="/installation">` assume the docs are hosted at the domain root. This repo is a GitHub Pages subdirectory project. These links will navigate outside the project.

Fix direction:
Use relative links in documentation content and examples.

Resolution:
Fixed for reviewed docs source. Index learning-path links now use relative Markdown links, and the button example uses a relative built-docs URL.

## BUG-008: Generated VitePress output is treated as source without policy clarity

Affected files:
- `docs/.vitepress/dist/**`
- `.gitignore`
- `README.md`

Problem:
The `.gitignore` permits generated VitePress output, creating 80+ generated files in the review set. That makes code review noisy and contradicts the educational-grade goal of a discoverable source tree. If generated output must be committed for GitHub Pages preview, the README should say so. If not, it should be ignored.

Fix direction:
Document the policy. If retaining generated docs for static preview, clearly mark them as generated artifacts and keep review focused on source. Otherwise ignore `docs/.vitepress/dist/` and remove the root preview link to built docs.

Resolution:
Fixed by documentation. `README.md` now explains why generated package/docs artifacts are intentionally visible in this static GitHub Pages project and says they should be regenerated, not hand-edited.

## BUG-009: Package metadata includes unused and potentially mismatched dev dependency

Affected files:
- `package.json`
- `package-lock.json`

Problem:
`@vitejs/plugin-vue` is listed directly but not used anywhere. The installed major version is for a newer Vite line than VitePress 1.6.4 uses internally. This adds dependency noise and audit surface without serving the project.

Fix direction:
Remove the unused direct dependency.

Resolution:
Fixed. Removed the unused root `@vitejs/plugin-vue` dependency.

## BUG-010: Tests do not cover real component behavior

Affected files:
- `tests/manifest.test.js`
- `tests/tokens.test.js`
- `package.json`

Problem:
Current tests validate token shape and metadata shape only. They do not catch the real bugs in `my-input`, `my-disclosure`, `my-field`, or link/base behavior. `AGENTS.md` requires verifiability and complete behavior, especially around accessibility state and edge cases.

Fix direction:
Add browser-like DOM tests with `happy-dom` or equivalent for input typing, disclosure state sync, and field content preservation.

Resolution:
Fixed. Added `happy-dom` and `tests/component-behavior.test.js`, covering button ARIA behavior, input stability, disclosure child preservation, field child preservation/error sync, and metadata/observed-attribute alignment.

## BUG-011: `my-button` sets `aria-label` on ordinary text buttons

Affected files:
- `packages/components/src/components/button.js`
- `packages/components/dist/components/button.js`

Problem:
For non-icon-only buttons, the visible text already provides the accessible name. Adding `aria-label` duplicates or overrides visible text unnecessarily and can hide mismatches between visual text and accessible name. ARIA should be used only where needed.

Fix direction:
Only apply `aria-label` when `icon-only` is present or the host explicitly provides `aria-label`.

Resolution:
Fixed. Text buttons no longer receive a generated `aria-label`; icon-only buttons still do. Covered by tests.

## BUG-012: Root preview does not persist theme preference

Affected files:
- `index.html`

Problem:
`AGENTS.md` says complete theme toggles should respect stored user preference and fall back safely. The VitePress `ThemeSwitcher` does this, but the root preview theme control does not persist or restore preference.

Fix direction:
Move root behavior to a module that reads/writes localStorage with `try/catch` and syncs `aria-pressed`.

Resolution:
Fixed. Root theme behavior moved to `assets/root-preview.js`, persists theme in localStorage with defensive `try/catch`, and synchronizes `aria-pressed`.
