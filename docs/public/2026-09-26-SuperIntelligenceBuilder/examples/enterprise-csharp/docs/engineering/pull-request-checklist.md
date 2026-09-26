# Pull request checklist

Use `N/A - reason` when an item does not apply. Link test output, design records, migration scripts, dashboards, or issues rather than asserting completion without evidence.

## Scope and design

- [ ] The change and acceptance criteria are summarized; unrelated changes are excluded.
- [ ] The simplest design that preserves domain boundaries and dependency direction was used.
- [ ] Every new abstraction has multiple real implementations, isolates a volatile boundary, or has a documented measurable benefit.
- [ ] Any new deployable service has justified ownership, deployment/scaling, data, contract, failure, observability, migration, and rollback boundaries.
- [ ] Significant or hard-to-reverse architecture decisions are recorded with alternatives and consequences.

## Correctness and reliability

- [ ] Nullable annotations model absence accurately; no warning or analyzer rule was weakened.
- [ ] Asynchronous code is async end to end; caller cancellation reaches every cancellable operation.
- [ ] Expected failures and exceptional failures have explicit, documented semantics.
- [ ] Exceptions are not swallowed, hidden behind default values, or redundantly logged and rethrown.
- [ ] Retries are limited to transient/idempotent operations, bounded by attempts and time, use backoff with jitter, honor cancellation, and expose the terminal outcome.
- [ ] Concurrency, transaction, idempotency, timeout, and partial-failure behavior are covered where applicable.

## Security, privacy, and operations

- [ ] Security impact is recorded: trust boundaries, authentication/authorization, input handling, dependencies, secrets, and abuse cases.
- [ ] Privacy impact is recorded: personal-data purpose, minimization, access, logs, retention, deletion, and residency.
- [ ] Logs use stable templates and named fields; secrets and unnecessary personal data are absent or redacted.
- [ ] Metrics, traces, correlation, health behavior, dashboards/alerts, and operational ownership are updated as needed.

## Compatibility, migration, and rollback

- [ ] API, event, configuration, binary/source, and stored-data compatibility were reviewed; versioning/deprecation is documented.
- [ ] Migration supports the required deployment order and mixed-version period; backfill and post-migration verification are defined.
- [ ] Rollback triggers, steps, ownership, expected recovery time, and data consequences were exercised or documented.
- [ ] When rollback is unsafe, a forward-fix or feature-disable path is documented and tested.

## Verification

- [ ] Unit tests cover changed domain rules, edges, and the regression scenario for each defect fix.
- [ ] Integration tests cover changed infrastructure, serialization, persistence, framework wiring, cancellation, and failure behavior.
- [ ] Contract tests cover changed independently versioned or externally owned interfaces.
- [ ] Architecture tests cover new or changed dependency rules where those rules are mechanically enforceable.
- [ ] `dotnet restore`, `dotnet build --no-restore`, and relevant `dotnet test --no-build` commands passed; exact commands/results are linked.
- [ ] Changed XML, `.editorconfig`, Markdown links, and documentation consistency were validated.
- [ ] No flaky test was ignored, quarantined, or rerun until green; any approved quality-gate exception has owner, controls, and expiry.

Review the risk matrix in [quality gates](quality-gates.md), the [architecture guide](architecture.md), and the [coding standards](coding-standards.md).
