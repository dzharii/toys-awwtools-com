2026-04-26

A00 Acceptance Checklist: Topic Research Notepad

---

This checklist is the implementation acceptance and verification checklist for the Topic Research Notepad proof of concept. Codex should use it to split the work into coherent chunks, complete each chunk, test it, review it, document important decisions, and then proceed autonomously to the next chunk until the full specification is implemented.

Codex should work autonomously through the checklist and continue from one implementation chunk to the next without waiting for additional instruction unless a blocker prevents meaningful progress. At each checkpoint, Codex should reflect on what was implemented, verify the affected behavior, add or update tests where practical, document important deviations, and then continue.

Codex should use its best technical judgment when applying this checklist. Codex may resolve inconsistencies, ambiguities, or minor conflicts in the requirements by choosing the solution that is most coherent with this project's architecture, easiest to maintain, easiest to test, and most consistent with the intended behavior.

Codex may rewrite, refactor, reorganize, or simplify existing code when doing so improves consistency, coherence, maintainability, or testability. Codex should not preserve inconsistent existing patterns only for the sake of minimal changes.

Codex should verify all connected parts of this project affected by the implementation, including code, tests, documentation, examples, demos, type definitions, public APIs, exports, comments, schemas, fixtures, mocks, generated files, and related utilities where applicable.

---

B00 Requirement Coverage

---

* [ ] Review the Product Requirement Document for the Topic Research Notepad and identify the intended MVP behavior.
* [ ] Review Appendix A for migration, versioning, and resilience expectations.
* [ ] Review Appendix B for Codex development rules, Bun usage, dependency restrictions, JSDoc expectations, and documentation requirements.
* [ ] Review Appendix C for the UI framework directive and confirm the provided retro web component and CSS library is used as the UI foundation.
* [ ] Confirm the app is implemented as a static browser application that can be bundled and hosted on GitHub Pages.
* [ ] Confirm the app uses modern JavaScript and Bun for build and test workflows.
* [ ] Confirm no new NPM modules were installed.
* [ ] Confirm all runtime dependencies come from files already present in the project, including Dexie 4.2.0 if provided.
* [ ] Confirm the application stores durable user data in IndexedDB.
* [ ] Confirm Dexie is used as the IndexedDB wrapper unless a documented technical reason explains a different local implementation.
* [ ] Confirm the UI uses the provided retro-style web component and CSS library.
* [ ] Confirm any UI library additions or modifications are documented.
* [ ] Confirm the app supports one local workspace containing many research pages.
* [ ] Confirm each page has a stable identifier.
* [ ] Confirm each block has a stable identifier.
* [ ] Confirm pages and blocks are stored separately so small edits do not rewrite an entire document.
* [ ] Confirm the main editor supports inline editing.
* [ ] Confirm the sidebar supports page creation, selection, rename, and ordering or a documented MVP-safe ordering alternative.
* [ ] Confirm supported block types include paragraph, heading, quote, list, table, code, and source link.
* [ ] Confirm pasted HTML is treated as untrusted and normalized into internal block data.
* [ ] Confirm search works across page titles and block text.
* [ ] Confirm Markdown export works for the current page.
* [ ] Confirm JSON backup export exists or, if explicitly deferred, the deferral is documented with a follow-up.
* [ ] Confirm autosave uses targeted writes and debounce behavior.
* [ ] Confirm Worker-based persistence is implemented, or a storage adapter fallback is documented if Worker setup is deferred.
* [ ] Confirm affected public APIs, configuration, JSDoc typedefs, exports, and usage patterns are updated.
* [ ] Confirm ambiguity or inconsistency was resolved deliberately and documented where meaningful.
* [ ] Record major assumptions, tradeoffs, limitations, and unresolved follow-ups in Markdown notes.

---

C00 Implementation Chunk Plan

---

