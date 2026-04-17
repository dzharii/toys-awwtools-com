# Agent Guide

## Purpose

This file defines how agents should contribute to this repository without introducing drift.

## Default Operating Posture

1. Implement locally inside one bookmarklet first.
2. Prefer explicit, readable code over abstractions.
3. Use Shadow DOM for injected UI and DOM APIs for element creation.
4. Never use `innerHTML`/`insertAdjacentHTML`.
5. Review nearby and recently added bookmarklets before extracting shared code.
6. Keep refactoring proportional to the task.
7. Preserve existing behavior unless the user requests a change.

## Non-Goals

Do not add TypeScript, frameworks, runtime loaders, or speculative infrastructure unless explicitly requested.

## Implementation Model

1. Build a bookmarklet in `src/bookmarklets/<name>/index.js`.
2. If UI is required, mount in a dedicated host and attach a Shadow Root.
3. Keep helper logic local until at least two real call sites justify extraction.
4. Extract narrow helpers into `src/shared/<domain>/`.
5. Add brief value-focused JSDoc to helper methods.
6. Add tests for new non-UI logic in `tests/`.
7. Bundle via Bun to a single payload.

## Periodic Refactoring Review

Perform periodic code reviews across existing and recent bookmarklets to detect repeated logic that is safe to extract. If extraction does not clearly improve readability at each call site, keep code local.

## Documentation Obligations

Update docs when any of the following change:

1. Repository structure.
2. Build scripts or output shape.
3. Shared code policy.
4. Runtime rules (e.g., Shadow DOM usage).
5. Testing requirements.
