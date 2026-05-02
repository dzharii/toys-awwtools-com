2026-04-25

A00. Product requirements document: ergonomic theming support for AWW Bookmarklet UI Framework

Date: 2026-04-25

This document defines the product, architecture, implementation requirements, API expectations, migration plan, risk controls, and validation criteria for introducing a more complete theming system into the AWW Bookmarklet UI Framework.

The purpose of this work is to make the framework easier and safer for developers to customize. A downstream bookmarklet or injected browser tool should be able to change its visual identity without forking components, copying internal CSS, or creating a parallel styling system. Developers should be able to make normal theme-level changes such as accent color, surface palette, state colors, focus color, density, spacing, corner radius, button feel, input shape, window chrome, menu density, and panel rhythm through a documented public API.

The theming system must preserve the identity of the project. AWW Bookmarklet UI is not a generic SaaS component kit and should not become one. It is a compact retro-modern desktop-style UI system for constrained browser tools. The visual language should remain square or near-square, dense, explicit, inspectable, keyboard-friendly, and structurally clear. Theming should give each tool controlled local identity while preserving the shared operating-system-like grammar.

The final goal is not simply "make colors configurable." The final goal is to create the most coherent, ergonomic, and durable design for theme support in this project. The correct outcome is a system where developers can theme common visual decisions in a predictable way, where component source code becomes less hard-coded, where built-in defaults remain stable, and where future tools can share one design system instead of reinventing local UI styles.

B00. Implementation authority and refactoring permission

Codex is explicitly authorized to refactor, restructure, rename internal modules, rewrite component CSS, adjust public helper placement, and reorganize implementation details where doing so improves the quality of the theme system. This project is experimental and is not yet used in production. The cost of temporary breakage is acceptable if the final implementation is cleaner, more coherent, easier to maintain, and easier to extend.

Codex should not treat the current file structure as a constraint when it conflicts with the desired design. The current architecture is a strong foundation, but it is not sacred. If the best solution requires moving theme helpers into a new module, splitting the theme service, changing how theme presets are exported, adding internal utilities for token copying, or rewriting high-impact component styles, Codex should do so.

This permission does not mean that Codex should rewrite randomly. The rewrite authority exists to support a higher-quality implementation. Codex should preserve the public project identity, preserve the custom-element and Shadow DOM architecture unless there is a strong reason not to, preserve the `awwbookmarklet-` namespace, preserve readable source organization, and preserve the distribution goal of a copyable bundled runtime. When Codex encounters inconsistencies between this document, older specifications, and the current source code, Codex should use its best engineering judgment and choose the path that produces the most coherent theme system.

C00. Current project context

The AWW Bookmarklet UI Framework is a browser-first web component library for bookmarklets, injected page helpers, extension-like tools, and constrained browser workbench interfaces. The framework already provides a desktop root, floating windows, title bars, menus, buttons, form controls, panels, groups, status bars, alerts, dialogs, toasts, tabs, lists, listboxes, rich previews, browser panels, command palettes, URL pickers, shortcut help, manual copy flows, theme tokens, runtime ownership, geometry helpers, and a demo catalog.

The current source code already has several theming foundations. `src/core/constants.js` defines `PUBLIC_TOKENS`. `src/themes/default-theme.js` maps those tokens to default values. `src/core/theme.js` defines `ThemeService`. `src/bookmarklet/index.js` exports `setTheme()`, `ThemeService`, `defaultThemeService`, `PUBLIC_TOKENS`, and `DEFAULT_THEME`. Most components use Shadow DOM and consume CSS custom properties from their host context. `src/core/styles.js` provides `css`, `adoptStyles()`, and `BASE_COMPONENT_STYLES`.

This means theming is already present, but the theming surface is incomplete. The current system handles colors fairly well. It handles basic spacing and control height in some places. It does not yet handle shape, radius, density, button anatomy, input anatomy, menu anatomy, window chrome anatomy, or theme-safe component structure in a systematic way.

D00. Product problem

The current theme API suggests that the framework is token-driven, but many components still hard-code important visual decisions inside their Shadow DOM styles. This creates a mismatch between what the public API appears to promise and what a developer can actually control.

For example, a developer can change `selectionBg`, `windowBg`, or `focusRing` today, but cannot consistently change corner radius, button padding, input padding, icon size, menu item height, titlebar gap, panel padding, or window body padding through a public token. The result is that simple color themes are easy, while slightly more complete identity themes require unreliable workarounds.

The likely workarounds are bad for this project. Developers may use `::part` overrides too early. They may add inline styles. They may duplicate components. They may fork component CSS. They may create app-local wrapper classes that slowly become a second design system. These outcomes directly conflict with the purpose of the AWW Bookmarklet UI Framework.

The theming system must therefore move from "color token patching" to "layered design tokens plus semantic component modes." The framework should expose the right design decisions, not every implementation detail.

E00. Product value

The value of this work is developer ergonomics and design coherence.

A downstream developer should be able to create a tool-specific theme by writing a small plain object. The theme should be readable, diffable, serializable, and easy to copy between tools. It should not require learning internal component DOM. It should not require inspecting every Shadow DOM tree. It should not require changing global page CSS. It should not require building a custom CSS framework.

The user-facing value is that tools can share the same desktop-like UI grammar while still having distinct identities. A bookmark manager may use one accent. A screenshot tool may use another. A markdown converter may use a calmer reading palette. A high-contrast utility may increase focus and border strength. These tools should still feel like members of the same family.

The engineering value is that repeated styling decisions move into the shared framework. Themes become composable. Component CSS becomes more consistent. Visual QA becomes easier because theme variation is expressed through known tokens and modes.

F00. Final architecture decision

The project shall keep CSS custom properties and public design tokens as the primary theming mechanism.

The project shall expand `PUBLIC_TOKENS` from a mostly color-oriented token set into a layered design-token system. The token system shall include semantic color tokens, global geometry tokens, component anatomy tokens, state tokens, and a small number of elevation and shadow tokens. The default theme shall preserve the current visual identity unless this document explicitly calls for an improvement.

The project shall use semantic attributes for component modes where the decision is better expressed as a named behavior or visual role. Examples include `variant`, `tone`, `density`, `orientation`, `align`, `selected`, `busy`, `pressed`, `disabled`, and `compact`.

The project shall document `::part` as an escape hatch, not as the primary theming system.

