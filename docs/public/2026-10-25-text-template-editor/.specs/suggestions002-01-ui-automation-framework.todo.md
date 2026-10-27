# Browser acceptance framework implementation TODO

Created: 2026-10-26
Source: `suggestions002-01-ui-automation-framework.md` (including its embedded
`suggestions002-02-01` contracts). This plan is immutable; execution is tracked
outside `.specs/`.

## Authority and existing-product boundary

- [ ] Apply the dated AGENTS.md directives: no migration implementation,
  migration validation, legacy-data conversion, or migration-specific tests;
  Chromium first, Firefox where practical, and essential-only Safari effort.
- [ ] Preserve the original specifications and their existing TODO companions.
  Link to the actual combined automation specification rather than inventing
  the separate specification files named by its embedded headings.
- [ ] Test the application currently implemented. Explicitly distinguish current
  coverage from the unimplemented `suggestions001-02` search/preselection
  previews, floating/docking/grouped panels, true dock-width recovery, text
  scaling, archive/restore/filter/Undo, independent authoring titles, and
  authoring checkpoint/history restoration. Do not report those as passing or
  replace their required outcomes with weaker claims.

## Reference learning and architecture

- [ ] Read the live extension regression suite's vision, architecture, control,
  Page Object, Flow, fixture, diagnostics, timing, focus inventory, isolation,
  boundary-check, and failure-injection implementations and their connections.
- [ ] Review adjacent reference-project source and tests: Prompt Menu panel and
  preset interactions; Skill editor source mirror/native editing; SovietRDTL
  state, storage, focus and responsive patterns; Emoji Nudge native dropdown,
  popover, clipboard and verification patterns; reference-kit provenance and
  original requirements. Record useful mechanisms and limitations.
- [ ] Adopt explicit dependency injection, declarative readiness, observable
  focus, bounded diagnostics and meaningful Flows. Do not copy extension
  launchers, persistent profiles, storage resets, commands, or cross-frame
  infrastructure.

## Isolated suite setup and integrity

- [ ] Create `ui-regression-test-suite/` with its own package, pinned lockfile,
  dependencies, strict TypeScript configuration, Playwright configuration,
  ignore rules, test data, expected results and maintenance documentation.
- [ ] Provide `typecheck`, `test:smoke`, `test:acceptance`, `test:all`,
  `test:headed`, and `test:debug`; provide infrastructure-unit validation.
- [ ] Keep Playwright/axe dependencies suite-owned. Consolidate the existing
  product browser workflows into the new comprehensive suite without losing
  their meaningful assertions; retain product unit/domain tests.
- [ ] Enforce both import directions using resolved module boundaries, including
  aliases, dynamic imports, configuration and symbolic-link escape cases.
  Never calculate expected results with product parser/renderer/services.
- [ ] Test built static deployment assets over HTTP with the existing preview
  server, configurable origin, correct worker/template resources, no reuse of
  an unverified server, and root/subdirectory hosting.
- [ ] Reject missing, incomplete, stale or mismatched builds with actionable
  errors. Cover build validation and boundary enforcement with independent
  temporary fixtures.

## Product automation contracts

- [ ] Add stable lowercase `data-testid` values to application roots, navigation,
  template cards, writing styles, placeholders, answer controls and examples,
  result/copy/export/status, Issues/recovery, settings, source authoring,
  diagnostic controls and confirmations.
- [ ] Keep repeated test IDs independent of record IDs and user content; expose
  entity/field identity separately. Preserve native labels, ARIA and Shadow DOM.
- [ ] Add no speculative controls for absent UX features.
- [ ] Verify explicit activation focuses the intended answer, confirmation or
  new source editor. Repair tightly coupled focus failures in product code,
  never by focusing from a readiness assertion.
- [ ] Verify transient export dismissal through Escape/outside interaction
  without consuming the underlying action; prefer native platform behavior.

