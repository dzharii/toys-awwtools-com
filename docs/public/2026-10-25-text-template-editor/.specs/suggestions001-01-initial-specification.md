The following six specifications are organized under `.specs/`, as requested. Every filename begins with `suggestions001-01`, and every document includes its creation date.

These are the proposed file contents, displayed directly in the chat. No files are being created or downloaded.

The specifications incorporate our completed requirements workshop. Where earlier reference materials conflict with our later decisions, the later decisions take precedence.

# File 1: `.specs/suggestions001-01-url-main-specification.md`

# Guided Document Editor — Main Application Specification

Created: 2026-10-25\
Specification: suggestions001-01\
Status: Proposed implementation specification\
Application type: Static browser application\
Primary technologies: TypeScript, Bun, HTML, CSS, Web Components

## A00. Purpose

Build a browser application for creating short documents and reusable text from guided templates.

The application displays the complete template text, with editable placeholders embedded in the sentence or document. Users fill those placeholders in any order, receive contextual hints and examples, and immediately see the generated result.

The experience should resemble a capable, lightweight notepad combined with a document history interface.

It is not a conversational AI application, a conventional form wizard, or a general-purpose rich-text editor.

The primary interaction is:

1. Create a document.
2. Choose a template and, where applicable, a writing style.
3. See the complete text immediately.
4. Select placeholders and enter answers.
5. Review the generated result.
6. Copy or export the completed text.
7. Reopen saved documents later.

There is no chat composer, conversation engine, or sequential question-answer workflow.

The visual organization draws inspiration from the supplied SovietRDTL chat application. The TypeScript, settings, persistence, vendoring, and component architecture draw inspiration from the supplied browser-extension source archive.

The application must remain simpler than either reference project.

## A01. Terminology

Use the following terms consistently in implementation, documentation, and UI text.

| Term                     | Definition                                                                                                 |
| ------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Template                 | A reusable source definition containing fixed text, placeholders, and guidance.                            |
| Template version         | A selectable text variation declared within a template, such as Purpose + function.                        |
| Document                 | An independent instance created using a particular template version, with its own answers and saved state. |
| Placeholder              | A named location within a template that accepts a user-provided value.                                     |
| Answer                   | The value associated with a placeholder in one document.                                                   |
| Working draft            | The latest modified, potentially persisted state of a document.                                            |
| Temporary document       | An opened document that has not received meaningful user input and has not been persisted.                 |
| Template-authoring draft | An editable source definition stored locally until the author downloads its source file.                   |
| Generated result         | Read-only text produced by substituting the document's answers into the template.                          |
| Document history         | The sidebar collection of saved documents, not a history of revisions.                                     |

A template version is not a historical revision of a document.

Different template versions produce independent documents and do not share answers.

## A02. Main application layout

The default desktop interface has three functional areas.

| Region            | Responsibility                                                                           |
| ----------------- | ---------------------------------------------------------------------------------------- |
| Left sidebar      | Document history, New Document, Template Authoring, Settings.                            |
| Central workspace | Template selection, guided text, placeholder editing context, generated result, copying. |
| Right sidebar     | Active-placeholder guidance and unresolved validation or persistence errors.             |

The central workspace is the main reading surface. It should resemble a document presented within a modern dark-themed chat interface, without speech bubbles, speaker roles, or a message composer.

A narrow, readable content column is preferred over a full-width form.

The interface supports scrolling through the document. Guidance stays accessible without covering the text currently being edited.

The left sidebar behaves like vertical document tabs: selecting an item restores its document.

On smaller screens, navigation and guidance adapt to the available space.

See `.specs/suggestions001-01-url-ui-ux.md`.

## A03. Creating a document

The primary action is New Document.

Opening it displays the template selection interface within the central workspace.

For example, the built-in Project Description template offers:

| Writing style               | Pattern                                                                  |
| --------------------------- | ------------------------------------------------------------------------ |
| Purpose + function          | A [tool] that [action] to [benefit].                                     |
| Problem + solution          | Helps [audience] [problem] by [solution].                                |
| Input + processing + output | Takes [input], [processing], and produces [result].                      |
| Features + technology       | A [tool] built with [technology], featuring [feature 1] and [feature 2]. |
| Structured project profile  | A [tool] for [audience], providing [workflow] through [detail].          |

Choosing a style immediately displays its complete text.

A selection alone does not create a persistent document.

The user can inspect different styles, read their hints, and leave without creating anything in storage.

A document becomes save-worthy when the user enters or meaningfully modifies content. An explicit user-authored document title also counts as meaningful input.

## A04. Guided editing

The generated document's fixed prose cannot be edited in the document workspace.

Suppose the selected template contains:

```
Takes {{$input}}, {{$processing}}, and produces {{$result}}.
```

Initially, the user sees:

```
Takes [input], [processing], and produces [result].
```

The placeholder locations are visually distinguishable.

Selecting `$input` opens contextual guidance:

```
What does the user provide?

Hint:
Describe the original data or information.

Example:
pasted JSON
```

The user types:

```
pasted JSON
```

The document immediately becomes:

```
Takes pasted JSON, [processing], and produces [result].
```

The user may fill `$result` before `$processing`. There is no enforced question order.

After all fields are completed:

```
Takes pasted JSON, checks it for syntax errors,
and produces a readable formatted version.
```

Only placeholder values are editable.

To change fixed wording, placeholder names, or questions, the user must enter the separate Template Authoring workspace.

Placeholder guidance is optional metadata. A placeholder without a declared question remains editable using an automatically generated label.

## A05. Required and optional placeholders

Placeholders are required by default.

A template author can explicitly mark a field optional:

```
$notes OPTIONAL: Additional notes?
```

The document may display an incomplete generated result, but copying or exporting is disabled while any required placeholder remains unresolved.

Required-field errors appear near their placeholder and in the unresolved-issues panel.

Optional empty placeholders render as empty text. The renderer does not automatically rewrite nearby words or punctuation.

A template author must write text that remains appropriate when optional values are absent.

A required answer containing only whitespace is treated as unresolved.

## A06. Template versions and document independence

Template versions are alternative writing structures, not revisions of the same document.

Consider:

```
VERSION: Input + processing + output
  TEXT:
    Takes {{$input}}, {{$processing}}, and produces {{$result}}.

VERSION: Purpose + function
  TEXT:
    A {{$tool}} that {{$action}} to {{$benefit}}.
```

The user completes the first version.

They then choose Purpose + function.

The new version starts with empty answers. It does not inherit values from the previous document, even if the two versions happen to use the same placeholder names.

If modified, it becomes a separately saved document.

The sidebar might contain:

```
Documents

  2026-10-25 14:05 — Input + processing + output
  2026-10-25 14:18 — Purpose + function
```

Switching back restores the first document's original answers.

If the user revisits a version already created through that document's version-selection flow, restore its associated document rather than silently create a duplicate.

Independently choosing New Document creates a new instance, even when using the same template version.

The implementation may retain a lightweight relationship between related documents to support version switching. This relationship must never cause answers to be shared.

## A07. Temporary documents and working drafts

A newly opened, untouched template is temporary.

The user may:

- Select a template.
- Switch between styles.
- Focus placeholders.
- Read guidance.
- Preview the resulting text.

None of these actions alone creates a persisted document.

Entering an answer creates a modified working state.

Persistence happens automatically, using the configured autosave behavior.

If the user enters text and then removes it, returning the document to its original untouched state, the application should avoid retaining an empty document.

Each document has only one current working draft.

There is no revision history, historical snapshot browser, or manual Save Draft Copy workflow.

The application must never create unlimited duplicate drafts from ordinary typing.

## A08. Autosave

The default autosave interval is 60 seconds.

Users may change it in Settings.

Changes are reflected immediately in the interface, whether or not they have been persisted.

The application attempts to save outstanding changes when:

| Event                           | Behavior                                                    |
| ------------------------------- | ----------------------------------------------------------- |
| Autosave interval elapsed       | Save dirty documents.                                       |
| User changes documents          | Save pending changes from the previous document.            |
| User switches template versions | Save pending changes from the previous version's document.  |
| Application becomes hidden      | Attempt to flush pending changes.                           |
| Save fails                      | Preserve in-memory content and display a recoverable error. |

An application close or crash may interrupt asynchronous storage operations. The UI must not promise that every last keystroke is crash-proof.

The save-state indicator distinguishes `Unsaved changes`, `Saving…`, `Saved`, and `Save failed`.

See `.specs/suggestions001-01-url-storage.md`.

## A09. Result and copying

The generated result appears below the guided editing area, within the same central document.

The result is read-only and updates immediately.

The application supports:

| Operation       | Behavior                                                    |
| --------------- | ----------------------------------------------------------- |
| Copy text       | Copy the completed result as `text/plain`.                  |
| Copy rich text  | Copy semantic HTML and plain-text representations together. |
| Export text     | Download `.txt`.                                            |
| Export Markdown | Download `.md`.                                             |
| Export HTML     | Download `.html` with semantic markup.                      |

Rich copying does not imply rich-text authoring. The user edits plain-text placeholder values.

The exported result must not contain placeholder controls, hint text, error decorations, background images, or other application UI.

If required placeholders are unresolved, copy and result-export actions are unavailable with a visible explanation.

