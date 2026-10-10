# The Prompt Menu

A self-contained technical prompt constructor, preset for an integer min-heap in C. It uses a white menu, outlined pictograms, three explanation cards, rounded segmented choices, explicit illustration contracts, and checklists. A floating live preview shows changes while you choose; independent editable clones protect your own drafts.

Open `index.html` in a browser. The app has no runtime dependencies, build requirement, backend, API key, account, CDN, external font, or automatic network requests. Copy the generated prompt into your preferred assistant. Open ChatGPT is an ordinary external link; the app cannot submit to the original chat.

## Publish on your server

Upload this directory to the document root or any subdirectory of a static web server. `index.html` includes all JavaScript, CSS, and SVG assets. Publishing only `index.html` runs the entire constructor; publish the Markdown documents and examples alongside it to retain its documentation links. Publish `prompt_menu_social_site/` as well to retain social-preview artwork. Never upload your private exported settings unintentionally.

The maintained HTML template includes the supplied social title, description, Open Graph image, and X/Twitter large-card image from `prompt_menu_social_site/`. The canonical page and crawler image URLs target `https://toys.awwtools.com/public/2026-10-09-chatgpt-prompt-menu-for-break-down-prompts/`. If hosting elsewhere, update those absolute URLs in `src/template.html` before rebuilding. The artwork is fetched by social crawlers, not automatically loaded by the application.

For a local HTTP preview:

```sh
cd prompt-menu
python3 -m http.server 8080
```

Visit `http://localhost:8080`. Stop the server with Ctrl+C. HTTPS or localhost improves availability of the modern clipboard API. A file opened directly still works; clipboard fallback selects the prompt if browser copying is unavailable. Local file storage policies vary by browser. Export/import is the portable way to keep configurations.

## Using the menu

Edit the assignment and, if needed, expand "What have you already decided?". Choose Why-first, Code-first, or Trace-first, then set verbosity, depth, assumed knowledge, and intellectual compression independently. Configure visuals, code deliverable, focus areas, exclusions, and special instructions. The prompt updates immediately.

The default is Why-first, Focused, Deep, Fluent in C, Dense, purposeful diagrams, and a complete single-file C11 program. Five focus areas are selected. All six exclusions are checked, including no quizzes, elementary lessons, repetitive explanations, artificial recaps, decorative illustrations, or line-by-line narration. Unchecking an exclusion removes a prohibition; it does not request the excluded content. Complete code remains required even with Compact selected.

| Preset | Intended use | Key settings |
| --- | --- | --- |
| Technical insight | Understand the non-obvious decisions | Why-first, focused prose, deep reasoning, fluent C, dense compression |
| Implementation review | Review correctness and failure handling | Code-first, rigorous depth, systems knowledge, minimal scaffolding, library files, no diagrams |
| Algorithm walkthrough | Inspect the mechanics | Trace-first, expanded prose, deep reasoning, guided compression, detailed labeled state transitions |

Presets are visible compact tiles, each with its own pictogram and plain-language summary. Hover or focus previews a tile without applying it; selecting applies it and leaves its explanation visible. The panel shows the actual answer structure, reasoning style, code deliverable, and visual mode. It sits beside the tiles in a wide menu, below the grid at medium sizes, and directly after the inspected tile on phones. Checkmarks, borders, and checked native radios identify the active choice. Radio arrow keys select presets; touch users tap a tile.

Custom settings means your current mix, not a saved earlier configuration. Selecting it keeps the current values. Any individual menu edit activates it automatically. The wrapping tile list grows from preset definitions rather than hiding extra options in a horizontal carousel.

Presets preserve your assignment, established decisions, and special instructions. Reset settings restores the default menu configuration, including the default assignment and empty special instructions. Neither action changes your prompt clones or preview preferences; reset also retains the browser-saving preference.

Both generated views are always read-only. On wide screens the preview occupies a reserved right-hand lane, and the menu starts near the left edge. It stays visible while the page scrolls and disappears when the bottom generated textarea is readable. On narrow screens it starts as a vertical tab; expand it explicitly when needed.

Drag the preview title, resize any edge/corner, maximize/restore, return to the right dock, or collapse to the vertical tab. The title's arrow keys move it; a focused resize handle's arrow keys resize it; Shift takes larger steps. Escape collapses it. Select text or use Ctrl+A / Command+A within the preview to select the full prompt. Its footer controls highlighting, follow-scroll, text size, and automatic hiding. New words get a quiet, temporary highlight; the latest update summary and expandable old paragraph context explain changes/removals. Reduced-motion preferences suppress animated fading.

Clone and edit copies the current generated prompt into a new timestamped editor below it. Repeat to keep multiple independent versions. Rename, edit, copy, download, or delete each clone separately; deletion requires confirmation. No menu update, preset, reset, or import overwrites a clone. Generated Copy/Download always use generated text; clone actions use that clone's text.

Remember settings is opt-in. It stores settings, clones, and preview preferences only in this browser's localStorage under `technical-prompt-menu.v1`; window geometry lasts only for the page session. Unchecking removes that saved workspace but keeps the current page's drafts. Saving failures are reported, and unsaved clones trigger a navigation/reload warning. Export settings keeps the entire workspace. Import validates versioned JSON before applying settings and appends imported clones with new IDs, preserving existing drafts. Imported files do not turn on saving. Legacy non-null `manualPrompt` text is recovered as an editable clone.

Malformed, unknown-option, and oversized imports are rejected without replacing the current configuration. The import limit is 1 MB; individual clone text is limited to 100,000 characters. There is no UI clone-count limit, but browser storage quotas still apply. An oversized export is downloaded with an explicit portability warning; use individual text downloads as well. Unknown object properties are ignored; missing optional fields use defaults.

