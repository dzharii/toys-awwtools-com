# Browser Video Converter (FFmpeg WASM + Dexie)

Convert and compress phone videos directly in the browser—no uploads, no installs. This single-page app bundles FFmpeg compiled to WebAssembly and Dexie-powered IndexedDB storage so every operation stays on your device.

## What it does
- Import a video (drag/drop or picker), preview it instantly, and run one-click conversions using curated presets such as “Telegram-friendly 720p” or an alternative high-volume share profile.
- Track progress, see clear status messages, and download the converted output without leaving the tab.
- Maintain a local gallery of the last 20 conversions with thumbnails, metadata, and playback, plus inline delete controls—everything stored in IndexedDB via Dexie.

## How it works
- **FFmpeg WASM in a Web Worker** for heavy lifting; the main thread only orchestrates UI and messaging.
- **Dexie-managed storage worker** handles IndexedDB reads/writes off the UI thread.
- Pure vanilla stack: one HTML file, one CSS file, one JS entry point, plus worker scripts and the vendored FFmpeg/Dexie builds.
- Telemetry-friendly logging and progress watchdogs keep long-running conversions transparent, even for CPU-intensive codecs.

## Highlights
- Runs entirely offline/on-device; no data leaves your browser.
- Preset system is extensible and capability-aware (e.g., warns if a codec like libx265 is unavailable).
- Modern, responsive UI with dual video panes, live status, and a persistent conversion history sidebar.
- Friendly DX: clear separation between UI, conversion worker, and storage worker, making it easy to tweak presets or add future editing features.
