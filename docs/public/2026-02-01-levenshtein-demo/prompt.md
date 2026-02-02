This document defines what constitutes a high-quality computer science tutorial article for the C99 programming language.

Scope and intent
The article is aimed at students who are learning C as part of a computer science or software engineering curriculum. It should balance practical programming skills with conceptual understanding, and it should reflect modern best practices while remaining faithful to the C99 standard.

Core quality traits
- Technically correct: All code, explanations, and terminology strictly conform to the ISO C99 standard. Undefined behavior, implementation-defined behavior, and common pitfalls are explicitly identified and explained.
- Precise and unambiguous: Language is clear, careful, and exact. Vague statements like "C usually does X" are avoided or qualified with standard-based reasoning.
- Incremental and structured: Concepts are introduced in a logical order, from simple to complex, with each section building directly on prior knowledge.
- Minimal but complete: Examples are small enough to understand at a glance, yet complete enough to compile and run without hidden dependencies.
- Pedagogically intentional: Every example, diagram, or exercise exists for a clear teaching purpose and is referenced explicitly in the text.

Educational focus for students
- Mental models: The article emphasizes how C works under the hood, including memory layout, stack vs heap, object lifetimes, and value vs address semantics.
- Reasoning over memorization: Students are guided to understand why constructs behave as they do, rather than memorizing syntax or recipes.
- Transferable skills: Concepts are framed in ways that generalize to other low-level or systems languages (e.g., understanding pointers as addresses, not as a C-only feature).
- Error awareness: Common beginner mistakes (off-by-one errors, misuse of pointers, incorrect assumptions about arrays or strings) are highlighted with explanations of their root causes.

Treatment of the C99 language
- Standard-first approach: Features are explained in terms of the C99 standard, not specific compilers or platforms, unless explicitly stated.
- Explicit constraints: The limits and responsibilities imposed by C (manual memory management, lack of bounds checking, undefined behavior) are treated as core learning objectives, not inconveniences.
- Modern C99 features: The article covers and properly motivates C99 additions such as `//` comments, `stdint.h`, variable-length arrays (with caveats), designated initializers, and `inline`.
- Clear separation of concepts: Distinctions such as declaration vs definition, expression vs statement, object vs type, and array vs pointer are carefully maintained.

Code examples
- Compilable: All code examples compile cleanly under a C99-compliant compiler with warnings enabled.
- Annotated where necessary: Non-obvious lines are briefly explained, either inline or immediately following the code.
- Idiomatic but not clever: Code favors clarity over tricks or micro-optimizations. Cleverness is introduced only after fundamentals are solid.
- Consistent style: Formatting, naming, and conventions are uniform throughout the article to reduce cognitive load.

Exercises and reinforcement
- Active learning: The article includes short exercises that require students to modify, extend, or reason about code.
- Concept-driven tasks: Exercises are designed to test understanding of concepts, not just the ability to reproduce examples.
- Clear expectations: Each exercise states what the student should demonstrate or discover by completing it.

Tone and presentation
- Respectful and encouraging: The article assumes the reader is capable of understanding complex ideas with proper explanation.
- Honest about difficulty: Challenging aspects of C (such as pointer arithmetic or undefined behavior) are not oversimplified.
- No folklore teaching: Myths, cargo-cult rules, and oversimplified slogans (e.g., "arrays are pointers") are avoided or explicitly debunked.

Use of illustrations and diagrams
- Concept-driven visuals: Illustrations are used to explain ideas that are hard to grasp from text alone, such as memory layout, pointer relationships, control flow, and object lifetimes.
- Accuracy over decoration: Diagrams reflect the C abstract machine model and do not imply guarantees that the standard does not provide (for example, exact stack layout or variable ordering unless explicitly stated as illustrative).
- Progressive refinement: Diagrams start simple and are refined as concepts grow more complex, mirroring the incremental structure of the text.

Mermaid diagrams
- Required where appropriate: Mermaid diagrams are used for structured visualizations such as flowcharts, call graphs, state machines, and lifetime timelines.
- Clear mapping to code: Every Mermaid diagram is directly tied to a code example or concept and is referenced explicitly in the surrounding explanation.
- Minimal complexity: Diagrams avoid unnecessary nodes or edges; each element corresponds to a meaningful concept the student must understand.
- Standard constructs only: Mermaid syntax is kept simple and portable to ensure diagrams render consistently across common documentation tools.

Interactive diagrams and visualizations
- Purposeful interactivity: Interactive diagrams are included when they materially improve understanding, such as stepping through pointer dereferences, visualizing array indexing, or tracking memory allocation and deallocation.
- Student control: Learners can pause, step forward/backward, and reset interactions to encourage experimentation and self-paced learning.
- Concept-first design: Interactivity reinforces conceptual understanding rather than acting as a simulation of a specific compiler or hardware implementation.
- Accessibility considerations: Interactive elements include textual explanations or fallbacks so that learning does not depend solely on visual interaction.

