# Specification-driven development instructions

Use this repository's specification artifacts as the source of product intent. Work in this order:

1. Read [the project constitution](.specify/memory/constitution.md).
2. Write or revise a feature's `spec.md` from consumer-visible behavior.
3. Derive `plan.md` from the approved specification.
4. Derive dependency-ordered `tasks.md` from the specification and plan.
5. Implement only when implementation is explicitly requested and all blocking open questions are resolved.

Keep the constitution, product specification, technical plan, and tasks separate. This follows the artifact separation described by [GitHub Spec Kit](https://github.com/github/spec-kit) and the consumer-focused product/technical split documented in [Warp's contributing guide](https://github.com/warpdotdev/warp/blob/master/CONTRIBUTING.md). These links are references; do not copy their text into repository artifacts.

## Product specification rules

- Describe what a consumer sees, does, and can rely on before discussing implementation.
- Include scope, non-goals, assumptions, edge cases, measurable acceptance criteria, and open questions.
- Assign stable IDs to functional requirements (`FR-###`) and acceptance criteria (`AC-###`).
- State uncertainty as an assumption or open question. Do not silently resolve missing product decisions.
- Keep `spec.md` implementation-free: no framework, database, service, module, or cloud-vendor choices.

## Planning rules

- Derive every plan decision from one or more requirements.
- Record architecture boundaries, data flow, validation, security, privacy, observability, rollout, rollback, and testing layers.
- Do not invent a framework or cloud vendor. If the implementation repository is not available, use logical component boundaries and record code-path discovery as a task.
- Assign stable plan decision IDs (`PD-###`) and verification IDs (`VT-###`).

## Task rules

- Use stable task IDs (`T-###`) and state dependencies, deliverables, and verification for every task.
- Order tasks so prerequisites appear before their dependents.
- Map every acceptance criterion to at least one task and named test; map tasks back to requirements and plan decisions.
- Keep tasks reviewable and bounded. Do not hide product decisions inside implementation tasks.

## Change discipline

- Validate relative Markdown links and cross-artifact ID references after changing specification artifacts.
- Preserve unrelated work and do not edit `Program.cs`, project files, or builder source as part of specification work.
- Do not claim that a check passed unless it was run.