* [ ] Chunk 1: inspect existing project files, provided UI framework, vendored dependencies, demo assets, Bun configuration, and current project structure.
* [ ] Chunk 2: establish static app shell, Bun build flow, source layout, output layout, and GitHub Pages-compatible build target.
* [ ] Chunk 3: integrate the provided retro UI framework into the application shell.
* [ ] Chunk 4: implement the IndexedDB/Dexie schema, version constants, model factories, and record normalization helpers.
* [ ] Chunk 5: implement the storage Worker or storage adapter, including documented message envelopes and structured errors.
* [ ] Chunk 6: implement the storage client on the main thread, including request IDs, promises, debounced saves, flush behavior, and save-status reporting.
* [ ] Chunk 7: implement page sidebar behavior: list pages, create page, select page, rename page, archive/delete if included, and reorder or safe reorder alternative.
* [ ] Chunk 8: implement main editor rendering and inline editing for paragraph and heading blocks.
* [ ] Chunk 9: implement remaining block types: quote, list, table, code, and source link.
* [ ] Chunk 10: implement paste sanitization and normalization into internal blocks.
* [ ] Chunk 11: implement search index generation, search UI, and result navigation.
* [ ] Chunk 12: implement Markdown export and JSON backup export.
* [ ] Chunk 13: implement error states, empty states, loading states, degraded persistence states, and unknown block fallback rendering.
* [ ] Chunk 14: add unit tests for pure logic and regression-prone behavior.
* [ ] Chunk 15: add or update project documentation, implementation notes, decision notes, manual testing notes, and UI framework change notes.
* [ ] Chunk 16: run final build, tests, browser manual verification, and acceptance review.

At the end of each chunk:

* [ ] Confirm the app still builds.
* [ ] Run relevant Bun tests.
* [ ] Manually verify the visible behavior when the chunk affects UI.
* [ ] Add or update tests for pure logic where practical.
* [ ] Document meaningful deviations from the specification.
* [ ] Continue autonomously to the next chunk unless blocked.

---

D00 Functional Verification

---

* [ ] Verify the primary workflow: open app, create page, type notes, add blocks, reload browser, confirm data persists.
* [ ] Verify the research workflow: create a topic page, add source links, paste web content, organize blocks, search for saved material, and export Markdown.
* [ ] Verify the app works as a static browser app after Bun build.
* [ ] Verify the app does not require a server backend after static assets load.
* [ ] Verify the app does not require network APIs for core functionality.
* [ ] Verify the UI remains coherent with the provided retro framework.
* [ ] Verify the app does not introduce a parallel unrelated UI system.
* [ ] Verify existing UI framework behavior remains compatible unless intentionally changed.
* [ ] Verify any UI framework changes are reusable or clearly application-specific.
* [ ] Verify page and block IDs remain stable across reloads.
* [ ] Verify page and block updates are targeted to relevant records.
* [ ] Verify autosave does not write one large full-page document on every keystroke.
* [ ] Verify pending writes flush on blur, page switch, export, and page hide where practical.
* [ ] Verify failures are visible and do not silently discard user edits.
* [ ] Verify search index entries are updated when page titles or blocks change.
* [ ] Verify the app can recover from missing, malformed, or unknown block data without crashing.
* [ ] Verify obsolete or conflicting logic was removed.

---

E00 Project-Specific Verification Scenarios

---

### Scenario: First app load and first research page

* [ ] Purpose: verify startup, IndexedDB initialization, empty state, first page creation, and first editable block.
* [ ] Preconditions: fresh browser profile or cleared `TopicResearchNotepadDB`; built app served as static assets.
* [ ] Steps:

  * [ ] Open the static app.
  * [ ] Confirm the retro-styled app shell appears.
  * [ ] Confirm the app shows an empty-state path or creates an initial page according to implementation choice.
  * [ ] Create a page named `Auth library comparison`.
  * [ ] Type into the first block.
  * [ ] Reload the browser.
* [ ] Expected result:

  * [ ] The page appears in the sidebar.
  * [ ] The typed block content persists after reload.
  * [ ] The status strip reports local storage readiness and saved state.
* [ ] Test coverage:

  * [ ] Covered by model/storage unit tests where practical.
  * [ ] Covered by manual browser test.
* [ ] Notes:

  * [ ] If the app chooses to auto-create the first page, document that behavior.

### Scenario: Sidebar page management

* [ ] Purpose: verify local research pages can be created, selected, renamed, and ordered.
* [ ] Preconditions: app has IndexedDB available.
* [ ] Steps:

  * [ ] Create pages named `Pricing research`, `API notes`, and `Interview sources`.
  * [ ] Select each page from the sidebar.
  * [ ] Rename `API notes` to `Payment API notes`.
  * [ ] Reorder pages through drag reorder or the implemented safe ordering control.
  * [ ] Reload the app.
* [ ] Expected result:

  * [ ] Each page opens correctly.
  * [ ] The renamed title appears in both editor and sidebar.
  * [ ] Page order persists after reload.
