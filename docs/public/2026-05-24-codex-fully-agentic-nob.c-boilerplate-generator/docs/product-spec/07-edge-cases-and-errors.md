---

A00 07 Edge Cases And Errors

---

Document path: `docs/product-spec/07-edge-cases-and-errors.md`

This file defines V1 edge-case and error behavior for the static `nob.h` / `nob.c` boilerplate generator. It covers invalid inputs, empty states, copy/download failures, unsupported platform and compiler cases, escaping and security problems, long lists, duplicate list entries, generated-code caveats, and recovery behavior.

This file is limited to edge cases and errors. It does not redefine the full data model, UI layout, generated C template, or implementation architecture.

---

B00 Error Handling Principles

---

The application must prefer safe refusal over broken output. If an input would produce malformed C, misleading bootstrap commands, unsafe DOM rendering, or invalid generated text, the application must show a blocking error and disable copy/download.

Errors must be actionable. Every blocking error must identify the affected field and state what the user must change.

Warnings must be nonblocking. A warning means the tool can still generate `nob.c`, but the user should review the caveat.

The application must not silently fix risky input. It may trim leading and trailing whitespace during normalization, but it must not rewrite paths, split shell syntax, remove duplicates, infer missing compiler behavior, or replace unknown options without visible feedback.

The application must not lose the user's typed input when validation fails.

---

C00 Message Severity Rules

---

| Severity         | Blocks copy/download | Preview behavior                                                         | Required user-visible behavior                         |
| ---------------- | -------------------: | ------------------------------------------------------------------------ | ------------------------------------------------------ |
| Error            |                  Yes | Show last valid generated code if available, otherwise safe placeholder. | Show field-specific error and validation summary item. |
| Warning          |                   No | Continue showing generated code.                                         | Show caveat in validation or assumptions area.         |
| Assumption       |                   No | Continue showing generated code.                                         | Show factual assumption text.                          |
| Internal failure |                  Yes | Show last valid generated code if available, otherwise safe placeholder. | Show failure message without stack trace.              |

Errors must use direct language such as:

```txt
Add at least one source file path.
```

Warnings must use caveat language such as:

```txt
This source file appears more than once.
```

Internal failures must not expose JavaScript stack traces in the user interface.

---

D00 Invalid Required Inputs

---

The following inputs are required in V1 and must produce blocking errors when empty after trimming.

| Field                  | Error code                  | User-visible message                                                                    |
| ---------------------- | --------------------------- | --------------------------------------------------------------------------------------- |
| Project name           | `project_name_required`     | Enter a project name.                                                                   |
| Target executable name | `target_name_required`      | Enter a target executable name.                                                         |
| Source files           | `source_files_required`     | Add at least one source file path, one per line.                                        |
| Output directory       | `output_directory_required` | Enter an output directory. Use `.` only if you want the executable in the project root. |
| Compiler command       | `compiler_command_required` | Enter a compiler command.                                                               |

When any required input is invalid, copy/download must be disabled.

The preview status must become `needsChanges`.

The validation summary must list all required-field errors, not only the first one.

---

E00 Invalid Enum Or Option Values

---

Unknown select or enum values must produce blocking errors. The implementation must not silently fall back to defaults.

| Field            | Error code                 | User-visible message                     |
| ---------------- | -------------------------- | ---------------------------------------- |
| Platform profile | `unknown_platform_profile` | Select a supported platform assumption.  |
| Compiler profile | `unknown_compiler_profile` | Select a supported compiler profile.     |
| Build profile    | `unknown_build_profile`    | Select debug or release build profile.   |
| Warning profile  | `unknown_warning_profile`  | Select normal or strict warning profile. |
| Comment style    | `unknown_comment_style`    | Select concise or minimal comments.      |

This case should normally occur only because of a programming error, corrupted DOM, or manual user manipulation. It must still be handled safely.

---

F00 Invalid Characters And Escaping Failures

---

The application must reject values that cannot be safely represented in generated C string literals or safely displayed in the UI.

Blocking errors are required for these character cases:

| Case                                                             | Applies to                                                    | Error behavior                            |
| ---------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------- |
| ASCII control characters except line breaks in multiline fields  | All text fields                                               | Show field error and block copy/download. |
| Double quote `"` when not explicitly supported by escaping rules | Target name, paths, flags, compiler command                   | Show field error and block copy/download. |
| Newline in single-line fields                                    | Project name, target name, output directory, compiler command | Show field error and block copy/download. |
| Null byte or equivalent invalid character                        | All fields                                                    | Show field error and block copy/download. |

