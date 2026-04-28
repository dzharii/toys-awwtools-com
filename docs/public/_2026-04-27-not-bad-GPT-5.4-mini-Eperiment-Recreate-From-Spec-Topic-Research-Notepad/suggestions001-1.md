2026-04-26

see the following file that contains implementation checklists plus some additional instructions for OpenAI Codex: suggestions001-6.md

A00 Technical Design Document: IndexedDB Persistence, Autosave, and Worker IO for Topic Research Notepad

---

This document defines the recommended local persistence architecture for the Topic Research Notepad. The application is a static browser application that stores all user data locally. IndexedDB is the durable storage layer. Dexie 4.2.0 is the recommended database wrapper. A browser Worker is the recommended persistence boundary so that database work, search indexing, migration logic, and debounced writes do not compete directly with the editor rendering loop.

This is a planning document, not a strict implementation contract. Codex may adjust the schema, message names, store boundaries, indexing strategy, or persistence flow when implementation reveals a better structure. Working software, data safety, and maintainable code are more important than preserving every recommendation exactly. If any part of this document is ambiguous, internally inconsistent, unnecessarily complex, or incompatible with the final app structure, Codex should simplify or refactor while preserving the main product requirements: local-first storage, reliable autosave, small targeted writes, safe persistence, recoverability, searchability, and clean separation between editor state and durable data.

---

B00 Core Persistence Problem

---

The editor must autosave continuously without making the application feel slow. The user should be able to type, paste, edit tables, rename pages, reorder blocks, and switch pages without thinking about saving. At the same time, the application must avoid the naive approach of serializing and writing one large document on every keystroke.

The correct design is to store research pages as durable records and store each editable content block as a separate durable record. This allows edits to target the smallest reasonable unit. If the user edits one paragraph, the app updates one block record. If the user renames a page, the app updates one page record. If the user edits one table cell, the app updates the table block record, not the whole page. If the user reorders blocks, the app updates only affected block order fields.

This storage model trades some read complexity for much better write behavior. Loading a page requires reading the page record and its related block records, but editing becomes small and targeted. IndexedDB is well suited to this pattern because it can store structured records and query indexed fields such as `pageId`, `updatedAt`, `sortOrder`, and `archivedAt`.

---

C00 Design Goals

---

The persistence design should protect user work first. If the user types into a block and then reloads the page a few moments later, recent changes should usually be present. If a write fails, the application should indicate that local persistence failed. It should not silently display a saved state when data is not durable.

The design should make writes granular. The app should not rewrite an entire page for a one-character edit. The app should update the page title, one block, one search index entry, or one setting when that is all that changed.

The design should make autosave efficient. Typing should update in-memory editor state immediately, then schedule a debounced write. Multiple keystrokes in the same block should collapse into one database update. Switching focus or leaving the page should flush pending writes.

The design should isolate database work. A Worker should own the Dexie database instance and expose a message-based persistence API to the UI thread. The UI thread should not directly contain complex database transaction logic.

The design should remain debuggable. Message types, record shapes, and database stores should be explicit. Codex should avoid over-engineering a generic RPC framework unless it clearly reduces complexity.

---

D00 Recommended Architecture

---

The application should use two cooperating layers.

The main thread owns the UI. It renders the sidebar, editor, toolbar, status strip, paste handling UI, keyboard interaction, selection state, drag operations, and user feedback. It keeps an in-memory view model of the currently open page and its blocks.

The persistence Worker owns IndexedDB. It initializes Dexie, applies schema migrations, reads and writes records, updates search index entries, handles backup export queries, and returns results to the main thread. The Worker exposes a small message protocol.

The main thread should treat the Worker as the local backend. In this document, the term "backend" means the browser Worker and IndexedDB layer, not a server. There is no remote backend.

The Worker should be loaded from a local file such as `storage-worker.js`. The main thread should communicate through `postMessage`. Each request should carry a request ID. Each response should include the same request ID, a success flag, and either data or an error object. This makes async operations traceable.

---

E00 Why Use a Worker

---

IndexedDB itself is asynchronous, but database work can still add coordination cost to the main thread when the application performs many writes, rebuilds search indexes, imports backup data, or exports the full workspace. A Worker creates a clearer boundary. The UI thread can remain focused on rendering and input handling while the Worker handles persistence concerns.

A Worker also makes future extension integration cleaner. The same application can later mount the editor inside an injected extension window while the persistence layer remains isolated. The extension version may choose to use the same Worker, an extension background script, or another persistence bridge. Designing the storage API as messages now makes that migration easier.

There are tradeoffs. A Worker requires structured-clone-compatible messages. Objects sent between the UI and Worker should be plain data, not DOM nodes, functions, class instances, or cyclic structures. Error handling is also slightly more explicit. These constraints are acceptable because durable records should be plain JSON-like data anyway.

If Worker setup becomes a blocker, Codex may implement the same storage API directly on the main thread first, behind a storage client abstraction. The public API should remain similar so the Worker can be added later.

---

F00 Granularity of Storage

---

The application should not store one large document blob per page as the primary persistence model. That design would make autosave inefficient, increase write amplification, and make future search, export, import, and block-level operations harder.

