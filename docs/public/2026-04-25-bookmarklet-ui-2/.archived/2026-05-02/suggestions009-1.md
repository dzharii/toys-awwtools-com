2026-04-25

Although this specification includes examples that mention Power BI, GitHub, Jira, dashboards, pull requests, browser extensions, iframes, page extraction, and other concrete application contexts, those examples are illustrative only. They are included to make the intended user experience and component behavior easier to understand. They do not define app-specific implementation scope.

The scope of this work is the AWW Bookmarklet UI component library. Codex should implement general-purpose reusable components, utilities, APIs, events, styling hooks, and documentation that allow software engineers to present structured context data in a compact and ergonomic way. The library should make it easy for downstream developers to render titles, statuses, identifiers, warnings, copyable values, progress, and contextual actions, but it should not know how to extract those values from any specific third-party product or web application.

Codex should not implement Power BI integration, GitHub parsing, Jira extraction, dashboard scraping, iframe intelligence, user-specific adapter logic, page-specific selectors, or browser-extension-specific automation as part of this component-library feature. Those concerns belong to downstream application code, future adapter packages, or separate product-specific integrations.

The responsibility of this project is to provide a coherent generic foundation: a context segment model, parsing helpers, segment rendering components, context/status/titlebar surfaces, accessible interactions, copy/action events, theming support, and clear ergonomic APIs. Downstream engineers should be able to supply their own data and behavior through those APIs without modifying the component internals for normal use cases.


Code quality is part of the feature scope, not a cleanup task after implementation. Codex should maintain a clear, discoverable, and high-quality codebase while adding these components. New modules should have names that reveal their responsibility, component boundaries should remain easy to understand, and shared utilities should be placed where future maintainers can find them without reading every component file. When a behavior is non-obvious, especially around segment normalization, keyed updates, copy events, titlebar drag boundaries, accessibility behavior, or reduced-motion handling, Codex should add concise developer notes or comments that explain the intent and the expected use case. These comments should clarify design decisions, not restate the code.

The implementation should also improve discoverability through tests, examples, and demo usage. Tests should cover not only correctness, but also the intended developer-facing behavior: string parsing, structured segment input, event dispatch, copy flows, changed-segment updates, tone handling, accessibility expectations, and integration with registration and exports. Examples and demos should show common usage patterns clearly enough that another engineer, or another coding agent, can understand why each component exists and how it is meant to be used. The goal is for the codebase itself to communicate the component system's design, not require future readers to reconstruct the architecture from scattered implementation details.


# Product Requirements Document: Segment-Based Context Chrome Components for AWW Bookmarklet UI

A00. Document purpose

This document defines the product direction, component architecture, implementation requirements, interaction model, and UX expectations for a new segment-based context chrome system in the AWW Bookmarklet UI Framework.

The purpose of this feature is to give the framework a reusable way to show compact, structured, live, and actionable information inside browser-tool chrome. The original idea began as a smarter retro title bar. After analysis, the better direction is a family of focused components built around one shared primitive: context segments.

A title bar should not become an extraction engine. A status bar should not become a dashboard. A dashboard should not be squeezed into one line of chrome. Instead, the framework should provide a small set of components that share a common segment model but each have a clear responsibility.

The intended result is a reusable UI system that can render things like this:

```txt
GitHub | PR #1824 | feature/context-bar | CI passing | 2 approvals
```

or:

```txt
Power BI | Finance | Sales Dashboard | Updated 09:42 | Live
```

inside the AWW retro-modern interface, with compact separators, useful status tones, stable updates, copyable values, and clear extension points for downstream tools.

A01. Core product decision

The framework should introduce a segment-based context component family, not one monolithic smart titlebar.

The approved direction is:

```txt
context segment utilities
        |
        v
awwbookmarklet-segment-strip
        |
        +--> awwbookmarklet-context-bar
        |
        +--> awwbookmarklet-status-strip
        |
        +--> awwbookmarklet-titlebar
        |
        +--> awwbookmarklet-context-panel
```

This structure keeps responsibilities separated. The shared utilities define and normalize context segments. The segment strip renders the compact one-line sequence. The context bar adds top-level chrome and optional progress. The status strip adapts the same segment model for quieter operational state. The titlebar adapts the same model to actual window chrome. The context panel renders the same data in an expanded, readable layout.

