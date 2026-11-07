/** @file
 * [PM-Be8tR5] Time matching, not printing or file work.
 * Prepare registry -> warm both paths -> time repeated queries -> sort samples.
 * A volatile checksum consumes results so GCC cannot discard the work.
 */
#define _POSIX_C_SOURCE 200809L
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include "pm.h"
/* Written inside measured calls; never optimized away as an unused result. */
static volatile double sink;
/** Prefer elapsed monotonic time; portable C99 fallback measures CPU time. */
double now_ns(void) {
#if defined(_POSIX_TIMERS) || defined(CLOCK_MONOTONIC)
    struct timespec timing;
    if (clock_gettime(CLOCK_MONOTONIC, &timing) == 0) return (double) timing.tv_sec * 1e9 + (double) timing.tv_nsec;
#endif
    return (double) clock() * 1e9 / (double) CLOCKS_PER_SEC;
}

static int cmp_double(const void *a, const void *b) {
    double x = *(const double *) a, y = *(const double *) b;
    return (x > y) - (x < y);
}
/** [PM-Ti6mC4] Timing samples and trial means answer different questions.
 * Samples give latency percentiles. Trial means show variation across passes.
 * P95 uses ceil(.95*N)-1 in the sorted array; units remain nanoseconds here.
 */
static void summarize(Timing *timing, double *samples, size_t sample_count, double *trials, size_t repetitions) {
    size_t index;
    double total = 0;
    for (index = 0; index < sample_count; ++index) total += samples[index];
    qsort(samples, sample_count, sizeof *samples, cmp_double);
    qsort(trials, repetitions, sizeof *trials, cmp_double);
    timing->queries = sample_count;
    timing->total_ns = total;
    timing->mean_ns = total / (double) sample_count;
    timing->median_ns = sample_count % 2 ? samples[sample_count / 2] : (samples[sample_count / 2 - 1] + samples[sample_count / 2]) / 2;
    /* Nearest-rank percentile: 84 samples -> ceil(.95*84)=80 -> C index 79.
     * +99 rounds the integer division upward; -1 converts rank to array index. */
    timing->p95_ns = samples[(95 * sample_count + 99) / 100 - 1];
    timing->p99_ns = samples[(99 * sample_count + 99) / 100 - 1];
    timing->trial_median_ns = repetitions % 2 ? trials[repetitions / 2] : (trials[repetitions / 2 - 1] + trials[repetitions / 2]) / 2;
    timing->qps = 1e9 / timing->mean_ns;
    timing->trial_min_ns = trials[0];
    timing->trial_max_ns = trials[repetitions - 1];
}
/** The two paths use the same probes:
 * mode 0: raw text -> prepare -> exact/fuzzy -> decision.
 * mode 1: prepared text -> every candidate score; no ranking or decision.
 */
void benchmark_algorithm(size_t algorithm, Policy policy, const Options *options, Performance *performance) {
    const size_t sizes[] = {10, 50, 100, 1000};
    static Property properties[MAX_PROPERTIES];
    static Prepared queries[12];
    char inputs[12][KEY_MAX + 1];
    size_t size_index, query_index, repetition, mode;
    double scores[MAX_PROPERTIES];
    double *samples = malloc((size_t) options->repetitions * 12 * sizeof *samples), *trials = malloc((size_t) options->repetitions * sizeof *trials);
    if (!samples || !trials) {
        fprintf(stderr, "benchmark allocation failed\n");
        free(samples);
        free(trials);
        exit(1);
    }
    for (size_index = 0; size_index < 4; ++size_index) {
        Registry registry;
        double start = now_ns();
        if (!registry_scale(&registry, properties, sizes[size_index])) exit(1);
        performance[size_index].preprocessing_ns = now_ns() - start;
        performance[size_index].registry_size = sizes[size_index];
        for (query_index = 0; query_index < 12; ++query_index) {
            size_t property_index = query_index < 10 ? query_index : sizes[size_index] - 1 - (query_index - 10);
            const char *normalized = properties[property_index].normalized;
            /* Both arrays have KEY_MAX+1 bytes; registry construction validated the source. */
            memcpy(inputs[query_index], normalized, strlen(normalized) + 1);
            if (strlen(inputs[query_index]) > 4) inputs[query_index][3] = 'x';
        }
        /* Measure preparation separately; it is also part of end-to-end timing. */
        start = now_ns();
        for (repetition = 0; repetition < 100; ++repetition) for (query_index = 0; query_index < 12; ++query_index) {
            (void) prepare(inputs[query_index], &queries[query_index]);
            sink += (double) queries[query_index].ntokens;
        }
        performance[size_index].normalization_ns = (now_ns() - start) / 1200;
        /* Warm both paths, including candidate preprocessing, before timing. */
        for (query_index = 0; query_index < 12; ++query_index) {
            Resolution result = resolve(&registry, inputs[query_index], algorithm, policy);
            sink += result.best;
            score_candidates(&registry, &queries[query_index], algorithm, scores);
            sink += scores[0];
        }
        for (mode = 0; mode < 2; ++mode) {
            size_t index = 0;
            for (repetition = 0; repetition < options->repetitions; ++repetition) {
                double total = 0;
                for (query_index = 0; query_index < 12; ++query_index) {
                    double elapsed;
                    /* Measured interval starts here; report work is outside this function. */
                    start = now_ns();
                    if (mode == 0) {
                        Resolution result = resolve(&registry, inputs[query_index], algorithm, policy);
                        sink += result.best + (double) result.status;
                    } else {
                        score_candidates(&registry, &queries[query_index], algorithm, scores);
                        sink += scores[query_index % sizes[size_index]];
                    }
                    elapsed = now_ns() - start;
                    samples[index++] = elapsed;
                    total += elapsed;
                }
                trials[repetition] = total / 12;
            }
            summarize(mode == 0 ? &performance[size_index].end : &performance[size_index].score, samples, index, trials, options->repetitions);
        }
    }
    free(samples);
    free(trials);
}
