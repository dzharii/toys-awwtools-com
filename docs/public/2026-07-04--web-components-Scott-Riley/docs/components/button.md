---
title: Button
---

<ComponentHeader tag="my-button" />

## Examples

<ComponentExample>
  <my-button>Default</my-button>
  <my-button variant="primary">Primary</my-button>
  <my-button variant="danger">Delete</my-button>
  <my-button variant="success">Confirm</my-button>
</ComponentExample>

```html
<my-button>Default</my-button>
<my-button variant="primary">Primary</my-button>
<my-button variant="danger">Delete</my-button>
<my-button variant="success">Confirm</my-button>
```

<ComponentExample>
  <my-button size="sm">Small</my-button>
  <my-button size="md">Medium</my-button>
  <my-button size="lg">Large</my-button>
  <my-button href="../installation.html" icon="arrow-right">Install</my-button>
  <my-button icon="check" icon-only aria-label="Approve">Approve</my-button>
  <my-button loading>Saving</my-button>
</ComponentExample>

## Props

<PropsTable tag="my-button" />

## Usage

Use a button for an action: submitting, saving, deleting, opening a dialog, or confirming a decision. Pass `href` only when the action navigates. That renders an anchor instead of a button.

Prefer one primary action per view or section. If every button is primary, none of them are.

## Accessibility

- Button text should describe the action.
- Use `icon-only` only with an `aria-label`.
- `loading` disables interaction and sets `aria-busy`.
- Link-buttons use `aria-disabled` and remove focus when disabled because anchors do not support native `disabled`.
