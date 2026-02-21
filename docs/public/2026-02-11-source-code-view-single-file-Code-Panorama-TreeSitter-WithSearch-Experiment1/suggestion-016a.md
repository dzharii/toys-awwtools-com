2026-02-21

A00 Line numbers truncation bug: specification and fix plan

This document specifies a bug fix for incorrect and truncated line numbering in the Code Panorama viewer. The Tree-sitter parsing change is out of scope and must not be modified as part of this work.

B00 Problem statement and observed symptoms

The line number gutter truncates before the end of the file. In multiple files, the gutter counts up to a specific value (example: 304) and then stops rendering further line numbers even though more file content is visible below. This is visible in the provided screenshots where the code continues but the gutter becomes blank after line 00,304.

File statistics also report an incorrect line count. Example: highlighter.js is reported as 113 lines, but the file contains materially more lines (approximately 140). This indicates the system is either counting from an incomplete text buffer or counting based on a truncated render model rather than the full file text.

A related symptom is incorrect line numbers when jumping or linking to a line from other features (example: symbol references click-through). The jump lands at an incorrect line, suggesting that at least one of these mappings is wrong: offset to line number, line number to DOM anchor, or file line count used to clamp the target.

C00 Codex investigation approach and code-first diagnosis

Codex does not have browser access for interactive reproduction. Instead, Codex must diagnose and fix the issue by analyzing the codebase and validating assumptions with code-level checks, targeted instrumentation, and lightweight scriptable verification.

C00.01 Locate all line-number-related responsibilities
Codex must enumerate all modules and functions responsible for:
Line counting and line statistics (any "lines" number shown in UI, stats panel, summary banner, file metadata).
Line rendering and gutter rendering (DOM creation for lines, gutters, virtualized rows, scroll handlers).
Offset and line mapping used for navigation (anchors, scrollToLine, jump-to-line, symbol reference navigation).
Any text truncation, slicing, preview rendering, or memory caps that might affect displayed or computed lines.

Codex should start by searching the repo for these keywords and patterns:
countLines, buildLineStartOffsets, lineStartOffsets, lineOffsets, "lines:", "lineCount", "line count", "Line ", "line-number", "gutter", "lineno", "lineNo", "scrollTo", "anchor", "data-line", "slice(", "substring(", "MAX_", "CAP", "BUDGET", "304", "300".

C00.02 Identify hard caps and virtualized rendering boundaries
Based on symptom "stops around 304", Codex must specifically look for:
A constant limiting rendered lines or gutter items (for example 300, 320, 512, 1024, or derived from viewport math).
Logic that creates only the first N line elements and never updates them on scroll.
Logic that slices the lines array for initial render but fails to grow/shift the window.

Codex must treat any of the following as a primary suspect until disproven:
A fixed "max lines rendered" cap.
A "render budget" loop that bails early and never resumes for gutter rendering.
A mismatch where code content rendering continues (for example as a single pre block) but the gutter is separately rendered from a truncated lines array.

C00.03 Trace where file text may be truncated or replaced
The mismatch between displayed content and line statistics suggests the "text used for counting" may not match the "text used for display".

Codex must trace the lifecycle of file content through:
Loading (file picker/folder load logic).
Any normalization (newline normalization, trimming, removing CR).
Any memory caps (maxFileSize, memoryWarnBytes, or other limits).
Any preview mode or snippet mode that might store a shortened version in the same field.

Codex must confirm whether there is a single field (for example file.text) used for both full data and render slices. If so, it must be refactored to separate canonical full text from any sliced/preview representation (see F00.02).

C00.04 Add code-level verification hooks (non-browser)
Codex must add minimal instrumentation that can be validated by running unit tests or node-based scripts (or by inspecting console logs during local dev if available), without needing to manually interact in a browser.

Examples of acceptable verification:
A unit test that constructs a synthetic file text > 500 lines and asserts that:
countLines(text) equals expected.
buildLineStartOffsets(text).length equals expected number of lines.
Any function that builds the gutter model returns entries up to the last line.
Any function that maps a lineNumber to an anchor or offset can handle lineNumber > 304.

