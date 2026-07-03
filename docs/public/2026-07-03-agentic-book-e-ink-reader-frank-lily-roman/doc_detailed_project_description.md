# E Ink Reader — Detailed Project Description

A file-by-file, module-by-module, function-by-function description of the **E Ink Reader**: a static, local-first, offline browser reader for local `.txt`, `.md`, and `.markdown` files.

This document covers **only the project's own source code**. Vendored third-party libraries (`vendor/`) and binary/font assets (`assets/fonts/`) are intentionally excluded except where the app *interfaces* with them.

- **Runtime stack:** plain HTML + CSS + ES modules. No framework, no bundler, no build step, no server, no runtime network.
- **Privacy model:** book contents live in memory for the session only and are never persisted. Only reading *preferences* are stored (in `localStorage`).
- **Safety model:** Markdown is untrusted — raw HTML is escaped (markdown-it `html:false`) and then sanitized (DOMPurify); remote images are never fetched.

---

## 1. Architecture at a glance

The app is a small, framework-free, event-light architecture organized as a pipeline plus a central orchestrator (`app.js`).

```text
File (picker / drag-drop)
   │  file-open.js        → validate + read text locally (File API)
   ▼
Raw text (session memory only)
   │  document-model.js   → normalize + choose parser
   │      ├─ parser-txt.js       (.txt → escaped prose/pre HTML)
   │      └─ parser-markdown.js  (.md  → markdown-it html:false → DOMPurify)
   ▼
Normalized document { title, html, ... }  (never persisted)
   │  renderer.js         → build safe content element, subdue links, apply prefs
   ▼
Content element
   │  paginator.js        → page mode (CSS multi-column)
   │  scroll-reader.js    → scroll mode (continuous column)
   │  eink-effect.js      → refresh/ghost animation around every DOM swap
   ▼
Reader UI  ← settings.js (panel) ← preferences.js (persist) ← state.js (state+bus)
                                   ↑
            logging.js / errors.js / accessibility.js / utils.js  (cross-cutting)
```

`app.js` (`ReaderApp`) owns the DOM, wires every subsystem, and is the only place that mutates the reader across subsystems. Everything else is a focused, mostly-pure module.

### Module dependency graph

```text
utils.js          ← (no project deps)
logging.js        ← (no project deps)
accessibility.js  ← (no project deps)
preferences.js    ← logging, utils
state.js          ← preferences
errors.js         ← logging
parser-txt.js     ← utils
parser-markdown.js← errors, logging, utils, parser-txt
document-model.js ← errors, logging, utils, parser-txt, parser-markdown
file-open.js      ← errors, logging, utils
renderer.js       ← preferences, logging
paginator.js      ← utils, logging
scroll-reader.js  ← utils
eink-effect.js    ← logging, utils
settings.js       ← preferences, accessibility, utils
app.js            ← ALL of the above (orchestrator)
```

---

## 2. Full project structure (our code)

```text
index.html                      Single page; static head metadata + social/RSS; app markup
feed.xml                        Static RSS 2.0 project update feed
README.md                       User/developer overview
LICENSES.md                     Vendored dependency + font license records
AGENTS.md                       Build/agent spec incl. social + RSS maintenance rules
playwright.config.mjs           Canonical Playwright test config

css/
  reset.css                     Baseline reset; html/body height chain for scroll mode
  base.css                      Tokens (CSS vars), themes, open-screen, buttons, notices, toast, RSS link
  reader.css                    Reader shell: bar, stage, paper, paged/scroll surfaces, footer, content typography
  eink.css                      E Ink overlay/ghost visuals and refresh keyframes
  settings.css                  Settings sheet, fields, segmented controls, ranges, diagnostics
  responsive.css                Desktop/tablet/mobile breakpoints; paged .paper geometry

js/
  app.js                        ReaderApp orchestrator (bootstrap + wiring + reader control)
  state.js                      appState + minimal event bus + Events + clearDocument
  utils.js                      Pure helpers (clamp, escapeHtml, debounce, timing, heuristics)
  logging.js                    Bounded in-memory ring-buffer logger (metadata only)
  errors.js                     AppError + ErrorCode + user-facing copy catalog
  preferences.js                Preference schema, validation, load/save/clear (localStorage)
  file-open.js                  File picker + drag-drop; validate + read text (no upload)
  document-model.js             Build normalized session document from raw text
  parser-txt.js                 Plain-text → safe escaped HTML (prose reflow / preformatted)
  parser-markdown.js            Markdown → markdown-it(html:false) → DOMPurify sanitize
  renderer.js                   Apply prefs to DOM; build content element; subdue links
  paginator.js                  Paginator class: page mode via CSS multi-column
  scroll-reader.js              ScrollReader class: continuous scroll mode
  eink-effect.js                EinkController class: refresh timing + DOM-swap coordination
  settings.js                   createSettingsPanel: builds/wires the settings sheet
  accessibility.js              Reduced-motion detection, focus trap, keyboard reference

scripts/
  serve-static.mjs              Zero-dep dev static server (optional; not runtime)
  vendor-check.mjs              Verify vendored files against manifest (size + sha256 + license)
  vendor-fetch.mjs              Optional downloader for missing vendored files
  vendor-manifest.json          Integrity manifest (path, bytes, sha256, upstreamUrl, license)

tests/
  smoke.mjs                     Dependency-tolerant Playwright smoke runner (10 checks)
  playwright/reader.spec.js     Canonical @playwright/test suite (14 tests)
  fixtures/                     TXT/MD fixtures incl. edge cases (see §9)

assets/ (non-vendor, non-font)
  icons/icon.svg                App/dropzone icon
  social/social_logo_1200x630.jpg  Open Graph / Twitter social preview image
  textures/paper-noise.svg      Subtle paper texture for the reading surface
```

