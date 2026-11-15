# burn-page implementation plan

Behavioral reference: Burn the Web, https://github.com/JamesPBurke/burnit, reviewed as primary project documentation on 2026-11-15. No original script was downloaded, copied, executed or adapted. Original license is not relied upon: all shipped code, editable SVG and sound parameters are project-owned independent work. Historical concept attribution is retained; original source revision is not pinned and remains an explicit provenance limitation.

Mechanics and target: A selected element illustration chars then erodes upward behind a glowing flame front. Twenty-four flames and embers rise, fade, and disappear.

Resource boundary: One target canvas, one moving fire front and 24 embers. No host filter or persistent burn. Target illustrations use the existing bounded SDK snapshot, which represents text and backgrounds without cloning live markup, loading images or reading form values. Snapshot fidelity on complex styled/image targets is limited. Visibility is restored through resource ownership. All motion, nodes and timers are managed by Resources. Replacement, End effect, Put away and failure dispose the same scope.

Audio: original conservative Web Audio synthesis in audio.json. Activation and any delayed contact are distinct; no imported music or samples. At least three constructions considered: sharp noise, tonal-only cue and filtered noise plus tonal body. The layered option communicates physicality without harsh long tails. No continuous ambience is required. Repeated-use subjective audition remains unverified because native browser launch/audio output is unavailable.

Verification: feature-local contract and behavioral tests cover target-kind rejection, bounded overlay creation, reduced motion and idempotent restoration. Source review checks ownership and absence of host event synthesis. Native screenshots/motion review cannot be accepted until the packaged extension can launch: the current root test reports a process/socket restriction. Metadata remains review-pending.
