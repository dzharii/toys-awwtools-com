# Matrix Rain implementation plan

Written before implementation, 2026-11-15.

Behavior: Watch fictional digital characters drift in restrained green columns. Scope: viewport; lifetime: continuous. Target selection stays in the shared runtime. No effect dispatches host events or reads editable fields.

Research: https://github.com/criminalpear/Bookmarklets. Primary repository README verified on 2026-11-15: describes MatrixRain as a digital rain display. License absent in the viewed README; no source or assets reused. All TypeScript, SVG and synthesized audio will be newly authored. No original bookmarklet is downloaded, executed or adapted. Canvas and tracked Web Animations are preferred to a library or live DOM clones.

Limits: One canvas with at most forty-eight columns and fourteen glyphs each, 24 Hz rendering, capped 1600 by 1000 backing store. Fictional symbols, soft contrast, no strobe. Reduced motion renders once with no RAF.

Audio: original low-gain activation cue in audio.json, delivered by the shared audio service. No local context or loop. Visuals still function with unavailable/muted audio.

Verification: contract/model tests, strict TypeScript, tracked resource cleanup, and host-state assertions. Actual-browser visual/subjective-audio acceptance remains pending because native browser startup is blocked by restricted process sockets. Review-pending metadata must remain honest.
