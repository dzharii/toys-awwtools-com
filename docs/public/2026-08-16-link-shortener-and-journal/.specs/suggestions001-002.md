2026-08-16

# 2026-08-16.BRAVO.A-00

## A-00. Link Authoring and Generation Workflow

This specification defines the local workflow used to add a new URL to the static link archive.

The workflow runs entirely on the user's local development machine. It validates the requested URL, verifies repository state, checks required local dependencies, detects duplicates, launches the target page in Playwright, extracts metadata, creates a visual preview, generates the short-link record, updates the manifest, and reports the result.

The command does not publish anything automatically. Deployment remains a separate manual Git workflow.

This specification is intentionally self-contained. It repeats relevant repository rules from `2026-08-16.ALPHA` where those rules directly constrain the authoring workflow.

## B-00. Motivation

Adding a link should be a single predictable local operation.

The user should not manually create directories, copy URLs into HTML, generate screenshots, update manifests, or remember metadata conventions.

The normal interaction should require only a target URL.

Conceptually:

```text
<add-link-command> https://example.com/article
```

The tool performs the remaining work.

The workflow must favor correctness over partial success. If a required stage fails, the repository should remain equivalent to its state before the command started.

The command should also explain failures clearly enough that the user can normally understand the problem from terminal output without opening the implementation or adding temporary debug statements.

## C-00. Runtime model

The authoring tool runs locally.

It may use Node.js for orchestration.

Playwright is the required browser automation technology.

ImageMagick, or an equivalent explicitly chosen command-line image processor, may be used for final JPEG conversion when needed.

The authoring tool is development tooling only.

The published website must not depend on:

```text
Node.js
Playwright
ImageMagick
node_modules
a local authoring process
```

The generated repository files remain ordinary static files.

## D-00. Command responsibility

One command invocation adds at most one URL.

Conceptually:

```text
add-link <url>
```

The exact executable filename may be chosen during implementation, but the normal interface must remain minimal.

A valid invocation requires exactly one target URL.

The command must not require the user to manually provide:

```text
short ID
title
description
preview filename
creation timestamp
manifest position
```

Those values are generated or extracted automatically.

Optional configuration required by the project as a whole may come from a small repository configuration mechanism, but the normal add-link invocation should still require only the URL.

## E-00. Successful workflow

A successful invocation performs these logical stages in order:

```text
validate command input
locate and validate repository
validate required dependencies
serialize target URL
validate existing repository records
detect duplicate target
generate unused short ID
launch target in Playwright
wait for usable page state
extract source metadata
sanitize title and description
capture visual preview
convert preview to JPEG
generate short-link HTML
validate generated record
commit generated directory
update links.txt
validate resulting repository state
report success
```

The implementation may divide these stages into functions, but observable behavior must preserve the same dependencies.

A later stage must not run when an earlier required stage has failed.

## F-00. Input validation

The command accepts one absolute URL using either:

```text
http:
https:
```

No other URL scheme is supported.

The input must be parsed using the standard URL parser available to the Node.js runtime.

The command must reject values such as:

```text
example.com/article
/articles/page
file:///tmp/page.html
javascript:alert(1)
mailto:user@example.com
```

A failure should identify the supplied value and explain that an absolute HTTP or HTTPS URL is required.

Example:

```text
Cannot add link.

Input:
  example.com/article

Reason:
  The target must be an absolute http:// or https:// URL.

Example:
  https://example.com/article
```

The precise visual formatting may differ. The information must not.

## G-00. URL serialization

After parsing, the URL must be serialized using the standard URL implementation.

The serialized form becomes the authoritative target stored in the generated record.

The tool must preserve:

```text
query string
query parameter order
URL fragment
path
port when explicitly relevant
```

The tool must not remove tracking parameters.

The tool must not sort query parameters.

The tool must not attempt to guess canonical article URLs.

The tool must not follow a remote site's canonical metadata and silently replace the supplied target with another URL.

The URL the user supplied, after normal parser serialization, is the URL represented by the short link.

## H-00. Repository discovery

The authoring command must run against the intended repository rather than creating files relative to an arbitrary current directory without validation.

Before generation, it must identify the repository root.

The implementation may determine this by walking upward from the script location or by another simple deterministic method.

The discovered root must contain the repository structures required by ALPHA.

At minimum, the tool must be able to resolve:

```text
links.txt
lnk/
```

