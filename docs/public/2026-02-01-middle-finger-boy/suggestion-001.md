2026-02-01
I WILL NOT BE LAZY. I WILL DO EXCELLENT RESEARCH. I WILL PROVIDE ALWAYS ACCURATE ANSWERS. I AM AWARE ABOUT YOUR DISABILITY. DUE TO THIS DISABILITY, I WILL NEVER NEVER USE PLACEHOLDERS OR TODOS IN CODE. ALWAYS DISPLAY FULL EXECUTABLE CODE TO ASSIST THE DISABLED AND MINIMIZE YOUR STRAIN

# Specification Document: Semantic “Middle Finger + Speech Bubble” SVG Web App (Standards-Only, URL-Controlled)

## 1) Purpose and Context

This project is a **local, browser-run web application** that renders a **cartoon character** (inspired by a low-poly poster-like reference) with:

* a **right hand showing a middle finger** whose “extension percentage” is controllable, and
* a **speech bubble** whose message is supplied via URL parameters and is laid out neatly inside the bubble.

The user’s core intent is **future manipulation and animation**. The artwork must be structured as a **semantic SVG** (not a flattened mesh of triangles) so that parts can be individually targeted by JavaScript and CSS: clouds drift, finger extends, bubble resizes to text, etc.

The initial attempt produced a working demo but has significant issues in layout balance, SVG semantics, parameter persistence, and overall visual correctness. This document restates the complete desired requirements (including the user’s notes and earlier design conversation), and details the issues observed and what should be fixed or rewritten by specialized coding agents.

---

## 2) High-Level Goals

### 2.1 Functional Goals

1. **Render the full scene using a single embedded SVG inside HTML**

   * No separate SVG file fetch is required for the core artwork.
   * The SVG can be inline in HTML; JS manipulates it via stable IDs/classes.

2. **URL parameter control**

   * `msg` controls the speech bubble text.
   * `mf` controls the middle finger extension percentage.
   * The URL should remain shareable and stable: copying the URL reproduces the same pose and message.

3. **Semantic SVG structure**

   * The artwork must be grouped into meaningful objects (clouds, head, cap, hand, fingers, bubble, etc.).
   * Stable IDs and classes enable future animation and manipulation.

4. **Future-ready animation and deformation**

   * Clouds: parallax drift with per-cloud speed.
   * Middle finger: “percentage extension” should be controllable smoothly, ideally anatomical (segments/joints).
   * Bubble: dynamic resizing and word-wrapping; text must fit with padding/margins and never overflow.

5. **Local usage and automation**

   * Include a PowerShell script that starts a local server and opens the browser with parameters.

### 2.2 Non-Goals (for now)

* No backend or remote hosting required.
* No external dependencies (libraries) required.
* No full asset conversion from a low-poly triangulated SVG is required in the current deliverable (but the semantic structure should make later conversion or redraw possible).

---

## 3) User Requirements Captured (Normalized, Close to Verbatim)

### 3.1 Artwork and Interaction Requirements

* Create a cartoonish character similar in concept to the reference:

  * baseball cap (red/white),
  * blue shirt and jeans,
  * sky background with stylized clouds,
  * a comic speech bubble to the side.
* The **right hand shows a middle finger** gesture.
* The speech bubble contains a message provided via URL (`msg`).
* The message should be laid out artistically inside the bubble:

  * Must fit within bubble bounds.
  * If it doesn’t fit, the bubble should expand in a smart way.
  * Bubble should be more “box-like” rather than purely circular, to better accommodate text.
  * Maintain padding/margins so text never touches the bubble border.
* In the future:

  * Clouds should animate smoothly (moving clouds/parallax).
  * Middle finger extension controlled by URL parameters should animate or interpolate smoothly.
  * Potentially display a numeric “percentage extended”.

### 3.2 Semantic SVG Requirement (Critical)

* The SVG must not be a flattened, low-poly triangle soup.
* Instead, it must be a **semantic illustration** with groups and meaningful parts, e.g.:

  * background group
  * clouds group with each cloud individually addressable
  * character group

    * head group (cap, hair, face, eyes, brows)
    * torso group (shirt, pants, shoes)
    * arms group
    * hand group

      * each finger as its own group
      * middle finger split into segments (proximal/mid/distal) or equivalent structure
  * bubble group (shape, tail, text)