Required message pattern:

```txt
Remove unsupported characters from <field label>.
```

Generated code and user-provided values must be rendered with text-safe DOM APIs. If escaping or rendering fails internally, the application must enter a blocking `generationFailed` or internal failure state.

The application must not attempt to execute, evaluate, parse as HTML, or treat user input as shell syntax.

---

G00 Path And Name Edge Cases

---

Target executable name must be a file name, not a path. If it contains `/` or `\`, show a blocking error:

```txt
Target executable name must be a file name, not a path.
```

Output directory may be `.`. This is valid and means the executable is generated at the project root. It must produce a nonblocking warning:

```txt
Output will be placed in the project root.
```

Forward slashes are allowed in source files, include paths, and output directory values.

Backslashes may be allowed only if the validation and escaping implementation handles them safely. If not safely handled, they must produce blocking errors. The implementation must not partially support backslashes.

Spaces in paths may be allowed only if generated C string escaping and argument appending preserve them as a single argument. If not safely handled, they must produce blocking errors. The implementation must not split path values on spaces.

The application must not check whether paths exist on disk.

---

H00 Source List Edge Cases

---

The source files input is parsed one path per line. Blank lines must be ignored.

| Case                             | Severity | Required behavior                                                       |
| -------------------------------- | -------- | ----------------------------------------------------------------------- |
| No nonblank source paths         | Error    | Block copy/download and show `source_files_required`.                   |
| Duplicate source path            | Warning  | Preserve duplicate and warn.                                            |
| More than 50 source paths        | Error    | Block copy/download and tell user V1 supports 50 or fewer source files. |
| Source path over 200 characters  | Error    | Block copy/download and tell user to shorten the path.                  |
| Source path does not end in `.c` | Warning  | Preserve value and warn that the compiler must accept it.               |

Duplicate source warning message:

```txt
This source file appears more than once: <source path>
```

Non-`.c` warning message:

```txt
This source path does not end in .c. Verify that your compiler accepts it: <source path>
```

The generated code must preserve source order after blank lines are removed.

---

I00 Include Path Edge Cases

---

The include paths input is parsed one path per line. Blank lines must be ignored.

| Case                             | Severity | Required behavior                                                        |
| -------------------------------- | -------- | ------------------------------------------------------------------------ |
| Empty include list               | None     | Generate no include arguments.                                           |
| Duplicate include path           | Warning  | Preserve duplicate and warn.                                             |
| More than 30 include paths       | Error    | Block copy/download and tell user V1 supports 30 or fewer include paths. |
| Include path over 200 characters | Error    | Block copy/download and tell user to shorten the path.                   |
| Any include path present         | Warning  | State that include paths are not checked on disk.                        |

Required warning when include paths exist:

```txt
Include paths are appended as compiler arguments but are not checked on disk.
```

The application must not verify include path existence.

The generated code must preserve include path order.

---

J00 Library Flag Edge Cases

---

The library flags input is parsed one argument per line. Blank lines must be ignored.

| Case                             | Severity | Required behavior                                                        |
| -------------------------------- | -------- | ------------------------------------------------------------------------ |
| Empty library flag list          | None     | Generate no library/linker arguments.                                    |
| Duplicate library flag           | Warning  | Preserve duplicate and warn.                                             |
| More than 30 library flags       | Error    | Block copy/download and tell user V1 supports 30 or fewer library flags. |
| Library flag over 160 characters | Error    | Block copy/download and tell user to shorten the flag.                   |
| Any library flag present         | Warning  | State that library flags are not discovered or verified.                 |

Required warning when library flags exist:

```txt
Library flags are appended as compiler arguments but are not discovered or verified.
```

The application must not run `pkg-config`.

The application must not split one line into multiple arguments.

The application must not interpret shell syntax such as backticks, `$()`, pipes, redirects, or environment-variable expansion.

If a user enters this line:

```txt
-lfoo -lbar
```

V1 must treat it as one argument. It must not split it into `-lfoo` and `-lbar`.

---

K00 Long Input Limits

---

The implementation must enforce these V1 limits.

| Input              |                    Limit | Severity when exceeded | Message intent                        |
| ------------------ | -----------------------: | ---------------------- | ------------------------------------- |
| Project name       |            80 characters | Error                  | Use a shorter project name.           |
| Target name        |            80 characters | Error                  | Use a shorter target executable name. |
| Output directory   |           160 characters | Error                  | Use a shorter output directory.       |
| Compiler command   |           120 characters | Error                  | Use a shorter compiler command.       |
| Source path        | 200 characters per entry | Error                  | Use shorter source file paths.        |
| Include path       | 200 characters per entry | Error                  | Use shorter include paths.            |
| Library flag       | 160 characters per entry | Error                  | Use shorter library flags.            |
| Source file count  |               50 entries | Error                  | Use 50 or fewer source files in V1.   |
| Include path count |               30 entries | Error                  | Use 30 or fewer include paths in V1.  |
| Library flag count |               30 entries | Error                  | Use 30 or fewer library flags in V1.  |

When a count limit is exceeded, the application must keep the user's input visible and block copy/download. It must not truncate entries silently.

---

L00 Platform And Compiler Unsupported Cases

---

V1 platform selection is an assumption, not a guarantee. The application must not claim actual OS detection or verified portability.

Required platform warnings:

| Condition                                             | Warning code                    | User-visible message                                                                           |
| ----------------------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------- |
| Platform is Windows                                   | `windows_platform_assumption`   | Windows output naming is an assumption. Review the generated code for your compiler and shell. |
| Platform is Unix-like and target ends in `.exe`       | `unix_target_exe_suffix`        | Unix-like output will use the target name exactly as entered, including `.exe`.                |
| Platform is Windows and target already ends in `.exe` | `windows_target_has_exe_suffix` | Target already includes `.exe`; the generator will not append another `.exe`.                  |

Required compiler mismatch warnings:

| Condition                                         | Warning code                        | User-visible message                                                                                |
| ------------------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------- |
| MSVC profile with `cc`, `gcc`, or `clang` command | `compiler_profile_command_mismatch` | Compiler command and compiler profile may not match. The profile is only an assumption.             |
| GCC/Clang profile with `cl` or `cl.exe` command   | `compiler_profile_command_mismatch` | Compiler command and compiler profile may not match. The profile is only an assumption.             |
| Compiler command contains spaces                  | `compiler_command_contains_spaces`  | Compiler command contains spaces and will be treated as one executable string, not a shell command. |

Unsupported compiler profiles must not appear as disabled UI placeholders. If a profile appears in the UI, it must have implemented derivation and generated-code behavior.

---

M00 Generated-Code Caveats

---

The generated code is a starter file. It must not imply that it solves all build cases.

Required caveats shown in assumptions or warnings:

| Caveat               | Required user-visible meaning                                               |
| -------------------- | --------------------------------------------------------------------------- |
| `nob.h` availability | The generated file expects `#include "nob.h"` to work.                      |
| Dependency discovery | The tool does not discover packages, headers, SDKs, or installed libraries. |
| Platform behavior    | Platform choices are assumptions, not verified guarantees.                  |
| Compiler behavior    | Compiler profiles are assumptions, not compiler detection.                  |
| Manual review        | Generated `nob.c` should be reviewed and edited before relying on it.       |
| Executable-only V1   | V1 generates executable-oriented starter files only.                        |

