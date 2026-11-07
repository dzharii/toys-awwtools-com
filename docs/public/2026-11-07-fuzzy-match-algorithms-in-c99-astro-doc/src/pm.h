/** @file
 * [PM-Ap8iD6] Shared data contracts. Start here to see what moves between files.
 * Entry is raw parsed text; Prepared is normalized text plus words;
 * Resolution is a decision plus suggestions; Configuration stores bound values.
 * All arrays own their bytes except Registry.p, which borrows a property array.
 */
#ifndef PM_H
#define PM_H
#include <stddef.h>
#include <stdint.h>
#include <stdio.h>
/* Bounds count bytes before normalization; arrays add one byte for the terminator. */
#define KEY_MAX 128
#define VALUE_MAX 1024
#define LINE_MAX_PM 1280
#define TOKEN_MAX 32
#define MAX_PROPERTIES 1000
#define MAX_CASES 1000
#define ALGORITHMS 13
#define CATEGORIES 14
#define DATA_VERSION "2026-11-v2"
typedef enum {TYPE_STRING, TYPE_INTEGER, TYPE_BOOLEAN} ValueType;
/** A canonical name plus its cached spelling/tokens and value rules. */
typedef struct {
    char name[KEY_MAX + 1];
    char normalized[KEY_MAX + 1];
    char tokens[TOKEN_MAX][KEY_MAX + 1];
    size_t ntokens;
    ValueType type;
    int required;
} Property;
/** Borrowed property table. collision blocks every lookup against this schema. */
typedef struct {
    char id[32];
    Property *p;
    size_t n;
    int collision;
} Registry;
/** Parser output. The value is still literal text, including later equals signs. */
typedef struct {
    char key[KEY_MAX + 1];
    char value[VALUE_MAX + 1];
} Entry;
/** One applied value. Only the typed member matching Property.type is meaningful. */
typedef struct {
    int present;
    char raw[VALUE_MAX + 1];
    int integer;
    int boolean;
} BoundValue;
/** Values use registry indices. Missing optional entries have present=0. */
typedef struct {
    BoundValue values[MAX_PROPERTIES];
    size_t n;
} Configuration;
typedef enum {PARSE_OK, PARSE_MISSING_EQUALS, PARSE_EMPTY_KEY, PARSE_TOO_LONG} ParseStatus;
typedef enum {MATCH_EXACT, MATCH_FUZZY, MATCH_AMBIGUOUS, MATCH_UNKNOWN, MATCH_INVALID} MatchStatus;
/** Two simultaneous views: joined lowercase text and ordered lowercase tokens. */
typedef struct {
    char text[KEY_MAX + 1];
    char tokens[TOKEN_MAX][KEY_MAX + 1];
    size_t ntokens;
} Prepared;
/* A function pointer lets every algorithm use the same caller. Inputs are
 * borrowed read-only; the returned number measures similarity, not certainty. */