The recommended primary unit of storage is the block. A page is a container and metadata record. Blocks are ordered children of the page. Each block is independently addressable.

For example, editing the page title updates the `pages` store. Editing a paragraph updates one row in the `blocks` store. Editing a source link note updates one source link block. Reordering three blocks updates the `sortOrder` fields for those three blocks. Updating search terms for one block updates only the search index entries for that block.

This approach is the main performance decision in the persistence design.

---

G00 Autosave Strategy

---

The editor should use debounced autosave per dirty target. A dirty target is a page record, block record, settings record, or ordering operation that has changed in memory and needs to be persisted.

The main thread should update the local view model immediately when the user types. It should then schedule a save operation for the affected record. The save operation should be debounced, commonly around 300 ms to 1000 ms. A reasonable first value is 500 ms for text edits. This value can be adjusted during implementation.

The debounce should be per record, not global for the entire app. If the user edits block A and then block B, the app should be able to persist both targeted records without serializing the whole page. A simple implementation may keep a `Map<recordKey, pendingPatch>` in the main thread or storage client.

When the user blurs a block, switches pages, exports, closes the app shell, or the browser fires `pagehide` or `visibilitychange`, pending writes should be flushed immediately where possible. This reduces the risk that a scheduled debounce is lost.

The application should not wait for IndexedDB success before updating the visible editor. The UI should be optimistic. However, the save status must distinguish between "local memory updated" and "durable write completed". The status strip should show states such as `Saving`, `Saved`, and `Save failed`.

---

H00 Patch-Based Writes

---

The storage API should support targeted patches, but the first implementation does not need a complex diff engine.

For simple block text editing, the main thread can send a full replacement for that block record's content. This is still efficient because the block is small relative to the whole page. For table blocks, the main thread may also send the full table payload if tables are small. The design only needs to avoid rewriting the entire page.

A practical first API can expose `updateBlock` with the full new block content and updated timestamp. Later, if table cells become large or edits become frequent, the app can introduce `patchBlock` or `updateTableCell`.

The same principle applies to pages. Renaming a page can send `updatePage` with changed fields. The Worker should merge allowed patch fields into the existing record. It should not require the main thread to send a full page object for every page title edit unless that is simpler and safe.

---

I00 Save Timing Recommendations

---

Text input should schedule a debounced block save. The editor should mark the block as dirty immediately. The status strip should indicate that there are unsaved local changes or that saving is scheduled.

Blur should flush the current block. If the user clicks away from a block after typing, the app should not wait for the remaining debounce interval.

Page switch should flush all pending writes before or during the page switch. The UI may switch optimistically, but it should not drop pending writes for the previous page. The storage client should maintain pending writes independently of the currently selected page.

Paste should create new blocks and persist them as a batch. A paste operation often creates multiple blocks, so it should use one Worker message and one IndexedDB transaction if feasible.

Block reorder should persist affected block order values as a batch. The main thread should update the visual order immediately, then send the new order for affected block IDs.

Page reorder should persist affected page order values as a batch.

Search index updates should happen inside the Worker as part of, or immediately after, the durable write. The main thread should not be responsible for maintaining search index consistency.

Export should flush pending writes before reading from the database. This ensures exported Markdown or JSON reflects the latest visible editor state.

---

J00 Recommended IndexedDB Stores

---

The recommended Dexie database name is `TopicResearchNotepadDB`. Codex may choose a different name if the repository uses another naming convention.

The first schema version should include these stores: `pages`, `blocks`, `searchIndex`, `settings`, `operations`, and optionally `snapshots`.

The `pages` store contains durable research page metadata.

The `blocks` store contains durable content blocks.

The `searchIndex` store contains derived searchable text. It can be rebuilt from `pages` and `blocks`.

The `settings` store contains UI and app preferences.

The `operations` store is optional but useful for diagnostics, import history, or future undo support. It can be omitted in the first implementation if it adds unnecessary complexity.

The `snapshots` store is optional. It can store occasional page snapshots or backups for recovery. It is not required for the first implementation, but the schema can reserve the concept.

A minimal implementation can begin with `pages`, `blocks`, `searchIndex`, and `settings`.

---

K00 Pages Store

---

The `pages` store should represent research documents. A page should be small. It should not contain the entire body of the document.

Recommended fields are:

```js
{
  id: "page_uuid",
  title: "Readable page title",
  createdAt: "2026-04-25T12:00:00.000Z",
  updatedAt: "2026-04-25T12:30:00.000Z",
  archivedAt: null,
  deletedAt: null,
  sortOrder: 1000,
  pinned: false,
  color: null,
  summary: "",
  metadata: {}
}
```

`id` is a stable page identifier. Use `crypto.randomUUID()` when available.

`title` is the user-visible page name.

`createdAt` and `updatedAt` are ISO strings. Timestamps should be consistent throughout the app. ISO strings are easy to inspect and export. Numeric milliseconds are also acceptable if Codex prefers them, but the choice should be consistent.

`archivedAt` marks a page hidden from the default sidebar without deleting it.

`deletedAt` is optional. If implemented, it allows a soft-delete or trash flow. If the MVP only archives pages, `deletedAt` can be omitted.