* Each major part must have stable `id` and optionally `data-role` or class attributes for targeting.

### 3.3 Technical Constraints

* Use web standards: HTML5, CSS3, modern JS (ES modules allowed).
* Inline SVG in HTML.
* JS manipulates the SVG.
* PowerShell script supports parameters and launches the page with URL parameters.
* Support URL parameters robustly and safely; no XSS from message injection.

---

## 4) Architecture Requirements

### 4.1 Project Layout

Recommended files:

* `index.html`: semantic markup + inline SVG
* `styles.css`: layout, typography, theming, animations
* `app.js`: URL parsing, bubble layout engine, finger controller, cloud animator
* `serve.ps1`: local server and launch automation

### 4.2 Rendering Model

* SVG is present in the DOM at load.
* JS reads URL parameters, then:

  1. sets speech bubble text
  2. computes bubble dimensions
  3. positions bubble and text
  4. applies middle finger extension transforms
  5. configures cloud animation speeds

### 4.3 Compatibility Model

* Must work in modern Chromium browsers and Firefox.
* If `foreignObject` is used, document fallback behavior (some environments handle it differently).

  * Option A: pure SVG text with `tspan` wrapping and `getComputedTextLength`.
  * Option B: `foreignObject` for HTML text layout (simpler wrapping), but requires careful compatibility testing and fallback.

---

## 5) URL Parameters and Shareability Specification

### 5.1 Parameters

* `msg` (string):

  * URL-decoded
  * length limited (e.g., <= 200)
  * sanitized by construction (insert as text nodes only; never `innerHTML`)
* `mf` (number 0..100):

  * clamp and default if invalid
  * interpret as “extension percent”

### 5.2 Share Link Requirements (Important)

* The generated URL must **preserve the user’s chosen mf value**, even if it equals a “default.”
* The current demo omitted `mf` when it equals the default value (100), which can conflict with user expectations:

  * Users may expect the copied URL to include explicit `mf` so that it is always reproducible and visibly configured.
* Specification recommendation:

  * Provide an explicit mode:

    * “Minimal URL” mode: omit defaults (optional).
    * “Stable share URL” mode (default): always include `mf` and `msg` if they were set or interacted with.
  * Or, simplest: always include `mf` parameter in the share URL.

### 5.3 Persistence Rules

* When the user changes message or mf:

  * URL updates without losing other parameters.
  * No parameter should disappear unexpectedly.
* Reset should explicitly set URL to defaults (either blank query string or explicit defaults—choose one and keep consistent).

### 5.4 Known Issue Observed

* User reports “it loses the MF parameter entirely, so I cannot share a middle finger extended.”
* Likely causes in the current implementation:

  1. **Default omission behavior**: `mf=100` removed from URL (per “omit defaults” logic), which user perceives as “lost.”
  2. URL update routine rebuilding the query string from scratch and conditionally omitting `mf`, rather than merging/retaining.
* Fix requirement:

  * Provide deterministic share URLs that preserve the current state and include `mf` explicitly.

---

## 6) Semantic SVG Specification

### 6.1 Required Group Hierarchy (Example)

* `bg`

  * `sky`
  * optional haze/gradient overlays
* `clouds`

  * `cloud-1` (class `cloud`, data-speed)
  * `cloud-2`
  * `cloud-3`
* `character`

  * `head`

    * `cap`
    * `hair`
    * `face`

      * `eyes`
      * `brows`
      * `mouth`
  * `torso`

    * `shirt`
    * `pants`
    * `shoes`
  * `arm-left`
  * `arm-right`

    * `hand-right`

      * `palm`
      * `thumb`
      * `finger-index`
      * `finger-ring`
      * `finger-pinky`
      * `finger-middle`

        * `middle-prox`
        * `middle-mid`
        * `middle-dist`
* `bubble`

  * `bubble-shape`
  * `bubble-tail`
  * `bubble-text`

### 6.2 Coordinate and Transform Rules

* Prefer SVG transforms on groups (`<g>`) for animation.
* Establish clear transform origins for finger joints:

  * Either define joint points with known coordinates
  * Or use `transform-box` / `transform-origin` carefully (browser differences exist for SVG)
