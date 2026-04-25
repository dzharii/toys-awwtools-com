2026-04-25

A00 Codex execution guidance

Codex should treat this work as a sequence of deliberate implementation chunks, not as one large pass. Before starting each chunk, Codex should first make a short plan: identify which files are likely to change, what behavior is being added, which tests should prove the behavior, and whether any refactor should happen before implementation. The plan does not need to be long, but it should be explicit enough to prevent accidental scope creep.

After planning, Codex should implement only that chunk. The implementation should keep semantics inside the reusable library, not inside the demo page. The browser demo should remain a consumer of library behavior: it may pass context options, render outputs, show examples, and display errors, but it should not independently decide what an expression means. If implementation reveals that the existing code structure is awkward, Codex has permission to refactor, split modules, rename helpers, or reorganize internals to make the system more coherent.

Each chunk must include tests. The project uses Bun, so Codex should add or update Bun tests for parser behavior, evaluator behavior, formatter output, error codes, and important edge cases. Tests should cover both successful examples and expected failures. A chunk should not be considered complete merely because the feature works manually; it should have automated coverage that protects the behavior from later changes.

After implementation and tests, Codex should pause and review the chunk. The review should ask whether the code became cleaner or more tangled, whether the new behavior fits naturally with existing concepts, whether spans and errors remain precise, whether the demo and documentation need updates, and whether any connected surfaces were missed. If the chunk added a library feature, Codex should check whether the demo examples, fixture data, exports, comments, or README-like documentation should also be updated.

Codex should then refactor where appropriate before moving on. This project is still early, so Codex should not preserve awkward code just because it already exists. It may rewrite or reshape parts of the tokenizer, parser, evaluator, formatter, holiday provider, or demo wiring when that produces a clearer design. If requirements are inconsistent or under-specified, Codex should use its best judgment and choose the behavior that is deterministic, testable, consistent with typed values, and aligned with a controlled expression grammar rather than broad free-form NLP.

Only after the tests pass, the connected surfaces are updated, and the chunk has been reviewed should Codex move to the next chunk. The intended rhythm is: plan the chunk, implement it, test it, review it, refactor it if needed, update docs or demo surfaces, then continue. This keeps the project agent-friendly and prevents a large specification from turning into an unreviewable single edit.



# Implementation To-Do and Agentic Execution Guide for Humanized Dates, Weekdays, and Holidays

A00 Purpose

This document is a practical execution guide for Codex. It converts the product requirements for Humanizer-style output, weekday expressions, and US holiday/observance expressions into a detailed to-do list with acceptance checks.

The work should be implemented in logical chunks. Each chunk should follow the same loop: plan, implement, test, review, refactor, update connected surfaces, and then move to the next chunk.

Codex has broad freedom to rewrite or refactor existing code. The project is not yet production-critical, so internal changes are acceptable when they make the code more consistent, coherent, maintainable, or testable. Codex should use its own best judgment to resolve inconsistencies in the requirements. When a requirement conflicts with existing code structure, prefer the cleaner long-term architecture, but keep observable behavior aligned with the specification.

B00 General execution rules

* [ ] Preserve the core architecture boundary.

  * [ ] Keep parsing, evaluation, formatting, weekday resolution, and holiday resolution inside the library.
  * [ ] Do not move language semantics into the browser demo.
  * [ ] Let the demo consume library results, diagnostics, spans, and value types.
  * [ ] Ensure UI code remains a rendering and configuration layer.

* [ ] Use Bun for tests.

  * [ ] Add or update Bun unit tests for every new public behavior.
  * [ ] Add regression tests for parse errors and evaluation errors.
  * [ ] Add fixture-style tests for important examples.
  * [ ] Run the existing test suite after each chunk.
  * [ ] Do not treat a chunk as complete until the relevant tests pass.

* [ ] Preserve deterministic context behavior.

  * [ ] Use the context's sampled `now` for relative calculations.
  * [ ] Do not call `Date.now()` inside formatting or holiday resolution after evaluation has already sampled `now`.
  * [ ] Ensure all examples are reproducible with a fixed `now`.
  * [ ] Ensure timezone-sensitive outputs use the configured `timeZoneId` or the value's own zone according to the value type.

* [ ] Preserve error quality.

  * [ ] Every expected user-facing failure must return `ok: false`, not throw.
  * [ ] Every parse/evaluation error must include `kind`, `code`, `message`, `span`, `lineColumn`, and optional `hints`.
  * [ ] Error spans should cover the smallest useful source range.
  * [ ] Add tests for error codes and important spans.

* [ ] Refactor when useful.

  * [ ] Codex may split modules, rename helpers, normalize transform handling, or improve AST shapes.
  * [ ] Codex may rewrite existing helper functions when doing so reduces duplication.
  * [ ] Codex may introduce new shared utilities for pluralization, date comparison, weekday math, and holiday date calculation.
  * [ ] Codex should avoid large, tangled additions to `evaluate.js` or `format.js` if a new module would be clearer.

* [ ] Update all connected parts.

  * [ ] Update library exports when new modules or public helpers are introduced.
  * [ ] Update demo examples and categories.
  * [ ] Update developer details if new diagnostics are helpful.
  * [ ] Update reference fixtures when examples are intended to be stable.
  * [ ] Update inline comments where new code has non-obvious rules.

