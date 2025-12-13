A01 Project name and scope

Project name: ffhelper.

Scope: an offline static web app (`index.html`, `style.css`, `main.js`, `sw.js`) that generates FFmpeg commands and small bash scripts. It targets Termux on Android first, but also works in desktop browsers for producing commands you paste into a local shell. The app never runs FFmpeg; it only produces text you copy and paste.

A02 Vision

Make repeated FFmpeg work fast and low-friction on a phone, without breaking desktop use. The app should feel like a small tool: open, pick input, pick output, copy command, done.

A03 Problem statement

On Android, FFmpeg itself is fine. The slow part is typing and retyping file paths, output names, and long command lines on a touchscreen. This project removes that repetition by storing a library of FFmpeg command templates and filling them with the current input and output values.

A04 Target environment and constraints

Platform: Android phone (primary) and desktop computers (secondary).

Shell: Termux bash on Android. Generated commands are bash‑friendly and typically runnable in POSIX shells on desktop.

Browser: Android Chromium-based browser primary. Desktop Chromium/Edge/Firefox/Safari supported, with graceful degradation of file/folder picking features.

Important constraints:

- Browsers often do not provide real absolute filesystem paths from file pickers. The app must still generate Termux-usable paths, so it must support pasting paths as a first-class input method.
- `showDirectoryPicker()` is experimental and not available in many browsers. Folder picking must fall back to `webkitdirectory` where possible, and to manual entry otherwise, without breaking the app.

A05 Goals and non-goals

Goals: fast selection of inputs and output settings; instant regeneration of commands; one-tap copy; persistent settings; editable template library; excellent phone UX with Duolingo‑like clarity (distinct color palette); works well on desktop; includes a real default command library so the app is useful immediately; optional file/folder pickers to reduce typing; drag‑and‑drop input on desktop.

Non-goals: running FFmpeg in the browser; uploading files; video preview or editing timeline; trying to guess filesystem paths the browser does not expose.

B00 User flows

B00.1 First run

User sets a Termux storage root and a default output directory. User verifies one generated command and runs it in Termux. User optionally changes defaults like output extension and naming suffix. Settings persist.

B00.2 Normal run, single input

Step 1: choose input using either file picker or path paste.

Step 2: confirm output directory and naming.

Step 3: choose a template using search and tags.

Step 4: tap Copy.

Step 5: paste into Termux and run.

B00.3 Normal run, multiple inputs

Step 1: provide multiple inputs via multi-select or multi-line paste.

Step 2: choose a batch template that produces either one command per input or a bash loop.

Step 3: tap Copy and run in Termux.

B00.4 Normal run on desktop

Step 1: provide inputs via file picker or drag‑and‑drop (multi‑file supported).

Step 2: set output directory and naming rules, using folder pickers when supported or manual typing otherwise.

Step 3: search or filter templates, copy the rendered command or script.

Step 4: paste into a desktop shell and run.

C00 Use cases

C00.1 Quick compression for sharing

Input is a single large video. Output is a smaller mp4. User picks a template like H.264 CRF or H.265 CRF, adjusts CRF if needed, copies and runs.

C00.2 Batch compression of a set of clips

Input is multiple files. Output is multiple files in one output folder. User uses a batch template that loops over inputs and produces consistent output names.

C00.3 Extract audio

Input is a video. Output is m4a or mp3. User picks the extract-audio template and runs.

C00.4 Make a GIF preview

Input is a video. Output is a short gif. User sets duration and width variables and runs.

C00.5 Trim and re-encode

Input is a long recording. Output is a trimmed segment. User sets start and duration variables and runs.

D00 Inputs, outputs, and path handling

D00.1 Input sources

The app supports two input modes.

Mode 1: paste paths. User pastes absolute Termux paths, one per line. This mode is always supported and is the most reliable.

Mode 2: pick or drop files. User selects one or multiple files via file picker (directory selection supported where the browser allows) or drag‑and‑drop on desktop. Because browsers may not expose absolute paths, the app uses one of these strategies, depending on what the browser can do and what the user configured.

