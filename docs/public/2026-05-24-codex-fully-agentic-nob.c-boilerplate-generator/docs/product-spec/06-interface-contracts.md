---

A00 06 Interface Contracts

---

Document path: `docs/product-spec/06-interface-contracts.md`

This file defines the internal JavaScript contracts and generated `nob.c` template contract for V1 of the `nob.h` / `nob.c` boilerplate generator. It specifies function signatures, input/output shapes, event flow, validation result shape, render contract, copy/download contract, fixture contract, and required generated C sections.

This file is binding for implementation. If implementation names differ from the names in this document, the implementation must still provide equivalent responsibilities, inputs, outputs, and failure behavior.

This file does not define exact UI layout, exact CSS, exact final generated C text, exact compiler flag values, or exact expected fixture output files.

---

B00 Contract Principles

---

All contracts must use plain JavaScript values. No contract may require TypeScript, build tooling, npm packages, runtime frameworks, remote APIs, browser storage, or server-side code.

Generation, validation, assumptions, bootstrap output, copy/download actions, and rendering must flow from one normalized configuration model.

Functions that compute data must not mutate DOM.

Functions that render DOM must not recompute business logic.

Functions that copy or download output must use the current generated code string from the app model, not text read back from the DOM.

The generated `nob.c` contract must be conservative. It must use prefixed `nob.h` APIs, assume `#include "nob.h"` works, and generate executable-oriented starter code only.

---

C00 Type Notation

---

This document uses TypeScript-like notation only to specify contracts. The V1 implementation must remain plain JavaScript.

Contract notation:

```js
type Name = {
  field: string
}
```

This notation does not permit adding TypeScript compilation, transpilation, or generated type artifacts.

---

D00 RawConfig Contract

---

`RawConfig` represents untrusted values read from DOM controls.

Required shape:

```js
{
  projectName: string,
  targetName: string,
  sourceFilesText: string,
  outputDirectory: string,
  platformProfile: string,
  compilerProfile: string,
  compilerCommand: string,
  buildProfile: string,
  warningProfile: string,
  includePathsText: string,
  libraryFlagsText: string,
  selfRebuild: boolean,
  commentStyle: string
}
```

Contract rules:

| Rule           | Requirement                                                                                            |
| -------------- | ------------------------------------------------------------------------------------------------------ |
| Source         | `RawConfig` must come from DOM controls or default values.                                             |
| Trust level    | All string fields must be treated as untrusted.                                                        |
| Text fields    | Text fields must not be assumed trimmed or valid.                                                      |
| Boolean fields | `selfRebuild` must be a boolean, not `"true"` or `"false"`.                                            |
| Exclusions     | `RawConfig` must not contain DOM nodes, events, generated code, validation messages, or rendered HTML. |

---

E00 Config Contract

---

`Config` represents normalized values used by validation, derivation, and generation.

Required shape:

```js
{
  projectName: string,
  targetName: string,
  sourceFiles: string[],
  outputDirectory: string,
  platformProfile: "unix" | "windows",
  compilerProfile: "gcc-clang" | "msvc",
  compilerCommand: string,
  buildProfile: "debug" | "release",
  warningProfile: "normal" | "strict",
  includePaths: string[],
  libraryFlags: string[],
  selfRebuild: boolean,
  commentStyle: "concise" | "minimal"
}
```

Contract rules:

| Rule          | Requirement                                                                                                                                                                            |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Normalization | Single-value strings must be trimmed.                                                                                                                                                  |
| Lists         | Multiline fields must be parsed into arrays, blank entries removed, and order preserved.                                                                                               |
| Enums         | Enum fields must preserve raw enum strings for validation. Unknown values must be allowed to reach validation as invalid values or represented in a separate invalid-normalized state. |
| No mutation   | Functions receiving `Config` must not mutate it.                                                                                                                                       |
| Determinism   | Same `Config` must produce same validation results, assumptions, bootstrap commands, and generated code.                                                                               |

Implementation may use runtime checks instead of TypeScript types.

---

F00 ValidationMessage Contract

---

Each validation message must have this shape:

```js
{
  code: string,
  field: string,
  severity: "error" | "warning",
  message: string
}
```

Required fields:

| Field      | Requirement                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| `code`     | Stable identifier for tests and rendering. Must be ASCII lowercase with words separated by underscores. |
| `field`    | Must match a known field identifier or known derived area.                                              |
| `severity` | Must be exactly `error` or `warning`.                                                                   |
| `message`  | User-visible text. Must explain what is wrong or what caveat applies.                                   |

Allowed `field` values:

```txt
projectName
targetName
sourceFiles
outputDirectory
platformProfile
compilerProfile
compilerCommand
buildProfile
warningProfile
includePaths
libraryFlags
selfRebuild
commentStyle
generation
bootstrap
copy
download
application
```

Validation messages must not contain HTML.

Validation messages must not include stack traces.

Validation messages must not claim local files, compilers, libraries, or SDKs were checked.

---

G00 ValidationResult Contract

---

`ValidationResult` must have this shape:

```js
{
  errors: ValidationMessage[],
  warnings: ValidationMessage[]
}
```

Contract rules:

| Rule                 | Requirement                                                                    |
| -------------------- | ------------------------------------------------------------------------------ |
| Blocking behavior    | `errors.length > 0` means generated output is not valid for copy/download.     |
| Nonblocking behavior | `warnings.length > 0` must not block copy/download when `errors.length === 0`. |
| Message separation   | Errors must appear only in `errors`; warnings must appear only in `warnings`.  |
| Ordering             | Messages must be ordered by field order, then by rule order within each field. |
| Determinism          | Same normalized config must produce same message objects in same order.        |

Required message code examples:

```txt
project_name_required
target_name_required
source_files_required
compiler_command_required
output_directory_required
unknown_platform_profile
unknown_compiler_profile
unknown_build_profile
unknown_warning_profile
unknown_comment_style
source_file_duplicate
include_path_duplicate
library_flag_duplicate
self_rebuild_disabled
generation_failed
```

The exact complete list may be expanded by the validation specification, but codes must remain stable once used by fixtures.

---

H00 DerivedValues Contract

---

`DerivedValues` contains deterministic values computed from `Config`.

Required shape:

```js
{
  executableFileName: string,
  executableOutputPath: string,
  outputDirectoryRequired: boolean,
  warningFlags: string[],
  buildFlags: string[],
  compilerFlags: string[],
  includeArgs: string[],
  libraryArgs: string[],
  platformAssumptionLabel: string,
  compilerAssumptionLabel: string,
  bootstrapCommands: string[],
  assumptions: string[],
  explanations: ExplanationItem[]
}
```

`ExplanationItem` shape:

```js
{
  code: string,
  title: string,
  text: string
}
```

Contract rules:

| Rule                     | Requirement                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------- |
| Derived only             | Values must be computed from `Config`, not edited directly by users.                              |
| No environment detection | Must not use browser OS, user agent, current date, installed tools, network, or local filesystem. |
| Stable order             | Arrays must preserve defined order.                                                               |
| Explanations             | Explanation text must be concise and must not alter generated code.                               |

Allowed explanation codes:

```txt
nob_implementation
nob_include
self_rebuild
output_directory
command_construction
source_files
include_paths
library_flags
failure_return
```

---

I00 AppStatus Contract

---

`AppStatus` must be one of these exact strings:

```js
"ready"
"needsChanges"
"copied"
"downloaded"
"copyFailed"
"downloadFailed"
"generationFailed"
"initializationFailed"
```

Status meanings:

| Status                 | Meaning                                                                    |
| ---------------------- | -------------------------------------------------------------------------- |
| `ready`                | Current config has no blocking errors and generated code is available.     |
| `needsChanges`         | Current config has blocking validation errors.                             |
| `copied`               | Copy action succeeded for the current generated code.                      |
| `downloaded`           | Download action was initiated or succeeded for the current generated code. |
| `copyFailed`           | Copy action failed.                                                        |
| `downloadFailed`       | Download action failed or could not be initiated.                          |
| `generationFailed`     | Code generation failed despite attempted valid config.                     |
| `initializationFailed` | Required initialization failed, such as missing DOM elements.              |

Any configuration change must clear `copied`, `downloaded`, `copyFailed`, and `downloadFailed` into either `ready` or `needsChanges`.

---

J00 AppModel Contract

---

`AppModel` represents the complete derived runtime state used for rendering and actions.

Required shape:

```js
{
  rawConfig: RawConfig,
  config: Config,
  validation: ValidationResult,
  derived: DerivedValues,
  isValid: boolean,
  generatedCode: string,
  lastValidGeneratedCode: string,
  status: AppStatus
}
```

Contract rules:

| Rule              | Requirement                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------- |
| Validity          | `isValid` must equal `validation.errors.length === 0`.                                            |
| Generated code    | `generatedCode` must contain current generated output only when generation succeeds.              |
| Last valid output | `lastValidGeneratedCode` may retain previous valid output for safe preview during invalid states. |
| Action source     | Copy/download must use `generatedCode` only when `isValid === true`.                              |
| Invalid state     | If `isValid === false`, copy/download must be blocked even if `generatedCode` is nonempty.        |
| Failure state     | If generation fails, `status` must be `generationFailed` and copy/download must be blocked.       |

---

K00 DOMRefs Contract

---

`DOMRefs` must contain all DOM elements required by runtime behavior.

Required shape may be implemented as:

```js
{
  form: HTMLFormElement | HTMLElement,
  projectName: HTMLInputElement,
  targetName: HTMLInputElement,
  sourceFilesText: HTMLTextAreaElement,
  outputDirectory: HTMLInputElement,
  platformProfile: HTMLSelectElement,
  compilerProfile: HTMLSelectElement,
  compilerCommand: HTMLInputElement,
  buildProfile: HTMLSelectElement,
  warningProfile: HTMLSelectElement,
  includePathsText: HTMLTextAreaElement,
  libraryFlagsText: HTMLTextAreaElement,
  selfRebuild: HTMLInputElement,
  commentStyle: HTMLSelectElement,
  previewCode: HTMLElement,
  previewStatus: HTMLElement,
  validationSummary: HTMLElement,
  assumptionsList: HTMLElement,
  bootstrapCommands: HTMLElement,
  explanationsList: HTMLElement,
  copyButton: HTMLButtonElement,
  downloadButton: HTMLButtonElement,
  appMessage: HTMLElement
}
```