The project shall support root-level themes and window-scoped themes. Root-level themes are appropriate when a whole tool suite shares one look. Window-scoped themes are the preferred model for individual bookmarklet tools that share a desktop root but need local identity.

The project shall not create multiple desktop roots solely for different themes at this stage. Multiple roots introduce too much lifecycle, z-index, owner, and overlay complexity. They should be reserved for future isolation problems that cannot be solved with scoped CSS variables.

G00. Non-goals

This work does not require replacing the web component architecture. It does not require adopting React, Vue, Lit templates, CSS-in-JS, a virtual DOM, or an external theming library. It does not require building a theme editor. It does not require supporting arbitrary visual skins that abandon the retro-modern desktop identity. It does not require exposing every CSS property as a public token.

This work also does not require finalizing a large catalog of built-in themes immediately. Built-in presets may be added after the token surface is stable, but the first priority is the public theme architecture and component refactor.

H00. Design principles

The theming system shall expose design intent rather than raw implementation accidents. A good token describes a reusable decision. A bad token exposes a one-off internal value that users should not depend on.

For example, `--awwbookmarklet-radius-control` is a good token because control radius is a repeated design decision. `--awwbookmarklet-button-border-top-left-radius` would be a bad token because it exposes an overly specific implementation detail. `--awwbookmarklet-control-padding-x` is a good token because horizontal control padding is a repeated system-level value. `--awwbookmarklet-input-left-padding` and `--awwbookmarklet-button-right-padding` would be less desirable unless there is a proven need for separate values.

The framework shall prefer fewer meaningful tokens over many fragile tokens. Every public token is a compatibility promise. Codex should add tokens only when they are repeated, meaningful, likely to be customized, and stable enough to document.

The default theme shall continue to express the project identity. Theme support is not permission to make the default UI softer, rounder, more spacious, more decorative, or more SaaS-like. The default should remain compact, square, bordered, and utility-oriented.

I00. Required token architecture

The token architecture shall be organized conceptually into five layers. The implementation does not need to create five physical files if that creates unnecessary complexity, but the source organization should make these categories clear.

The first layer is semantic color tokens. These tokens describe meaning and surface role. This includes workspace background, window background, panel background, app shell background, raised surface, inset surface, input background, menu background, titlebar active and inactive backgrounds, foreground text, muted text, help text, borders, dividers, selection, focus, and state tones.

The second layer is global geometry tokens. These tokens describe system-wide physical rules. This includes control radius, surface radius, window radius, border widths, control height, titlebar height, icon size, spacing scale, focus ring size, and general density rhythm.

The third layer is component anatomy tokens. These tokens map global decisions to specific component structures. This includes button padding, button minimum width, button shadow, input padding, window body padding, titlebar padding, titlebar gap, panel padding, card padding, group padding, menu item height, menu item padding, and menu item gap.

The fourth layer is semantic attributes. These are not tokens. They are component-level modes such as `variant="primary"`, `tone="danger"`, `density="compact"`, or `orientation="vertical"`. They should be normalized through existing or expanded helper functions.

The fifth layer is escape hatches. This includes `::part` and direct target styling. These must be documented but discouraged for normal theme work.

J00. Public token expansion

Codex shall expand `PUBLIC_TOKENS` with a compact first set of geometry and anatomy tokens. The exact names may be refined if Codex identifies a better naming scheme, but the final scheme must be consistent, readable, and documented.

The following token names are recommended as the first implementation set:

```js
export const PUBLIC_TOKENS = {
  // Existing tokens remain.

  radiusControl: "--awwbookmarklet-radius-control",
  radiusSurface: "--awwbookmarklet-radius-surface",
  radiusWindow: "--awwbookmarklet-radius-window",

  borderWidthControl: "--awwbookmarklet-border-width-control",
  borderWidthSurface: "--awwbookmarklet-border-width-surface",

  focusRingWidth: "--awwbookmarklet-focus-ring-width",

  controlPaddingX: "--awwbookmarklet-control-padding-x",
  controlPaddingY: "--awwbookmarklet-control-padding-y",
  controlMinWidth: "--awwbookmarklet-control-min-width",
  controlIconSize: "--awwbookmarklet-control-icon-size",

  inputPaddingX: "--awwbookmarklet-input-padding-x",
  inputPaddingY: "--awwbookmarklet-input-padding-y",

  buttonPaddingX: "--awwbookmarklet-button-padding-x",
  buttonPaddingY: "--awwbookmarklet-button-padding-y",
  buttonMinWidth: "--awwbookmarklet-button-min-width",
  buttonShadow: "--awwbookmarklet-button-shadow",
  buttonActiveShadow: "--awwbookmarklet-button-active-shadow",

  windowBodyPadding: "--awwbookmarklet-window-body-padding",
  titlebarPaddingX: "--awwbookmarklet-titlebar-padding-x",
  titlebarGap: "--awwbookmarklet-titlebar-gap",

  surfacePadding: "--awwbookmarklet-surface-padding",
  surfaceGap: "--awwbookmarklet-surface-gap",

  panelPadding: "--awwbookmarklet-panel-padding",
  cardPadding: "--awwbookmarklet-card-padding",
  groupPadding: "--awwbookmarklet-group-padding",

  menuPadding: "--awwbookmarklet-menu-padding",
  menuItemHeight: "--awwbookmarklet-menu-item-height",
  menuItemPaddingX: "--awwbookmarklet-menu-item-padding-x",
  menuItemGap: "--awwbookmarklet-menu-item-gap",

  controlInsetShadow: "--awwbookmarklet-control-inset-shadow"
};
```

Codex may decide to remove redundant entries if implementation shows that some are unnecessary. For example, if `buttonPaddingX` and `controlPaddingX` always resolve to the same value, Codex may keep both only if the component mapping benefit is clear. The guiding principle is practical ergonomics, not token count.

K00. Default values for new tokens

The default theme shall include values for every public token. A test must verify this.

The first default values should preserve the current look:

```js
export const DEFAULT_THEME = {
  // Existing defaults remain.

  [PUBLIC_TOKENS.radiusControl]: "0",
  [PUBLIC_TOKENS.radiusSurface]: "0",
  [PUBLIC_TOKENS.radiusWindow]: "0",

  [PUBLIC_TOKENS.borderWidthControl]: "1px",
  [PUBLIC_TOKENS.borderWidthSurface]: "1px",

  [PUBLIC_TOKENS.focusRingWidth]: "2px",

  [PUBLIC_TOKENS.controlPaddingX]: "12px",
  [PUBLIC_TOKENS.controlPaddingY]: "0",
  [PUBLIC_TOKENS.controlMinWidth]: "72px",
  [PUBLIC_TOKENS.controlIconSize]: "16px",

  [PUBLIC_TOKENS.inputPaddingX]: "8px",
  [PUBLIC_TOKENS.inputPaddingY]: "0",

  [PUBLIC_TOKENS.buttonPaddingX]: "12px",
  [PUBLIC_TOKENS.buttonPaddingY]: "0",
  [PUBLIC_TOKENS.buttonMinWidth]: "72px",

  [PUBLIC_TOKENS.windowBodyPadding]: "12px",
  [PUBLIC_TOKENS.titlebarPaddingX]: "6px",
  [PUBLIC_TOKENS.titlebarGap]: "6px",

  [PUBLIC_TOKENS.surfacePadding]: "8px",
  [PUBLIC_TOKENS.surfaceGap]: "8px",

  [PUBLIC_TOKENS.panelPadding]: "8px",
  [PUBLIC_TOKENS.cardPadding]: "8px",
  [PUBLIC_TOKENS.groupPadding]: "10px",

  [PUBLIC_TOKENS.menuPadding]: "4px",
  [PUBLIC_TOKENS.menuItemHeight]: "29px",
  [PUBLIC_TOKENS.menuItemPaddingX]: "8px",
  [PUBLIC_TOKENS.menuItemGap]: "16px",

  [PUBLIC_TOKENS.buttonShadow]: "inset 1px 1px 0 #ffffff, inset -1px -1px 0 var(--awwbookmarklet-border-subtle, #9ba5b3)",
  [PUBLIC_TOKENS.buttonActiveShadow]: "inset 1px 1px 0 rgba(0, 0, 0, 0.18)",
  [PUBLIC_TOKENS.controlInsetShadow]: "inset 1px 1px 0 #aab2bd, inset -1px -1px 0 #ffffff"
};
```

Codex may adjust exact default values when necessary to match the current rendered UI. The important rule is that the default theme should not visually regress. The default should still look like the current retro-modern workstation UI unless an intentional improvement is made.

L00. Theme service requirements

`ThemeService` shall remain a small and predictable abstraction. It should continue to accept plain objects keyed by CSS custom property names. Themes should remain simple JavaScript objects.

The service shall merge patches into its current theme. It shall be able to apply a theme to any target element. It shall not require an active desktop root when an explicit target is provided. It shall not mutate a passed theme object. It shall not remove existing target styles unless the API explicitly supports removal later.

The service may gain validation helpers if useful. If validation is added, it should be non-disruptive by default. For example, unknown token warnings may be useful in development, but production bookmarklet usage should not throw just because a downstream theme includes an unknown CSS variable. Bookmarklets often run in constrained environments, and the theming API should fail softly.

A possible helper is:

```js
export function createTheme(baseTheme = DEFAULT_THEME, patch = {}) {
  return {
    ...baseTheme,
    ...patch
  };
}
```

This helper is optional for the first implementation. Object spread already works. Codex should add it only if it improves clarity in docs, tests, or presets.

M00. Public API requirements

The existing API must remain valid:

```js
setTheme(themePatch);
```

This applies the patch to the default theme service and applies the merged theme to the active desktop root when one exists.

The explicit target form must become documented and tested:

```js
setTheme(themePatch, targetElement);
```

This applies the theme to the provided target. This is the foundation for window-scoped themes.

Codex should add theme support to `mountWindow()`:

```js
mountWindow(win, {
  ownerPrefix: "reader-tool",
  theme: readerTheme
});
```

When `theme` is provided, `mountWindow()` shall apply the theme to the window element, not to the shared desktop root. This makes per-tool themes possible without causing the last mounted tool to override every other tool.

Codex should consider adding the same option to `openBookmarkletWindow()`:

```js
openBookmarkletWindow(builder, {
  ownerPrefix: "reader-tool",
  theme: readerTheme
});
```

If both functions support window-level themes, downstream usage becomes consistent.

The API behavior should be explicit. A root-level `setTheme()` is for global suite styling. A `theme` option on `mountWindow()` is for local tool styling. `setTheme(theme, win)` is the lower-level manual form.

N00. Theme object shape

Themes shall remain plain objects keyed by CSS custom property names.

This is the preferred shape:

```js
const readerTheme = {
  [PUBLIC_TOKENS.selectionBg]: "#6b4db6",
  [PUBLIC_TOKENS.focusRing]: "#8d5cc2",
  [PUBLIC_TOKENS.radiusControl]: "3px",
  [PUBLIC_TOKENS.windowBg]: "#f3f1f8"
};
```

The project shall not introduce nested theme objects in the first implementation:

```js
const notRecommendedYet = {
  color: {
    selection: "#6b4db6"
  },
  radius: {
    control: "3px"
  }
};
```

Nested objects may look cleaner, but they require translation rules, validation rules, merge semantics, partial removal semantics, and new documentation. CSS-variable-keyed objects are more direct and are better suited to this project's current architecture.

O00. Window-scoped theming

Window-scoped theming is the preferred model for individual tools.

A developer should be able to create and mount a themed window like this:

```js
import {
  createWindow,
  mountWindow,
  PUBLIC_TOKENS
} from "./dist/bookmarklet/index.js";

const theme = {
  [PUBLIC_TOKENS.selectionBg]: "#7057c2",
  [PUBLIC_TOKENS.focusRing]: "#8f6ee8",
  [PUBLIC_TOKENS.windowBg]: "#f4f2f8",
  [PUBLIC_TOKENS.panelBg]: "#faf9fc",
  [PUBLIC_TOKENS.radiusControl]: "3px"
};

const win = createWindow({
  title: "Bookmark Cleaner",
  content: document.createTextNode("Tool content")
});

mountWindow(win, {
  ownerPrefix: "bookmark-cleaner",
  theme
});
```

The expected result is that the window and its descendant components inherit the theme. The shared desktop root should not change. Other open windows should not change. The active desktop root should continue to manage z-index, ownership, and cleanup normally.

P00. Root-scoped theming