If the rendering logic is tightly coupled to DOM, Codex should still isolate the model-building portion (for example "buildLineModel", "buildRenderWindow", "computeVisibleLines") into a pure function and test it.

C00.05 Confirm navigation correctness with model-level tests
For symbol reference navigation:
Codex must validate that when given a file text and a target lineNumber, the navigation mapping computes a consistent location in the underlying model. This can be tested without a browser by verifying that the computed offset corresponds to the start offset for that line from buildLineStartOffsets, and that lineNumberAtOffset returns the same line.

D00 Known code touchpoints and likely failure modes

The following modules already exist and are directly relevant to line counting and line indexing:

modules/file-helpers.js provides countLines(text), which counts newline characters and returns 1 + number_of_newlines. This should be correct if and only if the input text is the full file content exactly as loaded.

modules/file-references.js provides buildLineStartOffsets(text), which creates an offsets array of line start indices for each "\n". This should support accurate offset to line mapping if and only if it is built from the full file text and used consistently.

modules/search-helpers.js builds snippet lines from an array of lines and uses lineIndex + 1 for display. If the underlying lines array is truncated or derived from a truncated render buffer, snippet line numbers can become inconsistent.

modules/symbol-references.js produces occurrences with lineNumber and columns, both from heuristic extraction and from Tree-sitter node positions. Even if Tree-sitter returns correct line numbers, the UI navigation might still be wrong if the anchor or scroll mapping assumes a truncated line model.

The symptoms strongly suggest one or more of these failure modes:
The file text stored in memory is truncated (or replaced by a truncated variant) before line counting and offsets are computed.
The UI renders a truncated set of lines (for performance) but does not update the gutter as the user scrolls, so line numbers stop after the initial render batch.
There is an explicit cap on line number generation (for example, only generating N gutter rows) without implementing a scroll-driven virtual gutter.
Line indexing is computed from a different representation than the one used for rendering and navigation, causing jumps to land on the wrong line.

E00 Requirements

E00.01 Correctness of line numbers in the viewer
The gutter must show a line number for every displayed line of the active file through the end of the file. If virtualization is used for performance, the gutter must still update as the user scrolls so that every visible line always has the correct number.

E00.02 Correctness of line statistics
The UI line count shown for a file must equal the exact number of lines in the loaded file text. The definition of line count must be consistent across the application. The recommended definition is: if the file is empty, line count is 0; otherwise line count is 1 + count of "\n". If the file ends with a trailing "\n", this definition naturally counts the trailing empty line, which is acceptable as long as it matches the viewer rendering.

E00.03 Consistency between navigation and display
Any feature that navigates to a line number (symbol references, search results, TOC-like jumps, direct line links) must land on the same line number that the gutter shows. The mapping must be consistent across: file offsets, lineStartOffsets, any line arrays, any DOM anchors, and any scroll calculations.

E00.04 No regressions for performance on large files
Fixing line numbers must not require rendering every line as a separate DOM node for very large files if that would degrade performance. If the existing renderer is virtualized or batched, the fix must preserve responsiveness and avoid long main-thread blocks. Virtualization is allowed and recommended, but it must be complete (no truncation) and correct (line numbers always match the visible lines).

F00 Implementation guidance for Codex

F00.01 Locate the source of truncation
Codex must identify where the gutter line elements are created and why they stop at around 304. This likely lives in app.js or a rendering module not shown in the excerpt. The investigation must explicitly search for:
Any constant or logic that limits rendered lines, line numbers, or DOM rows (common values: 200, 300, 500).
Any logic that slices an array of lines before rendering, especially a slice that is not later extended on scroll.
Any shared state where file.text is replaced by a truncated text used for preview or highlighting.

F00.02 Separate full text from render slices
If the application currently stores only one text field per file and sometimes replaces it with a truncated variant for display, Codex must split these responsibilities:
Keep a canonical full text buffer for each file (example: file.textFull) used for countLines, buildLineStartOffsets, indexing, search, refs, and navigation calculations.
Keep a render model that may be sliced or virtualized (example: file.renderLines or a windowed view) used only for DOM updates.

This prevents line statistics and navigation from silently using a truncated representation.

