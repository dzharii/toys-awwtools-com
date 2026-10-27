# Universal Page Object framework validation

Validated **2026-10-27** in
`D:\my-github\toys-awwtools-com\docs\public\2026-10-25-text-template-editor`.
The `C:\Home\my-github\...` tool paths resolve to the same checkout.

## Current scope and executed gates

Implemented `suggestions002-02-02-page-object-smoke-framework.md`: seven explicit
registered Page Objects, compiler-enforced completeness, one staged validation
pipeline, independently injected actions, and separate optional capture.
The existing SM01/SM02 and AC01-AC16 assertions remain intact. FW01 adds one
substantial framework contract journey rather than granular feature tests.
There are no registry exclusions, product-source imports, runtime dependency
additions, migrations, or new universal close APIs.

Environment remains Windows, Bun 1.3.9, Node 22.16.0, TypeScript 7.0.2,
Playwright 1.58.2 and matching Chromium 145.0.7632.6 (v1208). The existing
`typescript-compiler-api` alias supplies TypeScript 6.0.3 for source inspection.
Retries remain zero. Suite commands run from `ui-regression-test-suite`.

| Command                                              | Actual outcome                                                                                                 |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Product: `bun test tests\unit`                       | 75 passed; 252 assertions                                                                                      |
| Product: `bun run build`                             | Three TypeScript contexts and fresh browser/worker/template build passed                                       |
| Suite: `bun run typecheck`                           | Independent source boundaries, seven concrete registered surfaces with no exclusions, strict TypeScript passed |
| Suite: `bun run test:unit`                           | 28 passed; 76 assertions, including discovery of a subclass excluded by tsconfig                               |
| Suite: `bun run test:all`                            | All 28 mandatory browser cases passed: nine smoke and 19 acceptance                                            |
| Suite: focused startup/recovery stress command below | All 20 focused stress cases passed after the routing-lifecycle correction                                      |
| Suite: repeated parallel gate below                  | All 47 passed: nine smoke cases once, 19 acceptance cases twice                                                |
| Suite: `bun run test:capture`                        | All seven surfaces passed and produced stable full-page PNGs                                                   |
| Product and suite: `bun run format:check`            | Passed after final evidence documentation                                                                      |

Exact additional browser commands:

```powershell
bunx playwright test --project acceptance --grep 'FW01|AC07' --no-deps --repeat-each 10 --fully-parallel --workers 2 --output '..\temp\ui-regression-test-suite\framework-recovery-stress-results'
bunx playwright test --project smoke --project acceptance --workers 2 --fully-parallel --repeat-each 2 --output '..\temp\ui-regression-test-suite\parallel-test-results'
```

The final mandatory, parallel and capture logs are preserved as
`temp\ui-regression-test-suite\final-mandatory.log`, `final-parallel.log` and
`final-capture.log` in that same directory. The final chain passed after the
startup/routing corrections, not just before them. The mandatory smoke cases
produce no success screenshots; pre-existing acceptance visual attachments
remain intentionally available.

The compiler guard resolves actual base/class declarations rather than matching
names or filenames. Negative fixtures cover indirect inheritance, aliases,
same-base-file classes, nested exported namespaces, anonymous/default classes,
class expressions, tsconfig-excluded files, duplicates and incorrect factories.
Typed orchestration doubles cover ordering, short-circuiting, default policies,
second opening, critical diagnostics, action identity/failure, and screenshot
options/attachment/failure propagation without starting Chromium.

## Review-driven corrections and initialized startup

A bounded model-assisted review found that reopening closed guidance could select
the first field instead of retaining the active non-first field, and that
completeness missed classes beside the base or inside exported namespaces.
Both were corrected, with focused infrastructure coverage and the non-first
`benefit` field protected by FW01.

Returning from Settings by looking for a current history row was not a safe
opening strategy: the list clears its current-page marker outside Documents,
and an Archived filter can hide the working record. The product now exposes a
native **Documents** return button using its existing navigation event.
FW01 proves it returns nondestructively with the filter and exact saved work
unchanged. Authoring similarly returns from inspection to the current source.

