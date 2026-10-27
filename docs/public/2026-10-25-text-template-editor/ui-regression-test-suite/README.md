# Guided browser acceptance

An independent external acceptance application for Guided, including the major
UX change request. Seven registry-generated surface tests and two grouped smoke
tests gate 31 acceptance cases: AC01-AC17 (three storage variants of AC13 and
twelve isolated appearance variants of AC17) and
FW01's nondestructive opening/action-isolation contract. Twenty-eight infrastructure
tests protect isolation, provenance, registry completeness, and orchestration.
Seven optional capture cases use the same registry/runner. See [COVERAGE](COVERAGE.md) for
actual assertions, domain-test counterparts, and remaining verification limits.

## Install and run

From the Guided root, with globally installed Bun:

```powershell
bun install
bun run build
Set-Location ui-regression-test-suite
bun install --frozen-lockfile
bunx playwright install chromium
bun run test:all
```

The suite owns and commits its own lockfile. Product runtime dependencies remain
vendored; none of these packages ship in Guided. TypeScript 7.0.2 checks the suite.
The separately named `typescript-compiler-api` dependency pins TypeScript 6.0.3 as
an AST/module-resolution library because TypeScript 7's default export no longer
provides the stable compiler API. The typecheck command explicitly invokes the
7.0.2 compiler to avoid the aliased package's competing `tsc` binary.

| Command                    | Purpose                                                                                       |
| -------------------------- | --------------------------------------------------------------------------------------------- |
| `bun run typecheck`        | Two-way boundaries, compiler-based registry completeness, and strict TypeScript               |
| `bun run test:unit`        | Infrastructure failure cases, without a browser                                               |
| `bun run test:smoke`       | Seven universal Page Object cases plus SM01/SM02                                              |
| `bun run test:acceptance`  | Smoke dependencies, then AC01-AC17 and FW01                                                   |
| `bun run test:all`         | Boundary/type/registry checks, infrastructure, smoke and acceptance; no optional capture      |
| `bun run test:capture`     | Seven independent full-page PNG captures after the same validation pipeline                   |
| `bun run test:headed`      | Smoke and acceptance in visible Chromium                                                      |
| `bun run test:debug`       | Playwright interactive debugging                                                              |
| `bun run test:sensitivity` | Ten isolated defects, including universal smoke isolation/acceptance gating, with restoration |
| `bun run format:check`     | Suite-owned formatting check                                                                  |

The root `bun run test:browser` delegates to `test:all`. Do not run old root-level
Playwright commands; the previous 23 browser tests have been consolidated into
these journeys, not left as a second independently maintained runner.

For focused work, for example:

```powershell
bunx playwright test --project acceptance --grep 'SM0|AC05'
bunx playwright test --project smoke --project acceptance --workers 2 --fully-parallel --repeat-each 2
bunx playwright show-report ..\temp\ui-regression-test-suite\playwright-report
```

Keep smoke selected when using grep; `--no-deps` is not a release-validation gate.
Retries default to zero. A repeated failure must be investigated, not hidden.
A bare `playwright test` now includes the optional capture project; prefer the
documented scripts for the mandatory gate.

## Built SUT and server

By default Playwright starts the existing product `bun run preview` on port 4187,
never `file://` or an unbuilt TypeScript server. It owns/stops that server and
refuses to reuse an unknown process already occupying the port.

The product emits `dist/build-info.json`. Preflight independently checks source
membership/SHA-256 digests, every output digest, nonempty core bundles/CSS/HTML,
the template manifest and referenced GTL files. It then checks the server's
provenance and every deployed file's actual bytes, including GTL templates.
Missing/stale/modified builds fail
with a rebuild instruction before normal browser execution.

Configuration is through environment variables:

```powershell
$env:GUIDED_PORT = '4188'
$env:GUIDED_PRODUCT_ROOT = 'D:\path\to\another\Guided-checkout'
# Optional: an already running HTTP preview for that exact verified build.
$env:GUIDED_BASE_URL = 'http://127.0.0.1:4173/'
bun run test:all
```

`GUIDED_PRODUCT_ROOT` defaults to the parent of this suite, never the shell's
unrelated working directory. An external base URL must serve that verified
deployment, including `build-info.json`. AC06 also exercises the local preview's
`/editor/` subdirectory alias. Do not point this synthetic-data/destructive-test
suite at a real user's existing browser profile or production data.

An installed browser may be selected with
`PLAYWRIGHT_CHROMIUM_EXECUTABLE`. The normal reproducible route is Playwright's
matching Chromium installation. Firefox and Safari are not silently substituted
or claimed as validated by this Chromium suite.

## Architecture and contracts

See [Universal Page Object smoke and capture](docs/page-object-smoke-framework.md)
for registration, opening dependencies, completeness enforcement, action authoring,
failure stages, and artifact paths. Every concrete exported Page Object must be
registered. Optional actions run only after successful validation; capture never
modifies product state to improve an image.

`framework/guided-test.ts` uses Playwright's worker-scoped browser and fresh
scenario context/page. It owns additional same-context tabs and independent
contexts, attaches diagnostics, and disposes additional contexts. Playwright owns
tracing, failure screenshots/video, reporting, and worker recovery.

