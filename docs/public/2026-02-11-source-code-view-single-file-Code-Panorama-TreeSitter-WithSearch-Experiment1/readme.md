# Code Panorama

Code Panorama is a single-page, in-browser code viewer built for one job: make a codebase easy to read, easy to scan, and easy to understand without turning exploration into a tab-management exercise.

Instead of bouncing between files, Code Panorama loads a local project snapshot and presents it as a coherent, continuous reading experience. You keep your place, keep your context, and move through the project with lightweight navigation that feels closer to reading a document than operating an IDE.

## Why it is useful

Most time spent "reading code" is not actually reading. It is switching, searching, re-orienting, and trying to rebuild context that was lost a few clicks ago. Code Panorama is designed to reduce that overhead.

It is a strong fit when you want to understand how a project is shaped, where something is used, or what changed, without committing to a full editing environment. Common workflows include codebase onboarding, reviews, audits, incident follow-ups, and fast exploration of unfamiliar repositories.

## What you can do with it

- Load a local folder and browse it as a project tree and a file table of contents.
- Read supported source files as one long, scrollable document, with consistent file headers and basic stats.
- Search across the loaded project and jump directly to matches with surrounding context.
- Use a floating preview window to inspect other files without losing your scroll position.
- Inspect parsed structure and symbol-related information in supported languages for quicker orientation.
- Review what was loaded and what was skipped via stats and a readable log.

## Privacy and local-only operation

Code Panorama is built to run locally in your browser.

- No uploads. Your files are not sent to a server.
- No remote processing. The app operates on an in-memory snapshot inside the page.
- Local access only. Files are read using browser file access features, such as the File System Access API when available, with a standard file picker fallback.

If you can open the app, you can browse the code, and the code stays with you.

## How it works (high level)

You select a folder (or files). Code Panorama scans recursively, filters to supported source types, loads the contents into memory, and renders the project into a single continuous view. Navigation, search, preview, and symbol inspection operate on that loaded snapshot, so you can explore quickly without repeated I/O or external dependencies.

## Notes

Code Panorama is a viewer by design. It is optimized for exploration and understanding, not editing. If your goal is to read a project with minimal friction and maximum context retention, it is built for that workflow.

