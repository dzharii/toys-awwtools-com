To understand how to create web design, see. This is optional, for inspiration only, no need to strictly follow, use your best judgement: ./web-design.md
Read this, so your web design and CSS is creative and does not look like ass: ./frontend-design.md

A00 Introduction for Codex

We are building a JavaScript-only browser tool for discovering useful page objects and generating reliable selectors from a live web page.

The tool should run as a self-contained bookmarklet-style script. The user can execute it from a browser bookmarklet or paste the final bundled script into the browser console. The first production artifact is not a packaged browser extension. It is a readable, non-minified, non-mangled JavaScript bundle that injects a temporary UI into the current page.

The purpose of the tool is to reduce friction when creating browser automation. A user should be able to open a web application, run the tool, select a region or element visually, and export structured JSON describing useful page objects. That JSON can later be used to generate Playwright, Puppeteer, Selenium WebDriver, or custom automation code.

B00 Problem being solved

Browser automation usually starts with manual DOM inspection. The user opens DevTools, searches through deeply nested nodes, copies a CSS selector or XPath, and later discovers that the selector is brittle. Modern web apps make this worse because important controls are often implemented with generic divs, spans, generated class names, icon-only buttons, virtualized lists, and custom accessibility patterns.

The tool should reduce that manual work. It should identify what matters on the page: controls, regions, repeated collections, and assertable content. It should then suggest selectors that are scoped, explainable, and less brittle than selectors copied directly from DevTools.

This is not a generic DOM scraper. It is a UI meaning extractor with selector synthesis.

C00 Product value

The user wants to move quickly from "this thing on the screen matters for automation" to "I have a useful page-object description for it".

The tool creates value in three ways.

First, it reduces selection friction. The user can click an element or drag a rectangle over a meaningful area, such as a chat composer, sidebar, modal, transcript, or navigation bar.

Second, it improves selector quality. The tool should rank selector candidates using heuristics such as stable attributes, accessibility metadata, region scoping, repeated-structure detection, and generated-token avoidance.

Third, it exports implementation-neutral page-object data. The output should not be hardcoded to Playwright, Puppeteer, or Selenium. It should describe the page objects and selectors in JSON so code generation can happen later.

D00 Expected user experience

When the user runs the bookmarklet, a small floating panel appears on the page. The panel must not block normal page inspection. It should be draggable or compact enough to stay out of the way.

The panel should expose the core actions: scan page, select element, select area, view selected objects, test selector, export JSON, and close.

In element selection mode, the user moves the pointer over the page. The tool highlights the nearest meaningful candidate. If the pointer is over a span inside a button, the button should be highlighted instead of the span.

In area selection mode, the user drags a rectangle over part of the page. The tool analyzes that region and highlights meaningful candidates inside it. The rectangle is a scoping hint, not a request to dump every DOM node inside the area.

When the user selects something, the details panel should show inferred type, confidence, preferred selector, alternative selectors, match count, selector score, selector heuristic, and explanation.

E00 Core object model

The tool should model the page using four primary object kinds: region, control, collection, and content.

A region is a meaningful area of the page, such as a composer, transcript, sidebar, navigation bar, toolbar, modal, form, header, footer, panel, or main content area.

A control is an interactable target, such as a button, link, input, textarea, editable field, combobox, tab, toggle, menu trigger, file input, or row action.

A collection is a repeated set of similar items, such as message items, conversation rows, navigation entries, search results, menu items, cards, or table-like rows.

Content is non-interactive but useful for assertions, such as message body, sender, timestamp, title, label, badge, status text, error text, or toast text.

F00 Most important design principle

Prefer region-first modeling.

A good page object is often not a single global selector. It is a stable region plus local child selectors. For example, a send button should usually be modeled as a child of the composer region. A message body should usually be modeled as a child of a message item. A sidebar link should usually be modeled inside a sidebar or navigation region.

This hierarchy matters because it reduces selector brittleness. "Button inside composer" is usually more stable than "the third button at the bottom of the page".

G00 Selector heuristics

The tool must support selectable selector optimization heuristics.

The tool should choose a default heuristic automatically, but the user must be able to change it. In the selected-object details panel, show a heuristic dropdown. The dropdown should be searchable. When the user selects another heuristic, regenerate selectors immediately and update the preferred selector, score, match count, and explanation.

Initial selector optimization heuristics should include stable attributes first, region-scoped semantic selector, accessible role and name, short unique CSS, resilient CSS path, text-anchored selector, collection item selector, parent-child relative selector, XPath relational fallback, and manual selector.

