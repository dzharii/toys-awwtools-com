# Humanizer Features Report for the Date/Time Expression Calculator

Date: 2026-04-25

Source reviewed: `reference_data/Humanizer_Humanizer-3.0.10/src`

Project reviewed: the current vanilla JavaScript date/time expression engine under `lib/`, with browser wiring in `app/main.js` and Bun tests under `tests/`.

## Executive Summary

Humanizer is useful to this project less as a library to copy and more as a catalog of mature product decisions around time, duration, natural language, formatting, and localization. Our calculator already has the hard core of a date/time expression language: tokenization, parsing, evaluation, typed values, IANA zones, fixed `now`, calendar-vs-timeline arithmetic, business calendars, transforms, diagnostics, and a test suite. Humanizer points toward the next layer: making results easier to read, making inputs more natural, and making explanations feel less mechanical.

The strongest candidates for near-term adoption are:

1. Relative date/time humanization: `now + 3 hours as relative` -> `3 hours from now`.
2. Duration humanization: `93784 seconds as duration words` -> `1 day, 2 hours, 3 minutes and 4 seconds`.
3. Clock notation: `15:30 as clock` or `now -> clock` -> `half past three`.
4. Ordinal dates and ordinal numbers: `2026-02-08 as ordinal date` -> `February 8th, 2026`.
5. English list formatting for explain panels and diagnostics: `days, hours and minutes` instead of plain comma joins.

The features worth prototyping but not immediately committing are spoken-number parsing and natural month-name date syntax. They are compelling, but they touch tokenizer and parser ambiguity more deeply than formatter-only transforms.

Full Humanizer-style localization, gendered number words, broad grammatical-case support, and full inflection should be deferred. They are important design influences, but they are too large for the next specification and would distract from the date/time calculator’s core purpose.

This report intentionally describes what to reimplement in our own JavaScript style. It should not be read as permission to copy Humanizer code directly. The value is in the product behavior and edge-case lessons, not the C# implementation details.

## Current Engine Fit

The current engine is well positioned for Humanizer-inspired features because the language already has clear phases:

| Current subsystem | Current responsibility | Humanizer-inspired extension point |
|---|---|---|
| `lib/tokenize.js` | Recognizes dates, timestamps, words, numbers, operators, transform arrow. | Add month words, ordinal suffix tokens, optional `:` time-only literals, and small spoken-number words. |
| `lib/parse.js` | Builds AST for keywords, date/time literals, durations, arithmetic, comparisons, `in`, `as`, `->`, business-day ranges. | Add AST nodes for relative/humanized transforms, natural date phrases, time-only literals, and spoken numeric durations. |
| `lib/evaluate.js` | Evaluates AST with fixed context, zone, `now`, business calendar, optional resolver. | Compute relative deltas against sampled `now`, evaluate duration-to-parts, and return stable string outputs. |
| `lib/format.js` | Formats typed values and current transforms: `iso`, `date`, `time`. | Add `relative`, `duration`, `durationWords`, `clock`, `ordinal`, `ordinalDate`, maybe `unitSymbol`. |
| `app/main.js` | Shows input, output, explain steps, examples, fixture matching. | Add examples and explain text that demonstrate humanized output without hiding exact ISO values. |
| `tests/` | Bun coverage for core modules and regression fixtures. | Add fixture packs for humanized relative dates, duration parts, clock notation, ordinal suffixes, and parser ambiguity cases. |

The safest path is formatter-first. Add transforms that operate on existing typed values before adding new syntax. Parser additions should come later, after transforms prove useful.

## Recommendation Matrix

