2026-04-26

A00 Change Request: Telemetry and Observability Upgrade for Topic Research Notepad

---

This change request directs Codex to significantly improve telemetry, logging, and observability across the Topic Research Notepad codebase.

The current implementation failed in a way that was not diagnosable from the browser console. The UI displayed an error, but the console did not provide enough structured detail to understand where the failure occurred, what operation was running, what parameters were involved, what storage path was attempted, or what recovery behavior was triggered. This is unacceptable for the next implementation pass.

The immediate objective is to make the application observable during development and proof-of-concept evaluation. Codex should inspect every owned module and add structured logging around application startup, UI actions, storage initialization, Worker messaging, IndexedDB operations, page and block mutations, paste conversion, search indexing, export, backup, error states, and fallback behavior.

The provided TypeScript logging example should be used as the design reference for the JavaScript implementation. The example defines levels, formatter modes, persisted logging settings, structured context payloads, compact JSON serialization, scoped loggers, and styled console output. Codex should adapt this idea into modern JavaScript with JSDoc types. The implementation does not need to copy the example exactly, but it should preserve the important properties: scoped loggers, log levels, readable categories, compact JSON context, colored segmented console output, safe serialization, settings persistence, and simple usage from any module. 

---

B00 Problem Statement

---

The application currently exposes an internal failure only as a user-facing message:

`db.pages.where(...).equals(...).catch is not a function`

The status strip then says storage is unavailable, but the browser console does not show useful diagnostic logs. This means the implementation does not reveal whether the failure came from Dexie API misuse, an unexpected return type, a Worker/client mismatch, a schema initialization issue, a promise-chain mistake, a missing adapter branch, or an error swallowed by the UI.

The next implementation pass must treat observability as a first-class requirement. It must be possible to open the browser console and reconstruct the lifecycle of the app from startup to failure. When something fails, the logs should show what operation started, what module owned it, what inputs were relevant, what step failed, what exception was thrown, and what fallback or user-facing error was produced.

The goal is not noisy random `console.log` calls. The goal is structured development telemetry that can explain the system.

---

C00 Required Outcome

---

After this change, the browser console should provide a useful chronological trace of the app's behavior.

A developer should be able to answer these questions from logs:

Which app build/version started?

Was Dexie found?

Was IndexedDB available?

Was the storage Worker created?

Did the Worker protocol handshake succeed?

What database name and schema version were opened?

Which stores were found or initialized?

Which page list query ran?

Which storage operation failed?

What Dexie query chain was attempted?

Which UI action triggered the operation?

Which page ID or block ID was involved?

Was the error caught, wrapped, and surfaced to the UI?

Did the app enter degraded mode?

What can the developer inspect next?

Codex should implement enough logging to answer these questions without requiring breakpoints.

---

D00 Logging Module Requirement

---

Codex must add a dedicated logging module. The project should not use scattered raw `console.log` calls directly throughout the codebase except inside the logging module itself.

A recommended filename is `src/observability/logger.js`, `src/logger.js`, or another location coherent with the project structure.

The module should be written in modern JavaScript and documented with JSDoc typedefs. It should provide at least these public APIs:

```js
/**
 * @typedef {"error" | "warn" | "info" | "debug"} LogLevel
 */

/**
 * @typedef {"plain" | "segments"} LogFormatterName
 */

/**
 * @typedef {Object} LogOptions
 * @property {string=} subcategory
 * @property {Record<string, unknown>=} context
 */

/**
 * @typedef {Object} Logger
 * @property {(message: string, options?: LogOptions) => void} error
 * @property {(message: string, options?: LogOptions) => void} warn
 * @property {(message: string, options?: LogOptions) => void} info
 * @property {(message: string, options?: LogOptions) => void} debug
 * @property {(subcategory: string) => Logger} withSubcategory
 */
```

The public API should include:

```js
createLogger(category, defaultSubcategory)
getLoggingSettings()
setLoggingSettings(next)
updateLoggingSettings(patch)
subscribeLoggingSettings(listener)
```

The default logging level for proof-of-concept development should be `debug` or `info`, not `error`. The current failure mode shows why: an error-only default hides the sequence that led to the failure. If Codex chooses `info` as the default, it must provide an obvious way to switch to `debug` from the console or UI.

A recommended global development hook is:

```js
window.trnDebug = {
  getLoggingSettings,
  setLoggingSettings,
  updateLoggingSettings
};
```

This hook should only expose safe debugging utilities. It should not expose destructive database reset by default.

---

E00 Log Levels

---

The logging module should support four levels.

`error` means an operation failed or the app entered a degraded state. Use it for caught exceptions, failed IndexedDB writes, failed Worker initialization, failed migrations, failed exports, and user-visible errors.

`warn` means behavior is abnormal but the app can continue. Use it for fallback paths, missing optional APIs, unknown block types, malformed records that were normalized, large paste simplification, unavailable Worker fallback, and recoverable validation issues.

`info` means a major lifecycle event or user-visible operation happened. Use it for app startup, database ready, page created, page selected, export completed, backup completed, search performed, and storage mode selected.

`debug` means detailed internal trace useful during implementation. Use it for function entry, message payloads, normalized records, query parameters, debounce scheduling, flush decisions, search index extraction, and paste conversion details.

The logger should render a message only when the event level is at or above the configured threshold. The proof-of-concept default should allow enough information to diagnose startup and storage failures.

---

F00 Logger Formatting

---

Codex should implement segmented styled console logs similar to the provided logging example. The example uses a project marker, project label, level label, category/subcategory scope, message, compact JSON context, and timestamp. 

For this project, use a project label such as `TopicResearchNotepad` or `TRN`.

Recommended visual format:

```js
%c▣ TRN %c INFO %c Storage/Init %c Opening IndexedDB %c {"dbName":"TopicResearchNotepadDB","dbVersion":1} %c 2026-04-26T05:17:02.252+00:00
```

Recommended colors:

```js
const levelColor =
  level === "error" ? "#b42318" :
  level === "warn" ? "#b54708" :
  level === "info" ? "#175cd3" :
  "#475467";
```

Codex may adjust colors to match the retro framework, but the level distinction should remain visible.

The formatter must support at least a plain fallback and a segmented styled mode. Segmented mode should be default in modern browsers.

---

G00 Compact Context Serialization

---

The logger must support structured context. Codex should avoid string-concatenating complex objects into messages. Instead, callers should pass context objects:

```js
logger.info("Loading page list", {
  context: {
    includeArchived: false,
    orderBy: "sortOrder"
  }
});
```

The logger should serialize context with a safe compact JSON function. It should handle:

Error objects.

BigInt values.

Long strings.

Long arrays.

Large objects.

Circular or unserializable values.

A required helper should be similar to:

```js
function compactJson(value) {
  try {
    return JSON.stringify(value, (_key, raw) => {
      if (typeof raw === "bigint") return raw.toString();

      if (raw instanceof Error) {
        return {
          name: raw.name,
          message: raw.message,
          stack: raw.stack ? raw.stack.split("\n").slice(0, 6).join(" | ") : ""
        };
      }

      if (typeof raw === "string") {
        return raw.length > 240 ? `${raw.slice(0, 237)}...` : raw;
      }

      if (Array.isArray(raw)) {
        return raw.length <= 20 ? raw : [...raw.slice(0, 20), `...(${raw.length - 20} more)`];
      }

      if (raw && typeof raw === "object") {
        const entries = Object.entries(raw);
        if (entries.length <= 20) return raw;

        const compact = {};
        for (const [key, entryValue] of entries.slice(0, 20)) {
          compact[key] = entryValue;
        }
        compact.__moreKeys = entries.length - 20;
        return compact;
      }

      return raw;
    });
  } catch {
    return "{\"context\":\"unserializable\"}";
  }
}
```

The exact limits may vary. The key requirement is that logs remain readable and safe.

---

H00 Logger Categories

---

Codex should create scoped loggers per module or subsystem. Every owned module should use a relevant category.

Recommended categories are:

`App` for bootstrap and lifecycle.

`UI` for shell, sidebar, editor, status strip, and user actions.

`StorageClient` for main-thread storage adapter and Worker request handling.

`StorageWorker` for Worker startup, message handling, and response generation.

`IndexedDB` or `Persistence` for Dexie schema, transactions, and repository operations.

`Models` for record factories and normalization.

`Autosave` for debounce, dirty state, flush, and save-status transitions.

`Paste` for clipboard parsing, sanitization, and block conversion.

`Search` for search index extraction, search queries, and result navigation.

`Export` for Markdown export and JSON backup.

