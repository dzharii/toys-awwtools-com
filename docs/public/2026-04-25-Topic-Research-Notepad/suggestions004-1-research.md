2026-04-27

Codex, create new file: suggestions004-2-research-result.md for your research results

Codex, Example report: 2026-04-26-user-enhancement-research.md <== this is only example, but look how comprehansive and detailed it is. 
We want this!

A00. UX model for the Topic Research Notepad

The application should feel like a lightweight research desk, not like a form editor. The user is not filling out isolated fields. The user is collecting thoughts, fragments, links, source snippets, drafts, and observations while thinking. The interface should support that state of mind: low interruption, easy capture, predictable editing, and fast movement between small pieces of content.

The core UX expectation is that the app behaves like one continuous writing surface even though it is technically made from blocks. Blocks are useful because they allow moving, transforming, deleting, and structuring pieces of content. But the user should not constantly feel the mechanical boundaries between blocks. The block model should help organization without interrupting composition.

A good foundation for this app is: the user can create a page quickly, type immediately, add more notes without planning structure first, move through the note with the keyboard, reorganize later, and trust that the content is saved locally.

B00. The app should optimize for capture first, organization second

The most important moment in this app is the moment when the user has a thought and wants to put it somewhere. The app should not ask for too many decisions before capture. It should not ask the user to choose a block type, title, category, or source before they can write. Those can exist, but they should not stand between the user and the first sentence.

This is why the New Page prompt is friction. The user clicked New Page because they want a place to write. The title can come later. A default title is enough. The page should appear, become active, and be ready for input.

The same principle applies to "+ Add paragraph". It should be easy to continue writing. If the user reaches the end of a paragraph and presses Down or Enter in the right context, the next paragraph should be available. Creating text should feel cheaper than formatting text.

The app should support a rough-notes workflow. A user may paste a messy paragraph, add a heading later, convert something into a source block later, or split a paragraph after rereading it. The first version of a note is often imperfect. The UX should make that acceptable.

C00. The page should have a clear hierarchy

The visible page has several conceptual layers: the application shell, the page list, the active page, the page title, the block-type toolbar, the writing area, individual blocks, block controls, and save status.

The hierarchy should be visually obvious. The page list is for navigation between pages. The active page title names the current page. The toolbar offers insertion or transformation tools. The writing area is the main activity. Individual blocks are units inside the writing area. Block controls are secondary and should not compete with the text. Save status is reassurance, not a primary control.

Right now, some elements compete visually. The sidebar controls, active block borders, toolbar, and empty space all draw attention. The target experience should reduce unnecessary competition. Text should be the strongest object in the editor. Controls should appear when needed, but not constantly shout for attention.

D00. The editor should behave like a document, not like disconnected fields

A block editor has a risk: every block becomes a separate little input box. That is mechanically accurate but experientially poor. Users expect the document to behave as one text surface.

The user should be able to start at the top and move down through the note with the keyboard. They should be able to edit a paragraph, press ArrowDown at the bottom, continue into the next paragraph, and keep writing. They should be able to press ArrowUp at the top of a block and return to the block above. They should be able to press Enter in a paragraph and get either a line break or a new paragraph depending on the chosen product model, but the behavior must be intentional and consistent.

The block boundaries should become visible mainly when useful: when the user hovers, focuses, selects, drags, reorders, transforms, or deletes. During plain writing, the blocks should fade into the background.

E00. The app should make keyboard movement predictable

Keyboard behavior is foundational for a note editor. A user writing notes should not need the mouse for ordinary movement.

The expected keyboard model is this: inside a block, keys behave like normal text editing. Arrow keys move the caret. Home and End move within the line or block according to platform conventions. Ctrl or Cmd plus arrows should ideally follow platform conventions if supported by the browser. Selection with Shift plus arrows should work normally inside the text.

At block boundaries, the editor should add document-level behavior. ArrowDown at the bottom moves to the next block. ArrowUp at the top moves to the previous block. Backspace at the start of an empty block may eventually merge with or remove the block above. Delete at the end of an empty block may eventually remove the current block or merge forward. Tab could eventually indent list items or move focus depending on block type.

The key principle is that native text editing wins until it cannot continue. Only then does block navigation take over.

F00. The app should avoid accidental destructive or multiplying actions

The user described a strong example: holding ArrowDown should not create thousands of empty paragraphs. This belongs to a broader UX principle. Repeated key presses should not cause uncontrolled structural changes.

Any action that creates, deletes, moves, or transforms blocks should be stable under accidental repetition. Holding a key should not flood the document. Clicking a button twice should not create confusing duplicates unless duplicate creation is clearly intended. Delete should be recoverable through undo. Reorder buttons should move one step per action and keep the user oriented.

This is especially important because the app is local-first. Users need to trust that they can experiment without destroying their notes.

