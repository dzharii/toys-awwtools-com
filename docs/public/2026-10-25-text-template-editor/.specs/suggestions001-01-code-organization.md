File: `.specs/suggestions001-01-url-code-quality.md`

# Guided Document Editor — Code Quality and Lightweight Domain-Driven Design

Created: 2026-10-25\
Specification: suggestions001-01\
Status: Advisory appendix — coding preferences and implementation guidance\
Applies to: TypeScript application code, Web Components, template engine, background workers, persistence, settings, tests, and technical documentation.

Related specifications:

- `suggestions001-01-url-main-specification.md`
- `suggestions001-01-url-language.md`
- `suggestions001-01-url-architecture.md`
- `suggestions001-01-url-storage.md`
- `suggestions001-01-url-ui-ux.md`
- `suggestions001-01-url-development.md`

## Q00. Purpose and interpretation

This document describes how we would like the application's code to be written.

The primary objective is to make the implementation easy for a developer to understand, navigate, debug, and modify without first reconstructing the original author's reasoning.

Prefer code that communicates the problem being solved.

A developer should be able to read a function and understand:

- What domain problem it addresses.
- Which conditions matter.
- Why those conditions matter.
- How it contributes to the surrounding feature.
- Which non-obvious constraints must remain true.

Well-chosen names, appropriate function boundaries, and explanatory comments should work together to communicate this information.

### Guidance, not a rigid style contract

The recommendations in this appendix are intentionally soft.

| Category                          | Interpretation                                                                   |
| --------------------------------- | -------------------------------------------------------------------------------- |
| Product specification requirement | Implement the behavior defined in the main specifications.                       |
| Correctness or safety requirement | Preserve correctness, user data, and stated invariants.                          |
| Coding preference                 | Follow when it improves clarity without introducing disproportionate complexity. |
| Illustrative example              | Demonstrates intent; copying its exact structure is unnecessary.                 |

The implementing agent may choose a different implementation when it is simpler, equally understandable, or better suited to the specific code.

Do not reject otherwise correct code solely because a function is longer than preferred, a helper was not extracted, or a comment has a different format.

Use professional engineering judgment rather than mechanically enforcing stylistic rules.

The existing requirement to maintain accurate development documentation remains in effect. This appendix recommends how to write that documentation effectively.

## Q01. Architectural approach: lightweight DDD

Use lightweight Domain-Driven Design, expressed primarily through domain vocabulary, feature boundaries, and explicit business rules.

DDD is useful here because the application contains several related but distinct concepts: templates, template versions, documents, placeholder answers, working drafts, template-authoring drafts, and generated results.

Without clear distinctions, these concepts can easily become interchangeable in code.

We do not need a comprehensive implementation of traditional tactical DDD patterns.

### Adopt

| Technique                          | Application                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------------- |
| Ubiquitous language                | Use the terminology established in the specifications consistently.             |
| Bounded-context thinking           | Assign related behavior to modules with clear ownership.                        |
| Feature-oriented organization      | Keep relevant UI, domain, worker, and persistence code near its owning feature. |
| Explicit invariants                | Express meaningful business rules through named functions and tests.            |
| Domain services where useful       | Group operations that do not naturally belong to a single data structure.       |
| Repository boundaries where useful | Separate domain behavior from Dexie and other storage mechanisms.               |

### Do not introduce automatically

| Pattern                                                                     | Why it is unnecessary by default                   |
| --------------------------------------------------------------------------- | -------------------------------------------------- |
| Aggregate roots for every model                                             | Many models are simple data structures.            |
| Value-object classes for every primitive                                    | TypeScript types may be sufficient.                |
| Domain events for every state update                                        | Local callbacks or direct calls are often simpler. |
| Separate application-service and domain-service classes for every operation | Can create delegation without useful separation.   |
| Repository interfaces for pure in-memory logic                              | No persistence boundary exists to justify them.    |
| Event sourcing                                                              | Historical revisions are explicitly outside scope. |
| Microservices                                                               | The application is a static website.               |
| Dependency injection framework                                              | Explicit construction and imports should suffice.  |

