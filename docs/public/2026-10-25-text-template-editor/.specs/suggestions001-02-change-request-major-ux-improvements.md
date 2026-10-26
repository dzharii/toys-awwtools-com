2026-10-26

---

See ./suggestions001-02-change-request-major-ux-improvements.assets with raw transcript and other
implementation details for reference. 

---

# File: `.specs/suggestions001-02-change-request.md`

# Guided Document Editor - Change Request: Workspace and Writing Experience

Created: 2026-10-25\
Specification: `suggestions001-02`\
Status: Implementation change request, revised and approved\
Revision: 01\
Source: `transcript00012026-10-25.zip`, 37:15.433 narrated UI review and 20 reference frames\
Applies to: Existing Guided application, document editing, template selection, Template Authoring, navigation, settings, persistence, and accessibility.\
Priority: Major UX revision\
Supersedes: Only explicitly conflicting requirements from `suggestions001-01`.

Related change-request files:

| File                                                          | Responsibility                                                                        |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `suggestions001-02-window-system.md`                          | Floating, docking, resizing, collapsing, panel state, and layout persistence          |
| `suggestions001-02-template-experience.md`                    | Template discovery, previews, writing styles, placeholder editing, and readability    |
| `suggestions001-02-document-authoring-lifecycle.md`           | Document actions, archive, authoring history, checkpoint restoration, and naming      |
| `suggestions001-02-settings-implementation-and-acceptance.md` | Settings, architecture, migration, verification, evidence, and consolidated decisions |

Related original requirements: `suggestions001-01-url-main-specification.md`, `suggestions001-01-url-ui-ux.md`, `suggestions001-01-url-architecture.md`, `suggestions001-01-url-storage.md`, `suggestions001-01-url-language.md`, `suggestions001-01-url-development.md`, and the code-quality appendix.

## A01. Purpose

This change request addresses usability problems identified during a narrated walkthrough of Guided and its reference application.

Guided remains a local-first, browser-based application for creating user-authored text through reusable GTL templates. It is not an AI chatbot, conventional form wizard, general-purpose rich-text editor, or document-generation service.

The revised experience must preserve the original product model while improving workspace flexibility, editing continuity, discoverability, readability, navigation, and recovery.

Primary objective:

The user must be able to focus on writing while independently controlling the supporting interface. Floating panels, navigation, validation, settings, and other auxiliary controls must help the writing process rather than dictate its layout or interrupt it.

Workspace priority:

| Priority | Surface or responsibility                           | Required behavior                                                             |
| -------- | --------------------------------------------------- | ----------------------------------------------------------------------------- |
| 1        | Current authored content and active editing control | Preserve data, focus, caret, selection, and an accessible editing path        |
| 2        | Central guided document                             | Maintain readability, context, and meaningful text width                      |
| 3        | Active Field editor                                 | Keep immediately accessible while editing                                     |
| 4        | Document or authoring navigation                    | Remain discoverable; collapse or adapt when space is limited                  |
| 5        | Issues                                              | Keep critical problems discoverable without requiring a permanent wide column |
| 6        | Settings and secondary tools                        | Remain accessible without unnecessarily occupying the workspace               |

When space becomes insufficient, the application adapts auxiliary panels before sacrificing the document's usability.

Target experience:

A user can create a document, choose a template, inspect examples, select a writing style, and begin editing by activating a placeholder. The Field editor appears near the writing surface with the correct input ready for typing. The user may move, resize, dock, collapse, close where supported, and restore auxiliary panels without losing their work.

The user can also find saved documents, rename them, archive and restore them, inspect template-authoring drafts, recover earlier source checkpoints, and adjust settings without abandoning the active task.

Default usability:

The initial layout must be immediately usable without customization. A first-time user must not need to understand the window system before completing a document.

Reversibility:

Every non-destructive workspace customization has an accessible reverse operation. Docking can be reversed by floating, collapsing by restoring, and moving or resizing by subsequent adjustment or reset.

No layout operation may modify authored content.

Preserved core workflow:

Document creation, GTL parsing, template-version independence, placeholder navigation, contextual examples, live generated results, autosave, copy/export, and Template Authoring remain available without requiring users to operate floating windows manually.

Reference interpretation:

The Prompt Menu reference provides interaction and visual-design patterns. Guided must reproduce relevant behavioral qualities rather than merely copying icons or appearances.

The reference's prompt-generation data model and application-specific functionality remain outside scope.

## B01. Problems observed and user-facing consequences

The recorded problems are functional usability failures, not merely preferences about visual styling.

| Existing behavior                                        | User-facing problem                                         | Required outcome                                          |
| -------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------- |
| Placeholder answers use a narrow fixed right sidebar     | Editing is physically separated from the document           | Movable, resizable, independently controlled Field editor |
| Hiding guidance leaves an empty wide sidebar             | Reading space remains unnecessarily restricted              | True collapse with width recovery                         |
| Issues share guidance space                              | Errors cannot be positioned or managed independently        | Independent Issues panel                                  |
| Document navigation permanently consumes a left column   | Space is wasted when navigation is unnecessary              | Floating, docking, and collapsing navigation              |
| Panel controls are limited or undiscoverable             | Users cannot arrange the workspace naturally                | Consistent window controls and accessible entry points    |
| Small generated-result and editor text                   | Extended reading and editing are uncomfortable              | Immediately accessible text scaling                       |
| Templates lack meaningful search                         | Relevant templates are difficult to discover                | Ranked full-text and bounded fuzzy search                 |
| Templates lack preselection examples                     | Users must enter a template to understand its output        | Noncommittal rendered previews                            |
| Writing-style selection uses a small dropdown            | A consequential choice appears incidental                   | Prominent version selection with structural examples      |
| Placeholder identity is difficult to recognize           | Users lose the relationship between the document and editor | Consistent `$identifier` and active-field indication      |
| Browser Saved info overlays interfere with inputs        | Editing controls are obstructed                             | Browser suggestions preference                            |
| Template drafts have unclear names and history           | Saved work is difficult to retrieve                         | Dedicated authoring navigation and source checkpoints     |
| Documents support deletion but not archiving             | Users cannot reduce clutter without destroying work         | Archive, restore, filters, and Undo                       |
| Rename actions are difficult to discover                 | Users cannot easily organize records                        | Visible and accessible Rename actions                     |
| Slogans and decorative indicators occupy workspace space | The application feels promotional rather than functional    | Concise operational labels and meaningful statuses        |
| Auxiliary UI changes may disrupt editing                 | Focus, caret, or scroll position can be lost                | Shared interaction-continuity requirements                |

Unacceptable secondary failures:

A feature is defective if it performs its named primary action but causes a predictable usability failure.

Examples include a movable panel that cannot be recovered, an input that loses its caret during resizing, a collapsed panel that still consumes a full column, a historical restoration that discards newer source, or a template preview that silently changes the active document.

The implementing agent must evaluate the complete interaction, including initiation, feedback, cancellation, restoration, persistence, and failure recovery.

Feature completeness rule:

Providing a visible control is not sufficient. The control must perform the specified operation, preserve relevant state, provide feedback, and support the required pointer, keyboard, touch, and accessibility paths.

## C01. Authority, compatibility, and engineering constraints

The original specifications remain authoritative except where this change request explicitly revises them.

The new panel system replaces the original assumption that fixed navigation and guidance columns are sufficient, including the applicable restriction in original UI/UX section U05. It extends the corresponding layout, editing, navigation, settings, and accessibility contracts.

Requirement precedence:

| Situation                                                               | Governing rule                                                      |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------- |
| This change request explicitly replaces original behavior               | Follow `suggestions001-02`                                          |
| This change request extends existing behavior                           | Preserve both contracts                                             |
| This change request is silent                                           | Preserve the original requirement                                   |
| Two requirements cannot both be satisfied                               | Record and resolve the conflict explicitly                          |
| An optional design choice conflicts with a mandatory requirement        | Mandatory requirement prevails                                      |
| A reference-project implementation conflicts with Guided's domain model | Preserve Guided's model                                             |
| A visual detail is unspecified                                          | Use professional design judgment without omitting required behavior |

Normative terminology:

| Term       | Meaning                                                                           |
| ---------- | --------------------------------------------------------------------------------- |
| MUST       | Required for implementation acceptance                                            |
| MUST NOT   | Prohibited behavior                                                               |
| SHOULD     | Strong preference; an equivalent alternative requires justification               |
| MAY        | Optional capability                                                               |
| Default    | Behavior used when no valid user preference exists                                |
| Equivalent | Different implementation providing the same observable interaction and safeguards |

Descriptions of visual alternatives do not grant permission to omit required interactions.

Original invariants retained:

| Area                | Invariant                                                       |
| ------------------- | --------------------------------------------------------------- |
| Documents           | Independent instances of template versions                      |
| Template versions   | No automatic answer sharing                                     |
| Temporary documents | Untouched previews do not create saved records                  |
| Editing             | Fixed template prose remains uneditable                         |
| GTL                 | No executable procedural template logic                         |
| Rendering           | Immediate main-thread feedback                                  |
| Required fields     | Gate completed-result copy/export, not navigation               |
| Generated result    | Read-only and derived from current answers                      |
| Documents           | One current working state, no historical revision collection    |
| Authoring           | Invalid GTL source remains saveable and downloadable            |
| Template snapshots  | Saved documents retain the definitions needed to render them    |
| Persistence         | IndexedDB/Dexie remains the default                             |
| Alternative stores  | localStorage and memory-only remain supported                   |
| Autosave            | Failures preserve recoverable in-memory work                    |
| Concurrency         | Newer document/source revisions are protected from stale writes |
| Deployment          | Static, browser-based, and subdirectory-safe                    |
| Privacy             | No remote accounts, document storage service, or telemetry      |

Template Authoring exception:

This change request introduces historical source checkpoints for template-authoring drafts only.

Ordinary generated documents must not receive an automatic revision-history system.

Technology and architecture:

Continue using TypeScript, Bun, native Web Components, browser APIs, typed worker messaging, feature-oriented organization, and the current storage abstraction.

Do not introduce React, Vue, Angular, an application server, a remote database, a heavyweight desktop-window framework, or speculative application infrastructure.

Migration and compatibility:

Existing documents, answers, template snapshots, authoring drafts, storage preferences, and settings must survive the upgrade.

Migration must operate non-destructively. Invalid or unavailable records must not cause unrelated stores to be cleared.

A database upgrade failure must preserve recoverable data and report the problem rather than silently presenting an empty workspace.

## D01. Terminology and ownership

Use consistent domain terminology in implementation and documentation, while preferring task-oriented labels in the visible interface.

| Term                        | Definition                                                                             |
| --------------------------- | -------------------------------------------------------------------------------------- |
| Workspace                   | Main application context, such as Documents, Template Authoring, or full Settings      |
| Panel                       | Reusable secondary surface with independent presentation state                         |
| Panel content               | Feature-owned controls displayed inside the panel                                      |
| Panel state                 | Placement, visibility, geometry, and docking relationship                              |
| Panel focus                 | Current focus target within a panel                                                    |
| Document                    | Independent temporary or saved instance of a template version                          |
| Document navigation         | Panel displaying documents, filters, and lifecycle actions                             |
| Template definition         | GTL source describing reusable text and fields                                         |
| Template version            | Selectable text structure inside a template definition                                 |
| Writing style               | User-facing version label when the alternatives genuinely represent writing styles     |
| Template draft              | Locally editable working copy of GTL source                                            |
| Template history checkpoint | Immutable historical source snapshot associated with one draft                         |
| Authoring history           | Navigation for template drafts and their historical checkpoints                        |
| Field / placeholder         | Named editable reference such as `$action`                                             |
| Active field                | Currently selected placeholder in the applicable editing context                       |
| Field editor                | Contextual panel for editing an active placeholder                                     |
| Issues panel                | Independent presentation of current validation, storage, source, and conflict problems |
| Settings panel              | Floating/dockable presentation of effective application settings                       |
| Generated result            | Read-only rendered output from current template and answers                            |
| Floating                    | Panel overlays the workspace without reserving a permanent side column                 |
| Docked                      | Panel attached to an edge and participating in allocated layout width                  |
| Collapsed                   | Panel reduced to a compact restoration affordance                                      |
| Closed                      | Panel removed from view but accessible through an explicit open mechanism              |
| Restore control             | Visible or accessible control for expanding a collapsed panel                          |
| Desired layout              | Last deliberately chosen persistent arrangement                                        |
| Effective layout            | Arrangement currently displayed after viewport adaptation                              |

Panel-state distinction:

Collapsed and Closed are not synonyms. A collapsed panel leaves a visible compact restoration control. A closed panel is reopened through the workspace's panel-access mechanism.

Naming distinction:

| Name                 | Meaning                                           |
| -------------------- | ------------------------------------------------- |
| Document title       | User-facing name of a saved or temporary document |
| Template-draft title | User-facing name of a local authoring draft       |
| GTL `TEMPLATE:` name | Name declared inside template source              |
| GTL `VERSION:` title | Name of a template version                        |
| Download filename    | Name used for exported `.gtl` source              |

These names may coincide, but they must not be implicitly treated as the same stored property.

Domain ownership:

Panel placement and geometry belong to the workspace-layout system. Authored content remains in its owning feature. Effective text-size, input-suggestion, and application settings belong to SettingsService.

A feature may expose the same setting through several controls, but the setting must have one authoritative owner.

## E01. Reference evidence and interpretation of ambiguities

Source materials:

The supplied ZIP contains `transcript.md`, `index.html`, `provenance.json`, and 20 JPEG screenshots under `frames/`.

The recording lasts 37:15.433. The transcript begins mid-sentence, and the screenshots are sampled frames rather than a complete video reconstruction.

Do not infer unrecorded instructions or exact interactions that are not supported by available evidence.

Primary visual and interaction reference:

The Prompt Menu, C Data Structures Edition:

`D:\my-github\toys-awwtools-com\docs\public\2026-10-09-chatgpt-prompt-menu-for-break-down-prompts`

The implementing agent already has access to this reference project through the established project materials and `AGENTS.md`.

Before implementing the shared panel system, inspect the actual reference implementation and document the relevant observed behaviors.

| Reference capability     | Required investigation                          |
| ------------------------ | ----------------------------------------------- |
| Floating prompt window   | Opening, geometry, dragging, stacking           |
| Docking                  | Dock/undock controls and transition behavior    |
| Collapse                 | Edge restoration affordances and space recovery |
| Resizing                 | Resize handles, constraints, scrolling          |
| Panel text-size controls | Control placement and immediate feedback        |
| Preset cards             | Hover/focus, previews, selection states         |
| Radio controls           | Selection semantics and large click targets     |
| Checkbox rows            | Independent selection and accessibility         |
| Settings controls        | Help, focus, disabled states, feedback          |

The reference is behavioral inspiration, not a specification for Guided's internal architecture.

Resolved interpretation decisions:

| Question                                         | Binding decision                                       |
| ------------------------------------------------ | ------------------------------------------------------ |
| Left navigation collapse direction               | Left edge                                              |
| Left authoring-history collapse direction        | Left edge                                              |
| Right-docked panels collapse direction           | Right edge                                             |
| Panel docked to another supported edge           | Collapse toward its actual edge                        |
| Floating-panel collapse                          | Compact draggable floating titlebar                    |
| Layout persistence engine                        | localStorage                                           |
| Concurrent layout preference writes              | Last successful writer wins                            |
| Live cross-tab window relocation                 | Not required; must not interrupt active editing        |
| Default field editor placement                   | Floating upon placeholder activation                   |
| Generated-result duplication inside Field editor | Not required for this change request                   |
| Central Generated result                         | Mandatory and authoritative                            |
| Same-edge docking                                | Shared tabbed dock column                              |
| Automatic drag-to-dock                           | Optional; explicit docking commands mandatory          |
| Document filters                                 | Active, Archived, Recent                               |
| Recent limit                                     | Default 10, configurable 1-100                         |
| Authoring-history checkpoints                    | Explicit Save now and pre-restore recovery checkpoints |
| Ordinary-document history                        | No historical revisions                                |

