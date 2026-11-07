# C99 fuzzy configuration property matching benchmark

## 1. Matching results and selected policies

The safety-first choice from this run is **Levenshtein**. It recovered 174 of 185 misspelled names and made 0 unsafe automatic assignments. Formatting variants use the shared exact-normalized stage before any fuzzy calculation.

The implementation articles connect these measurements to real input strings. See [measured algorithm tradeoffs](docs/measured-results.md) for a concise comparison.

Selection is specific to these labels and frozen policies. Rejecting inputs is preferable to silently assigning values to the wrong operational setting. Zero observed dangerous errors is finite-sample evidence, not a correctness guarantee.

## 2. Compiler, platform and benchmark settings

| Field | Recorded value |
|---|---|
| Execution (UTC) | 2026-11-07T19:27:23Z |
| Dataset split | 184 calibration; 380 held-out cases |
| OS / kernel | Linux 6.18.57 |
| Architecture | x86_64 |
| GCC | 13.3.0 |
| C standard | C99; __STDC_VERSION__=199901 |
| Actual flags | `-std=c99 -O2 -Wall -Wextra -Wpedantic -Wconversion -Wshadow` |
| Timer | POSIX CLOCK_MONOTONIC elapsed nanoseconds; clock() CPU fallback on non-POSIX builds |
| Repetitions | 7; 12 queries per repetition per size and path |
| Seed | 42 (xorshift32; zero seed maps to 0x9e3779b9) |
| Dataset version | 2026-11-v2 |
| Manifest FNV-1a32 | calibration 24f4a288; held-out c6e3fed0 |
| Curated registry sizes | base 10; adversarial 30; short 12; boundary 3; collision 2; calibration 16 |
| Performance sizes | 10, 50, 100, 1000 |

## 3. Similarity algorithms and workspace bounds

All candidate scores increase with similarity and are in [0,1]. Project scoring code uses automatic bounded arrays and no explicit heap objects per query. qsort may use implementation-specific workspace or allocations; those are not included in the array bounds below. Candidate representations are cached; n and m denote character lengths and T/U denote token counts. LCS means longest common subsequence: matching letters in order, with gaps allowed. Optimal String Alignment is the restricted adjacent-letter-swap method; a swapped substring cannot be edited again. Full Damerau-Levenshtein removes that restriction.

| ID | Algorithm / definition | Complexity | Approximate scoring workspace (bytes) |
|---|---|---|---:|
| EXACT | Exact normalized only: ASCII normalization and unique exact match | O(R*L) | 0 |
| ALG01 | Levenshtein: 1 - unit edit distance / max length | O(n*m) time; O(m) space | 3096 |
| ALG02 | Optimal String Alignment: 1 - restricted adjacent-transposition distance / max length | O(n*m) time; O(m) space | 3096 |
| ALG03 | Damerau-Levenshtein: 1 - unrestricted unit edit distance / max length | O(n*m) time; O(n*m+128) space | 34824 |
| ALG04 | Weighted Levenshtein: Same-row QWERTY neighbors cost 0.5; digit insertion/deletion/substitution 2; others 1; normalize by max weighted length | O(n*m) time; O(m) space | 2064 |
| ALG05 | Jaro: Mean matched fractions and transposition agreement; window max(length)/2 - 1, floored at 0 | O(n*m) time; O(n+m) space | 256 |
| ALG06 | Jaro-Winkler: Jaro plus prefix boost p=0.1, at most 4 characters, only when Jaro > 0.7 | O(n*m) time; O(n+m) space | 256 |
| ALG07 | LCS: 2 * longest common subsequence length / sum lengths | O(n*m) time; O(m) space | 516 |
| ALG08 | Trigram Jaccard: Unpadded trigram set intersection / union | Packing/merge O(n+m); qsort cost implementation-defined | 1024 |
| ALG09 | Bigram Dice: 2 * unpadded bigram set intersection / sum set sizes | Packing/merge O(n+m); qsort cost implementation-defined | 1024 |
| ALG10 | Trigram cosine: Dot product / vector norms of unpadded trigram frequencies | Packing/merge O(n+m); qsort cost implementation-defined | 1024 |
| ALG11 | Ratcliff-Obershelp: 2 * recursively selected longest common contiguous blocks / sum lengths; lexical tie orientation | O((n+m)*n*m) conservative time; O(n+m) space | 8740 |
| ALG12 | Token-aware hybrid: 0.65 Levenshtein character similarity + 0.35 ordered token alignment similarity; token substitutions use normalized Levenshtein | O(n*m + T*U*L^2) conservative time; O(L+U) workspace | 3624 |

Weighted edit costs are global typing rules, with no schema-specific aliases. Neighbor substitutions mean horizontally adjacent keys on the three ASCII QWERTY rows; digit operations have cost 2. Jaro uses half the out-of-order matched-character count. Winkler rewards only the first four characters, so long common prefixes can still compress decision margins. N-grams are unpadded; short strings below gram size score zero unless equal. Dice uses sets; cosine uses multiplicities. Ratcliff ties use lexical orientation for symmetric deterministic results.

Tokenization splits ASCII separators, lower-to-uppercase transitions, digit-to-uppercase transitions and acronym-to-word transitions. Hybrid token alignment preserves order with unit insertion/deletion and normalized character-edit substitution cost. Concatenated lowercase inputs lose token structure; this is a documented limitation of that variant. Shared exact normalization runs before every fuzzy method. AddressSanitizer and UndefinedBehaviorSanitizer correctness runs are provided by make sanitize. Leak detection is disabled because this sandbox denies the /proc access required by LeakSanitizer; leak coverage is unavailable. Full mathematical and implementation notes are in `docs/algorithms.md`.

## 4. Normalization, labels and calibration rules

The parser splits at the first equals sign and trims ASCII whitespace. Later equals signs, quotes and semicolons remain literal. Matching uses only names; values do not influence ranking. The binder independently validates nonempty strings, signed 32-bit decimal integers and lowercase true/false booleans, then rejects duplicates and missing required properties. No partial configuration is committed.

Normalization lowercases ASCII letters, removes ASCII whitespace, underscore and hyphen, and preserves digits. All other punctuation, non-ASCII bytes, empty normalized keys, keys over 128 bytes and token counts over 32 are invalid. Any normalization collision invalidates the whole schema. Exact unique matches bypass thresholds. Fuzzy ties never choose an automatic winner. Suggestions use lexical tie ordering, independent of registry position. Below-threshold scores are unknown; sufficient scores with insufficient margin are ambiguous. An optional edit cap is applied after the margin check.

Calibration and held-out data use disjoint schemas, canonical vocabulary and family IDs. Dataset v2 corrects an audited mislabeled negative: a recoverable milliseconds typo was replaced by the explicitly unregistered nanoseconds unit. It also includes the specified request-cnt abbreviation as a target-labeled partial case. This label audit changed no calibration rows, scoring rules, threshold grid or policy selection criteria; all final results were rerun on the corrected manifest. The calibration manifest is the sole source for policy selection. Its labels include recoverable deterministic mutations, unrelated unknowns and application-defined ambiguity. Calibration is intentionally synthetic; transfer to the original vocabulary is itself part of this experiment. Held-out labels are human intent assertions, including conservative rejection of missing-word, reordered and semantic alias inputs. A mutation is rejected by dataset validation if it equals another valid property. Case IDs, labels and family IDs are frozen in inspectable CSVs. Exact/formatting cases may share a normalized target but are distinct raw inputs.

Calibration searches thresholds 0.50 through 1.00 in 0.02 steps, plus 1.000001 (fuzzy off); margins {0, .01, .02, .04, .08, .12, .20}; and edit caps {-1, 1, 2, 3} for the four edit methods (-1 is unlimited). It minimizes weighted cost; ties prefer a higher threshold then larger margin; remaining ties retain the first cap. All policies are frozen before held-out evaluation. No stricter property-specific thresholds or aliases are introduced.

Cost = 100 * (wrong target + unknown accepted + ambiguous accepted) + 1 * unnecessary rejection. Safely rejected unknown and ambiguous inputs cost zero. An ambiguous input rejected as unknown is safe but does not count as a correct ambiguity diagnosis. Unsupported input and schema-collision detection are counted separately.

## 5. Held-out resolution counts and error rates

| Algorithm | Exact correct | Fuzzy correct | Wrong target | Unknown accepted | Ambiguous accepted | Unnecessary rejection | Unknown rejected | Ambiguity detected | Ambiguous as unknown | Invalid detected | Cost |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| EXACT | 79 | 0 | 0 | 0 | 0 | 185 | 74 | 0 | 30 | 12 | 185 |
| ALG01 | 79 | 174 | 0 | 0 | 0 | 11 | 74 | 0 | 30 | 12 | 11 |
| ALG02 | 79 | 174 | 0 | 0 | 0 | 11 | 74 | 0 | 30 | 12 | 11 |
| ALG03 | 79 | 174 | 0 | 0 | 0 | 11 | 74 | 0 | 30 | 12 | 11 |
| ALG04 | 79 | 174 | 0 | 0 | 0 | 11 | 74 | 0 | 30 | 12 | 11 |
| ALG05 | 79 | 159 | 0 | 10 | 3 | 26 | 64 | 21 | 6 | 12 | 1326 |
| ALG06 | 79 | 126 | 0 | 1 | 0 | 59 | 73 | 9 | 21 | 12 | 159 |
| ALG07 | 79 | 174 | 0 | 3 | 0 | 11 | 71 | 15 | 15 | 12 | 311 |
| ALG08 | 79 | 163 | 0 | 22 | 0 | 22 | 52 | 27 | 3 | 12 | 2222 |
| ALG09 | 79 | 166 | 0 | 18 | 6 | 19 | 56 | 18 | 6 | 12 | 2419 |
| ALG10 | 79 | 164 | 0 | 26 | 0 | 21 | 48 | 30 | 0 | 12 | 2621 |
| ALG11 | 79 | 174 | 0 | 3 | 0 | 11 | 71 | 15 | 15 | 12 | 311 |
| ALG12 | 79 | 165 | 0 | 11 | 6 | 20 | 63 | 24 | 0 | 12 | 1720 |

| Algorithm | Fuzzy precision % | Fuzzy recall % | Target coverage % | Acceptance purity % | Dangerous / valid inputs | Wilson 95% interval % |
|---|---:|---:|---:|---:|---|---|
| EXACT | N/A | 0.00 | 29.92 | 100.00 | 0 / 368 | 0.000 to 1.033 |
| ALG01 | 100.00 | 94.05 | 95.83 | 100.00 | 0 / 368 | 0.000 to 1.033 |
| ALG02 | 100.00 | 94.05 | 95.83 | 100.00 | 0 / 368 | 0.000 to 1.033 |
| ALG03 | 100.00 | 94.05 | 95.83 | 100.00 | 0 / 368 | 0.000 to 1.033 |
| ALG04 | 100.00 | 94.05 | 95.83 | 100.00 | 0 / 368 | 0.000 to 1.033 |
| ALG05 | 100.00 | 85.95 | 90.15 | 94.82 | 13 / 368 | 2.076 to 5.949 |
| ALG06 | 100.00 | 68.11 | 77.65 | 99.51 | 1 / 368 | 0.048 to 1.523 |
| ALG07 | 100.00 | 94.05 | 95.83 | 98.83 | 3 / 368 | 0.278 to 2.369 |
| ALG08 | 100.00 | 88.11 | 91.67 | 91.67 | 22 / 368 | 3.981 to 8.885 |
| ALG09 | 100.00 | 89.73 | 92.80 | 91.08 | 24 / 368 | 4.421 to 9.520 |
| ALG10 | 100.00 | 88.65 | 92.05 | 90.33 | 26 / 368 | 4.867 to 10.151 |
| ALG11 | 100.00 | 94.05 | 95.83 | 98.83 | 3 / 368 | 0.278 to 2.369 |
| ALG12 | 100.00 | 89.19 | 92.42 | 93.49 | 17 / 368 | 2.904 to 7.273 |

Fuzzy precision here follows the requested intended-target definition: correct fuzzy / (correct fuzzy + wrong target). It excludes unknown and ambiguous acceptance, which are exposed in both the count table and acceptance purity. Recall excludes normalization-only cases. Coverage is correct exact plus fuzzy over target-labeled inputs. Wilson intervals assume independent Bernoulli observations; clustered generated cases weaken that assumption, so these intervals are descriptive, not population guarantees.

### Resolution counts by test category

