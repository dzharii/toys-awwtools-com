# ChatGPT Winamp Dictation Deck Specification

Version: 1.1.0
Status: Reviewed and packaged
Target: Chromium-based desktop browsers on `chatgpt.com`

---

A00 Purpose and Problem Statement

---

ChatGPT Winamp Dictation Deck is a self-contained bookmarklet that records microphone audio independently of ChatGPT's built-in dictation interface, keeps the recording available in browser memory, submits it to ChatGPT's transcription service only when requested, and never replaces or hides text already present in the ChatGPT composer.

The primary failure being addressed is destructive coupling between recording and transcription. A remote transcription failure must not destroy the only local copy of the user's recording. The secondary failure being addressed is UI coupling. Recording must occur in a floating utility window so that the existing composer remains visible and readable.

The bookmarklet is a resilience wrapper, not a replacement transcription provider. It uses an undocumented ChatGPT web endpoint and therefore cannot guarantee long-term compatibility.

---

B00 Evidence and Protocol Baseline

---

The captured ChatGPT browser request establishes the baseline transport contract shown below.

| Property | Baseline |
|---|---|
| Method | `POST` |
| Endpoint | `/backend-api/transcribe` |
| Authentication | Same-origin ChatGPT cookies; bearer token may also be attached when available |
| Request body | Browser-generated `multipart/form-data` |
| Audio field | `file` |
| Captured filename | `whisper.webm` |
| Captured media type | `audio/webm;codecs=opus` |
| Duration field | `duration_ms` |
| Optional compatibility field | `language`, omitted unless the user supplies a hint |
| Successful response | JSON object containing `text`; observed metadata also includes `asset_pointer`, `asset_ttl`, and `asset_format` |

The implementation records WebM with Opus when the browser supports it. The term "wave" in the UI requirement is treated as a visualization requirement, not a requirement to encode a WAV file. Chromium's native `MediaRecorder` output and the captured ChatGPT request both favor WebM/Opus.

The bookmarklet parses JSON and plain text defensively. The transcript is read from `text` first, with compatibility fallbacks for `transcript`, `output_text`, nested `result.text`, and nested `data.text`. Metadata is retained only for diagnostics. The `sediment://` asset pointer is not dereferenced.

---

C00 Product Scope

---

| Scope ID | Required behavior |
|---|---|
| S-01 | Run only on `chatgpt.com` or the legacy `chat.openai.com` host. |
| S-02 | Create one floating, draggable, resizable window inside an open Shadow DOM. |
| S-03 | Use a Winamp-inspired visual language with a real-time fire and spectrum visualization. |
| S-04 | Record microphone audio into JavaScript memory using `MediaRecorder`. |
| S-05 | Preserve audio after stop, after transcription success, and after transcription failure. |
| S-06 | Permit an audio download after stop and a best-effort safety snapshot while recording. |
| S-07 | Submit audio only after an explicit Transcribe action. |
| S-08 | Retry only errors classified as transient, using bounded exponential backoff with full jitter. |
| S-09 | Permit manual retranscription of the same retained audio. |
| S-10 | Show the transcript in an editable text area inside the utility window. |
| S-11 | Append transcript text to the ChatGPT composer without replacing existing content. |
| S-12 | Never send a ChatGPT message automatically. |
| S-13 | Provide explicit Copy, Append to Chat, Download Audio, Cancel, and Clear actions. |
| S-14 | Keep access tokens, cookies, audio bytes, and transcripts out of persistent browser storage. |
| S-15 | Clean up media tracks, audio contexts, timers, object URLs, event handlers, and DOM nodes on close. |

---

D00 Explicit Non-Goals

---

The bookmarklet does not use IndexedDB, Local Storage, Cache Storage, a service worker, or a remote backup service. A page reload, browser crash, renderer crash, tab close, navigation away from ChatGPT, or operating-system failure can still destroy an in-memory recording that was not downloaded.

The bookmarklet does not bypass account restrictions, subscription restrictions, abuse controls, rate limits, authentication, or authorization checks. It does not rotate accounts, spoof identity headers, or continue aggressive retries after a rate-limit response.

The bookmarklet does not call the public OpenAI Audio API and does not require an API key. It operates within the current ChatGPT browser session.

The bookmarklet does not promise verbatim transcription accuracy and does not fetch the temporary asset returned by the transcription response.

---

E00 User Interface

---

The window has six visual regions: a title bar, a digital timer and status panel, a fire visualizer, primary transport controls, an editable transcript area, and secondary recovery controls.

| Control | Behavior |
|---|---|
| Record | Clears the previous local recording after the normal state checks, requests microphone permission, and begins a new recording. |
| Pause or Resume | Pauses or resumes the current recorder without discarding accumulated chunks. |
| Stop | Finalizes the current audio blob and releases the microphone. |
| Transcribe | Stops an active recording if necessary, then sends the retained blob through the retry controller. |
| Cancel | Aborts the current HTTP request or pending retry delay without deleting audio. |
| Download Audio | Downloads the finalized blob, or requests a best-effort snapshot of accumulated chunks during an active recording. |
| Copy Text | Copies the editable transcript to the clipboard. |
| Append to Chat | Adds transcript text after existing composer content. It never replaces existing content and never submits the message. |
| Clear | Requires a second click within four seconds and then deletes the local audio and transcript. |
| Close | Warns before discarding an active recording, retained audio, active request, or transcript. |

