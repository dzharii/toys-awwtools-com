/** @file
 * [PM-Pa7kQ2] Turn one line into two strings. Matching happens later.
 * Example: " key = a=b; " becomes key "key", value "a=b;".
 */
#include <ctype.h>
#include <string.h>
#include "pm.h"

/** First '=' wins. Never truncate a key or value to make it fit. */
ParseStatus parse_entry(const char *line, Entry *out) {
    size_t line_length = 0;
    size_t key_start, key_end, value_start, value_end;
    const char *separator;

    if (!line || !out) return PARSE_MISSING_EQUALS;
    /* A bounded scan rejects oversize input before strchr/copy touch it. */
    while (line_length <= LINE_MAX_PM && line[line_length]) ++line_length;
    if (line_length > LINE_MAX_PM) return PARSE_TOO_LONG;
    separator = strchr(line, '=');
    if (!separator) return PARSE_MISSING_EQUALS;

    /* End indices are exclusive: [key_start, key_end), [value_start, value_end). */
    key_start = 0;
    key_end = (size_t)(separator - line);
    value_start = key_end + 1;
    value_end = line_length;
    /* ctype takes EOF or an unsigned-char value. The application retains the C locale. */
    while (key_start < key_end && isspace((unsigned char)line[key_start])) ++key_start;
    while (key_end > key_start && isspace((unsigned char)line[key_end - 1])) --key_end;
    while (value_start < value_end && isspace((unsigned char)line[value_start])) ++value_start;
    while (value_end > value_start && isspace((unsigned char)line[value_end - 1])) --value_end;

    if (key_start == key_end) return PARSE_EMPTY_KEY;
    if (key_end - key_start > KEY_MAX || value_end - value_start > VALUE_MAX) return PARSE_TOO_LONG;
    /* memcpy copies bytes, not a string terminator. The exclusive end gives
     * the byte count; the following assignment finishes the new C string. */
    memcpy(out->key, line + key_start, key_end - key_start);
    out->key[key_end - key_start] = '\0';
    memcpy(out->value, line + value_start, value_end - value_start);
    out->value[value_end - value_start] = '\0';
    return PARSE_OK;
}
