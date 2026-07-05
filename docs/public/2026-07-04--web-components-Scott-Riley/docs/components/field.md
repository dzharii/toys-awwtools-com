---
title: Field
---

<ComponentHeader tag="my-field" />

## Examples

<ComponentExample>
  <my-field label="Deployment target" hint="Use a stable environment name.">
    <input id="deployment-target" value="production" />
  </my-field>
  <my-field label="Release channel" error="Choose a channel before publishing." required>
    <select id="release-channel">
      <option value="">Select channel</option>
      <option>Stable</option>
      <option>Beta</option>
    </select>
  </my-field>
</ComponentExample>

## Props

<PropsTable tag="my-field" />

## Usage

Use `my-field` when a native form control or app-specific input should remain consumer-defined, but the label, hint, and error treatment should come from the design system.

## Accessibility

The wrapper provides visible field text. Consumers are still responsible for making sure slotted controls have matching `id` and labelling where needed.