A small domain can be modeled with types, pure functions, and a handful of services.

Classes are optional. Use them when identity, lifecycle, encapsulation, or state management makes them appropriate.

The goal is to apply DDD's modeling discipline without importing unnecessary architectural machinery.

## Q02. Organize around meaningful feature boundaries

A feature boundary should correspond to a recognizable application capability.

For this application, examples include:

- Documents: independent document identity, answers, lifecycle, and saving.
- Templates: parsing, validation, rendering, and built-in loading.
- Template Authoring: editing and downloading reusable template definitions.
- Settings: effective configuration and synchronization.
- Export: serialization of completed results.

These are logical boundaries inside one application, not separate deployable services.

For example:

```
src/features/documents/
  model.ts
  meaningful-input.ts
  document-service.ts
  ui/
    document-workspace.ts
    placeholder-editor.ts
  worker/
    handler.ts
  storage/
    document-repository.ts
```

Do not require this structure for every small feature.

A simple copy-to-clipboard utility may need only one file.

A substantial feature with persistence, user interaction, and background processing benefits from keeping its related code together.

### Prefer a change-oriented structure

If a developer changes document autosave behavior, they should mostly work within the Documents feature and its explicit storage dependencies.

They should not have to search through unrelated folders containing every application controller, every service, every model, and every database operation.

The guiding preference is:

Keep code that changes together close together, while keeping separate domain responsibilities distinguishable.

### Context boundaries are not merely folders

A directory is not automatically a bounded context.

A meaningful boundary also defines what concepts it owns and how other features interact with them.

For example:

```
Documents
  owns: answers and saved document identity

Templates
  owns: parsing and rendering rules

Template Authoring
  owns: editable source definitions
```

Template Authoring may use the Templates parser for validation. It should not create a second independent parser.

Documents may use the Templates renderer. The Templates feature should not directly manage document persistence.

Shared platform capabilities such as logging, worker messaging, or database initialization are infrastructure, not automatically domain contexts.

## Q03. Use the project's domain vocabulary in code

Names should use terms established by the product specification.

Prefer:

```
document
templateVersion
placeholderAnswer
workingDraft
generatedResult
authoringDraft
```

Avoid using unrelated generic terms when the domain already has a precise concept.

For example:

```
// Less informative
const data = await loadData(id);
const result = process(data);

// Domain-oriented
const document = await documentRepository.get(documentId);
const generatedResult = renderDocument(document);
```

The second example explains what information is loaded and what outcome is produced.

### Naming guidelines

| Code element     | Preference                             | Example                              |
| ---------------- | -------------------------------------- | ------------------------------------ |
| Boolean          | State a meaningful predicate           | `hasMeaningfulUserInput`             |
| Action           | Verb describing an operation           | `saveWorkingDocument`                |
| Query            | Describe information returned          | `findUnresolvedRequiredPlaceholders` |
| Transformation   | Describe input-to-output intent        | `renderTemplateVersion`              |
| Domain type      | Use recognized domain noun             | `DocumentRecord`                     |
| Technical helper | Use conventional technical terminology | `clamp`, `normalizeLineEndings`      |
| Collection       | Use a descriptive plural               | `unresolvedPlaceholders`             |

Long names are acceptable when they clarify meaning, but verbosity is not inherently better.

For example:

```
hasMeaningfulUserInput(document)
```

is preferable to:

```
checkDocumentForPresenceOfAnyPotentiallyMeaningfulUserInput(document)
```

The first already expresses the relevant domain question.

### Avoid redundant context

Inside a Documents module:

```
saveDocument(document)
```

may be entirely clear.

There is no need for:

```
saveGuidedTemplateGeneratedDocumentToPersistentStorage(document)
```

The surrounding module already supplies much of that context.

Choose the shortest name that accurately communicates intent.

## Q04. Express business rules through named predicates

This is one of the most important preferences.

When an operation depends on a meaningful domain rule, consider expressing that rule through a descriptively named function.

