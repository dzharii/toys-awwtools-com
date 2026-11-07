---
file: "scripts/annotate_results.py"
---

This reusable step connects a completed benchmark to the source explanations. It reads the recorded outcomes and timings, then writes the marked observation sections in algorithm comments and articles. It does not run or tune a matching algorithm.

<!-- at: 1 -->
## Generate observations from one completed run

The script checks that per-case outcomes agree with the summary and that each example uses the recorded policy. It converts the report timestamp to Pacific time and rounds lookup times for reading. Stable case IDs select the examples; the strings, scores and decisions come from the result file. Input hashes stay in the evidence file for traceability.

Only marked observation blocks are replaced. Existing worked calculations remain intact. If the frozen example outcomes change, the script stops so the comparative prose can be reviewed. Run `make feedback` after a benchmark; the documentation build also refreshes these observations.