If required repository structures are missing, the command must stop before launching Playwright or modifying files.

Example:

```text
Cannot add link.

Repository root:
  /home/user/projects/links

Reason:
  Required manifest "links.txt" was not found.
```

The workflow must not silently initialize a new repository.

Repository initialization is outside this specification.

## I-00. Preflight repository validation

Before processing a new URL, the tool must perform enough repository validation to avoid building on an already inconsistent state.

At minimum, it must verify:

```text
links.txt can be read
every non-empty manifest entry is a syntactically valid short ID
no short ID occurs more than once in links.txt
every manifest ID has lnk/<id>/index.html
every manifest ID has lnk/<id>/preview.jpg
every inspected record's lnk:id matches its directory name
```

The duplicate-target scan described later necessarily inspects stored target metadata and may detect additional inconsistencies.

If the repository is already inconsistent, the add operation must stop.

The tool must not attempt opportunistic repair unless a separate specification explicitly defines repair behavior.

## J-00. Dependency checks

Required local dependencies must be checked before expensive processing begins.

At minimum, the tool must verify that:

```text
Node.js runtime requirements are satisfied
Playwright can be invoked
the required Playwright browser can be launched
the configured JPEG conversion mechanism is available
```

A dependency being installed is not sufficient if it cannot actually be used.

For example, a Playwright package may exist while the required browser executable is absent.

The preflight should detect practical usability rather than merely checking that a filename exists.

## K-00. Dependency failure messages

Dependency errors must identify:

```text
which dependency failed
which operation could not be performed
the detected environment or executable when useful
the action the user should take
```

Example:

```text
Cannot add link.

Dependency:
  ImageMagick

Reason:
  The "magick" executable was not found in PATH.

Required for:
  Converting the generated social preview to preview.jpg.

Action:
  Install ImageMagick and make the "magick" command available in PATH.
```

The command must not continue with another format such as PNG simply because JPEG conversion is unavailable.

The repository format requires JPEG.

## L-00. Duplicate detection

A target that already exists must not be added again.

Duplicate detection compares the serialized requested URL against the stored `lnk:target` value of existing records.

The command must perform duplicate detection before launching the target page in Playwright.

This prevents unnecessary remote requests and screenshot work.

If a duplicate exists, the repository must remain unchanged.

## M-00. Duplicate error

The duplicate error must be actionable.

It must identify at least:

```text
requested URL
existing short ID
existing record path
```

When the public site base URL is known, it should also show the existing short URL.

Example:

```text
Link was not added because this target already exists.

Target:
  https://example.com/article

Existing ID:
  aB7kP2xQ

Record:
  lnk/aB7kP2xQ/

Short URL:
  https://example.github.io/project/lnk/aB7kP2xQ/
```

This condition is a normal user error, not an internal failure.

A stack trace should not be shown by default for a duplicate.

## N-00. Short ID generation

After duplicate validation succeeds, the tool generates an 8-character short ID using the alphabet defined by ALPHA:

```text
ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789
```

Generation must use a cryptographically secure random source provided by Node.js.

The candidate is valid only if:

```text
lnk/<candidate-id>/
```

does not already exist.

If it exists, the tool generates another candidate.

The implementation must never overwrite an existing directory.

A collision is not a user-visible error unless the generator fails repeatedly due to an abnormal implementation or filesystem condition.

## O-00. Creation time

The creation timestamp represents the successful creation of the record.

The timestamp must use UTC ISO 8601 format without milliseconds.

Example:

```text
2026-08-16T18:42:17Z
```

The timestamp may be captured during generation, but it must only become persistent if the record is successfully completed.

Retries caused by temporary internal operations during the same invocation do not create additional timestamps.

## P-00. Playwright launch

The target page must be loaded using Playwright.

Puppeteer must not be used.

The browser execution should be headless unless interactive debugging is explicitly enabled through a development-only mechanism.

The standard add-link workflow should not require a visible browser window.

The browser context should use a deterministic viewport configuration defined by the screenshot specification.

The command must log enough information to establish:

```text
which URL is being opened
which browser engine is being used
when navigation begins
when the page reaches the selected readiness condition
when capture analysis begins
```

Normal logs should remain concise.

## Q-00. Navigation behavior

The tool should navigate to the serialized target URL and allow normal HTTP redirects performed by the remote server.

The final page URL reached by Playwright may therefore differ from the stored target URL.

The stored `lnk:target` must still remain the user-supplied serialized target.

