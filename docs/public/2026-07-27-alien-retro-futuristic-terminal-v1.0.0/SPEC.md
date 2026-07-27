---

A00 Retro-Futuristic Terminal Design Note

---

The target is a self-contained browser experience resembling a 1970s cinematic spacecraft terminal. It should not behave like a modern terminal with a green theme. The illusion depends on coordinated typography, phosphor persistence, unstable raster behavior, mechanical pacing, deliberate pauses, and synthesized sound.

The first release should use standard HTML, CSS, Canvas 2D, and the Web Audio API. It should have no runtime framework and no external audio samples. The only optional packaged dependency is a self-hosted font.

The recommended implementation decision is:

| Area                 | Decision                                     |
| -------------------- | -------------------------------------------- |
| Text rendering       | Canvas 2D                                    |
| Input capture        | Hidden native `textarea`                     |
| Screen treatment     | Canvas rendering plus CSS overlays           |
| Animation            | `requestAnimationFrame()`                    |
| Sound                | Native Web Audio API                         |
| Audio samples        | None                                         |
| Runtime dependencies | None                                         |
| Font                 | Self-hosted IBM Plex Mono WOFF2              |
| Build tool           | Optional Vite during development             |
| Production output    | Static HTML, CSS, JavaScript, and font files |

Canvas 2D is sufficient for the initial version. WebGL would add substantial complexity without solving a current requirement.

---

B00 Reference Analysis

---

The uploaded frames contain several distinct visual behaviors that should be reproduced separately rather than approximated with one large CSS `text-shadow`.

The screen background is not pure black. It is a very dark green-black with uneven illumination and a vignette. Text has a narrow, nearly white center surrounded by a saturated green halo. The brightest characters temporarily bloom much more strongly than settled characters.

During initialization, characters appear in unstable matrices. Rows contain random symbols, fragments, horizontal rules, and bright blocks. The screen gradually becomes ordered, eventually producing the address matrix and then the inquiry prompt.

The text-entry sequence uses a moving bright print head. The newest character is nearly white and heavily bloomed. Recently written characters remain brighter than older characters, producing a short phosphor trail. The cursor is a glowing block rather than a modern thin caret.

The terminal should therefore model character age. A character is not simply visible or invisible. It moves through approximately four states:

| State      | Approximate duration | Appearance                              |
| ---------- | -------------------: | --------------------------------------- |
| Strike     |          10 to 25 ms | White core, large green bloom           |
| Resolve    |          25 to 90 ms | Slight glyph instability or overstrike  |
| Settle     |         90 to 350 ms | Stable green glyph with shrinking bloom |
| Persistent |           Indefinite | Dimmer green glyph with subtle flicker  |

This age-based rendering is the central visual mechanism.

---

C00 Research Conclusions

---

Dittytoy demonstrates the relevant conceptual model: JavaScript code generates sound directly in the browser through the Web Audio API instead of arranging recorded samples. Its source examples are visible, but the project explicitly advises checking each work's license before publishing a remix. The implementation should therefore study synthesis techniques without copying individual compositions or unlicensed code. ([Dittytoy][1])

SoundBox is especially relevant because it demonstrates a synthetic browser music system written in pure HTML, JavaScript, and CSS without a third-party toolkit. Its editor is GPL-licensed, while its small player has a more permissive zlib license. We should not incorporate the editor code. The simpler and safer approach is to write a small original sound engine using native Web Audio nodes. ([GitHub][2])

Sonant-X Live confirms that a compact JavaScript synthesizer can support browser applications and small demos without requiring a large audio framework. Its design is useful as evidence that the proposed terminal sound layer can remain small. ([GitHub][3])

Longwave uses a more sophisticated engine, but its useful design principle is that evolving sound can be generated from oscillators, filters, algorithmic variation, and synthesis rather than replayed loops. The terminal should adopt that principle on a much smaller scale. ([Longwave][4])

---

D00 Application Architecture

---

The application should be divided into four systems with narrow interfaces.

```text
Input System
    |
    v
Terminal Controller
    |
    +------> Output Sequencer
    |             |
    |             +------> Terminal Buffer
    |             +------> Audio Engine
    |
    +------> Command Processor
                  |
                  +------> Output Sequencer

Terminal Buffer
    |
    v
Canvas Renderer
    |
    v
CRT Composite
```

The Terminal Controller owns the current application mode, command history, prompt state, and boot sequence.

