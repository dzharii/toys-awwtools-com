# Typewriter
Date: 2025-10-16

**Updated:** 2025-11-02 - Added Controller Vibration Support

### Technical Specification Document

**Project Title:** Typewriter Experience Application (Vanilla HTML/JS/CSS, No Frameworks)
 **Document Type:** Full Technical Specification
 **Prepared For:** Frontend Developers implementing a static, local, self-contained typewriter simulation

------

## 🎮 NEW: Controller Vibration Feature

This typewriter simulator now includes haptic feedback through game controller vibration:

### Features:
- **Connect Controller Button**: Scans for and connects to compatible game controllers (PlayStation, Xbox, etc.)
- **Test Vibration**: Tests controller vibration to ensure it's working
- **Enable on Typing Checkbox**: Toggle vibration feedback while typing
- **Status Display**: Shows connection status and controller name

### How to Use:
1. Click "Connect Controller" button
2. Press any button on your controller to establish connection
3. Click "Test Vibration" to verify it works
4. Check "Enable on Typing" to activate vibration while typing
5. Start typing to feel haptic feedback with each keystroke

### Controller Support:
- Works with any controller that supports the Gamepad API
- Tested with PlayStation 4 DualShock (via DS4Windows)
- Xbox controllers work natively
- Switch Pro controllers and other standard gamepads

### Vibration Intensity:
- Regular keys: Light vibration (50ms)
- Backspace/Tab: Medium vibration (60ms)
- Enter key: Stronger vibration (80ms)

------

## 1. Project Essence and Implementation Philosophy

This project simulates the **experience of using a mechanical typewriter**, blending visual fidelity and interactive realism. It is built exclusively with **vanilla JavaScript, HTML, and CSS**, adhering to a **legacy-compatible style** that enables the app to run **entirely offline** and **without any build tools or external dependencies**.

The final application should:

- Run when opening `index.html` via `file://` or when deployed as static assets.
- Simulate typing on a physical typewriter using visual, audible, and interactive cues.
- Feature a **pseudo-3D keyboard** rendered with SVG.
- Support interaction via both **hardware keyboard** and **virtual (clickable) keyboard keys**.
- Display a vertically growing **paper simulation** (styled textarea) that appears to roll out of the typewriter as the user types.
- Provide **real-time audio feedback** for typing actions using **Web Audio API** only (no audio file assets).
- Include a **selectable sound profile** dropdown for customizing the typing experience with multiple sound styles.

------

## 2. Layout and Visual Structure

The screen is vertically organized into three main regions:

### 2.1 Background Layer

- Rendered via CSS using an **SVG image** (e.g., low-poly room or subtle abstract geometric pattern).
- Light and unobtrusive; background must not interfere with readability.
- Implemented with a `#background` `<div>` with CSS `background-image`.

### 2.2 Paper (Typing Surface)

- A `<textarea>` styled to resemble a **sheet of paper**.
- Initially supports ~5 lines of text.
- Grows upward **infinitely** as new lines are added.
- Positioned in the center-top portion of the screen.
- Responsive and horizontally centered with ~80% width of the viewport.
- Styled with shadows, borders, and background to create the illusion of depth and realism.

### 2.3 SVG Typewriter Keyboard

- Located at the **bottom** of the viewport (`position: fixed; bottom: 0`).
- SVG-based layout mimicking a mechanical keyboard (pseudo-3D styling).
- Each key is represented by an individual `<rect>` + `<text>` element.
- Keys support:
  - Highlighting on hardware keyboard input.
  - Clickable interaction via mouse.
- Appears visually “pressed” when interacted with.

------

## 3. Functional Behavior

### 3.1 Hardware Keyboard Support

- Captures `keydown` and `keyup` events.
- Highlights the corresponding SVG key visually (`.active` class).
- Types the character into the paper (textarea).
- Plays a typing sound based on the currently selected sound profile.
- On `Enter`:
  - Inserts a newline.
  - Plays a **ding** sound (distinct from keypresses).
  - Expands the paper height as needed.

### 3.2 Virtual Keyboard (Mouse Input)

- Clicking an SVG key inserts the corresponding character into the paper.
- Triggers the same key highlight and sound feedback.
- Clicking `Enter` key triggers newline, ding, and paper expansion.

### 3.3 Paper Growth Logic

- As the user types and presses `Enter`, the `<textarea>` grows vertically by adjusting `height` based on `scrollHeight`.
- The typewriter (keyboard) remains pinned to the bottom at all times.

------

## 4. HTML Structure Example

