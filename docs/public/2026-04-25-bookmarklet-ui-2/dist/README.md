# AWW Bookmarklet UI Framework - distributable

This folder is the copyable runtime build. Copy `dist/` into another project and load `bookmarklet/index.js` as an ES module.

## Browser usage

```html
<script type="module">
  import {
    createWindow,
    mountWindow,
    setTheme,
    TAGS,
    PUBLIC_TOKENS
  } from "./dist/bookmarklet/index.js";

  setTheme({
    [PUBLIC_TOKENS.selectionBg]: "#175a9c"
  });

  const panel = document.createElement(TAGS.panel);
  panel.innerHTML = "<span slot=\"title\">Capture</span><p>Reusable tool content.</p>";

  const win = createWindow({ title: "Capture Tool", content: panel });
  mountWindow(win, { ownerPrefix: "capture-tool" });
</script>
```

## Global usage

Loading `bookmarklet/index.js` also registers all components and exposes `globalThis.awwtools.bookmarkletUi` and the shorter `globalThis.awwbookmarklet` alias.

```js
const ui = globalThis.awwbookmarklet;
const win = ui.createWindow({ title: "Injected Tool" });
ui.mountWindow(win);
```

## Extension points

- Use `TAGS` to create bundled components without hard-coded tag strings.
- Use `PUBLIC_TOKENS` and `setTheme()` for runtime theming.
- Use `defineComponent()` for custom `awwbookmarklet-*` web components.
- Use `styles.css`, `styles.base`, and `styles.adoptStyles()` to share the base reset/focus/selection rules in custom Shadow DOM components.
- Use `CommandRegistry`, URL helpers, `sanitizeHtml()`, and clipboard/toast helpers for common tool behavior.

## Design system notes

The visual direction is a compact desktop utility system: square controls, explicit borders, restrained shadows, dense layout, and high-contrast system states. Avoid unrelated rounded card stacks, decorative gradient heroes, glass effects, and oversized SaaS spacing when extending the kit.

Keep custom controls keyboard reachable, expose labels through native labels or ARIA, and preserve visible `:focus-visible` states. Prefer public CSS tokens over one-off colors so downstream projects can theme the copied bundle consistently.
