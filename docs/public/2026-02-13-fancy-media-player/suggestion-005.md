2026-02-13
A00 Implementation directives and risk register (rev 00)

This document is a directive addendum for the implementer of 2026-02-13-fancy-media-player. It exists to prevent partial implementations, silent scope drift, and quality regressions caused by “fast path” coding decisions. It defines non-negotiable directives, enumerates common failure modes, and gives concrete mitigations. It does not provide full code.

B00 Directives for the coding agent (rev 00)

B01 Directive 1: Implement the full feature surface as specified

All features explicitly defined in the technical specification, UX specification, settings specification, and visualization specification must be implemented. “Close enough” substitutions are disallowed. Specifically required deliverables include at minimum:

Folder selection via directory picker, recursive incremental traversal, non-blocking scanning with live progress counters, single playlist with folder grouping, playability classification and disabled rows, audio-only playback including audio-from-video-containers without rendering video, auto-advance skipping unplayables, selection via checkboxes with deterministic copy of relative paths and filenames, non-modal error banner, and the oscillogram visualization with macro envelope, live waveform, and spectrum bars plus playhead.

If any feature is not implemented, it must be explicitly called out as a missing requirement in the final output with a reason, and the implementation must include scaffolding hooks showing where it belongs. Silent omission is disallowed.

B02 Directive 2: Preserve responsiveness under large folder loads

The implementation must remain responsive during scanning of very large directory trees and during ongoing playback plus visualization. The UI must not freeze. All heavy work must be incremental or offloaded. A blocking traversal, building huge DOM at once, or per-frame allocations in the render loop are disallowed.

The implementer must include explicit yielding in traversal and bounded concurrency for metadata and duration probes. Rendering must be requestAnimationFrame-driven with complexity degradation rather than input lag.

B03 Directive 3: Enforce deterministic state and observable outcomes

Core behaviors must be deterministic: relative path format, sorting rules, duplicate rules, selection persistence, auto-advance skipping, copy formatting, and playability labeling. Any ambiguous behavior must be resolved exactly as specified, not “whatever is easiest.”

State transitions must be explicit and debuggable. The implementer must define a small state machine (Empty, Scanning, Ready, Playing, Paused, Error) and ensure UI enabled/disabled behavior matches the state.

B04 Directive 4: Do not exceed scope

Do not add features not asked for (for example multi-playlists, tag editing, waveform zoom, streaming, search-as-you-type with complex scoring) unless they are strictly internal refactors. Extra features increase risk. Focus on correctness and performance.

B05 Directive 5: No absolute local paths and no auto-opening folders

The implementation must never claim or attempt to obtain absolute OS file paths. Clipboard “path” output must be relative to the selected folder, using forward slashes. The implementation must not auto-open a folder from URL parameters or without user gesture.

B06 Directive 6: Instrument quality checks

The implementation must include lightweight diagnostics visible in the UI (or behind a single debug toggle) to verify: scan yielding is occurring, item counts match expectations, and rendering loop is not allocating. The goal is quick verification, not a developer console-only story.

C00 Risk register and mitigation guidance (rev 00)

C01 Risk: UI freezes during scan due to synchronous recursion or heavy DOM creation

Failure mode: traversal implemented as synchronous recursion or large arrays built and rendered in one pass. Browser becomes unresponsive for seconds/minutes on big folders.

Mitigation: implement async iteration with periodic yielding, batch updates to UI, and incremental render. Use a buffered queue of discovered items and flush to the DOM on a timer or animation frame with a per-flush cap. Apply list virtualization when row count is large. Keep per-item data minimal until needed.

C02 Risk: Memory blow-up from retaining File objects or object URLs

Failure mode: storing File blobs for every item or not revoking object URLs; memory usage grows and tab crashes.

Mitigation: store only handles and metadata fields. Obtain File objects only on demand for playback, duration probe, or metadata parse. Revoke object URLs immediately after they are no longer needed. Ensure the player uses at most one active object URL for the current track.

C03 Risk: Incorrect assumption that extension implies playability

Failure mode: mark items playable based only on extension and then playback fails, confusing users.

Mitigation: treat extension as candidate only. Use canPlayType for first-pass classification and promote/demote based on definitive load attempt. Show statuses Playable, Maybe, Unsupported, Error exactly as specified. Disabled rows must not start playback.

C04 Risk: Wrong “path” semantics and user confusion

Failure mode: UI displays or copies something that looks like an OS path, or mixes separators, or changes output based on platform.

Mitigation: enforce a single path format: relativePath from root, forward slashes, stable across all environments. Label copy action outputs explicitly as relative paths. Never display fake absolute paths.

C05 Risk: Scan progress feels fake or confusing

Failure mode: progress indicator shows vague spinner without numbers, or counters update sporadically, or “playable” count is inconsistent due to late probing.

Mitigation: maintain explicit counters (indexed, candidates, playable by canPlayType, errors). Update at a regular cadence (for example once per 100-200 files). If counts are derived in phases, label them consistently and do not change definitions mid-scan.

C06 Risk: Duplicate grouping causes loss of visibility or breaks selection/copy determinism

Failure mode: grouping/hiding duplicates changes what gets copied, or hidden items cannot be selected, or representative selection appears arbitrary.