Generated code must not contain run/test/clean targets, static library output, dependency discovery, package management, project scanning, remote fetches, shell pipelines, or browser-specific assumptions.

If generation cannot satisfy these caveats, it must fail closed with a blocking generation error.

---

N00 Preview Edge Cases

---

If the current configuration is valid, the preview must show the current generated `nob.c`.

If the current configuration is invalid and a previous valid generated output exists, the preview may continue showing that previous output, but the status must clearly say:

```txt
Needs changes
```

The preview must not imply that the previous output reflects the current invalid form values.

If the current configuration is invalid and no previous valid output exists, the preview must show a safe placeholder:

```txt
Fix validation errors to generate nob.c.
```

The placeholder must not be copyable through the copy action.

If internal generation fails, the preview must show the last valid output if available, otherwise the safe placeholder. Copy/download must remain disabled.

---

O00 Copy Failure Cases

---

Copy must be allowed only when the current model is valid and generated code exists.

| Case                        | Required behavior                                                                     |
| --------------------------- | ------------------------------------------------------------------------------------- |
| Validation errors exist     | Disable copy button. If clicked anyway, refuse action and keep status `needsChanges`. |
| Generated code is empty     | Disable copy button and show blocking generation error.                               |
| Clipboard API unavailable   | Show `Copy failed. Select the code manually and copy it from the preview.`            |
| Clipboard permission denied | Show `Copy failed. Browser permission blocked clipboard access.`                      |
| Clipboard write throws      | Show `Copy failed. Select the code manually and copy it from the preview.`            |

