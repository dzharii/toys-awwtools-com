---

A00 05 Data Model

---

Document path: `docs/product-spec/05-data-model.md`

This file defines the V1 data model for the `nob.h` / `nob.c` boilerplate generator. It controls configuration object fields, raw input shape, normalized configuration shape, defaults, allowed values, validation rules at the data-model level, derived values, list parsing, platform profiles, compiler profiles, no-persistence rules, and fixture configurations.

This file does not define exact UI layout, exact generated `nob.c` text, exact CSS, exact browser API implementation, or fixture expected-output text.

---

B00 Data Model Thesis

---

The application must use one configuration model as the source of truth for generated code, validation, warnings, assumptions, bootstrap command text, copy/download state, and fixture tests.

The data model must be plain JavaScript data. It must not depend on DOM elements, CSS classes, hidden form fields, browser storage, URL parameters, network data, local files, installed compilers, or current operating system detection.

The same normalized configuration must always produce the same derived values and generated output.

---

C00 Data Flow Objects

---

The implementation must distinguish raw input, normalized configuration, validation result, and derived model.

Required object flow:

```txt
RawConfig
normalizeConfig(RawConfig)
Config
validateConfig(Config)
ValidationResult
deriveModel(Config, ValidationResult)
AppModel
```

The application must not generate `nob.c` directly from raw DOM values.

The application must not treat UI text as authoritative state.

The application must not persist configuration in V1.

---

D00 RawConfig Shape

---

`RawConfig` represents untrusted values read from form controls.

All text-like fields in `RawConfig` must be strings. Checkbox values may be booleans. Select values must be strings.

Required `RawConfig` shape:

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

`RawConfig` must not contain generated code, validation messages, DOM references, event objects, or rendered text.

---

E00 Normalized Config Shape

---

`Config` represents normalized values used by validation, derivation, and code generation.

Required `Config` shape:

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

Normalization must trim leading and trailing whitespace from single-value text fields.

Normalization must parse multiline list fields into arrays.

Normalization must remove blank list entries.

Normalization must preserve the order of source files, include paths, and library flags after blank entries are removed.

Normalization must not sort, deduplicate, lowercase, uppercase, or otherwise rewrite user-provided paths or flags unless another rule in this file explicitly requires it.

---

F00 Default Config

---

The default configuration must be valid and must generate a complete initial `nob.c`.

Required default normalized configuration:

```js
{
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
}
```

The implementation may use different default display labels only if the normalized values above remain equivalent in behavior.

The default state must have zero blocking validation errors.

The default state may have zero or more nonblocking assumptions.

The default state must not have warnings that imply the default is risky.

---

G00 Field Definitions

---

| Field             |         Type | Required | Meaning                                                                           | Default          |
| ----------------- | -----------: | -------: | --------------------------------------------------------------------------------- | ---------------- |
| `projectName`     |       string |      Yes | Human-readable project label used in assumptions and optional generated comments. | `Example C App`  |
| `targetName`      |       string |      Yes | Executable output base name before platform suffix handling.                      | `example`        |
| `sourceFiles`     | string array |      Yes | Ordered list of C source paths passed to the compiler command.                    | `["src/main.c"]` |
| `outputDirectory` |       string |      Yes | Directory where the generated executable is placed.                               | `build`          |
| `platformProfile` |  enum string |      Yes | User-selected platform assumption. It is not auto-detected.                       | `unix`           |
| `compilerProfile` |  enum string |      Yes | User-selected compiler flag style assumption. It is not auto-detected.            | `gcc-clang`      |
| `compilerCommand` |       string |      Yes | Compiler executable or command name appended as first compiler command argument.  | `cc`             |
| `buildProfile`    |  enum string |      Yes | Selects debug or release flag preset.                                             | `debug`          |
| `warningProfile`  |  enum string |      Yes | Selects normal or strict warning flag preset.                                     | `normal`         |
| `includePaths`    | string array |       No | Ordered include path list.                                                        | `[]`             |
| `libraryFlags`    | string array |       No | Ordered linker/compiler arguments appended near the end of the compiler command.  | `[]`             |
| `selfRebuild`     |      boolean |      Yes | Controls whether generated `nob.c` includes the self-rebuild block.               | `true`           |
| `commentStyle`    |  enum string |      Yes | Controls generated comment verbosity.                                             | `concise`        |

---

H00 Allowed Enum Values

---

`platformProfile` must allow exactly these V1 values:

| Value     | Label     | Meaning                                                                                                                     |
| --------- | --------- | --------------------------------------------------------------------------------------------------------------------------- |
| `unix`    | Unix-like | Assumes Unix-like executable naming and GCC/Clang-style local workflow unless compiler profile says otherwise.              |
| `windows` | Windows   | Assumes Windows-oriented executable naming with `.exe` suffix behavior. This is an assumption, not a portability guarantee. |

`compilerProfile` must allow exactly these V1 values:

| Value       | Label           | Meaning                                                                                                                                     |
| ----------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `gcc-clang` | GCC/Clang style | Uses GCC/Clang-style warning, debug, release, include, and output argument conventions.                                                     |
| `msvc`      | MSVC style      | Uses MSVC-style warning, debug, release, include, and output argument conventions where implemented by the platform/compiler specification. |

`buildProfile` must allow exactly these V1 values:

| Value     | Label   | Meaning                                          |
| --------- | ------- | ------------------------------------------------ |
| `debug`   | Debug   | Prefer debuggability and lower optimization.     |
| `release` | Release | Prefer optimization and release-oriented output. |

`warningProfile` must allow exactly these V1 values:

| Value    | Label  | Meaning                                                               |
| -------- | ------ | --------------------------------------------------------------------- |
| `normal` | Normal | Use a practical baseline warning set.                                 |
| `strict` | Strict | Use stronger warning flags for users who want more compiler feedback. |

`commentStyle` must allow exactly these V1 values:

| Value     | Label   | Meaning                                               |
| --------- | ------- | ----------------------------------------------------- |
| `concise` | Concise | Include short comments before major generated blocks. |
| `minimal` | Minimal | Reduce comments while keeping readable structure.     |

Unknown enum values must be blocking validation errors.

---

I00 Text Field Validation Rules

---

These rules define data-model validation behavior. Exact escaping implementation belongs to the validation and security specification.

`projectName` validation:

| Rule                              | Severity | Message intent                                |
| --------------------------------- | -------- | --------------------------------------------- |
| Empty after trimming              | Error    | Enter a project name.                         |
| Contains control characters       | Error    | Remove control characters from project name.  |
| Length greater than 80 characters | Error    | Use a project name of 80 characters or fewer. |

`targetName` validation:

| Rule                              | Severity | Message intent                               |
| --------------------------------- | -------- | -------------------------------------------- |
| Empty after trimming              | Error    | Enter a target executable name.              |
| Contains `/` or `\`               | Error    | Target name must be a file name, not a path. |
| Contains control characters       | Error    | Remove control characters from target name.  |
| Contains double quote             | Error    | Remove double quotes from target name.       |
| Length greater than 80 characters | Error    | Use a target name of 80 characters or fewer. |

`outputDirectory` validation:

| Rule                               | Severity | Message intent                                      |
| ---------------------------------- | -------- | --------------------------------------------------- |
| Empty after trimming               | Error    | Enter an output directory.                          |
| Contains control characters        | Error    | Remove control characters from output directory.    |
| Contains double quote              | Error    | Remove double quotes from output directory.         |
| Equals `.`                         | Warning  | Output will be placed in the project root.          |
| Length greater than 160 characters | Error    | Use an output directory of 160 characters or fewer. |

`compilerCommand` validation:

| Rule                               | Severity | Message intent                                                                                            |
| ---------------------------------- | -------- | --------------------------------------------------------------------------------------------------------- |
| Empty after trimming               | Error    | Enter a compiler command.                                                                                 |
| Contains newline                   | Error    | Compiler command must be a single value.                                                                  |
| Contains control characters        | Error    | Remove control characters from compiler command.                                                          |
| Contains double quote              | Error    | Remove double quotes from compiler command.                                                               |
| Contains spaces                    | Warning  | Compiler command contains spaces; generated code treats it as one executable string, not a shell command. |
| Length greater than 120 characters | Error    | Use a compiler command of 120 characters or fewer.                                                        |

Whitespace-only values count as empty.

---

J00 List Parsing Rules

---

The source files, include paths, and library flags raw fields must be parsed using the same base multiline parsing algorithm.

Required parser behavior:

```txt
Split raw text on CRLF, LF, or CR.
Trim each line.
Discard blank lines.
Preserve remaining line order.
Return resulting array.
```

The parser must not split on spaces.

The parser must not split on commas.

The parser must not interpret shell quotes.

The parser must not expand globs.

The parser must not resolve relative paths.

The parser must not check whether paths exist.

The parser must not deduplicate entries by default.

---

K00 Source Files Validation Rules

---

`sourceFiles` must contain at least one item.

Each source file entry must follow these rules:

| Rule                                     | Severity | Message intent                                                               |
| ---------------------------------------- | -------- | ---------------------------------------------------------------------------- |
| Empty list                               | Error    | Add at least one source file path.                                           |
| Entry contains control characters        | Error    | Remove control characters from source file path.                             |
| Entry contains double quote              | Error    | Remove double quotes from source file path.                                  |
| Entry length greater than 200 characters | Error    | Use source file paths of 200 characters or fewer.                            |
| Duplicate entry                          | Warning  | This source file appears more than once.                                     |
| Entry does not end with `.c`             | Warning  | This source path does not end in `.c`; verify that your compiler accepts it. |

V1 must allow relative source paths such as `src/main.c`.

V1 must allow forward slashes in source paths.

V1 must allow spaces in source paths only if the validation and escaping specification supports them safely. If safe support is not implemented, spaces must be blocking errors.

V1 must not require source files to exist on disk.

---

L00 Include Paths Validation Rules

---

`includePaths` may be empty.

Each include path entry must follow these rules:

| Rule                                     | Severity | Message intent                                |
| ---------------------------------------- | -------- | --------------------------------------------- |
| Entry contains control characters        | Error    | Remove control characters from include path.  |
| Entry contains double quote              | Error    | Remove double quotes from include path.       |
| Entry length greater than 200 characters | Error    | Use include paths of 200 characters or fewer. |
| Duplicate entry                          | Warning  | This include path appears more than once.     |
| Include paths present                    | Warning  | Include paths are not checked on disk.        |

V1 must not require include paths to exist on disk.

V1 must preserve include path order.

V1 must generate no include path arguments when the array is empty.

---

M00 Library Flags Validation Rules

---

`libraryFlags` may be empty.

Each library flag entry must follow these rules:

| Rule                                     | Severity | Message intent                                |
| ---------------------------------------- | -------- | --------------------------------------------- |
| Entry contains control characters        | Error    | Remove control characters from library flag.  |
| Entry contains double quote              | Error    | Remove double quotes from library flag.       |
| Entry length greater than 160 characters | Error    | Use library flags of 160 characters or fewer. |
| Duplicate entry                          | Warning  | This library flag appears more than once.     |
| Library flags present                    | Warning  | Library flags are not discovered or verified. |

V1 must not parse, validate, or discover library availability.

V1 must preserve library flag order.

V1 must generate no library flag arguments when the array is empty.

Examples of acceptable library flag entries when otherwise valid:

```txt
-lm
-lpthread
user32.lib
```

Examples that must not be treated specially:

```txt
`pkg-config --libs sdl2`
$(pkg-config --libs sdl2)
-lfoo -lbar
```

Each line is one argument. V1 must not execute shell substitutions. V1 must not split one line into multiple arguments.

---

N00 Cross-Field Validation Rules

---

The data model must validate relationships between fields.

| Condition                                                                                      | Severity | Message intent                                                                                     |
| ---------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------- |
| `platformProfile` is `windows` and `targetName` already ends with `.exe`                       | Warning  | Windows output naming already includes `.exe`; generated suffix behavior must avoid double `.exe`. |
| `platformProfile` is `unix` and `targetName` ends with `.exe`                                  | Warning  | Unix-like output will use the target name as provided, including `.exe`.                           |
| `compilerProfile` is `msvc` and `compilerCommand` is `cc`, `gcc`, or `clang`                   | Warning  | Compiler command and compiler profile may not match.                                               |
| `compilerProfile` is `gcc-clang` and `compilerCommand` is `cl`, `cl.exe`, or contains `cl.exe` | Warning  | Compiler command and compiler profile may not match.                                               |
| `selfRebuild` is false                                                                         | Warning  | Self-rebuild is disabled.                                                                          |
| `sourceFiles` has more than 50 entries                                                         | Error    | Use 50 or fewer source files in V1.                                                                |
| `includePaths` has more than 30 entries                                                        | Error    | Use 30 or fewer include paths in V1.                                                               |
| `libraryFlags` has more than 30 entries                                                        | Error    | Use 30 or fewer library flags in V1.                                                               |

Warnings must not block generation, copy, or download.

Errors must block generation for the current invalid state, copy, and download.

---

O00 Derived Values

---

The implementation must derive values from `Config`. Derived values must not be stored as user-editable configuration fields.

Required derived values:

```js
{
  executableFileName: string,
  executableOutputPath: string,
  outputDirectoryRequired: boolean,
  compilerFlags: string[],
  warningFlags: string[],
  buildFlags: string[],
  includeArgs: string[],
  libraryArgs: string[],
  platformAssumptionLabel: string,
  compilerAssumptionLabel: string,
  bootstrapCommands: string[],
  assumptions: string[]
}
```

Derived values must be deterministic.

Derived values must not use current date, random numbers, browser user agent, actual OS detection, installed compiler detection, network checks, or filesystem checks.

---

P00 Executable Name Derivation

---

`executableFileName` must be derived from `targetName` and `platformProfile`.

Rules:

| Condition                                                                           | Derived `executableFileName` |
| ----------------------------------------------------------------------------------- | ---------------------------- |
| `platformProfile` is `windows` and `targetName` ends with `.exe` case-insensitively | `targetName` unchanged       |
| `platformProfile` is `windows` and `targetName` does not end with `.exe`            | `${targetName}.exe`          |
| `platformProfile` is `unix`                                                         | `targetName` unchanged       |

Examples:

| `targetName`  | `platformProfile` | `executableFileName` |
| ------------- | ----------------- | -------------------- |
| `example`     | `unix`            | `example`            |
| `example`     | `windows`         | `example.exe`        |
| `example.exe` | `windows`         | `example.exe`        |
| `tool.exe`    | `unix`            | `tool.exe`           |

This derived value must not modify `targetName`.

---

Q00 Output Path Derivation

---

`executableOutputPath` must be derived from `outputDirectory` and `executableFileName`.

Rules:

| Condition                       | Derived output path                        |
| ------------------------------- | ------------------------------------------ |
| `outputDirectory` is `.`        | `executableFileName`                       |
| `outputDirectory` ends with `/` | `${outputDirectory}${executableFileName}`  |
| `outputDirectory` ends with `\` | `${outputDirectory}${executableFileName}`  |
| Otherwise                       | `${outputDirectory}/${executableFileName}` |

V1 may use forward slash joining in generated code for starter simplicity. Windows platform selection may still use `.exe` naming. The platform specification may refine path separator behavior, but this data model must keep the join deterministic.

`outputDirectoryRequired` must be false only when `outputDirectory` is `.`.

---

R00 Compiler Flag Derivation

---

The data model must derive compiler flag arrays from `compilerProfile`, `buildProfile`, and `warningProfile`.

Exact flags belong to the platform/compiler specification, but the data model must expose separate arrays:

| Derived field   | Source fields                       | Meaning                                  |
| --------------- | ----------------------------------- | ---------------------------------------- |
| `warningFlags`  | `compilerProfile`, `warningProfile` | Warning-related compiler arguments.      |
| `buildFlags`    | `compilerProfile`, `buildProfile`   | Debug or release compiler arguments.     |
| `compilerFlags` | `warningFlags`, `buildFlags`        | Combined ordered list used by generator. |

Required ordering:

```txt
warningFlags first
buildFlags second
```

If a profile has no flags for a category, the derived array for that category must be empty.

The generator must preserve this derived order.

---

S00 Include Argument Derivation

---

`includeArgs` must be derived from `compilerProfile` and `includePaths`.

Exact compiler syntax belongs to the platform/compiler specification, but the data model must require one generated compiler argument per include path unless the compiler mapping explicitly requires otherwise.

For GCC/Clang-style profiles, expected conceptual form is:

```txt
-I<path>
```

For MSVC-style profiles, expected conceptual form is:

```txt
/I<path>
```

If `includePaths` is empty, `includeArgs` must be empty.

Include path order must match input order.

---

T00 Library Argument Derivation

---

`libraryArgs` must be derived from `libraryFlags`.

V1 must treat each line in `libraryFlagsText` as one literal compiler/linker argument after validation and escaping.

No shell parsing is allowed.

No command substitution is allowed.

No package lookup is allowed.

No automatic splitting is allowed.

Library argument order must match input order.

---

U00 Bootstrap Command Derivation

---

`bootstrapCommands` must be derived from `compilerCommand`, `platformProfile`, and `selfRebuild`.

Exact command strings belong to the platform/compiler specification, but the data model must support these conceptual phases:

```txt
Compile nob.c into a build program.
Run the build program.
```

The bootstrap commands must not include dependency discovery commands.

The bootstrap commands must not include package installation commands.

The bootstrap commands must not include test, clean, run, or install targets in V1.

If required fields are invalid, bootstrap command derivation may return an empty array plus a validation-dependent message in the app model. It must not produce misleading commands from invalid config.

---

V00 Assumptions Derivation

---

`assumptions` must be derived from `Config` and must include these topics:

| Topic                | Required assumption content                                                         |
| -------------------- | ----------------------------------------------------------------------------------- |
| `nob.h` availability | Generated code expects `#include "nob.h"` to work.                                  |
| Local-only behavior  | Configuration and generated output stay in the browser.                             |
| V1 project shape     | Generated output targets executable-oriented C projects only.                       |
| Platform             | Selected platform is an assumption, not auto-detection.                             |
| Compiler             | Selected compiler profile and compiler command are assumptions, not auto-detection. |
| Dependencies         | Include paths and library flags are not discovered or verified.                     |
| Manual editing       | Generated `nob.c` is intended to be reviewed and edited.                            |

