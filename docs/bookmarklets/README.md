# Bookmarklets Workspace

This folder contains a Bun-powered workspace for building browser bookmarklets from modern JavaScript modules into single-file bookmarklet payloads.

## Goals

- Keep each bookmarklet independent by default.
- Share code only after real reuse is proven.
- Build installable `javascript:` payloads with Bun.
- Isolate UI with Shadow DOM to avoid host-page CSS collisions.
- Keep non-UI logic testable and covered by Bun tests.

## Read First

1. [AGENTS.md](./AGENTS.md)
2. [CONSTITUTION.md](./CONSTITUTION.md)
3. [docs/agent-guide.md](./docs/agent-guide.md)
4. [docs/project-standards.md](./docs/project-standards.md)
5. [docs/architecture.md](./docs/architecture.md)
6. [docs/refactoring-policy.md](./docs/refactoring-policy.md)
7. [docs/release-checklist.md](./docs/release-checklist.md)

## Quick Start

```bash
bun run new 2026-04-16-example-tool
bun run build
bun test
```

Build output is written to `dist/`:

- `<name>.bundle.js`
- `<name>.bookmarklet.txt`