`sortOrder` controls sidebar ordering. Use sparse numeric ordering, such as increments of 1000, to make reorder operations cheaper.

`pinned` is optional but useful for future page prioritization.

`color` is optional and can remain unused in the MVP.

`summary` is optional. It may store a manually written page summary later.

`metadata` is an object reserved for future fields.

Recommended Dexie indexes for `pages` are `id`, `updatedAt`, `archivedAt`, `sortOrder`, and perhaps `pinned`.

A possible Dexie schema line is:

```js
pages: "id, updatedAt, archivedAt, sortOrder, pinned"
```

---

L00 Blocks Store

---

The `blocks` store is the core content store. Each block belongs to one page.

Recommended fields are:

```js
{
  id: "block_uuid",
  pageId: "page_uuid",
  type: "paragraph",
  sortOrder: 1000,
  content: {},
  source: null,
  createdAt: "2026-04-25T12:00:00.000Z",
  updatedAt: "2026-04-25T12:30:00.000Z",
  archivedAt: null,
  deletedAt: null,
  metadata: {}
}
```

`id` is a stable block identifier.

`pageId` links the block to its parent page.

`type` is one of the supported block types, such as `paragraph`, `heading`, `quote`, `list`, `table`, `code`, or `sourceLink`.

`sortOrder` controls order inside the page. Use sparse numeric ordering to reduce reorder churn.

`content` stores the type-specific payload.

`source` stores source metadata when the block came from a URL, selection, paste, or capture action. It can be null for ordinary user-authored blocks.

`archivedAt` and `deletedAt` are optional. For the MVP, deleting a block can physically remove it, but soft-delete is safer if undo or recovery will be added.

`metadata` is reserved for future extension-specific or editor-specific data.

Recommended Dexie indexes for `blocks` are `id`, `pageId`, `[pageId+sortOrder]`, `updatedAt`, `type`, and `deletedAt` if used.

A possible Dexie schema line is:

```js
blocks: "id, pageId, [pageId+sortOrder], updatedAt, type, deletedAt"
```

The compound index `[pageId+sortOrder]` is important because loading a page should fetch all blocks for that page in display order.

---

M00 Block Content Shapes

---

Block payloads should be plain JSON-like objects. They should not contain DOM nodes, functions, HTML elements, or class instances.

A paragraph block can use:

```js
{
  text: "Plain text or editor-normalized text"
}
```

A heading block can use:

```js
{
  level: 1,
  text: "Heading text"
}
```

A quote block can use:

```js
{
  text: "Quoted text",
  attribution: "",
  sourceUrl: ""
}
```

A list block can use:

```js
{
  ordered: false,
  items: [
    { id: "item_uuid", text: "First item" },
    { id: "item_uuid", text: "Second item" }
  ]
}
```

A table block can use:

```js
{
  columns: [
    { id: "col_uuid", label: "Column 1" },
    { id: "col_uuid", label: "Column 2" }
  ],
  rows: [
    {
      id: "row_uuid",
      cells: {
        "col_uuid": "Cell text",
        "col_uuid_2": "Cell text"
      }
    }
  ]
}
```

A code block can use:

```js
{
  language: "",
  text: "code or command text"
}
```

A source link block can use:

```js
{
  url: "https://example.com",
  title: "Example title",
  note: "",
  domain: "example.com",
  capturedText: "",
  capturedAt: "2026-04-25T12:00:00.000Z"
}
```

These shapes can be simplified during implementation. The important rule is that each block stores only the data needed for that block type, and the database writes remain targeted to the block record.

---

N00 Source Metadata

---

The block-level `source` object should be used when the origin of content matters. It should be separate from visible content so that the user can edit display text without losing provenance.

Recommended source shape:

```js
{
  url: "https://example.com/article",
  title: "Original page title",
  domain: "example.com",
  capturedAt: "2026-04-25T12:00:00.000Z",
  captureMode: "manualPaste",
  selectedText: "",
  pageReferrer: "",
  tabTitle: "",
  tabUrl: ""
}
```

In the standalone app, many fields may be empty or manually derived. In the future extension version, the extension can provide `tabTitle`, `tabUrl`, selected text, and capture mode.

`captureMode` can identify how the data entered the app. Useful values include `manual`, `manualPaste`, `urlPaste`, `selectionCapture`, `pageCapture`, and `import`.

This source object is not required for every block. It is especially useful for quote blocks, source link blocks, pasted code snippets, and captured selections.

---

O00 Search Index Store

---

The `searchIndex` store should contain derived searchable text. It is not the source of truth. It should be rebuildable from pages and blocks.

Recommended fields are:

```js
{
  id: "search_uuid_or_deterministic_key",
  pageId: "page_uuid",
  blockId: "block_uuid_or_null",
  kind: "block",
  blockType: "paragraph",
  text: "normalized searchable text",
  rawPreview: "short readable preview",
  updatedAt: "2026-04-25T12:30:00.000Z"
}
```

`pageId` links the index entry to a page.

`blockId` links to a block when the entry comes from block content. It is null when the entry represents page title text.

