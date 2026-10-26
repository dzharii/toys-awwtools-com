DIRECTIVE: 

Regression Test Suite: Subproject Isolation and Independence

Organize the UI Regression Test Suite as a separate, self-contained subproject within the current Guided repository, under `ui-regression-test-suite/`. Although both projects reside in the same repository, the regression suite must maintain strict source-code, dependency, configuration, and test-data isolation from the application under test (Guided).

The regression suite is an independent external acceptance-testing application. Its purpose is to verify Guided's behavior from an independent perspective, not to reproduce or depend on the application's implementation. This separation is essential to prevent test contamination, shared defects, and false-positive results caused by deriving expected behavior from the same code being tested.

Isolation requirements:

1. The regression suite must maintain its own source tree, package configuration, dependencies, TypeScript configuration, Playwright configuration, test fixtures, Page Objects, Flows, and expected results.
Make sure to properly configure .gitignore in the automation suite project folder to not include node_modules and test result files that are not needed in the source repo. 

2. The regression suite must not import, reference, link, or execute source modules from Guided. This restriction also applies to shared packages, TypeScript path aliases, symlinks, and other mechanisms that indirectly couple the suite to the application's implementation.

3. When existing Guided source files, utilities, types, constants, templates, or fixtures would be useful for testing, prefer maintaining independent copies inside the regression-suite directory rather than referencing the original files. Copies must be explicitly reviewed, owned, and maintained by the regression suite. They must not be automatically synchronized with the application under test.

4. Expected values, assertions, test fixtures, and acceptance criteria must be independently defined. In particular, tests must not use Guided's own GTL parser, renderer, validation functions, or domain services to calculate the expected results of those same operations. Otherwise, a shared implementation defect could cause both actual and expected results to be incorrect while the test still passes.

5. The suite must interact with Guided primarily through its built application, served in a real browser using Playwright. The compiled application, its runtime assets, and its observable UI constitute the system under test, not reusable test dependencies. Controlled gray-box setup and inspection are permitted when necessary, but must not compromise independent verification of user-facing outcomes.

6. Stable external contracts, including `data-testid` values, accessible labels, keyboard commands, and documented interaction behavior, may be independently represented in Page Objects. Their definitions must not be imported from Guided. Product-side automation identifiers are part of the interface contract, not a justification for sharing implementation code.

7. Guided must likewise remain independent of the regression suite. Production source must not import regression-suite modules or require its dependencies. The parent repository may provide build and test commands that invoke the suite without merging their implementation boundaries.

Specification precedence: These isolation requirements take precedence over any conflicting instructions elsewhere in `suggestions002-02-01`. Use engineering judgment to resolve inconsistencies in favor of independent test implementation and independent expected results. Reuse architectural patterns, design ideas, and independently maintained copies where appropriate, but never sacrifice isolation merely to reduce code duplication or simplify maintenance.

The intended result is two independently maintained applications within one repository: Guided as the product under test, and the UI Regression Test Suite as an external acceptance application capable of identifying regressions without inheriting the same implementation defects.



# File: `.specs/suggestions002-02-01-main-specification.md`

# Guided Document Editor - Browser Acceptance Testing Framework

Created: 2026-10-26\
Specification: `suggestions002-02-01`\
Revision: 00\
Status: Proposed implementation specification\
Project: Guided Document Editor\
Subproject: UI Regression Test Suite\
Technology: TypeScript, Bun, Playwright, Chromium\
Reference implementation: `D:\my-github\unsafe-link-preview-browser-extension\ui-regression-test-suite`

Related Guided specifications: `suggestions001-01` and `suggestions001-02`.

## A00. Purpose and objectives

Establish a separate, maintainable automated browser acceptance-testing application for Guided.

The suite must exercise the real, freshly built Guided application in Chromium through observable user interactions. It must verify that important user workflows remain operational as the application changes.

The testing architecture is based on the supplied eye05 UI Regression Test Suite, adapted to Guided's static web application, native Web Components, GTL templates, document storage, authoring environment, and configurable workspace panels.

The central engineering principle is:

Maintain a small number of comprehensive, realistic acceptance scenarios rather than a large collection of granular browser tests.

A scenario should reproduce a meaningful sequence of user activities, verify important intermediate outcomes, introduce realistic changes in application state, and exercise interactions between related features.

A single acceptance scenario may create a document, choose a template, fill several fields, validate the result, change panel layout, save the document, reload the application, reopen the document, and verify that its answers survived.

The suite must not divide such a journey into numerous independent browser tests simply because each operation can be tested separately.

Objectives:

| Objective              | Required outcome                                                 |
| ---------------------- | ---------------------------------------------------------------- |
| Regression protection  | Detect meaningful user-visible failures                          |
| Scenario coverage      | Exercise substantial workflows within each test                  |
| Small suite            | Avoid one browser test per button, field, or method              |
| Readability            | Tests describe user activities, not DOM mechanics                |
| Maintainability        | Product UI changes have a limited automation maintenance surface |
| Browser reuse          | Avoid unnecessary Chromium startup costs                         |
| Isolation              | Tests cannot silently depend on previous test state              |
| Testability            | Stable `data-testid` contracts prevent brittle selectors         |
| Diagnostics            | Failures identify the affected user journey and action           |
| Integration            | User-facing product changes require acceptance-impact analysis   |
| Data safety            | Tests verify save, reload, recovery, and state preservation      |
| Continuous maintenance | Acceptance coverage evolves with the product                     |

A passing acceptance suite should provide meaningful evidence that Guided's primary workflows operate together correctly.

Passing tests do not imply exhaustive correctness. The suite should prioritize high-impact workflows and known failure modes over test-count growth.

## B00. Reference project and adaptation boundary

The reference project is located on the user's development machine at:

```
D:\my-github\unsafe-link-preview-browser-extension\ui-regression-test-suite
```

The implementing agent must inspect this directory before designing or implementing Guided's new suite.

The supplied `ui-regression-test-suite.zip` also contains source and specifications from that project. The archive provides a reviewable snapshot, but the live local directory may contain newer changes and should be inspected directly.

Reference materials:

| Reference                                       | Relevant patterns                                     |
| ----------------------------------------------- | ----------------------------------------------------- |
| `specifications/00-MAIN-VISION.md`              | Framework philosophy and independence                 |
| `specifications/A00_*`                          | Separate project setup                                |
| `specifications/B00_*`                          | Page Objects, components, flows, dependency injection |
| `specifications/C00_*`                          | `data-testid` contracts                               |
| `specifications/D00_*`                          | Concrete Page Object implementation                   |
| `specifications/E00_*`                          | Smoke, functional, and flow testing                   |
| `specifications/F00_*`                          | Coding-agent implementation workflow                  |
| `specifications/G00_*`                          | Page Object authoring                                 |
| `specifications/H00_*`                          | Flow authoring                                        |
| `specifications/I00_*`                          | Maintenance and expansion                             |
| `specifications/J00_*`                          | Debuggability and code quality                        |
| `specifications/K00_*`                          | Failure-injection testing                             |
| `specifications/L00_*`                          | Default-focus and smoke inventory                     |
| `src/framework/app/automation-app.ts`           | Browser-session ownership and lifecycle               |
| `src/framework/fixtures/eye05-test.ts`          | Shared Playwright fixture                             |
| `src/framework/page-object/page-object-base.ts` | Page Object readiness contracts                       |
| `src/framework/controls/`                       | Reusable control abstractions                         |
| `src/flows/`                                    | Cross-surface orchestration                           |
| `src/page-objects/`                             | Product-surface models                                |
| `src/specs/`                                    | Actual acceptance-test examples                       |
| `src/framework/diagnostics/`                    | Browser error collection                              |
| `src/framework/measurements/`                   | Structured duration measurements                      |

The agent must inspect the actual reference code rather than copying an architecture diagram without understanding its implementation.

Transferable architecture:

| Reference capability            | Guided adaptation                                |
| ------------------------------- | ------------------------------------------------ |
| Separate acceptance application | Separate Guided regression-suite project         |
| Page Objects                    | Guided workspaces, panels, dialogs               |
| Page Components                 | Inputs, lists, panel controls, selectors         |
| Flows                           | Meaningful document and authoring journeys       |
| Shared browser                  | Worker-scoped Chromium reuse                     |
| Browser isolation               | Fresh isolated contexts per scenario             |
| Expected controls               | Declarative workspace readiness                  |
| Expected default state          | Focus and other important initial properties     |
| `data-testid`                   | Stable Guided automation identity                |
| Diagnostics                     | Page errors, console errors, traces, screenshots |
| Test steps                      | Named phases of user journeys                    |
| Failure injection               | Verify sensitivity to actual product defects     |
| Regression-impact analysis      | Mandatory maintenance for user-facing changes    |

Reference-specific behavior that must not be copied:

| eye05 implementation                     | Guided requirement                              |
| ---------------------------------------- | ----------------------------------------------- |
| Chrome Manifest V3 extension loading     | Serve Guided as a static website                |
| `chrome-extension://` URLs               | Use the local HTTP application origin           |
| Extension service-worker discovery       | Not required                                    |
| Chrome extension storage APIs            | Not required                                    |
| Extension permissions and alarms         | Not required                                    |
| Declarative Net Request cleanup          | Not required                                    |
| Content-script surface disposal          | Replace with Guided panel/workspace cleanup     |
| Extension Minibuffer                     | Not a Guided feature                            |
| Mini Browser URL navigation              | Not a Guided feature                            |
| Extension-specific launch commands       | Replace with Guided navigation actions          |
| Extension-only `data-eye05-*` attributes | Use Guided-specific contracts where necessary   |
| Extension persistent-context requirement | Use ordinary Chromium browser/context lifecycle |

The reference's architectural separation and testing discipline are authoritative patterns. Its product-specific behaviors are not Guided requirements.

The agent must not copy eye05 classes, commands, identifiers, storage schemas, or application assumptions simply to preserve superficial structural similarity.

## C00. Project boundary, installation, and runtime

Create the regression suite as a separate application inside the Guided repository.

Recommended location:

```
guided-project/
  AGENTS.md
  package.json
  bun.lock
  src/
  templates/
  .specs/
  dist/

  ui-regression-test-suite/
    package.json
    bun.lock
    tsconfig.json
    playwright.config.ts
    README.md
    src/
```

The actual existing Guided repository structure must be inspected before selecting paths. The structure above is illustrative, not permission to reorganize unrelated product files.

Project ownership:

| Area                        | Owner                               |
| --------------------------- | ----------------------------------- |
| Guided source and assets    | Guided application                  |
| GTL parser and renderer     | Guided application                  |
| Built runtime files         | Guided build                        |
| Playwright dependencies     | Regression suite                    |
| Browser fixtures            | Regression suite                    |
| Page Objects and components | Regression suite                    |
| Acceptance scenarios        | Regression suite                    |
| `data-testid` rendering     | Guided application                  |
| Test reports and traces     | Regression suite                    |
| Product unit tests          | Existing Guided test infrastructure |

Dependencies:

Use Bun and TypeScript, consistent with the parent project.

Install Playwright in the regression-suite package, not as a Guided runtime dependency.

The implementing agent must identify a compatible Playwright version, pin it through the suite's lockfile, and install the matching Chromium browser.

