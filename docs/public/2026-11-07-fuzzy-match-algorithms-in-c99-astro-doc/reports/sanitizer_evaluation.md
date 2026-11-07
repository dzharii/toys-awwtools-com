# C99 fuzzy configuration property matching benchmark

## 1. Matching results and selected policies

The safety-first choice from this run is **Levenshtein**. It recovered 174 of 185 misspelled names and made 0 unsafe automatic assignments. Formatting variants use the shared exact-normalized stage before any fuzzy calculation.

The implementation articles connect these measurements to real input strings. See [measured algorithm tradeoffs](docs/measured-results.md) for a concise comparison.

Selection is specific to these labels and frozen policies. Rejecting inputs is preferable to silently assigning values to the wrong operational setting. Zero observed dangerous errors is finite-sample evidence, not a correctness guarantee.

## 2. Compiler, platform and benchmark settings

| Field | Recorded value |
|---|---|
| Execution (UTC) | 2026-11-07T19:26:52Z |
| Dataset split | 184 calibration; 380 held-out cases |
| OS / kernel | Linux 6.18.57 |
| Architecture | x86_64 |
| GCC | 13.3.0 |
| C standard | C99; __STDC_VERSION__=199901 |
| Actual flags | `-O1 address,undefined` |
| Timer | POSIX CLOCK_MONOTONIC elapsed nanoseconds; clock() CPU fallback on non-POSIX builds |
| Repetitions | 1; 12 queries per repetition per size and path |
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
| EXACT | 10 | resolve | 0.013 | 1.053 | 1.016 | 1.204 | 1.204 | 949442 | 1.053 | 1.053-1.053 |
| EXACT | 10 | score | 0.001 | 0.081 | 0.073 | 0.144 | 0.144 | 12320329 | 0.081 | 0.081-0.081 |
| EXACT | 50 | resolve | 0.019 | 1.582 | 1.562 | 1.796 | 1.796 | 631945 | 1.582 | 1.582-1.582 |
| EXACT | 50 | score | 0.002 | 0.154 | 0.142 | 0.236 | 0.236 | 6486486 | 0.154 | 0.154-0.154 |
| EXACT | 100 | resolve | 0.027 | 2.252 | 2.221 | 2.513 | 2.513 | 444050 | 2.252 | 2.252-2.252 |
| EXACT | 100 | score | 0.003 | 0.264 | 0.254 | 0.330 | 0.330 | 3792668 | 0.264 | 0.264-0.264 |
| EXACT | 1000 | resolve | 0.166 | 13.810 | 13.764 | 14.861 | 14.861 | 72411 | 13.810 | 13.810-13.810 |
| EXACT | 1000 | score | 0.023 | 1.921 | 1.911 | 1.952 | 1.952 | 520540 | 1.921 | 1.921-1.921 |
| ALG01 | 10 | resolve | 1.510 | 125.826 | 119.264 | 200.472 | 200.472 | 7947 | 125.826 | 125.826-125.826 |
| ALG01 | 10 | score | 1.408 | 117.366 | 109.344 | 142.645 | 142.645 | 8520 | 117.366 | 117.366-117.366 |
| ALG01 | 50 | resolve | 10.934 | 911.165 | 860.552 | 1499.078 | 1499.078 | 1097 | 911.165 | 911.165-911.165 |
| ALG01 | 50 | score | 10.175 | 847.947 | 828.939 | 1111.257 | 1111.257 | 1179 | 847.947 | 847.947-847.947 |
| ALG01 | 100 | resolve | 22.180 | 1848.330 | 1866.519 | 2612.315 | 2612.315 | 541 | 1848.330 | 1848.330-1848.330 |
| ALG01 | 100 | score | 17.988 | 1498.998 | 1381.457 | 2112.368 | 2112.368 | 667 | 1498.998 | 1498.998-1498.998 |
| ALG01 | 1000 | resolve | 202.873 | 16906.098 | 16104.888 | 23253.256 | 23253.256 | 59 | 16906.098 | 16906.098-16906.098 |
| ALG01 | 1000 | score | 199.738 | 16644.854 | 16078.183 | 21339.853 | 21339.853 | 60 | 16644.854 | 16644.854-16644.854 |
| ALG02 | 10 | resolve | 1.610 | 134.134 | 131.362 | 179.287 | 179.287 | 7455 | 134.134 | 134.134-134.134 |
| ALG02 | 10 | score | 1.496 | 124.666 | 123.909 | 150.768 | 150.768 | 8021 | 124.666 | 124.666-124.666 |
| ALG02 | 50 | resolve | 10.121 | 843.453 | 814.453 | 1420.990 | 1420.990 | 1186 | 843.453 | 843.453-843.453 |
| ALG02 | 50 | score | 10.560 | 880.015 | 880.100 | 1135.049 | 1135.049 | 1136 | 880.015 | 880.015-880.015 |
| ALG02 | 100 | resolve | 20.748 | 1728.976 | 1609.343 | 2289.827 | 2289.827 | 578 | 1728.976 | 1728.976-1728.976 |
| ALG02 | 100 | score | 19.842 | 1653.534 | 1599.359 | 2104.099 | 2104.099 | 605 | 1653.534 | 1653.534-1653.534 |
| ALG02 | 1000 | resolve | 219.707 | 18308.884 | 16502.832 | 28672.282 | 28672.282 | 55 | 18308.884 | 18308.884-18308.884 |
| ALG02 | 1000 | score | 213.680 | 17806.643 | 17021.441 | 23599.243 | 23599.243 | 56 | 17806.643 | 17806.643-17806.643 |
| ALG03 | 10 | resolve | 1.991 | 165.911 | 156.630 | 218.921 | 218.921 | 6027 | 165.911 | 165.911-165.911 |
| ALG03 | 10 | score | 1.952 | 162.665 | 155.317 | 202.918 | 202.918 | 6148 | 162.665 | 162.665-162.665 |
| ALG03 | 50 | resolve | 13.221 | 1101.762 | 1104.672 | 1286.468 | 1286.468 | 908 | 1101.762 | 1101.762-1101.762 |
| ALG03 | 50 | score | 14.209 | 1184.083 | 963.812 | 2082.331 | 2082.331 | 845 | 1184.083 | 1184.083-1184.083 |
| ALG03 | 100 | resolve | 29.872 | 2489.333 | 2201.595 | 4669.744 | 4669.744 | 402 | 2489.333 | 2489.333-2489.333 |
| ALG03 | 100 | score | 28.134 | 2344.536 | 2112.272 | 3567.455 | 3567.455 | 427 | 2344.536 | 2344.536-2344.536 |
| ALG03 | 1000 | resolve | 289.906 | 24158.813 | 23333.436 | 31076.181 | 31076.181 | 41 | 24158.813 | 24158.813-24158.813 |
| ALG03 | 1000 | score | 292.786 | 24398.870 | 23299.660 | 32047.134 | 32047.134 | 41 | 24398.870 | 24398.870-24398.870 |
| ALG04 | 10 | resolve | 15.019 | 1251.587 | 1195.043 | 1787.489 | 1787.489 | 799 | 1251.587 | 1251.587-1251.587 |
| ALG04 | 10 | score | 13.872 | 1156.037 | 1077.797 | 1565.093 | 1565.093 | 865 | 1156.037 | 1156.037-1156.037 |
| ALG04 | 50 | resolve | 83.338 | 6944.865 | 6862.203 | 8794.449 | 8794.449 | 144 | 6944.865 | 6944.865-6944.865 |
| ALG04 | 50 | score | 87.576 | 7298.032 | 6968.730 | 12218.468 | 12218.468 | 137 | 7298.032 | 7298.032-7298.032 |
| ALG04 | 100 | resolve | 178.666 | 14888.871 | 14631.986 | 18994.267 | 18994.267 | 67 | 14888.871 | 14888.871-14888.871 |
| ALG04 | 100 | score | 170.437 | 14203.118 | 13752.364 | 17556.939 | 17556.939 | 70 | 14203.118 | 14203.118-14203.118 |
| ALG04 | 1000 | resolve | 1788.349 | 149029.071 | 138673.899 | 182801.794 | 182801.794 | 7 | 149029.071 | 149029.071-149029.071 |
| ALG04 | 1000 | score | 1760.649 | 146720.717 | 139826.347 | 182335.554 | 182335.554 | 7 | 146720.717 | 146720.717-146720.717 |
| ALG05 | 10 | resolve | 0.382 | 31.860 | 31.334 | 56.598 | 56.598 | 31387 | 31.860 | 31.860-31.860 |
| ALG05 | 10 | score | 0.328 | 27.331 | 28.061 | 33.380 | 33.380 | 36589 | 27.331 | 27.331-27.331 |
| ALG05 | 50 | resolve | 1.452 | 120.974 | 114.257 | 173.945 | 173.945 | 8266 | 120.974 | 120.974-120.974 |
| ALG05 | 50 | score | 1.454 | 121.206 | 111.320 | 199.940 | 199.940 | 8250 | 121.206 | 121.206-121.206 |
| ALG05 | 100 | resolve | 3.078 | 256.533 | 229.505 | 562.691 | 562.691 | 3898 | 256.533 | 256.533-256.533 |
| ALG05 | 100 | score | 2.405 | 200.375 | 201.577 | 258.413 | 258.413 | 4991 | 200.375 | 200.375-200.375 |
| ALG05 | 1000 | resolve | 33.226 | 2768.839 | 2267.820 | 5496.941 | 5496.941 | 361 | 2768.839 | 2768.839-2768.839 |
| ALG05 | 1000 | score | 23.143 | 1928.543 | 1862.062 | 2303.291 | 2303.291 | 519 | 1928.543 | 1928.543-1928.543 |
| ALG06 | 10 | resolve | 0.359 | 29.939 | 30.582 | 34.070 | 34.070 | 33401 | 29.939 | 29.939-29.939 |
| ALG06 | 10 | score | 0.351 | 29.265 | 29.099 | 48.582 | 48.582 | 34170 | 29.265 | 29.265-29.265 |
| ALG06 | 50 | resolve | 1.857 | 154.765 | 131.109 | 342.241 | 342.241 | 6461 | 154.765 | 154.765-154.765 |
| ALG06 | 50 | score | 1.908 | 159.031 | 138.808 | 293.427 | 293.427 | 6288 | 159.031 | 159.031-159.031 |
| ALG06 | 100 | resolve | 2.752 | 229.302 | 221.767 | 322.697 | 322.697 | 4361 | 229.302 | 229.302-229.302 |
| ALG06 | 100 | score | 2.496 | 207.975 | 202.106 | 252.001 | 252.001 | 4808 | 207.975 | 207.975-207.975 |
| ALG06 | 1000 | resolve | 25.411 | 2117.556 | 2028.533 | 2715.296 | 2715.296 | 472 | 2117.556 | 2117.556-2117.556 |
| ALG06 | 1000 | score | 25.233 | 2102.780 | 1930.770 | 3257.324 | 3257.324 | 476 | 2102.780 | 2102.780-2102.780 |
| ALG07 | 10 | resolve | 0.765 | 63.763 | 59.322 | 85.458 | 85.458 | 15683 | 63.763 | 63.763-63.763 |
| ALG07 | 10 | score | 0.742 | 61.811 | 57.666 | 89.316 | 89.316 | 16178 | 61.811 | 61.811-61.811 |
| ALG07 | 50 | resolve | 5.515 | 459.613 | 377.163 | 1236.307 | 1236.307 | 2176 | 459.613 | 459.613-459.613 |
| ALG07 | 50 | score | 5.056 | 421.336 | 417.221 | 634.548 | 634.548 | 2373 | 421.336 | 421.336-421.336 |
| ALG07 | 100 | resolve | 9.822 | 818.479 | 806.476 | 1025.934 | 1025.934 | 1222 | 818.479 | 818.479-818.479 |
| ALG07 | 100 | score | 10.033 | 836.104 | 793.457 | 1168.221 | 1168.221 | 1196 | 836.104 | 836.104-836.104 |
| ALG07 | 1000 | resolve | 103.333 | 8611.106 | 8154.229 | 11809.779 | 11809.779 | 116 | 8611.106 | 8611.106-8611.106 |
| ALG07 | 1000 | score | 106.816 | 8901.296 | 8569.475 | 11971.093 | 11971.093 | 112 | 8901.296 | 8901.296-8901.296 |
| ALG08 | 10 | resolve | 0.366 | 30.537 | 28.474 | 49.826 | 49.826 | 32748 | 30.537 | 30.537-30.537 |
| ALG08 | 10 | score | 0.400 | 33.294 | 27.326 | 92.293 | 92.293 | 30035 | 33.294 | 33.294-33.294 |
| ALG08 | 50 | resolve | 2.015 | 167.951 | 162.345 | 250.526 | 250.526 | 5954 | 167.951 | 167.951-167.951 |
| ALG08 | 50 | score | 2.021 | 168.449 | 155.120 | 229.781 | 229.781 | 5937 | 168.449 | 168.449-168.449 |
| ALG08 | 100 | resolve | 5.114 | 426.201 | 351.780 | 1113.525 | 1113.525 | 2346 | 426.201 | 426.201-426.201 |
| ALG08 | 100 | score | 4.118 | 343.148 | 322.802 | 618.851 | 618.851 | 2914 | 343.148 | 343.148-343.148 |
| ALG08 | 1000 | resolve | 43.208 | 3600.699 | 3354.007 | 5022.048 | 5022.048 | 278 | 3600.699 | 3600.699-3600.699 |
| ALG08 | 1000 | score | 43.850 | 3654.147 | 3416.191 | 4584.754 | 4584.754 | 274 | 3654.147 | 3654.147-3654.147 |
| ALG09 | 10 | resolve | 0.368 | 30.708 | 28.497 | 49.224 | 49.224 | 32565 | 30.708 | 30.708-30.708 |
| ALG09 | 10 | score | 0.463 | 38.617 | 28.215 | 134.896 | 134.896 | 25895 | 38.617 | 38.617-38.617 |
| ALG09 | 50 | resolve | 1.874 | 156.149 | 152.760 | 188.389 | 188.389 | 6404 | 156.149 | 156.149-156.149 |
| ALG09 | 50 | score | 1.917 | 159.738 | 154.181 | 227.637 | 227.637 | 6260 | 159.738 | 159.738-159.738 |
| ALG09 | 100 | resolve | 4.097 | 341.421 | 344.245 | 382.207 | 382.207 | 2929 | 341.421 | 341.421-341.421 |
| ALG09 | 100 | score | 3.940 | 328.349 | 316.957 | 420.239 | 420.239 | 3046 | 328.349 | 328.349-328.349 |
| ALG09 | 1000 | resolve | 46.584 | 3882.025 | 3866.506 | 5583.670 | 5583.670 | 258 | 3882.025 | 3882.025-3882.025 |
| ALG09 | 1000 | score | 42.101 | 3508.411 | 3548.437 | 4479.639 | 4479.639 | 285 | 3508.411 | 3508.411-3508.411 |
| ALG10 | 10 | resolve | 0.349 | 29.083 | 28.603 | 32.739 | 32.739 | 34384 | 29.083 | 29.083-29.083 |
| ALG10 | 10 | score | 0.334 | 27.861 | 27.032 | 35.740 | 35.740 | 35893 | 27.861 | 27.861-27.861 |
| ALG10 | 50 | resolve | 2.110 | 175.838 | 171.082 | 248.566 | 248.566 | 5687 | 175.838 | 175.838-175.838 |
| ALG10 | 50 | score | 2.177 | 181.382 | 164.076 | 279.156 | 279.156 | 5513 | 181.382 | 181.382-181.382 |
| ALG10 | 100 | resolve | 4.479 | 373.279 | 346.102 | 582.185 | 582.185 | 2679 | 373.279 | 373.279-373.279 |
| ALG10 | 100 | score | 4.234 | 352.836 | 338.817 | 529.085 | 529.085 | 2834 | 352.836 | 352.836-352.836 |
| ALG10 | 1000 | resolve | 45.621 | 3801.749 | 3680.943 | 5319.947 | 5319.947 | 263 | 3801.749 | 3801.749-3801.749 |
| ALG10 | 1000 | score | 43.757 | 3646.409 | 3594.256 | 4554.266 | 4554.266 | 274 | 3646.409 | 3646.409-3646.409 |
| ALG11 | 10 | resolve | 1.120 | 93.355 | 90.925 | 131.542 | 131.542 | 10712 | 93.355 | 93.355-93.355 |
| ALG11 | 10 | score | 1.246 | 103.847 | 94.207 | 201.812 | 201.812 | 9630 | 103.847 | 103.847-103.847 |
| ALG11 | 50 | resolve | 7.130 | 594.144 | 587.495 | 769.249 | 769.249 | 1683 | 594.144 | 594.144-594.144 |
| ALG11 | 50 | score | 7.074 | 589.490 | 603.196 | 967.409 | 967.409 | 1696 | 589.490 | 589.490-589.490 |
| ALG11 | 100 | resolve | 12.460 | 1038.322 | 1093.943 | 1435.433 | 1435.433 | 963 | 1038.322 | 1038.322-1038.322 |
| ALG11 | 100 | score | 14.110 | 1175.864 | 1251.749 | 1460.618 | 1460.618 | 850 | 1175.864 | 1175.864-1175.864 |
| ALG11 | 1000 | resolve | 268.821 | 22401.757 | 15312.055 | 101527.295 | 101527.295 | 45 | 22401.757 | 22401.757-22401.757 |
| ALG11 | 1000 | score | 250.114 | 20842.826 | 12487.240 | 112926.407 | 112926.407 | 48 | 20842.826 | 20842.826-20842.826 |
| ALG12 | 10 | resolve | 2.915 | 242.891 | 238.716 | 303.508 | 303.508 | 4117 | 242.891 | 242.891-242.891 |
| ALG12 | 10 | score | 4.340 | 361.703 | 369.011 | 547.593 | 547.593 | 2765 | 361.703 | 361.703-361.703 |
| ALG12 | 50 | resolve | 20.035 | 1669.571 | 1508.350 | 2583.703 | 2583.703 | 599 | 1669.571 | 1669.571-1669.571 |
| ALG12 | 50 | score | 27.442 | 2286.821 | 2045.749 | 4308.972 | 4308.972 | 437 | 2286.821 | 2286.821-2286.821 |
| ALG12 | 100 | resolve | 55.721 | 4643.383 | 3558.703 | 14418.406 | 14418.406 | 215 | 4643.383 | 4643.383-4643.383 |
| ALG12 | 100 | score | 42.995 | 3582.892 | 3494.593 | 4660.501 | 4660.501 | 279 | 3582.892 | 3582.892-3582.892 |
| ALG12 | 1000 | resolve | 526.520 | 43876.700 | 41836.491 | 62771.424 | 62771.424 | 23 | 43876.700 | 43876.700-43876.700 |
| ALG12 | 1000 | score | 616.379 | 51364.951 | 43154.215 | 102743.768 | 102743.768 | 19 | 51364.951 | 51364.951-51364.951 |

