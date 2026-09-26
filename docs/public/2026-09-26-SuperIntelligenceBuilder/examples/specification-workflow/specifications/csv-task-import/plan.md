# Technical Plan: Bulk CSV Task Import

Status: Draft; implementation is blocked on `OQ-001` through `OQ-005` in [spec.md](spec.md)  
Last updated: 2026-09-26

## Context and constraints

This plan derives from [the product specification](spec.md) and is governed by [the project constitution](../../.specify/memory/constitution.md). The workspace does not identify the task tracker's implementation framework, persistence layer, deployment platform, or source layout. Accordingly, the plan names logical boundaries only. The implementation team must map them to existing code and tests before changing application code; it must not introduce a framework or cloud vendor merely to fit this plan.

The product decisions in `OQ-001` through `OQ-005` affect parsing and eligibility and must be resolved before those contracts are implemented. `OQ-006` and `OQ-007` may remain documented if product owners explicitly accept them as follow-up decisions.

## Architecture boundaries

- **PD-001 — Import session boundary:** A project-scoped coordinator owns selection metadata, validation status, review results, and the one-time confirmation identity. It exposes no mutation before confirmation. Covers FR-002 through FR-014.
- **PD-002 — CSV ingestion boundary:** A bounded reader enforces the byte limit before full processing, validates UTF-8 and the agreed CSV/header contract, and produces source-row records without logging field values. Covers FR-002 through FR-005 and FR-016.
- **PD-003 — Validation boundary:** Pure row validation returns all known issues per row and separates eligible from excluded rows. Membership and duplicate checks use project-scoped read interfaces. Covers FR-004 through FR-007.
- **PD-004 — Authorization boundary:** The existing project authorization policy is used both when opening the flow and immediately before mutation. Permission is not inferred from UI visibility. Covers FR-001 and FR-010.
- **PD-005 — Atomic application boundary:** One application operation receives the reviewed import identity and eligible rows, revalidates mutable facts, and creates all tasks in one persistence transaction or equivalent atomic unit. Covers FR-009 through FR-012.
- **PD-006 — Idempotency and concurrency boundary:** A unique confirmation identity and project-scoped commit guard make repeat and concurrent submissions return the original outcome or a safe current review; they cannot create a second batch. Covers FR-010 through FR-012.
- **PD-007 — Presentation and accessibility boundary:** Selection, review, confirmation, completion, and recovery are explicit states. A row issue model drives visible messages, focus management, and assistive-technology relationships. Covers FR-007 through FR-015.
- **PD-008 — Observability and retention boundary:** Instrumentation accepts only an allowlisted outcome schema, while session cleanup removes uploaded and derived content at terminal states and expiry. Covers FR-014, FR-016, and FR-017.

## Data contracts

Names below are conceptual and should follow existing repository conventions.

- **Import identity:** opaque one-time identifier, project identifier, actor identifier, creation/expiry times, and lifecycle state. It must not embed CSV values.
- **Source row:** displayed source row number plus the three parsed input fields. This is session data, not telemetry.
- **Row result:** source row number, eligibility, normalized values needed for comparison, and a set of stable non-content issue codes.
- **Review summary:** total, eligible, excluded, and duplicate counts plus row results.
- **Commit request/outcome:** import identity, reviewed-version token, eligible rows, and either exact created count or a typed no-creation result.
- **Operational event:** outcome name, counts, duration, pseudonymous project-scoped correlation, and allowlisted error category. It excludes raw fields and row values.

## Data flow

1. At flow entry, authorize the actor for the selected project (**PD-004**).
2. On selection, reject a file that exceeds the limit before full read; then decode and parse within bounded resource limits (**PD-002**).
3. Validate file structure and every row. Resolve assignees and duplicates through project-scoped reads, collecting all known row issues (**PD-003**).
4. Store only the session data needed to render review and commit; render counts and row outcomes without mutating tasks (**PD-001**, **PD-007**).
5. On confirmation, acquire the idempotency/commit guard, reauthorize, and revalidate mutable membership and duplicate facts (**PD-004**, **PD-006**).
6. If revalidation changes eligibility, return the updated review without mutation. Otherwise create the complete eligible batch inside one atomic boundary (**PD-005**).
7. Publish a success or typed failure outcome after the atomic boundary is known, emit privacy-safe telemetry, and clean up session content at the appropriate terminal point (**PD-007**, **PD-008**).

## Validation strategy

- Enforce size, decodability, file structure, and header rules before row eligibility.
- Preserve source row numbering across blank and quoted multiline records according to the confirmed CSV contract.
- Return all independently detectable row issues in one pass; do not force iterative single-error correction.
- Normalize only as specified by resolved product decisions. Retain original values solely for the active review.
- Perform within-file duplicate detection deterministically, then compare candidate keys against the current project.
- Recheck permission, assignee membership, and existing-project duplicates at commit time. Treat changed facts as a refreshed review, not as a partial commit.
- Bound parser memory, field length, row count, and processing time consistently with the 5 MiB limit. Exact defensive bounds must be chosen from existing platform constraints and must not reject inputs the final product contract accepts.

## Security and privacy risks

