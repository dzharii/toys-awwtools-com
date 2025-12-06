# Emoji Typewriter Lab
Date: 2025-12-05

A playful single-page app that merges the typewriter experience with an emoji palette and a Unicode control deck. Built only with vanilla HTML, CSS, and JavaScript—no builds, no dependencies—so it works directly from `file://`.

## What it does
- Keeps the classic paper, line numbers, and bottom SVG keyboard from the Typewriter Experience.
- Adds a palette switcher with two modes: **Emoji** and **Unicode Controls**.
- Emoji mode shows recent emoji and an inline search box on the top row, with searchable emoji filling the remaining keys. Clicking inserts at the caret and updates recents.
- Unicode mode repurposes the keys for control characters (bidi isolates, variation selectors, ZWJ/ZWNJ, NBSP, SHY, keycap builder, and more) with inline help in the right-hand pane.
- Uses the original Web Audio API sound engine with selectable profiles and volume buttons.
- Persists recent emoji via the same localStorage key as the standalone emoji picker (`b4fc7cc1-eb82-4bd9-acac-22c34004adf5`).

## How to run
Open `index.html` in a modern browser. Everything is self contained; no server is required.

## Key interactions
- Type normally on the paper with your hardware keyboard; Enter plays the ding, Tab inserts spaces, and sounds match the selected profile.
- Click the bottom keys to insert emoji or control characters; the paper keeps focus so you can keep typing.
- Use the mode toggle in the top-right controls to switch between Emoji and Unicode Controls.
- Hover control keys to read explanations in the help pane; emoji hovers show name and codepoint briefly.

## Files
- `index.html` – layout for background, controls, paper, help pane, and SVG keyboard with embedded search field.
- `styles.css` – typewriter styling, keyboard gradients, help pane, and search key visuals.
- `emoji-data.js` – emoji dataset copied from the emoji picker project.
- `script.js` – sound engine, palette rendering, search and recent logic, Unicode control metadata, and insertion handlers.

## Notes
- Everything remains responsive down to small screens; the keyboard stays fixed at the bottom.
- Recent emoji are limited to the first row and persist across sessions.
- The Unicode examples describe expected behavior, but some control effects depend on platform font support.
