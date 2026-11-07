/** @file
 * [PM-Da9sE2] Labels are the answer key; the algorithms do not create them.
 * Generation is explicit. Benchmark runs load frozen CSVs and validate them.
 * A family belongs to only one split: related typos must not leak into calibration.
 */
#include <ctype.h>
#include <errno.h>
#include <stdlib.h>
#include <string.h>
#include "pm.h"
const char *category_names[CATEGORIES] = {
    "exact",
    "formatting",
    "deletion",
    "insertion",
    "substitution",
    "transposition",
    "multiple_errors",
    "punctuation_boundary",
    "partial",
    "reordered_semantic",
    "near_collision",
    "unknown",
    "ambiguous",
    "length_boundary"
};
static uint32_t random_state;
/** Fixed xorshift32 moves the seed through the same sequence on every run. */
static uint32_t next_random(void) {
    uint32_t x = random_state;
    x ^= x << 13;
    x ^= x >> 17;
    x ^= x << 5;
    random_state = x;
    return x;
}
/** Map a stored label to the same bucket used in the report; -1 means invalid metadata. */
int category_index(const char *s) {
    int i;
    for (i = 0; i < CATEGORIES; ++i) if (!strcmp(s, category_names[i])) return i;
    return - 1;
}
/** Find a target by its authoritative name, never by fuzzy similarity. */
static int target_index(const Registry *r, const char *target) {
    size_t i;
    for (i = 0; i < r->n; ++i) if (!strcmp(r->p[i].name, target)) return (int) i;
    return - 1;
}
/** [PM-La4bV7] Admit a labeled case only after checking its identity and intent.
 * A generated typo must not become another real property. Duplicate rows are refused. */
static int append(Dataset *d, const char *prefix, const char *schema, int category, const char *input, const char *target,
    Expected expected, const char *family) {
    size_t i;
    TestCase *c;
    Registry *r = registry_get(schema);
    char norm[KEY_MAX + 1];
    int valid = normalize(input, norm, sizeof norm);
    int case_fits = d->n < MAX_CASES && strlen(input) <= KEY_MAX;
    int valid_category = category >= 0 && category < CATEGORIES;
    int metadata_fits = strlen(schema) < sizeof d->cases[0].schema &&
                        strlen(target) < sizeof d->cases[0].target &&
                        strlen(family) < sizeof d->cases[0].family;
    if (!case_fits || !valid_category || !metadata_fits || !r) return 0;
    for (i = 0; i < d->n; ++i) if (!strcmp(d->cases[i].schema, schema) && !strcmp(d->cases[i].input, input)) return 0;
    if (expected == EXPECT_RESOLVED && target_index(r, target) < 0) return 0;
    if (valid && !r->collision) {
        for (i = 0; i < r->n; ++i) {
            int exact_canonical_name = !strcmp(norm, r->p[i].normalized);
            int inconsistent_label = expected != EXPECT_RESOLVED || strcmp(target, r->p[i].name);
            if (exact_canonical_name && inconsistent_label) return 0;
        }
    }
    c = &d->cases[d->n];
    memset(c, 0, sizeof *c);
    (void) snprintf(c->id, sizeof c->id, "%s%04zu", prefix, d->n + 1);
    /* Capacities were checked above; include the terminator in each copy. */
    memcpy(c->schema, schema, strlen(schema) + 1);
    memcpy(c->category, category_names[category], strlen(category_names[category]) + 1);
    memcpy(c->input, input, strlen(input) + 1);
    memcpy(c->target, target, strlen(target) + 1);
    memcpy(c->family, family, strlen(family) + 1);
    c->expected = expected;
    ++d->n;
    return 1;
}
/** Create formatting variants from PascalCase without changing their intended target. */
static void spaced(const char *s, char *out, char separator, int upper) {
    size_t i, k = 0;
    for (i = 0; s[i] && k < KEY_MAX; ++i) {
        unsigned char c = (unsigned char) s[i];
        int word_start = i && isupper(c) && islower((unsigned char)s[i - 1]);
        if (word_start && k < KEY_MAX) out[k++] = separator;
        if (k >= KEY_MAX) break;
        out[k++] = (char)(upper ? toupper(c) : tolower(c));
    }
    out[k] = '\0';
}
/** [PM-Mu8zN3] kind 0=delete, 1=insert, 2=replace, 3=swap, 4=two replacements.
 * Deletion shifts the suffix left; insertion shifts it right, including the terminator.
 * Repeated-letter swaps are skipped because they would not change the spelling. */
