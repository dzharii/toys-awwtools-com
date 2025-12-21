# Format-on-Paste Editor

Format-on-Paste Editor is a lightweight text editor built for repetitive copy and paste workflows. Instead of inserting raw clipboard text, it can automatically transform each paste using a simple pipeline and insert the result in predictable ways. The goal is to turn tedious formatting into a fast, repeatable action.

## Key features
- Formatted paste toggle so you can turn transformations on or off instantly.
- Paste transformation pipeline with small steps like trimming, case conversion, and template wrapping.
- Insertion modes for cursor insert, append/prepend, new-line insertion, and delimiter-prefixed or suffixed output.
- Built-in profiles for common tasks such as SQL comma lists and JSON string values.
- Preview of the last paste showing raw input and transformed output.

## Usage scenarios
- Building SQL SELECT lists by pasting column names with a comma prefix.
- Creating JSON arrays by pasting values that are automatically JSON-escaped.
- Normalizing copied text into snake_case, kebab-case, or camelCase identifiers.
- Wrapping pasted content in quotes, commas, or custom templates.

## How it works for you
Configure your pipeline once, then keep pasting to build your final text. The editor focuses on clarity and speed so the output is always predictable and easy to adjust mid-flow.
