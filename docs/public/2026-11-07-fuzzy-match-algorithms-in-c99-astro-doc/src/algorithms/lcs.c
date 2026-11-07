/** @file [PM-Lc7sB5] Longest common subsequence keeps equal letters in order; gaps are allowed.
 * abc / ac: keep a and c, so length=2 and similarity=2*2/(3+2)=.8.
 * A substring must be contiguous; this subsequence does not. See [PM-Ro1hM7].
 */
/* measured:ALG07:start - 2026-11-07 recorded run.
 * Recovered 174/185 typos; unsafe accepts 3.
 * Median lookup, 10 properties: about 13 microseconds on this host.
 * Levenshtein recovered 174/185 with 0 unsafe accepts.
 * Input: default request timeout nanoseconds
 * Outcome: accepted DefaultRequestTimeoutSeconds, but input was labeled unknown.
 * Policy limits and comparisons: docs/measured-results.md.
 * measured:ALG07:end */
#include <string.h>
#include "pm.h"

double lcs_score(const char *input, const char *candidate) {
    size_t input_length = strlen(input), candidate_length = strlen(candidate);
    size_t input_index, candidate_index;
    unsigned short rows[2][KEY_MAX + 1] = {{0}};
    if (!input_length && !candidate_length) return 1;
    for (input_index = 1; input_index <= input_length; ++input_index) {
        unsigned short *current = rows[input_index % 2];
        unsigned short *previous = rows[(input_index - 1) % 2];
        current[0] = 0;
        for (candidate_index = 1; candidate_index <= candidate_length; ++candidate_index) {
            if (input[input_index - 1] == candidate[candidate_index - 1]) {
                /* Extend the best shorter-prefix sequence by this shared letter.
                 * The count cannot exceed KEY_MAX, so unsigned short is enough. */
                current[candidate_index] = (unsigned short)(previous[candidate_index - 1] + 1);
            } else {
                /* Skip either letter; retain whichever prefix already keeps more. */
                unsigned short skip_input = previous[candidate_index];
                unsigned short skip_candidate = current[candidate_index - 1];
                current[candidate_index] = skip_input > skip_candidate ? skip_input : skip_candidate;
            }
        }
    }
    {
        unsigned short common_length = rows[input_length % 2][candidate_length];
        /* Count each shared letter on both sides: abc/ac gives 4/5, not 2/5. */
        return 2 * (double)common_length / (double)(input_length + candidate_length);
    }
}
