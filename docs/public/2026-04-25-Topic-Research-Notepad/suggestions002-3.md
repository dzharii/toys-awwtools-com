2026-04-26

A00 Acceptance Checklist: Split Pane Framework Component and Calm WYSIWYG Editing Canvas

---

This document is the implementation guidance, work breakdown, and acceptance checklist for the next Topic Research Notepad change set. It combines two saved specifications:

`suggestions002-2.md`: Generic Split Pane Control for Retro UI Framework.

`suggestions002-1.md`: Calm WYSIWYG Editing Canvas With Lightweight Contenteditable Blocks.

Codex should implement these changes autonomously, moving from one stage to the next until the full change set is complete. The work should be split into manageable chunks. For every chunk, Codex should first inspect the relevant code and plan the implementation, then implement the change, then add or update tests, then run the relevant test suite, then review the code for refactoring, documentation, comments, missing error handling, and regression risk. After that review, Codex should fix what needs to be fixed, run the tests again, record meaningful decisions or deviations in Markdown notes, and continue to the next chunk without waiting for further instruction.

Codex should use its best technical judgment when applying this checklist. If the specifications contain inconsistencies, ambiguities, or minor conflicts, Codex should choose the implementation that is most coherent with this project architecture, easiest to maintain, easiest to test, safest for user data, and most consistent with the intended behavior. Codex may rewrite, refactor, reorganize, or simplify existing code when doing so improves consistency, maintainability, testability, or product quality. Codex should not preserve inconsistent existing patterns only for the sake of minimal changes.

The goal is not only to make the UI look better. The goal is to make the application feel like a calm local research writing surface while keeping the retro UI framework as the required visual foundation and improving the framework with a reusable split-pane component.

---

B00 Implementation Method

---

Codex should treat each stage as a complete mini-cycle.

For each stage:

* [ ] Inspect the relevant files and current behavior.
* [ ] Write a short local plan before modifying code.
* [ ] Implement the smallest coherent version of the stage.
* [ ] Add or update Bun unit tests where practical.
* [ ] Run the relevant Bun test command.
* [ ] Fix failures.
* [ ] Review whether code should be refactored for clarity or consistency.
* [ ] Add JSDoc comments for public APIs, protocol boundaries, sanitizer helpers, component properties, and non-obvious behavior.
* [ ] Update Markdown notes when behavior, assumptions, known limitations, or deviations changed.
* [ ] Run tests again after fixes or refactors.
* [ ] Manually verify browser behavior when the stage affects UI.
* [ ] Continue autonomously to the next stage.

Codex should not stop after completing one stage unless a hard blocker prevents meaningful progress. If a hard blocker exists, Codex should document the blocker, the attempted path, the fallback path, and the recommended next action.

---

C00 Global Constraints

---

* [ ] Use Bun for build and tests.
* [ ] Do not install new NPM modules.
* [ ] Use modern JavaScript.
* [ ] Use JSDoc for important types and public APIs.
* [ ] Keep the retro UI framework as the UI foundation.
* [ ] Add framework-level components to the framework when they are reusable beyond the notepad.
* [ ] Do not introduce a second unrelated UI system.
* [ ] Preserve existing local-first architecture.
* [ ] Preserve IndexedDB persistence.
* [ ] Preserve Worker-owned persistence unless there is a documented fallback.
* [ ] Preserve existing page and block records where possible.
* [ ] Avoid destructive migrations.
* [ ] Preserve search, Markdown export, JSON backup, autosave, and paste behavior.
* [ ] Do not add a full rich editor dependency.
* [ ] Do not allow arbitrary raw HTML into the editor.
* [ ] Do not render untrusted pasted HTML directly.
* [ ] Keep observability logs around high-risk editor and storage behavior.
* [ ] Document meaningful deviations from `suggestions002-1.md` and `suggestions002-2.md`.

---

D00 Stage 1: Project Inspection and Baseline Verification

---

Purpose: establish the actual current code state before changing framework or editor behavior.

