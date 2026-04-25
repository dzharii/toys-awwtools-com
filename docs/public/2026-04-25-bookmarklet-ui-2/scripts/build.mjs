import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

function arg(name, fallback = "") {
  const token = `--${name}`;
  const idx = process.argv.indexOf(token);
  if (idx === -1) return fallback;
  return process.argv[idx + 1] ?? fallback;
}

const mode = arg("mode", "development");

const root = process.cwd();
const outdir = join(root, "dist");

const distReadme = `# AWW Bookmarklet UI Framework - distributable

This folder is the copyable build for implementers. The runtime framework is bundled into \`bookmarklet/index.js\` as one readable ES module file.

The build intentionally does not minify or mangle names in any mode. Treat \`bookmarklet/index.js\` as a single-file distribution artifact that still preserves as much of the original source shape as the bundler allows.

## Files

- \`bookmarklet/index.js\`: copyable runtime bundle. Import this from another page, extension, or bookmarklet loader.
- \`demo/catalog.js\`: demo-only bundle used by this project's \`demo/index.html\`.
- \`README.md\`: this implementer reference.

For a downstream project, copy the whole \`dist/\` folder when you want the demo helper too, or copy only \`dist/bookmarklet/index.js\` when you only need the runtime.

## Quick start

Load the runtime as an ES module, build content with the exported tag names, and mount a window into the shared desktop overlay.

\`\`\`html
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
  panel.innerHTML = "<span slot=\\"title\\">Capture</span><p>Reusable tool content.</p>";

  const win = createWindow({ title: "Capture Tool", content: panel });
  mountWindow(win, { ownerPrefix: "capture-tool" });
</script>
\`\`\`

## Bookmarklet or injected-script usage

Importing \`bookmarklet/index.js\` registers every bundled web component and exposes two global aliases:

- \`globalThis.awwtools.bookmarkletUi\`
- \`globalThis.awwbookmarklet\`

Those aliases are useful when a bookmarklet loader injects the module once and later code needs to reuse the same API.

\`\`\`js
const ui = globalThis.awwbookmarklet;
const win = ui.createWindow({ title: "Injected Tool" });
ui.mountWindow(win);
\`\`\`

## Main workflow

1. Import from \`./dist/bookmarklet/index.js\`.
2. Call \`createWindow({ title, content })\` to create an unmounted \`awwbookmarklet-window\`.
3. Call \`mountWindow(windowElement, { ownerPrefix })\` to attach it to the overlay root.
4. Listen for normal DOM events from your own controls and for framework events such as \`awwbookmarklet-window-closed\` when cleanup matters.
5. Call \`shutdownAll()\` only when your host needs to remove every active framework root.

Use \`openBookmarkletWindow(builder)\` when you want a one-call build-and-mount helper. Use \`mountWindow()\` when your app assembles content first.

## Available functionality

- Floating desktop root and movable/resizable windows.
- Menus, menubars, toolbars, panels, groups, cards, fields, status bars, alerts, dialogs, toasts, tabs, lists, listboxes, rich previews, browser panels, URL pickers, command palettes, shortcut help, and form controls.
- Theme tokens exposed through \`PUBLIC_TOKENS\`, \`setTheme()\`, \`ThemeService\`, and \`defaultThemeService\`.
- Shared Shadow DOM styling helpers exposed as \`styles.css\`, \`styles.base\`, and \`styles.adoptStyles()\`.
- Command registry, geometry helpers, URL helpers, HTML sanitizing, clipboard helpers, and toast helpers.

## Public API map

- Use \`TAGS\` to create bundled components without hard-coded tag strings.
- Use \`PUBLIC_TOKENS\` and \`setTheme()\` for runtime theming.
- Use \`defineComponent()\` for custom \`awwbookmarklet-*\` web components.
- Use \`styles.css\`, \`styles.base\`, and \`styles.adoptStyles()\` to share the base reset/focus/selection rules in custom Shadow DOM components.
- Use \`CommandRegistry\`, URL helpers, \`sanitizeHtml()\`, and clipboard/toast helpers for common tool behavior.

## Custom components

Custom component names must start with \`awwbookmarklet-\`. Register them through the exported \`defineBookmarkletComponent()\` function or the global \`defineComponent()\` alias so registration stays idempotent.

\`\`\`js
class AwwBookmarkletResultList extends HTMLElement {
  connectedCallback() {
    if (!this.shadowRoot) {
      const root = this.attachShadow({ mode: "open" });
      globalThis.awwbookmarklet.styles.adoptStyles(root, [
        globalThis.awwbookmarklet.styles.base,
        globalThis.awwbookmarklet.styles.css\`
          :host {
            display: block;
            padding: var(--awwbookmarklet-space-2, 8px);
          }
        \`
      ]);
      root.innerHTML = "<slot></slot>";
    }
  }
}

globalThis.awwbookmarklet.defineComponent(
  "awwbookmarklet-result-list",
  AwwBookmarkletResultList
);
\`\`\`

## Theming

Pass public token keys to \`setTheme()\`. The service stores the merged theme and applies it to the active desktop root by default.

\`\`\`js
import { PUBLIC_TOKENS, setTheme } from "./dist/bookmarklet/index.js";

setTheme({
  [PUBLIC_TOKENS.windowBg]: "#f4f7fb",
  [PUBLIC_TOKENS.selectionBg]: "#175a9c",
  [PUBLIC_TOKENS.focusRing]: "#0f62fe"
});
\`\`\`

## Design system notes

The visual direction is a compact desktop utility system: square controls, explicit borders, restrained shadows, dense layout, and high-contrast system states. Avoid unrelated rounded card stacks, decorative gradient heroes, glass effects, and oversized SaaS spacing when extending the kit.

Keep custom controls keyboard reachable, expose labels through native labels or ARIA, and preserve visible \`:focus-visible\` states. Prefer public CSS tokens over one-off colors so downstream projects can theme the copied bundle consistently.

## Rebuilding this folder

\`\`\`bash
bun run build
bun run build:prod
\`\`\`

Both commands emit readable bundles. \`build:prod\` exists for workflow compatibility, not for minification.
`;

async function runBuild() {
  await rm(outdir, { recursive: true, force: true });
  await mkdir(outdir, { recursive: true });
  console.log(`[build] mode ${mode}; readable single-file bundles`);

  const result = await Bun.build({
    entrypoints: [join(root, "src", "bookmarklet", "index.js"), join(root, "src", "demo", "catalog.js")],
    outdir,
    target: "browser",
    format: "esm",
    splitting: false,
    minify: false,
    sourcemap: "none",
    naming: "[dir]/[name].js",
    write: true
  });

  if (!result.success) {
    for (const log of result.logs) console.error(log);
    process.exitCode = 1;
    return;
  }

  await writeFile(join(outdir, "README.md"), distReadme, "utf8");

  for (const output of result.outputs) {
    console.log(`[build] ${output.path}`);
  }
  console.log(`[build] ${join(outdir, "README.md")}`);
}

runBuild().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
