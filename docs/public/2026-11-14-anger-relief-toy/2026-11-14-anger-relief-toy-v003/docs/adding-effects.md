# Add a tool without changing the runtime

First read `AGENTS.md`, the immutable baseline, and the acceptance questionnaire. Record a candidate and behavior specification with provenance, rights, implementation approach, resource limits, and explicit stop behavior. Never run original untrusted source locally. Approved dynamic research requires the separate disposable environment described in the baseline.

Create `src/effects/<stable-id>/` with an `effect.json` matching `Descriptor`, `index.ts` exporting an `EffectModule` for SDK 1.0, `attribution.md`, and `contract.test.ts`. Copy the structure, not the effect identity, of an existing feature. IDs and metadata are validated at build time. Include search tags and an original SVG path icon. Record credits even when only a behavior concept is used. Mark the implementation `review-pending` until independent review is complete.

Implement create(context) and return start(target, options), stop(reason), and dispose(). Use context.resources for every allocation. Use its frame, timeout, animate, listen, node, and style methods rather than unmanaged APIs. Use context.overlay for rendering. Do not import another effect, the background, or UI internals. Do not access privileged browser APIs, evaluate strings, fetch network data, inspect form values, or dispatch host events. SDK visual helpers provide bounded local snapshots and particles.

Declare exactly one supported scope: element, document, or viewport. Element targets contain the selected HTMLElement and viewport impact point. Document targets contain the runtime's bounded eligible selection. Viewport targets contain only the document. Options are normalized once by the runtime. Respect reducedMotion and duration; use strength only within bounded calculations. New custom options require an explicit SDK and UI design change, tests, and a new incremental specification, rather than private configuration channels.

Add meaningful behavior assertions to `tests/dom.test.ts` or a feature-local test, extend the real browser matrix as necessary, and compare before/active/after screenshots. Include cancellation, repeated activation, missing/disconnected targets, host updates during cleanup, dynamic navigation, protected controls, and resource limits. Reread every acceptance question after implementation and write explicit evidence-linked answers. A source-only test passing does not demonstrate visual quality.

Run `bun run test`, `bun run check`, and `bun run test:browser`. The build automatically discovers the directory and injects it lazily; no central list edit is needed. Disabling `enabled` or removing the directory excludes the tool after rebuilding and stale saved favorites are filtered automatically. Obtain independent security, quality, and licensing review before changing status to verified or releasing it.

## Lifetime and icon metadata after change request 003

Every new effect manifest must declare lifetime.class (repeatable, continuous, simulation or persistent), overlap (currently replace), animationMs and residueMs. Element-scoped tools are repeatable; no central ID-specific exception is allowed. Animation timing belongs to the module; equipped session persistence belongs to the runtime. context.finish() ends only the current invocation. Do not use it to put away equipment. Optional context.inputAllowed() lets pointer/keyboard effects avoid handling input while a modal is open.

Supply a feature-local icon.svg containing only approved static SVG shapes/gradients. The build validates and embeds it into generated descriptors; shared icon rendering gives gradient IDs unique names. Reuse that same artwork across catalog, wheel, inventory and pointer cue. No separate manually maintained icon list or copied third-party asset is needed.

Component tests should assert that invocation completion leaves the equipped state ready, that switching and Put away clear all owned scopes, and that continuous modes have no generic lifetime timer. Add corresponding native browser evidence before verified status. The development gesture prototype is not an approved production extension point.