User-experience completion rules:

Requirements involving focus preservation, state recovery, accessibility, layout constraints, empty states, error feedback, and browser compatibility extend the transcript's expressed usability objectives.

They are binding implementation requirements even when their exact wording or numeric defaults did not appear in the recording.

Evidence interpretation:

The screenshot ledger in Z01 records visible evidence and its corresponding requirement. Exact dimensions, unavailable interaction states, and hidden implementation details must not be inferred from screenshots alone.

When the original reference project is available, source or direct browser inspection should resolve those details.

## F01. Interface terminology and copy audit

Replace ambiguous, promotional, or decorative wording with operational labels.

Audit the desktop interface, mobile navigation, floating panels, dock tabs, settings, dialogs, tooltips, empty states, notices, and error messages.

Existing-copy replacement:

| Existing text or pattern                                        | Required disposition                          |
| --------------------------------------------------------------- | --------------------------------------------- |
| `A little structure for your thoughts.`                         | Remove                                        |
| `Private. Local. Yours.` and decorative dot                     | Remove                                        |
| Top-bar `Local to this browser` with decorative dot             | Remove; retain real save-state feedback       |
| `A little guidance`                                             | Replace with functional panel title           |
| `Field notes`                                                   | `Field editor` or `Edit field`                |
| `A little inspiration`                                          | `Examples`                                    |
| `01 / Shape your words`                                         | `Template fields` or `Edit fields`            |
| `02 / Your finished words`                                      | `Generated result`                            |
| `A little structure. Your own words.`                           | Remove                                        |
| `Start with a template, then make it unmistakably yours.`       | Remove                                        |
| Generic `Your writing space` strapline                          | Remove                                        |
| `Choose a starting point`                                       | `Templates`                                   |
| `3 templates · 7 writing styles`                                | Remove aggregate counter                      |
| `No blank-page pressure. Just one field at a time.`             | Remove                                        |
| `Template workshop`                                             | Remove                                        |
| `Give your next idea a head start.`                             | Remove                                        |
| `Write a little structure. Add a few good questions. Reuse it.` | Remove                                        |
| `Local template drafts`                                         | `Template drafts`                             |
| `Your space, your preferences.`                                 | `Settings`                                    |
| `Make yourself at home`                                         | Remove                                        |
| `Yours, by design`                                              | Remove; retain useful factual storage notices |
| Unqualified `Show` / `Hide`                                     | Replace with object-specific action           |

Preserve useful labels such as `Template Authoring`, `Writing style`, `Use example`, `Copy example`, `Save now`, and `Live template preview` where context makes them accurate.

Action vocabulary:

| Intent                                 | Standard label         |
| -------------------------------------- | ---------------------- |
| Reduce panel to compact affordance     | Collapse               |
| Expand collapsed panel                 | Restore                |
| Remove optional panel from view        | Close                  |
| Attach to left edge                    | Dock left              |
| Attach to right edge                   | Dock right             |
| Turn docked panel into overlay         | Float                  |
| Restore one panel's default placement  | Reset panel position   |
| Restore all panel arrangement defaults | Reset workspace layout |
| Open contextual placeholder editor     | Edit field             |
| Open local source drafts               | Template drafts        |
| Open historical source states          | History                |
| Open complete settings workspace       | Open full Settings     |
| Remove document from Active            | Archive                |
| Return archived document to Active     | Restore document       |
| Permanently remove record              | Delete                 |
| Change record display name             | Rename                 |

A visible icon may abbreviate an action, but its tooltip and accessible name must identify the action and target.

For example, `Collapse Field editor` is preferable to `Collapse` as an accessible name.

Status terminology:

| Situation                        | Standard visible meaning            |
| -------------------------------- | ----------------------------------- |
| Changes not yet persisted        | Unsaved changes                     |
| Persistence pending              | Saving...                           |
| Persistence confirmed            | Saved                               |
| Persistence failed               | Save failed                         |
| Record archived                  | Archived                            |
| Document restored                | Document restored                   |
| Incomplete required field        | Incomplete field                    |
| Invalid user input               | Invalid answer                      |
| Invalid GTL source               | Template contains errors            |
| No current validation problems   | No issues                           |
| Layout cannot persist            | Workspace layout could not be saved |
| Clipboard operation failed       | Copy failed                         |
| Historical source is not current | Historical version                  |
| Preview uses older valid source  | Last valid preview                  |

Functional copy preservation:

Removing promotional text must not remove necessary orientation, status, validation explanations, or irreversible-action warnings.

When a heading provides useful task context, replace it with concise functional wording rather than leaving the interface unidentified.

Copy consistency:

The same operation must use the same terminology across tooltips, panels, navigation, Settings, confirmation dialogs, and documentation.

User-facing text should avoid exposing implementation details such as repository revisions, GTL tokens, and internal storage keys unless that detail is necessary for an advanced diagnostic.

Error wording:

Errors describe what failed, what content was preserved, and what the user can do next.

Avoid blaming the user or claiming success before the underlying action is confirmed.

Visual status rule:

Decorative dots, badges, and slogans must not substitute for real state. Meaningful save, validation, conflict, and incomplete-field indicators remain available and accessible.

# File: `.specs/suggestions001-02-window-system.md`

# Guided Document Editor - Dockable Workspace and Independent Panels

Created: 2026-10-25\
Specification: `suggestions001-02`\
Status: Required UI interaction and layout contract\
Revision: 01\
Primary source intervals: 02:36-10:07, 13:19-15:24, 25:27-26:59, 30:12-30:33\
Related requirements: A01-F01, M01-Z01, original U01, U02, U05, U10, U12, H07.

## G01. Panel architecture and inventory

Replace the fixed three-column interface with a central workspace and independently controlled auxiliary panels.

The central document remains the primary content surface. Auxiliary panels must not permanently consume space when collapsed or closed.

Panel inventory:

| Panel               | Contents                                                       | Default placement       | Applicable workspace                                      |
| ------------------- | -------------------------------------------------------------- | ----------------------- | --------------------------------------------------------- |
| Document navigation | Saved documents, New Document, filters, row actions            | Docked left             | Documents, full Settings navigation                       |
| Field editor        | Active variable, question, hint, input, navigation, examples   | Floating when activated | Documents; isolated preview context in Template Authoring |
| Issues              | Required fields, GTL errors, persistence and conflict problems | Collapsed or closed     | Relevant editing context                                  |
| Authoring history   | Template drafts and historical checkpoints                     | Docked left             | Template Authoring                                        |
| Settings            | Common effective settings and access to full Settings          | Closed until opened     | All workspaces                                            |

All panels support Floating, Docked left, Docked right, and Collapsed presentation where the mode is meaningful.

The panel implementation may restrict inappropriate locations only for a documented usability or viewport constraint, not because the feature was omitted.

Panel access:

The application MUST provide a consistently available mechanism for opening every panel relevant to the active workspace.

A compact `Panels` menu, clearly labeled workspace controls, or equivalent mechanism is acceptable.

A user must not need an already open panel to discover how to reopen a closed panel.

The mechanism identifies the current panel state and offers only meaningful actions.

Opening and activation:

| Event                                  | Required behavior                                                           |
| -------------------------------------- | --------------------------------------------------------------------------- |
| Activate placeholder                   | Open/restore Field editor; select correct field and focus its value control |
| Activate filled placeholder            | Show current answer for editing                                             |
| Activate different placeholder         | Reuse Field editor; update selected field                                   |
| Open already expanded panel            | Raise/focus existing instance                                               |
| Open collapsed panel                   | Restore existing instance                                                   |
| Open closed panel                      | Reopen from the panel-access mechanism                                      |
| Open Issues                            | Show current issues without changing active document                        |
| Open Settings                          | Preserve current editing context                                            |
| Open Template drafts                   | Display authoring records without changing current source                   |
| Open Field editor without active field | Display a neutral `Select a field to edit` state                            |
| Open Issues without issues             | Display `No issues`                                                         |
| Open Template drafts without drafts    | Display `No template drafts` and New template action                        |

Panel identity:

Each panel type has one logical instance per applicable workspace context.

Repeated open actions reuse the existing instance. Docking, floating, collapsing, and restoring do not create duplicate panel content or duplicate domain state.

The Field editor may be reused for authoring previews only when preview answers and document answers remain isolated.

Default desktop layout:

On first use, Document navigation is docked left. The central document remains readable. Field editor opens floating when a placeholder is activated.

Issues is collapsed or closed with a visible issue indicator. Template Authoring uses its own navigation panel, docked left when first entered.

Settings remains available through full Settings navigation and a nonmodal panel entry point.

Valid deliberate user preferences override these defaults.

Workspace switching:

| Transition                                 | Required outcome                                                                |
| ------------------------------------------ | ------------------------------------------------------------------------------- |
| Documents to Template Authoring            | Preserve document layout and active document state; expose authoring navigation |
| Template Authoring to Documents            | Restore document navigation arrangement and previous document                   |
| Documents to full Settings                 | Preserve active document and pending edits                                      |
| Full Settings to previous workspace        | Restore previous workspace context                                              |
| Temporary responsive layout change         | Preserve desired desktop arrangement                                            |
| Open relevant panel after workspace switch | Show correct contextual content; no stale field/source references               |

Panel content remains owned by the applicable feature service. The panel system owns only presentation and layout.

## H01. Window state machine: float, dock, collapse, restore

The panel system must represent placement and visibility separately.

State model:

| Dimension          | Values                              | Responsibility                     |
| ------------------ | ----------------------------------- | ---------------------------------- |
| Placement          | Floating, Docked left, Docked right | Expanded panel location            |
| Visibility         | Expanded, Collapsed, Closed         | How the panel appears              |
| Floating geometry  | X, Y, width, height                 | Floating placement                 |
| Dock geometry      | Dock width                          | Allocated edge width               |
| Dock group         | Edge and panel membership           | Same-edge organization             |
| Stacking order     | Session z-order                     | Floating-panel foreground          |
| Effective geometry | Viewport-constrained rectangle      | Actual displayed size and position |

Impossible state combinations must be rejected or normalized.

Collapsed and Closed retain the previous valid placement needed for restoration.

State transitions:

| Action          | Starting state           | Required result                                  |
| --------------- | ------------------------ | ------------------------------------------------ |
| Dock left       | Floating / opposite dock | Expanded in left dock                            |
| Dock right      | Floating / opposite dock | Expanded in right dock                           |
| Float           | Docked                   | Expanded floating window                         |
| Collapse        | Expanded floating        | Compact floating titlebar                        |
| Collapse        | Expanded docked          | Edge restoration tab                             |
| Restore         | Collapsed                | Previous valid placement and geometry            |
| Close           | Expanded or collapsed    | Removed from view; explicit reopen entry remains |
| Reopen          | Closed                   | Previous safe placement or default               |
| Resize          | Expanded                 | New constrained dimensions                       |
| Move            | Floating                 | New constrained position                         |
| Reset panel     | Any                      | Safe default for that panel                      |
| Reset workspace | Any                      | Safe default arrangement for all panels          |

Panel controls:

A panel header shows its functional title and applicable actions.

Do not display actions that represent the already active placement, such as `Dock right` on an expanded right-docked panel.

Provide iconography, accessible names, and tooltips or command descriptions.

Collapse and Close must not use an ambiguous shared symbol.

Close availability:

Close is required for optional panels such as Issues and Settings. Collapse is the primary reduction action for Field editor and navigation.

If Close is offered for Field editor or navigation, the application must retain equally discoverable ways to reopen them.

Close and Collapse never clear answers, authoring source, saved records, or active document identity.

Dock behavior:

A docking command converts a floating overlay into a layout participant.

The workspace recomputes available width, preserving the active field, its value, and the main document's logical reading position.

Floating dimensions and dock width are remembered independently.

Floating behavior:

A floating panel overlays the workspace and may move or resize without allocating a permanent side column.

Interacting with its header or content raises it above other floating panels.

Floating panels remain below application-level modal dialogs and essential system notifications.

A click on the main document does not automatically close a floating Field editor or discard a current answer.

Collapsed docked behavior:

Collapsing a docked panel removes the full allocated width when no other expanded panel requires that dock group.

A narrow, labeled restore tab remains on the appropriate workspace edge.

The restore affordance is reachable without scrolling the main document.

The central document expands to use reclaimed space.

Collapsed floating behavior:

Collapsing a floating panel leaves a compact floating titlebar containing its name and Restore control.

The compact titlebar remains draggable and constrained to the viewport.

It does not reserve a dock column.

Restoration uses the last safe expanded floating geometry.

Multiple docked panels:

Panels docked to the same edge share a tabbed dock column.

Only one panel body in the group needs to be visible at a time. Each expanded panel retains a reachable tab.

| Event                                | Required behavior                                  |
| ------------------------------------ | -------------------------------------------------- |
| Select dock tab                      | Show corresponding panel body                      |
| Switch dock tab                      | Preserve previous panel's internal content state   |
| Resize dock group                    | Adjust shared dock width                           |
| Float one member                     | Remove it from group, preserving remaining members |
| Collapse member                      | Preserve collapsed state and restoration access    |
| Close active member                  | Select another expanded tab where available        |
| Close/collapse final expanded member | Reclaim unused dock width                          |
| Restore member                       | Rejoin its previous valid dock group               |
| Move between supported edges         | Update membership without cloning content          |

Vertical splitting inside one dock column is not required for this change request.

Independent panels:

Field editor may float while Issues docks right and navigation docks left or remains collapsed.

Each panel's geometry, visibility, and content selection remain independent.

Stacking and recovery:

Floating panels use deterministic stacking order.

A newly opened or activated panel must be visible and reachable. Another panel must not completely conceal every way to raise it.

The Panels menu provides an alternative way to activate or recover an obscured panel.

Stacking changes alone do not modify documents or persistent layout preferences.

## I01. Dragging, resizing, snapping, and interaction safety

Dragging:

Floating panels support pointer dragging from a specific titlebar grab region.

Dragging must not begin from an answer input, example text, source preview, scrollbar, or action button.

Use a movement threshold of approximately 4 CSS pixels before initiating drag.

A click without meaningful movement remains a click.

Use pointer capture and release it correctly across normal completion, cancellation, and lost capture.

| Event                            | Required behavior                            |
| -------------------------------- | -------------------------------------------- |
| Pointer down on grab region      | Prepare possible drag                        |
| Movement below threshold         | No drag                                      |
| Movement beyond threshold        | Start drag                                   |
| Pointer move during drag         | Update visual geometry                       |
| Pointer up                       | Commit settled geometry                      |
| Pointer cancel                   | End safely, preserving last valid geometry   |
| Lost pointer capture             | End safely                                   |
| Window loses focus               | End or cancel safely                         |
| Application becomes hidden       | Do not persist invalid intermediate geometry |
| Escape during keyboard move      | Cancel uncommitted move                      |
| Pointer interaction inside input | Native text-editing behavior                 |

Provide a recognizable grab handle or move cursor in the draggable region.

The interface must not capture touch interactions in a way that prevents ordinary scrolling.

Viewport constraints:

The full panel titlebar and its essential recovery/movement control should remain inside the visible viewport whenever the viewport permits.

If the panel is larger than the viewport, reduce its effective dimensions rather than allow all controls to disappear.

