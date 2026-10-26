# Report 2 — Extension engineering source analysis: TypeScript, vendoring, settings, and workers

**Source archive:** `browser-extension-src.zip`  
**Extracted references:** `../reference/browser-extension-src/src/`  
**Origin:** Reconstruction and extension of the earlier conversation's detailed extension review.  
**Scope:** reusable engineering approaches for a **static website** written in TypeScript and built with Bun. The extension is not itself a deployable web application.

The archive gives concrete working examples of runtime vendoring, Dexie persistence, typed messaging, schema-driven settings, Shadow DOM widgets, and services extracted from a central worker. A new GTL app should reuse these techniques *selectively* and simplify the domain boundaries.

![Proposed feature architecture](../diagrams/03-feature-architecture.svg)

## 1. Target technology stack and compatibility boundary

| Area | Proposed technology |
| --- | --- |
| Language | Modern strict TypeScript; previous discussion referenced TypeScript 7.0.2 — **verify currently supported stable version before implementation** |
| Build, tests, development | Bun, plus compiler/typechecker as a development dependency |
| Runtime | Browser ES modules, no CDN or npm-installed runtime dependencies |
| UI | Browser Custom Elements; Shadow DOM for suitable widgets |
| Data | IndexedDB through vendored Dexie with repository interfaces |
| Background processing | Dedicated Web Worker with typed feature-owned handlers |
| Offline | Optional service worker strictly for assets/cache/update logic |
| Built-in templates | `.gtl` static files with a generated, explicit manifest |
| Rich text and export | Plain text, HTML, Markdown; optional ZIP packaging |
| Deployment | Static hosting (e.g. GitHub Pages) |

**Critical difference:** `src/background/service_worker.ts` is a **Chrome extension Manifest V3 service worker** using `chrome.runtime`, `chrome.storage.local`, and `importScripts`. On a website, these APIs and lifetime semantics are not available. A website's service worker is lifecycle-driven and not a continuously running domain backend. Propose a **Dedicated Worker** for database access, parsing, and other processing. Keep main-thread editing responsive without waiting for worker round trips.

## 2. Vendored runtime libraries

Observed prebuilt files in the extension:

| Exact source path | Library | Decision for reference kit |
| --- | --- | --- |
| `src/content/libs/dexie-4.2.0.js` | Dexie 4.2.0 | **Included unmodified in `library/`** |
| `src/content/libs/jszip-3.10.1.js` | JSZip 3.10.1 | **Included** as optional export library |
| `src/content/libs/markdown-it-14.2.0.js` | markdown-it 14.2.0 | **Included** as optional Markdown processor |
| `src/content/libs/turndown-7.0.0.js` | Turndown 7.0.0 | **Included** as optional HTML→Markdown processor |
| `src/content/libs/readability-0.6.0.js` | Readability 0.6.0 | Not copied; content extraction not part of first app |
| `src/content/libs/microlight-0.0.7-mod-2026-05-24.js` | Modified syntax highlighter | Not copied; out of initial scope |

Dexie 4.2.0's banner identifies its Apache-2.0 license and its UMD distribution. The UMD wrapper normally sets `globalThis.Dexie` when loaded as a classic script. In the extension service worker it is loaded through:

```ts
importScripts('../settings/settings_runtime.js');
importScripts('../content/libs/dexie-4.2.0.js');
```

**Do not assume this same UMD file works as an ESM `import` in a Bun-built module worker.** Prototype the loading path. If necessary, choose a separately verified vendored ESM distribution, keeping the no-runtime-npm-dependency policy intact.

The original bundled library headers are retained in the copied files. The kit is not a license audit; consult `05-assets-and-licenses.md` and supply any missing third-party license texts before redistributing the final app.

## 3. Vendored editable component framework

`src/vendor/retroos-ui-v001/` is more than a minified binary. It contains TypeScript Custom Elements source, core styling helpers, themes, icons, build scripts, and a strict TS config.

