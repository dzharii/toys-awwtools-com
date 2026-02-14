# 2026-02-13 Fancy Media Player

A static, folder-scoped, audio-first media player for large local media trees.

## Highlights
- Open a folder with the File System Access API and index recursively with live progress.
- Dense playlist with folder grouping, collapse, keyboard navigation, and checkbox selection.
- Playability labeling (`Playable`, `Maybe`, `Unsupported`, `Error`) with audio-only playback.
- Deterministic copy/export for selected relative paths or filenames.
- Settings drawer for duplicate handling, filtering, sorting, metadata timing, and export formatting.
- Canvas visualization with macro envelope, live oscillogram, spectrum bars, playhead, and clipping cues.

## Notes
- Paths are always relative to the selected folder (never absolute OS paths).
- Metadata extraction is best-effort and runs in a worker with bounded concurrency.
- Browser target is modern Chromium with `showDirectoryPicker` support.
