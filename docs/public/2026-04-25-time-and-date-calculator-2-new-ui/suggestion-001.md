2026-02-08
Acknowledged. I understand and will follow this documentation style and quality standard.

A00 Project overview and value

This project delivers a date/time expression language implemented as (1) a production-ready JavaScript library and (2) a minimal vanilla HTML/JS/CSS application that exercises the library as an interactive calculator.

The value is that users can write short, natural, case-insensitive expressions such as `now + 1d`, `start of day 2026-02-06`, `now in Seattle`, or `2026-02-08 + 10 business days`, and immediately see a deterministic result or a precise, localized error with a highlighted span. The library is designed to be reused across products, including browser apps, Node CLI tools, and automation systems, while maintaining consistent parsing, evaluation, and error semantics.

The design goal is “simple for end users” without relying on free-form natural language. The language provides a small set of controlled phrase forms (similar to modern CSS “function with descriptive arguments”) and a strict, machine-checkable grammar. Ambiguity is resolved by explicit rules, strict date formats, and a constrained vocabulary.

B00 Deliverables

The project must produce two deliverables that share the same core semantics.

The library is a standalone JavaScript package that exposes a facade API for common usage (parse + evaluate + format) and lower-level APIs for tokenization, AST parsing, and evaluation. The library must be usable in both browser and Node environments.

The application is a single-page, vanilla HTML/JS/CSS “date calculator” that provides an input editor, live results, and high-quality error presentation. The application must not require a build step for basic operation (it may optionally provide a bundler-based build for distribution, but the source must run directly in modern browsers via ES modules).

C00 In scope and out of scope

In scope: parsing and evaluating expressions described in this specification; deterministic time zone behavior; configurable business-day rules; rich parse and evaluation errors with spans; formatting transforms; a minimal phrase syntax for anchors such as “start of day”; a pluggable “place to time zone” resolver for expressions like “now in Seattle”; and a demo UI with live feedback.

Out of scope: full natural language understanding; ambiguous locale date formats (such as `02/08/2026`); recurring schedules (“every weekday at 9am”); complex holiday region datasets bundled by default; and any network dependency baked into evaluation (place resolution must be pluggable, not hardcoded to an external API).

D00 Core concepts and mental model

The language evaluates an expression to a typed value. The primary value types are:

1. PlainDate: a calendar date without a time or time zone, represented by `YYYY-MM-DD`.
2. ZonedDateTime: an instant with a time zone identifier, represented as an ISO string including an offset and an IANA zone id, for example `2026-02-08T12:34:56-08:00[America/Los_Angeles]`.
3. Duration: a time interval, represented as an ISO-8601 duration string (for example `P15D` or `PT3600S`) and as structured fields in the library API.
4. Number: an integer count, used primarily for business-day counting.
5. Boolean: results of comparisons.

The evaluation is performed under an Evaluation Context. The context defines the default time zone, the definition of “now”, business-day rules, and (optionally) a resolver for converting place names to time zones.

The language distinguishes calendar-based units (days, weeks, months, years) from time-based units (hours, minutes, seconds). Calendar units operate on local calendar fields in a given zone (for ZonedDateTime) or on the date (for PlainDate). Time units operate on the instant timeline for ZonedDateTime and are not allowed for PlainDate.

E00 Lexical rules and normalization

E01 Character set and whitespace

Input is Unicode text. Keywords are matched case-insensitively using Unicode case-folding, but the implementation may restrict to ASCII letters for keywords and treat non-ASCII letters as identifier characters only where explicitly allowed.

Whitespace may appear between tokens unless otherwise specified. Newlines are treated as whitespace.

E02 Comments

No comment syntax is supported in v1. The UI may optionally provide a “notes” field, but the language itself does not.

E03 Identifiers and keywords

Keywords are case-insensitive. The implementation must normalize keyword tokens to a canonical internal form (for example `BusinessDays` -> `businessdays` -> canonical `businessDays`).

Multiword keywords are supported for a small, fixed set of phrases and units. For multiword tokens, the parser must accept these equivalent surface forms:

1. Space-separated words, for example `business days`.
2. Joined words, for example `businessdays`.
3. Pascal/camel forms, for example `BusinessDays` or `businessDays`.
4. Arbitrary casing, for example `BuSiNeSs DaYs`.

The canonical unit name used internally for all such forms is `businessDays`.

E04 Numbers

Only base-10 integers are supported in v1. A number token is one or more digits. Leading `+` is not allowed as part of a number token; negative values are expressed by the `-` operator.

E05 Date and time literals

Only ISO-8601-like forms are supported.

PlainDate literal form: `YYYY-MM-DD` with zero-padded month and day.

Zoned timestamp literals are allowed in these forms:

1. `YYYY-MM-DDTHH:MM` optionally with `:SS`.
2. An optional offset `Z` or `+HH:MM` or `-HH:MM`.
3. An optional bracketed IANA zone id `[America/Los_Angeles]`.

Examples of allowed timestamp literals:

`2026-02-08T14:30`
`2026-02-08T14:30Z`
`2026-02-08T14:30-08:00`
`2026-02-08T14:30-08:00[America/Los_Angeles]`

