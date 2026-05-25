---

A00 02 User Experience

---

Document path: `docs/product-spec/02-user-experience.md`

This file defines the user experience requirements for V1 of the `nob.h` / `nob.c` boilerplate generator. It controls screen layout, workflows, first viewport behavior, control grouping, generated-code preview behavior, user-visible panels, copy/download interactions, responsive behavior, keyboard and accessibility requirements, and visible product states.

This file does not define the exact JavaScript configuration object, exact generated `nob.c` template text, exact validation regexes, exact compiler flag mappings, or fixture contents. Those must be specified in separate documents.

---

B00 UX Thesis

---

The V1 interface must be a tool-first page. The first viewport must show usable controls and a generated `nob.c` preview immediately. It must not start with a marketing hero, landing page, tutorial page, feature grid, or installation guide.

The generated code preview is the primary surface. Configuration controls, validation messages, assumptions, bootstrap command output, and explanations exist to help the user trust, adjust, copy, or download the generated `nob.c`.

The UX must support two simultaneous needs: first-time users must be able to use safe defaults without reading a long explanation, and power users must be able to quickly modify meaningful build settings without fighting a wizard.

---

C00 Primary User Workflow

---

The default workflow is:

```txt
Open page
See valid generated nob.c immediately
Review or edit configuration controls
Watch generated nob.c update live
Review validation messages and assumptions
Review bootstrap command
Copy or download nob.c
Place nob.c next to nob.h in project
Bootstrap using shown command
Continue editing nob.c manually
```

The page must not require account creation, project creation, onboarding completion, multi-step wizard navigation, file upload, repository selection, network access, or browser storage permission before showing generated code.

The user must be able to complete the core workflow using only the initial page view plus scrolling if the viewport is small.

---

D00 First Viewport Layout

---

On desktop-width screens, defined as viewports at or above `960px` CSS width, the first viewport must use a two-column layout.

| Region               | Desktop position | Required contents                                                                                |
| -------------------- | ---------------- | ------------------------------------------------------------------------------------------------ |
| Header bar           | Top, full width  | Product name, one-line purpose, optional compact links or status text.                           |
| Configuration column | Left side        | Primary controls, advanced controls, validation summary, assumptions summary, bootstrap command. |
| Preview column       | Right side       | Generated `nob.c` preview, copy button, download button, preview status.                         |

The code preview must be visible in the first viewport on desktop screens without requiring the user to scroll.

The configuration controls must be visible in the first viewport on desktop screens without requiring the user to open a menu.

The first viewport must not allocate more vertical space to branding than to the actual tool. Header height should remain compact. A practical target is one short row or a small two-line header.

A permitted desktop wireframe is:

```txt
+------------------------------------------------------------+
| nob.c Boilerplate Generator     Generate a starter nob.c   |
+-----------------------------+------------------------------+
| Project settings            | Generated nob.c        [Copy] |
| Source and output           | [Download]                   |
| Compiler and platform       |                              |
| Advanced options            | code preview                 |
| Validation                  |                              |
| Assumptions                 |                              |
| Bootstrap command           |                              |
+-----------------------------+------------------------------+
```

---

E00 Responsive Layout

---

On tablet or narrow desktop screens, defined as `720px` to `959px` CSS width, the page may keep two columns if both remain readable. If either column becomes cramped, the layout must switch to stacked sections in this order:

```txt
Header
Primary controls
Generated code preview
Copy/download actions
Validation
Assumptions
Bootstrap command
Advanced controls
Explanations
```

On phone-width screens, defined as below `720px` CSS width, the page must use a single-column layout. The generated code preview must remain reachable without opening a modal. Copy and download actions must remain directly adjacent to the preview or immediately above it.

On small screens, advanced controls may be collapsed by default only if primary controls, validation state, generated preview, copy/download, and bootstrap command remain easy to reach.

The implementation must not depend on horizontal scrolling for the main layout. The code preview may scroll horizontally inside its own code container because C code lines can be long.

---

F00 Header Requirements

---

The header must identify the tool and state its purpose in one concise sentence.

Required visible meaning:

```txt
Generate a ready-to-edit nob.c starter for executable C projects using nob.h.
```

The header must not claim official affiliation unless that status is separately established.

The header must not describe the product as a full build system, package manager, dependency resolver, IDE, or CMake replacement.

The header may include a short local-only note such as:

```txt
Runs locally in your browser. No backend.
```

---

G00 Control Grouping

---

The configuration column must group controls by user intent. Each group must have a visible heading. The group headings must be short and concrete.

Required groups:

| Group              | Purpose                                                                 | Required controls or summaries                                                                       |
| ------------------ | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Project            | Identify the generated starter and target artifact.                     | Project name, target executable name.                                                                |
| Sources and output | Define what gets compiled and where the executable goes.                | Source files, output directory or output path, platform-based executable suffix behavior if visible. |
| Compiler           | Define compiler and build profile assumptions.                          | Compiler command, compiler profile, platform assumption, warning profile, build profile.             |
| Advanced           | Provide power-user customization without overwhelming the default flow. | Include paths, library flags, self-rebuild toggle, comment verbosity.                                |
| Validation         | Show blocking problems and nonblocking warnings.                        | Validation summary and field-specific messages.                                                      |
| Assumptions        | State what the generated code assumes.                                  | `nob.h` availability, platform/compiler assumptions, local-only behavior, unsupported cases.         |
| Bootstrap          | Show how to bootstrap the generated `nob.c`.                            | Command text derived from current platform/compiler assumptions.                                     |

The primary groups visible by default must be Project, Sources and output, Compiler, Preview, Validation, Assumptions, and Bootstrap.

The Advanced group may be expanded by default on desktop if it does not crowd the initial viewport. On narrow screens it may be collapsed by default. If collapsed, the collapsed state must show a concise summary of active advanced values, such as include path count and library flag count.

---

H00 Required Controls

---

The UX must expose these controls in V1.

| Control                | Control type                             | Required user-visible behavior                                              |
| ---------------------- | ---------------------------------------- | --------------------------------------------------------------------------- |
| Project name           | Text input                               | Updates assumptions or generated comment text if comments are enabled.      |
| Target executable name | Text input                               | Updates generated output executable name.                                   |
| Source files           | Multi-line text input or repeatable list | Supports one or more source file paths. One path per line is acceptable.    |
| Output directory       | Text input                               | Updates generated output path and assumptions.                              |
| Platform assumption    | Select                                   | Affects assumptions and output naming behavior.                             |
| Compiler profile       | Select                                   | Affects compiler flag presets and assumptions.                              |
| Compiler command       | Text input                               | Sets the compiler executable string used in generated command construction. |
| Build profile          | Select or segmented control              | Supports debug and release.                                                 |
| Warning profile        | Select or segmented control              | Supports normal and strict.                                                 |
| Include paths          | Multi-line text input or repeatable list | Supports zero or more include path values.                                  |
| Library flags          | Multi-line text input or repeatable list | Supports zero or more library/linker arguments.                             |
| Self-rebuild           | Checkbox or toggle                       | Enabled by default. If disabled, must show a nonblocking warning.           |
| Comment verbosity      | Select or segmented control              | Supports at least concise and minimal if implemented.                       |

Every control must have a visible label. Placeholder text must not be the only label.

Every control must have either nearby helper text or be understandable from its label. Helper text must be short and practical. It must not become a tutorial paragraph.

---

I00 Default Values

---

The page must load into an initial valid state. The user must not need to type before seeing generated code.

Required default intent:

| Field                  | Required default behavior                                      |
| ---------------------- | -------------------------------------------------------------- |
| Project name           | Nonempty sample project label.                                 |
| Target executable name | Nonempty executable name.                                      |
| Source files           | At least one source file path, such as `src/main.c`.           |
| Output directory       | Nonempty output directory, such as `build`.                    |
| Platform assumption    | A default platform assumption must be selected.                |
| Compiler profile       | A default compiler profile must be selected.                   |
| Compiler command       | A nonempty compiler command must be present.                   |
| Build profile          | Debug or equivalent development-friendly profile by default.   |
| Warning profile        | Normal warnings by default.                                    |
| Include paths          | Empty or one safe default only if justified by generated code. |
| Library flags          | Empty by default.                                              |
| Self-rebuild           | Enabled by default.                                            |
| Comment verbosity      | Concise by default.                                            |

Defaults must be internally consistent. The default preview must not show validation errors.

---

J00 Generated Code Preview

---

The preview must display the complete current generated `nob.c` text.

The preview must use a text-preserving element such as `pre` and `code`, or an equivalent structure that preserves indentation and line breaks.

The preview must render generated code as text. It must not insert generated code through unsafe HTML interpolation.

The preview must update after every valid input change. If an input becomes invalid, the preview may either keep showing the last safe generated code or show a generated preview with invalid fields omitted only if this behavior is explicitly defined in the validation specification. V1 must not display malformed C as if it were valid.

The preview must include a status label near the code area.

Required status meanings:

| Status          | Meaning                                                                                |
| --------------- | -------------------------------------------------------------------------------------- |
| Ready           | Current configuration has no blocking validation errors and copy/download are enabled. |
| Needs changes   | Current configuration has blocking validation errors and copy/download are disabled.   |
| Copied          | Copy action succeeded recently.                                                        |
| Downloaded      | Download action completed recently if detectable.                                      |
| Copy failed     | Clipboard action failed.                                                               |
| Download failed | Download action failed.                                                                |

The status label must not rely on color alone. It must include text.

---

K00 Preview Actions

---

The preview area must include copy and download actions.

The copy action must copy exactly the generated `nob.c` text associated with the current valid configuration.

The download action must download exactly the generated `nob.c` text associated with the current valid configuration.

When there are blocking validation errors, copy and download controls must be disabled or must refuse the action with a visible blocking message. Disabling is preferred.

The copy button label must be explicit, such as:

```txt
Copy nob.c
```

The download button label must be explicit, such as:

```txt
Download nob.c
```

After successful copy, the UI must show a visible confirmation. The confirmation may be temporary, but it must last long enough to be noticed. A practical target is at least 2 seconds.

If copy fails, the UI must show a visible failure message and leave the code preview selectable.

If download fails, the UI must show a visible failure message.

Copy and download actions must not send generated code to any server.

---

L00 Validation UX

---

Validation must be visible before the user attempts copy or download.

The validation area must distinguish blocking errors from nonblocking warnings or assumptions.

Required validation categories:

| Category   | Blocks copy/download | Required presentation                                                 |
| ---------- | -------------------- | --------------------------------------------------------------------- |
| Error      | Yes                  | Clear message identifying the affected field and required correction. |
| Warning    | No                   | Clear caveat about allowed but potentially risky configuration.       |
| Assumption | No                   | Plain statement about what the generated code assumes.                |

The validation summary must appear near the controls and must also affect the preview action state.

Field-specific errors must be placed near the relevant field when practical. A summary alone is not sufficient for required text inputs.

Error messages must be actionable. For example, "Source files are invalid" is not sufficient. "Add at least one source file path, one per line" is acceptable.

The page must not silently coerce invalid user input into a different value without a visible indication. Trimming leading and trailing whitespace may be allowed if defined in the validation specification.

---

M00 Assumptions Panel

---

The assumptions panel must be visible in the core workflow. It may be compact, but it must not be hidden behind a separate documentation page.

The assumptions panel must state these facts in user-visible language:

| Assumption                       | Required user-visible meaning                                                   |
| -------------------------------- | ------------------------------------------------------------------------------- |
| `nob.h` availability             | The generated file expects `nob.h` to be available to `#include "nob.h"`.       |
| Starter scope                    | The generated file is a starting point intended for manual editing.             |
| Executable-only V1               | V1 generates executable-oriented `nob.c` files only.                            |
| Platform                         | The selected platform is an assumption, not an auto-detected guarantee.         |
| Compiler                         | The selected compiler profile is an assumption, not an auto-detected guarantee. |
| Local-only                       | Generation happens in the browser without backend service.                      |
| Unsupported dependency discovery | The tool does not discover packages, libraries, SDKs, or installed tools.       |

The assumptions panel must update when relevant controls change.

The assumptions panel must not be styled as an error unless a blocking error exists.

---

N00 Bootstrap Command Panel

---

The bootstrap command panel must show the command or commands the user is expected to run after saving `nob.c`.

The panel must be derived from current compiler and platform assumptions.

The bootstrap command panel must not claim that commands are guaranteed to work on every machine.

The panel must include enough information for the user to understand the expected sequence:

```txt
Compile the build program once.
Run the build program.
After that, the generated nob.c self-rebuilds when enabled.
```

The exact command text belongs to the platform/compiler specification, but the UX must provide a dedicated visible area for it.

The command text must be selectable and copyable as normal text. A separate "copy bootstrap command" action is optional and not required in V1.

---

O00 Block-Level Explanations

---

The page must provide short explanations for major generated-code blocks. These explanations may appear beside controls, in an explanation panel, or as compact labels associated with generated sections.

Required explanation topics:

| Topic                       | Required explanation intent                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------------- |
| `NOB_IMPLEMENTATION`        | Explain that one C file defines the implementation before including `nob.h`.                |
| `#include "nob.h"`          | Explain that the generated file expects `nob.h` to be available.                            |
| Self-rebuild                | Explain that the build program can rebuild itself when `nob.c` changes.                     |
| Output directory            | Explain that the build output directory is prepared before compiling when needed.           |
| Command construction        | Explain that compiler arguments are appended explicitly instead of building a shell string. |
| Source files                | Explain that each configured source path is compiled into the target command.               |
| Include paths and libraries | Explain that advanced include/library values are appended to the compiler command.          |
| Failure return              | Explain that failed build commands should produce a nonzero exit result.                    |

