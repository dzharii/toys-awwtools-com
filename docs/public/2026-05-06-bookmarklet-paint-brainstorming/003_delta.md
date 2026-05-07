# Iteration 003 Delta

## Iteration number
003

## Previous iteration used as input
002_initial_bookmarklet-spec.md, 002_delta.md, and 002_initial_bookmarklet.js

## Summary of product improvements
Added a highlighter tool for translucent emphasis over screenshots, sketches, and pasted images.

## New UI/UX behavior
- Added a highlighter button beside the pen and eraser tools.
- Highlighter strokes use the current color with translucent ink.
- Highlighter strokes are wider than regular pen strokes so they feel like annotation marks rather than drawing lines.
- Highlighter operations participate in undo, redo, clear annotations, copy, cut, and download.
- Clear is represented as an icon-only toolbar control in this iteration to reduce toolbar crowding.

## New technical behavior
- Added `highlight` as a committed operation type.
- Added highlighter-specific width scaling and alpha compositing during render.
- Kept rendering local to the annotation layer and preserved existing image/background behavior.

## Files created
- 003_initial_bookmarklet-spec.md
- 003_delta.md
- 003_initial_bookmarklet.js

## Important implementation notes
- The highlighter is implemented as translucent canvas stroke rendering, not as a separate object model.
- Existing operation history remains compatible because old stroke, eraser, shape, text, clear, and image commands are unchanged.
- Previous iteration files were not modified.

## Manual review checklist
- Select Highlighter, draw over a pasted image, and verify the image remains visible underneath.
- Change colors and verify highlighter strokes use the selected color translucently.
- Undo and redo highlighter strokes.
- Clear annotations and undo the clear to restore highlighter marks.
- Copy and download the canvas to verify highlighter strokes export.

## Known limitations
- Highlighter opacity is fixed to keep the toolbar compact.
