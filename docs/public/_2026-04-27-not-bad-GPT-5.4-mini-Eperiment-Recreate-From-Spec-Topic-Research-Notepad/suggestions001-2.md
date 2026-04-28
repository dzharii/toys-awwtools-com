2026-04-26

see the following file that contains implementation checklists plus some additional instructions for OpenAI Codex: suggestions001-6.md


Please note, so since we use Bun as our project bundler, you can use normal modern JavaScript modular approach. The code needs to be well documented. Let's keep up and test it, and let's keep up good engineering practices.


A00 Appendix A: Future Development, Migration, and Resilience Notes

---

This appendix extends the IndexedDB persistence and Worker IO design. Its purpose is to describe how the proof-of-concept should handle future changes without becoming fragile. The immediate target is a local static application for evaluation, not a production release for external users. Even so, the code should avoid obvious traps that would make later extension integration, data migration, debugging, or schema evolution unnecessarily difficult.

The guiding principle is simple: this project is allowed to be lightweight, but it should not be careless with local data. The user may create real research notes during evaluation. Those notes should not be lost because a field was renamed, a block shape changed, a migration failed, or a Worker message changed without compatibility handling.

Codex has freedom to simplify, refactor, or replace recommendations in this appendix when implementation proves a different approach is safer or clearer. The desired outcome is resilient local software, not strict adherence to every proposed mechanism.

---

B00 Development Stage Assumption

---

The application starts as a proof of concept. It will be hosted as a static web page and used to evaluate the Topic Research Notepad interaction model, persistence model, editor behavior, and local data design.

This means some production concerns can be deferred. The application does not need multi-user compatibility, enterprise-grade migration tooling, remote recovery, analytics, account-bound settings, or backwards compatibility across many public releases.

However, the proof-of-concept may still accumulate valuable local data. During evaluation, the schema may change several times. New block types may be added. Existing block payloads may be adjusted. Search index behavior may be rewritten. The app may later move from static page to Chrome extension context. These are exactly the situations where a small amount of versioning and migration discipline prevents unnecessary data loss.

---

C00 What Should Be Versioned

---

There are several different things that can be versioned. They should not be confused with each other.

The IndexedDB schema version is the Dexie database version. It changes when object stores or indexes change. For example, adding an index to `blocks` or adding a new `attachments` store requires a Dexie version bump.

The application data format version is the meaning of the records stored inside the database. It changes when the shape or interpretation of page, block, source, or settings records changes. For example, changing a table block from `{ rows: [["a"]] }` to `{ columns: [], rows: [] }` is a data format change, even if no IndexedDB index changes.

The export format version is the version of JSON backup files. It should be stored inside exported JSON so future import code knows how to interpret the file.

The Worker message protocol version is the version of messages exchanged between the UI thread and the storage Worker. This matters if the Worker and UI can become mismatched because of caching, deployment timing, or extension packaging.

For the proof-of-concept, the project does not need heavy API versioning. It does need visible constants for these versions so the code has a place to reason about compatibility.

---

D00 Recommended Version Constants

---

Codex should define a small set of explicit version constants near the storage layer.

A practical starting point is:

```js
const APP_DATA_FORMAT_VERSION = 1;
const EXPORT_FORMAT_VERSION = 1;
const WORKER_PROTOCOL_VERSION = 1;
const DB_NAME = "TopicResearchNotepadDB";
const DB_VERSION = 1;
```

`DB_VERSION` maps to Dexie schema versioning.

`APP_DATA_FORMAT_VERSION` describes the expected record payload format.

`EXPORT_FORMAT_VERSION` describes the JSON backup format.

`WORKER_PROTOCOL_VERSION` allows the main thread and Worker to verify that they are speaking the same message protocol.

These constants do not need a complex compatibility matrix in the first version. Their value is that future changes become deliberate instead of accidental.

---

E00 Should the Worker API Be Versioned

---

For the proof-of-concept, the Worker API does not need full semantic versioning. A single integer protocol version is enough.

The main thread should send the expected protocol version during `initDb` or `hello`. The Worker should return its protocol version. If they do not match, the UI should show a clear reload or compatibility error rather than continuing with mismatched assumptions.

This is useful because static pages and browser extensions can have cache issues. The main page may load a newer `app.js` while the Worker script is cached from an older deployment, or the reverse may happen. The app should fail clearly rather than corrupt data through incompatible messages.

A simple handshake is sufficient:

```js
{
  requestId: "req_hello",
  type: "hello",
  protocolVersion: 1,
  payload: {}
}
```

The Worker responds:

```js
{
  requestId: "req_hello",
  ok: true,
  type: "hello:result",
  protocolVersion: 1,
  data: {
    dbName: "TopicResearchNotepadDB",
    dbVersion: 1,
    dataFormatVersion: 1
  }
}
```

If versions mismatch, the Worker should return an error such as `PROTOCOL_VERSION_MISMATCH`.

---

F00 Adding a New Field

---

Adding a new field is the most common future change. Most new fields should not require a database migration if they are stored inside existing records and do not need an IndexedDB index.

For example, adding `favorite: true` to a page record does not require a Dexie version bump unless the app needs to query pages by `favorite`. Existing records will simply not have the field. The renderer and logic should treat missing fields as defaults.

Recommended rule: new non-indexed fields should be introduced through read-time defaults first.

For example:

```js
function normalizePageRecord(page) {
  return {
    pinned: false,
    color: null,
    summary: "",
    metadata: {},
    ...page
  };
}
```

This lets older records continue working. Later, if desired, a background repair operation can write defaults into old records, but this should not be required for normal rendering.

If the new field must be indexed, then the Dexie schema must change. For example, if the sidebar needs to query `favorite` pages efficiently, the `pages` store may need a new index and therefore a Dexie version bump.

---

G00 Removing a Field

---

Removing a field should usually be done in two phases.

First, stop using the field in the application. Leave it in existing records. The code should ignore it.

Second, after the app is stable, optionally add a migration or cleanup operation to remove the field from records. This is not required for the proof-of-concept unless the field contains large data or causes incorrect behavior.

Avoid writing migrations just to make records visually tidy. Migrations should solve real compatibility, storage, or correctness problems.

---

H00 Renaming a Field

---

Renaming a field is riskier than adding a field because old records may stop rendering.

For important fields, Codex should support both old and new names during a transition.

For example, if `archivedAt` is renamed to `hiddenAt`, read logic can normalize both:

```js
function normalizePageRecord(page) {
  return {
    ...page,
    hiddenAt: page.hiddenAt ?? page.archivedAt ?? null
  };
}
```

If the old field should be removed, add a migration later. During early proof-of-concept development, read-time compatibility is often safer than immediate destructive migrations.

For core identity fields such as `id`, `pageId`, `type`, `content`, or `sortOrder`, avoid renaming unless there is a strong reason. These fields are foundational.

---

I00 Changing a Block Content Shape

---

Block content shapes will likely evolve. Tables, lists, source links, and quote blocks are especially likely to change during development.

The recommended mitigation is to give each block a content schema version, either globally through `APP_DATA_FORMAT_VERSION` or locally inside the block content. Local block-level versioning is more flexible.

For example:

```js
{
  id: "block_uuid",
  pageId: "page_uuid",
  type: "table",
  contentVersion: 1,
  content: {
    columns: [],
    rows: []
  }
}
```

If a future table format changes, the renderer can detect `type: "table"` and `contentVersion: 1`, then normalize it to the current runtime shape before rendering.

The first implementation can omit `contentVersion` if Codex wants to keep the schema lean, but it is recommended for complex block types. At minimum, table blocks should be normalized defensively because table shape changes are common.

---

J00 Adding a New Block Type

---

Adding a new block type should not require an IndexedDB schema migration if the `blocks` store already uses `type` and `content`.

The implementation steps are: define the block type name, define the content payload shape, add a block factory, add a renderer/editor, add search text extraction, add Markdown export behavior, add paste conversion behavior if relevant, and add fallback rendering for unsupported data.

The application should never crash when it sees an unknown block type. It should render a fallback block that shows a warning and preserves the raw content.

A fallback block can display: "Unsupported block type: diagram" and provide copy/export access to the raw JSON. This protects data created by future versions from being destroyed by older code.

---

K00 Removing or Replacing a Block Type

---

Removing a block type should be avoided while proof-of-concept data may exist. If a block type is no longer wanted, keep read-only rendering and export support for it until data can be migrated.

For example, if `sourceLink` is replaced by `sourceCard`, the app should still render old `sourceLink` blocks or migrate them safely.

The safe pattern is: support old type, add new type, migrate old records on read or through a migration command, then remove old editing UI only after old records no longer exist or after backup/export has been provided.

