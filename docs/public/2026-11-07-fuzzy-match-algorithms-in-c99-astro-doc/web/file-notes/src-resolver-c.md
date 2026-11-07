---
file: "src/resolver.c"
---

The resolver owns the acceptance policy. Scorers supply numbers; this file determines whether the application may bind a name.

<!-- at: 1 -->
## Score candidates and order equal suggestions deterministically

`score_candidates` supports calibration caches. `ranks_ahead` compares scores with a small numerical tolerance and uses lexical order for equal-score suggestions. Lexical order only changes display order; it never makes a tie safe to accept.

<!-- at: /** Optional cached -->
## Accept a unique exact name before applying fuzzy policy

`decide` rejects a collided schema, counts normalized exact names, and accepts one unique exact match without consulting fuzzy thresholds. Otherwise it maintains only two candidates: a new first moves the old first into second. It then checks the absolute score, runner-up lead and optional edit cap, in that order.

<figure class="source-diagram"><img src="/diagrams/resolution-policy.svg" alt="A unique exact name is accepted. Otherwise a low fuzzy score is unknown; tied or close scores are ambiguous; a sufficient lead can proceed to the edit cap and fuzzy acceptance." /><figcaption>Suggestions remain attached to rejected results so the report can show why acceptance failed.</figcaption></figure>

<!-- at: /** Raw key enters -->
## Prepare the raw key and preserve rejection diagnostics

`resolve` validates the registry/method and prepares one input. The configuration value is absent from this interface. Thus an integer value cannot resolve seconds versus milliseconds. Invalid preparation returns `MATCH_INVALID`; an unknown name is a different outcome.


## Reference for the contracts used in this file

The project methodology defines threshold, lead margin and edit cap. These acceptance rules are separate from every similarity formula. [Open reference](/reference/benchmark-methods/).