Contract rules:

| Rule              | Requirement                                                         |
| ----------------- | ------------------------------------------------------------------- |
| Required lookup   | Initialization must verify all required refs exist.                 |
| Missing refs      | Missing required refs must produce `initializationFailed`.          |
| Stable selectors  | DOM refs must be resolved using stable ids or documented selectors. |
| No lazy surprises | Rendering must not assume optional refs unless it checks them.      |

---

L00 Function Contract: getDefaultConfig

---

Signature:

```js
function getDefaultConfig(): Config
```

Responsibilities:

| Requirement           | Behavior                                                           |
| --------------------- | ------------------------------------------------------------------ |
| Return valid default  | Must return the default config from the data model specification.  |
| No DOM access         | Must not read or write DOM.                                        |
| No mutation           | Must return a new object or an object never mutated by callers.    |
| Deterministic         | Must return equivalent values every time.                          |
| No environment access | Must not inspect browser, URL, local storage, OS, or current date. |

Failure behavior: must not fail during normal operation.

---

M00 Function Contract: configToRawConfig

---

Signature:

```js
function configToRawConfig(config: Config): RawConfig
```

Purpose: Convert default or fixture `Config` into values that can populate form controls.

Responsibilities:

| Requirement     | Behavior                                                          |
| --------------- | ----------------------------------------------------------------- |
| Lists to text   | Join `sourceFiles`, `includePaths`, and `libraryFlags` with `\n`. |
| Booleans        | Preserve `selfRebuild` as boolean.                                |
| Enums           | Preserve enum values as strings.                                  |
| No validation   | Must not validate.                                                |
| No DOM mutation | Must not write controls directly.                                 |

This function is optional if defaults are written manually, but equivalent behavior must exist.

---

N00 Function Contract: readConfigFromDom

---

Signature:

```js
function readConfigFromDom(refs: DOMRefs): RawConfig
```

Responsibilities:

| Requirement           | Behavior                               |
| --------------------- | -------------------------------------- |
| Read current controls | Read all required form controls.       |
| Preserve raw text     | Do not trim or normalize.              |
| Checkbox              | Read `selfRebuild.checked` as boolean. |
| Selects               | Read selected string values.           |
| No validation         | Must not validate or generate.         |
| No rendering          | Must not update DOM.                   |

Failure behavior: if refs are invalid or missing, throw an initialization or application error handled by the caller.

---

O00 Function Contract: normalizeConfig

---

Signature:

```js
function normalizeConfig(raw: RawConfig): Config
```

Responsibilities:

| Requirement            | Behavior                                                                |
| ---------------------- | ----------------------------------------------------------------------- |
| Trim single strings    | Trim `projectName`, `targetName`, `outputDirectory`, `compilerCommand`. |
| Parse lists            | Parse `sourceFilesText`, `includePathsText`, and `libraryFlagsText`.    |
| Preserve unknown enums | Keep unknown enum strings so validation can reject them.                |
| Preserve list order    | Do not sort or deduplicate.                                             |
| No validation messages | Must not create validation messages.                                    |
| No DOM access          | Must not read or write DOM.                                             |

List parsing algorithm:

```txt
Split on CRLF, LF, or CR.
Trim each line.
Remove blank lines.
Return remaining lines in original order.
```

---

P00 Function Contract: validateConfig

---

Signature:

```js
function validateConfig(config: Config): ValidationResult
```

Responsibilities:

| Requirement           | Behavior                                                                    |
| --------------------- | --------------------------------------------------------------------------- |
| Validate fields       | Apply required field, enum, list, length, character, and cross-field rules. |
| Split severities      | Put blocking issues in `errors` and nonblocking caveats in `warnings`.      |
| Stable order          | Return messages in deterministic field/rule order.                          |
| Stable codes          | Use stable message codes.                                                   |
| No generation         | Must not call `generateNobC`.                                               |
| No DOM access         | Must not read or write DOM.                                                 |
| No environment access | Must not check filesystem, installed compiler, OS, or network.              |

Failure behavior: must not throw for normal invalid input. It must return structured errors.

---

Q00 Function Contract: deriveValues

---

Signature:

```js
function deriveValues(config: Config, validation: ValidationResult): DerivedValues
```

Responsibilities:

| Requirement       | Behavior                                                               |
| ----------------- | ---------------------------------------------------------------------- |
| Executable naming | Derive executable filename and output path.                            |
| Flags             | Derive warning, build, compiler, include, and library argument arrays. |
| Labels            | Derive platform and compiler assumption labels.                        |
| Bootstrap         | Derive bootstrap command lines or empty commands when invalid.         |
| Assumptions       | Derive current assumptions text.                                       |
| Explanations      | Derive block-level explanations.                                       |
| No DOM access     | Must not read or write DOM.                                            |
| Deterministic     | Same input must return same output.                                    |

