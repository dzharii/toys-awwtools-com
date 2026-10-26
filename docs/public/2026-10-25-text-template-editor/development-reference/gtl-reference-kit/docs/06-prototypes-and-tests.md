# Experiments, acceptance tests, and build handoff

This is a **prioritized experiment plan**, not an instruction to implement every subsystem before proving the document-centered editing experience.

## Phase 1: verify the central UX

1. Start a blank document in a dark shell with vertical history.
2. Select "Input + processing + output" and display the whole sentence immediately.
3. Focus `$processing`: a stable hint with example appears without overlapping the text.
4. Enter an answer and observe **immediate** replacement of every occurrence.
5. Change ordinary words around the placeholder without changing its identity.
6. Undo/redo and paste text. Confirm caret and selected range remain stable, including IME input.
7. Switch to another version and back; retained answers remain intact.
8. Render final text below the editor; copy as `text/plain` and `text/html` with no UI decoration.
9. Navigate away and back; retained content appears when selected storage mode persists it.

Test the real browser behaviors; static screenshots cannot validate caret correctness.

## Phase 2: vendor and worker feasibility

- Build two browser entrypoints with Bun: main app and dedicated worker.
- Load the exact `library/dexie-4.2.0.js` UMD distribution into the module worker. Confirm it actually initializes; do **not** infer compatibility from classic `importScripts` usage.
- Create an IndexedDB database and roundtrip a small document record through the worker message router.
- Run an in-memory store using the same repository interface.
- Simulate unexpected worker errors and missing responses; fail with actionable diagnostics and preserve main-thread editing state.
- Test schema upgrade and document+revision atomicity.

## Phase 3: live settings and alternate storage

- Change guidance visibility and background; apply without reload.
- Change persistence preference; specify whether old records are copied or left in the previous store.
- Verify memory-only mode never calls a persistent adapter.
- Verify localStorage adapter runs in the main thread; Dexie adapter uses worker or separately approved context.
- Simulate two tabs editing the same document: decide conflict/merge behavior before claiming robust synchronization.
- Ensure storage quota errors do not erase current editor state.

## Phase 4: export and bundled templates

- Manifest generation at build time; on-demand fetch of exact `.gtl` files from static hosting.
- Plain output copies with literal source newlines as expected.
- Rich copy uses sanitized semantic HTML with no dark application chrome.
- Markdown export preserves supported semantic structures.
- ZIP export includes useful metadata; does not embed private diagnostic logs.
- Imported templates never execute arbitrary JS/PowerShell.

## Tests to automate

| Test domain | Key assertions |
| --- | --- |
| Template parser | Reads literal `TEXT`, placeholders, optional guidance and VERSION blocks |
| Document model | Text and placeholders remain distinct; repeated placeholders share one value |
| Editor selection | Focus, paste, undo, IME, selection and caret survive reactive updates |
| Version switching | Retains previous placeholder answers; does not silently discard edited prose |
| Worker messaging | Correlates `requestId`; typed errors on unsupported scope, timeouts, worker failures |
| Storage | Save/load, schema migration, no-persist mode, quota failure, cross-tab conflict |
| History | Autosave distinct from revisions; restore is explicit and testable |
| Settings | Defaults/overrides/reset; live UI and worker updates |
| Clipboard | `text/plain` and `text/html` contain only final content |
| A11y | Keyboard navigation, focus indicators, labels, nonmodal guidance, reduced motion |

## Implementation-agent constraints

- **Ground implementation in the exact copied sources**; use `docs/04-source-map.md` as the lookup table.
- Keep extension-only APIs in a porting layer; never call `chrome.runtime` in static-site code.
- Preserve Third-party banners and obtain missing full licenses before release.
- Avoid adding design decisions to the DSL just to make programming easier.
- Keep feature boundaries proportional to feature complexity; no empty architecture boilerplate.
- No npm-installed runtime dependencies. Development and test dependencies are allowed. TypeScript/Bun versions should be pinned and reverified when work begins.
- Be explicit when a source file is only a reference and cannot be compiled stand-alone.
- Use web-server hosting for testing `fetch()` of `.gtl` and worker files; opening the static reference `index.html` locally is only for reading the documentation, not testing the application.
