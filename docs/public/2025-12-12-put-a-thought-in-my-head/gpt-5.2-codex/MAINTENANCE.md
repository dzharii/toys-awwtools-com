# Maintenance guide

## Shared global namespace

All JS attaches to one global: `window.BrainJoke`.

- `BrainJoke.config`: tweak timings, density tiers, font bounds, safety caps.
- `BrainJoke.state`: runtime state (current text, reduced motion, last render plan).
- `BrainJoke.services.*`: “module” APIs (scene, geometry, layout, renderer, scheduler).
- `BrainJoke.ui.*`: UI helpers (currently `BrainJoke.ui.input`).
- `BrainJoke.debug`: debug overlay + smoke tests.

## How the brain packing works

1. `js/05-geometry.js` samples the SVG `#cavityPath` boundary into an approximate “available x-span per y”.
2. `js/06-pathgen.js` uses those spans to generate one or two snake-like SVG paths inside the cavity bounds.
3. `js/07-text-layout.js` chooses a density tier from text length, picks a font size to fit path length, and returns a render plan.
4. `js/08-render-brain.js` renders the plan as SVG `<text><textPath>` elements clipped to the cavity.

If you want a different cavity, edit the `d` attribute in `index.html` for `#cavityPath` and the matching rim path in `#skullRim`.

## Where to tweak the “feel”

- Idle motion: `js/03-anim-character.js` and `BrainJoke.config.breathe/sway/saccade/blink`
- Packing density thresholds: `js/07-text-layout.js` (`pickTier`)
- Snake shape style: `js/06-pathgen.js` (row count + turn depth + wobble)
- Brain look: `css/character.css` (`.brain-text`, `.brain-layer`, ripple keyframes)

