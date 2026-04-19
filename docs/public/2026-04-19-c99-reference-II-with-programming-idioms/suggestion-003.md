A00 Scope, invariants, and guardrails
This specification defines **mobile only enhancements** for the provided codebase. The desktop and large tablet experience is a hard invariant and must remain visually and behaviorally equivalent to the current implementation. All existing desktop layout, spacing, typography, interaction patterns, and information density are considered correct and must not regress.

Enhancements apply only to phone sized viewports and must be strictly gated by CSS media queries or explicit viewport checks. No desktop styles may be overridden implicitly. Any JavaScript changes must be no-op on desktop and must not alter DOM structure or event flow when the viewport exceeds the mobile breakpoint.

The intent is enhancement, not redesign. Desktop is the baseline. Mobile is an additive layer.

---

A01 Breakpoint policy and activation model
The existing breakpoint at 960px already cleanly separates desktop and sidebar behavior. This specification introduces a **second, narrower breakpoint at 600px** to represent phone sized devices.

Rules are as follows.
Above 960px: full desktop experience, unchanged.
Between 600px and 960px: existing behavior only, unchanged.
At or below 600px: mobile enhancements activate.

No styles targeting max-width 960px may be modified unless they already exist. All new mobile specific logic must target max-width 600px only.

Example scaffold to make intent explicit:

```css
@media (max-width: 600px) {
  /* mobile-only enhancements */
}
```

This guarantees the desktop experience is untouched.

---

A02 Typography and spacing refinement without desktop impact
The current typography is well balanced on desktop. On mobile, the problem is density, not font choice or hierarchy. The solution is to slightly increase vertical rhythm and line height without resizing text aggressively.

Only the following adjustments are permitted on mobile:
Line height increase for long reading blocks.
Slightly larger paragraph separation.
Very small heading size reductions to avoid wrapping issues.

No font family, weight, or color changes are allowed at desktop sizes.

Mobile only CSS:

```css
@media (max-width: 600px) {
  body {
    line-height: 1.65;
  }

  .content {
    padding: 1.25rem 1rem 3.5rem;
  }

  .prose p {
    margin-bottom: 0.9rem;
  }

  .category > h2 {
    font-size: 1.55rem;
  }

  .header > h3 {
    font-size: 1.25rem;
  }

  .function-header h4 {
    font-size: 1.1rem;
  }
}
```

These rules override nothing above 600px and do not alter layout structure.

---

A03 Touch target enlargement with zero desktop regression
The current UI is optimized for pointer precision. On phones, tap accuracy requires larger hit areas. The key constraint is that visual density must remain unchanged on desktop.

This is achieved by increasing padding only inside mobile media queries.

Mobile only CSS:

```css
@media (max-width: 600px) {
  .toc-link {
    padding: 0.6rem 0;
  }

  .copy-button {
    padding: 0.45rem 0.9rem;
    font-size: 0.85rem;
  }

  #sidebarToggle {
    padding: 0.6rem 0.9rem;
  }
}
```

Because these selectors already exist and are scoped to mobile, desktop behavior is unaffected.

---

A04 Sidebar usability improvements without altering desktop logic
The sidebar implementation in app.js is sound and must not be reworked. The only mobile issue is discoverability of the close action.

The enhancement is limited to adding a **mobile only close button** inside the sidebar header. This button is hidden on desktop and uses the existing closeSidebar logic.

CSS only addition:

```css
@media (max-width: 600px) {
  .sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .sidebar-close {
    background: transparent;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
  }

  body.sidebar-open {
    overflow: hidden;
    overscroll-behavior: contain;
  }
}
```

JavaScript constraint: the close button must only be injected or activated when matchMedia("(max-width: 600px)") is true. On desktop, no DOM changes occur.

---

A05 Code block readability and scroll affordance
Code blocks are critical content. Desktop behavior is already correct and must remain untouched. On mobile, code blocks need slightly more breathing room and clearer scroll affordance.

Mobile only CSS:

```css
@media (max-width: 600px) {
  .copy-block pre {
    font-size: 0.9rem;
    line-height: 1.5;
    padding: 0.85rem 1rem;
  }

  .copy-block {
    position: relative;
  }

  .copy-block::after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    width: 24px;
    height: 100%;
    pointer-events: none;
    background: linear-gradient(
      to left,
      rgba(253,253,252,1),
      rgba(253,253,252,0)
    );
  }
}
```

This does not affect desktop rendering or performance.

---

A06 Progressive disclosure applied only to mobile
Function cards are intentionally verbose on desktop. On phones, this verbosity causes excessive scrolling. The solution is progressive disclosure applied strictly on mobile.

Rules:
Signature and summary are always visible.
Parameters, Returns, Notes, and Examples collapse by default on mobile only.
Desktop remains fully expanded with no state changes.

CSS behavior:

```css
@media (max-width: 600px) {
  .section-block.collapsible > *:not(h5) {
    display: none;
  }

  .section-block.collapsible.open > * {
    display: block;
  }

  .section-block h5 {
    cursor: pointer;
  }
}
```

JavaScript constraint: the collapsible class must only be added when in mobile viewport. No desktop DOM mutation is allowed.

---

A07 Table of contents density reduction on mobile only
The TOC is excellent for desktop scanning. On phones, it becomes overwhelming. The enhancement is a mobile only reduction in default depth.

Rules:
Categories and headers remain visible.
Function lists are hidden by default on mobile.
Functions expand only when the user interacts with a header.
Search behavior remains unchanged.

CSS only control:

```css
@media (max-width: 600px) {
  .toc-functions {
    display: none;
  }

  .toc-header-block.open .toc-functions {
    display: block;
  }
}
```

Desktop TOC rendering is untouched.

---

A08 Contrast adjustments scoped to mobile
Muted text and borders are slightly too subtle on phone screens under glare. The fix is a small contrast increase applied only on mobile.

Mobile override:

```css
@media (max-width: 600px) {
  :root {
    --muted: #444444;
    --border: #c9c5bd;
  }
}
```

Desktop colors remain exactly as defined.

---

A09 Motion tuning and accessibility
Animations feel heavier on low power mobile devices. Desktop timing is correct and must not change.

Mobile only adjustments:

```css
@media (max-width: 600px) {
  .sidebar {
    transition: transform 0.15s ease;
  }

  .flash {
    animation-duration: 1s;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation: none;
    transition: none;
  }
}
```

This respects accessibility preferences and avoids desktop regressions.

---

A10 Safe area handling for modern mobile devices
Phones with gesture bars and notches can obscure bottom content. This is not an issue on desktop and must be handled conditionally.

Mobile only CSS:

```css
@media (max-width: 600px) {
  .content {
    padding-bottom: calc(3.5rem + env(safe-area-inset-bottom));
  }

  .sidebar {
    padding-bottom: calc(1.5rem + env(safe-area-inset-bottom));
  }
}
```

---

A11 Summary of guarantees
Desktop layout, spacing, typography, navigation, and interaction remain unchanged.
All enhancements are strictly scoped to max-width 600px.
CSS is the primary mechanism.
JavaScript changes are minimal, conditional, and additive.
No content is removed or hidden on desktop.

This specification ensures the current experience is preserved while the mobile experience becomes clearer, more readable, and significantly more usable without introducing risk to the existing design.
