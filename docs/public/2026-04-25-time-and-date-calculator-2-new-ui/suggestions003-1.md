2026-04-25

A00 Product requirement document: Humanized dates, weekdays, and holidays for the Date/Time Expression Calculator

This document specifies the next extension wave for the Date/Time Expression Calculator. The goal is to add high-value, deterministic date/time language features inspired by Humanizer-style output, relative weekday expressions, and US holiday and observance expressions.

The implementation target is the current vanilla JavaScript date/time expression engine. The project already has a useful architecture: tokenizer, parser, evaluator, formatter, business calendar, timezone utilities, browser demo wiring, deterministic fixture data, typed values, and structured error spans. Codex should preserve that architecture where it is useful, but it has broad freedom to refactor, rename, split modules, and improve internal design because this is not yet a production project and the risk of internal change is low.

The product direction is not to turn the calculator into a full natural-language parser. The product direction is to extend a controlled expression language. Inputs should feel natural, but grammar should remain explicit, deterministic, testable, and friendly to precise error spans.

B00 Implementation freedom for Codex

Codex may refactor the implementation when doing so improves clarity, testability, or future extensibility. Codex may split files, introduce new modules, revise AST node names, adjust helper APIs, and improve existing code paths.

Codex must not move language semantics into the browser UI. The UI should remain a consumer of the library. Parsing, evaluation, formatting, holiday resolution, weekday resolution, and error construction must live in the library.

Codex may change current internal representations if public behavior remains aligned with this specification. Since this is not a production project, internal compatibility is less important than a clean implementation.

Codex should prefer clear, small modules over a single large formatter or evaluator. Suggested new modules are:

```txt
lib/humanize.js
lib/weekday.js
lib/holiday-calendar.js
lib/us-holidays.js
lib/transform-names.js
```

These names are suggestions, not requirements.

C00 Goals

The first goal is to add Humanizer-style output transforms. These transforms make exact values easier to read while preserving deterministic evaluation. Examples include `as relative`, `as duration words`, `as compact duration`, `as ordinal`, `as ordinal date`, and `as clock`.

The second goal is to add controlled weekday expressions. Examples include `Monday`, `next Tuesday`, `last Friday`, and optionally `this Wednesday`. These should resolve to `PlainDate` values using deterministic rules based on the context date.

The third goal is to add holiday and observance expressions. The first provider should support US federal holidays, observed federal dates, and common US observances such as Easter, Mother's Day, Father's Day, Black Friday, Cyber Monday, Halloween, Christmas Eve, and New Year's Eve. Federal holidays should be based on official US federal holiday rules. OPM lists the federal holidays and states that federal law establishes them for federal employees; OPM also describes the usual Friday or Monday observation when a holiday falls on Saturday or Sunday for Monday-Friday federal employees. ([U.S. Office of Personnel Management][1])

The fourth goal is to make these features compose with the existing expression language. A weekday or holiday should be a first-class date expression. It should work with `+ 1 day`, `+ 1 business day`, `start of day`, `business days between`, and formatting transforms.

D00 Non-goals

This wave must not implement Chrono-style free-form parsing. Chrono-style parsing means parsing arbitrary prose such as `let's meet next Monday after lunch`, extracting dates from text, or accepting broad informal date expressions without a strict grammar. That is useful in other products, but it conflicts with this calculator's controlled expression model.

This wave must not implement full localization. Output may be English-only. The code should be organized so localization can be added later, but only English behavior is required now.

This wave must not implement a broad spoken-number parser. Expressions like `five minutes after now` are not in scope for this wave unless Codex chooses to prepare the architecture for them without exposing the feature.

This wave must not implement state-specific holidays, company holidays, school calendars, market calendars, or country-specific holiday systems beyond the US provider. The architecture should make future providers possible.

This wave must not treat common observances as business closures by default. Mother's Day, Easter, Halloween, Black Friday, and similar observances should resolve to dates, but they should not automatically make a date non-business unless the configured business calendar says so.

E00 Core value types

The extension should keep the existing typed-value model.

| Type           | Meaning                                    | Examples                                         |
| -------------- | ------------------------------------------ | ------------------------------------------------ |
| PlainDate      | Calendar date without time or zone         | `2026-02-08`                                     |
| ZonedDateTime  | Instant with IANA zone                     | `2026-02-08T12:00:00-08:00[America/Los_Angeles]` |
| OffsetDateTime | Instant with fixed offset but no IANA zone | `2026-02-08T12:00:00-08:00`                      |
| Duration       | Duration value                             | `PT90S`, `P7D`                                   |
| Number         | Numeric result                             | `10`                                             |
| Boolean        | Comparison result                          | `true`                                           |
| String         | Formatting transform result                | `3 hours from now`                               |

Weekday names and holiday names should normally evaluate to `PlainDate`.

Humanized transforms should normally evaluate to `String`.

F00 Evaluation context additions

The evaluation context should be extended to support holiday and observance behavior.

Suggested shape:

```js
{
  timeZoneId,
  now,
  businessCalendar,
  placeResolver,
  holidayCalendar,
  observanceCalendar
}
```

`holidayCalendar` answers official holiday questions. For the first implementation, this should support US federal holidays and observed dates.

