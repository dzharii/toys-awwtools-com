# YouTube Transcript Buttons

Version: 1.2.0

---

A02 Installation

---

Open `index.html` in a desktop Chromium-based browser. Drag the orange `YouTube Transcript Buttons` link to the bookmarks bar. The link text becomes the bookmark name.

Open `https://www.youtube.com/`, invoke the bookmark, and press an orange Transcript button on a video card. The installer derives the bookmarklet URL from the single named function `bookmarklet_youtube_transcript_buttons` with `Function.prototype.toString()`; the implementation is not duplicated in the HTML.

---

B02 Transcript Window

---

The transcript interface is a draggable, resizable, closable Shadow DOM dialog inside the current YouTube page. It does not open a popup or an `about:blank` document. The dialog provides caption-track selection, editable SRT, plain-text and WebVTT output, copying, downloading, reloading, and live troubleshooting information.

---

C02 Extraction Strategy

---

The bookmarklet first discovers caption tracks from the active player, a credentialed same-origin watch-page request, or the page's Innertube player configuration. It then tries the selected timed-text URL as JSON3, WebVTT, and XML.

When YouTube returns HTTP 200 with an empty subtitle body, version 1.2.0 creates an offscreen same-origin `/watch` iframe. This lets YouTube initialize its normal player session and any subtitle proof token. The bookmarklet first retries the iframe player's caption URL. If that is still empty, it activates YouTube's own Show transcript control inside the iframe and reads the timestamped transcript segments from the rendered panel.

The iframe is removed after extraction or cancellation. It never leaves the YouTube origin.

---

D01 Network Diagnostics

---

Expand `Troubleshooting details and network requests` in the transcript dialog. The log updates while requests run and records the stage, method, redacted endpoint, credentials mode, HTTP status, response content type, body length, empty-body flag, response preview, timing, and failure details.

For requests made internally by the offscreen YouTube page, Resource Timing data is recorded when available. Browser APIs do not expose those response bodies to the parent page.

Secrets and signed values are excluded from displayed URLs. API keys, signatures, proof tokens, cookies, authorization values, and visitor identifiers are not written to diagnostics.

---

E02 Security and Limitations

---

The package has no remote script, third-party runtime dependency, analytics, advertisement service, redirect service, external font, or embedded API key. It does not use `innerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, `new Function`, `window.open`, or line-style JavaScript comments in the bookmarklet source.

YouTube's web interfaces are undocumented and can change. The iframe fallback depends on the current desktop YouTube watch page exposing a normal player or a rendered transcript panel. Account, age, consent, membership, region, anti-bot, or browser-isolation requirements can still prevent extraction.

---

F01 Development Checks

---

Run `npm test` to regenerate the bookmarklet URL and validate JavaScript syntax, installer wiring, source reconstruction, host restrictions, embedded-window behavior, iframe fallback markers, network logging, and prohibited API policies.
