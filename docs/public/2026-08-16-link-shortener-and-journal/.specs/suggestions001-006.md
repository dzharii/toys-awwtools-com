2026-08-16

# 2026-08-16.FOXTROT.A-00

## A-00. Diagnostics, Errors, and Local Telemetry

This specification defines how the project reports what it is doing, how failures are represented, what information is written to the console, what information is shown directly to the user, and how an implementation can be troubleshot without adding temporary diagnostic code.

It applies across the complete project:

```text
local link-authoring command
repository validation
Playwright navigation and capture
metadata extraction and sanitization
JPEG generation
record generation
manifest mutation
journal manifest loading
journal record loading
browser caching
journal presentation
page interaction where failures are meaningful
```

The project deliberately has no remote observability backend. "Telemetry" in this specification means local structured diagnostic events, operation timing, warnings, and errors available through the terminal or browser console. Nothing is transmitted to a monitoring service.

The primary operational objective is simple:

> When an important operation fails, the user should understand what failed and what, if anything, they can do about it. A developer inspecting the console should have enough additional context to diagnose the failure without modifying the application merely to discover basic state.

This specification also contains the final cross-system acceptance scenarios. "System acceptance" means verifying that the individually specified components work correctly together as one finished application. It is not a separate subsystem.

## B-00. Diagnostic philosophy

Errors interrupt the user. They should therefore justify the interruption.

A useful user-facing error answers, as compactly as possible:

```text
What was the application trying to do?
What happened?
What specific object or input was involved?
Can the user take a meaningful action?
```

A useful diagnostic error additionally answers:

```text
Which module reported it?
Which processing stage failed?
Which operation was running?
What important parameters were involved?
What underlying error or status was observed?
What had already changed before the failure?
Was rollback attempted?
Did rollback succeed?
How long had the failed stage been running?
```

These two audiences must not be confused.

The user-facing message is concise and carefully written.

The diagnostic representation is more detailed and belongs in the terminal or browser console.

The implementation MUST NOT solve this distinction by showing raw internal exceptions directly to the user.

Likewise, it MUST NOT solve diagnostics by producing only a friendly sentence and discarding the technical context required to investigate the problem.

The intended flow is:

```text
low-level failure
       |
       v
construct normalized diagnostic error
       |
       +----> format concise user-facing message
       |
       +----> format detailed console diagnostic
```

The same underlying failure therefore produces two intentionally different representations.

## C-00. Common diagnostic model

Errors and important warnings should pass through a small common diagnostic representation rather than being formatted independently at every call site.

The project does not require an error framework. A small set of plain objects, helper functions, and formatter functions is sufficient.

A diagnostic error should conceptually contain the following information when applicable:

| Field         | Purpose                                       |
| ------------- | --------------------------------------------- |
| `code`        | Stable machine-readable error identifier      |
| `module`      | Component reporting the failure               |
| `stage`       | Logical operation stage                       |
| `summary`     | Short human-readable statement of what failed |
| `reason`      | Specific observed reason                      |
| `context`     | Relevant parameters and resources             |
| `action`      | Useful user action, only when one exists      |
| `operationId` | Correlates messages from one operation        |
| `cause`       | Original exception or lower-level failure     |
| `severity`    | `warning` or `error`                          |
| `userVisible` | Whether direct user notification is required  |

Not every failure requires every field. Missing information MUST NOT be replaced with meaningless placeholders.

For example, this is useful:

```text
code: AUTHORING_DUPLICATE
module: authoring
stage: duplicate detection
target: https://example.com/article
existingId: aB7kP2xQ
existingPath: lnk/aB7kP2xQ/
```

This is not useful:

```text
code: ERROR
module: app
reason: unknown
data: {}
```

The common representation exists to ensure consistency, not to create bureaucratic error objects.

### Stable error codes

Important failure classes MUST have stable error codes.

Recommended code families are:

```text
AUTHORING_*
REPOSITORY_*
CAPTURE_*
IMAGE_*
MANIFEST_*
RECORD_*
CACHE_*
JOURNAL_*
INTERACTION_*
```

Examples:

```text
AUTHORING_INVALID_URL
AUTHORING_DUPLICATE

REPOSITORY_INVALID_MANIFEST
REPOSITORY_MISSING_PREVIEW

CAPTURE_NAVIGATION_TIMEOUT
CAPTURE_ACCESS_CHALLENGE
CAPTURE_NO_VALID_REGION

IMAGE_JPEG_CONVERSION_FAILED

MANIFEST_FETCH_FAILED
MANIFEST_INVALID_ID
MANIFEST_DUPLICATE_ID

RECORD_FETCH_FAILED
RECORD_ID_MISMATCH
RECORD_INVALID_TARGET

CACHE_READ_FAILED
CACHE_WRITE_FAILED

JOURNAL_PREVIEW_LOAD_FAILED
```