* [ ] Inspect current project structure.
* [ ] Locate the retro UI framework source and distribution files.
* [ ] Locate framework component registration code.
* [ ] Locate existing framework styles, tokens, `TAGS` map, `defineOnce` or equivalent registration helpers.
* [ ] Locate Topic Research Notepad source files.
* [ ] Locate current editor rendering code.
* [ ] Locate current paragraph, heading, quote, source, list, table, and code block renderers.
* [ ] Locate current textarea/input handling.
* [ ] Locate paste handling.
* [ ] Locate autosave scheduling.
* [ ] Locate search indexing and export logic.
* [ ] Locate current tests and Bun commands.
* [ ] Run the existing test suite before changes.
* [ ] Run the existing build before changes.
* [ ] Open the app manually and record the current behavior.
* [ ] Confirm the visible delete-button alignment bug exists or has already been fixed.
* [ ] Confirm current block labels and persistent block toolbars.
* [ ] Confirm current sidebar/editor layout and whether it already has any resize behavior.
* [ ] Create or update implementation notes with baseline findings.

Acceptance criteria:

* [ ] Codex knows which files own framework components.
* [ ] Codex knows which files own notepad UI rendering.
* [ ] Existing build result is known.
* [ ] Existing test result is known.
* [ ] Any pre-existing failures are documented before new work begins.

---

E00 Stage 2: Add Framework Split Pane Component

---

Purpose: create a reusable split-pane web component inside the retro UI framework.

Component target: `awwbookmarklet-split-pane`.

The component should provide two panes separated by a draggable splitter. It should support horizontal and vertical orientation, start/end slots, pointer resizing, keyboard resizing, min-size clamping, accessible separator semantics, events, Shadow DOM parts, and retro framework styling.

Implementation tasks:

* [ ] Add component source file in the framework component location.
* [ ] Register `awwbookmarklet-split-pane` through the framework registration system.
* [ ] Add the component to framework tag maps or exports where relevant.
* [ ] Use existing framework helpers such as base styles, theme tokens, and style adoption patterns.
* [ ] Define `start` and `end` slots.
* [ ] Define Shadow DOM parts: `container`, `start-pane`, `end-pane`, `splitter`, `splitter-grip`.
* [ ] Implement `direction` attribute with `horizontal` and `vertical`.
* [ ] Implement `value` attribute/property as start pane size in pixels.
* [ ] Implement `min-start`.
* [ ] Implement `min-end`.
* [ ] Implement optional `max-start` if straightforward.
* [ ] Implement `disabled` if straightforward.
* [ ] Use CSS Grid internally.
* [ ] Ensure panes have `min-width: 0` and `min-height: 0`.
* [ ] Ensure pane wrappers support overflow correctly.
* [ ] Implement pointer resizing with pointer capture.
* [ ] Clamp values during drag.
* [ ] Implement keyboard resizing on the splitter.
* [ ] Add `role="separator"` on the internal splitter.
* [ ] Set correct `aria-orientation`.
* [ ] Set `aria-valuemin`, `aria-valuemax`, and `aria-valuenow`.
* [ ] Add a default accessible label such as `Resize panels`.
* [ ] Support app-provided label if practical.
* [ ] Emit `awwbookmarklet-split-pane-resize` during resizing.
* [ ] Emit `awwbookmarklet-split-pane-resize-commit` after resize completes.
* [ ] Use framework-compatible retro visual styling for the splitter.
* [ ] Add a focus-visible style for keyboard users.
* [ ] Do not implement framework-owned persistence in the first version.
* [ ] Add JSDoc typedefs and comments for public behavior.

Suggested event detail shape:

```js
{
  value: 300,
  direction: "horizontal",
  dragging: true
}
```

Suggested usage:

```html
<awwbookmarklet-split-pane
  direction="horizontal"
  value="280"
  min-start="180"
  min-end="520"
  aria-label="Resize page sidebar"
>
  <aside slot="start">...</aside>
  <main slot="end">...</main>
</awwbookmarklet-split-pane>
```

Acceptance criteria:

* [ ] Split pane renders two slotted regions.
* [ ] Horizontal mode resizes left/right panes.
* [ ] Vertical mode resizes top/bottom panes.
* [ ] Pointer drag changes `value`.
* [ ] Keyboard arrows change `value`.
* [ ] Pane sizes are clamped.
* [ ] Resize events are emitted.
* [ ] Resize commit events are emitted.
* [ ] Component is styled consistently with the retro framework.
* [ ] Component is reusable and not tied to Topic Research Notepad.
* [ ] No new dependency is introduced.

---

F00 Stage 3: Test and Document Split Pane

---

Purpose: make the new framework component testable and maintainable.

Testing tasks:

* [ ] Add tests for clamp helper.
* [ ] Test invalid values normalize safely.
* [ ] Test horizontal delta calculations.
* [ ] Test vertical delta calculations.
* [ ] Test min-start and min-end behavior.
* [ ] Test too-small container behavior if helper is pure.
* [ ] Test event detail shape where feasible.
* [ ] Test attribute/property synchronization where feasible.
* [ ] Test `direction` normalization.
* [ ] If DOM/web component tests are impractical in Bun, document manual test steps.

Documentation tasks:

* [ ] Document component purpose.
* [ ] Document attributes and properties.
* [ ] Document slots.
* [ ] Document emitted events.
* [ ] Document accessibility behavior.
* [ ] Document Shadow DOM parts.
* [ ] Add horizontal usage example.
* [ ] Add vertical usage example.
* [ ] Add Topic Research Notepad integration example.
* [ ] Document known limitations.

Manual verification:

* [ ] Render horizontal split pane in browser.
* [ ] Render vertical split pane in browser.
* [ ] Drag splitter.
* [ ] Resize with keyboard.
* [ ] Confirm focus ring.
* [ ] Confirm pane content scrolls.
* [ ] Confirm no layout overflow caused by slotted content.

Acceptance criteria:

* [ ] Split pane has unit tests or documented manual verification.
* [ ] Split pane is documented enough for future framework reuse.
* [ ] Framework distribution/build includes the component if applicable.

---

G00 Stage 4: Integrate Split Pane Into Topic Research Notepad

---

Purpose: use the framework split pane for the page sidebar and editor layout.

Implementation tasks:

* [ ] Replace fixed two-column layout with `awwbookmarklet-split-pane`.
* [ ] Put Pages sidebar into the `start` slot.
* [ ] Put editor shell into the `end` slot.
* [ ] Set initial value from settings or a sensible default.
* [ ] Use `min-start` to keep sidebar usable.
* [ ] Use `min-end` to keep editor usable.
* [ ] Listen for resize commit event.
* [ ] Persist sidebar width through app settings, not inside the framework component.
* [ ] Restore sidebar width on app startup.
* [ ] Clamp or recover safely if persisted width is no longer valid.
* [ ] Preserve current top command bar behavior.
* [ ] Preserve current page title behavior.
* [ ] Preserve current editor scroll behavior.
* [ ] Ensure sidebar and editor both scroll correctly.
* [ ] Add observability logs around width load/save if current logging infrastructure supports it.

Acceptance criteria:

* [ ] User can drag the divider to resize sidebar/editor.
* [ ] Sidebar width persists after reload.
* [ ] App falls back to a safe default if persisted width is invalid.
* [ ] The top command bar remains visually stable.
* [ ] The main editor remains usable at minimum width.
* [ ] The sidebar remains usable at minimum width.
* [ ] No unrelated layout regression is introduced.

---

H00 Stage 5: Add Rich Text Utility Layer for Controlled Contenteditable

---

Purpose: create safe helper functions before replacing textareas with contenteditable.

Implementation tasks:

* [ ] Add a module for rich text normalization and sanitization.
* [ ] Define allowed inline tags.
* [ ] Define allowed attributes.
* [ ] Strip scripts, styles, iframes, forms, event handlers, external classes, external styles, and unsupported attributes.
* [ ] Normalize legacy `content.text` records into renderable safe content.
* [ ] Support new `content.html` where implemented.
* [ ] Derive plain text from sanitized inline HTML.
* [ ] Provide helper to escape plain text into safe HTML.
* [ ] Provide helper to sanitize edited contenteditable HTML.
* [ ] Provide helper to prepare content for search indexing.
* [ ] Provide helper to prepare content for Markdown export.
* [ ] Add JSDoc typedefs for rich text content shape.
* [ ] Decide whether the first version stores sanitized `html` plus derived `text`, or stores text only with contenteditable UI.
* [ ] Document the chosen storage representation.