C00 Chunk workflow template

Use this workflow for every implementation chunk.

* [ ] Plan the chunk.

  * [ ] Identify files likely to change.
  * [ ] Identify new modules, if any.
  * [ ] Identify public behavior and example expressions.
  * [ ] Identify expected parse errors and evaluation errors.
  * [ ] Decide whether existing code should be refactored before implementing.
  * [ ] Write a short local plan before editing code.

* [ ] Implement the chunk.

  * [ ] Keep the implementation small enough to review.
  * [ ] Prefer reusable helper functions over special cases embedded in parser/evaluator code.
  * [ ] Preserve spans through tokenizer, parser, and evaluator.
  * [ ] Keep user-facing strings stable and tested.

* [ ] Add tests.

  * [ ] Add unit tests for helper modules.
  * [ ] Add parser tests for syntax.
  * [ ] Add evaluator tests for typed values.
  * [ ] Add formatter tests for exact output strings.
  * [ ] Add error tests for invalid expressions.
  * [ ] Run Bun tests.

* [ ] Review and reflect.

  * [ ] Check whether the chunk introduced duplication.
  * [ ] Check whether naming is consistent with existing modules.
  * [ ] Check whether the AST remains understandable.
  * [ ] Check whether the browser demo still works.
  * [ ] Check whether examples are visible and useful.
  * [ ] Check whether documentation or comments need updates.

* [ ] Mark the chunk complete only when acceptance checks pass.

  * [ ] Tests pass.
  * [ ] Demo behavior works for core examples.
  * [ ] Errors are structured and useful.
  * [ ] No semantics are implemented only in the UI.
  * [ ] Code is coherent enough for the next chunk to build on it.

D00 Chunk 1: Refactor transform parsing and transform names

Goal: support multiword transform names in a clean, reusable way.

* [ ] Plan transform handling.

  * [ ] Review current `keywords.js`, `parse.js`, `evaluate.js`, and `format.js`.
  * [ ] Decide whether to create a dedicated transform-name module, for example `lib/transform-names.js`.
  * [ ] Decide how transform phrases terminate.
  * [ ] Ensure transform parsing can support `duration words`, `compact duration`, and `ordinal date`.

* [ ] Implement canonical transform names.

  * [ ] Keep existing transforms: `iso`, `date`, `time`.
  * [ ] Add canonical names: `relative`, `duration`, `durationWords`, `compactDuration`, `ordinal`, `ordinalDate`, `clock`.
  * [ ] Normalize case and whitespace.
  * [ ] Ensure `as` and `->` remain synonyms.
  * [ ] Ensure transform text is not parsed as arbitrary free text.

* [ ] Implement multiword transform parsing.

  * [ ] Parse `now as duration words`.
  * [ ] Parse `now -> duration words`.
  * [ ] Parse `2026-02-08 as ordinal date`.
  * [ ] Parse `90 seconds as compact duration`.
  * [ ] Preserve the full span of the transform phrase.
  * [ ] Keep clear boundaries before operators, parentheses, commas, and end of input.

* [ ] Add transform parser tests.

  * [ ] Test `now as iso`.
  * [ ] Test `now -> iso`.
  * [ ] Test `now as relative`.
  * [ ] Test `90 seconds as duration words`.
  * [ ] Test `90 seconds as compact duration`.
  * [ ] Test `2026-02-08 as ordinal date`.
  * [ ] Test mixed casing such as `now AS Duration Words`.
  * [ ] Test unknown transform such as `now as banana mode`.

* [ ] Acceptance checks.

  * [ ] Existing transform behavior remains unchanged.
  * [ ] Multiword transform spans are accurate.
  * [ ] Unknown transform errors remain stable and actionable.
  * [ ] Parser code remains understandable.
  * [ ] No formatting behavior is implemented in the parser.

E00 Chunk 2: Humanization helpers

Goal: create the shared English helpers needed by the formatter.

* [ ] Create a humanization helper module.

  * [ ] Suggested file: `lib/humanize.js`.
  * [ ] Keep English grammar helpers in one place.
  * [ ] Avoid scattering pluralization rules through `format.js` and `evaluate.js`.

* [ ] Implement pluralization helpers.

  * [ ] Format `1 day`.
  * [ ] Format `2 days`.
  * [ ] Format `1 business day`.
  * [ ] Format `3 business days`.
  * [ ] Keep rules simple and English-only.

* [ ] Implement English list formatting.

  * [ ] `[]` returns an empty string.
  * [ ] `["seconds"]` returns `seconds`.
  * [ ] `["minutes", "seconds"]` returns `minutes and seconds`.
  * [ ] `["days", "hours", "minutes"]` returns `days, hours and minutes`.
  * [ ] Use no Oxford comma in v1.

* [ ] Implement ordinal formatting helper.

  * [ ] `1` -> `1st`.
  * [ ] `2` -> `2nd`.
  * [ ] `3` -> `3rd`.
  * [ ] `4` -> `4th`.
  * [ ] `11` -> `11th`.
  * [ ] `12` -> `12th`.
  * [ ] `13` -> `13th`.
  * [ ] `21` -> `21st`.
  * [ ] `111` -> `111th`.
  * [ ] `121` -> `121st`.