Root-scoped theming remains useful for a suite of tools that intentionally share one visual identity.

Example:

```js
setTheme({
  [PUBLIC_TOKENS.selectionBg]: "#2f6f4e",
  [PUBLIC_TOKENS.focusRing]: "#1f7a4a",
  [PUBLIC_TOKENS.windowBg]: "#f1f5f2",
  [PUBLIC_TOKENS.panelBg]: "#fbfdfb"
});
```

This should apply to the active desktop root and affect all components that inherit from that root, unless a window or descendant overrides specific tokens locally.

Root-scoped theming should not be the recommended path for independent tools sharing one root. It is global by design.

Q00. Component refactor requirements

Codex shall refactor high-impact component styles to consume the expanded token set. The first components to update are `button.js`, `icon-button.js`, `input.js`, `select.js`, `textarea.js`, `window.js`, `menu.js`, `panel.js`, `card.js`, `group.js`, `tabs.js`, `toolbar.js`, `dialog.js`, `toast.js`, `alert.js`, `field.js`, and `browser-panel.js`.

The components should not hard-code basic radius, padding, min-width, icon size, menu height, or surface gap values when a public token exists for that decision.

For example, `button.js` should move from fixed values like this:

```css
button {
  min-width: 72px;
  border-radius: 0;
  padding: 0 12px;
}
```

to tokenized values like this:

```css
button {
  min-height: var(--awwbookmarklet-size-control-h, 30px);
  min-width: var(--awwbookmarklet-button-min-width, var(--awwbookmarklet-control-min-width, 72px));
  border-width: var(--awwbookmarklet-border-width-control, 1px);
  border-style: solid;
  border-color: var(--awwbookmarklet-border-strong, #232a33);
  border-radius: var(--awwbookmarklet-radius-control, 0);
  padding-block: var(--awwbookmarklet-button-padding-y, var(--awwbookmarklet-control-padding-y, 0));
  padding-inline: var(--awwbookmarklet-button-padding-x, var(--awwbookmarklet-control-padding-x, 12px));
  box-shadow: var(--awwbookmarklet-button-shadow, inset 1px 1px 0 #ffffff, inset -1px -1px 0 var(--awwbookmarklet-border-subtle, #9ba5b3));
}
```

Inputs should follow a similar pattern:

```css
input {
  min-height: var(--awwbookmarklet-size-control-h, 30px);
  border-width: var(--awwbookmarklet-border-width-control, 1px);
  border-style: solid;
  border-color: var(--awwbookmarklet-border-strong, #232a33);
  border-radius: var(--awwbookmarklet-radius-control, 0);
  padding-block: var(--awwbookmarklet-input-padding-y, var(--awwbookmarklet-control-padding-y, 0));
  padding-inline: var(--awwbookmarklet-input-padding-x, 8px);
  box-shadow: var(--awwbookmarklet-control-inset-shadow, inset 1px 1px 0 #aab2bd, inset -1px -1px 0 #ffffff);
}
```

Window body padding should become tokenized:

```css
.body {
  padding: var(--awwbookmarklet-window-body-padding, var(--awwbookmarklet-space-3, 12px));
}
```

Titlebar spacing should become tokenized:

```css
.titlebar {
  gap: var(--awwbookmarklet-titlebar-gap, 6px);
  padding-inline: var(--awwbookmarklet-titlebar-padding-x, 6px);
}
```

Menu anatomy should become tokenized:

```css
:host {
  padding: var(--awwbookmarklet-menu-padding, 4px);
}

::slotted(button),
::slotted([role="menuitem"]) {
  height: var(--awwbookmarklet-menu-item-height, 29px);
  padding-inline: var(--awwbookmarklet-menu-item-padding-x, 8px);
  gap: var(--awwbookmarklet-menu-item-gap, 16px);
}
```

R00. Token fallbacks

Every component must provide fallbacks when using public tokens. This matters because downstream users may use older theme objects, partial theme patches, or manual CSS variables.

A correct pattern is:

```css
border-radius: var(--awwbookmarklet-radius-control, 0);
```

A better pattern for component-specific mappings is:

```css
padding-inline: var(--awwbookmarklet-button-padding-x, var(--awwbookmarklet-control-padding-x, 12px));
```

This lets a button-specific token override a control-wide token, while still preserving a stable fallback.

Codex should avoid token chains that are too deep or hard to reason about. Two levels are usually enough: component token, then global token, then literal fallback.

S00. Semantic attributes

Tokens should control values. Attributes should control modes.

Existing patterns such as `variant`, `tone`, `density`, `orientation`, `align`, `busy`, and `pressed` should be kept and extended only where they improve API clarity.

A button using `variant="primary"` is clearer than requiring a developer to manually set all primary button tokens on that one element. An alert using `tone="warning"` is clearer than requiring a warning background, foreground, and border on each instance. A toolbar using `density="compact"` is clearer than setting inline gaps per toolbar.

Codex should not add a large number of new attributes without a strong reason. In particular, a broad attribute such as `chrome="classic|soft|flat"` should be avoided unless the design is very clearly defined and tested. A broad attribute can become a vague second theme system.

A possible future `shape` attribute should be treated carefully. `shape="square|rounded|pill"` may be useful for button-like controls, but it could also fragment the system. The first implementation should prefer radius tokens over shape attributes.

T00. Density support

The current framework has partial density support through spacing tokens and `toolbar` density. This should become more coherent.

A compact theme should be able to reduce control height, spacing, menu item height, window body padding, panel padding, card padding, and titlebar height without breaking layout.

Example compact theme:

```js
const compactTheme = {
  [PUBLIC_TOKENS.space1]: "3px",
  [PUBLIC_TOKENS.space2]: "6px",
  [PUBLIC_TOKENS.space3]: "8px",
  [PUBLIC_TOKENS.controlHeight]: "26px",
  [PUBLIC_TOKENS.titleHeight]: "28px",
  [PUBLIC_TOKENS.controlPaddingX]: "8px",
  [PUBLIC_TOKENS.buttonPaddingX]: "8px",
  [PUBLIC_TOKENS.inputPaddingX]: "6px",
  [PUBLIC_TOKENS.windowBodyPadding]: "8px",
  [PUBLIC_TOKENS.panelPadding]: "6px",
  [PUBLIC_TOKENS.cardPadding]: "6px",
  [PUBLIC_TOKENS.menuItemHeight]: "26px"
};
```

