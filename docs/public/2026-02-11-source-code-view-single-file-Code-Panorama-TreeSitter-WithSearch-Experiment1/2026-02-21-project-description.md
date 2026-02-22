# Code Panorama Technical Handoff (Current State + Worker Refactor Plan)

Repository: `/mnt/c/Home/my-github/toys-awwtools-com/docs/public/2026-02-11-source-code-view-single-file-Code-Panorama-TreeSitter-WithSearch-Experiment1`

This document is a technical handoff for engineers who need to understand the current implementation and then write a formal specification. It focuses on concrete implementation details with file/function references.

## H01 What this project does

Code Panorama is a browser-based, single-page codebase viewer. It loads a local folder (or fallback file selection), reads allowed source files into memory, and renders files in one long scrollable page with:

- Project tree navigation.
- File table of contents.
- In-project search.
- Hover preview panel.
- Tree-sitter based outline/includes/symbol extraction for supported languages.
- File-reference and symbol-reference side workflows.

Product-level evidence:

- `readme.md:3` describes it as a "single-page, in-browser code viewer".
- `readme.md:15`, `readme.md:17`, `readme.md:18` describe folder loading, search, and preview features.
- `readme.md:34` describes scan/filter/load/render flow over a loaded in-memory snapshot.

UI entrypoint and runtime bootstrap:

- `index.html:305` loads module entry `app.js`.
- `app.js:24` `bootstrap()` builds app context and calls runtime init.
- `app.js:29` starts bootstrap on `DOMContentLoaded`.
- `modules/app-runtime.js:2044` exports `initAppRuntime(deps)` and initializes controllers once.

Primary user interaction path:

1. User clicks open-folder or fallback picker in `index.html` controls (`index.html:24`, `index.html:25`).
2. Runtime load functions read files and build per-file records.
3. Files are rendered into the single-page viewer with line gutters and code blocks.
4. Background parse/index/search operations progressively enrich the UI.

## H02 Architecture and module layout (current)

### Entry and shell

- `index.html`
  - Declares all static UI regions: control bar, TOC/search panels, file container, tree-sitter panel, settings/stats/log/support panels.
  - Tree-sitter controls: `#tree-button`, `#ts-parse`, `#ts-window` (`index.html:32`, `index.html:173`).
  - Main content host: `#file-container` (`index.html:161`).
- `styles.css`
  - Visual layout and behavior styling.
- `app.js`
  - Minimal bootstrap and runtime handoff.

### Runtime composition root

- `modules/app-runtime.js`
  - Global in-memory state.
  - Controller wiring in `initRuntimeControllers()` (`modules/app-runtime.js:264`).
  - Loading/scanning pipeline and major UI orchestration.
  - Hooks controllers together via callback contracts.

Controller creation is centralized in `modules/app-runtime.js`:

- TOC: `createTocController` (`modules/app-runtime.js:265`, `modules/runtime/toc-controller.js:12`).
- Search: `createSearchController` (`modules/app-runtime.js:298`, `modules/runtime/search-controller.js:17`).
- Preview: `createPreviewController` (`modules/app-runtime.js:318`, `modules/runtime/preview-controller.js:16`).
- Symbol refs: `createSymbolController` (`modules/app-runtime.js:349`, `modules/runtime/symbol-controller.js:6`).
- File refs: `createReferencesController` (`modules/app-runtime.js:389`, `modules/runtime/references-controller.js:1`).
- Tree-sitter: `createTreeSitterController` (`modules/app-runtime.js:424`, `modules/runtime/tree-sitter-controller.js:6`).
- Panels: `createPanelsController` (`modules/app-runtime.js:489`, `modules/runtime/panels-controller.js:13`).

### State shape and defaults

- `modules/config.js`
  - Feature flags and budgets.
  - Parse/index/search slice budgets:
    - `SEARCH_SLICE_BUDGET` (`modules/config.js:63`)
    - `REFS_BUILD_SLICE_BUDGET` (`modules/config.js:83`)
    - `SYMBOL_REFS_BUILD_SLICE_BUDGET` (`modules/config.js:87`)
    - `TS_PARSE_SLICE_BUDGET` (`modules/config.js:96`)
    - `TS_PARSE_FILES_PER_SLICE` (`modules/config.js:97`)
  - Tree-sitter asset base and language grammar files:
    - `TREE_SITTER_ASSET_BASE` (`modules/config.js:60`)
    - `TREE_SITTER_LANGUAGES` (`modules/config.js:100`)