Copy failure must not clear or alter generated code.

Copy failure must not send generated code anywhere.

Copy success status must clear after the next configuration change.

---

P00 Download Failure Cases

---

Download must be allowed only when the current model is valid and generated code exists.

| Case                             | Required behavior                                                                         |
| -------------------------------- | ----------------------------------------------------------------------------------------- |
| Validation errors exist          | Disable download button. If clicked anyway, refuse action and keep status `needsChanges`. |
| Generated code is empty          | Disable download button and show blocking generation error.                               |
| Blob creation fails              | Show `Download failed. The browser could not create the file.`                            |
| Object URL creation fails        | Show `Download failed. The browser could not prepare the file.`                           |
| Programmatic download is blocked | Show `Download failed. Copy the code manually from the preview.` when detectable.         |

Download failure must not clear or alter generated code.

Download failure must not send generated code anywhere.

Download success status must clear after the next configuration change.

The downloaded file must contain only generated `nob.c`, not assumptions, bootstrap commands, status text, or UI labels.

---

Q00 Initialization And DOM Failure Cases

---

If required DOM elements are missing, initialization must fail visibly.

Required message:

```txt
The generator could not initialize because required page elements are missing.
```

Required behavior:

| Requirement   | Behavior                                                     |
| ------------- | ------------------------------------------------------------ |
| Copy/download | Disabled.                                                    |
| Preview       | Safe placeholder or empty with visible initialization error. |
| Controls      | May remain visible but must not pretend the app is working.  |
| Network       | No error report is sent.                                     |

If JavaScript is disabled, the no-script fallback must state:

```txt
JavaScript is required to generate nob.c in this browser-only tool.
```

If initialization partially succeeds but default generation fails, the app must enter `generationFailed` and disable copy/download.

---

R00 Internal Generation Failure Cases

---

A generation failure means the application could not produce a valid `nob.c` from a configuration that validation considered valid.

Required behavior:

| Requirement   | Behavior                                                           |
| ------------- | ------------------------------------------------------------------ |
| Error code    | Add `generation_failed`.                                           |
| Severity      | Blocking error.                                                    |
| Status        | `generationFailed`.                                                |
| Copy/download | Disabled.                                                          |
| Preview       | Last valid output if available, otherwise safe placeholder.        |
| User message  | `The generator could not produce nob.c from the current settings.` |
| Stack trace   | Must not be shown in UI.                                           |

Generation failures must be treated as implementation defects, not user mistakes, unless the validation rules are later updated to catch the condition.

---

S00 Security And Privacy Edge Cases

---

The application must not send configuration, generated code, validation errors, or action status to any network service.

If user input contains HTML-like text such as:

```txt
<script>alert(1)</script>
```

the text must be displayed as text if displayed at all. It must not execute.

If user input contains shell-like text such as:

```txt
$(pkg-config --libs sdl2)
```

the tool must treat it as a literal argument if otherwise valid, or reject it according to validation rules. It must never execute it.

If user input contains markdown, links, or HTML entities, the application must not render them as markup.

If a browser extension modifies the page or controls, the application must still validate the resulting values before copy/download.

---

T00 Unsupported Feature Requests In UI

---

V1 must not expose controls for unsupported features.

Prohibited UI controls include:

| Feature                   | Required V1 handling                     |
| ------------------------- | ---------------------------------------- |
| Run target                | No control, no placeholder.              |
| Test target               | No control, no placeholder.              |
| Clean target              | No control, no placeholder.              |
| Static library generation | No control, no placeholder.              |
| Shared library generation | No control, no placeholder.              |
| Package discovery         | No control, no placeholder.              |
| Repository scanning       | No control, no placeholder.              |
| URL sharing               | No control, no placeholder.              |
| Browser compilation       | No compile/run button.                   |
| Telemetry/account         | No consent prompt, login, or cloud save. |

If explanatory text mentions a deferred feature, it must clearly state that it is not included in V1.

---

U00 Recovery Behavior

---

Users must be able to recover from every validation error by editing fields directly.

When the user fixes all blocking errors, the app must transition from `needsChanges` or `generationFailed` to `ready` if generation succeeds.

When the user removes a warning condition, the warning must disappear on the next update.

When the user edits input after copy/download success or failure, the status must reset to `ready` or `needsChanges`.

When initialization fails because required DOM elements are missing, normal user recovery is not expected. The visible message must make clear that the page is broken, not that the user's input is wrong.

The app must not require page reload to recover from normal validation errors.

