A01 Specification for Codex: browser bookmarklet for page-object discovery

This project creates a JavaScript-only browser tool that helps an automation engineer turn a live web page into page-object metadata. The tool runs inside the current page, inspects the DOM, highlights meaningful UI controls and regions, suggests stable selectors, and exports structured JSON that can later be used to generate Playwright, Puppeteer, Selenium, or custom automation code.

The first deliverable is not a browser extension. It is a self-contained bookmarklet-style JavaScript bundle that can also be pasted into the browser console. The distributed output must be readable, non-minified, non-mangled JavaScript. Source code may be split into modules during development and bundled into one final script.

B01 Product purpose

Users want to reduce the friction of creating reliable page objects for browser automation.

When a user opens a web app and wants to automate it, they usually inspect the DOM manually, copy a selector, discover that it is brittle, and repeat. This tool should reduce that work by identifying likely automation targets and proposing better selectors.

The tool is valuable because modern web apps often contain thousands of DOM nodes but only a small number of automation-relevant objects. The user usually cares about controls, regions, and repeated collections: a message input, a send button, a sidebar, a chat transcript, a list of messages, a navigation item, a modal button, or a search box. The tool should help the user find those objects quickly and describe them in a durable way.

The tool should not be a generic DOM dumper. It should be a UI meaning extractor with selector synthesis.

C01 User perspective

A user opens a chat application and runs the bookmarklet. The page receives an overlay. The user can hover over the page and see candidate controls. The user can drag a rectangle over the composer area at the bottom of the chat. The tool recognizes that the area likely contains a composer region, an editable message input, an attach control, and a send button. The user accepts those candidates and exports JSON.

A user opens a page with a left sidebar. The user drags over the sidebar. The tool recognizes a region containing repeated clickable rows. It does not simply say "all links on the page". It scopes the candidates to the selected sidebar area and proposes selectors relative to the sidebar region.

A user opens a chat transcript. The tool identifies the scrollable transcript region and a repeated message-item collection. The user can export a collection model rather than one fixed message node. The exported object describes the message item selector and possible child selectors for sender, body, timestamp, and actions.

A user selects a button. The tool proposes several selectors. It ranks selectors by stability and explains why one selector is better than another. A data-testid selector should outrank a generated class selector. A selector scoped to a stable composer region should outrank a long absolute XPath.

D01 Required output

The tool must export JSON. The JSON must represent page-object candidates, not just raw selectors.

Each exported object must include a stable generated name, object kind, inferred role, confidence, bounding rectangle, preferred selector, alternative selectors, selector explanations, and parent-child relationships when applicable.

Objects must support these primary kinds: region, control, collection, and content.

Regions include composer, transcript, sidebar, navigation, toolbar, modal, form, header, footer, panel, and main.

Controls include button, link, input, textarea, editable, combobox, tab, toggle, menu trigger, file input, and row action.

Collections include message list, conversation list, navigation item list, result list, menu item list, table-like rows, and generic repeated list.

Content includes message body, sender, timestamp, title, label, status, badge, and metadata.

E01 MVP priority

P0 is the usable bookmarklet loop. Codex must first implement the overlay, DOM scan, candidate discovery, visual highlighting, candidate selection, selector generation, and JSON export.

P1 is heuristic quality. After the loop works, improve detection of interactable controls, regions, chat composer, transcript, message collections, navigation, and sidebars.

P2 is selector ranking quality. Improve scoring, selector explanations, scoped selector generation, and collection selector generation.

P3 is polish. Improve UI layout, naming, keyboard shortcuts, sample pages, and edge-case handling.

Do not start with a complex architecture that delays the first usable loop. The first version should be simple, visible, testable, and extensible.

F01 Runtime constraints

The distributed script must be self-contained. It must not load external scripts, stylesheets, fonts, images, or network resources.

The distributed script must inject its own overlay UI and styles. It must avoid interfering with the host page as much as possible. Use a unique namespace for DOM ids, CSS classes, custom events, and globals.

Running the script twice should not duplicate the UI. If the tool is already active, running it again should toggle or reopen the existing tool.

The script must provide a cleanup path that removes overlay elements, event listeners, observers, and temporary state.

