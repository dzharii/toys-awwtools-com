# Implementation Plan

## Build
- Ship a plain static app with `index.html`, `style.css`, and `script.js`.
- Use a focused top-led product layout with no left sidebar: brand, title, controls, character selection, timeline, summary, and edit panel.
- Keep view mode as the default and show a polished edit panel below the timeline when Edit is active.

## Product Behavior
- Store one canonical meeting instant in UTC and render it as UTC, Participant A local time, and Participant B local time.
- Implement compact hash state: `v`, `t`, `at`, `dur`, `a`, `b`, `theme`, `anim`, `mode`, `render`, `spriteA`, and `spriteB`.
- Use `Intl.DateTimeFormat` for IANA zone formatting and a local-time-to-UTC resolver for edit conversion.
- Update converted time fields live while editing UTC, Participant A, or Participant B.

## Sprite Implementation
- Slice all ten source sprite sheets into clean 8x4 production atlases under `assets/sprites/atlases/`.
- Generate metadata in `assets/sprites/sprites.json`.
- Use CSS background-position to draw exactly one selected frame per participant.
- Add character selection for Participant A and Participant B in both view controls and edit mode.

## Visual And Animation
- Use adaptive timeline windows and progress math from `suggestions001.md`.
- Default to sprite rendering, with SVG fallback available through render mode.
- Prevent character/card overlap by constraining body positions outside the central card while using later sprite frames for hand extension.
- Respect reduced motion and the animation toggle.

## Postpone
- DST ambiguity disambiguation UI beyond choosing the earliest matching instant and showing validation for nonexistent local times.
- Backend, calendar integrations, authentication, recurring meetings, and multi-person meetings.
