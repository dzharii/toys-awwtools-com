# Ceetcode (2026-04-18)

Ceetcode is a browser-native C99 problem-practice hub built as a fully static product.

This repository version is a **Codex experiment** focused on high-confidence edit-run-debug loops for single-function C99 practice problems, with browser-only compilation and execution.

## Product Positioning

Ceetcode is designed as a focused C99 practice workspace for algorithm-style function problems:
- read a structured prompt,
- implement one function,
- run deterministic tests,
- inspect diagnostics and iterate quickly.

## Features

- Browser-only compile and run pipeline (no server-side compile/execute step).
- Dedicated compile and runtime workers to keep UI interaction responsive.
- Problem statement panel, code editor panel, and test/output feedback in one screen.
- Harness-driven deterministic test execution with structured pass/fail summaries.
- Visible sample tests plus editable custom tests per problem.
- Compile diagnostics with severity and source position metadata.
- Draft persistence per problem and last-opened problem restoration.
- Offline-capable static assets via service worker caching.
- Acceptance browser tests with automatic failure on browser console/runtime errors.

## Inspiration and Attribution

Ceetcode is inspired by online coding-practice platforms, including LeetCode, HackerRank, and Codewars, while being implemented as an independent static C99 browser product.

All product and company names above are trademarks of their respective owners. No affiliation or endorsement is claimed.

## Documentation Index

- [`docs/architecture.md`](docs/architecture.md): runtime architecture, worker model, harness pipeline, adapter boundary.
- [`docs/problem-authoring.md`](docs/problem-authoring.md): how to add a new problem safely, schema rules, authoring checklist, and validation steps.
- [`docs/deployment-static-hosting.md`](docs/deployment-static-hosting.md): build, deploy, and host this project on static platforms.
- [`docs/runtime-c99-support.md`](docs/runtime-c99-support.md): current C99 runtime/library support status and limitations.
- [`docs/testing.md`](docs/testing.md): acceptance and exploratory browser testing strategy and commands.
- [`docs/acceptance-checklist.md`](docs/acceptance-checklist.md): milestone-oriented acceptance coverage summary.
- [`docs/dependency-rationale.md`](docs/dependency-rationale.md): all dependencies/tools used and why each is part of the stack.
- [`docs/licensing-and-attribution.md`](docs/licensing-and-attribution.md): vendored artifact licensing status and attribution references.
- [`research/`](research/): append-only technical investigations and decision history.

## Quick Start

```bash
npm install
npm run validate
npm run build
npm run serve:dist
```

Then open `http://127.0.0.1:4173/`.

For GitHub Pages in this repository, publish and open:
- `/public/2026-04-18-Ceetcode/dist/`

## Testing

```bash
npm run test:acceptance
npm run test:e2e
npm run test:exploratory
```

- `test:acceptance`: critical tagged acceptance scenarios.
- `test:e2e`: full Playwright suite.
- `test:exploratory`: creates an exploratory session template.

## Development Approach

This project uses an evidence-first development loop:
1. implement a concrete behavior,
2. verify with automated browser tests and diagnostics,
3. document architecture decisions and tradeoffs in `research/`,
4. keep compiler/runtime integration replaceable via a bounded adapter layer.

The goal is shipping a working browser product while preserving backend replaceability and explicit technical reasoning.

## Release Workflow (GitHub Pages)

This project uses manual static artifact publishing.

1. Run `npm run build`.
2. Run `npm run test:acceptance`.
3. Commit source changes **and** updated `dist/`.
4. Push to the repository so Pages serves the new build from `/dist/`.

## Tools and Dependencies Used

See [`docs/dependency-rationale.md`](docs/dependency-rationale.md) for the complete dependency inventory and rationale, including:
- runtime packages,
- development/testing packages,
- vendored compiler/runtime artifacts,
- build and validation tooling.

## Licensing and Third-Party Components

See [`docs/licensing-and-attribution.md`](docs/licensing-and-attribution.md) for vendored source/license references and version pinning pointers.
