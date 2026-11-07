/** @file
 * [PM-Me3cU7] Count what happened, including safe rejection and unsafe acceptance.
 * A rejected typo loses coverage. An accepted wrong name can change a setting.
 * These must stay separate even when a weighted cost combines them.
 */
#include <math.h>
#include <string.h>
#include "pm.h"

/** Does formatting alone resolve this target? Such inputs are not fuzzy recall. */
static int has_normalized_exact_match(const Registry *registry, const char *input) {
    char normalized[KEY_MAX + 1];
    size_t index;
    if (!normalize(input, normalized, sizeof normalized)) return 0;
    for (index = 0; index < registry->n; ++index) {
        if (!strcmp(normalized, registry->p[index].normalized)) return 1;
    }
    return 0;
}

/** Add exactly one outcome bucket, plus denominator counts used for percentages. */
void metrics_add(Metrics *metrics, const TestCase *test, const Resolution *result, const Registry *registry) {
    int accepted = match_is_accepted(result->status);
    ++metrics->total;
    if (test->expected == EXPECT_INVALID) { ++metrics->invalid; return; }
    if (test->expected == EXPECT_RESOLVED) {
        ++metrics->eligible;
        if (!has_normalized_exact_match(registry, test->input)) ++metrics->fuzzy_inputs;
        if (accepted) {
            int wrong_target = strcmp(registry->p[result->first].name, test->target) != 0;
            if (wrong_target) ++metrics->wrong;
            else if (result->status == MATCH_EXACT) ++metrics->exact;
            else ++metrics->fuzzy;
        } else ++metrics->rejected;
    } else if (test->expected == EXPECT_UNKNOWN) {
        if (accepted) ++metrics->unknown_accept;
        else ++metrics->unknown_reject;
    } else if (accepted) ++metrics->ambiguous_accept;
    else if (result->status == MATCH_AMBIGUOUS) ++metrics->ambiguity;
    else ++metrics->ambiguous_unknown; /* Safe rejection, but the diagnosis missed ambiguity. */
}

/** Default cost: one unsafe assignment costs as much as 100 rejected typos. */
double metric_cost(const Metrics *metrics, Costs costs) {
    unsigned dangerous_accepts = metrics->wrong + metrics->unknown_accept + metrics->ambiguous_accept;
    return costs.severe * (double)dangerous_accepts + costs.rejection * (double)metrics->rejected;
}

/** [PM-Ca8qD4] Calibration moves policy knobs, not algorithm scores.
 * Prepare/score once -> try each threshold/gap/cap -> count cost -> keep minimum.
 * The caller passes calibration data only. Held-out evaluation comes later.
 * Equal cost: prefer higher threshold, then higher margin; retain the first cap.
 */