The archive's comments explicitly differentiate:

- Generic, reusable edits inside the vendored framework.
- Application-specific adapters and bridges **outside** the vendored framework.

Key source files (preserved in the reference kit):

- `src/vendor/retroos-ui-v001/src/components/field.ts`: help/error/required attributes, slots, CSS tokens.
- `.../components/input.ts`: encapsulated inputs.
- `.../components/textarea.ts`: multiline entry.
- `.../components/tabs.ts`: selection state and accessible tabs.
- `.../components/listbox.ts`: choice UI.
- `.../components/dialog.ts`: dialog mechanics.
- `.../components/toast.ts`: notifications.
- `.../core/styles.ts`: cached constructed stylesheets with fallback `<style>` insertion.
- `.../core/define.ts`: idempotent `customElements.define()` helpers.
- `.../core/sanitize.ts`: escaping/sanitization helpers.
- `.../tsconfig.json` and `.../scripts/build.mts`: strict TypeScript + Bun build patterns.

A typical component in `field.ts` calls `attachShadow({mode: 'open'})` and uses shared CSS custom properties. The library uses `adoptedStyleSheets` where available and style tags otherwise.

**Recommendation:** do not pull its whole window-manager/minibuffer into GTL. Extract component conventions and only necessary widgets. The editor itself needs experiments before choosing whether to place its editable text in Shadow DOM.

## 4. Dexie schemas and repository isolation

Observed `src/background/service_worker.ts` creates Dexie database `lpBookmarksDb` and declares schema versions to hold bookmarks, labels, usage data, tab trails, and related records. That database domain is not relevant; the important reference is versioned IndexedDB schema ownership.

The cleaner separation exists in `src/background/tab_trail_service.ts`, which defines store operations in an interface and supplies Dexie plus memory implementations. Example operations include `getFlow()`, `putFlow()`, and `listFlows()`.

For the new app, use interfaces such as:

```ts
export interface DocumentRepository {
  get(id: string): Promise<DocumentRecord | undefined>;
  list(): Promise<DocumentRecord[]>;
  save(record: DocumentRecord): Promise<void>;
  delete(id: string): Promise<void>;
}
```

Implement `DexieDocumentRepository`, `MemoryDocumentRepository`, and perhaps `LocalStorageDocumentRepository`. Features should depend on these interfaces, **not** on global Dexie state or on direct IndexedDB calls.

Proposed tables: `documents`, `revisions`, `templates`, `settings`, `metadata`. This is a **proposal**, not an existing schema in the archive.

Keep **schema version assembly** centralized. Individual features may contribute table definitions, but only one central database initializer should own the complete database version/migration path. Save current document and revision atomically where necessary.

## 5. Settings: schema, default overrides, immediate propagation

Observed file: `src/settings/settings_runtime.ts`.

It describes a settings document with categories and setting definitions, including fields such as `keyPath`, `label`, `description`, `type`, `defaultValue`, `allowedValues`, and `uiControl`.

The runtime contains logic named:

- `DEFAULT_SETTINGS_DOCUMENT`
- `computeMinimalOverrides()`
- `buildEffectiveDocument()`
- `loadSettingsDocument()`
- `saveOverrides()`
- `setSetting()`
- `resetSetting()`
- `resetAllSettings()`

The extension stores **overrides relative to defaults** rather than a complete duplicate of all default values. This lets new defaults apply to users who never overrode the setting.

The settings UI in `src/settings/settings.ts` uses definitions to build suitable controls. The worker subscribes to `chrome.storage.onChanged` and applies relevant changes, with checks to avoid redundant work.

**Adaptation for GTL:** define a browser settings service that publishes immediate in-process updates; forward worker-relevant settings to the Dedicated Worker; optionally notify other open tabs using `BroadcastChannel`. Do not copy `chrome.storage` calls.