`observanceCalendar` answers common observance questions. For the first implementation, this may be the same provider object as `holidayCalendar`, but conceptually observances and federal holidays are different.

The library should be able to run without a holiday provider. In that case, holiday expressions should fail with a structured evaluation error.

G00 Transform grammar

The current parser accepts one word after `as` or `->`. This wave should support multiword transform names.

Required transform phrases:

```txt
iso
date
time
relative
duration
duration words
compact duration
ordinal
ordinal date
clock
```

Canonical transform names may be stored internally as:

```txt
iso
date
time
relative
duration
durationWords
compactDuration
ordinal
ordinalDate
clock
```

The parser should normalize case and whitespace.

```txt
now as duration words
now AS Duration Words
now -> duration words
```

All three should resolve to the same canonical transform.

H00 Humanized transform: relative

`relative` formats a date/time value relative to the context's sampled `now`. It must not call `Date.now()` separately during formatting. Determinism requires that the same sampled `now` be used across the full evaluation.

For `ZonedDateTime` and `OffsetDateTime`, relative comparison is instant-based.

For `PlainDate`, relative comparison is date-based in the context time zone.

V1 should use simple deterministic wording:

```txt
now
1 second ago
2 seconds ago
1 minute ago
3 minutes ago
1 hour ago
3 hours from now
1 day from now
2 weeks from now
```

V1 should not use friendlier calendar words such as `tomorrow`, `yesterday`, or `last week`. Those can be added later, but numeric phrasing is easier to test and less surprising.

Examples:

```txt
Context now:
2026-02-08T12:00:00-08:00[America/Los_Angeles]

Input:
now as relative

Output:
String: now
```

```txt
Context now:
2026-02-08T12:00:00-08:00[America/Los_Angeles]

Input:
now + 3 hours as relative

Output:
String: 3 hours from now
```

```txt
Context now:
2026-02-08T12:00:00-08:00[America/Los_Angeles]

Input:
now - 1 minute as relative

Output:
String: 1 minute ago
```

```txt
Context now:
2026-02-08T12:00:00-08:00[America/Los_Angeles]

Input:
2026-02-09 as relative

Output:
String: 1 day from now
```

```txt
Context now:
2026-02-08T12:00:00-08:00[America/Los_Angeles]

Input:
2026-02-01 as relative

Output:
String: 7 days ago
```

DST example:

```txt
Context now:
2026-03-07T12:00:00-08:00[America/Los_Angeles]

Input:
now + 1 day as relative

Output:
String: 1 day from now

Explanation:
Calendar-day arithmetic preserves local wall-clock fields.
```

```txt
Context now:
2026-03-07T12:00:00-08:00[America/Los_Angeles]

Input:
now + 24 hours as relative

Output:
String: 24 hours from now

Explanation:
Timeline-hour arithmetic is exact elapsed time.
```

I00 Humanized transform: duration words

`duration words` converts a `Duration` into readable English.

It should work for durations produced by subtracting two `PlainDate` values, subtracting two `ZonedDateTime` values, or entering a duration literal directly.

Examples:

```txt
Input:
90 seconds as duration words

Output:
String: 1 minute and 30 seconds
```

```txt
Input:
65 seconds as duration words

Output:
String: 1 minute and 5 seconds
```

```txt
Input:
93784 seconds as duration words

Output:
String: 1 day, 2 hours, 3 minutes and 4 seconds
```

```txt
Input:
2026-02-09T14:03:04-08:00 - 2026-02-08T12:00:00-08:00 as duration words

Output:
String: 1 day, 2 hours, 3 minutes and 4 seconds
```

```txt
Input:
2026-02-23 - 2026-02-08 as duration words

Output:
String: 15 days
```

Negative durations should preserve sign in a stable way.

Recommended output:

```txt
Input:
2026-02-08T12:00:00-08:00 - 2026-02-08T12:01:30-08:00 as duration words

Output:
String: -1 minute and 30 seconds
```

V1 should decompose timeline-safe units: weeks, days, hours, minutes, seconds, milliseconds.

V1 should not approximate months and years unless the duration was already represented in months or years. For example, `1 month as duration words` should output `1 month`, not `30 days`.

J00 Humanized transform: duration

`duration` is similar to `duration words`, but it may use a default precision of two largest units.

Examples:

```txt
Input:
93784 seconds as duration

Output:
String: 1 day and 2 hours
```

```txt
Input:
90 seconds as duration

Output:
String: 1 minute and 30 seconds
```

If Codex prefers to avoid semantic overlap, `duration` may be an alias for `duration words` in v1. The important transform is `duration words`.

K00 Humanized transform: compact duration

`compact duration` returns a compact, badge-friendly duration.

Examples:

```txt
Input:
90 seconds as compact duration

Output:
String: 1m 30s
```

```txt
Input:
93784 seconds as compact duration

Output:
String: 1d 2h 3m 4s
```

```txt
Input:
2026-02-08T12:01:30-08:00 - 2026-02-08T12:00:00-08:00 as compact duration

Output:
String: 1m 30s
```

V1 compact symbols:

| Unit         | Symbol |
| ------------ | ------ |
| weeks        | `w`    |
| days         | `d`    |
| hours        | `h`    |
| minutes      | `m`    |
| seconds      | `s`    |
| milliseconds | `ms`   |

