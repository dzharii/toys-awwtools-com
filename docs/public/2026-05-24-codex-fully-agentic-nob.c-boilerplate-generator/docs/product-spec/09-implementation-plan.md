---

A00 09 Implementation Plan

---

Document path: `docs/product-spec/09-implementation-plan.md`

This file defines the implementation plan for V1 of the static `nob.h` / `nob.c` boilerplate generator. It gives the coding agent a strict milestone order, file creation plan, task dependencies, validation requirements after each milestone, documentation update rules, risks, and done criteria.

This document is a specification section. It is not a request to implement immediately.

---

B00 Implementation Thesis

---

Implementation must proceed from stable product behavior to UI polish. The coding agent must prove the generator, validation pipeline, safe rendering, copy/download actions, and fixture checks before spending time on decoration.

The implementation must remain plain HTML, CSS, and JavaScript. No build system, package installation, framework runtime, backend, telemetry, URL state, browser compilation, repository scanning, dependency discovery, package management, run/test/clean target generation, static library generation, or remote API may be introduced.

The implementation must not expand V1 scope without updating the relevant specification and decision log first.

---

C00 Required Runtime Files

---

Create these runtime files at the project root unless a project-local convention already exists:

```txt id="q2coit"
index.html
styles.css
script.js
```

Create these documentation/testing files as local artifacts:

```txt id="7ep0ol"
docs/product-spec/01-product-requirements.md
docs/product-spec/02-user-experience.md
docs/product-spec/03-functional-requirements.md
docs/product-spec/04-technical-architecture.md
docs/product-spec/05-data-model.md
docs/product-spec/06-interface-contracts.md
docs/product-spec/07-edge-cases-and-errors.md
docs/product-spec/08-testing-strategy.md
docs/product-spec/09-implementation-plan.md
docs/product-spec/test-report-v1.md
docs/product-spec/decision-log.md
```

Optional local-only test harness files may be added only if they require no npm, no build step, and no network:

```txt id="pdrmpd"
tests.html
tests.js
```

Do not create `package.json`, lockfiles, framework configs, bundler configs, server code, or generated build artifacts for V1.

---

D00 Required Pre-Implementation Checks

---

Before writing runtime code, the coding agent must verify that all specification files `01` through `09` exist locally.

If any required spec file is missing, create or restore it before implementation continues.

Before writing runtime code, create or update:

```txt id="0wtb7a"
docs/product-spec/decision-log.md
```

The decision log must contain at least:

| Decision            | Required value                                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Product shape       | Conservative copy-first static `nob.c` generator.                                                                         |
| V1 artifact         | Single executable-oriented `nob.c`.                                                                                       |
| Runtime stack       | Plain HTML/CSS/JS only.                                                                                                   |
| Persistence         | None in V1.                                                                                                               |
| Generated API style | Prefixed `nob.h` APIs.                                                                                                    |
| Backend/network     | None.                                                                                                                     |
| Deferred features   | run/test/clean, static libraries, package/dependency discovery, URL state, telemetry, browser compilation, repo scanning. |

The coding agent must not implement before the documentation gate is complete.

---

E00 Milestone 0: Project Skeleton And Documentation Gate

---

Purpose: Establish files, confirm scope, and prevent premature feature expansion.

Tasks:

| Order | Task                                                                                             |
| ----: | ------------------------------------------------------------------------------------------------ |
|     1 | Confirm project root is `nob-boilerplate-generator` or the current intended project folder.      |
|     2 | Create `docs/product-spec/` if missing.                                                          |
|     3 | Save all specification files into `docs/product-spec/`.                                          |
|     4 | Create `docs/product-spec/decision-log.md` if missing.                                           |
|     5 | Create empty or initial `docs/product-spec/test-report-v1.md`.                                   |
|     6 | Create placeholder `index.html`, `styles.css`, and `script.js`.                                  |
|     7 | Confirm no `package.json`, lockfile, framework config, server file, or build config is required. |

Validation after milestone:

| Check               | Pass condition                                 |
| ------------------- | ---------------------------------------------- |
| Spec files          | `01` through `09` exist.                       |
| Runtime files       | `index.html`, `styles.css`, `script.js` exist. |
| No build dependency | No required npm/build tooling exists.          |
| Decision log        | Contains required V1 scope decisions.          |

