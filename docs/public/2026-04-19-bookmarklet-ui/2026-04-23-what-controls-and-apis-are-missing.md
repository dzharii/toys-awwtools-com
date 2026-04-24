# What controls and APIs are missing for app parity

Scope: static source review of `__readonly_only_for_inspiration__`, with attention to UI controls, CSS patterns, interaction patterns, repeated rendering code, and APIs that should move into the bookmarklet UI library.

Important constraint: the inspiration folder was treated as read-only source material. The recommendations below describe what the bookmarklet UI library should add so those applications can be rebuilt with a consistent retro UI system instead of local one-off CSS and DOM code.

## Executive summary

The current bookmarklet UI library has a useful base: windowing, menus, buttons, icon buttons, text inputs, textarea, checkbox, radio, select, range, progress, tabs, listbox, group, panel, statusbar, command registry, theme tokens, geometry, runtime root ownership, and a demo.

The inspiration applications need a wider application framework layer above those primitives. The missing pieces are not only visual controls. The biggest gap is a set of ergonomic composition APIs for repeated app patterns:

- App shell/header/topbar with title, subtitle, actions, status, and dense responsive layout.
- Field wrapper with label/help/error/unit text and validation state.
- Toolbar/action row/action group with consistent wrapping, disabled state, busy state, and variants.
- URL picker / combobox with suggestions, bookmarks, keyboard navigation, and overlay positioning.
- Dialog/modal/overlay primitive with focus management, escape handling, backdrop policy, and portal positioning.
- Command palette built on the command registry and listbox.
- Toast and transient feedback API.
- Alert/banner/callout component for warnings, disabled states, draft restore prompts, and privacy notices.
- Empty/loading/error/blocked state surfaces.
- List collection and item/card primitives with title, meta, description, actions, selectable state, thumbnails, and status.
- Metric/stat card.
- Rich content viewer and sanitized HTML preview component.
- Contenteditable editor component with placeholder, sanitization hooks, and change semantics.
- Browser/iframe panel component with address/action bar, loading/error overlays, retry/open fallback, and sandbox options.
- Clipboard/copy action helper with fallback manual-copy panel.
- Export/download helper.
- Tile workspace/layout manager for tiled/floating iframe panels.
- Hotkey registry/help renderer.
- Small state helpers for status/warning/control-state rendering.
- Shared utilities for URL normalization, safe HTML, text collapse, IDs, dates, and persisted drafts/sessions.

Without these, consumers will continue rebuilding the same UI and interaction logic in every app. The result will stay inconsistent even if individual buttons look better.

## Source inventory reviewed

Core shared sources:

- `atools-shared.css`
- `url_picker.js`
- `url_picker_core.js`
- `url_picker_canonical.js`

Application sources:

- `bookmark_manager.css`, `bookmark_manager.js`, `index.html`
- `mini-web-browser.css`, `mini-web-browser.js`, `mini-web-browser-core.js`, `index.html`
- `minibuffer_help.css`, `index.html`
- `multi-browser.css`, `multi-browser.js`, `multi-browser-core.js`, `index.html`
- `notifications-and-reminders.css`, `notifications-and-reminders.js`, `index.html`
- `page_content_select.css`, `page_content_select.js`, `page_content_select_core.js`, `page_content_select_sanitize.js`, `page_content_select_storage.js`, `index.html`
- `page_screenshot.css`, `page_screenshot.js`, `page_screenshot_core.js`, `page_screenshot_preview.js`, `page_screenshot_sanitize.js`, `index.html`
- `rich-text-to-markdown.css`, `rich-text-to-markdown.js`, `index.html`
- `session_snapshot.css`, `session_snapshot.js`, `session_snapshot_core.js`, `session_snapshot_zip.js`, `index.html`
- `preview.css`, `preview.html`

Non-atools extension UI also matters because it has reusable interaction patterns:

- `settings.css`
- `settings.js`
- preview/content overlay styles in `preview.css`

## Current library coverage

The library already covers these categories:

| Need | Current coverage | Remaining issue |
| --- | --- | --- |
| Window surface | `awwbookmarklet-window`, root runtime, window manager | Good base, but app-level shells and iframe panels are missing. |
| Menu bars and menus | `awwbookmarklet-menubar`, `awwbookmarklet-menu` | Good for desktop-style menu commands. Not enough for action dropdowns, comboboxes, command palette, or context menus. |
| Basic buttons | `awwbookmarklet-button`, `awwbookmarklet-icon-button` | Needs variants, busy state, action grouping, danger/success feedback, and maybe command binding. |
| Basic form controls | input, textarea, checkbox, radio, select, range | Needs field wrapper, validation, help text, number/date/search specialization, units, and controlled-group APIs. |
| Panels/groups | `awwbookmarklet-panel`, `awwbookmarklet-group` | Needs app shell, section header, responsive panel grid, cards/list rows, state surfaces. |
| Lists | `awwbookmarklet-listbox` | Needs collection/list item/card patterns and selection/checkbox list variants. |
| Status | `awwbookmarklet-statusbar` | Needs inline status, warning, banner, toast, loading, empty, and overlay states. |
| Commands | `commands.js` | Needs UI bindings: command palette, help overlay, toolbar/menu binding, hotkey registry. |
| Geometry/window layout | `geometry.js`, `window-manager.js` | Needs tile workspace/layout manager and iframe-friendly drag/focus behavior. |

## Replacement target map

This section identifies source patterns that should become first-class library controls or APIs.

### Shared application shell

Evidence:

```html
<!-- rich-text-to-markdown index.html -->
<div class="atools-shell">
  <header class="atools-header">
    <div class="atools-title">Rich Text to Markdown</div>
    <div class="atools-actions rtm-actions">...</div>
  </header>
</div>
```

```html
<!-- page-content-select index.html -->
<main class="atools-shell pcs-shell">
  <header class="atools-header pcs-header">
    <h1 class="atools-title">Page Content Select</h1>
    <p class="pcs-subtitle">...</p>
    <div class="pcs-header-actions">...</div>
  </header>
</main>
```

Repeated in:

- `rich-text-to-markdown.css`
- `page_content_select.css`
- `notifications-and-reminders.css`
- `session_snapshot.css`
- `page_screenshot.css`
- `multi-browser.css`
- `mini-web-browser.css`

Missing control:

`awwbookmarklet-app-shell`

Suggested API:

```html
<awwbookmarklet-app-shell>
  <span slot="title">Page Content Select</span>
  <span slot="subtitle">Selection starts immediately...</span>
  <awwbookmarklet-toolbar slot="actions">
    <awwbookmarklet-button>Save Draft</awwbookmarklet-button>
    <awwbookmarklet-button variant="ghost">Saved Sessions</awwbookmarklet-button>
  </awwbookmarklet-toolbar>
  <awwbookmarklet-status-line slot="status" tone="info">Initializing...</awwbookmarklet-status-line>
  <section slot="body">...</section>
</awwbookmarklet-app-shell>
```