- `modules/runtime/runtime-context.js`
  - Factory/normalization helpers for queue and index state:
    - `createInitialRefsState` (`modules/runtime/runtime-context.js:10`)
    - `createInitialSymbolRefsState` (`modules/runtime/runtime-context.js:35`)
    - `createInitialTreeSitterQueueState` (`modules/runtime/runtime-context.js:85`)
    - `createInitialTreeSitterProgressState` (`modules/runtime/runtime-context.js:100`)
    - `normalizeTreeSitterRuntimeState` (`modules/runtime/runtime-context.js:145`)

### Parsing-related modules

- `modules/runtime/tree-sitter-controller.js`
  - Runtime init, grammar loading, parse queue scheduling, parse execution, panel/marker rendering.
- `modules/tree-sitter-helpers.js`
  - AST-to-outline and include extraction:
    - `buildOutlineModel` (`modules/tree-sitter-helpers.js:156`)
    - `buildIncludeList` (`modules/tree-sitter-helpers.js:180`)
- `modules/symbol-references.js`
  - Heuristic and tree-sitter identifier/symbol extraction:
    - `extractHeuristicSymbolsFromLine` (`modules/symbol-references.js:295`)
    - `extractTreeSitterSymbolContribution` (`modules/symbol-references.js:446`)

### UI update points for parse outputs

- `modules/runtime/tree-sitter-controller.js`
  - Marker injection into code DOM: `placeTreeSitterMarkers` (`modules/runtime/tree-sitter-controller.js:1029`).
  - Tree-sitter panel rendering: `renderTreeSitterPanel` (`modules/runtime/tree-sitter-controller.js:1069`).
  - Active-file parse prioritization and panel refresh: `handleActiveFileChange` (`modules/runtime/tree-sitter-controller.js` around line 963+).

### Existing worker/messaging usage

- No current worker bridge exists.
- Search found no `new Worker`, `Worker(`, `navigator.serviceWorker`, or `importScripts` in `app.js`, `index.html`, or `modules/`.
- Current implementation uses main-thread time slicing (`setTimeout`, `requestIdleCallback`) rather than background threads.

## H03 How parsing works today (main thread)

### Trigger to parse call chain

Main call chain from load to parse:

1. Load starts from folder/file UI actions in `modules/app-runtime.js` (`pickFolder`, `loadFromDirectoryHandle`, `traverseDirectory`).
2. Each accepted file is read in `readAndStoreFile()` (`modules/app-runtime.js:1007`).
3. `readAndStoreFile()` immediately does:
   - `runImmediateFileAnalysis(record)` (`modules/app-runtime.js:1059`)
   - `enqueueFileForBackgroundParsing(record, "loaded")` (`modules/app-runtime.js:1060`)
   - `maybeInitTreeSitterRuntime()` (`modules/app-runtime.js:1062`)
4. Queue scheduler in tree controller:
   - `enqueueFileForBackgroundParsing` -> `scheduleTreeSitterQueueSlice` (`modules/runtime/tree-sitter-controller.js:703`, `:739`)
   - Slice runner `runTreeSitterQueueSlice` (`modules/runtime/tree-sitter-controller.js:773`)
   - Per-file parse `runTreeSitterParseForFile` (`modules/runtime/tree-sitter-controller.js:825`)
5. Actual parse invocation:
   - `ts.parser.parse(file.textFull || file.text || "")` (`modules/runtime/tree-sitter-controller.js:868`)
6. Post-parse extraction:
   - `buildOutlineModel` (`modules/runtime/tree-sitter-controller.js:869`)
   - `buildIncludeList` (`modules/runtime/tree-sitter-controller.js:870`)
   - `extractTreeSitterSymbolContribution` (`modules/runtime/tree-sitter-controller.js:871`)
7. UI application:
   - Cache update to `state.treeSitter.cache[file.id]` (`modules/runtime/tree-sitter-controller.js:875`)
   - Update symbol contribution maps and schedule symbol incremental update (`modules/runtime/tree-sitter-controller.js:893`, `:895`)
   - Marker placement if active file (`modules/runtime/tree-sitter-controller.js:896`)
   - Panel rendering/status refresh (`modules/runtime/tree-sitter-controller.js:1069`, plus debounced status refresh path).

### Runtime and grammar initialization path

- Tree-sitter runtime lazy init:
  - `maybeInitTreeSitterRuntime()` (`modules/runtime/tree-sitter-controller.js:283`)
  - Dynamic import of `web-tree-sitter.js` (`modules/runtime/tree-sitter-controller.js:291`)
  - `Parser.init(...)` with wasm locator (`modules/runtime/tree-sitter-controller.js:295`)
