# Suggestions 004 Research Result: Capture-First Research Notepad UX

Date: 2026-04-28

Project: Topic Research Notepad

Source request: `suggestions004-1-research.md`

Primary code inspected:

- `src/ui.js`
- `styles.css`
- `src/models.js`
- `src/storage-worker.js`
- `src/storage-client.js`
- `src/search.js`
- `src/paste.js`
- `src/block-transforms.js`
- `src/exporters.js`
- `2026-04-26-user-enhancement-research.md`

## Executive Decision

The next product work should not be a redesign and should not be a full editor-engine rewrite. The best path is a focused "writing continuity and recoverability" pass that makes the existing block model feel like one document while preserving the retro shell.

The current app already has a strong local-first foundation: IndexedDB persistence through a worker, page/block records, debounced saves, search index records, Markdown/JSON export, rich text paragraphs/headings, paste conversion, block transforms, slash commands, contextual block controls, a resizable sidebar, promptless New Page, and block-boundary ArrowUp/ArrowDown navigation. That means the next valuable improvements are not basic infrastructure. They are the interaction details that determine whether the app feels like a notebook or a set of separate form controls.

My recommended implementation order is:

1. **P0: Recoverability and safe structure**
   Add page delete/archive with undo, make New Page creation undoable, make Add Block/Add Paragraph undoable, make page reorder undoable, and make delete/move/transform focus the correct nearby target. This directly increases user trust.

2. **P0: Active insertion point**
   Track the currently focused block and make toolbar insertions happen after that block instead of always at the end. Keep the bottom `+ Add paragraph` for end insertion. This makes the toolbar predictable and makes the editor behave like a document.

3. **P0: Backspace behavior for empty blocks**
   Pressing Backspace at the start of an empty paragraph should remove that paragraph and focus the previous editable block. This is the missing counterpart to Enter/Add Paragraph and prevents empty-block buildup.

4. **P1: Actual paragraph splitting**
   The current Enter behavior creates a new paragraph below, but it does not truly split content at the caret. That is acceptable for "continue writing at end" but not a complete document-editor model. Add true split-at-caret for paragraph/heading contenteditable blocks.

5. **P1: Title safety**
   Keep inline title editing, but handle empty titles, Enter, and Escape. Empty title should normalize to a stable fallback. Escape should restore the title value from focus start if feasible.

6. **P1: Search result UX**
   Search is implemented, but the experience is still utility-like. Add no-results state, result count, match highlighting or stronger excerpt context, Escape-to-clear, and a visible focused-block flash when opening a result.

7. **P1: Source/code/quote clarity**
   Keep source blocks, but make their purpose clearer through labels/placeholders and collapsed metadata. Do not invent a large citation system yet.

8. **P2: Inline insertion affordance**
   Keep the toolbar for now, but add contextual `+` insertion between blocks or a keyboard-opened insert menu. This should come after active insertion point and focus handling are stable.

9. **P2: Keyboard commands and command palette**
   Add a small command layer for actions like Move block up/down, Delete block, Turn into, Move page, Focus search, and Export. Do this only after the command surface is clear enough to avoid duplicating existing controls awkwardly.

10. **Do not implement now**
    Do not add cloud sync, authentication, collaboration, comments, a full ProseMirror/Tiptap rewrite, nested pages, backlinks, tags, smart folders, drag-and-drop nesting, or cross-block text selection in the next pass. Some are valuable long-term, but they are not the bottleneck today. The current bottleneck is writing continuity, focus, and recoverability.

## Current App State Summary

The project is already more advanced than a simple static demo. It has durable local data, a worker persistence layer, semantically typed blocks, rich text for paragraphs/headings, paste normalization, search, export, and several recent UX fixes.

### Implemented Core Architecture

The app is rendered by `TopicResearchApp` in `src/ui.js`. The class owns shell rendering, page list rendering, editor rendering, click/input/key/paste handling, page and block mutations, search, export, status, and error display.

Persistence is worker-owned. `src/storage-worker.js` opens Dexie, stores pages, blocks, search index entries, and settings, and exposes message actions such as `createPage`, `updatePage`, `updateBlock`, `replaceBlocks`, `deleteBlock`, `reorderPages`, `reorderBlocks`, `setSetting`, `search`, and `exportWorkspace`.

The page and block schema is already future-friendly. `src/models.js` includes fields such as `archivedAt`, `deletedAt`, `pinned`, `color`, `summary`, `metadata`, `source`, `contentVersion`, and normalized typed content. This matters because several future UX improvements can be implemented without a disruptive schema redesign.

The block model supports these types:

- Paragraph
- Heading
- Quote
- List
- Table
- Code
- Source

The app also already has a small transform system in `src/block-transforms.js`. Paragraphs can become heading, quote, list, table, code, or source. Headings can become paragraph or quote. Quote, code, and list can become paragraph. Table and source conversions are intentionally limited to avoid silent data loss.

### Implemented Recent Suggestions

Several suggestions from the previous pass are already implemented:

- New Page no longer uses `prompt()`.
- New Page creates a default unique title.
- New Page focuses and selects the inline page title.
- The editor width uses a larger responsive max-width.
- Sidebar reorder controls are contextual, not permanently shown for selected rows.
- Sidebar long titles ellipsize and expose the full title through `title`.
- Active rich-text blocks have additional padding.
- ArrowUp/ArrowDown navigation exists between rich-text blocks at visual boundaries.
- Repeated ArrowDown does not create unlimited empty paragraphs.
- Paragraph and heading blocks use contenteditable rich text with inline HTML sanitization.
- Slash command transform UI exists for paragraph blocks.
- Block toolbars are hidden until hover/focus.

