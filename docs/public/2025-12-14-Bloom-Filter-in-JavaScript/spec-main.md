2025-12-14

A00 Project summary v00
Implement a 2-page, zero-build, vanilla HTML/CSS/JS Bloom filter utility. Page 1 is a Bloom filter editor that configures, creates, loads, saves, and incrementally trains a Bloom filter from newline-delimited strings. Page 2 is a Bloom tester that loads a saved Bloom filter and checks membership for user-provided strings. The only third-party dependency is `lib/jasondavies_bloomfilter.js-commit-757f4ad/bloomfilter.js`, which must be inspected and used directly.

A01 Constraints and repository layout v00
Code must be vanilla HTML/CSS/JS, no bundler, no frameworks. JavaScript and CSS must be separate files and included via `<script src="...">` and `<link rel="stylesheet" href="...">`.
The existing entrypoints are `bloom-editor.html` and `bloom-tester.html`. Add corresponding files: `bloom-editor.js`, `bloom-editor.css`, `bloom-tester.js`, `bloom-tester.css`.
Dependency path is fixed: `lib/jasondavies_bloomfilter.js-commit-757f4ad/bloomfilter.js`. The implementation must open this file and confirm the constructor signature and serialization-relevant fields (for example, typical API patterns are a BloomFilter constructor plus `add()` and `test()` methods). Do not add any other dependencies.

A02 Bloom filter concepts and required computed properties v00
The editor UI must surface and explain the Bloom filter parameters and derived properties, with persistent, always-visible hints per setting (not placeholder-only). The user must be able to return later and re-understand each setting from the UI alone.
Required parameters to expose include: number of bits (m), number of hash functions (k), and a target error rate (false positive probability p). Also expose “size” in user-facing terms: bitmap size in bits and bytes, and any underlying bucket/word representation exposed by the library if applicable.
The UI must compute and display Bloom filter accuracy metrics (false positive rate) based on current parameters and the current count of inserted items (n). Provide an error calculator that updates when inputs change.
Use standard Bloom filter relationships for computed guidance: given expected item count n and target p, compute suggested m and k; also compute expected p for given m, k, n. Provide both “suggested” and “actual/current” metrics when the user overrides values.

A03 Bloom editor page functional requirements v00
The editor must support creating a Bloom filter in memory, incrementally adding data, saving/exporting as JSON for later use, and reloading/importing that JSON to continue editing.
Creation flow: user sets parameters in the settings panel; clicking “Create” instantiates the Bloom filter in memory with the chosen m and k (per dependency API). The UI must reflect that an in-memory filter exists and show its current metrics and counters.
Incremental learning flow: provide a large multiline text area intended for newline-separated strings. The text area must occupy a large portion of the page and be placed toward the bottom, with controls above it. Clicking “Add to Bloom filter” parses the text area by lines, trims appropriately, ignores empty lines, adds each value to the Bloom filter, then clears the text area on success. The UI must show a clear completion confirmation (status label or toast) every time an add completes.
The editor must maintain and display a running count n (how many values have been added in this editing session). If the library does not track n, the editor must track it as editor metadata.
The editor must include a “Download JSON” action that serializes the Bloom filter plus required metadata, and triggers a browser download. It must include an “Upload JSON” action that loads a previously downloaded JSON file, recreates the Bloom filter in memory, restores parameters and metadata, and allows continued incremental additions.
The editor must provide a generated usage example (code sample) that shows client-side usage: loading the JSON, reconstructing the Bloom filter object, and calling membership checks. This sample must include the number of hash functions (k) needed to read/test, and must reflect the chosen parameters.

A04 Bloom editor settings UX requirements v00
Settings panel must be at the top of the page and include: target error rate p, expected item count n_expected (for suggestions), computed suggested m and k, and manual override inputs for m and k. If the user changes overrides, the UI must recompute resulting expected error p_expected using the current n (inserted count) and show it.
Every setting must have a concise, explicit hint text adjacent to it, explaining what it controls and how it affects size and error. Hints must not rely on tooltips alone. Tooltips are allowed as secondary help.
The UI should present values in human units: bits, bytes, and approximate KiB/MiB for memory footprint. Also show k and what it means (number of hash functions).
The UI must prevent invalid configurations: non-positive m, non-positive k, non-finite values, and absurdly large values that would freeze the browser. If values are out of bounds, disable creation/add actions and show an inline error message explaining what to fix.
The UI must preserve current settings and last-used values when possible within the session (in-memory state), but persistence across reload is optional unless implemented via localStorage; if localStorage is implemented, it must be explicit and non-intrusive.

