2026-04-23

A00

# Product requirements document: evolve the bookmarklet UI library from component primitives into an application UI kit

2026-04-23

This document defines the next major evolution of the existing `awwbookmarklet` UI framework.

The current library already has a real foundation. It provides a desktop root, floating windows, menus, buttons, text controls, form primitives, tabs, listbox, panels, groups, statusbar, command registry, theme tokens, geometry helpers, runtime root ownership, and a working demo catalog. That is enough to prove the visual direction and the technical approach.

It is not yet enough to replace the local UI systems used across the existing Chrome extension tools.

The purpose of this implementation is to move the library from a set of retro-styled primitives into a coherent application UI kit for small desktop-like tools running inside bookmarklet windows, extension pages, and injected overlay surfaces.

The product shift is this:

the library should no longer only provide styled controls;

it should provide the repeated application structures that make tools feel like they belong to the same desktop environment.

This means Codex should add the missing components, APIs, layout patterns, overlay primitives, and helper utilities needed to rebuild the existing tools without each tool carrying its own private CSS framework.

B00

## What this document is and what it is not

This is a product and implementation specification for Codex.

It is not a request to migrate all existing applications immediately.

It is not a request to rewrite the current library from zero.

It is not a request to create a general-purpose CSS utility framework.

It is not a request to build a React, Vue, or Lit component system.

It is a staged implementation specification for expanding the existing custom-element-based `awwbookmarklet` UI library so that the existing Chrome extension tools can progressively replace their local UI code with shared, coherent, retro desktop-style components.

Codex should treat the current codebase as the source of truth for architectural style. The framework already uses plain custom elements, shadow DOM, CSS custom properties, a `css` helper, `adoptStyles`, a central `TAGS` registry, `defineMany`, and small core modules. New work should extend that model rather than introducing a new component paradigm.

C00

## Current product state

The current library has a clear identity: a lightweight desktop UI layer for bookmarklet and extension tools.

It already includes these public custom elements:

`awwbookmarklet-desktop-root`, `awwbookmarklet-window`, `awwbookmarklet-menubar`, `awwbookmarklet-menu`, `awwbookmarklet-button`, `awwbookmarklet-icon-button`, `awwbookmarklet-input`, `awwbookmarklet-textarea`, `awwbookmarklet-checkbox`, `awwbookmarklet-radio`, `awwbookmarklet-select`, `awwbookmarklet-range`, `awwbookmarklet-progress`, `awwbookmarklet-tabs`, `awwbookmarklet-tab-panel`, `awwbookmarklet-listbox`, `awwbookmarklet-group`, `awwbookmarklet-panel`, and `awwbookmarklet-statusbar`.

The library also has a small runtime layer:

`acquireDesktopRoot`, `releaseDesktopRoot`, `emergencyTeardown`, `WindowManager`, `CommandRegistry`, theme tokens, geometry helpers, and style adoption helpers.

That foundation is good. Codex should preserve it.

The main weakness is that the current components sit too low in the UI stack. They help an app draw a button or a window, but they do not help an app consistently define its shell, header, action rows, status lines, alerts, field labels, validation text, dialog behavior, command palette, rich preview areas, copy fallback, loading states, card rows, or iframe panels.

As a result, every application still invents its own page shell, toolbar layout, warning banner, empty state, copy feedback, list card, preview area, and modal behavior. That is the inconsistency this feature exists to remove.

D00

## Product goal

The goal is to make the bookmarklet UI library the default interface layer for the existing tools.

A tool should be able to declare an app shell, toolbar, form field, status line, alert, dialog, command palette, URL picker, card list, rich preview, browser panel, and copy action without copying local CSS from another tool.

The user-facing result should be that tools such as Rich Text to Markdown, Page Screenshot, Page Content Select, Session Snapshot, Notifications and Reminders, Mini Browser, Multi Browser, Bookmark Manager, and Settings feel like members of the same desktop application family.

The engineering result should be that repeated local CSS and DOM rendering patterns move into the shared library.

The product value is coherence. A user should not feel that each utility was designed in a different era. The tools may serve different jobs, but they should share the same interaction grammar: headers behave the same way, action rows wrap the same way, warnings look the same way, fields explain themselves the same way, copy failures recover the same way, overlays layer predictably, and dynamic rows expose actions without surprising keyboard or pointer behavior.

E00

## Primary implementation principle

The library should absorb repeated product structure, not only repeated visual decoration.

This distinction matters.

A weak migration would replace `<button class="atools-button">` with `<awwbookmarklet-button>` while leaving every app-owned `.pcs-controls`, `.mb-tools`, `.session-preview-actions`, `.reminders-field`, `.pcs-banner`, and `.lp-url-picker-dropdown` wrapper intact. That would make individual controls look more consistent, but the applications would still own the larger grammar of layout, feedback, and interaction.

The stronger migration target is this:

local app CSS should describe app-specific domain needs;

the shared UI library should describe common application structure.

Codex should therefore prefer composed components such as `awwbookmarklet-toolbar`, `awwbookmarklet-field`, `awwbookmarklet-alert`, `awwbookmarklet-status-line`, `awwbookmarklet-rich-preview`, and `awwbookmarklet-list-item` over guidance that merely asks apps to wrap existing primitives with new classes.

F00

## Non-goals

This work does not require a full migration of the existing tools in the same pass.

This work does not require removing every local stylesheet immediately.

This work does not require building a large state management system.

This work does not require creating a generic app framework with routing, stores, async data layers, or virtual DOM rendering.

This work does not require implementing a complete design token editor.

This work does not require making the library match a modern SaaS design language.

This work does not require copying `atools-shared.css` into the library as one large stylesheet.

This work does not require preserving every app-specific class name.

This work does not require matching hostile content-script CSS rules that rely on `!important`, except where page injection genuinely requires defensive behavior.

This work does not require solving all advanced Multi Browser workspace behavior in the first implementation batch.

G00

## Design identity

The visual identity should remain retro desktop application, not generic web app.

The current library already communicates this through square borders, titlebars, dense controls, strong outlines, sharp panels, menu bars, status bars, and window chrome. New components should extend that language.

The library should feel like a compact desktop tool environment with modern accessibility and predictable behavior. It should not become soft, round, spacious, mobile-first SaaS UI. It should also avoid becoming parody retro UI. The target is practical desktop-tool ergonomics: dense, legible, structured, slightly old-system, and implementation-friendly.

The design should preserve these qualities:

controls are compact but readable;

borders define surfaces clearly;

window, panel, field, and toolbar hierarchy is explicit;

focus rings are visible and consistent;

states are direct and not overly animated;

content-heavy tools remain usable in constrained windows;

the user can understand what is primary, secondary, dangerous, disabled, loading, selected, or recoverable.

H00

## Architecture direction

The architecture should be organized into five conceptual layers.

