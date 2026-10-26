# Working application brief and boundaries

This is **not** a frozen build specification. It condenses user intent and recommendations from the recent discussion without reintroducing the overgrown prior DSL.

## Product direction

A static, offline-capable (later) browser application for creating and editing text documents from helpful templates. Visually inspired by chat history, interactionally inspired by an unconstrained document editor. The user sees and edits the entire document rather than stepping through a series of questions. Placeholders are first-class editable nodes. Hints/examples appear in an unobtrusive panel. A rendered result lives in the same document and can be copied as text or formatted HTML.

## Accepted product constraints from the conversation

- A dark/black default look, with restrained atmospheric backgrounds and a readable center column.
- Vertical document navigation/history, with a New Document action at top.
- Fully visible, freely editable text with inline placeholder guidance.
- Stable contextual hints; selectable/copyable examples; do not cover current editing location.
- Answers can be entered out of order. Switching versions preserves values previously entered.
- Same-page result and rich/plain copy.
- Native Web Components; mainly Shadow DOM where it is suitable, with editor-specific caution.
- Strict, current TypeScript and Bun build; no npm-installed runtime dependencies.
- Vendored runtime libraries including Dexie from supplied extension archive.
- Prefer vertical/domain-feature organization to a monolithic worker.
- Static website with a known template manifest and on-demand template loading.
- Persistence options for memory-only, browser localStorage, or Dexie/IndexedDB; settings should apply without a full reload.
- Document recovery/history as a separate concern from autosave (the earlier PowerShell failure is a motivating case).

## Distinguish user requirements from proposed implementation

| Domain/UX requirement | Proposed implementation (not yet fixed) |
| --- | --- |
| Editable placeholders in complete document | Structured document nodes, perhaps contenteditable with isolated placeholder nodes |
| Contextual stable guidance | Docked/right-side Web Component; pin and collapse affordances |
| Vertical history | Sidebar feature with documents store/subscriptions |
| Dynamic live values | Main-thread reactive document model |
| Local persistence | Worker-based IndexedDB via Dexie; main-thread localStorage fallback |
| Cross-feature processing | Static feature-worker handler registry with typed request envelopes |
| Settings apply immediately | Schema-driven settings service + subscriptions + worker message + optional BroadcastChannel |
| Bundled templates | `.gtl` files + generated manifest JSON fetched on demand |
| Plain and rich copy | Semantic export + `text/plain` and `text/html` clipboard data |
| History | Revision snapshots with separate undo/redo |

## Minimal template sketch

```text
TEMPLATE: Project description

VERSION: Input + processing + output
  TEXT:
    Takes {{$input}}, {{$processing}}, and produces {{$result}}.

VERSION: Problem + solution
  TEXT:
    Helps {{$audience}} {{$problem}} by {{$solution}}.

$input: What does the user provide?
  HINT: Name the data or information being supplied.
  EXAMPLE: pasted JSON

$processing: What happens to the input?
  EXAMPLE: checks it for syntax errors

$result: What is produced?
  EXAMPLE: a readable formatted version

$audience: Who is it for?
  EXAMPLE: developers

$problem: What are they trying to do?
  EXAMPLE: inspect messy JSON

$solution: How does the tool help?
  EXAMPLE: validating syntax and formatting the result
```

This is illustrative design syntax, not a committed grammar or compiled fixture.

## What should *not* grow back into this language without evidence

- Procedural `ASK` / `WHEN` / `ELSE` / `COMPOSE` / `FOR EACH` graph semantics.
- A global template registry/catalog dependency resolution language.
- Variable static types and expression evaluation.
- UI-specific commands such as `ALLOW EDIT`, `ALLOW RETRY`.
- Missing-variable policy scripting.

Those were explored in a prior specification, but the user explicitly reset the product approach to keep template creation ergonomic and declarative.

## Open questions for app specification

1. How do user edits to the document surrounding the placeholders survive a template version switch?
2. What is the precise distinction between **template definition**, **document instance**, and **edited rendered output**?
3. Can rich formatting be entered directly, or are rich styles only produced on export?
4. How do repeated placeholders behave when one occurrence is edited?
5. What does copying a document with unfilled placeholders produce? Is there a confirmation warning?
6. Should a template version switch create a history revision?
7. What are the persistence semantics when switching between memory, localStorage, and IndexedDB?
8. What should happen when a user has the same document open in multiple tabs?
9. Should the right guidance pane pin to a placeholder or pin to a document location?
10. Which background assets are licensed for reuse and which are only visual references?
11. Can a bundled template be changed in a later app release without altering existing documents?
12. What is the security model for imported templates and copied rich HTML?

Resolve these through a tiny working editor prototype and concrete scenarios; do not invent a general-purpose template programming language to anticipate them all.
