---

A00 08 Testing Strategy

---

Document path: `docs/product-spec/08-testing-strategy.md`

This file defines the V1 testing strategy for the static `nob.h` / `nob.c` boilerplate generator. It covers fixture configurations, generated-code checks, validation tests, escaping tests, copy/download checks, responsive UI checks, accessibility checks, browser and `file://` checks, console-error checks, and final acceptance validation.

V1 uses plain HTML, CSS, and JavaScript only. Testing must not require npm, bundlers, framework test runners, backend services, remote APIs, telemetry, or installed browser automation tools.

---

B00 Testing Thesis

---

Testing must prove that the product generates correct, deterministic, safe, copyable, downloadable `nob.c` output from explicit local configuration.

Testing must prioritize generated-code correctness, validation behavior, safe rendering, and static runtime constraints over visual polish.

Testing may use manual browser checks and optional local static serving commands. Testing must not introduce a required build step.

---

C00 Required Test Surfaces

---

The V1 test pass must cover these surfaces:

| Surface                     | Required coverage                                                              |
| --------------------------- | ------------------------------------------------------------------------------ |
| Default initialization      | Page loads into valid default state.                                           |
| Configuration parsing       | Text fields and multiline lists normalize correctly.                           |
| Validation                  | Blocking errors and nonblocking warnings appear correctly.                     |
| Generated `nob.c`           | Required sections, required APIs, ordering, and exclusions are checked.        |
| Determinism                 | Same config produces same output repeatedly.                                   |
| Escaping and safe rendering | User input cannot become executable HTML or malformed generated C.             |
| Copy                        | Valid output copies only generated `nob.c`; invalid output blocks copy.        |
| Download                    | Valid output downloads only generated `nob.c`; invalid output blocks download. |
| Responsive layout           | Desktop and narrow layouts remain usable.                                      |
| Keyboard access             | Controls and actions are reachable and operable by keyboard.                   |
| Accessibility basics        | Labels, status text, validation messages, and focus behavior are acceptable.   |
| Static constraints          | No network calls, no storage, no build tooling, no prohibited UI.              |
| Browser modes               | Local static server and `file://` behavior are checked.                        |
| Console health              | No unexpected console errors during normal workflows.                          |

---

D00 Allowed Test Methods

---

Permitted V1 test methods:

| Method                        | Allowed use                                                                                         |
| ----------------------------- | --------------------------------------------------------------------------------------------------- |
| Manual browser testing        | Required. Used for UI, copy, download, responsiveness, keyboard, accessibility, and console checks. |
| Local static server           | Optional but recommended for browser testing.                                                       |
| `file://` open                | Required check if browser permits normal local script execution.                                    |
| Browser DevTools console      | Required for checking console errors and inspecting generated text if needed.                       |
| Plain JavaScript test harness | Optional if implemented without npm or build tooling.                                               |
| Static fixture file           | Optional if loaded manually or included locally without network access.                             |

Prohibited V1 test dependencies:

| Dependency                                  | Status                             |
| ------------------------------------------- | ---------------------------------- |
| npm install                                 | Prohibited as required test setup. |
| Playwright/Cypress/Jest/Vitest              | Prohibited as required test setup. |
| Remote validation service                   | Prohibited.                        |
| Hosted API                                  | Prohibited.                        |
| Analytics or telemetry verification service | Prohibited.                        |
| External CDN test libraries                 | Prohibited.                        |

---

E00 Manual Test Setup

---

Preferred local static-server command:

```sh id="7zh9m7"
python3 -m http.server 8000
```

Then open:

```txt id="kcyeiy"
http://localhost:8000/
```

Fallback Python command if `python3` is unavailable:

```sh id="9lo1ka"
python -m http.server 8000
```

Required `file://` check:

```txt id="bvr5yd"
Open index.html directly in a browser from the local filesystem.
```

The app must not require a server for generation. If clipboard permissions behave differently under `file://`, the app must show visible copy failure feedback rather than failing silently.

---

F00 Fixture Configuration Set

---

Testing must include these normalized valid configurations.

```js id="9x6p5a"
const FIXTURE_DEFAULT_UNIX_DEBUG = {
  projectName: "Example C App",
  targetName: "example",
  sourceFiles: ["src/main.c"],
  outputDirectory: "build",
  platformProfile: "unix",
  compilerProfile: "gcc-clang",
  compilerCommand: "cc",
  buildProfile: "debug",
  warningProfile: "normal",
  includePaths: [],
  libraryFlags: [],
  selfRebuild: true,
  commentStyle: "concise"
};
```