The Output Sequencer translates strings and scripted events into timed character operations. It is responsible for pacing, pauses, overstrikes, line wipes, cursor movement, and corresponding audio cues.

The Terminal Buffer stores logical cells. It must not contain rendering code.

The Canvas Renderer converts the buffer into pixels and applies age-based glow, flicker, temporary distortion, and persistence.

The Audio Engine receives semantic events such as `key`, `print`, `return`, `warning`, or `bootSweep`. It should not know about commands or screen coordinates.

---

E00 Suggested File Layout

---

```text
retro-terminal/
    index.html
    package.json
    src/
        app.js
        terminal-controller.js
        terminal-buffer.js
        terminal-renderer.js
        output-sequencer.js
        audio-engine.js
        command-processor.js
        boot-program.js
        config.js
        styles.css
    assets/
        fonts/
            ibm-plex-mono-500.woff2
            LICENSE.txt
```

This can later be collapsed into fewer files for distribution. During development, separating the buffer, renderer, scheduler, and audio engine will make timing defects easier to isolate.

A production build should contain no module downloaded from a CDN. The browser should be able to run the application offline after the static files are loaded.

---

F00 Terminal Data Model

---

The terminal should use a fixed logical grid, initially approximately 72 columns by 24 rows. The canvas scales the grid to the available viewport while preserving a 16:9 presentation area.

Each cell needs more information than a character value.

```js
{
  char: "A",
  writtenAt: 1042.8,
  intensity: 0.82,
  mode: "normal",
  seed: 31872,
  dirty: true
}
```

`writtenAt` controls phosphor decay. `intensity` allows headings, output, prompts, warnings, and dim diagnostic data to use different brightness levels. `mode` can represent normal text, underlines, horizontal rules, cursor blocks, corrupted glyphs, or inverted cells. `seed` provides deterministic visual instability without calling `Math.random()` repeatedly during rendering.

The buffer should expose operations such as:

```js
buffer.write(x, y, char, options);
buffer.writeText(x, y, text, options);
buffer.clearRow(y);
buffer.scroll(lines);
buffer.drawRule(x1, x2, y);
buffer.setCursor(x, y);
```

The controller should never draw directly to Canvas.

---

G00 Rendering Pipeline

---

The renderer should maintain three internal canvases.

```text
glyphCanvas     Full resolution, sharp glyph cores
glowCanvas      Quarter or half resolution, blurred bloom
historyCanvas   Previous luminous frame for persistence
```

At each frame, the renderer performs this sequence:

```text
1. Fade the history canvas slightly.
2. Render dirty or animated glyphs onto the glyph canvas.
3. Render bright glyph masks onto the lower-resolution glow canvas.
4. Blur and enlarge the glow canvas.
5. Composite history, glow, and sharp glyphs using additive blending.
6. Render transient cursor flashes and horizontal raster streaks.
7. Present the composite to the visible canvas.
```

Canvas compositing supports additive operations such as `lighter`, which is suitable for building luminous overlaps and bloom. `requestAnimationFrame()` should drive the display, and repeated static content should be cached rather than reconstructed on every frame. Device pixel ratio should be handled explicitly, but capped at approximately `2` to avoid excessive high-DPI rendering cost. ([MDN Web Docs][5])

The visible text color should be configurable rather than hard-coded:

```js
export const SCREEN_PROFILE = {
  background: "#020806",
  phosphor: "#42ffad",
  hotCore: "#efffd9",
  dimText: "#2acb87",
  columns: 72,
  rows: 24,
  bloomRadius: 12,
  persistenceMs: 260,
  flickerAmount: 0.018,
  jitterAmount: 0.22,
  scanlineOpacity: 0.055,
  curvature: 0.012
};
```

The renderer should use a small glyph atlas. Each printable character is rasterized once at several intensity levels. The atlas avoids repeated `fillText()` calls and produces stable glyph geometry while still allowing the surrounding glow to animate.

---

H00 CSS CRT Composite

---

Canvas should produce the actual terminal content. CSS should provide inexpensive screen-wide effects.

The terminal container should use pseudo-elements for scanlines, fine grain, edge darkening, and a slow vertical interference band. These layers should have `pointer-events: none`.

```css
.terminal-screen::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.018) 0,
      rgba(255, 255, 255, 0.018) 1px,
      rgba(0, 0, 0, 0.025) 2px,
      rgba(0, 0, 0, 0.025) 4px
    );
  pointer-events: none;
}

.terminal-screen::after {
  content: "";
  position: absolute;
  inset: -4%;
  background:
    radial-gradient(
      ellipse at center,
      transparent 45%,
      rgba(0, 0, 0, 0.42) 100%
    );
  pointer-events: none;
}
```

