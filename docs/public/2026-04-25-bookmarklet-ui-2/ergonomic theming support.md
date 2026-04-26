Date: 2026-04-25

# Ergonomic Theming Support for AWW Bookmarklet UI

This report explains how the current bookmarklet UI framework can support
incremental theming: first by changing colors per bookmarklet, then by
supporting broader style adjustments such as spacing, radius, button anatomy,
surface density, and per-tool visual identity without breaking the shared
component structure.

The short version: the framework already has the right foundation. It uses
Shadow DOM components, public CSS custom properties, a central token registry,
a default theme map, and a runtime `setTheme()` API. That makes color theming
easy today. The missing piece is that many non-color style choices are still
hard-coded inside component styles. To support ergonomic future themes, the
system should evolve from "theme equals color token patch" into a layered
design-token architecture: semantic color tokens, global geometry tokens,
component-level style tokens, a small set of variant/density attributes, and
documented escape hatches for advanced users.

## Current Context

The project is a compact custom-element UI framework for bookmarklets and
injected tools. The public runtime entry is `src/bookmarklet/index.js`, which
registers all components and exposes the framework through module exports and
global aliases:

- `globalThis.awwtools.bookmarkletUi`
- `globalThis.awwbookmarklet`

The README describes the intended design language as a compact desktop utility
system with square controls, explicit borders, dense spacing, restrained system
colors, and visible focus states. This is important because theming should not
mean "every bookmarklet invents a new UI system." The goal is to let individual
bookmarklets express identity while preserving the same structural grammar.

The current source layout is already favorable for theming:

- `src/core/constants.js` defines `PUBLIC_TOKENS`.
- `src/themes/default-theme.js` maps public tokens to default values.
- `src/core/theme.js` defines `ThemeService`.
- `src/core/runtime.js` applies the default theme to the desktop root.
- `src/bookmarklet/index.js` exports `setTheme()`, `ThemeService`,
  `defaultThemeService`, `PUBLIC_TOKENS`, and `DEFAULT_THEME`.
- `src/core/styles.js` defines the shared CSS helper, base styles, and Shadow
  DOM style adoption mechanism.
- `src/components/*.js` define component-local Shadow DOM styles that consume
  public CSS variables.

This means theming is not an afterthought. It exists, but it is currently
narrower than the future use cases described in the prompt.

## What Works Today

The current public API supports root-level CSS variable theming. A downstream
bookmarklet can call:

```js
import { PUBLIC_TOKENS, setTheme } from "./dist/bookmarklet/index.js";

setTheme({
  [PUBLIC_TOKENS.windowBg]: "#f4f7fb",
  [PUBLIC_TOKENS.panelBg]: "#ffffff",
  [PUBLIC_TOKENS.selectionBg]: "#175a9c",
  [PUBLIC_TOKENS.focusRing]: "#0f62fe"
});
```

Internally, `setTheme(themePatch, target = null)` merges the patch into
`defaultThemeService`, finds the active desktop root, and applies each token as
an inline CSS custom property on that root. Components inside that root inherit
those variables through normal CSS inheritance, including across Shadow DOM
boundaries where variables are intentionally inherited.

This is ergonomic for simple color themes:

- A bookmarklet can set a different accent color.
- A bookmarklet can adjust surface colors.
- A bookmarklet can adjust state colors such as danger, warning, success, and
  info.
- A bookmarklet can adjust a few spacing and sizing tokens:
  `--awwbookmarklet-space-1`, `--awwbookmarklet-space-2`,
  `--awwbookmarklet-space-3`, `--awwbookmarklet-size-control-h`, and
  `--awwbookmarklet-size-title-h`.

This already covers the easiest per-bookmarklet requirement: "same structure,
different colors."

## Current Theme Surface

`PUBLIC_TOKENS` currently includes these broad categories:

- Workspace and shell surfaces:
  `workspaceBg`, `windowBg`, `panelBg`, `appShellBg`, `surfaceRaisedBg`,
  `surfaceInsetBg`.
- Titlebar colors:
  `titlebarActiveBg`, `titlebarInactiveBg`, `titlebarFg`.
- Borders and dividers:
  `borderStrong`, `borderSubtle`, `dividerColor`.
- Text:
  `inputFg`, `textMuted`, `textHelp`, `menuFg`, `buttonFg`.
- Controls:
  `buttonBg`, `buttonActiveBg`, `inputBg`.
- Selection and focus:
  `selectionBg`, `selectionFg`, `focusRing`.
- Status tones:
  `info*`, `success*`, `warning*`, `danger*`.
- Overlay and elevation:
  `overlayBackdrop`, `overlayShadow`, `shadowDepth`, `frostOpacity`.
- Content surfaces:
  `cardBg`, `cardSelectedBg`, `metricBg`, `codeBg`, `codeFg`.
- Space and size:
  `space1`, `space2`, `space3`, `controlHeight`, `titleHeight`.

This set is useful, but it is mostly color-oriented. The spacing tokens are
coarse. There are no radius tokens. There are no component-specific padding
tokens. There are no explicit typography tokens. There are no state-layer tokens
for hover, pressed, disabled, selected, or elevated treatments beyond a small
number of color roles.

## How Styles Are Applied

The framework uses Shadow DOM and local style blocks. Each component imports:

```js
import { adoptStyles, BASE_COMPONENT_STYLES, css } from "../core/styles.js";
```

Then it creates a Shadow Root and calls:

```js
adoptStyles(shadow, [BASE_COMPONENT_STYLES, COMPONENT_STYLES]);
```

`adoptStyles()` uses constructable stylesheets when available and falls back to
cached `<style>` tags when needed. This is good for bookmarklet safety because
component CSS is isolated from hostile page CSS, but CSS custom properties still
allow intentional inheritance from the framework root.

`BASE_COMPONENT_STYLES` provides:

- A reset layer.
- Host box sizing and font defaults.
- A default foreground color.
- Hidden host behavior.
- A shared focus ring variable `--_ring`.
- Shared selection colors.

Most visual identity lives in component-local CSS. That gives each component
clear ownership, but it also means every hard-coded visual decision inside a
component becomes difficult to theme later unless it is connected to a public
token.

## Where Theming Is Currently Easy

The current design makes these changes easy:

### Per-bookmarklet accent color

Change `selectionBg`, `selectionFg`, and `focusRing`. This affects selected
rows, primary buttons, selected tabs, focus rings, progress accent color, and
other stateful surfaces that already depend on selection/focus tokens.

### Per-bookmarklet surface palette

Change `windowBg`, `panelBg`, `appShellBg`, `surfaceRaisedBg`,
`surfaceInsetBg`, `cardBg`, `metricBg`, `inputBg`, and `menuBg`.

### Per-bookmarklet state palette

Change `infoBg`, `infoFg`, `infoBorder`, `successBg`, `successFg`,
`successBorder`, `warningBg`, `warningFg`, `warningBorder`, `dangerBg`,
`dangerFg`, and `dangerBorder`.

### Slight density changes

Change `space1`, `space2`, `space3`, `controlHeight`, and `titleHeight`.
Components such as `panel`, `app-shell`, `card`, `button`, `input`, `select`,
and `textarea` already use some of these.

## Where Theming Is Currently Hard

The current implementation still hard-codes many values inside Shadow DOM
styles. These values are not reachable through `setTheme()` unless the component
CSS is changed.

Examples:

- `button.js`
  - `border-radius: 0`
  - `min-width: 72px`
  - `padding: 0 12px`
  - inset shadow values
  - gradient mixing percentages
- `icon-button.js`
  - square width/height tied to control height
  - `border-radius: 0`
  - fixed icon size `16px`