* [ ] Implement month name formatting helper.

  * [ ] `1` -> `January`.
  * [ ] `2` -> `February`.
  * [ ] Continue through `12` -> `December`.
  * [ ] Use this helper for `ordinal date`.

* [ ] Add helper tests.

  * [ ] Test pluralization.
  * [ ] Test English list joining.
  * [ ] Test ordinal suffix exceptions.
  * [ ] Test month names.

* [ ] Acceptance checks.

  * [ ] Humanization helpers are independent of parser and evaluator.
  * [ ] Helpers are deterministic and English-only.
  * [ ] Helpers are unit-tested.
  * [ ] Existing format tests still pass.

F00 Chunk 3: Duration humanization transforms

Goal: implement `duration words`, `duration`, and `compact duration`.

* [ ] Plan duration decomposition.

  * [ ] Inspect current `Duration` representation.
  * [ ] Identify whether durations are stored as a unit plus amount only.
  * [ ] Decide how to decompose seconds and milliseconds into weeks, days, hours, minutes, seconds, and milliseconds.
  * [ ] Decide how to handle calendar units like months and years.
  * [ ] Prefer not to approximate months and years in v1.

* [ ] Implement `duration words`.

  * [ ] `90 seconds as duration words` -> `1 minute and 30 seconds`.
  * [ ] `65 seconds as duration words` -> `1 minute and 5 seconds`.
  * [ ] `93784 seconds as duration words` -> `1 day, 2 hours, 3 minutes and 4 seconds`.
  * [ ] `2026-02-23 - 2026-02-08 as duration words` -> `15 days`.
  * [ ] Negative durations should produce stable output, preferably with a leading `-`.

* [ ] Implement `duration`.

  * [ ] Either make it an alias for `duration words`, or make it default to the two largest units.
  * [ ] If precision differs, document it in tests and examples.
  * [ ] Keep behavior deterministic.

* [ ] Implement `compact duration`.

  * [ ] `90 seconds as compact duration` -> `1m 30s`.
  * [ ] `93784 seconds as compact duration` -> `1d 2h 3m 4s`.
  * [ ] Use symbols: `w`, `d`, `h`, `m`, `s`, `ms`.
  * [ ] Do not use ambiguous month symbols in v1.

* [ ] Add error handling.

  * [ ] Applying duration transforms to non-duration values should produce an evaluation error.
  * [ ] Error should point at the transform phrase.
  * [ ] Hint should say that duration formatting requires a duration value.

* [ ] Add tests.

  * [ ] Test direct duration literals.
  * [ ] Test duration from PlainDate subtraction.
  * [ ] Test duration from ZonedDateTime subtraction.
  * [ ] Test negative duration output.
  * [ ] Test non-duration input error.

* [ ] Acceptance checks.

  * [ ] Existing ISO duration formatting remains available.
  * [ ] Duration word outputs are exact and stable.
  * [ ] Compact outputs are exact and stable.
  * [ ] No months/years are approximated unless explicitly represented.
  * [ ] Tests cover representative unit boundaries.

G00 Chunk 4: Relative transform

Goal: implement `as relative`.

* [ ] Plan relative comparison.

  * [ ] Confirm how the evaluator passes context to `formatValue`.
  * [ ] Ensure formatter can access sampled `now`, not a newly sampled clock.
  * [ ] Decide whether `evaluateAst` should include sampled now in context passed to formatter.
  * [ ] Ensure `PlainDate` comparison uses the context local date.

* [ ] Implement `relative` for `ZonedDateTime` and `OffsetDateTime`.

  * [ ] Compare instants.
  * [ ] Return `now` for zero delta.
  * [ ] Return `N units ago` for past deltas.
  * [ ] Return `N units from now` for future deltas.
  * [ ] Use milliseconds, seconds, minutes, hours, days, weeks according to stable thresholds.

* [ ] Implement `relative` for `PlainDate`.

  * [ ] Compare date to context date.
  * [ ] Return `1 day from now`, `7 days ago`, and similar deterministic phrases.
  * [ ] Do not return `tomorrow` or `yesterday` in v1.

* [ ] Add tests.

  * [ ] `now as relative` -> `now`.
  * [ ] `now + 3 hours as relative` -> `3 hours from now`.
  * [ ] `now - 1 minute as relative` -> `1 minute ago`.
  * [ ] `2026-02-09 as relative` -> `1 day from now`.
  * [ ] `2026-02-01 as relative` -> `7 days ago`.
  * [ ] DST-adjacent calendar-day and hour examples if fixture context supports them.

* [ ] Add error handling.

  * [ ] Applying `relative` to unsupported types should produce an evaluation error.
  * [ ] Error span should cover `relative`.

* [ ] Acceptance checks.

  * [ ] No internal `Date.now()` call is used for relative output.
  * [ ] Fixed-context outputs are deterministic.
  * [ ] PlainDate and ZonedDateTime semantics are different where appropriate.
  * [ ] Tests cover past, present, future, PlainDate, and ZonedDateTime.

H00 Chunk 5: Ordinal and ordinal date transforms

Goal: implement `as ordinal` and `as ordinal date`.