These are meaningful improvements. The remaining work should build on them rather than replace them.

## Product Model

The product should optimize for the mental state of research capture:

- The user is thinking and collecting material.
- The user often does not know the final structure yet.
- The user needs fast capture first and organization second.
- The user needs to trust local persistence.
- The user needs to move through notes without grabbing the mouse.
- The UI should look plain and retro, but not careless or cramped.

The correct target is not "Notion clone." The correct target is "local-first retro writing desk with modern editor behaviors." The app can keep simple borders, compact controls, subdued colors, visible page list, and a status bar. The interactions should still feel current: promptless creation, inline editing, contextual controls, keyboard flow, safe undo, clear focus, non-destructive search, and recoverable mistakes.

## What We Should Implement Next

### 1. P0: Recoverability and Page Lifecycle

#### Current status

Partially implemented.

Block delete, block move, and block transform push a block-level undo snapshot through `pushBlockUndo()`. `undoStructural()` restores a page's blocks from that snapshot. This is a good start.

However, undo currently does not cover:

- New page creation.
- Page title changes.
- Page reorder.
- Add block.
- Add paragraph.
- Paragraph creation through Enter.
- List item add.
- Table row/column add.
- Table row delete.
- Page deletion, because there is no page deletion UI yet.

The storage schema already has `deletedAt` on pages and blocks. Blocks are soft-deleted through `deleteBlock()`. Pages are normalized with `deletedAt`, but there is no `deletePage` worker action and no UI affordance for removing a page.

#### Why users will value this

The app is becoming easier to create content in. That makes recoverability more important. Promptless New Page is good because it lowers friction, but it also makes accidental page creation more likely. If a user can create a page in one click, they need a way to remove or undo that page.

Recoverability is more valuable than confirmations in this app. Confirmation dialogs interrupt writing. Undo lets users move quickly and recover from mistakes.

#### Recommended implementation

Add an app-level undo stack that can store more than block snapshots. Keep the existing block snapshot path, but expand entries to support page and mixed operations.

Suggested undo entry types:

```js
{
  type: "restoreBlocks",
  pageId,
  reason,
  blocks
}

{
  type: "restorePagesAndBlocks",
  reason,
  pages,
  blocks,
  selectedPageId
}

{
  type: "deletePage",
  reason,
  page,
  blocks,
  previousSelectedPageId
}
```

For implementation simplicity, the first pass can snapshot all pages and all blocks before page-level structural actions. The data set is local and likely small. If performance becomes a concern, optimize later.

Add storage worker actions:

- `deletePage`: soft-delete page and its blocks, delete related search index entries, update `selectedPageId`.
- `restorePage`: clear `deletedAt` on a page and its blocks, re-index them.
- Potentially `replaceWorkspaceSubset`: restore all pages/blocks for an undo snapshot. This is heavier but simple.

Add UI:

- Contextual page delete button in the sidebar row actions.
- Keep it secondary: visible on hover/focus alongside page reorder controls.
- Use label `DEL` or a small retro button, consistent with block delete.
- No confirmation for empty pages.
- For non-empty pages, either rely on undo or use a lightweight second-step only if accidental deletion proves likely. I recommend undo first, no confirmation.

#### Acceptance criteria

- User creates a page by accident and can undo it.
- User deletes an empty page and can undo it.
- User deletes a non-empty page and can undo it.
- Undo restores page order, title, blocks, and selection.
- Search index does not keep returning deleted pages.
- Refresh after deletion preserves deletion.
- Refresh after undo preserves restoration.

#### Risks

- Page delete touches page records, block records, search index, and selected-page setting. It should be transactional in the worker.
- If undo remains in memory only, refresh after deletion loses the undo opportunity. That is acceptable initially, but the UI should not imply permanent history.

### 2. P0: Active Insertion Point

#### Current status

Partially implemented.

The toolbar at the top inserts blocks, but `addBlock(type)` always appends to the end of the current page. The bottom `+ Add paragraph` also appends to the end, which is correct for that affordance. The top toolbar behavior is less clear because it is positioned near the page title, not near the insertion point, and it does not use the currently focused block.

The app has `focusedBlockId` state, but it appears to be used primarily for search-result highlighting and CSS. It is not updated on ordinary block focus and does not drive insertion.

#### Why users will value this

Research notes are rarely written strictly from top to bottom. Users often review a paragraph and want to add a quote or source directly below it. If the toolbar always appends to the end, the user must create the block, then move it, or manually navigate. That makes the app feel mechanical.

If the user is focused in a block, "Heading", "Quote", "Code", or "Source" should create the chosen block after that active block. That is the most predictable behavior.

#### Recommended implementation

Track active block focus:

- On `focusin` inside `[data-block-id]`, set `this.state.focusedBlockId`.
- On editor render, preserve focus when possible.
- Do not over-render on every focus event; only update state unless a visual change is necessary.

Change `addBlock(type)` signature:

```js
async addBlock(type, options = {}) {
  const page = this.selectedPage();
  const blocks = this.blocksForPage(page.id);
  const afterBlockId = options.afterBlockId ?? this.state.focusedBlockId;
  const insertIndex = afterBlockId
    ? blocks.findIndex((block) => block.id === afterBlockId) + 1
    : blocks.length;
  // insert, renumber, replaceBlocks, render, focus if requested
}
```

Behavior:

- Top toolbar inserts after focused block if focus is inside a block.
- Top toolbar inserts at end if no block is focused.
- Bottom `+ Add paragraph` always inserts at end.
- Slash command should continue transforming the current block, not inserting a new block.
- Enter should create below current paragraph.
- Paste multi-block should continue inserting after the focused/current block.

#### Acceptance criteria

- Focus paragraph 2, click Quote in toolbar, quote appears below paragraph 2.
- With no block focused, click Quote, quote appears at the end.
- Bottom `+ Add paragraph` still adds at the end.
- New block receives focus if it has an editable target.
- Existing page order and block order remain stable after refresh.

#### Risks

- Re-rendering the editor can lose native browser undo stack inside contenteditable. This is already a general risk in the current architecture. Avoid unnecessary renders on focus.

### 3. P0: Backspace on Empty Paragraph

#### Current status

Not implemented.

The current keyboard work covers:

- Enter creates a new paragraph below the current paragraph.
- ArrowDown at bottom moves to next block or creates one controlled empty paragraph.
- ArrowUp at top moves to previous block.
- Slash command navigation uses ArrowUp/ArrowDown while slash menu is open.

There is no Backspace boundary behavior. Empty paragraph blocks can be created and then must be deleted with block controls or ignored.

#### Why users will value this

Backspace is the natural correction path for accidental paragraph creation. If Enter creates a new paragraph, Backspace on an empty paragraph should remove it. This is a standard writing-flow expectation.

This also completes the safety model for repeated empty-block creation. The app already avoids creating unlimited empty paragraphs. Backspace should now make removing one empty landing block equally cheap.

#### Recommended implementation

In `handleKeydown()` for `[data-rich-text]`:

- If key is Backspace.
- If the editable is a paragraph.
- If selection is collapsed.
- If caret is at the start boundary.
- If block content is empty or whitespace.
- If there is a previous block.
- Prevent default.
- Push undo snapshot.
- Delete current block.
- Focus previous block at end.

Do not implement merge of non-empty paragraphs in the same pass unless it is straightforward. Empty-block deletion is the P0 value. Non-empty merge is useful, but more complex with rich inline HTML.

#### Acceptance criteria

- Create an empty paragraph with Enter or ArrowDown.
- Press Backspace.
- Empty paragraph is removed.
- Focus moves to previous block at end.
- Undo restores the removed paragraph.
- Press Backspace at the start of the first empty paragraph does not break focus.

#### Risks

- Contenteditable selection boundary helpers are already present. Reuse them, but test IME and selected-text cases carefully.

### 4. P1: Actual Paragraph Splitting

#### Current status

Partially implemented but semantically incomplete.

`splitParagraphBlock(editable)` is named as if it splits a paragraph. In practice, it applies the current block input, creates a new empty paragraph after the block, replaces page blocks, renders, and focuses the new block. It does not split the current block's content at the caret.

This means:

- Enter at the end behaves acceptably: it creates the next paragraph.
- Enter in the middle does not move trailing text to the new paragraph.
- Enter at the beginning does not create a paragraph above with the existing text moved below.

#### Why users will value this

Actual split-at-caret behavior is core document editing. Without it, editing existing paragraphs feels wrong: users cannot naturally break a paragraph into two paragraphs where the caret is.

#### Recommended implementation

Implement split in phases:

Phase 1:

- If caret is at the end, keep current behavior.
- If caret is at the beginning or middle, use Selection/Range to split sanitized inline HTML into before/after fragments.
- Current block gets before fragment.
- New paragraph gets after fragment.
- Normalize both with `normalizeRichTextContent()`.

Phase 2:

- Preserve inline tags across split boundaries more carefully.
- Add tests around sanitized HTML split cases.

The contenteditable model stores sanitized inline HTML, so the split helper should be DOM-based rather than string-based.

Pseudo-shape:

```js
function splitEditableHtmlAtSelection(editable) {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);

  const before = document.createRange();
  before.selectNodeContents(editable);
  before.setEnd(range.startContainer, range.startOffset);

  const after = document.createRange();
  after.selectNodeContents(editable);
  after.setStart(range.startContainer, range.startOffset);

  return {
    beforeHtml: sanitizeInlineHtml(fragmentHtml(before.cloneContents())),
    afterHtml: sanitizeInlineHtml(fragmentHtml(after.cloneContents())),
  };
}
```

#### Acceptance criteria

- Enter at end creates an empty paragraph below.
- Enter in middle splits text into two paragraphs.
- Enter at beginning creates an empty paragraph above or moves the current content down, depending on final chosen model.
- Inline allowed tags survive when possible.
- Search index updates both blocks.
- Undo restores pre-split state.

#### Risks

- DOM range splitting can create malformed or unexpected inline HTML if not normalized.
- Native browser undo and app-level undo can interact confusingly after re-render.

### 5. P1: Title Safety and Title Editing Model

#### Current status

Partially implemented.

Page title is directly editable through an input. New Page focuses and selects that title. Input changes save through `queuePageSave()` and update the sidebar immediately.

Missing:

- Empty title handling at blur.
- Enter behavior.
- Escape behavior.
- Undo title change.
- Avoiding sidebar jitter while typing very long titles.

The model normalizer defaults empty titles to `"Untitled research"` only when normalizing records. During live editing, a page can temporarily have an empty title and render as an empty sidebar button until saved/reloaded normalizes it.

#### Why users will value this

Inline page naming is correct. But title editing is a high-value field. It should not be fragile. A blank title in the sidebar makes pages hard to find and creates unnecessary anxiety.

#### Recommended implementation

On focus:

- Store the starting title in `data-initial-title` or component state.

On input:

- Continue updating state and sidebar live.

