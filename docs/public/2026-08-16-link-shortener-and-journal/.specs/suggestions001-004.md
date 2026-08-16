2026-08-16

# 2026-08-16.DELTA.A-00

## A-00. Journal Data Loading, Pagination, and Cache

This specification defines the browser-side data layer used by the static journal.

The journal is served entirely as static HTML, CSS, and JavaScript. It has no application server, database API, or server-side pagination endpoint.

Its data model consists of:

```text
links.txt
lnk/<short-id>/index.html
lnk/<short-id>/preview.jpg
```

The journal must read this repository representation efficiently and turn it into an ordered sequence of journal entries.

This specification defines manifest loading, record loading, HTML metadata parsing, pagination, bounded prefetching, browser-side caching, cache expiration, manifest refresh, deleted records, malformed records, partial network failures, retry behavior, data-layer logging, and performance constraints.

The visual appearance and page-turn interaction of the journal are defined by ECHO.

## B-00. Motivation

The journal may eventually contain many saved links.

A naive implementation could fetch the manifest and then immediately request every generated `index.html`.

That is unnecessary.

The user normally needs only the newest journal page and a small amount of adjacent content.

The data layer should therefore behave like a small static reader:

```text
load lightweight manifest
determine visible entry range
load only required records
cache retrieved records
prefetch a small nearby range
load more only when navigation requires it
```

This preserves the intentionally simple static architecture while avoiding unnecessary requests.

The journal should remain responsive even when the archive grows substantially beyond the number of entries visible at one time.

## C-00. Source of truth

The published repository is authoritative.

`links.txt` is authoritative for:

```text
which entries are published
entry order
newest-to-oldest chronology
```

Each:

```text
lnk/<id>/index.html
```

is authoritative for the metadata belonging to that entry.

The browser cache is never authoritative.

The browser cache is only a temporary performance optimization.

## D-00. Manifest URL

The journal loads the root-level manifest:

```text
links.txt
```

The application must resolve the manifest relative to the journal application's own site location.

The implementation must work when the GitHub Pages site is hosted under a path prefix.

For example, if the journal is:

```text
https://example.github.io/project/
```

the manifest is:

```text
https://example.github.io/project/links.txt
```

The implementation must not incorrectly resolve it as:

```text
https://example.github.io/links.txt
```

## E-00. Entry URL construction

For a manifest ID:

```text
aB7kP2xQ
```

the journal record URL is:

```text
lnk/aB7kP2xQ/index.html
```

and its preview is expected at:

```text
lnk/aB7kP2xQ/preview.jpg
```

Repository-relative URLs should be resolved through the browser URL API rather than fragile string concatenation.

The data layer must not require knowledge of the deployment domain beyond the current document location.

## F-00. Initial startup sequence

The journal data layer starts in this order:

```text
initialize local cache
load manifest
parse and validate manifest
determine first visible page
determine required entry IDs
resolve required records from cache or network
render data-ready state
begin bounded adjacent prefetch
```

The application must not begin by fetching every record in the manifest.

## G-00. Manifest request

The manifest should be requested using `fetch()`.

The journal must check the HTTP response before reading the body.

A response is successful only when the request returns a normal successful status.

A network failure or unsuccessful response must not be interpreted as an empty archive.

For example, a `404` for `links.txt` means the journal is misconfigured or the published repository is incomplete.

It does not mean:

```text
zero saved links
```

## H-00. Manifest cache policy

The manifest represents mutable collection state and must be refreshed more aggressively than individual records.

The journal SHOULD request the current manifest when a new journal session begins.

The browser's own HTTP cache may still participate according to normal browser behavior, but the application-level record cache must not prevent a fresh manifest request at startup.

The manifest itself does not need to be persisted in the one-hour entry cache as an authoritative source.

The application may temporarily retain the parsed manifest in memory for the active session.

## I-00. Manifest parsing

`links.txt` contains one short ID per line.

The parser must:

```text
split by line
trim surrounding ASCII whitespace defensively
ignore empty lines defensively
validate every remaining ID
preserve line order
reject duplicate IDs
```

The valid ID format is defined by ALPHA:

```text
exactly 8 characters
A-Z
a-z
0-9
```

The parser must not sort the IDs.

The order in the manifest is authoritative.

## J-00. Invalid manifest entry

If a non-empty manifest line does not contain a valid short ID, the manifest is malformed.

The data layer must treat this as a repository consistency error rather than silently dropping the entry.

Example diagnostic:

```text
Journal data error.

Stage:
  manifest parsing

Line:
  17

Value:
  bad/id

Reason:
  Expected an 8-character link ID containing only A-Z, a-z, or 0-9.
```

The exact visual presentation to the user is defined later, but the console must preserve this level of context.

## K-00. Duplicate manifest entry

If the same short ID occurs more than once in `links.txt`, the manifest is invalid.

The journal must not silently deduplicate it because doing so would hide a repository problem.

The error should identify:

```text
duplicate ID
first line number
repeated line number
```

This makes correction possible from the repository without additional debugging.

## L-00. Empty manifest

An empty manifest is valid.

The journal should represent an empty archive rather than an error.

Conceptually:

```text
links.txt exists
links.txt contains no IDs
        |
        v
journal contains zero entries
```

ECHO defines the visual empty-journal presentation.

The data layer should expose an explicit empty state.

## M-00. Manifest ordering

Manifest order is newest first.

If:

```text
links.txt
```

contains:

```text
CCCCCCCC
BBBBBBBB
AAAAAAAA
```

then the logical entry sequence is:

```text
index 0 -> CCCCCCCC
index 1 -> BBBBBBBB
index 2 -> AAAAAAAA
```

The data layer must preserve this sequence throughout pagination.

It must not reorder records according to:

```text
fetch completion time
cached timestamp
HTTP response order
title
creation timestamp
```

## N-00. Logical entry index

Every manifest position maps to one logical zero-based entry index.

For example:

```text
manifest position 1 -> entry index 0
manifest position 2 -> entry index 1
manifest position 3 -> entry index 2
```

