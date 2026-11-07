---
file: "scripts/check_layout.mjs"
---

This optional Playwright check exercises the published documentation in desktop, portrait and landscape viewports. It does not deploy the site or change matching evidence.

<!-- at: 1 -->
## Measure layout and operate the actual controls

The test checks page overflow, available source width, permanent line wrapping, file articles and loaded diagrams on representative pages. It changes text size, reloads to check persistence, resizes navigation with pointer and keyboard, and opens mobile navigation. A final dark-theme session checks Pagefind search. Assertions fail the process; a successful run writes `reports/layout-check.json`. Screenshots stay in a generated QA directory. Run `npm run test:layout -- URL` after installing Playwright's Chromium; an execution host can supply its own browser path and arguments.
