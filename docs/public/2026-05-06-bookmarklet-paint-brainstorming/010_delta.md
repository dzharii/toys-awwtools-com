# Iteration 010 Delta

## Iteration number
010

## Previous iteration used as input
009_initial_bookmarklet-spec.md, 009_delta.md, and 009_initial_bookmarklet.js

## Brainstorm considered before implementation
1. Spotlight/focus overlay: selected because it creates high-contrast emphasis around any selected region and complements callouts rather than duplicating them.
2. Hand/pan tool: useful after zoom, but less visually impactful for final annotations.
3. Contextual selection action bar: excellent UI improvement, but best as the final integration pass after adding spotlight.
4. Recent color palette: convenient, but not a major product capability.
5. Text size selector: useful, but adds formatting controls that the spec has intentionally avoided.
6. Stamp size control: useful, but smaller impact than a new selection-based emphasis operation.
7. Shape opacity control: powerful, but increases toolbar complexity and ambiguous fill behavior.
8. Auto-outline selected region: useful, but too close to the existing selection border and shape tool.
9. Presentation export frame: nice polish, but less directly useful during annotation.
10. Ruler/measurement tool: interesting, but outside the quick visual communication core.

Selected idea: one-click spotlight/focus overlay from selection.

## Summary of product improvements
Added an undoable Spotlight action that dims everything outside a selected region and draws a colored focus border around the selected area.

## New UI/UX behavior
- Added a Spotlight toolbar button enabled only when a rectangle selection exists.
- Clicking Spotlight creates a high-contrast focus mask around the selected region.
- Spotlight uses the current color for the focus border.
- Spotlight pairs with callouts, stamps, text, shapes, copy, crop, and download.

## New technical behavior
- Added `spotlight` as a committed operation type.
- Added canvas rendering for a four-sided dimming mask plus focus border.
- The operation remains document-space and export-safe like other annotation operations.

## Files created
- 010_initial_bookmarklet-spec.md
- 010_delta.md
- 010_initial_bookmarklet.js

## Important implementation notes
- Spotlight is non-destructive and undoable; it does not crop or alter the background image.
- The mask is rendered as normal annotation content, so it appears in copy/download output.
- Previous iteration files were not modified.

## Manual review checklist
- Select a region and click Spotlight; verify everything outside the region dims.
- Undo and redo Spotlight.
- Change color and verify the focus border uses the current color.
- Combine Spotlight with stamps, callouts, and text, then export.
- Verify Spotlight is disabled without a selection.

## Known limitations
- Spotlight opacity is fixed to keep the control compact and avoid adding another toolbar setting.
