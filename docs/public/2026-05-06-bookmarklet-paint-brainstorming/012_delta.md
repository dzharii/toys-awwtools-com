# Iteration 012 Delta

## Iteration number
012

## Previous iteration used as input
011_initial_bookmarklet-spec.md, 011_delta.md, and 011_initial_bookmarklet.js

## Code review findings fixed in this iteration
1. The toolbar had a fixed 44px height even though the product had grown to many controls; controls overflowed horizontally and could become unreachable.
2. Toolbar horizontal scrolling used `overflow-y: hidden`, which clipped absolute-positioned Stamp, Shape, and Color menus, making those dropdowns appear broken.
3. Help and Close were ordinary toolbar-end controls, so they could be pushed off the visible edge; Close must remain visible as a window safety control.
4. The Stamp numbered badge was effectively invisible in some states because the badge used `background: currentColor` while also setting its own text color to white.
5. Shape, Stamp, and Color menus were visually dependent on a fragile single-row toolbar and did not have enough z-index/space to render over the canvas reliably.
6. Undo and Redo icons were too circular and looked like generic loops instead of clear history arrows.
7. The toolbar had no robust grouping model for narrow widths; groups could compress against each other instead of wrapping intentionally.
8. The title/drag region had too much minimum width pressure on narrow panels.
9. Help overlay placement assumed the old toolbar height and needed to be adjusted after the toolbar redesign.
10. Left-aligned dropdowns can still clip horizontally after wrapping if the trigger lands near the panel edge; menus need constrained positioning, not static offsets.
11. CSS fallback dimensions still reflected the old 650x390 panel even after the 012 default was increased to 760x440.
12. The spec still described a compact single-row toolbar even though the control count no longer fit that model.
13. Help overlay placement also needed to react to manual panel resizing, not only browser resize.
14. The stamp button cached a label element that is replaced by later `innerHTML` updates; that stale reference was removed.
15. The showcase manifest did not include this new bug-fix iteration until this pass.

## Summary of product improvements
Redesigned the top controls into a two-row, wrapping command header that keeps Help and Close visible, prevents control overlap, and restores Stamp, Shape, and Color dropdown usability.

## New UI/UX behavior
- The top row now contains the drag/title area plus always-visible Help and Close buttons.
- Drawing, style, history, import/export, and selection actions live in a wrapping command row below the title row.
- Controls wrap instead of overlapping or disappearing at narrow widths.
- Stamp, Shape, and Color dropdown menus render over the canvas and clamp inside the panel instead of being clipped by toolbar overflow or panel edges.
- Stamp numbered badges are visibly dark with white numbers.
- Undo and Redo use clearer directional arrow icons.

## New technical behavior
- Replaced fixed single-row toolbar overflow with an auto-height two-row layout.
- Increased default panel width/height and minimum panel height to make the larger command surface usable.
- Added CSS grouping and wrapping rules that allow toolbar controls to reflow predictably.
- Added panel-relative dropdown positioning that clamps menus within the visible panel bounds.
- Updated help overlay offset for the larger command header and for panel resizing.
- Synchronized CSS fallback panel dimensions with the 012 runtime defaults.
- Removed a dead cached stamp label reference that could mislead future changes.
- Kept all existing operation, history, export, clipboard, selection, and rendering behavior intact.

## Files created
- 012_initial_bookmarklet-spec.md
- 012_delta.md
- 012_initial_bookmarklet.js

## Files updated outside the iteration chain
- iterations-manifest.js, to expose iteration 012 in the static showcase.

## Important implementation notes
- Previous iteration files 001 through 011 were not modified.
- This is intentionally a bug-fix and layout-hardening iteration, not a feature expansion.
- The dropdown clipping bug was caused by toolbar overflow, not by missing menu event handlers.

## Manual review checklist
- Open iteration 012 at default size and verify Help and Close are visible.
- Resize the panel to its minimum width and verify controls wrap instead of overlapping.
- Open Stamp, Shape, and Color menus and verify each menu is visible and usable.
- Place numbered stamps and verify the badge is visible on the toolbar and canvas.
- Verify Undo and Redo icons read as history arrows.
- Verify resize still works and the panel respects its minimum usable size.
- Verify existing features still work: pen, highlighter, eraser, selection, text, shapes, color, width, zoom, clear, import, copy, download, crop, callout, spotlight, contextual action bar, help, and close.

## Known limitations
- At very narrow panel widths the toolbar becomes taller because it wraps; this is intentional and safer than hiding destructive or window controls.