Codes should describe the failure class rather than the implementation function that happened to throw it.

Do not create a unique error code for every branch in the program.

## D-00. Operation context and correlation

An important operation should establish a diagnostic context at its beginning.

For the local authoring tool, one invocation that attempts to add one link is one operation.

For example:

```text
Operation:
  add link

Target:
  https://example.com/article

Operation ID:
  add-k7M3qP
```

The operation ID only needs to be unique enough for one local diagnostic session. A short random suffix is sufficient.

The operation ID is useful because a single add operation may produce logs from:

```text
authoring
repository
Playwright
capture
image conversion
record generation
manifest update
rollback
```

All messages produced for that operation should carry the same operation ID internally and in DEBUG diagnostics.

The browser journal similarly establishes a session identifier and may establish shorter request identifiers for manifest refreshes when useful. This should remain lightweight. A distributed-tracing system is not required.

### Context inheritance

Lower-level helpers should receive or inherit the current diagnostic context instead of reconstructing it independently.

For example, the capture module should already know:

```text
operation ID
target URL
short ID when generated
```

when it reports a screenshot failure.

This avoids errors such as:

```text
Screenshot failed.
```

when the authoring command is processing a specific target and already knows exactly which target failed.

The implementation should make important context available at the point where errors are created, not attempt to recover it later from console history.

## E-00. Console logging contract

The terminal and browser console are the project's primary troubleshooting tools.

Console output must therefore be intentionally designed.

The implementation SHOULD provide a small logging helper with conceptual levels:

```text
INFO
WARN
ERROR
DEBUG
```

A logging framework is unnecessary.

### INFO

`INFO` communicates important normal state transitions.

Examples include:

```text
authoring operation started
repository validated
target navigation started
preview selected
record committed
manifest loaded
journal page requested
manifest refresh detected changes
```

INFO output should remain sparse.

It should not log every DOM operation, every cache lookup, or every rendering update.

### WARN

`WARN` communicates a condition that was unexpected or degraded but from which the operation can continue.

Examples include:

```text
description became empty after sanitization
persistent browser cache is unavailable
stale cached record is being used
nonessential overlay was hidden
optional font failed to load
```

Warnings should explain the fallback that occurred.

### ERROR

`ERROR` communicates an operation-ending failure or an individual journal record that could not be loaded.

The error must include enough context to identify the affected resource and failure stage.

### DEBUG

`DEBUG` contains detailed troubleshooting information that would make normal output unnecessarily noisy.

Examples include:

```text
candidate screenshot scores
cache ages
request timing
resolved repository paths
metadata source selection
page crop coordinates
child-process stderr
manifest generation number
page camera coordinates
```

DEBUG logging may be enabled through one simple development mechanism. A complicated dynamic logging configuration is unnecessary.

## F-00. Console messages must be formatted, not dumped

The project MUST NOT rely on browser object inspection as the primary diagnostic representation.

This is prohibited as the normal form:

```javascript
console.error(errorObject);
```

Likewise:

```javascript
console.log("failed", someLargeObject);
```

is insufficient because its usefulness depends on console implementation, object mutation, expansion state, and developer interpretation.

A bare object may be attached as secondary DEBUG information when genuinely useful, but the primary message MUST be self-contained text.

`JSON.stringify()` is preferable to an opaque object reference when a stable serialized snapshot is specifically needed, but it is still not an acceptable substitute for deliberate error formatting.

This is also insufficient:

```javascript
console.error(JSON.stringify(error));
```

when the user or developer then has to interpret a dense object such as:

```text
{"code":"ENOENT","path":"...","syscall":"open","errno":-2}
```

The project should instead transform known information into a deliberate representation.

For example:

```text
[ERROR] [repository] Record validation failed

Operation:
  add-k7M3qP

ID:
  aB7kP2xQ

Record:
  lnk/aB7kP2xQ/

Reason:
  Required preview "preview.jpg" does not exist.

Stage:
  repository validation
```

When structured details are valuable for DEBUG tracing, a helper MAY serialize a bounded context object after the human-readable diagnostic:

```text
Context:
  {"id":"aB7kP2xQ","path":"lnk/aB7kP2xQ/","expected":"preview.jpg"}
```

Such serialization MUST:

```text
use a bounded size
omit sensitive information
avoid circular references
avoid enormous HTML or DOM objects
represent the state at the time of logging
```

The serialized context supports the formatted diagnostic. It does not replace it.

## G-00. User-facing error language

User-facing errors should be brief, specific, and respectful of the user's time.

Because the application has interrupted an intended action, important user-facing failures begin with a short apology.

The apology should sound natural rather than ceremonial.

The project intentionally uses slightly different apology openings for major subsystems. This provides a subtle additional clue about where the failure occurred without exposing internal terminology.

The standard families are:

| Origin                   | Preferred opening style                            |
| ------------------------ | -------------------------------------------------- |
| Local add-link workflow  | `Sorry, I couldn't add this link.`                 |
| Page capture             | `Sorry, I couldn't capture this page.`             |
| Repository consistency   | `Sorry, the link archive needs attention.`         |
| Journal loading          | `Sorry, I couldn't load this part of the journal.` |
| Network refresh          | `Sorry, I couldn't refresh the journal right now.` |
| Individual journal entry | `Sorry, this link couldn't be loaded.`             |

These are patterns, not strings that must be duplicated mechanically.

Small variations are encouraged where they make the message more natural:

```text
Sorry, I couldn't add this link.

I'm sorry, this page could not be captured.

Sorry, this part of the journal is temporarily unavailable.

I'm sorry, the archive contains an invalid link record.
```

The variation should remain controlled. An error message should not become playful, theatrical, or excessively apologetic.

One short sincere apology is sufficient.

### Error structure

A user-facing error should normally follow this conceptual order:

```text
short apology and outcome

specific reason

important context

action, but only when useful
```

For example:

```text
Sorry, I couldn't add this link.

The URL uses an unsupported scheme.

URL:
  file:///Users/me/article.html

Expected:
  An absolute http:// or https:// URL.
```

The invariant is stated once.

Do not then add:

```text
Please enter a valid HTTP or HTTPS URL because file URLs are not valid.
```

That merely repeats the same information.

### Do not invent generic remedies

The application MUST NOT automatically append generic advice such as:

```text
Restart your browser.
Try restarting your computer.
Contact your administrator.
Try again later.
Check with support.
```

unless that action is genuinely appropriate to the specific failure.

If the application does not know a meaningful next action, the error should simply explain what happened.

For example:

```text
Sorry, I couldn't capture this page.

The page rendered an anti-bot challenge instead of the requested content.

Target:
  https://example.com/article
```

No fabricated resolution step is required.

## H-00. Local authoring errors

The local add-link command has the richest diagnostic context and should use it.

The terminal is both the user interface and the developer diagnostic surface. A fatal authoring failure therefore prints a concise formatted user message followed, when useful, by additional diagnostic context.

### Invalid URL

Example:

```text
Sorry, I couldn't add this link.

The URL uses an unsupported format.

Value:
  example.com/article

Expected:
  An absolute http:// or https:// URL.
```

Console diagnostic:

```text
[ERROR] [authoring] Invalid target URL

Operation:
  add-c2P9Lm

Stage:
  input validation

Input:
  example.com/article

Rule:
  Target must parse as an absolute HTTP or HTTPS URL.

Error code:
  AUTHORING_INVALID_URL
```

This pattern MUST also be applied to other authoring validation failures: explain the specific invalid input, state the accepted boundary once, and avoid repeating it in different wording.

### Duplicate URL

Example:

```text
Sorry, I couldn't add this link because it is already in the journal.

Target:
  https://example.com/article

Existing short link:
  https://example.github.io/project/lnk/aB7kP2xQ/

Record:
  lnk/aB7kP2xQ/
```

No additional "fix" is necessary. The user now knows where the existing link is.

Console diagnostic adds:

```text
[WARN] [authoring] Duplicate target detected

Operation:
  add-c2P9Lm

Stage:
  duplicate detection

Target:
  https://example.com/article

Existing ID:
  aB7kP2xQ

Manifest position:
  12

Result:
  No repository files were changed.

Error code:
  AUTHORING_DUPLICATE
```

The same principle MUST be used in similar idempotent or already-existing conditions: tell the user what already exists and where it exists.

### Missing dependency

Example:

```text
Sorry, I couldn't create this link.

ImageMagick is not available, so the JPEG preview cannot be generated.

Missing command:
  magick

Action:
  Install ImageMagick and make the "magick" command available in PATH.
```

Diagnostic output additionally includes the detected PATH or dependency probe when DEBUG logging is enabled.

The action is included because it is specific and directly resolves the failure.

Similar missing-dependency errors MUST identify the exact missing capability rather than reporting a generic environment problem.

### Repository inconsistency

Example:

```text
Sorry, the link archive needs attention before a new link can be added.

Record:
  lnk/aB7kP2xQ/

Problem:
  preview.jpg is missing.

No files were changed.
```

Console diagnostic:

```text
[ERROR] [repository] Existing repository is inconsistent

Operation:
  add-c2P9Lm

Stage:
  repository validation

ID:
  aB7kP2xQ

Expected:
  lnk/aB7kP2xQ/preview.jpg

Observed:
  File does not exist.

Result:
  Add operation stopped before browser launch.

Error code:
  REPOSITORY_MISSING_PREVIEW
```

This pattern MUST be applied to every repository invariant that can stop authoring. The diagnostic should identify the exact record, path, and violated invariant.

## I-00. Capture and preview errors

Capture failures require enough context to distinguish network, rendering, access, selection, and image-processing problems.

### Navigation timeout

User-facing:

```text
Sorry, I couldn't capture this page.

The page did not finish its initial navigation within 30 seconds.

Target:
  https://example.com/article
```

Diagnostic:

```text
[ERROR] [capture] Page navigation timed out

Operation:
  add-c2P9Lm

Stage:
  page navigation

Target:
  https://example.com/article

Timeout:
  30000 ms

Browser:
  Chromium

Elapsed:
  30.1 s

Error code:
  CAPTURE_NAVIGATION_TIMEOUT
```

There is no instruction to restart the browser because that is not supported by the observed failure.

Similar timeouts MUST identify which bounded operation expired and the configured limit.

### Access challenge

User-facing:

```text
I'm sorry, this page could not be captured.

The site showed an access challenge instead of the requested content.

Target:
  https://example.com/article
```

Diagnostic:

```text
[ERROR] [capture] Target content blocked by access challenge

Operation:
  add-c2P9Lm

Stage:
  page readiness

Target:
  https://example.com/article

Final URL:
  https://example.com/challenge

Detected state:
  anti-bot challenge

Result:
  Preview generation stopped.

Error code:
  CAPTURE_ACCESS_CHALLENGE
```

Do not suggest bypassing the challenge.

The same rule applies to authentication walls, CAPTCHA pages, and other access barriers.

### No valid preview region

User-facing:

```text
Sorry, I couldn't create a useful preview for this page.

The page loaded, but no visible region met the minimum preview requirements.

Target:
  https://example.com/page
```

Diagnostic:

```text
[ERROR] [capture] No valid preview region found

Operation:
  add-c2P9Lm

Stage:
  preview selection

Target:
  https://example.com/page

Search height:
  4000 CSS px

Candidates inspected:
  27

Candidates passing validity checks:
  0

Fallback attempted:
  yes

Error code:
  CAPTURE_NO_VALID_REGION
```

DEBUG output may then show bounded candidate details.

This pattern MUST be used for similar heuristic failures: the user sees the outcome; diagnostics expose the measurements that explain why the algorithm reached it.

### JPEG conversion failure

User-facing:

```text
Sorry, I couldn't finish the preview image.

The screenshot was captured, but JPEG conversion failed.

Target:
  https://example.com/article
```

Diagnostic:

```text
[ERROR] [image] JPEG conversion failed

Operation:
  add-c2P9Lm

Stage:
  JPEG conversion

Input:
  /tmp/link-capture-k8Lm/source.png

Output:
  /tmp/link-capture-k8Lm/preview.jpg

Tool:
  magick

Exit status:
  1

stderr:
  <bounded converter message>

Error code:
  IMAGE_JPEG_CONVERSION_FAILED
```

The converter output MUST be bounded so a pathological child process cannot flood the terminal.

Similar external-tool failures MUST report executable, exit status, relevant paths, and bounded stderr.

## J-00. Mutation and rollback errors

Repository writes deserve especially clear diagnostics because the user needs to know whether manual repair may be necessary.

The command should track its mutation state explicitly.

Conceptually:

```text
temporary work only
        |
record committed
        |
manifest committed
        |
post-write validation complete
```

An error report should therefore be able to state what had already happened.

### Manifest update failed, rollback succeeded

User-facing:

```text
Sorry, I couldn't add this link.

The new record was created, but links.txt could not be updated.

The generated record was removed successfully, so the repository was restored to its previous state.

Manifest:
  links.txt
```

Diagnostic:

```text
[ERROR] [repository] Manifest update failed

Operation:
  add-c2P9Lm

Stage:
  manifest update

New ID:
  aB7kP2xQ

Manifest:
  links.txt

Primary failure:
  Permission denied while replacing manifest.

Rollback:
  succeeded

Removed:
  lnk/aB7kP2xQ/

Repository state:
  restored

Error code:
  REPOSITORY_MANIFEST_WRITE_FAILED
```

### Manifest update failed, rollback also failed

User-facing:

```text
I'm sorry, the link could not be added cleanly.

The manifest update failed, and the generated record could not be removed during rollback.

Manual repair may be required.

Affected record:
  lnk/aB7kP2xQ/

Manifest:
  links.txt
```

Diagnostic:

```text
[ERROR] [repository] Operation failed and rollback was incomplete

Operation:
  add-c2P9Lm

Primary stage:
  manifest update

Primary failure:
  Permission denied while replacing links.txt.

Rollback stage:
  remove generated record

Rollback failure:
  Permission denied removing lnk/aB7kP2xQ/.

Possible remaining mutation:
  lnk/aB7kP2xQ/

Repository state:
  uncertain

Error code:
  REPOSITORY_ROLLBACK_FAILED
```

When rollback fails, the user MUST be told explicitly that repository state may require manual inspection.

The application MUST NOT print only the original manifest exception and hide the rollback error.

This same principle applies to every operation where a cleanup or rollback action fails after the primary failure.

