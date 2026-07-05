---
title: Alert
---

<ComponentHeader tag="my-alert" />

## Examples

<ComponentExample>
  <my-alert heading="Heads up">This component communicates neutral information.</my-alert>
  <my-alert variant="success" heading="Saved">Your changes are now available.</my-alert>
  <my-alert variant="warning" heading="Check this">Token contrast should be verified before release.</my-alert>
  <my-alert variant="danger" heading="Action failed">The package could not be published.</my-alert>
</ComponentExample>

## Props

<PropsTable tag="my-alert" />

## Usage

Use alerts for contextual feedback near the action or content they describe. Do not use alerts for every piece of helper text; reserve them for messages that deserve attention.

## Accessibility

Danger alerts use `role="alert"` because they may require immediate attention. Other variants use `role="status"` to avoid interrupting the user unnecessarily.