```js id="d0p8d7"
const FIXTURE_UNIX_RELEASE_STRICT = {
  projectName: "Example C App",
  targetName: "example",
  sourceFiles: ["src/main.c"],
  outputDirectory: "build",
  platformProfile: "unix",
  compilerProfile: "gcc-clang",
  compilerCommand: "cc",
  buildProfile: "release",
  warningProfile: "strict",
  includePaths: [],
  libraryFlags: [],
  selfRebuild: true,
  commentStyle: "concise"
};
```

```js id="p8639c"
const FIXTURE_MULTI_SOURCE_WITH_INCLUDES_AND_LIBS = {
  projectName: "Example C App",
  targetName: "example",
  sourceFiles: ["src/main.c", "src/app.c", "src/util.c"],
  outputDirectory: "build",
  platformProfile: "unix",
  compilerProfile: "gcc-clang",
  compilerCommand: "cc",
  buildProfile: "debug",
  warningProfile: "strict",
  includePaths: ["include", "vendor/nob"],
  libraryFlags: ["-lm"],
  selfRebuild: true,
  commentStyle: "concise"
};
```

```js id="hjyr93"
const FIXTURE_WINDOWS_GCC_STYLE = {
  projectName: "Example C App",
  targetName: "example",
  sourceFiles: ["src/main.c"],
  outputDirectory: "build",
  platformProfile: "windows",
  compilerProfile: "gcc-clang",
  compilerCommand: "cc",
  buildProfile: "debug",
  warningProfile: "normal",
  includePaths: [],
  libraryFlags: [],
  selfRebuild: true,
  commentStyle: "concise"
};
```

```js id="zi8bg0"
const FIXTURE_WINDOWS_MSVC_STYLE = {
  projectName: "Example C App",
  targetName: "example",
  sourceFiles: ["src/main.c"],
  outputDirectory: "build",
  platformProfile: "windows",
  compilerProfile: "msvc",
  compilerCommand: "cl",
  buildProfile: "debug",
  warningProfile: "normal",
  includePaths: [],
  libraryFlags: [],
  selfRebuild: true,
  commentStyle: "concise"
};
```

```js id="zqze8j"
const FIXTURE_SELF_REBUILD_DISABLED = {
  projectName: "Example C App",
  targetName: "example",
  sourceFiles: ["src/main.c"],
  outputDirectory: "build",
  platformProfile: "unix",
  compilerProfile: "gcc-clang",
  compilerCommand: "cc",
  buildProfile: "debug",
  warningProfile: "normal",
  includePaths: [],
  libraryFlags: [],
  selfRebuild: false,
  commentStyle: "concise"
};
```

```js id="lpa6dw"
const FIXTURE_MINIMAL_COMMENTS = {
  projectName: "Example C App",
  targetName: "example",
  sourceFiles: ["src/main.c"],
  outputDirectory: "build",
  platformProfile: "unix",
  compilerProfile: "gcc-clang",
  compilerCommand: "cc",
  buildProfile: "debug",
  warningProfile: "normal",
  includePaths: [],
  libraryFlags: [],
  selfRebuild: true,
  commentStyle: "minimal"
};
```

Testing must also include invalid raw configurations.

```js id="lm8hei"
const FIXTURE_INVALID_EMPTY_SOURCES_RAW = {
  projectName: "Example C App",
  targetName: "example",
  sourceFilesText: "",
  outputDirectory: "build",
  platformProfile: "unix",
  compilerProfile: "gcc-clang",
  compilerCommand: "cc",
  buildProfile: "debug",
  warningProfile: "normal",
  includePathsText: "",
  libraryFlagsText: "",
  selfRebuild: true,
  commentStyle: "concise"
};
```

```js id="1n14lx"
const FIXTURE_INVALID_EMPTY_TARGET_RAW = {
  projectName: "Example C App",
  targetName: "",
  sourceFilesText: "src/main.c",
  outputDirectory: "build",
  platformProfile: "unix",
  compilerProfile: "gcc-clang",
  compilerCommand: "cc",
  buildProfile: "debug",
  warningProfile: "normal",
  includePathsText: "",
  libraryFlagsText: "",
  selfRebuild: true,
  commentStyle: "concise"
};
```

```js id="z6drx3"
const FIXTURE_INVALID_QUOTE_IN_SOURCE_RAW = {
  projectName: "Example C App",
  targetName: "example",
  sourceFilesText: "src/mai\"n.c",
  outputDirectory: "build",
  platformProfile: "unix",
  compilerProfile: "gcc-clang",
  compilerCommand: "cc",
  buildProfile: "debug",
  warningProfile: "normal",
  includePathsText: "",
  libraryFlagsText: "",
  selfRebuild: true,
  commentStyle: "concise"
};
```

