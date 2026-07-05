# Installation

Build the project from the repository root:

```bash
npm install
npm run build
```

Start the documentation site:

```bash
npm run docs:dev
```

## Consumer Usage

In an application, import the token CSS, one theme, component CSS, and component definitions:

```js
import "@my-ds/tokens/tokens.css";
import "@my-ds/tokens/theme-default.css";
import "@my-ds/components/bundle.css";
import "@my-ds/components";
```

Then use the elements as HTML:

```html
<my-button variant="primary">Save Document</my-button>
<my-alert variant="success" heading="Saved">Your changes are available.</my-alert>
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run build:tokens` | Builds token CSS and token JSON. |
| `npm run build:lib` | Builds component distribution files and manifest. |
| `npm run docs:generate` | Creates missing component documentation stubs from the manifest. |
| `npm run docs:dev` | Runs VitePress locally. |
| `npm run test` | Runs token, manifest, and contrast checks. |
| `npm run release:check` | Runs tests and builds docs for release verification. |
