A00-00 Scope and intent

This specification changes parsing behavior from "parse only the currently active file" to "parse all loaded files" using a queued, micro-batched pipeline that preserves UI responsiveness. The change applies to Tree-sitter parsing and any derived indexing work that currently depends on the active document (outline, includes, symbol references, and any related cross-file aggregations).

The implementation target is the existing codebase that includes `config.js`, `persistence.js`, `dom-elements.js`, `tree-sitter-helpers.js`, `symbol-references.js`, and related controllers that orchestrate file loading, UI updates, and parsing.

B00-00 Current behavior summary (baseline to be replaced)

Today, parsing work is effectively gated by the "active file" concept. Tree-sitter parsing, outline/include extraction, and Tree-sitter-based symbol contribution building are performed when the user opens the Tree-sitter window and/or triggers parse for the currently active document, and derived data is computed primarily for that active document. Other files may only receive heuristic analysis or no analysis until they become active.

This gating must be removed. The new system must treat file loading as the trigger, not file activation.

C00-00 New functional requirements

Once the project file inventory is loaded into memory (or as each file becomes available during streaming load), every eligible file must be enqueued for parsing and per-file analysis, regardless of whether the file is active or ever becomes active.

Eligibility rules must match existing allow/ignore behavior. If a file is filtered out by ignore rules, extension allowlist, size limits, or any other existing load exclusions, it is not parsed because it is not loaded. If JSON is excluded by settings, then JSON files are not parsed unless they are loaded (if JSON is loaded in some modes, it may still be parsed, consistent with settings).

Tree-sitter parsing must run for files whose language is supported by `TREE_SITTER_LANGUAGES`. For other loaded files, the system must still perform non-Tree-sitter per-file analysis that is safe and useful (for example, heuristic symbol extraction and file reference candidate extraction) so that "parse all files" still results in broad coverage.

The system must compute and store per-file derived artifacts needed by the UI, including but not limited to outline and includes (where applicable) and symbol contributions. These artifacts must be available immediately when the user navigates to a file, without requiring that file to be re-parsed on activation.

D00-00 Performance and responsiveness requirements

Parsing all files can involve hundreds or thousands of files and must not block the main thread long enough to freeze interaction, miss input, or trigger the browser "page unresponsive" watchdog. The implementation must use micro-batching and yielding such that the user can continue to scroll, click, search, and navigate during background parsing.

A practical requirement is that a single synchronous slice of background work must be kept small and bounded. The implementation must schedule work in slices and yield back to the browser between slices. The slice budget must be adjustable using existing constants where possible, and new constants may be introduced in `config.js` only if necessary.

Tree-sitter parsing and derived indexing must be cancelable or supersedable. If the user closes the Tree-sitter window, disables parsing, cancels load, or navigates in a way that invalidates pending work, queued tasks must stop quickly and release pressure on the event loop. The existing presence of state fields like `parseHandle`, `parseHandleType`, `pendingFileId`, `loading`, and `parsing` strongly suggests a cancelable model; the new queue must integrate with that model rather than introducing a second, conflicting scheduler.

E00-00 Scheduling model and queue semantics

The system must maintain an explicit parse queue of fileIds (or file objects) representing work to be done. Enqueue must happen as soon as each file is loaded into the in-memory file list, not when it becomes active.

Queue ordering must favor perceived responsiveness. The default ordering should prioritize smaller files first, because it increases early progress and reduces time-to-first-results for many files. If file sizes are not readily available, ordering by line count or text length is acceptable.

The queue processor must execute in micro-batches. One micro-batch processes a limited number of files and/or a limited amount of wall-clock time, then yields. The existing configuration already includes slice budgets (for example `REFS_BUILD_SLICE_BUDGET`, `SYMBOL_REFS_BUILD_SLICE_BUDGET`, `SEARCH_SLICE_BUDGET`). The implementation should introduce a Tree-sitter parse slice budget that follows the same pattern and naming, for example `TS_PARSE_SLICE_BUDGET` or `TS_PARSE_SLICE_MS_BUDGET`, but only if no existing budget can be reused cleanly.

Yielding mechanism must be browser-friendly. Use `requestIdleCallback` when available to run slices during idle periods, with a fallback to `setTimeout(0)` or `requestAnimationFrame` plus a time cap. The scheduler must avoid long uninterrupted loops even if idle time appears large, because idle estimates can be optimistic.

