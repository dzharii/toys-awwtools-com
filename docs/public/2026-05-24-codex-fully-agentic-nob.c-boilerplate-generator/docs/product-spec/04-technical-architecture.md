---

A00 04 Technical Architecture

---

Document path: `docs/product-spec/04-technical-architecture.md`

This file defines the technical architecture for V1 of the `nob.h` / `nob.c` boilerplate generator. It controls static runtime constraints, file responsibilities, JavaScript state flow, generator responsibilities, renderer responsibilities, validation pipeline, browser API use, no-build constraints, non-functional constraints, and implementation boundaries.

This file does not define exact UI copy, exact generated `nob.c` text, exact validation regexes, exact compiler flag mappings, exact fixture contents, or visual design details. Those belong in separate specification files.

---

B00 Architecture Thesis

---

V1 must be a static browser application implemented with plain HTML, CSS, and JavaScript.

The architecture must center on a single configuration state. Every derived product surface must be computed from that state: validation results, warnings, assumptions, generated `nob.c`, bootstrap command text, preview status, and copy/download availability.

The implementation must not scatter generation logic across DOM event handlers. DOM event handlers may read input and trigger state updates, but code generation must happen in dedicated pure or mostly pure functions.

The implementation must remain understandable to a future maintainer opening the project without a framework, package manager, build step, or generated artifacts.

---

C00 Required Runtime Files

---

V1 must use these runtime files at the project root unless the implementation plan explicitly places them in a static directory:

| File         | Required responsibility                                                                                                                                                                                   |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index.html` | Semantic document structure, controls, preview containers, validation containers, assumptions container, bootstrap command container, copy/download buttons, no-script fallback, script/style references. |
| `styles.css` | Layout, typography, responsive behavior, visual states, focus states, code preview styling, form styling, no JavaScript logic.                                                                            |
| `script.js`  | State management, event binding, normalization, validation orchestration, code generation, assumptions generation, bootstrap command generation, rendering, copy/download actions.                        |

No additional runtime JavaScript or CSS files are required for V1. Additional local files may be added only if they improve maintainability without creating a build step or dependency chain.

If additional local JavaScript files are added, they must be plain local files and must not require bundling. The implementation must document why the split is needed.

---

D00 Prohibited Architecture

---

V1 must not use these architectural elements:

| Prohibited element            | Prohibited behavior                                                                                                                    |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Build tooling                 | No npm install, bundler, transpiler, minifier requirement, TypeScript compilation, Sass compilation, or generated asset pipeline.      |
| Framework runtime             | No React, Vue, Svelte, Angular, Solid, Lit dependency, or equivalent runtime component framework.                                      |
| Backend                       | No server-rendered generation, database, API service, authentication service, cloud storage, or server actions.                        |
| Remote dependencies           | No CDN scripts, CDN stylesheets, remote fonts, runtime fetches, analytics scripts, error-reporting scripts, or package registry calls. |
| Telemetry                     | No event tracking, page analytics, remote logging, fingerprinting, or beacon requests.                                                 |
| Browser execution of C        | No C compiler in browser, WebAssembly compiler runner, shell emulator, terminal, or execution of generated code.                       |
| Local filesystem write access | No File System Access API requirement and no writing directly into user folders.                                                       |
| Repository import             | No directory picker, source file upload, project parsing, repository scanning, or local file reading.                                  |

The app must work when opened from a local static server. It should also work from `file://` where browser security rules permit normal script execution and download behavior.

---

E00 index.html Responsibilities

---

`index.html` must contain the static document structure. It must not contain generated `nob.c` output hard-coded as the authoritative default. Default output must be generated by JavaScript from the default state.

`index.html` must include these structural regions:

| Region                  | Required element behavior                                                                                      |
| ----------------------- | -------------------------------------------------------------------------------------------------------------- |
| Header                  | Product name, concise purpose text, local-only or unofficial-status note if included.                          |
| Main tool container     | Contains configuration controls and preview area.                                                              |
| Project controls        | Contains project name and target executable name controls.                                                     |
| Sources/output controls | Contains source files and output directory controls.                                                           |
| Compiler controls       | Contains platform assumption, compiler profile, compiler command, build profile, and warning profile controls. |
| Advanced controls       | Contains include paths, library flags, self-rebuild, and comment verbosity controls.                           |
| Validation container    | Receives validation errors and warnings from JavaScript.                                                       |
| Assumptions container   | Receives assumptions from JavaScript.                                                                          |
| Bootstrap container     | Receives bootstrap command text from JavaScript.                                                               |
| Preview container       | Contains generated code text element, preview status, copy button, and download button.                        |
| No-script fallback      | States that JavaScript is required for live generation.                                                        |

`index.html` must use real form controls where possible: `input`, `textarea`, `select`, and `button`.

Every input must have a stable `id` and an associated `label`.

Elements that JavaScript reads or writes must have stable selectors. Prefer `id` attributes for unique controls and output containers.

`index.html` must not include inline event handler attributes such as `onclick`, `oninput`, or `onchange`. Event binding belongs in `script.js`.

`index.html` must not include inline scripts except for an optional minimal boot guard if explicitly justified. Preferred implementation is a single external `script.js` loaded with `defer`.

---

F00 styles.css Responsibilities

---

`styles.css` must own presentation only.

`styles.css` must define:

| Area          | Required CSS responsibility                                                                                    |
| ------------- | -------------------------------------------------------------------------------------------------------------- |
| Base layout   | Page spacing, font stacks, root colors, box sizing.                                                            |
| Tool layout   | Desktop two-column layout and single-column responsive layout.                                                 |
| Form controls | Label spacing, input sizing, disabled states, helper text, field error presentation.                           |
| Preview       | Code container layout, monospace font stack, whitespace preservation, horizontal overflow within preview only. |
| Status states | Distinct styling for ready, needs changes, copied, downloaded, copy failed, download failed.                   |
| Validation    | Error, warning, and assumption presentation.                                                                   |
| Buttons       | Normal, hover, focus, active, disabled states.                                                                 |
| Accessibility | Visible focus outlines, sufficient spacing, reduced-motion handling if animations exist.                       |

`styles.css` must not hide core controls or generated preview on small screens.

`styles.css` must not rely on color alone to communicate state. Error, warning, and success states must also have text labels or visible icons if icons are local and accessible.

`styles.css` must not import remote fonts or remote stylesheets.

---

G00 script.js Top-Level Responsibilities

---

`script.js` must own all runtime behavior.

At minimum, `script.js` must implement these responsibility groups:

| Responsibility group | Required behavior                                                                               |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| Constants            | Define allowed enum values, default state, UI selector map, and fixed text labels.              |
| DOM lookup           | Resolve and validate required DOM references during initialization.                             |
| Event binding        | Attach input/change/click listeners to controls and actions.                                    |
| State reading        | Read raw values from DOM controls.                                                              |
| Normalization        | Convert raw values into normalized configuration values.                                        |
| Validation           | Produce blocking errors and nonblocking warnings.                                               |
| Derivation           | Produce assumptions, bootstrap command text, and generated output.                              |
| Rendering            | Update DOM text, status, validation, assumptions, bootstrap command, buttons, and field states. |
| Actions              | Copy generated code and download generated code.                                                |
| Error handling       | Catch generation/rendering/action failures and show safe user-visible failures.                 |

`script.js` must not perform network requests.

`script.js` must not read local files.

`script.js` must not store user data remotely.

`script.js` must not use browser storage in V1 unless a later specification explicitly permits local persistence. This means no `localStorage`, `sessionStorage`, IndexedDB, cookies, or URL query state for configuration persistence in V1.

---

H00 Required JavaScript Function Boundaries

---

The implementation must include clear function boundaries equivalent to the following. Exact function names may differ, but each responsibility must exist as a distinct unit.

