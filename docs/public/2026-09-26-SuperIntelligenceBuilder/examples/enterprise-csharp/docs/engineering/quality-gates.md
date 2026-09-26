# Quality gates

All changes must build without warnings and pass the tests selected by risk. Select risk by the highest applicable row; uncertainty raises the risk rather than lowering it.

| Risk | Typical change | Required automated evidence | Required review |
| --- | --- | --- | --- |
| Low | Documentation, comments, non-behavioral refactor | Build/lint affected files; existing targeted tests when code compiles differently | Link and internal-consistency check |
| Medium | Business behavior, validation, serialization, persistence query, configuration | Unit tests for rules/edges; integration tests for changed infrastructure/framework behavior; full affected test project | Security, privacy, observability, compatibility, migration, and rollback review |
| High | Authentication/authorization, sensitive data, money, destructive operations, concurrency, public contracts, schema/data migration, distributed workflow | All medium gates; contract tests for versioned boundaries; architecture tests for dependency changes; failure, cancellation, rollback, and migration tests; full solution suite | Named reviewer for the affected risk area and explicit release/rollback plan |

## Build gate

Run from the repository root, adapting solution/project paths without weakening settings:

```sh
dotnet restore
dotnet build --no-restore
dotnet test --no-build
```

- Use a supported .NET SDK compatible with the repository target framework.
- Nullable diagnostics, .NET analyzers, code-style build diagnostics, and all other warnings are treated as errors.
- The build must be deterministic. CI sets `ContinuousIntegrationBuild=true` through `Directory.Build.props` when `CI=true`.
- Formatting/configuration/XML/Markdown validation must run for files changed by the pull request.

## Test gate

- **Unit:** cover business rules, boundary values, invalid state, and deterministic error behavior without external infrastructure.
- **Integration:** cover real database/file/network/queue adapters or the closest hermetic substitute, dependency-injection wiring, serialization, cancellation, transactions, and failure translation.
- **Contract:** cover independently deployed, independently versioned, or externally owned interfaces in both provider and consumer pipelines where possible.
- **Architecture:** mechanically reject forbidden project/namespace dependencies and undeclared module coupling where such boundaries exist.

Every defect fix needs a failing regression test before the fix when practical. If automation is impossible, record why, the manual evidence, its owner, and a follow-up issue. Quarantining, skipping, or repeatedly rerunning a flaky test does not satisfy the gate.

## Cross-cutting review gate

For every change, record `not affected` or concrete evidence for each topic:

- **Security:** trust boundaries, authentication/authorization, input handling, dependency/supply-chain impact, secrets, and abuse cases.
- **Privacy:** personal data collected, purpose, minimization, access, logging, retention, deletion, and residency.
- **Observability:** structured events, metrics/traces, correlation, health signals, alert owner, and sensitive-data redaction.
- **Backward compatibility:** source, binary, API, event, configuration, and persisted-data compatibility; versioning/deprecation plan.
- **Migration:** forward/backward compatible sequencing, data backfill, mixed-version operation, verification, and ownership.
- **Rollback:** reversal trigger, executable steps, safe data behavior, maximum recovery time, and fallback when rollback is impossible.

## Release gate

A change cannot merge when a required check fails, is skipped without an approved exception, or lacks evidence. Exceptions must identify scope, risk, compensating control, approver, owner, and expiry date. Never lower a repository-wide rule to obtain a passing result.

See the [pull request checklist](pull-request-checklist.md), [coding standards](coding-standards.md), and [architecture guide](architecture.md).