---

## 3. JavaScript modules and functions

Each function below lists **what it does**, the **feature** it implements, and its **role** in the system.

### 3.1 `js/state.js` — central state + event bus

Single source of truth for runtime state. `document.sourceText` lives here **in memory only** and is never persisted.

| Export | Signature | What it does | Feature / Role |
|---|---|---|---|
| `appState` | object | Holds `document`, `reader`, `preferences`, `ui` sub-states. | Central mutable state read/written by `app.js` and subsystems. |
| `on` | `on(event, handler) → unsubscribe` | Registers a listener on the internal `Map` bus; returns an unsubscribe closure. | Framework-free pub/sub; auditable events. |
| `emit` | `emit(event, payload)` | Invokes all listeners for an event, isolating handler errors so one failure can't break the loop. | Event dispatch. |
| `Events` | object | String constants: `DOCUMENT_LOADED`, `PREFERENCES_CHANGED`, `MODE_CHANGED`, `PAGE_CHANGED`, `SETTINGS_TOGGLED`, `ERROR`, `DOCUMENT_CLEARED`. | Typo-safe event names. |
| `clearDocument` | `clearDocument()` | Resets `appState.document` and reader position **without persisting**. | Privacy: forget book content. |

Imports `DEFAULT_PREFERENCES` from `preferences.js` to seed `appState.preferences`.

### 3.2 `js/utils.js` — pure helpers

No project dependencies. Shared, side-effect-free utilities.

| Export | Signature | What it does | Feature / Role |
|---|---|---|---|
| `clamp` | `clamp(value, min, max)` | Bounds a number to an inclusive range. | Used everywhere prefs/indices/fractions are bounded. |
| `toNumber` | `toNumber(value, fallback)` | Coerces to a finite number or returns fallback. | Safe preference parsing. |
| `escapeHtml` | `escapeHtml(text)` | Escapes `& < > " '`. | **Safety**: TXT parsing + settings templating never emit trusted markup. |
| `debounce` | `debounce(fn, wait)` | Trailing debounce wrapper. | Resize/orientation relayout throttling. |
| `generateId` | `generateId()` | Random session id (`s-…`). | Non-persistent document id. |
| `fileExtension` | `fileExtension(name)` | Lowercased extension without dot. | File-type detection. |
| `nextFrame` | `nextFrame() → Promise` | Resolves after two `requestAnimationFrame`s. | Lets layout/animation classes apply before measuring. |
| `wait` | `wait(ms) → Promise` | `setTimeout` promise. | E Ink refresh timing. |
| `estimateWords` | `estimateWords(text)` | Rough whitespace word count. | Document stats (no content retained). |
| `looksBinary` | `looksBinary(sample)` | Detects null/control-byte density over first 4000 chars. | **Safety/UX**: reject binary files opened as text. |

### 3.3 `js/logging.js` — local diagnostics logger

Bounded ring buffer (`MAX_ENTRIES = 200`). **Privacy rule: logs metadata only (names, sizes, counts) — never book text.** Never sends anything anywhere.

