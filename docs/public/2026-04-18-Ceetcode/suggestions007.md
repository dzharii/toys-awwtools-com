2026-04-18

The task is to add new problem and tasks into our problem set.


### Title

Signal State From Remaining Time

### Statement

You are given an integer `timer` that represents the number of seconds left on a traffic signal countdown.

Return the signal's current color using the rules below:

| Condition on `timer` | Return value |
| -------------------- | ------------ |
| `timer == 0`         | `"Green"`    |
| `timer == 30`        | `"Orange"`   |
| `30 < timer <= 90`   | `"Red"`      |
| any other value      | `"Invalid"`  |

The returned text must match the expected spelling and capitalization exactly.

### Function contract

For a C implementation, the function shape is:

```c
char* trafficSignal(int timer);
```

### Example cases

| Input | Output      | Reason                                      |
| ----- | ----------- | ------------------------------------------- |
| `60`  | `"Red"`     | `60` is inside the interval `(30, 90]`      |
| `5`   | `"Invalid"` | `5` does not satisfy any valid signal rule  |
| `0`   | `"Green"`   | exact match for the green state             |
| `30`  | `"Orange"`  | exact match for the orange state            |
| `90`  | `"Red"`     | upper bound of the red interval is included |

## B00 Formal behavior specification

The logic can be expressed as a decision table:

| Rule ID | Predicate                   | Result      |
| ------- | --------------------------- | ----------- |
| R1      | `timer == 0`                | `"Green"`   |
| R2      | `timer == 30`               | `"Orange"`  |
| R3      | `timer > 30 && timer <= 90` | `"Red"`     |
| R4      | otherwise                   | `"Invalid"` |

A correct implementation must satisfy all four rules exactly as written.

## C00 Equivalence partitioning model

The input space can be divided into behaviorally distinct classes. One representative from each class is sufficient for baseline coverage, but boundary-focused representatives are better for defect detection.

| Partition ID | Input range or value | Expected output | Why this partition exists                    |
| ------------ | -------------------- | --------------- | -------------------------------------------- |
| EP1          | `timer < 0`          | `"Invalid"`     | negative values are outside every valid rule |
| EP2          | `timer == 0`         | `"Green"`       | isolated exact-match case                    |
| EP3          | `1 <= timer <= 29`   | `"Invalid"`     | positive values below `30`, excluding `0`    |
| EP4          | `timer == 30`        | `"Orange"`      | isolated exact-match case                    |
| EP5          | `31 <= timer <= 90`  | `"Red"`         | valid closed interval after `30`             |
| EP6          | `timer > 90`         | `"Invalid"`     | values above the valid red interval          |

This partitioning is complete and mutually exclusive.

## D00 Boundary value analysis

The defect-prone points are the exact comparison edges: `0`, `30`, and `90`.

| Boundary    | Important probes | Expected results                    |
| ----------- | ---------------- | ----------------------------------- |
| around `0`  | `-1`, `0`, `1`   | `"Invalid"`, `"Green"`, `"Invalid"` |
| around `30` | `29`, `30`, `31` | `"Invalid"`, `"Orange"`, `"Red"`    |
| around `90` | `89`, `90`, `91` | `"Red"`, `"Red"`, `"Invalid"`       |

These probes verify:

* strict equality at `0`
* strict equality at `30`
* strict lower bound after `30`
* inclusive upper bound at `90`

## E00 High-coverage test suite

This suite is intentionally compact, but it covers all equivalence classes and all critical boundaries.

| Test ID | Input `timer` | Partition / boundary target   | Expected output |
| ------- | ------------: | ----------------------------- | --------------- |
| TS01    |          `-1` | EP1, lower invalid region     | `"Invalid"`     |
| TS02    |           `0` | EP2, exact boundary           | `"Green"`       |
| TS03    |           `1` | EP3, just above `0`           | `"Invalid"`     |
| TS04    |          `29` | EP3, just below `30`          | `"Invalid"`     |
| TS05    |          `30` | EP4, exact boundary           | `"Orange"`      |
| TS06    |          `31` | EP5, just above `30`          | `"Red"`         |
| TS07    |          `89` | EP5, just below upper edge    | `"Red"`         |
| TS08    |          `90` | EP5, inclusive upper boundary | `"Red"`         |
| TS09    |          `91` | EP6, just above upper edge    | `"Invalid"`     |