Why it matters:

Every app invents a slightly different shell, header, subtitle, action alignment, and status placement. A prettier button library will not fix the larger inconsistency if each app still owns the page structure. The app shell should establish:

- Dense but readable internal spacing.
- Header wrapping behavior on narrow windows.
- Consistent title/subtitle hierarchy.
- Standard action placement.
- Standard status/warning placement.
- Scroll body behavior inside a bookmarklet window.

Priority: P0.

### Toolbar and action group

Evidence:

```html
<!-- page-content-select index.html -->
<div class="pcs-controls">
  <button id="commit-region-btn" class="atools-button atools-button--primary">Start selection</button>
  <button id="refresh-pending-btn" class="atools-button">Refresh preview</button>
  <button id="clear-pending-btn" class="atools-button">Cancel selection</button>
</div>
```

```html
<!-- multi-browser index.html -->
<div class="mb-tools">
  <button id="restore-last-btn" class="mb-btn">Restore</button>
  <button id="command-palette-btn" class="mb-btn">Palette</button>
  <button id="help-btn" class="mb-btn">Help</button>
</div>
```

Repeated in:

- `page_content_select.css`
- `page_screenshot.css`
- `session_snapshot.css`
- `multi-browser.css`
- `notifications-and-reminders.css`
- `mini-web-browser.css`

Missing control:

`awwbookmarklet-toolbar` and `awwbookmarklet-action-group`

Suggested API:

```html
<awwbookmarklet-toolbar density="compact" wrap>
  <awwbookmarklet-button variant="primary" command="commit-region">Start selection</awwbookmarklet-button>
  <awwbookmarklet-button command="refresh-pending">Refresh preview</awwbookmarklet-button>
  <awwbookmarklet-button tone="danger" command="cancel-selection">Cancel selection</awwbookmarklet-button>
</awwbookmarklet-toolbar>
```

Required behavior:

- Gap and wrapping should be stable across all apps.
- A disabled/busy state should be supported at the group and button level.
- Toolbar should expose slots for leading actions, trailing actions, and overflow actions later.
- Buttons should optionally bind to command IDs.

Priority: P0.

### Field wrapper, help text, and validation

Evidence:

```html
<!-- notifications-and-reminders index.html -->
<label class="reminders-field">
  <span>Due at</span>
  <input id="reminder-due-at" class="atools-input" type="datetime-local" required>
  <small class="reminders-field-help">This is the event deadline time.</small>
</label>
```

```html
<!-- session-snapshot index.html -->
<label class="session-field">
  <span>JPEG quality</span>
  <input id="jpeg-quality" class="atools-input session-input" type="number" min="1" max="100" value="80">
</label>
```

```js
// settings.js
input.className = 'lp-input';
input.type = 'number';
input.min = String(schema.min);
input.max = String(schema.max);
error.textContent = 'Must be between ...';
```

Missing control:

`awwbookmarklet-field`

Suggested API:

```html
<awwbookmarklet-field label="Reminder offset" help="Minutes before due time." error="">
  <awwbookmarklet-input type="number" min="0" max="10080" value="15"></awwbookmarklet-input>
  <span slot="suffix">min</span>
</awwbookmarklet-field>
```

Recommended properties:

- `label`
- `help`
- `error`
- `required`
- `tone`
- `orientation="vertical|horizontal|inline"`
- `size="sm|md"`

Required behavior:

- Link label/help/error with the control through generated IDs.
- Propagate invalid state to slotted control if possible.
- Reserve space or provide stable layout for error text to prevent UI jumps in dense forms.
- Support suffix/prefix/unit slots.

Why it matters:

The inspiration apps repeatedly solve the same form composition problem. If only input components exist, app authors will recreate labels, small text, error text, and grid sizing every time.

Priority: P0.

### URL picker / combobox

Evidence:

```html
<!-- mini-web-browser index.html -->
<div id="address-picker-root" class="lp-url-picker-root mini-browser-input-wrap">
  <input id="address-input" class="atools-input mini-browser-input" type="text">
</div>
```

```html
<!-- multi-browser index.html -->
<div id="new-tile-picker-root" class="lp-url-picker-root mb-input-wrap">
  <input id="new-tile-input" class="mb-input" type="text">
</div>
```

`atools-shared.css` includes a full dropdown styling vocabulary:

```css
.lp-url-picker-root { position: relative; }
.lp-url-picker-dropdown { position: absolute; z-index: 2147483647; }
.lp-url-picker-row.is-highlighted { ... }
.lp-url-picker-bookmark.is-active { ... }
```

Missing control:

`awwbookmarklet-combobox` as a generic base, plus `awwbookmarklet-url-picker` as a URL-specific composition.

Suggested generic API:

```html
<awwbookmarklet-combobox
  placeholder="Type URL or search query"
  value=""
  autocomplete="list"
  min-query-length="1">
</awwbookmarklet-combobox>
```

Suggested URL picker API:

```html
<awwbookmarklet-url-picker
  placeholder="Type URL or search query"
  search-provider="default"
  bookmarks
  history
  value="https://example.com">
</awwbookmarklet-url-picker>
```

Events:

- `awwbookmarklet-combobox-query`
- `awwbookmarklet-combobox-select`
- `awwbookmarklet-url-submit`
- `awwbookmarklet-url-bookmark-toggle`

Required behavior:

- Portal dropdown to the overlay layer or compute coordinates in the correct local coordinate model.
- `aria-expanded`, `aria-controls`, `aria-activedescendant`, `role="combobox"`.
- Keyboard support: Up, Down, Enter, Escape, Home, End.
- Group headings for "Open", "Search", "Bookmarks", "Recent".
- Bookmark action button inside a row without breaking row selection.
- Loading and empty states.

Why it matters:

The URL picker is already shared in the inspiration app, but it is outside the new component system. It is central to the mini browser and multi browser. It also exercises the same overlay positioning model as menus, so it is a useful proof that the portal/overlay architecture is correct.

Priority: P0.

### Dialog, modal, and overlay primitive

Evidence:

```html
<!-- multi-browser index.html -->
<div id="command-palette" class="mb-modal" role="dialog" aria-modal="true" aria-label="Command palette" hidden>
  <div class="mb-modal-panel">...</div>
</div>
```

```html
<!-- multi-browser index.html -->
<div id="help-overlay" class="mb-modal" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts" hidden>
  <div class="mb-modal-panel">...</div>
</div>
```

Missing control:

`awwbookmarklet-dialog`

Suggested API:

```html
<awwbookmarklet-dialog id="command-dialog" modal label="Command palette">
  <span slot="title">Command palette</span>
  <awwbookmarklet-command-palette></awwbookmarklet-command-palette>
</awwbookmarklet-dialog>
```

Methods/properties:

- `open`
- `modal`
- `label`
- `closeOnEscape`
- `closeOnBackdrop`
- `show()`
- `close(reason)`

Events:

- `awwbookmarklet-dialog-open`
- `awwbookmarklet-dialog-close`
- `awwbookmarklet-dialog-cancel`

