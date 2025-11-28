Date: 2025-11-27

A00 Purpose and scope
This document specifies a local, single user, chat style note taking web application. The application runs in a modern desktop web browser and persists all user content to a user selected folder on the local file system. There is no server component and no network access. All functionality is implemented using vanilla HTML, CSS, and JavaScript without third party libraries, CDNs, fonts, or UI frameworks. The intended implementer is a large language model that will generate the code and supporting files.

A01 Problem description and rationale
Today the user relies on general purpose chat applications such as Telegram, Microsoft Teams, or Slack by creating a private chat with themselves. That chat acts as a scratchpad for links, screenshots, and short notes. It is useful because each message is timestamped, easily appended, and can be formatted to emphasize important details. However, this approach has drawbacks: it depends on external services and network connectivity, it mixes personal notes with a broader communication tool, it does not give explicit control over local file structure, and long term archival or processing of the notes is constrained by the chat platform.

The goal of this project is to replicate the useful properties of a self chat channel in a dedicated, local first, fully controllable application that writes notes as files in a transparent folder structure on disk.

A02 High level product description
The application behaves like a minimal one person chat client:

FR-1: It shows a chronological timeline of messages (notes).
FR-2: It provides an input area where the user composes rich formatted messages.
FR-3: When the user posts a message, it is immediately written to disk as one or more files in a user chosen folder.
FR-4: Each message has an automatic creation timestamp and an optional last edited timestamp.
FR-5: Messages can be edited; after editing, the corresponding files on disk are updated.
FR-6: Messages can include links and images and can use basic text formatting for emphasis.

The unique aspect is the storage model. The application treats a folder as a workspace. Within that folder, it stores messages and attachments in a documented, structured way that can be inspected or processed by other tools.

B00 System context and constraints

B01 Execution environment
FR-7: The application is delivered as a static web bundle consisting of at minimum an HTML file, a JavaScript file, and a CSS file.
FR-8: It runs in a modern desktop browser that supports the File System Access API (for example a recent Chromium based browser).
FR-9: No backend server is required; the app is served either from local disk or any simple static file server.
FR-10: The app must function entirely offline once loaded.

B02 Security and privacy constraints
NFR-1: The application must not perform any outbound network requests (no analytics, fonts, CDNs, or API calls).
NFR-2: All user content stays in the chosen local folder; no hidden copies are sent elsewhere.
NFR-3: Permissions for accessing the folder are handled via the browser file permission model. The application must not assume permanent access and must handle permission loss gracefully.

B03 Technology constraints
NFR-4: Only vanilla HTML, CSS, and JavaScript are allowed. No external libraries, frameworks, or build time dependencies are required for the runtime.
NFR-5: The only browser APIs used beyond DOM basics are those for file access (File System Access API), persistent preferences (for example localStorage or IndexedDB), and optional drag and drop.

C00 User model

C01 User role
There is exactly one role: the workspace owner. The owner uses the app for personal note taking. There is no concept of multiple users, authentication, or sharing inside this initial version.

C02 Usage pattern
The owner opens the app in a browser, selects or creates a workspace folder, and then repeatedly enters messages while working on other tasks. The app is expected to remain open for long periods and accumulate many messages over days and months.

D00 Functional requirements

D01 Workspace and folder selection
FR-11: On first load, if no workspace folder has been selected, the app presents a clear prompt to choose a folder.
FR-12: The user triggers folder selection through a visible control such as a button labeled "Select notes folder". This uses showDirectoryPicker (or equivalent).
FR-13: Once a folder is selected, the app initializes it as a workspace if it does not already contain workspace metadata.
FR-14: If the folder already contains workspace metadata matching the expected schema version, the app loads that workspace instead of reinitializing it.
FR-15: The app persists a reference to the selected folder using the browser facility for storing file system handles so that the same folder can be reused on subsequent visits (for example IndexedDB).
FR-16: If, on a subsequent visit, the stored folder handle is no longer valid or permission is revoked, the app falls back to the "no folder selected" state and asks the user to choose again.
FR-17: There is a simple settings view that allows the user at any time to switch to a different workspace folder. Switching folder reloads the message list based on the newly chosen folder.

