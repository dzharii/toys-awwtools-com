2026-02-11

A00 r00. Problem, purpose, and user value

The project already provides a panoramic, scrollable view of many source files at once, plus a directory tree, a table-of-contents list, a hover preview window, a search panel, and a Tree-sitter window that can parse the active file and show an outline and include list. The missing capability is project-wide understanding of identifier usage. Users can see a function definition, a constant, a macro, a class, or a configuration key in one file, but they do not have a fast, low-friction way to answer: "where is this referenced", "what depends on this", and "where does this value originate". They can use text search, but that forces a mode switch, produces noisy matches, and loses semantic focus because it does not distinguish symbol usage from incidental text.

This feature adds identifier reference intelligence across the loaded project. After load completes, the app builds a lightweight, project-wide index of named identifiers and their occurrences. When the user clicks an identifier in the code view, a focused reference panel appears and answers two questions deterministically: where the identifier is defined (when known), and where it is used (references). The panel provides counts, top call sites, and direct navigation to specific lines without requiring the user to open the search panel or leave the current reading flow.

The user experience must remain calm. The app already contains several panels and windows; adding another heavy visual layer would feel intrusive and would degrade reading. This feature therefore uses a strict interaction rule: it is click-first, not hover-first. It avoids aggressive inline decorations, avoids continuously moving overlays, and avoids any behavior that steals focus while the user is scrolling. It also respects the fact that Tree-sitter parsing is currently per-file and sometimes on-demand; the feature must degrade gracefully when parsers are unavailable or files are too large, and it must never block load, scroll, or navigation.

B00 r00. Core concepts and mental model

The system introduces a project-wide symbol index built from two complementary sources. First is Tree-sitter for languages where a grammar is available and enabled. Tree-sitter provides higher-precision information about definitions and references within a file, including node types and positions. Second is a conservative, language-agnostic heuristic pass that detects identifier-like tokens in files that are not Tree-sitter-parsed or not supported by Tree-sitter. The heuristic pass exists to support cross-language workflows, such as a constant defined in one language and reused in scripts, configuration, or build files.

A symbol in this specification means a named identifier that appears in file text and is likely intended to be referenced elsewhere. Symbols include function names, method names, class names, type names, enum values, macro names, and selected configuration keys. A definition is the location in a file where the symbol is introduced (for example function declaration, class declaration, macro definition). A reference is a use site (for example an identifier token in an expression, a call, an import of a name, or a config key occurrence). The system does not attempt full semantic resolution across languages; it focuses on a stable, useful approximation: a consistent mapping from symbol name to occurrences, with optional definition locations when the parser can reliably determine them.

The user perceives the feature as a "What uses this" capability available from the code view itself. The mental model is: click a name, see a panel with usage counts and jump links, optionally see a best-effort definition link, and close the panel when done. Search remains available for full-text exploration, but the reference panel is the default tool for identifier-level navigation.

C00 r00. In scope and out of scope

In scope is a project-wide index of identifier occurrences across the loaded text files, integrating Tree-sitter when available and falling back to heuristics otherwise. In scope is a UI interaction that lets the user request references for an identifier by clicking it, and a panel that lists references with navigation by file and line. In scope is a small set of deterministic rules for extracting candidate symbols and grouping occurrences, including cross-language config-key style references.

In scope is reactive index evolution as new Tree-sitter parses become available on-demand. When a file is parsed later (because the user opened it or explicitly triggered parsing), the index must incorporate the improved information and update queries and UI results without requiring a full rebuild.

Out of scope is full semantic resolution comparable to a language server, including type inference, overload resolution, scope-aware name binding across modules, or build-system-aware include paths beyond the existing simple include mapping. Out of scope is automatic renaming or refactoring. Out of scope is indexing binary files or files not loaded as text. Out of scope is hover-based automatic reference popups, because it is too likely to annoy users and degrade performance.

D00 r00. System states and lifecycle

The feature introduces an indexing lifecycle that begins only after the project load phase completes. The app already has `state.phase` values including empty, loading, loaded, cancelled. The reference index must only run when `state.phase === "loaded"` and must stop immediately if the user starts a new load. Indexing is treated as a background compute task with explicit progress tracking and strict time slicing so it cannot freeze the UI.