## K-00. Journal and network errors

The browser journal should communicate failures without turning normal browsing into a sequence of intrusive dialogs.

Errors should appear at the scope where they occur.

A manifest failure affects the complete journal and therefore warrants a journal-level message.

One record failure affects one grid position and should remain inside that entry.

A preview JPEG failure affects only the visual preview and should remain inside the preview area.

A persistent cache failure is usually nonfatal and should normally produce only a console warning.

The scope of the message must match the scope of the failure.

### Manifest unavailable

User-facing journal-level state:

```text
Sorry, I couldn't load the journal.

The link list could not be retrieved.

Resource:
  links.txt

Action:
  Check the network connection and reload this page.
```

The action is appropriate when the browser reports a network failure.

For an HTTP 404, use a different message:

```text
Sorry, I couldn't load the journal.

The published link manifest is missing.

Resource:
  links.txt
```

Do NOT advise checking the user's network when the server returned a definite 404.

Console diagnostic:

```text
[ERROR] [manifest] Manifest request failed

Session:
  journal-r4Nx2

Stage:
  manifest fetch

URL:
  https://example.github.io/project/links.txt

Failure:
  HTTP 404

Elapsed:
  86 ms

Error code:
  MANIFEST_FETCH_FAILED
```

Similar network errors MUST distinguish connection failure, timeout, and HTTP response failure where that information is available.

### Invalid manifest

User-facing:

```text
I'm sorry, the journal data is invalid and cannot be loaded safely.

Manifest:
  links.txt

Problem:
  Line 17 contains an invalid link ID.
```

Console:

```text
[ERROR] [manifest] Invalid manifest ID

Session:
  journal-r4Nx2

Stage:
  manifest validation

Line:
  17

Value:
  bad/id

Expected:
  Exactly 8 characters using A-Z, a-z, or 0-9.

Error code:
  MANIFEST_INVALID_ID
```

Similar manifest-validation failures MUST identify the affected line or duplicate positions.

### One missing journal record

The journal should not display a global modal.

The failed grid position shows:

```text
Sorry, this link couldn't be loaded.

The journal record is missing.

Retry
```

The browser console contains:

```text
[ERROR] [record] Journal record request failed

Session:
  journal-r4Nx2

ID:
  aB7kP2xQ

Stage:
  record fetch

URL:
  https://example.github.io/project/lnk/aB7kP2xQ/index.html

HTTP status:
  404

Manifest index:
  13

Page:
  3

Error code:
  RECORD_FETCH_FAILED
```

This pattern MUST be used for other individual-record failures. A local record problem stays local to its card while detailed diagnostic context remains available in the console.

### Record ID mismatch

User-facing entry:

```text
I'm sorry, this journal entry is invalid.

Its stored identity does not match the link requested.
```

Console:

```text
[ERROR] [record] Record identity mismatch

Session:
  journal-r4Nx2

Requested ID:
  aB7kP2xQ

Stored lnk:id:
  XXXXXX12

Stage:
  record validation

Record:
  .../lnk/aB7kP2xQ/index.html

Error code:
  RECORD_ID_MISMATCH
```

Do not attempt to guess which identity is correct.

Similar integrity failures MUST report the expected and observed values once.

### Preview image failure

The journal card keeps its title, source, and date.

The preview area displays a quiet message such as:

```text
Preview unavailable
```

A full apology is unnecessary inside the small image rectangle because the link itself remains usable.

Console:

```text
[WARN] [journal] Preview image failed to load

Session:
  journal-r4Nx2

ID:
  aB7kP2xQ

Preview:
  .../lnk/aB7kP2xQ/preview.jpg

Entry remains usable:
  yes

Error code:
  JOURNAL_PREVIEW_LOAD_FAILED
```

The user-facing severity should therefore match actual impact.

## L-00. Cache diagnostics

Caching is an optimization. Cache problems should almost never interrupt the user.

### localStorage unavailable

No user-facing error is required.

Console:

```text
[WARN] [cache] Persistent journal cache is unavailable

Stage:
  cache initialization

Reason:
  localStorage access raised SecurityError.

Fallback:
  in-memory cache for this session

Journal loading:
  continuing
```

### Corrupt cached value

No user-facing error is required.

Console:

```text
[WARN] [cache] Invalid cached entry was discarded

ID:
  aB7kP2xQ

Cache key:
  lnk-journal:entry:aB7kP2xQ

Reason:
  Cached value is not valid JSON.

Action taken:
  Deleted cached value and requested current record.
```

### Stale fallback

The user may receive a tiny `Cached` indicator in the card as defined by ECHO.

Console:

```text
[WARN] [cache] Using stale entry after network failure

ID:
  aB7kP2xQ

Cache age:
  1h 18m

Current manifest contains ID:
  yes

Network failure:
  request timed out after 15s

Fallback:
  stale cached metadata
```