`kind` can be `pageTitle`, `block`, or `source`.

`blockType` is useful for rendering search results.

`text` should be normalized for search. Lowercase, collapsed whitespace, and trimmed text is enough for the MVP.

`rawPreview` should store a short user-readable snippet. It should not be huge. It helps search results render without loading every full block immediately.

Recommended Dexie indexes are `id`, `pageId`, `blockId`, `kind`, and possibly `text`.

A possible Dexie schema line is:

```js
searchIndex: "id, pageId, blockId, kind, blockType, updatedAt"
```

IndexedDB does not provide full-text search by default. For the MVP, the app can perform simple substring matching over `text` after reading candidate search index rows. If the number of records is small, reading all search index rows and filtering in memory is acceptable. If the database grows, a token index can be added later.

---

P00 Settings Store

---

The `settings` store should contain app-level preferences and persistent UI state.

Recommended shape:

```js
{
  key: "selectedPageId",
  value: "page_uuid",
  updatedAt: "2026-04-25T12:30:00.000Z"
}
```

The store can contain keys such as `selectedPageId`, `sidebarWidth`, `lastSearchQuery`, `themeDensity`, `lastExportFormat`, and `schemaNoticeDismissed`.

Recommended Dexie schema line:

```js
settings: "key, updatedAt"
```

Settings writes should also be debounced where appropriate. For example, sidebar resizing should not write on every mousemove. It should write after resize ends or through a throttle.

---

Q00 Optional Operations Store

---

An `operations` store may be useful for future undo, diagnostics, or import history. It is optional.

Recommended shape:

```js
{
  id: "operation_uuid",
  type: "updateBlock",
  createdAt: "2026-04-25T12:30:00.000Z",
  pageId: "page_uuid",
  blockId: "block_uuid",
  payload: {},
  status: "applied"
}
```

For the MVP, this is not required. Codex should omit it if it delays core functionality. The more important requirement is to make current writes reliable and understandable.

---

R00 Optional Snapshots Store

---

A `snapshots` store can provide a safety net for large changes, imports, or future undo. It is optional.

Recommended shape:

```js
{
  id: "snapshot_uuid",
  pageId: "page_uuid",
  createdAt: "2026-04-25T12:30:00.000Z",
  reason: "beforeImport",
  page: {},
  blocks: []
}
```

The MVP can skip snapshots. If implemented, snapshots should not run on every keystroke. They should be reserved for larger operations such as import, bulk paste, or before deleting a page.

---

S00 Dexie Versioning

---

The database schema should use explicit Dexie versioning from the start. Do not create object stores ad hoc without a version declaration.

A first implementation may look conceptually like this:

```js
const db = new Dexie("TopicResearchNotepadDB");

db.version(1).stores({
  pages: "id, updatedAt, archivedAt, sortOrder, pinned",
  blocks: "id, pageId, [pageId+sortOrder], updatedAt, type, deletedAt",
  searchIndex: "id, pageId, blockId, kind, blockType, updatedAt",
  settings: "key, updatedAt"
});
```

Codex may change index names based on actual query patterns. The important queries are: load visible pages in sidebar order, load one page's blocks in order, find blocks by page ID, update one block by ID, update one page by ID, read and write settings by key, and search derived text.

---

T00 Worker Message Envelope

---

All Worker requests should use a consistent envelope.

Recommended request shape:

```js
{
  requestId: "request_uuid",
  type: "updateBlock",
  payload: {}
}
```

Recommended success response shape:

```js
{
  requestId: "request_uuid",
  ok: true,
  type: "updateBlock:result",
  data: {}
}
```

Recommended error response shape:

```js
{
  requestId: "request_uuid",
  ok: false,
  type: "updateBlock:error",
  error: {
    code: "DB_WRITE_FAILED",
    message: "Could not save block",
    details: {}
  }
}
```

The main thread storage client should create request IDs, keep a map of pending promises, resolve on success, and reject or report on error.

Worker messages must be structured-clone-safe. Send plain objects, arrays, strings, numbers, booleans, and null. Avoid sending class instances.

---

U00 Required Worker API

---

The Worker should support initialization, page management, block management, search, export reads, and settings.

Required message types are described here as an implementation guide. Codex may rename them if the naming stays clear and consistent.

`initDb` initializes Dexie and returns database status.

`getAppState` returns initial state needed by the UI, including pages, selected page ID, and optionally the selected page with blocks.

`listPages` returns non-archived pages sorted for the sidebar.

`createPage` creates a page and optionally creates an initial empty paragraph block.

`updatePage` updates allowed page fields such as title, pinned, sortOrder, archivedAt, or metadata.

`archivePage` marks a page archived.

`deletePage` permanently deletes a page and its blocks if permanent deletion is implemented.

`getPageWithBlocks` returns one page and its ordered blocks.

`createBlock` creates one block.

`createBlocksBatch` creates multiple blocks, usually after paste.

`updateBlock` updates one block's content, type, source, or metadata.

`deleteBlock` deletes or soft-deletes one block.

`reorderBlocks` updates sort order for a set of block IDs in one page.

`reorderPages` updates sort order for a set of page IDs.

