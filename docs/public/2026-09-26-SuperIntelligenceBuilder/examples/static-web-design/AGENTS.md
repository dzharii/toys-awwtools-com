# AGENTS.md

Instructions for maintaining this small static website.

## Scope

- The deliverable is a hand-editable site in `site/` and its planning documents in `design/`.
- Keep the site usable by opening `site/index.html` directly; do not add a build step, package manager, framework, analytics, or remote dependency.
- Keep HTML semantic, CSS local, and JavaScript progressive. Event essentials must remain visible and navigable when JavaScript is unavailable.

## Design process

- Establish a visual thesis, content plan, and interaction thesis before implementation.
- Compare three genuinely different art directions against the brief, then document the selected direction and reasoning.
- Favor repair-cafe-specific typography, composition, color, texture, and motion over generic product cards or dashboard patterns.
- Maintain `design/brief.md`, `design/directions.md`, `design/decision.md`, `design/system.md`, and `design/review-checklist.md` when the design changes materially.

## Accessibility and resilience

- Use landmarks, logical headings, keyboard-operable controls, visible focus, descriptive links, sufficient contrast, responsive layouts, and reduced-motion behavior.
- Treat mobile, no-JavaScript, empty, error, and unusually long content as designed states.
- Do not hide primary event information behind interaction.
- Prefer native HTML behavior; add JavaScript only where it provides an optional enhancement.

## Review

- Check HTML, CSS, and JavaScript syntax with available local tools.
- Check local links and file references, narrow and wide layouts, keyboard flow, focus visibility, and no-JavaScript readability.
- Do not copy third-party guideline or skill text into the repository. Apply relevant ideas in original project-specific language.
