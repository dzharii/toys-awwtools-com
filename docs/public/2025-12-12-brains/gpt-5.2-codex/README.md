# BrainJoke (static SVG toy)

Open `index.html` in a modern browser, type anything, and watch your text coil into the hollow head cavity.

## Files and load order

Scripts are classic `<script>` tags (no bundler, no ES modules). Load order is enforced by filenames:

1. `js/00-namespace.js` (global `window.BrainJoke`)
2. `js/01-dom.js` (ID lookup + validation)
3. `js/02-scene.js` (SVG clip-path + defs + measurers)
4. `js/03-anim-character.js` (idle micro-motion)
5. `js/04-ui-input.js` (textarea normalization + change events)
6. `js/05-geometry.js` (cavity metrics from the SVG path)
7. `js/06-pathgen.js` (snake curve generator)
8. `js/07-text-layout.js` (font sizing + density choice)
9. `js/08-render-brain.js` (SVG text-on-path rendering + transitions)
10. `js/09-scheduler.js` (RAF + debounced layout updates + reduced motion)
11. `js/10-debug.js` (overlay + console smoke tests)
12. `js/99-bootstrap.js` (wires everything on `DOMContentLoaded`)

## Debug / smoke tests

- Press `D` to toggle the debug overlay.
- Add `?debug=1` to the URL to start with debug overlay enabled.
- In DevTools console: `BrainJoke.debug.runSmokeTests()`.

## Manual checks

See `HAND-TESTS.md`.

