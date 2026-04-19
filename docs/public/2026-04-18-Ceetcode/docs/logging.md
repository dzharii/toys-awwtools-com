# Logging Guide

This project uses a centralized browser logging system from [`runtime/logging.ts`](../runtime/logging.ts).

## Goals

- Keep logs readable and consistent.
- Keep runtime tracing useful without noise.
- Keep logging preferences configurable and persisted.

## Message Contract

Each message is normalized to:

`🍇[Ceetcode][LEVEL][Category/Subcategory] message {"context":"..."} (local-iso-like-time)`

The grape marker is always present. The level and scope are always visible.

## Levels and Visibility

- `error`: errors only (default)
- `warn`: warnings + errors
- `info`: info + warnings + errors

Default level is `error` and is loaded on startup from local storage key `ceetcode:logging_settings`.

## Formatter Styles

- `segments`: styled console labels (default)
- `emoji`: readable emoji-accent labels
- `plain`: plain-text line format

Decorative toggles:

- `useDecorativeEmoji`
- `useLabelBackgrounds`

## API (Real Usage)

```ts
import { createLogger, updateLoggingSettings, getLoggingSettings } from "../runtime/logging";

const runLog = createLogger("Run", "Submission");

runLog.info("Compilation started", {
  subcategory: "Compile",
  context: { runId, problemId, totalTests }
});

runLog.warn("Compilation finished with diagnostics", {
  subcategory: "Compile",
  context: { runId, diagnostics: compilePayload.diagnostics.length }
});

runLog.error("Run worker request failed", {
  subcategory: "Runtime",
  context: { runId, message: runMessage, error }
});

updateLoggingSettings({ level: "info", formatter: "plain" });
const current = getLoggingSettings();
```

## Scope and Context Rules

- Use meaningful categories (`Run`, `WorkerClient`, `Settings`, `Persistence`, `Harness`, `UI`, `App`).
- Use subcategories for operation boundaries (`Compile`, `Runtime`, `Summary`, `Dialog`, `Preferences`).
- Include compact context only for key values.
- Do not dump full large objects. Keep payloads small and action-oriented.

## Where to Add Logs

Log boundaries and state changes, not every line:

- app bootstrap and teardown
- problem load/switch
- run start/compile start/compile result/run result/summary
- worker lifecycle and worker request exchange
- settings changes and persistence failures
- runtime fallback/error paths

## UI Integration

Logging settings are controlled in the app `Settings` dialog (`app/main.ts`) and apply immediately.

`window.ceetcodeDebug.getLoggingSettings()` is available for test/runtime inspection.