D02 Workspace folder layout
Within the chosen folder, the app expects and maintains the following structure:

```text
<workspace-root>/
  workspace.json
  messages/
    000001.json
    000002.json
    ...
  attachments/
    img-000001.png
    img-000002.png
    ...
```

FR-18: The workspace root folder contains a file named "workspace.json" with metadata.
FR-19: There is a subfolder named "messages" that contains one JSON file per message.
FR-20: There is a subfolder named "attachments" for binary assets such as images.

Example "workspace.json":

```json
{
  "schemaVersion": 1,
  "title": "My Notes Chat",
  "createdAt": "2025-11-27T18:32:10.123Z",
  "lastOpenedAt": "2025-11-27T19:20:05.000Z",
  "nextMessageNumericId": 3,
  "settings": {
    "theme": "light",
    "fontSizePx": 14
  }
}
```

FR-21: "schemaVersion" is used to detect incompatible changes. If the file exists but the version is unsupported, the app must show a clear error explaining that this version of the app cannot open the workspace.
FR-22: "nextMessageNumericId" is the next integer to assign when creating a message. The corresponding file name is left padded with zeroes (for example "000003.json").
FR-23: The app is responsible for keeping "lastOpenedAt" up to date.

D03 Message representation and storage

Each message is stored as a separate JSON file under "messages/". The file name is the zero padded numeric message id plus ".json".

Example "messages/000002.json":

```json
{
  "id": "000002",
  "createdAt": "2025-11-27T18:40:00.000Z",
  "updatedAt": "2025-11-27T18:45:10.000Z",
  "author": "me",
  "contentText": "Investigate new deployment script, see https://example.com/details",
  "contentHtml": "<p>Investigate new deployment script, see <a href=\"https://example.com/details\">https://example.com/details</a></p>",
  "formatVersion": 1,
  "attachments": [
    {
      "type": "image",
      "relativePath": "attachments/img-000012.png",
      "originalFilename": "Screenshot 2025-11-27 at 18.41.00.png"
    }
  ]
}
```

FR-24: "createdAt" is the ISO 8601 timestamp when the user first posted the message.
FR-25: "updatedAt" is null or absent for messages that have never been edited. When the user edits a message, "updatedAt" is set to the edit time.
FR-26: "contentText" is a plain text or lightweight markup representation that is suitable for search and external processing.
FR-27: "contentHtml" is the HTML representation used for display inside the app.
FR-28: "formatVersion" allows evolution of the content encoding while still supporting old messages.
FR-29: Attachments refer to sibling files within the workspace root by path relative to the workspace root.

D04 Message timeline and display
FR-30: After opening a workspace, the app reads all files under "messages/" that match the expected naming pattern and have valid JSON. Invalid files are ignored but recorded in a diagnostic log that can be shown to the user in a simple text area within settings.
FR-31: Messages are sorted primarily by "createdAt", and secondarily by "id" to enforce a deterministic order when timestamps collide.
FR-32: The main view displays the messages in chronological order, newest at the bottom.
FR-33: Each message in the UI shows at least the following: creation timestamp in local time, an edit indicator if "updatedAt" is present, and rendered "contentHtml".
FR-34: Links inside content are clickable anchor elements that open in a new tab.
FR-35: Images listed in "attachments" are rendered inline below the corresponding text, using their relativePath.

D05 Message composition and posting

The composer is a panel at the bottom of the window with the following behavior:

FR-36: The composer uses a text input mechanism that supports both plain text and basic formatting. A reasonable implementation is a contenteditable element.
FR-37: The composer supports at least: bold, italic, inline code, code block, and inline link creation.
FR-38: Formatting commands are exposed as buttons in a small toolbar, for example "B", "I", "Code", and "Link".
FR-39: When the user presses the "Send" or "Post" button, or a keyboard shortcut such as Ctrl+Enter, the app performs validation and then writes a new message file.
FR-40: Validation ensures that the message is non empty after trimming whitespace. If the message is empty, posting is cancelled and the user is informed in a non intrusive way.
FR-41: On successful write of the message file and update of "workspace.json", the app appends the message to the in memory list and scrolls the timeline to make it visible.
FR-42: If writing to disk fails at any step, the app does not add the message to the timeline and instead shows a clear error with the error message text returned by the browser API when available.

Formatting and storage rules:

FR-43: When posting, the app generates "contentText" by extracting plain text from the composer, preserving simple markup markers where useful (for example "**" for bold and "`" for code) but this internal format is not required to be strict Markdown.
FR-44: "contentHtml" is generated by converting the composer DOM content into a sanitized HTML fragment that only allows a controlled subset of tags (for example p, strong, em, code, pre, a, span with limited attributes).
FR-45: The app must strip any unexpected attributes to reduce security risk when viewing messages later.

D06 Attachments and images

FR-46: The user can attach an image to a message by either using an "Attach file" button that opens a file picker or by dragging and dropping an image file into the composer area.
FR-47: On attachment, the file is copied into the workspace "attachments/" folder with a generated name such as "img-000001.ext". The original filename is preserved in metadata only.
FR-48: For each successfully copied attachment, an entry is added to the message "attachments" array.
FR-49: The message timeline displays image attachments as inline images with basic constraints on max width and height so that they fit in the viewport.
FR-50: Attachment operations must be transactional relative to message creation: either all referenced attachments are successfully copied and written before the message file is created, or the post operation fails and the user is informed.

D07 Message editing and deletion

FR-51: Each message entry in the timeline has an "Edit" control.
FR-52: Editing opens the existing message content in the composer or a dedicated editing dialog, preserving formatting.
FR-53: On save, the app updates the corresponding "messages/<id>.json" file, sets "updatedAt" to the new time, and updates the in memory representation.
FR-54: If saving fails, the original content remains visible and an error is shown.
FR-55: The app supports message deletion. Deletion removes the message file from "messages/" and removes the message from the timeline.
FR-56: Attachment files are not automatically deleted when a message is deleted in this version; instead, they remain on disk. This is a deliberate choice to avoid accidental data loss. The behavior is documented to the user.

D08 Settings and preferences

FR-57: The app provides a settings view reachable from a visible control in the main UI.
FR-58: Settings allow the user to: view the current workspace folder path, switch workspace folder, and adjust simple UI preferences such as theme (light or dark) and base font size.
FR-59: Preferences are stored in "workspace.json" under "settings" as well as in browser local storage as needed for faster startup. Workspace preferences take precedence.

E00 Non functional requirements

E01 Performance
NFR-6: The app must be able to load at least several thousand messages without becoming unresponsive on a typical modern laptop.
NFR-7: Initial workspace load must complete reading and rendering of messages in a reasonable time; for large collections, a lazy rendering strategy can be used (for example virtualized scrolling) but this is optional for the first implementation.
NFR-8: File access operations use asynchronous APIs with async/await to avoid blocking the UI thread.

E02 Reliability and error handling
NFR-9: All calls that interact with the file system are wrapped in error handling that surfaces readable error messages to the user.
NFR-10: If a workspace is partially corrupted (for example one bad message file), the rest of the workspace remains usable.
NFR-11: Diagnostic information about skipped or failed files can be viewed in settings in plain text form.

E03 Usability
NFR-12: The main workflow (open workspace, post message) should be achievable with minimal clicks.
NFR-13: Timestamp formats are consistent and use local time for display, with a tooltip or secondary view showing the full ISO timestamp.
NFR-14: Keyboard navigation supports scrolling the timeline and focusing the composer quickly (for example Escape to focus timeline, Ctrl+L to focus composer, or similar sensible defaults).