static int mutate(const char *s, char *out, int kind) {
    size_t n = strlen(s), pos = (size_t) (next_random() % (uint32_t) n);
    char ch = (char) ('a' + next_random() % 26U);
    if (n > KEY_MAX) return 0;
    memcpy(out, s, n + 1); /* Every caller provides KEY_MAX+1 bytes. */
    /* Suffix source/destination overlap: use memmove, not memcpy.
     * Deleting from "cat" at pos=1 copies "t" AND its '\0' over "at". */
    if (kind == 0) memmove(out + pos, out + pos + 1, n - pos);
    else if (kind == 1) {
        if (n >= KEY_MAX) return 0;
        memmove(out + pos + 1, out + pos, n - pos + 1);
        out[pos] = ch;
    } else if (kind == 2) {
        if (out[pos] == ch) return 0;
        out[pos] = ch;
    } else if (kind == 3) {
        char t;
        if (pos + 1 >= n || out[pos] == out[pos + 1]) return 0;
        t = out[pos];
        out[pos] = out[pos + 1];
        out[pos + 1] = t;
    } else {
        size_t p2 = (pos + n / 2) % n;
        out[pos] = ch;
        out[p2] = (char) ('a' + next_random() % 26U);
    }
    return strcmp(s, out) != 0;
}
/** Retry rejected mutations until the requested distinct-case count is filled, with a finite attempt cap. */
static int generated(Dataset *d, const char *prefix, const char *schema, int category, size_t count, int kind) {
    Registry *r = registry_get(schema);
    size_t added = 0, tries = 0;
    char input[KEY_MAX + 1], family[64];
    while (added < count && tries++< 100000) {
        size_t p = (size_t) (next_random() % (uint32_t) r->n);
        if (!mutate(r->p[p].normalized, input, kind)) continue;
        (void) snprintf(family, sizeof family, "%s-%zu-mut%d", schema, p, kind);
        if (append(d, prefix, schema, category, input, r->p[p].name, EXPECT_RESOLVED, family)) ++added;
    }
    return added == count;
}
/** Write the simple seven-column manifest; generated fields contain no commas/newlines. */
static int save(const char *path, const Dataset *d, uint32_t seed) {
    FILE *f = fopen(path, "w");
    size_t i;
    if (!f) return 0;
    fprintf(f, "# dataset=%s;seed=%u;split=%s\n", DATA_VERSION, (unsigned) seed, path);
    fputs("id,schema,category,input,expected,target,family\n", f);
    for (i = 0; i < d->n; ++i) {
        const TestCase *c = &d->cases[i];
        fprintf(f, "%s,%s,%s,%s,%d,%s,%s\n", c->id, c->schema, c->category, c->input, (int) c->expected, c->target, c->family);
    }
    return fclose(f) == 0;
}
/** [PM-Ge6qH1] Build development data first, then the held-out groups.
 * Calibration vocabulary is separate. Adding held-out cases cannot improve its policy.
 * Stable append order produces stable IDs; changing generation changes the experiment. */
