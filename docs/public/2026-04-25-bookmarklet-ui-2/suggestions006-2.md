2026-04-23

A00

# Codex execution appendix: implementation discipline, reference workflow, demos, and test coverage

2026-04-23

This document is a separate execution appendix for Codex.

It works together with the main product requirements document for evolving the bookmarklet UI library into an application UI kit, but it has a different purpose.

The main PRD defines what the UI framework should become.

This appendix defines how Codex should iterate toward that result.

The goal is not only to add many new components. The goal is to add them in a way that is testable, reusable, demoable, maintainable, and grounded in the real needs of the existing project.

Codex should treat this document as implementation discipline.

B00

## Required reference folder

Codex will have access to the following folder:

```text
__readonly_only_for_inspiration__
```

This folder is read-only reference material.

Codex should use it continuously while designing and implementing the new UI library components.

The folder contains existing side-project implementation code that demonstrates the real application patterns the library is supposed to absorb. It includes current local UI structures, CSS patterns, rendering code, forms, status lines, banners, modals, URL pickers, browser surfaces, card lists, copy flows, previews, and other repeated application behavior.

Codex must not copy this folder blindly into the library.

Codex must not edit this folder.

Codex should consult it as evidence.

The intended workflow is:

look at the main PRD;

look at the current library source;

look at the relevant implementations in `__readonly_only_for_inspiration__`;

identify the reusable product shape;

design a generic component or utility for the library;

implement it in the current framework style;

add a demo with realistic mock data;

add focused tests;

review and refactor.

The important rule is this:

the reference folder should influence product behavior and ergonomic API design, not become a source of copied app-specific code.

C00

## How Codex should use the reference folder

Codex should consult the reference folder before implementing any component that is meant to replace an existing local pattern.

For example, before implementing `awwbookmarklet-toolbar`, Codex should inspect the action row patterns in tools such as Page Content Select, Page Screenshot, Session Snapshot, Multi Browser, Mini Browser, and Notifications and Reminders.

Before implementing `awwbookmarklet-field`, Codex should inspect form field patterns in Notifications and Reminders, Session Snapshot, Settings, and Page Content Select.

Before implementing `awwbookmarklet-rich-preview`, Codex should inspect preview and sanitization patterns in Page Content Select, Page Screenshot, Rich Text to Markdown, Session Snapshot, and preview surfaces.

Before implementing `awwbookmarklet-dialog`, Codex should inspect the command palette and help overlay patterns in Multi Browser.

Before implementing `awwbookmarklet-browser-panel`, Codex should inspect Mini Browser, Multi Browser, and preview iframe surfaces.

This does not mean Codex should wait for perfect certainty. It means Codex should avoid designing components in the abstract when real application evidence is available.

The product principle is:

when the current applications already show the problem, Codex should use them as design data.

D00

## Required investigation step for every chunk

Before implementing each chunk, Codex should write a short internal implementation note in the working context or task plan.

The note should answer these questions:

What existing library files are relevant?

What reference-folder files show the same pattern?

What reusable shape is being extracted?

What will remain app-specific?

What public tags, attributes, events, slots, methods, or utilities will be added?

What tests will cover the important behavior?

What demo will prove the component ergonomics?

Codex does not need to create a permanent document for every note unless the repository already has an appropriate place for implementation notes. But Codex should do the thinking before writing code.

The goal is to prevent accidental implementation by momentum.

E00

## Development loop for every chunk

For every chunk, Codex should follow the same loop.

First, inspect the existing source and the relevant reference implementations.

Second, define the smallest coherent implementation that satisfies the public behavior.

Third, implement the component, utility, or refactor in the source structure that already exists.

Fourth, add or update the demo page so the behavior is visible with realistic mock data.

Fifth, add focused tests.

Sixth, run the available Bun tests and build checks.

Seventh, refactor only after tests and demo behavior make the duplication or awkwardness visible.

Eighth, review the public API names, slot names, event names, and accessibility behavior before moving to the next chunk.

Codex should not implement a component, skip the demo, and promise that the demo can be added later.

Codex should not implement a visual component without tests for its non-visual behavior.

