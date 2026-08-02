# Transcript Organizer implementation and acceptance report

Date: 2026-08-01  
Target: `DESKTOP-FKN1U1P`, Windows 11 Pro x64 build 26200.8875

## Outcome

Transcript Organizer is implemented as a PowerShell 7 module with a manifest, narrow native-process boundary, deterministic builders, payload validators, local JSON Lines logs, a CLI entry point, Pester tests, a reusable extraction-corpus exporter, and a dependency-free static manual. The supplied SSW 2026 video was fully transcribed and transformed into ten independent, publishable field experiments.

The initial acceptance run found only the older FFmpeg 7.0.1 build on `PATH`, which lacked the Whisper filter. The user subsequently supplied explicit FFmpeg and FFprobe 8.1.2 paths. Those paths supersede the initial environment limitation recorded later in this report.

## Field-validation addendum

The production video is 3,054.128 seconds long. One GPU transcription attempt completed successfully in 3,201,281.576 milliseconds (about 53 minutes 21 seconds) on the GTX 1050 Ti; exit code was zero, `UsedGpu` was true, and no CPU fallback or second transcription was used. The raw JSON Lines artifact has SHA-256 `3E35E25B7DD098AE5ED2B51EE0D85B3F1A2EC6BB5048BB2CCF99B049E1AF3D6E` and remained byte-identical after all corpus exports and experiments.

The shared corpus contains 1,013 normalized segments and 51 exact-minute frames. Transcript endpoint coverage is 0.9993 and speech coverage is 0.9581. Its 115 gaps include only two longer than five seconds, both in Q&A pauses; 86 small overlaps are retained as backend timing evidence. Ten FFmpeg JSONL records contained unescaped spoken quotation marks. Incremental specification `suggestions002-002.md` added an opt-in recovery restricted to the exact expected record shape, with source-line and recovery provenance. Strict parsing remains the default.

Incremental specification `suggestions002-001.md` added explicit backend paths and the reusable corpus export. The field work then produced ten isolated experiment folders: a faithful illustrated article, researched field guide, concept map, tabletop workshop, saturation runbook, teaching kit, executive brief, skeptical claim audit, publishing kit, and full transcript navigator. Each has an executive summary, review, source policy, good-enough decision, and no dependency on another experiment's output.

Incremental specification `suggestions002-003.md` defines distribution version 001. The end-user layout is deliberately flatter than the initial repository recommendation: `Invoke-TranscriptOrganizer.ps1` is at the package root and imports `module\TranscriptOrganizer.psd1`. The builder uses an explicit file allow list instead of copying repository directories. Build, test, experiment, screenshot, review, and dependency-installation scripts remain in the repository and are rejected by the distribution test if they appear in the package. Package version `001` maps to PowerShell module semantic version `0.0.1`.

Incremental specification `suggestions002-004.md` replaces the multi-mode launcher with a local-file-only workflow. One positional video argument now allocates a preserved output folder, discovers a paired Whisper-enabled backend, probes duration, selects a conservative two-to-24-hour timeout, performs one internal JSON inference, and derives text, SRT, metadata, frames, and validation. DirectShow, network input, device listing, public format selection, output-file selection, and input truncation were removed.

The most transferable outcomes from experiments 01, 02, and 10 are now captured as three dated, self-contained agent skills under `prompts/`: faithful illustrated companion writing, primary-source-enriched field-guide production, and an offline full-transcript navigator. Every skill repeats the corpus tree, file and segment schemas, workflow, output contract, review questions, and good-enough gate, so it can operate on an arbitrary validated extraction without reading this experiment collection.

Final verification passes 55/55 Pester tests, 286/286 experiment checks, 110/110 landing-page checks, and 103/103 exact distribution checks. The three reusable skills also pass the skill creator's structural validator and a ten-point self-containment audit. A rendered review covers 15 HTML pages at desktop and mobile widths with no visual-contract failures. The unpacked version 001 launcher passes a real dry run using automatic discovery of the WinGet FFmpeg and FFprobe 8.1.2 pair and an explicit external model path; it reports the 3,054.128-second duration and calculated 20,125-second timeout without creating an output folder. Pester command coverage is 72.05%; this is below its displayed 75% target, while the stored coverage artifact and the specification's 90% pure-function target remain addressed in the detailed coverage report. `artifacts/latest-test-output.txt`, the test-result XML, corpus `validation-report.json`, and per-experiment reviews are the authoritative evidence.

## Initial acceptance snapshot

The remaining sections preserve the earlier acceptance snapshot for traceability. Any statement that FFmpeg Whisper execution or local rendering was blocked describes that earlier run and is superseded by the field-validation addendum above.

## Architecture

