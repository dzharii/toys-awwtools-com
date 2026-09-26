# Enterprise C# engineering instructions

These instructions apply to this directory and its descendants. Follow the repository-level instructions as well; the more specific rule wins when rules differ.

## Required workflow

1. Read the affected code, tests, and relevant guidance in `docs/engineering/` before editing.
2. Make the smallest change that satisfies the requirement and preserves domain boundaries and dependency direction.
3. Add or update tests in proportion to the change's failure risk. Do not claim a check passed unless it was run.
4. Run `dotnet restore`, `dotnet build --no-restore`, and the relevant `dotnet test --no-build` commands when the repository contains executable application/test projects. Record commands and results in the pull request.
5. Complete `docs/engineering/pull-request-checklist.md`, including security, privacy, observability, compatibility, migration, and rollback review.

## Build and language policy

- Target a currently supported .NET release. Do not retarget a project or change its language version as part of unrelated work.
- Keep nullable reference types and .NET analyzers enabled. New or changed code must build without warnings; warnings are errors.
- Builds must be deterministic. Shared defaults live in `Directory.Build.props`; code-style rules live in `.editorconfig`.
- Follow the [coding standards](docs/engineering/coding-standards.md) and Microsoft's linked C# and .NET guidance. If guidance conflicts, repository rules are authoritative for this repository.

## Architecture and implementation

- Prefer a single deployable application with explicit modules. Add layers, abstractions, projects, processes, or services only for a demonstrated boundary or operational need.
- Domain code must not depend on presentation, persistence, transport, or vendor-specific infrastructure. Dependencies point toward the domain; integration details implement interfaces owned by the consuming core boundary.
- Do not introduce a repository, mediator, factory, wrapper, or other abstraction without at least two real implementations, a volatile external boundary, or a measurable testing/design benefit documented in the change.
- Do not split a capability into a microservice without independent ownership/deployment/scaling needs and an approved plan for contracts, failure handling, observability, data ownership, migration, and rollback.
- See the [architecture guide](docs/engineering/architecture.md) for allowed dependency direction and decision criteria.

## Reliability and operations

- Accept and propagate `CancellationToken` through every cancellable asynchronous call. Never replace a caller token with `CancellationToken.None`, except during a deliberately bounded cleanup operation that is documented in code.
- Use `async`/`await` end to end. Avoid `.Result`, `.Wait()`, `async void` (except event handlers), fire-and-forget tasks, and unnecessary `Task.Run` around I/O.
- Use structured logging with stable message templates and named properties. Never log credentials, tokens, secrets, or unnecessary personal data.
- Represent expected failures explicitly with a documented result/error type or a specific exception at the boundary. Never swallow exceptions. Preserve the original exception when adding context.
- Every retry must be bounded, use cancellation, apply backoff with jitter, and be restricted to documented transient and idempotent operations. Emit attempt and terminal-outcome telemetry without sensitive payloads.

## Tests and quality gates

- Unit-test domain rules and edge cases without infrastructure. Use integration tests for databases, files, queues, networks, dependency injection, serialization, and framework wiring.
- Add contract tests at independently versioned or externally owned interfaces. Add architecture tests when a dependency rule can regress and is mechanically enforceable.
- A defect fix requires a regression test unless the behavior cannot be tested automatically; document that exception and the alternative check.
- Apply the risk-based matrix and release gates in [quality gates](docs/engineering/quality-gates.md). Flaky tests are failures to fix, not failures to ignore or rerun until green.

## Research and policy sources

- Use Microsoft documentation and .NET design guidance as primary references; relevant links are maintained in the engineering documents.
- GitHub .NET best-practices skill themes may identify topics worth investigating, but they are research pointers only. Do not copy them into policy or treat them as authority without validating each rule against project needs and primary documentation.

## Prohibited shortcuts

- Do not invent abstractions for hypothetical reuse or create premature microservices.
- Do not swallow exceptions, hide failures behind default values, or add unbounded retries.
- Do not weaken analyzers, nullable checks, warning levels, tests, or quality gates to make a change pass. A narrowly scoped suppression requires a justification comment and review.
- Do not introduce application code in policy-only changes.
