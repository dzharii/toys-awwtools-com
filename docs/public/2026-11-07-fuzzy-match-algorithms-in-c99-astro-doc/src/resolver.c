/** @file
 * [PM-Re6vN1] A similarity score is a suggestion, not permission to bind.
 * Exact? accept. Otherwise: score all -> top two -> threshold -> gap -> edit cap.
 * A tie is ambiguous even when the configured minimum gap is zero.
 */
#include <math.h>
#include <string.h>
#include "pm.h"

const char *status_names[5] = {"exact", "fuzzy", "ambiguous", "unknown", "invalid"};

/** Shared meaning of "accepted"; rejected results may still carry suggestions. */
int match_is_accepted(MatchStatus status) {
    return status == MATCH_EXACT || status == MATCH_FUZZY;
}

/** Cache all scores during calibration; ordinary lookups need only the best two. */
void score_candidates(const Registry *registry, const Prepared *input, size_t algorithm, double *scores) {
    size_t index;
    for (index = 0; index < registry->n; ++index) {
        scores[index] = algorithm ? algorithms[algorithm].score(input, &registry->p[index]) : 0;
    }
}

/** Lexical order settles display order only. Equal scores still cannot win. */
static int ranks_ahead(const Registry *registry, int candidate, double score, int incumbent, double incumbent_score) {
    int higher_score = score > incumbent_score + 1e-12;
    int same_score = fabs(score - incumbent_score) <= 1e-12;
    if (incumbent < 0 || higher_score) return 1;
    return same_score && strcmp(registry->p[candidate].name, registry->p[incumbent].name) < 0;
}

/** Optional cached scores let calibration change policy without rescoring names. */
Resolution decide(const Registry *registry, const Prepared *input, size_t algorithm, Policy policy, const double *scores) {
    Resolution result = {MATCH_UNKNOWN, -1, -1, 0, 0};
    size_t index;
    int exact_count = 0;
    if (registry->collision) { result.status = MATCH_INVALID; return result; }
    for (index = 0; index < registry->n; ++index) {
        if (!strcmp(input->text, registry->p[index].normalized)) {
            result.first = (int)index;
            ++exact_count;
        }
    }
    if (exact_count == 1) { result.status = MATCH_EXACT; result.best = 1; return result; }
    if (exact_count > 1) { result.status = MATCH_INVALID; return result; }
    if (!algorithm) return result; /* Algorithm zero is the exact-only baseline. */

    /* New leader: old first moves to second. No full array sort is needed. */
    for (index = 0; index < registry->n; ++index) {
        double score = scores ? scores[index] : algorithms[algorithm].score(input, &registry->p[index]);
        if (ranks_ahead(registry, (int)index, score, result.first, result.best)) {
            result.second = result.first;
            result.runner = result.best;
            result.first = (int)index;
            result.best = score;
        } else if (ranks_ahead(registry, (int)index, score, result.second, result.runner)) {
            result.second = (int)index;
            result.runner = score;
        }
    }
    /* Example: .94 passes a .90 threshold, but a .93 runner leaves only .01.
     * With a .02 margin that lookup is ambiguous, not an automatic match.
     * The 1e-12 tolerance avoids decisions caused by rounding at a boundary. */
    if (result.best + 1e-12 < policy.threshold) return result;
    {
        double lead = result.best - result.runner;
        int tied_scores = fabs(lead) <= 1e-12;
        int insufficient_lead = lead + 1e-12 < policy.margin;
        if (result.second >= 0 && (tied_scores || insufficient_lead)) {
            result.status = MATCH_AMBIGUOUS;
            return result;
        }
    }
    {
        int is_edit_algorithm = algorithm >= 1 && algorithm <= 4;
        int enforce_edit_cap = policy.max_edits >= 0 && is_edit_algorithm;
        if (enforce_edit_cap) {
            const char *candidate = registry->p[result.first].normalized;
            double distance = algorithm == 4 ? weighted_distance(input->text, candidate) :
                              edit_distance(input->text, candidate, (int)algorithm - 1);
            if (distance > (double)policy.max_edits + 1e-12) return result;
        }
    }
    result.status = MATCH_FUZZY;
    return result;
}

/** Raw key enters here. The value deliberately never influences name matching. */
Resolution resolve(const Registry *registry, const char *input, size_t algorithm, Policy policy) {
    Prepared prepared;
    Resolution invalid = {MATCH_INVALID, -1, -1, 0, 0};
    if (!registry || algorithm >= ALGORITHMS || !prepare(input, &prepared)) return invalid;
    return decide(registry, &prepared, algorithm, policy, NULL);
}