On keydown in page title:

- Enter: blur and flush.
- Escape: restore initial title, save/queue save, blur.

On blur:

- If trimmed title is empty, set `"New research page"` or `"Untitled research"`.
- I recommend `"Untitled research"` for empty title recovery because `"New research page"` is creation-specific and numbered variants could be confusing after rename.

Add app-level undo later:

- Undo title change could restore previous title if the change is committed on blur, not on every keystroke.

#### Acceptance criteria

- New page title selected on create.
- Empty title normalizes on blur.
- Enter commits title.
- Escape restores title from focus start.
- Sidebar never stays blank after blur.
- Refresh preserves the normalized title.

### 6. P1: Search UX Refinement

#### Current status

Partially implemented.

Search is local and non-destructive. It queries the worker search index. Results render above the editor. Clicking a result selects the page, sets `focusedBlockId`, renders the editor, and scrolls the block into view.

Missing:

- No result count.
- No no-results empty state.
- No match highlighting.
- No keyboard shortcut to focus search.
- Escape does not clear search.
- Search result opening scrolls the block but does not focus editable text.
- `focusedBlockId` styling shares the normal focused-block visual, but there is no temporary flash to orient the user.
- Search results push the editor down, which can be visually disruptive.

#### Why users will value this

Research notes are only useful if material can be recovered. Search is a core local-first promise. The data is already indexed; the UX should make the index feel reliable and calm.

#### Recommended implementation

Low-cost improvements:

- Add result count: `5 matches`.
- Add no-results panel: `No local matches for "..."`.
- Add Escape-to-clear when search input is focused.
- Add `/` or `Ctrl/Cmd+F` handling carefully:
  - Browser find is useful, so hijacking `Ctrl/Cmd+F` may be controversial.
  - Prefer `Ctrl/Cmd+K` for command palette later and `/` only when not editing.
  - A simple `Alt+F` or `Ctrl/Cmd+Shift+F` could focus app search.
- When opening a block result:
  - Scroll block into center.
  - Focus the editable control if it is paragraph/heading or first input/textarea otherwise.
  - Add a temporary `.is-search-hit` class or state to flash the block border.

Medium-cost improvements:

- Highlight the matched substring in result preview.
- Group results by page when result count grows.
- Keep result panel compact to avoid pushing the editor too far down.

#### Acceptance criteria

- Search with no matches says so.
- Search with matches gives count and stable result rows.
- Opening a result orients the user visually.
- Search never changes content.
- Clearing search restores normal editor view.

### 7. P1: Source, Quote, and Code Block Clarity

#### Current status

Partially implemented.

Code blocks have a language input and text area. Quote blocks have quote text, attribution, and source URL. Source blocks are rendered as a details disclosure with URL, title, note, and captured text fields.

This is structurally good, but the UX still needs clearer purpose. The source block label is `Source`, but users need to understand whether it is a bookmark, a citation, an excerpt, or captured research material.

#### Why users will value this

Research workflows are paste-heavy. A clear source block helps users preserve provenance. If source blocks are unclear, users will dump everything into paragraphs and lose context.

#### Recommended implementation

Keep the existing data shape. Improve labels and placeholders:

- URL placeholder: `Source URL`
- Title placeholder: `Source title`
- Note placeholder: `Why this source matters`
- Captured text placeholder: `Paste source excerpt or captured text`
- Summary collapsed label:
  - If title exists, show title.
  - Else if domain exists, show domain.
  - Else show `Source reference`.

Consider adding a small `Capture source` button later, but not now.

Quote block:

- Keep visible quote text.
- Make attribution and source URL quieter, perhaps in a collapsible metadata row if visual noise remains.

Code block:

- Keep language field.
- Consider placeholder `Language (optional)` and `Paste code or terminal output`.

#### Acceptance criteria

- Source block communicates what to paste.
- Quote metadata does not visually dominate the quote.
- Code block preserves whitespace and remains clearly different from source.

### 8. P2: Inline Add Controls

#### Current status

Partially implemented.

There is a top block-add toolbar and a bottom `+ Add paragraph` button. Slash commands exist, but only as transform commands when a paragraph contains only slash command text. There is no between-block add affordance.

#### Why users will value this

Inline insertion makes the editor feel continuous. If the user is reading the middle of a note and wants to add a paragraph or source there, the affordance should be near that location.

#### Recommended implementation

Do not remove the top toolbar yet. First add active insertion point. Then add contextual inline insertion:

- On block hover/focus, show a small `+` in the block toolbar or left gutter.
- Clicking `+` opens a small insert menu with block types.
- Selecting a type inserts below that block and focuses the new block.
- Keyboard path can be `Ctrl/Cmd+Enter` or command palette later.

The existing slash menu can later support insertion mode:

- Empty paragraph with `/quote` transforms into quote. This is already close to current behavior.
- A future insert menu could create a new block without replacing current content.

#### Acceptance criteria

- User can insert a block between existing blocks with mouse.
- User can insert a block between existing blocks with keyboard.
- Top toolbar remains understandable.
- No layout jump or paragraph rewrap when controls appear.

### 9. P2: Command Palette and Keyboard Shortcuts

#### Current status

Partially implemented through specific key handlers and slash menu.

The UI framework includes a command palette component, but the app does not currently use it. The app has specific shortcuts:

- App-level undo only when focus is not in text editing.
- Slash command menu inside paragraph blocks.
- Arrow navigation between rich-text blocks.
- Enter in paragraph creates a paragraph below.

#### Why users will value this