* [ ] Implement `ordinal`.

  * [ ] Accept integer `Number` values.
  * [ ] Reject non-integers.
  * [ ] Prefer rejecting negative numbers in v1.
  * [ ] Use the ordinal helper from `humanize.js`.

* [ ] Implement `ordinal date`.

  * [ ] Accept `PlainDate`.
  * [ ] Accept `ZonedDateTime`.
  * [ ] Accept `OffsetDateTime`.
  * [ ] Extract date using the value's own zone or offset.
  * [ ] Output `Month Nth, YYYY`.

* [ ] Add tests.

  * [ ] `1 as ordinal` -> `1st`.
  * [ ] `2 as ordinal` -> `2nd`.
  * [ ] `3 as ordinal` -> `3rd`.
  * [ ] `4 as ordinal` -> `4th`.
  * [ ] `11 as ordinal` -> `11th`.
  * [ ] `13 as ordinal` -> `13th`.
  * [ ] `121 as ordinal` -> `121st`.
  * [ ] `2026-02-08 as ordinal date` -> `February 8th, 2026`.
  * [ ] `now as ordinal date` under fixed context.
  * [ ] Invalid input errors.

* [ ] Acceptance checks.

  * [ ] Ordinal errors are structured and tested.
  * [ ] `ordinal date` uses stable English month names.
  * [ ] `ordinal date` works with timezone-aware values.
  * [ ] Existing `as date` behavior remains unchanged.

I00 Chunk 6: Clock transform

Goal: implement `as clock`.

* [ ] Plan clock wording.

  * [ ] Decide whether to support all minutes or only common phrases.
  * [ ] Preferred v1: support all minutes using `past` and `to` wording.
  * [ ] Define midnight and noon behavior.

* [ ] Implement clock transform for date-times.

  * [ ] `15:00` -> `three o'clock`.
  * [ ] `15:15` -> `a quarter past three`.
  * [ ] `15:30` -> `half past three`.
  * [ ] `15:45` -> `a quarter to four`.
  * [ ] `15:07` -> `seven past three`, if all-minute support is implemented.
  * [ ] `00:00` -> `twelve o'clock`.
  * [ ] `12:00` -> `twelve o'clock`.

* [ ] Add error handling.

  * [ ] `2026-02-08 as clock` should fail.
  * [ ] Error code should indicate that clock formatting requires a time-of-day value.
  * [ ] Hint should suggest using a timestamp or `start of day`.

* [ ] Add tests.

  * [ ] Test exact hour.
  * [ ] Test quarter past.
  * [ ] Test half past.
  * [ ] Test quarter to.
  * [ ] Test midnight.
  * [ ] Test noon.
  * [ ] Test PlainDate error.

* [ ] Acceptance checks.

  * [ ] `clock` does not replace `time`; both transforms exist.
  * [ ] Output is deterministic and English-only.
  * [ ] Offset-only and IANA date-times both work.
  * [ ] Error spans cover the transform phrase.

J00 Chunk 7: Weekday expression parsing and evaluation

Goal: support bare, next, last, and optionally this weekday expressions.

* [ ] Plan weekday module.

  * [ ] Suggested file: `lib/weekday.js`.
  * [ ] Reuse existing weekday index convention: Sunday 0 through Saturday 6.
  * [ ] Decide whether to support short aliases such as `Mon`, `Tue`, `Wed`.
  * [ ] Prefer full names required; aliases optional.

* [ ] Add weekday parsing.

  * [ ] Parse `Monday`.
  * [ ] Parse `Tuesday`.
  * [ ] Parse all seven full weekday names.
  * [ ] Parse `next Monday`.
  * [ ] Parse `last Monday`.
  * [ ] Optionally parse `this Monday`.
  * [ ] Preserve spans for the full weekday expression.

* [ ] Add weekday evaluation.

  * [ ] Bare weekday is future-strict.
  * [ ] `next <weekday>` is future-strict.
  * [ ] `last <weekday>` is past-strict.
  * [ ] `this <weekday>` is current-week inclusive, if implemented.
  * [ ] Return `PlainDate`.

* [ ] Add examples as tests.

  * [ ] Context Tuesday 2026-02-10, `Tuesday` -> 2026-02-17.
  * [ ] Context Tuesday 2026-02-10, `Wednesday` -> 2026-02-11.
  * [ ] Context Friday 2026-02-13, `Wednesday` -> 2026-02-18.
  * [ ] Context Monday 2026-02-09, `Monday` -> 2026-02-16.
  * [ ] Context Tuesday 2026-02-10, `next Tuesday` -> 2026-02-17.
  * [ ] Context Tuesday 2026-02-10, `last Tuesday` -> 2026-02-03.
  * [ ] Context Wednesday 2026-02-11, `last Tuesday` -> 2026-02-10.
  * [ ] Context Tuesday 2026-02-10, `this Tuesday` -> 2026-02-10, if supported.

* [ ] Test composition.

  * [ ] `Monday + 2 days`.
  * [ ] `Wednesday + 1 business day`.
  * [ ] `business days between today and Friday`.
  * [ ] `start of day Monday`.