- `window.js`
  - host `border-radius: 0`
  - titlebar `gap: 6px`
  - titlebar `padding: 0 6px`
  - titlebar gradient top colors `#f7f9fb` and `#eef2f6`
  - system button background and shadows
  - fixed command button height/min-width `22px`
- `input.js`, `select.js`, `textarea.js`
  - `border-radius: 0`
  - fixed horizontal padding
  - fixed min widths
- `menu.js`
  - fixed menu min width
  - fixed item height
  - fixed item padding and gap
- `panel.js`, `card.js`, `group.js`
  - some spacing is tokenized, but not all inner gaps, footer/header padding,
    or shape decisions are tokenized.
- `toolbar.js`
  - has a good `density` precedent, but compact/spacious gaps are still fixed
    values rather than public density tokens.

This does not mean the implementation is poor. It means the first version
correctly chose a coherent visual style, then exposed only the most obvious
theme knobs. The next step is to decide which visual decisions are stable design
rules and which should become public theme controls.

## Architectural Tension

There are two valid goals that pull in different directions:

1. Keep the UI consistent and recognizable.
2. Let individual bookmarklets feel slightly distinct and adapt to their own
   use cases.

The system should not expose every CSS property as public API. That would make
themes fragile and inconsistent. But it also should not force all bookmarklets
to have identical colors, density, control geometry, and button style forever.

The ergonomic path is to expose theme controls at the level of design decisions,
not raw implementation details. For example:

- Good public token: `--awwbookmarklet-radius-control`
- Risky public token: `--awwbookmarklet-button-border-top-left-radius`
- Good public token: `--awwbookmarklet-control-padding-x`
- Risky public token: `--awwbookmarklet-button-padding-left`
- Good public token: `--awwbookmarklet-elevation-window`
- Risky public token: `--awwbookmarklet-window-box-shadow-layer-2-y`

Themes should express intent. Component CSS should translate that intent into
actual rendering.

## Option 1: Keep Token Patches As The Only Theme Mechanism

This option keeps the current architecture almost unchanged. Bookmarklets call
`setTheme()` with a patch of existing public tokens. No additional style
surface is introduced.

### Pros

- Already implemented.
- Very low risk.
- Easy for downstream users to understand.
- Keeps visual consistency strong.
- No migration work.
- No extra API design needed.
- Existing tests around theme merging remain valid.

### Cons

- Only solves color theming well.
- Does not solve rounded corners.
- Does not solve button anatomy.
- Does not solve per-component density beyond broad spacing tokens.
- Does not solve titlebar style changes.
- Does not solve "same structure, different style dialect."
- Users who want more control will use inline styles, `::part` overrides, or
  custom CSS in inconsistent ways.

### Best use

This is the right default for immediate per-bookmarklet identity. It should
remain supported permanently. It is not enough as the only future theming model.

## Option 2: Expand Public Tokens For Shape, Density, And Component Anatomy

This option keeps the same basic model but expands `PUBLIC_TOKENS` and
`DEFAULT_THEME` beyond colors.

Potential new token categories:

- Radius:
  - `--awwbookmarklet-radius-none`
  - `--awwbookmarklet-radius-control`
  - `--awwbookmarklet-radius-surface`
  - `--awwbookmarklet-radius-window`
  - `--awwbookmarklet-radius-pill`
- Control anatomy:
  - `--awwbookmarklet-control-padding-x`
  - `--awwbookmarklet-control-padding-y`
  - `--awwbookmarklet-control-min-width`
  - `--awwbookmarklet-control-icon-size`
  - `--awwbookmarklet-control-border-width`
- Button anatomy:
  - `--awwbookmarklet-button-radius`
  - `--awwbookmarklet-button-padding-x`
  - `--awwbookmarklet-button-min-width`
  - `--awwbookmarklet-button-shadow`
  - `--awwbookmarklet-button-active-shadow`
  - `--awwbookmarklet-button-hover-bg`