The per-test application factory wires seven surface Page Objects. Native answer
controls, confirmation/rename dialogs, and panel interaction justify reusable components. Three Flows
coordinate document creation, durable navigation, and two-tab conflict recovery.
Expected text/GTL lives in independently maintained `support/test-data.ts`;
downloads and clipboard bytes are compared to these explicit expected outcomes.
No Guided renderer, parser, domain service, template module, or type is imported.

Page Objects declare `expectedControls()` separately from focused fresh-open
`expectedDefaultControlState()`. Readiness observes, never repairs, focus. Tests
and Flows own outcomes; Page Objects/components own all product locators.
Gray-box IndexedDB/localStorage reads audit identities/durability; browser-only
capability and request overrides establish specific failure preconditions.
No source-derived oracle, product testing backdoor, or preseeded document claims
that user creation worked.

The boundary audit resolves imports/re-exports/type imports/dynamic imports and
`require`, including aliases and real paths; computed module loading, source
symlinks, configuration inheritance/references, outside includes/aliases, and
linked/workspace dependencies are rejected. This is a development compliance
check, not a hostile-code security sandbox. Filesystem hash inspection and the
sensitivity tool's isolated source mutation/build are infrastructure, not shared
acceptance implementations.

### Adopted test-ID inventory

IDs are independently encoded on both sides and never generated from entity
values. Repeated document rows expose separate `data-document-id` /
`data-storage-mode`; placeholders expose separate `data-placeholder-name`.
The Page Objects are the exact selector inventory.

| Surface                              | Adopted contract groups                                                                                                     |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Application and feedback             | `guided-app-main-region-*`, `...-status-startup`, `...-status-notice`, `...-alert-error`, `...-button-retry-initialization` |
| Document editing                     | `guided-documents-main-*`, `guided-templates-version-{select,group,radio}-*`                                                |
| Results and exports                  | `guided-documents-result-*`                                                                                                 |
| Template catalog and samples         | `guided-templates-{main,preview}-*`                                                                                         |
| Document navigation/drawer           | `guided-documents-navigation-*`, settings/authoring navigation buttons                                                      |
| Answer guidance/examples             | `guided-field-editor-main-*`, `guided-field-editor-examples-*`                                                              |
| Persistent panels and geometry       | `guided-panels-*`, `guided-workspace-main-*`, `guided-issues-main-*`                                                        |
| Settings schema controls             | `guided-settings-{main,compact}-{select,input}-<stable-setting-name>` and validation                                        |
| Authoring current/inspection/history | `guided-authoring-{main,source,preview,navigation,history}-*`                                                               |
| Rename                               | `guided-rename-main-*`                                                                                                      |
| Confirmation                         | `guided-confirmation-main-*`                                                                                                |

Repeated draft/checkpoint identities use separate data attributes. Test IDs
supplement, never replace, labels and native accessibility. Panel helpers expose
obscured controls through real collapse/open actions, never force-clicks or
product DOM mutation. Browser effect observers count real storage/worker
operations independently of product code.

## Diagnostics, artifacts, and privacy

All generated work belongs in the Git-ignored project-root `temp` folder.
Under `temp\ui-regression-test-suite`, HTML reports are in `playwright-report`,
failure evidence in `test-results`, and optional ID-named PNGs in the separate
`captures` test-specific directories. Previous generated files were preserved
under `temp\previous-runs`. Named business steps and Page Object errors identify the failed
surface/action. `ui-timings.json` and `browser-diagnostics.json` are per-scenario
attachments, with worker/context/page identities. Timings retain at most 100
operations; recent diagnostics at most 80
messages, plus five bounded critical samples and a sticky critical-failure flag.

Uncaught exceptions, crashes, failed critical JS/CSS/JSON/GTL requests, and console
errors containing `[critical]`, `uncaught`, `unhandled`, or `fatal` fail the test.
Handled product errors are asserted through the UI in AC07. Specific expected
resource failures are permitted only during their deliberate fault phase and the
allowance is removed before successful recovery. Warnings remain diagnostic.

Routine timings contain no authored values or URLs; diagnostic full URLs are
redacted and messages bounded. **Traces, screenshots, videos, and failure
assertions can contain scenario text.** Use synthetic fixtures only, keep
artifacts local/ignored, and review before sharing. Do not introduce telemetry-only
tests or automatically upload reports.

## Sensitivity and maintenance

`test:sensitivity` copies only necessary product/build files into a uniquely
owned temporary directory, installs the product's declared build dependencies,
mutates one behavior, rebuilds, and runs unchanged smoke/relevant acceptance.
It checks actual failed-test symptoms rather than counting a tooling error as
Caught. Every case restores exact source bytes, rebuilds, and verifies a passing
clean baseline. The live checkout and acceptance expectations are never edited.
Ignored `temp\ui-regression-test-suite\sensitivity-*` under the project root
preserves JSON reports/logs and classification.

Before a user-facing change, review relevant objects/Flows and
[COVERAGE](COVERAGE.md), extend the existing journey, build/test the product,
then run smoke and affected/full acceptance. Add a new browser test only for a
genuinely distinct workflow or failure precondition. Record contract changes and
actual validation in [VALIDATION](VALIDATION.md). See `AGENTS.md` and
`GUIDED-E2E-001` through `007` and `GUIDED-UX-008` through `011` in the root
architecture register, together with `GUIDED-E2E-012` for universal smoke/capture.
