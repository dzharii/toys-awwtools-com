2026-10-26

# File: `.specs/suggestions002-02-02-page-object-smoke-framework.md`

# Guided UI Regression Suite - Universal Page Object Smoke Testing and Extensible Actions

Specification: `suggestions002-02-02`\
Revision: 00\
Status: New change request\
Project: Guided UI Regression Test Suite\
Scope: Page Object readiness, automatic smoke coverage, extension actions, screenshot capture, diagnostics, and maintenance\
Reference: Uploaded `ui-regression-test-suite(1).zip`\
Related specification: `suggestions002-02-01`

## A00. Purpose

Implement a reusable, registry-driven smoke-testing framework that automatically validates every concrete Page Object in the Guided UI Regression Test Suite.

The framework must be able to open each registered application surface, verify that the surface exists, validate all its declared required controls, check applicable default states, and optionally execute independently supplied actions after successful validation.

The initial optional action will capture a full-page screenshot of each successfully opened and validated surface.

The central design principle is:

One reusable Page Object registry, one validation pipeline, and independently pluggable post-validation actions.

The framework must not require individually written smoke-test logic for every Page Object.

Adding a new Page Object should require registering it, implementing its normal Page Object contract, and supplying any additional declared readiness requirements. The shared smoke runner then includes it automatically.

Adding a new action, such as screenshot capture, should not require modifying Page Object implementations or duplicating their smoke tests.

Expected outcomes:

| Capability                 | Requirement                                                     |
| -------------------------- | --------------------------------------------------------------- |
| Universal smoke validation | Every registered concrete Page Object                           |
| Opening                    | Invoke the Page Object's own `open()`                           |
| Existence                  | Assert that its expected surface exists                         |
| Required controls          | Validate every declaration from `expectedControls()`            |
| Default state              | Validate declared applicable initial properties                 |
| Independence               | Each Page Object can be tested from a known clean browser state |
| Extensibility              | Inject optional post-validation actions                         |
| Screenshots                | Full-page capture with deterministic names                      |
| Diagnostics                | Per-surface results, durations, and actionable errors           |
| Failure isolation          | One broken surface does not prevent reporting on others         |
| Maintenance                | New Page Objects cannot silently escape registry coverage       |
| Execution                  | Smoke gates acceptance; screenshot capture runs separately      |
| Architecture               | No shared source imports from Guided itself                     |

This framework is a Page Object contract smoke suite, not a replacement for the existing comprehensive acceptance scenarios.

It verifies structural availability and basic readiness, while the acceptance suite continues testing complete user journeys, persistence, keyboard behavior, validation, and data integrity.

## B00. Existing implementation findings

The uploaded source was inspected rather than treating the earlier framework proposal as evidence of implementation.

The code already contains most of the primitives required for this change.

Existing framework:

| File                                       | Current responsibility                                    |
| ------------------------------------------ | --------------------------------------------------------- |
| `src/framework/page-object.ts`             | Abstract Page Object, existence, readiness, default state |
| `src/framework/guided-app.ts`              | Constructs and exposes Page Objects                       |
| `src/framework/guided-test.ts`             | Playwright fixtures, context lifecycle, diagnostics       |
| `src/framework/app-context.ts`             | Page, base URL, timings, diagnostics, identity            |
| `src/framework/diagnostics.ts`             | Browser failures and bounded diagnostic collection        |
| `src/framework/timings.ts`                 | Structured operation-duration recording                   |
| `src/specs/smoke/workspaces.smoke.spec.ts` | Existing grouped smoke scenarios                          |
| `playwright.config.ts`                     | Smoke and acceptance project configuration                |

Existing abstract Page Object contract:

```
export abstract class PageObject {
  abstract readonly root: Locator;
  abstract open(): Promise<void>;
  abstract expectedControls(): readonly ExpectedControl[];

  exists(): Promise<boolean>;

  expectedDefaultControlState():
    readonly ExpectedControlState[];

  expectReady(): Promise<void>;
  expectDefaultState(): Promise<void>;
}
```

The uploaded implementation already checks the root and declared controls through Playwright's visibility assertions. It also checks browser diagnostics and measures readiness duration.

Those methods must be reused, not replaced by a parallel smoke-specific readiness implementation.

Existing concrete Page Objects:

| ID             | Class                   | File                         |
| -------------- | ----------------------- | ---------------------------- |
| `documents`    | `DocumentWorkspacePage` | `document-workspace.page.ts` |
| `navigation`   | `NavigationPage`        | `navigation.page.ts`         |
| `templates`    | `TemplateCatalogPage`   | `template-catalog.page.ts`   |
| `panels`       | `WorkspacePanelsPage`   | `workspace-panels.page.ts`   |
| `field-editor` | `FieldEditorPage`       | `field-editor.page.ts`       |
| `authoring`    | `TemplateAuthoringPage` | `template-authoring.page.ts` |
| `settings`     | `SettingsPage`          | `settings.page.ts`           |

There are seven concrete Page Object subclasses in the supplied snapshot.

All seven are instantiated through `GuidedApp`.

The suite also contains reusable Page Components such as `PanelControls`, `AnswerControl`, `RenameDialog`, and `Confirmation`. They are not subclasses of `PageObject` and must not be added to the universal Page Object registry automatically.

They remain validated through their owning Page Objects and acceptance scenarios.

Existing smoke coverage:

The suite currently defines two grouped smoke tests, `SM01` and `SM02`.

They exercise important workflows, including field focus, panel restoration, Settings, Template Authoring, and browser-context isolation.

However, those tests are manually composed. They do not systematically enumerate every Page Object through one shared registry.

Consequently, adding another Page Object does not automatically create a smoke-coverage obligation.

Main architectural gap:

The framework has Page Object contracts, but no universal registry and no generic executor for those contracts.

The goal is to add those missing orchestration facilities while retaining the current Page Object and fixture architecture.

## C00. Polymorphism, opening dependencies, and universal readiness

The object-oriented principle described in the requirement is polymorphism.

Each concrete Page Object inherits a common contract, allowing the smoke runner to treat instances uniformly as `PageObject` objects while invoking their individual implementations of `open()`.

Conceptually:

```
const objects: PageObject[] = [
  app.documents(),
  app.templates(),
  app.navigation(),
  app.fieldEditor(),
  app.authoring(),
  app.settings(),
  app.panels(),
];

for (const object of objects) {
  await object.open();
  await object.expectReady();
}
```

This is the intended conceptual behavior, but the implementation must account for isolation, dependent surfaces, and error handling.

Opening dependencies:

The current architecture mostly uses composition and delegation rather than class-parent calls.

For example, `TemplateCatalogPage.open()` delegates to `DocumentWorkspacePage.open()` when necessary, and the document workspace delegates to navigation.

That is compatible with the requested dependency-opening chain.

It is not necessary to introduce deeper inheritance solely to model this relationship.

Universal `open()` contract:

Every concrete Page Object MUST implement `open()` such that it brings its represented surface into a ready, usable state from any supported application workspace state.

`open()` must not merely assume that another test has already prepared its prerequisites.

| Requirement           | Invariant                                                            |
| --------------------- | -------------------------------------------------------------------- |
| Idempotency           | Calling `open()` twice leaves one usable surface                     |
| Dependency resolution | Required parent/owner surfaces are opened as needed                  |
| Readiness             | Successful return means the surface satisfies its readiness contract |
| Existing content      | Do not discard authored data                                         |
| Navigation            | May navigate through normal public UI                                |
| Duplicate records     | Must not create unnecessary documents/drafts                         |
| Focus                 | Preserve or establish contextually required focus                    |
| Bounded execution     | Must fail meaningfully if surface cannot open                        |
| Diagnostics           | Errors identify the failed dependency or control                     |
| Isolation             | No direct product-source/service imports                             |

Important exception:

The phrase "no matter where we are" means any supported, recoverable application state. It does not mean `open()` must bypass an actual startup failure, missing required application resource, inaccessible browser, or user action that legitimately prevents navigation.

In those situations, it must fail with a meaningful error rather than silently manipulate unrelated state.

Opening chain example:

```
FieldEditorPage.open()
    |
    v
Ensure document workspace is accessible
    |
    v
Ensure an editable field is selected
    |
    v
Ensure Field editor panel is expanded
    |
    v
Verify active editor readiness
```

Each operation should reuse existing user-facing Page Object methods where practical.

Do not place detailed DOM selectors directly into the universal smoke runner.

Existing gap requiring correction:

The current `FieldEditorPage.open()` restores guidance when its root is not visible and then calls `expectReady()`.

However, its readiness contract requires an active answer control and field identifier.

On a fresh document where no placeholder has been activated, simply restoring guidance does not necessarily create those controls.

The implementation must explicitly resolve this prerequisite.

The preferred behavior is to select a valid field in the current editable document, when possible, through normal user-facing operations.

Only when there is no applicable editable document should it navigate to a deterministic temporary template instance.

It must not silently replace an existing working document or create a persistent record simply to pass smoke.

Default-state checks:

`expectedDefaultControlState()` already exists and should remain separate from structural readiness.

The universal executor must call it only under the documented conditions when the expected state is meaningful.

For example, Field editor focus may be expected immediately after explicit field activation, but that expectation may not apply to a panel that was already open and merely raised to the front.

The smoke path must provide deterministic opening conditions so applicable focus assertions remain reliable.

Close versus dismiss:

A universal `close()` method is not required.

A document workspace is not necessarily closeable, while a transient preview or floating panel may be.

Do not add a meaningless `close()` implementation to every Page Object.

The fixture owns test cleanup through browser-context disposal.

Where closing is meaningful, it remains an optional capability of the particular Page Object or panel component.

## D00. Explicit Page Object registry

Create a single authoritative registry for smoke-test discovery.

Recommended file:

```
src/framework/surface-registry.ts
```

The registry maps a stable surface identifier to a Page Object factory and smoke-specific metadata.

It must be explicit and statically discoverable.

Do not use runtime reflection, directory glob imports, or naming conventions that automatically execute every exported class.

Registry contract:

```
import type { GuidedApp } from "./guided-app";
import type { PageObject } from "./page-object";

export interface SmokeSurface {
  readonly id: string;
  readonly description: string;

  readonly create: (app: GuidedApp) => PageObject;

  readonly verifyDefaultState?: boolean;
}
```

Initial registry:

```
// src/framework/surface-registry.ts

export const smokeSurfaces = [
  {
    id: "document-workspace",
    description: "Document workspace",
    create: (app: GuidedApp) => app.documents(),
  },
  {
    id: "document-navigation",
    description: "Document navigation",
    create: (app: GuidedApp) => app.navigation(),
  },
  {
    id: "template-catalog",
    description: "Template catalog",
    create: (app: GuidedApp) => app.templates(),
  },
  {
    id: "workspace-panels",
    description: "Workspace support panels",
    create: (app: GuidedApp) => app.panels(),
  },
  {
    id: "field-editor",
    description: "Field editor",
    create: (app: GuidedApp) => app.fieldEditor(),
    verifyDefaultState: true,
  },
  {
    id: "template-authoring",
    description: "Template Authoring",
    create: (app: GuidedApp) => app.authoring(),
    verifyDefaultState: true,
  },
  {
    id: "settings",
    description: "Settings",
    create: (app: GuidedApp) => app.settings(),
    verifyDefaultState: true,
  },
] satisfies readonly SmokeSurface[];
```

The entries above cover all seven Page Objects present in the uploaded snapshot.

Registry requirements:

| Property             | Requirement                                                     |
| -------------------- | --------------------------------------------------------------- |
| Stable ID            | Unique, human-readable, filename-safe                           |
| Description          | Meaningful name used in logs                                    |
| Factory              | Returns the existing Page Object from `GuidedApp`               |
| Default-state policy | Explicitly identifies whether additional state checking applies |
| Ordering             | Deterministic                                                   |
| Coverage             | Every concrete Page Object represented                          |
| Duplicates           | Rejected                                                        |
| Disabled entries     | Must not silently disappear                                     |
| Browser dependencies | No browser launched during registry construction                |
| Product dependencies | No imports from Guided implementation                           |

Do not instantiate separate copies of the same Page Object merely to register it.

Use the instances already owned by `GuidedApp`.