Our application saves a new document only after meaningful user input.

A purely technical implementation might look like:

```
if (
  draft.title !== draft.suggestedTitle ||
  Object.values(draft.answers).some(
    value => value.trim().length > 0
  )
) {
  await saveDocument(draft);
}
```

The condition is understandable, but the reader must interpret its parts to infer the business rule.

Prefer:

```
if (hasMeaningfulUserInput(draft)) {
  await saveWorkingDocument(draft);
}
```

Now the calling code expresses a domain policy directly.

The underlying predicate might be:

```
interface NewDocumentDraft {
  title: string;
  suggestedTitle: string;
  answers: Readonly<Record<string, string>>;
}

/**
 * Distinguishes an authored document from an untouched template preview.
 *
 * Selecting a template, inspecting guidance, or navigating between versions
 * must not create a saved document. Only authored content or a changed title
 * makes a new document eligible for persistence.
 */
function hasMeaningfulUserInput(
  draft: NewDocumentDraft
): boolean {
  const hasCustomTitle =
    draft.title !== draft.suggestedTitle;

  const hasEnteredAnswer = Object.values(draft.answers)
    .some(value => value.trim().length > 0);

  return hasCustomTitle || hasEnteredAnswer;
}
```

This example illustrates the naming and documentation approach. The actual implementation should account for the final document model and any other explicitly defined meaningful inputs.

The predicate applies to deciding whether a new temporary document warrants persistence. Existing documents must not be deleted simply because their answers become empty.

### The important distinction

`hasMeaningfulUserInput` communicates the domain rule.

`hasCustomTitle` and `hasEnteredAnswer` communicate the smaller facts that implement it.

A developer can understand the top-level decision without immediately inspecting every detail.

If the rule changes, its implementation remains discoverable in one named location.

## Q05. Reduce cognitive load in conditions

Complex Boolean expressions are a frequent source of difficult-to-read code.

Consider the following example:

```
if (
  !document.isTemporary &&
  document.isDirty &&
  !document.saveInProgress &&
  storage.isAvailable &&
  (
    document.hasChanges ||
    document.hasPendingAnswers
  )
) {
  await persist(document);
}
```

Several conditions overlap or express related concepts.

The reader must mentally combine them before understanding the intention.

A clearer implementation might be:

```
const hasUnsavedDocumentChanges = document.isDirty;
const canWriteToSelectedStorage = storage.isAvailable;
const saveAlreadyInProgress = document.saveInProgress;

if (
  hasUnsavedDocumentChanges &&
  canWriteToSelectedStorage &&
  !saveAlreadyInProgress
) {
  await saveWorkingDocument(document);
}
```

If this decision is used in several locations or has significant domain meaning, extract it:

```
if (canStartDocumentAutosave(document, storage)) {
  await saveWorkingDocument(document);
}
```

Use whichever representation is clearest in context.

### Possible simplification techniques

| Problem                                           | Preferred technique                                  |
| ------------------------------------------------- | ---------------------------------------------------- |
| Complex Boolean expression                        | Introduce intention-revealing intermediate variables |
| Repeated domain condition                         | Extract a named predicate                            |
| Deeply nested exceptional cases                   | Consider guard clauses                               |
| Several related conditions with distinct outcomes | Consider a decision table or `switch`                |
| Repeated state-dependent behavior                 | Consider a discriminated union                       |
| Repeated long operation sequence                  | Extract a named operation                            |
| Complicated transformation                        | Separate named processing stages                     |
| Unclear parameter combinations                    | Consider an options object                           |
| Excessive helper indirection                      | Inline trivial helpers                               |

These are alternatives, not a sequence that must always be followed.

### Avoid replacing one complexity with another

The following is not automatically better:

```
if (
  isA(document) &&
  isB(document) &&
  isC(document) &&
  isD(document)
) {
  // ...
}
```

The helper names merely hide the conditions.

Use names that explain meaningful concepts:

```
if (
  hasUnsavedDocumentChanges(document) &&
  canPersistDocument(storage)
) {
  await saveWorkingDocument(document);
}
```