A window may partly extend outside the viewport during user manipulation only if the implementation maintains reliable recovery access.

Resizing:

Floating panels support horizontal and vertical resizing.

Use discoverable edges/corners and a visible lower-right resize affordance or equivalent.

Resize targets must not overlap text-selection and scrollbar regions.

Docked groups provide a discoverable width-adjustment divider.

| Panel               | Required resizing                      |
| ------------------- | -------------------------------------- |
| Field editor        | Horizontal and vertical                |
| Issues              | Horizontal and vertical                |
| Document navigation | Horizontal and vertical while floating |
| Authoring history   | Horizontal and vertical while floating |
| Settings            | Horizontal and vertical while floating |
| Dock group          | Adjustable allocated width             |

A reasonable desktop Field editor minimum is approximately 300-320 CSS pixels wide, with a practical panel minimum height of approximately 240-280 CSS pixels.

These are adaptable design baselines, not absolute constraints on small screens. Minimum sizes must never exceed the available visual viewport.

Resize continuity:

Resizing must preserve active input, caret, selection, IME composition, undo history, and current answer.

Preserve internal scroll position where possible.

If resizing hides the active input, scroll the panel body just enough to keep it visible. Do not scroll the main document unnecessarily.

Panel contents must provide internal scrolling when height is insufficient.

Keyboard alternatives:

Every mandatory move, resize, docking, collapse, and restoration operation has a keyboard-accessible path.

A panel command menu may implement the following:

| Command                 | Behavior                                    |
| ----------------------- | ------------------------------------------- |
| Move left/right/up/down | Change floating position by fixed increment |
| Resize wider/narrower   | Change width by fixed increment             |
| Resize taller/shorter   | Change height by fixed increment            |
| Center panel            | Place safely near viewport center           |
| Reset panel position    | Restore default for that panel              |
| Dock left/right         | Dock explicitly                             |
| Float                   | Restore floating placement                  |
| Collapse/Restore        | Change visibility                           |

Explicit commands are sufficient; keyboard dragging simulation is not required.

Dock snapping:

Automatic drag-to-dock is optional.

If implemented, show a visible docking target and commit docking only after a deliberate drop on that target.

Moving a window close to an edge must not trigger surprising automatic docking.

Explicit dock commands are always available.

Initial Field editor placement:

For a newly activated placeholder without a deliberate existing panel position, choose a usable placement in this order:

| Order | Candidate                                               |
| ----- | ------------------------------------------------------- |
| 1     | To the right of selected placeholder                    |
| 2     | To the left                                             |
| 3     | Above                                                   |
| 4     | Below                                                   |
| 5     | Safe predefined floating position                       |
| 6     | Responsive drawer if no floating placement is practical |

Prefer a position that does not cover the selected words, caret, or immediate writing context.

After the user deliberately moves the panel, subsequent field selections must preserve that position unless visibility recovery is necessary.

Performance:

During pointer movement and resizing, update layout presentation only.

Do not trigger GTL parsing, document saving, search reindexing, result generation, or whole-document rendering on each pointer movement.

Persist settled geometry after the operation, not every intermediate frame.

## J01. Layout persistence and validation

Workspace layout preferences use localStorage, independently of the selected storage mode for documents and template drafts.

Use stable, namespaced, schema-versioned storage, such as `guided.workspace-layout.v1`.

Persisted state:

| Property                        | Persist?                   |
| ------------------------------- | -------------------------- |
| Panel placement                 | Yes                        |
| Deliberate visibility state     | Yes                        |
| Floating rectangle              | Yes                        |
| Dock width                      | Yes                        |
| Dock edge and group             | Yes                        |
| Relevant panel arrangement      | Yes                        |
| Transient pointer position      | No                         |
| Hover/focus state               | No                         |
| Active DOM element              | No                         |
| Current caret position          | No                         |
| Document answers                | Never in layout storage    |
| GTL source                      | Never in layout storage    |
| Issue contents                  | No                         |
| Temporary responsive adaptation | No                         |
| Floating z-order                | Session-only is acceptable |

Text-scale preferences belong to SettingsService rather than layout storage.

Conceptual state:

```
type PanelPlacement = "floating" | "left" | "right";
type PanelVisibility = "expanded" | "collapsed" | "closed";

interface PanelRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PersistedPanelLayout {
  placement: PanelPlacement;
  visibility: PanelVisibility;
  floatingRect: PanelRect | null;
  dockWidth: number | null;
  dockGroupId?: string;
}

interface PersistedWorkspaceLayout {
  schemaVersion: 1;
  panels: Record<string, PersistedPanelLayout>;
}
```

The example describes required semantics rather than a mandatory runtime class hierarchy.

Desired versus effective layout:

The application maintains a distinction between the last deliberately selected layout and the currently effective viewport-constrained presentation.

Responsive changes, browser zoom, device rotation, and virtual-keyboard appearance may temporarily change effective geometry.

They do not overwrite valid desktop preferences.

When sufficient space returns, restore the desired arrangement where practical.

Write policy:

| Event                           | Persist?                                                      |
| ------------------------------- | ------------------------------------------------------------- |
| Completed drag                  | Yes                                                           |
| Completed resize                | Yes                                                           |
| Explicit Dock/Float             | Yes                                                           |
| Explicit Collapse/Restore       | Yes                                                           |
| Explicit Close                  | Yes, if closed state is persistent                            |
| Explicit reset                  | Yes                                                           |
| Open/raise temporary panel      | Only if it represents deliberate persistent visibility change |
| Select field                    | No                                                            |
| Type answer                     | No                                                            |
| Change generated result         | No                                                            |
| Update issues                   | No                                                            |
| Switch documents                | No                                                            |
| Change page focus               | No                                                            |
| Load settings                   | No                                                            |
| Restore saved layout            | No                                                            |
| Browser resize or zoom          | No                                                            |
| Automatic responsive transition | No                                                            |
| Temporary keyboard appearance   | No                                                            |

Normalize and compare the next state before writing. Do not perform a write for a no-op action.

No persistence is required during drag or resize frames.

Concurrent tabs:

The last successful layout write wins.

New page loads observe the latest stored layout.

An already open tab need not adopt a remote layout change immediately.

Remote changes must not move active windows under the pointer or disrupt editing.

The persistence unit and its write policy must be consistent. The implementation may use one versioned document or separate per-panel entries, but it must not silently merge incompatible stale geometry.

Storage failure:

If localStorage is unavailable, blocked, or full:

| Requirement       | Behavior                             |
| ----------------- | ------------------------------------ |
| Panel operation   | Continue in memory                   |
| Authored content  | Unaffected                           |
| Current layout    | Remains usable for session           |
| Notification      | Explain layout may not persist       |
| Repeated failures | Suppress repeated identical warnings |
| Recovery          | Permit retry/reset where appropriate |
| Document storage  | Independent from this failure        |

Validation and recovery:

Persisted JSON is untrusted.

| Invalid condition                    | Recovery                         |
| ------------------------------------ | -------------------------------- |
| Malformed JSON                       | Use default layout               |
| Unsupported schema version           | Use supported fallback           |
| Unknown panel ID                     | Ignore unknown entry             |
| Unknown placement                    | Default affected panel           |
| Unknown visibility                   | Default affected panel           |
| Invalid dock group                   | Restore to valid group           |
| Negative width/height                | Replace with valid dimensions    |
| Nonfinite coordinates                | Replace with safe coordinates    |
| Rectangle entirely off-screen        | Reposition visibly               |
| Oversized dimensions                 | Constrain effective dimensions   |
| Invalid dock width                   | Clamp or default                 |
| Missing optional property            | Use valid default                |
| One corrupt panel record             | Preserve other valid records     |
| All optional panels closed/collapsed | Preserve accessible entry points |

Do not clear unrelated browser data to repair layout.

Viewport recovery:

Run geometry validation at startup, workspace restoration, viewport change, zoom/orientation change where detectable, and after visual-viewport changes.

Avoid competing geometry updates during an active drag or resize. Cancel or safely complete the operation before applying new constraints.

A floating panel must retain a reachable header and usable controls.

Reset controls:

`Reset panel position` affects only the selected panel's placement and geometry.

`Reset workspace layout` restores all managed panels to default placement, dimensions, docking, and visibility.

Neither operation modifies documents, drafts, template source, text-size preferences, theme, storage mode, or other non-layout settings.

Provide the full reset in Settings and through a workspace-level mechanism reachable when panels are hidden or inaccessible.

No destructive confirmation is necessary for a layout-only reset. Display concise completion feedback.

## K01. Responsive workspace, readability, and accessibility

Central workspace priority:

The main guided document receives available reading space before optional panels.

The layout must not compress the document into a narrow, unusable strip simply to preserve several expanded docks.

A desktop reading-width target of approximately 480-560 CSS pixels is an implementation baseline where sufficient viewport space exists, not a minimum imposed on phones.

Responsive behavior:

| Available space            | Required behavior                                               |
| -------------------------- | --------------------------------------------------------------- |
| Wide desktop               | Floating and docked panels available                            |
| Standard laptop            | Maintain readable center; collapse/adjust competing docks       |
| Constrained desktop/tablet | Convert secondary panels to compact docks, drawers, or overlays |
| Narrow mobile              | Single main content canvas with accessible sheets/drawers       |
| Mobile keyboard visible    | Keep active answer and essential actions reachable              |
| Browser at 200% zoom       | Reflow controls and preserve primary workflow                   |
| Very narrow viewport       | Avoid unnecessary horizontal scrolling of ordinary text         |

Adaptation priority:

| Priority | Element              | Responsive policy                    |
| -------- | -------------------- | ------------------------------------ |
| Highest  | Active answer input  | Keep accessible                      |
| Highest  | Central document     | Preserve writing context             |
| High     | Current Field editor | Use responsive drawer when necessary |
| Medium   | Navigation           | Collapse/convert to drawer           |
| Lower    | Issues               | Collapse with issue indicator        |
| Lower    | Settings             | Convert to nonmodal overlay/drawer   |

Scroll behavior:

Panel bodies, docked regions, and central workspace scroll independently where appropriate.

Scrolling inside a panel should primarily affect its own content.

Opening or closing a panel preserves the document's logical reading position.

If reflow changes line wrapping, keep the active placeholder visible rather than blindly restoring an obsolete `scrollTop`.

Live result updates must not cause automatic jumps to unrelated document positions.

Mobile drawers:

Every drawer or sheet has a visible close/collapse control.

Escape closes it where supported by a hardware keyboard.

Backdrop taps and swipe gestures may supplement but must not replace an accessible close control.

Dismissing a drawer does not discard an answer.

Opening a field-editing drawer focuses the answer when initiated through field editing. Opening guidance solely for inspection must not unnecessarily open the software keyboard.

Virtual keyboard:

Use `visualViewport` where supported, with safe-area constraints.

The active answer, its label, and essential navigation controls must remain reachable while the software keyboard is visible.

Prevent background-page scrolling when an overlay interaction requires scroll containment.

Accessibility:

| Requirement          | Invariant                                     |
| -------------------- | --------------------------------------------- |
| Panel names          | Semantic accessible labels                    |
| Controls             | Keyboard focusable                            |
| Focus indication     | Clearly visible                               |
| Panel mode           | Exposed through appropriate semantics         |
| Collapse/Restore     | Available without pointer                     |
| Dock/Float/Resize    | Keyboard alternatives                         |
| Mobile controls      | Adequate touch targets                        |
| Text size            | Respects zoom and selected scale              |
| Motion               | Respect `prefers-reduced-motion`              |
| Screen-reader status | Concise, nonrepetitive announcements          |
| Dialogs              | Predictable focus and dismissal               |
| Field editing        | No keyboard traps                             |
| Pointer controls     | Do not block native text selection            |
| Tooltips             | Not the sole source of essential instructions |

Follow WCAG 2.2 AA target-size guidance as a baseline. Prefer approximately 40-44 CSS pixel touch targets for important mobile controls where available space permits.

Focus recovery:

Opening, collapsing, floating, docking, or closing panels must preserve a meaningful focus target.

If the focused element disappears due to a transition, move focus to the corresponding restore control, panel header, originating placeholder, or other logical target.

Do not move focus merely because live validation or save status changed.

Reduced motion:

Disable nonessential panel movement animations and smooth scrolling transitions under reduced-motion preference.

Retain immediate visible state feedback.

## L01. Specific panel contents and issue separation

Field editor:

The active Field editor displays:

| Element             | Requirement                                 |
| ------------------- | ------------------------------------------- |
| Variable identifier | Prominent `$name`                           |
| Question            | Clear field-specific prompt                 |
| Hint                | Readable contextual guidance                |
| Value control       | Real labeled input, textarea, or select     |
| Previous/Next       | No-wrap field navigation                    |
| Examples            | Selectable, readable suggestions            |
| Use example         | Applies selected example                    |
| Copy example        | Copies without changing answer              |
| Text size           | Normal/Large control                        |
| Panel header        | Placement, collapse, and applicable actions |

Immediate editing activation:

Selecting a placeholder by pointer or keyboard must open or restore the editor and make the corresponding answer control ready for typing.

The user must not need a second click merely to reach an answer input.

The field identity and selected inline token must agree.

Field switching:

| Event                       | Required behavior                        |
| --------------------------- | ---------------------------------------- |
| Select another placeholder  | Retain current value, activate new field |
| Select repeated reference   | Edit same answer                         |
| Select filled field         | Show existing answer                     |
| Return to previous field    | Restore existing value                   |
| Collapse editor             | Retain active field identity             |
| Restore editor              | Restore same applicable field            |
| Switch document             | Replace editor context safely            |
| Delete active document      | Clear stale field reference              |
| Switch to authoring preview | Use isolated preview answers             |
| No active field             | Show neutral instruction                 |

Caret behavior:

Preserve current-session caret and selection where practical.

Do not automatically select all existing text unless the initiating interaction explicitly indicates replacement.

Editing updates must preserve native undo/redo, multiline Enter, clipboard operations, Tab behavior, and IME composition.

Multiline controls must support long content through internal scrolling or practical expansion.

Field visibility:

The active placeholder remains visibly selected independently of temporary keyboard focus.

Filled and unfilled placeholders remain recognizably editable.

The editor must not disappear because a user clicks an example, tooltip, or generated result.

Issues panel:

Issues is independent of Field editor and may float, dock, collapse, or close.

| Issue category            | Example                   | Required treatment                 |
| ------------------------- | ------------------------- | ---------------------------------- |
| Incomplete required field | `$action` empty           | Normal incomplete-state indication |
| Invalid answer            | Unsupported option        | Specific validation explanation    |
| GTL source error          | Invalid directive         | Source line/position navigation    |
| Persistence failure       | Save failed               | Prominent recoverable error        |
| Concurrent edit conflict  | Stored revision changed   | Recovery choices                   |
| Clipboard/export failure  | Browser permission denied | Action-specific failure feedback   |

Required-field incompleteness must not be presented as equivalent to data loss.

Issue discovery:

Critical unresolved issues remain discoverable while Issues is closed or collapsed.

A workspace-level indicator identifies relevant current issue counts/status and opens Issues.

Issue count is based on current conditions, not historical notification events.

Issue navigation:

Activating an issue navigates to the corresponding placeholder, source line, document, or recovery action.

The target receives visible selection or focus, and existing unsaved work is preserved.

When there are no issues, show `No issues` if the panel is opened.

Do not automatically collapse a panel that the user deliberately kept expanded merely because its final issue disappeared.

Document navigation:

Contains New Document, saved-record list, Active/Archived/Recent filters, selection, Rename, Archive/Restore, and Delete actions.

It maintains separate layout state from Authoring history.

Authoring history:

Contains Template drafts, creation, draft selection, saved checkpoints, and history actions.

It does not display generated documents as source drafts.

Workspace-specific navigation:

Entering Template Authoring presents Authoring history in the primary navigation position and preserves Documents navigation state.

Returning to Documents restores the previous document-navigation arrangement.

The application provides direct navigation between these workspaces without making their histories interchangeable.

Settings panel:

The Settings panel uses the same SettingsService and schema as full Settings.

Changes take effect immediately.

Closing it does not roll back successful changes.

If preference persistence fails, distinguish the effective in-memory setting from the failed durable write.

The panel scrolls independently, remains nonmodal, and does not interrupt document editing.

# File: `.specs/suggestions001-02-template-experience.md`

# Guided Document Editor - Template Discovery, Editing, and Readability

Created: 2026-10-25\
Specification: `suggestions001-02`\
Status: Required template-selection and editing contract\
Revision: 01\
Primary source intervals: 11:19-12:39, 17:19-24:45, 31:19-32:52\
Related requirements: A01-L01, R01-Z01, original A03-A06, L00-L13, U03-U08.

## M01. Ranked full-text and fuzzy template search

Provide a visible `Search templates` input in the New Document template-selection workspace.

Search operates on the bundled GTL definitions and manifest metadata, using local processing without a remote service.

Search scope:

| Content                            | Indexed?             |
| ---------------------------------- | -------------------- |
| Template name                      | Yes                  |
| Manifest description               | Yes                  |
| Manifest category                  | Yes                  |
| Template-version name              | Yes                  |
| Literal GTL `TEXT` prose           | Yes                  |
| Placeholder questions              | Yes                  |
| Hints                              | Yes                  |
| Examples                           | Yes                  |
| Option labels                      | Yes, where available |
| Saved document answers             | No                   |
| Unpublished authoring draft source | No                   |
| Clipboard content                  | No                   |
| Previous user input                | No                   |

Searching must not evaluate GTL as executable code or interpret source text as HTML.

Template files must load relative to the configured application base path.

Search interaction:

Results update as the user types. No separate submission is required.

A clear-search control appears when the query is nonempty.

Clearing the query restores the normal manifest order.

Searching, focusing a result, or previewing it does not create, replace, or modify a working document.

Only explicit selection commits a template or template version.

Result grouping:

Each template appears once in the top-level result collection.

When a query matches a specific version, show the matching version beneath the containing template or through a clearly associated indication.

Rank the template according to its strongest relevant match.

Ranking:

| Rank | Match type                                   |
| ---- | -------------------------------------------- |
| 1    | Exact template name                          |
| 2    | Template-name prefix                         |
| 3    | Whole-word template-name match               |
| 4    | Exact or strong template-version title match |
| 5    | Manifest description/category                |
| 6    | Recognizable literal template-text match     |
| 7    | Placeholder question/hint/example            |
| 8    | Bounded fuzzy match                          |

Reward contiguous matches, word boundaries, and matches early in labels.

Penalize scattered subsequence matches and weak partial matches.

Repeated query words in long descriptions must not outweigh an exact template-title match.

Use manifest order, version order, and stable ID for deterministic tie-breaking.

Search normalization:

| Difference                   | Matching behavior                                |
| ---------------------------- | ------------------------------------------------ |
| Letter case                  | Case-insensitive                                 |
| Leading/trailing whitespace  | Ignored                                          |
| Repeated internal whitespace | Normalized                                       |
| Ordinary punctuation         | Tolerant where appropriate                       |
| Hyphens versus spaces        | Tolerant where appropriate                       |
| Accented letters             | Prefer accent-insensitive matching               |
| Multiple terms               | Prefer records satisfying all terms              |
| Minor misspellings           | Bounded fuzzy matching                           |
| Very short query fragments   | Restrict fuzzy matching to avoid false positives |
| Empty query                  | Original template order                          |

A simple normalized-text matcher with bounded edit distance or subsequence scoring is sufficient.

The application does not require a sophisticated search infrastructure.

Result presentation:

A result displays the template name and enough contextual information to explain why it matched.

If the match occurred only inside an example, hint, or version, present a short excerpt or matching-version label.

For example, searching `JSON` should find Project description through its GTL examples, even though the template name does not contain JSON.

Searching `email` should rank Thoughtful email strongly through its name.

Keyboard and touch:

| Action                         | Behavior                                           |
| ------------------------------ | -------------------------------------------------- |
| Focus search                   | Input ready for typing                             |
| Type ordinary characters       | Update query                                       |
| Press Space in search          | Insert a space; never select a result              |
| ArrowDown/ArrowUp in combobox  | Navigate highlighted suggestions                   |
| Enter on actionable result     | Activate result according to selection UI          |
| Space on focused native button | Native button activation                           |
| Escape with search popup open  | Dismiss popup without changing document            |
| Activate Clear                 | Clear query                                        |
| Touch a result                 | Explicit selection or preview according to control |
| Screen reader                  | Announce results/selection appropriately           |

Search-result updates must not recreate the search input or lose its caret, selection, or IME composition.

If the highlighted result disappears after filtering, move the highlight to a valid result or neutral state.

Loading and failures:

The search index may be built from bundled definitions on demand.

If indexing is not ready, display an appropriate loading state without blocking unrelated editing.

A failed template load is distinct from a valid search with zero matches.

A template fetch failure must not be reported as `No matching templates`.

A changed manifest or updated bundled source must cause the search index to reflect the current deployment rather than stale cached definitions.

Empty state:

Display `No matching templates` with a Clear search action.

Do not silently select the first result.

## N01. Noncommittal template previews before selection

Users must be able to inspect representative template output before creating or switching documents.

A preview is illustrative and separate from the working document.

Preview interaction:

| Event                           | Required behavior                               |
| ------------------------------- | ----------------------------------------------- |
| Pointer hover after short delay | Show concise preview                            |
| Pointer enters preview          | Keep preview open                               |
| Pointer leaves card and preview | Dismiss after short grace period                |
| Keyboard focus on card          | Make preview available and associated with card |
| Explicit Preview action         | Open stable, inspectable preview                |
| Change sample version           | Update preview only                             |
| Select text inside preview      | Native selection/copy behavior                  |
| Escape with popup active        | Dismiss preview                                 |
| Click outside nonmodal preview  | Dismiss without changing document               |
| Explicit Select/Use template    | Commit selection                                |
| Touch interaction               | Visible Preview control; no hover dependency    |

A preview opened through an explicit action remains inspectable until dismissed or superseded.

Hover previews must not flicker while moving between their source card and preview surface.

Preview contents:

Display template name, applicable version name, and `Sample output` or `Example` labeling.

The user must be able to distinguish a demonstration from an actual saved document.

For multi-version templates, provide controls to inspect each version's sample without activating that version in the working document.

Sample generation:

Use the production GTL parser and renderer.

| Source                                      | Priority                                        |
| ------------------------------------------- | ----------------------------------------------- |
| Explicit quality-controlled preview fixture | First                                           |
| Declared first `EXAMPLE` for each field     | Second                                          |
| First usable GTL `OPTION` label             | Where applicable                                |
| Missing sample value                        | Show clearly identified unresolved sample field |

Preview examples must be deterministic.

Do not generate random or AI-authored sample values at runtime.

Do not silently fabricate a completed example when required sample data is missing.

Optional fields:

Respect GTL optional-field rendering rules.

When optional values materially change a template's output, the preview may expose examples with and without those values.

An optional field must not be presented as mandatory.

Long templates:

Display a readable excerpt with an explicit way to expand or scroll.

Do not produce a tooltip larger than the usable viewport.

A preview must remain scrollable and text-selectable.

Preview placement:

Prefer a location adjacent to the selected card that does not obscure its controls.

Reposition near viewport edges.

On narrow screens, use a controlled sheet or overlay.

Invalid templates:

If a bundled template is invalid, show a clear unavailable/error state and avoid presenting it as a successfully usable template.

Preview failure must not crash the entire template selector.

Asynchronous safety:

Rapidly moving between templates may issue several preview requests.

Only the latest applicable request may update the currently displayed preview.

Discard stale results without changing the active document or selected version.

Content safety:

Use text-safe rendering. Never interpolate untrusted values through unsafe `innerHTML`.

Improved preview fixtures should be maintained alongside template definitions or in documented template metadata, not hard-coded inside individual visual components.

## O01. Prominent template-version and selection controls

A template-version choice is significant because it determines the structure of a new or related document.

The current compact Writing style dropdown is insufficient as the sole desktop presentation for templates with several alternatives.

Version chooser:

| Situation                      | Required presentation                        |
| ------------------------------ | -------------------------------------------- |
| One version                    | No large meaningless selector                |
| Two to six versions on desktop | Visible accessible selection group           |
| Larger version collection      | Scrollable list or rich selector             |
| Narrow viewport                | Compact accessible selector/dialog permitted |
| Several meaningful styles      | Title plus concise structural example        |
| Existing selected version      | Unmistakable selected state                  |

For the bundled Project description template, expose its five styles:

| Style                       | Structural emphasis                        |
| --------------------------- | ------------------------------------------ |
| Purpose + function          | What it is, what it does, why              |
| Problem + solution          | Audience/problem/solution                  |
| Input + processing + output | Input, operation, result                   |
| Features + technology       | Capabilities and implementation            |
| Structured project profile  | Audience, workflow, distinguishing details |

Each version option must include a meaningful structural pattern, example, or concise explanatory excerpt.

Simply repeating the title is insufficient.

Selection and preview separation:

Hovering, focusing, or inspecting a version does not change the working document.

Committing a version selection changes the active document/version according to the existing lifecycle.

A native radio group may commit through its ordinary selection interaction, including keyboard changes. A preview-heavy chooser may instead use a focused option plus an explicit Select action.

The chosen interaction model must be consistent and accessible.

Existing related versions:

| Situation                                            | Required behavior                                          |
| ---------------------------------------------------- | ---------------------------------------------------------- |
| Select version not yet instantiated in current group | Open empty temporary instance                              |
| Select version already instantiated in group         | Restore existing associated document                       |
| Select version with same placeholder names           | Do not share answers                                       |
| Preview another version                              | Do not switch documents                                    |
| Independently select New Document                    | Create a new document instance                             |
| Return to previous version                           | Restore its own answers                                    |
| Active field missing in new version                  | Clear stale reference; select valid field or neutral state |

A mere focus change must not create persistent document records.

Visual prominence:

Selected state must be apparent through border, indicator, text, and accessible selection semantics, not color alone.

Controls need generous click targets and descriptions.

Version selection should be visually important but not permanently occupy most of the workspace after selection.

Use compact visible tiles or a collapsible selection region when appropriate.

Reference patterns:

The Prompt Menu reference demonstrates large selectable tiles, clear native-style radio controls, and separate checkbox rows.

Use radio semantics for mutually exclusive selections and checkbox semantics for independent options.

Do not force all Settings or template choices into the same oversized control.

## P01. Placeholder representation and active field editor

Variable identity:

Unfilled placeholders must visibly use `$identifier` notation, such as `$tool`, `$action`, and `$benefit`.

The notation must be consistent in guided text, active-field identification, accessibility labels, and contextual guidance.

Filled and unfilled states:

| State              | Guided document                         | Field editor                      |
| ------------------ | --------------------------------------- | --------------------------------- |
| Unfilled required  | Clearly identified `$name` token        | Empty answer, required status     |
| Unfilled optional  | Accessible editable affordance          | Empty answer, optional status     |
| Filled             | User's answer in styled editable region | Current answer shown              |
| Active             | Strong visible selection                | Matching `$name`, question, input |
| Invalid            | Distinguishable validation state        | Error and corrective explanation  |
| Repeated reference | All occurrences represent same answer   | One underlying value              |

A filled placeholder remains recognizably editable.

Clicking or keyboard-activating it opens Field editor with the existing answer.

The `$` prefix is editor notation only; do not inject it into a user's answer or final generated prose.

Hit targets:

Short or empty placeholder regions must remain operable.

Do not require clicking a one-pixel or invisible span to activate an empty optional value.

Hover styling may indicate editability but must not automatically change active field or open the software keyboard.

Activation:

Selecting a placeholder through pointer or keyboard must:

1. Establish active field identity.
2. Update selected-state indication.
3. Open or restore Field editor if necessary.
4. Show the matching question, hint, answer, and examples.
5. Focus the applicable answer control for editing.

Selecting the same field again must not recreate its input unnecessarily.

Caret and selection:

Preserve current-session caret and selection where practical.

Do not automatically select all existing text unless an explicit replacement-editing interaction requires it.

A field input must retain native selection, clipboard, undo/redo, and IME behavior.

Repeated references:

One named placeholder has one answer within a document.

Selecting any occurrence accesses that answer.

Changing the answer updates every occurrence immediately.

All related occurrences should indicate their association with the active field.

Required-field presentation:

An untouched template is incomplete, not broken.

Use normal incomplete-field styling for missing required values.

Whitespace-only answers remain unresolved under the existing validation rules.

Do not show catastrophic error styling for ordinary incomplete templates.

Editing continuity:

Every keystroke updates the answer in memory, the guided text, Generated result, completion indicators, and current validation state immediately.

Worker saves must not delay visible updates.

Re-rendering must not replace a focused input, lose caret/selection, terminate composition, or clear native undo history.

Cross-document behavior:

When switching documents, load the new document's field context or a neutral state.

Do not leave Field editor displaying a stale value from the previous document as though it belonged to the new one.

When a selected field no longer exists after a version switch, clear the invalid reference and establish a valid selection.

Input preservation:

Do not silently rewrite entered answers, capitalization, punctuation, internal whitespace, or line breaks except where required by explicit GTL semantics.

Validation normalization is not permission to mutate the saved value.

## Q01. Examples, contextual help, text size, and generated result

Examples:

Keep `Use example` and `Copy example` separate.

| Action                         | Required behavior                                                    |
| ------------------------------ | -------------------------------------------------------------------- |
| Use example                    | Apply example to current field                                       |
| Copy example                   | Copy example without changing answers                                |
| Clipboard success              | Concise confirmation                                                 |
| Clipboard failure              | Accurate error                                                       |
| Use example on populated field | Replace only that field's answer                                     |
| Repeated reference             | All occurrences update                                               |
| Example selection              | Native selectable text                                               |
| After Use                      | Preserve usable editing context                                      |
| Undo after Use                 | Follow established editing/undo behavior where technically supported |

An example must not automatically populate a field merely because it is shown or highlighted.

Contextual help:

Provide help for controls whose effects may be unclear, including docking, floating, collapsing, restoring, version selection, archive filters, text scaling, and settings.

| Interaction                 | Behavior                                   |
| --------------------------- | ------------------------------------------ |
| Hover                       | Brief-delay help                           |
| Keyboard focus              | Accessible explanation                     |
| Explicit help action        | Stable inspectable content                 |
| Pointer enters help surface | Do not immediately dismiss                 |
| Escape                      | Close applicable popup                     |
| Touch                       | Non-hover access                           |
| Activate primary control    | Execute control, not unrelated help action |

Critical instructions must not exist only in hover tooltips.

Text-size preferences:

Provide at least Normal and Large modes.

| Preference             | Applies to                                                    |
| ---------------------- | ------------------------------------------------------------- |
| Document text size     | Central guided text and, by default, central Generated result |
| Field editor text size | Field question, answer, hints, examples                       |
| Visual density         | Spacing and layout compactness                                |
| Browser zoom           | Entire application under browser control                      |

Text-size settings belong to SettingsService.

Expose relevant controls locally on the affected surface as well as in Settings where useful.

Every representation must use the same effective setting.

Scaling behavior:

Large must produce a noticeable increase in primary reading text, approximately 20-30% relative to Normal as a design baseline.

The exact CSS values may be adjusted to preserve readability.

Changing text size must not modify stored answers, GTL source, export bytes, or unrelated visual-density preferences.

Preserve active field context and logical reading location during text reflow.

Generated result:

Rename the existing `Your finished words` section to `Generated result`.

The result remains read-only and updates immediately.

Preserve multiline formatting and meaningful whitespace according to GTL rules.

It must support ordinary text selection and copying.

Result surface:

The result must not clip long content.

It may expand with content or provide a scrollable/resizable reading area, but the complete output must remain accessible.

The central result is authoritative.

A duplicate result subsection inside Field editor is not required.

If later introduced, it must use the same renderer and remain a nonessential, independently collapsible view.

Incomplete results:

An incomplete result may remain visible with unresolved placeholders.

If all content is empty or unresolved, show a meaningful preview state rather than a confusing blank region.

Missing required fields block only completed-result copy/export actions.

Do not block saving incomplete work, switching documents, selecting templates, renaming, archiving, opening Settings, or Template Authoring.

Copy/export:

Retain:

| Action          | Format                        |
| --------------- | ----------------------------- |
| Copy text       | Plain text                    |
| Copy rich text  | Semantic HTML plus plain text |
| Export text     | UTF-8 `.txt`                  |
| Export Markdown | `.md`                         |
| Export HTML     | Safe semantic `.html`         |

Copy and export must exclude placeholder controls, highlights, guidance, validation decoration, and application chrome.

Source `.gtl` downloading remains separate and allowed even when template source is invalid.

Gating explanation:

When required fields remain unresolved, state the number or identity of missing required fields where practical.

Provide an action that selects the first unresolved field.

A disabled control must not be the only explanation.

Live rendering accessibility:

Result updates must not cause visual flicker, unexpected scroll jumps, or full-result screen-reader announcements on every keystroke.

Use appropriate concise status indications.

Representative acceptance checks:

| Scenario                             | Required result                            |
| ------------------------------------ | ------------------------------------------ |
| Search `JSON`                        | Project description found through examples |
| Search `email`                       | Thoughtful email ranks strongly            |
| Type multiword query with Space      | Space inserted normally                    |
| Clear search                         | Full collection restored                   |
| Preview different versions           | Active document unchanged                  |
| Select existing version              | Existing associated document restored      |
| Click completed field                | Current value editable                     |
| Edit repeated field                  | All occurrences update                     |
| Activate optional empty field        | Editor opens                               |
| Use example                          | Only selected field changes                |
| Copy example with denied clipboard   | Failure reported honestly                  |
| Increase central text size           | Document text visibly larger               |
| Render multiline email               | Meaningful line breaks preserved           |
| Switch documents while editor open   | No stale value                             |
| Edit with IME                        | No lost composition                        |
| Undo ordinary typing                 | Native input behavior retained             |
| Open incomplete result               | Preview shown; copy/export properly gated  |
| Switch away from incomplete document | Navigation succeeds                        |

# File: `.specs/suggestions001-02-document-authoring-lifecycle.md`

# Guided Document Editor - Document Actions and Template Authoring History

Created: 2026-10-25\
Specification: `suggestions001-02`\
Status: Required document and authoring workflow contract\
Revision: 01\
Primary source intervals: 26:59-30:12, 33:19-36:38\
Related requirements: A01-Q01, W01-Z01, original A06-A10, S02-S12, U02, U12.

## R01. Document navigation and discoverable item actions

The Documents panel displays independent documents, not chat messages or historical document revisions.

Each document retains a stable ID, title, template/version association, answers, template snapshot, and current persistence state.

Document row:

Each row provides a primary document-selection surface and secondary actions.

The primary row action must not trigger Rename, Archive, Restore, or Delete.

Action order:

| Position | Active document | Archived document |
| -------- | --------------- | ----------------- |
| First    | Archive         | Restore           |
| Second   | Rename          | Rename            |
| Last     | Delete          | Delete            |

Delete remains the final action in visual and logical action order.

Use clearly labeled icons or text.

A narrow row may use an accessible overflow menu, provided Rename, Archive/Restore, and Delete remain discoverable without hover-only interaction.

Do not use an unexplained `×` symbol for deletion.

Record identity:

Document actions operate on stable IDs rather than display titles or list indices.

Duplicate document titles are permitted.

Where identical titles exist, display supplementary metadata such as modification date or template identity to distinguish rows.

Row interaction:

| Event                              | Required behavior                              |
| ---------------------------------- | ---------------------------------------------- |
| Click title/row                    | Select document                                |
| Activate Rename                    | Open rename control only                       |
| Activate Archive                   | Archive record only                            |
| Activate Restore                   | Restore record only                            |
| Activate Delete                    | Open confirmation                              |
| Keyboard selection                 | Same semantics                                 |
| Touch action                       | Accessible without hover                       |
| Autosave updates modification time | Preserve focus and avoid disruptive list jumps |
| Filter changes                     | Do not mutate document data                    |

Document naming:

New documents receive deterministic suggested titles based on the selected template/version or existing naming policy.

Suggested names are not unique identities.

Users can explicitly rename documents.

Rename interaction:

| Event                 | Required behavior                      |
| --------------------- | -------------------------------------- |
| Activate Rename       | Focus input containing current title   |
| Enter                 | Validate and commit                    |
| Escape                | Cancel                                 |
| Save/Confirm          | Commit                                 |
| Cancel                | Preserve original title                |
| Whitespace-only input | Validation error                       |
| Duplicate title       | Allowed                                |
| Unicode/punctuation   | Preserved                              |
| Unchanged title       | No unnecessary persistence             |
| Failed save           | Preserve recoverable changed title     |
| Successful save       | Update all relevant UI representations |

Document titles have a maximum of 200 Unicode code points.

Use consistent validation in the UI and domain service.

Long titles may truncate visually in the list but must remain fully accessible through editing, tooltip, or accessible name.

Trimming for validation must be consistent. The application must not silently replace user-authored internal whitespace or punctuation.

Rename propagation:

Update the navigation row, breadcrumb, document heading, export filename suggestion, and applicable dialogs.

Renaming must not rewrite GTL source, change document ID, alter answers, or create a new related version.

Temporary documents:

Explicitly changing a suggested document title is meaningful user input and makes the temporary document eligible for persistence.

Opening Rename, focusing the title, or confirming an unchanged suggested title must not create a saved document.

Navigation with incomplete fields:

Required-field incompleteness blocks result copy/export only.

It does not prevent:

| Action                             | Allowed? |
| ---------------------------------- | -------- |
| New Document                       | Yes      |
| Select another document            | Yes      |
| Change template/version            | Yes      |
| Open Settings                      | Yes      |
| Open Template Authoring            | Yes      |
| Rename                             | Yes      |
| Archive                            | Yes      |
| Save incomplete working state      | Yes      |
| Export incomplete generated result | No       |
| Copy incomplete generated result   | No       |

When navigating away, capture the latest in-memory state and attempt persistence under the existing save policy.

An asynchronous save must not freeze navigation.

If persistence fails, preserve recoverable work and display the appropriate failure state.

Deletion:

Delete is permanent and requires explicit confirmation for both Active and Archived documents.

The confirmation identifies the exact record, including supplementary information when duplicate titles exist.

Cancel leaves the record and selection unchanged.

Confirm removes only the identified document.

Delete aftermath:

After successful deletion, remove the row and clear any stale active-field reference.

Select the next suitable visible document or show the New Document workspace.

No editor may continue writing into a deleted record.

Delete failure:

If persistence fails, retain the record visibly and provide a retry or recovery path.

A pending older autosave must not recreate a successfully deleted document.

If another tab already deleted the record, reconcile the stale local view without recreating it.

## S01. Archive state, filtering, and restoration

Archiving is a non-destructive lifecycle transition, distinct from deletion.

Archived documents preserve ID, title, answers, template snapshot, creation time, modification time, and storage origin.

Lifecycle:

```
ACTIVE   -> Archive -> ARCHIVED
ARCHIVED -> Restore -> ACTIVE

ACTIVE   -> Delete + confirmation -> DELETED
ARCHIVED -> Delete + confirmation -> DELETED
```

Archive and Restore do not create new document instances or historical revisions.

Archive interaction:

Archive operates without a confirmation dialog.

On successful archive, show `Document archived` with an Undo action.

Undo restores the same record and identity.

The Archived filter provides the permanent restoration mechanism after the temporary Undo affordance expires.

Restore interaction:

Restore requires no confirmation.

A restored document returns to Active without duplication.

Display feedback such as `Document restored` and, when the current filter no longer displays the record, provide a way to view Active.

Filters:

Exactly one document filter is selected at a time.

| Filter   | Exact behavior                                                |
| -------- | ------------------------------------------------------------- |
| Active   | All non-archived saved documents, most recently updated first |
| Archived | All archived saved documents, most recently updated first     |
| Recent   | Newest N active documents, most recently updated first        |

Default filter: Active.

Remember the last deliberately selected filter as a lightweight browser UI preference, independent of document storage.

Opening New Document must not silently change or persist the selected filter.

Recent limit:

Default: 10.

Configurable in Settings as `Recent documents limit`.

Valid range: integer 1-100 inclusive.

Reject or normalize invalid, empty, fractional, negative, or out-of-range entries with clear feedback.

Changing the limit affects presentation only.

Older records remain stored and visible in Active.

Ordering:

Use descending `updatedAt` with a stable ID tie-breaker.

Content/title modifications affect `updatedAt`.

Archiving and restoration use their separate lifecycle state/timestamp and do not automatically masquerade as content edits.

Background autosave must not cause disruptive row movement while the user is interacting with the list.

Filter empty states:

| Filter   | Empty state           | Available action |
| -------- | --------------------- | ---------------- |
| Active   | No active documents   | New Document     |
| Archived | No archived documents | View Active      |
| Recent   | No recent documents   | View Active      |

Archiving the selected document:

When the active document is archived from Active, select the next visible active document in list order.

If none exists, show the untouched New Document selector.

Do not lose unsaved answers during the transition.

Editing archived documents:

An archived document may be opened, read, edited, copied, and exported under ordinary validation rules.

Editing does not automatically restore it.

Display an `Archived` status and direct Restore action near the active document title.

Archive status and save state remain independent. An archived document may have unsaved changes.

Archive persistence:

An archive operation must include the latest coherent document state.

Do not allow an older pending autosave to revert the archive state or overwrite newer answers.

The UI may update optimistically only when previous state is recoverable and failures are handled accurately.

Data model:

Add an archive property, such as `archivedAt?: string` or an equivalent typed representation.

Legacy records without the property are Active.

Archive state must remain independent of temporary-document flags, GTL source, and template-version relationships.

All supported repository adapters must implement consistent archive behavior.

Storage modes:

| Mode         | Archive persistence |
| ------------ | ------------------- |
| IndexedDB    | Persistent          |
| localStorage | Persistent          |
| Memory only  | Session-only        |

Do not imply memory-only archives survive reload.

Restore and deletion correctness:

Restore preserves document identity and content.

Delete removes only the identified record after confirmation.

Archiving must never schedule automatic deletion or expiration.

## T01. Separate Template Authoring navigation and history

Template Authoring has an independent left-side navigation system for local source drafts and their historical checkpoints.

It is not a renamed Documents list.

Two-layer model:

| Layer               | Meaning                                                          |
| ------------------- | ---------------------------------------------------------------- |
| Template drafts     | Independent editable GTL source projects                         |
| History checkpoints | Immutable prior source snapshots belonging to a particular draft |

A template draft has one current working state and zero or more historical checkpoints.

Historical checkpoints are not GTL `VERSION:` definitions and do not represent generated documents.

Draft list:

Each draft row identifies the stable draft ID through its internal action target and presents the display title, modification time, and save state.

The selected draft is clearly indicated.

The active draft's history is available through a `History` action or expandable history region.

Draft actions:

| Action                | Required behavior                                |
| --------------------- | ------------------------------------------------ |
| New template          | Create independent temporary source draft        |
| Open draft            | Load its current working source                  |
| Rename draft          | Change display title only                        |
| Save now              | Flush current source; checkpoint if changed      |
| History               | Show checkpoints for selected draft              |
| Delete draft          | Confirm removal and checkpoint consequences      |
| Download .gtl         | Export exact current source                      |
| Restore checkpoint    | Safely replace current working source            |
| Open bundled template | Inspect or create editable local copy explicitly |

Temporary authoring drafts:

Opening New template alone must not generate unnecessary persistent empty records.

Meaningful source editing, explicit naming, or deliberate saving establishes a persistent draft according to the authoring lifecycle.

The rule must be implemented consistently with the original temporary-draft design.

Draft ordering:

Order drafts by recent meaningful modification with stable tie-breaking.

Updating save status must not unexpectedly move the selected row during an active interaction.

History presentation:

The current working source is always distinguishable from historical snapshots.

Checkpoints appear newest first and display their timestamp, optional label, and whether they were explicitly or automatically created.

Avoid exposing opaque checkpoint IDs as the primary user-facing label.

Checkpoint policy:

| Event                          | Update current state          | Create checkpoint                        |
| ------------------------------ | ----------------------------- | ---------------------------------------- |
| Source typing                  | Yes                           | No                                       |
| Regular autosave               | Persist current source        | No                                       |
| Save now with changed source   | Persist current source        | Yes                                      |
| Save now with identical source | Ensure saved                  | No duplicate                             |
| Switch drafts                  | Flush current state           | No automatic checkpoint                  |
| Navigate away                  | Flush current state           | No automatic checkpoint                  |
| Open checkpoint                | No                            | No                                       |
| Rename draft                   | Update draft title            | No source checkpoint                     |
| Download source                | No mutation                   | No                                       |
| Restore checkpoint             | Replace current source safely | Pre-restore recovery checkpoint required |
| Source unchanged               | No unnecessary mutation       | No duplicate                             |

Regular autosave must never produce a historical checkpoint per keystroke or interval.

Save now semantics:

`Save now` flushes the current source to the selected storage engine.

If its exact content differs from the latest relevant checkpoint, create a new immutable checkpoint.

If identical, do not create a duplicate. Report that the current source is already saved.

The interface must accurately distinguish successful current-state persistence from successful checkpoint creation.

Checkpoint data:

Each checkpoint contains a stable unique checkpoint ID, draft ID, exact source snapshot, creation timestamp, origin/creation type, and optional label.

Its identity is distinct from the draft's optimistic-concurrency revision and from GTL `VERSION:` names.

Exact source comparison:

Deduplicate using exact source equality or a hash of exact source bytes with appropriate equality verification.

Do not normalize indentation, whitespace, or line endings before deciding source equality.

GTL whitespace may be semantically meaningful.

Retention:

Keep the current working source separately from history.

Default automatic checkpoint retention is 25 per draft.

Explicitly saved checkpoints are protected from silent automatic pruning. They may be retained separately, subject to available storage and a clearly documented future deletion policy.

The implementation must not silently discard named or deliberately saved checkpoints merely because the automatic retention limit was reached.

Checkpoint storage failures must not discard the current source.

Read-only history inspection:

Opening a checkpoint displays its source in a clearly marked historical view.

It must not replace the current draft, mark it dirty, initiate autosave of historical source, or mutate history.

Provide `Restore this version` and `Back to current draft` actions.

Historical content is not directly editable.

Restoration sequence:

Restoration must proceed through a safe, deterministic operation:

| Step | Required action                                                                            |
| ---- | ------------------------------------------------------------------------------------------ |
| 1    | Capture latest in-memory current source                                                    |
| 2    | Check whether current source differs from selected checkpoint                              |
| 3    | Create/verify recoverable pre-restore checkpoint if different                              |
| 4    | Persist required recovery state successfully, or provide explicit non-destructive fallback |
| 5    | Apply historical source as new current working state                                       |
| 6    | Preserve original checkpoint unchanged                                                     |
| 7    | Update editor, diagnostics, preview, and save state                                        |
| 8    | Provide clear restoration feedback                                                         |

If required recovery persistence fails, do not silently overwrite the current source.

Reversal:

The previously current source must remain accessible through history or a dedicated recovery entry.

Restoration must not destroy the ability to return to the pre-restore state.

Missing checkpoints:

If a selected checkpoint is no longer available, preserve the current draft and show an error with return-to-current or refresh-history action.

Deleting drafts:

Provide a discoverable Delete draft action with confirmation.

The confirmation identifies the draft and explicitly states whether its checkpoints will also be deleted.

Deletion must not remove a deployed bundled template or any generated document.

Deleting individual checkpoints is optional for this release. Draft deletion and checkpoint-retention behavior are mandatory.

Empty states:

| Situation                | Message/action                                 |
| ------------------------ | ---------------------------------------------- |
| No drafts                | `No template drafts` with New template         |
| Draft has no checkpoints | `No saved versions yet`                        |
| Save now available       | Explain saved versions are created by Save now |
| Missing checkpoint       | Explain unavailable version and recovery       |
| Storage failure          | Save failed with Retry                         |
| Memory-only mode         | Explain history is session-only                |

Save feedback:

After Save now, display the draft title, accurate success state, and a direct way to access Template drafts.

The persistent draft header must retain save status after transient notifications disappear.

## U01. Names, template metadata, and authoring actions

Template source names, local draft names, version titles, and exported filenames are separate concerns.

Name ownership:

| Name                 | Source           | Editing action                                     |
| -------------------- | ---------------- | -------------------------------------------------- |
| Draft display title  | Authoring record | Rename draft                                       |
| Template source name | GTL `TEMPLATE:`  | Source editor / Template name                      |
| Version title        | GTL `VERSION:`   | Source editor                                      |
| Download filename    | Export operation | Derived safe filename or explicit filename control |

These names must not synchronize automatically without an explicit action.

Default draft title:

Use a clear generic title such as `Untitled template`.

Provide Rename adjacent to the visible title and in the draft-history row.

A renamed draft keeps its stable ID.

Duplicate draft display titles are allowed and must not cause records to merge or overwrite each other.

Draft rename behavior:

Follow the same interaction principles as document rename:

| Event                 | Behavior                        |
| --------------------- | ------------------------------- |
| Activate Rename       | Focus prefilled title input     |
| Enter                 | Commit valid title              |
| Escape                | Cancel                          |
| Whitespace-only title | Reject with explanation         |
| Duplicate title       | Allow                           |
| Unicode/punctuation   | Preserve                        |
| No change             | No unnecessary write            |
| Save failure          | Preserve recoverable new title  |
| Success               | Update row, heading, breadcrumb |

Apply the same 200-code-point display-title maximum unless a more restrictive documented domain constraint exists.

Template name control:

Provide a labeled `Template name` action/control that edits the GTL `TEMPLATE:` value when it can be located unambiguously.

If exactly one valid directive is identifiable, modify only its value.

Preserve unrelated source lines, indentation, examples, versions, and line endings.

Do not rewrite or reformat the complete template merely to rename it.

Invalid source:

If source is missing the declaration, contains ambiguous duplicate declarations, or cannot be safely parsed for this operation, disable the direct rename action or report a precise failure.

Offer `Go to source` where possible.

The user must still be able to edit the GTL text manually and rename the local draft independently.

Explicit synchronization:

An optional `Use source name for draft` action may copy the GTL name into the draft display title.

Do not silently synchronize values on every source edit.

Bundled template identity:

Renaming a local draft or its `TEMPLATE:` directive must not modify the deployed manifest's stable ID or publish a new template.

Publishing continues to require developer registration and deployment.

Template Authoring workspace:

Retain the GTL source editor, bundled-template selector, local draft selection, syntax highlighting, live diagnostics, and production-renderer-backed Live template preview.

Display the active draft title, save status, and Rename action near the editor.

Provide direct access to Template drafts/History.

Opening bundled templates:

Distinguish inspection from creation of a local editable copy.

Repeatedly opening the same bundled template for inspection must not create unnecessary duplicate saved drafts.

Use a clear `Create editable copy` action or equivalent explicit workflow.

Editor continuity:

Source editing must preserve indentation, line breaks, selection, undo/redo, caret position, and scroll position through ordinary syntax-highlight and diagnostic updates.

Long source files require a practical scrollable or resizable editing surface.

Preview validity:

When current source is invalid, show diagnostics and a clearly invalid current-preview state.

If displaying a last-known-valid rendering, label it `Last valid preview` and indicate that it does not represent current source.

Do not display `Valid GTL` while presenting a stale preview for invalid current source.

Download behavior:

`Download .gtl` exports the exact current in-memory source, including invalid text.

It must not silently export the last valid version.

Use a safe `.gtl` filename and preserve source bytes/line endings according to the export implementation.

Downloading does not publish, delete, or otherwise modify the local draft.

## V01. Data safety, interactions, and recovery across lifecycles

At minimum, the application maintains independent categories for documents, authoring drafts, historical checkpoints, effective settings, and workspace layout.

State ownership:

| Operation            | Invariant                                                 |
| -------------------- | --------------------------------------------------------- |
| Rename document      | Same document ID and answers                              |
| Archive document     | Same ID, answers, template snapshot                       |
| Restore document     | Same record restored                                      |
| Delete document      | Only identified record removed                            |
| Rename draft         | Same draft ID and source                                  |
| Edit GTL source name | Only intended directive changes                           |
| Save checkpoint      | Current draft remains editable                            |
| View checkpoint      | Current draft unchanged                                   |
| Restore checkpoint   | Historical snapshot unchanged; previous state recoverable |
| Delete draft         | No unrelated documents/templates removed                  |
| Change storage mode  | Existing stores not implicitly deleted                    |
| Reset layout         | No authored data modified                                 |
| Switch workspace     | Pending edits retained or safely persisted                |
| Change text size     | Authored values unchanged                                 |

Asynchronous revision protection:

Every asynchronous save result must correspond to the exact submitted record and revision.

A stale response cannot replace newer in-memory content, clear a newer dirty state, or falsely mark newer content as saved.

Archive/delete concurrency:

Coordinate pending saves with archive and delete operations.

An older save must not reverse archive state or recreate a deleted document.

Template history concurrency:

Concurrent checkpoint creation must preserve unique IDs and immutable source snapshots.

A stale tab must not silently overwrite another tab's newer source or prune unrelated checkpoints.

Detected conflicts follow the application's existing recovery model.

Layout exception:

Only layout preferences use last-writer-wins without authored-content conflict protection.

Document and template source data must continue using revision-aware persistence.

Storage-mode behavior:

Documents, authoring drafts, and applicable checkpoints honor the configured content storage mode.

Layout and global settings use their separately defined preference persistence.

Memory-only mode must not falsely promise durable recovery.

Quota failures:

Current draft persistence and historical checkpoint creation may fail independently.

If a checkpoint cannot be stored but the current source was saved, report that distinction.

Do not discard current source because optional historical storage failed.

Malformed data:

Reject or isolate invalid records non-destructively.

Do not clear an entire store because one entry is malformed.

Preserve recoverable raw data where practical and do not expose private source or answer text in diagnostic logs.

Migration:

| Legacy state                                 | New behavior                                      |
| -------------------------------------------- | ------------------------------------------------- |
| Document without archive property            | Active                                            |
| Existing document answers                    | Preserved                                         |
| Existing template snapshot                   | Preserved                                         |
| Existing authoring draft without checkpoints | Current draft with empty history                  |
| Existing draft source                        | Preserved exactly                                 |
| Existing settings                            | Preserve with safe defaults for new fields        |
| Existing storage mode                        | Preserve                                          |
| No layout preference                         | Default workspace layout                          |
| Invalid layout preference                    | Recover layout only                               |
| Existing GTL files                           | Continue parsing under original language contract |

Test migrations with realistic legacy records.

A new empty database is not sufficient to verify migration.

Representative lifecycle acceptance:

An author opens Template Authoring, edits source into an invalid GTL state, selects Save now, sees the named draft in Template drafts, navigates elsewhere, and returns.

The invalid source remains intact, diagnostics remain available, and `.gtl` downloading works.

The author renames the local draft, separately changes its `TEMPLATE:` value, saves another checkpoint, inspects an earlier version, and restores it while retaining the previously current source as recoverable history.

No generated document is created or modified by this process.

Separately, a document user renames a document, archives it without confirmation, undoes the archive, archives it again, locates it under Archived, edits it without restoration, restores it, and finally deletes it with explicit confirmation.

The original document identity and answers survive every non-destructive transition.

# File: `.specs/suggestions001-02-settings-implementation-and-acceptance.md`

# Guided Document Editor - Settings, Engineering, Validation, and Evidence

Created: 2026-10-25\
Specification: `suggestions001-02`\
Status: Implementation and acceptance contract\
Revision: 01\
Primary source intervals: 06:59-10:07, 12:39, 14:00-17:19, 24:25-25:27, 30:12-33:19\
Evidence: All 20 supplied reference frames\
Related requirements: A01-V01 and unaffected `suggestions001-01` contracts.

## W01. Unified Settings page, Settings panel, and local controls

Retain the dedicated full Settings workspace.

Add an independently openable, movable, dockable, resizable, and collapsible Settings panel for adjusting preferences without leaving the active document or authoring draft.

This is a second presentation of the existing settings system, not a separate settings implementation.

Settings accessibility:

Every major workspace must expose a discoverable Settings entry point.

Opening Settings as a panel must not replace the active document, current draft, source-editor position, or pending edits.

Repeatedly opening Settings must reuse the same logical panel instance.

A collapsed Settings panel restores when activated.

Single source of truth:

The full Settings page, floating Settings panel, and panel-local controls use the same typed/declarative settings schema and SettingsService.

| Requirement            | Invariant                             |
| ---------------------- | ------------------------------------- |
| Settings defaults      | Defined once                          |
| Settings validation    | Defined once                          |
| Effective values       | Defined once                          |
| Persistence            | One authoritative settings pathway    |
| Cross-tab propagation  | Existing SettingsService contract     |
| Panel-local controls   | Read/write same effective setting     |
| Full Settings controls | Reflect changes from other surfaces   |
| Worker configuration   | Updated when relevant settings change |
| Invalid value          | Rejected consistently everywhere      |

Do not create independent state stores for equivalent settings.

Compact Settings panel:

| Category   | Required compact presentation       |
| ---------- | ----------------------------------- |
| Appearance | Theme and visual density            |
| Editing    | Browser input suggestions           |
| Reading    | Document and Field editor text size |
| Workspace  | Reset workspace layout              |
| Navigation | Open full Settings                  |

Storage mode, autosave interval, detailed Diagnostics, and other less frequently adjusted options may remain in full Settings.

If a compact control changes a sensitive or consequential setting, preserve the same explanation and safeguards as the full Settings interface.

Full Settings:

Continue exposing Appearance, Editing, Storage, and Diagnostics.

Add new preferences to their appropriate categories.

| Setting                       | Category             |
| ----------------------------- | -------------------- |
| Browser input suggestions     | Editing              |
| Document text size            | Appearance / Reading |
| Field editor text size        | Appearance / Reading |
| Recent documents limit        | Editing / Documents  |
| Reset workspace layout        | Workspace            |
| Existing storage mode         | Storage              |
| Existing autosave interval    | Storage              |
| Existing diagnostics controls | Diagnostics          |

A separate visual grouping may be added if it improves discoverability, but the underlying setting ownership must remain stable.

Panel-local settings:

Text-size controls appear on their applicable reading surfaces.

The selected value must match SettingsService.

Changing it locally updates full Settings if mounted.

Changing it in full Settings updates every currently mounted local representation.

Control semantics:

| Setting type                        | Preferred control                       |
| ----------------------------------- | --------------------------------------- |
| Boolean state                       | Checkbox or switch                      |
| Small mutually exclusive choice set | Radio group or selection tiles          |
| Larger choice set                   | Accessible select/listbox               |
| Numeric bounded preference          | Validated numeric input                 |
| Immediate recovery action           | Clearly labeled button                  |
| Explanation                         | Visible help or accessible info control |

Do not implement immediate actions as persistent Boolean switches.

Disabled controls must explain why they are unavailable.

Immediate application:

Valid setting changes update effective in-memory state immediately.

Persistence failure must not silently revert user-visible controls or falsely promise durable storage.

Report failure and retain the effective session value where safe.

Interaction continuity:

Changing a setting must not unnecessarily recreate active input elements, move the caret, discard undo state, close unrelated panels, or scroll the document to an unrelated position.

Reset workspace layout:

This command resets panel geometry, placement, docking, and visibility to the defined defaults.

It must not reset theme, text size, browser suggestions, storage mode, autosave, documents, drafts, checkpoints, or other content preferences.

Do not label it simply `Reset` when users might mistake it for resetting all settings or deleting data.

Cross-tab behavior:

Settings propagate through the existing supported storage-event/BroadcastChannel mechanism.

Applying remote setting changes must not destroy local editing state or interrupt an active drag/resize operation.

Layout preferences follow their separate last-writer-wins contract.

## X01. Browser input-history/autocomplete preference

Add an Editing setting named `Browser input suggestions`.

Description:

> Allow the browser to suggest previously entered text. Turning this off requests that the browser hide saved-input suggestions; some browsers or extensions may ignore the request.

Default: On / browser controlled.

When On, Guided does not apply an autocomplete-suppression override.

When Off, Guided requests suppression using appropriate native input attributes, including `autocomplete="off"` where supported.

Control scope:

| Input                          | Apply preference                                                           |
| ------------------------------ | -------------------------------------------------------------------------- |
| Single-line placeholder answer | Yes                                                                        |
| Multiline placeholder answer   | Where applicable                                                           |
| Document rename                | Yes, where relevant                                                        |
| Template-draft rename          | Yes, where relevant                                                        |
| Template name control          | Yes, where relevant                                                        |
| Template search                | Preserve search semantics; do not indiscriminately disable useful behavior |
| GTL source editor              | Preserve source-editor semantics                                           |
| Native GTL choice select       | Preserve native selection semantics                                        |

The setting must not affect Guided's own examples, hints, GTL options, or field navigation.

Effective behavior:

| Preference                          | Application behavior                                                  |
| ----------------------------------- | --------------------------------------------------------------------- |
| On                                  | Remove Guided's suppression override; allow ordinary browser behavior |
| Off                                 | Apply appropriate autocomplete-suppression requests                   |
| Browser ignores Off                 | Do not claim guaranteed suppression                                   |
| Setting changes while input focused | Update attributes without recreating input                            |
| New applicable input created        | Apply current effective preference                                    |

State preservation:

Changing this preference must not clear values, focus, caret, selection, IME composition, or native undo state.

Apply it to existing applicable controls and newly created controls.

Platform limitations:

Browser autocomplete and Saved info overlays are controlled partly by the browser, extensions, and password managers.

The application cannot guarantee that every browser-controlled popup disappears.

Do not use aggressive workarounds such as randomly renaming fields on every render, intercepting private browser interfaces, or disrupting clipboard/IME behavior.

Data protection:

The setting must not erase browser history, clear document content, change autosave, remove GTL examples, or transmit previously entered values.

It follows the existing settings persistence and cross-tab propagation contract.

Verification:

Test that the correct native attributes are applied and removed.

