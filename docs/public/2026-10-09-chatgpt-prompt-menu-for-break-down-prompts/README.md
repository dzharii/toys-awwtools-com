# The Prompt Menu

A self-contained technical prompt constructor, preset for an integer min-heap in C. It recreates the supplied seven-screen interface: a white single-column page, outlined pictograms, three explanation cards, rounded segmented choices, explicit illustration contracts, checklists, and a full prompt preview.

Open `index.html` in a browser. The app has no runtime dependencies, build requirement, backend, API key, account, CDN, external font, or automatic network requests. Copy the generated prompt into your preferred assistant. Open ChatGPT is an ordinary external link; the app cannot submit to the original chat.

## Publish on your server

Upload this directory to the document root or any subdirectory of a static web server. `index.html` includes all JavaScript, CSS, and SVG assets. Publishing only `index.html` runs the entire constructor; publish the Markdown documents and examples alongside it to retain its documentation links. Never upload your private exported settings unintentionally.

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

Presets preserve your assignment, established decisions, and special instructions. They rebuild the output and replace any manual prompt edits. Reset settings restores the entire default configuration, including the default assignment and empty special instructions; it retains the browser-saving preference.

Edit prompt lets you customize the complete output. Finish editing makes it read-only again. Subsequent setting changes leave that customized text intact and show a notice. Rebuild from settings replaces the custom text with the current generated prompt. Copy and Download .txt always use the displayed text. The badges describe the controls; manually edited text can differ from those controls.

Remember settings is opt-in. It stores the assignment, choices, and any manual prompt only in this browser's localStorage under `technical-prompt-menu.v1`. Unchecking removes that saved configuration. A failure to save or remove is reported in the page. Import/export uses versioned JSON and includes manually edited text. Imported settings do not turn on browser saving. Malformed, unknown-option, and oversized imports are rejected without replacing the current configuration. Unknown object properties are ignored; missing optional fields use defaults.

Special instructions are included verbatim. The app cannot determine whether they contradict other instructions and flags that responsibility in the preview. The controls are plain-language preferences, not API settings or guaranteed model behavior.

## Files and implementation

| Path | Purpose |
| --- | --- |
| `index.html` | Ready to publish, self-contained application |
| `src/template.html` | Editable semantic HTML and inline SVG drawings |
| `src/app.css` | Design tokens, component styling, responsive and print rules |
| `src/prompt-core.js` | Shared option definitions, defaults, presets, input validation, deterministic prompt construction |
| `src/app.js` | DOM controls, preview editing, clipboard, downloads, local saving, settings import/export |
| `build.mjs` | Dependency-free builder for the single HTML file and full example outputs |
| `tests/core.test.cjs` | Prompt and schema regression checks with Node's built-in test runner |
| `tests/static.test.cjs` | Packaging and static integration checks |
| `tests/interaction.test.cjs` | Event/state checks using a minimal DOM adapter; not browser rendering tests |
| `examples/` | Three complete prompts and their importable configurations |
| `SPECIFICATION.md` | Product/design framework, original user concerns, traceability, behavior, and full examples |
| `references/ORIGINAL_REQUEST.md` | Rephrased source complaint and task, preserving specific details |
| `references/RESEARCH.md` | Consulted primary sources and design interpretation |
| `references/screenshots/` | Seven supplied visual references |
| `VALIDATION.md` | Verification performed and its limits |

The app keeps one validated settings object. `buildPrompt(state)` is a pure function. The browser uses that same function as the build script and examples. The output order is Task, Already established, Audience, Explanation settings, Response structure, Code deliverable, Visualization contract, Focus, Avoid, Quality standard, and optional Special instructions. Empty optional sections are omitted. Generated instructions use ordinary paragraphs, with no restaurant terminology or invented numeric tuning parameters.

Only fixed application strings are used to build controls. User-provided assignment, imported strings, and manual prompt edits are inserted as text or textarea values, never parsed as HTML. There are no analytics, fetch calls, service workers, URL-encoded prompts, or server submissions. Browser storage and exports can contain private task text; their retention is controlled by the user.

Radio groups use native inputs inside labels and fieldsets. Keyboard users can tab to groups and use arrow keys; Space toggles checkboxes. Focus indicators, selection checkmarks, semantic headings, an SVG text alternative, status announcements, responsive wrapping, and reduced-motion handling are included. The illustrations on the three cards are navigation pictograms, not algorithm traces. The heap illustration's green root indicates the minimum; it is a static valid heap, not an active step animation.

## Edit and rebuild

Use Node.js 18 or newer, then:

```sh
node build.mjs
node --test tests/*.test.cjs
```

The builder reads local sources and writes `index.html` plus all six example files. It does not install packages or contact external services. Edits directly in generated `index.html` are overwritten by the next build; edit `src/` instead. To change labels and generated instruction wording, update `src/prompt-core.js`. To change illustration shapes, edit SVGs in `src/template.html`. CSS tokens at the top of `src/app.css` control the neutral surfaces, text colors, green accent, and spacing.

For a strict Content Security Policy, serve the three JavaScript/CSS source files externally and change the template accordingly, or authorize exact hashes for the embedded blocks. A policy that prohibits all inline scripts will prevent the delivered single-file build from running. No `eval` or inline event-handler attributes are used.

## Research and source fidelity

The closest verified public OpenAI design reference is the optional `@openai/apps-sdk-ui` component library and the accompanying UI guidelines. This implementation uses plain HTML/CSS instead of that dependency, translating its documented visual principles for a portable standalone page. It is an independent project, not an official OpenAI framework or product.

The visible conversation supplied the exact Why-first and Code-first SVG snippets; their drawing markup is retained. The complete earlier app source, styling, and state logic were not supplied. All remaining source was reconstructed from the visible text and screenshots, with the additions documented in the specification. Visual similarity is a design target, not a claim of source-identical reproduction.

The source complaint and implementation request are preserved in `references/ORIGINAL_REQUEST.md`. Full generated examples are in `examples/` and reproduced in the specification. Primary-source links and retrieval dates are in `references/RESEARCH.md`. See `VALIDATION.md` for actual checks and the absence of browser visual verification in the creation environment.
