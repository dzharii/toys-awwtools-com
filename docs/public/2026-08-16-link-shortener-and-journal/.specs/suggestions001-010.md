2026-08-16

# 2026-08-16.JULIET.A-00

## A-00. Incremental Change Request: Resilient Browser Capture for Access-Challenged Pages

This specification is an incremental change request for the existing ALPHA through INDIA specification set. Earlier requirements remain authoritative except where this document extends browser launch, page-readiness diagnostics, and retry behavior.

The current authoring command launches Playwright's bundled Chromium in headless mode with its default browser context. Some otherwise public pages classify that context as automated traffic before the page can render. A representative reproduction is:

```text
https://leetcode.com/problems/two-sum/
```

The baseline request returns HTTP 403, `cf-mitigated: challenge`, the title `Just a moment...`, and a user agent containing `HeadlessChrome/`. The page never reaches metadata extraction or preview selection.

Controlled experiments established that replacing only the `HeadlessChrome/` product token with `Chrome/`, while retaining the bundled browser's exact operating-system and version values, allows the normal page to return HTTP 200. Ordinary headed bundled Chromium also returns the real page. Extra request headers alone and changing only `navigator.webdriver` do not solve the reproduced failure.

JULIET therefore adds a small shared browser profile and one challenge-only headed retry. It does not add dependencies, proxy services, CAPTCHA solving, persistent user profiles, credential reuse, or site-specific scraping.

## B-00. Scope and precedence

JULIET extends these areas only:

| Area | New rule |
| --- | --- |
| Headless browser identity | Remove the headless-only product token while preserving the actual bundled browser identity |
| HTTP challenge detection | Classify documented challenge responses before generic HTTP errors |
| Retry behavior | Retry once in visible bundled Chromium only after a confirmed access challenge |
| Diagnostics | Record bounded response and attempt information without logging page content or secrets |

The normal generic capture algorithm, site-adapter registry, metadata priority, JPEG requirements, atomic repository mutation, and all journal behavior remain unchanged.

The existing YouTube adapter remains appropriate. A LeetCode adapter is not required because the shared browser correction renders the actual LeetCode page. An undocumented GraphQL endpoint or locally reconstructed problem card would be a more brittle and less faithful solution and MUST NOT be added unless real-page capture later proves insufficient.

## C-00. Exact-version headless user-agent normalization

The primary attempt remains headless and continues to use the Playwright version and Chromium binaries already installed by the project.

Before navigating to the remote target, the authoring pipeline MUST obtain the bundled browser's real default user-agent value from a temporary blank browser context. It MUST derive the capture user agent by replacing exactly one browser product token:

```text
HeadlessChrome/151.0.7922.34
->
Chrome/151.0.7922.34
```

The implementation MUST preserve the discovered operating-system text, engine text, browser version, and remaining user-agent structure. It MUST NOT hard-code the current Chromium version or impersonate a different browser version.

If the discovered user agent does not contain `HeadlessChrome/`, it should be used unchanged. If discovery returns an empty or malformed value, the operation must fail clearly rather than invent an arbitrary identity.

The normalized value must be supplied through Playwright's browser-context `userAgent` option. Do not inject a conflicting `User-Agent` through broad per-request routing.

JULIET does not require hiding `navigator.webdriver`, modifying canvas or WebGL APIs, disabling browser automation flags, or adding a collection of spoofed client hints. The reproduced page succeeds without those changes, and avoiding them keeps the solution narrow and internally consistent.

## D-00. Challenge-aware navigation diagnostics

The current capture path turns every main-document response of status 400 or greater into `CAPTURE_HTTP_ERROR` before inspecting the response or rendered page. JULIET must distinguish an access challenge from an ordinary origin error.

Cloudflare documents the following response marker:

```text
cf-mitigated: challenge
```

When that header is present on the main navigation response, the capture attempt MUST fail as:

```text
CAPTURE_ACCESS_CHALLENGE
```

rather than `CAPTURE_HTTP_ERROR`.

The existing bounded DOM-text barrier detection remains useful for challenge products that do not provide this header. It should continue to detect verification, checking-the-browser, and access-denied text after a successful HTTP response. An explicit CAPTCHA or authentication form must retain a distinct non-retryable error code; neither should masquerade as a retryable access challenge.

For a failed main navigation, diagnostics SHOULD include only bounded operational fields:

```text
HTTP status
final URL
server name when present
cf-mitigated value when present
Cloudflare Ray ID when present
capture mode: headless or headed
```

Diagnostics MUST NOT dump cookies, authorization headers, complete request or response headers, challenge HTML, remote page source, or personal browser data.

Ordinary 404, 410, and 500 responses without challenge evidence remain `CAPTURE_HTTP_ERROR` and MUST NOT open a visible retry.

## E-00. One visible-browser retry

If and only if the normalized headless attempt fails with `CAPTURE_ACCESS_CHALLENGE`, the authoring pipeline should:

```text
close the failed headless browser
log one concise warning that a visible retry is beginning
launch the same bundled Chromium with headless: false
create a new isolated context
attempt the complete capture once
close the visible browser and context on every outcome
```

The visible attempt MUST use bundled Chromium already owned by Playwright. It MUST NOT depend on an installed Chrome channel, external browser profile, browser extension, additional executable, or new npm package.

The retry is automatic because this is a local authoring command and the user explicitly prefers one visible recovery attempt over performing the complete operation manually.

There must be no retry loop. The maximum number of remote page attempts is two:

```text
1 normalized headless attempt
1 headed attempt after a confirmed access challenge
```

Timeouts, DNS failures, TLS failures, ordinary HTTP failures, invalid content, missing capture regions, adapter failures, JPEG validation failures, and repository failures MUST NOT trigger the headed retry.

If the headed browser cannot launch or the headed attempt also fails, the final diagnostic must preserve the original challenge code and summarize the headed failure. The repository must remain unmodified.

## F-00. Attempt ownership and cleanup

Browser launch and retry ownership should be centralized rather than duplicated throughout the authoring command.

A small dependency-free capture-session helper may own:

```text
browser launch
default user-agent discovery
headless user-agent normalization
challenge-only retry decision
attempt logging
browser cleanup
```

The existing `capturePage` function remains responsible for one isolated page-capture attempt and should accept explicit capture-profile inputs such as `userAgent` and `captureMode`.

Every browser and context must close on success, expected failure, unexpected failure, and retry transition. A failed first attempt must not leave a hidden process behind while the visible retry runs.

The authoring command's existing temporary-directory cleanup, lock cleanup, duplicate detection, rollback behavior, and commit sequence remain unchanged.

## G-00. Diagnostics and operator experience

Normal successful operation should remain quiet and familiar. With debug logging enabled, the pipeline should make the chosen behavior understandable without exposing sensitive information.

Useful debug messages include:

```text
capture attempt mode
whether the headless product token was normalized
main-document status and challenge marker
whether a headed retry was eligible and attempted
which attempt ultimately succeeded
```

When a visible retry begins, one non-debug warning is appropriate so the browser window is not surprising.

The generated record and preview must be identical in structure regardless of whether headless or headed capture succeeds. Capture mode is operational state, not published journal metadata.

## H-00. Focused validation

Implementation must include deterministic local tests for:

```text
HeadlessChrome token normalization preserves the exact version and platform text
an already normal Chrome user agent remains unchanged
an empty or malformed discovered user agent fails clearly
cf-mitigated: challenge is classified as CAPTURE_ACCESS_CHALLENGE
ordinary HTTP 404 remains CAPTURE_HTTP_ERROR
only CAPTURE_ACCESS_CHALLENGE triggers a headed retry
the retry happens at most once
primary and fallback browsers close on success and failure
the original challenge is preserved if the headed attempt fails
ordinary generic capture remains unchanged
```

A live validation against a representative LeetCode problem should confirm:

```text
normalized headless response is HTTP 200
the final URL is the actual problem page
the title and description come from target content rather than a challenge
the JPEG is exactly 1200 x 630
the preview shows recognizable problem content rather than a challenge screen
```

The live target check is diagnostic evidence, not a permanently network-dependent automated test.

## I-00. Acceptance criteria

JULIET is complete only when all of the following are true.

### Primary capture

* [ ] Normal authoring still begins with headless bundled Chromium.
* [ ] The headless-only product token is removed without hard-coding a browser version.
* [ ] No automation-control, canvas, WebGL, proxy, CAPTCHA, or persistent-profile workaround is added.
* [ ] Ordinary websites retain the existing generic and adapter capture behavior.

### Challenge handling

* [ ] `cf-mitigated: challenge` produces `CAPTURE_ACCESS_CHALLENGE`.
* [ ] Ordinary HTTP errors remain distinguishable and do not trigger headed mode.
* [ ] Diagnostics are bounded and omit cookies, credentials, full headers, and page source.
* [ ] A confirmed challenge receives at most one visible bundled-Chromium retry.
* [ ] All browser processes and contexts close on every path.
* [ ] Failure leaves the repository unchanged.

### Produced result

* [ ] A representative LeetCode problem captures successfully in normalized headless mode.
* [ ] The result uses actual page content, not a reconstructed API card or challenge page.
* [ ] Metadata is useful and sanitized through the established pipeline.
* [ ] The final preview passes the exact JPEG dimension and validity contract.
* [ ] The preview is visually inspected for meaningful content, clipping, and challenge artifacts.

## J-00. Implementation note for Codex

Codex must keep the production change smaller than the investigation. The evidence supports one exact user-agent correction and a narrowly gated fallback; it does not support a broad stealth framework.

Implement the shared behavior first. Add a LeetCode adapter only if post-implementation capture still cannot produce a valid real-page preview. Do not add dependencies. Validate with controlled fixtures before the live target, and do not add the live LeetCode link to the journal merely to test capture.
