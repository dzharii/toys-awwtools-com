# Framework Examples

The same design-system package can be consumed from plain HTML or framework apps because the public interface is custom elements and CSS.

## Vanilla

```html
<link rel="stylesheet" href="./node_modules/@my-ds/tokens/dist/tokens.css">
<link rel="stylesheet" href="./node_modules/@my-ds/tokens/dist/theme-default.css">
<link rel="stylesheet" href="./node_modules/@my-ds/components/dist/bundle.css">
<script type="module" src="./node_modules/@my-ds/components/dist/index.js"></script>

<my-button variant="primary">Save</my-button>
```

## React

```jsx
import "@my-ds/tokens/tokens.css";
import "@my-ds/tokens/theme-default.css";
import "@my-ds/components/bundle.css";
import "@my-ds/components";

export function SaveAction() {
  return <my-button variant="primary">Save</my-button>;
}
```

React treats unknown custom elements as DOM elements. Prefer string attributes and listen to custom events with refs if a component emits them.

## Vue

```vue
<script setup>
import "@my-ds/tokens/tokens.css";
import "@my-ds/tokens/theme-default.css";
import "@my-ds/components/bundle.css";
import "@my-ds/components";
</script>

<template>
  <my-button variant="primary">Save</my-button>
</template>
```

Tell Vue's compiler that tags beginning with `my-` are custom elements.

## Svelte

```svelte
<script>
  import "@my-ds/tokens/tokens.css";
  import "@my-ds/tokens/theme-default.css";
  import "@my-ds/components/bundle.css";
  import "@my-ds/components";
</script>

<my-button variant="primary">Save</my-button>
```
