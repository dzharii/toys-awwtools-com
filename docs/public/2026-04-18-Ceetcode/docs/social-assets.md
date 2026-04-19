# Social Assets and Metadata

This project generates social preview and favicon assets from source logos stored in:

- `draft-logos/2026-04-18-cc-social-media-logo.png`
- `draft-logos/2026-04-18-cc-favicon.png`

Final runtime assets are committed under `static/` and copied into `dist/` on build.

## Generated outputs

- `static/social/og-image.png` (1200x630 Open Graph/Twitter preview)
- `static/favicon.ico` (multi-size icon container)
- `static/favicon-16.png`
- `static/favicon-32.png`
- `static/favicon-64.png`
- `static/favicon-128.png`
- `static/apple-touch-icon.png`

## Metadata wiring

`index.dist.html` includes:

- standard page description
- Open Graph tags (`og:type`, `og:site_name`, `og:title`, `og:description`, `og:url`, image tags)
- Twitter tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`, `twitter:image:alt`)
- favicon and Apple touch icon links

Social image URLs are absolute and use the deployed base:

- `https://toys.awwtools.com/public/2026-04-18-Ceetcode/dist/social/og-image.png`

## Build integration

`scripts/build-site.mjs` copies `static/` into `dist/` so all metadata-linked assets are present in the final deployable output.
