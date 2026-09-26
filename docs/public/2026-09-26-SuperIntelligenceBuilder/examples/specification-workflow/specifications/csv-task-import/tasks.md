# Tasks: Bulk CSV Task Import

Status: Planned; do not implement until the blocking product decisions in [spec.md](spec.md) are resolved  
Last updated: 2026-09-26

These tasks derive from [spec.md](spec.md) and [plan.md](plan.md) under the [project constitution](../../.specify/memory/constitution.md). Paths below are logical deliverable areas because the application repository and framework are not present in this workspace. `T-002` must replace them with concrete repository paths in this plan before implementation edits begin.

## Phase 1: Decisions and discovery

- [ ] **T-001 — Resolve the input and eligibility contract**  
  **Depends on:** None  
  **Covers:** FR-002 through FR-006; OQ-001 through OQ-005  
  **Deliverables:** Product-owner decisions for headers, optional values, date syntax, CSV dialect, duplicate identity, and eligible-subset behavior; corresponding updates to `spec.md`, `plan.md`, fixtures, and traceability without changing existing IDs.  
  **Verification:** Review each blocking open question as answered; confirm no assumption and requirement conflict remains; define the final expected cases for VT-002 and VT-003.

- [ ] **T-002 — Map the logical plan to the implementation repository**  
  **Depends on:** T-001  
  **Covers:** PD-001 through PD-008  
  **Deliverables:** Document concrete existing paths for import UI, task application service, authorization policy, persistence transaction, task/member lookup, telemetry, release control, and each test layer. Record existing conventions and revise this plan if atomicity or retention assumptions do not fit.  
  **Verification:** Reviewer can follow every logical boundary to an owned source/test path; no new framework or cloud vendor is introduced without a separate approved decision.

## Phase 2: Foundational contracts

- [ ] **T-003 — Build bounded CSV ingestion and row validation**  
  **Depends on:** T-001, T-002  
  **Covers:** FR-002 through FR-005, FR-016; PD-002, PD-003  
  **Deliverables:** Bounded UTF-8/CSV reader, header validation, stable source-row representation, pure row-rule results, and synthetic fixtures at discovered source/test paths.  
  **Verification:** Implement and run VT-002 and the non-lookup portions of VT-003; confirm forbidden-value canaries do not appear in captured diagnostics (VT-009). Maps AC-002, AC-003, AC-004, and AC-013 to tests VT-002, VT-003, and VT-009.

- [ ] **T-004 — Integrate project-scoped authorization and lookup contracts**  
  **Depends on:** T-002  
  **Covers:** FR-001, FR-005, FR-006, FR-010; PD-003, PD-004  
  **Deliverables:** Adapters to the existing editor policy, project membership lookup, and existing-task duplicate lookup, all requiring explicit project scope.  
  **Verification:** Implement and run VT-001 plus lookup portions of VT-003, including cross-project isolation and revoked access. Maps AC-001, AC-005, and AC-008 to VT-001 and VT-003.

- [ ] **T-005 — Establish import identity, session retention, and telemetry schemas**  
  **Depends on:** T-002  
  **Covers:** FR-012, FR-016, FR-017; PD-001, PD-006, PD-008  
  **Deliverables:** Opaque import identity, lifecycle/expiry contract, durable idempotency record contract, allowlisted operational-event schema, cleanup policy, and migrations only if existing storage requires them.  
  **Verification:** Implement and run schema/contract portions of VT-006, VT-009, and VT-010; inspect emitted/retained fields against forbidden-value canaries. Maps AC-009, AC-013, AC-014, and AC-015 to VT-006, VT-009, and VT-010.

## Phase 3: Review experience

- [ ] **T-006 — Implement non-mutating selection and review orchestration**  
  **Depends on:** T-003, T-004, T-005  
  **Covers:** FR-001 through FR-009, FR-015; PD-001 through PD-004, PD-007  
  **Deliverables:** Authorized entry, file selection/replacement/cancel, deterministic review state, row issues, summary counts, confirmation wording, and no task mutation, using discovered application paths.  
  **Verification:** Implement and run VT-003, VT-004, and selection/review cases of VT-008 and VT-011. Maps AC-003, AC-004, AC-005, AC-006, AC-011, and AC-012 to VT-003, VT-004, VT-008, and VT-011.

## Phase 4: Atomic confirmation and recovery

- [ ] **T-007 — Implement revalidation and atomic batch creation**  
  **Depends on:** T-004, T-005, T-006  
  **Covers:** FR-009 through FR-011; PD-003 through PD-005  
  **Deliverables:** Deliberate confirmation command, commit-time authorization/membership/duplicate revalidation, stale-review response, and all-or-none creation through the existing persistence boundary.  
  **Verification:** Implement and run VT-005 with fault injection at every supported commit boundary and stale-fact case. Maps AC-007 and AC-008 to VT-005.

