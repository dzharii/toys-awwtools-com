2026-04-26

Related: 2026-04-26-user-enhancement-research.md

A00 Product Requirement Document: Calm WYSIWYG Editing Canvas With Lightweight Contenteditable Blocks

---

This product requirement document defines the next major UI and editor change for Topic Research Notepad. The scope is intentionally focused: implement Feature Proposal 1, the calm WYSIWYG editing canvas, using Approach B, lightweight `contenteditable` per block. This change should make the current proof of concept feel less like a block database editor and more like a focused research writing surface, while preserving the existing local-first architecture, block-based storage model, retro UI framework, autosave pipeline, paste normalization, search, and export behavior.

The current research document describes the problem accurately: the app already has a useful local-first base, but the user experience exposes too much of the internal model. The user sees labeled content records rather than a writing surface, and every paragraph visibly announces itself as "Paragraph" with persistent controls around it. That is the main product defect this change must address. The application should still internally know that a paragraph is a paragraph block, a heading is a heading block, and a source is a source block. The user should not be forced to think that way during ordinary writing. 

The desired result is a retro research writing desk. The application frame, page sidebar, command bar, buttons, status strip, borders, and compact desktop-like controls may remain visibly retro. The document itself should become quieter. The page title should remain visible and separate. The body should read as a continuous editable research document. Controls should appear when the user shows intent: hovering, focusing, opening a menu, typing a command, or selecting a block.

---

B00 Current State and Product Problem

---

The current implementation can create pages, store blocks separately, save data in IndexedDB, use a Worker-owned persistence path, convert pasted content into internal blocks, search saved content, and export Markdown/JSON. This is a useful base. It should not yet be described as a fully solid product foundation because visible bugs and UX problems remain, but the base architecture is directionally correct.

The current UI problem is that the app makes users manage structure before they can write. The page body is presented as a sequence of bordered records. A paragraph block shows a visible title saying `Paragraph`. A source block exposes all its editable fields at once. Every block carries movement and deletion buttons. The add-block toolbar is always visible above the document, so the user must look away from the writing location to add structure. This makes the app feel like a content management form rather than a notebook.

The research document captures this as "the content should be the default interface; controls should appear only when the user is trying to act." That principle is accepted and should guide this implementation. 

For this change, the outer layout is not the primary problem. The top command bar is acceptable. The general two-pane layout is acceptable. The separate page title field is acceptable and should remain. The main issue is inside the editor: paragraphs, headings, source blocks, block chrome, and insertion behavior.

---

C00 Final Scope of This Change

---

At the end of this change, Topic Research Notepad should have a calm document-like editing canvas implemented with lightweight `contenteditable` regions per editable block.

Paragraph and heading blocks should no longer use plain textarea as the primary editing UI. They should render as `contenteditable` document regions that can eventually support controlled inline formatting such as links, bold, italic, underline, inline code, and highlight. The app must not become an arbitrary HTML editor. The contenteditable layer should be controlled, sanitized, restricted, and normalized.

Paragraph labels should be removed or hidden by default. Block controls should not dominate the page. A simple page containing several paragraphs should look like a document, not like five form cards. Headings should look like document headings. Quotes should look like quoted content. Source blocks should move toward compact display, with full metadata available through details or editing affordances.

A limited slash command system should be introduced. Earlier, slash commands were considered future-only; the decision has changed. This release should implement a small, controlled slash command surface for common block insertion or transformation. It should not become a full command palette yet.

Paste behavior must be upgraded around a bodyguard pastebin concept. Rich pasted content should be captured into a controlled hidden or offscreen `contenteditable` element, or an equivalent detached parsing pipeline, before it is sanitized and inserted into the actual editor. Raw pasted HTML must not enter the live editor directly.

This change may mention and prepare for sidebar hierarchy, split panes, persistent UI state, and future page organization, but the primary deliverable is Feature Proposal 1. Full page tree implementation, page drag-and-drop, smart folders, tags, backlinks, and full command palette remain outside this immediate scope unless Codex finds a very small enabling change necessary.

---

D00 Explicit Decisions Made During Review

---