- Per-language grammar load:
  - `loadTreeSitterLanguage(kind)` (`modules/runtime/tree-sitter-controller.js:320`)
  - `Language.load(...)` from `lib/web-tree-sitter-v0.26.3/*.wasm` (`modules/runtime/tree-sitter-controller.js:327`)

### Parse trigger variants

- Continuous queue after load via file ingestion.
- Manual parse control via `#ts-parse` click handler in `modules/app-runtime.js:1990`:
  - If currently running -> pause queue.
  - If paused/pending -> resume queue.
  - Else -> rebuild queue.
- Active file change path:
  - `setActiveFile()` -> `handleActiveFileChange()` (`modules/app-runtime.js:1416`, `:1428`)
  - Tree controller prioritizes active file in queue (`modules/runtime/tree-sitter-controller.js:965` + `prioritizeFileInParseQueue` at `:713`).

### Data flow (inputs and outputs)

Inputs into parse stage:

- File text: `file.textFull || file.text`.
- File metadata: `id`, `path`, `lineCount`, `charCount`.
- Language key from extension logic in `getTreeSitterLanguage(file)` (`modules/runtime/tree-sitter-controller.js:990`).
- Context options for symbol extraction (`minLength`, `minBridgeLength`).

Outputs from parse stage:

- Outline items (kind, name, line, fileId, anchorId).
- Include list for C/C++ (raw include, target path, resolved file id).
- Symbol contribution (definitions/references with positions/kinds).
- Parse status/progress and per-file state (`status`, `phase2Done`, `lastParsedVersion`, `error`).
- UI markers and panel content.

### Caching, debouncing, batching

Current controls to reduce blocking (still main-thread):

- Queue slice by time budget + files-per-slice:
  - `TS_PARSE_SLICE_BUDGET`, `TS_PARSE_FILES_PER_SLICE`.
- Idle scheduling when available:
  - `requestIdleCallback` fallback to `setTimeout` (`modules/runtime/tree-sitter-controller.js:755`, `:757`).
- Debounced status rendering:
  - `scheduleTreeSitterStatusRefresh()` (`modules/runtime/tree-sitter-controller.js:410`).
- Fingerprint-based skip:
  - `computeFileFingerprint(file)` (`modules/runtime/tree-sitter-controller.js:565`)
  - skip reparse when unchanged (`modules/runtime/tree-sitter-controller.js:660` logic block).
- Queue dedupe and prioritization:
  - `pendingSet` and `prioritizeFileInParseQueue`.

Important limitation:

- Tree-sitter incremental parsing with prior tree is not used today; each parse is full-text parse on main thread.

## H04 Performance pain points and resource-consuming activities

The project already slices work to preserve responsiveness, but expensive operations still execute in the main JS thread and can contend with scroll/input/render.

### Activity: Tree-sitter parse in main thread

- Current location: `modules/runtime/tree-sitter-controller.js:825` (`runTreeSitterParseForFile`) and parse call at `:868`.
- Inputs: full file text, language grammar, file metadata.
- Outputs: AST-derived outline/includes/symbol contribution.
- Why expensive:
  - full parse for each queued file,
  - grammar switching and AST creation per file,
  - runs in same thread as DOM paint and event handling.
- Offload plan:
  - move parse and AST traversal to worker activity `ts.parse.outlineIncludes`.

### Activity: Identifier/symbol extraction using tree-sitter

- Current location:
  - Extractor implementation in `modules/symbol-references.js:446`.
  - Invocation in parse path `modules/runtime/tree-sitter-controller.js:871`.
- Inputs: parse tree, language id, symbol thresholds.
- Outputs: symbol contribution object (definitions/references).
- Why expensive:
  - `descendantsOfType` over large ASTs,
  - per-file repeated traversal,
  - contributes to symbol indexing chain.
- Offload plan:
  - separate worker activity `ts.extract.identifiers` with dedicated response shape, even if parse tree can be shared internally in worker.

### Activity: LOC and line-offset stats

- Current location:
  - `countLinesFromText` in `modules/line-index.js:4`
  - `buildLineStartOffsets` in `modules/line-index.js:16`
  - executed during load in `modules/app-runtime.js:1007` path.
- Inputs: raw file text.
- Outputs: `lineCount`, line start offsets.
- Why expensive:
  - linear scan over every loaded character for every file.
  - performed during ingestion where UI is also updating progress and rendering sections.
- Offload plan:
  - worker activity `text.compute.locStats` returns `{ lineCount, offsets? }`.
  - optional payload option to return offsets only for currently visible/opened files to reduce transfer size.

### Activity: Additional heavy analysis (current and near-term)

