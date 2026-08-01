# Grid and Atlas Helper

A local-first static browser utility for creating pixel-accurate raster grids and slicing regular sprite atlases. It uses native HTML, CSS, JavaScript modules, Canvas, local storage, and the bundled JSZip build. Source images remain in the browser and are never uploaded.

## Run locally

From this directory, start any static server:

```powershell
python -m http.server 8080
```

Then open `http://localhost:8080/`.

## Capabilities

- Automatic-fit and fixed-count grid geometry with separators, asymmetric borders, and origin offsets
- Transparent or solid grid PNG export
- Local PNG/JPEG/WebP/GIF atlas loading, exact cell selection, keyboard navigation, and pixel previews
- Row-major or column-major traversal and independent right/bottom partial-cell policies
- Deterministic sprite naming, selected-cell PNG download, ZIP export, and `manifest.json`
- Versioned presets, JSON transfer, URL sharing, session recovery, bounded structured diagnostics, and undo/redo shortcuts

## Keyboard shortcuts

- `Ctrl/Cmd+Z`: undo configuration
- `Ctrl/Cmd+Y` or `Ctrl/Cmd+Shift+Z`: redo configuration
- Focused atlas: arrow keys select adjacent cells; Enter downloads the selected cell
- Focused sprite strip: arrows, Page Up/Down, Home, End, Enter
- Space + primary drag or middle-button drag: pan the viewport

## Verification

Run the dependency-free domain checks with:

```powershell
node tests/domain-tests.mjs
```