Codex should not add tests only for happy paths.

Codex should not over-refactor before the repeated pattern is proven.

F00

## Testability principle

The components should be designed so that demo data, mock data, and real application data pass through the same public API.

A component should not have one private path for demo behavior and another path for production behavior.

The demo should use mock data, but it should use the component the way a real tool would use it.

For example, a command palette demo may use mock commands, but the command palette should consume those commands through the same registry or data API that a real app will use.

A list item demo may use fake session rows, but the list and item components should not know those rows are fake.

A rich preview demo may use sample HTML, but the preview component should use the same sanitization, assignment, empty-state, and layout logic it would use in production.

A browser panel demo may use a safe example URL or mocked loading states, but its loading, error, retry, and external-open surfaces should be the same surfaces used by real browser tools.

The implementation principle is:

mock data is allowed;

mock component logic is not.

G00

## Testing standard

Good test coverage is mandatory.

This does not mean Codex should write a large number of shallow tests. The target is smart coverage.

Codex should choose test cases that cover equivalence classes, boundary conditions, normal behavior, error behavior, unexpected inputs, and state transitions.

The tests should answer questions like these:

Does this component expose the same public behavior with mock data and real-like data?

Does it handle empty input?

Does it handle long text?

Does it handle disabled, busy, selected, open, closed, success, warning, danger, and error states where relevant?

Does it dispatch the right event exactly once?

Does it avoid dispatching an action when disabled?

Does it preserve accessible names and relationships?

Does it behave predictably when required slots are missing?

Does it avoid throwing on malformed or unexpected input?

Does it recover from failure in the way the user can understand?

Codex should prefer tests that protect product behavior over tests that merely snapshot implementation details.

H00

## What should be tested with unit tests

Pure utilities should have direct unit tests.

This includes URL helpers, text helpers, ID helpers, date helpers, filename helpers, blob download helpers where possible, clipboard result normalization, and sanitization behavior.

Component methods and attributes should have tests when the test environment supports custom elements and DOM behavior.

Examples of unit-testable behavior include:

a field sets invalid state when an error exists;

a status line changes tone correctly;

an alert dispatches a dismiss event;

a list item does not fire selection when an action slot button is clicked;

a copy helper returns fallback when Clipboard API is unavailable;

a sanitizer removes unsafe attributes and preserves allowed formatting;

a URL helper distinguishes URLs from search queries;

a button with `busy` does not dispatch duplicate activation.

Codex should avoid relying only on visual inspection for behavior that can be tested deterministically.

I00

## What should be tested with browser-level or DOM interaction tests

Some behavior is not meaningfully validated by pure unit tests.

Codex should use the best available test tools in the repository. If browser-level tests already exist, Codex should add to them. If the project only has Bun DOM-oriented tests, Codex should still add the best possible interaction tests and clearly leave notes for behavior that requires real browser verification.

Behavior that deserves browser-level testing includes:

dialog focus trapping and focus restoration;

Escape and backdrop-close policy;

toolbar wrapping at narrow width;

toast layering and non-focus-stealing behavior;

combobox and URL picker keyboard navigation;

URL picker popup positioning after a parent window moves;

rich preview layout containment for wide tables, images, and code blocks;

browser panel loading and error overlays;

iframe pointer coordination with draggable windows;

command palette filtering and execution;

list item actions not toggling the row;

manual copy fallback selecting text.

If a behavior cannot be reliably tested in the current environment, Codex should not ignore it. Codex should document the limitation and add a demo scenario that makes manual validation straightforward.

J00

## Demo requirements

The demo page is part of the implementation contract.

Every new public component should be represented in the demo.

The demo should not show only toy examples like one empty button. It should show the component in the kind of composition where it will actually be used.

The demo should use realistic mock data based on the reference folder patterns.

For example, the list and card demo should include rows that resemble captured page blocks, saved sessions, reminders, bookmark rows, and screenshot entries.

The rich preview demo should include headings, paragraphs, links, images, a table, long code, blockquotes, and an empty state.

The field demo should include required fields, help text, errors, prefixes, suffixes, horizontal layout, vertical layout, disabled controls, and number/unit fields.

