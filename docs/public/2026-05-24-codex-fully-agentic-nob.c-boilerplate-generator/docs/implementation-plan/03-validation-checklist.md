# Validation Checklist

- Open `index.html` directly from disk.
- Confirm no console errors on load.
- Confirm default generated code contains `#define NOB_IMPLEMENTATION`, `#include "nob.h"`, `NOB_GO_REBUILD_URSELF(argc, argv);`, `nob_mkdir_if_not_exists("build")`, `Nob_Cmd cmd = {0};`, `nob_cmd_append`, `nob_cmd_run`, and `return 0;`.
- Run browser fixture checks and confirm all exact snapshots pass.
- Change project name and confirm header/assumptions update.
- Change target name and confirm output path updates.
- Switch Windows MinGW-style platform and confirm `.exe` suffix.
- Disable self-rebuild and confirm the self-rebuild line is omitted and warnings/assumptions update.
- Enter invalid identifiers and confirm copy/download are disabled.
- Enter quotes/control characters in generated fields and confirm validation errors.
- Enter duplicate sources and confirm warnings without silent deduplication.
- Confirm copy uses current generated code in valid state.
- Confirm download creates `nob.c` content from current generated code.
- Check desktop and narrow mobile layouts.
- Confirm no deferred controls are visible for run/test/clean/static library/MSVC/URL state/local storage.

