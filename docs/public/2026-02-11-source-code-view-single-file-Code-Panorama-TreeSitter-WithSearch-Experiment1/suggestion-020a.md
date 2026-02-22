2026-02-21

A00 Code Panorama worker refactor specification

This change exists to protect UI responsiveness while keeping Code Panorama's current behavior intact. The application is a view-only, single-page codebase viewer that loads a folder snapshot into memory, renders every file into one long scrollable page, and progressively enriches the view with search, previews, references, and Tree-sitter derived structure. Today, the heavy part of that enrichment, Tree-sitter WebAssembly parsing and AST traversal, still executes on the main thread, even though the project already time-slices work with requestIdleCallback and setTimeout budgets. On medium and large projects, those slices still contend with scrolling, pointer events, layout, highlighting, and DOM updates, which makes stutter more likely. The objective is to move Tree-sitter runtime initialization, grammar loading, parsing, and AST-derived extraction into a dedicated background worker, while the main thread remains the sole owner of DOM mutation and UI state application.

Success means that, with the worker-enabled build, the user can load and scroll large projects with noticeably fewer frame drops during parsing, while the Tree-sitter window, outline navigation, include listing, marker placement, and symbol reference workflows continue to behave the same as they do today. There must be no build step introduced, and the solution must work unchanged on localhost over HTTP and on GitHub Pages over HTTPS, including the GitHub Pages subpath case.

This repository is a static site with ESM modules and no bundler. The worker must be created as a module worker. All assets must be addressed via URLs that resolve automatically from the current deployment base, without hardcoding hostnames, protocols, or repository paths. The project will not use file protocol. The same output must run on a local dev server and on GitHub Pages.

The main-thread runtime already has a correct approach for this via resolveAssetUrl(path) implemented with new URL(relative, import.meta.url). That pattern becomes the canonical resolver for the worker script and for Tree-sitter runtime and grammar assets. The main thread will compute absolute URLs at runtime and pass those URLs into the worker so the worker never guesses base paths.

B00 Current behavior baseline that must remain stable

The folder and file ingestion pipeline stays on the main thread. In modules/app-runtime.js, readAndStoreFile reads file.text(), builds the record, updates aggregates, renders the file section into the DOM, inserts into the directory tree, runs runImmediateFileAnalysis(record), and then calls enqueueFileForBackgroundParsing(record, "loaded") and maybeInitTreeSitterRuntime(). This two-phase analysis behavior is essential: phase 1 is fast heuristic extraction and reference candidate scanning per line, phase 2 is Tree-sitter parse and AST-derived enrichment. The refactor must preserve that conceptually and preserve the visible UX that heuristic data appears early and Tree-sitter results appear later.

Tree-sitter parsing today happens inside modules/runtime/tree-sitter-controller.js. The queue slice runner selects files, computes a fingerprint (computeFileFingerprint), ensures runtime readiness via dynamic import of web-tree-sitter.js and Parser.init with a wasm locator, loads grammar wasm via Language.load per language, parses full text via parser.parse, then derives outline, include list, and tree-based symbol contribution. After derivation, the controller updates state.treeSitter.cache[file.id] and state.treeSitter.fileStateById[file.id], pushes results into the symbol contribution maps, schedules incremental symbol reference updates, and places markers and refreshes the Tree-sitter panel if the file is active. This state shape and the UI application points must remain compatible, even though the computation is moved out of thread.

The Tree-sitter window UX must remain intact. Opening the Tree-sitter window should trigger readiness and parsing. Closing or minimizing should pause parsing. The Parse button semantics must remain recognizable: it toggles pause, resume, or rebuild depending on the current queue state.

C00 Scope boundaries for this implementation

This pass focuses on moving Tree-sitter runtime initialization, grammar loading, parsing, and AST-derived extraction (outline, includes, tree-based symbol contribution) to a worker. The main-thread queue remains the scheduling authority. DOM updates remain on the main thread.

This pass does not migrate search scans, reference index building, or symbol index rebuilding into the worker, even though those are also CPU-heavy loops. The design should leave room for future worker activities, but the first deliverable is the Tree-sitter parse offload.

