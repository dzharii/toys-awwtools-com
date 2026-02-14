2026-02-13
A00 Acknowledgement and purpose (rev 00)

Acknowledgement: I understand and will follow the documentation style and quality standard you specified (implementation-ready, deterministic rules, stable section codes, professional tone, minimal guesswork).

This specification defines a static, vanilla HTML/CSS/JavaScript web application named 2026-02-13-fancy-media-player. The application is an audio-first media player that loads a user-selected folder, recursively enumerates supported media files, builds a single playlist, and plays items with a modern, space-efficient UI and a digital audio visualization.

The primary value is fast, low-friction review of audio files stored in a folder hierarchy. The intended users are experienced/professional users who prefer an information-dense interface (Foobar2000-like) with clear progress feedback, fast keyboard/mouse navigation, and practical utilities such as selecting multiple tracks and copying their paths/names for downstream processing.

B00 Scope and non-goals (rev 00)

In scope: folder selection via modern browser file APIs, recursive enumeration, incremental scanning with visible progress, single playlist, audio playback, next-track progression, digital waveform/spectrum visualization, selection and clipboard export of selected items, display of human-friendly file info (size, duration), and best-effort extraction of common audio metadata (title, artist, album, track number, embedded artwork) when feasible.

Out of scope: multi-playlist management, library databases across multiple roots, tag editing, file writing or deletion, network streaming, lyrics, equalizer presets UI, advanced search queries, and video rendering. Video files may be accepted only as "audio source containers" (play audio track only) but must not display video frames.

C00 Supported platforms and required web APIs (rev 00)

The application targets modern desktop Chromium-based browsers with File System Access API support. Folder access must be initiated by explicit user interaction through the directory picker. The application must not attempt to open local folders automatically from URL parameters, and must not claim access to local paths without user selection.

Folder enumeration uses File System Access API handles and directory iteration, as described by Chrome documentation. ([Chrome for Developers][1])

Playback capability checks use HTMLMediaElement.canPlayType(). ([MDN Web Docs][2])

Optional enhanced capability checks use Media Capabilities API decodingInfo() for "supported/smooth/powerefficient". ([MDN Web Docs][3])

D00 Privacy and path model (rev 00)

D01 Absolute local filesystem paths

The application must assume it cannot obtain absolute OS filesystem paths (for example C:... or /Users/...). All "paths" shown or copied by the application must be virtual paths relative to the selected root folder.

Rationale: the File System Access API exposes handles, names, and relative resolution, not absolute local paths. The existence of an open issue requesting absolute paths indicates this is not a provided feature. ([GitHub][4])

D02 Relative path computation rule

Each playlist item must have a stable "relativePath" computed as path segments joined by "/". The relativePath must be computed during traversal as the traversal prefix plus file name. Additionally, the implementation may compute a relative path from a root handle to a child handle via resolve() when needed. ([MDN Web Docs][5])

D03 Clipboard export path format

When copying "file path", the application must copy the relativePath only. The UI must label this as "Relative path" to avoid implying OS absolute paths.

E00 Application states and transitions (rev 00)

E01 State set

The application must implement the following observable states:

1. Empty: no folder selected, playlist empty.
2. Scanning: folder selected, enumeration in progress.
3. Ready: enumeration complete, playlist available, nothing playing.
4. Playing: an item is currently playing.
5. Paused: playback paused with a current item selected.
6. Error: a non-fatal error occurred; the application continues operating and shows an error banner.

E02 Transitions

Empty -> Scanning occurs only after user activates "Open folder" and completes a directory selection.
Scanning -> Ready occurs when traversal completes (all reachable entries processed).
Ready/Paused/Playing -> Scanning occurs when user selects a new folder (this must clear the prior playlist and stop playback).
Ready -> Playing occurs when user activates an item (double-click, Enter, or Play control).
Playing -> Paused occurs on Pause control.
Playing -> Ready occurs when Stop is invoked (Stop is optional; if omitted, "Pause" + "seek to 0" is acceptable).
Playing -> Playing occurs on auto-advance when a track ends and a next playable item exists.
Playing -> Ready occurs on track end when no next playable item exists.
Any state -> Error occurs on unexpected exceptions, permission loss, or decode failure; Error must not block other actions except those that depend on the failed resource.