| Category | Algorithm | Cases | Correct exact/fuzzy | Dangerous | Unnecessary rejection | Safe other outcomes |
|---|---|---:|---:|---:|---:|---:|
| exact | EXACT | 20 | 20 / 0 | 0 | 0 | 0 |
| exact | ALG01 | 20 | 20 / 0 | 0 | 0 | 0 |
| exact | ALG02 | 20 | 20 / 0 | 0 | 0 | 0 |
| exact | ALG03 | 20 | 20 / 0 | 0 | 0 | 0 |
| exact | ALG04 | 20 | 20 / 0 | 0 | 0 | 0 |
| exact | ALG05 | 20 | 20 / 0 | 0 | 0 | 0 |
| exact | ALG06 | 20 | 20 / 0 | 0 | 0 | 0 |
| exact | ALG07 | 20 | 20 / 0 | 0 | 0 | 0 |
| exact | ALG08 | 20 | 20 / 0 | 0 | 0 | 0 |
| exact | ALG09 | 20 | 20 / 0 | 0 | 0 | 0 |
| exact | ALG10 | 20 | 20 / 0 | 0 | 0 | 0 |
| exact | ALG11 | 20 | 20 / 0 | 0 | 0 | 0 |
| exact | ALG12 | 20 | 20 / 0 | 0 | 0 | 0 |
| formatting | EXACT | 30 | 30 / 0 | 0 | 0 | 0 |
| formatting | ALG01 | 30 | 30 / 0 | 0 | 0 | 0 |
| formatting | ALG02 | 30 | 30 / 0 | 0 | 0 | 0 |
| formatting | ALG03 | 30 | 30 / 0 | 0 | 0 | 0 |
| formatting | ALG04 | 30 | 30 / 0 | 0 | 0 | 0 |
| formatting | ALG05 | 30 | 30 / 0 | 0 | 0 | 0 |
| formatting | ALG06 | 30 | 30 / 0 | 0 | 0 | 0 |
| formatting | ALG07 | 30 | 30 / 0 | 0 | 0 | 0 |
| formatting | ALG08 | 30 | 30 / 0 | 0 | 0 | 0 |
| formatting | ALG09 | 30 | 30 / 0 | 0 | 0 | 0 |
| formatting | ALG10 | 30 | 30 / 0 | 0 | 0 | 0 |
| formatting | ALG11 | 30 | 30 / 0 | 0 | 0 | 0 |
| formatting | ALG12 | 30 | 30 / 0 | 0 | 0 | 0 |
| deletion | EXACT | 25 | 0 / 0 | 0 | 25 | 0 |
| deletion | ALG01 | 25 | 0 / 25 | 0 | 0 | 0 |
| deletion | ALG02 | 25 | 0 / 25 | 0 | 0 | 0 |
| deletion | ALG03 | 25 | 0 / 25 | 0 | 0 | 0 |
| deletion | ALG04 | 25 | 0 / 25 | 0 | 0 | 0 |
| deletion | ALG05 | 25 | 0 / 25 | 0 | 0 | 0 |
| deletion | ALG06 | 25 | 0 / 21 | 0 | 4 | 0 |
| deletion | ALG07 | 25 | 0 / 25 | 0 | 0 | 0 |
| deletion | ALG08 | 25 | 0 / 25 | 0 | 0 | 0 |
| deletion | ALG09 | 25 | 0 / 25 | 0 | 0 | 0 |
| deletion | ALG10 | 25 | 0 / 25 | 0 | 0 | 0 |
| deletion | ALG11 | 25 | 0 / 25 | 0 | 0 | 0 |
| deletion | ALG12 | 25 | 0 / 25 | 0 | 0 | 0 |
| insertion | EXACT | 25 | 0 / 0 | 0 | 25 | 0 |
| insertion | ALG01 | 25 | 0 / 25 | 0 | 0 | 0 |
| insertion | ALG02 | 25 | 0 / 25 | 0 | 0 | 0 |
| insertion | ALG03 | 25 | 0 / 25 | 0 | 0 | 0 |
| insertion | ALG04 | 25 | 0 / 25 | 0 | 0 | 0 |
| insertion | ALG05 | 25 | 0 / 25 | 0 | 0 | 0 |
| insertion | ALG06 | 25 | 0 / 21 | 0 | 4 | 0 |
| insertion | ALG07 | 25 | 0 / 25 | 0 | 0 | 0 |
| insertion | ALG08 | 25 | 0 / 25 | 0 | 0 | 0 |
| insertion | ALG09 | 25 | 0 / 25 | 0 | 0 | 0 |
| insertion | ALG10 | 25 | 0 / 25 | 0 | 0 | 0 |
| insertion | ALG11 | 25 | 0 / 25 | 0 | 0 | 0 |
| insertion | ALG12 | 25 | 0 / 25 | 0 | 0 | 0 |
| substitution | EXACT | 25 | 0 / 0 | 0 | 25 | 0 |
| substitution | ALG01 | 25 | 0 / 25 | 0 | 0 | 0 |
| substitution | ALG02 | 25 | 0 / 25 | 0 | 0 | 0 |
| substitution | ALG03 | 25 | 0 / 25 | 0 | 0 | 0 |
| substitution | ALG04 | 25 | 0 / 25 | 0 | 0 | 0 |
| substitution | ALG05 | 25 | 0 / 25 | 0 | 0 | 0 |
| substitution | ALG06 | 25 | 0 / 17 | 0 | 8 | 0 |
| substitution | ALG07 | 25 | 0 / 25 | 0 | 0 | 0 |
| substitution | ALG08 | 25 | 0 / 25 | 0 | 0 | 0 |
| substitution | ALG09 | 25 | 0 / 25 | 0 | 0 | 0 |
| substitution | ALG10 | 25 | 0 / 25 | 0 | 0 | 0 |
| substitution | ALG11 | 25 | 0 / 25 | 0 | 0 | 0 |
| substitution | ALG12 | 25 | 0 / 25 | 0 | 0 | 0 |
| transposition | EXACT | 25 | 0 / 0 | 0 | 25 | 0 |
| transposition | ALG01 | 25 | 0 / 25 | 0 | 0 | 0 |
| transposition | ALG02 | 25 | 0 / 25 | 0 | 0 | 0 |
| transposition | ALG03 | 25 | 0 / 25 | 0 | 0 | 0 |
| transposition | ALG04 | 25 | 0 / 25 | 0 | 0 | 0 |
| transposition | ALG05 | 25 | 0 / 25 | 0 | 0 | 0 |
| transposition | ALG06 | 25 | 0 / 25 | 0 | 0 | 0 |
| transposition | ALG07 | 25 | 0 / 25 | 0 | 0 | 0 |
| transposition | ALG08 | 25 | 0 / 25 | 0 | 0 | 0 |
| transposition | ALG09 | 25 | 0 / 25 | 0 | 0 | 0 |
| transposition | ALG10 | 25 | 0 / 25 | 0 | 0 | 0 |
| transposition | ALG11 | 25 | 0 / 25 | 0 | 0 | 0 |
| transposition | ALG12 | 25 | 0 / 25 | 0 | 0 | 0 |
| multiple_errors | EXACT | 30 | 0 / 0 | 0 | 30 | 0 |
| multiple_errors | ALG01 | 30 | 0 / 30 | 0 | 0 | 0 |
| multiple_errors | ALG02 | 30 | 0 / 30 | 0 | 0 | 0 |
| multiple_errors | ALG03 | 30 | 0 / 30 | 0 | 0 | 0 |
| multiple_errors | ALG04 | 30 | 0 / 30 | 0 | 0 | 0 |
| multiple_errors | ALG05 | 30 | 0 / 30 | 0 | 0 | 0 |
| multiple_errors | ALG06 | 30 | 0 / 8 | 0 | 22 | 0 |
| multiple_errors | ALG07 | 30 | 0 / 30 | 0 | 0 | 0 |
| multiple_errors | ALG08 | 30 | 0 / 30 | 0 | 0 | 0 |
| multiple_errors | ALG09 | 30 | 0 / 30 | 0 | 0 | 0 |
| multiple_errors | ALG10 | 30 | 0 / 30 | 0 | 0 | 0 |
| multiple_errors | ALG11 | 30 | 0 / 30 | 0 | 0 | 0 |
| multiple_errors | ALG12 | 30 | 0 / 30 | 0 | 0 | 0 |
| punctuation_boundary | EXACT | 25 | 15 / 0 | 0 | 0 | 10 |
| punctuation_boundary | ALG01 | 25 | 15 / 0 | 0 | 0 | 10 |
| punctuation_boundary | ALG02 | 25 | 15 / 0 | 0 | 0 | 10 |
| punctuation_boundary | ALG03 | 25 | 15 / 0 | 0 | 0 | 10 |
| punctuation_boundary | ALG04 | 25 | 15 / 0 | 0 | 0 | 10 |
| punctuation_boundary | ALG05 | 25 | 15 / 0 | 0 | 0 | 10 |
| punctuation_boundary | ALG06 | 25 | 15 / 0 | 0 | 0 | 10 |
| punctuation_boundary | ALG07 | 25 | 15 / 0 | 0 | 0 | 10 |
| punctuation_boundary | ALG08 | 25 | 15 / 0 | 0 | 0 | 10 |
| punctuation_boundary | ALG09 | 25 | 15 / 0 | 0 | 0 | 10 |
| punctuation_boundary | ALG10 | 25 | 15 / 0 | 0 | 0 | 10 |
| punctuation_boundary | ALG11 | 25 | 15 / 0 | 0 | 0 | 10 |
| punctuation_boundary | ALG12 | 25 | 15 / 0 | 0 | 0 | 10 |
| partial | EXACT | 20 | 0 / 0 | 0 | 1 | 19 |
| partial | ALG01 | 20 | 0 / 1 | 0 | 0 | 19 |
| partial | ALG02 | 20 | 0 / 1 | 0 | 0 | 19 |
| partial | ALG03 | 20 | 0 / 1 | 0 | 0 | 19 |
| partial | ALG04 | 20 | 0 / 1 | 0 | 0 | 19 |
| partial | ALG05 | 20 | 0 / 1 | 5 | 0 | 14 |
| partial | ALG06 | 20 | 0 / 1 | 1 | 0 | 18 |
| partial | ALG07 | 20 | 0 / 1 | 1 | 0 | 18 |
| partial | ALG08 | 20 | 0 / 1 | 11 | 0 | 8 |
| partial | ALG09 | 20 | 0 / 1 | 6 | 0 | 13 |
| partial | ALG10 | 20 | 0 / 1 | 15 | 0 | 4 |
| partial | ALG11 | 20 | 0 / 1 | 1 | 0 | 18 |
| partial | ALG12 | 20 | 0 / 1 | 8 | 0 | 11 |
| reordered_semantic | EXACT | 20 | 0 / 0 | 0 | 0 | 20 |
| reordered_semantic | ALG01 | 20 | 0 / 0 | 0 | 0 | 20 |
| reordered_semantic | ALG02 | 20 | 0 / 0 | 0 | 0 | 20 |
| reordered_semantic | ALG03 | 20 | 0 / 0 | 0 | 0 | 20 |
| reordered_semantic | ALG04 | 20 | 0 / 0 | 0 | 0 | 20 |
| reordered_semantic | ALG05 | 20 | 0 / 0 | 3 | 0 | 17 |
| reordered_semantic | ALG06 | 20 | 0 / 0 | 0 | 0 | 20 |
| reordered_semantic | ALG07 | 20 | 0 / 0 | 1 | 0 | 19 |
| reordered_semantic | ALG08 | 20 | 0 / 0 | 10 | 0 | 10 |
| reordered_semantic | ALG09 | 20 | 0 / 0 | 10 | 0 | 10 |
| reordered_semantic | ALG10 | 20 | 0 / 0 | 10 | 0 | 10 |
| reordered_semantic | ALG11 | 20 | 0 / 0 | 1 | 0 | 19 |
| reordered_semantic | ALG12 | 20 | 0 / 0 | 2 | 0 | 18 |
| near_collision | EXACT | 45 | 0 / 0 | 0 | 45 | 0 |
| near_collision | ALG01 | 45 | 0 / 43 | 0 | 2 | 0 |
| near_collision | ALG02 | 45 | 0 / 43 | 0 | 2 | 0 |
| near_collision | ALG03 | 45 | 0 / 43 | 0 | 2 | 0 |
| near_collision | ALG04 | 45 | 0 / 43 | 0 | 2 | 0 |
| near_collision | ALG05 | 45 | 0 / 28 | 0 | 17 | 0 |
| near_collision | ALG06 | 45 | 0 / 33 | 0 | 12 | 0 |
| near_collision | ALG07 | 45 | 0 / 43 | 0 | 2 | 0 |
| near_collision | ALG08 | 45 | 0 / 32 | 0 | 13 | 0 |
| near_collision | ALG09 | 45 | 0 / 35 | 0 | 10 | 0 |
| near_collision | ALG10 | 45 | 0 / 33 | 0 | 12 | 0 |
| near_collision | ALG11 | 45 | 0 / 43 | 0 | 2 | 0 |
| near_collision | ALG12 | 45 | 0 / 28 | 0 | 17 | 0 |
| unknown | EXACT | 35 | 0 / 0 | 0 | 0 | 35 |
| unknown | ALG01 | 35 | 0 / 0 | 0 | 0 | 35 |
| unknown | ALG02 | 35 | 0 / 0 | 0 | 0 | 35 |
| unknown | ALG03 | 35 | 0 / 0 | 0 | 0 | 35 |
| unknown | ALG04 | 35 | 0 / 0 | 0 | 0 | 35 |
| unknown | ALG05 | 35 | 0 / 0 | 2 | 0 | 33 |
| unknown | ALG06 | 35 | 0 / 0 | 0 | 0 | 35 |
| unknown | ALG07 | 35 | 0 / 0 | 1 | 0 | 34 |
| unknown | ALG08 | 35 | 0 / 0 | 1 | 0 | 34 |
| unknown | ALG09 | 35 | 0 / 0 | 2 | 0 | 33 |
| unknown | ALG10 | 35 | 0 / 0 | 1 | 0 | 34 |
| unknown | ALG11 | 35 | 0 / 0 | 1 | 0 | 34 |
| unknown | ALG12 | 35 | 0 / 0 | 1 | 0 | 34 |
| ambiguous | EXACT | 30 | 0 / 0 | 0 | 0 | 30 |
| ambiguous | ALG01 | 30 | 0 / 0 | 0 | 0 | 30 |
| ambiguous | ALG02 | 30 | 0 / 0 | 0 | 0 | 30 |
| ambiguous | ALG03 | 30 | 0 / 0 | 0 | 0 | 30 |
| ambiguous | ALG04 | 30 | 0 / 0 | 0 | 0 | 30 |
| ambiguous | ALG05 | 30 | 0 / 0 | 3 | 0 | 27 |
| ambiguous | ALG06 | 30 | 0 / 0 | 0 | 0 | 30 |
| ambiguous | ALG07 | 30 | 0 / 0 | 0 | 0 | 30 |
| ambiguous | ALG08 | 30 | 0 / 0 | 0 | 0 | 30 |
| ambiguous | ALG09 | 30 | 0 / 0 | 6 | 0 | 24 |
| ambiguous | ALG10 | 30 | 0 / 0 | 0 | 0 | 30 |
| ambiguous | ALG11 | 30 | 0 / 0 | 0 | 0 | 30 |
| ambiguous | ALG12 | 30 | 0 / 0 | 6 | 0 | 24 |
| length_boundary | EXACT | 25 | 14 / 0 | 0 | 9 | 2 |
| length_boundary | ALG01 | 25 | 14 / 0 | 0 | 9 | 2 |
| length_boundary | ALG02 | 25 | 14 / 0 | 0 | 9 | 2 |
| length_boundary | ALG03 | 25 | 14 / 0 | 0 | 9 | 2 |
| length_boundary | ALG04 | 25 | 14 / 0 | 0 | 9 | 2 |
| length_boundary | ALG05 | 25 | 14 / 0 | 0 | 9 | 2 |
| length_boundary | ALG06 | 25 | 14 / 0 | 0 | 9 | 2 |
| length_boundary | ALG07 | 25 | 14 / 0 | 0 | 9 | 2 |
| length_boundary | ALG08 | 25 | 14 / 0 | 0 | 9 | 2 |
| length_boundary | ALG09 | 25 | 14 / 0 | 0 | 9 | 2 |
| length_boundary | ALG10 | 25 | 14 / 0 | 0 | 9 | 2 |
| length_boundary | ALG11 | 25 | 14 / 0 | 0 | 9 | 2 |
| length_boundary | ALG12 | 25 | 14 / 6 | 0 | 3 | 2 |

