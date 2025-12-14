# Fixes and suggestions iteration 4
2025-12-14
Codex CLI 5.1 High

A00 Tree-sitter integration and UX window (rev 00)

Code Panorama is a single-page code viewer. It loads a folder, renders all files as one long page, and keeps navigation simple with a project tree and in-page anchors. This feature adds a Tree-sitter powered helper panel for C and C++ that helps users understand a file faster and jump inside it without adding global search or slowing load.

The key idea is: load files first, then parse on demand. Tree-sitter work must never block or slow the existing streaming load and render path.

B00 What this adds for the user (rev 00)

The user often opens a large C or C++ repo and needs answers like:

* What functions and types are defined in this file?
* Where is the definition inside this long file?
* What headers does this file include, and which ones are in this project?

The Tree-sitter panel solves this by showing a small structure view for the active file:

* Outline: functions, structs, enums, typedefs, macros (basic set)
* Includes: clickable links to headers that exist in the loaded project
* Quick jumps: click an outline item to scroll to the definition

This is local navigation. It does not add search. It does not parse the whole project upfront.

C00 Supported languages and scope (rev 00)

Supported now

* C using tree-sitter-c-v0.24.1.wasm
* C++ using tree-sitter-cpp-v0.23.4.wasm

Not in scope

* Any other language grammars
* Full semantic resolution across files
* Code highlighting by token spans (too heavy for large files)
* Global symbol search

D00 Files and where to put them (rev 00)

Static assets are already present in your tree. The runtime must load them from these paths:

Tree-sitter runtime

* lib/web-tree-sitter-v0.26.3/web-tree-sitter.js
* lib/web-tree-sitter-v0.26.3/web-tree-sitter.wasm

Language grammars

* lib/web-tree-sitter-v0.26.3/tree-sitter-c-v0.24.1.wasm
* lib/web-tree-sitter-v0.26.3/tree-sitter-cpp-v0.23.4.wasm

The app must treat these as static files served next to index.html. No bundlers. No npm installs.

E00 Integration approach (rev 00)

E01 Load timing
Tree-sitter must initialize only after the UI is usable.

* Do not initialize Tree-sitter during folder scan.
* Initialize when the app reaches state.phase = loaded, or when the user first opens the Tree-sitter window, whichever happens first.

E02 Language selection per file
Use existing file.language or extension rules:

* If file path ends with .c or .h, treat as C by default.
* If file path ends with .cc, .cpp, .hpp, treat as C++.
* If uncertain, prefer C++ for .hpp, prefer C for .h only if the project has mostly C files. Keep this simple at first.

E03 Parser lifecycle
Keep one Parser instance in memory.
Load both language wasm files lazily and cache them:

* First time a C file needs parse: load C grammar wasm.
* First time a C++ file needs parse: load C++ grammar wasm.

E04 Parse trigger
Parse only when needed:

* When the active file changes and the Tree-sitter window is open.
* Or when the user clicks a "Parse" button inside the Tree-sitter window for the active file.
  If the window is minimized or closed, do not parse.

E05 Cache
Store per-file parse output in memory:

* A lightweight outline model, not the full tree object if it is large.
* Includes list.
  Invalidate cache only when the file text changes. In this app, file text does not change, so cache is stable.

F00 First Tree-sitter feature set (rev 00)

F01 Active file outline
For the active C or C++ file, extract and display:

* Function definitions (name, start line)
* Struct or class definitions (name, start line)
* Enum definitions (name, start line)
* Typedef declarations (name, start line)
* Macro definitions (name, start line)
  If a name is missing, show "<anonymous>" but still allow jump.

F02 Includes list
Extract include directives:

* For each include, show the raw include text.
* If it is a quoted include and the path matches a loaded project file, make it clickable.
  Clicking an include navigates to that file using the existing anchor ids.

F03 Jump inside file
Clicking an outline item scrolls to the definition in the file section.
Implementation must be cheap:

* Use the existing section element for the file.
* Compute a target anchor by line number and scroll to an inserted marker element.
  Do not wrap code tokens. Do not inject spans per token.

F04 Minimal markers
When a file is parsed, create a small set of jump markers:

* One marker per outline item.
  A marker is a zero-height element placed before the nearest line in the pre block.
  If precise placement is hard, place the marker at the top of the pre and use scroll offset logic based on line height. Keep it stable and fast.

G00 Tree-sitter window UX (floating, draggable, minimizable) (rev 00)

G01 Purpose of the window
The Tree-sitter UI must be optional and low-noise. The user should be able to ignore it most of the time, then open it when they want structure help.

G02 Default placement
When enabled, the window appears on the right side of the viewport because the main view often has unused space there.
It is not a permanent sidebar. It is a floating panel that can overlay the code without changing layout.