If validation has blocking errors, this function may still derive safe assumptions and labels, but it must not emit misleading bootstrap commands from invalid required values.

---

R00 Function Contract: generateNobC

---

Signature:

```js
function generateNobC(config: Config, derived: DerivedValues): string
```

Preconditions:

| Precondition     | Requirement                                                |
| ---------------- | ---------------------------------------------------------- |
| Valid config     | Must be called only when `validation.errors.length === 0`. |
| Normalized input | Must receive normalized config.                            |
| Derived values   | Must receive derived values from the same config.          |

Responsibilities:

| Requirement               | Behavior                                                               |
| ------------------------- | ---------------------------------------------------------------------- |
| Generate full file        | Return complete `nob.c` text.                                          |
| Use prefixed APIs         | Use prefixed `nob.h` API style only.                                   |
| Preserve order            | Preserve source, include, library, and flag order from derived values. |
| Include required sections | Emit all required C sections defined in this file.                     |
| Deterministic             | Same inputs must produce byte-identical output.                        |
| No DOM access             | Must not read or write DOM.                                            |
| No environment access     | Must not inspect browser, OS, network, date, or local files.           |
| No side effects           | Must not modify input objects.                                         |

Failure behavior: if called with an unsupported valid-looking state, it must throw a generation error or return through a structured failure path handled by `buildAppModel`. It must not return knowingly malformed C.

---

S00 Function Contract: buildAppModel

---

Signature:

```js
function buildAppModel(raw: RawConfig, previousModel?: AppModel): AppModel
```

Responsibilities:

| Step                | Required behavior                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------ |
| Normalize           | Call `normalizeConfig(raw)`.                                                                     |
| Validate            | Call `validateConfig(config)`.                                                                   |
| Derive              | Call `deriveValues(config, validation)`.                                                         |
| Generate if valid   | Call `generateNobC(config, derived)` only if no blocking errors.                                 |
| Preserve last valid | If current state is invalid, keep `previousModel.lastValidGeneratedCode` if available.           |
| Status              | Set `ready` when valid, `needsChanges` when invalid, or `generationFailed` if generation throws. |

Failure behavior:

| Failure                          | Required behavior                                                                                     |
| -------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Validation returns errors        | Return model with `isValid: false`, `status: "needsChanges"`.                                         |
| Generation throws                | Return model with blocking `generation_failed` error, `isValid: false`, `status: "generationFailed"`. |
| Unexpected normalization failure | Return model with application-level error and blocked actions.                                        |

---

T00 Function Contract: renderApp

---

Signature:

```js
function renderApp(model: AppModel, refs: DOMRefs): void
```

Responsibilities:

| Render target   | Required behavior                                                                                             |
| --------------- | ------------------------------------------------------------------------------------------------------------- |
| Preview code    | Render `model.generatedCode` if valid; otherwise render `model.lastValidGeneratedCode` or a safe placeholder. |
| Preview status  | Render status text derived from `model.status`.                                                               |
| Copy button     | Enable only if `model.isValid && model.generatedCode.length > 0`.                                             |
| Download button | Enable only if `model.isValid && model.generatedCode.length > 0`.                                             |
| Validation      | Render all errors and warnings.                                                                               |
| Field errors    | Render field-level messages where controls exist.                                                             |
| Assumptions     | Render `model.derived.assumptions`.                                                                           |
| Bootstrap       | Render `model.derived.bootstrapCommands` or validation-dependent message.                                     |
| Explanations    | Render `model.derived.explanations`.                                                                          |

Safety requirements:

| Rule                       | Requirement                                                        |
| -------------------------- | ------------------------------------------------------------------ |
| Code preview               | Must use `textContent` or equivalent text-only rendering.          |
| User values                | Must use text-safe rendering for any user-controlled value.        |
| No innerHTML for user data | Must not insert generated code or user inputs through `innerHTML`. |
| Idempotent                 | Rendering the same model twice must produce same visible state.    |

Failure behavior: rendering should not throw during normal operation. If required refs are missing, initialization should have already failed.

---

U00 Function Contract: handleConfigChange

---

Signature:

```js
function handleConfigChange(event?: Event): void
```

Responsibilities:

| Step                | Required behavior                                                                                                            |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Read                | Call `readConfigFromDom(refs)`.                                                                                              |
| Build               | Call `buildAppModel(raw, currentModel)`.                                                                                     |
| Clear action status | If previous status was copied, downloaded, copyFailed, or downloadFailed, replace with ready/needsChanges based on validity. |
| Store               | Update in-memory `currentModel`.                                                                                             |
| Render              | Call `renderApp(currentModel, refs)`.                                                                                        |

Failure behavior: if reading or model building fails unexpectedly, set a blocking application failure state and render it.

---