The final browser URL may be recorded in diagnostic logs when it differs.

Example:

```text
Navigation redirected.

Requested:
  https://example.com/a

Rendered:
  https://www.example.com/articles/a
```

The tool must not silently replace the stored target because of that redirect.

## R-00. Navigation failures

Failures such as these must abort generation:

```text
DNS failure
connection refusal
TLS failure that prevents loading
unsupported navigation
navigation timeout
browser crash
page creation failure
```

The error should identify the target and the failed stage.

Example:

```text
Unable to capture link.

Target:
  https://example.invalid/article

Stage:
  page navigation

Reason:
  Navigation timed out after 30 seconds.
```

The exact timeout value must be defined in the capture specification.

The repository must remain unchanged.

## S-00. Page readiness

A successful HTTP response alone does not guarantee that the page is visually ready.

The capture workflow must wait for the deterministic readiness policy defined by CHARLIE.

That policy may consider:

```text
DOM readiness
network quietness within a bounded period
font loading
image loading
lazy content
layout stability
overlay handling
```

BRAVO does not define the detailed algorithm.

BRAVO requires only that metadata extraction and screenshot capture occur after the shared page-readiness procedure has completed or reached its documented fallback state.

## T-00. Remote HTTP errors

A page returning an HTTP error status must not automatically be considered a valid successful capture.

Responses such as:

```text
404
410
500
502
503
```

should normally cause the command to fail.

The exact accepted HTTP status policy should remain simple.

A successful page is expected to resolve to a normal renderable document rather than an error page.

If the target produces an unusual but renderable response that requires special handling, that behavior must be specified explicitly rather than guessed.

## U-00. Metadata extraction

After the page reaches the capture-ready state, the tool extracts title and description candidates.

Metadata extraction must be deterministic and must not use AI.

The exact candidate priority is defined in CHARLIE, but typical sources may include:

```text
Open Graph title
document title
visible primary heading

Open Graph description
standard meta description
other deterministic page text fallback
```

The extraction algorithm must return raw candidate text to the sanitization stage.

Remote markup itself must never be copied directly into generated metadata.

## V-00. Text sanitization

All external title and description text must use the sanitization rules defined in ALPHA.

The allowed writing systems are:

```text
Latin
Cyrillic
Han
Hiragana
Katakana
```

Allowed internal ASCII punctuation is limited to:

```text
.
,
:
;
!
?
'
"
(
)
-
```

ASCII spaces are allowed.

Emoji, unsupported scripts, Unicode punctuation, Unicode symbols, formatting characters, and other disallowed characters must not survive.

Disallowed characters are replaced with spaces.

Runs of whitespace are collapsed to one ASCII space.

Leading and trailing whitespace is removed.

The final string is then trimmed from both ends until it begins and ends with an allowed letter.

## W-00. Empty metadata

If title sanitization produces an empty value, the title must become:

```text
(no title)
```

If description sanitization produces an empty value, the description must become:

```text
(no description)
```

These are fixed repository placeholders.

The authoring command must not fail merely because a source page has no usable title or description.

It should log that the fallback was used.

Example:

```text
Metadata fallback:
  Description contained no usable characters after sanitization.
  Using "(no description)".
```

## X-00. Metadata length

Title and description values must be bounded before writing generated records.

The implementation should not preserve arbitrarily large source metadata values.

The final limits must be:

```text
title: 160 characters maximum
description: 320 characters maximum
```

Length is measured after sanitization.

If a value exceeds its limit, it must be truncated without splitting a Unicode code point.

After truncation, trailing whitespace and trailing punctuation must be trimmed again so the stored value still ends with an allowed letter.

The implementation must not append an ellipsis because Unicode ellipsis is outside the allowed punctuation set and the goal is deterministic compact metadata.

Example:

```text
very long sanitized description
        |
        v
truncate to maximum length
        |
        v
trim incomplete trailing punctuation/spacing
```

## Y-00. Visual preview generation

The authoring workflow must generate one preview image for every successful record.

The screenshot-selection behavior is defined by CHARLIE.

The result delivered back to BRAVO must represent the selected content region at the required dimensions and readable scale.

The final repository asset must always be:

```text
lnk/<id>/preview.jpg
```

No PNG preview remains in the completed record.

## Z-00. JPEG conversion

The final preview must be JPEG at approximately 90 percent quality.