Template-source downloading is separate and may proceed even when the template source contains errors.

## A10. Template Authoring

Template Authoring is a separate mini-application within the same website.

It allows users to:

1. Create a new template definition.
2. Open an existing bundled definition.
3. Edit source text, placeholders, questions, hints, examples, and versions.
4. Receive live syntax diagnostics.
5. Preview valid template behavior.
6. Autosave the unfinished source in IndexedDB.
7. Download the source as a `.gtl` file.

The exported file becomes part of the application's built-in template collection only when a developer adds or replaces it in the project and registers it in the template manifest.

Editing a built-in template in the browser does not directly change deployed project files.

Template-authoring drafts are independent from generated-document drafts.

Invalid template source may still be downloaded. Validation informs the author but never prevents source recovery.

See `.specs/suggestions001-01-url-language.md`.

## A11. Settings

Settings appear on a separate application page or workspace.

They are generated from a declarative settings schema, not implemented individually as unrelated forms.

The initial categories are:

| Category    | Settings                                                    |
| ----------- | ----------------------------------------------------------- |
| Appearance  | Background, theme options, visual density where supported.  |
| Editing     | Placeholder guidance visibility and keyboard behavior help. |
| Storage     | Storage mode and autosave interval.                         |
| Diagnostics | Console log verbosity and formatter.                        |

Each setting includes an identifier, title, description, default, validation rule, and appropriate UI control.

Changes take effect immediately and propagate to other open application tabs where supported.

The settings implementation should follow the source patterns in the browser-extension reference package.

## A12. Representative acceptance scenario

Scenario: Create and recover a project description

Given a new browser session with IndexedDB persistence enabled:

1. The user selects New Document.
2. They select Input + processing + output.
3. No saved history item is created yet.
4. They click `$processing`.
5. The guidance panel displays its question, hint, and example.
6. They enter `checks it for syntax errors`.
7. The document becomes modified and eligible for persistence.
8. They enter the remaining answers.
9. Autosave persists the current working state.
10. They close the application and reopen it.
11. The document appears in the history sidebar with its answers restored.
12. They select Purpose + function.
13. That version starts with empty answers.
14. They return to the original document.
15. Its previous answers are still present.
16. They copy its completed result.

Expected outcomes: no answers are shared between separate documents, no historical revision is created, no empty preview is persisted, and the copy operation contains only the generated text.

## A13. Explicit exclusions

The first implementation must not include:

- AI chat or conversation generation.
- A general-purpose rich-text editor.
- Free editing of fixed template prose in generated documents.
- Historical document revisions.
- Automatic answer sharing between documents.
- Complex conditional scripting or procedural template execution.
- Remote accounts, cloud synchronization, or server-side document storage.
- Remote telemetry.
- A marketplace for templates.
- Dynamic runtime installation of application feature plugins.

The architecture should allow sensible later extensions, but these excluded features must not be implemented speculatively.

## A14. Definition of complete

The application is ready for initial release when a user can create, edit, save, reopen, delete, copy, and export guided documents; author and download templates; configure settings; and recover gracefully from expected failures.

Each feature must have automated tests for its important behavior, meaningful errors, and technical documentation maintained during implementation.

The application must build using Bun and deploy as static files without a runtime npm dependency installation.

# File 2: `.specs/suggestions001-01-url-language.md`

# Guided Template Language — Syntax and Processing Specification

Created: 2026-10-25\
Specification: suggestions001-01\
Status: Proposed language contract\
Related: Main specification, architecture, UI/UX

## L00. Purpose and scope

The Guided Template Language (GTL) describes reusable text with named placeholders and optional guidance.

It is a document definition format, not a programming language.

A template author should be able to express common writing structures without learning flow control, variables with computed expressions, functions, or a questionnaire DSL.

The parser needs to understand only:

- Template and version names.
- Literal text.
- Named placeholders.
- Questions, hints, and examples.
- Required versus optional fields.
- Single-line, multiline, and simple constrained-choice input.

The application—not the template—decides how to display editors, navigate between fields, save drafts, and export results.

## L01. Basic template

```
TEMPLATE: Input + processing + output

TEXT:
  Takes {{$input}}, {{$processing}}, and produces {{$result}}.

$input: What does the user provide?
  HINT: Describe the original data or information.
  EXAMPLE: pasted JSON

$processing: What happens to the input?
  HINT: Describe the main operation.
  EXAMPLE: checks it for syntax errors

$result: What does the application produce?
  HINT: Describe the final output.
  EXAMPLE: a readable formatted version
```

The template contains literal text and three placeholders.

Each `{{$name}}` occurrence references a value provided by the user.

The corresponding `$name:` declaration describes that value.

If `$processing` is assigned `"checks it for syntax errors"`, every `{{$processing}}` occurrence within the same document displays that answer.

Answers never propagate into other documents.

## L02. File format and lexical conventions

Templates use UTF-8 text files with the `.gtl` extension.

| Element                  | Rule                                                               |
| ------------------------ | ------------------------------------------------------------------ |
| Directive names          | Case-sensitive uppercase keywords.                                 |
| Placeholder references   | `{{$name}}`                                                        |
| Placeholder declarations | `$name: Question`                                                  |
| Optional declarations    | `$name OPTIONAL: Question`                                         |
| Identifiers              | ASCII letter followed by letters, digits, underscores, or hyphens. |
| Identifier case          | Case-sensitive.                                                    |
| Line endings             | CRLF and LF accepted; normalized internally to LF.                 |
| Text content             | Literal; preserve meaningful whitespace and line breaks.           |
| Indentation              | Used to distinguish block content from directives.                 |
| Comments                 | Not included in the initial syntax.                                |

Examples of valid identifiers:

```
$input
$feature-one
$technology
$project_type
```

The following refer to different placeholders:

```
{{$input}}
{{$Input}}
```

Authors should prefer descriptive, stable identifiers.

Unknown directives are errors rather than silently ignored text.

## L03. Literal text and line breaks

`TEXT:` introduces a block of literal text.

The parser removes the common structural indentation from the block. It does not wrap lines, alter punctuation, or automatically reformat sentences.

Example:

```
TEMPLATE: Email introduction

TEXT:
  Hello {{$name}},

  Thank you for contacting us about {{$topic}}.

  Regards,
  {{$sender}}
```

Rendered result:

```
Hello Alex,

Thank you for contacting us about the release.

Regards,
Morgan
```

Blank lines inside the text block are significant.

A leading or trailing blank line introduced solely by the block layout may be removed. Internal blank lines and relative indentation must be preserved.

Whitespace normalization must be documented and covered by parser tests.

The language does not automatically correct grammar. For example, it will not change `"A application"` to `"An application"`.

## L04. Required and optional placeholders

Every placeholder is required unless its declaration specifies `OPTIONAL`.

```
$tool: What kind of application is it?
  EXAMPLE: browser-based utility

$notes OPTIONAL: Additional details?
  EXAMPLE: optimized for offline use
```

Rules:

| Field state     | Required         | Optional |
| --------------- | ---------------- | -------- |
| No answer       | Validation error | Valid    |
| Empty string    | Validation error | Valid    |
| Whitespace only | Validation error | Valid    |
| Nonempty answer | Valid            | Valid    |

An undeclared placeholder is treated as required and is given a generated question based on its identifier. Template Authoring may display a warning recommending an explicit declaration.

An optional unanswered placeholder substitutes an empty string.

The renderer must not automatically remove commas, spaces, conjunctions, or surrounding lines to compensate for absent optional answers.

For that reason, optional placeholders should normally occupy locations where an empty substitution remains acceptable.

## L05. Guidance metadata

Supported guidance directives:

```
HINT: Describe the expected answer.
EXAMPLE: An example answer.
```

These belong to the immediately preceding placeholder declaration.

A placeholder can omit either directive.

For the initial language, each placeholder has at most one question and one hint, but may have multiple examples by repeating `EXAMPLE:`.

Example:

```
$audience: Who will use this tool?
  HINT: Name the audience, not the application.
  EXAMPLE: developers
  EXAMPLE: technical writers
  EXAMPLE: project managers
```

Examples are guidance only. They do not automatically become submitted answers or default values.

The UI may provide Copy Example and Use Example actions.

## L06. Multiline input

A placeholder may request a multiline input:

```
TEMPLATE: Blank note

TEXT:
  {{$body}}

$body: Write your note.
  INPUT: multiline
```

Without an explicit input type, the field is a single-line text input.

Multiline values preserve entered line breaks.

For example, `$body` may contain:

```
Prepare the project description.

Check keyboard navigation.

Review the background images.
```

The generated result contains the same three paragraphs.

The application's keyboard controller must preserve native multiline cursor movement.

## L07. Constrained choices

Some placeholders should accept a selection rather than arbitrary text.

Keep this facility small. It must not become a separate conditional-choice language.

Proposed syntax:

```
$tone: Which tone should the message use?
  OPTION concise: Concise
  OPTION friendly: Friendly
  OPTION formal: Formal
```

A field with `OPTION` declarations displays a suitable choice control.

The stored answer is the option key (`concise`, `friendly`, or `formal`). Its interpolated text is the display label.

No choice is automatically selected merely because it appears first.

For example, selecting `friendly` inserts:

```
Friendly
```

There are no conditional branches depending on selected choices in the initial language.