| Properties | Candidate preprocessing ms (first method) | Name preparation us | Prepared registry bytes |
|---|---:|---:|---:|
| 10 | 0.027 | 0.835 | 44080 |
| 50 | 0.180 | 1.055 | 220400 |
| 100 | 0.343 | 0.943 | 440800 |
| 1000 | 15.057 | 0.926 | 4408000 |

Every method also needs a 4272-byte Prepared query; resolver loop locals are small. Scoring workspace estimates above exclude the cached registry/query. There are zero matching-path heap allocations. The benchmark allocates 0 KiB of sample storage at 1 repetitions. Peak resident process memory is unavailable: it is not instrumented; the process also holds manifests, evaluation records and calibration score caches.

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
| 1 | ALG01 | 0 | 174 | 11 | 119.264 |
| 2 | ALG02 | 0 | 174 | 11 | 131.362 |
| 3 | ALG03 | 0 | 174 | 11 | 156.630 |
| 4 | ALG04 | 0 | 174 | 11 | 1195.043 |
| 5 | ALG06 | 1 | 126 | 159 | 30.582 |
| 6 | ALG07 | 3 | 174 | 311 | 59.322 |
| 7 | ALG11 | 3 | 174 | 311 | 90.925 |
| 8 | ALG05 | 13 | 159 | 1326 | 31.334 |
| 9 | ALG12 | 17 | 165 | 1720 | 238.716 |
| 10 | ALG08 | 22 | 163 | 2222 | 28.474 |
| 11 | ALG09 | 24 | 166 | 2419 | 28.497 |
| 12 | ALG10 | 26 | 164 | 2621 | 28.603 |

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