typedef double (*ScoreFunction)(const Prepared *, const Property *);
/** The scoring interface and report metadata. score=NULL is the exact-only baseline. */
typedef struct {
    const char *id;
    const char *name;
    ScoreFunction score;
    const char *definition;
    const char *complexity;
    size_t workspace;
} Algorithm;
/** Acceptance knobs: threshold=minimum score, margin=minimum lead, max_edits=-1 disables cap. */
typedef struct {
    double threshold, margin;
    int max_edits;
} Policy;
/** first/second are property indices or -1; best/runner are their scores, even after rejection. */
typedef struct {
    MatchStatus status;
    int first, second;
    double best, runner;
} Resolution;
typedef enum {EXPECT_RESOLVED, EXPECT_UNKNOWN, EXPECT_AMBIGUOUS, EXPECT_INVALID} Expected;
/** Frozen intent: expected + target are labels, never guesses produced by an algorithm. */
typedef struct {
    char id[32], schema[32], category[48], input[KEY_MAX + 1], target[KEY_MAX + 1], family[64];
    Expected expected;
} TestCase;
/** A bounded list of distinct labeled cases, not repeated benchmark iterations. */
typedef struct {
    TestCase cases[MAX_CASES];
    size_t n;
} Dataset;
/** Disjoint outcome counts plus denominators; keep unsafe accepts visible next to percentages. */
typedef struct {
    unsigned exact, fuzzy, wrong, unknown_accept, ambiguous_accept, rejected, unknown_reject, ambiguity, ambiguous_unknown,
    invalid, fuzzy_inputs, eligible, total;
} Metrics;
/** Relative penalty weights. severe applies to every unsafe automatic acceptance. */
typedef struct {
    double severe, rejection;
} Costs;
/** One held-out diagnostic. target=-1 means no intended target; failure is label disagreement. */
typedef struct {
    Resolution resolution;
    int target;
    int failure;
} CaseResult;
/** Nanoseconds until rendering, except qps. Trial values summarize repetition means. */
typedef struct {
    double total_ns, mean_ns, median_ns, p95_ns, p99_ns, qps, trial_min_ns, trial_max_ns, trial_median_ns;
    size_t queries;
} Timing;
/** Two timing paths at one registry size; preprocessing is outside both paths. */
typedef struct {
    Timing end, score;
    double preprocessing_ns, normalization_ns;
    size_t registry_size;
} Performance;
/** Frozen policy, outcomes and performance for one algorithm. */
typedef struct {
    Policy policy;
    Metrics metrics, category[CATEGORIES];
    CaseResult results[MAX_CASES];
    Performance perf[4];
    double calibration_cost;
} Evaluation;
/** CLI settings. Seed identifies manifests; it does not silently regenerate them. */
typedef struct {
    uint32_t seed;
    unsigned repetitions;
    Costs costs;
    const char *report, *csv;
} Options;
extern const Algorithm algorithms[ALGORITHMS];
extern const char *category_names[CATEGORIES];
extern const char *status_names[5];
/* Parse/prepare/cache: the front of the data path. See [PM-Pa7kQ2], [PM-No4mT8]. */
ParseStatus parse_entry(const char *line, Entry *out);
int normalize(const char *input, char *output, size_t capacity);
int prepare(const char *input, Prepared *prepared);
int property_init(Property *property, const char *name, ValueType type, int required);
int registry_init(Registry *registry, const char *id, Property *properties, size_t count);
Registry *registry_get(const char *id);
void registries_init(void);
int registry_scale(Registry *registry, Property *property, size_t count);
/* Ranking and acceptance policy: see [PM-Re6vN1]. */
int match_is_accepted(MatchStatus status);
Resolution resolve(const Registry *registry, const char *input, size_t algorithm, Policy policy);
Resolution decide(const Registry *registry, const Prepared *input, size_t algorithm, Policy policy, const double *scores);
void score_candidates(const Registry *registry, const Prepared *input, size_t algorithm, double *scores);
/* Scoring consumes validated, nonempty ASCII names; no explicit per-query heap allocations; qsort workspace is library-dependent. */
double edit_distance(const char *input, const char *candidate, int mode);
double weighted_distance(const char *input, const char *candidate);
double jaro_score(const char *input, const char *candidate);
double lcs_score(const char *input, const char *candidate);
double gram_score(const char *input, const char *candidate, int mode);
double ratcliff_score(const char *input, const char *candidate);
double hybrid_score(const Prepared *input, const Property *candidate);
/* Binding never uses the value to influence which name wins. See [PM-Bi7nA3]. */
int bind_lines(const Registry *registry, const char *const * lines, size_t count, size_t algorithm, Policy policy, char *diagnostic,
    size_t diagnostic_capacity);
int bind_configuration(const Registry *registry, const char *const * lines, size_t count,
    size_t algorithm, Policy policy, Configuration *out,
    char *diagnostic, size_t diagnostic_capacity);
int value_valid(const Property *property, const char *text);
/* Explicit data generation and strict loading: see [PM-Da9sE2]. */
int generate_datasets(uint32_t seed);
int load_dataset(const char *path, Dataset *d);
int validate_datasets(const Dataset *a, const Dataset *b);
int self_test(void);
int category_index(const char *s);
/* Calibrate first, freeze Policy, then evaluate. See [PM-Ca8qD4]. */
void metrics_add(Metrics *metrics, const TestCase *test, const Resolution *result, const Registry *registry);
double metric_cost(const Metrics *metrics, Costs costs);
Policy calibrate(const Dataset *dataset, size_t algorithm, Costs costs, double *chosen_cost, FILE *grid);
void evaluate(const Dataset *dataset, size_t algorithm, Policy policy, Evaluation *evaluation);
void benchmark_algorithm(size_t algorithm, Policy policy, const Options *options, Performance *performance);
double now_ns(void);
int generate_report(const Options *options, const Dataset *calibration, const Dataset *held_out, const Evaluation *evaluations);
/* Include project headers after system headers, so bans cannot rewrite library declarations. */
#include "banned.h"
#endif