F00 UI layout and interaction rules (rev 00)

F01 Global layout

The UI must be single-page, full-viewport, with no wasted space. Padding must be minimal and functional. The default layout on wide screens must be two panes:

Left pane: playlist grid occupying the majority of the width.
Right pane: playback controls and visualization, vertically stacked.

On narrow screens, the layout must stack vertically: controls/visualization first, playlist below. The playlist must remain scrollable and take the remaining space.

F02 Top status strip

A compact status strip must appear at the top edge and include:

Open folder button (always visible).
Scan progress indicator in the top-left region (text form). It must show "Scanning: X files indexed" and, if available, "Y playable" and "Z errors". The indicator must be visible only in Scanning state; it must not be modal.

F03 Playlist grid

The playlist must be a dense grid reminiscent of Foobar2000. Each row represents one file. The grid must support:

Row selection with a checkbox column (for multi-select export).
Current item highlight (distinct from checkbox selection).
Sortable columns are optional; default ordering must be stable and derived from traversal order grouped by folder.

F04 Folder grouping rule

Items must be grouped by their immediate containing folder relative to root. The grid must display a non-selectable "folder header row" before items belonging to that folder. Folder headers must be collapsible; default expanded. Collapsed folders must not render their child rows.

F05 Enabled/disabled rules per item

If an item is determined "unplayable", its row must still appear but must show a clear disabled visual state and must not start playback on activation. It must remain selectable for copy operations.

G00 Folder selection and incremental indexing (rev 00)

G01 Folder selection

Folder selection must use the directory picker and must require a user gesture. The app must not attempt to auto-open a folder based on URL parameters. ([Chrome for Developers][1])

G02 Recursive traversal requirements

Traversal must be recursive through all subdirectories. Traversal must be incremental and must not block the UI thread for extended periods. The implementation must yield to the event loop regularly.

G03 Incremental processing rule

The traversal loop must process entries in batches and yield at least every 10-20 ms of work or every 200 entries, whichever comes first. Yielding may be implemented via await on a zero-timeout promise, requestIdleCallback, or similar.

G04 Data captured during initial indexing

During initial indexing, the application must capture only cheap, non-decoding data:

relativePath (as defined in D02)
fileName (the last segment)
fileSizeBytes
fileTypeHint (File.type if present, else empty)
containerExtension (lowercased extension, else empty)
handle reference (FileSystemFileHandle) for later getFile()

Duration and tags are deferred (see J00).

G05 Progress accounting

During Scanning, the UI must update counters live:

indexedCount increments per file discovered.
playableCandidateCount increments per file that matches extension allowlist.
playableConfirmedCount increments per file confirmed playable by canPlayType or playback probe (depending on chosen strategy).
errorCount increments on any file read/probe failure, but must not abort traversal.

H00 Format allowlist and runtime playability checks (rev 00)

H01 Extension allowlist purpose

The extension allowlist is a superset used to decide what to probe and display as candidate media files. Actual playability must be determined by runtime checks. Extensions are not authoritative.

H02 Candidate extensions

The application must treat the following as candidate media files (audio-first plus common audio-in-video containers):

Audio-first candidates: .mp3, .m4a, .aac, .flac, .wav, .ogg, .oga, .opus, .webm, .weba, .mp4
Audio-in-video container candidates (audio only): .m4v, .ogv

H03 MIME guessing table

The app must map extensions to a best-effort MIME string. The mapping must be used only for canPlayType probing and may fall back to File.type when present.

Reference implementation snippet:

```js
const EXT_TO_MIME = {
  mp3:  'audio/mpeg',
  m4a:  'audio/mp4',
  mp4:  'audio/mp4',
  m4v:  'video/mp4',
  aac:  'audio/aac',
  wav:  'audio/wav',
  flac: 'audio/flac',
  ogg:  'audio/ogg',
  oga:  'audio/ogg',
  opus: 'audio/ogg; codecs="opus"',
  webm: 'audio/webm',
  weba: 'audio/webm',
  ogv:  'video/ogg'
};

function getExt(name) {
  const m = /\.([^.]+)$/.exec(name.toLowerCase());
  return m ? m[1] : '';
}

function guessMime(file) {
  const ext = getExt(file.name);
  return file.type || EXT_TO_MIME[ext] || '';
}
```

H04 Primary playability check

The app must use HTMLMediaElement.canPlayType() to classify a file as:

playable-probably if result is "probably"
playable-maybe if result is "maybe"
unplayable if result is empty string

canPlayType is the normative first pass. ([MDN Web Docs][2])

Reference snippet:

```js
const audioEl = document.createElement('audio');
const videoEl = document.createElement('video'); // used only for containers

function canPlay(mime, kind) {
  const el = kind === 'video' ? videoEl : audioEl;
  const r = mime ? el.canPlayType(mime) : '';
  return r; // 'probably' | 'maybe' | ''
}
```

H05 Container fallback rule

If an extension maps to a video MIME (for example video/mp4 or video/ogg), the app must probe with a hidden <video> element, but must still play audio-only by routing the media element output to audio visualization and not rendering video. Playback UI must remain audio-only.

H06 Definitive playback probe rule

For items classified playable-maybe, the app must optionally perform a definitive probe when the user attempts to play or when the item is first brought into view. The definitive probe must set the media element src to an object URL and wait for either loadedmetadata or error.

The loadedmetadata event is the required success signal. ([MDN Web Docs][2])

Reference snippet:

```js
async function probePlayableByLoad(file, useVideo) {
  const el = useVideo ? document.createElement('video') : document.createElement('audio');
  el.preload = 'metadata';
  const url = URL.createObjectURL(file);
  try {
    return await new Promise((resolve) => {
      const done = (ok) => {
        el.removeAttribute('src');
        el.load();
        URL.revokeObjectURL(url);
        resolve(ok);
      };
      el.onloadedmetadata = () => done(true);
      el.onerror = () => done(false);
      el.src = url;
    });
  } catch {
    URL.revokeObjectURL(url);
    return false;
  }
}
```

H07 Optional MediaCapabilities check

If implemented, MediaCapabilities.decodingInfo() may be used to decide whether to attempt definitive probing in advance, and to annotate items as likely-smooth or likely-power-inefficient. It must not be the only check. ([MDN Web Docs][3])

I00 Playback engine and playlist behavior (rev 00)

I01 Playback element

The application must use a single shared media element (<audio> or <video> depending on current item container) as the source of truth for play/pause/time/duration.

I02 Auto-advance rule

When a track ends, the player must advance to the next item in playlist order that is not disabled (playable). If no subsequent playable item exists, playback must stop and state must become Ready with the last item still marked as current.

I03 Activation rules

Double-click on a playable row must start playback of that row immediately.
Enter on a focused playable row must start playback.
Single-click selects focus/current row but must not start playback (unless the implementer chooses single-click play; default is no).

I04 Seek and time display

A compact seek bar must be present. It must show current time and duration in mm:ss. If duration is unknown, show "--:--". Seeking must be disabled until duration is known.

I05 Volume and mute

Volume slider and mute toggle must be present and compact. Volume changes must not reindex or disturb playlist state.

J00 Visualization (digital waveform/spectrum) (rev 00)

J01 Visualization requirements

The visualization must be always visible when a track is playing or paused, and may show an idle animation when nothing is loaded. It must have a modern digital aesthetic without excessive decoration. It must be information-dense and occupy the available right-pane space.