G00. The editor should have a forgiving creation model

A good notes app lets users create content in multiple ways. The visible "+ Add paragraph" affordance is useful for mouse users. Keyboard users need equivalent paths.

The user should be able to create a new paragraph by clicking "+ Add paragraph". They should also be able to reach it by keyboard. At the end of the last block, ArrowDown can move to it or activate it, depending on the chosen model. Enter at the end of a paragraph may also create a new paragraph if that matches the app's intended editing model.

When a new paragraph appears, it should be ready for input. The user should not have to click inside it after creating it. The app should place the caret in the new block.

Empty blocks should be treated carefully. One empty current block is useful; many empty blocks are clutter. The editor should allow one empty landing spot but prevent accidental empty-block accumulation.

H00. The app should distinguish primary and secondary controls

Primary controls are things the user needs constantly: create page, search notes, add paragraph, edit text. Secondary controls are things needed occasionally: reorder page, delete block, transform block type, move block up/down.

Secondary controls should not permanently occupy too much visual attention. They should appear on hover, focus, or when the block is active. The user should be able to discover them, but the writing surface should not look like a control panel.

This applies to sidebar reorder arrows and block-level controls. If every row and every block always shows all controls, the note becomes visually noisy. A cleaner model is: show the active content clearly, reveal controls contextually, and preserve keyboard access.

I00. The sidebar should be a navigation map

The sidebar page list should help the user understand where they are and move between pages quickly. It should not behave like a dense admin table unless the user is explicitly managing pages.

The active page should be clearly highlighted. Other pages should be readable. Long titles should truncate gracefully. Reorder controls should appear only when the user shows intent, such as hover or focus. The full title should be recoverable through a tooltip or by selecting the page.

The sidebar width should be adjustable if the app supports resizing. When resized, it should not create broken-looking text clipping. The page row layout should adapt: title takes available space, controls take minimal space, title ellipsizes when necessary.

The sidebar should also communicate page identity. If dates are part of page titles, the UI should not rely on the date alone. The visible title should show enough of the meaningful part of the name to distinguish pages.

J00. Search should feel local, fast, and non-destructive

The search field says "Search local notes". The expected behavior is that search filters or highlights local pages quickly without changing content. Search should not feel like a mode that traps the user.

A good search experience would let the user type a query and see matching pages or matching blocks. The current page selection should remain understandable. Clearing search should restore the full page list. If no results are found, the empty state should be plain and helpful.

Search should not erase unsaved edits or switch pages unexpectedly unless the user selects a result. If the app later supports block-level search, search results should show page title plus matching excerpt.

K00. Page creation should be immediate and reversible

The New Page button should create a page immediately with a default title. The user should then rename it inline. This is the lowest-friction model.

The page should appear in a predictable location. If new pages are added to the top, that should be consistent. If added near the current page or at the bottom, that should also be consistent. The active page should switch to the new page immediately.

If the user creates a page accidentally, there should eventually be a clear way to delete it or undo creation. Since the app already has an Undo button, new page creation should ideally be undoable. If page deletion is not implemented yet, accidental page creation is less dangerous if empty pages are easy to identify and remove later.

L00. Page titles should be editable, but not fragile

The page title is a core field. It should be directly editable because titles often emerge after the user writes the note. The user should not need a modal dialog.

Editing the title should feel safe. If the user clicks the title, it becomes editable. Enter should confirm or blur depending on the chosen model. Escape should ideally cancel the current title edit if feasible. Clicking elsewhere should save. Empty titles should be handled gracefully: either restore the previous title, use "Untitled", or use "New research page".

The sidebar should update as the title changes, but it should not visually stutter. If the title is long, the sidebar should truncate it cleanly.

M00. The toolbar should clarify whether it inserts or transforms

The toolbar contains Paragraph, Heading, Quote, List, Table, Code, and Source. From the screenshots, it is not completely clear whether these buttons insert new blocks, transform the current block, or both.

A good UX should make this predictable. If no block is active, clicking Heading might insert a heading block at the current insertion point or at the end. If a block is active, clicking Heading might transform the active block into a heading. Either model can work, but it should be consistent.

The visible "Turn into" controls on blocks suggest that transformation exists at the block level. If so, the top toolbar may be better understood as insertion controls: "create a new Paragraph", "create a new Heading", and so on. But if the toolbar also transforms the active block, the active block state should make that clear.

The user should not have to guess whether clicking "Quote" will create a new quote block or convert the current paragraph into a quote.

N00. Block controls should be local and contextual

Each block appears to have controls like up, down, turn into, and delete. These controls are useful, but they should be attached to the block they affect. The user should always be able to tell which block will move or be deleted.

Controls should be visually close enough to the block to feel associated with it, but not so close that they interfere with text. They should not cover text. They should not appear in a way that changes the line wrapping unpredictably.