---

G00 Generated-Code Required Checks

---

Every valid generated `nob.c` fixture must be checked for required content.

| Check                 | Required result                                                                         |
| --------------------- | --------------------------------------------------------------------------------------- |
| Implementation define | Output contains `#define NOB_IMPLEMENTATION`.                                           |
| Header include        | Output contains `#include "nob.h"`.                                                     |
| Main function         | Output contains `int main(int argc, char **argv)` or the exact approved main signature. |
| Prefixed command type | Output contains `Nob_Cmd`.                                                              |
| Prefixed append API   | Output contains `nob_cmd_append`.                                                       |
| Prefixed run API      | Output contains `nob_cmd_run`.                                                          |
| Self-rebuild default  | Default output contains `NOB_GO_REBUILD_URSELF(argc, argv)`.                            |
| Source path           | Default output contains `src/main.c` as a C string argument.                            |
| Output path           | Default Unix output contains `build/example`.                                           |
| Failure behavior      | Output contains a nonzero return path when command execution fails.                     |
| Success behavior      | Output contains `return 0;` or equivalent success return.                               |

Every valid generated `nob.c` fixture must be checked for prohibited content.

| Prohibited content            | Required result                                                                                                      |                                                                |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Run target dispatcher         | Output does not contain generated run target logic.                                                                  |                                                                |
| Test target dispatcher        | Output does not contain generated test target logic.                                                                 |                                                                |
| Clean target dispatcher       | Output does not contain generated clean target logic.                                                                |                                                                |
| Static library generation     | Output does not contain `ar`, `.a`, `.lib`, or library archive commands unless part of a user-provided library flag. |                                                                |
| Dependency discovery          | Output does not contain `pkg-config`, CMake, Meson, package install commands, or SDK discovery logic.                |                                                                |
| Shell pipeline                | Output does not contain shell pipelines such as `                                                                    | `, command substitution, or redirection as generated behavior. |
| Stripped nob.h API style      | Output does not use stripped APIs such as bare `Cmd` or `cmd_append` as generated API names.                         |                                                                |
| Do-not-edit language          | Output does not contain `do not edit`.                                                                               |                                                                |
| Telemetry or network behavior | Output does not contain remote URLs or network calls.                                                                |                                                                |

---

H00 Fixture-Specific Generated-Code Checks

---

`default_unix_debug` must pass these checks:

| Check          | Required result                                          |
| -------------- | -------------------------------------------------------- |
| Validity       | Zero blocking validation errors.                         |
| Output path    | Contains `build/example`.                                |
| Windows suffix | Does not contain `example.exe` as generated output path. |
| Self-rebuild   | Contains `NOB_GO_REBUILD_URSELF(argc, argv)`.            |
| Include args   | Does not include generated include path args.            |
| Library args   | Does not include generated library args.                 |

`unix_release_strict` must pass these checks:

| Check            | Required result                                                                                |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| Validity         | Zero blocking validation errors.                                                               |
| Strict warnings  | Generated flags reflect strict warning profile.                                                |
| Release flags    | Generated flags reflect release build profile.                                                 |
| Debug-only flags | Does not include debug-only flags if the platform/compiler spec makes them mutually exclusive. |

`multi_source_with_includes_and_libs` must pass these checks:

| Check         | Required result                                                                              |
| ------------- | -------------------------------------------------------------------------------------------- |
| Source order  | `src/main.c` appears before `src/app.c`, which appears before `src/util.c`.                  |
| Include order | `include` appears before `vendor/nob`.                                                       |
| Library order | `-lm` appears after source/output arguments if specified by the generated-template contract. |
| Warnings      | Shows include paths not verified and library flags not verified warnings.                    |
| Validity      | Warnings do not block copy/download.                                                         |

`windows_gcc_style` must pass these checks:

| Check         | Required result                               |
| ------------- | --------------------------------------------- |
| Output suffix | Generated output path contains `example.exe`. |
| Warning       | Shows Windows platform assumption warning.    |
| Double suffix | Does not produce `example.exe.exe`.           |

`windows_msvc_style` must pass these checks:

| Check            | Required result                                           |
| ---------------- | --------------------------------------------------------- |
| Output suffix    | Generated output path contains `example.exe`.             |
| Compiler command | Generated command uses `cl` as configured.                |
| MSVC flags       | Generated flags follow MSVC profile rules if implemented. |
| Warning          | Shows Windows platform assumption warning.                |

`self_rebuild_disabled` must pass these checks:

| Check                | Required result                                              |
| -------------------- | ------------------------------------------------------------ |
| Self-rebuild omitted | Output does not contain `NOB_GO_REBUILD_URSELF(argc, argv)`. |
| Warning              | Shows `self_rebuild_disabled`.                               |
| Validity             | Warning does not block copy/download.                        |

`minimal_comments` must pass these checks:

| Check    | Required result                                                                 |
| -------- | ------------------------------------------------------------------------------- |
| Validity | Zero blocking validation errors.                                                |
| Comments | Contains fewer comments than concise mode.                                      |
| Behavior | Generated build behavior is otherwise equivalent to default Unix debug fixture. |

---

I00 Validation Test Matrix

---

Validation tests must confirm these error cases.

| Test id                    | Input change                              | Expected error code            | Copy/download |
| -------------------------- | ----------------------------------------- | ------------------------------ | ------------- |
| `empty_project_name`       | Project name is blank.                    | `project_name_required`        | Disabled      |
| `empty_target_name`        | Target name is blank.                     | `target_name_required`         | Disabled      |
| `empty_sources`            | Source list is blank or only blank lines. | `source_files_required`        | Disabled      |
| `empty_output_directory`   | Output directory is blank.                | `output_directory_required`    | Disabled      |
| `empty_compiler_command`   | Compiler command is blank.                | `compiler_command_required`    | Disabled      |
| `unknown_platform_profile` | Platform profile value is unknown.        | `unknown_platform_profile`     | Disabled      |
| `unknown_compiler_profile` | Compiler profile value is unknown.        | `unknown_compiler_profile`     | Disabled      |
| `unknown_build_profile`    | Build profile value is unknown.           | `unknown_build_profile`        | Disabled      |
| `unknown_warning_profile`  | Warning profile value is unknown.         | `unknown_warning_profile`      | Disabled      |
| `unknown_comment_style`    | Comment style value is unknown.           | `unknown_comment_style`        | Disabled      |
| `source_limit_exceeded`    | 51 source entries.                        | `source_files_limit_exceeded`  | Disabled      |
| `include_limit_exceeded`   | 31 include path entries.                  | `include_paths_limit_exceeded` | Disabled      |
| `library_limit_exceeded`   | 31 library flag entries.                  | `library_flags_limit_exceeded` | Disabled      |

Validation tests must confirm these warning cases.

| Test id                 | Input change                                            | Expected warning code               | Copy/download |
| ----------------------- | ------------------------------------------------------- | ----------------------------------- | ------------- |
| `duplicate_source`      | Same source path appears twice.                         | `source_file_duplicate`             | Enabled       |
| `duplicate_include`     | Same include path appears twice.                        | `include_path_duplicate`            | Enabled       |
| `duplicate_library`     | Same library flag appears twice.                        | `library_flag_duplicate`            | Enabled       |
| `non_c_source`          | Source path ends in `.cpp` or `.txt`.                   | `source_file_non_c_extension`       | Enabled       |
| `include_paths_present` | Include path list has at least one entry.               | `include_paths_not_verified`        | Enabled       |
| `library_flags_present` | Library flags list has at least one entry.              | `library_flags_not_verified`        | Enabled       |
| `self_rebuild_off`      | Self-rebuild unchecked.                                 | `self_rebuild_disabled`             | Enabled       |
| `windows_platform`      | Platform is Windows.                                    | `windows_platform_assumption`       | Enabled       |
| `compiler_mismatch`     | MSVC profile with `cc`, or GCC/Clang profile with `cl`. | `compiler_profile_command_mismatch` | Enabled       |
| `compiler_spaces`       | Compiler command contains spaces.                       | `compiler_command_contains_spaces`  | Enabled       |

---

J00 List Parsing Tests

---

List parsing must be tested with raw multiline input.

Source input:

```txt id="4y8n3c"

src/main.c

src/app.c
src/util.c

```

Expected normalized sources:

```js id="6xo6s0"
["src/main.c", "src/app.c", "src/util.c"]
```

Include input:

```txt id="9wzt3i"
include
vendor/nob

third_party/lib/include
```

Expected normalized include paths:

```js id="49fhgp"
["include", "vendor/nob", "third_party/lib/include"]
```

Library input:

```txt id="qf00z1"
-lm
-lpthread
user32.lib
```

Expected normalized library flags:

```js id="wb5g25"
["-lm", "-lpthread", "user32.lib"]
```

The parser must not split this line:

```txt id="4fyxz6"
-lfoo -lbar
```

Expected normalized library flags:

```js id="6a93f2"
["-lfoo -lbar"]
```

The parser must not execute or transform this line:

```txt id="uc64ol"
$(pkg-config --libs sdl2)
```

Expected behavior: either literal argument if otherwise valid, or validation warning/error as defined by validation rules. It must never execute.