Stop condition: If any required spec is missing or contradictory, stop and update documentation before implementing behavior.

---

F00 Milestone 1: Semantic HTML Structure

---

Purpose: Build the static page structure without implementing generation logic.

Dependencies: Milestone 0 complete.

Files modified:

```txt id="uvjw03"
index.html
```

Tasks:

| Order | Task                                                                                                                  |
| ----: | --------------------------------------------------------------------------------------------------------------------- |
|     1 | Add document metadata, title, and stylesheet/script references.                                                       |
|     2 | Add compact header with product name and one-line purpose.                                                            |
|     3 | Add no-script fallback stating JavaScript is required.                                                                |
|     4 | Add main tool container.                                                                                              |
|     5 | Add Project controls: project name, target executable name.                                                           |
|     6 | Add Sources and output controls: source files textarea, output directory input.                                       |
|     7 | Add Compiler controls: platform profile, compiler profile, compiler command, build profile, warning profile.          |
|     8 | Add Advanced controls: include paths textarea, library flags textarea, self-rebuild checkbox, comment style selector. |
|     9 | Add validation summary container.                                                                                     |
|    10 | Add assumptions container.                                                                                            |
|    11 | Add bootstrap command container.                                                                                      |
|    12 | Add explanations container.                                                                                           |
|    13 | Add preview area with `pre` and `code` element.                                                                       |
|    14 | Add preview status element.                                                                                           |
|    15 | Add `Copy nob.c` and `Download nob.c` buttons.                                                                        |
|    16 | Ensure every input has visible and programmatically associated label.                                                 |
|    17 | Assign stable ids to every control and output container.                                                              |

Validation after milestone:

| Check                 | Pass condition                                                                                                 |
| --------------------- | -------------------------------------------------------------------------------------------------------------- |
| Labels                | Every input has a label.                                                                                       |
| Buttons               | Copy/download are real button elements.                                                                        |
| No inline handlers    | No `onclick`, `oninput`, or `onchange` attributes.                                                             |
| No remote refs        | No remote scripts, styles, fonts, or images.                                                                   |
| No forbidden controls | No run/test/clean, static library, package, URL share, login, telemetry, compile/run, or repo import controls. |

Stop condition: If required controls or containers are missing, do not proceed to JavaScript.

---

G00 Milestone 2: Base CSS And Responsive Layout

---

Purpose: Make the page usable on desktop and narrow screens before adding complex behavior.

Dependencies: Milestone 1 complete.

Files modified:

```txt id="b8lsda"
styles.css
```

Tasks:

| Order | Task                                                                                                       |
| ----: | ---------------------------------------------------------------------------------------------------------- |
|     1 | Add base box sizing and readable font stack.                                                               |
|     2 | Add compact header styling.                                                                                |
|     3 | Add desktop two-column layout at or above `960px`.                                                         |
|     4 | Add single-column layout below `720px`.                                                                    |
|     5 | Add intermediate responsive behavior between `720px` and `959px`.                                          |
|     6 | Style form groups, labels, helper text, inputs, selects, textareas, and buttons.                           |
|     7 | Style code preview with monospace font, preserved whitespace, and horizontal overflow inside preview only. |
|     8 | Style validation errors, warnings, assumptions, and statuses with text labels.                             |
|     9 | Add visible focus states.                                                                                  |
|    10 | Ensure full page does not require horizontal scrolling.                                                    |
|    11 | Avoid remote fonts and imported stylesheets.                                                               |

Validation after milestone:

| Check            | Pass condition                                                  |
| ---------------- | --------------------------------------------------------------- |
| Desktop          | Controls and preview are visible in first viewport at `1280px`. |
| Narrow           | Page stacks at small widths and remains usable.                 |
| Preview overflow | Long code lines scroll inside preview.                          |
| Focus            | Keyboard focus is visible.                                      |
| Color use        | State is not communicated by color alone.                       |

Stop condition: If responsive layout hides controls or preview, fix CSS before JavaScript behavior.

---

H00 Milestone 3: State, Defaults, Normalization, And DOM Binding

---

Purpose: Establish the application state pipeline without generating final C complexity.