| Export | Signature | What it does | Feature / Role |
|---|---|---|---|
| `log` | `{ debug, info, warn, error }` | Level helpers calling internal `record(level,event,meta)`. | App-wide structured logging. |
| `setDebugEnabled` | `setDebugEnabled(enabled)` | Raises/lowers console verbosity (`debug` vs `info`). | Diagnostics debug toggle. |
| `getLogEntries` | `getLogEntries() → entry[]` | Returns a copy of the buffer. | Feeds the diagnostics panel. |
| `formatLogsForCopy` | `formatLogsForCopy() → string` | Serializes buffer to plain text (no book content). | "Copy logs" action. |
| `onLog` | `onLog(listener) → unsubscribe` | Subscribes to new log entries. | Live log view updates. |
| `clearLogs` | `clearLogs()` | Empties the buffer and records a marker entry. | "Clear logs" action. |
| *(internal)* `record` | `record(level, event, meta)` | Pushes entry, trims buffer, conditionally consoles, notifies listeners. | Core logging primitive. |

### 3.4 `js/errors.js` — typed errors + user copy

Separates a stable error **code** from short, factual **user-facing copy**. Technical detail is logged; raw stack traces never reach the main UI.

| Export | Signature | What it does | Feature / Role |
|---|---|---|---|
| `ErrorCode` | object | 16 codes (`NO_FILE`, `UNSUPPORTED_TYPE`, `EMPTY_FILE`, `FILE_TOO_LARGE`, `READ_FAILED`, `DECODE_FAILED`, `BINARY_CONTENT`, `PARSER_UNAVAILABLE`, `PARSE_FAILED`, `SANITIZER_UNAVAILABLE`, `FONT_FAILED`, `PAGINATION_FAILED`, `PREF_LOAD_FAILED`, `PREF_SAVE_FAILED`, `MULTIPLE_FILES`, `UNKNOWN`). | Canonical error taxonomy. |
| `AppError` | `class AppError extends Error` | Carries `code`, `detail`; message pulled from the copy catalog. | Structured throwing across the pipeline. |
| `describe` | `describe(code) → {title,message,actions}` | Looks up calm, non-technical copy + suggested UI actions. | **Recoverability**: friendly error messages. |
| `toAppError` | `toAppError(err, fallbackCode) → AppError` | Normalizes any thrown value to an `AppError` and logs it. | Uniform error handling boundary. |
| *(internal)* `CATALOG` | object | Maps each code → `{title, message, actions}`. | Copy source (Lily-friendly wording). |

`actions` hints (`"open"`, `"plaintext"`) tell the UI which recovery buttons to render.

### 3.5 `js/preferences.js` — persisted preference schema

`localStorage` stores **only** reading preferences under `eink-reader:preferences` (version `1`). Values are validated on load and reset safely if corrupt/older.

| Export | Signature | What it does | Feature / Role |
|---|---|---|---|
| `FONT_OPTIONS` | array | 5 local font descriptors (`id`, `label`, CSS `stack`) — Literata default. | Local-only font list for settings. |
| `DEFAULT_PREFERENCES` | frozen object | All defaults (font, size, line height, measure, theme, contrast, E Ink intensity, refresh, ghosting, motion, progress, debug…). | Baseline config; seeds `appState`. |
| `validatePreferences` | `validatePreferences(raw) → prefs` | Clamps/whitelists every field into a complete safe object (via internal `oneOf`, `clamp`, `toNumber`). | **Robustness**: corrupt/hostile storage can't break the app. |
| `loadPreferences` | `loadPreferences() → prefs` | Reads + parses + validates storage; falls back to defaults on any error/version mismatch. | Preference restore on launch. |
| `savePreferences` | `savePreferences(prefs) → bool` | Validates then writes JSON; returns `false` if storage throws (private mode). | Persist prefs (never content). |
| `clearPreferences` | `clearPreferences() → bool` | Removes the stored key. | Diagnostics "Reset preferences". |
| `hasStoredPreferences` | `hasStoredPreferences() → bool` | True if a prefs key exists. | "Welcome back — reopen your file" hint. |
| `fontStackFor` | `fontStackFor(fontId) → css` | Resolves a font id to its CSS stack. | Applying typography in `renderer.js`. |
| *(internal)* `oneOf` | `oneOf(value, allowed, fallback)` | Whitelist helper. | Enum validation. |

### 3.6 `js/file-open.js` — local file input

File picker + drag-and-drop. Reads with the File API; **no upload, no network**. Limits: warn at 2 MB, reject at 15 MB.

