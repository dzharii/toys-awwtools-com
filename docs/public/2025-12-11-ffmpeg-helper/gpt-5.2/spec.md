A01 Project name and scope

Project name: ffhelper (working title).

Scope: one offline web page (vanilla HTML, CSS, JavaScript) that generates FFmpeg commands and small bash scripts for Termux on Android. The page never runs FFmpeg. It only produces text you copy and paste into Termux.

A02 Vision

Make repeated FFmpeg work on a phone fast and low-friction. The app should feel like a small tool: open, pick input, pick output, copy command, done.

A03 Problem statement

On Android, FFmpeg itself is fine. The slow part is typing and retyping file paths, output names, and long command lines on a touchscreen. This project removes that repetition by storing a library of FFmpeg command templates and filling them with the current input and output values.

A04 Target environment and constraints

Platform: Android phone.

Shell: Termux bash.

Browser: Android Chromium-based browser.

Important constraint: browsers often do not provide a real absolute filesystem path from a file picker. The app must still generate Termux-usable paths, so it must support pasting paths as a first-class input method.

A05 Goals and non-goals

Goals: fast selection of inputs and output settings; instant regeneration of commands; one-tap copy; persistent settings; editable template library; good mobile UX; includes a real default command library so the app is useful immediately.

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

Mode 2: pick files. User selects one or multiple files. Because browsers may not expose absolute paths, the app uses one of these strategies, depending on what the browser can do and what the user configured.

Strategy A: directory base plus relative path. If the browser supports choosing a base directory and exposing relative paths, the app computes relative paths and prefixes them with the configured Termux root.

Strategy B: assumed input directory. If only file names are available, the app combines file names with a user-configured assumed input directory. The UI must clearly label this as an assumption because it can be wrong if the selected file is not in that directory.

D00.2 Output target

Output directory is a Termux path string stored in localStorage. Output naming is derived from input name plus rules defined in the UI.

D00.3 Quoting rules for bash

Every generated path is wrapped in double quotes.

If a path or user-provided value contains a double quote, it is escaped so the final command remains valid.

The app does not attempt to sanitize shell metacharacters beyond correct quoting. The generated output is intended for the user to run knowingly.

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

{{var:name}} is a user variable such as crf, preset, scaleWidth, start, duration.

E00.3 Scripts

Templates can be type command or type script.

A command template renders one command line.

A script template renders multi-line bash. The default script style is a safe header plus a loop over inputs.

F00 Template storage format

F00.1 Storage

The shipped templates live in an embedded XML block in index.html. User edits are saved to localStorage as the active XML. If the XML is invalid, the app keeps the last valid template set and shows a clear error.

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

H00 UI and UX specification

H00.1 Layout

Top area is Inputs and Output. It must fit on screen without scrolling on most phones.

Middle area is Variables. It is visible but compact, because variable tweaks are common.

Bottom area is Templates. It takes most vertical space because selection and copying is the main task.

H00.2 Template selection speed

The templates area includes an incremental search box.

Incremental search means results update on every keystroke without requiring Enter.

Search matches against title, tags, and notes. Optionally it can match body text, but title and tags are the primary ranking signals so results feel predictable.

The UI shows a short result count and keeps scrolling stable while filtering.

H00.3 Tags and favorites

Tags are clickable. Clicking a tag filters templates to that tag. The active filter is visible and removable with one tap.

Favorites exist because most users use a small subset of commands repeatedly. Favoriting a template pins it to the top and persists in localStorage.

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

I00 Feature roadmap

I00.1 Phase 1: core utility

Deliver inputs, output directory, template rendering, copy, persistence, and the full default template library.

I00.2 Phase 2: fast selection

Deliver incremental search, tags, favorites, variable panel generated from XML, and naming rules.

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

The page must work offline after load.

No external dependencies.

No eval, no innerHTML rendering of user template content.

Errors must be shown in the UI and also logged to console with enough detail to debug.

The app must remain responsive with at least 100 templates and at least 50 inputs, using efficient rendering and minimal DOM churn.

L00 Acceptance criteria

A user can open the page, set an output directory, paste one Termux path, search a template, copy, paste into Termux, and run successfully.

A user can multi-line paste at least 10 paths, use a batch script template, copy once, paste into Termux, and run.

Refreshing the page restores settings and the last template selection state (at least output dir, variables, favorites, and last used input mode).

Breaking the XML in the editor does not break the main app; the app keeps the last valid set and shows a clear error.

The shipped template set is present, visible, and runnable without requiring the user to add commands manually.