- Window anatomy:
  - `--awwbookmarklet-window-radius`
  - `--awwbookmarklet-window-border-width`
  - `--awwbookmarklet-window-body-padding`
  - `--awwbookmarklet-titlebar-padding-x`
  - `--awwbookmarklet-titlebar-gap`
  - `--awwbookmarklet-titlebar-active-top-bg`
  - `--awwbookmarklet-titlebar-inactive-top-bg`
- Surface anatomy:
  - `--awwbookmarklet-panel-padding`
  - `--awwbookmarklet-card-padding`
  - `--awwbookmarklet-group-padding`
  - `--awwbookmarklet-surface-gap`
  - `--awwbookmarklet-section-gap`
- Menu anatomy:
  - `--awwbookmarklet-menu-padding`
  - `--awwbookmarklet-menu-item-height`
  - `--awwbookmarklet-menu-item-padding-x`
  - `--awwbookmarklet-menu-item-gap`

### Pros

- Preserves the current architecture.
- Works naturally with Shadow DOM.
- Keeps downstream API ergonomic: users still call `setTheme()`.
- Enables incremental migration component by component.
- Allows color-only themes and shape/density themes to use the same mechanism.
- Makes future built-in themes easy to implement.
- Reduces hard-coded values in component CSS.

### Cons

- Public token sprawl is a real risk.
- Every public token becomes a compatibility promise.
- Naming needs discipline.
- Not every CSS value deserves a token.
- Too many component-specific tokens can make theme authoring feel complex.

### Best use

This should be the main architectural direction. Start with a small, high-value
set of geometry and anatomy tokens, then expand only when a repeated
customization need appears.

## Option 3: Add Named Theme Presets

This option adds more files under `src/themes/`, each exporting a theme object
or a theme patch.

Possible examples:

- `default-theme.js`
- `compact-theme.js`
- `rounded-theme.js`
- `high-contrast-theme.js`
- downstream app themes such as `reader-theme.js` or `screenshot-theme.js`

The public runtime could expose a map of built-in themes or helper functions:

```js
import { THEMES, setTheme } from "./dist/bookmarklet/index.js";

setTheme(THEMES.rounded);
```

or:

```js
import { createTheme, DEFAULT_THEME, setTheme } from "./dist/bookmarklet/index.js";

setTheme(createTheme(DEFAULT_THEME, {
  "--awwbookmarklet-selection-bg": "#7057c2"
}));
```

### Pros

- Very ergonomic for users.
- Creates reusable examples of correct token usage.
- Helps document what "a theme" means.
- Encourages app authors to avoid ad hoc inline styles.
- Good fit for bookmarklet-specific identity.

### Cons

- Needs a merge policy: full theme object versus patch object.
- Needs a naming policy: built-in themes versus app-local themes.
- Built-in themes increase visual QA burden.
- If presets are added before token architecture is strong, they will either
  be shallow color themes or require source-code changes.

### Best use

Add named presets after expanding the token surface enough to represent more
than colors. In the near term, documentation can show local theme patches
without shipping many built-in themes.

## Option 4: Add Root-Scoped Or Window-Scoped Theme Contexts

The current runtime has one desktop root per framework version. `setTheme()`
defaults to applying the singleton theme service to that active root. This works
well when one bookmarklet or one visual system is active.

The future problem: two bookmarklets may share the same framework root but want
different themes.

There are several possible levels of isolation:

### Global root theme

The current model. One active theme applies to everything in the desktop root.

Best for:

- One active tool.
- A suite of tools that intentionally share a theme.
- Simple runtime API.

Weakness:

- If multiple bookmarklets share the root, the last `setTheme()` call wins.

### Explicit target theme

This already partly exists because `setTheme(themePatch, target)` accepts an
explicit target. A caller can pass a specific element and apply variables there.
The report should recommend documenting this as an intentional feature.

Example:

```js
const win = createWindow({ title: "Reader" });

setTheme({
  [PUBLIC_TOKENS.selectionBg]: "#6b4db6"
}, win);

mountWindow(win);
```

Because CSS variables inherit downward, applying theme variables to a specific
window host can theme that window and its child components without changing the
whole desktop root.

Best for:

- Per-window theme identity.
- Multiple bookmarklets sharing a root.
- Incremental adoption without runtime redesign.

Weakness:

- Overlay/portal elements may inherit from the desktop root rather than the
  originating window unless portal behavior preserves theme context.
- Menus, dialogs, toasts, or other portaled UI need careful handling.

### Per-owner theme in runtime records

This would extend `acquireDesktopRoot(owner)` or `mountWindow()` options to
associate a theme with an owner or mounted window:

```js
mountWindow(win, {
  ownerPrefix: "reader-tool",
  theme: readerTheme
});
```

Best for:

- Cleaner downstream API.
- Bookmarklet-specific theme setup.
- Avoiding manual `setTheme(theme, win)` calls.

Weakness:

- Requires runtime API changes.
- Requires deciding whether theme applies to the window, owner, root, or all
  windows created through that owner.

### Multiple desktop roots by theme

This would create separate roots for different theme contexts.

Best for:

- Strong isolation.

Weakness:

- More runtime complexity.
- More z-index and owner lifecycle complexity.
- More likely to create duplicated overlay layers.
- Not needed for most theming use cases.

### Recommendation

Prefer window-scoped theme application first. Document and support
`setTheme(themePatch, win)` or a future `mountWindow(win, { theme })` option.
Avoid multiple desktop roots unless there is a concrete isolation problem that
window-scoped variables cannot solve.

## Option 5: Add Semantic Variant And Density Attributes

Tokens are good for values. Attributes are good for semantic modes.

The framework already uses this pattern:

- `awwbookmarklet-button` supports `variant`, `tone`, `busy`, `pressed`.
- `awwbookmarklet-toolbar` supports `density`, `align`, `orientation`, `wrap`.
- Components normalize tone/density/orientation through helper functions.

This is a strong precedent. Future style changes should use attributes when the
choice is semantic and component-level.

Examples:

- `density="compact|normal|spacious"` for layout components.
- `variant="default|primary|ghost|link"` for buttons.
- `tone="neutral|info|success|warning|danger"` for status surfaces.
- `selected`, `pressed`, `busy`, `disabled` for states.

Potential future attributes need stricter scrutiny:

- `shape="square|rounded|pill"` may be useful for button-like controls, but it
  risks making every component invent its own shape model.
- `chrome="classic|soft"` might be useful at the shell level, but it can become
  too broad and hard to define.

### Pros

- More readable than raw CSS variables for semantic choices.
- Easier to validate.
- Easier to document.
- Keeps component structure consistent.
- Avoids huge token patches for common modes.

### Cons

- Too many attributes can fragment component APIs.
- Attributes need tests and normalizers.
- Attributes are less flexible than tokens for arbitrary theme design.

### Recommendation

Use attributes for behavior-like or anatomy-like modes that authors naturally
think of as component variants. Use tokens for actual measured values and
colors. Do not add attributes for every visual preference.

## Option 6: Document `::part` As An Escape Hatch

Many components already expose `part` names:

- `button.js`: `part="control"`
- `icon-button.js`: `part="control"`
- `window.js`: `part="shell"`, `part="titlebar"`, `part="body"`,
  `part="close-button"`, and others.
- `panel.js`: `part="panel"`, `part="header"`, `part="body"`,
  `part="footer"`.
- `card.js`: `part="card"`, `part="header"`, `part="title"`, `part="body"`,
  `part="footer"`.

Because components use Shadow DOM, normal external CSS cannot reach internal
elements. `::part` is the standards-based way to allow selected external
styling of internal elements.

Example:

```css
awwbookmarklet-button::part(control) {
  border-radius: 999px;
}
```

### Pros