| Risk | Mitigation |
| --- | --- |
| Unauthorized import or confused-project access | Use the existing project policy at entry and commit; bind session and queries to one project; reject client-supplied authorization claims. |
| CSV/parser resource exhaustion | Enforce byte limit before full read; use bounded parsing and field/row guards; cancel abandoned work. |
| Formula or markup injection in review | Render fields as text and follow existing output-encoding rules; do not interpret uploaded content. |
| Race between review and commit | Reauthorize and revalidate mutable facts inside or immediately adjacent to the protected commit boundary. |
| Partial or repeated writes | Use one atomic unit plus a uniqueness constraint or equivalent durable idempotency guard. |
| Cross-project duplicate or member lookup | Require project scope on every lookup and test isolation explicitly. |
| Personal data in logs/telemetry | Allowlist event fields and stable issue categories; add automated sink-capture tests for forbidden content. |
| Uploaded data retained too long | Define active-session expiry and cleanup for cancel, completion, replacement, abandonment, and failure. |

## Failure and recovery

- File and row validation failures remain non-mutating and return actionable review information.
- Stale permission, membership, or duplicate facts return a denied or updated-review result with zero created tasks.
- A commit error rolls back the complete batch and preserves review state when safe to retry.
- A lost response is reconciled by import identity: retry returns the recorded success or attempts the still-uncommitted operation once.
- Unknown commit state must be resolved from the durable idempotency record before the UI offers retry; the system must never guess that no commit occurred.
- Cleanup failures are operational errors but must not turn a successful task transaction into a reported failure; retry cleanup separately without retaining content past policy.

## Observability

Record one terminal event for selection rejection, validation completion, permission denial, commit success, commit failure, and duplicate prevention. Use stable outcome/error categories and aggregate counts. Measure end-to-end validation and commit duration separately. Add dashboards or alerts using the repository's existing telemetry facilities for commit-failure rate, rollback failure, cleanup failure, and abnormal denial rate. Never include file names, CSV fragments, titles, emails, due dates, or rendered validation text.

## Rollout and rollback

1. Land parser/validator and atomic application behavior behind the repository's existing release-control mechanism, if one exists. Do not add a vendor solely for rollout.
2. Exercise unit, integration, authorization, concurrency, privacy, accessibility, and end-to-end tests in a nonproduction environment with synthetic data.
3. Enable for an internal or limited project cohort, watching validation outcomes, commit failures, rollback/cleanup failures, and duplicate prevention.
4. Expand only after the observation window and thresholds are agreed with operators under `OQ-007` or an operational decision record.
5. Roll back by disabling new entry and confirmation while allowing already committed tasks to remain. Expire active import sessions and verify cleanup. No data migration is expected because imported tasks use the existing task model; if implementation discovery disproves that assumption, revise this plan before development.

## Testing layers and verification IDs

- **VT-001 — Authorization tests:** entry and commit checks for editor, non-editor, signed-out, revoked, and cross-project actors. Verifies AC-001 and AC-008.
- **VT-002 — File contract tests:** boundary sizes, UTF-8/BOM, CSV dialect, headers, empty/header-only input, quoting, malformed records, and bounded-resource cases. Verifies AC-002 and AC-003.
- **VT-003 — Row validation tests:** each rule alone and combined, source-row stability, all-errors collection, counts, membership, and both duplicate sources. Verifies AC-004 and AC-005.
- **VT-004 — Non-mutation tests:** selection, validation, replacement, cancellation, and invalid review produce no task writes. Verifies AC-006.
- **VT-005 — Atomic persistence tests:** success creates exactly `N`; fault injection at every supported transaction boundary leaves zero; stale facts do not mutate. Verifies AC-007 and AC-008.
- **VT-006 — Idempotency/concurrency tests:** double activation, retry after lost response, delayed response, and concurrent submission create at most one batch. Verifies AC-009 and AC-015.
- **VT-007 — Recovery state tests:** recoverable/nonrecoverable failures, retained review, retry, cancel, and success counts. Verifies AC-010.
- **VT-008 — Accessibility tests:** keyboard flow, focus placement, semantic labels/relationships, and automated serious/critical violation scan across all states. Verifies AC-011 and AC-012.
- **VT-009 — Privacy/retention tests:** captured logs, events, session storage, cleanup, expiry, and forbidden-value canaries. Verifies AC-005, AC-013, and AC-014.
- **VT-010 — Telemetry contract tests:** exactly one terminal event per outcome with required allowlisted fields and no content fields. Verifies AC-014.
- **VT-011 — End-to-end acceptance suite:** synthetic happy path, mixed rows, stale state, atomic failure, lost response, and concurrent confirmation. Verifies AC-004 through AC-015 together.

## Requirement-to-design traceability

| Requirements | Plan decisions | Verification |
| --- | --- | --- |
| FR-001 | PD-004 | VT-001 |
| FR-002, FR-003 | PD-001, PD-002 | VT-002, VT-004 |
| FR-004, FR-005 | PD-002, PD-003, PD-007 | VT-002, VT-003 |
| FR-006 | PD-003, PD-005 | VT-003, VT-005 |
| FR-007, FR-008 | PD-001, PD-007 | VT-003, VT-004, VT-008 |
| FR-009 | PD-001, PD-005, PD-007 | VT-004, VT-005 |
| FR-010 | PD-003, PD-004, PD-005, PD-006 | VT-001, VT-005, VT-006 |
| FR-011 | PD-005 | VT-005, VT-011 |
| FR-012 | PD-006 | VT-006, VT-011 |
| FR-013, FR-014 | PD-001, PD-006, PD-007 | VT-006, VT-007, VT-011 |
| FR-015 | PD-007 | VT-008 |
| FR-016 | PD-002, PD-008 | VT-009, VT-010 |
| FR-017 | PD-008 | VT-010 |
