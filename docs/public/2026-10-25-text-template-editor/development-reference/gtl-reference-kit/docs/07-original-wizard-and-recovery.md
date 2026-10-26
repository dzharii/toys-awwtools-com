# Optional third reference: original PowerShell guided publisher

The project concept originated from a CLI publisher that guided a user through selecting a project folder, category, description style, answering example-driven questions, accepting the final sentence, and writing HTML/RSS entries.

Reference copy in this kit: `../reference/powershell/Add-Project.ps1`, copied from the user-supplied `/mnt/data/Add-Project(2).ps1`. This is **not** used by, and should not be automatically executed by, the GTL web app.

## What to retain

- Five narrative templates with title, explanation, pattern, finished example, and targeted questions.
- Input guidance that tells users whether to enter a noun phrase, verb phrase, or final artifact.
- The ability to preview the sentence before accepting it.
- Editing the finished sentence without losing the original answers.
- Recovering previously entered publication values after failure.
- Separating technical preflight validation from user-authored publication values.

## What changes in the web application

The old CLI presents questions sequentially. The new app makes the entire document visible and editable immediately. Clicking a placeholder brings its hint and example into a stable contextual panel. A change updates the rendered result without requiring a wizard restart.

The prior PowerShell recovery idea proposed a hashed temporary JSON draft for a given project path. In the web app, the analogous requirement is **per-document autosave plus recoverable revision history**, not a temp-file cache. Use IndexedDB/other configured storage behind a repository API, keep in-memory editing state on failure, and do not store unrelated technical confirmations as user content.

## Failure-mode reminder

An earlier transcript described a PowerShell RSS update failure, reported as `Expected exactly one RSS lastBuildDate, found 0` after the user had already entered a complete description. The earlier analysis attributed this to CRLF-sensitive regular expression handling and suggested preflight validation before requesting content. The browser app should carry forward the general UX principle: validate known structural prerequisites early, preserve draft answers continuously, and emit actionable errors without discarding work. This document is not a fresh rerun or independent verification of that specific PowerShell diagnosis.
