---
file: "src/evaluation.c"
---

This file converts resolver outcomes into counts and chooses policies on calibration data. It keeps dangerous acceptance separate from rejection.

<!-- at: 1 -->
## Count one outcome and update its denominators

A resolved label contributes either a correct exact/fuzzy match, a wrong target or a rejection. Unknown and ambiguous labels have separate unsafe-acceptance buckets. Formatting-only inputs are excluded from fuzzy recall. With default costs, one unsafe acceptance costs 100 and a rejected recoverable typo costs 1.

<!-- at: /** [PM-Ca8qD4] -->
## Search policy settings using cached calibration scores

Each calibration name is prepared and scored once. The nested grid changes thresholds, margins and optional edit caps without changing scores. Equal cost prefers a higher threshold, then a higher margin. Held-out cases do not enter this function. Calibration uses large static caches outside the timed resolution path.

<!-- at: /** A safe unknown -->
## Evaluate held-out labels once under the frozen policy

Each result feeds both the overall metrics and one category. The saved record includes suggestions and the intended target index for later diagnostics. Rejecting an ambiguous label as unknown has zero dangerous-assignment cost, but still fails the stricter ambiguity-diagnosis label. This distinction remains visible in the report.


## Reference for the contracts used in this file

The project methodology defines outcome buckets, the separate calibration split and the safety cost model. These are experimental labels and policies, not mathematical properties of a distance. [Open reference](/reference/benchmark-methods/).
