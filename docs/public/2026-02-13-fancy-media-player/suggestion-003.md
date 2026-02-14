A00 Settings and annoyance-resolution UX specification (rev 00)

This document specifies a settings layer for 2026-02-13-fancy-media-player that reduces repetitive, annoying friction while staying within the existing scope: a single folder session, recursive incremental indexing, one playlist view, audio-only playback, selection and clipboard export, and best-effort metadata. The intent is to solve problems that occur repeatedly in real folder-based auditioning workflows, without turning the product into a library manager.

The settings defined here are constrained to three categories of effect: what becomes a playlist candidate during traversal, how candidates are presented and ordered, and how playback and export behave. All settings must be explainable in one sentence in the UI and must have deterministic observable outcomes.

B00 Settings UX surface and interaction model (rev 00)

B01 Settings entry point and layout

The UI must provide a single settings entry point labeled “Settings” in the top status strip, placed on the far right after the selection/copy controls. Clicking it opens a non-modal settings drawer that slides in from the right edge and does not cover the playlist entirely on wide screens. On narrow screens, the drawer may cover the main content area but must include a visible close affordance.

The settings drawer must use compact controls and must not require scrolling for the most common toggles (duplicate behavior, hide unsupported, ignore folders, copy format). If additional settings exceed the viewport, the drawer body may scroll while keeping the drawer header fixed.

B02 Apply semantics

All settings must apply immediately on change, with no “Save” button. Settings that affect traversal candidates must trigger a re-evaluation of the current in-memory index without re-opening the folder, whenever possible. If a change cannot be applied without re-traversing (for example, newly enabling an extension that was never collected as a candidate), the UI must show a small inline note: “Requires re-scan to include previously ignored files,” and must present a “Re-scan” button that restarts traversal using the existing root handle if still permitted.

B03 Settings visibility and defaults

The drawer must show defaults explicitly as current selections. Defaults must be chosen to optimize the most common “music folder” case while staying predictable for QA users. Where two workflows conflict (for example, QA wants to see unsupported files while auditioning wants them hidden), the default must preserve information (show unsupported) but provide a one-click toggle to hide them.

B04 Settings implementation model

Settings must be represented as a single plain JavaScript object named Settings. The file must contain a clearly labeled DEFAULT_SETTINGS constant. The implementation must treat Settings as the source of truth and must not hardcode behavior elsewhere without referencing Settings.

Reference structure sketch:

```js
const DEFAULT_SETTINGS = {
  candidates: {
    allowedExtensions: ['mp3','m4a','aac','flac','wav','ogg','oga','opus','webm','weba','mp4','m4v','ogv'],
    ignoreFolderNames: ['.git','node_modules','__MACOSX','.DS_Store','Thumbs.db'],
    minFileSizeBytes: 0
  },
  duplicates: {
    mode: 'highlight',                 // 'off' | 'highlight' | 'group' | 'hide'
    key: 'filenameNoExt',              // 'filename' | 'filenameNoExt' | 'normalizedName' | 'tagTitleArtist'
    playback: 'playAll',               // 'playAll' | 'skipAfterFirstPlay' | 'skipAlways'
    representative: 'firstEncountered'  // 'firstEncountered' | 'preferredExtension' | 'shortestPath'
  },
  view: {
    groupByFolder: true,
    defaultSort: 'traversal',          // 'traversal' | 'filename' | 'duration' | 'size' | 'tagTitle'
    hideUnsupported: false
  },
  playback: {
    autoAdvance: 'nextPlayable',       // 'nextPlayable' | 'stopAtEnd' | 'loopTrack'
    playbackRate: 1.0
  },
  metadata: {
    extraction: 'basic',               // 'off' | 'basic' | 'artwork'
    extractWhen: 'onDemandVisible'      // 'onDemandVisible' | 'nowPlayingPlusLookahead' | 'backgroundAll'
  },
  export: {
    copyPathsFormat: 'relative',        // 'relative' | 'relativeQuoted'
    lineEndings: 'lf'                  // 'lf' | 'crlf'
  }
};
```

C00 Duplicate handling specification (rev 00)

C01 Problem statement

Users often encounter multiple tracks that appear identical (same title or filename) but originate from different folders or versions. The annoyance is twofold: the user wastes attention determining whether an item is new, and the user cannot quickly choose whether to audition duplicates or skip them while still being able to see them.

C02 Duplicate key definitions

The application must compute a duplicateKey for every indexed candidate using the selected key strategy:

If key is filename, duplicateKey is the lowercase file name including extension.

If key is filenameNoExt, duplicateKey is the lowercase filename without the final extension.

If key is normalizedName, duplicateKey is filenameNoExt lowercased with normalization rules applied. Normalization must strip common copy/version suffixes at the end of the name. Rev 00 normalization rules are deterministic and limited: trim whitespace; remove trailing patterns matching “ (number)”, “ copy”, “ - copy”, “ final”, “ vnumber”, “ - vnumber”, “ _vnumber”, where number is 1-4 digits. The implementation must not attempt fuzzy matching beyond these exact patterns.