| Feature | Recommendation | Why |
|---|---|---|
| Relative date/time humanization | Adopt now | High user value, low parser risk if implemented as transform. |
| Duration humanization | Adopt now | Directly improves subtraction and elapsed-time outputs. |
| Clock notation | Adopt now, English-only | Useful for time output, contained formatter scope. |
| Ordinal numbers and ordinal dates | Adopt now | Small rules, helpful for date display and future natural date parsing. |
| Human-readable list joining | Adopt now for UI/explain text | Improves polish and diagnostics with minimal engine risk. |
| Natural month-name dates | Prototype/defer | High value but parser ambiguity needs careful design. |
| Spoken-number input | Prototype/defer | Valuable, but it changes tokenization and numeric semantics. |
| String casing/truncation transforms | Defer | Useful for UI, less central to date/time math. |
| Full localization architecture | Defer, design for later | Humanizer’s model is instructive but too broad for this project now. |
| Full inflection/pluralization engine | Reject for now | Not central enough; can be added later if localization becomes a goal. |

## Feature 1: Relative Date/Time Humanization

### Humanizer Source Reviewed

- `Humanizer/DateHumanizeExtensions.cs`
- `Humanizer/DateTimeHumanizeStrategy/DateTimeHumanizeAlgorithms.cs`
- `Humanizer/DateTimeHumanizeStrategy/DefaultDateTimeHumanizeStrategy.cs`
- `Humanizer/DateTimeHumanizeStrategy/PrecisionDateTimeHumanizeStrategy.cs`
- `Humanizer/Localisation/ResourceKeys.DateHumanize.cs`
- `Humanizer/Properties/Resources.resx`

### What Humanizer Does

Humanizer converts a date/time into a human sentence relative to a comparison base. It distinguishes past and future tense, has special handling for “now”, and chooses the largest meaningful unit. It also has two strategy styles:

- A default threshold algorithm with human-friendly cutoffs such as seconds, minutes, hours, days, months, and years.
- A precision strategy where approximation thresholds can be tuned.

The important product idea is not the exact thresholds. The important idea is that a date/time calculator should support both exact machine output and human-facing relative phrasing.

### Proposed Project Feature

Add a formatter transform named `relative`.

Candidate syntax:

```text
now + 3 hours as relative
(now - 90 minutes) as relative
2026-02-08T15:00:00-08:00 as relative
2026-02-08 as relative
```

Candidate lower-level API:

```js
formatValue(value, "relative", {
  timeZoneId: "America/Los_Angeles",
  now: fixedNow,
  relativePrecision: "default"
})
```

Expected examples with fixed context:

| Context `now` | Expression | Expected output |
|---|---|---|
| `2026-02-08T12:00:00-08:00[America/Los_Angeles]` | `now + 3 hours as relative` | `3 hours from now` |
| same | `now - 1 minute as relative` | `1 minute ago` |
| same | `now as relative` | `now` |
| same | `2026-02-09 as relative` | `1 day from now` or `tomorrow`, depending on chosen wording policy |
| same | `2026-02-01 as relative` | `7 days ago` |

Recommended v1 wording policy:

- Use simple unit phrasing: `N units ago`, `N units from now`, `now`.
- Do not use “yesterday” or “tomorrow” in v1 unless reviewers explicitly want it. `1 day ago` and `1 day from now` are less charming but more predictable.
- Use the context’s sampled `now`, not `Date.now()`.
- For `PlainDate`, compare calendar dates in `context.timeZoneId`.
- For `ZonedDateTime` and `OffsetDateTime`, compare instants.

### Why This Helps

The calculator currently returns exact values well, but exact values are not always the best final answer. A user asking “what is 3 hours after now?” benefits from seeing the exact timestamp and the human meaning. Developers also benefit because the distinction between calendar and timeline arithmetic becomes easier to explain:

```text
now + 1 day
=> 2026-03-08T12:00:00-07:00[America/Los_Angeles]
=> 1 day from now

now + 24 hours
=> 2026-03-08T13:00:00-07:00[America/Los_Angeles]
=> 24 hours from now
```

This is especially useful around DST boundaries.

### Edge Cases and Risks

Relative output is approximate by nature. Humanizer’s default algorithm uses thresholds that may surprise people around 28 to 31 days and 345 to 365 days. Our project should avoid “month” and “year” approximation until we decide a clear policy.