```html
<body>
  <div id="background"></div>

  <div id="controls">
    <label for="sound-select">Sound Profile:</label>
    <select id="sound-select">
      <option value="classic">Classic Mechanical</option>
      <option value="soft">Soft Press</option>
      <option value="clacky">Clacky High Pitch</option>
      <option value="thud">Heavy Thud</option>
      <option value="beep">Digital Beep</option>
      <option value="random">Random Per Key</option>
    </select>
  </div>

  <div id="paper-container">
    <textarea id="paper" spellcheck="false"></textarea>
  </div>

  <div id="typewriter">
    <svg id="keyboard" viewBox="0 0 800 200">
      <!-- Example key -->
      <rect class="key" x="20" y="100" width="40" height="40" rx="5" data-key="A"></rect>
      <text x="40" y="125" text-anchor="middle" dominant-baseline="middle">A</text>
      <!-- Additional keys defined similarly -->
    </svg>
  </div>

  <script src="script.js"></script>
</body>
```

------

## 5. Styling Guidelines (CSS)

### 5.1 Visual Design Goals

- **Pseudo-3D** keys using gradients and shadows.
- **Fixed-position keyboard** with layered `z-index`.
- Growing, scrollable, editable “paper” styled as an actual sheet.
- Dropdown placed near top-right for selecting sound style.

------

## 6. Audio Feedback Implementation (Web Audio API)

### 6.1 Requirement

- No external `.wav` or `.mp3` files used.
- All sound feedback is **synthesized using the Web Audio API**.
- Sound feedback is tied to:
  - **Keypress events** (per character).
  - **Enter key** (distinct *ding* tone).
- Must provide **immediate feedback** upon interaction.
- Sound engine must switch profiles **instantly** when user selects a new sound option.

### 6.2 Sound Profiles

| ID        | Description                                                  |
| --------- | ------------------------------------------------------------ |
| `classic` | Realistic mechanical switch: short low-pitch “clack”. Pleasant and full. |
| `soft`    | Damped soft press, subtle low-volume tap, gentle attack.     |
| `clacky`  | High-pitched plastic “click”, simulates older terminal keyboards. |
| `thud`    | Deep, resonant, exaggerated bottom-heavy thunk. Strong attack. |
| `beep`    | Digital short tone, retro beep simulation.                   |
| `random`  | Picks a random variant sound on each keypress from a pool.   |

------

### 6.3 Audio Engine Structure

```javascript
let audioContext = new AudioContext();
let currentProfile = 'classic';

function playKeySound(profile) {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  let freq = 180;
  let duration = 0.05;

  switch (profile) {
    case 'classic':
      freq = 180; break;
    case 'soft':
      freq = 140; gain.gain.value = 0.05; break;
    case 'clacky':
      freq = 300; break;
    case 'thud':
      freq = 90; gain.gain.value = 0.2; break;
    case 'beep':
      freq = 600; break;
    case 'random':
      freq = 100 + Math.random() * 600; break;
  }

  osc.type = 'square';
  osc.frequency.setValueAtTime(freq, audioContext.currentTime);
  gain.gain.setValueAtTime(0.1, audioContext.currentTime);
  osc.connect(gain).connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + duration);
}

function playDing() {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, audioContext.currentTime); // High-pitch ding
  gain.gain.setValueAtTime(0.2, audioContext.currentTime);

  osc.connect(gain).connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + 0.3);
}
```

------

### 6.4 Dropdown Behavior

- `<select id="sound-select">` listens for `change` events.
- Updates `currentProfile` value.
- All subsequent keypresses play using the selected sound.

```javascript
document.getElementById('sound-select').addEventListener('change', e => {
  currentProfile = e.target.value;
});
```

------

## 7. Complete Event Flow Summary

| Action            | Visual Effect            | Audio Feedback            | Text Effect                     |
| ----------------- | ------------------------ | ------------------------- | ------------------------------- |
| Key pressed       | SVG key highlights       | Typing sound plays        | Character added to paper        |
| Key released      | SVG key un-highlights    | –                         | –                               |
| SVG key clicked   | Same as above            | Same as above             | Same as above                   |
| Enter key pressed | Paper grows + ding sound | “Ding” sound (high-pitch) | New line + paper expands upward |
| Sound selection   | Dropdown UI updates      | Future sounds switch      | –                               |

------

## 8. Non-Functional Requirements

- Must work with local `file://` URL.
- No CDN, no external resources.
- No module system, bundler, NPM, or build steps.
- Should work identically on all modern browsers that support the Web Audio API.

------

## 9. Summary

This project is a **local-first typewriter simulator** with a clear focus on visual experience, user interaction, and audio realism. It merges handcrafted layout (SVG, CSS), dynamic interaction (JavaScript), and sound feedback (Web Audio API) into a cohesive, immersive experience that can be run without any infrastructure.

The spirit of this project is to **emulate the tactile and auditory satisfaction** of a mechanical typewriter while respecting modern design standards and development constraints — minimalism, locality, and clarity.
