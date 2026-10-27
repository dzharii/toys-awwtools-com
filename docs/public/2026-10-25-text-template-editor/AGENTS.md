# AGENTS.md

## Special directives

These directives take precedence over conflicting project specifications and reference material. They remain in effect until explicitly changed.

### DIRECTIVE: Development mode - no migrations

**Added: 2026-10-26**

This application is under active development. Breaking changes to code, schemas, stored data formats, and internal APIs are acceptable; preserving compatibility with previous development versions is not required.

- Do not implement data migrations, legacy-format converters, or backward-compatibility layers for previous project data.
- Do not add migration validation, migration-specific tests, or tests proving that old data was migrated.
- Skip migration requirements even when a specification explicitly requests them. Record those requirements as not applicable under this directive rather than implementing or testing them.
- Keep existing specifications immutable; this directive overrides their migration requirements without rewriting them.
- Continue validating current behavior, data integrity, and error handling. Skipping migrations does not waive ordinary correctness or testing requirements.

---

### DIRECTIVE: Prefer modern native web technologies

**Added: 2026-10-26**

Prefer modern HTML, CSS, Web Components, and browser APIs when they can satisfy a requirement with less custom code. Research current native capabilities and browser support when the best approach is uncertain, especially before recreating UI behavior in JavaScript or adding a library or polyfill.

- Use Web Components and their modern platform capabilities as the preferred component approach.
- Prefer native HTML/CSS behavior over a custom JavaScript equivalent when it meets the functional and accessibility requirements.
- Target current Chromium-based browsers, especially Chrome, first. Support current Firefox where practical.
- Safari is a low-priority browser. Spend effort only on compatibility fixes essential to critical functionality. Otherwise, avoid Safari-specific work and do not compromise modern features for Safari support.
- Preserve accessibility, correctness, and maintainability. Use feature detection and targeted fallbacks where warranted, not broad legacy-browser compatibility machinery.

---

## Project

Build a static browser application for creating guided text documents from reusable templates. Users fill placeholders with contextual hints, preview generated text, and copy or export results. The application also supports document history and template authoring.

Technology: TypeScript, JavaScript, HTML, CSS, and Bun. The application runs as a static website without a backend.

Bun is expected to be installed globally. Runtime libraries are vendored; npm dependencies are permitted for development and testing only.

Detailed requirements are defined in `.specs/`.

## Browser acceptance testing

The independent Bun/TypeScript/Playwright application in `ui-regression-test-suite/`
tests freshly built Guided through real Chromium interactions. It owns its
dependencies, configuration, fixtures, expected results, Page Objects, and Flows.
Neither application may import, reference, link, or execute the other's source
modules. Do not share production parsers, renderers, validators, types, constants,
fixtures, or automatically synchronized copies as acceptance-test oracles.
Inspecting build metadata and interacting with the compiled deployment are allowed.

The authoritative testing specification is
`.specs/suggestions002-01-ui-automation-framework.md`. Its embedded sections are
named `suggestions002-02-01-main-specification.md`, `...-framework.md`,
`...-acceptance-scenarios.md`, and `...-engineering-rules.md`; those are logical
sections of the combined file, not additional physical specifications.
Read the suite's `README.md`, `COVERAGE.md`, and `VALIDATION.md`, and the root
`ARCHITECTURE_DECISIONS.md` when maintaining acceptance coverage.

### Scenario granularity and regression impact

- Maintain a small number of substantial user journeys, not a browser test for
  every button, field, setting, or operation. Verify meaningful intermediate
  outcomes and interactions through named `test.step()` phases.
- Every user-facing change requires review of affected Page Objects, components,
  Flows, and scenarios. Record which assertions protect the change, what was
  updated, or why browser coverage is unnecessary or currently impossible.
- Extend an existing comprehensive scenario first. Add a separate browser test
  only for an independently important workflow or failure precondition; record
  why existing scenarios are insufficient.
- Keep detailed parser, algorithm, geometry, and state-transition cases in
  product unit/domain tests. Do not replace them with granular Playwright tests.