First, the runtime and overlay layer owns desktop roots, z-index coordination, portal placement, and cleanup. This already exists partially through `desktop-root`, `runtime`, `window-manager`, and menu portal behavior. It needs to become more explicit because dialogs, dropdowns, comboboxes, URL pickers, command palettes, and toasts all need the same overlay policy.

Second, the base component layer owns native-like controls: button, icon button, input, textarea, checkbox, radio, select, range, progress, tabs, listbox, menu, panel, group, statusbar, and window. This layer already exists and should be refined, not replaced.

Third, the application composition layer owns repeated application shapes: app shell, toolbar, action group, field, alert, status line, empty state, loading state, error state, card, list, list item, rich preview, rich editor, browser panel, and metric card.

Fourth, the command and interaction layer owns command palette, shortcut help, command-bound buttons, hotkeys, clipboard helpers, download helpers, URL picker behavior, and dialog flows.

Fifth, the utility layer owns small pure functions: URL normalization, safe HTML sanitization, text collapse, ID creation, date formatting, filename sanitization, blob download, and clipboard fallback.

Codex should avoid collapsing these layers into one file or one global component. The point of this feature is not only to add controls. The point is to make the internal language of the UI system explicit.

I00

## Source structure requirements

Codex should preserve the current source organization pattern.

New components should be added under `src/components`.

New core utilities should be added under `src/core` or a small `src/utils` directory if the current source layout makes that cleaner.

New theme definitions should extend `src/themes/default-theme.js`.

New public tags must be added to `TAGS` in `src/core/constants.js`.

New components must be registered through `registerAllComponents()`.

New style definitions should use the existing `css` helper and `adoptStyles`.

New components should use shadow DOM unless there is a clear reason not to.

Shared CSS should be expressed as component styles and theme tokens, not as a large global stylesheet.

The bundled `dist` output is not the implementation target. Codex should work in source files and let the Bun build process produce bundled artifacts.

J00

## Public naming rules

All new public custom elements must use the existing prefix: `awwbookmarklet-`.

Names should describe generic reusable UI shapes, not app-specific domains.

Codex must not add names such as `awwbookmarklet-page-content-card`, `awwbookmarklet-session-row`, `awwbookmarklet-mini-browser-toolbar`, or `awwbookmarklet-reminder-banner`.

The correct generic shapes are names like `awwbookmarklet-list-item`, `awwbookmarklet-rich-preview`, `awwbookmarklet-browser-panel`, `awwbookmarklet-alert`, `awwbookmarklet-field`, and `awwbookmarklet-toolbar`.

Names should reflect reliable behavior. If a component accepts arbitrary rich HTML but does not sanitize by itself, it must not imply full safety. If a button only copies text, it must not imply image or HTML clipboard support unless those payloads are actually implemented.

K00

## Theme token requirements

The existing token set is useful but too small for application-level components.

Codex should extend `PUBLIC_TOKENS` and `DEFAULT_THEME` carefully. Tokens should be added when a new reusable semantic need appears in more than one component. Tokens should not be added for one-off pixel values.

Required new token categories include surface hierarchy, text hierarchy, state tones, overlay layering, field spacing, card spacing, and code/rich-preview content colors.

At minimum, Codex should consider adding semantic tokens for:

app shell background;

surface raised background;

surface inset background;

muted text;

help text;

danger background;

danger foreground;

danger border;

warning background;

warning foreground;

warning border;

success background;

success foreground;

success border;

info background;

info foreground;

info border;

overlay backdrop;

overlay shadow;

card background;

card selected background;

code background;

code foreground;

divider color.

Token names should follow the existing CSS variable style: `--awwbookmarklet-*`.

Fallback values should be included inside component CSS so individual components remain resilient if a token is missing.

L00

## Component priority model

Codex should implement this work in staged priority order.

P0 components are required for serious application parity. They remove the largest repeated CSS and interaction patterns.

P1 components are needed soon, but they should come after the P0 foundation is stable.

P2 components are useful app accelerators. They should not block the main transition from primitive library to application UI kit.

The first implementation should focus on P0, but it should define APIs in a way that does not block P1 and P2 later.

M00

## P0 deliverables

The first implementation batch should add these public components and APIs:

`awwbookmarklet-app-shell`;

`awwbookmarklet-toolbar`;

`awwbookmarklet-field`;

`awwbookmarklet-status-line`;

`awwbookmarklet-alert`;

`awwbookmarklet-dialog`;

`awwbookmarklet-toast` and a `showToast()` helper;

`awwbookmarklet-empty-state`;

`awwbookmarklet-state-overlay`;

`awwbookmarklet-list`;

`awwbookmarklet-list-item`;

`awwbookmarklet-card`;

`awwbookmarklet-rich-preview`;

`awwbookmarklet-browser-panel`;

clipboard helper utilities;

`awwbookmarklet-manual-copy` or an equivalent manual fallback surface.

This is the minimum set needed to begin replacing the local UI systems in Rich Text to Markdown, Page Screenshot, Page Content Select, Mini Browser, and parts of Multi Browser.

N00

## P1 deliverables

After the P0 foundation is stable, Codex should add or prepare for:

`awwbookmarklet-combobox`;

`awwbookmarklet-url-picker`;

`awwbookmarklet-command-palette`;

`awwbookmarklet-shortcut-help`;

`awwbookmarklet-rich-editor`;

`awwbookmarklet-metric-grid`;

`awwbookmarklet-metric-card`;

`awwbookmarklet-toggle-field`;

`awwbookmarklet-radio-group`;

`awwbookmarklet-segmented-control`;

`awwbookmarklet-download-button`;

URL, date, text, ID, and file utility modules;

hotkey registry;

tile workspace prototype.

The report marks the URL picker and command palette as P0. This specification deliberately splits them into the second implementation batch if Codex cannot implement all overlay-heavy features safely in one pass. The reason is sequencing, not importance. Dialog, toast, and overlay positioning should exist before the URL picker and command palette depend on them.

O00

## P2 deliverables

Later accelerators may include:

`awwbookmarklet-preset-picker`;

`awwbookmarklet-saved-items-panel`;

a DOM reference helper;

a draft/session storage helper;

a small render-list helper;

a settings schema renderer.

Codex should not implement these before the lower-level components exist. These helpers are useful, but they are more application-specific and easier to design after the base UI grammar is stable.

P00

## App shell component

Codex should implement `awwbookmarklet-app-shell`.

The app shell is the standard internal structure for a tool window or extension page. It should not replace `awwbookmarklet-window`. It should live inside a window, panel, extension page, or standalone document body.

The product purpose is to make every tool begin with the same application grammar: title, subtitle, actions, status, body, and optional footer.

Suggested markup:

