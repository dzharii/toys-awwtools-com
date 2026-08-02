---

A00 AGENTS.md

---

# Transcript Organizer

Transcript Organizer is a Windows-only PowerShell 7 project that converts speech-bearing media into local transcript artifacts using FFmpeg and the included speech-recognition model. The implementation should support validated text, SRT, and JSON Lines output; prerequisite and model checks; optional VAD handling; GPU-preferred execution with controlled CPU fallback; structured operational logging; Pester tests; and a concise static HTML user manual.

Work only inside this project directory:

```text
D:\
```

Do not modify files outside the project directory. Read the specifications before implementation:

```text
.specs\info-001-about-whisper-in-ffmpeg.md
.specs\suggestions001-1.md
.specs\suggestions001-2.md
```

Use the specifications together. Resolve inconsistencies with sound engineering judgment and document material deviations. Maintain an implementation checklist, implement testable pure functions around narrow I/O boundaries, validate structured payload contracts, and run an independent acceptance review before declaring completion.

Available project resources:

```text
CPU-Z-DESKTOP-FKN1U1P.txt
```

Contains the target Windows machine and hardware configuration. Use it when selecting and validating CPU, GPU, concurrency, and fallback behavior.

```text
ggml-model-whisper-medium.en-q5_0.bin
```

The required local English transcription model. Reuse this file; do not download another copy unless a test explicitly requires download behavior.

```text
Saturation_-_How_Your_Software_Will_Fail_at_Scale_-_Lorin_Hochstein_SSW_2026.webm
```

Real media input for integration and transcription testing. Never process the complete recording merely to verify basic behavior. Use short bounded segments, normally 10 to 30 seconds, with explicit execution timeouts.

All expensive tests must limit media duration, timeout, concurrency, retry count, and downloaded data. Real FFmpeg and transcription tests are required when supported, but use the smallest input that proves the behavior. Stop and redesign unexpectedly slow tests rather than repeatedly consuming CPU or GPU resources. Do not run unrestricted batch jobs, indefinite microphone tests, repeated model downloads, or unbounded retries.