- Classify failures as product regressions, intentional contract changes, test
  defects, or environment/tooling problems before editing expectations. Fix
  regressions in the product; never weaken assertions merely to obtain green tests.
- Map actual assertions in `COVERAGE.md`. A surface visit is not evidence that all
  its features are covered. Keep absent product features and unverified behavior
  explicit; migration requirements remain inapplicable under the directive above.

### Automation contracts and interaction

- Stable rendered `data-testid`, native semantics, accessible names, keyboard
  commands, and observable behavior form the external automation contract.
- Add test IDs to meaningful interactive controls, major roots, and verifiable
  states. Use lowercase hyphenated product concepts; never include runtime IDs,
  authored values, generated CSS classes, coordinates, or implementation paths.
  Repeated IDs may use separate document/field identity attributes.
- Test IDs do not replace semantic HTML, labels, roles, or ARIA. Changing an
  adopted ID requires acceptance-impact review.
- Locators belong in Page Objects or reusable Page Components, not test bodies or
  Flows. Methods express user intent. Flows orchestrate meaningful multi-surface
  work with explicit dependencies; avoid hidden state and unnecessary layers.
- Declare minimal expected controls separately from important fresh-open state.
  Observe intended focus immediately after the action; tests must not call
  `focus()` to repair it. Product code owns focus for intentionally activated
  answer/source/rename controls and accessible dialogs/panels.
- Transient menus/popovers dismiss on outside interaction without swallowing the
  intended underlying action. Preserve Escape and focus behavior. Persistent
  panels must not disappear merely because the user clicks elsewhere.

### Browser lifecycle, evidence, and validation

- Use the common Guided fixture. Reuse Chromium per worker, with a fresh isolated
  context per independent scenario. Keep the same context across persistence
  reloads and intentionally shared tabs. Do not depend on test order or leftover
  data. Let Playwright recover unhealthy workers; do not copy extension resets.
- Use bounded condition-based waits, not arbitrary sleeps or retries hiding
  failures. Record significant readiness/lifecycle durations and bounded browser
  errors. Unexpected uncaught errors and classified critical failures fail tests.
- Keep routine telemetry free of answers, GTL source, clipboard content, titles,
  credentials, and full URLs. Traces/screenshots/videos can contain scenario data:
  keep artifacts local/ignored and use only synthetic test content.
- Diagnostics support functional outcomes. Do not add tests whose sole assertions
  concern logger calls, messages, levels, or timing payloads.
- Run product typecheck, applicable unit tests, and a fresh build before browser
  validation. Run smoke first, then affected acceptance journeys, and the full
  suite when scope requires it. `bun run test:browser` delegates to the suite;
  install its own dependencies and matching Chromium first.
- Report exact commands, results, affected scenarios, and limitations. Do not
  claim browser validation that was not executed.
- Periodically verify test sensitivity with isolated single-defect injections.
  Never mutate the user's live source or use destructive Git resets. Rebuild
  each injected copy, run unchanged tests, classify Caught/Missed/Unverified, and
  restore, rebuild, and revalidate the clean copy after every case.

## References

Those references are mandatory for the agent to review before starting implementation, and during the implementation the agent should consult those samples and basically take some parts, copy some parts from those during the implementation. Those are kind of mandatory for review, for reading, for understanding what's inside. They can be very resourceful and helpful for our project overall, but need to keep in mind that those are just samples, not the complete implementation, and will require some safety� it's not safety, but some adjustments to make it more resilient, more error-prone, and so on and so forth. We should keep that in mind always.