```html
<awwbookmarklet-app-shell>
  <span slot="title">Page Content Select</span>
  <span slot="subtitle">Selection starts immediately. Review the captured block before saving.</span>

  <awwbookmarklet-toolbar slot="actions">
    <awwbookmarklet-button variant="primary">Save Draft</awwbookmarklet-button>
    <awwbookmarklet-button variant="ghost">Saved Sessions</awwbookmarklet-button>
  </awwbookmarklet-toolbar>

  <awwbookmarklet-status-line slot="status" tone="info">Initializing...</awwbookmarklet-status-line>

  <section slot="body">
    ...
  </section>
</awwbookmarklet-app-shell>
```

Required slots:

`title`;

`subtitle`;

`actions`;

`status`;

`body`;

`footer`.

Required behavior:

The shell should render a header area with title and actions.

The title and subtitle should wrap gracefully on narrow widths.

The actions area should align to the end when there is room and wrap below the title when there is not.

The body area should support scrolling inside constrained windows.

The shell should not impose document-level fixed positioning.

The shell should work inside `awwbookmarklet-window` body without breaking the window's own scroll behavior.

The shell should expose parts for styling: `shell`, `header`, `heading`, `title`, `subtitle`, `actions`, `status`, `body`, and `footer`.

The user value is continuity. A user moving from a screenshot tool to a session tool should not have to relearn where actions, status, and content live.

Q00

## Toolbar and action group components

Codex should implement `awwbookmarklet-toolbar`.

The toolbar is the standard action row primitive. It replaces repeated local flex wrappers such as `.pcs-controls`, `.pcs-header-actions`, `.mb-tools`, `.session-preview-actions`, `.reminders-banner-actions`, and similar patterns.

Suggested markup:

```html
<awwbookmarklet-toolbar density="compact" wrap>
  <awwbookmarklet-button variant="primary" command="selection.commit">Start selection</awwbookmarklet-button>
  <awwbookmarklet-button command="selection.refresh">Refresh preview</awwbookmarklet-button>
  <awwbookmarklet-button tone="danger" command="selection.cancel">Cancel selection</awwbookmarklet-button>
</awwbookmarklet-toolbar>
```

Supported attributes:

`density="compact|normal|spacious"`;

`align="start|center|end|between"`;

`orientation="horizontal|vertical"`;

`wrap`;

`busy`;

`disabled`.

Required behavior:

The toolbar should provide stable gaps and wrapping.

When `disabled` is set on the toolbar, child controls that support `disabled` should appear disabled or inert. Codex may implement this initially through styling and later through property propagation if direct propagation is unsafe.

When `busy` is set, the toolbar should expose a busy visual state and optionally mark child actions as unavailable.

The toolbar should not assume buttons only. It must support URL pickers, status lines, selects, and custom slotted content.

The toolbar should expose parts: `toolbar`, `leading`, `content`, `trailing`, and `overflow` if those slots are implemented.

Codex may also implement `awwbookmarklet-action-group` if it is useful as a tighter grouped-button variant, but the P0 requirement is `toolbar`.

R00

## Button refinements

The existing `awwbookmarklet-button` and `awwbookmarklet-icon-button` should be extended.

Required new attributes for `awwbookmarklet-button`:

`variant="default|primary|ghost|link"`;

`tone="neutral|info|success|warning|danger"`;

`busy`;

`pressed`;

`command`.

Required new attributes for `awwbookmarklet-icon-button`:

`tone`;

`busy`;

`pressed`;

`command`;

`label` or support for reliable `aria-label` mirroring.

Required behavior:

A busy button should prevent duplicate activation unless explicitly configured otherwise.

A button with `command` should be able to dispatch a command event or run through a command registry when a registry context is available.

Codex should not overbuild command binding in this step. A reasonable first version is to dispatch a composed custom event with the command ID, allowing a parent command surface to run it.

Suggested event:

`awwbookmarklet-command-request`.

The event detail should include `{ commandId, source }`.

The user value is reducing local button state code. Existing apps repeatedly implement disabled, success, error, and command behavior outside the component.

S00

## Field component

Codex should implement `awwbookmarklet-field`.

The field component is the standard wrapper for labels, help text, errors, prefixes, suffixes, units, and slotted controls.

Suggested markup:

```html
<awwbookmarklet-field
  label="Reminder offset"
  help="Minutes before due time."
  error=""
  orientation="vertical">
  <awwbookmarklet-input type="number" min="0" max="10080" value="15"></awwbookmarklet-input>
  <span slot="suffix">min</span>
</awwbookmarklet-field>
```

Supported attributes:

`label`;

`help`;

`error`;

`required`;

`tone="neutral|info|success|warning|danger"`;

`orientation="vertical|horizontal|inline"`;

`size="sm|md"`;

`wide`;

`disabled`.

Supported slots:

default slot for the control;

`label`;

`help`;

`error`;

`prefix`;

`suffix`;

`actions`.

Required behavior:

The field should generate stable IDs for label, help, and error content.

When the slotted control supports ARIA attributes, the field should connect `aria-labelledby`, `aria-describedby`, `aria-invalid`, and `required` where possible.

If the slotted control is a custom element that wraps a native input, Codex should use a safe strategy. It should not break encapsulation by relying on private internal fields. It may set attributes on the custom element and let the component mirror them.

When `error` is non-empty, the field should enter an invalid visual state and expose that state to the control if possible.

The field should support prefix and suffix content for units such as `min`, `%`, `px`, and file size labels.

The field should avoid large layout jumps when errors appear. Codex can accomplish this with a reserved message area or a stable message block.

The user value is clarity. The user can see what a control means, what format it expects, and how to recover from a bad value.

T00

## Status line component

Codex should implement `awwbookmarklet-status-line`.

The status line is not the same as `awwbookmarklet-statusbar`. The statusbar is a desktop window region. The status line is an inline feedback component used in forms, panels, headers, previews, and action areas.

Suggested markup:

```html
<awwbookmarklet-status-line tone="info" live="polite">Initializing...</awwbookmarklet-status-line>
```

Supported attributes:

`tone="neutral|info|success|warning|danger"`;

`compact`;

`live="off|polite|assertive"`;

`busy`;

`hidden`.

Required methods or properties:

`update(message, options)` may be implemented if it fits the style of the codebase.

Required behavior:

The component should render a text slot and optional indicator.

It should set an appropriate `aria-live` value when requested.

It should support success, warning, danger, info, and neutral visual states.

It should be usable inside `app-shell`, `panel`, `toolbar`, `browser-panel`, and `rich-preview`.

It should replace repeated `setStatus()` and `setWarning()` helpers in apps.

The user value is confidence. The user should be told what happened, what is happening, and what failed without each app inventing a new visual language.

U00

## Alert and callout component

Codex should implement `awwbookmarklet-alert`.

The alert component replaces local banners, privacy notes, disabled-state warnings, draft restore prompts, and recoverable notices.

