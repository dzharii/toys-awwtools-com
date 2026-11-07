/** @file
 * [PM-Ed7kQ2] Edit distance: the cheapest way to turn one spelling into another.
 * The cells describe prefixes, not whole words. Larger prefixes reuse smaller ones.
 * Inputs here are normalized ASCII, at most KEY_MAX bytes; see [PM-No4mT8].
 * Optimal String Alignment means the restricted adjacent-letter-swap method:
 * a swapped substring cannot be edited again. The full method has no such rule.
 * Prefix/row explanation: https://www.allisons.org/ll/AlgDS/Dynamic/Edit/
 */
#include <ctype.h>
#include <math.h>
#include <string.h>
#include "pm.h"


/** [PM-Dl8xA4] Full Damerau-Levenshtein remembers where each letter last matched.
 * Example: ca -> ac -> abc costs 2. The restricted swap method returns 3 for ca -> abc.
 * Matrix indices are shifted by one; the extra border blocks nonexistent matches.
 * Reference: Lowrance-Wagner, https://doi.org/10.1145/321879.321880
 */
/* measured:ALG03:start - 2026-11-07 recorded run.
 * Recovered 174/185 typos; unsafe accepts 0.
 * Median lookup, 10 properties: about 71 microseconds on this host.
 * Same accepted results as the other edit variants in this run.
 * Input: authentiactionserverendpoint
 * Outcome: correctly resolved to AuthenticationServerEndpoint.
 * Policy limits and comparisons: docs/measured-results.md.
 * measured:ALG03:end */
static double unrestricted_distance(const char *input, const char *candidate) {
    size_t input_length = strlen(input), candidate_length = strlen(candidate);
    size_t input_index, candidate_index;
    unsigned short distance[KEY_MAX + 2][KEY_MAX + 2];
    size_t last_row[128] = {0};
    unsigned short unreachable = (unsigned short)(input_length + candidate_length);

    /* Logical prefix cost (i,j) lives at [i+1][j+1]. Row/column zero
     * are guards for a letter with no earlier match; row/column one mean empty.
     * Any valid distance is at most input_length + candidate_length. */
    distance[0][0] = unreachable;
    for (input_index = 0; input_index <= input_length; ++input_index) {
        distance[input_index + 1][0] = unreachable;
        distance[input_index + 1][1] = (unsigned short)input_index;
    }
    for (candidate_index = 0; candidate_index <= candidate_length; ++candidate_index) {
        distance[0][candidate_index + 1] = unreachable;
        distance[1][candidate_index + 1] = (unsigned short)candidate_index;
    }
    for (input_index = 1; input_index <= input_length; ++input_index) {
        size_t last_matching_column = 0;
        for (candidate_index = 1; candidate_index <= candidate_length; ++candidate_index) {
            size_t matching_row = last_row[(unsigned char)candidate[candidate_index - 1]];
            size_t matching_column = last_matching_column;
            unsigned short substitution_cost = 1;
            double ordinary_edit, transposition;
            if (input[input_index - 1] == candidate[candidate_index - 1]) {
                substitution_cost = 0;
                last_matching_column = candidate_index;
            }
            {
                double replace_cost = (double)distance[input_index][candidate_index] + substitution_cost;
                double insert_cost = (double)distance[input_index + 1][candidate_index] + 1;
                double delete_cost = (double)distance[input_index][candidate_index + 1] + 1;
                ordinary_edit = fmin(replace_cost, fmin(insert_cost, delete_cost));
            }
            /* Jump to the earlier matching pair, delete/insert the middle, then swap.
             * This can reuse older cells; the restricted method looks two rows back [PM-Os3bF9]. */
            {
                size_t deleted_between = input_index - matching_row - 1;
                size_t inserted_between = candidate_index - matching_column - 1;
                /* Zero occurrence indices lead to the guard border, not a real swap. */
                transposition = (double)distance[matching_row][matching_column] +
                                (double)deleted_between + 1 + (double)inserted_between;
            }
            distance[input_index + 1][candidate_index + 1] =
                (unsigned short)(ordinary_edit < transposition ? ordinary_edit : transposition);
        }
        last_row[(unsigned char)input[input_index - 1]] = input_index;
    }
    return distance[input_length + 1][candidate_length + 1];
}

