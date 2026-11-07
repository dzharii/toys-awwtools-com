/** @file [PM-Sa8fQ3]
 * LeakSanitizer needs process enumeration unavailable on the execution host.
   This affects only the sanitizer binary; AddressSanitizer and UndefinedBehaviorSanitizer remain enabled.
   Rebuild with make SANITIZER_LEAKS=1 property_match_tests on an unrestricted
   host to enable leak checking as well. */
#include "pm.h"
#if defined(PM_SANITIZED) && !PM_SANITIZER_LEAKS
int __lsan_is_turned_off(void) { return 1; }
const char *__asan_default_options(void) { return "detect_leaks=0"; }
#else
typedef int pm_no_sanitizer_options;
#endif
