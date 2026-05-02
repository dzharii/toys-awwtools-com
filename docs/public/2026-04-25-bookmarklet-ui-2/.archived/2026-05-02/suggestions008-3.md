2026-04-25

# Acceptance Checklist: Ergonomic Theming Support for AWW Bookmarklet UI Framework

A00. Implementation authority

Codex should use its best technical judgment when applying this checklist. Codex may resolve inconsistencies, ambiguities, or minor conflicts in the requirements by choosing the solution that is most coherent with this project's architecture, easiest to maintain, easiest to test, and most consistent with the intended behavior.

Codex may rewrite, refactor, reorganize, or simplify existing code when doing so improves consistency, coherence, maintainability, or testability. Codex should not preserve inconsistent existing patterns only for the sake of minimal changes.

Codex should verify all connected parts of this project affected by the implementation, including code, tests, documentation, examples, demos, public APIs, exports, comments, fixtures, mocks, generated files, and related utilities where applicable.

B00. Requirement coverage

* [ ] Review the theming PRD and usage scenario documents and identify the intended behavior for this project.
* [ ] Confirm that theming remains based on CSS custom properties, `PUBLIC_TOKENS`, `DEFAULT_THEME`, `ThemeService`, and Shadow DOM inheritance.
* [ ] Confirm that the implementation expands theming beyond color tokens into geometry, density, radius, spacing, control anatomy, menu anatomy, window anatomy, and surface anatomy.
* [ ] Confirm that public token names are added to `src/core/constants.js`.
* [ ] Confirm that every public token has a default value in `src/themes/default-theme.js`.
* [ ] Confirm that `src/bookmarklet/index.js` exports all intended public theme APIs, tokens, helpers, and optional presets.
* [ ] Confirm that `setTheme(themePatch)` still works for root-scoped themes.
* [ ] Confirm that `setTheme(themePatch, target)` is supported, documented, and tested as an explicit target-scoped theme path.
* [ ] Confirm that `mountWindow(win, { theme })` is implemented if accepted as part of the final API decision.
* [ ] Confirm that `openBookmarkletWindow(builder, { theme })` is implemented if accepted as part of the final API decision.
* [ ] Confirm that window-scoped themes do not mutate or overwrite the shared desktop root theme.
* [ ] Confirm that theme application happens before visible mount where possible to avoid flicker.
* [ ] Confirm that portaled UI such as menus, dialogs, and toasts preserves or copies the relevant public theme context where applicable.
* [ ] Confirm that `::part` remains an escape hatch rather than the primary theme mechanism.
* [ ] Confirm that obsolete, ineffective, or misleading tokens such as `frostOpacity` are either wired into real behavior or deliberately removed/deprecated.
* [ ] Confirm that ambiguity or inconsistency was resolved deliberately and coherently for this project.
* [ ] Record major assumptions, tradeoffs, and unresolved follow-ups in the final implementation summary.

C00. Functional verification

* [ ] Verify root-scoped theme application.

  * [ ] Call `setTheme(themePatch)` after acquiring the desktop root.
  * [ ] Confirm the active `awwbookmarklet-desktop-root` receives the expected CSS variables.
  * [ ] Confirm mounted windows inherit the root theme unless they define local overrides.
  * [ ] Confirm repeated `setTheme()` calls merge patches according to `ThemeService` behavior.

* [ ] Verify explicit target theme application.

  * [ ] Create a standalone element or `awwbookmarklet-window`.
  * [ ] Call `setTheme(themePatch, target)`.
  * [ ] Confirm CSS variables are applied to the target.
  * [ ] Confirm this works even when no active desktop root exists, if the implementation supports this path.

* [ ] Verify window-scoped theme application.

  * [ ] Create two windows with different theme patches.
  * [ ] Mount both into the same desktop root.
  * [ ] Confirm each window keeps its own token values.
  * [ ] Confirm opening the second themed window does not repaint the first.

* [ ] Verify theme application order.

  * [ ] Mount a window using `mountWindow(win, { theme })`.
  * [ ] Confirm the window receives theme variables before or at mount time.
  * [ ] Confirm there is no visible flash from default theme to local theme in the demo.

