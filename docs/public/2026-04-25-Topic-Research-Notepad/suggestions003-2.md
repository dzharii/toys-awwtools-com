2026-04-27

See referenced screenshots in: suggestions003-1.md
suggestions003-1.assets/*.png

A01. Product change request for OpenAI Codex: Topic Research Notepad editor layout, keyboard navigation, sidebar behavior, and page creation

This specification describes a set of UI and interaction fixes for the Topic Research Notepad application. The application is a local-first research note editor with a deliberately plain, retro visual style. The requested work is not a redesign. The existing character of the app should remain intact: simple borders, compact controls, subdued colors, visible page list, block-based note editing, and local save status.

The problem is that several parts of the interface currently behave like independent rough controls rather than one coherent writing surface. The user is trying to work inside a note-taking environment where long text is split into Notion-like blocks. The app already supports editing individual blocks, adding paragraphs, reordering pages, and storing data locally. However, the details around sizing, active block comfort, keyboard movement, page-list controls, and page creation interrupt the writing flow.

The implementer should read this as a behavior-and-layout correction pass. The goal is to make the current UI feel intentional, not to replace it with a different design system.

B01. Visual reference model

The screenshots include a visible clock overlay. Use the clock value as the reference marker for each observed state.

At 23:13:09, the main editor is open on the page titled "This is not an auth library". The central note content is visible, but the right side of the browser window contains a very large empty region. The text column is much narrower than the available workspace. The app is not using available horizontal space effectively.

At 23:15:03, the browser window is narrower. In that state, the content column shrinks, the text wraps, and the app remains usable. This is the correct direction for narrow-window behavior. The layout should continue to shrink gracefully when space is limited.

At 23:16:04 and 23:17:20, the active editable block containing "What this thing is about?" shows the padding issue. The text sits too close to the block border in the active state. When more spacing is manually introduced, the block immediately becomes easier to read and edit.

At 23:19:07, a multiline paragraph is being edited. Arrow-key navigation inside the paragraph works like normal text editing. This behavior is correct and must be preserved.

At 23:20:05, 23:20:49, and 23:24:24, the caret is near or at the end of a note block. The intended behavior is that pressing ArrowDown at the lower boundary should move the user to the next block, or to the add-paragraph affordance if that is the next available target.

At 23:28:07, 23:29:17, 23:29:58, and 23:30:39, the sidebar page list is the area of interest. The active page is highlighted, but the reorder controls are too visually persistent. Long page titles are clipped awkwardly when there is not enough width.

At 23:32:14, clicking New Page opens a browser prompt asking for a page title. This is unnecessary because the title is editable directly inside the page UI. At 23:33:14, the title-editing field is visible, which proves that page naming can happen inline after creation.

C01. Objective

The objective is to make the editor feel like one continuous writing environment while preserving the existing block-based structure.

The user should be able to write, move between blocks, create the next paragraph, rename pages, and scan the sidebar without unnecessary mouse use, awkward spacing, or browser-native interruptions.

The app should still look like the same app after the change. The visual language should remain plain and retro. The change should not introduce a modern component-library appearance, floating panels, animated overlays, or a redesigned information architecture.

D01. Non-goals

Do not redesign the application shell. Do not replace the sidebar. Do not replace the block editor with a different editor framework unless absolutely necessary. Do not add authentication, cloud sync, collaboration, rich formatting beyond the existing controls, or a new page-management modal.

Do not remove the existing local-save behavior. The "saved locally" behavior should continue to work as it does now.

Do not change ordinary text navigation inside multiline text blocks. Arrow keys must continue to behave like native text editing except at the specific block-boundary cases described later.

E01. Requirement: expand the main editor content area on wide screens

In the current wide-screen state, shown around 23:13:09, the editor content appears artificially constrained. The note text occupies only the left-to-middle portion of the workspace, while a large unused area remains to the right. This makes long notes wrap earlier than necessary and gives the impression that the app is wasting the user's available screen.

This should be fixed by making the main editor content width responsive. The editor should grow when the browser window is wide enough, but it should not become completely unbounded. The right side should still have breathing room. The content should not stretch edge-to-edge across an ultra-wide screen in a way that harms readability.

The desired behavior is a responsive content column. On wide screens, the note content should become visibly wider than it is now. On medium screens, it should still use most of the available space. On narrow screens, it should shrink in the same spirit as the 23:15:03 screenshot, where the text wraps and the interface remains usable.

This likely means that some wrapper currently has a fixed width, an overly small max-width, or a layout rule that prevents growth. The implementer should inspect the editor container, the note body wrapper, block wrappers, and any parent flex/grid columns. The fix may require setting the content area to use available width while applying a reasonable max width.

A practical implementation pattern is to allow the editor content to use `width: 100%` inside its available column and then apply a readable `max-width` only where needed. If the current UI has a fixed-width block list, replace that with a responsive rule. If there is a right margin, it should be intentional and proportional, not the accidental result of a narrow content column.

The editor toolbar should remain visually aligned with the editable blocks. If the content column expands, the toolbar and block controls should not remain stranded at the old width. The note title, toolbar, note blocks, source blocks, and add-paragraph affordance should feel like parts of the same column.

F01. Requirement: preserve narrow-screen behavior

The screenshot at 23:15:03 shows that when the browser window is narrow, the content column shrinks and the note remains readable. This behavior is acceptable and should not regress.

The responsive layout fix must be tested at a narrow viewport. The sidebar and editor should not overlap. The editor should not create horizontal page scrolling unless the viewport is extremely narrow and no reasonable layout can avoid it. Text blocks should wrap normally. The block controls should remain reachable.

If the page currently handles narrow windows with a simple fixed sidebar plus shrinking editor area, that general behavior can remain. The important part is that expanding the editor on wide screens must not break the existing shrink behavior.

G01. Requirement: increase padding inside active editing blocks

The active editable block has insufficient padding. In the 23:16:04 screenshot, the text "What this thing is about?" is pressed too close to the active block border. It looks like the caret and text are almost touching the edge of the editable area.

This is a small visual issue, but it matters because the app is a writing tool. The active block is where the user spends most of their time. If the active block looks cramped, the editor feels less comfortable and less intentional.

Increase the internal padding for active editable blocks. The most important side is the left padding, because that is where the text starts. Vertical padding should also be checked. The intended amount is modest: roughly one to one and a half additional character spaces compared with the current active state. In CSS terms, this may be around 6px to 10px total left padding, depending on the existing scale.

This should apply consistently to editable text blocks that share the same editing surface. Paragraphs, headings, and similar blocks should not each have unrelated active padding. If source/code/table controls have different editing surfaces, use judgment, but the basic rule remains: active text should not touch the active border.

The inactive display state should still look aligned with the rest of the note. Avoid a large jump when entering edit mode. Some small change is acceptable because active editing has a visible border, but the block should not jump so much that it feels unstable.

H01. Requirement: preserve native caret movement inside a multiline block

The multiline block shown at 23:19:07 behaves correctly while the caret is inside the block. ArrowUp moves to the previous visual line. ArrowDown moves to the next visual line. ArrowLeft and ArrowRight move through characters. This is normal text editing behavior and should be preserved.

The implementer must not intercept ArrowUp or ArrowDown in a simplistic global way. The app should not move to the previous or next block merely because the user pressed ArrowUp or ArrowDown while editing a multiline paragraph. That would break basic text editing.

The correct behavior is conditional. Only when the caret is already at the top boundary of the block should ArrowUp attempt to move to the previous block. Only when the caret is already at the bottom boundary of the block should ArrowDown attempt to move to the next block.

This distinction is important. In a multiline block, the first press of ArrowDown from the middle of the text should move to the next text line, not to the next block. The block-level navigation should only happen when the native text editor has no lower line to move into.

I01. Requirement: implement block-to-block keyboard navigation

The editor should support keyboard movement between blocks. The application already presents note content as separate blocks, but the user expects the experience to behave like a continuous document. A writer should not need the mouse every time they want to move from one block to the next.

When the caret is at the lower boundary of the current block and the user presses ArrowDown, focus should move to the next block below. If the next block is an editable text block, the app should focus that block. A simple and acceptable placement is to put the caret at the beginning of the next block. A more refined placement would preserve the approximate horizontal caret position, but that is not required for this change.

When the caret is at the upper boundary of the current block and the user presses ArrowUp, focus should move to the previous block above. If the previous block is editable, the app should focus it. A simple and acceptable placement is to put the caret at the end of the previous block.

When the current block is the first editable block and the caret is at the upper boundary, ArrowUp should do nothing. The focus should remain stable. The page should not jump unexpectedly. The app should not lose editing focus.

When the current block is the last populated block and the user presses ArrowDown at the lower boundary, the next target is usually the "+ Add paragraph" affordance. In that case, ArrowDown should activate that affordance and create a new paragraph block. The user should be placed into the new paragraph so they can continue typing immediately.

J01. Requirement: define boundary detection carefully

The hardest part of the keyboard navigation change is boundary detection. The implementation should not rely only on whether the caret is at character index zero or character index text length, because visual-line movement matters. In a wrapped paragraph, the caret may be at the end of a visual line but not at the end of the block. Pressing ArrowDown there should normally move to the next visual line inside the same block.

The implementation should detect whether native movement is possible before switching blocks. There are multiple valid implementation strategies depending on how the editor is built.

If the blocks use `textarea`, the implementation can compare caret coordinates or use line/selection measurements to determine whether the caret is on the first or last visual line. If the blocks use `contenteditable`, the implementation can use `Selection` and `Range` APIs to measure caret position relative to the editable element. A simpler fallback may be acceptable if the app already treats blocks as plain text and has reliable line information.

The required user-facing result is this: ArrowUp and ArrowDown should behave natively inside the block until there is no further visual line in that direction. Only then should the app move between blocks.

K01. Requirement: prevent repeated empty paragraph creation

There is a specific failure mode that must be prevented. If pressing ArrowDown from the last block creates a new empty paragraph, continued ArrowDown key repeat must not create an unlimited number of empty paragraphs.

This can happen if the app treats the bottom "+ Add paragraph" affordance as always available and repeatedly activates it while the user is still holding the key or pressing down multiple times. That would fill the note with blank blocks and make the keyboard navigation dangerous.

The required behavior is controlled creation. When ArrowDown activates "+ Add paragraph", the app may create one new empty paragraph and focus it. After that, as long as the newly created paragraph remains empty, additional ArrowDown presses should not create more paragraphs. The editor should effectively stop at that empty paragraph.

Once the user types, pastes, or otherwise inserts content into that paragraph, the paragraph is no longer empty. At that point, ArrowDown at its lower boundary may again move to "+ Add paragraph" and create the next paragraph.

The implementation can track this as a state flag, for example "empty block created by keyboard navigation". The flag should be cleared as soon as the block receives non-whitespace content. If the user deletes the content and the block becomes empty again, use judgment, but the safest behavior is still to avoid repeated empty paragraph creation while the current final block is empty.

L01. Requirement: do not show reorder controls permanently on the active sidebar page

The sidebar page list currently shows reorder controls too aggressively. At 23:29:17, the active page shows Up and Down controls even when the user is not actively trying to reorder. This creates clutter and makes the active row look busier than necessary.

The active page should be indicated by the active selection highlight only. The highlight is enough. The reorder controls should not be permanently visible merely because a row is active.

The better behavior is the hover behavior shown around 23:29:58. When the pointer is over a page row, controls can appear for that row. This keeps the list cleaner while preserving access to reordering.

For keyboard accessibility, the controls should also be available when the row or its controls have keyboard focus. Do not implement a hover-only solution that makes reordering impossible for keyboard users.

The controls should remain visually consistent with the retro style. Small bordered buttons are acceptable. Do not replace them with modern icon-only floating controls unless the rest of the app already uses that pattern.

M01. Requirement: handle long sidebar page titles intentionally

Long page titles are currently clipped in an awkward way, especially when the sidebar width changes. At 23:30:39, the title appears cut off by a strange empty region where controls or reserved space interfere with the text.

The row should use a predictable layout. The title should occupy the available title area. When there is not enough room, it should truncate with an ellipsis instead of being cut abruptly.

The expected CSS behavior is a single-line title with `white-space: nowrap`, `overflow: hidden`, and `text-overflow: ellipsis`. If the row uses flex layout, the title element must also have `min-width: 0`; otherwise ellipsis may not work correctly.

When controls are hidden, the title should be allowed to use the full row width. When controls appear on hover or focus, the title should shrink to make room for them and ellipsize if needed. This avoids unexplained blank gaps.

The full title should be recoverable. The simplest acceptable option is to set the row or title text `title` attribute to the full page title so the browser tooltip shows it on hover. This fits the plain UI style and does not require a new component.

N01. Requirement: remove the browser prompt from New Page

Clicking New Page currently opens a browser-native prompt, shown at 23:32:14. This interrupts the flow and is unnecessary. The app already has an inline editable page title field, shown at 23:33:14.

The New Page button should create a new page immediately. The default title should be "New research page". If a page with that title already exists, generate a unique title by appending a number, such as "New research page 2", "New research page 3", and so on.

After creation, the new page should become the active page. The title field should be focused and preferably selected so the user can immediately rename it. If selecting the title text is difficult, focusing the title field is still required if feasible. If focus cannot be moved because of current architecture constraints, the new page must at minimum become active and display the editable title in the normal location.

This change removes a redundant prompt and uses the app's own editing model instead.

O01. Requirement: preserve local persistence

The bottom status shows "saved locally". The requested changes must not break local persistence.

Creating a page, renaming a page, editing blocks, adding a paragraph through keyboard navigation, and reordering pages should still save locally under the current persistence model.

This matters especially for the New Page change. Removing the prompt should not change the data schema or produce incomplete page records. A new page created with the default title should be saved exactly like a page created through the old prompt flow.

P01. Detailed implementation to-do list

Update the main editor layout so the content column can expand on wide screens. Inspect the shell layout, sidebar/editor split, editor wrapper, note body wrapper, block list wrapper, toolbar wrapper, and individual block width rules. Remove or relax fixed widths that keep the editor narrow. Apply a reasonable maximum width if needed for readability. Ensure the toolbar, note title, note blocks, source block, and add-paragraph affordance align as one content column.

Verify the wide-screen layout against the 23:13:09 state. The right side should no longer contain a large accidental empty region. The editor should visibly use more of the available browser width. The right margin should still exist, but it should look intentional.

Verify the narrow-screen layout against the 23:15:03 state. The editor should shrink and wrap text without horizontal overflow. The sidebar and editor should not overlap. The controls should remain reachable.

Increase active editable block padding. Find the CSS class or component state used when a block is actively edited. Add enough left padding to prevent text from touching the border. Check top and bottom padding as well. Apply consistently across relevant text block types.

Verify active block padding using the "What this thing is about?" block. The text should have visible breathing room from the left border. The active state should still look compact and retro. Entering and leaving edit mode should not cause a distracting layout jump.

Audit keyboard handling inside editable blocks. Identify where ArrowUp and ArrowDown are currently handled. Ensure native caret movement remains the default behavior inside multiline content. Do not move focus between blocks unless the caret is at the relevant top or bottom boundary.

Implement lower-boundary ArrowDown navigation. When the caret is at the bottom of a block and the user presses ArrowDown, move focus to the next editable block. If the next target is "+ Add paragraph", create a new paragraph and focus it.

Implement upper-boundary ArrowUp navigation. When the caret is at the top of a block and the user presses ArrowUp, move focus to the previous editable block. If there is no previous block, keep focus in the current block and do nothing.

Add protection against repeated empty paragraph creation. If ArrowDown creates a new empty paragraph from the add-paragraph affordance, block additional ArrowDown-created paragraphs while the current new paragraph remains empty. Clear the guard once the user types or pastes non-whitespace content.

Verify multiline navigation using a paragraph like the one shown at 23:19:07. ArrowUp and ArrowDown should move through visual lines inside the paragraph. They should not jump blocks until the caret is at the first or last visual line.

Verify block-boundary navigation at the end of a paragraph. Put the caret at the end of the final populated paragraph and press ArrowDown. The app should create or focus the next paragraph target. The user should be able to continue typing without touching the mouse.

Verify repeated ArrowDown safety. Hold ArrowDown at the bottom of the last populated block. The app should create at most one empty paragraph. It should not create a stack of blank paragraphs. After typing text into that paragraph, pressing ArrowDown at its end should be allowed to create the next paragraph.

Update sidebar row control visibility. Remove the behavior that permanently displays reorder buttons on the active page. Keep active-page highlighting. Show reorder controls only when the row is hovered or keyboard-focused.

Verify sidebar active-row behavior. Select a page and move the pointer away from the row. The row should remain highlighted, but the Up and Down controls should not remain visible solely because it is active.

Verify sidebar hover behavior. Hover over a non-active page row. Reorder controls should appear for that row. Move the pointer away. The controls should disappear. The page title should remain readable and the row height should not jump unexpectedly.

Verify sidebar keyboard accessibility. Use keyboard focus to reach a page row or its controls. Reorder controls should be usable without a mouse. The focus state should be visible enough to understand which row is being acted on.

Update long-title handling in the sidebar. Place the page title in a flex child that can shrink. Add `min-width: 0` if flex is used. Apply single-line ellipsis behavior. Ensure controls have a predictable width only when visible.

Verify long-title truncation using a title like "2026-04-26 New research page werewrew werew". In a narrow sidebar, the title should truncate with an ellipsis. It should not be cut abruptly by a blank region. When controls appear, the title should shrink cleanly.

Add a tooltip or equivalent full-title recovery for truncated sidebar titles. The simplest implementation is a `title` attribute containing the full page title.

Remove the browser prompt from the New Page flow. Replace it with immediate page creation. Generate the default title "New research page". If that title exists, generate the next numbered title.

After creating a new page, set it as active. Focus the inline page title field if possible. Prefer selecting the title text so the user can immediately type a replacement.

Verify New Page behavior. Click New Page. No browser prompt should appear. A new page should appear in the sidebar. It should become active. The main editor should show the new page. The title should be editable inline.

Verify duplicate default title behavior. Create multiple new pages without renaming them. The app should generate unique names rather than creating indistinguishable duplicate titles.

Verify local persistence. Create a new page, rename it, add text through keyboard-created paragraphs, reorder a page, then refresh the browser. The expected data should remain saved locally.

Q01. Acceptance verification matrix

Wide editor layout verification: open the app in a wide browser window similar to 23:13:09. The note content should expand wider than before. The right side should no longer look like unused accidental whitespace. The editor should still have a readable maximum width. The toolbar and blocks should align. No horizontal scrolling should appear.

Narrow editor layout verification: resize the browser to a narrow width similar to 23:15:03. The content should shrink and wrap. The sidebar should remain visible according to the current app design. The editor should not overflow behind the sidebar. Text editing should remain usable.

Active block padding verification: activate the block containing "What this thing is about?". The text should no longer sit tight against the active border. The caret should have visual room. The change should apply to other normal editable text blocks. The block should still look like part of the existing retro UI.

Native multiline navigation verification: edit a long paragraph that wraps across multiple visual lines. Press ArrowUp and ArrowDown from the middle of the paragraph. The caret should move line by line inside the paragraph. It should not jump to another block. Left and Right arrows should remain character-level movement.

Downward block navigation verification: place the caret at the end of the final populated paragraph. Press ArrowDown once. The app should move to the next block or create a new paragraph through the add-paragraph affordance. Focus should land where the user can type immediately.

Upward block navigation verification: place the caret at the beginning of a block that has another block above it. Press ArrowUp. Focus should move to the previous block. Place the caret at the beginning of the first block and press ArrowUp. Nothing disruptive should happen.

Repeated empty paragraph verification: place the caret at the end of the last populated block and hold ArrowDown. The app should create no more than one empty paragraph. It should not generate repeated blank blocks. Type text into the new paragraph, then press ArrowDown at its end. Creation of the next paragraph should work again.

Sidebar active-row verification: select a page. Move the mouse away from the sidebar. The active row should remain highlighted, but Up and Down controls should not remain visible just because the row is active.

Sidebar hover verification: hover over a page row. Up and Down controls should appear for the hovered row. Move away. They should disappear. The row should not visually jump or change height.

Sidebar long-title verification: use a long page title and a narrow sidebar. The title should truncate with an ellipsis. It should not be abruptly cut off by an unexplained blank area. The full title should be available through a tooltip or equivalent simple mechanism.

New Page verification: click New Page. No browser prompt should appear. A page should be created immediately. The page should become active. The title should default to "New research page" or a numbered unique variant. The inline title field should be ready for editing if possible.

Persistence verification: after performing the above edits, refresh the page. The new page, renamed title, paragraph content, and page order should persist according to the existing local-save behavior.