| Export | Signature | What it does | Feature / Role |
|---|---|---|---|
| `readFromFileList` | `async readFromFileList(fileList) → {fileName,fileType,sourceText,largeWarning}` | Validates count/extension/size, reads `file.text()`, rejects binary; throws `AppError` on any failure. | Core intake + validation. |
| `initFileOpen` | `initFileOpen({dropzone,fileInput,onLoad,onError}) → {openPicker,handleFileList}` | Wires `change`/`dragover`/`drop`; prevents the browser navigating to dropped files; routes to `onLoad`/`onError`. | **Feature**: open via picker *and* drag-drop. |
| `FileLimits` | `{WARN_BYTES,HARD_LIMIT_BYTES}` | Exposes size thresholds. | Shared limits / tests. |
| *(internal)* `typeForExtension` | `typeForExtension(ext)` | `txt`→`text`, else `markdown`. | File-type routing. |

### 3.7 `js/parser-txt.js` — plain-text parser

Everything is escaped — text never becomes trusted markup.

| Export | Signature | What it does | Feature / Role |
|---|---|---|---|
| `normalizeText` | `normalizeText(text)` | Strips BOM, normalizes `\r\n?`→`\n`. | Consistent input for all parsers. |
| `parseTxt` | `parseTxt(rawText) → [{type,html}]` | Prose paragraphs reflow (soft newlines joined); preformatted files become one escaped `<pre><code>`. | **Feature**: readable `.txt`, code/ASCII preserved. |
| `guessTxtTitle` | `guessTxtTitle(rawText) → string?` | First non-empty line (truncated to 120). | Reader title for TXT. |
| *(internal)* `looksPreformatted` | `looksPreformatted(lines)` | Heuristic: >35% indented lines → treat as preformatted. | Prose-vs-code detection. |

### 3.8 `js/parser-markdown.js` — safe Markdown

Security model in depth: markdown-it `html:false` (raw HTML escaped as text) → images replaced with non-fetching placeholders → DOMPurify sanitize to a reading-only allow-list → **fail closed** (throw) if DOMPurify missing.

| Export | Signature | What it does | Feature / Role |
|---|---|---|---|
| `parseMarkdown` | `parseMarkdown(rawText) → {html, hadRawHtml}` | Renders, sanitizes with `ALLOWED_TAGS`/`ALLOWED_ATTR`, logs removals; throws `PARSE_FAILED`/`SANITIZER_UNAVAILABLE`. | **Safety feature**: trustworthy Markdown. |
| `isMarkdownAvailable` | `→ bool` | `window.markdownit` present? | Capability probe. |
| `isSanitizerAvailable` | `→ bool` | `window.DOMPurify.sanitize` present? | Capability probe. |
| *(internal)* `getMarkdownIt` | `→ md` | Lazily builds a configured markdown-it and installs a safe image rule (`[image: alt]` placeholder). | No remote image fetches. |
| *(internal)* `containsRawHtml` | `containsRawHtml(text)` | Detects HTML-ish source. | Drives the "HTML not rendered" toast. |

### 3.9 `js/document-model.js` — normalized session document

Builds a session-only model separating source from rendered HTML.

| Export | Signature | What it does | Feature / Role |
|---|---|---|---|
| `buildDocument` | `buildDocument({fileName,fileType,sourceText,forceText}) → doc` | Normalizes text, routes to TXT or Markdown parser, derives title/counts/headings, throws `EMPTY_FILE` when nothing renders; supports `forceText` fallback. | Central intake → renderable model. |
| *(internal)* `titleFromHtml` | `titleFromHtml(html)` | First `<h1-3>` text. | Title from Markdown. |
| *(internal)* `titleFromFileName` | `titleFromFileName(fileName)` | Filename minus extension. | Title fallback. |

The returned `doc` includes `hadRawHtml` (drives the safety toast) and never retains a persisted copy.

### 3.10 `js/renderer.js` — DOM application + content build

Document HTML is already safe (TXT escaped / Markdown sanitized). Links are post-processed to be subdued and never prefetched.

| Export | Signature | What it does | Feature / Role |
|---|---|---|---|
| `applyPreferences` | `applyPreferences(prefs, {html,reader}, reducedMotionSystem)` | Sets `data-theme`/`data-contrast`, typography CSS custom properties, and reader `data-mode`/`data-eink`/`data-progress`/`data-motion` (resolving system reduced-motion). | **Feature**: live typography/theme/mode. |
| `processLinks` | `processLinks(container)` | Allows only `http(s)`/`mailto`/`#`; strips other hrefs (`data-blocked-href`); http links get `target=_blank` + `rel="noopener noreferrer"` + title. | **Safety**: safe, non-prefetching links. |
| `buildContent` | `buildContent(doc) → HTMLElement` | Creates `.content`, injects safe `doc.html`, runs `processLinks`. | Turns model into a mountable element. |

