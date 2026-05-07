# Iteration 008 Delta

## Iteration number
008

## Previous iteration used as input
007_initial_bookmarklet-spec.md, 007_delta.md, and 007_initial_bookmarklet.js

## Brainstorm considered before implementation
1. View zoom controls: selected because large pasted screenshots, callouts, and detailed annotation need better navigation without changing document pixels.
2. Contextual selection action bar: strong UI improvement, but stronger after zoom because contextual placement needs scaled coordinate handling.
3. Numbered workflow stamps: useful for walkthroughs, but does not improve core canvas navigation.
4. Spotlight/dim action: valuable screenshot emphasis, but overlaps with callout emphasis from 007.
5. Hand/pan tool: useful, but zoom solves a broader composition problem first.
6. Recent colors and custom palette: nice UI polish, but lower product impact than zooming.
7. Text size controls: useful, but adds formatting complexity and still does not address large image workflow.
8. Smart export presets: useful for sharing, but selection download already improved export in 006.
9. Multi-image import as patches: powerful, but complicates the model and object URL lifecycle.
10. Auto-save draft recovery: valuable, but conflicts with the local-memory/no-persistence direction.

Selected idea: canvas view zoom controls with scroll-center preservation.

## Summary of product improvements
Added view zoom controls so users can inspect details, compose annotations, and work on large pasted screenshots more comfortably.

## New UI/UX behavior
- Added a Zoom dropdown with 50%, 75%, 100%, 150%, and 200% options.
- The toolbar now supports hidden horizontal overflow scrolling so compact windows can still reach all controls.
- Zoom affects only the viewport scale, not document pixel dimensions or export resolution.
- Existing drawing, selection, text placement, callout, crop, copy, and download operations continue to use document coordinates.
- Changing zoom keeps the viewport centered on roughly the same document point.

## New technical behavior
- Added `viewScale` to runtime state.
- Scaled the surface, visible canvas, selection overlay, selection preview, and text editor placement from document coordinates to CSS pixels.
- Preserved document-space pointer conversion by using the canvas bounding box.

## Files created
- 008_initial_bookmarklet-spec.md
- 008_delta.md
- 008_initial_bookmarklet.js

## Important implementation notes
- Exports remain unscaled and still render at document pixel size.
- Zoom is an ephemeral view setting and is intentionally not part of undo/redo history.
- Previous iteration files were not modified.

## Manual review checklist
- Import a large image and switch between 50%, 100%, and 200% zoom.
- Draw, select, move, crop, callout, copy, and download at non-100% zoom.
- Verify selection overlays align with the canvas at each zoom level.
- Verify text placement commits at the expected document location after zooming.
- Verify exports do not include UI or view scaling artifacts.

## Known limitations
- Zoom does not add infinite canvas behavior; it only scales the current document surface in the viewport.