Do not use `mo` or `y` for months and years in compact output unless Codex explicitly handles calendar-duration semantics.

L00 Humanized transform: ordinal

`ordinal` converts an integer number into an English ordinal string.

Examples:

```txt
Input:
1 as ordinal

Output:
String: 1st
```

```txt
Input:
2 as ordinal

Output:
String: 2nd
```

```txt
Input:
3 as ordinal

Output:
String: 3rd
```

```txt
Input:
4 as ordinal

Output:
String: 4th
```

```txt
Input:
11 as ordinal

Output:
String: 11th
```

```txt
Input:
12 as ordinal

Output:
String: 12th
```

```txt
Input:
13 as ordinal

Output:
String: 13th
```

```txt
Input:
21 as ordinal

Output:
String: 21st
```

```txt
Input:
111 as ordinal

Output:
String: 111th
```

```txt
Input:
121 as ordinal

Output:
String: 121st
```

Non-integer values should fail with an evaluation error.

Negative values should either fail or preserve sign. Prefer failing in v1:

```txt
Input:
-1 as ordinal

Output:
EvaluationError
Code: E_EVAL_ORDINAL_REQUIRES_NON_NEGATIVE_INTEGER
```

M00 Humanized transform: ordinal date

`ordinal date` formats `PlainDate`, `ZonedDateTime`, or `OffsetDateTime` as an English date with an ordinal day.

Examples:

```txt
Input:
2026-02-08 as ordinal date

Output:
String: February 8th, 2026
```

```txt
Context now:
2026-02-08T12:00:00-08:00[America/Los_Angeles]

Input:
now as ordinal date

Output:
String: February 8th, 2026
```

```txt
Input:
2026-11-26 as ordinal date

Output:
String: November 26th, 2026
```

For `ZonedDateTime`, use the value's zone when extracting the date. If the value is offset-only, use the offset-local date.

N00 Humanized transform: clock

`clock` formats a time-of-day into conversational English.

It should apply to `ZonedDateTime` and `OffsetDateTime`.

Examples:

```txt
Input:
2026-02-08T15:00:00-08:00 as clock

Output:
String: three o'clock
```

```txt
Input:
2026-02-08T15:15:00-08:00 as clock

Output:
String: a quarter past three
```

```txt
Input:
2026-02-08T15:30:00-08:00 as clock

Output:
String: half past three
```

```txt
Input:
2026-02-08T15:45:00-08:00 as clock

Output:
String: a quarter to four
```

```txt
Input:
2026-02-08T00:00:00-08:00 as clock

Output:
String: twelve o'clock
```

```txt
Input:
2026-02-08T12:00:00-08:00 as clock

Output:
String: twelve o'clock
```

If exact arbitrary minutes are supported, use stable wording:

```txt
Input:
2026-02-08T15:07:00-08:00 as clock

Output:
String: seven past three
```

If Codex wants to keep v1 smaller, arbitrary minute handling may fall back to `three oh seven` or may produce `3:07 PM` only if documented. The preferred implementation is to support `N past H` for minutes 1 through 30 and `N to H+1` for minutes 31 through 59.

O00 English list formatting helper

Add an internal English list formatter. It should be used by duration words, explain text, and possibly error hints.

Examples:

```txt
Input parts:
[]

Output:
""
```

```txt
Input parts:
["seconds"]

Output:
"seconds"
```

```txt
Input parts:
["minutes", "seconds"]

Output:
"minutes and seconds"
```

```txt
Input parts:
["days", "hours", "minutes"]

Output:
"days, hours and minutes"
```

Use no Oxford comma in v1.

P00 Better explain text

Improve the existing Explain panel output so singular and plural units are correct.

Current rough output:

```txt
added 1 days
```

Expected output:

```txt
added 1 day
```

More examples:

```txt
Input:
now + 3 hours

Explain:
now evaluated in America/Los_Angeles
added 3 hours
```

```txt
Input:
2026-02-08 + 1 business day

Explain:
shifted by 1 business day using Mon-Fri calendar
```

```txt
Input:
business days between 2026-02-08 and 2026-02-23

Explain:
counted business days in the half-open range [start, end)
```

The Explain panel must be driven by AST structure and evaluation metadata, not by ad-hoc string guessing in the UI.

Q00 Weekday expression grammar

Weekday names should become primary expressions.

Required weekday names:

```txt
Monday
Tuesday
Wednesday
Thursday
Friday
Saturday
Sunday
```

Aliases may be supported, but are not required in v1:

```txt
Mon
Tue
Tues
Wed
Thu
Thur
Thurs
Fri
Sat
Sun
```

Grammar:

```txt
weekdayExpression :=
  weekdayName
  | "next" weekdayName
  | "last" weekdayName
  | "this" weekdayName
```

`this <weekday>` is optional, but recommended if implemented clearly.

Canonical AST suggestion:

```js
{
  type: "WeekdayExpression",
  direction: "bare" | "next" | "last" | "this",
  weekday: 1,
  span
}
```

Use the same weekday index convention already used by the business calendar: Sunday is 0, Monday is 1, Tuesday is 2, Wednesday is 3, Thursday is 4, Friday is 5, Saturday is 6.

R00 Weekday resolution rules

Bare weekday names are future-strict. They resolve to the next occurrence of that weekday after the context date. Today does not count.

