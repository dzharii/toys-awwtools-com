# Accessibility

Accessibility is treated as a component quality requirement, not a cleanup task.

## Baseline Rules

- Use native controls where they exist.
- Use links for navigation and buttons for actions.
- Keep visible focus states.
- Do not remove labels from form controls.
- Use ARIA to clarify behavior, not to recreate native semantics badly.
- Respect reduced-motion preferences.
- Keep token color pairs above contrast requirements.

## Component Patterns

`my-button` renders a real `<button>` unless `href` is provided. Link-buttons use an anchor only when the action navigates.

`my-input` always renders a visible label and connects hint/error text with `aria-describedby`.

`my-disclosure` synchronizes `open`, `hidden`, and `aria-expanded`.

`my-alert` uses `role="status"` for non-destructive messages and `role="alert"` for danger messages.

## Verification

Run:

```bash
npm run test
```

The current checks verify token contrast and manifest completeness. Browser-level keyboard and screen-reader checks should be added as the component set grows.