The toolbar demo should include primary, secondary, danger, busy, disabled, compact, wrapping, and mixed content examples.

The dialog demo should include a command-palette-like surface and a confirmation-like surface.

The toast demo should include repeated key replacement, success, warning, danger, and auto-dismiss behavior.

The browser panel demo should include loading, loaded, blocked/error, retry, and external-open states.

The demo should make it easy to judge whether a component is ergonomic before any real app migration begins.

K00

## Demo architecture requirement

The demo should be designed to accept mock data through ordinary component APIs.

Codex should avoid hardcoding demo-only DOM manipulation inside components.

If a demo needs sample data, it should create that data in the demo module and pass it to the component through public properties, attributes, slots, or events.

The demo may include helper functions for building sample rows or sample commands, but those helpers should not become hidden dependencies of the component.

The demo should be structured so that later real app migration can copy the same usage pattern and replace mock data with real data.

The expected design is:

same component;

same public API;

different data source.

L00

## Refactoring rule

Codex is encouraged to refactor the UI library when refactoring improves testability, reuse, or clarity.

Codex should not refactor simply to make the code look more abstract.

A refactor is justified when at least one of these is true:

two or more implemented components need the same behavior;

a behavior needs focused tests but is trapped inside a component;

a component is becoming too large to reason about;

overlay positioning is being duplicated;

tone, density, or state styling is being repeated unsafely;

an API boundary is awkward in the demo;

the reference implementations show the same logic repeated across several apps.

Codex should prefer small reusable helpers over large generic systems.

The rule is:

extract only after the shape is visible.

M00

## Code style continuity

Codex should preserve the current code style.

The existing library uses plain JavaScript modules, custom elements, shadow DOM, template strings, private class fields, `css`, `adoptStyles`, `BASE_COMPONENT_STYLES`, public tag constants, and explicit registration.

New components should fit that style.

Codex should not introduce a framework dependency unless the project already depends on it or the user explicitly approves it.

Codex should not introduce TypeScript unless the project is already TypeScript-based.

Codex should not introduce a large styling system.

Codex should not replace the custom element architecture with another model.

Codex should preserve Bun as the build and test environment.

N00

## Data API design rule

Components that render repeated data should support real data without becoming application-specific.

For simple layout components, slots are enough.

For data-driven components such as command palette, URL picker, list demos, metrics, and maybe browser panel state, Codex should choose a minimal public data API.

A good data API is stable, plain, and domain-neutral.

For example, a command palette may accept command objects with ID, label, group, shortcut, keywords, disabled state, and run behavior.

A metric card may accept label, value, tone, and description.

A URL picker may emit query events and let the host provide suggestions.

A list item should probably remain mostly slot-based, because the app domain varies widely.

The important rule is:

the library should make common UI behavior reusable without forcing every app into one data model.

O00

## Mock-data equivalence rule

When Codex writes a demo with mock data, it should ask whether a real app could provide the same shape of data.

If the answer is no, the component API is probably wrong.

Mock data should imitate the real problems found in `__readonly_only_for_inspiration__`: long titles, missing titles, URLs, timestamps, disabled states, warnings, failed captures, selected rows, empty lists, large HTML previews, unavailable clipboard, blocked iframes, and dense toolbars.

A good demo should include imperfect data.

The tools being replaced do not only display clean happy-path examples. They display user content, page content, browser state, capture state, reminders, bookmarks, and error states.

P00

## Error-handling rule

Components should fail gracefully.

A component should not throw because optional slots are missing.

A component should not crash because a data item lacks a label.

A component should not enter an impossible state because an unknown tone or variant is provided.

A component should not silently claim success when a copy, download, sanitize, or navigation operation failed.

Codex should normalize unknown values to safe defaults.

Error states should be visible when the user needs to act.

Developer errors can still throw when the contract is fundamental, but UI components should be resilient to incomplete app data.

Q00

## Accessibility review rule

Codex should perform an accessibility review at the end of every component chunk.

This review should check names, roles, keyboard behavior, focus states, disabled states, live regions, and ARIA relationships.

