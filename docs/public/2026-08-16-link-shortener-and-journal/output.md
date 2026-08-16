# MDTREE (`output.md`)


- $Path = `.`
- $FilterPath = ``
- $FilterName = ``
- $Include = ``
- $ExcludeDirs = ``
- $ExcludeFiles = ``
- $MaxFileSizeKB = `1024`
- $Output = `output.md`


Generated on `2026-08-16 15:55:40`

[TOC]

## File content `.specs\suggestions001-001.md`:

2026-08-16

# 2026-08-16.ALPHA.A-01

## A-00. Repository Model and Short-Link Format

This specification defines the persistent representation of the project: repository layout, short-link identity, manifest format, generated link records, preview assets, redirect documents, metadata, ordering, and repository invariants.

This specification deliberately does not define how a page is captured with Playwright, how the journal is rendered, or the complete implementation of the authoring command. Those behaviors are defined by later specifications.

The intended implementation audience is Codex or another coding agent. Requirements are therefore stated explicitly where multiple reasonable implementations could otherwise produce incompatible results.

## B-00. Motivation

The project is a static URL shortener and visual link archive hosted on GitHub Pages.

There is no application server and no runtime database. All persistent state must therefore be representable as ordinary files committed to the repository.

The repository itself is the database.

Each saved URL becomes a self-contained directory. That directory contains the HTML document for the short URL and the generated visual preview associated with it.

A small manifest provides discovery and chronological ordering. It does not duplicate all metadata stored by the individual link records.

This model has three goals.

First, a saved link must remain understandable by inspecting its directory without requiring another database.

Second, the published short URL must work using only GitHub Pages.

Third, the journal must be able to discover and read saved links efficiently without fetching every entry in the archive.

## C-01. Repository structure

The repository MUST contain a root-level `lnk` directory containing generated link records.

The repository MUST contain a root-level manifest named:

```text
links.txt
```

The relevant structure is:

```text
/
  index.html
  links.txt

  lnk/
    <short-id>/
      index.html
      preview.jpg

    <short-id>/
      index.html
      preview.jpg

  ...
```

Supporting journal assets, local scripts, CSS, JavaScript, fonts, and similar files may exist elsewhere in the repository. Their organization is outside the scope of this specification.

`node_modules` MUST NOT be part of the published repository model.

The public application MUST NOT depend on a Node.js runtime.

## D-01. Link record

One saved URL corresponds to exactly one link record.

A link record is the directory:

```text
lnk/<short-id>/
```

A complete link record contains exactly two required generated assets:

```text
index.html
preview.jpg
```

Additional generated files MUST NOT be introduced unless another specification explicitly requires them.

The directory is intended to remain independently inspectable. A developer looking only at a link directory MUST be able to determine the original target URL and the metadata required to display that entry.

## E-00. Short-link URL

The public short URL has this logical form:

```text
<site-base>/lnk/<short-id>/
```

For example:

```text
https://example.github.io/project/lnk/aB7kP2xQ/
```

The trailing slash is part of the canonical short-link form.

The implementation MUST use relative site paths where possible and MUST NOT hard-code an assumption that the GitHub Pages site is hosted at the root of a domain. The project may be published below a GitHub Pages project prefix.

The short ID is case-sensitive.

Therefore:

```text
aB7kP2xQ
```

and:

```text
ab7kp2xq
```

are different identifiers.

## F-00. Short ID format

Each short ID MUST contain exactly 8 characters.

The permitted alphabet is:

```text
ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789
```

This is a 62-character URL-safe alphabet.

Characters such as `/`, `+`, `=`, `_`, `-`, whitespace, or punctuation MUST NOT occur in an ID.

IDs MUST be generated randomly rather than sequentially.

The generator SHOULD use the cryptographically secure random functionality included with Node.js rather than `Math.random()`.

An ID is accepted only after confirming that:

```text
lnk/<candidate-id>/
```

does not already exist.

If a collision exists, another candidate MUST be generated.

An existing link record MUST never be overwritten because a generated ID happens to collide with its ID.

The implementation does not need a configurable ID length or multiple ID schemes.

## G-00. Target URL representation

Every record stores exactly one original target URL.

The stored URL MUST be an absolute `http:` or `https:` URL.

Other schemes are invalid for this project.

For example, these are valid targets:

```text
https://example.com/article
http://example.net/document?id=42
```

These are not valid targets:

```text
/example
file:///tmp/page.html
javascript:alert(1)
mailto:person@example.com
```

The stored target MUST use the serialized result of the platform's standard URL parser rather than preserving arbitrary whitespace or malformed input.

The URL fragment MUST be preserved.

The query string MUST be preserved.

Query parameters MUST NOT be reordered.

Query parameters MUST NOT be removed because they appear to be tracking parameters.

The system MUST NOT attempt semantic URL canonicalization.

For example:

```text
https://example.com/article?a=1&b=2
```

and:

```text
https://example.com/article?b=2&a=1
```

are treated as different target URLs unless standard URL serialization itself makes them identical.

This restriction is intentional. Aggressive normalization can incorrectly merge two URLs whose behavior differs.

## H-00. Duplicate identity

Two link records MUST NOT represent the same serialized target URL.

Duplicate identity is determined using the stored URL representation defined in section G-00.

A URL fragment therefore participates in identity.

For example:

```text
https://example.com/manual#installation
```

and:

```text
https://example.com/manual#configuration
```

are different records.

The authoring tool MUST perform duplicate checking against the existing records before committing a new record.

The precise user-facing duplicate error is defined by the authoring specification, but this repository specification establishes the invariant:

```text
one serialized target URL -> at most one short ID
```

## I-00. Creation timestamp

Every link record MUST contain the time at which the record was successfully created.

The timestamp MUST be stored in UTC using ISO 8601 format.

Example:

```text
2026-08-16T18:42:17Z
```

Milliseconds are unnecessary and SHOULD NOT be stored.

This timestamp is immutable after creation.

Regenerating a preview, fixing metadata, or modifying generated HTML MUST NOT change the original creation timestamp.

## J-00. Required entry metadata

Every `lnk/<id>/index.html` MUST expose the following information directly in its HTML:

```text
short ID
original target URL
creation timestamp
title
description
preview image URL
```

The document MUST also contain standard social-preview metadata sufficient for consumers that support Open Graph metadata.

The project MUST NOT require executing JavaScript in order to discover this metadata.

The journal MUST be able to retrieve the generated HTML using `fetch()`, parse it using the browser DOM parser, and obtain all required entry metadata without navigating to the target URL.

## K-00. Project metadata names

Project-specific metadata MUST use explicit `<meta>` elements.

The required project fields are:

```html
<meta name="lnk:id" content="aB7kP2xQ">
<meta name="lnk:target" content="https://example.com/article">
<meta name="lnk:created" content="2026-08-16T18:42:17Z">
```

The document MUST also provide:

```html
<title>...</title>
<meta name="description" content="...">
```

The journal treats these fields as the record contract.

The implementation MUST NOT make the journal depend on positional HTML parsing such as "the third meta element" or "the first paragraph."

Metadata MUST be selected by explicit element names.

## L-01. Social-preview metadata

The generated page MUST contain at least:

```text
og:title
og:description
og:image
og:url
og:type
```

`og:type` MUST be:

```text
website
```

`og:title` MUST contain the sanitized title representing the captured target page.

`og:description` MUST contain the sanitized description representing the captured target page.

`og:image` MUST point to the generated `preview.jpg`.

`og:url` MUST identify the public short URL rather than the external target URL.

The external target remains available separately through:

```text
lnk:target
```

The HTML `<title>` and ordinary description metadata MUST use the same sanitized logical title and description as their Open Graph equivalents.

The extraction and fallback rules are defined further by the authoring and capture specifications. The sanitization contract is defined in section M-01 and is part of this repository format.

## M-01. External text sanitization and HTML escaping

Text obtained from an external page MUST be treated as untrusted input.

At minimum, the following externally obtained textual fields MUST pass through the same sanitization process before being written into a generated record:

```text
title
description
social-preview title
social-preview description
```

The implementation MAY reuse the same sanitizer for other externally obtained human-readable text.

URLs are excluded from this text sanitizer. URLs use the URL validation and serialization rules defined in section G-00 and are then escaped correctly for their HTML context.

The purpose of text sanitization is both defensive and presentational. Generated metadata should contain predictable text and should not preserve emoji, unusual Unicode symbols, decorative Unicode punctuation, control characters, or other characters that may render inconsistently or interfere with downstream consumers.

### Allowed writing systems

After sanitization, externally obtained title and description text MAY contain letters from these writing systems:

```text
Latin
Cyrillic
Han characters used by Chinese and Japanese text
Hiragana
Katakana
```

Latin includes ordinary English alphabetic characters.

The implementation SHOULD define these groups using explicit Unicode script or code-point rules rather than using a broad rule such as "all Unicode letters."

Characters belonging to unrelated scripts MUST NOT survive sanitization.

Emoji MUST NOT survive sanitization.

Unicode symbols MUST NOT survive sanitization.

Unicode punctuation MUST NOT survive sanitization.

Unicode control and formatting characters MUST NOT survive sanitization.

### Allowed ASCII characters

In addition to the permitted letter groups, ordinary ASCII space is allowed.

A limited set of internal ASCII punctuation is allowed:

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

The ASCII hyphen-minus:

```text
-
```

is allowed.

A Unicode em dash, en dash, non-breaking hyphen, or visually similar Unicode punctuation character is not converted into a hyphen. It is removed through the normal replacement procedure.

The ampersand character:

```text
&
```

is not part of the allowed punctuation set.

Digits are not part of the allowed title and description character set.

Other ASCII punctuation is not allowed unless this specification is revised explicitly.

### Replacement procedure

Every disallowed character MUST be replaced with an ordinary ASCII space rather than concatenating the surrounding text.

For example:

```text
HelloðŸ˜€World
```

becomes conceptually:

```text
Hello World
```

rather than:

```text
HelloWorld
```

Likewise:

```text
Alpha â€” Beta
```

becomes:

```text
Alpha Beta
```

The sanitizer MUST then collapse every run of one or more whitespace characters into exactly one ASCII space.

Leading and trailing whitespace MUST then be removed.

### Edge punctuation cleanup

After replacement and whitespace normalization, the result MUST be trimmed from both ends until its first and last remaining characters are letters from one of the permitted writing systems.

This prevents generated text from starting or ending with leftover punctuation.

For example:

```text
... Example title !!!
```

becomes:

```text
Example title
```

and:

```text
-- Ð¡Ñ‚Ð°Ñ‚ÑŒÑ Ð¾ Ð±Ñ€Ð°ÑƒÐ·ÐµÑ€Ð°Ñ… --
```

becomes:

```text
Ð¡Ñ‚Ð°Ñ‚ÑŒÑ Ð¾ Ð±Ñ€Ð°ÑƒÐ·ÐµÑ€Ð°Ñ…
```

Internal allowed punctuation remains intact.

For example:

```text
Example: Browser rendering, parsing, and capture
```

may remain unchanged because its punctuation occurs within otherwise valid text.

### Empty results

Sanitization may remove the entire source string.

If the resulting title is empty, the stored title MUST be the fixed literal:

```text
(no title)
```

If the resulting description is empty, the stored description MUST be the fixed literal:

```text
(no description)
```

These two fixed placeholders are explicit exceptions to the general rule requiring stored source-derived text to begin and end with an allowed letter.

The placeholders MUST NOT be localized dynamically and MUST NOT be derived from the target page.

### Example: emoji and Unicode punctuation

Input:

```text
ðŸ”¥ Amazing Article â€” New Browser Tricks ðŸš€
```

Result:

```text
Amazing Article New Browser Tricks
```

### Example: supported multilingual text

Input:

```text
Guide â€” Ð ÑƒÐºÐ¾Ð²Ð¾Ð´ÑÑ‚Ð²Ð¾ â€” æ—¥æœ¬èªž â€” ä¸­æ–‡
```

Result:

```text
Guide Ð ÑƒÐºÐ¾Ð²Ð¾Ð´ÑÑ‚Ð²Ð¾ æ—¥æœ¬èªž ä¸­æ–‡
```

### Example: unsupported characters

Input containing characters outside the approved scripts:

```text
Example <unsupported-script-text> Article
```

must retain only the characters belonging to the approved scripts and replace the rejected portion with spacing before whitespace collapse.

### HTML escaping after sanitization

Sanitization does not replace HTML escaping.

After text has been sanitized, every value written into generated HTML MUST still be escaped according to its HTML context.

For example, allowed ASCII quotation marks in a description MUST be encoded correctly when written inside an HTML attribute.

Target-page content MUST always be treated as data rather than trusted HTML.

The generator MUST NOT copy remote HTML directly into generated metadata fields.

The required order is conceptually:

```text
extract remote text
validate expected type
sanitize allowed characters
normalize whitespace
apply empty-field fallback
escape for destination HTML context
write generated HTML
```

## N-01. Preview asset

Every complete record MUST contain:

```text
preview.jpg
```

JPEG is the fixed preview format for this project.

The generated `index.html` MUST reference this asset rather than depending on the original website's social image.

The preview MUST be encoded as JPEG at approximately 90 percent quality.

If the capture process initially produces another image representation, the authoring workflow MUST convert the final preview to JPEG before the record is completed.

The repository MUST NOT retain an additional PNG copy merely because an intermediate capture operation produced PNG.

The goal is to reduce repository size while retaining sufficient quality for readable social previews and journal thumbnails.

The actual capture dimensions, crop-selection algorithm, image-processing procedure, and visual quality requirements are defined by the page-capture specification.

This specification establishes the repository contract:

```text
lnk/<id>/preview.jpg
```

is the social-preview image belonging to that record.

The preview image MUST NOT be shared between multiple records through an external cache or content-addressed asset store.

The simple one-record/one-preview model is intentional.

## O-00. Redirect document

`lnk/<id>/index.html` serves two different consumers.

A metadata crawler reads the document to obtain social-preview information.

A browser user opening the short URL should be redirected to the original target.

The generated document MUST therefore contain metadata directly in the initial HTML and MUST also implement client-side redirection.

The redirect MUST use both:

```text
HTML meta refresh
JavaScript location replacement
```

The JavaScript form SHOULD use replacement semantics so that pressing the browser Back button does not unnecessarily return the user to the redirect document.

Conceptually:

```text
declare metadata
declare meta refresh to TARGET
when JavaScript runs:
    replace current location with TARGET
```

The exact generated source can remain very small.

The page MUST also contain a normal clickable fallback link to the target URL for environments in which automatic redirection does not occur.

The fallback text should communicate the behavior directly, for example:

```text
Continue to the original page
```

## P-00. No HTTP redirect claim

The generated short-link document MUST NOT claim to implement HTTP status code `301`, `302`, `307`, or `308`.

GitHub Pages serves a static HTML document. The project does not control the HTTP response sufficiently to implement a conventional server-side redirect for every generated link.

The behavior defined by this project is therefore:

```text
static HTML page -> client-side redirect -> target URL
```

Documentation, console messages, and implementation comments SHOULD use terminology consistent with this behavior.

## Q-00. Manifest purpose

`links.txt` is the discovery and ordering index for the journal.

It is not a database containing complete link metadata.

Each non-empty line contains exactly one short ID.

Example:

```text
aB7kP2xQ
m2N8cR4L
Qp91VxKs
```

The first ID is the newest entry.

The last ID is the oldest entry.

The manifest MUST NOT contain titles, descriptions, URLs, timestamps, JSON fragments, comments, or delimiters.

This intentionally keeps the file trivial to generate, inspect, compare, and parse.

## R-00. Manifest syntax

The manifest uses UTF-8 text.

Each record consists of:

```text
<short-id>\n
```

A final newline SHOULD be present.

Blank lines MUST NOT be written by the generator.

Readers MAY ignore blank lines defensively.

Whitespace surrounding an ID MUST NOT be generated.

Readers MAY trim surrounding ASCII whitespace defensively before validation.

Duplicate IDs MUST NOT occur in the manifest.

Every manifest ID MUST correspond to an existing complete link record.

Every published complete link record MUST appear exactly once in the manifest.

## S-00. Ordering invariant

Manifest order is authoritative for journal chronology.

The first manifest entry is the newest.

A newly created link is inserted at the beginning.

Example before adding a link:

```text
BBBBBBBB
AAAAAAAA
```

After successfully creating `CCCCCCCC`:

```text
CCCCCCCC
BBBBBBBB
AAAAAAAA
```

The journal MUST NOT need to fetch every record and sort timestamps before showing the newest links.

The creation timestamp remains part of each record for inspection and consistency, but manifest order determines presentation order.

## T-00. Record completeness

A record is complete only when all of the following are true:

```text
lnk/<id>/ exists
lnk/<id>/index.html exists
lnk/<id>/preview.jpg exists
index.html contains the required project metadata
index.html contains the required social metadata
the ID appears exactly once in links.txt
```

A partially generated directory is not a valid repository record.

The authoring workflow MUST arrange writes so that a failed generation does not intentionally publish an incomplete record into `links.txt`.

The exact temporary-file strategy is implementation detail unless required by the authoring specification.

## U-01. Manifest consistency

The following repository states are invalid:

```text
links.txt references an ID whose directory does not exist
links.txt references an ID without index.html
links.txt references an ID without preview.jpg
one ID occurs more than once in links.txt
two directories contain the same lnk:target
an entry's lnk:id differs from its directory name
```

For example, this is invalid:

```text
lnk/aB7kP2xQ/index.html
```

containing:

```html
<meta name="lnk:id" content="anotherID">
```

The directory name and stored `lnk:id` MUST agree exactly.

## V-00. Self-reference rules

Links inside generated metadata MUST work when the project is hosted below a path prefix.

The generator MUST NOT assume:

```text
https://domain.example/lnk/<id>/
```

when the actual project could be:

```text
https://domain.example/tools/archive/lnk/<id>/
```

For metadata requiring an absolute public URL, the authoring environment will need to know the configured public site base URL.

That configuration belongs to the authoring specification.

Repository-internal resources SHOULD use paths that remain valid under project-path hosting.

## W-00. Record immutability

A short ID identifies one target URL for the lifetime of that record.

After creation, an ID MUST NOT be repointed to an unrelated URL.

If an incorrect record is intentionally removed and another link is later added, the removed ID SHOULD NOT be deliberately reused.

This keeps shared short URLs understandable and avoids surprising changes in meaning.

The title, description, and preview may be regenerated for the same target if necessary, but the relationship:

```text
short ID -> original target URL
```

is stable.

## X-00. Deletion model

Deletion is allowed but expected to be uncommon.

Deleting a record requires removing both:

```text
lnk/<id>/
```

and its corresponding line from:

```text
links.txt
```

A deleted record MUST NOT remain in the manifest.

This specification does not require tombstones, redirect history, deleted-record databases, or ID recycling.

The journal's behavior when previously cached records disappear is defined in the journal data specification.

## Y-01. Source-control model

Generated records are normal repository content.

After local generation, the user manually reviews, commits, and pushes the resulting files.

The generation process MUST NOT require automatic Git commits.

The generation process MUST NOT require automatic Git pushes.

The repository contents before a commit remain inspectable using ordinary Git tooling.

A typical successful change should therefore resemble:

```text
modified: links.txt
new file: lnk/aB7kP2xQ/index.html
new file: lnk/aB7kP2xQ/preview.jpg
```

This predictability is desirable because it makes each saved link easy to audit.

## Z-01. Example: adding the first record

Assume the repository initially contains:

```text
links.txt
lnk/
```

and `links.txt` is empty.

The user later adds:

```text
https://example.com/articles/static-web
```

Suppose the generated ID is:

```text
aB7kP2xQ
```

The resulting repository becomes:

```text
links.txt

lnk/
  aB7kP2xQ/
    index.html
    preview.jpg
```

`links.txt` contains:

```text
aB7kP2xQ
```

The generated HTML identifies:

```text
ID:       aB7kP2xQ
Target:   https://example.com/articles/static-web
Created:  2026-08-16T18:42:17Z
```

The public short URL is conceptually:

```text
<site-base>/lnk/aB7kP2xQ/
```

Opening that URL in a browser redirects to the original article.

Fetching the same `index.html` as text from the journal exposes its metadata without requiring the journal to follow the target URL.

The generated social preview is:

```text
lnk/aB7kP2xQ/preview.jpg
```

encoded as JPEG at approximately 90 percent quality.

## AA-00. Example: journal discovery

Assume:

```text
links.txt
```

contains:

```text
NEW00001
MID00002
OLD00003
```

The journal knows immediately that `NEW00001` is newest.

It can request:

```text
lnk/NEW00001/index.html
```

and parse the controlled metadata.

It does not need to enumerate directories.

It does not need a server API.

It does not need to download all three records merely to determine ordering.

## AB-00. Example: duplicate target

Assume the repository already contains:

```text
lnk/aB7kP2xQ/index.html
```

whose target is:

```text
https://example.com/article
```

Adding the same serialized URL again MUST NOT create:

```text
lnk/nEw12345/
```

Instead, duplicate detection must discover that the target already belongs to:

```text
aB7kP2xQ
```

and leave the repository unchanged.

The exact error text is specified in the authoring workflow specification.

## AC-00. Example: similar but distinct URLs

These URLs are different records:

```text
https://example.com/search?q=book
https://example.com/search?q=books
```

These are also different:

```text
https://example.com/manual#chapter-1
https://example.com/manual#chapter-2
```

The repository model MUST NOT attempt to infer that they represent the same conceptual resource.

## AD-00. Example: static hosting under a prefix

Assume the site is published at:

```text
https://example.github.io/toys/links/
```

A generated entry may therefore be publicly reachable as:

```text
https://example.github.io/toys/links/lnk/aB7kP2xQ/
```

The implementation must remain correct in this configuration.

An implementation that assumes the entry is located at:

```text
https://example.github.io/lnk/aB7kP2xQ/
```

is incorrect.

## AE-00. Performance characteristics

The manifest is intentionally compact because it is expected to be fetched frequently.

Adding one link increases the manifest by approximately one ID and one newline.

The repository design MUST NOT require the root application to download every generated `index.html` during startup.

Metadata duplication between the manifest and entry documents SHOULD be avoided.

The repository model requires no indexing service and no preprocessing step at page-load time.

For the intended personal-scale archive, a linear local scan during authoring is acceptable when duplicate detection requires it. A more complicated indexing database MUST NOT be introduced solely to optimize hypothetical large-scale usage.

## AF-01. Diagnostics relevant to repository state

Repository-related failures MUST expose enough context for troubleshooting.

When a tool detects an inconsistent record, diagnostics should identify at least the relevant short ID, filesystem path, and failed invariant.

For example, a useful diagnostic is conceptually:

```text
Invalid link record "aB7kP2xQ":
expected preview file "lnk/aB7kP2xQ/preview.jpg", but the file does not exist.
```

A diagnostic such as:

```text
Invalid data.
```

is insufficient.

Input sanitization failures or unexpected source metadata SHOULD also provide useful diagnostic context without dumping arbitrary untrusted page content into the console.

For example, diagnostics may report that a source title became empty after sanitization and that `(no title)` was used.

The complete logging, telemetry, error-formatting, and user-notification contract is defined in a dedicated later specification.

## AG-00. Simplicity constraints

The implementation MUST NOT add a server-side database to represent these records.

The implementation MUST NOT introduce a JSON database containing another authoritative copy of all link metadata.

The implementation MUST NOT require a framework to parse the manifest.

The implementation MUST NOT create a generalized storage abstraction in anticipation of alternative backends.

The implementation MUST NOT introduce versioned record schemas unless an actual compatibility requirement emerges while implementing this finalized project.

The fixed filesystem contract in this specification is sufficient.

## AH-01. Acceptance conditions

This specification is satisfied when a repository can contain multiple generated links and all of the following statements remain true.

Each saved URL has one unique 8-character ID.

Each ID maps to exactly one directory under `lnk/`.

Each complete directory contains `index.html` and `preview.jpg`.

Each preview is stored as JPEG at approximately 90 percent quality.

Each generated HTML document identifies its ID, target URL, creation timestamp, sanitized title, sanitized description, and preview.

Externally sourced title and description text contains only the explicitly permitted writing systems, ASCII spaces, and allowed ASCII punctuation after sanitization.

Emoji, unsupported scripts, Unicode punctuation, Unicode symbols, and other disallowed characters do not survive sanitization.

Disallowed characters are replaced with spaces, repeated whitespace is collapsed, and leading or trailing punctuation is removed.

An empty sanitized title becomes `(no title)`.

An empty sanitized description becomes `(no description)`.

Each generated HTML document contains social-preview metadata without requiring JavaScript execution.

Opening the short-link document in a browser redirects toward the stored target using static client-side mechanisms.

`links.txt` contains every published record exactly once.

`links.txt` is ordered newest first.

The journal can discover records from `links.txt` and obtain individual metadata by fetching their generated HTML.

No server, runtime database, or AI service is required to interpret the published repository.

The repository remains understandable by direct filesystem inspection.

## AI-00. Next specification

The next specification is:

```text
2026-08-16.BRAVO.A-00
Link Authoring and Generation Workflow
```

It will define the local user workflow for adding a URL, including the command interface, dependency validation, duplicate detection, Playwright invocation, metadata extraction, text sanitization, JPEG conversion, record creation, manifest update, transactional behavior, user-facing errors, and successful completion reporting.


## File content `.specs\suggestions001-002.md`:

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
ðŸ”¥ Great Article â€” æ—¥æœ¬èªž & Ð ÑƒÑÑÐºÐ¸Ð¹ ðŸš€
```

The stored title becomes:

```text
Great Article æ—¥æœ¬èªž Ð ÑƒÑÑÐºÐ¸Ð¹
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



## File content `.specs\suggestions001-003.md`:

2026-08-16

# 2026-08-16.CHARLIE.A-00

## A-00. Page Capture and Social Preview Generation

This specification defines how the local authoring tool renders a target web page with Playwright and produces the visual preview stored as:

```text
lnk/<short-id>/preview.jpg
```

The preview is used in two places.

It is the Open Graph image for the generated short URL.

It is also the primary visual representation of the saved link inside the journal.

The preview must therefore optimize for recognition and readability rather than for visual completeness.

This specification defines browser configuration, readiness, metadata candidate extraction, overlay handling, capture-region discovery, scoring, crop selection, image generation, JPEG encoding, validation, performance limits, failure behavior, and diagnostics.

The process MUST be deterministic and MUST NOT use AI.

## B-00. Motivation

The purpose of the preview is to help the user recognize a saved page later.

A generic website logo is insufficient.

A screenshot of an entire long page scaled into a small social card is also insufficient because text and important visual details become unreadable.

The desired preview behaves more like a physical clipping from the source page.

The tool should identify a useful rectangular region of the rendered page and capture that region at approximately its natural browser scale.

A good preview might contain:

```text
an article heading and opening paragraph
a heading and related photograph
a product name and product image
a diagram and its caption
a documentation heading and explanatory text
a recognizable application interface
```

The preview should provide enough context that the user can often remember the destination before opening the link.

## C-00. Core capture principle

The preview MUST be selected from actual rendered page content.

The implementation MUST NOT generate a synthetic card containing reconstructed text.

The implementation MUST NOT use the remote site's logo as a fallback social card unless that logo naturally appears inside the selected page region.

The implementation MUST NOT create an image from only Open Graph metadata.

The implementation MUST NOT capture an entire page and scale it down to fit the final dimensions.

The desired process is:

```text
render page at normal readable scale
identify useful content
identify a rectangular region of the rendered page
capture that region
perform only minimal final resizing when required
encode as JPEG
```

Content should remain visually close to the size at which it appeared in the browser.

## D-00. No AI

Capture analysis MUST use deterministic document and layout heuristics.

It MUST NOT use:

```text
vision models
language models
OCR-based semantic understanding
image classifiers
embedding models
remote analysis services
AI-generated crop decisions
```

The algorithm may inspect browser-accessible properties such as:

```text
DOM structure
element roles
tag names
computed styles
bounding rectangles
visible text length
heading presence
image dimensions
viewport position
element density
overlap
```

These inputs are sufficient for this project.

## E-00. Browser technology

Playwright is the required browser automation technology.

Puppeteer MUST NOT be introduced.

The normal capture workflow uses a Chromium browser engine.

Using one fixed engine reduces environmental variation between captures.

The browser SHOULD run headless during normal operation.

A visible debugging mode may be implemented for development, but it MUST NOT affect the normal capture algorithm.

## F-00. Browser viewport

The capture browser MUST use a fixed desktop viewport.

The viewport is:

```text
width: 1440 CSS pixels
height: 1000 CSS pixels
device scale factor: 1
```

The browser MUST use a device scale factor of `1`.

This establishes a predictable relationship between CSS pixels and output image pixels.

The capture workflow MUST NOT emulate a mobile device.

The browser MUST NOT automatically zoom the page.

Browser page zoom MUST remain at 100 percent.

The implementation MUST NOT use browser zoom as a mechanism for fitting more content into the preview.

## G-00. Preview dimensions

The final preview canvas MUST be:

```text
1200 x 630 pixels
```

This is a project-defined fixed output format.

Every completed `preview.jpg` MUST have exactly these dimensions.

The aspect ratio is therefore approximately:

```text
1.9048 : 1
```

The algorithm should prefer selecting an actual page region with this aspect ratio.

The implementation MUST NOT maintain multiple social-preview sizes.

One fixed image is sufficient for this project.

## H-00. Relationship between viewport and output

Because the browser viewport is 1440 pixels wide and the output preview is 1200 pixels wide, the algorithm can normally capture a 1200 x 630 CSS-pixel region directly from the rendered page.

This is the preferred case.

Conceptually:

```text
browser page
+------------------------------------------------------+
|                                                      |
|       +--------------------------------------+       |
|       |                                      |       |
|       |        selected 1200 x 630           |       |
|       |                                      |       |
|       +--------------------------------------+       |
|                                                      |
+------------------------------------------------------+
```

When a 1200 x 630 region can be selected directly, the resulting image SHOULD be captured without rescaling.

This preserves readable text and natural page detail.

## I-00. Permitted final resizing

A perfect 1200 x 630 source rectangle may not always be possible.

A small amount of final resizing is permitted when necessary.

The source rectangle SHOULD remain within approximately 10 percent of the final dimensions in either direction.

For example, capturing:

```text
1180 x 620
```

and resizing to:

```text
1200 x 630
```

is acceptable.

Capturing:

```text
2400 x 1260
```

and scaling it down to:

```text
1200 x 630
```

is not acceptable as the normal strategy.

The algorithm should modify the crop region before resorting to significant scaling.

## J-00. Page navigation

Playwright navigates to the serialized target URL supplied by BRAVO.

Normal server-side and browser redirects are allowed.

The final browser URL may differ from the stored target.

The capture algorithm operates on the final rendered document reached after navigation.

The stored short-link target remains unchanged as defined by BRAVO.

## K-00. Navigation timeout

Initial page navigation MUST use a bounded timeout.

The navigation timeout is:

```text
30 seconds
```

The tool MUST NOT wait indefinitely.

A navigation timeout ends the capture unless Playwright has already loaded a usable document and the readiness algorithm explicitly determines that capture can safely continue.

Any such continuation must be deterministic and logged.

## L-00. Initial readiness

After navigation, the tool waits for:

```text
DOMContentLoaded
```

or an equivalent Playwright state indicating that the document structure is available.

The tool MUST NOT require the page to reach a permanent `networkidle` state.

Many modern pages continuously make network requests, maintain analytics connections, or update background data.

Waiting indefinitely for zero network activity would therefore be unreliable.

## M-00. Secondary readiness window

After DOM readiness, the capture workflow allows a bounded stabilization period.

The default stabilization budget is:

```text
5 seconds
```

During this period, the tool may wait for:

```text
document fonts
initial visible images
major layout shifts
client-rendered article content
```

The full capture process MUST proceed when the budget expires if a usable page state exists.

The tool MUST NOT keep extending this window because individual resources continue loading.

## N-00. Font readiness

If the browser exposes `document.fonts.ready`, the capture workflow SHOULD wait for it within the existing stabilization budget.

Failure of one remote font to load MUST NOT automatically cause capture failure.

The page may be captured using fallback fonts if the rest of the content is usable.

A font timeout MAY be logged at DEBUG level.

## O-00. Image readiness

The tool should allow visible images relevant to the initial content region time to load.

It MUST NOT wait for every image in a long document.

Images outside the current analysis region should not block readiness.

The capture algorithm MAY query image elements whose bounding rectangles intersect approximately the first two viewport heights.

Images that remain incomplete after the stabilization window are treated according to the page state that actually exists at capture time.

## P-00. Layout stability

The algorithm should avoid capturing during obvious initial layout movement.

A simple deterministic stability test is sufficient.

Conceptually:

```text
sample major content rectangles
wait briefly
sample again

if movement is small:
    consider layout stable
else:
    repeat within stabilization budget
```

The implementation MUST NOT create a complex general-purpose visual stability engine.

The goal is only to avoid capturing an obviously unfinished initial layout.

## Q-00. Animation handling

Animations can produce nondeterministic screenshots.

Before final region analysis and capture, the tool SHOULD disable CSS animations and transitions in the current document.

This may be done by injecting a local stylesheet that effectively applies:

```text
animation: none
transition: none
```

to rendered content.

The implementation SHOULD also pause animated scrolling behavior where practical.

The capture process MUST NOT wait for decorative animations to finish naturally.

## R-00. Video handling

Automatically playing video can make screenshots nondeterministic.

The capture workflow SHOULD pause HTML media elements before analysis.

The tool MUST NOT require media playback to identify a valid capture region.

A video element may still appear as a visible frame if it naturally occupies part of a selected region.

The implementation MUST NOT download or process the complete video.

## S-00. Scrolling policy

The algorithm may scroll the page while searching for useful content.

Scrolling must be deterministic.

The system should inspect a bounded portion of the page rather than traversing arbitrary document length.

The normal search area is:

```text
from document top
through the first 4000 CSS pixels of vertical document content
```

If the document is shorter, the entire document may be considered.

The tool MUST NOT scan tens or hundreds of thousands of pixels merely because a page uses infinite scrolling.

## T-00. Lazy-loaded content

Some useful content may load only after scrolling.

During bounded analysis, the algorithm MAY scroll through candidate areas to trigger ordinary lazy loading.

The process SHOULD pause briefly after each meaningful scroll position.

The total lazy-loading activity must remain within the capture time budget.

The tool MUST NOT intentionally trigger infinite feeds.

The tool MUST NOT repeatedly scroll to the bottom waiting for more content.

## U-00. Capture time budget

After successful initial navigation, preview analysis and generation SHOULD complete within an additional:

```text
20 seconds
```

under normal conditions.

This includes stabilization, bounded scrolling, candidate discovery, screenshot capture, and image preparation before external JPEG encoding.

This is a performance target rather than a hard guarantee for every filesystem or browser environment.

No individual wait may be unbounded.

## V-00. Overlay problem

Pages frequently contain overlays that obscure useful content.

Common examples include:

```text
cookie consent banners
newsletter popups
application-install banners
notification prompts
fixed promotional panels
modal dialogs
sticky headers
sticky footers
```

The capture algorithm may remove or dismiss nonessential overlays when they obstruct the candidate region.

It must do so conservatively.

## W-00. Overlay detection

A visible element may be considered an overlay candidate when several conditions are present.

Useful signals include:

```text
position: fixed
position: sticky
high z-index
large overlap with viewport content
modal or dialog semantics
large viewport coverage
placement independent of document flow
```

No single CSS property should automatically cause deletion.

