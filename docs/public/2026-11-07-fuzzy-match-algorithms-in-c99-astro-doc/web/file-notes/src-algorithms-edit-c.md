---
file: "src/algorithms/edit.c"
---

This file computes four edit costs. The resolver has already removed supported separators and folded ASCII case. Each matrix cell describes a pair of prefixes: the letters read so far from each string. Its value is the cheapest cost of changing one prefix into the other.

**Name used below:** Optimal String Alignment is the restricted adjacent-letter-swap method. It allows a swap but cannot edit that swapped substring again under its recurrence. Full Damerau-Levenshtein allows further edits. You may see the abbreviations `osa` and `dl` in internal adapter names.

Measured observations below describe the recorded dataset and calibrated policy. Timing uses separate synthetic lookup probes; zero observed unsafe matches does not guarantee safety.

<!-- at: 1 -->
## Standard-library functions and input bounds

Standard C99 `fmin` selects the smallest of the finite nonnegative edit costs. The caller supplies validated strings no longer than `KEY_MAX`.

<!-- at: /** [PM-Dl8xA4] -->
## Full Damerau-Levenshtein can reuse older matches

The full matrix has an extra border with an unreachable cost. `last_row` records where each character last occurred in the input; `last_matching_column` records its latest match in this row. A transposition can jump to that older pair, account for intervening gaps, and swap. This permits `ca -> ac -> abc` at cost 2. The matrix and indices are local arrays.

Logical prefix cost `(i,j)` is stored at `distance[i+1][j+1]`. This offset leaves a guard border for missing earlier matches. `last_row[letter] == 0` means that letter has not occurred yet; it must not create a free transposition.

| Method | Cheapest permitted treatment of `ca -> abc` | Distance |
|---|---|---:|
| Full Damerau-Levenshtein | Swap `ca -> ac`, then insert `b` | 2 |
| Restricted adjacent swaps | Cannot reuse that swapped region for insertion; needs another route | 3 |

Read [RapidFuzz's full-distance example](https://rapidfuzz.github.io/RapidFuzz/Usage/distance/DamerauLevenshtein.html) for the distinguishing case, or the [Lowrance-Wagner paper](https://doi.org/10.1145/321879.321880) for the last-occurrence recurrence. These links explain the distance, not the benchmark's acceptance thresholds.

<!-- measured:ALG03:start -->
### Full Damerau-Levenshtein results from this run

Run recorded 2026-11-07 11:27 PST. It recovered 174 of 185 typos. No unsafe acceptance was observed.

It accepted the same inputs as Levenshtein, with about 1.2 times the lookup time. The extra scoring rules added no recovery benefit here.

A median name lookup took about 71 microseconds with 10 properties and 12 milliseconds with 1000. These are separate synthetic typo probes on this host, not timings of the examples below.

Recovered typo: `authentiactionserverendpoint` resolved to `AuthenticationServerEndpoint`.

Rejected typo: `maximumconcurrentrequestscmunt` was intended for `MaximumConcurrentRequestsCount`. That target ranked first at 0.967, but the runner-up scored 0.933. The 0.033 lead was below the required 0.04, so the resolver declined to guess.

[Compare methods](docs/measured-results.md). [Inspect the recorded outcomes](reports/results.csv).
<!-- measured:ALG03:end -->

<!-- at: /** [PM-Lv2pR6] -->
## Levenshtein reuses prefix costs; the restricted swap method keeps one extra row

For the current cell, the previous row offers deletion, the current row offers insertion, and the diagonal offers keeping or replacing a letter. Only the restricted adjacent-swap method considers the row two positions earlier. Array indices modulo 3 rotate the storage; they do not change the mathematical row number.

### Calculate the cell for `ca -> cu`

The input row counts characters in `ca`; the candidate column counts characters in `cu`. Each option finishes those same two prefixes. The neighboring cell has already paid for the smaller problem.

| Finish by | Saved smaller problem | Add now | Total |
|---|---|---:|---:|
| Delete `a` | `c -> cu` costs 1 | 1 | 2 |
| Insert `u` | `ca -> c` costs 1 | 1 | 2 |
| Replace `a` with `u` | `c -> c` costs 0 | 1 | **1** |

Store 1. The next `t` matches in `cat -> cut`, so the final distance remains 1. The adapter later converts it to similarity `1 - 1/3`, about 0.667.

`input_index` and `candidate_index` count prefix lengths. Subtract one to read a C character position. `current` and `previous` point into existing row buffers; assigning these pointers does not copy rows. Column zero stores the empty-prefix cost. `% 3` chooses a reusable buffer, not a different mathematical row.

[Lloyd Allison's explanation](https://www.allisons.org/ll/AlgDS/Dynamic/Edit/) connects the three edit choices to neighboring cells and explains row recycling. [Jeff Erickson's chapter, section 3.7](https://jeffe.cs.illinois.edu/teaching/algorithms/book/03-dynprog.pdf), develops prefix alignments. For the extra swap rule, see the [restricted-distance reference](https://rapidfuzz.github.io/RapidFuzz/Usage/distance/OSA.html).

<figure class="source-diagram"><img src="/diagrams/edit-cell.svg" alt="Three prefix costs feed the current edit-distance cell: deletion from above, insertion from the left, substitution from the diagonal." /><figcaption>For cat and cut, replacing a with u changes the final cost from 0 to 1.</figcaption></figure>

<!-- measured:ALG01:start -->
### Levenshtein results from this run

Run recorded 2026-11-07 11:27 PST. It recovered 174 of 185 typos. No unsafe acceptance was observed.

The restricted-swap, full Damerau-Levenshtein and weighted methods made the same acceptance decisions in this run.

A median name lookup took about 62 microseconds with 10 properties and 11 milliseconds with 1000. These are separate synthetic typo probes on this host, not timings of the examples below.

Recovered typo: `default request timeout miliseconds` resolved to `DefaultRequestTimeoutMilliseconds`.

Rejected typo: `maximumconcurrentrequestscmunt` was intended for `MaximumConcurrentRequestsCount`. That target ranked first at 0.967, but the runner-up scored 0.933. The 0.033 lead was below the required 0.04, so the resolver declined to guess.

[Compare methods](docs/measured-results.md). [Inspect the recorded outcomes](reports/results.csv).
<!-- measured:ALG01:end -->

<!-- measured:ALG02:start -->
### Restricted adjacent swaps results from this run

Run recorded 2026-11-07 11:27 PST. It recovered 174 of 185 typos. No unsafe acceptance was observed.

It accepted the same inputs as Levenshtein, with about 1.2 times the lookup time. The extra scoring rules added no recovery benefit here.

A median name lookup took about 71 microseconds with 10 properties and 11 milliseconds with 1000. These are separate synthetic typo probes on this host, not timings of the examples below.

Recovered typo: `authentiactionserverendpoint` resolved to `AuthenticationServerEndpoint`.

Rejected typo: `maximumconcurrentrequestscmunt` was intended for `MaximumConcurrentRequestsCount`. That target ranked first at 0.967, but the runner-up scored 0.933. The 0.033 lead was below the required 0.04, so the resolver declined to guess.

[Compare methods](docs/measured-results.md). [Inspect the recorded outcomes](reports/results.csv).
<!-- measured:ALG02:end -->

<!-- at: /** mode 0=Levenshtein -->
## Dispatch the three unit-cost distances

Mode 2 uses the full matrix. Modes 0 and 1 share rolling rows; only mode 1 enables adjacent swaps. The distinguishing test is `ca` versus `abc`: full Damerau-Levenshtein returns 2 and the restricted method returns 3. The restricted method cannot repeatedly edit the same substring under its recurrence.

<!-- at: /** [PM-We5tJ1] -->
## Assign global typing costs before filling weighted rows

Equal bytes cost zero. A substitution involving a digit costs 2. Horizontal neighbors in the three listed QWERTY rows cost 0.5; other letters cost 1. Insertions and deletions also cost 2 for digits. Two rolling rows retain fractional costs. These are global rules, not exceptions for particular properties.


### Calculate weighted cost before normalization

| Names | Replace | Delete then insert | Chosen cost | Similarity |
|---|---:|---:|---:|---:|
| `a`, `s` | 0.5 | 2 | 0.5 | `1 - 0.5/1 = 0.5` |
| `v1`, `v2` | 2 | 4 | 2 | `1 - 2/3`, about 0.333 |

The denominator is the larger weighted length, not byte length. `v1` has weight `1 + 2 = 3`. The recurrence is a weighted version of the edit calculation above; these keyboard and digit prices are project choices.

<!-- measured:ALG04:start -->
### Weighted Levenshtein results from this run

Run recorded 2026-11-07 11:27 PST. It recovered 174 of 185 typos. No unsafe acceptance was observed.

It accepted the same inputs as Levenshtein, with about 5.4 times the lookup time. The extra scoring rules added no recovery benefit here.

A median name lookup took about 330 microseconds with 10 properties and 41 milliseconds with 1000. These are separate synthetic typo probes on this host, not timings of the examples below.

Recovered typo: `apiendpoinqv2` resolved to `ApiEndpointV2`.

Rejected typo: `maximumconcurrentrequestscmunt` was intended for `MaximumConcurrentRequestsCount`. That target ranked first at 0.967, but the runner-up scored 0.933. The 0.033 lead was below the required 0.04, so the resolver declined to guess.

[Compare methods](docs/measured-results.md). [Inspect the recorded outcomes](reports/results.csv).
<!-- measured:ALG04:end -->