The compact theme must not cause text clipping, focus ring clipping, titlebar overlap, menu item unreadability, or unusable hit targets. Compact means denser, not broken.

U00. Rounded theme support

The default theme remains square. However, the framework should support a mildly rounded theme through tokens.

Example:

```js
const roundedTheme = {
  [PUBLIC_TOKENS.radiusControl]: "4px",
  [PUBLIC_TOKENS.radiusSurface]: "6px",
  [PUBLIC_TOKENS.radiusWindow]: "8px",
  [PUBLIC_TOKENS.buttonShadow]: "none",
  [PUBLIC_TOKENS.buttonActiveShadow]: "inset 0 1px 2px rgba(0, 0, 0, 0.22)"
};
```

This should make controls and windows slightly rounder without changing component structure. It should not require replacing components. It should not produce modern pill-card SaaS styling unless a downstream developer deliberately sets extreme values. Documentation should describe mild rounding as supported, while warning that highly rounded themes may move away from the intended system identity.

V00. Accent theme support

Accent-only theming should remain the simplest and most common use case.

Example:

```js
const greenAccentTheme = {
  [PUBLIC_TOKENS.selectionBg]: "#2f6f4e",
  [PUBLIC_TOKENS.selectionFg]: "#f4fff8",
  [PUBLIC_TOKENS.focusRing]: "#1f7a4a",
  [PUBLIC_TOKENS.titlebarActiveBg]: "#d8e6dc",
  [PUBLIC_TOKENS.infoFg]: "#255c71",
  [PUBLIC_TOKENS.successFg]: "#256b3d"
};
```

This should update selected rows, primary buttons, focus rings, selected tabs, progress accents, and other accent-driven surfaces where appropriate. Codex should verify that color-only themes still work after geometry token changes.

W00. High contrast theme support

The system should support a high contrast utility theme without requiring a separate component implementation.

Example:

```js
const highContrastTheme = {
  [PUBLIC_TOKENS.windowBg]: "#ffffff",
  [PUBLIC_TOKENS.panelBg]: "#ffffff",
  [PUBLIC_TOKENS.surfaceRaisedBg]: "#ffffff",
  [PUBLIC_TOKENS.surfaceInsetBg]: "#f0f0f0",
  [PUBLIC_TOKENS.inputFg]: "#000000",
  [PUBLIC_TOKENS.textMuted]: "#222222",
  [PUBLIC_TOKENS.borderStrong]: "#000000",
  [PUBLIC_TOKENS.borderSubtle]: "#444444",
  [PUBLIC_TOKENS.dividerColor]: "#333333",
  [PUBLIC_TOKENS.selectionBg]: "#003b8e",
  [PUBLIC_TOKENS.selectionFg]: "#ffffff",
  [PUBLIC_TOKENS.focusRing]: "#ffbf00",
  [PUBLIC_TOKENS.focusRingWidth]: "3px"
};
```

High contrast should preserve visible focus states, readable disabled states, clear selection, and state-tone legibility. The implementation should avoid relying on color alone; components should continue to include labels, borders, icons, or structural cues for important states.

X00. Portal and overlay theming

Portaled UI is the main technical risk.

Menus, dialogs, toasts, overlays, command palettes, and future dropdowns may be moved to an overlay layer under the desktop root. If a window has a local theme and a menu is portaled outside that window, the menu may stop inheriting the window's variables. This can cause inconsistent appearance, color flicker, or incorrect density.

Codex must explicitly handle this risk.

The first acceptable implementation is to copy the relevant public token values from the originating themed context to the portaled element before or during portal movement. For example, when a menu is opened from a trigger inside a themed window, the menu can copy computed values for all `PUBLIC_TOKENS` from the closest themed host or from the trigger's composed tree context onto the menu element.

A possible helper could be:

```js
export function copyThemeContext(source, target, tokens = PUBLIC_TOKENS) {
  if (!source || !target) return;
  const styles = getComputedStyle(source);
  for (const token of Object.values(tokens)) {
    const value = styles.getPropertyValue(token);
    if (value) target.style.setProperty(token, value.trim());
  }
}
```

This helper should be used carefully. It should copy only public token values, not every computed style. Copying all styles would be too broad and fragile.

A more advanced future implementation could portal into a window-owned overlay layer. Codex may choose that path if it is cleaner, but it must not introduce unnecessary root duplication or lifecycle complexity.

Y00. Avoiding theme flicker

Theme application must avoid visible flicker as much as practical.

When a window is mounted with a `theme` option, the theme should be applied before the window is appended to the visible desktop root. If the theme is applied after append, users may see a flash of the default theme followed by the local theme.

The correct order is:

```js
export function mountWindow(win, { ownerPrefix = "bookmarklet-tool", rect = null, theme = null } = {}) {
  registerAllComponents();

  if (theme) {
    defaultThemeService.applyThemePatchToTarget?.(theme, win);
    // Or call a small helper that sets CSS variables directly on win.
  }

  const owner = nextOwner(ownerPrefix);
  const record = acquireDesktopRoot(owner);

  if (rect && typeof win.setRect === "function") win.setRect(rect);

  record.root.append(win);

  // Release wiring remains.
}
```

Codex does not need to implement this exact helper shape. The requirement is that local theme variables are set before first paint whenever the API has enough information to do so.

Z00. Avoiding layout breakage

Theme tokens that affect size must not break geometry management.

Changing `controlHeight`, `titleHeight`, padding, radius, or menu item height should not cause windows to spawn offscreen, titlebars to become ungrabbable, resize handles to become unreachable, or menus to calculate incorrect size. Codex should test compact and rounded themes with window drag, resize, menu open, dialog open, and tab navigation.

Window geometry should still use viewport clamping. Resizing and dragging must remain frame-coalesced. Theme changes must not introduce measurement loops or continuous layout polling.

AA00. Performance requirements

The theme system must not introduce recurring idle work. Applying a theme is an event-driven operation. Components should not poll theme values. Components should not watch every CSS variable. Components should not run animation loops to maintain theme state.

Applying a theme patch is allowed to write CSS custom properties to a root, window, or component host. This is bounded work. Theme application should usually happen at mount time or explicit user action time.

If Codex adds validation or token copying, it must remain bounded. Copying public token values to a portaled menu at open time is acceptable. Continuously syncing token values on every frame is not acceptable.

