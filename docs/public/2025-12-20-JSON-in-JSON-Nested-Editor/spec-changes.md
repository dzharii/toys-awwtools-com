2025-12-20

Session change log

Initial implementation

- Added the static app shell and tile layout in index.html, with a header, scrollable tile row, and footer.
- Added a full visual system in styles.css with a horizontal tile layout, active/disabled styling, connectors, and plain text editor surfaces.
- Implemented the core editor behavior in app.js: tile chain model, mode detection, JSON parsing/formatting, string encoding/decoding, explicit commit propagation, dirty tracking, and close confirmation.
- Added readme.md with business-facing overview, features, and usage scenarios.

Behavior adjustments and fixes

- Removed tile entry animation: deleted the tile-specific animation and keyframes to avoid visual motion in tiles.
- Changed JSON formatting so it happens only on explicit commit:
  - Root JSON mode no longer auto-formats during typing or cursor moves.
  - Added a Commit button to the root tile so formatting occurs only on demand.
  - Commit now formats JSON for the active tile, updates the cursor, and marks the tile clean.
- Fixed parent formatting cursor restore: after commit, the parent tile now updates both cursor and pending selection so the cursor can be restored reliably after reformatting.
- Fixed the cursor jump / scroll-to-bottom issue in the root editor:
  - Removed full re-render on selection-only events (clicks, arrow keys).
  - Added in-place updates for eligibility UI (Edit embedded button and reason text) without rebuilding the textarea.
  - Tracked selectionIndex per tile to keep eligibility checks accurate without forcing re-render.
  - Ensured the mode picker closes when the cursor moves out of an eligible string value.

Net effect

- Editing is stable and predictable: navigation and selection no longer teleport the cursor.
- JSON formatting is now strictly commit-driven, as specified.
- Tiles are still fully validated and committed through the same explicit workflow.