Pagination calculations should operate on these logical indexes rather than modifying the manifest itself.

This keeps ordering and pagination independent.

## O-00. Entries per journal page

The data layer must use:

```text
6 entries per journal page
```

This decision is fixed here so pagination, prefetching, caching, and ECHO presentation use the same model.

A two-page open spread therefore contains at most:

```text
12 entries
```

The final spread may contain fewer entries.

The application must not dynamically change the number of logical entries per page according to viewport width.

Visual responsiveness belongs to ECHO and must not alter journal chronology or pagination boundaries.

## P-00. Page numbering

Journal data pages are zero-based internally.

Conceptually:

```text
page 0 -> newest 6 entries
page 1 -> next 6 entries
page 2 -> next 6 entries
```

User-facing page numbers, if displayed, may be one-based.

Internal data logic should remain zero-based to simplify calculations.

## Q-00. Page range calculation

For:

```text
entriesPerPage = 6
pageIndex = P
```

the entry range is conceptually:

```text
start = P * 6
endExclusive = min(start + 6, totalEntries)
```

For example, with 17 entries:

```text
page 0 -> indexes 0 through 5
page 1 -> indexes 6 through 11
page 2 -> indexes 12 through 16
```

There is no partially nonexistent fourth page.

## R-00. Spread model

On layouts that show two facing journal pages simultaneously, a spread consists of:

```text
left page
right page
```

and therefore normally represents 12 entries.

The data layer should expose records by logical page rather than hard-coding spread-only APIs.

ECHO may request:

```text
page N
page N + 1
```

for a spread.

This preserves a simple pagination model while allowing one-page or two-page presentation.

## S-00. Initial visible range

The initial journal position is page `0`.

Therefore startup prioritizes the newest entries.

If a two-page spread is displayed, the initial required data consists of:

```text
page 0
page 1
```

or up to 12 entries.

The journal must not delay initial rendering until older pages have loaded.

## T-00. Record request

An uncached record is loaded using:

```text
fetch("lnk/<id>/index.html")
```

The response must be checked before parsing.

An HTTP `404` or other unsuccessful response means the manifest references an unavailable record.

The data layer must not treat the missing response as an entry with blank metadata.

## U-00. HTML parsing

Loaded record HTML must be parsed using the browser's DOM parsing facilities.

Conceptually:

```text
response.text()
DOMParser
query explicit metadata fields
validate fields
construct internal entry object
```

The journal must not insert fetched record HTML into the live document merely to read its metadata.

The redirect JavaScript inside the record must therefore never execute as part of metadata loading.

## V-00. Script isolation

Fetched short-link HTML is data.

The journal must parse it as an inert document.

It must not:

```text
inject the fetched HTML into the live page
execute its scripts
follow its meta refresh
navigate to lnk:target
load arbitrary embedded page resources
```

The purpose of fetching the file is only to read controlled metadata generated by the authoring tool.

## W-00. Required record metadata

A valid fetched entry must contain:

```text
lnk:id
lnk:target
lnk:created
title
description
og:image
```

The journal may also inspect additional Open Graph metadata when useful, but these values are sufficient to construct the journal's internal record.

The journal must verify that:

```text
lnk:id == requested manifest ID
```

A mismatch is a repository consistency error.

## X-00. Internal entry representation

After validation, the data layer should expose a small logical entry object.

Conceptually:

```text
id
targetUrl
createdAt
title
description
previewUrl
shortUrl
```

The implementation may use a plain JavaScript object.

A class hierarchy or model framework is unnecessary.

Values must be derived from the generated record rather than duplicated into a second remote JSON database.

## Y-00. Target URL validation

`lnk:target` must parse as an absolute `http:` or `https:` URL.

If it does not, the record is malformed.

The journal must not render a malformed target as a valid clickable destination.

The error should identify:

```text
record ID
record URL
metadata field
observed invalid value when safe
```

## Z-00. Creation timestamp validation

`lnk:created` must contain the UTC ISO 8601 timestamp format established by ALPHA.

The journal should parse it during record validation.

The journal does not use the timestamp to reorder the collection.

Manifest order remains authoritative.

The timestamp is useful for display, diagnostics, and consistency checks.

## AA-00. Title and description trust boundary

Title and description were sanitized during authoring.

The journal should still treat them as plain text.

They must be rendered using text APIs such as:

```text
textContent
```

rather than inserted as HTML.

The journal MUST NOT use source-derived metadata as `innerHTML`.

This preserves the trust boundary even if a malformed manually edited record bypasses the authoring sanitizer.

## AB-00. Preview URL validation

The journal should normally derive the preview URL from the generated record's `og:image`.

The URL must resolve to the same project-origin preview asset expected for the record.

For normal ALPHA records, this is:

```text
lnk/<id>/preview.jpg
```

A record pointing its preview at an unrelated external image should be treated as malformed rather than silently loading arbitrary third-party content.

This keeps the journal self-contained.

## AC-00. Preview loading responsibility

DELTA loads and validates entry metadata.

Actual `<img>` loading may occur through ECHO when an entry becomes visible.

The data layer does not need to fetch image bytes separately before exposing an entry.

This avoids duplicate browser requests.

The data layer should provide the validated preview URL.

The browser's normal image loader handles the JPEG when ECHO renders it.

## AD-00. Record cache purpose

Individual entry HTML changes rarely.

Repeatedly requesting the same entry while turning journal pages is unnecessary.

The journal therefore maintains an application-level browser cache for parsed entry metadata.

The cache should allow a recently loaded entry to be reconstructed without another network request.

## AE-00. Cache storage

Persistent entry cache should use:

```text
localStorage
```

The expected metadata volume is small enough that a more complex storage layer is unnecessary.

IndexedDB MUST NOT be introduced solely for this cache.

The cache may additionally keep an in-memory map during the current page session for faster repeated access.

The in-memory layer is an optimization over the same cached data.

## AF-00. Cache namespace

