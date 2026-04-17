# AGENTS.md

This is the high-signal entrypoint for coding agents working in this bookmarklets workspace.

## Summary Rules

1. Follow [CONSTITUTION.md](./CONSTITUTION.md) first.
2. Use JavaScript modules in source and Bun for bundling/tests.
3. Keep bookmarklets standalone first; extract shared code only after reuse is proven.
4. Bundle each bookmarklet from `src/bookmarklets/*` into `dist/` as one installable payload.
5. Use Shadow DOM for injected UI and CSS isolation.
6. Never use `innerHTML`/`insertAdjacentHTML`; build UI via DOM APIs.
7. For each new non-UI logic path, add or update Bun unit tests.
8. Periodically review existing and recent bookmarklets for safe shared refactoring opportunities.
9. Keep changes local and minimal; avoid speculative architecture.
10. Update docs when repository shape, rules, or workflow changes.

## Required Reading Order

1. [CONSTITUTION.md](./CONSTITUTION.md)
2. [docs/agent-guide.md](./docs/agent-guide.md)
3. [docs/project-standards.md](./docs/project-standards.md)
4. [docs/architecture.md](./docs/architecture.md)
5. [docs/refactoring-policy.md](./docs/refactoring-policy.md)
6. [docs/release-checklist.md](./docs/release-checklist.md)
7. [docs/build-workflow.md](./docs/build-workflow.md)

## Folder Intent

- `src/bookmarklets/`: one folder per bookmarklet.
- `src/shared/`: proven reusable modules only.
- `dist/`: generated output.
- `docs/`: detailed operating instructions.
- `tests/`: Bun unit tests for non-UI logic.
