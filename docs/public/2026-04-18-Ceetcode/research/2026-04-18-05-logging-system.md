# Logging System Decision Record (2026-04-18)

## Scope

Implemented `suggestions004.md` logging and tracing request across browser app, worker client, and workers.

## Decision Summary

- Added centralized logging module: `runtime/logging.ts`.
- Added runtime-configurable log settings with persistence:
  - level: `error | warn | info`
  - formatter: `segments | emoji | plain`
  - toggles: `useDecorativeEmoji`, `useLabelBackgrounds`
- Added settings UI in `app/main.ts` using native `<dialog>`, with immediate apply and no save button.
- Added broad instrumentation at operational boundaries (bootstrap, problem switching, run lifecycle, worker lifecycle, fallback/error paths, settings changes).

## Why this design

- Centralizes formatting/filtering/persistence to avoid fragmented `console.*` conventions.
- Keeps default output conservative (`error` only) as required.
- Keeps formatter architecture pluggable for future styles.
- Keeps context payload compact via serializer in logger module.

## Notable behavior details

- Project marker is always `🍇`.
- Message shape always contains project identity, level, scope, message, optional context JSON, and local ISO-like timestamp.
- Logging settings are stored under `ceetcode:logging_settings`.
- Runtime updates are propagated immediately via subscription hooks.

## Validation performed

- Typecheck passed: `npx tsc --noEmit`
- Acceptance suite updated with settings persistence scenario.

## Follow-up opportunities

- Add optional remote export hook for collected logs in exploratory sessions.
- Add optional log buffering panel (separate from unhandled error panel) if required by future specs.