The best abstraction reduces the reader's reasoning burden.

## Q06. Use guard clauses when they clarify the main path

Nested conditions can make ordinary application logic difficult to follow.

For example:

```
async function autosaveDocument(
  document: WorkingDocument
): Promise<void> {
  if (document.isDirty) {
    if (!document.saveInProgress) {
      if (storage.isAvailable) {
        await repository.save(document);
      }
    }
  }
}
```

A flatter alternative:

```
async function autosaveDocument(
  document: WorkingDocument
): Promise<void> {
  if (!document.isDirty) return;
  if (document.saveInProgress) return;

  if (!storage.isAvailable) {
    reportStorageUnavailable(document.id);
    return;
  }

  await repository.save(document);
}
```

The normal operation is visible at the bottom, and exceptional conditions are handled first.

This is particularly helpful in worker handlers, validation routines, and document lifecycle operations.

However, do not split a straightforward two-branch decision into numerous guards merely to follow a pattern.

Where both branches represent equally important legitimate outcomes, an ordinary `if/else` can be clearer.

## Q07. Comments should explain reasoning, not narrate code

The primary purpose of comments is to help a future developer understand information that cannot be inferred easily from names, types, and the implementation.

Prefer comments that explain:

- Why a rule exists.
- Which user-facing problem it prevents.
- Why an unusual approach was selected.
- Which invariant must remain true.
- Which external limitation affects the implementation.
- How a non-obvious operation contributes to the larger design.

Avoid comments that simply translate code into English.

### Unhelpful comment

```
// Check whether the document is dirty.
if (document.isDirty) {
  // Save the document.
  await saveDocument(document);
}
```

Nothing important has been added.

### Useful comment

```
/**
 * Persists the current working state without creating historical revisions.
 *
 * Autosave updates a document in place because the application maintains
 * only one recoverable working state per document.
 */
async function saveWorkingDocument(
  document: WorkingDocument
): Promise<void> {
  // ...
}
```

The comment explains a deliberate product decision.

### Another useful example

```
// An older save must not mark newer edits as saved.
// The user may continue typing while IndexedDB is processing a write.
if (savedChangeId === currentChangeId) {
  markDocumentSaved();
}
```

The condition itself is understandable.

The comment explains why the comparison is necessary and what problem it prevents.

### Comment scope should match complexity

A small technical helper might need no comment:

```
function clamp(
  value: number,
  minimum: number,
  maximum: number
): number {
  return Math.min(maximum, Math.max(minimum, value));
}
```

A subtle persistence policy may deserve several sentences.

There is no required comment length, number of comments per file, or mandatory comment template.

The agent should use judgment.

The guiding question is:

What would a competent developer need to know here that the code does not already make clear?

If there is no useful additional information, do not add a comment.

## Q08. Document the problem and the approach when necessary

Some code implements a less obvious algorithm, workaround, or architectural decision.

In these situations, a comment may briefly describe both the problem and the selected approach.

For example:

```
/**
 * Prevents concurrent browser tabs from silently overwriting each other's
 * document changes.
 *
 * A save succeeds only if its expected revision matches the stored revision.
 * The check and update are performed in one IndexedDB transaction.
 *
 * On conflict, the caller keeps its unsaved working state and asks the user
 * how to proceed.
 */
async function saveDocumentWithRevisionCheck(
  document: DocumentRecord,
  expectedRevision: number
): Promise<SaveResult> {
  // ...
}
```

This comment provides useful context without explaining every line of database code.

It answers:

- Why the operation exists.
- Which technique is used.
- What guarantee the technique provides.
- What happens when the guarantee cannot be satisfied.

Do not require every function comment to follow this exact structure.

The author should provide only the information necessary for that particular code unit.

## Q09. Source-file documentation

Substantive source files should explain their role within the feature or application.

For example:

```
/**
 * Document autosave coordination.
 *
 * Keeps editor changes responsive while persisting the latest working state
 * asynchronously. The module schedules saves, coalesces pending changes,
 * and prevents stale save responses from clearing newer unsaved edits.
 *
 * Document persistence rules are defined in the storage specification.
 */
```

A file header should generally help the reader understand:

| Question                                 | Include when useful |
| ---------------------------------------- | ------------------- |
| Why does this file exist?                | Yes                 |
| Which feature owns it?                   | When not obvious    |
| What responsibility does it implement?   | Yes                 |
| What is its significant design approach? | When non-obvious    |
| What dependencies or constraints matter? | When relevant       |
| How is its public functionality used?    | When examples help  |
| What does every internal function do?    | No                  |

Do not maintain large headers that become obsolete whenever a minor implementation detail changes.

Keep documentation close to the code it explains.

For parser modules, include representative syntax examples. For message handlers, show a representative request. For reusable components, document important properties, events, and usage.

## Q10. Distinguish domain logic from infrastructure

Domain logic should not be unnecessarily coupled to browser APIs or the selected database library.

For example, the Templates feature should be able to validate a template without knowing anything about IndexedDB.

Prefer:

```
const validation = validateTemplateSource(source);
```

over a validator that also reads settings, updates UI elements, writes to storage, and emits worker messages.

Likewise, document eligibility for persistence should be testable without opening a database:

```
const shouldCreateDocument =
  hasMeaningfulUserInput(newDocumentDraft);
```

Persistence remains a separate operation.

A repository adapter may use Dexie internally, but its caller should work with document-oriented operations.

### Do not force unnecessary repositories

A pure parser needs no repository.

A logger formatter needs no domain service.

A simple clipboard wrapper may not need an interface.

Introduce boundaries when they isolate a meaningful dependency, improve testability, or protect domain logic from implementation-specific APIs.

Do not introduce boundaries merely because an architecture diagram contains them.

## Q11. Use TypeScript to express valid states clearly

Prefer types that communicate meaningful differences in application state.

For example:

```
type DocumentSaveStatus =
  | { kind: "temporary" }
  | { kind: "dirty" }
  | { kind: "saving" }
  | { kind: "saved"; savedAt: number }
  | { kind: "failed"; message: string };
```

This is often clearer than several related Boolean properties:

```
interface SaveStatus {
  isSaving: boolean;
  isSaved: boolean;
  isDirty: boolean;
  hasError: boolean;
}
```

The Boolean representation permits contradictory combinations such as `isSaving` and `isSaved` both being true.

The discriminated union expresses mutually exclusive states.

Other preferences:

- Prefer explicit types for public contracts and important domain structures.
- Use type inference when the type is already obvious.
- Use `unknown` for untrusted external values until they are validated.
- Avoid widespread `any` and unchecked assertions.
- Prefer immutable inputs for pure transformations.
- Use ordinary objects and functions when classes provide no benefit.
- Avoid broad generic abstractions that obscure the underlying domain.

These preferences do not prohibit valid TypeScript techniques. They encourage code that is easier to reason about.

### Validate at boundaries

TypeScript types do not guarantee that runtime data is valid.

Worker messages, persisted JSON, imported templates, and other external input should be validated before being treated as trusted domain objects.

Keep validation near the boundary where untrusted data enters.

The remainder of the feature can then operate on a narrower, well-defined type.

## Q12. Prefer explicit outcomes over hidden failure behavior

Functions should communicate errors and important alternate outcomes clearly.

For example:

```
type SaveResult =
  | { kind: "saved"; revision: number }
  | { kind: "conflict" }
  | { kind: "storage-unavailable" };
```

A caller can handle each outcome visibly:

```
switch (result.kind) {
  case "saved":
    markSaved(result.revision);
    break;

  case "conflict":
    showDocumentConflict();
    break;

  case "storage-unavailable":
    preserveUnsavedChanges();
    showStorageError();
    break;
}
```

This is one possible design, not a requirement to convert every thrown exception into a union.

Use exceptions for unexpected failures where appropriate.

Prefer explicit outcomes when failures are normal, anticipated parts of the domain workflow.