This pass does not attempt to transfer Tree-sitter AST objects between threads. The worker returns only serializable derived structures and errors.

D00 Target architecture

Implement a single dedicated analysis worker with an internal dispatcher. The worker owns one Tree-sitter runtime instance (Parser and Language) and maintains a grammar cache by language key. A single worker minimizes duplicated wasm/runtime memory and avoids complexity of sharding tasks across multiple workers without a build system.

The worker must be a module worker created with new Worker(url, { type: "module" }). The worker URL must be produced by resolveAssetUrl("modules/worker/analysis-worker.js") so it resolves correctly on both localhost and GitHub Pages.

The main thread remains responsible for user interactions, scheduling policy, queue semantics, pause/resume/rebuild logic, and all DOM mutation including marker placement, panel rendering, and control bar updates. The main thread remains responsible for mapping include targetPath values to targetFileId values, because that mapping depends on state.files, which we intentionally do not replicate inside the worker.

The worker becomes responsible for Tree-sitter initialization and parsing operations. It loads web-tree-sitter.js and web-tree-sitter.wasm, loads grammar wasm files for languages, parses full text, traverses AST to derive outline and include entries, and computes the tree-based symbol contribution used by the symbol reference pipeline.

URL resolution for static hosting is enforced by having the main thread compute absolute URLs for all Tree-sitter assets and supply them to the worker. The init payload includes tsModuleUrl, tsWasmUrl, and grammarByLang where each grammar URL is resolved using resolveAssetUrl with the same TREE_SITTER_ASSET_BASE and TREE_SITTER_LANGUAGES mapping currently used on the main thread. This eliminates all host and base-path ambiguity inside the worker. The worker uses dynamic import(tsModuleUrl) and passes locateFile: () => tsWasmUrl to Parser.init. Grammar loading uses Language.load(grammarByLang[lang]). No relative string paths are used in the worker.

E00 Protocol and message semantics

Communication between main thread and worker is request/response keyed by an id. Each request carries fileId and a version string derived from the existing computeFileFingerprint logic so the main thread can detect stale responses. Responses may arrive out of order and must never be applied if they do not match the latest requested version for that file.

The protocol supports these types in this pass: init and ts.parse.outlineIncludes. It reserves room for future types (for example ts.extract.identifiers, text.compute.locStats, search.scan), but only init and ts.parse.outlineIncludes are required to ship the core refactor.

The init request includes id, type "init", and payload fields tsModuleUrl, tsWasmUrl, and grammarByLang. The parse request includes id, type "ts.parse.outlineIncludes", fileId, path, language, version, payload.content, and payload.options values derived from SYMBOL_REFS_MIN_IDENTIFIER_LENGTH and SYMBOL_REFS_MIN_BRIDGE_LENGTH.

A success response includes id, ok true, type, fileId, version, result.outline, result.includes, result.symbolRefs, and meta.durationMs plus meta.cachedLanguage. An error response includes id, ok false, type, fileId, version, and an error object with code, message, and details (nullable).

The main thread already has a queue cancellation mechanism via queue.runId. That runId bump must remain the primary correctness guard. In addition, for each file, the controller must store lastRequestedVersion. When a response arrives, it is applied only if the runId matches and lastRequestedVersion equals response.version. Otherwise the response is ignored silently.

Cancellation may be implemented in two layers. The correctness layer is staleness ignoring as described above. The optional performance layer is cooperative cancellation, where the main thread sends a cancel message for a request id and the worker checks cancellation checkpoints during long operations. If cooperative cancel is not implemented in this pass, the system must still behave correctly using staleness ignoring alone.

F00 Worker implementation details

Add modules/worker/analysis-worker.js as the worker entry. Add modules/worker/analysis-bridge.js as the main-thread promise bridge. Optionally add modules/worker/analysis-protocol.js to centralize type strings and error codes, and optionally split handlers under modules/worker/handlers if it improves maintainability in a no-build setup.

