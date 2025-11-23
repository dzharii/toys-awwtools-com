# JSON Quest Editor

JSON Quest Editor is a lightweight, file-system–friendly subway-map / RPG-skill-tree diagram editor built with plain HTML, CSS, and vanilla JavaScript. It runs directly from `index.html` with no build steps, no modules, and no external dependencies. The editor lets you create circular nodes, label them, connect them with straight/diagonal lines, add free text, zoom and pan, align and distribute nodes, toggle snap-to-grid and a background grid, and export your work to JSON, SVG, or PNG.

## Files
- `index.html` — Single-page shell loading all scripts via classic `<script>` tags.
- `style.css` — Layout and visual styles for toolbar, sidebar, canvas, and elements.
- `config.js` — Global `SubwayConfig` with palette, sizing, and logging defaults.
- `logger.js` — Global `SubwayLogger` with verbose/info/warn/error levels and prefixed log formatting.
- `ui-lib.js` — Global `SubwayUI` helpers for toolbar buttons, panels, palettes, zoom control, and inputs.
- `editor-core.js` — Global `SubwayEditor` core: SVG rendering, state management, tools, history, persistence, and exports.
- `spec.md`, `validation.md`, `agent-instructions.md` — Product spec, manual validation plan, and agent logging/telemetry checklist.

## Features
- SVG-based canvas with pan/zoom (wheel-centered), fit-to-diagram, and optional grid.
- Node, connection, and text tools; multi-selection with drag rectangle; move, delete, align, distribute, nudge via arrows.
- Snap-to-grid with Alt override; palette-driven colors; label placement presets.
- Undo/redo history, JSON save/load with validation, and export to SVG/PNG.
- Centralized logging with configurable log level (verbose by default) and consistent `[Category][Module]` prefixes.

## How to Run
1) Open `index.html` in a modern desktop browser directly from the file system.  
2) Use toolbar or shortcuts (1–5 for tools, Delete/Backspace to remove, Ctrl/Cmd+Z / Shift+Z for undo/redo, arrow keys to nudge, space/pan tool to pan, mouse wheel to zoom).  
3) Save/Load via JSON buttons; export via SVG/PNG buttons.

## Testing Notes
- Manual validation is defined in `validation.md`. Focus on panning/zooming, node/connection/text operations, snapping, alignment, save/load, exports, and logging visibility.
- Basic self-checks: run `appEditor.runSelfTests()` in the browser console for logger/validation sanity.

## Telemetry and Logging
- `SubwayLogger` is the single logging entry point, honoring `SubwayConfig.logLevel`. It emits verbose/info/warn/error with category + module prefixes and JSON-serialized data payloads.
- All editor operations route through the logger; raw `console.log`/`console.error` are avoided except inside the logger implementation.

## Author / Model Disclosure
Created by Codex, an AI coding agent based on OpenAI’s GPT-5 architecture, operating within the Codex CLI (non-networked, vanilla JS environment). Instructions followed: vanilla stack (no modules or external deps), global namespaces (`SubwayConfig`, `SubwayLogger`, `SubwayUI`, `SubwayEditor`), centralized logging/telemetry, and spec-compliant editing features.