The generic library should not scrape Power BI, GitHub, Jira, Grafana, or internal web applications. It should not contain application-specific adapters. The generic library should render normalized context. Application code, extension code, or future adapter packages can extract the data and provide it to the components.

A02. Product background

AWW Bookmarklet UI is a compact web component framework for bookmarklets, injected tools, and extension-like browser utilities. It already has a desktop root, windows, title bars, menus, buttons, form controls, status bars, panels, cards, alerts, dialogs, browser panels, command palettes, URL pickers, and theming infrastructure.

The current `awwbookmarklet-window` has an internal titlebar. That titlebar currently behaves like a traditional window title: it has a system menu button, a text title, and a close button. The current `awwbookmarklet-statusbar` is also simple: it lays out slotted cells along the bottom edge of a window.

The new feature grows from a practical observation. In many web tools, the most important information is scattered across the page. A user may need to scroll, inspect side panels, copy a branch name, find a PR number, identify an environment, check a build state, confirm a customer ID, or determine whether a dashboard is fresh. Browser page titles are often weak. Embedded iframes often expose almost no useful chrome. Dashboards may say only "Power BI" while the actual report name is buried inside the page.

The framework can help by offering a generic, reusable information surface. It should allow a tool to place high-value context into predictable chrome. That chrome might appear inside a window titlebar, as a status strip, as a top context bar, or as an expanded details panel.

A03. Product principle

The guiding principle is: the framework should display context, not discover it.

Discovery belongs to application code. Rendering belongs to the component library.

A browser extension can inspect the page, read DOM state, listen to iframe messages, observe document titles, or call application-specific APIs. It then produces a normalized list of segments. The AWW component system renders those segments consistently.

This separation protects the generic library from becoming too broad. It also lets the same rendering components serve many tools: GitHub helpers, Power BI shells, dashboard launchers, admin consoles, documentation extractors, capture tools, and internal browser utilities.

B00. Problem statement

The current titlebar and statusbar components are too primitive for richer browser-tool workflows. They can show simple text or slotted cells, but they do not provide a structured way to show live, segmented, copyable, tone-aware, frequently updated context.

If this problem is solved by putting everything into `awwbookmarklet-window`, the window component will become too large and too coupled to specific workflows. If it is solved by putting everything into `awwbookmarklet-statusbar`, the statusbar will become a hidden dashboard. If every downstream tool implements its own solution, the framework loses its shared UI grammar.

The implementation must therefore provide a reusable context system that supports common behavior once and lets several components compose it differently.

The common behavior includes parsing pipe-delimited strings, rendering visual separators, rendering tone-aware segments, keeping layout compact, copying values, highlighting segment changes, dispatching action events, and supporting keyboard access.

B01. Goals

The first goal is to create a shared context segment model and utilities that can be used by multiple components.

The second goal is to create a low-level `awwbookmarklet-segment-strip` component that renders a compact one-line sequence of segments.

The third goal is to create a higher-level `awwbookmarklet-context-bar` component that presents the strip as a general-purpose top context surface, with optional leading content, actions, busy state, and progress.

The fourth goal is to create a `awwbookmarklet-status-strip` component or equivalent status-oriented rendering path that uses the same segment model for quieter bottom-bar or status-line use cases.

The fifth goal is to plan titlebar integration through a future or immediate `awwbookmarklet-titlebar` component, while preserving backward compatibility with the existing `AwwWindow` title behavior.

The sixth goal is to define an expanded `awwbookmarklet-context-panel` component that can render the same segment data in a richer layout without forcing the one-line bar to become a dashboard.

The seventh goal is to keep extraction, adapters, user configuration, aliases, and page-specific scraping out of the generic UI library.

B02. Non-goals

This project should not implement Power BI, GitHub, Jira, Grafana, Confluence, Google Docs, or internal application adapters inside the generic library.

This project should not implement user configuration storage, alias rules, URL pattern matching, or extraction recipes in the first version.

This project should not implement a full dashboard inside the titlebar.

This project should not implement constant marquee text as the default overflow behavior.

This project should not replace the entire `AwwWindow` titlebar implementation before the standalone segment components are proven, unless Codex determines that a refactor is clearly cleaner and safer.

This project should not rely on single-click copy by default. Copy behavior must be explicit enough to avoid surprising users.

B03. Implementation authority

Codex may refactor, reorganize, or rewrite existing implementation details where doing so improves coherence, maintainability, testability, or integration quality. This project is experimental, and minimal-change preservation is not the priority when it conflicts with a cleaner architecture.

