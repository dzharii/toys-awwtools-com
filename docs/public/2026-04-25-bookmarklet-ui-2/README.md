# AWW Bookmarklet UI Framework

A bookmarklet-safe UI shell for floating tool windows on arbitrary web pages.

## Architecture

- `src/core/`: foundation modules (constants, geometry, styles, theme, runtime, manager, commands)
- `src/components/`: namespaced web components using open Shadow DOM
- `src/controllers/`: extracted interaction helpers/controllers
- `src/themes/`: built-in token maps and theme definitions
- `src/bookmarklet/`: bookmarklet bootstrap entry
- `src/demo/`: interactive catalog and example tool wiring
- `demo/`: demo shell page
- `dist/`: build output
- `test/`: automated tests

## Runtime Rules

- Public custom elements are prefixed `awwbookmarklet-`
- Public CSS variables are prefixed `--awwbookmarklet-`
- Public runtime API is exposed at `globalThis.awwtools.bookmarkletUi`
- Registration is idempotent (`customElements.define` guarded)
- One overlay root per framework version, discoverable via namespaced global symbols
- Overlay root is non-blocking (`pointer-events: none`) with interactive descendants opting in

## Build

```bash
bun run build
bun run build:prod
bun run dev
```

## Distributing

`dist/` is the reusable artifact. After `bun run build:prod`, copy the whole `dist/` folder into another project and import `dist/bookmarklet/index.js` as an ES module.

The bookmarklet entry registers all bundled custom elements and exposes the same SDK as module exports and as `globalThis.awwtools.bookmarkletUi` / `globalThis.awwbookmarklet`:

- `createWindow()` and `mountWindow()` for reusable floating tool windows.
- `registerAllComponents()` and `defineComponent()` for bundled and custom `awwbookmarklet-*` elements.
- `TAGS`, `PUBLIC_TOKENS`, `setTheme()`, `ThemeService`, `themeService`, `createTheme()`, `applyThemePatch()`, and `copyPublicThemeContext()` for stable component creation and theming.
- `styles.css`, `styles.base`, and `styles.adoptStyles()` for custom Shadow DOM components that should share reset, focus, and selection behavior.
- `CommandRegistry`, URL helpers, `sanitizeHtml()`, `copyToClipboard()`, and `showToast()` for common tool workflows.

Minimal downstream example:

```html
<script type="module">
  import { createWindow, mountWindow, TAGS } from "./dist/bookmarklet/index.js";

  const panel = document.createElement(TAGS.panel);
  panel.innerHTML = "<span slot=\"title\">Capture</span><p>Reusable content.</p>";

  mountWindow(createWindow({ title: "Capture Tool", content: panel }));
</script>
```

## Tests

```bash
bun run test
```

## Demo

Open `demo/index.html` after build. It loads `dist/demo/catalog.js`.

## Theming

The theme system is based on public CSS custom properties. Themes are plain objects keyed by `PUBLIC_TOKENS` values. Use root-scoped themes when a whole suite should share one look:

```js
setTheme({
  [PUBLIC_TOKENS.selectionBg]: "#175a9c",
  [PUBLIC_TOKENS.focusRing]: "#0f62fe"
});
```

Use window-scoped themes for independent tools sharing one desktop root. The theme is applied to the window before it is mounted, so other windows are not repainted:

```js
mountWindow(win, {
  ownerPrefix: "reader-tool",
  theme: {
    [PUBLIC_TOKENS.selectionBg]: "#725c3a",
    [PUBLIC_TOKENS.radiusControl]: "4px",
    [PUBLIC_TOKENS.radiusSurface]: "6px",
    [PUBLIC_TOKENS.radiusWindow]: "8px"
  }
});
```

`setTheme(themePatch, targetElement)` is the lower-level target-scoped form. Public tokens are the primary API, component attributes such as `variant`, `tone`, and `density` describe semantic modes, and `::part` should be reserved as an escape hatch for unusual local overrides.

Common recipes:

```js
const compactTheme = {
  [PUBLIC_TOKENS.space1]: "3px",
  [PUBLIC_TOKENS.space2]: "6px",
  [PUBLIC_TOKENS.space3]: "8px",
  [PUBLIC_TOKENS.controlHeight]: "26px",
  [PUBLIC_TOKENS.titleHeight]: "28px",
  [PUBLIC_TOKENS.controlPaddingX]: "8px",
  [PUBLIC_TOKENS.buttonPaddingX]: "8px",
  [PUBLIC_TOKENS.inputPaddingX]: "6px",
  [PUBLIC_TOKENS.windowBodyPadding]: "8px",
  [PUBLIC_TOKENS.panelPadding]: "6px",
  [PUBLIC_TOKENS.cardPadding]: "6px",
  [PUBLIC_TOKENS.menuItemHeight]: "26px"
};

const roundedTheme = {
  [PUBLIC_TOKENS.radiusControl]: "4px",
  [PUBLIC_TOKENS.radiusSurface]: "6px",
  [PUBLIC_TOKENS.radiusWindow]: "8px",
  [PUBLIC_TOKENS.buttonShadow]: "none"
};

const highContrastTheme = {
  [PUBLIC_TOKENS.windowBg]: "#ffffff",
  [PUBLIC_TOKENS.panelBg]: "#ffffff",
  [PUBLIC_TOKENS.inputFg]: "#000000",
  [PUBLIC_TOKENS.textMuted]: "#222222",
  [PUBLIC_TOKENS.borderStrong]: "#000000",
  [PUBLIC_TOKENS.borderSubtle]: "#333333",
  [PUBLIC_TOKENS.selectionBg]: "#003b8e",
  [PUBLIC_TOKENS.selectionFg]: "#ffffff",
  [PUBLIC_TOKENS.focusRing]: "#ffbf00",
  [PUBLIC_TOKENS.focusRingWidth]: "3px"
};
```