Registry completeness:

A manually maintained registry introduces one risk: a developer may create another Page Object and forget to register it.

The specification therefore requires a completeness check.

The suite already depends on TypeScript compiler tooling for its independent import-boundary checks. That tooling may be reused to inspect the regression suite's own source tree.

The completeness check must compare:

1. Concrete exported classes extending the framework's `PageObject`.
2. The classes represented by the registry.
3. Any explicitly documented exclusions.

A newly introduced concrete Page Object without registry coverage must fail validation.

Abstract base classes and ordinary Page Components do not require registry entries.

Prefer an explicit class/ID mapping if it is easier to verify than attempting to infer classes from factory return types.

No silent exemptions:

If a particular Page Object cannot be opened independently, it must not simply be removed from the registry.

The implementation must either correct its opening contract or document why it is not an independently openable Page Object and restructure its abstraction accordingly.

A temporary exemption requires a specific justification and must remain visible in validation output.

## E00. Universal smoke execution pipeline

Create one reusable executor that applies the same validation sequence to each registered Page Object.

Recommended file:

```
src/framework/surface-smoke-runner.ts
```

Execution sequence:

| Order | Operation                        | Requirement                                 |
| ----- | -------------------------------- | ------------------------------------------- |
| 1     | Create Page Object from registry | Correct instance                            |
| 2     | Invoke `open()`                  | Surface opened through own dependency chain |
| 3     | Invoke `exists()`                | Must return true                            |
| 4     | Invoke `expectReady()`           | Root and every required control validated   |
| 5     | Invoke `expectDefaultState()`    | When declared applicable                    |
| 6     | Check browser diagnostics        | No unexpected critical errors               |
| 7     | Execute injected actions         | Only after successful validation            |
| 8     | Record completion                | Structured timing and outcome               |
| 9     | Cleanup                          | Owned browser context disposed              |

The first explicit smoke assertion after opening is existence.

The following structural validation must use the existing `expectedControls()` contract.

The executor must not maintain a separate, manually duplicated list of required controls.

Readiness assertion:

The current implementation already performs:

```
await expect(this.root).toBeVisible();

for (const control of this.expectedControls()) {
  await expect(control.locator).toBeVisible();
}
```

Retain that principle.

Every declared required control must be checked.

Do not stop after verifying the first control.

If any required control is missing or invisible, the Page Object smoke case fails.

Important coverage distinction:

The framework must validate 100% of registered Page Objects and 100% of their declared required controls.

This does not mean every DOM node, tooltip, optional menu item, conditional control, or possible application state has been tested.

The requirements in `expectedControls()` must be meaningful and periodically reviewed.

Otherwise, a Page Object declaring only one unimportant label could pass even though its main functionality is broken.

Required-control inventory:

Review the seven existing `expectedControls()` implementations as part of this change.

The current declarations are relatively minimal.

| Page Object         | Existing declarations                    | Review requirement                                                        |
| ------------------- | ---------------------------------------- | ------------------------------------------------------------------------- |
| Document workspace  | Guided document, Generated result        | Include indispensable editing/result controls in the selected smoke state |
| Document navigation | New Document                             | Include actual navigation/list/filter functionality as appropriate        |
| Template catalog    | First bundled template card              | Include usable template-selection/search surface                          |
| Workspace panels    | Guidance toggle                          | Include primary panel-access and state controls                           |
| Field editor        | Active answer, field identity            | Preserve; cover correct input variants through appropriate tests          |
| Template Authoring  | Source editor, Save now, Download source | Preserve; include required preview/diagnostic regions as applicable       |
| Settings            | Theme, storage mode, autosave interval   | Include representative required settings sections and core controls       |

Do not add every possible control to a Page Object's default readiness contract.

Conditional controls, such as Rename confirmation buttons or checkpoint restoration actions, belong to the state where they exist.

The universal smoke pass validates the Page Object's defined ready state. Existing acceptance scenarios continue validating those conditional states.

Failure behavior:

If `open()` fails, do not continue to existence or extension actions.

If `exists()` returns false, fail with the surface ID and description.

If readiness fails, include the underlying expected-control failure and available browser diagnostics.

If default-state validation fails, include the control and expected property.

If an injected action fails, classify it as an extension failure rather than incorrectly reporting structural readiness failure.

Example executor:

```
// src/framework/surface-smoke-runner.ts

import { expect, test, type TestInfo } from "@playwright/test";

import type { GuidedApp } from "./guided-app";
import type { PageObject } from "./page-object";
import type { SmokeSurface } from "./surface-registry";

export interface SurfaceActionContext {
  readonly app: GuidedApp;
  readonly surface: SmokeSurface;
  readonly object: PageObject;
  readonly testInfo: TestInfo;
}

export interface SurfaceAction {
  readonly id: string;

  run(context: SurfaceActionContext): Promise<void>;
}

export async function runSurfaceSmoke(
  app: GuidedApp,
  surface: SmokeSurface,
  testInfo: TestInfo,
  actions: readonly SurfaceAction[] = [],
): Promise<void> {
  const object = surface.create(app);

  await test.step(`Open ${surface.description}`, async () => {
    await object.open();
  });

  await test.step(
    `Verify ${surface.description} exists`,
    async () => {
      expect(
        await object.exists(),
        `${surface.description} must exist after open()`,
      ).toBe(true);
    },
  );

  await test.step(
    `Validate required controls for ${surface.description}`,
    async () => {
      await object.expectReady();
    },
  );

  if (surface.verifyDefaultState) {
    await test.step(
      `Validate default state for ${surface.description}`,
      async () => {
        await object.expectDefaultState();
      },
    );
  }

  for (const action of actions) {
    await test.step(
      `${action.id}: ${surface.description}`,
      async () => {
        await action.run({
          app,
          surface,
          object,
          testInfo,
        });
      },
    );
  }
}
```

This code illustrates the extension boundary.

The existing `expectReady()` already checks diagnostics. The final implementation should also verify that no unexpected critical browser error occurred during injected actions, using the existing diagnostics service.

Avoid duplicating diagnostic event listeners.

Idempotent opening:

The runner should validate that the Page Object satisfies its normal `open()` contract, not work around broken opening behavior.