E04 Portability
NFR-15: The app is designed to work in at least one specified browser brand and version that supports the necessary file APIs. Cross browser testing in others is considered a future enhancement.
NFR-16: The project is packaged as simple static files so it can be hosted in multiple ways, including a file:/// URL or a local HTTP server inside WSL.

F00 UI layout and interaction design

F01 Main layout
The main screen is divided into three vertical regions:

1. A top bar displaying workspace title, current folder indicator, and access to settings.
2. A central scrollable timeline area that shows messages in order.
3. A bottom composer area with formatting toolbar, text input, and buttons for attachments and posting.

The layout is responsive but optimized for a desktop width; mobile optimization is a lower priority.

F02 Visual design
The design is minimalist:

NFR-17: Base typography relies only on system fonts.
NFR-18: Colors are defined directly in CSS without external theming libraries.
NFR-19: Two themes are supported initially: light (default) and dark. Switching theme toggles a root class on the HTML element and uses CSS variables or direct rules.
NFR-20: Messages are shown in simple rounded rectangles with clear separation. Edited messages include a small "edited" label next to the timestamp.

F03 Formatting behavior in the composer
The formatting toolbar works as follows:

FR-60: Clicking "B" toggles bold for the current selection.
FR-61: Clicking "I" toggles italic.
FR-62: Clicking "Code" wraps the current selection in inline code or opens a code block if the selection spans multiple lines.
FR-63: Clicking "Link" opens a small dialog or inline prompt to enter a URL; the selected text becomes a link.
FR-64: The composer preserves plain text pasting behavior; if rich text is pasted from external sources, it is normalized to the supported subset of formatting.

G00 Internal architecture and modules

G01 Overview
The application code is organized into a small set of modules. This organization is a guideline for the implementer rather than a rigid requirement. A reasonable structure:

1. "filesystem.js" handles all interactions with the File System Access API, including selecting folders, reading and writing files, listing directories, and managing handles.
2. "workspace.js" models the workspace domain: in memory representation of workspace metadata and messages, load and save operations, and schema version checks.
3. "ui.js" manages DOM creation, event wiring, and rendering for the timeline, composer, and settings.
4. "formatting.js" handles conversions between composer DOM, contentHtml, and contentText.
5. "main.js" initializes the application, coordinates module interactions, and handles high level state transitions.

All modules are plain JavaScript modules loaded via ES module imports.

G02 State management
The app maintains in memory state including:

1. Current workspace handle and metadata.
2. An array of message objects as loaded from disk.
3. UI preferences such as theme.
4. Transient state such as the currently edited message id (if any).

State changes follow a simple pattern:

1. UI initiates an action (for example "post message").
2. The action calls into the workspace module to perform file operations.
3. On success, the in memory state is updated and the relevant UI portion is re rendered.
4. On failure, the UI shows an error and does not mutate state.

No background workers or web workers are required in this version.

H00 Specification by example

H01 Scenario S1: First time use and workspace creation

Given the user opens the app in a supported browser for the first time,
and no previously stored workspace folder handle exists,

When the app loads,

Then the app displays a welcome view explaining that a notes folder must be selected,
and it shows a primary action "Select notes folder".

When the user clicks "Select notes folder",
and chooses an empty directory "D:/NotesChat",

Then the app creates "workspace.json" in that directory with schemaVersion 1 and nextMessageNumericId set to 1,
and it creates empty "messages" and "attachments" subfolders,
and it stores the folder handle in persistent browser storage,
and it transitions to the main chat view with an empty timeline and an active composer.

H02 Scenario S2: Creating a simple text message

Given the user has an open workspace with no messages,
and the composer is focused,

When the user types "Investigate bug in checkout flow" into the composer,
and presses the "Post" button,

Then the app validates that the message is not empty,
and calls the filesystem module to write "messages/000001.json" with the appropriate JSON content,
and updates "workspace.json" to set nextMessageNumericId to 2,
and appends the message to the timeline with a local timestamp such as "27 Nov 2025, 18:40",
and scrolls the timeline so that the new message is visible.

