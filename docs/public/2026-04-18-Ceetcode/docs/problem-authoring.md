# Problem Authoring Guide

This guide describes how to add a new C99 problem to Ceetcode with predictable harness behavior and reliable browser execution.

## Authoring Model

- One problem maps to one user-editable C source file.
- The user implements a single required function.
- Hidden harness code calls that function for official + custom tests.
- Inputs and outputs are typed through the shared schema in `runtime/types.ts`.

## Where to add a problem

Add a new entry to:
- `problems/catalog.ts`

Ceetcode loads this catalog through `runtime/problem-catalog.ts`.

## Required fields

Each problem entry must include:

- `id`: stable machine identifier (`kebab-case`, unique).
- `title`: user-facing name.
- `difficulty`: `Easy | Medium | Hard`.
- `summary`: one-sentence description.
- `statementMarkdown`: full problem statement.
- `examplesMarkdown`: example inputs/outputs.
- `constraintsMarkdown`: constraints and limits.
- `signature`: function contract used by the harness.
- `starterCode`: initial code shown in editor.
- `visibleTests`: official visible tests (`scope: "official"`).
- `defaultCustomTestsJson`: editable starter JSON for custom tests.

## Signature rules

`signature` is the harness contract. It must stay consistent across starter code and tests.

- `functionName`: exact symbol called by the harness.
- `declaration`: C declaration shown to users.
- `returnKind`: one of `int | bool | string`.
- `arguments`: ordered argument list, each with:
  - `name` (must match keys in each test input object),
  - `cType` (for display and starter code readability),
  - `kind` (`int | bool | string | int_array`),
  - `description`.

## Test input rules

For each test in `visibleTests`:

- `input` must provide **all** signature argument names.
- Array arguments should include explicit size fields when required by signature (for example `nums` + `numsSize`).
- `expected` must match `returnKind`:
  - `int` -> integer
  - `bool` -> boolean (or 0/1 in custom test parsing)
  - `string` -> string

Custom tests use JSON in the UI and are validated by `runtime/custom-tests.ts`.

## Starter code requirements

Starter code should:
- compile as C99,
- include the exact function signature expected by the harness,
- avoid unrelated boilerplate,
- be readable and minimal.

Do not include a `main` function in starter code; harness generation owns `main`.

## Example workflow

1. Duplicate a nearby problem object in `problems/catalog.ts`.
2. Change `id`, text fields, and signature.
3. Update `starterCode` to match the new function signature.
4. Add at least 3 visible tests with representative coverage.
5. Create a useful `defaultCustomTestsJson` template.
6. Run validations and browser tests.

## Validation checklist (required)

From project root:

```bash
npm run build
npm run test:acceptance
```

Then manually verify:

1. New problem appears in the dropdown.
2. Starter code loads correctly.
3. Run passes with expected solution and fails with intentionally wrong solution.
4. Compile errors and runtime errors are still categorized correctly.
5. Draft persistence works for the new problem id.

## Common failure modes

- Signature mismatch: harness calls a different function than starter code defines.
- Missing test input key: harness generation fails for that case.
- Wrong `returnKind`: comparison/rendering mismatch in results panel.
- Inconsistent array length fields: tests produce confusing behavior.

## Recommended naming

Use ids like:
- `valid-parentheses`
- `max-subarray-sum`
- `merge-overlapping-intervals`

Prefer stable ids; changing ids after release breaks local draft/custom-test key continuity.