Recommended v1:

- Support milliseconds, seconds, minutes, hours, days, and weeks.
- Defer months and years for relative wording unless the value comes from exact calendar arithmetic and the AST preserves that information.
- Always include exact output in developer details so “3 weeks from now” does not hide a precise timestamp.

### Recommendation

Adopt now as a formatter transform. Keep it English-only and deterministic.

## Feature 2: Duration Humanization

### Humanizer Source Reviewed

- `Humanizer/TimeSpanHumanizeExtensions.cs`
- `Humanizer/Localisation/ResourceKeys.TimeSpanHumanize.cs`
- `Humanizer/Localisation/TimeUnit.cs`
- `Humanizer/Properties/Resources.resx`

### What Humanizer Does

Humanizer takes a `TimeSpan` and emits a readable list of time parts. It has several useful knobs:

- `precision`: maximum number of units to return.
- `maxUnit` and `minUnit`: upper and lower bounds.
- `countEmptyUnits`: whether zero-value units count toward precision.
- `toWords`: whether to say `one day` instead of `1 day`.
- `collectionSeparator`: how to join multiple parts.

It also makes an explicit approximation choice for months and years: one year is treated as 365.2425 days and one month as one twelfth of that. That is useful for elapsed-time prose, but it is not the same thing as calendar arithmetic.

### Proposed Project Feature

Add formatter transforms:

```text
as duration
as duration words
as compact duration
```

Candidate syntax:

```text
2026-02-09T14:03:04-08:00 - 2026-02-08T12:00:00-08:00 as duration words
93784 seconds as duration words
now - 2026-02-08T11:59:30-08:00 as duration
```

Important note: the current grammar does not allow a bare duration as the final value from `93784 seconds` to be transformed unless the parser permits duration literals as primary results, which it already does. That makes this feature mostly a formatter addition.

Expected examples:

| Expression | Expected output |
|---|---|
| `1 second as duration words` | `1 second` |
| `65 seconds as duration words` | `1 minute and 5 seconds` |
| `93784 seconds as duration words` | `1 day, 2 hours, 3 minutes and 4 seconds` |
| `93784 seconds as duration` | `1 day, 2 hours` with default precision `2`, if configured |
| `0 seconds as duration words` | `0 seconds` |
| `-90 seconds as duration words` | `1 minute and 30 seconds` plus sign policy, likely `-1 minute and 30 seconds` |

Suggested API:

```js
formatDurationHumanized(duration, {
  precision: 2,
  maxUnit: "weeks",
  minUnit: "seconds",
  separator: "english-list",
  numbers: "digits"
})
```

### Why This Helps

The current formatter has ISO-like duration strings such as `PT1.25S` and `P7D`. These are precise but not always readable. Duration humanization would make subtraction results immediately understandable:

```text
2026-02-08T12:00:00-08:00 - 2026-02-08T10:30:00-08:00
=> PT5400S
=> 1 hour and 30 minutes
```

This is a better calculator experience and a better demo of the engine’s typed values.

### Edge Cases and Risks

The biggest risk is mixing timeline durations with calendar durations. A `Duration` value with unit `months` cannot always be reduced to a fixed number of days without losing meaning. Humanizer’s approximations are acceptable for prose, but our project should label them clearly.

Recommended v1:

- For timeline durations produced by ZonedDateTime subtraction, decompose milliseconds into weeks, days, hours, minutes, seconds, milliseconds.
- For calendar units such as `months` and `years`, do not convert them into days by default. Output `2 months` or `1 year` as the original unit.
- For compound durations, only decompose units that are timeline-safe.

### Recommendation

Adopt now. This is one of the highest-value formatter improvements.

## Feature 3: Clock Notation

### Humanizer Source Reviewed

