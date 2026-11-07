---
file: "scripts/verify_regression.py"
---

The regression check compares current execution evidence with the preserved pre-review matching results. Timing is deliberately excluded from byte equality.

<!-- at: 1 -->
## Compare scores, decisions, policies and regenerated manifests

Rows are keyed by method and test ID, so missing identities cannot disappear inside aggregate counts. The check requires identical per-case rows, selected policies and calibration-grid data. It regenerates seed-42 manifests in an isolated temporary directory and compares them byte for byte. It also recomputes severe-error counts and costs from individual results and requires successful correctness/sanitizer logs.

