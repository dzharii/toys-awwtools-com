---
file: "src/algorithms/ratcliff.c"
---

Ratcliff-Obershelp repeatedly selects a shared contiguous block. It scores the selected blocks, not the cheapest edits and not the longest subsequence.

Measured observations below describe the recorded dataset and calibrated policy. Timing uses separate synthetic lookup probes; zero observed unsafe matches does not guarantee safety.

<!-- at: 1 -->
## Split unmatched regions around the longest block

`pending` is a stack of input/candidate regions. For each region, rolling rows find the longest equal contiguous block; a mismatch resets the current block length to zero. The code counts that block and queues the remaining left and right regions only when both strings have that side. `abXXcd` and `abYYcd` retain `ab` and `cd`, producing `2*4/12`. Lexical orientation makes tied block choices deterministic when the arguments are reversed.


### Select blocks on the remaining sides

For `abxxcd` and `abyycd`, `ab` and `cd` tie for the longest block. The fixed orientation and scan order select `ab` first. The unmatched right regions are `xxcd` and `yycd`; they contribute `cd` next.

| Selected block | Newly matched letters | Accumulated letters |
|---|---:|---:|
| `ab` | 2 | 2 |
| `cd` | 2 | 4 |

The score is `2*4/(6+6) = 2/3`. A mismatch resets the temporary common-block length because a block cannot skip characters. Each queued `Region` stores start offsets and lengths; the original strings stay where they are. Region-relative starts must be added to the region's whole-string offset before reading a character.

[NIST's Ratcliff/Obershelp entry](https://xlinux.nist.gov/dads/HTML/ratcliffObershelp.html) explains the recursive block selection. This implementation uses an array as a work stack, fixes tie orientation and states its normalized score explicitly.

<!-- measured:ALG11:start -->
### Ratcliff-Obershelp results from this run

Run recorded 2026-11-07 11:27 PST. It recovered 174 of 185 typos. It made 3 unsafe acceptances.

Compared with Levenshtein, this policy recovered the same number of typos, and used about 2.7 times faster lookups. Its recovery and unsafe-acceptance totals matched longest common subsequence (174 and 3).

A median name lookup took about 23 microseconds with 10 properties and 1.6 milliseconds with 1000. These are separate synthetic typo probes on this host, not timings of the examples below.

Recovered typo: `default request timeout miliseconds` resolved to `DefaultRequestTimeoutMilliseconds`.

Unsafe acceptance: `default request timeout nanoseconds` was labeled unknown, but the resolver accepted `DefaultRequestTimeoutSeconds` with score 0.933. Similar spelling did not establish the intended setting.

[Compare methods](docs/measured-results.md). [Inspect the recorded outcomes](reports/results.csv).
<!-- measured:ALG11:end -->