Decoupling common fixture startup from Document Workspace readiness initially
waited only for shared host visibility. A sensitivity attempt then exposed a
real startup race: AC01 queried IndexedDB before initialization had created its
stores, producing `NotFoundError` before reaching the injected save defect.
That attempt remains honestly **Unverified**, not Caught; its preserved evidence
is `temp\ui-regression-test-suite\sensitivity-2026-10-27T03-33-41-171Z\summary.json`
relative to the project root.

The fixture now waits for the existing public startup status to disappear after
initialization, without requiring any document-only controls. FW01 deliberately
stalls the manifest, observes visible shared navigation while startup remains
pending, releases the request, and verifies initialized empty storage. Opening a
document then establishes the separate document prerequisite. All nine smoke
cases and FW01 passed the focused rerun before the complete mandatory gate.

Repeated parallel validation also exposed two test setup assumptions. FW01 now
selects its intended Project description template/style explicitly rather than
assuming the first background-indexed document contains `benefit`. More
importantly, trace evidence showed that disposing the manifest route during
initialization could leave a worker/resource request indefinitely pending.
The helper now separates `resume()` from `dispose()`, observes the actual stalled
request, and removes routing only after startup/indexing settles. AC07 uses the
same corrected lifecycle without dropping any recovery assertions. Earlier
failed-run evidence is preserved under
`temp\previous-runs\parallel-before-route-cleanup-fix` and
`temp\previous-runs\fw01-before-route-cleanup-fix`.

## Current defect sensitivity

Suite `bun run test:sensitivity` completed: **all ten defects Caught, with exact
source restoration, fresh rebuild, and a passing clean baseline after each**.
The evidence is
`temp\ui-regression-test-suite\sensitivity-2026-10-27T03-47-42-327Z\summary.json`
relative to the project root, with per-case logs and JSON reports beside it.
The isolated copied product was removed after evidence was written.

The new universal required-ID case breaks rich-copy readiness. It verifies
the expected document-surface failure, successful unrelated Navigation,
Authoring, Settings and Workspace Panels cases, and blocked acceptance.
The other nine mutations retain their existing field visibility/focus, collapse,
layout-write, pre-restore-source, durable-save, critical-error and light-dismiss
detectors, documented in the historical matrix below.

## Capture, local evidence, and limits

All generated screenshots, reports, scratch fixtures, and sensitivity copies now
belong under the literal Git-ignored project-root `temp` folder. Earlier artifacts
were preserved under `temp\previous-runs`, not discarded. AGENTS and the READMEs
make this the convention for future work too.

The final seven actual 1440x1000 full-page PNGs were inspected as
`temp\capture-contact-sheet.png`; earlier full-size Field Editor and Authoring
inspection also passed. All seven actual original paths and the contact sheet
were confirmed Git-ignored. The stable originals
live under `temp\ui-regression-test-suite\captures\<test-specific-directory>`.
Playwright also creates attachment copies; these are not additional capture
actions. The capture action does not click, focus, scroll, or alter preferences,
and the capture spec checks applicable focus remains unchanged afterward.
Full-page capture does not stitch independently scrolling panel contents.

The detailed contracts, commands, filenames, and extension instructions are in
[the framework guide](docs/page-object-smoke-framework.md); actual assertion
coverage and remaining limits are in [COVERAGE](COVERAGE.md). Chromium is the
executed browser gate, not new Firefox/Safari or manual screen-reader
certification. Immutable specifications/TODOs remain unchanged. No commit was
requested or created.

## Historical major UX validation

Validated **2026-10-26** in
`D:\my-github\toys-awwtools-com\docs\public\2026-10-25-text-template-editor`.
The `C:\Home\my-github\...` tool paths resolve to the same checkout.

### Scope

