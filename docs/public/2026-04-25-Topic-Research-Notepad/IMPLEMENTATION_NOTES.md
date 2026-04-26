# Implementation Notes

## Architecture

The app is implemented as modern JavaScript modules under `src/` and bundled with Bun for static deployment. `src/storage-client.js` is the main-thread persistence adapter. `src/storage-worker.js` owns Dexie and IndexedDB.

Worker messages use `{ requestId, type, protocolVersion, payload }` requests and `{ requestId, ok, type, protocolVersion, data|error }` responses. A protocol mismatch returns `PROTOCOL_VERSION_MISMATCH`.

## Persistence

Pages and blocks are separate durable records. Editing a title saves one page record. Editing a block saves one block record and refreshes the derived search index entry. Paste and reorder operations use batch messages where practical.

Autosave is optimistic in the UI and debounced per page or block record. Blur, page switch, export, `visibilitychange`, and `pagehide` attempt to flush pending writes.

Workspace loading intentionally uses terminal Dexie calls such as `toArray()` before filtering records. This avoids treating query builders or collections as Promises, which can produce `catch is not a function` errors during startup.

## Observability

Structured logging lives in `src/observability/logger.js` for the main thread and `src/observability/worker-logger.js` for the classic Worker. The proof-of-concept default log level is `debug` so storage startup, Worker messages, paste conversion, search, export, and user-visible errors can be diagnosed from the browser console.

Safe debug helpers are exposed as `window.trnDebug`. See `OBSERVABILITY.md` for logging controls and startup failure diagnosis.

## UI Framework

The app imports and initializes the provided retro bookmarklet UI framework from `ui-framework/dist/bookmarklet/index.js`. App CSS uses the same compact panel, toolbar, border, inset, and status-strip language.

The framework now includes `awwbookmarklet-split-pane`, a reusable two-pane web component with start/end slots, horizontal or vertical direction, pointer and keyboard resizing, min-size clamping, separator ARIA, Shadow DOM parts, and resize/resize-commit events. Topic Research Notepad uses it for the Pages sidebar and editor. The durable `sidebarWidth` setting is owned by the app storage layer, not by the generic component.

## Editing Model

Paragraph and heading blocks use one controlled `contenteditable` region per block. Storage remains block based and backward compatible: legacy `content.text` renders by escaping it to safe HTML, while new paragraph and heading edits store sanitized `content.html` plus derived `content.text`. Search and Markdown export read derived plain text or convert allowed inline HTML.

Allowed inline HTML is deliberately small: `strong`, `em`, `u`, `code`, `mark`, `a[href]`, and `br`. Sanitization strips scripts, styles, iframes, forms, event handlers, external classes, inline styles, and unsupported attributes. Links are kept only for `http:`, `https:`, and `mailto:` URLs and are rendered with safe link attributes.

Paste into rich text is intercepted before the browser can insert arbitrary markup. The app records the payload in an offscreen bodyguard pastebin for observability/debugging, sanitizes it, and then inserts only allowed inline HTML or converts multi-block paste through the existing detached clipboard-to-block pipeline.

Slash commands are local block transforms, not a global command palette. Empty paragraph-like command text such as `/`, `/h`, `/quote`, `/source`, `/list`, `/table`, and `/code` opens a small menu. Selection uses an explicit transform map and preserves text where the conversion is safe.

## Deliberate Simplifications

Page and block ordering uses move up/down controls instead of drag-and-drop. This keeps the proof of concept reliable without adding dependencies.

The table editor supports basic editable cells plus row and column insertion. It intentionally omits spreadsheet features such as formulas, sorting, filtering, merged cells, and rich cell formatting.

Paste conversion keeps semantic structures and limited safe inline formatting. External page styles and arbitrary markup are still untrusted and are stripped.

Archive and import are not included in the first implementation. JSON backup is included so local evaluation data can be protected before future migrations.

The contenteditable implementation intentionally does not include a full rich editor engine, collaborative editing, arbitrary typography, persisted source-details expansion state, page hierarchy, backlinks, tags, or drag-and-drop page trees.
