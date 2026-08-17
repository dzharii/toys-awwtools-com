# Code Review

Version: 1.2.0

---

A02 Correctness Review

---

The original JSON3, WebVTT, and XML attempts remain the fastest path. A zero-length HTTP 200 response is preserved in diagnostics rather than being reported only as a generic parse failure.

The new fallback is ordered after the normal requests. It loads the target video in an offscreen same-origin watch frame, checks the initialized player for a matching caption track, and then uses the rendered transcript panel if direct timed-text remains unavailable.

The XML parser no longer invokes a Trusted Types sink. All bookmarklet comments use block syntax.

---

B02 Lifecycle Review

---

The offscreen frame is created per transcript load and removed in `finally`, including success, parse failure, cancellation, dialog close, and manager shutdown. The transcript AbortSignal is checked during frame loading, player initialization, panel discovery, and scrolling.

Opening another transcript aborts the previous operation. Closing the transcript dialog leaves card buttons active. Destroying the manager removes the dialog, observer, timers, route handlers, button hosts, marker attributes, and global instance.

---

C02 Security Review

---

The new frame URL is built from the current YouTube origin and a validated 11-character video ID. No external origin, converter service, remote script, or proxy is introduced.

Diagnostic URLs are reduced to origin, path, and non-sensitive format or language fields. Signed query parameters, API keys, proof tokens, signatures, visitor values, cookies, and authorization data are not displayed.

UI construction continues to use DOM creation, `textContent`, attributes, and Shadow DOM. The source contains no HTML-string injection, dynamic code execution, popup creation, or line-style comments.

---

D01 Diagnostic Review

---

Direct requests record method, endpoint, credentials mode, cache mode, status, content type, content-length header, actual text length, empty-body state, preview, timing, and failures. The troubleshooting panel opens automatically on a final error.

Relevant internal iframe requests are summarized from Resource Timing. This is intentionally labeled as partial because browser performance entries do not provide response bodies and may omit status or transfer sizes.

---

E02 Validation Performed

---

The source passes `node --check`. `npm test` reconstructs the `javascript:` URL from the named source function, reparses the generated program, validates the installer, exercises the host guard, tests watch-page JSON extraction, verifies the iframe and network-journal code paths are present, and rejects prohibited APIs.

Live YouTube extraction cannot be validated in the build container because it has no browser session or YouTube network access. Manual testing is still required for the reported videos.

---

F01 Remaining Risks

---

YouTube can rename transcript renderers, virtualize the segment list differently, localize or remove the Show transcript control, require stronger attestation, block a same-origin watch iframe, or change caption response formats.

The transcript-panel fallback normally returns YouTube's default transcript language. The requested track is retried through the iframe player first, but the rendered-panel fallback may not honor a non-default language when YouTube's language selector cannot be identified safely.