Example setup commands:

```
cd ui-regression-test-suite

bun add -d @playwright/test typescript
bunx playwright install chromium
```

Additional development-only TypeScript/Bun types may be installed where required by the actual configuration.

The suite must not introduce an application framework or duplicate the product's runtime dependencies.

Source separation:

The regression suite MUST NOT import Guided implementation modules.

Guided source MUST NOT import regression-suite implementation modules.

The following is prohibited:

```
import { DocumentService } from "../../src/features/documents/service";
```

The following is permitted:

```
page.getByTestId("guided-documents-main-button-new");
```

Stable UI contracts are independently encoded in product source and Page Objects.

The suite may use generated test fixtures and independently maintained GTL examples, but it must not obtain expected behavior by invoking the same production parser or renderer being tested.

Otherwise, a parser regression could contaminate both the application's actual result and the test's expected result.

Built-product requirement:

The suite must test the same compiled application structure that is deployed.

It must not substitute a mock Guided interface or silently execute unbuilt TypeScript in place of the product.

Before browser testing, verify the existence of the expected build artifact, including the main HTML entry, application scripts, bundled template manifest, GTL sources, and Web Worker output.

Fail with an actionable message when the build is absent or stale.

Static hosting:

Serve the built application over a local HTTP origin.

Do not depend on `file://` navigation.

The server must correctly provide JavaScript, CSS, JSON, GTL, and worker resources.

The implementation should use an existing Guided static-preview command if one exists. Otherwise, introduce a small dedicated static-file server for acceptance testing.

Use a configurable base URL rather than hard-coded production-domain paths.

Commands:

The suite must provide the following stable interface:

| Command                   | Responsibility                     |
| ------------------------- | ---------------------------------- |
| `bun run typecheck`       | Type-check regression-suite source |
| `bun run test:smoke`      | Run compact readiness gate         |
| `bun run test:acceptance` | Run comprehensive scenarios        |
| `bun run test:all`        | Run smoke and acceptance           |
| `bun run test:headed`     | Run acceptance visibly             |
| `bun run test:debug`      | Open Playwright debugging workflow |

Example package-script definitions:

```
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test:smoke": "playwright test src/specs/smoke",
    "test:acceptance": "playwright test src/specs/acceptance",
    "test:all": "bun run test:smoke && bun run test:acceptance",
    "test:headed": "playwright test src/specs/acceptance --headed",
    "test:debug": "playwright test --debug"
  }
}
```

These are suite-local scripts. Product build/typecheck commands retain their existing behavior.

The parent repository may expose a convenience command delegating to the suite, but the suite must remain independently runnable.

# File: `.specs/suggestions002-02-01-framework.md`

# Guided Browser Acceptance Framework - Architecture and Automation Contracts

Created: 2026-10-26\
Specification: `suggestions002-02-01`\
Revision: 00\
Status: Implementation contract

## D00. Framework architecture and object model

The regression suite must provide a small, reusable automation framework rather than unrelated Playwright scripts.

Its architecture consists of five responsibilities.

| Layer               | Responsibility                                         | Guided example               |
| ------------------- | ------------------------------------------------------ | ---------------------------- |
| Browser fixture     | Browser lifecycle, test isolation, application startup | Guided test fixture          |
| Page Object         | Model a user-facing surface                            | Document workspace           |
| Page Component      | Model a reusable control or control group              | Field input, panel header    |
| Flow                | Coordinate meaningful interactions across surfaces     | Create project description   |
| Acceptance scenario | Verify a complete user outcome                         | Create, save, reopen, export |

Dependencies follow this direction:

```
Acceptance Scenario
        |
        v
       Flow
        |
        v
    Page Objects
        |
        v
   Page Components
        |
        v
 Playwright Locators
        |
        v
 Built Guided Application
```

The testing framework must not become a second implementation of Guided's business logic.

For example, the suite should not implement GTL parsing to predict application output. It should use independently specified expected text and compare it against the rendered result.

Proposed project structure:

```
ui-regression-test-suite/
  package.json
  bun.lock
  tsconfig.json
  playwright.config.ts
  README.md

  src/
    framework/
      app/
        guided-automation-app.ts
        app-context.ts
      fixtures/
        guided-test.ts
      controls/
        locator-controls.ts
      diagnostics/
        browser-diagnostics.ts
      timeouts/
        timeouts.ts

    page-objects/
      document-workspace.page.ts
      template-catalog.page.ts
      field-editor.page.ts
      workspace-panels.page.ts
      document-navigation.page.ts
      template-authoring.page.ts
      settings.page.ts

    page-components/
      dockable-panel.component.ts
      placeholder.component.ts
      document-row.component.ts
      template-card.component.ts
      version-selector.component.ts
      source-editor.component.ts

    flows/
      create-guided-document.flow.ts
      arrange-workspace.flow.ts
      manage-document-history.flow.ts
      author-template.flow.ts

    specs/
      smoke/
        guided-workspaces.smoke.spec.ts
      acceptance/
        guided-writing.acceptance.spec.ts
        workspace-layout.acceptance.spec.ts
        document-lifecycle.acceptance.spec.ts
        template-authoring.acceptance.spec.ts
        persistence-recovery.acceptance.spec.ts
        keyboard-responsive.acceptance.spec.ts

    support/
      test-data/
        project-description.ts
        sample-email.ts
      browser/
        storage-isolation.ts
      artifacts/
        failure-evidence.ts
```

This is an architectural starting point, not a mandatory requirement to create every file immediately.

The initial implementation should create only files corresponding to real responsibilities.

Avoid empty abstraction layers, one-method wrapper classes, generic helper directories, and unnecessary code fragmentation.

Page Object contract:

A Page Object models a meaningful application surface.

It exposes operations in product language, not click coordinates or internal DOM structure.

Required conceptual interface:

```
export interface PageObject {
  open(): Promise<void>;
  exists(): Promise<boolean>;
  expectReady(): Promise<void>;
  expectedControls(): readonly ExpectedControl[];
  expectedDefaultControlState(): readonly ExpectedControlState[];
}
```

Dismissible surfaces also expose:

```
export interface DismissiblePageObject extends PageObject {
  close(): Promise<void>;
}
```

This adapts the reference project's `open()`, `exists()`, and `close()` model to Guided.

A permanent root workspace must not implement a meaningless fake Close operation merely to satisfy a shared interface.

A floating Field editor or Settings panel can implement Close or Collapse according to its product contract.

Page Object responsibilities:

| Responsibility                              | Belongs in Page Object?                             |
| ------------------------------------------- | --------------------------------------------------- |
| Locate primary controls                     | Yes                                                 |
| Open its surface                            | Yes                                                 |
| Determine surface readiness                 | Yes                                                 |
| Declare important fresh-open states         | Yes                                                 |
| Perform user-intent actions                 | Yes                                                 |
| Read user-visible state                     | Yes                                                 |
| Know internal Guided services               | No                                                  |
| Construct browser contexts                  | No                                                  |
| Implement GTL rendering                     | No                                                  |
| Coordinate unrelated multi-surface journeys | Usually Flow                                        |
| Define business acceptance assertions       | Usually scenario                                    |
| Contain CSS layout assumptions              | Only when directly testing required layout behavior |

A Page Object should expose meaningful operations such as:

```
await document.selectTemplate("Project description");
await document.selectWritingStyle("Input + processing + output");
await editor.enterAnswer("checks it for syntax errors");
await navigation.archiveCurrentDocument();
await authoring.saveDraft();
```

Tests must not know which buttons, elements, or event handlers implement these operations.

Page Components:

A Page Component is appropriate when the same interactive control structure occurs in several surfaces or has meaningful internal behavior.

Examples include a dockable panel header, labeled answer input, version-selection group, or document row.

A component receives a Playwright Locator or compatible locator scope.

It should not create new pages, browser contexts, or independent application state.

Do not create a component for every plain button when a direct locator inside its owning Page Object would be clearer.

Flows:

A Flow coordinates multiple surfaces to accomplish one product-level activity.

Examples:

| Flow                         | Involved surfaces                                                  |
| ---------------------------- | ------------------------------------------------------------------ |
| Create guided document       | Template catalog, version selector, Field editor, Generated result |
| Arrange workspace            | Document workspace, panel controls, Settings                       |
| Archive and restore document | Document navigation, workspace, notification                       |
| Recover authoring checkpoint | Template Authoring, history, source editor, confirmation           |
| Reopen persisted document    | Workspace, navigation, browser reload                              |
| Recover from failed save     | Editor, save status, Issues, recovery action                       |

A Flow must not become a general-purpose god object. Its responsibility should be one coherent journey or reusable orchestration.

Dependency injection:

Page Objects and Flows receive dependencies explicitly through constructors or options.

Do not instantiate Playwright browser contexts, diagnostics services, or unrelated Page Objects inside arbitrary methods.

The application factory wires the dependencies together.

Application factory:

Provide a small, discoverable entry point:

```
export interface GuidedAutomationApp {
  documents(): DocumentWorkspacePageObject;
  templates(): TemplateCatalogPageObject;
  fieldEditor(): FieldEditorPageObject;
  panels(): WorkspacePanelsPageObject;
  navigation(): DocumentNavigationPageObject;
  authoring(): TemplateAuthoringPageObject;
  settings(): SettingsPageObject;
}
```

The factory may cache Page Object instances for the lifetime of one test.

Do not use hidden global singletons for active page state.

## E00. Product testability contract and `data-testid` standard

Guided must expose stable automation identities through its rendered UI.

The standard attribute is:

```
data-testid
```

Do not invent competing attributes such as `data-qa`, `test-id`, or `data-automation` for the same purpose.

Naming convention:

```
<feature>-<surface>-<element-type>-<specific-name>
```

Use lowercase, hyphen-separated values.

Names should describe stable product concepts rather than implementation details.

Proposed Guided identifiers:

| Surface             | Test ID                                          |
| ------------------- | ------------------------------------------------ |
| Application root    | `guided-app-main-region-root`                    |
| New Document        | `guided-documents-main-button-new`               |
| Document workspace  | `guided-documents-main-region-workspace`         |
| Template search     | `guided-templates-search-input-query`            |
| Template collection | `guided-templates-main-region-catalog`           |
| Template card       | `guided-templates-main-list-item-template`       |
| Version selector    | `guided-templates-version-region-choices`        |
| Guided document     | `guided-documents-main-region-guided-text`       |
| Placeholder         | `guided-documents-main-button-placeholder`       |
| Generated result    | `guided-documents-result-region-content`         |
| Copy text           | `guided-documents-result-button-copy-text`       |
| Export              | `guided-documents-result-button-export`          |
| Document list       | `guided-documents-navigation-list-documents`     |
| Document row        | `guided-documents-navigation-list-item-document` |
| Archive action      | `guided-documents-navigation-button-archive`     |
| Restore action      | `guided-documents-navigation-button-restore`     |
| Delete action       | `guided-documents-navigation-button-delete`      |
| Field editor        | `guided-field-editor-main-panel-root`            |
| Answer input        | `guided-field-editor-main-input-answer`          |
| Multiline answer    | `guided-field-editor-main-textarea-answer`       |
| Field identifier    | `guided-field-editor-main-label-identifier`      |
| Issues              | `guided-issues-main-panel-root`                  |
| Settings panel      | `guided-settings-main-panel-root`                |
| Authoring workspace | `guided-authoring-main-region-workspace`         |
| GTL source editor   | `guided-authoring-source-textarea-content`       |
| Save draft          | `guided-authoring-main-button-save`              |
| Template history    | `guided-authoring-history-list-checkpoints`      |
| Restore checkpoint  | `guided-authoring-history-button-restore`        |

