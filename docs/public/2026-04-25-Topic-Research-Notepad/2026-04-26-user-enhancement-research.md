# User Enhancement Research: Modern Note-Taking UX in a Retro Interface

Date: 2026-04-26

Project: Topic Research Notepad

## Executive Summary

Topic Research Notepad has a solid technical base for a local-first research notebook: it saves pages and blocks separately in IndexedDB, uses a Worker-owned persistence layer, converts pasted HTML into internal blocks, supports search, and exports Markdown/JSON. The current user experience, however, exposes too much of the internal model. The user sees the application as a form editor made of labeled content records rather than as a writing surface. That creates friction: every paragraph is visibly "a Paragraph", every block carries persistent controls, page ordering is button-based, and the top toolbar competes with the content for attention.

The product opportunity is to keep the retro visual language while modernizing the interaction model. The app should feel like a focused writing desk inside classic desktop chrome: compact window frame, pixel-edged controls, status strip, and old-system colors, but with modern behaviors such as progressive disclosure, inline creation, drag-and-drop organization, keyboard-first commands, nested pages, contextual menus, link-aware navigation, and a calm editing canvas.

The strongest recommendation is a staged modernization:

1. **Immediate UX pass:** hide block chrome until hover/focus, make paragraph editing borderless, replace the always-visible add-block toolbar with inline add handles and slash commands, collapse the sidebar on demand, and move most secondary actions into contextual menus. This can be done without a database migration.
2. **Page organization pass:** add parent/child page hierarchy, collapsible tree rows, drag-and-drop page reordering/nesting, and a keyboard-accessible "Move page to..." command. This needs a small DB migration and careful reorder logic.
3. **Editor interaction pass:** add modern block editing behaviors: Enter creates the next paragraph, Backspace on an empty block merges/deletes, Markdown shortcuts convert block types, block handles support dragging, and source/quote metadata is tucked behind details or contextual affordances.
4. **Research workflow pass:** add wiki links, tags, smart views, source side notes, and optional outline mode so users can find and reuse research without constantly managing folders.

The key design principle is: **the content should be the default interface; controls should appear only when the user is trying to act.**

## Current Product Context

### What the App Already Does Well

The implementation is small, understandable, and locally robust.

- `src/main.js` bootstraps the app, applies retro theme tokens, creates the `StorageClient`, and starts `TopicResearchApp`.
- `src/ui.js` owns the rendered shell, page list, editor, search results, status strip, event handling, page/block mutations, export, and paste handling.
- `src/models.js` defines durable page and block shapes, including future-friendly fields such as `pinned`, `color`, `summary`, `metadata`, `archivedAt`, and `deletedAt`.
- `src/storage-worker.js` owns Dexie and IndexedDB stores for `pages`, `blocks`, `searchIndex`, and `settings`.
- `src/paste.js` sanitizes pasted HTML into semantic blocks rather than trusting external markup.
- `src/exporters.js` exports the selected page to Markdown and the workspace to JSON.
- Tests cover models, paste conversion, search/export, logger behavior, and storage client behavior.

The current model is already suitable for a block-based editor. Pages and blocks are separate records, blocks are ordered with `sortOrder`, and search is derived from page/block records. That means many UX improvements can be made by changing rendering and interaction patterns before changing persistence.

### Where the Current UX Feels Old

The app currently makes users manage the structure instead of writing into it.

- The page list is flat and uses visible up/down buttons instead of direct manipulation.
- Every block is a bordered card with a persistent toolbar.
- The toolbar names the block type, even for paragraphs where the label is visual noise.
- Adding content requires moving to an always-visible add-block toolbar.
- Source, quote, table, and code metadata are always shown as form fields.
- Search results appear as a panel above the editor and can push content down.
- The status strip is useful for development, but the UI does not yet use subtle save confidence like modern note apps.
- There is no nested page model, no sidebar tree, no drag-and-drop, no command palette, no page links, no backlinks, no tags, no smart views, and no focus mode.

The result is functionally retro, not just visually retro. A retro UI can be charming; retro friction is the part to remove.

## External Research Summary

This research looked at current note-taking and writing products, product documentation, and user forum signals. The most relevant patterns are consistent across tools:

- **Notion:** Nested pages, drag-and-drop sidebar organization, slash commands, block handles, block transforms, and hover-revealed controls. Notion's sidebar supports nesting, toggles, drag-and-drop reorganization, sidebar collapse/resizing, and hover-based page creation. Its writing docs describe blocks as transformable and rearrangeable, with `/` used to add content types quickly. Sources: [Notion sidebar](https://www.notion.com/help/navigate-with-the-sidebar), [Notion slash commands](https://www.notion.com/help/guides/using-slash-commands), [Notion blocks](https://www.notion.com/help/what-is-a-block).
- **Obsidian:** File explorer tree, drag-and-drop files/folders, context menus, auto-reveal active file, expand/collapse all, and command-based movement. Obsidian help documents drag-and-drop movement plus context menu operations; user forum requests show that drag-and-drop alone is insufficient for long lists, and users want a command palette move flow. Sources: [Obsidian file explorer](https://obsidian.md/help/plugins/file-explorer), [Obsidian forum move command request](https://forum.obsidian.md/t/option-in-command-palette-and-context-menu-to-move-file/269).
- **Readwise Reader:** Research capture is keyboard-first. Users can navigate paragraphs, highlight, tag, and annotate without leaving the reading flow; notes and tags can live in a side panel/margin instead of occupying the main text flow. Source: [Readwise Reader highlights, tags, and notes](https://docs.readwise.io/reader/docs/faqs/highlights-tags-notes).
- **Apple Notes:** Tags and Smart Folders let users organize notes without physically moving them. This is important because manual hierarchy eventually becomes a maintenance burden. Source: [Apple Notes tags and Smart Folders](https://support.apple.com/en-us/102288).
- **Bear:** Wiki links connect notes by title and aliases keep link text readable. This lets organization emerge while writing, instead of forcing all organization into the sidebar. Source: [Bear wiki links](https://bear.app/faq/how-to-link-notes-together/).
- **Tiptap/ProseMirror ecosystem:** Modern rich-text editors treat editing as a command system. Slash menus, floating menus, drag handles, keyboard shortcuts, and transaction-based commands are all established patterns. Source: [Tiptap slash commands](https://tiptap.dev/docs/examples/experiments/slash-commands), [Tiptap editor commands](https://tiptap.dev/docs/editor/api/commands).
- **Apple HIG context menus:** Context menus are useful because they expose item-specific actions without cluttering the interface, but they should contain relevant, frequently used commands and remain available through other paths. Source: [Apple context menus](https://developer.apple.com/design/human-interface-guidelines/context-menus).

The important synthesis is not "copy Notion." The important synthesis is that modern note-taking apps make structure available through lightweight gestures and commands while keeping the writing surface quiet.

## Product Design Principles

### 1. Retro Shell, Modern Workflows

The retro design should live in borders, window chrome, typography, compact controls, status bar, and low-color palette. The workflows should be modern: direct manipulation, inline commands, fewer persistent controls, keyboard access, and low-friction organization.

Example:

- Good retro: a compact pixel-edged sidebar with tree toggles and a status bar that says `saved`.
- Bad retro: forcing the user to click tiny up/down buttons for every reorder.

### 2. Content First, Controls on Intent

Controls should appear when the user shows intent:

- Hover near a block: show handle, add button, and quick actions.
- Focus inside a block: show a small contextual toolbar or command hint.
- Select text: show text formatting actions.
- Right-click or keyboard menu: show block/page actions.
- Type `/`: show block insertion and transform commands.
- Press `Ctrl/Cmd+K`: show global commands and navigation.

The default page should mostly be title plus content.

### 3. Multiple Interaction Paths

Drag-and-drop is discoverable and satisfying, but it is not enough for accessibility, keyboard users, touchpad users, or long trees. Each structural action should have at least two paths:

- Drag page into another page.
- Use context menu `Move to...`.
- Use command palette `Move page to...`.
- Use keyboard shortcuts for reorder/indent/outdent where reasonable.

This is especially important because design forums show a repeated complaint: drag-and-drop becomes tedious or imprecise when note lists get long.

### 4. Organization Should Be Both Manual and Emergent

Nested pages help users impose a hierarchy. Tags, links, backlinks, and smart views help users recover information without perfectly maintaining that hierarchy. Research notes usually evolve: a page that starts as a scratchpad may later become a subpage, tag cluster, source bundle, or outline section.

### 5. Avoid Forcing a Full Rich-Text Rewrite Too Early

The app can become much more modern without immediately adopting a full editor engine. A staged approach can first make the existing textarea/input architecture feel calmer. A full ProseMirror/Tiptap-style editor is powerful, but it is a larger product and engineering decision, especially because this project currently avoids installing npm dependencies and ships vendored runtime files.

## Feature Proposal 1: Calm WYSIWYG Editing Canvas

### Problem

The current editor shows the data model directly:

- A paragraph is a bordered block with a visible "Paragraph" label.
- Movement and delete controls are always present.
- Every block reads like a form.
- Source and quote metadata interrupts the writing flow.

This makes the page feel like a database admin UI rather than a notebook.

### Proposed Experience

The page should render like a document:

```text
Research title

This is a note paragraph. It looks like normal writing, not a form record.

## A heading

> A quote appears as a quote.
> Source fields are available when expanded or focused.

- A list item
- Another list item
```

When the user hovers near the left margin of a block, retro-styled controls appear:

```text
[+] [::]  This is a note paragraph...
```

- `+` opens the insert menu below or above the current block.
- `::` is the drag handle and contextual menu target.
- Delete, duplicate, move, turn into, copy Markdown, and source metadata move into the contextual menu.

When the user focuses a paragraph, the textarea can still exist technically, but it should be borderless, auto-growing, and styled like text. The retro border should be on the window/panel, not around every paragraph.

### Implementation Approaches

#### Approach A: Restyle Existing Inputs and Textareas

Keep the current block model and event handling. Change CSS and rendering so controls are hidden by default.

Implementation:

- In `renderBlock`, remove persistent type label for paragraphs.
- Add a left gutter inside each block with hover/focus controls.
- Add CSS: `.trn-block` border transparent by default; `.trn-block:hover`, `.trn-block:focus-within` shows subtle dotted or inset outline.
- Make `.trn-textarea` borderless for paragraph blocks, auto-growing with a small JS helper.
- Use block type classes such as `.trn-block[data-type="paragraph"] .trn-textarea`.
- Keep the existing `data-field` and `handleInput` flow.

Pros:

- Fastest route to a calmer UI.
- No storage migration.
- Lower testing risk.
- Preserves autosave behavior.

Cons:

- Textareas are still not true rich text.
- Cross-block selection remains limited.
- Inline formatting is not solved.
- Tables/source forms still need custom treatment.

Estimated effort: 1-2 focused implementation passes.

#### Approach B: Lightweight Contenteditable Per Block

Replace paragraph/heading textareas with `contenteditable` regions while keeping specialized controls for table/code/source blocks.

Implementation:

- Render paragraph and heading blocks as `div contenteditable="plaintext-only"` if supported, fallback to `contenteditable="true"` with paste normalization.
- Map input text back to `block.content.text`.
- Handle Enter, Backspace, paste, and composition events carefully.
- Preserve selection across state changes.

Pros:

- Feels closer to a modern editor.
- Enables richer keyboard behavior.
- Easier to make text look like text.

Cons:

- Browser editing behavior is hard to normalize.
- Selection persistence becomes a real engineering concern.
- IME/composition behavior must be tested.
- Plaintext-only is not uniformly perfect across browsers.

Estimated effort: 3-5 implementation passes.

#### Approach C: Adopt a Real Editor Engine Later

Use a ProseMirror/Tiptap-like editor for the canvas. Tiptap documentation shows command chaining, slash commands, floating menus, focus management, node commands, and drag handle/floating menu extensions as established patterns.

Pros:

- Best long-term editor capabilities.
- Mature model for selection, undo/redo, commands, schema, input rules, paste rules, and nested content.
- More future-proof if rich formatting, comments, collaboration, or complex block transforms are desired.

Cons:

- Major architecture decision.
- Requires vendoring or changing the project's "no npm modules" development posture.
- Requires data conversion between current page/block records and editor document JSON.
- Larger bundle and more moving parts.

Estimated effort: 2-4 weeks for a serious integration, not counting product polish.

### Recommendation

Start with Approach A. It will solve the largest current problem: control overload. Defer Approach B/C until we have validated the desired interaction model.

### User Scenario

Before:

1. User opens a research page.
2. Every block shows labels and movement controls.
3. User has to scan around the interface to find where to add the next thought.

After:

1. User opens a research page.
2. The page looks like a quiet document.
3. User clicks at the end and keeps typing.
4. When they need structure, they type `/quote`, hover the block handle, or press a keyboard shortcut.

### UX Benefit

This changes the product from "block database editor" to "notebook with hidden structure." The user remains focused on research thinking rather than interface maintenance.

## Feature Proposal 2: Inline Add, Slash Commands, and Block Transforms

### Problem

The current "Add content block" toolbar is always visible and consumes page head space. It also forces the user to decide structure by leaving the writing flow.

### Proposed Experience

Users should add content in-place:

- Type `/` at the start of an empty paragraph to open a command menu.
- Type `/quote`, `/table`, `/source`, `/code`, `/heading`, `/list`.
- Press Enter to select.
- Use a left-margin `+` to insert a block with the mouse.
- Use a block menu action `Turn into > Quote/List/Heading/Code/Source`.

The menu should look retro, but behave like a modern command popup:

```text
+------------------------+
| / source               |
| > Source link          |
|   Quote                |
|   Heading              |
|   List                 |
|   Code                 |
|   Table                |
+------------------------+
```

Notion's own documentation describes slash commands as a fast way to add or modify content, including quotes and web bookmarks. Tiptap's slash command example describes a toolbar that pops up at the slash position to insert content types or formatting.

### Implementation Details

Minimum viable version:

- Add `state.commandMenu = { open, blockId, query, x, y }`.
- In `handleInput`, detect empty or leading slash content for paragraph blocks.
- Render a positioned command menu in `renderEditor`.
- Add keyboard handling for ArrowUp, ArrowDown, Enter, Escape.
- On select, if the command is a transform, update current block type and default content.
- If the command inserts a new block, create it after current block.

Important details:

- The command trigger should not be annoying. A design forum complaint about slash menus is that `/` can appear during normal writing. The menu should close as soon as the text no longer looks like a command, and Escape should dismiss it.
- Slash commands should be optional, not the only path. Keep mouse insert and command palette alternatives.
- The slash menu should be short at first. Too many options becomes another kind of clutter.

### Pros

- Keeps users in the writing flow.
- Removes the need for the persistent add toolbar.
- Makes block types discoverable without occupying permanent space.
- Provides a clean future path for templates and research-specific commands.

### Cons

- Requires careful keyboard event handling.
- Requires selection/caret management after insertion.
- Needs accessibility work: menu semantics, active descendant, Escape behavior, focus retention.

### Estimated Effort

2-4 implementation passes for a robust native version.

### User Scenario

The user is reading an authentication article and wants to capture a source:

1. They paste a URL or type `/source`.
2. The source block appears inline.
3. The URL field is focused.
4. After entering the URL, the block collapses into a compact source chip with domain/title visible.
5. Detailed fields are available from "Edit source details."

The user did not need to move to the top toolbar or visually parse six permanent buttons.

## Feature Proposal 3: Nested Pages and a Drag-and-Drop Sidebar Tree

### Problem

The current page list is flat. Research topics naturally become nested:

```text
OAuth research
  Provider docs
  Security concerns
  Library comparison
  Open questions
```

Flat lists break down when the number of pages grows. Up/down buttons work for a proof of concept but are not enough for actual research organization.

### Proposed Experience

The sidebar should become a tree:

```text
▾ OAuth research
    Provider docs
    Security concerns
  Library comparison
▸ Browser storage research
  Inbox
```

Interactions:

- Click a page title to open it.
- Click disclosure triangle to collapse/expand children.
- Drag page above/below another page to reorder.
- Drag page onto another page to nest it.
- Drag child page out to unnest.
- Hover a page row to show `+` and menu buttons.
- `+` beside a row creates a child page.
- Context menu includes Rename, New child page, Move to, Duplicate, Delete, Export.
- Sidebar can be resized, collapsed, or hidden.

Notion supports nested pages, sidebar toggles, drag-and-drop nesting, hover-based child creation, and sidebar collapse/resizing. Obsidian supports drag-and-drop folder movement, context menu operations, auto-reveal active file, and expand/collapse all. The lesson for this app: tree navigation should support both direct manipulation and command/menu fallbacks.

### Data Model Options

#### Option A: Add `parentPageId` to Page Records

Extend `ResearchPage`:

```js
{
  id,
  title,
  parentPageId: null | "page_...",
  sortOrder,
  collapsed,
  ...
}
```

Ordering is per sibling group:

- Root pages: `parentPageId === null`, ordered by `sortOrder`.
- Children: `parentPageId === parent.id`, ordered by `sortOrder`.

Pros:

- Simple and familiar.
- Easy migration: existing pages get `parentPageId: null`, `collapsed: false`.
- Works with current records.
- Easy to query all pages and build a tree in memory.

Cons:

- Moving a subtree requires cycle validation.
- Breadcrumbs need parent traversal.
- Large workspaces may eventually need indexed parent queries.

Recommended for this project.

#### Option B: Store a Separate Tree Structure in Settings

Keep pages flat and store page order/nesting as a tree in settings:

```js
{
  key: "pageTree",
  value: [{ id: "p1", children: [...] }]
}
```

Pros:

- No changes to page records.
- One setting controls layout.

Cons:

- Risk of tree getting out of sync with pages.
- Harder to recover from partial writes.
- Harder to reason about page metadata.

Not recommended.

#### Option C: Materialized Path

Add `path` or `ancestors`:

```js
{
  parentPageId: "p1",
  ancestorPageIds: ["root", "p1"]
}
```

Pros:

- Fast ancestry checks and breadcrumbs.
- Useful for future search filters.

Cons:

- More complex migrations and move operations.
- Must update descendants when moving a page.

Consider later only if needed.

### Storage Migration

The current database version is `DB_VERSION = 1`. A hierarchy pass should introduce version 2:

- `pages: "id, parentPageId, [parentPageId+sortOrder], updatedAt, archivedAt, sortOrder, pinned"`
- Normalize old pages with `parentPageId: null`, `collapsed: false`.
- Add tests for migration-safe normalization.

Worker messages to add:

- `movePageTree({ pageId, parentPageId, beforePageId, afterPageId })`
- `updatePageCollapsed({ pageId, collapsed })`
- Optional: `duplicatePageTree`

### Drag-and-Drop Design

Native HTML drag-and-drop can work for desktop, but it is clumsy on touch and inconsistent. A minimal implementation can start with pointer events:

- `pointerdown` on page drag handle starts a possible drag.
- Move beyond a threshold starts dragging.
- Calculate drop target from row bounding boxes.
- Three drop zones:
  - upper third: insert before
  - middle: nest into
  - lower third: insert after
- Show a retro blue insertion guide.
- Auto-expand a collapsed parent after hover delay.
- Auto-scroll sidebar near top/bottom.

Validation:

- Cannot move a page into itself.
- Cannot move a page into its descendant.
- Deleting a parent should clearly explain whether children are deleted, moved, or kept. For this app, prefer soft-delete subtree only after confirmation.

### Keyboard and Command Fallback

Do not make drag-and-drop the only organization path.

Add:

- Context menu `Move to...`
- Command palette command `Move page to...`
- Keyboard shortcuts:
  - `Alt+ArrowUp/Down`: reorder among siblings.
  - `Alt+ArrowRight`: indent under previous sibling.
  - `Alt+ArrowLeft`: outdent to parent level.

Obsidian forum requests strongly validate this: users ask for moving files through command palette and context menu because drag-and-drop is painful in long lists.

### Pros

- High product value.
- Matches user expectation from Notion, Obsidian, file explorers, and outliners.
- Makes the app viable for multi-page research projects.
- Creates a foundation for breadcrumbs, subpage blocks, and export trees.

### Cons

- Requires DB migration.
- Drag-and-drop has edge cases.
- Needs accessibility alternatives.
- Export behavior must be decided for nested pages.

### Estimated Effort

4-8 implementation passes for a reliable first version.

### User Scenario

The user starts with pages:

```text
OAuth research
PKCE
Auth0 docs
Clerk docs
Open questions
```

They drag `PKCE`, `Auth0 docs`, and `Clerk docs` under `OAuth research`, then collapse the parent. Later they use `Move page to...` from the command palette to move `Open questions` under the same parent without dragging.

The sidebar becomes a map of the research, not a flat pile.

## Feature Proposal 4: Focus Mode and Adaptive Chrome

### Problem

The current interface always shows the titlebar commands, commandbar, search input, page list, editor panel chrome, statusbar, and block controls. This is useful for orientation but bad for writing concentration.

### Proposed Experience

Add focus modes:

1. **Normal mode:** sidebar + editor + status strip.
2. **Zen mode:** hide sidebar, top commandbar, search, and block chrome; keep title and content.
3. **Review mode:** show sidebar, search/results, and source metadata panels.
4. **Capture mode:** optimize for pasting links/quotes quickly.

The simplest first version:

- Add a toggle button in the titlebar: `Focus`.
- Shortcut: `Ctrl/Cmd+Shift+F` or `Ctrl/Cmd+\` for sidebar collapse.
- Persist setting in `settings`.
- In focus mode, hide `.trn-commandbar`, collapse sidebar, keep export/search in command palette.

### Retro UI Treatment

Focus mode should still feel retro. The screen can look like a plain editor inside a classic window:

```text
+ Topic Research Notepad -------------------------------- [Focus: on]
|
| OAuth Research
|
| Notes...
|
+ saved -----------------------------------------------------------
```

Do not use modern glass, gradients, or decorative empty states. The retro quality comes from compact chrome and restraint.

### Pros

- Directly addresses distraction.
- Low technical risk.
- Gives users agency over how much UI they see.
- Works before deeper editor changes.

### Cons

- If commands are hidden without alternatives, discoverability suffers.
- Needs a command palette or menu fallback for hidden actions.

### Estimated Effort

1-2 implementation passes for basic focus mode; 3-4 with command palette integration.

### User Scenario

The user has collected sources and now wants to write conclusions. They press the focus shortcut. The page list disappears, block labels vanish, and only the content remains. They can still type `/source` or `Ctrl/Cmd+K export` if needed.

## Feature Proposal 5: Command Palette and Global Search

### Problem

Modern productivity tools avoid overloading the visible interface by making actions searchable. This app currently has a search box for notes but no command layer. If we hide visible controls, users need a fast way to reach actions.

### Proposed Experience

Press `Ctrl/Cmd+K`:

```text
+ Command --------------------------------+
| search pages, blocks, actions...        |
|-----------------------------------------|
| Open page: OAuth research               |
| Move page to...                         |
| New child page                          |
| Export current page as Markdown         |
| Toggle sidebar                          |
| Insert source block                     |
+-----------------------------------------+
```

Palette result types:

- Pages.
- Search matches.
- Commands.
- Recent pages.
- Block insertion commands.
- Move destinations.

Notion uses `cmd/ctrl + K` for search/navigation from the sidebar. The broader command palette pattern is common because it lets users run actions without navigating menus.

### Implementation Details

Add a command registry:

```js
const commands = [
  { id: "newPage", label: "New page", run: () => this.createPage(...) },
  { id: "newChildPage", label: "New child page", run: () => ... },
  { id: "toggleFocus", label: "Toggle focus mode", run: () => ... },
  { id: "exportMarkdown", label: "Export current page as Markdown", run: () => this.exportMarkdown() },
];
```

The palette can use existing search infrastructure:

- Query local commands in memory.
- Query storage search for page/block text.
- Merge results with type labels.

Keyboard behavior:

- `Ctrl/Cmd+K`: open.
- `Escape`: close.
- `Enter`: run selected.
- Arrow keys navigate.
- `Ctrl/Cmd+P` could optionally open page-only quick switcher later.

### Pros

- Allows visible UI to become minimal.
- Helps power users.
- Provides accessible alternatives to drag/drop and hover UI.
- Creates a place for future features without adding toolbar buttons.

### Cons

- Requires careful ranking.
- Can be overbuilt; start small.
- Keyboard shortcut conflicts must be considered.

### Estimated Effort

2-5 implementation passes depending on search integration depth.

### User Scenario

The user wants to move the current page under "OAuth research":

1. Press `Ctrl/Cmd+K`.
2. Type `move`.
3. Select `Move current page to...`.
4. Type `oauth`.
5. Press Enter.

This solves the long-sidebar organization problem without a visible management panel.

## Feature Proposal 6: Contextual Menus and Progressive Disclosure

### Problem

The app exposes actions as permanent controls. Permanent controls are appropriate for primary workflows; they are distracting for secondary actions such as move up/down, delete, duplicate, export, and metadata editing.

### Proposed Experience

Use small contextual menus for page and block actions:

Page row menu:

```text
Open
Rename
New child page
Move to...
Duplicate
Export Markdown
Delete
```

Block menu:

```text
Turn into
Duplicate
Move to page...
Copy Markdown
Edit source details
Delete
```

Text selection menu:

```text
Bold
Italic
Code
Link
Highlight
```

Apple's context menu guidance is relevant: context menus reduce clutter by providing item-specific functionality, but the commands should be relevant and available elsewhere too.

### Implementation Details

The bundled retro UI framework already includes menu-related components (`ui-framework/src/components/menu.js`, `menubar.js`, `command-palette.js` in the framework source list). Use the existing framework if feasible rather than hand-building everything.

Add state:

```js
contextMenu: {
  open: true,
  kind: "page" | "block" | "selection",
  targetId,
  x,
  y
}
```

Render a small positioned menu near the target. Handle outside click and Escape.

### Pros

- Major visual decluttering.
- Common desktop pattern that fits retro UI.
- Scales better as features grow.

### Cons

- Hidden actions are less discoverable.
- Needs keyboard and touch alternatives.
- Must avoid burying primary actions.

### Estimated Effort

2-3 implementation passes for page/block menus.

### User Scenario

The user hovers over a quote block. The drag handle appears. They click it and choose `Turn into > Paragraph`. The block updates in place. The editor does not show this menu until the user asks for it.

## Feature Proposal 7: Better Research Blocks and Source Capture

### Problem

The app supports `sourceLink`, `quote`, and paste conversion, which is excellent for research. But the current UI treats source metadata as a visible form grid, making the page noisy.

### Proposed Experience

Source blocks should have two modes:

1. **Compact reading mode**

```text
[example.com] OAuth 2.0 Security Best Current Practice
Primary source. Covers PKCE requirements.
```

2. **Expanded edit mode**

```text
URL: ...
Title: ...
Note: ...
Captured text: ...
```

Quotes should show attribution/source compactly:

```text
> Tokens expire quickly.
  Docs, example.com
```

Details appear only when:

- The block is focused.
- User opens `Edit details`.
- User expands a disclosure triangle.

Readwise Reader is a useful product comparison because research annotations can live in margins/sidebars and be manipulated with keyboard shortcuts. The point for this app is not to become a read-it-later app; it is to keep source metadata close but not dominant.

### Future Research-Specific Features

- Capture selected text as quote.
- Convert pasted URL to source block automatically.
- Fetch title/domain if network is allowed in future.
- Add source credibility fields: `primary`, `secondary`, `needs verification`.
- Add citation copy action.
- Add "show all sources on page" panel.
- Add "source inbox" smart view for links captured but not summarized.

### Implementation Details

No model migration required for compact/expanded UI. Use existing source fields:

- `url`
- `title`
- `note`
- `domain`
- `capturedText`
- `capturedAt`

Add per-block UI state:

```js
expandedBlockIds: new Set()
```

Persist expansion only if useful; default can be ephemeral.

### Pros

- Makes research pages readable.
- Keeps source rigor without visual clutter.
- Uses existing model.

### Cons

- Editing hidden metadata requires clear affordances.
- Need to avoid users forgetting captured text exists.

### Estimated Effort

1-3 implementation passes for compact source/quote rendering.

### User Scenario

The user pastes an article link. It becomes a compact source row. They add a one-line note and continue writing. Later, they expand the source to inspect captured text and export the page to Markdown with citations intact.

## Feature Proposal 8: Page Links, Backlinks, Tags, and Smart Views

### Problem

Nested pages are useful, but research rarely belongs to exactly one place. A note may be part of "OAuth", "browser security", and "library comparison." Pure tree hierarchy forces premature organization.

### Proposed Experience

Add lightweight organization while writing:

- `[[Page title]]` creates or links a page.
- `#tag` adds a tag.
- Backlinks panel shows pages/blocks that mention the current page.
- Smart views collect pages by tag, last edited, pinned, has sources, has open questions, etc.

Apple Notes demonstrates the value of tags and Smart Folders: users can organize notes without moving them. Bear demonstrates simple wiki links and aliases for connecting notes by title.

### Implementation Options

#### Option A: Parse Links and Tags into Search Index Only

Do not create new stores. During `indexBlock`, extract:

- `[[...]]` page mentions.
- `#tags`.

Store them as fields on `searchIndex` or derived index entries.

Pros:

- Minimal migration.
- Quick to power backlinks and tag filtering.

Cons:

- Derived data is awkward if page titles change.
- Tags/links are less queryable than dedicated stores.

#### Option B: Add Dedicated `links` and `tags` Stores

Add stores:

```js
links: "id, fromPageId, fromBlockId, toPageId, linkText, updatedAt"
tags: "id, tag, pageId, blockId, updatedAt"
```

Pros:

- Better querying.
- Better future support for rename, graph, backlinks, smart views.

Cons:

- More migration and indexing work.

#### Option C: Store Inline Markup Only at First

Support wiki link syntax visually but rely on regular search.

Pros:

- Fastest.

Cons:

- Does not deliver true backlinks/smart organization.

### Recommendation

Start with Option A if we want a quick experiment; move to Option B when links/tags become core product features.

### UX Detail

When the user types `[[PKCE]]`:

- If page exists, show it as a retro inline link.
- If page does not exist, show "Create page PKCE" in autocomplete.
- Selecting it creates the page and links it.

When the user types `#oauth`, the tag becomes clickable. Clicking opens a smart view of matching pages/blocks.

### Pros

- Supports non-linear research.
- Reduces pressure to perfect the sidebar tree.
- Makes old notes discoverable.

### Cons

- Requires indexing and rename decisions.
- Link syntax can add cognitive load if overemphasized.
- Smart views need careful UI so they do not become another panel overload.

### Estimated Effort

3-8 implementation passes depending on indexing depth.

### User Scenario

The user writes:

```text
PKCE is mandatory for public clients. See [[OAuth threat model]] #oauth #security
```

Later, while viewing `OAuth threat model`, the backlinks panel shows this paragraph. The user did not have to move or duplicate notes.

## Feature Proposal 9: Outline Mode and Nested Blocks

### Problem

The user specifically mentioned wanting pages to nest, but research content itself can also benefit from nesting. Lists already have items, but blocks are flat within a page. Long research pages may need collapsible sections and nested thoughts.

### Proposed Experience

Add an optional outline mode:

```text
▾ Security concerns
  - Token leakage
  - Redirect URI abuse
  ▾ Browser storage
    - LocalStorage risks
    - SameSite cookies
```

Interactions:

- `Tab` indents a block under the previous block.
- `Shift+Tab` outdents.
- Parent blocks can collapse children.
- Dragging a parent moves children with it.
- Export preserves nesting as Markdown headings/lists or indentation.

This moves the app closer to Roam/Logseq-style outliner behavior without requiring the whole product to become an outliner.

### Data Model Options

#### Option A: Add `parentBlockId` to Blocks

Extend blocks:

```js
{
  id,
  pageId,
  parentBlockId: null | "block_...",
  sortOrder,
  collapsed,
  ...
}
```

Pros:

- Consistent with page tree.
- Enables nested block operations.

Cons:

- More complex rendering, paste, reorder, export, and search.
- Tables and source blocks as parents need product rules.

#### Option B: Only Support Nested List Items

Enhance `BLOCK_TYPES.list` to support nested items.

Pros:

- Smaller scope.
- Fits existing list semantics.

Cons:

- Does not solve section-level folding.
- Less flexible for research pages.

#### Option C: Use Headings as Collapsible Sections

Do not nest arbitrary blocks. Treat headings as section boundaries and allow collapse.

Pros:

- Much simpler.
- Great user value for long pages.
- No migration required if collapse state is ephemeral or metadata-based.

Cons:

- Not a true outliner.
- Moving a heading with its section requires custom range logic.

### Recommendation

Start with Option C: collapsible headings/sections. It provides focus benefits with less model complexity. Add `parentBlockId` only if user testing proves real nested block editing is needed.

### Estimated Effort

- Collapsible headings: 2-4 passes.
- True nested blocks: 6-12 passes.

### User Scenario

The user has a long "OAuth research" page. They collapse "Implementation notes" and "Raw excerpts" while writing "Recommendation." The page becomes easier to scan without creating separate pages too early.

## Feature Proposal 10: Templates, Capture Inbox, and Daily/Session Notes

### Problem

A research notepad often starts with repeated structures:

- Topic overview.
- Sources.
- Quotes.
- Open questions.
- Decision.
- Follow-up tasks.

The current app creates one blank paragraph on each page. That is simple but not very supportive.

### Proposed Experience

Add a lightweight template menu for new pages:

```text
New page
New child page
New from template >
  Research topic
  Source review
  Comparison table
  Decision note
  Meeting/review notes
```

Add an Inbox page:

- Fast capture defaults to Inbox.
- Later, user moves blocks/pages to the right topic.

Add optional daily/session note:

- `Today` page collects quick notes and sources.
- User can extract blocks into topic pages later.

### Implementation Details

Templates can be plain JavaScript functions returning block arrays:

```js
function researchTopicTemplate(pageId) {
  return [
    createBlock({ pageId, type: "heading", content: { level: 2, text: "Summary" } }),
    createBlock({ pageId, type: "paragraph", content: { text: "" } }),
    createBlock({ pageId, type: "heading", content: { level: 2, text: "Sources" } }),
    createBlock({ pageId, type: "sourceLink" }),
    createBlock({ pageId, type: "heading", content: { level: 2, text: "Open questions" } }),
    createBlock({ pageId, type: "list" }),
  ];
}
```

### Pros

- Helps users start faster.
- Promotes good research structure.
- Cheap to implement.

### Cons

- Templates can feel prescriptive.
- Too many templates create choice overload.

### Estimated Effort

1-3 implementation passes.

### User Scenario

The user creates a new child page from "Source review." It starts with Source, Summary, Key quotes, Reliability, and Follow-up. The user edits content directly instead of building structure manually.

## Feature Proposal 11: Search as Navigation, Not Just Results

### Problem

Search currently displays results above the editor. This is useful but disruptive: results push content down and the search box lives in permanent toolbar chrome.

### Proposed Experience

Search should have two modes:

1. **Quick switcher:** open page or command.
2. **Search panel:** inspect matching blocks across pages.

The always-visible search input can be removed or minimized once command palette exists. Search results can appear in an overlay or sidebar panel rather than pushing the current editor down.

### Implementation Details

- Keep current `storage.request("search")`.
- Add result grouping by page.
- When selecting a result, open page and scroll to block as current code already does.
- Preserve search query in panel state.
- Add highlighted match snippets later.

### Pros

- Less editor layout shift.
- Better search workflow.
- Reuses existing search index.

### Cons

- Requires overlay/panel component.
- Needs ranking and keyboard behavior.

### Estimated Effort

2-4 passes.

### User Scenario

The user presses `Ctrl/Cmd+K`, types `pkce`, and sees both the `PKCE` page and three matching quote blocks. Selecting a quote opens the page and focuses the block. The current writing canvas is not permanently displaced by search UI.

## Feature Proposal 12: Autosave Confidence, History, and Undo

### Problem

The user verified save works, but modern note apps need save confidence. The current statusbar exposes `saved`, `dirty`, `saving`, or `failed`, but it is still a developer-like status. There is no visible edit history or undo beyond native input behavior.

### Proposed Experience

- Keep a subtle retro status strip: `saved locally 14:32`.
- On failure, show a clear persistent warning with retry.
- Add per-session undo for block operations: add/delete/reorder/transform.
- Later add page history snapshots.

### Implementation Details

Short-term:

- Improve status text.
- Include last saved timestamp.
- Add toasts for failed save/export only.

Medium-term:

- Maintain an in-memory undo stack for structural actions.
- Save snapshots on significant page changes or export.

Long-term:

- Add `revisions` store:

```js
revisions: "id, pageId, createdAt"
```

### Pros

- Builds trust in local-first persistence.
- Makes drag/drop and delete less risky.

### Cons

- Revision history can grow storage quickly.
- Undo across debounced writes needs careful design.

### Estimated Effort

- Save confidence polish: 1 pass.
- Structural undo: 3-5 passes.
- Durable history: 6+ passes.

## Recommended Roadmap

### Phase 1: Declutter Without Migration

Goal: make the app immediately feel modern while preserving current persistence.

Features:

- Borderless paragraph/heading editing.
- Hide block toolbar until hover/focus.
- Compact source and quote display.
- Inline add buttons.
- Remove persistent add-block toolbar or collapse it into a single insert button.
- Focus mode and sidebar collapse.
- Basic context menus for block/page actions.
- Improved status copy.

Why first:

- Highest UX improvement per engineering risk.
- Does not require database migration.
- Lets product owner evaluate the new feel quickly.

Risks:

- Hidden controls may reduce discoverability.
- Need hover/focus/touch accessibility.

Mitigation:

- Keep a visible `Insert` command in empty states.
- Add command palette soon after.
- Use tooltips/labels where needed.

### Phase 2: Command Layer and Slash Menu

Goal: keep UI minimal while preserving power.

Features:

- Slash command menu.
- Command palette.
- Page quick switcher.
- Move page/block commands.
- Keyboard shortcuts for common actions.

Why second:

- Hiding toolbar controls requires another reliable path to actions.
- It creates infrastructure for future features.

Risks:

- Keyboard implementation can get scattered.

Mitigation:

- Create a command registry and route UI actions through it.

### Phase 3: Page Tree and Drag-and-Drop

Goal: make multi-page research organization viable.

Features:

- `parentPageId` and `collapsed` page fields.
- DB version 2 migration.
- Sidebar tree rendering.
- Drag-and-drop reorder/nest/unnest.
- Move to command.
- Breadcrumbs.
- Export page subtree.

Why third:

- It is high value but needs more careful persistence work.
- The command layer provides an accessible fallback.

Risks:

- DnD bugs can corrupt user organization.

Mitigation:

- Soft updates with validation.
- JSON backup before migration.
- Tests for cycle prevention and ordering.

### Phase 4: Research Knowledge Features

Goal: make notes discoverable and connected.

Features:

- Wiki links.
- Tags.
- Backlinks.
- Smart views.
- Source panel.
- Templates.

Why fourth:

- These features benefit from page tree, command palette, and calmer editor foundation.

Risks:

- Scope creep into full PKM product.

Mitigation:

- Start with simple, local-first, text-based conventions.

### Phase 5: Rich Editor Engine Decision

Goal: decide whether native blocks are enough or a full editor engine is needed.

Decision criteria:

- Need for inline bold/italic/link formatting.
- Need for robust cross-block selection.
- Need for nested block editing.
- Need for collaborative editing.
- Need for complex copy/paste fidelity.
- Willingness to vendor a larger dependency.

Recommendation:

- Do not adopt a full editor engine until Phase 1-3 prove the product direction.
- If adopted, treat it as an architecture migration, not a cosmetic change.

## Detailed Implementation Impact by File

### `src/ui.js`

Likely changes:

- Split rendering into smaller methods:
  - `renderShell`
  - `renderPagesTree`
  - `renderEditorHeader`
  - `renderBlocks`
  - `renderCommandPalette`
  - `renderSlashMenu`
  - `renderContextMenu`
- Add UI state for:
  - focus mode
  - sidebar collapsed
  - expanded block details
  - command palette
  - slash menu
  - context menu
  - dragging page/block
- Replace direct action conditionals with command registry over time.
- Add keyboard handling at root level.

Risks:

- `src/ui.js` can become too large. If Phase 2 starts, split helpers:
  - `src/commands.js`
  - `src/page-tree.js`
  - `src/editor-renderers.js`
  - `src/drag-drop.js`

### `src/models.js`

Likely changes:

- Add `parentPageId`.
- Add `collapsed`.
- Possibly add page `icon` or `emoji` later, but avoid early visual clutter.
- Add helper to prevent tree cycles.
- Add helpers for tree construction and sibling ordering.

### `src/storage-worker.js`

Likely changes:

- DB version 2 for page hierarchy.
- New message handlers:
  - `movePageTree`
  - `updatePageCollapsed`
  - `duplicatePage`
  - later `indexLinksAndTags`
- Search should eventually include tags/link text.

### `src/paste.js`

Likely changes:

- URL-only paste can create source block.
- Markdown paste can preserve headings/lists more intentionally.
- Later: parse `[[links]]` and tags into text while indexing.

### `src/exporters.js`

Likely changes:

- Export current page only.
- Export page subtree.
- Export all pages.
- Preserve hierarchy in filenames or folders inside zip if JSZip is used.
- Include backlinks/tags optionally.

### `styles.css`

Likely changes:

- Define "quiet editor" styles.
- Add hover/focus block controls.
- Add sidebar tree indentation and disclosure icons.
- Add focus mode.
- Add menu/palette positioning.
- Add mobile behavior for sidebar drawer.

Important style guardrail:

- Keep the retro visual language in frame/chrome, not in heavy borders around every piece of content.

## Product Decisions Needed

### Decision 1: What Is the Primary Product Identity?

Options:

1. **Research writing notebook:** focus on pages, sources, quotes, summaries.
2. **General block notes app:** broader, more like Notion-lite.
3. **Outliner/PKM tool:** block references, backlinks, graph-like organization.

Recommendation:

Choose "research writing notebook." It fits the current source blocks, paste conversion, Markdown export, and local-first design. Borrow from PKM tools only where it helps research.

### Decision 2: How Much Rich Text?

Options:

1. Plain text blocks with Markdown export.
2. Markdown shortcuts rendered visually.
3. Full rich-text editor.

Recommendation:

Start with plain text plus Markdown-like shortcuts. Do not jump to full rich text until the core UX is calm.

### Decision 3: How Should Nested Export Work?

Options:

1. Export selected page only.
2. Export selected page plus descendants into one Markdown file.
3. Export zip with one Markdown file per page.

Recommendation:

Keep current export for selected page. Add "Export subtree" after page nesting. Use headings and links for descendants in one Markdown file first; zip can come later.

### Decision 4: Are Pages Also Blocks?

Notion treats child pages as blocks in a page. This app currently separates pages and blocks.

Options:

1. Keep pages separate and only show hierarchy in sidebar.
2. Add "subpage block" type inside editor.
3. Fully unify pages and blocks.

Recommendation:

Keep pages separate for now. Add optional "linked page/subpage block" later if needed. Full unification is not worth the complexity yet.

## UX Anti-Patterns to Avoid

- Replacing six visible toolbar buttons with twelve visible toolbar buttons.
- Making slash commands the only way to add blocks.
- Making drag-and-drop the only way to move pages.
- Adding a page tree but no collapse state.
- Hiding controls without keyboard/menu alternatives.
- Showing block type labels for ordinary paragraphs.
- Showing source metadata forms by default.
- Adding rich editor complexity before solving focus and organization.
- Turning the retro theme into heavy decoration that competes with content.

## Acceptance Criteria for the Next UX Pass

A successful first modernization pass should meet these criteria:

- A page with five paragraphs looks like a document, not five form cards.
- Paragraph labels are not visible by default.
- Block movement/delete controls appear on hover/focus or menu, not permanently.
- User can add a block inline near where they are writing.
- User can enter focus mode and write with minimal chrome.
- Source blocks are readable in compact mode.
- Search or command access remains available after hiding toolbar controls.
- Autosave status remains visible but subtle.
- Keyboard users can reach the same major actions.
- Existing save, paste, search, Markdown export, and JSON backup still work.

## Prioritization Matrix

Scoring scale: 1 is low, 5 is high. "Confidence" reflects how strongly the recommendation follows from current app fit, user value, and implementation predictability.

| Feature | User Value | Implementation Cost | Risk | Confidence | Notes |
| --- | ---: | ---: | ---: | ---: | --- |
| Calm editor styling | 5 | 2 | 2 | 5 | Biggest immediate perceptual improvement; no migration required. |
| Hover/focus block controls | 5 | 2 | 2 | 5 | Turns visible structure into progressive structure. |
| Compact source/quote blocks | 4 | 2 | 2 | 5 | Directly improves research readability using existing fields. |
| Focus mode/sidebar collapse | 4 | 2 | 1 | 5 | Low-risk answer to distraction. |
| Context menus | 4 | 3 | 3 | 4 | Needed as visible controls disappear. |
| Slash insert menu | 5 | 3 | 3 | 4 | Strong modern note-taking pattern; must avoid accidental activation. |
| Command palette | 5 | 4 | 3 | 4 | Important for keyboard-first navigation and hidden actions. |
| Nested page tree | 5 | 5 | 4 | 5 | High value and explicitly requested; needs migration and validation. |
| Page drag-and-drop | 5 | 5 | 4 | 4 | Important, but should ship with move command fallback. |
| Tags/smart views | 4 | 4 | 3 | 4 | Reduces hierarchy pressure; useful after tree exists. |
| Wiki links/backlinks | 4 | 5 | 4 | 3 | Valuable, but title rename and indexing rules need care. |
| Collapsible headings | 4 | 3 | 3 | 4 | Useful middle ground before true nested blocks. |
| True nested blocks | 4 | 5 | 5 | 3 | Powerful but complex; defer until demand is clear. |
| Full editor engine | 5 | 5 | 5 | 3 | Potentially right later; too heavy for the next pass. |

The matrix supports a clear sequence: first reduce chrome, then add command access, then add hierarchy.

## User Journey Comparison

### Journey A: Capturing a Source While Researching

Current journey:

1. User creates or opens a page.
2. User sees page controls, block add toolbar, and an empty paragraph block.
3. User clicks `Source` in the add toolbar.
4. User fills URL, title, note, and captured text fields, all visible at once.
5. User continues writing below a visually large form block.

Proposed journey:

1. User opens the page and starts typing in a quiet document canvas.
2. User types `/source` or pastes a URL.
3. A compact source block appears where the cursor is.
4. URL input receives focus; title and note can be added inline.
5. The source collapses to a readable source chip after focus leaves.
6. Full metadata remains available from `Edit source details`.

Why this is better:

- The user never leaves the writing location.
- Source rigor remains available.
- The page remains readable after capture.
- The action feels like note-taking, not data entry.

### Journey B: Reorganizing Pages After a Research Session

Current journey:

1. User has ten flat pages.
2. User clicks up/down buttons repeatedly to reorder.
3. There is no way to express parent/child relationships.
4. User must encode hierarchy in titles, for example `OAuth - PKCE`.

Proposed journey:

1. User opens sidebar tree.
2. User drags `PKCE` under `OAuth research`.
3. User drags `Provider docs` under the same parent.
4. User collapses `OAuth research`.
5. For a distant page, user opens command palette and runs `Move page to...`.

Why this is better:

- The visible structure matches the user's mental model.
- Drag-and-drop handles short, spatial operations.
- Command move handles long-distance organization.
- Collapsing keeps large workspaces calm.

### Journey C: Writing a Synthesis

Current journey:

1. User opens a page with pasted quotes, source blocks, and notes.
2. Every block shows toolbars and borders.
3. Search and command controls remain visible.
4. User must visually filter app controls away from content.

Proposed journey:

1. User enters focus mode.
2. Sidebar and top commandbar disappear.
3. Source blocks show compact citations; quote details are tucked away.
4. User writes conclusions.
5. User presses `Ctrl/Cmd+K` only when they need to navigate, insert, or export.

Why this is better:

- The UI supports a different phase of research: synthesis rather than collection.
- The same data model serves capture and writing with different chrome density.

## Interaction Rules for a Modern Retro Editor

These rules are intentionally concrete so implementation decisions stay consistent.

### Page-Level Rules

- Single click on page row opens page.
- Disclosure click expands/collapses children without opening the page.
- Hover on page row reveals `+` and menu.
- `+` on a page row creates a child page.
- `+` at top of sidebar creates a root page.
- Drag handle on page row starts reorder/nest.
- Context menu offers actions but never becomes the only path.
- Active page is auto-revealed in the tree.
- Sidebar can be resized and collapsed.

### Block-Level Rules

- Paragraphs do not show a type label.
- Headings look like headings, not input boxes.
- Block handle appears on hover/focus in the left gutter.
- Insert control appears between blocks on hover.
- Enter in a paragraph creates a new paragraph after it.
- Enter at end of heading creates a paragraph after it.
- Backspace in an empty paragraph deletes it or merges with previous block.
- Escape selects the current block if block selection is implemented.
- Slash menu appears only for command-like text and is easy to dismiss.
- Delete is available through menu and keyboard, with undo or confirmation for destructive structural deletes.

### Metadata Rules

- Source URL/title/note/captured text should not all be visible by default.
- Quote attribution/source should be visible as compact secondary text.
- Code language can be visible as a small label or editable chip.
- Table controls should appear near the table, not in the global toolbar.
- Details panels should preserve writing position when opened/closed.

### Search and Command Rules

- Search should not push the editor down during normal writing.
- Command palette should include visible labels and result types.
- Commands should preserve focus after execution.
- Keyboard shortcuts should be shown in help/command palette, not as persistent text in the main canvas.

## Data Migration and Safety Notes

The strongest future migration is page hierarchy. It should be designed defensively because local user data matters.

### Migration Shape

Existing `pages` records can be normalized to:

```js
{
  ...page,
  parentPageId: page.parentPageId ?? null,
  collapsed: Boolean(page.collapsed)
}
```

Existing pages remain root pages. No existing sort order is lost.

### Cycle Prevention

Moving page `A` under page `B` is invalid if:

- `A === B`
- `B` is a descendant of `A`

Implementation helper:

```js
function canMovePage({ pageId, nextParentPageId, pages }) {
  if (!nextParentPageId) return true;
  if (pageId === nextParentPageId) return false;
  const byId = new Map(pages.map((page) => [page.id, page]));
  let cursor = byId.get(nextParentPageId);
  while (cursor) {
    if (cursor.parentPageId === pageId) return false;
    cursor = byId.get(cursor.parentPageId);
  }
  return true;
}
```

### Reorder Strategy

The current app uses integer `sortOrder` values spaced by 1000. That remains acceptable.

When inserting into a sibling list:

- If there is room between neighbors, set midpoint sort order.
- If not, renumber siblings to `(index + 1) * 1000`.
- Persist only affected sibling group where possible.

The current app renumbers all pages for flat reorder. A tree version should renumber only the old and new sibling groups.

### Backup and Rollback

Before a hierarchy migration:

- Keep JSON backup export prominent.
- Add migration logging.
- Preserve unknown fields during normalization.
- Avoid hard deletes.

The current observability work is useful here: migration and move operations should log page IDs, old parent, new parent, sibling counts, and validation failures.

## Design Validation Plan

The product owner should evaluate the next UX pass with task-based checks, not only screenshots.

### Task 1: Write Without Managing Blocks

Prompt:

```text
Create a page called OAuth research. Write three paragraphs, add one heading, and add one quote.
```

Success signals:

- User does not need to think about block labels.
- User can add structure inline.
- The result reads like a document.

Failure signals:

- User hunts for the add toolbar.
- User is distracted by movement/delete controls.
- User cannot tell where the next paragraph will go.

### Task 2: Capture and Reuse a Source

Prompt:

```text
Paste a source URL, add a note about why it matters, then keep writing.
```

Success signals:

- Source capture is fast.
- Source block becomes compact after editing.
- The note remains readable.

Failure signals:

- User sees a large permanent form.
- User loses cursor/focus.
- User is unsure whether the source was saved.

### Task 3: Organize a Small Research Tree

Prompt:

```text
Create a parent research topic and three child pages. Move one existing page into the parent.
```

Success signals:

- User can create child pages from the sidebar.
- User can drag a page or use `Move to...`.
- Tree collapse works.

Failure signals:

- User can only reorder with buttons.
- User must rename pages to simulate hierarchy.
- Drag target is ambiguous.

### Task 4: Enter Focus Mode and Export

Prompt:

```text
Hide distractions, write a conclusion, then export Markdown.
```

Success signals:

- Focus mode is obvious.
- Hidden commands remain reachable.
- Export still works without leaving focus context.

Failure signals:

- User gets trapped because toolbar is hidden.
- User cannot find export.
- Save status becomes unclear.

## Design Decision Records to Create Later

The report recommends several future ADRs before implementation expands.

### ADR: Page Hierarchy Storage

Question:

Should hierarchy live on page records or in a separate tree setting?

Recommended decision:

Store `parentPageId` and `collapsed` on page records.

Reason:

This is durable, simple, and migration-friendly. It avoids tree/settings divergence.

### ADR: Editor Engine

Question:

Should the app continue with native block rendering or adopt a rich editor engine?

Recommended decision:

Continue native for the next UX pass. Revisit after command palette, nested pages, and calm editor styling.

Reason:

The current pain is chrome and organization, not yet inline rich-text fidelity.

### ADR: Organization Model

Question:

Should the product prioritize folders/pages, tags, or links?

Recommended decision:

Support nested pages first, tags/links second.

Reason:

Nested pages are explicitly requested and align with the current page list. Tags/links should reduce hierarchy pressure after the tree exists.

### ADR: Drag-and-Drop Library

Question:

Use native APIs, custom pointer events, or a library?

Recommended decision:

Start with custom pointer events for page tree DnD if no dependency policy changes. Use command move as fallback regardless.

Reason:

Native HTML DnD has rough edges; a library may be overkill in this no-install static app.

## Proposed First Implementation Ticket

Title: Calm Editor and Progressive Controls

Scope:

- Restyle paragraph/heading blocks as borderless document content.
- Hide `.trn-block-toolbar` until block hover/focus.
- Replace persistent add-block toolbar with one compact Insert button and per-block hover add affordance.
- Add compact rendering for source and quote blocks.
- Add focus mode toggle that hides sidebar and commandbar.
- Preserve all current data structures.
- Add or update tests only where behavior changes.

Out of scope:

- Page nesting.
- Drag-and-drop.
- Full command palette.
- Rich text engine.
- Tags/backlinks.

Why this ticket:

It directly addresses the user's biggest pain: the UI distracts from content. It also creates a better baseline for deciding whether deeper features are worth building.

## Proposed Second Implementation Ticket

Title: Command Palette and Slash Insert Menu

Scope:

- Add command registry.
- Add `Ctrl/Cmd+K` palette for commands and page navigation.
- Add slash menu for inserting/transformation of block types.
- Route existing actions through command handlers where practical.
- Add keyboard support and Escape behavior.

Why this ticket:

Once the visible UI is reduced, users need a reliable hidden command layer.

## Proposed Third Implementation Ticket

Title: Page Tree with Move Commands

Scope:

- DB v2 migration for `parentPageId` and `collapsed`.
- Render page tree with disclosure toggles.
- Add new child page.
- Add move page command with destination search.
- Add drag-and-drop reorder/nest if time allows, or land command move first.

Why this ticket:

Nested organization is a major user-requested feature, but the command move path should arrive with it so hierarchy is not mouse-only.

## Final Recommendation

The product should become a **retro research writing desk**:

- Retro in frame, color, density, and tactile controls.
- Modern in flow, organization, and focus.
- Local-first and trustworthy.
- Research-specific rather than generic.

The best next move is not to add every advanced note-taking feature at once. The best next move is to make the existing editor feel calm and direct, then add a command layer, then add nested pages. Those three steps will transform the app from a working proof of concept into a product that feels intentionally designed.

## Sources Consulted

- Notion Help: Navigate with the sidebar. https://www.notion.com/help/navigate-with-the-sidebar
- Notion Help: Using slash commands. https://www.notion.com/help/guides/using-slash-commands
- Notion Help: What is a block? https://www.notion.com/help/what-is-a-block
- Notion Developers: Block object reference. https://developers.notion.com/reference/block
- Obsidian Help: File explorer. https://obsidian.md/help/plugins/file-explorer
- Obsidian Forum: command palette/context menu move request. https://forum.obsidian.md/t/option-in-command-palette-and-context-menu-to-move-file/269
- Readwise Reader Docs: Highlights, Tags, and Notes. https://docs.readwise.io/reader/docs/faqs/highlights-tags-notes
- Apple Support: Tags and Smart Folders in Notes. https://support.apple.com/en-us/102288
- Bear FAQ: How to link notes together. https://bear.app/faq/how-to-link-notes-together/
- Tiptap Docs: Slash Commands example. https://tiptap.dev/docs/examples/experiments/slash-commands
- Tiptap Docs: Editor commands. https://tiptap.dev/docs/editor/api/commands
- Apple Human Interface Guidelines: Context menus. https://developer.apple.com/design/human-interface-guidelines/context-menus
- Reddit qualitative check: slash command annoyance in Notion. https://www.reddit.com/r/Notion/comments/ldy2gr/is_it_possible_to_change_as_the_key_for_seeing/
