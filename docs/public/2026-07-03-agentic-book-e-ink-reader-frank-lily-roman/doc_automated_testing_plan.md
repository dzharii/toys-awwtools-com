# doc_automated_testing_plan.md

Automated browser-test plan for the **E Ink Reader**.

Status: **Planning only.** This document defines the architecture, structure,
and work packages for a Playwright + Bun regression suite. It does **not**
implement test code. Implementation happens in a later phase against this plan.

---

A00 Purpose And Scope

---

The E Ink Reader is a static, local-first browser reader for `.txt`, `.md`, and
`.markdown` files. It has page and scroll modes, an E Ink refresh effect, local
fonts, safe Markdown, four themes, preference persistence, responsive layouts,
and a strict no-content-persistence / no-network runtime.

This plan describes how to automate the existing manual browser test plan
(`specs/tests-manual-plan-v01.md`, sections A00-Y00) with Playwright, using the
**smart Page Object architecture** proven in the reference project:

```text
D:\my-github\unsafe-link-preview-browser-extension\ui-regression-test-suite
```

The reference suite is the design authority for *how* we structure the tests.
`doc_detailed_project_description.md` is the design authority for *what* the app
does (surfaces, DOM anchors, preferences, behavior). Both are read-only inputs.

Scope of this plan:

- Adapt the reference framework layers (Controls, Page Objects, Flows, App
  factory, Diagnostics, Timeouts) to the E Ink Reader.
- Define the project boundary, directory layout, tooling, and scripts.
- Map every manual test case (S001-, F001-, T001-, M001-, R001-, P001-, ST001-,
  the M00 boundary matrix, N00/O00 pairwise, P00 journeys, Q00-V00) to concrete
  spec files and data-driven tables.
- Specify the **Standard Post-Action Oracle** as a reusable support helper.
- Define the fixture catalog and the product `data-testid` contract to add.
- Define coverage traceability and exit criteria.