Suggested markup:

```html
<awwbookmarklet-alert tone="warning" title="Draft available" dismissible>
  A previous draft can be restored.
  <awwbookmarklet-toolbar slot="actions">
    <awwbookmarklet-button>Restore</awwbookmarklet-button>
    <awwbookmarklet-button variant="ghost">Start fresh</awwbookmarklet-button>
  </awwbookmarklet-toolbar>
</awwbookmarklet-alert>
```

Supported attributes:

`tone="info|success|warning|danger|neutral"`;

`title`;

`dismissible`;

`compact`;

`open`.

Supported slots:

default message;

`title`;

`icon`;

`actions`.

Events:

`awwbookmarklet-alert-dismiss`.

Required behavior:

Dismissible alerts should dispatch a dismiss event and hide only if the event is not canceled, or should expose a clear policy documented in code comments.

The alert should support action slots without making app authors write a separate flex wrapper.

The alert should be accessible as a status, alert, or region depending on tone and configuration. Codex should choose sensible defaults: warnings and danger states should be more noticeable than neutral notes, but not every warning should interrupt the user.

The user value is product honesty. Privacy notes, disabled features, recoverable drafts, and warnings should look like intentional system messages, not leftover paragraphs.

V00

## Dialog component

Codex should implement `awwbookmarklet-dialog`.

The dialog is the standard modal and non-modal overlay primitive. It should become the base for command palettes, shortcut help, saved sessions panels, manual copy fallback, confirmations, and settings prompts.

Suggested markup:

```html
<awwbookmarklet-dialog id="command-dialog" modal label="Command palette">
  <span slot="title">Command palette</span>
  <awwbookmarklet-command-palette></awwbookmarklet-command-palette>
</awwbookmarklet-dialog>
```

Supported attributes:

`open`;

`modal`;

`label`;

`close-on-escape`;

`close-on-backdrop`;

`placement` if non-modal placement is implemented later.

Required methods:

`show()`;

`close(reason)`.

Events:

`awwbookmarklet-dialog-open`;

`awwbookmarklet-dialog-close`;

`awwbookmarklet-dialog-cancel`.

Required behavior:

When modal, the dialog must trap focus.

When opened, it should focus the first focusable child or a configured focus target.

When closed, it should restore focus to the element that opened it when possible.

Escape should close the dialog only when `close-on-escape` is not false.

Backdrop click should close the dialog only when `close-on-backdrop` is enabled.

The dialog should portal or render through the managed overlay layer so z-index is coordinated with windows, menus, dropdowns, and toasts.

The dialog should expose parts for `backdrop`, `panel`, `header`, `title`, `body`, `footer`, and `close-button`.

The dialog should not rely on native `<dialog>` unless Codex verifies that it fits the required portal, shadow DOM, and z-index model. A custom implementation is acceptable if focus behavior is correct.

The user value is safety. Dialogs are interruption surfaces. They must not lose focus, hide behind windows, trap the user incorrectly, or close unpredictably.

W00

## Overlay coordination

Codex should create a small shared overlay positioning and portal policy before or during dialog and toast implementation.

The existing menu component already portals to the desktop root and positions itself with viewport coordinates. That behavior should become a shared internal concept rather than a private menu-only pattern.

Required internal direction:

menus, dialogs, combobox popups, URL picker dropdowns, command palettes, and toasts should not each invent their own coordinate model;

fixed or viewport-relative positioning should be explicit;

collision behavior should be predictable;

z-index ordering should be centralized enough that overlays appear above windows but do not permanently outrank emergency teardown or browser UI.

Suggested internal helper shape:

```js
positionOverlay(anchor, popup, {
  placement: "bottom-start",
  strategy: "viewport",
  collision: "flip-and-shift"
});
```

Codex does not need to expose this helper publicly in the first pass, but the implementation should avoid copy-pasted menu positioning logic.

The precedence rule for overlay placement should be:

anchor placement > viewport collision adjustment > minimum viewport margin > stable focus behavior > visual polish.

Expanded form:

The component should first try to place the overlay where the triggering control implies. If that placement would overflow the viewport, it should flip or shift within the viewport. It should preserve a small viewport margin. It should not choose a position that breaks keyboard flow or focus restoration. Fine visual alignment is secondary to the overlay being visible, reachable, and correctly layered.

X00

## Toast component and showToast helper

Codex should implement `awwbookmarklet-toast` and a `showToast()` helper.

The toast is for transient feedback such as copied URL, saved draft, capture complete, bookmark added, or command failed.

Suggested JavaScript API:

```js
showToast({
  message: "Copied URL",
  tone: "success",
  timeout: 1800,
  anchor: button,
  key: "copy-url"
});
```

Suggested markup API:

```html
<awwbookmarklet-toast tone="success" timeout="1800">Copied URL</awwbookmarklet-toast>
```

Supported tones:

`info`;

`success`;

`warning`;

`danger`;

`neutral`.

Required behavior:

Toasts should portal into the overlay root.

Toasts should not steal focus.

Toasts should auto-dismiss after a timeout.

Toasts should pause dismissal on hover or focus if interactive content is allowed.

Toasts should respect reduced motion.

Toasts should support replacement by key so repeated copy actions update one toast rather than creating a stack of identical messages.

Codex may implement `awwbookmarklet-toast-stack` internally if that makes stacking cleaner.

The user value is feedback without interruption. Copy and save actions should acknowledge success without forcing the user into a dialog.

Y00

## Empty state and state overlay components

Codex should implement `awwbookmarklet-empty-state` and `awwbookmarklet-state-overlay`.

The empty state is a normal content surface.

The state overlay is a layer over an existing panel, preview, iframe, card, or workspace.

Suggested empty state markup:

```html
<awwbookmarklet-empty-state
  title="No results"
  description="Try a different query.">
  <awwbookmarklet-button slot="actions">Clear search</awwbookmarklet-button>
</awwbookmarklet-empty-state>
```

Suggested state overlay markup:

```html
<awwbookmarklet-state-overlay state="loading" label="Capturing page"></awwbookmarklet-state-overlay>
```

Supported `state` values:

`loading`;

`empty`;

`error`;

`blocked`;

`success`;

`custom`.

Required behavior:

State surfaces should provide stable height and avoid layout collapse.

They should support action slots.

They should support accessible announcements when the state changes.

They should work inside browser panels, rich previews, card lists, and app shell body areas.

The state overlay should cover its container without requiring app-specific absolute-position CSS.

The user value is recovery. Empty, loading, blocked, and error states should not feel like broken layout.

Z00

## List, list item, and card components

Codex should implement `awwbookmarklet-list`, `awwbookmarklet-list-item`, and `awwbookmarklet-card`.

These components replace repeated dynamic row and card rendering across Page Content Select, Session Snapshot, Notifications and Reminders, Bookmark Manager, and Settings.