---

L00 Database Schema Migrations

---

Dexie migrations should be used when stores or indexes change.

Schema migrations should be small and reversible in spirit, even if IndexedDB migrations are not literally reversible. A migration should not do more than necessary. It should avoid large, complex data transformations unless required.

Examples of changes that require a Dexie version bump: adding a new object store, removing an object store, adding an index, removing an index, changing a primary key, or changing a compound index.

Examples of changes that may not require a Dexie version bump: adding a non-indexed field, changing renderer behavior, adding a new block type stored in the existing `blocks` store, changing Markdown export behavior, or adding read-time defaults.

A migration should never silently delete user-created research pages or blocks. If data cannot be migrated, preserve it in a fallback field or create a backup export path.

---

M00 Migration Failure Handling

---

Migration failure is one of the highest-risk local-development situations. If a Dexie upgrade fails, the app may be unable to open the database.

The app should show a clear error message rather than trying destructive repair automatically.

Recommended behavior: display a persistence error panel explaining that the local database could not be upgraded. Offer developer-oriented options only if implemented safely, such as "Export raw backup", "Retry", or "Reset local database".

For the proof-of-concept, "Reset local database" can exist only if it is clearly destructive and requires confirmation. It should not be the default.

If possible, before running risky migrations in later versions, the app should create a JSON backup or snapshot. In practice, IndexedDB versionchange transactions can make this awkward. A simpler mitigation is to keep migrations small and avoid destructive transforms.

---

N00 Backup Before Breaking Changes

---

Before making a large schema change during development, manually export JSON backup from the current app. This is the simplest and most reliable proof-of-concept workflow.

The app should provide a visible JSON backup export early. This allows experimentation with schema changes without treating the local browser profile as the only copy of research data.

A recommended development rule: before changing block shapes, indexes, or migration code, export a workspace backup.

The app can also expose a developer-only command such as `window.trnDebug.exportBackup()` during proof-of-concept development. This is optional, but it helps when UI export is broken during development.

---

O00 Cache and Deployment Mismatch Risk

---

Static hosting can produce cache mismatch problems. The browser may cache `index.html`, `app.js`, `storage-worker.js`, or vendored files differently. This can produce a UI script and Worker script from different versions.

Mitigation: use a Worker protocol handshake, include build/version constants, and avoid aggressive caching during proof-of-concept development.

For GitHub Pages, Codex can add cache-busting query strings during development if needed, such as loading `storage-worker.js?v=2026-04-25-1`. A more maintainable approach is to define an `APP_BUILD_ID` constant and use it consistently.

If the UI and Worker versions mismatch, the app should ask the user to reload. It should not continue if the protocol is incompatible.

---

P00 IndexedDB Blocked or Versionchange Events

---

IndexedDB upgrades can be blocked if another tab has the old database connection open. This can happen during local testing if the app is open in multiple tabs.

Mitigation: handle Dexie blocked/versionchange events. If the database upgrade is blocked, show a message asking the user to close other open instances of the app.

If this app may be used in multiple tabs, the code should also listen for database `versionchange` and close the old connection when appropriate. For the proof-of-concept, displaying a clear message is sufficient.

The app should avoid silent failure where the page appears loaded but persistence is not working.

---

Q00 Multi-Tab Editing Risk

---

Even though the app is local and single-user, the user may open it in multiple browser tabs. Two tabs can edit the same page and overwrite each other's changes.

The proof-of-concept does not need full multi-tab collaboration. It does need a reasonable safety policy.

Recommended MVP policy: assume one active editing tab. If multiple tabs are detected, show a warning that concurrent editing may overwrite changes.

Possible detection methods include `BroadcastChannel`, a heartbeat setting in IndexedDB, or `localStorage` events. `BroadcastChannel` is clean for same-origin tabs.

A simple approach: on app start, open a `BroadcastChannel` named `topic-research-notepad`. Send `hello`. If another tab responds, show a warning. This does not need to prevent editing; it only needs to make the risk visible.

If Codex wants stronger protection, it can implement a soft lock per page, but that is likely unnecessary for the first proof-of-concept.

---

R00 Out-of-Order Save Risk

---

Debounced autosave introduces a risk that older save responses return after newer edits have occurred. The UI might incorrectly show `Saved` even though newer edits are still pending.

Mitigation: maintain per-record local revision counters. A save request should include the revision number known at the time of the request. When the response returns, the storage client should mark the record clean only if the returned revision equals the latest local revision.

