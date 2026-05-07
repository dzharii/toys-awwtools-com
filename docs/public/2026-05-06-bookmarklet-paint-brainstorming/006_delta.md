# Iteration 006 Delta

## Iteration number
006

## Previous iteration used as input
005_initial_bookmarklet-spec.md, 005_delta.md, and 005_initial_bookmarklet.js

## Summary of product improvements
Made Download selection-aware so users can directly save a selected region as PNG without first cropping or copying to the clipboard.

## New UI/UX behavior
- Download now saves the selected region when a rectangle selection exists.
- Download continues to save the full canvas when no selection exists.
- Download button title and accessible label update to reflect the current export scope.
- Selection downloads use a distinct filename prefix and status message.

## New technical behavior
- Added selection export branching to the existing PNG download path.
- Added a small shared blob download helper to keep object URL cleanup behavior consistent.
- Reused the existing composed-region capture path, so downloaded selections match copied selections.

## Files created
- 006_initial_bookmarklet-spec.md
- 006_delta.md
- 006_initial_bookmarklet.js

## Important implementation notes
- No clipboard access is required for selection download.
- The selected export still excludes the bookmarklet UI and host page, matching existing full-canvas export rules.
- Previous iteration files were not modified.

## Manual review checklist
- Select a region and click Download; verify the downloaded PNG contains only the selected region.
- Clear selection and click Download; verify the full canvas downloads.
- Verify Download button title/label changes when selection is active.
- Verify Copy selection, Cut, Crop, Clear, Undo, Redo, and Help still work.
- Verify final JavaScript remains parseable and self-contained.

## Known limitations
- Selection download exports the flattened visible pixels; it does not preserve editable operations.
