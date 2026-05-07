# Iteration 002 Delta

## Iteration number
002

## Previous iteration used as input
001_initial_bookmarklet-spec.md and 001_initial_bookmarklet.js

## Summary of product improvements
Added an undoable Clear Annotations action so users can quickly remove all sketch annotations while preserving the imported background image and document size.

## New UI/UX behavior
- Added a compact Clear button in the history/edit area of the toolbar.
- The Clear button is disabled when there are no annotation operations to remove.
- Clearing shows status feedback and can be undone/redone through the existing history controls.

## New technical behavior
- Added a `clearAnnotations` history command that snapshots the current annotation operation list.
- Undo restores the exact previous operation list; redo clears it again.
- Clear commits any active text editor first and clears the active selection before replacing operations.

## Files created
- 002_initial_bookmarklet-spec.md
- 002_delta.md
- 002_initial_bookmarklet.js

## Important implementation notes
- The action only clears annotation operations. Imported background images remain intact.
- No external dependencies, storage, network access, or host page mutations were added.
- Previous iteration files were not modified.

## Manual review checklist
- Draw several strokes, press Clear, then Undo and Redo.
- Import an image, draw on it, Clear, and verify the image remains.
- Verify Clear is disabled when there are no annotations.
- Verify Copy and Download still export the visible canvas correctly.

## Known limitations
- Clear does not reset the imported background image; that is intentional to support screenshot annotation workflows.
