---

A00 Milestone Implementation Plan For nob.h / nob.c Static Generator

---

This plan is the execution guide for Codex after the documentation gate. It assumes the local specifications are already saved, the project folder is `nob-boilerplate-generator`, and the upstream `nob.h` snapshot exists at `.tmp/chatgpt-relay/upstream-nob-h-main-snapshot.txt`.

Codex must implement continuously and autonomously within the selected V1 scope. Do not add deferred features. Do not ask the human for more decisions unless a hard blocker contradicts the saved specifications.

---

B00 Global Implementation Rules

---

| Rule                 | Required behavior                                                                                                                                                                        |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime stack        | Use only `index.html`, `styles.css`, and `script.js` for production runtime.                                                                                                             |
| Build tooling        | Do not add npm, package managers, bundlers, transpilers, TypeScript, Sass, Vite, Webpack, or framework tooling.                                                                          |
| Runtime network      | Do not use `fetch`, remote scripts, remote CSS, remote fonts, telemetry, analytics, or error-reporting endpoints.                                                                        |
| Persistence          | Do not use local storage, session storage, cookies, IndexedDB, URL query state, URL hash state, or service workers.                                                                      |
| Generated artifact   | Generate only one executable-oriented `nob.c`.                                                                                                                                           |
| Generated API style  | Use prefixed `nob.h` APIs only.                                                                                                                                                          |
| V1 compiler profiles | Support only the pinned V1 profiles from the local specs: `cc`, `gcc`, `clang`, and `tcc` or their exact documented equivalents. Do not implement MSVC.                                  |
| Deferred features    | Do not implement run/test/clean targets, static libraries, package management, dependency discovery, repository scanning, browser compilation, diff view, accounts, or backend services. |
| Source of truth      | Use one in-memory app model. Do not derive copy/download output from DOM text.                                                                                                           |
| Safe rendering       | Use `textContent` or equivalent safe text APIs for generated code and user-derived text.                                                                                                 |
| Release priority     | Generated-code correctness, validation, fixtures, copy/download reliability, and no-scope-creep outrank visual polish.                                                                   |

---

C00 Milestone 0: Confirm Documentation Gate And Local Inputs

---

Purpose: Verify that implementation is allowed to begin and that the local requirements are complete enough to execute.

| Task order | Task                                                                                                                                                       |
| ---------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
|          1 | Confirm current working directory is the new project folder.                                                                                               |
|          2 | Confirm `docs/product-spec/00-spec-outline.md` through `docs/product-spec/09-implementation-plan.md` exist.                                                |
|          3 | Confirm the specs reflect the latest decisions: MSVC deferred, exact generated skeleton pinned, compiler profiles pinned, upstream snapshot saved locally. |
|          4 | Confirm `.tmp/chatgpt-relay/upstream-nob-h-main-snapshot.txt` exists.                                                                                      |
|          5 | Search the upstream snapshot for `NOB_GO_REBUILD_URSELF`, `Nob_Cmd`, `nob_cmd_append`, `nob_cmd_run`, and `nob_mkdir_if_not_exists`.                       |
|          6 | If any required `nob.h` API name is missing, update the decision log and generated-template spec before runtime implementation.                            |
|          7 | Create or update `docs/product-spec/decision-log.md` with the final V1 decisions.                                                                          |
|          8 | Create or update `docs/product-spec/test-report-v1.md` as an empty testing report template.                                                                |

Likely files changed:

| File                                  | Expected change                                              |
| ------------------------------------- | ------------------------------------------------------------ |
| `docs/product-spec/decision-log.md`   | Add final implementation decisions.                          |
| `docs/product-spec/test-report-v1.md` | Add empty report headings.                                   |
| Specs                                 | Only update if a conflict or missing pinned detail is found. |

Validation steps:

| Check              | Pass condition                                                                                            |
| ------------------ | --------------------------------------------------------------------------------------------------------- |
| Specs present      | All ten local spec files from `00` through `09` exist.                                                    |
| Snapshot present   | Upstream snapshot file exists.                                                                            |
| API names verified | Required `nob.h` symbols are found or specs are updated to remove unsupported usage.                      |
| Decision log       | Records MSVC deferral, static-only runtime, prefixed API style, no persistence, and no deferred features. |

Risks:

| Risk                                          | Mitigation                                                         |
| --------------------------------------------- | ------------------------------------------------------------------ |
| Implementing against invented `nob.h` helpers | Verify exact helper names before code generation.                  |
| Implementing old requirements                 | Reconcile saved specs with final selected direction before coding. |

Completion criteria: Documentation gate is complete, unresolved generated-code API ambiguity is removed, and implementation may begin.

---

D00 Milestone 1: Create Static Runtime Skeleton

---

Purpose: Establish the production runtime files and semantic document structure without business logic.

| Task order | Task                                                                                         |
| ---------: | -------------------------------------------------------------------------------------------- |
|          1 | Create `index.html`, `styles.css`, and `script.js` if missing.                               |
|          2 | Add HTML document metadata, page title, stylesheet reference, and deferred script reference. |
|          3 | Add compact header with product name and purpose.                                            |
|          4 | Add no-script fallback stating JavaScript is required.                                       |
|          5 | Add the main tool layout container.                                                          |
|          6 | Add control groups: Project, Sources and output, Compiler, Advanced.                         |
|          7 | Add required form controls with stable ids and labels.                                       |
|          8 | Add validation, assumptions, bootstrap, explanations, and preview panels.                    |
|          9 | Add `Copy nob.c` and `Download nob.c` buttons.                                               |
|         10 | Do not add disabled placeholders for deferred features.                                      |

Likely files changed:

| File         | Expected change                             |
| ------------ | ------------------------------------------- |
| `index.html` | Main semantic structure and form controls.  |
| `styles.css` | Minimal placeholder styling only if needed. |
| `script.js`  | Empty or initialization placeholder only.   |

Required controls:

| Control                | Required V1 presence            |
| ---------------------- | ------------------------------- |
| Project name           | Yes                             |
| Target executable name | Yes                             |
| Source files           | Yes, multiline allowed          |
| Output directory       | Yes                             |
| Platform assumption    | Yes                             |
| Compiler profile       | Yes, only V1-supported profiles |
| Compiler command       | Yes                             |
| Build profile          | Yes, debug/release              |
| Warning profile        | Yes, normal/strict              |
| Include paths          | Yes, multiline allowed          |
| Library flags          | Yes, multiline allowed          |
| Self-rebuild           | Yes, enabled by default later   |
| Comment style          | Yes, concise/minimal            |

Validation steps:

| Check                  | Pass condition                                                                                                              |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Labeling               | Every control has a visible and associated label.                                                                           |
| Stable ids             | All runtime-read and runtime-written elements have stable ids.                                                              |
| No inline handlers     | No `onclick`, `oninput`, or `onchange` attributes.                                                                          |
| No remote runtime refs | No CDN, remote CSS, remote script, remote font, or analytics reference.                                                     |
| No excluded UI         | No controls for run/test/clean, static libraries, package discovery, repo import, URL share, login, or browser compilation. |

Risks:

| Risk                                        | Mitigation                                                   |
| ------------------------------------------- | ------------------------------------------------------------ |
| Building a landing page instead of the tool | First viewport must contain controls and preview containers. |
| Adding future-feature placeholders          | Remove all placeholder controls not implemented in V1.       |

Completion criteria: HTML structure contains every required runtime surface and no out-of-scope UI.

---

E00 Milestone 2: Implement Base Styling And Responsive Layout

---

Purpose: Make the tool usable before adding generation behavior.

| Task order | Task                                                                             |
| ---------: | -------------------------------------------------------------------------------- |
|          1 | Add base CSS reset or simple box-sizing rule.                                    |
|          2 | Add readable system font stack and monospace preview stack.                      |
|          3 | Implement desktop two-column layout at or above `960px`.                         |
|          4 | Implement single-column layout below `720px`.                                    |
|          5 | Keep preview accessible without modal or hidden pane.                            |
|          6 | Style form groups, labels, helper text, textareas, selects, buttons, and panels. |
|          7 | Style validation severities: error, warning, assumption, success/status.         |
|          8 | Add visible focus states.                                                        |
|          9 | Ensure code preview scrolls horizontally inside its own container only.          |
|         10 | Do not use remote assets or CSS imports.                                         |

Likely files changed:

| File         | Expected change                                                |
| ------------ | -------------------------------------------------------------- |
| `styles.css` | Base layout, responsive rules, panels, focus, preview styling. |
| `index.html` | Minor class additions only if needed.                          |