If a timestamp literal includes an offset but no bracketed zone id, the value is treated as a ZonedDateTime with an “offset-only zone”. For consistent output, the library must convert offset-only zones to the context’s default IANA zone only if explicitly requested by a formatting transform; otherwise it must preserve the offset-only representation and omit the bracketed zone id.

Locale-dependent date forms such as `02/08/2026` are rejected with a parse error.

E06 Duration literals

Duration literal forms are:

1. Compact suffix form: `<int><unitSuffix>`, for example `1d`, `3h`, `90m`, `2w`.
2. Separated form: `<int> <unitWords>`, for example `30 days`, `10 business days`.

Supported units and their canonical mapping:

Days: `d`, `day`, `days`
Weeks: `w`, `week`, `weeks` (weeks are equivalent to 7 calendar days)
Months: `month`, `months`
Years: `year`, `years`
Hours: `h`, `hour`, `hours`
Minutes: `m`, `min`, `mins`, `minute`, `minutes`
Seconds: `s`, `sec`, `secs`, `second`, `seconds`
Business days: the canonical multiword unit `businessDays` and its surface equivalents described in E03

Unit token `m` is reserved for minutes and never means months. Months are only `month` or `months`.

F00 Grammar and parsing

F01 Expression grammar overview

The grammar supports arithmetic, function calls, controlled phrase forms, and modifiers for time zone and formatting transforms. Parentheses are supported for grouping.

Operator precedence from highest to lowest:

1. Parentheses and primary expressions (literals, keywords, function calls, phrase forms)
2. Postfix modifiers: `in <zoneOrPlace>`, `as <transform>`, `-> <transform>`
3. Multiplicative is not supported in v1
4. Additive: `+`, `-`
5. Comparisons: `<`, `<=`, `>`, `>=`, `==`, `!=` (optional in v1; if implemented, must be lowest precedence)

F02 Primary expressions

The following are primary expressions:

1. `now`: current ZonedDateTime in the context zone.
2. `today`, `yesterday`, `tomorrow`: PlainDate computed in the context zone.
3. ISO PlainDate literal.
4. ISO timestamp literal.
5. Function call: `<identifier>(<args...>)`.
6. Phrase anchor forms: `start of day [<expr>]`, `end of day [<expr>]`, and any other anchor phrases explicitly listed in this spec.

F03 Phrase anchors

The parser must recognize these phrase anchors exactly, case-insensitively, allowing arbitrary whitespace between words:

`start of day`
`end of day`

Each phrase may be followed by an optional argument expression. If omitted, the argument is implicitly `now`.

Examples:

`start of day` is parsed as `startOfDay(now)`
`start of day 2026-02-06` is parsed as `startOfDay(2026-02-06)`
`start of day now` is parsed as `startOfDay(now)`

F04 Modifiers

Time zone modifier:

`<expr> in <zoneOrPlace>`

Formatting / transform modifier:

`<expr> as <transform>`
`<expr> -> <transform>`

The tokens `as` and `->` are synonyms. Both must be supported.

The modifier binds to the expression immediately to its left unless parentheses override it. For example, `now + 1d in America/Los_Angeles` applies `in` to the entire sum only if written as `(now + 1d) in America/Los_Angeles`.

F05 Business-day counting forms

Business-day counting is provided by a dedicated range-count phrase to avoid ambiguity with shifting:

`business days between <exprA> and <exprB>`

The parser must treat `business days` as the canonical unit token and `between` and `and` as keywords. The result is a Number.

This construct is the only normative “count business days” syntax in v1. Transform-based counting shorthands may be added later but are not required for v1.

G00 Evaluation context

G01 Context fields

The evaluation context is an object with these required fields:

1. `timeZoneId`: IANA zone identifier string, for example `America/Los_Angeles`.
2. `now`: a function returning the current ZonedDateTime in `timeZoneId` (or a fixed ZonedDateTime for deterministic testing).
3. `businessCalendar`: a business-day calendar definition.
4. `placeResolver`: optional function to resolve place strings to IANA time zone ids.

G02 Determinism

Given the same input string and the same evaluation context (including a deterministic `now`), evaluation must be deterministic and produce the same typed value.

G03 Default context

The library must provide a default context constructor that sets:

1. `timeZoneId` to the runtime’s local time zone if available, otherwise `UTC`.
2. `now` to the current clock time in that zone.
3. `businessCalendar` to Monday-Friday with no holidays.
4. `placeResolver` to undefined (disabled).

H00 Type rules and operations

H01 `now`, `today`, `yesterday`, `tomorrow`

`now` evaluates to a ZonedDateTime in the context zone.

`today` evaluates to a PlainDate equal to the local date in the context zone at the moment `now` is sampled.

`yesterday` is `today - 1 day` as a PlainDate.

`tomorrow` is `today + 1 day` as a PlainDate.

H02 Addition and subtraction

Addition and subtraction are defined for these operand type combinations:

PlainDate +/- calendar duration (days, weeks, months, years, businessDays) yields PlainDate.