Codex should not use ARIA to fake behavior that the component does not actually implement.

For example, a component should not claim `role="listbox"` unless arrow-key and selected-option behavior is implemented.

A dialog should not claim modal behavior unless focus is actually constrained.

A combobox should not claim expanded suggestion behavior unless the popup and active descendant behavior are implemented.

Accessibility should be treated as product behavior, not metadata.

R00

## Chunk 1: foundation, tokens, tags, and shared helpers

Codex should begin by preparing the foundation for application-level components.

The work in this chunk is to extend the library vocabulary without building every component at once.

Codex should inspect:

`src/core/constants.js`;

`src/core/styles.js`;

`src/themes/default-theme.js`;

`src/components/register-all.js`;

the existing component style patterns;

the reference folder's shared shell, button, panel, status, and tone CSS.

Codex should implement or prepare:

new `TAGS` entries for the first P0 components;

new public tokens required by tone, surface, muted text, alerts, cards, overlays, and rich previews;

small internal helpers for tone normalization, boolean attribute checks, ID creation, focusable-element lookup, and safe event dispatch if needed;

a clear place for clipboard, HTML, URL, text, date, and file utilities as they are added.

Acceptance criteria:

The project still builds.

Existing components still register.

No existing public tag is renamed.

New tokens have defaults.

New helpers are covered by tests if they contain logic.

No large component is implemented in this chunk unless it is necessary to validate the foundation.

S00

## Chunk 2: app shell, toolbar, status line, alert, and panel header

This chunk creates the first application composition layer.

Codex should inspect:

repeated shell and header patterns in `__readonly_only_for_inspiration__`;

repeated action rows;

repeated status and warning setters;

repeated banner, privacy note, disabled-state, and draft-restore surfaces.

Codex should implement:

`awwbookmarklet-app-shell`;

`awwbookmarklet-toolbar`;

`awwbookmarklet-status-line`;

`awwbookmarklet-alert`;

panel header/action slot refinements for `awwbookmarklet-panel`, or a compatible section component if modifying panel is risky.

The demo should show:

a complete app shell;

a compact toolbar;

a wrapping toolbar;

a toolbar with mixed controls;

status lines in neutral, info, success, warning, and danger tones;

alerts with title, actions, dismissible behavior, and different tones;

a panel with title, actions, body, and footer.

Tests should cover:

status line tone normalization;

alert dismiss event behavior;

toolbar disabled or busy state behavior if implemented;

panel backward compatibility;

app shell slot rendering;

no crash when optional slots are missing.

Acceptance criteria:

A Page Content Select-like panel can be represented without local `pcs-panel-head` or `pcs-controls` wrappers.

A Notifications and Reminders-like disabled banner can be represented as an alert.

A Rich Text to Markdown-like app surface can be represented with app shell, toolbar, status line, and body slots.

T00

## Chunk 3: button refinements and field component

This chunk makes actions and forms coherent.

Codex should inspect:

existing `awwbookmarklet-button`;

existing `awwbookmarklet-icon-button`;

form field patterns in Notifications and Reminders, Settings, Session Snapshot, Page Content Select, and Page Screenshot;

error and help text patterns.

Codex should implement:

button `variant`;

button `tone`;

button `busy`;

button `pressed` if useful;

button `command` event dispatch;

icon button accessible label improvements;

`awwbookmarklet-field`.

The demo should show:

primary, default, ghost, link-style if implemented, danger, success, warning, busy, disabled, and command-bound buttons;

icon buttons with labels and tones;

fields with label, help, error, prefix, suffix, required, disabled, horizontal, vertical, inline, and unit examples.

Tests should cover:

disabled buttons do not dispatch activation;

busy buttons do not duplicate activation if that is the chosen contract;

command buttons dispatch `awwbookmarklet-command-request` with the correct detail;

field generates or applies label/help/error relationships;

field sets invalid state when error exists;

field handles missing slotted control without throwing.

Acceptance criteria:

A Reminder form field can be represented with `awwbookmarklet-field`.

A Session Snapshot JPEG quality input can be represented with label, number input, min/max, and suffix/unit text.

