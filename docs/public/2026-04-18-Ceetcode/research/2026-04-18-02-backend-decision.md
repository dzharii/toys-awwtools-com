# Backend Decision Record
Date: 2026-04-18

## Decision
Adopt `wasm-clang` as the current browser execution backend, with TinyCC retained as researched primary path.

## Why
- Product contract requires browser-only compile/run with deterministic harness outcomes.
- TCC feasibility checkpoint did not produce direct TCC->Wasm capability.
- `wasm-clang` provided a working browser-hosted compile+link+run pipeline that satisfies static deployment and worker isolation requirements.

## Architectural safeguards
- UI and harness do not depend on backend internals.
- Compiler backend is consumed via `WorkerCompilerClient` boundary.
- Backend can be swapped later without redesigning problem model or UX.

## Tradeoffs
- Larger compiler assets than an ideal TinyCC-Wasm backend.
- Runtime stderr channel cannot currently be separated from stdout due host callback limits in inherited memfs API.

## Follow-ups
- Investigate extending runtime host callback to preserve fd-level output channels.
- Keep monitoring TCC backend ecosystem for viable wasm emission paths.
