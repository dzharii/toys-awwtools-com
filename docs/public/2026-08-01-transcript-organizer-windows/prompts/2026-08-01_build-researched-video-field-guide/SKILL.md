---
name: 2026-08-01-build-researched-video-field-guide
description: Build a knowledge-dense, source-audited HTML field guide from an arbitrary Transcript Organizer video corpus and carefully selected primary or authoritative external research. Use when an agent must reconstruct a talk's argument, investigate named concepts and incidents, distinguish speaker inference from reported fact, prune irrelevant research, and publish a standalone technical article with a source ledger.
---

# Build a Researched Video Field Guide

Create a standalone technical field guide that begins with the source video's argument and adds only decision-relevant external knowledge. Reconstruct the source independently; never adapt another article or experiment output.

## Inputs

Require or infer:

- `CorpusRoot`: one Transcript Organizer extraction folder.
- `OutputDirectory`: a new or explicitly replaceable deliverable folder.
- Optional `SourceVideoPath`: original local media for timestamp links.
- Optional audience, publication style, and research limits supplied by the user.

Transcript Organizer normally writes the first extraction beside the source as `<source-stem>-transcript`; repeated runs preserve earlier results in `<source-stem>-transcript_001`, `_002`, and later available suffixes. Select the user-designated corpus and verify its manifest instead of assuming the unsuffixed folder is current.

Expect this corpus layout:

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

Use the files according to these contracts:

- `transcript.raw.jsonl`: immutable backend evidence. Never normalize it in place.
- `transcript.segments.json`: canonical timestamped transcript array. Each record contains `Index`, `StartMilliseconds`, `EndMilliseconds`, `StartSeconds`, `EndSeconds`, `DurationMilliseconds`, `Text`, `SourceLineNumber`, and `RecoveredFromMalformedJson`.
- `transcript.txt`: continuous-reading aid only.
- `transcript.srt`: subtitle cross-check only.
- `media-metadata.json`: FFprobe streams and format metadata.
- `validation-report.json`: extraction success, strict-JSON state, recovery count, timeline ordering, coverage, gaps, overlaps, frame count, and sampling interval.
- `visual-index.json`: frame `Index`, timestamps, `RelativePath`, size, and hash.
- `frames/`: sampled local JPEGs named by millisecond timestamp.
- `corpus-manifest.json`: source path, duration, counts, backend provenance, and artifact hashes.
- `transcription-result.json`: operational provenance, not editorial evidence.

If equivalent artifacts use different names, create an explicit mapping before work. Do not infer a schema from unrelated JSON.

## Output contract

Create:

```text
OutputDirectory/
  index.html
  workflow-summary.json
  review.md
  sources.md
  assets/
    selected-frame-name.jpg
    ...
```

Make the HTML locally complete except for deliberate citations to external sources. Use local illustrations, semantic headings, visible focus, responsive layout, descriptive link text, and no remote fonts, scripts, analytics, or decorative image dependencies.

## Workflow

### 1. Validate and protect the corpus

Treat `CorpusRoot` as read-only. Require a nonempty, ordered `transcript.segments.json`. Compare segment count and duration across the segments, manifest, validation report, and metadata. Record any recovered lines, large gaps, low coverage, or missing frames in the review.

Require a new or empty `OutputDirectory`. Refuse to replace existing work without explicit authorization; when replacement is authorized, replace only this workflow's known files and preserve unrelated content.

Accept narrowly recovered transcript records when the validation report declares provenance; do not hide recovery. Stop when validation makes chronology or text materially unreliable.

Resolve the source video from the explicit input first, then manifest `InputPath`. Use timestamp links only when the file exists.

### 2. Reconstruct the talk before researching

Read the complete normalized transcript, including Q&A. Build a chronological source outline containing:

- argument steps;
- named concepts, people, systems, papers, incidents, and mechanisms;
- factual assertions that could be externally checked;
- explicit speaker assumptions, uncertainty, humor, and provocation;
- audience questions that qualify the prepared material;
- candidate source-only quotations and frames.

Write a one-paragraph source thesis before opening external material. This prevents the research from replacing the talk with a generic topic survey.

### 3. Build a research agenda

For each possible research topic, state the decision it could improve. Retain a topic only if external evidence will do at least one of the following:

- verify or correct a named incident detail;
- explain a technical mechanism needed to understand the argument;
- locate the original theory, paper, standard, or documentation named in the source;
- translate the argument into an actionable engineering review;
- clarify a material boundary between reported fact and speaker inference.

Reject side topics that merely add novelty, notation, vendor examples, or volume. Prefer a small coherent source set over an exhaustive bibliography.

### 4. Research with an evidence hierarchy

Use current web research when available. Prefer sources in this order:

1. Original paper, talk, standard, or specification.
2. First-party incident report or engineering postmortem.
3. Official product, runtime, kernel, or platform documentation.
4. Authoritative institutional guidance.
5. High-quality secondary analysis only when no primary source exists and the limitation is explicit.