- Symbol index rebuild and baseline scanning:
  - `runSymbolBaselineSlice` (`modules/runtime/symbol-controller.js:500`)
  - `runSymbolIndexRebuildSlice` (`modules/runtime/symbol-controller.js:362`)
  - large loops over files, lines, and occurrence maps.
- File-reference index build:
  - `runReferenceIndexSlice` (`modules/runtime/references-controller.js:544`)
  - line-by-line candidate extraction and path resolution.
- Search scans:
  - `runSearchSlice` (`modules/runtime/search-controller.js:254`)
  - line scanning and matcher execution across selected files.

These are currently sliced with `setTimeout`, but still compete on main thread. They are candidates for later worker migration after core parse offload.

## H05 Proposed worker-based architecture

### Chosen model

Use one dedicated analysis worker with a dispatcher for multiple activities.

Rationale for this project:

- Tree-sitter runtime and grammars are heavy; one worker avoids duplicate wasm/parser state across multiple workers.
- Project currently uses one-page global state in `app-runtime.js`, so one bridge simplifies adoption.
- Extensible activity routing still allows clean separation by handler.

### Separation of concerns

Main thread responsibilities:

- UI events and DOM mutation only.
- Queue intent and scheduling policy.
- Request correlation, stale-response filtering, and cancellation control.
- State updates (`state.treeSitter.cache`, symbol maps, progress text).

Worker responsibilities:

- Initialize tree-sitter runtime and load grammars.
- Parse code and run AST traversals.
- Compute identifiers/symbol contributions.
- Compute LOC/line stats.
- Return serializable result objects and structured errors.

### Message bridge contract

Request shape:

```json
{
  "id": "req-000123",
  "type": "ts.parse.outlineIncludes",
  "fileId": "file-src-main-c-abc123",
  "path": "src/main.c",
  "language": "c",
  "version": "12345:678:hash",
  "payload": {
    "content": "file text...",
    "options": {
      "minLength": 2,
      "minBridgeLength": 3,
      "includeOffsets": false
    }
  }
}
```

Success response shape:

```json
{
  "id": "req-000123",
  "ok": true,
  "type": "ts.parse.outlineIncludes",
  "fileId": "file-src-main-c-abc123",
  "version": "12345:678:hash",
  "result": {
    "outline": [],
    "includes": [],
    "symbolRefs": {}
  },
  "meta": {
    "durationMs": 12,
    "cachedLanguage": true
  }
}
```

Error response shape:

```json
{
  "id": "req-000123",
  "ok": false,
  "type": "ts.parse.outlineIncludes",
  "fileId": "file-src-main-c-abc123",
  "version": "12345:678:hash",
  "error": {
    "code": "GRAMMAR_UNAVAILABLE",
    "message": "Grammar unavailable: c",
    "details": null
  }
}
```

Cancellation message:

```json
{
  "id": "req-000123",
  "type": "cancel"
}
```

### Lifecycle semantics

- Correlation: `id` always required; main thread promise map resolves/rejects by id.
- Ordering: responses may be out of order; apply only if `fileId + version` matches latest known request version.
- Staleness: if user triggers rebuild/pause/new load, old responses are ignored.
- Cancellation:
  - main thread marks pending request canceled immediately and rejects local promise.
  - sends `cancel` message to worker for cooperative abort.
  - for long loops, worker checks cancellation token checkpoints.

### Activity types and handler boundaries

Core activities for first migration:

- `ts.parse.outlineIncludes`
  - Returns outline/includes/tree symbol contribution together.
- `ts.extract.identifiers`
  - Dedicated identifier extraction response shape for symbol pipeline decoupling.
- `text.compute.locStats`
  - Returns `lineCount` and optionally offsets/derived metrics.

Future activity slots:

- `refs.buildCandidates`
- `symbol.index.rebuild`
- `search.scan`

## H06 Implementation details and code locations (new)

This repository currently has no worker implementation. The following is the concrete integration plan and exact integration points.

### Planned new files

- `modules/worker/analysis-worker.js`
  - Worker entry, dispatcher, tree-sitter runtime/language cache, request routing.
- `modules/worker/analysis-protocol.js`
  - Message type constants and validators.
- `modules/worker/analysis-bridge.js`
  - Main-thread bridge API (`request`, `cancel`, `terminate`), in-flight map, timeout handling.
- `modules/worker/handlers/ts-parse-handler.js`
  - Parse + outline + includes handler.
- `modules/worker/handlers/ts-identifiers-handler.js`
  - Identifier extraction handler.
- `modules/worker/handlers/text-stats-handler.js`
  - LOC/stats computation handler.

### Planned updates to existing files

- `modules/app-runtime.js`
  - Create/destroy bridge during runtime init/reset.
  - Pass bridge methods into tree-sitter controller.
