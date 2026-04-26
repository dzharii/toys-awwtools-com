# Observability

Topic Research Notepad includes structured proof-of-concept logging so startup,
storage, paste, search, export, and UI failures can be diagnosed from the
browser console.

## Logger Shape

Owned modules use scoped loggers from `src/observability/logger.js`.
Messages carry a level, category, optional subcategory, message, compact JSON
context, and timestamp. The Worker loads `src/observability/worker-logger.js`
because it runs as a classic Worker script.

Levels are `error`, `warn`, `info`, and `debug`. The default level is `debug`
for evaluation builds. Console formatting defaults to segmented styled output
with a plain fallback available.

## Debug Hook

The app exposes safe development helpers at `window.trnDebug`:

```js
trnDebug.getLoggingSettings();
trnDebug.updateLoggingSettings({ level: "info" });
trnDebug.updateLoggingSettings({ formatter: "plain" });
trnDebug.getRuntimeSnapshot();
```

Logging settings are persisted in `localStorage` under
`topicResearchNotepad.loggingSettings`. If `localStorage` is unavailable, the
logger falls back to defaults and does not block the app.

## Startup Failure Diagnosis

For storage startup failures, open the console and look for:

- `App/Bootstrap` entries for browser feature detection and Worker URL.
- `StorageClient/WorkerBridge` entries for outgoing requests and responses.
- `StorageWorker` entries for Worker script load, protocol version, and Dexie availability.
- `Persistence` entries for database open, workspace load, and transaction failures.

The previous failure pattern, `db.pages.where(...).equals(...).catch is not a
function`, was caused by treating a Dexie query chain as a Promise before a
terminal async method. Workspace loading now calls `toArray()` and filters the
records in memory, which is valid for the current schema and avoids that
startup crash.

## User-Facing Errors

The status strip stays concise. Technical details are logged at the boundary
where the error is caught, with normalized error context and the relevant page,
block, request, or operation identifiers.