Codex should use its best technical judgment when resolving inconsistencies between this document, existing source code, and earlier notes. The preferred solution is the one that best fits the AWW architecture, keeps component responsibilities clear, avoids unnecessary coupling, and produces a maintainable public API.

C00. Shared data model: context segments

The context segment is the foundation of this feature. It is a small normalized unit of displayable context.

A segment may represent a page title, application name, report name, branch name, PR number, status, freshness value, environment name, warning, build state, user role, identifier, or action hint.

The model should be small enough to understand but rich enough to support future rendering modes.

Recommended shape:

```js
{
  key: "branch",
  label: "Branch",
  value: "feature/context-bar",
  shortValue: "context-bar",
  copyValue: "feature/context-bar",
  kind: "branch",
  tone: "neutral",
  priority: 60,
  title: "Git branch copied from page header",
  source: "adapter",
  stale: false,
  changed: false,
  disabled: false,
  actions: [
    { id: "copy", label: "Copy branch" },
    { id: "reveal", label: "Reveal source" }
  ]
}
```

The `key` field is essential. It gives the renderer a stable identity for diffing and update highlighting. The `value` field is the displayed value. The `label` field is useful for accessibility, expanded views, tooltips, and copied label-value formats. The `shortValue` field can be used later for collapsed layouts. The `copyValue` field allows visible text and copied text to differ. The `kind` field gives semantic meaning without tying the component to a specific application. The `tone` field maps to the existing AWW tone vocabulary: neutral, info, success, warning, and danger. The `priority` field prepares the system for overflow handling. The `source` field can support diagnostics later. The `actions` field lets applications define segment-specific commands without baking domain logic into the renderer.

C01. Segment utility module

Create a focused utility module:

```txt
src/core/context-segments.js
```

This module should own parsing, normalization, comparison, and small helper functions for context segments.

Expected exports may include:

```js
parseContextSegments(value)
normalizeContextSegment(segment, index)
normalizeContextSegments(value)
segmentsEqual(prev, next)
getSegmentCopyValue(segment)
```

Exact names may be adjusted if Codex finds a cleaner implementation, but the responsibilities should remain focused.

The utility module should not import visual components. It should be safe to test independently.

C02. Pipe-delimited shorthand

The framework should support pipe-delimited string input because it is practical and easy for developers.

Example input:

```txt
GitHub | PR #1824 | feature/context-bar | CI passing
```

Expected normalized result:

```js
[
  { key: "segment-0", value: "GitHub", kind: "text", tone: "neutral" },
  { key: "segment-1", value: "PR #1824", kind: "text", tone: "neutral" },
  { key: "segment-2", value: "feature/context-bar", kind: "text", tone: "neutral" },
  { key: "segment-3", value: "CI passing", kind: "text", tone: "neutral" }
]
```

The pipe parser should split on unescaped pipes, trim whitespace, and drop empty segments. It should not attempt application-specific inference. If a caller knows that a value is a branch, PR number, or status, the caller should provide structured segments.

The pipe syntax is a shorthand input. It is not the architecture.

C03. Segment diffing

The segment renderer should update by key where practical. When a segment with the same key receives a new value or tone, the component should patch that segment and mark it as changed briefly. This avoids visually redrawing the whole bar when only one status value changes.

The implementation does not need a full virtual DOM. A keyed map of rendered segment nodes is enough.

The visible behavior should be restrained. If `CI passing` changes to `CI failed`, only that segment should highlight. If the title segment remains the same, it should not flash.

D00. Component: `awwbookmarklet-segment-strip`

`awwbookmarklet-segment-strip` is the lowest-level visual component. It renders a one-line list of context segments.

This component must not know about windows, iframe extraction, page adapters, dashboards, or application-specific behavior. It simply renders the normalized segments.

It should support both string and structured input:

```html
<awwbookmarklet-segment-strip value="GitHub | PR #1824 | feature/context-bar | CI passing"></awwbookmarklet-segment-strip>
```

and:

```js
strip.segments = [
  { key: "app", value: "GitHub", kind: "app", priority: 10 },
  { key: "pr", label: "PR", value: "#1824", copyValue: "1824", kind: "id", priority: 90 },
  { key: "branch", label: "Branch", value: "feature/context-bar", copyValue: "feature/context-bar", kind: "branch", priority: 100 },
  { key: "ci", value: "CI passing", tone: "success", kind: "status", priority: 80 }
];
```

