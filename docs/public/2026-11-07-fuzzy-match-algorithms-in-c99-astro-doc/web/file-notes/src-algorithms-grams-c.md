---
file: "src/algorithms/grams.c"
---

The three methods in this file compare short character windows. They share window extraction and sorting, then differ in whether repeated windows count and which overlap formula they use.

Measured observations below describe the recorded dataset and calibrated policy. Timing uses separate synthetic lookup probes; zero observed unsafe matches does not guarantee safety.

<!-- at: 1 -->
## Pack windows into integers and sort with qsort

`abcd` produces trigrams `abc` and `bcd`. Shifting the packed integer by eight bits leaves room for the next ASCII byte. Standard-library `qsort` puts equal windows together. The comparator returns -1, 0 or 1 through comparisons rather than subtracting unsigned integers. No boundary padding is added.

<!-- at: /** [PM-Cs5uE8] -->
## Cosine compares frequencies, including repetitions

Each merge step consumes a complete run of one gram from both sorted arrays. Counts contribute their product to the dot product and their squares to the norms. For `aaaba` and `aaaa`, the trigrams and counts are:

| Trigram | `aaaba` frequency | `aaaa` frequency | Product |
|---|---:|---:|---:|
| `aaa` | 1 | 2 | 2 |
| `aab` | 1 | 0 | 0 |
| `aba` | 1 | 0 | 0 |

The product sum is 2. The squared-count sums are `1+1+1=3` and `4+0+0=4`. Divide: `2/sqrt(3*4)`, about 0.577. The arrays hold packed windows rather than a dense alphabet-sized vector; the merge treats absent windows as zero. Matching distributions can score 1 even when their total counts differ.

<!-- measured:ALG10:start -->
### Trigram cosine results from this run

Run recorded 2026-11-07 11:27 PST. It recovered 164 of 185 typos. It made 26 unsafe acceptances.

Compared with Levenshtein, this policy recovered 10 fewer typos, and used about 4.1 times faster lookups. Counting repeated trigrams produced 26 unsafe acceptances; trigram Jaccard produced 22.

A median name lookup took about 15 microseconds with 10 properties and 2.1 milliseconds with 1000. These are separate synthetic typo probes on this host, not timings of the examples below.

Recovered typo: `default request timeout miliseconds` resolved to `DefaultRequestTimeoutMilliseconds`.

Unsafe acceptance: `request maximum concurrent count` was labeled unknown, but the resolver accepted `MaximumConcurrentRequestCount` with score 0.889. Similar spelling did not establish the intended setting.

[Compare methods](docs/measured-results.md). [Inspect the recorded outcomes](reports/results.csv).
<!-- measured:ALG10:end -->

<!-- at: /** [PM-Jc8aK4] -->
## Jaccard and Dice count each distinct window once

The merge records presence rather than frequency. Trigram sets `{abc,bcd}` and `{abc,bce}` have intersection 1 and union 3, so Jaccard is one third. Bigram sets `{ab,bc}` and `{ab,bd}` give Dice `2/(2+2) = 0.5`. Neither method preserves word order outside each window.

| Comparison | Unique windows on each side | Shared | Denominator | Score |
|---|---|---:|---:|---:|
| Trigram Jaccard, `abcd` / `abce` | `{abc,bcd}` / `{abc,bce}` | 1 | Union: 3 | 1/3 |
| Bigram Dice, `abc` / `abd` | `{ab,bc}` / `{ab,bd}` | 1 | Set sizes: 2+2 | `2*1/4 = 0.5` |

[Stanford's shingling section](https://nlp.stanford.edu/IR-book/html/htmledition/near-duplicates-and-shingling-1.html) explains window sets and Jaccard. It uses word windows; ours are character windows. [Its dot-product section](https://nlp.stanford.edu/IR-book/html/htmledition/dot-products-1.html) explains cosine's normalization. The Dice formula and unpadded-window policy above specify this project's variant.

<!-- measured:ALG08:start -->
### Trigram Jaccard results from this run

Run recorded 2026-11-07 11:27 PST. It recovered 163 of 185 typos. It made 22 unsafe acceptances.

Compared with Levenshtein, this policy recovered 11 fewer typos, and used about 4.2 times faster lookups.

A median name lookup took about 15 microseconds with 10 properties and 2.2 milliseconds with 1000. These are separate synthetic typo probes on this host, not timings of the examples below.

Recovered typo: `default request timeout miliseconds` resolved to `DefaultRequestTimeoutMilliseconds`.

Unsafe acceptance: `request maximum concurrent count` was labeled unknown, but the resolver accepted `MaximumConcurrentRequestCount` with score 0.800. Similar spelling did not establish the intended setting.

[Compare methods](docs/measured-results.md). [Inspect the recorded outcomes](reports/results.csv).
<!-- measured:ALG08:end -->

<!-- measured:ALG09:start -->
### Bigram Dice results from this run

Run recorded 2026-11-07 11:27 PST. It recovered 166 of 185 typos. It made 24 unsafe acceptances.

Compared with Levenshtein, this policy recovered 8 fewer typos, and used about 4.1 times faster lookups.

A median name lookup took about 15 microseconds with 10 properties and 2.2 milliseconds with 1000. These are separate synthetic typo probes on this host, not timings of the examples below.

Recovered typo: `default request timeout miliseconds` resolved to `DefaultRequestTimeoutMilliseconds`.

Unsafe acceptance: `request maximum concurrent count` was labeled unknown, but the resolver accepted `MaximumConcurrentRequestCount` with score 0.960. Similar spelling did not establish the intended setting.

[Compare methods](docs/measured-results.md). [Inspect the recorded outcomes](reports/results.csv).
<!-- measured:ALG09:end -->

<!-- at: /** mode 0=trigram -->
## Handle names too short to contain a window

Identical names return 1. Otherwise an empty gram list returns 0 before cosine could divide by a zero norm. The explicit arrays have `KEY_MAX` entries. Extra workspace and allocations inside `qsort` depend on the C library; they are not included in the reported array sizes.