For example, a site's fixed navigation header should not necessarily be removed merely because it is `position: fixed`.

## X-00. Overlay removal preference

When an overlay is clearly non-content and dismissible, the tool may first attempt to use an obvious dismissal control.

Examples of candidate controls include accessible buttons labeled conceptually as:

```text
close
dismiss
reject
continue without
not now
```

The tool SHOULD prefer rejecting optional consent rather than accepting it when a clear reject action exists.

The capture tool MUST NOT intentionally grant optional notification, location, camera, microphone, or similar permissions.

## Y-00. Overlay hiding fallback

If a clearly identified non-content overlay cannot be dismissed reliably, the capture tool MAY hide that element locally in the browser page solely for screenshot generation.

This modification affects only the temporary Playwright document.

It does not modify the remote site.

The action should be logged at DEBUG level with enough context to identify the hidden element category.

## Z-00. Access-control boundaries

The tool MUST distinguish ordinary presentation overlays from access-control barriers.

It MUST NOT bypass:

```text
authentication walls
paywalls
CAPTCHA challenges
anti-bot challenges
authorization prompts
restricted-content gates
```

If the rendered page is dominated by such an access barrier and the actual requested content cannot be captured, preview generation MUST fail.

The system should not save a CAPTCHA or login wall as if it were the intended article.

## AA-00. Initial content analysis

Once the page is stable enough, the algorithm analyzes visible and near-visible DOM regions.

The analysis should favor content-bearing elements.

Useful candidate roots include:

```text
article
main
section
role=main
large content containers
large heading-containing containers
documentation content regions
product-detail regions
```

The algorithm should not assume that semantic HTML is present.

Generic `div` containers may also become candidates based on their visual and textual properties.

## AB-00. Candidate rectangle

A candidate is a rectangular page region that may be expanded or adjusted into the final 1200 x 630 crop.

Each candidate should contain at least one meaningful content signal.

Examples are:

```text
a heading
a substantial text block
a sufficiently large image
a meaningful combination of text and image
a visually substantial interface region
```

Candidate generation should use actual rendered bounding rectangles rather than DOM tree position alone.

## AC-00. Candidate source hierarchy

The algorithm should first search for strong semantic candidates.

Conceptually, candidate discovery priority is:

```text
article or main content containers
heading-centered content groups
text-and-image groups
large meaningful images with nearby text
large readable text regions
other substantial visible content
```

The hierarchy is a search preference rather than an unconditional selection rule.

All candidates still pass through scoring and validity checks.

## AD-00. Heading signals

Headings are strong recognition signals.

The algorithm should recognize visible:

```text
h1
h2
h3
elements with heading role
large prominent text functioning as a heading
```

`h1` should receive the strongest heading preference.

A region containing an `h1` and supporting content is normally preferable to an equally sized region containing only body text.

The algorithm must not assume that every page has an `h1`.

## AE-00. Text signals

Readable textual content contributes positively to candidate quality.

The algorithm may measure:

```text
visible character count
number of text lines
font size
text-area density
presence of multiple words
distance from a heading
```

Very small text should contribute little or no positive score.

Text hidden by CSS or outside the rendered layout must not count.

Script, style, metadata, and non-rendered text must not count.

## AF-00. Minimum useful text size

Text should generally be considered useful when its computed font size is at least:

```text
14 CSS pixels
```

Headings may naturally be larger.

The algorithm MAY consider slightly smaller text when no stronger content exists, but it should not prefer a region whose main information is effectively unreadable at the final preview size.

## AG-00. Image signals

Rendered images can strongly improve recognizability.

An image receives positive weight when it has meaningful displayed dimensions.

A useful image should normally be at least approximately:

```text
200 x 120 CSS pixels
```

Small icons, favicons, avatars, social buttons, decorative glyphs, and tracking pixels should not materially improve a candidate score.

The algorithm should use rendered dimensions rather than intrinsic dimensions alone.

## AH-00. Background images

Meaningful CSS background images may be considered when they occupy a substantial visible region.

The implementation does not need to inspect every computed background image in the document.

It may restrict this analysis to already identified candidate containers.

Decorative page backgrounds should not dominate scoring.

## AI-00. Content balance

A candidate containing both recognizable text and meaningful imagery should normally score higher than a similarly positioned candidate containing only one of those signals.

This is not absolute.

A documentation page containing a strong heading and readable code or prose can be an excellent preview without a photograph.

Likewise, a visual page may have one highly recognizable image with little text.

The scoring system must therefore combine signals rather than requiring a fixed card template.

## AJ-00. Negative signals

The following characteristics should reduce candidate quality:

```text
navigation-dominated region
footer-dominated region
advertising
cookie or consent UI
login forms
large empty space
mostly icons
mostly buttons
social-sharing controls
related-content lists
comment sections
very small text
extreme visual clutter
```

The implementation does not need semantic understanding of each case.

DOM roles, tag names, class names, dimensions, element density, and relative position can provide practical deterministic signals.

## AK-00. Navigation regions

Regions dominated by:

```text
nav
role=navigation
menus
site-wide link collections
```

should receive a strong negative score.

A site header may still appear at the top edge of a capture when useful article content immediately follows it.

The objective is not to erase every trace of website chrome.

The objective is to prevent chrome from becoming the primary content of the preview.

## AL-00. Footer regions

Candidates inside a page footer should normally be rejected.

The first 4000-pixel search limit already makes accidental footer selection less likely on long pages.

On short pages, semantic `<footer>` or `contentinfo` regions should receive strong negative weight.

## AM-00. Advertisement regions

The algorithm should avoid obvious advertisement containers where they can be identified deterministically.

Useful signals may include:

```text
ad-oriented element IDs
ad-oriented class names
iframe advertising containers
common advertisement dimensions
labels such as Advertisement or Sponsored
```

The tool does not need a comprehensive ad-blocking engine.

Simple exclusion heuristics are sufficient.

## AN-00. Candidate crop construction

A promising content element will rarely have exactly the final preview dimensions.

The algorithm should therefore construct a 1200 x 630 crop around the candidate.

The crop should preserve the candidate's most useful content while remaining inside the rendered document.

For a heading-centered candidate, the crop should usually place the heading in the upper portion of the preview rather than exactly at the vertical center.

This leaves room for supporting content below it.

## AO-00. Horizontal crop positioning

The crop should prefer the horizontal content area rather than blindly centering on the full document.

If the page contains a narrow central article column, the selected 1200-pixel crop may include surrounding whitespace or adjacent useful imagery.

The crop must not extend beyond valid document coordinates.

If the document's rendered width is less than 1200 pixels, the fallback behavior defined later applies.

## AP-00. Vertical crop positioning

The algorithm should avoid placing the main heading directly against the top border.

When practical, approximately:

```text
40 to 120 CSS pixels
```

of contextual content or spacing may remain above the primary heading.

This is a preference, not a strict requirement.

A crop should move as necessary to retain more important text or imagery.

## AQ-00. Candidate scoring model

The implementation should use a small explicit scoring function rather than a chain of undocumented special cases.

Exact numeric weights may be adjusted during implementation, but the score must represent the following conceptual terms:

```text
score =
    heading value
  + readable text value
  + meaningful image value
  + text-image balance value
  + main-content semantic value
  + useful viewport-position value
  - navigation penalty
  - footer penalty
  - advertisement penalty
  - overlay penalty
  - empty-space penalty
  - tiny-content penalty
```

The scoring function should remain inspectable and reasonably small.

It must not become a generalized visual-ranking framework.

## AR-00. Deterministic tie-breaking

When multiple candidates receive effectively equal scores, selection must be deterministic.

Tie-breaking order is:

```text
candidate appearing earlier vertically
candidate closer to document horizontal center
candidate with larger readable text area
candidate discovered earlier by stable DOM traversal
```

The algorithm MUST NOT choose randomly among equal candidates.

This makes repeated captures easier to troubleshoot.

## AS-00. Preferred top-page content

Content near the beginning of a document receives a modest preference because titles, introductions, and primary imagery commonly occur there.

This preference must not be so strong that a navigation-heavy header defeats a clearly superior article region slightly farther down the page.

The search algorithm should therefore treat vertical position as one score component rather than an absolute rule.

## AT-00. Candidate validity

A high numerical score does not automatically make a candidate valid.

Before capture, the selected region must satisfy minimum visual-content requirements.

At least one of the following should normally be true:

```text
contains a meaningful heading and additional readable text
contains meaningful readable text and a substantial image
contains a substantial recognizable image plus contextual text
contains a visually substantial application or diagram region
contains a sufficiently large meaningful text block when imagery is absent
```

A region consisting almost entirely of blank space or site navigation is invalid.

## AU-00. Minimum content density

The selected crop should contain meaningful rendered content over a substantial portion of its area.

A simple approximate density test may be used.

The implementation should reject a crop when the overwhelming majority of the rectangle is visually empty and a better candidate exists.

The tool does not need pixel-level computer vision.

DOM bounding-box coverage is sufficient for this estimate.

## AV-00. Text clipping

Important headings should not be cut through horizontally or vertically at the crop boundary when this can be avoided.

The algorithm should know the bounding rectangles of high-value text elements.

If a crop boundary cuts through the primary heading, it should adjust the crop within valid bounds.

Likewise, a single line of supporting text should not be deliberately included with half of its line box outside the image when a small crop shift would avoid it.

## AW-00. Image clipping

Images may be partially cropped when that produces a better overall preview.

The algorithm does not need to preserve entire photographs.

However, a candidate should avoid useless crops that preserve only a narrow strip of an image.

When an image is the dominant recognition signal, enough of the rendered image must remain visible to be meaningful.

## AX-00. Page screenshots versus element screenshots

The preferred implementation is a page-region screenshot using an explicit clipping rectangle.

It should not rely exclusively on `element.screenshot()` because the desired crop commonly combines a heading with neighboring text or imagery beyond one DOM element.

Element screenshots may be used as intermediate measurements or for special cases, but the output contract remains a selected rectangular page region.

## AY-00. Screenshot background

The screenshot should reflect the rendered page.

The tool must not replace the page background with a synthetic branded background.

If the page has transparent regions, the browser's normal rendered background should be used.

The preview should resemble an authentic clipping of the source page.

## AZ-00. Metadata title candidate extraction

Although BRAVO owns the final sanitization contract, capture-time inspection determines candidate priority.

The raw title candidate order is:

```text
og:title
document <title>
first useful h1
first useful heading functioning as the primary title
```

The first non-empty candidate should normally be used.

However, candidates that are obviously unusable because they contain no visible or meaningful textual data after basic extraction may be skipped.

Sanitization is then performed according to ALPHA and BRAVO.

## BA-00. Metadata description candidate extraction

The raw description candidate order is:

```text
og:description
meta[name="description"]
substantial text immediately associated with the primary heading
first substantial visible paragraph in the selected main-content region
```

The tool MUST NOT generate a semantic summary.

When using visible fallback text, it should extract existing page text as-is before sanitization and truncation.

## BB-00. Metadata and capture independence

Metadata selection and screenshot-region selection are related but independent.

A page might provide excellent Open Graph metadata while its best screenshot occurs elsewhere.

Conversely, a visually strong page may provide no useful metadata.

The screenshot algorithm MUST NOT simply capture the DOM element from which title metadata was extracted.

It should independently select the best visual region.

## BC-00. Text extraction

When visible DOM text is used as a metadata fallback, extraction should use rendered human-readable text.

The implementation should avoid collecting:

```text
hidden text
script contents
style contents
ARIA implementation text not visually present
navigation lists
footer boilerplate
cookie banners
```

A short deterministic extraction helper is sufficient.

## BD-00. Metadata diagnostic logging

At DEBUG level, the tool should record the source chosen for each metadata field.

Example:

```text
Metadata title source:
  og:title

Metadata description source:
  first visible paragraph in main content
```

The log should not dump large raw values.

A bounded sanitized excerpt may be shown when necessary for debugging.

## BE-00. Capture candidate diagnostics

DEBUG logging should make candidate selection understandable.

For the leading candidates, the tool should be able to report information conceptually similar to:

```text
Candidate 1:
  source: article
  bounds: x=120 y=280 width=1080 height=740
  heading: yes
  readable text: 1840 chars
  meaningful images: 1
  score: 86

Candidate 2:
  source: section
  bounds: x=90 y=1300 width=1160 height=650
  heading: yes
  readable text: 920 chars
  meaningful images: 2
  score: 74
```

The exact numeric score is implementation-specific.

The important requirement is that a developer can understand why one region defeated another without instrumenting the algorithm manually.

## BF-00. Selected crop diagnostics

The final crop should be logged at DEBUG level.

Example:

```text
Selected preview crop:
  x: 120
  y: 240
  width: 1200
  height: 630
  source candidate: article
  score: 86
```

If the crop was adjusted to prevent clipping or stay inside document bounds, the adjustment should also be available in DEBUG output.

## BG-00. Screenshot capture

After final crop selection, Playwright captures exactly that region.

The screenshot operation should preferably produce either:

```text
JPEG directly
```

or an intermediate format that can be losslessly processed before the final JPEG conversion.

If Playwright's JPEG output satisfies the required quality and dimensions, direct JPEG output is preferred because it eliminates an unnecessary conversion step.

## BH-00. JPEG quality

The completed preview MUST use JPEG encoding at approximately:

```text
90 percent quality
```

The implementation may express this as the corresponding quality parameter accepted by Playwright or ImageMagick.

The value is intentionally high enough to retain readable text while reducing repository size relative to PNG.

The project does not require lossless preview storage.

## BI-00. JPEG color handling

The generated JPEG should use a normal browser-compatible RGB color representation.

The tool should avoid unusual color profiles or image modes that produce inconsistent browser rendering.

If ImageMagick is used, the conversion should yield an ordinary web-compatible JPEG.

Advanced color-management configuration is unnecessary.

## BJ-00. Intermediate image files

If an intermediate PNG is required, it must exist only in the temporary working area.

The completed record contains only:

```text
index.html
preview.jpg
```

The tool MUST NOT preserve both:

```text
preview.png
preview.jpg
```

The JPEG is authoritative.

## BK-00. Output validation

Before returning the preview to BRAVO, the capture pipeline must validate the resulting file.

The validation must confirm:

```text
file exists
file size is greater than zero
file is decodable as JPEG
width is exactly 1200 pixels
height is exactly 630 pixels
```

A file named `.jpg` that cannot be decoded as JPEG is invalid.

## BL-00. Minimum file sanity

An implausibly tiny output may indicate a failed or blank screenshot.

The implementation SHOULD treat an extremely small JPEG as suspicious.

A fixed hard minimum may be used as a sanity check, but it should not be the primary validity test because simple pages can compress efficiently.

Image dimensions and content-region validity remain more important.

## BM-00. Blank preview prevention

The tool must not accept a completely or nearly blank capture when a page otherwise contained detectable content.

The implementation may compare the selected candidate's DOM coverage before capture rather than performing sophisticated image analysis afterward.

If the selected region unexpectedly renders empty due to a browser or screenshot failure, generation should fail rather than produce a misleading preview.

## BN-00. Narrow pages

A document may render at less than 1200 CSS pixels of useful width.

The algorithm should first determine whether the page itself still occupies the normal 1440-pixel viewport with a narrower centered content column.

In that normal case, the final crop can still be 1200 pixels wide and include surrounding page background.

If the actual rendered document is genuinely narrower, the tool may capture the available width and minimally upscale it to 1200 pixels if the upscale remains within the approximately 10 percent tolerance defined earlier.

If significantly greater enlargement would be required, capture should use the wider browser viewport context rather than magnifying a small content element.

## BO-00. Short pages

A document may have less than 630 CSS pixels of meaningful vertical content.

The algorithm may include surrounding page background to produce the required 630-pixel crop.

It MUST NOT vertically stretch the page content simply to fill the image.

The crop should remain an authentic representation of the rendered document.

## BP-00. Very long pages

The algorithm examines only the bounded search region defined in this specification.

A 100,000-pixel page should therefore not be materially more expensive than another page once the search limit has been reached.

The tool MUST NOT generate a full-page bitmap for candidate analysis.

Candidate scoring should use DOM measurements.

## BQ-00. Infinite scrolling pages

The tool must not chase infinite content.

The 4000-pixel search boundary remains authoritative even when scrolling causes additional document content to load below it.

The first useful representative region is sufficient.

The project is a link archive, not a content mirroring system.

## BR-00. Single-page applications

A client-rendered application may initially contain very little content at `DOMContentLoaded`.

The bounded stabilization period allows such pages time to render.

If meaningful content appears within the readiness budget, normal candidate analysis proceeds.

If the page remains effectively empty after the budget expires, capture fails with a readiness or candidate-selection error.

The tool MUST NOT wait indefinitely for application-specific state.

## BS-00. Documentation pages

Documentation pages often contain:

```text
navigation sidebar
main heading
body text
code blocks
```

The algorithm should penalize the navigation sidebar and favor the main documentation area.

A good preview may contain the page heading, several lines of explanatory text, and part of a code block.

There is no requirement that a preview contain an image.

## BT-00. Article pages

For a typical article containing:

```text
site header
headline
subtitle
hero image
opening paragraphs
```

the preferred region usually contains the headline and at least one of:

```text
subtitle
hero image
opening text
```

The site header may appear partially if naturally adjacent, but it should not consume most of the preview.

## BU-00. Product pages

For a typical product page, useful signals may include:

```text
product name
large product image
short descriptive text
```

Price may naturally appear if it is part of the selected region, but the algorithm does not need a special price extractor.

The system should avoid selecting only recommendation carousels or site navigation when stronger product-detail content exists.

## BV-00. Application interfaces

Some links represent web applications rather than articles.

Such pages may lack conventional headings and paragraphs.

A large structured interface region can still be a valid preview when it contains substantial visible UI and is not merely a login screen or blank shell.

The candidate algorithm should therefore allow visually substantial non-article regions to compete even when semantic text signals are weaker.

## BW-00. Image-centric pages

An image-centric page may provide little text.

If one large meaningful image dominates the visible page and represents the destination well, a candidate centered on that image is valid.

The algorithm should include nearby title or caption text when available.

It should not reject the page merely because it lacks article-style text.

## BX-00. Pages dominated by login UI

If the target resolves to a page whose useful visible content is primarily:

```text
sign in
register
enter password
authentication challenge
```

and the requested destination content is unavailable, generation must fail.

The error should indicate that the page rendered successfully but the actual content appears inaccessible without authentication.

The system should not create a misleading login-page preview.

## BY-00. CAPTCHA and anti-bot challenge

If Playwright reaches a clear CAPTCHA or anti-bot challenge, the workflow must fail.

The tool must not attempt to solve or circumvent the challenge.

The error should distinguish this from a network failure.

Example:

```text
Unable to generate preview.

Stage:
  page readiness

Reason:
  The target rendered an access challenge instead of the requested content.

Target:
  https://example.com/article
```

## BZ-00. Error pages

The tool should reject obvious error documents such as:

```text
404 Not Found
500 Internal Server Error
Service Unavailable
Access Denied
```

when they represent failure to obtain the intended destination.

Detection may use HTTP status together with obvious visible page signals.

The implementation does not need a broad multilingual error-page classifier.

## CA-00. Screenshot failure

If Playwright fails to capture the selected rectangle, the preview operation fails.

The error must include:

```text
target URL
capture stage
selected rectangle
Playwright error message
```

when those values exist.

The capture workflow may perform one immediate retry if the page and browser remain valid and the failure appears transient.

More than one automatic screenshot retry is unnecessary.

## CB-00. JPEG conversion failure

If external conversion is required and conversion fails, the preview operation fails.

Diagnostics should include:

```text
input temporary path
output temporary path
converter executable
exit status
bounded stderr
```

The command must not retain an unconverted PNG as the final preview.

## CC-00. Candidate discovery failure

If no valid region can be found after bounded analysis, capture must fail.

The system MUST NOT silently substitute a blank or generic project image.

A useful error is conceptually:

```text
Unable to generate preview.

Target:
  https://example.com/page

Stage:
  preview selection

Reason:
  No page region satisfied the minimum content requirements.

Analysis:
  14 candidate regions inspected.
  0 candidates passed final validity checks.
```

Detailed candidate information belongs in DEBUG logs.

## CD-00. Metadata failure versus capture failure

Missing metadata does not necessarily prevent capture.

Missing capture content does.

Therefore:

```text
no usable title -> use (no title)
no usable description -> use (no description)
no usable preview region -> fail
```

This distinction must remain explicit.

Every successful record requires a real preview image.

## CE-00. Deterministic fallback candidate

If semantic candidate discovery produces no valid candidate, the algorithm may use one final deterministic fallback.

The fallback examines the top portion of the rendered page after overlay handling.

It attempts to locate the densest meaningful content region within the first:

```text
1600 vertical CSS pixels
```

using visible text and image bounding boxes.

If a valid 1200 x 630 crop can be constructed there, it may be used.

If this fallback also fails, preview generation fails.

The system must not add additional arbitrary fallback chains.

## CF-00. Fallback diagnostics

When the fallback algorithm is used, this should be visible in normal diagnostic output at WARN or DEBUG level.

Example:

```text
Preview selection fallback:
  No semantic content candidate passed validation.
  Using densest-content search within the first 1600 CSS pixels.
```

Successful fallback is not a fatal error.

## CG-00. Cropping around fallback content

The fallback crop should be centered around the densest useful content while respecting document bounds.

It should apply the same:

```text
heading preservation
text clipping avoidance
image usefulness
empty-space checks
```

as ordinary candidate crops.

Fallback changes discovery, not quality standards.

## CH-00. Capture stability verification

Immediately before screenshot capture, the tool SHOULD verify that the selected candidate has not moved materially since analysis.

If the candidate rectangle changes substantially, the algorithm may recalculate the crop once.

It MUST NOT enter an indefinite re-analysis loop.

One bounded re-analysis is sufficient.

## CI-00. DOM mutation after analysis

Dynamic sites may alter or remove content after candidate selection.

If the selected content disappears before capture, the tool should attempt one bounded candidate re-analysis.

If no valid replacement exists, capture fails.

This behavior should be visible in DEBUG logs.

## CJ-00. Sticky elements during scroll

Sticky headers and sidebars can change location while the tool scrolls.

Candidate analysis should use the element's rendered rectangle at the relevant scroll position.

A sticky header that overlaps the final selected crop should be treated as an overlay or negative-content element according to its size and role.

The implementation should not assume static document coordinates for sticky elements.

## CK-00. Fixed viewport overlays

A fixed overlay may appear at every scroll position.

If it occupies a significant portion of the 1200 x 630 crop and is not meaningful destination content, it should be dismissed or hidden before final capture when safely possible.

The selected crop should then be remeasured if layout changed.

## CL-00. Scrollbar handling

Browser scrollbars should not become a meaningful part of the preview.

The implementation SHOULD configure or style the capture environment so that the screenshot does not contain visually distracting scrollbars when Playwright permits this reliably.

This must not require modifying the target site's layout substantially.

## CM-00. Browser prompts

Native browser prompts and permission requests must not block capture.

The Playwright context should default to denying or not granting optional browser permissions.

Unexpected dialogs should be dismissed where safe.

The tool MUST NOT interact with dialogs that would perform destructive or unrelated actions.

## CN-00. New windows and popups

The capture workflow operates on the original target page.

Unexpected popup windows should not replace the capture target.

The tool may close unsolicited popup pages.

If navigation intentionally transforms the original page into a different final URL, normal redirect handling applies.

## CO-00. Download responses

If navigation results in a file download instead of a renderable web page, preview generation fails.

The project does not attempt to render downloaded PDFs, archives, executables, or other non-HTML resources through a separate preview system.

This specification concerns rendered web pages.

Support for other resource types is out of scope.

## CP-00. PDF browser viewers

If a URL renders through the browser's built-in PDF viewer rather than a normal document, behavior may differ between Playwright environments.

PDF-specific capture is not required.

The tool should fail clearly if no normal DOM content suitable for the defined candidate algorithm is available.

The project should not add a PDF rendering subsystem merely for this case.

## CQ-00. Cross-origin content

Cross-origin iframes may appear within target pages.

The screenshot can naturally include their rendered pixels.

The algorithm does not need to introspect inaccessible cross-origin DOM content.

Candidate scoring should primarily rely on accessible parent-document layout.

A large visible iframe may contribute as a rendered region when its bounds are meaningful, but the tool must not depend on reading its internal DOM.

## CR-00. Canvas content

Canvas-based interfaces may contain important visual information that is not represented as DOM text.

A sufficiently large visible canvas may contribute as a meaningful visual region.

The algorithm does not need to inspect canvas pixels semantically.

Its rendered size, position, surrounding text, and surrounding structure are sufficient signals.

## CS-00. SVG content

Rendered SVG may be considered meaningful imagery when its displayed dimensions are substantial.

Small icon SVG elements should not meaningfully improve candidate scores.

The algorithm may treat large SVG regions similarly to images for scoring purposes.

## CT-00. Code blocks

Large readable code blocks can be useful recognition signals for documentation or technical articles.

A visible `pre` or code-containing region may contribute positively when:

```text
font size is readable
area is substantial
it appears near meaningful surrounding text
```

A candidate consisting only of a tiny code fragment should not defeat a stronger content region.

## CU-00. Tables

A substantial visible table may contribute to candidate quality.

The tool does not need to interpret table semantics.

If a table is too dense to remain readable at natural scale, it should not receive excessive positive weight merely because it contains many characters.

Visual area and readable font size remain important.

## CV-00. Candidate count limit

Candidate analysis must remain bounded.

The tool SHOULD evaluate no more than approximately:

```text
100 candidate regions
```

during normal processing.

If the DOM produces many thousands of possible containers, lower-value candidates should be filtered before scoring.

The exact internal filtering strategy is implementation detail.

The algorithm must not perform expensive scoring over every DOM node.

## CW-00. DOM inspection limit

The implementation should avoid repeatedly traversing the complete document tree.

A single structured traversal plus bounded candidate refinement is preferred.

The capture algorithm should remain practical on complex pages with large DOMs.

Performance should be observable through debug timing logs.

## CX-00. Timing diagnostics

DEBUG logging should include major capture durations.

Conceptually:

```text
Navigation:            1.8s
Stabilization:         2.4s
Candidate discovery:   0.2s
Candidate scoring:     0.1s
Screenshot:            0.3s
JPEG processing:       0.1s
Total capture:         4.9s
```

Exact formatting is implementation-specific.

The purpose is to identify unexpectedly slow stages without adding manual instrumentation.

## CY-00. Normal console output

Normal non-debug output should not print every candidate score.

A concise successful flow may report:

```text
Opening target...
Page ready.
Selecting preview...
Preview captured.
```

BRAVO controls the overall command presentation.

CHARLIE supplies meaningful stage and diagnostic information.

## CZ-00. Error logging

Every capture-ending error must identify a stable stage.

Relevant capture stages include:

```text
browser launch
page navigation
page readiness
overlay handling
metadata extraction
preview candidate discovery
preview selection
preview capture
JPEG conversion
preview validation
```

The error should also identify the target URL.

When a rectangle had already been selected, capture-related failures should include that rectangle in DEBUG diagnostics.

## DA-00. Screenshot debug artifact

The normal workflow MUST NOT leave diagnostic screenshots in the repository.

A development-only debug mode MAY save additional temporary images showing:

```text
candidate regions
selected crop
full viewport
```

These artifacts must remain outside the final `lnk/<id>/` record.

Debug artifacts are not part of the repository format and must not be generated during normal operation.

## DB-00. Reproducibility

Given the same rendered target content, browser version, viewport, and DOM layout, repeated capture attempts should normally select the same region.

The following sources of intentional variation should be minimized:

```text
random candidate ordering
animation timing
changing viewport size
unbounded asynchronous waiting
different browser engines
arbitrary scrolling
```

Perfect byte-for-byte image reproducibility across browser versions is not required.

Deterministic selection behavior is required.

## DC-00. Capture algorithm summary

The complete capture algorithm is conceptually:

```text
open target in Chromium
wait for DOM readiness
enter bounded stabilization period
wait for fonts where practical
allow relevant initial images to load
disable animations and transitions
pause media
dismiss or hide safe non-content overlays
inspect bounded upper page region
discover candidate content regions
score candidates
construct 1200 x 630 crops
validate crops
select highest-scoring valid crop
if none exists:
    run one densest-content fallback
if still none exists:
    fail
verify selected content has not moved materially
capture selected rectangle
encode as JPEG at about 90 percent quality
validate JPEG and exact dimensions
return preview artifact
```

Implementation code may be structured differently, but observable behavior must remain consistent with this sequence.

## DD-00. User scenario: article

The user adds an article.

The rendered page contains a site navigation header, a large article heading, an opening paragraph, and a hero image.

The capture algorithm penalizes the navigation area.

It identifies the article container and heading.

It constructs a 1200 x 630 region containing the heading, part of the opening paragraph, and part or all of the hero image.

The text remains near its normal rendered scale.

The resulting image is encoded as `preview.jpg`.

When the link is later shown in the journal or a social preview, the user can recognize the article from the heading and imagery.

## DE-00. User scenario: documentation

The target is a technical documentation page.

The page has a narrow left navigation sidebar and a wide content column containing:

```text
API Reference
```

followed by explanatory text and code.

The algorithm gives the navigation area a negative score and favors the main content region.

The resulting preview contains the documentation heading and readable technical content rather than a miniature image of the entire documentation site.

## DF-00. User scenario: emoji-heavy title

The target renders correctly and exposes:

```text
ðŸš€ New Runtime â€” æ—¥æœ¬èªž & Ð ÑƒÑÑÐºÐ¸Ð¹ ðŸ”¥
```

as `og:title`.

CHARLIE chooses `og:title` as the raw title source.

BRAVO sanitizes it to:

```text
New Runtime æ—¥æœ¬èªž Ð ÑƒÑÑÐºÐ¸Ð¹
```

The screenshot itself remains an authentic page capture and is not modified to remove emoji that happen to be visibly rendered inside the webpage.

The sanitization contract applies to generated textual metadata, not to pixels inside the screenshot.

## DG-00. User scenario: consent banner

The target initially shows a large cookie banner covering the lower half of the viewport.

The banner is identified as an overlay.

A clear reject or dismiss control is available.

The capture workflow dismisses the banner without granting optional permissions.

The underlying article becomes visible.

Candidate analysis proceeds on the unobstructed document.

## DH-00. User scenario: login wall

The target resolves to a login form and does not expose the intended content.

The algorithm determines that the visible page is dominated by authentication UI.

No valid content candidate representing the destination is available.

Capture fails.

No `preview.jpg` becomes part of a committed link record.

The error states that the page loaded but the requested content appears inaccessible without authentication.

## DI-00. User scenario: long article

The target is a very long article.

The document height is more than 50,000 pixels.

The tool does not capture the full page.

It examines only the bounded initial search region.

A strong heading-and-image candidate appears at approximately `y=650`.

The tool selects that region and completes capture without processing the remaining tens of thousands of pixels.

## DJ-00. User scenario: sparse homepage

The target has little semantic markup but presents a substantial visual interface in the upper page.

No `article` or `main` candidate passes the strong semantic search.

The fallback densest-content search finds a region containing a large application panel and readable text.

That region passes final validity checks and becomes the preview.

The fallback use is recorded in diagnostics.

## DK-00. User scenario: unusable page

The page renders only a blank shell with a small loading spinner.

After the stabilization budget, the spinner remains and no meaningful text, image, application interface, or content region exists.

Semantic candidate discovery fails.

The fallback also fails.

The operation ends with:

```text
Stage:
  preview selection

Reason:
  No page region satisfied the minimum content requirements.
```

No synthetic placeholder image is created.

## DL-00. User scenario: dynamic layout shift

The tool selects a candidate.

Before capture, a late-loading image shifts the article downward by 300 pixels.

The pre-capture stability verification detects significant movement.

The algorithm performs one bounded re-analysis.

It selects the article at its new position and captures it.

If the layout continues changing after that bounded retry, the operation fails rather than looping indefinitely.

## DM-00. Security and input boundaries

Remote page content is untrusted.

The capture workflow must not construct shell commands from remote metadata.

The capture workflow must not use remote page strings as filesystem paths.

The capture workflow must not execute scripts extracted from the page outside the browser context.

The browser itself naturally executes the target page's JavaScript as part of rendering.

That execution occurs inside the Playwright browser context.

The local Node.js process must maintain the boundary between rendered remote content and local command execution.

## DN-00. Browser isolation

A fresh browser context SHOULD be created for each add-link operation.

The context should not inherit ordinary personal browser cookies or saved sessions.

The workflow MUST NOT read the user's default browser profile.

The capture should represent what a clean unauthenticated visitor can normally access.

This also improves reproducibility.

## DO-00. Browser storage

Browser storage created during capture is temporary.

The tool does not need to persist:

```text
cookies
localStorage
sessionStorage
IndexedDB
service-worker state
```

between separate add-link operations.

Each capture should begin from a clean context unless implementation constraints explicitly require otherwise.

## DP-00. Network interception

A general-purpose ad blocker or request-filtering proxy is not required.

The tool may use narrow Playwright request handling if necessary to prevent clearly irrelevant or harmful resource classes from disrupting capture, but this should remain minimal.

The default behavior should be to render the page normally.

Over-aggressive resource blocking can alter layout and create inaccurate previews.

## DQ-00. Remote page integrity

The goal is to capture the target as it normally appears, with only limited modifications necessary for determinism and visibility.

Permitted local modifications include:

```text
disabling animation
pausing media
dismissing nonessential overlays
hiding clearly obstructive non-content overlays
temporary scroll positioning
```

The tool should not:

```text
rewrite article text
remove arbitrary page sections
rearrange content
change font sizes
replace images
inject project branding
```

The preview should remain recognizable as the original page.

## DR-00. Performance constraints

The capture implementation must not solve visual selection through brute-force screenshot generation.

It should not capture dozens of full-size images merely to compare them.

DOM analysis should narrow the candidate set before screenshot generation.

Under normal conditions, one final preview screenshot should be sufficient.

A small number of debug or retry captures may occur only when explicitly justified.

## DS-00. Memory constraints

The workflow must avoid full-page screenshots of extremely long documents.

It must avoid retaining multiple large screenshot buffers unnecessarily.

Temporary image buffers should be released after conversion or validation.

This keeps the local tooling suitable for ordinary developer machines without introducing streaming-image infrastructure.

## DT-00. Implementation simplicity

The capture algorithm may be sophisticated enough to select useful content, but its implementation should remain inspectable.

It should consist of understandable stages such as:

```text
readiness
cleanup
candidate discovery
candidate measurement
scoring
crop construction
capture
validation
```

The implementation MUST NOT introduce:

```text
computer-vision frameworks
machine-learning dependencies
general browser-crawling frameworks
image-search indexes
remote screenshot services
```

Playwright, ordinary browser APIs, Node.js, and the selected JPEG tooling are sufficient.

## DU-00. Acceptance conditions

CHARLIE is satisfied when all of the following are true.

The target is rendered using Playwright Chromium.

The browser uses a fixed 1440 x 1000 desktop viewport at device scale factor 1.

Page zoom remains 100 percent.

Navigation and all readiness waits are bounded.

The process does not require permanent network idle.

Animations and transitions are disabled before final capture where practical.

Media playback is paused.

Nonessential obstructive overlays may be safely dismissed or hidden.

Authentication barriers, CAPTCHA challenges, and access-control mechanisms are not bypassed.

Candidate analysis is limited to a bounded upper portion of the page.

Candidate analysis relies on deterministic DOM and layout signals rather than AI.

Headings, readable text, meaningful images, and main-content semantics contribute positively.

