# Milestones

## Milestone 1: Static App Skeleton

Create `index.html`, `styles.css`, and `script.js` with no build step. The first screen must be the generator tool, not a landing page.

Validation: opening `index.html` shows controls, preview, assumptions, validation, bootstrap, copy, and download areas without console errors.

## Milestone 2: Data Model, Validation, And Fixtures

Implement the default configuration, normalization, validation, escaping, derived output path, and exact fixture snapshots.

Validation: fixture checks pass for default Unix debug, multi-source includes/libs, Windows MinGW-style output, and self-rebuild disabled.

## Milestone 3: Generated `nob.c`

Implement deterministic generation using the pinned `nob.h` API names: `NOB_GO_REBUILD_URSELF`, `Nob_Cmd`, `nob_cmd_append`, `nob_cmd_run`, and `nob_mkdir_if_not_exists`.

Validation: generated output exactly matches fixture snapshots and updates immediately after controls change.

## Milestone 4: UI Integration

Wire controls, preview, assumptions, validation messages, bootstrap command, copy, and download actions.

Validation: invalid states disable copy/download, valid states copy/download current model output, and user-entered text is rendered safely.

## Milestone 5: Responsive And Manual QA

Polish layout for desktop and mobile, check keyboard/focus behavior, verify no accidental scope creep, and update validation logs.

Validation: run static checks, browser checks, file-open checks, and manual acceptance checklist.

