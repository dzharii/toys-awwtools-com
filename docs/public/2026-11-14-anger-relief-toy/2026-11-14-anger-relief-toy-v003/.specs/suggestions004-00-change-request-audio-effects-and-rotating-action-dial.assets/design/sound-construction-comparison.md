# Sound-construction comparisons

This record compares three original procedural construction directions for each important interaction. It supports the source research in `research/004-audio-sources.md`. No external sample was selected or bundled. These are objective construction decisions, not a claim of listening, sample audition or subjective pleasantness approval. The final profiles require repeated-use listening in context when audio monitoring is available.

| Interaction | Candidate | Construction and expected tradeoff |
| --- | --- | --- |
| Punch | Low body alone | A rapidly falling sine, roughly 145 to 48 Hz over 150 ms. Efficient and soft, but may lack a recognizable contact edge on small speakers. |
| Punch | Noise slap alone | A 50-80 ms noise transient low-pass filtered around 1.5 kHz. Clear contact, but little sense of weight; repeated use may sound papery. |
| Punch | Layered body and contact | Combine the low falling body with the restrained noise transient. Selected initial direction because low body supplies mass while the filtered transient places the impact in time. Both are short and envelope-controlled. |
| Shatter | Noise fracture alone | A brief band-limited burst gives a crack, but can resemble generic static without material cues. |
| Shatter | Resonant fragments alone | Sparse short resonances give brittle detail, but an unrestrained cluster could become shrill or musical. |
| Shatter | Fracture plus short fragment cascade | An immediate controlled crack followed by a sparse staggered scattering tail. Selected initial direction because it distinguishes fracture from subsequent fragments while bounding high-frequency energy and total duration. |
| Text Bomb | Cinematic low explosion | Long descending bass and broad noise can communicate mass but would dominate a reading session and be difficult to repeat comfortably. Rejected for the initial palette. |
| Text Bomb | Single soft pop | A short pressure-like transient is lightweight but fails to communicate placement, anticipation and detonation as separate visual moments. |
| Text Bomb | Placement, detonation and dust | A quiet placement cue, a low falling body at the actual detonation, then a restrained short debris layer. Selected initial direction because event timing can follow the animation without one long noisy sound. The debris should be quieter than the main pop. |
| Dial detent | Metallic ping | A short resonant tone communicates metal, but repeated turns could become pitched ringing rather than tactile feedback. |
| Dial detent | Dry ratchet | A very short band-limited noise transient has precise timing and little tail. Selected initial direction because separate angular steps remain perceptible without accumulating resonance. |
| Dial detent | Soft confirmation click | A rounded quiet click is comfortable but may lack the mechanism's tactile character. Useful as a quieter fallback and as a separate selection confirmation, subject to listening. |

The selected directions share short attacks, controlled decays and conservative gains. They deliberately use different spectral and timing structures rather than attaching the same beep to every effect. A single lazy Web Audio graph provides the master gain and peak protection. Effect metadata defines event layers, and effect code chooses the meaningful event time. Passing an animation delay to Web Audio scheduling is preferable to an unrelated timer where the visual timeline is deterministic.

Punch should synchronize with contact, Shatter with initial fracture, Text Bomb with the delayed explosion, and the dial with angular detent crossings. A dial tick must never fire for every pointermove. The shared service's starting limit of one navigation tick every 80 ms corresponds to at most 12.5 ticks per second, within the request's conservative 12-18 event range. Coalesce skipped fast boundaries rather than queueing a trailing burst after the user stops.

A waveform renderer can check finite duration, bounded peak, envelopes, silence after cancellation and deterministic profile output. It cannot establish that a thump is satisfying or glass is convincing. Until contextual listening is completed, record subjective timbre and repetition comfort as unverified. If a later approved CC0 recording substantially improves material credibility, the SDK can retain the same event interface and replace that profile's sound construction.
