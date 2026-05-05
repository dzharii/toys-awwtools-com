# 02-input-editor-parser-and-error-reporting.md

## Specification

We build static RetroOS-style **JSON Table Inspector**. User pastes arbitrary JSON/JSONL from jobs, APIs, logs, or batch outputs. App turns it into readable spreadsheet-like table so user can quickly find failures, missing fields, errors, and suspicious rows. This chunk is one bounded step in larger 10-spec plan.

This is chunk `02`: **input editor, parser, and error reporting**. Goal: make input pane useful and trustworthy. User can paste JSON/JSONL, app parses it, shows parse status, and shows persistent actionable errors when input is invalid. No row-source detection yet. No flattening yet. No real table yet.

This chunk value: user always knows whether pasted input is valid. Bad input gives clear error with location, snippet, and repair hint. Error stays visible until fixed or input cleared. Future chunks can rely on structured parse result.

## Scope

Implement:

```text id="i282qg"
input editor behavior
strict JSON parser
JSONL parser
input kind detection
parse status state
sticky parse error block
actionable parse error details
format/prettify action for valid JSON
clear action
basic parse diagnostics panel/status
console logger instrumentation
tests for parser and logger/storage-safe behavior
```

Do not implement row-source detection or table rendering.

## Non-goals

Do not detect row source.

Do not flatten JSON.

Do not render table rows.

Do not score failures.

Do not export CSV.

Do not add dependencies.

Do not execute pasted input.

Do not fetch URLs.

Do not parse JSON5 unless explicitly added later. No comments/trailing commas support in this chunk.

## Required UX behavior

User sees input pane with textarea and controls.

On every input change, app parses after debounce.

Suggested debounce:

```text id="fhcov3"
250ms after typing stops
Immediate parse on paste if easy, else debounce OK
Immediate parse on clicking Parse
```

Status must be visible:

```text id="d34kro"
Empty
Parsing...
Valid JSON
Valid JSONL
Invalid JSON
Invalid JSONL
```

Error must be persistent:

```text id="bxo9fb"
If parse fails, show error block.
Error block remains visible until input becomes valid or input is cleared.
Do not auto-hide after timeout.
Do not replace with vague status only.
```

Error block must be actionable:

```text id="9qnpda"
plain-language summary
technical parser message
line number
column number
nearby snippet
caret marker if possible
likely fix/hint
input kind attempted
```

Good user-facing error example, normal language:

```text id="juac3b"
We could not parse this as JSON.

Problem: Unexpected token } in JSON at position 58.
Location: line 4, column 17.

Nearby text:
  3 |   "name": "batch-123",
  4 |   "items": [1, 2,]
                      ^
  5 | }

Try this: remove the trailing comma before ].
```

JSONL error example:

```text id="y4z6ui"
Line 17 is not valid JSON.

Problem: Expected property name or } in JSON at position 1.
Location: line 17, column 2.

Nearby text:
  16 | {"id":16,"success":true}
  17 | {id:17,"success":false}
        ^
  18 | {"id":18,"success":true}

Try this: JSON object keys must use double quotes, for example "id".
```

Empty input behavior:

```text id="7lyj5v"
No error.
Status: Empty.
Result pane stays placeholder.
Parse result null.
```

Valid input behavior:

```text id="9ow5hq"
No error block.
Status: Valid JSON or Valid JSONL.
Show summary: root type, approximate size, line count.
Keep parsed root in state.
```

## Input editor controls

Controls required:

```text id="goecx5"
Parse
Format
Clear
Copy input
Load tiny sample? optional
```

Behavior:

`Parse`:

```text id="qbfoc0"
Runs parse immediately.
Updates parse result/error.
Focus remains usable.
```

`Format`:

```text id="jignqz"
Only enabled for valid strict JSON.
Pretty-prints JSON with 2 spaces.
Preserves parsed data.
If current input is valid JSONL, do not merge silently. Disable or show explanation: "Format supports JSON document only; JSONL stays line-based."
```

`Clear`:

```text id="0z07qe"
Clears input.
Clears parse result.
Clears error.
Status becomes Empty.
```

`Copy input`:

```text id="iv4h5a"
Copies current textarea value.
If clipboard fails, show non-blocking status.
```

Textarea requirements:

```text id="hnl4j6"
monospace
spellcheck false
autocomplete off
autocapitalize off
wrap configurable from chunk 01 state
shows placeholder
large enough for real JSON
```

Line/column support:

```text id="zoa8ru"
When error exists, show line/column.
Optional: scroll textarea near error line if feasible.
Optional: button "Jump to error" sets selection/caret near error offset.
```

If feasible, implement `Jump to error`. It gives user high value.

## Parser strategy

Implement core parser in pure module:

```text id="28q64w"
src/core/parse-input.js
```

No DOM. No localStorage.

Export:

```js id="qsg3lc"
export function parseInput(text, options = {}) {}
export function parseJsonDocument(text) {}
export function parseJsonLines(text) {}
export function getLineColumnFromOffset(text, offset) {}
export function buildSnippet(text, line, column, options = {}) {}
export function classifyInputText(text) {}
```

Names may adapt, but keep pure functions.

Main parse behavior:

```text id="lmt3rr"
Trim only for detecting empty.
Preserve original input text elsewhere.
Try strict JSON first when text looks like JSON document.
Try JSONL when text looks line-oriented or JSON document parse fails.
Return best structured result.
```

Input classification heuristic:

```text id="7mdhm0"
empty -> "empty"
starts with "[" or "{" -> likely "json"
multiple non-empty lines where each starts with "{" or "[" -> likely "jsonl"
otherwise -> "unknown"
```

Important: root JSON array/object may span many lines. Do not mistake pretty JSON object for JSONL.

JSONL detection safer rule:

```text id="esgn6i"
Only consider JSONL if:
- there are 2+ non-empty lines
- first non-empty line can parse as complete JSON value by itself, OR
- most non-empty lines begin with { or [
```

Parse order recommended:

```text id="p8s2ox"
1. If empty: return empty.
2. Try JSON.parse(fullText).
3. If full JSON succeeds: kind=json.
4. If full JSON fails and input has multiple non-empty lines: try JSONL.
5. If JSONL succeeds for all non-empty lines: kind=jsonl, root=array of line values.
6. If JSONL partially succeeds: return error with line info and partial diagnostics.
7. If JSONL not plausible: return original JSON error.
```

Why: pretty JSON object with internal lines should not produce confusing line-by-line errors if full document has one missing comma. But JSONL must still work.

Strict JSON examples valid:

```json id="aee4x1"
[{"id":1},{"id":2}]
```

```json id="z7e3j0"
{
  "items": [
    { "id": 1 },
    { "id": 2 }
  ]
}
```

JSONL valid:

```jsonl id="j3b2ky"
{"id":1,"success":true}
{"id":2,"success":false}
{"id":3,"success":true}
```

JSONL result contract:

```text id="ow88eh"
kind = "jsonl"
root = array of parsed line values
lineItems = [{ lineNumber, value }]
warnings maybe if blank lines skipped
```

Blank lines in JSONL:

```text id="n1c3wo"
Ignore blank lines.
Record warning count maybe.
Do not fail because blank line exists.
```

Non-object JSONL lines:

```text id="aopfsu"
Allow any JSON value per line for parser.
Later row-source detection decides usefulness.
Warnings optional: "Some JSONL lines are not objects."
```

## Parse result contract

Use stable parse result object. Future chunks depend on it.

Empty:

```js id="5nwgfq"
{
  ok: true,
  kind: "empty",
  root: null,
  meta: {
    charCount: 0,
    lineCount: 0,
    nonEmptyLineCount: 0
  },
  warnings: []
}
```

Valid JSON:

```js id="igeudh"
{
  ok: true,
  kind: "json",
  root,
  meta: {
    rootType: "array" | "object" | "string" | "number" | "boolean" | "null",
    charCount,
    lineCount,
    nonEmptyLineCount,
    byteEstimate
  },
  warnings: []
}
```

Valid JSONL:

```js id="mq7ely"
{
  ok: true,
  kind: "jsonl",
  root: [/* parsed lines */],
  lineItems: [
    { lineNumber: 1, value: {/*...*/} }
  ],
  meta: {
    rootType: "array",
    recordCount,
    charCount,
    lineCount,
    nonEmptyLineCount,
    blankLineCount
  },
  warnings: []
}
```

Invalid:

```js id="8pn9cn"
{
  ok: false,
  kind: "json" | "jsonl" | "unknown",
  root: null,
  error: {
    code: "E_PARSE_JSON" | "E_PARSE_JSONL",
    title: "Invalid JSON" | "Invalid JSONL",
    message: "Unexpected token ...",
    userMessage: "We could not parse this as JSON.",
    line: 4,
    column: 17,
    offset: 58,
    snippet: {
      before: ["  3 | ..."],
      line: "  4 | ...",
      pointer: "                      ^",
      after: ["  5 | ..."]
    },
    hint: "Remove the trailing comma before ].",
    attempted: ["json", "jsonl"]
  },
  partial: {
    parsedLineCount: 16,
    failedLineNumber: 17
  },
  warnings: []
}
```