J02 Implementation requirement

The visualization must be implemented via Web Audio API AnalyserNode connected to the active media element. The analyser must support at least two modes:

Spectrum bars (frequency domain)
Waveform line (time domain)

Mode switching is optional; if only one is implemented, spectrum is preferred.

J03 Rendering performance rule

Rendering must use requestAnimationFrame and must target stable frame rates. When the tab is backgrounded, rendering must naturally throttle; do not run manual timers.

Reference snippet:

```js
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();
analyser.fftSize = 2048;

let sourceNode = null;

function attachMediaElement(mediaEl) {
  if (sourceNode) sourceNode.disconnect();
  sourceNode = audioCtx.createMediaElementSource(mediaEl);
  sourceNode.connect(analyser);
  analyser.connect(audioCtx.destination);
}

function renderSpectrum(canvas) {
  const ctx = canvas.getContext('2d');
  const data = new Uint8Array(analyser.frequencyBinCount);

  function frame() {
    analyser.getByteFrequencyData(data);
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const n = data.length;
    const barW = w / n;
    for (let i = 0; i < n; i++) {
      const v = data[i] / 255;
      const barH = v * h;
      ctx.fillRect(i * barW, h - barH, Math.max(1, barW), barH);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
```

K00 Metadata and human-friendly fields (rev 00)

K01 Minimal displayed fields

Each row must display:

Checkbox
Track display name
Relative folder (or folder group header)
Duration (mm:ss if known)
Size (humanized, base-2 units KiB/MiB/GiB or base-10 KB/MB/GB, choose one and be consistent; default base-2)
Playability status icon or text (Playable, Maybe, Unsupported)

K02 Duration extraction rule

Duration must be extracted lazily and with bounded concurrency to avoid UI stalls. At most 2 concurrent duration probes may run. Duration probing must use loadedmetadata on a detached media element with preload="metadata" and object URL, then revoke the URL.

K03 Tag metadata extraction rule

Tag extraction is optional but recommended. If implemented, it must parse common tags (at minimum: title, artist, album, track number, year if present). Tag parsing must be performed off the main thread in a Web Worker when possible, especially for large files. If parsing fails, fall back to filename as the track display name.

K04 Media Session integration

If metadata is available for the current track, the app should publish it via Media Session API so system media UIs show track info. ([MDN Web Docs][2])

L00 Selection, copy, and export behaviors (rev 00)

L01 Selection model

Checkboxes control a selection set independent of the current playing item. The current playing item may or may not be selected.

L02 Controls

The UI must provide compact controls:

Select all (selects all visible items in the playlist, including unplayable)
Clear selection
Copy selected relative paths (newline-separated)
Copy selected filenames (newline-separated)

L03 Clipboard rules

Clipboard operations must use navigator.clipboard.writeText where available. If the call fails, show a non-modal error banner and provide a fallback: display the text in a modal-free readonly textarea with "Press Ctrl+C" guidance.

L04 Path copy content

Copy selected relative paths must output each item.relativePath on its own line, using "/" separators exactly as stored.

M00 Performance and responsiveness requirements (rev 00)

M01 Non-blocking UI requirement

No single synchronous task may block the main thread for long enough to cause visible freezing during large folder indexing. Traversal must be incremental per G03, and heavy parsing must be deferred and/or moved to workers.

M02 Virtualization requirement

If the indexed file count exceeds 2000 rows, the playlist must use list virtualization or incremental DOM rendering to avoid layout thrash. The implementer may use a simple windowed rendering strategy without external libraries.

M03 Memory rules

Object URLs must be revoked after use. The player must not keep File objects for all items resident simultaneously; it must keep handles and request File objects on demand.

N00 Error handling and user feedback (rev 00)

N01 Error banner

Errors must be displayed as a compact banner area near the top status strip. The banner must not block interaction and must be dismissible.

N02 Per-item error marking

If a specific file fails to read, probe, or play, its row must be marked with an error state. The application must continue indexing and must allow selection/copy of that row.

