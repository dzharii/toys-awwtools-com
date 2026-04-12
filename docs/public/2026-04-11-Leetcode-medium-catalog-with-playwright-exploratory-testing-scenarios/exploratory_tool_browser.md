• Added a reusable exploratory layer on top of the Playwright harness.

  What’s new:

  - Guided exploratory runner: browser-tests/scripts/run-exploratory-session.js
  - Ad hoc REPL: browser-tests/scripts/exploratory-repl.js
  - Shared session engine: browser-tests/utils/exploratory-session.js
  - First reusable charter: browser-tests/exploratory/charters/explorer-desktop-sweep.json
  - Workflow docs: browser-tests/exploratory/README.md and notes/exploratory-testing.md

  The exploratory tool now gives you:

  - session-scoped folders with reproducible screenshot names
  - markdown report + JSON manifest + environment snapshot + session log
  - the exploratory pass exposed uncaught runtime errors from missing scroll element refs, fixed in app.js

  I also tightened the stable suite so browser errors are no longer just logged; acceptance now fails on uncaught page
  errors or console errors in browser-tests/tests/explorer.spec.js.

  Validation:

  - npm run test:browser:acceptance -> 6 passed
  - guided exploratory session completed with evidence in browser-tests/exploratory/sessions/2026-04-11t04-37-48.288z-
    explorer-desktop-sweep
  - latest acceptance log: browser-tests/logs/2026-04-11t04-33-17.229z.log

  Run it with:

  - npm run test:browser:repl