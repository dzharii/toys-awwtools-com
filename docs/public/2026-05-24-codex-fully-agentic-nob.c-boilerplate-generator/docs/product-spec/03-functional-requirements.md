---

A00 03 Functional Requirements

---

Document path: `docs/product-spec/03-functional-requirements.md`

This file defines the functional behavior for V1 of the `nob.h` / `nob.c` boilerplate generator. It controls feature rules, form behavior, state updates, output regeneration triggers, user-visible validation behavior, empty states, success states, failure states, and acceptance criteria.

This file does not define exact UI layout, exact CSS, exact generated C template text, exact validation regexes, exact platform flag mappings, or fixture contents. Those belong in separate specification files.

---

B00 Functional Thesis

---

V1 must behave as a live, copy-first generator. The page loads with a valid default configuration, immediately displays generated `nob.c`, and lets the user modify configuration fields. Each valid change updates the generated code, assumptions, bootstrap command, and action states without requiring a separate generation step.

The product must never require a backend, remote API, account, telemetry consent, project import, local filesystem permission, package installation, browser compilation, framework runtime, or build tool before the user can generate, copy, or download `nob.c`.

The generated code is the primary output. Every functional feature must either change generated `nob.c`, explain generated `nob.c`, validate generated `nob.c`, copy generated `nob.c`, download generated `nob.c`, or state assumptions about generated `nob.c`.

---

C00 Application Initialization

---

On page load, the application must initialize a default configuration state.

The default configuration must be valid.

The application must immediately derive and display:

| Derived output    | Required initial behavior                 |
| ----------------- | ----------------------------------------- |
| Generated `nob.c` | Complete valid starter file is displayed. |
| Validation state  | No blocking errors are displayed.         |
| Assumptions       | Default assumptions are displayed.        |
| Bootstrap command | Default bootstrap command is displayed.   |
| Preview status    | Status shows a ready state.               |
| Copy action       | Enabled.                                  |
| Download action   | Enabled.                                  |

If JavaScript fails before initialization, the page must show a visible fallback message indicating that JavaScript is required for live generation. The page must not show stale generated code as if it were current.

If JavaScript initializes but generation fails due to an implementation error, the page must show a visible failure state and disable copy/download. It must not copy or download partial output.

---

D00 Core Functional State Model

---

The implementation must maintain one current configuration state. User controls update this state. Derived outputs must be produced from this state.

The application must derive these values from the current configuration:

| Derived value               | Purpose                                                                      |
| --------------------------- | ---------------------------------------------------------------------------- |
| Normalized configuration    | Trimmed and parsed version of user input used for validation and generation. |
| Validation results          | Blocking errors and nonblocking warnings.                                    |
| Assumptions list            | User-visible assumptions derived from configuration.                         |
| Generated `nob.c`           | Current output artifact.                                                     |
| Bootstrap command text      | Commands the user should run after saving `nob.c`.                           |
| Preview status              | Ready, needs changes, copied, downloaded, copy failed, or download failed.   |
| Copy/download enabled state | Whether output actions are allowed.                                          |

The implementation must not keep independent, conflicting versions of generated output. The preview text, copied text, and downloaded text must all come from the same current valid generated string.

---

E00 Required Controls And Functional Effects

---

V1 must include these controls and functional effects.

| Control                | Required behavior                                        | Output effect                                                                        |
| ---------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Project name           | User can enter a nonempty project label.                 | Affects assumptions and optional generated comment text.                             |
| Target executable name | User can enter the executable target name.               | Affects output executable path in generated code.                                    |
| Source files           | User can enter one or more source paths.                 | Affects compiler command source arguments.                                           |
| Output directory       | User can enter output directory.                         | Affects output path and output directory preparation code.                           |
| Platform assumption    | User can select a platform assumption.                   | Affects assumptions, bootstrap command, and executable suffix behavior if specified. |
| Compiler profile       | User can select compiler profile.                        | Affects assumptions and default/profile-driven flags.                                |
| Compiler command       | User can enter compiler executable command.              | Affects generated compiler command argument.                                         |
| Build profile          | User can select debug or release.                        | Affects generated flags.                                                             |
| Warning profile        | User can select normal or strict.                        | Affects generated warning flags.                                                     |
| Include paths          | User can enter zero or more include paths.               | Affects generated include path arguments.                                            |
| Library flags          | User can enter zero or more library or linker arguments. | Affects generated library/linker arguments.                                          |
| Self-rebuild           | User can enable or disable self-rebuild.                 | Affects generated self-rebuild block and warning state.                              |
| Comment verbosity      | User can select concise or minimal if implemented.       | Affects generated comments and explanations.                                         |

