# Skill Language Editor

Skill Language Editor is a dependency-free browser editor for structured skill-language documents. It keeps ordinary technical prose visually dominant while marking uppercase structural prefixes, indentation, and a small Markdown subset.

## Highlights

- Native textarea editing with a synchronized, source-safe highlight mirror
- Tab, Shift+Tab, indentation-preserving Enter, wrapping, spellcheck, and native undo/redo
- Debounced local autosave with filename, selection, and scroll restoration
- Local file import, one-file drag and drop, and guarded document replacement
- Timestamped revision downloads with normalized LF endings
- Installable, offline-capable PWA when served from HTTPS or localhost
- No runtime dependencies, remote services, analytics, or document transmission

Open `index.html` directly for the core editor. PWA installation and its service worker require HTTPS or localhost; any basic static server is sufficient.

The syntax highlighter is a new implementation for this experiment. Its small scanner approach is inspired by [microlight 0.0.7](https://github.com/asvd/microlight) by asvd, licensed under the MIT License. The vendored reference and license are preserved under `lib/lib-asvd-microlight-0.0.7/` but are not loaded at runtime.

## Verification

Browser checks use the globally installed Playwright package and browser:

```bash
NODE_PATH="$(npm root -g)" node tests/editor.test.cjs
```
