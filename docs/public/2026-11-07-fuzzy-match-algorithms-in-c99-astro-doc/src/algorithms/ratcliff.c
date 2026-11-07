/** @file [PM-Ro1hM7] Find a shared block, then repeat on the two remaining sides.
 * abxxcd / abyycd -> keep ab; examine the right side; keep cd. Score=2*4/12.
 * Blocks are contiguous. This differs from the subsequence in [PM-Lc7sB5].
 * An explicit stack holds pending regions instead of recursive function calls.
 */
/* measured:ALG11:start - 2026-11-07 recorded run.
 * Recovered 174/185 typos; unsafe accepts 3.
 * Median lookup, 10 properties: about 23 microseconds on this host.
 * Levenshtein recovered 174/185 with 0 unsafe accepts.
 * Input: default request timeout nanoseconds
 * Outcome: accepted DefaultRequestTimeoutSeconds, but input was labeled unknown.
 * Policy limits and comparisons: docs/measured-results.md.
 * measured:ALG11:end */
#include <string.h>
#include "pm.h"

typedef struct {
    size_t input_start, candidate_start, input_length, candidate_length;
} Region;

double ratcliff_score(const char *input, const char *candidate) {
    Region pending[2 * KEY_MAX + 1];
    size_t pending_count = 1, total_matched = 0;
    size_t input_length = strlen(input), candidate_length = strlen(candidate);
    unsigned short rows[2][KEY_MAX + 1];
    if (!input_length && !candidate_length) return 1;
    /* Fixed orientation ensures a tied block is chosen the same way for a,b and b,a. */
    if (strcmp(input, candidate) > 0) {
        const char *swap_text = input;
        size_t swap_length = input_length;
        input = candidate;
        candidate = swap_text;
        input_length = candidate_length;
        candidate_length = swap_length;
    }
    pending[0] = (Region){0, 0, input_length, candidate_length};
    while (pending_count) {
        /* Pop by value: queued regions store offsets/lengths, not copied strings. */
        Region region = pending[--pending_count];
        size_t input_index, candidate_index, best_length = 0, input_block = 0, candidate_block = 0;
        memset(rows, 0, sizeof rows);
        for (input_index = 1; input_index <= region.input_length; ++input_index) {
            rows[input_index % 2][0] = 0;
            for (candidate_index = 1; candidate_index <= region.candidate_length; ++candidate_index) {
                int equal_letters = input[region.input_start + input_index - 1] ==
                                    candidate[region.candidate_start + candidate_index - 1];
                /* A mismatch resets the block: no skipping across it. */
                rows[input_index % 2][candidate_index] = equal_letters ?
                    (unsigned short)(rows[(input_index - 1) % 2][candidate_index - 1] + 1) : 0;
                if (rows[input_index % 2][candidate_index] > best_length) {
                    best_length = rows[input_index % 2][candidate_index];
                    /* End positions count letters; subtract length to get a
                     * zero-based start within this region, not the whole string. */
                    input_block = input_index - best_length;
                    candidate_block = candidate_index - best_length;
                }
            }
        }
        if (!best_length) continue;
        total_matched += best_length;
        /* abxxcd/abyycd: select ab, then cd on the right. Four selected
         * letters across two 6-letter strings give 2*4/(6+6) = 2/3.
         * Sides cannot cross, so this greedy block choice does not reorder text. */
        /* Only queue sides present in BOTH strings; an empty side cannot match. */
        if (input_block && candidate_block) {
            pending[pending_count++] = (Region){region.input_start, region.candidate_start, input_block, candidate_block};
        }
        {
            int both_have_right_side = input_block + best_length < region.input_length &&
                                       candidate_block + best_length < region.candidate_length;
            if (both_have_right_side) {
                pending[pending_count++] = (Region){
                    region.input_start + input_block + best_length,
                    region.candidate_start + candidate_block + best_length,
                    region.input_length - input_block - best_length,
                    region.candidate_length - candidate_block - best_length};
            }
        }
    }
    return 2 * (double)total_matched / (double)(input_length + candidate_length);
}