AB00. Accessibility requirements

Theming must not reduce accessibility.

Focus states must remain visible across default, accent, compact, rounded, and high contrast themes. Components using `:focus-visible` should continue to use the focus ring token. If `focusRingWidth` is added, the base focus ring should incorporate it.

A recommended base style is:

```css
:host {
  --_ring: 0 0 0 var(--awwbookmarklet-focus-ring-width, 2px) var(--awwbookmarklet-focus-ring, #154fbc);
}
```

Color-coded states must continue to include non-color cues such as text, icon, border, title, role, or layout. Warning, danger, success, info, and neutral states must remain understandable if color perception is limited.

Compact themes must not reduce text below readable levels unless the developer explicitly overrides typography. Controls must remain keyboard reachable. Disabled states must remain distinguishable but not unreadable.

AC00. CSS architecture requirements

Component CSS should continue to use `adoptStyles()` and `BASE_COMPONENT_STYLES`. Codex may improve `BASE_COMPONENT_STYLES` to expose better internal base variables, but it should not move component styling into global page CSS.

The base stylesheet should define common private aliases when useful. For example:

```css
:host {
  --_ring: 0 0 0 var(--awwbookmarklet-focus-ring-width, 2px) var(--awwbookmarklet-focus-ring, #154fbc);
  --_control-radius: var(--awwbookmarklet-radius-control, 0);
  --_surface-radius: var(--awwbookmarklet-radius-surface, 0);
}
```

Private aliases must remain private implementation details. Public customization should use `PUBLIC_TOKENS`, not private `--_` variables.

AD00. Public documentation requirements

Codex shall update the distribution README and any relevant source README so developers understand the theming model.

The documentation must explain root-level theme patches:

```js
setTheme({
  [PUBLIC_TOKENS.selectionBg]: "#175a9c"
});
```

It must explain window-scoped theme patches:

```js
const win = createWindow({ title: "Reader Tool", content });
setTheme(readerTheme, win);
mountWindow(win);
```

If `mountWindow({ theme })` is implemented, that should become the preferred example:

```js
mountWindow(win, {
  ownerPrefix: "reader-tool",
  theme: readerTheme
});
```

The documentation must explain that public tokens are the primary API, attributes are for semantic modes, and `::part` is an escape hatch.

The documentation must include examples for accent-only, compact, rounded, and high contrast themes.

AE00. Demo catalog requirements

The catalog should demonstrate theming as a product feature. The catalog does not need a full theme editor, but it should include realistic examples of theme application.

Codex should add a theme demonstration area or a theme tab section if that fits the current catalog structure. The demonstration should show at least the default theme, an accent theme, a compact theme, a rounded theme, and a high contrast theme. The demo should show the same set of components under different themes so developers can see which tokens matter.

The demo should avoid proving theming only through page-level CSS. It should use the actual framework tokens and components. The catalog page itself may retain its own CSS, but framework theming must be demonstrated through `setTheme()`, target-scoped variables, `mountWindow({ theme })`, or real component hosts.

AF00. Built-in theme presets

Built-in theme presets are optional for the first implementation. If Codex adds them, it should keep the set small.

The recommended built-in presets are `default`, `compact`, `rounded`, and `highContrast`.

A possible export shape is:

```js
export const THEMES = {
  default: DEFAULT_THEME,
  compact: COMPACT_THEME,
  rounded: ROUNDED_THEME,
  highContrast: HIGH_CONTRAST_THEME
};
```

However, Codex should not add presets if the token system is not yet strong enough to make them meaningful. A docs-only recipe is better than a weak built-in preset.

If presets are added, they must be exported from `src/bookmarklet/index.js` and included in distribution tests.

AG00. Handling obsolete or ineffective tokens

Codex must audit existing public tokens and identify tokens that are not meaningfully wired into component CSS.

The known suspicious token is `frostOpacity`. If it remains public, it must control visible behavior somewhere meaningful. If the project no longer needs it, Codex should remove or deprecate it before the token API becomes more stable.

A public token that does nothing reduces developer trust. Codex should not keep decorative or aspirational tokens unless they are actually used.

AH00. Refactor of inline demo styles

The example tool currently uses inline layout styles for several toolbar, body, grid, and group structures. This is acceptable for a prototype, but it is not ideal for proving theming ergonomics.

Codex should gradually move demo composition toward public components and theme-aware layout primitives. This does not need to block the initial theme token work, but it should be treated as a follow-up quality target.

The demo should eventually prove that a tool can be assembled from `awwbookmarklet-app-shell`, `awwbookmarklet-toolbar`, `awwbookmarklet-field`, `awwbookmarklet-panel`, `awwbookmarklet-card`, `awwbookmarklet-status-line`, and other public components without relying on large inline style blocks.

AI00. Component-specific requirements: button and icon button

`awwbookmarklet-button` and `awwbookmarklet-icon-button` are theme-critical. They define much of the system feel.

Both components shall use radius, border width, padding, icon size, shadow, active shadow, focus ring width, control height, and color tokens. `variant="primary"`, `variant="ghost"`, `variant="link"`, `tone`, `busy`, and `pressed` behavior must continue to work.

`icon-button` should use `controlIconSize` for slotted SVG sizing:

```css
::slotted(svg) {
  width: var(--awwbookmarklet-control-icon-size, 16px);
  height: var(--awwbookmarklet-control-icon-size, 16px);
}
```

The default icon button should remain square unless a theme explicitly changes control radius.

AJ00. Component-specific requirements: inputs and form controls

`awwbookmarklet-input`, `awwbookmarklet-textarea`, `awwbookmarklet-select`, `awwbookmarklet-checkbox`, `awwbookmarklet-radio`, `awwbookmarklet-range`, and `awwbookmarklet-progress` should use the expanded tokens where relevant.

Text inputs, selects, and textareas should consume radius, border width, padding, control height, input background, input foreground, and control inset shadow. Checkbox and radio controls may keep their basic sizes if Codex decides those are accessibility-sensitive, but their border, accent, and focus behavior should remain token-driven where possible.

Progress should continue to use accent color. If height is made tokenized, ensure it remains readable and does not become too thin in compact themes.

AK00. Component-specific requirements: window

`awwbookmarklet-window` is the most important component for theme perception.