This does not need to be stored in IndexedDB. It can be an in-memory UI-side mechanism.

A durable `version` field on pages and blocks is optional. It may help later if multi-tab editing becomes important, but it is not required for the first proof-of-concept.

---

S00 Large Paste Risk

---

The user may paste a large webpage section, a huge table, or a long source-code file. This can create many blocks, large records, or expensive search index updates.

Mitigation: impose reasonable limits and degrade gracefully.

The paste pipeline can cap the number of generated blocks in one paste. It can also warn if the pasted content is very large and offer to insert as plain text or code block.

For large HTML tables, the converter can simplify the table, limit rows and columns, or insert a plain text representation. The first release should prefer a safe readable result over preserving complex structure.

Search index extraction should cap preview length. It should avoid storing enormous `rawPreview` strings.

The app should not freeze the UI during heavy paste processing. If paste conversion becomes expensive, it can later move to a Worker. For the proof-of-concept, defensive size limits are enough.

---

T00 Search Index Drift Risk

---

Because the search index is derived data, it can become stale if a block update succeeds but index update fails, or if migration code changes extraction behavior.

Mitigation: treat the search index as rebuildable. Provide a Worker message such as `rebuildSearchIndex` for development and repair. It can delete existing index records and rebuild from pages and blocks.

Normal writes should update source records and search index records in the same transaction where feasible. If that is not possible, source records are the authority. Search can be repaired.

The app should not store unique user data only in the search index.

---

U00 Data Corruption and Unknown Records

---

During proof-of-concept development, bugs may create malformed records. For example, a block may have no content, a table may have missing rows, or a page may point to blocks with bad sort orders.

Mitigation: normalize records on read. The renderer should never assume records are perfect.

For every loaded page and block, the app should pass data through normalization helpers. These helpers apply defaults, coerce invalid values when safe, and mark invalid records as unsupported when they cannot be repaired.

The fallback renderer should preserve raw data. It should not delete malformed blocks automatically.

A developer repair function can be added later, but automatic destructive cleanup should be avoided.

---

V00 Sort Order Saturation

---

Sparse numeric sort orders make reordering cheap, but repeated insertions between the same two items can eventually produce awkward fractional or crowded sort values.

Mitigation: periodically renumber sort orders for one page or the sidebar list. This is simple and safe.

For example, after a reorder, the Worker can assign sort orders as 1000, 2000, 3000. If using midpoint insertion, the app can renumber when the gap becomes too small.

For the MVP, assigning full order values after each reorder is acceptable. Research pages are unlikely to contain thousands of blocks during early evaluation.

---

W00 Storage Quota Risk

---

IndexedDB storage is large compared with localStorage, but it is not unlimited. Browser storage can also be cleared by the user, browser settings, or profile cleanup.

Mitigation: keep records normalized and avoid storing unnecessary raw HTML. Add JSON backup export. Consider showing approximate storage usage later if the app grows.

The proof-of-concept should not attempt to solve browser storage persistence completely. It should make backup possible and avoid wasteful storage patterns.

If `navigator.storage.persist()` is considered later, it should be optional and explained. It is not required for the first version.

---

X00 Browser Compatibility Risk

---

The first target is modern Chromium-based browsers, but static pages and extension contexts can still differ.

Potential issues include Worker path resolution, module Worker support, IndexedDB behavior in private browsing, clipboard API constraints, and contenteditable differences.

Mitigation: keep the first implementation conservative. Use plain Workers if module Workers cause deployment friction. Use feature detection. Keep clipboard handling inside user-initiated paste events. Avoid relying on experimental APIs.

If a feature is unavailable, the app should degrade visibly rather than silently breaking. For example, if Worker loading fails, a direct main-thread storage adapter can be used during development if Codex implements it.

---

Y00 Security and Sanitization Risk

---

The app will handle pasted HTML from arbitrary websites. Even though the app is local, untrusted HTML should not be stored and re-rendered as raw HTML.

Mitigation: sanitize pasted content and convert it into internal block data. Render from internal data using text nodes or safe escaping. Do not store event handlers, scripts, inline styles, arbitrary classes, or foreign layout wrappers as normal block content.

This is both a security and product-quality requirement. It prevents pasted content from poisoning the editor visually or behaviorally.

If a future feature stores raw HTML for debugging, it should never be rendered directly in the document. It should be treated as data and escaped when displayed.