The window uses the maximum practical stacking level and is independent of ChatGPT's composer layout. Reinvoking the bookmarklet focuses the existing instance instead of creating a duplicate or destroying it.

The visualizer uses a low-resolution heat buffer, audio-frequency input, upward heat diffusion, a black-red-orange-yellow-white fire palette, green spectrum bars, and scanlines. The rendering has no external image or library dependency.

---

F00 Recording and Memory Model

---

The recorder requests mono audio with echo cancellation, noise suppression, and automatic gain control. It selects the first supported format in this order: `audio/webm;codecs=opus`, `audio/webm`, `audio/ogg;codecs=opus`, then `audio/mp4`. If explicit options fail, it retries construction with the browser default.

`MediaRecorder.start(1000)` requests one-second chunks. Every non-empty `dataavailable` chunk is appended to an in-memory array. On stop, all chunks are assembled into one Blob using the recorder's actual media type. No chunk is removed because of an HTTP result.

The displayed duration excludes paused time. The exact active duration in milliseconds is sent as `duration_ms`.

A recording remains available until one of four events occurs: the user clears it, the user closes the deck after confirming, a new recording begins, or the page execution context terminates.

The safety snapshot action during an active recording requests the current recorder data and downloads the chunks accumulated at that point. Because a browser may not have written final container metadata yet, an active-recording snapshot is best effort. A stopped recording is the preferred recovery file.

---

G00 Authentication and Request Construction

---

Every request uses a relative same-origin URL and `credentials: "include"`, allowing the browser to attach the current ChatGPT cookies according to browser rules. The bookmarklet optionally requests `/api/auth/session` and attaches `Authorization: Bearer <accessToken>` when an access token is returned. The token is cached only in a JavaScript promise and is never displayed or persisted.

The bookmarklet sets `Accept: application/json` and an `oai-language` header based on the browser language. It never sets `Content-Type` manually because the browser must generate the multipart boundary.

The multipart body always contains `file` and `duration_ms`. It contains `language` only when the user enters a non-empty value other than `auto`.

The request timeout is 120 seconds. The maximum automatic attempt count is four, including the first attempt.

---

H00 Response Handling

---

A successful 2xx response is read as text once. The parser attempts JSON when the response content type or first character indicates JSON. A non-empty transcript completes the operation.

A 2xx response with no transcript is treated as a transient empty-transcription failure and may be retried within the normal attempt budget.

The following response metadata is retained for diagnostics when present: `x-oai-request-id`, `asset_pointer`, `asset_ttl`, and `asset_format`. The request ID is displayed in the UI. Tokens, cookies, and authorization values are redacted from logs.

A successful transcription updates the editable transcript field. Auto Insert, when enabled, appends the result to the current ChatGPT composer. Audio remains retained after success.

---

I00 Failure Classification and Retry Policy

---

| Failure | Automatic action | Final user state |
|---|---|---|
| Browser network `TypeError` | Retry while attempts remain | Audio retained; manual retry and download remain available |
| Request timeout | Retry while attempts remain | Audio retained |
| Empty 2xx transcript | Retry while attempts remain | Audio retained |
| HTTP 408 | Retry while attempts remain | Audio retained |
| HTTP 425 | Retry while attempts remain | Audio retained |
| HTTP 429 | Respect `Retry-After` when present, add jitter, and retry while attempts remain | Audio retained; manual retry is available after exhaustion |
| HTTP 500, 502, 503, 504 | Retry while attempts remain | Audio retained |
| HTTP 401 | Refresh the session token once, repeat the same numbered attempt, then stop if authentication still fails | Audio retained; user is told to reload and sign in |
| HTTP 400, 403, 404, 413, 415, 422 | Do not retry automatically | Audio retained with a specific diagnostic |
| Other 4xx | Do not retry automatically | Audio retained |
| User Cancel | Abort immediately | Audio retained |

For retry attempt number `n`, the exponential ceiling is `min(15000, 1000 * 2^(n-1))` milliseconds. The client selects a random delay from zero to that ceiling. For a valid `Retry-After` value, the server delay is treated as a minimum and a small extra jitter is added. Any computed delay is capped at 60 seconds.

This policy is intentionally conservative. It improves resilience to transient failures without turning the bookmarklet into a rate-limit evasion mechanism or causing a retry storm.

---

J00 Composer Integration

---

The bookmarklet searches for the current visible composer using a short ordered selector set covering `#prompt-textarea`, the current composer test identifier, visible form text areas, visible form content-editable elements, and Lexical editors.

For a text area or input, the implementation reads the current value, adds a paragraph separator, appends the transcript, invokes the native value setter when available, dispatches an input event, focuses the control, and places the caret at the end.

