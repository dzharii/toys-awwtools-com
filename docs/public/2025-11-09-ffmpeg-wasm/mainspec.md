# Specification: Browser Video Converter With FFmpeg WASM and Dexie
Date: 2025-11-09


## 1. Purpose and vision

The goal is to build a small, focused, client-side web application for simple video conversion and light editing, running entirely in the browser. The application should:

* Let a user quickly and without friction upload a video file.
* Convert that video to predefined presets (for example, a 720p preset suitable for sending via Telegram) using FFmpeg compiled to WebAssembly.
* Store converted videos in IndexedDB using Dexie, keep only the last 20, and make them easily discoverable and playable from within the app.
* Present a clean, modern, and professional UI that clearly communicates what is happening, shows progress, and never confuses the user.
* Be designed and structured so that additional simple video editing features can be added in the future without major rewrites.

The implementer is expected to exercise their own professional judgement and taste in UX and visual design. The specification describes what must exist and how it should behave, but does not prescribe visual details or low level implementation choices beyond a few critical technical constraints.

## 2. Scope and non goals

In scope:

* Simple video transcoding in browser using FFmpeg WASM.
* At least one practical preset for compressing large phone videos down to a smaller, Telegram friendly format (for example 720p MP4 with reasonable bitrate and size).
* File upload, playback of original video, playback of converted output, and management of a local gallery of recent converted videos stored in IndexedDB.
* Basic progress indication, completion feedback, and clear visibility of what content is stored.
* Foundation for later extension, such as additional presets or simple editing operations (trimming, basic filters, etc.).

Out of scope for this iteration:

* Multi track editing, timelines, or advanced non linear editing.
* Server side components or back end services.
* Use of external UI or JS frameworks.

## 3. Technical constraints

* The app consists of a single HTML file, a single CSS file, and a single main JavaScript file.
* Scripts must be loaded using legacy script tags with `src` (no ES modules).
* The following local libraries must be used and are the only allowed external dependencies:

  * `dexie-4.2.0.js` for IndexedDB abstraction.
  * `ffmpeg-core-0.12.10.js` and `ffmpeg-core-0.12.10.wasm` for FFmpeg WASM.
* No additional third party libraries or CDNs may be introduced.
* The implementer must inspect and understand the provided FFmpeg core and Dexie builds and load them correctly in a UMD style setup, respecting whatever globals they expose.
* FFmpeg processing must run in a Web Worker (background worker).
* IndexedDB / Dexie interactions should also be performed from a background worker context where feasible, so that heavy IndexedDB operations do not block the main UI thread.
* The main JavaScript file should act as the orchestration layer, handling UI logic, and delegating long running tasks and data operations to workers.

## 4. Functional requirements

### 4.1 Upload and source handling

* The UI must provide a clear, primary control for uploading a video file from the user device.
* Once a file is selected, it must be:

  * Loaded into browser memory.
  * Immediately made available for playback in an "Original video" player pane, so the user can preview the input before conversion.
* The app should support at least common phone video formats (for example MP4 from typical mobile devices). If some formats are unsupported, the error state must be handled gracefully and communicated to the user.

### 4.2 Conversion presets

* The app must support a preset based conversion model, where users select from predefined options instead of manually tuning FFmpeg parameters.
* At minimum, there must be a preset that:

  * Downscales and recompresses the source video to approximately 720p resolution.
  * Produces a Telegram friendly MP4 output (sane trade off between quality and file size).
* The UI should present presets in a way that is easily extendable; adding more presets in future should not require redesign of the UI.
* The user flow should be:

  * Select or confirm a preset.
  * Start conversion explicitly through a clear action (for example a "Convert" button).
  * See progress and completion feedback.

### 4.3 Conversion execution

* Conversion jobs must run using FFmpeg in a Web Worker, using the provided `ffmpeg-core-0.12.10.js` and `.wasm`.
* The main thread should send all necessary metadata and input data to the worker, then receive progress updates and final output via message passing.
* Progress must be surfaced to the user as a visible progress indicator.
* On completion:

  * The output video must be made playable in an "Output video" pane.
  * The output and associated metadata must be saved to IndexedDB through Dexie.

### 4.4 Storage in IndexedDB and video gallery

* Dexie (via `dexie-4.2.0.js`) must be used as the abstraction over IndexedDB.
* Converted videos must be stored in IndexedDB along with:

  * A unique identifier.
  * A user friendly title or label.
  * The conversion timestamp.
  * The preset used.
  * A small thumbnail or preview frame extracted from the video.
* The app must maintain only the last 20 converted videos in storage:

  * When adding a new video beyond this limit, the oldest entry must be removed.
* The UI must always show the videos currently stored in IndexedDB without requiring a refresh:

  * There should be a dedicated sidebar or panel listing these videos.
  * Each entry must display at least:

    * Preview thumbnail.
    * Title or basic metadata (for example date and preset).
* From the gallery:

  * The user must be able to click an entry and play that stored video without reloading it from an external source.
  * Playback should use data read from IndexedDB.

## 5. User interface and user experience

* The application should have a simple, modern, and clean visual design, created with hand written CSS.
* The implementer is expected to use contemporary best practices in UX and usability, without heavy decoration.
* The layout should clearly separate:

  * Controls for upload and preset selection.
  * A pane for the original video.
  * A pane for the converted result.
  * A sidebar or panel listing the stored videos from IndexedDB with thumbnails.
* All important controls and states must be visible and discoverable:

  * It should be obvious how to:

    * Upload a video.
    * Choose a preset.
    * Start conversion.
    * See conversion progress.
    * See which videos are stored locally.
    * Play a stored video.
* The design should minimize friction and cognitive load:

  * Labels and text should be concise and unambiguous.
  * The user should never wonder "what is happening now".
* The app should provide:

  * A clear progress indicator while conversion is running.
  * Clear success indication when conversion completes.
  * Clear error messages when something goes wrong (for example unsupported format, storage quota errors, FFmpeg failure).
* If suitable, the implementer may add non intrusive in app notifications or status messages to signal completion of long running tasks.

## 6. Background processing

* FFmpeg execution must run in a Web Worker:

  * The main thread sends commands and input data.
  * The worker posts back progress and completion events.
* Dexie / IndexedDB operations that could block the UI should be delegated to a worker:

  * The objective is to keep the main thread responsive at all times, even for large files and frequent storage operations.
* Worker boundaries and message formats are at the discretion of the implementer, provided they remain maintainable and extensible.

## 7. Extensibility and future features

* The codebase should be structured so that the following future enhancements are straightforward:

  * Adding more conversion presets.
  * Adding simple editing features (for example trimming, basic filters, simple transformations).
  * Enriching stored metadata for videos (for example tags, notes).
* This implies:

  * Preset definitions should not be hard coded in many places.
  * The UI should be able to display additional options without structural changes.
  * Storage schema should be designed with room for additional fields.

## 8. Deliverables

* `index.html`

  * Loads all required scripts via `<script src="..."></script>` tags (no modules).
  * Provides the structural markup for the layout described above.
* `styles.css`

  * Provides a modern, clean, responsive design with good usability.
* `app.js`

  * Contains the main application logic, UI orchestration, interaction with workers, and integration with Dexie and FFmpeg.
* Worker script files as needed (for FFmpeg processing and Dexie operations)

  * Names and exact structure are up to the implementer, but they must be clearly referenced and used by `app.js`.

The implementer should use their own professional judgement to refine interactions, microcopy, and visual details, while strictly adhering to the constraints, behaviors, and responsibilities described in this specification.




