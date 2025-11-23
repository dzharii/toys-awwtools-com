# Agent Instructions
Date: 2025-11-23

## Agent TODO

- Ensure that the project uses only vanilla HTML, CSS, and JavaScript loaded via classic script tags with no modules or external dependencies.
- Ensure that global namespaces for the UI library, editor core, logger, and configuration objects are created and attached to `window`.
- Ensure that the bootstrap code initializes the editor only after the DOM is ready and wires it to the correct DOM containers.
- Ensure that a centralized logger object exists and is the single entry point for all logging and telemetry.
- Ensure that the logger supports multiple log levels (at least verbose, info, warn, error) and respects a configurable current level.
- Ensure that the logging configuration (including log level) is defined in a dedicated global configuration object or constant.
- Ensure that each log entry includes clear category and module prefixes plus a concise human-readable message.
- Ensure that complex runtime values are logged by appending JSON-serialized data using `JSON.stringify` where helpful.
- Ensure that in verbose mode the logger emits detailed diagnostic messages for key operations and important runtime values.
- Ensure that all direct `console.log` and `console.error` calls in the codebase are replaced or wrapped by the centralized logger, except within the logger itself or minimal fallbacks.
- Ensure that key editor operations (node create/move/delete, connection create/delete, text operations, save/load, export) use the logger to record meaningful events.
- Ensure that public functions and critical internal APIs perform explicit precondition checks on arguments and input data.
- Ensure that functions that modify shared diagram state perform postcondition checks or assertions for key invariants where practical.
- Ensure that failures of preconditions or postconditions produce descriptive error logs and, when appropriate, throw meaningful exceptions.
- Ensure that persistence code for saving and loading diagrams wraps JSON parsing and serialization in try/catch blocks with detailed error logs.
- Ensure that diagram validation on load checks for identifier uniqueness and consistent references and logs descriptive errors when validation fails.
- Ensure that export logic for SVG and PNG logs clear error messages and relevant parameters when export operations fail.
- Ensure that changing the configured log level in the single configuration location correctly influences logging behavior throughout the application.
- Ensure that user-facing error messages are clear and professional while detailed technical context remains available in console logs.
- Ensure that optional small self-contained assertions or tests for core data model and logger behavior can be executed in a non-browser JavaScript environment.





## Instructions 

T00 Large Language Model Coding Agent Validation Overview 00
 This section defines a focused set of validation and implementation requirements for a large language model coding agent working on this project. The agent cannot open a browser, click UI elements, or perform interactive manual testing. The agent operates purely on code, configuration, and, where available, textual logs or test outputs.

The agent is expected to reason about the specification, inspect and modify source files, and ensure that logging, configuration, and validation behaviors are implemented according to this document. The agent must not rely on visual confirmation of the UI and must treat all checks as static or code-driven verifications.

T01 Logger and Telemetry Requirements for the Coding Agent 00
 The editor must provide a centralized application logger implemented in vanilla JavaScript and exposed in the global namespace, for example as window.SubwayLogger or an equivalently prefixed name. The agent must ensure that such a logger exists as a single point of entry for all logging and telemetry in the application.

The logger must support configurable log levels. At minimum, the following conceptual levels must exist: a verbose level that logs all diagnostic information and telemetry, an info level for normal high-level events, a warn level for unexpected but non-fatal conditions, and an error or release level for exceptions and critical failures. The initial configuration for the application must set the logging level to verbose so that development builds produce detailed logs.

Each log entry must begin with clear categorical prefixes expressing the category and the module or subsystem. The coding agent must enforce a convention similar to the following format:

[Category][Module] Message text; data = 

Category identifies the broad functional area such as EDITOR, UI, RENDER, INPUT, STORAGE, or LOGGER. Module identifies the specific component or function such as NodeController, ConnectionController, Viewport, Persistence, or Config. Message text is a concise human-readable description of the event. Data is an optional JSON-serialized representation of the most important runtime values related to the event.

The agent must implement logging methods such as logVerbose, logInfo, logWarn, and logError (or equivalent names) that respect the configured logging level. Verbose mode logs all events. Info mode logs info, warn, and error. Release mode logs only errors and exceptions. The logger must internally map the configured level to numeric precedence to enable simple comparisons in code.

For JSON serialization, the agent must prefer JSON.stringify to produce compact, copy-paste friendly object representations. When logging objects, the preferred style is to write a simple explanatory text followed by a JSON string, for example:

[EDITOR][NodeController] Creating node; data = {"x":120,"y":80,"radius":40}

The agent must route all logging through the central logger instead of scattering direct console.log or console.error calls throughout the code. Minimal, well-justified exceptions are allowed only near the logger implementation itself.

T02 Configuration Constants and Logging Level Control 00
 The application must define a configuration object or constant in JavaScript that controls global settings such as logging level. The coding agent must ensure that this configuration is declared in a dedicated configuration file or section, implemented without modules and exposed via a global namespace prefix, for example window.SubwayConfig or a similar project-specific name.

This configuration object must include at least a property for logLevel that the logger reads when determining which messages to emit. The default value must be set to verbose. Additional configuration values may include flags for enabling grid snapping, default palette, default theme, and performance-related thresholds.

The agent must ensure that all references to log level and other configuration values read from this configuration object rather than from hard-coded constants scattered in multiple files. When changes to logging behavior are required, the agent must modify the configuration object rather than duplicating logic.

The agent must also ensure that code paths that adjust logging level at runtime, if provided, either update the configuration object or call a clearly defined logger method that updates internal log level state consistently.

