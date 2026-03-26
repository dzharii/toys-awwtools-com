# Quick Vector Image Editor

Desktop-oriented browser editor for fast screenshot annotation, lightweight image composition, and clipboard-first editing workflows.

Highlights:

- Clipboard-first workflow with paste for images, text, SVG, and internal object copy or cut within the editor.
- Editable SVG document format with embedded editor metadata for reopen-and-revise workflows.
- PNG, JPEG, and SVG export, plus clipboard copy for PNG and SVG where browser support is available.
- IndexedDB autosave with retained snapshots, stale-write protection, and recovery feedback on startup.
- Verbose in-app activity logging and user-facing error notices to make debugging failed operations practical.

Supported editing model:

- Insert and edit text, rectangles, ellipses, lines, and embedded raster images.
- Use the inspector for precise property edits, layer ordering, and text sizing.
- Keep work local in the browser with no backend dependency.

Notes:

- `libs/dexie-4.2.0.js` is used for IndexedDB-backed retained draft persistence.
- Clipboard capabilities depend on browser support and permission behavior.
