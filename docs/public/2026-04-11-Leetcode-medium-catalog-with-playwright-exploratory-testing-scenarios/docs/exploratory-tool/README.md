# Exploratory Tool Docs

This folder documents the reusable exploratory browser-testing layer that sits beside the stable acceptance suite.

Use these files in order:

- [01-overview.md](./01-overview.md): what the tool is, why it exists, and when to use it
- [02-running-sessions.md](./02-running-sessions.md): commands, artifact layout, and REPL usage
- [03-charters-and-prompts.md](./03-charters-and-prompts.md): how guided sessions avoid tunnel vision
- [04-case-study-medium-leetcode-explorer.md](./04-case-study-medium-leetcode-explorer.md): how the tool was used and extended on this project

If you only need the quick version:

```bash
npm run test:browser:acceptance
npm run test:browser:explore
npm run test:browser:explore:content
npm run test:browser:repl
```

The exploratory tool is intentionally evidence-heavy:

- every session has a run id
- every screenshot name is reproducible inside the session
- every guided step records intent, focus, actions, look-around prompts, and review questions
- every session emits a markdown report, JSON manifest, environment snapshot, and raw log