Navigation, footer content, advertisements, overlays, empty space, and tiny content contribute negatively.

Candidate analysis is bounded in candidate count and DOM work.

Tie-breaking is deterministic.

The preferred crop is an actual 1200 x 630 CSS-pixel page region captured near 1:1 scale.

Large full-page screenshots are not scaled down to create previews.

The final image is exactly 1200 x 630 pixels.

The final image is a real JPEG.

JPEG quality is approximately 90 percent.

No PNG remains in the completed record.

The screenshot represents actual rendered target content.

Missing title or description does not cause capture failure.

Missing usable visual content does cause capture failure.

A single deterministic densest-content fallback is available when normal semantic candidate selection fails.

The tool does not generate placeholder cards when no useful page region exists.

Major capture stages and timing are diagnosable through console logs.

DEBUG output can explain candidate selection and the final crop without requiring additional instrumentation.

The capture workflow remains bounded in time and memory for extremely long or complex pages.

The completed preview can be passed to BRAVO as a validated `preview.jpg`.

## DV-00. Next specification

The next specification is:

```text
2026-08-16.DELTA.A-00
Journal Data Loading, Pagination, and Cache
```

It will define how the static journal reads `links.txt`, resolves individual link records, parses their generated HTML metadata, maintains newest-first ordering, groups entries into journal pages or spreads, limits network requests, prefetches nearby entries, stores browser-side cached records, applies the one-hour cache lifetime, detects manifest changes, handles removed or malformed records, recovers from network failures, and exposes sufficient diagnostics for troubleshooting the journal's data-loading behavior.



## File content `.specs\suggestions001-004.md`:

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



## File content `.specs\suggestions001-005.md`:

2026-08-16

# 2026-08-16.ECHO.A-01

## A-00. Journal Presentation and Interaction

This specification defines how the saved-link archive is presented and manipulated as a physical journal. It covers the visual composition, journal materials, link-entry layout, desktop and mobile presentation, pagination, page turning, scrolling, panning, zooming, loading and failure states, accessibility, performance, and the visual-verification process required during implementation.

The feature exists to make a collection of saved links pleasant and immediately recognizable. The journal metaphor is not decoration added around a conventional bookmark grid. It is the primary interface. The user should feel that they are looking through a physical book of web clippings, while still receiving the practical advantages of a responsive web application.

The implementation audience is Codex, but the specification is intentionally written as human-readable technical prose. Wherever visual interpretation could lead to materially different implementations, this document states the expected behavior explicitly.

The supplied mobile and desktop mockup images are part of the design context and MUST be inspected during implementation. They establish the intended visual language, proportions, density, and atmosphere. They are sketches, not pixel-perfect contracts. Image-generation artifacts visible in them MUST NOT be copied merely because they appear in a reference.

The final implementation must be more usable and more internally consistent than the sketches.

## B-01. Design intent and interpretation of the reference images

The reference images establish a coherent visual hierarchy.

At the outermost level is a dark environment. Inside it sits a dark brown leather journal. Inside the leather are warm cream pages. Inside the pages are colorful website previews and dark readable typography.

The hierarchy can be summarized as:

```text
dark wooden environment
    -> dark brown leather journal
        -> warm cream paper
            -> colorful saved-page previews
            -> dark textual metadata
```

This nesting is fundamental to the design. The surroundings create depth, the leather establishes the physical object, the paper creates a quiet reading surface, and the screenshots provide the visual memory of the saved links.

A representative desktop reference demonstrates the intended composition particularly well. The journal is centered in a landscape viewport and viewed almost directly from above. Two identically sized portrait pages form one coherent open spread. A narrow shaded gutter marks the binding without consuming much space. Each page contains six records arranged as two columns by three rows. The screenshot is visually dominant within each record; the title follows immediately underneath, then the source hostname and date. Page margins, card gaps, and typography are regular enough to feel typeset, but the paper and leather prevent the result from feeling like a modern dashboard.

The mobile references show the same object from a closer camera position. The application does not become a different card-list design. One journal page occupies most of the viewport, while leather remains visible around the paper and a dark surrounding environment remains visible near the edges. The six-entry, two-column page composition remains recognizable.

The references also contain elements that MUST NOT be implemented. The generated mockups include large explanatory plaques below the journal and artificial mobile status bars. Those are annotations used to explain the mockups, not application UI. Some sketches also contain unnatural curled paper and geometrically impossible stacks of turning pages. Those are generation defects, not desired behavior.

The final implementation therefore adopts the references selectively:

| Reference characteristic                    | Final implementation                 |
| ------------------------------------------- | ------------------------------------ |
| Dark brown leather journal                  | Keep                                 |
| Warm cream, mildly aged paper               | Keep                                 |
| Two-column, three-row page                  | Keep                                 |
| Screenshot, title, host, date               | Keep                                 |
| Dark wooden environment                     | Keep, mainly visible when zoomed out |
| Sparse pen or similar desk prop             | Allowed                              |
| Small interaction hint in unused desk space | Add                                  |
| Large annotation plaque below journal       | Remove                               |
| Simulated phone time, Wi-Fi, battery        | Remove                               |
| Large permanent curled corners              | Remove                               |
| Multiple floating/folding sheets            | Remove                               |
| Excessive environment at default zoom       | Reduce                               |
| Content-first closer framing                | Strengthen                           |

The interaction hint is an explicit exception to the general rule against application chrome. It is a single small instructional element intended to make the image-like navigation model discoverable. It must remain visually subordinate to the journal and must not become a toolbar, legend, or permanent panel.

The mockups are therefore an art-direction reference. The implementation must preserve their character while prioritizing actual link content.

## C-00. Journal composition and content hierarchy

The journal opens directly to saved links. There is no mandatory closed-cover screen, welcome page, or blank introductory leaf.

On a desktop viewport wide enough to show two readable pages, the initial state is the first open spread:

```text
left:  Page 1
right: Page 2
```

This exposes the twelve newest links immediately.

On a constrained or mobile viewport, the initial state is a single Page 1 containing the six newest links.

DELTA defines six entries per logical page, and this number remains fixed in the presentation layer. A full page uses a 2 x 3 grid:

```text
+----------------------+----------------------+
| Entry 1              | Entry 2              |
|                      |                      |
+----------------------+----------------------+
| Entry 3              | Entry 4              |
|                      |                      |
+----------------------+----------------------+
| Entry 5              | Entry 6              |
|                      |                      |
+----------------------+----------------------+
```

Desktop shows two such pages side by side. Mobile shows one.

The page itself is a portrait sheet with a consistent aspect ratio. Exact dimensions are implementation constants rather than hard-coded scattered values, but both desktop pages MUST use identical geometry. Page padding, grid gaps, preview dimensions, title blocks, and metadata baselines should likewise come from a small centralized set of design constants.

Each page may contain a restrained header consisting of:

```text
LINK JOURNAL
Page N
```

with a quiet rule or small ornament. The header is structural rather than promotional. It should consume only the space needed to orient the reader.

The record itself has a strict information hierarchy:

```text
preview screenshot
title
source hostname
date added
```

The description stored in the record is not shown in the normal journal grid. It would compete with the preview and reduce visual density. The journal should favor visual recognition over displaying every available metadata field.

The screenshot is the dominant element and should occupy approximately the upper half of the record. It preserves the 1200 x 630 preview aspect ratio generated by CHARLIE and MUST NOT be stretched. Small clipping is acceptable only when needed to maintain consistent card geometry.

The title uses a readable editorial serif and normally supports two or three lines. Cards use a fixed title area so that one long title cannot push lower rows out of alignment. Longer titles are visually clamped; their stored metadata is unchanged.

The hostname and date are quieter supporting information. A small globe-like source icon is acceptable, but it must remain subordinate to the text.

For example:

```text
+--------------------------------+
|                                |
|      generated preview         |
|                                |
+--------------------------------+
  Building Better Static Tools
  â—‰ example.com
  Added May 16, 2026
```

The complete visible record acts as the link target. The user should not have to click a tiny title. No `Open`, `Share`, `More`, `Delete`, or equivalent action buttons belong on normal records.

The final page may contain fewer than six records. Existing records keep their normal grid geometry and occupy the earliest available slots. Empty positions remain paper. The remaining records do not expand to fill the empty area.

## D-01. Physical materials, surrounding environment, and interaction hint

The journal should read visually as one physical object rather than several CSS rectangles.

The cover is deep brown leather with visible but restrained grain, rounded outside corners, stitched or embossed perimeter detail, and slightly brighter raised edges. It should look used and well maintained, not glossy, plastic, heavily scratched, or theatrically antique.

The cover requires visible thickness. A small outer offset, directional shadow, inner edge highlight, and darker leather-to-paper boundary are enough. The implementation should prefer CSS gradients, shadows, and small reusable textures over a large prerendered book image.

The paper is warm cream rather than white. Mild aging may appear through subtle paper grain, slightly darker outer edges, and small tonal variation. The center reading area must remain clean. Aging is a material cue and must never reduce text contrast.

The desktop spread has a visible central gutter. Its purpose is to communicate binding and depth, not to divide the UI into two unrelated panels. The page surfaces should curve inward only slightly toward the gutter, with a narrow shadow suggesting depth. Both pages remain visually part of the same book.

Several physical pages may be suggested underneath the active page through one or two small offset edges. Do not simulate a large stack of individually visible sheets.

The screenshot previews receive their own light aging treatment. This is deliberately different from recoloring the whole image. The center of every preview should retain the original screenshot color and clarity. Only the perimeter may receive a subtle worn-paper effect such as slight irregularity, minor fading, or very light warm discoloration.

The desired result is approximately:

```text
clean screenshot center
        |
        |
small 2-8 px visual transition near boundary
        |
faint physical wear
```

The preview must NOT be sepia-toned, heavily scratched, blurred, torn, burned, stained, or obscured.

At the default camera position the journal content dominates the viewport. The surrounding environment is intentionally understated. The application should show enough leather and darkness around the pages to preserve the physical metaphor, but it should not waste substantial viewport area displaying a decorative desk.

Zooming out reveals the richer environment. The journal sits on a dark wooden desk, preferably dark walnut or a similarly warm low-contrast material. The wood grain is visible but quiet. One restrained prop such as a dark pen may appear near an outside edge. Props MUST NOT overlap content and MUST NOT become controls.

This distinction between camera positions is important:

```text
100% default zoom
-> pages and link content dominate

zoomed out
-> entire leather journal becomes visible
-> more cast shadow becomes visible
-> surrounding wooden desk becomes visible
-> sparse desk prop may become visible
```

The environment therefore rewards exploration without imposing itself on normal reading.

One small interaction hint MUST appear in otherwise unused environment space near the top of the scene when sufficient surrounding desk space exists. Its purpose is to explain the non-obvious desktop camera interaction.

The preferred text is:

```text
Ctrl + wheel to zoom
```

The wording may be adapted on macOS to communicate the corresponding Command modifier if the implementation reliably detects that environment, but the normal documented interaction remains Ctrl + mouse wheel.

The hint must be visually small, quiet, and secondary. It should resemble a restrained annotation printed or engraved into the surrounding scene rather than a toolbar notification. It must not overlap the journal, page contents, navigation regions, or desk props.

The hint does not need to describe every interaction. It exists specifically to reveal zoom behavior. Regular wheel scrolling and click-drag panning should remain natural enough not to require persistent explanatory text.

If the viewport is too small to provide genuine unused desk space without competing with content, the hint may be omitted. Content visibility takes precedence.

No bottom caption, large annotation plaque, toolbar, fake phone status bar, decorative product header, footer, sidebar, or other application chrome is added around the book.

## E-00. Page navigation and physical page turning

Chronology runs from newest to oldest as the reader moves deeper into the journal.

Desktop navigation moves by spread:

| Current desktop spread | Next      | Previous  |
| ---------------------- | --------- | --------- |
| Pages 1-2              | Pages 3-4 | none      |
| Pages 3-4              | Pages 5-6 | Pages 1-2 |
| Pages 5-6              | Pages 7-8 | Pages 3-4 |

Mobile navigation moves one logical page at a time:

```text
1 -> 2 -> 3 -> 4 -> ...
```

Moving toward larger page numbers means moving toward older links.

Page turning must communicate this spatial relationship rather than acting as decorative animation.

The final animation must be substantially simpler than the distorted page bends visible in some mockups.

On desktop, a forward page turn behaves conceptually as follows:

```text
1. Current spread is resting flat.

2. The right-hand sheet begins rotating around the center binding.

3. The sheet remains mostly planar.
   A small perspective deformation or modest outer-corner curl is allowed.

4. A soft moving shadow separates the sheet from the page beneath it.

5. The back of the turning sheet is briefly visible.

6. The next spread is revealed.

7. The turning sheet settles into the new resting geometry.
```

The resting left page does not fold. Pages beneath the turning sheet remain fixed. The turning sheet stays attached to the binding throughout the transition.

Backward navigation mirrors this behavior from the opposite direction.

The animation MUST NOT produce:

```text
two pages curling together
multiple floating sheets
detached triangular paper shapes
large permanent outer-edge curls
paper intersecting the leather
different parts of the same sheet moving independently
```

A normal page turn should take approximately 350-550 ms. The final value should be tuned visually. The transition should feel like a page but remain fast enough for repeated browsing.

CSS perspective, transforms, transform origin, opacity, and shadows are the preferred implementation tools. A full paper-physics simulation, WebGL scene, canvas rendering engine, or page-flip framework is not justified unless straightforward browser primitives prove insufficient.

While a page transition is active, another transition MUST NOT corrupt pagination state. The simplest acceptable behavior is to ignore additional page-turn commands until the current transition completes.

Navigation can be initiated by keyboard, a restrained page-edge affordance, or an intentional horizontal touch gesture. Large permanent navigation buttons are unnecessary. Page-edge interaction areas must live outside link-card click targets.

The user should never accidentally open a link when trying to turn the page, and should never turn a page when activating a record.

When `prefers-reduced-motion: reduce` is active, the page turn becomes a brief crossfade or immediate state replacement.

## F-01. Camera model: scrolling, panning, and zooming

The journal is treated as a large physical scene viewed through a camera. This interaction model allows the application to preserve readable content instead of solving every viewport constraint by shrinking the journal.

Three interactions have distinct responsibilities:

| Input                                   | Behavior                      |
| --------------------------------------- | ----------------------------- |
| Mouse wheel                             | Scroll vertically             |
| Ctrl + mouse wheel                      | Zoom journal camera in or out |
| Hold left mouse button and drag         | Pan journal camera            |
| Trackpad vertical scroll                | Scroll vertically             |
| Trackpad pinch / supported zoom gesture | Zoom                          |
| Mobile vertical drag                    | Scroll vertically             |
| Mobile pinch                            | Zoom                          |
| Mobile deliberate horizontal swipe      | Turn journal page             |

These responsibilities MUST remain separate. A normal mouse-wheel action does not turn pages and does not zoom. Ctrl + wheel is the explicit desktop zoom gesture.

### Default camera scale

The default application camera scale is:

```text
100%
```

This is an application-level journal scale, not the browser's own page zoom.

At 100%, the camera is intentionally content-focused. On desktop, both pages should normally be readable without immediate user adjustment. On mobile, one page should occupy most of the available width even when its complete height extends beyond the viewport.

The initial implementation should support approximately:

```text
minimum zoom: 70%
default zoom: 100%
maximum zoom: 140%
```

These bounds may be tuned during visual testing if they fail the acceptance scenarios, but zoom MUST remain bounded.

### Minimum readable scene size

The application must define a minimum readable journal size rather than continuously shrinking the journal to fit every possible viewport.

The exact pixel threshold is a visual implementation constant and MUST be established through testing at the supported typography and page geometry. It should represent the smallest rendered journal size at which preview content, entry titles, hostnames, and dates remain practically readable.

When fitting the complete journal or spread into the viewport would require scaling below this minimum readable size, the application MUST stop shrinking the journal.

Instead, overflow becomes scrollable.

Conceptually:

```text
requested fit scale >= minimum readable scale
-> journal may fit viewport

requested fit scale < minimum readable scale
-> clamp at minimum readable scale
-> allow viewport overflow
-> user reaches hidden content through scrolling and panning
```

This rule is central to the content-first design.

The application must never solve an undersized window by reducing the journal until its content becomes decorative and unreadable.

### Mouse-wheel scrolling

A regular mouse-wheel action scrolls vertically through the current scene.

For example, when the lower row of a page extends below the viewport:

```text
wheel down
-> viewport moves downward
-> lower journal content becomes visible
```

The same input MUST NOT:

```text
change page
change spread
change zoom
```

When the complete scene fits vertically, normal wheel input may have no visible effect because there is nothing to scroll.

Trackpad vertical scrolling follows the same rule.

### Ctrl + mouse-wheel zoom

Holding Ctrl while using the mouse wheel changes application zoom.

Conceptually:

```text
Ctrl + wheel up
-> zoom in

Ctrl + wheel down
-> zoom out
```

The implementation MUST prevent the same gesture from simultaneously performing ordinary scene scrolling.

Where browser behavior makes Ctrl + wheel normally trigger browser-level page zoom, the application should intercept the gesture only when it can do so reliably and without degrading accessibility. The intent is that the journal itself zooms rather than the entire browser interface.

On macOS, an equivalent Command-modified behavior may be supported where appropriate, but the implementation must remain consistent and discoverable.

Zooming out reveals more environment. Zooming in supports close inspection of previews and text.

The current focal region should remain approximately stable while zooming. If the pointer is over the journal, zoom should preferably occur around that pointer position. At minimum, changing zoom must not continually snap the scene back to its initial center.

### Desktop panning

Desktop pan uses primary-button drag:

```text
pointer down on movable area
        |
movement stays below threshold
        |
release
-> normal click behavior if target is interactive

pointer down
        |
movement exceeds threshold
        |
enter pan mode
        |
journal follows pointer
        |
release
-> retain new pan position
```

A threshold around 5-8 CSS pixels is sufficient to distinguish a click from a drag.

Panning should work when drag begins over desk space, non-interactive leather, paper margins, or another non-actionable portion of the scene.

If the pointer begins over a link entry and movement exceeds the threshold, the gesture becomes a pan and MUST suppress the link activation.

If movement remains below the threshold and the pointer is released over the entry, the entry opens normally.

Native image dragging must be disabled so preview images do not create browser ghost images while the user pans.

The cursor should communicate the interaction where appropriate:

```text
movable non-interactive area -> grab
active pan -> grabbing
link card -> pointer
```

### Pan boundaries

Pan position is bounded.

The user may move the scene enough to inspect content that extends outside the viewport and may expose additional desk around the journal, but the journal must not be draggable completely out of recoverable view.

Bounds must be recalculated when:

```text
viewport size changes
zoom changes
single-page/spread mode changes
```

### Mobile scrolling, panning, and zooming

The same capabilities must remain usable on mobile, but touch conventions take precedence.

Single-finger vertical movement scrolls the journal view.

Pinch changes the application zoom.

A deliberate horizontal swipe changes the logical journal page.

The implementation must distinguish horizontal page navigation from vertical reading movement so diagonal gestures do not unexpectedly turn pages.

Mobile should not require a desktop-style click-and-drag pan gesture. When the journal is zoomed such that content extends horizontally outside the viewport, touch movement may pan the enlarged scene naturally, but vertical reading must remain reliable.

The practical mobile model is:

```text
one finger vertical
-> scroll current journal page

pinch
-> zoom

zoomed content extends beyond viewport
-> touch movement can reveal overflow

clear horizontal swipe at navigation intent
-> turn journal page
```

The implementation MUST be tested on touch input, not only through desktop pointer emulation.

### Page changes and camera preservation

When changing logical pages, the application should normally preserve the current zoom.

On mobile, a new page begins at a useful top position so the user does not arrive on the next page at the previous page's bottom scroll position.

On desktop, pan may be partially normalized after page navigation so the newly selected spread remains visible, but the application should avoid unexpected complete camera resets.

Zoom persistence applies only within the active session. Reloading the application may return to the default 100% scale.

## G-01. Responsive behavior and interaction states

Responsive design changes how many logical pages are visible, not the nature of the journal.

The principal modes are:

| Mode                     | Visible logical pages | Entries visible in a full journal unit | Navigation increment |
| ------------------------ | --------------------: | -------------------------------------: | -------------------: |
| Wide desktop / landscape |                     2 |                                     12 |              2 pages |
| Constrained / mobile     |                     1 |                                      6 |               1 page |

The breakpoint should be selected from actual readability testing rather than by blindly adopting a conventional framework width. If two complete pages can fit while previews, titles, source lines, and dates remain readable, show a spread. Otherwise show one page.

A landscape tablet may therefore show two pages while a portrait tablet shows one.

The six-entry logical page remains fixed across responsive states.

The mobile page may be taller than the viewport. This is expected. Do not scale all six records until the entire page fits vertically.

The same minimum-readable-size rule defined in F-01 applies across responsive modes. When a window becomes too small to contain the journal at a readable scale, scrolling and overflow are the correct behavior. Continuous automatic shrinking below readable size is not.

Interactive states remain intentionally understated.

Normal entry states are:

| State             | Presentation                                       |
| ----------------- | -------------------------------------------------- |
| Resting           | Printed/clipped appearance on paper                |
| Hover             | Very small emphasis: slight tonal or border change |
| Keyboard focus    | Clearly visible focus treatment                    |
| Pressed           | Brief restrained feedback                          |
| Loading           | Stable placeholder retaining card geometry         |
| Failed            | Compact failure state in the same grid position    |
| Stale cached data | Optional tiny `Cached` indicator                   |

Cards should never perform large hover lifts or dashboard-style animations.

Keyboard operation MUST remain complete. At minimum, Tab and Shift+Tab move through entries and navigation controls, Enter opens the focused entry, Right Arrow/PageDown moves toward older pages, and Left Arrow/PageUp moves toward newer pages when those keys are not needed by another focused control.

The small `Ctrl + wheel to zoom` interaction hint is intended primarily for pointer-based desktop use. It SHOULD NOT consume scarce space in the single-page mobile layout. Touch interactions should instead remain conventional enough that persistent instruction text is unnecessary.

## H-00. Loading, failure, and incomplete-content presentation

Data-layer states from DELTA must fit into the journal without changing the page geometry.

A record that is still loading occupies its final grid position. The placeholder should resemble quiet paper rather than a modern animated skeleton. A faint preview block and subtle title lines are sufficient. If motion is used, prefer a slow low-contrast opacity pulse.

When the entry resolves, its final content replaces the placeholder without moving neighboring cells.

A record-level failure also remains in place. The journal must not silently remove the failed record because that would shift subsequent entries and destroy the physical pagination model.

A failed record can use a restrained card such as:

```text
Link unavailable

Retry
```

Technical details remain in the browser console and are specified by FOXTROT. The page itself communicates only what the reader needs.

If the preview JPEG fails while metadata remains valid, retain the normal card size and display a neutral preview placeholder. The title, source, date, and link remain usable.

A stale cached record may show a tiny `Cached` indicator if useful. This is an exceptional state, not permanent metadata shown on every card.

An entirely empty archive is different from one failed record. The journal remains visible, but Page 1 may contain a minimal centered message such as:

```text
The journal is empty.
```

No onboarding wizard or explanatory product screen is needed.

The final archive page requires no explicit "end of archive" banner. Physical inability to continue forward is sufficient.

## I-00. Implementation boundaries and performance

The visual implementation should remain simpler than its appearance suggests.

The preferred technology remains plain HTML, CSS, and JavaScript. A large frontend framework, 3D library, physics engine, WebGL renderer, canvas book engine, or page-flipping package should not be added simply to imitate paper.

The implementation should conceptually separate a small set of concerns:

```text
scene / camera
journal shell
logical page
entry card
page-navigation controller
page-turn visual layer
loading and error presentation
responsive layout
```

This is enough separation to make visual behavior understandable without constructing a generalized component framework.

Important visual constants should be centralized, including page aspect ratio, page padding, grid gap, gutter width, leather edge thickness, page-turn duration, drag threshold, default zoom, and zoom limits.

CSS should provide most of the material treatment:

```text
gradients
box shadows
inset shadows
border treatment
transforms
perspective
opacity
```

Small optimized local textures may be used for leather, paper, desk grain, or screenshot-edge wear when CSS alone does not produce the required result.

Do not use separate high-resolution texture images for every page.

The live DOM should contain only the page content required for the current view and nearby page-turn states. Rendering hundreds of hidden pages is unnecessary. DELTA already bounds the active data set.

The page turn, panning, and zooming should primarily animate compositor-friendly transforms and opacity. The target is smooth interaction on an ordinary modern mobile device and desktop browser. The design should prefer a simpler physically plausible animation over a more elaborate animation that introduces persistent frame drops.

## J-00. Visual implementation and inspection procedure

Visual inspection is a required implementation activity, not optional polish.

The supplied reference images will be available to Codex. Codex MUST inspect them directly before implementing the journal and repeatedly during implementation.

A functional DOM with six cards is not sufficient proof of completion.

The appropriate development loop is:

```text
implement one major visual concern
        |
render real application
        |
capture or inspect screenshot
        |
compare with reference images
        |
identify visual mismatch
        |
adjust
        |
repeat
```

This process should occur after substantial changes to page geometry, grid spacing, typography, material treatment, camera scale, responsive behavior, screenshot aging, or page animation.

The visual review should specifically examine the following.

| Area               | What to inspect                                                           |
| ------------------ | ------------------------------------------------------------------------- |
| Overall silhouette | Journal dominates scene and reads as one physical object                  |
| Camera framing     | Content large enough at 100%; desk appears progressively when zooming out |
| Leather            | Dark brown, restrained grain, believable edge thickness                   |
| Paper              | Warm, clean, mildly aged, readable                                        |
| Binding            | Narrow, centered, physically coherent                                     |
| Grid               | Equal columns, consistent row geometry and page margins                   |
| Preview            | Recognizable, aligned, subtly worn only at edges                          |
| Titles             | Readable, clamped consistently                                            |
| Metadata           | Host and date aligned and secondary                                       |
| Desk               | Dark, quiet, subordinate                                                  |
| Page turn          | One coherent attached sheet; no impossible folding                        |
| Mobile             | Single page remains readable and vertically scrollable                    |
| Desktop            | Both pages readable without excessive empty environment                   |

The implementation should be visually tested with varied realistic content: dark and light previews, text-heavy and image-heavy previews, one-line titles, three-line titles, long hostnames, partial pages, loading cells, and error cells.

Page-turn inspection deserves special attention. Codex must inspect intermediate frames, not only the resting states. A transition passes only when the turning sheet remains attached to the binding, underlying sheets remain stable, shadows move consistently with the sheet, and no floating or duplicated paper appears.

The camera interaction must likewise be inspected visually and functionally at several window sizes. Codex MUST verify that the minimum-readable-size rule prevents over-shrinking, that ordinary wheel scrolling reveals overflow, that Ctrl + wheel zooms without simultaneously scrolling, that drag panning remains bounded, and that mobile pinch and scrolling do not conflict.

## K-01. User scenarios

### Opening the journal on desktop

The user opens the site on a desktop browser with 40 saved links.

The application immediately shows an open leather journal containing Pages 1 and 2. There is no cover-opening step.

The twelve newest records are visible. Each page contains six cards. The journal fills most of the useful viewport. Cream paper is bright enough for easy reading. Dark leather frames the pages. Only a modest part of the wooden desk is visible.

If there is enough unused desk space, a small quiet instruction near the top states:

```text
Ctrl + wheel to zoom
```

It does not overlap or compete with the journal.

The user can immediately recognize links from their screenshots and titles.

### Looking more closely at a saved page

A screenshot contains small but recognizable interface detail.

The user holds Ctrl and moves the mouse wheel upward.

The application zooms from 100% toward 125%.

The journal camera moves closer while retaining approximately the same focal region. Less desk and leather are visible, and the preview occupies more screen space.

The user releases Ctrl and uses the normal mouse wheel. The viewport scrolls rather than changing zoom.

The user then holds the left mouse button over unused page space and drags slightly to inspect the right side of the spread.

The journal pans like a large image.

The user releases the button. Nothing snaps unexpectedly back to the center.

### Pulling back to see the physical journal

The user holds Ctrl and moves the mouse wheel downward until the journal reaches approximately 75%.

Both pages, the full leather cover, the journal cast shadow, and a larger area of the dark wooden desk become visible. A pen near the outer edge of the scene may become visible.

No toolbar, large label, caption, or unrelated application information appears. The small zoom hint may remain in unobtrusive desk space.

### Small desktop window

The user narrows the browser window.

Fitting the complete spread would require shrinking it below the minimum readable size.

The journal therefore stops shrinking.

The viewport now contains only part of the complete scene.

The user uses the normal mouse wheel to scroll vertically and left-button drag to pan horizontally or diagonally where needed.

Titles, source hostnames, dates, and preview images remain readable because the application did not reduce them below the accepted minimum scale.

### Scrolling on a constrained screen

The mobile viewport shows Page 1 but only its upper rows fit vertically.

The user performs a normal vertical touch scroll.

The viewport moves down the physical page and exposes the lower entries.

The journal does not change to Page 2.

Likewise, a desktop mouse wheel scrolls the viewport and never turns pages unless Ctrl is being held for application zoom.

### Turning to older links on desktop

The user is looking at Pages 1 and 2 and activates forward navigation.

The right sheet rotates around the gutter with a short perspective transition. A moving shadow indicates that the sheet is lifting. Underlying geometry stays still.

The turn completes in roughly half a second and Pages 3 and 4 become the resting spread.

At no point do two sheets curl together or appear detached from the binding.

### Turning pages on mobile

The user is looking at Page 3 and performs an intentional horizontal swipe.

The application identifies horizontal intent rather than vertical scrolling.

A simplified single-sheet page transition occurs and Page 4 becomes active.

The viewport returns to the useful top position of Page 4 while preserving the current journal zoom.

### Mobile zoom

The user places two fingers on a mobile journal page and performs a pinch-out gesture.

The journal enlarges.

Because the enlarged page may now extend beyond the viewport in both dimensions, normal touch movement can reveal the hidden content.

A subsequent vertical reading gesture remains vertical scrolling rather than being interpreted as a page turn.

A clear horizontal navigation gesture remains necessary to move to another logical page.

### Activating a link versus panning

The user presses on a card and releases without meaningful pointer movement.

The link opens.

On another attempt, the user presses the same card and drags more than the pan threshold before releasing.

The journal pans and the link does not open.

This distinction makes the image-like camera interaction compatible with whole-card link targets.

### Partial final page

The archive contains 15 records.

Pages 1 and 2 are full. Page 3 contains three entries.

The three cards use their normal size and occupy the first three slots in order. The remaining grid positions remain empty cream paper.

The existing cards do not stretch or recenter into a new layout.

## L-01. Acceptance criteria

The implementation is accepted only when both functionality and visual inspection satisfy the following conditions.

### Composition and content

The application opens directly to journal content. Desktop shows two logical pages when both remain readable; mobile or constrained view shows one. Each logical page contains six fixed entry positions arranged as two columns by three rows.

Every normal record visibly contains its screenshot, title, hostname, and date. Screenshot previews remain recognizable at default scale. Long titles do not change grid geometry. Empty slots on partial pages remain empty.

The journal occupies most of the viewport at 100% application zoom. Decorative environment never forces the content to become unnecessarily small.

When fitting the complete journal would require scaling below the defined minimum readable size, the journal remains at or above that minimum and the viewport becomes scrollable instead.

### Physical visual language

The journal reads as one coherent dark-brown leather object containing warm cream pages. Leather, paper, binding, page edges, and shadows have enough depth to communicate material without becoming theatrical.

The journal rests on a dark wooden desk. More desk becomes visible as the user zooms out. Sparse props such as one pen are acceptable but remain secondary.

Preview screenshots preserve their source colors and clarity. Only their perimeter receives restrained age or wear treatment.

No fake mobile status bar, bottom annotation plaque, dashboard toolbar, sidebar, footer, large pagination controls, or other unrelated application chrome appears.

A single small zoom instruction may appear in unused desktop environment space. It communicates `Ctrl + wheel to zoom`, remains visually subordinate, and disappears or is omitted when insufficient desk space exists.

### Page interaction

Desktop navigation moves by two pages and mobile navigation by one.

Page-turn animation shows one coherent sheet attached to the binding. The animation contains no floating duplicates, multi-sheet folding, impossible intersections, or exaggerated permanent curled pages.

Forward and backward directions remain physically consistent.

Reduced-motion mode provides the same navigation without the physical page animation.

### Scroll, pan, and zoom

Regular mouse-wheel input scrolls vertically.

Trackpad vertical input scrolls vertically.

Regular wheel input does not change journal pages and does not change zoom.

Ctrl + mouse wheel changes application zoom in and out and does not simultaneously scroll the scene.

The zoom interaction works consistently enough that the small desktop instruction is accurate.

Primary-button drag pans the journal on desktop.

Click and drag are separated by a movement threshold so a pan does not activate a link.

Pan bounds prevent the journal from becoming unrecoverably lost outside the viewport.

Application zoom begins at 100%, is bounded, preserves the user's approximate focal region, and reveals progressively more physical environment when zoomed out.

The journal does not shrink below the minimum readable size merely to fit a small window.

When the journal exceeds the viewport, scrolling and panning make hidden content reachable.

Mobile vertical touch movement scrolls the current page.

Mobile pinch zooms the journal.

Mobile zoomed content remains navigable.

Horizontal mobile page gestures remain distinguishable from vertical reading movement.

The mobile interaction model has been tested on touch-capable behavior, not inferred solely from mouse interaction.

### Responsive behavior and accessibility

Changing between one-page and two-page presentation preserves the user's approximate logical location and does not reorder records.

The journal remains readable at representative mobile, tablet, standard desktop, and large desktop viewports.

All entries remain keyboard reachable, focus is clearly visible, Enter opens a focused entry, and keyboard page navigation exists.

Reduced-motion preferences are honored.

### Required visual verification

Codex has inspected the supplied reference images directly.

Codex has repeatedly rendered and visually inspected the application during implementation rather than relying only on DOM inspection or automated tests.

Desktop and mobile screenshots have been compared against the reference direction.

Intermediate page-turn frames have been inspected.

Pan, zoom, regular scrolling, Ctrl + wheel zooming, minimum readable sizing, partial pages, long titles, loading records, failed records, light previews, and dark previews have been visually tested.

At least one intentionally small desktop window has been tested to verify that content remains readable and overflow is reachable by scrolling and panning.

At least one mobile viewport has been tested to verify vertical scrolling and pinch zoom behavior.

The final review confirms consistent page margins, equal grid columns, stable row geometry, aligned previews, aligned metadata, centered binding, coherent shadows, readable typography, restrained material aging, and the absence of image-generation defects copied from the sketches.

The implementation is not accepted solely because functional tests pass. For this specification, visual inspection is part of correctness.

## M-00. Next specification

The next specification is:

```text
2026-08-16.FOXTROT.A-00
Diagnostics, Errors, Telemetry, and System Acceptance
```

FOXTROT will define the cross-cutting diagnostic contract for both local authoring and the browser application: stable log structure, actionable errors, console troubleshooting, failure context, privacy boundaries, repository-consistency diagnostics, boundary conditions, and final end-to-end system acceptance.



## File content `.specs\suggestions001-006.md`:

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


## File content `.specs\suggestions001-007.md`:

2026-08-16

# 2026-08-16.GOLF.A-00

## A-00. Purpose, motivation, and implementation standard

DIRECTIVE: Treat this document as the implementation and quality-assurance contract for the complete project. Use it together with ALPHA through FOXTROT. Do not treat it as optional project notes. Before declaring any implementation task complete, use the relevant acceptance criteria in this document to verify the result.

