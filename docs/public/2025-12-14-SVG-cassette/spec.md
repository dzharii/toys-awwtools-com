2025-12-14
Codex CLI 5.1 High

A00 Scope and intent (rev 00)
This project is a static, dependency-free web application that displays a stylized SVG cassette and provides playback-style controls that drive deterministic visual animation. It is a UI simulation of a cassette player, not an audio player.

B00 Deliverables (rev 00)
The deliverable is three files: index.html, styles.css, and app.js. The app runs in a browser with no build step and no external assets.

C00 User-visible behavior (rev 00)
The page shows an SVG cassette and a control panel with Play/Pause, Stop, Rewind, and Fast Forward buttons, plus a scrubber and a time display. The user can start and stop the animation, change direction, change speed, and scrub to any position in the simulated timeline. The UI updates immediately and continuously while the app is running.

D00 Cassette rendering model (rev 00)
The cassette is drawn as a single inline SVG. The drawing uses explicit geometric primitives: rectangles with corner radii, circles, lines, and a small number of paths for chamfered frames and tape curves. Repeated parts are defined once in <defs> and instantiated with <use>, specifically the screw and reel linework.

The SVG applies a limited color scheme:

* Shell: light gradient fill with dark stroke.
* Label panel: warm gradient fill with dark stroke.
* Window area: dark gradient fill.
* Tape accents: bright strokes inside the center window.
* Status LED: fill color changes by state.

A drop shadow filter is applied to the main cassette group to visually separate it from the background.

E00 Animation model (rev 00)
All motion is driven from JavaScript using requestAnimationFrame. The app maintains a simulation clock (state.t) measured in seconds, bounded to [0, DURATION_SEC]. The simulation clock is the single source of truth for progress.

The animation updates three visual subsystems:

1. Reel rotation
   Two reel groups are rotated about their centers. The left and right reels rotate in opposite directions with a slight ratio difference to make the motion feel less mechanical. Rotation is applied by setting the transform attribute on inner reel groups (reelLRot and reelRRot).

2. Tape travel indication
   The tape inside the center window uses dashed strokes. Motion is represented by changing stroke-dashoffset over time. Three elements participate: tapeTop, tapeBottom, and tapeMid, each using a different offset multiplier for variation.

3. Tape amount indication
   Two semi-transparent circles behind the reels represent tape on each spool. Their radii vary as a function of progress p = state.t / DURATION_SEC. As p increases, left radius decreases and right radius increases. This produces the expected transfer of tape from one reel to the other.

F00 Playback states and transitions (rev 00)
The app implements five logical modes: stop, play, pause, ff, rew.

State semantics:

* stop: speed 0, animation visuals remain at current position, status LED neutral.
* pause: speed 0, same as stop but UI reports paused and LED indicates paused.
* play: speed +1.
* ff: speed +4.
* rew: speed -4.

Transitions:

* Play button toggles play <-> pause. If in ff or rew, Play switches to play. If stopped, Play switches to play.
* Stop button sets mode to stop and stops advancement.
* Rewind button toggles rew <-> play (pressing while rew returns to play).
* Fast Forward button toggles ff <-> play (pressing while ff returns to play).

Bounds:
When state.t reaches 0 during rew, the app switches to stop.
When state.t reaches DURATION_SEC during play or ff, the app switches to stop.

G00 Timeline and scrubber behavior (rev 00)
The timeline duration is fixed at 3 minutes 30 seconds (DURATION_SEC = 210). The scrubber is a range input with values 0..1000. The scrubber value maps linearly to time by p = value / 1000 and t = p * DURATION_SEC.

Scrubbing rules:

* While dragging the scrubber (pointerdown), the app sets a dragging flag and switches to pause unless already stopped. This prevents time from advancing during the drag.
* On input events, the app updates state.t from the scrubber and applies animation transforms immediately.
* On pointerup, dragging ends and the app remains in its current mode (typically pause unless the user resumes).

The time display shows current time and total duration in mm:ss. Formatting uses zero-padded minutes and seconds.

H00 UI layout and styling (rev 00)
The UI uses a two-column layout on wide screens: cassette on the left and control panel on the right. On narrow screens it collapses to a single column.

Styling goals:

* High contrast dark background with soft gradients.
* Panel and cassette container use semi-transparent backgrounds with blur and a strong shadow.
* Buttons use consistent sizing and rounded corners.
* Primary action (Play/Pause) uses a distinct gradient and higher visual weight.
* Focus-visible states are supported for keyboard navigation via a visible ring.

The UI uses only system fonts and standard CSS features.

I00 Keyboard controls (rev 00)
The app supports keyboard shortcuts:

* Space: play/pause toggle.
* S: stop.
* R: rewind toggle.
* F: fast forward toggle.

Space prevents default page scrolling to make the control reliable.

J00 DOM structure and identifiers (rev 00)
The app relies on stable element IDs for wiring behavior:

* Reels: reelLRot, reelRRot.
* Tape stroke elements: tapeTop, tapeBottom, tapeMid.
* Tape fill circles: tapeLeftFill, tapeRightFill.
* Status LED: statusLed.
* Controls: playBtn, stopBtn, rewBtn, ffBtn.
* Labels: modeText, timeText, durText.
* Scrubber: scrub, scrubFillInner.

The JavaScript looks up these elements once at startup and updates them in the animation loop.

K00 Implementation constraints (rev 00)

* No external libraries, no external fonts, no build tooling.
* Animation uses requestAnimationFrame only.
* Visual changes use direct DOM attribute and style updates.
* The cassette drawing is inline SVG to avoid loading and CORS issues and to allow direct element targeting.

L00 Extension points (rev 00)
The current structure supports the following extensions without redesign:

* Variable duration and dynamic label text.
* Additional states (record, eject) and corresponding animations.
* More realistic tape geometry (masking, clipping, and continuous tape path between reels).
* Sound integration by coupling state.t to an audio element and syncing play/pause/seek.
* Theme variants by swapping CSS variables and SVG gradient stops.
* Accessibility improvements such as aria-live updates for state changes and larger touch targets.