- `modules/runtime/tree-sitter-controller.js`
  - Replace direct `Parser.init`, `Language.load`, and `ts.parser.parse(...)` calls with bridge requests.
  - Keep queue semantics (`pause/resume/rebuild/prioritize`) but execute parse tasks asynchronously via worker.
  - Maintain existing UI/status behavior and cache shapes.
- `modules/runtime/runtime-context.js`
  - Add worker-state container for request tracking and per-file latest-version bookkeeping.
- `modules/config.js`
  - Add worker tuning constants (request timeout, payload threshold, max in-flight, optional transfer threshold).

### New call chain after migration

1. File load/active-file event in `modules/app-runtime.js` still calls `enqueueFileForBackgroundParsing`.
2. Queue in `modules/runtime/tree-sitter-controller.js` picks file and computes `version` fingerprint.
3. Controller sends bridge request `ts.parse.outlineIncludes` with text + metadata.
4. Worker parses and returns serializable result.
5. Controller verifies staleness and writes:
   - `state.treeSitter.cache[file.id]`
   - `state.treeSitter.fileStateById[file.id]`
   - `state.symbolRefs.contributions.treeByFile`
6. Controller calls existing UI integration:
   - `refreshEffectiveSymbolContribution`
   - `scheduleSymbolReferenceIncrementalUpdate`
   - `placeTreeSitterMarkers` (active file)
   - `renderTreeSitterPanel`

### Limitations and follow-ups

- This handoff pass does not modify source code; it documents a complete migration design.
- Current build setup is script-module static hosting; worker URL creation should use module-worker syntax that works under the same static path layout.
- If tree-sitter wasm load path differs in worker context, the bridge must pass asset-base and use `new URL(..., self.location.href)` inside worker.

## H07 Options and alternate approaches

### Option A: Single worker with dispatcher (recommended for this codebase)

Pros:

- One tree-sitter runtime and grammar cache.
- Lower memory duplication.
- Minimal integration complexity with current monolithic runtime state.

Cons:

- One worker can become a bottleneck under very large multi-file workloads.

### Option B: Multiple workers by activity

Pros:

- Isolation between parse/stats/index workloads.
- Fault containment by activity.

Cons:

- Duplicate runtime or duplicated parser state.
- More complex cancellation, routing, and lifecycle management.

### Option C: Worker pool (N workers)

Pros:

- Better throughput for large codebases with many files.
- Parallel batch processing.

Cons:

- Requires scheduler, sharding, and task-affinity policy.
- Harder to preserve language-cache locality and deterministic progress UX.

### Option D: Hybrid model (lightweight main-thread + heavy worker)

Pros:

- Immediate UX hints from cheap local heuristics.
- Worker handles full parse/index asynchronously.

Cons:

- Dual-path complexity; risk of inconsistent intermediate states.

Current code already has a hybrid tendency (`runImmediateFileAnalysis` heuristic + later tree parse), so this can be retained while moving heavy steps to worker.

### Serialization alternatives

- Return only derived structures (outline/includes/symbol refs) and avoid transferring AST objects.
- For very large texts, optional transferable `ArrayBuffer` path can reduce clone overhead.
- Keep response payloads shape-stable for UI code to minimize coupling.

## Resource-consuming activities summary and offload mapping

Tree-sitter parse in `modules/runtime/tree-sitter-controller.js` should move to `ts.parse.outlineIncludes` worker handler. Identifier extraction currently in `modules/symbol-references.js` and called from parse flow should move to `ts.extract.identifiers` as a distinct activity contract. LOC and line-index calculations from `modules/line-index.js` currently invoked in `modules/app-runtime.js:readAndStoreFile` should move to `text.compute.locStats`, at minimum for large-file thresholds. Symbol index rebuild in `modules/runtime/symbol-controller.js`, reference index in `modules/runtime/references-controller.js`, and search scans in `modules/runtime/search-controller.js` are additional high-cost loops that should be progressively migrated to worker activities after core parse offload is stable.

## Current implementation evidence checklist

- App starts at `index.html:305` -> `app.js` bootstrap -> `modules/app-runtime.js:initAppRuntime`.
- Main-thread parse invocation at `modules/runtime/tree-sitter-controller.js:868`.
- Parse outputs created by:
  - `modules/tree-sitter-helpers.js:156`
  - `modules/tree-sitter-helpers.js:180`
  - `modules/symbol-references.js:446`
- Parse results applied to UI in:
  - `modules/runtime/tree-sitter-controller.js:1029`
  - `modules/runtime/tree-sitter-controller.js:1069`
- No existing worker bridge implementation in app/runtime modules.

