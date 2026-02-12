2025-12-14
Codex CLI 5.1 High

A00 Project intent and description (rev 03)

This project is a static, local-first web app that loads a source code folder and renders the whole codebase as one scrollable page with fast search and jump navigation. The goal is to make read-only code exploration faster than using an IDE for common "find and trace" work, while keeping the user oriented at all times. The user must always know which file they are viewing, where they are inside it, and what the file contains at a glance.

The app treats a folder as a snapshot of text files. It reads files recursively, filters to likely source files, stores each file as text in memory, and renders a structured view: file header followed by its contents. Navigation stays inside one page: a sidebar for directory tree and search results, and a main pane for code. Search works across the loaded snapshot and supports quick jumps and highlights. The UI must stay responsive while scanning and searching.

The app must run as a static website with separate HTML, CSS, and JavaScript files, no bundlers, and no external dependencies. It must use the browser File System Access API when available to read a directory directly, and provide a clear fallback when not available.

B00 Target users and primary workflows (rev 03)

Primary user: a developer reading an unfamiliar codebase or tracing behavior across files without editing code.

Workflow: load and scan. The user opens the page, triggers folder selection, and sees progress while files are discovered and read. The UI shows what is being scanned and what is already loaded. As content arrives, the sidebar shows a directory tree and the main pane shows file sections.

Workflow: search and jump. The user types a query. Results appear with count, file path, and a snippet. The user selects a result and jumps to the match with visible highlight and clear file context.

Workflow: trace across files. The user searches a symbol, jumps to a usage, then searches the next symbol. The app keeps orientation by showing current file and position continuously.

Workflow: audit and compare. The user switches between files using the directory tree, with quick collapse of the sidebar to maximize code area and quick re-open when needed.

C00 MVP scope (rev 03)

MVP includes folder loading, recursive scan, source file filtering, progress UI, single-page render with file headers, a collapsible directory tree sidebar, file-level stats (at least language and lines of code), full-text search across loaded files, and jump-to-match with highlighting.

MVP excludes parsing language semantics, building call graphs, editing files, writing back to disk, uploading code, and any server-side component.

D00 Non-goals and constraints (rev 03)

No server, no remote sync, no analytics, no external libraries, no bundler, no Node tooling. The app is a viewer, not an IDE. It will not compile, lint, refactor, or interpret code beyond plain text operations and lightweight display formatting.

If directory access is not available, the app must show a clear message and offer the fallback input method. The app must avoid freezing the UI during scanning, rendering, stats computation, and searching.

E00 Functional requirements (rev 03)

Folder access and scanning. The app must provide an "Open folder" action that uses window.showDirectoryPicker() when available. It must recursively traverse directories and gather file handles. Traversal must be robust to deep trees and permission errors.

Filtering and ignores. The app must ignore common non-source directories by default, including .git, node_modules, dist, build, out, target, bin, obj, .idea, .vscode. The ignore rules must be user-editable in a settings panel as newline-separated entries. The app must ignore files above a configurable size threshold (default 1 MB) and report them as skipped.

File type allowlist. The app must include a default allowlist of extensions for code-like files. Default: js, ts, jsx, tsx, mjs, cjs, c, h, cc, cpp, hpp, cs, java, scala, kt, go, rs, py, rb, php, swift, m, mm, html, css, scss, md, txt, sh, ps1, yaml, yml, toml, ini, xml. JSON must be off by default but user-toggleable. The allowlist must be editable.

Reading files. For each included file, the app must read its full text via FileSystemFileHandle.getFile().text(). The app must store relative path, file size, and last modified timestamp when available, plus the full text content.

Per-file stats. For each loaded file, the app must compute and store basic stats, at minimum: inferred language (derived from extension), line count, and character count. Line count must be computed as a simple newline-based count and must not require splitting the entire text into an array of lines. Stats must be computed incrementally or in small batches so the UI does not freeze.

Aggregate stats. After load begins, and updating as files arrive, the app must maintain an aggregate summary visible in the UI, including at minimum: number of files loaded, total bytes loaded (approx), total line count (sum of file line counts), and number of skipped files. Optional but supported: breakdown by language (top N by lines).

Progress and cancellation. The UI must show scanning progress with at least these counters: directories visited, files matched, files read, bytes read (approx), and current path being processed. The app must provide a Cancel control that stops traversal and reading as soon as possible, leaving already loaded content visible and searchable.

Incremental availability. The app must render and enable search incrementally as files arrive. The user must be able to start searching before scanning completes.

