# Product Specification: Bulk CSV Task Import

Status: Draft pending the open product decisions below  
Last updated: 2026-09-26

## Summary

Bulk CSV task import lets a signed-in project editor select a UTF-8 CSV file no larger than 5 MiB, review validation results for every data row, and confirm creation of the eligible tasks as one atomic operation. The experience makes duplicates, permission changes, failures, and recovery visible without exposing uploaded task data beyond the import session.

## Goals

- Let a project editor create many tasks from one CSV after reviewing the exact outcome.
- Prevent partial imports: confirmation creates every eligible task or creates none.
- Explain row-level problems well enough for a user to correct and retry.
- Preserve permission, keyboard-access, privacy, recovery, and observability expectations.

## Scope

In scope:

- Entry to the import flow from a single project.
- Selection and validation of one CSV containing `title`, `assignee_email`, and `due_date` columns.
- A review state that distinguishes eligible rows from rows that will not be imported.
- Duplicate detection within the file and against the current project.
- Atomic confirmation, failure handling, retry, and cancellation.
- Keyboard and assistive-technology access.
- Privacy-safe operational measurement.

## Non-goals

- Importing formats other than CSV or encodings other than UTF-8.
- Importing multiple files in one operation.
- Creating users, inviting assignees, creating projects, or updating existing tasks.
- Mapping arbitrary column names, saving reusable mappings, or scheduling recurring imports.
- Defining a framework, database, queue, cloud provider, or other implementation technology.

## Actors and preconditions

- The actor is signed in.
- The actor is viewing a project for which they currently have editor permission.
- The selected file is available to the actor's device.

## Assumptions requiring confirmation

- **AS-001:** 5 MiB means 5,242,880 bytes. A file of exactly that size is accepted; a larger file is rejected.
- **AS-002:** Header names are case-sensitive after trimming surrounding whitespace; all three required headers must appear exactly once. Extra columns are rejected so ignored data is not silently discarded.
- **AS-003:** `title` is required after trimming; `assignee_email` and `due_date` may be blank. A nonblank email must identify an existing project member, and a nonblank date uses `YYYY-MM-DD`.
- **AS-004:** Standard CSV quoting permits commas, line breaks, and escaped quotes inside quoted fields. A UTF-8 byte-order mark is accepted.
- **AS-005:** A duplicate has the same trimmed, case-folded title, normalized assignee email (including both blank), and due date (including both blank) within the current project. The first occurrence in the file may be eligible; later occurrences are duplicates.
- **AS-006:** Invalid and duplicate rows are excluded, while all remaining eligible rows may be confirmed. Atomicity applies to that eligible set. If no rows are eligible, confirmation is unavailable.
- **AS-007:** Uploaded content and validation results last only for the active import session and are discarded when the flow is cancelled, completed, or abandoned.

These assumptions make the draft testable but are not silently binding product decisions. Resolve **OQ-001** through **OQ-005** before implementation.

## Consumer-visible behavior

### Access and selection

- **FR-001:** Only a signed-in user with editor permission for the current project can open or operate the import flow. A denied user sees that permission is required and no uploaded file is processed.
- **FR-002:** The flow accepts one `.csv` file encoded as valid UTF-8 and no larger than 5 MiB. Before review, it explains a wrong file type, invalid encoding, empty file, unreadable file, or oversized file without creating tasks.
- **FR-003:** The CSV must have one header row containing the required `title`, `assignee_email`, and `due_date` columns according to the confirmed header policy. Header defects are shown as file-level errors.

### Validation and review

- **FR-004:** Every nonblank data row receives a stable displayed row number and one outcome: eligible or excluded with one or more reasons. Blank lines do not become tasks.
- **FR-005:** Row validation covers missing or invalid titles, assignee membership, due-date format, malformed CSV, and duplicate status. Multiple known problems on one row are shown together.
- **FR-006:** Duplicate detection covers both repeated tasks in the selected file and matching tasks already in the current project, using the confirmed duplicate rule.
- **FR-007:** The review shows total, eligible, excluded, and duplicate counts and presents enough sanitized row context to locate each problem. It never presents an excluded row as importable.
- **FR-008:** No task is created by file selection or validation. Before confirmation, the user can cancel, replace the file, or correct it outside the product and select it again.

### Confirmation and atomicity

- **FR-009:** Confirmation explicitly states how many eligible tasks will be created and requires a deliberate user action.
- **FR-010:** At confirmation, the product rechecks project-editor permission and any state used for duplicate or assignee validation. Newly invalid rows are returned to review with explanations rather than imported under stale results.
- **FR-011:** One confirmation creates all rows still eligible at commit time as a single atomic operation. If any task cannot be created, none from that confirmation are created.
- **FR-012:** Repeated activation, retries, or a delayed response cannot create the same confirmed import more than once.

### Completion, recovery, and access

