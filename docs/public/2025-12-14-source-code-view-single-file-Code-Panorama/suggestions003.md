# Fixes and suggestions iteration 3
2025-12-14
Codex CLI 5.1 High

A00 Save as bundled HTML (single file snapshot) (rev 03)

This feature adds a new output format for the viewer: one self-contained HTML file that includes the loaded project content, the UI, and the runtime logic. The user can open that HTML later on any machine and get the same viewer experience without granting folder access again.

This is a snapshot feature. It does not replace normal loading. It adds a second way to open a project: live from filesystem, or replayed from an embedded snapshot.

B00 Why this exists and how users use it (rev 00)

Problem
The current viewer depends on folder access. This is fine when you are at your dev machine, but it blocks quick sharing, archiving, and offline viewing.

Goal
Let the user freeze the current loaded project into a single file. That file can be stored, attached, moved, and opened later. No folder picker. No file picker. No network.

User flow
User loads a project as usual. The tree grows as files stream in. The user navigates, checks stats, and confirms the project is the one they want. The user clicks "Save as HTML". The browser downloads one HTML file. Later, the user opens that file locally. The app starts immediately and replays the load so the tree and files appear progressively, then the viewer behaves like normal: anchors work, the active file and line indicator works, stats work, and panels work.

Benefit
Fast reopen. Easy archive. Easy share. No permissions prompts. Same UI. Same navigation.

C00 Rules: keep the current live load unchanged (rev 00)

The existing live pipeline is correct and must stay intact:

* Directory load uses traverseDirectory -> processFileEntry -> readAndStoreFile.
* File picker load uses loadFromFileList -> readAndStoreFile.
* Rendering is incremental: renderFileSection and insertIntoTree run per file.
* Responsiveness is maintained with maybeYield.
* Navigation uses anchors: tree items are a href="#fileId" and file sections use id=fileId.

This feature must reuse that pipeline. It must not add a second renderer. It must not add search.

D00 UI changes (rev 00)

Add one new button in the control bar actions:

* Label: "Save as HTML"
* id: save-html

Enablement

* Enabled when state.aggregate.loadedFiles > 0 and state.phase is loaded or cancelled.
* Disabled when state.phase is empty or loading.

Snapshot mode UI
When the user opens an exported snapshot:

* Hide or disable "Open folder" and "Use file picker".
* Keep "Save as HTML", "Stats", and "Log".
* The empty overlay must never be shown in snapshot mode.

E00 Output format (what we save) (rev 00)

The download is one HTML file with:

* Inline CSS, taken from styles.css.
* Inline JS runtime, based on app.js plus snapshot boot logic.
* A snapshot payload embedded in the HTML.

The payload is not a DOM dump. It is data that the app replays through the same incremental ingest path. This keeps behavior stable and keeps features working because event listeners and state logic are applied at runtime.

Payload schema (JSON)
snapshot = {
schemaVersion: 1,
exportedAt: "ISO string",
settings: {
ignores: string[],
allow: string[],
includeJson: boolean,
maxFileSize: number,
memoryWarnBytes: number,
wrap: boolean,
showStats: boolean
},
ui: {
sidebarPinned: boolean,
sidebarWidth: number
},
files: [
{ path: string, size: number, modified: number|null, text: string }
]
}

Notes

* Do not store file ids in the snapshot. ids must be regenerated from path using the existing makeFileId so anchors remain consistent.
* Do not store derived stats unless you want to. The current code already computes language, lineCount, charCount from text and extension.

F00 Export behavior (how we build the HTML) (rev 00)

F01 Snapshot capture
When the user clicks "Save as HTML":

* Read current state.settings.
* Read current state.sidebar.pinned and state.sidebar.width.
* Copy state.files into snapshot.files using:

  * path from record.path
  * size from record.size
  * modified as ms since epoch or null
  * text from record.text

F02 Asset inlining
The exported file must not depend on styles.css or app.js at runtime.
At export time:

* cssText = fetch("styles.css").text()
* jsText = fetch("app.js").text()

If either fetch fails:

* Show a banner "Export failed: cannot read assets."
* Add a log entry with the error message.
* Do not download a broken file.

Important constraint
If the live app itself is opened as file://, fetch of local assets may fail in some browsers. In that case export may not work unless you later change the normal app to inline its own assets. For now, the accepted baseline is: export is guaranteed when the app is served from http(s), including a local dev server.

F03 HTML generation
Create a full HTML document string:

* Head includes meta charset, viewport, title.
* A style tag includes cssText.
* Body includes the same base structure as index.html:

  * topbar
  * control bar
  * empty panel markup
  * sidebar markup
  * main pane
  * settings, stats, support, log panels
* Include: <script id="cp-snapshot" type="application/json">snapshotJson</script>
* Include one script tag containing jsText.

F04 Download

* Create Blob(text/html).
* Create object URL.
* Trigger download with an anchor download attribute.
* Revoke URL after click.

F05 Size warning
Before download, estimate export size:

* snapshotJson length + cssText length + jsText length
  If above a threshold, show a warning banner and require a second click to confirm. Keep the warning short and direct.

G00 Snapshot boot and replay (how the saved file loads) (rev 00)

