# Topic Research Notepad

Topic Research Notepad is a local-first browser research pad for collecting source links, quotes, lists, tables, code snippets, and working notes while researching a topic.

## Highlights

- Static browser app with no server backend and no network dependency for core workflows.
- IndexedDB persistence through Dexie 4.2.0, owned by a browser Worker.
- Page and block records are stored separately so autosave writes target the edited record.
- Supported block types: paragraph, heading, quote, list, table, code, and source link.
- Pasted HTML is treated as untrusted and converted into internal blocks.
- Local search covers page titles and block text.
- Current page Markdown export and full workspace JSON backup are available.
- UI uses the bundled retro bookmarklet component library and compatible app CSS.

## Development

No NPM modules should be installed for this project. Runtime and build dependencies are the files already present in this folder.

```bash
bun test
bun run build
```

The build command writes a static app to `dist/`. The source `index.html` also runs directly when served by a static server from this folder.

## Storage

The database is `TopicResearchNotepadDB` version 1. Durable stores are `pages`, `blocks`, `searchIndex`, and `settings`. The search index is derived from page and block records and can be rebuilt.