ZonedDateTime +/- calendar duration (days, weeks, months, years, businessDays) yields ZonedDateTime. Calendar addition preserves local wall-clock fields where possible and follows the time zone’s calendar rules for DST transitions.

ZonedDateTime +/- time duration (hours, minutes, seconds) yields ZonedDateTime and is performed on the instant timeline (exact duration). This may change the local date and local time.

PlainDate +/- time duration (hours, minutes, seconds) is a type error and must produce an evaluation error stating that time units require a time-of-day value.

Duration is not directly addable to Duration in v1. If implemented, it must only allow same-unit canonicalization and must remain deterministic.

H03 Business-day shifting semantics

When adding or subtracting a `businessDays` duration, the operation is a calendar-date shift that advances or rewinds by N business days according to the business calendar.

For PlainDate: shifting is applied to the date.

For ZonedDateTime: shifting is applied to the local date component while preserving the local time component. The time zone remains unchanged.

Counting rule for shifting:

A “business day” is any local date that satisfies `businessCalendar.isBusinessDay(plainDate)`.

When shifting forward by N business days from a starting date D:

1. Let current date be D.
2. Repeat until N business days have been counted:
   a) Increment current date by 1 calendar day.
   b) If the new current date is a business day, decrement N by 1.
3. The result date is the final current date.

When shifting backward, the same applies but decrementing by 1 calendar day.

This rule means the starting date itself is not counted, and the first candidate day considered is the next (or previous) calendar day. This is consistent for both weekday and weekend starting dates.

H04 Subtraction between two dates or instants

PlainDate - PlainDate yields a Duration in days with the sign indicating direction. The magnitude is the count of calendar days between the dates using a half-open interval [start, end). For example, `2026-02-23 - 2026-02-08` yields `P15D`.

ZonedDateTime - ZonedDateTime yields a Duration in seconds (and sub-second precision if supported) representing the exact difference between instants. The default largest unit is seconds. The duration must be representable in ISO-8601 form.

Mixed subtraction (PlainDate and ZonedDateTime) is an evaluation error unless an explicit anchor transform is applied by the user (for example `start of day 2026-02-08`).

H05 Comparisons

If comparison operators are implemented in v1, these rules apply:

PlainDate compares by calendar date.

ZonedDateTime compares by instant timeline (absolute instant), not by local fields.

Mixed comparison is an evaluation error.

I00 Anchors: `start of day` and `end of day`

I01 `startOfDay(x)`

If x is PlainDate, the result is a ZonedDateTime at local midnight `00:00:00` in the context zone.

If x is ZonedDateTime, the result is a ZonedDateTime at local midnight of x’s local date in x’s zone.

If x is omitted in phrase form, it is equivalent to `now`.

I02 `endOfDay(x)`

`endOfDay` is defined as the last representable time within the local day. For determinism and to avoid fractional precision issues, define it as `startOfDay(nextDay(x)) - 1 second` if second precision is supported, or `- 1 millisecond` if millisecond precision is the library’s maximum. The precision must be fixed by the implementation and documented; v1 must choose millisecond precision in JavaScript environments.

J00 Time zones and place resolution

J01 `in <zoneOrPlace>` evaluation

`in` applies a target zone to the value on its left.

If the left value is ZonedDateTime, `in` converts the instant to the target zone while preserving the instant.

If the left value is PlainDate, `in` does not change the value type. PlainDate has no zone. Applying `in` to a PlainDate is permitted but has no effect unless the PlainDate is later lifted to a ZonedDateTime by an anchor or formatting transform that requires a zone. In that case, the most recent `in` zone modifier in the expression’s evaluation path is used.

If `<zoneOrPlace>` is an IANA zone id, it is used directly.

If `<zoneOrPlace>` is not an IANA zone id, it is treated as a place string. Evaluation calls `placeResolver(placeString)`.

The resolver must return either an IANA zone id or an error object. If no resolver is provided, evaluation must fail with an EvaluationError stating that place names are unsupported without a resolver and recommending an IANA id.

J02 Place token parsing

A place token may contain spaces, for example `Los Angeles`. In `in` clauses, the place token extends to the end of the expression unless terminated by a right parenthesis or a transform keyword (`as`, `->`). The UI should encourage quoting for complex place names, but quoting is not required in v1 if the parser can deterministically bound the place token.

K00 Formatting and transforms

K01 Supported transforms

v1 must support these transforms:

`iso`: produces a string.
`date`: produces a string.
`time`: produces a string.

K02 Transform semantics

`as iso` on ZonedDateTime returns an ISO string including offset and, if available, the bracketed zone id. If the value lacks an IANA zone id (offset-only), it must output the offset-only form without brackets unless the user has explicitly applied `in <IANA>` to provide a zone id.

`as iso` on PlainDate returns `YYYY-MM-DD`.

`as date` on ZonedDateTime returns the local date `YYYY-MM-DD` in the value’s zone.

`as date` on PlainDate returns itself as `YYYY-MM-DD`.

`as time` on ZonedDateTime returns local time `HH:MM:SS` (seconds always included). If the implementation uses millisecond precision, it must not include fractional seconds in the default `time` transform to keep output stable.