/** [PM-Lv2pR6] Levenshtein fills a row left to right. Each cell picks the cheapest:
 * previous[j] + 1       delete the input letter
 * current[j-1] + 1      insert the candidate letter
 * previous[j-1] + 0/1   keep or replace the letter
 * Example: cat -> cut costs 1; similarity later becomes 1 - 1/3 [PM-Sc4nV8].
 */
/* measured:ALG01:start - 2026-11-07 recorded run.
 * Recovered 174/185 typos; unsafe accepts 0.
 * Median lookup, 10 properties: about 62 microseconds on this host.
 * Same accepted results as the other edit variants in this run.
 * Input: default request timeout miliseconds
 * Outcome: correctly resolved to DefaultRequestTimeoutMilliseconds.
 * Policy limits and comparisons: docs/measured-results.md.
 * measured:ALG01:end */
static double rolling_distance(const char *input, const char *candidate, int allow_adjacent_swap) {
    size_t input_length = strlen(input), candidate_length = strlen(candidate);
    size_t input_index, candidate_index;
    /* Column zero represents an empty candidate, hence KEY_MAX + 1 columns.
     * Three buffers retain i, i-1 and i-2; ordinary Levenshtein needs only i-1. */
    double rows[3][KEY_MAX + 1];
    for (candidate_index = 0; candidate_index <= candidate_length; ++candidate_index) {
        rows[0][candidate_index] = (double)candidate_index; /* Empty input: insert every letter. */
    }
    for (input_index = 1; input_index <= input_length; ++input_index) {
        /* These pointers select existing arrays. No row is copied or allocated.
         * For i=3, current reuses buffer 0; previous still points to buffer 2. */
        double *current = rows[input_index % 3];
        double *previous = rows[(input_index - 1) % 3];
        current[0] = (double)input_index; /* Empty candidate: delete every input letter. */
        for (candidate_index = 1; candidate_index <= candidate_length; ++candidate_index) {
            /* Indices count prefix letters; C byte positions start one earlier.
             * Each option finishes the SAME pair of prefixes in a different way. */
            int different_letters = input[input_index - 1] != candidate[candidate_index - 1];
            double delete_cost = previous[candidate_index] + 1;
            double insert_cost = current[candidate_index - 1] + 1;
            double replace_cost = previous[candidate_index - 1] + (different_letters ? 1 : 0);
            /* Worked cell, ca -> cu:
             * delete a: cost(c,cu)+1 = 1+1 = 2
             * insert u: cost(ca,c)+1 = 1+1 = 2
             * replace a: cost(c,c)+1 = 0+1 = 1. Keep the cheapest: 1.
             * The next t/t in cat -> cut adds zero, so the final distance is 1. */
            current[candidate_index] = fmin(delete_cost, fmin(insert_cost, replace_cost));
            /* [PM-Os3bF9] The restricted method handles crossed letters with one swap.
             * ab -> ba costs 1 instead of 2. Three rows retain the i-2 cell.
             * Unlike [PM-Dl8xA4], this recurrence cannot re-edit that substring. */
            /* measured:ALG02:start - 2026-11-07 recorded run.
             * Recovered 174/185 typos; unsafe accepts 0.
             * Median lookup, 10 properties: about 71 microseconds on this host.
             * Same accepted results as the other edit variants in this run.
             * Input: authentiactionserverendpoint
             * Outcome: correctly resolved to AuthenticationServerEndpoint.
             * Policy limits and comparisons: docs/measured-results.md.
             * measured:ALG02:end */
            if (allow_adjacent_swap && input_index > 1 && candidate_index > 1) {
                int letters_cross = input[input_index - 1] == candidate[candidate_index - 2] &&
                                    input[input_index - 2] == candidate[candidate_index - 1];
                if (letters_cross) {
                    double swapped = rows[(input_index - 2) % 3][candidate_index - 2] + 1;
                    if (swapped < current[candidate_index]) current[candidate_index] = swapped;
                }
            }
        }
    }
    return rows[input_length % 3][candidate_length];
}