The same approach MUST be used for similar cache degradation: do not interrupt the user when the journal can continue correctly, but record the fallback clearly.

## M-00. Formatting helpers

The implementation SHOULD centralize error presentation in a small number of formatter functions.

Conceptually:

```text
createDiagnosticError(...)
formatConsoleError(...)
formatUserError(...)
logInfo(...)
logWarning(...)
logError(...)
```

The exact names are not important.

The purpose is to prevent every module from inventing its own punctuation, field ordering, stack handling, and object dumping behavior.

The formatter should provide consistent presentation for fields such as:

```text
Operation
Session
Stage
Target
ID
URL
Record
Manifest
Reason
Expected
Observed
Action
Result
Rollback
Error code
```

Fields that do not apply should be omitted rather than displayed empty.

### Field ordering

Console errors should generally put the most identifying information first:

```text
summary
operation/session
stage
primary resource
reason
important parameters
result or rollback
error code
```

This makes the message readable from top to bottom without requiring the developer to mentally reconstruct a JSON object.

### Parameter formatting

Parameters should be labeled.

Prefer:

```text
Timeout:
  30000 ms
```

over:

```text
30000
```

Prefer:

```text
Candidate count:
  27
```

over:

```text
count=27
```

for multiline error reports.

Compact single-line DEBUG events may use:

```text
stage=record-fetch id=aB7kP2xQ source=cache durationMs=4
```

where appropriate.

The two formats serve different purposes.

## N-00. Error causes and stack traces

Underlying exception information is valuable to developers but should not overwhelm normal user-facing output.

For known operational failures, the formatted reason should come first.

For example:

```text
Reason:
  Could not replace links.txt because the filesystem denied write access.
```

The raw Node.js cause may then appear in DEBUG output:

```text
Cause:
  EACCES: permission denied, rename ...
```

Unexpected programming errors should retain their stack trace in diagnostic output.

The implementation MUST NOT discard stack traces for genuinely unexpected exceptions.

At the same time, expected user conditions such as duplicate URLs or invalid input should not print frightening stack traces by default.

The distinction is:

```text
expected operational error
-> formatted diagnostic
-> normally no stack

unexpected programming error
-> formatted diagnostic
-> stack included
```

## O-00. Context safety and bounded diagnostics

Diagnostics should contain enough information to troubleshoot the operation, but they must not indiscriminately dump application state.

The following MUST NOT be logged as normal diagnostic context:

```text
complete HTML documents
complete DOM trees
binary screenshot contents
base64 images
cookies
authorization headers
browser localStorage from target pages
target-page session data
complete browser profiles
unbounded child-process output
```

Remote metadata excerpts should be bounded.

If an extracted title needs to be shown for diagnostics, a short sanitized preview is sufficient.

Paths, short IDs, target URLs, HTTP status, timing, crop rectangles, cache ages, and error codes are appropriate diagnostic context.

Target URLs are already central project data, but they must not be transmitted anywhere as telemetry.

## P-00. Local telemetry and timing

The project does not use remote analytics.

It SHOULD collect useful local timing information so slow behavior can be diagnosed from DEBUG output.

For an add-link operation, useful stage timings include:

```text
repository validation
duplicate scan
browser launch
page navigation
page stabilization
metadata extraction
candidate analysis
preview capture
JPEG processing
HTML generation
manifest update
post-write validation
total operation
```

Example:

```text
[DEBUG] [authoring] Operation timing

Operation:
  add-c2P9Lm

Repository validation:
  18 ms

Duplicate scan:
  31 ms

Browser launch:
  412 ms

Navigation:
  1.84 s

Page stabilization:
  2.11 s

Preview selection:
  96 ms

Screenshot:
  173 ms

JPEG processing:
  44 ms

Repository commit:
  11 ms

Total:
  4.79 s
```

For the journal, useful timing includes:

```text
manifest fetch
manifest parsing
visible page resolution
cache hits
network record count
individual slow fetches
prefetch duration
manifest refresh
```

Example:

```text
[DEBUG] [journal] Visible spread resolved

Session:
  journal-r4Nx2

Pages:
  5-6

Entries:
  12

Memory cache hits:
  4

Persistent cache hits:
  5

Network records:
  3

Failed records:
  0

Elapsed:
  138 ms
```

Timing telemetry should be produced locally and on demand. No timing data is uploaded.

## Q-00. Logging successful operations

Diagnostics must not focus only on failure.

A successful operation should leave enough high-level evidence to understand what occurred.

A normal add-link run might produce:

```text
[INFO] Adding link
  https://example.com/article

[INFO] Repository validated.

[INFO] Opening target in Chromium.

[INFO] Page ready.

[INFO] Preview selected and captured.

[INFO] Link added.

ID:
  aB7kP2xQ

Short URL:
  https://example.github.io/project/lnk/aB7kP2xQ/

Record:
  lnk/aB7kP2xQ/

Preview:
  lnk/aB7kP2xQ/preview.jpg
```