`as time` on PlainDate is an evaluation error.

K03 Operator synonym

`->` is a synonym for `as` and must produce identical semantics and errors.

L00 Business calendar definition

L01 Default calendar

The default business calendar defines business days as Monday through Friday, excluding no holidays.

L02 Custom calendar configuration

The library must allow the developer to supply business calendar rules via one of these options:

1. A predicate function `isBusinessDay(plainDate, timeZoneId) -> boolean`.
2. A structured calendar: weekend days set plus a list of holiday PlainDates interpreted in the evaluation zone.

If both are supplied, the predicate function takes precedence.

L03 Holidays and time zones

Holidays are defined by PlainDate and evaluated in the time zone relevant to the date being considered. For PlainDate shifting, that is the context zone. For ZonedDateTime shifting, that is the ZonedDateTime’s zone.

M00 Error model

M01 Error categories

The library must produce structured errors in two categories:

ParseError: the input cannot be tokenized or parsed into an AST.

EvaluationError: the input parses, but evaluation fails due to type rules, missing resolver, invalid time zone, or unsupported operation.

M02 Error object shape

Every error returned to library callers and to the app must include:

1. `kind`: `parse` or `eval`.
2. `code`: stable machine-readable code string, for example `E_PARSE_UNEXPECTED_TOKEN`, `E_EVAL_TYPE_MISMATCH`.
3. `message`: a single-sentence human-readable message.
4. `span`: `{ startIndex, endIndex }` as character offsets in the original string, end-exclusive.
5. `lineColumn`: `{ startLine, startColumn, endLine, endColumn }` with 1-based line and column.
6. `hints`: optional array of short strings; each hint must be actionable.

M03 Span selection rules

For token errors, the span must cover the smallest token or token sequence that caused the error.

For “expected X” errors, the span must point at the unexpected token, or at the end of input if the error is missing input.

For evaluation errors, the span must cover the operator or primary expression responsible (for example the unit token `hours` when applied to a PlainDate).

M04 Validation and recovery

The parser must not attempt heuristic recovery for correctness. It may produce additional “expected tokens” metadata for UI display, but it must not silently reinterpret an invalid string.

N00 Library architecture and public API

N01 Package structure

The library must be shipped as an ES module with a Node-compatible entry. TypeScript type definitions must be provided (either authored in TS or generated), because the consumer-facing API is intended to be stable and high quality.

N02 Facade API

The facade must be a single high-level call that covers common usage:

`evaluateExpression(input: string, options?: EvaluateOptions): EvaluateResult`

EvaluateOptions includes optional overrides:

`timeZoneId?: string`
`now?: ZonedDateTime | (() => ZonedDateTime)`
`businessCalendar?: BusinessCalendar`
`placeResolver?: PlaceResolver`

EvaluateResult is a discriminated union:

On success:

`{ ok: true, value: Value, valueType: "PlainDate" | "ZonedDateTime" | "Duration" | "Number" | "Boolean", formatted?: string, ast?: AstNode, diagnostics?: Diagnostics }`

On failure:

`{ ok: false, error: ParseError | EvaluationError, ast?: AstNode, diagnostics?: Diagnostics }`

The facade must not throw for expected user input errors; it must return `ok: false`.

N03 Lower-level APIs

These lower-level entry points must exist to support advanced library users and the demo app:

1. `tokenize(input: string): TokenizeResult` returning tokens and lex errors with spans.
2. `parse(tokens: Token[]): ParseResult` returning AST or parse error.
3. `evaluateAst(ast: AstNode, context: EvaluationContext): EvalResult`
4. `formatValue(value: Value, transform: TransformName, context?: EvaluationContext): string`

The lower-level APIs may throw only for programmer errors (null inputs, invariant violation) and must document those cases.

N04 AST design constraints

The AST must preserve spans for all nodes that can be the source of an error. At minimum, every operator node, primary node, unit node, and modifier node must include a span.

The AST must represent phrase anchors explicitly as distinct node types, not as generic identifier calls, so error reporting can point at the phrase tokens and so the UI can show structured interpretation.

N05 Temporal implementation requirement

The implementation must use `Temporal` where available. If the runtime does not provide Temporal, the library must include a Temporal polyfill or dependency and use it consistently. All public value types returned by the library may be wrapped objects, but they must provide stable `.toString()` behavior consistent with the formatting rules in this spec.

O00 Demo application UI specification

O01 Layout

The app is a single-page layout with two primary panels:

Left panel: an input editor and inline interpretation feedback.

Right panel: result display or error display.

A narrow header row above the panels provides context controls: a time zone selector, a “now” preview, and a business calendar selector.

The layout must remain usable at narrow widths. At small widths, panels must stack vertically with input above output.

O02 Input editor behavior

The input is a single-line input by default, but must allow multi-line input for future extensibility. The app evaluates only the first non-empty line in v1.

Evaluation triggers on user input with debounce of 200ms. Pressing Enter triggers immediate evaluation. If the input is empty or whitespace, the output panel shows an idle state with no error.

O03 Output states

Idle state: no result, no error, shows a short instruction line.

