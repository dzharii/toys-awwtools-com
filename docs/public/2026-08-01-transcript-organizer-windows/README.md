# Transcript Organizer — version 001

Transcript Organizer is a Windows-only PowerShell 7 module that turns speech-bearing local media into text, SRT, or JSON Lines artifacts through an FFmpeg build containing the `whisper` audio filter.

Distribution version 001 contains PowerShell module version 0.0.1. Its end-user ZIP is built from an explicit application-file allow list; repository maintenance and experiment scripts remain outside the package.

## Requirements

- Windows 10 or 11 x64
- PowerShell 7 or later
- `ffmpeg.exe` compiled with Whisper support and `ffprobe.exe`
- `ggml-model-whisper-medium.en-q5_0.bin` in the project root (already supplied)
- Pester 5.5+ for development; the bootstrap script saves Pester 5.7.1 inside `tools/`

Preview the complete resolved plan without transcribing or creating an output folder:

```powershell
pwsh -File .\Invoke-TranscriptOrganizer.ps1 '.\recording.webm' -DryRun
```

Create a complete transcript corpus with one positional argument:

```powershell
pwsh -File .\Invoke-TranscriptOrganizer.ps1 '.\recording.webm'
```

## Module API

```powershell
$manifest = '.\module\TranscriptOrganizer.psd1'
Import-Module $manifest -Force
$configuration = New-TranscriptOrganizerConfiguration -ProjectDirectory $PWD
$request = New-TranscriptOrganizerRequest -InputPath '.\recording.webm' -OutputFolder '.\recording-transcript'
$result = Invoke-TranscriptOrganizer -Request $request -Configuration $configuration
```

Pin an updated backend even when the current shell has a stale `PATH`:

```powershell
$configuration = New-TranscriptOrganizerConfiguration -ProjectDirectory $PWD -FFmpegPath 'C:\tools\ffmpeg.exe' -FFprobePath 'C:\tools\ffprobe.exe'
```

Create one reusable extraction corpus:

```powershell
Export-TranscriptOrganizerCorpus -InputPath '.\recording.webm' -OutputFolder '.\recording-transcript' -Configuration $configuration
```

FFmpeg 8.1.2 may leave quotation marks inside spoken JSON text unescaped. Corpus export preserves the raw JSONL, narrowly recovers only the known complete record shape, and exposes the recovery count in `validation-report.json`.

The root launcher exposes only `InputPath`, `OutputFolder`, `WhisperModelPath`, `Overwrite`, and `DryRun`. Operational defaults—including backend paths, GPU policy, VAD, queue, frames, and timeout policy—are documented in one editable settings block near the beginning of the script. VAD and model downloads remain disabled by default.

When `OutputFolder` is omitted, `recording.webm` creates `recording-transcript`; later runs create `recording-transcript_001`, `_002`, and so on. One internal JSON inference produces `transcript.raw.jsonl`, `transcript.txt`, `transcript.srt`, normalized segments, metadata, sampled frames, validation, and a corpus manifest.

The static user manual is [docs/manual/index.html](docs/manual/index.html). Open it directly from disk.

## Version 001 distribution

Build the end-user package from its explicit runtime-file allow list, then validate the complete directory and ZIP inventories:

```powershell
pwsh -File .\scripts\Build-Distribution.ps1
pwsh -File .\scripts\Test-Distribution.ps1
```

The outputs are `dist\transcript-organizer-windows-version-001\`, `dist\transcript-organizer-windows-version-001.zip`, and its `.sha256` sidecar. The package contains the root launcher, `module\`, runtime documentation, and the generated package manifest. Repository build, test, experiment, screenshot, and dependency-installation scripts are intentionally excluded.

## Saturation talk field study

The SSW 2026 source video has been fully processed once with the explicit FFmpeg 8.1.2 backend. Its reusable corpus is under `source-extraction/saturation-how-software-fails-at-scale/` and includes raw and normalized transcripts, text, SRT, media metadata, timeline statistics, 51 sampled frames, provenance, and a validation report.

Open [index.html](index.html) for the publication landing page, project description, visual report gallery, and executive experiment results. Ten clean-room transformations are cataloged in [experiments/README.md](experiments/README.md), with a dedicated HTML collection at [experiments/index.html](experiments/index.html).

Rebuild Experiments 02–10 from the shared corpus and validate all ten packages with:

```powershell
pwsh -File .\scripts\Build-SaturationExperiments.ps1
pwsh -File .\scripts\Test-ExperimentOutputs.ps1
```

Experiment 01 is deliberately editorial and retained as its reviewed artifact; the other nine are reproducibly generated without reading Experiment 01 or any sibling output.

## Reusable agent skills

Three successful workflows are also available as self-contained coding-agent skills for any Transcript Organizer corpus. Each skill repeats the complete corpus layout, file schemas, workflow, review gates, and good-enough definition; none depends on this talk or another experiment output.

- Experiment 01: [Create a Faithful Video Companion](prompts/2026-08-01_create-faithful-video-companion/SKILL.md) produces a detailed source-only illustrated HTML article.
- Experiment 02: [Build a Researched Video Field Guide](prompts/2026-08-01_build-researched-video-field-guide/SKILL.md) adds decision-relevant primary or authoritative research with a claim-level source ledger.
- Experiment 10: [Build a Searchable Transcript Navigator](prompts/2026-08-01_build-searchable-transcript-navigator/SKILL.md) preserves every normalized segment in a safe offline search and chapter interface.

Regenerate the landing-page screenshots and JPEG social preview, then validate its local links, metadata, assets, and browser layout with:

```powershell
$env:WORKSPACE_NODE_MODULES = 'C:\path\to\node_modules'
node .\scripts\Capture-ProjectScreenshots.cjs
pwsh -File .\scripts\Test-ProjectLandingPage.ps1
```

## Tests

Install the project-local Pester dependency once:

```powershell
pwsh -File .\scripts\Install-DevelopmentDependencies.ps1
```

Run unit tests, bounded integration tests, coverage, and result export with one command:

```powershell
pwsh -File .\tests\Run-Tests.ps1 -CI
```

Generated results are written to `artifacts/test-results/`, coverage to `artifacts/coverage/`, and operational logs to `artifacts/logs/`. Integration tests cap input duration, process time, concurrency, and retries.

## Hardware policy

The target is an i7-8750H, 32 GB RAM, and GTX 1050 Ti with 4 GB VRAM. GPU device 0 is preferred for files, CPU fallback is attempted at most once and only for recognized GPU initialization failures, and batch requests run sequentially. The FFmpeg Whisper filter has no documented thread-count option, so the module does not add one.
