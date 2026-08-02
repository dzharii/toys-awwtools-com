---
name: 2026-08-01-build-searchable-transcript-navigator
description: Build a dependency-free, offline HTML transcript navigator from an arbitrary Transcript Organizer extraction corpus. Use when an agent must expose every normalized timestamped segment, preserve parser-recovery provenance, create continuous topic chapters, add lexical search and composable filters, show representative sampled frames, and link results back to the local source video without requiring a server.
---

# Build a Searchable Transcript Navigator

Transform a validated extraction corpus into a local, searchable source-verification interface. Preserve every normalized transcript segment and its provenance. Do not summarize or silently correct transcript text.

## Inputs

Require or infer:

- `CorpusRoot`: one Transcript Organizer output folder.
- `OutputDirectory`: a new or explicitly replaceable navigator folder.
- Optional `SourceVideoPath`: original local video or audio for timestamp links.
- Optional requested chapter count, defaulting to 6–12 based on source length and structure.

Transcript Organizer normally creates `<source-stem>-transcript` beside the input media. Repeated processing preserves it and creates `<source-stem>-transcript_001`, `_002`, and later suffixes. Use the corpus selected by the user and validate its manifest; folder suffix alone does not prove recency.

Expect:

```text
CorpusRoot/
  corpus-manifest.json
  media-metadata.json
  transcript.raw.jsonl
  transcript.segments.json
  transcript.txt
  transcript.srt
  transcription-result.json
  validation-report.json
  visual-index.json
  frames/
    frame-000000000ms.jpg
    frame-000060000ms.jpg
    ...
```

File contracts:

- `transcript.raw.jsonl`: immutable raw backend evidence. Never edit it.
- `transcript.segments.json`: canonical array. Each segment includes `Index`, `StartMilliseconds`, `EndMilliseconds`, seconds, duration, `Text`, `SourceLineNumber`, and `RecoveredFromMalformedJson`.
- `transcript.txt`: continuous-reading aid, not the navigator data source.
- `transcript.srt`: timing cross-check, not the data source.
- `media-metadata.json`: FFprobe streams and format metadata.
- `validation-report.json`: extraction status, strict-JSON state, recovered-record count, ordering, duration, coverage, gaps, overlaps, and frame sampling.
- `visual-index.json`: sampled frame timestamps, relative paths, sizes, and hashes.
- `frames/`: sampled JPEGs whose filenames encode millisecond timestamps.
- `corpus-manifest.json`: source identity, input path, duration, counts, backend provenance, and artifact hashes.
- `transcription-result.json`: operational provenance only.

Map equivalent artifacts explicitly if names differ. Do not use another navigator's chapters, prose, scripts, or selected frames.

## Output contract

Create:

```text
OutputDirectory/
  index.html
  segments.js
  chapters.json
  workflow-summary.json
  review.md
  assets/
    representative-frame.jpg
    ...
```

The navigator must open directly from `file://` without a local server, build step, package manager, remote asset, module import, or `fetch` request.

## Data contracts

### segments.js

Encode every segment once as a compact JavaScript assignment:

```javascript
window.TRANSCRIPT_SEGMENTS = [
  [startMilliseconds, endMilliseconds, "verbatim normalized text", recoveredBoolean]
];
```

Preserve array order, exact normalized `Text`, millisecond boundaries, and `RecoveredFromMalformedJson`. JSON serialization is valid JavaScript for these values; generate the payload mechanically instead of assembling quoted strings by hand.

### chapters.json

Store a JSON array:

```json
[
  {
    "id": "short-filesystem-safe-id",
    "label": "Human-readable chapter",
    "start": 0,
    "end": 600
  }
]
```

Use seconds for chapter boundaries and half-open intervals: `start <= segmentStart < end`. Chapters must be ordered, contiguous, non-overlapping, begin at zero, and end at or beyond media duration. The last chapter absorbs the final segment even when metadata rounding differs slightly.

## Workflow

### 1. Validate source integrity

Treat `CorpusRoot` as read-only. Refuse to replace a nonempty `OutputDirectory` without explicit authorization. If replacement is authorized, replace only the known navigator deliverables and preserve unrelated files.

Parse `transcript.segments.json` and require:

- at least one segment;
- nonempty text for each displayed record;
- finite, nonnegative start and end milliseconds;
- end not earlier than start;
- chronological ordering;
- actual count matching manifest and validation counts when present.

Read `validation-report.json`. Preserve and expose every recovered record. Compare `RecoveredRecordCount` with the actual true flags. Record gaps, overlaps, coverage, and missing frames as limitations rather than rewriting the transcript.

Resolve duration from manifest, validation, then metadata. Resolve the original media from explicit `SourceVideoPath`, then manifest `InputPath`; create clickable timestamps only when the file exists.

### 2. Define chapters from this source

Read the complete transcript in order. Mark changes in argument, subject, demonstration, interview phase, or Q&A. Create 6–12 broad chapters unless the source is unusually short or long.

For every proposed boundary:

- inspect segments immediately before and after it;
- place the boundary at a natural transition;
- use concise, specific labels rather than generic `Part 1` names;
- cover introductions and Q&A instead of treating them as unclassified residue;
- verify continuous coverage with no gap or overlap.

Write `chapters.json`. Also embed or load the identical chapter data in the offline page without using `fetch`. If embedding, generate it from the same in-memory object to prevent drift.