Integration with the text
- Explicit references: The article clearly points the reader to diagrams at the moment they are most useful, rather than treating them as optional add-ons.
- Bidirectional explanation: Text explains the diagram, and the diagram reinforces the text; neither stands alone.
- Consistent terminology: Labels in diagrams use the same terms as the prose and code to avoid cognitive mismatch.

Section for students who "did not get it"
This section is explicitly designed for learners who have read the main explanation but still feel confused. Its purpose is remediation through slower pacing, concrete repetition, and guided reasoning, without lowering technical correctness.

Intent and positioning
- Clearly signposted: The section is labeled explicitly (for example, "If this still feels confusing" or "Step-by-step walkthrough") so students can find it without stigma.
- Optional but complete: It can be skipped by confident readers, yet it fully restates the core idea in a self-contained way.
- Respectful tone: Confusion is treated as a normal and expected part of learning C, not as a failure.

Step-by-step walkthrough style
- Single focus: Each walkthrough addresses exactly one concept (for example, pointer dereferencing or array indexing), not multiple ideas at once.
- Explicit starting state: The initial conditions are stated plainly, including variable values, memory assumptions, and what the student is expected to track.
- Linear progression: Execution is shown one step at a time, with no skipped transitions or implied reasoning.
- Cause-and-effect emphasis: Each step answers both "what happened" and "why it happened according to the C99 rules".

Use of concrete representations
- Memory snapshots: Tables or diagrams show memory contents before and after each step, using symbolic addresses when needed.
- Code highlighting: The currently executed line or expression is clearly identified at every step.
- Terminology grounding: Abstract terms (object, value, address, lifetime) are repeatedly tied back to what the student sees in the walkthrough.

Common confusion checkpoints
- Explicit pauses: The walkthrough calls out moments where students commonly get lost and explains the misconception directly.
- Wrong-but-plausible reasoning: Typical incorrect interpretations are shown and then corrected with standard-based explanations.
- Reinforcement questions: Short questions prompt the student to predict the next step before it is revealed.

Progressive simplification
- Smaller examples: Walkthroughs may use simpler code than the main text, even if it is less realistic, to isolate the concept.
- Gradual reintroduction: Once understanding is established, complexity is reintroduced to reconnect with the original example.

Outcome of the walkthrough section
After completing a step-by-step walkthrough, a student should be able to:
- Re-explain the concept in their own words using correct terminology.
- Trace similar code on paper without assistance.
- Identify exactly where their earlier misunderstanding occurred.

Outcome
A high-quality C99 tutorial article leaves students able to:
- Read and reason about unfamiliar C code.
- Write small to medium C programs that are correct, portable, and well-structured.
- Explain, in their own words, how C manages memory and executes programs.
- Recognize and avoid undefined or dangerous behavior through informed reasoning, not guesswork.

Writing style and specification requirements
This document also defines mandatory writing style rules for all C99 tutorial articles that follow it. These rules exist to ensure the article functions as a precise teaching specification and a reliable reference for students.

Purpose and audience
The article is written for students and instructors in computer science and software engineering. It assumes a technical audience. It avoids motivational or conversational language and focuses on clear explanation of behavior, rules, and reasoning.

Tone and language
The tone is strictly professional. Sentences use simple present tense and active voice. Language is direct and concrete. Each sentence communicates a single idea when possible. Hedge words, filler, and vague qualifiers are removed. The text avoids corporate phrasing and abstract claims.

Precision and determinism
All explanations state exact behavior according to the C99 standard. Ambiguity is resolved by defining explicit rules or constraints. The text does not defer decisions to the reader. When behavior depends on the standard, that dependency is stated clearly. When behavior is undefined or implementation defined, the article names it explicitly and explains the consequence.

Structure and progression
Sections follow a stable and predictable structure. Concepts appear in a deliberate order from simple to complex. Later sections do not rely on unstated knowledge. Each section states its scope and stays within it. When a topic is out of scope, the article says so directly.

Formatting discipline
Prose paragraphs are the primary structure. Lists appear only when they materially improve clarity, such as enumerating rules or outcomes. List items remain short and non narrative. Nested lists are avoided. Emphasis is used sparingly and only to disambiguate meaning.

Integration with examples and diagrams
Text, code, and diagrams form a single explanation. The article introduces a concept in text, anchors it with a code example, and reinforces it with a diagram when helpful. Each element refers to the others using consistent terminology. No diagram or example appears without a clear explanatory role.

Remedial sections alignment
Step by step walkthrough sections follow the same writing rules as the main text. They slow the pace but do not relax correctness or precision. Each step describes observable state changes using exact terms. The walkthrough ends by restating the rule or concept in a concise, formal form.