These identifiers form the initial naming proposal. The implementing agent must reconcile them with actual component structure and record the adopted contract.

Once adopted, changing a test ID is a compatibility change requiring Page Object review.

Test ID stability:

Test IDs must not incorporate:

| Prohibited source          | Example                          |
| -------------------------- | -------------------------------- |
| Random identifiers         | UUID suffixes                    |
| Database primary keys      | Record IDs in the test ID string |
| User-entered text          | Current document title           |
| Current UI layout          | Absolute left/right coordinates  |
| CSS class names            | Generated styling names          |
| Implementation paths       | TypeScript filenames             |
| Translated labels          | Localized UI strings             |
| Temporary animation states | Transition-generated names       |

Repeated controls may intentionally share the same test ID.

For example, every document row may expose:

```
<div
  data-testid="guided-documents-navigation-list-item-document"
  data-document-id="...">
</div>
```

The Page Object identifies the intended row through its stable observable identity and performs actions within that row.

Similarly, repeated placeholder occurrences may expose the same `data-testid` while carrying a stable placeholder-name attribute.

Do not embed a runtime document UUID into a test ID.

Example product-side implementation:

```
const newDocumentButton = document.createElement("button");

newDocumentButton.textContent = "New Document";

newDocumentButton.setAttribute(
  "data-testid",
  "guided-documents-main-button-new",
);
```

For a dynamic list:

```
row.setAttribute(
  "data-testid",
  "guided-documents-navigation-list-item-document",
);

row.setAttribute("data-document-id", documentRecord.id);
```

These changes must not alter functionality, styling, accessibility, or event behavior.

Selector ownership:

Tests and Flows must not contain raw selectors for Guided controls.

Allowed:

```
await app.navigation().archiveCurrentDocument();
```

Prohibited:

```
await page
  .locator(".sidebar .document-row:nth-child(2) button:last-child")
  .click();
```

The Page Object or Page Component owns the selector.

Locator preference:

| Priority | Locator                                                                      |
| -------- | ---------------------------------------------------------------------------- |
| 1        | Stable `getByTestId()` for major product controls                            |
| 2        | Accessible role/name where the semantics are themselves part of the contract |
| 3        | Stable field identity or entity attributes inside Page Objects               |
| 4        | Scoped semantic text for dynamic content                                     |
| Avoid    | Deep CSS chains, generated classes, positional selectors, screen coordinates |

A test may assert visible wording because wording is part of the user-facing contract.

It should not use unrelated decorative text to locate critical controls.

Accessibility:

`data-testid` does not replace semantic HTML, labels, roles, or ARIA attributes.

An input still needs an accessible label. A panel still needs an accessible name. A selectable style still needs accurate selection semantics.

Where test IDs are needed:

Add them to important interactive controls and verifiable regions.

Do not add them indiscriminately to decorative wrappers, SVG paths, typography spans, and every generated DOM node.

Shadow DOM:

Playwright's supported locators can operate through open Shadow DOM.

Page Objects should resolve controls through stable host/root identities and locators.

Do not restructure Web Components solely to make tests easier unless the existing implementation is genuinely inaccessible or violates the product's accessibility requirements.

Closed Shadow DOM or iframe boundaries need dedicated locator strategies. No extension-style cross-frame infrastructure is required unless Guided actually introduces such embedding.

Automation compatibility:

Test IDs are a stable external contract.

A product refactor that preserves behavior and test IDs should normally require little or no acceptance-test modification.

The product must not import test-suite constants merely to keep the two sides synchronized.

## F00. Browser lifecycle, reuse, and verified isolation

The reference suite reuses one extension-enabled persistent Chromium context per Playwright worker.

Guided does not require an extension-enabled persistent context.

Its acceptance suite must reuse the Chromium browser process while providing isolated browser state for each independent scenario.

Selected approach:

Use Playwright's worker-scoped browser lifecycle and create a fresh BrowserContext and Page for each test.

This provides browser reuse without complex manual deletion of IndexedDB, localStorage, cookies, and Web Worker state between unrelated scenarios.

| Resource                              | Lifetime                                                  |
| ------------------------------------- | --------------------------------------------------------- |
| Chromium browser process              | Playwright worker                                         |
| BrowserContext                        | One acceptance test                                       |
| Page                                  | One acceptance test unless scenario explicitly opens more |
| IndexedDB                             | Persists within that test's context                       |
| localStorage                          | Persists within that test's context                       |
| Web Workers                           | Created by application as needed                          |
| Session cookies                       | Isolated by context                                       |
| Test data                             | Scenario-owned                                            |
| Page Objects                          | One test application instance                             |
| Traces/screenshots                    | Per test                                                  |
| Browser process after worker finishes | Closed by Playwright                                      |

Important distinction:

A test must be able to reload Guided and verify that IndexedDB and localStorage content survived. The fixture must not reset the context between steps of the same scenario.

A different test starts from a fresh context and must not inherit those records.

Fixture contract:

Every browser acceptance scenario obtains its Page and application model through the common Guided fixture.

Tests must not independently launch Chromium or create unmanaged contexts for ordinary workflows.

The fixture owns startup, diagnostics, per-test isolation, and cleanup.

Example:

```
// src/framework/fixtures/guided-test.ts

import { test as base, expect } from "@playwright/test";
import { createGuidedAutomationApp } from "../app/guided-automation-app";

type GuidedFixtures = {
  guided: ReturnType<typeof createGuidedAutomationApp>;
};

export const test = base.extend<GuidedFixtures>({
  guided: async ({ page }, use) => {
    const guided = createGuidedAutomationApp(page);

    await page.goto("/");
    await guided.expectReady();

    await use(guided);
  },
});

export { expect };
```

This fixture relies on Playwright's own browser and context management. It does not need to duplicate the browser launcher implemented for the Chrome extension reference project.

Isolation verification:

| Scenario                                  | Required result                               |
| ----------------------------------------- | --------------------------------------------- |
| Test creates saved document, then reloads | Document persists                             |
| Test changes layout, then reloads         | Layout persists                               |
| New independent test starts               | No previous test's documents                  |
| New independent test starts               | Default Settings and layout                   |
| Test leaves panel expanded                | Next test starts clean                        |
| Test fails before normal cleanup          | Its context is discarded                      |
| One scenario opens two tabs               | Tabs intentionally share same context/storage |
| Separate scenarios run concurrently       | Storage and UI state remain isolated          |

The suite must contain at least one acceptance verification of these isolation guarantees.

Do not rely on test execution order to prove isolation.

Browser health:

If the browser process crashes or becomes unusable, subsequent work must use a healthy browser.

Do not silently reuse a broken browser/session.

For the initial implementation, prefer Playwright's built-in worker recovery over implementing a second session supervisor.

A custom browser supervisor may be introduced only if measured runtime behavior demonstrates a concrete need.

Test parallelism:

Begin with a conservative worker count.

Each test remains independent.

The suite must not rely on a previous test creating or archiving a document, modifying Settings, or changing browser storage.

Within one acceptance scenario, operations execute in their intended sequence.

Persistent-storage testing:

Do not use a fresh context between a Save and Reload step that is explicitly intended to verify persistence.

Conversely, do not use the same context for unrelated tests merely to reduce setup cost.

Cleanup:

Playwright should close test contexts and pages automatically.

Additional Guided-specific cleanup should be added only for resources that outlive the context or are not covered by ordinary context disposal.

Avoid copying the reference extension's destructive storage-reset procedure. It is unnecessary for the selected context-per-test model.

## G00. Page Object readiness, default state, and example implementation

Page Objects must declaratively describe what makes a surface operational.

Structural readiness and default state are different contracts.

Structural readiness means the expected surface and its essential controls are visible and usable.

Default state means important initial properties, such as focus, have the values required by the user experience.

Required methods:

```
expectedControls(): readonly ExpectedControl[];
expectedDefaultControlState(): readonly ExpectedControlState[];

expectReady(): Promise<void>;
expectDefaultState(): Promise<void>;
```

The exact TypeScript representation may be simplified, but the distinction is mandatory.

Expected controls:

Declare the smallest set of controls proving that a surface is operational.

Do not include every decorative element.

Default state:

Declare only meaningful, explicitly required initial properties.

The initial supported generic property is `focused`.

Do not invent initial-state assertions merely to increase assertion count.

Focus examples:

| Surface/action                   | Expected focus                                               |
| -------------------------------- | ------------------------------------------------------------ |
| Fresh New Document workspace     | No arbitrary forced focus                                    |
| Explicitly activate placeholder  | Corresponding answer input                                   |
| Explicitly activate Rename       | Rename input                                                 |
| Create new template for editing  | GTL source editor where appropriate                          |
| Open search intentionally        | Template search input                                        |
| Open Settings panel              | Accessible panel focus; no arbitrary text-input autofocus    |
| Open modal confirmation          | Appropriate dialog focus according to accessibility contract |
| Restore Field editor for editing | Applicable answer input                                      |

Readiness checks must observe the actual state.

They must not call `focus()` simply to make a test pass.

Representative Page Object:

```
// src/page-objects/field-editor.page.ts

import { expect, type Page } from "@playwright/test";

export class FieldEditorPageObject {
  constructor(private readonly page: Page) {}

  private get panel() {
    return this.page.getByTestId(
      "guided-field-editor-main-panel-root",
    );
  }

  private get answerInput() {
    return this.page.getByTestId(
      "guided-field-editor-main-input-answer",
    );
  }

  private get multilineAnswer() {
    return this.page.getByTestId(
      "guided-field-editor-main-textarea-answer",
    );
  }

  async exists(): Promise<boolean> {
    return this.panel.isVisible().catch(() => false);
  }

  expectedControls() {
    return [this.panel];
  }

  expectedDefaultControlState() {
    return [
      {
        name: "Active answer",
        property: "focused",
        expected: true,
      },
    ] as const;
  }

  async expectReady(): Promise<void> {
    await expect(this.panel).toBeVisible();

    await expect(
      this.answerInput.or(this.multilineAnswer),
    ).toBeVisible();
  }

  async expectEditingFocus(): Promise<void> {
    await expect(
      this.answerInput.or(this.multilineAnswer),
    ).toBeFocused();
  }

  async enterAnswer(value: string): Promise<void> {
    await this.expectReady();

    const input = this.answerInput.or(
      this.multilineAnswer,
    );

    await input.fill(value);
  }

  async currentAnswer(): Promise<string> {
    return this.answerInput.or(
      this.multilineAnswer,
    ).inputValue();
  }

  async collapse(): Promise<void> {
    await this.panel.getByRole("button", {
      name: "Collapse Field editor",
    }).click();
  }
}
```