### 3. Build the segment payload mechanically

Convert each canonical segment to `[startMs, endMs, text, recovered]`. Serialize with a real JSON serializer and prefix it with `window.TRANSCRIPT_SEGMENTS=`. End with a semicolon.

After writing, load or parse the generated payload in a bounded test and assert:

- embedded count equals source count;
- first and last timestamps match;
- recovered count matches validation;
- concatenated text hashes or exact per-record comparisons match the normalized source;
- no segment was summarized, omitted, or reordered.

### 4. Choose representative frames

Use `visual-index.json` to select 3–8 frames spanning the source. Prefer chapter openings or visually meaningful nearby moments. Visually inspect each image, copy it to local `assets/`, and maintain a timestamp-to-filename mapping in `index.html`.

Describe images as representative sampled frames, not exact automatic slide matches. Choose the nearest mapped frame for the current chapter or hovered segment.

### 5. Implement the offline interface

Create a restrained technical-document layout with:

- one `h1` and a concise explanation of corpus scope;
- a search input;
- chapter navigation and a chapter selector;
- a recovered-record-only checkbox when recovered records exist;
- a clear/reset control;
- a live result count;
- chronological results with timestamps and transcript text;
- a bounded initial render plus `Show more` pagination;
- representative frame and plain-language reading key;
- responsive behavior for desktop and narrow screens.

Compose filters: text query, selected chapter, and recovered-only state must work together. Preserve chronology after filtering.

Use case-insensitive lexical substring search. State clearly that search is lexical, not semantic.

### 6. Enforce safe rendering

Treat transcript text as untrusted display data even though it is local.

- Escape `&`, `<`, `>`, double quotes, and single quotes before inserting text into HTML.
- Escape regular-expression metacharacters in a search term before highlighting.
- Highlight only after escaping transcript text.
- Never execute transcript text, use it as an attribute, or concatenate it into script source manually.
- Prefer DOM `textContent` for ordinary rendering. If using `innerHTML` for marks, pass only the output of the explicit escaping and highlighting function.
- Do not use `eval`, dynamic script creation, remote JavaScript, or network requests.

### 7. Link timestamps honestly

Format timestamps from segment start milliseconds. When the source media exists, link to its relative path with `#t=<floor(startMilliseconds/1000)>`. Otherwise display timestamps without anchors and explain that the original media path was unavailable.

Do not create web-video URLs or claim browser seeking support for a file that was not supplied.

### 8. Write summary and review

Create `workflow-summary.json`:

```json
{
  "name": "Full transcript navigator",
  "audience": "Readers, editors, and researchers locating source passages",
  "sourcePolicy": "Complete shared corpus transformed mechanically plus independently authored chapters; no sibling outputs",
  "workflow": ["List completed stages"],
  "primaryOutput": "index.html",
  "supportingOutputs": ["segments.js", "chapters.json", "assets/", "review.md"],
  "goodEnoughDefinition": "State the acceptance threshold",
  "outcome": "complete or incomplete",
  "sourceSegmentCount": 0,
  "sourceFrameCount": 0,
  "selectedFrameCount": 0,
  "externalSourceCount": 0,
  "reviewChecks": []
}
```

Replace placeholders with observed values.

Create `review.md` with:

- `Data review`: segment count, first/last time, exact text preservation, recovery count, chapter coverage, and frame mapping.
- `Interaction review`: search, filters, pagination, timestamp links, escaping, keyboard use, and local-file operation.
- `Limitations`: ASR errors, lexical search, sampled-frame precision, unavailable media, and any validation warnings.
- `Good-enough decision`: `Pass` or `Needs revision` with concrete reasons.

## Test matrix

Test the completed output from a local file URL:

| Case | Expected result |
| --- | --- |
| Empty query, all chapters | All segments match; initial DOM is bounded |
| Common word | Correct count; chronological matches |
| Mixed-case query | Same results as lowercase |
| `<script>` or HTML-like query | Display remains escaped; no execution |
| Regex characters such as `.*[]()` | Literal search and highlighting; no exception |
| One chapter | Only segments inside its half-open range |
| Recovered-only | Count equals validation recovery count |
| Search + chapter + recovery | Filters compose without resetting each other |
| No matches | Zero-result message; no stale rows |
| Show more | Adds the next bounded page without duplicates |
| Clear | Restores all filters and initial limit |
| First and last timestamp | Within media duration and linked only when media exists |
| Offline reload | Works without a server or network |

Also verify one `h1`, form labels, live status semantics, visible focus, keyboard-operable controls, no horizontal overflow, no missing assets, and no console errors.

## Rubber-duck review

Explain the implementation as if handing it to a skeptical archivist:

- Can every source segment be recovered from `segments.js` exactly?
- Where is parser recovery provenance visible?
- Can any query turn transcript text into executable markup?
- Do chapter boundaries cover the whole duration exactly once?
- Does every displayed count come from data rather than hardcoded prose?
- Will the page still work after the project is copied offline?
- Are frames described as samples rather than exact slide matches?
- Is any content borrowed from another navigator?

Revise until every answer is concrete and evidenced by a test.

## Definition of done

Declare completion only when the page opens locally without a server, exposes every normalized segment and recovery flag, offers safe composable lexical search and chapter filtering, bounds initial rendering, retains chronological context, uses honest representative frames, links to available source media, and passes the full test matrix. Never trade source completeness for a prettier interface.