G01 Development constraints

Use Bun for scripts and unit tests. Bun is already available.

Source code should be modular. The final bundle should be generated from source files into a single readable JavaScript file.

Use `bun test` for unit tests. Unit tests should focus on pure or mostly pure logic: candidate classification, scoring, selector generation, selector ranking, repeated-structure detection, naming, and JSON serialization.

Do not implement browser-level integration tests yet. Provide manual sample pages instead.

Create at least one sample HTML page that represents a chat-like UI with a sidebar, transcript, message items, composer input, attach button, and send button. This sample page is for manual testing and for unit-test fixtures where practical.

H01 Suggested project shape

Codex should create a small project with source files, tests, examples, and distribution output.

A reasonable structure is:

`src/entry.js` for bookmarklet startup.

`src/overlay.js` for UI injection, panels, highlighting, hover, click, drag selection, and cleanup.

`src/scanner.js` for DOM walking and visible-element extraction.

`src/features.js` for extracting element features.

`src/heuristics.js` for object inference and scoring.

`src/regions.js` for region and collection detection.

`src/selectors.js` for CSS and XPath selector candidates.

`src/export.js` for JSON output.

`src/utils.js` for shared helpers.

`test/*.test.js` for Bun unit tests.

`examples/chat.html` for manual testing.

`dist/bookmarklet.js` for the final readable self-contained script.

`dist/bookmarklet-url.txt` may contain a `javascript:` wrapper version if practical.

I01 Overlay behavior

When activated, the tool should add a floating control panel. The panel should show status, scan results, selected object details, selector candidates, and export controls.

The overlay should support hover highlighting. As the user moves over the page, the nearest meaningful candidate should be outlined. The tool should avoid highlighting every nested span inside a button. It should prefer the meaningful actionable ancestor.

The overlay should support click selection. Clicking a highlighted candidate should pin it in the panel.

The overlay should support drag-area selection. The user can drag a rectangle over a page area. The tool should analyze candidates overlapping that rectangle and promote region-scoped interpretations.

The panel should support copying exported JSON to clipboard. If clipboard access fails, show the JSON in a textarea for manual copy.

J01 Discovery model

The scanner should collect visible elements from the current document.

An element is generally eligible when it is rendered, has a non-empty bounding box, is not hidden, is not disabled or inert, and is not purely decorative.

The scanner should capture native interactables such as button, input, textarea, select, option, anchor with href, summary, label, and form controls.

The scanner should capture custom interactables such as elements with role, tabindex, contenteditable, onclick, keyboard handlers, pointer-like behavior, draggable behavior, or accessible names.

The scanner should capture potential regions such as nav, header, footer, aside, main, section, form, dialog, elements with landmark roles, scrollable containers, and containers with repeated children.

K01 Feature extraction

For every candidate element, compute a feature object.

Features should include tag name, role, type, id, class list, data attributes, aria attributes, name, title, placeholder, alt, href, text snippet, accessible-name-like label, bounding rectangle, visibility, disabled state, contenteditable state, tabindex, child count, parent summary, sibling summary, scrollability, and local text density.

Do not attempt a perfect browser accessibility tree implementation. Use practical approximations based on DOM attributes, labels, associated label elements, aria-label, aria-labelledby, title, placeholder, alt, and visible text.

L01 Control heuristics

The tool should score likely controls using multiple signals.

Native controls receive strong positive weight.

ARIA roles for button, link, textbox, searchbox, combobox, checkbox, radio, tab, menuitem, option, switch, slider, spinbutton, and listbox receive positive weight.

Elements with contenteditable, tabindex, click handlers, keyboard handlers, or clear pointer behavior receive weaker but useful weight.

Elements with accessible labels, placeholders, or short action-like text receive positive weight.

Elements that are tiny, hidden, off-screen, disabled, decorative, or deeply nested inside another stronger control should be downgraded.

M01 Region heuristics

The tool should infer regions when a container groups meaningful controls or content.

A navigation region is likely when a container contains multiple short links, menu items, tabs, or button-like rows.

A sidebar is likely when a region is visually narrow, left or right aligned, vertically structured, and contains repeated navigation or conversation rows.

