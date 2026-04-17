# Project Standards

## Purpose

Hard technical standards for bookmarklet development in this workspace.

## Language and Tooling

1. JavaScript only.
2. Modern ES modules in source.
3. Bun is the bundler/runtime for scripts and tests.
4. No external dependencies by default.

## Bookmarklet Constraints

1. Output must be single-payload and installable as `javascript:` URL content.
2. Runtime should avoid broad host-page mutation.
3. Repeated invocation must be deliberate (idempotent/toggle behavior as needed).
4. Avoid global namespace pollution.

## UI and CSS Isolation

1. Any injected UI must mount into a dedicated host element.
2. UI styles should live in a Shadow Root.
3. Avoid page-wide selectors and CSS collisions.
4. Provide cleanup paths for event listeners, timers, observers, and injected nodes.
5. Do not use `innerHTML` or `insertAdjacentHTML`; create UI with DOM APIs.

## Shared Code Rules

1. Keep new logic local first.
2. Shared extraction requires proven reuse and clear naming.
3. Group shared code by behavior (`dom`, `ui`, `text`, `math`, `browser`).
4. Avoid catch-all utility files.
5. Add brief value-focused JSDoc to helper methods.

## Testing Rules

1. New non-UI logic must include unit tests.
2. Prefer fast Bun tests for pure logic and transformation helpers.
3. Keep UI-heavy behavior modular so non-UI portions remain testable.

## Error Handling and Diagnostics

1. Fail clearly when user impact is high.
2. Avoid silent failures that block debugging.
3. Keep production logging concise.

## Done Criteria

Code is done when it is correct, isolated, buildable, test-covered where applicable, understandable, and compliant with these standards.