A control must not exist in V1 unless its effect is implemented. Disabled placeholders for deferred features are prohibited.

---

F00 Input Update Rules

---

All text input fields must update configuration when the user changes the value. Updating on `input` events is preferred for immediate feedback.

Select controls, checkboxes, toggles, and segmented controls must update configuration when their selected value changes.

The application must not require a "Generate" button to update generated output.

After each update, the application must perform this sequence:

```txt
Read raw control values.
Normalize values.
Validate normalized values.
Derive warnings and assumptions.
If there are no blocking errors, generate nob.c.
Update preview state.
Update bootstrap command.
Update copy/download state.
Update visible validation messages.
Update action status.
```

If blocking validation errors exist, the application must disable copy/download and show the errors. The preview must remain safe to display. The preview may show the last valid generated code, but it must clearly indicate that the current input needs changes.

The application must not silently convert invalid input into a different valid value except for trimming leading and trailing whitespace where permitted by the validation specification.

---

G00 Source Files Behavior

---

The source files control must support one or more source file paths.

A multiline text input with one path per line is acceptable for V1. A repeatable list control is also acceptable if it meets the same functional requirements.

Blank lines in the source files control must be ignored after normalization.

At least one nonblank source path is required.

If all source paths are blank, copy/download must be disabled and the validation area must show a blocking error.

If duplicate source paths are entered, V1 may allow them only if a nonblocking warning is displayed. Preferred behavior is to show a warning and keep generation enabled.

The generated code must append source files in the same order the user provided after blank lines are removed.

The application must not sort source files unless a later specification explicitly requires sorting.

---

H00 Include Paths Behavior

---

The include paths control must support zero or more include path values.

A multiline text input with one include path per line is acceptable for V1.

Blank lines must be ignored after normalization.

If no include paths are entered, generated code must omit include path arguments.

If one or more include paths are entered, generated code must append compiler include arguments according to the compiler/platform specification.

The application must not attempt to verify that include paths exist on the user's machine.

The assumptions or warnings area must not claim that include paths have been verified.

---

I00 Library Flags Behavior

---

The library flags control must support zero or more library or linker arguments.

A multiline text input with one argument per line is acceptable for V1.

Blank lines must be ignored after normalization.

If no library flags are entered, generated code must omit library/linker arguments.

If one or more library flags are entered, generated code must append them to the compiler command according to generated-code ordering rules.

The application must not attempt to discover libraries, validate installed packages, run `pkg-config`, detect SDKs, or check whether linker arguments are valid on the user's machine.

The UI must describe library flags as user-provided linker/compiler arguments, not as discovered dependencies.

---

J00 Compiler And Profile Behavior

---

The compiler command field must control the compiler executable string used in generated code.

The compiler profile selector must represent assumptions about flag style. It must not claim to detect the actual compiler.

The build profile selector must support debug and release.

The warning profile selector must support normal and strict.

When compiler profile, build profile, or warning profile changes, generated flags must update consistently.

If the user changes compiler profile, the application may update default profile-driven flags. It must not overwrite a user-entered compiler command unless the UX explicitly presents that behavior and the user confirms or selects a preset.

The application must show the selected compiler profile in assumptions.

---

K00 Platform Assumption Behavior

---

The platform assumption selector must represent an assumption selected by the user. It must not auto-detect the current operating system and treat that as authoritative.

The selected platform assumption must affect user-visible assumptions.

If the selected platform assumption implies Windows-oriented executable naming, the generated output path must include the configured Windows executable suffix behavior.

If the selected platform assumption implies Unix-like executable naming, the generated output path must not add `.exe` unless the user explicitly entered it as part of the target name or output rules allow it.

The UI must not claim full cross-platform correctness from the platform selector. It must state that platform choices are assumptions.

---

L00 Self-Rebuild Behavior

---

Self-rebuild must be enabled by default.

When self-rebuild is enabled, generated `nob.c` must include the supported self-rebuild starter pattern defined in the generated-template specification.

When self-rebuild is disabled, generated `nob.c` must omit the self-rebuild block.

When self-rebuild is disabled, the validation or warnings area must show a nonblocking warning explaining that changes to `nob.c` will not automatically rebuild the build program.

