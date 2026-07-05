---
title: Input
---

<ComponentHeader tag="my-input" />

## Examples

<ComponentExample>
  <my-input label="Project name" name="project" value="My DS" hint="Use a short, readable name."></my-input>
  <my-input label="Package name" name="package" value="@my-ds/components" error="Package names must be unique." required></my-input>
</ComponentExample>

```html
<my-input label="Project name" name="project" hint="Use a short, readable name."></my-input>
```

## Props

<PropsTable tag="my-input" />

## Usage

Use `my-input` when you want the component to own label, hint, error, and native input rendering. Use `my-field` when the consuming app needs to provide a custom input or select.

## Accessibility

The component always renders a visible label. Hint and error text are connected through `aria-describedby`, and errors set `aria-invalid`.