* [ ] Acceptance checks.

  * [ ] Weekday names do not break existing keyword parsing.
  * [ ] Weekday expressions return `PlainDate`.
  * [ ] Future-strict and past-strict rules are tested.
  * [ ] Composition with arithmetic and anchors works.
  * [ ] Error behavior remains stable for unrelated words.

K00 Chunk 8: US federal holiday provider

Goal: implement US federal holiday calculation and observed-date rules.

* [ ] Plan holiday provider API.

  * [ ] Suggested file: `lib/holiday-calendar.js`.
  * [ ] Suggested provider file: `lib/us-holidays.js`.
  * [ ] Implement provider methods for resolving by name, next holiday, last holiday, actual date, and observed date.
  * [ ] Keep provider independent from the parser where possible.
  * [ ] Let parser identify controlled phrases and evaluator call provider.

* [ ] Implement fixed-date federal holidays.

  * [ ] New Year's Day: January 1.
  * [ ] Juneteenth National Independence Day: June 19.
  * [ ] Independence Day: July 4.
  * [ ] Veterans Day: November 11.
  * [ ] Christmas Day: December 25.

* [ ] Implement floating federal holidays.

  * [ ] Birthday of Martin Luther King, Jr.: third Monday in January.
  * [ ] Washington's Birthday: third Monday in February.
  * [ ] Memorial Day: last Monday in May.
  * [ ] Labor Day: first Monday in September.
  * [ ] Columbus Day: second Monday in October.
  * [ ] Thanksgiving Day: fourth Thursday in November.

* [ ] Implement observed-date rules.

  * [ ] Saturday actual date observes on preceding Friday.
  * [ ] Sunday actual date observes on following Monday.
  * [ ] Monday-Friday actual date observes on the same date.
  * [ ] Preserve both actual and observed dates in provider results.

* [ ] Implement aliases.

  * [ ] `new year`, `new years day`.
  * [ ] `mlk day`, `martin luther king day`.
  * [ ] `presidents day`, `president's day`.
  * [ ] `juneteenth`.
  * [ ] `july 4`, `fourth of july`.
  * [ ] `thanksgiving`.
  * [ ] `christmas`, `xmas`.
  * [ ] Include all aliases from the PRD unless parser complexity requires staging.

* [ ] Add tests.

  * [ ] `Thanksgiving 2026` -> 2026-11-26.
  * [ ] `Memorial Day 2026` -> 2026-05-25.
  * [ ] `Labor Day 2026` -> 2026-09-07.
  * [ ] `Independence Day 2026` -> observed 2026-07-03 by default.
  * [ ] `actual Independence Day 2026` -> 2026-07-04.
  * [ ] `observed Independence Day 2026` -> 2026-07-03.
  * [ ] `Presidents Day 2026` -> 2026-02-16.

* [ ] Acceptance checks.

  * [ ] Actual and observed dates are both available.
  * [ ] Bare federal holiday names default to observed date.
  * [ ] Alias resolution returns canonical names internally.
  * [ ] Federal holiday provider is not hardcoded into unrelated code.
  * [ ] Tests cover fixed, floating, and observed holidays.

L00 Chunk 9: Common US observance provider

Goal: add common observances without treating them as federal business closures.

* [ ] Implement common observances.

  * [ ] Valentine's Day: February 14.
  * [ ] Easter: Western Easter Sunday.
  * [ ] Mother's Day: second Sunday in May.
  * [ ] Father's Day: third Sunday in June.
  * [ ] Halloween: October 31.
  * [ ] Black Friday: Friday after Thanksgiving.
  * [ ] Cyber Monday: Monday after Thanksgiving.
  * [ ] Christmas Eve: December 24.
  * [ ] New Year's Eve: December 31.

* [ ] Implement Easter calculation.

  * [ ] Use a deterministic Western Easter algorithm.
  * [ ] Add comments explaining the algorithm or linking to the source of the algorithm if appropriate.
  * [ ] Do not implement Orthodox Easter unless doing so is simple and tested.
  * [ ] If Orthodox Easter is not implemented, fail clearly for `Orthodox Easter`.

* [ ] Implement observance aliases.

  * [ ] `valentines day`, `valentine's day`.
  * [ ] `easter`, `western easter`.
  * [ ] `mothers day`, `mother's day`.
  * [ ] `fathers day`, `father's day`.
  * [ ] `halloween`.
  * [ ] `black friday`.
  * [ ] `cyber monday`.
  * [ ] `christmas eve`.
  * [ ] `new years eve`, `new year's eve`.

* [ ] Ensure observances do not become business closures by default.

  * [ ] Mother's Day should resolve to a date but not mark the day as a holiday closure.
  * [ ] Black Friday should resolve to a date but not be closed unless the configured business calendar says so.
  * [ ] Easter should resolve to a date but not close Monday-Friday business days by default.

* [ ] Add tests.

  * [ ] `Easter 2026` -> 2026-04-05.
  * [ ] `Mother's Day 2026` -> 2026-05-10.
  * [ ] `Father's Day 2026` -> 2026-06-21.
  * [ ] `Halloween 2026` -> 2026-10-31.
  * [ ] `Black Friday 2026` -> 2026-11-27.
  * [ ] `Cyber Monday 2026` -> 2026-11-30.
  * [ ] `Christmas Eve 2026` -> 2026-12-24.
  * [ ] `New Year's Eve 2026` -> 2026-12-31.

