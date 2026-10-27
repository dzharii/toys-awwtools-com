# Guided architecture decisions

Accepted 2026-10-26 for
[the browser automation specification](.specs/suggestions002-01-ui-automation-framework.md).
These are Guided decisions adapted from the inspected eye05 ADR-001 through
ADR-007, not imported extension requirements.

## GUIDED-E2E-001 - Intentional text-entry focus

Product code explicitly focuses the answer activated by a placeholder and the
source editor when beginning source editing. Restoring guidance returns focus
without discarding the answer selection. New Document does not arbitrarily focus
an input. Settings focuses its accessible workspace, and modal confirmations
start on Cancel. No deferred autofocus timer steals later user interaction.

Page Objects observe these states immediately after the relevant user action.
Readiness and tests never repair them with `focus()`. Stable search controls,
explicit rename dialogs, panel origins, and authoring navigation also preserve
intentional focus. Tests may deliberately focus a control to establish a
keyboard-navigation precondition, never to repair a failed product action.

## GUIDED-E2E-002 - Independent external acceptance application

`ui-regression-test-suite` owns its package/lockfile, dependencies, configurations,
Page Objects, components, Flows, synthetic data, and expectations. Neither side
imports the other's source; aliases, links, workspace packages, and generated
synchronization must not bypass independence.

The SUT is deployed `dist` over HTTP. Metadata/file-hash inspection establishes
build freshness and server identity; it does not execute product modules or
calculate expected output. Reviewed gray-box storage inspection and isolated
browser capability/request failures support, but never replace, UI outcomes.
Module-resolution/real-path and configuration audits enforce the boundary.

## GUIDED-E2E-003 - Acceptance impact is part of every UI change

Review affected Page Objects, components, Flows, and scenarios before completion.
Record existing protection, changed assertions, justified new journeys, or
specific automation limitations. Prefer extending AC01-AC07 over one-control
tests; leave detailed algorithms/state transitions in unit tests.

Classify failures as product regressions, intentional contract changes, test
defects, or environmental/tooling failures. Fix the right layer; never weaken an
assertion to hide a product defect. Keep `COVERAGE.md` tied to actual assertions.

## GUIDED-E2E-004 - Readiness and default state are separate

Each Page Object declares minimal structural `expectedControls()` separately from
`expectedDefaultControlState()` for meaningful initial focus. `exists()` observes
normal absence without broad catch-and-false behavior. Failures identify the
surface, control/property, expected/observed state, and relevant diagnostics.

SM01/SM02 and the seven registry-generated cases gate deeper acceptance through
Playwright project dependencies.
Unexpected uncaught errors, page crashes, critical resource failures, and
explicitly critical console errors fail readiness/scenario teardown.
Ordinary handled warnings remain evidence rather than automatic failures.

## GUIDED-E2E-005 - Browser reuse requires verified context isolation

Reuse Playwright's browser per worker, with a fresh default context/page per
scenario. The common fixture owns additional same-context tabs and explicitly
independent contexts. Keep storage across reload/two-tab steps; never depend on
test order or extension-specific destructive reset procedures.

SM02 and AC05 demonstrate independence within the same test while the original
context still contains saved work and changed preferences. Playwright owns crash
recovery, tracing, failure screenshots/video, and browser disposal; the fixture
closes its additional contexts and adds bounded lifecycle/readiness durations.

## GUIDED-E2E-006 - Native transient dismissal preserves user intent

The export-format group uses an auto popover, a declarative invoker, and CSS anchor
positioning. The browser supplies outside/Escape dismissal and focus return.
Buttons retain native semantics; no incomplete custom ARIA menu is introduced.

SM01/AC06 check Escape and outside rename, including the underlying action's
successful result. Persistent guidance and Issues do not light-dismiss.
Confirmation dialogs retain their own modal rules. No cross-frame messaging is
introduced for a product with no owned interactive iframe requirement.

## GUIDED-E2E-007 - Diagnostics support outcomes, not test success

Collect bounded browser warnings/errors and operation durations. Critical failure
state is sticky even if bounded recent-message buffers roll over. Tests assert
functional outcomes, not logger calls, log levels, or telemetry payloads.

Routine timings contain operation, duration, status, and worker/context/page identity, never
answers, titles, source, clipboard content, or full URLs. Diagnostic messages
truncate and redact full HTTP URLs. Traces, screenshots, videos, and failure
assertions can contain scenario text: use synthetic data, keep artifacts ignored
and local, and review before sharing. Narrow expected resource-failure allowances
exist only for deliberate isolated fault phases and are removed before recovery.

## GUIDED-UX-008 - Stable hosts and desired versus effective layout

Use one shared panel manager, pure geometry helpers, and continuously mounted
content hosts rather than a third-party windowing library or DOM reparenting.
Persist settled desired geometry only; adapt effective presentation to the
viewport without rewriting desktop intent. Same-edge tabs share allocation;
collapse releases unused center width. Layout storage failures remain separate
from authored-content failures and retain explicit recovery controls.

## GUIDED-UX-009 - Exact checkpoints without a migration layer

Embed immutable authoring checkpoints in the current draft record, not a second
database history table. Restore uses one optimistic atomic write to protect
current source before replacement. Source autosave and explicit checkpoint
success are distinct outcomes. Keep current and inspection editors separate to
preserve native undo. Archive remains reversible metadata, Delete permanent.
The overriding development directive excludes all legacy converters/migrations.

## GUIDED-UX-010 - Discovery and reading are noncommittal

Search indexes bundled definitions, never user content. Background incremental
indexing cannot block opening independently saved snapshots. Preview uses real
rendering with deterministic examples but never working answers or persistence.
Native popover invokers/closing semantics handle keyboard focus; asynchronous
request generations prevent stale samples. Native radio tiles/selects expose
writing styles. Shared reading preferences change presentation, not export bytes.

## GUIDED-UX-011 - Extend journeys around distinct risks

Retain and adapt AC01-AC07. Add AC08-AC10 for gesture side effects, responsive
layout persistence, and denied/corrupt layout recovery; these need distinct
preconditions. AC11-AC12 cover noncommittal discovery and reading byte invariants.
AC13 repeats one archive/identity lifecycle across three actual stores.
AC14-AC16 cover protected restoration, partial checkpoint failure, and focused
interval autosave. These are coherent user journeys, not per-control tests.
Detailed geometry/ranking/retention/race cases stay product-owned unit tests.

## GUIDED-E2E-012 - Explicit surface inventory and independent actions

One statically declared registry resolves GuidedApp-owned Page Objects. Concrete
constructor metadata supports compiler-based completeness across exported
inheritance/aliases/namespaces without runtime discovery or duplicate instances.
Each entry generates an independent fresh-context test. The shared executor
delegates readiness, validates applicable fresh defaults, checks reopening once,
then executes ordered typed actions with stage-specific failures and diagnostics.

Foundational application startup does not validate document-only controls before
another surface's test can run. It does wait for common initialization to finish,
so storage observation cannot create an empty IndexedDB database before the
worker establishes its schema. FW01 exercises a deliberately stalled manifest.
A native Documents return action preserves the
working document when leaving Settings, independent of history filtering.
Guidance reopening preserves an already active non-first field. These contracts
are protected by FW01, not by forcing/resetting product DOM state.

Screenshot capture is an observational action in a separate project, not a
dependency of acceptance or part of test:all. It uses test-specific full-page
PNG output without changing focus, settings or content. All generated evidence
and scratch work belongs under ignored project-root `temp`; captures have a
separate output directory so mandatory runs do not remove them.
