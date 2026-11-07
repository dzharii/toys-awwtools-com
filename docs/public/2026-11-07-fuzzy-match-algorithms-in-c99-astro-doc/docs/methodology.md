# Calibration, held-out evaluation and timing methods

## Parser, normalizer and binder behavior

A name is parsed independently of its value. The first equals sign is the delimiter; ASCII outer whitespace is trimmed, internal characters remain literal, and oversize keys/values/lines are errors. Syntactically valid unknown keys are resolver outcomes, not parser failures. Parsed values remain strings until binding.

Names allow ASCII letters, digits, underscore, hyphen and ASCII whitespace. Normalization removes separators and folds uppercase. Punctuation and non-ASCII input are rejected rather than silently discarded. Empty normalized names, more than 32 tokens and raw keys beyond 128 bytes are unsupported. A single schema normalization collision invalidates every lookup against that schema. Required-property checks, typed values, duplicate detection and atomic application are separate from name-quality evaluation.

## Dataset counts and label definitions

The two checked-in manifests define the experiment. Version v2 corrects an audited label: a plausible milliseconds typo was incorrectly labeled unknown in the initial draft, so it was replaced with the explicitly unregistered nanoseconds unit. The requested request-cnt abbreviation was also added as a target-labeled partial case. No calibration labels, scorer rules, search grid or policy selection criteria changed; all delivered evidence is rerun on v2. Default seed 42 drives xorshift32; seed zero maps to a fixed nonzero state. The runtime generator is C99 and exists solely for explicit `--generate` calls. A normal benchmark reads preserved rows, validates schemas/outcomes/category minima, ensures unique IDs and raw input/schema combinations, rejects accidental matches to another property and checks that calibration families and schemas are disjoint from held-out data. Runtime FNV-1a fingerprints identify the actual manifest bytes.

Calibration contains sixteen canonical formatting cases, 120 mutations, 24 unknowns and 24 ambiguous phrases, totaling 184. Its vocabulary is deliberately separate from the original/adversarial schema. This prevents near-identical name families from leaking across splits, while testing the transfer of algorithm-specific thresholds. The expected outcome is assigned from construction and application meaning, not from score equality.

The 380 evaluation cases have this exact distribution:

| Category | Count |
|---|---:|
| Exact canonical | 20 |
| Case/space/separators | 30 |
| Deletion | 25 |
| Insertion | 25 |
| Substitution | 25 |
| Adjacent transposition | 25 |
| Multiple errors | 30 |
| Punctuation/token boundaries | 25 |
| Missing words/partial | 20 |
| Reordered/semantic alternatives | 20 |
| Near-collision/adversarial | 45 |
| Unknown | 35 |
| Ambiguous | 30 |
| Short/long boundaries | 25 |

Ten original examples are present: the five exact-normalized examples occur in formatting cases and the five misspellings are curated deletion cases. The milliseconds typo is an explicit adversarial case. Unsupported punctuation and a normalization-collision registry have expected-invalid labels. Missing words and semantic aliases are conservatively labeled unknown; ambiguous phrases identify multiple plausible active properties. There is no automatic alias table.

The ambiguity cases use ten phrases with three surface formats, so the raw case count is larger than the independent semantic-family count. Generated mutation families are clustered. Some long boundary names are intentionally artificial. These facts limit statistical inference; no claim of natural typo prevalence is made.

## Threshold and margin calibration before evaluation

Policies are minimum score, minimum top-two margin and an optional maximum edit cost. Fuzzy equal scores always reject. A low absolute score is unknown; adequate score plus insufficient margin is ambiguous. Maximum edit cost applies only to the four edit methods. Exact matches bypass all fuzzy rules.

Thresholds are 0.50..1.00 in 0.02 increments plus 1.000001; margins are 0, .01, .02, .04, .08, .12, .20; edit caps are unlimited, 1, 2 and 3. Grid size is 756 per edit method and 189 per other fuzzy method. Calibration minimizes `wrong_cost * dangerous_accepts + reject_cost * unnecessary_target_rejections`. Ties prefer larger threshold then larger margin; remaining ties retain the first cap. Defaults are 100 and 1. Policy selection completes for every method before held-out evaluation begins.