- Powerful.
- No JavaScript API needed.
- Lets advanced users solve edge cases.
- Can be useful during migration before all needed tokens exist.

### Cons

- Less stable than tokens.
- Easy to overuse.
- Can break visual consistency.
- Can become dependent on internal structure.
- Harder to test across all downstream users.

### Recommendation

Document `::part` as an escape hatch, not the primary theming system. The main
theme path should remain public tokens and semantic attributes.

## Recommended Layered Architecture

The best long-term architecture is a layered model:

### Layer 1: Semantic color tokens

These define meaning:

- window surface
- panel surface
- raised surface
- inset surface
- primary command/accent
- selection
- focus
- text
- muted text
- divider
- info/success/warning/danger

This layer mostly exists already.

### Layer 2: Global geometry tokens

These define system-wide physical rules:

- radius scale
- border width scale
- spacing scale
- control height scale
- titlebar height
- focus ring size
- icon size
- shadow/elevation levels

This layer is currently incomplete.

### Layer 3: Component mapping tokens

These map system values to specific component anatomy:

- button radius
- button padding
- button minimum width
- menu item height
- titlebar padding
- window body padding
- panel/card/group padding
- input padding

This layer should stay small and purposeful. Add these tokens where global
tokens are too blunt.

### Layer 4: Semantic attributes

These define component modes:

- `variant`
- `tone`
- `density`
- `orientation`
- `align`
- `selected`
- `busy`
- `pressed`

This layer already exists in several components and should be expanded
carefully.

### Layer 5: Parts and local custom CSS

This is the escape hatch for advanced users. It should be documented but not
positioned as the normal theme workflow.

## Concrete Incremental Migration Path

The implementation can be incremental and low risk.

### Phase 1: Document current theming clearly

Add documentation showing:

- color-only theme patch
- per-window theme patch using explicit `target`
- recommended tokens for bookmarklet identity
- warning that shape and button anatomy are not fully tokenized yet

This immediately improves ergonomics without changing runtime code.

### Phase 2: Audit hard-coded visual values

Classify hard-coded values into three groups:

- Structural constants that should remain fixed.
- Repeated design values that should become global tokens.
- Component-specific anatomy values that should become component tokens.

Examples of likely token candidates:

- `border-radius: 0` across controls and surfaces
- button padding and min width
- input/select/textarea padding
- window body padding
- titlebar padding/gap
- panel/card/group padding
- menu item height/padding
- icon size
- inset button shadows

Examples of likely fixed values:

- resize handle hit areas in `window.js`
- some grid structure values
- accessibility-related minimums
- internal slot layout mechanics

### Phase 3: Add a small geometry token set

Start with a compact set:

```js
radiusControl: "--awwbookmarklet-radius-control"
radiusSurface: "--awwbookmarklet-radius-surface"
radiusWindow: "--awwbookmarklet-radius-window"
controlPaddingX: "--awwbookmarklet-control-padding-x"
controlMinWidth: "--awwbookmarklet-control-min-width"
iconSize: "--awwbookmarklet-icon-size"
windowBodyPadding: "--awwbookmarklet-window-body-padding"
surfacePadding: "--awwbookmarklet-surface-padding"
surfaceGap: "--awwbookmarklet-surface-gap"
```

The default theme can keep current values:

```js
[PUBLIC_TOKENS.radiusControl]: "0"
[PUBLIC_TOKENS.radiusSurface]: "0"
[PUBLIC_TOKENS.radiusWindow]: "0"
[PUBLIC_TOKENS.controlPaddingX]: "12px"
[PUBLIC_TOKENS.controlMinWidth]: "72px"
[PUBLIC_TOKENS.iconSize]: "16px"
[PUBLIC_TOKENS.windowBodyPadding]: "12px"
[PUBLIC_TOKENS.surfacePadding]: "8px"
[PUBLIC_TOKENS.surfaceGap]: "8px"
```