* [ ] Test coverage:

  * [ ] Covered by page model and storage tests where practical.
  * [ ] Covered by manual browser test.
* [ ] Notes:

  * [ ] If drag reorder is replaced with move-up/move-down controls, document the deviation.

### Scenario: Inline block editing and targeted autosave

* [ ] Purpose: verify block-based editing, debounced persistence, and reload recovery.
* [ ] Preconditions: page exists with paragraph, heading, quote, list, table, code, and source link blocks.
* [ ] Steps:

  * [ ] Edit a paragraph block.
  * [ ] Edit a heading block.
  * [ ] Edit a quote block.
  * [ ] Edit one list item.
  * [ ] Edit one table cell.
  * [ ] Edit a source link note.
  * [ ] Wait for save status to become saved.
  * [ ] Reload the app.
* [ ] Expected result:

  * [ ] All edits persist.
  * [ ] Save status does not claim saved before persistence completes.
  * [ ] The implementation updates changed block records rather than rewriting a whole page blob.
* [ ] Test coverage:

  * [ ] Covered by block normalization and storage tests where practical.
  * [ ] Covered by manual browser test.
* [ ] Notes:

  * [ ] Check storage code for per-block updates and debounced saves.

### Scenario: Safe paste from messy webpage HTML

* [ ] Purpose: verify pasted HTML is sanitized and converted into internal blocks.
* [ ] Preconditions: page exists and editor is focused.
* [ ] Steps:

  * [ ] Paste HTML containing headings, paragraphs, lists, links, tables, inline styles, classes, scripts, event handlers, and irrelevant wrappers.
  * [ ] Inspect the rendered result.
  * [ ] Save and reload.
* [ ] Expected result:

  * [ ] Meaningful structure is preserved as supported local blocks.
  * [ ] External styles, scripts, event handlers, classes, and unsafe markup are removed.
  * [ ] The editor visual style remains consistent with the retro UI framework.
  * [ ] Reloaded content renders from internal data, not raw pasted HTML.
* [ ] Test coverage:

  * [ ] Covered by paste conversion unit tests.
  * [ ] Covered by manual browser paste test.
* [ ] Notes:

  * [ ] If no sanitizer library exists, confirm the local allowlist sanitizer is documented.

### Scenario: Source link research capture

* [ ] Purpose: verify source link blocks support provenance-oriented research notes.
* [ ] Preconditions: page exists.
* [ ] Steps:

  * [ ] Add a source link block.
  * [ ] Enter a URL, title, domain or derived domain, note, and optional captured text.
  * [ ] Open the source URL through the block action.
  * [ ] Search for text from the title, URL, and note.
* [ ] Expected result:

  * [ ] Source link block persists all fields.
  * [ ] The URL is openable.
  * [ ] Search finds the source link through title, URL, and note text.
* [ ] Test coverage:

  * [ ] Covered by source block model, search extraction, and export tests where practical.
* [ ] Notes:

  * [ ] The standalone app does not need remote metadata fetching.

### Scenario: Table comparison workflow

* [ ] Purpose: verify simple research comparison tables work without spreadsheet complexity.
* [ ] Preconditions: page exists.
* [ ] Steps:

  * [ ] Insert a table block.
  * [ ] Add rows and columns.
  * [ ] Edit cell text.
  * [ ] Delete a row or column.
  * [ ] Export page as Markdown.
* [ ] Expected result:

  * [ ] Table edits persist after reload.
  * [ ] Table export produces readable Markdown table output.
  * [ ] No formulas, sorting, filtering, merged cells, or spreadsheet-only behavior is required.
* [ ] Test coverage:

  * [ ] Covered by table model and Markdown export tests where practical.
* [ ] Notes:

  * [ ] Large or complex pasted tables may be simplified; document the behavior.

### Scenario: Local search and result navigation

* [ ] Purpose: verify search across pages and blocks.
* [ ] Preconditions: several pages exist with varied block content.
* [ ] Steps:

  * [ ] Search for a page title term.
  * [ ] Search for paragraph text.
  * [ ] Search for table cell text.
  * [ ] Search for source link note text.
  * [ ] Select a result.
* [ ] Expected result:

  * [ ] Matching pages and blocks appear.
  * [ ] Selecting a result opens the page.
  * [ ] The editor scrolls or focuses near the matching block where implemented.
  * [ ] Archived pages are excluded unless implementation intentionally includes them.
* [ ] Test coverage:

  * [ ] Covered by search text extraction and search index tests.