| Function responsibility  | Required input                                 | Required output                            | Required constraints                                                       |
| ------------------------ | ---------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------- |
| `getDefaultConfig`       | None                                           | Default configuration object               | Must return a valid default state. Must not read DOM.                      |
| `readConfigFromDom`      | DOM references                                 | Raw configuration object                   | Must read only current control values. Must not validate or generate code. |
| `normalizeConfig`        | Raw configuration object                       | Normalized configuration object            | Must trim and parse values. Must not mutate DOM.                           |
| `validateConfig`         | Normalized configuration object                | Validation result with errors and warnings | Must not generate code. Must not mutate DOM.                               |
| `deriveAssumptions`      | Normalized configuration and validation result | List of assumption items                   | Must not mutate DOM.                                                       |
| `deriveBootstrapCommand` | Normalized configuration and validation result | Bootstrap command model or message         | Must not mutate DOM.                                                       |
| `generateNobC`           | Normalized valid configuration                 | Generated `nob.c` string                   | Must be deterministic. Must not read DOM. Must not mutate DOM.             |
| `renderApp`              | Full derived application model                 | None                                       | Must update DOM only from supplied model.                                  |
| `renderValidation`       | Validation result                              | None                                       | Must update validation UI and field messages.                              |
| `renderPreview`          | Generated output and status                    | None                                       | Must use text-safe rendering.                                              |
| `copyGeneratedCode`      | Generated output string                        | Success/failure result                     | Must copy only generated code. Must not send data.                         |
| `downloadGeneratedCode`  | Generated output string and filename           | Success/failure result if detectable       | Must download only generated code. Must not send data.                     |
| `handleConfigChange`     | Event or none                                  | None                                       | Must run the state pipeline and render.                                    |
| `handleCopyClick`        | Event                                          | None                                       | Must refuse copy if invalid.                                               |
| `handleDownloadClick`    | Event                                          | None                                       | Must refuse download if invalid.                                           |

The generator must not be implemented as string concatenation inside event handlers.

The renderer must not recompute business logic that belongs to validation or generation.

The validator must not update DOM directly.

---

I00 Application Data Flow

---

All normal input changes must use this pipeline:

```txt
DOM input changes
readConfigFromDom
normalizeConfig
validateConfig
deriveAssumptions
deriveBootstrapCommand
generateNobC only if no blocking errors
build render model
renderApp
```

Copy and download actions must use the latest application model. They must not independently regenerate a different output from stale DOM values.

The application must keep an in-memory `currentModel` or equivalent object containing at least:

| Model field     | Required purpose                                                                          |
| --------------- | ----------------------------------------------------------------------------------------- |
| `rawConfig`     | Last raw values read from DOM.                                                            |
| `config`        | Last normalized config.                                                                   |
| `validation`    | Current errors and warnings.                                                              |
| `assumptions`   | Current assumptions list.                                                                 |
| `bootstrap`     | Current bootstrap command model or message.                                               |
| `generatedCode` | Current valid generated `nob.c` string, or last safe output if current config is invalid. |
| `isValid`       | Boolean derived from validation errors.                                                   |
| `status`        | Current preview/action status.                                                            |

If current input is invalid, the model must make that explicit through `isValid` and `validation.errors`. Copy/download must consult `isValid`, not only button disabled state.

---

J00 Configuration State Rules

---

Configuration state must be plain JavaScript data. It must not be stored as DOM elements, serialized HTML, or hidden fields as the authoritative state.

The normalized configuration object must contain only values needed for generation, validation, assumptions, and bootstrap output.

Arrays must be used for multi-value fields after normalization: source files, include paths, and library flags.

Enum-like fields must use fixed string values. Examples include platform assumption, compiler profile, build profile, warning profile, and comment verbosity.

Boolean fields must use actual booleans. Self-rebuild must be stored as a boolean.

The implementation must not infer hidden configuration from CSS classes or UI text.

---

K00 Validation Pipeline Requirements

---

Validation must be a deterministic function of normalized configuration.

Validation output must contain two separate collections:

| Collection | Required use                                                    |
| ---------- | --------------------------------------------------------------- |
| `errors`   | Blocking issues that disable copy/download.                     |
| `warnings` | Nonblocking issues that remain visible but allow copy/download. |

