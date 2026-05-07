# Iteration 009 Delta

## Iteration number
009

## Previous iteration used as input
008_initial_bookmarklet-spec.md, 008_delta.md, and 008_initial_bookmarklet.js

## Brainstorm considered before implementation
1. Numbered and symbolic stamps: selected because they add a fast visual language for reviews, walkthroughs, bug reports, and support screenshots.
2. Contextual selection action bar: still valuable, but stamps add a new expressive primitive first.
3. Hand/pan tool: useful with zoom, but less communicative than step markers.
4. Spotlight/dim action: effective for emphasis, but callout already covers detail focus.
5. Text size selector: useful, but formatting-heavy and less unique.
6. Recent colors: convenient, but not as impactful as new annotation semantics.
7. Snap-to-grid for shapes: useful for diagrams, but this product is more about quick annotations.
8. Multi-image patches: powerful, but risks complicating local object lifecycle and history.
9. Export margin presets: useful for presentation, but less often needed than stamps.
10. Auto-numbering arrows: powerful, but harder to use than click-to-place numbered badges.

Selected idea: click-to-place annotation stamps with auto-numbered badges.

## Summary of product improvements
Added a Stamp tool with auto-numbered step badges plus check, cross, and warning marks for fast structured annotations.

## New UI/UX behavior
- Added a Stamp dropdown to the tool group.
- Default stamp mode places numbered badges and auto-increments from 1 through 9.
- Check, cross, and warning stamp presets are available from the stamp menu.
- Stamps use the current color and place with one click or tap.

## New technical behavior
- Added `stamp` as a committed operation type.
- Added stamp state for active preset and next number.
- Added stamp rendering for filled numbered circles, check marks, crosses, and warning triangles.
- Stamps participate in undo, redo, clear, callout capture, copy, crop, and download.

## Files created
- 009_initial_bookmarklet-spec.md
- 009_delta.md
- 009_initial_bookmarklet.js

## Important implementation notes
- Numbered stamps store their resolved number at placement time, so undo/redo remains deterministic.
- The stamp tool has no external assets; all symbols are canvas-rendered or inline SVG UI.
- Previous iteration files were not modified.

## Manual review checklist
- Place numbered stamps and verify they increment from 1 upward.
- Switch to check, cross, and warning stamps and place each on the canvas.
- Undo and redo stamps.
- Change color and verify new stamps use the selected color.
- Copy, crop, callout, and download areas containing stamps.

## Known limitations
- Numbered stamps intentionally wrap after 9 to keep badges compact.