- `Humanizer/TimeOnlyToClockNotationExtensions.cs`
- `Humanizer/ClockNotationRounding.cs`
- `Humanizer/Localisation/TimeToClockNotation/DefaultTimeOnlyToClockNotationConverter.cs`
- `Humanizer/Configuration/TimeOnlyToClockNotationConvertersRegistry.cs`

### What Humanizer Does

Humanizer converts a time-of-day into conversational clock notation. In English, examples include:

- `three o'clock`
- `a quarter past three`
- `half past three`
- `a quarter to four`

It also supports optional rounding to the nearest five minutes and has separate converters for some cultures.

### Proposed Project Feature

Add transform:

```text
as clock
-> clock
```

Candidate syntax:

```text
now -> clock
2026-02-08T15:30:00-08:00 as clock
start of day 2026-02-08 as clock
```

Later parser extension:

```text
15:30 as clock
3:45pm as clock
```

Expected examples:

| Expression | Expected output |
|---|---|
| `2026-02-08T15:00:00-08:00 as clock` | `three o'clock` |
| `2026-02-08T15:15:00-08:00 as clock` | `a quarter past three` |
| `2026-02-08T15:30:00-08:00 as clock` | `half past three` |
| `2026-02-08T15:45:00-08:00 as clock` | `a quarter to four` |
| `2026-02-08T15:07:00-08:00 as clock rounded` | `five past three` |

### Why This Helps

This feature adds a human output mode that is useful for reminders, schedules, and natural-language display. It is also a clean example of a transform that uses the existing `ZonedDateTime` local parts.

It should not replace `as time`; it should complement it:

```text
now -> time
=> 15:30:00

now -> clock
=> half past three
```

### Edge Cases and Risks

Clock notation is inherently English/culture-specific. It also needs a clear policy around midnight/noon. Suggested v1:

- `00:00` -> `twelve o'clock`
- `12:00` -> `twelve o'clock`
- Keep `at noon` and `at midnight` as separate parser features later.
- Handle minutes exactly by default.
- Add a separate option or transform variant for nearest-five rounding.

### Recommendation

Adopt now as English-only formatter transform for `ZonedDateTime` and `OffsetDateTime`. Defer time-only literals until the parser extension phase.

## Feature 4: Fluent Natural Date Construction

### Humanizer Source Reviewed

- `Humanizer/FluentDate/In.cs`
- `Humanizer/FluentDate/On.Days.cs`
- `Humanizer/FluentDate/In.Months.cs`
- `Humanizer/FluentDate/In.SomeTimeFrom.cs`
- `Humanizer/FluentDate/PrepositionsExtensions.cs`

### What Humanizer Does

Humanizer offers fluent C# helpers for constructing dates in readable code, such as the first day of a year, a named month/day, or a date with a time set to midnight/noon. The C# shape does not translate directly into this expression language, but the user intent is valuable: users want to type dates in familiar prose.

### Proposed Project Feature

Do not copy Humanizer’s fluent API. Translate the idea into expression syntax.

Candidate future syntax:

```text
January 1 2026
Jan 1st 2026
the 3rd of March 2026
today at noon
today at midnight
2026-02-08 at 15:30
```

Candidate AST additions:

```js
{
  type: "NaturalDateLiteral",
  year: 2026,
  month: 1,
  day: 1,
  span
}

{
  type: "TimeOfDayModifier",
  target,
  hour: 12,
  minute: 0,
  second: 0,
  span
}
```

Expected examples:

| Expression | Expected output |
|---|---|
| `January 1 2026` | `2026-01-01` |
| `Jan 1st 2026` | `2026-01-01` |
| `the 3rd of March 2026` | `2026-03-03` |
| `today at noon` with fixed now `2026-02-08` | `2026-02-08T12:00:00-08:00[America/Los_Angeles]` |
| `today at midnight` | `2026-02-08T00:00:00-08:00[America/Los_Angeles]` |

### Why This Helps

The current calculator is precise but still programmer-oriented. Natural date construction would make it usable for non-developers who think in calendar language, not ISO literals.

### Edge Cases and Risks

