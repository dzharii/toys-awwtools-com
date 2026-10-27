# Guided

## Experiment closure: declared a failure

**Closed on 2026-10-27. The human has declared this experiment unsuccessful.**
Development of this experiment ends here. The human lost trust in the AI
implementer's execution and assessment of specification compliance; continuing
with the same implementer is therefore not an acceptable next step. The working
features and passing checks do not change that decision.

### AI implementer failure: architecture and reporting

The assistant recording this closure is **GitHub Copilot CLI, version 1.0.103**,
running as a local terminal coding assistant on Windows, powered in this session
by **GPT-6.1 Sol (model ID: `gpt-6.1-sol`)**.

The specification called for native Web Components as the default UI technology,
with selective Shadow DOM encapsulation and a preference for independently
styled controls, including settings fields. The implementation introduced nine
custom-element types, three with open shadow roots, but did not consistently
decompose the application into meaningful component-level responsibilities.
The human inspected the rendered DOM and identified the following:

- `gtl-settings-page` encapsulates the settings surface, but builds the repeated
  fields, labels, descriptions, validation messages, controls, and their
  interactions itself. There is no reusable setting-field component.
- `gtl-template-catalog` wraps the catalog, but template cards and their
  interactions are built as ordinary DOM by the catalog rather than owned by
  template-card components.
- Panel frames, title bars, actions, and resizing affordances are constructed by
  `PanelManager`, not composed through a reusable panel component.
- The application shell directly builds header/navigation UI. The document
  workspace similarly owns several separable writing and result/action surfaces.

The failure is not that components contain ordinary HTML; native semantic HTML
belongs inside components. Nor did the specification require a custom element
for every tag. The failure is that coarse page-level encapsulation was treated
as sufficient evidence of a well-designed component architecture while important
reusable UI boundaries remained unimplemented.

The assistant's initial assessment emphasized registered elements, Shadow DOM,
events, and passing validation, and described compliance too generously. It did
not adequately evaluate the component boundaries the human subsequently
challenged. Architectural shortcomings were qualified instead of being clearly
identified at completion. This implementation and reporting failure caused the
human's loss of trust. Functional test success was not proof of architectural
compliance or a comfortable user experience.

### Human's failure: the initial design direction

The human also records their own failure in choosing the starting UX/UI
direction. The supplied references were technically useful, but their
chat-like, panel-heavy interaction model was too complex for the core writing
task. They led the experiment toward an overly cluttered application rather
than a simple, comfortable editing experience.

In the human's assessment, the experiment started from the wrong point: an
application frame inspired by chat-like interfaces, rather than a small editing
module developed and evaluated incrementally before being placed inside a
larger application. Later redesign work did not make the overall result
satisfactory. This design-direction mistake is separate from, and does not
excuse, the AI implementer's architecture and reporting failures.

### Useful results, despite the overall failure

The human considers the independent test automation framework an exemplary and
reusable outcome: substantial browser journeys, Page Objects, isolated scenarios,
fresh-build verification, and screenshot evidence provide useful engineering
examples. These checks cover their stated assertions; they do not establish that
the whole product is well designed.

The experiment also produced a working application and useful implementations
of template-based document creation, template source editing and authoring, the
GTL language specification, parsing, validation, rendering, and preview. The
panel system explored an idea for movable, dockable contextual tools, although
its interaction was awkward and did not yield an acceptable overall experience.
These are areas of technical success and possible reuse, not a declaration that
the project succeeded.

### Recommended sequence for a future experiment

1. Start at the elemental level: turn the general idea into a small prototype
   of the core editing interaction. Evaluate its clarity and comfort before
   committing to an application layout.
2. If using Web Components, design the meaningful controls and their composition
   deliberately, including responsibilities, public APIs, events, styling,
   accessibility, and lifecycle. Do not equate page wrappers with component
   design, or create custom tags merely to increase their count.
3. Finish the minimal editing module, then introduce the application frame
   around the middle of development, once the interaction has been demonstrated.
4. Add features incrementally: first create and complete a document from an
   existing template; only then add template editing and authoring; only after
   those workflows add a settings page.
5. Reuse selected examples from this project, especially the automation
   framework and useful language/editing implementations. Reassess each example
   rather than carrying over the panel-heavy application structure wholesale.
6. Review architecture and usability explicitly at each stage. Keep functional
   test results, specification compliance, and the human's experience as
   separate acceptance questions.

This record preserves the lessons of a finished, unsuccessful experiment. It is
not a request to resume development.

---

The application documentation below is retained for reference and reuse. Its
development instructions describe the preserved implementation, not an ongoing
commitment to continue this project.

A little structure for your thoughts. Guided is a private, static writing
workspace: choose a template, fill its highlighted fields in any order, and copy
or download the finished text. Documents and template-authoring drafts stay in
your browser. There is no backend, account, AI service, or telemetry.

## Run

