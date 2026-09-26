# Architecture guide

## Goal

Use the least complex architecture that protects business rules, makes failures visible, and permits safe change. A regular business application should start as one deployable application with explicit modules, not as distributed services.

## Dependency direction

Dependencies point inward:

```text
Presentation / transport  ->  Application  ->  Domain
Infrastructure            ->  Application  ->  Domain
```

- **Domain** contains business concepts, invariants, and domain behavior. It has no dependency on HTTP, UI, databases, queues, file systems, dependency-injection containers, or vendor SDKs.
- **Application** coordinates use cases and transaction boundaries. It depends on domain types and defines the ports it needs from external systems.
- **Infrastructure** implements application-owned ports for persistence, messaging, clocks, identity providers, and other external systems.
- **Presentation/transport** translates an external protocol into application requests and translates outcomes back into that protocol. It does not contain business rules.

Do not require one project per layer. Folders/namespaces are enough while the compiler-enforced boundary would add more cost than protection. Split projects when independent reuse, dependency isolation, or an architecture test provides a demonstrated benefit.

## Boundary rules

1. Put each business invariant in one authoritative domain location.
2. Keep transport models and persistence models at their boundaries; map them explicitly to domain/application types.
3. Define an interface at the consuming boundary, not beside its current implementation.
4. Add an interface only for a volatile external boundary, multiple real implementations, or a measurable testing/design benefit.
5. Keep cross-module interaction explicit. Do not reach into another module's persistence internals.
6. Make transaction, idempotency, concurrency, timeout, and partial-failure behavior explicit at integration boundaries.

## Choosing architecture

Prefer an in-process call until an independently deployable service has all of the following:

- a cohesive business capability and clear data ownership;
- an identified owning team and independent release or scaling need;
- a versioned contract and compatibility policy;
- timeouts, bounded retries, idempotency, health signals, tracing, and alert ownership;
- a migration plan, rollback plan, and defined behavior during partial outage.

Document a significant or hard-to-reverse decision in an architecture decision record. Include context, chosen option, rejected alternatives, consequences, success measures, and reversal trigger. Do not create wrappers, repositories, mediators, factories, or services solely for hypothetical future reuse.

## Cross-cutting behavior

- Propagate the caller's cancellation token across every cancellable boundary.
- Use structured logs and traces at entry points and external calls. Correlate operations without recording secrets or unnecessary personal data.
- Return explicit expected outcomes; throw specific exceptions for exceptional failures. Translate errors once at the outer boundary.
- Retries are allowed only for documented transient failures and safe/idempotent operations. Bound attempts and elapsed time, use backoff with jitter, honor cancellation, and emit terminal failure telemetry.

## Mechanical enforcement

- Architecture tests must prevent domain references to infrastructure/presentation and prevent undeclared cross-module dependencies once multiple projects or modules make those rules meaningful.
- Integration tests must exercise each implemented external adapter's serialization, error translation, cancellation, and transaction behavior.
- Contract tests must cover independently versioned or externally owned interfaces.

## Primary references

- [Architectural principles](https://learn.microsoft.com/dotnet/architecture/modern-web-apps-azure/architectural-principles)
- [Common web application architectures](https://learn.microsoft.com/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures)
- [.NET application architecture guides](https://dotnet.microsoft.com/learn/dotnet/architecture-guides)
- [.NET design guidelines](https://learn.microsoft.com/dotnet/standard/design-guidelines/)

GitHub .NET best-practices skill material may be used to discover questions for review, but it is neither copied policy nor a normative source. Validate any proposed rule against these primary references and the needs of this application.

See also the [coding standards](coding-standards.md), [quality gates](quality-gates.md), and [pull request checklist](pull-request-checklist.md).
