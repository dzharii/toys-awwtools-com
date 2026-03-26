If the user message contains a YouTube URL and no other substantive instructions or pasted content, 
treat that URL alone as an implicit request to process the video end to end under this agents.md workflow: resolve metadata, 
download the transcript and thumbnail assets, clean the transcript, generate the summary, and write the final Markdown output file. 
Before starting, check whether an output Markdown file and its associated downloaded assets for the same video already exist in the working location; 
if they do, do not overwrite them silently, and instead tell the user that matching output already exists and ask them to remove the existing 
output file and related assets before you proceed.

A00 Purpose

This document defines the behavior of a cross-platform coding agent that accepts
a YouTube URL, retrieves metadata, downloads subtitles without downloading the
video, cleans VTT subtitles into plain text, downloads a thumbnail preview,
runs a detailed transcript-based summarization prompt, and writes a dated
markdown result file.

The workflow must use the helper scripts in `scripts/linux/` and
`scripts/windows/`. The legacy `./yt.ps1` command surface has been retired,
removed, and must not be used.

B00 Inputs and outputs

Input:

- a single YouTube video URL

Primary output:

- a markdown file named `YYYY-MM-DD {sanitized-video-title}.md`

Example:

- `2026-03-26 Building a Cross Platform Agent.md`

Supporting outputs:

- `metadata.json`
- raw subtitle file in VTT format
- cleaned transcript TXT file
- thumbnail image file
- summary TXT file used to assemble the final markdown report

Recommended artifact layout:

```text
./artifacts/
  YYYY-MM-DD-video-title/
    metadata.json
    summary.txt
    subtitles/
      video-title.en.vtt
      video-title.en.vtt.txt
    thumbnails/
      video-title.webp
    2026-03-26 video-title.md
```

C00 Helper scripts

The agent must orchestrate the workflow by calling these entrypoint scripts.
Each script has one purpose, documents its CLI usage, logs its execution steps,
and fails fast on errors.

Linux entrypoints:

- `scripts/linux/get-video-metadata.sh`
- `scripts/linux/download-subtitles.sh`
- `scripts/linux/convert-vtt-to-txt.sh`
- `scripts/linux/download-thumbnail.sh`
- `scripts/linux/write-summary-markdown.sh`

Windows entrypoints:

- `scripts/windows/get-video-metadata.ps1`
- `scripts/windows/download-subtitles.ps1`
- `scripts/windows/convert-vtt-to-txt.ps1`
- `scripts/windows/download-thumbnail.ps1`
- `scripts/windows/write-summary-markdown.ps1`

Implementation support files:

- `scripts/linux/common.sh`
- `scripts/windows/common.ps1`

Required script responsibilities:

- `get-video-metadata`: fetch metadata JSON without downloading video media
- `download-subtitles`: download manual English subtitles when available and
  auto-generated English subtitles as fallback, then convert to VTT
- `convert-vtt-to-txt`: clean one VTT file into plain text
- `download-thumbnail`: download one preview image without downloading video
  media
- `write-summary-markdown`: assemble the final markdown report from explicit
  inputs

D00 CLI, logging, and code quality requirements

Every helper script must expose a documented CLI help entry point:

- Linux: `--help`
- Windows: `-Help` and standard PowerShell comment-based help

Each help section must document:

- purpose
- usage
- required parameters
- optional parameters and defaults
- examples
- outputs
- failure conditions

Logging requirements:

- log major execution steps before performing them
- log external commands in a copy-pastable form
- log important resolved paths
- log successful output creation
- log failures with enough context to diagnose the failing step

Error handling requirements:

- stop execution on the first error
- return non-zero exit codes when any step fails
- validate required arguments before doing work
- validate required tools before use
- validate expected outputs after tool execution
- do not continue after partial failure

Code quality requirements:

- keep code readable and manually maintainable
- use small helper functions for repeated behavior
- add brief comments only where the logic is not self-evident
- keep parameter names explicit and stable
- keep Linux and Windows interfaces conceptually aligned

E00 Platform and installation policy

The agent must be cross-platform and prefer platform-native installation paths.

Windows:

- prefer WinGet
- use `yt-dlp.yt-dlp` when `yt-dlp` is missing
- do not use Chocolatey when WinGet is available

Linux:

- prefer the system package manager first
- fall back to `python3 -m pip install --user --upgrade yt-dlp` only when a
  supported native package manager is unavailable

Tool verification:

- `yt-dlp --version` is required
- `ffmpeg` is optional and is not required for this markdown summary workflow

F00 Execution workflow

1. Validate the input URL.
2. Detect the operating system.
3. Create a deterministic artifact root for the video.
4. Execute the OS-specific metadata helper and write `metadata.json`.
5. Execute the OS-specific subtitle helper and write VTT files into
   `subtitles/`.
6. Choose the English VTT file to clean.
7. Execute the OS-specific VTT cleaner and write the transcript TXT file.
8. Execute the OS-specific thumbnail helper and write the preview image into
   `thumbnails/`.
9. Build a summarization request using the cleaned transcript and the prompt in
   section I00.
10. Write the LLM summary text into `summary.txt`.
11. Execute the OS-specific markdown writer and generate the final markdown
    file.
12. Stop immediately if any helper script exits non-zero.

Behavioral rules:

- never download the full video
- prefer manual English subtitles but allow English auto-subtitles
- default to VTT download and then clean to TXT
- use thumbnails instead of remote frame extraction
- create the final markdown report on every successful run
- fail clearly when no transcript source is available

