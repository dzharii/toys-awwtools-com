# Minimum XOR Path Lab

## A00. Authorship and project context

I am OpenAI Codex, a GPT-6-based coding assistant working in ChatGPT Work Mode. The exact serving-model build identifier was not exposed. I implemented this application with the user, who supplied the product requirements and directed the compact engineering-tool design, spoiler protection, separate mobile presentation, running-XOR annotations, and clearer educational explanations.

This README is both a reproduction guide and a consolidated product specification. It describes the resulting application rather than the sequence of implementation attempts. Source, tests, asset generators, and the exact production assets accompany it.

Published application: https://minimum-xor-path-lab.dearshrew7.chatgpt.site/

Reference problem: https://leetcode.com/problems/minimum-xor-path-in-a-grid/

## B00. Motivation and learning approach

The application helps someone discover how to solve Minimum XOR Path in a Grid through experiments before revealing the algorithm. XOR is not a monotonic path cost: a smaller intermediate result can lead to a larger final result. The learning goal is to move from ranking partial paths by cost to tracking which cell-and-running-XOR situations are reachable.

Ordinary editing and movement must not reveal the minimum, optimal routes, algorithm state sets, or later hints. Manual calculations remain visible because they describe the user's own path. A completed-path check discloses only whether that path is optimal. Explicit reveal actions expose additional information independently.

The interface should feel like a compact developer tool: system fonts, small contextual toolbars, aligned numerical data, restrained teal and warm neutral colors, visible keyboard focus, and limited decorative space. Illustrations belong beside the reasoning they explain.

## C00. Exact problem model

The grid is rectangular with positive row and column counts, at most 1,000 cells, and integer cell numbers from 0 through 1023. A valid path begins at the top-left cell and ends at the bottom-right. Each move advances exactly one cell right or down. The cost is the bitwise XOR of every visited cell number, including both endpoints. The objective is the smallest final XOR across valid paths.

The model must support a single cell, a single row or column, repeated numbers, duplicate XOR states, and multiple optimal routes. Every running result fits in ten bits. Coordinates are zero-based. A path is stored as a sequence of row-major cell indices, beginning with 0.

## D00. Static architecture and ownership of state

The browser application has zero third-party runtime dependencies. It uses native JavaScript modules at development time, compiled by Bun into one static browser bundle, plus HTML, CSS, SVG, and WebP. It requires no application server, account, database, external font, CDN script, or application API. A development HTTP server is tooling only and is not deployed.

The DOM-free ExperimentEngine owns domain operations: valid movement, path XOR, next-move projections, cell edits, resizing, solver caches, and optimal-route analysis. Persistent test cases and learning progress are distinct from debugger execution, presentation preferences, and temporary UI state. Reading or changing an educational example must not alter the main experiment without an explicit transfer action.

| Source | Responsibility |
| --- | --- |
| src/model.js | Validation, bounded reachable-state solver, representative provenance, imports, exports, and share links |
| src/core/experiment-engine.js | Shared experiment operations and route-prefix XOR tracing |
| src/core/optimal-paths.js | Exact optimal-state graph, route counts, coverage, and bounded route enumeration |
| src/views/ | Separate desktop/mobile web components, view selection, and shared cell rendering |
| src/app.js | Browser controller, virtualized grid, dialogs, inspector, debugger, article rendering, and persistence |
| src/lessons.js | Hints 1 through 6 and the ordered lesson collection |
| src/advanced-lessons.js | Detailed Hints 7 and 8, worked tables, terminology, and self-checks |
| public/ | All static files copied into the production build |

## E00. Desktop and mobile presentations

The desktop component mounts a header, grid workspace, inspector/debugger, and independently scrolling educational article. Grid and inspector share the upper workspace; the article occupies the lower region. Standard, Reading Focus, and Debugging Focus preserve the experiment. Dragging or keyboard-operating pane boundaries changes their proportions. Controls must remain accessible at 1920x1080, 1600x900, 1440x900, 1366x768, and 1280x720.