Each validation message object must include at least:

| Field      | Required purpose                                                    |
| ---------- | ------------------------------------------------------------------- |
| `field`    | Field or area affected, such as `sourceFiles` or `compilerCommand`. |
| `severity` | `error` or `warning`.                                               |
| `message`  | User-visible message.                                               |
| `code`     | Stable internal string for testing and rendering decisions.         |

Validation must run on every configuration change.

Validation must not depend on browser, OS, current date, network availability, local files, installed compilers, or actual existence of paths.

Validation must not call generation functions.

---

L00 Generator Architecture

---

The `nob.c` generator must be composed of named block functions or equivalent explicit sections.

Required generator sections:

| Generator section           | Required output responsibility                                                |
| --------------------------- | ----------------------------------------------------------------------------- |
| Header comment block        | Optional or concise generated assumptions, depending on comment verbosity.    |
| Preprocessor block          | Required `#define NOB_IMPLEMENTATION` and `#include "nob.h"`.                 |
| Main function start         | Required `int main(int argc, char **argv)` or equivalent supported signature. |
| Self-rebuild block          | Included only when self-rebuild is enabled.                                   |
| Directory preparation block | Creates or prepares output directory when required by generated template.     |
| Command declaration block   | Declares a `Nob_Cmd` command.                                                 |
| Compiler argument block     | Adds compiler command and compiler/profile flags.                             |
| Include path block          | Adds include path arguments when configured.                                  |
| Source file block           | Adds source file arguments in configured order.                               |
| Output target block         | Adds output path argument.                                                    |
| Library/linker block        | Adds library flags when configured.                                           |
| Command execution block     | Runs command and returns nonzero on failure.                                  |
| Main function end           | Closes function.                                                              |

Each generator section must be deterministic.

Each generator section must receive normalized values. It must not read DOM.

Each generator section must escape or receive already-escaped C string content according to the validation and escaping specification.

If generation encounters an unexpected unsupported state, it must throw or return a structured generation failure that disables copy/download. It must not emit knowingly malformed C.

---

M00 Rendering Architecture

---

Rendering must update the DOM from a derived application model.

Generated code must be rendered using `textContent` or an equivalent safe text-only API. It must not use `innerHTML` with generated code or user-provided values.

Validation messages may be created using DOM methods such as `createElement` and `textContent`. If `innerHTML` is used for static trusted markup, it must not include user-provided values or generated code.

Rendering must update:

| Render target      | Required behavior                                                         |
| ------------------ | ------------------------------------------------------------------------- |
| Code preview       | Display current generated output or last safe output with invalid status. |
| Preview status     | Display current status text.                                              |
| Copy button        | Enabled only when current model is valid and generated output exists.     |
| Download button    | Enabled only when current model is valid and generated output exists.     |
| Validation summary | Display current errors and warnings.                                      |
| Field messages     | Display field-level errors where practical.                               |
| Assumptions panel  | Display current assumptions.                                              |
| Bootstrap panel    | Display current bootstrap command or validation-dependent message.        |
| Advanced summary   | If collapsed, reflect active advanced values and errors.                  |

Rendering must be idempotent. Rendering the same model twice must produce the same visible state.

---

N00 Copy Architecture

---

The copy action must use the Clipboard API when available.

The copy function must receive the generated code string. It must not read code text back from the DOM as the authoritative source.

If the Clipboard API succeeds, the application must set status to `copied` and render success feedback.

If the Clipboard API fails or is unavailable, the application must set status to `copyFailed`, render a visible failure message, and leave the code preview selectable.

The copy function must not use external libraries.

The copy function must not send generated code over the network.

The implementation may provide a manual fallback instruction, such as selecting the preview manually, but must not require a remote service.

---

O00 Download Architecture

---

The download action must create a local download from the generated code string.

Preferred V1 implementation:

```txt
Create Blob from generated code.
Create object URL.
Create temporary anchor with download attribute.
Trigger click.
Revoke object URL.
Remove temporary anchor.
```