/** mode 0=Levenshtein, 1=restricted adjacent swaps, 2=full Damerau-Levenshtein. */
double edit_distance(const char *input, const char *candidate, int mode) {
    if (mode == 2) return unrestricted_distance(input, candidate);
    return rolling_distance(input, candidate, mode == 1);
}

/** [PM-We5tJ1] Global typing costs: nearby horizontal keys .5; digits 2; others 1.
 * a -> s costs .5, but V1 -> V2 costs 2. No property-specific exceptions.
 */
/* measured:ALG04:start - 2026-11-07 recorded run.
 * Recovered 174/185 typos; unsafe accepts 0.
 * Median lookup, 10 properties: about 330 microseconds on this host.
 * Same accepted results as the other edit variants in this run.
 * Input: apiendpoinqv2
 * Outcome: correctly resolved to ApiEndpointV2.
 * Policy limits and comparisons: docs/measured-results.md.
 * measured:ALG04:end */
static double substitution_cost(char input, char candidate) {
    const char *keyboard_rows[] = {"qwertyuiop", "asdfghjkl", "zxcvbnm"};
    size_t row;
    if (input == candidate) return 0;
    if (isdigit((unsigned char)input) || isdigit((unsigned char)candidate)) return 2;
    for (row = 0; row < 3; ++row) {
        const char *input_key = strchr(keyboard_rows[row], input);
        const char *candidate_key = strchr(keyboard_rows[row], candidate);
        if (input_key && candidate_key) {
            int adjacent_keys = input_key - candidate_key == 1 || candidate_key - input_key == 1;
            if (adjacent_keys) return 0.5;
        }
    }
    return 1;
}

/** Same row movement as [PM-Lv2pR6], but each move has a typing cost. */
double weighted_distance(const char *input, const char *candidate) {
    size_t input_length = strlen(input), candidate_length = strlen(candidate);
    size_t input_index, candidate_index;
    double rows[2][KEY_MAX + 1];
    rows[0][0] = 0;
    for (candidate_index = 1; candidate_index <= candidate_length; ++candidate_index) {
        rows[0][candidate_index] = rows[0][candidate_index - 1] +
                                  (isdigit((unsigned char)candidate[candidate_index - 1]) ? 2 : 1);
    }
    for (input_index = 1; input_index <= input_length; ++input_index) {
        double *current = rows[input_index % 2];
        double *previous = rows[(input_index - 1) % 2];
        /* Operation price is local; a cell stores the accumulated cheapest cost. */
        double deletion_cost = isdigit((unsigned char)input[input_index - 1]) ? 2 : 1;
        current[0] = previous[0] + deletion_cost;
        for (candidate_index = 1; candidate_index <= candidate_length; ++candidate_index) {
            double insertion_cost = isdigit((unsigned char)candidate[candidate_index - 1]) ? 2 : 1;
            double delete_total = previous[candidate_index] + deletion_cost;
            double insert_total = current[candidate_index - 1] + insertion_cost;
            double replace_total = previous[candidate_index - 1] +
                                   substitution_cost(input[input_index - 1], candidate[candidate_index - 1]);
            /* a -> s: replacement .5 beats delete+insert 2.
             * v1 -> v2: replacement 2 beats digit delete+insert 4. */
            current[candidate_index] = fmin(delete_total, fmin(insert_total, replace_total));
        }
    }
    return rows[input_length % 2][candidate_length];
}
