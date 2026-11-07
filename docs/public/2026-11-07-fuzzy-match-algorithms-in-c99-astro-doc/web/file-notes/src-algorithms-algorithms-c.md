---
file: "src/algorithms/algorithms.c"
---

This file gives the resolver one interface for twelve different scores. It converts distances into similarities and registers each scorer with its name, formula and workspace estimate. It does not choose an acceptance threshold.

Measured observations below describe the recorded dataset and calibrated policy. Timing uses separate synthetic lookup probes; zero observed unsafe matches does not guarantee safety.

<!-- at: 1 -->
## Convert edit costs into similarity

`lev` selects ordinary Levenshtein; `osa` selects Optimal String Alignment, the restricted adjacent-letter-swap method; `dl` selects full Damerau-Levenshtein. These adapters call the same dispatcher with different modes. A distance of 1 between names of length 10 becomes `1 - 1/10 = 0.9`. Their denominator is the longer normalized name. Inputs are already nonempty, so this division cannot use zero.

<!-- at: static double weighted -->
## Normalize weighted costs with weighted lengths

Digit edits cost more than letter edits. The denominator must use the same weights. For `v1` and `v2`, each weighted length is 3 and the substitution costs 2, giving a similarity of one third. Using ordinary length here would compare incompatible units.

<!-- at: static double jaro( -->
## Adapt direct similarities and apply the Winkler bonus

Jaro, longest-common-subsequence, gram and block routines already return similarities. Their adapters pass the prepared character strings through. Winkler is the exception: it adds up to four prefix contributions only when Jaro exceeds 0.7. For Jaro 0.9 and three shared leading letters, the result is 0.93.

| Step | Calculation |
|---|---|
| Remaining gap to a perfect score | `1 - 0.9 = 0.1` |
| Prefix bonus | `3 * 0.1 * 0.1 = 0.03` |
| Adjusted score | `0.9 + 0.03 = 0.93` |

The bonus changes the score, not the decision policy. Similar prefixes can conceal different units or behavior, so the resolver still checks the runner-up margin. [NIST describes the prefix preference](https://xlinux.nist.gov/dads/HTML/jaroWinkler.html); the cutoff and four-character limit are explicitly defined by this implementation.

<!-- measured:ALG06:start -->
### Jaro-Winkler results from this run

Run recorded 2026-11-07 11:27 PST. It recovered 126 of 185 typos. It made 1 unsafe acceptances.

Compared with Levenshtein, this policy recovered 48 fewer typos, and used about 3.3 times faster lookups.

A median name lookup took about 19 microseconds with 10 properties and 850 microseconds with 1000. These are separate synthetic typo probes on this host, not timings of the examples below.

Unsafe acceptance: `application environment` was labeled unknown, but the resolver accepted `ApplicationEnvironmentName` with score 0.969. Similar spelling did not establish the intended setting.

Rejected typo: `default request timeout miliseconds` was intended for `DefaultRequestTimeoutMilliseconds`. That target ranked first at 0.994, but the runner-up scored 0.975. The 0.019 lead was below the required 0.02, so the resolver declined to guess.

[Compare methods](docs/measured-results.md). [Inspect the recorded outcomes](reports/results.csv).
<!-- measured:ALG06:end -->

<!-- at: const Algorithm algorithms -->
## Register scorers without embedding schema rules

Array position is the method ID used throughout calibration, evaluation and reporting. Entry zero has a null scorer because exact matching happens in the shared resolver. The metadata describes actual implementations, including the library-dependent sorting cost of `qsort`. Adding a method also requires updating the method count and correctness tests.