All cache keys must use a project-specific prefix to avoid colliding with unrelated localStorage values.

Conceptually:

```text
lnk-journal:entry:<id>
```

and:

```text
lnk-journal:cache-version
```

The exact short prefix may differ, but it must be centralized and consistent.

The application must not clear unrelated localStorage entries.

## AG-00. Cached entry format

A cached entry should contain only the metadata necessary to reconstruct the internal entry.

Conceptually:

```text
id
targetUrl
createdAt
title
description
previewUrl
shortUrl
cachedAt
```

The complete source `index.html` should not be persisted.

The cache is parsed metadata, not a duplicate HTML archive.

## AH-00. Cache timestamp

Every persistent cached record must store:

```text
cachedAt
```

representing the time the record was successfully fetched and validated.

The value should be a numeric Unix timestamp in milliseconds or another single consistent machine representation.

It is an internal cache value and does not need the human-readable ISO representation used by link records.

## AI-00. Cache lifetime

The cache lifetime is:

```text
1 hour
```

Equivalent:

```text
60 minutes
3600 seconds
3,600,000 milliseconds
```

A cached record is fresh when:

```text
current time - cachedAt < 1 hour
```

A record exactly at or beyond one hour old is stale.

## AJ-00. Fresh cached record

If an entry exists in local cache and remains within the one-hour TTL, the journal may use it without requesting its `index.html`.

Conceptually:

```text
entry requested
    |
    +-- fresh cache exists -> use cache
    |
    +-- no fresh cache -> fetch record
```

This should make backward and forward journal navigation responsive.

## AK-00. Stale cached record

A stale cache entry must not be treated as current.

When that record is required, the journal should fetch the current `index.html`.

If fetching succeeds, the new parsed entry replaces the stale cache value.

If fetching fails, stale-cache fallback behavior is defined separately below.

## AL-00. Cache version

The application should store one simple cache format version.

Conceptually:

```text
1
```

If a future code change encounters a different cache version, it should discard only the journal's cache namespace and rebuild it.

This is not a general schema migration framework.

The purpose is only to prevent old local browser data from breaking a changed parser during development.

## AM-00. Cache corruption

A localStorage value may be:

```text
invalid JSON
missing fields
wrong type
invalid ID
invalid timestamp
```

A corrupt cached entry must be discarded.

Cache corruption must not make the journal unusable.

The journal should log the cache key and reason at WARN or DEBUG level and proceed to the network source.

## AN-00. localStorage unavailable

The browser may make localStorage unavailable because of:

```text
privacy settings
storage restrictions
quota problems
browser policy
runtime exception
```

Caching is an optimization.

The journal must continue functioning without persistent caching.

If localStorage initialization fails, the application should disable the persistent cache for that session, retain the in-memory cache where possible, and log a warning.

It must not fail journal startup solely because persistent caching is unavailable.

## AO-00. Cache write failure

A successfully fetched record remains usable even when writing it to localStorage fails.

The application should:

```text
use the fetched entry
keep it in memory
log the cache write failure
continue
```

A cache write failure is not a record-loading failure.

## AP-00. Storage quota

The project should not introduce explicit quota-management infrastructure.

If localStorage quota is exhausted, the implementation may remove expired records from its own cache namespace and retry once.

If the retry still fails, persistent caching should be disabled for the session.

The journal must not delete unrelated site storage.

## AQ-00. Expired cache cleanup

Expired cached entries may be removed opportunistically.

Cleanup may occur:

```text
during startup
when a stale record is encountered
when quota pressure occurs
```

A dedicated background cleanup scheduler is unnecessary.

The goal is bounded storage, not perfect cache housekeeping.

## AR-00. Manifest and cached entries

The manifest determines whether a record currently belongs to the journal.

A fresh cached entry whose ID no longer occurs in the current manifest must not be displayed.

This rule is important for deletion.

Conceptually:

```text
cache says ID exists
manifest no longer contains ID
        |
        v
ID is not part of current journal
```

The manifest wins.

## AS-00. Deleted entry cache cleanup

When the current manifest no longer contains a previously cached ID, the journal may remove the corresponding cache entry immediately.

It may also leave the unused cache value to expire naturally.

Immediate removal is preferred because deletion is uncommon and the comparison is inexpensive.

In either case, the entry must disappear from journal pagination as soon as the new manifest has been parsed.

## AT-00. Manifest changes during an active session

The journal does not need real-time synchronization.

If `links.txt` changes on GitHub Pages while the journal is already open, the current in-memory manifest may remain active until a deliberate refresh event occurs.

The application does not need:

```text
WebSockets
polling
server-sent events
background synchronization
```

The static architecture should remain static.

## AU-00. Manifest refresh trigger

The journal should refresh the manifest when:

```text
the application first loads
the user explicitly reloads the page
the document becomes visible again after a sufficiently long absence
```

A simple visibility-based refresh is useful when a tab has been open while the user deployed new links.

The minimum absence before automatic visibility refresh should be:

```text
1 hour
```

This matches the record cache TTL and avoids unnecessary repeated requests during brief tab switches.

## AV-00. Refresh comparison

When a new manifest is loaded during an active session, the journal should compare its ordered ID sequence against the current sequence.

If the sequence is identical, no pagination reset is required.

If it differs, the journal must update its internal model.

The visual behavior after such a change is defined below.

## AW-00. New entries after refresh

Suppose the active manifest begins:

```text
BBBBBBBB
AAAAAAAA
```

and after refresh it becomes:

```text
CCCCCCCC
BBBBBBBB
AAAAAAAA
```

The new manifest is authoritative.

The journal should update the collection to include `CCCCCCCC`.

If the user is currently at the beginning of the journal, the newest page should update naturally.

If the user is deep in the archive, the application should avoid unexpectedly jumping them to page `0`.

The data layer should preserve the user's current anchor where possible.

## AX-00. Navigation anchor

To preserve position across a manifest refresh, the journal should anchor on the first currently visible entry ID rather than only on a numeric page index.

Example:

```text
before refresh:
page 3 starts with ID OLDSTART

new links inserted at front

after refresh:
find OLDSTART in new manifest
calculate its new page
keep that region visible
```

This prevents newly inserted items from shifting the reader unexpectedly to different historical content.

If the anchor ID no longer exists, fallback behavior is defined below.

## AY-00. Removed anchor

If the current anchor entry has been removed from the manifest, the application should preserve the nearest meaningful position.

A simple rule is:

```text
use the entry now occupying the old anchor's approximate index
clamp to the final valid page
```

The journal does not need a complex history-preservation algorithm.

The user should remain near where they were browsing.

## AZ-00. Page count

The total number of logical pages is:

```text
ceil(totalEntries / 6)
```

If the archive contains zero entries:

```text
pageCount = 0
```

The implementation should explicitly handle zero rather than producing a phantom page through generic arithmetic.

## BA-00. Navigation bounds

The data layer must not request pages outside:

```text
0 <= pageIndex < pageCount
```

Previous navigation from page `0` remains at the beginning.

Next navigation from the final page remains at the end.

ECHO determines whether the corresponding controls are hidden, disabled, or physically constrained.

## BB-00. Required data window

The visible page or spread is high priority.

The data layer may also load nearby records so page turning feels immediate.

For a two-page spread beginning at page `P`, the high-priority required pages are:

```text
P
P + 1
```

when both exist.

The normal prefetch window is:

```text
one page before the visible spread
one page after the visible spread
```

Therefore the active working window is at most approximately:

```text
4 pages
24 entry records
```

Most of these records will often already be cached.

## BC-00. Initial prefetch

At initial load, there is no previous page.

The data layer prioritizes:

```text
page 0
page 1
```

and may then prefetch:

```text
page 2
```

The first visible spread must not wait for page 2.

Prefetch begins only after the required initial data has either loaded or reached a defined error state.

## BD-00. Single-page presentation prefetch

If ECHO displays one journal page rather than a spread because of viewport constraints, the data layer may still retain the same logical nearby-page strategy.

The visible page is required.

The immediately preceding and following logical pages are reasonable prefetch targets.

The data model must not duplicate implementation solely for one-page versus two-page rendering.

## BE-00. Prefetch priority

Record requests should have simple priorities:

```text
visible
adjacent
prefetch
```

Visible data has highest priority.

Adjacent data needed for an in-progress page turn has next priority.

Speculative prefetch has lowest priority.

The implementation does not need a generic network task scheduler.

A small request queue or bounded helper is sufficient.

## BF-00. Request concurrency

The journal should not start an unbounded number of simultaneous record requests.

The maximum number of active entry HTML requests should be:

```text
6
```

This is enough parallelism for fast page loading without producing a burst of dozens of requests.

Manifest loading is outside this six-record limit.

Image requests made naturally by the browser are also outside the record-fetch scheduler.

## BG-00. Request deduplication

If multiple consumers request the same ID while its fetch is already in progress, the data layer must reuse the same in-flight operation.

It must not issue duplicate simultaneous requests for:

```text
lnk/<same-id>/index.html
```

An in-memory map from ID to pending promise is sufficient.

The pending entry must be removed when the request settles.

## BH-00. Fetch timeout

Every individual record fetch must be bounded.

The timeout should be:

```text
15 seconds
```

A timeout is treated as a record-loading failure.

The browser Fetch API has no built-in timeout contract, so the implementation may use `AbortController`.

The timeout should be centralized rather than repeated as unexplained constants.

## BI-00. Manifest fetch timeout

The manifest request must also be bounded.

The timeout should be:

```text
15 seconds
```

A manifest timeout prevents establishing the collection and therefore causes a journal-level loading error.

The application must not substitute an old manifest silently as if it were current unless a specific fallback defined later applies.

## BJ-00. HTTP response validation

A fetch is successful only when its response indicates success.

The journal must not parse an error document returned with an unsuccessful status as if it were a valid record.

For a missing record:

```text
HTTP 404
```

the diagnostic should identify the manifest ID and record URL.

For server errors such as:

```text
500
503
```

the diagnostic should identify the status.

Although GitHub Pages normally serves static content reliably, the implementation should not assume every fetch succeeds.

## BK-00. Record parse failure

A record load may return HTML successfully but still be malformed.

Examples include:

```text
missing lnk:id
incorrect lnk:id
missing title
invalid lnk:target
missing og:image
invalid creation timestamp
```

The journal must distinguish:

```text
network failure
HTTP failure
parse failure
validation failure
```

This distinction is important for console troubleshooting.

## BL-00. Invalid record isolation

A malformed individual entry should not necessarily make the entire journal unusable.

If the manifest itself is valid but one record is invalid, the data layer should mark that entry as failed and continue loading other entries.

ECHO must be able to render an explicit failed-entry state for that position.

The journal must not silently remove the failed entry because doing so would shift all later pagination positions.

## BM-00. Pagination position of failed records

A failed entry still occupies its manifest position.

For example:

```text
index 0 -> valid
index 1 -> malformed
index 2 -> valid
```

page composition still uses indexes:

```text
0
1
2
```

The failed position is represented as an error entry.

The journal must not compress the list to:

```text
0 -> old index 0
1 -> old index 2
```

because that would make page boundaries unstable and hide repository corruption.

## BN-00. Failed-entry representation

The internal data layer should expose an explicit failure object for an entry that could not be loaded.

Conceptually:

```text
id
status: "error"
stage
message
```

A successful entry may use:

```text
status: "ready"
```

The exact object shape is implementation detail.

The important rule is that loading failure is represented explicitly rather than with `null` or an ambiguous missing object.

## BO-00. Retry from visible failure

A record that failed because of a transient network condition may be retried when the user returns to or explicitly interacts with that visible page.

The data layer SHOULD support one user-driven or visibility-driven retry after the original failure.

It must not create an uncontrolled automatic retry loop.

Repository-validation failures such as a mismatched `lnk:id` should not be repeatedly retried during the same session unless the manifest is refreshed.