Manual selector mode matters. If the user edits the selector text, mark it as manual and validate it without overwriting it unless the user explicitly reruns a heuristic.

H00 Discovery heuristics

The tool should find automation-relevant objects using multiple heuristics, not one rule.

Initial discovery heuristics should include native interactables, ARIA interactables, editable targets, event-like controls, landmark regions, visual regions, chat composer, chat transcript, repeated collections, navigation clusters, modal surfaces, and assertable content.

These heuristics should be implemented as independent, testable functions where practical. The overlay UI should consume heuristic results; it should not contain the core inference logic.

I00 Chat-specific target behavior

The sample target experience is a chat application because it exercises most important object types.

For a chat composer, the tool should detect an editable field grouped with nearby actions such as send, attach, emoji, formatting, or submit. The send button may be icon-only, so the tool must not rely only on visible text.

For a transcript, the tool should detect a scrollable region with repeated message-like blocks. The correct model is transcript region plus message-item collection, not a single static message node.

For a message item, the tool should try to identify body, sender, timestamp, reaction area, and overflow menu when possible.

For a sidebar, the tool should distinguish between generic navigation and conversation-list rows when possible. Rows with title, preview, avatar, unread badge, or timestamp-like metadata are likely conversation rows.

J00 JSON export

The exported JSON must represent selected page objects and selector metadata.

At minimum, include page metadata, tool version, URL, title, timestamp, viewport size, and an array of objects.

Each object should include id, name, kind, inferredType, confidence, preferred selector, selector type, selector score, selector heuristic id, alternative selectors, bounding rectangle, explanation, parent id, children, and collection metadata where relevant.

For collections, include item selector, item selector score, sample count, virtualization suspected flag, and item child selectors when detected.

K00 Technical structure

Use Bun for development scripts and tests. Bun is available in the environment.

The source may be modular, but the final distribution must be a single readable JavaScript file.

Suggested structure:

```text
src/entry.js
src/overlay.js
src/scanner.js
src/features.js
src/heuristics.js
src/regions.js
src/selectors.js
src/export.js
src/utils.js
test/*.test.js
examples/chat.html
dist/bookmarklet.js
dist/bookmarklet-url.txt
```

The final bundle must not require runtime dependencies or network access. It should inject its own styles and UI.

L00 Testing expectations

Use `bun test`.

Prioritize unit tests for pure logic: feature extraction, interactable classification, region inference, selector generation, selector scoring, generated-token detection, collection detection, naming, and JSON serialization.

Create at least one manual sample page at `examples/chat.html`. It should contain a left sidebar, conversation rows, transcript, repeated message items, composer, editable input, attach button, and send button.

The sample page should contain both good selector signals, such as `data-testid` and `aria-label`, and bad selector signals, such as generated-looking class names. This lets selector ranking be tested manually and partially by unit tests.

M00 Implementation priority

Build a vertical slice first.

The first usable version should inject the overlay, scan the visible DOM, highlight candidates on hover, allow element selection, allow rectangle selection, show selector candidates, allow selector testing, and export JSON.

After that, improve region detection.

After that, improve chat-specific heuristics.

After that, improve selector scoring and explanations.

After that, improve collection detection.

After that, polish the UI and add more examples.

Do not start by building a large framework. The first goal is a working bookmarklet that can inspect the sample chat page and export useful JSON.

N00 Acceptance criteria

Running `bun test` should pass.

Running the build script should produce `dist/bookmarklet.js`.

Pasting `dist/bookmarklet.js` into the browser console on `examples/chat.html` should open the overlay.

The tool should detect and highlight meaningful controls.

Dragging over the composer should produce composer, message input, and send-button candidates.

Dragging over the transcript should produce transcript and message collection candidates.

Dragging over the sidebar should produce sidebar or conversation-list candidates.

The exported JSON should include selectors, hierarchy, confidence, heuristic ids, and explanations.

The preferred selector should avoid brittle absolute XPath when a better CSS or scoped selector exists.

O00 Non-goals for the first version

Do not implement server communication.

Do not call an LLM.

Do not package a browser extension.

Do not implement browser-level integration tests yet.

Do not support closed shadow DOM.

Do not attempt perfect accessibility-tree reconstruction.

Do not optimize for visual polish before the core selection and export flow works.

P00 Final implementation intent

The tool succeeds when a user can visually mark something on a page and quickly obtain a page-object description that is useful for automation.

The result should help the user answer three questions: what is this object, how should I select it, and why is this selector better than the alternatives.