Implemented `suggestions001-02-change-request-major-ux-improvements.md` on top of
the initial application and independent acceptance framework. Two grouped smoke
tests gate 18 acceptance cases across AC01-AC16; AC13 runs in IndexedDB,
localStorage, and memory. The old 23 root browser tests were replaced, not kept
as a duplicate runner. Product and acceptance implementations remain independent.

The assertion register and verification limits are in [COVERAGE](COVERAGE.md).
Migration requirements are intentionally inapplicable under the overriding
AGENTS development directive. No compatibility converters or migration tests
were added; immutable specifications and their initial TODO plans were preserved.

### Executed gates

Environment: Windows, Bun 1.3.9, Node 22.16.0, TypeScript 7.0.2,
Playwright 1.58.2, matching Chromium 145.0.7632.6 (v1208). Retries: zero.
Commands run from the product root unless marked Suite.

| Command                                                                     | Actual outcome                                                                            |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `bun test tests\unit`                                                       | 75 passed; 252 assertions                                                                 |
| `bun run build`                                                             | Three TypeScript contexts passed; fresh browser/worker bundles and three templates built  |
| Suite: `bun run typecheck`                                                  | Strict TypeScript and two-way source/configuration boundary audit passed                  |
| Suite: `bun run test:unit`                                                  | 7 passed; 19 assertions                                                                   |
| Suite: `bunx playwright test --project acceptance --grep 'SM0\|AC07\|AC11'` | Both smoke gates, stalled-resource recovery, and native preview dismissal passed          |
| `bun run --cwd ui-regression-test-suite test:all`                           | All 20 browser tests passed with suite-owned preview server and verified build provenance |
| Suite: `bunx playwright test --workers 2 --fully-parallel --repeat-each 2`  | 38 passed: two smoke gates once, all 18 acceptance cases twice                            |

`bun run check` passed the final combined release gate: product formatting,
75 unit tests, three typechecks, fresh build, suite boundaries/typecheck,
seven infrastructure tests, and all 20 browser tests. Suite `format:check`
also passed. The subsequent final repeated parallel run passed all 38 cases.

The gate exercises actual built HTML/CSS/JavaScript, module-worker Dexie,
localStorage/Web Locks, memory mode, real downloads, plain/rich clipboard,
concurrent tabs, native input undo, and relative subdirectory deployment.
Geometry is measured at 1920/1366/768/360/320 widths, with additional short-mobile
editing checks, reduced motion, forced colors, and axe scans.

### Review-driven and browser-driven corrections

Three bounded model-assisted reviews covered panel foundations, lifecycle/refresh
races, and final catalog/panel/authoring integration. Actionable findings were
fixed and followed by targeted and full browser gates.

| Area                       | Corrected behavior and protection                                                                                                                                                                                                        |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shared panels              | Pointer-enabled global panel menu; no dock-divider dead zone; highest raised overlay handles Escape; connected focus fallbacks; correct left/right restoration; stable roving dock tabs; gesture and no-op side effects measured in AC08 |
| Responsive/layout recovery | Mobile dismissal does not overwrite desktop intent; corrupt layout warning cannot disappear merely by opening Issues; explicit retry/reset owns recovery; AC09-AC10                                                                      |
| Lifecycle refresh          | Generations/mutation epochs/revision guards prevent late lists removing new saves, rolling revisions back, or resurrecting deletion; focused product regressions                                                                         |
| Source persistence         | Concurrent newer edits remain dirty during checkpoint save; failed deletion releases controls; missing checkpoint changes nothing; distinct current-save/checkpoint failure; product tests and AC14-AC16                                 |
| Feedback and titles        | Successful retry clears stale transient failure; new save/restore clears old success notice; Unicode-bounded conflict titles; independent authoring heading/breadcrumb naming                                                            |
| Native source editing      | CRLF-backed diagnostic offsets use normalized textarea positions; separate readonly inspection preserves mounted current editor/undo; AC04, AC14                                                                                         |
| Discovery                  | Guidance match excerpts; title-weighted fuzzy ranking; stable search input; native explicit-preview focus and close return; focus restoration cannot reopen dismissed preview; AC11                                                      |
| Startup                    | Incremental background indexing does not block reopening/editing independently saved snapshots during an unrelated stalled fetch; its completion cannot dismiss an unrelated clipboard failure; AC07                                     |
| Authoring navigation       | Semantic draft/checkpoint focus survives status rerenders; New template from persistent navigation on Settings opens and focuses source; AC16                                                                                            |

