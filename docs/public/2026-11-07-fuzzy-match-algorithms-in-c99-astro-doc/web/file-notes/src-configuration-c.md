---
file: "src/configuration.c"
---

This module supplies data-driven property registries and validates configuration values. Scoring algorithms do not know these property names.

<!-- at: 1 -->
## Construct the base, adversarial and calibration schemas

The base table preserves the original ten properties and types. Extra names deliberately differ in operational words such as seconds, milliseconds, internal and external. Calibration uses a separate vocabulary. `registries_init` caches all names once. The collision and length-boundary schemas are deliberate tests, not production defaults.

<!-- at: /** Keep the original ten -->
## Generate larger registries only for timing

`registry_scale` keeps the base names and adds deterministic indexed identifiers. Some share prefixes; others use telemetry names. These registries measure work at 10, 50, 100 and 1000 properties. Their timing does not establish accuracy for a real 1000-property schema.

<!-- at: /** [PM-Va2lG6] -->
## Validate complete values with standard numeric conversion

Strings must be nonempty and booleans must be exactly `true` or `false`. Integer text permits one leading sign and otherwise only digits. `strtol` then detects overflow through `errno`, checks the end pointer, and enforces the target int range. The digit scan is necessary because `strtol` alone accepts leading whitespace.

<!-- at: /** Validate only -->
## Reject unresolved keys, invalid types, duplicates and omissions

`bind_lines` marks canonical property indices, not raw spellings. Consequently `port` and `p-o-r-t` are duplicates after resolution. The final pass checks required properties. The first error returns a diagnostic and no application state is changed.

<!-- at: /** [PM-Bi7nA3] -->
## Apply values only after the entire batch validates

The second pass repeats deterministic resolution and writes strings plus typed values into `Configuration`. Parsing already bounded each value, so its copy includes the terminator safely. For a batch containing `port=123` and an invalid boolean, validation fails before the destination is cleared. Inputs and registry must stay immutable between the two passes.


## Reference for the contracts used in this file

C99 section 7.20.1.4 defines `strtol`, its end pointer and range-error behavior. These checks belong to value validation after name resolution. [Open reference](https://www.open-std.org/jtc1/sc22/wg14/www/docs/n1256.pdf).
