# Emoji Typewriter Lab
Date: 2025-12-05

A playful single-page app that merges the typewriter experience with an emoji palette and a Unicode control deck. Built only with vanilla HTML, CSS, and JavaScript—no builds, no dependencies—so it works directly from `file://`.

## What it does
- Keeps the classic paper, line numbers, and bottom SVG keyboard from the Typewriter Experience.
- Emoji keyboard stays visible at the bottom; the first row is recents, lower rows follow search results.
- Search lives in the floating keyboard-side panel and filters the emoji on the keyboard without hiding recents.
- Unicode controls live in the same floating panel as buttons (bidi isolates, variation selectors, ZWJ/ZWNJ, NBSP, SHY, keycap builder, tone, flags). Hover to read; click to insert or wrap a selection.
- Uses the original Web Audio API sound engine with selectable profiles and volume buttons.
- Persists recent emoji via the same localStorage key as the standalone emoji picker (`b4fc7cc1-eb82-4bd9-acac-22c34004adf5`).

## How to run
Open `index.html` in a modern browser. Everything is self contained; no server is required.

## Key interactions
- Type normally on the paper with your hardware keyboard; Enter plays the ding, Tab inserts spaces, and sounds match the selected profile.
- Click keyboard keys to insert emoji. Search from the floating panel filters the lower rows; recents stay pinned up top.
- Use Unicode control buttons in the floating panel: wrapping controls (LRI/RLI/FSI) will wrap any selected text; suffix controls (VS15, VS16, Tone, Keycap) append to a selection; insert-only controls drop an invisible mark without replacing selections and show a small notice.
- Hover a control to read how it behaves; emoji hovers show name and codepoint briefly; the main notes live to the left of the paper for quick reference.

## Files
- `index.html` – layout for background, controls, paper, help pane, and SVG keyboard with embedded search field.
- `styles.css` – typewriter styling, keyboard gradients, help pane, and search key visuals.
- `emoji-data.js` – emoji dataset copied from the emoji picker project.
- `script.js` – sound engine, palette rendering, search and recent logic, Unicode control metadata, and insertion handlers.

## Notes
- Everything remains responsive down to small screens; the keyboard stays fixed at the bottom.
- Recent emoji are limited to the first row and persist across sessions.
- The Unicode examples describe expected behavior, but some control effects depend on platform font support.