## 6. Resolution and scoring timings by registry size

Each path is warmed with 12 queries, then timed separately without parsing, printing, allocations, dataset creation or I/O. End-to-end includes name normalization/tokenization, exact lookup, full scoring when needed, ranking and decision. Scoring-only computes every candidate score from prepared names without exact bypass or ranking. Twelve deterministic typo queries include original-schema and scaling-tail names. These are synthetic performance probes, separate from accuracy data.

Samples are per-query elapsed wall times. Median, P95 and P99 use all 12 * repetitions samples; repetitions are independent passes in one process, not isolated process launches. Trial min/max describe mean-per-query variability. Timer-call overhead is included and is significant for the exact baseline. Baseline scoring measures only array-fill overhead, not fuzzy work. Candidate preprocessing includes representation generation and collision checks; the latter are quadratic in registry count. Normalization measurements include tokenization and a consumed checksum.

| Algorithm | Properties | Path | Total ms | Mean us | Median us | P95 us | P99 us | Queries/s | Trial mean median us | Trial mean min-max us |
|---|---:|---|---:|---:|---:|---:|---:|---:|---:|---|
| EXACT | 10 | resolve | 0.033 | 0.388 | 0.371 | 0.469 | 0.471 | 2580170 | 0.387 | 0.387-0.389 |
| EXACT | 10 | score | 0.003 | 0.036 | 0.036 | 0.037 | 0.069 | 27531957 | 0.036 | 0.035-0.040 |
| EXACT | 50 | resolve | 0.045 | 0.534 | 0.521 | 0.618 | 0.621 | 1871991 | 0.534 | 0.531-0.537 |
| EXACT | 50 | score | 0.006 | 0.068 | 0.066 | 0.071 | 0.133 | 14700735 | 0.066 | 0.066-0.077 |
| EXACT | 100 | resolve | 0.149 | 1.775 | 0.726 | 0.826 | 88.212 | 563225 | 0.741 | 0.715-8.041 |
| EXACT | 100 | score | 0.010 | 0.124 | 0.122 | 0.131 | 0.215 | 8075370 | 0.122 | 0.122-0.132 |
| EXACT | 1000 | resolve | 0.552 | 6.567 | 4.050 | 4.260 | 113.920 | 152274 | 4.069 | 4.063-13.221 |
| EXACT | 1000 | score | 0.087 | 1.032 | 1.027 | 1.030 | 1.403 | 969149 | 1.027 | 1.026-1.060 |
| ALG01 | 10 | resolve | 6.493 | 77.296 | 61.653 | 155.080 | 204.647 | 12937 | 75.202 | 69.568-88.777 |
| ALG01 | 10 | score | 7.799 | 92.849 | 61.471 | 224.785 | 565.302 | 10770 | 81.330 | 67.383-157.535 |
| ALG01 | 50 | resolve | 47.316 | 563.287 | 472.894 | 991.985 | 2537.370 | 1775 | 509.334 | 446.630-740.639 |
| ALG01 | 50 | score | 38.672 | 460.386 | 420.783 | 734.309 | 1129.900 | 2172 | 435.877 | 416.673-574.796 |
| ALG01 | 100 | resolve | 97.064 | 1155.519 | 1021.185 | 2066.101 | 5509.615 | 865 | 1149.429 | 947.302-1339.164 |
| ALG01 | 100 | score | 91.336 | 1087.331 | 984.046 | 1845.648 | 3194.513 | 920 | 1012.332 | 921.316-1375.144 |
| ALG01 | 1000 | resolve | 944.405 | 11242.920 | 10763.169 | 15332.370 | 18851.427 | 89 | 10972.058 | 10613.082-12183.901 |
| ALG01 | 1000 | score | 944.716 | 11246.617 | 10635.443 | 15577.473 | 35492.290 | 89 | 11261.606 | 10706.052-12260.298 |
| ALG02 | 10 | resolve | 8.032 | 95.621 | 71.180 | 273.696 | 606.137 | 10458 | 89.295 | 65.818-182.685 |
| ALG02 | 10 | score | 8.311 | 98.936 | 70.611 | 252.086 | 320.403 | 10107 | 98.465 | 62.967-135.281 |
| ALG02 | 50 | resolve | 41.277 | 491.393 | 446.813 | 825.527 | 1238.656 | 2035 | 488.743 | 424.075-562.890 |
| ALG02 | 50 | score | 40.670 | 484.169 | 458.315 | 719.835 | 971.870 | 2065 | 492.120 | 428.191-517.967 |
| ALG02 | 100 | resolve | 88.319 | 1051.417 | 997.163 | 1588.302 | 1980.246 | 951 | 1036.193 | 1006.930-1116.228 |
| ALG02 | 100 | score | 94.139 | 1120.707 | 1051.050 | 1828.495 | 2719.250 | 892 | 1133.437 | 920.823-1357.783 |
| ALG02 | 1000 | resolve | 927.034 | 11036.115 | 10657.646 | 15022.249 | 15505.785 | 91 | 11126.799 | 9886.478-11887.255 |
| ALG02 | 1000 | score | 984.981 | 11725.963 | 11484.757 | 16479.993 | 21863.595 | 85 | 11894.538 | 10681.933-12443.596 |
| ALG03 | 10 | resolve | 8.572 | 102.050 | 70.909 | 185.544 | 698.552 | 9799 | 99.778 | 73.702-161.685 |
| ALG03 | 10 | score | 9.983 | 118.842 | 79.442 | 308.578 | 893.232 | 8415 | 86.625 | 78.609-260.011 |
| ALG03 | 50 | resolve | 50.596 | 602.332 | 566.832 | 886.011 | 1539.174 | 1660 | 601.990 | 485.021-701.366 |
| ALG03 | 50 | score | 46.767 | 556.749 | 521.346 | 819.887 | 1336.242 | 1796 | 555.777 | 482.842-627.909 |
| ALG03 | 100 | resolve | 111.110 | 1322.738 | 1194.236 | 2188.687 | 3320.629 | 756 | 1412.180 | 1127.018-1530.380 |
| ALG03 | 100 | score | 106.716 | 1270.429 | 1194.988 | 2021.271 | 3063.614 | 787 | 1198.869 | 1130.119-1462.917 |
| ALG03 | 1000 | resolve | 1137.942 | 13546.932 | 12356.395 | 20415.990 | 25796.425 | 74 | 13914.724 | 12440.754-14321.237 |
| ALG03 | 1000 | score | 1091.252 | 12991.089 | 12288.294 | 18540.815 | 22261.655 | 77 | 12888.294 | 12524.738-13980.233 |
| ALG04 | 10 | resolve | 29.111 | 346.560 | 329.929 | 504.858 | 888.848 | 2885 | 344.402 | 291.450-395.256 |
| ALG04 | 10 | score | 28.818 | 343.072 | 305.301 | 618.790 | 738.907 | 2915 | 341.986 | 294.963-383.796 |
| ALG04 | 50 | resolve | 177.198 | 2109.504 | 1966.787 | 3238.265 | 3822.238 | 474 | 2069.601 | 1936.395-2409.010 |
| ALG04 | 50 | score | 172.336 | 2051.621 | 1973.994 | 3023.577 | 3397.767 | 487 | 2011.463 | 1842.447-2539.834 |
| ALG04 | 100 | resolve | 347.746 | 4139.829 | 3760.719 | 6321.540 | 8489.184 | 242 | 4169.565 | 3811.591-4401.358 |
| ALG04 | 100 | score | 351.749 | 4187.488 | 4096.863 | 5840.183 | 7394.674 | 239 | 4113.649 | 3707.482-4749.294 |
| ALG04 | 1000 | resolve | 3578.474 | 42600.883 | 41041.573 | 55597.155 | 59994.366 | 23 | 42518.583 | 41817.316-43781.513 |
| ALG04 | 1000 | score | 3764.738 | 44818.309 | 41947.333 | 59907.630 | 107339.686 | 22 | 44431.657 | 42405.471-48699.935 |
| ALG05 | 10 | resolve | 1.885 | 22.437 | 19.805 | 26.625 | 106.108 | 44570 | 21.032 | 19.171-28.077 |
| ALG05 | 10 | score | 1.938 | 23.066 | 19.330 | 24.383 | 232.633 | 43353 | 19.517 | 18.674-44.801 |
| ALG05 | 50 | resolve | 5.812 | 69.188 | 54.069 | 142.185 | 223.081 | 14453 | 67.539 | 59.294-92.147 |
| ALG05 | 50 | score | 5.568 | 66.291 | 52.483 | 163.419 | 180.088 | 15085 | 64.930 | 58.322-75.763 |
| ALG05 | 100 | resolve | 10.490 | 124.879 | 93.076 | 308.497 | 562.792 | 8008 | 125.864 | 90.714-157.332 |
| ALG05 | 100 | score | 10.951 | 130.367 | 96.715 | 346.636 | 526.327 | 7671 | 125.644 | 95.712-180.141 |
| ALG05 | 1000 | resolve | 76.908 | 915.570 | 813.597 | 1530.572 | 3125.986 | 1092 | 821.711 | 729.596-1323.023 |
| ALG05 | 1000 | score | 72.072 | 857.997 | 775.920 | 1389.592 | 2334.938 | 1166 | 816.271 | 729.628-1114.446 |
| ALG06 | 10 | resolve | 1.798 | 21.409 | 18.873 | 26.589 | 94.172 | 46709 | 19.165 | 17.454-27.581 |
| ALG06 | 10 | score | 1.722 | 20.500 | 18.369 | 23.968 | 108.348 | 48780 | 20.010 | 17.498-28.127 |
| ALG06 | 50 | resolve | 7.051 | 83.936 | 58.373 | 238.291 | 533.088 | 11914 | 63.422 | 55.202-130.439 |
| ALG06 | 50 | score | 4.702 | 55.981 | 50.667 | 79.964 | 176.576 | 17863 | 55.124 | 52.987-60.393 |
| ALG06 | 100 | resolve | 8.175 | 97.324 | 83.121 | 150.280 | 463.628 | 10275 | 94.569 | 84.603-119.477 |
| ALG06 | 100 | score | 9.077 | 108.058 | 88.129 | 247.462 | 333.738 | 9254 | 108.587 | 84.059-131.791 |
| ALG06 | 1000 | resolve | 72.938 | 868.315 | 846.705 | 1307.256 | 1650.718 | 1152 | 861.244 | 720.458-1041.012 |
| ALG06 | 1000 | score | 64.859 | 772.135 | 746.005 | 1152.352 | 1383.596 | 1295 | 761.724 | 700.219-924.616 |
| ALG07 | 10 | resolve | 1.737 | 20.681 | 13.258 | 44.042 | 325.081 | 48354 | 15.189 | 12.999-51.243 |
| ALG07 | 10 | score | 1.843 | 21.938 | 12.818 | 16.832 | 570.407 | 45583 | 12.985 | 12.603-59.444 |
| ALG07 | 50 | resolve | 8.713 | 103.731 | 74.579 | 259.178 | 560.147 | 9640 | 102.447 | 77.816-130.119 |
| ALG07 | 50 | score | 7.787 | 92.705 | 74.002 | 165.362 | 341.701 | 10787 | 91.024 | 76.715-112.962 |
| ALG07 | 100 | resolve | 19.277 | 229.483 | 189.588 | 404.277 | 1138.152 | 4358 | 213.394 | 177.613-374.823 |
| ALG07 | 100 | score | 15.117 | 179.963 | 162.492 | 289.760 | 374.432 | 5557 | 178.146 | 160.426-203.800 |
| ALG07 | 1000 | resolve | 171.089 | 2036.770 | 1900.909 | 3221.653 | 3949.568 | 491 | 2017.004 | 1861.586-2216.029 |
| ALG07 | 1000 | score | 172.064 | 2048.380 | 1928.273 | 3415.904 | 4636.789 | 488 | 2017.616 | 1777.239-2395.206 |
| ALG08 | 10 | resolve | 1.329 | 15.817 | 14.735 | 16.991 | 69.789 | 63222 | 14.846 | 14.787-19.163 |
| ALG08 | 10 | score | 1.468 | 17.479 | 14.205 | 19.240 | 89.425 | 57212 | 14.532 | 14.363-22.845 |
| ALG08 | 50 | resolve | 8.442 | 100.503 | 86.933 | 179.653 | 403.789 | 9950 | 98.926 | 83.680-117.984 |
| ALG08 | 50 | score | 12.760 | 151.907 | 87.058 | 370.021 | 1503.865 | 6583 | 126.016 | 89.058-297.147 |
| ALG08 | 100 | resolve | 18.435 | 219.470 | 187.180 | 407.831 | 648.675 | 4556 | 206.435 | 182.912-256.838 |
| ALG08 | 100 | score | 21.695 | 258.270 | 186.323 | 451.504 | 1884.152 | 3872 | 231.564 | 215.559-337.012 |
| ALG08 | 1000 | resolve | 190.394 | 2266.599 | 2171.004 | 3199.254 | 3748.454 | 441 | 2261.580 | 1903.179-2770.424 |
| ALG08 | 1000 | score | 184.828 | 2200.332 | 2070.871 | 3170.154 | 5326.649 | 454 | 2109.793 | 1904.236-2561.016 |
| ALG09 | 10 | resolve | 1.534 | 18.257 | 15.028 | 17.996 | 199.857 | 54775 | 16.843 | 14.933-30.926 |
| ALG09 | 10 | score | 1.858 | 22.122 | 14.684 | 37.288 | 359.878 | 45205 | 17.091 | 14.570-43.111 |
| ALG09 | 50 | resolve | 9.907 | 117.937 | 88.573 | 247.640 | 834.629 | 8479 | 112.039 | 85.585-165.498 |
| ALG09 | 50 | score | 9.178 | 109.259 | 84.570 | 267.781 | 421.893 | 9153 | 88.996 | 84.327-160.926 |
| ALG09 | 100 | resolve | 19.718 | 234.744 | 194.489 | 479.023 | 637.021 | 4260 | 225.794 | 186.859-269.183 |
| ALG09 | 100 | score | 17.747 | 211.277 | 181.196 | 371.444 | 518.270 | 4733 | 218.327 | 176.014-234.620 |
| ALG09 | 1000 | resolve | 189.674 | 2258.020 | 2163.132 | 3121.505 | 5822.010 | 443 | 2283.537 | 1854.140-2505.681 |
| ALG09 | 1000 | score | 212.964 | 2535.286 | 2258.355 | 4341.787 | 8290.838 | 394 | 2470.617 | 1892.932-3266.482 |
| ALG10 | 10 | resolve | 1.315 | 15.650 | 15.100 | 17.021 | 49.856 | 63896 | 15.187 | 14.864-17.947 |
| ALG10 | 10 | score | 2.595 | 30.889 | 14.891 | 90.342 | 488.593 | 32374 | 21.358 | 14.526-84.363 |
| ALG10 | 50 | resolve | 11.090 | 132.028 | 95.042 | 349.241 | 636.410 | 7574 | 122.571 | 101.467-180.293 |
| ALG10 | 50 | score | 9.560 | 113.805 | 89.044 | 220.407 | 778.883 | 8787 | 103.790 | 85.257-188.791 |
| ALG10 | 100 | resolve | 16.488 | 196.284 | 180.417 | 306.673 | 389.548 | 5095 | 192.985 | 169.034-225.217 |
| ALG10 | 100 | score | 20.114 | 239.449 | 190.530 | 574.857 | 714.728 | 4176 | 216.942 | 186.491-319.502 |
| ALG10 | 1000 | resolve | 186.590 | 2221.305 | 2115.515 | 3132.468 | 4068.915 | 450 | 2196.814 | 1975.084-2506.311 |
| ALG10 | 1000 | score | 182.959 | 2178.082 | 2103.751 | 3145.713 | 3484.078 | 459 | 2189.386 | 2026.539-2297.538 |
| ALG11 | 10 | resolve | 2.025 | 24.112 | 23.003 | 28.164 | 96.992 | 41474 | 22.664 | 22.052-31.652 |
| ALG11 | 10 | score | 2.500 | 29.764 | 22.542 | 67.188 | 235.367 | 33597 | 26.700 | 21.499-48.519 |
| ALG11 | 50 | resolve | 8.656 | 103.048 | 86.403 | 194.527 | 477.708 | 9704 | 89.732 | 82.806-145.316 |
| ALG11 | 50 | score | 8.505 | 101.246 | 87.181 | 173.562 | 405.607 | 9877 | 97.704 | 86.486-129.054 |
| ALG11 | 100 | resolve | 15.434 | 183.739 | 163.192 | 319.600 | 446.984 | 5442 | 176.354 | 165.903-219.364 |
| ALG11 | 100 | score | 18.130 | 215.833 | 166.329 | 512.627 | 1061.753 | 4633 | 217.250 | 159.613-297.809 |
| ALG11 | 1000 | resolve | 134.180 | 1597.385 | 1558.204 | 2173.637 | 3229.376 | 626 | 1598.345 | 1427.096-1760.162 |
| ALG11 | 1000 | score | 157.873 | 1879.442 | 1673.126 | 3462.934 | 4825.557 | 532 | 1805.601 | 1492.653-2359.154 |
| ALG12 | 10 | resolve | 25.374 | 302.071 | 173.965 | 946.055 | 1817.576 | 3310 | 332.441 | 179.051-420.222 |
| ALG12 | 10 | score | 16.342 | 194.551 | 151.043 | 401.338 | 948.314 | 5140 | 174.542 | 131.133-274.590 |
| ALG12 | 50 | resolve | 93.082 | 1108.121 | 1010.796 | 1732.814 | 2536.315 | 902 | 1136.323 | 1043.565-1148.608 |
| ALG12 | 50 | score | 102.928 | 1225.338 | 1057.947 | 2076.997 | 6113.473 | 816 | 1092.815 | 906.619-1964.563 |
| ALG12 | 100 | resolve | 207.108 | 2465.575 | 2201.236 | 4123.433 | 7343.585 | 406 | 2253.921 | 2171.040-3094.757 |
| ALG12 | 100 | score | 199.659 | 2376.893 | 2368.255 | 3361.830 | 4694.284 | 421 | 2408.646 | 2046.278-2645.577 |
| ALG12 | 1000 | resolve | 2209.114 | 26298.979 | 24744.934 | 40732.451 | 66825.607 | 38 | 23474.773 | 22155.840-35377.385 |
| ALG12 | 1000 | score | 2422.420 | 28838.334 | 24760.051 | 47212.729 | 167725.435 | 35 | 28322.679 | 21485.505-41961.160 |