int generate_datasets(uint32_t seed) {
    static Dataset calibration, held;
    size_t i, j;
    char input[KEY_MAX + 1];
    Registry *base = registry_get("base"), *adv = registry_get("adversarial"), *cal = registry_get("calibration"),
    *sh = registry_get("short"), *boundary = registry_get("boundary");
    const char *original[] = {
        "database connection strng",
        "authentication server endpint",
        "application environment name",
        "maximum concurent request count",
        "default request timeout seconds",
        "enable detailed error loging",
        "external notification service url",
        "temporary file storage directory",
        "background task execution interval seconds",
        "enable automatic configuration relod"
    };
    const char *partials[] = {
        "database connection",
        "authentication server",
        "environment name",
        "maximum concurrent request cnt",
        "default request timeout",
        "detailed error logging",
        "notification service",
        "temporary file storage",
        "background task interval",
        "automatic configuration",
        "database string",
        "server endpoint",
        "application environment",
        "request count",
        "timeout seconds",
        "error logging",
        "service url",
        "storage directory",
        "execution interval",
        "configuration reload"
    };
    const char *semantic[] = {
        "connection string database",
        "endpoint authentication server",
        "environment application name",
        "request maximum concurrent count",
        "seconds default request timeout",
        "logging enable detailed error",
        "url external notification service",
        "directory temporary file storage",
        "seconds background task execution interval",
        "configuration enable automatic reload",
        "server URL",
        "database URL",
        "worker pool capacity",
        "verbose exception reports",
        "refresh settings automatically",
        "temp folder",
        "notification webhook",
        "auth service address",
        "application stage",
        "request deadline"
    };
    const char *unknown[] = {
        "unknown configuration field",
        "database encryption key",
        "maximum worker thread priority",
        "notification retry policy",
        "authentication provider certificate",
        "default request timeout nanoseconds",
        "database connection strong password",
        "enable detailed fatal logging",
        "external notification secret",
        "temporary directory retention days"
    };
    const char *amb[] = {
        "auth server endpoint",
        "default request timeout",
        "maximum concurrent requests",
        "enable detailed logging",
        "notification service url",
        "temporary file directory",
        "background task execution interval",
        "enable automatic configuration",
        "connection bound",
        "io buffer size"
    };
    const char *cal_amb[] = {
        "telemetry collector",
        "session expiration",
        "batch queue depth",
        "enable verbose trace",
        "message limit",
        "persistent folder",
        "scheduler period",
        "transport protocol"
    };
    const char *punct[] = {
        "database.connection.string",
        "authentication/server/endpoint",
        "application:environment:name",
        "maximum concurrent request count!",
        "default request timeout seconds?",
        "enable detailed error logging'",
        "external notification service url@",
        "temporary file storage directory\\",
        "background task execution interval seconds;",
        "enable automatic configuration reload%"
    };
    /* 184 calibration rows; none use the held-out canonical vocabulary. */
    memset(&calibration, 0, sizeof calibration);
    memset(&held, 0, sizeof held);
    random_state = seed ? seed : UINT32_C(0x9e3779b9);
    /* Entire schemas and mutation families are assigned to one split. */
    for (i = 0; i < 16; ++i) {
        spaced(cal->p[i].name, input, ' ', 0);
        if (!append(&calibration, "C", "calibration", 1, input, cal->p[i].name, EXPECT_RESOLVED, "calibration-format")) return 0;
    }
    for (i = 0; i < 5; ++i) if (!generated(&calibration, "C", "calibration", (int) i + 2, 24, (int) i)) return 0;
    for (i = 0; i < 24; ++i) {
        (void) snprintf(input, sizeof input, "unregistered security option %zu", i);
        if (!append(&calibration, "C", "calibration", 11, input, "", EXPECT_UNKNOWN, "calibration-negative")) return 0;
    }
    for (i = 0; i < 24; ++i) {
        (void) snprintf(input, sizeof input, "%s%s", cal_amb[i % 8], i / 8 == 0 ? "" : i / 8 == 1 ? " " : "-");
        if (!append(&calibration, "C", "calibration", 12, input, "", EXPECT_AMBIGUOUS, "calibration-ambiguous")) return 0;
    }
    /* Held-out groups follow the minimum counts listed in docs/methodology.md. */
    for (i = 0; i < 20; ++i) {
        Registry *r = i < 10 ? base : adv;
        size_t p = i;
        if (!append(&held, "E", r->id, 0, r->p[p].name, r->p[p].name, EXPECT_RESOLVED, "held-exact")) return 0;
    }
    for (i = 0; i < 30; ++i) {
        spaced(base->p[i % 10].name, input, i / 10 == 0 ? ' ' : i / 10 == 1 ? '_' : '-', i / 10 == 1);
        if (!append(&held, "E", "base", 1, input, base->p[i % 10].name, EXPECT_RESOLVED, "held-format")) return 0;
    }
    /* Original examples are curated alongside the generated mutations. */
    for (i = 0; i < 10; ++i) {
        char norm[KEY_MAX + 1];
        (void) normalize(original[i], norm, sizeof norm);
        if (strcmp(norm, base->p[i].normalized) && !append(&held, "E", "base", 2, original[i], base->p[i].name, EXPECT_RESOLVED,
            "held-original")) return 0;
    }
    if (!generated(&held, "E", "base", 2, 20, 0)) return 0;
    for (i = 3; i <= 6; ++i) if (!generated(&held, "E", "base", (int) i, i == 6 ? 30 : 25, (int) i - 2)) return 0;
    for (i = 0; i < 10; ++i) if (!append(&held, "E", "base", 7, punct[i], "", EXPECT_INVALID, "held-unsupported")) return 0;
    for (i = 0; i < 10; ++i) {
        spaced(base->p[i].name, input, '-', 0);
        for (j = 0; input[j]; ++j) if (input[j] == '-' && j % 2) input[j] = '_';
        if (!append(&held, "E", "adversarial", 7, input, base->p[i].name, EXPECT_RESOLVED, "held-token-boundary")) return 0;
    }
    for (i = 0; i < 5; ++i) {
        spaced(base->p[i].name, input, '\t', 0);
        if (!append(&held, "E", "base", 7, input, base->p[i].name, EXPECT_RESOLVED, "held-tab")) return 0;
    }
    for (i = 0; i < 20; ++i) if (!append(&held, "E", "base", 8, partials[i], i == 3 ? base->p[3].name : "", i == 3 ? EXPECT_RESOLVED : EXPECT_UNKNOWN,
        "held-partial")) return 0;
    for (i = 0; i < 20; ++i) if (!append(&held, "E", "base", 9, semantic[i], "", EXPECT_UNKNOWN, "held-reorder-alias")) return 0;
    if (!append(&held, "E", "adversarial", 10, "default request timeout miliseconds", adv->p[11].name, EXPECT_RESOLVED,
        "held-unit-typo")) return 0;
    if (!generated(&held, "E", "adversarial", 10, 44, 2)) return 0;
    for (i = 0; i < 35; ++i) {
        if (i < 10) memcpy(input, unknown[i], strlen(unknown[i]) + 1);
        else (void) snprintf(input, sizeof input, "unregistered infrastructure parameter %zu", i);
        if (!append(&held, "E", "adversarial", 11, input, "", EXPECT_UNKNOWN, "held-unknown")) return 0;
    }
    for (i = 0; i < 30; ++i) {
        (void) snprintf(input, sizeof input, "%s%s", amb[i % 10], i / 10 == 0 ? "" : i / 10 == 1 ? " " : "-");
        if (!append(&held, "E", "adversarial", 12, input, "", EXPECT_AMBIGUOUS, "held-ambiguous")) return 0;
    }
    for (i = 0; i < 12; ++i) if (!append(&held, "E", "short", 13, sh->p[i].name, sh->p[i].name, EXPECT_RESOLVED,
        "held-short-exact")) return 0;
    if (!generated(&held, "E", "short", 13, 8, 2)) return 0;
    for (i = 0; i < 2; ++i) if (!append(&held, "E", "boundary", 13, boundary->p[i].name, boundary->p[i].name, EXPECT_RESOLVED,
        "held-max-length")) return 0;
    memcpy(input, boundary->p[0].name, strlen(boundary->p[0].name) + 1);
    input[60] = 'z';
    if (!append(&held, "E", "boundary", 13, input, boundary->p[0].name, EXPECT_RESOLVED, "held-max-typo")) return 0;
    if (!append(&held, "E", "collision", 13, "DatabaseConnectionString", "", EXPECT_INVALID, "held-collision")) return 0;
    if (!append(&held, "E", "short", 13, "\xc3\xa9", "", EXPECT_INVALID, "held-nonascii")) return 0;
    return save("tests/calibration_cases.csv", &calibration, seed) && save("tests/evaluation_cases.csv", &held, seed);
}
/** [PM-Lo2dJ5] Read a strict CSV subset into bounded fields.
 * Split commas in-place, check every capacity, then copy. Do not truncate labels. */
