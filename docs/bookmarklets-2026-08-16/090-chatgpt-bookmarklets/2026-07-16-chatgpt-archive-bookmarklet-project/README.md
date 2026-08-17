# ChatGPT Archive Bookmarklet Project

This package contains two readable, self-contained bookmarklet revisions and the project specification.

Version 1 is a reconstructed baseline based on the original requirements and proof-of-concept. The original Version 1 output paths were overwritten when Version 2 was generated, so the baseline is not guaranteed to be byte-identical to the earlier artifact.

Version 2 is the preserved hardened implementation from the final revision.

Use `chatgpt-archive-mode.js` as the canonical readable source. The `chatgpt-archive-bookmarklet-readable.txt` file prefixes the readable source with `javascript:`. The encoded `.txt` file is suitable for copying into a bookmark URL. The `.html` file provides a drag-to-bookmarks installer and a source preview.

Do not place a bearer token in any bookmarklet. The implementations use the authenticated page session and redact credential-like values from logs.
