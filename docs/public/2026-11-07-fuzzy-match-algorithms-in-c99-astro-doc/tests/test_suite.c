/** @file
 * [PM-Te9aS4] Assertions stop a broken implementation before benchmark ranking.
 * Literal examples check contracts; an independent graph checks edit distances.
 * Keep these checks independent of thresholds chosen from calibration data.
 */
#include <math.h>
#include <stdlib.h>
#include <string.h>
#include "pm.h"
static unsigned checks, failures;
#define CHECK(x) do { ++checks; if(!(x)) { ++failures; fprintf(stderr,"FAIL %s:%d: %s\n",__FILE__,__LINE__,#x); } } while(0)
/** Literal parsing cases plus exact-capacity and one-byte-too-long boundaries. */
static void parser_tests(void) {
    static const struct {
        const char *line, *key, *value;
        ParseStatus status;
    }
    cases[] = {
        {"x=y", "x", "y", PARSE_OK},
        {" x = y ", "x", "y", PARSE_OK},
        {"x=", "x", "", PARSE_OK},
        {"x =  ", "x", "", PARSE_OK},
        {"x=a=b=c", "x", "a=b=c", PARSE_OK},
        {" x y = a;b=c; ", "x y", "a;b=c;", PARSE_OK},
        {"\tx\t=\tv\t", "x", "v", PARSE_OK},
        {"\rx\r=\rv\r", "x", "v", PARSE_OK},
        {"\nx\n=\nv\n", "x", "v", PARSE_OK},
        {"\vx\v=\vv\v", "x", "v", PARSE_OK},
        {"\fx\f=\fv\f", "x", "v", PARSE_OK},
        {"", "", "", PARSE_MISSING_EQUALS},
        {"x", "", "", PARSE_MISSING_EQUALS},
        {"   ", "", "", PARSE_MISSING_EQUALS},
        {"=y", "", "", PARSE_EMPTY_KEY},
        {"  =y", "", "", PARSE_EMPTY_KEY},
        {"\t=\t", "", "", PARSE_EMPTY_KEY},
        {"=", "", "", PARSE_EMPTY_KEY},
        {"a==", "a", "=", PARSE_OK},
        {"a===b", "a", "==b", PARSE_OK},
        {"a=b;c", "a", "b;c", PARSE_OK},
        {"a=b # c", "a", "b # c", PARSE_OK},
        {"a=' b '", "a", "' b '", PARSE_OK},
        {"a=\" b \"", "a", "\" b \"", PARSE_OK},
        {"a-b=1", "a-b", "1", PARSE_OK},
        {"a_b=2", "a_b", "2", PARSE_OK},
        {"a.b=3", "a.b", "3", PARSE_OK},
        {"A B=TRUE", "A B", "TRUE", PARSE_OK},
        {" a  b = c  d ", "a  b", "c  d", PARSE_OK},
        {"a=0", "a", "0", PARSE_OK},
        {"a=-10", "a", "-10", PARSE_OK},
        {"a=+20", "a", "+20", PARSE_OK},
        {"a=https://example.com?a=b", "a", "https://example.com?a=b", PARSE_OK},
        {"a=/tmp/a;b", "a", "/tmp/a;b", PARSE_OK},
        {"a= ", "a", "", PARSE_OK},
        {"\t\r = v", "", "", PARSE_EMPTY_KEY},
        {"a b c", "", "", PARSE_MISSING_EQUALS},
        {"a\tb=c\td", "a\tb", "c\td", PARSE_OK},
        {"x=;", "x", ";", PARSE_OK},
        {"x= = ", "x", "=", PARSE_OK},
        {"x= true ", "x", "true", PARSE_OK},
        {"x=false", "x", "false", PARSE_OK}
    };
    size_t i;
    Entry e;
    char key[KEY_MAX + 4], value[VALUE_MAX + 8], longline[LINE_MAX_PM + 3];
    for (i = 0; i < sizeof cases / sizeof cases[0]; ++i) {
        ParseStatus p = parse_entry(cases[i].line, &e);
        CHECK(p == cases[i].status);
        if (p == PARSE_OK) {
            CHECK(!strcmp(e.key, cases[i].key));
            CHECK(!strcmp(e.value, cases[i].value));
        }
    }
    memset(key, 'a', KEY_MAX);
    memcpy(key + KEY_MAX, "=v", strlen("=v") + 1);
    CHECK(parse_entry(key, &e) == PARSE_OK);
    memset(key, 'a', KEY_MAX + 1);
    memcpy(key + KEY_MAX + 1, "=v", strlen("=v") + 1);
    CHECK(parse_entry(key, &e) == PARSE_TOO_LONG);
    memcpy(value, "x=", strlen("x=") + 1);
    memset(value + 2, 'b', VALUE_MAX);
    value[VALUE_MAX + 2] = '\0';
    CHECK(parse_entry(value, &e) == PARSE_OK);
    value[VALUE_MAX + 2] = 'b';
    value[VALUE_MAX + 3] = '\0';
    CHECK(parse_entry(value, &e) == PARSE_TOO_LONG);
    memset(longline, 'a', LINE_MAX_PM + 1);
    longline[LINE_MAX_PM + 1] = '\0';
    CHECK(parse_entry(longline, &e) == PARSE_TOO_LONG);
    printf("Parser: %zu literal cases + 5 boundary cases passed\n", sizeof cases / sizeof cases[0]);
}
/** Formatting variants must converge; unsupported bytes must fail without erasure. */
static void normalization_tests(void) {
    const char *good[] = {
        "DatabaseConnectionString",
        "database connection string",
        "DATABASE_CONNECTION_STRING",
        "database-connection-string",
        "database\tconnection\nstring"
    };
    const char *bad[] = {"", " ", "---", "_", "a.b", "a/b", "a:b", "a!", "\x80", "\xc3\xa9", "a\x7f"};
    char out[KEY_MAX + 1], longkey[KEY_MAX + 2];
    Prepared p;
    size_t i;
    for (i = 0; i < 5; ++i) {
        CHECK(normalize(good[i], out, sizeof out));
        CHECK(!strcmp(out, "databaseconnectionstring"));
    }
    for (i = 0; i < sizeof bad / sizeof bad[0]; ++i) CHECK(!normalize(bad[i], out, sizeof out));
    CHECK(normalize("ApiV1", out, sizeof out));
    CHECK(!strcmp(out, "apiv1"));
    CHECK(!normalize("abc", out, 3));
    memset(longkey, 'a', KEY_MAX + 1);
    longkey[KEY_MAX + 1] = '\0';
    CHECK(!normalize(longkey, out, sizeof out));
    CHECK(prepare("DefaultRequestTimeoutSeconds", &p));
    CHECK(p.ntokens == 4);
    CHECK(!strcmp(p.tokens[2], "timeout"));
    CHECK(prepare("HTTPServerURL", &p));
    CHECK(p.ntokens == 3);
    CHECK(!strcmp(p.tokens[0], "http"));
    CHECK(prepare("default requst timeout seconds", &p));
    CHECK(p.ntokens == 4);
}
/* Independent shortest-path oracle: all strings over abc up to length 4. */
static char graph[121][5];
static size_t graph_n;
/** Enumerate the finite abc spelling graph; depth four gives 1+3+9+27+81=121 nodes. */
static void strings(char *s, size_t n) {
    size_t i;
    memcpy(graph[graph_n++], s, strlen(s) + 1);
    if (n == 4) return;
    for (i = 0; i < 3; ++i) {
        s[n] = (char) ('a' + i);
        s[n + 1] = '\0';
        strings(s, n + 1);
    }
    s[n] = '\0';
}
/** Graph edge: one insertion/deletion/replacement, optionally one adjacent swap. */
static int one_edit(const char *a, const char *b, int swaps) {
    size_t n = strlen(a), m = strlen(b), i, j, d = 0;
    if (n == m) {
        size_t first = 0;
        for (i = 0; i < n; ++i) if (a[i] != b[i]) {
            if (!d) first = i;
            ++d;
        }
        if (d == 1) return 1;
        return swaps && d == 2 && first + 1 < n && a[first] == b[first + 1] && a[first + 1] == b[first] && !strcmp(a + first + 2,
            b + first + 2);
    }
    if (n > m) {
        const char *t = a;
        size_t z = n;
        a = b;
        b = t;
        n = m;
        m = z;
    }
    if (m != n + 1) return 0;
    i = 0;
    j = 0;
    while (i < n && j < m) {
        if (a[i] == b[j]) {
            ++i;
            ++j;
        } else {
            ++d;
            ++j;
        }
    }
    return d <= 1;
}
/** [PM-Or4cF6] Independent oracle: breadth-first search counts edits as graph edges.
 * It does not use the dynamic-programming recurrence being tested.
 * ca -> ac -> abc distinguishes full from restricted adjacent swaps [PM-Dl8xA4]. */