int load_dataset(const char *path, Dataset *d) {
    FILE *f = fopen(path, "r");
    char line[2048];
    size_t row = 0;
    if (!f) return 0;
    d->n = 0;
    while (fgets(line, sizeof line, f)) {
        char *fields[7], *p = line;
        size_t k;
        TestCase *c;
        long outcome;
        ++row;
        if (line[0] == '#' || !strncmp(line, "id,", 3)) continue;
        if (!strchr(line, '\n') || d->n >= MAX_CASES) {
            fclose(f);
            return 0;
        }
        line[strcspn(line, "\r\n")] = '\0';
        fields[0] = p;
        for (k = 1; k < 7; ++k) {
            p = strchr(p, ',');
            if (!p) break;
            /* Replace the comma with a terminator, then move p to the next field.
             * fields[] points into line; no field buffers are allocated here. */
            *p++ = '\0';
            fields[k] = p;
        }
        if (k != 7 || strchr(fields[6], ',')) {
            fprintf(stderr, "invalid manifest row %zu\n", row);
            fclose(f);
            return 0;
        }
        c = &d->cases[d->n];
        memset(c, 0, sizeof *c);
        int field_too_long = strlen(fields[0]) >= sizeof c->id || strlen(fields[1]) >= sizeof c->schema || strlen(fields[2]) >= sizeof c->category ||
        strlen(fields[3]) > KEY_MAX || strlen(fields[5]) > KEY_MAX || strlen(fields[6]) >= sizeof c->family;
        if (field_too_long) {
            fclose(f);
            return 0;
        } {
            char *end;
            errno = 0;
            outcome = strtol(fields[4], &end, 10);
            if (errno || end == fields[4] || *end || outcome < 0 || outcome > 3) {
                fclose(f);
                return 0;
            }
        }
        memcpy(c->id, fields[0], strlen(fields[0]) + 1);
        memcpy(c->schema, fields[1], strlen(fields[1]) + 1);
        memcpy(c->category, fields[2], strlen(fields[2]) + 1);
        memcpy(c->input, fields[3], strlen(fields[3]) + 1);
        memcpy(c->target, fields[5], strlen(fields[5]) + 1);
        memcpy(c->family, fields[6], strlen(fields[6]) + 1);
        c->expected = (Expected) outcome;
        ++d->n;
    } {
        int ok = !ferror(f);
        if (fclose(f) != 0) ok = 0;
        return ok;
    }
}
/** The same raw input in the same schema is one case, regardless of its ID. */
static int duplicate_case(const TestCase *left, const TestCase *right) {
    int same_id = !strcmp(left->id, right->id);
    int same_schema = !strcmp(left->schema, right->schema);
    int same_input = !strcmp(left->input, right->input);
    return same_id || (same_schema && same_input);
}