This feature has significant parser risk:

- Month names are words, and words are already used for keywords, units, and place names.
- Ordinal suffixes like `1st` are currently not tokenized as a single meaningful date part.
- `March 3 in London` might mean a date with a zone hint, but `in` is already the zone/place modifier.
- Current-year defaults can make expressions non-obvious unless they use the fixed context year.

Recommended staged plan:

1. Add month names only in date-literal positions.
2. Require a year in v1 natural dates.
3. Add `today at noon` and `today at midnight` before broad `at HH:mm`.
4. Add current-year defaults only after reviewers accept the ambiguity.

### Recommendation

Prototype/defer. Include in the next specification as a separate parser feature, not bundled with formatter transforms.

## Feature 5: Number-to-Duration and Spoken-Number Input

### Humanizer Source Reviewed

- `Humanizer/NumberToTimeSpanExtensions.cs`
- `Humanizer/NumberToWordsExtension.cs`
- `Humanizer/WordsToNumberExtension.cs`
- `Humanizer/Localisation/WordsToNumber/EnglishWordsToNumberConverter.cs`
- `Humanizer/Localisation/NumberToWords/EnglishNumberToWordsConverter.cs`

### What Humanizer Does

Humanizer lets C# code express durations fluently from numbers, and it can convert numbers to words or words back to numbers in supported cultures. The useful idea for this project is not the extension-method style. The useful idea is accepting and presenting numbers in forms closer to natural language.

### Proposed Project Feature

Two possible directions:

1. Spoken-number parsing:

```text
five minutes from now
two weeks before 2026-02-08
one hundred days after today
```

2. Number-to-words formatting:

```text
5 as words
2026-02-08 + 5 days as relative words
```

Recommended v1 is only small spoken-number parsing for duration amounts:

```text
one day
two weeks
twenty four hours
```

Expected examples:

| Expression | Expected normalized meaning |
|---|---|
| `five minutes from now` | `now + 5 minutes` |
| `two weeks after 2026-02-08` | `2026-02-08 + 2 weeks` |
| `one hundred days before 2026-02-08` | `2026-02-08 - 100 days` |

### Why This Helps

Spoken-number input makes the calculator feel more natural without requiring a full natural-language engine. It also pairs well with relative-date features.

### Edge Cases and Risks

This is easy to overbuild. Full number-to-words conversion across cultures is large. Even English has edge cases:

- `a day`, `an hour`, `half an hour`, `quarter hour`
- hyphenated words: `twenty-four`
- ambiguous phrases: `one second Tuesday` should not parse accidentally
- large values and overflow

Recommended v1:

- English only.
- Numbers from zero to one hundred.
- Allow spoken numbers only immediately before a known unit.
- Do not support decimals, fractions, or culture-specific number words.

### Recommendation

Prototype/defer. Valuable, but it should follow formatter improvements and natural-date parser decisions.

## Feature 6: Ordinal Dates and Ordinal Numbers

### Humanizer Source Reviewed

- `Humanizer/OrdinalizeExtensions.cs`
- `Humanizer/DateToOrdinalWordsExtensions.cs`
- `Humanizer/Localisation/Ordinalizers/EnglishOrdinalizer.cs`
- `Humanizer/Localisation/DateToOrdinalWords/UsDateToOrdinalWordsConverter.cs`

### What Humanizer Does

Humanizer turns numbers into ordinal strings and dates into ordinal date phrases. It supports culture-specific forms, grammatical gender in some languages, and ordinal words.

### Proposed Project Feature

Add transforms:

```text
as ordinal
as ordinal date
```

Candidate syntax:

```text
1 as ordinal
2 as ordinal
13 as ordinal
2026-02-08 as ordinal date
now as ordinal date
```

Expected examples:

| Expression | Expected output |
|---|---|
| `1 as ordinal` | `1st` |
| `2 as ordinal` | `2nd` |
| `3 as ordinal` | `3rd` |
| `4 as ordinal` | `4th` |
| `11 as ordinal` | `11th` |
| `12 as ordinal` | `12th` |
| `13 as ordinal` | `13th` |
| `21 as ordinal` | `21st` |
| `2026-02-08 as ordinal date` | `February 8th, 2026` |
| `now as ordinal date` | `February 8th, 2026` under fixed fixture context |

### Why This Helps

Ordinal dates are common in human schedules, documentation, and reports. They also lay groundwork for parsing `Feb 8th 2026` later.

### Edge Cases and Risks

English ordinal suffixes are small but still need explicit tests:

- 11, 12, 13 are always `th`.
- 111, 112, 113 are also `th`.
- 121 is `121st`.
- Negative numbers should probably preserve sign: `-1st` or reject. Rejection is safer in v1.
- Non-integers should reject.

Recommended v1:

- English only.
- Integers only.
- `PlainDate`, `ZonedDateTime`, and `OffsetDateTime` supported for `ordinal date`.
- Use context zone for date extraction from `ZonedDateTime`.

### Recommendation

Adopt now. Small, useful, and testable.

## Feature 7: Human-Readable List Formatting

### Humanizer Source Reviewed

- `Humanizer/CollectionHumanizeExtensions.cs`
- `Humanizer/Localisation/CollectionFormatters/DefaultCollectionFormatter.cs`
- `Humanizer/Localisation/CollectionFormatters/OxfordStyleCollectionFormatter.cs`
- `Humanizer/Configuration/CollectionFormatterRegistry.cs`

### What Humanizer Does

Humanizer formats collections into readable lists, usually by joining with commas and a final conjunction. It also supports custom display formatters and separators.

### Proposed Project Feature

Add a small internal helper for English list joining, used by UI and formatter code:

```js
formatEnglishList(["days", "hours", "minutes"])
// "days, hours and minutes"
```

Candidate uses:

- Duration humanization: `1 day, 2 hours and 3 minutes`.
- Explain panel: `applied date, time and zone transforms`.
- Error hints: `Supported transforms: iso, date, time and relative`.
- Examples gallery metadata.

Expected examples:

| Input array | Expected output |
|---|---|
| `[]` | `` |
| `["seconds"]` | `seconds` |
| `["minutes", "seconds"]` | `minutes and seconds` |
| `["days", "hours", "minutes"]` | `days, hours and minutes` |

### Why This Helps

This is a small improvement with broad polish impact. It makes generated explanations feel intentional rather than mechanically joined.

### Edge Cases and Risks

The only real decision is Oxford comma policy. Humanizer has a specific Oxford-style formatter. For this project, choose one stable policy and test it.

Recommended v1:

- No Oxford comma: `a, b and c`.
- Add an option later if localization or style settings are requested.

### Recommendation

Adopt now as internal helper. It does not need to be part of the expression language.

## Feature 8: String Casing and Truncation

### Humanizer Source Reviewed

- `Humanizer/StringHumanizeExtensions.cs`
- `Humanizer/CasingExtensions.cs`
- `Humanizer/Transformer/*`
- `Humanizer/TruncateExtensions.cs`
- `Humanizer/Truncation/*`

### What Humanizer Does

Humanizer can convert strings between casing styles, make identifiers more readable, and truncate strings by characters or words from different directions.

### Proposed Project Feature

Keep this mostly out of the expression language for now. Use the ideas in UI and diagnostics.

Candidate internal helpers:

```js
humanizeIdentifier("businessDaysBetween")
// "business days between"

truncateForBadge("2026-02-08T12:00:00-08:00[America/Los_Angeles]", 28)
// "2026-02-08T12:00:00-08:00..."
```

Possible future transforms:

```text
"startOfDay" as title
"very long string" truncate 10
```

These transforms are not core date/time functionality and should not be included in the next implementation unless the UI needs them.

### Why This Helps

Developer details and error displays can get dense. Truncation and casing helpers prevent long timestamps, AST nodes, or resolver outputs from damaging the UI.

