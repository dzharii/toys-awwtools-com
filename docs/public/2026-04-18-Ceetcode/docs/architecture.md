# Architecture

## Product boundary

- Static-site deployment only.
- No server-side compile/run.
- Single editable C source file per problem.
- Harness-driven test invocation.

## Runtime pipeline

1. UI collects source + selected problem + tests.
2. Compile worker generates a full C translation unit (user code + hidden harness `main`).
3. Compile worker invokes browser-hosted clang/lld (from `wasm-clang`) and produces a Wasm binary.
4. Run worker instantiates the produced Wasm and executes it in a worker-managed WASI-like runtime.
5. Harness markers in output are parsed into structured per-test results.

## Isolation model

- Compile and run both execute off the main thread.
- Worker failures are handled via timeout + worker reset.
- Main thread remains responsive for typing/scrolling/rendering.

## Adapter boundary

`runtime/compiler/worker-client.ts` is the backend boundary consumed by the UI.

This keeps the following stable when backend changes:
- Problem schema
- Harness model
- Result rendering
- Persistence
- Interaction loop

## Data model

- Problem definitions: `problems/catalog.ts`
- Signature metadata and test schema: `runtime/types.ts`
- Harness source generation: `runtime/harness/generate-harness.ts`
- Harness output parsing: `runtime/harness/parse-harness-output.ts`

## Caching and offline

- Service worker (`sw.js`) caches app shell and compiler artifacts.
- Compiler assets are local files in `dist/vendor/wasm-clang/`.
- Drafts/custom tests/selected problem are persisted in `localStorage`.

## Observability

- Centralized logging lives in `runtime/logging.ts`.
- Runtime log settings (level, formatter, decorative toggles) are persisted in `localStorage` key `ceetcode:logging_settings`.
- UI settings are applied immediately through the Settings dialog in `app/main.ts`.
