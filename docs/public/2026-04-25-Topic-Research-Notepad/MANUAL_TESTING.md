# Manual Testing

Serve this folder or run `bun run build` and serve `dist/`.

1. Open the app and confirm the retro-styled shell appears.
2. Create a page named `Auth library comparison`.
3. Type into the first paragraph block, wait for `saved`, reload, and confirm the text persists.
4. Add paragraph, heading, quote, list, table, code, and source blocks. Edit each one and reload.
5. Paste messy HTML containing headings, paragraphs, lists, a table, links, scripts, inline styles, and event handlers. Confirm the result is rendered as local blocks and no external styling appears.
6. Search for text from a page title, a paragraph, a table cell, and a source note. Open a result.
7. Move pages and blocks with the up/down controls, reload, and confirm order persists.
8. Export Markdown for a page with every block type and inspect the file.
9. Export JSON backup and confirm it contains export metadata, pages, and blocks.
10. Use browser devtools to inspect IndexedDB. Confirm `pages` and `blocks` are separate stores.
11. Clear `TopicResearchNotepadDB`, reload, and confirm startup does not show `db.pages.where(...).equals(...).catch is not a function`.
12. Open the console and confirm startup logs include `App/Bootstrap`, `StorageClient/WorkerBridge`, `StorageWorker`, and `Persistence` entries.

Known browser-only behavior such as IndexedDB writes, Worker loading, and clipboard paste should be validated manually because Bun tests cover only pure logic.
