# Licenses

This project bundles third-party code and fonts locally so the app runs fully
offline. Each vendored file is recorded in
[`scripts/vendor-manifest.json`](scripts/vendor-manifest.json) with its upstream
source, version, size, and SHA-256 hash. Run `node scripts/vendor-check.mjs` to
verify integrity.

The application's own source code (everything under `css/`, `js/`, `index.html`,
`scripts/`, and `tests/`) is part of this repository and follows the repository
license.

## Runtime dependencies

| Dependency | Version | License | Local files |
| ---------- | ------- | ------- | ----------- |
| [markdown-it](https://github.com/markdown-it/markdown-it) | 14.1.0 | MIT | `vendor/markdown-it/markdown-it.js`, `vendor/markdown-it/LICENSE` |
| [DOMPurify](https://github.com/cure53/DOMPurify) | 3.1.6 | Apache-2.0 OR MPL-2.0 | `vendor/dompurify/purify.js`, `vendor/dompurify/LICENSE` |

Both are vendored as readable, **unminified** source.

## Fonts

All bundled fonts are licensed under the **SIL Open Font License, Version 1.1**.
The full license text for each family is stored under
`assets/fonts/licenses/`.

| Family | Role | License file |
| ------ | ---- | ------------ |
| [Literata](https://fonts.google.com/specimen/Literata) | Default reading serif (variable) | `assets/fonts/licenses/Literata-OFL.txt` |
| [Source Serif 4](https://github.com/adobe-fonts/source-serif) | Alternate serif (variable) | `assets/fonts/licenses/SourceSerif4-OFL.txt` |
| [Charis SIL](https://software.sil.org/charis/) | Alternate serif | `assets/fonts/licenses/CharisSIL-OFL.txt` |
| [Merriweather](https://github.com/SorkinType/Merriweather) | Alternate serif | `assets/fonts/licenses/Merriweather-OFL.txt` |
| [Atkinson Hyperlegible](https://www.brailleinstitute.org/freefont/) | Legible UI / accessibility font | `assets/fonts/licenses/AtkinsonHyperlegible-OFL.txt` |

Font WOFF2 files were obtained from the [Fontsource](https://fontsource.org/)
distributions of these open-licensed families; the exact upstream URLs are
recorded in the vendor manifest.

## SIL Open Font License summary

The OFL permits use, study, modification, and redistribution of the fonts,
including bundling with software, provided the fonts are not sold by themselves
and the license and copyright notice are retained. The retained license texts
under `assets/fonts/licenses/` satisfy this requirement.