Suggested list markup:

```html
<awwbookmarklet-list empty-text="No blocks yet">
  <awwbookmarklet-list-item tone="success" selected>
    <input slot="leading" type="checkbox">
    <span slot="title">Example page</span>
    <span slot="meta">example.com</span>
    <p slot="description">Captured description text...</p>
    <awwbookmarklet-toolbar slot="actions">
      <awwbookmarklet-icon-button aria-label="Copy"></awwbookmarklet-icon-button>
      <awwbookmarklet-icon-button aria-label="Delete" tone="danger"></awwbookmarklet-icon-button>
    </awwbookmarklet-toolbar>
  </awwbookmarklet-list-item>
</awwbookmarklet-list>
```

Required `awwbookmarklet-list` behavior:

It should render slotted list items.

It should support `empty-text`.

It should support an empty slot or empty state.

It should not require app authors to manually hide and show empty-state containers.

It should expose a list role when appropriate but should not force listbox semantics unless selection behavior is enabled.

Required `awwbookmarklet-list-item` slots:

`leading`;

`title`;

`meta`;

`description`;

`thumbnail`;

`status`;

`actions`;

`footer`;

`trailing`.

Supported attributes:

`selected`;

`disabled`;

`tone="neutral|info|success|warning|danger"`;

`interactive`;

`selectable`;

`compact`.

Required behavior:

A list item with actions must not accidentally toggle selection when an action button is clicked.

A selectable list item should expose clear selected state.

A disabled list item should reduce interaction without hiding its content.

A list item should reflow on narrow widths. Title, meta, description, and actions should remain readable without horizontal overflow.

Required `awwbookmarklet-card` behavior:

The card should provide a reusable bordered content container with slots for title, meta, actions, body, footer, and media.

It should support tone and selected states.

The user value is scanning. Lists and cards are where users compare items, review captured content, inspect sessions, and act on rows. The skeleton must be stable.

AA00

## Rich preview component

Codex should implement `awwbookmarklet-rich-preview`.

This is one of the highest-risk and highest-value components.

The rich preview is for rendering page-derived or generated HTML while constraining its visual impact. It is needed by Page Content Select, Page Screenshot, Rich Text to Markdown, Session Snapshot previews, and reader/browser preview surfaces.

Suggested markup:

```html
<awwbookmarklet-rich-preview sanitize links="safe" images="constrained"></awwbookmarklet-rich-preview>
```

Suggested JavaScript usage:

```js
preview.html = sanitizedHtml;
preview.emptyText = "Nothing selected yet.";
```

Supported attributes:

`sanitize`;

`links="safe|allow|plain"`;

`images="constrained|hidden|allow"`;

`empty-text`;

`shadow`;

`readonly`.

Required behavior:

The component must constrain images to the available width.

Tables must not break layout. They should scroll horizontally if needed.

Long code and preformatted text must wrap or scroll in a controlled way.

Blockquotes, links, headings, paragraphs, lists, code, pre, tables, and images should have theme-compatible styling.

The component should support an empty state.

The component should support a sanitizer hook or use a shared sanitizer utility if implemented.

The component must not silently trust arbitrary HTML merely because the `sanitize` attribute exists. If full sanitization is not implemented in the first pass, Codex must make the behavior explicit in code comments and API naming.

Recommended safety rule:

`html` assignment should either sanitize through a shared utility or require an explicit unsafe setter such as `setUnsafeHTML()`.

The product principle is:

imported page content should be visible, useful, and contained.

The user value is trust. A captured table, image, or code block should not destroy the tool layout or create a security surprise.

AB00

## Shared sanitization utility

Codex should add a shared `sanitizeHtml()` utility if one does not already exist in source.

The utility should be testable independently of the component.

It should support a conservative allowlist suitable for previewing rich text and selected page content.

It should remove scripts, event-handler attributes, dangerous URLs, inline JavaScript, and unsupported active content.

It should preserve useful formatting tags such as paragraphs, headings, lists, tables, links, code, pre, blockquotes, emphasis, strong text, and images if images are allowed.

Codex should not invent a false security guarantee. If the app environment requires a mature sanitizer and the codebase does not include one, Codex should implement a conservative baseline and leave a clear `DEV-NOTE:` that a dedicated sanitizer library may be required before accepting arbitrary untrusted HTML at scale.

AC00

## Browser panel component

Codex should implement `awwbookmarklet-browser-panel`.

This component is the standard iframe surface for Mini Browser, Multi Browser, preview windows, and browser-like tools.

Suggested markup:

```html
<awwbookmarklet-browser-panel
  src="https://example.com"
  sandbox="allow-scripts allow-forms allow-same-origin"
  referrerpolicy="no-referrer"
  loading-label="Loading page">
  <awwbookmarklet-toolbar slot="actions"></awwbookmarklet-toolbar>
</awwbookmarklet-browser-panel>
```

Supported attributes:

`src`;

`sandbox`;

`referrerpolicy`;

`loading`;

`error`;

`title`;

`loading-label`;

`error-label`.

Supported slots:

`address`;

`actions`;

`overlay`;

`fallback-actions`.

Events:

`awwbookmarklet-frame-load`;

`awwbookmarklet-frame-error`;

`awwbookmarklet-frame-command`;

`awwbookmarklet-frame-fallback-open`.

Required behavior:

The component should render an iframe with safe defaults.

It should show a loading overlay while navigation is pending.

It should show an error or blocked overlay when loading fails or is known to be blocked.

It should expose retry and open externally action slots or default actions.

It should coordinate pointer behavior so dragging a surrounding `awwbookmarklet-window` is not made impossible by the iframe surface. Codex should use best judgment here. A simple overlay during drag may be deferred if no window integration point exists yet, but the component should be designed with this problem in mind.

The user value is continuity. Browser-like tools should share the same frame, loading, blocked, retry, and external-open behavior.

AD00

## Clipboard helper and manual copy component

Codex should implement shared clipboard utilities and a manual fallback surface.

Suggested API:

```js
await copyToClipboard({
  text,
  html,
  imageBlob,
  fallbackContainer
});
```

Suggested component:

```html
<awwbookmarklet-manual-copy label="Manual copy required"></awwbookmarklet-manual-copy>
```

Optional copy button:

```html
<awwbookmarklet-copy-button
  success-label="Copied"
  fallback="manual">
  Copy
</awwbookmarklet-copy-button>
```

P0 requirement:

At minimum, implement `copyToClipboard()` and `awwbookmarklet-manual-copy`.

Required behavior:

The helper should detect Clipboard API support.

It should support plain text.

It should support HTML if the environment allows rich clipboard payloads.

It should support image blob copying if feasible, but image support may be staged.

It should return a structured result indicating success, fallback, or failure.

Manual fallback should display a readonly text area, select the text when appropriate, and provide clear instructions.

