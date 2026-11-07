/** @file
 * [PM-Ma4iF8] Run order protects the experiment:
 * validate data/tests -> calibrate every policy -> freeze -> evaluate -> time -> report.
 * --generate is deliberately separate: an ordinary run cannot rewrite its labels.
 */
#include <errno.h>
#include <stdlib.h>
#include <string.h>
#include "pm.h"

typedef enum { CLI_RUN, CLI_PRINTED_HELP, CLI_BAD_ARGUMENT } CliResult;
typedef struct { int generate; int self_test; } RequestedAction;

static void usage(void) {
    puts("C99 property matching benchmark\n"
         "Usage: ./property_match_bench [options]\n"
         "  --help                 Show usage\n"
         "  --list-algorithms      List baseline and 12 algorithms\n"
         "  --self-test            Run parser, algorithms, resolver and binding tests\n"
         "  --benchmark            Calibrate, freeze policies, evaluate and time (default)\n"
         "  --generate             Explicitly regenerate the two labeled manifests\n"
         "  --seed N               Manifest generation seed (default 42)\n"
         "  --repetitions N        Timing repetitions, 1..100 (default 5)\n"
         "  --wrong-cost N         Cost of dangerous acceptance (default 100)\n"
         "  --reject-cost N        Cost of unnecessary rejection (default 1)\n"
         "  --report PATH          Markdown output (default reports/evaluation.md)\n"
         "  --csv PATH             Per-case CSV (default reports/results.csv)\n"
         "Run from the project directory. Companion CSVs always go under reports/.");
}

/** Reject overflow and trailing junk rather than quietly accepting a partial number. */
static int unsigned_arg(const char *text, unsigned long *value, unsigned long maximum) {
    char *end;
    if (!*text || *text == '-') return 0;
    errno = 0;
    *value = strtoul(text, &end, 10);
    return !errno && !*end && *value <= maximum;
}

/** Parse flags here so main reads as experiment steps instead of string comparisons. */
static CliResult read_arguments(int argc, char **argv, Options *options, RequestedAction *action) {
    int index;
    for (index = 1; index < argc; ++index) {
        const char *argument = argv[index];
        int has_value = index + 1 < argc;
        int output_option = !strcmp(argument, "--report") || !strcmp(argument, "--csv");
        int numeric_option = !strcmp(argument, "--seed") || !strcmp(argument, "--repetitions") ||
                             !strcmp(argument, "--wrong-cost") || !strcmp(argument, "--reject-cost");
        if (!strcmp(argument, "--help")) { usage(); return CLI_PRINTED_HELP; }
        if (!strcmp(argument, "--list-algorithms")) {
            size_t algorithm;
            for (algorithm = 0; algorithm < ALGORITHMS; ++algorithm) {
                printf("%-6s %s\n", algorithms[algorithm].id, algorithms[algorithm].name);
            }
            return CLI_PRINTED_HELP;
        }
        if (!strcmp(argument, "--self-test")) { action->self_test = 1; continue; }
        if (!strcmp(argument, "--generate")) { action->generate = 1; continue; }
        if (!strcmp(argument, "--benchmark")) continue;
        if (has_value && output_option) {
            if (!strcmp(argument, "--report")) options->report = argv[++index];
            else options->csv = argv[++index];
            continue;
        }
        if (has_value && numeric_option) {
            unsigned long value;
            if (!unsigned_arg(argv[++index], &value, UINT32_MAX)) {
                fprintf(stderr, "invalid numeric option %s\n", argument);
                return CLI_BAD_ARGUMENT;
            }
            if (!strcmp(argument, "--seed")) options->seed = (uint32_t)value;
            else if (!strcmp(argument, "--repetitions")) {
                if (!value || value > 100) return CLI_BAD_ARGUMENT;
                options->repetitions = (unsigned)value;
            } else if (!strcmp(argument, "--wrong-cost")) options->costs.severe = (double)value;
            else options->costs.rejection = (double)value;
            continue;
        }
        fprintf(stderr, "unknown or incomplete option: %s\n", argument);
        return CLI_BAD_ARGUMENT;
    }
    return CLI_RUN;
}

