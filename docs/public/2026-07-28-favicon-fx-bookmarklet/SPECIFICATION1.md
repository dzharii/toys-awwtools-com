---

A00 Purpose and Scope

---

Favicon FX provides a standalone bookmarklet that creates a temporary favicon animation environment inside the current page. The system must remain dependency-free, must not send page data to external services, must preserve a readable non-minified source, and must restore the original favicon configuration when destroyed.

---

B00 Runtime Architecture

---

The bookmarklet is one self-invoking function with three internal boundaries. The engine owns favicon acquisition, effect registration, frame composition, animation scheduling, state, presets, and restoration. The panel owns presentation and user interaction and communicates only through the engine's public methods and events. The bootstrap layer creates both components, exposes the engine as `window.FaviconFX`, prevents duplicate instances, and coordinates destruction.

The panel uses a Shadow DOM root. This prevents ordinary host-page selectors from restyling the panel and prevents panel styles from leaking into the document. The host element uses a fixed position and the highest conventional signed 32-bit z-index.

---

C00 Favicon Acquisition

---

The loader gathers URLs from `link[rel~="icon"]` and `link[rel="apple-touch-icon"]`, ranks declared sizes from largest to smallest, removes duplicates, and appends the origin's `/favicon.ico` as a final candidate. Each candidate is drawn into a 64 by 64 source canvas. A one-pixel read verifies that the canvas remains origin-clean.

Same-origin images are loaded normally. Cross-origin images are requested anonymously and require appropriate CORS response headers. When all candidates fail, the loader draws a rounded gradient tile containing the first hostname character. This fallback keeps the rendering and UI features operational without contacting a proxy service.

---

D00 Rendering Pipeline

---

Animation uses `requestAnimationFrame` with a 30-frame-per-second rendering gate. Each frame begins as a neutral frame description with time, delta, center, intensity, rotation, scale, offset, opacity, filters, processors, and overlays.

Enabled effects mutate that frame description. The engine first composes transforms, opacity, and Canvas filter strings. It then draws the immutable source canvas. Processor functions perform raster transformations such as pixelation, glitch slicing, mirroring, and trails. Overlay functions finally add elements such as sparkles, scanlines, halos, badges, and eyes. The resulting frame is serialized as a PNG data URL and assigned to the active dynamic favicon link.

This ordering makes combinations predictable. Motion and color effects act on the source draw. Texture effects act on the composed raster. Overlay effects remain visually legible because they are rendered last.

---

E00 Effect Contract

---

`registerEffect(name, definition)` adds an effect to the registry. `name` must be unique. `definition.label` is the panel label. `definition.category` controls panel grouping. `definition.defaults` is copied into mutable per-effect parameters. `definition.apply(frame, params)` mutates the frame or appends processor and overlay callbacks.

`setEffect(name, enabled, params)` changes activation and merges parameters. `toggleEffect(name)` reverses activation. `setEffectParams(name, params)` merges parameters without changing activation. `clearEffects()` disables all effects, resets parameters to their registered defaults, and clears the trail buffer.

An effect must not directly modify document favicon links, panel nodes, or global application state. An effect should derive animation from `frame.time`, respect `frame.intensity` where meaningful, and keep work proportional to the 64 by 64 render surface.

---

F00 Built-in Effects

---

The motion family contains Spin, Wobble, Pulse, Orbit, and Shake. The color family contains Hue Cycle, Fade, Negative, and Neon. The texture family contains Pixelate, Glitch, Mirror, and Trail. The overlay family contains Sparkles, Scanline, Halo, Alert Badge, and Googly Eyes.

The included presets are Disco, Glitch Party, Haunted, Cosmic, Alarm, and Retro. Random Combo clears the current composition and activates between two and five randomly selected effects. Effects remain independently toggleable after any preset is selected.

---

G00 Public API

---

The engine is exposed as `window.FaviconFX` while the bookmarklet is active. Its stable methods are `registerEffect`, `registerPreset`, `setEffect`, `toggleEffect`, `setEffectParams`, `clearEffects`, `playPreset`, `surprise`, `start`, `stop`, `destroy`, `getState`, `on`, `setMasterSpeed`, and `setMasterIntensity`.

`start()` loads the source only on the first invocation, disables original icon links, attaches the dynamic link, and starts scheduling frames. `stop({ restore })` cancels scheduling and optionally restores the original links. `destroy()` performs restoration, releases event listeners, and removes the public engine reference.

`getState()` returns serializable state rather than internal objects. `on(eventName, listener)` returns an unsubscribe function. The current implementation emits `statechange`, `preset`, `frame`, `start`, and `stop` events.

---

H00 User Interface Behavior

---

The panel starts in the upper-right corner and supports pointer-based dragging. The header provides collapse and close controls. Closing destroys the application. Pause stops frame generation without restoring original favicon links, so the last rendered frame remains visible. Resume restarts animation from the preserved source. Restore Favicon stops animation and reinstates original link relations.

Effect buttons reflect enabled state. Preset buttons replace the active combination. Speed ranges from 0.1 to 4.0 times. Intensity ranges from 0.1 to 2.0 times. Re-running the bookmarklet while active toggles panel visibility instead of creating a duplicate engine.

---

I00 Security and Privacy

---

The bookmarklet contains no network endpoint, telemetry, storage, cookies, message passing, dynamic code download, or third-party dependency. It reads favicon link metadata and attempts to load only favicon URLs already declared by the page or the origin's conventional `/favicon.ico` path.

The public API intentionally permits page scripts to inspect or control the temporary engine because bookmarklets execute in the page context. This is not an isolation boundary against a hostile page. The Shadow DOM boundary is for styling and component organization, not security.

---

J00 Known Limitations

---

Cross-origin image rules may prevent access to the actual favicon pixels. Strict Content Security Policy can block `javascript:` execution, Canvas-derived data URLs, or both. Browsers do not permit bookmarklets on privileged internal pages. Rapid favicon animation can consume CPU because each visible frame is PNG-encoded. The implementation limits rendering to 30 frames per second and a 64 by 64 canvas to constrain this cost.

Some browsers cache or throttle favicon updates, especially in background tabs. The visual cadence can therefore be lower than the engine cadence. Animated favicons are decorative and should not be used as a reliable notification channel.

---

K00 Extension Points

---

Additional effects can use the existing stages without changing the engine. Suitable motion additions include pendulum swing, elastic overshoot, and corner-to-corner bouncing. Suitable raster additions include chromatic channel separation, posterization, edge detection, noise, mosaic tiles, and rotating quadrant slices. Suitable overlays include progress rings, clocks, weather glyphs supplied locally by the caller, tiny equalizer bars, comet tails, and state badges.

Effects that require asynchronous data should obtain that data outside `apply` and store a ready value in effect parameters. The per-frame `apply` path should remain synchronous to preserve deterministic ordering and avoid overlapping renders.