Success state: shows the primary formatted output and the type. If the value is ZonedDateTime, it must show the full ISO with offset and zone id (when available).

Error state: shows error message, error code, and highlights the error span within the input editor. The highlight must be visible even when the caret moves.

O04 Error highlighting

On error, the editor must visually underline the span with a red squiggle style. A tooltip on hover must show the primary error message. The right panel repeats message, code, and any hints.

If the span is zero-length (for end-of-input errors), the highlight must be a caret-position marker at the end.

O05 Controls and configuration

Time zone selector allows choosing an IANA zone id. It must have a text entry mode with autocomplete and a dropdown of recent zones. Changing the zone re-evaluates the current expression.

Business calendar selector provides at least two options: “Mon-Fri (no holidays)” and “Custom…”. Custom allows entering a list of holiday dates (ISO PlainDate strings). Invalid holiday entries show a validation error and do not affect evaluation until valid.

Place resolution toggle: because place resolution may require a resolver, the UI must include a toggle that enables a built-in demo resolver for a small fixed set of cities (for example Seattle, Los Angeles, New York). When disabled, entering `now in Seattle` must produce an evaluation error with a clear message.

P00 User workflows

P01 Quick date arithmetic

The user opens the app and sees the input field focused. They type `now + 1d`. After a short pause, the output panel shows a ZonedDateTime one calendar day ahead in the selected zone. The output includes the zone id. The user changes the time zone selector to `America/New_York`. The app re-evaluates and the output updates to represent the same rule in the new zone.

P02 Anchoring to start of day

The user types `start of day`. The app shows midnight for today in the selected zone. The user types `start of day 2026-02-06`. The app shows `2026-02-06T00:00:00` with the correct offset and the selected zone id.

P03 Business-day shifting

The user types `2026-02-08 + 10 business days`. The app returns a PlainDate result `2026-02-20` under the default Mon-Fri calendar. The output panel shows the type PlainDate. The user changes the business calendar to include a holiday on `2026-02-16`. The output updates and shifts by one additional day if the holiday removes a business day from the count.

P04 Counting business days in a range

The user types `business days between 2026-02-08 and 2026-02-23`. The app shows an integer result. The UI labels it as Number and shows a short explanation line: “Counts business days in the half-open range [start, end).”

P05 Error correction with highlighting

The user types `02/08/2026 + 1d`. The app shows a parse error stating that slash dates are unsupported and highlighting `02/08/2026`. The hint suggests using `2026-02-08`. The user replaces it and the error clears.

P06 Place-based time zone

The user enables the demo place resolver. They type `now in Seattle`. The output shows a ZonedDateTime with the resolved IANA id. The user disables the resolver and the same expression produces an evaluation error that highlights `Seattle` and explains how to resolve it.

Q00 Specification by example

Q01 Basic instants and dates

Input:
`now + 1d`

Result:
Type: ZonedDateTime
Rule: add 1 calendar day, preserve local time, context zone.

Input:
`2026-02-08 + 15 days`

Result:
Type: PlainDate
Value: `2026-02-23`

Input:
`today - 1d`

Result:
Type: PlainDate
Value: the local date of “yesterday” in the context zone.

Q02 Anchors

Input:
`start of day`

Result:
Type: ZonedDateTime
Value: local midnight of today in context zone.

Input:
`startOfDay(2026-02-06)`

Result:
Type: ZonedDateTime
Value: `2026-02-06T00:00:00<offset>[<contextZoneId>]`

Q03 Business-day shifting

Assume business calendar Mon-Fri, no holidays.

Input:
`2026-02-08 + 10 business days`

Result:
Type: PlainDate
Value: `2026-02-20`

This result follows H03: starting date is not counted; counting begins on the next calendar day; only Mon-Fri are counted.

Input:
`now + 5 businessDays`

Result:
Type: ZonedDateTime
Rule: shift local date by 5 business days, preserve local time and zone.

Q04 Business-day counting

Assume business calendar Mon-Fri, no holidays.

Input:
`business days between 2026-02-08 and 2026-02-23`

Result:
Type: Number
Rule: counts business days by local date in the half-open interval [start, end). The starting date is included if it is a business day; the end date is excluded.

Input:
`business days between start of day 2026-02-08 and start of day 2026-02-23`

Result:
Type: Number
Rule: same as above; the anchors do not change the local dates used for counting.

Q05 Time zones

Assume context zone `America/Los_Angeles` and a deterministic now value `2026-02-08T12:00:00-08:00[America/Los_Angeles]`.

Input:
`now`

Result:
Type: ZonedDateTime
Value: `2026-02-08T12:00:00-08:00[America/Los_Angeles]`

Input:
`now in America/New_York`

Result:
Type: ZonedDateTime
Value: `2026-02-08T15:00:00-05:00[America/New_York]`

Q06 Formatting transforms

Input:
`now as iso`

Result:
Type: String
Value: ISO string including offset and zone id.

Input:
`now as date`

Result:
Type: String
Value: local date `YYYY-MM-DD` in the value’s zone.

Input:
`2026-02-08 as time`

