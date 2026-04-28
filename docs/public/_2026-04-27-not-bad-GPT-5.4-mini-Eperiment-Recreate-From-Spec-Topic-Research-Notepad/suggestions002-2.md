2026-04-26
Related: 2026-04-26-user-enhancement-research.md

A00 Change Request: Generic Split Pane Control for Retro UI Framework

---

This change request defines a new reusable split pane control for the retro UI framework used by Topic Research Notepad and future extension tools.

The control should provide a draggable divider between two content regions. It must support horizontal and vertical splitting, pointer-based resizing, keyboard resizing, minimum pane sizes, accessible separator semantics, optional persistence, and framework-consistent styling.

The immediate application need is the Topic Research Notepad layout: a left Pages sidebar and a right editor canvas. The user should be able to drag the divider to make the page tree wider or give more space to the editor. The same primitive should also be reusable later in other tools inside the browser extension.

The uploaded framework already contains a strong component foundation: custom element tags, theme tokens, base component styles, window geometry helpers, menu and command infrastructure, app shell, toolbar, panel, statusbar, titlebar, context panel, command palette, buttons, inputs, and textarea controls. The split pane should be implemented as part of this same web component system, not as an unrelated one-off app component. 

---

B00 Component Name and Role

---

Recommended component name:

```html
<awwbookmarklet-split-pane>
```

Alternative names considered:

```html
<awwbookmarklet-split-view>
<awwbookmarklet-resizable-panels>
<awwbookmarklet-splitter>
```

The preferred name is `awwbookmarklet-split-pane` because it describes the full layout primitive, not only the draggable divider.

The component owns three visual parts: the start pane, the splitter, and the end pane. In a horizontal split, the start pane is on the left and the end pane is on the right. In a vertical split, the start pane is on top and the end pane is on bottom.

The component should use Shadow DOM and the same `adoptStyles` and `BASE_COMPONENT_STYLES` pattern used by the existing framework components.

---

C00 Product Need in Topic Research Notepad

---

The current notepad layout has a left Pages panel and a right editor panel. The layout is visually close, but the left sidebar is too narrow for real page titles, especially after hierarchy is added. Page titles become truncated, and management buttons consume additional horizontal space.

The user should be able to widen the Pages area while organizing research, then shrink it while writing. This is especially important once the sidebar becomes a tree with parent pages, child pages, disclosure controls, drag handles, and context menu affordances.

The split pane also supports focus and review workflows. During research organization, the user may want more navigation space. During writing, the user may want the editor to dominate. The splitter gives the user control without adding mode complexity.

---

D00 Design Goals

---

The split pane should be generic enough for the UI framework and practical enough for the notepad.

It should support two panes, a draggable separator, horizontal and vertical direction, minimum sizes, optional maximum sizes, initial size, controlled or uncontrolled usage, keyboard resizing, pointer resizing, accessible semantics, and theme-consistent rendering.

It should not assume that it is only used for the notepad sidebar. It may later be used for browser preview plus metadata, source panel plus editor, command console plus results, screenshot preview plus controls, or any other two-region tool layout.

The component should be simple and robust. It should not implement complex multi-pane docking, tabs, nested split groups, or IDE-style layout persistence in the first version.

---

E00 Non-Goals

---

The first version should not implement more than two panes.

The first version should not implement arbitrary docking.

The first version should not implement pane tabs.

The first version should not implement snap layouts beyond optional collapse behavior.

The first version should not require a third-party dependency.

The first version should not depend on CSS frameworks outside the retro UI framework.

The first version should not require application code to manually calculate widths during normal pointer drag.

---

F00 Public Markup API

---

Recommended markup:

```html
<awwbookmarklet-split-pane
  direction="horizontal"
  value="280"
  min-start="180"
  min-end="480"
>
  <section slot="start">Pages</section>
  <main slot="end">Editor</main>
</awwbookmarklet-split-pane>
```

