# C# coding standards

## Source of truth

`.editorconfig` is the mechanically enforced style source. `Directory.Build.props` supplies shared compiler/analyzer defaults. Do not duplicate or override those settings in individual projects without a documented repository-wide reason.

Follow Microsoft's [C# coding conventions](https://learn.microsoft.com/dotnet/csharp/fundamentals/coding-style/coding-conventions) and [.NET design guidelines](https://learn.microsoft.com/dotnet/standard/design-guidelines/) where this document and `.editorconfig` do not define a rule.

## Naming and layout

- Use PascalCase for types, methods, properties, events, namespaces, and public constants; prefix interfaces with `I`.
- Use camelCase for parameters, local variables, and private fields. Do not add a private-field prefix.
- Use names that express domain meaning. Avoid unexplained abbreviations, type-encoded names, and generic names such as `Manager`, `Helper`, or `Util`.
- Keep one primary type per file and name the file for that type. Small private nested types are exceptions.
- Keep using directives outside namespaces, place `System` directives first, and separate directive groups.
- Use braces for control-flow statements. Prefer readable code over compact cleverness.

## Nullable references and validation

- Nullable reference types remain enabled. Model absence with `T?`; do not use `null!` or disable nullable diagnostics to bypass analysis.
- Validate untrusted input at the system boundary. Enforce business invariants in domain code even when a presentation layer also validates them.
- Use `ArgumentNullException.ThrowIfNull` for public/protected API arguments when null is not allowed. Do not repeat checks already guaranteed by a trusted internal contract.

## Asynchronous and cancellation behavior

- Name asynchronous methods with an `Async` suffix unless implementing an established interface whose name cannot change.
- Accept `CancellationToken` as the last parameter and propagate it to every cancellable downstream operation.
- Use `Task`/`Task<T>` for asynchronous APIs; use `ValueTask` only after measurement shows a material allocation benefit and its consumption constraints are acceptable.
- Never block on asynchronous work with `.Result`, `.Wait()`, or `GetAwaiter().GetResult()` in application code. Avoid `async void` except event handlers.
- Do not discard a task. If process-lifetime background work is required, own it through a hosted lifecycle, observe failures, and define shutdown behavior.
- Do not wrap naturally asynchronous I/O in `Task.Run`. Use `ConfigureAwait(false)` only where a library's context policy requires it; be consistent within that library.

Microsoft reference: [Asynchronous programming scenarios](https://learn.microsoft.com/dotnet/csharp/asynchronous-programming/async-scenarios).

## Failures and retries

- Use return/result types for expected business outcomes. Throw a specific exception for exceptional conditions; do not use exceptions for routine control flow.
- Catch an exception only to recover, translate it at a boundary, or add useful context. Use `throw;` to preserve its stack trace. Never use an empty catch or return a fabricated success/default value.
- Include actionable context in errors without secrets or unnecessary personal data. Preserve the original exception as `InnerException` when translating.
- A retry policy must name the transient conditions it handles, verify idempotency, honor cancellation, cap attempts and total duration, use exponential backoff with jitter, and log the terminal outcome. Do not nest retries at multiple layers.

## Structured logging and data handling

- Use `ILogger<T>` and stable message templates: `logger.LogInformation("Processed order {OrderId}", orderId)`. Do not use string interpolation for structured log fields.
- Use event severity consistently: `Debug` for diagnostic detail, `Information` for normal milestones, `Warning` for recoverable abnormal conditions, and `Error` for failed operations requiring attention.
- Log once at the boundary that owns the failure response. Avoid logging and rethrowing at every layer.
- Never log passwords, access tokens, connection strings, cryptographic material, or full sensitive payloads. Minimize, classify, redact, and apply retention requirements to personal data.

Microsoft reference: [.NET logging guidance](https://learn.microsoft.com/dotnet/core/extensions/logging).

## Collections, time, and disposal

- Expose the narrowest collection contract needed. Do not return a mutable internal collection.
- Use `DateTimeOffset` for an instant in time and inject a time provider when behavior depends on the current time.
- Dispose owned `IDisposable`/`IAsyncDisposable` values deterministically. Do not dispose dependencies whose lifetime is owned by dependency injection.
- Use culture-explicit parsing and formatting for persisted or machine-readable values.

## Suppressions and generated code

- Fix analyzer findings. A suppression must be limited to the smallest scope and include a justification that explains why the rule is inapplicable.
- Do not hand-edit generated output. Generated files must be reproducible from checked-in inputs and tools.

See the [architecture guide](architecture.md), [quality gates](quality-gates.md), and [pull request checklist](pull-request-checklist.md).
