# Design exploration and decision

These are generated concept references, not browser screenshots. The implementation uses functional DOM controls and original editable SVG icons. No generated image is used as a click target or shipped as a flattened wheel.

Five image-generation outputs were produced before implementing the final controls. The initial nautical, arcade, and mechanical directions were deliberately distinct. The user rejected heavy saturated colors and dated ornament during the session, then approved the lighter wheel structure and requested colored object-like icons in place of monochrome pictograms. That steering determines the final direction.

| Concept | Finish 25% | Readability 25% | Character 20% | Page fit 15% | Feasibility 10% | Accessibility 5% | Weighted / 5 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| A: Nautical helm | 3 | 3 | 4 | 2 | 3 | 3 | 3.05 |
| B: Arcade sectors | 3 | 4 | 3 | 2 | 4 | 3 | 3.20 |
| C: Mechanical toy | 4 | 3 | 4 | 2 | 2 | 3 | 3.20 |
| D: Neutral glass refinement | 4 | 4 | 3 | 4 | 5 | 4 | 3.90 |
| E: Glass with colored object icons | 4 | 4 | 4 | 4 | 5 | 4 | 4.10 |

Scores are an implementation-author concept assessment, not independent usability results or acceptance of the real extension. All initial concepts make the control too dominant. The helm's spokes and complete rim are recognizable but visually heavy. The arcade's high contrast improves labels while making the entire wheel feel like a large badge. The mechanical variant has memorable iconography but adds extraneous bolts and a dense frame. Those three were rejected after the user's feedback.

The refinement keeps only their useful radial organization. Frosted near-white glass, thin cool-gray divisions, charcoal text, a pale cyan selected sector, and a single checkmark leave the page visible around the control. The second refinement adds small colored, shaded object illustrations without adding colored tile backgrounds. This addresses the user's difficulty distinguishing pictograms while keeping the wheel light.

Implementation tokens: ink #26323C, muted text #58656F, translucent glass rgba(250,252,254,.90), divider rgba(72,91,106,.20), pale selection #DAF4F6, focus #167D97. System UI / Segoe UI is used for compact, legible functional text. Functional labels are normally 14px or larger; tool names are 16px. No promotional slogans are retained. The catalog is a centered movable glass panel; the inventory is a short glass capsule; the cursor contains only the equipped icon.

The wheel uses real annular polygon buttons around a center action. Pointer hover, keyboard focus, pressed state and a visible check distinguish selection. Original SVG icons share soft gradients, restrained outlines and identifiable shapes: glove, shards, weight, bomb, flashlight, cracked screen, rubber band and vortex. The icon contact sheet in evidence/003 is a render of actual project vectors, not a browser UI screenshot.

The generated refinement's physical icons are a visual target. Hand-authored SVGs are intentionally simpler at 32-38px, editable, dependency-free and reused consistently. Their source render was inspected. Native wheel/HUD/catalog composition, blur, hit testing, contrast and responsive behavior still require the browser screenshot review that the environment prevented. Do not use these concept scores to waive that gate.
