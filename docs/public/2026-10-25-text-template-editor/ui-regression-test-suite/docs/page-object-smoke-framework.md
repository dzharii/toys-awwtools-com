# Universal Page Object smoke and optional capture

The explicit inventory in `src/framework/surface-registry.ts` drives both
`src/specs/smoke/page-objects.smoke.spec.ts` and the separate capture spec.
Each entry generates its own Playwright test with a fresh Guided fixture context.
Chromium is reused per worker; no browser is launched while registering surfaces.
SM01/SM02 and the comprehensive acceptance journeys remain separate protection.

## What is validated

`runSurfaceSmoke` resolves the existing GuidedApp-owned instance, invokes its own
`open()`, explicitly asserts `exists()`, delegates all required-control checks to
`expectReady()`, checks applicable fresh-open defaults, and checks diagnostics.
It then opens and validates the same object a second time, without repeating
fresh-focus expectations or running actions twice. Ordered injected actions run
only after these checks; diagnostics are checked after every action and completion.

`PageObject.expectReady()` remains the only required-control implementation.
Every declaration is checked, not just the first. The runner reports the count;
it has no second selector inventory. Ordinary absence is observed by `exists()`,
not hidden behind catch-and-false error handling.

| Registry ID           | Representative ready state                                                 | Fresh defaults               |
| --------------------- | -------------------------------------------------------------------------- | ---------------------------- |
| `document-workspace`  | Guided text, title, save state, result, copy/export, reading size          | Not applicable               |
| `document-navigation` | History, filter, New Document, Documents return, Settings, Authoring       | Not applicable               |
| `template-catalog`    | Search, result status, selectable bundled cards                            | Not applicable               |
| `workspace-panels`    | Neutral guidance shell, collapse/actions/close and global panel access     | Not applicable               |
| `field-editor`        | Active native answer, identity, previous/next controls                     | Answer focused               |
| `template-authoring`  | Current native source, New, bundled inspection, save state, Save, Download | Source focused               |
| `settings`            | Appearance, storage/autosave, reading/suggestions, Recent and diagnostics  | Accessible workspace focused |

Default policies are explicit (`validate` or `not-applicable`). A factory with
declared defaults cannot silently opt out. Focus is checked after deterministic
first activation in a clean context, never repaired with `focus()` and never
assumed after arbitrary user interactions. Direct Page Object callers decide
whether fresh-default checking is meaningful for their particular workflow.

## Opening dependencies and side effects

The shared application fixture waits for the application host and the common
startup status to disappear after initialization, not the Document Workspace's
readiness inventory. Waiting only for the host can race IndexedDB initialization;
waiting for document controls would preempt independent Settings/Authoring tests.
FW01 holds the manifest request while the host/navigation are visible and proves
startup remains pending until initialization is released.
The stall helper separates resuming a request from disposing its route. Keep
interception installed until startup or background indexing has settled; removing
it mid-initialization can strand concurrent Chromium worker/resource requests.

Document Workspace opens navigation when necessary and uses the native
**Documents** return control. It does not infer a current record from filtered
history or click New Document simply to leave Settings. If no current document
exists after returning, New Document establishes an unsaved temporary instance.
Navigation handles the Authoring history context and closed/collapsed panels.

Field Editor first restores existing guidance, preserving a previously active
non-first field and its answer. If no usable answer is present, it opens the
current document and activates a real placeholder. Only a missing/inapplicable
editable document (including a readonly or fieldless current document) needs a
new default temporary instance. Opening does not fill answers, save, rename,
archive, or delete content.

Authoring returns from readonly historical/bundled inspection to the current
mounted source editor. It does not replace source or create another saved draft.
Catalog opening clears an active search only when that query leaves no visible
cards, establishing its documented selection-ready state without changing the
working document. Search-specific empty-state behavior remains acceptance-owned.

Opening may navigate, restore panels, or activate a field through normal UI
operations. Normal application navigation may flush existing meaningful edits.
Neither opening nor screenshot capture invents persistent content for smoke.
There is no meaningless universal `close()`; the fixture disposes browser contexts.

FW01 independently protects repeated opening from Settings and historical
Authoring with real saved answers/source, exact record identities/content, an
Archived filter, closed navigation, and a closed non-first active field.
Its setup explicitly selects the intended template/style instead of depending on
which background-indexed template becomes available first.

## Registering a new Page Object

Implement a concrete exported `PageObject` subclass with a meaningful root,
required controls, nondestructive/idempotent `open()`, and applicable defaults.
Compose its prerequisites through the existing GuidedApp dependency graph.
Expose that owned instance from GuidedApp and add one explicit registry entry:

```typescript
{
  id: "new-surface",
  description: "Meaningful user-facing surface",
  pageObject: NewSurfacePage,
  defaults: "not-applicable",
  create: (app) => app.newSurface(),
}
```

IDs are unique lowercase kebab-case, filename-safe on Windows, at most 80
characters, and not reserved device names. Duplicate IDs/classes are rejected.
Class metadata is never instantiated; factories must return existing app
instances, not `new` objects.

Run `bun run typecheck`, `bun run test:unit`, and `bun run test:smoke`; run
`bun run test:capture` when visual inspection is needed. Update acceptance
coverage for meaningful new workflows rather than treating a surface visit as
complete feature coverage.