### 3.11 `js/paginator.js` — page mode (`class Paginator`)

Page mode via the CSS multi-column technique (`column-width` = page width, `column-fill:auto`); pages revealed by translating the content horizontally. Fast and font/viewport-stable.

| Member | Signature | What it does | Feature / Role |
|---|---|---|---|
| `constructor` | `new Paginator(viewportEl)` | Holds viewport + geometry state. | Owns page geometry. |
| `layout` | `layout(contentEl, measureCh) → count` | `attach` + `measure` in one call. | Convenience full layout. |
| `attach` | `attach(contentEl)` | Mounts content, adds `content--paged`. | Split from measure so fonts can load first. |
| `measure` | `measure(measureCh) → count` | Computes page width/height/stride, forces reflow, derives `pageCount = round((scrollWidth+gap)/stride)`, preserves reading fraction. | **Feature**: stable page count. |
| `_chWidthPx` | `_chWidthPx()` | Measures character width in the *current* font. | Correct measure width; font-race guard (see §7). |
| `applyTransform` | `applyTransform()` | Translates content by `-index*stride`. | Renders the current page. |
| `goToPage` / `next` / `prev` | `→ changed:bool` | Clamped navigation. | Page turning. |
| `atStart` / `atEnd` | `→ bool` | Edge detection. | Nav button disabling. |
| `getAnchorFraction` / `setAnchorFraction` | fraction 0..1 | Position preservation across relayout. | Keep place on resize/settings change. |

### 3.12 `js/scroll-reader.js` — scroll mode (`class ScrollReader`)

Continuous column inside the scrollable stage. Normal scrolling never triggers the E Ink flash (only major jumps, coordinated by `app.js`).

| Member | Signature | What it does | Feature / Role |
|---|---|---|---|
| `constructor` | `new ScrollReader(scrollEl, hostEl)` | Stores scroll container + content host. | Owns scroll surface. |
| `layout` | `layout(contentEl)` | Clears paged inline styles, mounts content, resets scrollTop. | **Feature**: scroll reading. |
| `getAnchorFraction` / `setAnchorFraction` | fraction 0..1 | Read/restore scroll position by fraction. | Position preservation. |
| `scrollByPage` | `scrollByPage(direction)` | Scrolls ~90% of viewport height. | Space/PageDn/PageUp in scroll mode. |
| `toStart` / `toEnd` | — | Jump to top/bottom. | Home/End. |

### 3.13 `js/eink-effect.js` — refresh controller (`class EinkController`)

**Single owner** of refresh timing and DOM-swap coordination. A refresh = lock → wash overlay → swap DOM near wash peak → stepped grayscale settle → unlock. Errors during swap still unlock and reveal the new DOM.

| Member | Signature | What it does | Feature / Role |
|---|---|---|---|
| `constructor` | `new EinkController(stageEl)` | Grabs `.eink-overlay`/`.eink-ghost`, default config, serialization chain. | Owns refresh visuals. |
| `configure` | `configure(patch)` | Merges intensity/motion/interval config. | Reflects preference changes. |
| `effectiveMotion` / `isReduced` | `→ "reduced"|"full"` / `bool` | Resolves motion (system follows OS). | **Accessibility**: reduced motion. |
| `durations` | `→ {wash,settle}` | Timing per intensity (`off/reduced/balanced/strong`). | Refresh feel. |
| `get busy` | `→ bool` | Whether a refresh is animating. | Re-entry guard. |
| `run` | `run(type, updateDom) → Promise` | Serializes refreshes via a promise chain so rapid calls queue. | **Feature**: credible E Ink transitions. |
| `_run` | `async _run(type, updateDom)` | The lock→wash→swap→settle sequence; ghost cadence bookkeeping. | Core animation. |
| `_safeUpdate` | `async _safeUpdate(updateDom)` | Runs the DOM mutation, catching errors so UI never sticks. | **Recoverability**. |
| `_showGhost` / `_clearGhost` | — | Toggle the faint ghost layer. | E Ink ghosting realism. |
| `runPageTurn` | `runPageTurn(updateDom) → Promise` | Chooses partial vs full refresh based on `fullRefreshInterval`. | Page-turn refresh policy. |

### 3.14 `js/accessibility.js` — a11y helpers