Dependencies: Milestones 1 and 2 complete.

Files modified:

```txt id="vn0gqb"
script.js
```

Tasks:

| Order | Task                                                                       |
| ----: | -------------------------------------------------------------------------- |
|     1 | Define constants for enum values, field order, limits, and default config. |
|     2 | Implement `getDefaultConfig`.                                              |
|     3 | Implement `configToRawConfig` or equivalent default form population.       |
|     4 | Implement required DOM reference lookup.                                   |
|     5 | Implement visible initialization failure if required DOM refs are missing. |
|     6 | Implement `readConfigFromDom`.                                             |
|     7 | Implement multiline list parsing.                                          |
|     8 | Implement `normalizeConfig`.                                               |
|     9 | Implement initial `AppModel` shape.                                        |
|    10 | Bind `input` events for text fields and textareas.                         |
|    11 | Bind `change` events for selects and checkbox.                             |
|    12 | Ensure initialization runs once.                                           |
|    13 | Render temporary placeholder model if generation is not yet implemented.   |

Validation after milestone:

| Check             | Pass condition                                     |
| ----------------- | -------------------------------------------------- |
| Defaults          | Controls are populated with default values.        |
| State reading     | Editing controls updates raw and normalized state. |
| List parsing      | Blank lines are removed and order is preserved.    |
| No persistence    | Reload resets values to defaults.                  |
| No console errors | Normal edits produce no unexpected console errors. |

Stop condition: If state is stored only in DOM with no normalized model, correct architecture before proceeding.

---

I00 Milestone 4: Validation Pipeline

---

Purpose: Implement blocking errors and nonblocking warnings before code generation.

Dependencies: Milestone 3 complete.

Files modified:

```txt id="is6k6o"
script.js
```

Tasks:

| Order | Task                                                              |
| ----: | ----------------------------------------------------------------- |
|     1 | Implement `validateConfig`.                                       |
|     2 | Implement stable validation message codes.                        |
|     3 | Validate required fields.                                         |
|     4 | Validate enum values.                                             |
|     5 | Validate unsupported characters and limits.                       |
|     6 | Validate source/include/library list sizes and entry lengths.     |
|     7 | Add duplicate warnings.                                           |
|     8 | Add non-`.c` source warning.                                      |
|     9 | Add include paths not verified warning.                           |
|    10 | Add library flags not verified warning.                           |
|    11 | Add self-rebuild disabled warning.                                |
|    12 | Add Windows platform assumption warning.                          |
|    13 | Add compiler profile mismatch warning.                            |
|    14 | Render validation summary and field-level errors where practical. |
|    15 | Disable copy/download when errors exist.                          |

Validation after milestone:

| Check                | Pass condition                                              |
| -------------------- | ----------------------------------------------------------- |
| Empty sources        | Shows `source_files_required` and disables actions.         |
| Empty target         | Shows `target_name_required` and disables actions.          |
| Duplicate source     | Shows warning and keeps actions enabled if otherwise valid. |
| Include path present | Shows warning and keeps actions enabled.                    |
| Library flag present | Shows warning and keeps actions enabled.                    |
| Self-rebuild off     | Shows warning and keeps actions enabled.                    |
| Unknown enum         | Blocks actions.                                             |
| Multiple errors      | All current errors are visible.                             |

Stop condition: Do not implement final generator until validation reliably blocks invalid output.

---

J00 Milestone 5: Derived Values, Assumptions, Explanations, And Bootstrap

---

Purpose: Compute all non-code generated outputs from the validated configuration.

Dependencies: Milestone 4 complete.

Files modified:

```txt id="c8t5k6"
script.js
```

Tasks:

| Order | Task                                                                   |
| ----: | ---------------------------------------------------------------------- |
|     1 | Implement executable filename derivation with Windows `.exe` behavior. |
|     2 | Implement output path derivation.                                      |
|     3 | Implement warning flag derivation.                                     |
|     4 | Implement build flag derivation.                                       |
|     5 | Implement include arg derivation.                                      |
|     6 | Implement library arg derivation.                                      |
|     7 | Implement platform and compiler assumption labels.                     |
|     8 | Implement assumptions list derivation.                                 |
|     9 | Implement block-level explanations.                                    |
|    10 | Implement bootstrap command derivation.                                |
|    11 | Render assumptions panel.                                              |
|    12 | Render explanations panel.                                             |
|    13 | Render bootstrap command panel.                                        |