This is the smallest practical suite I would recommend for strong functional confidence.

## F00 Expanded validation set

If you want slightly broader confidence without making the suite large, use this extended version.

| Test ID | Input `timer` | Expected output | Purpose                        |
| ------- | ------------: | --------------- | ------------------------------ |
| TX01    |        `-100` | `"Invalid"`     | far negative invalid           |
| TX02    |          `-1` | `"Invalid"`     | nearest negative invalid       |
| TX03    |           `0` | `"Green"`       | exact green trigger            |
| TX04    |           `1` | `"Invalid"`     | just above green trigger       |
| TX05    |          `15` | `"Invalid"`     | internal representative of EP3 |
| TX06    |          `29` | `"Invalid"`     | just below orange trigger      |
| TX07    |          `30` | `"Orange"`      | exact orange trigger           |
| TX08    |          `31` | `"Red"`         | first valid red value          |
| TX09    |          `60` | `"Red"`         | internal representative of EP5 |
| TX10    |          `89` | `"Red"`         | near upper edge                |
| TX11    |          `90` | `"Red"`         | inclusive upper edge           |
| TX12    |          `91` | `"Invalid"`     | just above valid range         |
| TX13    |        `1000` | `"Invalid"`     | far above valid range          |

## G00 High-level test tasks

The following test tasks describe what the validation system should verify, independent of programming language.

### G01 Task: verify exact-match rules

Check that the implementation returns the dedicated outputs for the two singleton values.

```text
assert trafficSignal(0)  == "Green"
assert trafficSignal(30) == "Orange"
```

### G02 Task: verify the valid interval rule

Check that every tested value strictly greater than `30` and less than or equal to `90` returns `"Red"`.

```text
for each x in [31, 60, 89, 90]:
    assert trafficSignal(x) == "Red"
```

### G03 Task: verify lower invalid region

Check that values below `0` are rejected.

```text
for each x in [-100, -1]:
    assert trafficSignal(x) == "Invalid"
```

### G04 Task: verify middle invalid gap

Check that positive values between `0` and `30` are rejected.

```text
for each x in [1, 5, 29]:
    assert trafficSignal(x) == "Invalid"
```

### G05 Task: verify upper invalid region

Check that values greater than `90` are rejected.

```text
for each x in [91, 1000]:
    assert trafficSignal(x) == "Invalid"
```

### G06 Task: verify critical boundaries

Check the exact transitions at the three comparison edges.

```text
assert trafficSignal(-1) == "Invalid"
assert trafficSignal(0)  == "Green"
assert trafficSignal(1)  == "Invalid"

assert trafficSignal(29) == "Invalid"
assert trafficSignal(30) == "Orange"
assert trafficSignal(31) == "Red"

assert trafficSignal(89) == "Red"
assert trafficSignal(90) == "Red"
assert trafficSignal(91) == "Invalid"
```

## H00 Language-agnostic pseudo test harness

```text
testCases = [
  { input: -1, expected: "Invalid" },
  { input:  0, expected: "Green"   },
  { input:  1, expected: "Invalid" },
  { input: 29, expected: "Invalid" },
  { input: 30, expected: "Orange"  },
  { input: 31, expected: "Red"     },
  { input: 89, expected: "Red"     },
  { input: 90, expected: "Red"     },
  { input: 91, expected: "Invalid" }
]

for each tc in testCases:
    actual = trafficSignal(tc.input)
    assert actual == tc.expected
```

## I00 Reviewer notes

A faulty implementation is likely to fail in one of these ways:

| Failure pattern                             | Example symptom                                |
| ------------------------------------------- | ---------------------------------------------- |
| using `timer >= 30` for red                 | returns `"Red"` for `30` instead of `"Orange"` |
| using `timer < 90` instead of `timer <= 90` | returns `"Invalid"` for `90`                   |
| forgetting the special case for `0`         | returns `"Invalid"` for `0`                    |
| treating `1..29` as green                   | returns `"Green"` for `5`                      |

The suite in section E00 is designed specifically to expose those mistakes.