The first decision is that simple textarea editing is too limiting for the future editor. Textareas are stable and easy to persist, but they cannot naturally support inline hyperlinks, bold text, italic text, underline, highlight, or mixed inline formatting inside a paragraph. Since this app is a research notepad, users will eventually need to mark terms, link references, emphasize text, and insert useful inline metadata. Therefore, the main editor should not remain textarea-first.

The second decision is that a full rich editor engine is too heavy right now. A ProseMirror-like architecture is powerful, but it is a large dependency and a large architectural commitment. This project currently favors local vendored files, no new NPM modules, and a controlled proof-of-concept path. The app may borrow ideas from rich editor systems, such as command-based transforms and controlled document schemas, but it should not adopt such an engine in this release.

The third decision is to implement lightweight `contenteditable` per block. This combines the visual calm of the textarea-restyling approach with enough flexibility for controlled inline formatting. It should feel as simple as writing into a quiet paragraph, while still allowing the app to manage block identity, autosave, search, export, and paste normalization.

The fourth decision is that pasted HTML must be treated as untrusted. The hidden pastebin/bodyguard pattern should be documented and implemented or approximated. The browser can help parse messy clipboard input into DOM, but the application must still sanitize, normalize, and convert the content before it reaches the actual editor.

The fifth decision is that slash commands should now be included in a limited form. They should be scoped narrowly to inserting or transforming known block types. They should be dismissible, predictable, and only active in command-like contexts.

The sixth decision is that block transforms should be governed by an explicit conversion map. The UI should only show transformations that make sense for the current block. A paragraph may become a heading or quote. A heading may become a paragraph. A paragraph may become code. A source block should not show nonsensical conversions.

The seventh decision is that future organization features should be separated from this release. Parent-child pages, collapsible trees, drag-and-drop, smart folders, wiki links, tags, backlinks, smart views, and outline mode remain valid roadmap items. They should be recorded, not mixed into this first editor pass.

---

E00 Desired User Experience

---

When the user opens a research page, the page should feel like a writing surface. The title sits at the top as the identity of the document. Below it, the user sees content, not block machinery.

A paragraph should look like ordinary document text. There should not be a visible `Paragraph` label in the normal resting state. There should not be a heavy textarea border. There should not be a permanent toolbar pinned to the top-right of every paragraph. The user should be able to click into the text and write.

A heading should look like a heading. It can still be stored as a heading block, and it can still have a level internally, but the user should perceive it as document structure, not as an input field labeled heading.

A quote should look like a quote. It may carry source metadata, but that metadata should not interrupt the main reading flow unless the user asks to inspect or edit it.

A source block should feel like a compact research reference. It may show a title, domain, note, and open-link action. The URL, captured text, timestamp, and detailed fields should be available through expansion or edit mode, not permanently exposed.

Controls should appear when the user shows intent. If the user hovers near a block or focuses it, a subtle handle or small control surface can appear. If the user opens a context menu, secondary actions can be shown. If the user types a slash command in an empty or command-like block, the insert menu can appear. In the ordinary reading and writing state, the content remains primary.

---

F00 Contenteditable Editing Model

---

The editor should use one contenteditable editing region per text-like block. This does not mean the whole page becomes one uncontrolled contenteditable document. The app should preserve block boundaries.

A paragraph block should render something conceptually like this:

```html
<div
  class="trn-editable-block trn-editable-block--paragraph"
  data-block-id="block_uuid"
  data-block-type="paragraph"
>
  <div
    class="trn-rich-text"
    contenteditable="true"
    role="textbox"
    aria-multiline="true"
    data-field="content"
  >
    Paragraph content rendered as sanitized inline HTML
  </div>
</div>
```

A heading block should use the same pattern but render with heading-like styling and a heading-specific block type. The app may use a real heading element wrapping or adjacent to the editable element if that can be done without breaking editing. The exact DOM structure can be adjusted, but the editing model should remain block-scoped.

The contenteditable element should not receive arbitrary HTML blindly. On input, the app should read the edited content, normalize it, sanitize allowed inline markup, update the in-memory block, and schedule a targeted autosave. The content model should stay constrained.

The app must preserve block IDs. The user may edit the text, but the block remains the same durable record unless transformed or deleted.

---

G00 Allowed Inline Content

---

This release should support or prepare for a small allowed inline schema. Codex should implement the smallest stable subset that works, but the model should not make future inline formatting impossible.

The allowed inline content should include plain text and may include these elements:

```txt
strong
em
u
code
mark
a[href]
br
```

If Codex chooses to implement only links plus plain text in the first pass, that is acceptable if the sanitizer and model are already shaped for more allowed inline marks later. The critical point is that the app must not store uncontrolled browser-generated markup.

The following should not survive sanitization:

```txt
script
style
iframe
object
embed
form
input
button from pasted content
event handler attributes
class attributes from external pages
style attributes from external pages
data-* attributes from external pages unless explicitly owned by the app
unknown layout wrappers
foreign editor metadata
```

Links must be normalized. The visible text should be safe. The `href` should be retained only when it is safe enough for this local context. When rendered as clickable, links should use safe attributes such as `rel="noopener noreferrer"` where appropriate.

---

H00 Storage Representation for Rich Text

---

Codex must choose a storage representation deliberately. The simplest acceptable option is sanitized normalized HTML inside text-like block content. A more structured inline JSON model is cleaner long-term but heavier.

The recommended first implementation is sanitized inline HTML for paragraph and heading content, with helper functions that can also extract plain text for search and Markdown export.

Example paragraph content:

```js
{
  html: "This is <strong>important</strong> research about <a href=\"https://example.com\">the source</a>.",
  text: "This is important research about the source."
}
```

If the existing model currently stores only `content.text`, Codex may maintain compatibility by adding `content.html` while preserving `content.text` as derived plain text. Old records with only `text` should render correctly by escaping the text into the contenteditable region. New records may store both sanitized `html` and derived `text`.

This compatibility rule is important. Existing local notes should not disappear or break. A paragraph with `content.text` should normalize to a renderable content shape.

A heading may similarly store:

```js
{
  level: 1,
  html: "Research heading",
  text: "Research heading"
}
```

If Codex determines that storing sanitized HTML is still too risky for this pass, it may store plain text only while using contenteditable visually. That would be less powerful, but still moves the UI toward the desired editor. If it chooses that fallback, it must document the limitation and keep the sanitizer boundary in place.

---

I00 Bodyguard Pastebin Requirement

---

Paste handling must be treated as a first-class part of this feature. A contenteditable editor is only acceptable if paste is controlled.

The bodyguard pastebin pattern should be implemented or used as the design basis. The pattern is:

```html
<div contenteditable="true" id="pastebin"></div>
```

With CSS:

```css
#pastebin {
  opacity: 0.01;
  width: 100%;
  height: 1px;
  overflow: hidden;
}
```

The historical technique you shared uses the pastebin as a hidden rich paste receiver:

```js
document.addEventListener("keydown", function (event) {
  if (event.ctrlKey || event.metaKey) {
    if (String.fromCharCode(event.which).toLowerCase() === "v") {
      pastebin.innerHTML = "";
      pastebin.focus();
      info.classList.add("hidden");
      wrapper.classList.add("hidden");
    }
  }
});

pastebin.addEventListener("paste", function () {
  setTimeout(function () {
    var markdown = convert(pastebin);
    insert(output, markdown);
    wrapper.classList.remove("hidden");
    output.focus();
    output.select();
  }, 200);
});
```

The notepad should adapt this idea, not copy it blindly. The modern implementation should route paste through the app's own paste controller. The pastebin should be hidden or offscreen, should not disturb layout, and should be cleared after each use. The app should read the DOM produced inside the pastebin, sanitize it, convert it into allowed inline content or blocks, and insert the result at the intended editor location.

The pastebin is called a bodyguard because it receives unsafe external content first. It protects the actual editor from being poisoned by arbitrary HTML, foreign styles, scripts, invisible layout wrappers, or page-specific markup.

---

J00 Paste Flow

---

When the user pastes into a contenteditable block, the app should prevent uncontrolled insertion into the live editor. It should decide whether the paste is inline content for the current block or multi-block content that should become several blocks.

A recommended flow is:

The user triggers paste while focused in a contenteditable block.

The app intercepts the paste event.

The app reads available clipboard formats if accessible.

If rich HTML is present or the browser needs to parse the paste, the app captures the paste through the bodyguard pastebin or a detached DOM parser.

The app sanitizes the resulting DOM with an allowlist.

The app converts block-level content into internal blocks when appropriate.

The app converts inline content into sanitized inline HTML when the paste belongs inside the current paragraph.

