/** @file
 * [PM-Sc4nV8] Adapt every scorer to one rule: larger score means more similar.
 * Edit distances shrink as names improve, so convert d into 1-d/max_length.
 * This table connects a display name to its scorer; the resolver knows no words.
 * osa = Optimal String Alignment (restricted adjacent swaps).
 * dl = full Damerau-Levenshtein; lcs = longest common subsequence.
 * Short adapter names are internal; articles use the expanded names.
 */
#include <ctype.h>
#include <string.h>
#include "pm.h"
static double edit(const Prepared *a, const Property *b, int mode) {
    size_t n = strlen(a->text), m = strlen(b->normalized);
    return 1 - edit_distance(a->text, b->normalized, mode) / (double) (n > m ? n : m);
}

static double lev(const Prepared *a, const Property *b) {
    return edit(a, b, 0);
}

static double osa(const Prepared *a, const Property *b) {
    return edit(a, b, 1);
}

static double dl(const Prepared *a, const Property *b) {
    return edit(a, b, 2);
}

static double weighted(const Prepared *a, const Property *b) {
    size_t i;
    double n = 0, m = 0;
    for (i = 0; a->text[i]; ++i) n += isdigit((unsigned char)a->text[i]) ? 2 : 1;
    for (i = 0; b->normalized[i]; ++i) m += isdigit((unsigned char)b->normalized[i]) ? 2 : 1;
    return 1 - weighted_distance(a->text, b->normalized) / (n > m ? n : m);
}

static double jaro(const Prepared *a, const Property *b) {
    return jaro_score(a->text, b->normalized);
}
/** [PM-Wi4zS6] Jaro-Winkler adds a prefix bonus to [PM-Ja6rC3].
 * Jaro .9 and 3 leading matches -> .9 + 3*.1*(1-.9) = .93.
 * Only the first four letters count. Shared prefixes can hide important suffixes.
 */
/* measured:ALG06:start - 2026-11-07 recorded run.
 * Recovered 126/185 typos; unsafe accepts 1.
 * Median lookup, 10 properties: about 19 microseconds on this host.
 * Levenshtein recovered 174/185 with 0 unsafe accepts.
 * Input: application environment
 * Outcome: accepted ApplicationEnvironmentName, but input was labeled unknown.
 * Policy limits and comparisons: docs/measured-results.md.
 * measured:ALG06:end */
static double winkler(const Prepared *a, const Property *b) {
    double base_similarity = jaro(a, b);
    size_t prefix_length = 0;
    while (prefix_length < 4 && a->text[prefix_length] &&
           a->text[prefix_length] == b->normalized[prefix_length]) ++prefix_length;
    if (base_similarity > 0.7) {
        /* Reward matching starts by a fraction of the remaining gap to 1. */
        double prefix_bonus = (double)prefix_length * 0.1 * (1 - base_similarity);
        return base_similarity + prefix_bonus;
    }
    return base_similarity;
}

static double lcs(const Prepared *a, const Property *b) {
    return lcs_score(a->text, b->normalized);
}

static double jaccard(const Prepared *a, const Property *b) {
    return gram_score(a->text, b->normalized, 0);
}

static double dice(const Prepared *a, const Property *b) {
    return gram_score(a->text, b->normalized, 1);
}

static double cosine(const Prepared *a, const Property *b) {
    return gram_score(a->text, b->normalized, 2);
}

static double ratcliff(const Prepared *a, const Property *b) {
    return ratcliff_score(a->text, b->normalized);
}
/* ID zero deliberately has no scorer. Exact normalization still runs for all IDs.
 * Workspace values describe bounded arrays, not measured process memory. */
const Algorithm algorithms[ALGORITHMS] = {
    {
        "EXACT",
        "Exact normalized only",
        NULL,
        "ASCII normalization and unique exact match",
        "O(R*L)",
        0
    },
    {
        "ALG01",
        "Levenshtein",
        lev,
        "1 - unit edit distance / max length",
        "O(n*m) time; O(m) space",
        3 * (KEY_MAX + 1) * sizeof (double)
    },
    {
        "ALG02",
        "Optimal String Alignment",
        osa,
        "1 - restricted adjacent-transposition distance / max length",
        "O(n*m) time; O(m) space",
        3 * (KEY_MAX + 1) * sizeof (double)
    },
    {
        "ALG03",
        "Damerau-Levenshtein",
        dl,
        "1 - unrestricted unit edit distance / max length",
        "O(n*m) time; O(n*m+128) space",
        (KEY_MAX + 2) * (KEY_MAX + 2) * sizeof (unsigned short) + 128 * sizeof (size_t)
    },
    {
        "ALG04",
        "Weighted Levenshtein",
        weighted,
        "Same-row QWERTY neighbors cost 0.5; digit insertion/deletion/substitution 2; others 1; normalize by max weighted length",
        "O(n*m) time; O(m) space",
        2 * (KEY_MAX + 1) * sizeof (double)
    },
    {
        "ALG05",
        "Jaro",
        jaro,
        "Mean matched fractions and transposition agreement; window max(length)/2 - 1, floored at 0",
        "O(n*m) time; O(n+m) space",
        2 * KEY_MAX
    },
    {
        "ALG06",
        "Jaro-Winkler",
        winkler,
        "Jaro plus prefix boost p=0.1, at most 4 characters, only when Jaro > 0.7",
        "O(n*m) time; O(n+m) space",
        2 * KEY_MAX
    },
    {
        "ALG07",
        "LCS",
        lcs,
        "2 * longest common subsequence length / sum lengths",
        "O(n*m) time; O(m) space",
        2 * (KEY_MAX + 1) * sizeof (unsigned short)
    },
    {
        "ALG08",
        "Trigram Jaccard",
        jaccard,
        "Unpadded trigram set intersection / union",
        "Packing/merge O(n+m); qsort cost implementation-defined",
        2 * KEY_MAX * sizeof (uint32_t)
    },
    {
        "ALG09",
        "Bigram Dice",
        dice,
        "2 * unpadded bigram set intersection / sum set sizes",
        "Packing/merge O(n+m); qsort cost implementation-defined",
        2 * KEY_MAX * sizeof (uint32_t)
    },
    {
        "ALG10",
        "Trigram cosine",
        cosine,
        "Dot product / vector norms of unpadded trigram frequencies",
        "Packing/merge O(n+m); qsort cost implementation-defined",
        2 * KEY_MAX * sizeof (uint32_t)
    },
    {
        "ALG11",
        "Ratcliff-Obershelp",
        ratcliff,
        "2 * recursively selected longest common contiguous blocks / sum lengths; lexical tie orientation",
        "O((n+m)*n*m) conservative time; O(n+m) space",
        (2 * KEY_MAX + 1) * 4 * sizeof (size_t) + 2 * (KEY_MAX + 1) * sizeof (unsigned short)
    },
    {
        "ALG12",
        "Token-aware hybrid",
        hybrid_score,
        "0.65 Levenshtein character similarity + 0.35 ordered token alignment similarity; token substitutions use normalized Levenshtein",
        "O(n*m + T*U*L^2) conservative time; O(L+U) workspace",
        3 * (KEY_MAX + 1) * sizeof (double) + 2 * (TOKEN_MAX + 1) * sizeof (double)
    }
};
