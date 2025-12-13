# Hollow Head Brain Toy

A playful static page that shows a hollow cartoon head whose "brain" is replaced by whatever you type. The project is pure HTML/CSS/SVG/JS with no build step or dependencies.

## Run
- Open `index.html` in a modern browser.
- Optional: open DevTools console and run `BrainJoke.runSmokeTests()` for quick layout sanity logs.

## File map and load order
- `index.html` hosts the SVG and UI, and links classic scripts in numbered order.
- CSS: `css/base.css` (layout, palette), `css/character.css` (SVG styling, keyframes), `css/ui.css` (controls, hints).
- JS (classic globals via `window.BrainJoke`):
  - `js/00-namespace.js` sets `BrainJoke` root with `config`, `state`, and helpers.
  - `js/01-dom.js` caches DOM lookups and validation.
  - `js/02-scene.js` wires the cavity mask/layers.
  - `js/03-anim-character.js` drives idle bob, sway, blink, and pupil motion.
  - `js/04-ui-input.js` normalizes input, hint visibility, wiggle toggle, and gauge updates.
  - `js/05-geometry.js` measures the cavity and inset boundary.
  - `js/06-pathgen.js` builds snake paths based on density.
  - `js/07-text-layout.js` chooses font sizes, splits text across paths, and reports occupancy.
  - `js/08-render-brain.js` renders text-on-path with transitions and mask.
  - `js/09-scheduler.js` centralizes rAF ticks, layout debounce, and reduced-motion flag.
  - `js/10-debug.js` overlays geometry/path visuals and provides smoke tests.
  - `js/99-bootstrap.js` runs after DOMContentLoaded to validate, init the scene, wire events, and start idle life.

Only one global (`BrainJoke`) is added; other modules close over their own scope.

## Maintenance guide
- **Namespace**: All shared state lives under `window.BrainJoke` with `config` (timings, density thresholds) and `state` (text, cavity metrics, reduced motion). Tweak behavior by editing `config` in `00-namespace.js`.
- **Extending character**: SVG elements are IDed (`head-bob`, `pupil`, `cavity-path`, `brain-text-layer`). Keep the mask targeting `#cavity-path` so text remains clipped. Add new decorative elements inside `#cavity-layer` to keep them masked, or above `#rim-top` to sit on top.
- **Tweaking layout/packing**: Adjust density thresholds in `config.density`, path templates in `js/06-pathgen.js`, or the font sizing formula in `js/07-text-layout.js`. The render plan is separated from DOM writes so you can test layout independently.
- **Adding behaviors**: Use `BrainJoke.scheduler.addTick` for new idle effects instead of new timers, and expose new controls through `uiInput.onTextChange` to stay consistent with input normalization.

## Hand-test script (acceptance)
Run these steps after loading `index.html`:
- Watch for 30 seconds without typing: head bobs/sways subtly, pupil drifts and blinks; cavity shows faint shimmer/cobweb; rim stays on top.
- Type one letter: cavity inflates from center with a big curved band; hint hides; occupancy meter jumps.
- Type a short phrase (10–20 chars): text snakes along a smooth curve, still large and readable.
- Paste a URL: text shrinks and coils more tightly while staying inside the rim; no spill past the mask.
- Paste a very long paragraph (300+ chars): text becomes dense "brain noise", coil count increases, and performance stays responsive.
- Hold backspace to empty: text shrinks/fades out, cavity returns to empty idle with shimmer/cobweb; hint returns.
- Toggle Wiggle mode: idle motion amplitude increases; pupil hops more.
- Toggle Calm mode: reduced motion softens bobbing and reflow animations while behavior stays correct.
- Resize the window narrower: layout stacks vertically, SVG and UI stay centered and readable.
- (Optional) Debug overlay: in console run `BrainJoke.debug.toggleDebug(true, BrainJoke.textLayout.layoutText('debug lines'))` to see inset and path strokes; toggle off with `false`.

## Smoke inputs
Useful canned strings: `A`, `Curvy brain`, `https://example.com/really/long/url`, a medium paragraph, and `"Super"` repeated many times. Use `BrainJoke.runSmokeTests()` to log density/font picks for these cases.