Validation after milestone:

| Check                    | Pass condition                                                                                                    |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| Unix target              | `example` derives output path `build/example`.                                                                    |
| Windows target           | `example` derives output path containing `example.exe`.                                                           |
| Windows no double suffix | `example.exe` does not become `example.exe.exe`.                                                                  |
| Assumptions              | Assumptions mention `nob.h`, local-only, executable-only, platform/compiler assumptions, no dependency discovery. |
| Bootstrap                | Bootstrap panel shows compile and run phases.                                                                     |
| Invalid config           | Bootstrap does not show misleading commands from invalid required values.                                         |

Stop condition: If derived values conflict with data-model rules, fix before generating C.

---

K00 Milestone 6: Generated nob.c Template

---

Purpose: Implement deterministic generated `nob.c`.

Dependencies: Milestone 5 complete.

Files modified:

```txt id="v3wprq"
script.js
```

Tasks:

| Order | Task                                                                                               |
| ----: | -------------------------------------------------------------------------------------------------- |
|     1 | Implement C string argument escaping or rejection according to validation behavior.                |
|     2 | Implement named generator section functions.                                                       |
|     3 | Implement optional header comment for concise mode.                                                |
|     4 | Emit `#define NOB_IMPLEMENTATION`.                                                                 |
|     5 | Emit `#include "nob.h"`.                                                                           |
|     6 | Emit `int main(int argc, char **argv)`.                                                            |
|     7 | Emit self-rebuild block when enabled.                                                              |
|     8 | Emit output directory preparation when required.                                                   |
|     9 | Emit `Nob_Cmd` command declaration.                                                                |
|    10 | Emit `nob_cmd_append` calls for compiler command, flags, includes, sources, output, and libraries. |
|    11 | Emit `nob_cmd_run` failure handling with nonzero return.                                           |
|    12 | Emit success return.                                                                               |
|    13 | Ensure minimal comments mode reduces comments without changing behavior.                           |
|    14 | Ensure no run/test/clean/static-library/package/dependency code is generated.                      |
|    15 | Ensure generation is deterministic.                                                                |

Important implementation constraint: If the exact `nob.h` directory helper name is uncertain, verify against the available `nob.h` reference before using it. Do not invent a helper. If verification is not possible, either omit output-directory creation and clearly revise specs, or use only documented APIs available in the project context.

Validation after milestone:

| Check                 | Pass condition                                                                                                       |
| --------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Default output        | Contains required `nob.h` define, include, main, self-rebuild, command, append, run, failure return, success return. |
| Multi-source          | Preserves source order.                                                                                              |
| Include args          | Appear only when include paths are configured.                                                                       |
| Library args          | Appear only when library flags are configured.                                                                       |
| Windows output        | Contains `.exe` output path when Windows platform selected.                                                          |
| Self-rebuild disabled | Omits self-rebuild and shows warning.                                                                                |
| Minimal comments      | Reduces comments without changing behavior.                                                                          |
| Prohibited content    | No run/test/clean/static-library/package/discovery code.                                                             |

Stop condition: If generated C is malformed, unsafe, or based on invented `nob.h` APIs, stop and correct template or update specs.

---

L00 Milestone 7: Rendering, Preview Status, Copy, And Download

---

Purpose: Complete user actions and safe preview behavior.

Dependencies: Milestones 4 through 6 complete.

Files modified:

```txt id="vwv5oh"
script.js
styles.css
```

Tasks:

| Order | Task                                                                                                                               |
| ----: | ---------------------------------------------------------------------------------------------------------------------------------- |
|     1 | Implement `buildAppModel` with last-valid-output behavior.                                                                         |
|     2 | Implement `renderApp`.                                                                                                             |
|     3 | Render generated code using `textContent`.                                                                                         |
|     4 | Render status states: ready, needsChanges, copied, downloaded, copyFailed, downloadFailed, generationFailed, initializationFailed. |
|     5 | Render action enabled/disabled states from model validity.                                                                         |
|     6 | Implement `copyGeneratedCode`.                                                                                                     |
|     7 | Implement `handleCopyClick` with validity guard.                                                                                   |
|     8 | Implement `downloadGeneratedCode`.                                                                                                 |
|     9 | Implement `handleDownloadClick` with validity guard.                                                                               |
|    10 | Revoke object URLs after download.                                                                                                 |
|    11 | Clear copy/download status after any config edit.                                                                                  |
|    12 | Ensure invalid current state never copies or downloads last valid output.                                                          |

Validation after milestone:

| Check             | Pass condition                                    |
| ----------------- | ------------------------------------------------- |
| Safe preview      | Code is text-rendered, not HTML-rendered.         |
| Valid copy        | Copies generated `nob.c` only.                    |
| Invalid copy      | Disabled or refused when validation errors exist. |
| Valid download    | Downloads generated `nob.c` only as `nob.c`.      |
| Invalid download  | Disabled or refused when validation errors exist. |
| Status reset      | Copied/downloaded status clears after edit.       |
| Clipboard failure | Visible failure appears if clipboard is blocked.  |

Stop condition: If copy/download can operate while invalid, fix before proceeding.

---

M00 Milestone 8: Optional Local Test Harness

---

Purpose: Add local, no-dependency fixture checks if practical.

Dependencies: Milestone 7 complete.

Files optionally created:

```txt id="g3en90"
tests.html
tests.js
```

Tasks:

| Order | Task                                                              |
| ----: | ----------------------------------------------------------------- |
|     1 | Expose pure functions safely for local test harness if needed.    |
|     2 | Add fixture configurations from the data-model and testing specs. |
|     3 | Test normalization.                                               |
|     4 | Test validation error codes.                                      |
|     5 | Test warning codes.                                               |
|     6 | Test derived output values.                                       |
|     7 | Test generated code required substrings.                          |
|     8 | Test generated code prohibited substrings.                        |
|     9 | Test determinism by generating same config twice.                 |
|    10 | Display pass/fail results in the browser.                         |

Constraints:

| Constraint            | Requirement                                   |
| --------------------- | --------------------------------------------- |
| No dependencies       | Harness must not use npm or remote libraries. |
| No product dependency | Product must run without harness files.       |
| No network            | Harness must not send results anywhere.       |

Validation after milestone:

| Check              | Pass condition                         |
| ------------------ | -------------------------------------- |
| Harness loads      | `tests.html` loads locally if created. |
| Fixtures pass      | All included fixtures pass.            |
| Product unaffected | Main app still runs without tests.     |

Stop condition: If harness setup requires build tooling, discard harness and use manual testing only.

---

N00 Milestone 9: Manual QA And Test Report

---

Purpose: Execute the testing strategy and record results.

Dependencies: Milestone 7 complete. Milestone 8 optional.

Files modified:

```txt id="faus6i"
docs/product-spec/test-report-v1.md
```

Tasks:

| Order | Task                                                                  |
| ----: | --------------------------------------------------------------------- |
|     1 | Open app from local static server.                                    |
|     2 | Open app through `file://` and note behavior.                         |
|     3 | Run valid fixture workflows manually or through optional harness.     |
|     4 | Run invalid input workflows.                                          |
|     5 | Test copy behavior.                                                   |
|     6 | Test download behavior.                                               |
|     7 | Test bootstrap panel behavior.                                        |
|     8 | Test responsive widths: `1280px`, `960px`, `720px`, `480px`, `320px`. |
|     9 | Test keyboard-only workflow.                                          |
|    10 | Test basic accessibility checks.                                      |
|    11 | Check DevTools console for unexpected errors.                         |
|    12 | Check DevTools network panel for unexpected requests.                 |
|    13 | Check browser storage for unexpected persistence.                     |
|    14 | Search files for prohibited runtime references.                       |
|    15 | Record all results in `test-report-v1.md`.                            |

Recommended local server command:

```sh id="qo4k14"
python3 -m http.server 8000
```

Fallback:

```sh id="v1bklh"
python -m http.server 8000
```

Recommended prohibited-reference search:

```sh id="x2bn7s"
grep -R "https://\|http://\|cdn\|analytics\|gtag\|fetch\|XMLHttpRequest\|WebSocket\|localStorage\|sessionStorage\|indexedDB\|serviceWorker" .
```

Validation after milestone:

| Check            | Pass condition                                                                                                                |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Test report      | Completed with browser, fixture, manual, responsive, accessibility, console, network, storage, and release decision sections. |
| Known failures   | Any failure is documented.                                                                                                    |
| Release decision | `pass` only if all V1 gates pass.                                                                                             |

Stop condition: If any release gate fails, do not mark V1 complete. Fix implementation or update specs if the spec is wrong.

---

O00 Milestone 10: Final Scope Audit

---

Purpose: Confirm the implementation did not expand beyond V1.

Dependencies: Milestone 9 complete.

Files reviewed:

```txt id="fzo3m4"
index.html
styles.css
script.js
docs/product-spec/*.md
tests.html
tests.js
```

Audit checks:

| Area                    | Required result                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Runtime stack           | Plain HTML/CSS/JS only.                                                                                             |
| Generated artifact      | Single executable-oriented `nob.c`.                                                                                 |
| API style               | Prefixed `nob.h` APIs only.                                                                                         |
| Persistence             | No URL state, local storage, session storage, IndexedDB, cookies, or service workers.                               |
| Network                 | No runtime network requests.                                                                                        |
| Backend                 | No server code or API dependency.                                                                                   |
| Framework               | No framework runtime.                                                                                               |
| Build tooling           | No required npm, bundler, or transpiler.                                                                            |
| Excluded build features | No run/test/clean, static library, package manager, dependency discovery, repository scanning, browser compilation. |
| UX                      | First viewport is the tool, not a landing page.                                                                     |
| Copy/download           | Only generated `nob.c` is copied/downloaded.                                                                        |

If any audit item fails, either remove the out-of-scope behavior or update the documentation gate and obtain approval before proceeding.

---

P00 Implementation Order Summary

---

Implementation must follow this order:

```txt id="817bnh"
0. Project skeleton and documentation gate
1. Semantic HTML structure
2. Base CSS and responsive layout
3. State, defaults, normalization, and DOM binding
4. Validation pipeline
5. Derived values, assumptions, explanations, and bootstrap
6. Generated nob.c template
7. Rendering, preview status, copy, and download
8. Optional local test harness
9. Manual QA and test report
10. Final scope audit
```

Do not jump directly to generated code before validation exists.

Do not implement copy/download before validity guards exist.

Do not add advanced UI controls before their data model, validation, and generated-code effects exist.

Do not add deferred features during cleanup.

---

Q00 Documentation Update Rules

---

If implementation discovers that a specification requirement is impossible, unsafe, or incompatible with confirmed `nob.h` behavior, update the relevant spec before coding around it.

Each spec update must include:

| Required item      | Description                                 |
| ------------------ | ------------------------------------------- |
| Changed file       | Which spec was changed.                     |
| Reason             | Why the change is needed.                   |
| Impact             | Which implementation or tests are affected. |
| Decision log entry | Short entry in `decision-log.md`.           |

Do not silently diverge from specs.

If a feature is deferred during implementation, add it to deferred features or decision log. Do not leave dead controls in the UI.

If a generated-code API name is corrected after verifying `nob.h`, update `06-interface-contracts.md`, `08-testing-strategy.md`, and this file if needed.

---

R00 Risk Register

---

| Risk                       | Likely cause                                          | Required mitigation                                                                                |
| -------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Invalid generated C        | Template built before validation or API verification. | Implement validation first; check required generated substrings; verify uncertain `nob.h` helpers. |
| Overbuilt UI               | Agent adds presets, targets, or package controls.     | Use non-goal audit after each milestone.                                                           |
| Unsafe rendering           | Generated code inserted with `innerHTML`.             | Require `textContent` for preview and user values.                                                 |
| Copy/download stale output | Actions read DOM or old state.                        | Actions must use current valid model.                                                              |
| Platform overclaiming      | Windows selector treated as guarantee.                | Assumptions panel must state platform is an assumption.                                            |
| Hidden persistence         | Agent adds localStorage or URL state for convenience. | Static constraint search and storage checks required.                                              |
| Dependency creep           | Agent adds npm or framework for convenience.          | Reject required package/build files.                                                               |
| Incomplete accessibility   | Labels/focus/status omitted.                          | Keyboard and label checks required before completion.                                              |
| Fixture gaps               | Only default case tested.                             | Required valid and invalid fixtures must be covered.                                               |
| Documentation drift        | Implementation differs from specs.                    | Update specs and decision log before divergence.                                                   |

