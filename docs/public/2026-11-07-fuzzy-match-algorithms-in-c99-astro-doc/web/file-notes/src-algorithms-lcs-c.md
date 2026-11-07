---
file: "src/algorithms/lcs.c"
---

A common subsequence preserves character order while allowing gaps. A common substring must be contiguous. This scorer measures the former.

Measured observations below describe the recorded dataset and calibrated policy. Timing uses separate synthetic lookup probes; zero observed unsafe matches does not guarantee safety.

<!-- at: 1 -->
## Keep a diagonal match or skip one character

Equal letters extend the diagonal prefix result by one. Otherwise the cell keeps the larger result from skipping either letter. Two unsigned-short rows suffice because older rows cannot affect the next cell. For `abc` and `ac`, the retained sequence is `ac`, so the score is `2*2/(3+2) = 0.8`. Gaps can conceal missing meaningful words; a high score still needs the shared acceptance policy.


### Keep ordered letters across gaps

For `abc` and `ac`, retain `a`, skip `b`, retain `c`. The common length is 2, so the score is `2*2/(3+2) = 0.8`. A mismatching cell keeps the better result from skipping either letter. It does not reset to zero: that would require a contiguous substring instead.

`lcs_score` is named for **longest common subsequence**. "Subsequence" means letters in order with gaps allowed; "substring" means adjacent letters. [NIST's definition](https://xlinux.nist.gov/dads/HTML/longestCommonSubsequence.html) explains this distinction.

<!-- measured:ALG07:start -->
### Longest common subsequence results from this run

Run recorded 2026-11-07 11:27 PST. It recovered 174 of 185 typos. It made 3 unsafe acceptances.

Compared with Levenshtein, this policy recovered the same number of typos, and used about 4.7 times faster lookups.

A median name lookup took about 13 microseconds with 10 properties and 1.9 milliseconds with 1000. These are separate synthetic typo probes on this host, not timings of the examples below.

Recovered typo: `default request timeout miliseconds` resolved to `DefaultRequestTimeoutMilliseconds`.

Unsafe acceptance: `default request timeout nanoseconds` was labeled unknown, but the resolver accepted `DefaultRequestTimeoutSeconds` with score 0.933. Similar spelling did not establish the intended setting.

[Compare methods](docs/measured-results.md). [Inspect the recorded outcomes](reports/results.csv).
<!-- measured:ALG07:end -->