This preserves the current default look while making rounded or denser themes
possible.

### Phase 4: Refactor high-impact components first

The first components to refactor should be:

- `button.js`
- `icon-button.js`
- `input.js`
- `select.js`
- `textarea.js`
- `window.js`
- `panel.js`
- `card.js`
- `menu.js`

These have the highest impact on perceived theme quality.

The default CSS should always include fallbacks:

```css
border-radius: var(--awwbookmarklet-radius-control, 0);
padding-inline: var(--awwbookmarklet-control-padding-x, 12px);
```

This protects older themes and manual CSS setups.

### Phase 5: Add documented theme recipes

Add examples such as:

- "Accent-only bookmarklet theme"
- "Rounded controls theme"
- "Compact dense tool theme"
- "High contrast utility theme"

These can start as docs-only recipes before they become built-in presets.

### Phase 6: Add built-in presets only after the token set stabilizes

Once the token model is proven, ship named presets if they are useful. Avoid
adding many built-in themes too early. A small set is enough:

- default
- compact
- rounded
- high contrast

Per-bookmarklet themes can remain local patches.

## Suggested Future API Shape

The current API should remain valid:

```js
setTheme(themePatch);
```

Document the existing explicit target behavior:

```js
setTheme(themePatch, win);
```

Consider adding `theme` to `mountWindow()` later:

```js
mountWindow(win, {
  ownerPrefix: "reader-tool",
  theme: readerTheme
});
```

This is more ergonomic for bookmarklet authors because they usually think:
"mount this tool with this theme."

Implementation detail:

- `mountWindow()` can apply the theme patch to `win` before appending it.
- The root default theme remains unchanged.
- Per-window themes do not fight each other.

Potential helper:

```js
createTheme(baseTheme, patch);
```

This helper is optional. JavaScript object spread already works:

```js
const readerTheme = {
  ...DEFAULT_THEME,
  [PUBLIC_TOKENS.selectionBg]: "#6b4db6"
};
```

But a helper could validate token names and normalize null/undefined values if
that becomes important.

## Risks And Design Decisions

### Risk: Too many public tokens

Every public token is a promise. Avoid exposing tokens for one-off internal
details. Add tokens when a value is repeated, meaningful, and likely to be
customized.

Decision:

Prefer global geometry tokens first, component-specific tokens second.

### Risk: Themes become skins instead of a design system

If themes can change every component independently, the framework loses its
consistent identity.

Decision:

Themes should preserve component structure. Variants should be semantic.
Rounded, compact, or high-contrast themes are acceptable. Completely unrelated
component anatomy should be discouraged.

### Risk: Shared root theme conflicts

Multiple bookmarklets on one root may want different themes.

Decision:

Support and document window-scoped theme targets. Consider `mountWindow({ theme
})` later. Avoid multiple desktop roots as the first solution.

### Risk: Portaled UI loses theme context

Menus, dialogs, toasts, and overlays may be appended to an overlay layer under
the desktop root. If a window has a local theme, a portaled child may not inherit
that window's CSS variables.

Decision:

When portaled components become theme-sensitive, copy the originating theme
context or portal within the nearest themed host when possible. This should be
tested before promising full per-window themes for all overlay components.

### Risk: Existing `frostOpacity` token is a public promise without effect

Prior review notes indicate `--awwbookmarklet-frost-opacity` exists but is not
meaningfully wired into component CSS. That creates confusion for theme authors.

Decision:

Either wire it into real visual behavior or deprecate/remove it before it
becomes relied on.

### Risk: Inline demo styles become accidental API

The example tool uses inline layout styles for toolbar/body/grid structure.
This makes it less useful as proof of theming ergonomics.

Decision:

Future demos should show theme-compatible composition using public components,
tokens, and attributes instead of large inline style blocks.

## Practical Examples

### Color-only bookmarklet theme available today