The helper should not rely on hidden textareas scattered through app code.

The user value is completion. Copying is a primary action in many tools. If automatic copy fails, the product should still help the user finish.

AE00

## Command palette and shortcut help

Codex should implement `awwbookmarklet-command-palette` and `awwbookmarklet-shortcut-help` after the dialog and overlay base is reliable.

The existing `CommandRegistry` is useful but currently has no first-class command UI. This creates repeated local code in Multi Browser and future command-oriented tools.

Suggested command palette markup:

```html
<awwbookmarklet-command-palette
  placeholder="Type a command"
  empty-text="No commands match">
</awwbookmarklet-command-palette>
```

Suggested shortcut help markup:

```html
<awwbookmarklet-shortcut-help></awwbookmarklet-shortcut-help>
```

Required behavior:

The command palette should consume a command registry or accept commands as data.

It should filter by label, ID, keywords, group, and shortcut.

It should show disabled commands with explanations if available.

It should use listbox or list item behavior internally.

It should execute commands through one path.

It should dispatch a command event rather than duplicating app-specific switch statements.

Shortcut help should render command groups, labels, and shortcut chips consistently.

The user value is discoverability. A desktop-like tool system should expose commands without requiring users to hunt across toolbars.

AF00

## Combobox and URL picker

Codex should implement `awwbookmarklet-combobox` and `awwbookmarklet-url-picker` after shared overlay positioning is in place.

The URL picker is central to Mini Browser and Multi Browser, but it should be built on a generic combobox rather than remaining a custom one-off dropdown.

Suggested generic API:

```html
<awwbookmarklet-combobox
  placeholder="Search"
  value=""
  autocomplete="list"
  min-query-length="1">
</awwbookmarklet-combobox>
```

Suggested URL picker API:

```html
<awwbookmarklet-url-picker
  placeholder="Type URL or search query"
  bookmarks
  history
  value="https://example.com">
</awwbookmarklet-url-picker>
```

Required events:

`awwbookmarklet-combobox-query`;

`awwbookmarklet-combobox-select`;

`awwbookmarklet-url-submit`;

`awwbookmarklet-url-bookmark-toggle`.

Required behavior:

The input should expose combobox ARIA semantics.

The popup should support keyboard navigation with Up, Down, Enter, Escape, Home, and End.

Rows should support grouped sections such as Open, Search, Bookmarks, and Recent.

Bookmark buttons inside rows should not break row selection.

Loading and empty states should be visible.

The popup should remain correctly positioned after the parent window moves or resizes.

The user value is speed. Browser-like tools depend on fast URL entry, search fallback, and bookmark recall.

AG00

## Rich editor component

Codex should implement `awwbookmarklet-rich-editor` as P1.

This component is needed by Rich Text to Markdown, Page Screenshot descriptions, Page Content Select notes, and any future editable rich content surface.

Suggested markup:

```html
<awwbookmarklet-rich-editor
  placeholder="Paste rich text here"
  multiline
  sanitize="paste"
  value-format="html">
</awwbookmarklet-rich-editor>
```

Required behavior:

The editor should use contenteditable or a native textarea depending on required formatting. If rich HTML paste is required, contenteditable is acceptable.

It should show placeholder text when empty.

It should expose plain text and HTML getters.

It should dispatch input and change events with semantics similar to other controls.

It should support readonly and disabled states.

It should support paste sanitization hooks.

It should preserve keyboard usability and selection behavior during paste.

The user value is control. Users should be able to paste, edit, and copy rich content without the editor feeling like an unstyled div.

AH00

## Metric card component

Codex should implement `awwbookmarklet-metric-grid` and `awwbookmarklet-metric-card` as P1.

Suggested markup:

```html
<awwbookmarklet-metric-grid columns="auto">
  <awwbookmarklet-metric-card label="Overdue" value="2" tone="danger"></awwbookmarklet-metric-card>
  <awwbookmarklet-metric-card label="Due soon" value="4" tone="warning"></awwbookmarklet-metric-card>
</awwbookmarklet-metric-grid>
```

Required behavior:

Metric cards should provide a compact summary surface.

They should support label, value, optional description, and tone.

They should remain readable in narrow tool windows.

The user value is summary. Reminder counts, capture totals, skipped rows, selected items, and completed tasks should be visible without custom stat-card CSS.

AI00

## Toggle, radio group, and segmented control

Codex should implement these as P1.

`awwbookmarklet-toggle-field` should combine a checkbox-like control with label, help, and state.

`awwbookmarklet-radio-group` should coordinate radios with label and help text.

`awwbookmarklet-segmented-control` should provide compact mutually exclusive choices for modes such as grid, floating, focus, text, HTML, quick, balanced, and full.

Suggested segmented markup:

```html
<awwbookmarklet-segmented-control value="grid">
  <option value="grid">Grid</option>
  <option value="floating">Floating</option>
  <option value="focus">Focus</option>
</awwbookmarklet-segmented-control>
```

Required behavior:

The controls should expose value semantics.

They should support disabled states.

They should support keyboard navigation.

They should avoid requiring app authors to build local radio-group wrappers.

AJ00

## Download helper

Codex should implement a shared `downloadBlob()` helper as P1.

Suggested API:

```js
downloadBlob({
  blob,
  filename,
  revoke: true
});
```

Required behavior:

The helper should create an object URL, create a temporary anchor, trigger the download, and revoke the URL when appropriate.

It should sanitize filenames through a utility function.

It should return a structured result or throw predictable errors.

This helper supports Session Snapshot ZIP downloads, HTML preview downloads, Page Content Select compiled downloads, and future export features.

AK00

## Utility modules

Codex should add small utility modules only where repetition is clear.

Recommended utilities:

`text.js` for `collapseWhitespace` and `truncateText`;

`ids.js` for `createId` and `createGuid`;

`dates.js` for `formatLocalDateTime`;

`urls.js` for URL normalization, domain extraction, page keys, and search-or-URL distinction;

`files.js` for filename sanitization and blob downloads;

`clipboard.js` for copy behavior;

`html.js` or `sanitize.js` for safe HTML handling.

Codex should keep utilities small. This should not become an application framework.

AL00

## Panel refinements

The existing `awwbookmarklet-panel` is too minimal for the target migration examples.

Codex should extend it or add a related section component so panels can support titles and actions without app-owned header wrappers.

Suggested target:

```html
<awwbookmarklet-panel>
  <span slot="title">Pending Selection</span>
  <awwbookmarklet-toolbar slot="actions">
    <awwbookmarklet-button>Refresh preview</awwbookmarklet-button>
  </awwbookmarklet-toolbar>
  <awwbookmarklet-rich-preview></awwbookmarklet-rich-preview>
</awwbookmarklet-panel>
```

Required slots if extending `panel`:

`title`;

`subtitle`;

`actions`;