A good model is: when a block is hovered or focused, show its controls on the block's edge or top-right area. When the block is inactive and not hovered, hide or reduce the controls. The active block may show controls if needed, but the controls should not distract from typing.

Delete should be especially careful. If Delete is a small always-visible button near text, accidental clicks are possible. The app should have undo coverage, or deletion should be slightly harder than moving a block. A confirmation is probably too heavy for every block delete, but undo support is important.

O00. Source blocks should have a clear purpose

The app has a Source block with a language field and a large empty area. It seems intended for snippets, references, code, quotes, copied source material, or structured citations. Its UX should be clearer.

A user should understand what belongs in a Source block and how it differs from Code or Quote. If the Source block is for pasted external material, it may need fields like source title, URL, language, and body. If it is for code snippets, then it overlaps with Code. If it is for citations, the label should guide that.

At minimum, the Source block should have clear placeholder text. "Language" alone is not enough to explain the block. The main body area should have a placeholder such as "Paste source text, excerpt, or reference notes". If URL support is planned, add that later.

P00. The app should support paste-heavy workflows

Research notes often come from pasted material: article excerpts, links, code snippets, task lists, dates, rough thoughts, copied terminal output. The editor should handle paste gracefully.

Plain text paste should preserve paragraphs in a useful way. If the user pastes multiple paragraphs into a paragraph block, the app should either keep them in one block with line breaks or split them into multiple paragraph blocks. Either choice can work, but it should be intentional.

Pasting a URL could eventually create a source/reference block or leave it as text. Pasting code into a code block should preserve whitespace. Pasting long text should not break the layout or overflow horizontally.

The app should not lose pasted content because the wrong block was focused.

Q00. The app should make saving visible but quiet

The "saved locally" status is useful reassurance. It should remain quiet. The user should not have to think about saving unless something goes wrong.

A good save-state model has a few simple states: saved locally, saving, unsaved changes, and save error. If the app only saves synchronously to localStorage, "saved locally" is enough. But if there is any delay, the UI should not claim saved before the write completes.

The status should not cover controls or content. It should be stable in a status area. It should not flash so much that it distracts from writing.

R00. Undo should match user expectations

The app has an Undo button. Users will expect it to undo recent editing actions. The exact scope should be clarified.

At minimum, undo should cover text edits if the browser/editor already supports native undo. Ideally, the app-level Undo button should cover structural actions too: create page, rename page, create block, delete block, move block, transform block. If the button only covers some actions, that can become confusing.

The UX ideal is that the user can safely experiment. If they delete a block, move a page, or create a paragraph accidentally, Undo should recover it.

S00. Focus should always be intentional

Focus management is one of the main UX foundations for this app. After any action, the app should put focus where the user is most likely to continue.

After New Page, focus the title or first paragraph. After Add Paragraph, focus the new paragraph. After transforming a block, keep focus in the transformed block if possible. After deleting a block, focus the nearest remaining block. After moving a block up or down, keep focus on the moved block so the user can continue moving or editing it. After selecting a page from the sidebar, focus should probably move to the page title or first editable block only if that matches the user's action; otherwise it can leave focus stable, but the active page should be visually clear.

The app should avoid focus loss where the user presses a key and nothing appears to happen because focus silently moved to the body or a button.

T00. The visual style should be plain, but the spacing should still be deliberate

Retro or basic UI does not mean careless spacing. The app can use simple borders and default-looking buttons while still having consistent padding, alignment, and proportions.

The editor needs enough internal spacing to make text readable. Blocks need enough separation to be distinguishable. Buttons need consistent sizing. The sidebar needs predictable row height. Empty states need enough space to read as intentional.

The current style can be preserved while improving consistency. Use the existing colors and borders. Adjust padding, width, alignment, and visibility rules.

U00. The app should avoid layout jumps

Layout jumps are disruptive in editors. If controls appear on hover and cause the text to rewrap, the user loses orientation. If active blocks get much wider or taller, nearby content jumps. If sidebar controls appear and push titles around too much, the page list feels unstable.

The preferred model is to reserve minimal control space only when needed or overlay controls in a way that does not cover content. For sidebar rows, the title can shrink slightly when controls appear, but the row height should remain stable. For blocks, controls should not cause the paragraph text to rewrap if avoidable.

V00. Empty states should invite action

The app has a "+ Add paragraph" affordance. This is good because it tells the user what to do next. Empty pages should similarly invite writing.

A newly created page should not look dead or blank. It should show the editable title and a clear first writing target. The user should be able to click or type immediately. A placeholder like "Write a note" is useful, but it should be connected to an actual editable target.

If a page has no content blocks, the add-paragraph control should be visually obvious. If a page has content, the add-paragraph affordance can be quieter but still available at the bottom.

