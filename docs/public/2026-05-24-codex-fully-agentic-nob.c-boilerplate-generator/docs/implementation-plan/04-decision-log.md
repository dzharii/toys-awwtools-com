# Decision Log

## 2026-05-24: Create Missing Project Folder

Decision: Create `nob-boilerplate-generator` under the current workspace.

Reason: The requested folder did not exist under `D:\projects2024`, and the user explicitly requested that project name.

Alternatives: Stop and ask for a path; use the parent root directly.

Source of confidence: Local filesystem search found no matching directory.

## 2026-05-24: Use Copy-First Executable Generator For V1

Decision: V1 generates one executable-oriented `nob.c` template with safe defaults and advanced controls.

Reason: ChatGPT research and critique repeatedly identified generated-code correctness as the release gate.

Alternatives: Full workflow configurator, preset gallery, pure tutorial/code-lens tool.

Source of confidence: Research and brainstorming relay artifacts saved under `.tmp/chatgpt-relay`.

## 2026-05-24: Keep Runtime Static And Dependency-Free

Decision: Implement with plain HTML, CSS, and JavaScript only.

Reason: User explicitly required static website; this also fits the `nob.h` minimal-dependency premise.

Alternatives: Use a framework or bundler.

Source of confidence: User request and protocol research synthesis.

## 2026-05-24: Pin V1 `nob.h` API Usage

Decision: Generate code using `NOB_GO_REBUILD_URSELF(argc, argv)`, `Nob_Cmd cmd = {0};`, `nob_cmd_append(&cmd, ...)`, `nob_cmd_run(&cmd)`, and `nob_mkdir_if_not_exists(...)`.

Reason: ChatGPT review identified exact generated-template ambiguity as a documentation blocker. The current upstream `nob.h` snapshot confirms these names and marks older sync run APIs as deprecated.

Alternatives: Use deprecated `nob_cmd_run_sync()` APIs; omit output directory creation; invent a helper name during implementation.

Source of confidence: `.tmp/chatgpt-relay/upstream-nob-h-main-snapshot.txt` fetched from `https://raw.githubusercontent.com/tsoding/nob.h/main/nob.h` on 2026-05-24.

## 2026-05-24: Defer MSVC From V1

Decision: V1 exposes `cc`, `gcc`, `clang`, and `tcc` compiler profiles only. Windows support means Windows-oriented GCC/Clang/MinGW-style output naming with `.exe`, not native MSVC flags.

Reason: ChatGPT review identified MSVC as a risk because output flags, include flags, warning flags, debug/release flags, and conventions differ from GCC/Clang. Supporting it safely requires a separate fixture and exact mappings.

Alternatives: Keep MSVC in V1 with guessed mappings; remove Windows assumptions entirely.

Source of confidence: Spec review and local review-gate addenda.
