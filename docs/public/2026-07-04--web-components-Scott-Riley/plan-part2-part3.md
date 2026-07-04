# Plan for Part 2 and Part 3

This is an inferred follow-up plan based on the direction of `index.md`, written in the likely spirit of the author: practical, code-first, mildly allergic to hand-wavy design system nonsense, and focused on shipping a real, portable component library rather than a pile of pretty diagrams.

Part 1 left us with the useful bones:

- A monorepo with `packages/components` and `docs`
- Elena building and bundling framework-agnostic web components
- VitePress acting as the living documentation site
- A first primitive component, `my-button`
- JSDoc-powered implementation docs via the custom elements manifest

The next two parts should turn that into a proper design system: token-driven first, then polished, documented, tested, and ready to publish.

## Part 2: Token-driven components without losing our minds

Part 2 should tackle the thing the article explicitly tees up: a token workflow. Not "let's make some JSON because a conference talk told us to", but an actual practical token pipeline that feeds CSS, components, docs, and eventually consumers.

### 1. Decide what tokens are for

Start by separating token layers clearly:

- Global tokens: raw-ish design decisions like color ramps, spacing scale, font families, radii, borders, and motion timings.
- Semantic tokens: intent-driven aliases like `--color-surface-default`, `--color-text-loud`, `--space-action-x`, and `--radius-control`.
- Component tokens: the final local custom properties already hinted at in Part 1, like `--my-button-bg`, `--my-button-radius`, and `--my-button-padding-x`.

The point: components should not care whether the brand color is `oklch(62% 0.2 255)` or something Figma spat out after a long lunch. Components should care about meaning.

### 2. Add a token package

Create a dedicated workspace package:

```text
packages/
  components/
  tokens/
    package.json
    src/
      color.json
      space.json
      type.json
      radius.json
      border.json
      motion.json
      themes/
        default.json
        dark.json
```

Use plain structured token files at first. If the project needs Style Dictionary, add it because it solves a real build problem, not because token tooling needs to look impressive.

### 3. Generate CSS custom properties

Add a token build step that outputs:

```text
packages/tokens/dist/
  tokens.css
  theme-default.css
  theme-dark.css
  tokens.json
```

The CSS output should expose custom properties at a sensible root:

```css
:root {
  --color-surface-default: white;
  --color-surface-default-hover: #fafafa;
  --color-text-loud: #121812;
  --space-xs: 0.5rem;
  --space-sm: 1rem;
  --radius-sm: 0.5rem;
}
```

Then update VitePress to import the token CSS before component CSS, so examples render with the same contract consumers will use.

### 4. Use modern color properly

This is where the author would probably get a bit twitchy about design tools. Use the browser as the decision space:

- Define colors in `oklch()` where browser support is acceptable.
- Generate hover and active states using predictable lightness/chroma shifts.
- Keep contrast testable, not eyeballed.
- Expose semantic color names, not palette trivia.

The output should make it boringly easy to build default, primary, danger, and success states without hard-coding random hex values inside component CSS.

### 5. Refactor `my-button` to consume semantic tokens

Replace the placeholder button values from Part 1 with token-backed component properties:

```css
:scope {
  --my-button-bg: var(--color-action-default-bg);
  --my-button-bg-hover: var(--color-action-default-bg-hover);
  --my-button-text: var(--color-action-default-text);
  --my-button-padding-x: var(--space-action-x);
  --my-button-padding-y: var(--space-action-y);
  --my-button-radius: var(--radius-control);
}
```

Keep component-level custom properties as the final override layer. That is the whole trick: global design decisions stay global, local component decisions stay local, and nobody has to spelunk through a token cave to make one button behave.

### 6. Make the button less toy-like

Part 1 openly calls the button unfinished. Part 2 should harden it:

- Add `size`: `sm`, `md`, `lg`
- Add `type`: `button`, `submit`, `reset`
- Add `target` and `rel` for link rendering
- Add `download` if useful
- Add `aria-label` guidance for icon-only cases
- Add `loading` if the component can do it without becoming an application state machine
- Add icon slots or an `icon` approach, but keep text-first usage sane

Do not let the button become a weird omniscient CTA enterprise platform. It is still a primitive.

### 7. Document tokens in VitePress

Create documentation pages generated from token output:

```text
docs/
  foundations/
    color.md
    spacing.md
    typography.md
    radius.md
    motion.md
```

Add token preview components:

- Color swatches with names, values, and contrast notes
- Spacing examples
- Type scale previews
- Radius and border samples
- Theme switcher for default/dark previews

This should make the docs feel like a design system, not just a component dumping ground.

### 8. Add theme support

Add a small, practical theme story:

- Default theme
- Dark theme
- Optional high-contrast theme if the accessibility story benefits from it

Use CSS custom property overrides, not runtime JavaScript wizardry. The browser already knows how CSS works. Let it.

Example:

```css
:root,
[data-theme="default"] {
  --color-surface-default: white;
  --color-text-loud: #121812;
}

[data-theme="dark"] {
  --color-surface-default: #121812;
  --color-text-loud: white;
}
```

### 9. Tighten docs workflow

Part 2 should finish with the docs and library running together cleanly:

- `npm run build:tokens`
- `npm run watch:tokens`
- `npm run build:lib`
- `npm run docs:dev`
- `npm run dev` runs tokens, components, and docs together

The punchline of Part 2: change a token, see it flow through docs and components without manual copy-paste. Revolutionary stuff, apparently.