---

S00 Done Criteria For Implementation

---

V1 implementation is done only when all criteria pass.

| Criterion              | Required result                                                                                                                                      |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Documentation gate     | Required specs and decision log exist locally.                                                                                                       |
| Runtime files          | `index.html`, `styles.css`, and `script.js` exist and run without build tooling.                                                                     |
| Default state          | Page opens with valid generated `nob.c`.                                                                                                             |
| Required controls      | All V1 controls exist and affect output, validation, assumptions, or bootstrap text.                                                                 |
| Validation             | Blocking errors and nonblocking warnings behave as specified.                                                                                        |
| Generated code         | Output contains required `nob.h` sections and no prohibited V1 behavior.                                                                             |
| Safe rendering         | Generated code and user values are text-rendered.                                                                                                    |
| Copy                   | Copies only current valid generated `nob.c` or reports failure.                                                                                      |
| Download               | Downloads only current valid generated `nob.c` as `nob.c`.                                                                                           |
| Bootstrap              | Shows compile and run phases and no dependency/install commands.                                                                                     |
| Assumptions            | States `nob.h` availability, local-only behavior, executable-only scope, platform/compiler assumptions, no dependency discovery, and manual editing. |
| Responsive             | Usable at required viewport widths.                                                                                                                  |
| Keyboard               | Core workflow works with keyboard.                                                                                                                   |
| Accessibility basics   | Labels, focus, status, errors, and warnings are usable.                                                                                              |
| No network             | Runtime makes no network requests.                                                                                                                   |
| No persistence         | Refresh resets configuration to defaults.                                                                                                            |
| No prohibited features | V1 exclusions are absent from UI and generated code.                                                                                                 |
| Test report            | `test-report-v1.md` exists and records a pass decision.                                                                                              |

---

T00 Agent Stop Conditions

---

The coding agent must stop implementation and update documentation or request milestone advice if any condition occurs.

| Stop condition                                        | Required action                                       |
| ----------------------------------------------------- | ----------------------------------------------------- |
| Missing spec file                                     | Create or restore spec before runtime implementation. |
| Conflicting specs                                     | Resolve conflict in docs and decision log.            |
| Unverified `nob.h` API helper                         | Verify before using or revise generated-code plan.    |
| Need for framework or build tool                      | Stop; V1 forbids it.                                  |
| Need for backend/network                              | Stop; V1 forbids it.                                  |
| Desire to add deferred feature                        | Stop; update scope only if explicitly approved.       |
| Generated C cannot be made valid within current scope | Stop; revise template spec and decision log.          |
| Copy/download can occur while invalid                 | Stop and fix action guards.                           |
| Safe rendering cannot be guaranteed                   | Stop and fix rendering before continuing.             |
| Test report has failing release gate                  | Do not mark done. Fix or revise specs.                |

---

U00 Definition Of Done For This Specification File

---

This file is complete when it defines required files, pre-implementation checks, milestones, task order, dependencies, validation after each milestone, documentation update rules, risk register, implementation done criteria, and agent stop conditions for V1.

---

Z99 Review-Gate Addendum: Do Not Implement Until Verified

Before writing production UI or generator code, implementation must verify and obey these pinned decisions:

- Use `nob_mkdir_if_not_exists()` for output directory creation.
- Use `nob_cmd_run(&cmd)` for command execution.
- Do not use deprecated `nob_cmd_run_sync()` or `nob_cmd_run_sync_and_reset()` APIs.
- Do not expose MSVC in V1.
- Use GCC/Clang/TCC-style argument mapping only.
- Add exact generated-output snapshots before final release validation.

These decisions were made after reviewing upstream `nob.h` main on 2026-05-24 and saving the snapshot at `.tmp/chatgpt-relay/upstream-nob-h-main-snapshot.txt`.
