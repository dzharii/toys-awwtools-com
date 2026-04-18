# Dependency and Tooling Rationale

This document lists project dependencies and why each one is used.

## Runtime dependencies (`package.json`)

- `@codemirror/state`
  - editor document model and state management.
- `@codemirror/view`
  - browser editor rendering and interaction layer.
- `@codemirror/language`
  - language support infrastructure (indentation, folding, parsing glue).
- `@codemirror/lang-cpp`
  - C/C++ syntax support used for C99 authoring UX.
- `@codemirror/commands`
  - editor commands/keymaps (history, run shortcut integration).
- `marked`
  - markdown rendering for problem statements/examples/constraints.
- `zod`
  - runtime schema validation for problems, tests, and custom test inputs.

## Development and test dependencies

- `typescript`
  - static type checking across app/runtime/worker/test code.
- `playwright`
  - browser automation runtime.
- `@playwright/test`
  - test runner, fixtures, assertions, tracing, screenshots.

## Vendored toolchain dependencies

- `vendor/wasm-clang`
  - browser-hosted clang/lld/memfs/sysroot backend used for compile + run path.
- `vendor/tinycc`
  - vendored research path for TCC feasibility evaluation and documentation.

Pinned versions for vendored sources are tracked in:
- `vendor/meta/versions.json`

## Build and orchestration tools

- Bun CLI (`bun build`)
  - fast bundling of main app and worker scripts.
- Node.js scripts in `scripts/`
  - build orchestration, static server, browser test runner, vendor metadata validation.
- npm scripts
  - consistent entry points for build/test/serve/validate workflows.

## Why this stack

- Browser-native execution requires worker-based boundaries and Wasm-compatible compile/runtime assets.
- CodeMirror provides a strong editor foundation without heavy framework lock-in.
- Zod prevents silent schema drift in problem/test definitions.
- Playwright provides high-confidence end-to-end validation with diagnostics artifacts.
- Vendoring compiler artifacts reduces runtime CDN dependency and improves reproducibility.
