---
title: My DS
description: A practical framework-agnostic design system built with custom elements, tokens, and living documentation.
---

# My DS

My DS is a small design system built to teach the practical workflow from the article: make design decisions in code, keep primitive components portable, document as you build, and package the result so it can be used without framework lock-in.

<ThemeSwitcher />

<ComponentExample>
  <my-button>Cancel</my-button>
  <my-button variant="primary">Save Document</my-button>
  <my-badge variant="success">Synced</my-badge>
  <my-alert variant="warning" heading="Token-driven">This example changes when the active theme changes.</my-alert>
</ComponentExample>

## What This Project Includes

- A token package that emits CSS custom properties and structured JSON.
- A component package that emits custom elements, component CSS, and a custom elements manifest.
- VitePress documentation that reads the same manifest and token output as the library.
- Primitive components for actions, status, form inputs, and feedback.
- Composite components for disclosure and form field composition.
- Framework examples showing the same components used from different application stacks.

## Why Web Components

The components are standard custom elements. Consumers can import the library once, write normal HTML, and keep application framework choices separate from design-system ownership.

The result is deliberately boring in the right places: attributes in, semantic markup out, token-backed CSS around it, and documentation generated from the same source metadata that ships with the package.

## Quick Start

```bash
npm install
npm run build
npm run docs:dev
```

Then open the printed local URL.

## Learning Path

1. Read [Architecture](./architecture.md) to understand the repository boundaries.
2. Read [Color](./foundations/color.md) and the other foundations to see the token pipeline.
3. Read [Button](./components/button.md) to see how a primitive component is documented.
4. Read [Disclosure](./components/disclosure.md) and [Field](./components/field.md) for composite component patterns.
5. Read [Framework Examples](./framework-examples.md) to see how the package crosses framework boundaries.
