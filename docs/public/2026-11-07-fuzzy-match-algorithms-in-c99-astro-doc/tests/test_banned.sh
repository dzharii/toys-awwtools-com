#!/bin/sh
# Every forbidden call must fail at compile time, not merely fail to link.
set -eu
compiler=${CC:-gcc}
scratch=$(mktemp -d './.banned-check.XXXXXX')
trap 'rm -rf "$scratch"' EXIT HUP INT TERM
count=0
for call in 'strcpy(0,0)' 'strcat(0,0)' 'strncpy(0,0,0)' 'strncat(0,0,0)' \
  'strtok(0,0)' 'strtok_r(0,0,0)' 'sprintf(0,0)' 'vsprintf(0,0)' \
  'gmtime(0)' 'localtime(0)' 'ctime(0)' 'ctime_r(0,0)' 'asctime(0)' \
  'asctime_r(0,0)' 'mktemp(0)'
do
  function_name=${call%%(*}
  printf '#include <string.h>\n#include <time.h>\n#include "pm.h"\nvoid probe(void) { %s; }\n' "$call" > "$scratch/probe.c"
  if "$compiler" -std=c99 -Isrc -c "$scratch/probe.c" -o "$scratch/probe.o" > "$scratch/error" 2>&1; then
    printf 'FAIL: %s compiled with banned.h\n' "$function_name"
    exit 1
  fi
  if ! grep -q "sorry_${function_name}_is_a_banned_function" "$scratch/error"; then
    cat "$scratch/error"
    exit 1
  fi
  count=$((count + 1))
done
printf 'PASS: all %s banned functions rejected by the compiler\n' "$count"
