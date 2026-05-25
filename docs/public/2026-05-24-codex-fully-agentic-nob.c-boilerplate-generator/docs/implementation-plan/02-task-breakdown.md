# Task Breakdown

- Create production files: `index.html`, `styles.css`, `script.js`.
- Define constants for platform profiles, compiler profiles, warning profiles, build profiles, and default config.
- Implement parsing helpers for newline-separated source/include/library fields.
- Implement validation helpers for identifiers, C string fields, duplicate list warnings, required fields, and suspicious library lines.
- Implement C string escaping with rejected double quotes/control characters and escaped backslashes.
- Implement `generateNobC(config)` using the pinned V1 template contract.
- Implement `buildRenderModel(config)` with generated code, bootstrap command, assumptions, validation messages, and copy/download enabled state.
- Implement exact fixture snapshot tests inside a local test harness that runs in the browser and from the console.
- Implement form event wiring and immediate preview refresh.
- Implement copy and download from the current app model, not from DOM text.
- Implement responsive layout and accessible labels.
- Run validation, record results, and update progress.