Assumptions must be regenerated on every configuration change.

Assumptions must be shown even when validation errors exist, as long as the application can derive them safely.

---

W00 Validation Result Shape

---

`ValidationResult` must use this shape:

```js
{
  errors: ValidationMessage[],
  warnings: ValidationMessage[]
}
```

Each `ValidationMessage` must use this shape:

```js
{
  code: string,
  field: string,
  severity: "error" | "warning",
  message: string
}
```

`code` must be stable enough for fixture tests.

`field` must match a known configuration field or a known derived area.

Required field identifiers:

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
```

---

X00 AppModel Shape

---

`AppModel` must represent the full current application state after validation and derivation.

Required shape:

```js
{
  rawConfig: RawConfig,
  config: Config,
  validation: ValidationResult,
  isValid: boolean,
  generatedCode: string,
  lastValidGeneratedCode: string,
  executableFileName: string,
  executableOutputPath: string,
  bootstrapCommands: string[],
  assumptions: string[],
  status: "ready" | "needsChanges" | "copied" | "downloaded" | "copyFailed" | "downloadFailed" | "generationFailed"
}
```

`isValid` must be true only when `validation.errors.length === 0`.

`generatedCode` must contain current generated output only when valid generation succeeds.

`lastValidGeneratedCode` may be used to keep a safe preview visible during invalid input states.

If no valid output has ever been generated, `lastValidGeneratedCode` must be an empty string and copy/download must be disabled.

---

Y00 No Persistence In V1

---

V1 must not persist configuration or generated output.

Prohibited persistence mechanisms:

| Mechanism                    | V1 status  |
| ---------------------------- | ---------- |
| URL query parameters         | Prohibited |
| URL hash state               | Prohibited |
| `localStorage`               | Prohibited |
| `sessionStorage`             | Prohibited |
| IndexedDB                    | Prohibited |
| Cookies                      | Prohibited |
| Remote save                  | Prohibited |
| Account-based state          | Prohibited |
| File import/export of config | Prohibited |

Page refresh must reset the configuration to the default state.

Closing and reopening the page must reset the configuration to the default state.

The only allowed output persistence in V1 is user-initiated copy or download of generated `nob.c`.

---

Z00 Fixture Configurations

---

V1 must define fixture configurations as normalized `Config` objects. Fixture expected outputs are defined in the fixtures and acceptance-test specification, not in this file.

Minimum fixture configurations:

```js
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

