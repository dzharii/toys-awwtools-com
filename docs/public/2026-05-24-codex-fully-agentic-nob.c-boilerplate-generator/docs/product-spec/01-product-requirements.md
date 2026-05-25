---

A00 01 Product Requirements

---

Document path: `docs/product-spec/01-product-requirements.md`

This file defines the product requirements for V1 of the `nob.h` / `nob.c` boilerplate generator. It is the controlling scope document for implementation. Any feature not explicitly included in this file is out of scope for V1 unless a later decision record adds it.

---

B00 Product Thesis

---

The product is a conservative, copy-first, static browser tool that generates a readable, ready-to-edit `nob.c` starter file for executable-oriented C projects that use `nob.h`.

The primary product surface is the generated code preview. Configuration controls exist to transform the generated `nob.c`, explain the effect of selected options, and help the user copy or download the final file.

The product must not hide the `nob.h` build-in-C model behind an abstract build-system UI. It must produce code that a user can inspect, understand, copy into a repository, bootstrap with a C compiler, and continue editing manually.

The V1 product must prioritize generated-code correctness, deterministic output, validation, safe browser rendering, copy/download reliability, and scope control over visual polish or feature breadth.

---

C00 Primary User Job

---

When a C developer wants to start using `nob.h`, they need a trustworthy `nob.c` starter file that matches their executable project shape, source files, compiler assumptions, flags, output name, include paths, and libraries, so they can copy the file into their project and continue editing it as normal C code.

The job is complete only when the user can copy or download a generated `nob.c` file that is readable, deterministic, and consistent with the visible configuration.

The job is not complete merely because the page displays a snippet. The generated code must be treated as the product artifact.

---

D00 Target Users

---

| User class                 | Required V1 support                                                                                                                                                    |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First-time `nob.h` adopter | Provide safe defaults, concise explanations, a visible bootstrap command, and generated code that follows a clear starter pattern.                                     |
| Power-user C developer     | Provide direct control over compiler command, source files, output path, warning/debug settings, include paths, libraries, platform assumption, and comment verbosity. |
| Open-source maintainer     | Produce readable generated code with concise assumptions and no "do not edit" language. The file must look suitable for manual maintenance.                            |
| Skeptical evaluator        | Preserve the transparent build-in-C model. Do not imply the tool replaces Make, CMake, Meson, package managers, or dependency discovery.                               |
| Cross-platform user        | State platform assumptions clearly. Do not promise universal portability. Apply output naming and compiler-profile assumptions consistently.                           |

---

E00 V1 Product Scope

---

V1 must implement one static web page or static page set using plain HTML, CSS, and JavaScript. The implementation must require no build step, backend service, package installation, framework runtime, account, telemetry, or remote API.

V1 must generate one kind of artifact: a single `nob.c` file for executable-oriented C projects.

V1 must include these user-facing areas:

| Area                     | Required behavior                                                                                           |
| ------------------------ | ----------------------------------------------------------------------------------------------------------- |
| Configuration controls   | Let the user edit project/build settings that directly affect the generated `nob.c` or visible assumptions. |
| Live code preview        | Regenerate the displayed `nob.c` immediately after valid configuration changes.                             |
| Validation area          | Display blocking errors for invalid input and nonblocking warnings or assumptions where relevant.           |
| Assumptions area         | State platform, compiler, `nob.h`, source, output, and unsupported-feature assumptions.                     |
| Bootstrap command area   | Show the command sequence the user is expected to run after saving `nob.c`.                                 |
| Block-level explanations | Show short explanations for major generated-code blocks without turning the page into a tutorial.           |
| Copy action              | Copy the current generated `nob.c` when there are no blocking validation errors.                            |
| Download action          | Download the current generated `nob.c` when there are no blocking validation errors.                        |

V1 must include these configuration capabilities:

| Capability             | Required V1 behavior                                                                                                             |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Project name           | Accept a human-readable project label used in assumptions or comments where applicable.                                          |
| Target executable name | Control the generated output executable name.                                                                                    |
| Source files           | Support one or more source file paths.                                                                                           |
| Output directory       | Control the generated output directory or output path behavior.                                                                  |
| Compiler command       | Let the user choose or enter the compiler command within validation rules defined later.                                         |
| Compiler profile       | Provide at least generic GCC/Clang-style and Windows-oriented assumptions, or explicitly label unsupported profiles as deferred. |
| Platform assumption    | Let the user select a platform assumption used for output naming and assumptions text.                                           |
| Build profile          | Support debug and release-oriented flag presets.                                                                                 |
| Warning profile        | Support at least a normal warning preset and a stricter warning preset.                                                          |
| Include paths          | Allow zero or more include paths.                                                                                                |
| Library flags          | Allow zero or more library/linker arguments.                                                                                     |
| Self-rebuild           | Enable the documented `nob.h` self-rebuild starter pattern by default.                                                           |
| Comment verbosity      | Allow concise comments by default and a more minimal output mode if implemented.                                                 |

Every visible control in V1 must have at least one of these effects: changes generated `nob.c`, changes bootstrap command output, changes validation state, or changes assumptions text. Controls with no product effect are prohibited.

---

F00 Generated Code Requirements At Product Level

---

The generated artifact must be a `nob.c` starter file, not a complete project archive.

The generated code must default to prefixed `nob.h` API names. V1 must not generate stripped-prefix `nob.h` API style unless a later specification explicitly adds and validates that option.

The generated code must assume the user already has `nob.h` available next to `nob.c` or otherwise reachable by `#include "nob.h"`. V1 must not fetch, vendor, embed, download, or update `nob.h`.

The generated code must be deterministic. The same configuration state must always produce the same `nob.c` text, byte-for-byte except for browser-dependent line ending behavior if explicitly specified later.

The generated code must be readable as user-owned C code. It must not contain "generated file, do not edit" language. It may contain a concise header comment that states assumptions and indicates the file is intended to be edited.

The generated code must include only starter patterns that are deliberately supported by V1. If a control would require unsupported build-graph behavior, dependency discovery, generated files, test dispatch, clean targets, or package installation, that control must not exist in V1.

---

G00 Product States

---

| State                   | Definition                                                                      | Required behavior                                                                                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Initial valid state     | Page has loaded with default configuration.                                     | Display generated `nob.c`, assumptions, bootstrap command, enabled copy/download actions, and no blocking errors.                                                  |
| Edited valid state      | User changes controls and all values remain valid.                              | Immediately regenerate code, assumptions, and bootstrap command. Keep copy/download enabled.                                                                       |
| Invalid input state     | One or more fields contain values that would create malformed or unsafe output. | Show blocking validation errors. Keep preview visible if safe. Disable copy/download. Do not silently repair values unless the relevant spec explicitly allows it. |
| Empty source state      | Source file list has no usable source paths.                                    | Show a blocking validation error. Do not allow copy/download.                                                                                                      |
| Warning state           | Configuration is allowed but has caveats, such as platform assumptions.         | Show nonblocking warning or assumption text. Keep copy/download enabled.                                                                                           |
| Clipboard failure state | Copy action fails due to browser permission or API failure.                     | Show a visible failure message and keep generated code selectable. Do not send data anywhere.                                                                      |
| Download failure state  | Download action cannot be completed.                                            | Show a visible failure message. Do not send data anywhere.                                                                                                         |
| No JavaScript state     | Browser cannot run JavaScript.                                                  | The page may display a static message that JavaScript is required for generation. It must not pretend to generate code.                                            |

---

H00 Required Assumptions

---

V1 must visibly state these assumptions in the product or generated output where appropriate:

| Assumption                       | Required wording intent                                                                              |
| -------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `nob.h` availability             | The user must already have `nob.h`; the tool does not fetch or vendor it.                            |
| Starter-only scope               | The generated file is a starting point for manual editing, not a complete build-system solution.     |
| Executable-only V1               | V1 generates executable-oriented `nob.c` files only.                                                 |
| Platform assumptions             | Platform selection affects generated naming and flags, but does not guarantee universal portability. |
| Compiler assumptions             | Compiler profiles are presets or assumptions, not auto-detected facts.                               |
| Local-only behavior              | Configuration and generated code remain in the browser; no backend is used.                          |
| Unsupported dependency discovery | The tool does not detect installed libraries, headers, package managers, or system configuration.    |

---

I00 V1 Non-Goals

---

V1 must not implement the following:

| Non-goal                      | Prohibited behavior                                                                                                |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Full IDE                      | No project tree editor, source editor, terminal, debugger, file browser, or build output console.                  |
| Full build-system replacement | No arbitrary build graph designer, install target system, watch mode, release packaging, or task orchestration UI. |
| Package manager               | No package search, dependency installation, dependency update, registry lookup, or package lock generation.        |
| Dependency discovery          | No automatic `pkg-config`, CMake, Meson, system header, library, SDK, or toolchain discovery.                      |
| Repository scanning           | No reading local folders, parsing project files, importing existing repositories, or asking for filesystem access. |
| Browser compilation           | No compiling C in the browser, no executing generated code, and no WebAssembly build runner.                       |
| Backend service               | No server-side generation, accounts, hosted user projects, database, cloud save, login, or remote API.             |
| Telemetry                     | No analytics, event tracking, error reporting, fingerprinting, or remote logging.                                  |
| Framework runtime             | No React, Vue, Svelte, Angular, runtime component framework, npm package, bundler, or generated build step.        |
| URL state                     | No shareable configuration URLs in V1.                                                                             |
| Diff view                     | No generated-code diff system in V1.                                                                               |
| Static library generation     | No static library, shared library, library-plus-executable, or package layout generation in V1.                    |
| Run/test/clean targets        | No generated run target, test target, clean target, argument dispatcher, or command router in V1.                  |
| Official branding             | Do not imply the tool is official unless that status is explicitly established outside this spec.                  |

---

J00 Deferred Features

---

These features are allowed as future candidates but must not be implemented in V1:

| Deferred feature                    | Reason deferred                                                            |
| ----------------------------------- | -------------------------------------------------------------------------- |
| Preset gallery                      | Increases generated-code paths before the first template is proven.        |
| Run/test/clean target generation    | Requires argument dispatch and more platform-sensitive command behavior.   |
| Static library generation           | Requires a separate project shape and archive tool assumptions.            |
| Shared library generation           | Requires platform-specific naming and linker behavior.                     |
| URL-encoded configuration           | Requires state serialization, validation versioning, and import behavior.  |
| Local storage persistence           | Requires restore/reset states and privacy messaging.                       |
| JSON import/export                  | Requires schema versioning and invalid imported config handling.           |
| Diff against minimal output         | Adds UI complexity before core generation is stable.                       |
| Syntax highlighting                 | Nice to have, but not required for correct generated code.                 |
| Project archive download            | Requires multi-file generation and more validation.                        |
| README snippet generation           | Useful later, but V1 must focus on `nob.c`.                                |
| `pkg-config` helpers                | Dependency discovery and shell/tool availability are outside V1.           |
| Stripped-prefix `nob.h` API style   | Adds another generated-code style and possible name collision concerns.    |
| Experimental `nob.h` macro controls | Too easy to expose unsafe or unstable behavior without full documentation. |

---

K00 Release Gates

---

V1 must not be considered complete unless every gate in this section passes.