Validation steps:

| Check                          | Pass condition                                                       |
| ------------------------------ | -------------------------------------------------------------------- |
| Desktop layout                 | At `1280px`, controls and preview are visible in the first viewport. |
| Small layout                   | At `480px`, page stacks and remains usable.                          |
| No full-page horizontal scroll | Long code lines scroll in preview only.                              |
| Focus visibility               | Keyboard focus is visible on controls and buttons.                   |
| State not color-only           | Errors, warnings, and statuses include text, not color alone.        |

Risks:

| Risk                           | Mitigation                              |
| ------------------------------ | --------------------------------------- |
| Over-polishing before behavior | Keep styling functional and minimal.    |
| Mobile layout hiding preview   | Use normal document flow and scrolling. |

Completion criteria: Static page is readable, responsive, keyboard-visible, and ready for behavior.

---

F00 Milestone 3: Implement Constants, Defaults, DOM References, And Normalization

---

Purpose: Establish the in-memory state foundation and input parsing.

| Task order | Task                                                                                                                                           |
| ---------: | ---------------------------------------------------------------------------------------------------------------------------------------------- |
|          1 | Define constant objects for platform profiles, compiler profiles, build profiles, warning profiles, comment styles, limits, and status values. |
|          2 | Implement `getDefaultConfig()`.                                                                                                                |
|          3 | Implement `configToRawConfig()` or equivalent default form population.                                                                         |
|          4 | Implement `getDomRefs()` and required-ref validation.                                                                                          |
|          5 | Implement visible initialization failure for missing refs.                                                                                     |
|          6 | Implement `readConfigFromDom(refs)`.                                                                                                           |
|          7 | Implement `parseMultilineList(text)`.                                                                                                          |
|          8 | Implement `normalizeConfig(raw)`.                                                                                                              |
|          9 | Implement `initializeApp()` with default population and a temporary placeholder render.                                                        |
|         10 | Bind input/change listeners once.                                                                                                              |

Likely files changed:

| File         | Expected change                                                               |
| ------------ | ----------------------------------------------------------------------------- |
| `script.js`  | Constants, default config, DOM refs, raw read, normalization, initialization. |
| `index.html` | Minor id corrections if ref lookup finds issues.                              |

Validation steps:

| Check               | Pass condition                                                             |
| ------------------- | -------------------------------------------------------------------------- |
| Page initialization | No missing DOM ref errors in normal page load.                             |
| Defaults            | Form controls populate from the default config.                            |
| Reload behavior     | Refresh resets to defaults.                                                |
| List parsing        | Blank lines are removed and order is preserved.                            |
| No storage          | DevTools shows no local storage/session storage/cookies/IndexedDB created. |

Risks:

| Risk                                    | Mitigation                                        |
| --------------------------------------- | ------------------------------------------------- |
| Treating DOM as source of truth forever | Create normalized config and later app model now. |
| Hidden persistence                      | Do not use browser storage or URL state.          |

Completion criteria: The app can read and normalize all controls deterministically.

---

G00 Milestone 4: Implement Validation And Warning Pipeline

---

Purpose: Prevent malformed or unsafe generated output before the generator exists.

| Task order | Task                                                                               |
| ---------: | ---------------------------------------------------------------------------------- |
|          1 | Implement `makeMessage(code, field, severity, message)` or equivalent.             |
|          2 | Implement `validateConfig(config)`.                                                |
|          3 | Validate required fields.                                                          |
|          4 | Validate enum values.                                                              |
|          5 | Validate length limits.                                                            |
|          6 | Reject control characters and unsupported quote characters according to the specs. |
|          7 | Validate source/include/library list count limits.                                 |
|          8 | Add duplicate warnings for sources, includes, and library flags.                   |
|          9 | Add warning for non-`.c` source entries.                                           |
|         10 | Add warnings for unverified include paths and library flags.                       |
|         11 | Add warning for self-rebuild disabled.                                             |
|         12 | Add warnings for Windows platform assumption and compiler/profile mismatch.        |
|         13 | Render validation summary and field-level messages.                                |
|         14 | Disable copy/download when errors exist.                                           |

Likely files changed:

| File         | Expected change                                                               |
| ------------ | ----------------------------------------------------------------------------- |
| `script.js`  | Validation, warning generation, validation rendering, action-state rendering. |
| `styles.css` | Error/warning/field-message styling as needed.                                |

Validation steps:

| Test                 | Pass condition                                              |
| -------------------- | ----------------------------------------------------------- |
| Empty target         | Shows `target_name_required`; actions disabled.             |
| Empty sources        | Shows `source_files_required`; actions disabled.            |
| Duplicate source     | Warning appears; actions remain enabled if otherwise valid. |
| Include path present | `include_paths_not_verified` warning appears.               |
| Library flag present | `library_flags_not_verified` warning appears.               |
| Self-rebuild off     | Warning appears; actions remain enabled.                    |
| Invalid enum         | Blocking error appears; actions disabled.                   |
| Multiple errors      | All relevant errors appear together.                        |

Risks:

| Risk                                   | Mitigation                                                                       |
| -------------------------------------- | -------------------------------------------------------------------------------- |
| Copy/download enabled in invalid state | Action buttons and handlers must both check validity later.                      |
| Silently rewriting user input          | Only trim and parse according to spec; do not deduplicate or split shell syntax. |

Completion criteria: Invalid and risky inputs produce the exact blocking/nonblocking behavior required by specs.

---

H00 Milestone 5: Implement Derived Values, Assumptions, Explanations, And Bootstrap Output

---

Purpose: Compute all derived non-C outputs before final generation.

| Task order | Task                                                                 |
| ---------: | -------------------------------------------------------------------- |
|          1 | Implement executable filename derivation.                            |
|          2 | Implement executable output path derivation.                         |
|          3 | Implement compiler flag derivation for pinned V1 compiler profiles.  |
|          4 | Implement warning profile flag derivation.                           |
|          5 | Implement debug/release flag derivation.                             |
|          6 | Implement include argument derivation.                               |
|          7 | Implement library argument derivation.                               |
|          8 | Implement assumptions list derivation.                               |
|          9 | Implement short block-level explanations.                            |
|         10 | Implement bootstrap command derivation.                              |
|         11 | Render assumptions, explanations, and bootstrap panels.              |
|         12 | Ensure invalid configs do not produce misleading bootstrap commands. |

Likely files changed:

| File         | Expected change                                                 |
| ------------ | --------------------------------------------------------------- |
| `script.js`  | Derived values, assumptions, explanations, bootstrap rendering. |
| `styles.css` | Panel readability refinements if needed.                        |

Validation steps:

| Check                 | Pass condition                                                                                                                           |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Unix output           | `example` with Unix derives `build/example`.                                                                                             |
| Windows output        | `example` with Windows derives `build/example.exe`.                                                                                      |
| Existing `.exe`       | `example.exe` with Windows does not become `example.exe.exe`.                                                                            |
| Assumptions           | Panel states `nob.h` availability, local-only behavior, executable-only V1, platform/compiler assumptions, no discovery, manual editing. |
| Bootstrap             | Shows compile build program and run build program phases.                                                                                |
| Self-rebuild disabled | Bootstrap no longer claims automatic self-rebuild.                                                                                       |
| Invalid input         | Bootstrap panel tells user to fix validation errors if command derivation is unsafe.                                                     |

Risks:

| Risk                                 | Mitigation                                           |
| ------------------------------------ | ---------------------------------------------------- |
| Compiler profiles becoming too broad | Implement only pinned V1 profiles; keep MSVC absent. |
| Platform selector implying guarantee | Use assumption wording everywhere.                   |

Completion criteria: Derived panels update live and are consistent with normalized config.

---

I00 Milestone 6: Implement Exact Generated nob.c Template

---

Purpose: Produce the primary artifact: deterministic, readable, executable-oriented `nob.c`.

