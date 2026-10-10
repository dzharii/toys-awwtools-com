# AROMACOP Change Request 01

Supplemental specification requested 2026-10-09. Applies in addition to the full `.docs\specification.md`; none of the original mandatory gates or single-file/offline requirements is relaxed. The master owns implementation comparison and all browser testing. These changes must be present in the accepted and exported standalone HTML.

## C00 Native word-by-word spoken dialogue

Use modern native browser `SpeechSynthesis` and `SpeechSynthesisUtterance`. While the robot is walking and the user has enabled voice, speak its entered dialogue **one word at a time**, waiting for the previous word to finish and then introducing a small readable pause before the next word. Punctuation may increase the pause.

Voice must be optional and clearly controllable, initially silent. Prefer an available local-service voice: no remote speech service, library, audio download, or photograph/text upload. Expose accurate support/voice-loading/unavailable states; browser or operating-system speech limitations must not affect walking, visual dialogue or mechanical sound.

Stop, reset, mute, tab suspension and dialogue edits must cancel both the active utterance and pending words. Invalidate stale completion callbacks so they cannot resume an obsolete sentence. Restart deterministically using current text. Avoid accumulating utterances/timers/listeners. Keep native speech separate from mechanical Web Audio controls.

**Acceptance P13:** verify real API and voice availability, one-word utterances, actual inter-word delay after completion, punctuation, edit/stop/reset/mute cancellation, failure behavior and preservation in offline export. A controlled native-API adapter may verify completion/error races, but is not evidence of audible OS speech. Disclose when listening or installed voices cannot be assessed.

## M00 Gentle magnetic return to remembered mounts

Each of the original 25 modules must retain its correct mounting transform independently of its dragged displacement. While walking, the remembered mount follows the existing animated skeleton rather than becoming a stale world-space coordinate.

A detached module must stay where the user put it until deliberately returned near its correct mounting position, or explicitly reassembled/reset. Do not attract a module across a large distance or snap it merely because it was selected. When the user drags a previously detached part back close to its own mount, provide a restrained proximity indication and gentle magnetic assistance. Releasing near the mount should seat it precisely through a controlled short transition and update diagnostics to mounted.

The attraction must be **easy to override with forceful pointer movement**. A deliberate pull/fast movement must break capture without pointer jumps, repeated sticky recapture, or fighting the user. Use a small screen-consistent capture area, bounded assistance and escape hysteresis (or an equivalently justified mechanism). Do not let a small camera change or animated gait capture a part without a return gesture. No magnetism to another module's mount.

Define behavior during exploded view explicitly: it must not accidentally collapse the exploded layout. Disabling magnetic assistance during exploded inspection is an acceptable design. Reset/reassembly retain their separate explicit functions. Mouse and touch flows must remain predictable across camera yaw, pitch and zoom; release/cancel must clear capture.

Show enough information to make magnetic assistance understandable without an intrusive overlay. A clearly labeled optional toggle is acceptable; default behavior must be gentle.

**Acceptance P14:** detach and release away (no unsolicited return), deliberately return near the correct mount and verify precise seating, deliberately pull out of the capture region and verify escape without immediate sticky recapture, test slow approach versus forceful movement, test incorrect mount, test while walking, test multiple yaw/pitch/zoom settings and touch, test exploded behavior and pointer cancellation/reset. Record actual tolerances, measured pointer-to-part behavior, hysteresis and diagnostics, not merely source assertions.

## F00 Playful per-component color and gradients

Allow the user to customize the **selected** component's finish. Provide an understandable solid-color picker and a two-color gradient mode (or richer compatible color tools). Include a few playful, deliberately chosen presets so experimentation does not require typing color codes. Clearly show which module receives the finish; do not unintentionally recolor other modules.

Preserve mechanical depth, metal shading, visible selection and photographic facial pixels. The human portrait must not be tinted/replaced by a finish choice. Keep a coherent default appearance and an obvious Restore Original Finish action for the selected module. Preserve finish edits through orbit, walking, detachment, reassembly, editor use and assembly reset unless a separate explicit finish reset is chosen and documented.

Apply finish changes immediately without rebuilding the entire scene or reloading. Gradient position should be stable in the module's local geometry while it moves; do not let it slide with the camera. All 25 components remain independently addressable.

The explicit standalone HTML export must embed committed component finishes as well as the cropped portrait so customization survives opening the downloaded file offline on another computer.

**Acceptance P15:** select representative head, torso, arm and leg modules; apply solid colors, gradient endpoints and playful presets; verify changes are localized to the selected component, gradient is geometry-local, selection is legible, portrait pixels unchanged, reset/animation/detach/reassembly preserve customization, original finish restores correctly, and a fresh offline exported HTML retains the edits. Verify keyboard labels/focus and mobile reachability of finish controls.

## A00 Supplemental release gates

The release must satisfy the original H01-H10, P01-P12, quality threshold and two independent master verification runs **plus P13-P15**. Pending or blocked supplemental behavior prevents unconditional acceptance. Record browser-specific voice limitations accurately without substituting adapter timing tests for auditory perception.

Keep this change request separate from the base specification. Future substantive revisions increment the affected section revision only. Preserve the original snapshot, reference images, earlier numbered versions and unrelated root entries.