Do not hide errors behind empty return values or silently replace user documents with defaults.

## Q13. Keep background worker handlers thin

The background worker should route work to the feature that owns it.

For example:

```
const handlers = new Map([
  ["documents", documentHandler],
  ["templates", templateHandler]
]);
```

A Documents worker handler can delegate persistence to the appropriate document service or repository.

It should not reimplement the document's business rules.

For example, the decision about whether a temporary document contains meaningful user input belongs in the Documents domain, not in a general-purpose messaging router.

Prefer message names that describe domain operations:

```
documents.saveWorkingState
documents.load
documents.delete
templates.validateSource
```

Avoid vague operations such as:

```
process
execute
handleData
doAction
```

These naming conventions are especially useful because messages cross module and worker boundaries.

A developer examining a console log or request envelope should recognize the operation without tracing several layers of code.

## Q14. Tests should explain expected behavior

Tests are also a form of documentation.

Use names that communicate a scenario and expected outcome.

Prefer:

```
test(
  "does not persist a document when the user only selects a template",
  () => {
    // ...
  }
);
```

Over:

```
test("document test 3", () => {
  // ...
});
```

Other useful domain scenarios:

```
test(
  "editing a placeholder makes a temporary document eligible for saving",
  () => {
    // ...
  }
);

test(
  "switching template versions does not share placeholder answers",
  () => {
    // ...
  }
);

test(
  "an older save response does not clear newer unsaved changes",
  () => {
    // ...
  }
);

test(
  "copying remains unavailable while required placeholders are unresolved",
  () => {
    // ...
  }
);
```

For complex rules, prefer several clear cases over one test covering many unrelated conditions.

Decision tables can be useful for testing validation and lifecycle policies.

For example:

| Answer          | Required? | Resolved? |
| --------------- | --------- | --------- |
| Missing         | Yes       | No        |
| Empty string    | Yes       | No        |
| Whitespace only | Yes       | No        |
| `pasted JSON`   | Yes       | Yes       |
| Missing         | No        | Yes       |

Tests should exercise these documented cases.

Do not add tests that merely assert incidental internal structure without protecting meaningful behavior.

## Q15. Avoid unnecessary abstraction

An abstraction is valuable when it gives a concept a useful name or separates responsibilities that need to vary independently.

An abstraction is not automatically valuable because it reduces the number of lines in another file.

### Useful abstraction

```
hasMeaningfulUserInput(draft)
```

This captures a real application rule.

### Potentially unnecessary abstraction

```
class BooleanConditionEvaluationService {
  evaluateCondition(
    condition: () => boolean
  ): boolean {
    return condition();
  }
}
```

The class contributes no meaningful behavior.

Similarly, avoid creating:

```
DocumentController
  → DocumentApplicationService
    → DocumentDomainService
      → DocumentRepositoryFacade
        → DocumentRepositoryAdapter
```

when several layers merely forward the same operation.

A shorter call path with clear ownership is preferable.

### Prefer incremental design

Start with a straightforward implementation.

Extract an abstraction when:

- A domain concept becomes meaningful.
- A rule is repeated in multiple places.
- A dependency needs isolation.
- A function becomes difficult to understand.
- A separate testable responsibility emerges.

Do not build speculative infrastructure for anticipated future features.

## Q16. Avoid excessive fragmentation

Very small functions are not automatically more readable.

Consider:

```
function isEmpty(value: string): boolean {
  return value.length === 0;
}
```

If used once in an obvious context, this helper may add unnecessary indirection.

In contrast:

```
function isRequiredPlaceholderUnresolved(
  placeholder: PlaceholderDefinition,
  answer: string | undefined
): boolean {
  return placeholder.required &&
    (answer === undefined || answer.trim().length === 0);
}
```

This function represents a domain-specific validation rule and may be useful in multiple places.

Use function extraction to communicate intent, isolate behavior, or reduce complexity.

Do not pursue minimum function length as a goal.

Similarly, one cohesive 150-line module can be easier to maintain than ten tiny files requiring constant navigation.

