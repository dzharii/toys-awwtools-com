# specs/roman-usage-scenario_todo.md

Source: specs/roman-usage-scenario.md
Pass: Roman (experienced software engineer reading code-heavy notes)

Roman reviews technical Markdown and code notes on mobile and desktop. He trusts
the app only if code renders well, links behave, the runtime is genuinely local
and inspectable, Markdown is safe, and diagnostics are available.

---

## A00 Acceptance Checklist

### Technical Markdown & code
- [x] Fenced code blocks render in a monospace block, visually distinct from prose.
- [x] Inline code is distinct but not loud.
- [x] Code blocks contain overflow (horizontal scroll) instead of breaking the page/measure (verified `overflow-x: auto`).
- [x] Long code lines do not force the whole page wider or clip content.
- [x] Headings, lists, blockquotes, and tables render correctly.

### Links
- [x] Links are subdued and clearly styled.
- [x] Links are not prefetched.
- [x] External links open with `rel="noopener"`-style safety and only on explicit click.
- [x] `javascript:` URLs are neutralized.

### Safe Markdown (engineer-level scrutiny)
- [x] Raw HTML is escaped/sanitized, never executed (`html:false` + DOMPurify).
- [x] Images are placeholders and never fetched.
- [x] `<script>/<iframe>/<style>` and inline handlers are stripped.
- [x] Sanitizer failure fails closed.

### Local / offline integrity
- [x] No runtime network requests (CSP `connect-src 'none'`, verified 0 external).
- [x] All dependencies and fonts are local, unminified, and readable.
- [x] Vendor manifest with sha256 + `vendor-check.mjs` for integrity auditing.
- [x] The app runs from `file://` or a trivial static server with no backend.

### Inspectability & diagnostics
- [x] Source is plain, modular ES modules with clear names (no bundler/minifier).
- [x] Advanced diagnostics panel: debug-mode toggle, log view, copy logs, clear logs.
- [x] Logs are structured and never contain book/note content.
- [x] Reset preferences action available.

### Preference persistence without content persistence
- [x] Preferences persist (validated/versioned) under a single namespaced key.
- [x] Note/book content is never persisted (verified across reload).

### Mobile technical review
- [x] Code-heavy Markdown is readable on mobile; code blocks scroll horizontally rather than overflow the layout.
- [x] Touch targets and single-column layout work on a phone viewport.

---

## B00 Validation Checklist

- [x] Loaded code-heavy Markdown on desktop and mobile; verified code containment.
- [x] Confirmed images are not fetched and scripts do not execute.
- [x] Confirmed 0 external network requests during the session.
- [x] Verified vendored deps/fonts are unminified and license-tracked; `vendor-check` passes 17/17.
- [x] Opened Advanced diagnostics, enabled debug mode, confirmed logs render and can be copied/cleared.
- [x] Confirmed only `eink-reader:preferences` is stored and it contains no note text.
- [ ] Manual: read a real technical note to judge code/prose balance and contrast.

---

## C00 Risks And Edge Cases

- [x] Code blocks breaking pagination — contained via horizontal scroll.
- [x] Log leakage of content — logs carry event names/metadata only, not text.
- [x] Diagnostics cluttering the main UI for non-engineers — hidden behind a disclosure (reconciles with Lily).
- [ ] Extremely wide code with no spaces — scrolls horizontally; not visually stress-tested at extreme widths.

---

## D00 Final Review

- [x] Lily-driven simplification did not remove Roman's technical diagnostics (they are opt-in, not absent).
- [x] Frank-driven visual choices do not harm code readability (monospace block, contained overflow, high-contrast theme available).
- [x] No note content persisted; no runtime network access.
- [ ] Remaining limitation: final code/prose readability judgement is a human task.