- [ ] **T-008 — Complete idempotency, concurrency, and recovery behavior**  
  **Depends on:** T-005, T-007  
  **Covers:** FR-012 through FR-014; PD-001, PD-006, PD-007  
  **Deliverables:** Single-use commit guard, result reconciliation after lost responses, typed recovery states, retained review for safe retry, exact success count, cancel, and cleanup triggers.  
  **Verification:** Implement and run VT-006 and VT-007, including double activation, timeout, lost response, and concurrent submission. Maps AC-009, AC-010, and AC-015 to VT-006 and VT-007.

## Phase 5: Accessibility, privacy, and operations

- [ ] **T-009 — Finish keyboard and assistive-technology behavior**  
  **Depends on:** T-006, T-008  
  **Covers:** FR-015; PD-007  
  **Deliverables:** Logical tab order, focus transitions, semantic summary/status announcements, row-error relationships, and keyboard operation for all actions and states.  
  **Verification:** Implement and run VT-008 across selection, review, validation error, permission error, commit failure, and completion. Maps AC-011 and AC-012 to VT-008.

- [ ] **T-010 — Wire privacy-safe telemetry and retention cleanup**  
  **Depends on:** T-005, T-008  
  **Covers:** FR-016, FR-017; PD-008  
  **Deliverables:** One terminal operational event per defined outcome, aggregate metrics, cleanup for replacement/cancel/success/abandonment/failure, and operational alert hooks using existing facilities.  
  **Verification:** Implement and run VT-009 and VT-010 with unique canary task titles, emails, CSV fragments, and validation values; confirm exact event cardinality. Maps AC-005, AC-013, and AC-014 to VT-009 and VT-010.

- [ ] **T-011 — Add controlled rollout and rollback controls**  
  **Depends on:** T-002, T-010  
  **Covers:** FR-001, FR-014, FR-017; rollout section of `plan.md`  
  **Deliverables:** Configuration through the existing release-control mechanism, cohort plan, observation/stop conditions, rollback procedure, and active-session cleanup procedure.  
  **Verification:** Exercise disabled, limited-cohort, expanded, and rollback states in a nonproduction environment; record actual checks and telemetry queries without user content.

## Phase 6: Acceptance and traceability

- [ ] **T-012 — Run end-to-end acceptance and close traceability**  
  **Depends on:** T-007, T-008, T-009, T-010, T-011  
  **Covers:** FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, FR-010, FR-011, FR-012, FR-013, FR-014, FR-015, FR-016, and FR-017; AC-001 through AC-015; PD-001 through PD-008  
  **Deliverables:** Executed VT-011 suite, acceptance evidence, updated requirement/design/task/test matrices, resolved discrepancies, and a release recommendation that distinguishes passed, failed, and unrun checks.  
  **Verification:** Run VT-001 through VT-011 in the applicable environments; independently audit every AC row in the matrix below and verify Markdown links.

## Acceptance-criterion coverage

| Acceptance criterion | Delivery tasks | Required tests |
| --- | --- | --- |
| AC-001 | T-004, T-006 | VT-001 |
| AC-002 | T-003 | VT-002 |
| AC-003 | T-003, T-006 | VT-002 |
| AC-004 | T-003, T-006 | VT-003, VT-011 |
| AC-005 | T-004, T-006, T-010 | VT-003, VT-009 |
| AC-006 | T-006 | VT-004 |
| AC-007 | T-007 | VT-005, VT-011 |
| AC-008 | T-004, T-007 | VT-001, VT-005, VT-011 |
| AC-009 | T-005, T-008 | VT-006, VT-011 |
| AC-010 | T-008 | VT-007, VT-011 |
| AC-011 | T-006, T-009 | VT-008, VT-011 |
| AC-012 | T-006, T-009 | VT-008 |
| AC-013 | T-003, T-005, T-010 | VT-009 |
| AC-014 | T-005, T-010 | VT-009, VT-010 |
| AC-015 | T-005, T-008 | VT-006, VT-011 |

## Dependency summary

`T-001 -> T-002 -> (T-003, T-004, T-005) -> T-006 -> T-007 -> T-008 -> (T-009, T-010) -> T-011 -> T-012`

`T-003`, `T-004`, and `T-005` may proceed in parallel after `T-002`. `T-009` may proceed after `T-008` while `T-010` is underway, but `T-012` waits for all delivery and rollout tasks.