For vertical split:

```html
<awwbookmarklet-split-pane
  direction="vertical"
  value="320"
  min-start="160"
  min-end="180"
>
  <section slot="start">Preview</section>
  <section slot="end">Details</section>
</awwbookmarklet-split-pane>
```

The `value` attribute represents the start pane size in CSS pixels. For horizontal direction, it is the start pane width. For vertical direction, it is the start pane height.

The component should also expose a JavaScript property:

```js
splitPane.value = 300;
const current = splitPane.value;
```

The attribute and property should stay synchronized.

---

G00 Attributes and Properties

---

`direction`

Allowed values: `horizontal`, `vertical`.

Default: `horizontal`.

Horizontal means start pane, vertical splitter, end pane.

Vertical means start pane, horizontal splitter, end pane.

`value`

The size of the start pane in pixels.

Default: if not provided, use `default-value` if available, otherwise compute a reasonable initial split such as 280 px or 30 percent of available space.

`min-start`

Minimum size in pixels for the start pane.

Default: 160.

`min-end`

Minimum size in pixels for the end pane.

Default: 240.

`max-start`

Optional maximum size for the start pane.

Default: no explicit maximum beyond available size minus `min-end`.

`disabled`

When present, resizing is disabled. The splitter remains visible but inert or visually muted.

`collapsed`

Optional future attribute. If implemented, it collapses the start pane to a minimal size or zero. Not required for first version.

`persist-key`

Optional application convenience. If present, the component can persist its value to localStorage. However, persistence may be better handled by the application storage layer. For Topic Research Notepad, sidebar width should probably be persisted through the app settings store rather than localStorage inside the framework component.

Recommendation: do not implement `persist-key` in the first framework version. Instead, emit events and let the app persist.

---

H00 Slots

---

The component should define two named slots:

```html
<slot name="start"></slot>
<slot name="end"></slot>
```

The component should not assume specific tag names inside the slots.

If a slot is empty, it should still render safely. An empty slot should not break sizing or pointer behavior.

Potential future slot:

```html
<slot name="splitter"></slot>
```

This would allow custom splitter content. Not required for MVP. The framework should provide a default splitter visual.

---

I00 Parts

---

The component should expose useful Shadow DOM parts for styling:

```txt
container
start-pane
end-pane
splitter
splitter-grip
```

Example:

```css
awwbookmarklet-split-pane::part(splitter) {
  background: var(--awwbookmarklet-divider-color);
}
```

This allows the notepad to tune the splitter without forking the component.

---

J00 Events

---

The component should emit events during and after resizing.

`awwbookmarklet-split-pane-resize`

Fired during pointer or keyboard resizing.

Payload:

```js
{
  value: 300,
  direction: "horizontal",
  dragging: true
}
```

`awwbookmarklet-split-pane-resize-commit`

Fired when the user finishes resizing, such as pointerup or keyboard resize completion.

Payload:

```js
{
  value: 300,
  direction: "horizontal"
}
```

The app should listen to the commit event and persist the value in IndexedDB settings.

Example:

```js
splitPane.addEventListener("awwbookmarklet-split-pane-resize-commit", (event) => {
  storage.setSetting("sidebarWidth", event.detail.value);
});
```

The resize event lets the app respond live if necessary. The commit event prevents excessive persistence writes.

---

K00 Layout Model

---

The component should use CSS Grid internally.

For horizontal direction:

```css
grid-template-columns: var(--_start-size) var(--_splitter-size) minmax(0, 1fr);
grid-template-rows: minmax(0, 1fr);
```

For vertical direction:

```css
grid-template-rows: var(--_start-size) var(--_splitter-size) minmax(0, 1fr);
grid-template-columns: minmax(0, 1fr);
```

The start and end panes should use `min-width: 0` and `min-height: 0` to prevent overflow bugs. This is important because slotted content such as editors, lists, or tables can otherwise force the pane wider than intended.

