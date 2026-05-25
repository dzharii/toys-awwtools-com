# Risks And Unknowns

## Risks

- Overbuilding: adding run/test/clean targets, static libraries, preset galleries, URL state, and diff views before the generated `nob.c` baseline is trustworthy.
- Underbuilding: making a glorified snippet page that does not justify the "power-user generator" request.
- Invalid generated code: bad C string escaping, unsafe identifiers, incorrect flags, output paths, or platform assumptions.
- Misleading portability: presenting platform presets as guarantees instead of assumptions.
- UI density: showing too many options without a clear generated-code relationship.
- Copy failure: users cannot trust the tool if copy/download output differs from the preview.

## Assumptions

- v1 targets executable-oriented C projects.
- v1 uses prefixed `nob.h` APIs.
- v1 emits one generated file: `nob.c`.
- v1 does not fetch `nob.h`; it assumes the user has `nob.h` next to `nob.c` or adjusts the include path manually.
- v1 supports platform assumptions, not full cross-platform generation.

## Deferred Questions

- Whether to support static library and test targets in v2.
- Whether to persist configuration in local storage or URL parameters.
- Whether to add a formal diff/code-lens mode after fixture validation exists.

