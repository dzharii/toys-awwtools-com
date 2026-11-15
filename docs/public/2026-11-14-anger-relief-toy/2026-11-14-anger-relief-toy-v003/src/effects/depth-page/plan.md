# Depth Page implementation plan

Written before implementation, 2026-11-15.

Behavior: Lift page cards into a layered, pointer-responsive perspective. Scope: document; lifetime: simulation. Target selection stays in the shared runtime. No effect dispatches host events or reads editable fields.

Research: https://devbubba.github.io/Bookmarklets/. Supplied historical collection URL and its apparent GitHub repository returned 404 on 2026-11-15. Original author/version/license therefore remain unverified. The change-request behavioral description is the design source, not third-party executable code. All TypeScript, SVG and synthesized audio will be newly authored. No original bookmarklet is downloaded, executed or adapted. Canvas and tracked Web Animations are preferred to a library or live DOM clones.

Limits: At most ten snapshots; no continuous render loop. Pointer parallax updates existing transforms only. Protected nodes excluded through SDK. Owned visibility restores originals.

Audio: original low-gain activation cue in audio.json, delivered by the shared audio service. No local context or loop. Visuals still function with unavailable/muted audio.

Verification: contract/model tests, strict TypeScript, tracked resource cleanup, and host-state assertions. Actual-browser visual/subjective-audio acceptance remains pending because native browser startup is blocked by restricted process sockets. Review-pending metadata must remain honest.
