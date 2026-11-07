---
file: "src/algorithms/hybrid.c"
---

The hybrid combines character similarity with ordered token alignment. It receives tokens captured before spaces and PascalCase boundaries were removed.

Measured observations below describe the recorded dataset and calibrated policy. Timing uses separate synthetic lookup probes; zero observed unsafe matches does not guarantee safety.

<!-- at: 1 -->
## Align tokens, then combine the two similarities

Token insertion and deletion cost 1. Replacing a token costs its normalized character edit distance, so `requst` versus `request` costs `1/7`, rather than a whole token. Two rows retain the token-alignment costs. The final score is 65% whole-name character similarity plus 35% token similarity. For `default requst timeout`, the three input tokens align with `DefaultRequestTimeout`. Concatenated lowercase input exposes one token, so it can behave differently despite a similar joined spelling.


### Calculate one missing word

Compare input `request` with canonical `RequestTimeout`. Preparation produces one input token and two canonical tokens. Joining them gives 7 and 14 characters.

| Part | Cost | Normalize cost | Similarity |
|---|---:|---|---:|
| Characters | Insert `timeout`: 7 | `7/14` | 0.5 |
| Ordered words | Insert one token: 1 | `1/2` | 0.5 |
| Combine | Fixed 65/35 weights | `0.65*0.5 + 0.35*0.5` | 0.5 |

The token matrix uses the same three choices as character edit distance, but a cell counts completed words. Replacing a misspelled word costs its fractional character distance: `requst -> request` costs `1/7`. Inserting or removing an entire word costs 1. The two denominators use different units, so the final mixture combines similarities, not raw costs.

[Allison's edit-distance recurrence](https://www.allisons.org/ll/AlgDS/Dynamic/Edit/) explains the alignment mechanism. Applying it to ordered tokens with fractional substitutions and mixing the two similarities are project-specific choices. Neither part understands semantic synonyms.

<!-- measured:ALG12:start -->
### Ordered token hybrid results from this run

Run recorded 2026-11-07 11:27 PST. It recovered 165 of 185 typos. It made 17 unsafe acceptances.

Compared with Levenshtein, this policy recovered 9 fewer typos, and used about 2.8 times the lookup time. Keeping word boundaries did not make this policy safe for automatic binding.

A median name lookup took about 170 microseconds with 10 properties and 25 milliseconds with 1000. These are separate synthetic typo probes on this host, not timings of the examples below.

Safe ambiguity: `enable detailed logging` was labeled ambiguous and the resolver returned ambiguity.

Unsafe acceptance: `database connection` was labeled unknown, but the resolver accepted `DatabaseConnectionString` with score 0.721. Similar spelling did not establish the intended setting.

[Compare methods](docs/measured-results.md). [Inspect the recorded outcomes](reports/results.csv).
<!-- measured:ALG12:end -->
