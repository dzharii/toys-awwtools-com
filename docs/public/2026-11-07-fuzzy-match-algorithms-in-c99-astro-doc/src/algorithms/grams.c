/** @file [PM-Ng3fW6] Slide a small window over the name, then compare windows.
 * abcd -> trigrams [abc, bcd]; abce -> [abc, bce].
 * Same windows support different questions: overlap of sets, or aligned counts.
 */
#include <math.h>
#include <stdlib.h>
#include <string.h>
#include "pm.h"

static int compare_grams(const void *left, const void *right) {
    /* qsort passes addresses of array elements, not the integer values themselves. */
    uint32_t a = *(const uint32_t *)left, b = *(const uint32_t *)right;
    return (a > b) - (a < b); /* Subtraction could overflow or narrow to int. */
}

/** Pack 2/3 bytes into an integer, then use the standard library to sort them.
 * Packing preserves byte order; sorting lets two cursors merge equal grams.
 * No padding is added: "ab" contains zero trigrams, not a made-up boundary gram.
 */
static size_t sorted_grams(const char *text, unsigned width, uint32_t *grams) {
    size_t length = strlen(text), index;
    size_t count = length < width ? 0 : length - width + 1;
    for (index = 0; index < count; ++index) {
        uint32_t gram = 0;
        unsigned byte;
        for (byte = 0; byte < width; ++byte) gram = (gram << 8) | (unsigned char)text[index + byte];
        grams[index] = gram;
    }
    qsort(grams, count, sizeof *grams, compare_grams);
    return count;
}

/** [PM-Cs5uE8] Cosine keeps repetitions. A gram repeated 3 times has weight 3.
 * Merge one gram at a time: add countA*countB to dot and count^2 to each norm.
 * Equal frequency directions score 1, even if their vector lengths differ.
 */
/* measured:ALG10:start - 2026-11-07 recorded run.
 * Recovered 164/185 typos; unsafe accepts 26.
 * Median lookup, 10 properties: about 15 microseconds on this host.
 * Levenshtein recovered 174/185 with 0 unsafe accepts.
 * Input: request maximum concurrent count
 * Outcome: accepted MaximumConcurrentRequestCount, but input was labeled unknown.
 * Policy limits and comparisons: docs/measured-results.md.
 * measured:ALG10:end */
static double frequency_cosine(const uint32_t *left, size_t left_count, const uint32_t *right, size_t right_count) {
    size_t left_index = 0, right_index = 0;
    double dot = 0, left_norm = 0, right_norm = 0;
    while (left_index < left_count || right_index < right_count) {
        uint32_t gram = left_index < left_count ? left[left_index] : right[right_index];
        size_t left_frequency = 0, right_frequency = 0;
        if (right_index < right_count && right[right_index] < gram) gram = right[right_index];
        while (left_index < left_count && left[left_index] == gram) { ++left_frequency; ++left_index; }
        while (right_index < right_count && right[right_index] == gram) { ++right_frequency; ++right_index; }
        dot += (double)left_frequency * (double)right_frequency;
        left_norm += (double)left_frequency * (double)left_frequency;
        right_norm += (double)right_frequency * (double)right_frequency;
    }
    /* aaaba -> [aaa,aab,aba]; aaaa -> [aaa,aaa].
     * Frequencies: (1,1,1) and (2,0,0). dot=2, squares=3 and 4;
     * cosine=2/sqrt(3*4), about .577. Absent grams have frequency zero. */
    return dot / sqrt(left_norm * right_norm);
}

/** [PM-Jc8aK4] Jaccard = shared / union. Example [abc,bcd] / [abc,bce] = 1/3.
 * [PM-Di2gP9] Dice = 2*shared / (left unique + right unique).
 * Example bigrams [ab,bc] / [ab,bd] = 2*1/(2+2) = .5.
 * Both use sets: repeating the same gram does not increase its weight.
 */
/* measured:ALG09:start - 2026-11-07 recorded run.
 * Recovered 166/185 typos; unsafe accepts 24.
 * Median lookup, 10 properties: about 15 microseconds on this host.
 * Levenshtein recovered 174/185 with 0 unsafe accepts.
 * Input: request maximum concurrent count
 * Outcome: accepted MaximumConcurrentRequestCount, but input was labeled unknown.
 * Policy limits and comparisons: docs/measured-results.md.
 * measured:ALG09:end */
/* measured:ALG08:start - 2026-11-07 recorded run.
 * Recovered 163/185 typos; unsafe accepts 22.
 * Median lookup, 10 properties: about 15 microseconds on this host.
 * Levenshtein recovered 174/185 with 0 unsafe accepts.
 * Input: request maximum concurrent count
 * Outcome: accepted MaximumConcurrentRequestCount, but input was labeled unknown.
 * Policy limits and comparisons: docs/measured-results.md.
 * measured:ALG08:end */
static double set_overlap(const uint32_t *left, size_t left_count, const uint32_t *right, size_t right_count, int dice) {
    size_t left_index = 0, right_index = 0, left_unique = 0, right_unique = 0, shared = 0;
    while (left_index < left_count || right_index < right_count) {
        uint32_t gram = left_index < left_count ? left[left_index] : right[right_index];
        int in_left = 0, in_right = 0;
        if (right_index < right_count && right[right_index] < gram) gram = right[right_index];
        /* Consume the entire run but count its presence only once. */
        while (left_index < left_count && left[left_index] == gram) { in_left = 1; ++left_index; }
        while (right_index < right_count && right[right_index] == gram) { in_right = 1; ++right_index; }
        left_unique += (size_t)in_left;
        right_unique += (size_t)in_right;
        shared += (size_t)(in_left && in_right);
    }
    if (dice) return 2 * (double)shared / (double)(left_unique + right_unique);
    return (double)shared / (double)(left_unique + right_unique - shared);
}

/** mode 0=trigram Jaccard, 1=bigram Dice, 2=trigram frequency cosine. */
double gram_score(const char *input, const char *candidate, int mode) {
    uint32_t input_grams[KEY_MAX], candidate_grams[KEY_MAX];
    unsigned width = mode == 1 ? 2U : 3U;
    size_t input_count = sorted_grams(input, width, input_grams);
    size_t candidate_count = sorted_grams(candidate, width, candidate_grams);
    if (!strcmp(input, candidate)) return 1;
    if (!input_count || !candidate_count) return 0;
    if (mode == 2) return frequency_cosine(input_grams, input_count, candidate_grams, candidate_count);
    return set_overlap(input_grams, input_count, candidate_grams, candidate_count, mode == 1);
}