The screen should not flicker by rapidly changing the opacity of the entire interface. That generally looks like a damaged modern monitor. Instead, apply very small luminance fluctuations to the glow layer and occasional horizontal disturbances to selected rows.

A reduced-effects mode should disable bloom pulses, glyph substitutions, moving interference, and aggressive flicker. It should be automatically selected when `prefers-reduced-motion` is active, with a manual override available.

---

I00 Typography

---

IBM Plex Mono is a practical starting point because it can be self-hosted as WOFF2 and is available through the Fontsource package. Fontsource documents installation through `npm install @fontsource/ibm-plex-mono`, after which the required font file can be copied into the static assets directory. ([Fontsource][6])

The final result should not rely on the font alone. The screenshots use wide spacing and optical distortion that can be approximated by Canvas transforms:

```js
ctx.save();
ctx.translate(x, y);
ctx.scale(1.06, 0.96);
ctx.fillText(char, 0, 0);
ctx.restore();
```

Recommended initial settings are a medium font weight, uppercase output, 0.08 to 0.14 em visual letter spacing, and line height near 1.45 character heights.

For stronger resemblance, the glyph atlas can selectively modify shapes. For example, `O`, `0`, `I`, `1`, and `R` can be rendered from alternate glyphs or lightly stretched. This is preferable to downloading an ambiguously licensed commercial OCR font.

---

J00 Output Sequencer

---

Machine-generated output and user input should not use the same timing profile.

```js
const PRINT_PROFILES = {
  user: {
    charsPerSecond: 18,
    variation: 0.18,
    sound: "key"
  },

  computer: {
    charsPerSecond: 26,
    variation: 0.08,
    sound: "print"
  },

  heading: {
    charsPerSecond: 13,
    variation: 0.04,
    sound: "printHeavy"
  },

  burst: {
    charsPerSecond: 70,
    variation: 0.12,
    sound: "printLight"
  }
};
```

The sequencer should understand control events in addition to text:

```js
[
  { type: "text", value: "INTERFACE 2037", profile: "heading" },
  { type: "pause", duration: 420 },
  { type: "text", value: " READY FOR INQUIRY", profile: "heading" },
  { type: "rule", from: 0, to: 38 },
  { type: "pause", duration: 700 },
  { type: "prompt" }
]
```

For cinematic output, approximately one character in every 20 to 40 characters can briefly show an incorrect glyph for one or two frames before resolving. This should be controlled by a seeded generator so recorded demonstrations remain reproducible.

Long lines may occasionally appear through a horizontal wipe rather than character-by-character printing. Diagnostic matrices should use bursts, pauses, and simultaneous row fragments. The boot process should not resemble a conventional terminal log.

---

K00 Boot State Machine

---

The boot sequence should be deterministic and scripted.

```text
DARK
  |
  v
POWER_SURGE
  |
  v
UNSTABLE_MATRIX
  |
  v
ADDRESS_MATRIX
  |
  v
INTERFACE_SELECTED
  |
  v
READY
  |
  v
INQUIRY
```

`POWER_SURGE` introduces isolated blocks and low-frequency hum.

`UNSTABLE_MATRIX` fills several rows with pseudo-random alphanumeric fragments, rules, short flashes, and partial labels.

`ADDRESS_MATRIX` gradually replaces corrupted data with a readable two-column system table.

`INTERFACE_SELECTED` clears most of the screen and leaves `INTERFACE 2037`.

`READY` prints and underlines `INTERFACE 2037 READY FOR INQUIRY`.

`INQUIRY` activates the input cursor and command processor.

The full sequence should last approximately 7 to 12 seconds, with a developer shortcut that skips directly to `INQUIRY`.

---

L00 Input Architecture

---

A visually hidden native `textarea` should capture keyboard, paste, composition, and mobile input. Canvas-only keyboard handling is insufficient for input methods, accessibility, and virtual keyboards.

The textarea value is mirrored into the logical terminal buffer. The visible caret remains a Canvas-rendered block.

```html
<textarea
  id="terminal-input"
  autocomplete="off"
  autocapitalize="characters"
  spellcheck="false"
  aria-label="Terminal inquiry"
></textarea>
```

The initial terminal should support printable characters, Backspace, Delete, Enter, Arrow Up, and Arrow Down. History navigation can use a small in-memory command list.