| Gate                | Pass condition                                                                                                                                                                                                        |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Static-only gate    | The project runs from static HTML/CSS/JS files with no build tool, package install, backend, framework runtime, telemetry, or remote dependency.                                                                      |
| Initial-state gate  | Opening the page displays a valid default generated `nob.c`, bootstrap command, assumptions, and enabled copy/download actions.                                                                                       |
| Generated-code gate | The default generated `nob.c` follows the supported executable starter shape, uses prefixed `nob.h` APIs, assumes `#include "nob.h"`, includes self-rebuild by default, and returns failure on failed build commands. |
| Determinism gate    | The same configuration produces identical generated output on repeated renders.                                                                                                                                       |
| Validation gate     | Invalid input produces visible blocking errors and disables copy/download.                                                                                                                                            |
| Safe-rendering gate | Generated code is rendered as text, not interpreted HTML. User input cannot inject markup into the page.                                                                                                              |
| Escaping gate       | User-controlled strings included in generated C are escaped or rejected according to the validation and escaping specification.                                                                                       |
| Copy gate           | Copy action copies exactly the current generated `nob.c` when valid and reports failure when the browser blocks copying.                                                                                              |
| Download gate       | Download action saves the current generated `nob.c` as a file named `nob.c` or another explicitly specified filename.                                                                                                 |
| Assumptions gate    | The UI states local-only behavior, `nob.h` availability, platform assumptions, compiler assumptions, and unsupported dependency discovery.                                                                            |
| Non-goal gate       | No prohibited V1 feature is implemented.                                                                                                                                                                              |
| Fixture gate        | Required fixture configurations and expected outputs exist according to the fixtures specification.                                                                                                                   |

---

L00 Success Criteria

---

The V1 product is successful if all of the following are true:

| Criterion                | Measurement                                                                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Useful default           | A user can open the page and copy a reasonable starter `nob.c` without changing any controls.                                                    |
| Practical customization  | A user can configure at least target name, source files, output path, compiler/profile assumptions, include paths, libraries, and build profile. |
| Power-user trust         | The generated code is explicit, readable, and free of hidden build logic.                                                                        |
| Beginner approachability | The page provides concise explanations and a visible bootstrap command without requiring the user to read a tutorial first.                      |
| Scope discipline         | The product does not include V1 non-goals.                                                                                                       |
| Local privacy            | No configuration or generated code leaves the browser.                                                                                           |
| Maintainer clarity       | Future maintainers can trace visible controls to configuration fields and generated output behavior.                                             |
| Safe failure             | Invalid input blocks copy/download rather than generating broken or unsafe C silently.                                                           |

---

M00 Edge Cases Covered At Product Level

---

If the user enters no source files, V1 must block copy/download and explain that at least one source file is required.

If the user selects or enters a Windows-oriented output assumption, V1 must not claim full Windows portability. It may apply `.exe` naming or Windows-oriented assumptions only as specified later.

If the user enters paths or names containing characters that cannot be safely represented, V1 must either escape them correctly or reject them with a blocking validation error. The exact escaping rules belong in the validation specification.

If the clipboard API is unavailable, V1 must not fail silently. It must show a visible message and leave the code selectable.

If download is unavailable or blocked, V1 must not fail silently. It must show a visible message.

If JavaScript is disabled, V1 does not need to generate code. It must not show stale generated output as if it were live.

If a user expects package discovery, repository import, run/test/clean targets, or static library output, V1 must direct them through visible limitations or absence of those controls. It must not include inactive controls for deferred features.

---

N00 Implementation Boundaries Implied By This File

---

The implementation must be organized around a single configuration state that drives generated code, validation, assumptions, bootstrap command output, and button states.

The implementation must not hard-code generated code directly into event handlers. Later specification files will define the configuration model and generated-code template rules.

The implementation must not add controls because they seem useful. A control is allowed only if it is defined in the configuration model and has a specified output, validation, or assumption effect.

The implementation must not begin with visual decoration. The first implementation milestone should prove default generation, validation, preview rendering, copy, and download.

---

O00 Definition Of Done For This Specification File

---

This file is complete when it defines the product thesis, primary user job, target users, V1 scope, generated-code product requirements, states, assumptions, non-goals, deferred features, release gates, success criteria, edge cases, and implementation boundaries.

This file does not define exact UI layout, exact configuration object shape, exact `nob.c` template text, exact validation regexes, exact platform flag mappings, exact copy/download implementation, or fixture content. Those belong in later specification files.