Candidate settings: chosen background, guidance panel dock/pin state, font scale, autosave interval, persistence mode (memory, localStorage, IndexedDB), revision retention, export defaults, and reduced-motion preference. Do not build an enormous settings panel in the MVP.

![Settings propagation](../diagrams/05-settings-flow.svg)

**Worker API constraint:** `localStorage` is unavailable inside Dedicated Workers. If the product supports localStorage as a mode, implement that adapter in the main thread, while Dexie/IndexedDB may run in the worker. A storage coordinator hides those differences from consumers.

## 6. Worker routing: from monolith to feature-owned handlers

Observed file: `src/background/service_worker.ts`, ~135 KB. It handles startup, DB schema, settings changes, browser events, and message routing. It imports some extracted service modules (`tab_trail_service.ts`, `session_snapshot_runtime.ts`, etc.), but still knows too much about individual features.

Observed routing example:

```ts
const tabTrailType = getTabTrailMessageType(request);
if (tabTrailType) {
  initBookmarksDb()
    .then(() => tabTrailService.handleMessage(
      { type: tabTrailType, payload: request?.payload || request || {} },
      sender
    ))
    .then(sendResponse);
  return true;
}
```

A new GTL worker should be a **thin router**. It statically registers handler modules exported by feature folders, dispatches typed requests, and normalizes results/errors.

```ts
export interface WorkerFeature {
  readonly scope: string;
  handle(type: string, payload: unknown): Promise<unknown>;
}

const features = [
  createDocumentWorkerFeature(),
  createHistoryWorkerFeature(),
  createTemplateWorkerFeature()
];

const handlers = new Map(features.map(f => [f.scope, f]));
```

This is **proposed example code**, not a copy from the extension. Use static imports, not a dynamic plugin loader. Small features should not be required to create worker/storage/UI layers if they don't need them.

![Request/response boundary](../diagrams/04-worker-message-flow.svg)

## 7. Typed runtime messaging

Observed file: `src/content/runtime_messaging.ts` defines generic envelopes:

```ts
export type RuntimeEnvelope<TPayload> = {
  scope: string;
  type: string;
  requestId: string;
  payload: TPayload;
};

export type RuntimeResponseEnvelope<TResult> = {
  ok: boolean;
  requestId: string;
  result?: TResult;
  error?: { code?: string; message?: string; details?: unknown };
};
```

It creates request IDs and validates matched responses. The source transport is Chrome messaging; the proposed GTL transport is `worker.postMessage()` plus `message` events.

Preserve request IDs, correlated responses, structured errors, and a consistent envelope. Consider a protocol version, request timeout, and cancel/ignore-stale-result behavior. Runtime validation is still needed at message boundaries: TypeScript types do not enforce values arriving through browser structured cloning.

Avoid message round trips for each keypress. The main thread owns immediate editing state; the worker handles persistence and potentially heavier parsing/export operations.

## 8. Feature-based directory organization

Proposed, not copied verbatim from the archive:

```text
src/
  app/
    main.ts
    shell.ts
    state.ts
  features/
    documents/
      model.ts
      service.ts
      protocol.ts
      ui/
      worker/
      storage/
    history/
      model.ts
      service.ts
      ui/
      worker/
      storage/
    templates/
      model.ts
      loader.ts
      parser.ts
      ui/
      worker/
    settings/
      model.ts
      defaults.ts
      service.ts
      ui/
    export/
      service.ts
      ui/
      worker/
  platform/
    messaging/
    storage/
    clipboard/
    ui/
  worker/
    main.ts
  vendor/
    dexie/
    markdown-it/
    jszip/
  types/
```

A feature is a coherent **domain capability**. Do not create identical boilerplate layers for tiny features. Shared platform code is for low-level transport/storage/UI primitives, not a dumping ground for all domain logic. Cross-feature calls should use small public contracts/events rather than private imports.

## 9. Built-in templates in a static web app

Following the simplified document-centric language direction, bundled templates can be plain `.gtl` files. The app needs an explicit manifest to know what to offer at startup.

