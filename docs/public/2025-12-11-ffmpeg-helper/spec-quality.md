## K00 Project quality bar

K00.01 The project is a static page that loads fast, works offline after first load, and is usable on a phone with one hand.

K00.02 All user facing state is predictable. If the UI shows a value, that exact value is used in the generated commands.

K00.03 Every generated command is safe to copy and paste into Termux bash. Output is deterministic for the same inputs.

K00.04 The UI provides immediate feedback for the most common mistakes: missing base dirs, empty selection, suspicious output patterns, and clipboard failures.

K00.05 The data model is small and stable. Templates and settings are stored in a format that is human editable and exportable.

K00.06 The page remains usable with large template catalogs. Rendering and filtering are fast, and controls remain responsive.

K00.07 The project is easy to maintain: small modules, no framework, clear separation between parsing, state, rendering, and command expansion.

## L00 Feature roadmap and implementation plan

L00.01 Settings panel with persistence.

What it is: inputBaseDir, outputBaseDir, outputPattern, optional ffmpegBinary (default "ffmpeg"), and optional quoteMode (auto/on/off).
How it works: each field saves on change to localStorage; on load, the UI is prefilled and commands re render immediately.
UX placement: top of the page, because it is global context and must be reachable before scrolling into templates. It also reduces repeated edits while working through many templates.

L00.02 File selection plus manual list mode.

What it is: multi file picker and an alternative text area for manual file name entry (one per line). A toggle selects the active source mode.
How it works: picker mode uses File objects and their names; manual mode uses lines as file names and ignores the picker. Both modes share the same command generation pipeline.
UX placement: directly under settings. This matches the mental flow: set base dirs, then choose inputs, then copy commands.

L00.03 Resolved path preview and warnings.

What it is: a compact preview panel showing, for the first selected file, inputPath and outputPath, plus a list of warnings.
How it works: whenever settings or selection changes, compute the resolved strings; run lightweight checks like "base dir empty", "output pattern empty", "output equals input", "missing extension".
UX placement: beside or immediately below file selection, because the user should verify paths before scanning templates.

L00.04 Template list with search and tags.

What it is: a search input that filters templates by label, description, tags, and command body; optional clickable tags per template.
How it works: as the user types, the rendered list is filtered. Tags apply a preset filter query.
UX placement: above the template list, because it reduces scrolling and makes large catalogs usable on mobile.

L00.05 Template cards with per template command expansion.

What it is: each template is a card with label, short description, tags, a collapsed "template body" view, and an expanded "generated commands" view.
How it works: for N selected files, generate N commands and show them as a single block separated by newlines. Provide copy for the block and optional per line copy.
UX placement: main content area. Cards allow progressive disclosure so the page stays scannable.

L00.06 Copy reliability layer.

What it is: a copy button that uses navigator.clipboard when available, otherwise falls back to a hidden textarea select and document.execCommand.
How it works: on success show a toast "Copied"; on failure show "Copy failed" and keep the command visible for manual selection.
UX placement: in the card header for the generated output, because it is the primary action.

L00.07 Quoting and escaping strategy.

What it is: consistent quoting rules for paths with spaces, quotes, and special characters.
How it works: implement a single function quoteBash(value) that wraps with single quotes by default and escapes embedded single quotes correctly. Provide a setting to disable quoting for users who prefer raw paths.
UX placement: global setting. Quoting impacts all templates, so it belongs with base dirs and patterns.

L00.08 Output naming helpers.

What it is: outputPattern supports placeholders and provides quick insert buttons for common placeholders like {inputBaseName}, {index1}, {inputExt}.
How it works: tapping a placeholder chip inserts it at the cursor position in the pattern input. Show a live example outputFileName for the first file.
UX placement: inline with outputPattern. This reduces typing and prevents placeholder mistakes on touch keyboards.

L00.09 Template editor for user templates.

What it is: a built in editor to create, edit, clone, and delete user templates, with live preview.
How it works: open an editor panel as a modal sheet or an inline expanded card. Validate required fields. Save to localStorage under ffh.userTemplates. Built in templates are read only.
UX placement: a floating "New template" button near the template list header or a dedicated card at the top of templates. This avoids burying creation behind scrolling.

L00.10 Template import and export.

What it is: export user templates and settings as a JSON file, and import them later.
How it works: export uses a Blob download. Import uses a file input to load JSON, validates schema, and merges or replaces with user choice defaulting to merge with de dup by id.
UX placement: in a small "Data" section at the bottom of the settings panel. It is not needed per run but is important for maintenance and device migration.

L00.11 Built in template data in XML with clear schema.

