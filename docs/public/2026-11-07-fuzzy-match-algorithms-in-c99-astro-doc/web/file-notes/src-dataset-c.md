---
file: "src/dataset.c"
---

This file creates and loads the experiment's answer key. Expected outcomes are assigned by the dataset author, not by whichever scorer ranks first.

<!-- at: 1 -->
## Use a fixed generator and validate every appended label

The xorshift32 sequence makes seed-42 mutations reproducible across C libraries; standard `rand` does not specify that sequence. `append` checks field capacities, duplicate inputs and target membership. A generated typo that becomes a different canonical name is refused. Copies occur only after those checks.

<!-- at: /** Create formatting -->
## Create formatting variants and character mutations

Standard `toupper` and `tolower` generate casing variants. `mutate` uses `memmove` when insertion or deletion shifts overlapping suffix bytes. An inserted byte shifts the terminator too. A transposition of equal adjacent letters is skipped because it would not create a distinct case.

<!-- at: /** [PM-Ge6qH1] -->
## Build separately labeled calibration and evaluation groups

The literal tables supply semantic negatives, intended typos and ambiguous phrases. Generated groups fill the requested counts using bounded retries. A family stays in one split. Changing these literals changes the experiment, so ordinary execution loads the checked-in manifests instead.

<!-- at: /** [PM-Lo2dJ5] -->
## Load a strict seven-field CSV subset without losing empty fields

`fgets` reads bounded rows; `strchr` separates commas in place and `strcspn` removes line endings. Empty target fields matter for unknown inputs, so `strtok` would be unsuitable even without the ban. Capacities and the numeric label are validated before `memcpy`. Quoted CSV input is intentionally outside this manifest format.

<!-- at: /** The same raw input -->
## Reject duplicate identities and leakage between splits

Validation checks each row against its active schema, requires category counts, and compares IDs, families and schemas across splits. A resolved label must name an existing target. An invalid label must correspond to an invalid name or collided schema. The final benchmark cannot silently repair a wrong label by trusting fuzzy output.


## Reference for the contracts used in this file

C99 section 7.21.2.2 defines `memmove` for overlapping byte ranges. Deletion and insertion move a suffix within the same mutation buffer, including the terminator. [Open reference](https://www.open-std.org/jtc1/sc22/wg14/www/docs/n1256.pdf).
