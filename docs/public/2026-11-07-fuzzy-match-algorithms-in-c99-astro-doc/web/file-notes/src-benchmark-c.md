---
file: "src/benchmark.c"
---

The benchmark measures two paths on the same probes: complete resolution from raw text and candidate scoring from prepared text. Printing and report generation occur elsewhere.

<!-- at: 1 -->
## Read the timer and summarize sorted samples

POSIX builds use elapsed monotonic time. The isolated C99 fallback uses CPU time from `clock`. Standard `qsort` orders samples and trial means. P95 uses the nearest-rank index `ceil(0.95*N)-1`. Samples describe individual query latency; trial means describe variation across repetitions.

<!-- at: /** The two paths -->
## Prepare, warm and consume every timed result

Registry construction is measured separately. Twelve deterministic probes run at each of four registry sizes. Preparation is measured on its own and is also inside the end-to-end path. A warm-up exercises both paths before samples are recorded. The volatile checksum consumes results so the compiler cannot discard them. Heap allocations for timing arrays happen before the measured intervals and are freed afterward.


## Reference for the contracts used in this file

The POSIX reference defines the monotonic clock. This host measures elapsed time; the isolated C99 fallback instead uses CPU time. [Open reference](https://pubs.opengroup.org/onlinepubs/9799919799/functions/clock_gettime.html).