* [ ] Verify component token usage.

  * [ ] Confirm `button.js`, `icon-button.js`, `input.js`, `textarea.js`, `select.js`, `window.js`, `menu.js`, `menubar.js`, `panel.js`, `card.js`, `group.js`, `tabs.js`, `toolbar.js`, `dialog.js`, `toast.js`, `alert.js`, `field.js`, and `browser-panel.js` consume the new relevant tokens.
  * [ ] Confirm hard-coded repeated anatomy values were replaced where the value is intended to be themeable.
  * [ ] Confirm implementation details such as resize handle hit areas remain internal where appropriate.

* [ ] Verify existing behavior remains compatible.

  * [ ] Confirm existing calls to `createWindow()`, `mountWindow()`, `openBookmarkletWindow()`, `bootstrapExampleTool()`, `setTheme()`, and `shutdownAll()` still work.
  * [ ] Confirm existing components still register idempotently through `registerAllComponents()`.
  * [ ] Confirm global aliases `globalThis.awwtools.bookmarkletUi` and `globalThis.awwbookmarklet` still expose the intended public API.
  * [ ] Confirm older color-only theme patches still work.

D00. Project-specific verification scenarios

### Scenario: Root-level accent theme

* [ ] Purpose: Verify the existing global theme workflow still works and remains ergonomic for simple per-suite identity.

* [ ] Preconditions: `src/bookmarklet/index.js` is built and the desktop root can be acquired through the runtime.

* [ ] Steps:

  * [ ] Import `setTheme`, `PUBLIC_TOKENS`, `createWindow`, and `mountWindow`.
  * [ ] Apply a root theme patch with `selectionBg`, `selectionFg`, `focusRing`, `windowBg`, and `panelBg`.
  * [ ] Mount a sample window with buttons, fields, tabs, menu, and statusbar.

* [ ] Expected result:

  * [ ] The desktop root receives the theme variables.
  * [ ] The mounted window and child components inherit the global theme.
  * [ ] Selection, focus, primary button, panel, and window surfaces reflect the patch.
  * [ ] Existing default layout and interaction behavior remain intact.

* [ ] Test coverage:

  * [ ] Covered by Bun unit test for `ThemeService` and `setTheme()`.
  * [ ] Covered by demo verification in `demo/index.html` and `src/demo/catalog.js`.

* [ ] Notes:

  * [ ] This scenario must remain compatible with pre-existing color-only theme usage.

### Scenario: Window-scoped theme isolation

* [ ] Purpose: Verify independent tools can share one desktop root without theme conflicts.

* [ ] Preconditions: `mountWindow(win, { theme })` or equivalent target-scoped theme workflow is implemented.

* [ ] Steps:

  * [ ] Create `winA` with a green accent theme.
  * [ ] Create `winB` with a violet accent theme.
  * [ ] Mount both windows into the same `awwbookmarklet-desktop-root`.
  * [ ] Interact with buttons, tabs, list items, and focus states inside each window.

* [ ] Expected result:

  * [ ] `winA` keeps the green accent.
  * [ ] `winB` keeps the violet accent.
  * [ ] Mounting `winB` does not alter `winA`.
  * [ ] The shared root lifecycle, ownership tracking, and z-index management continue to work.

* [ ] Test coverage:

  * [ ] Covered by Bun test for `mountWindow(win, { theme })`.
  * [ ] Covered by regression test confirming the root theme is not mutated.
  * [ ] Covered by manual/demo verification with two visible themed windows.

* [ ] Notes:

  * [ ] If `mountWindow({ theme })` is not implemented, document the accepted alternative using `setTheme(theme, win)`.

### Scenario: Compact density theme

* [ ] Purpose: Verify spacing and anatomy tokens allow a dense operations console without clipping or broken interaction.

* [ ] Preconditions: Geometry and anatomy tokens are added to `PUBLIC_TOKENS` and consumed by high-impact components.

