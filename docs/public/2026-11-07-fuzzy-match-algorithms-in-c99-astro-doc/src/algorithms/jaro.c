/** @file [PM-Ja6rC3] Jaro counts nearby equal letters, then checks their order.
 * martha / marhta: 6 matches; 2 letters out of order; half of 2 is one swap.
 * Equal letters may match only once. Matching flags record which ones were used.
 */
/* measured:ALG05:start - 2026-11-07 recorded run.
 * Recovered 159/185 typos; unsafe accepts 13.
 * Median lookup, 10 properties: about 20 microseconds on this host.
 * Levenshtein recovered 174/185 with 0 unsafe accepts.
 * Input: application environment
 * Outcome: accepted ApplicationEnvironmentName, but input was labeled unknown.
 * Policy limits and comparisons: docs/measured-results.md.
 * measured:ALG05:end */
#include <string.h>
#include "pm.h"

double jaro_score(const char *input, const char *candidate) {
    size_t input_length = strlen(input), candidate_length = strlen(candidate);
    size_t input_index, candidate_index, next_matched = 0, matches = 0, out_of_order = 0;
    unsigned char input_matched[KEY_MAX] = {0}, candidate_matched[KEY_MAX] = {0};
    size_t window = (input_length > candidate_length ? input_length : candidate_length) / 2;
    if (!strcmp(input, candidate)) return 1;
    if (!input_length || !candidate_length) return 0;
    if (window) --window; /* floor(max length / 2) - 1, clamped at zero. */

    for (input_index = 0; input_index < input_length; ++input_index) {
        size_t start = input_index > window ? input_index - window : 0;
        size_t stop = input_index + window + 1;
        if (stop > candidate_length) stop = candidate_length;
        for (candidate_index = start; candidate_index < stop; ++candidate_index) {
            int unused_equal_letter = !candidate_matched[candidate_index] &&
                                      input[input_index] == candidate[candidate_index];
            if (unused_equal_letter) {
                input_matched[input_index] = 1;
                candidate_matched[candidate_index] = 1;
                ++matches;
                break;
            }
        }
    }
    if (!matches) return 0;
    /* Compare only the matched subsequences; unmatched letters do not shift order. */
    for (input_index = 0; input_index < input_length; ++input_index) {
        if (input_matched[input_index]) {
            while (next_matched < candidate_length && !candidate_matched[next_matched]) ++next_matched;
            if (next_matched < candidate_length && input[input_index] != candidate[next_matched]) ++out_of_order;
            ++next_matched;
        }
    }
    {
        double input_coverage = (double)matches / (double)input_length;
        double candidate_coverage = (double)matches / (double)candidate_length;
        double half_mismatches = (double)out_of_order / 2;
        double order_agreement = ((double)matches - half_mismatches) / (double)matches;
        /* martha/marhta: (6/6 + 6/6 + (6-1)/6) / 3 = 17/18.
         * This averages three agreements, not a probability of correct binding. */
        return (input_coverage + candidate_coverage + order_agreement) / 3;
    }
}