The downloaded filename must default to `nob.c` unless a later spec changes it.

The download MIME type should be `text/x-csrc` or `text/plain`. If browser behavior is inconsistent, `text/plain` is acceptable.

The download function must receive the generated code string. It must not read code text back from the DOM as the authoritative source.

If a detectable failure occurs, the application must set status to `downloadFailed`.

The download function must not send generated code over the network.

---

P00 Browser API Use

---

Permitted browser APIs in V1:

| API                 | Permitted use                                          |
| ------------------- | ------------------------------------------------------ |
| DOM APIs            | Read controls, update UI, create validation messages.  |
| Clipboard API       | Copy generated `nob.c` text.                           |
| Blob API            | Create downloadable file content.                      |
| URL.createObjectURL | Create temporary download URL for Blob.                |
| setTimeout          | Clear temporary status messages if needed.             |
| matchMedia          | Respect reduced-motion preference if animations exist. |

Prohibited browser APIs in V1:

| API                                         | Prohibited use                                         |
| ------------------------------------------- | ------------------------------------------------------ |
| fetch/XMLHttpRequest                        | No network requests.                                   |
| WebSocket/EventSource                       | No remote communication.                               |
| localStorage/sessionStorage                 | No persistence in V1.                                  |
| IndexedDB                                   | No persistence in V1.                                  |
| Cookies                                     | No persistence or tracking.                            |
| File System Access API                      | No direct filesystem writes or directory picking.      |
| FileReader for project import               | No local project or file import.                       |
| Service workers                             | No offline cache layer in V1.                          |
| WebAssembly compiler/runtime                | No browser compilation or execution of generated code. |
| Geolocation/notifications/camera/microphone | No unrelated permissions.                              |

---

Q00 Error Handling Architecture

---

The implementation must catch errors in initialization, generation, rendering, copy, and download actions.

Initialization failure must produce a visible page-level error and disable copy/download if controls are rendered.

Generation failure must produce a blocking error state and disable copy/download.

Rendering failure may be unrecoverable, but the implementation should avoid partial misleading states. If possible, show a visible failure message.

Copy failure must not change generated output. It must only update status and feedback.

Download failure must not change generated output. It must only update status and feedback.

Errors must not be sent to any remote logging service.

Error messages must not include unnecessary implementation stack traces in user-facing UI.

Console logging is permitted during development, but the final V1 implementation should not rely on console logs for user-visible behavior.

---

R00 Non-Functional Constraints

---

The app must load and run without a build step.

The app must not require network access after files are present locally.

The app must keep interaction latency low. For normal input sizes, code preview updates should feel immediate. A practical target is under 100 ms per update on a typical modern desktop browser.

The app must handle practical input sizes without freezing. V1 should handle at least:

| Input                   | Minimum practical support |
| ----------------------- | ------------------------- |
| Source files            | 50 entries.               |
| Include paths           | 30 entries.               |
| Library flags           | 30 entries.               |
| Individual path length  | 200 characters.           |
| Generated output length | 50 KB.                    |

The app does not need to support unbounded input. If input exceeds practical limits defined in validation specs, the validator may produce blocking errors.

The app must avoid memory leaks from download object URLs by revoking temporary URLs after use.

The app must not use timers or background work for generation except temporary status reset timers.

---

S00 Initialization Sequence

---

The required initialization sequence is:

```txt
Wait for DOMContentLoaded or use defer script after DOM.
Resolve required DOM elements.
If required elements are missing, show initialization failure.
Create default configuration.
Write default configuration into controls if needed.
Run full update pipeline.
Bind control event listeners.
Bind copy/download event listeners.
Mark app initialized.
```

If event listeners are bound before the first render, the implementation must still avoid duplicate rendering side effects.

The initialization sequence must not request permissions.

The initialization sequence must not read from browser storage.

The initialization sequence must not fetch remote resources.

---

T00 Event Handling Requirements

---

Text controls should use `input` events.

Select controls should use `change` events.

Checkboxes and toggles should use `change` events.

