import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { isValidBookmarkletName } from "./lib/bookmarklet-name.js";

const name = process.argv[2];

if (!name) {
  console.error("Usage: bun run scripts/new-bookmarklet.mjs <bookmarklet-name>");
  process.exit(1);
}

if (!isValidBookmarkletName(name)) {
  console.error("Bookmarklet name must be kebab-case");
  process.exit(1);
}

const bookmarkletDir = path.join(process.cwd(), "src", "bookmarklets", name);

if (existsSync(bookmarkletDir)) {
  console.error(`Directory already exists: ${bookmarkletDir}`);
  process.exit(1);
}

await mkdir(bookmarkletDir, { recursive: true });

await writeFile(
  path.join(bookmarkletDir, "index.js"),
  makeIndexTemplate(name),
  "utf8",
);

await writeFile(
  path.join(bookmarkletDir, "README.md"),
  makeReadmeTemplate(name),
  "utf8",
);

console.log(`Created ${path.relative(process.cwd(), bookmarkletDir)}`);

/**
 * Generates a compliant bookmarklet entry scaffold that uses Shadow DOM and DOM API-only UI creation.
 */
function makeIndexTemplate(bookmarkletName) {
  const hostId = `${bookmarkletName}-host`;

  return [
    'import { ensureShadowHost, removeShadowHost } from "../../shared/dom/shadow-root.js";',
    'import { upsertStyle } from "../../shared/dom/style-text.js";',
    "",
    `const HOST_ID = \"${hostId}\";`,
    "",
    "(function run() {",
    "  if (removeShadowHost(HOST_ID)) {",
    "    return;",
    "  }",
    "",
    "  const { root } = ensureShadowHost({ id: HOST_ID });",
    "",
    "  upsertStyle(",
    "    root,",
    '    "base",',
    "    `",
    "      *, *::before, *::after { box-sizing: border-box; }",
    "      .panel {",
    "        position: fixed;",
    "        top: 16px;",
    "        right: 16px;",
    "        z-index: 2147483647;",
    '        font: 13px/1.4 -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif;',
    "        background: #fff;",
    "        color: #111;",
    "        border: 1px solid #d4d4d4;",
    "        border-radius: 10px;",
    "        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);",
    "        padding: 12px;",
    "      }",
    "      .title { font-weight: 600; margin-bottom: 4px; }",
    "      .meta { color: #555; }",
    "    `,",
    "  );",
    "",
    '  const panel = document.createElement("div");',
    '  panel.className = "panel";',
    '  const title = document.createElement("div");',
    '  title.className = "title";',
    `  title.textContent = \"${bookmarkletName}\";`,
    '  const meta = document.createElement("div");',
    '  meta.className = "meta";',
    '  meta.textContent = "Replace this scaffold with real behavior.";',
    "  panel.append(title, meta);",
    "",
    "  root.appendChild(panel);",
    "})();",
    "",
  ].join("\n");
}

/**
 * Creates a minimal local README scaffold so each bookmarklet carries operational context.
 */
function makeReadmeTemplate(bookmarkletName) {
  return `# ${bookmarkletName}

## Purpose

Describe what this bookmarklet does.

## Trigger

Describe one-shot/toggle/interactive behavior.

## Target Context

Generic or site-specific target.

## Assumptions

List key assumptions.

## Known Limitations

List practical limitations.

## Maintenance Notes

Capture local details that should remain local unless reuse is proven.
`;
}