An optional second opening operation may be added to the smoke contract:

```
await object.open();
await object.open();
await object.expectReady();
```

This is useful for detecting duplicate windows or unintended state changes.

However, duplicate-open validation should remain a focused contract check, not an additional screenshot or a separate granular browser test for every Page Object.

## F00. Extensible post-validation actions

The extension mechanism must operate outside the Page Object classes.

The Page Object remains responsible for opening and validating its own surface. The smoke runner remains responsible for orchestration.

Optional actions are injected into the runner and execute only after successful validation.

Design decision: Use a small typed action interface with dependency injection.

Do not introduce a full plugin loader, dependency-injection container, dynamically loaded JavaScript modules, or a general-purpose test scripting language.

A simple array of typed action objects is sufficient.

Extension lifecycle:

```
Registered Page Object
         |
         v
       open()
         |
         v
      exists()
         |
         v
    expectReady()
         |
         v
 expectDefaultState()
     if applicable
         |
         v
   All checks pass?
       /       \
      No       Yes
      |         |
      v         v
  Report     Run injected
  failure    actions in order
                |
                v
          Report outcome
```

Extension contract:

An extension receives:

| Property   | Purpose                                |
| ---------- | -------------------------------------- |
| `app`      | Existing Guided automation application |
| `surface`  | Registry identity and metadata         |
| `object`   | Successfully validated Page Object     |
| `testInfo` | Playwright reporting/artifact context  |

It can use the underlying Playwright Page through `app.context.page`.

It must not create a separate browser or replace the Page Object's application context.

Extension behavior:

| Requirement            | Rule                                                         |
| ---------------------- | ------------------------------------------------------------ |
| Default actions        | None                                                         |
| Execution point        | After successful validation                                  |
| Multiple actions       | Supported                                                    |
| Ordering               | Registration order                                           |
| Failure                | Fail affected test with action name                          |
| Browser state          | Same context as validated Page Object                        |
| Product selectors      | Use Page Objects/components                                  |
| Product-source imports | Prohibited                                                   |
| Unrelated mutation     | Prohibited unless extension explicitly declares that purpose |
| Reporting              | Action appears as its own Playwright step                    |
| Cleanup                | Fixture-owned                                                |

Examples of future extensions:

| Extension            | Purpose                                           |
| -------------------- | ------------------------------------------------- |
| Full-page screenshot | Capture visible application state                 |
| Panel screenshot     | Capture a specific panel region                   |
| Accessibility audit  | Run an accessibility check after readiness        |
| Geometry inventory   | Record significant panel rectangles               |
| Focus report         | Capture current active element information        |
| Console snapshot     | Attach bounded browser diagnostics                |
| Control inventory    | Report expected-control identities and visibility |
| Readability audit    | Inspect computed font sizes and overflow          |

These are possible extensions, not requirements to implement all of them now.

The initial implementation requires only the generic extension mechanism and the full-page screenshot action.

Important restriction:

Extensions should be observational by default.

A screenshot extension must not click controls or modify the page merely to improve its appearance.

If an extension requires a special state, represent that state through a separate surface profile or clearly defined preparation operation rather than hidden behavior inside screenshot capture.

## G00. Full-page screenshot extension

Implement the first extension as a separate, reusable action.

Recommended file:

```
src/framework/actions/full-page-screenshot.action.ts
```

Required behavior:

For every successfully opened and validated Page Object, capture the current Playwright page using:

```
fullPage: true
```

Use the Page Object's stable registry ID to construct the screenshot filename.

Filename convention:

| Page Object         | Screenshot filename       |
| ------------------- | ------------------------- |
| Document workspace  | `document-workspace.png`  |
| Document navigation | `document-navigation.png` |
| Template catalog    | `template-catalog.png`    |
| Workspace panels    | `workspace-panels.png`    |
| Field editor        | `field-editor.png`        |
| Template Authoring  | `template-authoring.png`  |
| Settings            | `settings.png`            |

The filenames must remain stable across runs.

Use Playwright's test-specific output directory so parallel executions do not overwrite one another.

Example implementation:

```
// src/framework/actions/full-page-screenshot.action.ts

import type { SurfaceAction } from
  "../surface-smoke-runner";

export const fullPageScreenshotAction: SurfaceAction = {
  id: "Capture full-page screenshot",

  async run({ app, surface, testInfo }) {
    const filename = `${surface.id}.png`;

    const path = testInfo.outputPath(filename);

    await app.context.page.screenshot({
      path,
      fullPage: true,
      animations: "disabled",
    });

    await testInfo.attach(filename, {
      path,
      contentType: "image/png",
    });
  },
};
```

Screenshot contract:

| Property                | Requirement                                   |
| ----------------------- | --------------------------------------------- |
| Source                  | Actual Chromium page                          |
| Timing                  | After successful Page Object validation       |
| Scope                   | Full browser page                             |
| Name                    | Stable registry ID                            |
| Format                  | PNG                                           |
| Location                | Playwright-owned test artifact directory      |
| Attachment              | Playwright report                             |
| Animation               | Disable nonessential animation during capture |
| Browser                 | Shared fixture browser/context                |
| Failure                 | Report screenshot action failure              |
| Default smoke           | Screenshots disabled                          |
| Dedicated capture suite | Screenshots enabled                           |

Clarification about full-page screenshots:

Playwright's `fullPage: true` captures the entire document page, not automatically every scroll position inside independently scrolling docked panels.

Guided has multiple nested scroll regions. A full-page screenshot may show the currently visible portion of a docked Settings or Field editor panel while not including content further down that panel's own scroll container.

This is expected behavior, not a reason to claim the screenshot captured all internal content.

For the first implementation, the screenshot extension captures the complete current page in its default visible state.

If a later requirement needs every section of a long panel, implement a separate scrolling/stitching or multi-position capture action. Do not make the initial extension unexpectedly scroll controls or change application state.

Stable viewport:

The capture suite must use a documented default viewport, initially matching the existing Playwright configuration:

```
viewport: {
  width: 1440,
  height: 1000,
}
```

This improves visual comparability.

Later, the same framework may support explicitly named profiles such as Desktop, Mobile, Light theme, or Large text.