| Task order | Task                                                                                                           |
| ---------: | -------------------------------------------------------------------------------------------------------------- |
|          1 | Confirm required `nob.h` APIs from the local snapshot one final time.                                          |
|          2 | Implement `cStringLiteral(value)` or equivalent escaping/rejection helper.                                     |
|          3 | Implement named generator section functions.                                                                   |
|          4 | Emit concise header comment when comment style is concise.                                                     |
|          5 | Emit `#define NOB_IMPLEMENTATION`.                                                                             |
|          6 | Emit `#include "nob.h"`.                                                                                       |
|          7 | Emit `int main(int argc, char **argv)`.                                                                        |
|          8 | Emit `NOB_GO_REBUILD_URSELF(argc, argv)` when self-rebuild is enabled.                                         |
|          9 | Emit `nob_mkdir_if_not_exists` output directory preparation when required and verified.                        |
|         10 | Emit `Nob_Cmd cmd = {0};` or the exact pinned initializer.                                                     |
|         11 | Emit `nob_cmd_append` calls for compiler command, flags, includes, source files, output target, and libraries. |
|         12 | Emit `nob_cmd_run` failure handling with nonzero return.                                                       |
|         13 | Emit `return 0;` on success.                                                                                   |
|         14 | Omit empty include/library sections or keep only concise comments if permitted.                                |
|         15 | Ensure minimal comments mode reduces comments without changing behavior.                                       |
|         16 | Ensure generated output has no timestamps, random values, detected OS data, or network references.             |

Likely files changed:

| File        | Expected change                            |
| ----------- | ------------------------------------------ |
| `script.js` | Generator functions and C string handling. |

Generated-code exclusions to verify immediately:

| Exclusion                    | Required result                    |
| ---------------------------- | ---------------------------------- |
| Run/test/clean               | Not present.                       |
| Static libraries             | Not present.                       |
| Package/dependency discovery | Not present.                       |
| Shell pipelines              | Not present as generated behavior. |
| Stripped API style           | Not present.                       |
| Do-not-edit language         | Not present.                       |
| Network URLs                 | Not present.                       |

Validation steps:

| Fixture                         | Pass condition                                                                                                          |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Default Unix debug              | Contains required sections, prefixed APIs, self-rebuild, `src/main.c`, `build/example`, failure return, success return. |
| Multi-source with includes/libs | Preserves source/include/library order.                                                                                 |
| Windows MinGW debug             | Uses `.exe` output naming and does not double suffix.                                                                   |
| Self-rebuild disabled           | Omits `NOB_GO_REBUILD_URSELF` and keeps warning.                                                                        |
| Minimal comments                | Changes comments only, not build behavior.                                                                              |

Risks:

| Risk                        | Mitigation                                                                        |
| --------------------------- | --------------------------------------------------------------------------------- |
| Malformed generated C       | Build from pinned skeleton and fixture snapshots, not ad hoc strings in handlers. |
| Wrong `nob.h` helper name   | Use only verified names from snapshot.                                            |
| Unsafe string interpolation | Route every generated C string argument through one helper.                       |

Completion criteria: The generator produces deterministic, fixture-checkable `nob.c` for all valid V1 configurations.

---

J00 Milestone 7: Implement App Model, Rendering, Status, Copy, And Download

---

Purpose: Connect the full state pipeline to the UI and user actions safely.

| Task order | Task                                                                                                                               |
| ---------: | ---------------------------------------------------------------------------------------------------------------------------------- |
|          1 | Implement `buildAppModel(raw, previousModel)`.                                                                                     |
|          2 | Preserve `lastValidGeneratedCode` for invalid preview states.                                                                      |
|          3 | Implement `renderApp(model, refs)`.                                                                                                |
|          4 | Render preview code via `textContent`.                                                                                             |
|          5 | Render statuses: ready, needs changes, copied, downloaded, copy failed, download failed, generation failed, initialization failed. |
|          6 | Render copy/download enabled state from `model.isValid && model.generatedCode`.                                                    |
|          7 | Implement `copyGeneratedCode(code)`.                                                                                               |
|          8 | Implement `handleCopyClick(event)` with a model-validity guard.                                                                    |
|          9 | Implement `downloadGeneratedCode(code, "nob.c")`.                                                                                  |
|         10 | Implement `handleDownloadClick(event)` with a model-validity guard.                                                                |
|         11 | Revoke object URLs after download.                                                                                                 |
|         12 | Clear copy/download success or failure status after any config change.                                                             |

Likely files changed:

| File         | Expected change                                         |
| ------------ | ------------------------------------------------------- |
| `script.js`  | Full app model, rendering, actions, status transitions. |
| `styles.css` | Status and disabled-action styling.                     |

Validation steps:

| Check            | Pass condition                                                                 |
| ---------------- | ------------------------------------------------------------------------------ |
| Valid preview    | Shows current generated code.                                                  |
| Invalid preview  | Shows last valid output or safe placeholder with needs-changes status.         |
| Invalid copy     | Disabled or refused; never copies last valid output for current invalid state. |
| Valid copy       | Copies generated `nob.c` only.                                                 |
| Copy failure     | Shows visible failure and leaves preview selectable.                           |
| Valid download   | Downloads generated `nob.c` only as `nob.c`.                                   |
| Invalid download | Disabled or refused.                                                           |
| Status reset     | Any edit clears copied/downloaded/copyFailed/downloadFailed status.            |
| Safe rendering   | Script-like input displays as text or is rejected; it never executes.          |

Risks:

| Risk                           | Mitigation                                                             |
| ------------------------------ | ---------------------------------------------------------------------- |
| Copying stale DOM text         | Copy from `currentModel.generatedCode` only.                           |
| Downloading placeholder text   | Download handler must re-check validity and nonempty generated output. |
| XSS through validation/preview | Use text-safe APIs for every user-derived value.                       |

Completion criteria: The complete core workflow works from default load through valid edit, invalid edit, copy, and download.

---

K00 Milestone 8: Create Fixture Snapshots And Optional No-Dependency Test Harness

---

Purpose: Make generated-code correctness repeatable without npm.

| Task order | Task                                                                            |
| ---------: | ------------------------------------------------------------------------------- |
|          1 | Create exact fixture snapshots for required fixture outputs.                    |
|          2 | Store snapshots under a local docs or fixtures directory.                       |
|          3 | If practical, create `tests.html` and `tests.js` with no external dependencies. |
|          4 | Add fixture configs in the test harness or documentation.                       |
|          5 | Test normalization for multiline lists.                                         |
|          6 | Test validation error codes.                                                    |
|          7 | Test warning codes.                                                             |
|          8 | Test derived executable/output paths.                                           |
|          9 | Test generated output required substrings.                                      |
|         10 | Test generated output prohibited substrings.                                    |
|         11 | Test determinism by generating each valid fixture twice.                        |

Likely files changed:

| File                                                                   | Expected change                                                |
| ---------------------------------------------------------------------- | -------------------------------------------------------------- |
| `docs/product-spec/fixtures/default_unix_debug.nob.c`                  | Exact snapshot.                                                |
| `docs/product-spec/fixtures/multi_source_with_includes_and_libs.nob.c` | Exact snapshot.                                                |
| `docs/product-spec/fixtures/windows_mingw_debug.nob.c`                 | Exact snapshot.                                                |
| `docs/product-spec/fixtures/self_rebuild_disabled.nob.c`               | Exact snapshot.                                                |
| `tests.html`                                                           | Optional local harness.                                        |
| `tests.js`                                                             | Optional local harness.                                        |
| `script.js`                                                            | May expose pure functions under a local namespace for testing. |

Validation steps:

| Check                 | Pass condition                                                |
| --------------------- | ------------------------------------------------------------- |
| Snapshot files        | Required exact snapshots exist.                               |
| Determinism           | Same config generates identical text twice.                   |
| Required substrings   | All required API/section checks pass.                         |
| Prohibited substrings | No deferred feature code appears.                             |
| Harness constraint    | If harness exists, it uses no npm and no remote dependencies. |
| Product independence  | Main app runs without test harness files.                     |

Risks:

| Risk                                | Mitigation                                                                 |
| ----------------------------------- | -------------------------------------------------------------------------- |
| Snapshot drift                      | Regenerate only after intentional template changes and update test report. |
| Test harness becoming build tooling | Keep it plain browser JS or skip it.                                       |

Completion criteria: Fixture snapshots exist and can be used to check generator stability.

---

L00 Milestone 9: Manual QA Pass

---

Purpose: Execute the required static-site test strategy and record results.