V00 Function Contract: copyGeneratedCode

---

Signature:

```js
async function copyGeneratedCode(code: string): Promise<ActionResult>
```

`ActionResult` shape:

```js
{
  ok: boolean,
  code: "copy_success" | "copy_failed",
  message: string
}
```

Responsibilities:

| Requirement     | Behavior                                                  |
| --------------- | --------------------------------------------------------- |
| Copy exact code | Copy only the supplied `code` string.                     |
| Clipboard API   | Use browser Clipboard API if available.                   |
| No DOM source   | Must not read preview DOM as authoritative source.        |
| No network      | Must not send data anywhere.                              |
| Failure         | Return `ok: false` if clipboard is unavailable or denied. |

The function must not mutate `currentModel` directly. The click handler updates model status based on result.

---

W00 Function Contract: handleCopyClick

---

Signature:

```js
async function handleCopyClick(event: Event): Promise<void>
```

Responsibilities:

| Step                   | Required behavior                                                                                        |
| ---------------------- | -------------------------------------------------------------------------------------------------------- |
| Prevent invalid action | If `currentModel.isValid` is false or `generatedCode` is empty, set status to `needsChanges` and render. |
| Copy                   | Call `copyGeneratedCode(currentModel.generatedCode)`.                                                    |
| Success                | Set status to `copied`.                                                                                  |
| Failure                | Set status to `copyFailed`.                                                                              |
| Render                 | Re-render after status update.                                                                           |

Must not copy assumptions, bootstrap commands, UI labels, or validation messages.

---

X00 Function Contract: downloadGeneratedCode

---

Signature:

```js
function downloadGeneratedCode(code: string, filename: string): ActionResult
```

Allowed action result codes:

```txt
download_started
download_failed
```

Responsibilities:

| Requirement         | Behavior                                                      |
| ------------------- | ------------------------------------------------------------- |
| Download exact code | Download only supplied `code`.                                |
| Default filename    | Use `nob.c` unless caller supplies another approved filename. |
| Blob                | Use Blob/object URL/download attribute.                       |
| Cleanup             | Revoke object URL after initiating download.                  |
| No DOM source       | Must not read preview DOM as authoritative source.            |
| No network          | Must not send data anywhere.                                  |

Failure behavior: return `ok: false` if Blob or object URL creation fails.

---

Y00 Function Contract: handleDownloadClick

---

Signature:

```js
function handleDownloadClick(event: Event): void
```

Responsibilities:

| Step                   | Required behavior                                                                                        |
| ---------------------- | -------------------------------------------------------------------------------------------------------- |
| Prevent invalid action | If `currentModel.isValid` is false or `generatedCode` is empty, set status to `needsChanges` and render. |
| Download               | Call `downloadGeneratedCode(currentModel.generatedCode, "nob.c")`.                                       |
| Success                | Set status to `downloaded`.                                                                              |
| Failure                | Set status to `downloadFailed`.                                                                          |
| Render                 | Re-render after status update.                                                                           |

Must not download assumptions, bootstrap commands, UI labels, or validation messages.

---

Z00 Function Contract: initializeApp

---

Signature:

```js
function initializeApp(): void
```

Responsibilities:

| Step             | Required behavior                                                                    |
| ---------------- | ------------------------------------------------------------------------------------ |
| Resolve refs     | Resolve required DOM elements.                                                       |
| Validate refs    | Fail visibly if any required ref is missing.                                         |
| Create defaults  | Get default config and write it into controls if controls are not already prefilled. |
| Build model      | Build initial model from DOM or default raw config.                                  |
| Bind listeners   | Bind control and action listeners once.                                              |
| Render           | Render initial model.                                                                |
| Mark initialized | Prevent duplicate initialization if called more than once.                           |

Failure behavior:

| Failure                    | Required behavior                             |
| -------------------------- | --------------------------------------------- |
| Missing DOM refs           | Show `initializationFailed`, disable actions. |
| Default generation failure | Show `generationFailed`, disable actions.     |
| Listener binding failure   | Show initialization failure if detectable.    |

Initialization must not request permissions, read storage, fetch network resources, or inspect local files.

---

AA00 Event Flow Contract

---

Required initialization event flow:

```txt
script loaded with defer
initializeApp()
resolve DOM refs
write or read default controls
build initial AppModel
render initial AppModel
bind input/change/click listeners
```

Required text input event flow:

```txt
user edits text input or textarea
input event fires
handleConfigChange
read raw config
normalize
validate
derive
generate if valid
render
```

Required select/toggle event flow:

```txt
user changes select, checkbox, or segmented control
change event fires
handleConfigChange
read raw config
normalize
validate
derive
generate if valid
render
```

Required copy event flow:

```txt
user activates Copy nob.c button
handleCopyClick
check current model validity
copy current generatedCode
set copied or copyFailed status
render
```

Required download event flow:

```txt
user activates Download nob.c button
handleDownloadClick
check current model validity
download current generatedCode as nob.c
set downloaded or downloadFailed status
render
```

Event handlers must not contain C template fragments.