The index has a clear state machine. When no project is loaded, the reference system is idle and holds no data. After load completes, the system enters baseline indexing state and incrementally builds structures from heuristics and any already-available Tree-sitter caches. When baseline indexing completes, the system enters ready state. Separately, the system can enter an incremental update state whenever a new Tree-sitter parse result becomes available later. If indexing is interrupted by a new load, cancellation, or an error, the system enters partial state and remains usable in a degraded mode, where click-based reference queries still work but may return incomplete results and must clearly indicate "partial index" in the panel.

E00 r00. Data model and required invariants

The index is centered on a stable symbol key. For v1, the symbol key is the normalized symbol name string, plus an optional qualifier when a parser can provide one. The default rule is: if no qualifier is available, the key is just the symbol name. Qualifiers are optional and must never prevent basic grouping. If a file yields multiple definitions of the same name, the UI must treat this as ambiguous and present a deterministic rule for ordering and display rather than silently choosing one.

The system stores occurrences as line-based positions because the app already navigates to a file and approximate line using hash parsing and `navigateToFileLine`. Each occurrence record includes the source file id, source path, line number, column start and end when known, and a short kind label when available (for example "call", "definition", "macro", "key"). The system stores counts per file and total counts per symbol to allow the panel to show summary without enumerating everything in the DOM.

The index must preserve a hard cap on stored occurrences per symbol to avoid memory blowups on large projects. When the cap is reached, the index continues counting but stops storing additional detailed occurrences, and the UI must display a deterministic message such as "showing first N references, total M".

The index must support incremental merges. When new parse results arrive for a file, the system must be able to replace that file's symbol contributions deterministically without duplicating data. The invariant is: for each fileId, the index stores a removable contribution set that can be deleted and re-applied.

F00 r00. Extraction rules, Tree-sitter integration, and heuristics

The extraction layer has two tiers. Tier 1 uses Tree-sitter on a file when both conditions are true: a grammar exists for the file language, and the file is eligible for parsing under size and performance constraints. Eligibility must be deterministic: if the file is larger than `state.settings.maxFileSize`, it is not parsed automatically for project-wide indexing. If the Tree-sitter runtime is not ready, the file is not parsed and falls back to Tier 2. Tier 1 extraction produces two sets for each file: definition candidates and reference candidates, each with precise row and column.

Tier 1 extraction must integrate with the existing on-demand parsing model. The current application parses the active file and caches results in `state.treeSitter.cache[file.id]`. The reference system must treat that cache as an input stream. Baseline indexing may use any cache entries available at baseline build time. Later, whenever a new cache entry is created or replaced for a file, the reference system must schedule an incremental index update for that file.

Tier 2 extraction is a conservative heuristic scan applied line-by-line to all loaded text files. It identifies identifier-like tokens and selected config-like keys across file types, including YAML, INI, TOML, shell scripts, PowerShell, and plain text. The heuristics must prioritize precision. The default token rule is: accept a token as a symbol candidate if it matches an identifier pattern such as `[A-Za-z_][A-Za-z0-9_]*` or a constant-like pattern such as `[A-Z][A-Z0-9_]{2,}` and it is not in a stoplist of common words. For config files, accept keys on the left side of a delimiter, such as `key:` in YAML, `key =` in INI/TOML, and `key=` in env-like files, where key matches the same identifier rule and is not excessively long. For code files, accept identifier tokens that appear in likely call or reference contexts, such as `name(` for calls, `name.` for member access, or `&name` in C-like languages, but keep these as reference only and do not attempt to infer definition.

Cross-language bridging is done by name-only grouping, not by type. This means that a config key `ENABLE_FOO` in a YAML file and an identifier `ENABLE_FOO` in C code are grouped under the same symbol key. This is intentional and must be explicit. To reduce false positives, bridging should only be enabled for keys that look like intentional constants, which in v1 is the uppercase pattern with minimum length 3 and at least one underscore, or keys that appear repeatedly across files above a threshold. The deterministic rule for the threshold is: if a candidate key appears in fewer than two files, do not promote it to a global symbol unless it was produced by Tree-sitter as a definition.

G00 r00. Index build algorithm and performance constraints

The index is built as a post-load job. It must run in time slices with a budget comparable to the existing search slice budget, yielding to the event loop frequently. The job iterates through loaded files in a stable order, such as path-sorted order, so the results are reproducible. For each file, it applies Tier 2 heuristics immediately and optionally applies Tier 1 parsing information if already available in cache at that time. This produces a baseline index that is useful quickly.