The relevant measure is human comprehension, not file count.

## Q17. Keep comments current with code

Incorrect comments are worse than missing comments because they mislead future developers.

When an implementation changes, inspect the comments and documentation associated with the changed behavior.

If a function is renamed because its responsibility changed, update the surrounding explanation.

If a domain rule is removed, remove obsolete comments describing that rule.

Do not leave speculative comments suggesting an implementation is temporary unless there is a concrete known reason.

Avoid TODO comments without an identifiable problem or actionable next step.

For example:

```
// TODO: Make this better.
```

provides little value.

A more useful comment would be:

```
// TODO: Test whether rapid cross-tab settings changes can reorder notifications.
// Current behavior reloads the latest persisted settings after each message.
```

Such comments should remain exceptional.

The preferred outcome is accurate, concise documentation maintained with the related code change.

## Q18. Refactor for readability without changing behavior

When complex code is encountered, prefer small, controlled improvements.

A suitable refactoring sequence is:

1. Identify what the existing code guarantees.
2. Find the difficult-to-understand decision or responsibility.
3. Add or confirm tests for important behavior.
4. Introduce clearer names or separate logical steps.
5. Extract functions only where they improve comprehension.
6. Verify that behavior remains unchanged.
7. Update affected comments and documentation.

Avoid combining a major refactor with unrelated feature development unless the refactor is required for the feature.

When in doubt, prioritize correctness and the scope of the requested change over aesthetic cleanup.

## Q19. Code review and self-review guidance for the implementation agent

Before considering a substantial implementation complete, review it from the perspective of a future maintainer.

Ask:

| Question                                                                          | Desired result |
| --------------------------------------------------------------------------------- | -------------- |
| Can I identify the domain problem from the main function names?                   | Yes            |
| Does each important feature have a recognizable owner?                            | Yes            |
| Are complex decisions understandable without mentally expanding many expressions? | Usually        |
| Do comments explain useful reasoning rather than narrate obvious operations?      | Yes            |
| Are important invariants documented and tested?                                   | Yes            |
| Are worker, storage, and UI concerns separated where it matters?                  | Yes            |
| Did I introduce an abstraction without a concrete purpose?                        | Preferably not |
| Are errors explicit and meaningful?                                               | Yes            |
| Are documentation and implementation consistent?                                  | Yes            |
| Can another developer change this behavior without exploring unrelated features?  | Preferably     |

These are review prompts, not a numerical quality score or an automated rejection checklist.

An agent should not repeatedly rewrite working code merely to satisfy a subjective preference.

## Q20. How to resolve tradeoffs

When these preferences conflict, use the following priority order.

| Priority | Concern                                                       |
| -------- | ------------------------------------------------------------- |
| 1        | Correct implementation of the accepted product specifications |
| 2        | User data integrity, security, and recoverable error handling |
| 3        | Simplicity and reliable behavior                              |
| 4        | Clear domain ownership and meaningful names                   |
| 5        | Useful documentation and maintainability                      |
| 6        | Consistent style and formatting preferences                   |

A simple implementation that is correct, tested, and easy to understand is preferable to a more elaborate design that follows additional architectural patterns without delivering a practical benefit.

Code quality is not measured by the number of interfaces, classes, comments, or architectural layers.

Its purpose is to reduce the effort required to understand and safely change the program.

## Q21. Practical instructions to the AI implementer

Use this appendix as an expression of the project's engineering preferences.

During implementation:

Think in domain concepts first. Identify what user-facing rule or capability the code is implementing before choosing function and type names.

Choose intention-revealing names. Prefer names that state the relevant business question or action.

Reduce unnecessary mental work. Break apart difficult expressions, nested conditions, and long operations when doing so makes their meaning clearer.

Document the reasoning. Add comments when the reader needs to understand why an approach or constraint exists. Do not comment mechanically.

Use judgment about comment depth. A straightforward helper may need no comment. A non-obvious concurrency rule may deserve a careful explanation and example.

