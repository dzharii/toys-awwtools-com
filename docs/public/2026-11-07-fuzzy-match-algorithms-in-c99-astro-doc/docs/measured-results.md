# Measured algorithm tradeoffs

Run recorded 2026-11-07 11:27 PST. The figures below come from the completed evaluation, with each method using its own calibrated acceptance policy.

Recovery means accepting a misspelled name as its intended property. Unsafe acceptance means assigning a wrong target, accepting an unknown name, or choosing a target for an ambiguous name. Formatting-only matches are excluded from typo recovery.

| Method | Typos recovered | Unsafe acceptances | Lookup with 10 properties | Lookup with 1000 properties |
|---|---:|---:|---:|---:|
| Levenshtein | 174/185 | 0 | 62 microseconds | 11 milliseconds |
| Restricted adjacent swaps | 174/185 | 0 | 71 microseconds | 11 milliseconds |
| Full Damerau-Levenshtein | 174/185 | 0 | 71 microseconds | 12 milliseconds |
| Weighted Levenshtein | 174/185 | 0 | 330 microseconds | 41 milliseconds |
| Jaro | 159/185 | 13 | 20 microseconds | 810 microseconds |
| Jaro-Winkler | 126/185 | 1 | 19 microseconds | 850 microseconds |
| Longest common subsequence | 174/185 | 3 | 13 microseconds | 1.9 milliseconds |
| Trigram Jaccard | 163/185 | 22 | 15 microseconds | 2.2 milliseconds |
| Bigram Dice | 166/185 | 24 | 15 microseconds | 2.2 milliseconds |
| Trigram cosine | 164/185 | 26 | 15 microseconds | 2.1 milliseconds |
| Ratcliff-Obershelp | 174/185 | 3 | 23 microseconds | 1.6 milliseconds |
| Ordered token hybrid | 165/185 | 17 | 170 microseconds | 25 milliseconds |

## What changes the choice of algorithm

The edit-distance policies accepted the same intended typos in this run. More elaborate edit rules therefore added no measured recovery benefit here. The `ca -> ac -> abc` worked example still distinguishes what the two swap distances can represent; it is not evidence of better configuration resolution.

A fast score can accept the wrong meaning. Longest common subsequence and Ratcliff-Obershelp accepted `default request timeout nanoseconds` as `DefaultRequestTimeoutSeconds`, even though nanoseconds is not a registered unit. The gram methods accepted reordered names that the dataset deliberately labels unknown. Their spelling overlap did not establish a safe property assignment.

## Timing and policy limits

Lookup times are medians from the separate end-to-end benchmark and include preparation, exact lookup, scoring when needed and the acceptance decision. The larger registries are synthetic. These measurements compare implementations on this host, not safety in a real schema with a thousand properties. A microsecond is one millionth of a second; the table switches to milliseconds for larger values.

Thresholds were selected on separate calibration data and then frozen. Results compare each method together with its calibrated policy. Zero observed unsafe acceptances does not guarantee that a new typo or schema is safe.

## Recorded examples beside each implementation

| Method | Implementation article |
|---|---|
| Levenshtein | [Real inputs and decisions](/code/src-algorithms-edit-c/#levenshtein-results-from-this-run) |
| Restricted adjacent swaps | [Real inputs and decisions](/code/src-algorithms-edit-c/#restricted-adjacent-swaps-results-from-this-run) |
| Full Damerau-Levenshtein | [Real inputs and decisions](/code/src-algorithms-edit-c/#full-damerau-levenshtein-results-from-this-run) |
| Weighted Levenshtein | [Real inputs and decisions](/code/src-algorithms-edit-c/#weighted-levenshtein-results-from-this-run) |
| Jaro | [Real inputs and decisions](/code/src-algorithms-jaro-c/#jaro-results-from-this-run) |
| Jaro-Winkler | [Real inputs and decisions](/code/src-algorithms-algorithms-c/#jaro-winkler-results-from-this-run) |
| Longest common subsequence | [Real inputs and decisions](/code/src-algorithms-lcs-c/#longest-common-subsequence-results-from-this-run) |
| Trigram Jaccard | [Real inputs and decisions](/code/src-algorithms-grams-c/#trigram-jaccard-results-from-this-run) |
| Bigram Dice | [Real inputs and decisions](/code/src-algorithms-grams-c/#bigram-dice-results-from-this-run) |
| Trigram cosine | [Real inputs and decisions](/code/src-algorithms-grams-c/#trigram-cosine-results-from-this-run) |
| Ratcliff-Obershelp | [Real inputs and decisions](/code/src-algorithms-ratcliff-c/#ratcliff-obershelp-results-from-this-run) |
| Ordered token hybrid | [Real inputs and decisions](/code/src-algorithms-hybrid-c/#ordered-token-hybrid-results-from-this-run) |