A field cannot combine `INPUT: multiline` with constrained choices.

This small extension covers restricted-answer scenarios without bringing back `CHOOSE`, `WHEN`, or other procedural constructs from the abandoned DSL design.

## L08. Template versions

A source file can define multiple alternatives:

```
TEMPLATE: Project description

VERSION: Input + processing + output
  TEXT:
    Takes {{$input}}, {{$processing}}, and produces {{$result}}.

VERSION: Purpose + function
  TEXT:
    A {{$tool}} that {{$action}} to {{$benefit}}.

$input: What goes in?
  EXAMPLE: pasted JSON

$processing: What happens to it?
  EXAMPLE: checks it for errors

$result: What is produced?
  EXAMPLE: formatted JSON

$tool: What kind of tool is it?
  EXAMPLE: browser-based utility

$action: What does it do?
  EXAMPLE: formats JSON

$benefit: Why is it useful?
  EXAMPLE: improve readability
```

The template selector displays the available versions.

Each chosen version creates or reopens an independent document, with isolated answers and saved state.

Placeholder metadata may be shared at the source-definition level, but values are never shared between documents.

A template must use either one top-level `TEXT:` block or one or more `VERSION:` blocks. Mixing both forms in the same file is invalid.

Version names must be unique within a template.

## L09. Template examples

The first application should ship at least six useful templates or writing styles.

### Purpose + function

```
TEMPLATE: Purpose + function

TEXT:
  A {{$tool}} that {{$action}} to {{$benefit}}.

$tool: What kind of project is it?
  EXAMPLE: browser-based tool

$action: What does it do?
  EXAMPLE: formats and validates JSON

$benefit: Why is it useful?
  EXAMPLE: make structured data easier to inspect
```

### Problem + solution

```
TEMPLATE: Problem + solution

TEXT:
  Helps {{$audience}} {{$problem}} by {{$solution}}.

$audience: Who needs this?
  EXAMPLE: developers

$problem: What problem are they solving?
  EXAMPLE: inspect messy JSON

$solution: How does the tool help?
  EXAMPLE: validating its syntax and formatting the result
```

### Input + processing + output

```
TEMPLATE: Input + processing + output

TEXT:
  Takes {{$input}}, {{$processing}}, and produces {{$result}}.

$input: What does the user provide?
  EXAMPLE: pasted JSON

$processing: What happens to the input?
  EXAMPLE: checks it for syntax errors

$result: What does the application produce?
  EXAMPLE: readable formatted JSON
```

### Features + technology

```
TEMPLATE: Features + technology

TEXT:
  A {{$tool}} built with {{$technology}}, featuring {{$feature-one}} and {{$feature-two}}.

$tool: What kind of application is it?
  EXAMPLE: browser-based JSON utility

$technology: What technology does it use?
  EXAMPLE: vanilla JavaScript

$feature-one: What is its primary feature?
  EXAMPLE: syntax validation

$feature-two: What is another feature?
  EXAMPLE: readable formatting
```

### Structured project profile

```
TEMPLATE: Structured project profile

TEXT:
  A {{$tool}} for {{$audience}}, providing {{$workflow}} through {{$detail}}.

$tool: What is it?
  EXAMPLE: browser-based utility

$audience: Who benefits?
  EXAMPLE: developers inspecting JSON data

$workflow: What is the primary workflow?
  EXAMPLE: syntax validation and formatting

$detail: What distinguishes it?
  EXAMPLE: a lightweight interface
```

### Blank note

```
TEMPLATE: Blank note

TEXT:
  {{$body}}

$body: Write your note.
  INPUT: multiline
```

The project-description styles may be distributed as separate files or combined into one versioned template. Both are valid authoring approaches.

## L10. Parsing and validation

The parser should produce a small structured representation containing:

```
Template
  name
  versions[]
    name
    text parts[]
  placeholders[]
    name
    question
    required
    input kind
    hint
    examples[]
    options[]
  diagnostics[]
```

The parser must not directly construct UI elements or access storage.

It returns structured data and diagnostics, including source locations.

Examples of diagnostics:

| Source problem                     | Diagnostic                          |
| ---------------------------------- | ----------------------------------- |
| Missing `TEMPLATE:`                | Template name required              |
| `TEXT:` without content            | Text block is empty                 |
| Duplicate placeholder declarations | Placeholder declared more than once |
| Duplicate version names            | Version name must be unique         |
| Malformed `{{$input}`              | Unclosed placeholder reference      |
| Unsupported directive              | Unknown directive                   |
| Invalid option declaration         | Expected option key and label       |
| Unsupported input type             | Supported type is `multiline`       |
| Declared but unused placeholder    | Informational warning               |

Diagnostics should include line, column when determinable, severity, code, and explanation.

Template Authoring runs validation during editing and displays errors nonintrusively.

Invalid source can be saved and downloaded, but it cannot be treated as a valid executable template.

## L11. Rendering

Rendering is a pure operation over a parsed template version and a document's answers.

Conceptually:

```
render(version, answers):
  result = empty output

  for each part in version.text:
    if part is literal text:
      append part unchanged

    if part is placeholder:
      if a valid answer exists:
        append its displayed value
      else if optional:
        append empty text
      else:
        record unresolved required field
        append a visible preview marker

  return:
    rendered text
    unresolved required fields
    canCopy = no unresolved required fields
```

The renderer must not modify the input template or answer map.

Do not pass generated HTML through raw string interpolation into `innerHTML`.

Plain-text generation must be separate from UI decoration.

A valid result can then be converted into semantic HTML for rich clipboard operations.

## L12. Language exclusions

The initial language deliberately excludes:

| Excluded feature                        | Reason                                 |
| --------------------------------------- | -------------------------------------- |
| `WHEN`, `ELSE`, conditional expressions | Not needed for guided text replacement |
| Loops and iteration                     | Adds scripting complexity              |
| Functions and calculated variables      | Not needed                             |
| Arbitrary JavaScript expressions        | Security and predictability            |
| Remote includes or imports              | Static manifest is sufficient          |
| Template-defined UI layout              | Application owns presentation          |
| Filesystem writes or side effects       | Templates are data                     |
| Dynamic plugin execution                | Outside scope                          |

Any future syntax extension requires a real authoring example that cannot be expressed reasonably with the existing language.

## L13. Documentation and tests

The parser, validator, and renderer should each have clear source-level documentation.

The language reference is the authority on supported syntax. Parser implementation comments should explain mechanisms and invariants rather than duplicate this entire document.

Tests must cover all published examples, repeated placeholders, multiline values, optional fields, malformed references, duplicate declarations, version isolation, line-ending normalization, and incomplete-result validation.

A new syntax feature is incomplete until its examples, diagnostics, and tests are updated.

# File 3: `.specs/suggestions001-01-url-architecture.md`

# Guided Document Editor — Technical Architecture Specification

Created: 2026-10-25\
Specification: suggestions001-01\
Status: Proposed implementation architecture\
Reference package: `gtl-ui-architecture-reference-kit.zip`

## H00. Architectural principles

Implement a static TypeScript application with feature-oriented modules and browser-native APIs.

The main principles are:

1. Organize substantial functionality by domain feature, not exclusively by technical layer.
2. Keep UI, domain behavior, and persistence responsibilities separate.
3. Let features own their implementation, including optional UI, worker, and repository components.
4. Keep the worker's entry point small and focused on routing.
5. Use native Web Components and selectively encapsulate them with Shadow DOM.
6. Commit runtime libraries as vendored source or distributions.
7. Keep runtime behavior independent of npm-installed packages.
8. Prefer explicit imports, interfaces, and simple event flows over a framework or complex plugin infrastructure.

The architecture should be understandable by following one feature folder at a time.

## H01. Reference projects

Two existing projects provide implementation references.

### SovietRDTL UI

Archive: `sovet-rdtl-0.13.1-source(1).zip`

Reference package location:

```
reference/sovet-rdtl/sovet-rdtl/
```

Useful files:

| File                                    | Reference purpose                            |
| --------------------------------------- | -------------------------------------------- |
| `src/ui/components/sov-app.js`          | Application orchestration                    |
| `src/ui/components/sov-sidebar.js`      | Vertical history and selection               |
| `src/ui/components/sov-message.js`      | Document-like presentation                   |
| `src/ui/components/sov-origin-panel.js` | Contextual information and focus restoration |
| `src/ui/components/sov-backdrop.js`     | Background image handling                    |
| `src/ui/dom.js`                         | Event and DOM utilities                      |
| `src/app/chat-service.js`               | State updates and subscriptions              |
| `styles.css`                            | Dark design system and responsive layout     |

These are behavioral and visual references.

The source application uses Custom Elements with light DOM. Shadow DOM is an architectural choice for this new project, not an existing feature of those components.

Do not copy its chat engine, conversational behavior, or auto-scroll-to-latest-message interaction.

### Browser-extension architecture

Archive: `browser-extension-src.zip`

Reference package location:

```
reference/browser-extension-src/
```

Important files:

| File                                                 | Reference purpose                                       |
| ---------------------------------------------------- | ------------------------------------------------------- |
| `src/background/service_worker.ts`                   | Worker setup, database initialization, message dispatch |
| `src/background/tab_trail_service.ts`                | Service/repository separation and memory-backed testing |
| `src/content/runtime_messaging.ts`                   | Typed message envelopes                                 |
| `src/settings/settings_runtime.ts`                   | Declarative settings schema                             |
| `src/settings/settings.ts`                           | Settings UI behavior                                    |
| `src/vendor/retroos-ui-v001/src/components/field.ts` | Shadow DOM fields, labels, help and errors              |
| `src/vendor/retroos-ui-v001/src/core/styles.ts`      | Shared component styles                                 |
| `src/vendor/retroos-ui-v001/src/core/define.ts`      | Custom Element registration                             |
| `src/vendor/retroos-ui-v001/tsconfig.json`           | TypeScript compiler configuration                       |
| `src/vendor/retroos-ui-v001/scripts/build.mts`       | Bun build conventions                                   |

The original extension runs in a Chrome extension environment and uses a Manifest V3 background service worker.

Our application is a standard website.

Therefore, Chrome-specific APIs must be replaced with normal browser equivalents.

## H02. Execution environments

Use two primary execution environments.

| Environment          | Responsibilities                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| Browser main thread  | Web Components, user interaction, immediate document state, focus management, clipboard, settings UI |
| Dedicated Web Worker | IndexedDB access, background persistence, feature service operations, selected processing tasks      |

A future website Service Worker may provide offline asset caching, but it is not required for the initial data architecture.

The Dedicated Worker is not a permanent server. Each application instance can create its own worker, and worker state must not be treated as durable storage.

The editor must not wait for worker round trips before reflecting user input.

## H03. Feature-oriented project structure

Recommended initial structure:

```
index.html
package.json
tsconfig.json

scripts/
  build.ts
  generate-template-manifest.ts

src/
  app/
    main.ts
    app-shell.ts
    app-state.ts

  features/
    documents/
      model.ts
      service.ts
      protocol.ts
      ui/
        document-workspace.ts
        document-list.ts
        placeholder-editor.ts
        generated-result.ts
      worker/
        handler.ts
      storage/
        repository.ts
        dexie-repository.ts

    templates/
      model.ts
      parser.ts
      validator.ts
      renderer.ts
      loader.ts
      manifest.ts
      ui/
        template-selector.ts
        guidance-panel.ts
      worker/
        handler.ts

    template-authoring/
      model.ts
      service.ts
      ui/
        source-editor.ts
        source-diagnostics.ts
        preview.ts
      storage/
        authoring-repository.ts

    settings/
      schema.ts
      defaults.ts
      service.ts
      ui/
        settings-page.ts
        setting-field.ts

    export/
      service.ts
      ui/
        export-menu.ts

  platform/
    messaging/
      protocol.ts
      worker-client.ts
      worker-router.ts

    storage/
      database.ts
      storage-coordinator.ts
      memory-storage.ts
      local-storage.ts

    diagnostics/
      logger.ts
      console-formatters.ts

    clipboard/
      clipboard.ts

    ui/
      component-base.ts
      theme.ts
      styles.ts

  worker/
    main.ts

  vendor/
    dexie/
    jszip/
    markdown-it/
    turndown/

  types/
    vendor.d.ts

templates/
  manifest.json
  project-descriptions/
  notes/

tests/
```

This is a suggested starting structure, not a mandatory folder for every tiny function.

Features should be sufficiently substantial to justify a dedicated boundary. Small utilities belong in their owning feature or a narrowly scoped shared module.

Do not create a `worker/` or `storage/` folder within a feature unless that feature actually needs it.

## H04. Feature responsibilities

| Feature              | Owns                                                                   | Does not own                               |
| -------------------- | ---------------------------------------------------------------------- | ------------------------------------------ |
| Documents            | Document identity, answers, temporary state, navigation, save requests | Template grammar                           |
| Templates            | Definitions, parsing, validation, rendering, built-in loading          | Saved document persistence                 |
| Template Authoring   | Editable template source, diagnostics, preview, source download        | Automatic deployment of built-in templates |
| Settings             | Schema, effective values, persistence and live notifications           | Individual feature business logic          |
| Export               | Plain-text, HTML and Markdown serialization, browser download          | Document mutation                          |
| Platform Storage     | IndexedDB initialization, adapter selection, shared transactions       | Domain-specific rules                      |
| Platform Messaging   | Request routing and correlation                                        | Feature operations                         |
| Platform Diagnostics | Logger, formatting, severity filtering                                 | User document content                      |

Document history is implemented as the document collection and sidebar navigation, not as a separate historical-revisions engine.

A dedicated History feature is unnecessary unless future behavior gives history responsibilities beyond listing and locating documents.

## H05. Worker routing

The worker entry point should initialize shared services and register feature handlers.

It must not accumulate document-specific, template-specific, and settings-specific decision trees.

Conceptual registration:

```
const handlers = new Map([
  ["documents", documentHandler],
  ["templates", templateHandler]
]);
```

A request contains a scope and operation type.

Example:

```
{
  scope: "documents",
  type: "save",
  requestId: "request-123",
  payload: {
    document: documentRecord,
    expectedRevision: 4
  }
}
```

The router identifies the handler and delegates the request.

Each feature validates its incoming payload before using it.

Unknown scopes and operations produce structured errors.

The worker router must never infer success from a message being dispatched. Success requires an actual response from the feature handler.

### Protocol

Adapt the conventions from:

```
src/content/runtime_messaging.ts
```

The new browser protocol includes:

```
type Request = {
  protocolVersion: number;
  scope: string;
  type: string;
  requestId: string;
  payload: unknown;
};

type Response = {
  protocolVersion: number;
  requestId: string;
  ok: boolean;
  result?: unknown;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
};
```

Contracts should be strongly typed by operation at the client and handler boundaries, even though the transport envelope uses `unknown`.

Required behavior:

| Situation         | Behavior                                                      |
| ----------------- | ------------------------------------------------------------- |
| Valid request     | Dispatch to owning feature                                    |
| Unknown scope     | Return `UNKNOWN_SCOPE`                                        |
| Unknown operation | Return `UNKNOWN_OPERATION`                                    |
| Invalid payload   | Return `INVALID_REQUEST`                                      |
| Handler failure   | Return structured error; do not crash router                  |
| Worker timeout    | Reject pending client request with actionable error           |
| Worker restarts   | Reinitialize services; reopen persistent storage              |
| Late response     | Match using request ID; ignore responses for expired requests |

Errors must be handled locally by the caller. The UI determines how to explain them to the user.

## H06. Repository boundaries

Domain code depends on repository contracts, not directly on Dexie.

Example:

```
interface DocumentRepository {
  get(id: string): Promise<DocumentRecord | undefined>;
  list(): Promise<DocumentSummary[]>;
  save(document: DocumentRecord): Promise<void>;
  delete(id: string): Promise<void>;
}
```

Provide implementations for supported storage modes.

The strongest reference for this style is:

```
src/background/tab_trail_service.ts
```

It demonstrates store interfaces and separate Dexie and in-memory implementations.

The database initializer owns schema versions and migrations. Individual features own repository behavior and can contribute table definitions where appropriate.

Do not let individual features independently upgrade the same Dexie database without coordination.

## H07. State management and application events

The application maintains immediately responsive main-thread state.

When a user types into a placeholder:

```
Placeholder input
  → Update document state
  → Re-render affected text
  → Recalculate required-field validation
  → Mark document dirty
  → Schedule persistence
```

The updated result must not depend on the worker completing a save.

Use semantic Custom Events for communication from Web Components to application services where appropriate.

Examples:

```
document-create
document-select
placeholder-focus
placeholder-change
template-version-select
document-delete
```

These events describe user intentions. The central state service applies changes and notifies interested components.

Avoid every component listening directly to every other component.

## H08. Web Components and Shadow DOM

Native Web Components are the default UI technology.

Prefer Shadow DOM for independently styled controls, such as sidebar items, settings fields, dialogs, guidance panels, and buttons.

Use CSS custom properties to share theme values across boundaries.

Do not require every component to extend a heavyweight base class.

The placeholder editing surface should be prototyped carefully because cursor movement, focus handoffs, and text composition need predictable browser behavior.

The document text itself should remain selectable and readable. Placeholder values must be edited using real input controls with accessible labels.

No third-party reactive UI framework is required.

## H09. Template loading

Built-in templates are static project assets.

At build time, generate or validate an explicit manifest containing stable template IDs, names, and file paths.

Example:

```
{
  "templates": [
    {
      "id": "project-description",
      "file": "project-descriptions/project-description.gtl"
    },
    {
      "id": "blank-note",
      "file": "notes/blank-note.gtl"
    }
  ]
}
```

At runtime:

```
Load manifest
  → Display available templates
  → User selects a template
  → Fetch source on demand
  → Parse and validate
  → Cache valid parsed definition
  → Display selected version
```

All paths should be relative to the deployed application's configured base path, not assumed to exist at the domain root.

A new deployment can update bundled templates, but existing saved documents retain the original template definition they were created with.

## H10. Settings propagation

The settings service owns the effective settings document.

Changes follow this flow:

```
Settings UI
  → Validate proposed value
  → Update effective settings
  → Persist setting
  → Notify main-thread subscribers
  → Notify current worker
  → Broadcast to other tabs
  → Other tabs reload effective settings
```

Use browser-native messaging appropriate to the execution environment.