If Playwright directly produces an acceptable JPEG matching all capture requirements, an additional conversion step is unnecessary.

If an intermediate capture is PNG or another format, it must be converted to JPEG.

Temporary intermediate images must not remain in the completed link directory.

JPEG conversion failure aborts the add operation.

The tool must not silently retain the source image under a `.jpg` filename without actual JPEG encoding.

## AA-00. JPEG validation

Before record commit, the generated preview must be validated.

At minimum:

```text
the file exists
the file is non-empty
the file is decodable as JPEG
its dimensions match the preview specification
```

Validation must inspect the actual file content rather than trusting the filename extension.

A corrupt image makes the record incomplete and must abort the operation.

## AB-00. Generated HTML

The command generates:

```text
lnk/<id>/index.html
```

The document must satisfy ALPHA.

It must include at least:

```text
lnk:id
lnk:target
lnk:created
title
description
Open Graph title
Open Graph description
Open Graph image
Open Graph URL
Open Graph type
meta refresh redirect
JavaScript location replacement
clickable fallback target link
```

The generator should produce small deterministic HTML.

The short-link document is not a general landing page.

Its purpose is metadata publication and redirect behavior.

## AC-00. HTML escaping

Every generated value must be escaped for its destination HTML context.

Sanitization and HTML escaping are separate operations.

The workflow is:

```text
extract
sanitize
truncate
apply fallback when necessary
escape for HTML
write
```

The target URL is not processed through the title/description text sanitizer.

It is instead validated and serialized as a URL and then escaped for the relevant HTML context.

No externally obtained string may be inserted as raw HTML.

## AD-00. Public site base URL

Generating `og:url` and an absolute `og:image` requires knowledge of the public GitHub Pages base URL.

The repository must therefore provide one explicit configuration value for the public site base.

Conceptually:

```text
https://example.github.io/project/
```

This value must end in `/` after normalization.

The add-link command must validate it before generation.

It must be an absolute HTTP or HTTPS URL.

The implementation must not infer the public URL from the current filesystem path or Git remote because those values do not reliably determine the published GitHub Pages URL.

## AE-00. Generated public URLs

Given:

```text
site base:
https://example.github.io/project/

ID:
aB7kP2xQ
```

the short URL is:

```text
https://example.github.io/project/lnk/aB7kP2xQ/
```

and the preview URL is:

```text
https://example.github.io/project/lnk/aB7kP2xQ/preview.jpg
```

The generator must construct these values deterministically from the configured site base and ID.

It must not hand-build URLs using fragile string concatenation when a standard URL implementation can resolve them safely.

## AF-00. Temporary workspace

Generation should occur outside the final record path until all required artifacts are ready.

Conceptually:

```text
create temporary working directory
generate index.html
generate preview.jpg
validate both
move completed record to lnk/<id>/
update manifest
```

The exact temporary directory location is implementation detail.

It may be within the repository or an operating-system temporary location.

Temporary artifacts must be removed after successful completion.

They should also be removed after normal failures where cleanup is possible.

## AG-00. Filesystem transaction model

The tool does not require a database transaction system.

It does require transaction-like ordering.

The intended invariant is:

```text
before success:
  existing published repository remains valid

after success:
  new complete record exists
  manifest references it exactly once
```

The manifest must not reference a record before the record has been completely generated and moved into its final location.

A failure before manifest update must leave the manifest unchanged.

## AH-00. Manifest update

After the complete record exists at:

```text
lnk/<id>/
```

the ID must be inserted as the first line of:

```text
links.txt
```

Existing entries retain their relative order.

Example before:

```text
BBBBBBBB
AAAAAAAA
```

After creating `CCCCCCCC`:

```text
CCCCCCCC
BBBBBBBB
AAAAAAAA
```

The manifest must be written atomically enough that interruption does not intentionally leave a partially written text file.

A simple temporary-file-and-rename strategy is sufficient.

## AI-00. Manifest update failure

If the final record has already been moved into `lnk/<id>/` but updating `links.txt` fails, the add operation is not successful.

The tool should attempt to remove the newly created record so that the repository returns to its pre-command state.

If rollback itself fails, the tool must report both failures explicitly.

Example:

```text
Link generation failed.

Primary failure:
  Could not update links.txt: permission denied.

Rollback failure:
  Could not remove lnk/aB7kP2xQ/: permission denied.

Repository may require manual repair.

Affected record:
  lnk/aB7kP2xQ/
```