* [ ] Acceptance checks.

  * [ ] Federal holidays and common observances are separated internally.
  * [ ] Observance date resolution is deterministic.
  * [ ] Observances compose with arithmetic and transforms.
  * [ ] Observances do not alter business-day rules unless configured.

M00 Chunk 10: Holiday expression grammar and evaluation

Goal: parse and evaluate holiday and observance expressions.

* [ ] Add holiday expression parsing.

  * [ ] Parse bare holiday names, such as `Thanksgiving`.
  * [ ] Parse holiday names with years, such as `Thanksgiving 2026`.
  * [ ] Parse `actual Independence Day 2026`.
  * [ ] Parse `observed Independence Day 2026`.
  * [ ] Parse `next holiday`.
  * [ ] Parse `last holiday`.
  * [ ] Parse `next federal holiday`.
  * [ ] Parse `next observed holiday`.
  * [ ] Parse `next observance`.

* [ ] Add holiday expression evaluation.

  * [ ] Bare federal holiday name returns next observed occurrence.
  * [ ] Bare common observance name returns next occurrence.
  * [ ] Holiday name with year returns the year-specific occurrence.
  * [ ] `actual` returns actual calendar date.
  * [ ] `observed` returns federal observed date where supported.
  * [ ] `next holiday` returns next observed federal holiday strictly after context date.
  * [ ] `last holiday` returns previous observed federal holiday strictly before context date.
  * [ ] `next observance` returns next common observance strictly after context date.

* [ ] Add missing-provider errors.

  * [ ] If holiday expressions are used without a holiday provider, return `E_EVAL_HOLIDAY_CALENDAR_MISSING`.
  * [ ] If observance expressions are used without an observance provider, return `E_EVAL_OBSERVANCE_CALENDAR_MISSING`.
  * [ ] Include actionable hints.

* [ ] Add unknown-name errors.

  * [ ] Unknown holiday or observance names should fail clearly.
  * [ ] Error should include examples of supported names.
  * [ ] Preserve span for the unknown phrase.

* [ ] Add tests.

  * [ ] `next holiday` from 2026-02-10 -> 2026-02-16.
  * [ ] `next holiday` from 2026-02-16 -> 2026-05-25.
  * [ ] `last holiday` from 2026-02-17 -> 2026-02-16.
  * [ ] `Thanksgiving` from context before Thanksgiving -> same-year Thanksgiving.
  * [ ] `Thanksgiving` from context after Thanksgiving -> next-year Thanksgiving.
  * [ ] `Mother's Day` from context before Mother's Day -> same-year Mother's Day.
  * [ ] `Black Friday` from context before Black Friday -> same-year Black Friday.
  * [ ] Unknown holiday error.
  * [ ] Missing holiday provider error.

* [ ] Acceptance checks.

  * [ ] Holiday names are controlled phrases, not arbitrary free text.
  * [ ] Bare federal holidays and common observances follow documented defaults.
  * [ ] `next` and `last` are strict and do not return today.
  * [ ] Holiday expressions return `PlainDate`.
  * [ ] Errors are structured and tested.

N00 Chunk 11: Derived weekday-relative expressions

Goal: support expressions like `Monday after Thanksgiving`.

* [ ] Add grammar.

  * [ ] Parse `<weekday> after <dateExpression>`.
  * [ ] Parse `<weekday> before <dateExpression>`.
  * [ ] Use full weekday names at minimum.
  * [ ] Preserve spans for weekday, operator, and target expression.

* [ ] Add evaluation.

  * [ ] Evaluate target expression to date-like value.
  * [ ] If target is `PlainDate`, use it directly.
  * [ ] If target is `ZonedDateTime`, use local date.
  * [ ] `weekday after X` is future-strict relative to X.
  * [ ] `weekday before X` is past-strict relative to X.
  * [ ] Return `PlainDate`.

* [ ] Add examples as tests.

  * [ ] `Monday after Thanksgiving 2026` -> 2026-11-30.
  * [ ] `Monday after Thanksgiving` from 2026-02-10 -> 2026-11-30.
  * [ ] `Friday before Memorial Day 2026` -> 2026-05-22.
  * [ ] `Monday after Easter 2026` -> 2026-04-06.
  * [ ] `Tuesday before Thanksgiving 2026` -> 2026-11-24.

* [ ] Add error handling.

  * [ ] If target does not evaluate to a date-like value, return an evaluation error.
  * [ ] Error should point at the target expression or relative operator.
  * [ ] Hint should say that `before` and `after` require a date-like expression.

* [ ] Acceptance checks.

  * [ ] Derived weekday expressions are general, not hardcoded only for Thanksgiving.
  * [ ] The feature composes with holidays, observances, ISO dates, weekdays, and anchors.
  * [ ] The rules are strict when the target is already the requested weekday.
  * [ ] Tests cover before and after.

O00 Chunk 12: Optional business-day-relative expressions

Goal: add `first business day after` and related forms only if the prior chunks are stable.

* [ ] Decide whether to include this chunk now.

  * [ ] Include if holiday/business-calendar integration is clear.
  * [ ] Defer if parser complexity is already high.