Strategy A: directory base plus relative path. If the browser supports choosing a base directory and exposing relative paths, the app computes relative paths and prefixes them with the configured Termux root.

Strategy B: assumed input directory. If only file names are available, the app combines file names with a user-configured assumed input directory. The UI must clearly label this as an assumption because it can be wrong if the selected file is not in that directory.

Strategy C: drag‑and‑drop inputs. Dropped files typically expose only names, so they follow Strategy B unless relative paths are available. The UI must continue to label assumptions clearly.

D00.2 Output target

Output directory is a Termux path string stored in localStorage. Output naming is derived from input name plus rules defined in the UI.

D00.3 Quoting rules for bash

Every generated path is wrapped in double quotes.

If a path or user-provided value contains a double quote, it is escaped so the final command remains valid.

The app does not attempt to sanitize shell metacharacters beyond correct quoting. The generated output is intended for the user to run knowingly.

D00.4 Path picker dialogs

To reduce typing, the UI provides optional folder pickers next to these fields:

- Termux storage root
- Output directory
- Assumed input directory

Picker behavior:

- If `showDirectoryPicker()` is supported, use it.
- Else if `webkitdirectory` selection is supported, use a hidden directory input to obtain the top‑level folder name.
- Else disable picker buttons and rely on manual entry.

Because picked paths are not reliable absolute Termux paths, the UI must always present manual editing as the source of truth and keep pickers as a convenience.

E00 Template system

E00.1 Template purpose

Templates are the core of the app. A template is a named command or script with placeholders. When inputs, outputs, or variables change, every template re-renders instantly.

E00.2 Placeholder tokens

The template engine supports these tokens.

{{in}} is the current input path.

{{in1}}, {{in2}}, ... are specific input paths by index, when the template needs multiple explicit inputs.

{{inputs}} is all inputs joined as quoted paths.

{{outDir}} is the output directory.

{{stem}} is the input file name without extension.

{{ext}} is the input extension without the dot.

{{outExt}} is the chosen output extension without the dot.

{{out}} is the full output path, typically "{{outDir}}/{{stem}}<suffix>.{{outExt}}".

{{prefix}} is the current output prefix from the UI.

{{suffix}} is the current output suffix from the UI.

{{overwriteFlag}} expands to "-y " when conflict behavior is overwrite, otherwise an empty string.

{{var:name}} is a user variable such as crf, preset, scaleWidth, start, duration.

E00.3 Scripts

Templates can be type command or type script.

A command template renders one command line.

A script template renders multi-line bash. The default script style is a safe header plus a loop over inputs.

F00 Template storage format

F00.1 Storage

The shipped templates live in an embedded XML `<script type="application/xml" id="default-templates">` block in `index.html`. User edits are saved to localStorage as the active XML and can be exported/imported. If the XML is invalid, the app keeps the last valid template set and shows a clear error.

F00.2 XML format

The XML is intentionally small and human-editable.