- **FR-013:** Success reports the exact number of tasks created and offers a route back to the project tasks. It does not claim excluded rows were imported.
- **FR-014:** A recoverable failure reports that no tasks were created, preserves the review while the session remains active, and lets the user retry or cancel. If recovery is impossible, it explains that a new file selection is required.
- **FR-015:** All actions and validation results are operable by keyboard, have a logical focus order, expose names and error relationships to assistive technology, and move focus to a useful summary after validation or submission.
- **FR-016:** Uploaded content, titles, email addresses, and raw validation values are not included in logs or telemetry and are not retained beyond the import session under **AS-007**.
- **FR-017:** The product records privacy-safe operational outcomes sufficient to distinguish selection rejection, validation completion, permission denial, commit success, commit failure, and duplicate prevention, together with counts, duration, project-scoped pseudonymous correlation, and a non-content error category.

## Edge cases

- An empty file, a header-only file, blank lines, a byte-order mark, quoted commas, embedded line breaks, escaped quotes, and a malformed quoted field.
- Missing, repeated, misspelled, differently cased, reordered, or extra headers.
- Exactly 5 MiB versus one byte over the limit.
- An extremely long field or very large number of small rows within the size limit.
- Blank optional values, surrounding whitespace, nonmember email, differently cased email, invalid calendar date, and date around a locale or time-zone boundary.
- Repeated rows within one file and a match already in the project.
- The matching project task or assignee membership changes after review but before confirmation.
- Editor permission is revoked while review is open.
- Double activation, concurrent imports, timeout, connection loss, and a response lost after commit.
- Cancel, navigation away, focus loss, and selecting a replacement file.

## Measurable acceptance criteria

- **AC-001:** In authorization tests, every non-editor and signed-out attempt is denied before file processing, while an editor can reach file selection.
- **AC-002:** Files from 0 through 5,242,880 bytes follow the specified content validation; a 5,242,881-byte file is rejected, and neither case creates a task before confirmation.
- **AC-003:** A fixture for each file/header edge case has one deterministic accepted or rejected outcome and a user-visible explanation for every rejection.
- **AC-004:** For a mixed fixture, 100% of nonblank data rows appear exactly once in review with their source row number, eligibility state, and all detected reasons; displayed totals equal the row outcomes.
- **AC-005:** Within-file and existing-project duplicate fixtures identify every match under the confirmed rule, exclude those rows, and expose no raw uploaded value in operational logs.
- **AC-006:** Selecting, validating, replacing, or cancelling a file creates zero tasks.
- **AC-007:** For a confirmation of `N` eligible rows, success creates exactly `N` tasks; an injected failure at each commit boundary creates zero tasks from that confirmation.
- **AC-008:** Revoked editor permission or newly stale assignee/duplicate state is detected at confirmation and creates zero tasks until the review is valid again.
- **AC-009:** Repeated confirmation and retry scenarios create at most one copy of each task belonging to a single confirmed import.
- **AC-010:** Every recoverable failure state says that no tasks were created, retains the reviewed outcomes, and exposes working retry and cancel actions.
- **AC-011:** A keyboard-only user can select, review, navigate errors, confirm, retry, and cancel without a focus trap; focus lands on the validation or result summary after each submission.
- **AC-012:** Automated accessibility checks report no serious or critical violations in selection, review, error, and completion states, and assistive-technology labels identify row errors and summary counts.
- **AC-013:** After cancel, success, or session abandonment, a retention check finds no uploaded file content or row values in durable import-session storage, logs, or telemetry.
- **AC-014:** Each defined operational outcome emits exactly one event with counts, duration, correlation, and category, and emits no task title, email address, raw CSV fragment, or unredacted validation value.
- **AC-015:** A lost response, double activation, and two concurrent submissions of the same reviewed import each satisfy **AC-007** and **AC-009**.

## Open questions

- **OQ-001 (blocking):** Confirm the exact header and extra-column policy in **AS-002**.
- **OQ-002 (blocking):** Confirm required/optional cell values and date syntax in **AS-003**.
- **OQ-003 (blocking):** Confirm the CSV dialect and byte-order-mark behavior in **AS-004**.
- **OQ-004 (blocking):** Confirm duplicate identity, treatment of later within-file matches, and whether existing completed/archived tasks count in **AS-005**.
- **OQ-005 (blocking):** Confirm that excluded rows do not block importing the eligible subset, as stated in **AS-006**.
- **OQ-006:** What user-facing support or diagnostic reference, if any, should a nonrecoverable failure display?
- **OQ-007:** Is there a product response-time target for validating the largest allowed file, and on what reference environment should it be measured?

## Requirement-to-acceptance traceability

| Requirement | Acceptance criteria |
| --- | --- |
| FR-001 | AC-001, AC-008 |
| FR-002, FR-003 | AC-002, AC-003, AC-006 |
| FR-004, FR-005, FR-007 | AC-003, AC-004 |
| FR-006 | AC-005, AC-008 |
| FR-008, FR-009 | AC-006, AC-011 |
| FR-010 | AC-008, AC-015 |
| FR-011 | AC-007, AC-015 |
| FR-012 | AC-009, AC-015 |
| FR-013 | AC-007, AC-011 |
| FR-014 | AC-010, AC-015 |
| FR-015 | AC-011, AC-012 |
| FR-016 | AC-005, AC-013, AC-014 |
| FR-017 | AC-014 |