```js
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

```js
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

```js
const FIXTURE_WINDOWS_MINGW_STYLE = {
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

```js
const FIXTURE_MSVC_STYLE = {
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

```js
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

```js
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

Invalid fixture inputs must be represented as `RawConfig` objects because invalid normalized configs may not satisfy the `Config` shape.

Minimum invalid raw fixture configurations:

```js
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

```js
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

```js
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

AA00 Edge Cases

---

If `targetName` is valid but already contains `.exe`, Windows suffix derivation must not append another `.exe`.

If `outputDirectory` is `.`, the generated executable path must not be prefixed with `./` unless the generated-template specification requires it.

If `sourceFilesText` contains blank lines around valid paths, blank lines must be ignored.

If `includePathsText` or `libraryFlagsText` is blank, the resulting arrays must be empty and must not produce placeholder generated arguments.

If duplicate source files, include paths, or library flags exist, the data model must preserve them and emit warnings. It must not remove duplicates silently.

If a field contains control characters, validation must produce an error. The implementation must not attempt to generate C from such values.

If an unknown enum value appears, validation must produce an error. The implementation must not fall back silently.

If `compilerCommand` contains spaces, validation must warn. V1 treats it as one command string, not a shell command.

If source files exceed 50 entries, include paths exceed 30 entries, or library flags exceed 30 entries, validation must produce an error.

---

AB00 Data Model Acceptance Criteria

---

| Criterion               | Pass condition                                                                  |
| ----------------------- | ------------------------------------------------------------------------------- |
| Raw config shape        | Raw form values can be represented by the required `RawConfig` shape.           |
| Normalized config shape | Valid normalized values can be represented by the required `Config` shape.      |
| Valid defaults          | Default config passes validation with zero errors.                              |
| Enum validation         | Unknown enum values produce blocking errors.                                    |
| List parsing            | Multiline lists parse by line, trim entries, remove blanks, and preserve order. |
| No shell parsing        | List parsing does not split on spaces, commas, quotes, or shell syntax.         |
| Source requirement      | Empty source list produces a blocking error.                                    |
| Duplicate handling      | Duplicate list entries are preserved and produce warnings.                      |
| Platform suffix         | Windows executable derivation appends `.exe` only when needed.                  |
| Output path             | Output path derivation follows the specified deterministic rules.               |
| Derived arrays          | Compiler, include, and library argument arrays are deterministic and ordered.   |
| No persistence          | Refresh resets configuration to defaults.                                       |
| Fixture coverage        | Minimum fixture configs and invalid raw fixtures are defined.                   |

---

AC00 Definition Of Done For This Specification File

---

This file is complete when it defines raw config shape, normalized config shape, default values, field meanings, allowed enum values, text validation rules, list parsing rules, source/include/library validation rules, cross-field validation rules, derived values, executable naming, output path derivation, flag derivation, assumptions derivation, validation result shape, app model shape, no-persistence rules, fixture configurations, edge cases, and data-model acceptance criteria.

This file intentionally does not define exact generated `nob.c` template text, exact UI layout, exact CSS, exact browser action implementation, or expected fixture output files.

---

Z99 Review-Gate Addendum: Exact V1 Profiles And String Policy

This addendum resolves the documentation-gate review findings before implementation.

V1 compiler profiles are limited to `cc`, `gcc`, `clang`, and `tcc`. The UI must not expose MSVC in V1. Windows support in V1 means a Windows-oriented GCC/Clang/MinGW-style assumption, not native MSVC command generation.

Compiler command defaults:

| profile | emitted compiler argument | notes |
| --- | --- | --- |
| `cc` | `cc` | default generic compiler |
| `gcc` | `gcc` | GCC-style flags |
| `clang` | `clang` | GCC/Clang-style flags |
| `tcc` | `tcc` | accepts the same basic output/source/include/library argument shape for V1 |

Build profile mappings:

| build profile | emitted arguments |
| --- | --- |
| `debug` | `-g`, `-O0` |
| `release` | `-O2` |

Warning profile mappings:

| warning profile | emitted arguments |
| --- | --- |
| `basic` | `-Wall`, `-Wextra` |
| `strict` | `-Wall`, `-Wextra`, `-Wpedantic` |
| `none` | no warning arguments |

Include path mapping: each include path line emits one `-I<path>` argument. The generated code must not split a line on spaces.

Library mapping: each library line emits one argument exactly as a single C string after escaping. Users may enter values such as `-lm`, `-lraylib`, or `third_party/libfoo.a`. The generated code must not split `-lfoo -lbar`; that must be treated as one invalid/suspicious library argument unless the user puts each token on its own line.

Output mapping: GCC/Clang/TCC-style output uses `"-o", "<output path>"`.

Platform mapping:

| platform assumption | executable suffix |
| --- | --- |
| `linux` | no suffix |
| `macos` | no suffix |
| `windows-mingw` | `.exe` |

V1 string policy:

- Reject double quote characters in all user-entered values that become C string literals.
- Reject ASCII control characters in all user-entered values.
- Allow spaces in paths and flags because each configured line becomes one `nob_cmd_append` argument.
- Escape backslash as `\\` in generated C string literals.
- Escape newline is not required because newlines are rejected before generation.
- Preserve duplicate list entries in generated output and surface warnings; do not silently deduplicate.
