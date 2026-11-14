# Clearpick

A compact, spoiler-free shortlist of 74 approachable LeetCode Medium and Hard programming problems, with 74 individual premise illustrations, browser-local solved progress and bookmarklet synchronization.

Published website: https://clearpick-practice.mach1ne.chatgpt.site/

On desktop layouts at least 1280px wide with a fine hover pointer, hover an illustration to enlarge it in a stationary translucent glass cloud. Moving between illustrations crossfades the artwork; leaving, scrolling or pressing Escape dismisses it. The effect is disabled in stacked layouts and honors reduced motion.

Extract the complete source ZIP and open **offline.html** directly to browse offline. Keep the extracted folder intact: the page loads its illustrations from dist/assets/illustrations/. Catalog, application code and styles are embedded in the offline entry point, so no server or package installation is needed. Search, filters, theme selection, random picking and JSON import/export use the same application logic. LeetCode links and live synchronization require internet access. The bookmarklet always returns to the published website. Offline and hosted progress have separate storage; use Export JSON and Import JSON to transfer it. Some browsers restrict local storage for file URLs; browsing remains available when storage is denied.

The deployable site is dist/, with no runtime dependencies or build step. dist/catalog.json is the complete inventory; dist/illustrations.json maps every problem to a 960x160 transparent PNG. The assets total about 8.54 MB and load lazily. references/ contains the four original user-supplied reference sheets. docs/illustrations/ contains the checklist, review notes, hashes and prompts. The source archive contains optimized final assets and original references, rather than rejected high-resolution generation variants.

Read docs/SPECIFICATION.md for purpose and detailed requirements. AGENTS.md describes the project structure and maintenance boundaries. Research evidence and exclusion decisions live under docs/ and are not served by the practice application. Source records can contain solution reasoning; avoid them before attempting a problem if you want to practice without spoilers.

Run `node scripts/generate-bookmarklet.mjs` to regenerate the fixed-origin bookmarklet. Run `node scripts/build-offline.mjs` after changing runtime source, styles, catalog or image mappings. Validate with `node --test tests/*.test.mjs`, `node scripts/validate-catalog.mjs` and `python scripts/validate-illustrations.py`. Python with Pillow is needed only for image maintenance/validation, not for running the website.

The exporter uses the GraphQL query shape and status values observed in the supplied LeetCode network capture. It reads the signed-in user's status locally on LeetCode and transfers only username, timestamp and solved frontend IDs. The undocumented API can change. Full captures, credentials and session information are excluded from this repository. See docs/VALIDATION.md for checks actually performed and remaining live verification limits.

Clearing the site's browser data resets progress. Export JSON before moving browsers or replacing an account. No manual solved controls are provided. Downloading these sources does not include your browser's saved progress.