W00. The app should treat block type as flexible

Users often do not know upfront whether something is a paragraph, heading, quote, source, or code. They should be able to write first and change type later.

The "Turn into" control is useful for this. It should allow the user to convert a block without losing content. For example, a paragraph can become a heading. A paragraph can become a quote. A code block may preserve monospace formatting. A source block may need to map content into its body area.

If conversion would lose data, the app should avoid silent loss. For example, converting a structured source block into a paragraph should decide what happens to the source metadata.

X00. The app should make page order manageable but not dominant

Page order matters, but it is secondary to writing. The up/down controls in the sidebar are useful but should not dominate the page list.

For small numbers of pages, up/down buttons are acceptable. For larger numbers, drag-and-drop or keyboard shortcuts may eventually be better. But the foundation should be: the active page is clear, page titles are readable, and reorder actions are available only when intended.

After a page is moved, the active selection should remain on that page. The user should not lose track of it.

Y00. The app should support reading mode and editing mode without a hard switch

The screenshots show text sometimes as display text and sometimes as active editable blocks. This implicit mode is acceptable. A user can read the note, click a block, and edit it.

The transition should be smooth. Display text should have good line height. Active text should have padding and border. The text should not move drastically when the block becomes active. The controls should appear in a predictable place.

The editor should not require the user to click a tiny exact target to edit text. Clicking on the text area of a block should activate it. Clicking whitespace near the block may also activate it if that is consistent with the block boundary.

Z00. The app should make errors recoverable

Because this is a local note-taking app, the most important failures are content loss, accidental deletion, accidental duplication, and broken focus.

If a local save fails, the app should indicate it. If a block delete happens, undo should recover it. If a user creates an empty page accidentally, there should be a way to remove it or undo. If a title becomes empty, the app should recover with a placeholder title rather than showing a broken blank row.

The app should be conservative about actions that remove or multiply content.

AA00. Potential missing UX areas to consider next

The current screenshots suggest several future areas worth revalidating before adding larger features.

First, block splitting and merging. A note editor usually needs good behavior for Enter and Backspace. Pressing Enter in the middle of a paragraph might split the block. Pressing Backspace at the start of an empty block might remove it and move focus to the previous block. These interactions are not described yet, but they are important for a frictionless editor.

Second, selection across blocks. Users may eventually expect to select text spanning multiple blocks. This can be complex. The app may not need full cross-block selection immediately, but it should not make basic copy-paste painful.

Third, bulk paste behavior. If the user pastes a multi-paragraph article excerpt, should it become one block or multiple blocks? This should be decided intentionally.

Fourth, block insertion location. When the user clicks Paragraph, Heading, Quote, List, Table, Code, or Source, where does the new block appear? After the active block? At the end of the page? At the current caret? This needs a consistent rule.

Fifth, page deletion and recovery. New Page becomes frictionless, so deleting or undoing accidental pages becomes more important.

Sixth, search result behavior. Search is visible but not specified. It should be clear whether search filters pages, searches inside notes, highlights matches, or all of these.

Seventh, accessibility. The retro UI can remain, but controls still need keyboard focus, readable labels, sufficient contrast, and predictable tab order.

AB00. UX principles to use as implementation guidance

The app should prefer immediate action over prompts. Create the page first, let the user rename it after.

The app should prefer writing continuity over visible mechanics. Blocks exist, but they should not interrupt typing.

The app should prefer contextual controls over permanent clutter. Show secondary controls when the user is likely to need them.

The app should prefer safe repetition over dangerous repetition. Holding a key should not create uncontrolled content.

The app should prefer local predictability over cleverness. Simple, consistent behavior is better than surprising automation.

The app should prefer recoverability over confirmation dialogs. Undo is usually better than asking the user to confirm every small action.

The app should prefer readable spacing over maximum density. The app can remain compact, but text should not touch borders.

AC00. Practical UX checklist for future fixes

A user should be able to open the app and immediately understand which page is active.

A user should be able to create a new page without answering a prompt.

A user should be able to rename the page inline.

A user should be able to write the first paragraph without choosing a block type.

A user should be able to add the next paragraph without using the mouse.

A user should be able to move through existing paragraphs with arrow keys.

A user should be able to use multiline paragraphs without block navigation interfering.

A user should be able to hover or focus a block to find its controls.

A user should be able to move or delete a block while knowing exactly which block is affected.

A user should be able to recover from an accidental structural action.

A user should be able to scan page titles in the sidebar without controls cluttering every row.

A user should be able to understand long page titles through ellipsis and tooltip behavior.

A user should be able to resize the window and still have a usable editor.

A user should not see large accidental empty areas when the window is wide.

A user should not lose content after refresh if the app says it saved locally.

A user should not need to understand the implementation model to use the editor.