Copy and download buttons must use `click` events and must also be keyboard-operable by being real buttons.

Event handlers must be thin. They should delegate to named functions such as `handleConfigChange`, `handleCopyClick`, and `handleDownloadClick`.

Event handlers must prevent default behavior only when necessary.

The implementation must avoid duplicate listeners during initialization. Initialization must run once.

---

U00 Safe Rendering Requirements

---

Generated code must be inserted into preview using:

```txt
codeElement.textContent = generatedCode
```

or an equivalent text-only operation.

User-provided values displayed in validation messages, assumptions, summaries, or status text must also be inserted using text-safe APIs.

The implementation must not build user-visible HTML strings containing user input.

If lists are rendered, create list item elements and set `textContent`.

If the implementation includes syntax highlighting later, it must not compromise the text-safety rule. V1 does not require syntax highlighting.

---

V00 Static Deployment Requirements

---

The completed V1 must be deployable by copying static files to a static host or opening them from a simple local static server.

Required deployable files:

```txt
index.html
styles.css
script.js
```

Documentation files may exist but are not required at runtime.

The page must not depend on a generated bundle file.

The page must not depend on hidden setup commands.

The page must not require environment variables.

---

W00 Implementation Edge Cases

---

If a required DOM element is missing, initialization must fail visibly rather than silently leaving a broken page.

If normalization produces arrays with blank entries, blank entries must be removed before validation and generation.

If current state is invalid, copy/download must be blocked even if buttons are accidentally enabled due to a rendering bug. Action handlers must check model validity.

If generated output is empty in a supposedly valid state, copy/download must be blocked and a generation failure must be shown.

If a user edits an input after copy/download success, the status must return to ready or needs changes based on validation.

If download object URL creation fails, show download failure.

If Clipboard API is unavailable or denied, show copy failure and leave code selectable.

If the browser blocks programmatic download, show download failure if detectable.

If the app is opened from `file://`, it must not require APIs that fail only because no server is present, except where browser clipboard restrictions are unavoidable and handled with visible feedback.

---

X00 Technical Acceptance Criteria

---

The technical architecture is acceptable only if all criteria in this section pass.

| Criterion                       | Pass condition                                                                                                          |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Static files                    | Runtime uses `index.html`, `styles.css`, and `script.js` with no required build step.                                   |
| No remote dependencies          | Application makes no network requests and imports no remote scripts, styles, fonts, or data.                            |
| Single state source             | Generated code, assumptions, bootstrap text, validation, and button states derive from one current configuration model. |
| Thin event handlers             | Event handlers delegate to named functions and do not contain code-generation templates.                                |
| Dedicated generator             | Generated `nob.c` is produced by dedicated generator functions, not DOM event handlers.                                 |
| Dedicated validator             | Validation is performed by dedicated validation functions and returns structured errors/warnings.                       |
| Safe rendering                  | Generated code and user-provided values are rendered with text-safe APIs.                                               |
| Copy exactness                  | Copy action uses the current generated code string from the model.                                                      |
| Download exactness              | Download action uses the current generated code string from the model.                                                  |
| Action guard                    | Copy/download handlers refuse action when current model is invalid.                                                     |
| No prohibited APIs              | V1 does not use prohibited browser APIs or architecture elements.                                                       |
| Initialization failure handling | Missing DOM elements or generation failure produce visible failure states.                                              |
| Object URL cleanup              | Download implementation revokes temporary object URLs after use.                                                        |
| Deterministic generation        | Same normalized configuration produces same generated output.                                                           |

---

Y00 Definition Of Done For This Specification File

---

This file is complete when it defines runtime files, prohibited architecture, file responsibilities, JavaScript function boundaries, application data flow, configuration state rules, validation pipeline, generator architecture, rendering architecture, copy/download architecture, browser API use, error handling, non-functional constraints, initialization sequence, event handling, safe rendering, static deployment requirements, edge cases, and technical acceptance criteria.

This file intentionally does not define exact generated `nob.c` text, exact validation rules, exact visual design, exact compiler mappings, fixture outputs, or implementation task order.