| Task order | Task                                                                         |
| ---------: | ---------------------------------------------------------------------------- |
|          1 | Start a local static server with `python3 -m http.server 8000` if available. |
|          2 | Open `http://localhost:8000/`.                                               |
|          3 | Open `index.html` through `file://` in at least one browser.                 |
|          4 | Test default load and default generated output.                              |
|          5 | Test valid fixture workflows through the UI.                                 |
|          6 | Test invalid required fields.                                                |
|          7 | Test duplicate warnings and nonblocking warnings.                            |
|          8 | Test source/include/library list parsing behavior.                           |
|          9 | Test escaping/security inputs.                                               |
|         10 | Test copy behavior.                                                          |
|         11 | Test download behavior.                                                      |
|         12 | Test responsive widths: `1280px`, `960px`, `720px`, `480px`, `320px`.        |
|         13 | Test keyboard-only workflow.                                                 |
|         14 | Test basic accessibility: labels, focus, status text, no color-only meaning. |
|         15 | Check DevTools console during normal workflows.                              |
|         16 | Check DevTools network panel for runtime requests.                           |
|         17 | Check browser storage for unexpected persistence.                            |
|         18 | Search local files for prohibited runtime references.                        |
|         19 | Record results in `docs/product-spec/test-report-v1.md`.                     |

Recommended commands:

```sh
python3 -m http.server 8000
```

```sh
grep -R "https://\|http://\|cdn\|analytics\|gtag\|fetch\|XMLHttpRequest\|WebSocket\|localStorage\|sessionStorage\|indexedDB\|serviceWorker" .
```

Likely files changed:

| File                                  | Expected change                              |
| ------------------------------------- | -------------------------------------------- |
| `docs/product-spec/test-report-v1.md` | Full manual QA results and release decision. |
| Runtime files                         | Fixes discovered during QA.                  |

Validation steps:

| Check                | Pass condition                                                |
| -------------------- | ------------------------------------------------------------- |
| Default state        | Valid preview, assumptions, bootstrap, copy/download enabled. |
| Invalid state        | Errors visible and copy/download disabled.                    |
| Copy                 | Copies only generated `nob.c` or reports visible failure.     |
| Download             | Downloads only generated `nob.c`.                             |
| No network           | Runtime causes no network calls after local files load.       |
| No storage           | Refresh resets defaults; no app storage created.              |
| Console              | No unexpected errors during normal usage.                     |
| Responsive           | Required widths are usable.                                   |
| Accessibility basics | Labels, focus, keyboard flow, status text pass.               |

Risks:

| Risk                           | Mitigation                                               |
| ------------------------------ | -------------------------------------------------------- |
| Browser-specific copy behavior | Accept failure only if visible and recoverable.          |
| Missing small-screen behavior  | Fix CSS without changing product scope.                  |
| Network or storage found       | Remove offending code; do not justify it as convenience. |

Completion criteria: Test report exists with all required checks and no failing release gate.

---

M00 Milestone 10: Final Scope Audit And Cleanup

---

Purpose: Prevent late-stage drift into the wrong product.

| Task order | Task                                                                                   |
| ---------: | -------------------------------------------------------------------------------------- |
|          1 | Review `index.html` for out-of-scope controls or claims.                               |
|          2 | Review `script.js` for prohibited APIs and deferred feature logic.                     |
|          3 | Review `styles.css` for hidden required controls or inaccessible interactions.         |
|          4 | Confirm runtime files are still plain static files.                                    |
|          5 | Confirm no package/build files were added.                                             |
|          6 | Confirm generated code uses prefixed `nob.h` APIs only.                                |
|          7 | Confirm MSVC is not present in V1 controls, data model, fixtures, or generated output. |
|          8 | Confirm no URL state, local storage, telemetry, or remote dependency exists.           |
|          9 | Confirm no run/test/clean/static library/package/discovery code exists.                |
|         10 | Update decision log and test report with final status.                                 |

Likely files changed:

| File                                  | Expected change                       |
| ------------------------------------- | ------------------------------------- |
| `docs/product-spec/decision-log.md`   | Final implementation notes if needed. |
| `docs/product-spec/test-report-v1.md` | Final pass/fail decision.             |
| Runtime files                         | Only cleanup fixes.                   |

Audit checklist:

| Area               | Required result                            |
| ------------------ | ------------------------------------------ |
| Stack              | Plain HTML/CSS/JS only.                    |
| Runtime files      | `index.html`, `styles.css`, `script.js`.   |
| Generated artifact | One executable-oriented `nob.c`.           |
| API style          | Prefixed `nob.h` APIs only.                |
| Compiler scope     | V1 pinned compiler profiles only; no MSVC. |
| Persistence        | None.                                      |
| Network            | None.                                      |
| Backend            | None.                                      |
| Framework          | None.                                      |
| Deferred features  | Absent from UI and generated code.         |
| Preview primary    | First screen is still the tool.            |