G00 Linux command sequence

The agent must execute these Linux scripts in order.

Metadata:

```bash
scripts/linux/get-video-metadata.sh \
  --url "${URL}" \
  --output "artifacts/${DATE}-${SAFE_TITLE}/metadata.json"
```

Subtitles:

```bash
scripts/linux/download-subtitles.sh \
  --url "${URL}" \
  --output-dir "artifacts/${DATE}-${SAFE_TITLE}/subtitles" \
  --lang "en.*"
```

Transcript cleanup:

```bash
scripts/linux/convert-vtt-to-txt.sh \
  --input "artifacts/${DATE}-${SAFE_TITLE}/subtitles/${VTT_FILE}" \
  --output "artifacts/${DATE}-${SAFE_TITLE}/subtitles/${VTT_FILE}.txt"
```

Thumbnail:

```bash
scripts/linux/download-thumbnail.sh \
  --url "${URL}" \
  --output-dir "artifacts/${DATE}-${SAFE_TITLE}/thumbnails"
```

Markdown assembly:

```bash
scripts/linux/write-summary-markdown.sh \
  --video-url "${CANONICAL_URL}" \
  --video-title "${VIDEO_TITLE}" \
  --thumbnail-path "./thumbnails/${THUMB_FILE}" \
  --summary-file "artifacts/${DATE}-${SAFE_TITLE}/summary.txt" \
  --output "artifacts/${DATE}-${SAFE_TITLE}/${DATE} ${VIDEO_TITLE}.md"
```

H00 Windows command sequence

The agent must execute these Windows scripts in order.

Metadata:

```powershell
.\scripts\windows\get-video-metadata.ps1 `
  -Url $Url `
  -Output "artifacts\$Date-$SafeTitle\metadata.json"
```

Subtitles:

```powershell
.\scripts\windows\download-subtitles.ps1 `
  -Url $Url `
  -OutputDir "artifacts\$Date-$SafeTitle\subtitles" `
  -Language "en.*"
```

Transcript cleanup:

```powershell
.\scripts\windows\convert-vtt-to-txt.ps1 `
  -InputPath "artifacts\$Date-$SafeTitle\subtitles\$VttFile" `
  -OutputPath "artifacts\$Date-$SafeTitle\subtitles\$VttFile.txt"
```

Thumbnail:

```powershell
.\scripts\windows\download-thumbnail.ps1 `
  -Url $Url `
  -OutputDir "artifacts\$Date-$SafeTitle\thumbnails"
```

Markdown assembly:

```powershell
.\scripts\windows\write-summary-markdown.ps1 `
  -VideoUrl $CanonicalUrl `
  -VideoTitle $VideoTitle `
  -ThumbnailPath "./thumbnails/$ThumbFile" `
  -SummaryFile "artifacts\$Date-$SafeTitle\summary.txt" `
  -Output "artifacts\$Date-$SafeTitle\$Date $VideoTitle.md"
```

I00 Summary generation prompt

After the cleaned transcript file is created, the agent must pass its content
into the following prompt. The URL should be interpolated, and the transcript
content should be appended after the final instruction.

```text
You are given a transcript of a YouTube video at:
{{video_url}}

Analyze it and extract all the main ideas.

Write a series of short paragraphs, each paragraph expressing one main idea in clear, simple language.
Do not add fluff, filler, cliches, or commentary.
Do not summarize loosely; capture all essential concepts and arguments from the transcript.

Avoid repeating key labels and names too often; when possible, use pronouns or rephrase instead of repeating the same term.

When you introduce an important abstract word or key concept, you may add a single Markdown block quote right after the paragraph that defines that word in one very simple sentence.

Do not use titles, headings, numbered lists, or bullet lists.
Output only the paragraphs and occasional block quotes, as plain text.

Wait for transcript content.
```

J00 Final markdown file format

The final file format is:

```md
[{{video_title}}]({{video_url}})

> ![Thumbnail]({{thumbnail_relative_path}})

{{detailed_summary}}
```

Rules:

- use the canonical video URL if available from metadata; otherwise use the
  input URL
- pass a relative thumbnail path into the markdown writer when the markdown file
  and thumbnail live in the same artifact tree
- do not add headings, bullet lists, or extra commentary to the summary body
- preserve plain paragraph flow in the summary body

K00 Transcript cleaning behavior

The transcript cleaning logic must preserve the behavior from the legacy
PowerShell helper being replaced:

- remove `WEBVTT`, `Kind:`, and `Language:` header lines
- remove cue timing rows
- remove inline timestamp tags such as `<00:00:00.000>`
- strip remaining tags
- trim whitespace
- drop empty lines
- deduplicate adjacent repeated lines

L00 Legacy removal

The old `./yt.ps1` script has been removed from this folder. The agent must not
reference or attempt to recreate its command surface. All future work in this
folder must use the helper scripts listed in section C00.

M00 Agent behavior requirements

The agent must:

- execute the new OS-specific helper scripts in sequence
- use the helper logs to diagnose failures
- stop the workflow immediately when a helper returns an error
- keep all generated files inside a deterministic artifact root for the video
- write the final markdown report on every successful run

The agent must not:

- download the media file for this workflow
- require FFmpeg just to produce the markdown summary workflow
- add extra headings to the summary body
- silently skip errors or continue after helper failure