The example assumes the active answer uses one visible single-line or multiline control. The actual Page Object must also accommodate GTL choice fields, which use a selection control rather than a text input.

The full framework may use the reference project's reusable control interfaces and base class. Do not introduce wrappers that only forward one method without improving reuse or diagnostics.

Smoke readiness:

For a new Guided workspace, the smoke test should verify a minimal set of controls such as New Document, template selection, guided content region, and valid navigation.

For an active Field editor, it should verify the correct input and focused editing state.

Failure reporting:

A readiness failure must identify:

| Field            | Example                                 |
| ---------------- | --------------------------------------- |
| Surface          | Field editor                            |
| Operation        | Waiting for active answer               |
| Expected control | Answer input                            |
| Expected state   | Focused                                 |
| Actual state     | Not focused                             |
| Test ID          | `guided-field-editor-main-input-answer` |
| Diagnostics      | Recent relevant browser errors          |

Use condition-based waits with bounded timeouts.

Do not call focus from a smoke test to repair product behavior.

# File: `.specs/suggestions002-02-01-acceptance-scenarios.md`

# Guided Browser Acceptance Framework - Scenario Design and Coverage

Created: 2026-10-26\
Specification: `suggestions002-02-01`\
Revision: 00\
Status: Acceptance and maintenance contract

## H00. Acceptance-test philosophy and scenario granularity

Browser acceptance tests MUST NOT be granular.

The suite must contain a relatively small number of substantial tests representing realistic user journeys.

Do not create a separate browser test for every field, button, menu command, panel state, or settings value.

Instead, organize acceptance coverage around what a user is attempting to accomplish.

For example, creating a project description naturally includes template selection, writing-style selection, field activation, answer entry, live preview, validation, save, reload, and export.

Those activities should be tested together.

Test-granularity rules:

| Practice                                          | Decision                              |
| ------------------------------------------------- | ------------------------------------- |
| One test per button                               | Prohibited as the default approach    |
| One test per placeholder                          | Prohibited                            |
| One test per settings control                     | Prohibited                            |
| One test per panel transition                     | Prohibited                            |
| One test per realistic user journey               | Preferred                             |
| Multiple related actions in one test              | Required where they form one scenario |
| Important intermediate assertions                 | Required                              |
| Named scenario phases                             | Required                              |
| Independent scenarios                             | Required                              |
| State carried across phases of one scenario       | Encouraged                            |
| State shared across unrelated tests               | Prohibited                            |
| Existing scenario expanded for related feature    | Preferred                             |
| New test for genuinely independent workflow       | Allowed                               |
| Separate test for unique destructive/failure case | Allowed when justified                |

Scenario design:

Each acceptance test should contain a coherent beginning, progression, and observable outcome.

A typical scenario:

```
Start from an identified state
    |
    v
Perform a meaningful user action
    |
    v
Verify its observable outcome
    |
    v
Continue with realistic modified state
    |
    v
Exercise another related feature
    |
    v
Verify interactions and persistence
    |
    v
Reach a meaningful final outcome
```

Do not reset the application between every small action within one scenario.

The objective is to discover integration failures that isolated control tests cannot detect.

Preferred scenario size:

A meaningful scenario can contain approximately 10-30 user actions, and more when justified by a single coherent workflow.

There is no mechanical action-count maximum.

The test should remain understandable through a small number of named phases, typically three to seven.

A scenario that combines unrelated product features merely to reduce test count is not acceptable.

The goal is high meaningful coverage per scenario, not the longest possible test.

Initial test-count target:

| Test type                          | Initial target                                      |
| ---------------------------------- | --------------------------------------------------- |
| Grouped smoke tests                | 1-2                                                 |
| Comprehensive acceptance scenarios | 6-8                                                 |
| Total browser tests                | Approximately 7-10                                  |
| Pure unit and domain tests         | Retain existing coverage; no artificial count limit |

This is an architectural target, not a hard cap that prevents necessary regression protection.

Do not automatically create a new browser test when implementing a new setting or UI control.

First determine whether the change naturally belongs in an existing scenario.

Test-count growth policy:

Adding an independent browser test requires a clear reason, such as a distinct critical workflow, a failure mode not representable within existing journeys, or a different environment/state precondition.

Before adding a test, inspect the existing suite and record why its coverage cannot be incorporated into an existing scenario without reducing clarity or isolation.

Three test layers:

| Layer       | Responsibility                                          | Typical depth                        |
| ----------- | ------------------------------------------------------- | ------------------------------------ |
| Unit/domain | Parser, renderer, search ranking, geometry, state rules | Small, fast, numerous where valuable |
| Smoke       | Confirm essential workspaces and controls can operate   | Shallow, grouped                     |
| Acceptance  | Verify complete user journeys across features           | Broad, realistic                     |

Functional and flow concepts from the reference suite remain useful architectural distinctions.

However, Guided does not need separate browser tests in Smoke, Functional, Flow, and Journey directories merely to satisfy every reference category.

For Guided, substantial functional and cross-surface flow coverage should normally be consolidated into acceptance scenarios.

Smoke tests:

Smoke is the fast initial gate.

It should establish that the built application starts, core workspaces are reachable, essential controls are visible, and important default states are correct.

Smoke must not duplicate the long acceptance scenarios.

A failure in smoke should stop or prevent unnecessary execution of the deeper acceptance suite in the standard validation command.

Assertions:

A broad scenario is not permission for weak assertions.

Verify important transitions while the scenario progresses.

For example, when testing a document's persistence, do not merely check that its title appears after reload. Verify representative answers and rendered output.

When testing collapse, do not merely check a CSS class. Verify that the panel is reduced and the document gains usable space.

When testing archive, verify that the document disappears from Active and appears in Archived with its content preserved.

Test steps:

Use Playwright's `test.step()` to describe meaningful phases.

Good:

```
await test.step(
  "Create a project description from a selected template",
  async () => {
    // Several related actions and assertions.
  },
);
```

Good:

```
await test.step(
  "Verify the completed document survives a browser reload",
  async () => {
    // Persistence and restored-result assertions.
  },
);
```

Avoid:

```
await test.step("Click the second dropdown", async () => {});
await test.step("Click the green button", async () => {});
await test.step("Read the third div", async () => {});
```

Step descriptions should report the user task and verification intent, not low-level implementation details.

Cleanup is normally fixture-owned and should not become a reported business step unless cleanup itself is the behavior under test.

## I00. Initial comprehensive acceptance scenarios

The following scenarios define the initial acceptance coverage.

They must be refined against the actual running Guided application and its current specifications before implementation.

Do not remove existing product behavior from the expected outcomes merely because its control has changed in `suggestions001-02`.

### AC01. Create, complete, save, and export a guided document

Purpose: Verify Guided's primary user workflow from template discovery through durable finished text.

| Phase | User activity                                 | Expected outcome                                     |
| ----- | --------------------------------------------- | ---------------------------------------------------- |
| 1     | Open New Document                             | Initial workspace ready; no unnecessary saved record |
| 2     | Search templates using `JSON`                 | Project description appears through indexed examples |
| 3     | Inspect sample output                         | Preview appears without committing document          |
| 4     | Select Project description                    | Template opens                                       |
| 5     | Choose Input + processing + output            | Complete guided structure visible                    |
| 6     | Activate `$input`                             | Correct Field editor opens and receives focus        |
| 7     | Enter `pasted JSON`                           | Guided document and result update                    |
| 8     | Enter remaining values in nonsequential order | Answers applied to correct fields                    |
| 9     | Use an example, then edit its value           | Example action and user editing work                 |
| 10    | Verify completed result                       | Exact independently specified text                   |
| 11    | Rename document                               | Identity preserved; title updates                    |
| 12    | Navigate away and back                        | Answers remain                                       |
| 13    | Reload browser page                           | Saved document and answers restored                  |
| 14    | Copy/export result                            | Correct content without UI artifacts                 |

Representative expected result:

```
Takes pasted JSON, checks it for syntax errors,
and produces a readable formatted version.
```

Use the actual GTL source to determine valid input structure, but maintain this expected result independently in test fixtures.

Do not calculate expected output by importing Guided's production renderer.

Additional assertions:

The result cannot be copied while required fields are missing. Incomplete-field navigation remains allowed. A related alternate writing style starts with independent answers.

The initial untouched preview does not appear as a saved document before meaningful user input.

Coverage:

Template discovery, previews, version selection, placeholder navigation, examples, immediate rendering, validation, temporary documents, renaming, autosave, document history, reload, export.

### AC02. Customize, collapse, restore, and persist workspace panels

Purpose: Verify the new configurable workspace as a coherent interaction system.

| Phase | User activity                      | Expected outcome                                  |
| ----- | ---------------------------------- | ------------------------------------------------- |
| 1     | Open a document and activate field | Field editor floats and focuses input             |
| 2     | Enter text                         | Current answer retained                           |
| 3     | Drag and resize Field editor       | Geometry changes without interrupting editing     |
| 4     | Dock Field editor right            | Central layout adjusts                            |
| 5     | Open Issues independently          | Both panels accessible                            |
| 6     | Dock both on same edge             | Tabbed dock grouping works                        |
| 7     | Collapse Field editor              | Usable center width recovered                     |
| 8     | Restore and float it               | Prior floating geometry restored                  |
| 9     | Open Settings panel                | Current document remains active                   |
| 10    | Change text size                   | Text enlarges without changing stored answer      |
| 11    | Reload Guided                      | User-selected layout and text preference restored |
| 12    | Resize viewport                    | Panels adapt without losing access                |
| 13    | Return to desktop dimensions       | Desired desktop arrangement recovered             |
| 14    | Reset panel and workspace layout   | Defaults restored without modifying content       |

Geometry assertions:

Use `boundingBox()`, visibility, and meaningful spatial relationships where needed.

Do not require exact x/y pixel matches.

Verify that the document receives measurably more usable width after full dock collapse, that panels remain inside recoverable viewport bounds, and that text controls remain accessible.

Editing continuity:

Verify that the active field's value survives movement, docking, collapse, restoration, and text scaling.

The test may also verify caret/selection preservation through direct browser-observable input state.

Coverage:

Panel lifecycle, drag, resize, docking, same-edge groups, true collapse, restoration, geometry persistence, Settings sync, responsive adaptation, layout reset.

### AC03. Organize documents through rename, archive, filters, restore, and delete

Purpose: Verify the complete document lifecycle without data loss.

| Phase | User activity                                  | Expected outcome                                      |
| ----- | ---------------------------------------------- | ----------------------------------------------------- |
| 1     | Create two independent documents               | Separate IDs and answers                              |
| 2     | Rename one document                            | Correct row and title updated                         |
| 3     | Open Active filter                             | Both active documents visible                         |
| 4     | Archive one document                           | No confirmation; Undo offered                         |
| 5     | Undo archive                                   | Same document restored                                |
| 6     | Archive again                                  | Record appears in Archived                            |
| 7     | Open Archived                                  | Correct document and title visible                    |
| 8     | Open and edit archived document                | It remains archived                                   |
| 9     | Restore document                               | Returns to Active without duplication                 |
| 10    | Change Recent limit                            | List count changes; records remain stored             |
| 11    | Start an incomplete document and navigate away | No blocking validation                                |
| 12    | Delete identified document                     | Confirmation required                                 |
| 13    | Cancel once, then confirm                      | Cancellation safe; later deletion affects only target |
| 14    | Reload                                         | Final lifecycle state preserved                       |

