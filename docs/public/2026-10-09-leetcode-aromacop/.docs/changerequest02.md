# AROMACOP Change Request 02: character and environment extension

User continuation requested 2026-10-09. Supplements `.docs\specification.md` and `changerequest01.md`; all existing functional, offline, performance, quality and version rules remain mandatory. The accepted v0003 implementation is the baseline, not an invitation to replace working systems.

## S00 Built-in specimens and character selection

Embed the exact PNG source bytes from `ref-images\spe01.png` and `ref-images\spe02.png` as Base64 runtime assets. Both are prepared transparent, hairless identities; do not alter the source files or introduce runtime references to them.

Expose three radio options: Specimen 1, Specimen 2 and Custom specimen. A fresh unsaved application chooses 1 or 2 once with equal probability. Selection never changes merely because of walking, camera, reset, assembly or unrelated editing. Explicit built-in selection updates the texture immediately without reload; handle asynchronous selection races so the final selected radio and actual face agree.

Custom with no committed custom image opens the existing local portrait editor. Cancel must restore the previous active selection/face, never blank it. Apply commits a reusable custom portrait. Users can switch back to that custom image without re-uploading and can edit/replace it. Keep preview/pan/scale/crop/apply/cancel/default behavior, errors, focus and privacy.

Export embeds both original built-in PNGs, active selection and committed custom portrait, together with all previous saved features. A downloaded file restores the saved selection rather than drawing a new random choice.

## T00 Detailed helmet and independent front shield

Improve the helmet's armored futuristic character through coherent mechanical details, not a renderer rewrite. Introduce a substantial separate shield that **starts closed**, physically covering the human face. Opening it uses a smooth, plausible hinge/lift mechanism and reveals the recessed portrait; closing returns to the armored appearance.

The shield is independently selectable/detachable/movable/returnable while the rest of the helmet stays intact. Add its actual module to the manifest, counts, selection, finish controls, dragging, magnets, exploded assembly, reassembly and diagnostics. Retain all 25 original modules; extension is expressly permitted. Motion, camera and head/module offsets must produce consistent shield mounting and stable geometry. No merely toggling image visibility.

## U00 Sidearm, holster and cinematic handling

Add a stylized long-barreled futuristic sidearm and visible physical hip/upper-leg holster. Default is stored. A clear stateful control triggers a coordinated reach/grasp/extract/three-dimensional flourish/hold sequence, followed by an animated holster return. The arm, forearm, wrist and hand must participate; the weapon is attached to the actual hand when held and actual holster when stored. Never duplicate it or simulate the spin with static image swaps.

Extend native synthesized mechanical audio with synchronized latch/servo/spin/return cues. Respect shared sound enable/mute/volume; the animation works silently. Document and communicate coherent walking, detached-arm, exploded, dragging and repeated-click behavior. Temporary action gating is allowed, but existing walking/manipulation remains available outside genuinely incompatible handling states.

No shooting, projectiles, targets, combat mechanic or external sound assets.

## V00 Physical interactive background monitor

Add a large physical 3D industrial monitor with depth, designed bezel, stand/hardware and appropriately styled small controls. Default is off, with a visible frame and dark screen. The robot remains central; placement must not obstruct its normal manipulation or navigation.

Click the monitor/small integral input control to select a local image. Avoid a large generic upload button. Successful decode displays it and powers on. Fit/fill deliberately uses screen space with readable, aspect-preserving content; no unexplained blank regions. Power off retains the image; power on restores it. Replace via the monitor again; picker cancellation, corrupt/unsupported/oversized input and superseded loads preserve prior valid image/power state and provide accurate feedback.

The image is perspective-mapped to the physical screen. Restrained, varying electronic interference/scanlines/waves remain readable; respect reduced motion. Camera orbit and other picking must stay reliable. All image processing is local.

Export embeds the selected monitor image and saved on/off state. Fresh offline opening restores both without the original file.

## W00 Integration, presentation and reversibility

Group identity, helmet and handling controls coherently; monitor controls belong to its design. Maintain established materials/type/colors, accessible labels/focus/keyboard and mobile layout. Keep native depth rendering, correct animated mounts, gentle magnetic escape, protected photographic pixels, dialogue/voice and all previous exports.

Reset deliberately cancels cinematic activity/dragging, stops gait/orbit and restores assembly/camera, while preserving chosen identity/custom cache, monitor content/power and finishes. Disclose exact shield/sidearm reset behavior. Do not randomly reselect a specimen. Exported playback can start idle/silent; saved identities and monitor state must persist.

## X00 Master-only verification and acceptance additions

Run original P01-P15 regression checks with intentional module-count/initial-face updates, plus:

- P16 identity: deterministic equal-probability threshold checks, real fresh launch, radio changes, lifecycle stability, Custom upload/crop/apply/cancel/cache/edit, invalid input, selection races and saved selection.
- P17 shield: closed initial coverage, actual geometric opening/closing, isolated selection/drag/magnetic return, exploded/reassembly/counts/finishes, varied orbit and walking/head relations.
- P18 sidearm: full reach/extract/3D spin/hold/holster, actual hand/holster attachment, repeated input, walking/detached-arm/exploded/reset cancellation, no duplicate meshes, native action-linked audio/mute/volume/cleanup.
- P19 monitor: off initial, actual integral scene interaction/file picker, upload/perspective/fit/readability, varying restrained interference, power retention/replacement/cancellation/invalid files, orbit and picking isolation.
- P20 complete export: fresh offline customized HTML retains both built-in assets, selected identity, committed reusable custom face, finishes, monitor image and saved power; all interactions still work.
- P21 combinations/performance: walking plus open shield/identity changes/orbit/active monitor, sidearm-compatible combinations and graceful incompatible states, reference desktop/mobile controls/focus/touch, >=8s sustained animated scene after warm-up, no runtime/network failures or resources growing without bound.

Keep original H01-H10, >=90/100, each dimension >=70%, no unresolved high/critical defect and two independent master Playwright verification passes. Extra gates G16-G21 must also pass. Native voice/audio listening and physical-device/lifecycle-emulation limitations must stay accurately disclosed.

## Y00 Numbered continuation

Latest accepted public source is v0003, cumulative enhancement iteration count 2. Next available folder is `v0004-aromacop-iteration-03`; further corrections increment both counters, never overwriting history. Cumulative maximum remains 20. Use at most three concurrent isolated candidates, compare actual master browser evidence, and promote public `aromacop.html` only after complete acceptance. Preserve prior versions, reports, source assets and unrelated entries.

The final product remains one self-contained offline `aromacop.html` with no installation, npm/build, engine, server or external runtime download.