- `D:\projects2024\2026-10-25-text-template-editor\development-reference\gtl-reference-kit` � Extracted contents of `gtl-ui-architecture-reference-kit.zip`. Contains source code, libraries, UI examples, diagrams, and architectural references.
- `D:\projects2024\2026-10-25-text-template-editor\.specs\full-chat-export-for-this-project.html` � Complete project conversation. Treat as raw requirements-gathering material; the specifications take precedence.
- `D:\my-github\unsafe-link-preview-browser-extension ` this project has good references on handling background worked communication
- `D:\my-github\toys-awwtools-com\docs\public\2026-10-25-sovietRDTL-chat-ui-with-eliza-like-engine` this project can sever as primary dark theme user interface guideline
- `D:\my-github\toys-awwtools-com\docs\public\2026-10-09-chatgpt-prompt-menu-for-break-down-prompts` - use this project to lookup examples for UI for template editing. very good inspiration. you can copy some styles for the elements. also there is "Live prompt" preview. we can use this floating window technique in our implementaiton. 
- `D:\my-github\toys-awwtools-com\docs\public\2026-09-13-300K-stars-skill-language-editor` use this project and vendor our version of microlight as the best example for the template editor with syntax highligh.
- `D:\my-github\toys-awwtools-com\docs\public\2026-09-25-emoji-nudge-workplace-reminder-builder` good example how you can use modern dropdown list
## Specifications

All specifications are located in `.specs/`. Read and follow all applicable specifications before implementation.

Initial specifications:

- `suggestions001-01-initial-specification.md`
- `principle001-01-code-organization.md`

Additional specifications and change requests may be added.

### Immutability

Every document in `.specs/` is immutable and append-only.

- Never modify, overwrite, or delete an existing specification, including one already implemented.
- Changes are introduced through a new specification or change-request file with the next monotonically increasing identifier.
- Never reuse an existing identifier.
- Later change requests extend or supersede earlier requirements where explicitly applicable, without modifying the originals.

### Specification types

| Prefix         | Purpose                                         | TODO file    |
| -------------- | ----------------------------------------------- | ------------ |
| `suggestions*` | Specifications and change requests to implement | Required     |
| `principle*`   | Implementation guidance and coding preferences  | Not required |

Read `principle*` documents before implementation and apply them during code review and final validation. They are standing guidance, not separate implementation tasks.

### Implementation TODOs

Before implementing a `suggestions*` specification, create a detailed, explicit TODO document using the same filename with the `.todo.md` suffix.

Example:

```
suggestions001-01-initial-specification.md
suggestions001-01-initial-specification.todo.md
```

The TODO must break down the specification into implementable tasks, including relevant validation and testing. Avoid vague tasks that require rediscovering the requirements.

TODO documents in `.specs/` follow the same immutability rule. Use them as implementation plans; track execution progress without rewriting them.

## Development workflow

Implement incrementally, from simple to complex. Prefer small, meaningful, independently testable changes.

Use this iterative approach:

```
DISCOVER available tools and inspect the project.

PREPARE detailed specification TODOs.

IMPLEMENT the smallest runnable application.
BUILD and OPEN it in a real browser.
VERIFY appearance, behavior, and errors.

REPEAT UNTIL all specification tasks are complete:
    SELECT the next meaningful implementation chunk.
    IMPLEMENT the selected functionality.
    BUILD, type-check, and run relevant tests.
    OPEN and inspect the application in a browser.
    VERIFY the behavior against specifications.
    REVIEW the code against implementation principles.
    USE model-assisted code review when available.
    FIX identified issues before continuing.

PERFORM final integration testing and code review.
VALIDATE completion against all applicable specifications.
```

Use your judgment to determine appropriate iteration size. Test actual browser behavior frequently, not only at the end of development.

## Development tools

Discover which tools are already installed on the development machine before installing alternatives.

Prefer available local tools, including:

- Bun � Building, development, and testing.
- Playwright � Browser interaction, inspection, and automated testing.
- ImageMagick � Image processing when needed.
- FFmpeg � Media processing when needed.

Use additional tools when necessary, but avoid unnecessary installations and dependencies.

## Code quality and repository hygiene

- Follow the implementation guidance in `principle*` specifications.
- Keep code readable, maintainable, and appropriately documented.
- Use clear formatting and consistent project conventions.
- Maintain working build, type-check, and test commands.
- Maintain an appropriate `.gitignore`.
- Keep generated files, caches, temporary artifacts, and unnecessary dependencies out of Git.
- Review changes before committing to ensure only intended project files are included.
- Perform a final code review and validate the completed implementation against the specifications.