The implementation must never hide the rollback failure behind the original exception.

## AJ-00. Post-write validation

After updating the manifest, the tool must validate the newly created state before reporting success.

At minimum, it must confirm:

```text
lnk/<id>/index.html exists
lnk/<id>/preview.jpg exists
preview.jpg is valid
generated lnk:id matches the directory ID
generated lnk:target matches the serialized input
generated lnk:created is present
links.txt contains the new ID exactly once
the new ID is the first manifest entry
```

A detected post-write inconsistency must be treated as a failed operation.

Where practical, rollback should restore the previous state.

## AK-00. Successful completion output

A successful command must clearly state that the link was added.

The output should contain enough information for immediate use and inspection.

At minimum:

```text
target URL
short ID
short URL
record path
preview path
```

Example:

```text
Link added.

Target:
  https://example.com/article

ID:
  aB7kP2xQ

Short URL:
  https://example.github.io/project/lnk/aB7kP2xQ/

Record:
  lnk/aB7kP2xQ/

Preview:
  lnk/aB7kP2xQ/preview.jpg
```

The success message must not claim that the link has been deployed.

The generated files are local until the user commits and pushes them.

## AL-00. No automatic deployment

The authoring command must not:

```text
git add
git commit
git push
invoke GitHub APIs
wait for GitHub Pages deployment
```

The user controls publication manually.

A successful command means:

```text
local repository generation succeeded
```

It does not mean:

```text
public deployment succeeded
```

The distinction should remain explicit in messages and documentation.

## AM-00. Logging philosophy

The command should emit structured, readable console information sufficient to reconstruct the major stages of the operation.

Normal logging should answer:

```text
what operation started
which target is being processed
which important stage is running
what important decision was made
where generated files were written
whether the operation succeeded
```

Failure logging should additionally answer:

```text
where the failure occurred
what caused it
which resource was involved
whether repository changes occurred
whether rollback succeeded
what the user can do next
```

A dedicated later specification defines the exact logging and telemetry contract.

## AN-00. Log levels

The implementation should conceptually distinguish:

```text
INFO
WARN
ERROR
DEBUG
```

The exact console formatting may remain simple.

`INFO` is for normal major workflow stages.

`WARN` is for recoverable fallback behavior, such as using `(no description)`.

`ERROR` is for operation-ending failures.

`DEBUG` contains troubleshooting details that would otherwise make normal output noisy.

The project does not require a logging framework merely to provide these levels.

A small local logging helper is sufficient.

## AO-00. Sensitive and excessive log content

Logs must provide useful context without dumping arbitrary page contents.

The implementation should not print:

```text
entire HTML documents
complete browser DOM dumps
binary image data
large extracted text blocks
cookies
browser storage
authorization headers
```

A failed metadata extraction may log a bounded sanitized excerpt when useful, but full untrusted page content is unnecessary.

The target URL may be logged because it is central to the local workflow.

## AP-00. Stage naming

Major failures should identify a stable logical stage.

Recommended stage names are:

```text
input validation
repository validation
dependency validation
duplicate detection
ID generation
browser launch
page navigation
page readiness
metadata extraction
metadata sanitization
preview selection
preview capture
JPEG conversion
HTML generation
record validation
record commit
manifest update
post-write validation
rollback
```

These names should be reused consistently in errors and diagnostic logs.

Stable stage names make console output easier to search and compare.

## AQ-00. Error structure

A user-facing fatal error should contain, when applicable:

```text
short summary
target URL
stage
reason
relevant path or resource
actionable next step
rollback status
```

Not every field is relevant to every failure.

For example, input validation occurs before any rollback status exists.

Internal exception messages may be included as supporting detail, but they must not replace the human-readable explanation.

## AR-00. Exit status

The local command must use process exit status to communicate success or failure.

Successful generation exits with:

```text
0
```

Any operation-ending failure exits with a non-zero status.

Different numeric failure classes are unnecessary unless later implementation demonstrates a concrete need.

The console explanation is the primary diagnostic contract.

## AS-00. Interrupt handling

If the user interrupts the command before repository commit, temporary work should be cleaned up where practical and the existing repository should remain unchanged.

If interruption occurs during the final filesystem commit or manifest replacement, startup validation on the next invocation must detect any inconsistency.

The project does not require elaborate crash recovery.

It requires safe write ordering and sufficient validation to make interrupted state obvious.

