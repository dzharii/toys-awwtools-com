---
name: 2026-08-01-create-faithful-video-companion
description: Create a faithful, detailed, illustrated HTML companion to an arbitrary talk, lecture, interview, or presentation from a Transcript Organizer extraction corpus. Use when an agent receives normalized timestamped transcript segments, validation data, media metadata, a visual frame index, and sampled screenshots and must produce a publishable source-only article without external research or invented context.
---

# Create a Faithful Video Companion

Produce a durable reading companion that reconstructs the source video's complete argument in clear technical prose. Work only from the extraction corpus and the source video when available. Do not use another experiment, an earlier article, or external research.

## Inputs

Require two paths from the user or infer them from the task:

- `CorpusRoot`: one Transcript Organizer output folder.
- `OutputDirectory`: a new or explicitly replaceable directory for this article.

Accept an optional `SourceVideoPath`. Otherwise, read `InputPath` from `corpus-manifest.json`. Treat a missing or stale manifest path as unavailable; never invent a media link.

Transcript Organizer normally creates `CorpusRoot` beside the media as `<source-stem>-transcript`. If that folder exists, later runs use `<source-stem>-transcript_001`, `_002`, and the next available suffix. Do not assume the unsuffixed folder is newest; identify the corpus the user selected and validate its manifest.

Expect this self-contained corpus layout:

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

Interpret the files as follows:

- `transcript.raw.jsonl`: byte-preserved backend evidence. Read only for an audit; never edit or silently repair it.
- `transcript.segments.json`: canonical working transcript. It is an array whose records contain `Index`, `StartMilliseconds`, `EndMilliseconds`, `StartSeconds`, `EndSeconds`, `DurationMilliseconds`, `Text`, `SourceLineNumber`, and `RecoveredFromMalformedJson`.
- `transcript.txt`: readable fallback for continuous reading. Do not use it when timestamp or recovery provenance matters.
- `transcript.srt`: subtitle representation. Use it to cross-check displayed timing, not as a second source of truth.
- `media-metadata.json`: FFprobe `streams` and `format` data, including duration and media characteristics.
- `validation-report.json`: extraction quality and timeline checks. Important fields include `Succeeded`, `RawJsonLinesStrictlyValid`, `RecoveredRecordCount`, `SegmentsOrderedByStart`, coverage ratios, gaps, overlaps, frame count, and frame interval.
- `visual-index.json`: array of sampled-frame records containing `Index`, `TimestampMilliseconds`, `TimestampSeconds`, `RelativePath`, `SizeBytes`, and `Sha256`.
- `frames/`: local JPEG screenshots named by zero-padded millisecond timestamp.
- `corpus-manifest.json`: source identity, original input path, duration, segment count, backend provenance, and artifact hashes.
- `transcription-result.json`: operational inference result. Use it only for provenance, never as article content.

If filenames differ, map equivalent files explicitly before continuing. Do not guess a schema from unrelated files.

## Output contract

Create only these deliverables inside `OutputDirectory`:

```text
OutputDirectory/
  index.html
  workflow-summary.json
  review.md
  assets/
    selected-frame-name.jpg
    ...
```

Make `index.html` dependency-free except for its own local assets. Use semantic HTML, embedded CSS or a copied local stylesheet, one `h1`, visible focus styles, responsive layout, descriptive alternative text, and no remote fonts, scripts, trackers, or images.

## Workflow

### 1. Protect the evidence

Treat `CorpusRoot` as immutable. Record hashes from `corpus-manifest.json` when present. Copy selected frames into `OutputDirectory/assets`; never link into another experiment directory.

Refuse to replace a nonempty output directory unless the user explicitly authorizes replacement. If replacement is authorized, preserve unrelated files and replace only this workflow's known deliverables.

### 2. Validate corpus sufficiency

Read `validation-report.json` before drafting.

- Require `transcript.segments.json` to exist, parse as JSON, contain at least one nonempty segment, and be ordered by start time.
- Require every segment to have finite start and end times with end not earlier than start.
- Compare actual segment count with the manifest and validation report when those counts exist.
- Note recovered records, large gaps, low endpoint coverage, or missing frames in the review.
- Do not treat `RawJsonLinesStrictlyValid: false` as a failed corpus when narrow recovery is declared and recovered records retain provenance.
- Stop and report a blocker when validation failed in a way that makes chronology or text unreliable.

Resolve duration in this order: manifest `MediaDurationSeconds`, validation `MediaDurationSeconds`, then `media-metadata.json` format duration. Report disagreements instead of choosing silently.

### 3. Read the complete source

Read all normalized segments from beginning to end, including introductions, disclaimers, transitions, and Q&A. Build a private chronological outline with:

- time range;
- subject or argument step;
- speaker claim;
- example, incident, analogy, or demonstration;
- qualification or uncertainty;
- useful short quotation candidates;
- nearby visual-frame candidates.

Do not draft from keyword search alone. Search helps relocate evidence after the complete read; it does not establish the talk's structure.

### 4. Establish the article thesis and reading path

Write one sentence that captures the source's central claim without making it broader or stronger. Build a chronological section outline that covers the prepared material and any Q&A that changes, qualifies, or extends the argument.

Prefer 5–10 coherent sections. Combine repetitive passages, but do not omit a material argument step merely to shorten the article. Distinguish:

- what the speaker asserts;
- what an example illustrates;
- what the speaker labels as an assumption or inference;
- what the article author infers from the source.

### 5. Select evidence and illustrations

Select a small set of exact, short quotations that carry distinctive phrasing. Verify each quote against adjacent segments and preserve its meaning. Do not turn imperfect ASR into long block quotations. Correct an obvious recognition error only when repeated audio context or a visible slide makes the intended wording clear; disclose material corrections in `review.md`.

Select representative frames through `visual-index.json`:

1. Identify the target timestamp from the outline.
2. Choose the nearest useful indexed frame, while visually checking that it supports the surrounding passage.
3. Copy it into local `assets/` with a descriptive filename.
4. Write literal alt text describing what is visible.
5. Caption it with the source timestamp and state that it is a sampled frame.

Do not claim that minute-sampled frames capture exact slide transitions. Prefer no image over a misleading image.

### 6. Write the HTML article

Write detailed blog-post-like technical prose that can replace casual note-taking while remaining readable. Include:

- a precise title and one-paragraph standfirst;
- a short statement of source scope and research boundary;
- a linked contents list for longer articles;
- chronological sections with timestamp evidence;
- locally copied source illustrations;
- a final synthesis that reflects the speaker's conclusion;
- a source-and-fidelity note describing ASR, visual sampling, and any missing information.

When the original media file exists, link timestamps as a relative media URL with `#t=<whole-seconds>`. When it does not exist, display the formatted timestamp without a broken link.

Do not add a speaker biography, conference abstract, incident detail, definition, or historical claim unless it appears in the corpus or is visibly supported by the source video. This workflow is intentionally not research-enriched.

### 7. Create provenance outputs

Write `workflow-summary.json` with:

```json
{
  "name": "Faithful illustrated video companion",
  "audience": "Describe the intended readers",
  "sourcePolicy": "Extraction corpus and source video only; no external research or sibling outputs",
  "workflow": ["List the completed workflow stages"],
  "primaryOutput": "index.html",
  "supportingOutputs": ["assets/", "review.md"],
  "goodEnoughDefinition": "State the acceptance threshold",
  "outcome": "complete or incomplete",
  "sourceSegmentCount": 0,
  "sourceFrameCount": 0,
  "selectedFrameCount": 0,
  "externalSourceCount": 0,
  "missingInformation": []
}
```

Replace placeholder counts and text with observed values.

Write `review.md` with four sections:

1. `Content review`: chronology, claims, examples, corrections, quote checks, and Q&A coverage.
2. `Presentation review`: HTML semantics, accessibility, responsiveness, local assets, and link checks.
3. `Information sufficiency assessment`: what the corpus enabled and what remained unavailable.
4. `Good-enough decision`: `Pass` or `Needs revision`, followed by a concrete justification.

## Review gates

Perform two separate reviews after the first draft.

### Fidelity review

Rubber-duck every section aloud as if explaining it to a skeptical editor:

- Which exact time range supports this paragraph?
- Is this the speaker's claim, an example, or my inference?
- Did I accidentally import knowledge not present in the corpus?
- Does the quote preserve adjacent context?
- Did Q&A alter this conclusion?
- Does the image actually show what the caption says?

Revise or remove any passage that cannot answer those questions.

### Publication review

Verify:

- one primary heading and a logical heading hierarchy;
- keyboard-accessible links and visible focus;
- descriptive local image paths and alt text;
- no missing local assets or remote dependencies;
- no horizontal overflow at narrow widths;
- readable line length and restrained technical-document styling;
- no references to this skill, an experiment number, or the original project's folder names in the public article;
- every timestamp is valid and within media duration.

## Definition of done

Declare completion only when the article faithfully reconstructs the material argument and relevant Q&A, is detailed enough to be useful without watching the whole source, uses honest sampled illustrations, contains no known material invention, and passes both review gates. If the corpus cannot support that threshold, deliver an explicitly incomplete review rather than filling gaps from memory.
