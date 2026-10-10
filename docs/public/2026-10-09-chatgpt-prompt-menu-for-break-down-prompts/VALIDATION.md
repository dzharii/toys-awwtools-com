# Validation

Verified October 10, 2026 against the final generated build.

`node build.mjs` completed successfully. `node --test tests/*.test.cjs` passed all 19 tests with zero failures. The combination test covers all 2,187 combinations of seven categorical settings. The checks exercise preserved task/API context, independent verbosity/depth/audience settings, complete code requirements, preset semantics, empty optional sections, literal user text, malformed imports, field limits, prototype-shaped keys, manual-output serialization, and explanatory warnings.

Event-flow tests execute the actual application JavaScript against a minimal DOM adapter. They verify initialization, five default focus selections, editing and finishing, preservation of manual text after setting changes, explicit rebuild, copying the displayed text, no saving before opt-in, restoration, saved-data removal, invalid/oversized/valid imports, blocked storage, clipboard fallback, empty-assignment handling, and reset. These are application logic checks, not tests against a real browser engine.

Packaging checks confirm that the generated HTML embeds the exact maintained scripts and CSS, both embedded scripts parse as JavaScript, the browser-global prompt builder works without CommonJS, static IDs are unique, script-referenced elements exist, SVG symbol references resolve, and the three complete examples match their importable settings and the pure builder. The app has no external script or stylesheet dependencies and no request API calls.

An additional Python HTML-parser check verified all documentation and anchor links, all explicit textarea/select label targets, the two embedded script blocks, all 14 unique specification section codes, and inclusion of all three complete configurations and generated prompt texts in the specification. The archive was checked for CRC integrity and contains every source/reference/document/example file.

Browser preview and visual QA were unavailable in the creation environment: the required browser-control capability was not exposed. No actual browser rendering, viewport screenshots, native keyboard navigation, file download dialogs, clipboard permission behavior, or visual-difference comparison was performed. Responsive rules and accessibility features were checked in source, not certified through a browser audit.

The source reconstruction uses the visible conversation, two reusable SVG snippets, and all seven supplied screenshots. It is not verified as identical to the unavailable original complete source. The output follows the reference design and adds documented controls, but exact visual fidelity remains unverified until opened in a browser.

The static app generates prompts rather than calling a model. Model response quality, compliance with requested instructions, and the correctness of future generated C code were not tested or guaranteed.