Special instructions are included verbatim. The app cannot determine whether they contradict other instructions and flags that responsibility in the preview. The controls are plain-language preferences, not API settings or guaranteed model behavior.

## Files and implementation

| Path | Purpose |
| --- | --- |
| `index.html` | Ready to publish, self-contained application |
| `src/template.html` | Editable semantic HTML and inline SVG drawings |
| `src/app.css` | Design tokens, component styling, responsive and print rules |
| `src/prompt-core.js` | Options, defaults, presets, settings/workspace validation, prompt construction, bounded word diff |
| `src/app.js` | DOM controls, floating preview, clone editors, clipboard, downloads, local saving, workspace import/export |
| `build.mjs` | Dependency-free builder for the single HTML file and full example outputs |
| `tests/core.test.cjs` | Prompt and schema regression checks with Node's built-in test runner |
| `tests/static.test.cjs` | Packaging and static integration checks |
| `tests/interaction.test.cjs` | Event/state checks using a minimal DOM adapter; not browser rendering tests |
| `tests/browser.test.cjs` | Real Playwright Chromium interaction, viewport, keyboard, clipboard, download, and screenshot checks |
| `examples/` | Three complete prompts and their importable configurations |
| `prompt_menu_social_site/` | Supplied social descriptions and PNG artwork; OG and X images are referenced by the application metadata |
| `SPECIFICATION.md` | Product/design framework, original user concerns, traceability, behavior, and full examples |
| `CHANGE_REQUEST.md` | Explicit live-preview and clone UX checklist, invariants, added conventions, and acceptance criteria |
| `CHANGE_REQUEST_PRESET_TILES.md` | Understandable preset tiles, interactive explanations, responsive layout decisions, and extension rule |
| `references/ORIGINAL_REQUEST.md` | Rephrased source complaint and task, preserving specific details |
| `references/RESEARCH.md` | Consulted primary sources and design interpretation |
| `references/screenshots/` | Seven supplied visual references |
| `VALIDATION.md` | Verification performed and its limits |

The app keeps one validated settings object. `buildPrompt(state)` is a pure function. The browser uses that same function as the build script and examples. The output order is Task, Already established, Audience, Explanation settings, Response structure, Code deliverable, Visualization contract, Focus, Avoid, Quality standard, and optional Special instructions. Empty optional sections are omitted. Generated instructions use ordinary paragraphs, with no restaurant terminology or invented numeric tuning parameters.

Only fixed application strings are used to build controls. User-provided assignment, imported strings, and authored clone text are inserted as text or textarea values, never parsed as HTML. There are no analytics, fetch calls, service workers, URL-encoded prompts, or server submissions. Browser storage and exports can contain private task text; their retention is controlled by the user.

Radio groups use native inputs inside labels and fieldsets. Keyboard users can tab to groups and use arrow keys; Space toggles checkboxes. Focus indicators, selection checkmarks, semantic headings, an SVG text alternative, concise status announcements, responsive wrapping, and reduced-motion handling are included. The illustrations on the three cards are navigation pictograms, not algorithm traces. Why-first's connectors stop at the node boundaries; Trace-first's arrows have a clear neutral gap. The heap illustration's green root indicates the minimum; it is a static valid heap, not an active step animation.

## Edit and rebuild

Use Node.js 18 or newer, then:

```sh
node build.mjs
node --test tests/core.test.cjs tests/static.test.cjs tests/interaction.test.cjs
```

For real browser checks, use an installed Playwright package and Chromium:

```powershell
node --test tests\browser.test.cjs
```

The browser suite uses local Playwright if available, otherwise the standard Windows global npm installation. For another installation, set `PLAYWRIGHT_MODULE_PATH` to the absolute path to its `package.json`. Set `PROMPT_MENU_SCREENSHOTS` to a directory to capture whole-page and detailed screenshots. The suite starts and closes its own loopback server; it does not deploy or leave processes running.

The builder reads local sources and writes `index.html` plus all six example files. It does not install packages or contact external services. Edits directly in generated `index.html` are overwritten by the next build; edit `src/` instead. To change labels and generated instruction wording, update `src/prompt-core.js`. To change illustration shapes, edit SVGs in `src/template.html`. CSS tokens at the top of `src/app.css` control the neutral surfaces, text colors, green accent, and spacing.

For a strict Content Security Policy, serve the three JavaScript/CSS source files externally and change the template accordingly, or authorize exact hashes for the embedded blocks. A policy that prohibits all inline scripts will prevent the delivered single-file build from running. No `eval` or inline event-handler attributes are used.

## Research and source fidelity

The closest verified public OpenAI design reference is the optional `@openai/apps-sdk-ui` component library and the accompanying UI guidelines. This implementation uses plain HTML/CSS instead of that dependency, translating its documented visual principles for a portable standalone page. It is an independent project, not an official OpenAI framework or product.

The visible conversation supplied Why-first and Code-first SVG snippets; those drawings informed the initial implementation. The current version repairs the reported Why-first connector layout and Trace-first arrow treatment. The complete earlier app source, styling, and state logic were not supplied. All remaining source was reconstructed from the visible text and screenshots, with additions documented in the specification and change request. Visual similarity is a design target, not a claim of source-identical reproduction.

The source complaint and implementation request are preserved in `references/ORIGINAL_REQUEST.md`. Full generated examples are in `examples/` and reproduced in the specification. The session's change requests describe the revised behavior and supersede the baseline's mixed manual/generated edit model. Primary-source links and retrieval dates are in `references/RESEARCH.md`. See `VALIDATION.md` for the current Node and real-browser checks, whole-page screenshot review, and remaining limits.