Result:
EvaluationError
Span: covers `time`
Message: time formatting requires a time-of-day value.

Q07 Parse errors

Input:
`02/08/2026 + 1d`

ParseError
Span: covers `02/08/2026`
Code: `E_PARSE_INVALID_DATE_LITERAL`
Message: only ISO dates are supported.

Input:
`now + 5 bananas`

ParseError
Span: covers `bananas`
Code: `E_PARSE_UNKNOWN_UNIT`
Message: unknown unit.

R00 Non-goals and deferred features

The language does not attempt to parse free-form phrases beyond the explicitly specified anchors and constructs. It does not accept ambiguous locale date formats. It does not include a built-in network-based geocoder. It does not implement recurring schedules, ranges beyond business-day counting, or user-defined variables in v1.

S00 Conformance requirements

An implementation is conformant to this specification if, given any input and context, it produces results and errors consistent with sections E through Q, including type rules, business-day shifting and counting rules, and error span requirements.

The demo application is conformant if it displays the evaluation result type and formatted value, highlights error spans accurately, supports context configuration for time zone and business calendar, and re-evaluates deterministically on input changes.

If you want the next iteration to be immediately implementation-ready for a coding agent, the next document should add one exhaustive validation checklist (library and app) and one complete EBNF grammar with token definitions that match the span rules in M00.


## Examples
A00 Basic instants and dates

Now plus one day

```txt
now + 1d
```

Parses `now` as the current instant in the evaluation zone. Parses `1d` as a calendar-day duration. Result type is `Temporal.ZonedDateTime` in the evaluation zone. The local wall-clock time is preserved; the date advances by 1 day.

Yesterday minus twenty days

```txt
yesterday - 20d
```

Parses `yesterday` as the start of the previous local date in the evaluation zone, equivalent to `start of day (today - 1d)`. Parses `20d` as calendar days. Result type is `Temporal.ZonedDateTime` in the evaluation zone. If the evaluation zone is `America/Los_Angeles` and `now` is assumed to be `2026-02-08T12:00:00-08:00[America/Los_Angeles]`, then `yesterday` is `2026-02-07T00:00:00-08:00[America/Los_Angeles]` and the result is `2026-01-18T00:00:00-08:00[America/Los_Angeles]`.

ISO date literal plus days

```txt
2026-02-08 + 15 days
```

Parses `2026-02-08` as a `Temporal.PlainDate` in local calendar context (no time, no zone). Parses `15 days` as a calendar-day duration. Result type is `Temporal.PlainDate` with value `2026-02-23`.

B00 Duration and unit spelling

Short and long unit forms

```txt
now + 30d
now + 30 days
now + 30 DayS
```

All three parse the same because unit keywords are case-insensitive and unit aliases are normalized. Result type is `Temporal.ZonedDateTime` in the evaluation zone. The addition is calendar-day addition, not 30 * 24h.

Hours and minutes

```txt
now + 3h
now + 90m
```

Parses `h` and `m` as clock-time units (hours, minutes). Result type is `Temporal.ZonedDateTime` in the evaluation zone. This is time-based addition, not calendar-based, and can cross date boundaries.

Weeks

```txt
2026-02-08 + 2w
```

Parses the literal as `Temporal.PlainDate`. Parses `2w` as 14 calendar days. Result type is `Temporal.PlainDate` with value `2026-02-22`.

C00 Calendar units with edge rules

End-of-month behavior, clamped

```txt
2026-01-31 + 1 month
```

Parses as `Temporal.PlainDate`. Parses `1 month` as a calendar-month addition with clamping. Result type is `Temporal.PlainDate`. With clamping, the result is `2026-02-28` (the last valid day in February 2026).

Leap day plus one year, clamped

```txt
2024-02-29 + 1 year
```

Parses as `Temporal.PlainDate`. Adds one calendar year with clamping. Result type is `Temporal.PlainDate` with value `2025-02-28`.

D00 Start and end anchors

Function form, explicit argument

```txt
startOfDay(now)
```

Parses as a function call with one argument. Evaluates `now` to a `Temporal.ZonedDateTime`, then returns a `Temporal.ZonedDateTime` at local midnight for that same local date in the same zone.

Phrase form, implicit now

```txt
start of day
```

Parses as `startOfDay(now)` with an implicit `now` argument. Result type is `Temporal.ZonedDateTime` in the evaluation zone at local midnight of today.

Phrase form, explicit date literal

```txt
start of day 2026-02-06
```

Parses `2026-02-06` as `Temporal.PlainDate`, then lifts it to a zoned midnight using the evaluation zone. Result type is `Temporal.ZonedDateTime` equal to `2026-02-06T00:00:00` with the correct offset and an explicit zone id.

Phrase form, explicit now token

```txt
start of day now
```

Parses identically to `startOfDay(now)`. Result type is `Temporal.ZonedDateTime` at local midnight today in the evaluation zone.

E00 Business-day shifting (date arithmetic that skips non-business days)

Add business days, multiword keyword

```txt
2026-02-08 + 10 business days
```