The app inserts the cleaned result at the caret or creates new blocks around the current block.

The app updates the in-memory model and schedules autosave.

The app logs the paste operation through existing observability.

The real editor should never temporarily contain raw pasted HTML. If a browser inserts raw content before the app can stop it, Codex should remove and replace it immediately. The preferred implementation is to prevent default paste into the real editor and insert only the sanitized result.

---

K00 Safe HTML APIs and Fallbacks

---

Codex should consider browser-supported safe HTML APIs where available, such as `Element.setHTML()` with a sanitizer-like allowlist, but the implementation must not depend exclusively on a single new API if browser support is uncertain.

The sanitizer should have a fallback path. A conservative fallback can parse with `DOMParser`, traverse nodes, copy only allowed tags and attributes, and escape everything else.

The sanitizer should be deterministic. Given the same input, it should produce the same normalized output. This makes autosave, export, and tests more predictable.

If a paste contains complex HTML that cannot be safely represented, the app should fall back to readable plain text rather than preserving unsafe structure.

---

L00 Slash Command Requirement

---

A limited slash command system should be implemented as part of the near-term editor work.

The slash menu should open only in command-like contexts. The safest first rule is: open the menu when a paragraph-like block is empty or contains only a leading slash command fragment, such as `/`, `/h`, `/quote`, or `/source`.

The menu should not appear every time the user types a slash in the middle of normal text. It should close when the content no longer looks like a command. Escape should dismiss it. Enter should select the highlighted command. Arrow keys should move selection.

The initial command set should be small:

```txt
/paragraph
/heading
/quote
/list
/table
/code
/source
```

Aliases may be supported if simple:

```txt
/h
/q
/src
```

When a command is selected, the app should either transform the current empty command block or insert a new block at the current location. For example, typing `/quote` in an empty paragraph and pressing Enter should convert that block to a quote block and focus its editable region.

Slash commands are not a full command palette. They are local block creation and transformation affordances. A full global command palette remains a later feature.

---

M00 Block Transform Requirement

---

Block transformations should be explicit, limited, and predictable.

Codex should define a conversion map similar to:

```js
const BLOCK_TRANSFORMS = {
  paragraph: ["heading", "quote", "list", "code", "source"],
  heading: ["paragraph", "quote"],
  quote: ["paragraph"],
  code: ["paragraph"],
  list: ["paragraph"],
  source: [],
  table: []
};
```

This example is not final law. Codex should adjust it based on actual data conversion safety. The important requirement is that the UI should not show transformations that cannot preserve user content safely.

A paragraph with text can become a quote by moving its text into quote content. A heading can become a paragraph by preserving its text. A paragraph can become code by preserving text as code content. A source block should not become a paragraph unless Codex defines a clear export of title, URL, and note into text.

The transform function should be tested. It should preserve user content wherever possible. If a transform would lose important data, it should not be offered or should require explicit confirmation.

---

N00 Block Chrome and Hover Controls

---

The visual chrome around blocks must be reduced.

In resting state, a paragraph block should not have a heavy border or visible toolbar. On hover or focus, the block may show a subtle outline, gutter handle, or small controls.

The existing movement and delete buttons should not remain permanently visible on every block. For the first pass, Codex may hide them until hover/focus rather than fully replacing them with context menus. That would already reduce clutter significantly.

A possible visual rule:

```css
.trn-block-toolbar {
  opacity: 0;
  pointer-events: none;
}

.trn-block:hover .trn-block-toolbar,
.trn-block:focus-within .trn-block-toolbar {
  opacity: 1;
  pointer-events: auto;
}
```

If the toolbar remains in this pass, the known alignment bug must be fixed. The delete button currently protrudes or appears shifted relative to the move buttons and block boundary. The toolbar should respect the same right padding as the block content.

A better later version will move most of these controls into a block handle and context menu. This can be prepared now but does not have to be complete for Feature 1.

---

O00 Paragraph and Heading Visual Requirements

---

Paragraphs should visually behave like document text. The contenteditable region should have appropriate line height, readable font size, and enough inner spacing to feel like writing. It should not inherit the same small UI-control feel as buttons and fields.

The retro UI framework can continue to define chrome, but document text may use a more comfortable reading font size than the surrounding UI. This is acceptable and desirable. Classic document editors often separate UI font from document font. The notepad should do the same in a constrained way.