`BroadcastChannel` can announce changes between active tabs. Browser storage events provide a useful fallback for settings persisted in `localStorage`.

Every tab must load settings at startup rather than relying on a previous broadcast.

Workers receive the settings relevant to their operations.

Failures must not leave different components indefinitely using incompatible settings without diagnostic feedback.

## H11. Console diagnostics

Implement a dedicated diagnostics module.

Example:

```
logger.info("document.autosave.completed", {
  documentId,
  durationMs,
  storageMode
});
```

The logger controls:

- Project prefix.
- Severity filtering.
- Parameter snapshotting.
- Formatter selection.
- Console output.

The default formatter uses modest colors and readable grouping.

Provide at least a styled formatter and a plain formatter.

Objects should be serialized at the logging boundary using `JSON.stringify` with error handling, so a later mutation does not change the recorded diagnostic representation.

Do not log full document content, placeholder answers, clipboard values, or other user-authored material.

Logs are not persisted or transmitted.

## H12. Architectural acceptance requirements

A feature is architecturally complete when:

- It has an identifiable owner and public contract.
- Its UI does not directly depend on Dexie.
- Worker operations are reached through typed messages.
- Failed operations preserve user-visible editing state.
- Its important domain behavior can be tested without mounting the entire application.
- Shared code is extracted only when there is a real shared responsibility.
- Its public behavior and usage are documented close to the implementation.

The application must not reproduce the browser extension's large centralized service-worker design.

# File 4: `.specs/suggestions001-01-url-storage.md`

# Guided Document Editor — Persistence, Autosave and Recovery Specification

Created: 2026-10-25\
Specification: suggestions001-01\
Status: Proposed storage contract

## S00. Purpose

Persist guided documents and template-authoring drafts locally without creating unnecessary records or revision history.

The default storage engine is IndexedDB through the vendored Dexie library.

The application must preserve active in-memory work when storage fails.

Document state, template-authoring state, and application settings are separate concerns.

## S01. Persistence modes

Support three modes:

| Mode         | Document behavior                                                       |
| ------------ | ----------------------------------------------------------------------- |
| IndexedDB    | Default. Persist documents using Dexie.                                 |
| localStorage | Persist suitable documents as serialized browser storage records.       |
| Memory only  | Keep documents during the current page session without persisting them. |

The storage interface must be consistent across modes.

The Settings page indicates the current mode and explains that memory-only documents disappear when their page session ends.

Changing the storage mode does not delete records from the previous store.

Existing in-memory documents remain available. They must not be silently migrated or overwritten.

If migration is offered, make it an explicit, separate operation.

### Settings storage

Application preferences use a small bootstrap settings record in `localStorage`, independently of the selected document-storage adapter.

This allows the selected storage mode and UI preferences to survive reloads.

Memory-only mode means document content is not persisted. It does not necessarily erase general appearance and application preferences.

If preference storage is unavailable, the application uses documented defaults and reports the limitation.

## S02. Document record

A saved document should contain enough information to reopen it without depending on the current bundled template.

Conceptual record:

```
interface DocumentRecord {
  id: string;
  title: string;

  templateId: string;
  templateVersionId: string;

  templateSnapshot: TemplateDefinition;
  answers: Record<string, string>;

  relatedGroupId?: string;

  createdAt: string;
  updatedAt: string;
  revision: number;
}
```

`revision` is a concurrency counter, not a historical version.

The record contains the current state only.

`templateSnapshot` preserves the template definition used by the document. It allows saved documents to continue working after bundled template files change or disappear.

`relatedGroupId` may connect documents created through the same template-version selection flow, without sharing their answers.

A document created independently through New Document receives its own identity and group context.

## S03. Meaningful changes

A document is not persisted simply because it was opened.

Meaningful user changes include:

| Action                                                | Meaningful?                  |
| ----------------------------------------------------- | ---------------------------- |
| Open New Document                                     | No                           |
| Select template                                       | No                           |
| Switch between versions without editing               | No                           |
| Focus placeholder                                     | No                           |
| Read or copy guidance                                 | No                           |
| Enter or change a placeholder answer                  | Yes                          |
| Choose a constrained placeholder value                | Yes                          |
| Explicitly rename the document                        | Yes                          |
| Change global appearance settings                     | No document change           |
| Return all content and metadata to untouched defaults | No remaining document change |

Compare normalized semantic state rather than relying on a single keyboard-event flag.

An untouched temporary document is not written into the document collection.

If a temporary document becomes dirty and then returns to its original untouched state before persistence, discard that temporary working record.

For an existing document, returning to a previous value simply updates the current state. It does not delete the document.

## S04. Draft identity and saving

Every persisted document has one current working state.

Autosave updates that record in place.

The application does not create historical copies on each save.

An independent document created from another template version receives its own record only after a meaningful edit.

Example:

```
Input + processing + output
  → User enters "pasted JSON"
  → Create document record A

Purpose + function
  → User previews without typing
  → No record B

Purpose + function
  → User enters "browser-based tool"
  → Create document record B
```

Documents A and B may be related for navigation but remain independently editable and persistent.

## S05. Autosave policy

Default interval: 60 seconds.

Interpret the interval as the maximum normal delay between scheduled save opportunities while a document remains dirty.

There is no need to create a save every minute when nothing has changed.

Conceptual algorithm:

```
on meaningful change:
  update in-memory state
  mark document dirty
  schedule autosave if needed

on autosave interval:
  if document dirty:
    persist latest coherent snapshot

on navigation or page hidden:
  request immediate flush of dirty state

on successful save:
  if saved snapshot is still current:
    mark saved
  else:
    leave newer changes dirty

on failed save:
  keep current state in memory
  display error and retry action
```

Only one save per document should be committed at a time through a given client. Queued changes can be coalesced into the latest state.

An older asynchronous save response must never cause newer, unsaved changes to be marked as saved.

A browser crash, forced process termination, or sudden power failure may lose changes that have not completed persistence.

The application should be explicit about this limitation.

## S06. Save status

Represent save state independently from the document's stored content.

| State     | Meaning                                      | UI                |
| --------- | -------------------------------------------- | ----------------- |
| Temporary | No meaningful content entered                | No draft yet      |
| Dirty     | Modified state not yet persisted             | Unsaved changes   |
| Saving    | Persistence request active                   | Saving…           |
| Saved     | Current state matches stored state           | Saved             |
| Failed    | Last save failed                             | Not saved · Retry |
| Conflict  | Another instance changed the stored document | Save conflict     |

Successful saving should be quiet.

Errors must be visible without interrupting editing.

A retry operation must not create a duplicate document.

## S07. Multiple browser tabs

Multiple tabs may open the same document.

They must not silently overwrite each other's modifications.

Use optimistic concurrency with a per-document revision counter.

Example:

```
Tab A loads document revision 4.
Tab B loads document revision 4.

Tab A saves a change:
  revision becomes 5.

Tab B attempts to save its earlier revision 4:
  save is rejected as a conflict.
```

Tab B retains its in-memory work.

It displays an actionable conflict message and offers the user the choice to reopen the latest persisted document or preserve the local work as a separately named document.

Do not automatically merge placeholder answers from competing tabs.

Cross-tab broadcasts can notify instances that a document changed, but the stored revision remains the authority.

Where IndexedDB transactions are available, conflict checking and updating the record should be atomic.

## S08. IndexedDB schema

Suggested logical tables:

| Table             | Contents                             |
| ----------------- | ------------------------------------ |
| `documents`       | Current persisted document records   |
| `authoringDrafts` | Unfinished template source drafts    |
| `metadata`        | Internal database metadata if needed |

Do not create a document revision-history table.

Settings remain primarily in their independent bootstrap settings store.

The Dexie database should have one centrally managed schema and migration sequence.

Index documents by ID, update time, and optionally related group ID for sidebar navigation.

Index template-authoring drafts by ID and update time.

The exact database name should be consistent and application-specific.

## S09. localStorage adapter

The `localStorage` mode should implement the same logical repository contract.

Because browser storage is comparatively limited and synchronous, this mode should be presented as suitable for smaller collections.

It must handle quota errors, disabled storage, invalid serialized data, and storage conflicts.

Use a namespaced application storage key and explicit schema versioning.

Never silently replace corrupted persisted data with a blank collection and claim that all previous documents were deleted.

Report the problem and preserve whatever in-memory state remains accessible.

## S10. Template-authoring draft persistence

Template-authoring drafts may contain incomplete or invalid source.

They are saved independently from generated documents.

A draft record includes:

```
interface AuthoringDraft {
  id: string;
  title: string;
  source: string;
  sourceTemplateId?: string;
  createdAt: string;
  updatedAt: string;
}
```

The draft is not a published template.

Downloading a `.gtl` file does not automatically publish the template or remove its authoring draft.

When the user edits a bundled template, the source is copied into the authoring workspace. Its original bundled file remains unchanged.

Template-authoring drafts should use Dexie by default. Under another configured storage mode, the authoring repository should honor that mode where supported; memory-only mode must not unexpectedly persist template source.

## S11. Deletion

Deleting a saved document requires user confirmation.

The confirmation identifies the document being deleted.

After confirmation, delete its persisted working state from the active store and remove it from the sidebar.

There is no recycle bin or historical revision recovery.

