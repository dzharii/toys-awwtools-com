---
file: "src/algorithms/jaro.c"
---

Jaro matches equal characters within a position window and then checks the order of those matches. It does not find a minimum-cost edit sequence.

Measured observations below describe the recorded dataset and calibrated policy. Timing uses separate synthetic lookup probes; zero observed unsafe matches does not guarantee safety.

<!-- at: 1 -->
## Mark nearby matches, then compare their order

Each input character takes the first unused equal candidate character in its window. Flags prevent one candidate position from being counted twice. A second pass visits only flagged positions, so unmatched characters do not shift the order comparison. For `martha` and `marhta`, all six characters match and two are out of order. The formula uses half that mismatch count, giving about 0.9444. The arrays hold flags; the strings remain unchanged.


### Calculate the three Jaro agreements

For `martha` and `marhta`, all six characters find partners. The matched sequences disagree at `t/h` and `h/t`: two out-of-order characters contribute one half-mismatch count.

| Component | Calculation | Value |
|---|---|---:|
| Input coverage | `6/6` | 1 |
| Candidate coverage | `6/6` | 1 |
| Order agreement | `(6 - 2/2)/6` | 5/6 |
| Mean | `(1 + 1 + 5/6)/3` | 17/18, about 0.944 |

The match flags contain one byte per character. Zero means unused. The order pass skips unused positions before comparing matched characters; comparing raw positions would confuse unmatched letters with reordered ones.

[NIST's Jaro-Winkler entry](https://xlinux.nist.gov/dads/HTML/jaroWinkler.html) gives the matched-character and prefix context. The source here defines the exact window and greedy matching rule used by this benchmark.

<!-- measured:ALG05:start -->
### Jaro results from this run

Run recorded 2026-11-07 11:27 PST. It recovered 159 of 185 typos. It made 13 unsafe acceptances.

Compared with Levenshtein, this policy recovered 15 fewer typos, and used about 3.1 times faster lookups.

A median name lookup took about 20 microseconds with 10 properties and 810 microseconds with 1000. These are separate synthetic typo probes on this host, not timings of the examples below.

Rejected typo: `default request timeout miliseconds` was intended for `DefaultRequestTimeoutMilliseconds`. That target ranked first at 0.990, but the runner-up scored 0.958. The 0.032 lead was below the required 0.08, so the resolver declined to guess.

Unsafe acceptance: `application environment` was labeled unknown, but the resolver accepted `ApplicationEnvironmentName` with score 0.949. Similar spelling did not establish the intended setting.

[Compare methods](docs/measured-results.md). [Inspect the recorded outcomes](reports/results.csv).
<!-- measured:ALG05:end -->