Do not use search-result snippets, unattributed summaries, content farms, or another generated article as evidence. Verify that each retained URL resolves and directly supports the associated claim. Record access date and page title.

If browsing is unavailable, do not fabricate citations. Produce a clearly marked incomplete source-only draft or stop and explain that the research-enriched definition of done cannot be met.

### 5. Maintain claim boundaries

Classify each material statement during drafting as one of:

- `Source`: stated or shown in the video corpus.
- `External fact`: directly supported by a cited primary or authoritative source.
- `Speaker inference`: the speaker's interpretation, labeled as such.
- `Author synthesis`: a reasoned connection made in the field guide, clearly framed as analysis.

Never let an official report appear to prove an internal mechanism it does not disclose. Never upgrade the speaker's assumption into fact. When sources conflict, state the conflict or omit the contested detail.

Use short source-video quotations sparingly and verify them against adjacent segments. Correct obvious ASR spellings only when source context or a visible slide is decisive.

### 6. Select and copy visual evidence

Use `visual-index.json` to locate candidate timestamps, visually inspect the corresponding frame, and copy only useful frames into `assets/`. Rename files descriptively, write literal alt text, and caption them as sampled source frames with timestamps.

Do not imply an exact slide match when sampling is coarse. Do not hotlink external images unless the user explicitly requests and licensing permits it; prefer source-video frames, diagrams created from verified facts, or no illustration.

### 7. Write the field guide

Organize the article around one operational argument, not a list of research notes. Include:

- a precise title and standfirst;
- a short research-boundary statement;
- the source's core model in the source's own sequence;
- research-enriched explanations and incident accounts;
- visible distinctions between facts and inferences;
- practical decision prompts, checklists, or review questions derived from the combined evidence;
- a concise synthesis that returns to the source thesis;
- descriptive inline links near the supported claims.

Use the article to deepen understanding, not to advertise tools or overload the reader. Delete a researched passage when removing it does not weaken an engineering decision.

When the source video is locally available, link timestamps with a relative URL and `#t=<whole-seconds>`. Otherwise render timestamps as text.

### 8. Write the source ledger

Create `sources.md` with the access date and this table:

```markdown
| Source | Source type | Why retained | Claims supported | Source boundary |
| --- | --- | --- | --- | --- |
```

For every external URL, record:

- descriptive title and link;
- primary, first-party, official documentation, institutional, or secondary classification;
- why it materially belongs;
- the narrow claims it supports;
- what it does not establish when overinterpretation is plausible.

End the ledger with a short list of attractive topics intentionally excluded and why.

### 9. Record summary and review

Create `workflow-summary.json`:

```json
{
  "name": "Researched video field guide",
  "audience": "Describe the intended technical readers",
  "sourcePolicy": "Extraction corpus plus primary or authoritative external sources; no sibling outputs",
  "workflow": ["List completed stages"],
  "primaryOutput": "index.html",
  "supportingOutputs": ["assets/", "sources.md", "review.md"],
  "goodEnoughDefinition": "State the publication threshold",
  "outcome": "complete or incomplete",
  "sourceSegmentCount": 0,
  "sourceFrameCount": 0,
  "selectedFrameCount": 0,
  "externalSourceCount": 0,
  "reviewChecks": []
}
```

Replace every placeholder with observed values.

Create `review.md` with:

- `Content review`: talk coverage, claim boundaries, incident checks, Q&A implications, and corrections.
- `Research review`: source hierarchy, URL verification, source-to-claim fit, conflicts, and pruned material.
- `Editorial review`: coherence, decision relevance, local assets, accessibility, and independence.
- `Good-enough decision`: `Pass` or `Needs revision` with reasons.

## Review gates

### Source audit

Rubber-duck every externally enriched paragraph:

- What did the video actually say?
- Which exact external source supports the added detail?
- Is the source primary enough for this claim?
- Does it establish the mechanism, or only the observed outcome?
- Have I labeled inference as inference?
- Would deleting this paragraph change a decision?

Remove, narrow, or relabel any passage that fails.

### Independence audit

Confirm that prose, section order, evidence selection, and conclusions were rebuilt from `CorpusRoot`, not copied from another experiment. Search the output for sibling experiment paths and remove them.

### Publication audit

Verify one `h1`, logical headings, responsive local styling, keyboard focus, descriptive links, valid assets, no broken timestamps, no uncited material external facts, and no remote runtime dependencies. Check narrow and desktop layouts.

## Definition of done

Declare completion only when the field guide remains faithful to the source thesis, adds decision-relevant depth, cites every material external addition near the claim, distinguishes report from inference, records a complete source ledger, contains no sibling-output dependency, and passes all three audits. Prefer an honest incomplete outcome over unsourced fluency.