The host should be display block by default and fill its parent when the parent gives it size.

Recommended host style:

```css
:host {
  display: block;
  min-width: 0;
  min-height: 0;
  width: 100%;
  height: 100%;
}
```

The internal container should be:

```css
.container {
  display: grid;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
}
```

---

L00 Splitter Visual Design

---

The splitter should be visible enough to be discoverable but not visually heavy.

For horizontal split, the splitter is a vertical bar. It should use `cursor: col-resize`.

For vertical split, the splitter is a horizontal bar. It should use `cursor: row-resize`.

The retro style can use a thin ridge, inset border, or small grip dots. It should align with existing framework tokens such as `--awwbookmarklet-border-subtle`, `--awwbookmarklet-divider-color`, `--awwbookmarklet-surface-inset-bg`, and focus ring tokens.

Recommended first visual:

```css
.splitter {
  background: var(--awwbookmarklet-surface-inset-bg, #dfe4ea);
  border-inline: 1px solid var(--awwbookmarklet-border-subtle, #a8b0ba);
}
```

For vertical direction, use block borders instead of inline borders.

The splitter should show focus visibly. Existing framework focus ring tokens should be used.

---

M00 Pointer Interaction

---

The pointer behavior should be controlled and predictable.

Pointer down on the splitter starts resize.

The component stores:

```js
{
  pointerId,
  startClientX,
  startClientY,
  startValue,
  hostRect
}
```

Pointer move computes the next value.

For horizontal direction:

```js
nextValue = startValue + (event.clientX - startClientX)
```

For vertical direction:

```js
nextValue = startValue + (event.clientY - startClientY)
```

Then clamp the value based on current host size, `min-start`, `min-end`, and `max-start`.

The component should use pointer capture when available.

On pointer up or pointer cancel, release pointer capture, clear drag state, and emit resize commit.

Use `requestAnimationFrame` for visual updates if needed. This prevents excessive layout churn during fast dragging.

The component should not persist inside pointermove. It should emit live resize events and leave persistence to the app.

---

N00 Clamping Rules

---

The split value must always respect available space.

For horizontal split:

```js
available = hostRect.width - splitterSize
minValue = minStart
maxValue = available - minEnd
```

For vertical split:

```js
available = hostRect.height - splitterSize
minValue = minStart
maxValue = available - minEnd
```

If `max-start` is provided:

```js
maxValue = Math.min(maxValue, maxStart)
```

If the container is too small to satisfy both minimums, the component should degrade gracefully.

Recommended behavior when space is too small:

Use the smaller feasible max value.

Do not produce negative pane sizes.

Do not throw.

Prefer preserving at least a visible end pane.

Log a warning only if the app's observability layer is connected; framework components should not spam console by default.

Practical clamp helper:

```js
function clampSplitValue(value, { available, minStart, minEnd, maxStart }) {
  const hardMin = Math.max(0, minStart);
  const hardMax = Math.max(0, available - Math.max(0, minEnd));
  const effectiveMax = Number.isFinite(maxStart)
    ? Math.min(hardMax, maxStart)
    : hardMax;

  if (effectiveMax < hardMin) {
    return Math.max(0, Math.min(value, hardMax));
  }

  return Math.min(Math.max(value, hardMin), effectiveMax);
}
```

---

O00 Keyboard Accessibility

---

The splitter should be keyboard focusable.

Recommended markup inside Shadow DOM:

```html
<div
  class="splitter"
  part="splitter"
  role="separator"
  tabindex="0"
  aria-orientation="vertical"
  aria-valuemin="180"
  aria-valuemax="900"
  aria-valuenow="280"
>
  <div class="grip" part="splitter-grip"></div>
</div>
```

ARIA orientation rule:

For a horizontal split with a vertical separator, use `aria-orientation="vertical"`.

For a vertical split with a horizontal separator, use `aria-orientation="horizontal"`.