The worker maintains a one-time initPromise to ensure initialization is executed once even if multiple requests arrive early. It stores tsModuleUrl, tsWasmUrl, grammarByLang, Parser, Language, a parser instance, and a languageCache map. It may store a canceledRequestIds set if cooperative cancellation is implemented.

On init, the worker dynamically imports the Tree-sitter module from tsModuleUrl, extracts Parser and Language, calls Parser.init with locateFile returning tsWasmUrl, then creates a new Parser instance. If any step fails, the worker returns an error response with a stable code such as TS_INIT_FAILED and a user-facing message suitable for the Tree-sitter panel.

On ts.parse.outlineIncludes, the worker waits for initPromise. It then loads the language grammar. If grammarByLang does not contain the requested language key or Language.load fails, the worker returns GRAMMAR_UNAVAILABLE. Otherwise, it sets the parser language, parses content with parser.parse(content), and then computes outline, includes, and symbolRefs. The worker must return only derived structures. It must not return any Tree-sitter tree nodes or objects. The output must be safe to structured-clone.

Outline derivation must match the current mapping logic in modules/tree-sitter-helpers.js. The worker should replicate the OUTLINE_CONFIGS mapping and the extractNodeName behavior (field-based search, fallback identifier scanning) so that the outline kinds and names appear the same as today for supported languages. Outline items must include kind, name, line (1-based), fileId, and anchorId. Anchor ids must follow the existing pattern `${fileId}-ts-${kind}-${idx}` to preserve marker placement and scroll-to-marker behavior without additional translation.

Include extraction must match the current logic in buildIncludeList for C and C++ in modules/tree-sitter-helpers.js, but it must avoid any dependency on the full files array. The worker should return includes as objects containing raw and targetPath, where targetPath is extracted using the same regex. The main thread will resolve targetFileId by scanning state.files for endsWith matches and by applying the same quoted-include rule (only quoted includes produce cross-file navigation).

The worker must compute the tree-based symbol contribution currently produced by extractTreeSitterSymbolContribution in modules/symbol-references.js. The returned shape must be compatible with the current main-thread consumption pattern in tree-sitter-controller.js, where the result is stored in ts.cache[file.id].symbolRefs, assigned to fileState.symbolContribution, normalized via createNormalizedSymbolContribution(file, symbolRefs, "tree"), stored in state.symbolRefs.contributions.treeByFile, and then used to refresh effective contributions and schedule incremental symbol reference updates.

If the existing extractTreeSitterSymbolContribution function cannot be imported directly into the worker due to incompatible imports, the implementation should be refactored by extracting a worker-safe, pure module that contains only the AST traversal and shaping logic, and then importing that module from both the worker and the main thread. The no-build constraint means this refactor must keep import paths simple and must not introduce bundling assumptions.

If full parity is risky in one step, the worker must still return a structure that preserves the fields actually used by downstream indexing. The minimal acceptable content is that definitions and references are produced with correct identifier text and line numbers, and with any additional location data required by the symbol controller. If downstream code breaks, the worker output is not acceptable and must be adjusted until symbol reference workflows behave as before.

G00 Main-thread bridge and integration changes

The bridge owns the Worker instance and exposes request and ensureReady. request allocates a unique id, posts the message, and returns a Promise that resolves or rejects when the correlated response arrives. ensureReady sends init once and caches the resulting Promise so that parse requests cannot race initialization.

The bridge maintains an inflight map of id to Promise handlers and request metadata (type, createdAt). It attaches worker.onmessage to resolve inflight entries. Errors must surface with stable objects so the Tree-sitter controller can set ts.error and ts.progress.tsUnavailable consistently.

A request timeout may be added as a protective measure. If added, it should be configurable via modules/config.js. A timeout should reject the promise and should allow subsequent requests to proceed. Timeouts must not break the queue state machine; they should be handled as file-level parse errors similar to existing behavior.

In modules/app-runtime.js, create the worker at runtime initialization time, not per file. The worker script URL must be computed with resolveAssetUrl("modules/worker/analysis-worker.js"). The worker must be created as a module worker.