The command processor should be independent of the renderer:

```js
commands.register("STATUS", statusCommand);
commands.register("HELP", helpCommand);
commands.register("CLEAR", clearCommand);
commands.register("MATRIX", matrixCommand);
commands.register("SOUND", soundCommand);
```

Command handlers return output events rather than mutating Canvas.

---

M00 Web Audio Architecture

---

Web Audio uses a modular graph built from sources, gain controls, filters, and destination nodes. That makes it appropriate for a small procedural sound engine without prerecorded assets. ([MDN Web Docs][7])

The shared output graph should be:

```text
Voice Sources
    |
    v
Effects Bus
    |
    +--> High-pass filter
    |
    +--> Low-pass filter
    |
    +--> Soft saturation
    |
    +--> Dynamics compressor
    |
    +--> Master gain
    |
    v
Audio destination
```

Suggested master parameters:

```js
{
  highpassHz: 90,
  lowpassHz: 4800,
  saturation: 0.18,
  masterGain: 0.07
}
```

The sound should resemble a small electromagnetic mechanism, not a modern keyboard switch.

| Event           | Synthesis                                             |
| --------------- | ----------------------------------------------------- |
| User key        | 5 to 12 ms square pulse plus high-passed noise        |
| Computer print  | Softer triangle pulse with narrow frequency variation |
| Space           | Very quiet noise tick                                 |
| Backspace       | Descending square chirp                               |
| Enter           | Relay clack followed by a short two-note confirmation |
| Error           | Detuned dual oscillator with tremolo                  |
| Cursor ready    | Very quiet periodic electrical pulse                  |
| Boot surge      | Filtered noise sweep with a low sine component        |
| Horizontal wipe | Narrow-band noise moving through a band-pass filter   |

Noise should be produced locally by filling a small `AudioBuffer` with pseudorandom values. It should not be downloaded as a sample.

Each event should schedule its envelope using `AudioParam` timing:

```js
gain.gain.setValueAtTime(0.0001, now);
gain.gain.exponentialRampToValueAtTime(level, now + 0.002);
gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
```

The engine should cap simultaneous voices, for example at 16, and stop every oscillator explicitly. This prevents rapid typing from accumulating unnecessary nodes.

---

N00 Audio Initialization and Scheduling

---

Browsers commonly block audible Web Audio playback before the user interacts with the page. The `AudioContext` should therefore be created or resumed from the first pointer or keyboard interaction. ([MDN Web Docs][8])

```js
async function ensureAudioReady() {
  audioEngine.createContext();

  if (audioEngine.context.state === "suspended") {
    await audioEngine.context.resume();
  }
}
```

Visual printing should not depend on a `setTimeout()` callback for every character. The sequencer should maintain a queue based on a monotonic timeline. Audio should be scheduled slightly ahead using `audioContext.currentTime`, while visual events are consumed during `requestAnimationFrame()`.

```text
Visual look-ahead: 0 to 1 frame
Audio look-ahead: approximately 40 ms
Scheduler interval: approximately 20 ms
```

This separates audio timing from occasional main-thread rendering delays.

An `AudioWorklet` is unnecessary for the first release. It is useful for custom low-latency audio processing on the audio rendering thread, but it requires additional files and a secure context. It should only be introduced if the basic node graph cannot produce a required effect. ([MDN Web Docs][9])

---

O00 Dependency and Licensing Policy

---

The browser runtime should have zero JavaScript dependencies.