Parses `business days` as a single unit token (multiword keyword). Interprets it as “advance by N business days,” skipping non-business days. If the business week is Monday-Friday with no holidays and `2026-02-08` is a `Temporal.PlainDate`, the result is a `Temporal.PlainDate` whose value is `2026-02-20` because 2026-02-08 is a Sunday and the next business day counted as day 1 is Monday 2026-02-09.

Keyword casing and spacing normalization

```txt
2026-02-08 + 10 BusinessDays
2026-02-08 + 10 businessdays
2026-02-08 + 10 BuSiNeSs DaYs
```

All three parse identically because keywords are case-insensitive and the unit tokenizer treats `business days`, `businessdays`, and `businessDays` as the same unit. All evaluate as business-day shifting and return a `Temporal.PlainDate`.

Business-day shift applied to zoned time

```txt
now + 5 business days
```

Parses `now` as `Temporal.ZonedDateTime` and shifts by 5 business days using the evaluation zone calendar and the business-day rules. Result type is `Temporal.ZonedDateTime`. The local wall-clock time is preserved; the date advances by 5 business days.

F00 Business-day counting (count work days in a calendar range)

Count business days between two instants

```txt
business days between now and (now + 30 days)
```

Parses `business days` as a multiword keyword. Parses `between A and B` as a range-count operator. Evaluates `A` and `B` to zoned instants, then counts business days in the half-open interval [A, B) by local date in the evaluation zone. Result type is `number` (integer).

Alternative transform spelling using `as`

```txt
(now + 30 days) as business day count from now
```

Parses `as` as a transform operator. Interprets the transform phrase as “compute business-day count from now to the given endpoint.” Evaluates the endpoint to a zoned instant; counts business days over local dates in [now, endpoint). Result type is `number` (integer). This example is equivalent in intent to `business days between now and (now + 30 days)` but uses a transform-style surface syntax.

Alternative transform spelling using `->`

```txt
now + 30 days -> business days between now
```

Parses `->` as a transform operator synonym for `as`. The transform text is parsed as a structured transform, not free text. Result type is `number` (integer), counting business days between `now` and the computed endpoint.

G00 Time zones, locations, and display zone control

Explicit IANA zone

```txt
now in America/Los_Angeles
```

Parses `in <zone>` as setting the evaluation/display zone for the expression. Evaluates `now` in that zone. Result type is `Temporal.ZonedDateTime` whose string form includes the bracketed zone id, for example `2026-02-08T12:00:00-08:00[America/Los_Angeles]` at the moment of evaluation.

City name resolved to a zone, with a resolver

```txt
now in Seattle
```

Parses `Seattle` as a place token, not an IANA id. Evaluation calls a configured place resolver which returns an IANA zone id. If the resolver returns `America/Los_Angeles`, the result is a `Temporal.ZonedDateTime` in `America/Los_Angeles` and the rendered form includes `[America/Los_Angeles]`.

Two different city zones

```txt
now in Los Angeles
now in New York
```

Both parse as place tokens. With a resolver that maps them to `America/Los_Angeles` and `America/New_York`, each result is a `Temporal.ZonedDateTime` in the resolved zone and includes the zone id in output.

Date literal lifted into a zone via `in`

```txt
start of day 2026-02-08 in America/Los_Angeles
```

Parses as `in` applying to the whole expression. `2026-02-08` is a `Temporal.PlainDate`, `start of day` lifts it to a zoned midnight in `America/Los_Angeles`. Result is `2026-02-08T00:00:00-08:00[America/Los_Angeles]`.

H00 Output shaping without shell-hostile pipe

Render as ISO string

```txt
now as iso
```

Parses `as iso` as a formatting transform. Result type is `string`. The string is an ISO-8601 representation including offset and zone id, for example `2026-02-08T12:00:00-08:00[America/Los_Angeles]`.

Render as date only

```txt
now as date
```

Parses as a formatting transform. Result type is `string` with `YYYY-MM-DD` in the evaluation zone’s local date, for example `2026-02-08`.

Render as time only

```txt
now as time
```

Parses as a formatting transform. Result type is `string` with local wall-clock time, for example `12:00:00`.

Alternate operator form using `->`

```txt
now -> iso
```

Parses `->` as a transform operator synonym for `as`. Produces the same result as `now as iso`.

I00 Differences and numeric results

Calendar-day difference between two dates

```txt
2026-02-23 - 2026-02-08
```

Parses both as `Temporal.PlainDate`. The `-` operator between two `PlainDate` values yields a `Temporal.Duration` in days. Result is a duration equal to `P15D`.

Business-day difference

```txt
business days between 2026-02-08 and 2026-02-23
```

Parses as a business-day range count over local dates in [start, end). With Monday-Friday and no holidays, result type is `number` (integer).

Compare instants

```txt
(now in America/Los_Angeles) < (now in America/New_York)
```

Parses both sides to instants. Comparison is performed on absolute instants, not local clock fields. Result type is `boolean`. At evaluation time, both are the same instant, so the result is `false`.

J00 Errors and ambiguity handling

Unknown unit

```txt
now + 5 bananas
```

Fails parsing because `bananas` is not a recognized unit keyword. Error includes the token span and a list of valid units.