* [ ] Notes:

  * [ ] Search index must be treated as derived and rebuildable.

### Scenario: Markdown and JSON export

* [ ] Purpose: verify user can extract local research data.
* [ ] Preconditions: page exists with all MVP block types.
* [ ] Steps:

  * [ ] Export current page as Markdown.
  * [ ] Inspect Markdown output.
  * [ ] Export workspace as JSON backup.
  * [ ] Inspect JSON metadata and records.
* [ ] Expected result:

  * [ ] Markdown includes title, headings, paragraphs, quotes, lists, tables, code, and source links.
  * [ ] JSON backup includes export metadata, format version, pages, and blocks.
  * [ ] Export flushes pending writes before reading durable data.
* [ ] Test coverage:

  * [ ] Covered by Markdown export and backup shape unit tests where practical.
* [ ] Notes:

  * [ ] Search index records do not need to be included in normal backup.

### Scenario: Worker protocol and storage error behavior

* [ ] Purpose: verify Worker-backed local backend is documented and resilient.
* [ ] Preconditions: storage Worker enabled.
* [ ] Steps:

  * [ ] Confirm `hello` or initialization handshake validates protocol version.
  * [ ] Confirm requests include request IDs.
  * [ ] Confirm responses include success or structured error information.
  * [ ] Simulate or inspect handling for failed writes.
* [ ] Expected result:

  * [ ] UI and Worker protocol mismatch fails clearly.
  * [ ] Storage errors are visible in the UI.
  * [ ] Failed writes do not clear editor content.
* [ ] Test coverage:

  * [ ] Covered by storage client tests where practical.
  * [ ] Covered by manual failure review or implementation note.
* [ ] Notes:

  * [ ] If Worker is deferred, document the storage adapter fallback and remaining work.

### Scenario: Unknown or migrated block data

* [ ] Purpose: verify future-proof rendering and data preservation.
* [ ] Preconditions: database contains or test fixture simulates an unknown block type or malformed block content.
* [ ] Steps:

  * [ ] Load a page containing an unknown block type.
  * [ ] Load a page containing a malformed table or list block.
  * [ ] Export the page.
* [ ] Expected result:

  * [ ] App does not crash.
  * [ ] Unknown block is rendered with a safe fallback.
  * [ ] Raw data is preserved or safely represented.
  * [ ] Export does not silently drop unknown content.
* [ ] Test coverage:

  * [ ] Covered by normalization and export fallback tests.
* [ ] Notes:

  * [ ] This scenario verifies Appendix A resilience requirements.

### Scenario: UI framework integration

* [ ] Purpose: verify the app uses the provided retro component and CSS library as a directive, not optional inspiration.
* [ ] Preconditions: provided UI framework exists in project files.
* [ ] Steps:

  * [ ] Inspect app shell, sidebar, editor, toolbar, block controls, status strip, and error states.
  * [ ] Confirm visual components come from the provided framework or compatible extensions.
  * [ ] Confirm any new UI components are documented.
* [ ] Expected result:

  * [ ] App looks and behaves like part of the retro tool ecosystem.
  * [ ] No unrelated visual system is introduced.
  * [ ] App-specific CSS is limited to integration, layout, and editor-specific needs.
* [ ] Test coverage:

  * [ ] Covered by manual visual review.
* [ ] Notes:

  * [ ] If Codex modifies the UI library, document what changed and why.

---

F00 Testing Verification

---

* [ ] Confirm Bun is used for unit testing.
* [ ] Confirm the test command is documented in `package.json` or project notes.
* [ ] Confirm new behavior is covered by meaningful unit tests where practical.
* [ ] Confirm model factory behavior is tested.
* [ ] Confirm page and block normalization behavior is tested.
* [ ] Confirm search text extraction is tested for all supported block types.
* [ ] Confirm Markdown export is tested for all supported block types.
* [ ] Confirm JSON backup shape is tested.
* [ ] Confirm paste conversion is tested for headings, paragraphs, lists, links, tables, code, unsafe tags, unsafe attributes, and fallback plain text behavior.
* [ ] Confirm sort-order helpers are tested if implemented as pure functions.
* [ ] Confirm storage-client debounce behavior is tested if practical in Bun.
* [ ] Confirm changed behavior has updated tests.
* [ ] Confirm regression-prone existing behavior has regression tests.
* [ ] Confirm tests cover normal cases, edge cases, invalid inputs, and relevant failure cases.
* [ ] Confirm tests verify behavior rather than implementation details.
* [ ] Run the relevant Bun test command for changed areas.
* [ ] Fix all test failures.
* [ ] Re-run tests after fixes.
* [ ] Run the broader relevant Bun test suite before final acceptance.
* [ ] Document any behavior that cannot be tested reliably in Bun and must be verified manually in the browser.

