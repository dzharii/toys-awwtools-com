# Major UX implementation validation

Validated **2026-10-26** in
`D:\my-github\toys-awwtools-com\docs\public\2026-10-25-text-template-editor`.
The `C:\Home\my-github\...` tool paths resolve to the same checkout.

## Scope

Implemented `suggestions001-02-change-request-major-ux-improvements.md` on top of
the initial application and independent acceptance framework. Two grouped smoke
tests gate 18 acceptance cases across AC01-AC16; AC13 runs in IndexedDB,
localStorage, and memory. The old 23 root browser tests were replaced, not kept
as a duplicate runner. Product and acceptance implementations remain independent.

The assertion register and verification limits are in [COVERAGE](COVERAGE.md).
Migration requirements are intentionally inapplicable under the overriding
AGENTS development directive. No compatibility converters or migration tests
were added; immutable specifications and their initial TODO plans were preserved.

## Executed gates

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

## Review-driven and browser-driven corrections

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

## Defect sensitivity

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
`artifacts\sensitivity-2026-10-26T21-11-20-832Z\summary.json`, with per-case
JSON reports and build/test logs beside it. Earlier aborted probe runs remain
separately identified rather than being relabeled successful.

## Appearance, boundaries, and limitations

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
