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
Hello😀World
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
Alpha — Beta
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
-- Статья о браузерах --
```

becomes:

```text
Статья о браузерах
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
🔥 Amazing Article — New Browser Tricks 🚀
```

Result:

```text
Amazing Article New Browser Tricks
```

### Example: supported multilingual text

Input:

```text
Guide — Руководство — 日本語 — 中文
```

Result:

```text
Guide Руководство 日本語 中文
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
