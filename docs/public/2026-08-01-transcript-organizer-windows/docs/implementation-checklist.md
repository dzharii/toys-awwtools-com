# Transcript Organizer implementation checklist

Status values: `not started`, `in progress`, `completed`, `blocked`, `changed`, `intentionally omitted`.

This checklist was created before implementation and now covers the original specifications plus every incremental change request through `suggestions002-004.md`.

## Required implementation

| Area | Status | Verification |
| --- | --- | --- |
| Repository/module structure and manifest | completed | Root launcher imports flattened `module\TranscriptOrganizer.psd1`; the 55-test suite and packaged automatic-discovery dry run pass. |
| Versioned allow-listed distribution | completed | Version 001 contains exactly 13 allow-listed runtime source files plus generated README and manifest; 103/103 directory, manifest, ZIP, exclusion, link, and checksum checks pass. |
| Default and normalized configuration | completed | Tests verify the contiguous user-editable defaults block, target-machine defaults, model catalog, normalized directories, GPU/VAD policy, frames, queue, and timeout policy. |
| Request builder and centralized validation | completed | Tests cover the local-file, output-folder, internal-JSON, VAD-isolated, duration-aware request and contradictory GPU policies. |
| Runtime and executable prerequisites | completed | Real Windows/Core/7+/x64 payload and paired project-local, WinGet, PATH, and Program Files executable discovery pass. |
| FFmpeg version and Whisper capability inspection | completed | Fixture parser tests pass; automatic discovery selects the paired WinGet FFmpeg/FFprobe 8.1.2 build and verifies the Whisper filter. |
| Input resolution and FFprobe audio validation | completed | Bounded real two-second audio/no-audio fixtures pass expected probes. |
| Required model discovery and validation | completed | Search order, explicit authority, size, known hash, and mismatch tests pass. |
| Explicit model download workflow | changed | Opt-in, temporary-file, cleanup, and atomic-placement code exists; shipped catalog refuses download because no trusted SHA-256 was supplied. |
| Conditional VAD model workflow | completed | Non-VAD isolation and ordered conditional option tests pass; real VAD inference is environment-blocked. |
| Filter option/preprocessing builders and escaping | completed | Deterministic/invariant/path/VAD tests pass. |
| Native FFmpeg argument and diagnostic builders | completed | Boundary, stream, internal JSON, `NUL`, quoting, and redaction tests pass; obsolete input-truncating `-t` is absent. |
| Native process wrapper and cancellation | completed | stdout/stderr/exit/duration and one-second process-tree timeout tests pass; public cancellation token is supported. |
| GPU detection, policies, failure classification, one CPU retry | completed | Detection and deterministic/classification tests pass; the full 50:54 production transcription completed on the GTX 1050 Ti with one GPU attempt and no CPU fallback. |
| Output resolution, writability, overwrite, and verification | completed | Pure path policies allocate the unsuffixed folder followed by `_001`, `_002`, and later suffixes; overwrite is bounded to known generated artifacts. |
| Structured errors and payload contracts | completed | Dedicated malformed-payload tests cover all important result contracts. |
| JSON Lines operational logging and redaction | completed | Logs parse per-line with request/operation IDs, matching stage events, durations, and redaction. |
| Public readiness, request, transcription, dry-run, and batch APIs | completed | Exports/help/contracts are tested; batch concurrency is sequential. |
| CLI entry point | completed | One positional file argument is the beginner workflow; only `OutputFolder`, `WhisperModelPath`, `Overwrite`, and `DryRun` supplement it. Device, network, format, output-file, and check modes were removed. |
| Pester unit suite | completed | Project-local Pester 5.7.1 runs deterministic tests without external infrastructure. |
| Pester integration suite | completed | Bounded real process/FFmpeg/FFprobe/media/model tests pass. |
| Bounded real transcription smoke test | completed | Integration tests create a short reusable corpus with every promised artifact, then run the actual root launcher positionally against the production video in non-writing dry-run mode with automatic FFmpeg 8.1.2 discovery. |
| Coverage collection | completed | JaCoCo coverage is stored; pure logic exceeds 90% and infrastructure-limited orchestration gaps are reported. |
| Static local user manual | completed | Semantic/API/anchor/asset/keyboard-source checks pass; 15 publication HTML pages render at desktop and mobile widths without visual-contract failures. |
| README and one-command developer workflow | completed | Setup, quick start, project-local Pester, paths, and one-command test workflow are documented. |
| Stable error-code/reference documentation | completed | `docs/error-codes.md` matches orchestrator codes and remedies. |
| Source/pattern verification | completed | Automated tests and final scan record intentional matches and prohibit unsafe patterns. |
| Coding-agent implementation report | completed | Architecture, security, environment, evidence, gaps, deviations, and 20 review answers are recorded. |
| Shared extraction corpus exporter | completed | One transcription is reused to export manifest, metadata, raw and normalized transcripts, SRT, readable text, timeline statistics, 51 sampled frames, and a validation report. |
| Malformed backend quote recovery | completed | Strict parsing remains default; explicit recovery accepts only the exact FFmpeg record shape, records source-line provenance, and reports all 10 recovered records. |
| Ten clean-room field experiments | completed | Ten isolated packages have primary outputs, summaries, reviews, good-enough decisions, and no sibling-output dependencies; 286 publication checks pass. |
| Reusable agent skills | completed | Experiments 01, 02, and 10 are distilled into three dated, independently validated `SKILL.md` packages that repeat the complete corpus contract and recreate their workflows for arbitrary extracted videos. |
| Independent final acceptance review | completed | Specs were re-read; parser, automatic backend selection, timeout calculation, dry-run non-creation, corpus integrity, help, manual source, skill self-containment, experiment isolation, rendered HTML, JavaScript, and the final 55-test suite were independently reviewed. |

## Optional or deferred scope

| Area | Status | Reason / verification |
| --- | --- | --- |
| DirectShow microphone capture | intentionally omitted | Removed by `suggestions002-004.md`; the version 001 product now accepts local media files only. |
| Network media input | intentionally omitted | Removed by `suggestions002-004.md`; remote input is outside the simplified local-file trust boundary. |
| HTTP transcript destinations | intentionally omitted | The core public API writes validated local artifacts; remote output is a security-sensitive source capability and is not required by the main request lifecycle. Document this deviation in the final report. |
| Parallel batch transcription | intentionally omitted | Target GTX 1050 Ti has 4 GB VRAM; specification recommends sequential processing. Verify batch concurrency remains one. |
| Smaller live model profiles | intentionally omitted | No smaller model is supplied and the specification identifies this as a future optional improvement. |
| Speaker diarization, summarization, correction, video editing | intentionally omitted | Explicit product non-goals; confirm the manual makes no such claims. |