Those profiles must be deliberate registry or suite configuration, not invisible mutations performed by the screenshot action.

Artifact organization:

Each screenshot belongs to the corresponding Playwright test output directory.

A report attachment should identify its source Page Object.

Do not save all screenshots into a single shared path where parallel tests or subsequent runs may overwrite files unpredictably.

If a persistent comparison directory is later required, add an explicit export action that copies completed artifacts into a deterministic, versioned location.

Privacy and storage:

The screenshot suite must run only against the isolated test browser profile containing synthetic test data.

Do not capture a developer's real browser profile or private documents.

Generated screenshots and reports must not be committed automatically.

## H00. Separate universal smoke and screenshot-capture suites

Create two test suites using the same registry and runner.

The difference is only the injected actions.

Suite 1: Universal Page Object Smoke

Purpose: Fast structural readiness checks.

Actions: None.

Suite 2: Page Object Screenshot Capture

Purpose: Open and validate all Page Objects, then capture each page.

Actions: Full-page screenshot.

The two suites must not duplicate Page Object enumeration, opening logic, or required-control validation.

Universal smoke test:

Recommended file:

```
src/specs/smoke/page-objects.smoke.spec.ts
```

```
import { test } from "../../framework/guided-test";

import { smokeSurfaces } from
  "../../framework/surface-registry";

import { runSurfaceSmoke } from
  "../../framework/surface-smoke-runner";

for (const surface of smokeSurfaces) {
  test(
    `PO smoke: ${surface.description}`,
    async ({ app }, testInfo) => {
      await runSurfaceSmoke(
        app,
        surface,
        testInfo,
      );
    },
  );
}
```

Screenshot capture suite:

Recommended file:

```
src/specs/capture/page-objects.capture.spec.ts
```

```
import { test } from "../../framework/guided-test";

import { smokeSurfaces } from
  "../../framework/surface-registry";

import { runSurfaceSmoke } from
  "../../framework/surface-smoke-runner";

import { fullPageScreenshotAction } from
  "../../framework/actions/full-page-screenshot.action";

for (const surface of smokeSurfaces) {
  test(
    `Capture: ${surface.description}`,
    async ({ app }, testInfo) => {
      await runSurfaceSmoke(
        app,
        surface,
        testInfo,
        [fullPageScreenshotAction],
      );
    },
  );
}
```

Why generate one test per Page Object?

This does not contradict the earlier rule against granular acceptance tests.

The universal Page Object smoke suite validates independent structural contracts, not complete user journeys.

Creating one automatically generated smoke case per Page Object provides an important advantage: one broken Page Object does not prevent the remaining Page Objects from being evaluated.

For example, if Template Authoring fails to open, the suite should still report whether Settings, Field editor, and Template catalog pass.

A single test containing one sequential loop over all Page Objects would ordinarily stop at the first failure.

The registry remains one collection, and test generation remains one shared implementation.

Execution model:

| Characteristic                  | Universal smoke       | Screenshot capture       |
| ------------------------------- | --------------------- | ------------------------ |
| Page Object registry            | Same                  | Same                     |
| Opening chain                   | Same                  | Same                     |
| Existence assertion             | Yes                   | Yes                      |
| Required controls               | Yes                   | Yes                      |
| Default state                   | Where applicable      | Where applicable         |
| Browser diagnostics             | Yes                   | Yes                      |
| Injected action                 | None                  | Screenshot               |
| Independent context per surface | Yes                   | Yes                      |
| Runs before acceptance          | Yes                   | No                       |
| Runs in default full validation | Yes                   | No                       |
| Produces screenshots by default | Failure evidence only | Every successful surface |

Do not merge screenshot capture into default smoke execution.

Screenshot capture is an optional tool-oriented workflow. It should not slow the mandatory smoke gate.

## I00. Playwright integration and execution commands

The existing `playwright.config.ts` already defines:

| Project      | Existing behavior         |
| ------------ | ------------------------- |
| `smoke`      | Runs smoke specifications |
| `acceptance` | Depends on smoke          |

Retain that dependency.

Add an independently selectable capture project.

Recommended project configuration:

```
projects: [
  {
    name: "smoke",
    testMatch: "**/smoke/*.spec.ts",
  },
  {
    name: "acceptance",
    testMatch: "**/acceptance/*.spec.ts",
    dependencies: ["smoke"],
  },
  {
    name: "capture",
    testMatch: "**/capture/*.spec.ts",
  },
],
```

This is an illustrative replacement of the existing `projects` property, not a replacement for the complete Playwright configuration.

Preserve existing build verification, browser options, fixture isolation, diagnostics, trace collection, and web-server configuration.

Commands:

| Command                   | Behavior                                                         |
| ------------------------- | ---------------------------------------------------------------- |
| `bun run test:smoke`      | Existing grouped smoke plus all registry Page Object smoke cases |
| `bun run test:acceptance` | Smoke dependency followed by acceptance                          |
| `bun run test:all`        | Unit/typecheck, smoke, acceptance; excludes optional capture     |
| `bun run test:capture`    | Registry smoke with screenshot action                            |
| `bun run test:headed`     | Existing headed acceptance behavior                              |
| `bun run test:debug`      | Existing debugging behavior                                      |

Important package-script change:

The uploaded package currently uses:

```
{
  "test:all": "bun run typecheck && bun run test:unit && playwright test"
}
```

After introducing a `capture` project, a bare `playwright test` would also select that new project.

That would accidentally make screenshot capture part of standard validation.

Update the script to select only the mandatory projects, for example:

```
{
  "scripts": {
    "test:smoke": "playwright test --project smoke",
    "test:acceptance": "playwright test --project acceptance",
    "test:capture": "playwright test --project capture",
    "test:all": "bun run typecheck && bun run test:unit && playwright test --project smoke --project acceptance"
  }
}
```

The actual implementation must merge these changes with existing package scripts rather than discard unrelated commands.

Acceptance gating:

Acceptance depends on the smoke project.

If a universal Page Object smoke case fails, the acceptance project must not proceed as though the application passed its readiness gate.

The capture project must not become an acceptance dependency.

Execution example:

```
cd ui-regression-test-suite

bun run test:smoke
```

Expected output resembles:

```
PO smoke: Document workspace        PASS
PO smoke: Document navigation       PASS
PO smoke: Template catalog          PASS
PO smoke: Workspace support panels  PASS
PO smoke: Field editor              PASS
PO smoke: Template Authoring        PASS
PO smoke: Settings                  PASS
```

For screenshots:

```
bun run test:capture
```

Expected outcome:

```
Capture: Document workspace          PASS
  document-workspace.png

Capture: Document navigation         PASS
  document-navigation.png

Capture: Template catalog            PASS
  template-catalog.png

Capture: Workspace support panels    PASS
  workspace-panels.png

Capture: Field editor                PASS
  field-editor.png

Capture: Template Authoring          PASS
  template-authoring.png

Capture: Settings                    PASS
  settings.png
```

These examples describe the required reporting format, not results claimed from an executed implementation.

## J00. Execution isolation, performance, and deterministic state

Every registered Page Object smoke case must start in an independent test context.

The suite already provides the necessary fixture behavior.

Isolation contract:

| Scope                 | Required behavior                                  |
| --------------------- | -------------------------------------------------- |
| Chromium process      | Reused by worker                                   |
| Browser context       | Fresh for each Page Object smoke case              |
| Page                  | New application page                               |
| Guided storage        | Clean unless scenario explicitly seeds state       |
| Layout preferences    | Default for that context                           |
| Theme                 | Default unless scenario explicitly selects another |
| Page Object instances | Owned by current `GuidedApp`                       |
| Diagnostic collector  | Associated with current context                    |
| Screenshot path       | Unique to current test output directory            |
| Test-order dependency | None                                               |

Do not reuse one document state across the seven Page Object cases.

This is necessary to validate that each Page Object's `open()` works independently.

Performance expectations:

The smoke suite should remain fast by avoiding unnecessary work.

A Page Object contract test should generally perform only opening, readiness, default-state verification, and browser-diagnostic checks.

It must not create substantial documents, populate long forms, generate exports, or exercise persistence scenarios unless those operations are genuinely necessary to establish that the surface can open.

Opening cost:

If a Page Object requires navigation through several parent surfaces, those actions are appropriate.

However, do not introduce long arbitrary waits or repeated setup operations.

Use the current Playwright readiness timeout and condition-based waiting facilities.

No fixed sleeps:

Avoid:

```
await page.waitForTimeout(2000);
```

Prefer waiting for the actual required control or state.

Side-effect minimization:

`open()` may change workspace or select a field to establish a valid target state.

It must not silently delete, archive, rename, or overwrite existing records.

From a fresh test context, it must not create persistent documents simply because it needs a selected field for smoke.

For Field editor, selecting an existing template's first editable placeholder in a temporary document is appropriate.

Determinism:

Every Page Object smoke case must reach a consistent representative ready state from a clean context.

Do not randomly choose templates, documents, fields, or navigation routes.

If a surface has several distinct relevant modes, its registry entry may later declare named smoke profiles.

For example:

| Surface            | Optional future profile        |
| ------------------ | ------------------------------ |
| Field editor       | Single-line, multiline, choice |
| Settings           | Full page, compact dock        |
| Workspace panels   | Floating, docked               |
| Template catalog   | Gallery, search results        |
| Template Authoring | Current draft, historical view |

These profiles are not required for initial universal smoke coverage.

The initial requirement is one deterministic default ready state per concrete Page Object.

Existing comprehensive acceptance scenarios retain responsibility for the other modes.

Failure isolation:

One surface failing to open must not contaminate another surface's context.

The test runner should complete other generated Page Object smoke cases unless the underlying browser/server is globally unavailable.

A missing built application is a global preflight failure, not seven independent Page Object failures.

## K00. Logging, diagnostics, and failure classification

Reuse the existing `BrowserDiagnostics` and `Timings` utilities.

Do not implement another browser event collection system solely for universal smoke.

Logging responsibilities:

| Event                     | Information                       |
| ------------------------- | --------------------------------- |
| Surface test begins       | Surface ID and description        |
| Page Object created       | Surface/class identity            |
| Open begins               | Target surface                    |
| Open completes            | Duration and result               |
| Existence checked         | True/false                        |
| Required controls checked | Total and failures                |
| Default state checked     | Applicable result                 |
| Extension begins          | Extension ID                      |
| Extension completes       | Duration and result               |
| Screenshot created        | Artifact name/path                |
| Test fails                | Failure stage, cause, diagnostics |
| Test completes            | Final status                      |

Use Playwright's named steps as the primary user-facing test log.

The existing timing recorder supplies durations.

Additional structured records should be added only where necessary to distinguish failure stages or support useful reporting.

Failure classification:

| Failure stage                | Classification                            |
| ---------------------------- | ----------------------------------------- |
| `open()` throws              | Opening failure                           |
| `exists()` false             | Surface existence failure                 |
| Required control missing     | Structural readiness failure              |
| Default focus incorrect      | Default-state failure                     |
| Critical browser error       | Application/browser failure               |
| Screenshot fails             | Extension action failure                  |
| Test ID missing              | Automation contract or product regression |
| Registry missing Page Object | Framework coverage violation              |
| Browser unavailable          | Infrastructure failure                    |

Do not report a failed screenshot as evidence that a Page Object could not open when its opening and readiness checks succeeded.

Error detail:

A failed smoke case should identify the relevant surface and operation.

Example:

```
Page Object smoke failed

Surface: Field editor
Stage: Required controls
Expected: Active answer input visible
Actual: Input not visible

Opening chain:
  Document workspace
  Selected placeholder
  Field editor panel

Browser diagnostics:
  No critical browser errors
```

The exact formatting may differ. The information must remain available through the Playwright report and error details.

No false telemetry requirements:

Do not introduce standalone tests asserting that particular timing or logging calls occurred.

The framework must report useful diagnostic evidence, but its correctness is defined by observed application behavior and test outcomes.

This preserves the previously adopted telemetry architecture decision.

Privacy:

Do not log complete document answers, private template source, clipboard contents, or unrelated browser history.

Synthetic test-fixture identifiers may appear in diagnostics.

Screenshots must use isolated synthetic test contexts.

## L00. Documentation, code comments, and extension authoring