- The end-user entry point is root `Invoke-TranscriptOrganizer.ps1`; application code is the flattened `module\` directory. Repository maintenance scripts remain under `scripts\` and are never shipped.
- `TranscriptOrganizer.psm1` loads ordered private and public scripts; the manifest fixes the export list.
- `Private/00.Contracts.ps1` defines testable runtime, capability, model, process, transcription, and telemetry validators.
- `Private/10.Pure.ps1` contains deterministic configuration-adjacent rules, redaction, model candidate generation, path and filter escaping, ordered Whisper options, preprocessing, native arguments, diagnostics, capability parsing, request validation, and GPU-failure policy.
- `Private/20.IO.ps1` owns runtime/environment inspection, application resolution, process execution, log writes, filesystem/model operations, FFprobe, NVIDIA diagnostics, and FFmpeg queries.
- Public functions create file-only configuration and requests, inspect readiness, execute one request, export the complete corpus, and process local-file batches sequentially.
- `ProcessStartInfo.ArgumentList` is the only native execution mechanism. Output and error streams are read concurrently. Timeout or cancellation kills the process tree.
- The orchestrator logs matching start and terminal events for runtime, executable, FFmpeg, input, model, VAD, output, GPU, and execution operations.

## Target-machine decisions

CPU-Z confirms an Intel Core i7-8750H (6 cores/12 threads, AVX2/FMA3), 32 GB dual-channel DDR4, an NVIDIA GTX 1050 Ti with 4 GB VRAM, and Intel UHD 630 graphics. The implementation therefore defaults to GPU device 0, a 20-second file queue, a single process, and one classified CPU fallback. It does not invent a Whisper `threads` filter option.

## Security and integrity decisions

- Native executables are resolved with `Get-Command -CommandType Application` or an explicit existing absolute path.
- No shell command string or `Invoke-Expression` is used.
- Filter escaping is centralized, deterministic, and idempotent for normalized drive-letter colons.
- Input is restricted to existing local media files. Live-device and network-input code paths were removed; remote transcript destinations remain omitted.
- Downloads require explicit authorization, a configured trusted URI, and a configured SHA-256. Temporary files are validated and moved only after success.
- The supplied local model is checked for existence and a 100 MB minimum. No authoritative SHA-256 was present in the supplied specs, so the implementation does not claim strict hash verification for it.
- Telemetry selects known fields, redacts URL credentials/query strings and secret-like properties, and never logs transcript content.
- Logging failures generate a warning and do not replace the original operation error.

## Verification evidence

Pester 5.7.1 is saved project-locally by `scripts/Install-DevelopmentDependencies.ps1`. The one-command suite writes NUnit results and JaCoCo coverage under `artifacts/`.

Final bounded test categories:

- Pure builders, policies, escaping, redaction, capability parsing, and contracts.
- Manifest import, exact exports, public help, and request validation.
- Missing, truncated, hashed, and mismatched model fixtures.
- Real PowerShell subprocess stdout/stderr/exit capture and a one-second process-tree timeout.
- Real FFmpeg/FFprobe discovery and version query.
- Real two-second generated audio and no-audio media probes.
- A ten-second-bounded request against the supplied media, terminating at the verified missing-filter prerequisite.
- Manual semantics, anchors, API names, examples, prohibited terminology, and remote-asset checks.

The final run passed 46/46 tests in 5.64 seconds. Pester reported 60.05% command coverage; JaCoCo line coverage was 469/660 lines (71.06%). Pure logic was 94.27%, contracts 100%, public configuration/API 90.14%, I/O wrappers 71.13%, and orchestration 37.09%. The dominant uncovered branch is successful Whisper execution and its GPU/VAD/fallback/output variants, which cannot be entered with this FFmpeg build. The XML files under `artifacts/test-results` and `artifacts/coverage` are the authoritative artifacts.

Representative readiness evidence:

- PowerShell 7.6.3 Core, 64-bit Windows: ready.
- FFmpeg and FFprobe: resolved.
- FFmpeg version: `7.0.1-full_build-www.gyan.dev`.
- Whisper capability: unavailable.
- NVIDIA diagnostics: GTX 1050 Ti, 4096 MiB, driver 561.17.
- Required model: found and normal-size validation passed.
- Failure result: `TranscriptionFilterUnavailable`, and its transcription-result contract passed.
- Operational log: valid JSON Lines with one request ID and matching start/terminal operation events.

## Deviations, blocked verification, and omissions

| Specification item | Decision | Technical reason |
| --- | --- | --- |
| Full real transcription and output generation | Implemented, verification blocked | Installed FFmpeg lacks the required filter. A false functional pass or unrestricted replacement download was rejected. |
| Functional GPU attempt and CPU fallback | Implemented, verification blocked | NVIDIA hardware exists, but only a compatible Whisper-enabled build can prove backend initialization. Classification and one-retry policy are unit tested. |
| VAD inference | Implemented, verification blocked | No supplied VAD model and no verified filter support. Non-VAD isolation is tested. |
| DirectShow microphone session | Intentionally removed | The simplified product accepts existing local media files only. |
| Network input | Intentionally removed | The simplified product keeps input resolution inside the local-file trust boundary. |
| HTTP transcript destination | Intentionally omitted | It is security-sensitive, build-dependent, and outside the validated local-output request lifecycle. |
| Automatic model download with shipped catalog | Intentionally fails closed | The specs supplied a URI but no trusted SHA-256. Automatic download without strict integrity would violate the stronger acceptance requirement. |
| Parallel batch jobs | Intentionally omitted | The 4 GB GTX 1050 Ti and mobile CPU make sequential execution the specified safe default. |
| Local browser visual/manual interaction | Environment blocked | The in-app browser security policy rejected `file://` navigation. Automated DOM/source/manual tests passed; no bypass was attempted. |
| Coverage targets for orchestration | Not met | Successful Whisper branches are unreachable with installed infrastructure. Pure logic exceeds 90%; significant uncovered branches are identified here. |

