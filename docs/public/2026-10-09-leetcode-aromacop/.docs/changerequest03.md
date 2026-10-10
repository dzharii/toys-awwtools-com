# AROMACOP final-release request

2026-10-09. Continues accepted v0005, cumulative iteration04, with v0006 / iteration05. Original requirements and two-run release gates remain in force.

## A00 Final portraits and size

Replace the two built-in identities using current `ref-images\spe03.png` and `spe04.png`. Preserve source files and prior versions. The user explicitly permits resizing, PNG dithering/palette trials or format conversion to optimize the HTML **without sacrificing presentation quality**; this supersedes the earlier requirement to embed the original source PNG bytes unchanged.

Compare size and visible quality, preserve intended transparency/composition, record source/embedded hashes and selected processing. Prefer reliable perceptual fidelity over the smallest file. All runtime assets stay embedded in the one standalone HTML.

## B00 Final review and focused polish

Review code, design and art across every implemented capability. Preserve working geometry, controls and workflows; fix high-confidence bugs or simple relevant refinements, not speculative redesigns. Record the functionality-by-functionality decisions and browser evidence.

## C00 Native sound and original quiet music

Research online audio-design principles and broad ambient/science-fiction synth influences. Create an original, simple, restrained optional background texture; do not reproduce recognizable copyrighted melodies, scores, recordings or samples.

**All added music and effects must be synthesized with built-in Web Audio. No external audio files, samples, libraries, services or runtime downloads.** Retain the already-required optional browser-native local word-by-word speech feature.

Add sparse useful mechanical effects at actual scene events rather than every interface action. Respect Sound/volume, explicit opt-in, zero-volume silence, hidden/GPU-loss pause and complete cleanup. Quiet independent music level, bounded reusable graph and speech/reading ducking are appropriate. Startup/export stays silent. New audio cannot disable visual functions.

## D00 High-level README

Introduce the standalone app and how to open/use/save it. Explain the development process at a very high level: isolated numbered candidates, master-owned real browser evidence, comparison/correction and verification before promotion. Introduce the actual model and harness accurately, distinguish development tools from runtime dependencies, and point to detailed evidence rather than duplicating it.

## E00 Final acceptance

Use installed ImageMagick, browser and development tools. No project package/build dependency. Carry all existing tests and add image-size/fidelity/alpha, music/effect/lifecycle/resource and graphics-failure checks. Require the established quality gates and two independent complete master Playwright passes before publishing. Keep numbered history, source assets and references intact; report limitations honestly.