Explanations must be concise. A practical maximum is two short sentences per topic.

The page must not become a tutorial site. It must not require users to progress through lessons, chapters, quizzes, or long educational text before copying code.

---

P00 Advanced Controls Behavior

---

Advanced controls must support power users without changing the tool into a full build-system designer.

The Advanced group must contain only controls that are in V1 scope. It must not include disabled placeholders for deferred features.

Permitted V1 advanced controls are include paths, library flags, self-rebuild toggle, comment verbosity, and any compiler/profile controls that the UI chooses to place under Advanced rather than Compiler.

Prohibited advanced controls in V1 include run target, test target, clean target, install target, package manager fields, repository import, project archive generation, CMake conversion, arbitrary build graph nodes, URL state, and diff view.

If the user disables self-rebuild, the UI must show a nonblocking warning explaining that the generated build program will not automatically rebuild itself when `nob.c` changes.

---

Q00 User-Visible States

---

The implementation must support these user-visible states.

| State                  | Trigger                                                                | Required visible behavior                                              |
| ---------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Initial valid          | Page load with defaults.                                               | Generated code visible, no blocking errors, copy/download enabled.     |
| Valid edited           | User changes inputs and validation passes.                             | Preview, assumptions, bootstrap command, and status update.            |
| Invalid edited         | User changes inputs and validation fails.                              | Blocking errors visible, copy/download disabled, preview remains safe. |
| Empty source list      | Source list contains no usable entries.                                | Error near source field and in validation summary.                     |
| Advanced active        | User enters include paths, library flags, or changes advanced toggles. | Advanced group shows active values and generated code updates.         |
| Warning only           | Configuration has caveats but no blocking errors.                      | Warning visible, copy/download enabled.                                |
| Copy success           | User copies valid code successfully.                                   | Confirmation visible and status changes to copied.                     |
| Copy failure           | Clipboard operation fails.                                             | Failure visible, code remains selectable.                              |
| Download success       | User downloads valid code.                                             | Confirmation visible if detectable.                                    |
| Download failure       | Download cannot be completed.                                          | Failure visible.                                                       |
| JavaScript unavailable | JavaScript is disabled or fails before initialization.                 | Static fallback says JavaScript is required.                           |
| Small viewport         | Viewport below responsive breakpoint.                                  | Layout stacks without hiding core workflow.                            |

---

R00 Keyboard Requirements

---

All controls must be reachable and operable with a keyboard.

Tab order must follow the visual order of the page.

Required tab order on desktop:

```txt
Header links if any
Project controls
Sources and output controls
Compiler controls
Advanced controls
Validation links or focusable details if any
Assumptions links or focusable details if any
Bootstrap command area controls if any
Copy nob.c
Download nob.c
Generated code preview if focusable
```

If the preview is focusable, it must not trap keyboard focus.

Buttons must be real `button` elements unless there is a specific reason not to use them.

Form fields must be real form controls where possible.

Keyboard users must be able to copy the generated code by focusing the copy button and pressing Enter or Space.

Keyboard users must be able to download the generated code by focusing the download button and pressing Enter or Space.

Collapsed sections, if used, must be operable with keyboard and must expose expanded/collapsed state to assistive technology.

---

S00 Accessibility Requirements

---

Every input must have a programmatically associated label.

Validation messages must be associated with the relevant field when practical, using accessible relationships such as `aria-describedby` where appropriate.

The validation summary or status region must announce meaningful changes to assistive technology. A polite live region is acceptable for validation and copy/download status.

Color must not be the only method for communicating error, warning, success, disabled, or active states.

Text contrast must be sufficient for normal reading. Do not use low-contrast gray text for required instructions, labels, errors, warnings, assumptions, or code.

The code preview must use a readable monospace font stack. Font size must be large enough for practical reading. A practical minimum is `13px`, with `14px` or larger preferred.

Clickable and tappable controls must have adequate hit area. A practical minimum target size is `40px` high for primary buttons and form controls where layout allows.

The page must remain usable at browser zoom levels up to at least 200 percent.

The layout must not require drag interaction.

Animations, if any, must be nonessential. The interface must remain usable when reduced-motion preferences are enabled.

---

T00 Content And Tone Requirements

---

User-facing text must be direct and practical.

The page must avoid marketing claims such as:

```txt
The ultimate C build system.
Works everywhere.
Replaces CMake.
Automatically handles dependencies.
Production-ready for every project.
Official nob.h generator.
```

The page may use claims such as:

```txt
Generate a starter nob.c for executable C projects.
Review and edit the generated C before using it.
Platform choices are assumptions, not guarantees.
```

Error messages must describe what to change.

Warnings must describe the caveat without blocking the user.

Assumptions must be factual and concise.

---

U00 Edge Cases

---

If the viewport is too short to show all panels, the preview must remain accessible through normal page scrolling. The implementation must not hide the preview behind a fixed-height container that prevents access to copy/download controls.

If a user enters a very long source path, include path, library flag, or compiler command, the control must remain usable. The layout must not break horizontally. The generated code preview may scroll horizontally.

If the generated code is long, the preview must remain scrollable or page-scrollable. Copy/download buttons must remain easy to find near the preview.

If multiple validation errors exist, all blocking errors must be visible. The UI must not show only the first error unless the validation summary clearly indicates additional errors.

If JavaScript initialization fails after the static HTML loads, the page must not show stale or misleading generated output. A static fallback or initialization error message is acceptable.

If copy succeeds and then the user edits a field, the copied status must be cleared or replaced with the current validation/ready status.

If download succeeds and then the user edits a field, the downloaded status must be cleared or replaced with the current validation/ready status.

If an advanced section is collapsed and contains invalid fields, the collapsed summary must indicate that the section has errors.

---

V00 Acceptance Criteria

---

The UX implementation is acceptable only if all criteria in this section pass.

| Criterion                 | Pass condition                                                                                                                                                                            |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tool-first first viewport | On desktop, the user sees controls and generated code preview without dismissing a landing page or completing onboarding.                                                                 |
| Valid default state       | Opening the page displays valid generated code, assumptions, bootstrap command, and enabled copy/download actions.                                                                        |
| Control grouping          | Required control groups exist with visible headings and no out-of-scope placeholder controls.                                                                                             |
| Live preview              | Changing a valid input updates generated code without requiring a separate generate button.                                                                                               |
| Blocking validation       | Invalid required inputs show errors and disable copy/download.                                                                                                                            |
| Warning behavior          | Nonblocking caveats show warnings while keeping copy/download enabled.                                                                                                                    |
| Assumptions visibility    | The assumptions panel is visible in the core workflow and updates when relevant controls change.                                                                                          |
| Bootstrap visibility      | The bootstrap command panel is visible in the core workflow.                                                                                                                              |
| Copy behavior             | Copy action is available only for valid output and shows success or failure feedback.                                                                                                     |
| Download behavior         | Download action is available only for valid output and shows failure feedback if it cannot complete.                                                                                      |
| Safe preview rendering    | Generated code is rendered as text, not interpreted as HTML.                                                                                                                              |
| Responsive layout         | The page remains usable below `720px` width without horizontal scrolling of the full page.                                                                                                |
| Keyboard operation        | All controls and actions are reachable and operable by keyboard.                                                                                                                          |
| Field labels              | Every input has a visible and programmatically associated label.                                                                                                                          |
| No forbidden UX           | The page does not contain login, telemetry prompts, repository import, package manager controls, compile/run buttons, URL sharing controls, diff view, or run/test/clean target controls. |

---

W00 Implementation Notes Constrained To UX

---

The page may use a normal form structure, but it must not require submit navigation. Input changes should update local state and regenerate the preview.

The page may include collapsible sections, but no required V1 control may be permanently hidden behind hover-only interaction.

The page may include syntax coloring only if it is implemented locally without external dependencies and without compromising safe text rendering. Syntax coloring is not required for V1.

The page may include a reset-to-defaults button only if the behavior is explicit and does not introduce persistence or URL state. If implemented, it must ask for confirmation only if the user has unsaved changes that would be lost from the current form state.

The page must not include a "Generate" button as the main workflow. A generate button is allowed only as a secondary affordance if live generation already works and the button simply refreshes from current state. The preferred behavior is live generation without a generate button.

---

X00 Definition Of Done For This Specification File

---

This file is complete when it defines the primary workflow, first viewport layout, responsive layout, header requirements, control grouping, required controls, defaults, preview behavior, preview actions, validation UX, assumptions panel, bootstrap panel, block-level explanations, advanced controls behavior, user-visible states, keyboard requirements, accessibility requirements, content requirements, edge cases, and UX acceptance criteria.

This file intentionally does not define the exact configuration schema, exact generated C template, exact validation rules, exact platform command mappings, copy/download implementation internals, or fixture contents.

