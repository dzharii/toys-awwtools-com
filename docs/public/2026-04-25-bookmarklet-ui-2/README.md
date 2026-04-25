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
- `TAGS`, `PUBLIC_TOKENS`, `setTheme()`, `ThemeService`, and `themeService` for stable component creation and theming.
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

## Public Tokens

`--awwbookmarklet-workspace-bg`, `--awwbookmarklet-window-bg`, `--awwbookmarklet-panel-bg`, `--awwbookmarklet-titlebar-active-bg`, `--awwbookmarklet-titlebar-inactive-bg`, `--awwbookmarklet-titlebar-fg`, `--awwbookmarklet-border-strong`, `--awwbookmarklet-border-subtle`, `--awwbookmarklet-focus-ring`, `--awwbookmarklet-button-bg`, `--awwbookmarklet-button-fg`, `--awwbookmarklet-button-active-bg`, `--awwbookmarklet-input-bg`, `--awwbookmarklet-input-fg`, `--awwbookmarklet-menu-bg`, `--awwbookmarklet-menu-fg`, `--awwbookmarklet-selection-bg`, `--awwbookmarklet-selection-fg`, `--awwbookmarklet-statusbar-bg`, `--awwbookmarklet-shadow-depth`, `--awwbookmarklet-frost-opacity`, `--awwbookmarklet-space-1`, `--awwbookmarklet-space-2`, `--awwbookmarklet-space-3`, `--awwbookmarklet-size-control-h`, `--awwbookmarklet-size-title-h`.

## Design Notes

The chosen direction is a compact desktop utility system for constrained bookmarklet tools. It uses square controls, explicit borders, dense spacing, restrained system colors, and visible focus states. Avoid unrelated template patterns when extending it: decorative blobs, glassmorphism, oversized hero layouts, random purple/blue gradients, and card grids that do not map to real tool structure.

Custom controls should prefer public tokens over hard-coded colors, keep hit targets close to `--awwbookmarklet-size-control-h`, expose labels through native labels or ARIA, and support keyboard operation before visual polish.