---

K00 Escaping And Safe Rendering Tests

---

Escaping and safe rendering tests must verify that user input is never interpreted as HTML, JavaScript, shell syntax, or executable code.

HTML-like input test:

| Field        | Value                       |
| ------------ | --------------------------- |
| Project name | `<script>alert(1)</script>` |

Expected result:

| Check            | Required result                                                                  |
| ---------------- | -------------------------------------------------------------------------------- |
| UI rendering     | Text appears as text if displayed.                                               |
| Script execution | No alert executes.                                                               |
| Console          | No unexpected security-related error.                                            |
| Copy/download    | Allowed only if validation rules permit the value and generated C remains valid. |

Quote input test:

| Field        | Value         |
| ------------ | ------------- |
| Source files | `src/mai"n.c` |

Expected result:

| Check         | Required result                                                       |
| ------------- | --------------------------------------------------------------------- |
| Validation    | Blocking `unsupported_characters` or equivalent quote-specific error. |
| Copy/download | Disabled.                                                             |
| Preview       | Does not show malformed current C as valid.                           |

Control-character test:

| Field       | Value                                                                                  |
| ----------- | -------------------------------------------------------------------------------------- |
| Target name | Value containing a tab or other unsupported control character if the UI permits entry. |

Expected result:

| Check          | Required result                       |
| -------------- | ------------------------------------- |
| Validation     | Blocking unsupported-character error. |
| Generated code | Not generated from invalid value.     |

Shell-like input test:

| Field         | Value                       |
| ------------- | --------------------------- |
| Library flags | `$(pkg-config --libs sdl2)` |

Expected result:

| Check           | Required result                    |
| --------------- | ---------------------------------- |
| Execution       | Nothing executes.                  |
| Network/process | No process or network call occurs. |
| Parsing         | Value is not split or expanded.    |
| Validation      | Behavior matches validation rules. |

Markup in list input test:

| Field         | Value                          |
| ------------- | ------------------------------ |
| Include paths | `<img src=x onerror=alert(1)>` |

Expected result:

| Check            | Required result                                               |
| ---------------- | ------------------------------------------------------------- |
| UI rendering     | Text is escaped by text rendering.                            |
| Script execution | No alert executes.                                            |
| Generated code   | Either safely escaped/rejected according to validation rules. |

---

L00 Copy Manual Checks

---

Copy must be tested manually because browser permissions vary.

Valid copy check:

| Step                                | Expected result                                                            |
| ----------------------------------- | -------------------------------------------------------------------------- |
| Open page with default config.      | Preview status is ready.                                                   |
| Click `Copy nob.c`.                 | Visible copied confirmation appears.                                       |
| Paste into a temporary text editor. | Pasted text is generated `nob.c` only.                                     |
| Compare pasted start.               | Text starts with expected generated C content, not UI labels.              |
| Compare pasted end.                 | Text ends with generated C content, not assumptions or bootstrap commands. |

Invalid copy check:

| Step                                                  | Expected result                                        |
| ----------------------------------------------------- | ------------------------------------------------------ |
| Clear source files.                                   | Validation error appears.                              |
| Observe copy button.                                  | Copy is disabled.                                      |
| Trigger copy by keyboard or forced click if possible. | App refuses action and remains in needs-changes state. |

Clipboard failure check:

| Step                                                                                     | Expected result                                          |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Open page in a context where clipboard is blocked, such as some `file://` browser modes. | App remains usable.                                      |
| Click `Copy nob.c`.                                                                      | App shows copy failure message if clipboard write fails. |
| Inspect preview.                                                                         | Code remains selectable for manual copy.                 |

---

M00 Download Manual Checks

---

Valid download check:

| Step                           | Expected result                                                                                        |
| ------------------------------ | ------------------------------------------------------------------------------------------------------ |
| Open page with default config. | Preview status is ready.                                                                               |
| Click `Download nob.c`.        | Browser downloads or prompts to save `nob.c`.                                                          |
| Open downloaded file.          | File contains generated `nob.c` only.                                                                  |
| Inspect file.                  | File does not contain UI labels, assumptions panel text, bootstrap panel text, or validation messages. |

Invalid download check:

| Step                                          | Expected result                                            |
| --------------------------------------------- | ---------------------------------------------------------- |
| Clear target executable name.                 | Validation error appears.                                  |
| Observe download button.                      | Download is disabled.                                      |
| Trigger download by forced click if possible. | App refuses action and does not download placeholder text. |

Repeated download check:

| Step                          | Expected result                                                       |
| ----------------------------- | --------------------------------------------------------------------- |
| Download default output.      | First file is saved or prompted.                                      |
| Change target name to `tool`. | Preview updates.                                                      |
| Download again.               | New file contains output path for `tool`, not stale `example` output. |

---

N00 Bootstrap Command Checks

---

The bootstrap panel must be tested for each platform/compiler fixture.

Default Unix debug:

| Check               | Required result                                                                        |
| ------------------- | -------------------------------------------------------------------------------------- |
| Compile phase       | Shows a command to compile `nob.c` into the build program.                             |
| Run phase           | Shows a command to run the build program.                                              |
| Self-rebuild note   | States self-rebuild behavior when enabled.                                             |
| Dependency commands | Does not show package install, `pkg-config`, run/test/clean, or remote fetch commands. |

Self-rebuild disabled:

| Check             | Required result                                         |
| ----------------- | ------------------------------------------------------- |
| Self-rebuild note | Does not claim automatic rebuild after `nob.c` changes. |
| Warning           | Shows self-rebuild disabled warning.                    |

Invalid config:

| Check           | Required result                                                                    |
| --------------- | ---------------------------------------------------------------------------------- |
| Bootstrap panel | Shows command only if safe, otherwise states that validation errors must be fixed. |
| Copy/download   | Disabled.                                                                          |

---

O00 Responsive UI Checks

---

Responsive behavior must be checked manually at these viewport widths using browser DevTools responsive mode:

|  Width | Required behavior                                                                                                  |
| -----: | ------------------------------------------------------------------------------------------------------------------ |
| 1280px | Two-column tool layout. Controls and preview visible in first viewport.                                            |
|  960px | Two-column or readable adaptive layout. No full-page horizontal scrolling.                                         |
|  720px | Layout remains usable at breakpoint. Preview and actions reachable.                                                |
|  480px | Single-column layout. Controls, preview, validation, assumptions, bootstrap, copy/download reachable by scrolling. |
|  320px | Page remains usable. Full page does not require horizontal scrolling except code preview area.                     |

Required responsive checks:

| Check                 | Pass condition                                                          |
| --------------------- | ----------------------------------------------------------------------- |
| Preview access        | Generated code preview is not hidden behind a modal or off-screen pane. |
| Action access         | Copy/download buttons remain near the preview.                          |
| Control access        | All required controls are reachable.                                    |
| Validation visibility | Errors are visible after invalid input.                                 |
| Code overflow         | Long code lines scroll inside preview, not across whole page.           |
| Advanced section      | If collapsed, it is keyboard-operable and shows error/active summary.   |

---

P00 Keyboard Checks

---

Keyboard testing must be performed without using a mouse.

Required keyboard flow:

```txt id="52if8e"
Open page.
Press Tab through all controls in visual order.
Edit project name.
Edit target executable name.
Edit source files.
Change platform profile.
Change compiler profile.
Toggle self-rebuild.
Reach Copy nob.c.
Activate with Enter or Space.
Reach Download nob.c.
Activate with Enter or Space.
```

Keyboard acceptance checks:

| Check            | Pass condition                                                                   |
| ---------------- | -------------------------------------------------------------------------------- |
| Focus visibility | Current focus is visibly indicated.                                              |
| Tab order        | Tab order follows visual order.                                                  |
| Inputs           | All fields can be edited by keyboard.                                            |
| Selects          | All selects can be changed by keyboard.                                          |
| Toggles          | Self-rebuild can be toggled by keyboard.                                         |
| Buttons          | Copy/download can be activated by keyboard.                                      |
| No trap          | Code preview or collapsed sections do not trap focus.                            |
| Disabled actions | Disabled copy/download are skipped or announced as disabled by browser behavior. |

---

Q00 Accessibility Checks

---

Accessibility testing must cover basic semantic and assistive behavior without requiring external tools.

Manual checks:

| Check             | Pass condition                                                                               |
| ----------------- | -------------------------------------------------------------------------------------------- |
| Labels            | Every input has visible label text.                                                          |
| Label association | Clicking label focuses or toggles the associated control where browser behavior supports it. |
| Error association | Field-level errors appear near affected fields.                                              |
| Status text       | Preview status is visible as text, not color only.                                           |
| Error text        | Errors use text labels, not color only.                                                      |
| Warning text      | Warnings use text labels, not color only.                                                    |
| Button names      | Copy and download buttons have explicit text names.                                          |
| Zoom              | Page remains usable at 200 percent browser zoom.                                             |
| Reduced motion    | If animations exist, app remains usable with reduced motion enabled.                         |
| Touch target      | Primary buttons and form controls are large enough to operate on small screens.              |

Recommended browser built-in checks:

| Tool                                    | Required action                                                                  |
| --------------------------------------- | -------------------------------------------------------------------------------- |
| Chrome or Edge DevTools Elements panel  | Inspect a sample input and confirm it has an associated label.                   |
| Browser accessibility tree if available | Confirm copy/download buttons have useful accessible names.                      |
| Lighthouse if available locally         | Optional. Do not make remote or npm-based Lighthouse a required test dependency. |

---

R00 Browser And file:// Checks

---

Required browser checks:

| Environment                                                | Required result                                                                          |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Current Chrome or Chromium-based browser from local server | App initializes, previews, validates, copies or reports copy failure, downloads.         |
| Current Firefox from local server if available             | App initializes, previews, validates, downloads, copies or reports copy failure.         |
| Current Safari from local server if available              | App initializes, previews, validates, downloads, copies or reports copy failure.         |
| `file://` in at least one browser                          | App initializes if browser permits scripts; if copy is blocked, visible failure appears. |

The app must not rely on APIs that require an HTTP server for core generation. Clipboard restrictions are allowed only if handled with visible failure feedback.

---

S00 Console And Network Checks

---

Console check:

| Step                       | Expected result                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------- |
| Open DevTools console.     | No unexpected errors on page load.                                                    |
| Modify each control once.  | No unexpected errors.                                                                 |
| Trigger validation errors. | No unexpected errors.                                                                 |
| Copy valid code.           | No unexpected errors except browser permission messages that are also surfaced in UI. |
| Download valid code.       | No unexpected errors.                                                                 |
| Resize viewport.           | No unexpected errors.                                                                 |

Network check:

| Step                         | Expected result                                                  |
| ---------------------------- | ---------------------------------------------------------------- |
| Open DevTools Network panel. |                                                                  |
| Reload from local server.    | Only local static files are requested.                           |
| Edit fields.                 | No network requests occur.                                       |
| Copy code.                   | No network requests occur.                                       |
| Download code.               | No network requests occur except local blob/object URL behavior. |

Storage check:

| Step                                     | Expected result                                                                                |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Open DevTools Application/Storage panel. | No localStorage, sessionStorage, IndexedDB, cookies, or service worker are created by the app. |
| Edit fields and reload.                  | Configuration resets to default.                                                               |

---

T00 Optional Plain JavaScript Test Harness

---

An optional local-only `tests.html` or `test.html` may be added if it requires no npm and no external dependencies.

Permitted optional harness files:

```txt id="a9dzbf"
tests.html
tests.js
```

The optional harness may call pure functions such as:

```txt id="diz0wx"
normalizeConfig
validateConfig
deriveValues
generateNobC
```

The optional harness must not be required to run the product.

The optional harness must not use network dependencies.

The optional harness must report pass/fail results in the browser.

Minimum optional harness checks:

| Test group  | Required checks                                                                         |
| ----------- | --------------------------------------------------------------------------------------- |
| Defaults    | Default config validates and generates output.                                          |
| Lists       | Multiline parsing trims blanks and preserves order.                                     |
| Validation  | Invalid raw fixtures produce expected error codes.                                      |
| Warnings    | Warning fixtures produce expected warning codes.                                        |
| Generation  | Valid fixtures contain required generated substrings and exclude prohibited substrings. |
| Determinism | Same fixture generated twice is identical.                                              |

If no optional harness is created, all checks in this document must still be completed manually.

---

U00 Static Constraint Checks

---

The implementation must be checked for prohibited dependencies.

Manual file check:

```sh id="3d8yck"
ls
```

Expected runtime files include:

```txt id="psewuc"
index.html
styles.css
script.js
```

Search for prohibited remote references:

```sh id="zjfgd5"
grep -R "https://\|http://\|cdn\|analytics\|gtag\|fetch\|XMLHttpRequest\|WebSocket\|localStorage\|sessionStorage\|indexedDB\|serviceWorker" .
```

Expected result: no prohibited runtime use. Documentation references may appear only in docs and must not be part of runtime behavior.

Search for framework/package indicators:

```sh id="qxmg7a"
ls package.json package-lock.json yarn.lock pnpm-lock.yaml vite.config.* webpack.config.* 2>/dev/null
```

Expected result: no required package or build config files for V1 runtime.

If these files exist for documentation or future tooling, they must not be required to run or test V1.

---

V00 Prohibited Feature Checks

---

The UI and generated code must be checked for prohibited V1 features.