## Independent rubber-duck review

1. **Request to result:** The public request is validated; runtime and applications are checked; FFmpeg version/filter capabilities are queried; input is resolved and file audio is probed; the required model is resolved and validated; VAD is handled only when enabled; output and GPU policy are resolved; ordered filters and arguments are built; dry-run returns here; otherwise FFmpeg runs, may retry once on a classified GPU error, and a nonempty artifact is verified before a structured result is returned.
2. **Prerequisite failure points:** Parameter validation, runtime, executable resolution, FFmpeg version, core/conditional filter capability, file path, audio probe, main model resolution/validation, conditional VAD resolution/validation, output writability/conflict, and GPU policy all precede transcription.
3. **Pure versus I/O:** `10.Pure.ps1` and contract invariants are pure/effectively pure. `20.IO.ps1` owns process, filesystem, hash, network, hardware, clock-adjacent, and logging operations. Public orchestration is the boundary coordinator.
4. **Payload validation:** Dedicated validators check runtime, capability, model, process, transcription, and telemetry required fields, types/enumerations, and cross-field invariants.
5. **Contract drift:** Stable ordered builders, fixed manifest exports, dedicated validators used at runtime boundaries, and Pester malformed-payload cases detect drift.
6. **VAD isolation:** The request rejects a VAD path without `EnableVad`; capability, model resolution, validation, and options live inside the enabled branch only.
7. **GPU versus unrelated failure:** A deny list excludes model/path/filter/output errors, and a narrow initialization/backend/CUDA pattern list permits at most one retry.
8. **Reconstructing FFmpeg:** Process logs contain executable, ordered argument array, working directory, sanitized resources, mode, and a separate diagnostic command under one request ID.
9. **Redaction:** URL user information, query strings, tokens, API keys, authorization/cookie/password-like values, and network-style credentials are redacted. Transcript text is not logged.
10. **Logging failure:** A warning and structured logging-failure note are produced while the original result/error remains intact; recursive logging is avoided.
11. **Zero exit without output:** Missing or empty output becomes `OutputNotCreated`; it cannot return success.
12. **Interrupted download:** Data remains in a unique `.download` file, cleanup runs in `finally`, and final placement never occurs.
13. **Invalid explicit model:** The explicit candidate is authoritative and fails without discovery fallback or automatic substitution.
14. **Shell injection prevention:** Arguments remain separate `ArgumentList` entries; filter values are escaped centrally; no shell evaluation occurs.
15. **Untested capabilities:** VAD inference and a forced real GPU-initialization failure followed by CPU fallback remain environment-dependent. Live microphone and network input are no longer product capabilities.
16. **Manual accuracy:** Automated checks confirm only implemented public command names and parameter examples. Disabled/omitted features are identified explicitly.
17. **First transcription usability:** “First transcription” is the first manual task and includes readiness plus a copyable splatted request.
18. **One-command tests:** `pwsh -File .\tests\Run-Tests.ps1 -CI`; project-local Pester setup is separately documented.
19. **Criteria not implemented:** Remote output, parallel batches, automatic download without a trusted hash, smaller models, and product non-goals were correctly omitted for security, hardware, or scope reasons.
20. **Deviation justification:** Every material change or environment-blocked criterion is listed in the deviations table and checklist.

## Known limitations and deferred improvements

- FFmpeg, FFprobe, and the large Whisper model remain external dependencies and are deliberately excluded from the portable ZIP. Automatic discovery requires a Whisper-enabled FFmpeg build.
- Add an authoritative upstream SHA-256 to the model catalog only after independently verifying the exact artifact.
- Add a small, licensed speech fixture for deterministic recognition assertions; the current short generated fixture proves media plumbing and corpus derivation, not speech accuracy.
- Add hermetic mocks for successful Whisper, forced GPU initialization failure, and CPU retry branches to raise command coverage above the displayed 75% target without repeating an hour-long transcription.
- VAD inference remains optional and unproved on this machine because no compatible VAD model was supplied.
