# Interface 2037 v1.0.0

---

A00 Run the Application

---

Extract the ZIP archive and open `index.html` in a current desktop browser. No installation, build step, web server, or network connection is required.

The screen begins with a scripted boot sequence. Click the screen or press a key once to allow browser audio playback. Type `HELP` after the inquiry prompt appears.

For stricter browser configurations, serve the directory locally:

```sh
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

---

B00 Controls

---

The upper-right controls become more visible when the pointer is over the screen.

`AUDIO` enables or mutes synthesized sound. `EFFECTS` cycles through FULL, LOW, and OFF. `REPLAY BOOT` restarts the cinematic startup. `SKIP BOOT` advances to the inquiry prompt. `F2` toggles audio from the keyboard.

Terminal commands include `HELP`, `STATUS`, `MATRIX`, `DIAGNOSTIC`, `CLEAR`, `SOUND ON`, `SOUND OFF`, `EFFECTS FULL`, `EFFECTS LOW`, `EFFECTS OFF`, `ABOUT`, `TIME`, and `ECHO <TEXT>`.

---

C00 Implementation

---

The project uses static HTML, CSS, Canvas 2D, and the native Web Audio API. It has no runtime dependencies and downloads no audio samples or fonts.

The rendering pipeline uses separate sharp-core, bloom, and persistence canvases. Character age controls the bright strike, temporary instability, settling glow, and persistent phosphor state. CSS supplies scanlines, vignette, reflection, and screen framing.

The audio engine builds short oscillator and filtered-noise voices for keystrokes, printing, return relays, warning tones, screen wipes, and boot surges. Browser autoplay policy requires one user interaction before sound can begin.

---

D00 File Map

---

`index.html` contains the application shell and accessible input elements.

`styles.css` contains the CRT enclosure, overlays, controls, and responsive behavior.

`app.js` contains the terminal buffer, renderer, sequencer, boot program, command processor, input controller, and procedural audio engine.

---

E00 Browser Notes

---

The application is intended for current versions of Chrome, Edge, Firefox, and Safari. Canvas blur and audio synthesis can vary slightly between browsers. Reduced-motion operating system settings select the LOW effects profile initially.