* [ ] Add grammar if included.

  * [ ] Parse `first business day after <dateExpression>`.
  * [ ] Parse `first business day before <dateExpression>`.
  * [ ] Parse `last business day before <dateExpression>`.

* [ ] Add evaluation if included.

  * [ ] Use configured business calendar.
  * [ ] Return `PlainDate`.
  * [ ] Do not count the starting date itself.
  * [ ] Search forward or backward until a business day is found.

* [ ] Add tests if included.

  * [ ] `first business day after Thanksgiving 2026` with federal-only calendar -> 2026-11-27.
  * [ ] Same expression with Black Friday closure -> 2026-11-30.
  * [ ] `last business day before Christmas 2026` -> 2026-12-24 unless Christmas Eve is configured closed.

* [ ] Acceptance checks if included.

  * [ ] Uses existing business calendar semantics.
  * [ ] Works with configured holiday closures.
  * [ ] Does not hardcode Black Friday as closed.
  * [ ] Has clear tests for custom closures.

P00 Chunk 13: Holiday-aware business calendar integration

Goal: allow observed federal holidays to affect business-day arithmetic when configured.

* [ ] Plan integration.

  * [ ] Review `business-calendar.js`.
  * [ ] Decide whether to generate holiday date sets for a year range.
  * [ ] Ensure business-calendar rules can be based on observed federal holidays.
  * [ ] Keep common observances separate from closures.

* [ ] Implement holiday-aware calendar mode.

  * [ ] Add a way to create a business calendar from the US federal holiday provider.
  * [ ] Include observed federal holidays.
  * [ ] Support at least the years needed by fixtures.
  * [ ] Consider extending year range dynamically when expressions cross years.

* [ ] Add optional custom closures.

  * [ ] Allow adding dates like Black Friday as company closures if simple.
  * [ ] Do not require this for the first pass unless needed by tests.

* [ ] Add tests.

  * [ ] `Memorial Day 2026 + 1 business day` -> 2026-05-26.
  * [ ] `Thanksgiving 2026 + 1 business day` with federal-only calendar -> 2026-11-27.
  * [ ] `Thanksgiving 2026 + 1 business day` with Black Friday closure -> 2026-11-30, if custom closures are supported.
  * [ ] `business days between Juneteenth 2026 and Independence Day 2026` under holiday-aware calendar.

* [ ] Acceptance checks.

  * [ ] Federal observed holidays can be non-business days.
  * [ ] Common observances are not non-business days by default.
  * [ ] Business-day shifting and counting use the same calendar rules.
  * [ ] Existing default Mon-Fri no-holidays behavior remains available.

Q00 Chunk 14: Browser demo updates

Goal: surface the new functionality without adding semantics to the UI.

* [ ] Add controls.

  * [ ] Add holiday calendar control if appropriate.
  * [ ] Suggested options: `None`, `US federal holidays`, `US federal holidays + common observances`.
  * [ ] Add business calendar mode: `Mon-Fri no holidays`, `Mon-Fri with US federal observed holidays`.
  * [ ] Persist new controls in local storage.

* [ ] Add examples.

  * [ ] Add category `Humanized output`.
  * [ ] Add category `Weekdays`.
  * [ ] Add category `Federal holidays`.
  * [ ] Add category `Common observances`.
  * [ ] Add category `Holiday-relative dates`.

* [ ] Add example items.

  * [ ] `now + 3 hours as relative`.
  * [ ] `90 seconds as duration words`.
  * [ ] `2026-02-08 as ordinal date`.
  * [ ] `2026-02-08T15:30:00-08:00 as clock`.
  * [ ] `Monday`.
  * [ ] `next Tuesday`.
  * [ ] `last Friday`.
  * [ ] `Thanksgiving 2026`.
  * [ ] `actual Independence Day 2026`.
  * [ ] `observed Independence Day 2026`.
  * [ ] `Easter 2026`.
  * [ ] `Mother's Day 2026`.
  * [ ] `Black Friday 2026`.
  * [ ] `Monday after Thanksgiving 2026`.

* [ ] Update explain panel.

  * [ ] Show weekday resolution steps.
  * [ ] Show holiday canonical names.
  * [ ] Show whether holiday date is actual, observed, federal, or common observance.
  * [ ] Keep explanation based on AST/evaluation metadata rather than UI heuristics.

* [ ] Update fixture matching.

  * [ ] Add fixture examples for new categories.
  * [ ] Ensure selected fixture still shows `Matches fixture` or `Differs from fixture`.
  * [ ] Ensure custom input still disables fixture comparison.

* [ ] Acceptance checks.

  * [ ] Demo remains usable with no holiday provider configured.
  * [ ] Demo does not duplicate parser/evaluator logic.
  * [ ] New examples evaluate correctly.
  * [ ] New errors render with spans and hints.
  * [ ] Local storage persistence still works.

R00 Chunk 15: Documentation and comments

Goal: document behavior enough that future contributors can maintain it.

* [ ] Update README or docs.

  * [ ] Document new transforms.
  * [ ] Document weekday rules.
  * [ ] Document holiday and observance categories.
  * [ ] Document observed vs actual dates.
  * [ ] Document business-calendar integration.
  * [ ] Document examples.