DIRECTIVE: Understand the product before writing substantial implementation code. Read the specifications in order, inspect the repository, inspect the supplied visual references, understand the generated-file model, and understand both primary user workflows. Do not begin by translating isolated requirement sentences directly into code without understanding how those requirements contribute to the finished product.

The project intentionally uses simple technology to create a surprisingly complete product. A local authoring command converts an ordinary public URL into a persistent repository record containing a short URL, deterministic metadata, and a recognizable screenshot. Git and GitHub Pages provide persistence and publication. The browser turns those records into a visually rich journal without requiring a server, database, account system, or remote processing service.

The value of the project comes from the combination of these properties rather than from any one feature.

The authoring workflow should be exceptionally easy to use. The user supplies a URL. The software performs the mechanical work, validates its result, and either creates a complete link record or explains precisely why it could not.

The resulting short URL should be useful outside the journal. It should expose a meaningful social preview that helps the user recognize the destination when the link is pasted into a chat or another application.

The journal should turn a collection of otherwise forgettable URLs into a visual memory aid. The user should be able to recognize saved material from the screenshot, title, source, and date, browse it chronologically, and interact with it through a deliberately tactile journal presentation.

The implementation should remain technically modest while the finished experience feels deliberate, polished, and elegant.

DIRECTIVE: Optimize for the finished user experience rather than architectural sophistication. Prefer the smallest dependable implementation that fulfills the specifications completely. A simple solution that is reliable, understandable, fast, and visually refined is better than a generalized architecture built for hypothetical future requirements.

DIRECTIVE: Treat quality as including functional correctness, visual correctness, interaction correctness, diagnostic quality, performance, boundary behavior, and maintainability. Passing automated tests is necessary where tests are appropriate, but it is not by itself evidence that this project is finished.

DIRECTIVE: Remember the core product goal throughout implementation: create low-technology software that is simple to operate, convenient to browse, visually elegant, reliable in ordinary and boundary conditions, and pleasant enough that its simplicity feels intentional rather than primitive.

## B-00. Judgment, reasoning, and specification interpretation

DIRECTIVE: Use your best engineering judgment. The specifications are intentionally explicit, but implementation still requires reasoning about browser behavior, filesystem behavior, visual geometry, asynchronous state, and boundary conditions. Do not mechanically implement an interpretation that is obviously inconsistent with the overall product goal.

DIRECTIVE: When a requirement appears ambiguous, first resolve it from the complete specification set, existing repository conventions, surrounding requirements, user scenarios, and the stated product motivation. Prefer the interpretation that preserves simplicity, correctness, and user value.

DIRECTIVE: When two requirements appear to conflict, investigate the conflict rather than silently choosing one. Determine whether a later specification clarifies an earlier requirement. Prefer the interpretation that preserves explicit invariants and the product's primary user workflows.

DIRECTIVE: You may make a small implementation-level correction when literal compliance would clearly undermine the product's stated goal, but do so deliberately. Verify that the change does not break another specification, keep the correction minimal, and record the reasoning in the implementation summary when it is materially different from the written specification.

DIRECTIVE: Do not use "best judgment" as permission to redesign the product. Do not introduce additional product features, speculative extensibility, architectural layers, controls, workflows, dependencies, or configuration merely because they might be useful.

DIRECTIVE: Rubber-duck important implementation decisions before committing to them. Explain the problem to yourself in concrete terms: what the user is doing, what state exists before the operation, what must be true afterward, which invariants can fail, and how the result will be verified.

DIRECTIVE: For nontrivial logic, explicitly challenge your first solution. Ask what happens with invalid input, missing files, network timeouts, duplicate records, stale cache, malformed HTML, incomplete images, tiny windows, long titles, rapid user input, touch input, interrupted writes, and other relevant boundaries from the specifications.

DIRECTIVE: Prefer implementations whose correctness can be inspected directly. Repository formats should be readable as files. Diagnostic output should explain state. Visual constants should be centralized. Algorithms such as screenshot selection should expose enough DEBUG information to understand their decisions.

## C-00. Work sequence and project understanding

DIRECTIVE: Before changing code, establish the scope of the requested work. Identify which specifications govern it, which existing modules it touches, which invariants must remain true, which user workflows it affects, and which validation methods will prove correctness.

DIRECTIVE: Read neighboring code before editing. Reuse established project conventions when they are sound. Do not create parallel utilities, duplicate constants, duplicate parsers, or alternative state models when an existing project mechanism already owns that concern.

DIRECTIVE: Inspect the actual repository state before relying on assumptions about filenames, directory structure, dependencies, configuration, or generated records.

DIRECTIVE: For presentation work, inspect the supplied journal reference images before implementation. The images are part of the design context. Distinguish intentional art direction from image-generation defects as required by ECHO.

DIRECTIVE: Implement in coherent increments that can be validated independently. A useful pattern is:

```text
understand requirement
-> inspect existing implementation
-> plan minimal change
-> implement
-> run focused automated validation
-> run the actual user workflow
-> inspect diagnostics
-> visually inspect when applicable
-> inspect surrounding behavior
-> correct defects
-> run broader regression validation
```

DIRECTIVE: Do not postpone all validation until the end of a large implementation. Defects become more expensive and harder to localize when multiple unverified assumptions are layered together.

## D-00. Simplicity and implementation discipline

DIRECTIVE: Keep the public application static. Do not introduce a server, runtime database, CMS, remote processing service, service worker, analytics backend, or other infrastructure unless a specification is explicitly revised to require it.

DIRECTIVE: Keep repository state understandable through direct filesystem inspection. Generated records, the manifest, metadata, and preview files should remain straightforward enough that a developer can diagnose them with ordinary file and Git tools.

DIRECTIVE: Keep dependencies minimal. A new dependency must solve a concrete requirement materially better than the platform or already required tooling. Do not add a dependency merely to avoid writing a small amount of clear project-specific code.

DIRECTIVE: Avoid generalized abstractions for requirements that have one fixed implementation in this finished project. Do not add provider systems, plugin interfaces, database adapters, configurable ID strategies, generalized animation engines, or future-oriented extension points.

DIRECTIVE: Write concise implementation code, but do not compress logic until it becomes opaque. Straightforward code with clear invariants is preferable to clever code that is difficult to verify.

DIRECTIVE: Centralize important fixed values where duplication could produce inconsistency. This includes repository constants, cache TTL, fetch timeouts, page size, preview dimensions, zoom bounds, page-turn duration, and similar project-wide values.

DIRECTIVE: Preserve separation of concerns where it materially improves correctness. The journal data layer should not own paper animation. Presentation should not parse manifest syntax independently. Capture heuristics should not mutate repository state. Diagnostic formatting should not be reinvented at every call site.

## E-00. Functional verification

DIRECTIVE: Verify behavior through the same interfaces the user will use. Do not validate a CLI workflow solely by calling an internal function. Do not validate the journal solely by inspecting JavaScript state. Run the command, load the real page, interact with it, and inspect the actual generated artifacts.

DIRECTIVE: Use automated tests for deterministic logic where they add value. Good candidates include URL validation, ID validation, manifest parsing, metadata sanitization, pagination calculations, cache expiration, error formatting, and other logic with well-defined inputs and outputs.

DIRECTIVE: Do not replace end-to-end verification with unit tests. This project depends heavily on integration between filesystem generation, browser behavior, static hosting assumptions, image generation, DOM parsing, caching, and visual presentation.

DIRECTIVE: Test both successful and failing paths. A feature is not complete merely because its primary success case works.

DIRECTIVE: Validate invariants after operations rather than assuming the sequence of writes produced a valid result. For authoring, inspect the generated record and manifest. For the journal, verify requested IDs against parsed record metadata. For interaction, verify logical page state after animation.

DIRECTIVE: When a failure is intentionally tested, verify not only that an error occurred but that the repository or browser state after the failure is correct.

## F-00. Visual quality assurance

DIRECTIVE: Treat visual inspection as mandatory engineering validation for every feature that affects rendered output, journal geometry, screenshots, loading states, errors, responsive behavior, motion, pan, zoom, or scrolling.

DIRECTIVE: Use Playwright and available browser tooling to render the actual application at representative viewport sizes and capture screenshots. Do not rely on mental interpretation of CSS.

DIRECTIVE: Analyze captured screenshots thoroughly. Inspect alignment, spacing, clipping, typography, image scaling, material treatment, shadows, binding geometry, card density, page framing, overflow, loading states, errors, and any unintended browser artifacts.

DIRECTIVE: Inspect the primary change first, then deliberately inspect the rest of the screenshot. Validation is exploratory as well as targeted. A change may satisfy its immediate requirement while introducing a defect elsewhere in the composition.

For example, when validating a new preview-border treatment, do not inspect only the preview border. Also inspect whether the change altered card dimensions, row alignment, page density, title wrapping, page margins, rendering performance, or the overall visual hierarchy.

When validating page-turn animation, inspect the turning sheet, but also inspect the resting sheet, the gutter, underlying pages, shadows, entry content, leather boundary, and resulting spread.

When validating zoom, inspect whether zoom itself works, but also inspect framing, scroll range, pan boundaries, desk visibility, text readability, interaction hint placement, and recovery from extreme camera positions.

DIRECTIVE: Compare the implementation against the supplied visual references, but do not copy reference defects. Use the references to judge atmosphere, hierarchy, proportion, density, and material language.

DIRECTIVE: Take screenshots at multiple points in an animation when motion is visually significant. Start and end states alone cannot reveal impossible intermediate geometry.

DIRECTIVE: Validate mobile presentation with mobile-sized viewports and touch-relevant behavior. Do not infer mobile correctness solely from shrinking a desktop browser.

DIRECTIVE: Validate desktop presentation at both comfortable and intentionally constrained window sizes. A layout that works only at one ideal resolution is not accepted.

DIRECTIVE: Repeat visual inspection after corrections. Do not assume that a visually motivated fix improved the composition until the new rendering has actually been inspected.

DIRECTIVE: Spend enough validation time to become confident in visual correctness. Do not skip visual verification because the implementation appears straightforward.

## G-00. Playwright and browser-based validation

DIRECTIVE: Use Playwright as the primary automation tool for browser-based project verification. Use it to exercise the journal, inspect DOM state, capture screenshots, validate responsive layouts, test loading behavior, test interaction sequences, and reproduce browser-visible failures.

DIRECTIVE: Use a real browser rendering path when validating anything that depends on CSS layout, fonts, image sizing, scroll behavior, pointer input, touch behavior, animation, DOM parsing, or browser caching.

DIRECTIVE: Capture diagnostic information when an automated browser validation fails. Preserve the relevant URL, viewport, current page or spread, interaction state, and screenshot when useful.

DIRECTIVE: Do not write browser tests that only assert implementation details while ignoring the user-visible result. Prefer observable behavior such as "Pages 3 and 4 are visible after one desktop forward navigation" over an assertion on an incidental internal variable name.

DIRECTIVE: Where pixel-perfect equality would be brittle, validate geometry and visual relationships semantically and supplement those assertions with screenshot inspection.

DIRECTIVE: Use screenshots as evidence, not merely artifacts. Review them before considering the validation complete.

## H-00. Exploratory regression review

DIRECTIVE: After the requested feature passes its focused validation, perform a broader exploratory pass over surrounding functionality.

The purpose is to discover defects that were not explicitly predicted by the implementation plan.

A change to manifest parsing may affect journal startup.

A change to card dimensions may affect page-turn geometry.

A change to zoom transforms may affect pointer hit testing.

A change to generated metadata may affect both social previews and journal parsing.

A change to error wrapping may accidentally remove stack information.

DIRECTIVE: During exploratory review, inspect at least the upstream and downstream boundaries of the changed subsystem.

DIRECTIVE: When practical, run one complete successful user workflow after a substantial cross-cutting change.

For this project, the strongest end-to-end regression path is:

```text
add URL locally
-> inspect generated record
-> inspect manifest
-> serve static project locally
-> open journal
-> find generated entry
-> inspect preview and metadata
-> open short link
-> confirm redirect behavior
```

DIRECTIVE: Also run one relevant failure scenario for the changed subsystem.

## I-00. Diagnostics and error validation

DIRECTIVE: Apply FOXTROT to every new or modified failure path. Do not leave newly written code with generic messages merely because the exact failure was not shown as an example in the specification.

DIRECTIVE: Verify errors as user experiences, not just as thrown objects. Trigger representative errors and inspect the actual terminal or journal presentation.

DIRECTIVE: Verify that user-facing errors are concise, apologetic where FOXTROT requires it, specific, non-repetitive, and actionable only when a real action is known.

DIRECTIVE: Verify that console diagnostics contain the context needed to troubleshoot the same failure: module, stage, resource, important parameters, error code, and mutation or rollback state where relevant.

DIRECTIVE: Do not use a raw object dump or `JSON.stringify()` as a substitute for formatted diagnostics. Bounded serialized context may supplement a deliberately formatted diagnostic.

DIRECTIVE: Verify that nonfatal degradation does not unnecessarily interrupt the user. Cache failure, stale fallback, or one failed preview should remain scoped according to FOXTROT.

DIRECTIVE: Inspect unexpected-error boundaries and make sure they preserve original stack traces.

## J-00. Data integrity and failure safety

DIRECTIVE: Treat repository invariants as part of correctness, not as advisory conventions.

DIRECTIVE: Never overwrite an existing short-link directory.

DIRECTIVE: Never expose a new ID in `links.txt` before its required record files are complete and validated.

DIRECTIVE: If repository mutation fails after changes begin, execute the rollback behavior defined by BRAVO and report both the primary failure and any rollback failure.

DIRECTIVE: Verify failed operations by inspecting repository state afterward. "An exception was thrown" is not proof that rollback worked.

DIRECTIVE: Treat generated HTML and external page metadata as untrusted input at every boundary described by ALPHA and BRAVO.

DIRECTIVE: Preserve URL semantics exactly as specified. Do not introduce convenient normalization that changes duplicate identity.

DIRECTIVE: Treat the manifest as authoritative for published membership and chronology.

## K-00. Boundary-case discipline

DIRECTIVE: Handle boundary cases that are inherent to the specified workflows even when they are uncommon.

Relevant examples include:

```text
empty archive
one entry
partial final page
duplicate URL
ID collision
malformed manifest
missing record
malformed record metadata
missing preview
network timeout
HTTP 404
stale cache
localStorage unavailable
very long title
empty sanitized title
empty sanitized description
unsupported Unicode content
slow page
infinite-scroll page
large DOM
login wall
CAPTCHA or anti-bot challenge
no valid screenshot region
JPEG conversion failure
concurrent authoring invocation
manifest update failure
rollback failure
small desktop window
mobile portrait viewport
orientation change
rapid page-navigation input
pan beginning over a link
zoom at minimum and maximum bounds
reduced-motion preference
```

DIRECTIVE: Do not invent pathological requirements unrelated to the real product. Boundary testing should protect actual project invariants and user workflows rather than become an exercise in theoretical completeness.

## L-00. Performance and responsiveness

DIRECTIVE: Validate performance where the specification provides explicit limits or where user experience depends on responsiveness.

DIRECTIVE: Confirm that journal startup does not fetch the complete archive.

DIRECTIVE: Confirm that record-request concurrency remains bounded.

DIRECTIVE: Confirm that repeated page navigation uses memory or persistent cache where appropriate.

DIRECTIVE: Confirm that screenshot generation does not use unbounded full-page captures.

DIRECTIVE: Confirm that extremely long pages do not produce work proportional to the complete document length beyond the bounded CHARLIE search.

DIRECTIVE: Inspect page-turn, pan, and zoom motion for persistent jank. If an elaborate effect performs poorly, simplify the effect rather than adding disproportionate rendering infrastructure.

DIRECTIVE: Use available browser performance information when a visual interaction appears slow. Do not optimize blindly.

## M-00. Final implementation review

DIRECTIVE: Before declaring the project complete, perform a deliberate final review against every specification from ALPHA through GOLF.

DIRECTIVE: Do not treat previous incremental validation as a substitute for final integration review. Incremental validation proves pieces; final review proves the assembled product.

DIRECTIVE: Inspect the Git diff or equivalent changed-file set. Confirm that the implementation contains no accidental generated debug artifacts, temporary screenshots, temporary records, unused experiments, duplicate assets, or unrelated changes.

DIRECTIVE: Remove development-only instrumentation that is no longer needed, but preserve the intentional DEBUG diagnostics required by the specifications.

DIRECTIVE: Confirm that no implementation shortcut weakened the project's low-tech architecture.

DIRECTIVE: Confirm that all visual-reference images remain reference material rather than copied application screens.

DIRECTIVE: Confirm that the finished user workflows feel coherent. The user should not encounter an implementation detail that requires understanding the architecture to operate the tool.

## N-00. Project acceptance checklist

DIRECTIVE: Use the following checklist as the final project to-do and validation outline. Do not mark an item complete until its stated validation has been performed.

### 1. Repository model

* [ ] REQUIREMENT: Implement the ALPHA repository layout with root `links.txt` and one `lnk/<id>/` directory per saved target.
  ACCEPTANCE: Inspect a generated repository and confirm that a complete record contains only the required generated files and follows the specified path structure.
  VALIDATION: Create at least two records and inspect the filesystem directly.

* [ ] REQUIREMENT: Generate exactly 8-character case-sensitive IDs from the specified 62-character alphabet using secure randomness.
  ACCEPTANCE: IDs match the format, collision checks occur before commit, and existing directories are never overwritten.
  VALIDATION: Test ID validation separately and simulate an existing candidate directory to verify collision handling.

* [ ] REQUIREMENT: Preserve the serialized original HTTP or HTTPS target without semantic canonicalization.
  ACCEPTANCE: Query order, fragment, and other specified URL components survive record generation.
  VALIDATION: Add representative URLs containing query parameters and fragments and inspect `lnk:target`.

* [ ] REQUIREMENT: Prevent duplicate serialized targets.
  ACCEPTANCE: Adding an existing target produces the FOXTROT-compliant duplicate error and modifies no files.
  VALIDATION: Add a URL successfully, record repository state, add the same URL again, and compare state afterward.

* [ ] REQUIREMENT: Maintain `links.txt` newest first with every published record represented exactly once.
  ACCEPTANCE: Newly added IDs appear at the beginning without changing relative order of existing IDs.
  VALIDATION: Add several links sequentially and inspect manifest order.

### 2. Generated short-link record

* [ ] REQUIREMENT: Generate `index.html` containing all ALPHA project metadata and required Open Graph metadata.
  ACCEPTANCE: Metadata exists in initial static HTML and can be parsed without executing JavaScript.
  VALIDATION: Open the generated file as text and parse it through the same DOM-based mechanism used by the journal.

* [ ] REQUIREMENT: Generate a real `preview.jpg` JPEG at approximately 90% quality.
  ACCEPTANCE: The file decodes as JPEG, is exactly 1200 x 630 pixels, is non-empty, and no final PNG copy remains.
  VALIDATION: Inspect image metadata programmatically and visually inspect the JPEG.

* [ ] REQUIREMENT: Implement static client-side redirect behavior with metadata remaining available to crawlers.
  ACCEPTANCE: Opening the short URL in a browser navigates to the stored target, while the initial HTML independently contains the metadata.
  VALIDATION: Serve the repository locally and exercise the generated short-link route in Playwright.

* [ ] REQUIREMENT: Escape every generated HTML value correctly.
  ACCEPTANCE: Titles and descriptions containing allowed quotation or punctuation characters cannot alter generated markup.
  VALIDATION: Generate a record from controlled metadata containing relevant boundary characters and parse the resulting HTML.

### 3. Metadata sanitization

* [ ] REQUIREMENT: Apply the ALPHA/BRAVO allowed-script and punctuation rules consistently to externally sourced title and description text.
  ACCEPTANCE: Latin, Cyrillic, Han, Hiragana, and Katakana content survives as specified while emoji, unsupported scripts, disallowed punctuation, symbols, digits, and formatting characters do not.
  VALIDATION: Run a deterministic sanitizer test matrix covering allowed and disallowed classes.

* [ ] REQUIREMENT: Replace disallowed characters with spaces, collapse whitespace, and trim invalid edge punctuation.
  ACCEPTANCE: Sanitization does not concatenate words that were separated by removed characters.
  VALIDATION: Verify representative emoji, em-dash, unsupported-script, and punctuation examples.

* [ ] REQUIREMENT: Apply `(no title)` and `(no description)` when sanitization leaves an empty result.
  ACCEPTANCE: Empty metadata does not make an otherwise valid capture fail.
  VALIDATION: Test both placeholders explicitly.

* [ ] REQUIREMENT: Respect title and description length limits after sanitization.
  ACCEPTANCE: Truncation does not split a Unicode code point and final stored text still satisfies edge-cleanup rules.
  VALIDATION: Test long multilingual strings.

### 4. Authoring command

* [ ] REQUIREMENT: Provide one simple command that normally requires only the target URL.
  ACCEPTANCE: The user does not supply ID, title, description, date, preview name, or manifest position.
  VALIDATION: Run the complete command from a clean valid repository.

* [ ] REQUIREMENT: Validate repository, configuration, and dependencies before expensive browser work.
  ACCEPTANCE: Missing configuration or dependencies fail before page capture and before repository mutation.
  VALIDATION: Simulate at least one missing dependency and one invalid site-base configuration.

* [ ] REQUIREMENT: Use Playwright rather than Puppeteer.
  ACCEPTANCE: The target renders through the specified Playwright Chromium workflow.
  VALIDATION: Inspect dependency and execution path and run an actual capture.

* [ ] REQUIREMENT: Perform duplicate detection before capture and final duplicate recheck before commit where concurrency permits a race.
  ACCEPTANCE: Concurrent or overlapping authoring does not produce two records for the same target.
  VALIDATION: Simulate or automate two competing add operations.

* [ ] REQUIREMENT: Treat record creation and manifest update as one transaction-like operation.
  ACCEPTANCE: Failure before success does not intentionally leave the manifest pointing at an incomplete record.
  VALIDATION: Inject or simulate failure before manifest commit and inspect repository state.

* [ ] REQUIREMENT: Roll back a committed new record when manifest update fails where possible.
  ACCEPTANCE: Successful rollback restores previous state; rollback failure clearly reports uncertain repository state.
  VALIDATION: Exercise both successful and failed rollback paths if practical through controlled filesystem failure simulation.

* [ ] REQUIREMENT: Never commit or push automatically.
  ACCEPTANCE: Successful generation modifies local project files only.
  VALIDATION: Inspect command behavior and Git state after execution.

### 5. Playwright page readiness

* [ ] REQUIREMENT: Use the fixed CHARLIE desktop viewport, scale factor, and 100% browser zoom.
  ACCEPTANCE: Capture geometry is deterministic and does not depend on arbitrary local browser dimensions.
  VALIDATION: Inspect Playwright context values during DEBUG execution.

* [ ] REQUIREMENT: Bound navigation and stabilization waits.
  ACCEPTANCE: The tool cannot remain indefinitely blocked on network idle, fonts, images, animations, or DOM conditions.
  VALIDATION: Exercise a deliberately slow or continuously requesting page.

* [ ] REQUIREMENT: Disable or neutralize nondeterministic animation and media where specified.
  ACCEPTANCE: Repeated captures of stable content select materially consistent regions.
  VALIDATION: Capture an animated test page several times and compare results.

* [ ] REQUIREMENT: Handle ordinary non-content overlays conservatively without bypassing access controls.
  ACCEPTANCE: Cookie or dismissible overlays may be removed, while login, CAPTCHA, paywall, and anti-bot barriers are not circumvented.
  VALIDATION: Test representative controlled overlay and access-barrier pages.

### 6. Preview region selection

* [ ] REQUIREMENT: Select a real rendered page region rather than scaling a full-page screenshot.
  ACCEPTANCE: Preview text remains near normal browser scale and useful content is recognizable.
  VALIDATION: Visually inspect previews from long article and documentation pages.

* [ ] REQUIREMENT: Use deterministic DOM and layout heuristics without AI.
  ACCEPTANCE: Candidate discovery and scoring can be explained through DEBUG diagnostics.
  VALIDATION: Run DEBUG capture and inspect candidate counts, signals, scores, and selected crop.

* [ ] REQUIREMENT: Prefer headings, readable text, meaningful images, and main content while penalizing navigation, advertising, footer, overlays, and empty regions.
  ACCEPTANCE: Representative articles, docs, product pages, and interface pages select useful content rather than site chrome.
  VALIDATION: Capture a diverse controlled sample and visually inspect every result.

* [ ] REQUIREMENT: Keep candidate analysis bounded by the specified search area and candidate limits.
  ACCEPTANCE: Extremely long or complex pages do not trigger unbounded traversal or full-page bitmap generation.
  VALIDATION: Exercise a long/infinite page and inspect timings and candidate metrics.

* [ ] REQUIREMENT: Apply deterministic tie-breaking and the single densest-content fallback.
  ACCEPTANCE: Repeated equivalent runs do not select arbitrary unrelated regions.
  VALIDATION: Test a page with multiple similarly scored candidates.

* [ ] REQUIREMENT: Fail when no genuinely useful preview region exists.
  ACCEPTANCE: No blank, generic, synthetic, or logo-only placeholder is silently committed.
  VALIDATION: Exercise a deliberately unusable page.

### 7. Manifest loading and pagination

* [ ] REQUIREMENT: Load the full lightweight `links.txt` manifest while avoiding eager loading of every record.
  ACCEPTANCE: Archive size increases manifest parsing work but does not cause one record request per archived link at startup.
  VALIDATION: Test with a large fixture manifest and inspect request counts.

* [ ] REQUIREMENT: Validate manifest IDs, order, and uniqueness.
  ACCEPTANCE: Invalid and duplicate lines produce explicit repository errors rather than silent correction.
  VALIDATION: Test malformed and duplicate manifest fixtures.

* [ ] REQUIREMENT: Preserve six entries per logical page.
  ACCEPTANCE: Page boundaries remain stable across desktop and mobile presentation.
  VALIDATION: Test archives with 0, 1, 5, 6, 7, 12, 13, and other boundary counts.

* [ ] REQUIREMENT: Preserve newest-first manifest order throughout page resolution.
  ACCEPTANCE: Cache completion or network response order never reorders entries.
  VALIDATION: Artificially delay selected record responses and inspect rendered order.

### 8. Journal record loading

* [ ] REQUIREMENT: Fetch generated `index.html` only for visible or bounded nearby records.
  ACCEPTANCE: Initial two-page desktop view resolves at most its required records plus defined adjacent prefetch.
  VALIDATION: Record all journal network requests at startup.

* [ ] REQUIREMENT: Parse fetched record HTML inertly.
  ACCEPTANCE: Redirect scripts and meta refresh do not execute during metadata loading.
  VALIDATION: Load records through the actual journal and confirm no unintended navigation occurs.

* [ ] REQUIREMENT: Validate required record metadata and confirm stored `lnk:id` matches the requested ID.
  ACCEPTANCE: Malformed records become explicit failed entries without shifting pagination.
  VALIDATION: Test missing metadata and ID-mismatch fixtures.

* [ ] REQUIREMENT: Keep failed entries in their manifest positions.
  ACCEPTANCE: Neighboring cards and later pages retain deterministic indexes.
  VALIDATION: Corrupt one record in the middle of a page and inspect layout and pagination.

### 9. Browser cache

* [ ] REQUIREMENT: Cache parsed record metadata in localStorage for exactly the DELTA one-hour TTL.
  ACCEPTANCE: Fresh entries avoid record HTML requests and stale entries refresh when needed.
  VALIDATION: Control `cachedAt` values around the one-hour boundary.

* [ ] REQUIREMENT: Keep manifest membership authoritative over cached entries.
  ACCEPTANCE: A cached deleted ID is not displayed after a current manifest omits it.
  VALIDATION: Cache an entry, remove it from the manifest fixture, and reload.

* [ ] REQUIREMENT: Continue without persistent cache when localStorage is unavailable.
  ACCEPTANCE: Journal functionality remains correct using memory/network and produces only an appropriate warning.
  VALIDATION: Run with storage access deliberately blocked.

* [ ] REQUIREMENT: Allow stale record fallback only under DELTA's stated conditions.
  ACCEPTANCE: Stale content cannot resurrect an ID absent from the current manifest.
  VALIDATION: Test both permitted stale fallback and deleted-record rejection.

* [ ] REQUIREMENT: Bound concurrent record requests and deduplicate simultaneous requests for the same ID.
  ACCEPTANCE: Request count and concurrency remain within DELTA limits during rapid navigation.
  VALIDATION: Instrument controlled delayed responses and observe active requests.

### 10. Journal visual composition

* [ ] REQUIREMENT: Implement the ECHO physical journal metaphor rather than a generic bookmark dashboard.
  ACCEPTANCE: The rendered application clearly reads as an open leather journal containing paper pages and saved web clippings.
  VALIDATION: Capture desktop and mobile screenshots and compare them with the supplied art-direction references.

* [ ] REQUIREMENT: Render six entries per page using the fixed 2 x 3 layout.
  ACCEPTANCE: Preview, title, hostname, and date remain readable and consistently aligned.
  VALIDATION: Inspect full and partial pages using varied realistic content.

* [ ] REQUIREMENT: Keep the preview visually dominant and preserve its aspect ratio.
  ACCEPTANCE: Generated screenshots remain recognizable and are not distorted.
  VALIDATION: Inspect dark, light, text-heavy, and image-heavy previews.

* [ ] REQUIREMENT: Apply only subtle worn treatment to preview edges.
  ACCEPTANCE: The border suggests physical age while the center remains clean and source colors remain accurate.
  VALIDATION: Inspect at default zoom and close zoom.

* [ ] REQUIREMENT: Maintain coherent leather, warm paper, binding, page depth, shadows, and desk environment.
  ACCEPTANCE: Materials form one plausible physical object without copied image-generation defects.
  VALIDATION: Review the full scene, not just individual cards.

* [ ] REQUIREMENT: Exclude mockup-only artifacts.
  ACCEPTANCE: No fake phone status bar, bottom explanatory plaque, impossible paper folds, or unrelated UI chrome exists.
  VALIDATION: Compare final screenshots against the "keep/remove" guidance in ECHO.

### 11. Responsive journal

* [ ] REQUIREMENT: Show two logical pages only when both remain practically readable; otherwise show one.
  ACCEPTANCE: Responsive mode is based on usable geometry rather than device identity.
  VALIDATION: Resize through wide desktop, narrow desktop, tablet-like, and phone-like widths.

* [ ] REQUIREMENT: Preserve six-entry logical page boundaries across responsive transitions.
  ACCEPTANCE: Resizing never reorders records or changes the logical grouping of entries.
  VALIDATION: Record the current visible IDs before and after mode changes.

* [ ] REQUIREMENT: Preserve the reader's approximate logical location across resize and orientation changes.
  ACCEPTANCE: Switching from spread to single-page mode does not reset to Page 1.
  VALIDATION: Resize while browsing a later spread.

* [ ] REQUIREMENT: Do not shrink the journal below its minimum readable visual size merely to fit a small window.
  ACCEPTANCE: Overflow becomes reachable through scrolling and panning instead.
  VALIDATION: Use an intentionally small desktop window and inspect title, source, date, and preview readability.

### 12. Scroll, pan, and zoom

* [ ] REQUIREMENT: Use ordinary mouse-wheel and trackpad vertical input for scrolling.
  ACCEPTANCE: Wheel input reveals vertically hidden journal content and never changes logical journal pages.
  VALIDATION: Test a viewport shorter than the journal scene.

* [ ] REQUIREMENT: Use `Ctrl + wheel` for application zoom on supported desktop input.
  ACCEPTANCE: Modified wheel changes journal camera scale without simultaneously scrolling.
  VALIDATION: Exercise zoom from default toward both bounds and inspect camera state.

* [ ] REQUIREMENT: Present the small desktop zoom instruction in unused desk space where there is sufficient room.
  ACCEPTANCE: `Ctrl + wheel to zoom` is discoverable without overlapping or competing with journal content.
  VALIDATION: Inspect wide and constrained desktop screenshots; confirm omission where space is insufficient.

* [ ] REQUIREMENT: Use primary-button drag for desktop pan.
  ACCEPTANCE: The scene follows the pointer after the drag threshold and retains a valid bounded position.
  VALIDATION: Pan at default, minimum, and maximum zoom.

* [ ] REQUIREMENT: Distinguish card activation from pan.
  ACCEPTANCE: A normal click opens the card; a drag exceeding the threshold pans and does not open the link.
  VALIDATION: Automate both pointer sequences.

* [ ] REQUIREMENT: Bound pan and zoom.
  ACCEPTANCE: The journal cannot become unrecoverably lost and zoom cannot exceed defined limits.
  VALIDATION: Repeatedly attempt to exceed every camera boundary.

* [ ] REQUIREMENT: Support mobile vertical scroll and pinch zoom while preserving clear horizontal page-navigation intent.
  ACCEPTANCE: Vertical reading gestures do not accidentally turn pages.
  VALIDATION: Exercise touch or credible touch-emulation sequences on a mobile viewport.

### 13. Page navigation and animation

* [ ] REQUIREMENT: Advance by spreads on desktop and single logical pages on mobile.
  ACCEPTANCE: Desktop sequence is 1-2, 3-4, 5-6; mobile sequence is 1, 2, 3.
  VALIDATION: Navigate repeatedly in both modes and inspect visible page numbers and IDs.

* [ ] REQUIREMENT: Implement one coherent sheet turn rather than complex paper physics.
  ACCEPTANCE: The moving page remains attached to the binding, underlying pages remain stable, and no duplicate floating sheets appear.
  VALIDATION: Capture multiple animation frames in both directions and inspect each frame.

* [ ] REQUIREMENT: Prevent repeated input from corrupting pagination during an active animation.
  ACCEPTANCE: Rapid commands leave one valid final spread/page.
  VALIDATION: Issue repeated forward/back navigation during transitions.

* [ ] REQUIREMENT: Respect reduced-motion preference.
  ACCEPTANCE: Navigation remains functional with a minimal-motion transition.
  VALIDATION: Emulate reduced motion and repeat page navigation.

### 14. Loading and failure presentation

* [ ] REQUIREMENT: Preserve grid geometry while entries load.
  ACCEPTANCE: Loading placeholders occupy final card positions and resolved data does not shift neighboring entries.
  VALIDATION: Delay record responses and inspect intermediate screenshots.

* [ ] REQUIREMENT: Keep individual record failures local to their grid positions.
  ACCEPTANCE: One broken record does not create a global journal error or remove its pagination slot.
  VALIDATION: Return a record 404 within an otherwise valid page.

* [ ] REQUIREMENT: Keep preview failures local to preview rectangles.
  ACCEPTANCE: Title, source, date, and link remain usable.
  VALIDATION: Return a missing preview image for one valid record.

* [ ] REQUIREMENT: Show complete manifest failure at journal scope.
  ACCEPTANCE: The application does not pretend a failed manifest request means an empty archive.
  VALIDATION: Exercise network failure and HTTP 404 separately and inspect the different messages.

### 15. Diagnostics

* [ ] REQUIREMENT: Implement the FOXTROT normalized diagnostic model and formatting helpers.
  ACCEPTANCE: Important errors have stable code, module, stage, summary, reason, and relevant context.
  VALIDATION: Trigger representative failures from authoring, capture, repository, manifest, record, and cache modules.

* [ ] REQUIREMENT: Keep user-facing error text concise and deliberately formatted.
  ACCEPTANCE: Errors do not expose raw exception objects, repeated invariants, irrelevant stack traces, or generic administrator/restart advice.
  VALIDATION: Review every representative user-visible failure manually.