`Framework` for retro UI component integration and UI-library changes.

`Runtime` for environment detection, feature detection, and fallback paths.

A logger should be created near the top of each module:

```js
import { createLogger } from "./observability/logger.js";

const logger = createLogger("StorageClient");
const workerLogger = logger.withSubcategory("WorkerBridge");
```

---

I00 Minimum Logging Coverage by Area

---

Codex should inspect all owned files and add logs to the following areas.

Application startup must log:

App bootstrap start.

Build/version constants.

Browser feature detection results.

Dexie availability.

IndexedDB availability.

Worker support availability.

Selected storage mode.

App bootstrap success.

App bootstrap failure.

Storage initialization must log:

Storage client creation.

Worker creation attempt.

Worker URL/path.

Worker handshake request.

Worker handshake response.

Protocol version mismatch.

Fallback to direct storage adapter if implemented.

Dexie database open start.

Dexie database open success.

Dexie database open failure.

Schema version.

Database name.

Page loading must log:

Page list request start.

Page list result count.

Selected page ID lookup.

Page-with-blocks request start.

Loaded block count.

Empty database state.

Page creation must log:

Create page user action.

Create page request payload summary.

Page record created.

Initial block created if applicable.

Search index entry created.

Selected page setting updated.

Page creation failure.

Block editing must log:

Block edit detected at debug level.

Block save scheduled.

Existing save debounce replaced.

Block save flush start.

Block save success.

Block save failure.

Block revision or dirty state transition if implemented.

Paste must log:

Paste event received.

Clipboard formats available.

HTML parse start.

Sanitization summary.

Converted block count by type.

Fallback to plain text.

Large paste warning.

Batch insert start.

Batch insert success.

Batch insert failure.

Search must log:

Search query received.

Search index row count considered, if useful.

Search result count.

Search failure.

Search index rebuild start and success if implemented.

Export must log:

Markdown export requested.

Pending writes flush before export.

Export block count.

Export success.

Export failure.

JSON backup requested.

Backup record counts.

Backup success.

Backup failure.

UI errors must log:

Every user-visible error message.

Every transition to degraded mode.

Every fallback from Worker to direct storage.

Every unknown block fallback.

Every malformed record normalization warning.

---

J00 Logging Before, During, and After Operations

---

Codex should follow a consistent operation logging pattern.

Before starting a significant operation, log intent and parameters:

```js
logger.info("Creating page", {
  context: {
    title,
    createInitialBlock
  }
});
```

During the operation, log important internal milestones at `debug` level:

```js
logger.debug("Generated page record", {
  context: {
    pageId: page.id,
    sortOrder: page.sortOrder
  }
});
```

After success, log the result:

```js
logger.info("Page created", {
  context: {
    pageId: page.id,
    blockCount: blocks.length
  }
});
```

On failure, log the error and relevant context:

```js
logger.error("Page creation failed", {
  context: {
    title,
    error
  }
});
```

This pattern should apply to storage operations, Worker messages, UI actions, paste conversion, search, and export.

---

K00 Worker Message Observability

---

Worker communication must be observable.

The storage client should log outgoing requests:

```js
logger.debug("Sending worker request", {
  context: {
    requestId,
    type,
    payload: summarizePayload(payload)
  }
});
```

The storage client should log incoming responses:

```js
logger.debug("Received worker response", {
  context: {
    requestId,
    type,
    ok,
    durationMs
  }
});
```

The Worker should log received messages:

```js
logger.debug("Worker received request", {
  context: {
    requestId,
    type
  }
});
```

The Worker should log handler completion:

```js
logger.debug("Worker completed request", {
  context: {
    requestId,
    type,
    durationMs
  }
});
```

The Worker should log handler failure:

```js
logger.error("Worker request failed", {
  context: {
    requestId,
    type,
    error
  }
});
```

If logging code is shared between main thread and Worker, it must not assume `window` exists. The provided example has a `getStorage()` guard for non-window contexts. Codex should preserve that idea. 

---

L00 Dexie and IndexedDB Observability

---

The current visible failure strongly suggests that Dexie query behavior must be logged more carefully.

Every repository function should log its operation name, inputs, and failure. Examples:

```js
const logger = createLogger("Persistence", "Pages");

export async function listVisiblePages() {
  logger.debug("Listing visible pages", {
    context: {
      archivedAt: null,
      order: "sortOrder"
    }
  });

  try {
    const pages = await db.pages
      .where("archivedAt")
      .equals(null)
      .sortBy("sortOrder");

    logger.info("Listed visible pages", {
      context: {
        count: pages.length
      }
    });

    return pages;
  } catch (error) {
    logger.error("Failed to list visible pages", {
      context: {
        error
      }
    });
    throw error;
  }
}
```

Codex must verify correct Dexie API usage while adding logs. The specific error `catch is not a function` often means the code called `.catch` on an object that is not a Promise. Dexie collection chains should be awaited at the point where they produce a promise, such as `toArray()`, `sortBy()`, `first()`, or another terminal async operation. The logging pass should include a direct review of every Dexie call chain to make sure promise handling is correct.

Codex should add logs around:

Database construction.

`db.version(...).stores(...)`.

`db.open()`.

Transactions.

Every `add`, `put`, `update`, `delete`, `bulkAdd`, `bulkPut`, `where`, `equals`, `toArray`, `sortBy`, and compound-index query.

Migration code.

Search index rebuilds.

Settings reads and writes.

---

M00 UI Status and Console Log Alignment

---

Every user-facing error should have a corresponding console error log with more detail.

If the UI displays:

`failed: Storage unavailable`

The console must contain something like:

```js
logger.error("Storage unavailable", {
  context: {
    phase: "listPages",
    storageMode: "worker",
    dbName: "TopicResearchNotepadDB",
    error
  }
});
```

The status strip should remain concise. The console should carry technical detail.

Codex should audit all places where the UI sets an error message. Every such place should also call the logger unless the error has already been logged at the boundary with equivalent context.

---

N00 Logging Settings Persistence

---

The logger should persist settings in localStorage if available. This is only for logging configuration, not app data. If localStorage is unavailable, the logger should fall back to defaults without throwing.

Recommended storage key:

```js
const loggingStorageKey = "topicResearchNotepad.loggingSettings";
```

Recommended default settings:

```js
const defaultLoggingSettings = {
  level: "debug",
  formatter: "segments",
  useDecorativeMarker: true,
  useLabelBackgrounds: true
};
```

For the proof of concept, `debug` is acceptable as the default because the priority is diagnosis. If logs become too noisy, the setting can be changed from the console:

```js
window.trnDebug.updateLoggingSettings({ level: "info" });
```

The logger should expose current settings:

```js
window.trnDebug.getLoggingSettings();
```

---

O00 Suggested JavaScript Logger Skeleton

---

Codex may use this skeleton as a starting point. It should adapt paths, naming, and build conventions to the actual codebase.