Rendering. Each file must render as a section with a visible header that includes its relative path and stable anchor id for navigation. The file header must also show file stats in an ergonomic way, at minimum language and line count, plus size. Code must preserve whitespace and use a monospace font.

Error handling. Unreadable files, permission failures, and encoding issues must be handled per-file without aborting the load. The UI must show a skipped/error count and provide a log view listing file paths and reasons.

F00 Search and navigation requirements (rev 03)

Search scope. Search must operate over the loaded snapshot in memory. It must not trigger additional file reads.

Search modes. The app must support plain substring search with a case-sensitive toggle and a whole-word toggle. Regular expression mode is optional; if added, it must be clearly labeled and guarded to avoid runaway patterns.

Results view. Results must show a total match count and group matches by file. Each match entry must show file path and a short snippet with the match emphasized. Clicking a result must jump to the match location in the main pane.

Highlighting. The app must visibly highlight the active match after a jump. The highlight must be cleared on demand (for example via Escape) without losing results.

Keyboard behavior. The search box must support Enter for next match and Shift+Enter for previous. Arrow keys should navigate results when the results list is focused. Esc should clear highlight state and may clear the query on a second press.

Sidebar navigation. The sidebar must show a collapsible directory tree derived from relative paths. Clicking a file jumps to that file header. The current file section must be indicated based on scroll position, using an intersection observer approach.

Orientation indicators. The UI must always show which file is currently active and where the user is within it. The active file must be reflected in the directory tree highlight, and a compact indicator in the header must show the active file path and, if available, the current line number near the top of the viewport.

G00 Data model (rev 03)

In-memory file records. Maintain an array of file records with fields: id, path, segments (path split), size, modified, text, language, lineCount, charCount. id must be stable within a session and unique.

Directory tree model. Maintain a tree structure derived from file paths. Each node must have: name, type (dir or file), children (for dir), fileId (for file), and an expanded state for UI. Expansion state must be tracked separately from file data so it can be preserved across re-renders.

Derived search helpers. For case-insensitive search, store a lowercase copy per file or compute on demand with caching. For snippets and line labels, maintain line-start offsets or a lightweight line index per file, built lazily only when needed for a file being searched or viewed.

Anchors and offsets. Each file section must have a stable anchor. Each match must be represented as file id plus character offset and optional line number. Jump operations must use these offsets to scroll accurately.

H00 UI and interaction design (rev 03)

Layout. Use a two-pane layout: left sidebar and right main content. The header bar contains Open folder, progress, aggregate stats, search input, and search toggles. On narrow screens, the sidebar must be collapsible into an overlay.

File headers. Each file section header must be visually distinct and remain readable while scrolling. The header must display: relative path, language badge, line count, and size. The header should also provide a one-click action to copy the path. Additional actions must be minimal.

Directory tree. The sidebar must render a tree similar to common editors: directories can be expanded or collapsed, files are leaf nodes. Expand and collapse must be available by clicking a caret icon and by clicking the directory name. The tree must support keyboard navigation at least for up/down and enter to expand or open.

Collapsible and pinnable sidebar. The sidebar must support two states: pinned and unpinned. When pinned, the sidebar occupies a fixed width and the main code pane uses the remaining space. When unpinned, the sidebar collapses to a thin edge handle, maximizing code width.

Hover-to-open behavior. When unpinned, moving the pointer over the edge handle must temporarily expand the sidebar as an overlay. Moving the pointer away from the sidebar must auto-collapse it after a short delay, unless the user pins it.

Pin control. The sidebar must have a clear pin/unpin button. Pinning must keep current expanded/collapsed directory states. Unpinning must preserve the tree state and restore the edge handle.

Resizable sidebar. When pinned, the sidebar width should be user-resizable via a drag handle, with sane min and max widths.

Active context display. The header must show the active file path, truncated safely with full path available on hover. The sidebar must highlight the active file. The main pane may include a small sticky "current file" strip only if file headers are not visible and orientation would suffer.

Visual formatting and language cues. The UI must use CSS to visually encode language and file metadata. Language must be shown as a badge based on extension. Basic syntax coloring is optional; if implemented without dependencies, it must be shallow and safe, using conservative regex and applying classes without heavy DOM growth. If syntax coloring is not implemented, the app must still use clear typography, spacing, and header styling to make scanning comfortable.

Settings. Provide a settings surface for ignore list, allowlist, max file size, and display toggles (wrap on/off, show stats on/off). If changing a setting requires reload to apply, the UI must say so and provide a reload action.