* [ ] REQUIREMENT: Use controlled subsystem-specific apology wording where FOXTROT requires a user-facing interruption.
  ACCEPTANCE: Messages remain brief, sincere, and distinguishable without becoming theatrical.
  VALIDATION: Compare error samples from authoring, capture, repository, and journal scopes.

* [ ] REQUIREMENT: Preserve detailed local debugging context.
  ACCEPTANCE: Console diagnostics identify operation/session, affected resource, stage, parameters, error code, and rollback state where applicable.
  VALIDATION: Diagnose intentionally produced failures using logs only, without modifying code.

* [ ] REQUIREMENT: Do not use raw object dumping or `JSON.stringify()` as the primary error presentation.
  ACCEPTANCE: Human-readable formatted context appears first; bounded serialization is secondary DEBUG detail only.
  VALIDATION: Inspect logging call sites and runtime output.

* [ ] REQUIREMENT: Preserve stack traces for unexpected programming failures.
  ACCEPTANCE: Unexpected exceptions remain debuggable while expected operational errors stay concise.
  VALIDATION: Trigger one controlled unexpected exception in development validation.

### 16. Local telemetry and privacy

* [ ] REQUIREMENT: Provide local timing information for expensive authoring and journal operations in DEBUG mode.
  ACCEPTANCE: Slow stages can be identified without adding temporary instrumentation.
  VALIDATION: Inspect one authoring timing report and one journal loading report.

* [ ] REQUIREMENT: Keep logs bounded.
  ACCEPTANCE: No full HTML, binary images, huge DOM structures, unbounded child output, cookies, or authentication material are emitted.
  VALIDATION: Review logs from intentionally problematic targets.

* [ ] REQUIREMENT: Send no diagnostic telemetry to a remote service.
  ACCEPTANCE: Project network activity consists only of specified target-page loading, static journal resources, and intentional external-link navigation.
  VALIDATION: Inspect browser and authoring network activity.

### 17. Visual QA

* [ ] REQUIREMENT: Inspect supplied reference images before and during ECHO implementation.
  ACCEPTANCE: Final presentation preserves their intended hierarchy and atmosphere without reproducing their defects.
  VALIDATION: Perform explicit side-by-side review.

* [ ] REQUIREMENT: Capture and inspect representative desktop screenshots.
  ACCEPTANCE: Journal framing, two-page geometry, grid alignment, binding, shadows, desk, and interaction hint are visually coherent.
  VALIDATION: Review standard and constrained desktop screenshots.

* [ ] REQUIREMENT: Capture and inspect representative mobile screenshots.
  ACCEPTANCE: One-page composition remains readable, vertically scrollable, and visually consistent with desktop.
  VALIDATION: Review at least two portrait viewport sizes.

* [ ] REQUIREMENT: Perform exploratory visual review beyond the immediate changed element.
  ACCEPTANCE: Each major presentation validation considers both the primary feature and surrounding composition.
  VALIDATION: Record or summarize discovered surrounding issues during implementation and correct them before completion.

* [ ] REQUIREMENT: Inspect animation intermediate states.
  ACCEPTANCE: No transient impossible geometry exists.
  VALIDATION: Capture several frames during forward and backward turns.

### 18. Accessibility and input

* [ ] REQUIREMENT: Keep every journal entry keyboard reachable.
  ACCEPTANCE: Visible focus exists and Enter opens the focused entry.
  VALIDATION: Navigate a complete page without a pointer.

* [ ] REQUIREMENT: Support keyboard journal navigation.
  ACCEPTANCE: Arrow/Page keys move in the specified direction without corrupting focused interactive controls.
  VALIDATION: Exercise navigation in single-page and spread modes.

* [ ] REQUIREMENT: Respect reduced motion.
  ACCEPTANCE: The complete journal remains usable when motion is reduced.
  VALIDATION: Run the primary browsing workflow under the preference.

* [ ] REQUIREMENT: Keep touch targets practical.
  ACCEPTANCE: Page-edge or retry controls are not tiny or inaccessible.
  VALIDATION: Inspect and interact at mobile scale.

### 19. End-to-end successful workflow

* [ ] REQUIREMENT: Complete the full product path from URL authoring to journal browsing.
  ACCEPTANCE: A new URL becomes a valid repository record, produces a recognizable JPEG preview, appears newest-first in the journal after publication, exposes correct social metadata, and redirects through its short URL.
  VALIDATION: Run the complete workflow with one real representative public page and inspect every stage.

* [ ] REQUIREMENT: Confirm the Git diff is minimal and understandable.
  ACCEPTANCE: A normal add operation produces only the expected manifest change and new record files.
  VALIDATION: Inspect Git status and diff after authoring.

### 20. End-to-end failure safety

* [ ] REQUIREMENT: Verify at least one pre-mutation authoring failure.
  ACCEPTANCE: The error is actionable and repository state is unchanged.
  VALIDATION: Use invalid input, duplicate target, or missing dependency.

* [ ] REQUIREMENT: Verify at least one capture-stage failure.
  ACCEPTANCE: No final record or manifest mutation remains.
  VALIDATION: Use a controlled unusable or blocked page.

* [ ] REQUIREMENT: Verify a journal record failure.
  ACCEPTANCE: Only the affected card fails while surrounding browsing remains functional.
  VALIDATION: Use a missing or malformed record fixture.

* [ ] REQUIREMENT: Verify a journal-level manifest failure.
  ACCEPTANCE: The failure is clearly distinguished from an empty archive.
  VALIDATION: Exercise both network failure and missing-manifest response where practical.

### 21. Final cleanup

* [ ] REQUIREMENT: Remove temporary or experimental artifacts before completion.
  ACCEPTANCE: Repository contains no debug screenshots, abandoned capture files, temporary manifests, temporary records, or unused implementation experiments.
  VALIDATION: Inspect repository status and relevant directories.

* [ ] REQUIREMENT: Remove unused dependencies and dead code introduced during experimentation.
  ACCEPTANCE: Every retained dependency and major helper serves a current specified requirement.
  VALIDATION: Review dependency declarations and unreachable/unused modules.

* [ ] REQUIREMENT: Preserve intentional diagnostic and test infrastructure.
  ACCEPTANCE: Cleanup does not remove DEBUG diagnostics, validation helpers, or tests required to maintain confidence in the finished project.
  VALIDATION: Run the final validation suite after cleanup.

### 22. Final confidence gate

* [ ] REQUIREMENT: Do not declare the project complete until Codex has enough evidence to be confident in functional and visual correctness.
  ACCEPTANCE: Automated checks pass, primary workflows pass, relevant failure workflows pass, final screenshots have been inspected, surrounding behavior has received exploratory review, and no known high-impact defects remain.
  VALIDATION: Perform one final ALPHA-through-GOLF review and rerun the most important end-to-end paths after the final code change.

## O-00. Completion directive

DIRECTIVE: Use this document throughout implementation, not only at the end. The acceptance checklist is both the project completion outline and the required validation plan.

DIRECTIVE: When completing an individual implementation task, identify the checklist items it advances and execute the corresponding validation before moving on.

DIRECTIVE: When implementation discovers a defect outside the immediate task, assess whether it violates the project specifications or acceptance criteria. If it does, correct it rather than deliberately leaving a known inconsistency because it was discovered during exploratory validation.

DIRECTIVE: Do not claim completion based on confidence alone. Build confidence from evidence: generated artifacts, tests, browser behavior, screenshots, console diagnostics, repository inspection, boundary scenarios, and direct use of the finished workflow.

DIRECTIVE: The target is not merely software that technically operates. The target is a finished small product whose simple architecture, dependable behavior, diagnostics, and visual presentation all reinforce the same user experience.



## File content `assets\app.js`:

```js
import { CAMERA, PAGE_TURN_MS } from "../shared/constants.js";
import { JournalData } from "./data.js";

const viewport = document.querySelector("#viewport");
const sceneSpace = document.querySelector("#scene-space");
const scene = document.querySelector("#journal-scene");
const pages = document.querySelector("#pages");
const turnLayer = document.querySelector("#turn-layer");
const previous = document.querySelector("#previous-page");
const next = document.querySelector("#next-page");
const data = new JournalData();
const state = { page: 0, mode: "spread", zoom: CAMERA.default, baseScale: 1, panX: 0, panY: 0, turning: false, pointer: null, touch: null, hiddenAt: 0 };

start();

async function start() {
  installInteractions();
  updateGeometry(true);
  renderJournalMessage("Opening the journalâ€¦", "loading");
  try {
    await data.loadManifest();
    renderCurrent();
  } catch (error) {
    const diagnostic = error.diagnostic;
    const missing = diagnostic?.context?.["HTTP status"] === 404;
    const invalid = diagnostic?.stage === "manifest validation";
    renderJournalMessage(invalid ? `I'm sorry, the journal data is invalid and cannot be loaded safely.\n\n${diagnostic.reason}` : missing ? "Sorry, I couldn't load the journal.\n\nThe published link manifest is missing." : "Sorry, I couldn't load the journal.\n\nThe link list could not be retrieved.", "error");
  }
}

function renderCurrent() {
  if (!data.manifest.length) {
    const emptyPage = createPage(0, [], true);
    pages.replaceChildren(...(state.mode === "spread" ? [emptyPage, createBlankPage()] : [emptyPage]));
    state.page = 0;
    updateNavigation();
    updateGeometry();
    return;
  }
  const visible = state.mode === "spread" ? [state.page, state.page + 1] : [state.page];
  const fragment = document.createDocumentFragment();
  for (const pageIndex of visible) fragment.append(pageIndex < data.pageCount ? createPage(pageIndex, data.getPage(pageIndex)) : createBlankPage());
  pages.replaceChildren(fragment);
  updateNavigation();
  updateGeometry();
  const prefetch = state.mode === "spread" ? [state.page - 1, state.page + 2] : [state.page - 1, state.page + 1];
  data.prefetch(prefetch);
}

function createPage(pageIndex, slots, empty = false) {
  const page = document.createElement("section");
  page.className = "journal-page";
  page.dataset.page = String(pageIndex);
  page.setAttribute("aria-label", `Journal page ${pageIndex + 1}`);
  const header = document.createElement("header");
  header.className = "page-header";
  const title = document.createElement("h1"); title.textContent = "LINK JOURNAL";
  const number = document.createElement("div"); number.className = "page-number"; number.textContent = `Page ${pageIndex + 1}`;
  header.append(title, ornament(), number);
  const grid = document.createElement("div"); grid.className = "entry-grid";
  if (empty) {
    const message = document.createElement("p"); message.className = "empty-message"; message.textContent = "The journal is empty."; grid.append(message);
  } else {
    for (let index = 0; index < 6; index += 1) {
      const slot = slots[index];
      if (!slot) { const blank = document.createElement("div"); blank.className = "entry-slot empty-slot"; grid.append(blank); continue; }
      const card = loadingCard(slot.id);
      grid.append(card);
      slot.promise.then((entry) => card.replaceWith(entry.status === "error" ? errorCard(entry, slot) : entryCard(entry)));
    }
  }
  page.append(header, grid);
  return page;
}

function ornament() {
  const element = document.createElement("div"); element.className = "ornament"; element.setAttribute("aria-hidden", "true"); element.innerHTML = "<span></span><i>â—†</i><span></span>"; return element;
}

function loadingCard(id) {
  const article = document.createElement("article"); article.className = "entry-card is-loading"; article.dataset.id = id;
  article.innerHTML = '<div class="preview-placeholder"></div><div class="loading-line long"></div><div class="loading-line"></div><div class="loading-line short"></div>';
  return article;
}

function entryCard(entry) {
  const link = document.createElement("a");
  link.className = "entry-card"; link.href = entry.targetUrl; link.dataset.id = entry.id; link.rel = "noopener noreferrer";
  const frame = document.createElement("div"); frame.className = "preview-frame";
  const image = document.createElement("img"); image.src = entry.previewUrl; image.alt = ""; image.draggable = false; image.loading = "lazy";
  image.addEventListener("error", () => {
    image.remove(); const failed = document.createElement("span"); failed.className = "preview-failed"; failed.textContent = "Preview unavailable"; frame.append(failed);
    console.warn(`[WARN] [journal] Preview image failed to load\n\nID:\n  ${entry.id}\n\nPreview:\n  ${entry.previewUrl}\n\nEntry remains usable:\n  yes\n\nError code:\n  JOURNAL_PREVIEW_LOAD_FAILED`);
  }, { once: true });
  frame.append(image);
  const title = document.createElement("h2"); title.textContent = entry.title;
  const host = document.createElement("div"); host.className = "entry-host"; host.textContent = new URL(entry.targetUrl).hostname.replace(/^www\./, "");
  const date = document.createElement("time"); date.dateTime = entry.createdAt; date.textContent = `Added ${formatDate(entry.createdAt)}`;
  link.append(frame, title, host, date);
  if (entry.status === "stale") { const badge = document.createElement("span"); badge.className = "cached-badge"; badge.textContent = "Cached"; link.append(badge); }
  link.addEventListener("click", (event) => { if (link.dataset.dragSuppressed === "true") { event.preventDefault(); link.dataset.dragSuppressed = "false"; } });
  return link;
}

function errorCard(entry, slot) {
  const article = document.createElement("article"); article.className = "entry-card is-error"; article.dataset.id = entry.id;
  const heading = document.createElement("h2"); heading.textContent = "Sorry, this link couldn't be loaded.";
  const reason = document.createElement("p"); reason.textContent = "The journal record is unavailable.";
  const retry = document.createElement("button"); retry.type = "button"; retry.textContent = "Retry";
  retry.addEventListener("click", async () => { article.replaceWith(loadingCard(entry.id)); const fresh = await data.getEntry(entry.id).catch((error) => ({ id: entry.id, status: "error", diagnostic: error.diagnostic })); document.querySelector(`.entry-card[data-id="${entry.id}"]`)?.replaceWith(fresh.status === "error" ? errorCard(fresh, slot) : entryCard(fresh)); });
  article.append(heading, reason, retry); return article;
}

function renderJournalMessage(message, kind) {
  const page = document.createElement("section"); page.className = `journal-page journal-message ${kind}`;
  const text = document.createElement("p"); text.textContent = message; page.append(text); pages.replaceChildren(page);
  if (state.mode === "spread") pages.append(createBlankPage());
}

function createBlankPage() { const page = document.createElement("section"); page.className = "journal-page blank-page"; page.setAttribute("aria-hidden", "true"); return page; }

function formatDate(value) { return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(value)); }

function updateNavigation() {
  previous.disabled = state.page <= 0 || state.turning;
  const lastVisible = state.mode === "spread" ? state.page + 1 : state.page;
  next.disabled = lastVisible >= data.pageCount - 1 || state.turning;
}

async function turn(direction) {
  if (state.turning || !data.pageCount) return;
  const step = state.mode === "spread" ? 2 : 1;
  const target = Math.max(0, Math.min(state.page + direction * step, Math.max(0, data.pageCount - 1)));
  const normalized = state.mode === "spread" ? target - target % 2 : target;
  if (normalized === state.page) return;
  state.turning = true; updateNavigation();
  const sourceSelector = direction > 0 ? ".journal-page:last-child" : ".journal-page:first-child";
  const source = pages.querySelector(sourceSelector);
  const clone = source?.cloneNode(true);
  if (clone) { clone.querySelectorAll("a,button").forEach((e) => e.removeAttribute("href")); clone.classList.add("turning-sheet", direction > 0 ? "turn-forward" : "turn-back"); turnLayer.replaceChildren(clone); }
  state.page = normalized;
  renderCurrent();
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !clone) {
    turnLayer.replaceChildren(); state.turning = false; updateNavigation(); return;
  }
  await new Promise((resolve) => setTimeout(resolve, PAGE_TURN_MS + 40));
  turnLayer.replaceChildren(); state.turning = false; updateNavigation();
}

function updateGeometry(initial = false) {
  const wide = innerWidth >= 1060;
  const mode = wide ? "spread" : "single";
  if (mode !== state.mode && !initial) {
    const anchorPage = state.page;
    state.mode = mode;
    state.page = mode === "spread" ? anchorPage - anchorPage % 2 : anchorPage;
    renderCurrent();
    return;
  }
  state.mode = mode;
  document.documentElement.dataset.mode = mode;
  const designWidth = mode === "spread" ? 1272 : 518;
  const available = Math.max(1, innerWidth - (mode === "spread" ? 72 : 24));
  state.baseScale = Math.max(mode === "spread" ? 0.76 : 0.72, Math.min(1, available / designWidth));
  const scale = state.baseScale * state.zoom;
  const designHeight = 900;
  sceneSpace.style.setProperty("--scene-width", `${Math.max(innerWidth, designWidth * scale + (mode === "spread" ? 72 : 24))}px`);
  sceneSpace.style.setProperty("--scene-height", `${designHeight * scale + 150}px`);
  scene.style.setProperty("--camera-scale", scale);
  scene.style.setProperty("--pan-x", `${state.panX}px`);
  scene.style.setProperty("--pan-y", `${state.panY}px`);
  scene.dataset.zoomedOut = state.zoom <= 0.82 ? "true" : "false";
  clampPan();
  requestAnimationFrame(() => {
    if (initial || mode === "single") viewport.scrollLeft = Math.max(0, (viewport.scrollWidth - viewport.clientWidth) / 2);
  });
}

function clampPan() {
  const scaledWidth = (state.mode === "spread" ? 1272 : 518) * state.baseScale * state.zoom;
  const scaledHeight = 900 * state.baseScale * state.zoom;
  const maxX = Math.max(40, (scaledWidth - innerWidth) / 2 + innerWidth * 0.35);
  const maxY = Math.max(50, (scaledHeight - innerHeight) / 2 + innerHeight * 0.3);
  state.panX = Math.max(-maxX, Math.min(maxX, state.panX));
  state.panY = Math.max(-maxY, Math.min(maxY, state.panY));
  scene.style.setProperty("--pan-x", `${state.panX}px`); scene.style.setProperty("--pan-y", `${state.panY}px`);
}

function installInteractions() {
  previous.addEventListener("click", () => turn(-1)); next.addEventListener("click", () => turn(1));
  addEventListener("keydown", (event) => {
    if (event.target.matches("input,textarea,select")) return;
    if (event.key === "ArrowRight" || event.key === "PageDown") { event.preventDefault(); turn(1); }
    if (event.key === "ArrowLeft" || event.key === "PageUp") { event.preventDefault(); turn(-1); }
  });
  viewport.addEventListener("wheel", (event) => {
    if (!(event.ctrlKey || event.metaKey)) return;
    event.preventDefault();
    state.zoom = Math.max(CAMERA.min, Math.min(CAMERA.max, state.zoom + (event.deltaY < 0 ? CAMERA.step : -CAMERA.step)));
    updateGeometry();
  }, { passive: false });
  viewport.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch" || event.button !== 0 || event.target.closest("button.page-edge")) return;
    state.pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, panX: state.panX, panY: state.panY, moved: false, link: event.target.closest("a.entry-card") };
    viewport.setPointerCapture(event.pointerId);
  });
  viewport.addEventListener("pointermove", (event) => {
    const pointer = state.pointer; if (!pointer || pointer.id !== event.pointerId) return;
    const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
    if (!pointer.moved && Math.hypot(dx, dy) < 7) return;
    pointer.moved = true; viewport.classList.add("is-panning");
    state.panX = pointer.panX + dx; state.panY = pointer.panY + dy; clampPan();
  });
  const finishPointer = (event) => {
    if (!state.pointer || state.pointer.id !== event.pointerId) return;
    if (state.pointer.moved && state.pointer.link) state.pointer.link.dataset.dragSuppressed = "true";
    state.pointer = null; viewport.classList.remove("is-panning");
  };
  viewport.addEventListener("pointerup", finishPointer); viewport.addEventListener("pointercancel", finishPointer);
  viewport.addEventListener("touchstart", onTouchStart, { passive: true });
  viewport.addEventListener("touchmove", onTouchMove, { passive: false });
  viewport.addEventListener("touchend", onTouchEnd, { passive: true });
  addEventListener("resize", () => updateGeometry());
  document.addEventListener("visibilitychange", async () => {
    if (document.hidden) { state.hiddenAt = Date.now(); return; }
    if (state.hiddenAt && Date.now() - state.hiddenAt >= 3_600_000) {
      const anchor = data.manifest[state.page * 6]; const refresh = await data.loadManifest().catch(() => null);
      if (refresh?.changed) { const index = data.manifest.indexOf(anchor); if (index >= 0) state.page = Math.floor(index / 6); renderCurrent(); }
    }
  });
}

function onTouchStart(event) {
  if (event.touches.length === 1) state.touch = { mode: "pending", x: event.touches[0].clientX, y: event.touches[0].clientY, lastX: event.touches[0].clientX, lastY: event.touches[0].clientY, time: Date.now(), edgeIntent: event.touches[0].clientX < 44 || event.touches[0].clientX > innerWidth - 44 };
  if (event.touches.length === 2) {
    const distance = touchDistance(event.touches); state.touch = { mode: "pinch", distance, zoom: state.zoom };
  }
}
function onTouchMove(event) {
  if (!state.touch) return;
  if (event.touches.length === 2 && state.touch.mode === "pinch") {
    event.preventDefault(); state.zoom = Math.max(CAMERA.min, Math.min(CAMERA.max, state.touch.zoom * touchDistance(event.touches) / state.touch.distance)); updateGeometry(); return;
  }
  if (event.touches.length !== 1 || state.touch.mode === "pinch") return;
  const touch = event.touches[0], dx = touch.clientX - state.touch.x, dy = touch.clientY - state.touch.y;
  if (state.touch.mode === "pending" && Math.hypot(dx, dy) > 10) state.touch.mode = Math.abs(dx) > Math.abs(dy) * 1.35 ? "horizontal" : "vertical";
  if (state.touch.mode === "horizontal" && state.zoom > 1.02 && !state.touch.edgeIntent) { event.preventDefault(); state.panX += touch.clientX - state.touch.lastX; state.panY += touch.clientY - state.touch.lastY; clampPan(); }
  state.touch.lastX = touch.clientX; state.touch.lastY = touch.clientY;
}
function onTouchEnd() {
  if (state.touch?.mode === "horizontal" && (state.zoom <= 1.02 || state.touch.edgeIntent)) {
    const dx = state.touch.lastX - state.touch.x;
    if (Math.abs(dx) > 55 && Date.now() - state.touch.time < 800) turn(dx < 0 ? 1 : -1);
  }
  state.touch = null;
}
function touchDistance(touches) { return Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY); }

```

## File content `assets\data.js`:

```js
import { CACHE_TTL_MS, FETCH_TIMEOUT_MS, MAX_RECORD_REQUESTS } from "../shared/constants.js";
import { isValidId, pageRange, parseManifest, parseTargetUrl } from "../shared/core.js";
import { createDiagnostic, createLogger } from "../shared/diagnostics.js";

const PREFIX = "lnk-journal:";
const CACHE_VERSION = "1";

export class JournalData extends EventTarget {
  constructor({ debug = new URLSearchParams(location.search).has("debug") } = {}) {
    super();
    this.sessionId = `journal-${Math.random().toString(36).slice(2, 8)}`;
    this.logger = createLogger({ debug, correlationLabel: "Session", correlationId: this.sessionId });
    this.manifest = [];
    this.memory = new Map();
    this.inFlight = new Map();
    this.queue = [];
    this.active = 0;
    this.storage = this.#initStorage();
    this.lastManifestAt = 0;
    this.generation = 0;
  }

  #initStorage() {
    try {
      const storage = globalThis.localStorage;
      const current = storage.getItem(`${PREFIX}cache-version`);
      if (current !== CACHE_VERSION) {
        for (let index = storage.length - 1; index >= 0; index -= 1) {
          const key = storage.key(index);
          if (key?.startsWith(PREFIX)) storage.removeItem(key);
        }
        storage.setItem(`${PREFIX}cache-version`, CACHE_VERSION);
      }
      return storage;
    } catch (error) {
      this.logger.warn("cache", `Persistent journal cache is unavailable. Reason: ${error.name || error.message}. Fallback: in-memory cache for this session.`);
      return null;
    }
  }

  async loadManifest() {
    const started = performance.now();
    const url = new URL("links.txt", document.baseURI);
    let response;
    try {
      response = await timedFetch(url, { cache: "no-cache" });
    } catch (cause) {
      throw this.#error("MANIFEST_FETCH_FAILED", "manifest", "manifest fetch", "Manifest request failed", cause.name === "AbortError" ? "The request timed out after 15 seconds." : "The network request failed.", { URL: url.href }, cause);
    }
    if (!response.ok) throw this.#error("MANIFEST_FETCH_FAILED", "manifest", "manifest fetch", "Manifest request failed", `The server returned HTTP ${response.status}.`, { URL: url.href, "HTTP status": response.status });
    let ids;
    try { ids = parseManifest(await response.text()); }
    catch (cause) { throw this.#error(cause.code || "MANIFEST_INVALID", "manifest", "manifest validation", "Published manifest is invalid", cause.message, cause.context || {}, cause); }
    const previous = this.manifest;
    this.manifest = ids;
    this.generation += 1;
    this.lastManifestAt = Date.now();
    this.#removeDeletedCache(ids);
    this.logger.info("journal", `Journal manifest loaded: ${ids.length} link${ids.length === 1 ? "" : "s"}.`);
    this.logger.debug("journal", `Manifest fetch and parse: ${Math.round(performance.now() - started)}ms; generation=${this.generation}`);
    return { ids, changed: previous.join("\n") !== ids.join("\n"), previous };
  }

  get pageCount() { return this.manifest.length ? Math.ceil(this.manifest.length / 6) : 0; }

  pageIds(pageIndex) {
    const { start, end } = pageRange(pageIndex, this.manifest.length);
    return this.manifest.slice(start, end);
  }

  getPage(pageIndex, priority = "visible") {
    return this.pageIds(pageIndex).map((id, offset) => ({
      id,
      index: pageIndex * 6 + offset,
      promise: this.getEntry(id, priority).catch((error) => ({ id, status: "error", diagnostic: error.diagnostic || error }))
    }));
  }

  async getEntry(id, priority = "visible") {
    if (!isValidId(id) || !this.manifest.includes(id)) throw new Error(`Entry ${id} is not in the current manifest.`);
    const memory = this.memory.get(id);
    if (memory && isFresh(memory.cachedAt)) return { ...memory, status: "ready", source: "memory" };
    const cached = this.#readCache(id);
    if (cached && isFresh(cached.cachedAt)) {
      this.memory.set(id, cached);
      return { ...cached, status: "ready", source: "cache" };
    }
    if (this.inFlight.has(id)) return this.inFlight.get(id);
    const pending = this.#enqueue(() => this.#fetchEntry(id, cached), priority).finally(() => this.inFlight.delete(id));
    this.inFlight.set(id, pending);
    return pending;
  }

  prefetch(pageIndexes) {
    for (const page of pageIndexes) {
      if (page < 0 || page >= this.pageCount) continue;
      this.getPage(page, "prefetch").forEach(({ promise }) => promise.catch(() => {}));
    }
  }

  async #fetchEntry(id, stale) {
    const url = new URL(`lnk/${id}/index.html`, document.baseURI);
    const started = performance.now();
    let staleEligible = false;
    try {
      let response;
      for (let attempt = 1; attempt <= 2; attempt += 1) {
        try {
          response = await timedFetch(url);
          if (response.ok) break;
          if (response.status !== 503 || attempt === 2) break;
        } catch (error) {
          if (attempt === 2) { staleEligible = true; throw error; }
        }
        this.logger.debug("record", `Retrying entry ${id}: attempt=2 reason=transient failure`);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      if (!response?.ok) {
        staleEligible = Boolean(response && response.status >= 500);
        throw new Error(response ? `The server returned HTTP ${response.status}.` : "The network request failed.");
      }
      const entry = parseRecord(await response.text(), id, url);
      entry.cachedAt = Date.now();
      this.memory.set(id, entry);
      this.#writeCache(id, entry);
      this.logger.debug("record", `Resolved ${id}: source=network durationMs=${Math.round(performance.now() - started)}`);
      return { ...entry, status: "ready", source: "network" };
    } catch (cause) {
      if (staleEligible && stale && validateCached(stale, id) && this.manifest.includes(id)) {
        this.logger.warn("cache", `Using stale entry after network failure. ID: ${id}; cache age: ${Math.round((Date.now() - stale.cachedAt) / 60000)}m; reason: ${cause.message}`);
        return { ...stale, status: "stale", source: "stale-cache" };
      }
      throw this.#error("RECORD_FETCH_FAILED", "record", "record fetch", "Journal record request failed", cause.message, { ID: id, URL: url.href }, cause);
    }
  }

  #enqueue(task, priority) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject, rank: priority === "visible" ? 0 : priority === "adjacent" ? 1 : 2 });
      this.queue.sort((a, b) => a.rank - b.rank);
      this.#drain();
    });
  }

  #drain() {
    while (this.active < MAX_RECORD_REQUESTS && this.queue.length) {
      const item = this.queue.shift();
      this.active += 1;
      item.task().then(item.resolve, item.reject).finally(() => { this.active -= 1; this.#drain(); });
    }
  }

  #readCache(id) {
    if (!this.storage) return null;
    const key = `${PREFIX}entry:${id}`;
    try {
      const value = this.storage.getItem(key);
      if (!value) return null;
      const parsed = JSON.parse(value);
      if (!validateCached(parsed, id)) throw new Error("Cached value failed structural validation.");
      return parsed;
    } catch (error) {
      this.logger.warn("cache", `Invalid cached entry was discarded. ID: ${id}; cache key: ${key}; reason: ${error.message}`);
      try { this.storage.removeItem(key); } catch {}
      return null;
    }
  }

  #writeCache(id, entry) {
    if (!this.storage) return;
    try { this.storage.setItem(`${PREFIX}entry:${id}`, JSON.stringify(entry)); }
    catch (error) {
      this.logger.warn("cache", `Cache write failed for ${id}: ${error.message}. Continuing with in-memory cache.`);
      this.storage = null;
    }
  }

  #removeDeletedCache(ids) {
    if (!this.storage) return;
    const active = new Set(ids);
    try {
      for (let index = this.storage.length - 1; index >= 0; index -= 1) {
        const key = this.storage.key(index);
        if (key?.startsWith(`${PREFIX}entry:`) && !active.has(key.slice(`${PREFIX}entry:`.length))) this.storage.removeItem(key);
      }
    } catch (error) { this.logger.warn("cache", `Expired cache cleanup failed: ${error.message}`); }
  }

  #error(code, module, stage, summary, reason, context, cause) {
    const diagnostic = createDiagnostic({ code, module, stage, summary, reason, context, cause, userVisible: true });
    this.logger.error(diagnostic);
    const error = new Error(reason, { cause }); error.diagnostic = diagnostic; return error;
  }
}

export function isFresh(cachedAt) {
  const age = Date.now() - cachedAt;
  return Number.isFinite(age) && age >= -60_000 && age < CACHE_TTL_MS;
}

function validateCached(value, id) {
  return value && value.id === id && Number.isFinite(value.cachedAt) && typeof value.title === "string" && typeof value.description === "string" && typeof value.targetUrl === "string" && typeof value.previewUrl === "string" && typeof value.createdAt === "string";
}

async function timedFetch(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try { return await fetch(url, { ...options, signal: controller.signal }); }
  finally { clearTimeout(timeout); }
}

export function parseRecord(html, expectedId, recordUrl) {
  const documentRecord = new DOMParser().parseFromString(html, "text/html");
  const meta = (selector) => documentRecord.querySelector(selector)?.getAttribute("content")?.trim() || "";
  const id = meta('meta[name="lnk:id"]');
  if (id !== expectedId) throw new Error(`Record identity mismatch: expected ${expectedId}, observed ${id || "missing"}.`);
  const targetUrl = parseTargetUrl(meta('meta[name="lnk:target"]'));
  const createdAt = meta('meta[name="lnk:created"]');
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(createdAt) || Number.isNaN(Date.parse(createdAt))) throw new Error("Required metadata lnk:created is invalid.");
  const title = documentRecord.querySelector("title")?.textContent?.trim() || "";
  const description = meta('meta[name="description"]');
  const previewSource = meta('meta[property="og:image"]');
  if (!title || !description || !previewSource) throw new Error("Required title, description, or og:image metadata is missing.");
  const previewUrl = new URL(previewSource, recordUrl);
  const expectedPreview = new URL(`preview.jpg`, recordUrl);
  if (previewUrl.origin !== location.origin || previewUrl.pathname !== expectedPreview.pathname) throw new Error("Record preview does not resolve to its project-owned preview.jpg.");
  return { id, targetUrl, createdAt, title, description, previewUrl: previewUrl.href, shortUrl: new URL(`./`, recordUrl).href };
}

```

## File content `assets\journal.css`:

```css
:root {
  color-scheme: dark;
  --page-width: 618px;
  --page-height: 844px;
  --page-gap: 14px;
  --page-padding-x: 45px;
  --page-padding-top: 30px;
  --page-padding-bottom: 36px;
  --grid-gap-x: 18px;
  --grid-gap-y: 14px;
  --turn-duration: 460ms;
  --paper: #ead9b3;
  --paper-light: #f3e6c8;
  --paper-ink: #33251a;
  --leather: #2c160d;
}