* [ ] Steps:

  * [ ] Apply a compact theme with reduced `space1`, `space2`, `space3`, `controlHeight`, `titleHeight`, `controlPaddingX`, `windowBodyPadding`, `panelPadding`, `cardPadding`, and `menuItemHeight`.
  * [ ] Open a sample tool window containing toolbar, menu, fields, tabs, listbox, cards, and statusbar.
  * [ ] Navigate through controls using keyboard.
  * [ ] Open menus and dialogs from the compact window.
  * [ ] Drag and resize the window.

* [ ] Expected result:

  * [ ] Components become denser consistently.
  * [ ] Text is not clipped.
  * [ ] Focus rings remain visible.
  * [ ] Menu positioning remains correct.
  * [ ] Window dragging and resizing remain stable.
  * [ ] Statusbar, titlebar, and form controls remain usable.

* [ ] Test coverage:

  * [ ] Covered by token completeness tests.
  * [ ] Covered by component style/token tests where practical.
  * [ ] Covered by manual/demo regression verification.

* [ ] Notes:

  * [ ] Compact density must not introduce continuous layout work or measurement loops.

### Scenario: Rounded theme

* [ ] Purpose: Verify radius tokens allow mild shape customization without source edits or `::part` overrides.

* [ ] Preconditions: Radius tokens exist and are consumed by controls, surfaces, and windows.

* [ ] Steps:

  * [ ] Apply a theme with `radiusControl`, `radiusSurface`, and `radiusWindow`.
  * [ ] Mount a window containing buttons, icon buttons, inputs, selects, panels, cards, menus, dialogs, and alerts.
  * [ ] Compare default and rounded rendering.

* [ ] Expected result:

  * [ ] Controls use the configured control radius.
  * [ ] Panels, cards, groups, dialogs, alerts, and browser panels use surface radius where applicable.
  * [ ] Window outer shape uses window radius.
  * [ ] Default theme remains square when radius tokens are `0`.

* [ ] Test coverage:

  * [ ] Covered by source-level or rendered-style checks for token references.
  * [ ] Covered by demo theme recipe.

* [ ] Notes:

  * [ ] The implementation should support mild rounding but should not change the default retro-modern identity.

### Scenario: High contrast review theme

* [ ] Purpose: Verify state colors, borders, focus rings, and text contrast can be strengthened through tokens.

* [ ] Preconditions: State tone tokens and focus ring width token are implemented.

* [ ] Steps:

  * [ ] Apply a high contrast theme to a window.
  * [ ] Render alerts, fields with errors, status lines, command palette rows, list items, buttons, inputs, menus, and tabs.
  * [ ] Navigate with keyboard.
  * [ ] Trigger warning, danger, success, info, and neutral states.

* [ ] Expected result:

  * [ ] Focus rings are clearly visible.
  * [ ] Text remains readable.
  * [ ] Danger, warning, success, info, and neutral states remain distinguishable.
  * [ ] State meaning is not communicated by color alone.
  * [ ] Disabled controls remain distinguishable without becoming unreadable.

* [ ] Test coverage:

  * [ ] Covered by theme object tests and demo verification.
  * [ ] Covered by accessibility-focused manual verification.

* [ ] Notes:

  * [ ] Any theme recipe documented as high contrast should be checked visually.

### Scenario: Portaled menu preserves themed context

* [ ] Purpose: Verify menus opened from themed windows do not lose theme context when portaled to an overlay layer.

* [ ] Preconditions: `awwbookmarklet-menu` portals through the existing overlay/root mechanism.

* [ ] Steps:

  * [ ] Mount a window with a local theme that changes `selectionBg`, `menuBg`, `menuFg`, `menuItemHeight`, and radius tokens.
  * [ ] Open a menubar menu from that window.
  * [ ] Inspect the opened menu and highlighted menu item.
  * [ ] Repeat with a second window using a different theme.

* [ ] Expected result:

  * [ ] The menu opened from the first window uses the first window's theme.
  * [ ] The menu opened from the second window uses the second window's theme.
  * [ ] Menu portal behavior still avoids clipping and preserves correct z-index.
  * [ ] Keyboard navigation, typeahead, selection, and dismiss behavior still work.

* [ ] Test coverage:

  * [ ] Covered by unit or DOM interaction test if possible.
  * [ ] Covered by manual/demo regression verification if full portal behavior is not practical in Bun tests.