`search` searches page titles and block text through the search index.

`exportWorkspaceData` returns all pages, blocks, and schema metadata for JSON backup.

`importWorkspaceData` may be deferred, but the API can be reserved.

`getSetting` and `setSetting` read and write settings.

`flush` is not necessarily a Worker operation; it may be a main-thread storage client operation that sends all pending writes. If implemented in the Worker, it should confirm that no queued Worker-side writes are pending.

---

V00 Main Thread Storage Client

---

The main thread should not call `worker.postMessage` directly throughout the UI code. It should use a small storage client module.

The storage client should expose functions such as `init`, `getAppState`, `createPage`, `updatePage`, `getPageWithBlocks`, `createBlock`, `updateBlockDebounced`, `flushPendingWrites`, `search`, and `exportWorkspaceData`.

The storage client owns debounce timers. It knows which page or block updates are pending. It merges repeated updates to the same block before sending them to the Worker.

For example, if the user types ten characters into the same paragraph within one second, the editor may call `scheduleBlockSave(blockId, nextBlock)` ten times. The storage client should retain only the latest version and send one `updateBlock` message after the debounce interval.

If the user blurs the block before the interval ends, the storage client should send the latest pending version immediately.

This design keeps editor components simple. The editor only reports changes. The storage client decides when to persist them.

---

W00 Dirty State Model

---

The UI should track dirty state separately from durable state.

A block can be clean, dirty, saving, saved, or failed. The application does not need to display this state for every block, but it should maintain enough state to show global save status.

The global save status can be derived from pending writes and active requests. If there are pending debounce timers, show `Unsaved local changes` or `Saving soon`. If requests are in flight, show `Saving`. If no pending writes exist and the latest write succeeded, show `Saved`. If any write failed, show `Save failed`.

The status should be conservative. It is better to show `Saving` a little longer than to show `Saved` before IndexedDB confirms the write.

---

X00 Transaction Boundaries

---

The Worker should use IndexedDB transactions for operations that must stay consistent.

Creating a page with an initial block should happen in one transaction if possible.

Creating multiple blocks from one paste should happen in one transaction if possible.

Updating a block and replacing its search index entry should happen in one transaction if possible.

Updating a page title and replacing its page-title search index entry should happen in one transaction if possible.

Deleting a page and deleting its blocks and search index entries should happen in one transaction if permanent deletion is implemented.

Archiving a page can update only the page record, but search should probably exclude archived pages unless the user explicitly asks to search archived content.

Transactions keep durable state coherent. For example, after a block update, the search index should not continue to contain stale text indefinitely.

---

Y00 Search Index Update Rules

---

The Worker should own search index updates.

When a page is created, create a page title index entry.

When a page title changes, replace the page title index entry.

When a block is created, create a block index entry if the block has searchable text.

When a block changes, replace the block index entry.

When a block is deleted, remove the block index entry.

When blocks are reordered, no search index update is needed unless searchable content changed.

When a page is archived, search may exclude it by checking the page record. Alternatively, archive state can be reflected in search index records, but that duplicates state.

The Worker should use helper functions such as `extractSearchTextFromPage(page)` and `extractSearchTextFromBlock(block)`. These helpers should be deterministic and should not depend on DOM rendering.

---

Z00 Search Text Extraction

---

Search extraction should understand each block type.

For paragraph blocks, index `content.text`.

For heading blocks, index `content.text`.

For quote blocks, index quote text, attribution, and source URL if useful.

For list blocks, index all item text.

For table blocks, index column labels and cell text.

For code blocks, index code text. This is useful for technical research, but the result preview should be short.

For source link blocks, index URL, title, domain, note, and captured text.

The search text should be normalized. Lowercase, collapse whitespace, trim, and optionally strip some punctuation. Do not destroy the original content. Normalization applies only to search index text.

---

AA00 Loading Flow

---

On application start, the main thread should create the Worker and send `initDb`.

The Worker should open Dexie and return status. If database initialization fails, the UI should display a persistence error.

After successful initialization, the main thread should request `getAppState`.

The Worker should return visible pages, selected page ID from settings if available, and optionally the selected page with blocks. If no selected page exists, the main thread can select the most recently updated page. If no pages exist, the UI should show the first-use empty state or create an initial page, depending on product choice.

The sidebar renders pages. The editor renders the selected page. The status strip shows that local storage is ready.

---

AB00 Page Creation Flow

---

When the user creates a page, the main thread should send `createPage` to the Worker with a title such as `Untitled research page` or a title entered by the user.

The Worker should create the page record, optionally create one initial empty paragraph block, create the search index entry for the page title, update the selected page setting, and return the page and initial blocks.

The main thread should add the page to the sidebar, select it, render the editor, and focus the title or first block.

This should feel immediate. If the Worker operation is fast, the app can wait for success before selecting. If the UI is optimistic, it must handle failure by reverting or showing an error. For the first implementation, waiting for page creation success is simpler and safer.

---

AC00 Page Rename Flow

---

When the user edits the page title, the editor should update the local page object immediately and schedule a debounced `updatePage`.

The debounce for page title can be similar to block text, around 500 ms. Blur should flush immediately.