```js
const loggingLevels = ["error", "warn", "info", "debug"];
const loggingFormatterNames = ["plain", "segments"];

const projectMarker = "▣";
const projectLabel = "TRN";
const loggingStorageKey = "topicResearchNotepad.loggingSettings";

const levelWeight = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

const defaultLoggingSettings = {
  level: "debug",
  formatter: "segments",
  useDecorativeMarker: true,
  useLabelBackgrounds: true
};

const listeners = new Set();
let currentSettings = loadPersistedSettings();

function getStorage() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isLoggingLevel(value) {
  return typeof value === "string" && loggingLevels.includes(value);
}

function isFormatter(value) {
  return typeof value === "string" && loggingFormatterNames.includes(value);
}

function normalizeSettings(input = {}) {
  return {
    level: isLoggingLevel(input.level) ? input.level : defaultLoggingSettings.level,
    formatter: isFormatter(input.formatter) ? input.formatter : defaultLoggingSettings.formatter,
    useDecorativeMarker:
      typeof input.useDecorativeMarker === "boolean"
        ? input.useDecorativeMarker
        : defaultLoggingSettings.useDecorativeMarker,
    useLabelBackgrounds:
      typeof input.useLabelBackgrounds === "boolean"
        ? input.useLabelBackgrounds
        : defaultLoggingSettings.useLabelBackgrounds
  };
}

function loadPersistedSettings() {
  const storage = getStorage();
  if (!storage) return { ...defaultLoggingSettings };

  try {
    const raw = storage.getItem(loggingStorageKey);
    return raw ? normalizeSettings(JSON.parse(raw)) : { ...defaultLoggingSettings };
  } catch {
    return { ...defaultLoggingSettings };
  }
}

function persistSettings(settings) {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(loggingStorageKey, JSON.stringify(settings));
  } catch {
    // Logging settings persistence must never break the app.
  }
}

function localIsoLike(timestamp) {
  const pad2 = (value) => String(value).padStart(2, "0");
  const pad3 = (value) => String(value).padStart(3, "0");

  const offsetMinutes = -timestamp.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absOffset = Math.abs(offsetMinutes);

  return (
    `${timestamp.getFullYear()}-${pad2(timestamp.getMonth() + 1)}-${pad2(timestamp.getDate())}` +
    `T${pad2(timestamp.getHours())}:${pad2(timestamp.getMinutes())}:${pad2(timestamp.getSeconds())}` +
    `.${pad3(timestamp.getMilliseconds())}${sign}${pad2(Math.floor(absOffset / 60))}:${pad2(absOffset % 60)}`
  );
}

function compactJson(value) {
  try {
    return JSON.stringify(value, (_key, raw) => {
      if (typeof raw === "bigint") return raw.toString();

      if (raw instanceof Error) {
        return {
          name: raw.name,
          message: raw.message,
          stack: raw.stack ? raw.stack.split("\n").slice(0, 6).join(" | ") : ""
        };
      }

      if (typeof raw === "string") {
        return raw.length > 240 ? `${raw.slice(0, 237)}...` : raw;
      }

      if (Array.isArray(raw)) {
        return raw.length <= 20 ? raw : [...raw.slice(0, 20), `...(${raw.length - 20} more)`];
      }

      if (raw && typeof raw === "object") {
        const entries = Object.entries(raw);
        if (entries.length <= 20) return raw;

        const compact = {};
        for (const [key, entryValue] of entries.slice(0, 20)) {
          compact[key] = entryValue;
        }
        compact.__moreKeys = entries.length - 20;
        return compact;
      }

      return raw;
    });
  } catch {
    return "{\"context\":\"unserializable\"}";
  }
}

function segmentStyle(baseColor, useBackground) {
  if (!useBackground) {
    return `color:${baseColor};font-weight:600;`;
  }

  return (
    `color:${baseColor};` +
    `background:color-mix(in srgb, ${baseColor} 14%, transparent);` +
    "padding:1px 4px;border-radius:4px;font-weight:700;"
  );
}

function shouldRender(level, threshold) {
  return levelWeight[level] <= levelWeight[threshold];
}

function scopeLabel(event) {
  return `${event.category}/${event.subcategory}`;
}

function levelLabel(level) {
  return level.toUpperCase();
}

function formatSegments(event, settings) {
  const levelColor =
    event.level === "error" ? "#b42318" :
    event.level === "warn" ? "#b54708" :
    event.level === "info" ? "#175cd3" :
    "#475467";

  const contextText = event.context ? compactJson(event.context) : "";
  const timestamp = localIsoLike(event.timestamp);

  const format =
    `%c${projectMarker} ${projectLabel}` +
    `%c ${levelLabel(event.level)}` +
    `%c ${scopeLabel(event)}` +
    `%c ${event.message}` +
    (contextText ? `%c ${contextText}` : "") +
    `%c ${timestamp}`;

  const args = [
    format,
    segmentStyle("#5e35b1", settings.useLabelBackgrounds),
    segmentStyle(levelColor, settings.useLabelBackgrounds),
    segmentStyle("#0f766e", settings.useLabelBackgrounds),
    "color:#101828;font-weight:500;"
  ];

  if (contextText) {
    args.push("color:#155eef;font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;");
  }

  args.push("color:#667085;font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;");
  return args;
}

function formatPlain(event) {
  const contextText = event.context ? ` ${compactJson(event.context)}` : "";
  return [
    `${projectMarker}[${projectLabel}][${levelLabel(event.level)}][${scopeLabel(event)}] ` +
    `${event.message}${contextText} (${localIsoLike(event.timestamp)})`
  ];
}

function emitLog(event) {
  const settings = currentSettings;
  if (!shouldRender(event.level, settings.level)) return;

  const rendered = settings.formatter === "plain"
    ? formatPlain(event)
    : formatSegments(event, settings);

  console.log(...rendered);
}

function normalizeLabel(value, fallback) {
  const trimmed = String(value ?? "").trim();
  return trimmed ? trimmed : fallback;
}

function write(level, category, baseSubcategory, message, options = {}) {
  emitLog({
    level,
    category: normalizeLabel(category, "General"),
    subcategory: normalizeLabel(options.subcategory ?? baseSubcategory, "General"),
    message: normalizeLabel(message, "(empty message)"),
    context: options.context,
    timestamp: new Date()
  });
}

export function getLoggingSettings() {
  return { ...currentSettings };
}

export function setLoggingSettings(next) {
  const normalized = normalizeSettings(next);
  currentSettings = normalized;
  persistSettings(normalized);

  for (const listener of listeners) {
    listener({ ...normalized });
  }

  return { ...normalized };
}

export function updateLoggingSettings(patch) {
  return setLoggingSettings({ ...currentSettings, ...patch });
}

export function subscribeLoggingSettings(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function createLogger(category, defaultSubcategory = "General") {
  const normalizedCategory = normalizeLabel(category, "General");
  const normalizedSubcategory = normalizeLabel(defaultSubcategory, "General");

  return {
    error: (message, options) => write("error", normalizedCategory, normalizedSubcategory, message, options),
    warn: (message, options) => write("warn", normalizedCategory, normalizedSubcategory, message, options),
    info: (message, options) => write("info", normalizedCategory, normalizedSubcategory, message, options),
    debug: (message, options) => write("debug", normalizedCategory, normalizedSubcategory, message, options),
    withSubcategory: (subcategory) => createLogger(normalizedCategory, subcategory)
  };
}
```