A05 JSON serialization format and filename convention v00
Download must produce a JSON file that contains enough information to reconstruct the Bloom filter and continue editing. The JSON must include: the Bloom filter bitset/buckets representation as required by the library, the number of hash functions k, the number of bits m (or enough to infer it), and editor metadata (at minimum: a version field, creation timestamp, and current inserted count n_session). Also include the settings used (target p, expected n) so the UI can restore the editor context.
The filename must include the number of hash functions used to create the filter. Use a deterministic naming scheme that always includes k. Example pattern: `bloom-k16.json` as a minimum. If additional parameters are included, keep k present and easy to parse, for example `bloom-k16-m1048576-p0.01.json`.
Upload must validate the JSON schema, check version compatibility, and fail with an actionable error message if required fields are missing or inconsistent. After a successful upload, the UI must show the restored parameters including k, size, and metrics, and allow further incremental adds.

A06 Logging and telemetry module v00
Implement structured logging for important actions. Create a small logging module used by both pages. It must log to the browser console and also to an on-page log panel (scrollable) so the user can see what happened without opening DevTools.
Log events must include a timestamp, an event name, and structured data. Log data should be JSON-stringified for display.
Log at minimum these actions: create filter (include m, k, suggested vs chosen, computed memory size); load JSON (include filename if available, parsed version, restored m and k); download JSON (include filename and payload size); add values (include number of lines processed, number added, number skipped as empty/duplicate-input-lines if tracked, and elapsed time); tester membership checks (include count checked and elapsed time).
Errors must be caught and logged with enough context to reproduce. User-facing errors must also be shown in the UI, not only logged.

A07 Bloom tester page functional requirements v00
The tester page is a dedicated testing UI (“Bloom tester”) for verifying membership queries against a loaded Bloom filter JSON.
It must support uploading a Bloom JSON file, reconstructing the Bloom filter in memory, and then checking whether provided values are “possibly in set” vs “definitely not in set” (standard Bloom semantics).
The tester must provide an input field for a single value and also a multiline input for batch testing newline-delimited strings. Results must be clearly displayed per checked value, with an obvious indication of pass/fail semantics.
The tester must display the loaded filter’s parameters (m, k) and derived size, and if available show the expected false positive rate given the metadata n_session.
The tester must reuse the same logging module and show a log panel.

A08 UI layout and interaction requirements v00
Editor layout: top settings and status area, followed by action buttons, then the large data text area occupying a substantial portion of the viewport. The page must remain usable on common screen sizes with responsive CSS.
Actions must have clear disabled states when prerequisites are missing (no filter created, invalid settings, no file loaded, empty input).
After “Add to Bloom filter”, clear the text area only after successful completion. If any add fails, do not clear; show error state and log details.
Show always-visible status indicators: whether a filter is loaded/created, current n_session, and last action result (success/failure).
Provide modern, clean styling with good spacing and readable typography, without external CSS frameworks.

A09 Implementation notes for using the dependency v00
The coding agent must inspect `bloomfilter.js` to confirm: constructor arguments (commonly m and k), method names for insertion and query (commonly `add(value)` and `test(value)`), and which internal fields must be serialized to reconstruct state (commonly a buckets array plus k).
Reconstruction must use the library’s supported pattern. If the library supports constructing with an existing buckets array, use it. If it does not, construct empty and then restore buckets directly only if the library’s structure makes that safe and stable. The final approach must be based on what the inspected code supports, not assumptions.

A10 Acceptance criteria v00
Both pages load in a browser by opening the HTML files directly and function without any build step.
Editor supports: configure parameters with explained hints; compute and display size and error metrics; create in-memory Bloom filter; incrementally add newline-delimited strings and clear input on success; download JSON with filename containing k; upload JSON and continue editing; generate a correct code sample reflecting chosen parameters.
Tester supports: upload JSON; display parameters; test single and batch inputs with clear results.
Logging works on both pages: important actions appear in console and in-page log panel with structured data.
All invalid states are handled with clear UI error messages and no silent failures.