* { box-sizing: border-box; }
html, body { min-height: 100%; margin: 0; }
body { overflow: hidden; background: #0c100f; color: var(--paper-ink); font-family: Georgia, "Times New Roman", serif; }
button, a { font: inherit; }
button { color: inherit; }

.viewport {
  position: fixed;
  inset: 0;
  overflow: auto;
  overscroll-behavior: contain;
  cursor: grab;
  background:
    radial-gradient(ellipse at 50% 32%, rgba(68, 57, 42, .25), transparent 56%),
    repeating-linear-gradient(92deg, rgba(136, 91, 49, .026) 0 1px, transparent 1px 13px),
    repeating-linear-gradient(88deg, rgba(0, 0, 0, .11) 0 2px, transparent 2px 21px),
    linear-gradient(103deg, #0a0d0d, #171a18 44%, #0c100f 100%);
  scrollbar-color: rgba(181, 143, 87, .33) transparent;
}
.viewport.is-panning { cursor: grabbing; user-select: none; }
.desk-grain { position: fixed; inset: 0; pointer-events: none; opacity: .32; mix-blend-mode: soft-light; background: repeating-radial-gradient(ellipse at 20% 30%, transparent 0 9px, rgba(220,160,95,.12) 10px, transparent 11px 28px); }
.zoom-hint { position: fixed; z-index: 2; top: 18px; left: 50%; transform: translateX(-50%); color: rgba(224, 202, 163, .55); font: 11px/1.2 ui-monospace, Consolas, monospace; letter-spacing: .12em; text-transform: uppercase; pointer-events: none; text-shadow: 0 1px 1px #000; }
.pen { position: fixed; z-index: 1; width: 310px; height: 18px; left: -74px; bottom: 18px; transform: rotate(43deg); border-radius: 12px; opacity: 0; transition: opacity .25s; pointer-events: none; background: linear-gradient(#080909, #292623 35%, #050606 72%, #171614); box-shadow: 0 8px 12px rgba(0,0,0,.55), inset 0 1px #82653d; }
.pen::after { content: ""; position: absolute; right: -48px; top: 3px; border-left: 52px solid #9f7a41; border-top: 6px solid transparent; border-bottom: 6px solid transparent; filter: drop-shadow(2px 3px 2px #000); }
.pen span { position: absolute; right: 32px; inset-block: 0; width: 9px; background: #a98143; box-shadow: inset 1px 0 #e0b66c; }

.scene-space { --scene-width: 1372px; --scene-height: 1050px; position: relative; min-width: 100%; width: var(--scene-width); min-height: 100%; height: var(--scene-height); padding-top: 55px; }
.journal-scene { --camera-scale: 1; --pan-x: 0px; --pan-y: 0px; position: absolute; top: 55px; left: calc(50% - 636px); width: 1272px; height: 900px; transform-origin: center top; transform: translate(var(--pan-x), var(--pan-y)) scale(var(--camera-scale)); will-change: transform; }
.journal-scene[data-zoomed-out="true"] ~ * {} 
.journal-scene[data-zoomed-out="true"] .journal-shadow { box-shadow: 0 45px 60px rgba(0,0,0,.75); }
.journal-scene[data-zoomed-out="true"] + .pen, .journal-scene[data-zoomed-out="true"] .pen { opacity: .9; }
html[data-mode="single"] .journal-scene { width: 518px; left: calc(50% - 259px); }
html[data-mode="single"] .zoom-hint, html[data-mode="single"] .pen { display: none; }
html[data-mode="single"] .scene-space { padding-top: 28px; }
html[data-mode="single"] .journal-scene { top: 28px; }

.journal-shadow { position: absolute; z-index: -2; inset: 18px 9px 22px; border-radius: 34px; box-shadow: 0 28px 42px rgba(0,0,0,.68); transition: box-shadow .2s; }
.leather-cover {
  position: absolute;
  inset: 0 0 32px;
  padding: 23px 18px 25px;
  border-radius: 31px 35px 30px 34px;
  background:
    radial-gradient(circle at 20% 30%, rgba(224,160,84,.08) 0 1px, transparent 2px) 0 0/9px 8px,
    repeating-linear-gradient(113deg, transparent 0 3px, rgba(255,255,255,.025) 4px, transparent 6px 13px),
    linear-gradient(112deg, #3f2112, #25120b 34%, #351b10 67%, #1e0e09);
  border: 2px solid #170a06;
  box-shadow:
    inset 0 0 0 5px #4f2a18,
    inset 0 0 0 7px rgba(214,145,70,.17),
    inset 0 0 26px 12px rgba(0,0,0,.68),
    0 9px 0 #130907,
    0 14px 18px rgba(0,0,0,.55);
}
.leather-cover::before { content: ""; position: absolute; inset: 12px; border: 1px dashed rgba(184,123,64,.4); border-radius: 23px; box-shadow: 0 0 0 1px rgba(0,0,0,.75); pointer-events: none; }
.leather-cover::after { content: ""; position: absolute; top: 13px; bottom: 12px; left: 50%; width: 16px; transform: translateX(-50%); background: linear-gradient(90deg, #160a06, #3f2114 42%, #512a18 50%, #28130b 62%, #110806); box-shadow: 0 0 9px rgba(0,0,0,.8); }

.book { position: relative; z-index: 2; display: flex; width: 100%; height: 100%; perspective: 2200px; }
.pages { display: flex; width: 100%; height: 100%; gap: var(--page-gap); }
.journal-page {
  position: relative;
  width: var(--page-width);
  height: var(--page-height);
  flex: 0 0 var(--page-width);
  padding: var(--page-padding-top) var(--page-padding-x) var(--page-padding-bottom);
  overflow: hidden;
  color: var(--paper-ink);
  background:
    radial-gradient(circle at 14% 22%, rgba(117,78,35,.06) 0 1px, transparent 2px) 0 0/12px 14px,
    radial-gradient(circle at 70% 53%, rgba(255,255,255,.26), transparent 50%),
    linear-gradient(102deg, #e2cda3, var(--paper-light) 8%, var(--paper) 88%, #d5bd8e);
  border: 1px solid #b59463;
  box-shadow: inset 0 0 0 2px rgba(255,251,225,.44), inset 0 0 0 7px rgba(124,83,37,.12), inset 0 0 26px rgba(91,51,19,.16), 0 3px 4px rgba(0,0,0,.35);
}
.journal-page::before { content: ""; position: absolute; inset: 14px; border: 1px solid rgba(117,77,34,.33); box-shadow: inset 0 0 0 3px rgba(138,94,47,.07); pointer-events: none; }
.journal-page:first-child { border-radius: 17px 5px 8px 16px; box-shadow: inset -22px 0 28px -24px rgba(50,25,10,.58), inset 0 0 0 2px rgba(255,251,225,.44), inset 0 0 0 7px rgba(124,83,37,.11), 0 3px 4px rgba(0,0,0,.35); }
.journal-page:last-child { border-radius: 5px 17px 16px 8px; box-shadow: inset 22px 0 28px -24px rgba(50,25,10,.58), inset 0 0 0 2px rgba(255,251,225,.44), inset 0 0 0 7px rgba(124,83,37,.11), 0 3px 4px rgba(0,0,0,.35); }
html[data-mode="single"] .journal-page { border-radius: 17px 17px 15px 15px; }
html[data-mode="single"] .journal-page { width: 500px; flex-basis: 500px; --page-padding-x: 34px; --grid-gap-x: 14px; }

.page-stack { position: absolute; z-index: 0; top: 21px; bottom: 20px; width: calc(50% - 7px); border-radius: 14px; background: repeating-linear-gradient(0deg, #c4ab7c 0 1px, #e4d0a7 1px 4px); box-shadow: 0 4px 2px rgba(0,0,0,.45); }
.page-stack-left { left: 19px; transform: translate(-4px, 5px); }
.page-stack-right { right: 19px; transform: translate(4px, 5px); }
html[data-mode="single"] .page-stack { width: calc(100% - 38px); }
html[data-mode="single"] .page-stack-left { display: none; }
.gutter { position: absolute; z-index: 5; pointer-events: none; top: 4px; bottom: 1px; left: 50%; width: 24px; transform: translateX(-50%); background: linear-gradient(90deg, rgba(49,24,11,.22), rgba(255,245,211,.2) 42%, rgba(53,25,11,.31) 56%, transparent); filter: blur(.4px); mix-blend-mode: multiply; }
html[data-mode="single"] .gutter { display: none; }
.bookmark { position: absolute; z-index: -1; bottom: -20px; left: 50%; width: 23px; height: 80px; transform: translateX(-50%); background: linear-gradient(90deg, #1b0c07, #562817 48%, #241008); clip-path: polygon(0 0,100% 0,100% 100%,50% 83%,0 100%); box-shadow: 3px 4px 5px #000; }

.page-header { height: 96px; display: grid; justify-items: center; align-content: start; position: relative; z-index: 1; }
.page-header h1 { margin: 0 0 8px; font-size: 31px; line-height: 1; letter-spacing: .13em; font-weight: 500; text-shadow: 0 1px rgba(255,255,255,.65); }
.ornament { display: flex; align-items: center; gap: 7px; height: 11px; color: #79562f; }
.ornament span { width: 72px; height: 1px; background: linear-gradient(90deg, transparent, #8a6237); }
.ornament span:last-child { background: linear-gradient(90deg, #8a6237, transparent); }
.ornament i { font-size: 7px; font-style: normal; }
.page-number { margin-top: 3px; font-size: 16px; letter-spacing: .025em; }

.entry-grid { position: relative; z-index: 1; height: calc(100% - 96px); display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-template-rows: repeat(3, minmax(0, 1fr)); gap: var(--grid-gap-y) var(--grid-gap-x); }
.entry-card, .entry-slot {
  min-width: 0;
  min-height: 0;
  position: relative;
  display: grid;
  grid-template-rows: auto minmax(38px, auto) 18px 17px;
  align-content: start;
  padding: 5px 5px 7px;
  border: 1px solid rgba(137,94,45,.37);
  border-radius: 7px 8px 6px 7px;
  color: inherit;
  text-decoration: none;
  background: rgba(249,237,208,.13);
  box-shadow: inset 0 0 8px rgba(120,78,31,.06);
  overflow: hidden;
}
.entry-card { cursor: pointer; transition: background .12s, border-color .12s, box-shadow .12s; }
.entry-card:hover { background: rgba(255,248,225,.27); border-color: rgba(105,65,28,.58); }
.entry-card:active { background: rgba(137,94,45,.12); }
.entry-card:focus-visible, .entry-card button:focus-visible, .page-edge:focus-visible { outline: 3px solid #694117; outline-offset: 2px; }
.empty-slot { border-color: transparent; background: transparent; box-shadow: none; }

.preview-frame, .preview-placeholder {
  width: 100%;
  aspect-ratio: 1200 / 630;
  overflow: hidden;
  border-radius: 4px;
  background: #cdbb96;
  box-shadow: inset 0 0 0 1px rgba(80,46,18,.32), inset 0 0 9px 2px rgba(86,47,15,.26), 0 1px 1px rgba(73,42,18,.18);
  position: relative;
}
.preview-frame::after { content: ""; position: absolute; inset: 0; pointer-events: none; box-shadow: inset 0 0 7px 2px rgba(110,73,31,.24), inset 0 0 0 1px rgba(104,68,30,.22); border-radius: inherit; mix-blend-mode: multiply; }
.preview-frame img { width: 100%; height: 100%; object-fit: cover; display: block; }
.preview-failed { display: grid; place-items: center; height: 100%; color: #735f43; font: 11px/1.2 ui-sans-serif, system-ui, sans-serif; }
.entry-card h2 { margin: 7px 2px 2px; min-height: 38px; max-height: 42px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; font-size: 16px; line-height: 1.16; font-weight: 500; letter-spacing: -.012em; }
.entry-host, .entry-card time { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font: 10.5px/1.35 ui-sans-serif, system-ui, -apple-system, sans-serif; color: #584835; }
.entry-host { margin: 2px 2px 0; padding-left: 17px; position: relative; }
.entry-host::before { content: ""; position: absolute; left: 0; top: 1px; width: 11px; height: 11px; border: 1px solid currentColor; border-radius: 50%; background: linear-gradient(90deg, transparent 43%, currentColor 45% 55%, transparent 57%), linear-gradient(0deg, transparent 43%, currentColor 45% 55%, transparent 57%); opacity: .72; }
.entry-card time { margin: 1px 2px 0; }
.cached-badge { position: absolute; top: 10px; right: 10px; padding: 2px 4px; border-radius: 2px; color: #f2e4c4; background: rgba(63,43,25,.84); font: 8px/1 ui-sans-serif, system-ui; text-transform: uppercase; letter-spacing: .08em; }

.is-loading { cursor: default; pointer-events: none; }
.preview-placeholder, .loading-line { background: rgba(111,83,48,.12); animation: breathe 2.2s ease-in-out infinite; }
.loading-line { height: 8px; margin: 9px 5px 0; border-radius: 8px; }
.loading-line.long { width: 82%; }
.loading-line.short { width: 48%; }
@keyframes breathe { 50% { opacity: .42; } }
.is-error { display: flex; flex-direction: column; justify-content: center; text-align: center; cursor: default; padding: 14px; }
.is-error h2 { margin: 0 0 7px; min-height: 0; max-height: none; font-size: 14px; }
.is-error p { margin: 0 0 12px; color: #6a563e; font: 11px/1.35 ui-sans-serif, system-ui, sans-serif; }
.is-error button { align-self: center; min-width: 62px; min-height: 30px; border: 1px solid #89633b; border-radius: 3px; background: rgba(255,248,227,.42); cursor: pointer; font: 11px ui-sans-serif, system-ui; }
.empty-message { grid-column: 1 / -1; grid-row: 1 / -1; align-self: center; justify-self: center; font-size: 20px; font-style: italic; color: #6e573a; }
.journal-message { display: grid; place-items: center; text-align: center; }
.journal-message p { max-width: 370px; white-space: pre-line; font-size: 20px; line-height: 1.5; }

.page-edge { position: absolute; z-index: 20; top: 37%; width: 38px; height: 132px; border: 0; opacity: .12; cursor: pointer; display: grid; place-items: center; color: #f1d8a9; background: linear-gradient(90deg, rgba(0,0,0,.45), transparent); transition: opacity .15s; }
.page-edge:hover:not(:disabled), .page-edge:focus-visible { opacity: .72; }
.page-edge:disabled { opacity: 0; pointer-events: none; }
.page-edge span { font: 40px/1 Georgia, serif; text-shadow: 0 2px 3px #000; }
.page-edge-back { left: 2px; border-radius: 18px 0 0 18px; }
.page-edge-forward { right: 2px; border-radius: 0 18px 18px 0; background: linear-gradient(-90deg, rgba(0,0,0,.45), transparent); }

.turn-layer { position: absolute; z-index: 10; inset: 0; pointer-events: none; perspective: 2200px; transform-style: preserve-3d; }
.turning-sheet { position: absolute; top: 0; backface-visibility: visible; transform-style: preserve-3d; will-change: transform; }
.turning-sheet::after { content: ""; position: absolute; inset: 0; border-radius: inherit; background: linear-gradient(90deg, rgba(56,28,11,.28), transparent 28%, rgba(255,248,221,.18) 70%, rgba(55,27,12,.2)); opacity: 0; animation: turn-shadow var(--turn-duration) ease-in-out; pointer-events: none; }
.turn-forward { left: calc(50% + var(--page-gap) / 2); transform-origin: left center; animation: turn-forward var(--turn-duration) cubic-bezier(.42,.04,.3,1) both; }
.turn-back { right: calc(50% + var(--page-gap) / 2); transform-origin: right center; animation: turn-back var(--turn-duration) cubic-bezier(.42,.04,.3,1) both; }
@keyframes turn-forward { 0% { transform: rotateY(0); box-shadow: -2px 3px 4px rgba(0,0,0,.2); } 48% { box-shadow: -28px 12px 30px rgba(0,0,0,.36); } 100% { transform: rotateY(-180deg); box-shadow: -3px 2px 5px rgba(0,0,0,.18); } }
@keyframes turn-back { 0% { transform: rotateY(0); box-shadow: 2px 3px 4px rgba(0,0,0,.2); } 48% { box-shadow: 28px 12px 30px rgba(0,0,0,.36); } 100% { transform: rotateY(180deg); box-shadow: 3px 2px 5px rgba(0,0,0,.18); } }
@keyframes turn-shadow { 0%,100% { opacity: 0; } 48% { opacity: 1; } }

@media (max-width: 1059px) {
  .leather-cover { padding-inline: 9px; }
  .pages { justify-content: center; }
  .page-stack-right { right: 9px; }
  .page-edge { width: 32px; }
  .journal-page:first-child, .journal-page:last-child { box-shadow: inset 0 0 0 2px rgba(255,251,225,.44), inset 0 0 0 7px rgba(124,83,37,.11), inset 0 0 26px rgba(91,51,19,.16), 0 3px 4px rgba(0,0,0,.35); }
  .turn-forward, .turn-back { left: 9px; right: auto; transform-origin: left center; }
  .turn-back { transform-origin: right center; }
}

@media (max-height: 760px) and (min-width: 1060px) { .scene-space { padding-top: 38px; } .journal-scene { top: 38px; } }
@media (max-width: 700px) {
  .zoom-hint, .pen { display: none; }
  .scene-space { padding-top: max(18px, env(safe-area-inset-top)); }
  .journal-scene { top: max(18px, env(safe-area-inset-top)); }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .001ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; transition-duration: .001ms !important; }
}

```

## File content `index.html`:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#15110e">
  <title>Link Journal</title>
  <meta name="description" content="A visual journal of saved links.">
  <link rel="stylesheet" href="assets/journal.css">
  <script type="module" src="assets/app.js"></script>
</head>
<body>
  <main class="viewport" id="viewport" aria-label="Link Journal">
    <div class="desk-grain" aria-hidden="true"></div>
    <div class="zoom-hint" aria-hidden="true">Ctrl + wheel to zoom</div>
    <div class="pen" aria-hidden="true"><span></span></div>
    <div class="scene-space" id="scene-space">
      <section class="journal-scene" id="journal-scene" aria-live="polite">
        <div class="journal-shadow" aria-hidden="true"></div>
        <div class="leather-cover">
          <div class="page-stack page-stack-left" aria-hidden="true"></div>
          <div class="page-stack page-stack-right" aria-hidden="true"></div>
          <div class="book" id="book">
            <div class="pages" id="pages"></div>
            <div class="gutter" aria-hidden="true"></div>
            <div class="turn-layer" id="turn-layer" aria-hidden="true"></div>
          </div>
          <button class="page-edge page-edge-back" id="previous-page" type="button" aria-label="Turn to newer links" disabled><span aria-hidden="true">â€¹</span></button>
          <button class="page-edge page-edge-forward" id="next-page" type="button" aria-label="Turn to older links" disabled><span aria-hidden="true">â€º</span></button>
        </div>
        <div class="bookmark" aria-hidden="true"></div>
      </section>
    </div>
  </main>
  <noscript>This journal requires JavaScript to read its static link records.</noscript>
</body>
</html>

```

## File content `link-journal.config.json`:

```json
{
  "siteBase": "https://toys.awwtools.com/public/2026-08-16-link-shortener-and-journal/"
}

```

## File content `links.txt`:

```txt
RiHYkSyB
brNImVwm
l5HKSE5S
ywdg5MTD
zy1zb2vS
abMSazTW
D4BdbvPe
dT33NSj0
5A3Ed5GO
ERFdsysh
4gCarQzh
VpqqULd6
S16lcwel

```

## File content `lnk\4gCarQzh\index.html`:

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="lnk:id" content="4gCarQzh">
<meta name="lnk:target" content="https://blog.gaborkoos.com/posts/2026-07-19-Beyond-Happy-Path-Engineering-Time/">
<meta name="lnk:created" content="2026-08-16T22:31:51Z">
<title>Beyond Happy Path Engineering: Time</title>
<meta name="description" content="Time is where application code meets uncertainty: clock skew, wall-clock corrections, ambiguous ordering, late schedulers, and business-calendar boundaries">
<meta property="og:title" content="Beyond Happy Path Engineering: Time">
<meta property="og:description" content="Time is where application code meets uncertainty: clock skew, wall-clock corrections, ambiguous ordering, late schedulers, and business-calendar boundaries">
<meta property="og:image" content="https://toys.awwtools.com/public/2026-08-16-link-shortener-and-journal/lnk/4gCarQzh/preview.jpg">
<meta property="og:url" content="https://toys.awwtools.com/public/2026-08-16-link-shortener-and-journal/lnk/4gCarQzh/">
<meta property="og:type" content="website">
<meta http-equiv="refresh" content="0; url=https://blog.gaborkoos.com/posts/2026-07-19-Beyond-Happy-Path-Engineering-Time/">
<script>location.replace("https://blog.gaborkoos.com/posts/2026-07-19-Beyond-Happy-Path-Engineering-Time/")</script>
</head>
<body>
<p>Redirecting to the original page.</p>
<p><a href="https://blog.gaborkoos.com/posts/2026-07-19-Beyond-Happy-Path-Engineering-Time/">Continue to the original page</a></p>
</body>
</html>

```

## File content `lnk\5A3Ed5GO\index.html`:

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="lnk:id" content="5A3Ed5GO">
<meta name="lnk:target" content="https://github.com/liquidslr/system-design-notes">
<meta name="lnk:created" content="2026-08-16T22:34:00Z">
<title>GitHub - liquidslr system-design-notes: Notes of the book System Desgin Interview - An Insider&#39;s Guide</title>
<meta name="description" content="Notes of the book System Desgin Interview - An Insider&#39;s Guide - liquidslr system-design-notes">
<meta property="og:title" content="GitHub - liquidslr system-design-notes: Notes of the book System Desgin Interview - An Insider&#39;s Guide">
<meta property="og:description" content="Notes of the book System Desgin Interview - An Insider&#39;s Guide - liquidslr system-design-notes">
<meta property="og:image" content="https://toys.awwtools.com/public/2026-08-16-link-shortener-and-journal/lnk/5A3Ed5GO/preview.jpg">
<meta property="og:url" content="https://toys.awwtools.com/public/2026-08-16-link-shortener-and-journal/lnk/5A3Ed5GO/">
<meta property="og:type" content="website">
<meta http-equiv="refresh" content="0; url=https://github.com/liquidslr/system-design-notes">
<script>location.replace("https://github.com/liquidslr/system-design-notes")</script>
</head>
<body>
<p>Redirecting to the original page.</p>
<p><a href="https://github.com/liquidslr/system-design-notes">Continue to the original page</a></p>
</body>
</html>

```

## File content `lnk\abMSazTW\index.html`:

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="lnk:id" content="abMSazTW">
<meta name="lnk:target" content="https://github.com/pshenok/datacenter-survival">
<meta name="lnk:created" content="2026-08-16T22:36:54Z">
<title>GitHub - pshenok datacenter-survival: Build and run a datacenter: power chains, heat, cooling, PUE. Sister game of Server Survival the physical layer of the clo</title>
<meta name="description" content="Build and run a datacenter: power chains, heat, cooling, PUE. Sister game of Server Survival the physical layer of the cloud. - pshenok datacenter-survival">
<meta property="og:title" content="GitHub - pshenok datacenter-survival: Build and run a datacenter: power chains, heat, cooling, PUE. Sister game of Server Survival the physical layer of the clo">
<meta property="og:description" content="Build and run a datacenter: power chains, heat, cooling, PUE. Sister game of Server Survival the physical layer of the cloud. - pshenok datacenter-survival">
<meta property="og:image" content="https://toys.awwtools.com/public/2026-08-16-link-shortener-and-journal/lnk/abMSazTW/preview.jpg">
<meta property="og:url" content="https://toys.awwtools.com/public/2026-08-16-link-shortener-and-journal/lnk/abMSazTW/">
<meta property="og:type" content="website">
<meta http-equiv="refresh" content="0; url=https://github.com/pshenok/datacenter-survival">
<script>location.replace("https://github.com/pshenok/datacenter-survival")</script>
</head>
<body>
<p>Redirecting to the original page.</p>
<p><a href="https://github.com/pshenok/datacenter-survival">Continue to the original page</a></p>
</body>
</html>

```

## File content `lnk\brNImVwm\index.html`:

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="lnk:id" content="brNImVwm">
<meta name="lnk:target" content="https://zigbyexample.neocities.org/">
<meta name="lnk:created" content="2026-08-16T22:46:41Z">
<title>Zig by Example</title>
<meta name="description" content="Zig is a general-purpose programming language and toolchain for maintaining robust, optimal and reusable software. Please read the official documentation to learn more">
<meta property="og:title" content="Zig by Example">
<meta property="og:description" content="Zig is a general-purpose programming language and toolchain for maintaining robust, optimal and reusable software. Please read the official documentation to learn more">
<meta property="og:image" content="https://toys.awwtools.com/public/2026-08-16-link-shortener-and-journal/lnk/brNImVwm/preview.jpg">
<meta property="og:url" content="https://toys.awwtools.com/public/2026-08-16-link-shortener-and-journal/lnk/brNImVwm/">
<meta property="og:type" content="website">
<meta http-equiv="refresh" content="0; url=https://zigbyexample.neocities.org/">
<script>location.replace("https://zigbyexample.neocities.org/")</script>
</head>
<body>
<p>Redirecting to the original page.</p>
<p><a href="https://zigbyexample.neocities.org/">Continue to the original page</a></p>
</body>
</html>

```

## File content `lnk\D4BdbvPe\index.html`:

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="lnk:id" content="D4BdbvPe">
<meta name="lnk:target" content="https://blog.gingerbeardman.com/2026/08/06/lets-all-meet-up-in-the-y2k/">
<meta name="lnk:created" content="2026-08-16T22:36:03Z">
<title>Let s all meet up in the Y K I Get Info</title>
<meta name="description" content="Back in I posted a few of these on Twitter (thread reader) after digging out old photos from the dot-com boom. I was working in London at a digital agen">
<meta property="og:title" content="Let s all meet up in the Y K I Get Info">
<meta property="og:description" content="Back in I posted a few of these on Twitter (thread reader) after digging out old photos from the dot-com boom. I was working in London at a digital agen">
<meta property="og:image" content="https://toys.awwtools.com/public/2026-08-16-link-shortener-and-journal/lnk/D4BdbvPe/preview.jpg">
<meta property="og:url" content="https://toys.awwtools.com/public/2026-08-16-link-shortener-and-journal/lnk/D4BdbvPe/">
<meta property="og:type" content="website">
<meta http-equiv="refresh" content="0; url=https://blog.gingerbeardman.com/2026/08/06/lets-all-meet-up-in-the-y2k/">
<script>location.replace("https://blog.gingerbeardman.com/2026/08/06/lets-all-meet-up-in-the-y2k/")</script>
</head>
<body>
<p>Redirecting to the original page.</p>
<p><a href="https://blog.gingerbeardman.com/2026/08/06/lets-all-meet-up-in-the-y2k/">Continue to the original page</a></p>
</body>
</html>

```

## File content `lnk\dT33NSj0\index.html`:

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="lnk:id" content="dT33NSj0">
<meta name="lnk:target" content="https://laurentiugabriel.github.io/blog/articles/how-i-use-llms-to-learn/">
<meta name="lnk:created" content="2026-08-16T22:34:41Z">
<title>How I use LLMs to learn complex topics Laurentiu Raducu</title>
<meta name="description" content="LLMs are used for any things. Learning new things is one of the top use cases">
<meta property="og:title" content="How I use LLMs to learn complex topics Laurentiu Raducu">
<meta property="og:description" content="LLMs are used for any things. Learning new things is one of the top use cases">
<meta property="og:image" content="https://toys.awwtools.com/public/2026-08-16-link-shortener-and-journal/lnk/dT33NSj0/preview.jpg">
<meta property="og:url" content="https://toys.awwtools.com/public/2026-08-16-link-shortener-and-journal/lnk/dT33NSj0/">
<meta property="og:type" content="website">
<meta http-equiv="refresh" content="0; url=https://laurentiugabriel.github.io/blog/articles/how-i-use-llms-to-learn/">
<script>location.replace("https://laurentiugabriel.github.io/blog/articles/how-i-use-llms-to-learn/")</script>
</head>
<body>
<p>Redirecting to the original page.</p>
<p><a href="https://laurentiugabriel.github.io/blog/articles/how-i-use-llms-to-learn/">Continue to the original page</a></p>
</body>
</html>

```

## File content `lnk\ERFdsysh\index.html`:

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="lnk:id" content="ERFdsysh">
<meta name="lnk:target" content="https://iagoleal.com/posts/dynamic-programming/">
<meta name="lnk:created" content="2026-08-16T22:33:12Z">
<title>A Tale of Dynamic Programming</title>
<meta name="description" content="From parsing text to controling robots, dynamic programming is everywhere. Let s explore its workings, which problems it solves, and its algorithms">
<meta property="og:title" content="A Tale of Dynamic Programming">
<meta property="og:description" content="From parsing text to controling robots, dynamic programming is everywhere. Let s explore its workings, which problems it solves, and its algorithms">
<meta property="og:image" content="https://toys.awwtools.com/public/2026-08-16-link-shortener-and-journal/lnk/ERFdsysh/preview.jpg">
<meta property="og:url" content="https://toys.awwtools.com/public/2026-08-16-link-shortener-and-journal/lnk/ERFdsysh/">
<meta property="og:type" content="website">
<meta http-equiv="refresh" content="0; url=https://iagoleal.com/posts/dynamic-programming/">
<script>location.replace("https://iagoleal.com/posts/dynamic-programming/")</script>
</head>
<body>
<p>Redirecting to the original page.</p>
<p><a href="https://iagoleal.com/posts/dynamic-programming/">Continue to the original page</a></p>
</body>
</html>

```

## File content `lnk\l5HKSE5S\index.html`:

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="lnk:id" content="l5HKSE5S">
<meta name="lnk:target" content="https://mitchellh.com/writing/everyone-should-know-simd">
<meta name="lnk:created" content="2026-08-16T22:45:34Z">
<title>Everyone Should Know SIMD</title>
<meta name="description" content="SIMD has a reputation for being complex. I&#39;ve met many very good software engineers who dismiss it as something too complex to learn or a niche optimization meant for only the highest-performance software, not useful in everyday programming">
<meta property="og:title" content="Everyone Should Know SIMD">
<meta property="og:description" content="SIMD has a reputation for being complex. I&#39;ve met many very good software engineers who dismiss it as something too complex to learn or a niche optimization meant for only the highest-performance software, not useful in everyday programming">
<meta property="og:image" content="https://toys.awwtools.com/public/2026-08-16-link-shortener-and-journal/lnk/l5HKSE5S/preview.jpg">
<meta property="og:url" content="https://toys.awwtools.com/public/2026-08-16-link-shortener-and-journal/lnk/l5HKSE5S/">
<meta property="og:type" content="website">
<meta http-equiv="refresh" content="0; url=https://mitchellh.com/writing/everyone-should-know-simd">
<script>location.replace("https://mitchellh.com/writing/everyone-should-know-simd")</script>
</head>
<body>
<p>Redirecting to the original page.</p>
<p><a href="https://mitchellh.com/writing/everyone-should-know-simd">Continue to the original page</a></p>
</body>
</html>

```

## File content `lnk\RiHYkSyB\index.html`:

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="lnk:id" content="RiHYkSyB">
<meta name="lnk:target" content="https://martin.janiczek.cz/2026/07/24/systems-and-delays.html">
<meta name="lnk:created" content="2026-08-16T22:47:28Z">
<title>Systems and Delays</title>
<meta name="description" content="where delays are shown to be counterintuitive">
<meta property="og:title" content="Systems and Delays">
<meta property="og:description" content="where delays are shown to be counterintuitive">
<meta property="og:image" content="https://toys.awwtools.com/public/2026-08-16-link-shortener-and-journal/lnk/RiHYkSyB/preview.jpg">
<meta property="og:url" content="https://toys.awwtools.com/public/2026-08-16-link-shortener-and-journal/lnk/RiHYkSyB/">
<meta property="og:type" content="website">
<meta http-equiv="refresh" content="0; url=https://martin.janiczek.cz/2026/07/24/systems-and-delays.html">
<script>location.replace("https://martin.janiczek.cz/2026/07/24/systems-and-delays.html")</script>
</head>
<body>
<p>Redirecting to the original page.</p>
<p><a href="https://martin.janiczek.cz/2026/07/24/systems-and-delays.html">Continue to the original page</a></p>
</body>
</html>

```

## File content `lnk\S16lcwel\index.html`:

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="lnk:id" content="S16lcwel">
<meta name="lnk:target" content="https://toys.awwtools.com/">
<meta name="lnk:created" content="2026-08-16T22:30:50Z">
<title>Toys Index</title>
<meta name="description" content="You can clone all files locally and run index.html for the tool you want">
<meta property="og:title" content="Toys Index">
<meta property="og:description" content="You can clone all files locally and run index.html for the tool you want">
<meta property="og:image" content="https://toys.awwtools.com/public/2026-08-16-link-shortener-and-journal/lnk/S16lcwel/preview.jpg">
<meta property="og:url" content="https://toys.awwtools.com/public/2026-08-16-link-shortener-and-journal/lnk/S16lcwel/">
<meta property="og:type" content="website">
<meta http-equiv="refresh" content="0; url=https://toys.awwtools.com/">
<script>location.replace("https://toys.awwtools.com/")</script>
</head>
<body>
<p>Redirecting to the original page.</p>
<p><a href="https://toys.awwtools.com/">Continue to the original page</a></p>
</body>
</html>

```

## File content `lnk\VpqqULd6\index.html`:

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="lnk:id" content="VpqqULd6">
<meta name="lnk:target" content="https://blog.zharii.com/blog">
<meta name="lnk:created" content="2026-08-16T22:31:19Z">
<title>Blog Dmytro Zharii</title>
<meta name="description" content="Blog">
<meta property="og:title" content="Blog Dmytro Zharii">
<meta property="og:description" content="Blog">
<meta property="og:image" content="https://toys.awwtools.com/public/2026-08-16-link-shortener-and-journal/lnk/VpqqULd6/preview.jpg">
<meta property="og:url" content="https://toys.awwtools.com/public/2026-08-16-link-shortener-and-journal/lnk/VpqqULd6/">
<meta property="og:type" content="website">
<meta http-equiv="refresh" content="0; url=https://blog.zharii.com/blog">
<script>location.replace("https://blog.zharii.com/blog")</script>
</head>
<body>
<p>Redirecting to the original page.</p>
<p><a href="https://blog.zharii.com/blog">Continue to the original page</a></p>
</body>
</html>

```

## File content `lnk\ywdg5MTD\index.html`:

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="lnk:id" content="ywdg5MTD">
<meta name="lnk:target" content="https://handwritten.blog/">
<meta name="lnk:created" content="2026-08-16T22:38:40Z">
<title>handwritten.blog blogs, but handwritten</title>
<meta name="description" content="Publish your handwriting on the web . Capture - Email a photo or upload a PDF. . Enhance - Draw real clickable links and add a transcript. . Publish - Share">
<meta property="og:title" content="handwritten.blog blogs, but handwritten">
<meta property="og:description" content="Publish your handwriting on the web . Capture - Email a photo or upload a PDF. . Enhance - Draw real clickable links and add a transcript. . Publish - Share">
<meta property="og:image" content="https://toys.awwtools.com/public/2026-08-16-link-shortener-and-journal/lnk/ywdg5MTD/preview.jpg">
<meta property="og:url" content="https://toys.awwtools.com/public/2026-08-16-link-shortener-and-journal/lnk/ywdg5MTD/">
<meta property="og:type" content="website">
<meta http-equiv="refresh" content="0; url=https://handwritten.blog/">
<script>location.replace("https://handwritten.blog/")</script>
</head>
<body>
<p>Redirecting to the original page.</p>
<p><a href="https://handwritten.blog/">Continue to the original page</a></p>
</body>
</html>

```

## File content `lnk\zy1zb2vS\index.html`:

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="lnk:id" content="zy1zb2vS">
<meta name="lnk:target" content="https://github.com/pshenok/server-survival">
<meta name="lnk:created" content="2026-08-16T22:37:08Z">
<title>GitHub - pshenok server-survival: Tower defense game that teaches cloud architecture. Build infrastructure, survive traffic, learn scaling</title>
<meta name="description" content="Tower defense game that teaches cloud architecture. Build infrastructure, survive traffic, learn scaling. - pshenok server-survival">
<meta property="og:title" content="GitHub - pshenok server-survival: Tower defense game that teaches cloud architecture. Build infrastructure, survive traffic, learn scaling">
<meta property="og:description" content="Tower defense game that teaches cloud architecture. Build infrastructure, survive traffic, learn scaling. - pshenok server-survival">
<meta property="og:image" content="https://toys.awwtools.com/public/2026-08-16-link-shortener-and-journal/lnk/zy1zb2vS/preview.jpg">
<meta property="og:url" content="https://toys.awwtools.com/public/2026-08-16-link-shortener-and-journal/lnk/zy1zb2vS/">
<meta property="og:type" content="website">
<meta http-equiv="refresh" content="0; url=https://github.com/pshenok/server-survival">
<script>location.replace("https://github.com/pshenok/server-survival")</script>
</head>
<body>
<p>Redirecting to the original page.</p>
<p><a href="https://github.com/pshenok/server-survival">Continue to the original page</a></p>
</body>
</html>

```

## File content `package.json`:

```json
{
  "name": "link-shortener-and-journal",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "description": "A static short-link archive and tactile visual journal for GitHub Pages.",
  "scripts": {
    "add-link": "node scripts/add-link.mjs",
    "validate": "node scripts/validate-repository.mjs",
    "test": "node --test tests/*.test.mjs",
    "test:browser": "playwright test",
    "serve": "node scripts/serve.mjs"
  },
  "dependencies": {
    "playwright": "1.62.1"
  },
  "devDependencies": {
    "@playwright/test": "1.62.1"
  },
  "engines": {
    "node": ">=22"
  }
}

```

## File content `playwright.config.js`:

```js
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "browser.test.js",
  timeout: 30_000,
  expect: { timeout: 8_000 },
  use: { baseURL: "http://127.0.0.1:4173", trace: "retain-on-failure", screenshot: "only-on-failure" },
  webServer: { command: "node tests/fixture-server.mjs", url: "http://127.0.0.1:4173", reuseExistingServer: false, timeout: 30_000 },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } } },
    { name: "mobile", use: { browserName: "chromium", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, userAgent: "LinkJournalMobileTest/1.0" } }
  ]
});

```

## File content `README.md`:

# Link Journal

Link Journal is a static URL shortener and visual archive designed for GitHub Pages. The repository is the database: each saved target becomes a small self-contained directory with redirect metadata and a recognizable JPEG clipping, while the root journal reads those records on demand.

There is no application server, runtime database, remote screenshot service, analytics service, or client framework.

## First-time setup

1. Install Node.js 22 or newer and run `npm install`.
2. Install the bundled Chromium browser with `npx playwright install chromium`.
3. Set `siteBase` in `link-journal.config.json` to the final public GitHub Pages directory. Keep the trailing slash or let the command normalize it.

Example:

```json
{
  "siteBase": "https://example.github.io/link-journal/"
}
```

The example value is intentionally a placeholder. Configure it before creating records intended for publication, because it determines `og:url` and `og:image`.

## Add a link

```powershell
npm run add-link -- https://example.com/article
```

The command validates the repository and dependencies, checks for an existing serialized target, renders the page in a clean Playwright Chromium context, selects a deterministic 1200Ã—630 content region, writes a real JPEG at quality 90, generates crawler-readable redirect HTML, prepends the new ID to `links.txt`, and validates the committed result.

Successful generation is local only. The command never runs Git commands or deploys the site. Review the changed manifest and new `lnk/<id>/` directory, then commit and publish them through your normal workflow.

Enable detailed candidate, timing, path, and capture diagnostics with:

```powershell
$env:LINK_JOURNAL_DEBUG = '1'
npm run add-link -- https://example.com/article
```

## Repository format

```text
/
  index.html
  links.txt
  lnk/
    aB7kP2xQ/
      index.html
      preview.jpg
```

`links.txt` contains one eight-character ID per line, newest first. Each record directory contains exactly `index.html` and `preview.jpg`. The generated HTML exposes project metadata, Open Graph metadata, meta-refresh and JavaScript replacement redirects, plus a clickable fallback.

## Journal controls

- Mouse wheel or vertical trackpad gesture: scroll the scene.
- Ctrl + wheel (Command is also accepted): zoom the journal from 70% to 140%.
- Primary-button drag: pan after a movement threshold; dragging from a card suppresses link activation.
- Right Arrow or PageDown: move toward older links.
- Left Arrow or PageUp: move toward newer links.
- Mobile vertical gesture: scroll.
- Mobile pinch: zoom.
- Mobile horizontal swipe: turn a page; while zoomed, an interior horizontal gesture pans and an edge-originating swipe turns.

Wide readable viewports show two logical pages and advance by spreads. Constrained viewports show one page and advance one page at a time. The six-entry page boundary never changes.

## Validation

Run all deterministic checks:

```powershell
npm run validate
npm test
npm run test:browser
```

`npm run validate` inspects the actual manifest and record directories. Unit tests cover URL identity, manifest syntax, secure-ID boundaries, metadata sanitization, pagination, cache TTL, and static record generation. Browser tests use controlled fixtures to validate desktop/mobile composition, request bounds, cache reuse, responsive continuity, page navigation, animation state, zoom, touch intent, reduced motion, manifest failure, record failure, and preview failure.

Serve the current repository locally with:

```powershell
npm run serve
```

Then open `http://127.0.0.1:4173/`. Generated records whose configured public origin differs from localhost retain their configured absolute social metadata, as they should; the journal fixture suite supplies same-origin records for full local browser validation.

## Operational boundaries

- Only absolute `http:` and `https:` targets are accepted.
- Query order and fragments participate in duplicate identity.
- Target metadata is untrusted, sanitized, length-bounded, and HTML-escaped.
- Capture never logs browser profiles, cookies, authorization data, full DOM trees, or image bytes.
- Login walls, CAPTCHA and anti-bot challenges are reported rather than bypassed.
- Missing textual metadata uses fixed placeholders; missing useful visual content fails capture.
- At most six record documents are fetched concurrently, with nearby-only prefetch and a one-hour parsed-metadata cache.
- Manifest membership and order always override cached state.


## File content `scripts\add-link.mjs`:

```js
#!/usr/bin/env node
import { randomBytes } from "node:crypto";
import { access, cp, mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { chromium } from "playwright";
import { buildPublicUrls, generateRecordHtml, isoUtcSeconds, normalizeSiteBase, parseTargetUrl, randomId, sanitizeText } from "../shared/core.js";
import { createDiagnostic, createLogger, formatUserError } from "../shared/diagnostics.js";
import { capturePage } from "./capture.mjs";
import { validateJpeg } from "./jpeg.mjs";
import { ROOT, acquireLock, metaFromHtml, prependManifest, validateRepository } from "./repository.mjs";

const debug = process.env.DEBUG === "1" || process.env.LINK_JOURNAL_DEBUG === "1";
const operationId = `add-${randomBytes(4).toString("base64url").slice(0, 6)}`;
const logger = createLogger({ debug, correlationId: operationId });
let stage = "input validation";
let tempPath;
let browser;
let releaseLock;
let committedPath;
let mutationState = "none";

function fatal(diagnostic, fields = []) {
  const opening = diagnostic.module === "capture" ? "Sorry, I couldn't capture this page." : diagnostic.module === "repository" ? "Sorry, the link archive needs attention." : "Sorry, I couldn't add this link.";
  console.error(formatUserError(opening, diagnostic, fields));
  console.error("");
  logger.error(diagnostic);
}

async function uniqueId(recordsPath) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const id = randomId(randomBytes(16));
    try { await access(path.join(recordsPath, id)); }
    catch (error) { if (error.code === "ENOENT") return id; throw error; }
  }
  throw new Error("Unable to generate an unused short ID after 100 attempts.");
}

async function main() {
  const input = process.argv.slice(2);
  if (input.length !== 1) throw Object.assign(new Error("Exactly one target URL is required."), { code: "AUTHORING_INVALID_ARGUMENTS" });
  const targetUrl = parseTargetUrl(input[0]);
  logger.info("authoring", `Adding link: ${targetUrl}`);

  stage = "repository validation";
  let repository = await validateRepository(ROOT);
  logger.info("repository", `Repository validated: ${repository.ids.length} published link${repository.ids.length === 1 ? "" : "s"}.`);

  stage = "configuration validation";
  const configPath = path.join(ROOT, "link-journal.config.json");
  const config = JSON.parse(await readFile(configPath, "utf8"));
  const siteBase = normalizeSiteBase(config.siteBase);

  stage = "duplicate detection";
  if (repository.targets.has(targetUrl)) {
    const existingId = repository.targets.get(targetUrl);
    const { shortUrl } = buildPublicUrls(siteBase, existingId);
    const error = Object.assign(new Error("This target is already in the journal."), { code: "AUTHORING_DUPLICATE", context: { "Existing ID": existingId, "Short URL": shortUrl, Record: `lnk/${existingId}/` } });
    throw error;
  }

  stage = "dependency validation";
  const executable = chromium.executablePath();
  await access(executable, fsConstants.X_OK).catch(() => access(executable, fsConstants.R_OK));
  browser = await chromium.launch({ headless: true });
  logger.debug("authoring", `Chromium dependency available: ${executable}`);

  stage = "ID generation";
  let id = await uniqueId(repository.recordsPath);
  tempPath = await mkdir(path.join(tmpdir(), `link-journal-${operationId}`), { recursive: true }).then(() => path.join(tmpdir(), `link-journal-${operationId}`));
  const previewPath = path.join(tempPath, "preview.jpg");

  stage = "page capture";
  const capture = await capturePage({ browser, targetUrl, outputPath: previewPath, logger });
  await browser.close();
  browser = undefined;
  const title = sanitizeText(capture.metadata.title, "title");
  const description = sanitizeText(capture.metadata.description, "description");
  if (title === "(no title)") logger.warn("authoring", "Title contained no usable characters after sanitization; using (no title).");
  if (description === "(no description)") logger.warn("authoring", "Description contained no usable characters after sanitization; using (no description).");

  stage = "HTML generation";
  const createdAt = isoUtcSeconds();
  let publicUrls = buildPublicUrls(siteBase, id);
  await writeFile(path.join(tempPath, "index.html"), generateRecordHtml({ id, targetUrl, createdAt, title, description, ...publicUrls }), "utf8");

  stage = "record validation";
  await validateTemporaryRecord(tempPath, { id, targetUrl });

  stage = "record commit";
  releaseLock = await acquireLock(ROOT);
  repository = await validateRepository(ROOT);
  if (repository.targets.has(targetUrl)) {
    const existingId = repository.targets.get(targetUrl);
    throw Object.assign(new Error("Another authoring operation added this target before commit."), { code: "AUTHORING_DUPLICATE", context: { "Existing ID": existingId, Record: `lnk/${existingId}/` } });
  }
  while (true) {
    const destination = path.join(repository.recordsPath, id);
    try {
      await access(destination);
      id = await uniqueId(repository.recordsPath);
      publicUrls = buildPublicUrls(siteBase, id);
      await writeFile(path.join(tempPath, "index.html"), generateRecordHtml({ id, targetUrl, createdAt, title, description, ...publicUrls }), "utf8");
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      committedPath = destination;
      break;
    }
  }
  await rename(tempPath, committedPath);
  tempPath = undefined;
  mutationState = "record committed";

  stage = "manifest update";
  try {
    await prependManifest(repository.manifestPath, id, repository.ids);
    mutationState = "manifest committed";
  } catch (primary) {
    try {
      await rm(committedPath, { recursive: true });
      committedPath = undefined;
      mutationState = "rolled back";
    } catch (rollback) {
      const error = new Error(`Manifest update failed (${primary.message}); rollback also failed (${rollback.message}).`);
      error.code = "REPOSITORY_ROLLBACK_FAILED";
      error.context = { "Affected record": path.relative(ROOT, committedPath), "Repository state": "uncertain" };
      throw error;
    }
    const error = new Error(`Manifest update failed; the generated record was removed and repository state was restored. ${primary.message}`);
    error.code = "REPOSITORY_MANIFEST_WRITE_FAILED";
    error.context = { Rollback: "succeeded", "Repository state": "restored" };
    throw error;
  }

  stage = "post-write validation";
  const finalState = await validateRepository(ROOT);
  if (finalState.ids[0] !== id || finalState.ids.filter((value) => value === id).length !== 1) throw new Error("The new ID is not exactly once at the beginning of links.txt.");
  await releaseLock();
  releaseLock = undefined;
  logger.info("authoring", "Link added locally.");
  console.log(`\nTarget:\n  ${targetUrl}\n\nID:\n  ${id}\n\nShort URL:\n  ${publicUrls.shortUrl}\n\nRecord:\n  lnk/${id}/\n\nPreview:\n  lnk/${id}/preview.jpg\n\nThe generated files are local; review and publish them with your normal Git workflow.`);
}

async function validateTemporaryRecord(recordPath, expected) {
  const files = await Promise.all([stat(path.join(recordPath, "index.html")), stat(path.join(recordPath, "preview.jpg"))]);
  if (!files.every((item) => item.isFile())) throw new Error("Temporary record does not contain both required files.");
  await validateJpeg(path.join(recordPath, "preview.jpg"));
  const html = await readFile(path.join(recordPath, "index.html"), "utf8");
  if (metaFromHtml(html, "lnk:id") !== expected.id) throw new Error("Generated lnk:id does not match the record ID.");
  if (metaFromHtml(html, "lnk:target") !== expected.targetUrl) throw new Error("Generated lnk:target does not match the serialized input.");
  for (const name of ["lnk:created", "description"]) if (!metaFromHtml(html, name)) throw new Error(`Generated metadata ${name} is missing.`);
  for (const property of ["og:title", "og:description", "og:image", "og:url", "og:type"]) if (!metaFromHtml(html, property, true)) throw new Error(`Generated metadata ${property} is missing.`);
}

main().catch(async (cause) => {
  if (browser) await browser.close().catch(() => {});
  if (releaseLock) await releaseLock().catch(() => {});
  if (tempPath) await rm(tempPath, { recursive: true, force: true }).catch(() => {});
  const code = cause.code || (stage.includes("capture") || cause.stage ? "CAPTURE_FAILED" : stage.includes("repository") ? "REPOSITORY_INVALID" : "AUTHORING_FAILED");
  const diagnostic = createDiagnostic({
    code,
    module: code.startsWith("CAPTURE") ? "capture" : code.startsWith("REPOSITORY") ? "repository" : "authoring",
    stage: cause.stage || stage,
    summary: cause.code === "AUTHORING_DUPLICATE" ? "Duplicate target detected" : "Link operation failed",
    reason: cause.message,
    context: { ...(cause.context || {}), "Mutation state": mutationState },
    cause,
    userVisible: true
  });
  const fields = cause.code === "AUTHORING_DUPLICATE" ? [["Existing ID", cause.context?.["Existing ID"]], ["Record", cause.context?.Record], ["Short URL", cause.context?.["Short URL"]]] : [];
  fatal(diagnostic, fields.filter(([, value]) => value));
  if (!cause.code && cause.stack) console.error(`\nUnexpected stack:\n${cause.stack}`);
  process.exitCode = 1;
});

```

## File content `scripts\capture.mjs`:

```js
import { CAPTURE_SEARCH_HEIGHT, CAPTURE_VIEWPORT, MAX_CAPTURE_CANDIDATES, NAVIGATION_TIMEOUT_MS, PREVIEW_HEIGHT, PREVIEW_QUALITY, PREVIEW_WIDTH, STABILIZATION_BUDGET_MS } from "../shared/constants.js";
import { validateJpeg } from "./jpeg.mjs";

const now = () => performance.now();

export async function capturePage({ browser, targetUrl, outputPath, logger }) {
  const timings = {};
  const started = now();
  const context = await browser.newContext({
    viewport: CAPTURE_VIEWPORT,
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
    permissions: [],
    colorScheme: "light"
  });
  const page = await context.newPage();
  page.on("dialog", (dialog) => dialog.dismiss().catch(() => {}));
  context.on("page", (popup) => { if (popup !== page) popup.close().catch(() => {}); });
  try {
    logger.info("capture", `Opening target in Chromium: ${targetUrl}`);
    const navigationStart = now();
    const response = await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: NAVIGATION_TIMEOUT_MS });
    timings.navigation = now() - navigationStart;
    if (response && response.status() >= 400) {
      const error = new Error(`Target returned HTTP ${response.status()}.`);
      error.code = "CAPTURE_HTTP_ERROR";
      error.stage = "page navigation";
      throw error;
    }

    const stabilizeStart = now();
    await Promise.race([
      page.evaluate(async () => {
        await document.fonts?.ready.catch(() => {});
        const images = [...document.images].filter((image) => {
          const rect = image.getBoundingClientRect();
          return rect.top < innerHeight * 2 && rect.bottom > 0;
        }).slice(0, 24);
        await Promise.all(images.map((image) => image.complete ? null : new Promise((resolve) => {
          const done = () => resolve();
          image.addEventListener("load", done, { once: true });
          image.addEventListener("error", done, { once: true });
          setTimeout(done, 1800);
        })));
      }),
      new Promise((resolve) => setTimeout(resolve, STABILIZATION_BUDGET_MS))
    ]);
    await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}html{scrollbar-width:none!important}::-webkit-scrollbar{display:none!important}" });
    await page.evaluate(() => {
      document.querySelectorAll("video,audio").forEach((media) => media.pause());
    });
    timings.stabilization = now() - stabilizeStart;

    await handleOverlays(page, logger);
    const barrier = await detectBarrier(page);
    if (barrier) {
      const error = new Error(`The target rendered ${barrier} instead of accessible content.`);
      error.code = "CAPTURE_ACCESS_CHALLENGE";
      error.stage = "page readiness";
      throw error;
    }

    const metadata = await extractMetadata(page);
    logger.debug("capture", `Metadata title source: ${metadata.titleSource}; description source: ${metadata.descriptionSource}`);

    const analysisStart = now();
    const analysis = await analyzeCandidates(page);
    timings.analysis = now() - analysisStart;
    logger.debug("capture", `Candidate analysis: inspected=${analysis.inspected} valid=${analysis.candidates.length} fallback=${analysis.fallback}`);
    for (const [index, candidate] of analysis.candidates.slice(0, 5).entries()) {
      logger.debug("capture", `Candidate ${index + 1}: source=${candidate.source} x=${candidate.x} y=${candidate.y} score=${candidate.score.toFixed(1)} text=${candidate.textLength} images=${candidate.imageCount}`);
    }
    if (!analysis.selected) {
      const error = new Error(`No page region satisfied the minimum content requirements. ${analysis.inspected} candidate regions were inspected.`);
      error.code = "CAPTURE_NO_VALID_REGION";
      error.stage = "preview selection";
      error.context = { candidatesInspected: analysis.inspected, fallbackAttempted: true };
      throw error;
    }

    const clip = analysis.selected.clip;
    logger.debug("capture", `Selected preview crop: x=${clip.x} y=${clip.y} width=${clip.width} height=${clip.height} score=${analysis.selected.score.toFixed(1)}`);
    const shotStart = now();
    await page.screenshot({ path: outputPath, type: "jpeg", quality: PREVIEW_QUALITY, clip, animations: "disabled", timeout: 10_000 });
    timings.screenshot = now() - shotStart;
    const image = await validateJpeg(outputPath, PREVIEW_WIDTH, PREVIEW_HEIGHT);
    timings.total = now() - started;
    logger.debug("capture", `Capture timing: navigation=${Math.round(timings.navigation)}ms stabilization=${Math.round(timings.stabilization)}ms analysis=${Math.round(timings.analysis)}ms screenshot=${Math.round(timings.screenshot)}ms total=${Math.round(timings.total)}ms`);
    return { metadata, finalUrl: page.url(), clip, image, timings };
  } finally {
    await context.close().catch((error) => logger.warn("capture", `Browser cleanup warning: ${error.message}`));
  }
}

async function handleOverlays(page, logger) {
  const dismissed = await page.evaluate(() => {
    const label = /^(close|dismiss|reject( all)?|continue without|not now|decline)$/i;
    const controls = [...document.querySelectorAll("button,[role=button]")].slice(0, 200);
    const target = controls.find((element) => label.test((element.getAttribute("aria-label") || element.textContent || "").trim()));
    if (target) { target.click(); return true; }
    return false;
  });
  if (dismissed) {
    logger.debug("capture", "Dismissed a conservative non-content overlay control.");
    await page.waitForTimeout(150);
  }
  const hidden = await page.evaluate(() => {
    let count = 0;
    for (const element of [...document.querySelectorAll("[role=dialog],dialog,[aria-modal=true]")].slice(0, 12)) {
      const rect = element.getBoundingClientRect();
      const text = (element.textContent || "").toLowerCase();
      if (rect.width * rect.height > innerWidth * innerHeight * 0.18 && !/(sign in|log in|password|captcha|verify|paywall)/.test(text)) {
        element.style.setProperty("display", "none", "important"); count += 1;
      }
    }
    return count;
  });
  if (hidden) logger.warn("capture", `Hid ${hidden} nonessential obstructive overlay${hidden === 1 ? "" : "s"}.`);
}

async function detectBarrier(page) {
  return page.evaluate(() => {
    const text = (document.body?.innerText || "").slice(0, 8000).toLowerCase();
    const forms = [...document.forms];
    if (/(captcha|checking your browser|verify you are human|access denied|security challenge)/.test(text)) return "an access challenge";
    const hasPassword = forms.some((form) => form.querySelector('input[type="password"]'));
    if (hasPassword && /(sign in|log in|password|authentication)/.test(text)) return "an authentication wall";
    return null;
  });
}

async function extractMetadata(page) {
  return page.evaluate(() => {
    const clean = (value) => typeof value === "string" ? value.trim() : "";
    const meta = (selector) => clean(document.querySelector(selector)?.content);
    const visible = (element) => {
      if (!element) return "";
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 1 && rect.height > 1 ? clean(element.innerText) : "";
    };
    const titleOptions = [
      ["og:title", meta('meta[property="og:title"]')],
      ["document title", clean(document.title)],
      ["first useful h1", visible(document.querySelector("h1"))],
      ["first useful heading", visible(document.querySelector('h2,h3,[role="heading"]'))]
    ];
    const primaryHeading = document.querySelector('h1,[role="heading"],h2');
    const associated = primaryHeading?.parentElement ? [...primaryHeading.parentElement.querySelectorAll("p")].map(visible).find((text) => text.length >= 40) : "";
    const paragraph = [...document.querySelectorAll("main p,article p,p")].map(visible).find((text) => text.length >= 40) || "";
    const descriptionOptions = [
      ["og:description", meta('meta[property="og:description"]')],
      ["meta description", meta('meta[name="description"]')],
      ["heading-associated text", associated],
      ["first visible paragraph", paragraph]
    ];
    const [titleSource, title = ""] = titleOptions.find(([, value]) => value) || ["none", ""];
    const [descriptionSource, description = ""] = descriptionOptions.find(([, value]) => value) || ["none", ""];
    return { title, description, titleSource, descriptionSource };
  });
}

async function analyzeCandidates(page) {
  return page.evaluate(({ searchHeight, maxCandidates, previewWidth, previewHeight }) => {
    const unique = new Set();
    const nodes = [];
    const add = (element, source) => {
      if (!element || unique.has(element) || nodes.length >= maxCandidates * 4) return;
      unique.add(element); nodes.push([element, source]);
    };
    document.querySelectorAll('article,main,[role="main"],section').forEach((e) => add(e, e.tagName.toLowerCase()));
    document.querySelectorAll('h1,h2,h3,[role="heading"]').forEach((e) => add(e.parentElement, "heading-group"));
    document.querySelectorAll('img,svg,canvas,pre,table').forEach((e) => add(e.parentElement, `${e.tagName.toLowerCase()}-group`));
    document.querySelectorAll('div').forEach((e) => {
      if (nodes.length >= maxCandidates * 4) return;
      const rect = e.getBoundingClientRect();
      if (rect.width >= 420 && rect.height >= 180 && rect.top + scrollY < searchHeight) add(e, "container");
    });
    const viewportWidth = Math.max(document.documentElement.scrollWidth, innerWidth);
    const documentHeight = Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight || 0);
    const results = [];
    for (const [element, source] of nodes) {
      if (results.length >= maxCandidates) break;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      const y = rect.top + scrollY;
      if (style.display === "none" || style.visibility === "hidden" || rect.width < 180 || rect.height < 90 || y > searchHeight || rect.bottom < 0) continue;
      const headings = [...element.querySelectorAll('h1,h2,h3,[role="heading"]')].filter((h) => {
        const r = h.getBoundingClientRect(); return r.width > 20 && r.height > 12 && parseFloat(getComputedStyle(h).fontSize) >= 14;
      });
      const textElements = [...element.querySelectorAll('p,li,pre,code,td,th')].slice(0, 80);
      const textLength = textElements.reduce((sum, node) => {
        const s = getComputedStyle(node); const r = node.getBoundingClientRect();
        return sum + (r.width > 10 && r.height > 8 && parseFloat(s.fontSize) >= 14 ? (node.innerText || "").trim().length : 0);
      }, Math.min((element.innerText || "").trim().length, 240));
      const imageCount = [...element.querySelectorAll('img,svg,canvas,iframe')].filter((image) => {
        const r = image.getBoundingClientRect(); return r.width >= 200 && r.height >= 120;
      }).length;
      const tag = element.tagName.toLowerCase();
      const identity = `${tag} ${element.id} ${element.className}`.toLowerCase();
      const semantic = tag === "main" || tag === "article" || element.getAttribute("role") === "main" ? 24 : 0;
      const navPenalty = element.closest('nav,footer,[role="navigation"],[role="contentinfo"]') ? 70 : 0;
      const noisyPenalty = /(advert|cookie|consent|modal|footer|sidebar|social|share|related|comment)/.test(identity) ? 32 : 0;
      const buttons = element.querySelectorAll('button,[role="button"],input').length;
      const area = Math.min(rect.width * rect.height, previewWidth * previewHeight);
      const contentCoverage = Math.min(1, (textLength * 110 + imageCount * 90_000) / Math.max(1, area));
      const score = semantic + headings.length * 25 + Math.min(28, textLength / 45) + imageCount * 18 + (textLength > 80 && imageCount ? 12 : 0) + contentCoverage * 18 + Math.max(0, 8 - y / 500) - navPenalty - noisyPenalty - Math.min(20, buttons * 1.3);
      const valid = score >= 18 && (headings.length && textLength >= 35 || textLength >= 180 || imageCount && (textLength >= 20 || rect.width * rect.height > 220_000));
      if (!valid) continue;
      const centerX = rect.left + scrollX + rect.width / 2;
      let x = Math.round(centerX - previewWidth / 2);
      x = Math.max(0, Math.min(x, viewportWidth - previewWidth));
      if (headings.length) {
        const headingRect = headings[0].getBoundingClientRect();
        const headingLeft = headingRect.left + scrollX;
        const headingRight = headingRect.right + scrollX;
        if (headingLeft < x + 40) x = Math.max(0, Math.round(headingLeft - 40));
        if (headingRight <= headingLeft + previewWidth - 80 && headingRight > x + previewWidth - 40) x = Math.min(viewportWidth - previewWidth, Math.round(headingRight - previewWidth + 40));
      }
      let cropY = Math.round(y - (headings.length ? 72 : Math.max(0, (previewHeight - Math.min(rect.height, previewHeight)) / 2)));
      cropY = Math.max(0, Math.min(cropY, Math.max(0, documentHeight - previewHeight)));
      results.push({ source, score, x: Math.round(rect.left + scrollX), y: Math.round(y), textLength, imageCount, clip: { x, y: cropY, width: previewWidth, height: previewHeight } });
    }
    results.sort((a, b) => b.score - a.score || a.y - b.y || Math.abs((a.x + 600) - viewportWidth / 2) - Math.abs((b.x + 600) - viewportWidth / 2) || b.textLength - a.textLength);
    let fallback = false;
    let selected = results[0] || null;
    if (!selected) {
      fallback = true;
      const boxes = [...document.querySelectorAll('h1,h2,h3,p,img,svg,canvas,pre,main,section')].slice(0, 300).map((e) => {
        const r = e.getBoundingClientRect(); const y = r.top + scrollY;
        return { x: r.left + scrollX, y, w: r.width, h: r.height, text: (e.innerText || "").trim().length, image: /^(IMG|SVG|CANVAS)$/.test(e.tagName) };
      }).filter((b) => b.y < 1600 && b.w > 30 && b.h > 15);
      let best = null;
      for (let y = 0; y <= Math.max(0, Math.min(1600, documentHeight - previewHeight)); y += 105) {
        const inside = boxes.filter((b) => b.y + b.h > y && b.y < y + previewHeight);
        const text = inside.reduce((sum, b) => sum + b.text, 0);
        const images = inside.filter((b) => b.image && b.w >= 200 && b.h >= 120).length;
        const score = Math.min(50, text / 35) + images * 25;
        if ((!best || score > best.score) && (text >= 180 || images > 0 && text >= 20)) best = { score, y, text, images };
      }
      if (best) selected = { source: "densest-content-fallback", score: best.score, x: 0, y: best.y, textLength: best.text, imageCount: best.images, clip: { x: Math.max(0, Math.floor((viewportWidth - previewWidth) / 2)), y: best.y, width: previewWidth, height: previewHeight } };
    }
    return { inspected: Math.min(nodes.length, maxCandidates), candidates: results, fallback, selected };
  }, { searchHeight: CAPTURE_SEARCH_HEIGHT, maxCandidates: MAX_CAPTURE_CANDIDATES, previewWidth: PREVIEW_WIDTH, previewHeight: PREVIEW_HEIGHT });
}

```

## File content `scripts\jpeg.mjs`:

```js
import { readFile, stat } from "node:fs/promises";

export function jpegDimensions(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) throw new Error("File does not contain a JPEG start marker.");
  let offset = 2;
  while (offset + 8 < buffer.length) {
    if (buffer[offset] !== 0xff) { offset += 1; continue; }
    const marker = buffer[offset + 1];
    if (marker === 0xd9 || marker === 0xda) break;
    const length = buffer.readUInt16BE(offset + 2);
    if (length < 2) throw new Error("JPEG contains an invalid segment length.");
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
    }
    offset += 2 + length;
  }
  throw new Error("JPEG dimensions could not be decoded.");
}

export async function validateJpeg(filePath, expectedWidth = 1200, expectedHeight = 630) {
  const info = await stat(filePath);
  if (!info.isFile() || info.size === 0) throw new Error("Preview JPEG is missing or empty.");
  const dimensions = jpegDimensions(await readFile(filePath));
  if (dimensions.width !== expectedWidth || dimensions.height !== expectedHeight) {
    throw new Error(`Preview dimensions are ${dimensions.width}x${dimensions.height}; expected ${expectedWidth}x${expectedHeight}.`);
  }
  return { ...dimensions, bytes: info.size };
}

```

## File content `scripts\repository.mjs`:

```js
import { access, mkdir, open, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { constants as fsConstants } from "node:fs";
import { parseManifest, parseTargetUrl, isValidId } from "../shared/core.js";

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/, (m) => m.slice(1))), "..");

export function metaFromHtml(html, selectorName, property = false) {
  const attribute = property ? "property" : "name";
  const escaped = selectorName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const forward = new RegExp(`<meta\\s+[^>]*${attribute}=["']${escaped}["'][^>]*content=["']([^"']*)["'][^>]*>`, "i");
  const reverse = new RegExp(`<meta\\s+[^>]*content=["']([^"']*)["'][^>]*${attribute}=["']${escaped}["'][^>]*>`, "i");
  const value = (html.match(forward) || html.match(reverse))?.[1] ?? null;
  return value === null ? null : decodeHtmlEntities(value);
}

function decodeHtmlEntities(value) {
  return value.replace(/&(amp|quot|#39|lt|gt);/g, (match, entity) => ({ amp: "&", quot: '"', "#39": "'", lt: "<", gt: ">" }[entity] || match));
}

export async function validateRepository(root = ROOT) {
  const manifestPath = path.join(root, "links.txt");
  const recordsPath = path.join(root, "lnk");
  await access(manifestPath, fsConstants.R_OK | fsConstants.W_OK);
  const lnkStat = await stat(recordsPath);
  if (!lnkStat.isDirectory()) throw new Error(`Required record directory is not a directory: ${recordsPath}`);
  const manifestText = await readFile(manifestPath, "utf8");
  const ids = parseManifest(manifestText);
  const manifestSet = new Set(ids);
  const directoryEntries = await readdir(recordsPath, { withFileTypes: true });
  for (const entry of directoryEntries) {
    if (entry.name === ".gitkeep") continue;
    if (!entry.isDirectory() || !isValidId(entry.name)) throw new Error(`Unexpected item in lnk/: ${entry.name}. Record directories must use valid 8-character IDs.`);
    if (!manifestSet.has(entry.name)) throw new Error(`Record directory lnk/${entry.name}/ is not represented in links.txt.`);
  }
  const targets = new Map();
  for (const id of ids) {
    const recordDir = path.join(recordsPath, id);
    const htmlPath = path.join(recordDir, "index.html");
    const previewPath = path.join(recordDir, "preview.jpg");
    await access(htmlPath, fsConstants.R_OK);
    await access(previewPath, fsConstants.R_OK);
    const generatedFiles = await readdir(recordDir, { withFileTypes: true });
    const names = generatedFiles.map((entry) => entry.name).sort();
    if (names.join("|") !== "index.html|preview.jpg" || generatedFiles.some((entry) => !entry.isFile())) throw new Error(`Record lnk/${id}/ must contain exactly index.html and preview.jpg.`);
    const html = await readFile(htmlPath, "utf8");
    const storedId = metaFromHtml(html, "lnk:id");
    const target = metaFromHtml(html, "lnk:target");
    if (storedId !== id) throw new Error(`Record ID mismatch for ${id}: observed ${storedId ?? "missing"}.`);
    if (!target) throw new Error(`Required metadata lnk:target is missing in ${htmlPath}.`);
    parseTargetUrl(target);
    const created = metaFromHtml(html, "lnk:created");
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(created || "") || Number.isNaN(Date.parse(created))) throw new Error(`Record ${id} has invalid lnk:created metadata.`);
    if (!/<title>[^<]+<\/title>/i.test(html) || !metaFromHtml(html, "description")) throw new Error(`Record ${id} is missing title or description metadata.`);
    for (const property of ["og:title", "og:description", "og:image", "og:url", "og:type"]) if (!metaFromHtml(html, property, true)) throw new Error(`Record ${id} is missing ${property} metadata.`);
    if (targets.has(target)) throw new Error(`Duplicate target ${target} occurs in ${targets.get(target)} and ${id}.`);
    targets.set(target, id);
  }
  return { ids, targets, manifestPath, recordsPath };
}

export async function acquireLock(root = ROOT, waitMs = 2000) {
  const lockPath = path.join(root, ".link-journal.lock");
  const deadline = Date.now() + waitMs;
  while (true) {
    try {
      const handle = await open(lockPath, "wx");
      await handle.writeFile(`${process.pid}\n${new Date().toISOString()}\n`);
      return async () => {
        await handle.close();
        await rm(lockPath, { force: true });
      };
    } catch (error) {
      if (error.code !== "EEXIST" || Date.now() >= deadline) throw error;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}

export async function prependManifest(manifestPath, id, priorIds) {
  if (!isValidId(id)) throw new Error(`Refusing to write invalid ID ${id}.`);
  const tempPath = `${manifestPath}.tmp-${process.pid}`;
  const next = [id, ...priorIds].join("\n") + "\n";
  await writeFile(tempPath, next, "utf8");
  await rename(tempPath, manifestPath);
}

export async function ensureRecordParent(recordsPath) {
  await mkdir(recordsPath, { recursive: true });
}

```

## File content `scripts\serve.mjs`:

```js
#!/usr/bin/env node
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { ROOT } from "./repository.mjs";

const port = Number(process.env.PORT || 4173);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml" };
createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  let relative = decodeURIComponent(url.pathname).replace(/^\/+/, "");
  let filePath = path.resolve(ROOT, relative || "index.html");
  if (!filePath.startsWith(ROOT + path.sep) && filePath !== path.join(ROOT, "index.html")) { response.writeHead(403).end("Forbidden"); return; }
  try {
    let info = await stat(filePath);
    if (info.isDirectory()) { filePath = path.join(filePath, "index.html"); info = await stat(filePath); }
    response.setHeader("Content-Type", types[path.extname(filePath).toLowerCase()] || "application/octet-stream");
    response.setHeader("Cache-Control", "no-store");
    response.writeHead(200);
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not found");
  }
}).listen(port, "127.0.0.1", () => console.log(`Journal available at http://127.0.0.1:${port}/`));

```

## File content `scripts\validate-repository.mjs`:

```js
#!/usr/bin/env node
import { validateRepository, ROOT } from "./repository.mjs";
import { validateJpeg } from "./jpeg.mjs";
import path from "node:path";

try {
  const repository = await validateRepository(ROOT);
  for (const id of repository.ids) await validateJpeg(path.join(repository.recordsPath, id, "preview.jpg"));
  console.log(`Repository valid.\n\nRecords:\n  ${repository.ids.length}\n\nManifest:\n  ${repository.manifestPath}`);
} catch (error) {
  console.error(`Sorry, the link archive needs attention.\n\nReason:\n  ${error.message}\n\nStage:\n  repository validation`);
  process.exitCode = 1;
}

```

## File content `shared\constants.js`:

```js
export const ID_PATTERN = /^[A-Za-z0-9]{8}$/;
export const ID_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
export const ENTRY_PAGE_SIZE = 6;
export const CACHE_TTL_MS = 3_600_000;
export const FETCH_TIMEOUT_MS = 15_000;
export const MAX_RECORD_REQUESTS = 6;
export const PREVIEW_WIDTH = 1200;
export const PREVIEW_HEIGHT = 630;
export const PREVIEW_QUALITY = 90;
export const CAPTURE_VIEWPORT = Object.freeze({ width: 1440, height: 1000 });
export const CAPTURE_SEARCH_HEIGHT = 4000;
export const MAX_CAPTURE_CANDIDATES = 100;
export const NAVIGATION_TIMEOUT_MS = 30_000;
export const STABILIZATION_BUDGET_MS = 5_000;
export const PAGE_TURN_MS = 460;
export const CAMERA = Object.freeze({ min: 0.7, default: 1, max: 1.4, step: 0.08 });

```

## File content `shared\core.js`:

```js
import { ID_ALPHABET, ID_PATTERN } from "./constants.js";

export function parseTargetUrl(input) {
  let parsed;
  try {
    parsed = new URL(input);
  } catch {
    throw new TypeError("The target must be an absolute http:// or https:// URL.");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new TypeError("The target must be an absolute http:// or https:// URL.");
  }
  return parsed.href;
}

export function normalizeSiteBase(input) {
  const value = parseTargetUrl(input);
  const url = new URL(value);
  url.hash = "";
  url.search = "";
  if (!url.pathname.endsWith("/")) url.pathname += "/";
  return url.href;
}

export function isValidId(value) {
  return typeof value === "string" && ID_PATTERN.test(value);
}

export function randomId(randomBytes) {
  let result = "";
  let cursor = 0;
  while (result.length < 8) {
    if (cursor >= randomBytes.length) throw new RangeError("Insufficient random data for an ID.");
    const byte = randomBytes[cursor++];
    if (byte >= 248) continue;
    result += ID_ALPHABET[byte % ID_ALPHABET.length];
  }
  return result;
}

const ALLOWED_LETTER = /[\p{Script=Latin}\p{Script=Cyrillic}\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u;
const ALLOWED_CHAR = /[\p{Script=Latin}\p{Script=Cyrillic}\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana} .,:;!?'"()-]/u;

export function sanitizeText(input, kind = "title") {
  const fallback = kind === "description" ? "(no description)" : "(no title)";
  const source = typeof input === "string" ? input : "";
  let value = Array.from(source, (character) => ALLOWED_CHAR.test(character) ? character : " ")
    .join("")
    .replace(/\s+/g, " ")
    .trim();
  while (value && !ALLOWED_LETTER.test(value[0])) value = value.slice(1).trimStart();
  while (value && !ALLOWED_LETTER.test(value.at(-1))) value = value.slice(0, -1).trimEnd();
  const limit = kind === "description" ? 320 : 160;
  if (Array.from(value).length > limit) {
    value = Array.from(value).slice(0, limit).join("").trimEnd();
    while (value && !ALLOWED_LETTER.test(value.at(-1))) value = value.slice(0, -1).trimEnd();
  }
  return value || fallback;
}

export function parseManifest(text) {
  const ids = [];
  const firstLine = new Map();
  for (const [offset, raw] of String(text).split(/\r?\n/).entries()) {
    const value = raw.replace(/^[\t ]+|[\t ]+$/g, "");
    if (!value) continue;
    const line = offset + 1;
    if (!isValidId(value)) {
      const error = new Error(`Line ${line} contains an invalid link ID: ${value}`);
      error.code = "MANIFEST_INVALID_ID";
      error.context = { line, value };
      throw error;
    }
    if (firstLine.has(value)) {
      const error = new Error(`Link ID ${value} occurs more than once.`);
      error.code = "MANIFEST_DUPLICATE_ID";
      error.context = { id: value, firstLine: firstLine.get(value), repeatedLine: line };
      throw error;
    }
    firstLine.set(value, line);
    ids.push(value);
  }
  return ids;
}

export function pageRange(pageIndex, totalEntries) {
  if (!Number.isInteger(pageIndex) || pageIndex < 0) return { start: 0, end: 0 };
  const start = pageIndex * 6;
  return { start, end: Math.min(start + 6, Math.max(0, totalEntries)) };
}

export function htmlEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function isoUtcSeconds(date = new Date()) {
  return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}

export function buildPublicUrls(siteBase, id) {
  const base = normalizeSiteBase(siteBase);
  const shortUrl = new URL(`lnk/${id}/`, base).href;
  return { shortUrl, previewUrl: new URL("preview.jpg", shortUrl).href };
}

export function generateRecordHtml({ id, targetUrl, createdAt, title, description, shortUrl, previewUrl }) {
  const e = htmlEscape;
  const jsTarget = JSON.stringify(targetUrl).replaceAll("<", "\\u003c");
  return `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<meta name="lnk:id" content="${e(id)}">\n<meta name="lnk:target" content="${e(targetUrl)}">\n<meta name="lnk:created" content="${e(createdAt)}">\n<title>${e(title)}</title>\n<meta name="description" content="${e(description)}">\n<meta property="og:title" content="${e(title)}">\n<meta property="og:description" content="${e(description)}">\n<meta property="og:image" content="${e(previewUrl)}">\n<meta property="og:url" content="${e(shortUrl)}">\n<meta property="og:type" content="website">\n<meta http-equiv="refresh" content="0; url=${e(targetUrl)}">\n<script>location.replace(${jsTarget})<\/script>\n</head>\n<body>\n<p>Redirecting to the original page.</p>\n<p><a href="${e(targetUrl)}">Continue to the original page</a></p>\n</body>\n</html>\n`;
}

```

## File content `shared\diagnostics.js`:

```js
function stringifyValue(value) {
  if (value instanceof Error) return value.message;
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function createDiagnostic({ code, module, stage, summary, reason, context = {}, action, cause, severity = "error", userVisible = true }) {
  return { code, module, stage, summary, reason, context, action, cause, severity, userVisible };
}

export function formatDiagnostic(diagnostic, correlationLabel = "Operation", correlationId) {
  const lines = [`[${diagnostic.severity.toUpperCase()}] [${diagnostic.module}] ${diagnostic.summary}`];
  const fields = [];
  if (correlationId) fields.push([correlationLabel, correlationId]);
  if (diagnostic.stage) fields.push(["Stage", diagnostic.stage]);
  for (const [label, value] of Object.entries(diagnostic.context || {})) {
    if (value !== undefined && value !== null && value !== "") fields.push([label, stringifyValue(value)]);
  }
  if (diagnostic.reason) fields.push(["Reason", diagnostic.reason]);
  if (diagnostic.action) fields.push(["Action", diagnostic.action]);
  if (diagnostic.code) fields.push(["Error code", diagnostic.code]);
  for (const [label, value] of fields) lines.push("", `${label}:`, `  ${value}`);
  return lines.join("\n");
}

export function formatUserError(opening, diagnostic, fields = []) {
  const lines = [opening, "", diagnostic.reason || diagnostic.summary];
  for (const [label, value] of fields) lines.push("", `${label}:`, `  ${stringifyValue(value)}`);
  if (diagnostic.action) lines.push("", "Action:", `  ${diagnostic.action}`);
  return lines.join("\n");
}

export function createLogger({ debug = false, correlationLabel = "Operation", correlationId = "" } = {}) {
  const emit = (method, level, module, message) => console[method](`[${level}] [${module}] ${message}`);
  return {
    info: (module, message) => emit("info", "INFO", module, message),
    warn: (module, message) => emit("warn", "WARN", module, message),
    debug: (module, message) => { if (debug) emit("debug", "DEBUG", module, message); },
    error: (diagnostic) => console.error(formatDiagnostic(diagnostic, correlationLabel, correlationId))
  };
}

```

## File content `test-results\.last-run.json`:

```json
{
  "status": "passed",
  "failedTests": []
}
```

## File content `tests\browser.test.js`:

```js
import { test, expect } from "@playwright/test";
import { generateRecordHtml } from "../shared/core.js";

test("journal loads records in fixed pages and keeps cards usable", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.locator(".journal-page")).toHaveCount(testInfo.project.name === "desktop" ? 2 : 1);
  await expect(page.locator(".entry-card:not(.is-loading)")).toHaveCount(testInfo.project.name === "desktop" ? 12 : 6);
  await expect(page.locator(".page-number").first()).toHaveText("Page 1");
  await expect(page.locator(".entry-card h2").first()).toBeVisible();
  await expect(page.locator(".entry-host").first()).toContainText("example.com");
  await expect(page.locator(".entry-card time").first()).toContainText("Added");
  await page.screenshot({ path: testInfo.outputPath(`${testInfo.project.name}-opening.png`), fullPage: false });
});

test("page navigation advances by spread or page and rejects rapid corruption", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.locator(".entry-card:not(.is-loading)")).toHaveCount(testInfo.project.name === "desktop" ? 12 : 6);
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(560);
  await expect(page.locator(".page-number").first()).toHaveText(testInfo.project.name === "desktop" ? "Page 3" : "Page 2");
  await page.keyboard.press("ArrowLeft");
  await page.waitForTimeout(560);
  await expect(page.locator(".page-number").first()).toHaveText("Page 1");
});

test("Ctrl-wheel zoom is bounded and ordinary wheel does not change pages", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".entry-card:not(.is-loading)").first()).toBeVisible();
  const before = await page.locator("#journal-scene").evaluate((element) => getComputedStyle(element).getPropertyValue("--camera-scale"));
  await page.mouse.wheel(0, 700);
  await expect(page.locator(".page-number").first()).toHaveText("Page 1");
  await page.locator("#journal-scene").dispatchEvent("wheel", { deltaY: -100, ctrlKey: true });
  const after = await page.locator("#journal-scene").evaluate((element) => getComputedStyle(element).getPropertyValue("--camera-scale"));
  expect(Number.parseFloat(after)).toBeGreaterThan(Number.parseFloat(before));
});

test("responsive mode preserves logical location", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.goto("/");
  await expect(page.locator(".entry-card:not(.is-loading)")).toHaveCount(12);
  await page.keyboard.press("ArrowRight"); await page.waitForTimeout(520);
  await expect(page.locator(".page-number").first()).toHaveText("Page 3");
  await page.setViewportSize({ width: 760, height: 900 });
  await expect(page.locator(".journal-page")).toHaveCount(1);
  await expect(page.locator(".page-number")).toHaveText("Page 3");
});

test("keyboard focus is visible and reduced motion remains functional", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".entry-card:not(.is-loading)").first()).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toBeVisible();
  await page.keyboard.press("PageDown");
  await expect(page.locator(".page-number").first()).not.toHaveText("Page 1");
});

test("startup work is bounded and a fresh cache avoids repeat record fetches", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  let records = 0;
  page.on("request", (request) => { if (/\/lnk\/[^/]+\/index\.html$/.test(request.url())) records += 1; });
  await page.goto("/");
  await expect(page.locator(".entry-card:not(.is-loading)")).toHaveCount(12);
  await page.waitForTimeout(300);
  expect(records).toBeLessThanOrEqual(18);
  records = 0;
  await page.reload();
  await expect(page.locator(".entry-card:not(.is-loading)")).toHaveCount(12);
  await page.waitForTimeout(200);
  expect(records).toBe(0);
});

test("one missing record stays local and retains its grid position", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.route("**/lnk/Demo0002/index.html", (route) => route.fulfill({ status: 404, body: "missing" }));
  await page.goto("/");
  await expect(page.locator(".entry-card:not(.is-loading)")).toHaveCount(12);
  await expect(page.locator('.entry-card[data-id="Demo0002"]')).toHaveClass(/is-error/);
  await expect(page.locator('.entry-card[data-id="Demo0003"] h2')).toBeVisible();
  expect(await page.locator(".entry-grid").first().locator(":scope > *").count()).toBe(6);
  await page.screenshot({ path: testInfo.outputPath("desktop-record-error.png") });
});

test("manifest failure is journal-scoped and is not represented as empty", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.route("**/links.txt", (route) => route.fulfill({ status: 404, body: "missing" }));
  await page.goto("/");
  await expect(page.locator(".journal-message")).toContainText("published link manifest is missing");
  await expect(page.locator(".empty-message")).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath("desktop-manifest-error.png") });
});

test("preview failure remains inside its card and metadata remains usable", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.route("**/lnk/Demo0001/preview.jpg", (route) => route.fulfill({ status: 404, body: "missing" }));
  await page.goto("/");
  const card = page.locator('.entry-card[data-id="Demo0001"]');
  await expect(card.locator(".preview-failed")).toHaveText("Preview unavailable");
  await expect(card.locator("h2")).toBeVisible();
  await expect(card.locator(".entry-host")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("desktop-preview-error.png") });
});

test("loading placeholders preserve final grid geometry", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.route(/\/lnk\/Demo\d{4}\/index\.html$/, async (route) => { await new Promise((resolve) => setTimeout(resolve, 650)); await route.continue(); });
  await page.goto("/");
  await expect(page.locator(".is-loading")).toHaveCount(12);
  expect(await page.locator(".entry-grid").first().locator(":scope > *").count()).toBe(6);
  await page.screenshot({ path: testInfo.outputPath("desktop-loading.png") });
  await expect(page.locator(".entry-card:not(.is-loading)")).toHaveCount(12);
});

test("a page turn has one attached planar sheet at its intermediate state", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.goto("/");
  await expect(page.locator(".entry-card:not(.is-loading)")).toHaveCount(12);
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(210);
  await expect(page.locator(".turning-sheet")).toHaveCount(1);
  await page.screenshot({ path: testInfo.outputPath("desktop-turn-mid.png") });
  await page.waitForTimeout(350);
  await expect(page.locator(".turning-sheet")).toHaveCount(0);
});

test("desktop camera remains bounded and constrained composition stays readable", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.goto("/");
  await expect(page.locator(".entry-card:not(.is-loading)")).toHaveCount(12);
  for (let index = 0; index < 8; index += 1) await page.locator("#journal-scene").dispatchEvent("wheel", { deltaY: 100, ctrlKey: true });
  const minimum = Number.parseFloat(await page.locator("#journal-scene").evaluate((element) => getComputedStyle(element).getPropertyValue("--camera-scale")));
  await page.screenshot({ path: testInfo.outputPath("desktop-zoom-out.png") });
  for (let index = 0; index < 20; index += 1) await page.locator("#journal-scene").dispatchEvent("wheel", { deltaY: -100, ctrlKey: true });
  const maximum = Number.parseFloat(await page.locator("#journal-scene").evaluate((element) => getComputedStyle(element).getPropertyValue("--camera-scale")));
  expect(maximum).toBeGreaterThan(minimum);
  await page.setViewportSize({ width: 720, height: 560 });
  await expect(page.locator(".journal-page")).toHaveCount(1);
  await expect(page.locator(".entry-card h2").first()).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("desktop-constrained.png") });
});

test("mobile pinch zoom and horizontal page intent remain distinct", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile");
  await page.goto("/");
  await expect(page.locator(".entry-card:not(.is-loading)")).toHaveCount(6);
  const before = Number.parseFloat(await page.locator("#journal-scene").evaluate((element) => getComputedStyle(element).getPropertyValue("--camera-scale")));
  await page.evaluate(() => {
    const target = document.querySelector("#viewport");
    const fire = (type, touches) => { const event = new Event(type, { bubbles: true, cancelable: true }); Object.defineProperty(event, "touches", { value: touches }); target.dispatchEvent(event); };
    fire("touchstart", [{ clientX: 120, clientY: 300 }, { clientX: 220, clientY: 300 }]);
    fire("touchmove", [{ clientX: 80, clientY: 300 }, { clientX: 260, clientY: 300 }]);
    fire("touchend", []);
  });
  const after = Number.parseFloat(await page.locator("#journal-scene").evaluate((element) => getComputedStyle(element).getPropertyValue("--camera-scale")));
  expect(after).toBeGreaterThan(before);
  await page.evaluate(() => {
    const target = document.querySelector("#viewport");
    const fire = (type, touches) => { const event = new Event(type, { bubbles: true, cancelable: true }); Object.defineProperty(event, "touches", { value: touches }); target.dispatchEvent(event); };
    fire("touchstart", [{ clientX: 320, clientY: 420 }]);
    fire("touchmove", [{ clientX: 220, clientY: 425 }]);
    fire("touchend", []);
  });
  await expect(page.locator(".page-number")).toHaveText("Page 1");
  for (let index = 0; index < 8; index += 1) await page.locator("#journal-scene").dispatchEvent("wheel", { deltaY: 100, ctrlKey: true });
  await page.evaluate(() => {
    const target = document.querySelector("#viewport");
    const fire = (type, touches) => { const event = new Event(type, { bubbles: true, cancelable: true }); Object.defineProperty(event, "touches", { value: touches }); target.dispatchEvent(event); };
    fire("touchstart", [{ clientX: 320, clientY: 420 }]);
    fire("touchmove", [{ clientX: 210, clientY: 423 }]);
    fire("touchend", []);
  });
  await page.waitForTimeout(520);
  await expect(page.locator(".page-number")).toHaveText("Page 2");
});

test("record request concurrency stays at or below six", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  let active = 0, maximum = 0;
  await page.route(/\/lnk\/Demo\d{4}\/index\.html$/, async (route) => {
    active += 1; maximum = Math.max(maximum, active);
    await new Promise((resolve) => setTimeout(resolve, 120));
    active -= 1;
    await route.continue();
  });
  await page.goto("/");
  await expect(page.locator(".entry-card:not(.is-loading)")).toHaveCount(12);
  expect(maximum).toBeLessThanOrEqual(6);
});

test("stale cache is explicit after network failure and deleted IDs never resurrect", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.goto("/");
  await expect(page.locator(".entry-card:not(.is-loading)")).toHaveCount(12);
  await page.evaluate(() => {
    const key = "lnk-journal:entry:Demo0001";
    const value = JSON.parse(localStorage.getItem(key)); value.cachedAt = Date.now() - 3_600_001; localStorage.setItem(key, JSON.stringify(value));
  });
  await page.route("**/lnk/Demo0001/index.html", (route) => route.abort("failed"));
  await page.reload();
  await expect(page.locator('.entry-card[data-id="Demo0001"] .cached-badge')).toHaveText("Cached");
  await page.unroute("**/lnk/Demo0001/index.html");
  const idsWithoutFirst = Array.from({ length: 24 }, (_, index) => `Demo${String(index + 2).padStart(4, "0")}`).join("\n") + "\n";
  await page.route("**/links.txt", (route) => route.fulfill({ status: 200, contentType: "text/plain", body: idsWithoutFirst }));
  await page.reload();
  await expect(page.locator('.entry-card[data-id="Demo0001"]')).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem("lnk-journal:entry:Demo0001"))).toBeNull();
});

