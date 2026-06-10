# AGENTS.md

---

A00 Project Brief

---

Build Bunny Volleyball: a static, dependency-free browser demo where three real rabbits in a backyard appear to pass a cartoon beach ball forever. The experience is a calm photo-first webpage with a small playful game layer: animated beach ball, pass counter, contact effects, subtle motion, and optional procedural audio.

The project is intended for GitHub Pages or any static file host. It must run without a build step. Use modern HTML, CSS, and JavaScript directly in browser-supported files.

---

B00 Source Documents

---

Read the specification files before implementation. Treat them as the primary source of product, visual, motion, audio, and acceptance requirements.

Required references:

```txt
specs/design_spec.md
specs/product_spec.md
specs/audio_spec.md
```

Required visual assets:

```txt
specs/bunny_original.png
specs/bunny_mockup.png
```

Use `specs/bunny_original.png` as the production background source. Use `specs/bunny_mockup.png` only as a visual reference. Do not use the mockup as the runtime background.

---

C00 Expected Output Structure

---

Create the production files in the project root, not inside `specs`.

Expected structure:

```txt
.
|-- AGENTS.md
|-- TODO.md
|-- index.html
|-- styles.css
|-- app.js
|-- assets
|   `-- bunny_original.png
`-- specs
    |-- audio_spec.md
    |-- bunny_mockup.png
    |-- bunny_original.png
    |-- design_spec.md
    `-- product_spec.md
```

Copy required runtime assets from `specs` into `assets`. Do not move, delete, or modify the original files in `specs`.

---

D00 Implementation Directives

---

Plan first. Split the work into coherent chunks. Implement each chunk autonomously until the whole project is complete and conforms to the specifications.

After each chunk, validate that the newly implemented behavior works and that previously implemented behavior still works. Mark a task complete in `TODO.md` only after verifying both the feature itself and its integration with the rest of the project.

Use your own engineering judgment. The specifications are detailed, but they may still contain omissions, small contradictions, or implementation issues. When that happens, choose the solution that best preserves the product intent, visual quality, browser compatibility, accessibility, and maintainability. Document meaningful deviations in code comments or in your final report.

Use web search extensively when implementation details are uncertain, especially for current browser behavior, Web Audio API details, autoplay restrictions, CSS viewport behavior, responsive layout details, GitHub Pages constraints, and accessibility patterns. Validate claims from the specifications rather than assuming every statement is perfect.

Do not stop after partial implementation. Continue chunk by chunk until the project is fully implemented, validated, and coherent.

Do not use ChatGPT Canvas or any canvas-based rendering feature for this project. The project should use DOM, CSS, inline SVG, and Web Audio API. Do not use HTML `<canvas>` for rendering.

---

E00 Technical Constraints

---

This is a simple static website. Do not add a build system.

Allowed:

```txt
HTML
CSS
modern browser JavaScript
inline SVG
localStorage
requestAnimationFrame
Web Audio API
local image assets
```

Not allowed:

```txt
npm build step
bundlers
frameworks
CDN dependencies
external fonts
remote image assets
audio files
HTML canvas rendering
server-side code
```

Keep the implementation understandable and maintainable. The final project should be easy to inspect by opening `index.html`, `styles.css`, and `app.js`.

---

F00 Product Quality Bar

---

The final page should look intentional, polished, and quiet. The image remains the hero. The ball and effects create the joke. The pass counter communicates continuity. The audio is optional, restrained, and user-controlled.

The page should work locally and on GitHub Pages. It should remain responsive across desktop, tablet, landscape phone, and portrait phone. It should preserve the exact coordinate system from the specifications so the ball aligns with the rabbits.

The project is complete only when visual behavior, animation, persistence, responsiveness, reduced-motion behavior, audio controls, and procedural audio all pass validation.

---

G00 Completion Workflow

---

Use `TODO.md` as the execution checklist. Update it as work progresses.

Before checking any item:

```txt
Confirm the code implements the requirement.
Confirm the feature works in context.
Confirm no previous feature regressed.
Confirm the result still follows the relevant spec file.
```

At the end, provide a concise completion report that names the files created, summarizes major behaviors implemented, lists any intentional deviations from the specs, and states whether every item in `TODO.md` was verified.