Developers who copy this framework into a `vendor/` folder own their copy and may edit source when a product needs a new component or behavior. For normal visual identity, prefer tokens, scoped themes, semantic attributes, and narrow `::part` overrides before source edits.

## Public Tokens

`--awwbookmarklet-workspace-bg`, `--awwbookmarklet-window-bg`, `--awwbookmarklet-panel-bg`, `--awwbookmarklet-titlebar-active-bg`, `--awwbookmarklet-titlebar-inactive-bg`, `--awwbookmarklet-titlebar-fg`, `--awwbookmarklet-border-strong`, `--awwbookmarklet-border-subtle`, `--awwbookmarklet-focus-ring`, `--awwbookmarklet-button-bg`, `--awwbookmarklet-button-fg`, `--awwbookmarklet-button-active-bg`, `--awwbookmarklet-input-bg`, `--awwbookmarklet-input-fg`, `--awwbookmarklet-menu-bg`, `--awwbookmarklet-menu-fg`, `--awwbookmarklet-selection-bg`, `--awwbookmarklet-selection-fg`, `--awwbookmarklet-statusbar-bg`, `--awwbookmarklet-app-shell-bg`, `--awwbookmarklet-surface-raised-bg`, `--awwbookmarklet-surface-inset-bg`, `--awwbookmarklet-text-muted`, `--awwbookmarklet-text-help`, `--awwbookmarklet-divider-color`, `--awwbookmarklet-info-bg`, `--awwbookmarklet-info-fg`, `--awwbookmarklet-info-border`, `--awwbookmarklet-success-bg`, `--awwbookmarklet-success-fg`, `--awwbookmarklet-success-border`, `--awwbookmarklet-warning-bg`, `--awwbookmarklet-warning-fg`, `--awwbookmarklet-warning-border`, `--awwbookmarklet-danger-bg`, `--awwbookmarklet-danger-fg`, `--awwbookmarklet-danger-border`, `--awwbookmarklet-overlay-backdrop`, `--awwbookmarklet-overlay-shadow`, `--awwbookmarklet-card-bg`, `--awwbookmarklet-card-selected-bg`, `--awwbookmarklet-metric-bg`, `--awwbookmarklet-code-bg`, `--awwbookmarklet-code-fg`, `--awwbookmarklet-shadow-depth`, `--awwbookmarklet-frost-opacity`, `--awwbookmarklet-space-1`, `--awwbookmarklet-space-2`, `--awwbookmarklet-space-3`, `--awwbookmarklet-size-control-h`, `--awwbookmarklet-size-title-h`, `--awwbookmarklet-radius-control`, `--awwbookmarklet-radius-surface`, `--awwbookmarklet-radius-window`, `--awwbookmarklet-border-width-control`, `--awwbookmarklet-border-width-surface`, `--awwbookmarklet-focus-ring-width`, `--awwbookmarklet-control-padding-x`, `--awwbookmarklet-control-padding-y`, `--awwbookmarklet-control-min-width`, `--awwbookmarklet-control-icon-size`, `--awwbookmarklet-input-padding-x`, `--awwbookmarklet-input-padding-y`, `--awwbookmarklet-button-padding-x`, `--awwbookmarklet-button-padding-y`, `--awwbookmarklet-button-min-width`, `--awwbookmarklet-button-shadow`, `--awwbookmarklet-button-active-shadow`, `--awwbookmarklet-window-body-padding`, `--awwbookmarklet-titlebar-padding-x`, `--awwbookmarklet-titlebar-gap`, `--awwbookmarklet-surface-padding`, `--awwbookmarklet-surface-gap`, `--awwbookmarklet-panel-padding`, `--awwbookmarklet-card-padding`, `--awwbookmarklet-group-padding`, `--awwbookmarklet-menu-padding`, `--awwbookmarklet-menu-item-height`, `--awwbookmarklet-menu-item-padding-x`, `--awwbookmarklet-menu-item-gap`, `--awwbookmarklet-control-inset-shadow`.

## Design Notes

The chosen direction is a compact desktop utility system for constrained bookmarklet tools. It uses square controls, explicit borders, dense spacing, restrained system colors, and visible focus states. Avoid unrelated template patterns when extending it: decorative blobs, glassmorphism, oversized hero layouts, random purple/blue gradients, and card grids that do not map to real tool structure.

Custom controls should prefer public tokens over hard-coded colors, keep hit targets close to `--awwbookmarklet-size-control-h`, expose labels through native labels or ARIA, and support keyboard operation before visual polish.
