A00 Purpose v01
Create a premium, shiny marketing website that makes LeetCode 2239 (Find Closest Number to Zero) feel visual, interactive, and "obvious" through rich graphics and motion. The site should persuade the visitor that the problem is elegant, the tie-break rule is critical, and the solution is simple and reliable, using an immersive, graphics-forward experience.

A01 Audience v01
Primary: developers practicing interviews, browsing patterns, and comparing explanations.
Secondary: reviewers assessing communication and product polish.

A02 Core promise v01
The website communicates, without heavy text, that the answer is the value with minimum distance to 0, and if distances tie, the larger numeric value wins.

A03 Experience principles v01
Graphics-first: information should be shown, not told.
Playable: the visitor should be able to manipulate inputs and watch the algorithm respond.
Premium motion: subtle glow, pulse, shimmer, and parallax that reinforce meaning.
Immediate clarity: tie-break rule must be memorable after one interaction.

A04 Page structure v01
Hero: animated headline + live mini-demo loop (no user input required).
Problem: concise statement + iconic visualization of "distance to zero."
Playground: full interactive array and step-through simulator.
How it works: visual algorithm model (state machine style).
Tie-break spotlight: dedicated interactive scenario to train the rule.
Complexity: visual meter and concise line.
Code showcase: expandable panel with syntax-highlight and copy.
Share/CTA: generate a share card preview of the current demo state.
Footer: credits, links, accessibility, reduced-motion toggle.

A05 Visual system v01
Theme: dark, high-contrast, neon accents, soft glow.
Typography: large hero type, readable body, numeric monospace for chips and distance readouts.
Layout: generous whitespace, card-based sections, smooth scroll, consistent corner radius and shadowing.
Motion language: pulse for "candidate," shimmer for "evaluation," snap highlight for "winner," dual flash for "tie."

A06 Graphics inventory and SVG asset specifications v01
The site should use a cohesive set of SVGs (hand-crafted or generated) that can be animated via CSS/SMIL/JS.

A06.1 Required SVG assets v01
Zero Beacon: a glowing "0" anchor icon used across sections.
Number Chips: scalable pill-shaped tokens with inner glow and state variants (default, hovered, active candidate, eliminated, tie-participant, winner).
Distance Rays: lines or arcs connecting a number chip to the Zero Beacon, with length or intensity representing absolute distance.
Scale Track: a horizontal number line with tick marks and animated markers.
Tie Scales: a two-pan scale icon that tips toward the larger value when abs distances match.
Algorithm Node Map: a small diagram showing a loop over elements, with "best so far" state highlighted.
Complexity Gauge: simple dial or bar showing O(n) with a moving indicator.

A06.2 Optional SVG assets v01
Background Grid: subtle animated grid or noise texture overlay.
Glow Particles: small dots drifting slowly for depth.
Pulse Rings: concentric rings emanating from Zero Beacon on key events.
Share Card Frame: a template SVG to render a snapshot of the current input and result.

A06.3 SVG generation requests v01
Request SVGs in layered form (separate groups for glow, outline, fill, and labels) to enable animation.
Require consistent stroke widths and a unified coordinate system (eg, 0-1000 viewBox for major illustrations).
Provide state variants as either separate SVG files or grouped layers toggled via classes.

A07 Core interactions v01
A07.1 Hero mini-demo loop v01
Auto-plays a short cycle: array appears -> evaluation sweeps -> best candidate pulses -> tie moment occurs occasionally -> winner lands with a satisfying highlight.
Loop must be readable within 6-10 seconds and pause on user hover.

A07.2 Interactive Playground v01
Input controls: add number, remove chip, edit inline, shuffle, randomize, load presets.
Modes: "Instant" (shows final answer immediately) and "Step" (walk through evaluation).
Step visualization: an evaluation cursor moves across chips; the currently inspected chip glows; distance ray animates to Zero Beacon; best-so-far chip pulses.
Tie handling: when abs distances match, both chips flash; the larger value chip receives a crown/badge animation.

A07.3 Number line visualization v01
A live number line shows chip positions relative to 0.
When the best candidate changes, the marker snaps and leaves a faint trail.
When tie occurs, markers synchronize and the winner marker brightens.

A07.4 Distance-first visualization v01
A separate view toggles to show absolute distances as bars (bar length = abs value).
Tie state shows equal bars; winner is chosen by value, not distance.

A07.5 "Explain it to me" hover layer v01
Hovering a chip shows: value, abs(value), and whether it beats current best.
Hovering the winner shows: why it won (closest; or tie + larger).

A07.6 Shareable state v01
Generate a share card preview (client-side render) including input array, highlighted tie if present, and final winner.
Copy link includes serialized state in query params.

A08 Micro-interactions and motion events v01
Candidate pulse: best-so-far chip subtly pulses every 1.5-2.5s.
Evaluation sweep: a soft scanning light passes over chips when stepping.
Tie flash: quick double blink on both tied values, then winner glow persists.
Winner lock-in: short "snap" and halo expansion around the result.
Error feedback: invalid input wiggle and red outline, with clear inline hint.
Section transitions: parallax background drift and smooth fade-up on entry.

A09 Content requirements v01
Keep text concise; use graphics as primary explanation.
Must include a dedicated tie-break callout with an interactive example: values -k and k lead to choosing k.
Complexity shown visually plus one line: linear scan, constant extra space.
Code panel includes a short snippet with copy button and language toggle (default JavaScript).

A10 Accessibility requirements v01
Full keyboard support: focusable chips, step controls, preset buttons.
Reduced motion: disable pulses/flashes and replace with static highlights; no parallax.
Screen reader labels: each chip announces value and distance; the winner announces why it won.
Color is never the sole signal: use icons (crown, check, tie badge) and text labels in tooltips.

A11 Performance requirements v01
All SVGs inline or sprite-loaded with caching strategy.
Avoid heavy libraries; animations should be GPU-friendly (transform/opacity).
Defer non-critical animations until idle; pause offscreen animations.
Initial load should show a static hero fallback that upgrades to animated.

A12 Technical architecture v01
Single-page app or static site with interactive modules.
State model: input array, current index, best candidate, best abs distance, mode, presets, reduced-motion flag.
Rendering: deterministic, replayable steps for step mode.
Share links: encoded state, validated on load.

A13 Presets and scenario coverage v01
Preset: mixed numbers with clear winner.
Preset: explicit tie (-2, 2).
Preset: all positive.
Preset: all negative.
Preset: includes 0 (winner is 0 immediately).
Random generator: occasionally forces symmetric pairs to demonstrate ties.

A14 Non-goals v01
No long proofs, no multiple competing approaches, no interview meta content.
No server dependency required to experience the full demo.

A15 Acceptance criteria v01
Visitor can restate the tie-break rule correctly after one tie interaction.
Playground supports instant result and step-through with clear state changes.
Graphics system feels cohesive and premium; all animations reinforce meaning.
Shareable link recreates the exact input and winner state reliably.