D01. Segment strip responsibilities

The segment strip is responsible for compact rendering, separators, truncation, segment tone styles, basic copy affordances, keyboard access for interactive segments, and segment-level update highlighting.

It should render separators between segments. A separator should not be the literal pipe character. The default visual separator should fit the AWW retro-modern style, likely as a compact beveled divider using border and highlight colors.

The segment strip should stay one line by default. It should avoid wrapping unless an explicit mode later allows it. Overflow should be handled through truncation, title tooltip, optional future priority collapse, or hover/focus reveal behavior.

D02. Segment strip copy behavior

Copy is one of the main reasons this component exists. Values such as branch names, PR numbers, customer IDs, tenant IDs, build IDs, and dashboard names should be easy to copy.

The default behavior should avoid surprise. Single-click copy is not recommended as the default because it can conflict with activation, selection, and menus.

Preferred first behavior:

```txt
Double-click a copyable segment to request copy.
Keyboard focus plus Enter requests copy.
Optional hover/focus affordance can appear later.
```

The component should dispatch an event:

```txt
awwbookmarklet-segment-copy
```

Event detail should include:

```js
{
  segment,
  key,
  value,
  copyValue,
  source,
  anchor,
  originalEvent
}
```

The component may later support built-in clipboard behavior through an attribute such as:

```html
<awwbookmarklet-segment-strip copy-behavior="clipboard"></awwbookmarklet-segment-strip>
```

For the first version, event-first behavior is safer and more flexible. If Codex adds clipboard mode, it should use the existing framework `copyToClipboard()` helper and should provide user feedback through an event or toast.

D03. Segment strip interaction events

The segment strip should dispatch generic events rather than hard-code domain actions.

Recommended events:

```txt
awwbookmarklet-segment-copy
awwbookmarklet-segment-activate
awwbookmarklet-segment-menu-request
```

A segment may be activated by click, Enter, or Space if it is interactive. A menu request may be triggered by context menu, a keyboard shortcut, or a future action affordance. The application decides what to do.

D04. Segment strip accessibility

Non-interactive segments should not add unnecessary tab stops. Interactive or copyable segments should be keyboard reachable.

A copyable segment should expose an accessible label such as:

```txt
Copy Branch: feature/context-bar
```

Tone must not be communicated by color alone. Warning and danger segments should include text and may include a small icon.

The component should respect `prefers-reduced-motion` for change highlighting or progress-related effects.

E00. Component: `awwbookmarklet-context-bar`

`awwbookmarklet-context-bar` is the general-purpose top-level context surface. It uses the segment strip internally but adds chrome around it.

This component is not a window titlebar. It is a generic context bar that can appear inside an app shell, above a browser panel, at the top of a tool window body, or as part of a future injected HUD.

Example:

```html
<awwbookmarklet-context-bar
  value="Power BI | Finance | Sales Dashboard | Updated 09:42 | Live"
  busy>
</awwbookmarklet-context-bar>
```

Structured usage:

```js
contextBar.segments = [
  { key: "app", value: "Power BI", kind: "app" },
  { key: "workspace", label: "Workspace", value: "Finance", kind: "context" },
  { key: "report", label: "Report", value: "Sales Dashboard", kind: "title", copyValue: "Sales Dashboard" },
  { key: "updated", label: "Updated", value: "09:42", kind: "freshness" },
  { key: "status", value: "Live", kind: "status", tone: "success" }
];
```

E01. Context bar responsibilities

The context bar should provide optional leading content, segment strip display, optional actions, busy state, and optional progress state.

A conceptual internal structure:

```html
<section part="bar">
  <div part="leading"><slot name="leading"></slot></div>
  <awwbookmarklet-segment-strip part="segments"></awwbookmarklet-segment-strip>
  <div part="actions"><slot name="actions"></slot></div>
  <div part="progress"></div>
</section>
```

The actual implementation may differ, but the responsibilities should remain clear.

E02. Busy and progress behavior

The context bar should support a subtle activity state. A title/context surface is too small for large progress UI, but a thin progress strip is useful.

The component may support:

```js
contextBar.progress = { value: 42, max: 100 };
contextBar.setAttribute("busy", "");
```

or equivalent attributes:

```html
<awwbookmarklet-context-bar busy progress="42"></awwbookmarklet-context-bar>
```