| Properties | Candidate preprocessing ms (first method) | Name preparation us | Prepared registry bytes |
|---|---:|---:|---:|
| 10 | 0.027 | 0.561 | 44080 |
| 50 | 0.105 | 0.568 | 220400 |
| 100 | 0.180 | 0.697 | 440800 |
| 1000 | 6.673 | 0.510 | 4408000 |

Every method also needs a 4272-byte Prepared query; resolver loop locals are small. Scoring workspace estimates above exclude the cached registry/query. There are zero matching-path heap allocations. The benchmark allocates 1 KiB of sample storage at 7 repetitions. Peak resident process memory is unavailable: it is not instrumented; the process also holds manifests, evaluation records and calibration score caches.

## 7. Near-collision and ambiguous-key results

The adversarial schema co-locates authentication/authorization, seconds/milliseconds, singular/plural request counts, error/access logs, internal/external URLs, storage/cache directories, seconds/minutes, reload/reset, min/max, input/output, read/write, enabled/disabled, count/limit and V1/V2. A separate collision schema must fail before ranking. Types never disambiguate candidates: a number can be valid under the wrong unit.

| Algorithm | Adversarial correct | Wrong target | Unknown accepted | Ambiguous accepted | Rejected target | Ambiguity diagnoses | Dangerous accepts with >=8 shared-prefix chars |
|---|---:|---:|---:|---:|---:|---:|---:|
| EXACT | 20 | 0 | 0 | 0 | 45 | 0 | 0 |
| ALG01 | 63 | 0 | 0 | 0 | 2 | 0 | 0 |
| ALG02 | 63 | 0 | 0 | 0 | 2 | 0 | 0 |
| ALG03 | 63 | 0 | 0 | 0 | 2 | 0 | 0 |
| ALG04 | 63 | 0 | 0 | 0 | 2 | 0 | 0 |
| ALG05 | 48 | 0 | 2 | 3 | 17 | 21 | 0 |
| ALG06 | 53 | 0 | 0 | 0 | 12 | 9 | 0 |
| ALG07 | 63 | 0 | 1 | 0 | 2 | 15 | 0 |
| ALG08 | 52 | 0 | 1 | 0 | 13 | 27 | 0 |
| ALG09 | 55 | 0 | 2 | 6 | 10 | 18 | 0 |
| ALG10 | 53 | 0 | 1 | 0 | 12 | 30 | 0 |
| ALG11 | 63 | 0 | 1 | 0 | 2 | 15 | 0 |
| ALG12 | 48 | 0 | 1 | 6 | 17 | 24 | 0 |