An untouched temporary document can be abandoned without confirmation.

Deleting one document must not delete other documents using the same template or belonging to the same related group.

## S12. Storage errors and recovery

Expected failures include:

| Failure                         | Required behavior                                        |
| ------------------------------- | -------------------------------------------------------- |
| IndexedDB unavailable           | Keep working state in memory; report persistence problem |
| Storage quota exceeded          | Preserve unsaved data; offer recovery/copy options       |
| Worker initialization fails     | Report error; attempt controlled recovery                |
| Stored record cannot be decoded | Preserve evidence; avoid destructive reset               |
| Template snapshot invalid       | Explain why document cannot be rendered correctly        |
| Save conflict                   | Retain local work; avoid silent overwrite                |
| Autosave interrupted            | Restore last successfully saved state                    |

The application must never silently discard content to make a persistence error disappear.

If reliable persistence is unavailable, exporting complete content should remain available whenever the document satisfies its required-field validation.

## S13. Storage acceptance tests

Required scenarios include:

1. Untouched previews do not persist.
2. Editing one placeholder creates exactly one document record.
3. Repeated autosaves update the same record.
4. Removing all changes from a temporary document leaves no stored record.
5. Switching template versions preserves independent documents.
6. Reloading restores the correct answers and template snapshot.
7. Deleting one version does not delete related documents.
8. Storage failures preserve active in-memory work.
9. Two tabs cannot silently overwrite each other.
10. Switching storage modes never silently deletes previous data.
11. Invalid template-authoring source remains recoverable.
12. Returning a save response out of order does not incorrectly clear the dirty state.

# File 5: `.specs/suggestions001-01-url-ui-ux.md`

# Guided Document Editor — User Interface and Interaction Specification

Created: 2026-10-25\
Specification: suggestions001-01\
Status: Proposed UX contract\
Visual references: SovietRDTL source and reference-kit diagrams

## U00. Design objective

The application should feel like a comfortable, keyboard-friendly writing environment.

The interface has the visual familiarity of a chat application, but the content is organized as independent documents rather than messages exchanged between speakers.

The emphasis is on reading, editing placeholder values, and producing useful text with minimal interruption.

The user should rarely need to open a separate form or dialog to perform the primary task.

A user who sees a sentence containing editable fields should immediately understand where to enter information.

## U01. Desktop layout

Use three primary regions:

```
┌────────────────┬──────────────────────────────┬────────────────────┐
│                │                              │                    │
│ DOCUMENTS      │  PROJECT DESCRIPTION         │  GUIDANCE          │
│                │                              │                    │
│ + New Document │  Template: Input / Output     │  What goes in?     │
│                │                              │                    │
│ Project A      │  Takes [input], [processing], │  Hint:             │
│ Project B      │  and produces [result].       │  Describe the data │
│ Blank Note     │                              │                    │
│                │                              │  Example:          │
│                │                              │  pasted JSON       │
│                │  --------------------------  │                    │
│                │                              │  ERRORS (0)        │
│                │  GENERATED RESULT            │                    │
│                │                              │                    │
│                │  Takes pasted JSON...        │                    │
│                │                              │                    │
│                │  [Copy] [Copy Rich Text]     │                    │
│                │                              │                    │
│ Settings       │                              │                    │
└────────────────┴──────────────────────────────┴────────────────────┘
```

The left navigation remains visually subordinate to the document.

The central column should support comfortable reading, including longer multiline documents.

The guidance panel should have enough width to show explanations and examples without excessive line wrapping.

All three regions may scroll independently where appropriate.

The user should never need to scroll away from the active editor simply to find its hint.

## U02. Document navigation

The sidebar contains:

- New Document.
- Saved documents.
- Template Authoring.
- Settings.

Saved documents are ordered by recent modification by default.

Each item displays a useful title and, where helpful, a compact date or template label.

An active item has a visible selected state.

The application should support renaming and deleting documents.

Untouched temporary documents appear as the active workspace but are not retained in saved history after the user leaves.

Do not emulate chat bubbles or speaker identities.

The reference for sidebar structure is:

```
reference/sovet-rdtl/sovet-rdtl/src/ui/components/sov-sidebar.js
```

## U03. Template selection

New Document opens a template selector at the top of the central workspace.

The user can choose a template and then one of its available versions.

A selector should show:

| Information | Example                                                 |
| ----------- | ------------------------------------------------------- |
| Name        | Input + processing + output                             |
| Description | Describe what goes in, what happens, and what comes out |
| Preview     | Takes [input], [processing], and produces [result].     |

Use a compact list, radio-like selector, or selectable cards according to available space.

The selector is not a step-by-step wizard.

After selection, the complete guided text is immediately visible.

Version switching must never silently overwrite another document's answers.

## U04. Placeholder presentation

Placeholders are embedded directly into read-only template prose.

A placeholder may be:

| State                | Presentation                                          |
| -------------------- | ----------------------------------------------------- |
| Unfilled             | Identifier displayed with a subtle editing affordance |
| Filled               | Answer displayed in the document                      |
| Focused              | Stronger selection treatment                          |
| Required and missing | Error styling and explanation                         |
| Optional and empty   | Subtle empty-field affordance                         |

Do not render every placeholder as a large, permanent form box.

The goal is to preserve the appearance of readable prose.

Selecting a placeholder activates its value-editing control and guidance.

The surrounding text remains fixed.

## U05. Guidance panel

The active placeholder determines the panel's primary content.

For example:

```
PROCESSING

What happens to the input?

Describe the main operation using a short
present-tense verb phrase.

Your answer:
[checks it for syntax errors              ]

Examples:
  validates its syntax
  converts the data into a readable format
```

The panel must remain visible while the user types.

It must not disappear on blur merely because the user selects or copies guidance text.

Examples are selectable and can be copied.

A Use Example action may place the example into the active field, replacing the current answer through an explicit action.

The panel should not cover the active editing location.

A collapsible panel is required. A floating, freely movable tool-window system is unnecessary for the initial implementation.

### Guidance and errors

The right region also contains a collapsible unresolved-issues section.

The section displays a compact error-count indicator.

For example:

```
GUIDANCE

What does the application produce?

Example: readable formatted JSON


UNRESOLVED ISSUES  (2)

1. Result is required.
2. Changes could not be saved.
```

Issues disappear when their underlying conditions are resolved.

Clicking an issue moves attention to the affected placeholder, source location, or settings control.

The error collection represents current conditions, not historical notifications.

## U06. Keyboard interaction

Keyboard use is a primary feature.

For single-line placeholder editors:

| Key       | Behavior                                                                                |
| --------- | --------------------------------------------------------------------------------------- |
| Left      | Move the caret left; if already at the start, focus the previous placeholder at its end |
| Right     | Move the caret right; if already at the end, focus the next placeholder at its start    |
| Up        | Navigate to previous placeholder                                                        |
| Down      | Navigate to next placeholder                                                            |
| Tab       | Move through the normal focus order                                                     |
| Shift+Tab | Reverse normal focus order                                                              |
| Escape    | Close an open suggestion or auxiliary popover where applicable                          |

At the first and last placeholder, navigation does not wrap.

For multiline editors:

| Key                               | Behavior                          |
| --------------------------------- | --------------------------------- |
| Left at beginning of entire value | Focus previous placeholder        |
| Right at end of entire value      | Focus next placeholder            |
| Up / Down                         | Native multiline caret navigation |
| Tab / Shift+Tab                   | Normal focus navigation           |

When switching placeholders, the guidance panel updates immediately.

If editing occurs in the docked value editor, focus stays in that editing control while its active placeholder changes. The document visually highlights the newly active placeholder.

Do not intercept composition events, normal selection movement, or operating-system editing shortcuts.

### Reference

Study the minibuffer editing patterns in:

```
reference/browser-extension-src/src/content/text_expander_minibuffer_model.ts
```

And in the original extension archive:

```
src/content/atools/minibuffer-editor-v001/js/minibuffer-editor-core.ts
```

Use them as keyboard-handling references, not as code that already implements this exact cross-field behavior.

Implement the navigation policy as an independently testable unit.

## U07. Generated result

The result appears below the guided editing text.

It uses ordinary readable typography without editing decorations.

A completed result might display:

```
Takes pasted JSON, checks it for syntax errors,
and produces a readable formatted version.
```

Its actions include:

```
Copy Text
Copy Rich Text
Export
```

The result remains selectable.

When required fields are missing, their unresolved locations are visually identifiable, and copy/export actions are disabled.

There should be no modal confirmation merely for copying valid text.

Successful copying may show a short, quiet acknowledgment.

## U08. Rich clipboard behavior

Copy Text writes plain text.

Copy Rich Text writes both a plain-text representation and a semantic HTML representation when supported.

HTML should use appropriate document structures such as paragraphs and line breaks.

Do not copy the application's dark background, highlight colors, buttons, tooltips, or field decorations.

If the browser cannot provide rich clipboard access, report the limitation and allow ordinary text copying.

Do not claim success before clipboard writing completes.

## U09. Visual design

The default appearance is a restrained dark theme.

The supplied SovietRDTL source is the principal visual reference.

Relevant files:

```
reference/sovet-rdtl/sovet-rdtl/styles.css

reference/sovet-rdtl/sovet-rdtl/src/ui/components/sov-backdrop.js

reference/sovet-rdtl/sovet-rdtl/src/config/backgrounds.js
```