The progress indicator should be visually quiet. A thin bottom strip inside the bar is preferable to a large spinner. Indeterminate motion should respect `prefers-reduced-motion`.

E03. Context bar modes

The first version should focus on one-line display. Future modes may include `mode="inline"` or `mode="expanded"`, but the expanded dashboard should not be forced into the context bar itself. That belongs to `awwbookmarklet-context-panel`.

Possible attributes:

```txt
density="compact|normal|spacious"
copy-behavior="event|clipboard|none"
busy
progress="42"
```

Codex should avoid adding broad, vague modes until they are clearly needed.

F00. Component: `awwbookmarklet-status-strip`

The current `awwbookmarklet-statusbar` is simple and slot-based. It should remain backward compatible.

A new `awwbookmarklet-status-strip` should provide segment-aware status rendering without overloading the existing statusbar too heavily.

Example:

```html
<awwbookmarklet-status-strip value="Ready | 4 selected | Sync 09:42 | No errors"></awwbookmarklet-status-strip>
```

Structured usage:

```js
statusStrip.segments = [
  { key: "state", value: "Ready", tone: "success" },
  { key: "selected", label: "Selected", value: "4 selected" },
  { key: "sync", label: "Sync", value: "09:42" },
  { key: "errors", value: "No errors", tone: "neutral" }
];
```

F01. Status strip responsibilities

The status strip should be quieter than the context bar. It is operational, not identity-focused. It is appropriate for bottom window regions, app shell footers, or low-emphasis readouts.

It should reuse the same segment model and probably the same internal segment strip renderer, but with status-oriented styling: smaller height, quieter borders, and less visual emphasis.

F02. Relationship to `awwbookmarklet-statusbar`

The existing `awwbookmarklet-statusbar` should continue to work. It is useful as a layout primitive and should not be broken.

There are two acceptable approaches:

```txt
Keep statusbar as-is and add status-strip as the segment-aware alternative.
```

or:

```txt
Allow statusbar to host status-strip in examples and docs.
```

The first implementation should avoid breaking existing `statusbar` slot behavior.

G00. Component: `awwbookmarklet-titlebar`

`awwbookmarklet-titlebar` is the actual window chrome component. This is separate from `context-bar`.

A titlebar has responsibilities that a generic context bar does not have: drag affordance, active/inactive window state, system menu trigger, window command buttons, and coordination with `AwwWindow`.

The titlebar may use `awwbookmarklet-segment-strip` internally for its title/content area.

Conceptual structure:

```html
<awwbookmarklet-titlebar>
  <button slot="system">◫</button>
  <awwbookmarklet-segment-strip slot="title"></awwbookmarklet-segment-strip>
  <button slot="commands">x</button>
</awwbookmarklet-titlebar>
```

G01. Titlebar integration strategy

Do not force the entire `AwwWindow` titlebar refactor as the first step unless Codex determines it is cleaner and safe.

Recommended path:

First implement `segment-strip`.

Then implement `context-bar`.

Then implement or prototype `titlebar`.

Then integrate with `AwwWindow`.

The existing `title` attribute on `awwbookmarklet-window` must remain valid. A basic window title should still work:

```html
<awwbookmarklet-window title="Session Capture Console"></awwbookmarklet-window>
```

A structured title API can be added later or immediately if clean:

```js
win.setTitleSegments([
  { key: "tool", value: "Session Capture" },
  { key: "target", value: "example.com" },
  { key: "status", value: "Ready", tone: "success" }
]);
```

G02. Drag behavior risk

The titlebar must preserve window dragging. This is the most important integration risk.

If segments are interactive, they must not accidentally begin a drag operation when the user is trying to copy, activate, or open a segment menu. Codex should explicitly define drag zones or pointer handling rules.

A reasonable rule is:

```txt
Dragging starts from non-interactive titlebar background.
Dragging does not start from buttons, copyable segments, menu triggers, or interactive segment elements.
```

If this creates too small a drag area, the titlebar may need a dedicated drag region or a mode where segments are passive inside window titlebars unless explicitly configured.

H00. Component: `awwbookmarklet-context-panel`

`awwbookmarklet-context-panel` is the expanded view for the same segment data.

The one-line bar should not become a dashboard. When a user wants more detail, a context panel can show the data in a grid, definition list, grouped sections, or compact mini-dashboard layout.

Example:

```js
panel.segments = [
  { key: "branch", label: "Branch", value: "feature/context-bar", copyValue: "feature/context-bar" },
  { key: "base", label: "Base", value: "main" },
  { key: "ci", label: "CI", value: "Passing", tone: "success" },
  { key: "reviews", label: "Reviews", value: "2 approved" }
];
```

Rendered concept:

```txt
Branch: feature/context-bar       Base: main
CI: Passing                       Reviews: 2 approved
Author: Alex                      Updated: 4m ago
```

H01. Context panel responsibilities

The context panel should render labels, values, tones, copy actions, source hints, stale states, and possibly grouped sections.

It should be shallow. If the content needs more than two or three rows, the tool should probably open a normal panel, dialog, or app-specific view.

The context panel may be used inside dialogs, popovers, cards, app shells, or a future expanded context bar.

I00. Future component: `awwbookmarklet-page-hud`

A page HUD is a possible future component for injecting context directly into arbitrary web pages.

It is intentionally not a first-phase requirement.

A page HUD must handle hostile layouts, sticky headers, overlays, viewport changes, and unknown page CSS. It may need multiple placements: top fixed overlay, bottom fixed overlay, floating pill, side rail, or collapsed tab.

The page HUD can reuse `context-bar`, but it needs its own runtime and layout safety decisions. It should not block the core context component implementation.

J00. Application adapters are out of scope

The framework should not include app-specific extraction adapters in this component work.

Out of scope:

```txt
Power BI report extraction
GitHub PR parsing
Jira issue scraping
Grafana dashboard adapters
Internal admin tool selectors
User alias storage
URL pattern rule configuration
Persistent segment configuration
```

In scope:

```txt
Segment data contract
Segment parser
Segment rendering
Segment events
Copy affordances
Tone rendering
Update highlighting
Progress and busy display
Context bar composition
Status strip composition
Window titlebar integration path
```

The generic library should make adapters easy to write later by providing a stable segment model.

K00. Event model

The component family should use generic events that let application code own actions.

Recommended events:

```txt
awwbookmarklet-segment-copy
awwbookmarklet-segment-activate
awwbookmarklet-segment-menu-request
awwbookmarklet-context-bar-expand
awwbookmarklet-context-bar-collapse
```

Event detail should be useful and consistent:

```js
{
  segment,
  key,
  value,
  copyValue,
  source,
  anchor,
  originalEvent
}
```

The `anchor` field is useful for opening a menu or popover near the segment. The `source` field can help diagnostics or action routing. The `originalEvent` field lets downstream code understand whether the action came from mouse, keyboard, or context menu.

L00. Visual design

The visual language should stay aligned with AWW Bookmarklet UI: compact, rectangular, bordered, explicit, dense, and retro-modern.

The components should feel like precise system readouts, not marketing badges. The default should avoid heavy color blocks. Strong color should be reserved for state and warnings.

The Oh My Posh analogy is useful, but the framework should not blindly copy terminal prompt aesthetics. The lesson is segment-based context, not rainbow powerline styling. Powerline-like wedge separators could be a future theme variant, but the default should use restrained separators that match the current Windows-inspired UI direction.

M00. Theming

The new components should use the framework's public theme tokens wherever possible. They should consume existing surface, border, text, focus, spacing, radius, and tone tokens.

New tokens may be useful later, but Codex should avoid over-tokenizing the first version.

Possible future tokens:

```txt
--awwbookmarklet-segment-gap
--awwbookmarklet-segment-padding-x
--awwbookmarklet-segment-separator-color-dark
--awwbookmarklet-segment-separator-color-light
--awwbookmarklet-context-bar-bg
--awwbookmarklet-status-strip-bg
```

The first implementation may be able to use existing tokens:

```txt
--awwbookmarklet-panel-bg
--awwbookmarklet-surface-raised-bg
--awwbookmarklet-surface-inset-bg
--awwbookmarklet-border-strong
--awwbookmarklet-border-subtle
--awwbookmarklet-divider-color
--awwbookmarklet-text-muted
--awwbookmarklet-selection-bg
--awwbookmarklet-focus-ring
--awwbookmarklet-info-bg / fg / border
--awwbookmarklet-success-bg / fg / border
--awwbookmarklet-warning-bg / fg / border
--awwbookmarklet-danger-bg / fg / border
--awwbookmarklet-radius-control
--awwbookmarklet-radius-surface
--awwbookmarklet-space-1 / 2 / 3
```

N00. Accessibility requirements

Interactive segments must be keyboard accessible.