---

G00 Documentation, Notes, and Demo Verification

---

* [ ] Confirm `README.md` or equivalent project documentation explains how to install nothing, build with Bun, test with Bun, and run or serve the static app.
* [ ] Confirm documentation states that new NPM modules must not be installed.
* [ ] Confirm IndexedDB schema and record shapes are documented in JSDoc or Markdown.
* [ ] Confirm Worker message protocol is documented.
* [ ] Confirm storage client API is documented.
* [ ] Confirm autosave debounce strategy is documented.
* [ ] Confirm paste sanitization rules are documented.
* [ ] Confirm search index is documented as derived and rebuildable.
* [ ] Confirm export formats are documented.
* [ ] Confirm any UI framework changes are documented.
* [ ] Confirm meaningful deviations from the specification are recorded in Markdown notes.
* [ ] Confirm known limitations are recorded.
* [ ] Confirm manual testing steps are recorded.
* [ ] Confirm examples or demo pages are updated when visible behavior changed.
* [ ] Confirm comments are updated only where they clarify non-obvious logic.
* [ ] Confirm documentation, examples, demos, and comments match the final implementation.
* [ ] Confirm no outdated instructions, examples, screenshots, or references remain.

---

H00 Refactoring and Code Quality Verification

---

* [ ] Confirm implementation is coherent with the project's architecture.
* [ ] Confirm modules have clear responsibilities.
* [ ] Confirm storage logic is not scattered through UI event handlers.
* [ ] Confirm paste conversion is separate from rendering and persistence.
* [ ] Confirm search indexing is separate from editor rendering.
* [ ] Confirm export logic consumes internal data records rather than scraping rendered DOM.
* [ ] Confirm Worker communication uses request IDs and structured responses.
* [ ] Confirm no unnecessary duplication remains.
* [ ] Confirm names match responsibilities.
* [ ] Confirm related logic is organized consistently.
* [ ] Confirm the implementation avoids awkward special cases where a cleaner design is possible.
* [ ] Confirm refactoring was purposeful and related to the requirements.
* [ ] Confirm unrelated areas were not refactored only for preference.
* [ ] Confirm obsolete code paths, unused helpers, conflicting patterns, and dead demos were removed where applicable.
* [ ] Confirm public APIs and JSDoc types remain accurate after refactors.
* [ ] Confirm no app logic depends on raw pasted HTML.
* [ ] Confirm no app logic stores DOM nodes, functions, or class instances in IndexedDB.
* [ ] Confirm browser Worker messages use structured-clone-safe plain data.

---

I00 Data Model and Migration Verification

---

* [ ] Confirm database name and version constants are defined.
* [ ] Confirm app data format version is defined if implemented.
* [ ] Confirm export format version is defined.
* [ ] Confirm Worker protocol version is defined if Worker messaging is implemented.
* [ ] Confirm Dexie schema is explicit and versioned.
* [ ] Confirm pages store contains durable page metadata, not full document content.
* [ ] Confirm blocks store contains page-linked content blocks.
* [ ] Confirm blocks are queryable by page ID and sortable by page order.
* [ ] Confirm search index store contains derived searchable text and can be rebuilt.
* [ ] Confirm settings store stores selected page and app preferences where applicable.
* [ ] Confirm adding non-indexed fields can be handled by read-time defaults.
* [ ] Confirm unknown block types are rendered safely.
* [ ] Confirm malformed records are normalized or safely represented.
* [ ] Confirm destructive migrations are avoided.
* [ ] Confirm migration and compatibility assumptions are documented.

---

J00 Persistence and Autosave Verification

---