The shared-prefix count measures wrong-target accepts only, comparing actual and intended names. It is an observed association, not evidence of causality or a general property of a method. Jaro-Winkler must be assessed together with its independently calibrated margin.

### Incorrect-target property pairs

| Method | Intended | Accepted instead | Count |
|---|---|---|---:|
| All | No observed wrong-target accepts | N/A | 0 |

## 8. Inputs that failed expected resolution

Every failing ID, the top two candidate scores and the intended-target score is included in the per-case CSV. Unknown or ambiguous statuses still carry suggestions; suggestions are never applied. The following table includes all dangerous accepts and up to three non-dangerous failures per method.

| Method / ID | Input | Expected | Outcome / classification | Top (score) | Second (score) | Threshold / margin |
|---|---|---|---|---|---|---|
| EXACT / E0051 | `database connection strng` | DatabaseConnectionString | unknown: unnecessary rejection | (none) (0.000000) | (none) (0.000000) | 0.500000 / 0.000 |
| EXACT / E0052 | `authentication server endpint` | AuthenticationServerEndpoint | unknown: unnecessary rejection | (none) (0.000000) | (none) (0.000000) | 0.500000 / 0.000 |
| EXACT / E0053 | `maximum concurent request count` | MaximumConcurrentRequestCount | unknown: unnecessary rejection | (none) (0.000000) | (none) (0.000000) | 0.500000 / 0.000 |
| ALG01 / E0258 | `maximumconcurrentrequestscmunt` | MaximumConcurrentRequestsCount | ambiguous: unnecessary rejection | MaximumConcurrentRequestsCount (0.966667) | MaximumConcurrentRequestCount (0.933333) | 0.880000 / 0.040 |
| ALG01 / E0290 | `maximumconcurrentrequesmscount` | MaximumConcurrentRequestsCount | ambiguous: unnecessary rejection | MaximumConcurrentRequestsCount (0.966667) | MaximumConcurrentRequestCount (0.933333) | 0.880000 / 0.040 |
| ALG01 / E0326 | `auth server endpoint` | ambiguous | unknown: safe rejection without ambiguity label | AuthorizationServerEndpoint (0.666667) | AuthenticationServerEndpoint (0.642857) | 0.880000 / 0.040 |
| ALG02 / E0258 | `maximumconcurrentrequestscmunt` | MaximumConcurrentRequestsCount | ambiguous: unnecessary rejection | MaximumConcurrentRequestsCount (0.966667) | MaximumConcurrentRequestCount (0.933333) | 0.880000 / 0.040 |
| ALG02 / E0290 | `maximumconcurrentrequesmscount` | MaximumConcurrentRequestsCount | ambiguous: unnecessary rejection | MaximumConcurrentRequestsCount (0.966667) | MaximumConcurrentRequestCount (0.933333) | 0.880000 / 0.040 |
| ALG02 / E0326 | `auth server endpoint` | ambiguous | unknown: safe rejection without ambiguity label | AuthorizationServerEndpoint (0.666667) | AuthenticationServerEndpoint (0.642857) | 0.880000 / 0.040 |
| ALG03 / E0258 | `maximumconcurrentrequestscmunt` | MaximumConcurrentRequestsCount | ambiguous: unnecessary rejection | MaximumConcurrentRequestsCount (0.966667) | MaximumConcurrentRequestCount (0.933333) | 0.880000 / 0.040 |
| ALG03 / E0290 | `maximumconcurrentrequesmscount` | MaximumConcurrentRequestsCount | ambiguous: unnecessary rejection | MaximumConcurrentRequestsCount (0.966667) | MaximumConcurrentRequestCount (0.933333) | 0.880000 / 0.040 |
| ALG03 / E0326 | `auth server endpoint` | ambiguous | unknown: safe rejection without ambiguity label | AuthorizationServerEndpoint (0.666667) | AuthenticationServerEndpoint (0.642857) | 0.880000 / 0.040 |
| ALG04 / E0258 | `maximumconcurrentrequestscmunt` | MaximumConcurrentRequestsCount | ambiguous: unnecessary rejection | MaximumConcurrentRequestsCount (0.966667) | MaximumConcurrentRequestCount (0.933333) | 0.900000 / 0.040 |
| ALG04 / E0290 | `maximumconcurrentrequesmscount` | MaximumConcurrentRequestsCount | ambiguous: unnecessary rejection | MaximumConcurrentRequestsCount (0.966667) | MaximumConcurrentRequestCount (0.933333) | 0.900000 / 0.040 |
| ALG04 / E0326 | `auth server endpoint` | ambiguous | unknown: safe rejection without ambiguity label | AuthorizationServerEndpoint (0.666667) | AuthenticationServerEndpoint (0.642857) | 0.900000 / 0.040 |
| ALG05 / E0206 | `database connection` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | DatabaseConnectionString (0.916667) | EnableAutomaticConfigurationReload (0.671909) | 0.840000 / 0.080 |
| ALG05 / E0207 | `authentication server` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | AuthenticationServerEndpoint (0.904762) | ExternalNotificationServiceUrl (0.703704) | 0.840000 / 0.080 |
| ALG05 / E0210 | `default request timeout` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | DefaultRequestTimeoutSeconds (0.916667) | ExternalNotificationServiceUrl (0.615873) | 0.840000 / 0.080 |
| ALG05 / E0213 | `temporary file storage` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | TemporaryFileStorageDirectory (0.896552) | ExternalNotificationServiceUrl (0.616667) | 0.840000 / 0.080 |
| ALG05 / E0218 | `application environment` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | ApplicationEnvironmentName (0.948718) | ExternalNotificationServiceUrl (0.685690) | 0.840000 / 0.080 |
| ALG05 / E0228 | `environment application name` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | ApplicationEnvironmentName (0.858974) | ExternalNotificationServiceUrl (0.662251) | 0.840000 / 0.080 |
| ALG05 / E0232 | `url external notification service` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | ExternalNotificationServiceUrl (0.883951) | AuthenticationServerEndpoint (0.732264) | 0.840000 / 0.080 |
| ALG05 / E0235 | `configuration enable automatic reload` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | EnableAutomaticConfigurationReload (0.862745) | BackgroundTaskExecutionIntervalSeconds (0.686733) | 0.840000 / 0.080 |
| ALG05 / E0246 | `default request timeout miliseconds` | DefaultRequestTimeoutMilliseconds | ambiguous: unnecessary rejection | DefaultRequestTimeoutMilliseconds (0.989899) | DefaultRequestTimeoutSeconds (0.958333) | 0.840000 / 0.080 |
| ALG05 / E0252 | `enableautomaticconyigurationreset` | EnableAutomaticConfigurationReset | ambiguous: unnecessary rejection | EnableAutomaticConfigurationReset (0.979798) | EnableAutomaticConfigurationReload (0.910576) | 0.840000 / 0.080 |
| ALG05 / E0253 | `enableautomaticconfigurntionreload` | EnableAutomaticConfigurationReload | ambiguous: unnecessary rejection | EnableAutomaticConfigurationReload (0.950089) | EnableAutomaticConfigurationReset (0.908259) | 0.840000 / 0.080 |
| ALG05 / E0297 | `database connection strong password` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | DatabaseConnectionString (0.892361) | BackgroundTaskExecutionIntervalSeconds (0.723262) | 0.840000 / 0.080 |
| ALG05 / E0299 | `external notification secret` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | ExternalNotificationServiceUrl (0.918291) | EnableAutomaticConfigurationReset (0.765394) | 0.840000 / 0.080 |
| ALG05 / E0334 | `connection bound` | ambiguous | fuzzy: UNSAFE AMBIGUOUS ACCEPTANCE | ConnectionCount (0.911111) | ConnectionLimit (0.777778) | 0.840000 / 0.080 |
| ALG05 / E0344 | `connection bound ` | ambiguous | fuzzy: UNSAFE AMBIGUOUS ACCEPTANCE | ConnectionCount (0.911111) | ConnectionLimit (0.777778) | 0.840000 / 0.080 |
| ALG05 / E0354 | `connection bound-` | ambiguous | fuzzy: UNSAFE AMBIGUOUS ACCEPTANCE | ConnectionCount (0.911111) | ConnectionLimit (0.777778) | 0.840000 / 0.080 |
| ALG06 / E0058 | `applcationenvironmentname` | ApplicationEnvironmentName | unknown: unnecessary rejection | ApplicationEnvironmentName (0.952308) | DatabaseConnectionString (0.664722) | 0.960000 / 0.020 |
| ALG06 / E0061 | `backgroudtaskexecutionintervalseconds` | BackgroundTaskExecutionIntervalSeconds | unknown: unnecessary rejection | BackgroundTaskExecutionIntervalSeconds (0.921764) | EnableAutomaticConfigurationReload (0.687854) | 0.960000 / 0.020 |
| ALG06 / E0064 | `backgroundtaskexecutiointervalseconds` | BackgroundTaskExecutionIntervalSeconds | unknown: unnecessary rejection | BackgroundTaskExecutionIntervalSeconds (0.959602) | DatabaseConnectionString (0.703078) | 0.960000 / 0.020 |
| ALG06 / E0218 | `application environment` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | ApplicationEnvironmentName (0.969231) | ExternalNotificationServiceUrl (0.685690) | 0.960000 / 0.020 |
| ALG07 / E0218 | `application environment` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | ApplicationEnvironmentName (0.916667) | AuthenticationServerEndpoint (0.560000) | 0.880000 / 0.040 |
| ALG07 / E0232 | `url external notification service` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | ExternalNotificationServiceUrl (0.900000) | AuthenticationServerEndpoint (0.586207) | 0.880000 / 0.040 |
| ALG07 / E0258 | `maximumconcurrentrequestscmunt` | MaximumConcurrentRequestsCount | ambiguous: unnecessary rejection | MaximumConcurrentRequestsCount (0.966667) | MaximumConcurrentRequestCount (0.949153) | 0.880000 / 0.040 |
| ALG07 / E0290 | `maximumconcurrentrequesmscount` | MaximumConcurrentRequestsCount | ambiguous: unnecessary rejection | MaximumConcurrentRequestsCount (0.966667) | MaximumConcurrentRequestCount (0.949153) | 0.880000 / 0.040 |
| ALG07 / E0296 | `default request timeout nanoseconds` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | DefaultRequestTimeoutSeconds (0.933333) | DefaultRequestTimeoutMilliseconds (0.861538) | 0.880000 / 0.040 |
| ALG07 / E0326 | `auth server endpoint` | ambiguous | unknown: safe rejection without ambiguity label | AuthorizationServerEndpoint (0.800000) | AuthenticationServerEndpoint (0.782609) | 0.880000 / 0.040 |
| ALG08 / E0206 | `database connection` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | DatabaseConnectionString (0.727273) | BackgroundTaskExecutionIntervalSeconds (0.106383) | 0.520000 / 0.120 |
| ALG08 / E0207 | `authentication server` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | AuthenticationServerEndpoint (0.692308) | ExternalNotificationServiceUrl (0.243243) | 0.520000 / 0.120 |
| ALG08 / E0208 | `environment name` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | ApplicationEnvironmentName (0.541667) | AuthenticationServerEndpoint (0.026316) | 0.520000 / 0.120 |
| ALG08 / E0210 | `default request timeout` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | DefaultRequestTimeoutSeconds (0.730769) | MaximumConcurrentRequestCount (0.150000) | 0.520000 / 0.120 |
| ALG08 / E0211 | `detailed error logging` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | EnableDetailedErrorLogging (0.818182) | DatabaseConnectionString (0.025641) | 0.520000 / 0.120 |
| ALG08 / E0212 | `notification service` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | ExternalNotificationServiceUrl (0.607143) | AuthenticationServerEndpoint (0.264706) | 0.520000 / 0.120 |
| ALG08 / E0213 | `temporary file storage` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | TemporaryFileStorageDirectory (0.680000) | EnableDetailedErrorLogging (0.026316) | 0.520000 / 0.120 |
| ALG08 / E0215 | `automatic configuration` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | EnableAutomaticConfigurationReload (0.612903) | AuthenticationServerEndpoint (0.125000) | 0.520000 / 0.120 |
| ALG08 / E0218 | `application environment` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | ApplicationEnvironmentName (0.833333) | AuthenticationServerEndpoint (0.150000) | 0.520000 / 0.120 |
| ALG08 / E0223 | `storage directory` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | TemporaryFileStorageDirectory (0.520000) | DatabaseConnectionString (0.029412) | 0.520000 / 0.120 |
| ALG08 / E0225 | `configuration reload` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | EnableAutomaticConfigurationReload (0.548387) | DatabaseConnectionString (0.083333) | 0.520000 / 0.120 |
| ALG08 / E0226 | `connection string database` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | DatabaseConnectionString (0.833333) | AuthenticationServerEndpoint (0.066667) | 0.520000 / 0.120 |
| ALG08 / E0227 | `endpoint authentication server` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | AuthenticationServerEndpoint (0.857143) | ExternalNotificationServiceUrl (0.200000) | 0.520000 / 0.120 |
| ALG08 / E0228 | `environment application name` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | ApplicationEnvironmentName (0.714286) | AuthenticationServerEndpoint (0.136364) | 0.520000 / 0.120 |
| ALG08 / E0229 | `request maximum concurrent count` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | MaximumConcurrentRequestCount (0.800000) | DefaultRequestTimeoutSeconds (0.127660) | 0.520000 / 0.120 |
| ALG08 / E0230 | `seconds default request timeout` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | DefaultRequestTimeoutSeconds (0.857143) | MaximumConcurrentRequestCount (0.152174) | 0.520000 / 0.120 |
| ALG08 / E0231 | `logging enable detailed error` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | EnableDetailedErrorLogging (0.833333) | EnableAutomaticConfigurationReload (0.081633) | 0.520000 / 0.120 |
| ALG08 / E0232 | `url external notification service` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | ExternalNotificationServiceUrl (0.866667) | AuthenticationServerEndpoint (0.200000) | 0.520000 / 0.120 |
| ALG08 / E0233 | `directory temporary file storage` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | TemporaryFileStorageDirectory (0.851852) | DatabaseConnectionString (0.021739) | 0.520000 / 0.120 |
| ALG08 / E0234 | `seconds background task execution interval` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | BackgroundTaskExecutionIntervalSeconds (0.894737) | DatabaseConnectionString (0.094340) | 0.520000 / 0.120 |
| ALG08 / E0235 | `configuration enable automatic reload` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | EnableAutomaticConfigurationReload (0.771429) | ApplicationEnvironmentName (0.100000) | 0.520000 / 0.120 |
| ALG08 / E0254 | `extertalnotificationserviceurl` | ExternalNotificationServiceUrl | ambiguous: unnecessary rejection | ExternalNotificationServiceUrl (0.806452) | InternalNotificationServiceUrl (0.696970) | 0.520000 / 0.120 |
| ALG08 / E0255 | `apiendpoinqv2` | ApiEndpointV2 | ambiguous: unnecessary rejection | ApiEndpointV1 (0.571429) | ApiEndpointV2 (0.571429) | 0.520000 / 0.120 |
| ALG08 / E0256 | `defaultrequesttimeoutcilliseconds` | DefaultRequestTimeoutMilliseconds | ambiguous: unnecessary rejection | DefaultRequestTimeoutMilliseconds (0.823529) | DefaultRequestTimeoutSeconds (0.727273) | 0.520000 / 0.120 |
| ALG08 / E0297 | `database connection strong password` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | DatabaseConnectionString (0.575758) | ConnectionCount (0.228571) | 0.520000 / 0.120 |
| ALG09 / E0206 | `database connection` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | DatabaseConnectionString (0.833333) | BackgroundTaskExecutionIntervalSeconds (0.367347) | 0.780000 / 0.080 |
| ALG09 / E0207 | `authentication server` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | AuthenticationServerEndpoint (0.850000) | ExternalNotificationServiceUrl (0.465116) | 0.780000 / 0.080 |
| ALG09 / E0210 | `default request timeout` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | DefaultRequestTimeoutSeconds (0.851064) | MaximumConcurrentRequestCount (0.400000) | 0.780000 / 0.080 |
| ALG09 / E0211 | `detailed error logging` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | EnableDetailedErrorLogging (0.900000) | TemporaryFileStorageDirectory (0.195122) | 0.780000 / 0.080 |
| ALG09 / E0213 | `temporary file storage` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | TemporaryFileStorageDirectory (0.850000) | EnableAutomaticConfigurationReload (0.170213) | 0.780000 / 0.080 |
| ALG09 / E0218 | `application environment` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | ApplicationEnvironmentName (0.926829) | AuthenticationServerEndpoint (0.380952) | 0.780000 / 0.080 |
| ALG09 / E0226 | `connection string database` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | DatabaseConnectionString (0.976744) | BackgroundTaskExecutionIntervalSeconds (0.357143) | 0.780000 / 0.080 |
| ALG09 / E0227 | `endpoint authentication server` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | AuthenticationServerEndpoint (0.956522) | ExternalNotificationServiceUrl (0.408163) | 0.780000 / 0.080 |
| ALG09 / E0228 | `environment application name` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | ApplicationEnvironmentName (0.909091) | AuthenticationServerEndpoint (0.355556) | 0.780000 / 0.080 |
| ALG09 / E0229 | `request maximum concurrent count` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | MaximumConcurrentRequestCount (0.960000) | DefaultRequestTimeoutSeconds (0.384615) | 0.780000 / 0.080 |
| ALG09 / E0230 | `seconds default request timeout` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | DefaultRequestTimeoutSeconds (0.962963) | MaximumConcurrentRequestCount (0.423077) | 0.780000 / 0.080 |
| ALG09 / E0231 | `logging enable detailed error` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | EnableDetailedErrorLogging (0.954545) | EnableAutomaticConfigurationReload (0.230769) | 0.780000 / 0.080 |
| ALG09 / E0232 | `url external notification service` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | ExternalNotificationServiceUrl (0.961538) | AuthenticationServerEndpoint (0.408163) | 0.780000 / 0.080 |
| ALG09 / E0233 | `directory temporary file storage` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | TemporaryFileStorageDirectory (0.956522) | EnableAutomaticConfigurationReload (0.188679) | 0.780000 / 0.080 |
| ALG09 / E0234 | `seconds background task execution interval` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | BackgroundTaskExecutionIntervalSeconds (0.970588) | DatabaseConnectionString (0.363636) | 0.780000 / 0.080 |
| ALG09 / E0235 | `configuration enable automatic reload` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | EnableAutomaticConfigurationReload (0.933333) | AuthenticationServerEndpoint (0.339623) | 0.780000 / 0.080 |
| ALG09 / E0254 | `extertalnotificationserviceurl` | ExternalNotificationServiceUrl | ambiguous: unnecessary rejection | ExternalNotificationServiceUrl (0.923077) | InternalNotificationServiceUrl (0.846154) | 0.780000 / 0.080 |
| ALG09 / E0256 | `defaultrequesttimeoutcilliseconds` | DefaultRequestTimeoutMilliseconds | ambiguous: unnecessary rejection | DefaultRequestTimeoutMilliseconds (0.937500) | DefaultRequestTimeoutSeconds (0.881356) | 0.780000 / 0.080 |
| ALG09 / E0258 | `maximumconcurrentrequestscmunt` | MaximumConcurrentRequestsCount | ambiguous: unnecessary rejection | MaximumConcurrentRequestsCount (0.961538) | MaximumConcurrentRequestCount (0.901961) | 0.780000 / 0.080 |
| ALG09 / E0297 | `database connection strong password` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | DatabaseConnectionString (0.791667) | ConnectionCount (0.410256) | 0.780000 / 0.080 |
| ALG09 / E0299 | `external notification secret` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | ExternalNotificationServiceUrl (0.800000) | InternalNotificationServiceUrl (0.720000) | 0.780000 / 0.080 |
| ALG09 / E0327 | `default request timeout` | ambiguous | fuzzy: UNSAFE AMBIGUOUS ACCEPTANCE | DefaultRequestTimeoutSeconds (0.851064) | DefaultRequestTimeoutMilliseconds (0.769231) | 0.780000 / 0.080 |
| ALG09 / E0334 | `connection bound` | ambiguous | fuzzy: UNSAFE AMBIGUOUS ACCEPTANCE | ConnectionCount (0.800000) | MaximumConnectionCount (0.625000) | 0.780000 / 0.080 |
| ALG09 / E0337 | `default request timeout ` | ambiguous | fuzzy: UNSAFE AMBIGUOUS ACCEPTANCE | DefaultRequestTimeoutSeconds (0.851064) | DefaultRequestTimeoutMilliseconds (0.769231) | 0.780000 / 0.080 |
| ALG09 / E0344 | `connection bound ` | ambiguous | fuzzy: UNSAFE AMBIGUOUS ACCEPTANCE | ConnectionCount (0.800000) | MaximumConnectionCount (0.625000) | 0.780000 / 0.080 |
| ALG09 / E0347 | `default request timeout-` | ambiguous | fuzzy: UNSAFE AMBIGUOUS ACCEPTANCE | DefaultRequestTimeoutSeconds (0.851064) | DefaultRequestTimeoutMilliseconds (0.769231) | 0.780000 / 0.080 |
| ALG09 / E0354 | `connection bound-` | ambiguous | fuzzy: UNSAFE AMBIGUOUS ACCEPTANCE | ConnectionCount (0.800000) | MaximumConnectionCount (0.625000) | 0.780000 / 0.080 |
| ALG10 / E0206 | `database connection` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | DatabaseConnectionString (0.852803) | BackgroundTaskExecutionIntervalSeconds (0.208333) | 0.640000 / 0.080 |
| ALG10 / E0207 | `authentication server` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | AuthenticationServerEndpoint (0.832050) | ExternalNotificationServiceUrl (0.400892) | 0.640000 / 0.080 |
| ALG10 / E0208 | `environment name` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | ApplicationEnvironmentName (0.735980) | AuthenticationServerEndpoint (0.054393) | 0.640000 / 0.080 |
| ALG10 / E0210 | `default request timeout` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | DefaultRequestTimeoutSeconds (0.854850) | MaximumConcurrentRequestCount (0.264906) | 0.640000 / 0.080 |
| ALG10 / E0211 | `detailed error logging` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | EnableDetailedErrorLogging (0.890871) | DatabaseConnectionString (0.050252) | 0.640000 / 0.080 |
| ALG10 / E0212 | `notification service` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | ExternalNotificationServiceUrl (0.779194) | AuthenticationServerEndpoint (0.428086) | 0.640000 / 0.080 |
| ALG10 / E0213 | `temporary file storage` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | TemporaryFileStorageDirectory (0.843380) | DefaultRequestTimeoutSeconds (0.043853) | 0.640000 / 0.080 |
| ALG10 / E0214 | `background task interval` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | BackgroundTaskExecutionIntervalSeconds (0.670820) | AuthenticationServerEndpoint (0.087706) | 0.640000 / 0.080 |
| ALG10 / E0215 | `automatic configuration` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | EnableAutomaticConfigurationReload (0.804400) | AuthenticationServerEndpoint (0.250873) | 0.640000 / 0.080 |
| ALG10 / E0217 | `server endpoint` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | AuthenticationServerEndpoint (0.679366) | ExternalNotificationServiceUrl (0.109109) | 0.640000 / 0.080 |
| ALG10 / E0218 | `application environment` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | ApplicationEnvironmentName (0.912871) | AuthenticationServerEndpoint (0.263117) | 0.640000 / 0.080 |
| ALG10 / E0220 | `timeout seconds` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | DefaultRequestTimeoutSeconds (0.679366) | BackgroundTaskExecutionIntervalSeconds (0.240563) | 0.640000 / 0.080 |
| ALG10 / E0223 | `storage directory` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | TemporaryFileStorageDirectory (0.763323) | DatabaseConnectionString (0.053300) | 0.640000 / 0.080 |
| ALG10 / E0224 | `execution interval` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | BackgroundTaskExecutionIntervalSeconds (0.645497) | AuthenticationServerEndpoint (0.202548) | 0.640000 / 0.080 |
| ALG10 / E0225 | `configuration reload` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | EnableAutomaticConfigurationReload (0.748701) | DatabaseConnectionString (0.155126) | 0.640000 / 0.080 |
| ALG10 / E0226 | `connection string database` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | DatabaseConnectionString (0.909091) | AuthenticationServerEndpoint (0.125436) | 0.640000 / 0.080 |
| ALG10 / E0227 | `endpoint authentication server` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | AuthenticationServerEndpoint (0.923077) | ExternalNotificationServiceUrl (0.333562) | 0.640000 / 0.080 |
| ALG10 / E0228 | `environment application name` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | ApplicationEnvironmentName (0.833333) | AuthenticationServerEndpoint (0.240192) | 0.640000 / 0.080 |
| ALG10 / E0229 | `request maximum concurrent count` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | MaximumConcurrentRequestCount (0.888889) | DefaultRequestTimeoutSeconds (0.226455) | 0.640000 / 0.080 |
| ALG10 / E0230 | `seconds default request timeout` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | DefaultRequestTimeoutSeconds (0.923077) | MaximumConcurrentRequestCount (0.264198) | 0.640000 / 0.080 |
| ALG10 / E0231 | `logging enable detailed error` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | EnableDetailedErrorLogging (0.928571) | EnableAutomaticConfigurationReload (0.129641) | 0.640000 / 0.080 |
| ALG10 / E0232 | `url external notification service` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | ExternalNotificationServiceUrl (0.928571) | AuthenticationServerEndpoint (0.333562) | 0.640000 / 0.080 |
| ALG10 / E0233 | `directory temporary file storage` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | TemporaryFileStorageDirectory (0.935484) | DatabaseConnectionString (0.038292) | 0.640000 / 0.080 |
| ALG10 / E0234 | `seconds background task execution interval` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | BackgroundTaskExecutionIntervalSeconds (0.944444) | DatabaseConnectionString (0.177667) | 0.640000 / 0.080 |
| ALG10 / E0235 | `configuration enable automatic reload` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | EnableAutomaticConfigurationReload (0.882353) | ApplicationEnvironmentName (0.210042) | 0.640000 / 0.080 |
| ALG10 / E0254 | `extertalnotificationserviceurl` | ExternalNotificationServiceUrl | ambiguous: unnecessary rejection | ExternalNotificationServiceUrl (0.892857) | InternalNotificationServiceUrl (0.821429) | 0.640000 / 0.080 |
| ALG10 / E0255 | `apiendpoinqv2` | ApiEndpointV2 | ambiguous: unnecessary rejection | ApiEndpointV1 (0.727273) | ApiEndpointV2 (0.727273) | 0.640000 / 0.080 |
| ALG10 / E0256 | `defaultrequesttimeoutcilliseconds` | DefaultRequestTimeoutMilliseconds | ambiguous: unnecessary rejection | DefaultRequestTimeoutMilliseconds (0.903226) | DefaultRequestTimeoutSeconds (0.845364) | 0.640000 / 0.080 |
| ALG10 / E0297 | `database connection strong password` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | DatabaseConnectionString (0.739574) | ConnectionCount (0.405096) | 0.640000 / 0.080 |
| ALG11 / E0218 | `application environment` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | ApplicationEnvironmentName (0.916667) | AuthenticationServerEndpoint (0.520000) | 0.880000 / 0.040 |
| ALG11 / E0232 | `url external notification service` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | ExternalNotificationServiceUrl (0.900000) | EnableAutomaticConfigurationReload (0.500000) | 0.880000 / 0.040 |
| ALG11 / E0258 | `maximumconcurrentrequestscmunt` | MaximumConcurrentRequestsCount | ambiguous: unnecessary rejection | MaximumConcurrentRequestsCount (0.966667) | MaximumConcurrentRequestCount (0.949153) | 0.880000 / 0.040 |
| ALG11 / E0290 | `maximumconcurrentrequesmscount` | MaximumConcurrentRequestsCount | ambiguous: unnecessary rejection | MaximumConcurrentRequestsCount (0.966667) | MaximumConcurrentRequestCount (0.949153) | 0.880000 / 0.040 |
| ALG11 / E0296 | `default request timeout nanoseconds` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | DefaultRequestTimeoutSeconds (0.933333) | DefaultRequestTimeoutMilliseconds (0.861538) | 0.880000 / 0.040 |
| ALG11 / E0326 | `auth server endpoint` | ambiguous | unknown: safe rejection without ambiguity label | AuthorizationServerEndpoint (0.800000) | AuthenticationServerEndpoint (0.782609) | 0.880000 / 0.040 |
| ALG12 / E0206 | `database connection` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | DatabaseConnectionString (0.720833) | EnableAutomaticConfigurationReload (0.271104) | 0.600000 / 0.080 |
| ALG12 / E0207 | `authentication server` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | AuthenticationServerEndpoint (0.697619) | ExternalNotificationServiceUrl (0.446667) | 0.600000 / 0.080 |
| ALG12 / E0208 | `environment name` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | ApplicationEnvironmentName (0.608333) | AuthenticationServerEndpoint (0.206944) | 0.600000 / 0.080 |
| ALG12 / E0210 | `default request timeout` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | DefaultRequestTimeoutSeconds (0.750000) | MaximumConcurrentRequestCount (0.331724) | 0.600000 / 0.080 |
| ALG12 / E0211 | `detailed error logging` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | EnableDetailedErrorLogging (0.762500) | DatabaseConnectionString (0.333750) | 0.600000 / 0.080 |
| ALG12 / E0213 | `temporary file storage` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | TemporaryFileStorageDirectory (0.710776) | ExternalNotificationServiceUrl (0.210694) | 0.600000 / 0.080 |
| ALG12 / E0216 | `database string` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | DatabaseConnectionString (0.612500) | EnableDetailedErrorLogging (0.270313) | 0.600000 / 0.080 |
| ALG12 / E0218 | `application environment` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | ApplicationEnvironmentName (0.783333) | AuthenticationServerEndpoint (0.444697) | 0.600000 / 0.080 |
| ALG12 / E0232 | `url external notification service` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | ExternalNotificationServiceUrl (0.695000) | DatabaseConnectionString (0.308854) | 0.600000 / 0.080 |
| ALG12 / E0234 | `seconds background task execution interval` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | BackgroundTaskExecutionIntervalSeconds (0.620526) | DatabaseConnectionString (0.284013) | 0.600000 / 0.080 |
| ALG12 / E0252 | `enableautomaticconyigurationreset` | EnableAutomaticConfigurationReset | ambiguous: unnecessary rejection | EnableAutomaticConfigurationReset (0.662121) | EnableAutomaticConfigurationReload (0.586230) | 0.600000 / 0.080 |
| ALG12 / E0253 | `enableautomaticconfigurntionreload` | EnableAutomaticConfigurationReload | ambiguous: unnecessary rejection | EnableAutomaticConfigurationReload (0.661765) | EnableAutomaticConfigurationReset (0.585294) | 0.600000 / 0.080 |
| ALG12 / E0254 | `extertalnotificationserviceurl` | ExternalNotificationServiceUrl | ambiguous: unnecessary rejection | ExternalNotificationServiceUrl (0.663333) | InternalNotificationServiceUrl (0.620000) | 0.600000 / 0.080 |
| ALG12 / E0297 | `database connection strong password` | reject unknown | fuzzy: FALSE UNKNOWN ACCEPTANCE | DatabaseConnectionString (0.715104) | MaximumConnectionCount (0.356771) | 0.600000 / 0.080 |
| ALG12 / E0334 | `connection bound` | ambiguous | fuzzy: UNSAFE AMBIGUOUS ACCEPTANCE | ConnectionCount (0.843333) | ConnectionLimit (0.608333) | 0.600000 / 0.080 |
| ALG12 / E0335 | `io buffer size` | ambiguous | fuzzy: UNSAFE AMBIGUOUS ACCEPTANCE | InputBufferSize (0.733333) | OutputBufferSize (0.639583) | 0.600000 / 0.080 |
| ALG12 / E0344 | `connection bound ` | ambiguous | fuzzy: UNSAFE AMBIGUOUS ACCEPTANCE | ConnectionCount (0.843333) | ConnectionLimit (0.608333) | 0.600000 / 0.080 |
| ALG12 / E0345 | `io buffer size ` | ambiguous | fuzzy: UNSAFE AMBIGUOUS ACCEPTANCE | InputBufferSize (0.733333) | OutputBufferSize (0.639583) | 0.600000 / 0.080 |
| ALG12 / E0354 | `connection bound-` | ambiguous | fuzzy: UNSAFE AMBIGUOUS ACCEPTANCE | ConnectionCount (0.843333) | ConnectionLimit (0.608333) | 0.600000 / 0.080 |
| ALG12 / E0355 | `io buffer size-` | ambiguous | fuzzy: UNSAFE AMBIGUOUS ACCEPTANCE | InputBufferSize (0.733333) | OutputBufferSize (0.639583) | 0.600000 / 0.080 |