In the same place, compute init payload URLs using resolveAssetUrl and the existing TREE_SITTER_ASSET_BASE and TREE_SITTER_LANGUAGES. The init payload must include tsModuleUrl pointing to web-tree-sitter.js, tsWasmUrl pointing to web-tree-sitter.wasm, and grammarByLang mapping each language key to its grammar wasm URL derived from TREE_SITTER_LANGUAGES[kind].file.

Pass the bridge instance into createTreeSitterController via the ctx object, for example ctx.analysisBridge. The tree-sitter controller must become the only consumer of the bridge for parsing.

The resetStateForLoad path must remain correct. Today it cancels pending parse, clears queue handles, resets caches, markers, errors, and progress. With a worker, reset should also ensure that any pending results are ignored by staleness checks. Terminating the worker on reset is optional. Keeping the worker alive across loads is preferred for performance, because it avoids reinitializing wasm. If a terminate path is added, it must be safe and must not leak inflight promises.

In modules/runtime/tree-sitter-controller.js, add analysisBridge to ctx and store it in the controller closure. The controller remains responsible for queue semantics and for updating state fields and UI.

Replace the current maybeInitTreeSitterRuntime behavior. The main thread must no longer dynamic-import web-tree-sitter.js nor call Parser.init directly. Instead, maybeInitTreeSitterRuntime should set ts.loading and ts.wantInit as it does today for UI status, then call analysisBridge.ensureReady and translate outcomes into the same state flags. On success, set ts.ready true, ts.progress.tsUnavailable false, and clear ts.error. On failure, set ts.progress.tsUnavailable true, set ts.error to a user-friendly message, pushTreeSitterError("(runtime)", message), addLog("tree-sitter", message), and keep the panel behavior consistent with "Tree-sitter unavailable".

Replace runTreeSitterParseForFile. The new logic must compute lang via getTreeSitterLanguage(file) and fingerprint via computeFileFingerprint(file). If unsupported lang or Tree-sitter is disabled, it must mark skipped and phase2Done true and lastParsedVersion = fingerprint, matching current semantics. It must ensure worker readiness by awaiting maybeInitTreeSitterRuntime (which now awaits ensureReady). If unavailable, it must mark skipped as today. It must record fileState.lastRequestedVersion = fingerprint before issuing the request. It must issue a worker request of type ts.parse.outlineIncludes with fileId, path, language, version: fingerprint, content: file.textFull || file.text || "", and options based on SYMBOL_REFS_MIN_IDENTIFIER_LENGTH and SYMBOL_REFS_MIN_BRIDGE_LENGTH. After awaiting, it must ignore the response if runId changed or if fileState.lastRequestedVersion no longer matches the fingerprint. It must map includes to add targetFileId by searching state.files for endsWith targetPath when the raw include uses quotes, matching current behavior. It must update ts.cache[file.id] with outline, includes, parsedAt, and symbolRefs. It must update fileState.status, phase2Done, lastParsedVersion, outline, includes, and symbolContribution exactly as today. It must normalize symbol contribution and update state.symbolRefs.contributions.treeByFile, then refreshEffectiveSymbolContribution(file.id) and scheduleSymbolReferenceIncrementalUpdate(file.id) exactly as today. If the file is the active file, it must call placeTreeSitterMarkers(file, outline) exactly as today. It must refresh progress and schedule status refresh.

Preserve queue slicing behavior. scheduleTreeSitterQueueSlice and runTreeSitterQueueSlice should remain intact conceptually. For the first pass, keep concurrency at one in-flight parse per queue slice iteration by awaiting each worker request before proceeding, mirroring the current parse step which is also synchronous-heavy. This minimizes behavioral drift. If a future optimization increases concurrency, it must add explicit inflight caps and careful progress accounting.

Preserve the Tree-sitter window controls and button semantics. openTreeSitterWindow should still request init and resume queue. Minimize and close should pause the queue. Restore should resume. The panel status text should remain consistent with getTreeSitterQueueStatusText.

Preserve marker and navigation behavior. Marker anchors must remain stable. scrollToOutlineItem must continue to prefer marker anchors when available. If markers do not exist yet, it must fall back to scrollToFileLine, as it does today.

