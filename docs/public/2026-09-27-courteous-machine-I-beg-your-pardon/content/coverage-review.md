A00 - Coverage scope

This independent review compared the complete visible source represented by raw-a-m.md, raw-n-z.md, and raw-other.md against extract-a-m.json, extract-n-z.json, and extract-other.json. The earlier conversation omitted by the supplied transcript is unavailable and is not claimed as covered. The opening fragment, "14:32 UTC.", is preserved explicitly as incomplete source material rather than reconstructed into an invented message.

B00 - Results

| Source range | Sections | Fenced blocks | Extraction records |
|---|---:|---:|---:|
| A00-M00 | 13 | 68 | 179 |
| N00-Z00 | 13 | 67 | 117 |
| Initial fragment, IK00-IZ00, AA00-AJ00 | 26 plus fragment | 69 | 189 |
| Total | 52 plus fragment | 204 | 485 |

There are 464 distinct extraction text values after normalizing whitespace across the three extraction files. The 485 records include 288 phrases, 74 examples, 103 patterns, and 20 discouraged comparisons. These are extraction counts, not a claim of 485 separate recommended software messages: patterns include editorial rules, mappings, headings, templates, and the incomplete timestamp fragment. Cross-file repeated wording accounts for the remaining duplicate text values.

C00 - Verification method

Every fenced block was checked against the extraction text after whitespace normalization. A block passed when its complete text was preserved as one record, or when all of its constituent phrase lines were individually preserved. Multi-line prose examples were checked as complete normalized text rather than as disconnected line fragments. The AA00 opening-phrase table was also checked independently; every canonical phrase is present. The B00 layer table is preserved in the raw source and in seven extraction patterns.

All 204 fenced blocks passed. No omitted unique fenced phrase or example was found. The raw prose preserves the surrounding rationale, intensity guidance, and distinctions that do not belong as standalone messages.

D00 - Longer examples and initial-tail templates

The complete examples in IK00, IL00, IM00, IU00, IV00, IW00, AH00, and AI00 are preserved as complete records. The IX00 universal template, IY00 consequential-operation template, and IZ00 short-form template are also preserved in full, including their field labels and placeholders. The discouraged "Unable to cancel order." example and incomplete timestamp preceding IK00 are retained with the initial-fragment source designation.

Longer messages remain distinct from reusable component phrases. In particular, the opening "The records office is not presently receiving visitors." is retained separately from the grounded database-detail example. Exact repetitions may be deduplicated when building the catalog, but a longer message should not be removed merely because it contains an already-retained phrase.

E00 - Additions and editorial cautions

coverage-additions.json is an empty array because the audit found no missing source phrases. No other source or extraction files were modified during this review.

Coverage does not imply endorsement. The archive intentionally retains discouraged phrasing, unsupported assurance risks, and technical claims requiring correction. The UI should distinguish these from recommended copy and keep original wording available for provenance. The initial timestamp fragment and editorial section headings should not appear as recommended messages.
