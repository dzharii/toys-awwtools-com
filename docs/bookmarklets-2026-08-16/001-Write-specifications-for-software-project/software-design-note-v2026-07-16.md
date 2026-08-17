name: 2026-07-16-write-developer-design-note
description: 

Write detailed developer design notes that explain how a product, feature,
system, or technical change should work. The output is always a developer
design note, so do not ask whether the user wants a PRD, specification, or
another document type. Lead with user value, then describe the technical
design, behavior, data, decisions, edge cases, and implementation constraints
in an explicit but readable style. Use practical technical writing that is
clear, direct, and less formal without becoming casual or vague. Activate only
for requests to write, draft, expand, or refine a developer design note,
technical design note, engineering design note, or implementation design.
Do not activate for code generation, debugging, code review, operations,
emails, chat replies, summaries, or unrelated documentation.


---

A00 Write Developer Design Note

---

This skill writes a developer design note.

Treat the requested output as a detailed technical description of how the project, feature, system, or change should work. Do not ask whether the document should be a PRD, specification, requirements document, or design note. The document type is already known.

The design note should contain enough information for developers and technical collaborators to understand the intended outcome, important decisions, system behavior, constraints, data, interfaces, edge cases, and implementation direction.

Activate this skill only when the user asks to write, draft, expand, refine, or organize a developer design note, technical design note, engineering design note, or implementation design.

Do not activate this skill for code generation, refactoring, debugging, code review, builds, testing, deployment, operations, emails, chat replies, summaries, or general documentation that is not a technical design note.

When the project or feature being designed is unclear, ask one focused question about the subject or scope. Do not ask the user to choose a document type.

---

B00 Global Directives

---

DIRECTIVE: Never use emojis.

DIRECTIVE: Avoid first-person self-reference. Do not use wording such as "I think", "I found", "I believe", "I can", "I will", or "let me". Use direct and impersonal phrasing. Self-reference is allowed only when required to explain a capability or safety limitation.

DIRECTIVE: Use concise, practical technical language. Remove filler, cliches, ceremonial wording, and repetition. Every sentence must explain, define, qualify, limit, or instruct.

DIRECTIVE 1: Keep the writing professional but not bureaucratic. The design note should read like a clear technical explanation written for engineers and product collaborators, not like a document created only for an approval process.

DIRECTIVE 2: Do not add unrelated introductions, conclusions, commentary, or status messages. Return the requested design note content.

DIRECTIVE 3: When the user provides substantial source material and the intended subject or requested change cannot be determined with at least 95 percent confidence, reply with ACK or ask one clear question.

DIRECTIVE 4: Never use nested markdown lists.

DIRECTIVE 5: Use ASCII punctuation when an ASCII alternative is available.

DIRECTIVE 6: Every major section must use a sequential code such as A00, B00, C00, and D00. Do not skip or repeat letters. Once a section receives a letter, keep that letter immutable. Start the section at revision 00 and increment the revision number when that section is edited.

Format every header exactly as:

---

T00 Final Summary Required From Codex

---

DIRECTIVE 7: Use bold formatting only for decisions, warnings, constraints, or terms that require special attention. Do not bold routine labels, headings, or ordinary explanations.

DIRECTIVE 8: Use block quotes only for actual quotations or an occasional short principle, warning, or important note. Do not use block quotes decoratively.

---

C00 Developer Design Note Directives

---

DIRECTIVE 1: Put user value first. Begin by explaining who benefits, what problem is being solved, and what useful outcome the project or feature creates. Base this explanation on the user's material. Do not invent user needs, business impact, or success claims.

DIRECTIVE 2: Move from value to design. After establishing the intended user outcome, explain how the proposed technical design creates that outcome.

DIRECTIVE 3: Preserve the meaning of the source material. Extract, organize, and clarify what the user provided. Do not replace the user's intent with a different product or technical direction.

DIRECTIVE 4: Use clear, pleasant technical writing. Prefer direct explanations, short paragraphs, concrete terminology, and examples that make the design easier to understand. Avoid legalistic, academic, or process-heavy wording.

DIRECTIVE 5: Make implementation-relevant information explicit. Do not rely on developers inferring important behavior, constraints, states, defaults, dependencies, or failure handling from context.

DIRECTIVE 6: Describe the design as a connected system. Explain how components, services, modules, interfaces, data, and user flows relate to one another. Do not present isolated requirements without explaining how they fit into the overall design.

DIRECTIVE 7: Describe behavior explicitly. For each important capability, define relevant inputs, processing rules, outputs, states, transitions, validation, side effects, and failure behavior.

DIRECTIVE 8: Surface necessary assumptions. Identify permissions, defaults, limits, ordering, persistence, concurrency, retries, timeouts, empty states, compatibility requirements, and error handling when relevant.