When the user closes and later reopens the app,

Then the app automatically reopens the same workspace using the stored folder handle,
and the message "Investigate bug in checkout flow" is present in the timeline.

H03 Scenario S3: Message with link and formatting

Given the user has a workspace open,

When the user types "See deployment details here",
selects the word "here",
clicks the "Link" button,
and enters "[https://deploy.example.com/runbook](https://deploy.example.com/runbook)" into the URL field,

Then the composer shows "here" underlined or styled as a link.

When the user also selects "deployment" and clicks "B" to make it bold,
and then posts the message,

Then the stored "contentHtml" contains an anchor tag wrapping "here",
and "deployment" is wrapped in a strong tag,
and the timeline displays a clickable link that opens the runbook in a new tab.

H04 Scenario S4: Attaching a screenshot

Given the user has taken a screenshot saved as "C:/Screenshots/issue.png",
and the workspace is open,

When the user clicks "Attach image",
selects "issue.png",
and the app confirms that the image file can be read,

Then the app copies the file into "<workspace>/attachments/img-000001.png",
and adds an attachment entry to the pending message.

When the user types "Visual glitch on checkout page" and posts the message,

Then the app writes "messages/000002.json",
and includes the attachment metadata referencing "attachments/img-000001.png",
and the timeline shows the message text followed by the screenshot image.

H05 Scenario S5: Editing a message

Given a message with id "000002" and content "Visual glitch on checkout page" exists,

When the user clicks the "Edit" control on that message,

Then the app loads the message content into the composer,
and clearly indicates that the user is editing an existing message.

When the user changes the text to "Visual glitch on checkout page, possibly CSS issue",
and clicks "Save changes",

Then the app updates "messages/000002.json" with the new content and "updatedAt" timestamp,
and the timeline updates in place,
and the message shows an "edited" indicator.

H06 Scenario S6: Switching workspace folders

Given the user has an existing workspace in "D:/NotesChat",
and a second folder "D:/NotesChat2" that is empty,

When the user opens settings and selects "Change workspace folder",
and chooses "D:/NotesChat2",

Then the app initializes "D:/NotesChat2" as a new workspace,
and the timeline becomes empty,
and any subsequent messages are stored under the second folder,
and the stored folder handle is updated to point to "D:/NotesChat2".

I00 Implementation guidance and assumptions

I01 File system API assumptions
The implementation assumes support for:

1. showDirectoryPicker for selecting a root folder.
2. Methods on directory handles for listing, reading, and writing files.
3. Permission prompts that can be re requested if lost.

If these APIs are not available, the app should detect this at startup and show a clear, static message that the browser is unsupported. No polyfills or shims that call out to a server are permitted.

I02 HTML and CSS organization
A minimal file set:

1. "index.html" contains the root container elements and script/style tags referencing "main.js" and "style.css".
2. "style.css" defines base typography, layout for header, timeline, composer, settings view, and message cards.
3. "main.js" imports other JS modules and calls an initialization function once DOMContentLoaded fires.

All styling is done with hand written CSS. No preprocessors are required by the runtime.

I03 Testing and validation expectations
The following cases should be explicitly exercised during manual or automated testing:

1. Creating and reopening a workspace.
2. Posting messages with and without attachments.
3. Editing messages and verifying that "updatedAt" and the "edited" indicator behave as expected.
4. Switching workspaces and ensuring that content does not bleed between them.
5. Simulating permission revocation to the workspace folder and verifying graceful recovery.

I04 Out of scope and future extensions

The following are explicitly out of scope for the first version:

1. Full text search across messages.
2. Tagging, pinning, or grouping messages.
3. Automatic cleanup of orphaned attachment files.
4. Multi user features such as sharing or synchronization between machines.
5. Mobile optimized layout and touch specific gestures.

This specification focuses on the minimal, robust core that reproduces the self chat note taking workflow locally, with explicit on disk artifacts and deterministic behavior.