If key is tagTitleArtist, and both title and artist tags exist and are non-empty, duplicateKey is “title||artist” lowercased, with internal whitespace collapsed to single spaces. If tags are missing, fall back to filenameNoExt.

C03 Duplicate detection and stable ordering

Duplicates are defined as multiple items sharing the same duplicateKey. Duplicate grouping must be recomputed whenever the setting changes, but it must preserve a stable internal order within a duplicate set based on traversal order unless a representative selection mode requires otherwise.

C04 Duplicate presentation modes

Mode off means no duplicate-specific UI.

Mode highlight means any item that has at least one sibling with the same duplicateKey must display a subtle “dup” indicator in the status column and may optionally show “dup N” where N is the size of the duplicate set.

Mode group means the playlist shows a single group row per duplicateKey, with children indented beneath. The group row must display the display name and an indicator “N variants”. Expanding shows all variants; collapsing hides them. Group rows are not playable. Selecting a group row must not affect playback, but group rows may support “select all children” via their checkbox if implemented; if not implemented, group rows have no checkbox.

Mode hide means only one representative item per duplicateKey is visible in the main list. Hidden duplicates are not lost: the representative row must show “+N hidden duplicates” with a control “Show” that expands to reveal the hidden items inline. This prevents the user from losing awareness that duplicates exist.

C05 Duplicate playback rules

Playback setting playAll means playback order uses the visible playlist order only. If duplicates are grouped or highlighted, they remain playable and are not skipped.

Playback setting skipAfterFirstPlay means once a duplicateKey has been played successfully in this session, subsequent items with the same duplicateKey must be skipped by auto-advance. Manual double-click must override skipping and play immediately.

Playback setting skipAlways means auto-advance always skips items whose duplicateKey has already been played at least once, and manual attempts to play a duplicate must display a small inline warning in the player pane: “Duplicate skipped by rule. Hold Alt and double-click to force play.” Rev 00 requires an explicit override gesture; Alt+double-click is the mandated override. If the platform does not support Alt reliably, implement Ctrl+double-click as a fallback.

C06 Representative selection rules for hide mode

If representative is firstEncountered, the first item in traversal order is the representative.

If representative is preferredExtension, the representative is the first item whose extension appears earliest in a preference list. Rev 00 preference list is Settings.candidates.allowedExtensions order. If multiple items share the same extension, choose first encountered.

If representative is shortestPath, the representative is the item with the lexicographically smallest relativePath. Ties break by traversal order.

C07 UX expectations

Duplicate indicators must be visible without requiring hover. Grouping and hiding must never change the underlying relativePath of any item. Copy operations must remain deterministic: if a hidden duplicate is not visible, it must not be copied unless the user explicitly selects it via an expanded view.

D00 File noise reduction and candidate control specification (rev 00)

D01 Problem statement

Users open messy folders that contain non-audio clutter, hidden system directories, development artifacts, and tiny stub files. The annoyance is wasted scrolling, slower scanning, and confusion when irrelevant entries appear in a listening tool.

D02 Allowed extension list as the primary gate

The application must treat Settings.candidates.allowedExtensions as the authoritative allowlist for candidate discovery. Any file whose extension is not in this list must not appear in the playlist at all. This is a deliberate choice to keep behavior simple and predictable. The allowlist is edited in code by default, but the settings UI must allow toggling entries on/off for the session without requiring source edits.

The allowlist UI must present extensions as compact toggle chips, for example “mp3”, “m4a”, “flac”. Disabling an extension must immediately hide already indexed items of that extension and prevent future additions during the current scan.

D03 Ignore folder names

Traversal must skip any directory whose name exactly matches an entry in Settings.candidates.ignoreFolderNames (case-sensitive for dot-prefixed names, case-insensitive otherwise). Skipped folders must not be traversed recursively.

The default ignoreFolderNames must include at minimum: .git, node_modules, __MACOSX. Additional default entries may include typical OS clutter markers, but the behavior must be conservative: do not skip user content folders by pattern. The ignore list UI must allow adding and removing exact folder names.

D04 Minimum file size filter

If Settings.candidates.minFileSizeBytes is greater than zero, any candidate file smaller than that value must not appear in the playlist. This filter is evaluated using File.size during indexing and does not require decoding. The settings UI must offer a numeric input with common presets (for example 0, 50 KB, 200 KB, 1 MB) but the stored value is bytes.

D05 Hide unsupported toggle

Settings.view.hideUnsupported controls presentation only. Unsupported items are still discovered and remain in the internal index. When hideUnsupported is true, rows with status Unsupported or Error are hidden from the playlist view. The status strip must still show counts for unsupported and errors even when hidden, so users remain aware that hiding is active.