A toolbar can contain command-bound buttons without app-specific event wrapper code.

U00

## Chunk 4: empty state, state overlay, list, list item, and card

This chunk handles repeated dynamic content surfaces.

Codex should inspect:

Page Content Select block cards and saved session rows;

Session Snapshot capture rows;

Notifications and Reminders grouped rows;

Bookmark Manager result rows and empty states;

Settings rows;

page screenshot preview state surfaces.

Codex should implement:

`awwbookmarklet-empty-state`;

`awwbookmarklet-state-overlay`;

`awwbookmarklet-list`;

`awwbookmarklet-list-item`;

`awwbookmarklet-card`.

The demo should show:

empty lists;

no-results states;

loading overlays;

error overlays;

blocked overlays;

list items with title, meta, description, thumbnail, status, actions, selected, disabled, warning, danger, and success states;

cards with header, actions, body, footer, selected state, and dense content.

Tests should cover:

empty state rendering when list has no items;

list item action clicks do not trigger row selection;

selected and disabled state reflection;

unknown tone fallback;

state overlay open/closed or state transitions;

long text does not remove required semantic elements.

Acceptance criteria:

A Session Snapshot row can be represented with a list item.

A Page Content Select block card can be represented with a card or list item.

A Bookmark Manager no-results surface can be represented with `awwbookmarklet-empty-state`.

V00

## Chunk 5: rich preview and sanitization baseline

This chunk addresses preview-heavy tools and page-derived HTML.

Codex should inspect:

Page Content Select preview CSS and sanitizer;

Page Screenshot preview rendering and sanitizer;

Rich Text to Markdown input/output behavior;

Session Snapshot shadow preview host;

preview content CSS.

Codex should implement:

`awwbookmarklet-rich-preview`;

a shared sanitization utility or clearly separated sanitization hook;

content CSS for headings, paragraphs, lists, links, tables, images, blockquotes, code, and preformatted text;

empty state behavior for the preview.

The demo should show:

simple rich content;

a wide table;

a large image;

long code;

blockquote;

links;

empty state;

unsafe HTML sample if the sanitizer is implemented and can demonstrate removal safely.

Tests should cover:

unsafe script removal;

event-handler attribute removal;

dangerous URL removal;

allowed formatting preservation;

empty input behavior;

assignment through public API;

unknown or malformed HTML handling;

layout-related behavior where the test environment can inspect class or structure.

Acceptance criteria:

Page-derived HTML can be displayed in a constrained, theme-compatible preview component.

The component does not falsely imply complete sanitization if only a baseline sanitizer exists.

The component can be used with mock preview data in demo and real sanitized data in apps through the same API.

W00

## Chunk 6: clipboard helper and manual copy fallback

This chunk removes repeated copy/fallback code.

Codex should inspect:

manual copy fallback in Page Content Select;

copy feedback in Page Screenshot;

copy behavior in Rich Text to Markdown;

Mini Browser copy URL/bookmark/markdown behavior.

Codex should implement:

`copyToClipboard()` utility;

structured copy result objects;

plain text support;

HTML support if environment support can be implemented safely;

image blob support if feasible, otherwise clearly stage it;

`awwbookmarklet-manual-copy`.

Codex may implement `awwbookmarklet-copy-button` if it naturally follows, but the required P0 result is the helper plus manual fallback.

The demo should show:

successful copy path if possible;

forced fallback path;

manual copy text area;

copy error state;

copying plain text and rich HTML if supported.

Tests should cover:

Clipboard API unavailable;

Clipboard API success;

Clipboard API rejection;

fallback result;

empty payload behavior;

text plus HTML payload normalization;

manual copy component rendering and value setting.

Acceptance criteria:

Apps no longer need to create their own hidden manual-copy textareas.

Copy failure produces a recoverable user-facing path.

The helper can be tested with mocked clipboard APIs.

X00

## Chunk 7: overlay foundation, dialog, and toast

This chunk creates the shared overlay behavior needed by later command and URL components.

Codex should inspect:

current menu portal behavior;

window manager and desktop root behavior;

Multi Browser command palette and help modal;

