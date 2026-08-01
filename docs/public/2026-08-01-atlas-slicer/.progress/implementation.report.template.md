# Implementation Progress Report Template

## Side Notes

Use the current date and time when adding each entry. Do not reuse the date on which the work was requested unless the entry is being written on that same date.

Use an ISO 8601 timestamp with the local UTC offset:

`YYYY-MM-DDTHH:MM:SS-07:00`

Each completed or meaningfully distinct work item should have its own entry.

A single progress-report file may contain multiple entries. Append new entries below existing entries instead of replacing earlier entries.

Write concrete facts. Name relevant files, commands, tests, settings, modules, and unresolved risks.

Do not report a test, build, review, or verification as successful unless it was actually performed.

Use `Not started`, `In progress`, `Blocked`, `Partially complete`, or `Done` as the status unless another explicit project status is required.

Remove all guiding questions and instructional notes from an entry after replacing them with actual information.

---

## Entry Template

[CURRENT DATE AND TIME]

### Request

[What was requested?

What specification, issue, plan, ticket, or document governs the work?

What exact result was expected?]

### Intent

[Why is this work being performed?

What user, product, engineering, maintenance, or operational outcome should it support?

What behavior should become possible or improve?]

### Problem

[What was missing, incorrect, outdated, unreliable, or difficult before this work?

Where did the problem occur?

What concrete failure mode or limitation motivated the request?]

### Planned impact

[What should change after the work is completed?

What should users, developers, tests, builds, or runtime components be able to do?

What behavior must remain unchanged?]

### Tasks

- [What source documents, specifications, or existing implementations must be reviewed?]
- [What code, configuration, documentation, or assets must be added or changed?]
- [What compatibility, migration, or integration work is required?]
- [What tests or verification steps must be added or updated?]
- [What commands must be run before the work can be considered complete?]

### Implementation

[What was actually changed?

Which files, modules, functions, settings, schemas, commands, or components were added or updated?

How does the implemented behavior work?

Mention important implementation boundaries and anything deliberately left unchanged.]

### Rationale

[Why was this implementation approach selected?

What alternatives or couplings were avoided?

How does the approach preserve existing behavior, security, privacy, maintainability, or compatibility?]

### Evidence

[What evidence shows that the work functions as intended?

Include exact test commands and their results.

Include build, lint, type-check, or validation commands and their results.

Include manual verification details when manual verification was performed.

Example:

`[test command]` passed: [number] tests, [number] failures.

`[build command]` passed: [relevant output summary].]

### Limitations and risks

[What was not implemented or verified?

What edge cases remain?

What assumptions does the implementation make?

What should be checked manually?

What technical, compatibility, performance, privacy, or maintenance risks remain?

Write `None identified` only when the work was reviewed specifically for limitations and no meaningful limitations were found.]

### Status

[Not started | In progress | Blocked | Partially complete | Done]

---

## Additional Entry

[CURRENT DATE AND TIME]

### Request

[State the next request or work item.

Use a separate entry when the work has a distinct objective, implementation, evidence, or status.]

### Intent

[What outcome is this entry intended to produce?]

### Problem

[What specific problem does this entry address?]

### Planned impact

[What should be different after this work?]

### Tasks

- [First concrete task.]
- [Second concrete task.]
- [Required test or verification task.]
- [Required build, validation, or documentation task.]

### Implementation

[Describe only the work completed for this entry.

Name affected files and components explicitly.]

### Rationale

[Explain why this solution was selected and how it fits the existing system.]

### Evidence

[Record the exact verification performed and its result.

Do not copy evidence from another entry unless the same commands were rerun for this work.]

### Limitations and risks

[Record unverified behavior, excluded scope, remaining edge cases, and follow-up risks.]

### Status

[Not started | In progress | Blocked | Partially complete | Done]

---

## Additional Entry

[CURRENT DATE AND TIME]

### Request

[State another request, issue, or implementation objective.]

### Intent

[State the intended user or engineering outcome.]

### Problem

[Describe the prior condition or failure that required this work.]

### Planned impact

[Describe the expected observable result and any behavior that must remain stable.]

### Tasks

- [Review or discovery task.]
- [Implementation task.]
- [Integration or migration task.]
- [Testing task.]
- [Final validation task.]

### Implementation

[Summarize the completed changes with explicit file paths, identifiers, settings, commands, or components where applicable.]

### Rationale

[Explain the design decision and its relevant tradeoffs.]

### Evidence

[Provide test, build, validation, review, or manual-verification results.]

### Limitations and risks

[State what remains unsupported, untested, uncertain, or dependent on future work.]

### Status

[Not started | In progress | Blocked | Partially complete | Done]

---

## Entry Completion Check

Before finalizing each entry, confirm that:

- The timestamp is the current local date and time.
- The request is stated as a concrete action or deliverable.
- The intent explains why the work matters.
- The problem describes the previous condition rather than repeating the request.
- The planned impact describes an observable expected result.
- The tasks reflect the intended work.
- The implementation reflects the work actually completed.
- The rationale explains the chosen approach.
- The evidence contains only verification that was actually performed.
- The limitations and risks section explicitly records missing verification and excluded scope.
- The status matches the current state of the work.
- All placeholder text and guiding questions have been removed from the completed entry.