Disabling self-rebuild must not block copy/download.

---

M00 Comment Verbosity Behavior

---

Comment verbosity must affect generated comments only. It must not alter build behavior.

If concise mode is selected, generated code may include short comments before major blocks.

If minimal mode is selected, generated code must reduce comments while preserving readable structure.

Comment verbosity must not remove required assumptions from the UI assumptions panel.

Comment verbosity must not insert tutorial-length comments into generated code.

---

N00 Live Generated Output Behavior

---

The generated output must update whenever a valid normalized configuration changes.

The generated output must be deterministic. Reapplying the same configuration must produce the same output text.

The generated output must not include timestamps, random identifiers, browser details, current date, current user name, host operating system detection, or other unstable values.

The generated output must not include external network URLs as required runtime dependencies.

The generated output must not include "do not edit" language.

The generated output must not include run, test, clean, install, package manager, dependency discovery, repository scanning, or arbitrary task graph code in V1.

---

O00 Validation Behavior From User Perspective

---

Validation must produce two classes of user-visible messages.

| Class   | Blocks copy/download | Required behavior                                         |
| ------- | -------------------- | --------------------------------------------------------- |
| Error   | Yes                  | User must change input before copying or downloading.     |
| Warning | No                   | User may copy/download, but the UI must state the caveat. |

Validation must run after every input update.

Validation errors must identify the affected field and the correction needed.

A field with a blocking error must have a visible field-level message where practical.

The validation summary must include all current blocking errors.

If only warnings exist, the preview status must remain ready and copy/download must remain enabled.

The application must not hide validation errors inside collapsed advanced sections. If a collapsed section contains an error, the collapsed section summary must show that it contains an error.

---

P00 Blocking Error Conditions

---

V1 must treat these conditions as blocking errors:

| Condition                                                                         | Required user-visible result                                                 |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Empty project name if project name is required by the configuration model         | Show error and disable copy/download.                                        |
| Empty target executable name                                                      | Show error and disable copy/download.                                        |
| Empty source file list                                                            | Show error and disable copy/download.                                        |
| Empty compiler command                                                            | Show error and disable copy/download.                                        |
| Empty output directory if output directory is required by the configuration model | Show error and disable copy/download.                                        |
| Invalid characters that cannot be escaped safely                                  | Show error and disable copy/download.                                        |
| Any value that would produce malformed C string literals                          | Show error and disable copy/download unless escaping rules safely handle it. |
| Internal generation failure                                                       | Show error and disable copy/download.                                        |

The exact validation rules and character policies belong in the validation and security specification. This file requires the user-visible behavior when validation fails.

---

Q00 Nonblocking Warning Conditions

---

V1 must show nonblocking warnings for these conditions when they occur:

| Condition                                                                                     | Required warning intent                                                    |
| --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Self-rebuild disabled                                                                         | Tell user the build program will not auto-rebuild after `nob.c` changes.   |
| Windows-oriented platform assumption                                                          | State that Windows behavior is an assumption, not a portability guarantee. |
| User-provided library flags                                                                   | State that libraries are not discovered or verified.                       |
| User-provided include paths                                                                   | State that include paths are not checked on disk.                          |
| Duplicate source paths if allowed                                                             | State that the same source appears more than once.                         |
| Compiler profile and compiler command appear inconsistent if detectable by simple local rules | State that the selected profile is only an assumption.                     |

Warnings must not block copy/download.

Warnings must not be worded as errors.

Warnings must not claim that the generated code is unsafe unless a blocking error exists.

---

R00 Assumptions Behavior

---

The assumptions panel must update whenever relevant state changes.

The assumptions panel must include these items in all valid and invalid states where the panel can be rendered:

| Assumption            | Required behavior                                                             |
| --------------------- | ----------------------------------------------------------------------------- |
| `nob.h` availability  | State that generated code expects `#include "nob.h"` to work.                 |
| Local-only generation | State that generation happens in the browser and no backend is used.          |
| Executable-only scope | State that V1 generates executable-oriented `nob.c` only.                     |
| Platform assumption   | Reflect selected platform assumption.                                         |
| Compiler assumption   | Reflect selected compiler profile and compiler command.                       |
| Dependency discovery  | State that packages, libraries, SDKs, and installed tools are not discovered. |
| Manual editing        | State that the generated file is intended to be edited after copying.         |

The assumptions panel must not disappear when validation errors exist.