Treat actual browser-popup suppression as browser-dependent rather than a universal release guarantee.

## Y01. Architecture, implementation boundaries, and rollout

Extend the existing application through narrowly scoped feature changes.

Do not replace the current architecture with a new framework or monolithic controller.

Feature ownership:

| Capability                    | Owner                                       |
| ----------------------------- | ------------------------------------------- |
| Panel modes and geometry      | Platform window-management module           |
| Layout preference persistence | Platform layout repository                  |
| Document state and actions    | Documents feature                           |
| Archive filtering             | Documents feature                           |
| Template search and ranking   | Templates feature                           |
| Template previews             | Templates feature                           |
| Version selection             | Documents/Templates UI                      |
| Placeholder editing           | Documents/Templates UI and domain services  |
| Template-draft lifecycle      | Template Authoring feature                  |
| Historical checkpoints        | Template Authoring feature                  |
| Effective settings            | SettingsService                             |
| Issue presentation            | Reusable panel UI                           |
| Issue detection               | Owning domain feature                       |
| Clipboard and export          | Export feature                              |
| IndexedDB persistence         | Storage coordinator and worker repositories |

Recommended operations:

Use meaningful operations such as:

```
dockPanel()
floatPanel()
collapsePanel()
restorePanel()
closePanel()
resetPanelPosition()
resetWorkspaceLayout()
validatePersistedLayout()

archiveDocument()
restoreDocument()
renameDocument()

renameAuthoringDraft()
createAuthoringCheckpoint()
restoreAuthoringCheckpoint()
deleteAuthoringDraft()

searchTemplates()
rankTemplateMatches()
renderTemplatePreview()
```

These names illustrate domain intent. They do not prescribe a mandatory class hierarchy or unnecessary forwarding layers.

Presentation state isolation:

The panel manager owns visibility, placement, dimensions, docking, stacking, and layout recovery.

It must not independently store document answers, GTL source, current save revisions, or effective settings.

State ownership table:

| State                            | Authoritative owner     |
| -------------------------------- | ----------------------- |
| Document answers/title           | Documents               |
| Active document/version identity | Documents               |
| GTL definitions/parser           | Templates               |
| Draft source                     | Template Authoring      |
| Checkpoint history               | Template Authoring      |
| Current validation issues        | Relevant domain feature |
| Issues panel visibility          | Panel manager           |
| Panel geometry                   | Panel manager           |
| Text-size preferences            | SettingsService         |
| Browser suggestions preference   | SettingsService         |
| Storage engines                  | Storage coordinator     |
| Clipboard/export                 | Export                  |

Do not create shadow copies merely because several panels display the same information.

Testable pure logic:

Keep the following independently testable where practical:

| Logic                         | Required testability   |
| ----------------------------- | ---------------------- |
| Panel state transitions       | Without DOM            |
| Geometry clamping             | Without DOM            |
| Layout validation             | Without DOM            |
| Search normalization/ranking  | Without mounted UI     |
| Archive filtering             | Without mounted UI     |
| Checkpoint equality/retention | Without mounted UI     |
| Save-revision acceptance      | Independently testable |
| Keyboard boundary rules       | Independently testable |

Event and rendering safety:

Input changes remain immediately visible from the main-thread perspective.

Panel movement must not trigger full-document rendering or data persistence per pointer frame.

Avoid remounting active text inputs during ordinary updates.

Every asynchronous result that could update UI must verify that its associated document, draft, version, or request context remains current.

Stale search previews, old save responses, and obsolete navigation results must not overwrite newer state.

Component lifecycle:

Register and release event listeners, observers, pointer capture, and other resources according to component lifecycle.

Repeated panel opening/closing must not accumulate duplicate handlers or trigger repeated actions.

Identity:

Panels, documents, drafts, checkpoints, and actionable issues use stable identifiers.

Display names and list indices must not serve as persistent identity keys.

Security:

Never render untrusted authored content using unsafe HTML interpolation.

Template source, names, answers, examples, and preview fixtures must use safe text handling.

The GTL language must not gain executable runtime scripting.

Failure separation:

| Failure                    | Required recovery                                |
| -------------------------- | ------------------------------------------------ |
| Layout storage unavailable | Continue in-memory layout                        |
| Invalid geometry           | Recover affected panel                           |
| Document save fails        | Preserve document and allow retry                |
| Draft save fails           | Preserve source and allow retry                  |
| Checkpoint save fails      | Preserve current source; explain history failure |
| Template parse fails       | Preserve editable source; show diagnostics       |
| Search index fails         | Preserve active document; report loading failure |
| Clipboard fails            | Preserve document; report action error           |
| Export fails               | Preserve document; report action error           |
| Concurrent modification    | Preserve recoverable local state                 |

Migration:

Use the centralized Dexie schema and explicit upgrade logic for new fields or checkpoint tables.

Where transactions are supported, upgrades must be atomic.

Do not silently clear stores when a record is invalid.

Existing settings receive safe defaults for new fields.

Layout preferences use a separate versioned localStorage key.

Existing GTL files and manifests remain compatible.

Deployment:

Retain static, subdirectory-safe deployment and relative asset loading.

Template source, search index, preview fixtures, worker assets, and other resources must load correctly beneath a nested application path.

No backend, remote account, telemetry, or mandatory runtime npm dependency is introduced.

New icons or third-party assets require appropriate licensing and attribution.

Implementation sequence:

| Phase | Work                                                                                 |
| ----- | ------------------------------------------------------------------------------------ |
| 1     | Panel state model, geometry, localStorage, first Field editor floating interaction   |
| 2     | Docking, collapsing, restoration, focus and keyboard behavior                        |
| 3     | Convert Issues, navigation, authoring history, and Settings to shared panel shell    |
| 4     | Terminology cleanup, text scaling, field identity, shared interaction controls       |
| 5     | Template search, ranking, noncommittal previews, version chooser                     |
| 6     | Document Rename, Archive, Restore, filters, schema migration                         |
| 7     | Template-draft naming, checkpoints, safe restoration, deletion                       |
| 8     | Browser suggestions setting, responsive adaptations, accessibility                   |
| 9     | Automated and real-browser testing, compatibility verification, documentation review |

Sequencing is advisory. All mandatory behavior remains required for completion.

The final system must not be considered complete merely because the first draggable Field editor works.

## Z01. Acceptance scenarios, evidence ledger, consolidated decisions, and definition of complete

Acceptance evaluates complete interactions, not just component existence.

A test passes only when its stated behavior, state preservation, feedback, accessibility, and applicable persistence/recovery conditions are satisfied.

### Panel acceptance matrix

| ID  | Scenario                                     | Required result                                                       |
| --- | -------------------------------------------- | --------------------------------------------------------------------- |
| P01 | Activate `$tool` in fresh desktop workspace  | Field editor opens near document; correct input receives usable focus |
| P02 | Drag Field editor from titlebar              | Panel moves; document and answer unchanged                            |
| P03 | Resize Field editor substantially            | Content reflows/scrolls; input usable                                 |
| P04 | Dock right                                   | Panel docks at chosen width; active field preserved                   |
| P05 | Collapse right dock                          | Full unused width reclaimed; restore tab visible                      |
| P06 | Restore and Float                            | Previous valid floating geometry restored                             |
| P07 | Keep Field editor floating and Issues docked | Both independently usable                                             |
| P08 | Collapse Document navigation                 | Document remains selected; central space recovered                    |
| P09 | Dock two panels to one edge                  | Tabbed group, reachable switching, no overlap                         |
| P10 | Reload after layout customization            | Desired layout restored                                               |
| P11 | Load malformed/out-of-bounds geometry        | Affected panel recovered; other data preserved                        |
| P12 | Resize viewport to mobile and back           | Adaptive layout; desktop preference preserved                         |
| P13 | Change layouts in separate tabs              | Last successful stored writer wins on subsequent load                 |
| P14 | Deny localStorage                            | Panels work in memory; warning accurate                               |
| P15 | Keyboard-only move/dock/collapse/restore     | All mandatory actions accessible                                      |
| P16 | Activate field while editor collapsed        | Editor restores and focuses correct input                             |
| P17 | Open Settings repeatedly                     | One logical panel instance                                            |
| P18 | Close Issues, then trigger save failure      | Critical failure remains discoverable                                 |
| P19 | Drag panel partly off-screen                 | Header/recovery control remains reachable                             |
| P20 | Resize beyond viewport                       | Dimensions safely constrained                                         |
| P21 | Switch active fields in positioned editor    | Content changes; deliberate geometry preserved                        |
| P22 | Drag while input text is selected            | No unintended deletion or selection loss                              |
| P23 | Switch workspaces with floating panels       | Context-specific arrangement restored                                 |
| P24 | Collapse all optional panels                 | Central space recovered; all reopen paths accessible                  |
| P25 | Reset one panel position                     | Other panel preferences unchanged                                     |
| P26 | Reset workspace layout                       | Default arrangement restored; data/settings unchanged                 |
| P27 | Resize at browser zoom                       | Controls remain accessible                                            |
| P28 | Open mobile editor with software keyboard    | Active input and actions remain reachable                             |
| P29 | Switch documents while editor open           | No stale answer from previous document                                |
| P30 | Repeatedly open/close panels                 | No duplicate handlers, windows, or actions                            |

### Template, writing, and Settings acceptance matrix

| ID  | Scenario                                     | Required result                                                   |
| --- | -------------------------------------------- | ----------------------------------------------------------------- |
| T01 | Search `JSON`                                | Project description found through GTL examples                    |
| T02 | Search exact and misspelled titles           | Exact match outranks weak fuzzy matches                           |
| T03 | Preview template without selecting           | Sample displayed; no document persisted                           |
| T04 | Preview Thoughtful email                     | Choice labels, multiline text, optional values rendered correctly |
| T05 | Select Project description version           | Prominent accessible selection; independent answers               |
| T06 | Edit `$action`, switch to `$benefit`, return | Identity, answer, caret behavior preserved                        |
| T07 | Select Large text                            | Noticeable size change; authored/exported content unchanged       |
| T08 | Use/Copy example                             | Use changes selected answer; Copy does not                        |
| T09 | Collapse guidance                            | No reserved empty column; inline field can restore editor         |
| T10 | Disable browser suggestions                  | Appropriate input attributes set                                  |
| T11 | Change setting through floating panel        | Full Settings reflects same value                                 |
| T12 | Keyboard-only and 200% zoom                  | Main workflow operable                                            |
| T13 | Open incomplete document                     | Live result visible; copy/export gated                            |
| T14 | Type search query containing spaces          | Space inserts text, does not activate result                      |
| T15 | Clear template search                        | Manifest order restored                                           |
| T16 | Search with template-load failure            | Failure distinguished from no matches                             |
| T17 | Rapidly change preview target                | No stale preview                                                  |
| T18 | Preview two versions                         | Active working document unchanged                                 |
| T19 | Activate completed placeholder               | Existing value editable                                           |
| T20 | Activate repeated reference                  | Shared answer updates all occurrences                             |
| T21 | Activate empty optional placeholder          | Input remains accessible                                          |
| T22 | Type with IME                                | No lost composition                                               |
| T23 | Undo ordinary field edit                     | Native undo behavior preserved                                    |
| T24 | Enlarge central document text                | Main writing surface visibly scales                               |
| T25 | Render Blank note and Thoughtful email       | Meaningful line breaks preserved                                  |
| T26 | Change Settings during editing               | Current field/scroll position retained                            |
| T27 | Attempt incomplete result copy               | Specific reason and recovery navigation                           |
| T28 | Switch versions and return                   | Correct previous document/answers restored                        |

### Document and Template Authoring acceptance matrix

| ID  | Scenario                                      | Required result                                                |
| --- | --------------------------------------------- | -------------------------------------------------------------- |
| D01 | Rename saved document                         | Title updates; ID/answers/source snapshot unchanged            |
| D02 | Archive active document                       | No confirmation; record appears in Archived                    |
| D03 | Restore same document                         | Same record returns without duplication                        |
| D04 | Change Recent limit                           | Only list presentation changes                                 |
| D05 | Delete active/archived document               | Exact-record confirmation and safe cancellation                |
| D06 | Load legacy records                           | Missing archive property defaults to Active                    |
| D07 | New Document with incomplete current document | Navigation succeeds; edits retained                            |
| D08 | Archive while autosave pending                | Latest answers and archive state retained                      |
| D09 | Undo Archive                                  | Same document ID restored                                      |
| D10 | Restore from Archived filter                  | Document appears under Active without duplication              |
| D11 | Edit archived document                        | Remains archived                                               |
| D12 | Rename while list updates                     | Focus and editing context stable                               |
| D13 | Delete while save pending                     | Deleted record not recreated                                   |
| D14 | Rename temporary document                     | Meaningful rename persists; no-op does not                     |
| D15 | Fail save after rename                        | New title recoverable                                          |
| D16 | Select duplicate-titled records               | Correct record targeted by stable ID                           |
| A01 | Save invalid GTL source                       | Exact invalid source saved; diagnostics and download available |
| A02 | Save draft, navigate away, return             | Named source restored from Authoring history                   |
| A03 | Rename draft and GTL name separately          | Correct fields change independently                            |
| A04 | Inspect checkpoint                            | Read-only; current draft unchanged                             |
| A05 | Restore checkpoint                            | Current source recoverable; historical source immutable        |
| A06 | Autosave many small changes                   | No checkpoint explosion                                        |
| A07 | Switch authoring/document workspaces          | Independent data preserved                                     |
| A08 | Edit same draft in two tabs                   | Conflict-safe behavior; no silent loss                         |
| A09 | Create new template                           | No unnecessary duplicate saved draft                           |
| A10 | Rename draft                                  | History row, heading, breadcrumb update                        |
| A11 | Save identical source twice                   | No duplicate checkpoint                                        |
| A12 | Restore old source                            | Pre-restore current source recoverable                         |
| A13 | Save whitespace-different GTL                 | Exact distinct source preserved                                |
| A14 | Checkpoint persistence fails                  | Current source retained; accurate failure                      |
| A15 | Delete template draft                         | Confirmation identifies source/checkpoint consequences         |
| A16 | Open missing checkpoint                       | No current-source overwrite                                    |
| A17 | Reopen bundled template repeatedly            | No accidental duplicate saved drafts                           |
| A18 | Rename GTL `TEMPLATE:` through control        | Only correct declaration modified                              |
| A19 | Preview invalid source                        | Invalid or clearly labeled last-valid state                    |
| A20 | Use memory-only authoring history             | No false durability claim                                      |

### Test environment matrix

| Environment                                | Primary verification                  |
| ------------------------------------------ | ------------------------------------- |
| Wide desktop, approximately 1920px         | Multiple floating panels and docks    |
| Standard laptop, approximately 1366px      | Typical reading/workspace arrangement |
| Tablet/narrow desktop, approximately 768px | Dock adaptation                       |
| Narrow phone, approximately 360px          | Drawer-based field editing            |
| Very narrow phone, approximately 320px     | Control reachability                  |
| Browser zoom at 200%                       | Reflow, navigation, and accessibility |
| Software keyboard open                     | Active-input visibility               |
| Reduced-motion enabled                     | No unnecessary movement animation     |
| Keyboard only                              | Complete primary workflows            |
| Supported screen reader/browser            | Focus and semantic state              |
| Two simultaneous tabs                      | Data and preference concurrency       |
| Storage temporarily unavailable            | Recovery and accurate feedback        |
| Legacy database and preferences            | Non-destructive migration             |
| Static subdirectory deployment             | Relative asset and worker loading     |

### Browser integration requirements

