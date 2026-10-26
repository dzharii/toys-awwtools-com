# Code organization implementation plan

Created: 2026-10-25

The source file is advisory code-quality guidance despite its suggestions prefix.
This immutable plan records how it is applied to the initial implementation.

- Organize substantive capabilities around Templates, Documents, Template
  Authoring, Settings, and Export with narrowly scoped platform infrastructure.
- Use the established domain vocabulary and named persistence/validation rules.
- Separate pure parsing/rendering/keyboard policy from DOM and storage.
- Use strict types, discriminated save states, validated external boundaries,
  explicit failures, thin worker routing, and repository contracts where needed.
- Explain non-obvious concurrency, storage, and parsing invariants near the code;
  avoid forwarding layers, speculative abstractions, and excessive fragmentation.
- Write behavior-focused tests and maintain technical documentation with code.
- Review the completed implementation using Q19-Q23, prioritizing correctness,
  user data integrity, simplicity, and maintainability over stylistic machinery.