`next <weekday>` is also future-strict. It is equivalent to the bare weekday in v1.

`last <weekday>` is past-strict. It resolves to the previous occurrence before the context date. Today does not count.

`this <weekday>` means the weekday in the current Monday-Sunday week. Today is allowed. It may resolve to a past date if that weekday already happened this week.

Examples:

```txt
Context date:
Tuesday, 2026-02-10

Input:
Tuesday

Output:
PlainDate: 2026-02-17

Explanation:
Bare weekday names are future-strict. Today does not count.
```

```txt
Context date:
Tuesday, 2026-02-10

Input:
Wednesday

Output:
PlainDate: 2026-02-11

Explanation:
Wednesday is ahead in the current week.
```

```txt
Context date:
Friday, 2026-02-13

Input:
Wednesday

Output:
PlainDate: 2026-02-18

Explanation:
Wednesday already passed this week, so the next Wednesday is in the following week.
```

```txt
Context date:
Monday, 2026-02-09

Input:
Monday

Output:
PlainDate: 2026-02-16

Explanation:
A bare weekday is future-strict. If today is Monday, `Monday` means next Monday.
```

```txt
Context date:
Tuesday, 2026-02-10

Input:
next Tuesday

Output:
PlainDate: 2026-02-17
```

```txt
Context date:
Tuesday, 2026-02-10

Input:
next Wednesday

Output:
PlainDate: 2026-02-11
```

```txt
Context date:
Monday, 2026-02-09

Input:
last Monday

Output:
PlainDate: 2026-02-02
```

```txt
Context date:
Wednesday, 2026-02-11

Input:
last Tuesday

Output:
PlainDate: 2026-02-10
```

```txt
Context date:
Tuesday, 2026-02-10

Input:
last Tuesday

Output:
PlainDate: 2026-02-03
```

Optional `this` examples:

```txt
Context date:
Tuesday, 2026-02-10

Input:
this Tuesday

Output:
PlainDate: 2026-02-10
```

```txt
Context date:
Friday, 2026-02-13

Input:
this Wednesday

Output:
PlainDate: 2026-02-11
```

S00 Weekday composition examples

Weekday expressions produce `PlainDate`, so they should compose with existing arithmetic and anchors.

```txt
Context date:
Tuesday, 2026-02-10

Input:
Monday + 2 days

Output:
PlainDate: 2026-02-18

Explanation:
`Monday` resolves to 2026-02-16, then 2 calendar days are added.
```

```txt
Context date:
Friday, 2026-02-13

Input:
Wednesday + 1 business day

Output:
PlainDate: 2026-02-19

Explanation:
`Wednesday` resolves to 2026-02-18, then shifts forward by one business day.
```

```txt
Context date:
Tuesday, 2026-02-10

Input:
business days between today and Friday

Output:
Number: 3

Explanation:
The half-open business-day range includes Tuesday, Wednesday, and Thursday.
```

```txt
Context date:
Tuesday, 2026-02-10
Context zone:
America/Los_Angeles

Input:
start of day Monday

Output:
ZonedDateTime: 2026-02-16T00:00:00-08:00[America/Los_Angeles]
```

T00 Holiday and observance taxonomy

The implementation should separate federal holidays, common observances, and derived date expressions.

| Category           | Meaning                                                 | Affects business calendar by default? |
| ------------------ | ------------------------------------------------------- | ------------------------------------- |
| Federal holiday    | Official US federal holiday with observed-date rules    | Yes, if holiday calendar is enabled   |
| Common observance  | Widely recognized date, not necessarily a legal day off | No                                    |
| Derived expression | Date computed relative to another date or holiday       | No by itself                          |
| Company closure    | Custom non-business day configured by user              | Yes, if configured                    |

This distinction is important. Easter, Mother's Day, Black Friday, and Halloween are common and useful, but they should not automatically close the business calendar. Thanksgiving and Christmas are federal holidays and may close the business calendar when the US federal provider is enabled.

U00 US federal holiday provider

The first holiday provider should support the official US federal holidays. OPM lists the following federal holidays: New Year's Day, Birthday of Martin Luther King, Jr., Washington's Birthday, Memorial Day, Juneteenth National Independence Day, Independence Day, Labor Day, Columbus Day, Veterans Day, Thanksgiving Day, and Christmas Day. ([U.S. Office of Personnel Management][2])

Rules:

| Holiday                              | Rule                        |
| ------------------------------------ | --------------------------- |
| New Year's Day                       | January 1                   |
| Birthday of Martin Luther King, Jr.  | Third Monday in January     |
| Washington's Birthday                | Third Monday in February    |
| Memorial Day                         | Last Monday in May          |
| Juneteenth National Independence Day | June 19                     |
| Independence Day                     | July 4                      |
| Labor Day                            | First Monday in September   |
| Columbus Day                         | Second Monday in October    |
| Veterans Day                         | November 11                 |
| Thanksgiving Day                     | Fourth Thursday in November |
| Christmas Day                        | December 25                 |

Observed-date rule for Monday-Friday schedules:

```txt
If actual holiday falls on Saturday:
observed date is the preceding Friday.

If actual holiday falls on Sunday:
observed date is the following Monday.
```

