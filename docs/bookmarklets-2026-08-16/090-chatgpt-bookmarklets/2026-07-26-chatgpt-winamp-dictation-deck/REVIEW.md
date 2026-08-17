# Code Review

---

A00 Corrected Reliability Defects

---

Version 1.1.0 no longer deletes retained audio or transcript text before microphone permission and `MediaRecorder` initialization succeed. Starting a replacement recording requires confirmation, and the previous data remains intact when initialization fails.

Cancellation during exponential-backoff sleep now rejects the pending delay promise immediately. The earlier implementation cleared the timer but left the promise unresolved, which could retain a suspended transcription operation indefinitely.

---

B00 Additional Hardening

---

The Shadow DOM host now owns a fixed maximum-level stacking context. A `beforeunload` guard requests browser confirmation while recording, transcription, or retained audio is present. Safety-snapshot downloads no longer leave the status display incorrectly showing an idle success state while recording continues.

The distribution exports one named bookmarklet entry point and generates the installation URL from `Function.prototype.toString()`. The HTML does not contain a second copy of the implementation.

---

C00 Validation Performed

---

The JavaScript passes `node --check`. The exported entry point was evaluated in an isolated VM context, converted to a bookmarklet URL, and parsed again as JavaScript. The installation page passes HTML parsing and references the expected single source file.

Live microphone capture and authenticated transcription still require manual testing in a Chromium browser on `chatgpt.com` because the endpoint depends on the active ChatGPT session.

---

D00 Remaining Risks

---

`/backend-api/transcribe` is undocumented and may change without notice. Memory-only storage cannot survive a tab crash, browser crash, page reload, navigation, operating-system failure, or forced process termination. An active WebM safety snapshot is best effort and may be less portable than a recording downloaded after Stop.