Mini Browser and preview toast behavior;

existing z-index and hostile-page overlay patterns.

Codex should implement:

shared internal overlay positioning or portal helper;

`awwbookmarklet-dialog`;

`awwbookmarklet-toast`;

`showToast()` helper;

optional internal toast stack.

The demo should show:

modal dialog;

non-destructive confirmation dialog;

dialog with form content;

dialog opened from a button and focus restored to that button;

toast success, info, warning, danger;

toast key replacement;

toast auto-dismiss controls.

Tests should cover:

dialog open and close events;

Escape close policy;

backdrop close policy;

focus restoration where testable;

toast creation;

toast replacement by key;

toast timeout behavior with fake timers if available;

toast does not focus itself.

Acceptance criteria:

Command palette and shortcut help can later be built on dialog without creating a separate modal framework.

Toast feedback can replace app-specific toast code.

Overlay behavior is centralized enough that later URL picker and combobox work do not duplicate menu positioning code.

Y00

## Chunk 8: browser panel

This chunk creates the shared iframe application surface.

Codex should inspect:

Mini Browser iframe, loading, address, and error patterns;

Multi Browser tile iframe state overlays;

preview iframe CSS;

browser frame sandbox and referrer policy usage.

Codex should implement:

`awwbookmarklet-browser-panel`;

iframe rendering;

loading overlay;

error or blocked overlay;

retry event;

external-open event;

safe default sandbox and referrer handling;

slots for address/actions/overlays if needed.

The demo should show:

loading state;

loaded state;

blocked/error state;

retry action;

open externally action;

toolbar integration;

mocked state transitions without depending on network success.

Tests should cover:

src reflection;

iframe attributes;

loading state rendering;

error state rendering;

retry event dispatch;

external-open event dispatch;

missing src behavior;

state transitions.

Acceptance criteria:

Mini Browser and Multi Browser can use the same browser frame surface.

The component can be exercised with mock states in demo and real iframe navigation in production.

Z00

## Chunk 9: command palette and shortcut help

This chunk exposes the command system through UI.

Codex should inspect:

current `CommandRegistry`;

Multi Browser command palette rendering;

Multi Browser shortcut help overlay;

menu command dispatch behavior.

Codex should implement:

`awwbookmarklet-command-palette`;

`awwbookmarklet-shortcut-help`;

a command data adapter if needed;

filtering by label, ID, group, keywords, and shortcut;

disabled command display;

command execution event path.

The demo should show:

mock commands;

command groups;

shortcuts;

disabled commands with reason;

filtering;

empty result;

execution feedback through status line or toast.

Tests should cover:

filter matching;

empty query behavior;

disabled command behavior;

single execution per Enter or click;

event detail correctness;

keyboard navigation if implemented in this chunk;

unknown command data handling.

Acceptance criteria:

The command palette does not duplicate app-specific switch statements.

The command UI can consume mock commands in the demo and real commands in an app through the same API.

AA00

## Chunk 10: combobox and URL picker

This chunk implements the overlay-heavy URL entry system.

Codex should inspect:

`url_picker.js`;

`url_picker_core.js`;

`url_picker_canonical.js`;

Mini Browser address picker;

Multi Browser tile URL picker;

URL/search normalization in browser cores;

bookmark row and dropdown behavior.

Codex should implement:

`awwbookmarklet-combobox`;

`awwbookmarklet-url-picker`;

query event;

select event;

URL submit event;

bookmark toggle event;

keyboard navigation;

loading and empty suggestions;

grouped suggestions;

popup positioning through the shared overlay helper.

The demo should show:

mock suggestions;

Open URL group;

Search group;

Bookmarks group;

Recent group;

empty state;

loading state;

bookmark toggle;

keyboard navigation;

a parent window move scenario if feasible.

Tests should cover:

query event dispatch;

suggestion selection;

Enter behavior;

Escape behavior;

arrow navigation;

bookmark toggle does not submit the row;

URL versus search normalization if included;

popup state after value changes;

malformed input handling.

Acceptance criteria:

Mini Browser and Multi Browser can use the same URL picker instead of the local picker root and dropdown CSS.