Ambiguous slash-date rejected

```txt
02/08/2026 + 1d
```

Fails parsing because slash-form dates are not accepted. Error instructs to use ISO `YYYY-MM-DD`.

Unresolved place without resolver

```txt
now in Seattle
```

If no place resolver is configured, evaluation fails with an error stating that `Seattle` is not an IANA zone id and a resolver is required for place names.

## Reference data

see ./reference_data

A00 Reference data you should provide to an implementer

You should provide a small, deterministic “fixture pack” that locks down observable behavior (parse, spans, value types, formatting) plus optional “integration datasets” for place-to-time-zone and holidays. The fixture pack is required for correctness. The integration datasets are required only if you want place names beyond a tiny built-in demo map and holiday-aware business calendars.

B00 Required fixture pack for correctness and regression testing

Provide an expressions fixture file that includes: a fixed context time zone, a fixed `now`, business calendar settings, and a table of expressions with expected typed outputs (or expected error codes and spans). This prevents implementers from guessing semantics, especially around DST and multiword keywords.

Provide DST boundary fixtures that explicitly compare calendar-day addition vs time-duration addition in a zone with DST (for example `America/Los_Angeles`). The implementer must prove the library preserves local wall time for calendar days and preserves the instant timeline for time durations.

Provide a small time zone id list sufficient for your UI selector and tests. This is not a replacement for tzdb; it is a deterministic input for demo/fixtures.

C00 Optional datasets for production-grade behavior

If you want “now in Seattle” to work beyond a hand-picked demo list, you need place reference data and a resolver strategy. The robust path is two-stage: place string -> coordinates (geocoder or offline gazetteer), then coordinates -> IANA tzid (time zone polygon lookup).

For coordinates -> IANA tzid, the most common offline reference data is the timezone-boundary-builder release data (GeoJSON / shapefile boundaries built from OpenStreetMap). Releases are explicitly provided for download. ([GitHub][1])

For place strings -> coordinates, GeoNames provides free downloadable dumps (including city subsets such as cities1000) and is commonly used for offline gazetteers. ([download.geonames.org][2])

If you want a one-shot “download a ready-to-use timezone dataset” with metadata plus GeoJSON boundaries, Geoapify publishes an offline dataset described as using tzdb identifiers and boundaries generated with timezone-boundary-builder (verify their licensing and terms before shipping). ([Geoapify][3])

D00 Holiday and business-calendar data

If you want holiday-aware business days, you need a holidays source. Two practical options are:

1. API-fed annual JSON snapshots. Nager.Date exposes a public holidays endpoint by year and country; this is suitable for building small cached snapshots used by tests and demos. ([date.nager.at][4])

2. Downloadable offline datasets. The eartharoid/holidays project documents downloadable JSON/SQLite databases by country and size via a stable URL pattern; this is convenient for bundling an offline dataset (verify availability from your environment). ([GitHub][5])

E00 Where to download canonical sources

IANA tzdb (time zone identifiers and rules) is the canonical source of IANA zone ids and their offset/DST history. ([IANA][6])

GeoNames dumps (cities, alternate names, etc.) are available from the GeoNames download server. ([download.geonames.org][2])

Timezone polygon boundaries are distributed via timezone-boundary-builder releases. ([GitHub][1])

Nager.Date holiday data can be pulled via the Public Holiday API by year and country. ([date.nager.at][4])

F00 A small reference-data zip you can hand to the coding agent

I generated a compact, license-conscious sample bundle intended for tests and demo behavior (not as a complete production dataset). It includes:

A minimal IANA zone id subset used by fixtures, a sample place resolver map (Seattle, Los Angeles, New York, London, Berlin, Tokyo), a sample business calendar config with a small holiday list, a US 2026 public-holidays JSON snapshot (for demo/testing), end-to-end expression fixtures (success and error cases), and DST fixtures demonstrating calendar vs time addition across DST start in `America/Los_Angeles`.

[Download the reference data zip](sandbox:/mnt/data/datecalc_reference_data_bundle.zip)

G00 Notes about larger datasets and why they are not bundled here

Comprehensive GeoNames dumps and timezone polygon datasets are large and should be fetched by the implementer during setup (or by your build pipeline) rather than checked into a small demo bundle. For those, the best practice is to provide download scripts plus pinned versions or checksums, and to store only a small curated subset inside the repo for deterministic tests.

[1]: https://github.com/evansiroky/timezone-boundary-builder?utm_source=chatgpt.com "evansiroky/timezone-boundary-builder"
[2]: https://download.geonames.org/export/dump/?utm_source=chatgpt.com "GeoNames"
[3]: https://www.geoapify.com/download-timezones/?utm_source=chatgpt.com "IANA-Based Timezone Metadata and GeoJSON Boundaries"
[4]: https://date.nager.at/API?utm_source=chatgpt.com "Public Holiday API - Nager.Date"
[5]: https://github.com/eartharoid/holidays "GitHub - eartharoid/holidays: Data and APIs for public/bank holidays."
[6]: https://www.iana.org/time-zones?utm_source=chatgpt.com "Time Zone Database"


