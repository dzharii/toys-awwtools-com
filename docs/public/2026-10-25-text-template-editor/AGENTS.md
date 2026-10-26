# AGENTS.md

## Project

Build a static browser application for creating guided text documents from reusable templates. Users fill placeholders with contextual hints, preview generated text, and copy or export results. The application also supports document history and template authoring.

Technology: TypeScript, JavaScript, HTML, CSS, and Bun. The application runs as a static website without a backend.

Bun is expected to be installed globally. Runtime libraries are vendored; npm dependencies are permitted for development and testing only.

Detailed requirements are defined in `.specs/`.

## References

Those references are mandatory for the agent to review before starting implementation, and during the implementation the agent should consult those samples and basically take some parts, copy some parts from those during the implementation. Those are kind of mandatory for review, for reading, for understanding what's inside. They can be very resourceful and helpful for our project overall, but need to keep in mind that those are just samples, not the complete implementation, and will require some safety— it's not safety, but some adjustments to make it more resilient, more error-prone, and so on and so forth. We should keep that in mind always.

- `D:\projects2024\2026-10-25-text-template-editor\development-reference\gtl-reference-kit` — Extracted contents of `gtl-ui-architecture-reference-kit.zip`. Contains source code, libraries, UI examples, diagrams, and architectural references.
- `D:\projects2024\2026-10-25-text-template-editor\.specs\full-chat-export-for-this-project.html` — Complete project conversation. Treat as raw requirements-gathering material; the specifications take precedence.
- `D:\my-github\unsafe-link-preview-browser-extension ` this project has good references on handling background worked communication
- `D:\my-github\toys-awwtools-com\docs\public\2026-10-25-sovietRDTL-chat-ui-with-eliza-like-engine` this project can sever as primary dark theme user interface guideline
- `D:\my-github\toys-awwtools-com\docs\public\2026-10-09-chatgpt-prompt-menu-for-break-down-prompts` - use this project to lookup examples for UI for template editing. very good inspiration. you can copy some styles for the elements. also there is "Live prompt" preview. we can use this floating window technique in our implementaiton. 
- `D:\my-github\toys-awwtools-com\docs\public\2026-09-13-300K-stars-skill-language-editor` use this project and vendor our version of microlight as the best example for the template editor with syntax highligh.
## Specifications

All specifications are located in `.specs/`. Read and follow all applicable specifications before implementation.

Initial specifications:

- `suggestions001-01-initial-specification.md`
- `principle001-01-code-organization.md`

Additional specifications and change requests may be added.

### Immutability

Every document in `.specs/` is immutable and append-only.

- Never modify, overwrite, or delete an existing specification, including one already implemented.
- Changes are introduced through a new specification or change-request file with the next monotonically increasing identifier.
- Never reuse an existing identifier.
- Later change requests extend or supersede earlier requirements where explicitly applicable, without modifying the originals.

### Specification types

| Prefix         | Purpose                                         | TODO file    |
| -------------- | ----------------------------------------------- | ------------ |
| `suggestions*` | Specifications and change requests to implement | Required     |
| `principle*`   | Implementation guidance and coding preferences  | Not required |

Read `principle*` documents before implementation and apply them during code review and final validation. They are standing guidance, not separate implementation tasks.

### Implementation TODOs

Before implementing a `suggestions*` specification, create a detailed, explicit TODO document using the same filename with the `.todo.md` suffix.

Example:

```
suggestions001-01-initial-specification.md
suggestions001-01-initial-specification.todo.md
```

The TODO must break down the specification into implementable tasks, including relevant validation and testing. Avoid vague tasks that require rediscovering the requirements.

TODO documents in `.specs/` follow the same immutability rule. Use them as implementation plans; track execution progress without rewriting them.

## Development workflow

Implement incrementally, from simple to complex. Prefer small, meaningful, independently testable changes.

Use this iterative approach:

```
DISCOVER available tools and inspect the project.

PREPARE detailed specification TODOs.

IMPLEMENT the smallest runnable application.
BUILD and OPEN it in a real browser.
VERIFY appearance, behavior, and errors.

REPEAT UNTIL all specification tasks are complete:
    SELECT the next meaningful implementation chunk.
    IMPLEMENT the selected functionality.
    BUILD, type-check, and run relevant tests.
    OPEN and inspect the application in a browser.
    VERIFY the behavior against specifications.
    REVIEW the code against implementation principles.
    USE model-assisted code review when available.
    FIX identified issues before continuing.

PERFORM final integration testing and code review.
VALIDATE completion against all applicable specifications.
```

Use your judgment to determine appropriate iteration size. Test actual browser behavior frequently, not only at the end of development.

## Development tools

Discover which tools are already installed on the development machine before installing alternatives.

Prefer available local tools, including:

- Bun — Building, development, and testing.
- Playwright — Browser interaction, inspection, and automated testing.
- ImageMagick — Image processing when needed.
- FFmpeg — Media processing when needed.

Use additional tools when necessary, but avoid unnecessary installations and dependencies.

## Code quality and repository hygiene

- Follow the implementation guidance in `principle*` specifications.
- Keep code readable, maintainable, and appropriately documented.
- Use clear formatting and consistent project conventions.
- Maintain working build, type-check, and test commands.
- Maintain an appropriate `.gitignore`.
- Keep generated files, caches, temporary artifacts, and unnecessary dependencies out of Git.
- Review changes before committing to ensure only intended project files are included.
- Perform a final code review and validate the completed implementation against the specifications.