* Keep “rest pose” consistent:

  * Decide whether the default pose is “fully extended” or “fully folded”.
  * `mf=0` and `mf=100` must map to intuitive poses.

### 6.3 Visual Styling Rules

* Scene must be balanced:

  * The character should be centered or intentionally composed with adequate margins.
  * The bubble should not overlap awkwardly or be clipped.
  * The hand should look correctly oriented and proportioned.

---

## 7) Speech Bubble Layout Engine Specification

### 7.1 Functional Requirements

* The bubble must resize to fit text and maintain padding.
* The bubble should be more rectangular (“box-like”), with rounded corners.
* The tail should point toward the character’s mouth/head anchor.
* Must support:

  * short messages (single line)
  * longer messages (multi-line wrapping)
  * long words (must break safely without overflow)

### 7.2 Implementation Options

**Option A: Pure SVG Text**

* Use `<text>` with `<tspan>` wrapping.
* Measure line length via `getComputedTextLength`.
* When exceeding max width:

  * wrap at word boundaries; if a word is too long, soft-break by character.
* After wrapping:

  * measure bounding box via `getBBox`
  * compute bubble width/height = bbox + padding
  * generate rounded-rect path for bubble
  * reposition text with padding offsets

**Option B: foreignObject Text**

* Insert a `<foreignObject>` and an HTML `<div>` for text.
* Use CSS for wrapping and measure via DOM.
* Caveats:

  * Compatibility testing required
  * fallback required if foreignObject text fails in a target browser environment

### 7.3 Quality Requirements

* Text must never overflow bubble.
* The bubble must not clip outside the SVG viewbox.
* The bubble must remain legible: high contrast, consistent font size, line spacing.
* Provide max width so bubble doesn’t dominate the frame.

---

## 8) Middle Finger “Extension Percentage” Specification

### 8.1 Functional Requirements

* `mf` parameter controls finger extension from 0 to 100.
* Movement should feel natural:

  * ideally use a joint/segment model
  * segments rotate around joints, optionally with slight translation to mimic folding
* Must be deterministic:

  * `mf=0` always produces the fully folded pose
  * `mf=100` always produces fully extended pose

### 8.2 Segment Model

* At minimum:

  * three segments: proximal, middle, distal
* Rotational approach:

  * define fixed joint pivot points
  * compute angles as interpolation between folded angles and straight angles
* Alternative simpler approach:

  * translate/scale segments along axis
  * less anatomical but easier to implement reliably

### 8.3 Visual Correctness Requirements

* The finger must not “break” visually:

  * avoid disjoint gaps between segments
  * avoid segments floating away from the hand
* Z-order must be correct:

  * finger above palm if needed
  * nail above distal segment
* The hand should look proportioned and not “balloon” incorrectly.

---

## 9) Cloud Animation Specification

### 9.1 Requirements

* Each cloud must be individually addressable (`cloud-1`, etc.).
* Each cloud has a distinct speed (via `data-speed`).
* The motion should be smooth and continuous (no snapping).

### 9.2 Known Issue Observed in Current Demo

* The clouds look “ugly” and composition is off.
* There is a technical issue likely affecting the clouds:

  * The SVG uses `transform="translate(...)"` on cloud groups.
  * CSS animation also sets `transform`, which **overrides** the attribute transform.
  * Result: clouds lose their initial positions and drift from an unintended origin, causing poor layout and “broken” appearance.

### 9.3 Fix Requirements

* Do not animate the same `transform` property that is used for static placement unless combined correctly.
* Recommended patterns:

  1. Wrap each cloud in two nested groups:

     * outer group for static translate
     * inner group for animated translate
  2. Or use CSS variables and compose transforms (carefully).
* Ensure the drift path starts off-screen and ends off-screen while preserving baseline y-position and initial x offset.

---

## 10) Layout and Composition Specification (Why the Current Looks “Weird”)

### 10.1 Observed Symptoms (from user feedback)

* The scene is not balanced or centered.
* The character proportions look wrong / broken.
* The overall composition feels “off.”
* Bubble placement and cropping look awkward.

### 10.2 Likely Contributing Issues

