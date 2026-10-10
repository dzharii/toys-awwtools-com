# AROMACOP

A self-contained browser demonstration of a modular mechanical character: **26 movable assemblies**, a hinged face shield, selectable/custom identities, a cinematic sidearm flourish and an interactive scene monitor.

## Open and explore

Open **`aromacop.html`** in a current browser with WebGL enabled. No installation, build, server or network connection is required. Drag the background to orbit, scroll/pinch to zoom, and drag armor to detach it. The manifest provides keyboard-friendly selection; walking, exploded view and Reset have Space/E/R shortcuts.

Open the shield to reveal an identity. Custom portraits and monitor images are processed locally. **Save HTML** downloads a complete portable copy containing your committed customization; it never silently overwrites the original file. Sidearm handling requires stopped walking and a mounted right arm/hip.

Sound and music start **off**. Effects and the original quiet ambient bed are synthesized entirely with built-in **Web Audio**, with master mute/volume and a separate ambient level. Optional word-by-word voice uses the browser's local **SpeechSynthesis** voices. There are no audio files, samples or runtime downloads.

## How it was developed

This is a human-directed, AI-assisted improvement process. Numbered versions preserve history; isolated candidates explore useful alternatives. The master compares implementations using real browser tests, reviews the code and visual craft, corrects observed failures, and publishes only after independent verification. Detailed reports and evidence live under **`.docs\runs`**; the application itself is still just one HTML file.

The master assistant is **GPT-6.1 Sol** (`gpt-6.1-sol`), running in the **GitHub Copilot CLI** terminal harness (1.0.95). Earlier independent implementation candidates used **GPT Astra** (`gpt-6-astra`). The master owns the installed **Playwright/Chromium** browser acceptance harness; ImageMagick/Pillow support development-time asset comparisons. None of these tools, AI models or external services is needed to run the delivered app.

## Final presentation

The current built-in artwork comes from **spe03/spe04**, optimized as alpha-preserving PNGs after visual/size comparisons. Source images and previous versions remain untouched. Music combines the broad ideas of unobtrusive ambient space and warm science-fiction synthesis—not copied themes or recordings. Audio-design references and complete review decisions are recorded with the final release evidence.

The final v0006 release is approximately **955 KB**, about **84% smaller** than v0005. Two independent final verification sets passed44 checks each; detailed final evidence is in **`.docs\runs\v0006\iteration-report.md`**.

Performance is measured on the documented desktop reference and mobile **emulation**, not promised for every device. Native audio behavior is tested without claiming subjective listening; tab-suspension checks use disclosed lifecycle emulation. Local speech depends on available browser/OS voices.
