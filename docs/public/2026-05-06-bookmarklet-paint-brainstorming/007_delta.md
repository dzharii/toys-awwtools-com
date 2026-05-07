# Iteration 007 Delta

## Iteration number
007

## Previous iteration used as input
006_initial_bookmarklet-spec.md, 006_delta.md, and 006_initial_bookmarklet.js

## Brainstorm considered before implementation
1. Selection zoom callout: high impact for screenshot explanation; selected because it turns a rough crop/copy workflow into a one-click visual communication feature.
2. Full canvas zoom controls: valuable navigation improvement, but less expressive than adding a new annotation primitive.
3. Contextual selection action bar: strong UI improvement, but it depends on having more selection actions worth exposing first.
4. Numbered step stamps: useful for tutorials, but narrower than callouts for image annotation.
5. Spotlight/dim outside selection: easy and useful, but less visually informative than a magnified callout.
6. Freehand lasso selection: powerful, but high implementation risk in a compact bitmap-selection model.
7. Arrow labels with auto text boxes: useful, but overlaps existing text and arrow tools.
8. Local project import/export: powerful, but conflicts with the product's no-project-files direction.
9. Screen capture integration: impactful, but browser screen APIs add permission friction and scope risk.
10. Auto-trim transparent/white borders: useful after edits, but less visible and less creative than callouts.

Selected idea: one-click selection zoom callout.

## Summary of product improvements
Added an undoable Callout action that converts the selected visible region into a magnified inset with a source highlight, connector, and target border.

## New UI/UX behavior
- Added a Callout toolbar button enabled only when a rectangle selection exists.
- Clicking Callout captures the selected composed pixels, places an enlarged inset nearby, and draws a connector from source to inset.
- The callout uses the current color for source border, connector, and inset border.
- Callouts export through Copy, Download, selection download, and full-canvas download like other annotations.

## New technical behavior
- Added `callout` as a committed operation type.
- Added target placement logic that prefers right, then left, below, and above the selected region while clamping to the document surface.
- Added canvas rendering for source rectangle, connector line, magnified selected pixels, and inset border.

## Files created
- 007_initial_bookmarklet-spec.md
- 007_delta.md
- 007_initial_bookmarklet.js

## Important implementation notes
- The callout stores a local offscreen canvas snapshot of the selected region.
- The selected region remains flattened bitmap content, consistent with the existing Paint-like model.
- Previous iteration files were not modified.

## Manual review checklist
- Select a region on an imported image and click Callout; verify a magnified inset appears.
- Undo and redo the callout.
- Change color, create another callout, and verify border/connector color follows current color.
- Copy and download the full canvas and verify callouts export.
- Verify Callout is disabled without a selection.

## Known limitations
- Callout placement is automatic; users can move the resulting bitmap only by selecting and moving it afterward.