Policy calibrate(const Dataset *dataset, size_t algorithm, Costs costs, double *chosen_cost, FILE *grid) {
    /* Static storage keeps this large cache off the call stack. Row c belongs
     * to case c; only that case's registry columns are read. Reuse is sequential,
     * so this calibration routine is not reentrant or thread-safe. */
    static double scores[MAX_CASES][MAX_PROPERTIES];
    static Prepared prepared[MAX_CASES];
    const double margins[] = {0, 0.01, 0.02, 0.04, 0.08, 0.12, 0.20};
    const int edit_caps[] = {-1, 1, 2, 3};
    int is_edit_algorithm = algorithm >= 1 && algorithm <= 4;
    size_t threshold_count = algorithm ? 27U : 1U;
    size_t margin_count = algorithm ? 7U : 1U;
    size_t cap_count = is_edit_algorithm ? 4U : 1U;
    size_t case_index, threshold_index, margin_index, cap_index;
    double lowest_cost = 1e100;
    Policy winner = {1.000001, 0.20, -1};

    for (case_index = 0; case_index < dataset->n; ++case_index) {
        const TestCase *test = &dataset->cases[case_index];
        Registry *registry = registry_get(test->schema);
        if (!prepare(test->input, &prepared[case_index])) continue;
        score_candidates(registry, &prepared[case_index], algorithm, scores[case_index]);
    }
    for (threshold_index = 0; threshold_index < threshold_count; ++threshold_index) {
        for (margin_index = 0; margin_index < margin_count; ++margin_index) {
            for (cap_index = 0; cap_index < cap_count; ++cap_index) {
                Policy policy = {threshold_index == 26 ? 1.000001 : 0.5 + 0.02 * (double)threshold_index,
                                 margins[margin_index], edit_caps[cap_index]};
                Metrics metrics = {0};
                double cost;
                int lower_cost, equal_cost, stricter_threshold, stricter_margin;
                for (case_index = 0; case_index < dataset->n; ++case_index) {
                    const TestCase *test = &dataset->cases[case_index];
                    Registry *registry = registry_get(test->schema);
                    Resolution result = decide(registry, &prepared[case_index], algorithm, policy, scores[case_index]);
                    metrics_add(&metrics, test, &result, registry);
                }
                cost = metric_cost(&metrics, costs);
                lower_cost = cost < lowest_cost - 1e-9;
                equal_cost = fabs(cost - lowest_cost) <= 1e-9;
                stricter_threshold = policy.threshold > winner.threshold;
                stricter_margin = policy.threshold == winner.threshold && policy.margin > winner.margin;
                if (lower_cost || (equal_cost && (stricter_threshold || stricter_margin))) {
                    lowest_cost = cost;
                    winner = policy;
                }
                if (grid) {
                    unsigned dangerous = metrics.wrong + metrics.unknown_accept + metrics.ambiguous_accept;
                    double coverage = metrics.eligible ? (double)(metrics.exact + metrics.fuzzy) / (double)metrics.eligible : 0;
                    fprintf(grid, "%s,%.6f,%.4f,%d,%u,%u,%u,%.6f,%.2f\n", algorithms[algorithm].id,
                            policy.threshold, policy.margin, policy.max_edits, metrics.fuzzy, dangerous,
                            metrics.rejected, coverage, cost);
                }
            }
        }
    }
    *chosen_cost = lowest_cost;
    return winner;
}

/** A safe unknown response to an ambiguous label is a diagnostic failure, cost 0. */
static int expected_outcome_failed(const TestCase *test, const Resolution *result, int target_index) {
    int accepted = match_is_accepted(result->status);
    if (test->expected == EXPECT_RESOLVED) return !accepted || result->first != target_index;
    if (test->expected == EXPECT_UNKNOWN) return accepted;
    if (test->expected == EXPECT_AMBIGUOUS) return result->status != MATCH_AMBIGUOUS;
    return result->status != MATCH_INVALID;
}

/** [PM-Ev6jH2] Use frozen policy once per held-out case; preserve every result.
 * One result feeds both the overall count and its category count, preventing drift.
 */
void evaluate(const Dataset *dataset, size_t algorithm, Policy policy, Evaluation *evaluation) {
    size_t case_index;
    memset(&evaluation->metrics, 0, sizeof evaluation->metrics);
    memset(evaluation->category, 0, sizeof evaluation->category);
    for (case_index = 0; case_index < dataset->n; ++case_index) {
        const TestCase *test = &dataset->cases[case_index];
        Registry *registry = registry_get(test->schema);
        Resolution result = resolve(registry, test->input, algorithm, policy);
        CaseResult *record = &evaluation->results[case_index];
        int category = category_index(test->category);
        size_t property_index;
        record->resolution = result;
        record->target = -1;
        for (property_index = 0; property_index < registry->n; ++property_index) {
            if (!strcmp(test->target, registry->p[property_index].name)) record->target = (int)property_index;
        }
        record->failure = expected_outcome_failed(test, &result, record->target);
        metrics_add(&evaluation->metrics, test, &result, registry);
        if (category >= 0) metrics_add(&evaluation->category[category], test, &result, registry);
    }
}