---

S00 Bootstrap Command Behavior

---

The bootstrap command area must display command text derived from the current configuration and assumptions.

The bootstrap command must describe two phases: compile the build program, then run the build program.

If self-rebuild is enabled, the bootstrap panel must state that after the first bootstrap, the generated build program is intended to rebuild itself when `nob.c` changes.

If self-rebuild is disabled, the bootstrap panel must omit the self-rebuild claim and may state that the user must manually recompile the build program after changing `nob.c`.

The bootstrap command must not imply that dependencies are installed or discovered.

The bootstrap command must not auto-run.

The bootstrap command must remain visible when there are validation errors, but it may show a "fix validation errors first" message if command derivation depends on invalid fields.

---

T00 Copy Behavior

---

The copy action must be available only when there are no blocking validation errors and generated output exists.

When the user activates copy in a valid state, the application must attempt to copy the exact current generated `nob.c` text.

On copy success, the application must show visible success feedback.

On copy failure, the application must show visible failure feedback and leave the code preview selectable.

The copy action must not send generated code over the network.

The copy action must not copy assumptions, bootstrap command text, UI labels, or validation messages. It must copy only generated `nob.c`.

If the user changes any input after a copy success message, the copy success status must clear or return to ready.

---

U00 Download Behavior

---

The download action must be available only when there are no blocking validation errors and generated output exists.

When the user activates download in a valid state, the application must download the exact current generated `nob.c` text.

The default downloaded filename must be `nob.c` unless another filename is explicitly specified by a later specification.

The download action must not include assumptions, bootstrap command text, UI labels, or validation messages in the downloaded file. It must download only generated `nob.c`.

The download action must not send generated code over the network.

On detectable download failure, the application must show visible failure feedback.

If the user changes any input after a download success message, the downloaded status must clear or return to ready.

---

V00 Empty States

---

The application must avoid empty core surfaces in normal operation.

| Surface           | Empty state behavior                                                                                                        |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Code preview      | Must not be empty after successful initialization.                                                                          |
| Validation panel  | If no errors or warnings exist, show a concise ready message or omit only the message list while preserving layout clarity. |
| Assumptions panel | Must always contain assumptions.                                                                                            |
| Bootstrap panel   | Must show commands or a validation-dependent message.                                                                       |
| Include paths     | Empty input means no include paths are generated.                                                                           |
| Library flags     | Empty input means no library flags are generated.                                                                           |

The application must not show a blank preview without explanation.

---

W00 Success States

---

V1 must show visible success feedback for these actions:

| Action           | Required success state                     |
| ---------------- | ------------------------------------------ |
| Valid generation | Preview status indicates ready.            |
| Copy             | Status indicates copied.                   |
| Download         | Status indicates downloaded if detectable. |

Success states must not persist after the underlying configuration changes. Once the user edits any control, the state must return to ready or needs changes depending on validation.

Success states must not hide warnings. If warnings exist, they must remain visible after copy or download.

---

X00 Failure States

---

V1 must show visible failure feedback for these failures:

| Failure                       | Required behavior                                          |
| ----------------------------- | ---------------------------------------------------------- |
| Blocking validation errors    | Disable copy/download and show errors.                     |
| Internal generation exception | Disable copy/download and show generation failure message. |
| Clipboard failure             | Show copy failure message and keep preview selectable.     |
| Download failure              | Show download failure message if detectable.               |
| JavaScript unavailable        | Show JavaScript-required message.                          |

Failure messages must be specific enough to explain the failed operation.

The application must not retry copy or download automatically without user action.

The application must not send errors to a remote service.

---

Y00 Prohibited Functional Behavior

---

V1 must not implement these behaviors:

| Prohibited behavior             | Clarification                                                                           |
| ------------------------------- | --------------------------------------------------------------------------------------- |
| Run generated code              | No compile/run button, terminal, WebAssembly compiler, or local command execution.      |
| Read local project files        | No directory picker, file upload import, repository scan, or filesystem access request. |
| Fetch `nob.h`                   | No automatic download or runtime fetch of upstream files.                               |
| Discover dependencies           | No package, SDK, header, or library discovery.                                          |
| Generate run/test/clean targets | No argument dispatcher or target command router in generated `nob.c`.                   |
| Generate libraries              | No static library or shared library output.                                             |
| Persist URL state               | No shareable URLs or query-parameter state in V1.                                       |
| Persist local state             | No local storage persistence unless later spec explicitly allows it.                    |
| Track users                     | No analytics, telemetry, fingerprinting, remote error reporting, or event tracking.     |
| Require build tooling           | No npm, bundler, framework runtime, or code generation step for the website itself.     |