```xml
<ffhelper version="1">
  <spec>
    <title>ffhelper</title>
    <termuxInputRoot>/storage/emulated/0</termuxInputRoot>
    <defaultOutputDir>/storage/emulated/0/Movies/exports</defaultOutputDir>
    <defaultOutExt>mp4</defaultOutExt>
  </spec>

  <variables>
    <var id="crf" type="number" label="CRF" default="23" min="0" max="51" />
    <var id="preset" type="select" label="Preset" default="medium"
         options="ultrafast,superfast,veryfast,faster,fast,medium,slow,slower,veryslow" />
    <var id="start" type="text" label="Start" default="00:00:00" />
    <var id="duration" type="text" label="Duration" default="00:00:10" />
    <var id="scaleWidth" type="number" label="Scale width" default="1080" min="64" max="4096" />
  </variables>

  <templates>
    <template id="h264_crf" type="command">
      <title>H.264 CRF transcode</title>
      <tags>video,compress</tags>
      <body>ffmpeg -hide_banner -y -i {{in}} -c:v libx264 -preset {{var:preset}} -crf {{var:crf}} -c:a aac -b:a 160k {{out}}</body>
      <notes>Default sharing preset.</notes>
    </template>

    <template id="batch_h264" type="script">
      <title>Batch H.264 transcode loop</title>
      <tags>video,compress,batch</tags>
      <body><![CDATA[
#!/usr/bin/env bash
set -euo pipefail

OUT_DIR={{outDir}}

for IN in {{inputs}}; do
  STEM="$(basename "$IN")"
  STEM="${STEM%.*}"
  ffmpeg -hide_banner -y -i "$IN" -c:v libx264 -preset {{var:preset}} -crf {{var:crf}} -c:a aac -b:a 160k "$OUT_DIR/${STEM}.mp4"
done
]]></body>
      <notes>One paste runs all inputs.</notes>
    </template>
  </templates>
</ffhelper>
```

G00 Default command library requirements

G00.1 Requirement

The project must ship with a complete, usable template set. The app is not considered done if it ships empty or with placeholders only.

G00.2 Default templates to ship

The shipped set should cover common phone workflows. Each item includes a title, tags, and notes, and must produce a runnable command.

| ID            | Title                    | Purpose                      |
| ------------- | ------------------------ | ---------------------------- |
| h264_crf      | H.264 CRF transcode      | general compress to mp4      |
| h265_crf      | H.265 CRF transcode      | smaller files, slower encode |
| extract_m4a   | Extract audio to m4a     | audio-only output            |
| extract_mp3   | Extract audio to mp3     | compatibility output         |
| scale_1080    | Scale to 1080p           | keep aspect ratio            |
| trim_reencode | Trim start + duration    | cut a segment                |
| screenshot    | Screenshot at timestamp  | single frame output          |
| gif_preview   | GIF preview              | palette-based gif            |
| rotate_90     | Rotate 90 degrees        | fix orientation              |
| loudnorm_aac  | Normalize audio loudness | loudnorm filter              |
| concat_list   | Concat from list file    | concat demuxer workflow      |
| batch_h264    | Batch transcode script   | loop across inputs           |

G00.3 Additional shipped templates

In addition to the required set above, the app ships extra templates derived from `ffmpeg-samples/ffmpeg-recipes.md`, `ffmpeg-samples/ffmpeg-samples2.md`, and `ffmpeg-samples/ffmpeg-snippets.md` so the library is immediately useful. At minimum these additional templates are included:

| ID                 | Title                     | Purpose |
| ------------------ | ------------------------- | ------- |
| telegram_720       | Telegram 720p share       | quick 720p libx265 preset |
| quick_normalize_video | Quick normalize video  | dynaudnorm + volume boost |
| reduce_fps         | Reduce frame rate         | fps filter helper |
| android_faststart  | Android faststart transcode | mp4 with +faststart |
| smpte_bars         | SMPTE bars generator      | lavfi example / testing |
| extract_frames     | Extract frames to folder  | image sequence script |

Users can favorite, edit, or remove any shipped template.

H00 UI and UX specification

H00.0 Visual style

The UI should feel similar to Duolingo: rounded cards, high contrast primary actions, friendly typography, and clear hierarchy. Use a distinct color palette (not Duolingo green) and maintain large, thumb‑friendly tap targets.

H00.1 Layout

Top area is Inputs and Output. On phones, the core fields (input mode, input list, Termux root, output directory) must fit on screen without scrolling; less‑used output naming and conflict settings live under a collapsible “Output options” section that is closed by default on small screens.

On desktop, the layout uses two columns, opens “Output options” by default, and provides a drag‑and‑drop area in Pick files mode.

Middle area is Variables. It is visible but compact, because variable tweaks are common. On desktop, variables flow into multiple columns automatically.

Bottom area is Templates. It takes most vertical space because selection and copying is the main task.