The mobile component is a separate DOM implementation, not a compressed desktop pane tree. It provides Explore, Inspect, Learn, and Debug tabs, a workspace menu, touch scrolling, grid tools, and compact or comfortable cell density. Exactly one presentation component is mounted. Automatic selection uses a viewport at most 960 pixels wide, or a coarse-pointer screen at most 1180 pixels wide. View settings can override that decision.

Both presentations share one experiment engine. Desktop layout, divider proportions, zoom, and mode are saved separately from mobile tab, zoom, mode, and density. Switching views preserves the selected case, manual path, grid, revealed hints, and debugger state. Small landscape screens may scroll within their workspace while keeping navigation available.

## F00. Editing and manual exploration

Edit mode opens an integer editor for a selected cell and validates the full input range. Dimensions are positive integers whose product is at most 1,000. Editing a cell recomputes manual-path calculations and invalidates stale debugger and optimal-route analysis. Resizing preserves overlapping cells, fills new cells with zero, and resets path/debug execution while retaining the test case.

Explore mode starts with the start cell already visited and included in XOR. Clicking the next right or lower cell, Right Arrow, Down Arrow, or the corresponding buttons performs a valid move. Backspace undoes and R resets. Invalid destinations leave the path unchanged and provide feedback. Shortcuts must not also move the path when the user is interacting with an article, dialog, inspector, or pane separator.

Current, visited, valid next, and destination cells have distinct marks. Each valid next cell separates its original cell number from the projected running XOR, shown as ten binary bits with a smaller decimal annotation. Previews update after movement, undo, reset, and edits. The inspector shows coordinates, path length, intermediate/final XOR, and an aligned bitwise operation with differing bit columns highlighted.

A completed path enables Check My Path, which reports optimal or not optimal without disclosing another path or the numeric minimum. Zoom, scroll/pan, coordinate labels, and jump-to-cell navigation support unusually shaped and 1,000-cell grids. The renderer creates cells for the visible region rather than forcing every cell into view.

## G00. Reachability algorithm and debugger

A state is a pair (cell position, accumulated XOR). The state includes the current cell number. Distinct histories reaching the same pair have identical possible continuations and can share future work. Numeric order alone does not make states equivalent.

For each cell, retain the set of attainable running XOR results. Initialize the start with its cell number. For another cell, extend every reachable XOR from its existing top and left neighbors by XORing the current cell number. Union the alternatives and deduplicate equal results. Row-major processing respects these dependencies. The invariant is exact reachability: every retained state has a valid path, and every valid path's result is retained. Only the destination set is minimized.

With B = 1024 possible XORs, time is O(m n B). Full reachability and constant-size provenance use O(m n B) space. The solver uses one byte of reachability and one byte of representative predecessor direction per cell-and-XOR state, totaling 2,048,000 bytes for 1,000 cells. Per-transition histories are not retained eagerly. Individual transitions are derived for the inspected cell, at most 2,048 at once.

The debugger is initially hidden behind an explicit reveal confirmation. Cell stepping, transition stepping, Previous, Next, Play/Pause, Reset, speed, and computed-cell navigation expose deterministic execution. A 32x32 matrix represents XORs 0 through 1023; a searchable decimal/binary list provides an accessible alternative. Selecting a reachable state shows one valid representative predecessor and route. The manual path remains independent.

## H00. Explicit optimal-route inspection

Show optimal paths reveals the minimum and optimal-route overlay independently from hints and the debugger. Each drawn route has a distinct color. Native CSS color-mix blends colors of displayed routes sharing a cell. A separate outline marks the exact union of cells belonging to any optimal route.

The route count is exact and uses BigInt. Drawing initially samples eight distinct optimal routes; Show more adds eight up to 32. This cap avoids exponential route materialization. Counts and cell coverage remain exact when drawings are capped, and the interface states the limit.

