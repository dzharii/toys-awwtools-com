# Selected Product Direction

## Concept

Build a conservative copy-first `nob.c` generator with safe defaults, advanced controls, live code preview, validation, assumptions, copy/download actions, and short block-level explanations.

## Why Selected

This direction best matches the user's request for a power-user interactive generator while controlling the largest risk: producing misleading or invalid C build-script boilerplate.

## V1 Scope

- Static `index.html`, `styles.css`, and `script.js`.
- No build tooling.
- One executable-focused generated `nob.c` template.
- Basic and advanced control groups.
- Live code preview as the primary surface.
- Validation and assumptions panels.
- Copy generated code.
- Download generated code as `nob.c`.
- Bootstrap command panel.
- Deterministic generated output.

## Out Of Scope For V1

- Static library generation.
- Multiple target dispatch.
- Run/test/clean target generation.
- Dependency discovery.
- Package management.
- Repository scanning.
- Browser-side compilation.
- Accounts, telemetry, server storage, or backend APIs.
- Claims of official `nob.h` endorsement.

## Remaining Risks

- The first version may feel modest for users expecting multi-target workflows.
- Generated code correctness depends on disciplined escaping, validation, and fixtures.
- UI density must not crowd the first screen.