Suggested base palette:

| Element          | Color     |
| ---------------- | --------- |
| Main background  | `#101113` |
| Sidebar          | `#0d0e10` |
| Elevated surface | `#27282b` |
| Main text        | `#f2f1ef` |
| Secondary text   | `#b2b2b7` |
| Dividers         | `#343539` |
| Focus highlight  | `#d1d9ec` |

Use semantic theme variables rather than repeatedly embedding literal colors throughout components.

Background images should be optional and decorative.

Start with a plain dark background and a small collection of subdued alternatives.

The reference package includes sample room images and editable diagrams under:

```
assets/
diagrams/
```

Those assets are design references. Before shipping any copied image, verify that its license permits that use.

Prefer original final artwork over relying indefinitely on reference images.

Backgrounds must never reduce readability, capture pointer events, or alter exported documents.

## U10. Responsive behavior

On narrow screens, the document becomes the primary full-width region.

The left navigation becomes a drawer.

Guidance becomes a compact panel or drawer that can be opened while editing.

The active field must remain visible when the on-screen keyboard appears.

The mobile interface must account for visual viewport changes and safe-area insets.

It must not automatically scroll the document to the bottom after every change.

The scroll position should follow the editing context, not mimic incoming chat messages.

## U11. Settings page

Settings are presented on a dedicated page or workspace.

The UI is generated from the settings schema.

Each setting displays its name, description, current value, and appropriate input control.

Example:

```
STORAGE

Storage mode

Choose where your documents are saved.

(●) IndexedDB
( ) Browser localStorage
( ) Do not persist


AUTOSAVE

Autosave interval

Save modified documents automatically.

[60 seconds]


DIAGNOSTICS

Console verbosity

[Info ▼]

Console formatter

[Styled ▼]
```

Changes apply immediately.

Settings with dependencies or restrictions should explain them near the relevant control.

Use the supplied extension's settings code as the primary behavioral reference:

```
reference/browser-extension-src/src/settings/settings_runtime.ts
reference/browser-extension-src/src/settings/settings.ts
reference/browser-extension-src/src/settings/settings.html
reference/browser-extension-src/src/settings/settings.css
```

## U12. Template Authoring workspace

Template Authoring is visually related to the main application but clearly separated from document creation.

Recommended layout:

```
┌─────────────────────────────┬────────────────────────┐
│ TEMPLATE SOURCE             │ GUIDANCE / ERRORS      │
│                             │                        │
│ TEMPLATE: Example           │ 2 unresolved errors    │
│                             │                        │
│ TEXT:                       │ Line 8: Invalid field  │
│   Hello {{$name}}.          │                        │
│                             │                        │
│ $name: Who is it for?       │                        │
│                             │                        │
│                             │                        │
│ [Preview] [Download .gtl]   │                        │
└─────────────────────────────┴────────────────────────┘
```

The source editor may freely edit template text and syntax.

Diagnostics update as the author types.

Errors appear near their source location and in the collapsible issues panel.

Preview uses the actual parser and renderer, not a separate approximate implementation.

Downloading the source remains available even if validation fails.

Authoring drafts autosave locally and do not automatically modify built-in template files.

## U13. Accessibility

The application must support keyboard-only use and screen-reader navigation.

Requirements include:

- Visible focus indication.
- Proper labels for placeholder editors.
- Accessible names for document and template selectors.
- Error descriptions associated with affected controls.
- Predictable focus restoration after dialogs.
- No keyboard traps.
- Respect for reduced-motion preferences.
- Text/background contrast suitable for sustained reading.
- Status notifications that do not overwhelm assistive technologies.

The design should prefer native input behavior over custom keyboard simulation whenever possible.

## U14. UX acceptance scenarios

The UI implementation must demonstrate:

1. A new user can create a guided document without reading documentation.
2. Selecting a placeholder reveals its hint without hiding the document.
3. Editing one value updates the result immediately.
4. Keyboard navigation reaches every placeholder.
5. Multiline editing behaves like an ordinary text area.
6. Reading or copying guidance does not unexpectedly close the panel.
7. Required-field errors disappear when corrected.
8. Save failures remain visible and actionable.
9. Switching documents restores the correct selection and answers.
10. On mobile, the active editor remains accessible while the keyboard is open.

# File 6: `.specs/suggestions001-01-url-development.md`

# Guided Document Editor — Development, Build and Documentation Specification

Created: 2026-10-25\
Specification: suggestions001-01\
Status: Implementation requirements\
Toolchain: TypeScript 7, Bun, browser-native APIs

## D00. Development philosophy

Implement the smallest architecture that satisfies the product behavior.

The implementation should be modern, typed, modular, and maintainable, but it should not introduce frameworks or abstractions without a concrete need.

Prefer code that can be understood through feature ownership, explicit contracts, source-level documentation, and behavior tests.

The provided reference projects should accelerate implementation, not determine functionality contrary to the new specifications.

## D01. Technology baseline

| Area                         | Requirement                                               |
| ---------------------------- | --------------------------------------------------------- |
| Language                     | TypeScript                                                |
| Initial compiler version     | TypeScript 7.0.2                                          |
| Bundler/runtime tooling      | Bun                                                       |
| Browser UI                   | HTML, CSS, native Web Components                          |
| Runtime npm dependencies     | None                                                      |
| Development npm dependencies | Allowed                                                   |
| Persistent database library  | Vendored Dexie 4.2.0                                      |
| Primary storage              | IndexedDB                                                 |
| Background processing        | Dedicated Web Worker                                      |
| Hosting                      | Static website                                            |
| Testing                      | Bun test runner and appropriate browser integration tests |

TypeScript 7.0.2 is the stable release verified for the specification date. Pin the compiler version rather than automatically accepting a prerelease.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.npmjs.com\&sz=32)

npm



Bun is expected to be installed and available globally in the development environment.

Do not declare Bun as a runtime dependency of the deployed application.

Production output must run in supported browsers without Bun.

## D02. Runtime vendoring

Runtime libraries must be committed directly into the project.

Do not depend on installing runtime packages from npm during application execution or deployment.

The reference package includes:

```
library/dexie-4.2.0.js
library/jszip-3.10.1.js
library/markdown-it-14.2.0.js
library/turndown-7.0.0.js
```

These correspond to original extension files:

```
src/content/libs/dexie-4.2.0.js
src/content/libs/jszip-3.10.1.js
src/content/libs/markdown-it-14.2.0.js
src/content/libs/turndown-7.0.0.js
```

Dexie is required for default persistence.

JSZip, Markdown-It, and Turndown are available as references and optional dependencies. Include them in production only when a required feature uses them.

The existing Dexie distribution is UMD rather than native ESM.

Before committing to its integration strategy, verify that it loads correctly in the Bun-built module worker.

If necessary, use an appropriately licensed vendored ESM distribution instead.

Every vendored runtime library should have recorded:

| Metadata        | Purpose                               |
| --------------- | ------------------------------------- |
| Library name    | Identify dependency                   |
| Exact version   | Reproducibility                       |
| Source location | Provenance                            |
| License         | Redistribution compliance             |
| Local adapter   | Boundary used by application code     |
| Upgrade notes   | Document compatibility considerations |

Do not modify vendored source casually.

Application-specific changes belong in an adapter outside the vendor directory whenever possible.

## D03. TypeScript configuration

Use strict TypeScript settings.

Suggested baseline:

```
{
  "compilerOptions": {
    "target": "ES2025",
    "module": "Preserve",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "noUncheckedIndexedAccess": true,
    "useUnknownInCatchVariables": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  }
}
```

Use separate configurations for the browser UI and worker when necessary to avoid inappropriate ambient browser APIs in worker code.

The application should not rely on `any` to bypass domain-modeling or messaging problems.

Use discriminated unions for important state transitions and message types.

Type checking must be executed separately from bundling.

## D04. Build process

The project should support:

```
bun run build
bun run typecheck
bun test
```

The actual scripts must exist in `package.json`.

A build should:

1. Type-check application and worker code.
2. Generate or validate the static template manifest.
3. Bundle the browser entry point.
4. Bundle the worker entry point.
5. Copy HTML, CSS, templates, and required assets.
6. Produce deployable files under `dist/`.
7. Fail visibly when required assets or manifests are invalid.

Build scripts should use Bun directly without introducing an unnecessary framework.

The generated site must work when hosted beneath a subdirectory, such as a GitHub Pages project path.

Asset URLs should be relative to the configured deployment base.

Development may use Bun's local server facilities or a simple static development server.

## D05. Documentation as an implementation requirement

Documentation must be created and updated during development, not reconstructed only after the application is finished.

The documentation structure should resemble the actual project architecture.

A source file that implements substantial behavior should contain an introductory comment explaining its responsibility and intended usage.

Example:

```
/**
 * Parses Guided Template Language source into a typed
 * template definition and diagnostic collection.
 *
 * This module performs no DOM or storage operations.
 *
 * Example:
 *   TEMPLATE: Greeting
 *
 *   TEXT:
 *     Hello {{$name}}.
 *
 *   $name: Who are you greeting?
 */
```

Public functions, complex invariants, and non-obvious failure behavior should have appropriate local documentation.

Avoid comments that merely restate the code.

