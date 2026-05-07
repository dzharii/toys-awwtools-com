# Iteration 004 Delta

## Iteration number
004

## Previous iteration used as input
003_initial_bookmarklet-spec.md, 003_delta.md, and 003_initial_bookmarklet.js

## Summary of product improvements
Added Crop to Selection so users can isolate the important part of a screenshot or sketch and continue working on the cropped result.

## New UI/UX behavior
- Added a Crop button that is enabled only when a rectangle selection exists.
- Cropping replaces the document with the selected visible pixels.
- Crop preserves the cropped pixels as the new background and clears flattened annotation operations because they are baked into the cropped result.
- Crop is undoable and redoable.

## New technical behavior
- Added a document snapshot history command for whole-document transformations.
- Crop renders the selected region to an offscreen canvas, converts it to a local image record, resizes the document to that region, and pushes a snapshot command.
- Existing selection, move, cut, copy, clear, and export behavior remain unchanged outside crop.

## Files created
- 004_initial_bookmarklet-spec.md
- 004_delta.md
- 004_initial_bookmarklet.js

## Important implementation notes
- Crop does not upload data or use external services; all rendering and image decoding stay local.
- Crop intentionally flattens the selected visible result into a new background image to keep the document model simple.
- Previous iteration files were not modified.

## Manual review checklist
- Import an image, select a rectangle, crop, then verify the document resizes to that selected content.
- Undo crop and verify the original document dimensions, image, and annotations return.
- Redo crop and verify the cropped result returns.
- Verify Crop is disabled without a selection.
- Verify Copy, Cut, Clear, Undo, Redo, and Download still work after cropping.

## Known limitations
- Crop flattens the selected result; individual operations inside the cropped area are not preserved as editable operations.
