---

A00 Proposed Specification Set

---

Create nine local specification files. This is enough to separate product intent, UI behavior, generated-code rules, validation, testing, and implementation sequencing without producing a fragmented documentation system.

Recommended directory shape:

```txt
docs/
  specs/
    01-product-scope-and-prd.md
    02-user-workflows-and-ui-spec.md
    03-configuration-model-spec.md
    04-generated-nob-c-template-spec.md
    05-validation-escaping-and-security-spec.md
    06-platform-and-compiler-assumptions-spec.md
    07-copy-download-and-static-runtime-spec.md
    08-fixtures-and-acceptance-tests-spec.md
    09-implementation-plan-and-agent-guardrails.md
```

---

B00 01-product-scope-and-prd.md

---

Purpose: Define the product, target users, v1 scope, non-goals, release gates, and success criteria.

Required contents: Product thesis; target stakeholders; primary user job; v1 feature list; v1 non-goals; explicit deferred features; assumptions; constraints; release criteria; "what this tool is not"; definition of done.

Dependencies on other sections: Depends on prior research and brainstorming. All other specification files depend on this file.

Why this section is needed: It prevents Codex from expanding the product into an IDE, package manager, tutorial site, hosted service, project importer, or general build-system replacement.

---

C00 02-user-workflows-and-ui-spec.md

---

Purpose: Specify the actual user-facing interface and interaction flow.

Required contents: First viewport layout; compact control panels; live code preview behavior; validation panel behavior; assumptions panel behavior; bootstrap command area; block-level explanation placement; copy/download button states; responsive behavior; empty/default state; error state; accessibility requirements.

Dependencies on other sections: Depends on `01-product-scope-and-prd.md`. Must reference `03-configuration-model-spec.md` for controls and `05-validation-escaping-and-security-spec.md` for error behavior.

Why this section is needed: It prevents vague UI implementation. Codex should know exactly which controls exist, where they appear, how they behave, and what must not be added.

---

D00 03-configuration-model-spec.md

---

Purpose: Define the complete internal state model that drives validation, preview, assumptions, bootstrap command output, copy, and download.

Required contents: Configuration object shape; default values; allowed project type values; compiler profile values; platform assumption values; source file list format; include path format; library flag format; warning profile values; build profile values; output naming rules; comments verbosity values; self-rebuild option; derived values; state update rules.

Dependencies on other sections: Depends on `01-product-scope-and-prd.md`. Required by `02-user-workflows-and-ui-spec.md`, `04-generated-nob-c-template-spec.md`, `05-validation-escaping-and-security-spec.md`, and `08-fixtures-and-acceptance-tests-spec.md`.

Why this section is needed: It prevents Codex from scattering state across DOM handlers and template strings. Every generated output must be traceable to explicit configuration fields.

---

E00 04-generated-nob-c-template-spec.md

---

Purpose: Define the exact structure and rules for the generated `nob.c`.

Required contents: Required generated sections; file header policy; `NOB_IMPLEMENTATION` placement; `#include "nob.h"` placement; `main` structure; prefixed API requirement; self-rebuild placement; output directory creation behavior; command construction pattern; source file appending; include path appending; library flag appending; compiler profile handling; debug/release flag handling; command execution; failure return behavior; comment policy; unsupported generated-code patterns.

Dependencies on other sections: Depends on `01-product-scope-and-prd.md`, `03-configuration-model-spec.md`, and `06-platform-and-compiler-assumptions-spec.md`. Must satisfy validation rules from `05-validation-escaping-and-security-spec.md`.

Why this section is needed: This is the highest-risk part of the product. The tool is only useful if the generated `nob.c` is readable, deterministic, constrained, and based on sane starter patterns.

---

F00 05-validation-escaping-and-security-spec.md

---

Purpose: Define all input validation, output escaping, preview safety, and privacy/security constraints.

Required contents: Identifier validation; target name validation; source path validation; output path validation; include path validation; library flag validation; compiler command validation; empty source list behavior; invalid character handling; C string literal escaping rules; HTML rendering rules; copy/download blocking rules; local-only privacy guarantee; prohibited network behavior; prohibited code execution behavior.