The complete calibration grid is preserved. The report also evaluates +/-0.04 threshold changes on calibration data with other parameters fixed. It does not use held-out errors to choose new policies. Changing costs, schemas or generated manifests creates a new experiment and should be followed by fresh held-out data for deployment decisions.

## Outcome counts, error costs and ranking rules

Correct exact, correct fuzzy, wrong-target acceptance, unknown acceptance, ambiguous acceptance, unnecessary rejection, unknown rejection, correct ambiguity diagnosis and safe ambiguity-as-unknown are disjoint counts. Expected-invalid inputs and schemas are counted separately. All thirteen methods see the same 380 cases. Per-case failure means failure to meet the exact expected diagnostic; safe ambiguity-as-unknown is therefore a diagnostic failure with zero safety penalty.

Fuzzy precision is correct fuzzy accepts divided by correct fuzzy plus wrong-target accepts; it excludes unknown/ambiguous false accepts, so acceptance purity and severe-error counts accompany it. Fuzzy recall divides by target-labeled inputs lacking an exact normalized match. Target coverage includes exact and fuzzy correct results over all target-labeled cases. A method with no fuzzy accepts has undefined fuzzy precision, printed N/A.

Primary fuzzy ranking minimizes dangerous acceptance counts, then maximizes correct fuzzy recoveries, then minimizes ten-property median runtime. Balanced ranking first minimizes weighted cost. The performance choice must have the minimum observed fuzzy-method dangerous count and recover at least one fuzzy input. The exact baseline remains separate; when every fuzzy method has dangerous accepts, it provides the more conservative automatic policy.

A Wilson 95% interval is reported for severe-error proportions among valid resolution inputs. The interval assumes independent identically distributed observations, which generated clusters do not guarantee. It is descriptive finite-sample uncertainty. No zero-count result proves absence of errors.

## Timed operations and latency statistics

The optimized binary supplies comparative timings; sanitizer timings never enter the delivered optimized report. Each method uses synthetic registries of 10, 50, 100 and 1000 cached properties. Extra names contain deterministic numeric namespaces, unrelated components and repeated timeout/task prefixes. This is a computational scalability test, not a claim about real-schema matching quality.

Each registry supplies twelve deterministic typo queries. Both paths are warmed before samples. Every repetition traverses the same queries. End-to-end timing includes normalization, tokenization, exact lookup, fuzzy scoring, ranking and policy. Scoring-only uses precomputed query/candidate text/tokens, scores every candidate and excludes ranking/decision. Gram construction remains inside gram scoring. A volatile checksum consumes results, preventing dead-code elimination.

No parsing, binding, file I/O, printing or report generation occurs inside timed intervals. POSIX monotonic elapsed nanoseconds are preferred; standard C CPU clock is the portable fallback. Calls include timer overhead. Mean, pooled query median, P95/P99, throughput, total time, median repetition mean and min/max repetition means are recorded. Percentiles use nearest-rank indexing. Tail estimates from 12*repetitions samples are unstable; independent passes are within one process rather than independent host boots or isolated launches.

Name preparation and registry preprocessing have separate measurements. Registry preprocessing includes collision validation, currently quadratic. The exact scoring-only path measures loop/array-fill overhead and should not be interpreted as a fuzzy algorithm. Source-derived workspace bounds and per-query allocation behavior are reported; observed resident process memory is unavailable.

## Correctness assertions and sanitizer coverage

The normal build enables C99, all common warnings, conversion and shadow warnings. `make test` returns nonzero if any assertion or manifest check fails. The benchmark reruns the tests before ranking implementations. Tests distinguish restricted adjacent swaps from full Damerau-Levenshtein, compare Levenshtein and the full method to a shortest-path oracle, and check score bounds, symmetry/identity on many short strings, parser capacities, unit distinctions, exact bypass, ambiguity ties, candidate-order invariance and binding rollback.

`make sanitize` uses GCC AddressSanitizer and UndefinedBehaviorSanitizer. Leak detection is explicitly disabled on the delivered execution host because restricted /proc access prevents LeakSanitizer from running. Its runtime hook is compiled only into the sanitizer binary. Rebuild with `SANITIZER_LEAKS=1` on a compatible host for leak coverage. The delivered logs preserve unit and full-experiment sanitizer outcomes. Those runs may emit executable-name symbolization warnings in the sandbox; AddressSanitizer/UndefinedBehaviorSanitizer detection remains active.