Real-browser testing must exercise pointer dragging, resizing, docking, collapsing, restoring, selection, multiline text entry, document navigation, template search, preview, version selection, source editing, clipboard behavior, and storage recovery.

A unit test that directly changes a panel state value does not establish that a user can discover and perform the action.

Tests must verify both expected success and common interruption/failure paths.

### Screenshot evidence ledger

The following frames belong to `transcript00012026-10-25.zip`. The descriptions record visible content and its relationship to this change request.

| Frame                   | Approximate time | Visible evidence                                                                                    | Relevant requirement                            |
| ----------------------- | ---------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `frame-000000000ms.jpg` | 00:00            | Bright Prompt Menu page with selectable presets and compact Live prompt window                      | Reference interaction model                     |
| `frame-000185000ms.jpg` | 03:05            | Large floating Live prompt panel, drag handle, dock controls, scrolling content, text-size selector | Floating, resizing, docking, text size          |
| `frame-000190000ms.jpg` | 03:10            | Prompt window docked right with confirmation toast                                                  | Reversible docking and feedback                 |
| `frame-000238000ms.jpg` | 03:58            | Guided's fixed left navigation, central sentence, narrow right editor/issues region                 | Existing cramped layout                         |
| `frame-000425000ms.jpg` | 07:05            | Reference Text size selector offering Normal and Large                                              | Panel-local scaling                             |
| `frame-000855000ms.jpg` | 14:15            | Guided branding slogans, green indicators, Local to this browser                                    | Copy and decoration cleanup                     |
| `frame-000924000ms.jpg` | 15:24            | Guidance hidden while empty right column remains                                                    | True collapse and width recovery                |
| `frame-001027000ms.jpg` | 17:07            | New Document promotional heading and subtitle                                                       | Remove nonfunctional introduction               |
| `frame-001180000ms.jpg` | 19:40            | Small Writing style dropdown above guided sentence                                                  | Prominent version chooser                       |
| `frame-001303000ms.jpg` | 21:43            | Selected `$action`, central token and small right-side variable label                               | Variable identity and active-field relationship |
| `frame-001384000ms.jpg` | 23:04            | Filled project description, live result, examples in right panel                                    | Generated result and example interactions       |
| `frame-001485000ms.jpg` | 24:45            | Chrome Saved info popup obstructing answer field                                                    | Browser suggestions preference                  |
| `frame-001593000ms.jpg` | 26:33            | Reference panel collapsed to narrow vertical edge tab                                               | Collapse/restore interaction                    |
| `frame-001688000ms.jpg` | 28:08            | Invalid GTL source, diagnostic, Save now, right-side issue content                                  | Invalid-source saving, independent Issues       |
| `frame-001770000ms.jpg` | 29:30            | Template Authoring heading, generic A new idea source                                               | Authoring naming and copy cleanup               |
| `frame-001833000ms.jpg` | 30:33            | Full Settings page with appearance and editing controls                                             | Settings-page preservation and secondary panel  |
| `frame-001890000ms.jpg` | 31:30            | Reference large Why-first/Code-first/Trace-first selection tiles                                    | Accessible prominent exclusive choices          |
| `frame-001960000ms.jpg` | 32:40            | Reference radio rows and floating preview                                                           | Clear radio controls and contextual help        |
| `frame-001972000ms.jpg` | 32:52            | Reference independently selectable checkbox rows                                                    | Checkbox presentation and semantics             |
| `frame-002048000ms.jpg` | 34:08            | Guided Delete document confirmation dialog                                                          | Preserve identified destructive confirmation    |

Screenshot comparison after implementation:

| Baseline frame | Post-change expectation                                   |
| -------------- | --------------------------------------------------------- |
| 03:58          | Field editor can float near document                      |
| 15:24          | Collapsed guidance no longer reserves wide empty column   |
| 19:40          | Version chooser visibly communicates consequential choice |
| 26:33          | Guided has equivalent accessible edge restore behavior    |

The evidence ledger documents sampled screenshots, not every moment of the original recording.

Do not infer exact pixel sizes or unobserved behavior from a static frame.

### Transcript traceability matrix

| Recording interval | Requirement sections                                        |
| ------------------ | ----------------------------------------------------------- |
| 00:00-03:10        | E01, G01-H01: reference inspection, float/dock              |
| 03:39-07:05        | B01, G01-I01, L01, Q01: Field editor, Issues, sizing        |
| 07:59-10:07        | J01: localStorage, last-writer-wins, geometry               |
| 11:19-13:19        | M01, Q01: template search and contextual help               |
| 13:19-15:24        | F01, H01, K01: navigation, copy, true collapse              |
| 15:59-19:40        | F01, N01-O01: template previews and version selection       |
| 20:39-24:45        | P01-Q01, X01: placeholders, results, examples, autocomplete |
| 25:27-30:12        | H01, T01-U01: collapse, authoring history, naming           |
| 30:12-33:19        | W01, O01: settings and selection controls                   |
| 33:19-36:38        | R01-S01: rename, archive, restore, delete                   |

### Consolidated specification decisions

This section is an authoritative decision summary. It intentionally repeats important requirements so implementers can verify the agreed behavior without reconstructing decisions from multiple files.

In case of accidental inconsistency, the detailed owning section governs. A genuine conflict must be resolved explicitly; it must not be silently decided by implementation convenience.

Settled implementation choices:

| Design question                                        | Decision                                     |
| ------------------------------------------------------ | -------------------------------------------- |
| How are panels opened?                                 | Consistently available Panels/open mechanism |
| Does selecting a placeholder focus its input?          | Yes, immediately                             |
| Are panels duplicated when reopened?                   | No                                           |
| How does floating Collapse work?                       | Compact draggable floating titlebar          |
| How does docked Collapse work?                         | Labeled edge restore tab                     |
| Does Close differ from Collapse?                       | Yes                                          |
| How are same-edge docks arranged?                      | Shared tabbed dock column                    |
| Is automatic drag-to-dock mandatory?                   | No                                           |
| Are explicit docking commands mandatory?               | Yes                                          |
| Are floating and dock dimensions separate?             | Yes                                          |
| Does responsive adaptation overwrite desktop layout?   | No                                           |
| Can individual panel positions be reset?               | Yes                                          |
| Can the whole workspace layout be reset?               | Yes                                          |
| Which service owns text-size preferences?              | SettingsService                              |
| Does central guided text support enlargement?          | Yes                                          |
| Does Space in search input select a result?            | No                                           |
| Are template search results grouped by template?       | Yes                                          |
| Does previewing a version change the document?         | No                                           |
| Can filled placeholders be activated for editing?      | Yes                                          |
| Does Archive offer Undo?                               | Yes                                          |
| Can archived documents be edited?                      | Yes, without automatic restoration           |
| Is document filter choice remembered?                  | Yes                                          |
| Is Template Authoring history independent?             | Yes                                          |
| Does ordinary autosave create checkpoints?             | No                                           |
| Does Save now create a checkpoint?                     | Yes, when exact source differs               |
| Is checkpoint equality based on exact source?          | Yes                                          |
| Can template drafts be deleted?                        | Yes, with confirmation                       |
| Is pre-restore recovery mandatory?                     | Yes                                          |
| Can invalid GTL source be saved/downloaded?            | Yes                                          |
| Can invalid source silently show stale valid preview?  | No                                           |
| Are ordinary-document historical revisions introduced? | No                                           |
| Is localStorage authoritative for panel layout?        | Yes                                          |
| Are document conflicts last-writer-wins?               | No                                           |
| Is first-run layout usable without customization?      | Yes                                          |
| Does panel movement change authored content?           | Never                                        |

### Consolidated shared UX contracts

These invariants apply across the specification.

| Contract               | Invariant                                                                                     |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| Interaction continuity | Ordinary UI actions preserve current text, caret, selection, and composition where applicable |
| Action discoverability | Every mandatory action has a visible or accessible entry point                                |
| Feedback               | Successful and failed state-changing actions report accurate status                           |
| Focus restoration      | Closing temporary UI returns focus to a meaningful target                                     |
| Reversibility          | Non-destructive UI actions provide a clear reverse operation                                  |
| Scroll stability       | Auxiliary UI changes do not unexpectedly reposition the document                              |
| Viewport safety        | Essential controls cannot become permanently unreachable                                      |
| Keyboard equivalence   | Mandatory pointer actions have keyboard alternatives                                          |
| State isolation        | Layout operations never modify document or GTL source                                         |
| Consistency            | Reused controls behave consistently in every workspace                                        |
| Error recovery         | Failed operations preserve latest recoverable authored state                                  |
| Responsive adaptation  | Temporary viewport changes do not destroy desktop preferences                                 |
| Identity               | Actions target stable IDs, not names or list indices                                          |
| Rendering              | UI updates do not recreate focused inputs unnecessarily                                       |
| Persistence            | No false success claims before storage confirmation                                           |
| Context isolation      | Document answers and authoring preview answers remain separate                                |
| Accessibility          | Semantics match actual actions and state                                                      |
| User control           | Automatic behavior does not override deliberate customization                                 |
| Content fidelity       | No unrequested rewriting of authored values or GTL source                                     |

### Consolidated implementation contracts

Panel Interaction Contract:

All managed panels share a common contract covering opening, activation, placement, visibility, drag, resize, docking, collapse, close, restoration, focus, viewport constraints, keyboard access, and persistence.

Panel-specific features declare their content and available actions without implementing separate incompatible window systems.

Editable Content Contract:

Ordinary document fields and Template Authoring preview fields share applicable editing behavior: immediate activation, real controls, correct variable identity, native keyboard semantics, live rendering, validation, selection preservation, and non-destructive state transitions.

Their actual answer stores remain independent.

Persistent Item Lifecycle Contract:

Documents and authoring drafts use stable identity, discoverable selection and rename actions, accurate save states, safe navigation, and conflict-aware persistence.

Archive applies specifically to documents. Historical checkpoints apply specifically to template-authoring source.

The shared contract must not erase those domain distinctions.

### Consolidated priority matrix

All mandatory requirements remain in scope. The priorities identify validation and implementation order, not permission to omit accepted features.

Priority 0: Release-critical functionality

| Requirement                                | Reason                       |
| ------------------------------------------ | ---------------------------- |
| Immediate field-editing activation         | Core writing workflow        |
| Reliable panel state machine               | Foundation of workspace      |
| Discoverable and reversible panel actions  | Prevents inaccessible UI     |
| Focus, caret, and composition preservation | Editing correctness          |
| Viewport-safe geometry                     | Prevents unreachable panels  |
| Real width recovery after collapse         | Central recorded problem     |
| Safe checkpoint restoration                | Prevents authoring data loss |
| Archive/save concurrency protection        | Prevents content corruption  |
| Reliable document navigation               | Preserves access to work     |

Priority 1: Important user-experience functionality

| Requirement                   | Reason                               |
| ----------------------------- | ------------------------------------ |
| Central document text scaling | Reading comfort                      |
| Search-result explanations    | Template discoverability             |
| Noncommittal previews         | Prevents accidental document changes |
| Complete rename workflow      | Expected document organization       |
| Archive Undo                  | Reversible operation                 |
| Template-draft deletion       | Source history management            |
| Unified Settings              | Predictable preferences              |
| Issue severity and recovery   | Accurate error handling              |
| Responsive panel behavior     | Mobile/tablet usability              |
| Save-state feedback           | Trust and clarity                    |

Priority 2: Secondary refinements

| Requirement                           | Reason                     |
| ------------------------------------- | -------------------------- |
| Advanced preview expansion            | Long-template inspection   |
| Optional duplicate result preview     | Convenience, not required  |
| Additional visual animation           | Polish only                |
| Decorative iconography                | Secondary to functionality |
| Optional checkpoint labeling controls | History organization       |
| More sophisticated fuzzy ranking      | Useful as collection grows |

Priority 2 entries remain optional unless another requirement explicitly makes their underlying behavior mandatory.

For example, complete preview accessibility is mandatory, while an elaborate preview expansion animation is not.

### Consolidated state and persistence separation

| Data category              | Authoritative owner       | Persistence behavior                               |
| -------------------------- | ------------------------- | -------------------------------------------------- |
| Generated document answers | Documents                 | Selected document storage mode                     |
| Document archive state     | Documents                 | Selected document storage mode                     |
| Document title             | Documents                 | Selected document storage mode                     |
| Template source draft      | Template Authoring        | Selected authoring storage mode                    |
| Source checkpoints         | Template Authoring        | Selected authoring storage mode                    |
| Effective preferences      | SettingsService           | Established preference storage                     |
| Panel geometry and layout  | Layout service            | localStorage                                       |
| Template search index      | Templates                 | Rebuildable from bundled definitions               |
| Active field selection     | Editing UI/domain context | Transient unless original lifecycle says otherwise |
| Preview sample values      | Templates preview context | Transient                                          |
| Current issues             | Owning features           | Derived current state                              |
| Floating z-order           | Panel system              | Session-only acceptable                            |

No data category may silently use the persistence policy of another merely because their controls share a panel.

### Definition of complete

The change request is complete only when all of the following outcomes have been demonstrated.

| Area                | Completion requirement                                                   |
| ------------------- | ------------------------------------------------------------------------ |
| Panels              | Independently movable, dockable, collapsible, restorable, and accessible |
| Layout              | True space recovery, safe geometry, persistent user arrangement          |
| Editing             | Active field immediately usable, with preserved caret/selection/undo     |
| Navigation          | Documents and authoring drafts accessible through distinct histories     |
| Templates           | Ranked search, rendered samples, prominent version selection             |
| GTL                 | Original parsing/rendering semantics preserved                           |
| Variables           | Consistent `$identifier`, clear active-field state                       |
| Results             | Readable, immediate, correct, safe to copy/export                        |
| Examples            | Clear Use and Copy semantics                                             |
| Settings            | Single effective state across all presentations                          |
| Browser suggestions | Accurate preference and platform-limit behavior                          |
| Documents           | Rename, Archive, Restore, Recent, Delete correctly implemented           |
| Authoring           | Named drafts, invalid-source saving, checkpoints, safe recovery          |
| Persistence         | Legacy records preserved, failures recoverable, concurrency protected    |
| Responsive          | Usable desktop, laptop, tablet, and mobile workflows                     |
| Accessibility       | Keyboard and assistive-technology access to primary workflows            |
| Documentation       | Architecture, implementation, tests, and original contracts reconciled   |
| Browser validation  | Actual interaction tests pass, not merely unit-level state tests         |

Release-blocking defects:

Unrecoverable authored-content loss, inaccessible panels, broken navigation, inability to edit a selected field, false save-success reporting, destructive history restoration, incorrect record identity, or missing mandatory interactions block completion.

Minor aesthetic refinements may be handled separately only if discoverability, readability, accessibility, and correctness are not materially affected.

Final user acceptance walkthrough:

A first-time user opens Guided on a normal laptop. They can immediately find a template, search for a relevant one, inspect rendered examples without creating documents, choose a writing style, select a placeholder, and begin typing without a second unnecessary click.

They can move, enlarge, dock, collapse, and restore Field editor without losing their answer or focus. They can open Issues independently, adjust text size, complete the document, and copy or export the result.

They can reclaim central reading space by collapsing panels. After reloading, their deliberately selected workspace arrangement returns.

They can locate, rename, archive, undo archive, restore, and delete documents with clear distinctions between reversible and permanent actions.

In Template Authoring, they can create and name a draft, edit GTL source including invalid text, save it locally, navigate to previous checkpoints, safely restore historical source, and understand exactly which source version is current.

All these interactions must preserve Guided's original local-first behavior, document independence, GTL semantics, data-integrity guarantees, and separation between authoring source and generated documents.

The result must function as a coherent application, not merely a collection of individually implemented controls.