`scripts/check-surface-registry.ts` uses the pinned compiler API, not runtime
reflection or glob imports. It compares actual declaration identities against
the explicit array, including indirect inheritance, aliases/re-exports,
anonymous/default classes, class expressions, concrete classes beside the base,
and exported namespace members throughout suite source, including files excluded
from ordinary tsconfig compilation. Abstract bases and
ordinary components are excluded. It also checks factory return types against
the registered concrete class. Normal typecheck and therefore `test:all` enforce
completeness. There are **no exclusions**.

The checker is a development compliance guard, not a proof of arbitrary factory
semantics or a hostile-code sandbox. Keep factories as obvious app-accessor
expressions; runtime checks additionally reject the wrong concrete instance type.
Do not hide registrations behind computed arrays, spreads, or plugin loaders.

## Adding an independent action

Implement the small `SurfaceAction` interface from `framework/surface-smoke.ts`.
Give it a stable ID and use the supplied `{ app, surface, object, testInfo }`.
The app and object are the already-validated instances; do not launch another
browser, replace the context, import product source, or duplicate readiness.

```typescript
const inventoryAction: SurfaceAction = {
  id: "required-control-inventory",
  async run({ object, testInfo }) {
    await testInfo.attach("required-controls.json", {
      body: JSON.stringify(object.expectedControls().map((control) => control.name)),
      contentType: "application/json",
    });
  },
};

await runSurfaceSmoke(app, surface, testInfo, [inventoryAction]);
```

Inject actions only into their intended workflow. Arrays preserve action order;
an action failure prevents later actions. Default smoke supplies no actions.
Define artifact/reporting behavior, exercise failure short-circuiting, and
document limitations. Actions are observational unless explicitly intended and
documented otherwise. No abstract Page Object change or DI/plugin framework is
necessary.

## Capture and commands

From the suite directory:

```powershell
bun run test:smoke
bun run test:acceptance
bun run test:all
bun run test:capture
bunx playwright test --project smoke --project acceptance --workers 2 --fully-parallel --repeat-each 2
bunx playwright show-report ..\temp\ui-regression-test-suite\playwright-report
```

Acceptance depends on smoke. Capture has no dependencies and is not an acceptance
dependency. `test:all` explicitly selects only smoke and acceptance; a bare
`playwright test` selects **all** projects, including capture.

Capture injects `support/capture-surface.ts` at a fixed 1440x1000 viewport.
It calls the existing page's screenshot API with `fullPage: true`, PNG format,
and `animations: "disabled"`, then attaches the result using TestInfo. It does
not click, navigate, focus, scroll, alter settings, or populate content.
The capture spec also checks that applicable focus survived capture.

All generated artifacts live under the Git-ignored project-root `temp` folder:

| Location relative to project root                                   | Contents                                                        |
| ------------------------------------------------------------------- | --------------------------------------------------------------- |
| `temp\ui-regression-test-suite\captures\<test-specific-directory>\` | Seven ID-named PNGs and per-test attachments                    |
| `temp\ui-regression-test-suite\test-results\`                       | Mandatory-run diagnostics and failure traces/screenshots/videos |
| `temp\ui-regression-test-suite\playwright-report\`                  | Latest HTML report                                              |
| `temp\ui-regression-test-suite\sensitivity-<timestamp>\`            | Isolated mutation evidence and reports                          |
| `temp\infrastructure\`, `temp\registry-fixtures\`                   | Owned scratch fixtures, removed after their tests               |
| `temp\previous-runs\`                                               | Preserved generated artifacts moved from former locations       |

Names are `document-workspace.png`, `document-navigation.png`,
`template-catalog.png`, `workspace-panels.png`, `field-editor.png`,
`template-authoring.png`, and `settings.png`. TestInfo.outputPath isolates retries,
workers, projects, and repeated cases. Capture output has its own directory, so
normal validation does not clean it away. A new capture run replaces that run's
output normally. Generated images/reports are local evidence, not tracked assets.

Full-page capture does **not** stitch independently scrolling workspace/panel
contents or certify visual correctness. It records the actual rendered browser
page at the defined viewport, not every possible surface mode or device.

## Failures and limits

Named Playwright stages and PageObject class annotations identify each surface.
Bounded existing timings record stage status/duration; existing browser
diagnostics capture critical errors without adding collectors. Errors preserve
the underlying cause chain, including required-control/focus failures.
`SurfaceSmokeFailure.stage` distinguishes factory, opening, structure,
default-state, diagnostics, extension, and application/browser failures.
An exception thrown by the Page Object's own `open()` is an opening failure,
even when that method's readiness assertion supplies the underlying cause.

Missing/stale builds and unavailable browsers/servers remain infrastructure
failures, not seven claimed Page Object regressions. Independent surface tests
continue after an individual failure; a failed smoke project blocks acceptance.
The isolated universal required-ID sensitivity case proves both behaviors.
An injected action failure is not mislabeled as failed opening.

Smoke checks every registered surface and every declared required control. It
does not check all DOM nodes, optional diagnostics, empty/error/search modes,
every input variant, persistence, complete keyboard behavior, or feature outcomes.
AC01-AC16 and FW01, product-domain tests, and manual inspection retain those
responsibilities. There is no new Firefox/Safari or full manual-accessibility
certification. Keep synthetic data only: captures, traces and failure assertions
can contain content even though routine timing/diagnostic metadata must not.
