---
title: Disclosure
---

<ComponentHeader tag="my-disclosure" />

## Examples

<ComponentExample>
  <my-disclosure summary="Why custom elements?">
    <p>They keep the design-system API close to the platform and usable across framework boundaries.</p>
  </my-disclosure>
  <my-disclosure summary="Open by default" open>
    <p>The `open` attribute controls the expanded state.</p>
  </my-disclosure>
</ComponentExample>

```html
<my-disclosure summary="Why custom elements?">
  <p>They keep the component portable.</p>
</my-disclosure>
```

## Props

<PropsTable tag="my-disclosure" />

## Usage

Use disclosure for optional supporting content. Do not hide critical instructions behind it.

## Accessibility

The trigger is a real button. It synchronizes `aria-expanded` and `hidden` with the `open` attribute.