N03 Permission loss

If access to a handle fails due to permission revocation, the application must mark affected items as error and show a banner instructing the user to re-open the folder.

O00 User workflows (rev 00)

O01 Load and play

User opens the site. The UI is Empty and shows an Open folder button. The user clicks Open folder, selects a directory, and confirms. The app enters Scanning, the progress counter increases live, and folder groups appear as they are discovered. The user can scroll the list while scanning continues. The user double-clicks a playable track; the app starts playback immediately, attaches the analyser, and renders the visualization. When the track ends, the app auto-advances to the next playable item.

O02 Select and copy paths

User loads a folder. The user checks several items across multiple folders. The user clicks Copy selected relative paths. The app writes a newline-separated list of relativePath values to the clipboard. If clipboard write fails, the app shows an error banner and renders the export text in a readonly area for manual copy.

O03 Unsupported files visibility

User loads a folder containing .flac and an unknown extension. The app lists .flac as candidates, probes them, and marks those supported as playable. Unknown extensions are not listed. If a listed candidate fails probing or playback, it is marked unsupported and disabled for playback but remains selectable for copy.

P00 Specification-by-example (rev 00)

P01 Relative path copy example

Given a root folder selection that contains subfolders AlbumA/Track01.mp3 and AlbumB/Live/Track02.flac, the application must copy exactly:

AlbumA/Track01.mp3
AlbumB/Live/Track02.flac

No absolute prefixes are allowed.

P02 Auto-advance example

Given playlist order: A (playable), B (unplayable), C (playable). If A ends, the next track started must be C.

P03 Scanning progress example

Given a folder with 50,000 files and 2,000 candidate extensions, the UI must remain responsive. The counter must increase steadily; the user must be able to scroll and initiate playback of already-indexed items while scanning continues.

Q00 Reference traversal implementation sketch (rev 00)

The following pattern satisfies recursive incremental traversal with relative paths:

```js
async function* walkDir(dirHandle, prefix = '') {
  for await (const [name, handle] of dirHandle.entries()) {
    const rel = prefix ? `${prefix}/${name}` : name;
    if (handle.kind === 'directory') {
      yield* walkDir(handle, rel);
    } else {
      yield { relPath: rel, fileHandle: handle };
    }
  }
}

async function indexFolder(rootHandle, onItem, onProgress, shouldYield) {
  let indexed = 0;
  const t0 = () => performance.now();
  let lastYieldAt = t0();

  for await (const entry of walkDir(rootHandle)) {
    indexed++;
    onItem(entry);
    onProgress({ indexed });

    if (shouldYield && (indexed % 200 === 0 || (t0() - lastYieldAt) > 16)) {
      lastYieldAt = t0();
      await new Promise(r => setTimeout(r, 0));
    }
  }
}
```

R00 Notes on directory-relative resolution (rev 00)

If the implementation needs to compute a relative path between a root directory handle and a file handle after the fact, it may use FileSystemDirectoryHandle.resolve(childHandle) which returns path segments relative to the directory handle. ([MDN Web Docs][5])

[1]: https://developer.chrome.com/docs/capabilities/web-apis/file-system-access?utm_source=chatgpt.com "The File System Access API: simplifying access to local files"
[2]: https://developer.mozilla.org/en-US/docs/Web/API/File_System_API?utm_source=chatgpt.com "File System API - MDN Web Docs"
[3]: https://developer.mozilla.org/en-US/docs/Web/API/MediaCapabilities/decodingInfo?utm_source=chatgpt.com "MediaCapabilities: decodingInfo() method - Web APIs | MDN"
[4]: https://github.com/WICG/file-system-access/issues/145?utm_source=chatgpt.com "The API should allow working with absolute paths #145"
[5]: https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryHandle/resolve?utm_source=chatgpt.com "FileSystemDirectoryHandle: resolve() method - Web APIs | MDN"