A toolbar is likely when a compact region contains several adjacent buttons or toggles.

A modal is likely when a high-z-index region, dialog role, backdrop, or focus-like isolation is present.

A form region is likely when labels, inputs, validation text, and action buttons appear together.

A transcript or feed region is likely when a scrollable area contains repeated message-like or content-like blocks.

N01 Chat-specific heuristics

The composer region should be inferred from an editable target plus nearby action controls. Editable targets include textarea, input, contenteditable, role=textbox, and role=searchbox. Nearby action controls include send, attach, emoji, formatting, voice, or submit-like controls.

The send button may be icon-only. Do not rely only on visible text. Use aria-label, title, button role, proximity to composer input, and local grouping.

The transcript region should be inferred from scrollability, repeated message-like children, vertical stacking, text density, and adjacency to the composer.

The message collection should be inferred from repeated sibling or cousin structures. The tool should find the smallest repeated ancestor that behaves like one message item.

Within a message item, the tool should try to identify body text, sender, timestamp, reaction area, and overflow/menu action when possible.

O01 Selector generation

Generate multiple selector candidates for every accepted object.

Prefer CSS selectors by default. Generate XPath only as a fallback or when it expresses a useful relation more clearly.

Selector candidates should include stable attribute selectors, semantic selectors, scoped selectors, text-relative selectors, and collection selectors.

Stable attributes include data-testid, data-test, data-qa, data-cy, id, name, aria-label, role, placeholder, href, and type. Data-test-style attributes should score very highly.

Ids should be scored based on apparent stability. Human-readable ids are useful. Generated-looking ids should be downgraded.

Classes should be used carefully. Semantic authored class names may be useful. Hashed, generated, utility-only, or state-only class names should be downgraded.

Avoid absolute DOM paths. Avoid long descendant chains. Avoid nth-child unless no better option exists.

P01 Selector scoring

Every selector candidate should be scored and explained.

Score uniqueness in the intended scope. A singleton should match one element. A collection selector should match multiple structurally similar elements.

Score stability. Prefer stable attributes, semantic roles, accessible names, and scoped anchors. Penalize generated ids, volatile classes, deep paths, positional selectors, and exact text that may change.

Score readability. A selector should be understandable by a human automation engineer.

Score scope correctness. A selector inside a selected sidebar, composer, modal, or transcript should be evaluated relative to that region when possible.

The preferred selector is the highest-scoring candidate after validation.

Q01 Region-first selector strategy

The tool should prefer region-first modeling.

For example, a send button should usually be represented as a child of a composer region. A message body should usually be represented as a child of a message item. A sidebar link should usually be represented as an item inside a sidebar or navigation region.

The export should preserve this hierarchy. Do not flatten everything into global selectors.

R01 Drag selection behavior

When the user drags a rectangle, treat it as a scoping hint.

Candidates that overlap the rectangle should be promoted. Containers that strongly contain the rectangle or most selected candidates should be considered region anchors.

If the rectangle covers the bottom composer, infer composer candidates first.

If the rectangle covers a left or right column with repeated clickable rows, infer sidebar or navigation candidates first.

If the rectangle covers a scrollable central area with repeated text blocks, infer transcript or feed candidates first.

S01 JSON export shape

The JSON should be stable and simple.

The top level should include metadata such as page URL, title, timestamp, tool version, and viewport size.

It should include an array of selected objects.

Each object should include id, name, kind, inferredType, confidence, selector, selectorType, selectorScore, alternativeSelectors, boundingRect, features, explanation, parentId, children, and collection metadata when relevant.

For collections, include itemSelector, itemSelectorScore, itemChildren, sampleCount, and whether virtualization is suspected.

T01 Naming

Generate readable names automatically.

Examples include `composer`, `messageInput`, `sendButton`, `chatTranscript`, `messageItems`, `sidebar`, `conversationList`, `newChatButton`, `searchInput`, and `navigationLinks`.

Names should be camelCase by default. Avoid names based only on tag names unless no better semantic information exists.

Names should be editable in the UI if practical for MVP. If not practical, make the generated names clear enough and keep manual editing as P3.

U01 Unit testing