Event handlers must not independently validate using ad hoc rules.

Event handlers must not write generated code directly except through `renderApp`.

---

AB00 Render Contract Details

---

`renderApp` must delegate or internally perform these render contracts.

`renderPreview(model, refs)`:

```js
function renderPreview(model: AppModel, refs: DOMRefs): void
```

Required behavior:

| Condition                       | Preview text                                                                        |
| ------------------------------- | ----------------------------------------------------------------------------------- |
| Valid with generated code       | `model.generatedCode`                                                               |
| Invalid with last valid code    | `model.lastValidGeneratedCode` plus visible needs-changes status outside code block |
| Invalid with no last valid code | Safe placeholder text such as `Fix validation errors to generate nob.c.`            |
| Generation failed               | Last valid code if available, otherwise safe placeholder                            |

The placeholder must not be copied or downloaded.

`renderValidation(model, refs)`:

```js
function renderValidation(model: AppModel, refs: DOMRefs): void
```

Required behavior:

| Requirement    | Behavior                                                  |
| -------------- | --------------------------------------------------------- |
| Errors         | Render all `validation.errors`.                           |
| Warnings       | Render all `validation.warnings`.                         |
| Empty state    | Show ready message or leave list empty with status ready. |
| Field messages | Place messages near matching fields where practical.      |

`renderActions(model, refs)`:

```js
function renderActions(model: AppModel, refs: DOMRefs): void
```

Required behavior:

| Condition                              | Copy/download state |
| -------------------------------------- | ------------------- |
| `model.isValid && model.generatedCode` | Enabled             |
| Otherwise                              | Disabled            |

---

AC00 Fixture Contract

---

Fixtures must test normalized configs, invalid raw configs, validation results, and generated output.

Fixture object shape:

```js
{
  id: string,
  name: string,
  rawConfig?: RawConfig,
  config?: Config,
  expectedValid: boolean,
  expectedErrorCodes: string[],
  expectedWarningCodes: string[],
  expectedDerived?: Partial<DerivedValues>,
  expectedGeneratedContains?: string[],
  expectedGeneratedNotContains?: string[]
}
```

Contract rules:

| Rule                      | Requirement                                                                                         |
| ------------------------- | --------------------------------------------------------------------------------------------------- |
| ID                        | Fixture `id` must be stable and ASCII lowercase with underscores.                                   |
| Raw or config             | Fixture must contain either `rawConfig` or `config`. Invalid input fixtures should use `rawConfig`. |
| Expected validity         | `expectedValid` must match validation errors.                                                       |
| Expected codes            | Expected error and warning codes must be explicit.                                                  |
| Contains checks           | Generated output checks must use stable substrings.                                                 |
| No snapshot-only reliance | Full snapshots may exist later, but fixtures must include targeted checks for required sections.    |

Minimum fixture ids:

```txt
default_unix_debug
unix_release_strict
multi_source_with_includes_and_libs
windows_gcc_style
windows_msvc_style
self_rebuild_disabled
minimal_comments
invalid_empty_sources
invalid_empty_target
invalid_quote_in_source
```

---

AD00 Generated nob.c Template Contract

---

The generated C file must be a complete `nob.c` text artifact.

Required generated sections in order:

| Order | Section                 | Required behavior                                                                         |
| ----: | ----------------------- | ----------------------------------------------------------------------------------------- |
|     1 | Optional header comment | Present in concise mode. Must state starter nature and no "do not edit" language.         |
|     2 | Implementation define   | Must include `#define NOB_IMPLEMENTATION` before including `nob.h`.                       |
|     3 | Include block           | Must include `#include "nob.h"`.                                                          |
|     4 | Blank separator         | Must keep sections readable.                                                              |
|     5 | Main function start     | Must define `int main(int argc, char **argv)` unless template spec changes it.            |
|     6 | Self-rebuild block      | Must appear near the top of `main` when enabled.                                          |
|     7 | Output directory block  | Must prepare output directory when `outputDirectoryRequired` is true.                     |
|     8 | Command declaration     | Must declare a `Nob_Cmd` command initialized to zero or equivalent supported initializer. |
|     9 | Compiler command block  | Must append compiler command and flags.                                                   |
|    10 | Include path block      | Must append include args if present.                                                      |
|    11 | Source file block       | Must append source files in configured order.                                             |
|    12 | Output target block     | Must append output argument and executable output path.                                   |
|    13 | Library flags block     | Must append library args if present.                                                      |
|    14 | Command run block       | Must run command and return nonzero on failure.                                           |
|    15 | Success return          | Must return zero on success.                                                              |
|    16 | Main function end       | Must close `main`.                                                                        |

The generated C must not include run, test, clean, install, package manager, dependency discovery, repository scanning, shell pipeline, or arbitrary task graph code in V1.

---

AE00 Required nob.h API Contract

---

The generated code must use prefixed `nob.h` APIs.

Required or allowed API names:

| API                                                                 | Required use                                                 |
| ------------------------------------------------------------------- | ------------------------------------------------------------ |
| `NOB_IMPLEMENTATION`                                                | Required before including `nob.h`.                           |
| `#include "nob.h"`                                                  | Required include form.                                       |
| `NOB_GO_REBUILD_URSELF(argc, argv)`                                 | Required when self-rebuild is enabled.                       |
| `Nob_Cmd`                                                           | Required command type.                                       |
| `nob_cmd_append`                                                    | Required for appending compiler arguments.                   |
| `nob_cmd_run`                                                       | Required or allowed for running the command.                 |
| `nob_mkdir_if_not_exists` or equivalent documented directory helper | Required if output directory creation uses a `nob.h` helper. |

Prohibited API/style choices in V1:

| Prohibited choice           | Reason                                            |
| --------------------------- | ------------------------------------------------- |
| Stripped-prefix API names   | Deferred to avoid style and collision complexity. |
| Experimental macro controls | Deferred to avoid unstable generated behavior.    |
| Undocumented `nob.h` APIs   | Avoid relying on internal or unstable interfaces. |
| Shell-string build commands | Avoid quoting and portability problems.           |

If directory creation helper naming is uncertain during implementation, Codex must verify against the local or pinned `nob.h` reference before finalizing generated code. It must not invent a helper name.

---

AF00 C String Argument Contract

---

Every generated compiler argument that contains user-provided content must be emitted as a valid C string literal.

Affected values include:

```txt
compilerCommand
sourceFiles entries
output path
includeArgs entries
libraryArgs entries
```

Contract rules:

| Rule                 | Requirement                                                                                                    |
| -------------------- | -------------------------------------------------------------------------------------------------------------- |
| No raw interpolation | User values must not be inserted into C strings without escaping or validation.                                |
| Quote handling       | Values containing unsupported quotes must be rejected or safely escaped according to validation/security spec. |
| Control chars        | Values containing control characters must be rejected.                                                         |
| Order                | Argument order must match derived arrays and template section order.                                           |
| Shell syntax         | Values must be treated as literal arguments, not shell fragments.                                              |

The generated C must append arguments separately. It must not concatenate a single shell command string.

---

AG00 Generated C Failure Contract

---

Generated `main` must return nonzero when build command execution fails.

Required conceptual behavior:

```txt
if command execution fails:
    return 1
return 0
```

If output directory preparation fails and the chosen `nob.h` helper exposes failure status, generated code must return nonzero. If the helper does not expose failure status, the generated code must use the documented behavior of that helper and avoid inventing error handling.

The generated code must not ignore `nob_cmd_run` failure.

---

AH00 Assumptions Contract

---

Assumption items must be derived as strings and rendered outside the generated code. In concise comment mode, selected assumptions may also appear in the generated header comment.

Required assumption topics:

```txt
nob.h must be available for #include "nob.h"
generated file is a starter intended for manual editing
V1 generates executable-oriented projects only
platform profile is an assumption
compiler profile is an assumption
include paths and library flags are not discovered or verified
generation runs locally in the browser with no backend
```

Assumption strings must not claim project files, compilers, packages, or libraries were detected.

---

AI00 Bootstrap Contract

---

Bootstrap output must be represented as command strings outside the generated code.

Required conceptual bootstrap phases:

```txt
compile nob.c into the build program
run the build program
```

Bootstrap output must be derived from current compiler/platform assumptions.

Bootstrap output must not include dependency installation, package discovery, run/test/clean targets, or remote fetch commands.

If validation has blocking errors, bootstrap output may be replaced with a message such as:

```txt
Fix validation errors to show bootstrap commands.
```

The bootstrap panel must not execute commands.

---

AJ00 ActionResult Contract

---

Actions that can fail must return an `ActionResult`.

Required shape:

```js
{
  ok: boolean,
  code: string,
  message: string
}
```

Allowed copy codes:

```txt
copy_success
copy_failed
```

Allowed download codes:

```txt
download_started
download_failed
```

Contract rules:

| Rule       | Requirement                                                    |
| ---------- | -------------------------------------------------------------- |
| `ok`       | True only when action succeeded or was initiated successfully. |
| `code`     | Stable action result code.                                     |
| `message`  | User-visible plain text.                                       |
| No HTML    | Message must not contain HTML.                                 |
| No network | Actions must not send data anywhere.                           |

---

AK00 Edge Cases

---

If `normalizeConfig` receives an unknown enum string, it must preserve enough information for `validateConfig` to return an unknown-enum error. It must not silently replace it with a default.

If `buildAppModel` receives invalid input and no previous valid model exists, `lastValidGeneratedCode` must be an empty string and copy/download must be disabled.

If `buildAppModel` receives invalid input and a previous valid model exists, preview may show the previous valid generated code, but status must be `needsChanges` and copy/download must be disabled.

If `generateNobC` throws, the app must add a `generation_failed` blocking error and disable copy/download.

If `copyGeneratedCode` is called with an empty string, it must return failure. The click handler should prevent this before calling it.

If `downloadGeneratedCode` is called with an empty string, it must return failure. The click handler should prevent this before calling it.