Coverage:

Document identity, independent instances, Rename, Archive, Undo, Restore, Active/Archived/Recent filters, incomplete-document navigation, Delete, persistence, and record isolation.

### AC04. Author GTL source, save drafts, inspect history, and restore checkpoints

Purpose: Verify the independent Template Authoring lifecycle.

| Phase | User activity                             | Expected outcome                                    |
| ----- | ----------------------------------------- | --------------------------------------------------- |
| 1     | Open Template Authoring                   | Source editor and navigation available              |
| 2     | Create new template                       | Independent temporary draft                         |
| 3     | Rename local draft                        | Display title changes                               |
| 4     | Edit `TEMPLATE:` and field declarations   | Source updates without unrelated rewriting          |
| 5     | Enter invalid GTL                         | Diagnostics visible; source preserved               |
| 6     | Save now                                  | Invalid source saved; checkpoint created            |
| 7     | Download source                           | Exact current invalid source exported               |
| 8     | Correct source and add another version    | Valid live preview                                  |
| 9     | Save now again                            | Distinct historical checkpoint                      |
| 10    | Enter preview answer                      | Live preview updates; no generated document created |
| 11    | Navigate away and return                  | Current source restored                             |
| 12    | Open earlier checkpoint                   | Historical source read-only                         |
| 13    | Restore earlier source                    | Current source becomes historical content           |
| 14    | Reopen pre-restore recovery entry         | Newer source remains recoverable                    |
| 15    | Rename draft independently                | GTL name unaffected                                 |
| 16    | Delete disposable draft with confirmation | Only intended draft/history removed                 |

Coverage:

Authoring identity, source preservation, invalid GTL behavior, diagnostics, download, Save now, checkpoint deduplication, preview isolation, restoration recovery, naming independence, deletion.

The scenario must avoid hard-coding unsupported GTL syntax. Test fixtures must use valid examples from the accepted GTL language specification.

### AC05. Persistence, storage modes, and multi-tab consistency

Purpose: Verify local-first storage behavior, origin separation, and important concurrency invariants.

| Phase | User activity                             | Expected outcome                                         |
| ----- | ----------------------------------------- | -------------------------------------------------------- |
| 1     | Create a document using IndexedDB         | Content persists                                         |
| 2     | Reload within same browser context        | Document restored                                        |
| 3     | Open second tab of same origin            | Shared persisted records visible                         |
| 4     | Modify record from one tab                | New revision persisted                                   |
| 5     | Attempt conflicting change from stale tab | No silent overwrite                                      |
| 6     | Resolve or preserve conflicting work      | Recoverable outcome                                      |
| 7     | Change storage mode to localStorage       | Existing IndexedDB content not silently migrated/deleted |
| 8     | Create record in alternate mode           | Correct store used                                       |
| 9     | Switch to memory-only                     | Session-only behavior shown                              |
| 10    | Reload                                    | Memory-only authored records do not falsely persist      |
| 11    | Return to previous persistent mode        | Previous stored records remain available                 |

Coverage:

IndexedDB, localStorage, memory-only, reload, cross-tab state, revision protection, recovery, storage-origin separation, settings propagation.

For complex concurrency setup, the same acceptance scenario may open multiple pages within its isolated BrowserContext.

Do not split the scenario into many test cases solely because several storage mechanisms are involved.

### AC06. Keyboard, multiline editing, focus, and responsive interaction

Purpose: Verify ordinary writing and keyboard usability under realistic conditions.

| Phase | User activity                        | Expected outcome                                      |
| ----- | ------------------------------------ | ----------------------------------------------------- |
| 1     | Open project description             | Version and placeholders accessible                   |
| 2     | Navigate fields by keyboard          | Defined boundary-navigation behavior                  |
| 3     | Enter and edit answer                | Native selection and undo remain functional           |
| 4     | Activate filled placeholder          | Existing answer focused                               |
| 5     | Switch between fields                | Correct values and focus                              |
| 6     | Open Thoughtful email                | Multiline template visible                            |
| 7     | Enter multiline value                | Line breaks retained                                  |
| 8     | Use Up/Down within multiline control | Native caret navigation, not unwanted field switching |
| 9     | Use Tab/Shift+Tab                    | Predictable focus navigation                          |
| 10    | Open transient menu                  | Escape and outside dismissal work                     |
| 11    | Resize to mobile viewport            | Primary workspace remains usable                      |
| 12    | Open mobile Field editor             | Input and navigation accessible                       |
| 13    | Enlarge text                         | Content remains readable and operable                 |

Coverage:

Focus policy, native inputs, keyboard navigation, multiline editing, menu dismissal, responsive layout, accessibility, text scaling.

Where IME behavior requires a supported input-method environment, verify the appropriate parts in browser automation and document any remaining manual verification rather than falsely claiming complete IME testing.

### AC07. Error presentation and recoverable failure

Purpose: Verify that failure states preserve work and produce actionable feedback.

This scenario intentionally exercises controlled failures.

| Phase | User activity                                        | Expected outcome                            |
| ----- | ---------------------------------------------------- | ------------------------------------------- |
| 1     | Open editing workspace                               | Current answer input usable                 |
| 2     | Enter unsaved content                                | In-memory result updates                    |
| 3     | Trigger a controlled storage failure                 | Save failure visible                        |
| 4     | Collapse or close Issues                             | Critical error remains discoverable         |
| 5     | Continue editing                                     | Input remains usable                        |
| 6     | Restore Issues                                       | Correct current error shown                 |
| 7     | Recover storage                                      | Retry saves latest coherent content         |
| 8     | Attempt invalid result export                        | Gating explanation shown                    |
| 9     | Correct required fields                              | Result/export becomes available             |
| 10    | Trigger a controlled template-load or export failure | Error reported without unrelated state loss |

Coverage:

Save failure, Issues, recovery, state preservation, validation gating, failure isolation, accurate feedback.

Do not introduce a production-accessible testing backdoor solely to create failure states.

Use controlled browser facilities, isolated test adapters, or a securely excluded development-test seam as described in J00.

### AC08. Optional future long-form workflow

The first release does not require a separate long-running endurance test.

When a genuine integration risk justifies it, add a realistic workflow exercising prolonged editing, repeated document changes, authoring transitions, and browser reloads.

This must not become a collection of artificial repeated clicks.

Before adding AC08, evaluate whether the observed regression can be covered by extending AC01-AC07.

Initial minimum: AC01-AC07 and a compact smoke gate.

The exact final number may change if implementation demonstrates that a scenario is too broad to diagnose reliably or cannot be isolated without changing its user intent.

## J00. Flow implementation, deterministic fixtures, and test tooling

Flow principle:

A Flow combines Page Object operations into a meaningful reusable activity.

Tests should not duplicate multi-surface orchestration.

Representative Flow:

```
// src/flows/create-guided-document.flow.ts

import type { GuidedAutomationApp } from
  "../framework/app/guided-automation-app";

export interface ProjectDescriptionAnswers {
  input: string;
  processing: string;
  result: string;
}

export async function createProjectDescription(
  app: GuidedAutomationApp,
  answers: ProjectDescriptionAnswers,
): Promise<void> {
  const templates = app.templates();
  const document = app.documents();
  const editor = app.fieldEditor();

  await document.newDocument();

  await templates.selectTemplate(
    "Project description",
  );

  await document.selectWritingStyle(
    "Input + processing + output",
  );

  await document.selectField("input");
  await editor.enterAnswer(answers.input);

  await document.selectField("result");
  await editor.enterAnswer(answers.result);

  await document.selectField("processing");
  await editor.enterAnswer(answers.processing);
}
```

The sequence intentionally fills fields out of order, exercising the actual document model.

The Flow does not parse GTL or compute expected output.

Representative acceptance test:

```
// src/specs/acceptance/guided-writing.acceptance.spec.ts

import {
  test,
  expect,
} from "../../framework/fixtures/guided-test";

import { createProjectDescription } from
  "../../flows/create-guided-document.flow";

test(
  "A project description can be completed, saved, and reopened",
  async ({ guided, page }) => {
    await test.step(
      "Create a complete project description",
      async () => {
        await createProjectDescription(guided, {
          input: "pasted JSON",
          processing: "checks it for syntax errors",
          result: "a readable formatted version",
        });

        await expect(
          guided.documents().generatedResult(),
        ).toHaveText(
          "Takes pasted JSON, checks it for syntax errors, " +
          "and produces a readable formatted version.",
        );
      },
    );

    await test.step(
      "Persist the document through ordinary navigation",
      async () => {
        await guided.documents().rename(
          "JSON formatter description",
        );

        await guided.documents().openAnotherDocument();

        await guided.navigation().selectDocument(
          "JSON formatter description",
        );

        await guided.documents().expectSaved();
      },
    );

    await test.step(
      "Reload and recover the completed document",
      async () => {
        await page.reload();

        await guided.navigation().selectDocument(
          "JSON formatter description",
        );

        await expect(
          guided.documents().generatedResult(),
        ).toHaveText(
          "Takes pasted JSON, checks it for syntax errors, " +
          "and produces a readable formatted version.",
        );
      },
    );

    await test.step(
      "Verify the completed output is available for export",
      async () => {
        await guided.documents().expectExportEnabled();
        await guided.documents().expectCorrectPlainTextExport();
      },
    );
  },
);
```

This is an architectural illustration. The implementing agent must reconcile method signatures with actual Guided behavior and implement the referenced Page Object methods.

It is not permission to introduce unused or speculative helpers.

Flow design rules:

| Rule                  | Requirement                                    |
| --------------------- | ---------------------------------------------- |
| Meaningful name       | Describe user activity                         |
| Explicit dependencies | Receive Page Objects or application context    |
| No browser creation   | Fixture owns browser                           |
| No raw selectors      | Page Objects own locators                      |
| No production imports | External acceptance boundary                   |
| No hidden state       | Use explicit arguments and returned outcomes   |
| No arbitrary sleeps   | Wait for observable conditions                 |
| No duplicate journeys | Reuse existing Flow where appropriate          |
| No swallowed errors   | Failure must be diagnosable                    |
| No forced test resets | Preserve realistic dirty state within scenario |

Deterministic test data:

Use independently maintained fixtures with known inputs and expected outputs.

Prefer the bundled Project description, Blank note, and Thoughtful email templates for primary scenarios.

Provide additional small GTL fixtures only when needed to exercise capabilities not demonstrated by bundled templates, such as particular option or repeated-reference behavior.

The test environment must not rely on arbitrary internet services or external accounts.

Fixture and seed policy:

A scenario should use the public UI for the behavior it claims to test.

For example, a document-creation scenario must create a document through Guided's UI, not by inserting a record directly into IndexedDB and then claiming document creation works.

Gray-box fixture preparation is allowed when needed to establish a difficult precondition efficiently, such as a documented legacy-storage record or a controlled conflict.

Such setup must satisfy the following:

| Requirement    | Rule                                              |
| -------------- | ------------------------------------------------- |
| Explicit       | Clearly identify seeded state                     |
| Isolated       | Operate only in test context                      |
| Minimal        | Seed only necessary preconditions                 |
| Non-oracular   | Do not use internals to determine expected result |
| Safe           | No remote or production storage                   |
| Documented     | Explain why UI preparation is insufficient        |
| Observable     | Final acceptance asserted through UI              |
| Contract-bound | Avoid undocumented internal service imports       |

Failure injection:

Controlled failures may include:

| Failure                       | Possible mechanism                                     |
| ----------------------------- | ------------------------------------------------------ |
| Template resource unavailable | Browser request interception                           |
| localStorage unavailable      | Isolated browser-level override where valid            |
| Export unavailable            | Controlled browser capability restriction              |
| Clipboard denied              | Browser permission configuration                       |
| Malformed saved record        | Documented test fixture                                |
| Competing revision            | Two tabs in isolated context                           |
| Worker initialization failure | Controlled test-only environment where supported       |
| IndexedDB write failure       | Safely isolated storage adapter/test seam if necessary |

A test-only product seam must not be accessible in production builds and must not weaken normal runtime security.

Where realistic injection requires an intrusive product modification, favor a lower-level test or a documented limitation rather than building a generic fault-injection framework into Guided.

Recommended test tooling:

| Tooling                              | Decision               |
| ------------------------------------ | ---------------------- |
| Page Object factory                  | Required               |
| Shared Playwright fixture            | Required               |
| Stable test-ID convention            | Required               |
| Declarative readiness                | Required               |
| Browser diagnostics                  | Required               |
| Failure screenshots                  | Required               |
| Failure traces                       | Required               |
| HTML test report                     | Required               |
| Local static server                  | Required               |
| Browser headed/debug commands        | Required               |
| Domain coverage matrix               | Required               |
| Screenshot capture registry          | Optional, useful       |
| Dedicated full visual-diff framework | Not initially required |
| General-purpose scenario DSL         | Not required           |
| Automatic test generator             | Not required           |
| Large mock-backend system            | Not required           |
| Telemetry-only test suite            | Prohibited             |

Page Object screenshot capture:

The reference includes a useful CLI and explicit registry for capturing Page Object screenshots.

Guided may adopt a lightweight equivalent.

A capture registry should list supported surfaces explicitly, with a key, display name, and opening operation.

Do not use reflection or filename inference to discover Page Objects.

Screenshot capture supports manual review and debugging. It must not become another large collection of brittle pixel-perfect acceptance tests.

Visual assertions:

Use geometry and visibility assertions for meaningful layout behavior.

Exact pixel snapshots may be added sparingly for stable, high-value visual states, but should not replace functional assertions.

For panel tests, verify usability, restored geometry relationships, width recovery, and reachability rather than comparing entire pages pixel for pixel.

Timeouts and synchronization:

Prefer Playwright assertions and condition-based waits.

Do not use fixed delays to compensate for uncertain application state.

Use centrally defined timeout categories for normal UI readiness, persistence, navigation, and longer recovery operations.

A fixed delay is acceptable only when explicitly testing time-dependent product behavior, such as debounce or autosave timing, and should use a controlled clock where practical.

Retries:

Do not use broad test retries to hide intermittent failures.

A retry may be configured conservatively for environmental instability, but the original failure must remain visible and diagnosable.

An intermittent failure is a maintenance problem, not a reason to weaken assertions.

# File: `.specs/suggestions002-02-01-engineering-rules.md`

# Guided Browser Acceptance Framework - Architecture Decisions, Agent Rules, and Maintenance

Created: 2026-10-26\
Specification: `suggestions002-02-01`\
Revision: 00\
Status: Repository-wide engineering and maintenance contract

## K00. Architecture decisions adopted from the reference project

The attached `ARCHITECTURE_DECISIONS.md` belongs to eye05, not Guided.

Its accepted decisions ADR-001 through ADR-007 contain patterns relevant to Guided's browser acceptance framework.

Adapt those decisions to Guided and incorporate them into Guided's own architecture-decision register.

The implementing agent must inspect the existing Guided repository before choosing the destination.

If Guided already has `ARCHITECTURE_DECISIONS.md`, append or amend decisions without overwriting unrelated entries or reusing existing decision identifiers.

If no register exists, create one.

The following decision names are stable identifiers for this specification. The repository's actual ADR numbering must remain collision-free.

### GUIDED-E2E-001. Default focus for user-facing text-entry surfaces

Status: Accepted for this specification.

When a newly opened or intentionally activated Guided surface has a clear primary text-entry control, that control receives keyboard focus when the surface is ready, unless the interaction's purpose makes autofocus inappropriate.

Application code must explicitly identify the intended target. It must not focus the first generic input through a heuristic.

| Surface/action                     | Required focus behavior                                         |
| ---------------------------------- | --------------------------------------------------------------- |
| Activate placeholder               | Correct answer control focused                                  |
| Activate Rename                    | Rename input focused                                            |
| Open template search intentionally | Search input focused                                            |
| Begin new template-source editing  | Source editor focused where appropriate                         |
| Open New Document selector         | No arbitrary button/input focus                                 |
| Open Settings                      | Accessible panel focus, without irrelevant text-field autofocus |
| Open confirmation dialog           | Appropriate dialog focus                                        |
| Reopen Field editor for editing    | Correct answer input focused                                    |

Deferred focus must be bounded and cancelled by intervening user interaction.

Focus must not unexpectedly steal control back from a user who has already moved elsewhere.

Validation: Page Objects declare expected default focus where applicable. Fresh-open smoke and acceptance scenarios observe actual focus without calling `focus()` to manufacture the expected state.

### GUIDED-E2E-002. UI regression suite is an external acceptance application

Status: Accepted.

Guided's UI regression suite is a separate Bun, TypeScript, and Playwright application.

It exercises the built website through Chromium and externally observable behavior.

Requirements:

The suite does not import Guided implementation modules, and Guided does not import the suite.

Stable test IDs, accessible labels, keyboard shortcuts, navigation actions, and visible state are the automation contract.

Gray-box setup may establish controlled test preconditions but must not replace public UI interactions as the evidence for user-facing behavior.

Validation: Verify import boundaries, build freshness, and actual browser interaction against the current built application.

### GUIDED-E2E-003. Every user-facing product change requires regression-impact analysis

Status: Accepted.

Before completing any user-facing change, the implementing agent must determine its impact on browser acceptance coverage.

This includes changes to:

| Change category     | Examples                                            |
| ------------------- | --------------------------------------------------- |
| Visible UI          | New controls, renamed labels, rearranged navigation |
| Interaction         | Focus, keyboard commands, drag, resize              |
| State               | Autosave, archive, document selection               |
| Persistence         | IndexedDB, localStorage, migration                  |
| Template behavior   | GTL rendering, validation, versions                 |
| Workflow            | Creating, editing, exporting, restoring             |
| Automation contract | Test ID, accessible name, surface structure         |
| Failure handling    | New errors, recovery, blocked actions               |

The agent must inspect affected Page Objects, components, flows, and scenarios.

Maintenance rule:

Prefer extending an existing comprehensive scenario rather than adding a granular new test.

Add an independent test only when an important workflow cannot reasonably fit an existing scenario.

Failure classification:

| Classification                      | Required response                            |
| ----------------------------------- | -------------------------------------------- |
| Product regression                  | Fix product                                  |
| Intentional product contract change | Update Page Object and affected expectations |
| Test defect                         | Fix test/framework                           |
| Environment/tooling failure         | Diagnose and repair environment              |
| Unverified failure                  | Preserve evidence; do not claim success      |

Do not update a failing assertion merely to make the suite green.

The implementation report must identify the affected acceptance scenarios and record validation results.

### GUIDED-E2E-004. Page Object smoke readiness includes important default state

Status: Accepted.

Page Objects declare structural readiness separately from important fresh-open control state.

`expectedControls()` describes the minimal visible elements needed to establish operational readiness.

`expectedDefaultControlState()` describes explicitly required initial properties, beginning with focus.

Default-state validation runs immediately after the relevant fresh-open action and before unrelated test interactions change the state.

Tests must not repair missing focus or create product state simply to satisfy readiness.

Failures report surface, control, expected property, actual value, and relevant diagnostics.

Uncaught page errors and explicitly classified critical console errors fail readiness.

Ordinary warnings are diagnostic unless they represent a defined critical condition.

### GUIDED-E2E-005. Browser reuse requires verified isolation

Status: Accepted, adapted for a static web application.

Reuse Playwright's Chromium browser per worker.

Use fresh browser contexts for independent acceptance scenarios.

Within one scenario, preserve context state across navigation, reload, and intentionally opened tabs.

The fixture must own page/context lifecycle and ensure tests do not leak persistent storage into unrelated scenarios.

A failed test must not cause the next test to inherit its browser state.

A damaged browser process must be replaced.

Reference difference:

The eye05 suite requires extension-enabled persistent contexts. Guided does not.

Do not copy extension-specific cleanup involving Chrome extension storage, service workers, alarms, or Declarative Net Request.

Diagnostics:

Lifecycle and significant readiness operations should record structured, bounded duration information useful for performance and failure diagnosis.

Do not include document answers, GTL source, clipboard content, or full navigated URLs in routine timing telemetry.

### GUIDED-E2E-006. Transient menus dismiss on outside interaction

Status: Accepted.

Transient nonmodal UI must dismiss predictably when the user interacts outside it.

Applies to:

| Surface                          | Outside dismissal                           |
| -------------------------------- | ------------------------------------------- |
| Template-search suggestion popup | Yes                                         |
| Contextual popover               | Yes                                         |
| Panel command menu               | Yes                                         |
| Dropdown menu                    | Yes, according to its interaction semantics |
| Example-help popup               | Yes, when transient                         |
| Persistent Field editor          | No                                          |
| Persistent Issues panel          | No                                          |
| Persistent Settings panel        | No                                          |
| Modal confirmation               | Governed by modal-dialog contract           |

An outside interaction must not consume, cancel, or replace the user's underlying intended action.

An interaction inside the menu or its trigger must not be misclassified as outside interaction.

Escape and explicit dismissal retain their established focus behavior.

Cross-frame behavior:

The reference contains a rule for iframe-owned interactions dismissing a parent menu.

Guided currently does not require that complexity for ordinary document editing.

If Guided introduces an owned iframe containing interactive application content while a parent transient menu is open, implement a narrow parent/child notification contract.

Validate message source and surface identity before dismissing.

Do not introduce cross-frame messaging speculatively when no relevant iframe exists.

Acceptance: AC06 exercises outside dismissal and verifies that the underlying user action still occurs.

### GUIDED-E2E-007. Telemetry is supporting evidence, not a standalone test contract

Status: Accepted.

Implement diagnostics and timing instrumentation where needed to diagnose browser lifecycle, readiness, failures, and performance.

Telemetry may support acceptance assertions and failure reports.

Do not create standalone tests whose sole purpose is to verify logger calls, message strings, log levels, or timing-log payloads.

Functional outcomes take priority over instrumentation details.

This decision supersedes any imported reference recommendation requiring dedicated timing-log contract tests.

It does not remove the requirement to produce useful diagnostics.

Permitted:

An acceptance scenario fails because a document did not persist, and relevant browser logs are attached to explain the failure.

Prohibited:

A browser test that passes solely because `logger.info("document.saved")` was invoked.

Privacy:

Do not record authored document contents, source text, clipboard values, credentials, or unnecessary navigation details in routine telemetry.

Use bounded, structured metadata such as operation name, duration, status, scenario identity, and browser-worker identity.

## L00. Continuous maintenance and regression-impact workflow

Automated acceptance tests are a maintained product asset, not a one-time implementation artifact.

The testing suite must evolve alongside Guided.

Mandatory workflow for user-facing changes:

| Stage                       | Required work                                                        |
| --------------------------- | -------------------------------------------------------------------- |
| 1. Understand               | Read relevant product specification and existing behavior            |
| 2. Inspect                  | Review affected Page Objects, flows, and scenarios                   |
| 3. Classify                 | Identify UI contract, focus, state, and persistence impact           |
| 4. Implement                | Modify product code and stable test IDs where necessary              |
| 5. Maintain                 | Update existing Page Objects/components                              |
| 6. Extend coverage          | Prefer adding steps/assertions to an existing comprehensive scenario |
| 7. Add new scenario         | Only when a distinct high-value journey requires it                  |
| 8. Validate product         | Typecheck, unit/domain tests, build                                  |
| 9. Validate browser         | Smoke first, then affected acceptance scenarios                      |
| 10. Validate complete suite | Run full browser suite when required                                 |
| 11. Report                  | Record affected coverage, commands, outcomes, limitations            |

Impact-analysis requirement:

Every user-facing implementation task must include a brief acceptance-impact assessment, even if no tests need modification.

Valid outcomes:

| Outcome                                 | Required explanation                                       |
| --------------------------------------- | ---------------------------------------------------------- |
| Existing scenario updated               | Identify scenario and new coverage                         |
| Existing scenario already covers change | Explain which assertions protect behavior                  |
| New scenario added                      | Explain why existing scenarios were insufficient           |
| No browser coverage required            | Explain why pure tests or existing coverage are sufficient |
| Unable to automate                      | Record the limitation and practical alternative            |

A change must not silently bypass acceptance review.

Maintenance examples:

| Product change                   | Preferred test maintenance                                       |
| -------------------------------- | ---------------------------------------------------------------- |
| New Field editor control         | Extend Page Object; add assertion to AC01 or AC02                |
| Different panel collapse styling | Preserve existing behavior checks; update locator only if needed |
| New template search filter       | Extend AC01                                                      |
| Another writing style            | Extend current version-selection flow where meaningful           |
| New archive status               | Extend AC03                                                      |
| New authoring history action     | Extend AC04                                                      |
| Changed storage conflict policy  | Extend AC05                                                      |
| New keyboard behavior            | Extend AC06                                                      |
| Changed error recovery           | Extend AC07                                                      |
| Internal component refactor      | No test change if external contract is preserved                 |
| Renamed test ID                  | Update owning Page Object and review contract compatibility      |

Do not automatically create `newFeature.functional.spec.ts` for every UI change.

Coverage register:

Maintain a concise mapping of important requirements to acceptance scenarios.

This register may live in the suite's README or a dedicated `COVERAGE.md`.

It is a contract-coverage map, not a raw line-coverage percentage.

Initial coverage mapping:

| Guided specification area                     | Principal scenario                           |
| --------------------------------------------- | -------------------------------------------- |
| Original A00-A06: documents/templates/editing | AC01                                         |
| Original A07-A08: working draft/autosave      | AC01, AC05                                   |
| Original A09: copy/export                     | AC01                                         |
| Original A10: Template Authoring              | AC04                                         |
| Original A11: Settings                        | AC02, AC05                                   |
| Original L00-L13: GTL                         | AC01, AC04, supported by existing unit tests |
| Original H00-H12: architecture                | Unit/integration tests, AC05                 |
| Original S00-S13: storage                     | AC03-AC05, AC07                              |
| Original U00-U14: UI/UX                       | AC01, AC02, AC06                             |
| Change request A01-F01: common UX             | AC01, AC02, AC06                             |
| G01-L01: window system                        | AC02, AC06, AC07                             |
| M01-Q01: template experience                  | AC01, AC06                                   |
| R01-S01: document lifecycle                   | AC03                                         |
| T01-V01: authoring lifecycle/data safety      | AC04, AC05, AC07                             |
| W01-X01: Settings/browser suggestions         | AC02, AC06                                   |
| Y01-Z01: architecture/acceptance              | Framework validation, AC01-AC07              |

This matrix must be updated when requirements change.

A matrix entry is not proof of coverage. The cited scenario must contain meaningful assertions corresponding to the requirement.

Avoid false coverage:

A scenario that opens Settings does not automatically cover every Settings option.

A scenario that loads a document does not automatically cover save-conflict recovery.

A scenario that displays a panel does not automatically cover dragging, resizing, or keyboard accessibility.

Coverage claims must correspond to actual operations and assertions.

No test duplication:

Before introducing new browser coverage, inspect existing scenarios for the same user outcome.

If several scenarios contain the same setup sequence, extract a reusable Flow rather than duplicating it.

If one scenario becomes too large to diagnose, split it along genuine workflow boundaries, not individual button boundaries.

Failure injection as suite validation:

Periodically evaluate whether the suite detects realistic defects.

Use deliberate, controlled single-defect injections such as:

| Defect                                   | Expected suite sensitivity           |
| ---------------------------------------- | ------------------------------------ |
| Remove required test ID                  | Readiness or relevant scenario fails |
| Hide primary control                     | Relevant scenario fails              |
| Break field activation                   | AC01/AC06 fail                       |
| Break document persistence               | AC01/AC05 fail                       |
| Disable panel collapse width recovery    | AC02 fails                           |
| Break archive restoration                | AC03 fails                           |
| Discard source during checkpoint restore | AC04 fails                           |
| Break keyboard focus                     | AC01/AC06 fail                       |
| Throw error on exercised path            | Relevant scenario fails              |

For each injection, change one behavior, rebuild the product, run unchanged relevant tests, and classify the result as Caught or Missed.

A Missed result requires verification that the broken code actually reached the tested build.

Do not mutate the tests to manufacture a successful injection result.

Safety of failure injection:

Perform injections only in an isolated working tree, temporary copy, or otherwise verified reversible environment.

Never use destructive Git resets on a repository containing uncommitted user work.

After each injection, restore the exact product source, rebuild, and verify the clean baseline.

The reference's failure-injection documentation reports that some deliberately introduced defects were missed by its tests. Use that as motivation to verify sensitivity rather than assuming every green suite is complete.

Recommended frequency:

Run a focused failure-injection review after the initial framework implementation and after major testing-architecture changes.

It is not required after every minor UI modification.

## M00. Required changes to the current Guided `AGENTS.md`

The implementing agent MUST modify the existing `AGENTS.md` in the Guided project repository.

Do not modify or replace Guided's instructions with the attached `AGENTS(20261026-074722).md`.

That attached file belongs to the separate eye05 extension repository and serves only as a reference for coding-agent operational rules.

Do not copy extension-specific instructions, build commands, directory assumptions, or architecture rules from the reference.

The agent must read Guided's actual `AGENTS.md` in full before editing it.

Preserve existing requirements and integrate the following rules into appropriate sections.

### Required AGENTS.md content

The following is the normative content to incorporate. Headings may be merged with existing sections to avoid duplication.

> Browser acceptance testing
>
> Guided has an independent Playwright regression suite under `ui-regression-test-suite/`.
>
> The suite tests the freshly built browser application through real Chromium interactions. It must remain separate from the product implementation.
>
> Product source must not import regression-suite implementation. Regression-suite source must not import product implementation.
>
> Stable rendered `data-testid`, accessible roles, visible behavior, and documented user interactions form the external automation contract.
>
> Acceptance-test granularity
>
> Maintain a small number of comprehensive end-to-end acceptance scenarios. Do not create granular browser tests for every button, field, setting, or individual operation.
>
> Each acceptance test must represent a meaningful user journey and exercise multiple related interactions, state transitions, and observable outcomes.
>
> Prefer extending an existing acceptance scenario over adding a new test.
>
> Add a new browser test only when the workflow or failure mode is sufficiently independent to justify separate execution.
>
> Keep detailed algorithmic, parser, geometry, and state-transition tests in the existing unit/domain test infrastructure rather than reproducing every case through the browser.
>
> Regression-impact analysis
>
> Every user-facing product change requires review of affected Page Objects, components, flows, and acceptance scenarios.
>
> Before implementation completion, identify which scenarios cover the change and whether existing assertions must be updated.
>
> Classify browser failures as product regressions, intentional contract changes, test defects, or environment/tooling problems before changing expectations.
>
> Fix product regressions in product code. Do not weaken acceptance assertions merely to obtain a passing suite.
>
> Page Objects and Flows
>
> Browser acceptance tests use Page Objects for user-facing surfaces, reusable Page Components for complex controls, and Flows for meaningful multi-surface journeys.
>
> Product-specific locators belong inside Page Objects and Page Components, not acceptance-test bodies.
>
> Page Object methods describe user intent.
>
> Use explicit dependencies, bounded condition-based waits, and diagnostic errors.
>
> Do not introduce hidden global browser state, raw procedural Playwright scripts, or unnecessary framework layers.
>
> Readiness and default focus
>
> Page Objects declaratively identify minimal expected controls and important initial control state.
>
> Fresh-open tests must observe required focus without artificially setting it.
>
> Product application code owns focus behavior.
>
> When a user intentionally activates a primary text-entry surface, the corresponding input should receive focus unless the workflow explicitly requires otherwise.
>
> Browser lifecycle
>
> Use the shared Guided Playwright fixture.
>
> Reuse Chromium per worker while keeping independent acceptance scenarios isolated in fresh browser contexts.
>
> Preserve state across reloads and tabs within one scenario when testing persistence or concurrency.
>
> Do not rely on test ordering or leftover state from previous scenarios.
>
> Product-side test IDs
>
> Add stable `data-testid` attributes to major UI roots, interactive controls, and verifiable states.
>
> Use lowercase, hyphen-separated identifiers derived from stable product concepts.
>
> Do not use generated CSS classes, dynamic database IDs, user-entered values, or runtime coordinates in test IDs.
>
> Changing an established test ID requires regression-impact review.
>
> Test IDs do not replace accessibility labels or native semantics.
>
> Transient interaction behavior
>
> Transient menus and popovers dismiss on outside interaction without consuming the user's underlying action.
>
> Persistent panels are not implicitly dismissed by outside clicks.
>
> Preserve appropriate keyboard and focus behavior.
>
> Telemetry and diagnostics
>
> Capture useful browser errors, significant operation timings, and failure evidence without exposing private document content.
>
> Telemetry supports testing and debugging but is not itself the product outcome.
>
> Do not create standalone tests whose only assertions concern logger calls, log messages, levels, or payloads.
>
> Validation
>
> For user-facing changes, run the applicable product typecheck, product tests, and build before Playwright validation.
>
> Run browser smoke validation before comprehensive acceptance scenarios.
>
> Run affected scenarios and the complete regression suite as required by the change scope.
>
> Report the exact commands, outcomes, affected scenarios, and environment limitations.
>
> Do not claim browser acceptance coverage passed when it was not executed.