/** Check one label against its active schema, not against an algorithm's score. */
static int valid_case_label(const TestCase *test, const Registry *registry, const char *normalized, int normalizable) {
    size_t property_index;
    int expects_target = test->expected == EXPECT_RESOLVED;
    int expects_invalid = test->expected == EXPECT_INVALID;
    int invalid_input_or_schema = !normalizable || registry->collision;
    if (expects_target && (!normalizable || target_index(registry, test->target) < 0)) return 0;
    if (!expects_target && * test->target) return 0;
    if (expects_invalid != invalid_input_or_schema) return 0;
    if (!invalid_input_or_schema) {
        for (property_index = 0; property_index < registry->n; ++property_index) {
            const Property *property = &registry->p[property_index];
            int exact_name = !strcmp(normalized, property->normalized);
            int wrong_label = !expects_target || strcmp(test->target, property->name);
            if (exact_name && wrong_label) return 0;
        }
    }
    return 1;
}

/** [PM-Sp7rK9] Reject bad labels, duplicate cases and leakage before scoring.
 * Calibration and held-out counts refer to distinct rows, never timing repetitions.
 */
int validate_datasets(const Dataset *calibration, const Dataset *held_out) {
    const Dataset *sets[] = {calibration, held_out};
    const unsigned minimum[] = {20, 30, 25, 25, 25, 25, 30, 25, 20, 20, 45, 35, 30, 25};
    unsigned counts[CATEGORIES] = {0};
    size_t split, case_index, earlier, category_index_value;
    if (calibration->n < 120 || held_out->n < 380) return 0;
    for (split = 0; split < 2; ++split) {
        const Dataset *dataset = sets[split];
        for (case_index = 0; case_index < dataset->n; ++case_index) {
            const TestCase *test = &dataset->cases[case_index];
            Registry *registry = registry_get(test->schema);
            char normalized[KEY_MAX + 1];
            int normalizable = normalize(test->input, normalized, sizeof normalized);
            int category = category_index(test->category);
            int missing_identity = !test->family[0] || !test->id[0];
            if (!registry || category < 0 || missing_identity) return 0;
            if (split == 1) ++counts[category];
            if (!valid_case_label(test, registry, normalized, normalizable)) return 0;
            for (earlier = 0; earlier < case_index; ++earlier) {
                if (duplicate_case(test, &dataset->cases[earlier])) return 0;
            }
        }
    }
    for (case_index = 0; case_index < calibration->n; ++case_index) {
        for (earlier = 0; earlier < held_out->n; ++earlier) {
            const TestCase *left = &calibration->cases[case_index];
            const TestCase *right = &held_out->cases[earlier];
            int shared_family = !strcmp(left->family, right->family);
            int shared_id = !strcmp(left->id, right->id);
            int shared_schema = !strcmp(left->schema, right->schema);
            if (shared_family || shared_id || shared_schema) return 0;
        }
    }
    for (category_index_value = 0; category_index_value < CATEGORIES; ++category_index_value) {
        if (counts[category_index_value] < minimum[category_index_value]) return 0;
    }
    return 1;
}