The framework must be documented sufficiently for another developer or coding agent to extend it without reverse-engineering the test runner.

Create a dedicated documentation page:

```
docs/page-object-smoke-framework.md
```

A shorter overview and command reference must also appear in the regression suite's existing `README.md`.

Documentation requirements:

| Topic                | Required explanation                           |
| -------------------- | ---------------------------------------------- |
| Purpose              | What universal Page Object smoke verifies      |
| Page Object contract | `open`, `exists`, `expectReady`, default state |
| Opening dependencies | How child surfaces invoke owning surfaces      |
| Registry             | How Page Objects are registered                |
| Completeness         | How omissions are detected                     |
| Execution            | How each smoke case is generated               |
| Extensions           | How to inject post-validation actions          |
| Screenshots          | Capture mode, filenames, artifact locations    |
| Isolation            | How fresh contexts are provided                |
| Failure reporting    | Where diagnostics and traces appear            |
| Maintenance          | How new Page Objects and actions are added     |
| Limitations          | What smoke does not verify                     |
| Commands             | Smoke, capture, acceptance, full validation    |

Code comments:

Add substantial explanatory comments around architectural contracts and non-obvious decisions.

Prioritize comments explaining why an abstraction or lifecycle rule exists.

Examples of comments that should appear near the relevant implementation:

```
/**
 * Every concrete Page Object must be registered here.
 *
 * The registry is the authoritative inventory for universal
 * structural smoke coverage and optional capture actions.
 *
 * Do not create Page Object instances here. Resolve them
 * through the GuidedApp factory so each test retains the
 * correct browser context and dependency graph.
 */
```

```
/**
 * Runs the common Page Object contract before optional actions.
 *
 * Extensions execute only after opening, existence, required
 * controls, and applicable default-state validation succeed.
 *
 * The runner does not repair application state. A failed
 * readiness contract must remain an observable test failure.
 */
```

```
/**
 * Captures the full Playwright page, not each independently
 * scrolling application panel.
 *
 * The screenshot filename derives from the stable registry ID.
 * Playwright's outputPath keeps parallel test artifacts isolated.
 *
 * This action does not navigate, select controls, or mutate
 * application settings before capture.
 */
```

Avoid comments that merely restate obvious code, such as `// Click button` immediately above `.click()`.

Adding a new Page Object:

Document a short, mandatory process:

1. Implement the class extending `PageObject`.
2. Define its root and required controls.
3. Implement `open()` with necessary dependency resolution.
4. Define meaningful default-state expectations.
5. Expose the instance through `GuidedApp`.
6. Register it in `smokeSurfaces`.
7. Run the registry completeness check.
8. Run universal Page Object smoke.
9. Run screenshot capture if visual inspection is needed.
10. Update acceptance coverage if the new surface introduces or changes a meaningful user workflow.

The registry completeness check must ensure this process cannot be bypassed accidentally.

Adding a new extension:

Document the corresponding process:

1. Create a new `SurfaceAction` implementation.
2. Give it a stable action ID.
3. Use the supplied Page Object, application context, and test metadata.
4. Avoid duplicating readiness logic.
5. Avoid product-source imports.
6. Define its reporting/artifact behavior.
7. Register it in the intended optional test suite.
8. Verify its failure behavior.
9. Document its limitations.

A developer adding a screenshot action, accessibility action, or geometry report must not need to change the abstract `PageObject` class.

Agent instructions:

Update Guided's existing regression-suite maintenance guidance in `AGENTS.md` to require registration of every new concrete Page Object and maintenance of the universal smoke contract.

Preserve the existing source-isolation directive.

The agent must not copy product implementation modules into a test abstraction in a way that derives expected results from the implementation under test.

## M00. Automated verification of the smoke framework itself

The framework requires small infrastructure/unit tests to verify its orchestration.

These are not additional granular browser acceptance scenarios.

Framework verification matrix:

| Test                  | Required outcome                            |
| --------------------- | ------------------------------------------- |
| Unique registry IDs   | Duplicate IDs rejected                      |
| Registry completeness | Every concrete Page Object represented      |
| Missing registration  | Completeness validation fails               |
| Basic runner          | Calls `open()`                              |
| Existence             | Calls `exists()` after opening              |
| Required controls     | Calls `expectReady()`                       |
| Default state         | Runs only when applicable                   |
| Validation order      | Extensions run only after successful checks |
| Opening failure       | Later validation/extensions skipped         |
| Readiness failure     | Extension not executed                      |
| Extension failure     | Error identifies action and surface         |
| Multiple extensions   | Execute in declared order                   |
| No extensions         | Runner works normally                       |
| Screenshot naming     | Stable surface ID used                      |
| Independent tests     | Each surface uses its own context           |
| Fixture cleanup       | Context disposed after case                 |
| Default commands      | Capture project excluded                    |
| Acceptance dependency | Smoke gates acceptance                      |

For runner unit tests, use independent fake Page Objects or typed test doubles.

Do not start Chromium merely to prove the runner invokes methods in the correct sequence.

Actual browser smoke tests remain responsible for proving that real Guided Page Objects can open.

Example runner-order verification:

A fake Page Object records method invocations.

With one extension, the expected order is:

```
open
exists
expectReady
expectDefaultState
extension
```

When readiness fails, the expected sequence is:

```
open
exists
expectReady -> failure
```

The extension must not run.

This is a suitable small unit test because it verifies framework orchestration, not an isolated UI button.

Sensitivity checks:

The existing regression suite includes failure-injection tooling.

Extend its coverage, where appropriate, to demonstrate that removing a required test ID or preventing a Page Object from opening causes the universal smoke gate to fail.

Restore product source and rebuild after each controlled injection.

Do not weaken a Page Object's required-control declaration merely to make smoke pass.

## N00. Acceptance criteria

The new framework is complete only when all requirements below are satisfied.