Recommended content shape if storing sanitized HTML:

```js
{
  html: "This is <strong>important</strong> text with <a href=\"https://example.com\">a link</a>.",
  text: "This is important text with a link."
}
```

Acceptance criteria:

* [ ] Unsafe HTML is removed.
* [ ] Allowed inline tags are preserved.
* [ ] Plain text extraction works.
* [ ] Old text-only records render correctly.
* [ ] New rich text records remain searchable.
* [ ] Markdown export can consume the chosen representation.
* [ ] No arbitrary raw pasted HTML is stored.

---

I00 Stage 6: Replace Paragraph and Heading Textareas With Contenteditable Blocks

---

Purpose: implement Approach B for the main calm editor surface.

Implementation tasks:

* [ ] Replace paragraph textarea rendering with contenteditable rendering.
* [ ] Replace heading textarea/input rendering with contenteditable rendering where appropriate.
* [ ] Preserve block IDs and data attributes.
* [ ] Preserve block type information internally.
* [ ] Preserve input event flow to update block content.
* [ ] Preserve autosave scheduling.
* [ ] Sanitize contenteditable output before storing.
* [ ] Preserve old records with only `content.text`.
* [ ] Avoid losing cursor position unnecessarily during input.
* [ ] Avoid full editor rerender on every keystroke if it causes caret jumps.
* [ ] Add contenteditable-specific input handling.
* [ ] Add composition event handling or avoid interfering with IME input.
* [ ] Add focus and blur handling.
* [ ] Ensure Enter behavior is at least safe, even if full block splitting is staged.
* [ ] Ensure paste is intercepted and routed through the safe paste flow.
* [ ] Add accessible roles/labels where necessary.
* [ ] Add focus-visible styling.

Acceptance criteria:

* [ ] Paragraphs can be edited in contenteditable regions.
* [ ] Headings can be edited in contenteditable regions.
* [ ] Edits autosave.
* [ ] Reload preserves edited content.
* [ ] Search indexes edited content.
* [ ] Markdown export includes edited content.
* [ ] The editor does not store uncontrolled browser-generated markup.
* [ ] Caret behavior is usable during normal typing.
* [ ] IME/composition is not obviously broken.

---

J00 Stage 7: Implement Bodyguard Pastebin and Safe Paste Flow

---

Purpose: prevent arbitrary pasted HTML from entering the real editor.

Implementation tasks:

* [ ] Add hidden or offscreen contenteditable pastebin element.
* [ ] Style pastebin so it does not affect layout.
* [ ] Ensure pastebin is cleared before use.
* [ ] Intercept paste events in editor contenteditable regions.
* [ ] Prevent default paste into the live editor.
* [ ] Capture HTML/plain text from clipboard where available.
* [ ] Use pastebin when browser-assisted parsing is needed.
* [ ] Read resulting pastebin DOM after paste.
* [ ] Sanitize pastebin DOM.
* [ ] Convert sanitized content into inline content or internal blocks.
* [ ] Insert sanitized inline content at caret when paste belongs inside current block.
* [ ] Create new blocks when paste contains block-level structures.
* [ ] Clear pastebin after processing.
* [ ] Restore focus to editor.
* [ ] Preserve selection/caret as well as practical.
* [ ] Add observability logs around paste start, sanitization, conversion, and insertion.
* [ ] Avoid logging full private note content.

Reference bodyguard pastebin pattern:

```css
#pastebin {
  opacity: 0.01;
  width: 100%;
  height: 1px;
  overflow: hidden;
}
```

```html
<div contenteditable="true" id="pastebin"></div>
```

Acceptance criteria:

* [ ] Pasted rich HTML never remains raw in the live editor.
* [ ] Unsafe tags and attributes are removed.
* [ ] External styles and classes do not affect the notepad UI.
* [ ] Pasting plain text works.
* [ ] Pasting links works according to the chosen rich text model.
* [ ] Pasting headings/lists/quotes/code/tables creates appropriate blocks when supported.
* [ ] Pastebin content is cleared after processing.
* [ ] Paste behavior is documented.

---

K00 Stage 8: Calm Editor Visual Pass

---

Purpose: make the editor look like a document rather than a form editor.

Implementation tasks:

* [ ] Hide paragraph block type label by default.
* [ ] Demote or hide heading block labels.
* [ ] Remove heavy paragraph borders in resting state.
* [ ] Make paragraph content look like document text.
* [ ] Make heading content look like document headings.
* [ ] Use a document text font size distinct from compact UI controls if appropriate.
* [ ] Preserve retro frame/chrome outside the document body.
* [ ] Show subtle block outline only on hover/focus if useful.
* [ ] Hide block toolbar until hover/focus.
* [ ] Fix block toolbar delete-button alignment bug.
* [ ] Ensure toolbar respects block padding.
* [ ] Ensure controls do not protrude past block boundaries.
* [ ] Preserve accessibility for hidden controls.
* [ ] Keep controls reachable by keyboard or menu where possible.
* [ ] Improve status text to be more user-facing where relevant.

Example control visibility rule:

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

Acceptance criteria:

* [ ] A page with five paragraphs looks like one document.
* [ ] Paragraph labels are not visible by default.
* [ ] Paragraphs do not look like bordered form fields.
* [ ] Block toolbars are not visually dominant.
* [ ] Delete button alignment is fixed.
* [ ] The retro UI framework remains the visual foundation.
* [ ] Existing block actions remain available.

---

L00 Stage 9: Compact Source and Quote Display

---

Purpose: reduce metadata noise while preserving research rigor.

Implementation tasks:

* [ ] Render source blocks in compact mode by default if feasible.
* [ ] Show source title, domain or URL, note, and open-link action in compact mode.
* [ ] Provide an affordance to expand/edit source details.
* [ ] Keep URL, title, note, captured text, and timestamp editable in expanded mode.
* [ ] Render quote text as primary content.
* [ ] Render quote source/attribution as compact secondary metadata.
* [ ] Decide whether expanded source state is ephemeral or persistent.
* [ ] Ensure source and quote export still works.
* [ ] Ensure source and quote search indexing still works.
* [ ] Ensure source and quote blocks remain editable.

Acceptance criteria:

* [ ] Source blocks are not large form grids by default.
* [ ] Quote blocks are readable as quotes.
* [ ] Full metadata remains accessible.
* [ ] No source data is lost.
* [ ] Export and search continue to include source/quote content.

---

M00 Stage 10: Limited Slash Commands

---

Purpose: add the first small command-like insertion surface without building a full command palette.

Implementation tasks:

* [ ] Add slash command parser.
* [ ] Open slash menu only for command-like contexts.
* [ ] Support an initial command set: `/paragraph`, `/heading`, `/quote`, `/list`, `/table`, `/code`, `/source`.
* [ ] Support short aliases only if simple and documented.
* [ ] Add keyboard navigation for slash menu.
* [ ] Support Escape to dismiss.
* [ ] Support Enter to select.
* [ ] Close menu when text no longer looks like a command.
* [ ] Insert or transform block based on command.
* [ ] Focus the resulting block after command execution.
* [ ] Ensure slash menu does not appear for normal slash use in the middle of text.
* [ ] Add observability logs for open/select/close.
* [ ] Add tests for parser and command selection logic.

Acceptance criteria:

* [ ] Typing `/quote` in an empty paragraph opens a slash command flow.
* [ ] Selecting a command creates or transforms the correct block.
* [ ] Slash menu is dismissible.
* [ ] Slash menu does not interfere with ordinary writing.
* [ ] Commands are limited and documented.
* [ ] No full command palette is introduced in this stage.

---

N00 Stage 11: Block Transform Map

---

Purpose: make block conversion explicit, safe, and testable.

Implementation tasks:

* [ ] Define a block transform map.
* [ ] Implement transform helper functions.
* [ ] Preserve content where possible.
* [ ] Do not offer transforms that lose important data.
* [ ] Use transform map in slash commands where relevant.
* [ ] Use transform map in block context/menu actions if implemented.
* [ ] Add tests for each supported transform.
* [ ] Add tests that unsupported transforms are not offered.
* [ ] Document transform rules.

Possible initial transform map:

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

Acceptance criteria:

* [ ] Valid transforms work.
* [ ] Invalid transforms are not shown.
* [ ] Text is preserved for paragraph/heading/quote/code transforms where expected.
* [ ] Tests cover transform behavior.
* [ ] Transform behavior is documented.

---

O00 Stage 12: Preserve Search, Export, Backup, and Autosave

---

Purpose: ensure the new editor model does not break existing core product behavior.

Implementation tasks:

* [ ] Update search text extraction for rich text content.
* [ ] Update Markdown export for rich text content.
* [ ] Update JSON backup if content shape changes.
* [ ] Ensure old backups/content still load if practical.
* [ ] Ensure autosave stores sanitized data.
* [ ] Ensure edited content reloads correctly.
* [ ] Ensure Worker/storage messages still use structured-clone-safe data.
* [ ] Ensure backup does not contain transient pastebin or UI-only state.
* [ ] Ensure search index is rebuilt or updated correctly after contenteditable edits.
* [ ] Ensure export flushes pending writes before reading data.

Acceptance criteria:

* [ ] Search finds text edited through contenteditable.
* [ ] Markdown export includes edited content.
* [ ] JSON backup includes the new content shape correctly.
* [ ] Reload after edit works.
* [ ] Autosave status remains accurate.
* [ ] No transient DOM state is persisted.

---

P00 Stage 13: Tests for Editor, Paste, Rich Text, and Slash Commands

---

Purpose: add meaningful verification for the high-risk changes.

Test checklist:

* [ ] Sanitizer preserves allowed inline tags.
* [ ] Sanitizer strips scripts.
* [ ] Sanitizer strips event handlers.
* [ ] Sanitizer strips external styles and classes.
* [ ] Sanitizer handles malformed HTML.
* [ ] Plain text extraction works.
* [ ] Legacy `content.text` normalization works.
* [ ] New `content.html` normalization works if implemented.
* [ ] Markdown export handles links.
* [ ] Markdown export handles bold/italic/code if implemented.
* [ ] Search extraction handles rich text.
* [ ] Slash command parser recognizes allowed commands.
* [ ] Slash command parser ignores normal slash text.
* [ ] Slash command selection maps to correct block type.
* [ ] Block transform helper preserves content.
* [ ] Unsupported block transforms are rejected.
* [ ] Paste conversion handles plain text.
* [ ] Paste conversion handles safe inline HTML.
* [ ] Paste conversion strips unsafe HTML.
* [ ] Existing model tests still pass.
* [ ] Existing storage client tests still pass.
* [ ] Existing logger tests still pass.
* [ ] Existing export/search tests still pass.

Acceptance criteria:

* [ ] Relevant Bun tests pass.
* [ ] Regression tests are updated where old textarea assumptions changed.
* [ ] Any untestable browser behavior is documented with manual steps.

---

Q00 Stage 14: Documentation and Implementation Notes

---

Purpose: keep the project understandable for future Codex runs and for the project owner.

Documentation tasks:

* [ ] Update README or developer notes with split pane usage if relevant.
* [ ] Add or update framework component documentation for split pane.
* [ ] Document contenteditable editing model.
* [ ] Document allowed inline HTML schema.
* [ ] Document bodyguard pastebin behavior.
* [ ] Document slash command behavior.
* [ ] Document block transform map.
* [ ] Document content storage representation.
* [ ] Document known limitations.
* [ ] Document manual test plan.
* [ ] Document meaningful deviations from `suggestions002-1.md` or `suggestions002-2.md`.
* [ ] Add comments near non-obvious sanitizer logic.
* [ ] Add comments near contenteditable input handling.
* [ ] Add comments near pastebin focus/selection handling.
* [ ] Add JSDoc for public helper functions.

Acceptance criteria:

* [ ] Future implementer can understand why contenteditable is restricted.
* [ ] Future implementer can understand how paste is quarantined.
* [ ] Future implementer can understand how split pane emits events.
* [ ] Known limitations are explicit.
* [ ] No stale documentation contradicts the implementation.

---

R00 Stage 15: Final Manual Verification

---

Manual verification checklist:

* [ ] Open the built app in a modern Chromium browser.
* [ ] Confirm the app loads without console errors.
* [ ] Confirm split pane appears between sidebar and editor.
* [ ] Resize sidebar with pointer.
* [ ] Resize sidebar with keyboard.
* [ ] Reload and confirm sidebar width persists.
* [ ] Create a page.
* [ ] Edit page title.
* [ ] Type several paragraphs.
* [ ] Confirm paragraphs look document-like.
* [ ] Confirm paragraph labels are hidden.
* [ ] Create a heading.
* [ ] Confirm heading looks like a heading.
* [ ] Edit paragraph and wait for save.
* [ ] Reload and confirm content persists.
* [ ] Paste plain text.
* [ ] Paste rich HTML from a website.
* [ ] Confirm pasted styles/scripts do not enter editor.
* [ ] Paste a link.
* [ ] Confirm link behavior matches chosen model.
* [ ] Type `/quote` in an empty paragraph.
* [ ] Select quote command.
* [ ] Confirm quote block appears.
* [ ] Press Escape while slash menu is open.
* [ ] Confirm slash menu closes.
* [ ] Hover a block.
* [ ] Confirm controls appear only on hover/focus.
* [ ] Confirm delete button alignment is fixed.
* [ ] Add a source block.
* [ ] Confirm compact or less noisy display.
* [ ] Search for edited content.
* [ ] Export Markdown.
* [ ] Export JSON backup.
* [ ] Refresh app and confirm selected page restores.
* [ ] Confirm no raw pastebin content appears in document.
* [ ] Confirm no new dependency was installed.

---

S00 Final Acceptance Criteria

---

The combined change set is accepted when:

* [ ] The retro UI framework includes a reusable split pane component.
* [ ] Topic Research Notepad uses the split pane for sidebar/editor resizing.
* [ ] Sidebar width can be persisted and restored.
* [ ] Paragraph and heading editing uses lightweight contenteditable or a clearly documented transitional equivalent.
* [ ] Paragraphs no longer look like labeled form cards.
* [ ] Paragraph labels are hidden or removed by default.
* [ ] Block controls are hidden or visually demoted until user intent.
* [ ] The delete button alignment bug is fixed.
* [ ] Contenteditable output is sanitized and controlled.
* [ ] The bodyguard pastebin or equivalent safe paste pipeline exists.
* [ ] Raw external HTML is not inserted into the live editor.
* [ ] A limited slash command system exists.
* [ ] Block transforms use an explicit valid conversion map.
* [ ] Source and quote blocks are visually calmer or compact where implemented.
* [ ] Existing autosave works.
* [ ] Existing IndexedDB persistence works.
* [ ] Existing search works.
* [ ] Existing Markdown export works.
* [ ] Existing JSON backup works.
* [ ] Tests pass.
* [ ] Build passes.
* [ ] Manual browser verification passes.
* [ ] Documentation and implementation notes are updated.
* [ ] No new NPM modules are installed.
* [ ] No full rich editor engine is introduced.
* [ ] No unrelated UI system is introduced.
* [ ] All meaningful deviations are documented.

---

T00 Final Summary Required From Codex

---

At completion, Codex should produce a final implementation summary containing:

* [ ] What changed in the retro UI framework.
* [ ] How the split pane component works.
* [ ] How Topic Research Notepad uses the split pane.
* [ ] What changed in the editor rendering.
* [ ] How contenteditable content is sanitized and stored.
* [ ] How the bodyguard pastebin works.
* [ ] What slash commands were implemented.
* [ ] What block transforms were implemented.
* [ ] What tests were added or updated.
* [ ] What manual verification was performed.
* [ ] What documentation was updated.
* [ ] What limitations remain.
* [ ] What future work should happen next.


