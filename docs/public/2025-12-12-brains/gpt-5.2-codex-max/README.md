# BrainToy (hollow head brain filler)

A tiny static SVG/CSS/vanilla-JS toy: a cartoon profile head with a visibly hollow cavity. Type anything, and your text becomes the “brain” by flowing into the head and filling the space.

## Run

- Open `index.html` in a modern browser (no server, no build, no dependencies).

Supported: latest Chrome / Edge / Firefox / Safari.

## Use

- Type in the textarea. The cavity switches from empty to filled and reflows live as you edit.
- Toggle `wiggle mode` for stronger micro-motion.
- Toggle `reduced motion` to disable most animation (also respects OS `prefers-reduced-motion`).

## Debug + Smoke Tests

Open DevTools console:

- `BrainToy.services.debug.toggleDebug(true)` shows a geometry overlay (inset rect + current snake path).
- `BrainToy.services.debug.runSmokeTests()` prints a small result table and returns `{ ok, failed }`.

## File Map (classic scripts, explicit order)

All JS runs in the classic global environment, sharing a single namespace: `window.BrainToy`.

- `index.html` – page layout + the SVG character (IDs are the “contract” for JS)
- `css/base.css` – page layout + palette
- `css/character.css` – SVG styling + motion keyframes
- `css/ui.css` – textarea + occupancy meter styling
- `js/00-namespace.js` – creates `window.BrainToy` + config/state/util
- `js/01-dom.js` – cached DOM lookups + validation
- `js/02-scene.js` – builds SVG clip/mask layers, brain text layers, empty-state decorations
- `js/03-anim-character.js` – blink + pupil micro-saccades + intensity control
- `js/04-ui-input.js` – input normalization + toggle wiring + subscriptions
- `js/05-geometry.js` – cavity measurement + point-in-fill sampling (cached)
- `js/06-pathgen.js` – “snake” path generation inside the cavity
- `js/07-text-layout.js` – font size + row count selection + render plan creation
- `js/08-render-brain.js` – renders plan into SVG + transitions between layouts
- `js/09-scheduler.js` – requestAnimationFrame scheduling + reduced-motion wiring
- `js/10-debug.js` – debug overlay + smoke tests
- `js/99-bootstrap.js` – DOMContentLoaded entry point (initializes everything)

## Tweaking / Extending

- **Cavity shape:** edit the `d` attribute of `#cavityPath` in `index.html`.
- **Animation feel:** tune timings/thresholds in `js/00-namespace.js` under `config`.
- **Packing look:** adjust `js/06-pathgen.js` (row curvature, turn radius) and `js/07-text-layout.js` (row selection heuristics).