The component uses the same logic with mock suggestions in demo and real bookmarks/history/search data in production.

AB00

## Chunk 11: P1 form and summary components

After the P0 foundation and overlay-heavy components are stable, Codex should implement the smaller P1 form and summary components.

Codex should implement, as needed:

`awwbookmarklet-rich-editor`;

`awwbookmarklet-metric-grid`;

`awwbookmarklet-metric-card`;

`awwbookmarklet-toggle-field`;

`awwbookmarklet-radio-group`;

`awwbookmarklet-segmented-control`;

`downloadBlob()` and file helpers.

The demo should show these components in realistic settings: reminder stats, mode selectors, settings rows, rich editable notes, and export buttons.

Tests should cover value changes, disabled states, keyboard behavior, invalid values, and event dispatch.

Acceptance criteria:

Notifications and Reminders can represent its stat cards and filters.

Settings can represent checkbox, number, enum, and radio-like rows without local UI grammar.

Rich Text to Markdown and Page Screenshot can use a shared rich editor surface.

AC00

## Chunk 12: workspace and advanced app accelerators

Codex should not start here.

Only after the earlier components are stable should Codex consider:

`awwbookmarklet-workspace`;

`awwbookmarklet-tile`;

layout controller;

preset picker;

saved items panel;

draft/session storage helper;

settings schema renderer.

These are useful but behavior-heavy. If implemented too early, they will become app-specific abstractions.

The workspace chunk should begin by re-reading Multi Browser closely and identifying which behavior belongs in a generic workspace and which behavior belongs to Multi Browser itself.

Acceptance criteria for any future workspace work:

tiles can host browser panels;

layout can switch between grid and floating if supported;

focus state is explicit;

serialization and restore are testable;

iframe state overlays reuse browser panel or state overlay components;

hotkeys use the shared hotkey or command system if implemented.

AD00

## Required review after every chunk

At the end of every chunk, Codex should review the implementation against these questions.

Does this component remove a repeated pattern from at least two real tools?

Does the API make sense with both mock data and real application data?

Is the demo realistic enough to expose layout and state problems?

Are the tests focused on behavior rather than incidental markup?

Does the component preserve the retro desktop style?

Does it work in a constrained window?

Does it avoid horizontal overflow where possible?

Does it expose accessible names and relationships?

Does it avoid app-specific naming?

Does it avoid introducing a new framework?

Does it leave the existing components working?

If the answer to one of these is no, Codex should fix the problem or leave a clear implementation note explaining why it is intentionally deferred.

AE00

## Required final report from Codex after implementation pass

After completing an implementation pass, Codex should produce a concise report.

The report should include:

which chunks were completed;

which files were added or changed;

which components were added;

which public APIs were added;

which demos were added;

which tests were added;

which tests and build commands were run;

what behavior still needs manual browser verification;

what was intentionally deferred;

what risks remain.

The report should not be a rewrite plan disguised as completion.

The report should distinguish between implemented, partially implemented, deferred, and blocked work.

AF00

## Non-negotiable acceptance criteria for the whole appendix

The reference folder `__readonly_only_for_inspiration__` was consulted for each relevant component family.

The folder was not modified.

New components were implemented in the existing library architecture.

New components were registered and demoed.

Mock data in the demo uses the same public APIs that real application data would use.

Tests cover normal behavior, boundary behavior, error behavior, and unexpected input where relevant.

The implementation remains compatible with Bun build and test workflows.

The code is more testable after the work, not less.

Reusable helpers are extracted only where reuse is visible.

The result moves the library toward an application UI kit, not just a larger pile of controls.

AG00

## Final instruction to Codex

Codex should think of this work as careful product extraction.

The existing side projects already contain the design pressure. They show what users need and where the current library is too primitive. The job is to translate that pressure into reusable components with clear APIs, realistic demos, and durable tests.

The correct implementation style is incremental, evidence-based, and test-driven enough to protect behavior without freezing the design too early.

Build the smallest coherent version of each shared component.

Demo it with realistic mock data.

Test the behavior that matters.

Refactor when reuse becomes visible.

Then move to the next chunk.