### Inputs correctly resolved by fuzzy matching

| Method / ID | Original input | Intended and accepted | Best / runner |
|---|---|---|---|
| ALG01 / E0051 | `database connection strng` | DatabaseConnectionString | 0.958333 / 0.300000 |
| ALG01 / E0052 | `authentication server endpint` | AuthenticationServerEndpoint | 0.964286 / 0.400000 |
| ALG02 / E0051 | `database connection strng` | DatabaseConnectionString | 0.958333 / 0.300000 |
| ALG02 / E0052 | `authentication server endpint` | AuthenticationServerEndpoint | 0.964286 / 0.400000 |
| ALG03 / E0051 | `database connection strng` | DatabaseConnectionString | 0.958333 / 0.300000 |
| ALG03 / E0052 | `authentication server endpint` | AuthenticationServerEndpoint | 0.964286 / 0.400000 |
| ALG04 / E0051 | `database connection strng` | DatabaseConnectionString | 0.958333 / 0.316667 |
| ALG04 / E0052 | `authentication server endpint` | AuthenticationServerEndpoint | 0.964286 / 0.433333 |
| ALG05 / E0051 | `database connection strng` | DatabaseConnectionString | 0.986111 / 0.693641 |
| ALG05 / E0052 | `authentication server endpint` | AuthenticationServerEndpoint | 0.988095 / 0.691005 |
| ALG06 / E0051 | `database connection strng` | DatabaseConnectionString | 0.991667 / 0.693641 |
| ALG06 / E0052 | `authentication server endpint` | AuthenticationServerEndpoint | 0.992857 / 0.691005 |
| ALG07 / E0051 | `database connection strng` | DatabaseConnectionString | 0.978723 / 0.470588 |
| ALG07 / E0052 | `authentication server endpint` | AuthenticationServerEndpoint | 0.981818 / 0.596491 |
| ALG08 / E0051 | `database connection strng` | DatabaseConnectionString | 0.791667 / 0.096154 |
| ALG08 / E0052 | `authentication server endpint` | AuthenticationServerEndpoint | 0.821429 / 0.204545 |
| ALG09 / E0051 | `database connection strng` | DatabaseConnectionString | 0.926829 / 0.333333 |
| ALG09 / E0052 | `authentication server endpint` | AuthenticationServerEndpoint | 0.933333 / 0.416667 |
| ALG10 / E0051 | `database connection strng` | DatabaseConnectionString | 0.883960 / 0.181848 |
| ALG10 / E0052 | `authentication server endpint` | AuthenticationServerEndpoint | 0.902134 / 0.340168 |
| ALG11 / E0051 | `database connection strng` | DatabaseConnectionString | 0.978723 / 0.470588 |
| ALG11 / E0052 | `authentication server endpint` | AuthenticationServerEndpoint | 0.981818 / 0.526316 |
| ALG12 / E0051 | `database connection strng` | DatabaseConnectionString | 0.953472 / 0.274688 |
| ALG12 / E0052 | `authentication server endpint` | AuthenticationServerEndpoint | 0.962202 / 0.360000 |