static void algorithm_tests(void) {
    size_t alg, i, j, mode;
    char tmp[5] = "";
    strings(tmp, 0);
    CHECK(graph_n == 121);
    CHECK(edit_distance("kitten", "sitting", 0) == 3);
    CHECK(edit_distance("ca", "abc", 1) == 3);
    CHECK(edit_distance("ca", "abc", 2) == 2);
    CHECK(edit_distance("ab", "ba", 0) == 2);
    CHECK(edit_distance("ab", "ba", 1) == 1);
    CHECK(edit_distance("ab", "ba", 2) == 1);
    CHECK(fabs(jaro_score("martha", "marhta") - 0.9444444444444444) < 1e-12);
    CHECK(fabs(jaro_score("dwayne", "duane") - 0.8222222222222222) < 1e-12);
    CHECK(fabs(lcs_score("abc", "ac") - 0.8) < 1e-12);
    CHECK(fabs(gram_score("abc", "abd", 1) - 0.5) < 1e-12);
    CHECK(fabs(gram_score("abcd", "abce", 0) - 1.0 / 3) < 1e-12);
    CHECK(fabs(gram_score("abcd", "abce", 2) - 0.5) < 1e-12);
    CHECK(fabs(ratcliff_score("abcd", "abxd") - 0.75) < 1e-12);
    /* These literal answers are also the calculations shown beside the code. */
    CHECK(edit_distance("ca", "cu", 0) == 1);
    CHECK(fabs(gram_score("aaaba", "aaaa", 2) - 2 / sqrt(12.0)) < 1e-12);
    CHECK(fabs(ratcliff_score("abxxcd", "abyycd") - 2.0 / 3) < 1e-12);
    {
        Prepared query;
        Property candidate;
        CHECK(prepare("request", &query));
        CHECK(property_init(&candidate, "RequestTimeout", TYPE_STRING, 0));
        CHECK(fabs(hybrid_score(&query, &candidate) - 0.5) < 1e-12);
    }
    CHECK(weighted_distance("a", "s") == 0.5);
    CHECK(weighted_distance("v1", "v2") == 2);
    CHECK(edit_distance("", "abc", 2) == 3);
    CHECK(jaro_score("", "") == 1);
    CHECK(gram_score("a", "a", 0) == 1);
    CHECK(gram_score("a", "b", 0) == 0);
    /* Breadth-first search visits paths in edit-count order. Its queue stores
     * graph indices; dist=-1 means unseen, dist=0 is the unchanged source.
     * This checks the answer without reusing the matrix recurrence under test. */
    for (mode = 0; mode < 2; ++mode) for (i = 0; i < graph_n; ++i) if (strlen(graph[i]) <= 3) {
        int dist[121], queue[121];
        size_t head = 0, tail = 1;
        for (j = 0; j < 121; ++j) dist[j] = - 1;
        dist[i] = 0;
        queue[0] = (int) i;
        while (head < tail) {
            int u = queue[head++];
            for (j = 0; j < graph_n; ++j) if (dist[j] < 0 && one_edit(graph[u], graph[j], (int) mode)) {
                dist[j] = dist[u] + 1;
                queue[tail++] = (int) j;
            }
        }
        for (j = 0; j < graph_n; ++j) if (strlen(graph[j]) <= 3) {
            double lev = edit_distance(graph[i], graph[j], 0), osa = edit_distance(graph[i], graph[j], 1), dl = edit_distance(graph[i],
                graph[j], 2);
            CHECK((mode ? dl : lev) == dist[j]);
            CHECK(dl <= osa && osa <= lev);
        }
    }
    /* Broad scorer invariants complement the known numeric answers above. */
    for (alg = 1; alg < ALGORITHMS; ++alg) for (i = 1; i < graph_n; i += 3) for (j = 1; j < graph_n; j += 4) {
        Prepared a, b;
        Property pa, pb;
        double x, y;
        CHECK(prepare(graph[i], &a));
        CHECK(prepare(graph[j], &b));
        CHECK(property_init(&pa, graph[i], TYPE_STRING, 0));
        CHECK(property_init(&pb, graph[j], TYPE_STRING, 0));
        x = algorithms[alg].score(&a, &pb);
        y = algorithms[alg].score(&b, &pa);
        CHECK(isfinite(x) && x >= - 1e-12 && x <= 1 + 1e-12);
        CHECK(fabs(x - y) < 1e-12);
        CHECK(fabs(algorithms[alg].score(&a, &pa) - 1) < 1e-12);
    }
    printf("Algorithms: independent edit-graph oracle, known answers, score ranges, identity and symmetry checked\n");
}
/** Reverse registry order and check that acceptance and top suggestions stay the same. */
static void resolver_tests(void) {
    Registry r;
    Property props[3], rev[3];
    Policy p = {0.8, 0.01, - 1};
    Resolution a, b;
    size_t i, alg;
    CHECK(property_init(&props[0], "Cat", TYPE_STRING, 0));
    CHECK(property_init(&props[1], "Cut", TYPE_STRING, 0));
    CHECK(property_init(&props[2], "Long", TYPE_STRING, 0));
    CHECK(registry_init(&r, "test", props, 3));
    a = resolve(&r, "cat", 1, (Policy) {1.1, 1, - 1});
    CHECK(a.status == MATCH_EXACT);
    a = resolve(&r, "cot", 1, (Policy) {0.5, 0, - 1});
    CHECK(a.status == MATCH_AMBIGUOUS);
    for (i = 0; i < 3; ++i) rev[i] = props[2 - i];
    for (alg = 0; alg < ALGORITHMS; ++alg) {
        CHECK(registry_init(&r, "test", props, 3));
        a = resolve(&r, "catt", alg, p);
        CHECK(registry_init(&r, "test", rev, 3));
        b = resolve(&r, "catt", alg, p);
        CHECK(a.status == b.status);
        if (a.first >= 0) CHECK(!strcmp(props[a.first].name, rev[b.first].name));
        CHECK(fabs(a.best - b.best) < 1e-12);
        CHECK(fabs(a.runner - b.runner) < 1e-12);
    }
    CHECK(resolve(registry_get("collision"), "database connection string", 1, p).status == MATCH_INVALID);
    CHECK(resolve(registry_get("base"), "invalid!", 1, p).status == MATCH_INVALID);
    CHECK(resolve(registry_get("base"), "z", 1, p).status == MATCH_UNKNOWN);
}
/** Check parsing, types, duplicate canonical keys, required values, application and rollback together. */
static void integration_tests(void) {
    Registry r;
    Property props[3];
    char err[256];
    Policy p = {0.85, 0.02, 2};
    size_t i;
    static const struct {
        const char *lines[4];
        size_t n;
        int ok;
        const char *reason;
    }
    cases[] = {
        {
            {"port=1"},
            1,
            1,
            ""
        },
        {
            {"port=+1"},
            1,
            1,
            ""
        },
        {
            {"port=-1"},
            1,
            1,
            ""
        },
        {
            {"port=2147483647"},
            1,
            1,
            ""
        },
        {
            {"port=-2147483648"},
            1,
            1,
            ""
        },
        {
            {"port=abc"},
            1,
            0,
            "invalid value"
        },
        {
            {"port=2147483648"},
            1,
            0,
            "invalid value"
        },
        {
            {"port=-2147483649"},
            1,
            0,
            "invalid value"
        },
        {
            {"port=1.0"},
            1,
            0,
            "invalid value"
        },
        {
            {"port=1 2"},
            1,
            0,
            "invalid value"
        },
        {
            {"port="},
            1,
            0,
            "invalid value"
        },
        {
            {"port=+"},
            1,
            0,
            "invalid value"
        },
        {
            {"port=1", "port=2"},
            2,
            0,
            "duplicate"
        },
        {
            {"port=1", "p-o-r-t=2"},
            2,
            0,
            "duplicate"
        },
        {
            {"other=1"},
            1,
            0,
            "unresolved"
        },
        {
            {"port"},
            1,
            0,
            "parse error"
        },
        {
            {"=1"},
            1,
            0,
            "parse error"
        },
        {
            {"enabled=true", "port=1"},
            2,
            1,
            ""
        },
        {
            {"enabled=false", "port=1"},
            2,
            1,
            ""
        },
        {
            {"enabled=TRUE", "port=1"},
            2,
            0,
            "invalid value"
        },
        {
            {"enabled=1", "port=1"},
            2,
            0,
            "invalid value"
        },
        {
            {"name=a=b;c", "port=1"},
            2,
            1,
            ""
        },
        {
            {"name=", "port=1"},
            2,
            0,
            "invalid value"
        },
        {
            {"enabled=true"},
            1,
            0,
            "missing required"
        },
        {
            {"port=1", "enabled=false", "name=hello"},
            3,
            1,
            ""
        },
        {
            {"poort=1"},
            1,
            0,
            "unresolved"
        },
        {
            {"enabld=true", "port=1"},
            2,
            1,
            ""
        },
        {
            {"enabld=true", "enabled=false", "port=1"},
            3,
            0,
            "duplicate"
        }
    };
    CHECK(property_init(&props[0], "Port", TYPE_INTEGER, 1));
    CHECK(property_init(&props[1], "Enabled", TYPE_BOOLEAN, 0));
    CHECK(property_init(&props[2], "Name", TYPE_STRING, 0));
    CHECK(registry_init(&r, "integration", props, 3));
    for (i = 0; i < sizeof cases / sizeof cases[0]; ++i) {
        int ok = bind_lines(&r, cases[i].lines, cases[i].n, 1, p, err, sizeof err);
        CHECK(ok == cases[i].ok);
        if (!ok) CHECK(strstr(err, cases[i].reason) != NULL);
    } {
        const char *original[] = {
            "database connection strng = Server=localhost;Database=AppDb;",
            "authentication server endpint = https://auth.example.com",
            "application environment name = Production",
            "maximum concurent request count = 100",
            "default request timeout seconds = 30",
            "enable detailed error loging = true",
            "external notification service url = https://api.example.com/notifications",
            "temporary file storage directory = /var/app/temp",
            "background task execution interval seconds = 60",
            "enable automatic configuration relod = false"
        };
        CHECK(bind_lines(registry_get("base"), original, 10, 1, (Policy) {0.9, 0.02, 2}, err, sizeof err));
    } {
        static Configuration out;
        const char *valid[] = {"port=123", "enabled=true", "name=a=b;c"};
        const char *bad[] = {"port=abc"};
        CHECK(bind_configuration(&r, valid, 3, 1, p, &out, err, sizeof err));
        CHECK(out.n == 3);
        CHECK(out.values[0].integer == 123);
        CHECK(out.values[1].boolean == 1);
        CHECK(!strcmp(out.values[2].raw, "a=b;c"));
        CHECK(!bind_configuration(&r, bad, 1, 1, p, &out, err, sizeof err));
        CHECK(out.values[0].integer == 123);
        CHECK(out.values[1].boolean == 1);
    }
    printf("Integration: %zu labeled binding cases + complete original configuration checked\n", sizeof cases / sizeof cases[0]);
}
/** Check ctype integration against literal ASCII ranges, not against ctype itself. */
static void character_library_tests(void) {
    unsigned byte;
    for (byte = 1; byte <= 255; ++byte) {
        char input[] = {(char)byte, '\0'};
        char line[] = {(char)byte, 'k', '=', (char)byte, 'v', (char)byte, '\0'};
        char normalized[KEY_MAX + 1];
        Entry parsed;
        int letter_or_digit = (byte >= 'A' && byte <= 'Z') ||
                              (byte >= 'a' && byte <= 'z') || (byte >= '0' && byte <= '9');
        int whitespace = byte == ' ' || (byte >= '\t' && byte <= '\r');
        CHECK(normalize(input, normalized, sizeof normalized) == letter_or_digit);
        CHECK(parse_entry(line, &parsed) == (byte == '=' ? PARSE_EMPTY_KEY : PARSE_OK));
        CHECK(byte == '=' || (unsigned char)parsed.key[0] == (whitespace ? (unsigned char)'k' : (unsigned char)byte));
    }
}

/** Return nonzero on any failed assertion or dataset-contract violation. */
int self_test(void) {
    static Dataset a, b;
    checks = 0;
    failures = 0;
    registries_init();
    parser_tests();
    normalization_tests();
    character_library_tests();
    algorithm_tests();
    resolver_tests();
    integration_tests();
    CHECK(load_dataset("tests/calibration_cases.csv", &a));
    CHECK(load_dataset("tests/evaluation_cases.csv", &b));
    CHECK(validate_datasets(&a, &b));
    printf("%u assertions; %u failures; calibration=%zu held-out=%zu\n", checks, failures, a.n, b.n);
    return failures ? 1 : 0;
}