Required behavior:

- Focus trap when modal.
- Restore focus on close.
- Escape key policy.
- Backdrop click policy.
- Overlay root/portal rendering.
- Stable z-index coordination with menus, dropdowns, and windows.

Why it matters:

Without a dialog primitive, command palette, help overlay, saved sessions panel, manual copy fallback, settings prompt, and future confirmation flows will each invent their own focus behavior and z-index rules.

Priority: P0.

### Command palette and help overlay

Evidence:

```js
// multi-browser.js
function openCommandPalette() { ... }
function renderCommandPaletteList(query) { ... }
```

```html
<!-- multi-browser index.html -->
<input id="command-palette-input" class="mb-palette-input" type="text" placeholder="Type a command">
<div id="command-palette-list" class="mb-palette-list" role="listbox" aria-label="Commands"></div>
```

Missing controls:

- `awwbookmarklet-command-palette`
- `awwbookmarklet-shortcut-help`

Suggested API:

```html
<awwbookmarklet-command-palette
  commands="global"
  placeholder="Type a command"
  empty-text="No commands match">
</awwbookmarklet-command-palette>
```

```html
<awwbookmarklet-shortcut-help commands="global"></awwbookmarklet-shortcut-help>
```

Required behavior:

- Consume the existing command registry.
- Filter by command title, keywords, group, and shortcut.
- Use `awwbookmarklet-listbox` internally.
- Render shortcut chips consistently.
- Support disabled command explanations.
- Dispatch command execution through one path.

Why it matters:

The library already has command infrastructure, but no first-class command UI. This creates a paradox: the app has a command registry abstraction, then each app still builds bespoke command buttons, palette rows, and help rows.

Priority: P0.

### Toast and transient feedback

Evidence:

```js
// mini-web-browser.js
function showActionToast(message, tone = 'info') { ... }
```

```css
/* preview.css */
.lp-url-toast {
  position: fixed !important;
  animation: lp-toast-slide-in 0.3s ease-out !important;
}
```

Missing API:

`awwbookmarklet-toast-stack` and `showToast()`

Suggested API:

```js
showToast({
  message: 'Copied URL',
  tone: 'success',
  timeout: 1800,
  anchor: button
});
```

Markup option:

```html
<awwbookmarklet-toast tone="success" timeout="1800">Copied URL</awwbookmarklet-toast>
```

Required behavior:

- Portal into overlay root.
- Position relative to viewport or anchor.
- Auto-dismiss with pause-on-hover.
- Tone variants: info, success, warning, danger.
- Replace/update by key for repeated copy actions.
- Respect reduced motion.

Priority: P0.

### Banner, alert, and callout

Evidence:

```html
<!-- page-content-select index.html -->
<section id="draft-banner" class="pcs-banner" hidden>
  <p>...</p>
  <div class="pcs-banner-actions">...</div>
</section>
```

```html
<!-- notifications-and-reminders index.html -->
<section id="reminders-disabled-banner" class="reminders-banner" hidden>
  ...
</section>
```

```html
<!-- session-snapshot index.html -->
<p class="session-privacy">Screenshots may include private data.</p>
```

Missing control:

`awwbookmarklet-alert` or `awwbookmarklet-callout`

Suggested API:

```html
<awwbookmarklet-alert tone="warning" title="Draft available" dismissible>
  A previous draft can be restored.
  <awwbookmarklet-toolbar slot="actions">
    <awwbookmarklet-button>Restore</awwbookmarklet-button>
    <awwbookmarklet-button variant="ghost">Start fresh</awwbookmarklet-button>
  </awwbookmarklet-toolbar>
</awwbookmarklet-alert>
```

Why it matters:

The inspiration apps distinguish informational status, warnings, disabled states, privacy notes, and recoverable draft prompts. A single statusbar is too low-level. Alerts/callouts should make these flows visually consistent and accessible.

Priority: P0.

### Empty, loading, error, and blocked states

Evidence:

```html
<!-- bookmark_manager index.html -->
<div class="lp-bookmarks-empty" id="lpBookmarksEmpty" style="display: none;">...</div>
<div class="lp-bookmarks-no-results" id="lpBookmarksNoResults" style="display: none;">...</div>
```

```css
/* preview.css */
.lp-loading { ... }
.lp-error { ... }
```

```css
/* session_snapshot.css */
.session-empty { color: var(--atools-muted); }
.session-row.is-error { ... }
```

Missing controls:

- `awwbookmarklet-empty-state`
- `awwbookmarklet-loading-state`
- `awwbookmarklet-error-state`
- `awwbookmarklet-state-overlay`

Suggested API:

```html
<awwbookmarklet-state-overlay state="loading" label="Capturing page"></awwbookmarklet-state-overlay>
<awwbookmarklet-empty-state icon="search" title="No results" description="Try a different query."></awwbookmarklet-empty-state>
```

Required behavior:

- Used inside panels, cards, iframe panels, and full app shells.
- Stable height to prevent layout collapse.
- Optional actions slot.
- Accessible status announcements when state changes.

Priority: P0.

### Card, row, and collection primitives

Evidence:

```css
/* page_content_select.css */
.pcs-block-card { ... }
.pcs-session-row { ... }
```

```css
/* session_snapshot.css */
.session-row { ... }
.session-row.is-capturing { ... }
.session-row.is-captured { ... }
.session-row.is-skipped { ... }
.session-row.is-error { ... }
```

```js
// page_content_select.js
function createBlockCard(block) { ... }
function renderBlocksList() { ... }
```

```js
// session_snapshot.js
function renderEntries() { ... }
```

Missing controls:

- `awwbookmarklet-card`
- `awwbookmarklet-list`
- `awwbookmarklet-list-item`
- `awwbookmarklet-action-card`
- `awwbookmarklet-selectable-row`

Suggested API:

```html
<awwbookmarklet-list empty-text="No blocks yet">
  <awwbookmarklet-list-item tone="success" selected>
    <input slot="leading" type="checkbox">
    <span slot="title">Example page</span>
    <span slot="meta">example.com</span>
    <p slot="description">Captured description text...</p>
    <awwbookmarklet-toolbar slot="actions">
      <awwbookmarklet-icon-button icon="copy" label="Copy"></awwbookmarklet-icon-button>
      <awwbookmarklet-icon-button icon="trash" label="Delete" tone="danger"></awwbookmarklet-icon-button>
    </awwbookmarklet-toolbar>
  </awwbookmarklet-list-item>
</awwbookmarklet-list>
```

Why it matters:

The dynamic row/card code is repeated, verbose, and easy to make inaccessible. The library should provide the stable skeleton so apps only provide data and actions.

Priority: P0.

### Metric/stat cards

Evidence:

```html
<!-- notifications-and-reminders index.html -->
<section class="reminders-stats" aria-label="Reminder summary">
  <article class="reminders-stat-card">
    ...
  </article>
</section>
```

Missing controls:

- `awwbookmarklet-metric-grid`
- `awwbookmarklet-metric-card`

Suggested API:

```html
<awwbookmarklet-metric-grid columns="auto">
  <awwbookmarklet-metric-card label="Overdue" value="2" tone="danger"></awwbookmarklet-metric-card>
  <awwbookmarklet-metric-card label="Due soon" value="4" tone="warning"></awwbookmarklet-metric-card>
</awwbookmarklet-metric-grid>
```

Priority: P1.

### Rich content viewer and sanitized preview

Evidence:

```html
<!-- page-content-select index.html -->
<div id="pending-content" class="pcs-preview"></div>
<div id="blocks-list" class="pcs-blocks"></div>
```

```css
/* page_content_select.css */
.pcs-preview table,
.pcs-block-content table { ... }
.pcs-preview img,
.pcs-block-content img { ... }
.pcs-preview pre,
.pcs-block-content pre { ... }
```

```html
<!-- page-screenshot index.html -->
<div id="preview-host" class="page-screenshot-preview-host"></div>
```

```js
// session_snapshot.js
previewRoot = ui.previewHost.attachShadow({ mode: 'open' });
```

Missing controls:

- `awwbookmarklet-rich-preview`
- `awwbookmarklet-html-viewer`
- `awwbookmarklet-shadow-preview`

Suggested API:

```html
<awwbookmarklet-rich-preview sanitize links="safe" images="constrained"></awwbookmarklet-rich-preview>
```

```js
preview.html = sanitizedHtml;
preview.emptyText = 'Nothing selected yet.';
```

Required behavior:

- Constrain tables, images, pre/code, blockquotes.
- Apply theme-compatible content typography.
- Optionally use shadow DOM to isolate imported page styles.
- Provide a sanitizer hook but do not silently trust arbitrary HTML.

Why it matters:

Several apps render page-derived HTML. This is one of the highest-risk areas for visual inconsistency and security mistakes.

Priority: P0.

### Contenteditable editor

Evidence:

```html
<!-- rich-text-to-markdown index.html -->
<div id="input" class="atools-input" contenteditable="true" role="textbox" aria-multiline="true" data-placeholder="Paste rich text here"></div>
```

```css
/* page_screenshot.css */
.page-screenshot-description-editor[contenteditable='true']:focus { ... }
```

```css
/* page_content_select.css */
.pcs-note-editor { ... }
.pcs-note-editor:focus { ... }
```

Missing control:

`awwbookmarklet-rich-editor`

Suggested API:

```html
<awwbookmarklet-rich-editor
  placeholder="Paste rich text here"
  multiline
  sanitize="paste"
  value-format="html">
</awwbookmarklet-rich-editor>
```

Required behavior:

- Placeholder for empty contenteditable.
- Paste handling hook.
- Sanitized HTML and plain text getters.
- `input` event semantics that match other controls.
- Readonly/editable mode.
- Keyboard and selection preservation for paste.

Priority: P0 for rich text apps, P1 for general component library.

### Browser/iframe panel

Evidence:

```html
<!-- mini-web-browser index.html -->
<iframe id="browser-frame" class="mini-browser-frame" title="Mini web browser content frame" referrerpolicy="no-referrer" sandbox="allow-scripts allow-forms allow-same-origin"></iframe>
```

```js
// multi-browser.js
function createTile(requestedUrl, titleHint = '') { ... }
function showTileState(tile, state, message = '') { ... }
function hideTileState(tile) { ... }
```

```css
/* preview.css */
.lp-iframe { ... }
.lp-loading { ... }
.lp-error { ... }
```

Missing controls:

- `awwbookmarklet-browser-panel`
- `awwbookmarklet-iframe-frame`

Suggested API:

```html
<awwbookmarklet-browser-panel
  src="https://example.com"
  sandbox="allow-scripts allow-forms allow-same-origin"
  referrerpolicy="no-referrer"
  loading-label="Loading page">
  <awwbookmarklet-toolbar slot="actions">...</awwbookmarklet-toolbar>
</awwbookmarklet-browser-panel>
```

Events:

- `awwbookmarklet-frame-load`
- `awwbookmarklet-frame-error`
- `awwbookmarklet-frame-command`
- `awwbookmarklet-frame-fallback-open`

Required behavior:

- Loading overlay.
- Error overlay.
- Retry action.
- Open externally action.
- Optional address bar slot.
- Sandboxing/referrer defaults.
- Iframe pointer/drag coordination for surrounding windows.

Priority: P0 because mini browser, multi browser, and preview window all need it.

### Tile workspace and layout manager

Evidence:

```html
<!-- multi-browser index.html -->
<main id="workspace" class="mb-workspace" aria-label="MultiBrowser workspace" tabindex="-1"></main>
```

```js
// multi-browser-core.js
function computeTileRects(...) { ... }
function clampFloatingRect(...) { ... }
```

```js
// multi-browser.js
function renderWorkspace() { ... }
function focusTile(tileId) { ... }
function setLayoutMode(nextMode) { ... }
```

Missing controls/APIs:

- `awwbookmarklet-workspace`
- `awwbookmarklet-tile`
- `awwbookmarklet-layout-controller`

Suggested API:

```html
<awwbookmarklet-workspace layout="grid" focus-mode="roving" persist-key="multi-browser">
  <awwbookmarklet-tile tile-id="a" title="Example">
    <awwbookmarklet-browser-panel src="https://example.com"></awwbookmarklet-browser-panel>
  </awwbookmarklet-tile>
</awwbookmarklet-workspace>
```

Programmatic API:

```js
workspace.addTile({ id, title, url });
workspace.setLayout('floating');
workspace.focusTile(id);
workspace.serializeLayout();
workspace.restoreLayout(snapshot);
```

Why it matters:

The multi-browser code is large because it owns tile creation, focus, z-index, drag, geometry, layout modes, and iframe states. This is too much application logic for a project that should mostly declare browser panes and commands.

Priority: P1. It is large enough to build after the smaller primitives are stable.

### Clipboard, manual fallback, and copy actions

Evidence:

```js
// page_content_select.js
function showManualFallback(plainText) { ... }
```

```html
<!-- page-content-select index.html -->
<div id="manual-copy-wrap" class="pcs-manual-copy" hidden>
  <textarea id="manual-copy-text" class="atools-textarea pcs-manual-text" readonly></textarea>
</div>
```

```js
// page_screenshot.js
function pulseButtonSuccess(button, successLabel) { ... }
```

Missing APIs:

- `copyToClipboard()`
- `awwbookmarklet-copy-button`
- `awwbookmarklet-manual-copy`

Suggested API:

```html
<awwbookmarklet-copy-button
  format="text/html"
  success-label="Copied"
  fallback="manual">
  Copy as rich text
</awwbookmarklet-copy-button>
```

```js
await copyToClipboard({
  text,
  html,
  imageBlob,
  fallbackContainer: manualCopy
});
```

Required behavior:

- Clipboard API support detection.
- Fallback to text selection/manual copy.
- Consistent success/error feedback.
- Button pulse without hardcoded label restoration bugs.
- Rich text/plain text/image support.

Priority: P0.

### Download/export helper

Evidence:

```html
<!-- session-snapshot index.html -->
<button id="download-zip-btn" class="atools-button atools-button--primary">Download ZIP archive</button>
<button id="download-html-btn" class="atools-button">Download HTML Preview</button>
```

```html
<!-- page-content-select index.html -->
<button id="compile-download-btn" class="atools-button atools-button--primary">Compile and Download</button>
```

Missing API:

`downloadBlob()` as a shared utility, plus `awwbookmarklet-download-button` if command binding is useful.

Suggested API:

```js
downloadBlob({
  blob,
  filename,
  revoke: true
});
```

Priority: P1.

### Preset selector and saved item panel

Evidence:

```html
<!-- multi-browser index.html -->
<select id="preset-select" class="mb-select"></select>
<button id="apply-preset-btn" class="mb-btn">Apply</button>
<button id="save-preset-btn" class="mb-btn">Save</button>
<button id="save-as-preset-btn" class="mb-btn">Save As</button>
```

```html
<!-- page-content-select index.html -->
<section id="saved-sessions-panel" class="pcs-panel" hidden>
  <div id="saved-sessions-list" class="pcs-sessions-list"></div>
</section>
```

Missing controls:

- `awwbookmarklet-preset-picker`
- `awwbookmarklet-saved-items-panel`

Suggested API:

```html
<awwbookmarklet-preset-picker
  value="research"
  apply-label="Apply"
  save-label="Save"
  save-as-label="Save As">
</awwbookmarklet-preset-picker>
```

Priority: P2. This is common but more application-specific than field, shell, toolbar, and dialog.

### Toggle/switch and checkbox row

Evidence:

```html
<!-- notifications-and-reminders index.html -->
<label class="reminders-checkbox">
  <input id="show-completed" type="checkbox">
  <span>Show completed</span>
</label>
```

```js
// settings.js
input.type = 'checkbox';
wrapper.append(input, label);
```

Current coverage:

`awwbookmarklet-checkbox` exists, but the app needs a row/field composition.

Missing control:

`awwbookmarklet-switch` or `awwbookmarklet-toggle-field`

Suggested API:

```html
<awwbookmarklet-toggle-field
  label="Show completed"
  help="Include completed reminders in grouped lists"
  checked>
</awwbookmarklet-toggle-field>
```

Priority: P1.

### Segmented control and radio group

Evidence:

```js
// settings.js
const radioGroup = document.createElement('div');
radioGroup.className = 'lp-radio-group';
```

Current coverage:

`awwbookmarklet-radio` and radio group coordination exist, but no first-class group UI exists.

Missing control:

`awwbookmarklet-segmented-control` and/or `awwbookmarklet-radio-group`

Suggested API:

```html
<awwbookmarklet-segmented-control value="grid">
  <option value="grid">Grid</option>
  <option value="floating">Floating</option>
  <option value="focus">Focus</option>
</awwbookmarklet-segmented-control>
```

Priority: P1.

### Status line and warning line

Evidence:

```js
// page_content_select.js
function setStatus(message, tone = 'info') { ... }
function setWarning(message, tone = 'info') { ... }
```

```js
// page_screenshot.js
function setStatus(message, tone = 'info') { ... }
function setWarning(message, tone = 'info') { ... }
```

```js
// multi-browser.js
function setStatus(message, tone = 'info') { ... }
```

Current coverage:

`awwbookmarklet-statusbar` exists, but the apps also need inline status lines, warning lines, and status helpers.

Missing controls/APIs:

- `awwbookmarklet-status-line`
- `awwbookmarklet-warning-line`
- `setStatusLine(element, { message, tone })`

Suggested API:

```html
<awwbookmarklet-status-line tone="info" live="polite">Initializing...</awwbookmarklet-status-line>
```

```js
statusLine.update('Copied markdown', { tone: 'success' });
```

Priority: P0.

## Repeated functions and code patterns to extract

### DOM reference and state bootstrap

Pattern:

```js
const ui = {
  statusLine: document.getElementById('status-line'),
  warningLine: document.getElementById('warning-line'),
  ...
};

const state = {
  ...
};
```

Found in:

- `mini-web-browser.js`
- `multi-browser.js`
- `page_content_select.js`
- `page_screenshot.js`
- `session_snapshot.js`
- `notifications-and-reminders.js`

Potential extraction:

```js
const ui = collectRefs({
  statusLine: '#status-line',
  warningLine: '#warning-line',
  copyButton: '#copy-markdown-btn'
});
```

This is optional. It is not a UI component, but it would reduce repetitive null-prone initialization. If added, keep it tiny and explicit. Do not build a framework-sized state library.

Priority: P2.

### Status/warning setters

Pattern:

```js
function setStatus(message, tone = 'info') {
  ui.statusLine.textContent = message;
  ui.statusLine.classList.toggle('is-error', tone === 'error');
  ui.statusLine.classList.toggle('is-success', tone === 'success');
}
```

Found in:

- `mini-web-browser.js`
- `multi-browser.js`
- `page_content_select.js`
- `page_screenshot.js`
- `rich-text-to-markdown.js`

Extraction:

`awwbookmarklet-status-line` should own this behavior. Application code should set a property, not remember class names.

Priority: P0.

### Render all / render control states split

Pattern:

```js
function renderAll() { ... }
function renderControlStates() { ... }
function updateControlStates() { ... }
```

Found in:

- `page_content_select.js`
- `page_screenshot.js`
- `session_snapshot.js`
- `notifications-and-reminders.js`

Extraction:

Do not create a generic rendering framework yet. Instead, move common control-state features into components:

- Buttons expose `busy`, `disabled`, `pressed`, `variant`, `tone`.
- Lists expose `empty`.
- Panels expose `hidden` and state slots.
- Clipboard/export actions own pending/success/error labels.

This removes much of the reason `renderControlStates()` exists.

Priority: P1.

### Dynamic row/card rendering

Pattern:

```js
function createBlockCard(block) { ... }
function renderBlocksList() { ... }
function renderEntries() { ... }
```

Found in:

- `page_content_select.js`
- `session_snapshot.js`
- `notifications-and-reminders.js`
- `bookmark_manager.js`

Extraction:

Create reusable list/card components first. A higher-level `renderList(container, items, renderItem)` helper can come later, but the visual skeleton belongs in custom elements.

Priority: P0.

### Manual copy fallback

Pattern:

```js
function showManualFallback(plainText) { ... }
```

Found in:

- `page_content_select.js`
- `page_screenshot.js`
- `rich-text-to-markdown.js`

Extraction:

`copyToClipboard()` and `awwbookmarklet-manual-copy` should handle this. Application code should only provide payloads.

Priority: P0.

### Button success pulse

Pattern:

```js
function pulseButtonSuccess(button, successLabel) { ... }
```