### Milliseconds typo with a competing seconds property

| Method | Input | Expected | Status | Top / second | Best / runner |
|---|---|---|---|---|---|
| EXACT | `default request timeout miliseconds` | DefaultRequestTimeoutMilliseconds | unknown | (none) / (none) | 0.000000 / 0.000000 |
| ALG01 | `default request timeout miliseconds` | DefaultRequestTimeoutMilliseconds | fuzzy | DefaultRequestTimeoutMilliseconds / DefaultRequestTimeoutSeconds | 0.969697 / 0.875000 |
| ALG02 | `default request timeout miliseconds` | DefaultRequestTimeoutMilliseconds | fuzzy | DefaultRequestTimeoutMilliseconds / DefaultRequestTimeoutSeconds | 0.969697 / 0.875000 |
| ALG03 | `default request timeout miliseconds` | DefaultRequestTimeoutMilliseconds | fuzzy | DefaultRequestTimeoutMilliseconds / DefaultRequestTimeoutSeconds | 0.969697 / 0.875000 |
| ALG04 | `default request timeout miliseconds` | DefaultRequestTimeoutMilliseconds | fuzzy | DefaultRequestTimeoutMilliseconds / DefaultRequestTimeoutSeconds | 0.969697 / 0.875000 |
| ALG05 | `default request timeout miliseconds` | DefaultRequestTimeoutMilliseconds | ambiguous | DefaultRequestTimeoutMilliseconds / DefaultRequestTimeoutSeconds | 0.989899 / 0.958333 |
| ALG06 | `default request timeout miliseconds` | DefaultRequestTimeoutMilliseconds | ambiguous | DefaultRequestTimeoutMilliseconds / DefaultRequestTimeoutSeconds | 0.993939 / 0.975000 |
| ALG07 | `default request timeout miliseconds` | DefaultRequestTimeoutMilliseconds | fuzzy | DefaultRequestTimeoutMilliseconds / DefaultRequestTimeoutSeconds | 0.984615 / 0.933333 |
| ALG08 | `default request timeout miliseconds` | DefaultRequestTimeoutMilliseconds | fuzzy | DefaultRequestTimeoutMilliseconds / DefaultRequestTimeoutSeconds | 0.906250 / 0.750000 |
| ALG09 | `default request timeout miliseconds` | DefaultRequestTimeoutMilliseconds | fuzzy | DefaultRequestTimeoutMilliseconds / DefaultRequestTimeoutSeconds | 0.984127 / 0.896552 |
| ALG10 | `default request timeout miliseconds` | DefaultRequestTimeoutMilliseconds | fuzzy | DefaultRequestTimeoutMilliseconds / DefaultRequestTimeoutSeconds | 0.950947 / 0.859338 |
| ALG11 | `default request timeout miliseconds` | DefaultRequestTimeoutMilliseconds | fuzzy | DefaultRequestTimeoutMilliseconds / DefaultRequestTimeoutSeconds | 0.984615 / 0.933333 |
| ALG12 | `default request timeout miliseconds` | DefaultRequestTimeoutMilliseconds | fuzzy | DefaultRequestTimeoutMilliseconds / DefaultRequestTimeoutSeconds | 0.973011 / 0.886932 |