## AT-00. Browser cleanup

The Playwright browser, context, and page must be closed after:

```text
success
normal failure
metadata failure
capture failure
JPEG conversion failure
user interruption when cleanup can run
```

Cleanup failure should normally be logged as a warning if the primary repository operation has otherwise completed safely.

Browser cleanup failure must not convert an already valid committed record into an invalid one.

## AU-00. Temporary-file cleanup

Temporary files must not accumulate during ordinary usage.

After a failed operation, the command should remove:

```text
temporary screenshots
temporary JPEG files
temporary generated HTML
temporary manifest copies no longer needed
temporary record directories
```

If cleanup fails, the tool should identify the path that could not be removed.

Cleanup errors involving only temporary files may be warnings unless they indicate uncertainty about final repository state.

## AV-00. Determinism

Given the same target page state and same extracted metadata, the generator should produce structurally equivalent HTML.

Random short ID generation and creation timestamp are expected sources of variation.

The tool must not introduce random layout decisions into metadata generation.

The screenshot selection specification may define deterministic tie-breaking when multiple page regions have equal scores.

This improves troubleshooting and repeatability.

## AW-00. No AI

The authoring workflow must not use:

```text
language models
vision models
embedding services
remote summarization services
AI-generated titles
AI-generated descriptions
AI-selected screenshots
```

Metadata and preview selection must come from deterministic page inspection and heuristics.

This is an explicit project constraint, not merely an implementation preference.

## AX-00. Network scope

The only normal external network access required while adding a link is access necessary to render the target page and the resources that page itself loads.

The tool must not upload the URL, screenshot, metadata, or generated record to third-party processing services.

The project is intended to use local computation whenever practical.

## AY-00. Authentication boundary

The normal workflow is intended for publicly accessible URLs.

The specification does not require support for logging into target websites, importing browser profiles, supplying cookies, solving CAPTCHA challenges, or managing authenticated sessions.

If a target requires authentication and cannot render meaningfully in the standard Playwright context, capture should fail with an understandable error or produce the deterministic result defined by CHARLIE for inaccessible pages.

The implementation must not build an authentication subsystem.

## AZ-00. Anti-bot and challenge pages

A page may present a bot challenge, consent wall, login wall, or other interstitial instead of the requested content.

The capture system should detect common cases where practical.

It must not attempt to bypass access controls or anti-bot protections.

If the visible result is clearly an access challenge rather than the target content, generation should fail rather than archive a misleading challenge screen as the link preview.

The error should identify that the page loaded but usable target content could not be reached.

## BA-00. Cookie and consent overlays

Ordinary dismissible cookie or consent overlays differ from access-control challenges.

CHARLIE may define deterministic handling for common visual overlays when they obscure the useful capture region.

The authoring workflow may dismiss or hide nonessential overlays solely to obtain a representative screenshot.

It must not grant optional permissions or accept unrelated user choices unless the capture specification explicitly requires that action.

Metadata extraction should not depend on interacting with consent dialogs when metadata is already available in the document.

## BB-00. Pages with no useful metadata

A lack of useful remote metadata is not necessarily a fatal error.

If the page loads and a usable visual preview can be produced, the fixed placeholders defined by ALPHA allow the record to remain valid.

Example:

```text
Title:
  (no title)

Description:
  (no description)
```

The command should warn about such fallbacks but may complete successfully.

## BC-00. Pages with no useful screenshot

A page that loads but provides no valid preview region is different from missing textual metadata.

Every record requires `preview.jpg`.

Therefore, if CHARLIE cannot produce a preview satisfying its minimum validity rules, the add operation must fail.

The tool must not substitute:

```text
blank image
site logo
generated placeholder
solid color image
text-only synthetic card
```

unless CHARLIE explicitly defines such behavior.

The current project intent is to capture actual rendered page content.

## BD-00. Extremely large pages

Page length must not cause the tool to capture or process an entire full-page image by default.

The preview algorithm operates on bounded regions.

The authoring workflow must not allocate an arbitrarily large bitmap merely because a target page is very long.

This is both a performance constraint and a core visual requirement.

## BE-00. Slow pages

The workflow must use bounded waits.

It must never wait indefinitely for:

```text
network idle
an image
a font
lazy loading
an animation
a DOM condition
```

CHARLIE defines the detailed timeouts and fallback sequence.

When the time budget expires, the system either proceeds using the documented fallback state or fails with the relevant stage and timeout.