Found in:

- `page_screenshot.js`
- similar behavior in `mini-web-browser.js` toast feedback and rich text copy feedback

Extraction:

Add `button.flash({ label, tone, timeout })` or make `awwbookmarklet-copy-button` own success feedback.

Priority: P1.

### URL normalization and query handling

Pattern:

URL input, URL/search distinction, canonicalization, and bookmark picker logic are spread through:

- `url_picker_core.js`
- `url_picker_canonical.js`
- `mini-web-browser-core.js`
- `multi-browser-core.js`

Extraction:

Keep URL parsing/canonicalization in a non-visual core module. Build `awwbookmarklet-url-picker` on top of it.

Priority: P0.

### Sanitization and safe preview rendering

Pattern:

Sanitization/rendering appears in:

- `page_content_select_sanitize.js`
- `page_screenshot_sanitize.js`
- `rich-text-to-markdown.js`
- `session_snapshot.js` preview generation

Extraction:

Create a shared `sanitizeHtml()` utility and `awwbookmarklet-rich-preview`. The control should constrain layout, but the sanitizer should be testable as a pure function.

Priority: P0.

### Date, ID, and text helpers

Pattern:

Helpers like whitespace collapse, GUID creation, domain extraction, local datetime formatting, byte measurement, and file naming appear in:

- `page_content_select_core.js`
- `page_screenshot_core.js`
- `session_snapshot_core.js`
- `multi-browser-core.js`

Extraction:

Add small utility modules:

- `text.js`: `collapseWhitespace`, `truncateText`
- `ids.js`: `createId`, `createGuid`
- `dates.js`: `formatLocalDateTime`
- `urls.js`: URL/domain/page key helpers
- `files.js`: filename sanitization, blob download

Priority: P1.

## CSS and layout issues discovered from the inspiration apps

### Each app has its own shell model

The apps use several independent page shells:

- `.atools-shell`
- `.mb-shell`
- `.mini-browser-shell`
- `.page-screenshot-shell`
- `.session-shell`
- `.settings-shell`

This is the core source of visual inconsistency. These shells solve the same problem with different spacing, title styles, backgrounds, and responsive behavior.

Action:

Create one app shell and one panel grid. Allow app-specific customization through slots and tokens, not app-specific shell CSS.

### Action rows repeatedly reimplement flex wrapping

CSS patterns:

```css
.pcs-header-actions,
.pcs-controls,
.pcs-banner-actions { display: flex; flex-wrap: wrap; gap: ...; }
```

```css
.session-preview-actions { display: flex; flex-wrap: wrap; ... }
```

Action:

Move this to `awwbookmarklet-toolbar`. The toolbar should handle wrapping and compact density.

### Content previews repeat dangerous page-content CSS

CSS patterns:

```css
.pcs-preview table,
.pcs-block-content table { ... }
.pcs-preview img,
.pcs-block-content img { ... }
.pcs-preview pre,
.pcs-block-content pre { ... }
```

This is a repeated requirement: imported HTML must not break app layout. It needs a library component, not copied CSS.

Action:

Implement `awwbookmarklet-rich-preview` with default content CSS for tables, images, code, blockquotes, links, and scrollable overflow.

### Fixed-position extension overlays use extreme z-index and `!important`

Evidence:

```css
.lp-window { position: fixed !important; z-index: 2147483647 !important; }
.lp-url-toast { position: fixed !important; }
.lp-parent-toolbar { position: fixed !important; }
```

This is understandable for content scripts injected into arbitrary pages, but it should not be the internal style model of the component library. The new library should isolate itself through the desktop/overlay root and shadow DOM rather than spreading `!important`.

Action:

Use shadow DOM and a managed overlay root for windows, menus, dropdowns, dialogs, and toasts. Keep `!important` as an edge tool for page injection only, not component internals.

### Some responsive behavior is ad hoc

Examples:

- page screenshot header/action rows add media queries.
- session snapshot rows change grid layout at narrow widths.
- page content select stacks panel heads and rows.
- multi-browser topbar has a unique dense layout.

Action:

Introduce reusable responsive primitives:

- `awwbookmarklet-stack`
- `awwbookmarklet-inline`
- `awwbookmarklet-panel-grid`
- toolbar wrapping rules
- list item responsive slots

Do this carefully. Layout primitives should be minimal. Avoid inventing a complete CSS utility framework.

## Component/API roadmap

### P0: required for serious parity

1. `awwbookmarklet-app-shell`
2. `awwbookmarklet-toolbar`
3. `awwbookmarklet-field`
4. `awwbookmarklet-status-line`
5. `awwbookmarklet-alert`
6. `awwbookmarklet-dialog`
7. `awwbookmarklet-command-palette`
8. `awwbookmarklet-combobox`
9. `awwbookmarklet-url-picker`
10. `awwbookmarklet-toast` / `showToast()`
11. `awwbookmarklet-empty-state`
12. `awwbookmarklet-state-overlay`
13. `awwbookmarklet-list` / `awwbookmarklet-list-item`
14. `awwbookmarklet-card`
15. `awwbookmarklet-rich-preview`
16. `awwbookmarklet-browser-panel`
17. Clipboard helper and manual-copy component

### P1: needed soon, but can build after P0 foundations

1. `awwbookmarklet-rich-editor`
2. `awwbookmarklet-metric-card`
3. `awwbookmarklet-toggle-field`
4. `awwbookmarklet-radio-group`
5. `awwbookmarklet-segmented-control`
6. `awwbookmarklet-download-button`
7. URL/date/text/file utility modules
8. Hotkey registry and shortcut help renderer
9. Tile workspace prototype

### P2: useful app accelerators

1. `awwbookmarklet-preset-picker`
2. `awwbookmarklet-saved-items-panel`
3. DOM ref helper
4. Draft/session storage helper
5. Generic render-list helper
6. Settings schema renderer

## Recommended API principles

### Prefer composed components over CSS class copying

Bad migration target:

```html
<div class="pcs-controls">
  <awwbookmarklet-button>Copy</awwbookmarklet-button>
</div>
```

Better target:

```html
<awwbookmarklet-toolbar>
  <awwbookmarklet-button>Copy</awwbookmarklet-button>
</awwbookmarklet-toolbar>
```

Reason:

If layout wrappers stay app-owned, the inconsistency remains. The library should own common structure when that structure repeats in three or more apps.

### Keep native semantics where possible

Controls should expose normal properties:

- `value`
- `checked`
- `disabled`
- `open`
- `selectedIndex`

Events should be predictable:

- Native-named events only when native-like semantics are preserved.
- Custom names for higher-level actions, for example `awwbookmarklet-command-run` or `awwbookmarklet-url-submit`.

### Use slots for composition, properties for state

Use slots for visual placement:

- `title`
- `subtitle`
- `actions`
- `meta`
- `description`
- `leading`
- `trailing`
- `footer`

Use properties/attributes for state:

- `tone`
- `variant`
- `density`
- `busy`
- `open`
- `empty`
- `selected`
- `disabled`