The app should not become a free-form typography editor. Users should not choose arbitrary fonts, colors, and layout styles in this release. The document font and size can be app-defined.

Headings should be visually distinct. They should be larger, heavier, or spaced as section titles. They should still use the same controlled editing and sanitization rules.

---

P00 Source and Quote Display Requirements

---

Source and quote blocks should begin moving toward compact document-like display.

For source blocks, the default display should not be a large always-open form. The compact display should show the important reading information: source title, domain or URL, optional note, and open action. The detailed editable fields should be available when the block is focused, expanded, or explicitly edited.

For quotes, the quote text should be primary. Attribution or source should be secondary. Metadata should not interrupt the reading flow.

If Codex cannot fully implement compact/expanded source blocks in the same pass as contenteditable, it should at least reduce the visual dominance of source fields and prepare state for expansion. The final goal remains compact by default, expanded on intent.

---

Q00 Page Title Requirement

---

The page title should remain a separate editable field at the top of the editor. This was reviewed and accepted. The title is both the document's visible heading and the sidebar label. Keeping it separate from block content simplifies navigation, search indexing, and page management.

The title field should be styled more like document identity and less like a generic form field. It can remain an input for now, but it should visually align with the calm editor direction.

Editing the title must still update the sidebar and persist through the existing autosave/storage path.

---

R00 State Persistence Requirements

---

The app should restore the working state after refresh or reopening. This is part of the product's trust model.

For this change, Codex should at minimum preserve or not break existing selected-page persistence. If it introduces new UI state, it should decide whether that state should be ephemeral or durable.

Durable state candidates:

Selected page ID.

Sidebar width.

Sidebar collapsed/expanded state.

Page tree collapsed rows, once page tree exists.

Focus mode state, if implemented.

Ephemeral state candidates:

Currently open slash menu.

Currently hovered block.

Currently active context menu.

Temporary pastebin content.

Expanded source details may be ephemeral in the first pass. If the user later expects expanded/collapsed source details to persist, it can be stored later.

If stored state cannot be restored, the app must fall back gracefully. A missing selected page should not crash startup. A missing block ID should not break rendering. A failed restore should log a warning and open a reasonable default.

---

S00 Sidebar and Page Organization Notes

---

Full sidebar hierarchy is not part of Feature 1, but this PRD must preserve the agreed direction.

Pages should eventually become hierarchical using one `parentPageId` per page. Multiple parents are not part of the current plan. Smart folders or smart views should later be implemented as derived views or metadata, not as multiple direct parents.

The sidebar should eventually support collapsible tree rows, drag-and-drop reordering/nesting, and command/menu movement. Tree expanded/collapsed state should persist in IndexedDB. The user should be able to refresh the browser and return to the same broad workspace state.

For this immediate release, sidebar work should be limited to not blocking future hierarchy. If a split-pane component or sidebar collapse is already in progress, it can be included, but it should not delay the editor canvas work.

---

T00 Observability Requirements

---

The earlier observability direction remains important. This change touches high-risk areas: contenteditable input, paste handling, sanitization, block transforms, slash commands, and autosave.

Codex should add structured logs around:

Editor block render mode.

Contenteditable input handling.

Sanitization decisions.

Pastebin capture start and end.

Converted paste result.

Slash command open, close, and select.

Block transform request and result.

Autosave scheduling after contenteditable changes.

Any fallback from rich content to plain text.

Any sanitizer rejection or unknown HTML stripping summary.

Logs should not dump full private note content by default. They can include lengths, block IDs, block types, counts, tag summaries, and small previews where useful. If content preview is logged, it should be short.

---

U00 Accessibility and Keyboard Requirements

---

The contenteditable editor must remain keyboard-usable.

The user should be able to Tab into the editor and interact with blocks. The slash menu should be operable by keyboard. Escape should close transient menus. Enter should create or confirm expected actions depending on context. The first implementation does not need to perfect every editor behavior, but it must not create a keyboard trap.

Editable regions should have appropriate roles or labels where native semantics are insufficient. A paragraph contenteditable can use `role="textbox"` and `aria-multiline="true"` if that improves accessibility.

Focus should be visible. Since the visual design is quiet, focus indication should be subtle but real.

