# Implementation Research Notes

Version: 1.2.0

---

A02 Observed Failure

---

The reported request sequence obtained valid caption metadata but every timed-text format returned HTTP 200 with an empty response body. Disabling the content blocker did not change the result. The browser also rejected `DOMParser.parseFromString()` under YouTube's Trusted Types policy, so the XML fallback could not run reliably.

The failure is not evidence that the selected videos lack subtitles. It indicates that the signed caption URL accepted the HTTP request but did not authorize delivery of caption bytes in that request context.

---

B02 Proof-Token Context

---

Current open-source YouTube extractors document cases where a web-client subtitle URL requires a Proof of Origin token. A request with the same signed URL can return an empty body when the subtitle token parameters are omitted. This is consistent with the observed HTTP 200 and zero-length response.

The bookmarklet cannot safely ship a fixed proof token because these values are session-bound and expire. It also cannot reliably reproduce YouTube's full attestation implementation as static copied code.

---

C02 Same-Origin Player Workaround

---

Version 1.2.0 loads the requested video in a temporary offscreen same-origin watch iframe only after the normal timed-text attempts return no usable segments. The full YouTube watch application can initialize the video as it normally would, including player-session state that a plain HTML fetch does not produce.

The bookmarklet checks the iframe's `movie_player.getPlayerResponse()` and retries a matching caption track. It records whether the discovered caption URL contains `pot` or `potc` parameters.

---

D01 Transcript-Panel Fallback

---

If the iframe player's timed-text URL remains empty, the bookmarklet uses YouTube's own transcript UI as the data source. It expands the description when necessary, activates the Show transcript control, waits for the transcript engagement panel, scrolls its segment container, and collects rendered timestamps and text.

This path avoids parsing a protected transcript API response directly. It uses the same interface that a user can open manually and converts the rendered segments locally to SRT, text, or WebVTT.

---

E02 Parser and Trusted Types Correction

---

The XML fallback no longer uses `DOMParser`. It parses the narrow `<text start dur>` and `<p t d>` timed-text forms with a local token scanner and entity decoder. This avoids YouTube's TrustedHTML sink restriction.

The source also uses block comments only. Line comments are excluded because a bookmarklet URL can lose line boundaries and accidentally comment out the remainder of the program.

---

F01 Diagnostic Design

---

Each direct fetch is journaled before it begins and updated after headers and body text are available. The journal distinguishes HTTP success from a usable caption response: HTTP 200 with `responseLength: 0` is recorded as an empty-body protocol failure.

The offscreen watch page is a browser navigation rather than a `fetch()` call, so its HTTP body and headers cannot be read through the parent request journal. The bookmarklet records navigation state and relevant same-origin Resource Timing entries instead.