OPM's "in lieu of" guidance states this Friday/Monday rule for employees whose basic workweek is Monday through Friday. ([U.S. Office of Personnel Management][3])

V00 Common US observance provider

The first common observance provider should include these common US observances.

| Observance      | Rule                      | Business closure by default? |
| --------------- | ------------------------- | ---------------------------- |
| Valentine's Day | February 14               | No                           |
| Easter          | Western Easter Sunday     | No                           |
| Mother's Day    | Second Sunday in May      | No                           |
| Father's Day    | Third Sunday in June      | No                           |
| Halloween       | October 31                | No                           |
| Black Friday    | Friday after Thanksgiving | No                           |
| Cyber Monday    | Monday after Thanksgiving | No                           |
| Christmas Eve   | December 24               | No                           |
| New Year's Eve  | December 31               | No                           |

Mother's Day in the US is observed on the second Sunday in May. A US State Department educational page describes Mother's Day in the USA as occurring on the second Sunday in May, and a White House Mother's Day proclamation also references the second Sunday in May designation. ([American English][4])

Easter should default to Western Easter Sunday for the US observance provider. Easter date calculation is algorithmic rather than fixed-date or nth-weekday; there are also different Western and Orthodox calculations, so `Orthodox Easter` should be a separate name if implemented. ([GM Arts][5])

W00 Holiday name aliases

The provider should accept common aliases and output a canonical name.

| Canonical name                       | Aliases                         |
| ------------------------------------ | ------------------------------- |
| New Year's Day                       | new year, new years day         |
| Birthday of Martin Luther King, Jr.  | mlk day, martin luther king day |
| Washington's Birthday                | presidents day, president's day |
| Memorial Day                         | memorial day                    |
| Juneteenth National Independence Day | juneteenth                      |
| Independence Day                     | july 4, fourth of july          |
| Labor Day                            | labor day                       |
| Columbus Day                         | columbus day                    |
| Veterans Day                         | veterans day, veteran's day     |
| Thanksgiving Day                     | thanksgiving                    |
| Christmas Day                        | christmas, xmas                 |
| Valentine's Day                      | valentines day, valentine's day |
| Easter                               | easter, western easter          |
| Mother's Day                         | mothers day, mother's day       |
| Father's Day                         | fathers day, father's day       |
| Halloween                            | halloween                       |
| Black Friday                         | black friday                    |
| Cyber Monday                         | cyber monday                    |
| Christmas Eve                        | christmas eve                   |
| New Year's Eve                       | new years eve, new year's eve   |

Example:

```txt
Input:
Presidents Day 2026

Output:
PlainDate: 2026-02-16

Canonical name:
Washington's Birthday

Explanation:
`Presidents Day` is accepted as an alias for the federal holiday officially named Washington's Birthday.
```

X00 Holiday expression grammar

Holiday expressions should be primary expressions.

Grammar:

```txt
holidayExpression :=
  holidayName
  | holidayName yearNumber
  | "next" holidaySelector
  | "last" holidaySelector
  | "next" holidayName
  | "last" holidayName
  | "actual" holidayName
  | "actual" holidayName yearNumber
  | "observed" holidayName
  | "observed" holidayName yearNumber

holidaySelector :=
  "holiday"
  | "federal holiday"
  | "observed holiday"
  | "observance"
```

`next holiday` should search federal holidays by default.

`next observance` should search common observances by default.

`holidayName` should be a controlled phrase from the configured holiday provider. It should not be arbitrary free text.

Y00 Holiday resolution policy

Bare federal holiday name resolves to the next observed occurrence of that holiday. If the holiday still occurs later in the current context year, return the current-year occurrence. If it already passed, return next year's occurrence.

Bare common observance name resolves to the next occurrence of that observance. It does not imply a business closure.

Holiday name with year resolves to the occurrence in that year.

`actual <holiday>` returns the actual calendar date.

`observed <holiday>` returns the observed federal date. For common observances that have no observed federal rule, `observed` should either return the actual date or fail. Prefer failing unless the provider explicitly supports observed dates for that observance.

`next holiday` returns the next observed federal holiday strictly after the context date. Today does not count.

`last holiday` returns the previous observed federal holiday strictly before the context date. Today does not count.

`next observance` returns the next common observance strictly after the context date. Today does not count.

Z00 Federal holiday examples

```txt
Context date:
2026-02-10

Input:
Thanksgiving

Output:
PlainDate: 2026-11-26

Explanation:
Bare federal holiday names resolve to their next observed occurrence.
```

```txt
Context date:
2026-07-01

Input:
Independence Day

Output:
PlainDate: 2026-07-03

Explanation:
Bare federal holiday names use observed dates by default. July 4, 2026 is a Saturday, so the observed federal holiday is Friday, July 3.
```

```txt
Context date:
2026-07-01

Input:
actual Independence Day 2026

Output:
PlainDate: 2026-07-04

Explanation:
`actual` requests the calendar date of the holiday.
```

```txt
Context date:
2026-07-01

Input:
observed Independence Day 2026

Output:
PlainDate: 2026-07-03

Explanation:
`observed` requests the federal observed date.
```

```txt
Context date:
2026-02-10

Input:
next holiday

Output:
PlainDate: 2026-02-16

Explanation:
The next US federal observed holiday after 2026-02-10 is Washington's Birthday.
```