---

Z00 Export Compatibility Risk

---

Exported JSON backups may outlive the current app version. If the export format is not versioned, future import becomes fragile.

Mitigation: include metadata in every JSON export.

A recommended backup shape is:

```js
{
  "app": "topic-research-notepad",
  "exportFormatVersion": 1,
  "appDataFormatVersion": 1,
  "exportedAt": "2026-04-25T12:00:00.000Z",
  "pages": [],
  "blocks": []
}
```

Future import code can inspect these fields and choose a migration path.

Markdown export does not need strict versioning because it is a human-readable output format, not a round-trip database backup.

---

AA00 Import Compatibility Risk

---

Import is likely to be added after export. It may need to accept backups from older proof-of-concept versions.

Mitigation: write import as a validation and migration pipeline, not as a blind database insert.

The import process should parse JSON, validate the top-level metadata, normalize page and block records, migrate old shapes if supported, generate new IDs if collisions occur, then insert records in a transaction.

Import should not overwrite existing data unless explicitly requested. The safer default is to import as additional pages.

If an imported block type is unknown, import it as an unsupported block rather than dropping it.

---

AB00 Extension Integration Risk

---

The standalone app may later move into a Chrome extension. Extension context can change storage boundaries, script loading, CSP rules, Worker behavior, and access to active tab data.

Mitigation: keep the editor, storage client, storage Worker protocol, and rendering logic separated. Do not tightly couple the application to GitHub Pages global state.

Capture inputs should already be plain data objects. For example, future extension capture can call a function with URL, title, selected text, and timestamp. It should not require the editor to know how the extension obtained that data.

The storage layer should be replaceable. The standalone app uses IndexedDB through a Worker. The extension version may reuse that design, or it may route through an extension background service worker. A clean storage API makes either path possible.

---

AC00 UI Framework Coupling Risk

---

The app uses a custom retro CSS framework. There is a risk that app behavior becomes too tightly coupled to particular class names, DOM shapes, or visual assumptions.

Mitigation: keep behavior and storage independent from styling. CSS classes should control appearance. Data state should live in JavaScript objects and IndexedDB records.

If the UI framework changes, the editor should still be able to render pages and blocks with adjusted templates.

Avoid storing UI framework class names in block content. A block should store semantic type and data, not visual implementation details.

---

AD00 Destructive Action Risk

---

Research notes can be valuable even during testing. Deleting a page or block permanently can cause accidental loss.

Mitigation: prefer archive for pages. Use soft delete or undo for blocks if practical. At minimum, keep destructive actions explicit and visually distinguish them from ordinary edit actions.

Permanent database reset should be developer-oriented and require confirmation. It should not be placed next to common user actions.

Before implementing permanent delete, ensure JSON backup is available.

---

AE00 Recommended Developer Utilities

---

During proof-of-concept development, a few developer utilities can reduce risk.

A `rebuildSearchIndex` command helps repair derived search data.

An `exportRawBackup` command helps recover data if the UI export path breaks.

A `validateDatabase` command can scan pages and blocks for missing fields, unknown block types, bad sort orders, and orphaned blocks.

A `renumberSortOrders` command can repair page or block ordering.

A `resetDatabase` command can exist only if clearly destructive and preferably hidden behind developer UI or console access.

These utilities do not need polished UI in the first version. They can be Worker messages or debug functions exposed during local development.

---

AF00 Recommended Minimal Resilience Set for the Proof of Concept

---

The proof-of-concept should include these resilience features from the beginning: Dexie schema versioning, stable IDs, block-based storage, read-time normalization, debounced targeted autosave, Worker protocol handshake, structured Worker errors, JSON backup export, safe paste normalization, and fallback rendering for unknown block types.

These features are not excessive. They directly protect against the most likely development risks.

The proof-of-concept can defer these features: full import migration matrix, multi-tab locking, snapshots, undo history, persistent per-record version conflict checks, storage quota UI, and advanced database repair UI.

---

AG00 Practical Rule for Codex

---

When unsure, Codex should choose the implementation that preserves user data and keeps future migration possible.

Do not delete unknown data automatically.

Do not render untrusted HTML directly.

Do not rewrite large documents for small edits.

Do not make search index the only copy of content.

Do not assume only perfect records exist.

Do not treat a proof-of-concept as disposable once real notes may be created inside it.

The application can be small and static, but its local data model should be deliberate.