F00.03 Make line number generation scroll-aware if virtualization exists
If the current viewer renders only a fixed number of lines (for example first 304), Codex must implement one of the following, choosing the one most compatible with the current UI architecture:

Option A: Full DOM line rendering for small and medium files, virtualization for large files
For files below a safe threshold (decide based on current performance goals, for example <= 2000 lines or <= a byte threshold), render each line with a DOM row and line number. For larger files, render a window around the viewport and update it on scroll.

Option B: Always virtualize, but ensure correct gutter updates
Maintain a scroll container with a spacer representing full height, render only visible line rows, and compute visible line numbers from a stable lineStartOffsets array. Update the rendered window and gutter on scroll using requestAnimationFrame or a throttled handler so the UI remains responsive.

In both options, the gutter must never be capped by a fixed maximum without a mechanism to extend/update it.

F00.04 Unify line number source of truth
Codex must ensure there is exactly one source of truth for:
Line count: derived from full text with the agreed definition.
Offset to line number: derived from buildLineStartOffsets(fullText) via binary search on offsets.
Line number to DOM anchor: derived from the same line model used for rendering, not a separately sliced array.

If multiple utilities exist for line mapping, Codex should consolidate them into a single module (for example modules/line-index.js) that exports:
countLinesFromText(text)
buildLineStartOffsets(text)
lineNumberAtOffset(offsets, offset) returning a 1-based line number
offsetAtLineNumber(offsets, lineNumber) returning a character offset

Then refactor call sites to use these functions consistently.

F00.05 Fix stats to use the full text and the unified line counting
Wherever the UI displays "lines N", Codex must verify it uses the canonical full text and the unified count function. It must not use the number of rendered lines.

F00.06 Fix navigation offsets and clamping
Any navigation that jumps to a line must:
Validate the requested lineNumber against the true lineCount and clamp only against the true lineCount.
Compute scroll position or anchor using the same line model as the renderer.
Avoid using stale offsets computed from an earlier truncated buffer.

G00 Edge cases and validation rules

The fix must handle CRLF line endings. If the loader preserves "\r\n", then line splitting and offsets must still be correct. Counting based on "\n" remains correct, but column calculations must not be thrown off by retaining "\r" at end of line. If the app normalizes newlines on load, the normalization must be applied consistently before building offsets and before rendering.

The fix must handle files with no trailing newline and files with a trailing newline, and the gutter and stats must match what the renderer shows.

The fix must handle empty files. Decide and implement a consistent display: either show no lines and line count 0, or show a single empty line and line count 1, but it must be consistent across viewer, stats, and navigation. The recommended approach is: empty text yields 0 lines and renders an empty state without a gutter, but follow existing UI conventions if they already assume at least one row.

H00 Acceptance criteria

After the fix, for any loaded file, scrolling to the end must show continuous line numbers through the final line with no truncation.

After the fix, the line count shown in stats must match the line count computed from the loaded full text for the file.

After the fix, clicking a symbol reference or any other line-based navigation must land on the correct line, verified by comparing the landed line to the gutter and to the expected occurrence lineNumber.

After the fix, there must be no new major responsiveness regression when opening projects with many files or opening a single large file. If virtualization is used, scrolling must remain smooth and the gutter must stay synchronized.

I00 Test plan guidance for Codex

Codex must add at least one automated unit test for the unified line indexing utilities, covering: empty string, "a", "a\n", "a\nb", "a\r\nb\r\n", and a generated string with > 500 lines. The tests must validate countLines, buildLineStartOffsets length, lineNumberAtOffset for several offsets, and offsetAtLineNumber round-trips.

Codex must add a model-level test for any gutter or render-window builder introduced or refactored as part of the fix, ensuring that the model can represent lines beyond 304 and does not hard-cap output.

J00 Deliverables

A code change that removes line number truncation, fixes incorrect line statistics, and aligns line-based navigation with the displayed gutter.

A small refactor introducing a single shared line indexing utility module if multiple inconsistent implementations exist today.

Tests for the utility module and any new or refactored model builders, plus a short note in the change description stating the root cause found (cap, truncation, stale buffer, or inconsistent source of truth) and how it was addressed.
