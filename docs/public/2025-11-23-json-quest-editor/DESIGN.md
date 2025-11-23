# DESIGN NOTES

> Purpose: overview of architecture and decisions for the vanilla SVG editor implementation.

## High-level Goals
> Scope: meet spec for subway-map / skill-tree editor with plain HTML/CSS/JS, no modules/deps.
- Deliver a self-contained editor runnable from `index.html` off the file system.
- Use SVG for rendering to simplify hit-testing and export.
- Centralize configuration and logging per agent instructions.

## File Structure
> Map: what each file provides.
- `index.html` — Shell, containers, script tags (classic), bootstrap on DOMContentLoaded.
- `style.css` — Layout grid, toolbar/sidebar styles, SVG element styling, selection visuals, grid styling.
- `config.js` — Global `SubwayConfig` defaults (palette, sizes, snap/grid, logLevel, undo limits).
- `logger.js` — Global `SubwayLogger` with levels (verbose/info/warn/error), prefixed format `[Category][Module]`, JSON serialization fallback.
- `ui-lib.js` — Global `SubwayUI` factory functions for toolbar/buttons/toggles/selects/inputs/palette/zoom control and message helper.
- `editor-core.js` — Global `SubwayEditor` core: state, rendering, tools, interactions, history, save/load, export.
- `README.md` — Summary and usage.
- `spec.md`, `validation.md`, `agent-instructions.md` — Provided guidance and acceptance/telemetry requirements.

## Architecture & State
> Core: what data we keep and why.
- Central state object inside `SubwayEditor` instance: `nodes`, `connections`, `texts`, `settings` (grid, snap, theme), `viewport` (offsetX/offsetY/scale), `selection`, `activeColor`, `activeConnectionColor`, `activeLabelPlacement`, `currentTool`, `undoStack`, `redoStack`.
- SVG layers: grid rect, `viewportGroup` (transform for pan/zoom), sub-groups for connections, nodes, texts, and a selection rectangle overlay.
- IDs are generated with `buildId` helper; state snapshots cloned via JSON for undo/redo.

## Rendering Choices
> Approach: why SVG and structure.
- SVG simplifies coordinate transforms, hit testing, and export serialization.
- Nodes: `circle` + `text` for label, with label positioned via placement offsets.
- Connections: `line` between computed perimeter points so lines meet circle edges.
- Text elements: standalone `text` nodes for annotations/titles.
- Grid: pattern fill rect; toggle visibility; pointer-events disabled for overlays.

## Interaction Model
> Tools: how input is interpreted.
- Tools (`select`, `pan`, `node`, `connection`, `text`) set via toolbar or keys 1–5; spacebar also enables pan.
- Panning: drag in pan mode or space; zoom via wheel (cursor-centered) and zoom controls; fit-to-content available.
- Node creation: click in node tool; text creation: click in text tool.
- Connection creation: click source node then target; self-connections prevented with feedback.
- Selection: click to select; marquee drag for multi-select; selection prioritizes nodes/text; connections selectable by click.
- Dragging: multi-node drag if multiple selected; snap-to-grid applied unless Alt held; text drag supported.
- Alignment: align/distribute horizontally/vertically on selected nodes.
- Keyboard: Delete/Backspace remove selection; Ctrl/Cmd+Z undo, Ctrl/Cmd+Shift+Z redo; arrow keys nudge; tool shortcuts 1–5.

## Snap, Grid, and Guides
> Placement: keeping things neat.
- Snap-to-grid default on; grid size from config; Alt bypasses snap during drag.
- Grid visibility toggle affects background only.
- Alignment helpers provided via explicit align/distribute commands (visual guides minimal by design here).

## Persistence & Exports
> Save/load/export flows.
- Save JSON: serialize diagram (meta, nodes, connections, texts, settings, viewport) to downloadable file; errors logged and surfaced.
- Load JSON: file input + FileReader, JSON.parse with try/catch, validation for IDs and references; user message on errors; undo snapshot before loading.
- Export SVG: clone SVG, inline style block, serialize, download.
- Export PNG: serialize SVG, draw to offscreen canvas via Image, download blob; error logging on failures.

## Validation & Invariants
> Preconditions/postconditions and logging.
- Numeric assertions via `assertNumber` on node placement.
- Diagram validation checks presence/uniqueness of node/connection IDs and reference integrity; duplicate connections flagged.
- Tool switching validates known tools; missing containers throw with logged errors.
- Connection creation checks endpoints, prevents self-edges; status feedback when invalid.
- Undo/redo use state snapshots; selection cleared appropriately on “New”.

## UI Library
> Reuse: buttons/controls built via helpers.
- `SubwayUI` offers toolbar creation, panels, buttons/toggles, selects, labeled inputs, color palette, zoom control, and simple alert wrapper.
- Keeps no app state; callbacks passed from editor core.

## Logging & Config
> Telemetry: central logger and config.
- `SubwayLogger` uses `SubwayConfig.logLevel` (verbose default). Methods: `logVerbose`, `logInfo`, `logWarn`, `logError`. Formats entries with category/module prefixes and JSON data.
- All meaningful operations (creation, deletion, move completion, save/load/export, toggles) route through logger; raw console only inside logger.
- Config centralizes palette, sizing, defaults, snap/grid settings, zoom bounds, undo limit, and log level for easy tuning.

## Self-Checks
> Quick sanity aids.
- `appEditor.runSelfTests()` (console) exercises logger level change and validation of bad connection references.
- Public API `loadFromJSON`, `exportAsSVG/PNG`, `saveJSON`, `undo/redo`, `setTool`, `getStateSnapshot` exposed for potential scripted checks.

## Why These Decisions
> Rationale highlights.
- SVG over canvas to simplify interaction and exporting requirements with minimal code.
- Global namespaces and classic scripts to comply with “no modules/bundlers/deps” and local-file use.
- Central logger/config to meet agent instructions and ease debugging; verbose by default for transparency.
- Snap + Alt override to satisfy grid alignment and smooth free placement requests.
- Fit-to-content and zoom controls to pass viewport tests without external libraries.
- Validation on load and precondition checks to guard against corrupted diagrams per spec/agent guidance.
