# Stakeholder Map

## First-Time `nob.h` Adopter

- Wants a trustworthy first `nob.c`.
- Pain: blank-page uncertainty and unfamiliar `nob.h` idioms.
- Success: copies a file, bootstraps it, and understands the major blocks.
- Failure: output is too large, misleading, or hard to edit.
- Important features: safe defaults, bootstrap command, assumptions, short explanations.
- Distracting features: preset sprawl, package management, complex target graphs.

## Power-User C Developer

- Wants fast control over compiler, flags, sources, includes, libraries, platform assumptions, and output naming.
- Pain: starter snippets are too simple and require repetitive editing.
- Success: can configure realistic values quickly and inspect exact generated code.
- Failure: UI hides generated behavior or emits fragile C.
- Important features: dense controls, advanced fields, validation, copy/download.
- Distracting features: long tutorials, account flows, visual decoration.

## Open-Source Maintainer

- Wants readable generated code that contributors can understand.
- Pain: generated boilerplate can look unreviewable or unofficial.
- Success: output has clear assumptions and minimal comments.
- Failure: generated file appears machine-owned or overclaims portability.
- Important features: comment verbosity control, limitations note, deterministic output.
- Distracting features: local storage dependency, telemetry, opaque state.

## Skeptical Evaluator

- Wants proof that `nob.h` remains simple.
- Pain: tools can oversell a niche workflow.
- Success: sees a minimal, inspectable, editable file.
- Failure: product becomes a wizard that hides build logic.
- Important features: live preview first, explicit non-goals, small v1 scope.
- Distracting features: full IDE behavior, dependency resolver, generated CI.

## Cross-Platform User

- Wants platform-aware output naming and flags.
- Pain: Windows `.exe`, path separators, compiler names, and library flags differ.
- Success: platform assumption is visible and reflected in generated output.
- Failure: product implies universal portability without validation.
- Important features: platform preset, assumptions panel, warnings.
- Distracting features: complex conditional generation in v1.