Keyboard-first users benefit from a discoverable command layer. A command palette also reduces the need to expose every secondary action as permanent chrome.

#### Recommended implementation

Do not start with a large command framework. Start with a small command registry inside the app:

```js
const commands = [
  { id: "focusSearch", label: "Focus search", run: () => ... },
  { id: "newPage", label: "New page", run: () => ... },
  { id: "addParagraph", label: "Add paragraph", run: () => ... },
  { id: "moveBlockUp", label: "Move block up", run: () => ... },
  { id: "moveBlockDown", label: "Move block down", run: () => ... },
  { id: "deleteBlock", label: "Delete block", run: () => ... },
  { id: "exportMarkdown", label: "Export Markdown", run: () => ... },
];
```

Then wire to a simple overlay or the UI framework command palette if it is ergonomic.

Recommended shortcuts:

- `Ctrl/Cmd+K`: command palette.
- `Ctrl/Cmd+Shift+F`: focus local search.
- `Alt+ArrowUp/Alt+ArrowDown`: move current block.
- `Ctrl/Cmd+Enter`: add paragraph below.

Avoid overriding native text behavior inside contenteditable unless the modifier combination is clearly app-level.

#### Acceptance criteria

- Command palette opens without breaking text editing.
- Commands reflect current context.
- Actions have the same undo/focus behavior as button actions.
- Keyboard users can reorder/delete/transform without hunting for tiny buttons.

## What We Can Implement Later, But Should Not Prioritize Now

### Nested Pages

Nested pages are valuable for larger research projects, but not the next bottleneck. The current flat page list is acceptable if title truncation, search, deletion, and reorder are solid.

Implementing nested pages would require:

- `parentPageId` or path metadata.
- Tree rendering.
- Expand/collapse state.
- Indent/outdent.
- Drag or move-to command.
- Migration and export decisions.

This is P3 unless the product direction becomes "project knowledge base" rather than "research notepad."

### Drag-and-Drop Reordering

Drag-and-drop is useful, but up/down buttons are acceptable at current scale. Keyboard and focus behavior should be fixed first. Drag-and-drop also creates accessibility and touch/precision concerns unless paired with keyboard alternatives.

This is P3.

### Tags, Smart Views, Backlinks, Wiki Links

These are useful knowledge-management features, but they expand the product from a capture notebook to a personal knowledge base. The current app should first become excellent at capturing, editing, searching, and recovering notes.

This is P3/P4.

### Full Editor Engine Rewrite

A ProseMirror/Tiptap-style editor would solve many deep editor problems, but it would also change the architecture substantially. The current app has simple local models, no dependency installation posture, and a small custom UI. A full editor engine is not justified until the current block editor hits hard limits around selection, rich formatting, complex paste, markdown shortcuts, or cross-block manipulation.

This is not recommended now.

### Cross-Block Text Selection

Cross-block selection is a hard editor problem. It is useful, but not necessary for the next UX pass. Users can still select text within blocks and export the page.

This is not recommended now.

### Cloud Sync, Authentication, Collaboration

These are out of scope. The app is explicitly local-first and currently communicates that through "saved locally." Adding accounts or sync would change product trust, privacy, storage, conflict resolution, and testing requirements.

Do not implement.

### Comments and Review Workflows

Comments do not fit the immediate single-user local notepad model. They would add interface weight and collaboration assumptions.

Do not implement now.

## Suggestion-by-Suggestion Status Audit

### A00. UX model for the Topic Research Notepad

Status: Partially implemented.

The app is moving toward a lightweight research desk. Promptless page creation, block-based editing, local save status, rich paragraphs, slash transforms, and keyboard movement support the model. Remaining friction: toolbar insertion is not context-aware, Undo is incomplete, page deletion is missing, title editing is fragile, and search is under-polished.

Decision: Continue this direction. Do not redesign the shell.

### B00. Optimize for capture first, organization second

Status: Mostly implemented for page creation, partially implemented for writing flow.

New Page now creates immediately and focuses the title. Enter creates another paragraph. ArrowDown can create one paragraph at the end. But top toolbar insertion still asks the user to manage structure by appending at the end, and deletion/recovery is incomplete.

Decision: Implement active insertion point and recoverability next.

### C00. Clear hierarchy

Status: Partially implemented.

The shell, sidebar, title, toolbar, blocks, and status are visually separated. Recent changes reduce sidebar clutter and widen the editor. But the top toolbar still competes with the title/content, and search results can push the editor down.

Decision: Keep hierarchy, make toolbar and search less intrusive later.

### D00. Document, not disconnected fields

Status: Partially implemented.

Paragraph and heading contenteditable blocks improve the document feel. Arrow block navigation helps. But quote, source, table, list, and code remain form-like. That is acceptable for specialized blocks, but normal text flow still needs Backspace, active insertion, and true split.

Decision: Implement writing-continuity behaviors before restyling specialized blocks.

### E00. Predictable keyboard movement

Status: Partially implemented.

ArrowUp/ArrowDown behavior exists for rich-text block boundaries and preserves native movement inside multiline content. Slash menu arrow navigation exists. Missing: Backspace empty-block deletion, richer Enter split, block movement shortcuts, and page/sidebar keyboard actions.

Decision: Add Backspace and structural keyboard shortcuts in stages.

### F00. Avoid accidental destructive or multiplying actions

Status: Partially implemented.

Repeated ArrowDown empty-paragraph creation is guarded. Block deletion has undo. But page creation cannot be undone, page deletion is missing, add block cannot be undone, and page reorder cannot be undone.

Decision: Expand structural undo and add page lifecycle actions.