Add a per-file field for lastRequestedVersion to the Tree-sitter fileState entries created by ensureTreeSitterFileState. This field is separate from lastParsedVersion. lastParsedVersion represents the version that is currently applied to caches, while lastRequestedVersion tracks the latest request sent to the worker so stale results can be ignored.

Keep existing state fields and progress counters intact: ts.cache, ts.markers, ts.fileStateById, ts.errors, ts.progress, queue.runId, queue.pendingIds, queue.pendingSet. The worker refactor must not force redesign of those structures.

H00 Error handling, performance considerations, acceptance criteria, and rollout

If the worker fails to initialize Tree-sitter, the UI must behave as Tree-sitter unavailable, consistent with current logic that sets ts.progress.tsUnavailable and shows a status line indicating lightweight analysis only. The error must be logged via addLog("tree-sitter", ...) and also appended to ts.errors with pushTreeSitterError("(runtime)", ...).

If the worker cannot load a grammar for a requested language, the file must be marked as error for phase 2, and the error must appear in the Tree-sitter error summary, just as it does today when Language.load fails. This must not crash the queue; it must move on to the next file and continue.

If parsing fails for a file, record a file-level error, pushTreeSitterError(file.path, ...), addLog(file.path, ...), mark phase2Done true, and continue. The rest of the queue must remain functional.

Stale responses are not errors. They are ignored. This is especially important during pause, rebuild, or load cancellation, where prior requests might still complete in the background. Ignoring stale responses must be sufficient to keep state consistent.

The parse request sends the full file text to the worker, which uses structured cloning. For very large files, this may have non-trivial overhead. In this pass, accept this cost because the primary win is removing parsing CPU from the main thread. The architecture should keep the door open to transferables or shared memory patterns in the future, but those are not required now. The main thread should continue to respect existing file-size limits already enforced by settings.maxFileSize. The worker must not attempt to fetch file content itself, and it must assume content is present in the request.

Functional acceptance means that folder load works (directory picker and file picker), files render as a single scroll view with gutters and actions, tree navigation and TOC behave the same, the Tree-sitter window open/close/minimize/restore behaves the same, the parse queue can be paused, resumed, and rebuilt using the existing button semantics, outline entries appear and navigate correctly, include entries appear and open the referenced file when resolvable, markers appear for the active file once outline is available, and symbol reference workflows continue to operate using tree-based contributions.

Performance acceptance means the main thread no longer performs Tree-sitter initialization, grammar loading, or parsing work, and scrolling and interaction remain visibly smoother during background parsing on representative projects.

Deployment acceptance means the identical build runs on localhost and GitHub Pages without configuration. Worker script and wasm assets must resolve via resolveAssetUrl and must not require hardcoded base paths.

Implement the worker and the bridge first, keeping them isolated and testable by manually sending an init and a parse request from the console if needed. Wire the bridge into app-runtime.js and pass it into the Tree-sitter controller. Ensure the worker initializes successfully in both localhost and GitHub Pages deployments. Modify tree-sitter-controller.js to route maybeInitTreeSitterRuntime and runTreeSitterParseForFile through the bridge, while keeping queue and UI logic unchanged. Achieve parity for outline and includes early, because those are immediately visible in the Tree-sitter panel and markers. Then focus on symbolRefs parity, because it affects downstream indexing and reference panels. Validate rebuild, pause, resume, active-file prioritization, and cancellation scenarios to ensure staleness handling is correct and no stale response corrupts state.

I00 Future extensions (not part of this deliverable)

After the Tree-sitter parse offload is stable, consider migrating other heavy loops to the same worker using the same protocol: LOC and line-offset computations for very large files, reference index building, symbol baseline and rebuild, and search scans. Those migrations should be incremental, each with clear parity checks, and should keep DOM updates on the main thread.

If throughput becomes a problem, consider limited parallelism within a single worker by allowing multiple in-flight requests and controlling memory usage, or consider a worker pool only if memory duplication and grammar cache locality are addressed. This is not required for the first pass.
