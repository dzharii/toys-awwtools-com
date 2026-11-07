/** @file [PM-Hy9dL2] Compare spelling AND ordered words, then mix their scores.
 * "default requst timeout" vs "DefaultRequestTimeout":
 * tokens [default, requst, timeout] align with [default, request, timeout].
 * A misspelled token costs a fraction; a missing token costs 1.
 * Preparation must preserve boundaries before removing spaces [PM-No4mT8].
 */
/* measured:ALG12:start - 2026-11-07 recorded run.
 * Recovered 165/185 typos; unsafe accepts 17.
 * Median lookup, 10 properties: about 170 microseconds on this host.
 * Levenshtein recovered 174/185 with 0 unsafe accepts.
 * Input: database connection
 * Outcome: accepted DatabaseConnectionString, but input was labeled unknown.
 * Policy limits and comparisons: docs/measured-results.md.
 * measured:ALG12:end */
#include <string.h>
#include "pm.h"

double hybrid_score(const Prepared *input, const Property *candidate) {
    double rows[2][TOKEN_MAX + 1];
    size_t input_index, candidate_index;
    size_t input_tokens = input->ntokens, candidate_tokens = candidate->ntokens;
    size_t input_length = strlen(input->text), candidate_length = strlen(candidate->normalized);
    double character_similarity = 1 - edit_distance(input->text, candidate->normalized, 0) /
                                     (double)(input_length > candidate_length ? input_length : candidate_length);
    for (candidate_index = 0; candidate_index <= candidate_tokens; ++candidate_index) {
        rows[0][candidate_index] = (double)candidate_index;
    }
    for (input_index = 1; input_index <= input_tokens; ++input_index) {
        rows[input_index % 2][0] = (double)input_index;
        for (candidate_index = 1; candidate_index <= candidate_tokens; ++candidate_index) {
            const char *input_token = input->tokens[input_index - 1];
            const char *candidate_token = candidate->tokens[candidate_index - 1];
            size_t input_token_length = strlen(input_token), candidate_token_length = strlen(candidate_token);
            /* requst/request: one missing letter / seven letters = 1/7.
             * Tokens are nonempty because preparation emits only completed words. */
            double substitution = edit_distance(input_token, candidate_token, 0) /
                                  (double)(input_token_length > candidate_token_length ? input_token_length : candidate_token_length);
            double best = rows[(input_index - 1) % 2][candidate_index - 1] + substitution;
            double deletion = rows[(input_index - 1) % 2][candidate_index] + 1;
            double insertion = rows[input_index % 2][candidate_index - 1] + 1;
            if (deletion < best) best = deletion;
            if (insertion < best) best = insertion;
            rows[input_index % 2][candidate_index] = best;
        }
    }
    /* Ordered alignment penalizes reordering. This is deliberately not a token set.
     * Fixed weights were chosen before evaluation; lowercase joined keys lose words. */
    {
        double token_distance = rows[input_tokens % 2][candidate_tokens];
        size_t longer_token_count = input_tokens > candidate_tokens ? input_tokens : candidate_tokens;
        double token_similarity = 1 - token_distance / (double)longer_token_count;
        /* request -> RequestTimeout: character cost 7/14, token cost 1/2.
         * Both similarities are .5, so .65*.5 + .35*.5 = .5. */
        return 0.65 * character_similarity + 0.35 * token_similarity;
    }
}
