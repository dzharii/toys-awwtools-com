# Architecture and persistence

## Execution and feature ownership

The main thread owns immediate working state and browser-native Web Components.
The dedicated module worker owns Dexie/IndexedDB. `app-shell.ts` composes feature
services and maps semantic UI events to navigation, editing, clipboard, and
recovery actions. No worker round trip is required to display a keystroke.

The Templates feature owns parsing, diagnostics, and substitution. It has no DOM
or storage dependencies in its domain modules. Documents owns identity, answers,
related-version navigation, and meaningful-input rules. Template Authoring owns
editable source, not publication. Both use repository contracts rather than
Dexie directly. Settings owns its schema and effective preference document.
Export accepts literal generated text and never renders user-authored HTML.

Document navigation, settings fields, and guidance use open Shadow DOM with
semantic CSS variables. Panel shells, authoring navigation, the selectable
document, and source editor use light DOM.
The textarea-based source overlay follows the skill-language-editor reference;
microlight performs text-node tokenization, with a GTL-specific color adapter.
Fixed document prose is never contenteditable.

## Workspace panels and discovery

`platform/ui/panels/layout.ts` owns pure validation, defaults, clamping, and
same-edge allocation. `panel-manager.ts` owns presentation and interaction.
Documents and Authoring have independent desired layouts. Effective layout
adapts to VisualViewport constraints without overwriting desktop intent.
Continuously mounted panel bodies preserve editor identity, selection, native
undo, and internal scrolling; docking does not move editors between DOM parents.

Expanded same-edge panels share width and use roving-keyboard tabs. Collapsing
the final member releases that width completely. Pointer capture, a drag
threshold, bounded resize/move commands, and interruption cleanup share one
interaction owner. Frames change presentation only; settled deliberate changes
persist to `gtl.workspace-layout.v1`. Corruption/write failures retain usable
session state with explicit Issues/retry/reset, never content deletion.

Full Settings remains a route; compact Settings is an independent nonmodal
panel. Both and local text controls use the same SettingsService. Reading scales
are CSS presentation only; browser-suggestion suppression changes native input
attributes without replacing editors.

The catalog indexes bundled definitions only, with deterministic normalized
ranking and bounded fuzzy matches. Indexing is incremental/background after
manifest loading; an unrelated stalled definition cannot block saved-snapshot
editing. Samples use the production renderer with deterministic illustrative
values, never saved answers. Request generations reject stale preview results.
Native auto popovers provide light dismissal and invoker focus relationships;
focus-triggered previews are suppressed through the native closing toggle so
focus restoration cannot reopen a dismissed sample.

## Worker protocol

Requests carry `protocolVersion`, `scope`, `type`, `requestId`, and `payload`.
The typed operation map in `platform/messaging/protocol.ts` defines client
contracts. The router validates envelopes and delegates to registered feature
handlers. Feature handlers validate payloads; repositories decode persisted and
returned records. Successful dispatch is not considered a successful operation.

Responses contain either `ok: true` and a result, or a structured code/message.
Unknown scope, operation, invalid payload, and storage failures are distinct.
The client correlates responses, rejects requests after 15 seconds, rejects
pending requests after crashes/restarts, and ignores expired replies. Retry
storage performs a controlled worker restart and reload without resetting data.
A timed-out write may already have committed; revision checks make a subsequent
retry a safe conflict rather than a silent overwrite.

## Database and adapters

Database: `guided-document-editor`, centrally managed Dexie schema version 1.

| Table             | Primary key | Indexes                       |
| ----------------- | ----------- | ----------------------------- |
| `documents`       | `id`        | `updatedAt`, `relatedGroupId` |
| `authoringDrafts` | `id`        | `updatedAt`                   |

There is no separate revision-history table. A document snapshot includes the source definition;
decoding reparses the original source and checks that the selected version still
exists. Saved documents do not depend on later bundled-template deployments.

All repositories expose `list`, `get`, `save(expectedRevision)`, and
`delete(expectedRevision)`. IndexedDB comparisons and writes occur in one Dexie
transaction. localStorage uses `gtl.documents.v1` / `gtl.authoring.v1`,
`schemaVersion: 1`, and a cross-tab Web Lock around read/compare/write.
Memory repositories use isolated maps and structured clones.

Invalid JSON, malformed records, and unsupported schema versions are reported,
not silently reset. Read failure never becomes permission to overwrite an
existing collection. Memory working state remains available after write failure.
There is no silent store migration: each open record retains its originating
adapter and becomes read-only while a different mode is selected.