Each route option includes its final XOR. Selecting one route shows a step number and running XOR in binary and decimal at every cell of that route, including the start. The destination is explicitly marked final. All XOR steps expands the full sequence of previous-running-XOR XOR cell-number equations in decimal and binary. The detailed rows are created only when expanded. This trace does not change the manual path. Returning to all routes restores ordinary manual next-move previews.

## I00. Progressive article and explicit vocabulary

Eight independent native details sections begin collapsed. Their summaries say only Hint 1 through Hint 8. Opening one does not open another, replace the grid, reveal the debugger, or enable optimal paths. Learning reset closes hints and restores spoiler protection while preserving cases and the manual path.

The progression covers legal paths, XOR bit behavior, exhaustive enumeration, a greedy counterexample, sufficient state, the ten-bit bound, transitions/correctness, and a complete walkthrough. The educational interface contains language-independent pseudocode only, not complete solutions in an implementation language.

Hint 7 explicitly connects three representations: reachable nodes in an expanded cell-and-XOR graph, sets S(r,c), and Boolean entries dp[r][c][x]. The third index is a possible accumulated result; each table entry answers a yes/no reachability question. The text distinguishes the number printed in a cell from any running XOR.

The advanced explanations name cellNumber, incomingXor, newXor, and reachableXors. Associativity explains replacing an already-XORed prefix with its accumulated result. Commutativity, self-cancellation, the zero identity, parity of bit flips, and the absence of carries are stated explicitly. Alternatives from top and left are unioned, not XORed together. A suffix begins after the shared cell so the junction is not counted twice.

Hint 8 follows [[0,1,0],[2,0,2]] through all six cells. Its reachable sets in row-major order are {0}, {1}, {1}, {2}, {1,2}, and {0,3}. Its three routes finish at 3, 3, and 0. Tables distinguish positions, printed numbers, incoming XORs, generated results, and stored sets. Further sections explain duplicate states, reversible XOR with stored provenance, complexity, boundary cases, and precisely named pseudocode. Native expandable self-checks reveal their answers independently.

Seven new SVG explanations cover expanded states, accumulated bits, separate incoming alternatives, one named transition, sets versus Boolean flags, equivalent histories with a shared suffix, and the complete counterexample. Diagrams have exact labels, accessible descriptions, captions, and reserved aspect ratios. Embedded editable path examples remain isolated; loading one creates a new test case only after explicit interaction.

## J00. Cases, persistence, and sharing

The collection supports named test cases, creation, duplication, renaming, deletion, JSON import/export, and LeetCode-compatible input copying. Defaults include official examples whose results are 6, 9, and 0, an initial experiment, and a blank editable case. A reference result is separate from whether the interface reveals it.

Input-only exports omit hidden reference results. Including expected results requires an explicit choice. Browser-local storage under xor-path-lab-v1 persists cases, selected case, manual paths, opened hints, debugger reveal status, and independent presentation settings. Storage failure leaves an operable session and recommends JSON export.

Share links serialize only the grid and selected manual exploration state. They never carry hint/debugger/optimal reveal flags. Loading a shared experiment restores spoiler protection. Links that would be impractically long recommend JSON export. No state is synchronized to a backend.

## K00. Production assets and compact archive policy

Only assets actually referenced by production are retained in public/assets. The asset audit checks direct static references plus lesson diagram references. Unused legacy transition, overview, and invariant SVG files were removed. The retained artwork consists of exact native SVG diagrams and the optimized concept.webp originally generated for this application. Visitors never invoke image generation.

SVG preserves exact text and geometry without rasterizing diagrams. The only raster production asset is already a 28,600-byte WebP. A lossless re-encode was larger, so the original optimized file was retained unchanged. No PNG-to-JPEG degradation was necessary. ZIP compression uses maximum DEFLATE while preserving file contents.