| Export | Signature | What it does | Feature / Role |
|---|---|---|---|
| `prefersReducedMotion` | `→ bool` | Reads the `(prefers-reduced-motion: reduce)` media query. | **Accessibility**. |
| `onReducedMotionChange` | `onReducedMotionChange(handler) → unsubscribe` | Subscribes to OS motion changes (with legacy `addListener` fallback). | Live motion adaptation. |
| `getFocusable` | `getFocusable(container) → el[]` | Visible focusable descendants. | Focus trap support. |
| `trapFocus` | `trapFocus(container) → release()` | Cycles Tab within a container; `release()` restores prior focus. | **Accessibility**: modal settings dialog. |
| `KEYBOARD_REFERENCE` | array | `[keys, description]` pairs. | Rendered in settings help. |

### 3.15 `js/settings.js` — settings panel

`createSettingsPanel({getPrefs,onChange,diagnostics})` returns `{render, refreshLogs}`. Builds a device-like sheet; the font list reflects only locally bundled fonts. Diagnostics are behind an `Advanced diagnostics` `<details>` disclosure (progressive disclosure for Lily vs Roman).

| Function | Signature | What it does | Feature / Role |
|---|---|---|---|
| `createSettingsPanel` | `(opts) → {render, refreshLogs}` | Factory closing over prefs accessor, `onChange`, diagnostics hooks. | Settings subsystem entry. |
| `render` | `render(container, closeFn) → panelEl` | Injects the template, wires controls, primes logs; returns the dialog element for focus trapping. | Open the panel. |
| `refreshLogs` | `refreshLogs()` | Renders the last 60 log lines when debug is on. | Live diagnostics view. |
| *(internal)* `template` | `→ html` | Builds the whole sheet (reading mode, typography, display, E Ink, accessibility, diagnostics). | Panel markup. |
| *(internal)* `wire` | `wire(container, closeFn)` | Binds segmented buttons, selects, ranges (live labels), close + diagnostics buttons; emits `onChange(patch)`. | Controls → preferences. |
| *(internal)* `seg` / `range` | template helpers | Render segmented control / labeled range input. | Reusable controls. |

### 3.16 `js/app.js` — orchestrator (`class ReaderApp`)

Bootstraps and wires everything; the only cross-subsystem mutator. Exposes `window.__einkReader` for test hooks (no behavior change). Boots on `DOMContentLoaded`.

Module-level constants: `LAYOUT_KEYS` (prefs needing relayout) and `VISUAL_FULL_KEYS` (theme/contrast → full refresh only).

| Method | Signature | What it does | Feature / Role |
|---|---|---|---|
| `constructor` / `init` | — | Loads prefs, sets debug + reduced-motion, creates `EinkController`/`Paginator`/`ScrollReader`, applies prefs, builds settings panel, binds all inputs, shows "Welcome back" hint. | App startup. |
| `cacheEls` | — | Caches all DOM nodes by id. | Centralized DOM refs. |
| `applyEinkConfig` | — | Pushes E Ink prefs into the controller. | Sync config. |
| `bindFileOpen` | — | Wires `initFileOpen` + both open buttons. | File-open feature. |
| `loadDocument` | `async loadDocument(result, opts)` | Builds the doc, stores it **in memory only**, enters reader, shows large-file/HTML-safety toasts, lays out under a full refresh. | Core load flow. |
| `enterReader` | — | Hides open screen, shows reader. | View transition. |
| `layoutCurrentMode` | `async layoutCurrentMode(waitFonts)` | Lays out paged (attach → await font → measure) or scroll; falls back to scroll on pagination failure. | Mode layout + resilience. |
| `_ensureReaderFontLoaded` | `async _ensureReaderFontLoaded(el)` | Awaits the exact reader font face (with 1200 ms timeout) before measuring. | **Stability fix** (font-race, §7). |
| `relayoutPreserving` | `async relayoutPreserving(type)` | Re-measures/reflows preserving the reading fraction, inside a refresh. | Resize/settings relayout. |
| `switchMode` | `async switchMode(newMode, oldMode)` | Switches page/scroll preserving position; takes explicit `oldMode` (see §7). | Mode switching. |
| `bindReaderControls` | — | Wires prev/next buttons, tap zones, settings button. | Navigation UI. |
| `pageNext` / `pagePrev` | — | Turn pages (partial/full refresh) or scroll by page. | Reading navigation. |
| `goStart` / `goEnd` | — | Jump to start/end under a full refresh. | Home/End. |
| `updateProgress` | — | Shows "Page X of N" or "NN%". | Progress indicator. |
| `updateNavState` | — | Disables prev/next at edges (paged). | UX affordance. |
| `onPreferenceChange` | `onPreferenceChange(patch)` | Validates + persists, applies visual prefs, decides mode-switch vs relayout vs full-refresh, toggles debug. | **Preferences pipeline hub**. |
| `persist` | — | Saves prefs; toasts on failure. | Persistence. |
| `openSettings` / `closeSettings` | — | Render + focus-trap the panel / release + clear. | Settings + a11y. |
| `resetPreferences` | — | Clears storage, restores defaults, re-applies, relayouts. | Diagnostics reset. |
| `copyLogs` | — | Copies diagnostics via Clipboard API (with toasts). | Diagnostics. |
| `bindKeyboard` / `onKeydown` | — | Global shortcuts: arrows, Space/Shift+Space, PageUp/Down, Home/End, `S`, `O`, `Esc`; ignores typing in controls. | **Feature**: keyboard control. |
| `bindResize` | — | Debounced relayout on resize/orientation. | Responsive. |
| `bindReducedMotion` | — | Re-applies motion on OS change. | Accessibility. |
| `handleError` | `handleError(err)` | In-reader → toast (with plain-text fallback for parse errors); pre-reader → open-screen notice. | **Recoverability**. |
| `canFallbackToText` | `canFallbackToText(code) → bool` | True for parser/sanitizer errors. | Plain-text fallback gate. |
| `showOpenNotice` / `clearOpenNotice` | — | Render/clear the calm landing notice (+ optional "Open as plain text"). | Non-technical errors. |
| `setBusy` | `setBusy(on, label)` | Toggles the busy indicator. | Feedback for slow work. |
| `showToast` / `showActionToast` | — | Transient status; optional action button. | Non-blocking messages. |