### Edge Cases and Risks

String transforms can bloat the language. Once a calculator accepts arbitrary string transforms, users may expect it to become a general text utility. That is not the project’s purpose.

### Recommendation

Defer as expression-language feature. Adopt small UI helpers only if needed.

## Feature 9: Localization Architecture

### Humanizer Source Reviewed

- `Humanizer/Configuration/*`
- `Humanizer/Localisation/*`
- `Humanizer/Properties/Resources.*.resx`
- `Humanizer/Localisation/Formatters/*`
- `Humanizer/Localisation/NumberToWords/*`
- `Humanizer/Localisation/Ordinalizers/*`

### What Humanizer Does

Humanizer has a mature localization architecture:

- Registries resolve converters and formatters by culture.
- Resource files hold localized strings.
- Formatters handle language-specific plural and grammatical forms.
- Separate converters exist for ordinalizers, number words, date ordinal words, clock notation, and collection formatting.

### Proposed Project Feature

Do not implement full localization now. Design new formatter functions so localization can be added later without rewriting everything.

Recommended internal shape:

```js
const EN_FORMATTER = {
  relative({ unit, count, tense }) {},
  durationPart({ unit, count }) {},
  ordinal(number) {},
  ordinalDate(plainDate) {},
  clock(localParts, options) {},
  list(parts) {},
};
```

The key point is to avoid hard-coding English grammar throughout `evaluate.js`. Keep grammar in `format.js` or a new `lib/humanize.js`.

### Why This Helps

If the project later supports localization, the first English implementation should not become technical debt. Humanizer’s main lesson here is architectural separation: computation and grammar should be separate.

### Edge Cases and Risks

Localization multiplies test scope. Date/time words are not just translated strings. Pluralization, word order, gender, and grammatical case vary. For example, Humanizer has language-specific formatters for plural forms and special cases.

Recommended v1:

- English only.
- Keep function names culture-neutral.
- Store strings in one place.
- Test exact English outputs.

### Recommendation

Defer full localization, but design English helpers as if a formatter registry may exist later.

## Feature 10: Time Unit Symbols

### Humanizer Source Reviewed

- `Humanizer/TimeUnitToSymbolExtensions.cs`
- `Humanizer/Localisation/ResourceKeys.TimeUnitSymbol.cs`
- `Humanizer/Localisation/TimeUnit.cs`

### What Humanizer Does

Humanizer can map time units to symbols, such as year, month, day, hour, minute, second, and millisecond symbols.

### Proposed Project Feature

Add optional compact duration output:

```text
as compact duration
```

Expected examples:

| Expression | Expected output |
|---|---|
| `90 seconds as compact duration` | `1m 30s` |
| `1 day + unsupported` | not applicable until compound duration arithmetic exists |
| `2026-02-08T12:01:30-08:00 - 2026-02-08T12:00:00-08:00 as compact duration` | `1m 30s` |

### Why This Helps

Compact duration output is useful for tight UI areas such as badges, tables, and quick comparison results.

### Edge Cases and Risks

Symbols are not universal. `m` can mean minutes or months depending on context. The project already uses `m` as minutes in input aliases, so output should avoid month symbols unless clearly documented.

Recommended v1:

- Compact output only for timeline units: weeks, days, hours, minutes, seconds, milliseconds.
- Do not compact months and years until exact calendar duration composition is defined.

### Recommendation

Adopt after duration humanization. It is a small extension once duration decomposition exists.

## Feature 11: Age-Style Output

### Humanizer Source Reviewed

- `Humanizer/TimeSpanHumanizeExtensions.cs`
- `TimeSpanHumanizeExtensions.ToAge`

### What Humanizer Does

Humanizer can express elapsed time as an age, for example “40 years old”.

### Proposed Project Feature

This is probably outside the next spec, but could be useful if the calculator gains date-of-birth examples.

Candidate syntax:

```text
age since 1990-04-25
1990-04-25 as age
```

Expected examples:

| Context date | Expression | Expected output |
|---|---|---|
| `2026-04-25` | `1990-04-25 as age` | `36 years old` |
| `2026-04-25` | `2026-04-25 as age` | `0 years old` or `0 days old`, policy needed |

### Why This Helps

Age calculations are a common date calculator use case. Users often ask “how old is this date?” or “how long since this event?”

### Edge Cases and Risks

Age is calendar-sensitive and should not use approximate `365.2425` years if exact birthday-style age is expected. This is a different semantic from duration humanization.

Recommended policy if adopted:

- Use exact calendar age, not timeline milliseconds.
- Require a `PlainDate` input for v1.
- Support `as age` only after defining leap-day behavior.

### Recommendation

Defer. Good future feature, but it deserves its own exact-calendar rules.

## Suggested Next Specification Shape

The next specification should split work into two waves.

### Wave 1: Formatter-First Humanization

This wave avoids parser risk and delivers value quickly.

Add:

- `relative`
- `duration words`
- `compact duration`
- `clock`
- `ordinal`
- `ordinal date`

Likely modules:

```text
lib/humanize.js
lib/format.js
lib/keywords.js
lib/evaluate.js
app/main.js
tests/humanize.test.js
tests/format.test.js
tests/evaluate.test.js
reference_data/datecalc_reference_data/humanizer_style_fixtures.sample.json
```

Implementation outline:

```js
// Sketch only, not final API.
formatValue(value, "relative", context);
formatValue(value, "durationWords", context);
formatValue(value, "compactDuration", context);
formatValue(value, "clock", context);
formatValue(value, "ordinal", context);
formatValue(value, "ordinalDate", context);
```

Acceptance tests:

- Fixed `now` relative future and past.
- DST comparison where `1 day` and `24 hours` humanize differently if needed.
- Duration decomposition from seconds and milliseconds.
- Offset and IANA date-times for clock notation.
- Ordinal suffix exceptions: 11th, 12th, 13th, 111th, 121st.
- `PlainDate` and `ZonedDateTime` ordinal dates.

### Wave 2: Natural Input Parsing

This wave changes tokenizer and parser.

Add:

- Month names and abbreviations.
- Ordinal day suffix parsing.
- `at noon`, `at midnight`, and later `at HH:mm`.
- Small English spoken-number durations.
- `after` and `before` phrase forms, if reviewers approve.

Likely AST additions:

```js
NaturalDateLiteral
TimeOfDayModifier
SpokenNumberLiteral
RelativePhraseExpression
```

Acceptance tests:

- `January 1 2026`
- `Jan 1st 2026`
- `the 3rd of March 2026`
- `today at noon`
- `two weeks after 2026-02-08`
- Parser rejects ambiguous or incomplete forms with precise spans.

## Proposed Review Checklist

Reviewers should decide each feature independently:

- Does this feature belong in a date/time calculator?
- Is it formatter-only or parser-impacting?
- Is English-only acceptable for v1?
- Are the examples useful enough for the public demo?
- Are approximate months/years acceptable, or should they be rejected?
- Does the feature preserve deterministic fixed-context behavior?
- Can failures be tested with Bun fixture regression tests?

## Final Recommendation

Adopt these now:

1. Relative date/time humanization.
2. Duration words.
3. Compact duration output.
4. Clock notation.
5. Ordinal numbers and ordinal dates.
6. English list formatting for generated text.

Prototype these next:

1. Natural month-name dates.
2. `at noon`, `at midnight`, and explicit time-of-day modifiers.
3. English spoken-number duration input.

Defer these:

1. Full localization.
2. Full number-to-words and words-to-number across cultures.
3. String transform language features.
4. Exact age output.
5. Full pluralization and inflection.

The highest-value next specification is therefore not “add Humanizer.” It is “add Humanizer-style English date/time humanization transforms, with deterministic fixed-context semantics and exact test fixtures.”