Unit tests should cover selector generation, selector scoring, generated-attribute detection, interactable classification, region inference, collection detection, and export serialization.

Tests should use small in-memory HTML fixtures. They should not require a real browser.

Where DOM support is needed, use the simplest reliable Bun-compatible approach. If a lightweight DOM dependency is necessary, add it as a development dependency only. Do not add runtime dependencies to the bookmarklet.

The tests should prove that a chat fixture produces at least a composer candidate, message input candidate, send button candidate, transcript candidate, and message collection candidate.

V01 Manual example page

Create `examples/chat.html`.

It should include a realistic but compact chat layout: left sidebar, conversation rows, main transcript, repeated message items, timestamps, composer, editable input, attach button, and send button.

The page should intentionally include some nested spans and divs so the tool has to choose meaningful ancestors rather than trivial leaf nodes.

The page should include some good attributes such as aria-label and data-testid, and some bad generated-looking classes or ids, so selector ranking can be manually observed.

W01 Out of scope for first version

Do not implement server communication.

Do not implement LLM calls.

Do not implement saved projects.

Do not implement browser extension packaging.

Do not implement integration tests yet.

Do not attempt perfect accessibility-tree reconstruction.

Do not attempt to inspect closed shadow DOM.

Do not attempt full support for canvas-only applications.

X01 Acceptance criteria

Running `bun test` should pass.

Running the build script should produce a readable single-file script in `dist/bookmarklet.js`.

Pasting `dist/bookmarklet.js` into a browser console on `examples/chat.html` should show the overlay.

The overlay should highlight meaningful controls and regions.

Dragging over the composer should produce composer, input, and send-button candidates.

Dragging over the transcript should produce transcript and message-collection candidates.

Dragging over the sidebar should produce sidebar or conversation-list candidates.

Selecting candidates and exporting should produce structured JSON with selectors and explanations.

The preferred selector should avoid brittle absolute XPath when better CSS or scoped selectors exist.

Y01 Implementation guidance for Codex

Implement the smallest working vertical slice first: inject overlay, scan candidates, highlight hover target, select target, generate simple selectors, export JSON.

Then add region detection.

Then add chat-specific heuristics.

Then add selector ranking and explanations.

Then add collection detection.

Then improve UI and sample pages.

Keep the design modular. Heuristics should be functions that can be tested independently. Selector generation should not depend on overlay UI. Export should not depend on DOM mutation. The overlay should consume candidate data, not create core inference logic itself.

Z01 Core principle

The tool succeeds when it helps the user say, "This is the thing I want to automate", and then gives them a selector that is scoped, explainable, and less brittle than what they would have copied manually from DevTools.




A02 UX specification: usage scenarios

The tool should feel like a temporary inspector layered over the current page. It should not become the page. The page remains visible and usable. The tool appears as a small floating panel, with a compact default state and a larger details state only when the user selects something.

B02 Scenario 1: starting the tool

User opens a web page and runs the bookmarklet from the browser bar or pastes the script into DevTools.

The tool injects a small floating panel into the page. The panel should not block the main content. It should appear in a corner, be draggable, and have a compact mode. The first visible controls should be: scan page, select area, select element, selected objects, export JSON, close.

The page should receive no permanent changes. Running the bookmarklet again should reopen or toggle the same panel, not create a second copy.

C02 Scenario 2: scanning the current page

User wants to understand what the tool can detect before selecting anything.

User presses scan page. The tool scans the visible DOM and shows a summary: number of likely controls, regions, collections, and low-confidence candidates.

The page should show subtle highlights for high-confidence candidates only. The user should not see hundreds of outlines. The default view should be selective.

D02 Scenario 3: selecting one element directly

User wants a selector for a single visible control, such as a send button, search box, menu button, or link.

User presses select element. The cursor enters inspection mode. As the user moves over the page, the tool highlights the nearest meaningful candidate. If the pointer is over a span inside a button, the tool should highlight the button, not the span.

User clicks the highlighted candidate. The tool pins it as the current selection and opens the details panel. The panel shows inferred type, confidence, preferred selector, alternate selectors, and explanation.

E02 Scenario 4: cancelling element selection

User starts element selection but decides not to select anything.

