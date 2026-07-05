# Release Checklist

Use this checklist before publishing the component and token packages.

## Build

- `npm run build:tokens`
- `npm run build:lib`
- `npm run docs:generate`
- `npm run docs:build`

## Verify

- `npm run test`
- Check component examples in default, dark, and high-contrast themes.
- Confirm generated docs did not overwrite handcrafted usage guidance.
- Confirm `packages/components/dist/custom-elements.json` includes every public component.
- Confirm package `exports` include CSS, JS, and manifest files.

## Publish

- Update package versions.
- Build from a clean checkout.
- Publish `@my-ds/tokens`.
- Publish `@my-ds/components`.
- Deploy the docs site.

The process should be boring. Interesting release processes are usually incident reports in disguise.