G03 Window states
The window has three states:

* Closed: not visible, no parsing
* Open: visible, draggable, resizable
* Minimized: collapsed into a small translucent chip on the right edge

G04 Open state layout
The open window has:

* Title bar: "Tree-sitter"
* Subtitle: active file path, truncated, full path on hover
* Controls: Minimize, Close
* Body tabs or sections (simple, no heavy UI):

  * Outline
  * Includes
* Body shows a placeholder when the active file is not C or C++: "No C/C++ structure for this file."

G05 Minimized state
When minimized:

* Show a small vertical chip near the right edge, centered vertically by default.
* Chip text: "Tree-sitter"
* Chip style: semi-transparent background, subtle border, small shadow
* Chip is clickable to restore.
* Chip can be dragged up and down along the right edge to avoid covering important content.

G06 Drag and resize
Open window interactions:

* Drag by the title bar.
* Resize from the bottom-right corner only.
* Minimum size prevents cramped content.
* Maximum size prevents covering the whole screen.
* If the user drags near the right edge, the window can snap to a docked position aligned with the right edge. This is optional but recommended.

G07 Behavior while scrolling
The window is position: fixed relative to viewport.
Scrolling the code does not move the window.

G08 Focus and pointer safety
The window must not steal focus on every active file change.
If the user is typing in settings or interacting elsewhere, do not shift focus.
Clicks inside the window must not scroll the main page unless the user clicks a jump item.

G09 Controls and discoverability
Add one new control to the control bar:

* "Tree-sitter" button
  Click behavior:
* If closed: open the window
* If open: minimize
* If minimized: restore

This button is always available after load. It is disabled in empty state.

H00 Performance rules (do not slow load) (rev 00)

H01 No work in the hot path
The current load pipeline readAndStoreFile and renderFileSection must remain fast.
Do not parse files during readAndStoreFile.
Do not parse files inside traverseDirectory or loadFromFileList loops.

H02 Parse scheduling
When a parse is needed:

* Run it after the current frame.
* Prefer requestIdleCallback when available.
* Otherwise use setTimeout(0) and yield between steps.

H03 Concurrency
Parse only one file at a time.
If active file changes quickly, cancel the previous pending parse request and only parse the latest active file.

H04 Large file protection
If file.size exceeds a threshold (reuse maxFileSize or add a new parseMaxBytes setting):

* Do not auto-parse.
* Show a message in the window: "File too large to parse automatically. Click Parse to try."
  This avoids freezes.

H05 Memory
Keep only the extracted outline model and includes list in cache.
Do not keep full syntax trees for many files unless needed.

I00 Data model additions (rev 00)

Add to state:

* state.ts = {
  enabled: boolean,
  window: { open: boolean, minimized: boolean, x: number, y: number, w: number, h: number },
  ready: boolean,
  loading: boolean,
  error: string|null,
  cache: { [fileId]: { outline: OutlineItem[], includes: IncludeItem[], parsedAt: number } },
  pendingFileId: string|null
  }

OutlineItem:

* kind: "function" | "struct" | "enum" | "typedef" | "macro"
* name: string
* line: number
* fileId: string
* anchorId: string

IncludeItem:

* raw: string
* targetPath: string|null
* targetFileId: string|null

J00 Persistence (rev 00)

Persist window state in localStorage:

* open or minimized
* x, y, w, h
* minimized chip y position
  Restore on next load.
  If the saved position is off-screen due to resolution changes, clamp it back into view.

K00 Failure modes and user feedback (rev 00)

If Tree-sitter runtime fails to load:

* The window shows: "Tree-sitter failed to load."
* The error is logged in the Log panel.
* The rest of the app works normally.

If grammar wasm fails to load:

* Show: "C grammar missing" or "C++ grammar missing"
* Do not crash.

If parsing fails for a file:

* Show: "Parse error for this file."
* Keep last successful result if any.

L00 Acceptance checks (rev 00)

L01 No regression on load
Loading a project shows the same incremental behavior and completes with the same responsiveness as before.

L02 Window behavior
The Tree-sitter button opens a floating window.
The window can be dragged and resized.
The window can be minimized into a small translucent chip on the right edge.
The chip restores the window on click.

L03 Optional nature
With the window closed or minimized, there is no parsing and no extra CPU load beyond normal scrolling.

L04 Active file integration
When the window is open and the active file is C or C++, the outline and includes update for that active file.
When active file is not C or C++, the window shows a clear empty state.

L05 Jumps work
Clicking an outline item scrolls to the definition inside the file section.
Clicking a project include navigates to the included file section using existing anchor navigation.

L06 Offline and no bundlers
All Tree-sitter assets are loaded from the local lib/web-tree-sitter-v0.26.3 directory and work in a static site setup.
