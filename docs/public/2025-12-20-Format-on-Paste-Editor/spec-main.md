2025-12-20

A00-00 Project vision and problem statement

This project is a lightweight, static, offline-friendly text editor optimized for repetitive paste-and-format workflows. The user copies text from another source (often spreadsheets, docs, or web pages) and pastes into the app. Instead of inserting the raw clipboard text, the app can automatically transform the clipboard content and insert the result into the editor using predictable insertion rules. The goal is to remove tedious manual formatting steps while keeping the app small, understandable, and easy to extend.

The app is a vanilla JavaScript, HTML, CSS site loaded via legacy script src tags. There is no build step and no framework dependency.

B00-00 Goals

The app must provide a single editing surface for plain text that works well on desktop and mobile.

The app must intercept paste when formatted paste mode is enabled, apply a user-selected pipeline of small transformation steps, then insert the result using a user-selected insertion mode.

The app must allow disabling formatted paste so the editor behaves like a normal text editor.

The app must persist editor content and key UI state to localStorage continuously so accidental refresh does not lose work.

The app must be easy to extend in code by adding small pure functions for transformation and a small set of insertion functions. The implementation must keep transformation logic separate from insertion logic.

C00-00 Non-goals and guardrails

This app is not a full code editor. No syntax highlighting, no language services, no file system integration, no multi-file project model, and no attempt to parse or semantically understand SQL or JSON beyond basic string operations.

This version does not implement advanced clipboard parsers (CSV/TSV/JSON parsing), multi-item batch processing (splitting into many items and generating multi-line output), or complex cleanup presets (like removing numbering/bullets). This version may include minimal normalization such as trimming whitespace because it supports the core paste formatting goal without becoming a separate feature area.

D00-00 Runtime and packaging

The app is a static site consisting of one HTML page, one CSS file, and one or more JS files loaded via script src in dependency order.

All functionality must work without network access after the files are loaded.

The app must not require any browser permissions beyond standard clipboard paste events. It does not read the clipboard outside of user-initiated paste events.

E00-00 Primary user workflows

The user opens the app, selects a predefined profile or edits the current pipeline manually, then pastes content repeatedly to build an output text. Typical outcomes include building SQL select lists, comma-prefixed identifiers, JSON string fragments, or other repetitive formatting patterns.

The user can temporarily bypass formatted paste for a single paste action using a keyboard shortcut, and can fully toggle formatted paste mode on or off.

If the page refreshes, the app restores the last workspace automatically including editor content, the last selected insertion mode, and the last configured pipeline.

F00-00 User interface and UX requirements

The UI must be simple and readable on mobile. Controls must be accessible without precision clicking and must not rely on hover.

The UI must clearly indicate whether formatted paste is enabled. The indicator must be visible while editing, not hidden inside menus. The toggle must be a single control with two states: formatted paste ON and formatted paste OFF.

The UI must provide a pipeline editor and an insertion mode selector. The pipeline editor must support adding, removing, and reordering steps. Reordering can be implemented as up/down buttons per step; drag-and-drop is optional and not required for this version.

The UI must support predefined profiles that populate the pipeline editor. A profile acts as a starting blueprint. After loading a profile, the user can modify the pipeline. The modified pipeline is treated as the current active pipeline and is persisted. Profiles themselves are defined in code and are not edited in the UI.

The UI must show a small preview of the paste processing result. The preview can be minimal for this version: store and display the last raw clipboard text and the last transformed output text. The preview must not block editing and must be collapsible on small screens.

G00-00 Data persistence, workspace model, and session key

The app must persist all user work to localStorage. This includes editor text, formatted paste enabled state, selected insertion mode, selected profile id (if any), and the active pipeline configuration.

The app must use a workspace id (GUID-like string) as the primary key for stored state. On first run, generate a new id and store it as the current workspace id. On subsequent loads, restore from the current workspace id. This enables future extension to multiple workspaces without changing the storage layout.

GUID generation requirement: use a deterministic-in-code, browser-safe generator. Prefer crypto.randomUUID() when available; otherwise fall back to a simple random generator based on crypto.getRandomValues. The generated id must be stable and stored.

Autosave behavior: any editor change must schedule persistence with a short debounce, and must also flush persistence on visibilitychange to hidden and beforeunload.

Minimum restore behavior: on load, restore editor content and focus the editor; restore scroll position if stored; restore pipeline and insertion mode; restore formatted paste enabled state.

H00-00 Editor behavior requirements

The editor can be implemented using a textarea for simplicity and reliable selection APIs. The editor must support standard editing operations when formatted paste is disabled.

The app must track the current selection range (selectionStart and selectionEnd) at the time of paste so insertion modes can apply correctly.

The app must support undo using the browser default behavior as much as possible. Insert operations should be done by setting the textarea value and selection in a way that preserves undo reasonably; the implementation must avoid frequent full resets outside of paste and explicit actions.

I00-00 Paste handling overview

