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
- Registration is idempotent (`customElements.define` guarded)
- One desktop root per framework version, discoverable via global symbols
- Desktop overlay is non-blocking (`pointer-events: none`) with interactive descendants opting in

## Build

```bash
bun run build
bun run build:prod
bun run dev
```

## Tests

```bash
bun run test
```

## Demo

Open `demo/index.html` after build. It loads `dist/demo/catalog.js`.

## Public Tokens

`--awwbookmarklet-workspace-bg`, `--awwbookmarklet-window-bg`, `--awwbookmarklet-panel-bg`, `--awwbookmarklet-titlebar-active-bg`, `--awwbookmarklet-titlebar-inactive-bg`, `--awwbookmarklet-titlebar-fg`, `--awwbookmarklet-border-strong`, `--awwbookmarklet-border-subtle`, `--awwbookmarklet-focus-ring`, `--awwbookmarklet-button-bg`, `--awwbookmarklet-button-fg`, `--awwbookmarklet-button-active-bg`, `--awwbookmarklet-input-bg`, `--awwbookmarklet-input-fg`, `--awwbookmarklet-menu-bg`, `--awwbookmarklet-menu-fg`, `--awwbookmarklet-selection-bg`, `--awwbookmarklet-selection-fg`, `--awwbookmarklet-statusbar-bg`, `--awwbookmarklet-shadow-depth`, `--awwbookmarklet-frost-opacity`, `--awwbookmarklet-space-1`, `--awwbookmarklet-space-2`, `--awwbookmarklet-space-3`, `--awwbookmarklet-size-control-h`, `--awwbookmarklet-size-title-h`.
