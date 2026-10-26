# Guided Template Language

GTL describes text and guidance, not executable logic. Files are UTF-8 `.gtl`.
Directives are case-sensitive uppercase; identifiers begin with an ASCII letter
and continue with ASCII letters, digits, `_`, or `-`. Names are case-sensitive.
Comments, expressions, conditionals, loops, includes, and scripts are unsupported.

```text
TEMPLATE: A thoughtful introduction

TEXT:
  Hello {{$name}},

  {{$message}}

  {{$closing}},
  {{$sender}}
  {{$notes}}

$name: Who are you writing to?
  HINT: Use the name you would normally use.
  EXAMPLE: Alex

$message: What would you like to say?
  INPUT: multiline

$closing: Choose a sign-off.
  OPTION regards: Kind regards
  OPTION thanks: Thank you

$sender: What is your name?

$notes OPTIONAL: Anything else?
```

Select a choice explicitly; the first option is never a default. The answer
stores `regards` but inserts `Kind regards`. A field cannot combine multiline
input and choices. Each declaration has at most one hint and input directive,
and may have multiple `EXAMPLE:` lines. Examples are guidance, never defaults.

## Text and whitespace

Use spaces for structural indentation. TEXT lines must be more indented than the
TEXT directive. The parser removes common structural indentation and
layout-only blank lines at the block edges. Internal blank lines, relative
indentation, literal punctuation, and multiline answers are preserved.
CRLF and CR normalize to LF. Structural tab indentation is diagnosed; tabs inside
answers/literal content are not rewritten.

Placeholder references are exactly `{{$name}}`. Repeated references use one
answer within a document. An undeclared reference is required and gets a generated
question plus a nonblocking authoring warning.

Required answers cannot be empty or whitespace-only. Empty optional answers
insert an empty string; no adjacent punctuation or grammar is rewritten. Put
optional fields where empty substitution makes sense. HTML-like text is literal.

## Alternative structures

Use one top-level TEXT block **or** named VERSION blocks, never both:

```text
TEMPLATE: Project description

VERSION: Purpose + function
  TEXT:
    A {{$tool}} that {{$action}} to {{$benefit}}.

VERSION: Input + processing + output
  TEXT:
    Takes {{$input}}, {{$processing}}, and produces {{$result}}.

$tool: What is it?
$action: What does it do?
$benefit: Why is it useful?
$input: What goes in?
$processing: What happens?
$result: What comes out?
```

Version names are unique. Declarations are source-wide metadata. Document
answers remain independent even when versions reference identically named fields.

## Diagnostics and publication

The parser returns a definition or null plus diagnostics with code, severity,
line, column, and explanation. Any error blocks execution/preview, but never
source saving/downloading. Warnings include unused declarations and missing
guidance. Diagnostics appear beside the source and in the issues panel; selecting
one focuses its location.

The parser and renderer are separate pure modules. `tests/unit/templates.test.ts`
contains valid and invalid executable examples.

To publish a downloaded draft, place it under `templates`, then register its
stable ID, display name, description, category, and relative `.gtl` path in
`templates/manifest.json`. `bun run build` rejects invalid paths, duplicate IDs,
missing files, manifest/name mismatches, or invalid GTL. Upload the new `dist`
output. Browser authoring never edits deployed files. Existing saved documents
continue using their original embedded source.