### G00. Forgiving creation model

Status: Partially implemented.

The app supports New Page, toolbar block insertion, Enter paragraph creation, ArrowDown paragraph creation, and bottom `+ Add paragraph`. Missing: active insertion, Backspace empty removal, and page delete/undo.

Decision: Improve creation cleanup and insertion location.

### H00. Distinguish primary and secondary controls

Status: Mostly implemented for sidebar/block controls, partially for top toolbar.

Sidebar reorder controls are contextual. Block toolbar is contextual. The top block toolbar remains persistent and may be acceptable for now, but it still competes with writing.

Decision: Keep it until active insertion is implemented; then evaluate inline add.

### I00. Sidebar as navigation map

Status: Mostly implemented for current scope.

Active page highlight exists. Long title ellipsis exists. Full title tooltip exists. Sidebar resize persists. Reorder controls show on hover/focus. Missing: page delete/archive, stronger keyboard page management, optional page count or search filtering.

Decision: Add page delete/archive and keyboard accessibility improvements before larger hierarchy features.

### J00. Search local, fast, non-destructive

Status: Partially implemented.

Search uses the local worker index and does not mutate content. Results show page title and preview. Missing: no-results state, result count, highlighting, better orientation after opening a result, and search keyboard flow.

Decision: Implement P1 search polish.

### K00. Page creation immediate and reversible

Status: Immediate is implemented; reversible is not.

Promptless New Page with unique default title exists. New page becomes active and title is focused. But Undo does not remove accidental pages, and no page deletion exists.

Decision: Make page creation undoable and add page delete/archive.

### L00. Page titles editable, not fragile

Status: Partially implemented.

Inline title editing exists and saves locally. New title focus/select exists. Missing empty-title recovery, Enter/Escape semantics, and title edit undo.

Decision: Add title safety.

### M00. Toolbar should clarify insert or transform

Status: Partially implemented.

The block-level `Turn into` menu clearly transforms. The top toolbar currently inserts new blocks at the end. The UI label "Add content block" suggests insertion, but the insertion location is not context-aware.

Decision: Keep top toolbar as insertion-only. Make insertion location active-block-aware. Do not make the top toolbar transform current blocks because slash and `Turn into` already cover transforms.

### N00. Block controls local and contextual

Status: Mostly implemented.

Block controls appear on hover/focus and are visually attached. Delete has undo for blocks. Missing: focus restoration after delete/move, keyboard shortcuts, and stronger protection/undo for all structural operations.

Decision: Improve focus and undo, not visual redesign.

### O00. Source blocks clear purpose

Status: Partially implemented.

Source block structure exists and is more citation-like than code. But placeholders and labels should be clearer. Source block transform from paragraph uses text as title, which is reasonable but could be improved.

Decision: Improve copy and collapsed summary. Do not add full citation manager.

### P00. Paste-heavy workflows

Status: Mostly implemented at the data conversion level, partially at UX level.

The paste pipeline converts HTML/plain text to blocks, supports lists/tables/code/headings/quotes/source links, sanitizes inline paste, and inserts multi-block paste after the current block. Missing: user-visible feedback and maybe deliberate policy around multi-paragraph paste into a paragraph block.

Decision: Keep current paste model. Add tests/manual verification for contenteditable inline paste and multi-block paste after active insertion changes.

### Q00. Saving visible but quiet

Status: Implemented.

Status text maps to saved/saving/dirty/failed/loading states. Storage client emits save-status events. Flush happens on blur, visibility change, and pagehide.

Decision: Preserve. Only improve error recovery if real failures are observed.

### R00. Undo should match expectations

Status: Partially implemented.

Structural block undo exists, but the visible Undo button implies broader undo than it currently provides. Native browser undo covers text while editing, but app-level undo covers only some block operations.

Decision: Expand structural undo or rename/retitle the button until it does what users expect. Better path is to expand undo.

### S00. Focus intentional

Status: Partially implemented.

New Page focuses title. Add paragraph focuses new block. Transform focuses transformed block. Search scrolls selected result. Missing: focus after add block from toolbar, delete block, move block, move page, search result editable focus, and active insertion tracking.

Decision: Implement focus policy with every structural action.

### T00. Plain style, deliberate spacing

Status: Mostly implemented.

Recent active block padding and wider column help. The retro style remains intact. Remaining spacing issues are more about toolbar/search hierarchy than raw padding.

Decision: Preserve style. Do not introduce modern component-library appearance.

### U00. Avoid layout jumps

Status: Partially implemented.

Sidebar controls now appear/disappear, which can shrink title width but does not change row height. Block toolbar is absolute and does not push text. Active rich-text padding changes slightly on focus, which is acceptable. Search results still push content downward.

Decision: Watch active padding jump in manual testing. Later make search panel less disruptive.

### V00. Empty states invite action

Status: Partially implemented.

No-page empty state exists. New pages create an empty paragraph with placeholder text. Bottom `+ Add paragraph` exists. Missing: page deletion cleanup and stronger first-writing focus if title is not the desired first target.

Decision: Keep title focus on New Page for now. If users want immediate body writing, consider focus-first-paragraph option later.

### W00. Block type flexible

Status: Partially implemented.

Transform system exists and protects some lossy transformations by not allowing them. Slash commands transform paragraphs. Missing: richer transformation paths from source/table and better data-loss communication.

Decision: Keep conservative transform paths. Do not silently lose source/table data.

### X00. Page order manageable but not dominant

Status: Partially implemented.

