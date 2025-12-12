## reusable ffmpeg commands for Android Termux

This project is a small, single page web tool that helps compose reusable ffmpeg commands for Android Termux.

The tool does not run ffmpeg. It only builds command lines that are hard to type on a touch keyboard, especially when paths are long. The user then copies the command and pastes it into a Termux bash session.

The primary goals are fast use on a phone, low friction, and predictable behavior. The interface must be simple and usable with one hand, and all important settings must be remembered between sessions.

## B00 Platform and constraints

The tool runs as a static HTML file in a mobile browser on Android. It targets the combination of Android browser plus Termux with ffmpeg already installed.

The browser cannot access real Android file system paths for security reasons. File pickers provide a file object and a file name, but not the absolute on disk path that Termux uses. Because of this, the user must configure base directories manually, and the tool combines those base paths with file names to build ffmpeg commands. The tool makes this explicit in the UI.

The primary shell target is bash inside Termux. PowerShell or Windows specific behavior is out of scope. The commands generated are POSIX style and assume a typical Termux environment (for example paths like /data/data/com.termux/files/home or /storage/emulated/0/Download).

## C00 Core concepts

The tool revolves around a few core ideas.

Source files. Files that the user wants to process with ffmpeg. The UI allows selecting one or multiple files using a file input control. For each selected file, the tool uses the visible file name and combines it with a configured input base directory.

Output location. A base directory for output files and a pattern for the output file name. The user edits both as text. The tool never guesses the real directory; it always shows and uses exactly what the user typed.

Command templates. Named templates that wrap ffmpeg calls with placeholders. Each template has an identifier, a short label, a description, an ffmpeg command string with placeholders, and optional notes or tags.

Placeholders. Tokens inside templates that are replaced with values derived from the current selection and settings. Examples: {inputPath}, {inputFileName}, {inputBaseName}, {inputExt}, {outputPath}, {index}. The implementation uses simple string replacement, no full template language.

Profiles. A profile is a template plus its default settings for output naming. Profiles can be pre seeded in the HTML file and extended by the user.

Sessions. A session is one visit to the page. The active configuration for a session is a combination of saved settings from localStorage and current ad hoc changes.

## D00 User interface layout

The page is a single column layout optimized for portrait mode on a phone. It is visually split into four vertical zones from top to bottom.

Zone 1 is a small header with the project name and a short one line explanation. The header must stay compact to avoid wasting vertical space.

Zone 2 is a settings block. It contains fields for input base directory, output base directory, and optional general options such as default output extension or custom ffmpeg binary path. Each field has a label, a text input, and a small hint line that reminds the user how this value is used in generated commands.

Zone 3 is the file selection and per run controls. It includes an input labeled "Source files" that allows multi selection, a display of the currently selected file names, and an optional text area where the user can paste or type file names manually if the file picker is inconvenient. This zone also includes a quick preview panel that shows, for the first file, the resolved input path and output path according to current settings.

Zone 4 is the template list and generated commands. Templates are shown as collapsible cards. Each card has a title, description, an optional tag line, a read only view of the template string, and a generated commands panel that shows the expanded commands for the current selection. Each card has its own copy button that copies the entire generated command set for that template into the clipboard. Optionally, each per file command inside the card can have its own smaller copy button.

## E00 Data model and persistence

All data needed by the tool is either baked into the HTML or stored in localStorage.

Built in templates are embedded in the HTML file as a script tag with either XML or JSON data. For example, a script element with type "application/xml" and a root element <templates>. Each template element must provide id, label, description, category, and a commandBody field that contains the ffmpeg command template with placeholders. Additional optional metadata can be notes or tags.

User templates are stored in localStorage as serialized JSON. The value is an array of template objects with the same structure as the built in templates plus an origin flag such as "user". When loading, the tool merges built in templates and user templates into a single list, where user templates can be created, edited, or deleted from the UI.

Settings are stored in localStorage with simple flat keys. Typical keys:

ffh.inputBaseDir for the input base directory string.
ffh.outputBaseDir for the output base directory string.
ffh.outputPattern for the default output naming pattern, for example {inputBaseName}.converted{inputExt}.
ffh.theme for theme selection if themes are implemented.
ffh.userTemplates for the JSON encoded array of user templates.
ffh.lastUsedTemplateIds for optional default template selections.

On initialization, the tool reads these keys, applies defaults if they are missing, and updates the UI to reflect the current settings. On change of any setting, the tool saves the new value immediately.

## F00 Command template engine

The template engine is a small module that takes a template body string and a file context and returns a concrete command line.

Each template body is a single string that can be multiple commands separated by " && " or newlines. It may include placeholders.

The engine defines and documents a fixed set of placeholders.

{inputBaseDir} is the configured base directory for input files.
{outputBaseDir} is the configured base directory for output files.
{inputFileName} is the file name as reported by the browser (for example sample.mp4).
{inputBaseName} is inputFileName without the extension (for example sample).
{inputExt} is the extension including the leading dot (for example .mp4).
{inputPath} is inputBaseDir plus a slash plus inputFileName. The tool uses forward slashes. It does not try to normalize or validate; it concatenates strings.
{outputFileName} is computed using the current output pattern, where the pattern itself may use the same placeholders except outputFileName.
{outputPath} is outputBaseDir plus a slash plus outputFileName.
{index} is the zero based index of the file in the current selection. {index1} is the one based index.