* [ ] Notes:

  * [ ] If the implementation copies public theme tokens to portaled elements, confirm it copies only public tokens, not arbitrary computed styles.

### Scenario: Dialog and toast theme context

* [ ] Purpose: Verify overlay surfaces remain visually coherent with scoped themes where applicable.

* [ ] Preconditions: `awwbookmarklet-dialog`, `awwbookmarklet-toast`, and overlay helpers are available.

* [ ] Steps:

  * [ ] Mount a themed window.
  * [ ] Open a dialog declared inside that window.
  * [ ] Trigger a toast from that window or from a themed context.
  * [ ] Inspect surface background, border, radius, shadow, focus, and state color behavior.

* [ ] Expected result:

  * [ ] Dialog surface uses the expected theme tokens.
  * [ ] Dialog focus trap and close behavior still work.
  * [ ] Toast state colors remain consistent with the relevant context where supported.
  * [ ] Overlay behavior does not block the host page except where intended.

* [ ] Test coverage:

  * [ ] Covered by dialog behavior tests where available.
  * [ ] Covered by demo verification.

* [ ] Notes:

  * [ ] If full toast context support is deferred, document the limitation and follow-up.

### Scenario: Source-owned downstream customization

* [ ] Purpose: Verify the framework still supports developers who copy the source into `vendor/` while making source edits unnecessary for normal theming.

* [ ] Preconditions: Distribution README and runtime exports are updated.

* [ ] Steps:

  * [ ] Read the generated `dist/README.md`.
  * [ ] Confirm it explains copied-source or copied-dist usage.
  * [ ] Confirm it shows token-based theming before source modification.
  * [ ] Confirm it explains when direct source customization may be appropriate.

* [ ] Expected result:

  * [ ] Developers can understand the preferred configuration path.
  * [ ] Developers know they own their copy and may modify it when necessary.
  * [ ] Documentation encourages tokens, scoped themes, semantic attributes, and `::part` before source edits.

* [ ] Test coverage:

  * [ ] Covered by documentation review.
  * [ ] Covered by distribution build verification.

* [ ] Notes:

  * [ ] This scenario is central to the project's distribution model.

E00. Testing verification

* [ ] Confirm Bun is used for relevant unit and build tests.
* [ ] Confirm new theme behavior is covered by meaningful tests.
* [ ] Confirm changed theme behavior has updated tests.
* [ ] Confirm existing behavior that could regress has regression tests.
* [ ] Confirm tests cover root-scoped themes.
* [ ] Confirm tests cover explicit target-scoped themes.
* [ ] Confirm tests cover `mountWindow(win, { theme })` if implemented.
* [ ] Confirm tests cover token completeness: every `PUBLIC_TOKENS` value has a `DEFAULT_THEME` entry.
* [ ] Confirm tests cover unknown or extra custom property handling if validation is introduced.
* [ ] Confirm tests cover theme application without mutating the original theme object.
* [ ] Confirm tests cover repeated theme application and merge behavior.
* [ ] Confirm tests cover component registration after theme changes.
* [ ] Confirm tests cover distribution exports for new tokens, helpers, and optional presets.
* [ ] Confirm tests cover normal cases, edge cases, malformed patches, null or undefined values, and missing targets where relevant.
* [ ] Confirm tests verify behavior rather than brittle internal implementation details, except for targeted source-level token-reference checks where DOM style computation is not practical.
* [ ] Run the relevant Bun test command for changed areas.
* [ ] Fix all failures.
* [ ] Re-run tests after fixes.
* [ ] Run the broader relevant Bun test suite before final acceptance.
* [ ] Run the build command and confirm readable distributable output still emits correctly.

F00. Documentation, examples, and demo verification