Out of scope: writing spec code, page-object code, or fixtures; changing the
runtime app (except the additive `data-testid` contract in K00, which is a
product change to be scheduled, not part of this plan's execution).

---

B00 Guiding Principles (Inherited From The Reference Suite)

---

These principles are mandatory for the implementation phase.

1. **Test the product as the user sees it.** The only contract is the rendered
   DOM plus stable hooks. See E00 principle in the reference vision doc.

2. **Never import product source.** Tests must not `import` anything from the
   app's `js/` modules. The reader exposes `window.__einkReader` as a *runtime*
   test hook; using it through `page.evaluate` is a DOM/runtime-contract read,
   not a source import, and is allowed for state assertions and preference
   seeding. Do not read app constants by importing files.

3. **Tests read like user intent, not raw locators.**

   Weak:
   ```ts
   await page.locator("#reader-footer button:nth-child(3)").click();
   ```
   Strong:
   ```ts
   await reader.goToNextPage();
   await reader.expectReady();
   ```

4. **Layered object model.** Controls -> Page Objects (with sub-objects) ->
   Flows -> Specs. Each layer has one responsibility (reference B00).

5. **Bounded, condition-based waits only.** No fixed `waitForTimeout`. Use a
   `timeouts.waitUntil(predicate, {timeoutMs, description})` service that throws
   a diagnostic message naming what was awaited (reference `timeouts.ts`).

6. **Diagnostics on every test.** Capture console errors, page errors, and
   network requests. Unexpected console/page errors and any runtime network
   request are failures unless explicitly classified as a known limitation.

7. **A single App factory owns assembly.** Tests request page objects from the
   app and call `app.close()` in a `finally`/`afterEach`. Tests assemble
   nothing by hand (reference `automation-app.ts`).

8. **Stable, never-throwing existence checks.** `exists()` / `isVisible()` must
   return `false` for normal absence, never throw (reference `locator-controls.ts`).

---

C00 Key Adaptation: Extension Suite vs. Static-Page Suite

---

The reference suite tests a **Chrome extension** (persistent context, `dist`
artifact, iframes, minibuffer, stateful single-worker execution). The E Ink
Reader is a **plain static page**. This makes our suite simpler in several ways,
and the plan must exploit that simplicity rather than copy extension machinery.

| Concern | Reference (extension) | E Ink Reader (static) |
| --- | --- | --- |
| Launch | `launchPersistentContext` loading `dist` | `browser.newContext()` + `page.goto(server.url("/index.html"))` |
| Artifact | Built `dist` extension | Static app files served as-is (no build step) |
| Server | `local-test-server.ts` serves fixture pages | Static server serves the whole project dir **and** fixture files |
| Frames | Tool UIs live in iframes / FrameLocator | Single top-level document; no app iframes |
| Parallelism | `workers: 1` (shared stateful extension) | Can be **`fullyParallel`**; each test is an isolated context |
| State reset | Dirty-state management between tests | Fresh context per test; `localStorage` seeded per test |
| Command entry | Minibuffer commands | Direct UI: file picker, drag-drop, buttons, settings |

Consequences for the plan:

- No `launch-extension` module. Replace with a `browser-launch` helper that
  creates a fresh context with per-test options (viewport, `reducedMotion`,
  `colorScheme`, seeded `localStorage`).
- The App factory serves the **project root** statically and navigates to
  `index.html`; fixtures are served from `tests/fixtures/` under the same origin
  so no external network is needed.
- Because contexts are isolated, prefer `fullyParallel: true` with multiple
  workers for speed. Keep a single-worker fallback documented in case E Ink
  timing tests prove flaky under parallelism.
- `window.__einkReader` replaces the minibuffer as the primary state hook.

---

D00 Project Boundary And Location

---

Mirror the reference boundary decision: the suite is a **separate, self-owned
project** that lives beside the app but does not pollute the runtime.

Decision: create the suite at the app's project root:

```text
docs/public/2026-07-03-agentic-book-e-ink-reader-frank-lily-roman/
  ui-regression-test-suite/
    package.json
    bun.lock
    tsconfig.json
    playwright.config.ts
    README.md
    src/...
    tests/...        (fixtures + spec dirs; see H00)
```

Rationale:

- **Runtime stays dependency-free.** The hard constraints in `AGENTS.md` forbid
  npm / node_modules / bundler / framework *for runtime*. Playwright, Bun, and
  TypeScript are **developer-only** and confined to `ui-regression-test-suite/`.
  The shipped app (`index.html`, `css/`, `js/`, `vendor/`, `assets/`) is never
  touched by the suite's dependencies.
- **Boundary protection.** If the app's `js/` modules are refactored, the suite
  breaks only when the user-facing contract (DOM anchors, behavior) changes.
- The suite has its own `package.json` and lockfile, exactly like the reference.

Existing tests migration:

- `tests/smoke.mjs` (dependency-tolerant Node runner, ~10 checks) -> keep as a
  zero-dependency fast pre-check, or fold its assertions into the smoke layer.
  Recommendation: retain it as a lightweight "does the bundle load" gate and
  treat the Playwright smoke layer as the authoritative smoke suite.
- `tests/playwright/reader.spec.js` (flat, direct-selector `@playwright/test`
  spec) -> **supersede.** Its checks are re-expressed through Page Objects in
  the new suite. Delete only after coverage traceability (V00) confirms every
  assertion is reproduced.

Alternative considered and rejected: expanding the app's own `tests/` folder
in place. Rejected because it blurs the runtime/dev boundary and would place a
`node_modules` and `package.json` at the app root, contradicting the "static,
inspectable, no build" promise.

---

E00 Tooling And Configuration

---

Stack (identical to reference): **Bun** (runtime + package manager),
**TypeScript** (ESM, `type: module`), **Playwright** (`@playwright/test`).

`package.json` scripts (mirror the reference `validate` gate):

```jsonc
{
  "type": "module",
  "scripts": {
    "typecheck":       "tsc --noEmit",
    "test":            "playwright test",
    "test:smoke":      "playwright test src/specs/smoke",
    "test:files":      "playwright test src/specs/files",
    "test:markdown":   "playwright test src/specs/markdown",
    "test:navigation": "playwright test src/specs/navigation",
    "test:settings":   "playwright test src/specs/settings",
    "test:responsive": "playwright test src/specs/responsive",
    "test:privacy":    "playwright test src/specs/privacy",
    "test:pairwise":   "playwright test src/specs/pairwise",
    "test:journeys":   "playwright test src/specs/journeys",
    "validate":        "bun run typecheck && bun run test"
  }
}
```

`playwright.config.ts` (adapted from reference; key differences noted):

```ts
export default defineConfig({
  testDir: "src/specs",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,          // static page => isolated contexts (was false)
  workers: undefined,           // let Playwright pick (reference forced 1)
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1280, height: 900 } } },
    // responsive/mobile viewports set per-test via context options (see Q00)
  ],
});
```

Install (dev-only, inside the suite folder):

```bash
cd ui-regression-test-suite
bun add -d @playwright/test typescript
bunx playwright install chromium
```

Note: a globally installed Playwright exists on this machine
(`C:\Users\home\AppData\Roaming\npm\node_modules`, v1.61.x). The suite must
still own its dependency locally per the boundary rule; the global install is
only a convenience for ad-hoc runs.

---

F00 Directory Layout

---

```text
ui-regression-test-suite/
  package.json
  bun.lock
  tsconfig.json
  playwright.config.ts
  README.md
  src/
    config/
      suite-config.ts            # product-contract constants (prefs key, ranges, enums)
    framework/
      app/
        automation-app.ts        # createEinkReaderApp() factory
      browser/
        browser-launch.ts        # fresh context w/ viewport, reducedMotion, colorScheme, seeded storage
      controls/
        control-interfaces.ts    # ICtl* interfaces (reused from reference)
        locator-controls.ts      # Locator-backed impls (reused + Select/Range/Segmented)
      page-object/
        page-object-base.ts      # IPageObject / expectReady / expectedControls
      diagnostics/
        diagnostics.ts           # console + pageerror + network capture
      timeouts/
        timeouts.ts              # waitUntil + tiers (reused from reference)
      support/
        static-server.ts         # serve project root + fixtures on 127.0.0.1
        storage.ts               # localStorage read / seed / assert-no-content
        network-guard.ts         # assert no runtime network requests
        oracle.ts                # Standard Post-Action Oracle (E00 of manual plan)
        fixtures.ts              # fixture path + marker registry
    page-objects/
      open-screen/
        open-screen.page.ts
      reader/
        reader.page.ts           # bar + stage + footer; sub-objects: paged-view, scroll-view
        paged-view.subobject.ts
        scroll-view.subobject.ts
      settings/
        settings.page.ts         # panel; sub-objects per section + diagnostics disclosure
      toast/
        toast.page.ts
      busy/
        busy.page.ts
    flows/
      open-file-by-picker.flow.ts
      open-file-by-drop.flow.ts
      apply-preferences.flow.ts
      switch-mode.flow.ts
      reload-preserving-preferences.flow.ts
    specs/
      smoke/          # F00 manual -> S001..S012
      files/          # G00 -> F001..F012
      txt/            # H00 -> T001..T006
      markdown/       # I00 -> M001..M015
      navigation/     # J00 modes R001..R008 + K00 page nav P001..P010
      settings/       # L00 ST001..ST008 + M00 boundary matrix
      responsive/     # Q00 viewports
      accessibility/  # R00 A11Y001..A11Y008
      privacy/        # T00 PR001..PR007 + V00 offline OFF001..OFF006
      eink/           # U00 INK001..INK010 (automatable subset; visual = manual)
      pairwise/       # N00/O00 PW001..PW012
      journeys/       # P00 J001..J007
  tests/
    fixtures/         # see G00 catalog
```

---

G00 Fixture Catalog

---

Fixtures live under `ui-regression-test-suite/tests/fixtures/`. Each carries a
unique text marker so assertions never match against large text blocks. All
fixtures are local; none reference reachable network resources.

Source of truth: manual plan C00. Existing app fixtures in
`tests/fixtures/` (simple.txt, simple.md, long-book.txt, code-heavy.md,
large-headings.md, markdown-edge-cases.md, unicode.txt, one-long-line.txt,
whitespace.txt, empty.txt, unsupported.pdf) are **reused / renamed** into the
catalog below; missing ones are created.

| Fixture | Marker(s) | Status |
| --- | --- | --- |
| `simple-prose.txt` | `FIXTURE_SIMPLE_TXT_TITLE` | rename from simple.txt |
| `long-book.txt` | `FIXTURE_LONG_BOOK_CH1` | exists |
| `one-long-line.txt` | `FIXTURE_ONE_LONG_LINE` | exists |
| `unicode-mixed.txt` | `FIXTURE_UNICODE_CYRILLIC_MARKER` | rename from unicode.txt |
| `empty.txt` | (none; empty) | exists |
| `whitespace-only.txt` | (whitespace only) | rename from whitespace.txt |
| `standard-markdown.md` | `FIXTURE_STANDARD_MD_HEADING` | rename from simple.md |
| `code-heavy-notes.md` | `FIXTURE_CODE_HEAVY_JS_SNIPPET` | rename from code-heavy.md |
| `unsafe-markdown.md` | `FIXTURE_UNSAFE_SCRIPT_MARKER` + `window.__unsafeMarkdownExecuted` sentinel | create |
| `markdown-table.md` | `FIXTURE_MD_TABLE_CELL` | create |
| `malformed-markdown.md` | `FIXTURE_MALFORMED_MD` | rename/extend markdown-edge-cases.md |
| `many-headings.md` | `FIXTURE_MANY_HEADINGS` | rename from large-headings.md |
| `large-accepted.md` | `FIXTURE_LARGE_ACCEPTED` | create (near warning threshold) |
| `too-large.txt` | `FIXTURE_TOO_LARGE` | create (exceeds hard limit if one exists) |
| `unsupported.pdf` | binary placeholder | exists |
| `unsupported.json` | valid JSON | create |
| `remote-image.md` | `FIXTURE_REMOTE_IMAGE_ALT` (points at https://example.com/image.png) | create |
| `links.md` | `FIXTURE_LINKS_EXTERNAL` (external + mailto + relative + malformed) | create |
| `crlf-endings.txt` / `cr-endings.txt` | for T006 line-ending normalization | create |

Sentinel detail for `unsafe-markdown.md`: embed constructs that *would* set
`window.__unsafeMarkdownExecuted = true` if executed (inline handler, script
tag, `javascript:` URL, `<img onerror>`). M014 asserts the flag stays `undefined`.

**Open product question (record, do not decide here):** manual plan F010 asks
whether a hard file-size limit exists. `doc_detailed_project_description.md`
documents a large-file *warning* threshold; confirm during implementation
whether a hard *reject* limit exists. If not, `too-large.txt` becomes a
documented product-risk fixture and F010 records a recommendation to add one.

---

H00 Adapted Object Model

---

### H01 Controls (reused, lightly extended)

Reuse the reference `control-interfaces.ts` / `locator-controls.ts` verbatim
where possible:

- `ICtlBase` — `name`, `exists()`, `isVisible()` (never throw).
- `ICtlButton` — `click()`, `isEnabled()`.
- `ICtlTextInput` — `setValue()`, `getValue()`, `clear()`, `press()`.
- `ICtlStatus` — `getText()`.
- `LocatorCtlElement` — generic presence/visibility anchor.

Add reader-specific controls (the settings UI needs them):

- `ICtlSelect` / `LocatorCtlSelect` — `selectValue(v)`, `getValue()`, `options()`.
  Backs `data-select` dropdowns (fontFamily, theme, refreshStyle, ...).
- `ICtlRange` / `LocatorCtlRange` — `setValue(n)`, `getValue()`.
  Backs `data-range` sliders (fontSize, lineHeight, measure, paraSpacing,
  textureStrength, margin).
- `ICtlSegmented` / `LocatorCtlSegmented` — `choose(value)`, `selectedValue()`.
  Backs `data-seg` + `data-value` segmented controls (readerMode, eink intensity,
  motion, ...), reading `aria-pressed`.

Every control keeps a human-readable `name` for diagnostics.

### H02 Page Objects (mapped to reader surfaces)

`PageObjectBase(app, surfaceName)` reused: default `expectReady()` waits for the
surface to exist, then each `expectedControls()` entry to be visible, emitting a
diagnostic naming the surface + missing control + recent errors.

App surfaces mapped from `doc_detailed_project_description.md`:

- **`OpenScreenPageObject`** — surface `#open-screen`.
  Controls: dropzone (`#dropzone`), file input (`#file-input`), open button
  (`#open-button`), notice/error region (`#open-notice`), RSS link (`.rss-link`).
  Methods: `expectReady()`, `openByPicker(fixture)`, `dropFile(fixture)`,
  `dropFiles([...])`, `noticeText()`.

- **`ReaderPageObject`** — surface `#reader`.
  Controls: title (`#reader-title`), in-reader open (`#open-button-2`),
  settings button (`#settings-button`), stage (`#reader-stage`),
  prev/next (`#prev-page`/`#next-page`), tap zones (`#zone-prev`/`#zone-next`),
  progress (`#progress`), busy overlay (`#busy` -> BusyPageObject).
  Sub-objects: `pagedView` (`#page-viewport`, `#paper`) and `scrollView`
  (`#reader-scroll`), each with own `expectedControls()`/`expectReady()`.
  Methods: `expectReady()`, `title()`, `openAnotherFile...`, `openSettings()`,
  `goToNextPage()`, `goToPrevPage()`, `pressArrowNext/Prev()`, `tapNext/Prev()`,
  `progressText()`, `currentMode()` (reads `#reader[data-mode]`),
  `switchToScroll()`, `switchToPaged()`.
  Reads reader attributes for the oracle: `data-mode`, `data-eink`,
  `data-progress`, `data-motion` on `#reader`; `data-theme`/`data-contrast`
  on `<html>`.

- **`SettingsPageObject`** — surface `#settings-mount` panel (scrim
  `[data-close="scrim"]`, close `[data-close="button"]`).
  Sub-objects per section (Text, Reading, Theme, E Ink, Diagnostics).
  Controls via `data-seg`/`data-select`/`data-range` + `data-action`
  (copy-logs, clear-logs, reset-prefs) + log view (`data-log-view`).
  Methods: `open()`, `close()`, `closeWithEscape()`, `setMode(v)`,
  `setTheme(v)`, `setEinkIntensity(v)`, `setMotion(v)`, `setFont(v)`,
  `setFontSize(n)`, `setLineHeight(n)`, `setMeasure(n)`, `setParaSpacing(n)`,
  `setTextureStrength(n)`, `setMargin(n)`, `setRefreshStyle(v)`,
  `resetPreferences()`, `copyLogs()`, `clearLogs()`, `expandDiagnostics()`.

- **`ToastPageObject`** — surface `#toast`. `isShown()`, `text()`, `waitHidden()`.

- **`BusyPageObject`** — surface `#busy` (+ `#busy-label`). `isShown()`,
  `label()`, `waitHidden()`.

### H03 App Factory

`createEinkReaderApp(options?)` (mirrors `automation-app.ts`) owns assembly:

```ts
interface EinkReaderAppOptions {
  viewport?: { width: number; height: number };
  reducedMotion?: "reduce" | "no-preference";
  colorScheme?: "light" | "dark" | "no-preference";
  seededPreferences?: Partial<ReaderPreferences>;   // written to localStorage before goto
  seededPreferencesRaw?: string;                    // for corrupted-pref tests (P00 J006)
}

interface EinkReaderApp {
  page: Page;
  context: BrowserContext;
  diagnostics: UiDiagnostics;
  timeouts: UiTimeouts;
  storage: StorageInspector;
  network: NetworkGuard;
  openScreen(): OpenScreenPageObject;
  reader(): ReaderPageObject;
  settings(): SettingsPageObject;
  toast(): ToastPageObject;
  busy(): BusyPageObject;
  close(): Promise<void>;
}
```

Responsibilities: start the static server (once per worker, reused), create a
fresh context with the options, seed `localStorage` via `addInitScript` **before**
navigation (so preferences and corrupted-pref cases apply at boot), attach
diagnostics + network capture to the page, `goto(index.html)`, construct all page
objects with explicit injection, and expose `close()`.

Tests never launch browsers or build page objects by hand:

```ts
let app: EinkReaderApp;
test.beforeEach(async () => { app = await createEinkReaderApp(); });
test.afterEach(async () => { await app.close(); });
```

### H04 Flows

Reusable multi-step journeys (reference `flows/` pattern; explicit dependency
objects, no raw locators, reuse-if-already-open):

- `openFileByPickerFlow(app, fixture)` — set input files, wait reader ready.
- `openFileByDropFlow(app, fixture)` — dispatch DataTransfer drop on dropzone.
- `applyPreferencesFlow(app, prefsPatch)` — open settings, apply each field in a
  **deterministic order** (manual plan N00), close, return. Order fixed so
  pairwise runs are reproducible.
- `switchModeFlow(app, target)` — open settings, set mode, close, confirm surface.
- `reloadPreservingPreferencesFlow(app)` — reload, assert open screen shown,
  reader hidden, preferences intact, no content restored (privacy core).

---

I00 Diagnostics, Timeouts, Storage, Network

---

- **Diagnostics** (`diagnostics.ts`, reused): `attachToPage(page)` listens for
  `console` errors and `pageerror`; exposes `consoleErrors()`, `pageErrors()`,
  `recentErrorsSummary(limit)`, `clear()`. Attached at context creation.

- **Timeouts** (`timeouts.ts`, reused): tiers `short`/`normal`/`long` +
  `waitUntil(predicate, {timeoutMs, description})`. All readiness waits go
  through this. No `waitForTimeout`.

- **Storage** (`storage.ts`, new): `read()` returns all keys/values;
  `seed(prefs)` / `seedRaw(str)` via init script; `assertOnlyPreferences()`
  fails if any key other than `eink-reader:preferences` exists, and fails if the
  preferences payload contains book-derived content (paragraph text, code
  snippets, source Markdown, parsed HTML, excerpts, indexes). Central to T00.

- **Network guard** (`network-guard.ts`, new): subscribe to `context.on("request")`;
  record every request. Allowed origins: the local static server only. Any other
  request (http/https/data-image fetch) is a failure. Enforces the app's
  `connect-src 'none'` CSP and offline promise (manual plan D00, V00).

---

J00 Standard Post-Action Oracle

---

The single most important reusable helper. Implement `expectStandardOracle(app,
expected)` in `support/oracle.ts`, invoked after **every** interaction test
unless the test intentionally expects an error state. Maps manual plan E00
directly.

Baseline checks (always):

```text
- No uncaught page error (diagnostics.pageErrors() empty).
- No unexpected console error (diagnostics.consoleErrors() empty / classified).
- Busy overlay hidden after action settles (BusyPageObject.waitHidden()).
- No E Ink overlay stuck (eink overlay not visible after settle).
- #open-screen and #reader are not both active simultaneously.
- Settings panel open/closed state == expected.
- #reader[data-mode] in {paged, scroll}.
- <html>[data-theme] in {warm-paper, cool-paper, high-contrast, dark}.
- #reader[data-eink] in {off, reduced, balanced, strong}.
- Progress region visible when a doc is open and progress enabled.
- #reader-title non-empty when a doc is open.
- Content area has non-zero width/height.
- No body-level horizontal overflow (scrollWidth <= clientWidth on documentElement).
- storage.assertOnlyPreferences() (no file content persisted).
- network.assertNoUnexpectedRequests().
```

Mode-specific (paged): `#page-viewport` visible, `#reader-scroll` hidden, page
nav controls present, progress shows a page-like state, page index in range,
next/prev never yield negative or empty pages.

Mode-specific (scroll): `#reader-scroll` visible, `#page-viewport` hidden, stage
scrolls when content exceeds viewport, no heavy repeated refresh on normal
scroll, no body horizontal overflow.

Settings-change-specific: selected value reflected in UI; corresponding DOM
attribute / CSS variable / rendered behavior changed; document still readable;
reading position approximately preserved; no invalid CSS (no negative padding,
no NaN dimensions).

The oracle takes an `expected` descriptor so each test declares its expected
mode/theme/eink/settings-open state; the helper asserts the rest as invariants.

---

K00 Product data-testid Contract (Additive, Scheduled Separately)

---

The reader already exposes strong anchors: stable IDs (`#reader`,
`#settings-button`, `#page-viewport`, `#reader-scroll`, `#prev-page`,
`#next-page`, `#progress`, `#busy`, `#toast`, ...) and semantic settings hooks
(`data-seg`+`data-value`, `data-select`, `data-range`, `data-close`,
`data-action`, `data-log-view`). The plan's Page Objects can be built on these
today.

Recommendation, following reference C00: add a small set of `data-testid`
attributes to the product for elements that lack a stable, semantic hook, using
the format `<feature>-<surface>-<type>-<name>` (lowercase, dash-separated). This
is a **product change** to schedule as its own pass; the suite consumes the
rendered attributes and never imports product constants.

Candidate additions (only where current anchors are weak):

```text
open-screen-region-dropzone           (#dropzone)
open-screen-button-open               (#open-button)
open-screen-status-notice             (#open-notice)
open-screen-link-rss                  (.rss-link)
reader-bar-button-settings            (#settings-button)
reader-bar-button-open                (#open-button-2)
reader-footer-button-prev             (#prev-page)
reader-footer-button-next             (#next-page)
reader-footer-status-progress         (#progress)
reader-zone-prev / reader-zone-next   (tap zones)
reader-content-image-placeholder      (blocked remote-image placeholder)
reader-content-link-external          (safe external links)
toast-status-message                  (#toast)
busy-status-label                     (#busy-label)
settings-button-reset                 (data-action="reset-prefs")
```

Until/unless these are added, Page Objects use the existing IDs and
`data-seg`/`data-select`/`data-range` hooks. `getByTestId` is preferred where a
`data-testid` exists; otherwise ID + role locators. Playwright's testIdAttribute
stays the default `data-testid`.

---

L00 Test Layer Mapping (Manual Plan -> Specs)

---

Layers run in this order (fail fast): smoke -> single-feature -> pairwise ->
journeys (manual plan B00, reference E00).

| Manual section | Cases | Spec directory / file(s) |
| --- | --- | --- |
| F00 Smoke | S001-S012 | `specs/smoke/*.smoke.spec.ts` (boot, metadata, picker txt/md, drop txt/md, unsupported reject, settings open/close, page nav, mode switch, reload privacy, reduced motion) |
| G00 File input | F001-F012 | `specs/files/file-input.spec.ts` (+ data table) |
| H00 TXT rendering | T001-T006 | `specs/txt/txt-rendering.spec.ts` |
| I00 Markdown | M001-M015 | `specs/markdown/markdown-rendering.spec.ts`, `markdown-safety.spec.ts` |
| J00 Reader modes | R001-R008 | `specs/navigation/reader-modes.spec.ts` |
| K00 Page navigation | P001-P010 | `specs/navigation/page-navigation.spec.ts` |
| L00 Settings | ST001-ST008 | `specs/settings/settings-basic.spec.ts` |
| M00 Setting boundary matrix | 17 settings x {min,nominal,max,out-of-range} | `specs/settings/setting-boundaries.spec.ts` (data-driven) |
| N00/O00 Pairwise | PW001-PW012 | `specs/pairwise/pairwise.spec.ts` (data-driven seed matrix) |
| P00 Journeys | J001-J007 | `specs/journeys/*.journey.spec.ts` (Lily, Frank, Roman, unsafe, reduced-motion, corrupted-pref, rapid-interaction) |
| Q00 Responsive | 7 viewports | `specs/responsive/responsive.spec.ts` (data-driven viewports) |
| R00 Accessibility | A11Y001-A11Y008 | `specs/accessibility/a11y.spec.ts` |
| S00 Error messages | E001-E010 | folded into `files/` + `markdown/` with copy-class assertions |
| T00 Privacy/storage | PR001-PR007 | `specs/privacy/privacy-storage.spec.ts` |
| U00 E Ink effects | INK001-INK010 | `specs/eink/eink-effects.spec.ts` (automatable subset; credibility = manual) |
| V00 Offline/vendor/metadata | OFF001-OFF006 | `specs/privacy/offline-metadata.spec.ts` |

### L01 Data-driven tables (W00 row schema)

Boundary, pairwise, responsive, and file-input suites are **data-driven**. Each
row follows the manual plan W00 schema:

```ts
interface TestRow {
  id: string;                    // e.g. "PW003", "F007", "BND-fontSize-max"
  fixture: string;               // fixture file name
  viewport?: { width: number; height: number };
  initialPreferences?: Partial<ReaderPreferences>;
  actions: (ctx) => Promise<void>;
  expected: OracleExpectation;   // mode/theme/eink/settings-open + feature assertions
  recovery?: (ctx) => Promise<void>;
}
```

Validator ranges to encode in `suite-config.ts` (from manual plan M00 /
`doc_detailed_project_description.md`): fontSize 14-34, lineHeight 1.2-2.1,
measure 40-100, paraSpacing 0.2-2, textureStrength 0-1, margin 8-80. Out-of-range
cases are injected via seeded `localStorage` (H03 `seededPreferencesRaw`) to
prove the app clamps/validates on boot rather than through the UI (sliders can't
exceed their own min/max).

### L02 Pairwise factors (N00)

12 factors with a fixed deterministic apply order (readerMode, theme, eink
intensity, motion, font, fontSize, lineHeight, measure, paraSpacing,
textureStrength, margin, fixture type). The PW001-PW012 seed matrix (manual plan
O00) is encoded as a table; each row runs `applyPreferencesFlow` then the oracle.

### L03 Journeys (P00)

- J001 Lily: open md by drop, read, adjust font size + theme, recover from a
  wrong file, reload, confirm calm state + preferences kept + no content stored.
- J002 Frank: long-book, page mode long session, tune measure/lineHeight/margin,
  switch modes, verify typography + progress + no overflow.
- J003 Roman: code-heavy-notes.md on mobile viewport, verify code containment,
  links safe, diagnostics panel, offline + no content persisted.
- J004 Unsafe: unsafe-markdown.md, assert sentinel unset, no network, escaped HTML.
- J005 Reduced-motion: reducedMotion context, verify softened E Ink across actions.
- J006 Corrupted preferences: seed invalid JSON / out-of-range raw prefs, boot,
  verify graceful fallback to defaults + calm notice, no crash.
- J007 Rapid interaction: fast page turns + settings toggles + mode switch mid
  E Ink transition; assert no stuck overlay, valid final state (manual R008).

---

M00 Selector Strategy

---

Priority order for locators (reference C00 + manual plan W00):

1. `getByTestId(...)` where the K00 contract adds one.
2. Existing stable IDs (`#reader`, `#page-viewport`, ...) via `page.locator("#id")`.
3. Semantic settings hooks: `[data-seg="readerMode"][data-value="scroll"]`,
   `[data-select="theme"]`, `[data-range="fontSize"]`, `[data-close="button"]`,
   `[data-action="reset-prefs"]`.
4. Accessible roles/names (`getByRole("button", { name: /settings/i })`).

Forbidden: `nth-child`, deep CSS descendant chains, generated class names, XPath
positional selectors, fixed sleeps. If a selector proves unstable, add a
`data-testid` to the product (K00) rather than hardening a brittle locator.

---

N00 Coverage Traceability

---

Maintain a traceability table (in the suite README or a `coverage-matrix.md`)
mapping every manual case ID to its automated spec and status:

```text
Manual ID | Manual section | Spec file | Test title | Automated? | Notes
S001      | F00            | smoke/boot.smoke.spec.ts | boots to open screen | yes |
...
INK005    | U00            | eink/eink-effects.spec.ts | ghost layer clears | partial | visual credibility = manual
```

Rows marked `manual-only` (E Ink visual credibility, comfort judgments) are
retained as documented manual checks per manual plan U00, not silently dropped.

---

O00 Automatable vs. Manual-Only

---

Automatable with Playwright: boot, metadata head tags, file picker
(`setInputFiles`), drag-drop (DataTransfer dispatch), rendering structure
(headings/lists/code/tables present), Markdown safety (sentinel + escaped HTML +
no network), mode surfaces + attributes, page navigation counts/bounds, settings
value reflection + attribute/CSS-var changes, boundary clamping, pairwise
combinations, responsive layout (no overflow, viewport-conditioned UI),
accessibility (roles, focus order, Escape, aria-pressed), localStorage privacy,
offline/no-network, reduced-motion behavior toggles, error message copy classes.

Manual-only (retained in the manual plan, referenced from N00 as `manual-only`):
whether the E Ink refresh *feels* credible, reading comfort, typography
aesthetics, and subjective calm. Automated tests assert the *mechanics*
(overlay appears/clears, grayscale flash occurs when enabled, softened under
reduced motion) but not the aesthetic judgment.

---

P00 Execution Order And CI Gate

---

Local / CI order (manual plan X00, reference E00):

```text
1. bun run typecheck
2. bun run test:smoke        (fail fast if boot broken)
3. bun run test:files test:txt test:markdown
4. bun run test:navigation test:settings
5. bun run test:responsive test:accessibility test:privacy test:eink
6. bun run test:pairwise
7. bun run test:journeys
```

Canonical gate: `bun run validate` (typecheck + full `playwright test`). This is
the single command reviewers and CI run, matching the reference `validate` gate.

Because the app is static and each test uses an isolated context, the suite can
run `fullyParallel`. If E Ink timing tests prove flaky under parallelism,
document and pin those specs to a serial project rather than forcing the entire
suite to `workers: 1`.

---

Q00 Implementation Phases (For The Later Build Pass)

---

The build pass should proceed in dependency order so each layer is validated
before the next depends on it:

1. **Scaffold**: suite folder, package.json, tsconfig, playwright.config,
   install deps, `bunx playwright install chromium`, `typecheck` green.
2. **Framework core**: port `timeouts.ts`, `diagnostics.ts`,
   `control-interfaces.ts`, `locator-controls.ts` (+ Select/Range/Segmented),
   `page-object-base.ts`. Add `static-server.ts`, `browser-launch.ts`,
   `storage.ts`, `network-guard.ts`.
3. **App factory + one page object + one smoke test**: `createEinkReaderApp`,
   `OpenScreenPageObject`, S001 boot smoke. Prove the vertical slice.
4. **Remaining page objects + oracle**: Reader (+ sub-objects), Settings, Toast,
   Busy; `oracle.ts`. Complete the smoke layer S002-S012.
5. **Fixtures**: create/rename per G00, embed markers + unsafe sentinel.
6. **Single-feature specs**: files, txt, markdown, navigation, settings,
   boundary matrix, responsive, accessibility, privacy, eink, offline.
7. **Pairwise + journeys**: data-driven PW matrix; J001-J007.
8. **Traceability + gate**: fill coverage matrix, wire `validate`, document
   manual-only items, retire `tests/playwright/reader.spec.js` once superseded.
9. **(Optional, separate product pass)**: add K00 `data-testid` attributes to
   the app and migrate weak locators.

---

R00 Risks And Open Questions

---

- **Hard file-size limit (F010):** confirm whether a hard reject limit exists;
  if only a warning threshold exists, record a product risk and recommend a hard
  limit. Do not fabricate `too-large.txt` behavior.
- **Pagination timing:** `doc_detailed_project_description.md` notes pagination
  must be measured only after `document.fonts.load` for lazy Literata. Tests must
  wait on reader `expectReady()` (which encapsulates that), not on arbitrary
  delays, to avoid flaky page counts.
- **Local server MIME:** the app's own `scripts/serve-static.mjs` lacks an `.xml`
  MIME mapping (serves `feed.xml` as octet-stream). The suite's `static-server.ts`
  must serve correct MIME types (including `.md`, `.markdown`, `.txt`, `.xml`) so
  fixture loads and metadata checks behave like production hosting.
- **Drag-drop simulation:** file drop must be simulated via a synthetic
  DataTransfer + dispatched events; verify the app's drop handler reads
  `dataTransfer.files`. Validate the technique in phase 3 before building F00x.
- **Reduced-motion + E Ink:** assert mechanics, not aesthetics; keep visual
  credibility as manual-only.
- **Parallelism flakiness:** if E Ink/pagination timing is flaky under parallel
  workers, isolate those specs serially rather than serializing everything.

---

S00 Exit Criteria

---

The automated suite is complete (manual plan Y00) when:

```text
- ui-regression-test-suite/ exists as a self-owned Bun+TS+Playwright project;
  runtime app remains dependency-free and untouched (except scheduled K00 pass).
- bun run typecheck passes.
- bun run validate passes locally and in CI.
- Smoke layer S001-S012 automated and green.
- Single-feature layers (files, txt, markdown, navigation, settings, boundary,
  responsive, accessibility, privacy, eink, offline) automated and green.
- Pairwise PW001-PW012 automated and green.
- Journeys J001-J007 automated and green.
- Standard Post-Action Oracle runs on every interaction test.
- No test imports product source; only rendered DOM + window.__einkReader hook.
- Network guard proves zero unexpected runtime requests across the suite.
- Storage inspector proves only eink-reader:preferences persists, never content.
- Coverage matrix maps every manual case ID to a spec or a documented
  manual-only / product-risk note.
- tests/playwright/reader.spec.js is superseded and removed (or justified).
```

---

T00 Inputs And References

---

- Manual test plan: `specs/tests-manual-plan-v01.md` (A00-Y00) — the behavior to automate.
- App documentation: `doc_detailed_project_description.md` — surfaces, DOM anchors, prefs, ranges.
- Architecture authority (read-only): `D:\my-github\unsafe-link-preview-browser-extension\ui-regression-test-suite`
  - `specifications/00-MAIN-VISION.md`, `A00`-`E00` specs, `F00`-`J00` guides.
  - `src/framework/{app,controls,page-object,diagnostics,timeouts}`, `src/support/fixtures/local-test-server.ts`, `src/specs`, `src/flows`.
- Project rules: `AGENTS.md` (runtime hard constraints; dev-only tooling allowed).