Keyboard behavior:

ArrowLeft decreases start pane width in horizontal mode.

ArrowRight increases start pane width in horizontal mode.

ArrowUp decreases start pane height in vertical mode.

ArrowDown increases start pane height in vertical mode.

Home sets value to minimum.

End sets value to maximum.

Shift plus arrow uses larger step.

Recommended step sizes:

Normal arrow: 10 px.

Shift arrow: 50 px.

The component should emit resize and resize-commit events after keyboard changes. For keyboard input, each key press can be treated as committed immediately, or the component can emit both resize and commit on each keydown. Immediate commit is acceptable.

---

P00 Accessibility and Semantics

---

The split pane should not make the slotted content inaccessible.

The splitter must be reachable by keyboard.

The splitter must have a label. The app can provide `aria-label` on the component, or the component can default to `Resize panels`.

Recommended attributes:

```html
<awwbookmarklet-split-pane aria-label="Resize page sidebar">
```

The component should mirror this label to the internal separator or support a `separator-label` attribute.

If no label is provided, default to:

```txt
Resize panels
```

The splitter should expose `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`.

The panes themselves do not need special roles by default. Application code can use `nav`, `aside`, `main`, or `section` inside slots.

---

Q00 Controlled vs Uncontrolled Use

---

The component should support simple uncontrolled use: set `value`, user drags, component updates itself.

It should also support controlled-ish use: application listens to events and sets `value` from persisted state later.

The component does not need to implement a strict React-style controlled mode. This is a web component; the simplest model is attribute/property reflection.

Rules:

When the `value` attribute changes externally, update layout.

When user resizes, update internal value, reflect the attribute if practical, and emit events.

Avoid event loops. If setting the same value, do nothing.

---

R00 Persistence Strategy

---

The split pane framework component should not own durable persistence in the first version.

For Topic Research Notepad, the app should persist sidebar width in its existing settings store, likely through the Worker-backed storage layer.

Recommended setting key:

```txt
sidebarWidth
```

Loading flow:

Read `sidebarWidth` from settings.

Render split pane with `value`.

Listen for resize commit.

Persist new width.

This keeps framework reusable and avoids mixing application persistence with generic component behavior.

---

S00 ResizeObserver and Host Size Changes

---

The component must handle parent size changes.

Examples:

Browser window resizes.

Extension window resizes.

Focus mode hides sidebar or commandbar.

App shell changes size.

The component should use `ResizeObserver` on the host or internal container if available. When size changes, re-clamp the current split value.

If `ResizeObserver` is unavailable, it can rely on window resize as fallback.

Do not allow the splitter value to remain larger than the available size after a resize.

---

T00 Collapsed Pane Future Option

---

Collapse is useful but should be treated as an optional future enhancement.

Potential future API:

```html
<awwbookmarklet-split-pane collapsed-start>
```

or:

```html
<awwbookmarklet-split-pane start-collapsed>
```

Potential behavior:

Double-click splitter toggles collapse.

A collapse button appears in splitter grip.

Keyboard shortcut collapses start pane.

Collapsed width may be 0, 32 px, or a configured `collapsed-size`.

For the first version, do not implement collapse unless it is very cheap. Topic Research Notepad can implement sidebar collapse at the app level first.

---

U00 Framework Integration

---

The component should be added to the framework's `TAGS` map if the framework uses one.

Recommended tag entry:

```js
splitPane: "awwbookmarklet-split-pane"
```

The component should be registered through the same `defineOnce` or `defineMany` system used by existing components.

It should use the same styling helpers:

```js
adoptStyles(shadow, [BASE_COMPONENT_STYLES, SPLIT_PANE_STYLES]);
```

It should use existing public tokens and avoid hard-coded app-specific colors.

It should expose parts so app-specific styling can be done without editing the component.

If a command registry or menus are not directly needed for the split pane, do not connect them. This component should stay focused.

