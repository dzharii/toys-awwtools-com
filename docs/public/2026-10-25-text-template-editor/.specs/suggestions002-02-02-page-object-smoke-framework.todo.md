# Universal Page Object smoke framework implementation plan

Immutable plan for `suggestions002-02-02-page-object-smoke-framework.md`.
Execution progress and validation results are tracked outside this document.

## Preparation and boundaries

- Review current AGENTS instructions, the new specification, existing independent
  suite contracts, and the connected reference project's explicit capture registry.
- Keep runtime production imports, computed Page Object discovery, destructive
  resets, migrations, new runtime dependencies, and a universal close API out.
- Preserve SM01/SM02 and all AC01-AC16 behavioral assertions and fixture ownership.
- Use a literal, Git-ignored project-root `temp` folder for generated captures,
  reports, sensitivity evidence, and scratch fixtures; document future use.

## Opening and readiness

- Separate foundational application startup from Document Workspace readiness so
  a broken required document control cannot preempt unrelated surface tests.
- Audit all seven concrete Page Objects and declare indispensable visible controls,
  excluding conditional actions, optional diagnostics, and decorative elements.
- Navigate to an existing document without replacing its working content; select
  the current document row when returning from full Settings.
- Open navigation deterministically from Documents, Authoring, and full Settings,
  including collapsed/closed panels, without toggling an open panel closed.
- Bring template discovery to a usable search/selection surface and account for
  search filtering without modifying authored content.
- Open Workspace Panels as its own neutral support-panel surface.
- Make Field Editor select an existing editable placeholder through the UI,
  preserving answers and document identity. Only create a deterministic temporary
  document when no applicable editable document can be used; do not save it.
- Return Authoring from historical inspection to the current native source
  editor without overwriting source or creating another saved draft.
- Preserve meaningful focus expectations after explicit first activation and
  observe rather than repair focus.
- Verify opening twice leaves each surface ready and produces no duplicate capture.

## Explicit registry and completeness enforcement

- Add one statically declared registry with seven unique filename-safe IDs,
  descriptions, concrete-class metadata, existing GuidedApp-instance factories,
  and explicit applicable-default-state policies.
- Reject malformed/duplicate IDs, duplicate classes, and incorrect factories.
- Use the already-installed compiler API to find concrete exported subclasses
  throughout suite source, including indirect inheritance and aliased re-exports.
- Resolve the actual framework base symbol; exclude abstract bases and unrelated
  components without relying on filename suffixes or class-name matching.
- Compare discovered declarations with explicit entries; fail on missing/extra
  registrations and mismatched factory return types.
- Run completeness enforcement in the normal typecheck/validation path.
- Add focused fixture tests for missing subclasses, indirect inheritance,
  re-exports, abstract/components exclusions, duplicates, and mismatched factories.

## Shared validation and independently supplied actions

- Implement named, timed stages for factory, own open, explicit existence,
  existing readiness (all declared controls), applicable defaults, diagnostics,
  optional second open/readiness, ordered actions, and final diagnostics.
- Reuse existing bounded timing/diagnostic services and fixture lifecycle.
- Distinguish application/browser, opening, structure/readiness, default-state,
  and extension-action failures with surface, stage, cause, and diagnostic context.
- Stop on the first failure for a surface; do not run any action after failed
  validation or subsequent actions after an extension failure.
- Supply typed action context containing the same app, surface, Page Object, and
  Playwright TestInfo; keep screenshot concerns outside Page Objects.
- Test ordering, default policies, short-circuiting, multiple actions, reopening,
  actionable stage failures, and critical diagnostics with focused doubles.

## Generated smoke and opt-in capture

- Generate one ordinary smoke test per registry entry using the existing fresh
  default fixture context; reuse the browser per worker and existing teardown.
- Add an observational screenshot action using TestInfo.outputPath,
  `${surface.id}.png`, fullPage true, animations disabled, PNG attachment, and the
  already-validated context. Do not click, scroll, focus, or change settings.
- Generate seven capture tests from the same registry and runner at 1440x1000.
- Add an independent capture project/script with no acceptance dependency.
- Explicitly restrict test:all to smoke and acceptance; preserve acceptance's
  dependency on smoke and keep capture out of the default validation gate.
- Test screenshot naming/options/attachment and project/script selection.

## Real validation and regression sensitivity

- Run existing formatting, independent-source boundaries, strict typechecks,
  focused infrastructure tests, and current product build/unit checks.
- Exercise all seven surfaces from clean browser contexts and open them twice.
- Exercise supported cross-workspace openings with existing document answers and
  authoring source; assert identities/content and record counts are preserved.
- Validate a required-control/opening defect fails its universal smoke case while
  unrelated surface cases still report; verify acceptance remains gated.
- Validate an action failure remains distinguishable from a product readiness
  failure, with deterministic fixture cleanup.
- Extend isolated sensitivity mutation coverage, restore/rebuild each isolated
  source, and prove a clean baseline after each mutation.
- Run the complete mandatory smoke/acceptance command, a repeated parallel run,
  and the separate capture command. Inspect resulting seven full-page PNGs.
- Keep generated files in ignored temp storage and verify Git ignores actual
  screenshots/reports rather than merely matching an illustrative filename.
- Perform bounded model-assisted review, address meaningful findings, and rerun
  affected validation before completion.

## Documentation and final evidence

- Add `ui-regression-test-suite/docs/page-object-smoke-framework.md` explaining
  registration, readiness/opening/default policies, completeness, runner stages,
  action injection, capture commands/artifacts, and failure investigation.
- Update AGENTS with mandatory registration and local temp-artifact conventions.
- Update suite README, COVERAGE, VALIDATION, and relevant architecture decisions
  with exact commands, counts, evidence paths, and truthful limitations.
- Review the scoped diff, preserve immutable specifications, and finish only
  after the current-request execution tasks and actual validation are complete.