---

V00 Required Error And Warning Codes

---

The implementation must use stable codes for tests and rendering. V1 must include at least these codes where applicable.

| Code                                | Severity | Field                                      |
| ----------------------------------- | -------- | ------------------------------------------ |
| `project_name_required`             | Error    | `projectName`                              |
| `target_name_required`              | Error    | `targetName`                               |
| `source_files_required`             | Error    | `sourceFiles`                              |
| `output_directory_required`         | Error    | `outputDirectory`                          |
| `compiler_command_required`         | Error    | `compilerCommand`                          |
| `unknown_platform_profile`          | Error    | `platformProfile`                          |
| `unknown_compiler_profile`          | Error    | `compilerProfile`                          |
| `unknown_build_profile`             | Error    | `buildProfile`                             |
| `unknown_warning_profile`           | Error    | `warningProfile`                           |
| `unknown_comment_style`             | Error    | `commentStyle`                             |
| `unsupported_characters`            | Error    | Field that contains unsupported characters |
| `source_files_limit_exceeded`       | Error    | `sourceFiles`                              |
| `include_paths_limit_exceeded`      | Error    | `includePaths`                             |
| `library_flags_limit_exceeded`      | Error    | `libraryFlags`                             |
| `generation_failed`                 | Error    | `generation`                               |
| `source_file_duplicate`             | Warning  | `sourceFiles`                              |
| `include_path_duplicate`            | Warning  | `includePaths`                             |
| `library_flag_duplicate`            | Warning  | `libraryFlags`                             |
| `source_file_non_c_extension`       | Warning  | `sourceFiles`                              |
| `include_paths_not_verified`        | Warning  | `includePaths`                             |
| `library_flags_not_verified`        | Warning  | `libraryFlags`                             |
| `self_rebuild_disabled`             | Warning  | `selfRebuild`                              |
| `windows_platform_assumption`       | Warning  | `platformProfile`                          |
| `compiler_profile_command_mismatch` | Warning  | `compilerProfile`                          |
| `compiler_command_contains_spaces`  | Warning  | `compilerCommand`                          |

Additional codes are allowed if they are stable, documented, and tested.

---

W00 Acceptance Criteria

---

| Criterion                   | Pass condition                                                                                                                                            |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Required fields             | Empty required fields produce blocking errors and disable copy/download.                                                                                  |
| All errors visible          | Multiple simultaneous errors are all shown in the validation summary.                                                                                     |
| Field messages              | Field-specific errors appear near the affected field where practical.                                                                                     |
| Warnings nonblocking        | Duplicate entries, unverified paths/libs, and platform assumptions warn without blocking copy/download.                                                   |
| Long limits enforced        | Entries and lists exceeding V1 limits produce blocking errors.                                                                                            |
| Duplicate preservation      | Duplicate sources/includes/libs are preserved in order and produce warnings, not silent deduplication.                                                    |
| No shell parsing            | Library flags and paths are not split on spaces, commas, quotes, or shell syntax.                                                                         |
| Safe preview                | Generated code and user values are rendered as text, never as executable HTML.                                                                            |
| Invalid preview             | Invalid input does not display malformed C as current valid output.                                                                                       |
| Copy guard                  | Copy is disabled or refused when the model is invalid.                                                                                                    |
| Download guard              | Download is disabled or refused when the model is invalid.                                                                                                |
| Copy failure recovery       | Clipboard failure shows visible feedback and leaves code selectable.                                                                                      |
| Download failure recovery   | Download failure shows visible feedback and does not alter generated code.                                                                                |
| Initialization failure      | Missing required DOM elements produces a visible initialization failure.                                                                                  |
| Generation failure          | Internal generation failure blocks copy/download and shows a safe message.                                                                                |
| No network                  | No edge case causes telemetry, logging, fetch, remote save, or remote error reporting.                                                                    |
| Recovery                    | Fixing validation errors returns the app to ready state without page reload.                                                                              |
| Unsupported features absent | V1 contains no controls or generated code for run/test/clean, libraries, package management, repo scanning, telemetry, URL state, or browser compilation. |

---

X00 Definition Of Done For This Specification File

---

This file is complete when it defines edge-case behavior for invalid required fields, unknown options, unsupported characters, path/name issues, source/include/library lists, long inputs, platform/compiler caveats, generated-code caveats, preview states, copy/download failures, initialization failures, generation failures, security/privacy cases, unsupported feature exposure, recovery behavior, stable error/warning codes, and acceptance criteria.