Integration with existing AGENTS.md:

The new content must be placed where coding agents will encounter it during normal work.

Do not hide this testing policy in a long historical appendix that agents may never read.

The main `AGENTS.md` should also point to:

```
.specs/suggestions002-02-01-main-specification.md
.specs/suggestions002-02-01-framework.md
.specs/suggestions002-02-01-acceptance-scenarios.md
.specs/suggestions002-02-01-engineering-rules.md
```

The agent must preserve existing instructions concerning build, storage, coding style, documentation, and source organization.

Where the new acceptance-testing requirements conflict with older guidance that avoided real-browser tests by default, this specification explicitly authorizes and requires Playwright browser tests for the new regression subproject.

## N00. Validation sequence and reporting

The implementation agent must validate both the product and the regression suite.

Required order:

| Order | Validation                                                   | Expected outcome                              |
| ----- | ------------------------------------------------------------ | --------------------------------------------- |
| 1     | Read current project instructions and architecture decisions | Applicable rules understood                   |
| 2     | Inspect reference suite and Guided source                    | Architecture and integration points confirmed |
| 3     | Install suite dependencies                                   | Reproducible package/lockfile                 |
| 4     | Suite TypeScript typecheck                                   | No type errors                                |
| 5     | Product typecheck                                            | Existing code remains valid                   |
| 6     | Product unit/domain tests                                    | Existing contracts preserved                  |
| 7     | Product build                                                | Fresh static deployment artifact              |
| 8     | Browser smoke                                                | Core workspaces usable                        |
| 9     | Relevant acceptance journeys                                 | New/changed behavior verified                 |
| 10    | Full acceptance suite                                        | All supported journeys pass                   |
| 11    | Browser diagnostics review                                   | No unexplained critical errors                |
| 12    | Architecture compliance review                               | Boundaries and decisions satisfied            |

The exact product commands must be read from Guided's actual `package.json`. Do not assume the extension reference's commands apply.

Typical regression-suite commands:

```
cd ui-regression-test-suite

bun run typecheck
bun run test:smoke
bun run test:acceptance
bun run test:all
```

Failure diagnostics:

Collect relevant:

| Artifact                        | Requirement                      |
| ------------------------------- | -------------------------------- |
| Playwright trace                | Retain for failures              |
| Failure screenshot              | Retain for failures              |
| HTML report                     | Available after test run         |
| Browser console errors          | Relevant bounded collection      |
| Uncaught page errors            | Collected                        |
| Current scenario and step       | Identifiable                     |
| Page Object operation           | Included in useful failures      |
| Expected control/state          | Included where applicable        |
| Timeout context                 | Explicit                         |
| Browser worker/context identity | Available for lifecycle failures |

Video-on-failure is recommended when its cost is acceptable.

Do not automatically retain large videos for every successful run.

Console error classification:

| Event                                 | Default treatment                         |
| ------------------------------------- | ----------------------------------------- |
| Uncaught page exception               | Fail affected scenario                    |
| Fatal application initialization      | Fail                                      |
| Failed critical resource              | Fail relevant scenario                    |
| Failed required worker initialization | Fail                                      |
| Expected validation warning           | Do not fail solely because logged         |
| Ordinary development warning          | Record where relevant                     |
| Explicitly tolerated browser warning  | Diagnostic only                           |
| Telemetry message                     | Supporting evidence, not assertion target |

No arbitrary sleeps:

Playwright's built-in waiting and assertions should be the primary synchronization mechanism.

Retries must not hide persistent defects.

Validation reporting:

Every implementation task affecting the suite must report:

| Field                    | Required information         |
| ------------------------ | ---------------------------- |
| Product files changed    | Names and purpose            |
| Regression files changed | Names and purpose            |
| Test IDs added/modified  | Stable identifiers           |
| Page Objects modified    | Relevant surfaces            |
| Flows modified           | Affected journeys            |
| Scenarios modified       | Existing or new IDs          |
| Test-count change        | Explain additions/removals   |
| Product validation       | Commands and outcomes        |
| Smoke validation         | Commands and outcomes        |
| Acceptance validation    | Commands and outcomes        |
| Known limitations        | Specific unverified behavior |
| Environment failures     | Exact blocker                |
| Remaining risks          | Factual assessment           |

Avoid generic claims such as "all tests passed" without stating which commands ran.

## O00. Consolidated architecture and acceptance decisions

This section is intentionally redundant. It provides a single reviewable summary of the adopted engineering approach.

Framework decisions:

| Design question                                                | Decision            |
| -------------------------------------------------------------- | ------------------- |
| Is Playwright part of Guided production runtime?               | No                  |
| Is the regression suite a separate subproject?                 | Yes                 |
| Does the suite use Bun?                                        | Yes                 |
| Does the suite use TypeScript?                                 | Yes                 |
| Does it use real Chromium?                                     | Yes                 |
| Does it test the built application?                            | Yes                 |
| Can tests import Guided source?                                | No                  |
| Can Guided import regression-suite source?                     | No                  |
| Are Page Objects required?                                     | Yes                 |
| Are reusable components required where justified?              | Yes                 |
| Are Flows required for meaningful multi-surface orchestration? | Yes                 |
| Can test bodies contain raw product selectors?                 | No                  |
| Is `data-testid` the stable automation attribute?              | Yes                 |
| Can test IDs contain runtime record IDs?                       | No                  |
| Does `data-testid` replace accessibility?                      | No                  |
| Is readiness declarative?                                      | Yes                 |
| Is important default focus validated?                          | Yes                 |
| May readiness tests focus the input themselves?                | No                  |
| Is Chromium reused?                                            | Yes, per worker     |
| Are independent tests isolated?                                | Yes, fresh contexts |
| Is browser state preserved within a scenario?                  | Yes                 |
| Are extension-specific browser launchers copied?               | No                  |
| Are failure traces and screenshots required?                   | Yes                 |

Acceptance design decisions:

| Design question                                                   | Decision                     |
| ----------------------------------------------------------------- | ---------------------------- |
| Should there be one test per button?                              | No                           |
| Should there be one test per setting?                             | No                           |
| Should there be one test per placeholder?                         | No                           |
| Should meaningful workflows combine related actions?              | Yes                          |
| Should scenarios verify intermediate states?                      | Yes                          |
| Should scenarios include realistic dirty state?                   | Yes                          |
| Should tests depend on execution order?                           | No                           |
| Should acceptance tests use test steps?                           | Yes                          |
| Should test steps describe UI mechanics?                          | No, user outcomes            |
| Should ordinary smoke tests be long?                              | No                           |
| Should core acceptance scenarios be substantial?                  | Yes                          |
| Should product algorithms be retested exhaustively in Playwright? | No, retain lower-level tests |
| Should a user-facing change trigger regression-impact analysis?   | Always                       |
| Should existing scenarios be extended first?                      | Yes                          |
| Does every new UI feature require a new browser test?             | No                           |
| Can a distinct critical workflow justify a new test?              | Yes                          |
| Are exact pixel screenshots the default testing method?           | No                           |
| Are geometry and accessibility assertions appropriate?            | Yes                          |
| Should failure injection occasionally verify suite sensitivity?   | Yes                          |

Application-specific coverage decisions:

| Guided capability            | Primary acceptance scenario |
| ---------------------------- | --------------------------- |
| Template search and preview  | AC01                        |
| Writing-style selection      | AC01                        |
| Placeholder editing          | AC01, AC06                  |
| Generated result             | AC01                        |
| Copy/export                  | AC01                        |
| Floating panels              | AC02                        |
| Docking and collapse         | AC02                        |
| Workspace preferences        | AC02                        |
| Settings synchronization     | AC02, AC05                  |
| Document navigation          | AC01, AC03                  |
| Archive and restore          | AC03                        |
| Rename and delete            | AC03                        |
| Template Authoring           | AC04                        |
| GTL source and diagnostics   | AC04                        |
| Authoring checkpoint history | AC04                        |
| Storage modes                | AC05                        |
| Multi-tab conflicts          | AC05                        |
| Focus and keyboard behavior  | AC06                        |
| Multiline input              | AC06                        |
| Responsive workspace         | AC02, AC06                  |
| Transient menu dismissal     | AC06                        |
| Persistence failures         | AC07                        |
| Issue recovery               | AC07                        |

Cross-cutting invariants:

| Contract          | Invariant                                                 |
| ----------------- | --------------------------------------------------------- |
| External coupling | Tests depend on user-facing contracts, not source modules |
| Isolation         | Independent tests begin clean                             |
| Browser reuse     | Reuse does not compromise isolation                       |
| Test count        | Add tests only for meaningful distinct scenarios          |
| Maintainability   | Selectors owned by Page Objects                           |
| Readability       | Test code describes user activities                       |
| Fidelity          | Assertions verify observable product outcomes             |
| Persistence       | Reload tests use real browser storage                     |
| Focus             | Tests observe, never repair                               |
| Failure handling  | Product errors remain visible and actionable              |
| Diagnostics       | Logs support investigation, not standalone test success   |
| Privacy           | No private authored content in routine telemetry          |
| Coverage          | Scenario-to-requirement mapping remains maintained        |
| Evolution         | UI changes trigger regression-impact analysis             |

### Definition of complete

The browser acceptance-testing subproject is complete for its initial release when the following conditions are satisfied.

| Area                   | Required result                                          |
| ---------------------- | -------------------------------------------------------- |
| Installation           | Reproducible Bun/Playwright setup                        |
| Browser                | Chromium launches and loads fresh Guided build           |
| Independence           | No product-source imports in suite                       |
| Fixture                | Shared browser lifecycle with per-test isolation         |
| Testability            | Stable test IDs for automated surfaces                   |
| Page Objects           | Important Guided surfaces modeled                        |
| Flows                  | Meaningful cross-surface journeys encapsulated           |
| Smoke                  | Core workspace readiness covered                         |
| Acceptance             | AC01-AC07 implemented or equivalently consolidated       |
| Granularity            | No unnecessary one-control browser tests                 |
| Persistence            | Real reload and storage behavior exercised               |
| Workspace              | Panel interactions and recovery covered                  |
| Authoring              | GTL editing and checkpoint recovery covered              |
| Accessibility          | Focus, keyboard, and responsive scenarios covered        |
| Diagnostics            | Actionable failure evidence available                    |
| Documentation          | Suite setup, architecture, and maintenance documented    |
| Agent rules            | Existing Guided `AGENTS.md` updated                      |
| Architecture decisions | Adapted decisions recorded in Guided's own register      |
| Maintenance policy     | Future UI changes require regression-impact analysis     |
| Validation             | Product and browser suites pass in supported environment |

Final acceptance outcome:

A developer or coding agent working on Guided must be able to change a user-facing feature, identify the relevant acceptance scenario, update its Page Object or Flow if necessary, rebuild the application, run Playwright, and receive clear evidence that the related user journey still works.

The testing framework must remain significantly smaller and easier to maintain than an exhaustive collection of individual browser test cases.

The intended result is a durable, scenario-oriented regression system that protects Guided's real user experience without becoming a second large application that requires constant maintenance.