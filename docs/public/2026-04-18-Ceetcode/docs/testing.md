# Browser Testing

Project-owned browser testing setup is under `tests/` and `playwright.config.ts`.

## Automated coverage

`tests/e2e/ceetcode.spec.ts` validates:
- Product shell render quality (problem panel, editor panel, controls, content sections).
- Run workflow state transitions and passing summary output.
- Failed-test reporting with explicit expected/actual output.
- Compile diagnostics with severity and line/column metadata.
- Runtime failure path distinct from compile failures.
- Custom test parse validation and official-test isolation.
- Per-problem draft persistence plus last-opened problem restore.
- Mobile tab switching flow without losing editor content.

The suite also enforces browser cleanliness:
- Any browser `console.error` event fails the test.
- Any uncaught `pageerror` event fails the test.
- Request failures are captured as diagnostics artifacts.

Each acceptance scenario captures visual-state artifacts:
- Full-page screenshot attachment.
- JSON snapshot of key UI state (`run-status`, summary, diagnostics, outputs).

## Local runner

`npm run test:e2e` does:
1. Build static bundle.
2. Start local static server.
3. Run Playwright tests.
4. Stop server.

`npm run test:acceptance` runs only acceptance-tagged scenarios (`@acceptance`).

## Exploratory testing

- Charters: `tests/exploratory/charters/`
- Session notes: `tests/exploratory/sessions/`
- `npm run test:exploratory` creates a timestamped session template.