### Avoid component names that encode one app too strongly

Do not add `page-content-block-card` or `session-snapshot-row` to the generic library. Those are app concepts. The generic reusable shapes are:

- list item with actions
- rich preview block
- manual copy fallback
- browser panel
- alert/banner

### Make overlay coordinate ownership explicit

Menus, dropdowns, dialogs, toasts, URL picker popups, and command palettes all need the same overlay policy. Do not let each component choose its own fixed/absolute coordinate model.

Recommended internal API:

```js
overlayRoot.position(anchor, popup, {
  placement: 'bottom-start',
  strategy: 'viewport',
  collision: 'flip-and-shift'
});
```

This avoids repeating the old class of menu/dropdown positioning bugs.

## Migration strategy

### Phase 1: foundation and smallest app conversions

Build:

- app shell
- toolbar
- field
- status line
- alert
- empty/loading/error states
- copy helper

Then migrate:

- `rich-text-to-markdown`
- `page-screenshot`

Why:

These apps have clear panels, status lines, buttons, contenteditable/rich preview needs, and copy flows. They will validate the shell and feedback system quickly.

### Phase 2: overlay and command surfaces

Build:

- dialog
- command palette
- shortcut help
- toast
- combobox base
- URL picker

Then migrate:

- `mini-web-browser`
- command/help parts of `multi-browser`

Why:

This phase validates overlay root positioning, keyboard navigation, and command registry integration.

### Phase 3: list/card and preview-heavy tools

Build:

- list/list item/card
- rich preview
- selectable row
- metric card
- manual copy component

Then migrate:

- `page-content-select`
- `session-snapshot`
- `notifications-and-reminders`
- `bookmark-manager`

Why:

These apps have the most repeated row/card/state rendering code.

### Phase 4: workspace and advanced composition

Build:

- browser panel
- tile workspace
- layout controller
- preset picker
- saved items panel

Then migrate:

- `multi-browser`
- larger preview/browser surfaces

Why:

This is the biggest behavior surface. It depends on the earlier primitives.

## File-by-file notes

### `atools-shared.css`

Provides a shared visual language for some apps:

- body/shell/header/title/actions
- button variants
- panels and panel grid
- input/textarea
- status/help/error
- URL picker dropdown

Main opportunity:

This file is effectively a prototype for the new library layer. Convert its stable concepts into real components instead of copying its classes.

Risk:

It mixes application shell, button styling, form styling, status styling, and URL picker styling in one stylesheet. That makes it easy for future apps to depend on accidental CSS behavior.

### `mini-web-browser.js`

Strong reusable patterns:

- URL picker integration.
- Address toolbar.
- Action dropdown.
- Toast feedback.
- Loading/status line.
- Iframe command request/response.
- Copy URL/bookmark/markdown actions.

Missing library pieces exposed:

- URL picker.
- Browser panel.
- Action dropdown or popover menu.
- Toast.
- Clipboard helper.

### `mini-web-browser.css`

Strong reusable patterns:

- compact browser toolbar
- address input with flexible width
- loading indicator
- iframe content region
- action dropdown styling

Risk:

The action dropdown is probably another overlay coordinate problem waiting to happen unless it uses the same popup engine as menus and comboboxes.

### `multi-browser.js`

Strong reusable patterns:

- command palette
- help overlay
- tile creation
- tile focus and z-order
- iframe state overlays
- layout modes
- preset save/apply controls
- hotkey normalization and relay

Missing library pieces exposed:

- command palette
- shortcut help
- dialog
- browser panel
- tile workspace
- preset picker
- URL picker

Risk:

This file contains too much UI infrastructure for one app. If the library does not absorb at least command palette, dialog, URL picker, browser panel, and tile state overlay, the multi-browser app will remain a forked UI framework.

### `multi-browser-core.js`

Strong reusable patterns:

- layout rect calculation
- floating rect clamp
- hotkey normalization
- reserved hotkey detection

Recommended extraction:

Move geometry and hotkey pieces into library core modules only after the public component APIs need them. Do not expose all internals prematurely.

### `page_content_select.js`

Strong reusable patterns:

- status/warning setters
- draft banner
- saved sessions list
- pending preview
- block cards
- note editor
- copy rich/plain text
- compile/download
- manual copy fallback
- auto-save/draft flows

Missing library pieces exposed:

- alert/banner
- rich preview
- card/list item
- rich editor or note editor
- copy helper
- manual copy panel
- download helper
- saved items panel

Risk:

The app mixes domain state, storage, HTML sanitization, card rendering, and clipboard UI. This will be expensive to maintain unless the library absorbs the rendering and feedback surfaces.

### `page_content_select.css`

Strong reusable patterns:

- panel headers with action rows
- preview content constraints
- block card layout
- note editor focus state
- empty state
- saved session rows
- responsive stacking

Recommended extraction:

Most of this should become `panel`, `toolbar`, `rich-preview`, `list-item`, `card`, `empty-state`, and `rich-editor` styles.

### `page_content_select_core.js`

Strong reusable patterns:

- text collapse
- GUID creation
- page key/domain normalization
- local datetime formatting
- aggregate HTML/plain text/document generation
- byte measurement

Recommended extraction:

Move generic helpers to tested core utilities. Keep page-content-specific document assembly inside the app.

### `page_content_select_storage.js`

Strong reusable patterns:

- draft expiry
- byte limit handling
- normalize records
- pin/delete/list saved records

Recommended extraction:

P2 storage helper. Useful, but should not block UI parity.

### `page_screenshot.js`

Strong reusable patterns:

- status/warning setters
- capture state rendering
- editable description region
- preview render
- control state updates
- copy markdown/image
- button success pulse
- manual copy fallback

Missing library pieces exposed:

- rich preview
- rich editor
- copy button/helper
- state overlay
- status/warning line

### `page_screenshot.css`

Strong reusable patterns:

- screenshot preview card
- image frame
- editable description focus
- retake overlay
- hidden manual copy buffer
- responsive action rows

Recommended extraction:

`rich-preview`, `state-overlay`, `copy-button`, and `toolbar` would remove much of the local CSS.

### `page_screenshot_preview.js`

Strong reusable patterns:

- preview HTML assembly
- editable description rendering
- constrained rich content

Recommended extraction:

Do not move page-screenshot-specific rendering wholesale. Instead, make `awwbookmarklet-rich-preview` and `awwbookmarklet-rich-editor` good enough that this file shrinks.

### `session_snapshot.js`

Strong reusable patterns:

- capture options form
- global status
- row list with checkbox/title/url/description/status/thumb
- preview host with shadow root
- ZIP/HTML download actions
- close selected tabs action

Missing library pieces exposed:

- field wrapper
- selectable list item
- thumbnail slot
- status row tone
- shadow preview/rich preview
- download helper
- toolbar

### `session_snapshot.css`

Strong reusable patterns:

- control grid
- status summary
- row states
- thumbnail placeholders
- preview host
- responsive rows