I00 Performance requirements (rev 03)

Incremental work and yielding. Directory traversal, file reads, and stats computation must yield control to the UI regularly. Use async iteration with batching and explicit yields (requestAnimationFrame or setTimeout(0)) between batches.

DOM size control. Rendering an entire large codebase as a huge DOM can be slow. The implementation must minimize nodes. A safe baseline is one pre element per file with minimal markup, and only create highlight markup for the active match and a small number of visible results. If more advanced rendering is used, it must preserve jump accuracy and not break search navigation.

Stats computation cost. Line count and language detection must not require expensive parsing. Line count must be computed with a simple scan or newline count. Language detection must be extension-based. Aggregate stats must update incrementally and must not block UI.

Search responsiveness. Search must not block typing or scrolling for large codebases. The implementation may use batching and yielding on the main thread. If main-thread search cannot meet responsiveness goals, the implementation may move search into a Web Worker.

Memory limits. The app must estimate loaded size (sum of text lengths) and warn when above a threshold. The app must allow limiting total loaded bytes and or maximum file count to prevent crashes.

J00 Security and privacy (rev 03)

Local-only. All code stays on the user device. The app must not send folder contents over the network. After initial page load, the app must not make network requests.

Permissions. If the browser supports persistent directory handles, the app may store a handle on-device only after explicit user action. The UI must show when a remembered handle is used and provide a clear way to forget it.

K00 Browser support and fallbacks (rev 03)

Primary support. Target Chromium-based browsers that support the File System Access API.

Fallback mode. If showDirectoryPicker is not available, provide a fallback using input type="file" with webkitdirectory when supported. If webkitdirectory is not supported, allow multi-file selection and load what the user selects. The app must preserve relative paths when available and still build the same internal file model and directory tree.

L00 Project structure and implementation rules (rev 03)

Static files. /index.html holds the layout and minimal markup. /styles.css holds all styles. /app.js holds all logic and UI wiring. Optional: /worker.js if search is moved off the main thread.

No build step. Use ES modules via script type="module". No transpilation. Avoid experimental syntax. Keep code organized into clear functions and small modules within app.js.

State management. Use a single app state object with explicit fields for files, directory tree state, UI state, search state, and settings. UI updates must be driven by explicit events and state changes.

M00 Testing and acceptance criteria (rev 03)

Loading. Selecting a folder loads eligible files recursively, respects ignore rules and allowlist, shows progress, and renders file headers and code bodies for loaded files. File headers show language and line count. Cancel stops additional work quickly and leaves already loaded content usable.

Directory tree. The sidebar shows a tree that matches the loaded files. Directories expand and collapse. Clicking a file jumps to its section. The active file highlight follows scroll position in the main pane.

Sidebar pin and hover behavior. Pinned sidebar stays visible and resizable. Unpinned sidebar collapses to an edge handle, expands on hover as an overlay, and auto-collapses when pointer leaves. Pin and unpin preserve the tree state.

Stats. The UI shows aggregate stats during and after load, including loaded file count and total line count. Per-file stats shown in file headers match the content. Stats update incrementally without freezing.

Search. Typing a query returns matches across multiple files, shows counts and snippets, and jumping moves the viewport to the match with visible highlight. Case and whole-word toggles change results correctly.

Resilience. Unreadable files do not break the load. Large folders do not freeze the UI for long periods. The app stays usable during scanning and searching.

Privacy. No network requests after initial page load. Folder content is not uploaded or logged externally.

N00 Stats inventory (rev 00)

This section defines exactly what stats are collected and how they are used in the UI. Stats must be computable with cheap text scans and metadata reads, and must not require language parsing.

Per-file stats. Store and expose: relative path, file size in bytes, last modified time when available, extension, inferred language (from extension), line count (newline-based), character count, load status (loaded, skipped by rule, skipped too large, error), and optional load time in ms. Optional stats if cheap and useful: approximate token count (charCount / 4 heuristic) and a fast non-crypto fingerprint for change detection within a session.

Per-directory stats. Derive from children: file count, total bytes, total lines, and optional language breakdown by lines and files.

Whole-project stats. Maintain: total loaded files, total skipped files with counts by reason, total bytes loaded, total lines loaded, language breakdown (top N), largest files (top N by bytes and optionally by lines), scan duration, read duration, and error count.

UI placement. Show project-level stats in the header or a compact summary strip. Show per-file stats in each file section header and optionally in the directory tree as secondary text. Provide an optional stats panel for largest files and language breakdown to help users understand what they loaded.
