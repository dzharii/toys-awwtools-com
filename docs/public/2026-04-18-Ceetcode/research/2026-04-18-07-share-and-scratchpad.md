# Share + Scratchpad Implementation Record (2026-04-18)

## Scope

Implemented `suggestions005.md`:

- permanent scratchpad problem `New`
- hash-based share/import flow
- UI share action and feedback behavior

## Decisions

1. Scratchpad identity and ordering
- Added `new` problem definition in `problems/catalog.ts`.
- Sorted catalog in `runtime/problem-catalog.ts` so `new` is always first regardless source ordering.

2. Scratchpad run friction
- Signature uses `int problem(void)`.
- Starter prints hello-world and returns `0`.
- Harness treats official scratchpad test as execution-only pass to keep default run flow frictionless.

3. Share payload model
- Payload schema: `{ version: 1, problemId, source, customTests }`.
- Encoding: UTF-8 JSON -> URL-safe base64 in hash fragment (`#share=...`).
- No server storage.

4. Share import precedence
- Valid share payload overrides initial local draft/custom content.
- Missing problem id falls back to scratchpad and surfaces a non-blocking notice.
- Invalid payload is ignored safely with warning feedback.

5. Clipboard UX
- `Share` button generates URL and attempts clipboard copy.
- If unavailable/fails, fallback prompt allows manual copy.

## Validation

- Added acceptance coverage for:
  - scratchpad run flow
  - share hash restoration
- `npm run test:acceptance` passed.