## BP-00. Automatic retry

A network fetch may receive one immediate automatic retry when the failure is plausibly transient.

Examples:

```text
network connection reset
temporary fetch rejection
HTTP 503
```

The retry should occur after a small fixed delay, for example:

```text
500 milliseconds
```

A `404` should not be automatically retried immediately because it usually represents published repository inconsistency.

Parse and validation failures must not receive immediate automatic retry.

## BQ-00. Retry logging

When an automatic retry occurs, DEBUG logging should identify:

```text
entry ID
attempt number
reason for retry
```

Normal console output should not become noisy for routine transient recovery.

If the final attempt fails, the user-visible error should describe the final condition.

## BR-00. Fresh-cache network avoidance

If an entry has a valid fresh cache value, no network request for its record HTML is needed.

This applies equally to:

```text
visible loading
adjacent loading
prefetch
```

The cache should be checked before placing work into the network request queue.

## BS-00. Stale-cache fallback on network failure

A stale cached record may be useful when the network is temporarily unavailable.

If:

```text
the requested ID still exists in the current freshly loaded manifest
a stale cached entry exists for that exact ID
network loading of the record fails
the stale cached entry itself passes structural validation
```

the journal MAY display the stale cached entry temporarily.

This fallback should be explicit.

The internal entry status should indicate that stale data is being used.

The console should emit a warning.

## BT-00. Limits of stale-cache fallback

A stale cached record MUST NOT be used when:

```text
the current manifest no longer contains its ID
the cached ID does not match the requested ID
the cached value is corrupt
the current network record returned valid HTML proving the cache incompatible
```

Stale fallback is for temporary network unavailability, not for overriding current repository state.

## BU-00. Stale entry user state

When stale cached data is used because a current record could not be fetched, ECHO should have enough information to communicate that the entry may be temporarily outdated.

The data layer should expose conceptually:

```text
status: "stale"
```

alongside the otherwise usable metadata.

The exact visual treatment belongs to ECHO.

## BV-00. Offline startup limitation

If the journal cannot load the current manifest at startup, it cannot reliably know:

```text
which entries still exist
their current ordering
whether new entries were added
whether old entries were removed
```

Therefore the application should not reconstruct the full journal from cached entries alone as though that state were current.

A manifest startup failure should produce an explicit journal-level error.

A future offline-first mode is not required.

## BW-00. Optional stale manifest message

The implementation MAY remember the most recently seen manifest for diagnostic or convenience purposes, but it must not silently treat it as authoritative after a startup fetch failure.

If such a fallback is ever displayed, it must be clearly marked as stale/offline state.

This behavior is optional and should not be implemented unless it remains simple.

The core required implementation may simply fail startup when `links.txt` cannot be obtained.

## BX-00. Preview image browser caching

Preview JPEG files are immutable for normal record lifetime except when metadata or preview is intentionally regenerated.

The journal does not need an application-level binary image cache.

The browser's normal HTTP image cache is sufficient.

DELTA must not store JPEG data in localStorage.

This keeps the cache small and avoids base64 expansion.

## BY-00. Preview load failure

An entry's HTML metadata may load correctly while `preview.jpg` later fails in the browser.

This is primarily a presentation-layer image-loading failure.

ECHO should report it visually.

DELTA should still expose enough record context to identify:

```text
entry ID
preview URL
```

The journal should not refetch the entry HTML merely because its image failed.

## BZ-00. Page data readiness

A logical page is data-ready when every manifest position on that page has reached one of these terminal states for the current attempt:

```text
ready
stale
error
```

The page does not need every entry to be successful before ECHO can render it.

This prevents one malformed entry from blocking five valid neighbors.

## CA-00. Progressive rendering

A page may be rendered progressively as individual records become available.

The data layer should not require waiting for all six records before exposing the first successful entries.

However, pagination positions must remain stable.

A loading placeholder occupies an entry's assigned position until that entry reaches `ready`, `stale`, or `error`.

ECHO defines the exact visual loading placeholder.

## CB-00. Request cancellation

When the user rapidly navigates far away, low-priority speculative prefetch requests that are no longer useful MAY be cancelled.

Visible entry requests should normally be allowed to complete because their results become cacheable.

The implementation should avoid complex cancellation bookkeeping.

Cancellation is optional for prefetch optimization, not a correctness requirement.

## CC-00. Rapid page turning

The user may turn multiple pages quickly.

The data layer must remain consistent even when:

```text
page N begins loading
user moves to page N+2
older requests complete afterward
```

Fetch completion order must not determine current page state.

Each result is associated with its entry ID.

The current visible page is determined independently by navigation state.

## CD-00. Race-free cache updates

If two asynchronous paths somehow obtain the same entry at different times, a stale result must not overwrite a newer validated cache entry.

In-flight deduplication should normally prevent this.

As an additional safeguard, cache writes should compare `cachedAt` or use the most recent successful fetch operation.

A generalized concurrency framework is unnecessary.

## CE-00. Memory cache

During an active journal session, validated entries should also be retained in an in-memory map keyed by ID.

Lookup order is:

```text
in-memory fresh entry
persistent fresh cache
network
stale persistent cache fallback when allowed
```

The in-memory map avoids repeated JSON parsing from localStorage while turning pages.

## CF-00. Memory cache lifetime

The in-memory cache lasts only for the current document session.

It does not need independent eviction for the expected archive size because only requested entries are inserted.

The journal does not eagerly load the complete archive, so memory growth remains bounded by actual browsing behavior.

A complex least-recently-used cache is unnecessary.

## CG-00. Cache freshness in memory

An in-memory value must retain its original `cachedAt`.

Being present in memory does not make a record fresh forever.

If the session remains open longer than one hour and the entry is requested again, the TTL rule still applies.

The application should not accidentally reset `cachedAt` simply by reading from memory.

## CH-00. Current time

Cache expiration uses the browser's local clock only as a TTL measurement.

It does not interpret the record's `lnk:created` timestamp for cache freshness.

The relevant comparison is:

```text
now - cachedAt
```

not:

```text
now - createdAt
```

A link may be years old while its cached copy is only minutes old.

## CI-00. Clock anomalies

If the browser clock moves backward and a cache entry appears to have a `cachedAt` value substantially in the future, the entry should be treated as stale rather than fresh indefinitely.

A simple rule is sufficient:

```text
if cachedAt > now + small tolerance:
    treat as invalid or stale
```

The project does not need sophisticated clock synchronization.

## CJ-00. Page navigation API

The data layer should expose a small navigation-oriented interface conceptually equivalent to:

```text
getPage(pageIndex)
getEntry(id)
getPageCount()
refreshManifest()
```

The implementation does not have to use these exact function names.

The point is to keep ECHO dependent on a small data contract rather than on manifest parsing and cache internals.

## CK-00. Separation from presentation

DELTA must not manipulate leather-page animations, visual transforms, or journal decoration.

It may expose:

```text
loading state
page data
entry status
page count
current ordering
refresh result
```

ECHO owns how these states look.

This separation prevents animation code from becoming responsible for network and cache correctness.

## CL-00. No client-side database framework

The data layer MUST NOT introduce:

```text
Redux
MobX
RxJS
IndexedDB wrappers
ORM-like browser storage
service-worker databases
GraphQL clients
```

unless another specification explicitly changes this requirement.

Plain JavaScript state, `fetch()`, `DOMParser`, `localStorage`, and small helpers are sufficient.

## CM-00. No service worker requirement

A service worker is not required.

The application does not need:

```text
offline application installation
background synchronization
custom HTTP caching
push notifications
```

The browser's normal resource cache plus the explicit one-hour metadata cache are sufficient.

Adding a service worker would create lifecycle and cache-invalidation complexity without serving the core project.

## CN-00. No JSON API

The journal must not require converting the generated records into a server-style JSON API.

The intended low-tech mechanism is deliberately:

```text
manifest tells journal which HTML records exist
journal fetches generated HTML
journal parses controlled metadata
```

This reuse of the short-link document is part of the project architecture.

## CO-00. Manifest request size

The manifest contains only eight-character IDs and newlines.

The journal should treat it as lightweight.

No manifest pagination is required.

Even a manifest containing thousands of entries remains small relative to fetching thousands of HTML records and images.

The complete manifest is therefore loaded at once.

## CP-00. Large archive behavior

As the archive grows, startup work should remain approximately:

```text
one manifest request
up to 12 high-priority entry resolutions for a two-page initial spread
small adjacent prefetch
```

It should not grow linearly in network requests with the total archive size.

Manifest parsing itself is allowed to be linear in the number of IDs because it operates on small text records.

## CQ-00. Record request count example

Assume the archive contains:

```text
2,000 links
```

The user opens the journal for the first time with an empty cache.

The application loads:

```text
1 manifest
12 records for the first two visible pages
up to 6 records for the next prefetched page
```

It does not load:

```text
2,000 record HTML documents
2,000 preview JPEGs
```

The browser loads visible JPEGs only as ECHO renders them.

## CR-00. Cached startup example

Assume the same initial 12 records were loaded 20 minutes ago.

The user reloads the journal.

The journal fetches the current manifest.

If the first 12 IDs remain the same and their local cache entries are valid and less than one hour old, the journal may reconstruct those entries from cache without requesting their `index.html` documents again.

Visible previews may also come from the browser's HTTP image cache.

## CS-00. Cache expiry example

An entry was cached at:

```text
10:00
```

It is requested at:

```text
10:59
```

The entry is fresh.

It is requested at:

```text
11:00
```

or later.

The entry is stale and should be refreshed before being considered current.

## CT-00. Deleted record example

The user previously viewed:

```text
aB7kP2xQ
```

and the entry exists in localStorage.

Later the record is deleted from the repository and its line is removed from `links.txt`.

On the next journal startup, the new manifest no longer contains:

```text
aB7kP2xQ
```

The journal must not display the cached record.

The stale cache entry may be deleted from localStorage.

No request to the removed record is necessary because it is no longer present in the manifest.

## CU-00. Missing published record example

`links.txt` contains:

```text
aB7kP2xQ
```

but:

```text
lnk/aB7kP2xQ/index.html
```

returns `404`.

This is repository inconsistency.

The journal preserves the manifest position and marks that entry as failed.

Console output should state conceptually:

```text
Entry load failed.

ID:
  aB7kP2xQ

Stage:
  record fetch

URL:
  .../lnk/aB7kP2xQ/index.html

HTTP status:
  404

Reason:
  The manifest references a record that is not published.
```

The remaining page entries continue loading.

## CV-00. ID mismatch example

The journal requests:

```text
lnk/aB7kP2xQ/index.html
```

but the document contains:

```html
<meta name="lnk:id" content="XXXXXXXX">
```

The record is invalid.

The journal must not use its metadata.

The failure is:

```text
Stage:
  record validation

Reason:
  Record ID does not match requested manifest ID.
```

This condition should be easy to diagnose from the console.

## CW-00. Corrupt local cache example

The localStorage entry for:

```text
aB7kP2xQ
```

contains malformed JSON.

The journal logs a cache warning, removes that cache value, and requests the current HTML record.

The journal should otherwise behave normally.

The user should not see a fatal application error because of corrupted optimization data.

## CX-00. Offline record with stale cache example

The current manifest loaded successfully while the network was available.

An older page is then requested after connectivity is lost.

The record's one-hour cache has expired, but the stale cached entry is structurally valid.

The network request fails.

Because the current manifest still includes the ID, the journal may display the stale record with an explicit stale status.

The console records that stale cache was used because current retrieval failed.

## CY-00. No cached fallback example

A record is required, is not cached, and its network request fails.

The data layer exposes an error state for that entry.

It does not invent metadata.

It does not remove the entry from pagination.

Other records continue loading.

## CZ-00. Manifest startup failure example

The journal opens and:

```text
links.txt
```

cannot be loaded because of a network failure.