---

## 4. CSS files (roles)

No functions, but each file owns a clear layer:

- **`reset.css`** — minimal reset; establishes the `html`/`body` `height:100vh/100dvh` chain that makes scroll mode's nested `overflow:auto` work (§7).
- **`base.css`** — design tokens (CSS custom properties), the four themes (`warm-paper`, `cool-paper`, `high-contrast`, `dark`) + contrast variants, open screen, dropzone, buttons, notices, toast, and the non-intrusive `.rss-link` / `.dropzone__updates` styling.
- **`reader.css`** — reader shell: top bar, `.reader__stage` (positioning context), `.paper` (paged uses `position:absolute; inset:0`), `.page-viewport`, `.content--paged`, scroll surface, footer, and reading typography driven by the `--reader-*` custom properties.
- **`eink.css`** — the `.eink-overlay` wash and `.eink-ghost` layers plus refresh keyframes; intensity/motion driven by `data-eink`/`data-motion`.
- **`settings.css`** — settings scrim + sheet, sections, fields, segmented controls, ranges, keyboard reference, diagnostics.
- **`responsive.css`** — breakpoints for desktop/tablet/mobile; desktop paged `.paper` geometry (`inset:18px 0; max-width:900px; margin:0 auto`).

---

## 5. `index.html` (structure)

- **Head:** UTF-8, viewport, a restrictive **CSP** (`default-src 'self'; connect-src 'none'` → no runtime network), static social metadata (title, description, canonical, RSS discovery, Open Graph, Twitter card → `assets/social/social_logo_1200x630.jpg`), icon, and stylesheet links.
- **Body → `#app`:**
  - `#open-screen` → `#dropzone` (icon, title, hint, **Open a file** button, hidden `#file-input`, `#open-notice`, and the `.rss-link` "Updates feed (RSS)").
  - `#reader` (hidden until a book loads) → bar (title, Open, Settings), `#reader-stage` (ghost/overlay layers, prev/next tap zones, `#paper` → `#page-viewport` + `#reader-scroll`), footer (prev/progress/next).
  - `#settings-mount`, `#busy`, `#toast`.
- **Scripts:** vendored `markdown-it` and `DOMPurify` as classic scripts (window globals), then `js/app.js` as an ES module.

---

## 6. Scripts and tests

### `scripts/`
- **`serve-static.mjs`** — zero-dependency static server (`node scripts/serve-static.mjs [port]`, default 8123) with a MIME map; optional (you can also open `index.html` directly). *Note:* the MIME map does not include `.xml`, so it serves `feed.xml` as `application/octet-stream` locally; production hosting (GitHub Pages) serves `.xml` correctly.
- **`vendor-check.mjs`** — `main()` reads `vendor-manifest.json`, verifies each item's presence, byte size, `sha256` (via `sha256()`), and license file; exits non-zero on any problem. Guards the offline/static guarantee.
- **`vendor-fetch.mjs`** — optional downloader; `download(url)` fetches, `main()` writes only missing files (or all with `--force`), never overwriting silently.
- **`vendor-manifest.json`** — the integrity source of truth (path, bytes, sha256, upstreamUrl, license).

