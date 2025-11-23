# DESIGN-EXPLAINED

> Objective: fully elaborate every design decision captured in `DESIGN.md` so reviewers understand rationale and trade-offs.

## TODO (coverage check)
- Ensure every major decision below is explicitly explained (architecture, rendering, interaction, validation, persistence, logging/config, UI library, self-checks). This document fulfills that requirement.

## Why Vanilla + File-System Friendly
> Constraint rationale: meet spec of zero deps, classic scripts, local file usage.
- Vanilla HTML/CSS/JS with classic `<script>` tags avoids module loaders and bundlers, satisfying “open from file system” and “no external dependencies” requirements.
- Keeping all globals on `window` (`SubwayConfig`, `SubwayLogger`, `SubwayUI`, `SubwayEditor`) ensures discoverability in the console (Validation Test 2) and straightforward bootstrap without tooling.

## File Roles and Separation
> Maintainability: single-responsibility per file.
- `index.html` only wires containers and scripts, reducing coupling and making it easy to verify “no module” usage (Validation Test 4) and no CDN imports (Test 5).
- `style.css` centralizes visuals so SVG exports can inline a known style set; separating styles simplifies future theming without touching logic.
- `config.js` isolates defaults (palette, zoom bounds, snap, log level) so tuning behavior is a single-edit operation (Agent Task J).
- `logger.js` stands alone to guarantee the logger can be loaded before other code, preventing fallback console usage elsewhere.
- `ui-lib.js` holds UI factories to keep DOM construction consistent and reusable, aligning with AE00 UI library tests.
- `editor-core.js` owns state, rendering, interaction, persistence, and exports; keeping it centralized simplifies undo/redo snapshots and validation paths.

## SVG Rendering Choice
> Trade-off: SVG vs canvas.
- SVG provides built-in hit-testing via DOM events and easier serialization for SVG export (Test 48/49) compared to manual geometry checks on canvas.
- Layering `<g>` elements (connections, nodes, texts) under a single transform simplifies pan/zoom math—only the parent transform changes, reducing redraw complexity and improving responsiveness for hundreds of elements.
- Using simple shapes (circle, line, text) matches the spec’s circle/straight-line requirements and keeps CPU work low.

## State Shape and Undo/Redo
> Consistency: predictable snapshots.
- State uses plain objects/arrays (`nodes`, `connections`, `texts`, `settings`, `viewport`) to keep JSON-compatible data for save/load (Tests 45/46).
- Undo/redo store deep-cloned snapshots with a configurable limit to satisfy history requirements (Test 42) without excessive memory use.
- IDs generated via `buildId` avoid collisions; validation enforces uniqueness on load, preventing inconsistent graphs (Tests 57/58).

## Interaction Model Decisions
> Clarity: modes, priorities, and gestures.
- Tool modes (`select`, `pan`, `node`, `connection`, `text`) mirror the spec’s interaction modes and map to numeric shortcuts (Test 39/44) for efficiency.
- Spacebar pan matches common design tools; Alt bypasses snap to allow precision placement (Test 34).
- Click-to-select prioritizes nodes/text; connections use line click with `pointer-events: stroke`, aiding Test 37 hit priority expectations.
- Multi-select rectangle is rendered as an SVG rect overlay; selection uses coordinate transform to find contained items, enabling group move/align/distribute (Tests 17/18).
- Connection creation uses two-click flow with draft state; self-connections are prevented with logged feedback (Test 23).

## Snap, Grid, and Alignment
> Control: structured layout vs freedom.
- Snap-to-grid defaults on (configurable) to aid neat diagrams (Test 33), with Alt override for free placement (Test 34).
- Grid uses an SVG pattern for lightweight infinite tiling and is toggleable (Test 11), with pointer-events disabled to avoid interfering with interactions.
- Align/Distribute commands operate on selected nodes to provide predictable layout helpers (Test 18) without automatic side effects.

## Persistence and Validation
> Robustness: guardrails for save/load.
- Save serializes meta + state to JSON with try/catch logging; download triggered via Blob to stay file-system friendly (Test 45).
- Load uses FileReader + JSON.parse wrapped in try/catch; validation checks node/connection IDs and references, logging descriptive errors and showing user-friendly messages (Tests 46/47/57/58/59).
- Validation returns structured results so logs can include JSON data for debugging (Agent Task H).

## Export Strategy
> Fidelity: matching on-screen output.
- SVG export clones the live SVG, injects inline styles, and serializes—ensuring colors/strokes/labels match (Tests 48/49).
- PNG export converts SVG to an Image then draws to an off-screen canvas, delivering raster output without server-side work (Test 50/51), and logs failures with context (Agent Task I).

## Logging and Configuration
> Observability: single source of truth.
- `SubwayLogger` implements level gating with numeric precedence and consistent `[Category][Module]` prefixes; verbose default supports deep diagnostics (Agent Tasks C/D/G).
- All operational paths (create/move/delete, save/load/export, toggles) use the logger; raw console use is confined to the logger implementation.
- `SubwayConfig` centralizes log level, palette, sizing, snap/grid defaults, zoom bounds, undo limit—changing log level here affects the whole app (Agent Task J).

## UI Library Rationale
> Reuse: consistent controls, easy wiring.
- `SubwayUI` generates toolbars, buttons, toggles, selects, inputs, palette, zoom control, and messages; it carries no app state, instead invoking callbacks supplied by the editor.
- This separation satisfies AE00 tests: toolbar built through the library, consistent styling, and toggle behavior for grid/snap (Tests 52–56).

## Self-Checks and Openness
> Confidence: quick sanity passes.
- `runSelfTests` exercises logger level changes and validation of bad references—lightweight checks callable in console for headless validation (Agent Task K).
- Public APIs (`loadFromJSON`, `exportAsSVG/PNG`, `saveJSON`, `undo/redo`, `setTool`, `getStateSnapshot`) remain available for scripted or manual testing.

## Visual and Layout Choices
> Usability: readable, unobtrusive UI.
- Layout uses a CSS grid (`toolbar`, `sidebar`, `canvas`, `status`) for predictable placement without frameworks.
- Color palette favors high-contrast strokes and vivid fills tuned for skill-tree readability; drop-shadow selection aids visibility without overcomplicating SVG defs.
- Background gradient and light grid keep the canvas visually separated while staying subtle enough for exports.
