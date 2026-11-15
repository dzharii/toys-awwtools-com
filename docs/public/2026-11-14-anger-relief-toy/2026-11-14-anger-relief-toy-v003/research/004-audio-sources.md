# Audio source and construction research: feature 004

Research date: 2026-11-15. This record distinguishes collection-level licensing from approval of an individual recording. No external recording, audio engine or third-party synthesis implementation was downloaded, copied or executed for this work. Runtime playback is project-owned Web Audio synthesis; no network audio requests are needed.

| Primary source | Rights observed | Candidate uses and decision |
| --- | --- | --- |
| [Kenney Impact Sounds](https://kenney.nl/assets/impact-sounds) | Official collection identifies Creative Commons CC0. | Material impacts and falling objects; a plausible future sample source. No individual sound auditioned or included. |
| [Kenney Interface Sounds](https://kenney.nl/assets/interface-sounds) | Official collection identifies 100 files and CC0. | Candidate mechanical dial ticks and selection clicks. Indexed official page verified; direct retrieval restricted in this environment. No asset included. |
| [Kenney UI Audio](https://kenney.nl/assets/ui-audio) | Official page identifies 50 files, CC0, initial version 1.0 released in 2012. | Softer interface confirmations. No asset included. |
| [Kenney Sci-fi Sounds](https://kenney.nl/assets/sci-fi-sounds) | Official page identifies 70 files and CC0. | Fictional electronic effects; indexed official page verified. No asset included. |
| [ChipTone, SFBGames](https://sfbgames.itch.io/chiptone) | Author states generated sounds may be used for any purpose under CC0. This is a grant for output, not permission to redistribute the application. | Candidate development-time sound exporter. Not a runtime dependency and not used to generate this release's sounds. |
| [ZzFX, Frank Force / KilledByAPixel](https://github.com/KilledByAPixel/ZzFX) | Primary repository identifies MIT. | Technical comparison for compact synthesis. No implementation copied; no MIT code bundled. |
| [Freesound licensing FAQ](https://freesound.org/help/faq/) | Rights vary per recording; commercial restrictions and attribution can apply. CC0, CC BY and CC BY-NC are not interchangeable. | Material-specific fractures remain a possible future sample improvement. No file selected, so no recording is approved. |
| [Sonniss GDC bundle license](https://sonniss.com/gdc-bundle-license/) | Version 2.0, effective 27 August 2026, allows synchronized finished projects and prohibits supplying sounds as sound effects, including asset packs/templates/SDKs. AI training is prohibited. Rights depend on the license applicable on download day. | Unsuitable as an casually redistributable source asset in an open source archive without further rights review. No sounds downloaded, processed or included. |

## Initial construction direction

Original synthesis avoids sample redistribution uncertainty, remote fetches, decoding latency and a runtime engine dependency. It is not a claim that synthesized material sounds are automatically superior. Important interactions require contextual listening before subjective acceptance. A later individually approved CC0 fracture recording may improve Shatter if listening demonstrates that the current profile lacks material credibility.

| Interaction | Construction alternatives investigated | Selected initial direction |
| --- | --- | --- |
| Punch | Pure low sine body; filtered noise slap; layered body plus brief transient | Layered low-frequency body and short band-limited transient, restrained high frequencies and bounded pitch variation. |
| Shatter | White-noise burst; sparse high resonances; fracture burst plus staggered resonant fragments | Controlled brittle onset followed by a short sparse fragment cascade. Avoid a long hiss. |
| Text Bomb | Generic explosion; soft detonation; placement cue plus delayed pop and granular scatter | Timing-separated placement and detonation with a short debris tail; lower peak than a cinematic explosion. |
| Dial detent | Metallic ping; dry ratchet; soft wood/plastic click | Very short dry mechanical click with conservative gain. Rate-limit to a controlled sequence and trigger only at angular boundaries. |

These are construction candidates, not a claim that sample candidates were auditioned. Timbral pleasantness, repetition comfort and correspondence to motion require listening in the actual extension. Waveform checks can establish duration, peak and resource behavior but cannot replace hearing the result. If audio capture/listening is unavailable, the release record must explicitly leave subjective approval unverified.

## Runtime implications

A single lazily created context, shared master gain, conservative envelopes and a compressor provide consistent headroom. Individual effect invocations own their voices; UI detents use a separate scope. Mute and volume act on the shared master so they affect existing voices. Cached procedural buffers and fresh one-shot sources keep repeated playback bounded. Continuous tools normally use short activation sounds rather than constant ambience; Flashlight has no movement loop. Audio failure must never block visual interaction.

No copied code, asset licenses or external samples need redistribution notices for original synthesis itself. The URLs above are retained as research provenance, not attribution implying that those authors made the delivered sounds.
