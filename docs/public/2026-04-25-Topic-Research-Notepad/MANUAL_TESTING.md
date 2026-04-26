# Manual Testing

Serve this folder or run `bun run build` and serve `dist/`.

1. Open the app and confirm the retro-styled shell appears.
2. Drag the divider between Pages and the editor, reload, and confirm the sidebar width persists. Focus the divider and use arrow keys, Home, and End.
3. Confirm the browser page itself does not show a second competing vertical scrollbar in normal desktop layout.
4. Confirm the command bar reads as three groups: New Page/Undo, Search/Clear search, and Export/Backup.
5. Create a page named `Auth library comparison`.
6. Hover and focus page rows. Confirm page move buttons appear only with intent and the page title tooltip says `Open page: <title>`.
7. Type into the first paragraph contenteditable block, wait for `saved`, reload, and confirm the text persists.
8. Add paragraph, heading, quote, list, table, code, and source blocks. Edit each one and reload.
9. Confirm paragraphs and headings look like document content, with block labels hidden and move/delete controls in a top-right attached action tab.
10. Confirm block delete uses `DEL`, does not overlap text, and aligns with move controls.
11. Use the local `Turn into` menu on a paragraph near the bottom of a long page. Confirm conversion works without scrolling to the top toolbar.
12. Type `/quote` in an empty paragraph, use arrow keys/Escape/Enter in the slash menu, and confirm the selected block type appears.
13. Use `+ Add paragraph` at the bottom of the document and confirm the new paragraph receives focus.
14. Delete a block, then press `Undo` or Ctrl/Cmd+Z while focus is outside a text field. Confirm the block returns.
15. Move a block, then press `Undo` or Ctrl/Cmd+Z while focus is outside a text field. Confirm the previous order returns.
16. Confirm native text editing undo still works inside paragraph contenteditable fields.
17. Paste messy HTML containing headings, paragraphs, lists, a table, links, scripts, inline styles, and event handlers. Confirm the result is rendered as sanitized local content and no external styling appears.
18. Paste a normal inline link into a paragraph and confirm only a safe link is retained.
19. Search for text from a page title, a paragraph, a heading, a table cell, and a source note. Open a result.
20. Move pages and blocks with the up/down controls, reload, and confirm order persists.
21. Export Markdown for a page with every block type and inspect the file, including paragraph links or emphasis if present.
22. Export JSON backup and confirm it contains export metadata, pages, and blocks, but no pastebin or slash-menu state.
23. Use browser devtools to inspect IndexedDB. Confirm `pages` and `blocks` are separate stores and paragraph/heading blocks store sanitized `html` plus derived `text`.
24. Clear `TopicResearchNotepadDB`, reload, and confirm startup does not show `db.pages.where(...).equals(...).catch is not a function`.
25. Open the console and confirm startup logs include `App/Bootstrap`, `StorageClient/WorkerBridge`, `StorageWorker`, and `Persistence` entries.

Known browser-only behavior such as IndexedDB writes, Worker loading, and clipboard paste should be validated manually because Bun tests cover only pure logic.

Durable 15-snapshot page history is not implemented yet. Current recovery is in-memory structural undo for the active session.