T03 Input Validation, Preconditions, and Postconditions 00
 The coding agent must implement and verify systematic input validation, preconditions, and postconditions for all non-trivial functions and public APIs in the editor core and UI library. Because the agent cannot run the application interactively, validation is expressed in code as explicit checks rather than inferred from behavior.

For preconditions, functions must check their arguments for null or undefined, verify expected types and ranges, and guard against obviously invalid states, such as unknown node identifiers or negative dimensions. When a precondition fails, the function must log a descriptive error using the logger at error level and, as appropriate, either throw an exception with a meaningful message or safely abort the operation.

For postconditions, functions that transform state in ways that can reasonably be checked must verify key invariants after the transformation. Examples include ensuring that a moved node still has finite numeric coordinates, that creation of a connection actually links two existing nodes, and that a loaded diagram results in consistent node and connection references. When postconditions fail, the code must emit a detailed error log entry and prevent further use of corrupted state where possible.

In verbose logging mode, the agent must ensure that the implementation logs important runtime values in both precondition checks and postcondition checks. For example, when a precondition check fails for a node identifier, the log line should include the supplied identifier, the calling function, and any related counts or collection sizes that help diagnose the issue.

T04 Descriptive Error Reporting and Console Output 00
 The coding agent must implement descriptive, human-readable error messages for all exceptional conditions. These messages must be informative enough to understand what failed, where it failed, and with what data, without being excessively noisy.

Error logs must always include at least the category, module, and message text. In verbose mode they must also include serialized runtime values that are likely to help debugging. For example, when loading a diagram JSON file fails due to invalid data, the log must state that diagram loading failed, mention whether JSON parsing or structural validation failed, and include either the problematic snippet or a JSON-serialized object describing the validation result.

The agent must prefer JSON-based logging for complex objects. When logging values such as node lists, connection lists, configuration objects, or parsed diagrams, the log message must contain a brief description and a JSON.stringify representation of the relevant subset of data rather than dumping arbitrary object structures in an ad hoc way.

All error messages shown on screen to the user must be written in a clear and professional style. When mapping internal log messages to user-facing messages, the agent must ensure that sensitive or unnecessary implementation details are omitted on screen while detailed context remains available in the console logs.

T05 LLM-Oriented Acceptance To-Do List 00
 The following tasks describe what the large language model coding agent must be able to validate and enforce using code analysis and edits, without running the browser.

Task A: Confirm that the project structure contains index.html, a shared CSS file, a UI helper JavaScript file, an editor core JavaScript file, and a configuration or constants JavaScript file. Ensure that all JavaScript is loaded using classic script tags in index.html, with no import or export statements and no dependency on bundlers or external CDNs.

Task B: Inspect index.html and the JavaScript files to verify that the global namespaces for the UI library, editor core, logger, and configuration (for example, SubwayUI, SubwayEditor, SubwayLogger, SubwayConfig) are defined and attached to window. Confirm that bootstrap code invokes the editor initialization function after the DOM is ready.

Task C: Analyze the logger implementation to confirm that log levels are defined, that a configuration-driven current log level is used, that categorical prefixes and module identifiers are included in all log methods, and that there is a standardized message format that appends JSON-serialized data for complex objects.

Task D: Walk through the editor core code paths for key operations, such as creating nodes, moving nodes, creating connections, deleting objects, saving and loading diagrams, and exporting. Ensure that each of these paths calls appropriate logger methods at verbose or higher levels with meaningful category and module information and that critical operations include JSON-serialized snapshots of important inputs and outputs.

Task E: Inspect all public functions and entry points to enforce preconditions. Confirm that arguments are checked for required types and value ranges, that missing or invalid identifiers are handled explicitly, and that descriptive logs and exceptions are produced when checks fail.

Task F: For functions that modify shared state, examine the code to ensure postconditions are enforced where practical. Confirm that after state mutations, invariants such as consistent node and connection references are checked and that violations produce detailed error logs.

Task G: Search the codebase for raw console.log or console.error statements and replace or wrap them with calls to the centralized logger, unless they are part of the logger implementation itself or a deliberate minimal fallback for catastrophic failures.

Task H: Review persistence code responsible for JSON save and load. Confirm that JSON.parse and JSON.stringify operations are wrapped with try or catch blocks and that failures log detailed error messages including either the problematic input or a JSON-serialized error descriptor. Confirm that validation logic for loaded diagrams logs both the type of validation error and the context data.

Task I: Review error-handling code for diagram export operations. Confirm that any failures to generate SVG or PNG result in clear error logs that include information on the export parameters and any caught exception objects, serialized to JSON where possible.

Task J: Ensure that the configuration constant or object for logging level is easy to locate, clearly documented, and used consistently. Confirm that changing the configured log level in this single place will alter logging behavior throughout the application without requiring changes in multiple files.

Task K: Optionally propose and, when appropriate, insert small, self-contained unit-style test functions or assertions that can be executed in a headless JavaScript environment. These tests should validate core invariants of the data model and logger behavior without relying on the DOM.

T06 Scope Limits for the Coding Agent 00
 The coding agent must recognize that certain aspects of the specification cannot be validated purely through static code inspection. It cannot confirm visual layout fidelity, precise rendering quality, or interaction feel such as smoothness of panning and zooming. These remain manual acceptance tasks covered by the broader specification.

The agent must therefore focus its validation on elements visible in the source code: proper use of vanilla JavaScript without modules or bundlers, existence and structure of global namespaces, implementation of the centralized logger and configuration, presence of robust validation logic, and appropriate use of descriptive, JSON-friendly telemetry and error messages.