1. **ViewBox vs layout mismatch**

   * The SVG viewBox is 800x1200, but the CSS container might scale and crop in ways that make the scene appear off-center.
2. **Bubble anchor coordinates are hard-coded**

   * If the bubble is anchored without regard to character position and scale, it can overlap or clip.
3. **Hand and finger transforms are not anatomically consistent**

   * The transforms may fold/extend around incorrect pivot points.
4. **Layer ordering**

   * Some groups may render in an order that causes overlap (bubble behind head, etc.) depending on desired layering.

### 10.3 Required Improvements

* Define a composition grid:

  * Character centered (or intentionally offset) with stable margins.
  * Bubble anchored relative to head position or a named “anchor point” (e.g. `data-anchor="mouth"`).
* Create explicit anchor points:

  * e.g., invisible circles/points in SVG for mouth position, bubble tail tip target, etc.
* Ensure consistent scaling behavior:

  * SVG should scale to container while maintaining aspect ratio.
  * Avoid unintended cropping; if cropping is desired, define it as a design choice.

---

## 11) Accessibility and UX Requirements

### 11.1 Accessibility

* Semantic HTML:

  * Use labels for inputs.
  * Provide aria-labels for key controls.
* Keyboard accessibility:

  * All controls operable via keyboard.
* Contrast:

  * Ensure text is readable in bubble and UI.

### 11.2 UX

* Live preview:

  * Changes should update preview reliably.
  * The share link should reflect exactly what’s on screen.
* Provide a reset action.
* Provide a copy-link action with clear feedback.

---

## 12) Security Requirements

* The `msg` parameter must be handled safely:

  * Insert only via `textContent` or SVG text nodes
  * No HTML interpretation
* PowerShell server:

  * Prevent path traversal (`..`)
  * Serve only known local directory files
  * Disable caching for iteration convenience (optional)
* Clipboard:

  * Use safe Clipboard API with fallback.

---

## 13) PowerShell Automation Specification

### 13.1 Functional Requirements

* `serve.ps1` should:

  * Accept parameters:

    * `-Port` (default e.g. 8787)
    * `-Message` (string)
    * `-MiddleFinger` (0..100)
  * Start a local HTTP server.
  * Launch the default browser at:

    * `/index.html?msg=...&mf=...`
* Must URL-encode the message.
* Must validate mf range.

### 13.2 Known Issue Context

* If the web app logic omits `mf` from the URL, the PowerShell-launched URL may not stay stable after user interaction or share link copying.
* The specification requires stable query persistence to avoid confusion.

---

## 14) Issues in the Current Implementation (Bug and Defect Report)

This section documents the problems as reported and inferred from the behavior and screenshots.

### 14.1 Parameter Persistence / Share Link Bugs

* Symptom:

  * User reports the app “loses the MF parameter entirely” and cannot share an extended middle finger.
* Probable root cause:

  * URL update strategy rebuilds query string and conditionally omits `mf` when it equals a default (especially at 100).
* Required fix:

  * Share URL must preserve explicit mf state (recommended: always include mf).
  * Merge/retain parameters instead of conditionally dropping them unless user explicitly requests “minimal mode.”

### 14.2 Cloud Visual Bugs (Transform Override)

* Symptom:

  * Clouds appear badly positioned and “ugly.”
* Technical root cause:

  * SVG attribute `transform` is overridden by CSS animation `transform`, causing clouds to lose their intended starting translation.
* Required fix:

  * Use nested groups or composed transforms so static placement and animated drift do not conflict.

### 14.3 SVG Composition and Balance Issues

* Symptom:

  * Character looks “broken,” unbalanced, not centered.
  * Hand looks overly large/odd.
  * Bubble overlaps/crops awkwardly.
* Likely causes:

  * Hard-coded coordinates without reference anchors.
  * Lack of consistent proportions and alignment.
  * Layer ordering issues.
* Required fix:

  * Rework the composition with:

    * stable anchors,
    * consistent scale and positioning,
    * predictable z-ordering,
    * and intentional layout rules.

### 14.4 Rendering / Layering Issues (Potential)

* HUD group in the current demo contains a rectangle drawn after the text, likely covering it depending on ordering.

  * If the HUD text is intended to be visible, the rectangle should be drawn before the text or text should be layered above.