This skeleton must be adapted to the actual project structure. If the Worker cannot import the same module due to bundling constraints, Codex should create a Worker-compatible logging adapter with the same formatter behavior or a simplified equivalent.

---

P00 Required Debug Utilities

---

Codex should expose a minimal safe debug surface in development builds or proof-of-concept builds.

Recommended:

```js
window.trnDebug = {
  getLoggingSettings,
  setLoggingSettings,
  updateLoggingSettings,
  getRuntimeSnapshot,
  getStorageSnapshot,
  rebuildSearchIndex
};
```

`getRuntimeSnapshot` should return non-sensitive runtime information such as app version, storage mode, Worker status, database name, schema version, selected page ID, page count if known, and last error if known.

`getStorageSnapshot` may return counts of pages, blocks, search index rows, and settings, but it should avoid dumping all note content by default.

`rebuildSearchIndex` may be included if already implemented.

Destructive functions like `resetDatabase` should not be exposed by default. If implemented, they must require explicit confirmation and should be documented separately.

---

Q00 Error Wrapping Requirement

---

Codex should introduce a consistent way to convert caught errors into structured log context and structured UI errors.

Recommended helper:

```js
export function toErrorContext(error) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack ? error.stack.split("\n").slice(0, 8).join(" | ") : ""
    };
  }

  return {
    name: "NonErrorThrown",
    message: String(error)
  };
}
```

When logging errors, pass the original error or a normalized error context. The logger's serializer should handle either.

When sending errors across Worker boundaries, do not send raw Error objects only. Send structured error data:

```js
{
  code: "DB_READ_FAILED",
  message: "Could not list pages",
  details: {
    operation: "listPages",
    cause: toErrorContext(error)
  }
}
```

---

R00 Specific Remediation for Current Failure

---

Codex must specifically investigate and fix the failure shown in the UI:

`db.pages.where(...).equals(...).catch is not a function`

This should be handled as a required bug fix, not only as an observability improvement.

Codex should search all code for Dexie chains using `.catch` directly after query-builder or collection methods. It should ensure the code awaits a terminal promise-producing method.

Problematic pattern:

```js
db.pages.where("archivedAt").equals(null).catch(...)
```

Safer pattern:

```js
try {
  const pages = await db.pages.where("archivedAt").equals(null).toArray();
  return pages;
} catch (error) {
  logger.error("Failed to query pages", { context: { error } });
  throw error;
}
```

If sorting is needed:

```js
try {
  const pages = await db.pages
    .where("archivedAt")
    .equals(null)
    .sortBy("sortOrder");

  return pages;
} catch (error) {
  logger.error("Failed to query sorted pages", { context: { error } });
  throw error;
}
```

Codex should add a regression test or at minimum a documented manual verification for this exact startup case: a fresh database should not produce the `.catch is not a function` error.

---