The replacement algorithm is simple and deterministic. For each placeholder name, the engine computes a string value, then performs a global search and replace for "{name}" in the template body. There is no nested evaluation.

The engine must be pure and side effect free. For a given template and file description, it returns a plain string only.

An example of a simple template body might be:

ffmpeg -y -i {inputPath} -vf scale=-2:1080 -c:v libx264 -crf 20 -c:a copy {outputPath}

For a selection of three files, a single template card will show three ffmpeg commands, one per file, by applying the engine per file.

## G00 Interaction flows and use cases

Fast single file run.

1. User opens the page.
2. The tool restores inputBaseDir, outputBaseDir, and outputPattern from localStorage.
3. User taps the source file control and picks a single file, such as movie.mp4.
4. Zone 3 shows "Input path" as inputBaseDir + movie.mp4 and "Output path preview" as outputBaseDir plus the pattern for movie.mp4.
5. User scrolls to a preferred template. The card shows three parts: template description, template body, and generated command for the current file.
6. User taps "Copy command". The tool copies the concrete command string to the clipboard and shows a small toast message "Copied".
7. User switches to Termux, pastes the command into a bash session, and executes it.

Batch run with multiple files.

1. User opens the page.
2. User sets inputBaseDir to match the directory that contains several video files and sets outputBaseDir to a directory for converted files.
3. User uses the file selector with multi selection to select several files. Alternatively, user pastes file names into the manual file names text area; in this case the engine uses only the typed names.
4. For each template, the generated commands panel now contains one ffmpeg command per selected file. The commands are separated by newlines.
5. User taps "Copy all for this template". The tool copies the entire command block.
6. In Termux, user pastes the block into bash. Because the commands are newline separated, each runs in sequence, or the user can run them one by one.

Creating a new template from the phone.

1. In the template list, there is a dedicated "New template" card at the top or bottom.
2. The card offers text fields for label and description, a larger text area for the template body, and a small area that shows allowed placeholders.
3. While editing the template body, a live preview panel shows how the template expands for the currently selected first file. The preview shows both the resolved command and the inputPath and outputPath that will be used.
4. When the user taps "Save template", the tool validates that the label is not empty and the template body is not empty. It then writes or updates the ffh.userTemplates localStorage key.
5. The new template card appears in the main template list with the same structure as built in templates.

Editing or removing an existing user template.

1. Templates that come from built in XML are read only in the UI.
2. Templates that come from userTemplates have "Edit" and "Delete" controls.
3. "Edit" reopens the same fields as "New template", prefilled with the existing values.
4. "Delete" asks for a simple confirmation and then removes the template from localStorage and from the current in memory list.

Shepherding the user into correct path configuration.

Because the browser cannot verify Android paths, the tool must set expectations clearly.

Below the inputBaseDir field, a short line says that this value is used directly in the ffmpeg command and must match a real directory visible to Termux. Similar text appears under the outputBaseDir field.

The input path preview panel always shows the exact string that will appear after "-i" in the generated ffmpeg command. This gives a quick check that the combination of base directory and file name is correct before the user copies commands.

## H00 Error handling and edge cases

If no files are selected, the template cards still show the template description and body, but the generated command panel displays a short hint instead of commands. For example "Select at least one file to generate commands."

If base directories are empty, the engine still produces paths, but the preview panel shows that paths start with a leading slash or no directory at all. The UI may highlight missing base directories in a subtle warning color.

If the browser denies clipboard access or an exception occurs during copy, the tool logs the error to the console and shows a toast that says "Copy failed". In this case, the user can still manually select and copy text from the code block.

XML or JSON parse errors for the built in template data during initialization are reported in a visible error banner. The banner can say that built in templates failed to load and that only user templates (if any) will be available, or that nothing can be loaded. The error message stays visible.

LocalStorage failures, for example in private browsing mode, are handled by catching exceptions on access. If saving fails, the tool still functions for the current session but does not persist settings. The UI may display a small inline note that settings will not be saved in this mode.

## I00 Extensibility and non goals

The first version of the project is intentionally small. There are explicit non goals.

The tool does not attempt to detect or mount Android storage paths automatically. It does not integrate with Termux APIs or storage permission flows. The user is responsible for choosing directories that Termux can access.

The tool does not run ffmpeg commands on behalf of the user and does not show any command output. It only generates strings.

Multi device synchronization is out of scope. Settings and templates are bound to the browser storage on one device.

Possible future extensions, if needed, are support for named sets of settings called presets, optional categories for templates with filtering and search, and light or dark theme selection.

## J00 Implementation notes

The implementation uses a single index.html file accompanied by a single CSS file and a single JavaScript file.

index.html is responsible for the static structure of the page, including the header, settings form, file selection elements, template container, and an embedded script tag with built in template data.

style.css defines a basic mobile first layout with larger tap targets, clear spacing between cards, and a clean dark by default color scheme. The design should avoid heavy decoration and focus on clarity and contrast. Font sizes must be readable on a small screen.

main.js initializes the application on DOMContentLoaded, parses the template data, loads settings from localStorage, wires event handlers for form inputs and buttons, and manages rendering of template cards and generated command blocks. It keeps state in a single state object that includes current settings, current file selection, full template list, and computed command strings.

All logic related to path joining and placeholder expansion lives in small pure helper functions. Command generation is separate from DOM manipulation so it can be tested independently or reused later in different UIs if needed.