---

V00 Testing Requirements

---

Codex should add or update tests for pure logic.

Required test areas:

Sanitizer allows supported inline tags and strips unsafe tags.

Sanitizer strips event handlers and style/class pollution.

Plain text extraction from sanitized inline HTML works.

Old `content.text` paragraph records normalize into renderable content.

New `content.html` paragraph records produce searchable text.

Markdown export handles sanitized inline links and basic inline formatting if implemented.

Slash command parser opens only for command-like block text.

Slash command selection maps to the expected block type.

Block transform map only offers valid conversions.

Block transform preserves text where expected.

Paste conversion can take bodyguard DOM output and produce allowed internal content or blocks.

If contenteditable DOM behavior is hard to test in Bun, Codex should document manual browser tests and still test the pure helpers.

---

W00 Manual Verification Scenarios

---

Codex should manually verify the following scenarios in the browser.

Create a new page, type several paragraphs, and confirm the page looks like a document rather than a form.

Create a heading and confirm it looks like a heading.

Type into a paragraph and confirm the block autosaves.

Reload and confirm content persists.

Paste rich formatted content from a web page and confirm unsafe styling does not enter the editor.

Paste a link into a paragraph and confirm it becomes controlled link content if supported.

Type `/quote` in an empty paragraph and confirm the slash menu can convert or insert a quote block.

Press Escape while slash menu is open and confirm it closes.

Hover a paragraph and confirm controls appear only on intent.

Confirm paragraph labels are not visible by default.

Confirm source blocks are less visually dominant or compact if implemented.

Confirm Markdown export still works.

Confirm JSON backup still works.

Confirm search still indexes edited content.

---

X00 Acceptance Criteria

---

This change is accepted when the current editor no longer feels like a stack of visible form records for ordinary paragraph writing.

A page with multiple paragraphs must look like one document.

Paragraph block type labels must be hidden or removed in the default state.

Paragraph and heading blocks must use lightweight contenteditable editing or a documented transitional equivalent approved by the implementation constraints.

Contenteditable output must be sanitized and controlled.

Raw pasted HTML must not be inserted directly into the live editor.

The bodyguard pastebin pattern or equivalent isolated paste pipeline must exist.

A limited slash command system must exist for common block insertion or transformation.

Block transformations must be based on an explicit valid conversion map.

Existing autosave must continue to work.

Existing IndexedDB persistence must continue to work.

Existing search must continue to work.

Existing Markdown export and JSON backup must continue to work.

The retro UI framework must remain the visual foundation.

No full rich editor dependency must be added.

No new NPM modules must be installed.

Meaningful deviations must be documented in Markdown notes.

---

Y00 Out of Scope for This PRD

---

The following features are not part of this implementation pass.

Full ProseMirror or Tiptap integration.

Arbitrary rich HTML editing.

User-selectable fonts and colors.

Full toolbar-based rich text editor.

Multiple parent pages.

Smart folders.

Wiki links.

Backlinks.

Tags.

Full command palette.

Full page tree drag-and-drop.

Full outline mode.

Durable revision history.

Collaboration or sync.

These remain future roadmap items unless explicitly pulled into a later change request.

---

Z00 Implementation Guidance for Codex

---

Codex should begin by inspecting the current editor rendering and block input flow. It should identify where paragraph and heading textareas are rendered, where input events update block content, where paste events are handled, and where autosave is scheduled.

The first implementation step should be to introduce a controlled rich-text utility layer: sanitize inline HTML, extract plain text, normalize old and new content shapes, and render safe inline content into contenteditable blocks.

The second step should replace paragraph and heading textarea rendering with contenteditable rendering while preserving block IDs, data attributes, and autosave behavior.

The third step should implement paste isolation using the bodyguard pastebin or equivalent. This should be done before allowing rich pasted content into contenteditable blocks.

The fourth step should implement slash command parsing and a small insert/transform menu.

The fifth step should reduce visual block chrome: hide paragraph labels, quiet borders, and show controls only on hover or focus.

The sixth step should verify search, export, backup, reload, and autosave.

The seventh step should document decisions and limitations.

The important implementation constraint is that the app should become calmer without becoming uncontrolled. This is not a general web page editor. It is a local research notepad with a deliberately restricted, safe, and observable editing model.