S00 Observability Checklist for Codex

---

* [ ] Add a dedicated logger module.
* [ ] Use modern JavaScript with JSDoc typedefs for logger settings, log levels, options, events, and logger API.
* [ ] Support `error`, `warn`, `info`, and `debug`.
* [ ] Default to a verbose proof-of-concept logging level.
* [ ] Support segmented styled console output.
* [ ] Support plain fallback output.
* [ ] Persist logging settings in localStorage when available.
* [ ] Ensure logger works when `window` is unavailable or unavailable storage throws.
* [ ] Implement compact JSON serialization.
* [ ] Serialize Error objects usefully.
* [ ] Add scoped loggers to all owned modules.
* [ ] Remove direct scattered `console.log` calls outside the logger, unless documented as a deliberate exception.
* [ ] Log app bootstrap start and completion.
* [ ] Log runtime feature detection.
* [ ] Log Dexie availability.
* [ ] Log IndexedDB availability.
* [ ] Log Worker creation and Worker fallback.
* [ ] Log Worker request and response messages.
* [ ] Log database open and schema version.
* [ ] Log every repository operation start, success, and failure.
* [ ] Log every user-facing UI error with detailed technical context.
* [ ] Log autosave scheduling, flushing, success, and failure.
* [ ] Log paste sanitization and conversion summaries.
* [ ] Log search indexing and search query results.
* [ ] Log Markdown export and JSON backup operations.
* [ ] Log unknown block fallback rendering.
* [ ] Log malformed record normalization.
* [ ] Add safe `window.trnDebug` utilities.
* [ ] Fix the current Dexie `.catch is not a function` failure.
* [ ] Add a regression test or manual verification note for the current startup failure.
* [ ] Update documentation to describe logging controls and how to enable debug logs.
* [ ] Add implementation notes for any logging limitations.

---

T00 Testing Requirements

---

Codex should add unit tests for logger behavior where practical.

Required test targets:

Level filtering.

Settings normalization.

Settings persistence fallback when storage is unavailable.

Compact JSON handling for Error objects.

Compact JSON handling for long strings.

Compact JSON handling for long arrays.

Logger category and subcategory normalization.

Plain formatter output shape.

Segment formatter argument shape, if practical.

Error context conversion.

The tests do not need to assert exact CSS strings unless useful. They should verify behavior and safety.

Codex should also add tests or manual verification for the storage bug. Because IndexedDB and Dexie behavior may be hard to test in Bun depending on the environment, Codex may document a manual browser verification if automated testing is not practical. The note must be explicit and reproducible.

---

U00 Documentation Requirements

---

Codex should update or create a Markdown note such as `OBSERVABILITY.md`, `IMPLEMENTATION_NOTES.md`, or `DEBUGGING.md`.

The documentation should explain:

How logging is structured.

What the log levels mean.

How to change the logging level.

How to switch formatter modes.

What `window.trnDebug` exposes.

Where Worker protocol logs appear.

How to diagnose storage startup failures.

How to interpret storage unavailable errors.

How to collect useful logs when reporting a failure.

The documentation should include a short example:

```js
window.trnDebug.updateLoggingSettings({ level: "debug" });
window.trnDebug.getRuntimeSnapshot();
```

---

V00 Acceptance Criteria

---

This change is accepted only when the next failure is diagnosable from console output.

Specifically:

* [ ] Opening the app logs startup sequence details.
* [ ] Storage initialization logs enough detail to identify Worker, Dexie, IndexedDB, and schema state.
* [ ] The current `db.pages.where(...).equals(...).catch is not a function` failure is fixed.
* [ ] If storage still fails for another reason, the console shows the failing operation and structured error details.
* [ ] User-facing errors have matching detailed console logs.
* [ ] Every major module uses scoped logging.
* [ ] Logger settings can be changed during development.
* [ ] Logs include structured context where relevant.
* [ ] Bun tests cover logger helpers where practical.
* [ ] Documentation explains how to use logs and debug utilities.

---

W00 Final Direction to Codex

---

Codex should first stop and inspect the current implementation, especially storage initialization and Dexie query chains. Then it should implement the logger module. After the logger exists, Codex should instrument the codebase systematically rather than adding isolated logs only around the visible error.

The correct next state is not merely "the error is gone." The correct next state is that the application becomes observable enough that future failures can be investigated quickly from the console.
