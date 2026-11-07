/** @file
 * [PM-Cf5bY9] Registries describe names/types; matching algorithms receive data only.
 * Base and adversarial schemas share some names. Calibration uses different names.
 * Validation and application are separate passes: [PM-Bi7nA3].
 */
#include <ctype.h>
#include <errno.h>
#include <limits.h>
#include <stdlib.h>
#include <string.h>
#include "pm.h"
static Property base[10], adversarial[40], shortprops[12], collision[2], calibration[20], boundary[3];
static Registry regs[6];
static const char *base_names[] = {
    "DatabaseConnectionString",
    "AuthenticationServerEndpoint",
    "ApplicationEnvironmentName",
    "MaximumConcurrentRequestCount",
    "DefaultRequestTimeoutSeconds",
    "EnableDetailedErrorLogging",
    "ExternalNotificationServiceUrl",
    "TemporaryFileStorageDirectory",
    "BackgroundTaskExecutionIntervalSeconds",
    "EnableAutomaticConfigurationReload"
};
static const ValueType types[] = {
    TYPE_STRING,
    TYPE_STRING,
    TYPE_STRING,
    TYPE_INTEGER,
    TYPE_INTEGER,
    TYPE_BOOLEAN,
    TYPE_STRING,
    TYPE_STRING,
    TYPE_INTEGER,
    TYPE_BOOLEAN
};
static const char *extra[] = {
    "AuthorizationServerEndpoint",
    "DefaultRequestTimeoutMilliseconds",
    "MaximumConcurrentRequestsCount",
    "EnableDetailedAccessLogging",
    "InternalNotificationServiceUrl",
    "TemporaryFileCacheDirectory",
    "BackgroundTaskExecutionIntervalMinutes",
    "EnableAutomaticConfigurationReset",
    "MinimumConnectionCount",
    "MaximumConnectionCount",
    "InputBufferSize",
    "OutputBufferSize",
    "ReadCacheEnabled",
    "WriteCacheEnabled",
    "FeatureEnabled",
    "FeatureDisabled",
    "ApiEndpointV1",
    "ApiEndpointV2",
    "ConnectionCount",
    "ConnectionLimit"
};
static const char *short_names[] = {
    "Host",
    "Port",
    "Path",
    "Mode",
    "Name",
    "Timeout",
    "Read",
    "Write",
    "Min",
    "Max",
    "V1",
    "V2"
};
static const char *cal_names[] = {
    "TelemetryCollectorAddress",
    "TelemetryCollectorCertificate",
    "SessionExpirationHours",
    "SessionExpirationDays",
    "MinimumBatchQueueDepth",
    "MaximumBatchQueueDepth",
    "EnableVerboseAuditTrace",
    "EnableVerboseNetworkTrace",
    "IncomingMessageLimit",
    "OutgoingMessageLimit",
    "PersistentArchiveFolder",
    "PersistentBackupFolder",
    "SchedulerWakeupPeriod",
    "SchedulerShutdownPeriod",
    "TransportProtocolV3",
    "TransportProtocolV4"
};
/** Build cached canonical names/tokens once, before any matching or timing. */
void registries_init(void) {
    size_t index;
    for (index = 0; index < 10; ++index) {
        (void) property_init(&base[index], base_names[index], types[index], 1);
        adversarial[index] = base[index];
    }
    for (index = 0; index < 20; ++index) (void) property_init(&adversarial[index + 10], extra[index], TYPE_STRING, 0);
    for (index = 0; index < 12; ++index) (void) property_init(&shortprops[index], short_names[index], TYPE_STRING, 0);
    for (index = 0; index < 16; ++index) (void) property_init(&calibration[index], cal_names[index], TYPE_STRING, 0);
    (void) property_init(&collision[0], "DatabaseConnectionString", TYPE_STRING, 0);
    (void) property_init(&collision[1], "Database_Connection_String", TYPE_STRING, 0);
    (void) registry_init(&regs[0], "base", base, 10);
    (void) registry_init(&regs[1], "adversarial", adversarial, 30);
    (void) registry_init(&regs[2], "short", shortprops, 12);
    (void) registry_init(&regs[3], "collision", collision, 2);
    (void) registry_init(&regs[4], "calibration", calibration, 16);
    {
        char longname[KEY_MAX + 1];
        memset(longname, 'a', KEY_MAX);
        memcpy(longname, "LongBoundaryProperty", 20);
        longname[KEY_MAX] = '\0';
        (void) property_init(&boundary[0], longname, TYPE_STRING, 0);
        longname[KEY_MAX - 1] = 'b';
        (void) property_init(&boundary[1], longname, TYPE_STRING, 0);
        (void) property_init(&boundary[2], "X", TYPE_STRING, 0);
    }
    (void) registry_init(&regs[5], "boundary", boundary, 3);
}
/** Return a borrowed registry; NULL means the manifest named an unknown schema. */
Registry *registry_get(const char *id) {
    size_t index;
    for (index = 0; index < 6; ++index) if (!strcmp(id, regs[index].id)) return &regs[index];
    return NULL;
}
/** Keep the original ten names; add deterministic unrelated and similar names for timing only. */
int registry_scale(Registry *registry, Property *property, size_t count) {
    size_t index;
    char name[KEY_MAX + 1];
    Registry *base_registry = registry_get("base");
    if (count < 10 || count > MAX_PROPERTIES) return 0;
    for (index = 0; index < 10; ++index) property[index] = base_registry->p[index];
    for (index = 10; index < count; ++index) {
        if (index % 3 == 0) (void) snprintf(name, sizeof name, "DefaultRequestTimeoutSecondsChannel%04zu", index);
        else if (index % 3 == 1) (void) snprintf(name, sizeof name, "TelemetryComponent%04zuBufferCapacity", index);
        else (void) snprintf(name, sizeof name, "BackgroundTaskExecutionIntervalWorker%04zu", index);
        if (!property_init(&property[index], name, TYPE_STRING, 0)) return 0;
    }
    return registry_init(registry, "scaling", property, count);
}
/** [PM-Va2lG6] Values stay strings until name resolution succeeds.
 * Accept a complete decimal integer, not a partial parse like "10seconds".
 * Boolean spellings are exactly true/false; string properties require nonempty text. */