The Worker should update the page record's title and updated timestamp. It should also replace the page title search index entry. It should return the updated page or at least confirmation.

The sidebar should reflect the new title immediately from local state. If the save fails, the status strip should show failure. The app can keep the local title visible but mark persistence as failed.

---

AD00 Block Edit Flow

---

When the user edits a block, the editor updates the in-memory block object immediately. It then calls the storage client to schedule a block save.

The storage client merges repeated updates to the same block. After the debounce interval, it sends `updateBlock` to the Worker with the latest block fields.

The Worker reads or receives enough data to update the block record. It sets `updatedAt`, writes the block, rebuilds that block's search index entry, and returns success.

The main thread marks the block clean only after success. The global status strip updates accordingly.

This flow avoids writing the whole page and avoids writing on every keystroke.

---

AE00 Paste Flow

---

Paste should be treated as a structured insertion operation.

The main thread receives the paste event because clipboard and editor selection are UI concerns. It extracts `text/html` and `text/plain`, runs sanitization and conversion in the paste module, and produces internal block objects. If sanitization is expensive later, this can move into another Worker, but the first version can keep it in the main thread.

The generated blocks should be inserted into the in-memory editor state at the current insertion point. The main thread should send `createBlocksBatch` to the storage Worker.

The Worker should insert all blocks in one transaction, assign or validate sort orders, update the parent page `updatedAt`, and create search index entries for the new blocks.

If the batch save fails, the UI should show an error. Codex may either keep the blocks visible as unsaved local blocks or revert them. Keeping them visible with a failure status is usually better for data preservation.

---

AF00 Reorder Flow

---

Reordering should update sort order fields, not physically rewrite page content.

For block reorder, the main thread updates the visible block order immediately. It computes new sparse `sortOrder` values for affected blocks or sends the full ordered block ID list to the Worker.

A simple `reorderBlocks` payload can be:

```js
{
  pageId: "page_uuid",
  orderedBlockIds: ["block_a", "block_b", "block_c"]
}
```

The Worker can assign sort orders based on array position.

A more targeted payload can be:

```js
{
  pageId: "page_uuid",
  updates: [
    { id: "block_a", sortOrder: 1000 },
    { id: "block_b", sortOrder: 2000 }
  ]
}
```

The second form writes fewer rows. The first form is simpler. Codex may choose either. For MVP simplicity, full ordered IDs are acceptable for normal page sizes.

Page reorder follows the same pattern with page IDs and page sort orders.

---

AG00 Export Flow

---

Before exporting, the main thread should flush pending writes. This is important because exported data should match what the user sees.

For Markdown export of the current page, the main thread can either request the latest page and blocks from the Worker, then run Markdown conversion in the main thread, or ask the Worker to provide the data and keep conversion in an export module. The conversion does not need to happen inside the Worker unless it is heavy.

For JSON backup export, the Worker should provide the durable database records. The backup should include schema version, export timestamp, pages, blocks, and possibly settings. The backup should not include search index records unless Codex wants a debug export, because search index can be rebuilt.

The main thread should create the downloadable file from returned data.

---

AH00 Import Flow

---

Import may be deferred. If implemented, it should be careful.

The main thread should read the JSON file and send parsed data to the Worker. The Worker should validate the schema version and required fields. It should generate new IDs if imported IDs collide with existing records, unless the user explicitly chooses an overwrite mode.

Import should happen in a transaction where feasible. After import, the Worker should rebuild search index entries for imported pages and blocks.

The app should create a snapshot before import if the snapshots store exists. If not, import should at least avoid deleting existing data unless the user explicitly chooses replacement.

---

AI00 Debounce Implementation Detail

---

A practical storage client can maintain a map of pending saves.

Conceptually:

```js
const pendingBlockSaves = new Map();

function scheduleBlockSave(block) {
  const key = block.id;
  const existing = pendingBlockSaves.get(key);

  if (existing) {
    clearTimeout(existing.timer);
  }

  const timer = setTimeout(() => {
    flushBlockSave(key);
  }, 500);

  pendingBlockSaves.set(key, {
    block,
    timer
  });
}
```

`flushBlockSave` sends the latest block to the Worker and removes the pending timer. The actual implementation should also track in-flight writes and handle the case where another edit occurs while a previous save is still in flight.

A safe approach is to keep a revision counter per record in memory. Each scheduled save gets the latest revision. When a response returns, the storage client only marks the record clean if the response corresponds to the latest known revision. If the user edited again while the save was in flight, the record remains dirty until the newer save succeeds.

---

AJ00 Revision and Conflict Handling

---

Because this is a single-user local app, conflict handling can be simple. There is no multi-user merge problem. However, async writes can still return out of order.

The main thread should maintain local revision numbers for edited records. These do not need to be stored durably unless Codex finds that useful. They are mainly for UI correctness.

For example, block A starts at local revision 1. The user types, creating revision 2. Save request for revision 2 starts. The user types again, creating revision 3. If the revision 2 save succeeds after revision 3 exists, the UI should not mark block A as fully saved. It should wait for revision 3 to save.

