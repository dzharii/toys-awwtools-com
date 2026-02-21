2026-02-11

In this revision, I want you to review the current code and figure out why code blocks are not being highlighted in many cases (especially when the code isn’t explicitly highlighted). We may need a flag to indicate whether a given code block has been highlighted yet. If it hasn’t, then after a longer interval we should reapply highlighting. That’s point one: add a “has been highlighted” flag and set it when highlighting is applied.

Second, I want you to completely remove Highlight.js from the project code, including all references to the library and any Highlight.js-related logic. Do **not** delete any files—I’ve already manually deleted the Highlight.js files—just remove Highlight.js usage and references from the codebase.

Instead, switch the project to use **microlight**. If needed, adjust or modify the microlight library code (including its coloring/theme) to match the project’s current color scheme. Update the existing highlighting flow to use microlight first, then remove any remaining unused Highlight.js references or dead code so nothing Highlight.js-related remains.


Already DELETED Manually:
lib/highlight-js-v11.11.1

Added:
lib/lib-asvd-microlight-0.0.7