`offset` may be `null` if browser error message does not expose position. But line/column should be best effort.

## Error location extraction

Browser `JSON.parse` messages vary. Need robust best effort.

Implement:

```text id="xrhkle"
extract offset from "position N" if present
extract line/column if engine provides it
else for JSONL, line known and line-local JSON.parse position may exist
else line/column null, show message and snippet around start/end as possible
```

For JSON document parse errors, if offset known:

```text id="ukg81x"
get line/column from offset
build snippet around that line
```

If offset unknown:

```text id="3pex25"
line/column = null
snippet maybe first 5 lines
userMessage still clear
hint generic
```

JSONL parse errors:

```text id="bocjcr"
line = actual source line number
column = line-local column if offset known, else null
offset = absolute offset if computable
snippet uses original full text around failed source line
```

## Error hints

Implement simple hint mapper. Do not overpromise.

Map common messages/snippets:

```text id="jdi1wl"
trailing comma before ] or } -> "Remove the trailing comma."
Unexpected token ' or single quotes -> "JSON strings and keys must use double quotes."
Unexpected token } or ] after comma -> "Check for missing value or trailing comma."
Unexpected end of JSON input -> "Input ended early. Check missing closing } or ]."
Unexpected token u at position ... -> "JSON has undefined. Use null or a quoted string."
Unexpected token N -> "JSON has NaN. Use null or a number."
Property names / expected property -> "Object keys must be double-quoted."
Control character / bad string -> "Check unescaped newline or quote inside string."
Unknown -> "Check commas, quotes, brackets, and braces near the location."
```

Hints must be plain language.

Do not claim exact fix if uncertain. Use “Try this”.

## Error UI

Use RetroOS alert/panel components.

Error block location:

```text id="b77g7h"
Visible near input pane and/or top of right result area.
Prefer inside input pane below toolbar, above textarea or below textarea.
Also show compact status in status strip.
```

Persistent error block content:

```text id="fv129z"
Icon/badge: Invalid JSON / Invalid JSONL
User message
Technical details collapsible maybe
Line/column
Snippet with caret
Hint
Actions:
- Jump to error
- Copy error details
```

Example rendered content:

```text id="ylfhca"
Invalid JSON

We could not parse this as JSON.
Line 4, column 17.

Problem:
Unexpected token ] in JSON at position 58.

Nearby text:
  3 |   "name": "batch-123",
  4 |   "items": [1, 2,]
                      ^
  5 | }

Try this:
Remove the trailing comma before ].

[Jump to error] [Copy error details]
```

The above example uses normal language intentionally. User-facing error copy should be clear, not caveman.

Error block clearing rules:

```text id="1yowxv"
Clear when input empty.
Clear when parse succeeds.
Do not clear when user clicks elsewhere.
Do not clear after timeout.
Do not hide behind collapsed panel unless status clearly says error and reopen path exists.
```

If input pane collapsed and error appears:

```text id="z4yd99"
Either auto-expand input pane, or show error summary in right panel/status with "Show input" button.
Preferred: keep collapsed state but show global error banner with "Show input".
```

## Status and diagnostics

Update status strip:

Valid JSON:

```text id="tyj3jh"
Valid JSON · object root · 1,234 chars · 42 lines
```

Valid JSONL:

```text id="97y55f"
Valid JSONL · 200 records · 200 non-empty lines · 3 blank lines skipped
```

Invalid:

```text id="tmywam"
Invalid JSON · line 4, column 17 · fix input to continue
```

Empty:

```text id="4rf0ep"
Ready · Input empty · Rows 0 · Columns 0 · Failures 0
```

Right result pane placeholder after valid parse but before row detection:

```text id="jvmi6m"
Input parsed successfully. Row-source detection arrives in next chunk.
```

If invalid:

```text id="1sefn4"
Fix parse error before table can be generated.
```

## Console logger

Implement internal logger module:

```text id="lymkp7"
src/app/logger.js
```

Purpose: readable debugging for agents and humans. Instrument actions and parser flow.

Logger requirements:

```text id="jjjter"
prefix messages with component in square brackets
log attempt and outcome for major actions
include safe details/parameters
avoid dumping full pasted JSON by default
color-code labels with readable safe colors
works in light/dark console themes
can be disabled or set level
does not crash if console styling unsupported
```

Prefix format:

```text id="oldy7p"
[JTI:Input]
[JTI:Parser]
[JTI:State]
[JTI:UI]
[JTI:Storage]
[JTI:Clipboard]
```

Log levels:

```text id="1r0pyd"
debug
info
warn
error
```

Default level:

```text id="so9rxe"
info in dev/source mode
warn maybe in production later
```

Since build/minify chunk later, for now default `info` acceptable.

Logger API suggestion:

```js id="jkj3a6"
export const logger = createLogger({
  namespace: "JTI",
  level: "info"
});

logger.info("Parser", "Attempt parse input", {
  charCount,
  lineCount,
  firstNonWhitespace: "{"
});

logger.info("Parser", "Parse succeeded", {
  kind: "json",
  rootType: "object",
  lineCount
});

logger.warn("Parser", "Parse failed", {
  kind: "json",
  code: "E_PARSE_JSON",
  line,
  column,
  message
});
```

Required instrumentation points:

```text id="j6spz1"
app init start/outcome
state load start/outcome
input changed, with charCount/lineCount only
parse attempt
JSON parse success/failure
JSONL parse attempt/success/failure
format attempt/success/failure
clear action
copy input attempt/outcome
error block render/update
localStorage persistence attempt/outcome
```

Do not log:

```text id="re3j79"
full input text
full parsed root
full user data
large snippets by default
```

Safe details:

```text id="ab9vkj"
charCount
lineCount
nonEmptyLineCount
rootType
recordCount
error code
line/column
timing duration
boolean flags
```

Timing:

Use `performance.now()` where available.

Example console messages:

```text id="hj6h2f"
[JTI:Parser] Attempt parse input { charCount: 18342, lineCount: 201 }
[JTI:Parser] JSON parse failed { line: 17, column: 2, code: "E_PARSE_JSON" }
[JTI:Parser] JSONL parse succeeded { recordCount: 200, blankLineCount: 0, durationMs: 4.8 }
[JTI:UI] Render parse error block { code: "E_PARSE_JSONL", line: 17, column: 2 }
```

Color palette:

Use conservative console CSS:

```text id="i98oy5"
debug label: color #6b7280
info label: color #2563eb
warn label: color #92400e
error label: color #991b1b
namespace badge: background #111827; color #f9fafb
```

But console themes vary. Keep actual message text unstyled or default color. Style only prefix if using `%c`. If uncertain, skip colors; prefix more important.

Logger must not make tests noisy unless test can silence it.

Add:

```js id="8007xm"
logger.setLevel("silent")
```

or injectable logger for tests.

## State updates

Extend state from chunk 01.

Add/confirm fields:

```js id="t9rker"
{
  inputText: "",
  parseResult: null,
  parseStatus: "empty" | "parsing" | "valid" | "invalid",
  parseError: null,
  lastParseStartedAt: null,
  lastParseFinishedAt: null,
  inputMeta: {
    charCount: 0,
    lineCount: 0,
    nonEmptyLineCount: 0
  }
}
```

On input change:

```text id="h2jdg8"
update inputText
update inputMeta immediately
set parseStatus maybe parsing after debounce starts
run parse
set parseResult/parseError
persist inputText if current app already persists input
```

Avoid race condition:

```text id="a2ub0u"
If user types while parse debounce pending, old parse must not overwrite newer input result.
Use parseRequestId or compare text snapshot.
```

For current small parser, sync parse likely enough. Still good to guard.

## Input formatting behavior

`Format` valid JSON:

```text id="nhojws"
JSON.stringify(root, null, 2)
textarea updates
state.inputText updates
parse re-runs or parseResult reused then meta updated
log format success
```

JSONL:

```text id="0r0f5v"
Do not pretty-print each line by default in this chunk.
Disable format or show status "Format is available for JSON documents, not JSONL."
```

Invalid:

```text id="43qhxe"
Format disabled.
If clicked somehow, keep error visible and show "Fix parse error before formatting."
```

Empty:

```text id="5c6rd3"
Format disabled.
```

## Clipboard behavior

Copy input:

```text id="mxffuj"
Use navigator.clipboard.writeText if available and secure context.
Fallback: select textarea and document.execCommand("copy") if existing style permits.
Show status outcome.
Log attempt/outcome.
```

Copy error details:

```text id="jkn2c3"
Copy user-facing error text, not full input.
Include line/column/snippet/hint.
```

If clipboard fails:

```text id="m12262"
Show visible non-blocking message in status area.
Do not crash.
```

## Parser tests

Add tests for `src/core/parse-input.js`.

Required cases:

```text id="o6x3gv"
empty string -> ok kind empty
whitespace -> ok kind empty
valid root array JSON
valid root object JSON
valid primitive JSON string/number/null
valid pretty JSON object
valid JSONL objects
valid JSONL with blank lines
invalid JSON trailing comma
invalid JSON missing closing brace
invalid JSON single quotes
invalid JSON undefined
invalid JSONL one bad line
pretty JSON with parse error should report JSON document error, not misleading JSONL line mode
line/column from offset works
snippet includes pointer
hint mapper returns useful hint
```

Example tests:

```js id="6tnbar"
import { expect, test } from "bun:test";
import { parseInput } from "../src/core/parse-input.js";

test("reports trailing comma location", () => {
  const result = parseInput('{"items":[1,2,]}');
  expect(result.ok).toBe(false);
  expect(result.error.code).toBe("E_PARSE_JSON");
  expect(result.error.hint).toContain("trailing comma");
});
```

Do not rely on exact browser/V8 error text in brittle way. Assert `code`, `ok`, line/column when stable, hint broad.

## Logger tests

Add tests if logger pure enough.

Required:

```text id="5vhjco"
logger respects silent level
logger prefixes component
logger does not throw when console missing/mocked
logger redacts/omits large input fields if helper exists
```

If testing console styling too much becomes brittle, keep tests minimal.

## UI/manual tests

Manual checklist:

```text id="1qzl26"
App loads.
Textarea accepts paste/type.
Empty input shows Empty status and no error.
Valid JSON shows Valid JSON status.
Valid JSONL shows Valid JSONL status and record count.
Invalid JSON shows persistent error block.
Error block includes plain-language message, parser detail, line/column, snippet, hint.
Error remains visible after clicking elsewhere.
Error clears only after input fixed or cleared.
Format pretty-prints valid JSON.
Format disabled or helpful for JSONL/invalid.
Clear clears input and error.
Copy input works or shows failure status.
Copy error details works or shows failure status.
Collapsed input with error still leaves visible error/status path.
Console logs attempt/outcome for parse, format, clear, copy.
Console logs do not dump full JSON input.
```

## UI integration details

Use RetroOS components for:

```text id="qq1nf9"
error alert
input panel
toolbar buttons
status line
diagnostic panel if any
```

Use app CSS only for:

```text id="84efpv"
error snippet monospace block
caret marker
textarea sizing
status badge spacing
```

Error snippet styling:

```text id="cboap0"
monospace
preserve whitespace
horizontal scroll if long
no HTML injection
pointer line visible
```

Render snippet with `textContent`, not `innerHTML`.

## Edge cases

Large input:

```text id="49dkom"
Do not log full input.
Do not show enormous snippet.
Limit snippet to 2 lines before/after.
Char count can be large.
Parser may be synchronous for now.
Show parsing status if parse takes noticeable time.
```

Very long one-line compressed JSON:

```text id="94h5dj"
Line 1, large column.
Snippet should show window around column, not entire line.
Pointer should align within clipped snippet.
Indicate snippet clipped with … if implemented.
```

Example:

```text id="43i9e4"
Line 1, column 18422.

Nearby text:
  1 | …"success": true, "items": [1,2,], "done": false…
                                   ^
```

Unicode:

```text id="qf9m3j"
Line/column best effort based on JS string indices.
No need perfect grapheme counting.
Do not corrupt input.
```

Windows line endings:

```text id="7rqgrm"
Support \r\n and \n.
Line/column should work.
```

JSONL trailing newline:

```text id="pf2al4"
Valid.
Blank trailing line skipped.
```

Duplicate errors:

```text id="suvp7l"
Show first parse-blocking error only.
Do not spam many alerts.
```

## Done criteria

Chunk `02` done when:

```text id="h3eqm5"
Input parses strict JSON.
Input parses JSONL.
Invalid input shows persistent actionable error block.
Error includes message, line/column if known, snippet, caret, hint.
Error clears only when fixed or input cleared.
Format works for valid JSON.
Format disabled/helpful for JSONL/invalid/empty.
Clear works.
Copy input works or fails visibly.
Copy error details works or fails visibly.
Parse result stored in central state.
Status strip reflects parse status and metadata.
Console logger exists and instruments major actions.
Logger uses component prefixes.
Logger avoids dumping full user input.
Parser tests cover valid/invalid JSON/JSONL and snippets.
Logger tests or safe mock coverage added where feasible.
Agent ran tests/build or documented blocker.
Agent self-reviewed and fixed critical/medium issues.
No row-source/table/failure/export logic implemented yet.
```

