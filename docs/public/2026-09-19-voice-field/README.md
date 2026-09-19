# voice-field

`voice-field` is a dependency-free, voice-reactive visual instrument for the web.
It presents a clean, text-free Stage that external screen-recording software can
capture while the surrounding Control Frame remains available for live creative
changes.

The application does **not** record or encode video. It does **not** produce or
monitor audio. Microphone samples are analyzed locally in the browser and are never
uploaded, transcribed, or sent to a service.

## Requirements and local use

Use a current desktop browser with WebGPU support. Microphone capture requires a
secure context; `localhost` is accepted by browsers for development.

```bash
bun run build
python3 -m http.server 8000
```

Open `http://localhost:8000/` to run the source version. The production artifact is
written to `dist/`; serve that directory to verify exactly what GitHub Pages will
publish:

```bash
cd dist
python3 -m http.server 8001
```

The build is a static copy/validation step; it does not bundle or transform the native
modules. The toys directory and RSS feed link to
`/public/2026-09-19-voice-field/dist/`, so run `bun run build` and commit the refreshed
`dist/` directory whenever publishing new content. The shipped site uses relative
paths and has no runtime package, CDN, backend, account, database, or
environment-variable requirement.

## Using the instrument

1. Choose **Enable mic** and grant audio permission. If permission is unavailable,
   the Stage continues with Idle Motion.
2. Select a Preset and optionally adjust its Palette, Energy, Motion, Detail, Voice
   Influence, Excitation Drift, Idle Motion, or Voice Trace.
3. Select `16:9`, `9:16`, or `1:1` for the Stage.
4. In external recording software, capture only the visible bordered Stage. All
   application controls and status text are outside that boundary.

On mobile, configure the scene in Compose Mode, then swipe horizontally across a
non-control area or use **Enter Performance**. Performance Mode hides editing chrome
and prioritizes the Stage. Swipe again to return; a temporary Compose escape control
also appears after entering the mode.

## Source configuration

- Presets: `src/js/config/presets.js`
- Palettes: `src/js/config/palettes.js`
- Defaults: `src/js/config/defaults.js`
- Style metadata: `src/js/render/styles/`
- Procedural WebGPU materials: `src/js/render/field-shader.js`
- Favicons and social previews: `assets/`

Valid Style identifiers are `silk`, `membrane`, `liquid`, `chrome`, `nebula`,
`particles`, and `ember`. Valid Voice Trace identifiers are `bars`, `soft-bars`,
`poles`, and `minimal`.

Energy, Motion, Detail, Voice Influence, Excitation Drift, Idle Motion, trace
smoothing, and trace intensity are normalized numbers from `0` to `1`.

### Add a Preset

Copy an object in `PRESETS`, give it a unique key and label, select any valid Style
and Palette key, and tune the normalized values. A Preset combines the material Style,
Palette, expressive controls, and Voice Trace configuration. It appears in both the
Preset selector and the Wide Desktop browser automatically.

Change `DEFAULTS.scene.preset` to choose the startup Preset. The referenced key must
exist in `PRESETS`. Runtime changes remain session-scoped; source definitions remain
authoritative, and **Reset to preset** restores them without interrupting audio.

### Add a Palette

Copy an entry in `PALETTES`, give it a unique key, and provide three hex colors, a dark
background, and a restrained accent color. Every Style can use every Palette. Palette
options and quick-select chips are derived automatically from this data.

## Architecture and privacy

The render loop sends normalized semantic features—envelope, low/mid/high energy,
Speech Impulse, phrase activity, and silence duration—to the GPU. The Excitation Point
wanders continuously inside a bounded area, and recent impulses remain in a reusable
ring of renderer state while they propagate and decay. No raw FFT array is exposed as
the visual composition.

The Web Audio graph terminates at an `AnalyserNode`; it is intentionally never
connected to the audio destination. All graphics, icons, shaders, controls, and fonts
are local or browser-native.

## Tests

```bash
bun test
bun run test:browser
```

Unit tests cover deterministic voice-feature evolution and bounded excitation motion.
The browser suite validates the production `dist/` build and covers controls, Stage
ratios, responsive states, mobile swiping, text-free Stage, scene transitions, and the
synthetic feature injection seam used for repeatable reactive tests.