test("persistent cache denial degrades to memory without blocking the journal", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  const warnings = [];
  page.on("console", (message) => { if (message.type() === "warning") warnings.push(message.text()); });
  await page.addInitScript(() => Object.defineProperty(window, "localStorage", { get() { throw new DOMException("blocked", "SecurityError"); } }));
  await page.goto("/");
  await expect(page.locator(".entry-card:not(.is-loading)")).toHaveCount(12);
  expect(warnings.some((message) => message.includes("Persistent journal cache is unavailable"))).toBeTruthy();
});

test("malformed manifest is reported at journal scope", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.route("**/links.txt", (route) => route.fulfill({ status: 200, contentType: "text/plain", body: "Demo0001\nbad/id\n" }));
  await page.goto("/");
  await expect(page.locator(".journal-message")).toContainText("journal data is invalid");
  await expect(page.locator(".entry-card")).toHaveCount(0);
});

test("generated redirect HTML navigates while metadata remains in source", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  const target = "http://127.0.0.1:4173/capture/article";
  const html = generateRecordHtml({ id: "Test0001", targetUrl: target, createdAt: "2026-08-16T12:00:00Z", title: "Redirect Test", description: "Static redirect document", shortUrl: "http://127.0.0.1:4173/lnk/Test0001/", previewUrl: "http://127.0.0.1:4173/lnk/Test0001/preview.jpg" });
  expect(html).toContain('name="lnk:target"');
  await page.setContent(html, { waitUntil: "domcontentloaded" }).catch(() => {});
  await expect(page).toHaveURL(target);
});

