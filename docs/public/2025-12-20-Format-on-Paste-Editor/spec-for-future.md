2025-12-20

A00-00 Document purpose and positioning

This document describes future and deferred features that are intentionally not part of the current implementation. It serves as a roadmap and design reference for potential next iterations. The goal is to capture ideas that add value, align with the original vision, and remain conceptually consistent, while clearly separating them from the current scope to avoid feature creep.

This document is forward-looking. Nothing here is required for the initial release, and nothing here should influence implementation decisions unless the project explicitly moves into a next phase.

B00-00 Guiding principles for future expansion

All future features must preserve the core identity of the application: a paste-centric text editor with explicit, composable transformation and insertion logic.

Future work must continue to favor small, orthogonal primitives over large, special-purpose features. Any advanced behavior should ideally be expressible as a combination of smaller steps rather than a one-off hardcoded scenario.

Future features must not turn the app into a full IDE or a domain-specific editor. The editor remains plain text. Intelligence stays in the paste pipeline, not in background parsing or continuous analysis of the document.

C00-00 Multi-item paste processing

One major future feature is first-class support for multi-item paste. This applies when clipboard content contains multiple logical items, such as multiple lines, multiple spreadsheet cells, or delimited values.

In this model, the pipeline input becomes an array of strings instead of a single string. Early pipeline steps are responsible for splitting the clipboard text into items. Later steps operate either per-item or across the full collection.

A split step may support modes such as split by newline, split by comma, split by tab, or auto-detect common delimiters. Auto-detection would be conservative and based on simple heuristics rather than full parsing.

Once split, per-item transformations such as trimming, case transformation, wrapping, or JSON stringification are applied independently to each item.

A join step becomes mandatory at the end of the pipeline. This step defines how items are recombined into a final string, using delimiters such as comma plus space, newline, newline plus indentation, or custom strings.

Usage scenario: the user copies ten column names from Excel, pastes them once, and the app outputs ten formatted entries joined by commas and newlines, instead of requiring ten paste operations.

D00-00 Clipboard parsers and structured input awareness

Another future direction is lightweight clipboard parsers that recognize common structured formats.

TSV and CSV parsing would allow the app to treat spreadsheet data more intelligently. For example, the user could paste two columns and map them to key-value pairs using a template like "${col1}: ${col2}". This parsing would remain shallow and purely textual, without attempting to infer types.

JSON input awareness could allow detection of valid JSON strings or arrays. The app would not become a JSON editor, but it could allow operations like extracting keys, stringifying values, or flattening simple arrays.

These parsers would be optional pipeline entry points. If not used, clipboard content continues to be treated as plain text.

E00-00 Advanced delimiter and punctuation policies

Future versions may introduce smarter delimiter handling. Instead of always inserting delimiters blindly, insertion modes could optionally inspect nearby characters to avoid duplication.

For example, a comma-prefixed insertion could check whether the character before the caret is already a comma or whether the caret is at the start of a list. This logic would be opt-in and configurable per insertion mode.

More complex punctuation rules could be introduced, such as inserting AND or OR between conditions, or switching delimiters based on line boundaries.

This feature is deferred because it increases complexity and introduces edge cases that must be carefully defined and tested.

F00-00 Cleanup and normalization presets

Future iterations may include cleanup-focused pipeline steps aimed at pasted content from rich text sources.

Examples include removing leading numbering or bullet characters, stripping common prefixes, collapsing excessive whitespace, or removing empty lines.

These steps would be designed as explicit transformations rather than implicit behavior. The user must opt into cleanup to avoid surprising edits.

Usage scenario: the user copies a numbered list from a document and wants to paste just the text values, one per line, without manual cleanup.

G00-00 Preset libraries and sharing

Beyond hardcoded predefined profiles, a future version could support user-defined preset libraries.

Users could save named pipelines and switch between them quickly. Presets would be persisted in localStorage and could be exported as JSON and imported later.

Sharing presets would allow teams to standardize formatting workflows without embedding domain logic into the app itself.

This feature is deferred because it introduces additional UI complexity and state management concerns.

H00-00 Multiple workspaces and workspace management UI

The current storage model supports multiple workspaces implicitly, but the UI does not expose this.

A future feature could add a workspace selector allowing users to create, rename, duplicate, and delete workspaces. Each workspace would store its own editor content, pipeline, and UI state.

Usage scenario: a user maintains separate workspaces for SQL queries, JSON payload construction, and general text manipulation.

This feature is deferred to avoid expanding the app beyond a single focused editing context in the initial release.

I00-00 Richer preview and pipeline debugging tools

The preview area could evolve into a more powerful inspection tool.

Future enhancements may include step-by-step previews showing intermediate output after each pipeline step, not just the final result. This would help users understand and debug complex pipelines.

Another extension could allow manually pasting sample input into the preview area without inserting into the editor, effectively turning the preview into a dry-run sandbox.

These features are deferred because they add cognitive load and UI density that is not necessary for simple workflows.

J00-00 Extended insertion modes and context-aware insertion

Future insertion modes could be more context-aware. Examples include inserting relative to the current line start or end, aligning inserted text to existing indentation, or duplicating surrounding syntax patterns.

Insertion modes could also become composable, allowing combinations like insert on new line plus suffix delimiter plus indentation.

These ideas are intentionally postponed to preserve the clarity of the insertion model in the initial version.

K00-00 Keyboard-driven workflows

Another future area is deeper keyboard integration.

This could include keyboard shortcuts for switching insertion modes, cycling through profiles, toggling formatted paste, or temporarily switching pipelines.

The goal would be to support power users without making keyboard usage mandatory or opaque.

L00-00 Plugin-like extension model

In the long term, the transformation and insertion catalogs could be opened to external extensions loaded as additional JavaScript files.

An extension would register new steps or insertion modes using a defined API. This would allow experimentation without modifying core code.

This is explicitly a long-term idea and should not influence current architecture beyond keeping transformation and insertion registries clean and explicit.

M00-00 Roadmap summary

The current version focuses on single-item paste, explicit pipelines, and predictable insertion.

Future versions may expand into multi-item processing, structured clipboard parsing, smarter delimiters, cleanup presets, saved presets, workspace management, richer previews, and extensibility.

Each future feature builds on the same core idea: intercept paste, transform intentionally, and insert predictably. None of these features require changing that core. They extend it gradually, with clear boundaries, when and if the project evolves.
