Embedded JSON / JSON-in-JSON Editor

This project provides a focused editing experience for documents that embed JSON inside JSON string values. It breaks each embedded layer into its own tile so users can work at the correct depth without manual escaping.

Key capabilities

- Edit embedded JSON or text in a dedicated tile while ancestors stay visible.
- Commit changes upward explicitly, keeping parent documents safe and predictable.
- Automatic decoding and re-encoding of JSON strings, including escaped newlines and quotes.
- Clear validity states for JSON tiles to prevent broken commits.
- Multi-level nesting support for configuration, templates, and policy documents.

Usage scenarios

- Cloud templates with JSON fields that contain stringified JSON.
- Infrastructure or policy definitions that embed serialized configuration blocks.
- Application settings where nested JSON is stored as strings in a larger document.

Outcome

Users can safely modify deeply embedded structures without hand-editing escape sequences, while keeping parent layers readable and valid.