* [ ] Update `distReadme` generation in `scripts/build.mjs` to document the final theming API.
* [ ] Confirm generated `dist/README.md` includes root-scoped theme examples.
* [ ] Confirm generated `dist/README.md` includes window-scoped theme examples.
* [ ] Confirm generated `dist/README.md` includes `mountWindow(win, { theme })` if implemented.
* [ ] Confirm generated `dist/README.md` includes accent-only, compact, rounded, and high contrast recipes.
* [ ] Confirm documentation states that public tokens are the main theme API.
* [ ] Confirm documentation states that semantic attributes are for component modes.
* [ ] Confirm documentation states that `::part` is an escape hatch.
* [ ] Confirm documentation explains copied-source or vendor-folder usage accurately.
* [ ] Confirm documentation does not claim unsupported presets or helpers exist.
* [ ] Confirm examples use `PUBLIC_TOKENS` instead of raw token strings where practical.
* [ ] Confirm demos in `src/demo/catalog.js` include a visible theming demonstration or theme recipes.
* [ ] Confirm demo examples use real framework components and tokens rather than only page-level CSS.
* [ ] Confirm demo interactions still work: open sample tool, open blank window, switch tabs, open dialog, show toast, open menus.
* [ ] Confirm no outdated instructions, examples, screenshots, or references remain.

G00. Refactoring and code quality verification

* [ ] Confirm the implementation remains coherent with the existing architecture: `src/core`, `src/components`, `src/themes`, `src/bookmarklet`, `src/demo`, `scripts`, and `dist`.
* [ ] Confirm theme-specific helpers are placed in a clear module, such as `src/core/theme.js` or a focused theme-context utility.
* [ ] Confirm code avoids unnecessary duplication when applying theme patches or copying theme context.
* [ ] Confirm naming matches responsibilities.
* [ ] Confirm public API names are stable, readable, and consistent with existing exports.
* [ ] Confirm component CSS uses public tokens for repeated themeable values.
* [ ] Confirm private `--_` variables remain internal implementation details.
* [ ] Confirm unrelated areas were not refactored only for preference.
* [ ] Confirm any aggressive refactoring was purposeful and related to theming, maintainability, or testability.
* [ ] Confirm obsolete code paths, unused helpers, conflicting theme logic, and ineffective tokens were removed or resolved where applicable.
* [ ] Confirm no component-specific one-off token was added where a global or mapping token would be cleaner.
* [ ] Confirm no broad styling mechanism was added that bypasses the intended token architecture.
* [ ] Confirm no recurring idle work, polling, or continuous measurement was introduced for theme handling.
* [ ] Confirm theme handling remains bounded and event-driven.

H00. Public API and export verification

* [ ] Confirm `PUBLIC_TOKENS` includes all approved new theme tokens.
* [ ] Confirm `DEFAULT_THEME` includes values for all tokens.
* [ ] Confirm `ThemeService` remains exported.
* [ ] Confirm `defaultThemeService` remains exported.
* [ ] Confirm `setTheme()` remains exported.
* [ ] Confirm any new helper such as `createTheme()` is exported only if intended to be public.
* [ ] Confirm any built-in theme preset map such as `THEMES` is exported only if implemented and documented.
* [ ] Confirm global alias `globalThis.awwbookmarklet` exposes the final public theme API.
* [ ] Confirm global alias `globalThis.awwtools.bookmarkletUi` exposes the final public theme API.
* [ ] Confirm distribution bundle includes the same intended public exports as source.
* [ ] Confirm generated README examples import only real exported symbols.

I00. Component verification

* [ ] `awwbookmarklet-button`

  * [ ] Uses radius, border width, padding, min width, shadow, active shadow, control height, focus ring, and color tokens.
  * [ ] Preserves `variant`, `tone`, `busy`, `pressed`, `disabled`, command request, and click behavior.

* [ ] `awwbookmarklet-icon-button`

  * [ ] Uses control height, radius, icon size, border, focus ring, state, and tone tokens.
  * [ ] Preserves accessible label behavior.

* [ ] `awwbookmarklet-input`, `awwbookmarklet-textarea`, `awwbookmarklet-select`

  * [ ] Use radius, border width, input padding, control height, inset shadow, input background, input foreground, and focus tokens.
  * [ ] Preserve mirrored attribute behavior and input/change events.

* [ ] `awwbookmarklet-checkbox`, `awwbookmarklet-radio`, `awwbookmarklet-range`, `awwbookmarklet-progress`

  * [ ] Use relevant theme tokens without breaking native control behavior.
  * [ ] Preserve checked, value, disabled, and change/input behavior.

