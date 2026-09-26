# Project Constitution

Version: 1.0.0  
Ratified: 2026-09-26  
Last amended: 2026-09-26

## I. Consumer-visible behavior leads

Every feature MUST first be described in terms of what its consumer can observe, do, and rely on. Product specifications MUST remain free of implementation choices. Technical design begins only after scope, behavior, and acceptance criteria are explicit.

## II. Scope and uncertainty are explicit

Every product specification MUST state scope, non-goals, assumptions, edge cases, measurable acceptance criteria, and open questions. Unknown facts MUST NOT be guessed. A product-affecting assumption MUST be confirmed or retained as a clearly marked provisional decision before implementation begins.

## III. Traceability is continuous

Requirements and acceptance criteria MUST have stable IDs. Plans MUST map requirements to design decisions and verification. Tasks MUST map back to requirements and plan decisions, and every acceptance criterion MUST map to at least one task and one named test. IDs MUST NOT be silently reused for different meanings.

## IV. Atomicity, authorization, privacy, and recovery are invariants

Changes affecting user data MUST define transactional boundaries, authorization checks, privacy controls, failure behavior, and recovery. A failure MUST leave the system in a defined state. Sensitive or user-provided content MUST NOT enter logs or telemetry unless the specification explicitly authorizes it.

## V. Verification is designed with the work

Plans MUST cover testing at the appropriate unit, integration, contract, accessibility, and end-to-end layers. Acceptance criteria MUST be objectively verifiable. Completion claims MUST identify the checks actually run and MUST distinguish unrun checks from passing checks.

## VI. Artifacts have distinct responsibilities

The constitution defines durable principles. A product specification defines desired behavior. A technical plan defines an implementation approach. A task list defines dependency-ordered work and verification. Content MUST live in the earliest appropriate artifact and later artifacts MUST reference rather than redefine it.

## Governance

- This constitution governs all feature specifications, plans, and task lists in this workspace.
- Amendments require a version change, amendment date, rationale, and review of affected artifacts.
- Breaking or removing a principle increments the major version; adding a principle or materially expanding obligations increments the minor version; wording-only clarification increments the patch version.
- Reviewers MUST reject downstream artifacts that conflict with a `MUST` statement until the conflict is corrected or the constitution is explicitly amended.

## Research basis

The artifact sequence is informed by [GitHub Spec Kit](https://github.com/github/spec-kit), and the separation of consumer behavior from implementation planning is informed by [Warp's contributing guide](https://github.com/warpdotdev/warp/blob/master/CONTRIBUTING.md). The project applies those ideas in its own words.