* [ ] Add code comments where rules are non-obvious.

  * [ ] Easter calculation.
  * [ ] Observed federal holiday rule.
  * [ ] Future-strict and past-strict weekday resolution.
  * [ ] Transform phrase parsing.
  * [ ] Duration decomposition.

* [ ] Add fixture documentation if fixture files are added.

  * [ ] Explain context fields.
  * [ ] Explain expected output shape.
  * [ ] Explain calendar provider modes.

* [ ] Acceptance checks.

  * [ ] A new contributor can understand the new syntax from docs.
  * [ ] Non-obvious algorithms are commented.
  * [ ] Examples in docs are covered by tests where practical.
  * [ ] Documentation does not promise unsupported free-form NLP.

S00 Chunk 16: Final integration review

Goal: inspect the whole implementation after all chunks.

* [ ] Run all tests.

  * [ ] Run Bun test suite.
  * [ ] Run any demo or fixture verification scripts.
  * [ ] Fix regressions.

* [ ] Review architecture.

  * [ ] Check whether `evaluate.js` became too large.
  * [ ] Check whether parser phrase matching is clean.
  * [ ] Check whether holiday provider code is separated from business calendar code.
  * [ ] Check whether humanization helpers are reusable.
  * [ ] Refactor if any module became confusing.

* [ ] Review semantics.

  * [ ] Confirm weekday resolution rules.
  * [ ] Confirm federal vs observance distinction.
  * [ ] Confirm observed vs actual behavior.
  * [ ] Confirm common observances do not close business days by default.
  * [ ] Confirm relative transform uses sampled context now.
  * [ ] Confirm all transforms return `String`.

* [ ] Review UX.

  * [ ] Open demo and manually run top examples.
  * [ ] Check error highlighting for at least one parse error and one evaluation error.
  * [ ] Check developer details if enabled.
  * [ ] Check local storage restore.
  * [ ] Check narrow layout if CSS was touched.

* [ ] Review test coverage.

  * [ ] Ensure each new transform has tests.
  * [ ] Ensure each weekday rule has tests.
  * [ ] Ensure each federal holiday rule type has tests.
  * [ ] Ensure common observances have tests.
  * [ ] Ensure derived expressions have tests.
  * [ ] Ensure missing-provider and unknown-name errors have tests.

* [ ] Final acceptance checks.

  * [ ] All required examples from the specification work.
  * [ ] All new behavior is implemented in library code.
  * [ ] The demo exposes the features but does not own semantics.
  * [ ] The code is cleaner or at least not materially worse than before.
  * [ ] Codex has resolved any requirement inconsistencies using documented judgment.

T00 Suggested implementation order summary

* [ ] Chunk 1: Transform parsing and canonical transform names.
* [ ] Chunk 2: Humanization helpers.
* [ ] Chunk 3: Duration humanization transforms.
* [ ] Chunk 4: Relative transform.
* [ ] Chunk 5: Ordinal and ordinal date transforms.
* [ ] Chunk 6: Clock transform.
* [ ] Chunk 7: Weekday expressions.
* [ ] Chunk 8: US federal holiday provider.
* [ ] Chunk 9: Common US observance provider.
* [ ] Chunk 10: Holiday expression grammar and evaluation.
* [ ] Chunk 11: Derived weekday-relative expressions.
* [ ] Chunk 12: Optional business-day-relative expressions.
* [ ] Chunk 13: Holiday-aware business calendar integration.
* [ ] Chunk 14: Browser demo updates.
* [ ] Chunk 15: Documentation and comments.
* [ ] Chunk 16: Final integration review.

U00 Minimum viable stopping points

If the work needs to stop early, use these milestones.

* [ ] Milestone 1: Humanized output complete.

  * [ ] Multiword transforms work.
  * [ ] `relative`, `duration words`, `compact duration`, `ordinal`, `ordinal date`, and `clock` work.
  * [ ] Tests pass.
  * [ ] Demo examples exist.

* [ ] Milestone 2: Weekdays complete.

  * [ ] Bare, next, and last weekday expressions work.
  * [ ] Weekday expressions compose with arithmetic.
  * [ ] Tests pass.
  * [ ] Demo examples exist.

* [ ] Milestone 3: Holidays and observances complete.

  * [ ] US federal holidays work.
  * [ ] Observed vs actual dates work.
  * [ ] Common observances work.
  * [ ] `next holiday` works.
  * [ ] Tests pass.
  * [ ] Demo examples exist.

* [ ] Milestone 4: Derived expressions and business calendar complete.

  * [ ] `Monday after Thanksgiving` works.
  * [ ] Observed federal holidays can affect business days.
  * [ ] Optional company closures work if implemented.
  * [ ] Tests pass.
  * [ ] Demo examples exist.

V00 Codex judgment guidance

When requirements are ambiguous, Codex should choose the behavior that is:

* [ ] Deterministic with fixed context.
* [ ] Easier to test.
* [ ] More consistent with existing typed values.
* [ ] More consistent with controlled grammar rather than free-form NLP.
* [ ] More likely to preserve precise error spans.
* [ ] Less likely to treat common observances as business closures without explicit configuration.
* [ ] Easier to extend with future holiday providers.

Codex should document any important judgment call in code comments or a short implementation note.
