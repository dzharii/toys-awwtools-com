---
title: Card
---

<ComponentHeader tag="my-card" />

## Examples

<ComponentExample>
  <my-card>
    <h3>Release-ready primitives</h3>
    <p>Cards group related content without pretending every section needs a decorative frame.</p>
    <my-button variant="primary">Review</my-button>
  </my-card>
  <my-card tone="subtle">
    <h3>Subtle surface</h3>
    <p>Use the subtle tone for lower-emphasis supporting content.</p>
  </my-card>
</ComponentExample>

## Props

<PropsTable tag="my-card" />

## Usage

Use cards for repeated content groups or genuinely bounded interface objects. Avoid nesting cards inside cards; nested frames make hierarchy muddy.

## Accessibility

`my-card` sets `role="group"` only when no role already exists. Add an accessible name with `aria-label` or `aria-labelledby` when the card needs to be announced as a distinct group.