```txt
Context date:
2026-02-16

Input:
next holiday

Output:
PlainDate: 2026-05-25

Explanation:
Today does not count. The next observed federal holiday after Washington's Birthday is Memorial Day.
```

```txt
Context date:
2026-02-17

Input:
last holiday

Output:
PlainDate: 2026-02-16

Explanation:
The previous observed federal holiday is Washington's Birthday.
```

```txt
Input:
Memorial Day 2026

Output:
PlainDate: 2026-05-25

Explanation:
Memorial Day is the last Monday in May.
```

```txt
Input:
Labor Day 2026

Output:
PlainDate: 2026-09-07

Explanation:
Labor Day is the first Monday in September.
```

```txt
Input:
Thanksgiving 2026

Output:
PlainDate: 2026-11-26

Explanation:
Thanksgiving is the fourth Thursday in November.
```

AA00 Common observance examples

```txt
Context date:
2026-02-10

Input:
Easter

Output:
PlainDate: 2026-04-05

Explanation:
The US common observance provider resolves Easter to Western Easter Sunday.
```

```txt
Input:
Easter 2026

Output:
PlainDate: 2026-04-05
```

```txt
Input:
Orthodox Easter 2026

Output:
PlainDate: 2026-04-12

Explanation:
Only support this if the provider explicitly implements Orthodox Easter. Otherwise return an unknown holiday or unsupported observance error.
```

```txt
Context date:
2026-02-10

Input:
Mother's Day

Output:
PlainDate: 2026-05-10

Explanation:
US Mother's Day is the second Sunday in May. It does not imply a business closure.
```

```txt
Input:
Father's Day 2026

Output:
PlainDate: 2026-06-21

Explanation:
US Father's Day is the third Sunday in June.
```

```txt
Input:
Halloween 2026

Output:
PlainDate: 2026-10-31
```

```txt
Input:
Black Friday 2026

Output:
PlainDate: 2026-11-27

Explanation:
Black Friday is the Friday after Thanksgiving.
```

```txt
Input:
Cyber Monday 2026

Output:
PlainDate: 2026-11-30

Explanation:
Cyber Monday is the Monday after Thanksgiving.
```

```txt
Input:
Christmas Eve 2026

Output:
PlainDate: 2026-12-24
```

```txt
Input:
New Year's Eve 2026

Output:
PlainDate: 2026-12-31
```

AB00 Derived relative-date expressions

Add a general grammar for a weekday before or after another date expression. This includes the requested `Monday after Thanksgiving`.

Grammar:

```txt
relativeWeekdayExpression :=
  weekdayName "after" primaryDateExpression
  | weekdayName "before" primaryDateExpression
```

The target expression must evaluate to a date-like value. If it is a `ZonedDateTime`, use its local date. If it is a `PlainDate`, use it directly.

`weekday after X` is future-strict relative to X. If X is already that weekday, return the same weekday in the following week.

`weekday before X` is past-strict relative to X. If X is already that weekday, return the same weekday in the previous week.

Examples:

```txt
Input:
Monday after Thanksgiving 2026

Output:
PlainDate: 2026-11-30

Explanation:
Thanksgiving 2026 is Thursday, 2026-11-26. The following Monday is 2026-11-30.
```

```txt
Context date:
2026-02-10

Input:
Monday after Thanksgiving

Output:
PlainDate: 2026-11-30

Explanation:
Thanksgiving resolves to its next occurrence, then the following Monday is selected.
```

```txt
Input:
Friday before Memorial Day 2026

Output:
PlainDate: 2026-05-22

Explanation:
Memorial Day 2026 is Monday, 2026-05-25. The previous Friday is 2026-05-22.
```

```txt
Input:
Monday after Easter 2026

Output:
PlainDate: 2026-04-06
```

```txt
Input:
Tuesday before Thanksgiving 2026

Output:
PlainDate: 2026-11-24
```

AC00 Optional business-day relative expressions

This is useful but can be implemented after the base holiday and weekday work. Include only if Codex can do it cleanly.

Grammar:

```txt
businessDayRelativeExpression :=
  "first business day after" primaryDateExpression
  | "first business day before" primaryDateExpression
  | "last business day before" primaryDateExpression
```

Examples:

```txt
Input:
first business day after Thanksgiving 2026

Output:
PlainDate: 2026-11-27

Explanation:
Under a federal-holiday-only calendar, Black Friday is not automatically closed, so the first business day after Thanksgiving is Friday, 2026-11-27.
```

```txt
Calendar:
US federal holidays + company closure on Black Friday

Input:
first business day after Thanksgiving 2026

Output:
PlainDate: 2026-11-30

Explanation:
Black Friday is configured as a company closure, so the next business day is Monday.
```

```txt
Input:
last business day before Christmas 2026

Output:
PlainDate: 2026-12-24

Explanation:
Christmas Day 2026 is Friday, so the last business day before it is Thursday, 2026-12-24, unless Christmas Eve is configured as a closure.
```

AD00 Holiday-aware business calendar behavior

When the US federal holiday calendar is enabled for business-day arithmetic, observed federal holidays should be non-business days.

Common observances should not be non-business days unless configured as company closures.

Examples:

```txt
Calendar:
US federal observed holidays

Input:
Memorial Day 2026 + 1 business day

Output:
PlainDate: 2026-05-26

Explanation:
Memorial Day is a federal holiday and a non-business day. One business day after it is Tuesday.
```

```txt
Calendar:
US federal observed holidays

Input:
Mother's Day 2026 + 1 business day

Output:
PlainDate: 2026-05-11

Explanation:
Mother's Day is a Sunday common observance, not a federal business closure. The next business day is Monday.
```

```txt
Calendar:
US federal observed holidays

Input:
Black Friday 2026 + 1 business day

Output:
PlainDate: 2026-11-30

Explanation:
Black Friday is not a federal holiday, but it is a Friday. Adding one business day advances to Monday.
```

```txt
Calendar:
US federal holidays + company closure on Black Friday

Input:
Thanksgiving 2026 + 1 business day

Output:
PlainDate: 2026-11-30

Explanation:
Thanksgiving is closed. Black Friday is also configured as closed. The next business day is Monday.
```

AE00 Holiday and weekday formatting examples

All date-like expressions should compose with transforms.

```txt
Input:
Thanksgiving 2026 as ordinal date

Output:
String: November 26th, 2026
```

```txt
Input:
Black Friday 2026 as relative

Context now:
2026-11-20T12:00:00-08:00[America/Los_Angeles]

Output:
String: 7 days from now
```

```txt
Input:
Monday after Thanksgiving 2026 as ordinal date

Output:
String: November 30th, 2026
```

```txt
Input:
start of day Easter 2026

Output:
ZonedDateTime: 2026-04-05T00:00:00<offset>[<contextZoneId>]
```

AF00 Parser integration notes

Codex should be careful with word parsing. Holiday names and transform names are multiword phrases. The parser should use controlled phrase matching, not arbitrary text consumption.

Recommended approach:

```txt
1. Tokenize words as today.
2. Add parser-level phrase readers for known multiword constructs.
3. Match the longest valid phrase where needed.
4. Preserve spans for the full matched phrase.
5. Return precise errors when a phrase starts correctly but cannot complete.
```

For example, `next federal holiday` should be matched as one holiday selector, not as `next` plus an unknown word.

Holiday phrases should terminate before arithmetic operators, comparison operators, postfix modifiers, right parentheses, commas, and end of input.

Examples of boundaries:

```txt
Thanksgiving + 1 day
Thanksgiving as ordinal date
start of day Thanksgiving
business days between Thanksgiving and Christmas
Monday after Thanksgiving + 2 days
```

AG00 Error model additions

Add structured errors for the new features.

Suggested codes:

```txt
E_PARSE_UNKNOWN_TRANSFORM
E_PARSE_EXPECTED_TRANSFORM
E_PARSE_UNKNOWN_WEEKDAY
E_PARSE_EXPECTED_WEEKDAY
E_PARSE_UNKNOWN_HOLIDAY
E_PARSE_EXPECTED_HOLIDAY
E_PARSE_EXPECTED_RELATIVE_DATE_TARGET
E_EVAL_HOLIDAY_CALENDAR_MISSING
E_EVAL_OBSERVANCE_CALENDAR_MISSING
E_EVAL_UNKNOWN_HOLIDAY
E_EVAL_UNKNOWN_OBSERVANCE
E_EVAL_OBSERVED_DATE_UNSUPPORTED
E_EVAL_RELATIVE_WEEKDAY_REQUIRES_DATE
E_EVAL_ORDINAL_REQUIRES_INTEGER
E_EVAL_ORDINAL_REQUIRES_NON_NEGATIVE_INTEGER
E_EVAL_CLOCK_REQUIRES_TIME
```

Error examples:

```txt
Input:
Boxing Day

Output:
EvaluationError or ParseError:
Code: E_EVAL_UNKNOWN_HOLIDAY
Message: Unknown holiday or observance 'Boxing Day' for the configured US calendar.
Hint: Supported examples include Thanksgiving, Easter, Mother's Day, Black Friday, Christmas, and Juneteenth.
```

```txt
Input:
next holiday

Context:
No holiday calendar configured.

Output:
EvaluationError:
Code: E_EVAL_HOLIDAY_CALENDAR_MISSING
Message: Holiday expressions require a configured holiday calendar.
Hint: Enable the US federal holiday calendar or provide a custom holiday provider.
```

```txt
Input:
observed Mother's Day 2026

Output:
EvaluationError:
Code: E_EVAL_OBSERVED_DATE_UNSUPPORTED
Message: Mother's Day has no federal observed-date rule in the configured calendar.
Hint: Use Mother's Day 2026 for the observance date.
```

```txt
Input:
2026-02-08 as clock

Output:
EvaluationError:
Code: E_EVAL_CLOCK_REQUIRES_TIME
Message: Clock formatting requires a time-of-day value.
Hint: Use start of day 2026-02-08 or a timestamp literal before applying 'as clock'.
```

```txt
Input:
1.5 as ordinal

Output:
EvaluationError:
Code: E_EVAL_ORDINAL_REQUIRES_INTEGER
Message: Ordinal formatting requires an integer.
```

AH00 Browser demo requirements

The demo should add examples to the examples gallery.

Suggested categories:

```txt
Humanized output
Weekdays
Federal holidays
Common observances
Holiday-relative dates
```

