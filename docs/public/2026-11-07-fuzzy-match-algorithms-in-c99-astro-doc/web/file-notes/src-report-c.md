---
file: "src/report.c"
---

The report writer reads recorded outcomes and timings. It computes rankings from those records; no algorithm name is preselected as the winner.

<!-- at: 1 -->
## Format counts and escape diagnostic strings

Helpers calculate rates, classify outcomes and identify wrong targets. CSV strings double embedded quotes so names cannot change the number of columns. FNV-1a fingerprints identify manifests; they are reproducibility checks, not cryptographic authenticity checks. The ranking compares dangerous errors, then recovered typos, then measured latency.

<!-- at: static int write_csv( -->
## Write every case and its selected policy to CSV

One row includes the input, intended outcome, chosen status, top two suggestions and scores. Missing intended scores use -1. Summary and runtime CSVs are written from the same evaluation structures. Every stream is checked for write and close failures.

<!-- at: /** State the measured winners -->
## Render the twelve report sections from measured data

Section writers explain counts, timing, collisions, failures, threshold sensitivity and limits. Category rows use the same counters as aggregate results. Safety conclusions remain limited to these labels and policies. `qsort` workspace is identified as library-dependent instead of being hidden in a claimed stack-only bound.

<!-- at: /** Build CSV evidence first -->
## Select rankings and assemble the report after measurement

The final function selects safety, weighted-cost and performance recommendations, then invokes section writers. POSIX `gmtime_r` writes UTC into a caller-owned `struct tm`; banned `gmtime` is absent. A C99-only platform without a permitted reentrant converter reports the timestamp unavailable. No report work is inside the matching timer.


## Reference for the contracts used in this file

The benchmark methodology defines each denominator and ranking rule. The report renders stored outcomes; it does not choose new thresholds from held-out errors. [Open reference](/reference/benchmark-methods/).