The application cannot establish current ordering.

It therefore presents a journal-level loading failure.

A useful diagnostic is:

```text
Unable to load journal.

Stage:
  manifest fetch

Resource:
  .../links.txt

Reason:
  Network request failed.

Action:
  Check the network connection and reload the journal.
```

The application must not display an empty journal because that would incorrectly imply the collection has no links.

## DA-00. Logging stages

DELTA should use stable stage names.

Recommended stages are:

```text
cache initialization
manifest fetch
manifest parsing
manifest validation
page calculation
cache lookup
record fetch
record parsing
record validation
cache write
prefetch
manifest refresh
stale fallback
```

These names should appear consistently in DEBUG or ERROR diagnostics.

## DB-00. Normal logging

Normal console output should remain restrained.

Typical information may include:

```text
journal manifest loaded
entry count
current page range
number of network records requested
number resolved from cache
refresh detected manifest change
```

Per-record success messages are usually DEBUG-level information.

The console should remain useful rather than producing hundreds of routine lines.

## DC-00. Debug logging

DEBUG mode should make data behavior reconstructable.

For a page request, it should be possible to determine conceptually:

```text
requested page: 4
manifest range: 24..29
cache hits: 4
network requests: 2
stale fallbacks: 0
errors: 0
```

For individual records, DEBUG information may identify:

```text
ID
source: memory/cache/network/stale-cache
fetch duration
cache age
validation result
```

This should be enough to troubleshoot repeated requests or incorrect caching without adding temporary instrumentation.

## DD-00. Error message quality

User-facing and console errors should describe the actual failure.

Insufficient:

```text
Could not load.
```

Preferred:

```text
Unable to load journal entry.

ID:
  aB7kP2xQ

Stage:
  record validation

Reason:
  Required metadata "lnk:target" is missing.

Record:
  .../lnk/aB7kP2xQ/index.html
```

Errors should name the resource and failed invariant whenever known.

## DE-00. Logging untrusted metadata

Logs must not dump complete fetched HTML documents.

They must not print large descriptions or arbitrary page contents.

Metadata excerpts should be bounded and used only when they materially help diagnostics.

IDs, local cache keys, record URLs, HTTP status values, field names, and validation reasons are normally sufficient.

## DF-00. Performance timing

DEBUG logging should record major timing information.

Conceptually:

```text
Manifest fetch:       42ms
Manifest parse:        1ms
Visible page load:   126ms
Cache hits:             9
Network records:        3
Prefetch started:       6 records
```

The project does not need a telemetry server.

Console diagnostics are the operational telemetry mechanism.

## DG-00. No remote telemetry

The journal MUST NOT send analytics or diagnostic information to an external monitoring service.

It must not transmit:

```text
visited journal pages
saved target URLs
entry titles
errors
cache information
usage history
```

to a third-party telemetry provider.

Troubleshooting is local through the browser console.

## DH-00. Privacy of target URLs

Target URLs are already present in the generated static record and are therefore part of the published archive.

Nevertheless, the journal should not unnecessarily send them to additional domains.

Record HTML and preview images are loaded only from the journal's own origin.

Opening a link is the deliberate action that navigates to the external target.

## DI-00. Cache security

Cached metadata must be considered ordinary local browser data.

The journal must not store:

```text
cookies from target pages
authentication information
target-page browser storage
HTML bodies
preview image bytes
```

Only the generated public record metadata belongs in the cache.

## DJ-00. Refresh while requests are active

A manifest refresh may occur while entry requests from the previous manifest are still in flight.

Results from those requests may still be cached by ID if valid.

However, an entry removed by the new manifest must not reappear merely because its old request completes later.

Rendering always checks membership in the current manifest.

## DK-00. Prefetch after manifest refresh

After a changed manifest is accepted and the navigation anchor is resolved, the data layer recalculates the current visible and adjacent page window.

Obsolete speculative prefetch work may be ignored or cancelled.

New nearby pages may then be prefetched according to the normal rules.

The implementation does not need to preserve speculative scheduling across manifest generations.

## DL-00. Manifest generation token

The data layer MAY maintain a simple in-memory manifest generation counter.

Conceptually:

```text
generation 1 -> initial manifest
generation 2 -> refreshed manifest
```

Asynchronous page operations can record which generation they started under.

This is a simple way to prevent obsolete navigation calculations from replacing state after a manifest refresh.

A generalized reactive state system is unnecessary.

## DM-00. Page request identity

The visible-page controller should similarly identify the latest requested page or spread.

If an older asynchronous page-load operation completes after the user has navigated elsewhere, it may populate caches but must not reset the current visible page.

The journal must remain correct under ordinary asynchronous completion reordering.

## DN-00. Invariant checks

During development and DEBUG operation, the data layer should be able to verify:

```text
manifest IDs are unique
manifest order is unchanged by loading
page ranges do not overlap incorrectly
requested IDs match returned IDs
cache entries belong to their keys
cache timestamps are valid
visible indexes remain within manifest bounds
```

These checks should remain inexpensive.

They may be retained in production when they protect against malformed published data.

## DO-00. Simplicity constraints

The implementation should not solve static pagination as though it were a distributed data system.

It does not need:

```text
cursor pagination APIs
database indexes
server pagination
real-time subscriptions
cache coherence protocols
background sync workers
offline-first reconciliation
```

The complete ordered ID list is already available in a small text manifest.

The appropriate solution is simple array indexing plus bounded record loading.

## DP-00. Data-layer algorithm summary

The normal startup and browsing algorithm is conceptually:

```text
initialize memory cache
initialize localStorage cache if available

fetch links.txt
validate ordered IDs

if zero IDs:
    expose empty journal
    stop initial record loading

determine visible page or spread

for each required ID:
    if fresh in-memory value exists:
        use it
    else if fresh persistent value exists:
        validate and use it
    else:
        fetch lnk/<id>/index.html
        parse inert HTML
        validate metadata
        cache parsed entry
        expose entry

render entries as they resolve

after visible data begins resolving:
    prefetch bounded adjacent pages

when user changes pages:
    repeat same entry-resolution process

when manifest is refreshed:
    compare ordered IDs
    preserve current anchor where possible
    update page count and nearby data window
```