The output does not need to expose every internal stage unless DEBUG mode is enabled.

A successful journal startup might record only:

```text
[INFO] Journal loaded: 147 links.
```

with detailed cache and network counts available in DEBUG output.

## R-00. Unexpected failures

Not every possible bug can have a handcrafted error code.

The implementation must therefore have a final unexpected-error boundary for both authoring and journal runtime.

### Authoring unexpected error

User-facing terminal output:

```text
I'm sorry, the link operation stopped because of an unexpected internal error.

Stage:
  preview capture

Target:
  https://example.com/article

No success was reported.
```

Diagnostic output MUST include:

```text
operation ID
module
last known stage
target
mutation state
original error name
original error message
stack trace
rollback result when mutation had begun
```

### Browser unexpected error

A fatal journal startup exception should produce a restrained journal-level error:

```text
Sorry, the journal could not finish loading because of an unexpected error.

Reloading the page will retry the journal from its published data.
```

Reload advice is appropriate here only because the error represents unexpected ephemeral application state and reload genuinely restarts the static application.

The browser console must retain the full stack and current journal context.

An individual rendering error should be isolated to its entry or page where possible rather than destroying the entire journal.

## S-00. Error presentation must remain non-annoying

User notification should be proportional to impact.

The project should use this hierarchy:

| Failure scope                 | User presentation              |
| ----------------------------- | ------------------------------ |
| Complete authoring operation  | Formatted terminal error       |
| Complete journal cannot start | Journal-level inline error     |
| One journal record fails      | Error inside that card         |
| One preview image fails       | Placeholder inside preview     |
| Persistent cache unavailable  | No direct interruption         |
| Stale cache used              | Optional tiny status indicator |
| DEBUG-only anomaly            | Console only                   |

The project MUST NOT use repeated modal dialogs, browser `alert()` calls, or toast storms.

A page containing three failed records should contain three restrained failed positions because those positions represent three actual records. It should not additionally show three global notifications.

An error that the user cannot act on and that does not materially affect their current task usually belongs only in the console.

## T-00. Similar failures must follow the same design

The examples in this specification are not an exhaustive list of call sites.

They establish patterns that MUST be applied to comparable failures throughout the implementation.

For every newly introduced failure path, the coding agent must ask:

```text
What operation was being attempted?
Is the failure user-visible?
What is its scope?
What context is already known?
Is there a specific action the user can take?
What console information would be required to debug it?
Which existing error family is most similar?
```

A new error MUST NOT fall back to:

```text
Something went wrong.
```

simply because it was not explicitly illustrated in this document.

Likewise, similar failures should use the same field ordering, severity rules, contextual depth, and notification scope defined here.

## U-00. Troubleshooting scenarios

### Scenario: user reports that a link could not be added

The user provides the terminal output.

Without rerunning with modified code, a developer should normally be able to identify:

```text
target URL
operation ID
failed stage
error family
relevant repository path
whether files changed
rollback status
```

If deeper analysis is needed, DEBUG mode should add measurements and underlying causes rather than requiring new `console.log()` statements throughout the code.

### Scenario: a journal page contains one broken card

The visual card communicates that one link is unavailable.

The browser console identifies:

```text
short ID
manifest index
logical page
record URL
failure stage
HTTP or validation reason
error code
```

The other journal entries continue working.

### Scenario: journal is unexpectedly slow

DEBUG output should make it possible to determine whether time was spent in:

```text
manifest fetch
localStorage access
record network requests
record parsing
preview image loading
```

The developer should not need to insert timing probes manually before discovering the slow subsystem.

### Scenario: preview generation chooses no crop

The terminal user sees a short explanation that no usable preview could be created.

DEBUG output shows:

```text
search area
candidate count
top candidate scores
rejection reasons
fallback use
timing
```

The developer can therefore understand why selection failed without dumping the complete DOM.

### Scenario: repository mutation partially fails

The error explicitly says whether the generated record was committed, whether the manifest changed, whether rollback ran, and whether repository state is known to be restored.

The user is not left wondering whether rerunning the command will create another inconsistent record.

## V-00. Cross-system acceptance scenarios

The final project is accepted only when the major specifications work together correctly.

These scenarios do not introduce new architecture. They verify the completed system.

### Add, inspect, publish, share, and browse

The user runs the add-link command with a valid public URL.

The authoring tool validates the repository and dependencies, confirms the URL is not a duplicate, captures the page, generates a 1200 x 630 JPEG preview at approximately 90% quality, produces the short-link HTML, prepends the ID to `links.txt`, validates the result, and reports the new short URL.

The user can inspect a Git diff containing only the expected record and manifest changes.

After manual commit and GitHub Pages deployment, the short URL exposes the generated social metadata and redirects a browser to the original target.

The journal loads the new manifest, places the link at the newest position, parses its generated HTML, and displays its preview, title, source, and date.

