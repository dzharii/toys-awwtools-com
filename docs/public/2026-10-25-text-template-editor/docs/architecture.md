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

The sidebar, settings fields, and docked guidance use open Shadow DOM with
semantic CSS variables. The selectable document and source editor use light DOM.
The textarea-based source overlay follows the skill-language-editor reference;
microlight performs text-node tokenization, with a GTL-specific color adapter.
Fixed document prose is never contenteditable.

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

There is no revision-history table. A snapshot includes the source definition;
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

## Build and validation

The Bun build type-checks browser, worker, and tooling contexts, validates the
manifest and every registered GTL file, bundles browser/worker entries, and copies
static assets. Production dependencies are vendored, not runtime npm imports.

Bun tests cover grammar, rendering, lifecycle, stale responses, navigation,
settings validation, and worker behavior. Playwright covers actual module-worker
Dexie, reload, independent versions, clipboard payloads, exports, source
recovery, settings propagation, concurrency, storage modes, deletion, mobile
layout, and subdirectory hosting. Browser failure tests use explicit injected
failures rather than treating a mocked success as proof of persistence.