/** A different seed/version needs explicit regeneration, never silent replacement. */
static int seed_matches(const char *path, uint32_t seed) {
    FILE *file = fopen(path, "r");
    char line[256], expected[128];
    int matches;
    if (!file) return 0;
    (void)snprintf(expected, sizeof expected, "# dataset=%s;seed=%u;", DATA_VERSION, (unsigned)seed);
    matches = fgets(line, sizeof line, file) != NULL && !strncmp(line, expected, strlen(expected));
    fclose(file);
    return matches;
}

/** Finish the complete grid file before any held-out inputs are evaluated. */
static int calibrate_all(const Dataset *calibration, const Options *options, Evaluation *evaluations) {
    FILE *grid = fopen("reports/calibration_grid.csv", "w");
    size_t algorithm;
    int written;
    if (!grid) { perror("calibration grid"); return 0; }
    fputs("algorithm,threshold,margin,max_edits,correct_fuzzy,dangerous,rejected,coverage,weighted_cost\n", grid);
    for (algorithm = 0; algorithm < ALGORITHMS; ++algorithm) {
        evaluations[algorithm].policy = calibrate(calibration, algorithm, options->costs,
                                                  &evaluations[algorithm].calibration_cost, grid);
    }
    written = !ferror(grid);
    if (fclose(grid) != 0) written = 0;
    if (!written) fputs("Cannot write complete calibration grid\n", stderr);
    return written;
}

int main(int argc, char **argv) {
    Options options = {.seed = 42, .repetitions = 5, .costs = {100, 1},
                       .report = "reports/evaluation.md", .csv = "reports/results.csv"};
    RequestedAction action = {0, 0};
    static Dataset calibration, held_out;
    static Evaluation evaluations[ALGORITHMS];
    size_t algorithm;
    CliResult arguments;
    registries_init();
    arguments = read_arguments(argc, argv, &options, &action);
    if (arguments == CLI_PRINTED_HELP) return 0;
    if (arguments == CLI_BAD_ARGUMENT) return 2;
    if (action.generate) {
        if (!generate_datasets(options.seed)) { fputs("dataset generation failed\n", stderr); return 1; }
        puts("Generated frozen calibration and held-out manifests.");
        return 0;
    }
    if (action.self_test) return self_test();
    if (!seed_matches("tests/calibration_cases.csv", options.seed) ||
        !seed_matches("tests/evaluation_cases.csv", options.seed)) {
        fputs("Manifest seed/version mismatch. Use --generate --seed N explicitly, then benchmark with the same seed.\n", stderr);
        return 1;
    }
    if (self_test()) return 1;
    if (!load_dataset("tests/calibration_cases.csv", &calibration)) return 1;
    if (!load_dataset("tests/evaluation_cases.csv", &held_out)) return 1;
    if (!validate_datasets(&calibration, &held_out)) return 1;
    puts("Calibrating policies using calibration data only...");
    fflush(stdout);
    /* Calibration writes every selected policy before evaluate sees held_out.
     * No later report or timing routine is allowed to replace those policies. */
    if (!calibrate_all(&calibration, &options, evaluations)) return 1;
    puts("Policies frozen. Evaluating held-out inputs and measuring runtime...");
    fflush(stdout);
    printf("%-7s %6s %6s %7s %7s %7s %9s\n", "Method", "Exact", "Fuzzy", "Unsafe", "Reject", "Cost", "10-key us");
    for (algorithm = 0; algorithm < ALGORITHMS; ++algorithm) {
        Metrics *metrics = &evaluations[algorithm].metrics;
        unsigned dangerous;
        evaluate(&held_out, algorithm, evaluations[algorithm].policy, &evaluations[algorithm]);
        benchmark_algorithm(algorithm, evaluations[algorithm].policy, &options, evaluations[algorithm].perf);
        dangerous = metrics->wrong + metrics->unknown_accept + metrics->ambiguous_accept;
        printf("%-7s %6u %6u %7u %7u %7.0f %9.3f\n", algorithms[algorithm].id, metrics->exact,
               metrics->fuzzy, dangerous, metrics->rejected, metric_cost(metrics, options.costs),
               evaluations[algorithm].perf[0].end.median_ns / 1000);
        fflush(stdout);
    }
    if (!generate_report(&options, &calibration, &held_out, evaluations)) { fputs("Report generation failed\n", stderr); return 1; }
    printf("Report: %s\nPer-case results: %s\n", options.report, options.csv);
    return 0;
}