Recommended extraction:

`field`, `list-item`, `metric/status`, `rich-preview`, and `toolbar`.

### `notifications-and-reminders.js`

Strong reusable patterns:

- form with mode-specific fields
- search/filter controls
- show completed toggle
- stat cards
- grouped reminder lists
- disabled banner
- feedback line

Missing library pieces exposed:

- field
- toggle field
- metric card
- alert/banner
- grouped list/list item
- status line
- segmented/radio mode control

### `notifications-and-reminders.css`

Strong reusable patterns:

- stat card grid
- mode group active/inactive state
- reminder group/list row
- banner
- field help

Recommended extraction:

`metric-card`, `alert`, `field`, `toggle-field`, `list-item`.

### `rich-text-to-markdown.js`

Strong reusable patterns:

- contenteditable paste input
- sanitizer fallback
- debounced conversion
- status mode updates
- copy with fallback
- empty/ready/error state transitions

Missing library pieces exposed:

- rich editor
- copy helper
- status line
- field/panel shell

### `rich-text-to-markdown.css`

Strong reusable patterns:

- two-panel layout
- output textarea stretch
- status dot/hint

Recommended extraction:

Panel grid plus status line with optional indicator slot.

### `bookmark_manager.js`

Strong reusable patterns:

- search input
- filter select
- recursive tree/list rendering
- empty and no-results states
- row actions for open/copy

Missing library pieces exposed:

- search field
- list/tree item
- empty state
- toolbar/action group

### `bookmark_manager.css`

Main risk:

This app predates the shared `atools` style and likely looks the least consistent. It should be a migration target after list, field, and empty-state components exist.

### `settings.js`

Strong reusable patterns:

- schema-driven setting rows
- boolean checkbox/toggle
- number validation
- enum radio group
- select control
- snooze select + action
- reset buttons
- error text

Missing library pieces exposed:

- field wrapper
- toggle field
- radio group/segmented control
- settings row
- validation message
- button danger variant

Recommendation:

Do not build a full settings schema renderer first. Build the underlying field, toggle, radio group, validation, and toolbar controls. A schema renderer can be a later P2 helper.

### `settings.css`

Strong reusable patterns:

- settings shell
- category panels
- row/meta/control/action split
- validation/error input states
- radio group

Recommended extraction:

`field`, `panel`, `list-item` or `settings-row`, `radio-group`, `alert`.

### `preview.css`

Strong reusable patterns:

- fixed preview window
- titlebar controls
- URL bar
- iframe content
- loading/error overlay
- toast
- resize handles
- source link highlight
- parent toolbar
- reader mode content

Missing library pieces exposed:

- browser panel
- toast
- state overlay
- window resize handles are partly covered by current library
- rich/reader preview
- toolbar
- icon buttons

Important caution:

This stylesheet is built for hostile page injection and uses `!important` extensively. It should inspire component behavior, not be copied into the library.

## Concrete migration examples

### Page Content Select pending panel

Current shape:

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

Target shape:

```html
<awwbookmarklet-panel>
  <span slot="title">Pending Selection</span>
  <awwbookmarklet-toolbar slot="actions">
    <awwbookmarklet-button variant="primary" command="selection.commit">Start selection</awwbookmarklet-button>
    <awwbookmarklet-button command="selection.refresh">Refresh preview</awwbookmarklet-button>
    <awwbookmarklet-button command="selection.cancel">Cancel selection</awwbookmarklet-button>
  </awwbookmarklet-toolbar>
  <awwbookmarklet-status-line id="pending-meta"></awwbookmarklet-status-line>
  <awwbookmarklet-rich-preview id="pending-content"></awwbookmarklet-rich-preview>
</awwbookmarklet-panel>
```

### Mini Browser toolbar

Current shape:

```html
<header class="mini-browser-toolbar">
  <button id="back-btn" class="atools-button atools-button--ghost">Back</button>
  <button id="forward-btn" class="atools-button atools-button--ghost">Forward</button>
  <div id="address-picker-root" class="lp-url-picker-root">...</div>
  <button id="actions-btn" class="atools-button atools-button--ghost">Page actions</button>
  <span id="loading-indicator" class="mini-browser-loading">Idle</span>
</header>
```

Target shape:

```html
<awwbookmarklet-toolbar density="compact">
  <awwbookmarklet-icon-button icon="arrow-left" label="Back" command="browser.back"></awwbookmarklet-icon-button>
  <awwbookmarklet-icon-button icon="arrow-right" label="Forward" command="browser.forward"></awwbookmarklet-icon-button>
  <awwbookmarklet-url-picker id="address-input" grow></awwbookmarklet-url-picker>
  <awwbookmarklet-button variant="ghost" popovertarget="page-actions">Page actions</awwbookmarklet-button>
  <awwbookmarklet-status-line id="loading-indicator" compact>Idle</awwbookmarklet-status-line>
</awwbookmarklet-toolbar>
```

### Reminder create form

Current shape:

```html
<label class="reminders-field reminders-field--wide">
  <span>Reminder</span>
  <textarea class="atools-textarea reminders-entry-input"></textarea>
  <small class="reminders-field-help">First non-empty line becomes the title.</small>
</label>
```

Target shape:

```html
<awwbookmarklet-field
  label="Reminder"
  help="First non-empty line becomes the title."
  wide>
  <awwbookmarklet-textarea id="reminder-entry" required></awwbookmarklet-textarea>
</awwbookmarklet-field>
```

## Testing needs created by these controls

When these components are implemented, unit tests are not enough. The risky behavior is in keyboard, focus, overlay positioning, and responsive layout.

Minimum browser-level tests:

- Dialog traps focus, closes on Escape, and restores focus.
- Command palette filters commands and executes exactly one command.
- URL picker dropdown appears adjacent to the input after the parent window moves.
- Toolbar wraps without horizontal overflow at minimum window width.
- Field label/help/error IDs are wired to the input.
- Rich preview constrains wide tables, images, and long code blocks.
- Copy button fires one copy attempt and shows fallback when Clipboard API is unavailable.
- Toast portals above windows and dismisses without stealing focus.
- Browser panel shows loading, error, retry, and external-open states.
- List item actions do not accidentally toggle row selection.

## Final recommendation

The library is currently a component primitive set. The inspiration apps need an application UI kit.

The most productive direction is to build the missing P0 controls before attempting a full migration of the larger apps. The first implementation batch should be:

1. `app-shell`
2. `toolbar`
3. `field`
4. `status-line`
5. `alert`
6. `dialog`
7. `toast`
8. `empty/loading/error state`
9. `copy helper`
10. `rich-preview`

After those exist, migrate `rich-text-to-markdown` and `page-screenshot` as proving grounds. Then build the overlay-heavy URL picker and command palette. Finally, tackle list/card-heavy apps and the multi-browser workspace.

This order reduces risk because it attacks the repeated UI structure first, then the repeated interaction structure, and only then the large behavior-heavy workspace abstraction.