User presses Escape or clicks cancel in the floating panel. The tool exits selection mode, removes temporary hover outlines, and returns to normal panel state. No object is added to selected objects.

F02 Scenario 5: selecting an area with a rectangle

User wants selectors for everything important in a region, such as a composer area, sidebar, navigation bar, modal, or transcript.

User presses select area. The user drags a rectangle over part of the page. During drag, the rectangle is visible. Candidate elements inside or overlapping the rectangle receive temporary highlights.

When the user releases the mouse, the tool analyzes the selected area. It should not simply return all DOM nodes inside the rectangle. It should infer meaningful objects inside the area: controls, regions, and collections.

G02 Scenario 6: confirming area results

User has drawn a rectangle and wants to decide which detected objects are worth exporting.

The panel shows a candidate list grouped by meaning. For example, after selecting a composer area, the list might show composer region, message input, attach button, send button, and formatting toolbar.

Each candidate should have a checkbox, name, inferred type, confidence, and preferred selector preview. High-confidence candidates can be preselected. Low-confidence candidates should be visible but not automatically selected.

H02 Scenario 7: selecting a chat composer

User wants to automate sending a message in a chat application.

User drags over the bottom composer area. The tool detects the editable input and nearby action buttons. It identifies a composer region, a message input, and a likely send button.

The tool should prefer a hierarchical model. The message input and send button should be children of the composer region. This lets exported automation refer to "send button inside composer", not "third button on the whole page".

I02 Scenario 8: selecting a chat transcript

User wants to validate what happened before and after a message was sent.

User drags over the message history area. The tool detects a scrollable transcript-like region and a repeated message-item collection. It should infer that the user probably wants a collection, not a single static message.

The exported object should include a transcript region, a message item selector, and possible child selectors for message body, sender, timestamp, and action menu.

J02 Scenario 9: selecting the last message pattern

User wants to later assert the latest visible message.

After selecting the transcript, the tool should expose collection helpers in the JSON. It should describe the message collection and allow downstream code generation to use concepts such as first item, last item, item by text, item by sender, or item count.

The bookmarklet does not need to generate Playwright code yet, but the JSON should preserve enough structure for that later.

K02 Scenario 10: selecting a sidebar

User wants to automate navigation or select conversations from a sidebar.

User drags over the left sidebar. The tool detects a sidebar region and repeated rows. It distinguishes between global navigation links and conversation-list rows when possible.

If the rows contain title, preview, avatar, badge, or timestamp-like content, the tool may infer conversation list. If the rows are short destination labels, it may infer navigation.

L02 Scenario 11: selecting a top navigation bar

User wants selectors for navigation links in a header.

User drags over the top bar. The tool identifies the header or navigation region and links or buttons inside it. The tool should scope selectors to the navigation region. It should not export "all a[href] on the page".

M02 Scenario 12: selecting controls inside a modal

User opens a modal and wants selectors for its buttons and fields.

User runs the tool or rescans while the modal is visible. The tool detects a dialog-like region. Controls inside the modal should be scoped to the modal region. If the page behind the modal contains similar buttons, those should not confuse selector ranking.

N02 Scenario 13: selector candidate review

User selects a button and wants to know which selector to use.

The panel shows multiple selector candidates. Each candidate has type, selector text, match count, score, and explanation.

For example, a data-testid selector may say "preferred because it is stable and unique". A class selector may say "penalized because class name looks generated". An XPath may say "fallback because no strong CSS selector was found".

O02 Scenario 14: selector testing

User wants to verify whether a selector matches the intended element.

The panel includes a selector test input. User can paste or edit a selector. The tool runs it against the current document or current region scope and shows match count. Matching elements are highlighted.

If the selector matches zero elements, show that clearly. If it matches many elements, highlight all matches and warn that it is not unique unless the object is a collection.

P02 Scenario 15: selector scope testing

User wants to know whether a selector is good globally or only inside a region.

The selector review should show global match count and scoped match count when the object has a parent region. A selector that is not unique globally can still be acceptable if it is unique inside a stable region.

For example, `button[aria-label="Send"]` may match two buttons globally, but only one inside the composer. The tool should prefer the scoped interpretation.

Q02 Scenario 16: editing object names