Risks:

| Risk                              | Mitigation                                                                                                       |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Last-minute convenience additions | Delete or defer anything outside specs.                                                                          |
| Documentation drift               | Update decision log only for real implementation decisions; do not rewrite scope to justify accidental features. |

Completion criteria: Scope audit passes and `test-report-v1.md` records a pass decision.

---

N00 Final Done Criteria

---

V1 is done only when all criteria pass.

| Criterion                      | Required result                                                                                                                                                                                    |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Documentation gate             | Specs, decision log, and test report exist locally.                                                                                                                                                |
| Static runtime                 | App runs with `index.html`, `styles.css`, and `script.js` only.                                                                                                                                    |
| Default state                  | Page opens with valid generated `nob.c`.                                                                                                                                                           |
| Live preview                   | Valid control changes immediately update generated code and panels.                                                                                                                                |
| Validation                     | Blocking errors disable copy/download; warnings do not.                                                                                                                                            |
| Generated code                 | Uses pinned prefixed `nob.h` starter skeleton and no deferred features.                                                                                                                            |
| Fixtures                       | Required exact snapshots exist and match generator output.                                                                                                                                         |
| Copy                           | Copies only current valid generated `nob.c`.                                                                                                                                                       |
| Download                       | Downloads only current valid generated `nob.c` as `nob.c`.                                                                                                                                         |
| Assumptions                    | Clearly states `nob.h` availability, local-only behavior, executable-only V1, platform/compiler assumptions, no discovery, and manual editing.                                                     |
| Bootstrap                      | Shows compile and run build-program phases without package/discovery commands.                                                                                                                     |
| Security                       | User input cannot execute as HTML, JavaScript, shell syntax, or remote request.                                                                                                                    |
| Responsiveness                 | Required widths are usable.                                                                                                                                                                        |
| Accessibility basics           | Labels, focus, keyboard workflow, and status text pass.                                                                                                                                            |
| No prohibited runtime behavior | No backend, framework, bundler, telemetry, persistence, repo scanning, browser compilation, package management, run/test/clean, static library generation, URL state, local storage, or diff view. |
| Test report                    | Final release decision is `pass`.                                                                                                                                                                  |

---

O00 Stop Conditions During Autonomous Implementation

---

Codex must stop the current coding path and update documentation or repair the implementation when any of these occur.

| Stop condition                                                         | Required response                                                                                |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Required `nob.h` API is absent from the saved snapshot                 | Do not invent API usage. Update decision log and revise generator plan.                          |
| Generated C cannot be made valid under current skeleton                | Stop generator work and fix the template/spec mismatch.                                          |
| Need for MSVC behavior appears                                         | Do not implement MSVC. Keep it deferred.                                                         |
| Need for npm/framework/build tool appears                              | Do not add it. Rework in plain JS.                                                               |
| Need for backend/network appears                                       | Do not add it. Rework as local static behavior.                                                  |
| Need for persistence appears                                           | Do not add it. V1 resets on refresh.                                                             |
| Desire to add run/test/clean/static library/dependency feature appears | Do not add it. Record as deferred only if necessary.                                             |
| Copy/download can run while invalid                                    | Fix action guards before any other work.                                                         |
| User input reaches `innerHTML` or executable context                   | Replace with text-safe rendering before continuing.                                              |
| Test report has failing release gate                                   | Do not mark complete. Fix implementation or update specs only if the spec is demonstrably wrong. |

---

P00 Recommended Commit Or Save Points

---

Use these save points to keep implementation reviewable.

| Save point          | Contents                                       |
| ------------------- | ---------------------------------------------- |
| `docs-gate`         | Specs, decision log, test report template.     |
| `static-shell`      | HTML and CSS shell with no behavior.           |
| `state-validation`  | Defaults, normalization, validation, warnings. |
| `derived-panels`    | Assumptions, explanations, bootstrap.          |
| `generator-core`    | Deterministic `nob.c` generation and fixtures. |
| `actions-rendering` | Safe preview, status, copy, download.          |
| `qa-complete`       | Test report, final scope audit, cleanup.       |

If using version control, keep commits aligned with these save points. If not using version control, keep the same milestone boundaries in local notes or the test report.