What it is: ship a starter catalog of templates embedded as application/xml, similar to your reference project style.
How it works: parse XML via DOMParser, validate required attributes, convert to internal objects. Support CDATA for command bodies.
UX placement: not visible as a UI element, but the choice of XML supports your preference for editable embedded catalogs and keeps index.html self contained.

L00.12 Favorites and quick access.

What it is: star a template and optionally show a "Favorites" filter.
How it works: store favorite ids in localStorage. Render a small star toggle on each card and a favorites filter button near search.
UX placement: near search and on each card header. It reduces time to find frequently used recipes on mobile.

L00.13 Template groups and ordering.

What it is: group templates by category, and allow custom ordering.
How it works: categories come from template metadata. Provide a "Sort" control with options: category, label, favorites first, recently used. Store the selection.
UX placement: next to search. Sorting is part of navigation, not template content.

L00.14 Command variants per template.

What it is: some templates need a small parameter switch like target bitrate, scale height, crf, audio mode.
How it works: allow templates to define a small set of parameters with defaults. The UI renders small inputs inside the template card and those values become placeholders like {crf} or {height}.
UX placement: inside the card, above generated commands. The controls must be close to the output they affect.

L00.15 Multi output strategy.

What it is: templates can generate outputs in different folders or produce multiple outputs per input, such as mp4 plus thumbnail.
How it works: support placeholders for outputSubdir and allow template body to reference {outputBaseDir}/{outputSubdir}/... Provide per template output overrides stored per template id.
UX placement: inside the template card as optional advanced settings, collapsed by default.

L00.16 Command set packaging modes.

What it is: output as plain commands, as a bash script with header, or as a one liner joined by " && ".
How it works: a global "Output format" setting. Plain uses newlines. Script adds shebang and set -euo pipefail and an optional cd. One liner joins commands with " && ".
UX placement: global, because it changes how users paste into Termux. Keep it near settings, not per template.

L00.17 Safety guards for destructive commands.

What it is: warn when template body includes rm, mv, or overwriting patterns, and show a confirmation before copy if the template is marked "dangerous".
How it works: templates can include a flag dangerous="true". The copy button requires a second tap or shows a simple confirm dialog.
UX placement: on the copy action, because that is the point of no return.

L00.18 Error console panel.

What it is: a collapsible diagnostics panel that shows parse errors, validation messages, and last clipboard error.
How it works: maintain an in memory log and optionally mirror to console. Keep it hidden unless there is a problem.
UX placement: at the bottom of the page to avoid clutter, but visible when needed.

L00.19 Offline readiness.

What it is: optional service worker to cache index.html, css, js, and icons so the tool works offline.
How it works: register a simple cache first service worker. Provide a small status line "Offline ready" once cached.
UX placement: a subtle status indicator in the header, because it is informational and not part of the main workflow.

L00.20 Accessibility and touch ergonomics.

What it is: large tap targets, clear focus styles, high contrast, and keyboard friendly behavior for Bluetooth keyboards.
How it works: button sizes >= 44px height, spacing between controls, no tiny icons without labels, and aria labels for copy buttons and toggles.
UX placement: across the entire page. This is not a separate UI section; it is a build standard applied everywhere.

L00.21 Performance and scaling.

What it is: smooth scrolling and fast rerender for large template counts and large file lists.
How it works: render using document fragments, avoid innerHTML for big blocks where possible, debounce search input, and only compute command expansion for visible cards if the list becomes large.
UX placement: internal implementation detail; the user benefit is responsiveness on a phone.

L00.22 Minimal starter template catalog.

What it is: ship a small set of high value templates that cover common tasks.
How it works: include templates like transcode to h264 crf, extract audio to aac, trim segment, speed change, scale to 1080p, create gif, extract frames, create thumbnail, concat list file guidance, and metadata probe.
UX placement: built in templates are the first visible value when opening the page, reducing time to become productive.

L00.23 Readme content embedded in the page.

What it is: a short "How to use" section that can be collapsed.
How it works: a single collapsible block that explains the browser path limitation and shows examples of typical Termux base dirs.
UX placement: near the top but collapsed by default, so first time users get help and returning users are not slowed down.

L00.24 Reset and recover.

What it is: reset settings, reset templates, and clear favorites, with separate actions.
How it works: buttons in a "Reset" row. Each action affects only its scope, and destructive actions require confirmation.
UX placement: at the end of settings, because it is rare and should not be hit accidentally.

L00.25 Versioning of stored data.

What it is: a schemaVersion stored in localStorage to support future migrations.
How it works: save ffh.schemaVersion = 1 and on load migrate keys if needed.
UX placement: invisible, but prevents breakage as the project evolves.