* Bubble may be behind character depending on draw order; decide desired layering.

---

## 15) Rewrite Recommendations (What to Keep vs What to Rebuild)

### 15.1 Keep (Conceptually)

* Standards-only approach (HTML/CSS/JS + inline SVG)
* Semantic grouping idea with stable IDs
* URL-driven state concept
* PowerShell server automation concept
* Cloud drift as a feature (but fix transform composition)

### 15.2 Rebuild / Refactor

1. **SVG artwork**

   * The current mock-up is too visually “broken” relative to the intended look.
   * Re-illustrate or redesign the SVG with better proportions:

     * head shape, cap placement, facial features aligned,
     * body posture consistent,
     * hand perspective improved,
     * overall centered and balanced.
2. **Cloud animation implementation**

   * Replace transform override with nested groups or transform composition.
3. **State and URL management**

   * Implement a robust state model:

     * parse → set state → render → update URL
     * share link always includes mf, or provide explicit mode.
4. **Bubble layout engine**

   * Keep dynamic sizing but anchor bubble to a semantic reference point (mouth/head anchor).
   * Improve bubble geometry and tail placement to avoid overlap and cropping.

---

## 16) Acceptance Criteria (What “Done” Means)

A build is acceptable when all of the following hold:

1. Opening a URL like `?msg=Hello&mf=35`:

   * shows “Hello” fully inside the bubble with padding,
   * finger extension visually matches ~35%,
   * no elements are clipped incorrectly.

2. The share link button:

   * produces a URL that reproduces the current state,
   * does not unexpectedly drop `mf`.

3. Clouds:

   * drift smoothly while retaining intended baseline placement,
   * different speeds per cloud visibly work,
   * no snapping due to transform conflicts.

4. SVG semantics:

   * major parts are grouped with stable IDs,
   * middle finger segments exist as separate groups,
   * bubble shape, tail, and text are separate and addressable.

5. Visual composition:

   * character appears centered/balanced on typical viewport sizes,
   * bubble placement looks intentional,
   * proportions do not look “broken.”

6. Security:

   * message cannot inject HTML/JS,
   * URL parsing handles malformed inputs safely.

7. PowerShell:

   * launching with parameters reliably opens the correct configured scene.

---

## 17) Notes on “Low-Poly SVG to Semantic SVG” Feasibility (From Earlier Discussion)

* If the starting asset is a flattened low-poly SVG made of many polygons, there is **no reliable fully-automatic conversion** into semantic parts like “hand,” “finger joints,” “cloud 1,” etc.
* A real semantic SVG is effectively a re-illustration or a hybrid process:

  1. algorithmic merging/simplification of polygons into larger regions, then
  2. manual correction and semantic labeling,
  3. redrawing articulation-critical parts (fingers, joints) for animation readiness.

This project’s semantic SVG should be treated as the “clean target model” that future conversion work can feed into.

---

## 18) Deliverables Checklist for Coding Agents

* A detailed state model:

  * parse URL
  * apply state
  * update UI controls
  * generate share URL preserving mf
* Bubble layout engine with:

  * wrapping
  * bounding box measurement
  * dynamic rounded rect
  * tail pointing to anchor
* Middle finger controller:

  * segments and joints
  * predictable interpolation
* Cloud drift:

  * nested transforms (static + animated)
* Improved SVG composition:

  * better proportions
  * centered layout
  * consistent layering
* Updated PowerShell script (if needed) and documentation:

  * clear usage examples
  * robust path traversal prevention
  * parameter encoding

---

## 19) Summary of Why the Current Demo “Looks Broken” and What Must Change

* The **clouds** likely appear wrong because the animation overwrote their static placement transform.
* The **mf parameter appears to be “lost”** because the implementation intentionally omits defaults from the URL (especially at `mf=100`), conflicting with the expectation of a stable shareable link.
* The **character composition** is an early mock-up and lacks correct proportions and anchored layout rules; it needs a deliberate re-illustration and anchor-based bubble positioning.
* The right direction is preserved (semantic SVG + URL-driven manipulation), but the visual design, transform strategy, and URL persistence must be corrected or rewritten to meet the project’s goals.
