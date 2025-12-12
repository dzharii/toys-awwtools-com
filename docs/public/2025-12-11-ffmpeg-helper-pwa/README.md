# ffhelper (offline FFmpeg command helper)

Single‑page, offline web app that **generates FFmpeg commands and small Termux bash scripts**.  
It never runs FFmpeg; it only outputs text you copy/paste into Termux (Android) or any shell (desktop).

This folder contains a self‑contained static app:

- `index.html` – UI + embedded default template XML
- `style.css` – Duolingo‑inspired mobile/desktop styles
- `main.js` – app logic (no dependencies)
- `sw.js` – service worker for offline caching
- `ffmpeg-samples/*` – source material for shipped templates
- `spec.md` – product spec

## What it does

- Paste or pick one or many inputs.
- Set output directory + naming rules.
- Pick a template (search + tags).
- The app fills placeholders (`{{in}}`, `{{out}}`, `{{var:crf}}`, …) and shows a runnable command.
- Tap **Copy** → paste into Termux → run.

## Quick start (Android + Termux)

1. Open `index.html` in your Android Chromium browser.
2. First run: set:
   - **Termux storage root** (usually `/storage/emulated/0`)
   - **Output directory** (example: `/storage/emulated/0/Movies/exports`)
3. Paste Termux paths in **Paste paths** mode, one per line.
4. Search a template (e.g., “H.264 CRF transcode”).
5. Tap **Copy** next to the rendered command.
6. Paste into Termux and run.

Notes:
- Browsers often **do not provide absolute filesystem paths** for picked files.  
  That’s why “Paste paths” is the most reliable mode.
- Picked folders/files are treated as *helpers*; you can and should edit paths to match Termux.

## Quick start (desktop)

1. Open `index.html` in any Chromium‑based browser.
2. Use **Pick files** mode or drag‑and‑drop clips into the drop zone.
3. Use **Pick folder** buttons to quickly fill directory names.
4. Edit the text fields if you need exact shell paths.
5. Copy a template and run in your terminal.

## Input modes

### Paste paths (recommended)
- Paste absolute Termux paths, one per line:
  ```
  /storage/emulated/0/DCIM/Camera/a.mp4
  /storage/emulated/0/DCIM/Camera/b.mp4
  ```
- These become `{{inputs}}` (quoted) and `{{in}}` (first input).

### Pick files
- Lets you multi‑select or directory‑select files.
- If the browser provides relative paths, ffhelper prefixes them with your **Termux storage root**.
- If only file names are available, ffhelper uses the **Assumed input directory** (clearly labeled in the UI).

## Output naming rules

Output path is derived from:

- **Output directory**: `{{outDir}}`
- **Prefix**: `{{prefix}}`
- **Suffix**: `{{suffix}}`
- **Output extension**: `{{outExt}}`
- Input stem: `{{stem}}`

Example:

`/storage/emulated/0/Movies/exports/out_clip_compressed.mp4`

Conflict behaviors:

- **overwrite**: adds `-y` to ffmpeg and uses the base output name.
- **safe suffix**: generates a shell snippet that increments `_1`, `_2`, … if a file exists.
- **fail**: generates a guard that exits if the output exists.

## Templates

Templates are stored as XML (embedded defaults + user edits in localStorage).  
Each template has:

- `id`, `type` (`command` or `script`)
- `title`, `tags`, `notes`
- `body` with placeholders

### Placeholders supported

- `{{in}}`, `{{in1}}`, `{{in2}}`, … – current inputs (quoted)
- `{{inputs}}` – all inputs joined and quoted
- `{{outDir}}` – output directory (quoted)
- `{{stem}}`, `{{ext}}` – derived from first input
- `{{outExt}}` – chosen output extension
- `{{out}}` – full output path
- `{{var:name}}` – user variables from XML (e.g., `{{var:crf}}`)

### Editing templates

Open **Edit templates**:

- **Form editor**: safe editing of one template with a live preview.
- **XML editor**: power‑user mode with Validate / Save / Export.

If XML is invalid, ffhelper **keeps the last valid set** and shows an error.

## Offline use

After the first load, `sw.js` caches the app so it works offline.  
To verify: open once online → toggle airplane mode → reload.

## Limitations / design choices

- No external dependencies, no network calls required.
- App never executes FFmpeg in the browser.
- Browsers may hide absolute paths, so the UI treats pasted paths as first‑class.
- Generated commands are quoted correctly for bash, but you are responsible for what you run.

## Development

No build step. Edit files directly.

To reset everything: use the **Reset** button (clears localStorage for ffhelper).