### Documentation ownership

| Documentation     | Location                                               | Responsibility                           |
| ----------------- | ------------------------------------------------------ | ---------------------------------------- |
| Product behavior  | `.specs/`                                              | Authoritative requirements               |
| Template language | Language specification and parser module documentation | Syntax and processing semantics          |
| Feature behavior  | Feature folder documentation                           | Responsibilities, workflows, contracts   |
| Public APIs       | TypeScript source comments                             | Usage and invariants                     |
| Worker protocol   | Messaging module documentation                         | Request/response format and errors       |
| Database          | Storage module documentation                           | Schema, indexes, migrations              |
| UI components     | Component source documentation                         | Properties, events, slots, accessibility |
| Examples          | Tests and documented examples                          | Actual supported behavior                |

A feature-level `README.md` is appropriate when its behavior spans several files and cannot be understood adequately from the public API.

Do not create large documents containing the same implementation explanation in several places.

## D06. Parser documentation

The parser must be particularly well documented because its behavior defines the template language.

Its documentation should describe:

- The recognized directives.
- Indentation rules.
- Literal text processing.
- Placeholder identifier rules.
- Optional and required fields.
- Input types.
- Version handling.
- Source-position tracking.
- Error recovery and diagnostics.

Each language feature should have at least one valid example and relevant invalid examples.

For example:

```
Valid:
  $name: Who is this for?

Valid:
  $notes OPTIONAL: Additional notes?

Invalid:
  $name OPTIONAL Who is this for?
```

The parser tests should serve as executable documentation.

The renderer should have separate documentation demonstrating substitution, repeated placeholders, missing values, and multiline output.

## D07. Error handling conventions

Errors should be actionable and associated with the operation that failed.

An error should identify:

| Field    | Purpose                               |
| -------- | ------------------------------------- |
| Code     | Stable machine-readable identifier    |
| Message  | Concise explanation                   |
| Context  | Relevant operation or source location |
| Recovery | Available corrective action           |

For example:

```
STORAGE_WRITE_FAILED

The current document could not be saved.

Storage: IndexedDB
Document: project-description-123

Your unsaved changes are still available in this tab.

Action: Retry saving.
```

Do not expose internal stack traces as the primary user-facing explanation.

Stack traces and technical parameters may be reported to the browser console according to diagnostic verbosity.

Template syntax errors should include accurate source line and column information where available.

## D08. Diagnostic logging conventions

The project must have a shared logging API rather than scattered ad hoc `console.log()` calls.

Event names should be stable and descriptive.

Example:

```
logger.debug("template.parser.completed", {
  templateId,
  diagnosticCount,
  durationMs
});
```

The default logger prefix is:

```
[GTL]
```

Example console presentation:

```
[GTL] INFO  document.created
  documentId: "doc-123"
  templateId: "project-description"

[GTL] DEBUG document.autosave.started
  documentId: "doc-123"

[GTL] INFO  document.autosave.completed
  documentId: "doc-123"
  durationMs: 8
```

The styled formatter may use CSS formatting supported by browser consoles.

The plain formatter should remain readable without styling.

Verbosity and formatter selection are settings, immediately applied to current application instances and workers.

Snapshot structured parameters at logging time. Use guarded `JSON.stringify` serialization where appropriate, and handle cyclic or unserializable values without breaking the application.

No document bodies, placeholder answers, or clipboard contents may be logged by default.

There is no diagnostic export or remote telemetry subsystem.

## D09. Testing strategy

Use several complementary testing levels.

| Test level          | Responsibility                                                          |
| ------------------- | ----------------------------------------------------------------------- |
| Unit                | Parser, renderer, keyboard-navigation decisions, settings normalization |
| Feature             | Document lifecycle, autosave scheduling, repository behavior            |
| Worker              | Request routing, validation, errors, timeouts                           |
| Browser integration | Focus, clipboard, Shadow DOM, IndexedDB, multiple tabs                  |
| End-to-end          | Representative workflows from the main specification                    |

Bun's test runner is suitable for pure TypeScript modules.

Real browser tests are necessary for behavior that cannot be established reliably in a simulated DOM.

Prioritize these browser-specific risks:

- Arrow-key navigation across placeholder editors.
- Multiline selection and composition.
- Focus across Shadow DOM boundaries.
- Rich-text clipboard behavior.
- IndexedDB operations in a module worker.
- Settings propagation across tabs.
- Autosave conflicts between tabs.
- Mobile virtual-keyboard positioning.

## D10. Implementation sequence

Recommended implementation order:

| Phase | Deliverable                           | Acceptance condition                                            |
| ----- | ------------------------------------- | --------------------------------------------------------------- |
| 1     | Project skeleton and Bun build        | Static page and worker build correctly                          |
| 2     | Template parser and renderer          | All initial template examples pass tests                        |
| 3     | Guided document editor                | Fixed text, editable placeholders, live result                  |
| 4     | Keyboard and guidance UX              | Reliable navigation and persistent hints                        |
| 5     | Dexie persistence                     | Documents survive reloads without unwanted history              |
| 6     | Sidebar and document lifecycle        | Independent documents and temporary previews                    |
| 7     | Settings                              | Schema-driven page with live propagation                        |
| 8     | Template Authoring                    | Editable source, diagnostics, preview, download                 |
| 9     | Export                                | Plain text, rich clipboard, Markdown and HTML                   |
| 10    | Responsive polish and failure testing | Mobile, accessibility, recovery, multi-tab behavior             |
| 11    | Documentation review                  | Source docs and specifications agree with tested implementation |

The exact sequencing may change if an implementation experiment exposes a technical dependency.

Avoid building extensive abstractions before the first guided-document workflow works end to end.

## D11. Reference-first implementation

Before implementing a component or subsystem inspired by the supplied projects, the agent should inspect the relevant original source.

Examples:

| New subsystem              | Inspect first                                  |
| -------------------------- | ---------------------------------------------- |
| Document sidebar           | `sov-sidebar.js`                               |
| Contextual guidance        | `sov-origin-panel.js`                          |
| Background images          | `sov-backdrop.js`                              |
| Settings schema            | `settings_runtime.ts`                          |
| Settings page              | `settings.ts`, `settings.html`, `settings.css` |
| Persistence repository     | `tab_trail_service.ts`                         |
| Typed worker messages      | `runtime_messaging.ts`                         |
| Worker routing             | `service_worker.ts`                            |
| Shadow DOM fields          | `retroos-ui-v001/src/components/field.ts`      |
| Build configuration        | `retroos-ui-v001/scripts/build.mts`            |
| ZIP export, if implemented | `session_snapshot_zip.ts`                      |

These paths refer to files included in the reference package or, where noted in the reference documents, the original uploaded archives.

The new source should follow applicable conventions while adapting to a static website.

The agent must not reintroduce extension-only APIs or unnecessary chat behavior.

## D12. Explicit engineering non-goals

Do not introduce:

- React, Vue, Angular, or another application framework.
- A mandatory runtime package manager.
- A remote database.
- An application server.
- A general-purpose dependency injection framework.
- A dynamic plugin installer.
- A sophisticated client-side routing framework for a small application.
- A rich-text editor library.
- An event-sourcing or revision-history system.
- Runtime template execution with arbitrary JavaScript.
- A backend telemetry collector.

Any exception requires a concrete implementation need that cannot be handled reasonably with the agreed stack.

## D13. Implementation completion checklist

A feature is complete only when its important requirements are implemented, its relevant tests pass, errors are meaningful, and documentation has been updated.

Before considering the project ready:

- All six specifications must have been reviewed against the actual implementation.
- The deployed site must require no backend or npm runtime installation.
- Every built-in template must parse successfully.
- Example-driven parser and renderer tests must pass.
- Document editing must preserve answers correctly across reloads.
- Independent template versions must not share values.
- Autosave must not create revision histories or unnecessary empty documents.
- Required-field validation must prevent invalid result copying.
- Settings must propagate without requiring a page reload under normal supported conditions.
- Browser console diagnostics must follow the agreed formatting and privacy rules.
- The application must be usable with keyboard navigation.
- Critical features must be documented in their owning source modules.

The initial implementation should be considered successful when a user can complete the full guided-writing workflow comfortably, without needing to understand the DSL, browser storage, or background-worker architecture.

## Specification set

All six proposed files · Created 2026-10-25

| File                                                 | Purpose                                            |
| ---------------------------------------------------- | -------------------------------------------------- |
| `.specs/suggestions001-01-url-main-specification.md` | Product behavior and acceptance                    |
| `.specs/suggestions001-01-url-language.md`           | Template syntax, validation, rendering             |
| `.specs/suggestions001-01-url-architecture.md`       | Features, Web Components, workers, reference code  |
| `.specs/suggestions001-01-url-storage.md`            | Dexie, autosave, drafts, recovery                  |
| `.specs/suggestions001-01-url-ui-ux.md`              | Layout, interaction, keyboard, appearance          |
| `.specs/suggestions001-01-url-development.md`        | TypeScript, Bun, vendoring, testing, documentation |

These specifications are intended to be read together, with the main specification establishing product behavior and the remaining documents defining their respective technical contracts.

The reference archive supplies source examples and implementation inspiration; these new specifications take precedence over the older reference reports wherever requirements changed during our discussion.