int value_valid(const Property *property, const char *text) {
    char *end;
    long value;
    size_t index = 0;
    if (property->type == TYPE_STRING) return *text != '\0';
    if (property->type == TYPE_BOOLEAN) return !strcmp(text, "true") || !strcmp(text, "false");
    if (text[index] == '+' || text[index] == '-') ++index;
    if (!text[index]) return 0;
    for (; text[index]; ++index) if (!isdigit((unsigned char)text[index])) return 0;
    errno = 0;
    /* strtol reports two different problems: errno catches overflow;
     * end points to the first unconsumed byte. Both must indicate success. */
    value = strtol(text, &end, 10);
    return !errno && !* end && value >= INT_MIN && value <= INT_MAX;
}
/** Validate only: parse -> resolve -> type-check -> mark canonical index seen.
 * "port" and "p-o-r-t" hit the same seen slot, so spelling variants cannot overwrite. */
int bind_lines(const Registry *registry, const char *const * lines, size_t count, size_t algorithm, Policy policy, char *diagnostic,
    size_t diagnostic_capacity) {
    unsigned char already_bound[MAX_PROPERTIES] = {0};
    size_t index;
    Entry entry;
    for (index = 0; index < count; ++index) {
        Resolution result;
        if (parse_entry(lines[index], &entry) != PARSE_OK) {
            (void) snprintf(diagnostic, diagnostic_capacity, "parse error at line %zu", index + 1);
            return 0;
        }
        result = resolve(registry, entry.key, algorithm, policy);
        if (!match_is_accepted(result.status)) {
            (void) snprintf(diagnostic, diagnostic_capacity, "unresolved key at line %zu: %s", index + 1, entry.key);
            return 0;
        }
        if (!value_valid(&registry->p[result.first], entry.value)) {
            (void) snprintf(diagnostic, diagnostic_capacity, "invalid value for %s", registry->p[result.first].name);
            return 0;
        }
        if (already_bound[result.first]) {
            (void) snprintf(diagnostic, diagnostic_capacity, "duplicate property %s", registry->p[result.first].name);
            return 0;
        }
        already_bound[result.first] = 1;
    }
    for (index = 0; index < registry->n; ++index) if (registry->p[index].required && !already_bound[index]) {
        (void) snprintf(diagnostic, diagnostic_capacity, "missing required property %s", registry->p[index].name);
        return 0;
    }
    if (diagnostic_capacity) diagnostic[0] = '\0';
    return 1;
}

/** [PM-Bi7nA3] Two passes protect the destination: validate everything, then apply.
 * Any failure in pass one leaves the old Configuration untouched.
 * Pass two repeats deterministic lookups; inputs/registry must stay immutable. */
int bind_configuration(const Registry *registry, const char *const * lines, size_t count, size_t algorithm, Policy policy, Configuration *out,
    char *diagnostic, size_t diagnostic_capacity) {
    size_t index;
    if (!out || !registry || registry->n > MAX_PROPERTIES) {
        (void) snprintf(diagnostic, diagnostic_capacity, "invalid binding destination");
        return 0;
    }
    if (!bind_lines(registry, lines, count, algorithm, policy, diagnostic, diagnostic_capacity)) return 0;
    /* Only validated batches reach this commit point. */
    memset(out, 0, sizeof *out);
    out->n = registry->n;
    for (index = 0; index < count; ++index) {
        Entry entry;
        Resolution resolved;
        BoundValue *value;
        (void) parse_entry(lines[index], &entry);
        resolved = resolve(registry, entry.key, algorithm, policy);
        /* The index selects canonical storage. Different input spellings
         * therefore cannot create two separate values for the same property. */
        value = &out->values[resolved.first];
        value->present = 1;
        /* Parser bounded this string to VALUE_MAX; destination has the same capacity. */
        memcpy(value->raw, entry.value, strlen(entry.value) + 1);
        if (registry->p[resolved.first].type == TYPE_INTEGER) value->integer = (int) strtol(entry.value, NULL, 10);
        if (registry->p[resolved.first].type == TYPE_BOOLEAN) value->boolean = !strcmp(entry.value, "true");
    }
    return 1;
}