If a user clicks copy or download while buttons are disabled but the event still fires, handlers must check `currentModel.isValid` and refuse the action.

If a generated output section has no configured values, such as no include paths or no library flags, that section must either be omitted or rendered as a concise comment only if comment style permits it. It must not emit placeholder invalid arguments.

If platform is Windows and target already ends with `.exe`, generated output must not append another `.exe`.

---

AL00 Interface Acceptance Criteria

---

| Criterion                        | Pass condition                                                                                                      |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Contract separation              | Raw config, normalized config, validation result, derived values, app model, and action result are distinct shapes. |
| Required functions               | Implementation contains functions equivalent to all required contracts.                                             |
| No DOM in generator              | `generateNobC` does not read or write DOM.                                                                          |
| No DOM in validator              | `validateConfig` does not read or write DOM.                                                                        |
| Safe renderer                    | `renderApp` renders generated code and user values with text-safe APIs.                                             |
| Validity guard                   | Copy/download handlers check model validity before acting.                                                          |
| Stable messages                  | Validation message codes are stable and fixture-testable.                                                           |
| Deterministic generation         | Same valid config and derived values produce identical `nob.c`.                                                     |
| Required C sections              | Generated `nob.c` contains required sections in required order.                                                     |
| Prefixed APIs                    | Generated `nob.c` uses prefixed `nob.h` APIs only.                                                                  |
| No prohibited generated behavior | Generated `nob.c` contains no run/test/clean/package/dependency/project-scan behavior.                              |
| Fixture contract                 | Fixture objects can test validity, expected messages, derived values, and generated substrings.                     |
| Action contract                  | Copy/download return structured `ActionResult` values and do not send data anywhere.                                |

---

AM00 Definition Of Done For This Specification File

---

This file is complete when it defines contracts for raw config, normalized config, validation messages, validation results, derived values, app status, app model, DOM refs, required functions, event flow, rendering, copy/download, fixtures, generated `nob.c` sections, required `nob.h` APIs, C string arguments, generated C failure behavior, assumptions, bootstrap output, action results, edge cases, and acceptance criteria.

This file intentionally does not define exact UI layout, exact CSS, exact final generated C text, exact validation regexes, exact compiler flag mappings, exact browser compatibility matrix, or expected fixture snapshots.

---

Z99 Review-Gate Addendum: Exact V1 Generated Template Rules

This addendum resolves the documentation-gate review findings before implementation. It pins the default generated `nob.c` structure so the implementation does not invent plausible but unverified `nob.h` behavior.

The implementation targets upstream `nob.h` main as fetched during planning on 2026-05-24. The saved snapshot is `.tmp/chatgpt-relay/upstream-nob-h-main-snapshot.txt`. The snapshot reports `nob - v3.8.2` and verifies these API names:

- `NOB_GO_REBUILD_URSELF(argc, argv)`
- `Nob_Cmd cmd = {0};`
- `nob_cmd_append(&cmd, ...)`
- `nob_cmd_run(&cmd)`
- `nob_mkdir_if_not_exists(const char *path)`

The generated template must use these names exactly in V1. It must not use deprecated `nob_cmd_run_sync()` APIs.

Default generated skeleton for the default Unix-like debug fixture:

```c
// Generated by nob.c Boilerplate Generator
// Project: hello-nob
// Assumption: nob.h is available next to this file.

#define NOB_IMPLEMENTATION
#include "nob.h"

int main(int argc, char **argv)
{
    NOB_GO_REBUILD_URSELF(argc, argv);

    if (!nob_mkdir_if_not_exists("build")) return 1;

    Nob_Cmd cmd = {0};
    nob_cmd_append(&cmd,
        "cc",
        "-Wall",
        "-Wextra",
        "-g",
        "-O0",
        "-o",
        "build/hello",
        "src/main.c"
    );

    if (!nob_cmd_run(&cmd)) return 1;
    return 0;
}
```

Template construction rules:

- `#define NOB_IMPLEMENTATION` must appear before `#include "nob.h"`.
- `NOB_GO_REBUILD_URSELF(argc, argv);` appears as the first executable statement in `main` when self-rebuild is enabled.
- If self-rebuild is disabled, omit that line and add an assumptions-panel warning outside the generated code.
- If `outputDir` is non-empty, emit `if (!nob_mkdir_if_not_exists("<outputDir>")) return 1;` before command construction.
- Initialize exactly one command with `Nob_Cmd cmd = {0};`.
- Emit one `nob_cmd_append(&cmd, ...);` call containing compiler, warning flags, build flags, include arguments, output arguments, source files, and library arguments in that order.
- The output argument order is `"-o", "<outputPath>"`.
- Each source/include/library line becomes one quoted C argument after validation and C-string escaping.
- Emit `if (!nob_cmd_run(&cmd)) return 1;` after command construction.
- End successful `main` with `return 0;`.
- Comments policy: include the short generated-by/project/assumption header in normal mode; include only the assumption header in compact mode; do not add line-by-line tutorial comments inside the command block.
