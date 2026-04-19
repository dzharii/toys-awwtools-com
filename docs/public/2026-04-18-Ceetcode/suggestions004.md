2026-04-18

A00. logging-change-request.md

# Logging and Tracing Change Request

## A00. Purpose

This document defines a new feature request for the project: a high-quality logging and tracing system for the browser application. This is a separate specification intended for Codex. It describes the desired behavior, presentation, configurability, and implementation direction for diagnostic logging across the application.

The goal is to make runtime behavior visible in a clear, readable, well-formatted way without turning the console into noise. The logging system should help with development, testing, debugging, and behavioral tracing. It should present useful information at the right level of detail, using a consistent visual format and configurable rendering rules.

Codex should resolve implementation ambiguities using its own best judgment. Where the specification leaves room for design choice, Codex should choose the option that produces a clean, readable, maintainable result.

## B00. High-level outcome

Implement an application-wide logging system for JavaScript code in the browser. The system should write formatted messages to the browser console. The formatting should be visually distinctive, readable, and intentionally designed rather than ad hoc.

The project identity in logs should use the grape emoji and a project label derived from the example format. The default visible shape of a message should resemble this pattern:

`🍇[CCode][LEVEL][SubCategory] message text (local time iso)`

The exact rendering may vary by formatter, but the structure must remain recognizable. The project marker should always use the grape emoji. The project label should consistently identify the application. The logging level and subcategory should always be visible. The timestamp should always use local time in ISO-like form and should remain easy to spot without overwhelming the message.

The system must support configurable visual styles, configurable log-level visibility, local persistence of preferences, runtime application of preference changes, and broad instrumentation across the application code.

## C00. Logging principles

The logging system must be useful, not decorative noise.

The logs should be easy to scan. Important information should stand out first. Formatting should support comprehension rather than distract from it. Colors and backgrounds are allowed and encouraged, but the final appearance should remain readable in both light and dark developer-tool themes.

The system should emphasize information-level operational visibility while still supporting warning and error cases cleanly. At the same time, the default configuration should be conservative. By default, the application should show errors only. The user may raise the visible level later through settings.

The logger should not dump entire large objects by default. When state or contextual values matter, the message should include selected important values only. Those values should be serialized in a compact, readable JSON form embedded as context for the specific message.

The logger should not require every call site to manually reconstruct formatting conventions. Formatting, timestamping, filtering, and style selection should be centralized.

## D00. Logging model

Codex should implement a central logging facility for the browser application.

This facility should support at least the following concepts:

A project identity marker using the grape emoji.

A log level system, including at minimum error, warning, and info.

A category or channel concept for grouping messages.

A subcategory concept to add more specific routing context.

A timestamp generated in local time in an ISO-like format.

A structured message body.

An optional compact structured context payload for selected values.

The logger should expose a simple API that application code can call without needing to know formatting details. Codex may choose the exact function signatures, but the result should make it easy to emit messages consistently across the application.

Codex should use its own judgment to define categories and subcategories. It should also use its own judgment to select fitting emojis for categories and subcategories where stylistic formatters support them. Those choices should feel coherent, restrained, and readable.

## E00. Default message format

The visible message structure should preserve these semantic parts in order:

Project marker.

Project name.

Level.

Subcategory or scope.

Main message text.

Important structured context, when relevant.

Local time.

The exact console rendering may differ by formatter, but the baseline formatter should still preserve those fields in a clear way. The timestamp should use local time and should be visually separated from the main text. The level should be immediately recognizable. The subcategory should help identify which subsystem produced the log.

The message text should be concise and action-oriented. It should say what happened, not merely where it happened. If additional context is needed, attach a compact JSON payload containing only the important values for that operation.

## F00. Log levels and filtering

The logging system must support runtime filtering by log level.

At minimum, the system must support these visibility modes:

Errors only.

Warnings and errors.

Info, warnings, and errors.

Codex may add more internal levels if useful, but the visible settings and filtering behavior should remain simple.

The default application setting must be errors only.

The user must be able to change the visible level at runtime through the settings dialog. The updated level must take effect immediately without requiring a page reload. The chosen setting must be persisted so that the next application session restores it automatically.

## G00. Formatter architecture

The logging system must support multiple renderers or formatters.

A formatter is responsible for taking a normalized log event and turning it into a browser-console output style. Codex should implement the logging system so that message formatting is pluggable rather than hardcoded into every log call.

At minimum, the system should support multiple visual styles, such as:

A plain readable formatter.

A formatter with emoji accents.

A formatter with subtle backgrounds and styled label segments.

Codex may decide the exact formatter names, but the available options must clearly communicate what they do.

The formatter system should also support toggles or equivalent options for decorative rendering, including whether emoji are used and whether styled backgrounds are used. If Codex chooses to implement these as distinct formatter presets instead of many independent toggles, that is acceptable as long as the user can choose different presentation modes.

Text must remain readable in both light and dark console themes. Codex should verify readability and avoid combinations that reduce contrast or cause eye strain. The styling should not look chaotic or overly saturated. Use good taste and restraint.