The Worker may also store `updatedAt` and optionally `version` on records. A durable `version` integer can help detect stale writes. For MVP, `updatedAt` is likely sufficient, but `version` is a reasonable addition.

If Codex adds `version`, each successful block update increments the version. The main thread can send the previous version if it wants stale-write detection. Since all writes come from the same UI instance in the MVP, this may be more complexity than necessary.

---

AK00 Performance Considerations

---

The most important performance principle is to avoid large document rewrites. Store blocks separately. Update only changed records.

The second principle is to debounce text writes. Do not write on every keystroke.

The third principle is to batch multi-record operations. Paste, import, reorder, and delete page should use transactions and batch writes.

The fourth principle is to avoid excessive search index work. Rebuild only the index entry for the changed page or block. Full index rebuild should be a repair or migration operation, not a normal keystroke path.

The fifth principle is to keep record payloads plain and reasonably small. Do not store huge raw HTML copies as normal block content. Pasted HTML should be normalized. If the app later needs to preserve raw source HTML, it should store it only in explicit capture metadata or snapshots, not in every block by default.

The sixth principle is to avoid rendering all pages at once. The UI should load and render the selected page. The sidebar can show page records only. Search can query the search index when needed.

---

AL00 Data Safety Considerations

---

Autosave should not create a false sense of safety. The app should show failure when IndexedDB writes fail.

The app should listen for `pagehide` and `visibilitychange` and flush pending writes. Browser behavior during unload is constrained, so this cannot guarantee every write, but it improves safety.

The app should avoid storing only pending in-memory changes for long periods. Debounce intervals should be short enough that normal typing is persisted frequently.

The app should support JSON backup early. Local-only data is vulnerable to browser data clearing, profile changes, or storage corruption. A backup export gives the user a recovery path.

The app should avoid destructive deletes by default. Archive is safer than permanent delete for pages. Permanent deletion can be implemented later with confirmation.

---

AM00 Error Handling

---

The Worker should return structured errors. Error codes should be stable enough for the UI to interpret.

Recommended error codes include `DB_INIT_FAILED`, `DB_READ_FAILED`, `DB_WRITE_FAILED`, `DB_NOT_AVAILABLE`, `RECORD_NOT_FOUND`, `VALIDATION_FAILED`, `IMPORT_FAILED`, `EXPORT_FAILED`, and `UNKNOWN_ERROR`.

The UI should display concise error text in the status strip. For serious errors, such as IndexedDB unavailable, it should show a persistent panel or banner.

When a write fails, the storage client should keep the affected record dirty and allow retry. It should not discard user changes.

When a read fails, the app should avoid overwriting existing in-memory state with empty data.

When search fails, the app should show that search is unavailable without breaking editing.

---

AN00 Validation Rules

---

The Worker should validate incoming records enough to prevent corrupt data from entering the database.

A page must have an ID and title. Empty title can be allowed visually, but storage should normalize it to something like `Untitled` or allow empty string deliberately.

A block must have an ID, page ID, type, sort order, and content object.

Block type must be known or intentionally stored as `unknown`. Unknown block types should not crash the app.

Sort order should be numeric.

Timestamps should be valid strings or numbers based on the chosen timestamp convention.

Source URLs should be stored as strings. URL validation should be forgiving because users may paste incomplete or unusual URLs. Rendering should escape display text safely.

The Worker should not trust the main thread completely, even though this is a local app. Basic validation prevents accidental corruption from UI bugs.

---

AO00 Recommended File Organization

---

The technical storage implementation can use this structure:

```txt
index.html
styles.css
app.js
storage-client.js
storage-worker.js
db-schema.js
db-repositories.js
search-index.js
models.js
editor.js
sidebar.js
paste.js
export.js
```

`storage-client.js` runs on the main thread. It owns Worker communication, request IDs, pending promises, debounce maps, flush behavior, and save status events.

`storage-worker.js` runs in the Worker. It receives messages, calls database functions, and posts responses.

`db-schema.js` defines Dexie setup and schema versioning. If modules inside Workers are inconvenient, this can be merged into `storage-worker.js`.

`db-repositories.js` contains functions such as `createPage`, `updatePage`, `getPageWithBlocks`, `updateBlock`, and `search`.

`search-index.js` contains text extraction, normalization, and index record generation.

`models.js` contains page and block factory functions and ID helpers.

Codex may merge files for simplicity. The conceptual separation matters more than exact filenames.

---

AP00 Recommended Storage Client API

---

The main application should call a local API rather than direct Worker messages.

Recommended functions:

```js
await storage.init();

const state = await storage.getAppState();

const page = await storage.createPage({ title });

await storage.updatePage(pageId, patch);

const pageData = await storage.getPageWithBlocks(pageId);

const block = await storage.createBlock({ pageId, type, content, source });

storage.scheduleBlockSave(block);

await storage.flushPendingWrites();

await storage.createBlocksBatch({ pageId, afterBlockId, blocks });

await storage.reorderBlocks({ pageId, orderedBlockIds });

const results = await storage.search({ query });

const backup = await storage.exportWorkspaceData();
```

`scheduleBlockSave` should be non-blocking and debounced. Operations such as create page, create blocks batch, reorder, export, and page switch should return promises so the UI can handle completion or errors.

