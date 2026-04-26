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

The app imports and initializes the provided retro bookmarklet UI framework from `ui-framework/dist/bookmarklet/index.js`. App CSS uses the same compact panel, toolbar, border, inset, and status-strip language. No framework source files were modified.

## Deliberate Simplifications

Page and block ordering uses move up/down controls instead of drag-and-drop. This keeps the proof of concept reliable without adding dependencies.

The table editor supports basic editable cells plus row and column insertion. It intentionally omits spreadsheet features such as formulas, sorting, filtering, merged cells, and rich cell formatting.

Paste conversion keeps semantic structures but does not preserve inline formatting. This is intentional because external page styles and markup are untrusted.

Archive and import are not included in the first implementation. JSON backup is included so local evaluation data can be protected before future migrations.
