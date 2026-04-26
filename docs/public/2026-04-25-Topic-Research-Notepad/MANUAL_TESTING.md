# Manual Testing

Serve this folder or run `bun run build` and serve `dist/`.

1. Open the app and confirm the retro-styled shell appears.
2. Drag the divider between Pages and the editor, reload, and confirm the sidebar width persists. Focus the divider and use arrow keys, Home, and End.
3. Create a page named `Auth library comparison`.
4. Type into the first paragraph contenteditable block, wait for `saved`, reload, and confirm the text persists.
5. Add paragraph, heading, quote, list, table, code, and source blocks. Edit each one and reload.
6. Confirm paragraphs and headings look like document content, with block labels hidden and move/delete controls visible on hover or focus.
7. Type `/quote` in an empty paragraph, use arrow keys/Escape/Enter in the slash menu, and confirm the selected block type appears.
8. Paste messy HTML containing headings, paragraphs, lists, a table, links, scripts, inline styles, and event handlers. Confirm the result is rendered as sanitized local content and no external styling appears.
9. Paste a normal inline link into a paragraph and confirm only a safe link is retained.
10. Search for text from a page title, a paragraph, a heading, a table cell, and a source note. Open a result.
11. Move pages and blocks with the up/down controls, reload, and confirm order persists.
12. Export Markdown for a page with every block type and inspect the file, including paragraph links or emphasis if present.
13. Export JSON backup and confirm it contains export metadata, pages, and blocks, but no pastebin or slash-menu state.
14. Use browser devtools to inspect IndexedDB. Confirm `pages` and `blocks` are separate stores and paragraph/heading blocks store sanitized `html` plus derived `text`.
15. Clear `TopicResearchNotepadDB`, reload, and confirm startup does not show `db.pages.where(...).equals(...).catch is not a function`.
16. Open the console and confirm startup logs include `App/Bootstrap`, `StorageClient/WorkerBridge`, `StorageWorker`, and `Persistence` entries.

Known browser-only behavior such as IndexedDB writes, Worker loading, and clipboard paste should be validated manually because Bun tests cover only pure logic.
