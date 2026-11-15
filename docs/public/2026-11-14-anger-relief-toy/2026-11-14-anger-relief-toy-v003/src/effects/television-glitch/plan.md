# Television Glitch implementation plan

Written before implementation, 2026-11-15.

Behavior: Slip a selected surface into gently displaced television scanlines. Scope: element; lifetime: repeatable. Target selection stays in the shared runtime. No effect dispatches host events or reads editable fields.

Research: https://devbubba.github.io/Bookmarklets/. Supplied historical collection URL and its apparent GitHub repository returned 404 on 2026-11-15. Original author/version/license therefore remain unverified. The change-request behavioral description is the design source, not third-party executable code. All TypeScript, SVG and synthesized audio will be newly authored. No original bookmarklet is downloaded, executed or adapted. Canvas and tracked Web Animations are preferred to a library or live DOM clones.

Limits: One snapshot with at most six clipped copies and one scanline layer. Static chromatic displacement, no flashing, short one-shot motion; reduced motion removes movement.

Audio: original low-gain activation cue in audio.json, delivered by the shared audio service. No local context or loop. Visuals still function with unavailable/muted audio.

Verification: contract/model tests, strict TypeScript, tracked resource cleanup, and host-state assertions. Actual-browser visual/subjective-audio acceptance remains pending because native browser startup is blocked by restricted process sockets. Review-pending metadata must remain honest.

Integration refinement: the six displaced bands now use cropped strip buffers rather than six full-size copies. The original surface remains underneath, preserving content in the small lateral gaps. Total allocated source pixels are approximately two source areas, with rounding overhead, instead of seven. The common per-target snapshot remains bounded to1200x800 pixels. Native appearance and memory profiling are still unverified.
