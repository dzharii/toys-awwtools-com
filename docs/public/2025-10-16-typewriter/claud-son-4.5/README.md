# Typewriter Experience Application

A fully immersive typewriter simulation built with **vanilla HTML, CSS, and JavaScript** — no frameworks, no dependencies, no build tools required.

## Features

✨ **Realistic Typing Experience**
- Pseudo-3D SVG keyboard with visual feedback
- Hardware keyboard support with real-time key highlighting
- Virtual clickable keyboard for mouse/touch interaction
- Growing paper simulation that expands as you type

🔊 **Web Audio API Sound Engine**
- 6 distinct sound profiles (Classic, Soft, Clacky, Thud, Beep, Random)
- Synthesized sounds with no external audio files
- Satisfying "ding" sound on Enter key
- Real-time audio feedback for every keypress

📄 **Paper Simulation**
- Styled textarea resembling physical paper
- Automatic height expansion as content grows
- Ruled lines for authentic typewriter feel
- Smooth scrolling and responsive design

## Installation

No installation required! Simply:

1. Download or clone the repository
2. Open `index.html` in any modern web browser
3. Start typing!

Works perfectly with `file://` protocol for completely offline use.

## File Structure

```
typewriter/
│
├── index.html      # Main HTML structure with SVG keyboard
├── styles.css      # All styling and visual effects
├── script.js       # Core functionality and audio engine
└── README.md       # This file
```

## Usage

### Hardware Keyboard
- Type normally using your physical keyboard
- Press **Enter** to create new lines (triggers "ding" sound)
- Press **Tab** to insert spaces
- Press **Backspace** to delete characters
- All keys highlight on the virtual keyboard as you type

### Virtual Keyboard
- Click any key on the screen to type
- Works on touch devices
- Visual feedback on click/touch

### Sound Profiles
Use the dropdown in the top-right to select:
- **Classic Mechanical** - Realistic mechanical switch sound
- **Soft Press** - Gentle, quiet tapping
- **Clacky High Pitch** - Sharp, crisp clicks
- **Heavy Thud** - Deep, resonant thuds
- **Digital Beep** - Retro electronic beeps
- **Random Per Key** - Surprise sounds on each keypress

## Browser Compatibility

Works in all modern browsers supporting:
- Web Audio API
- SVG 1.1
- ES6 JavaScript

Tested on:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS/Android)

## Technical Highlights

- **Zero Dependencies** - Pure vanilla JavaScript
- **Offline First** - Runs entirely locally
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Accessibility** - Keyboard-first design
- **Performance** - Lightweight and fast
- **Web Audio API** - Real-time sound synthesis

## Project Philosophy

This project emulates the **tactile and auditory satisfaction** of using a mechanical typewriter while maintaining:
- **Minimalism** - No unnecessary complexity
- **Locality** - Runs anywhere, anytime
- **Clarity** - Clean, readable code
- **Immersion** - Authentic typing experience

## Development

Built following legacy-compatible practices:
- No transpilation required
- No package managers
- No build steps
- Standard DOM APIs only
- Compatible with older JavaScript environments

## License

Free to use for personal and educational purposes.

## Credits

Designed and implemented according to the Typewriter Experience technical specification (2025-10-16).

---

**Enjoy the typing experience! 🎹✨**