Goal
The snapshot must preserve the current streaming feel. The tree must grow. File sections must appear incrementally. The app must stay responsive.

G01 Detect snapshot mode
On DOMContentLoaded in init():

* Look for script#cp-snapshot.
* If present:

  * Parse JSON.
  * Set state.mode = "snapshot" (new state field).
  * Start snapshot load instead of showing empty state.

If not present:

* Run current init behavior (live mode).

G02 Reuse the existing per-file render path
The current code has one good place where the full file record is created and inserted: readAndStoreFile after text is obtained. Snapshot load needs to feed text directly into that same code.

Change required in app.js
Refactor readAndStoreFile into two steps:

Step 1: read text

* Keep current file.text() call for live mode.

Step 2: store and render record

* Move everything from "const charCount = text.length" down to "state.progress.phaseLabel = 'Scanning'" into a new function:

  * storeTextAsFileRecord({ path, size, modified, text, extHint })
* Make readAndStoreFile call storeTextAsFileRecord with:

  * path
  * size
  * modified
  * text
  * extHint

Snapshot replay will call storeTextAsFileRecord directly.

This is the key reuse point. It keeps record creation, stats updates, largest files, renderFileSection, insertIntoTree, observer attach, and memory warnings in one place.

G03 Replay loop
Implement loadFromSnapshot(snapshot):

* resetStateForLoad()
* state.phase = "loading"
* state.progress.phaseLabel = "Replaying"
* updateEmptyOverlay() so the empty card is hidden
* updateSidebarVisibility() so the sidebar is visible
* updateControlBar()

Then, for each snapshot.files item:

* If state.cancelled is true, break.
* Validate item.path and item.text exist.
* Call storeTextAsFileRecord with:

  * path
  * size (use item.size if present, else use item.text.length)
  * modified (convert ms to Date or pass null; match the existing record format)
  * text
  * extHint derived from path extension
* Await maybeYield to keep UI responsive.

Finally call finishLoad().

G04 Cancel during replay
Cancel already sets state.cancelled and shows "Cancelling...". The replay loop must check state.cancelled between files and stop quickly. finishLoad already supports cancelled state.

G05 Hash navigation during replay
The current renderFileSection already checks if location.hash matches the file id and scrolls into view. Keep that logic. It means an exported file can be opened with a hash and will jump once that file is rendered.

H00 Snapshot mode UI rules (rev 00)

H01 Disable filesystem controls
When state.mode is snapshot:

* open-folder is disabled or hidden.
* fallback-picker is disabled or hidden.
* empty panel is hidden because state.phase will not remain empty.

H02 Controls that remain

* Save as HTML stays enabled when files exist.
* Stats stays enabled when loadedFiles > 0.
* Log stays enabled when logs exist.

H03 Settings behavior
Snapshot should carry the settings stored inside the snapshot payload for rendering. Editing settings in snapshot mode is allowed only if it does not imply reloading from filesystem. The simplest rule:

* Allow wrap toggle and showStats toggle to work (pure display).
* For filters (ignore and allow lists), allow editing but show the existing hint: "Changes apply to next load." In snapshot mode, "next load" would require leaving snapshot mode, so this is acceptable but must not break anything.

I00 Validation and failure cases (rev 00)

I01 Invalid snapshot JSON
If parsing fails:

* Show banner "Snapshot is invalid."
* Add log entry with the parse error.
* Stay in empty state.

I02 Unsupported schemaVersion
If schemaVersion is unknown:

* Show banner "Snapshot version not supported."
* Add log entry.
* Stay in empty state.

I03 Missing file fields
If a file item is missing path or text:

* Skip it
* Increment errors and skipped
* Add a log entry "snapshot-invalid-file"
  This should not crash replay.

J00 Examples (rev 00)

Example 1: normal use

* Load a folder with 2,000 files.
* Wait until phase is loaded.
* Click "Save as HTML".
* Open the downloaded HTML on a laptop with no repo checkout.
* The viewer replays the load, tree grows, files appear, and anchors work.

Example 2: cancelled snapshot

* Load a large folder, cancel after 300 files.
* Phase becomes cancelled and banner shows "Loading cancelled. 300 files loaded."
* Click "Save as HTML".
* Open the exported file.
* It replays only those 300 files and shows the same partial snapshot.

Example 3: deep link

* In the exported HTML, open with a hash:

  * file:///.../export.html#file-src-index-js-abc123
* As replay runs, when that file is rendered it scrolls into view and becomes active.

K00 Acceptance checks (rev 00)

K01 Live behavior unchanged
Folder picker and file picker still load incrementally, still update progress counters, and still render files as they are read.

K02 Export works
"Save as HTML" downloads one HTML file that contains all code text and runs offline.

K03 Snapshot replay feels like streaming
When opening the exported HTML, the tree and file sections appear progressively and the UI stays responsive.

K04 Feature parity
Anchors, active file and line indicator, pinned sidebar, stats panel, log panel, and copy path work the same in live and snapshot modes.

K05 No network dependency in exported file
After opening the exported HTML, the app does not fetch styles.css or app.js and does not call the filesystem picker.

K06 No search
No search UI or logic is added.
