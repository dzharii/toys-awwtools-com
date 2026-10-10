# Change request: understandable preset tiles

Pragmatic follow-up note, October 10, 2026. Implement this after the live-preview, independent-clone, SVG, and whole-page polish work in `CHANGE_REQUEST.md`.

This amends the unchanged historical `SPECIFICATION.md` and the first session note. It is finalized by the closing requirement audit in `CHANGE_REQUEST.md` and becomes immutable when completion is declared. Future changes belong in a new note.

## Problem

The preset dropdown hides the available options and names them without explaining the result. "Technical insight", "Implementation review", "Algorithm walkthrough", and "Custom settings" are not sufficient descriptions for an informed choice. The user should see the choices, recognize their pictograms, compare their purpose, and know which configuration is active.

## Chosen interaction

- [x] Replace the dropdown with smaller illustrated tiles in the menu area, not three large explanation-structure cards and not a page-wide preview.
- [x] Retain the three useful built-in configurations plus an explicitly explained Custom settings tile. Do not invent extra presets merely to fill space.
- [x] Give every tile its own new pictogram, name, and concise outcome-oriented summary. Descriptions must be readable without hovering.
- [x] Show an adjacent explanation panel on sufficiently wide menu containers. Stack it below the grid at medium widths and immediately after the inspected tile on small phones; viewport width alone is not enough with the live preview taking a lane.
- [x] On hover or keyboard focus, preview that tile's purpose and high-level resulting settings. Previewing must not apply settings or regenerate the prompt.
- [x] On selection, apply the preset and leave its explanation visible. Use checked radio state, a distinct border/surface, and a checkmark; selection must not rely on color or hover.
- [x] Distinguish "Previewing" from "Selected". Leaving a hover/focus preview restores the active selection's explanation.
- [x] Show the answer's starting point, reasoning style, code deliverable, and illustration mode in the panel, using actual effective settings rather than stale hard-coded values.
- [x] Explain Custom settings as the current mix of controls, not a saved historical configuration. Selecting it keeps the current values; changing an individual option activates it automatically.
- [x] Preserve assignment, established decisions, special instructions, and all authored clones when selecting built-in presets. Keep the generated/live views synchronized and their change feedback working.
- [x] Provide touch behavior without hover dependency: tap a tile to select it and show its always-visible explanation panel.
- [x] Use native radio-group keyboard conventions: Tab enters the group, arrows select another tile, and focus is visible. Keep explanatory text accessible to screen readers.
- [x] Let the tile list wrap and grow from preset definitions. Do not require a fixed count, hide extra choices in a carousel, or make descriptions narrower to fit more columns.
- [x] Keep compact full-width tiles on small phones, with readable text and icons rather than tiny multi-column cards.

## What the choices mean

| Choice | Plain-language purpose | Distinguishing result |
| --- | --- | --- |
| Technical insight | Understand why the design works | Causes/invariants first, complete C program, then non-obvious decisions; focused prose and deep reasoning |
| Implementation review | Inspect correctness and failure paths | Complete library first; rigorous reasoning, ownership/boundaries/checks; no diagrams |
| Algorithm walkthrough | Follow operations step by step | Worked insertion/extraction before implementation; labeled state transitions, expanded explanation |
| Custom settings | Keep and inspect your current mix | No canned configuration is applied; adjust any control below to shape the answer |

These are plain-language answer instructions, not guaranteed model output or hidden API parameters. Explanation structure alone is not a complete preset: presets also set depth, length, audience, illustrations, deliverable, focus, and exclusions.

## Layout experiments and extension rule

Compare a wrapping compact grid with a right-hand detail panel against a horizontal tile strip with details below, using desktop and mobile browser screenshots. Prefer the arrangement that makes all choices and descriptions discoverable, keeps the hint comfortably readable, and does not compete with the floating prompt. Record the decision in `VALIDATION.md`; do not ship discarded experimental CSS.

Decision: retain the wrapping grid. The strip hid Custom settings at desktop size and nearly every alternative on a phone. A further phone refinement places the explanation immediately after the inspected tile instead of far below the full list. Wide panels reserve sufficient height to avoid shifting the assignment on routine hover previews. Seven-tile browser coverage demonstrates that the layout is not hard-coded to four choices.

To add a built-in preset, add its configuration and presentation metadata to `src/prompt-core.js` and its SVG symbol to `src/template.html`. The UI renders the definitions automatically and wraps additional tiles. Custom settings remains a separate current-state action, not a default-reset preset.

The selected preset is included in opt-in workspace saves/exports. On restoration/import, a named preset must agree with its actual categorical/focus/exclusion settings; mismatches are rejected rather than showing a misleading active tile. Older files without a selected-preset field are labeled Custom settings.

## Acceptance

The dropdown is gone. Each tile's meaning is visible before selection, the detail panel stays inside the menu, hovering/focusing does not change the generated prompt, selection changes the correct settings and preserves clones/context, Custom settings accurately reflects the menu, and no viewport requires horizontal page scrolling. Verify with Playwright mouse/keyboard/touch checks, scalable tile-count coverage, and whole-page screenshots, then rebuild `index.html` and update related docs.

Final audit: every interaction checkbox above is implemented. All four shipped choices have distinct new pictograms and readable summaries. The menu-local panel has separate inspected/selected states, native keyboard and touch support, comfortable wrapping, and seven-tile extension coverage. The whole-page review, discarded experiments, preservation of prior features, and 36-test result are recorded in `VALIDATION.md`.