The final source ZIP excludes node_modules, browser binaries, Git history, screenshots, generated QA reports, temporary fixtures, unused full-resolution artwork, and duplicate dist output. These omissions reduce size without reducing production visual quality. The included public/assets files are exactly the production assets. Rebuilding creates the complete deployment directory; no generated app bundle needs to be stored twice in the archive.

The exported hosting manifest declares only static.directory = dist. The live Site's project identity is deliberately omitted so reproducing the project cannot overwrite the existing publication. Register a new ChatGPT Site to publish a separate copy.

## L00. Environment and reproducible commands

The implementation environment was a managed Linux workspace in ChatGPT Work Mode, Node.js 24.22.1, Bun 1.3.3, and Playwright 1.56.1. Source is native JavaScript with no framework. The package manifest has development dependencies only; package-lock.json pins them. Python 3 is used only by the optional archive-packaging script.

On a normal development machine with Bun installed, run these commands from the extracted project directory:

```sh
bun install
bun run test
bun run build
bun run dev
```

Open http://localhost:3000 after starting the development server. PORT can select another port. Rebuild after source changes. The build invokes Bun's browser bundler and copies public files into dist. Node runs the tiny development server and test orchestration. The deployed site uses neither Node nor Bun at runtime.

For browser tests:

```sh
bunx playwright install chromium
bun run test:browser
bun run test:visual
```

LAB_URL can select an existing hosted origin; otherwise the Playwright configuration starts the local development server. Playwright and its browser binaries remain development-only dependencies.

To regenerate the exact SVG families and verify production asset coverage:

```sh
node generate-assets.mjs
node generate-lesson-assets.mjs
node scripts/audit-assets.mjs
```

To create another compact source archive:

```sh
python3 scripts/package-release.py ../minimum-xor-path-lab-final.zip
```

This managed host required npm ci as a development-tool bootstrap because Bun's installer returned NotDir. Bun bundling and Bun-invoked build/test scripts work. That environment workaround does not introduce a browser runtime dependency.

## M00. Verification and acceptance boundaries

All 26 core tests pass. Model tests compare 500 seeded small grids against an independent exhaustive path enumerator. Optimal-route tests add 200 seeded grids, checking exact optimal routes, route counts, and cell coverage. Other checks cover official results, invalid input, prefix XORs, provenance, transitions, 1,000-cell bounds, sharing, result-free exports, view selection, distinct route traces, worked educational tables, self-check arithmetic, and the absence of unused production assets.

The Playwright suites cover editor/path interactions, keyboard behavior, spoiler protection, persistence, debugger stepping, route overlays, mobile/desktop presentation changes, expanded lessons, and viewport geometry. Hosted cloud-browser Playwright interactions and actual screenshot reviews supplement those tests.

The local browser runner cannot be claimed as passing in this managed environment: installed Chromium Headless Shell exits with SIGTRAP before assertions. The managed preview daemon is also unavailable. A previous hosted download-event verification timed out. These are recorded verification gaps, not successful automated browser tests. No physical iOS or Android device was used. Re-run the included suites on a host where Chromium launches normally.

## N00. Building and publishing a reproduction

Run the core tests and Bun production build, then serve or host the dist directory as static files. The deployed application must make no required third-party runtime requests; only its own static assets are needed. Educational links are optional navigation, not dependencies.

For ChatGPT Sites, create a new Site, assign its returned project identity in the hosting manifest, synchronize the source, package the exact committed static build, save a version, verify it, and publish to the intended audience. Preserve browser-local persistence. Do not add a backend or database to reproduce the application.

Production acceptance means valid manual movement, accurate binary/decimal calculations, independent explicit reveals, correct reachable states and representative paths, a working case collection, persistent experiments, spoiler-safe sharing, readable educational materials, accessible desktop/mobile controls, and no page overflow at the supported sizes. Verify the actual hosted origin independently from the local development server.
