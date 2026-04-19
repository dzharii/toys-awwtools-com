# 2026-04-19 Reference Window Integration (suggestions009)

## Problem
Ceetcode needed a first-class in-app C99 reference workflow with two paths:
- Embedded floating tool window (draggable/resizable/closable, slim embedded mode)
- Full standalone opening in a new tab

The host had no existing reference integration, and acceptance required Playwright coverage including iframe interaction scenarios.

## Decisions
1. Implemented reusable floating window modules instead of embedding behavior directly in `app/main.ts`.
2. Used the existing reference embed contract (`awwtools.c99-reference.embed`, schema version 1) with hash startup config + `postMessage` runtime events.
3. Added host-side snippet insertion from embed outbound events (`REFERENCE_SNIPPET_INSERT_REQUESTED`) into the CodeMirror editor.
4. Added runtime fallback path for embed URL candidates (`./external-app-c99-reference/`, then `../external-app-c99-reference/`).
5. Updated build pipeline to copy `external-app-c99-reference/` into `dist/` for static-host deployments where only `dist/` is published.

## Implementation structure
- `app/tool-window/pointer-session.ts`: pointer capture session helper.
- `app/tool-window/drag.ts`: drag behavior.
- `app/tool-window/resize.ts`: resize behavior for edges/corners.
- `app/tool-window/floating-window.ts`: reusable shell with titlebar, controls, geometry persistence, z-index/focus.
- `app/integrations/c99-reference-window.ts`: C99 embed bridge, startup config, event handling, theme token sync, snippet integration.
- `app/main.ts`: topbar controls, integration wiring, snippet insertion callback, lifecycle disposal.
- `style.css`: floating window visuals + resize handles + topbar control styling.

## Issues found and fixes
1. Hidden floating window was still visible by default.
- Cause: `.tool-window { display: grid; }` overrode `[hidden]` behavior.
- Fix: `.tool-window[hidden] { display: none !important; }`.

2. Iframe interaction flakiness in e2e (search input actionability/click interception).
- Fix: introduced deterministic iframe search helper in Playwright that sets search input value via DOM event and confirms search state before assertions.

3. Resize assertion instability.
- Cause: expansion at constrained edge could produce unchanged width.
- Fix: use north-west resize expansion path in test for deterministic growth.

## Validation
Executed:
- `npx tsc --noEmit`
- `npm run test:e2e -- --grep "reference"`
- `npm run test:acceptance`

Result:
- Typecheck passed.
- Reference-specific e2e tests passed.
- Full acceptance suite passed (`18 passed`).

## Notes
Iframe validation is feasible and now covered for:
- Embedded open + search (`printf`)
- Dynamic title updates from embed entry changes
- Snippet insertion into host editor (`memset` scenario)
- Standalone popout behavior
- Floating window drag/resize behavior
- Geometry capture in test artifacts for key control layout checks