Paste handling is the central feature. When formatted paste is enabled and a paste event occurs inside the editor, the app must prevent the default paste, read clipboard text from the event, pass it through the active pipeline, then insert using the selected insertion mode.

When formatted paste is disabled, the app must not interfere and must allow the browser default paste.

The app must support bypassing formatted paste for a single paste action using a keyboard shortcut. The recommended behavior is: if formatted paste is ON and the user performs a dedicated raw-paste shortcut, the app performs a normal paste without transformation. Implementation details depend on browser support, but the requirement is that the app provides at least one reliable bypass method on desktop keyboards.

J00-00 Pipeline model and configuration

A pipeline is an ordered list of steps. Each step is a small operation that transforms a string into a string. The pipeline input is the raw clipboard text, and the pipeline output is the final transformed text.

This version supports only string-to-string steps. Even if the internal code allows array outputs, the UI and persistence format for this version must treat the pipeline output as a single string. This keeps the implementation aligned with the decision to not support multi-item batch formatting yet.

Pipeline execution rules: run steps in sequence; each step receives the previous step output; steps must be pure functions of input plus their configuration; steps must not directly modify the editor or storage.

Pipeline persistence: serialize the active pipeline as JSON in localStorage. Each step must store a type id and a config object.

Pipeline editor requirements: allow adding a step from a limited catalog; allow deleting a step; allow reordering steps; allow editing step config using simple inputs.

K00-00 Predefined profiles

Profiles are predefined pipeline configurations stored in code in a human-editable format. A profile includes an id, a display name, an optional description, a default insertion mode, and a pipeline step list.

Profiles must be read-only in code. Loading a profile copies its pipeline into the active pipeline editor. After loading, the user modifications apply only to the active pipeline and are persisted as the last pipeline. The app must not attempt to persist modifications back into the profile definitions.

The profile definition format must be simple enough to edit directly in JavaScript without tooling. The recommended shape is an array of objects with plain properties and no computed logic.

L00-00 Supported transformation steps in this version

This version includes a minimal set of steps that support the core scenarios discussed.

Trim step: removes leading and trailing whitespace from the entire clipboard text. Optional configuration can include whether to also collapse consecutive internal whitespace into a single space; default is off to avoid surprising edits.

Case transform step: transforms the clipboard text using one selected mode. Supported modes in this version are lowercase, uppercase, snake_case, kebab-case, camelCase, and PascalCase. The conversion must be deterministic. If the input contains spaces or punctuation, treat them as word separators for case conversions. If the input is already a single identifier, conversions should still work by splitting on separators like underscore, dash, and spaces.

Template wrap step: produces output by applying a template string that includes placeholders. Required placeholders are ${value} for the current string. Optional placeholder ${json} inserts JSON.stringify(value). The step must allow configuring a template and must provide a small set of built-in templates in the UI, such as ", ${value}", "'${value}'", '"${value}"', ", ${json}".

Join step is not supported in this version because multi-item paste is out of scope. If a join-like behavior is needed for single strings, the template wrap step covers it.

M00-00 Insertion model and separation from transformation

Insertion is separate from transformation. Transformation produces a final string output. Insertion decides where and how that output is placed into the editor text.

Insertion must be implemented as a set of small functions that operate on the editor value and a selection range, returning a new value and the new caret/selection position. Insertion functions must not know about pipeline internals.

Insertion must support at least the modes below, and each mode must be fully specified for behavior at selection boundaries.

N00-00 Supported insertion modes in this version

Insert at cursor: inserts transformed text at the caret position. If there is a selection, it replaces the selection. The caret ends after the inserted text.

Replace selection explicitly: functionally identical to insert at cursor when a selection exists, but exposed as a separate mode only if it improves UX clarity. If exposed, it must behave as: if selection exists replace it; if no selection exists, insert at cursor.

Append to end: ignores current selection and appends transformed text to the end of the document. The caret ends at end after insertion.

Prepend to start: inserts transformed text at the start of the document. Caret ends after the inserted text.

Insert on new line at cursor: inserts a newline if needed, then inserts transformed text on its own line at the caret location. Minimal rule: if the character immediately before caret is not a newline and caret is not at start, insert "\n" before the transformed text. Also, if the character immediately after caret is not a newline and caret is not at end, insert "\n" after the transformed text. This aims to isolate the inserted content as a full line without deeply analyzing the surrounding text.

Append on new line at end: ensures the appended content starts on a new line. If the document is non-empty and does not end with newline, insert "\n" before appending the transformed text. Optionally add a trailing newline based on a config flag; default is no trailing newline.

Delimiter-prefixed insertion: inserts a delimiter string before the transformed text. This is used for the comma-prefix scenario. The delimiter string is configured, defaulting to ", ". The insertion location depends on a base mode: it can be used with insert at cursor or append to end. For this version, define it as a separate insertion mode: it inserts delimiter plus transformed text at cursor or replaces selection. It does not attempt to detect whether a delimiter already exists. This matches the preference to keep logic simple for initial release.

