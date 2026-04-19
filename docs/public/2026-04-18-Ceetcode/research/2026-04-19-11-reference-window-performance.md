# 2026-04-19 Reference Window Interaction Performance Fix

## Problem
Dragging/resizing the embedded C99 reference window produced repeated main-thread long tasks and visible jank. Chrome traces showed `pointermove` driving `setGeometry -> renderGeometry`, with expensive `Layerize`/render work per move.

## Root causes
1. Geometry writes were performed on every `pointermove` event.
2. Drag updates used `left/top` continuously (layout-affecting path) instead of compositor-friendly transform preview.
3. Embedded iframe + translucent titlebar effects increased per-frame layer/paint cost during interaction.
4. Geometry persistence wrote to localStorage during each move (avoidable overhead).

## Changes
- Implemented transform-based drag preview:
  - live drag movement now updates `transform: translate3d(...)` only.
  - final `left/top` are committed once at drag end.
- Added RAF throttling for geometry writes:
  - DOM geometry updates are flushed at most once per animation frame.
- Added interaction phase states:
  - `is-dragging`, `is-resizing`, `is-interacting` classes on the floating window.
- Reduced expensive paint work during active interaction:
  - temporarily hides iframe paint and shows an overlay placeholder.
  - disables titlebar backdrop-filter while interacting.
- Reduced persistence overhead:
  - geometry is persisted at interaction end (and on viewport resize), not on every move.

## Validation
- Typecheck: `npx tsc --noEmit` passed.
- Focused reference suite: `npm run test:e2e -- --grep "reference"` passed.
- Added new acceptance test for performance budget:
  - `reference drag stays under long-task performance budget`
  - uses `PerformanceObserver('longtask')` around deterministic drag interaction.
  - enforces max long task `< 50ms` when longtask API is supported.
- Full suite: `npm run test:acceptance` passed (`19 passed`).

## Outcome
Interaction path is now frame-throttled and composited for drag, with reduced repaint pressure from embedded content during movement. This removes the previous per-pointer-event heavy render behavior while preserving drag/resize usability and existing feature behavior.