Mitigation: implement duplicateKey strategies precisely. Ensure grouping/hide modes preserve access to all items. Selection must operate at item level and persist even when items are hidden by collapse or group. Copy must operate on selected items only, in playlist order, and must not implicitly include hidden items.

C07 Risk: Folder ignore rules skip user content unexpectedly

Failure mode: overly broad ignore patterns hide legitimate music folders.

Mitigation: ignore rules must be exact folder-name matches. Defaults must be conservative (.git, node_modules, __MACOSX). No wildcard or substring matching in rev 00. Any skipped folder should be countable in diagnostics (for example “Skipped folders: N”) to aid user understanding.

C08 Risk: Sorting instability during incremental scan

Failure mode: list reorders continuously as new items arrive; user loses track of selection and focus.

Mitigation: for traversal order, append-only behavior during scan. For other sorts, either defer full sort until scan completes or apply sort in controlled batches with stable tie-breakers. Preserve current focus row by item identity, not by index.

C09 Risk: Playback state conflicts with ongoing scan updates

Failure mode: re-render of playlist interrupts playback or resets UI indicators.

Mitigation: isolate playback engine state from list rendering. Playback must continue regardless of list updates. Identify items by stable id (for example relativePath) and keep playing indicator bound to the current item id.

C10 Risk: AudioContext restrictions and silent visualization

Failure mode: visualization does not run because AudioContext is suspended until user gesture; analyser reads zeros; user sees empty graph.

Mitigation: create and resume AudioContext on a user gesture tied to Open folder or first Play action. Explicitly call audioCtx.resume() on play attempts. If resume fails, show a non-modal error banner and disable visualization with a clear message.

C11 Risk: CORS/security misunderstandings about local file access

Failure mode: developer attempts to fetch local files by URL or assumes file:// paths; breaks in browsers.

Mitigation: all file access must occur via FileSystem handles and File objects returned by getFile(). No network fetch, no file:// usage, no query-param paths.

C12 Risk: Metadata parsing blocks UI or causes long jank spikes

Failure mode: parsing tags for many files on the main thread; UI becomes laggy.

Mitigation: enforce bounded concurrency (max 2) and defer parsing based on Settings.metadata.extractWhen. Prefer Worker-based parsing when implemented. Ensure row updates do not cause reflow storms; update only the affected row fields.

C13 Risk: Duration probing spawns too many media elements or leaks event handlers

Failure mode: probing creates many <audio> elements, attaches handlers, and never releases; memory and CPU rise.

Mitigation: use a small probe pool with strict concurrency (max 2). Ensure each probe removes src, calls load(), removes event listeners, and revokes object URL.

C14 Risk: Canvas rendering causes CPU spikes, allocations, and input lag

Failure mode: per-frame allocations, excessive bar counts, high DPI redraw without scaling discipline.

Mitigation: preallocate typed arrays, avoid object creation in render loop, implement frame limiter and complexity reduction. Use devicePixelRatio scaling properly. Avoid expensive text drawing per frame. Disable optional overlays first when degrading.

C15 Risk: Visualization provides only “pretty” output, not information

Failure mode: smooth animation that does not reflect dynamics or frequency distribution meaningfully.

Mitigation: implement the three-band composition: macro envelope history, oscillogram waveform, spectrum columns. Add playhead line and peak/clipping indicators. Ensure silence shows near-flat outputs; loud sections show clear amplitude; bass-heavy shows left-weighted spectrum.

C16 Risk: Disabled state inconsistencies and surprising controls

Failure mode: user can click Copy with nothing selected, seek without duration, play unsupported rows, or controls disappear.

Mitigation: define enabled/disabled rules per state. Copy actions enabled only when selection count > 0. Seek enabled only when duration known. Play action enabled only when a playable item is current or loaded. Disabled controls remain visible.

C17 Risk: Error handling becomes modal or disruptive

Failure mode: alert() popups, blocking dialogs, or navigation away from the app on errors.

Mitigation: all errors use a non-modal banner. Per-item errors are row-level. Provide a single “Re-open folder” action when permission issues occur.

C18 Risk: Missing accessibility basics harms usability for power users

Failure mode: keyboard navigation broken; focus lost; no visible focus ring.

Mitigation: implement deterministic keyboard navigation for the playlist and transport controls. Ensure focused row is visible. Keep focus stable through re-renders. Use ARIA roles sparingly but correctly for grid semantics if possible; do not overcomplicate.

D00 Verification checklist for implementer self-audit (rev 00)

Before declaring completion, the implementer must verify:

Folder selection requires user gesture and uses directory picker.

Scanning continues without freezing and counters update continuously.

Playlist shows folder grouping, supports collapse, and preserves selection while scanning.

At least one track can be played before scanning completes.

Unsupported rows are disabled for playback but selectable for export.

Copy relative paths produces forward-slash relative paths only, deterministic order, correct line endings and quoting per settings.

Duplicate modes behave exactly as specified, including skip rules and override gesture.

Visualization shows envelope history, waveform, spectrum bars, playhead, and clipping/peak cues, and does not cause input lag.

Object URLs are revoked and memory does not grow unbounded during extended use.

AudioContext is resumed correctly and visualization is active during playback.