Up/down buttons work and are now contextual. Sidebar width persists. Active selection remains after page move because the same page ID remains selected. Missing: page reorder undo, keyboard shortcuts, drag/drop only if needed later.

Decision: Add reorder undo before drag/drop.

### Y00. Reading/editing mode without hard switch

Status: Partially implemented.

Paragraph/heading rich text reads like text and becomes active on focus. Block controls appear contextually. Specialized blocks still look like forms, but that may be appropriate.

Decision: Improve normal text behaviors before changing specialized blocks.

### Z00. Errors recoverable

Status: Partially implemented.

Save failure displays status and error. Block delete has undo. Storage operations catch and show errors. Missing: page recovery, accidental page cleanup, empty title recovery, broader undo.

Decision: Focus next on recoverability.

### AA00. Potential missing UX areas

Status: Correctly identified; mixed implementation.

- Block splitting: partial, needs true split.
- Block merging: not implemented.
- Selection across blocks: not implemented and should defer.
- Bulk paste: implemented but should be validated.
- Block insertion location: not implemented correctly yet.
- Page deletion/recovery: not implemented.
- Search result behavior: partial.
- Accessibility: partial.

Decision: Implement block insertion, Backspace, page lifecycle, search/accessibility improvements; defer cross-block selection.

### AB00. UX principles

Status: Directionally implemented.

The current code now follows several principles: immediate action over prompts, contextual controls over clutter, safe repetition for ArrowDown, and readable spacing. Recoverability and local predictability need the next pass.

Decision: Use these principles as implementation gates for future changes.

## Proposed Implementation Plan

### Milestone 1: Safe Structure and Focus

Scope:

- Track active block focus.
- Make top toolbar insert after active block.
- Focus newly inserted block.
- Focus neighbor after block delete.
- Keep focus on moved block after block move.
- Push undo for add block, add paragraph, Enter-created paragraph, list item add, table row/column actions if feasible.
- Add page reorder undo.

Files likely touched:

- `src/ui.js`
- `src/storage-worker.js` only if undo needs worker-level restore beyond current operations.
- Tests for block ordering and undo behavior if DOM testing is available; otherwise model-level tests and manual testing notes.

User value:

- The editor feels coherent.
- Structural mistakes are reversible.
- The user can continue typing after actions.

### Milestone 2: Page Lifecycle

Scope:

- Add page delete/archive action.
- Add restore/undo path.
- Ensure selected page changes predictably after delete.
- Ensure deleted pages and blocks disappear from search.
- Add sidebar delete control on hover/focus.

Files likely touched:

- `src/ui.js`
- `src/storage-worker.js`
- `src/models.js` likely no schema change needed.
- `src/exporters.js` likely no change if deleted pages are filtered by workspace load; backup export behavior should be decided.

User value:

- Promptless New Page becomes safe.
- Page list can be cleaned up.
- Local-first trust improves.

### Milestone 3: Editing Boundary Completion

Scope:

- Backspace removes empty paragraph and focuses previous block.
- True split-at-caret for Enter.
- Optional merge paragraphs later.
- Title Enter/Escape/empty behavior.

Files likely touched:

- `src/ui.js`
- `src/rich-text.js` if reusable split helpers are added.
- Tests for rich-text normalization helpers.

User value:

- The editor behaves like a document.
- Users can correct accidental paragraph creation with one key.
- Existing notes can be reshaped without mouse use.

### Milestone 4: Search and Source Polish

Scope:

- Search result count/no-results.
- Escape-to-clear.
- Result open focuses block and flashes it.
- Highlight match preview.
- Clear source/code/quote placeholders.

Files likely touched:

- `src/ui.js`
- `styles.css`
- Maybe `src/search.js` if match ranges are computed outside UI.

User value:

- Research retrieval improves.
- Source capture becomes more understandable.

### Milestone 5: Inline Insertion and Commands

Scope:

- Add contextual `+` insert menu.
- Add small app command registry.
- Optionally use UI framework command palette if it fits.
- Add keyboard shortcuts for high-value structural actions.

Files likely touched:

- `src/ui.js`
- `styles.css`
- Possibly UI framework if command palette ergonomics are insufficient, but only if needed.

User value:

- Structure becomes available without permanent toolbar clutter.
- Keyboard users can manage notes faster.

## Out-of-Scope Decisions

### Do not implement cloud features

Authentication, cloud sync, collaboration, sharing, comments, and conflict resolution are outside this local-first project. They would change the product identity and technical risk profile.

### Do not implement a full editor engine now

The current code is small, understandable, and already supports rich text for paragraphs/headings. A full editor engine may become appropriate if cross-block selection, complex formatting, markdown shortcuts, nested blocks, or collaborative editing become requirements. It is not the right next step.

### Do not implement nested pages before page lifecycle

Nested pages without delete/undo/focus reliability would compound complexity. Flat pages plus good search and safe deletion are enough for the next phase.

### Do not implement drag-and-drop before keyboard alternatives

Drag-and-drop is nice but not foundational. It should not be the only way to reorganize. Up/down controls plus keyboard commands are enough until the app has larger page lists.

### Do not implement tags/backlinks/smart folders yet

These are knowledge-base features. The app should first become excellent at fast local capture and editing.

## Risk Analysis

### Contenteditable complexity

The app now uses contenteditable for paragraph and heading blocks. This is a good direction but requires careful handling of selection, paste, composition, and browser differences. The current boundary detection is pragmatic and should be manually tested in Chrome/Edge/Firefox if browser coverage matters.

Risk mitigation:

- Keep helper functions isolated.
- Add manual test cases for multiline paragraphs, inline tags, paste, IME composition, Enter, Backspace, and Arrow navigation.
- Avoid excessive re-rendering during text editing.

