/** @file
 * [PM-Rp5wT2] Render recorded evidence. Each section has its own small writer.
 * Selection reads measured Metrics/Timing; it does not know a preferred winner.
 * CSV escaping and diagnostics are shared below; no printing is inside a timer.
 */
#define _POSIX_C_SOURCE 200809L
#include <math.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#if defined(__unix__) || defined(__APPLE__)
#include <sys/utsname.h>
#endif
#include "pm.h"
#ifndef BUILD_FLAGS
#define BUILD_FLAGS "unavailable"
#endif
static unsigned danger(const Metrics *metrics) {
    return metrics->wrong + metrics->unknown_accept + metrics->ambiguous_accept;
}

static double ratio(unsigned numerator, unsigned denominator) {
    return denominator ? 100 * (double) numerator / (double) denominator : 0;
}

static uint32_t fingerprint(const char *path) {
    FILE *file = fopen(path, "rb");
    uint32_t h = UINT32_C(2166136261);
    int test;
    if (!file) return 0;
    while ((test = fgetc(file)) != EOF) {
        h ^= (uint32_t) (unsigned char) test;
        h *= UINT32_C(16777619);
    }
    fclose(file);
    return h;
}

static const char *suggestion(const Registry *registry, int case_index) {
    return case_index >= 0 ? registry->p[case_index].name : "(none)";
}

static const char *expected_name(const TestCase *test) {
    if (test->expected == EXPECT_RESOLVED) return test->target;
    if (test->expected == EXPECT_UNKNOWN) return "reject unknown";
    if (test->expected == EXPECT_AMBIGUOUS) return "ambiguous";
    return "invalid input/schema";
}
/** Double embedded quotes; otherwise a diagnostic could change the CSV columns. */
static void csv_string(FILE *file, const char *text) {
    fputc('"', file);
    for (; *text; ++text) {
        if (*text == '"') fputc('"', file);
        fputc((unsigned char) * text, file);
    }
    fputc('"', file);
}

static const char *classification(const TestCase *test, const CaseResult *record, const Registry *registry) {
    int accept = match_is_accepted(record->resolution.status);
    if (test->expected == EXPECT_INVALID) return record->failure ? "invalid not detected" : "invalid correctly detected";
    if (test->expected == EXPECT_RESOLVED) {
        if (accept && strcmp(registry->p[record->resolution.first].name, test->target)) return "INCORRECT TARGET";
        if (!accept) return "unnecessary rejection";
        return "correct resolution";
    }
    if (test->expected == EXPECT_UNKNOWN) return accept ? "FALSE UNKNOWN ACCEPTANCE" : "safe unknown rejection";
    if (accept) return "UNSAFE AMBIGUOUS ACCEPTANCE";
    return record->resolution.status == MATCH_AMBIGUOUS ? "correct ambiguity detection" : "safe rejection without ambiguity label";
}
/** Only an accepted, target-labeled case can be a wrong-target assignment. */
static int accepted_wrong_target(const TestCase *test, const Resolution *result, const Registry *registry) {
    if (test->expected != EXPECT_RESOLVED || !match_is_accepted(result->status)) return 0;
    return strcmp(test->target, registry->p[result->first].name) != 0;
}

/** [PM-Ra3nB8] Compare safety, then recovery, then speed. Weighted mode checks cost first. */
static int better(size_t algorithm, size_t b, const Evaluation *evaluations, Costs cost, int weighted) {
    const Metrics *left = &evaluations[algorithm].metrics, *right = &evaluations[b].metrics;
    if (weighted && metric_cost(left, cost) != metric_cost(right, cost)) return metric_cost(left, cost) < metric_cost(right,
        cost);
    if (danger(left) != danger(right)) return danger(left) < danger(right);
    if (left->fuzzy != right->fuzzy) return left->fuzzy > right->fuzzy;
    return evaluations[algorithm].perf[0].end.median_ns < evaluations[b].perf[0].end.median_ns;
}

typedef struct {
    size_t algorithm;
    unsigned dangerous, recovered;
    double latency;
} RankedAlgorithm;

/** Carry comparison keys with each row; C99 qsort needs no global context. */
static int compare_rank(const void *left, const void *right) {
    const RankedAlgorithm *a = left, *b = right;
    if (a->dangerous != b->dangerous) return (a->dangerous > b->dangerous) ? 1 : -1;
    if (a->recovered != b->recovered) return (a->recovered < b->recovered) ? 1 : -1;
    if (a->latency != b->latency) return (a->latency > b->latency) ? 1 : -1;
    return (a->algorithm > b->algorithm) - (a->algorithm < b->algorithm);
}