## BF-00. Child processes

If the implementation invokes external tools such as ImageMagick, it must capture:

```text
exit status
standard error
standard output when useful
invoked operation
affected file paths
```

The implementation must not construct shell commands by concatenating untrusted page text.

Arguments should be supplied using child-process APIs that preserve argument boundaries.

Target-page metadata must never become executable shell syntax.

## BG-00. Path safety

Generated filesystem paths are based only on trusted project constants and the internally generated short ID.

External page titles, descriptions, URLs, hostnames, or filenames must not determine local output filenames.

For example, a remote title such as:

```text
../../something
```

must remain metadata after sanitization. It must never influence path construction.

The required final paths remain:

```text
lnk/<id>/index.html
lnk/<id>/preview.jpg
```

## BH-00. Existing destination directory

If the generated candidate ID unexpectedly corresponds to an existing final directory at commit time, the tool must not merge with or overwrite that directory.

This may occur because of a race or external filesystem modification after the initial collision check.

The command should discard that candidate and, if safely possible before manifest modification, generate another ID and complete generation for the new ID.

If the implementation cannot retry safely at that stage, it must abort without modifying the existing record.

## BI-00. Concurrent authoring processes

The project is designed primarily for one local user and does not require a general multi-process transaction manager.

However, two simultaneous add-link commands must not silently overwrite each other's manifest changes.

The implementation should use a simple repository lock for the mutation portion of the operation.

A lock should cover at least:

```text
final duplicate recheck
final ID availability check
record commit
manifest update
post-write validation
```

Expensive Playwright capture need not hold the lock if the duplicate is rechecked before commit.

If another active authoring process owns the lock, the command should fail clearly or wait for a short bounded period.

It must not proceed with unsafe concurrent writes.

## BJ-00. Duplicate recheck before commit

Because capture may take several seconds, duplicate detection must occur twice when generation does not hold the repository lock for its full duration.

The first check occurs before browser work to avoid unnecessary processing.

The second check occurs immediately before committing the generated record.

If another process added the same target in the meantime, the current operation must discard its temporary generated record and report the existing record.

The repository must still contain only one record for the target.

## BK-00. Configuration validation

Any configuration used by the command must be validated before browser work begins.

At minimum, a configured public site base URL must be validated.

Missing or malformed required configuration is fatal.

The tool must identify:

```text
configuration name
observed invalid value when safe
expected form
where the user should correct it
```

The project should keep configuration intentionally small.

A configuration framework is unnecessary.

## BL-00. Dry-run behavior

A dry-run mode is not required.

The project should not add command modes merely because they are common in larger tooling.

The normal command already stages work temporarily and validates before commit.

If inspection before publication is desired, Git provides the appropriate review layer after generation.

## BM-00. Force behavior

A `--force` option that bypasses duplicate detection or overwrites existing IDs must not exist.

Repository invariants are stronger than convenience overrides.

If the user wants to replace an existing record, that should be an explicit delete-and-add workflow rather than hidden destructive behavior.

## BN-00. Retry behavior

The command may retry narrow transient internal operations when retrying is safe and deterministic.

Examples include:

```text
short ID collision
brief browser launch retry if explicitly justified
temporary file rename retry on supported platforms
```

It must not repeatedly retry arbitrary failed page navigation for a long period.

A remote page failure should normally produce one clear failure rather than an opaque sequence of automatic attempts.

Any retry visible in troubleshooting logs should identify attempt count and reason.

## BO-00. User scenario: successful add

The user runs:

```text
add-link https://example.com/articles/browser-layout
```

The tool:

```text
validates the URL
validates the repository
checks Playwright and JPEG tooling
confirms the URL is not already stored
generates an unused short ID
opens the target using Playwright
waits for capture readiness
extracts title and description
sanitizes the metadata
selects and captures a useful page region
creates preview.jpg
generates index.html
validates the temporary record
moves it into lnk/<id>/
prepends the ID to links.txt
validates final state
prints the resulting short URL
```

The user then reviews the Git diff and decides when to commit and push it.

## BP-00. User scenario: duplicate add

The user runs:

```text
add-link https://example.com/article
```

The target already exists under:

```text
lnk/aB7kP2xQ/
```

The tool detects the duplicate before launching Playwright.

It prints the existing ID, record path, and short URL.

No files change.

The process exits with a non-zero status because the requested add operation was not performed.