No server application or remote database participates.

### Duplicate add

The user attempts to add a URL already present in the archive.

The command detects the duplicate before launching Playwright.

The terminal gives a concise apologetic explanation and identifies the existing record and short URL.

The console diagnostic identifies the duplicate-detection stage and operation ID.

No repository files change.

### Capture failure

A valid URL renders an access challenge.

The command reports that the content could not be captured because the target displayed an access challenge.

Diagnostic output identifies the target, final browser URL, stage, and error code.

No record or manifest mutation remains.

### Published repository inconsistency

The manifest references a missing record.

The journal itself still opens.

The affected grid position becomes an explicit failed entry.

The rest of the page remains usable.

The console identifies the missing ID, record URL, manifest index, and HTTP status.

### Network degradation with fresh cache

The manifest loads, and visible records are fresh in the one-hour cache.

The journal renders those entries without unnecessary record requests.

No warning is shown.

### Network degradation with stale cache

The current manifest successfully confirms that an ID still exists, but refreshing that individual record fails.

The journal may display the structurally valid stale cached entry with a subtle stale/cached indication.

The console records cache age and current network failure.

The user is not interrupted by a global error.

### Small-screen journal interaction

The journal does not shrink below its minimum readable size.

Normal wheel or touch scrolling reveals hidden content.

Ctrl + mouse wheel controls application zoom on supported desktop input.

Left-button drag pans the journal.

Touch pinch zoom works on mobile.

These interactions do not generate errors or noisy routine logs.

### Error traceability

For every intentional failure scenario in ALPHA through ECHO, the resulting console output contains enough stable context to identify:

```text
module
stage
affected resource
important parameters
reason
error code
```

and, where mutation occurred:

```text
mutation state
rollback result
```

This is the central diagnostic acceptance requirement.

## W-00. Acceptance criteria

FOXTROT is satisfied when the following statements are true.

Important operations establish reusable diagnostic context rather than reconstructing it after failure.

Errors use stable module and stage terminology.

Important failure families have stable error codes.

User-facing errors are concise, self-contained, and written deliberately rather than generated by dumping exception objects.

Important user-facing failures begin with a brief, natural apology appropriate to their subsystem.

Apologies vary in a controlled way between authoring, capture, repository, journal, and entry failures.

User-facing errors state the actual observed problem and relevant parameters without repeating the same invariant several times.

Specific remediation is provided only when the application knows a meaningful action.

Generic advice such as restarting the browser or contacting an administrator is not added automatically.

Console diagnostics identify the module, stage, operation or session context, relevant resource, reason, and error code.

Local authoring diagnostics identify the target URL and operation ID.

Mutation failures identify what changed and whether rollback succeeded.

Repository integrity failures identify the relevant ID and filesystem path.

Capture failures identify the target, capture stage, and relevant timeout, page state, crop data, or external-tool information.

Journal record failures identify the short ID, record URL, manifest position, and logical page where useful.

Network errors distinguish timeout, connection failure, and known HTTP status where available.

Cache failures that do not prevent normal operation do not unnecessarily interrupt the user.

A complete journal failure is presented at journal scope.

An individual record failure is presented at record scope.

A preview failure remains inside the preview area.

The implementation does not use browser `alert()` for ordinary errors.

The implementation does not produce repeated global notifications for record-local failures.

Bare object references are not used as the primary console diagnostic representation.

`JSON.stringify()` may support bounded DEBUG context but does not replace human-readable formatting.

Complete HTML, binary images, credentials, cookies, browser profiles, and similarly excessive state are not dumped into logs.

Unexpected programming errors retain useful stack traces.

Expected user errors do not print unnecessary stacks by default.

Useful local timing telemetry exists for expensive authoring and journal-loading stages.

No telemetry or diagnostic information is transmitted to a remote service.

The terminal and browser console normally provide enough information to diagnose a failure without adding temporary logging statements.

The examples in this specification have been generalized to all comparable failure paths rather than implemented only at the exact illustrated call sites.

The complete ALPHA-through-ECHO workflow passes the cross-system scenarios defined in this specification.

## X-00. Specification set complete

FOXTROT is the final planned specification in the current project set.

The completed specification sequence is:

```text
2026-08-16.ALPHA
Repository Model and Short-Link Format

2026-08-16.BRAVO
Link Authoring and Generation Workflow

2026-08-16.CHARLIE
Page Capture and Social Preview Generation

2026-08-16.DELTA
Journal Data Loading, Pagination, and Cache

2026-08-16.ECHO
Journal Presentation and Interaction

2026-08-16.FOXTROT
Diagnostics, Errors, and Local Telemetry
```

Implementation should treat these specifications as one coordinated contract. Where a later specification clarifies a cross-cutting behavior such as diagnostics or presentation, that clarification applies to the corresponding behavior defined in the earlier specifications.