## 9. Calibrated thresholds and sensitivity checks

| Method | Minimum score | Minimum margin | Maximum edits | Calibration cost |
|---|---:|---:|---:|---:|
| EXACT | 0.500000 | 0.000 | -1 | 120 |
| ALG01 | 0.880000 | 0.040 | -1 | 0 |
| ALG02 | 0.880000 | 0.040 | -1 | 0 |
| ALG03 | 0.880000 | 0.040 | -1 | 0 |
| ALG04 | 0.900000 | 0.040 | -1 | 0 |
| ALG05 | 0.840000 | 0.080 | -1 | 18 |
| ALG06 | 0.960000 | 0.020 | -1 | 36 |
| ALG07 | 0.880000 | 0.040 | -1 | 0 |
| ALG08 | 0.520000 | 0.120 | -1 | 19 |
| ALG09 | 0.780000 | 0.080 | -1 | 14 |
| ALG10 | 0.640000 | 0.080 | -1 | 19 |
| ALG11 | 0.880000 | 0.040 | -1 | 0 |
| ALG12 | 0.600000 | 0.080 | -1 | 32 |

`reports/calibration_grid.csv` preserves every tested threshold/margin/cap combination, calibration fuzzy recoveries, dangerous counts, coverage and weighted cost. These points permit independent precision/coverage inspection. To show the effect of relaxing or tightening the frozen decision threshold, the following calibration-only probes hold margin and edit cap fixed. They do not retune on the held-out cases.

| Method | Threshold offset | Score threshold | Correct fuzzy | Dangerous | Rejected | Coverage % |
|---|---:|---:|---:|---:|---:|---:|
| ALG01 | -0.04 | 0.840000 | 120 | 0 | 0 | 100.00 |
| ALG01 | +0.00 | 0.880000 | 120 | 0 | 0 | 100.00 |
| ALG01 | +0.04 | 0.920000 | 78 | 0 | 42 | 69.12 |
| ALG02 | -0.04 | 0.840000 | 120 | 0 | 0 | 100.00 |
| ALG02 | +0.00 | 0.880000 | 120 | 0 | 0 | 100.00 |
| ALG02 | +0.04 | 0.920000 | 99 | 0 | 21 | 84.56 |
| ALG03 | -0.04 | 0.840000 | 120 | 0 | 0 | 100.00 |
| ALG03 | +0.00 | 0.880000 | 120 | 0 | 0 | 100.00 |
| ALG03 | +0.04 | 0.920000 | 99 | 0 | 21 | 84.56 |
| ALG04 | -0.04 | 0.860000 | 120 | 0 | 0 | 100.00 |
| ALG04 | +0.00 | 0.900000 | 120 | 0 | 0 | 100.00 |
| ALG04 | +0.04 | 0.940000 | 78 | 0 | 42 | 69.12 |
| ALG05 | -0.04 | 0.800000 | 102 | 0 | 18 | 86.76 |
| ALG05 | +0.00 | 0.840000 | 102 | 0 | 18 | 86.76 |
| ALG05 | +0.04 | 0.880000 | 95 | 0 | 25 | 81.62 |
| ALG06 | -0.04 | 0.920000 | 113 | 9 | 7 | 94.85 |
| ALG06 | +0.00 | 0.960000 | 84 | 0 | 36 | 73.53 |
| ALG06 | +0.04 | 1.000000 | 0 | 0 | 120 | 11.76 |
| ALG07 | -0.04 | 0.840000 | 120 | 3 | 0 | 100.00 |
| ALG07 | +0.00 | 0.880000 | 120 | 0 | 0 | 100.00 |
| ALG07 | +0.04 | 0.920000 | 99 | 0 | 21 | 84.56 |
| ALG08 | -0.04 | 0.480000 | 101 | 0 | 19 | 86.03 |
| ALG08 | +0.00 | 0.520000 | 101 | 0 | 19 | 86.03 |
| ALG08 | +0.04 | 0.560000 | 90 | 0 | 30 | 77.94 |
| ALG09 | -0.04 | 0.740000 | 106 | 0 | 14 | 89.71 |
| ALG09 | +0.00 | 0.780000 | 106 | 0 | 14 | 89.71 |
| ALG09 | +0.04 | 0.820000 | 99 | 0 | 21 | 84.56 |
| ALG10 | -0.04 | 0.600000 | 101 | 0 | 19 | 86.03 |
| ALG10 | +0.00 | 0.640000 | 101 | 0 | 19 | 86.03 |
| ALG10 | +0.04 | 0.680000 | 100 | 0 | 20 | 85.29 |
| ALG11 | -0.04 | 0.840000 | 120 | 3 | 0 | 100.00 |
| ALG11 | +0.00 | 0.880000 | 120 | 0 | 0 | 100.00 |
| ALG11 | +0.04 | 0.920000 | 99 | 0 | 21 | 84.56 |
| ALG12 | -0.04 | 0.560000 | 88 | 0 | 32 | 76.47 |
| ALG12 | +0.00 | 0.600000 | 88 | 0 | 32 | 76.47 |
| ALG12 | +0.04 | 0.640000 | 63 | 0 | 57 | 58.09 |

## 10. Safety-first algorithm ranking

The exact baseline is reported separately and is the safest automatic policy whenever fuzzy methods have dangerous accepts. Among the twelve fuzzy methods, the primary ranking sorts dangerous acceptances ascending, correct fuzzy recoveries descending, then 10-property median runtime ascending. Runtime is only a tiebreaker. Balanced ranking minimizes the explicit weighted cost, then uses the primary criteria. Performance eligibility requires the minimum observed dangerous count among fuzzy methods and at least one correct fuzzy recovery. This requirement is empirical and does not certify safety.

| Safety rank | Method | Dangerous | Correct fuzzy | Weighted cost | 10-property median us |
|---|---|---:|---:|---:|---:|
| 1 | ALG01 | 0 | 174 | 11 | 61.653 |
| 2 | ALG03 | 0 | 174 | 11 | 70.909 |
| 3 | ALG02 | 0 | 174 | 11 | 71.180 |
| 4 | ALG04 | 0 | 174 | 11 | 329.929 |
| 5 | ALG06 | 1 | 126 | 159 | 18.873 |
| 6 | ALG07 | 3 | 174 | 311 | 13.258 |
| 7 | ALG11 | 3 | 174 | 311 | 23.003 |
| 8 | ALG05 | 13 | 159 | 1326 | 19.805 |
| 9 | ALG12 | 17 | 165 | 1720 | 173.965 |
| 10 | ALG08 | 22 | 163 | 2222 | 14.735 |
| 11 | ALG09 | 24 | 166 | 2419 | 15.028 |
| 12 | ALG10 | 26 | 164 | 2621 | 15.100 |

Safety-focused: **Levenshtein**. Balanced: **Levenshtein**. Performance-focused among methods meeting the stated safety requirement: **Levenshtein**.

## 11. Recommended matching policy and deployment limits

For the original configuration use case, **Levenshtein** with minimum score 0.880000, minimum margin 0.040 and maximum edits -1 is the strongest fuzzy choice from this run. Keep exact normalized matching first, preserve all rejections, and surface the top suggestions for manual correction. This recommendation follows the safety-first ordering; the separate balanced choice is Levenshtein.

On the original ten-property schema this policy recovered 131 fuzzy inputs, accepted 45 normalized exact inputs, made 0 dangerous assignments and rejected 0 intended targets. Expanded-schema behavior is shown separately in Section 7. Synthetic large-registry timings measure computational scaling only; they do not establish matching safety at 1000 real properties.

Use explicit reviewed aliases for semantic synonyms and stable abbreviations. Recalibrate on representative development data when the schema or typo population changes, then evaluate on a fresh untouched hold-out. For unit, security or destructive settings, consider suggestion-only correction or an explicit confirmation step before applying a fuzzy match. Reject duplicate resolved names, invalid values, normalization collisions and missing required values.

## 12. Limitations and future improvements

This is a finite, partly generated English/ASCII dataset. Calibration uses disjoint vocabulary and may transfer poorly; mutation patterns still overlap by design. The five already-correct original examples are in the formatting group; the five misspelled originals are in the deletion group. The ambiguity group includes formatting variants of ten semantic phrases and therefore has fewer independent semantic families than raw cases. Safety outcomes depend on these application-defined labels. No aliases or value-aware rules are evaluated.

Short identifiers and 128-byte near-identical names stress policies trained mostly on longer calibration names. Threshold grids are finite and might miss useful operating points. Exact normalization cannot detect a user's semantic mistake that spells another canonical name correctly. Digits have higher cost only in the documented weighted variant; other methods treat them like letters. Unicode, locale-sensitive case folding, sections, escaping and full INI syntax are outside this baseline.

Timing uses one shared host, a small probe set and finite repetitions; OS scheduling, CPU frequency and timer overhead add variance. Latency distributions are descriptive; tail estimates from a small sample are especially unstable. No real-application 1000-property accuracy claim follows from synthetic scaling tests. Workspace values are source-derived bounds, not observed RSS. Further work should add independently authored schemas, naturally occurring errors, family-aware resampling, more process-level timing repetitions, allocation/RSS instrumentation, optional reviewed aliases and deployment-specific severity weights.

## Reproduction and evidence

Run `make`, `make test`, `make sanitize`, then `make benchmark` from the project directory. The default manifests use seed 42. For another seed run `./property_match_bench --generate --seed N`, then `./property_match_bench --benchmark --seed N`; this explicitly replaces the manifests. Preserve them with the report. `--wrong-cost` and `--reject-cost` change policy selection and weighted rankings.

The baseline and every fuzzy method are evaluated on identical held-out inputs. `reports/results.csv` (or the supplied --csv path) contains individual classifications, thresholds and suggestions; `reports/summary.csv` contains aggregate counts; `reports/runtime.csv` contains timing data; and `reports/calibration_grid.csv` contains calibration evidence. The benchmark aborts if correctness tests or dataset validation fail, preventing invalid implementations from entering rankings.

<!-- measured-summary:start -->
## 13. Algorithm behavior linked to the source

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
<!-- measured-summary:end -->