static int write_csv(const Options *options, const Dataset *held_out, const Evaluation *evaluations) {
    FILE *file = fopen(options->csv, "w"), *summary = fopen("reports/summary.csv", "w"), *runtime = fopen("reports/runtime.csv",
        "w");
    size_t algorithm, case_index, size_index, mode;
    if (!file || !summary || !runtime) {
        if (file) fclose(file);
        if (summary) fclose(summary);
        if (runtime) fclose(runtime);
        return 0;
    }
    fputs("algorithm,test_id,schema,category,input,expected,target,status,top,second,top_score,second_score,expected_score,threshold,margin,max_edits,failure,dangerous,classification\n",
        file);
    fputs("algorithm,exact,fuzzy,wrong_target,unknown_accept,ambiguous_accept,rejected,unknown_reject,ambiguity,ambiguous_unknown,invalid,fuzzy_inputs,eligible,total,weighted_cost,threshold,margin,max_edits\n",
        summary);
    fputs("algorithm,registry_size,mode,queries,total_ms,mean_us,median_us,p95_us,p99_us,qps,trial_min_us,trial_max_us,trial_median_us,preprocessing_ms,normalization_us\n",
        runtime);
    for (algorithm = 0; algorithm < ALGORITHMS; ++algorithm) {
        const Metrics *metrics = &evaluations[algorithm].metrics;
        fprintf(summary, "%s,%u,%u,%u,%u,%u,%u,%u,%u,%u,%u,%u,%u,%u,%.3f,%.6f,%.4f,%d\n", algorithms[algorithm].id, metrics->exact,
            metrics->fuzzy, metrics->wrong, metrics->unknown_accept, metrics->ambiguous_accept, metrics->rejected, metrics->unknown_reject,
            metrics->ambiguity, metrics->ambiguous_unknown, metrics->invalid, metrics->fuzzy_inputs, metrics->eligible, metrics->total,
            metric_cost(metrics, options->costs), evaluations[algorithm].policy.threshold, evaluations[algorithm].policy.margin,
            evaluations[algorithm].policy.max_edits);
        for (case_index = 0; case_index < held_out->n; ++case_index) {
            const TestCase *test = &held_out->cases[case_index];
            const CaseResult *record = &evaluations[algorithm].results[case_index];
            const Resolution *result = &record->resolution;
            Registry *registry = registry_get(test->schema);
            double correct = - 1;
            int unsafe = 0;
            if (algorithm && record->target >= 0) {
                Prepared p;
                if (prepare(test->input, &p)) correct = algorithms[algorithm].score(&p, &registry->p[record->target]);
            }
            if (match_is_accepted(result->status)) unsafe = test->expected != EXPECT_RESOLVED || strcmp(test->target, registry->p[result->first].name);
            fprintf(file, "%s,%s,%s,%s,", algorithms[algorithm].id, test->id, test->schema, test->category);
            csv_string(file, test->input);
            fprintf(file, ",%d,", (int) test->expected);
            csv_string(file, test->target);
            fprintf(file, ",%s,", status_names[result->status]);
            csv_string(file, suggestion(registry, result->first));
            fputc(',', file);
            csv_string(file, suggestion(registry, result->second));
            fprintf(file, ",%.9f,%.9f,%.9f,%.6f,%.4f,%d,%d,%d,", result->best, result->runner, correct, evaluations[algorithm].policy.threshold,
                evaluations[algorithm].policy.margin, evaluations[algorithm].policy.max_edits, record->failure, unsafe);
            csv_string(file, classification(test, record, registry));
            fputc('\n', file);
        }
        for (size_index = 0; size_index < 4; ++size_index) for (mode = 0; mode < 2; ++mode) {
            const Performance *p = &evaluations[algorithm].perf[size_index];
            const Timing *t = mode ? &p->score : &p->end;
            fprintf(runtime, "%s,%zu,%s,%zu,%.6f,%.6f,%.6f,%.6f,%.6f,%.3f,%.6f,%.6f,%.6f,%.6f,%.6f\n", algorithms[algorithm].id,
                p->registry_size, mode ? "scoring" : "end_to_end", t->queries, t->total_ns / 1e6, t->mean_ns / 1000, t->median_ns / 1000,
                t->p95_ns / 1000, t->p99_ns / 1000, t->qps, t->trial_min_ns / 1000, t->trial_max_ns / 1000, t->trial_median_ns / 1000,
                p->preprocessing_ns / 1e6, p->normalization_ns / 1000);
        }
    } {
        int ok = !ferror(file) && !ferror(summary) && !ferror(runtime);
        if (fclose(file)) ok = 0;
        if (fclose(summary)) ok = 0;
        if (fclose(runtime)) ok = 0;
        return ok;
    }
}
/** State the measured winners and counts; no winner name is preselected. */
static void write_summary(FILE *file, const Options *options, const Evaluation *evaluations, size_t best, size_t balanced) {
    const Metrics *selected = &evaluations[best].metrics;
    fprintf(file, "# C99 fuzzy configuration property matching benchmark\n\n## 1. Matching results and selected policies\n"
        "\nThe safety-first choice from this run is **%s**. It recovered %u of %u misspelled names "
        "and made %u unsafe automatic assignments. Formatting variants use the shared exact-normalized "
        "stage before any fuzzy calculation.\n\n",
        algorithms[best].name, selected->fuzzy, selected->fuzzy_inputs, danger(selected));
    if (balanced != best) fprintf(file, "The cost-focused choice is %s at %.0f penalty points. "
        "Its separate ranking reflects the configured cost of a mistaken assignment.\n\n",
        algorithms[balanced].name, metric_cost(&evaluations[balanced].metrics, options->costs));
    fputs("The implementation articles connect these measurements to real input strings. "
        "See [measured algorithm tradeoffs](docs/measured-results.md) for a concise comparison.\n\n", file);
}
/** Record the actual toolchain, dataset fingerprints and timing configuration. */
static void write_environment(FILE *file, const Options *options, const char *timestamp, const Dataset *calibration, const Dataset *held_out) {
    fputs("Selection is specific to these labels and frozen policies. Rejecting inputs "
        "is preferable to silently assigning values to the wrong operational setting. "
        "Zero observed dangerous errors is finite-sample evidence, not a correctness "
        "guarantee.\n\n## 2. Compiler, platform and benchmark settings\n\n| Field | Recorded value |\n|---|---|\n",
        file);
    fprintf(file, "| Execution (UTC) | %s |\n| Dataset split | %zu calibration; %zu held-out cases |\n", timestamp, calibration->n, held_out->n);
#if defined(__unix__) || defined(__APPLE__)
    {
        struct utsname u;
        if (uname(&u) == 0) fprintf(file, "| OS / kernel | %s %s |\n| Architecture | %s |\n", u.sysname, u.release, u.machine);
        else fputs("| OS / architecture | unavailable: uname failed |\n", file);
    }
#else
    fputs("| OS / architecture | unavailable: no uname support |\n", file);
#endif
    fprintf(file, "| GCC | %s |\n| C standard | C99; __STDC_VERSION__=%ld |\n| Actual flags | "
        "`%s` |\n| Timer | POSIX CLOCK_MONOTONIC elapsed nanoseconds; clock() CPU fallback "
        "on non-POSIX builds |\n| Repetitions | %u; 12 queries per repetition per size "
        "and path |\n| Seed | %u (xorshift32; zero seed maps to 0x9e3779b9) |\n| Dataset "
        "version | %s |\n| Manifest FNV-1a32 | calibration %08x; held-out %08x |\n| "
        "Curated registry sizes | base 10; adversarial 30; short 12; boundary 3; collision "
        "2; calibration 16 |\n| Performance sizes | 10, 50, 100, 1000 |\n\n",
        __VERSION__, (long) __STDC_VERSION__, BUILD_FLAGS, options->repetitions, (unsigned) options->seed, DATA_VERSION,
        (unsigned) fingerprint("tests/calibration_cases.csv"), (unsigned) fingerprint("tests/evaluation_cases.csv"));
}
/** Explain each registered scorer using its own definition and workspace bound. */
static void write_algorithms(FILE *file) {
    size_t algorithm;
    fputs("## 3. Similarity algorithms and workspace bounds\n\nAll candidate scores increase with similarity and "
        "are in [0,1]. Project scoring code uses automatic bounded arrays and no explicit heap "
        "objects per query. qsort may use implementation-specific workspace or allocations; those are not included in the array bounds below. Candidate representations are cached; n and m denote character "
        "lengths and T/U denote token counts. LCS means longest common subsequence: "
        "matching letters in order, with gaps allowed. Optimal String Alignment is "
        "the restricted adjacent-letter-swap method; a swapped substring cannot be "
        "edited again. Full Damerau-Levenshtein removes that restriction.\n\n| ID | Algorithm / definition | Complexity "
        "| Approximate scoring workspace (bytes) |\n|---|---|---|---:|\n",
        file);
    for (algorithm = 0; algorithm < ALGORITHMS; ++algorithm) fprintf(file, "| %s | %s: %s | %s | %zu |\n", algorithms[algorithm].id,
        algorithms[algorithm].name, algorithms[algorithm].definition, algorithms[algorithm].complexity, algorithms[algorithm].workspace);
    fputs("\nWeighted edit costs are global typing rules, with no schema-specific aliases. "
        "Neighbor substitutions mean horizontally adjacent keys on the three ASCII QWERTY "
        "rows; digit operations have cost 2. Jaro uses half the out-of-order matched-character "
        "count. Winkler rewards only the first four characters, so long common prefixes "
        "can still compress decision margins. N-grams are unpadded; short strings below "
        "gram size score zero unless equal. Dice uses sets; cosine uses multiplicities. "
        "Ratcliff ties use lexical orientation for symmetric deterministic results.\n"
        "\nTokenization splits ASCII separators, lower-to-uppercase transitions, digit-to-uppercase "
        "transitions and acronym-to-word transitions. Hybrid token alignment preserves "
        "order with unit insertion/deletion and normalized character-edit substitution "
        "cost. Concatenated lowercase inputs lose token structure; this is a documented "
        "limitation of that variant. Shared exact normalization runs before every fuzzy "
        "method. AddressSanitizer and UndefinedBehaviorSanitizer correctness runs are "
        "provided by make sanitize. Leak detection is disabled because this sandbox "
        "denies the /proc access required by LeakSanitizer; leak coverage is unavailable. "
        "Full mathematical and implementation notes are in `docs/algorithms.md`.\n\n",
        file);
}
/** Print policy and label rules, including the separate calibration split. */
static void write_methodology(FILE *file, const Options *options) {
    fputs("## 4. Normalization, labels and calibration rules\n\nThe parser splits at the first equals sign and trims "
        "ASCII whitespace. Later equals signs, quotes and semicolons remain literal. "
        "Matching uses only names; values do not influence ranking. The binder independently "
        "validates nonempty strings, signed 32-bit decimal integers and lowercase true/false "
        "booleans, then rejects duplicates and missing required properties. No partial "
        "configuration is committed.\n\nNormalization lowercases ASCII letters, removes "
        "ASCII whitespace, underscore and hyphen, and preserves digits. All other punctuation, "
        "non-ASCII bytes, empty normalized keys, keys over 128 bytes and token counts "
        "over 32 are invalid. Any normalization collision invalidates the whole schema. "
        "Exact unique matches bypass thresholds. Fuzzy ties never choose an automatic "
        "winner. Suggestions use lexical tie ordering, independent of registry position. "
        "Below-threshold scores are unknown; sufficient scores with insufficient margin "
        "are ambiguous. An optional edit cap is applied after the margin check.\n\nCalibration "
        "and held-out data use disjoint schemas, canonical vocabulary and family IDs. "
        "Dataset v2 corrects an audited mislabeled negative: a recoverable milliseconds "
        "typo was replaced by the explicitly unregistered nanoseconds unit. It also "
        "includes the specified request-cnt abbreviation as a target-labeled partial "
        "case. This label audit changed no calibration rows, scoring rules, threshold "
        "grid or policy selection criteria; all final results were rerun on the corrected "
        "manifest. The calibration manifest is the sole source for policy selection. "
        "Its labels include recoverable deterministic mutations, unrelated unknowns "
        "and application-defined ambiguity. Calibration is intentionally synthetic; "
        "transfer to the original vocabulary is itself part of this experiment. Held-out "
        "labels are human intent assertions, including conservative rejection of missing-word, "
        "reordered and semantic alias inputs. A mutation is rejected by dataset validation "
        "if it equals another valid property. Case IDs, labels and family IDs are frozen "
        "in inspectable CSVs. Exact/formatting cases may share a normalized target but "
        "are distinct raw inputs.\n\nCalibration searches thresholds 0.50 through 1.00 "
        "in 0.02 steps, plus 1.000001 (fuzzy off); margins {0, .01, .02, .04, .08, .12, "
        ".20}; and edit caps {-1, 1, 2, 3} for the four edit methods (-1 is unlimited). "
        "It minimizes weighted cost; ties prefer a higher threshold then larger margin; "
        "remaining ties retain the first cap. All policies are frozen before held-out "
        "evaluation. No stricter property-specific thresholds or aliases are introduced.\n"
        "\n",
        file);
    fprintf(file, "Cost = %.0f * (wrong target + unknown accepted + ambiguous accepted) + %.0f "
        "* unnecessary rejection. Safely rejected unknown and ambiguous inputs cost "
        "zero. An ambiguous input rejected as unknown is safe but does not count as "
        "a correct ambiguity diagnosis. Unsupported input and schema-collision detection "
        "are counted separately.\n\n",
        options->costs.severe, options->costs.rejection);
}
/** Counts first, percentages second. Wilson intervals describe finite-sample uncertainty. */
static void write_accuracy(FILE *file, const Options *options, const Evaluation *evaluations) {
    size_t algorithm, case_index;
    fputs("## 5. Held-out resolution counts and error rates\n\n| Algorithm | Exact correct | Fuzzy correct | "
        "Wrong target | Unknown accepted | Ambiguous accepted | Unnecessary rejection "
        "| Unknown rejected | Ambiguity detected | Ambiguous as unknown | Invalid detected "
        "| Cost |\n|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|\n",
        file);
    for (algorithm = 0; algorithm < ALGORITHMS; ++algorithm) {
        const Metrics *metrics = &evaluations[algorithm].metrics;
        fprintf(file, "| %s | %u | %u | %u | %u | %u | %u | %u | %u | %u | %u | %.0f |\n", algorithms[algorithm].id, metrics->exact,
            metrics->fuzzy, metrics->wrong, metrics->unknown_accept, metrics->ambiguous_accept, metrics->rejected, metrics->unknown_reject,
            metrics->ambiguity, metrics->ambiguous_unknown, metrics->invalid, metric_cost(metrics, options->costs));
    }
    fputs("\n| Algorithm | Fuzzy precision % | Fuzzy recall % | Target coverage % | Acceptance "
        "purity % | Dangerous / valid inputs | Wilson 95% interval % |\n|---|---:|---:|---:|---:|---|---|\n",
        file);
    for (algorithm = 0; algorithm < ALGORITHMS; ++algorithm) {
        const Metrics *metrics = &evaluations[algorithm].metrics;
        double n = (double) (metrics->total - metrics->invalid), p = (double) danger(metrics) / n, z = 1.95996398454, den = 1 + z * z / n,
        center = (p + z * z / (2 * n)) / den, half = z * sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / den;
        fprintf(file, "| %s | ", algorithms[algorithm].id);
        if (metrics->fuzzy + metrics->wrong) fprintf(file, "%.2f", ratio(metrics->fuzzy, metrics->fuzzy + metrics->wrong));
        else fputs("N/A", file);
        fprintf(file, " | %.2f | %.2f | %.2f | %u / %.0f | %.3f to %.3f |\n", ratio(metrics->fuzzy, metrics->fuzzy_inputs),
            ratio(metrics->exact + metrics->fuzzy, metrics->eligible), ratio(metrics->exact + metrics->fuzzy, metrics->exact + metrics->fuzzy + danger(metrics)),
            danger(metrics), n, 100 * fmax(0, center - half), 100 * fmin(1, center + half));
    }
    fputs("\nFuzzy precision here follows the requested intended-target definition: correct "
        "fuzzy / (correct fuzzy + wrong target). It excludes unknown and ambiguous acceptance, "
        "which are exposed in both the count table and acceptance purity. Recall excludes "
        "normalization-only cases. Coverage is correct exact plus fuzzy over target-labeled "
        "inputs. Wilson intervals assume independent Bernoulli observations; clustered "
        "generated cases weaken that assumption, so these intervals are descriptive, "
        "not population guarantees.\n\n### Resolution counts by test category\n\n| Category | Algorithm "
        "| Cases | Correct exact/fuzzy | Dangerous | Unnecessary rejection | Safe other "
        "outcomes |\n|---|---|---:|---:|---:|---:|---:|\n",
        file);
    for (case_index = 0; case_index < CATEGORIES; ++case_index) for (algorithm = 0; algorithm < ALGORITHMS; ++algorithm) {
        const Metrics *metrics = &evaluations[algorithm].category[case_index];
        fprintf(file, "| %s | %s | %u | %u / %u | %u | %u | %u |\n", category_names[case_index], algorithms[algorithm].id,
            metrics->total, metrics->exact, metrics->fuzzy, danger(metrics), metrics->rejected, metrics->unknown_reject + metrics->ambiguity + metrics->ambiguous_unknown + metrics->invalid);
    }
}
/** Convert stored nanoseconds to readable units; never re-time code while printing. */
static void write_runtime(FILE *file, const Options *options, const Evaluation *evaluations) {
    size_t algorithm, size_index, mode;
    fputs("\n## 6. Resolution and scoring timings by registry size\n\nEach path is warmed with 12 queries, then timed "
        "separately without parsing, printing, allocations, dataset creation or I/O. "
        "End-to-end includes name normalization/tokenization, exact lookup, full scoring "
        "when needed, ranking and decision. Scoring-only computes every candidate score "
        "from prepared names without exact bypass or ranking. Twelve deterministic typo "
        "queries include original-schema and scaling-tail names. These are synthetic "
        "performance probes, separate from accuracy data.\n\nSamples are per-query elapsed "
        "wall times. Median, P95 and P99 use all 12 * repetitions samples; repetitions "
        "are independent passes in one process, not isolated process launches. Trial "
        "min/max describe mean-per-query variability. Timer-call overhead is included "
        "and is significant for the exact baseline. Baseline scoring measures only array-fill "
        "overhead, not fuzzy work. Candidate preprocessing includes representation generation "
        "and collision checks; the latter are quadratic in registry count. Normalization "
        "measurements include tokenization and a consumed checksum.\n\n| Algorithm | "
        "Properties | Path | Total ms | Mean us | Median us | P95 us | P99 us | Queries/s "
        "| Trial mean median us | Trial mean min-max us |\n|---|---:|---|---:|---:|---:|---:|---:|---:|---:|---|\n",
        file);
    for (algorithm = 0; algorithm < ALGORITHMS; ++algorithm) for (size_index = 0; size_index < 4; ++size_index) for (mode = 0; mode < 2; ++mode) {
        const Performance *p = &evaluations[algorithm].perf[size_index];
        const Timing *t = mode ? &p->score : &p->end;
        fprintf(file, "| %s | %zu | %s | %.3f | %.3f | %.3f | %.3f | %.3f | %.0f | %.3f | %.3f-%.3f |\n", algorithms[algorithm].id,
            p->registry_size, mode ? "score" : "resolve", t->total_ns / 1e6, t->mean_ns / 1000, t->median_ns / 1000, t->p95_ns / 1000,
            t->p99_ns / 1000, t->qps, t->trial_median_ns / 1000, t->trial_min_ns / 1000, t->trial_max_ns / 1000);
    }
    fputs("\n| Properties | Candidate preprocessing ms (first method) | Name preparation "
        "us | Prepared registry bytes |\n|---|---:|---:|---:|\n",
        file);
    for (size_index = 0; size_index < 4; ++size_index) fprintf(file, "| %zu | %.3f | %.3f | %zu |\n", evaluations[0].perf[size_index].registry_size,
        evaluations[0].perf[size_index].preprocessing_ns / 1e6, evaluations[0].perf[size_index].normalization_ns / 1000,
        evaluations[0].perf[size_index].registry_size * sizeof (Property));
    fprintf(file, "\nEvery method also needs a %zu-byte Prepared query; resolver loop locals are "
        "small. Scoring workspace estimates above exclude the cached registry/query. "
        "There are zero matching-path heap allocations. The benchmark allocates %.0f "
        "KiB of sample storage at %u repetitions. Peak resident process memory is unavailable: "
        "it is not instrumented; the process also holds manifests, evaluation records "
        "and calibration score caches.\n\n",
        sizeof (Prepared), ((double) options->repetitions * 13 * sizeof (double)) / 1024, options->repetitions);
}
/** Restrict this analysis to adversarial schemas and count intended/accepted name pairs. */
static void write_collisions(FILE *file, const Dataset *held_out, const Evaluation *evaluations) {
    size_t algorithm, case_index;
    fputs("## 7. Near-collision and ambiguous-key results\n\nThe adversarial schema co-locates "
        "authentication/authorization, seconds/milliseconds, singular/plural request "
        "counts, error/access logs, internal/external URLs, storage/cache directories, "
        "seconds/minutes, reload/reset, min/max, input/output, read/write, enabled/disabled, "
        "count/limit and V1/V2. A separate collision schema must fail before ranking. "
        "Types never disambiguate candidates: a number can be valid under the wrong "
        "unit.\n\n| Algorithm | Adversarial correct | Wrong target | Unknown accepted "
        "| Ambiguous accepted | Rejected target | Ambiguity diagnoses | Dangerous accepts "
        "with >=8 shared-prefix chars |\n|---|---:|---:|---:|---:|---:|---:|---:|\n",
        file);
    for (algorithm = 0; algorithm < ALGORITHMS; ++algorithm) {
        Metrics metrics = {0};
        unsigned prefix = 0;
        for (case_index = 0; case_index < held_out->n; ++case_index) if (!strcmp(held_out->cases[case_index].schema, "adversarial")) {
            Registry *registry = registry_get("adversarial");
            const Resolution *result = &evaluations[algorithm].results[case_index].resolution;
            metrics_add(&metrics, &held_out->cases[case_index], result, registry);
            if (accepted_wrong_target(&held_out->cases[case_index], result, registry)) {
                const char *left = registry->p[result->first].normalized, *right = registry->p[evaluations[algorithm].results[case_index].target].normalized;
                size_t k = 0;
                while (left[k] && left[k] == right[k]) ++k;
                if (k >= 8) ++prefix;
            }
        }
        fprintf(file, "| %s | %u | %u | %u | %u | %u | %u | %u |\n", algorithms[algorithm].id, metrics.exact + metrics.fuzzy,
            metrics.wrong, metrics.unknown_accept, metrics.ambiguous_accept, metrics.rejected, metrics.ambiguity, prefix);
    }
    fputs("\nThe shared-prefix count measures wrong-target accepts only, comparing actual "
        "and intended names. It is an observed association, not evidence of causality "
        "or a general property of a method. Jaro-Winkler must be assessed together with "
        "its independently calibrated margin.\n\n### Incorrect-target property pairs\n"
        "\n| Method | Intended | Accepted instead | Count |\n|---|---|---|---:|\n",
        file);
    {
        size_t rows = 0;
        for (algorithm = 0; algorithm < ALGORITHMS; ++algorithm) for (case_index = 0; case_index < held_out->n; ++case_index) {
            const TestCase *test = &held_out->cases[case_index];
            const Resolution *result = &evaluations[algorithm].results[case_index].resolution;
            Registry *registry = registry_get(test->schema);
            size_t j;
            unsigned count = 0;
            int earlier = 0;
            if (!accepted_wrong_target(test, result, registry)) continue;
            for (j = 0; j < held_out->n; ++j) {
                const TestCase *d = &held_out->cases[j];
                const Resolution *w = &evaluations[algorithm].results[j].resolution;
                Registry *rr = registry_get(d->schema);
                if (d->expected != EXPECT_RESOLVED || !match_is_accepted(w->status)) continue;
                int same_intended_name = !strcmp(test->target, d->target);
                int same_accepted_name = !strcmp(registry->p[result->first].name, rr->p[w->first].name);
                if (same_intended_name && same_accepted_name) {
                    ++count;
                    if (j < case_index) earlier = 1;
                }
            }
            if (!earlier) {
                ++rows;
                fprintf(file, "| %s | %s | %s | %u |\n", algorithms[algorithm].id, test->target, registry->p[result->first].name,
                    count);
            }
        }
        if (!rows) fputs("| All | No observed wrong-target accepts | N/A | 0 |\n", file);
    }
}
/** Show every unsafe acceptance and a bounded sample of safe failures. */
static void write_errors(FILE *file, const Dataset *held_out, const Evaluation *evaluations) {
    size_t algorithm, case_index;
    fputs("\n## 8. Inputs that failed expected resolution\n\nEvery failing ID, the top two candidate scores and "
        "the intended-target score is included in the per-case CSV. Unknown or ambiguous "
        "statuses still carry suggestions; suggestions are never applied. The following "
        "table includes all dangerous accepts and up to three non-dangerous failures "
        "per method.\n\n| Method / ID | Input | Expected | Outcome / classification "
        "| Top (score) | Second (score) | Threshold / margin |\n|---|---|---|---|---|---|---|\n",
        file);
    for (algorithm = 0; algorithm < ALGORITHMS; ++algorithm) {
        unsigned shown = 0;
        for (case_index = 0; case_index < held_out->n; ++case_index) {
            const TestCase *test = &held_out->cases[case_index];
            const CaseResult *record = &evaluations[algorithm].results[case_index];
            const Resolution *result = &record->resolution;
            Registry *registry = registry_get(test->schema);
            int unsafe = (match_is_accepted(result->status)) && (test->expected != EXPECT_RESOLVED || strcmp(test->target, registry->p[result->first].name));
            int noncritical_limit_reached = !unsafe && shown >= 3;
            if (!record->failure || noncritical_limit_reached) continue;
            if (!unsafe) ++shown;
            fprintf(file, "| %s / %s | `%s` | %s | %s: %s | %s (%.6f) | %s (%.6f) | %.6f / %.3f |\n", algorithms[algorithm].id,
                test->id, test->input, expected_name(test), status_names[result->status], classification(test, record, registry),
                suggestion(registry, result->first), result->best, suggestion(registry, result->second), result->runner, evaluations[algorithm].policy.threshold,
                evaluations[algorithm].policy.margin);
        }
    }
    fputs("\n### Inputs correctly resolved by fuzzy matching\n\n| Method / ID | Original input | Intended "
        "and accepted | Best / runner |\n|---|---|---|---|\n",
        file);
    for (algorithm = 1; algorithm < ALGORITHMS; ++algorithm) {
        unsigned shown = 0;
        for (case_index = 0; case_index < held_out->n && shown < 2; ++case_index) if (evaluations[algorithm].results[case_index].resolution.status == MATCH_FUZZY &&
            !evaluations[algorithm].results[case_index].failure) {
            const Resolution *result = &evaluations[algorithm].results[case_index].resolution;
            ++shown;
            fprintf(file, "| %s / %s | `%s` | %s | %.6f / %.6f |\n", algorithms[algorithm].id, held_out->cases[case_index].id,
                held_out->cases[case_index].input, held_out->cases[case_index].target, result->best, result->runner);
        }
    }
    fputs("\n### Milliseconds typo with a competing seconds property\n\n| Method | Input | Expected | Status "
        "| Top / second | Best / runner |\n|---|---|---|---|---|---|\n",
        file);
    for (case_index = 0; case_index < held_out->n; ++case_index) if (!strcmp(held_out->cases[case_index].input, "default request timeout miliseconds")) for (algorithm = 0; algorithm < ALGORITHMS; ++algorithm) {
        const Resolution *result = &evaluations[algorithm].results[case_index].resolution;
        Registry *registry = registry_get(held_out->cases[case_index].schema);
        fprintf(file, "| %s | `%s` | %s | %s | %s / %s | %.6f / %.6f |\n", algorithms[algorithm].id, held_out->cases[case_index].input,
            held_out->cases[case_index].target, status_names[result->status], suggestion(registry, result->first), suggestion(registry,
            result->second), result->best, result->runner);
    }
}
/** Perturb thresholds on calibration data only. These probes do not retune the hold-out. */
static void write_thresholds(FILE *file, const Dataset *calibration, const Evaluation *evaluations) {
    size_t algorithm, case_index;
    fputs("\n## 9. Calibrated thresholds and sensitivity checks\n\n| Method | Minimum score | Minimum "
        "margin | Maximum edits | Calibration cost |\n|---|---:|---:|---:|---:|\n",
        file);
    for (algorithm = 0; algorithm < ALGORITHMS; ++algorithm) fprintf(file, "| %s | %.6f | %.3f | %d | %.0f |\n", algorithms[algorithm].id,
        evaluations[algorithm].policy.threshold, evaluations[algorithm].policy.margin, evaluations[algorithm].policy.max_edits,
        evaluations[algorithm].calibration_cost);
    fputs("\n`reports/calibration_grid.csv` preserves every tested threshold/margin/cap "
        "combination, calibration fuzzy recoveries, dangerous counts, coverage and weighted "
        "cost. These points permit independent precision/coverage inspection. To show "
        "the effect of relaxing or tightening the frozen decision threshold, the following "
        "calibration-only probes hold margin and edit cap fixed. They do not retune "
        "on the held-out cases.\n\n| Method | Threshold offset | Score threshold | Correct "
        "fuzzy | Dangerous | Rejected | Coverage % |\n|---|---:|---:|---:|---:|---:|---:|\n",
        file);
    for (algorithm = 1; algorithm < ALGORITHMS; ++algorithm) {
        int delta;
        for (delta = - 1; delta <= 1; ++delta) {
            Policy p = evaluations[algorithm].policy;
            Metrics metrics = {0};
            p.threshold += 0.04 * (double) delta;
            for (case_index = 0; case_index < calibration->n; ++case_index) {
                Registry *registry = registry_get(calibration->cases[case_index].schema);
                Resolution result = resolve(registry, calibration->cases[case_index].input, algorithm, p);
                metrics_add(&metrics, &calibration->cases[case_index], &result, registry);
            }
            fprintf(file, "| %s | %+.2f | %.6f | %u | %u | %u | %.2f |\n", algorithms[algorithm].id, 0.04 * (double) delta,
                p.threshold, metrics.fuzzy, danger(&metrics), metrics.rejected, ratio(metrics.exact + metrics.fuzzy, metrics.eligible));
        }
    }
}
/** Render the safety-first order already computed from measured counts and timing. */
static void write_rankings(FILE *file, const Options *options, const Evaluation *evaluations, const size_t * rank,
    size_t best, size_t balanced, size_t fast) {
    size_t algorithm, case_index;
    fputs("\n## 10. Safety-first algorithm ranking\n\nThe exact baseline is reported separately and "
        "is the safest automatic policy whenever fuzzy methods have dangerous accepts. "
        "Among the twelve fuzzy methods, the primary ranking sorts dangerous acceptances "
        "ascending, correct fuzzy recoveries descending, then 10-property median runtime "
        "ascending. Runtime is only a tiebreaker. Balanced ranking minimizes the explicit "
        "weighted cost, then uses the primary criteria. Performance eligibility requires "
        "the minimum observed dangerous count among fuzzy methods and at least one correct "
        "fuzzy recovery. This requirement is empirical and does not certify safety.\n"
        "\n| Safety rank | Method | Dangerous | Correct fuzzy | Weighted cost | 10-property "
        "median us |\n|---|---|---:|---:|---:|---:|\n",
        file);
    for (case_index = 0; case_index < ALGORITHMS - 1; ++case_index) {
        algorithm = rank[case_index];
        fprintf(file, "| %zu | %s | %u | %u | %.0f | %.3f |\n", case_index + 1, algorithms[algorithm].id, danger(&evaluations[algorithm].metrics),
            evaluations[algorithm].metrics.fuzzy, metric_cost(&evaluations[algorithm].metrics, options->costs), evaluations[algorithm].perf[0].end.median_ns / 1000);
    }
    fprintf(file, "\nSafety-focused: **%s**. Balanced: **%s**. ", algorithms[best].name, algorithms[balanced].name);
    if (fast < ALGORITHMS) fprintf(file, "Performance-focused among methods meeting the stated safety requirement: **%s**.\n\n",
        algorithms[fast].name);
    else fputs("No fuzzy method meets the performance eligibility rule.\n\n", file);
}
/** Connect the selected policy to its observed original-schema behavior. */
static void write_recommendation(FILE *file, const Dataset *held_out, const Evaluation *evaluations, size_t best,
    size_t balanced) {
    size_t case_index;
    fprintf(file, "## 11. Recommended matching policy and deployment limits\n\nFor the original configuration use case, **%s** "
        "with minimum score %.6f, minimum margin %.3f and maximum edits %d is the strongest "
        "fuzzy choice from this run. Keep exact normalized matching first, preserve "
        "all rejections, and surface the top suggestions for manual correction. This "
        "recommendation follows the safety-first ordering; the separate balanced choice "
        "is %s.\n\n",
        algorithms[best].name, evaluations[best].policy.threshold, evaluations[best].policy.margin, evaluations[best].policy.max_edits,
        algorithms[balanced].name);
    if (danger(&evaluations[best].metrics)) fprintf(file, "The selected fuzzy method still made %u dangerous assignments. Therefore use "
        "exact-normalized-only automatic binding and offer %s suggestions for human "
        "review when silent incorrect assignments are unacceptable. Its weighted advantage "
        "does not establish safe unattended correction.\n\n",
        danger(&evaluations[best].metrics), algorithms[best].name);
    {
        Metrics base = {0};
        for (case_index = 0; case_index < held_out->n; ++case_index) if (!strcmp(held_out->cases[case_index].schema, "base")) metrics_add(&base,
            &held_out->cases[case_index], &evaluations[best].results[case_index].resolution, registry_get("base"));
        fprintf(file, "On the original ten-property schema this policy recovered %u fuzzy inputs, "
            "accepted %u normalized exact inputs, made %u dangerous assignments and rejected "
            "%u intended targets. Expanded-schema behavior is shown separately in Section "
            "7. Synthetic large-registry timings measure computational scaling only; they "
            "do not establish matching safety at 1000 real properties.\n\n",
            base.fuzzy, base.exact, danger(&base), base.rejected);
    }
}
/** Keep caveats and reproduction instructions next to the measured evidence. */
static void write_limitations(FILE *file) {
    fputs("Use explicit reviewed aliases for semantic synonyms and stable abbreviations. "
        "Recalibrate on representative development data when the schema or typo population "
        "changes, then evaluate on a fresh untouched hold-out. For unit, security or "
        "destructive settings, consider suggestion-only correction or an explicit confirmation "
        "step before applying a fuzzy match. Reject duplicate resolved names, invalid "
        "values, normalization collisions and missing required values.\n\n## 12. Limitations "
        "and future improvements\n\nThis is a finite, partly generated English/ASCII "
        "dataset. Calibration uses disjoint vocabulary and may transfer poorly; mutation "
        "patterns still overlap by design. The five already-correct original examples "
        "are in the formatting group; the five misspelled originals are in the deletion "
        "group. The ambiguity group includes formatting variants of ten semantic phrases "
        "and therefore has fewer independent semantic families than raw cases. Safety "
        "outcomes depend on these application-defined labels. No aliases or value-aware "
        "rules are evaluated.\n\nShort identifiers and 128-byte near-identical names "
        "stress policies trained mostly on longer calibration names. Threshold grids "
        "are finite and might miss useful operating points. Exact normalization cannot "
        "detect a user's semantic mistake that spells another canonical name correctly. "
        "Digits have higher cost only in the documented weighted variant; other methods "
        "treat them like letters. Unicode, locale-sensitive case folding, sections, "
        "escaping and full INI syntax are outside this baseline.\n\nTiming uses one "
        "shared host, a small probe set and finite repetitions; OS scheduling, CPU frequency "
        "and timer overhead add variance. Latency distributions are descriptive; tail "
        "estimates from a small sample are especially unstable. No real-application "
        "1000-property accuracy claim follows from synthetic scaling tests. Workspace "
        "values are source-derived bounds, not observed RSS. Further work should add "
        "independently authored schemas, naturally occurring errors, family-aware resampling, "
        "more process-level timing repetitions, allocation/RSS instrumentation, optional "
        "reviewed aliases and deployment-specific severity weights.\n\n## Reproduction "
        "and evidence\n\nRun `make`, `make test`, `make sanitize`, then `make benchmark` "
        "from the project directory. The default manifests use seed 42. For another "
        "seed run `./property_match_bench --generate --seed N`, then `./property_match_bench "
        "--benchmark --seed N`; this explicitly replaces the manifests. Preserve them "
        "with the report. `--wrong-cost` and `--reject-cost` change policy selection "
        "and weighted rankings.\n\nThe baseline and every fuzzy method are evaluated "
        "on identical held-out inputs. `reports/results.csv` (or the supplied --csv "
        "path) contains individual classifications, thresholds and suggestions; `reports/summary.csv` "
        "contains aggregate counts; `reports/runtime.csv` contains timing data; and "
        "`reports/calibration_grid.csv` contains calibration evidence. The benchmark "
        "aborts if correctness tests or dataset validation fail, preventing invalid "
        "implementations from entering rankings.\n",
        file);
}
/** Build CSV evidence first, then assemble Markdown from the same records. */
int generate_report(const Options *options, const Dataset *calibration, const Dataset *held_out, const Evaluation *evaluations) {
    FILE *file;
    size_t algorithm, rank[ALGORITHMS - 1], best = 1, balanced = 1, fast = ALGORITHMS;
    RankedAlgorithm ranked[ALGORITHMS - 1];
    unsigned min_danger = ~0U;
    time_t stamp = time(NULL);
    struct tm utc;
    int have_utc = 0;
#if defined(__unix__) || defined(__APPLE__)
    have_utc = gmtime_r(&stamp, &utc) != NULL;
#else
    (void)stamp; /* C99 has no reentrant UTC converter permitted by banned.h. */
#endif
    char timestamp[64];
    if (!write_csv(options, held_out, evaluations)) return 0;
    file = fopen(options->report, "w");
    if (!file) return 0;
    if (have_utc) strftime(timestamp, sizeof timestamp, "%Y-%m-%dT%H:%M:%SZ", &utc);
    else memcpy(timestamp, "unavailable", strlen("unavailable") + 1);
    for (algorithm = 1; algorithm < ALGORITHMS; ++algorithm) {
        if (better(algorithm, best, evaluations, options->costs, 0)) best = algorithm;
        if (better(algorithm, balanced, evaluations, options->costs, 1)) balanced = algorithm;
        if (danger(&evaluations[algorithm].metrics) < min_danger) min_danger = danger(&evaluations[algorithm].metrics);
        ranked[algorithm - 1] = (RankedAlgorithm){algorithm, danger(&evaluations[algorithm].metrics),
            evaluations[algorithm].metrics.fuzzy, evaluations[algorithm].perf[0].end.median_ns};
    }
    for (algorithm = 1; algorithm < ALGORITHMS; ++algorithm) {
        int meets_safety_requirement = danger(&evaluations[algorithm].metrics) == min_danger;
        int recovers_at_least_one_typo = evaluations[algorithm].metrics.fuzzy != 0;
        int faster_than_current = fast == ALGORITHMS ||
            evaluations[algorithm].perf[0].end.median_ns < evaluations[fast].perf[0].end.median_ns;
        if (meets_safety_requirement && recovers_at_least_one_typo && faster_than_current) fast = algorithm;
    }
    /* Sort small records containing comparison keys; the much larger evaluation
     * arrays stay in place. rank[] then stores only their algorithm indices. */
    qsort(ranked, ALGORITHMS - 1, sizeof *ranked, compare_rank);
    for (algorithm = 0; algorithm < ALGORITHMS - 1; ++algorithm) rank[algorithm] = ranked[algorithm].algorithm;
    write_summary(file, options, evaluations, best, balanced);
    write_environment(file, options, timestamp, calibration, held_out);
    write_algorithms(file);
    write_methodology(file, options);
    write_accuracy(file, options, evaluations);
    write_runtime(file, options, evaluations);
    write_collisions(file, held_out, evaluations);
    write_errors(file, held_out, evaluations);
    write_thresholds(file, calibration, evaluations);
    write_rankings(file, options, evaluations, rank, best, balanced, fast);
    write_recommendation(file, held_out, evaluations, best, balanced);
    write_limitations(file);
    {
        int ok = !ferror(file);
        if (fclose(file)) ok = 0;
        return ok;
    }
}