---

V00 Suggested Component Skeleton

---

A simplified implementation skeleton:

```js
const SPLIT_PANE_STYLES = css`
  :host {
    display: block;
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
  }

  .container {
    display: grid;
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
  }

  :host([direction="horizontal"]) .container {
    grid-template-columns: var(--_start-size) var(--_splitter-size, 6px) minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr);
  }

  :host([direction="vertical"]) .container {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: var(--_start-size) var(--_splitter-size, 6px) minmax(0, 1fr);
  }

  .pane {
    min-width: 0;
    min-height: 0;
    overflow: auto;
  }

  .splitter {
    background: var(--awwbookmarklet-surface-inset-bg, #dfe4ea);
    border: 0 solid var(--awwbookmarklet-border-subtle, #a8b0ba);
    display: grid;
    place-items: center;
    touch-action: none;
    user-select: none;
  }

  :host([direction="horizontal"]) .splitter {
    cursor: col-resize;
    border-inline-width: 1px;
  }

  :host([direction="vertical"]) .splitter {
    cursor: row-resize;
    border-block-width: 1px;
  }

  .splitter:focus-visible {
    outline: none;
    box-shadow: var(--_ring);
    z-index: 1;
  }

  .grip {
    width: 2px;
    height: 28px;
    background: color-mix(in srgb, var(--awwbookmarklet-border-subtle, #a8b0ba) 70%, transparent);
  }

  :host([direction="vertical"]) .grip {
    width: 28px;
    height: 2px;
  }
`;
```

This skeleton is not a full implementation. It defines the expected structure and styling direction.

---

W00 Boundary Cases and Risks

---

Risk: the parent container has no explicit height.

Mitigation: document that the split pane fills available height and must be placed in a container with a defined size. In the notepad, the app shell/content area should give it height.

Risk: slotted content overflows and forces pane size.

Mitigation: use `min-width: 0`, `min-height: 0`, and `overflow: auto` on pane wrappers.

Risk: user drags beyond viewport.

Mitigation: clamp value based on host size and pane minimums.

Risk: app persists every pointermove.

Mitigation: emit live resize event separately from commit event. Persist only on commit.

Risk: keyboard users cannot resize.

Mitigation: splitter must be focusable with role separator and arrow key support.

Risk: touch devices or pointer capture behave inconsistently.

Mitigation: use pointer events, `touch-action: none`, pointer capture where available, and safe fallback.

Risk: nested split panes conflict.

Mitigation: events should bubble but include clear detail. Nested split panes should each handle pointer capture only from their own splitter.

Risk: Shadow DOM styling is too closed.

Mitigation: expose `part` names and use theme tokens.

Risk: layout jumps when window resizes.

Mitigation: use ResizeObserver and re-clamp.

Risk: the control becomes too application-specific.

Mitigation: keep app persistence, page tree logic, and notepad-specific labels outside the framework component.

---

X00 Topic Research Notepad Integration

---

The notepad layout should use the split pane for the page sidebar and editor.

Recommended structure:

```html
<awwbookmarklet-split-pane
  class="trn-layout"
  direction="horizontal"
  value="280"
  min-start="180"
  min-end="520"
  aria-label="Resize page sidebar"
>
  <aside slot="start" class="trn-sidebar">
    ...
  </aside>

  <main slot="end" class="trn-editor-shell">
    ...
  </main>
</awwbookmarklet-split-pane>
```

The start pane contains the Pages panel and future page tree.

The end pane contains the page title and editor.

When the split pane emits resize commit, the app stores the new width in settings.

When the app starts, it loads the saved width and applies it as `value`.

If the window becomes too narrow, the component clamps the value. The app should not need special sidebar width code for normal cases.

---

Y00 Testing Requirements

---

Add unit tests for pure helpers if the project test environment supports them.

Required helper tests:

Clamp value respects min start and min end.

Clamp value handles container smaller than combined minimums.

Horizontal pointer delta increases/decreases value correctly.

Vertical pointer delta increases/decreases value correctly.

Attribute parsing normalizes invalid values.

Keyboard step calculation works.

Resize commit payload shape is correct.

If web component DOM tests are practical in Bun, test:

Component renders two slots and splitter.

Changing `value` updates CSS variable.

Changing `direction` updates orientation.

Keyboard event changes value.

Pointer resize emits events.

If full DOM tests are impractical, document manual testing.

---

Z00 Manual Verification Checklist

---

* [ ] Render horizontal split pane in Topic Research Notepad.
* [ ] Drag splitter right and confirm Pages panel grows.
* [ ] Drag splitter left and confirm editor grows.
* [ ] Confirm neither pane collapses below minimum width.
* [ ] Reload and confirm saved sidebar width returns.
* [ ] Resize browser window and confirm split value clamps safely.
* [ ] Tab to splitter and resize with keyboard.
* [ ] Confirm focus ring is visible.
* [ ] Confirm screen reader role is separator with orientation and value.
* [ ] Confirm slotted sidebar and editor content scroll correctly.
* [ ] Confirm component uses retro theme tokens.
* [ ] Confirm no app-specific CSS is hardcoded inside framework component.
* [ ] Confirm the component works in vertical direction in a demo or fixture.
* [ ] Confirm nested or adjacent framework components still render correctly.
* [ ] Confirm no new NPM dependency was added.

---

AA00 Documentation Requirements

---

Document the split pane in the framework notes or component documentation.

Documentation should include:

Purpose of the component.

Basic horizontal example.

Basic vertical example.

Attribute table.

Event descriptions.

Accessibility behavior.

Styling parts.

Topic Research Notepad usage example.

Known limitations.

If a framework demo page exists, add a split pane demo showing horizontal and vertical modes.

---

AB00 Acceptance Criteria

---

The change is accepted when:

* [ ] `awwbookmarklet-split-pane` is implemented as a reusable framework web component.
* [ ] It supports horizontal and vertical direction.
* [ ] It supports start and end slots.
* [ ] It supports pointer resize.
* [ ] It supports keyboard resize.
* [ ] It clamps pane sizes using minimum start and minimum end.
* [ ] It emits live resize and resize commit events.
* [ ] It exposes useful Shadow DOM parts.
* [ ] It uses existing retro framework tokens and base styles.
* [ ] It is registered through the framework component registration path.
* [ ] Topic Research Notepad uses it for sidebar/editor layout.
* [ ] Sidebar width can be persisted by the application.
* [ ] It does not introduce a new dependency.
* [ ] It does not introduce an unrelated visual system.
* [ ] It is documented.
* [ ] It has unit tests or documented manual tests for critical behavior.

---

AC00 Implementation Order

---

Codex should implement this in controlled steps.

Step 1: inspect framework structure and registration path.

Step 2: add the split pane tag to framework constants.

Step 3: implement the component with Shadow DOM, styles, slots, attributes, and basic layout.

Step 4: implement value parsing and clamping helpers.

Step 5: implement pointer resizing.

Step 6: implement keyboard resizing and ARIA attributes.

Step 7: emit resize and commit events.

Step 8: add tests for pure helpers and component behavior where possible.

Step 9: integrate into Topic Research Notepad layout.

Step 10: persist sidebar width from app settings.

Step 11: add demo or documentation.

Step 12: manually verify horizontal and vertical behavior.

---

AD00 Final Direction to Codex

---

Codex should treat the split pane as a framework component, not merely an app patch. The current notepad needs it for the Pages sidebar, but the browser extension tool system will likely need the same primitive elsewhere.

The implementation should be small, accessible, theme-driven, and robust. It should solve the real user problem: the user needs to control how much space belongs to navigation versus content, without breaking the retro visual system or adding application-specific layout hacks.