The processor must ensure at most one Tree-sitter parse is active at a time on the main thread. Parallel parsing on the main thread multiplies blocking risk. If a Web Worker based parser is already present in the repo, it may be used, but this specification does not require a worker refactor. The default is single-threaded micro-batched parsing.

F00-00 Tree-sitter initialization and language loading behavior

Tree-sitter runtime initialization must occur once per session and be reused. Language wasm loading must be lazy per language, cached in the existing `languages` map in Tree-sitter state (`loadTreeSitterState` already provisions keys).

When parsing a file, the system must determine its Tree-sitter language key from extension (or the existing language detection mechanism used elsewhere). If the language is not supported by `TREE_SITTER_LANGUAGES`, skip Tree-sitter parsing but still run safe per-file analysis.

If the Tree-sitter window was previously open or minimized and `wantInit` is true, initialization may start early as today. However, parsing all files must not depend on the Tree-sitter window being open. The parsing pipeline must run in the background as soon as files are loaded, subject to user settings that enable or disable Tree-sitter features.

If Tree-sitter features are disabled by user settings (for example a toggle in the UI, if present), the system must not run Tree-sitter parsing, but it may still run heuristic analysis so that other features remain usable.

G00-00 Per-file analysis phases and what runs when

Phase 1, immediate per-file lightweight analysis: as soon as a file is loaded, the system should compute any lightweight, strictly per-file artifacts that do not require knowledge of other files. This includes extracting file reference candidates from lines (using `extractReferenceCandidates` with the project inventory extension set), counting lines, and computing heuristic symbol occurrences per line where Tree-sitter is unavailable or not yet ready.

Phase 2, Tree-sitter per-file parse and derived per-file artifacts: when Tree-sitter is ready for the file language, parse the file text into a tree, then immediately compute per-file Tree-sitter derived artifacts using existing helpers. This includes `buildOutlineModel(tree, file, lang)`, `buildIncludeList(tree, lang, files)` for C/C++, and `extractTreeSitterSymbolContribution(tree, file, lang, options)`.

Phase 3, cross-file aggregation and indexing: features that depend on having many files available (for example global symbol reference panels, global symbol-to-file maps, counts of referencing files, and any connectivity or "bridge" inference) must not assume that all files are parsed at the time the first files are processed. The system must support incremental aggregation as each file completes Phase 1 or Phase 2, and it must also support a "finalize" step when loading completes to reconcile any partial state.

This design avoids the corner case where early files are parsed and indexed, but later files invalidate or expand the index. Incremental aggregation keeps the UI progressively improving, and finalize ensures correctness once the full project is loaded.

H00-00 Required status and progress reporting

Status reporting must become more informative, concise, and user-controllable. The Tree-sitter UI already has `tsStatus`, and the broader UI has `controlStatus` and `statusBanner`. The system must surface parsing progress in at least one always-visible place (for example `controlStatus` or `statusBanner`) and in the Tree-sitter window (`tsStatus`) with consistent wording.

The status model must include the following fields and update them in real time during background parsing:

1. Total eligible files queued for parsing and analysis.
2. Number completed (Phase 1 done, Phase 2 done if applicable).
3. Number currently in progress and the current file path being processed.
4. Number failed, with a way to view a concise list of failures (file path and error summary).
5. Whether parsing is paused, canceled, or disabled.

The UI text should be of the form "Parsing 37 of 420: src/foo.js" with a short secondary indicator like "Tree-sitter ready" or "Loading grammar: javascript" when applicable. If space allows, include an estimate-free completion ratio (no time remaining estimates required).

The user must have a way to pause or stop background parsing without canceling the entire project load. If a cancel control already exists (for example `cancelLoad`), it may be extended to stop parsing work as well. If a dedicated pause control exists in the Tree-sitter window, it should pause the parse queue and preserve progress.

I00-00 Data model changes (state and caches)

Tree-sitter state must be extended to track per-file parse status across the entire project. Use the existing `cache` and `markers` fields in `loadTreeSitterState` if they are already intended for per-file data; otherwise introduce a new map in the Tree-sitter state, for example `fileStateById`.

Each file entry must have at minimum:

`status`, one of "queued", "parsing", "parsed", "skipped", "error".
`lang`, the determined language key.
`lastParsedVersion`, a cheap fingerprint to avoid re-parsing unchanged content, for example based on text length plus a stable hash of the text, or an existing file content hash if the repo already provides one.
`outline`, `includes`, and `symbolContribution` artifacts if applicable.
`error`, a short error object or string for display.

This state must be persisted only as needed. Window geometry remains persisted via `saveTreeSitterState` as today. Per-file parse results do not need to persist across sessions unless the repo already persists them. The default requirement is in-memory only.

J00-00 Integration points and required controller changes

The controller that currently triggers parsing on active file selection must be refactored so that "file loaded" triggers enqueue. Concretely, locate the module that receives the loaded file list (often a loader or project manager component) and insert an enqueue call for each file at the moment it is added to the in-memory list.

If the loader streams files progressively, enqueue must happen incrementally as each file arrives. If the loader loads all files then sets state once, enqueue must happen immediately after that state is set.

The active-file parsing pathway must be preserved only as a fast-path to display results if background parsing has not completed that file yet. In other words, activation may prioritize that file in the queue, but must not be the primary trigger. If the user navigates to a file that is still queued, the system should move it near the front of the queue and process it in the next slice while still keeping slice budgets.

The parse button `tsParse` must be repurposed. It must no longer mean "parse the active file", and it must no longer be necessary to get parsing started. Its new meaning should be "start or resume background parsing for the project now" or "rebuild parsing artifacts". If background parsing is already running, the button should become a pause/resume toggle or a "rebuild" action, depending on UX preference. This must be documented in the UI copy and implemented in the controller.

K00-00 Error handling requirements

A failure to load a language wasm, initialize Tree-sitter, or parse an individual file must not stop the entire queue. The queue must continue and mark that file as "error". Errors must be summarized in status with a count and optionally shown in a small expandable list in `tsBody` or `logBody` if logs are enabled.

If Tree-sitter runtime initialization fails entirely, the system must fall back to Phase 1 analysis for all files and surface a clear status message that Tree-sitter parsing is unavailable, while keeping the rest of the app responsive.

L00-00 Cross-file indexing and partial-load corner cases

The system must explicitly handle partial knowledge. At any point during load, only some files are parsed and only some symbols are known. Any global symbol reference UI must either reflect partial state ("Indexing in progress") or restrict itself to parsed files until finalize.

A finalize step must occur when file loading completes. "Loading completes" means no more files will be added to the project in this session, or the loader explicitly signals completion. At that point, the system must:

Re-run or complete any aggregation steps that were deferred due to incomplete inventory, such as resolving ambiguous references that depend on full path inventories, recomputing top-N lists, and enforcing caps like `SYMBOL_REFS_MAX_REFERENCE_FILES_SHOWN`.

If the repo already has a concept of "inventory built" for file references (`recordInventoryPath` and `createRefExtensionSet`), finalize must be placed after the inventory is complete so reference resolution uses the full set.

M00-00 Acceptance criteria

When a project with many files is loaded, background parsing begins automatically without requiring the user to activate files or open the Tree-sitter window.

Navigating between files remains responsive during background parsing. The UI must continue to accept input and update views without noticeable freezes.

For a supported language file, once it has been parsed in the background, opening it shows outline/includes/symbol references immediately, without triggering a synchronous parse.

Status displays progress across the entire project with counts and the current file, and clearly indicates completion, pause, or error states.

Canceling or pausing parsing stops additional background work quickly, and resuming continues from the queue without losing completed results.

N00-00 Implementation notes and constraints for Codex

Prefer reusing existing slice-budget patterns already present in `config.js` (for example the existing "slice budget" constants) and existing scheduling constructs already used for search or reference building, if they exist elsewhere in the repo. Introduce new constants only when needed to keep parsing slices bounded.

Avoid introducing any long synchronous loops over all files. Any loop that can touch hundreds of files must be segmented across ticks.

Avoid repeated parsing of unchanged files. Use a per-file fingerprint to skip re-parsing unless the user explicitly requests a rebuild.

Keep the Tree-sitter window UI optional. It can be used for deeper inspection, but background parsing must not depend on that window being open.

If the repo already has a logging toggle (`logToggle`, `logPanel`, `logBody`), consider writing concise parse-queue logs there only when enabled, so normal users are not spammed while power users can inspect progress and failures.
