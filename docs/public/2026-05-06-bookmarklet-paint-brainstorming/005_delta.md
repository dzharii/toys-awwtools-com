# Iteration 005 Delta

## Iteration number
005

## Previous iteration used as input
004_initial_bookmarklet-spec.md, 004_delta.md, and 004_initial_bookmarklet.js

## Summary of product improvements
Added an in-product help overlay and direct keyboard shortcuts for faster tool switching and better discoverability.

## New UI/UX behavior
- Added a Help button in the toolbar.
- Help opens a compact overlay listing core tools, actions, and shortcuts.
- Users can switch tools with P, H, E, S, and T while the sketch panel is focused.
- Pressing ? toggles Help, and Escape closes Help before clearing selection or closing the panel.

## New technical behavior
- Added Help overlay DOM, CSS, event wiring, and focus handling inside the Shadow DOM.
- Added non-command keyboard shortcut handling that avoids text input targets.
- Help does not affect canvas state, undo/redo history, exports, clipboard behavior, or host page state.

## Files created
- 005_initial_bookmarklet-spec.md
- 005_delta.md
- 005_initial_bookmarklet.js

## Important implementation notes
- The overlay is local, inline, and self-contained with no external fonts or assets.
- Shortcut handling only runs while the bookmarklet panel has focus and does not bind global host-page shortcuts.
- Previous iteration files were not modified.

## Manual review checklist
- Click Help and verify the overlay appears inside the sketch window.
- Press Escape with Help open and verify only Help closes.
- Press P, H, E, S, and T while the panel is focused and verify the active tool changes.
- Verify shortcuts do not fire while typing in the text editor.
- Verify existing Ctrl/Cmd+Z, Ctrl/Cmd+Y, copy, cut, delete, crop, clear, and export behavior still works.

## Known limitations
- Shortcuts require the sketch panel or canvas to have focus; no global host-page listeners are installed.