The window host shall use `radiusWindow`, `borderWidthSurface`, `windowBg`, and `shadowDepth`. The titlebar shall use `titleHeight`, `titlebarPaddingX`, `titlebarGap`, titlebar color tokens, and focus ring tokens. The body shall use `windowBodyPadding`.

Codex should be careful not to break drag and resize behavior while changing styles. Resize handles can remain internal fixed hit areas. They do not need to be tokenized unless there is a clear reason.

Window titlebar button styling should use button or control tokens where possible. If the system menu button and close button need distinct tokens later, Codex may add them, but should avoid over-tokenizing in the first pass.

AL00. Component-specific requirements: menu and menubar

Menus are theme-sensitive because they are often portaled. Menu padding, item height, item padding, item gap, selected background, selected foreground, border, menu background, menu foreground, and shadow should be token-driven.

Menubar trigger height, padding, hover, and open state should use control and surface tokens where possible. Menubar layout should remain compact and keyboard navigable.

When a menu is portaled, it must preserve or copy the correct theme context if it originated from a themed window.

AM00. Component-specific requirements: panels, cards, groups, app shell

Panels, cards, groups, app shell, metric cards, browser panels, rich previews, empty states, and status surfaces define application-level composition. These should use `surfacePadding`, `surfaceGap`, `radiusSurface`, `borderWidthSurface`, and relevant color tokens.

Component-specific padding tokens such as `panelPadding`, `cardPadding`, and `groupPadding` should be used where the components need different defaults.

The purpose is to make compact and rounded themes visually coherent across composed application surfaces.

AN00. Component-specific requirements: dialogs, toasts, overlays

Dialogs, toasts, and overlays should consume surface radius, border width, overlay shadow, overlay backdrop, surface padding, and state color tokens. They must preserve focus behavior, keyboard behavior, and role behavior.

The dialog portal behavior must be checked against window-scoped themes. If a dialog is declared inside a themed window and then portaled, it should not visually revert to the root default theme.

Toasts should also preserve theme context where practical. If a toast is triggered from a window-scoped theme, the API may eventually accept a source or target. Codex should not overcomplicate toast theming in the first pass, but should avoid making future context support difficult.

AO00. Theme copying helper

Codex should consider adding a helper module such as `src/core/theme-context.js` or adding helpers to `src/core/theme.js`.

A possible internal helper is:

```js
import { PUBLIC_TOKENS } from "./constants.js";

export function applyThemePatch(target, themePatch = {}) {
  if (!target) return;
  for (const [token, value] of Object.entries(themePatch)) {
    if (value == null) continue;
    target.style.setProperty(token, String(value));
  }
}

export function copyPublicThemeContext(source, target) {
  if (!source || !target || typeof getComputedStyle === "undefined") return;
  const computed = getComputedStyle(source);
  for (const token of Object.values(PUBLIC_TOKENS)) {
    const value = computed.getPropertyValue(token);
    if (value) target.style.setProperty(token, value.trim());
  }
}
```

This helper should be internal unless Codex finds a strong reason to export it. Exporting too many low-level helpers can create unnecessary API surface.

AP00. Theme validation

Theme validation is useful but should not make the runtime brittle.

Codex may add a development helper that identifies unknown tokens or missing defaults. Tests should validate official themes and defaults. Runtime theme application should not throw for unknown custom properties because developers may intentionally add their own variables for custom components.

A test should ensure that every value in `PUBLIC_TOKENS` appears in `DEFAULT_THEME`.

AQ00. Testing requirements

Codex shall add or update tests for the theming system.

The tests shall verify that `ThemeService` merges patches and applies CSS variables to a target. They shall verify that every public token has a default value. They shall verify that `setTheme(theme, target)` works with no active desktop root. They shall verify that `mountWindow(win, { theme })`, if implemented, applies variables to the window and does not mutate the root theme.

Distribution tests shall verify that new tokens, helpers, and presets are exported when they are intended to be public.

Component-level tests should verify that major components reference new tokens in their styles. If the existing test setup does not render CSS fully, source-level tests may be acceptable for checking that hard-coded values were replaced by token references in key components.

Browser-level or demo verification should cover default, accent, compact, rounded, and high contrast themes. The verification should include window mount, drag, resize, menu open, dialog open, toast show, input focus, tab navigation, command palette navigation, and browser panel state overlays.

AR00. Acceptance criteria

The implementation is acceptable when the project can demonstrate the following outcomes.

A developer can change accent color through a small theme patch. A developer can apply a theme to one window without affecting other windows. A developer can create a compact theme without causing clipped controls or broken menus. A developer can create a mildly rounded theme without overriding internal Shadow DOM styles. A developer can create a high contrast theme with visible focus and readable states. The default theme remains visually consistent with the current retro-modern catalog direction.

Components no longer hard-code major repeated anatomy values that are meant to be themeable. Public tokens have defaults. The distribution README explains the theming model. Tests cover token completeness, theme application, scoped window theming, and exported API shape.

AS00. Risks

The first risk is token sprawl. If Codex exposes too many tokens too quickly, the theme API will become intimidating and hard to maintain. The mitigation is to start with a compact, high-value set and expand only when repeated needs appear.

The second risk is visual fragmentation. If themes can change every component independently, the framework may lose its identity. The mitigation is to use semantic tokens and component mappings rather than arbitrary per-edge or per-subpart tokens.

The third risk is shared root conflicts. If all themes apply to the desktop root, the last active tool wins. The mitigation is to make window-scoped theming official and to add `mountWindow({ theme })`.

The fourth risk is portal theme loss. Menus, dialogs, and toasts may lose local theme variables when portaled. The mitigation is to copy public theme context from the source host to the portaled element or to portal within a themed context.

The fifth risk is flicker. A window mounted with a local theme may briefly render with the default theme. The mitigation is to apply the theme before appending the window to the visible root.

The sixth risk is layout breakage. Compact or rounded themes may affect component dimensions and positioning. The mitigation is to test compact and rounded themes against drag, resize, menu positioning, dialog layout, and focus rings.

AT00. Suggested implementation order

Codex should implement this work in phases.

First, update `PUBLIC_TOKENS` and `DEFAULT_THEME` with the initial geometry and anatomy token set. Add token completeness tests.

Second, update `ThemeService` or add a small helper so theme patches can be applied directly to explicit targets without requiring root state. Document and test `setTheme(theme, target)`.