NPM may be used for development tooling and obtaining the font package:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "vite": "latest",
    "@fontsource/ibm-plex-mono": "latest"
  }
}
```

Versions should be pinned when implementation begins rather than leaving `latest` in the committed project.

The final build should copy only the selected WOFF2 font and its license. The Fontsource JavaScript package does not need to remain part of the deployed runtime.

Code from Dittytoy compositions should not be copied without checking the individual license. SoundBox GPL editor code should not be incorporated into a differently licensed project. Sonant-X or the permissively licensed SoundBox player could legally be evaluated, but an original 200 to 400 line terminal sound engine is likely smaller and easier to maintain. ([Dittytoy][1])

---

P00 Performance Constraints

---

The target should remain smooth on an ordinary integrated GPU.

| Constraint                  |                               Target |
| --------------------------- | -----------------------------------: |
| Logical resolution          |             Approximately 1280 x 720 |
| Maximum device pixel ratio  |                                    2 |
| Normal frame rate           |                               60 fps |
| Reduced-power frame rate    |                               30 fps |
| Maximum active audio voices |                                   16 |
| Glow canvas resolution      |                     25 to 50 percent |
| Maximum terminal cells      |                  Approximately 2,000 |
| Runtime JavaScript target   | Below 40 KB minified, excluding font |
| Font payload target         |                         Below 100 KB |

Static cells should be redrawn only when their age-based glow is still changing or when the row becomes dirty. Once a character reaches its persistent state, it can be cached into a settled-text layer.

Background grain and scanlines should remain CSS effects rather than per-pixel JavaScript operations.

---

Q00 Accessibility and User Controls

---

The application should expose visible controls for sound, effect strength, boot replay, and reduced motion. These controls can be visually hidden until the pointer reaches the screen edge.

The logical transcript should also be mirrored into an offscreen live region. It should not announce every boot corruption character. Only stable computer output and submitted user commands should be exposed to assistive technology.

The default audio level should be conservative. Typing sounds become fatiguing quickly, particularly with headphones. Sound should be mutable with one key, such as `F2` or `Ctrl+M`.

---

R00 Implementation Sequence

---

Phase 1 should establish the fixed-grid buffer, Canvas typography, responsive scaling, prompt input, and basic character reveal. No bloom or sound is required at this stage.

Phase 2 should add the glyph atlas, age-based intensity, glow canvas, cursor block, scanlines, vignette, and persistence.

Phase 3 should implement the Web Audio graph and five core events: key, print, Enter, error, and boot sweep.

Phase 4 should implement the scripted boot state machine, address matrix transition, line wipes, random symbol resolution, and terminal commands.

Phase 5 should add performance caching, reduced-motion behavior, mobile input support, sound controls, and cross-browser testing.

The first usable milestone is reached when the terminal can display:

```text
INTERFACE 2037 READY FOR INQUIRY
________________________________

> WHAT'S THE STATUS
```

with a bright moving print head, decaying phosphor trail, cursor block, and synchronized synthetic typing sounds.

---

S00 Acceptance Criteria

---

The implementation is complete when the experience meets the following conditions.

| Area              | Required behavior                                                                            |
| ----------------- | -------------------------------------------------------------------------------------------- |
| Startup           | Progresses from unstable data to a readable inquiry screen                                   |
| Typography        | Uppercase, wide, mechanically spaced, and not visually identical to a normal HTML text block |
| Printing          | Every new character has a bright strike and visible decay                                    |
| Cursor            | Solid luminous block with irregular pulse                                                    |
| Sound             | Entirely synthesized in-browser without downloaded samples                                   |
| Input             | Supports desktop keyboard, paste, IME, and mobile keyboard                                   |
| Timing            | Computer output supports variable rate, pauses, and burst printing                           |
| Performance       | Maintains smooth animation at 1280 x 720                                                     |
| Dependencies      | No runtime framework                                                                         |
| Offline operation | Works from locally hosted static files                                                       |
| Accessibility     | Provides muted and reduced-effects modes                                                     |
| Licensing         | Font license included and borrowed code avoided or properly attributed                       |

This experimental interface is an original sketch inspired by the retro-futuristic MU-TH-UR ("Mother") computer terminal depicted in Alien (1979). It is not a complete reproduction and is not affiliated with or endorsed by the film's rights holders.

[1]: https://dittytoy.net/about "About | Dittytoy"
[2]: https://github.com/mbitsnbites/soundbox "GitHub - mbitsnbites/soundbox: SoundBox is an HTML5 synth music tracker/editor, suitable for creating music for small JavaScript demos (4K / 8K). · GitHub"
[3]: https://github.com/nicolas-van/sonant-x-live "GitHub - nicolas-van/sonant-x-live: Tracker web application to compose music in a brower · GitHub"
[4]: https://longwave.seethroughlab.com/ "Longwave — generative ambient audio"
[5]: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation?utm_source=chatgpt.com "CanvasRenderingContext2D: globalCompositeOperation property - Web APIs | MDN"
[6]: https://fontsource.org/fonts/ibm-plex-mono/install?utm_source=chatgpt.com "IBM Plex Mono | Install | Fontsource"
[7]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API?utm_source=chatgpt.com "Web Audio API - Web APIs | MDN"
[8]: https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay?utm_source=chatgpt.com "Autoplay guide for media and Web Audio APIs - Media | MDN"
[9]: https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletNode?utm_source=chatgpt.com "AudioWorkletNode - Web APIs | MDN"