test("empty and partial archives retain physical page geometry without phantom logical pages", async ({ page }, testInfo) => {
  await page.route("**/links.txt", (route) => route.fulfill({ status: 200, contentType: "text/plain", body: "" }));
  await page.goto("/");
  await expect(page.locator(".empty-message")).toHaveText("The journal is empty.");
  await expect(page.locator(".journal-page")).toHaveCount(testInfo.project.name === "desktop" ? 2 : 1);
  await page.unroute("**/links.txt");
  await page.reload();
  await expect(page.locator(".entry-card:not(.is-loading)")).toHaveCount(testInfo.project.name === "desktop" ? 12 : 6);
  if (testInfo.project.name === "desktop") {
    await page.keyboard.press("PageDown"); await page.waitForTimeout(520);
    await page.keyboard.press("PageDown"); await page.waitForTimeout(520);
    await expect(page.locator(".page-number")).toHaveCount(1);
    await expect(page.locator(".page-number")).toHaveText("Page 5");
    await expect(page.locator('.entry-card[data-id="Demo0025"]')).toBeVisible();
    expect(await page.locator(".journal-page").first().locator(".empty-slot").count()).toBe(5);
    await expect(page.locator(".journal-page").last()).toHaveClass(/blank-page/);
  }
});

```

## File content `tests\core.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { buildPublicUrls, generateRecordHtml, pageRange, parseManifest, parseTargetUrl, randomId, sanitizeText } from "../shared/core.js";
import { isFresh } from "../assets/data.js";

test("target URL serialization preserves query order and fragment", () => {
  assert.equal(parseTargetUrl(" https://example.com/a?b=2&a=1#part "), "https://example.com/a?b=2&a=1#part");
  for (const value of ["example.com", "/relative", "file:///tmp/a", "javascript:alert(1)"]) assert.throws(() => parseTargetUrl(value));
});

test("manifest validation preserves order and rejects invalid or duplicate IDs", () => {
  assert.deepEqual(parseManifest("New00001\r\n Old00002 \n\n"), ["New00001", "Old00002"]);
  assert.throws(() => parseManifest("bad/id\n"), { code: "MANIFEST_INVALID_ID" });
  assert.throws(() => parseManifest("Same0001\nSame0001\n"), { code: "MANIFEST_DUPLICATE_ID" });
});

test("random IDs use rejection sampling and the exact alphabet", () => {
  const id = randomId(Uint8Array.from([248, 0, 61, 62, 123, 124, 185, 186, 247]));
  assert.match(id, /^[A-Za-z0-9]{8}$/);
  assert.equal(id.length, 8);
});

test("sanitizer applies the exact script, punctuation, replacement and fallback contract", () => {
  assert.equal(sanitizeText("ðŸ”¥ Amazing Article â€” New Browser Tricks 2026 ðŸš€"), "Amazing Article New Browser Tricks");
  assert.equal(sanitizeText("Guide â€” Ð ÑƒÐºÐ¾Ð²Ð¾Ð´ÑÑ‚Ð²Ð¾ â€” æ—¥æœ¬èªž â€” ä¸­æ–‡"), "Guide Ð ÑƒÐºÐ¾Ð²Ð¾Ð´ÑÑ‚Ð²Ð¾ æ—¥æœ¬èªž ä¸­æ–‡");
  assert.equal(sanitizeText("HelloðŸ˜€World"), "Hello World");
  assert.equal(sanitizeText("-- Ð¡Ñ‚Ð°Ñ‚ÑŒÑ Ð¾ Ð±Ñ€Ð°ÑƒÐ·ÐµÑ€Ð°Ñ… --"), "Ð¡Ñ‚Ð°Ñ‚ÑŒÑ Ð¾ Ð±Ñ€Ð°ÑƒÐ·ÐµÑ€Ð°Ñ…");
  assert.equal(sanitizeText("1234 ðŸ˜€"), "(no title)");
  assert.equal(sanitizeText("1234 ðŸ˜€", "description"), "(no description)");
  assert.equal(Array.from(sanitizeText("A".repeat(200))).length, 160);
});

test("page ranges retain six-entry logical boundaries", () => {
  assert.deepEqual(pageRange(0, 13), { start: 0, end: 6 });
  assert.deepEqual(pageRange(1, 13), { start: 6, end: 12 });
  assert.deepEqual(pageRange(2, 13), { start: 12, end: 13 });
  for (const count of [0, 1, 5, 6, 7, 12, 13]) {
    const pageCount = count ? Math.ceil(count / 6) : 0;
    const visited = [];
    for (let page = 0; page < pageCount; page += 1) {
      const range = pageRange(page, count);
      for (let index = range.start; index < range.end; index += 1) visited.push(index);
    }
    assert.deepEqual(visited, Array.from({ length: count }, (_, index) => index));
  }
});

test("record HTML is static, escaped, prefix-safe and crawler-readable", () => {
  const urls = buildPublicUrls("https://example.github.io/tools/archive", "aB7kP2xQ");
  assert.equal(urls.shortUrl, "https://example.github.io/tools/archive/lnk/aB7kP2xQ/");
  const html = generateRecordHtml({ id: "aB7kP2xQ", targetUrl: "https://example.com/?a=1&b=2", createdAt: "2026-08-16T18:42:17Z", title: 'A "quoted" title', description: "One & two", ...urls });
  assert.match(html, /name="lnk:id" content="aB7kP2xQ"/);
  assert.match(html, /property="og:type" content="website"/);
  assert.match(html, /A &quot;quoted&quot; title/);
  assert.match(html, /One &amp; two/);
  assert.match(html, /http-equiv="refresh"/);
  assert.match(html, /location\.replace/);
  assert.match(html, /Continue to the original page/);
});

test("cache freshness has an exact one-hour boundary and rejects future anomalies", () => {
  const original = Date.now;
  Date.now = () => 10_000_000;
  try {
    assert.equal(isFresh(10_000_000 - 3_599_999), true);
    assert.equal(isFresh(10_000_000 - 3_600_000), false);
    assert.equal(isFresh(10_000_000 + 60_001), false);
  } finally { Date.now = original; }
});

```

## File content `tests\fixture-server.mjs`:

```js
import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { ROOT } from "../scripts/repository.mjs";
import { generateRecordHtml } from "../shared/core.js";

const port = Number(process.env.PORT || 4173);
const previewDir = path.join(ROOT, "tests", "fixtures", "previews");
const ids = Array.from({ length: 25 }, (_, index) => `Demo${String(index + 1).padStart(4, "0")}`);
const titles = [
  "Designing Quiet Software That Lasts", "A Field Guide to Better Interfaces", "Notes on Focused Creative Work",
  "Building Resilient Static Systems", "A Slow Journey Along the Coast", "Typography for Thoughtful Products",
  "Practical Browser Testing Patterns", "The Architecture of Useful Notes", "Small Tools With Lasting Value",
  "Exploring Mountain Trails in Autumn", "Readable Code for Everyday Teams", "A Better Personal Knowledge Archive"
];

createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  if (url.pathname.startsWith("/capture/")) return captureFixture(response, url.pathname);
  if (url.pathname === "/links.txt") return send(response, 200, "text/plain; charset=utf-8", `${ids.join("\n")}\n`);
  const record = url.pathname.match(/^\/lnk\/(Demo\d{4})\/index\.html$/);
  if (record) {
    const id = record[1], index = ids.indexOf(id), title = titles[index % titles.length];
    const base = `http://127.0.0.1:${port}/lnk/${id}/`;
    const html = generateRecordHtml({ id, targetUrl: `https://example.com/articles/${index + 1}`, createdAt: new Date(Date.UTC(2026, 7, 16 - (index % 15), 12)).toISOString().replace(".000", ""), title, description: "A controlled visual fixture for the journal experience", shortUrl: base, previewUrl: `${base}preview.jpg` });
    return send(response, 200, "text/html; charset=utf-8", html);
  }
  const preview = url.pathname.match(/^\/lnk\/Demo(\d{4})\/preview\.jpg$/);
  if (preview) return stream(response, path.join(previewDir, `${(Number(preview[1]) - 1) % 6 + 1}.jpg`), "image/jpeg");
  const staticPath = path.resolve(ROOT, url.pathname.replace(/^\/+/, "") || "index.html");
  if (!staticPath.startsWith(ROOT + path.sep)) return send(response, 403, "text/plain", "Forbidden");
  const type = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8" }[path.extname(staticPath)] || "application/octet-stream";
  return stream(response, staticPath, type);
}).listen(port, "127.0.0.1", () => console.log(`Fixture journal at http://127.0.0.1:${port}/`));

function send(response, status, type, body) { response.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" }); response.end(body); }
async function stream(response, file, type) { try { const info = await stat(file); if (!info.isFile()) throw new Error(); response.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store" }); createReadStream(file).pipe(response); } catch { send(response, 404, "text/plain", "Not found"); } }

function captureFixture(response, pathname) {
  const barrier = pathname.endsWith("/barrier");
  const unusable = pathname.endsWith("/unusable");
  const overlay = pathname.endsWith("/overlay");
  const long = pathname.endsWith("/long");
  const body = barrier ? '<main><h1>Sign in</h1><form><label>Password <input type="password"></label><button>Sign in</button></form></main>'
    : unusable ? '<main style="height:1000px;display:grid;place-items:center"><span aria-label="loading">Â·</span></main>'
    : `<header style="height:120px;background:#172430;color:white;padding:30px 90px">Fixture Magazine</header>
       ${overlay ? '<div role="dialog" aria-modal="true" style="position:fixed;z-index:99;inset:160px 50px;background:white;padding:80px"><h2>Cookies</h2><p>Choose how optional cookies are used.</p><button>Reject all</button></div>' : ''}
       <article style="width:1200px;min-height:730px;margin:80px auto;padding:55px 70px;background:#f5edda;color:#192a2f">
         <h1 style="font:64px Georgia;margin:0 0 28px">A Clear Guide to Thoughtful Static Software</h1>
         <p style="font:25px/1.5 Georgia;max-width:900px">Small dependable tools can create lasting value when their boundaries are explicit, their files remain inspectable, and their interfaces respect the reader.</p>
         <svg width="500" height="240" viewBox="0 0 500 240" role="img" aria-label="abstract landscape"><rect width="500" height="240" fill="#8db2ad"/><circle cx="380" cy="70" r="46" fill="#d88f56"/><path d="M0 220L170 80l90 95 70-60 170 105" fill="#274d50"/></svg>
       </article>${long ? '<div style="height:60000px"></div>' : ''}`;
  const html = `<!doctype html><html><head><title>ðŸš€ Fixture Article â€” æ—¥æœ¬èªž & Ð ÑƒÑÑÐºÐ¸Ð¹ 2026</title><meta property="og:title" content="ðŸš€ Fixture Article â€” æ—¥æœ¬èªž & Ð ÑƒÑÑÐºÐ¸Ð¹ 2026"><meta name="description" content="A controlled fixture â€” with stable metadata & visible content 2026"></head><body style="margin:0;background:#dbe4df;font-family:Arial">${body}</body></html>`;
  send(response, 200, "text/html; charset=utf-8", html);
}

```

## File content `work\validated-records\NZlciovW\index.html`:

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="lnk:id" content="NZlciovW">
<meta name="lnk:target" content="http://127.0.0.1:4173/capture/long">
<meta name="lnk:created" content="2026-08-16T21:52:03Z">
<title>Fixture Article æ—¥æœ¬èªž Ð ÑƒÑÑÐºÐ¸Ð¹</title>
<meta name="description" content="A controlled fixture with stable metadata visible content">
<meta property="og:title" content="Fixture Article æ—¥æœ¬èªž Ð ÑƒÑÑÐºÐ¸Ð¹">
<meta property="og:description" content="A controlled fixture with stable metadata visible content">
<meta property="og:image" content="https://example.github.io/link-journal/lnk/NZlciovW/preview.jpg">
<meta property="og:url" content="https://example.github.io/link-journal/lnk/NZlciovW/">
<meta property="og:type" content="website">
<meta http-equiv="refresh" content="0; url=http://127.0.0.1:4173/capture/long">
<script>location.replace("http://127.0.0.1:4173/capture/long")</script>
</head>
<body>
<p>Redirecting to the original page.</p>
<p><a href="http://127.0.0.1:4173/capture/long">Continue to the original page</a></p>
</body>
</html>

```

## File content `work\validated-records\p0yG0MvE\index.html`:

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="lnk:id" content="p0yG0MvE">
<meta name="lnk:target" content="http://127.0.0.1:4173/capture/article">
<meta name="lnk:created" content="2026-08-16T21:49:18Z">
<title>Fixture Article æ—¥æœ¬èªž Ð ÑƒÑÑÐºÐ¸Ð¹</title>
<meta name="description" content="A controlled fixture with stable metadata visible content">
<meta property="og:title" content="Fixture Article æ—¥æœ¬èªž Ð ÑƒÑÑÐºÐ¸Ð¹">
<meta property="og:description" content="A controlled fixture with stable metadata visible content">
<meta property="og:image" content="https://example.github.io/link-journal/lnk/p0yG0MvE/preview.jpg">
<meta property="og:url" content="https://example.github.io/link-journal/lnk/p0yG0MvE/">
<meta property="og:type" content="website">
<meta http-equiv="refresh" content="0; url=http://127.0.0.1:4173/capture/article">
<script>location.replace("http://127.0.0.1:4173/capture/article")</script>
</head>
<body>
<p>Redirecting to the original page.</p>
<p><a href="http://127.0.0.1:4173/capture/article">Continue to the original page</a></p>
</body>
</html>

```

## File content `work\validated-records\XtrsiHiV\index.html`:

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="lnk:id" content="XtrsiHiV">
<meta name="lnk:target" content="http://127.0.0.1:4173/capture/overlay">
<meta name="lnk:created" content="2026-08-16T21:49:49Z">
<title>Fixture Article æ—¥æœ¬èªž Ð ÑƒÑÑÐºÐ¸Ð¹</title>
<meta name="description" content="A controlled fixture with stable metadata visible content">
<meta property="og:title" content="Fixture Article æ—¥æœ¬èªž Ð ÑƒÑÑÐºÐ¸Ð¹">
<meta property="og:description" content="A controlled fixture with stable metadata visible content">
<meta property="og:image" content="https://example.github.io/link-journal/lnk/XtrsiHiV/preview.jpg">
<meta property="og:url" content="https://example.github.io/link-journal/lnk/XtrsiHiV/">
<meta property="og:type" content="website">
<meta http-equiv="refresh" content="0; url=http://127.0.0.1:4173/capture/overlay">
<script>location.replace("http://127.0.0.1:4173/capture/overlay")</script>
</head>
<body>
<p>Redirecting to the original page.</p>
<p><a href="http://127.0.0.1:4173/capture/overlay">Continue to the original page</a></p>
</body>
</html>

```