Third, add `theme` support to `mountWindow()` and preferably `openBookmarkletWindow()`. Apply local theme variables before appending the window to avoid flicker.

Fourth, refactor high-impact components: button, icon button, input, select, textarea, window, menu, panel, card, group, tabs, toolbar, dialog, toast, alert, field, and browser panel.

Fifth, handle portal theme context for menus. Then evaluate dialogs and toasts. Add tests or demo cases for local window themes with portaled UI.

Sixth, update the distribution README with root theme, window theme, accent theme, compact theme, rounded theme, and high contrast examples.

Seventh, update the demo catalog to include a theming demonstration using the real framework components.

Eighth, decide whether to add built-in presets. If added, keep them small and export them clearly.

AU00. Example final developer workflow

After implementation, a downstream developer should be able to write this:

```js
import {
  createWindow,
  mountWindow,
  PUBLIC_TOKENS,
  TAGS
} from "./dist/bookmarklet/index.js";

const content = document.createElement(TAGS.panel);
content.innerHTML = `
  <span slot="title">Capture controls</span>
  <p>Reusable tool content.</p>
`;

const captureTheme = {
  [PUBLIC_TOKENS.selectionBg]: "#2f6f4e",
  [PUBLIC_TOKENS.focusRing]: "#1f7a4a",
  [PUBLIC_TOKENS.windowBg]: "#f1f5f2",
  [PUBLIC_TOKENS.panelBg]: "#fbfdfb",
  [PUBLIC_TOKENS.radiusControl]: "2px",
  [PUBLIC_TOKENS.windowBodyPadding]: "10px"
};

const win = createWindow({
  title: "Capture Tool",
  content
});

mountWindow(win, {
  ownerPrefix: "capture-tool",
  theme: captureTheme
});
```

This should produce a themed tool window without changing the shared root, without editing component CSS, and without leaking styles into the host page.

AV00. Example docs recipe: accent-only theme

```js
const accentTheme = {
  [PUBLIC_TOKENS.selectionBg]: "#175a9c",
  [PUBLIC_TOKENS.selectionFg]: "#ffffff",
  [PUBLIC_TOKENS.focusRing]: "#0f62fe",
  [PUBLIC_TOKENS.titlebarActiveBg]: "#d8e4f4",
  [PUBLIC_TOKENS.infoBg]: "#e8f2ff",
  [PUBLIC_TOKENS.infoFg]: "#18549e",
  [PUBLIC_TOKENS.infoBorder]: "#8db4e8"
};

setTheme(accentTheme);
```

This recipe is for simple identity changes. It should work immediately and globally.

AW00. Example docs recipe: compact window theme

```js
const compactToolTheme = {
  [PUBLIC_TOKENS.space1]: "3px",
  [PUBLIC_TOKENS.space2]: "6px",
  [PUBLIC_TOKENS.space3]: "8px",
  [PUBLIC_TOKENS.controlHeight]: "26px",
  [PUBLIC_TOKENS.titleHeight]: "28px",
  [PUBLIC_TOKENS.controlPaddingX]: "8px",
  [PUBLIC_TOKENS.buttonPaddingX]: "8px",
  [PUBLIC_TOKENS.inputPaddingX]: "6px",
  [PUBLIC_TOKENS.windowBodyPadding]: "8px",
  [PUBLIC_TOKENS.panelPadding]: "6px",
  [PUBLIC_TOKENS.cardPadding]: "6px",
  [PUBLIC_TOKENS.menuItemHeight]: "26px"
};

mountWindow(win, {
  ownerPrefix: "dense-tool",
  theme: compactToolTheme
});
```

This recipe is for tools with many controls in a constrained window. It must not cause text clipping or broken focus states.

AX00. Example docs recipe: rounded theme

```js
const roundedToolTheme = {
  [PUBLIC_TOKENS.radiusControl]: "4px",
  [PUBLIC_TOKENS.radiusSurface]: "6px",
  [PUBLIC_TOKENS.radiusWindow]: "8px",
  [PUBLIC_TOKENS.buttonShadow]: "none",
  [PUBLIC_TOKENS.controlInsetShadow]: "inset 0 1px 2px rgba(0, 0, 0, 0.18)"
};

mountWindow(win, {
  ownerPrefix: "rounded-tool",
  theme: roundedToolTheme
});
```

This recipe is for a slightly softer tool identity while still using the same component grammar.

AY00. Example docs recipe: high contrast theme

```js
const highContrastToolTheme = {
  [PUBLIC_TOKENS.windowBg]: "#ffffff",
  [PUBLIC_TOKENS.panelBg]: "#ffffff",
  [PUBLIC_TOKENS.surfaceRaisedBg]: "#ffffff",
  [PUBLIC_TOKENS.surfaceInsetBg]: "#eeeeee",
  [PUBLIC_TOKENS.inputBg]: "#ffffff",
  [PUBLIC_TOKENS.inputFg]: "#000000",
  [PUBLIC_TOKENS.textMuted]: "#222222",
  [PUBLIC_TOKENS.borderStrong]: "#000000",
  [PUBLIC_TOKENS.borderSubtle]: "#333333",
  [PUBLIC_TOKENS.dividerColor]: "#333333",
  [PUBLIC_TOKENS.selectionBg]: "#003b8e",
  [PUBLIC_TOKENS.selectionFg]: "#ffffff",
  [PUBLIC_TOKENS.focusRing]: "#ffbf00",
  [PUBLIC_TOKENS.focusRingWidth]: "3px"
};
```

This recipe is for readability and state clarity. It should be included in documentation and should be used for visual testing.

AZ00. Final guidance to Codex

Codex should implement the theming system as a coherent product feature, not as a scattering of CSS variable additions. The work should improve the framework's developer ergonomics, visual consistency, and long-term maintainability.

When in doubt, Codex should prefer a small, meaningful token over a large set of fragile tokens. It should prefer scoped CSS variables over global CSS. It should prefer window-scoped themes over multiple roots. It should prefer semantic attributes for modes and tokens for values. It should preserve the default retro-modern identity. It should refactor aggressively where the current component CSS blocks the theming model.

The final result should make this statement true:

A developer can build several bookmarklet tools with distinct visual identities, mount them into the same shared desktop environment, and rely on one coherent, documented, themeable component system instead of creating private CSS frameworks for each tool.