---

AQ00 Worker API Payload Examples

---

Create page request:

```js
{
  requestId: "req_1",
  type: "createPage",
  payload: {
    title: "Research topic",
    createInitialBlock: true
  }
}
```

Update page request:

```js
{
  requestId: "req_2",
  type: "updatePage",
  payload: {
    pageId: "page_uuid",
    patch: {
      title: "Updated title"
    }
  }
}
```

Update block request:

```js
{
  requestId: "req_3",
  type: "updateBlock",
  payload: {
    blockId: "block_uuid",
    patch: {
      content: {
        text: "Updated paragraph text"
      }
    }
  }
}
```

Create blocks batch request:

```js
{
  requestId: "req_4",
  type: "createBlocksBatch",
  payload: {
    pageId: "page_uuid",
    afterBlockId: "block_uuid",
    blocks: [
      {
        type: "heading",
        content: { "level": 1, "text": "Notes" },
        source: null
      },
      {
        type: "paragraph",
        content: { "text": "Pasted normalized text" },
        source: null
      }
    ]
  }
}
```

Search request:

```js
{
  requestId: "req_5",
  type: "search",
  payload: {
    query: "indexeddb autosave",
    includeArchived: false,
    limit: 50
  }
}
```

---

AR00 UI Save Status Events

---

The storage client should emit or expose save status changes to the UI. This can be implemented with callbacks, a small event emitter, or direct state updates.

Recommended status values are `idle`, `dirty`, `saving`, `saved`, and `error`.

`idle` means no page is loaded or persistence has not started.

`dirty` means the UI has changes that have not yet been sent to IndexedDB.

`saving` means one or more write requests are in flight.

`saved` means no pending writes exist and the latest write succeeded.

`error` means one or more writes failed.

The status strip should display this state in compact language. The app should not over-notify during normal typing. Save status should be visible but not distracting.

---

AS00 Fallback Without Worker

---

The recommended architecture uses a Worker, but the implementation should not become impossible if a Worker cannot be loaded in a particular static hosting or local testing context.

Codex can create a storage adapter interface. One adapter uses `Worker`. Another adapter can call the same database functions directly on the main thread. The rest of the app should not care which adapter is used.

This fallback is especially useful during development. It also reduces risk if module Worker paths or GitHub Pages hosting paths create loading issues.

The fallback should preserve the same API and behavior: targeted writes, debounced saves, search index updates, and schema versioning.

---

AT00 Handling IndexedDB Availability

---

On startup, the app should test whether IndexedDB and Dexie are available.

If IndexedDB is unavailable, the app should show a clear persistence error. It may allow temporary in-memory editing, but it must label it as not saved.

If Dexie fails to load, the app should show a dependency error. Since Dexie is vendored, this likely means the script path is wrong or the static bundle is incomplete.

If database opening fails because of version or corruption issues, the app should show an error and avoid destructive repair unless the user explicitly chooses an action.

The app should not silently fall back to `localStorage` for full document persistence. `localStorage` is not appropriate for the structured data model and can block the main thread. It may be used only for minor emergency flags if needed.

---

AU00 Schema Migration Policy

---

The database must have an explicit version number. Future schema changes should use Dexie migrations.

The first version should be simple enough to migrate. Avoid embedding large opaque document blobs that are hard to transform later.

When adding a new block type, Codex should not need a schema migration if the block type fits the existing `type` plus `content` pattern.

When adding new indexes, a Dexie schema version bump is required.

When changing content payload shapes, migration helpers should transform existing records or the renderer should support old and new shapes during a transition.

The JSON backup format should also include a schema version separate from the Dexie version. This allows import logic to understand exported data.

---

AV00 Decision Summary

---

The recommended design stores pages and blocks separately because the editor needs targeted autosave. This avoids rewriting large documents during normal typing.

The recommended design uses debounced writes because writing on every keystroke is unnecessary and may hurt responsiveness.

The recommended design uses a Worker because persistence, search indexing, import, and export are local backend concerns that should be isolated from rendering and keyboard input.

The recommended design uses a search index store because search should remain fast and independent of the editor rendering model.

The recommended design uses plain JSON-like block payloads because they are easy to store, clone, migrate, export, and render safely.

The recommended design uses explicit schema versioning because the app will evolve.

The recommended design keeps Codex free to adjust implementation details because this is a planning document and real implementation feedback should take priority.

---

AW00 MVP Implementation Sequence

---

Codex should implement this persistence layer incrementally.

First, implement Dexie schema initialization and a minimal Worker request-response loop.

Second, implement `createPage`, `listPages`, `getPageWithBlocks`, and `updatePage`.

Third, implement paragraph block creation and `updateBlock` with debounced autosave from the UI.

Fourth, implement search index updates for page title and paragraph blocks.

Fifth, add remaining block types using the same block store pattern.

Sixth, implement paste batch insertion.

Seventh, implement reorder operations.

Eighth, implement Markdown export and JSON backup export.

Ninth, add stronger error handling, startup recovery, and optional fallback storage adapter.

This sequence gives the implementer working software early while preserving the intended architecture.
