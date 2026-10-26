# Guided

A little structure for your thoughts. Guided is a private, static writing
workspace: choose a template, fill its highlighted fields in any order, and copy
or download the finished text. Documents and template-authoring drafts stay in
your browser. There is no backend, account, AI service, or telemetry.

## Run

Install [Bun](https://bun.sh), then run:

```powershell
bun install --frozen-lockfile
bun run dev
```

Open **http://localhost:4173**. The development command builds first; rerun it
after source changes. `bun run preview` serves an existing build. `PORT` can
override the local server port.

```powershell
bun run typecheck
bun test
bun run build
bunx playwright install chromium
bun run test:browser
```

Browser tests can use an already installed Chromium:

```powershell
$env:PLAYWRIGHT_CHROMIUM_EXECUTABLE = 'C:\path\to\chrome.exe'
bun run test:browser
```

The same non-clipboard workflows can run in Firefox and WebKit:

```powershell
bunx playwright install firefox webkit
$env:PLAYWRIGHT_BROWSER = 'firefox' # Or 'webkit'
bun run test:browser --grep-invert 'complete, save|denied clipboard'
Remove-Item Env:PLAYWRIGHT_BROWSER
```

The full clipboard permission/readback workflow uses Chromium-specific automation.

`bun run check` runs the complete release checks. TypeScript **7.0.2**,
Playwright, and Bun types are development dependencies only. The deployed
application uses the vendored Dexie and microlight distributions.

## Writing

Select a field in the document to open its question, hint, examples, and answer
control. The prose around the fields stays fixed. Use the arrow keys to move
between single-line fields; multiline fields retain ordinary up/down behavior.
Tab never traps focus. Missing required answers disable result copying/export.

Changing writing styles creates independent related documents; returning to a
style restores its answers. **New Document** starts an unrelated instance.
Selecting or inspecting a template does not save an empty document. Meaningful
answers or a custom title make a document save-worthy. Autosave defaults to
60 seconds and also runs on navigation and when the page becomes hidden.

Copy plain or semantic rich text; download `.txt`, escaped Markdown, or semantic
HTML. **Template Authoring** edits GTL separately, with syntax highlighting,
live diagnostics, preview, independently saved drafts, and `.gtl` downloads.
Invalid source remains downloadable and saveable.

## Persistence and recovery

IndexedDB through a dedicated worker is the default. Settings also offer
localStorage for smaller collections and memory-only mode. Preferences use a
separate localStorage record regardless of document storage mode.

Changing stores does **not** migrate or delete records. Open work from a different
store remains visible but read-only until you switch back; its edits are retained
in this tab. A write already started before a mode change may still finish in
its original store. Memory-only document/source data disappears on reload.

Each document has one current record, an embedded template snapshot, and an
optimistic revision counter. Competing saves cannot silently overwrite one
another. A conflict offers **Reopen latest** or **Preserve local copy**; no
automatic merge occurs. Failed saves retain in-memory text, show retry actions,
and permit a recovery JSON download even for incomplete documents. Recovery
files preserve the full working record for manual recovery; they are not a
second result format or an automatic-import workflow.

Browser storage is not a backup. Export important work. Unsaved edits can be lost
on crashes, forced shutdowns, or browser storage clearing. Hidden/page-close
flushes are best effort, not a durability guarantee. No revision history or
recycle bin is maintained.

## Deploy

Run `bun run build` and upload the **contents of `dist`** to any static HTTPS
host. No build tools or npm installation are needed at runtime. HTTP localhost
also works for development. Keep the directory structure intact and serve `.js`
as JavaScript; do not rewrite worker or template requests to `index.html`.

All asset URLs are relative. Root and subdirectory hosting are covered by browser
tests (`/editor/` on the local server). Open through a web server, not `file://`.
Clipboard and safe localStorage writes require a secure browser context.

Supported baseline: current desktop Chromium, Firefox, and Safari with module
workers and IndexedDB. Rich clipboard depends on browser permissions/support;
plain copying and file exports remain separate. The localStorage adapter requires
Web Locks and refuses unsafe writes when they are unavailable. Responsive
Chromium browser tests exercise narrow viewports and viewport resizing; they do
not substitute for physical-device virtual-keyboard testing.

## Project map

| Path                              | Responsibility                                                  |
| --------------------------------- | --------------------------------------------------------------- |
| `src/features/templates`          | Pure GTL parser/renderer, manifest loading, guidance            |
| `src/features/documents`          | Working state, version isolation, autosave, navigation          |
| `src/features/template-authoring` | Source drafts, highlighting, live preview                       |
| `src/features/settings`           | Declarative schema, preferences, cross-tab updates              |
| `src/features/export`             | Safe text/Markdown/HTML and clipboard operations                |
| `src/platform`                    | Storage adapters, worker messaging, diagnostics, DOM helpers    |
| `src/worker/main.ts`              | Small feature-handler composition root                          |
| `templates`                       | Bundled GTL definitions and explicit stable-ID manifest         |
| `tests`                           | Bun domain/worker tests and actual Playwright browser workflows |

See [Architecture](docs/architecture.md), [GTL language](docs/gtl.md), and
[Third-party notices](THIRD-PARTY-NOTICES.md). The immutable `.specs` documents
remain authoritative. Their TODO companions record the initial implementation
plan without rewriting the source specifications.