default body;

`footer`.

Required behavior:

Existing simple panel usage must continue working.

A panel without title/actions should look like the current panel.

A panel with header content should render a consistent header and action layout.

This is important because many inspiration apps use panel headers with local action rows.

AM00

## Layout primitives

Codex may add minimal layout primitives after the main components exist.

Recommended primitives:

`awwbookmarklet-stack`;

`awwbookmarklet-inline`;

`awwbookmarklet-panel-grid`.

These should not become a complete CSS utility framework.

The purpose is to remove repeated local CSS for simple vertical stacks, wrapping inline groups, and responsive panel grids.

If implemented, they should support density and gap attributes using theme spacing tokens.

AN00

## Accessibility requirements

New components must preserve or improve accessibility compared with the local app code.

Field labels must be programmatically connected to controls when possible.

Error and help text must be referenced through `aria-describedby` when possible.

Dialogs must trap and restore focus.

Toasts must not steal focus.

Status lines must support appropriate live regions.

Lists and list items must not use listbox roles unless they implement listbox behavior.

Command palette and combobox must expose correct keyboard and ARIA behavior.

Buttons must expose disabled and busy states.

Icon buttons must have reliable accessible names.

Rich preview content should not create inaccessible active controls unless explicitly supported.

Browser panel iframes must have titles.

The implementation should prefer native semantics where possible. When custom semantics are necessary, they must be deliberate.

AO00

## Keyboard behavior requirements

Codex should implement keyboard behavior consistently.

Dialog:

Tab and Shift+Tab cycle inside modal dialogs.

Escape closes only when enabled.

Focus returns to the opener.

Toolbar:

Toolbar itself does not need roving tabindex in the first pass unless Codex intentionally implements it. Native Tab navigation through child controls is acceptable.

List item:

Action buttons inside list items must be reachable by Tab.

Selecting a list item must not prevent action buttons from working.

Command palette:

Arrow keys move through results.

Enter runs the active command.

Escape closes the containing dialog or clears the query according to a documented policy.

Combobox and URL picker:

Arrow keys move through suggestions.

Enter submits or selects.

Escape closes the popup.

Home and End behave predictably.

Toast:

Toast does not take focus unless it contains interactive content and the user focuses it manually.

AP00

## Event naming rules

Custom events should use the existing prefix style.

Events should be composed and bubble when parent components or application code need to observe them.

Recommended event names include:

`awwbookmarklet-command-request`;

`awwbookmarklet-dialog-open`;

`awwbookmarklet-dialog-close`;

`awwbookmarklet-dialog-cancel`;

`awwbookmarklet-alert-dismiss`;

`awwbookmarklet-toast-close`;

`awwbookmarklet-combobox-query`;

`awwbookmarklet-combobox-select`;

`awwbookmarklet-url-submit`;

`awwbookmarklet-url-bookmark-toggle`;

`awwbookmarklet-frame-load`;

`awwbookmarklet-frame-error`;

`awwbookmarklet-copy-success`;

`awwbookmarklet-copy-fallback`;

`awwbookmarklet-copy-error`.

Codex should not use vague event names such as `done`, `action`, or `changed` for higher-level behavior.

Native-like components may still dispatch native `input` and `change` events when their semantics match native controls.

AQ00

## Attribute and property rules

Components should expose normal web component properties and attributes where practical.

Common state names:

`value`;

`checked`;

`disabled`;

`open`;

`selected`;

`busy`;

`tone`;

`variant`;

`density`;

`compact`;

`required`.

Boolean attributes should behave as boolean attributes.

String attributes should be reflected where useful.

Programmatic properties should be added for important state that may not serialize well, such as arrays of command data or rich clipboard payloads.

Codex should keep public APIs small and predictable.

AR00

## Migration proving grounds

After P0 components exist, the first applications to partially migrate should be Rich Text to Markdown and Page Screenshot.

These are the correct proving grounds because they exercise app shell, toolbar, status line, rich editor or preview, copy helper, manual fallback, state surfaces, and panel structure without requiring the full tile workspace or URL picker.

The migration should not be all-or-nothing. A partial migration is acceptable if it proves that the new components reduce local CSS and improve coherence.

The second migration target should be Mini Browser, once dialog, toast, URL picker, and browser panel are ready.

The third migration target should be Page Content Select, Session Snapshot, Notifications and Reminders, and Bookmark Manager, once list item, card, rich preview, field, and alert components are stable.

Multi Browser should be migrated last because it contains the largest behavior surface: command palette, help overlay, tile creation, z-order, iframe states, layout modes, presets, and hotkeys.

AS00

## Concrete migration example: Page Content Select pending panel

The current shape is app-owned:

```html
<section id="pending-wrap" class="pcs-panel">
  <div class="pcs-panel-head">
    <h2>Pending Selection</h2>
    <div class="pcs-controls">...</div>
  </div>
  <p id="pending-meta" class="pcs-help"></p>
  <div id="pending-content" class="pcs-preview"></div>
</section>
```

The target shape should be library-owned:

```html
<awwbookmarklet-panel>
  <span slot="title">Pending Selection</span>
  <awwbookmarklet-toolbar slot="actions">
    <awwbookmarklet-button variant="primary" command="selection.commit">Start selection</awwbookmarklet-button>
    <awwbookmarklet-button command="selection.refresh">Refresh preview</awwbookmarklet-button>
    <awwbookmarklet-button tone="danger" command="selection.cancel">Cancel selection</awwbookmarklet-button>
  </awwbookmarklet-toolbar>
  <awwbookmarklet-status-line id="pending-meta"></awwbookmarklet-status-line>
  <awwbookmarklet-rich-preview id="pending-content"></awwbookmarklet-rich-preview>
</awwbookmarklet-panel>
```

The important change is not the tag names. The important change is ownership. The library owns the panel header, the action row, the status line, and the constrained rich preview surface.

AT00

## Concrete migration example: Mini Browser toolbar

The current shape is app-owned:

```html
<header class="mini-browser-toolbar">
  <button id="back-btn" class="atools-button atools-button--ghost">Back</button>
  <button id="forward-btn" class="atools-button atools-button--ghost">Forward</button>
  <div id="address-picker-root" class="lp-url-picker-root">...</div>
  <button id="actions-btn" class="atools-button atools-button--ghost">Page actions</button>
  <span id="loading-indicator" class="mini-browser-loading">Idle</span>
</header>
```

The target shape should be:

```html
<awwbookmarklet-toolbar density="compact">
  <awwbookmarklet-icon-button aria-label="Back" command="browser.back"></awwbookmarklet-icon-button>
  <awwbookmarklet-icon-button aria-label="Forward" command="browser.forward"></awwbookmarklet-icon-button>
  <awwbookmarklet-url-picker id="address-input" grow></awwbookmarklet-url-picker>
  <awwbookmarklet-button variant="ghost" command="browser.actions">Page actions</awwbookmarklet-button>
  <awwbookmarklet-status-line id="loading-indicator" compact>Idle</awwbookmarklet-status-line>
</awwbookmarklet-toolbar>
```