Keep features cohesive. Group related behavior together while maintaining clear contracts at meaningful boundaries.

Avoid architecture for its own sake. Use DDD concepts selectively. Do not introduce classes, repositories, services, events, or interfaces solely to conform to a pattern.

Prefer tested behavior over stylistic perfection. Preserve the application's documented behavior and user data before pursuing code cleanup.

Keep documentation accurate. Update the documentation that explains the behavior being modified.

Most importantly, these preferences should guide decisions, not prevent progress.

The implementing agent is expected to exercise its own engineering judgment and may depart from an example when another approach is demonstrably clearer or more appropriate.

## Q22. Research and implementation references

The following sources informed the guidance in this appendix. The recommendations above are adapted to this project's specific constraints; they are not presented as verbatim rules from these publications.

### Domain-driven design

Martin Fowler — [Bounded Context](https://martinfowler.com/bliki/BoundedContext.html?utm_source=chatgpt.com)

Explains why larger domains benefit from explicitly separated models and consistent vocabulary within each context.

Martin Fowler — [Domain Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html?utm_source=chatgpt.com)

Describes domain modeling as a way to organize software around the actual processes and rules being represented.

Microsoft — [Use Domain Analysis to Model Microservices](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/domain-analysis?utm_source=chatgpt.com)

Provides additional explanation of strategic DDD, domain language, and context boundaries. The microservice recommendations are background reference material, not a reason to introduce microservices into this application.

### Feature-oriented architecture

Jimmy Bogard — [Vertical Slice Architecture](https://www.jimmybogard.com/vertical-slice-architecture/?utm_source=chatgpt.com)

Advocates organizing implementation around related capabilities and minimizing unnecessary shared abstractions.

This supports the project's feature-oriented structure, though our features are broader than individual request handlers.

### Cognitive complexity and refactoring

Martin Fowler — [Refactoring: Improving the Design of Existing Code](https://martinfowler.com/books/refactoring.html?utm_source=chatgpt.com)

Discusses systematic, behavior-preserving improvements to code structure.

Martin Fowler — [Replace Nested Conditional with Guard Clauses](https://refactoring.com/catalog/replaceNestedConditionalWithGuardClauses.html?utm_source=chatgpt.com)

Illustrates how exceptional cases can be separated from a function's main execution path.

SonarSource — [Cognitive Complexity](https://www.sonarsource.com/resources/cognitive-complexity/?utm_source=chatgpt.com)

Discusses cognitive complexity as a way to reason about how difficult code may be to understand. This application does not impose a mandatory cognitive-complexity score.

### Naming and documentation

Google — [Documentation Best Practices](https://google.github.io/styleguide/docguide/best_practices.html?utm_source=chatgpt.com)

Recommends meaningful names, useful explanations, minimal documentation, and keeping documentation synchronized with code.

Google — [TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html?utm_source=chatgpt.com)

Provides guidance on types, names, documentation, comments, and maintainable TypeScript.

Google — [What to Look for in a Code Review](https://google.github.io/eng-practices/review/reviewer/looking-for.html?utm_source=chatgpt.com)

Emphasizes simplicity, understandable names, useful comments, appropriate testing, and avoiding unnecessary complexity.

### Project-specific source references

The supplied `gtl-ui-architecture-reference-kit.zip` remains a source of implementation examples.

Of particular interest:

```
reference/browser-extension-src/src/background/tab_trail_service.ts

reference/browser-extension-src/src/content/runtime_messaging.ts

reference/browser-extension-src/src/settings/settings_runtime.ts

reference/browser-extension-src/src/background/service_worker.ts
```

Inspect these to understand the original project's conventions for modular services, message contracts, settings, and data access.

Prefer adapting those patterns into the new feature-oriented architecture rather than reproducing the original extension's full complexity.

## Q23. Final principle

Write code that communicates its purpose through domain language, reveals its important decisions without unnecessary mental effort, and documents the reasoning that the implementation alone cannot explain.

Use these principles flexibly.

The objective is understandable and maintainable software—not perfect adherence to a coding style.