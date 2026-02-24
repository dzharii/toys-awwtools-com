# Syllabics Rain Esolang

## Overview
Syllabics Rain Esolang is a browser-based esoteric programming environment where a symbolic script written primarily in Unified Canadian Aboriginal Syllabics controls a Matrix-like digital rain animation in real time. As you type glyphs into the editor, the background rain transitions toward the visual state defined by your script.

## Why this exists
Symbolic languages like APL are compelling because code becomes visual. Unified Canadian Aboriginal Syllabics provides a large, distinctive Unicode glyph set that works well as an operator alphabet. This project combines that feel with immediate visual feedback so scripts become reproducible visual "looks".

## Features
- Full-screen digital rain renderer with smooth state easing.
- STS interpreter with syllabics glyph operators (motion, geometry, trails, color, distortion, glyph sets, meta).
- Live mode with debounce and Run mode for manual compile/apply.
- v2 numeric selectors + literal commit syntax (`S250=`, `A135=`, `E12345=`).
- v3 grouping/repeat and macros (`(ᐊᐊᐅ)3`, `@diag = ...`, `$diag`).
- Searchable in-app help/reference and clickable glyph palette.
- Sample gallery built into UI and help panel.
- Local persistence (script, sample, toggles, help state/search, saved macros).
- Share links via `?s=` encoded script.
- Adaptive quality controls plus manual performance mode, pause, and dim background toggles.

## STS Quick Syntax
- Comments: line starts with `#`
- Glyph operators: `ᐊᐊᐅᕿᓯᓇ`
- Numeric selectors (v2): selector + digits + `=`
  - `S250=` speed `2.50`
  - `A135=` angle `135°`
  - `T6=` fade alpha `0.06`
  - `E12345=` deterministic seed
- Group/repeat (v3): `(ᐊᐊᐅ)3`
- Macro definition (v3): `@diag = ᐅᐅᒋᗅ`
- Macro invocation (v3): `$diag`

## Usage
1. Open `index.html` in a recent desktop browser.
2. Load a sample or type/paste a script into the editor.
3. Keep `Live: ON` for debounced live updates or use `Run` when `Live: OFF`.
4. Use `Help` for glyph reference and syntax examples.
5. Use `Share Link` to copy a URL with the current script embedded.

## Controls
- `Load`: load selected sample
- `Run`: compile/apply immediately
- `Live`: toggle debounced live compile
- `Share Link`: copy `?s=` URL with current script
- `Dim BG`: increase UI readability over animation
- `Pause Rain`: freeze render motion while editing
- `Perf`: manual performance mode (`Auto` uses adaptive quality)
- `Help`: open searchable reference/examples panel

## Files
- `index.html`: UI shell
- `styles.css`: layout and visual styling
- `script.js`: renderer, interpreter, UI wiring, persistence
- `suggestion-001.md`: original planning/spec suggestion source
- `spec.md`: copied specification deliverable
- `language.md`: STS language reference and glyph dictionary

## Notes
- No network access or backend is required.
- The interpreter is custom and does not execute JavaScript from user input.
- Exact glyph rendering depends on system/browser font support for Unified Canadian Aboriginal Syllabics.