The important change is that toolbar spacing, compact density, URL entry, page action, and loading feedback belong to the shared system.

AU00

## Concrete migration example: Reminder create form

The current shape is app-owned:

```html
<label class="reminders-field reminders-field--wide">
  <span>Reminder</span>
  <textarea class="atools-textarea reminders-entry-input"></textarea>
  <small class="reminders-field-help">First non-empty line becomes the title.</small>
</label>
```

The target shape should be:

```html
<awwbookmarklet-field
  label="Reminder"
  help="First non-empty line becomes the title."
  wide>
  <awwbookmarklet-textarea id="reminder-entry" required></awwbookmarklet-textarea>
</awwbookmarklet-field>
```

The important change is that label, help, required state, spacing, and accessibility wiring belong to the field component.

AV00

## Implementation sequence

Codex should implement the feature in coherent chunks.

Chunk 1 should extend constants, theme tokens, registration, and shared component style foundations. This chunk should add new tag names, required theme tokens, and any shared state/tone helpers needed by multiple components.

Chunk 2 should implement app shell, toolbar, status line, alert, and panel header refinements. This is the structural foundation.

Chunk 3 should implement field and button refinements. This makes forms and action rows usable.

Chunk 4 should implement empty state, state overlay, list, list item, and card. This addresses repeated dynamic content rendering.

Chunk 5 should implement rich preview and shared sanitization baseline. This addresses preview-heavy tools.

Chunk 6 should implement clipboard helper and manual copy component. This addresses repeated copy and fallback flows.

Chunk 7 should implement dialog, overlay coordination, and toast. This creates a reliable overlay foundation.

Chunk 8 should implement browser panel. This prepares Mini Browser and Multi Browser migration.

Chunk 9 should implement command palette and shortcut help if overlay behavior is stable.

Chunk 10 should implement combobox and URL picker if overlay positioning and keyboard behavior are stable.

Codex should not start with tile workspace. The tile workspace depends on browser panel, overlays, command surfaces, list/card patterns, and layout tokens. Starting there would create a second framework before the first one is stable.

AW00

## Execution discipline for Codex

For every chunk, Codex should follow the same execution discipline.

Understand the chunk in the context of the existing codebase.

Reuse the current custom element architecture.

Implement only the chunk.

Add or update demo catalog examples for the new components.

Review keyboard and accessibility behavior.

Review narrow-window layout.

Review theme token usage.

Refactor if the component creates duplicated code that should be shared.

Run the existing build and tests if available.

Add focused tests for pure utilities and interaction-heavy components where the project already supports tests.

Do not migrate unrelated applications inside the same component implementation chunk unless the user explicitly asks for that migration.

AX00

## Demo catalog requirements

The demo catalog should be updated as components are added.

The catalog should not only show isolated controls. It should show realistic application compositions.

Required demo sections:

an app shell with title, subtitle, toolbar actions, status line, and body;

a form panel using fields with help, error, prefix, suffix, and required states;

an alert section with info, warning, danger, success, dismissible, and actions;

a list/card section with selected, disabled, thumbnail, status, and action rows;

a rich preview section with paragraphs, headings, images, tables, code, and empty state;

a copy/manual fallback section;

a dialog and toast section;

a browser panel section if implemented;

a command palette or URL picker section if implemented.

The demo should be treated as an acceptance surface. If a component cannot be shown clearly in the catalog, its API is probably not clear enough.

AY00

## Testing requirements

Unit tests alone are not enough for this work. The risky behavior is in focus, keyboard navigation, overlay positioning, responsive layout, and copy fallback.

Minimum required test areas:

Dialog traps focus, closes on Escape when enabled, respects close policies, and restores focus.

Toast portals above windows and dismisses without stealing focus.

Field connects label, help, and error text to the control where possible.

Toolbar wraps without horizontal overflow at minimum practical window width.

Alert dismisses through the correct event.

List item actions do not accidentally toggle row selection.

Rich preview constrains wide tables, images, and long code blocks.

Clipboard helper reports success, fallback, and failure distinctly.

Manual copy surface exposes selectable fallback text.

Browser panel shows loading and error states.

Command palette filters and executes exactly one command.

URL picker popup remains aligned after its parent window moves.

If a browser-level test harness does not exist yet, Codex should add tests where practical and otherwise add a clear testing note. It should not pretend that static unit tests fully validate overlay and focus behavior.

AZ00

## Acceptance criteria

The implementation is acceptable when all of the following are true.

The new P0 components are registered through `registerAllComponents()`.

The new tags are defined in `TAGS`.

The default theme includes the new required tokens or the components include safe fallbacks.

The demo catalog includes realistic examples of the new components.

The current existing components still work.

The build succeeds.

The app shell can replace the repeated `atools-shell` style structure.

The toolbar can replace repeated app-owned flex action rows.

The field component can replace local label, help, unit, and error wrappers.

The status line can replace repeated `setStatus()` and `setWarning()` visual behavior.

The alert can replace local banners and privacy notes.

The dialog can replace local command/help modal shells.

The toast can replace local transient feedback.

The rich preview can display page-derived content without breaking the layout.

The clipboard helper can support automatic copy and manual fallback.

The browser panel can represent iframe loading, error, retry, and external-open surfaces.

The list and card components can represent rows from Page Content Select, Session Snapshot, Notifications and Reminders, and Bookmark Manager without each app owning the whole visual skeleton.

BA00

## Quality bar

The implementation should feel like a coherent extension of the current library, not a separate framework attached to it.

The code should remain small, direct, and readable.

The components should be practical before they are clever.

The APIs should use slots for composition and attributes/properties for state.

The library should not require app authors to memorize many CSS classes.

The components should be useful in plain HTML.

The system should preserve the retro desktop style while improving accessibility, focus behavior, and app-level consistency.

The strongest test is this:

a future tool author should be able to build a small desktop-like utility without creating a private shell CSS file, private toolbar CSS file, private status helper, private alert style, private empty state, private copy fallback, and private rich preview constraints.

BB00

## Final implementation guidance

Codex should treat the report as evidence that the existing applications are repeatedly rebuilding the same UI framework.

The correct response is not to copy those applications into the library. The correct response is to extract their stable shared shapes into generic, named, custom-element components.

The framework is currently a useful primitive set. This feature should make it an application UI kit.

The product direction is:

desktop root and windows provide the environment;

app shell, toolbar, field, panel, alert, status line, list item, card, rich preview, dialog, toast, browser panel, and copy helpers provide the reusable application language;

individual tools provide only their domain logic.

That is the boundary Codex should optimize for.