## Part 3: The actually polished design system

Part 3 should be the final part: the bit where the foundations become a small but production-ready design system. Not every component under the sun, just enough primitives and patterns to prove the architecture is real.

### 1. Set the quality bar

Open by defining what "done" means:

- Components are accessible by default where possible.
- Component APIs are small, explicit, and documented.
- Styling is token-driven and themeable.
- Docs include examples, prop tables, usage guidance, and anti-patterns.
- The package can be built, versioned, published, and consumed.
- The docs site can be deployed as the public design system reference.

This keeps Part 3 from turning into "let's add twenty components and hope vibes carry us home".

### 2. Add a small primitive component set

Build a focused set of primitives that exercise different API and styling needs:

- `my-button`: actions and links
- `my-badge`: status and metadata
- `my-card`: simple content container or composite wrapper
- `my-icon`: controlled icon rendering or icon slot conventions
- `my-input`: text input with label, hint, error, and disabled states
- `my-alert`: status messaging with variants
- `my-spinner`: loading indicator

Each component should include:

- Elena component source
- Scoped CSS
- Token-backed custom properties
- JSDoc comments
- Examples in VitePress
- Usage guidance
- Accessibility notes

### 3. Add one or two composite components

Part 1 explains composite components but does not build one. Part 3 should prove the model:

- `my-field`: wraps label, input, hint, error, and validation state
- `my-disclosure` or `my-accordion`: enhances slotted HTML
- Optional `my-dialog` only if there is appetite for doing the accessibility work properly

The lesson: not everything needs to render its own markup. Sometimes the right component wraps and enhances good HTML instead of replacing it.

### 4. Make accessibility boring

Add focused accessibility checks and guidance:

- Keyboard behavior for interactive components
- Visible focus states
- Color contrast checks for token pairs
- Disabled and loading behavior
- Form labeling and error relationships
- `aria-*` usage only where it actually helps

If tests are added, keep them practical:

- Unit tests for rendering decisions
- Playwright or similar browser tests for keyboard interaction
- Axe checks for rendered docs examples

The goal is not to cosplay as the W3C. The goal is to stop shipping broken controls.

### 5. Autogenerate component docs stubs

Part 1 hints at automatic `.md` generation when components are added to the custom elements manifest. Part 3 is the right place to do it.

Add a script:

```text
scripts/
  generate-component-docs.mjs
```

The script should:

- Read `packages/components/dist/custom-elements.json`
- Find component declarations with `tagName`
- Create missing `docs/components/<component>.md`
- Insert a standard docs scaffold
- Preserve existing docs files

Generated docs should include:

```md
<ComponentHeader tag="my-button" />

## Examples

## Props

<PropsTable tag="my-button" />

## Usage

## Accessibility
```

Do not overwrite handcrafted usage docs. That way lies rage.

### 6. Polish the docs theme

Move all hacky component example styling out of Markdown and into the VitePress theme.

Add:

- A proper component preview wrapper
- Light/dark theme toggle
- Token preview components
- Component status badges
- Better table styling
- Examples that look like real interface fragments, not lonely controls in a void

The docs should still feel like documentation, not a marketing site. Dense, useful, and pleasant enough that nobody wants to punt it into the sea.

### 7. Package the library properly

Prepare the component package for real consumption:

- Confirm `exports` are correct
- Export the full bundle
- Export individual components if Elena supports it cleanly
- Export CSS bundle
- Export token CSS from `@my-ds/tokens`
- Include custom elements manifest in the published package
- Add `files` whitelist in `package.json`
- Add README and installation docs

Example install docs:

```md
npm install @my-ds/components @my-ds/tokens
```

Example usage:

```js
import "@my-ds/tokens/theme-default.css";
import "@my-ds/components/dist/bundle.css";
import "@my-ds/components";
```

### 8. Add release workflow

Add the minimum release machinery:

- Build tokens
- Build components
- Build docs
- Run tests
- Validate custom elements manifest
- Validate generated docs
- Publish package
- Deploy docs

This could use GitHub Actions, Changesets, or a simple manual release script. Start boring. Boring releases are good releases.

### 9. Prove framework portability

Since the whole series is about framework-agnostic design systems, Part 3 should prove it with tiny consumer examples:

```text
examples/
  vanilla/
  react/
  vue/
  svelte/
```

Each example only needs to show:

- Importing tokens and component CSS
- Registering/importing the web components
- Rendering a few components
- Passing props/attributes
- Listening for events if any component emits them

React will probably need a tiny bit of extra explanation, because of course it will.

### 10. End with a finished system

The final repository shape should look roughly like this:

```text
my-ds/
  docs/
    .vitepress/
    foundations/
    components/
  packages/
    components/
      src/
      dist/
      custom-elements.json
    tokens/
      src/
      dist/
  examples/
    vanilla/
    react/
    vue/
    svelte/
  scripts/
    generate-component-docs.mjs
  package.json
```

By the end of Part 3, the design system should be:

- Token-driven
- Themeable
- Documented
- Accessible enough to defend in daylight
- Framework-agnostic
- Publishable
- Deployable
- Small enough to understand
- Solid enough to grow

## Likely series arc

Part 1: Build the component and docs foundation.

Part 2: Make it token-driven and themeable.

Part 3: Turn it into a polished, publishable design system.

That arc feels consistent with the article's central argument: make design system decisions in code, keep components primitive and portable, document as you build, and avoid locking your entire design system inside whatever framework is currently making conference speakers sweat.