Dependencies on other sections: Depends on `03-configuration-model-spec.md` and affects `02-user-workflows-and-ui-spec.md`, `04-generated-nob-c-template-spec.md`, and `07-copy-download-and-static-runtime-spec.md`.

Why this section is needed: It prevents unsafe string interpolation, broken generated C, DOM injection, accidental telemetry, and invalid copy/download output.

---

G00 06-platform-and-compiler-assumptions-spec.md

---

Purpose: Define what platform and compiler options mean in v1, without overclaiming cross-platform correctness.

Required contents: Supported platform assumptions; unsupported platform guarantees; compiler profile definitions; generic GCC/Clang behavior; Windows-oriented output naming behavior; `.exe` suffix behavior; warning/debug/release flag mapping; path separator policy; shell avoidance policy; assumptions text shown to users; caveats for MSVC/MinGW/macOS/Linux if included.

Dependencies on other sections: Depends on `01-product-scope-and-prd.md` and `03-configuration-model-spec.md`. Required by `04-generated-nob-c-template-spec.md`, `08-fixtures-and-acceptance-tests-spec.md`, and `02-user-workflows-and-ui-spec.md`.

Why this section is needed: It prevents Codex from claiming real cross-platform support while only implementing naming assumptions or Unix-like compiler flags.

---

H00 07-copy-download-and-static-runtime-spec.md

---

Purpose: Define the static website runtime behavior and artifact actions.

Required contents: Required files; no-build-tool constraint; no backend; no remote dependencies; script loading approach; copy-to-clipboard behavior; fallback copy behavior if clipboard API fails; download filename; downloaded MIME type; generated file line endings; code preview update timing; browser compatibility expectations; graceful degradation rules.

Dependencies on other sections: Depends on `01-product-scope-and-prd.md`, `02-user-workflows-and-ui-spec.md`, and `05-validation-escaping-and-security-spec.md`.

Why this section is needed: Copy and download are core product actions. This file prevents accidental framework setup, npm tooling, external CDN dependencies, or unreliable clipboard/download behavior.

---

I00 08-fixtures-and-acceptance-tests-spec.md

---

Purpose: Define the concrete outputs and manual/automated checks required before implementation is considered complete.

Required contents: Fixture configuration list; expected generated `nob.c` outputs; default Unix-like executable fixture; Windows-oriented `.exe` fixture; debug profile fixture; release profile fixture; multi-source fixture; invalid-input cases; validation expected messages; copy/download acceptance checks; static-only checks; no-network checks; visual smoke checks; final release checklist.

Dependencies on other sections: Depends on `03-configuration-model-spec.md`, `04-generated-nob-c-template-spec.md`, `05-validation-escaping-and-security-spec.md`, `06-platform-and-compiler-assumptions-spec.md`, and `07-copy-download-and-static-runtime-spec.md`.

Why this section is needed: It forces the project to judge correctness by generated output, not by whether the UI looks complete.

---

J00 09-implementation-plan-and-agent-guardrails.md

---

Purpose: Convert the specifications into a safe implementation sequence for Codex.

Required contents: Pre-implementation checklist; required local artifacts; prohibited early implementation actions; implementation phases; file creation order; testing order; review gates; "do not add" list; agent decision rules; when to stop and ask for milestone advice; final milestone review checklist.

Dependencies on other sections: Depends on all specification files. It should be written after the other sections are outlined, then updated after the full specs are complete.

Why this section is needed: The user's workflow requires documentation before implementation. This file prevents Codex from jumping directly into coding, overbuilding, or silently changing scope.

---

K00 Recommended Writing Order

---

Write the files in this order:

```txt
01-product-scope-and-prd.md
03-configuration-model-spec.md
04-generated-nob-c-template-spec.md
05-validation-escaping-and-security-spec.md
06-platform-and-compiler-assumptions-spec.md
02-user-workflows-and-ui-spec.md
07-copy-download-and-static-runtime-spec.md
08-fixtures-and-acceptance-tests-spec.md
09-implementation-plan-and-agent-guardrails.md
```

The generated-code, configuration, validation, and platform specs should be written before detailed UI polish. The UI exists to manipulate and display the generated `nob.c`; it should not drive the product model.