The system must then support incremental updates as on-demand Tree-sitter parses occur. These updates must be debounced to protect UX. The deterministic rule is: incremental index updates are scheduled with a debounce window of 1500 ms after the most recent parse completion event. If multiple parse completions occur within the debounce window, they are coalesced into a single incremental batch update. A debounce window in the range of 1000 to 3000 ms is acceptable; the default for this specification is 1500 ms.

Incremental update execution must be bounded. The deterministic rule is: each incremental batch processes at most K files per run, where K defaults to 8. If more files are pending, the system schedules another batch after a yield. This prevents a burst of parsing activity from monopolizing CPU.

The job tracks progress as processed file count and total file count and exposes this to the UI in a non-intrusive way. The existing control bar already shows scanning and reading progress. This feature should not add noisy status by default. The deterministic rule is: show "Indexing references" in the control status only while baseline indexing is running or while an incremental batch is actively processing, and do not show banners unless an error threshold is crossed.

The indexer must have clear cancellation. If the user triggers a new load, cancels load, or the app resets state, the indexer stops and discards partial results. The deterministic rule is: discard index results on reset so the UI never shows references from a previous project.

H00 r00. Reactive updates, subscriptions, and UI consistency

The reference feature is not a single static build. It is a live subsystem that evolves as higher-quality information becomes available. The key driver for reactivity is the on-demand Tree-sitter parse pipeline. When a file transitions from "not parsed" to "parsed", or when a cached parse is replaced, the index must update its symbol and occurrence data for that file, and any currently open reference panels must reflect the updated state.

The system must implement a simple subscription mechanism. The deterministic rule is: the index exposes a monotonically increasing `indexVersion` number. Baseline build completion increments it once. Each incremental batch increments it once after committing updates. UI components that render reference data, including the reference panel, store the version number they last rendered. If the global version changes while the panel is open, the panel re-renders its content once, using a debounced redraw delay of 200 ms to avoid jitter.

The system must also support targeted re-evaluation when ambiguity can be resolved by new information. A common example is multiple candidate definitions or references identified heuristically that can later be classified more precisely by Tree-sitter. The deterministic rule is: when a file receives a Tree-sitter parse, the system replaces that file's contributions for symbols in that file, which may change the kind labels, add definition locations, and refine reference positions. The system must not attempt to rewrite or remove heuristic-derived contributions from other files unless those files are also re-parsed.

I00 r00. UI entry points, interaction rules, and panel behavior

The primary entry point is click on an identifier in the code view. The system should not decorate every identifier with obvious UI because that would be visually overwhelming. Instead, the user requests references for a name they care about. The deterministic rule is: the user selects a token by clicking directly on it, and the app determines the token under the cursor by inspecting the selection or by locating the nearest token boundary in the text. If the user has an active text selection longer than one identifier, the reference action is disabled and no panel opens, to avoid surprising behavior while copying.

When the user clicks an identifier, the app opens a floating reference panel. The recommended implementation is to reuse the existing floating window pattern already used for preview, so the panel has consistent placement, dismissal, and inactivity behavior. The panel opens near the clicked text when space permits and clamps to viewport to avoid covering the clicked line. The panel title is the symbol name. The body begins with a summary line that includes total reference count and whether indexing is complete or partial.

The panel then presents Definitions and References sections in a compact, scrollable body. Definitions show one or more best-effort definition locations. If there is exactly one definition found, it is presented as the primary jump target. If there are multiple, they are listed with file and line. If there are none, the panel states "No definition found in indexed files." References show a list grouped by file, showing the number of occurrences in that file and the first few line numbers. Clicking a line navigates using existing line navigation behavior. The panel also provides a "Copy symbol" action and a "Open search for symbol" action as a fallback.

The panel must never open on hover. It must never follow the cursor. It must close on outside click, and it must also self-destroy after inactivity using the same inactivity model as the preview window.

J00 r00. User workflows as narrative scenarios

Scenario 1, checking downstream usage of a function. The user loads a project and scrolls to a C or JavaScript file containing a function definition. They click the function name in the definition line. A reference panel opens titled with that function name. The panel shows one definition entry pointing to the current line, and below it a references section listing the files that call or mention the function. The user clicks the top referencing file, then clicks a specific line number, and the main pane scrolls to that call site, opening the file section and updating the active file indicator.