| ID   | Scenario                                               | Expected outcome                                      |
| ---- | ------------------------------------------------------ | ----------------------------------------------------- |
| US01 | Run smoke with seven current Page Objects              | All seven independently opened and validated          |
| US02 | Open same Page Object twice                            | Idempotent, one usable surface                        |
| US03 | Open Field editor from fresh context                   | Necessary editable field established and editor ready |
| US04 | Open Template Authoring from Documents                 | Dependency navigation succeeds                        |
| US05 | Open Settings from a different workspace               | Settings ready without destructive navigation         |
| US06 | Required control is missing                            | Corresponding Page Object case fails                  |
| US07 | Default focus is incorrect                             | Applicable default-state test fails                   |
| US08 | Critical browser error occurs                          | Relevant case fails with diagnostics                  |
| US09 | One Page Object fails                                  | Other independently generated cases still execute     |
| US10 | New concrete Page Object is not registered             | Completeness check fails                              |
| US11 | Run default smoke                                      | No success screenshots captured                       |
| US12 | Run capture suite                                      | One full-page PNG for each passing surface            |
| US13 | Inspect screenshot names                               | Stable registry-based filenames                       |
| US14 | Screenshot capture fails                               | Extension failure reported distinctly                 |
| US15 | Surface readiness fails in capture suite               | No success screenshot action executed                 |
| US16 | Two extensions are supplied                            | Execute in declared order                             |
| US17 | Run normal acceptance command                          | Universal smoke runs first                            |
| US18 | Universal smoke fails                                  | Acceptance dependency blocked                         |
| US19 | Run `test:all`                                         | Optional capture suite excluded                       |
| US20 | Run smoke cases in different order                     | No dependency on previous surface state               |
| US21 | Run browser tests concurrently                         | No storage leakage across contexts                    |
| US22 | Review framework documentation                         | Registry and extension instructions complete          |
| US23 | Add new extension without changing Page Object classes | Supported                                             |
| US24 | Execute existing SM01/SM02                             | Original smoke coverage preserved                     |
| US25 | Execute existing acceptance suite                      | Existing user-journey behavior preserved              |

No redundant test growth:

The new universal smoke pass should not trigger the creation of seven manually written smoke specifications.

The registry generates the seven structural checks.

Preserve SM01 and SM02 for their existing grouped behavioral coverage, but review their purely structural assertions for unnecessary duplication.

Do not remove valuable existing focus, editing, storage-isolation, and transient-menu checks merely because universal readiness now covers the same Page Objects' existence.

## O00. Consolidated implementation decisions

This section is authoritative and intentionally repeats the most important design choices.

| Design question                                                | Decision                                  |
| -------------------------------------------------------------- | ----------------------------------------- |
| Which principle enables one runner for different Page Objects? | Polymorphism                              |
| Must all concrete Page Objects extend the shared base?         | Yes                                       |
| Must every Page Object implement `open()`?                     | Yes                                       |
| Must `open()` resolve dependencies?                            | Yes                                       |
| Must `open()` be idempotent?                                   | Yes                                       |
| Must opening preserve authored data?                           | Yes                                       |
| Must every Page Object implement `close()`?                    | No                                        |
| Where is the Page Object inventory maintained?                 | One explicit registry                     |
| Is registry completeness verified?                             | Yes                                       |
| Does every registered Page Object get smoke coverage?          | Yes                                       |
| Does every required control get checked?                       | Yes                                       |
| Does smoke replace acceptance testing?                         | No                                        |
| Does smoke cover all possible states?                          | No                                        |
| Does the runner reimplement readiness logic?                   | No                                        |
| Are default-state checks separate?                             | Yes                                       |
| Can smoke inject additional actions?                           | Yes                                       |
| When do extensions run?                                        | After successful validation               |
| Are extensions embedded in Page Objects?                       | No                                        |
| Does the default smoke take screenshots?                       | No                                        |
| Is screenshot capture a separate suite?                        | Yes                                       |
| Do screenshot tests use the same registry?                     | Yes                                       |
| Are screenshots full-page?                                     | Yes                                       |
| Are screenshot names deterministic?                            | Yes                                       |
| Do screenshots capture all nested scrolling content?           | Not automatically                         |
| Is each Page Object test isolated?                             | Yes                                       |
| Is the browser process reused?                                 | Yes                                       |
| Does one failing Page Object stop all other cases?             | No, barring global infrastructure failure |
| Does smoke gate acceptance?                                    | Yes                                       |
| Does screenshot capture gate acceptance?                       | No                                        |
| Does `test:all` run screenshot capture?                        | No                                        |
| Are original grouped smoke tests preserved?                    | Yes                                       |
| Is logging integrated with existing diagnostics?               | Yes                                       |
| Are new product-source dependencies permitted?                 | No                                        |
| Can new actions be implemented without base-class changes?     | Yes                                       |

Architectural invariants:

| Contract        | Invariant                                                                      |
| --------------- | ------------------------------------------------------------------------------ |
| Registry        | One authoritative collection of Page Object smoke targets                      |
| Opening         | Each object establishes its own valid surface through normal UI navigation     |
| Readiness       | Existing Page Object methods remain authoritative                              |
| Extensibility   | Actions depend on the smoke runner's public context, not Page Object internals |
| Isolation       | Test contexts remain independent                                               |
| Reporting       | Each surface has an independently diagnosable outcome                          |
| Screenshots     | Deterministic, opt-in, Playwright-managed artifacts                            |
| Maintenance     | New Page Objects require registry coverage                                     |
| Completeness    | All registered surfaces and declared controls validated                        |
| Acceptance      | Comprehensive user journeys remain separately maintained                       |
| Test boundaries | No imports from the Guided application under test                              |

### Final expected result

The implementing agent should deliver a universal smoke-testing mechanism in which the registry is the only place needed to enumerate Page Objects.

Running:

```
bun run test:smoke
```

must open and validate every registered Page Object, report its individual result, and prevent the acceptance suite from proceeding when its required smoke gate fails.

Running:

```
bun run test:capture
```

must perform those same validations and then capture a deterministic, full-page PNG for every successfully validated surface.

Both workflows must use the same registry, opening contracts, readiness checks, browser fixtures, and diagnostics.

The screenshot capability must remain an independently supplied action. The architecture should make it straightforward to add other actions later, without modifying existing Page Objects or duplicating test logic.

This creates two complementary benefits: a fast, systematic check of the entire Page Object inventory, and a reusable framework for executing new tooling against reliably opened and validated application surfaces.