Non-interactive segments should not add extra tab stops.

Copyable segments should expose accessible labels. A screen reader should not hear only a cryptic value without context when the segment has a label.

A passive context bar should not spam screen readers on every minor update. Live regions should be deliberate. A status strip may use `aria-live="polite"` when it communicates operational state, but frequent updates should be restrained.

Change highlighting and progress animations must respect reduced motion.

Warnings and errors must be communicated with text, not color alone.

O00. Implementation phases

Phase one: shared model and segment strip.

Create `src/core/context-segments.js`. Add parser and normalization tests. Implement `AwwSegmentStrip`. Add `TAGS.segmentStrip`. Register and export it. Add demo examples.

Phase two: context bar.

Implement `AwwContextBar`. Add `TAGS.contextBar`. Use `AwwSegmentStrip` internally. Support leading/actions slots, busy state, progress, and copy behavior routing. Add demo examples for GitHub-like and Power BI-like contexts.

Phase three: status strip.

Implement `AwwStatusStrip` or a carefully compatible enhancement path around `AwwStatusbar`. Keep the existing statusbar working. Add demo examples and example-tool usage if useful.

Phase four: titlebar integration.

Implement `AwwTitlebar` or refactor `AwwWindow` titlebar around the segment renderer. Preserve `title` attribute compatibility. Add optional structured title API. Protect drag behavior.

Phase five: context panel.

Implement `AwwContextPanel`. Render the same segments in an expanded label-value layout. Support copy events and tone states.

Phase six: future page HUD and adapters.

Defer page HUD, adapter-facing APIs, configuration, aliases, and page-specific extraction until the component family is stable.

P00. First milestone acceptance target

The first milestone should prove the core concept without becoming too broad.

A developer should be able to render this inside a window:

```txt
GitHub | PR #1824 | feature/context-bar | CI passing | 2 approvals
```

The segment strip should support pipe string input and structured segment input. The branch segment should be copyable. The CI segment should use a success tone. If the CI segment changes to a warning or danger tone, only that segment should update and highlight. The bar should truncate cleanly in a narrow window. The window should remain draggable and closable. The demo should show at least one GitHub-like example and one Power BI-like example.

Q00. Files likely affected

Expected source additions:

```txt
src/core/context-segments.js
src/components/segment-strip.js
src/components/context-bar.js
src/components/status-strip.js
src/components/titlebar.js
src/components/context-panel.js
```

Not all components need to be implemented in the first milestone, but the architecture should leave room for them.

Expected source updates:

```txt
src/core/constants.js
src/components/register-all.js
src/bookmarklet/index.js
src/demo/catalog.js
src/demo/example-tool.js
src/core/styles.js
src/themes/default-theme.js, if new tokens are added
scripts/build.mjs, if distribution README examples are updated
```

Expected tests should cover parser behavior, component registration, public exports, segment rendering, event dispatch, copy behavior, update highlighting, and backward-compatible window behavior if titlebar integration is included.

R00. Five UX scenarios

R01. Scenario: Maya builds a GitHub review helper and needs the branch name now

Maya is reviewing pull requests during a release freeze. She has three browser tabs open, each with a different PR. The GitHub page contains everything she needs, but not in the place she needs it. The branch name is near the top, CI state is in another section, approval status is lower down, and the PR number is visible in the URL but not convenient to copy.

Her bookmarklet opens an AWW window beside the page. At the top of the window, a context bar reads:

```txt
GitHub | PR #1824 | feature/context-bar | CI passing | 2 approvals
```

The bar is not a dashboard. It is a compact readout. The branch segment is copyable. Maya focuses it with the keyboard and presses Enter. The application receives `awwbookmarklet-segment-copy`, copies `feature/context-bar`, and briefly shows a copied confirmation.

The helpful part is not visual decoration. The helpful part is that the framework gives Maya's tool a consistent place to show values that are normally scattered. The component does not know GitHub. Maya's adapter produced the segments. The AWW component rendered them clearly.

R02. Scenario: Omar opens a Power BI report whose native title says only "Power BI"

Omar maintains a browser extension that hosts several reporting pages in iframes. One iframe loads Power BI. The native page title is almost useless. It says "Power BI", even though the user is looking at the Finance workspace and the Sales Dashboard report.

Omar's extension reads the report name and workspace from the controlled page. It passes structured segments to the context bar:

```js
contextBar.segments = [
  { key: "app", value: "Power BI", kind: "app" },
  { key: "workspace", label: "Workspace", value: "Finance", kind: "context" },
  { key: "report", label: "Report", value: "Sales Dashboard", kind: "title", copyValue: "Sales Dashboard" },
  { key: "freshness", label: "Updated", value: "09:42", kind: "freshness" },
  { key: "state", value: "Live", kind: "status", tone: "success" }
];
```

The user sees:

```txt
Power BI | Finance | Sales Dashboard | Updated 09:42 | Live
```

The report finally has meaningful chrome. If the refresh state changes, only the `Live` segment updates. If the report becomes stale, the state turns warning and reads `Stale 12m`.

This scenario shows the intended separation. Power BI extraction belongs to Omar's extension. Rendering belongs to AWW.

R03. Scenario: Lina tries to put too much into one line and the component protects the interface

Lina is building an internal admin helper. She wants the bar to show tenant ID, customer name, customer region, environment, role, feature flag state, deployment version, last save time, validation status, and a warning count.

Her first version produces a segment strip that is too long:

```txt
Admin | Acme Corporation | Tenant 918273 | us-east-1 | Production | Admin role | Flags: 12 | Version 2026.04.25 | Saved 11:42 | 3 warnings
```

In a narrow window, the bar truncates instead of wrapping into a messy block. The most important segments remain visible. Full values are available through tooltips and copy actions. Lina realizes that the one-line context bar is the wrong place for all the details, so she wires the expansion affordance to a `awwbookmarklet-context-panel`.

The panel shows a structured layout:

```txt
Customer: Acme Corporation        Tenant: 918273
Region: us-east-1                 Environment: Production
Role: Admin                       Version: 2026.04.25
Saved: 11:42                      Warnings: 3
```

The framework does not abandon her halfway. It provides the compact bar for immediate context and the panel for detailed context. This prevents the title/status surface from becoming an overloaded dashboard.

R04. Scenario: Chen hits an error because his segment has no stable key

Chen writes a tool that updates status every few seconds. He passes structured segments to the strip, but he omits keys. At first everything looks fine. Later, the order of segments changes. The renderer cannot reliably tell which segment changed. The wrong segment flashes.

The component should handle this gracefully. It may generate fallback keys by index, but documentation and development warnings should make the risk clear. If the implementation includes development warnings, it can warn that structured segments should provide stable keys when values update dynamically.

Chen fixes the data:

```js
strip.segments = [
  { key: "job", value: "Export #8842" },
  { key: "state", value: "Running", tone: "info" },
  { key: "progress", value: "42%" }
];
```

Now only the progress segment updates. The warning guided him to the correct data model instead of leaving him with mysterious UI behavior.

This is the kind of negative scenario the framework should handle: not by throwing hard in production, but by making the correct path obvious.

R05. Scenario: Priya uses the status strip for a compliance workflow

Priya builds a compliance review tool where the bottom edge of the window must summarize operational state. The user is not looking for page identity there. They need to know whether the review is ready, whether required fields are missing, whether the record is read-only, and whether the last save succeeded.

She uses `awwbookmarklet-status-strip`:

```js
statusStrip.segments = [
  { key: "state", value: "Review ready", tone: "success" },
  { key: "missing", value: "0 missing" },
  { key: "mode", value: "Read-only", tone: "warning" },
  { key: "saved", value: "Saved 30s ago" }
];
```

The status strip is quieter than the context bar. It sits at the bottom of the window like a system register. It does not compete with the main content, but it gives the reviewer confidence that the workflow is in a safe state.

Later, when a required field becomes invalid, only the relevant segment changes:

```txt
2 missing
```

with a warning tone. The user can open details from the segment action event. The framework does not need to know what a compliance field is. It provides the compact, consistent surface where the application can tell the user what matters.

S00. Final recommendation

The approved plan is to build a component family around shared context segments.

The first implementation should not try to solve extraction, configuration, aliases, page HUD placement, or every titlebar idea. It should implement the foundation: a normalized segment model, a parser, a compact segment strip, a generic context bar, and a clear path toward status strip and titlebar integration.

This approach preserves the strength of the original idea while avoiding the main risk. The project gains a powerful reusable context system, but each component keeps a clear job. The result should feel like smart browser-tool chrome: compact, copy-oriented, status-aware, retro-modern, and useful in the constrained spaces where AWW Bookmarklet UI is meant to operate.