## BQ-00. User scenario: missing dependency

The user runs the command on a machine where JPEG conversion requires ImageMagick but `magick` is unavailable.

The tool detects this during preflight.

It does not open the target page.

It does not create a short ID directory.

It does not change `links.txt`.

The terminal output explains that ImageMagick is required for the JPEG preview step and how the missing executable was detected.

## BR-00. User scenario: capture failure

The target URL is valid but the page never reaches a usable render state.

The tool records the failure under the appropriate stage, for example:

```text
page readiness
```

or:

```text
preview capture
```

Temporary browser and image resources are cleaned up.

No new final record appears under `lnk/`.

`links.txt` remains unchanged.

The user sees the target URL, failed stage, reason, and relevant timeout or page-state information.

## BS-00. User scenario: sanitized metadata

The target page exposes:

```text
🔥 Great Article — 日本語 & Русский 🚀
```

The stored title becomes:

```text
Great Article 日本語 Русский
```

If the description contains only emoji and unsupported symbols, the stored description becomes:

```text
(no description)
```

The command may report the fallback as a warning.

The operation can still succeed if the visual preview is valid.

## BT-00. User scenario: manifest write failure

The generated record is complete, but `links.txt` cannot be replaced because of a filesystem permission error.

The operation is not successful.

The tool attempts to remove the newly committed record.

If rollback succeeds, the repository returns to its original state and the error says so.

If rollback fails, the error explicitly identifies the remaining directory and states that manual repair may be required.

## BU-00. Performance expectations

Normal add-link execution is dominated by remote page loading and screenshot generation.

Repository operations should remain small.

The tool must not introduce expensive infrastructure to optimize a personal-scale collection.

A linear scan of existing records for duplicate detection is acceptable.

The command must avoid:

```text
loading every preview image
rendering existing entries
starting unnecessary browser instances
capturing full-page screenshots
rewriting every link record
```

Adding one link should normally modify only:

```text
links.txt
lnk/<new-id>/index.html
lnk/<new-id>/preview.jpg
```

Temporary files are excluded from this final diff.

## BV-00. Repository mutation boundary

The operation is considered committed only when:

```text
the complete final link directory exists
links.txt contains the new ID as its first entry
post-write validation succeeds
```

Before that point, generated material is provisional.

The user-facing success message must only be printed after this boundary has been crossed.

## BW-00. Implementation simplicity

The workflow should use ordinary Node.js modules and small project-specific helpers.

It must not introduce:

```text
a task queue
a database
an ORM
a dependency-injection framework
a plugin architecture
a worker service
a daemon
a remote generation API
a build server
```

The complexity belongs in the deterministic capture logic, where it directly serves the feature.

Everything around it should remain straightforward.

## BX-00. Acceptance conditions

BRAVO is satisfied when the following behavior is implemented.

A user can add one absolute HTTP or HTTPS URL with one local command.

Invalid input fails before repository modification.

Required local dependencies are checked before expensive work.

An existing serialized target is detected before capture.

The command never intentionally creates two records for the same target.

Short IDs follow the ALPHA format and never overwrite existing directories.

Playwright is used for page rendering.

Metadata is extracted without AI.

External title and description text is sanitized according to ALPHA.

Empty sanitized metadata uses the fixed placeholders.

Metadata is bounded to the lengths specified here.

Every successful record receives a valid JPEG preview at approximately 90 percent quality.

Every successful record contains an ALPHA-compliant `index.html`.

The manifest is updated newest-first.

Partial generation does not intentionally become visible through the manifest.

Manifest failure triggers rollback of the newly created record where possible.

Concurrent authoring cannot silently overwrite manifest updates.

Failures identify their logical stage and provide actionable context.

The normal command can be troubleshot primarily from console output.

Temporary resources are cleaned up.

The command performs no automatic Git commit, push, or deployment.

A successful invocation changes only the files necessary to represent the newly added link and update discovery order.

## BY-00. Next specification

The next specification is:

```text
2026-08-16.CHARLIE.A-00
Page Capture and Social Preview Generation
```

It will define the deterministic Playwright capture process in detail: viewport configuration, page readiness, overlay handling, metadata candidate selection, useful-region discovery, visual scoring heuristics, 1:1 readable capture behavior, crop dimensions, JPEG generation requirements, slow or unusual pages, preview validation, deterministic fallbacks, performance limits, and capture-specific diagnostics.

