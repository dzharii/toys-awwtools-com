# YouTube Transcript Buttons Specification

Version: 1.2.0
Status: Reviewed and packaged
Target: Desktop Chromium browsers on `youtube.com`

---

A02 Purpose

---

YouTube Transcript Buttons is a self-contained bookmarklet that adds an orange Transcript control to recognized YouTube video cards. Pressing the control extracts available subtitles and shows editable SRT, plain text, or WebVTT inside a draggable and resizable dialog in the current YouTube page.

The bookmarklet must not use an advertisement-supported converter, redirect service, remote script, external runtime package, exposed API key, or popup browser window.

---

B02 Installation Architecture

---

The readable implementation is `youtube-transcript-buttons.bookmarklet.js`. It defines but does not automatically execute the named function `bookmarklet_youtube_transcript_buttons`.

`index.html` loads that file, converts the function to source with `Function.prototype.toString()`, wraps it as `javascript:(<function>)();`, and assigns the result to the draggable link whose visible text is `YouTube Transcript Buttons`.

The generated URL is also written to `youtube-transcript-buttons.bookmarklet.txt` by `npm run build`.

---

C02 Page Integration

---

The runtime is restricted to `youtube.com` hosts. It maintains one global versioned instance, one manager panel, at most one transcript dialog, and one button host per recognized video card.

A MutationObserver, YouTube SPA navigation events, history events, and a periodic scan handle dynamically added cards. Marker attributes and connected-host checks prevent duplicate controls.

The manager panel, transcript dialog, and card controls use open Shadow DOM roots. Existing YouTube content is not replaced, hidden, or assigned HTML.

---

D02 Transcript Dialog

---

The dialog is rendered inside the current YouTube document. It is draggable by its orange title bar, resizable through CSS, viewport-clamped, closable, and reusable for another selected video.

The dialog includes the video title and URL, request status, caption-track selector, output-format selector, editable output, copy action, download action, reload action, and a collapsible troubleshooting and network-request journal.

Closing the dialog cancels its active operation and removes temporary extraction resources without disabling card buttons.

---

E02 Metadata Discovery

---

Caption tracks are discovered in this order:

1. `movie_player.getPlayerResponse()` or `ytInitialPlayerResponse` when the selected video is the current player video.
2. A credentialed same-origin `/watch?v=<videoId>` fetch and balanced parsing of `ytInitialPlayerResponse` or serialized `playerResponse` data.
3. A same-origin `/youtubei/v1/player` request built from the current page's `ytcfg` configuration.

A candidate with caption tracks is preferred. An `OK` candidate is not replaced by a later lower-quality `UNPLAYABLE` candidate.

---

F02 Direct Caption Retrieval

---

The selected track's HTTPS YouTube caption URL is fetched as JSON3, WebVTT, and XML in that order. Each response is read once and recorded in the request journal.

JSON3 events are converted from `tStartMs`, `dDurationMs`, and `segs[].utf8`. WebVTT timing blocks are parsed locally. XML supports legacy `<text start="..." dur="...">` and srv3 `<p t="..." d="...">` forms without `DOMParser`.

HTTP 200 with an empty body is an explicit failed caption attempt and is recorded with `emptyBody: true` and `responseLength: 0`.

---

G00 Same-Origin Watch-Frame Fallback

---

When all direct formats are unusable, the bookmarklet creates a temporary offscreen iframe pointing to the selected video's `/watch` page on the current YouTube origin.

The frame is visually inaccessible, has no pointer interaction, does not open a separate window, and is removed in a `finally` block.

After the normal YouTube watch application initializes, the bookmarklet reads the frame's player response and looks for a caption track matching the requested language, generation type, or VSS identifier. It records whether the resulting URL contains `pot` or `potc` proof-token fields and retries the direct formats.

---

H00 YouTube Transcript-Panel Fallback

---

If the iframe player's caption URL is still unusable, the bookmarklet uses YouTube's own rendered transcript interface inside that frame.

It locates or reveals the Show transcript control, activates it, waits for the transcript engagement panel, scrolls its segment container, and collects `ytd-transcript-segment-renderer` timestamps and text. Timestamps are converted to milliseconds and durations are inferred from adjacent segments.

The rendered-panel fallback may use YouTube's default transcript language. Matching the requested track is attempted through the iframe player before this fallback.

---

I00 Network Journal

---

Each direct request records:

| Field | Meaning |
|---|---|
| `stage` | Logical extraction stage |
| `method` | HTTP method |
| `url` | Redacted origin and path with safe format or language fields |
| `credentials` | Browser credentials mode |
| `cache` | Browser cache mode |
| `httpStatus` | Response status when available |
| `contentType` | Response Content-Type |
| `contentLengthHeader` | Declared body length when supplied |
| `responseLength` | Actual JavaScript text length |
| `emptyBody` | Whether the body length is zero |
| `responsePreview` | Truncated non-sensitive response text |
| `elapsedMs` | Request duration |
| `errorCode` and `errorMessage` | Failure classification |

The offscreen frame's navigation and relevant Resource Timing entries are recorded separately. Resource Timing does not expose response bodies and may omit status or byte sizes.

---

J02 Output Conversion

---

Normalized segments contain `startMs`, `durationMs`, and text. The output formatter produces SubRip timestamps with commas, WebVTT timestamps with periods, or a plain transcript with adjacent duplicate text suppressed.

Copy uses the Clipboard API with selection and `execCommand('copy')` as a fallback. Download uses an in-memory Blob and temporary object URL.

---

K02 Security and Privacy

---

The runtime makes requests only to the current YouTube origin and accepted YouTube caption hosts. It has no analytics, telemetry, advertisement code, CORS proxy, remote dependency, external font, or transcript upload.

Diagnostic URLs exclude API keys, proof tokens, signatures, cookies, authorization values, visitor data, and other signed query fields. The raw caption base URL is never displayed.

UI construction must not use `innerHTML`, `insertAdjacentHTML`, `document.write`, or remote markup. Runtime code must not use `eval`, `new Function`, dynamic imports, `window.open`, or `about:blank`.

The bookmarklet source uses block comments only. Line-style comments are prohibited because bookmarklet URL normalization can remove line boundaries and comment out subsequent code.

---

L02 Cancellation and Cleanup

---

One AbortController owns the current transcript operation. Closing or replacing the dialog aborts fetches, frame loading, player waiting, transcript-panel waiting, and segment scrolling.

Destroying the bookmarklet disconnects observers, clears timers, removes navigation handlers, aborts requests, removes the temporary frame through operation cleanup, removes the transcript dialog and manager, removes button hosts and marker attributes, and deletes the global instance.

---

M02 Error Classification

---

Errors identify their stage and include actionable troubleshooting. Important codes include metadata discovery failure, video unplayable, no captions, watch-page HTTP or parsing failure, player HTTP or parsing failure, timed-text HTTP failure, empty or unparseable caption data, watch-frame load or access failure, transcript control or panel absence, empty rendered transcript, timeout, network failure, and user cancellation.

A final error opens the troubleshooting journal automatically.

---

N02 Acceptance Tests

---

| Test ID | Expected result |
|---|---|
| T-01 | Installer link title is `YouTube Transcript Buttons` and contains a generated JavaScript URL. |
| T-02 | Running outside YouTube displays a host restriction and injects no UI. |
| T-03 | Cards receive one orange Transcript control and dynamically loaded cards are scanned. |
| T-04 | The transcript dialog appears inside YouTube, is draggable, resizable, reusable, and closable. |
| T-05 | No popup or `about:blank` document is opened. |
| T-06 | Direct timed-text requests try JSON3, WebVTT, and XML. |
| T-07 | HTTP 200 with an empty subtitle body is logged with zero response length. |
| T-08 | XML parsing works without `DOMParser` or TrustedHTML assignment. |
| T-09 | After empty direct responses, a same-origin watch iframe is loaded and cleaned up. |
| T-10 | A matching iframe-player caption URL is retried before panel scraping. |
| T-11 | The Show transcript panel fallback collects timestamped segments and produces SRT. |
| T-12 | Network journal entries update while requests run and appear in final success or error diagnostics. |
| T-13 | Sensitive signed query values are absent from displayed endpoints. |
| T-14 | Copy and download actions operate on the editable output. |
| T-15 | Closing the dialog cancels extraction while leaving card controls active. |
| T-16 | Destroying the manager removes all observers, timers, handlers, hosts, markers, requests, and global state. |
| T-17 | Source contains no line-style comments or prohibited injection and dynamic-code APIs. |

---

O01 Remaining Compatibility Risk

---

YouTube's player responses, proof-token policy, transcript renderers, page layout, virtualized scrolling, signed caption URLs, and internal endpoints are undocumented. Static validation cannot guarantee live extraction. Manual validation in the user's actual YouTube session remains required.