| Prohibited feature   | Required check                                                                          |
| -------------------- | --------------------------------------------------------------------------------------- |
| Run target           | No run target control and no generated run dispatcher.                                  |
| Test target          | No test target control and no generated test dispatcher.                                |
| Clean target         | No clean target control and no generated clean dispatcher.                              |
| Static library       | No static library project type or archive generation.                                   |
| Dependency discovery | No `pkg-config`, CMake, Meson, package manager, SDK discovery, or auto-detect behavior. |
| URL state            | Editing controls does not change URL query string or hash.                              |
| Telemetry            | No analytics scripts or network calls.                                                  |
| Browser compilation  | No compile/run button and no WebAssembly compiler.                                      |
| Repository scanning  | No file picker, directory picker, upload import, or filesystem permission prompt.       |
| Accounts/backend     | No login, cloud save, API endpoint, or server requirement.                              |

---

W00 Final Acceptance Checklist

---

Before V1 is considered complete, perform this final checklist.

| Gate                   | Pass condition                                                               |
| ---------------------- | ---------------------------------------------------------------------------- |
| Default page           | Opens with valid generated `nob.c`.                                          |
| Default generated code | Contains required `nob.h` sections and APIs.                                 |
| Default copy           | Copies generated `nob.c` only or reports visible clipboard failure.          |
| Default download       | Downloads generated `nob.c` only.                                            |
| Multi-source           | Supports and preserves multiple source files.                                |
| Includes/libs          | Supports include paths and library flags without discovery or shell parsing. |
| Validation             | Empty required fields block copy/download.                                   |
| Warnings               | Duplicates and assumptions warn without blocking.                            |
| Escaping               | HTML/script-like input does not execute.                                     |
| Invalid C prevention   | Unsupported quotes/control characters block generated output.                |
| Platform assumption    | Windows mode adds or preserves `.exe` behavior without double suffix.        |
| Self-rebuild toggle    | Enabled by default; disabled state omits self-rebuild and warns.             |
| Static runtime         | Runs without npm, backend, framework, telemetry, or remote dependencies.     |
| Responsive             | Usable at 1280px, 960px, 720px, 480px, and 320px widths.                     |
| Keyboard               | Core workflow can be completed with keyboard.                                |
| Accessibility          | Inputs have labels and status is not color-only.                             |
| Console                | No unexpected console errors during normal workflows.                        |
| Network                | No network requests after local files load.                                  |
| Storage                | No configuration persistence in URL, storage, cookies, or IndexedDB.         |
| Prohibited features    | No V1 exclusions appear in UI or generated code.                             |

---

X00 Test Report Format

---

After testing, create or update a local test report at:

```txt id="v82jl7"
docs/product-spec/test-report-v1.md
```

Required report contents:

| Section                         | Required content                         |
| ------------------------------- | ---------------------------------------- |
| Date                            | Date testing was performed.              |
| Browser environments            | Browser names and versions if available. |
| Local server command            | Command used, if any.                    |
| `file://` result                | Whether direct local open worked.        |
| Fixture results                 | Pass/fail for each fixture.              |
| Manual action results           | Copy/download results.                   |
| Responsive results              | Pass/fail for tested widths.             |
| Accessibility results           | Pass/fail for basic checks.              |
| Console/network/storage results | Pass/fail and notes.                     |
| Known failures                  | Any failed acceptance criteria.          |
| Release decision                | `pass` or `fail`.                        |

A V1 release decision must be `fail` if any release gate in this document fails.

---

Y00 Definition Of Done For This Specification File

---

This file is complete when it defines fixture configurations, generated-code checks, validation tests, list parsing tests, escaping tests, copy/download manual checks, bootstrap checks, responsive checks, keyboard checks, accessibility checks, browser and `file://` checks, console/network/storage checks, optional plain JavaScript harness rules, static constraint checks, prohibited feature checks, final acceptance checklist, and test report format.

---

Z99 Review-Gate Addendum: Snapshot Fixtures

The testing strategy must include exact expected-output snapshots in addition to substring checks. Substring checks are not sufficient for a code generator whose release gate is generated-code correctness.

Required exact snapshots:

- `default_unix_debug`: default `cc`, Linux platform, debug profile, basic warnings, `src/main.c`, output `build/hello`.
- `multi_source_with_includes_and_libs`: multiple source files, include paths, and library arguments. The snapshot must prove ordering and one-line-one-argument behavior.
- `windows_mingw_debug`: Windows-oriented GCC/Clang/MinGW assumption with `.exe` output suffix and `-o build/hello.exe`.
- `self_rebuild_disabled`: self-rebuild line omitted and assumptions/warnings present in the UI.

Before final validation, implementation must compare the generated code for each fixture against an exact string stored in JavaScript fixture data or a local test artifact. A mismatch must be treated as a failed validation unless the expected snapshot is intentionally updated with a decision-log entry.