---

Z00 Functional State Transitions

---

The application must support these state transitions.

| From state             | Trigger                                              | To state               | Required transition behavior                      |
| ---------------------- | ---------------------------------------------------- | ---------------------- | ------------------------------------------------- |
| Initializing           | JavaScript initializes successfully                  | Ready                  | Generate default output and enable copy/download. |
| Initializing           | JavaScript fails                                     | Initialization failure | Show fallback or failure message.                 |
| Ready                  | Valid input change                                   | Ready                  | Regenerate output and refresh derived panels.     |
| Ready                  | Invalid input change                                 | Needs changes          | Show errors and disable copy/download.            |
| Needs changes          | Invalid input change remains invalid                 | Needs changes          | Update errors and keep copy/download disabled.    |
| Needs changes          | User fixes all blocking errors                       | Ready                  | Regenerate output and enable copy/download.       |
| Ready                  | User clicks copy and it succeeds                     | Copied                 | Show copied status.                               |
| Ready                  | User clicks copy and it fails                        | Copy failed            | Show failure status and keep output selectable.   |
| Copied                 | Any input change                                     | Ready or Needs changes | Clear copied status and revalidate.               |
| Ready                  | User clicks download and it succeeds or is initiated | Downloaded             | Show downloaded status if detectable.             |
| Ready                  | User clicks download and it fails                    | Download failed        | Show failure status.                              |
| Downloaded             | Any input change                                     | Ready or Needs changes | Clear downloaded status and revalidate.           |
| Ready with warnings    | Warning-causing option removed                       | Ready without warnings | Remove warning while keeping output valid.        |
| Ready without warnings | Warning-causing option added                         | Ready with warnings    | Show warning while keeping copy/download enabled. |

---

AA00 Functional Acceptance Criteria

---

The functional implementation is acceptable only if all criteria in this section pass.

| Criterion                   | Pass condition                                                                                  |
| --------------------------- | ----------------------------------------------------------------------------------------------- |
| Valid initialization        | Page loads into a valid default configuration with generated code visible.                      |
| Live update                 | Editing any required control updates validation and generated output without a generate button. |
| Deterministic output        | Repeating the same control values produces identical generated `nob.c`.                         |
| Required controls           | All V1 controls listed in this file exist and have functional effects.                          |
| No inert controls           | No visible V1 control exists without an implemented effect.                                     |
| Source list support         | User can generate code with more than one source file.                                          |
| Include path support        | User can generate code with zero or more include paths.                                         |
| Library flag support        | User can generate code with zero or more library flags.                                         |
| Debug/release support       | Build profile changes generated flags or assumptions according to later specs.                  |
| Warning profile support     | Warning profile changes generated flags or assumptions according to later specs.                |
| Platform assumption support | Platform selector changes assumptions and output naming behavior where specified.               |
| Self-rebuild default        | Self-rebuild is enabled in the default state.                                                   |
| Self-rebuild warning        | Disabling self-rebuild shows a nonblocking warning.                                             |
| Validation blocking         | Blocking errors disable copy/download.                                                          |
| Warning nonblocking         | Warnings do not disable copy/download.                                                          |
| Assumptions visible         | Assumptions are visible in ready and invalid states.                                            |
| Bootstrap visible           | Bootstrap command panel is visible in ready and invalid states.                                 |
| Copy exactness              | Copy action copies only the current generated `nob.c` text.                                     |
| Download exactness          | Download action downloads only the current generated `nob.c` text.                              |
| State reset after edit      | Copy/download success status clears after any input change.                                     |
| No prohibited functions     | No out-of-scope V1 behavior is present.                                                         |

---

AB00 Definition Of Done For This Specification File

---

This file is complete when it defines functional initialization, state model behavior, required controls, update rules, source/include/library behavior, compiler/platform/profile behavior, self-rebuild behavior, comment behavior, generated-output triggers, validation behavior, assumption behavior, bootstrap behavior, copy/download behavior, empty states, success states, failure states, prohibited behavior, state transitions, and functional acceptance criteria.

This file intentionally does not define exact generated C text, exact validation rules, exact CSS layout, exact compiler flag mappings, fixture files, or implementation file structure.