The header should add a holiday calendar control:

```txt
Holiday Calendar:
None
US federal holidays
US federal holidays + common observances
```

A separate business-calendar mode may decide whether observed federal holidays affect `business days` arithmetic:

```txt
Business Calendar:
Mon-Fri no holidays
Mon-Fri with US federal observed holidays
Mon-Fri with US federal holidays + company closures
```

The result panel should continue to show value type, primary output, context zone, and explain text.

For holiday expressions, the Explain panel should include the canonical holiday name and rule.

Examples:

```txt
Input:
Presidents Day 2026

Explain:
resolved Presidents Day as Washington's Birthday
applied rule: third Monday in February
returned observed federal date
```

```txt
Input:
Black Friday 2026

Explain:
resolved Black Friday as common US observance
computed as Friday after Thanksgiving
did not mark as federal holiday
```

AI00 Test fixture requirements

Add fixture files or extend existing fixture files for these areas:

```txt
humanized_transforms.sample.json
weekday_expressions.sample.json
us_holidays.sample.json
holiday_relative_expressions.sample.json
business_calendar_holidays.sample.json
```

Each fixture should include:

```txt
context timeZoneId
context now
calendar provider mode
expression
expected ok/error
expected valueType
expected formatted output
expected error code if applicable
expected span if applicable
```

Required test cases:

```txt
now + 3 hours as relative
now - 1 minute as relative
90 seconds as duration words
93784 seconds as compact duration
1 as ordinal
13 as ordinal
121 as ordinal
2026-02-08 as ordinal date
2026-02-08T15:30:00-08:00 as clock
```

Required weekday cases:

```txt
Tuesday with context Tuesday
Wednesday with context Tuesday
Wednesday with context Friday
next Tuesday with context Tuesday
last Tuesday with context Tuesday
this Tuesday with context Tuesday, if supported
```

Required federal holiday cases:

```txt
Thanksgiving 2026
Memorial Day 2026
Labor Day 2026
Independence Day 2026
actual Independence Day 2026
observed Independence Day 2026
next holiday from 2026-02-10
next holiday from 2026-02-16
last holiday from 2026-02-17
```

Required common observance cases:

```txt
Easter 2026
Mother's Day 2026
Father's Day 2026
Halloween 2026
Black Friday 2026
Cyber Monday 2026
Christmas Eve 2026
New Year's Eve 2026
```

Required derived expression cases:

```txt
Monday after Thanksgiving 2026
Friday before Memorial Day 2026
Monday after Easter 2026
Tuesday before Thanksgiving 2026
```

Required business-calendar cases:

```txt
Memorial Day 2026 + 1 business day
Thanksgiving 2026 + 1 business day
Thanksgiving 2026 + 1 business day with Black Friday closure
business days between Juneteenth 2026 and Independence Day 2026
```

AJ00 Acceptance criteria

The implementation is acceptable when these statements are true.

The parser accepts multiword transform names and preserves spans.

The formatter supports `relative`, `duration words`, `compact duration`, `ordinal`, `ordinal date`, and `clock`.

Weekday names resolve to deterministic `PlainDate` values using future-strict and past-strict rules.

The holiday provider computes US federal holidays, observed federal dates, and common US observances listed in this document.

Federal holidays and common observances are separated internally.

Observed federal holidays can be used by the business calendar.

Common observances do not automatically become business closures.

`Monday after Thanksgiving` and similar weekday-relative expressions work as general derived expressions.

The browser demo exposes examples and does not implement semantics outside the library.

All new user-facing errors return structured codes, spans, messages, and actionable hints.

The existing features continue to work: `now`, `today`, ISO dates, timestamps, duration arithmetic, business-day shifting, business-day counting, `in` modifiers, and existing `as iso`, `as date`, and `as time`.

AK00 Final recommended implementation order

First, implement multiword transform parsing and Humanizer-style transforms. This produces immediate user-visible value with low parser risk.

Second, implement weekday expressions. They are small, deterministic, and useful for scheduling.

Third, implement the US holiday and observance provider. Keep federal holidays, observed holidays, and common observances distinct.

Fourth, implement derived expressions such as `Monday after Thanksgiving` and `Friday before Memorial Day`.

Fifth, integrate observed federal holidays into the business calendar mode.

This order gives Codex a safe path: formatter first, then simple date literals, then holiday resolution, then derived grammar, then business-calendar integration.

[1]: https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/?utm_source=chatgpt.com "Federal Holidays"
[2]: https://www.opm.gov/frequently-asked-questions/pay-and-leave-faq/pay-administration/what-are-federal-holidays/?utm_source=chatgpt.com "What are Federal holidays?"
[3]: https://www.opm.gov/policy-data-oversight/pay-leave/work-schedules/fact-sheets/Federal-Holidays-In-Lieu-Of-Determination?utm_source=chatgpt.com "Fact Sheet: Federal Holidays - \"In Lieu Of\" Determination"
[4]: https://americanenglish.state.gov/content-spotlight-mothers-day-usa?utm_source=chatgpt.com "Content Spotlight: Mother's Day in the U.S.A"
[5]: https://dates.gmarts.org/eastalg.htm?utm_source=chatgpt.com "Easter Date Algorithms - GM Arts Preview"