Delimiter-suffixed insertion: inserts transformed text then delimiter string. This is useful for building lists where each paste ends with a delimiter. It is configured with delimiter string, defaulting to ", ". Like delimiter-prefixed insertion, it does not attempt to avoid duplicate delimiters in this version.

Insertion mode composition rule: the UI exposes insertion modes as single selectable items. Internally, delimiter-prefixed and delimiter-suffixed can be implemented as wrappers around insert at cursor, but the user sees them as concrete modes.

O00-00 Formatted paste toggle and raw paste bypass

Formatted paste toggle: when OFF, paste events must not be intercepted and the browser default behavior applies.

Raw paste bypass: when formatted paste is ON, the user must have a way to paste without formatting for a single action. Desktop requirement: support Ctrl+Shift+V as a raw paste intent when possible. If the browser does not provide raw clipboard text on that shortcut in a reliable way, then implement a fallback behavior: while a dedicated modifier key is held (for example Shift), treat the paste as raw. The app should implement both if feasible: detect the key state on paste and bypass formatting when the bypass condition is true.

Mobile note: mobile keyboards vary. The raw bypass is best-effort on mobile; formatted paste toggle must remain the primary control.

P00-00 Preview requirements for this version

The app must store and display the last clipboard text received from the paste event and the last transformed output. This is primarily for user confidence and debugging.

The preview must not be required for the core workflow. It can be collapsed or hidden.

The preview display must be read-only and must not be a second editor.

Q00-00 Local storage schema

All persisted state must be stored under a single root key namespace for the app, plus per-workspace keys.

Required keys:

1. app:currentWorkspaceId -> string
2. workspace:{id}:editorText -> string
3. workspace:{id}:formattedPasteEnabled -> boolean
4. workspace:{id}:insertionMode -> string id
5. workspace:{id}:activePipeline -> JSON string of pipeline steps
6. workspace:{id}:selectedProfileId -> string or empty
7. workspace:{id}:uiState -> JSON string for optional UI state like preview collapsed, last selection, scroll position

All reads from localStorage must be guarded. If parsing fails, fall back to defaults rather than breaking the app.

R00-00 Error handling and edge cases

If clipboard text is empty or unavailable, insertion must insert an empty string and do nothing else. The preview can still record that an empty paste occurred.

If a pipeline step throws due to invalid config, the app must fail gracefully by skipping formatting and performing a raw paste insertion, and it must show a minimal non-intrusive error indicator. The error indicator can be a small status line near the preview area.

If localStorage is full or unavailable, the app must continue to function without persistence and must display a minimal warning. It must not crash.

S00-00 Extensibility requirements

Adding a new transformation step must require only:

1. Defining a step type id.
2. Implementing a pure function (input string, config) -> output string.
3. Providing a minimal UI config editor for the step.
4. Adding the step to the step catalog and optionally to a profile.

Adding a new insertion mode must require only:

1. Implementing a pure function (editorValue, selectionStart, selectionEnd, insertText, config) -> (newValue, newSelectionStart, newSelectionEnd).
2. Registering it in the insertion mode catalog for the UI.

Transformation code must not directly manipulate the editor. Insertion code must not know about clipboard or pipeline internals.

T00-00 Implementation structure

The JavaScript should be split into small modules loaded via script tags in order. If modules are not used, use clear namespaces or IIFE patterns to avoid global pollution.

Recommended separation:

1. storage.js handles localStorage read/write, schema, workspace id generation, debounced save, restore.
2. pipeline.js defines step catalog, profile definitions, pipeline execution, and step UI bindings.
3. insertion.js defines insertion mode catalog and insertion functions.
4. editor.js wires DOM events: input, paste, selection tracking, toggle state, preview updates.
5. ui.js handles rendering pipeline editor controls, profile selector, insertion mode selector, and status messages.

U00-00 Acceptance criteria

When formatted paste is ON, pasting inside the editor must produce transformed output according to the active pipeline and must insert according to the selected insertion mode.

When formatted paste is OFF, paste must behave as a normal text editor paste.

The app must restore editor text and active pipeline after refresh on the same device and browser.

The app must support at least these concrete scenarios:

1. Comma-prefix identifier: pipeline can be identity or case transform; insertion mode is delimiter-prefixed with ", "; paste "colA" results in ", colA" inserted at caret.
2. JSON string insertion: template wrap uses ${json}; paste hello results in ""hello"" inserted according to insertion mode.
3. Case transform: paste "My Column" with snake_case results in "my_column" inserted according to insertion mode.

V00-00 Deferred items explicitly not implemented in this version

Clipboard parsing for TSV/CSV/JSON beyond treating clipboard as plain text.

Multi-item paste splitting and batch join output.

Complex cleanup presets like removing bullets or numbering, beyond optional trimming and optional whitespace collapsing.

Delimiter duplication detection and smart list punctuation logic.

Multiple workspaces UI, renaming, browsing recent workspaces. The storage model supports it, but UI is deferred.