### Undo expectations

The visible Undo button can become misleading if it only handles a subset of structural changes. This is the biggest product-risk mismatch right now.

Risk mitigation:

- Expand undo coverage.
- Update button tooltip to accurately describe scope.
- Prefer snapshot-based undo initially for reliability.

### Search indexing consistency

Search index updates are worker-side for update/create/delete paths. New page deletion and restore must maintain search index consistency.

Risk mitigation:

- Keep page delete/restore transactional.
- Add tests around search after delete/restore if possible.

### Focus loss after render

Many current actions re-render the editor. That can lose native selection, scroll position, and focus.

Risk mitigation:

- Make every structural action explicitly choose a post-action focus target.
- Avoid rendering the editor for sidebar-only updates.
- Use `requestAnimationFrame()` focus restoration as the current code already does.

## Manual Test Checklist for Next Implementation Pass

Writing flow:

- Create a new page.
- Rename title.
- Type a paragraph.
- Press Enter at end.
- Type second paragraph.
- Press ArrowUp/ArrowDown between blocks.
- Press Backspace in empty paragraph.
- Undo empty paragraph deletion.

Insertion:

- Focus middle block.
- Click Heading in toolbar.
- Confirm heading inserts below focused block.
- Add Source below focused block.
- Confirm focus lands in first useful field.

Undo:

- Add paragraph, undo.
- Delete block, undo.
- Move block, undo.
- Transform block, undo.
- Create page, undo.
- Delete page, undo.
- Move page, undo.

Search:

- Search title text.
- Search block text.
- Search no-match text.
- Open result.
- Confirm block is visible and focused or clearly highlighted.
- Clear search.

Persistence:

- Create page, rename, add blocks, delete a block, reorder page, refresh.
- Confirm expected state persists.
- Undo before refresh and confirm restored state persists.

Sidebar:

- Long page titles ellipsize.
- Full title appears in browser tooltip.
- Reorder controls appear on hover/focus only.
- Delete control appears on hover/focus after implemented.
- Keyboard users can reach controls.

## Recommended Acceptance Criteria for Suggestions 004 Follow-Up

The next implementation should be accepted when:

- The app still looks like the same retro notepad.
- New Page is immediate, selected, focused, and undoable.
- Page deletion exists and is undoable.
- Toolbar insertion happens after the active block.
- Bottom `+ Add paragraph` still appends to the end.
- Empty paragraphs can be removed with Backspace.
- Enter at least creates the next paragraph reliably, and ideally splits at caret.
- Undo accurately covers structural actions exposed by the UI.
- Search has no-results and result-orientation behavior.
- Empty titles cannot leave a permanently blank sidebar row.
- Local save status still reflects saved/saving/dirty/failed states.
- All link and data-index validation checks still pass after build.

## Bottom: Already Implemented Items

✅ Local-first IndexedDB persistence through a storage worker.

✅ Debounced page/block saving through `StorageClient`.

✅ Local save status text: saved locally, saving locally, unsaved changes, save failed, opening local storage.

✅ Page and block schema with durable IDs, sort order, timestamps, archive/delete fields, metadata, and normalized content.

✅ Promptless New Page.

✅ Unique default New Page titles: `New research page`, `New research page 2`, and so on.

✅ New Page selects the created page.

✅ New Page focuses and selects the inline title.

✅ Inline page title editing.

✅ Sidebar page list.

✅ Sidebar active-page highlight.

✅ Sidebar width persistence.

✅ Sidebar reorder controls.

✅ Sidebar reorder controls hidden until hover/focus.

✅ Sidebar long-title ellipsis.

✅ Sidebar full-title tooltip.

✅ Responsive editor width with wider content column.

✅ Narrow-screen layout handling remains present through media CSS.

✅ Paragraph rich-text contenteditable blocks.

✅ Heading rich-text contenteditable blocks.

✅ Sanitized inline HTML for rich text.

✅ Active rich-text block padding improvement.

✅ Placeholder text for empty paragraph/heading editables.

✅ Contextual block toolbar on hover/focus.

✅ Block move up/down controls.

✅ Block delete control.

✅ Block delete soft-deletes through storage worker.

✅ Block-level structural undo for delete, move, and transform.

✅ Block transforms through `Turn into`.

✅ Slash command menu for paragraph transforms.

✅ Slash command keyboard navigation.

✅ Enter in paragraph creates a new paragraph below.

✅ ArrowDown at bottom boundary moves to next block or creates one paragraph at the end.

✅ ArrowUp at top boundary moves to previous block.

✅ Native multiline ArrowUp/ArrowDown movement is preserved until visual boundary.

✅ Repeated ArrowDown empty paragraph creation guard.

✅ Bottom `+ Add paragraph` affordance.

✅ Quote block type with quote, attribution, and source URL.

✅ List block type with add item.

✅ Table block type with add row/add column/delete row.

✅ Code block type with language and text.

✅ Source block type with URL, title, note, captured text, domain, and Open link.

✅ Paste conversion for plain text.

✅ Paste conversion for semantic HTML blocks.

✅ Inline paste sanitization for rich text.

✅ Multi-block paste insertion after current block.

✅ Search index in storage worker.

✅ Local search UI with result rows.

✅ Search result can open a page and scroll a block into view.

✅ Markdown export for selected page.

✅ JSON backup export for workspace.

✅ Tests for models, paste, search/export, rich text, logger, split pane, block transforms, and storage client.

✅ Production build script and built `dist` assets.