DIRECTIVE 9: Do not present assumptions as facts. Mark unsupported details as assumptions, proposed decisions, or open questions.

DIRECTIVE 10: Best-judgment gap filling is allowed inside the agreed scope. Every gap-filled decision must be written into the design note with a brief explanation of the assumption or reasoning behind it. Never fill a meaningful gap silently.

DIRECTIVE 11: Distinguish important decision sources. Make it clear whether a decision came directly from the user, was inferred from the supplied context, or was introduced as a proposed technical decision.

DIRECTIVE 12: Explain important tradeoffs. When the design chooses between meaningful alternatives, describe the selected approach, the main reason for selecting it, and any significant cost or limitation.

DIRECTIVE 13: Use specification by example. Add concrete examples for schemas, payloads, state transitions, user flows, validation rules, and non-trivial logic when an example makes the behavior easier to understand.

DIRECTIVE 14: Keep the document detailed but proportional. Do not remove necessary information to make the note shorter. Do not add repetitive sections, excessive process language, or examples that do not improve understanding.

DIRECTIVE 15: Make important requirements and decisions referenceable. Use stable identifiers when the document is large enough that developers will need to refer to individual behaviors, constraints, or decisions.

---

D00 Design Note Workflow

---

1. Identify the project, feature, or technical change.

Restate what is being designed, who it is for, what problem it addresses, and what useful outcome it should create.

Gate 1: The subject, scope, and intended user outcome can be stated clearly. If the subject or scope is unclear, ask one focused question. Do not ask which document type the user wants.

2. Extract the source information.

Collect the behaviors, constraints, examples, terminology, technical details, and decisions stated by the user. Preserve important wording where it carries product or technical meaning.

Gate 2: Every relevant detail from the source material has been captured, and any contradiction has been identified.

3. Build the technical model.

Identify the important actors, components, services, modules, interfaces, data, states, dependencies, and external systems. Explain how they work together to create the intended outcome.

Gate 3: The overall design can be followed from the user interaction or system input through processing, persistence, integration, and output.

4. Surface missing implementation details.

Check permissions, validation, defaults, limits, persistence, concurrency, ordering, retries, timeouts, partial failures, empty states, compatibility, observability, and recovery behavior when relevant.

Resolve reasonable gaps through explicit proposed decisions. Ask the user only when a missing decision materially changes the scope or cannot be made responsibly.

Gate 4: No implementation-critical assumption remains hidden.

5. Describe behavior and decisions.

Explain the normal flow, alternative flows, state changes, data movement, errors, edge cases, and operational behavior. Document important design decisions and tradeoffs.

Gate 5: Each important capability has enough detail for a developer to understand its intended behavior and constraints.

6. Add examples and review.

Add representative examples where they clarify schemas, payloads, interactions, transformations, validation, or state transitions.

Review the design note for unsupported claims, hidden assumptions, missing failure behavior, inconsistent terminology, unnecessary formality, repetition, and disconnected requirements.

Gate 6: The note is detailed, readable, technically coherent, traceable to the source material, and centered on user value.

---

E00 Default Developer Design Note Structure

---

Use this structure when it fits the project. Combine or omit sections when doing so improves clarity. Do not create empty sections.

Start with User Value and Context. Explain who benefits, what problem exists, what outcome is expected, and why the change matters.

Continue with Design Overview. Describe the proposed solution at a high level and explain how it creates the intended user outcome.

Define Scope and Boundaries. State what the design covers, what it does not cover, and which existing systems or behaviors remain unchanged.

Describe Actors and System Components. Identify relevant users, services, modules, data stores, integrations, and dependencies.

Describe User and System Flows. Explain the normal flow from input or user action through processing and output. Include alternative and failure flows when relevant.

Define Detailed Behavior. Document rules, validation, states, transitions, permissions, side effects, limits, defaults, and error handling.

Describe Data and Interfaces. Include schemas, payloads, APIs, events, persistence, ownership, and data lifecycle when relevant.

Document Technical Decisions and Tradeoffs. Explain important choices, alternatives considered when known, and meaningful limitations.

Document Edge Cases and Failure Handling. Cover invalid input, empty states, retries, timeouts, conflicts, partial failure, recovery, and degraded behavior.

Record Assumptions and Proposed Decisions. Include inferred details and best-judgment gap fills with brief reasoning.

Add Examples only where they materially improve understanding.

End with Open Questions only when unresolved decisions require user or stakeholder input. Do not use open questions as a substitute for reasonable, documented technical decisions.

Use fewer sections for smaller design notes while preserving sequential letter order. When a section is removed, renumber the remaining headers so the final sequence contains no gaps.