* [ ] Confirm typing updates UI immediately.
* [ ] Confirm typing schedules debounced targeted saves.
* [ ] Confirm repeated edits to one block collapse into a smaller number of database writes.
* [ ] Confirm editing one block does not rewrite all page blocks as a single document blob.
* [ ] Confirm blur flushes pending edits for the active block.
* [ ] Confirm page switch does not lose pending edits from the previous page.
* [ ] Confirm export flushes pending edits before reading data.
* [ ] Confirm page hide or visibility change attempts to flush pending edits where practical.
* [ ] Confirm save status distinguishes dirty, saving, saved, and failed states.
* [ ] Confirm failed writes do not discard local editor content.
* [ ] Confirm out-of-order save responses do not incorrectly mark newer edits as saved.
* [ ] Confirm batch operations are used for paste insertion and reorder where practical.
* [ ] Confirm transactions are used for operations that must keep records and search index consistent.

---

K00 UI Framework Verification

---

* [ ] Confirm the provided retro web component and CSS library is loaded and used.
* [ ] Confirm app shell uses the framework's visual language.
* [ ] Confirm sidebar uses framework-compatible panels, lists, buttons, and inputs.
* [ ] Confirm editor blocks use framework-compatible styling.
* [ ] Confirm source link blocks render as compact retro cards or compatible structures.
* [ ] Confirm table blocks render as compact framework-compatible grids.
* [ ] Confirm code blocks render as framed monospaced regions.
* [ ] Confirm status strip uses framework-compatible feedback styling.
* [ ] Confirm errors and empty states use framework-compatible presentation.
* [ ] Confirm app-specific CSS does not create a separate design system.
* [ ] Confirm any newly added framework components follow existing naming, API, and style conventions.
* [ ] Confirm any framework changes are documented for later merge into the main library.

---

L00 Security and Safety Verification

---

* [ ] Confirm pasted HTML is never inserted directly into the live editor.
* [ ] Confirm pasted HTML is parsed in a detached context.
* [ ] Confirm sanitizer removes scripts.
* [ ] Confirm sanitizer removes inline event handlers.
* [ ] Confirm sanitizer removes unsafe attributes.
* [ ] Confirm sanitizer removes style/class pollution unless explicitly allowlisted.
* [ ] Confirm rendered text is escaped or inserted safely.
* [ ] Confirm arbitrary HTML from IndexedDB is not rendered as trusted DOM.
* [ ] Confirm source URLs are handled safely and displayed as text or safe links.
* [ ] Confirm no remote scripts or CDN dependencies are introduced.
* [ ] Confirm the app does not add network calls unless explicitly required and documented.
* [ ] Confirm malformed records cannot crash the entire app.

---

M00 Build and Static Deployment Verification

---

* [ ] Confirm Bun build command succeeds.
* [ ] Confirm build output is static and identifiable, such as `dist`.
* [ ] Confirm generated `index.html` references correct bundled assets.
* [ ] Confirm Worker script path works from the built output.
* [ ] Confirm vendored Dexie and UI framework assets are included or referenced correctly.
* [ ] Confirm app runs when served from static hosting path.
* [ ] Confirm no runtime NPM server is required.
* [ ] Confirm GitHub Pages path assumptions are documented if relevant.
* [ ] Confirm cache-sensitive Worker/version issues are handled or documented.

---

N00 Final Acceptance Review

---

* [ ] Confirm all required MVP features are implemented.
* [ ] Confirm all project-specific verification scenarios pass.
* [ ] Confirm all relevant Bun tests pass.
* [ ] Confirm the app builds successfully.
* [ ] Confirm the built static app works in a modern Chromium-based browser.
* [ ] Confirm all connected code, tests, docs, examples, demos, comments, JSDoc types, exports, schemas, fixtures, mocks, and generated files are updated where relevant.
* [ ] Confirm the implementation is maintainable, coherent, and consistent with this project.
* [ ] Confirm no new NPM modules were installed.
* [ ] Confirm all meaningful deviations from the specification are documented.
* [ ] Confirm all known limitations and follow-ups are documented.
* [ ] Confirm final manual testing notes are complete.
* [ ] Prepare a final implementation summary containing:

  * [ ] What changed.
  * [ ] What was tested.
  * [ ] What documentation, examples, or demos were updated.
  * [ ] What was refactored.
  * [ ] What UI framework changes were made.
  * [ ] What tradeoffs or follow-ups remain.
  * [ ] Whether the app is ready for proof-of-concept evaluation.
  * [ ] Whether any issue may affect later Chrome extension integration.

Once implementation is completed, edit the following file and add a new entry about this project into the at the end of the toys section of this file. Make sure that the link points to something that can be interactable and viewable by the user, maybe this folder or something like that, and readme file is properly formatted and exists, and the entry is valid. This is the final step of the implementation.
File to edit: ../../index.html