## Framework and scenario implementation

- [ ] Use worker-reused Chromium with fresh contexts per independent scenario.
  Keep reloads and intentional tabs in the same context. Provide a second
  fixture-owned isolated context for order-independent isolation verification.
- [ ] Implement a per-scenario app factory, surface Page Objects, reusable
  answer/confirmation components, declarative expected controls and focused
  defaults, and condition-based timeout categories. Permanent surfaces have no
  fake Close method.
- [ ] Capture bounded page/console/resource errors, enforce critical-error
  failure, narrowly identify intentional injected failures, and attach useful
  diagnostics, privacy-conscious timings, screenshots, traces and HTML reports.
- [ ] Implement 1-2 compact grouped smoke checks, with smoke as the dependency
  gate for comprehensive acceptance.
- [ ] AC01: complete all existing bundled writing structures with independent
  expected text; nonsequential fields, examples, required gating, version-answer
  independence, untouched previews, rename, navigation/reload, real plain/rich
  clipboard and exact text/Markdown/HTML downloads.
- [ ] AC02: existing guidance hide/show and keyboard-help preferences, editing
  continuity, appearance/density controls, settings validation/propagation,
  reload and responsive reachability; explicitly register absent window-system
  and text-scale requirements.
- [ ] AC03: independent documents, rename, incomplete navigation, identity-safe
  deletion, cancellation, persistence and preservation of other records;
  explicitly register absent archive/filter/restore operations.
- [ ] AC04: source editing, invalid diagnostics/save/download, independent valid
  fixtures, choices/repeated/prototype-like placeholders, removed/restored
  references, preview isolation, bundled-source loading, source recovery and
  competing-tab protection, draft deletion; register absent checkpoint history.
- [ ] AC05: IndexedDB and localStorage persistence and competing revisions,
  preserved local conflict copies, clean authoring refresh, settings
  propagation, memory document/source nonpersistence, independent stores and
  fresh-context isolation, without migration tests.
- [ ] AC06: native selection/undo, keyboard boundary/modifier/composition behavior,
  filled-field activation, multiline and choice editing, Tab/Shift+Tab, transient
  dismissal, mobile/short viewports, subdirectory deployment and automated
  accessibility checks. State physical IME/device limitations honestly.
- [ ] AC07: controlled quota/worker/preference/template/clipboard failures,
  visible feedback, continued editing, recovery download, retry of latest
  content, malformed-record preservation, required-field gating and unaffected
  unrelated work. Use browser-only fault setup, not a production backdoor.
- [ ] Use named user-outcome phases and shared Flows; keep all product selectors
  in Page Objects/components. Do not add one browser test per control.

## Maintenance, evidence and completion

- [ ] Integrate the required acceptance-impact, granularity, independence,
  test-ID, default focus, transient dismissal, lifecycle, diagnostics and
  validation rules into current AGENTS.md without removing prior directives.
- [ ] Create the Guided decision register with GUIDED-E2E-001 through 007,
  adapting rather than importing the extension's decisions.
- [ ] Maintain README/setup, reference adaptations, owned contracts, coverage
  matrix, pending-feature inventory, commands and truthful validation report.
- [ ] Run suite typecheck/infrastructure tests, product typecheck/unit tests,
  fresh build, smoke, affected scenarios and the full suite; review browser
  diagnostics and real desktop/mobile screenshots.
- [ ] Re-run scenarios with multiple workers/repetition to expose state leaks
  and synchronization failures rather than masking them with retries/sleeps.
- [ ] In an isolated reversible product copy, inject representative single
  defects, rebuild and run unchanged tests. Verify the defective build was
  actually served, classify Caught/Missed, retain failure evidence, restore the
  clean baseline and re-run the normal gate.
- [ ] Perform final model-assisted code review and resolve substantive findings.
  Audit coverage against every applicable automation section and report
  unsupported future-product behavior separately from executed passing tests.