User wants exported objects to have useful page-object names.

The panel should allow renaming selected objects before export. Generated names should be camelCase, such as `composer`, `messageInput`, `sendButton`, `chatTranscript`, `messageItems`, `sidebar`, `conversationList`, or `searchInput`.

If editing names is too much for the first build, generated names must still be readable and stable enough for exported JSON.

R02 Scenario 17: exporting JSON

User has selected several objects and wants to copy the result.

User presses export JSON. The tool creates structured JSON and copies it to clipboard. If clipboard write fails, the tool displays the JSON in a textarea.

The JSON should include page metadata, selected objects, selectors, alternate selectors, confidence, explanations, hierarchy, and collection metadata.

S02 Resulting JSON shape

The exported JSON should look approximately like this:

```json
{
  "version": "0.1.0",
  "page": {
    "url": "https://example.test/chat",
    "title": "Example Chat",
    "timestamp": "2026-04-11T00:00:00.000Z",
    "viewport": {
      "width": 1440,
      "height": 900
    }
  },
  "objects": [
    {
      "id": "obj_1",
      "name": "composer",
      "kind": "region",
      "inferredType": "composer",
      "confidence": 0.91,
      "selector": "[data-testid=\"composer\"]",
      "selectorType": "css",
      "selectorScore": 0.94,
      "alternativeSelectors": [],
      "explanation": "Detected editable input with nearby send action inside a stable lower-page region.",
      "boundingRect": {
        "x": 320,
        "y": 780,
        "width": 780,
        "height": 88
      },
      "children": ["obj_2", "obj_3"]
    },
    {
      "id": "obj_2",
      "name": "messageInput",
      "kind": "control",
      "inferredType": "editable",
      "parentId": "obj_1",
      "confidence": 0.96,
      "selector": "[role=\"textbox\"]",
      "selectorType": "css",
      "selectorScope": "obj_1",
      "selectorScore": 0.91,
      "alternativeSelectors": [
        {
          "type": "css",
          "selector": "[contenteditable=\"true\"]",
          "score": 0.77,
          "matchCount": 1,
          "explanation": "Unique in composer scope but less semantic than role textbox."
        }
      ]
    },
    {
      "id": "obj_4",
      "name": "messageItems",
      "kind": "collection",
      "inferredType": "messageList",
      "confidence": 0.86,
      "selector": "[data-testid=\"message-list\"]",
      "itemSelector": "[data-testid=\"message-item\"]",
      "sampleCount": 6,
      "virtualizationSuspected": false,
      "itemChildren": {
        "body": "[data-testid=\"message-body\"]",
        "sender": "[data-testid=\"message-sender\"]",
        "timestamp": "[data-testid=\"message-time\"]"
      }
    }
  ]
}
```

T02 Scenario 18: removing a selected object

User accidentally selected the wrong object.

The selected objects list should allow removing an object before export. Removing a parent region should either remove its children or detach them. The simpler first behavior is to remove the parent and children together, with a clear confirmation inside the panel.

U02 Scenario 19: rescanning after page changes

User sends a message, opens a modal, expands a menu, or navigates within the app.

User presses rescan. The tool rescans the current DOM and updates candidates. Existing selected objects should remain in the export list, but the tool can mark them as still matching, missing, or changed.

This is important for dynamic apps. The user should be able to collect selectors across multiple visible states.

V02 Scenario 20: closing the tool

User is finished.

User presses close. The tool removes the panel, overlays, highlights, event listeners, observers, and internal global state. The host page should return to its previous visual state.

W02 UX priorities

The highest priority is not visual polish. The highest priority is making selection obvious, feedback immediate, and exported selectors explainable.

The user should always know which mode is active: normal, element selection, area selection, or selector testing.

The user should always see what was selected.

The user should always see why a selector was recommended.

The user should always be able to cancel without damaging the page.

X02 Minimal first implementation

The first version should implement start, close, scan, select element, select area, candidate list, selector ranking, selector testing, and export JSON.

The first version should work well on the sample chat page. It should detect composer, message input, send button, transcript, message items, sidebar, and sidebar rows.

Everything else can improve iteratively, but these scenarios define the core experience.