```js
setTheme({
  [PUBLIC_TOKENS.windowBg]: "#f1f5f2",
  [PUBLIC_TOKENS.panelBg]: "#fbfdfb",
  [PUBLIC_TOKENS.titlebarActiveBg]: "#d8e6dc",
  [PUBLIC_TOKENS.selectionBg]: "#2f6f4e",
  [PUBLIC_TOKENS.focusRing]: "#1f7a4a",
  [PUBLIC_TOKENS.infoFg]: "#255c71",
  [PUBLIC_TOKENS.successFg]: "#256b3d"
});
```

This works now because these are existing public tokens.

### Per-window theme available with current target API

```js
const win = createWindow({ title: "Bookmark Cleaner", content });

setTheme({
  [PUBLIC_TOKENS.selectionBg]: "#7a4d99",
  [PUBLIC_TOKENS.focusRing]: "#8d5cc2"
}, win);

mountWindow(win, { ownerPrefix: "bookmark-cleaner" });
```

This should be documented as a supported pattern if per-bookmarklet themes are a
priority.

### Rounded theme after geometry tokens exist

```js
setTheme({
  "--awwbookmarklet-radius-control": "999px",
  "--awwbookmarklet-radius-surface": "6px",
  "--awwbookmarklet-radius-window": "8px",
  "--awwbookmarklet-button-shadow": "none"
});
```

This is not fully possible today because these tokens do not exist and many
components hard-code `border-radius: 0`.

### Compact theme after anatomy tokens exist

```js
setTheme({
  [PUBLIC_TOKENS.space1]: "3px",
  [PUBLIC_TOKENS.space2]: "6px",
  [PUBLIC_TOKENS.space3]: "8px",
  [PUBLIC_TOKENS.controlHeight]: "26px",
  [PUBLIC_TOKENS.titleHeight]: "28px",
  "--awwbookmarklet-control-padding-x": "8px",
  "--awwbookmarklet-window-body-padding": "8px",
  "--awwbookmarklet-menu-item-height": "26px"
});
```

Part of this works today through existing spacing and height tokens. The rest
requires new tokens.

## Testing Strategy

The project already has `test/theme.test.js`, `test/application-kit.test.js`,
and `test/distribution.test.js`. These are the right places to protect theming
changes.

Recommended tests:

- `ThemeService` still merges theme patches and applies all tokens to a target.
- New public tokens have stable CSS variable names.
- `DEFAULT_THEME` includes defaults for every public token.
- `setTheme(theme, target)` applies to the explicit target without requiring an
  active desktop root.
- `mountWindow(win, { theme })`, if added, applies the theme to the mounted
  window and does not mutate the root theme.
- Distribution tests confirm any new theme helpers or theme presets are exported
  from `src/bookmarklet/index.js`.
- Component source tests or snapshot-style checks confirm major components use
  new radius/padding tokens instead of hard-coded values.
- Browser/demo verification confirms:
  - default theme is visually unchanged,
  - color-only theme changes expected colors,
  - rounded theme changes control/window shape consistently,
  - compact theme reduces density without text overlap,
  - focus rings remain visible,
  - warning/danger/success/info states remain legible.

## Recommended Decision

Adopt the layered token architecture and implement it incrementally.

The most practical next step is not a large theme engine. It is a disciplined
expansion of the existing token system:

1. Keep `setTheme()` and `PUBLIC_TOKENS` as the primary public API.
2. Document color-only and per-window theme patches immediately.
3. Add a small set of geometry/anatomy tokens with defaults matching the current
   look.
4. Refactor high-impact components to consume those tokens.
5. Add a few docs-only theme recipes.
6. Add built-in theme presets only after the token set is stable.
7. Use `::part` as an escape hatch, not the main theme system.

This path preserves the existing retro desktop identity while making future
bookmarklet-specific themes ergonomic. It also lets the project change style
incrementally: first colors, then spacing and radius, then button and surface
anatomy, without forcing a rewrite of the component system.