## H00. Settings UI

Add a logging settings interface to the application UI.

The entry point should be a visible Settings action in the user interface. Activating it should open a modal dialog. Using the native HTML `dialog` element is acceptable and encouraged.

The dialog should be appropriately sized so the content is fully visible and does not feel cramped. It should look clean and structured, similar in spirit to a modern settings surface. The style goal is simple, organized, and polished.

Inside the dialog, include a logging section with descriptions for the available settings. The person using the page should understand what each setting changes.

The settings should include at least:

The visible logging level.

The log rendering or formatter style.

Any optional display preferences Codex judges useful for readability and control.

The settings should apply automatically when changed. The person should not need to press a separate Save button. Closing the dialog should simply dismiss it. A close button must be present and obvious.

The settings should persist automatically in local storage or another appropriate client-side persistence mechanism available to the application.

## I00. Runtime settings behavior

When a logging preference changes, the new behavior should apply immediately.

Codex may implement this through global state, a subscription model, custom events, a central store, or another suitable mechanism. The choice is left to Codex. The important behavior is that format and filtering changes propagate through the application at runtime without requiring refresh.

The implementation should be simple enough to remain maintainable. There is no requirement to introduce a heavy framework pattern solely for logging configuration.

On application startup, the logger should load persisted settings and use them automatically before the main application behavior begins emitting logs, if practical.

## J00. Instrumentation scope

Codex should review the JavaScript application files and identify where logging materially improves visibility.

Add logging to the important operational paths, not to every trivial line of code. The purpose is to surface meaningful state transitions, user actions, runtime events, worker communication, compilation flow, execution flow, harness behavior, settings changes, persistence behavior, and failure conditions.

Examples of places where logging is likely valuable include:

Application initialization.

Problem loading.

Editor state restoration.

Run button activation.

Compilation start and completion.

Execution start and completion.

Worker creation and worker message exchange.

Settings changes.

Persistence reads and writes.

Error paths and fallback paths.

Custom test activity.

Result rendering updates.

Codex should use judgment and avoid excessive repetitive logs. Logs should illuminate the flow of the program, especially at boundaries between subsystems.

## K00. Context payload guidance

Where a message refers to state or values, include only the important selected fields as structured context.

Do not print entire large objects unless there is a strong reason. Instead, attach a small JSON payload that captures the relevant operational context. For example, if a run begins, include a compact payload such as the problem identifier, whether the run is sample or custom, the visible log level, and similar useful fields.

The structured context should help a reader understand the event without reopening the source code. It should not flood the console.

Codex should define a normalized way to attach structured context so the formatter can render it consistently. The context should be compact, predictable, and readable.

## L00. Emoji and category guidance

The grape emoji is mandatory as the primary project marker.

Beyond that, Codex should use its own best judgment to assign additional emojis where doing so improves recognition without clutter. Category and subcategory markers should feel consistent and restrained. They should not turn every message into decoration. A person should still be able to read the important text quickly.

If a formatter or style disables emoji, the system should still remain fully usable and clear.

## M00. Console styling guidance

Use browser console styling thoughtfully.

Styled segment labels, subtle background blocks, readable spacing, and differentiated level coloring are desirable. The console output should look intentionally designed and should make the level, subsystem, and message easy to scan.

The time portion should be visible but secondary. The main message should remain the focal point.

The system should avoid overly bright colors, unreadable low-contrast combinations, and visually noisy patterns. Codex should test both light and dark browser console themes and choose styles that remain legible in both.

Codex should prefer restrained visual hierarchy over maximal decoration.

## N00. Persistence requirements

Persist the logging preferences locally in the browser.

At minimum, persist:

The selected log level.

The selected formatter or rendering style.

Any additional logging display preferences Codex introduces for the user.

The saved settings should load automatically on application startup and should be applied without requiring user intervention.

The persistence implementation should fail gracefully if storage is unavailable.

## O00. Acceptance requirements

This change request is complete when the following are true.

The application has a centralized logging system.

Logs are formatted consistently in the browser console.

The project marker uses the grape emoji.

Each log includes project identity, level, subcategory, message, and local-time timestamp.

The default visible log level is errors only.

The user can open a settings dialog from the UI and change logging settings.

The settings dialog applies changes immediately.

The chosen settings persist across reloads.

Multiple formatter styles or rendering modes are available.

Console output remains readable in light and dark modes.

Important application flows are instrumented with meaningful logs.

Structured contextual values appear in compact JSON form where useful.

The logging system avoids excessive noise and favors important operational visibility.

## P00. Directions to Codex

Implement this feature using your own best judgment while preserving the intent of this specification.

Resolve ambiguities in favor of readability, maintainability, and practical debugging value.

Choose good category names, subcategory names, formatter names, emoji usage, and console styles.

Add logging to meaningful points across the JavaScript codebase, but do not bloat the code with trivial messages.

Design the logger so that formatting, filtering, and persistence are centralized and easy to evolve.

Design the settings dialog so it feels simple, clear, and polished.

Prefer a result that is operationally useful every day over one that is merely visually clever.