### `tests/`
- **`smoke.mjs`** — dependency-tolerant runner using the global `playwright` lib. `loadPlaywright()` resolves the module, `open(page,name)` loads a fixture, `check(name,cond,detail)` asserts, `main()` runs 10 checks: TXT opens, stable pagination, page nav, scroll, XSS blocked/no `<script>`, code-block overflow contained, empty-file calm message, unsupported-file guidance, prefs persist but content does not, no external requests.
- **`playwright/reader.spec.js`** — canonical `@playwright/test` suite (13 tests) covering the same behaviors plus image non-fetch, reduced-motion reflection, and settings open/close. `openFile(page,name)` is the shared helper.
- **`fixtures/`** — see §9.

---

## 7. Notable engineering decisions (why the code looks this way)

1. **Paged `.paper` uses `position:absolute; inset:0`** against a `position:relative` stage. Percentage/`calc()` heights on a flex-item child don't resolve reliably, so the paper collapsed; absolute positioning against a definite-size ancestor fixes it.
2. **`body { height:100vh; height:100dvh }`** — a nested `overflow:auto` scroll container only works when the whole flex chain is height-bounded; `min-height` alone let content expand the chain and nothing scrolled.
3. **Font-load race** — `document.fonts.ready` can resolve *before* a lazily-requested variable font (Literata) is applied, causing the first pagination to measure the wider fallback and produce a wrong page count. `_ensureReaderFontLoaded` awaits the exact face (with timeout) before `paginator.measure`.
4. **`switchMode(newMode, oldMode)` takes an explicit old mode** — `onPreferenceChange` updates `appState.preferences` and calls `applyPreferences` (which sets `data-mode`) *before* switching, so neither state nor the DOM attribute can detect the previous mode; it must be passed in.
5. **E Ink refreshes are serialized** through a single promise chain in `EinkController` so rapid page turns queue instead of overlapping, and `_safeUpdate` guarantees the UI never sticks behind a wash.

---

## 8. Feature → code map

| Feature | Primary code |
|---|---|
| Open local file (picker + drag-drop) | `file-open.js`, `app.bindFileOpen/loadDocument` |
| No upload / no network | CSP in `index.html`, File API only, `connect-src 'none'` |
| Safe Markdown | `parser-markdown.js` (markdown-it `html:false` + DOMPurify), `renderer.processLinks` |
| Plain-text reading | `parser-txt.js`, `document-model.buildDocument` |
| Page mode | `paginator.js`, `reader.css`, `responsive.css` |
| Scroll mode | `scroll-reader.js`, `reset.css` height chain |
| E Ink refresh + ghosting | `eink-effect.js`, `eink.css` |
| Typography / themes | `preferences.js`, `renderer.applyPreferences`, `base.css` |
| Settings + progressive disclosure | `settings.js`, `settings.css` |
| Preference persistence (content never) | `preferences.js`, `state.js`, `app.persist` |
| Accessibility (reduced motion, focus trap, keyboard) | `accessibility.js`, `app.onKeydown` |
| Calm, recoverable errors | `errors.js`, `app.handleError/showOpenNotice` |
| Diagnostics / logging | `logging.js`, `settings.js` diagnostics section |
| Offline integrity | `scripts/vendor-check.mjs`, `vendor-manifest.json`, `LICENSES.md` |
| Social preview + updates feed | `index.html` head, `feed.xml` |

---

## 9. Test fixtures

`tests/fixtures/` exercises the pipeline and edge cases:

- `simple.txt`, `simple.md` — happy paths.
- `long-book.txt` — long-form pagination (stable ~100+ pages).
- `code-heavy.md`, `large-headings.md` — technical Markdown, headings, code overflow.
- `markdown-edge-cases.md` — raw HTML / XSS attempts (must be escaped/sanitized).
- `unicode.txt`, `one-long-line.txt`, `whitespace.txt`, `empty.txt` — decoding, wrapping, and empty/whitespace calm-message paths.
- `unsupported.pdf` — unsupported-type rejection with guidance.

---

*This document describes the source as implemented. When behavior changes, update the relevant section here, the `feed.xml` update item, and the `AGENTS.md` maintenance rules.*