## Document lifecycle and concurrent saves

Untouched template previews are temporary. Only non-whitespace answers or a
semantically different custom title make a new document eligible for saving.
Reverting an unpersisted preview returns it to temporary. Clearing a previously
saved document instead updates that existing record.

Related version documents share a navigation group, never answers. Each has its
own UUID, snapshot, timestamps, and revision. New Document creates a new group.

The service updates in-memory values immediately and keeps a change counter.
One write per working identity can be in flight. Each save captures a coherent
record and counter; success advances the revision but marks the record saved only
if the counter still matches. A navigation flush waits for an in-flight write and
then saves any newer edits. Failures remain visible while the user continues
typing. Conflict never triggers an automatic retry/merge.

The default 60-second interval is a maximum normal delay between save
opportunities, not a debounce that can be postponed indefinitely by typing.
Navigation, hidden, and pagehide events also request flushing. Pending changes
trigger the browser's native before-unload warning where supported.

## Preferences and diagnostics

`gtl.preferences.v1` is an independent localStorage bootstrap record. The
declarative schema supplies UI controls, defaults, allowed values, and interval
bounds (whole seconds, 1–3600). Updates apply locally immediately, persist, and
notify other tabs through BroadcastChannel and storage events; receivers reload
the authoritative preference record. Worker-relevant diagnostics are propagated
through `system.configure`.

Logs are console-only, severity-filtered, and styled/plain. Structured metadata
is snapshotted with guarded JSON serialization. Call sites deliberately exclude
document bodies, answers, source, titles, and clipboard values.

## Archive and authoring history

Archive is document metadata, not a content edit. Active/Archived/Recent
presentation is independent of content persistence; undo/restore retain identity.
Delete coordinates pending saves so a removed record cannot be resurrected.
Refresh generations, mutation epochs, and revision guards prevent late list
responses from removing new work, rolling back revisions, or reviving deletions.

Authoring display titles are separate from GTL names. Current records contain
strictly decoded immutable checkpoints with exact source, stable IDs, timestamps,
and explicit/pre-restore kind. Save now deduplicates exact source; ordinary
autosave does not create history. Restore protects current in-memory source and
replaces current source in one revision-checked repository write. Failure leaves
both current source and persisted history intact. Current-save and checkpoint
failure are reported separately. Only unnamed automatic recovery snapshots are
pruned, to 25; explicit/named checkpoints are protected.

Historical/bundled inspection uses a separate readonly editor, leaving the
mounted current textarea and its undo stack intact. The native source backing
model preserves untouched CRLF/mixed endings. Safe GTL-name edits change only a
unique top-level declaration. Memory history is explicitly session-only.
No legacy converters, database migrations, or migration tests are implemented.

## Build and validation

The Bun build type-checks browser, worker, and tooling contexts, validates the
manifest and every registered GTL file, bundles browser/worker entries, and copies
static assets. Production dependencies are vendored, not runtime npm imports.
The build emits `build-info.json`: SHA-256 digests of its source/configuration
inputs and every deployed artifact. The external suite independently verifies
input membership/content, output integrity, and served critical-resource hashes
before launching its browser journeys. This provenance is infrastructure, not a
renderer or parser oracle.

Bun tests cover grammar, rendering, lifecycle, stale responses, navigation,
settings validation, and worker behavior. Playwright covers actual module-worker
Dexie, reload, independent versions, clipboard payloads, exports, source
recovery, settings propagation, concurrency, storage modes, deletion, mobile
layout, and subdirectory hosting. Browser failure tests use explicit injected
failures rather than treating a mocked success as proof of persistence.

Playwright, axe, Page Objects, components, Flows, independently owned fixtures, and
expected output live in `ui-regression-test-suite`, with a separate lockfile and
configuration. Product tooling compiles only product source/scripts/unit tests.
Import audits resolve TypeScript aliases, re-exports, type/dynamic imports, and
real paths; source links and configuration escapes are rejected. Neither
application imports the other's implementation.

Chromium is worker-scoped; scenario contexts are fresh, while reloads and
deliberate two-tab operations retain the context. Structural readiness and
fresh-open focus are separate contracts. Bounded diagnostic captures have a
sticky critical-error gate, so a warning burst cannot erase a preceding failure.
Native auto popovers provide export-menu light dismissal and focus return.
See the root architecture decisions and the suite coverage register for the
precise assertion register, major-UX coverage, and remaining verification limits.