```json
{
  "templates": [
    {"id": "purpose-function", "file": "project-descriptions/purpose-function.gtl"},
    {"id": "input-processing-output", "file": "project-descriptions/input-processing-output.gtl"}
  ]
}
```

Build-time code can generate the manifest from the source folder. At runtime, fetch the manifest once, then load chosen template files on demand. Cache results. User templates, if supported later, can live in IndexedDB rather than static files. Keep template language logic independent of external filesystem/package resolution.

## 10. TypeScript and Bun build

Observed strict TS reference: `src/vendor/retroos-ui-v001/tsconfig.json`, using `target: ES2025`, `module: Preserve`, `moduleResolution: bundler`, `strict`, `noEmit`, `verbatimModuleSyntax`, `isolatedModules`, and `noUncheckedIndexedAccess`.

Observed Bun script reference: `src/vendor/retroos-ui-v001/scripts/build.mts`.

Suggested initial common TS compiler options (illustrative, not a complete final project config):

```json
{
  "compilerOptions": {
    "target": "ES2025",
    "module": "Preserve",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "noUncheckedIndexedAccess": true,
    "useUnknownInCatchVariables": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  }
}
```

Use **separate DOM and worker type-checking projects** so DOM-only APIs are not accidentally allowed in worker logic. Keep generated assets and vendored JS out of checks unless explicitly adapted.

Suggested Bun entrypoints: `src/app/main.ts` and `src/worker/main.ts`, `target: 'browser'`, ESM output and external source maps during development. A build script should also copy HTML, backgrounds, manifest, and template text files.

**Archive limitation:** the extension ZIP contains the nested RetroOS UI package/build configuration but not the entire extension's top-level build system. It is incorrect to infer a complete end-to-end extension build from the supplied ZIP.

## 11. Exporting documents, persistence history, and privacy

Relevant observed sources:

- `src/content/atools/session-snapshot-v001/js/session_snapshot_zip.ts` — JSZip-based export packaging.
- `src/content/atools/markdown-to-html-v001/js/markdown-to-html-core.ts` — Markdown processing isolated from UI.
- `src/content/atools/rich-text-to-markdown-v001/js/rich-text-to-markdown.ts` — HTML/rich to Markdown transformation.
- `src/content/text_expander_minibuffer_model.ts` — rich question/parameter metadata, examples, allowed values, validation; useful *conceptually*, but deliberately overfeatured for a minimal GTL template format.

For GTL, keep one semantic document model and add exporters for plain text, HTML, Markdown, and eventually ZIP. Do not export editor chrome or transient guidance decorations. Autosave and durable revision history are separate responsibilities.

The extension's comments around usage data emphasize avoiding sensitive text, URLs, clipboard data, and generated content in telemetry. Apply the same principle to GTL diagnostics; default to local processing and avoid storing document contents in logs.

## 12. Explicit exclusions and implementation experiment list

**Do not copy unchanged:** `chrome.runtime.*`, `chrome.storage.*`, Manifest V3 event listeners, `importScripts()` loading conventions for a new module worker, central monolithic service worker, extension permissions/manifest mutation, full RetroOS window manager, or extensive text-expander minibuffer command machinery.

**Validate experimentally:**

1. Vendored Dexie UMD file in a Bun-produced browser module worker.
2. Worker typed message correlation and error recovery, including worker crashes/restarts.
3. Main-thread editor responsiveness while background saves occur.
4. Shared value updates across repeated placeholders without caret jumps.
5. Rich text and plain text clipboard output from the semantic document, not the visible DOM.
6. Settings changes broadcasting to main UI and worker without page reload.
7. Cross-tab persistence conflicts, migration, and saving disabled.

The recommended foundation is **static TypeScript + Bun + vendored JavaScript + native Web Components + a Dedicated Worker + feature-scoped repositories/handlers**, with the document itself remaining the center of the UX.