For a content-editable composer, the implementation moves a range to the end, inserts two line breaks plus the transcript through `execCommand("insertText")` when supported, falls back to a text node insertion, and dispatches an input event.

The Append to Chat action never erases existing composer content and never clicks the ChatGPT Send button.

---

K00 Security, Privacy, and Compatibility

---

The Shadow DOM isolates the deck's visual rules from ChatGPT's application styles. The host page is modified only by appending one fixed-position host element. No ChatGPT element is hidden, replaced, resized, or removed.

The bookmarklet makes network requests only to the current ChatGPT origin. It has no analytics, remote script, CDN, external font, telemetry, or third-party dependency.

The local audio copy is memory-only. Once Transcribe is pressed, the audio is sent to ChatGPT and is subject to ChatGPT's current data controls and retention behavior. The successful response's temporary asset metadata is not interpreted as a durable backup controlled by the bookmarklet.

The internal endpoint is undocumented. Header requirements, multipart fields, accepted formats, authentication behavior, response shape, account eligibility, and endpoint existence may change without notice. HTTP 404, 400, 401, 403, and 415 diagnostics are designed to make such contract changes visible rather than silently discarding audio.

Chromium desktop is the primary target because the captured request used WebM/Opus and the user's environment was Edge. Other browsers may record a different container and may not be accepted by the internal endpoint.

---

L00 Acceptance Tests

---

| Test ID | Procedure | Expected result |
|---|---|---|
| T-01 | Enter text in the ChatGPT composer, start a recording, and continue viewing the page. | Existing text remains visible and unchanged. |
| T-02 | Record, pause, resume, and stop. | Timer excludes paused time; audio remains downloadable. |
| T-03 | Stop a recording and press Download Audio. | A file with the recorder's correct extension is downloaded. |
| T-04 | Press Download Audio during recording. | A best-effort snapshot downloads and recording continues. |
| T-05 | Simulate a network failure. | Automatic retries occur with jitter; audio remains retained. |
| T-06 | Return HTTP 429 with `Retry-After`. | Retry waits at least the requested delay plus jitter, within the 60-second cap. |
| T-07 | Return HTTP 400 or 415. | No automatic retry occurs; a specific diagnostic is shown. |
| T-08 | Return the supplied JSON payload. | The `text` field is displayed; asset metadata is retained only as diagnostics. |
| T-09 | Return valid plain text. | The plain text becomes the transcript. |
| T-10 | Return 2xx with an empty transcript. | The request is retried within the normal attempt budget. |
| T-11 | Append a transcript when composer text already exists. | Transcript is appended after existing content; nothing is sent automatically. |
| T-12 | Cancel during an HTTP request or retry delay. | Request or timer stops; audio remains downloadable and retranscribable. |
| T-13 | Click Clear once. | No data is deleted; Clear becomes armed. |
| T-14 | Click Clear again within four seconds. | Local audio, chunks, transcript, and metadata are removed. |
| T-15 | Close with retained audio. | A destructive-action warning appears. |
| T-16 | Invoke the bookmarklet twice. | The existing window is focused; no duplicate instance is created. |
| T-17 | Close the deck. | Microphone tracks, audio context, timers, requests, object URLs, handlers, and host DOM are released. |

---

M00 Implementation Deliverables

---

The readable implementation is `chatgpt-winamp-dictation.js`.

The installable JavaScript URL is `chatgpt-winamp-dictation.bookmarklet.txt`. It contains the same implementation as a percent-encoded, self-contained `javascript:` URL suitable for a bookmark's URL field.

The implementation has no external dependencies and passes Node's JavaScript syntax check. Runtime microphone and ChatGPT endpoint behavior must still be validated interactively inside the user's authenticated ChatGPT browser session.


---

N00 Installation Package

---

The distribution contains one readable bookmarklet source file and a minimal local installation page. The source file defines and exports the named function `bookmarklet_chatgpt_winamp_dictation_deck` without executing it when the installation page loads.

The installation page loads that source file, calls `bookmarklet_chatgpt_winamp_dictation_deck.toString()`, wraps the resulting function expression in a `javascript:` URL, and assigns the URL to the draggable installation link. The bookmarklet body is therefore not duplicated in `index.html`. A copy-to-clipboard control is provided as a fallback when drag installation is unavailable.

The package also contains this specification and a concise README. Captured HAR data, cookies, bearer tokens, session identifiers, and account metadata are excluded.

---

O00 Reliability Review Corrections

---

Version 1.1.0 makes new-recording initialization transactional. Existing retained audio and transcript text are not deleted while microphone permission or `MediaRecorder` construction is pending. Replacement occurs only after the new recorder has started successfully, and the user must confirm replacement when recoverable data already exists.

Cancellation during a retry delay now rejects the pending delay promise immediately instead of clearing its timer and leaving the transcription operation suspended. The retry controller, request controller, and UI state therefore converge deterministically after Cancel or Close.

The window host now owns a fixed maximum-level stacking context, active-recording download status remains accurate after a safety snapshot, and a `beforeunload` guard requests browser confirmation while recording, transcription, or retained audio is present.