## DQ-00. User scenario: first visit

The journal contains 38 links.

The browser has no application cache.

The user opens the journal.

The application requests `links.txt`.

It validates 38 ordered IDs.

Page `0` contains indexes `0..5`.

Page `1` contains indexes `6..11`.

Because the normal desktop journal shows an initial two-page spread, these 12 entries are high priority.

At most six record HTML requests run simultaneously.

Entries appear progressively as their records resolve.

After required data is underway or complete, page `2` may be prefetched.

The remaining 20 records are not requested.

## DR-00. User scenario: turning forward

The user is viewing pages `0` and `1`.

Page `2` was prefetched.

The user turns forward to pages `2` and `3`.

The six entries of page `2` are already in cache or memory.

Page `3` is resolved immediately from cache where possible and from the network otherwise.

Page `4` becomes the next low-priority prefetch target.

The user does not wait for unrelated older journal pages.

## DS-00. User scenario: turning backward

The user has browsed several spreads forward and then turns backward.

Previously loaded entry metadata remains in memory and/or fresh localStorage.

The data layer resolves those entries without repeating their HTML requests.

The browser may also reuse already loaded preview JPEGs from its own HTTP cache.

Backward navigation therefore normally feels immediate.

## DT-00. User scenario: returning after 30 minutes

The user closes the journal and returns 30 minutes later.

The application fetches a fresh current manifest.

Previously cached entries remain under the one-hour TTL.

If their IDs still occur in the manifest, the journal can use those metadata records immediately.

No network request for those `index.html` files is required.

## DU-00. User scenario: returning after two hours

The user returns after two hours.

The current manifest is fetched.

Old record-cache entries are stale.

The entries required for the first spread are refreshed from their generated HTML documents.

Successful responses replace the stale cache values.

Entries elsewhere in the archive are not refreshed until requested.

## DV-00. User scenario: new links deployed

The journal remains open on an older spread.

The user separately adds and deploys three new links.

After the journal tab has been inactive for more than one hour and becomes visible again, the application refreshes `links.txt`.

It sees three new IDs at the beginning.

It updates the collection length but finds the previously visible anchor ID in the new manifest.

The data layer recalculates the page containing that anchor and keeps the reader near the same historical entries instead of jumping to the newest page.

## DW-00. User scenario: one malformed entry

A six-entry page contains one manually corrupted `index.html`.

Five records validate successfully.

The corrupted record is missing `lnk:target`.

The five valid entries render normally.

The corrupted position renders as an error state rather than disappearing.

The console identifies the ID, file URL, missing field, and validation stage.

Pagination remains stable.

## DX-00. User scenario: cache unavailable

The browser blocks localStorage.

Initialization throws a storage exception.

The data layer logs:

```text
Persistent journal cache unavailable.
Continuing with in-memory cache only.
```

The manifest and records still load normally.

Turning backward during the same browser session can still use memory.

Reloading the page requires new record requests because persistent cache was unavailable.

## DY-00. User scenario: fast navigation

The user quickly turns from the initial spread to a much older spread.

Some initial prefetch requests are still running.

The journal starts loading the newly required entries with higher priority.

Older requests may complete and populate cache, but they do not change the current visible spread.

The application remains logically consistent regardless of request completion order.

## DZ-00. Acceptance conditions

DELTA is satisfied when all of the following are true.

The journal loads its current collection from `links.txt`.

The manifest is fetched independently of the one-hour record cache.

Manifest IDs are validated and remain newest first.

Malformed or duplicate manifest IDs produce explicit repository errors.

An empty manifest produces an empty journal rather than an error.

The fixed logical page size is 6 entries.

A normal two-page spread therefore contains up to 12 entries.

Pagination is calculated from manifest indexes and does not require fetching every record.

Record HTML is fetched only when an entry is required or selected for bounded prefetch.

Fetched HTML is parsed inertly and its redirect scripts do not execute.

Record metadata is selected through explicit ALPHA fields.

Returned `lnk:id` must match the requested manifest ID.

Source metadata is rendered as text rather than HTML.

The journal does not maintain a second remote JSON database.

Parsed entry metadata is cached in localStorage for one hour.

The cache stores metadata only, not HTML documents or JPEG bytes.

Persistent-cache failure does not prevent the journal from operating.

Fresh cache entries avoid unnecessary network requests.

Stale entries are refreshed when required.

A stale cached record may be used explicitly when its ID remains in the current manifest and a current network fetch fails.

A cached entry removed from the current manifest is never displayed.

At most six record HTML requests are active concurrently.

Duplicate simultaneous requests for the same ID are deduplicated.

Individual fetches and the manifest fetch have bounded timeouts.

One malformed record does not prevent unrelated records from loading.

Failed records retain their manifest position so pagination remains stable.

Visible content has priority over speculative prefetch.

Prefetch is limited to nearby pages rather than the complete archive.

The application remains correct when the user navigates faster than network requests complete.

A manifest refresh preserves the reader's current anchor where practical.

No polling, WebSockets, service worker, IndexedDB, remote telemetry service, or server-side API is required.

Console diagnostics expose enough information to determine whether a problem occurred in manifest loading, record fetching, parsing, validation, cache operation, or pagination.

Total startup network work grows with the visible working set rather than with the total number of archived links.

## EA-00. Next specification

The next specification is:

```text
2026-08-16.ECHO.A-00
Journal Presentation and Interaction
```

It will define the visible journal itself: the leather-bound object, closed and open states, two-page spread, six-entry page composition, preview placement, typography, descriptions, physical page proportions, page edges, central binding, page-turn animation, forward and backward navigation, loading and error states, panning, scrolling, responsive behavior, reduced-motion behavior, accessibility, interaction boundaries, performance requirements, and the visual principles established by the supplied journal reference images.