The failed stalled-route cleanup attempt was a test-infrastructure defect:
unrouting before its asynchronous handler finished could double-handle the route.
The helper now waits for handled requests before removing its route. The tested
product requirement and assertions were retained. The initial sensitivity rerun
stopped on an ambiguous old focus-injection needle; it was not classified Caught.
The mutation now identifies only the document-focus path, and the critical-error
needle matches the current method signature. A subsequent preflight found the
new archive-save path also matched the old generic save needle; the probe now
uniquely targets ordinary document saving. All targets are checked before any
injections run.

An additional AC07 regression reproduced a real background-completion race:
the clipboard error's old text remained in a hidden banner after indexing
finished. The assertion now requires actual visibility, not merely retained
text, and background work no longer clears unrelated operation errors.

### Defect sensitivity

The runner injects nine isolated defects into uniquely owned temporary product
copies, never the live checkout or acceptance expectations. Each injected copy
is freshly built; an actual expected assertion failure is required. Every case
restores exact source, rebuilds, and revalidates a clean baseline. Tooling errors
are Unverified, never successful defect detection.

| Single defect                               | Expected independent detector            |
| ------------------------------------------- | ---------------------------------------- |
| Required answer test ID changed             | Field-editor readiness                   |
| Visible writing-style group hidden          | Smoke visibility                         |
| Activated document-field focus removed      | Observed focus contract                  |
| Panel body ignores collapse                 | Smoke hiding                             |
| Layout persisted on manipulation frames     | AC08 exact settled-write/effect counters |
| Pre-restore checkpoint loses current source | AC14 exact protected source              |
| Save claims success without persistence     | AC01 record/durability assertions        |
| Exercised path emits critical browser error | Sticky critical-diagnostics gate         |
| Export popover changed to manual            | Native light-dismissal assertion         |

Suite `bun run test:sensitivity` completed successfully: **all nine defects
Caught; all nine exact-restoration/rebuild/clean-baseline runs passed**.
The final evidence is
`temp\previous-runs\suite-artifacts\sensitivity-2026-10-26T21-11-20-832Z\summary.json`
relative to the project root, with per-case
JSON reports and build/test logs beside it. Earlier aborted probe runs remain
separately identified rather than being relabeled successful.

### Appearance, boundaries, and limitations

Reviewed fresh desktop writing/docked-field and readonly authoring-history
screenshots, plus the 320px editor screenshot from AC09. Titlebars, restoration
controls, answer focus, multiline scrolling, history/current distinction, and
reading surfaces are usable. Earlier milestone browser inspection covered
floating manipulation, authoring diagnostics, and safe historical restoration.

Readiness observes focus rather than repairing it. Gray-box effect/storage
observation independently verifies persistence and identity, not expected
rendering. All seven Page Objects and relevant components/Flows were updated;
exact selectors remain outside test bodies. Traces, reports, screenshots, videos,
dependencies, and sensitivity copies/artifacts stay local/ignored.

Chromium is the executed browser gate. Composition events are not a full OS IME
certification; viewport adaptation is not a physical software-keyboard test or a
native browser-toolbar 200% zoom run. Axe is not manual screen-reader
certification. Firefox remains practical secondary support; Safari remains
low-priority essential-only work. Hidden/page-close flushing cannot guarantee
crash durability. Recovery JSON has no automatic-import workflow.

Existing tracked deployment files were rebuilt, not discarded. No commit was
requested or created. Maintain acceptance impact through AGENTS, the architecture
decision register, and the assertion/limit register on subsequent changes.