Scenario 2, finding the origin of a call site. The user is reading downstream code and sees a call to a function they do not recognize. They click the called name. The panel opens and shows that a definition exists in another file, with a direct "Go to definition" link. The user clicks it and is navigated to that file and line, without manually searching.

Scenario 3, tracing a configuration key across file types. The user reads a YAML file and notices a key like `ENABLE_EXPERIMENT:`. They click the key name. The panel opens and shows references not only in YAML but also in scripts and code files where the same name appears as an identifier or environment variable. The user uses the references list to discover where the value is consumed in code, even though the files are different languages, because the symbol key groups by name.

Scenario 4, observing reactive improvement. The user clicks an identifier early, while only heuristic data is available. The panel shows references and indicates "Indexing in progress or partial precision." Later, the user opens the Tree-sitter window and parses several files, or the system parses the active file on demand. Within the debounce delay, the reference panel updates: definitions appear, reference kinds become more precise, and line navigation becomes more accurate. The user does not need to reopen the panel.

K00 r00. Error handling, validation, and boundary conditions

If Tree-sitter fails to load or a grammar is missing, the indexer logs a single error entry via the existing log system and proceeds using heuristics. Errors must not produce repeated banners. If parsing a file throws, the indexer marks that file as heuristic-only for this run and continues.

If the user clicks a token that is not a valid identifier by the rules, the system does nothing. If the clicked identifier is shorter than a minimum length, the system does nothing. The deterministic rule is: minimum length is 2 for normal identifiers and 3 for config-key bridging. If the symbol is in a stoplist, the system does nothing. The stoplist must be small and deterministic, containing only extremely common words such as `if`, `for`, `while`, `return`, `true`, `false`, and file-type-specific noise keys such as `version` and `name` for JSON-like contexts unless Tree-sitter indicates a real symbol.

If a symbol has more occurrences than the cap, the panel shows the cap and the total count and remains navigable for the stored subset. If an individual file has more occurrences than a per-file cap, the panel shows the first K line numbers and a summary such as "and N more in this file." This prevents the panel from becoming unusable.

L00 r00. Acceptance criteria

The feature is considered correct when a user can click a meaningful identifier in a loaded file and reliably see a reference panel that includes at least a references list derived from the project-wide index, with navigation links that move the main view to the selected file and line. When Tree-sitter parsing is available for at least one language, the panel must show definition locations for symbols in that language with higher precision than plain text matching, and the system must still work when Tree-sitter is unavailable by falling back to heuristics.

The feature is considered non-disruptive when it does not introduce hover popups, does not degrade scrolling responsiveness during indexing and incremental updates, does not block project load, does not interfere with existing preview hover behavior in the TOC and tree, and does not require the user to open additional panels unless they explicitly click.

The feature is considered robust when partial indexing is clearly indicated, cancellation leaves no stale state, errors are logged without spamming, and symbol queries never throw uncaught exceptions even on malformed or unusual file contents. It is also considered robust when new Tree-sitter parse results are incorporated within the debounce delay and visible UI reflects the updated index version.

M00 r00. Implementation guidance for a coding agent

Implementation should extend the existing state reset and post-load flow. The index builder should follow the same pattern as the search runner: stable file ordering, time-sliced processing, progress tracking, and cancellation on new runs. Baseline indexing should be heuristic-first and should opportunistically incorporate any Tree-sitter cache entries already available.

The parsing logic must be revisited so the reference index can react to on-demand parsing. The deterministic integration rule is: when `state.treeSitter.cache[file.id]` is written or replaced, the code must call `scheduleReferenceIncrementalUpdate(file.id)` rather than relying on a full rebuild. That scheduler coalesces multiple file ids, waits for the debounce window, then processes the pending set in bounded batches, applying "remove old contribution for fileId, then add new contribution for fileId" updates, and increments `indexVersion` once per committed batch.

The UI should reuse the existing floating window mechanics to minimize new surface area and maintain consistent dismissal behavior. The click-to-token extraction should be implemented defensively, using selection APIs and strict identifier boundary rules, and should never mutate the code DOM in a way that breaks syntax highlighting, including MicroLite output.
