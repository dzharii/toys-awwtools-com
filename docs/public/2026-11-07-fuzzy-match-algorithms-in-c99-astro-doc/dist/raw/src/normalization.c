/** @file
 * [PM-No4mT8] One spelling for formatting variants; keep tokens separately.
 * "Default_Request Timeout" -> text "defaultrequesttimeout"
 *                         -> tokens "default", "request", "timeout".
 * Values never pass through this file. See [PM-Pa7kQ2].
 */
#include <ctype.h>
#include <string.h>
#include "pm.h"

static int is_separator(unsigned char character) {
    return character == '_' || character == '-' || isspace(character);
}

/** Caller supplies storage. Failure means the output must not be used. */
int normalize(const char *input, char *output, size_t capacity) {
    size_t read_index, written = 0;
    if (!input || !output || !capacity) return 0;
    for (read_index = 0; input[read_index]; ++read_index) {
        unsigned char character = (unsigned char)input[read_index];
        if (read_index >= KEY_MAX) return 0;
        if (character > 127) return 0; /* Reject bytes outside ASCII before locale classification. */
        if (is_separator(character)) continue;
        if (!isalnum(character)) return 0; /* Reject punctuation; do not erase it. */
        if (written + 1 >= capacity) return 0; /* Reserve one byte for '\0'. */
        output[written++] = (char)tolower(character);
    }
    output[written] = '\0';
    return written != 0;
}

/** Recognize the start of a PascalCase word before folding away its case. */
static int starts_word(const char *input, size_t index) {
    unsigned char current = (unsigned char)input[index];
    unsigned char previous, next;
    if (!index || !isupper(current)) return 0;
    previous = (unsigned char)input[index - 1];
    next = (unsigned char)input[index + 1];
    if (is_separator(previous)) return 0;
    /* t|S, 1|S, and HTTP|Server are word boundaries; H|TTP is not. */
    return islower(previous) || isdigit(previous) || (isupper(previous) && islower(next));
}

/** Keep both views: character algorithms use text; the hybrid uses tokens. */
int prepare(const char *input, Prepared *prepared) {
    size_t index, token_index = 0, token_length = 0;
    /* sizeof *prepared is the whole struct, not the pointer's size.
     * Zeroing makes unused tokens empty and the initial token count zero. */
    memset(prepared, 0, sizeof *prepared);
    if (!normalize(input, prepared->text, sizeof prepared->text)) return 0;
    for (index = 0; input[index]; ++index) {
        unsigned char character = (unsigned char)input[index];
        int separator = is_separator(character);
        int word_boundary = separator || starts_word(input, index);
        if (word_boundary && token_length) {
            prepared->tokens[token_index][token_length] = '\0';
            ++token_index;
            token_length = 0;
        }
        if (separator) continue;
        if (token_index >= TOKEN_MAX) return 0;
        prepared->tokens[token_index][token_length++] = (char)tolower(character);
    }
    if (token_length) {
        prepared->tokens[token_index][token_length] = '\0';
        ++token_index;
    }
    prepared->ntokens = token_index;
    return 1;
}

/** Cache canonical text/tokens once; queries reuse these read-only copies. */
int property_init(Property *property, const char *name, ValueType type, int required) {
    Prepared prepared;
    if (!prepare(name, &prepared)) return 0;
    memset(property, 0, sizeof *property);
    /* Successful prepare bounded both strings to KEY_MAX; neither copy overlaps. */
    memcpy(property->name, name, strlen(name) + 1);
    memcpy(property->normalized, prepared.text, strlen(prepared.text) + 1);
    memcpy(property->tokens, prepared.tokens, sizeof property->tokens);
    property->ntokens = prepared.ntokens;
    property->type = type;
    property->required = required;
    return 1;
}

/** [PM-Co9sR3] Two canonical names becoming the same text invalidates the schema.
 * DatabaseConnectionString and Database_Connection_String must never race to win.
 * The registry borrows the caller's property array; it does not own/free it.
 */
int registry_init(Registry *registry, const char *id, Property *properties, size_t count) {
    size_t current, earlier;
    registry->p = properties;
    registry->n = count;
    registry->collision = 0;
    if (strlen(id) >= sizeof registry->id || !count || count > MAX_PROPERTIES) return 0;
    memcpy(registry->id, id, strlen(id) + 1);
    for (current = 0; current < count; ++current) {
        for (earlier = 0; earlier < current; ++earlier) {
            if (!strcmp(properties[current].normalized, properties[earlier].normalized)) registry->collision = 1;
        }
    }
    return !registry->collision;
}
