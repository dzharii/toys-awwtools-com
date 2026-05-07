# Iteration 011 Delta

## Iteration number
011

## Previous iteration used as input
010_initial_bookmarklet-spec.md, 010_delta.md, and 010_initial_bookmarklet.js

## Brainstorm considered before implementation
1. Contextual selection action bar: selected because it turns the selection tool into a fast command surface for copy, cut, crop, callout, spotlight, and download.
2. Hand/pan tool: useful with zoom, but less important than reducing action friction after selection.
3. Dockable toolbar modes: interesting UI redesign, but high risk and less local to user workflows.
4. Recent color chips: convenient polish, but not as impactful as context-aware actions.
5. Selection resize handles: powerful, but increases bitmap-selection complexity and edge-case risk.
6. Stamp size picker: useful, but a smaller incremental refinement.
7. Text size picker: useful, but still conflicts with the intentionally simple text model.
8. Export style presets: useful for polished outputs, but not as frequent as selection actions.
9. Keyboard command palette: powerful, but overkill for compact bookmarklet UI.
10. Shape snapping guides: useful for diagrams, but less central than screenshot annotation workflows.

Selected idea: contextual selection action bar.

## Summary of product improvements
Added a floating action bar next to active selections so the most useful selection operations are available directly at the selected region.

## New UI/UX behavior
- Active selections now show a compact action bar near the selected rectangle.
- The bar includes Copy, Cut, Crop, Callout, Spotlight, and Download actions.
- The bar is hidden while dragging or moving selections and reappears when the selection is stable.
- The toolbar remains available, but selection workflows no longer require moving attention away from the selected content.

## New technical behavior
- Added selection action bar DOM, styling, event wiring, and scaled document-space positioning.
- Reused existing selection functions to avoid duplicate behavior paths.
- The action bar is a DOM overlay and is excluded from export like other UI controls.

## Files created
- 011_initial_bookmarklet-spec.md
- 011_delta.md
- 011_initial_bookmarklet.js

## Important implementation notes
- The action bar is positioned using the same `viewScale` mapping as the selection overlay.
- It clamps to the document surface so it remains reachable at different zoom levels.
- Previous iteration files were not modified.

## Manual review checklist
- Create a selection and verify the action bar appears near it.
- Use Copy, Cut, Crop, Callout, Spotlight, and Download from the action bar.
- Verify the bar hides while drawing or moving a selection.
- Change zoom and verify the bar remains aligned with the selected region.
- Verify exports do not include the action bar.

## Known limitations
- The action bar does not provide resize handles; selection remains a simple Paint-like rectangle selection.