H00.2 Template selection speed

The templates area includes an incremental search box.

Incremental search means results update on every keystroke without requiring Enter.

Search matches against title, tags, and notes. Optionally it can match body text, but title and tags are the primary ranking signals so results feel predictable.

The UI shows a short result count and keeps scrolling stable while filtering.

H00.3 Tags and favorites

Tags are clickable. Clicking a tag filters templates to that tag. The active filter is visible and removable with one tap.

Favorites exist because most users use a small subset of commands repeatedly. Favoriting a template (star button) pins it to the top and persists in localStorage. A “favorites only” toggle filters the list to favorites with one tap.

H00.4 Copy behavior

Each template has a Copy button next to the rendered command.

After copy, the UI shows a short toast like "Copied".

If the clipboard API is blocked, the app falls back to selecting text in a hidden textarea and using document.execCommand("copy").

H00.5 Editing templates

There is an Edit view. It has two modes: form editor for safety and XML editor for power users.

The XML editor validates on demand and on save. On error, it shows a clear message and does not replace the active template set.

The form editor edits one template at a time and updates a live preview of the rendered output.

H00.6 Persistence

Inputs, output directory, naming rules, variables, favorites, and the active template XML are stored in localStorage.

A Reset action clears localStorage keys for this app and restores the shipped defaults.

H00.7 Desktop usability

On desktop browsers:

- Pick files mode includes a visible drag‑and‑drop area for adding many inputs quickly.
- Layout uses comfortable spacing, two columns, and multi‑column variable grids.
- All interactions remain clear with mouse/trackpad and keyboard, without compromising phone UX.

I00 Feature roadmap

I00.1 Phase 1: core utility

Deliver inputs (paste, pick, and desktop drag/drop), output directory, naming rules, template rendering, copy, persistence, optional folder pickers with graceful fallback, offline caching via service worker, and the full default template library.

I00.2 Phase 2: fast selection

Deliver incremental search, tags, pinned favorites plus a favorites‑only toggle, variable panel generated from XML, and refined naming rules UX.

I00.3 Phase 3: durability

Deliver template editing, import/export of XML, validation, and last-known-good recovery.

I00.4 Phase 4: batch power

Deliver script templates as a first-class type, conflict handling options, and better multi-input helpers.

J00 Naming rules and output generation

Output base name defaults to the input stem.

User can set a suffix and a prefix.

User can set output extension.

Conflict behavior is selectable. Overwrite means add -y or equivalent. Safe suffix means append a number if a file exists, implemented as a script template style. Fail means generate a command that checks existence and exits with a message.

K00 Quality requirements

The app must work offline after first load. A service worker caches all local assets (`index.html`, CSS, JS, icons) and serves them on subsequent loads.

If service workers are unavailable, the app still works for the current session after loading.

No external dependencies.

No eval, no innerHTML rendering of user template content.

Errors must be shown in the UI and also logged to console with enough detail to debug.

The app must remain responsive with at least 100 templates and at least 50 inputs, using efficient rendering and minimal DOM churn.

Folder picker buttons are optional UI affordances. In browsers without `showDirectoryPicker()` and without `webkitdirectory`, picker buttons must be disabled and manual entry must remain fully functional.

L00 Acceptance criteria

A user can open the page, set an output directory, paste one Termux path, search a template, copy, paste into Termux, and run successfully.

A user can multi-line paste at least 10 paths, use a batch script template, copy once, paste into Termux, and run.

A desktop user can drag‑and‑drop multiple files or multi‑select via picker, choose a template, copy the rendered command, and run it in a local shell.

Refreshing the page restores settings and the last template selection state (at least output dir, variables, favorites, and last used input mode).

Breaking the XML in the editor does not break the main app; the app keeps the last valid set and shows a clear error.

The shipped template set is present, visible, and runnable without requiring the user to add commands manually.

Folder picker buttons being unsupported does not break any core flow; the user can always type paths manually.
