# ChatGPT Research Rounds

## Saved Relay Artifacts

- Landscape research: `.tmp/chatgpt-relay/2026-05-24_19-23-24_research-round-1-landscape_chatgpt-reply.md`
- Stakeholder analysis: `.tmp/chatgpt-relay/2026-05-24_19-25-11_research-round-2-stakeholders_chatgpt-reply.md`
- Constraints and failures: `.tmp/chatgpt-relay/2026-05-24_19-26-26_research-round-3-constraints-failures_chatgpt-reply.md`
- Opportunity framing: `.tmp/chatgpt-relay/2026-05-24_19-27-25_research-round-4-opportunity-framing_chatgpt-reply.md`

## Extracted Decisions

- The product is a practical configurator and learning aid for generating a ready-to-edit `nob.c`, not a universal build-system replacement.
- The code preview is the primary surface. Controls exist to transform and explain the generated C code.
- The first version should optimize for trust in the generated output: deterministic code, safe defaults, validation, assumptions, copy, and download.
- The site must remain static and browser-only: no backend, accounts, telemetry, bundler, framework runtime, package install, or remote code execution.
- The generated file should default to prefixed `nob.h` APIs and treat stripped-prefix mode as out of scope for v1.

## Open Issues Converted To Requirements

- Target `nob.h` version/source date must be stated as an assumption instead of silently implied.
- Platform presets must be labeled as assumptions, not correctness guarantees.
- Controls that do not change generated output are out of scope for v1.
- Validation must catch unsafe identifiers, empty required fields, invalid source lists, path separators that do not match the selected platform assumption, and suspicious shell metacharacters.

