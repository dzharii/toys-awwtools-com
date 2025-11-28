# Workspace Selection & Handling
- [x] P0 Show first-load prompt to select workspace folder via visible control using showDirectoryPicker; handle unsupported browser with clear message (Added 2025-11-27; Completed 2025-11-27)
- [x] P0 Persist selected folder handle for reuse; on invalid/revoked handle, fall back to unselected state and re-prompt (Added 2025-11-27; Completed 2025-11-27)
- [x] P0 Allow switching workspaces anytime from settings, reloading timeline and updating stored handle (Added 2025-11-27; Completed 2025-11-27)

# Workspace Files & Metadata
- [x] P0 Initialize workspace structure (workspace.json, messages/, attachments/) when folder empty; reuse if schemaVersion matches (Added 2025-11-27; Completed 2025-11-27)
- [x] P0 Enforce workspace.json schema with schemaVersion check and clear error for unsupported versions (Added 2025-11-27; Completed 2025-11-27)
- [x] P0 Maintain nextMessageNumericId with zero-padded filenames and update lastOpenedAt on load (Added 2025-11-27; Completed 2025-11-27)
- [x] P0 Store workspace settings (theme, font size) in workspace.json; workspace values override local storage (Added 2025-11-27; Completed 2025-11-27)

# Message Storage & Loading
- [x] P0 Write each message to messages/<id>.json with id, createdAt, optional updatedAt, author, contentText, contentHtml, formatVersion, attachments metadata (Added 2025-11-27; Completed 2025-11-27)
- [x] P0 Generate contentText and sanitized contentHtml from composer, stripping unsupported tags/attributes (Added 2025-11-27; Completed 2025-11-27)
- [x] P0 Read valid message files, ignore invalid ones, and record diagnostics list for settings view (Added 2025-11-27; Completed 2025-11-27)
- [x] P0 Sort messages by createdAt then id; render newest at bottom in chronological timeline (Added 2025-11-27; Completed 2025-11-27)

# Timeline Display
- [x] P0 Show message card with local timestamp, edited indicator when updatedAt present, rendered contentHtml, and clickable links opening in new tab (Added 2025-11-27; Completed 2025-11-27)
- [x] P0 Render image attachments inline with safe sizing using relative paths (Added 2025-11-27; Completed 2025-11-27)
- [x] P0 Provide diagnostic log display in settings for skipped/failed files (Added 2025-11-27; Completed 2025-11-27)

# Composer & Posting Flow
- [x] P0 Provide composer with toolbar for bold, italic, inline code/code block, and link creation; normalize pasted rich text (Added 2025-11-27; Completed 2025-11-27)
- [x] P0 Support posting via button and keyboard shortcut (e.g., Ctrl+Enter); validate non-empty content with user feedback on empty (Added 2025-11-27; Completed 2025-11-27)
- [x] P0 On successful post, write message file, update workspace.json, append to in-memory list, and scroll into view (Added 2025-11-27; Completed 2025-11-27)
- [x] P0 On write failures, avoid timeline mutation and show clear error messages (Added 2025-11-27; Completed 2025-11-27)
- [x] P0 Preserve offline behavior and forbid outbound network requests, third-party assets, and remote fonts (Added 2025-11-27; Completed 2025-11-27)

# Attachments
- [x] P0 Support attaching images via button picker and drag/drop into composer (Added 2025-11-27; Completed 2025-11-27)
- [x] P0 Copy attachments into attachments/ with generated names (img-000001.ext), preserving original filename in metadata (Added 2025-11-27; Completed 2025-11-27)
- [x] P0 Ensure attachment copy and message creation are transactional; on failure, abort post with clear error (Added 2025-11-27; Completed 2025-11-27)

# Editing & Deletion
- [x] P0 Provide Edit control per message to load content into composer/editor and indicate editing mode (Added 2025-11-27; Completed 2025-11-27)
- [x] P0 Save edits updating message file and updatedAt; update timeline in place and show edited indicator (Added 2025-11-27; Completed 2025-11-27)
- [x] P0 Support message deletion removing messages/<id>.json and timeline entry; document that attachments remain on disk (Added 2025-11-27; Completed 2025-11-27)
- [x] P0 Handle edit/save/delete failures by preserving original content and surfacing errors (Added 2025-11-27; Completed 2025-11-27)

# Settings & Preferences
- [x] P0 Provide settings view access from main UI; show current workspace path and allow switching folders (Added 2025-11-27; Completed 2025-11-27)
- [x] P0 Allow theme (light/dark) toggle and base font size adjustment; apply via root class/CSS variables (Added 2025-11-27; Completed 2025-11-27)
- [x] P0 Persist preferences in both workspace.json and local storage; workspace values take precedence on load (Added 2025-11-27; Completed 2025-11-27)

# Non-Functional & UX
- [x] P0 Ship as offline static bundle (HTML, JS modules, CSS) with no backend; run entirely offline after load (Added 2025-11-27; Completed 2025-11-27)
- [x] P0 Keep all user content confined to the selected workspace folder with no hidden copies or outbound data flows (Added 2025-11-27; Completed 2025-11-27)
- [x] P0 Use async file operations with robust error handling; keep app usable when some files are corrupted (Added 2025-11-27; Completed 2025-11-27)
- [x] P0 Support thousands of messages without UI lock; consider lazy/virtualized rendering if needed (Added 2025-11-27; Completed 2025-11-27)
- [x] P0 Display timestamps consistently in local time with ISO tooltip or secondary detail (Added 2025-11-27; Completed 2025-11-27)
- [x] P0 Provide keyboard shortcuts for timeline focus and composer focus (e.g., Escape, Ctrl+L) and for posting (Added 2025-11-27; Completed 2025-11-27)
- [x] P0 Respect browser file permission model and recover gracefully from permission loss (Added 2025-11-27; Completed 2025-11-27)

# UI Layout & Visual Design
- [x] P0 Implement three-region layout: top bar (title, folder indicator, settings), scrollable timeline, bottom composer (Added 2025-11-27; Completed 2025-11-27)
- [x] P0 Use system fonts and hand-written CSS with defined colors; avoid external assets and frameworks (Added 2025-11-27; Completed 2025-11-27)
- [x] P0 Support light/dark themes via CSS variables or direct rules; toggle by root class (Added 2025-11-27; Completed 2025-11-27)
- [x] P0 Style messages as separated rounded rectangles; show edited label near timestamp (Added 2025-11-27; Completed 2025-11-27)

# Architecture & Startup
- [x] P0 Organize modules (filesystem.js, workspace.js, ui.js, formatting.js, main.js) with ES module imports (Added 2025-11-27; Completed 2025-11-27)
- [x] P0 Initialize app on DOMContentLoaded; manage state for workspace handle, messages array, preferences, and editing state (Added 2025-11-27; Completed 2025-11-27)
- [x] P0 Detect unavailable file APIs at startup and show clear unsupported-browser message (Added 2025-11-27; Completed 2025-11-27)

# Testing & Validation
- [ ] P0 Manually exercise scenarios: first-time workspace creation, posting text, formatting/link, attachments, editing, and workspace switching (Added 2025-11-27)
  - note: Not yet exercised in this session.
- [ ] P0 Test permission revocation and recovery, message deletion behavior, and persistence across reloads (Added 2025-11-27)
  - note: Not yet exercised in this session.

# New Feature Requests
- [x] P0 Enable selecting specific or all messages and copying their text as rich text to clipboard (Added 2025-11-27; Completed 2025-11-27)