* [ ] `awwbookmarklet-window`

  * [ ] Uses window radius, border width, window background, titlebar tokens, body padding, shadow, and focus tokens.
  * [ ] Preserves drag, resize, close, active state, system menu, slots, and manager integration.
  * [ ] Does not break viewport clamping or frame-coalesced interactions.

* [ ] `awwbookmarklet-menu` and `awwbookmarklet-menubar`

  * [ ] Use menu padding, item height, item padding, item gap, menu colors, selection colors, border, and shadow tokens.
  * [ ] Preserve roving focus, typeahead, command dispatch, portal, dismiss, and keyboard behavior.
  * [ ] Preserve theme context when portaled from a themed window.

* [ ] `awwbookmarklet-panel`, `awwbookmarklet-card`, `awwbookmarklet-group`, `awwbookmarklet-app-shell`

  * [ ] Use surface, padding, gap, radius, border, divider, and text tokens.
  * [ ] Preserve slot behavior and header/footer detection.

* [ ] `awwbookmarklet-alert`, `awwbookmarklet-status-line`, `awwbookmarklet-empty-state`, `awwbookmarklet-state-overlay`

  * [ ] Use semantic state tokens.
  * [ ] Preserve roles, live regions, dismiss behavior, and tone behavior.

* [ ] `awwbookmarklet-dialog`, `awwbookmarklet-toast`

  * [ ] Use overlay, surface, radius, shadow, state, and focus tokens.
  * [ ] Preserve portal behavior, focus behavior, close behavior, timeout behavior, and pointer model.

* [ ] `awwbookmarklet-tabs`, `awwbookmarklet-list`, `awwbookmarklet-list-item`, `awwbookmarklet-listbox`, `awwbookmarklet-command-palette`, `awwbookmarklet-url-picker`, `awwbookmarklet-shortcut-help`

  * [ ] Use relevant selection, focus, surface, spacing, border, and typography tokens.
  * [ ] Preserve keyboard navigation and event behavior.

J00. Build and distribution verification

* [ ] Run `bun run build`.
* [ ] Confirm `dist/bookmarklet/index.js` is generated.
* [ ] Confirm `dist/demo/catalog.js` is generated.
* [ ] Confirm `dist/README.md` is generated.
* [ ] Confirm build remains readable and unminified according to current project policy.
* [ ] Confirm `demo/index.html` correctly references the built demo bundle.
* [ ] Confirm new theme tokens and helpers appear in the distributable runtime where intended.
* [ ] Confirm generated documentation matches the actual build output.
* [ ] Confirm no stale `dist` artifacts remain after build.

K00. Final acceptance review

* [ ] Confirm all accepted requirements are implemented.
* [ ] Confirm all project-specific verification scenarios pass.
* [ ] Confirm all relevant Bun tests pass.
* [ ] Confirm build passes.
* [ ] Confirm demo loads and visible theme scenarios work.
* [ ] Confirm all connected code, tests, documentation, examples, demos, comments, exports, fixtures, mocks, generated files, and utilities are updated where relevant.
* [ ] Confirm the implementation is maintainable, coherent, and consistent with the AWW Bookmarklet UI architecture.
* [ ] Confirm the default theme remains visually consistent with the retro-modern desktop direction.
* [ ] Confirm theme customization is ergonomic for developers who copy the framework into their own `vendor/` folder.
* [ ] Confirm source modification remains possible but is no longer necessary for common theme changes.
* [ ] Confirm assumptions, tradeoffs, and unresolved follow-ups are documented.

L00. Final implementation summary requirements

* [ ] Prepare a final summary that states what changed.
* [ ] Include the new public tokens and APIs.
* [ ] Include which components were refactored.
* [ ] Include what tests were added or updated.
* [ ] Include what documentation, examples, or demos were updated.
* [ ] Include build results.
* [ ] Include manual verification results for root theme, window theme, compact theme, rounded theme, high contrast theme, and portaled menu behavior.
* [ ] Include any tradeoffs or follow-ups, especially around dialog/toast theme context if not fully solved.