---

# Appendix A — Project reminder for agent

We build static RetroOS-style **JSON Table Inspector**. User pastes arbitrary JSON/JSONL from jobs, APIs, logs, or batch outputs. App turns it into readable spreadsheet-like table so user can quickly find failures, missing fields, errors, and suspicious rows.

This chunk is one bounded step. Implement input parser and error reporting only. Do not implement future chunks.

10-spec roadmap:

```text id="hm785m"
00-agent-project-brief-and-architecture.md
01-app-shell-layout-and-state-foundation.md
02-input-editor-parser-and-error-reporting.md
03-row-source-detection-and-selection.md
04-flattening-column-profiling-and-ordering.md
05-failure-detection-and-diagnostics.md
06-table-renderer-and-core-interactions.md
07-column-controls-row-details-and-export.md
08-examples-visual-polish-and-large-input-performance.md
09-build-tests-readme-and-final-hardening.md
```

# Appendix B — Mandatory agent workflow

For this chunk:

```text id="f45fmu"
Read 00 spec.
Read 01 implementation.
Inspect repo.
Inspect RetroOS framework exports.
Plan file changes.
Implement only chunk 02.
Add/update tests.
Run tests.
Run build/dev smoke if available.
Self-review diff.
Fix critical/medium issues.
Report exact commands and result.
```

No fake pass. No broad rewrite.

# Appendix C — RetroOS framework rule

Use RetroOS components for app shell, controls, panels, alerts, and status. Custom CSS only for parser-specific snippet/error layout and textarea behavior.

Allowed:

```text id="8gp91m"
RetroOS alert for parse error.
RetroOS toolbar buttons for Parse/Format/Clear/Copy.
RetroOS panel for input and diagnostics.
Custom pre/code block for snippet with textContent.
```

Not allowed:

```text id="zwk3ux"
custom modern alert system replacing framework
external code editor dependency
raw HTML injection of error snippets
```

# Appendix D — Security rules

Pasted JSON is untrusted.

Mandatory:

```text id="17ajgl"
No eval.
No Function constructor.
No innerHTML with pasted text or snippets.
Use textContent/value.
No network fetch.
No script execution.
No logging full input by default.
Clipboard copy only exact user-requested text.
```

# Appendix E — Logger rules repeated

Every action logs attempt/outcome.

Pattern:

```text id="w2lfap"
[JTI:Component] Attempt action { safeDetails }
[JTI:Component] Action succeeded { safeDetails }
[JTI:Component] Action failed { code, message, safeDetails }
```

Use safe details only:

```text id="v3aenm"
charCount
lineCount
recordCount
rootType
line
column
error code
durationMs
```

Avoid:

```text id="0vlnvg"
full JSON
full parsed object
secrets/tokens from input
large snippets
```

# Appendix F — User-facing error copy rules

Use normal clear language for errors, not compressed internal style.

Good:

```text id="xhtclj"
We could not parse this as JSON.
Line 4, column 17.
Try this: remove the trailing comma before ].
```

Bad:

```text id="vlgcyk"
Parse fail. Bad comma. Fix.
```

Errors must help user repair input.

# Appendix G — Self-review checklist

Before final report, check:

```text id="gw10y6"
Can invalid JSON crash app?
Does error vanish incorrectly?
Does stale parse result overwrite new input?
Does JSONL parse confuse pretty JSON?
Does line/column work with CRLF?
Does snippet expose too much huge input?
Does UI use textContent?
Does logger leak pasted JSON?
Does Format mutate invalid input?
Does Clear clear parse state fully?
Do tests avoid brittle exact V8 message strings?
```

Fix critical/medium issues.

# Appendix H — Suggested final report format

```text id="ur41pj"
Summary:
- Added parser for JSON and JSONL.
- Added persistent actionable parse errors.
- Added logger instrumentation.

Files changed:
- ...

Tests:
- `bun test` PASS/FAIL
- `bun run build` PASS/FAIL or not available

Manual checks:
- ...

Self-review fixes:
- ...

Known limits:
- Row-source detection/table rendering intentionally not implemented until later chunks.
```