E00 Ordering and discovery settings specification (rev 00)

E01 Problem statement

In large hierarchies, users repeatedly waste time locating items. Traversal order is often not the most useful ordering. The annoyance is compounded when the user has to reorient after collapsing folders or when the playlist changes during scanning.

E02 Group by folder

Settings.view.groupByFolder controls whether the playlist is grouped under folder header rows. When enabled, the view groups by immediate containing folder relative to the root, as previously specified. When disabled, the list is flat and folder information appears as a compact “folder” column or a secondary text in the name column. Rev 00 mandates a folder column in flat mode so the user can still disambiguate duplicates.

E03 Default sort

Settings.view.defaultSort defines the sort key for items within the current view. The sort must apply within each folder group when groupByFolder is true, and across the entire list when false.

Traversal sort preserves discovery order and must be stable even as new items are appended during scanning.

Filename sort uses case-insensitive locale-agnostic comparison on the filename (not the full path) and breaks ties by relativePath.

Duration sort uses numeric duration ascending with unknown durations placed last. Break ties by filename then relativePath.

Size sort uses numeric size ascending with ties broken by filename then relativePath.

Tag title sort uses extracted tag title when available; otherwise falls back to filenameNoExt. This sort must not trigger tag extraction; it only uses what is already available.

E04 Folder collapse persistence within the current scan

When scanning is ongoing, collapsing a folder group must remain collapsed even as new items are discovered for that folder. The implementation must store collapse state keyed by folder relative path.

F00 Playback flow settings specification (rev 00)

F01 Problem statement

Users repeatedly encounter friction in basic playback flow: deciding whether to stop at track end, loop, or continue; previewing spoken audio faster; and controlling behavior without hunting for controls.

F02 Auto-advance mode

Settings.playback.autoAdvance defines end-of-track behavior.

nextPlayable must advance to the next playable item and skip unsupported items and items skipped by duplicate playback rules.

stopAtEnd must stop playback at track end and keep the current row as focused.

loopTrack must restart the current track from time 0 without changing focus or selection.

F03 Playback rate

Settings.playback.playbackRate sets mediaElement.playbackRate and must be applied immediately when changed. The UI must expose playback rate as a compact selector in the player pane, with common values 0.75, 1.0, 1.25, 1.5, 2.0. The default is 1.0. Rate changes must not affect duration display.

G00 Metadata and export settings specification (rev 00)

G01 Problem statement

Users want identity cues (title, artist) and sometimes artwork, but metadata parsing can be slow and inconsistent. Users also want clipboard output tailored for scripts or documents without having to manually edit every paste.

G02 Metadata extraction level

Settings.metadata.extraction controls which tag fields are attempted.

off means no tag parsing, ever. The UI must then rely on filenames and duration/size only.

basic means parse text tags (title, artist, album, track number, year). Artwork is not extracted.

artwork means parse basic plus embedded artwork when available, but artwork extraction must be bounded and must not block scanning or playback.

G03 Metadata extraction timing

Settings.metadata.extractWhen controls when parsing jobs are scheduled.

onDemandVisible means parse only for rows that are currently visible in the playlist viewport and for the currently playing track. Visibility is evaluated after filtering and sorting.

nowPlayingPlusLookahead means parse the current track immediately on play, and parse the next K playable tracks in the current playback order (K default 5). This supports continuous listening with minimal background work.

backgroundAll means parse for all candidates with bounded concurrency. Concurrency must be limited to avoid UI degradation. Rev 00 requires a maximum of 2 concurrent tag parses.

G04 Export formatting

Settings.export.copyPathsFormat controls whether copied paths are raw relative paths or quoted. Quoted format wraps each path in double quotes and escapes any existing double quotes within the path as backslash-quote. This is designed for shell and scripting contexts.

Settings.export.lineEndings controls output joining. lf joins lines with “\n”. crlf joins with “\r\n”.

Reference export snippet:

```js
function formatLines(lines, { lineEndings }) {
  const sep = lineEndings === 'crlf' ? '\r\n' : '\n';
  return lines.join(sep);
}

function quotePath(p) {
  return `"${String(p).replaceAll('"', '\\"')}"`;
}

function buildCopyPaths(items, exportSettings) {
  const lines = items.map(it => exportSettings.copyPathsFormat === 'relativeQuoted' ? quotePath(it.relativePath) : it.relativePath);
  return formatLines(lines, exportSettings);
}
```

G05 UX expectations

Metadata settings must never create the impression that tags are guaranteed. The UI must remain consistent when tags arrive asynchronously: a row may update its display name and artist text when tags are parsed, but row height must not jump. If artwork is enabled, artwork must load lazily for the now playing track first.

Export settings must make the clipboard output predictable. The copy confirmation must state both the count and the format, for example “Copied 12 relative paths (quoted)”.