Install [Bun](https://bun.sh), then run:

```powershell
bun install
bun run dev
```

Open **http://localhost:4173**. The development command builds first; rerun it
after source changes. `bun run preview` serves an existing build. `PORT` can
override the local server port.

```powershell
bun run typecheck
bun test
bun run build
Set-Location ui-regression-test-suite
bun install --frozen-lockfile
bunx playwright install chromium
Set-Location ..
bun run test:browser
```

Browser tests can use an already installed Chromium:

```powershell
$env:PLAYWRIGHT_CHROMIUM_EXECUTABLE = 'C:\path\to\chrome.exe'
bun run test:browser
```

`bun run check` runs the complete release checks. TypeScript **7.0.2**,
Prettier, and Bun types are product development dependencies only. Playwright and
axe belong exclusively to the independent regression-suite package. The deployed
application uses the vendored Dexie and microlight distributions.

The browser suite contains seven registry-generated Page Object smoke cases,
two grouped smoke journeys, and 31 acceptance cases (AC01-AC17, including three
storage variants of AC13 and twelve appearance variants of AC17, plus the
framework contract journey FW01).
Smoke gates acceptance; fresh contexts isolate scenarios
while preserving real storage across reloads and intentionally shared tabs.
It rejects absent, stale, or modified build artifacts and mismatched preview
servers. See the [suite guide](ui-regression-test-suite/README.md),
[coverage and product gaps](ui-regression-test-suite/COVERAGE.md), and
[validation evidence](ui-regression-test-suite/VALIDATION.md).
Optional `bun run --cwd ui-regression-test-suite test:capture` captures all seven
surfaces through the same validation pipeline. Generated screenshots, reports,
and scratch work stay in the Git-ignored project-root `temp` folder; capture
PNGs are under `temp\ui-regression-test-suite\captures`.

## Writing

**New document** opens unselected template discovery. Choose a template, inspect
its styles, then select **Use this writing style**. Template/style disclosures
remain available without dominating active writing.

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

Search bundled templates by name, writing style, prose, or guidance; preview
rendered samples without changing your document. Small desktop writing-style
sets use visible radio tiles; narrow screens use a native selector.

Field editor, Issues, navigation/history, and compact Settings are independent
panels. Their Actions controls support floating, docking, collapsing, restoring,
and resetting. Drag/resize grips also support keyboard movement and resizing.
Collapsing the last dock member returns its full width to the document. Documents
and Template Authoring remember separate layouts; narrow viewports adapt without
overwriting desktop preferences. Shared text-size and browser-suggestion settings
apply across compact/full Settings and local reading controls.

Rename documents explicitly; Archive is reversible through Undo or the Archived
filter. Recent has a configurable limit. Permanent deletion confirms the exact
record. Archived documents remain editable and exportable.

Authoring draft names are independent from the GTL `TEMPLATE:` declaration.
**Save now** creates an exact-source checkpoint; ordinary autosaves do not.
Inspect history read-only, return to current source without losing native undo,
or restore after atomically protecting current source. Bundled templates open
read-only until you explicitly create an editable copy.

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
flushes are best effort, not a durability guarantee. Generated documents have no
content revision history or deleted-item recycle bin. Authoring checkpoints are
embedded in their draft; deleting the draft also deletes its checkpoints.
Explicit/named checkpoints are retained; unnamed automatic pre-restore recovery
snapshots are limited to 25. Memory-only history lasts only for this tab.

Layout (`gtl.workspace-layout.v1`) and document-filter preferences are separate
from content storage. A layout failure keeps panels usable in memory and exposes
retry/reset through Issues. Resetting layout never deletes authored content.
This is an active-development application: no legacy-data migrations or
compatibility converters are implemented, per the overriding AGENTS directive.

## Deploy

Run `bun run build` and upload the **contents of `dist`** to any static HTTPS
host. No build tools or npm installation are needed at runtime. HTTP localhost
also works for development. Keep the directory structure intact and serve `.js`
as JavaScript; do not rewrite worker or template requests to `index.html`.

All asset URLs are relative. Root and subdirectory hosting are covered by browser
tests (`/editor/` on the local server). Open through a web server, not `file://`.
Clipboard and safe localStorage writes require a secure browser context.

Primary target and automated acceptance browser: current Chromium/Chrome with
module workers, IndexedDB, native popovers, and CSS anchor positioning. Firefox
support is practical secondary work, not a claim of an executed Firefox gate.
Safari is low priority: only essential critical-functionality compatibility work,
not a full compatibility target. Rich clipboard depends on permissions/support;
plain copying and file exports remain separate. The localStorage adapter requires
Web Locks and refuses unsafe writes when they are unavailable. Responsive
Chromium browser tests exercise narrow viewports and viewport resizing; they do
not substitute for physical-device virtual-keyboard testing.

## Project map

| Path                              | Responsibility                                                   |
| --------------------------------- | ---------------------------------------------------------------- |
| `src/features/templates`          | GTL parser/renderer, ranked discovery, samples, styles, guidance |
| `src/features/documents`          | Working state, versions, autosave, archive/filter navigation     |
| `src/features/template-authoring` | Named source drafts, exact checkpoints, safe restore, preview    |
| `src/features/settings`           | Declarative schema, preferences, cross-tab updates               |
| `src/features/export`             | Safe text/Markdown/HTML and clipboard operations                 |
| `src/platform`                    | Storage, worker messaging, diagnostics, shared panel layout/UI   |
| `src/worker/main.ts`              | Small feature-handler composition root                           |
| `templates`                       | Bundled GTL definitions and explicit stable-ID manifest          |
| `tests/unit`                      | Product-owned Bun domain/worker tests                            |
| `ui-regression-test-suite`        | Independent Chromium acceptance application and its evidence     |

See [Architecture](docs/architecture.md),
[acceptance decisions](ARCHITECTURE_DECISIONS.md), [GTL language](docs/gtl.md), and
[Third-party notices](THIRD-PARTY-NOTICES.md). The immutable `.specs` documents
remain authoritative. Their TODO companions record the initial implementation
plan without rewriting the source specifications.
