# Coding Agent Q&A Log

---

A00 Thread Index

---

Updated: 2026-06-11 09:00 America/Los_Angeles

Purpose: This file records questions asked to a coding agent and the agent's explicit answers. The same substantive content is maintained in `index.html` with richer browser formatting.

Topic T20260611-001: Maintaining the publication log. Status: answered. Tags: workflow, synchronization, documentation.

Topic T20260611-002: Formatting readable public questions. Status: answered. Tags: editing, publishing, clarity.

Topic T20260611-003: Supporting rich HTML answers. Status: answered. Tags: HTML, embedded-content, accessibility.

Topic T20260611-004: Defining a simple HTML website workflow. Status: answered. Tags: HTML, CSS, dependencies, frameworks, workflow, planning, tools, validation.

Topic T20260611-005: Preventing task-local changes and missing review work. Status: answered. Tags: agent-behavior, documentation, JSDoc, refactoring, duplication, review, validation, TDD, methodologies.

Topic T20260611-006: Choosing dependency inversion and injection across languages. Status: answered. Tags: architecture, dependency-injection, dependency-inversion, inversion-of-control, CSharp, JavaScript, C.

---

B00 Topic T20260611-001: Maintaining the Publication Log

---

Topic ID: T20260611-001

Asked: 2026-06-11 09:00 America/Los_Angeles

Status: answered

Tags: workflow, synchronization, documentation

Original question:

How will you keep `index.md` and `index.html` updated when I ask a question?

Published question:

How will the coding agent maintain the Markdown and HTML Q&A logs in parallel?

Answer:

The agent will update `index.md` and `index.html` in the same work session whenever it accepts a question for the public log. The Markdown file will remain plain and easy to review in source control. The HTML file will contain the same substantive content, but it may use cards, tags, metadata rows, callouts, tables, and other semantic HTML to improve browser readability.

The agent will treat each question as a topic thread. It will assign a stable topic ID, capture the asked date and time, preserve the original question or a faithful excerpt, write a clearer public question, provide a direct answer, and record references when references are used.

The agent will verify that both files contain matching topic IDs, titles, dates, statuses, tags, questions, answers, and references. Differences caused only by presentation format are acceptable. Differences that change meaning, omit content, or create stale information must be corrected.

References:

AGENTS.md sections B00, C00, K00, and L00.

---

C00 Topic T20260611-002: Formatting Readable Public Questions

---

Topic ID: T20260611-002

Asked: 2026-06-11 09:05 America/Los_Angeles

Status: answered

Tags: editing, publishing, clarity

Original question:

Can you organize my original question so it is more readable and suitable for publishing online?

Published question:

How should the coding agent convert a raw user question into a readable public question without changing its intent?

Answer:

The agent will keep the original user question available for context and then create a separate public version. The public version may improve grammar, remove filler, clarify ambiguous phrasing, split long sentences, and name the requested output more directly.

The agent will not change the meaning of the question. If the raw question contains ambiguity that affects the answer, the published entry will either preserve the ambiguity or state the assumption used by the answer. If the question is too broad, the agent may split it into separate topic entries, but only when the split improves readability and does not distort the user's request.

References:

AGENTS.md sections D00 and E00.

---

D00 Topic T20260611-003: Supporting Rich HTML Answers

---

Topic ID: T20260611-003

Asked: 2026-06-11 09:10 America/Los_Angeles

Status: answered

Tags: HTML, embedded-content, accessibility

Original question:

Can `index.html` support richer formatting and extra HTML while `index.md` stays mostly text-based?

Published question:

How will the HTML log support rich answer content while keeping the Markdown log readable?

Answer:

The HTML log will support richer presentation through semantic sections, topic cards, metadata chips, code blocks, callouts, tables, and optional embedded HTML containers. Rich HTML fragments should be placed inside clearly marked `.html-embed` containers so the source remains understandable and maintainable.

The Markdown log will keep the same substantive content in a flatter form. When the HTML file contains a visual component, the Markdown file will describe the same information in text or use a simple Markdown table when that is the clearest plain-text representation.

Example plain-text representation:

| Field | Required handling |
| --- | --- |
| Topic ID | Stable and shared across both files |
| Timestamp | Include date, time, and timezone when known |
| Answer | Direct, explicit, and publishable |
| HTML extras | Allowed in `index.html`; summarized or flattened in `index.md` |

References:

AGENTS.md sections G00, H00, I00, and J00.

---

E00 Topic T20260611-004: Defining a Simple HTML Website Workflow

---

Topic ID: T20260611-004

Asked: 2026-06-11 07:20 America/Los_Angeles

Status: answered

Tags: HTML, CSS, dependencies, frameworks, workflow, planning, tools, validation

Original question:

If I ask you to create a simple HTML website about a topic such as cats, what does that mean to you in detail? What workflow would that trigger, how would you plan it, which tools would you consider first, and how would you work on the website? Make all defaults and assumptions explicit.

Published question:

When asked to create a simple topic-based HTML website, what exact scope, defaults, workflow, tools, validation steps, and assumptions will the coding agent use?

Answer:

I will interpret "create a simple HTML website about cats" as a request to produce a complete, working, locally viewable static website, not merely an explanation, mockup, or code sample. Unless the user limits the request to planning or discussion, the workflow will proceed through repository inspection, planning, implementation, and validation in the current work session.

Default deliverable:

| Decision | Default |
| --- | --- |
| Site type | One-page static website |
| Main file | `index.html` |
| Styling | CSS, embedded in `index.html` for a very small standalone project; an existing stylesheet is reused when the repository already has one |
| Behavior | No JavaScript unless an interaction genuinely requires it |
| Frameworks | No framework, package manager, build step, or dependency unless the repository already requires one |
| Content | Original, concise topic content with a clear page title, introduction, and a few useful sections |
| Layout | Responsive on narrow and wide screens |
| Accessibility | Semantic headings and landmarks, keyboard-usable controls, meaningful link text, sufficient contrast, and alternative text for informative images |
| Assets | Prefer existing repository assets; otherwise use lightweight CSS or original assets when suitable |
| External services | None by default |
| Browser support | Current mainstream desktop and mobile browsers |
| Completion | Files implemented and relevant checks actually run |

"Simple" describes limited technical and content scope. It does not mean unfinished, visually careless, inaccessible, broken on mobile, or filled with placeholder text. My default quality target is a small but complete page with deliberate typography, spacing, color, hierarchy, and topic-appropriate content.

Workflow:

1. Interpret the request. I identify the topic, requested audience, explicit features, output location, and constraints. I separate those facts from assumptions. If a missing choice is low risk, I use the defaults documented here. I ask a question only when proceeding would create a meaningful risk of building the wrong thing and the answer cannot be discovered from the repository.
2. Inspect the workspace first. I read applicable instruction files, list relevant files, inspect the current HTML/CSS/JavaScript and assets, and check version-control status. This determines whether I should create a standalone page or extend an established design system.
3. Define a small content and interaction plan. For a cat site, a reasonable default structure would be a hero or introduction, two or three short informational sections, and a footer. I decide whether any interaction adds real value. I do not add menus, animations, forms, carousels, or JavaScript merely to make the page appear more substantial.
4. Choose the visual direction. I select a restrained palette, type scale, spacing system, content width, and responsive behavior appropriate to the topic. For cats, that might mean warm neutral colors and rounded image or card treatments. This is a design choice, not an assumed user requirement, and can be overridden.
5. Decide whether research or generated assets are needed. A generic decorative cat page can be created without web research. I browse when the page needs current facts, precise claims, source attribution, or external material. I consider image search when an existing licensable image is appropriate, image generation when an original bitmap would materially improve the page, and CSS/SVG-like code-native artwork when a lightweight visual is sufficient. I do not introduce external assets without considering licensing, attribution, privacy, performance, and link durability.
6. Implement the smallest complete solution. I write semantic HTML, scoped and maintainable CSS, and only necessary JavaScript. I follow repository conventions, preserve unrelated user changes, keep links and paths portable for static hosting, and avoid unnecessary abstractions or dependencies.
7. Validate the result. At minimum I check that required files exist, HTML structure is coherent, local links and asset paths resolve, and no obvious placeholder or debug content remains. Depending on available tools and project risk, I also run the repository's existing tests or linters, inspect the page in a browser or screenshot, test narrow and wide viewport behavior, verify keyboard interaction, and review console errors. I report checks as successful only when they actually ran.
8. Finish with an explicit report. I name the files changed, summarize the implemented sections and behavior, list the validation performed, and disclose anything not tested, any external assets used, and any assumptions that materially shaped the result.

Tool selection:

| Tool or capability | When I use it |
| --- | --- |
| Repository search and shell tools such as `rg`, `sed`, and `git status` | First, to understand instructions, files, conventions, and existing changes |
| File editing tools | To make minimal, reviewable changes to project files |
| Existing build, lint, or test commands | When the repository defines them |
| Browser rendering, screenshots, or image inspection | To evaluate actual layout, responsiveness, overflow, and visual defects when available |
| Web research | Only when current or source-dependent information is needed |
| Image search | When a suitable existing image is needed and usage conditions can be respected |
| Image generation | When an original bitmap asset is useful and consistent with the request |

Facts, assumptions, and override points:

- Fact: If the request says only "simple HTML website," the exact audience, visual style, content depth, and feature set are unspecified.
- Assumption: The desired result is a static, one-page, dependency-free site that can be opened directly or served by static hosting.
- Assumption: I may write short original copy about the supplied topic, but I will avoid unsupported specialist claims.
- Assumption: Visual polish and responsive behavior are part of a complete website even when they are not separately requested.
- Decision: I will favor semantic HTML and CSS over a framework because a framework would add cost without solving a stated need.
- Open question only when relevant: whether the user requires a particular audience, brand, visual reference, factual source set, asset license, framework, browser target, deployment environment, or interaction.

Any explicit user instruction overrides these defaults. For example, "use only one HTML file," "use Bootstrap," "do not use images," "make it suitable for children," "copy this supplied layout," or "give me a plan only" changes the corresponding workflow decision. I will state the changed assumptions before or while implementing them rather than silently substituting my own preferences.

Follow-up question:

Asked: 2026-06-11 07:27 America/Los_Angeles

Why is dependency-free the default for a simple HTML website? Is that required by a separate instruction? Could the wording or context of a request cause the agent to choose Tailwind or another established CSS dependency even when the user does not explicitly request dependencies?

Follow-up answer:

Dependency-free is a fallback default, not an unconditional rule and not a judgment that dependencies are undesirable. The more important rule is to inspect the repository and choose the smallest approach that fits the requested outcome and the project's existing conventions.

No instruction in this project's `AGENTS.md` says that every website must be dependency-free. Its requirement for "minimal embedded CSS" applies to this Q&A publication's own `index.html`, not to every hypothetical website discussed in the log. The dependency-free statement in the original answer was my implementation decision based on an otherwise unqualified request for a "simple HTML website."

General coding-agent instructions also influence the decision. They direct me to prefer the repository's existing patterns, frameworks, and local APIs; keep edits closely scoped; choose conservatively when implementation details are open; and add an abstraction only when it removes real complexity or matches an established pattern. Those principles do not prohibit Tailwind. In a repository that already uses Tailwind, introducing plain standalone CSS may be the less appropriate choice because it would ignore the established toolchain and design conventions.

Why dependency-free is a reasonable fallback for an isolated one-page site:

| Consideration | Plain HTML and CSS | Added CSS dependency |
| --- | --- | --- |
| Setup | Opens directly with no installation or build | May require a package install, build command, configuration, or CDN |
| Failure surface | Local files are sufficient | Package versions, generated output, network availability, or CDN policy may matter |
| Maintenance | Few files and concepts for a small page | Dependency updates and framework conventions become part of maintenance |
| Value on a tiny page | Native CSS can express the required layout directly | The framework may save little code for a unique one-page design |
| Portability | Easy to place on static hosting or open locally | Depends on how the framework is integrated |

This is a cost-benefit decision. Popularity alone is not enough reason to add a dependency. A dependency should solve a concrete problem: consistency with an existing codebase, repeated components, a required design system, faster assembly of conventional UI, team familiarity, or maintainable reuse across multiple pages.

Tailwind is also not a complete predefined visual design by itself. It provides utility classes and design tokens, but the implementation still needs decisions about layout, typography, spacing, colors, components, responsive behavior, and accessibility. A component library or an existing house design system can provide more predefined visual behavior than Tailwind alone.

Signals that can cause me to select a dependency without the user literally saying "use dependencies":

| Request or repository signal | Likely interpretation |
| --- | --- |
| The existing project already uses Tailwind, Bootstrap, Pico CSS, a component library, or another styling system | Continue using that system unless there is a concrete reason not to |
| "Add this page to the existing app" or "match the rest of this site" | Reuse the app's current framework, tokens, and components |
| "Build a dashboard/admin interface with many standard controls" | Consider a component system because repeated controls and states justify it |
| "Create several pages with a reusable design system" | Consider shared CSS architecture, Tailwind, or components rather than isolated embedded CSS |
| "Make a rapid prototype using conventional components" | A lightweight CSS framework or component library may reduce implementation time |
| "Use the provided starter/template" | Follow the starter's dependencies and conventions |
| The repository has `package.json`, Tailwind configuration, framework imports, and established utility classes | Treat those as strong evidence that the dependency is part of the intended architecture |
| "It must work by opening the HTML file directly," "single file," or "no build step" | Prefer dependency-free local HTML/CSS, unless a specifically allowed CDN dependency clearly fits |

Some wording is suggestive but not decisive. "Modern," "professional," "beautiful," or "responsive" does not by itself require Tailwind; native CSS can meet those requirements. "Simple" also does not prohibit Tailwind when Tailwind is already the project's simplest established path.

Therefore, my practical selection order is:

1. Follow explicit user constraints.
2. Follow the repository's established stack and local instructions.
3. Infer requirements from the requested scale, reuse, interactions, delivery method, and maintenance context.
4. Compare the concrete benefit of a dependency with its setup and maintenance costs.
5. When no other signal exists for a standalone one-page site, use semantic HTML and native CSS as the fallback.

The original answer should therefore be read more precisely as: "For an isolated, one-page website in a repository with no established frontend stack and no feature that benefits from a framework, dependency-free is the default." It is not: "Every simple website must be dependency-free."

References:

- `AGENTS.md` in this project, especially its requirements for explicit answers, implementation details, references, integrity, and synchronized publication.
- `AGENTS.md` section H00 for the minimal embedded CSS rule specific to this publication's `index.html`.
- General coding-agent engineering instructions governing existing repository patterns, conservative choices, scoped changes, and justified abstractions.
- Repository files and commands would be added as references when a real website implementation relies on them.

---

F00 Topic T20260611-005: Preventing Task-Local Changes and Missing Review Work

---

Topic ID: T20260611-005

Asked: 2026-06-11 07:37 America/Los_Angeles

Status: answered

Tags: agent-behavior, documentation, JSDoc, refactoring, duplication, review, validation, TDD, methodologies

Original question:

Why do coding agents sometimes focus narrowly on completing the requested code change while missing related work? Examples include changing a component identifier without updating documentation, adding functions without the JSDoc used by neighboring functions, introducing copy-pasted variations instead of reusing or refactoring existing methods, and failing to review or refactor their own output. Why does this happen, and why is review and refactoring not automatic?

Published question:

Why can a coding agent complete the immediate implementation while overlooking related documentation, established JSDoc conventions, duplication, self-review, and appropriate refactoring, and what process reduces those omissions?

Answer:

The short answer is that coding agents tend to optimize for the task as represented in their active context and completion criteria. If the task is interpreted as "make this behavior work," the agent may treat a passing implementation and tests as the finish line unless it deliberately performs an impact analysis and a separate review pass. That narrow completion is understandable, but when directly affected documentation, established API comments, or obvious duplication are omitted, the work is incomplete.

This behavior is not evidence that the agent has searched and understood the entire codebase and then consciously rejected the related work. Usually it means one or more of the following happened:

| Cause | How it creates the omission |
| --- | --- |
| Task-local interpretation | The agent translates the request into the smallest explicit code change and does not expand the definition of done to include dependent artifacts. |
| Incomplete repository discovery | It reads the target file and tests but does not search for the old identifier, related documentation, analogous functions, generated files, or usage examples. |
| Limited active context | A repository can contain more material than is practical to inspect at once. Files not searched for or loaded do not reliably influence the implementation. |
| Weak convention inference | A few nearby examples may be noticed as incidental rather than recognized as a repository-wide requirement, especially when no lint rule or instruction enforces them. |
| Premature stopping | Once the requested behavior works and tests pass, the agent may stop without a distinct diff review, documentation review, or duplication scan. |
| Local code generation | Producing a variation beside existing code is often easier and lower risk in the moment than proving that several paths share a valid abstraction. |
| Scope and regression caution | Refactoring existing code can enlarge the change, alter behavior, conflict with unrelated user work, or require tests that are absent. An agent may avoid it to keep the patch scoped. |
| Ambiguous ownership | Documentation, generated references, public API declarations, examples, and implementation code may live in separate areas without an explicit map connecting them. |
| Verification bias | Automated tests usually verify runtime behavior, not whether prose, JSDoc, examples, naming, architectural consistency, or maintainability were updated. |

Why documentation can be missed:

Changing a component identifier is not only a local edit when that identifier is part of a documented interface, configuration example, selector, migration guide, or user instruction. A complete change should begin with a repository-wide search for the old identifier and classify every match as implementation, test, documentation, example, generated output, or intentionally historical text. If the agent only follows compiler errors or failing tests, documentation can remain stale because prose normally produces neither.

Documentation should not be updated mechanically in every case. Historical changelogs, migration notes, fixtures, compatibility aliases, and examples of old input may intentionally retain the previous identifier. The required work is impact analysis and deliberate classification, not blind replacement.

Why JSDoc can be omitted:

If neighboring public functions consistently have JSDoc with descriptions, parameter types, return types, thrown errors, side effects, or examples, that pattern is evidence of the local API contract. A new comparable function should normally follow it even when the language runtime does not require comments. Omitting it often means the agent focused on executable behavior and failed to treat documentation conventions as part of correctness.

There are legitimate exceptions. A repository may document only exported APIs, use TypeScript types instead of JSDoc for internal functions, generate API documentation from another source, or intentionally avoid comments that merely restate code. The agent should inspect representative neighboring functions and repository instructions before deciding.

Why copy-paste appears instead of refactoring:

Copying a working path and changing a few details is locally predictable. Refactoring requires a stronger proof: the duplicated parts must represent the same concept, their differences must be expressible without confusing conditionals, callers must preserve behavior, and tests must cover the shared contract. Without that proof, an abstraction can be worse than duplication.

However, repeated copy-pasted methods are not automatically acceptable. The agent should search for structurally similar code before and after implementation. It should compare invariants, inputs, outputs, errors, side effects, lifecycle, and likely future changes. If the code shares a stable concept and the abstraction makes callers clearer, refactoring is justified. If similarity is superficial or the behavior is still evolving independently, keeping some duplication can be the more maintainable decision. The decision should be explicit rather than accidental.

Why self-review and refactoring are not always automatic:

Generation and review are different modes of work. During implementation, attention is directed toward constructing a path that satisfies the request. A useful review requires stepping back, reading the complete diff, searching beyond edited files, and challenging the chosen design. If that phase is not included in the agent's internal definition of done, tool budget, repository instructions, or user request, it may be shortened or skipped.

Automatic refactoring also has real risks:

- It can change unrelated behavior and increase the regression surface.
- It can turn a narrow request into an architectural rewrite.
- It can modify code owned by another subsystem or overlap with uncommitted user changes.
- It can create an abstraction from two examples before the stable pattern is known.
- It can make review harder by mixing required behavior with broad cleanup.
- It may be unsafe when tests do not characterize existing behavior.

Therefore, "always refactor everything nearby" is not a sound rule. A better rule is: always review for duplication and design problems; perform a refactor when it is necessary for the requested change, clearly reduces meaningful duplication or complexity, follows repository patterns, and can be verified. Otherwise, report the observed issue or leave a tightly scoped follow-up rather than silently expanding the patch.

A stronger default workflow:

1. Define the behavioral change and its affected contract: names, public APIs, configuration, examples, documentation, types, tests, generated artifacts, and compatibility concerns.
2. Read repository instructions and inspect representative neighboring implementations before editing.
3. Search globally for the changed identifier, API, component, documentation references, and similar implementations.
4. Write an impact checklist identifying which files should change and which matching files should intentionally remain unchanged.
5. Implement using existing conventions, including JSDoc or equivalent API documentation where comparable code uses it.
6. Run focused tests, then the broader relevant validation defined by the repository.
7. Read the complete diff as a reviewer rather than as its author. Check naming, errors, edge cases, public contracts, comments, docs, examples, tests, and unrelated edits.
8. Perform a duplication and abstraction pass. Search for analogous methods and decide whether to reuse, extract, consolidate, or deliberately retain duplication.
9. Re-run tests and documentation/build checks after any refactor.
10. Report changed files, checks run, related artifacts updated, deliberate non-changes, remaining risks, and any refactor considered but rejected.

Useful repository instructions can make these expectations durable:

```md
For every behavior or identifier change:
- Search the repository for affected code, tests, documentation, examples, types,
  configuration, and generated artifacts.
- Update all affected references, or state why a matching reference remains unchanged.
- Follow documentation conventions used by comparable nearby APIs, including JSDoc.
- Before completion, review the full diff and search for structurally similar code.
- Refactor meaningful duplication when a shared abstraction is clear and testable.
- Do not broaden the patch into speculative cleanup; report deferred refactors explicitly.
- Run relevant tests, lint, type checks, documentation checks, and builds.
- In the completion note, list validation performed and anything not verified.
```

A useful task request can also say:

```text
Implement this change end to end. Treat documentation, examples, JSDoc/types,
tests, configuration, generated references, and usages of renamed identifiers as
part of the change. Before finishing, review the complete diff and search for
similar implementations or new duplication. Refactor when the shared abstraction
is clear and covered; otherwise explain why duplication remains. Report every
check run and any affected artifact intentionally left unchanged.
```

These instructions reduce omissions, but they cannot guarantee that none will occur. The reliable control is a layered process: repository conventions, explicit completion criteria, search-based impact analysis, automated lint and documentation checks where possible, tests, and a final diff review. Important conventions such as required JSDoc are more dependable when enforced by tooling rather than left only as an inferred style.

Facts, decisions, and limits:

- Fact: Passing tests do not prove that documentation, examples, JSDoc, or architecture are correct.
- Fact: An agent cannot reliably account for repository content it did not inspect or search.
- Decision: Directly affected documentation and established public API documentation are part of implementation completeness.
- Decision: A duplication review should be automatic; a broad refactor should remain evidence-based and proportionate.
- Limit: No prompt can replace tests, lint rules, documentation validation, code ownership boundaries, and human review for high-risk changes.

Follow-up question:

Asked: 2026-06-11 07:43 America/Los_Angeles

How were the risks of automatic refactoring identified? What reasoning and knowledge sources support claims such as increased regression surface, accidental architectural expansion, interference with unrelated changes, premature abstraction, harder review, and unsafe changes when tests are missing?

Follow-up answer:

I cannot provide a private hidden chain-of-thought transcript or reconstruct internal token-by-token reasoning. I can provide the useful substitute: the conclusion, the evidence categories used, the decision method, and a checkable explanation connecting each claimed risk to its source.

The earlier list was not quoted from one paper or one repository file. It was a synthesis from three sources:

1. General software-engineering knowledge: commonly established ideas about change scope, regression risk, abstraction, coupling, reviewability, test coverage, and incremental delivery.
2. Active coding-agent instructions: explicit rules in this session to keep changes closely scoped, preserve unrelated user work, avoid unnecessary abstractions, use tests proportionate to risk, follow existing repository patterns, and avoid destructive edits.
3. Task-specific inference: applying those principles to the proposed policy "automatically refactor nearby code" and examining what additional files, contracts, behavior, ownership, and verification that policy could affect.

I did not inspect or cite an external empirical study before writing the earlier answer. Therefore, those claims should be understood as engineering risk analysis, not as quantified findings such as "automatic refactoring causes a particular percentage of regressions." I also cannot identify exact training documents from which a model learned each general principle. Model training produces distributed knowledge rather than a retrievable citation trail for every statement. When exact attribution or current empirical evidence is required, I should research and cite specific primary sources instead of presenting general knowledge as source-specific evidence.

Risk-to-source mapping:

| Risk stated earlier | Basis for identifying it | Type of support |
| --- | --- | --- |
| A refactor can change unrelated behavior and increase regression surface | A refactor that edits more branches, callers, modules, or shared contracts creates more behavior that could differ and more paths requiring verification. This follows from change-impact and regression-testing principles. | General engineering knowledge plus direct inference from the enlarged change set |
| A narrow request can become an architectural rewrite | Extracting shared layers, changing interfaces, moving ownership, or standardizing several implementations can exceed the requested behavior and create new design decisions. | Scope-management principle plus inference from common refactoring operations |
| A refactor can overlap with unrelated user changes | The active instructions explicitly state that the worktree may be dirty, existing changes may belong to the user, and those changes must not be reverted. Editing wider areas increases the chance of touching those changes. | Directly supported by active coding-agent instructions |
| An abstraction can be premature | Two pieces of similar syntax do not necessarily represent one stable concept. If their invariants or reasons to change differ, a shared abstraction can add conditionals and coupling. | General abstraction and cohesion principles; structural inference |
| Mixing cleanup with the requested change makes review harder | A reviewer must distinguish behavior required by the task from behavior moved or rewritten for cleanup. A larger, multi-purpose diff contains more hypotheses to verify. | Code-review and incremental-change principles; direct inference from diff size and purpose count |
| Refactoring may be unsafe without characterization tests | A behavior-preserving transformation requires knowledge of existing behavior. If tests or another reliable specification do not cover that behavior, unnoticed differences are harder to detect. | Refactoring and regression-testing principles |

Explicit decision method:

The reasoning method can be made explicit without exposing hidden internal deliberation:

1. Identify the proposed action: refactor code beyond the minimum behavioral edit.
2. Identify what the action expands: files, callers, interfaces, ownership boundaries, behavior paths, and generated artifacts.
3. Identify required invariants: externally visible behavior, compatibility, errors, side effects, performance expectations, and public contracts.
4. Identify available evidence that those invariants will hold: tests, types, documentation, specifications, representative usages, and repository conventions.
5. Identify conflicts with active constraints: task scope, uncommitted user changes, subsystem ownership, delivery time, or prohibited edits.
6. Estimate reversibility and detectability: how easily a mistake can be isolated, observed, tested, and reverted.
7. Decide whether the refactor's concrete reduction in duplication or complexity justifies the additional change and verification surface.

For example, suppose a requested feature adds a third function resembling two existing functions. A duplication review finds the similarity. Before extracting a shared helper, the agent should compare:

- whether all three functions have the same inputs and output contract;
- whether they handle errors and side effects identically;
- whether they are expected to evolve for the same reason;
- whether a helper would reduce logic or merely move conditionals into one place;
- whether tests cover every caller before and after extraction;
- whether the extraction crosses module ownership or edits unrelated user changes.

If these checks support a stable shared concept, refactoring is justified. If they reveal different contracts or weak verification, the agent should avoid a broad extraction, keep the requested change scoped, and report the duplication as a considered decision or follow-up.

Confidence and limits:

The confidence level also differs by claim:

| Claim category | Confidence basis |
| --- | --- |
| Direct instruction claim | High when the instruction is present in the active session or repository file |
| Repository-specific claim | High only after the relevant code, tests, documentation, and worktree state are inspected |
| General engineering risk | A credible default risk, but not proof that the risk will materialize in a specific patch |
| Quantitative or comparative claim | Requires external evidence or measurements; none were used in the earlier answer |

So the risks were not invented arbitrarily, but they were also not the result of a cited experiment performed for this question. They were a qualitative risk model built from software-engineering principles, explicit operating constraints, and the logical consequences of expanding a code change. For a real refactoring decision, that model must be tested against the actual repository rather than treated as a reason to avoid refactoring by default.

Follow-up question:

Asked: 2026-06-11 07:49 America/Los_Angeles

What specific software-engineering methodologies and practices inform the agent's decisions about change scope, regression risk, structure, coupling, reuse, test coverage, refactoring, and incremental delivery? Which approaches are preferred or disfavored, when would each be selected, and would the agent independently use TDD in a tested project when the user did not explicitly request test-first development?

Follow-up answer:

I do not apply one complete methodology to every coding task. My default is a repository-native, incremental, test-backed engineering workflow assembled from compatible practices. The repository's established process and explicit user instructions take priority; then I select techniques according to uncertainty, risk, feedback speed, reversibility, and the type of change.

It is important to separate levels:

| Level | Examples | What it controls |
| --- | --- | --- |
| Values and principles | Agile, Lean | How to think about value, feedback, change, waste, and improvement |
| Team delivery frameworks | Scrum, Kanban | How teams plan, limit, inspect, and deliver work |
| Engineering practice systems | Extreme Programming (XP), Continuous Integration | How code is developed, integrated, tested, reviewed, and kept changeable |
| Task-level techniques | TDD, characterization testing, property-based testing, refactoring | How a particular behavior or design change is implemented and verified |
| Design heuristics | cohesion, coupling, SOLID, DRY, YAGNI, separation of concerns | How structure is evaluated; these are not complete delivery methodologies |
| Formal techniques | specifications, model checking, proof, static analysis | How selected properties are described and verified with greater rigor |

Methodologies and practices I am aware of include iterative and incremental development, Agile principles, Lean software development, Scrum, Kanban, XP, TDD, behavior-driven development, acceptance-test-driven development, Continuous Integration, trunk-based development, code review, refactoring, characterization testing, property-based testing, mutation testing, domain-driven design, Clean Architecture, hexagonal architecture, SOLID, functional-core/imperative-shell design, formal specification, model checking, and proof-oriented methods. Awareness does not mean each should be applied to every task.

Preferred default practices:

| Practice | Default preference | Why |
| --- | --- | --- |
| Repository-native development | Very high | Existing conventions, tools, architecture, and team expectations are usually stronger evidence than a generic methodology preference. |
| Small incremental changes | Very high | They shorten feedback, isolate failures, improve reviewability, and make rollback easier. Agile principles favor frequent delivery; Scrum describes iterative, incremental work; Kanban favors evolutionary change. |
| Search-based impact analysis | Very high | It connects code changes to documentation, tests, examples, configuration, public contracts, and generated artifacts. |
| Automated tests proportional to risk | Very high | Tests provide executable feedback, but the appropriate level and amount depend on the failure cost and existing architecture. |
| Full-diff self-review | Very high | It catches task-local omissions, accidental edits, duplication, naming problems, and incomplete contracts that a focused test may not reveal. |
| Refactor after behavior is protected | High | This preserves the useful part of red-green-refactor: improve structure while fast feedback guards behavior. |
| Continuous integration practices | High where supported | A self-testing build and frequent integration expose conflicts and regressions early. |
| Lean/YAGNI restraint | High | Do not build unused abstractions or process artifacts; spend effort on verified user value and maintainability needs. |
| Explicit contracts and formal modeling | Selectively high | They are valuable when state, concurrency, security, money, safety, or protocol correctness makes informal reasoning insufficient. |

What I do not prefer as a default:

- Methodology dogmatism: applying TDD, Scrum, Clean Architecture, SOLID, or any other named approach without checking whether it fits the repository and problem.
- Big-bang rewrites for a narrow request: they delay feedback and combine too many behavioral hypotheses in one change.
- Test-count or coverage-percentage optimization without risk analysis: high coverage can still miss important assertions, while some generated or declarative code gains little from unit tests.
- DRY at any cost: similar syntax is not enough evidence for a shared abstraction; independent concepts can be coupled accidentally.
- Speculative generality and architecture astronautics: interfaces, layers, factories, and extension points should have a concrete reason.
- Test-after implementation as an unquestioned habit: it can confirm the implementation rather than challenge the intended behavior.
- TDD as ceremony: a test written first but incapable of failing for the intended reason does not provide the design or verification benefit of TDD.
- Process theater: labels, meetings, and artifacts that do not improve feedback, quality, flow, or decisions.

These are least-preferred defaults, not universal prohibitions. A planned, sequential approach can be appropriate for a fixed migration with externally mandated stages. A broad rewrite can be justified when incremental migration is technically impossible or more dangerous. High coverage requirements can be correct in regulated or high-consequence systems.

How I select practices for a task:

1. Follow explicit user and repository requirements. If the project requires TDD, generated documentation, a particular architecture, or specific gates, those are part of the definition of done.
2. Classify the work: defect correction, new behavior, refactor, migration, exploratory spike, UI change, infrastructure/configuration, performance work, concurrent protocol, or high-assurance logic.
3. Identify the observable contract and failure cost.
4. Inspect the existing test architecture, test speed, determinism, conventions, and available seams.
5. Choose the shortest feedback mechanism capable of disproving an incorrect implementation.
6. Implement in small increments and preserve a working state when practical.
7. Review structure, coupling, reuse, documentation, and the full diff.
8. Increase rigor when consequences, irreversibility, concurrency, security, or uncertainty increase.

When I would choose TDD without being explicitly asked:

Yes, I may use TDD at the task level even if the user did not say "use TDD," but I should not silently impose a repository-wide TDD conversion. I am most likely to write the test first when:

- fixing a reproducible bug, because a failing regression test demonstrates the defect and later protects the fix;
- adding a pure function or domain rule with clear inputs and outputs;
- extending a public API whose contract can be expressed before its implementation;
- handling edge cases where examples can drive the design;
- refactoring behavior that first needs characterization;
- working in a repository with fast, deterministic tests and an established pattern for the relevant test level.

For a bug fix, the preferred sequence is often:

1. Reproduce the bug in the smallest relevant test.
2. Confirm that the new test fails for the expected reason.
3. Implement the smallest correct fix.
4. Confirm the focused and broader relevant tests pass.
5. Refactor if the passing implementation exposes meaningful duplication or poor structure.
6. Re-run validation and review the complete diff.

That is effectively red-green-refactor even when the project does not advertise itself as a TDD project.

When I would not automatically insist on strict test-first development:

| Situation | Likely approach |
| --- | --- |
| Existing behavior is poorly understood in legacy code | Add characterization tests before refactoring; the first tests may document current behavior rather than desired behavior. |
| The test harness is absent or disproportionately expensive | First establish the smallest useful test seam, or use another executable check and explain the limitation. |
| Exploratory prototype or technical spike | Learn with a disposable experiment, then discard or stabilize it and add tests before treating it as production code. |
| Primarily visual UI work | Use component or browser tests for behavior and visual inspection for presentation; strict unit-test-first CSS is usually not useful. |
| Build, packaging, or configuration change | Prefer an integration/build check that exercises the actual artifact over artificial unit tests. |
| Generated code or declarative schema | Test the generator, validation rules, or resulting behavior rather than every generated line. |
| Nondeterministic, hardware-bound, or external-system behavior | Design seams, simulators, contract tests, or controlled integration tests before claiming a red-green cycle. |
| Trivial mechanical change already enforced by compiler or schema validation | Run the strongest existing automated check; adding a bespoke test may add no information. |

The presence of tests alone is not enough to select TDD. I also look for a clear contract, a test level that can fail meaningfully, reasonable execution speed, determinism, and a test style consistent with the repository. If these conditions hold, test-first is often the strongest default for bug fixes and domain behavior. If they do not, forcing TDD can produce brittle mocks, tests coupled to implementation details, or ceremony without useful feedback.

How other methodologies influence a coding task:

| Approach | What I adopt | When it is useful | What I do not assume |
| --- | --- | --- | --- |
| Agile principles | Frequent useful increments, feedback, adaptation, working software | Requirements can evolve and feedback is available | That "Agile" eliminates documentation, planning, architecture, or discipline |
| Lean | Value focus, small batches, reduced rework and waste, continuous improvement | Process or implementation contains waiting, excess handoffs, unused work, or repeated defects | That reducing waste means minimizing all safeguards or documentation |
| XP | Testing, simple design, refactoring, CI, collective conventions, close feedback | Fast-changing software with strong automated feedback and collaborative development | That a single agent can independently perform team practices such as pairing or an on-site customer |
| TDD | Test list and red-green-refactor at a small behavioral increment | Clear executable contracts and fast deterministic tests | That every file or change benefits from unit-test-first development |
| Scrum | Incremental goals, definition of done, inspection and adaptation | Coordinating a product team over repeated delivery cycles | That Scrum specifies how an individual function should be coded |
| Kanban | Visualize work, limit work in progress, manage flow, explicit policies | Continuous streams of maintenance or mixed-priority work | That a board itself improves engineering quality |
| Domain-driven design | Domain language, boundaries, models, context awareness | Complex business rules and multiple domain concepts | That every CRUD application requires aggregates, repositories, and elaborate layers |
| Formal methods | Precise state models, invariants, model checking, proof where warranted | Distributed algorithms, concurrency, protocols, authorization, financial or safety invariants | That formalization is cost-effective for ordinary presentation or low-risk glue code |

TDD and refactoring:

TDD explicitly includes refactoring, but that does not mean "perform any desirable refactor anywhere in the repository after every green test." The refactor step improves the design of the currently understood and protected behavior while keeping tests green. It is still bounded by the available test evidence, task scope, and architectural context.

TDD also does not automatically solve the documentation and task-locality problems described in this topic. A test-first loop can still omit README updates, JSDoc, examples, configuration, migrations, generated artifacts, and repository-wide identifier references. TDD strengthens behavioral feedback; it does not replace impact analysis or final review.

Practical default:

My practical default can therefore be summarized as:

```text
Inspect first.
Follow the repository.
Define the observable contract.
For a clear bug or behavior with a useful test seam, prefer a failing test first.
Implement the smallest correct increment.
Keep tests and other relevant checks green.
Refactor protected code when the improvement is concrete.
Search for affected documentation, examples, types, configuration, and duplication.
Review the complete diff.
Increase rigor with risk.
```

If the user says "use strict TDD," I will make the cycle externally visible: establish a test list, add one failing test, confirm the expected failure, implement only enough to pass, refactor while green, and repeat. I will also report the red and green evidence. Without that explicit request, I may still use test-first development where it is technically appropriate, but I may combine it with characterization tests, integration checks, or test-after coverage according to the repository and task.

References:

- `AGENTS.md` sections C00, E00, K00, L00, M00, N00, and P00 for this publication's explicit completeness, synchronization, reference, validation, and reporting requirements.
- General coding-agent engineering instructions concerning repository inspection, existing patterns, scoped edits, abstractions, tests, preservation of user changes, implementation, verification, and review behavior.
- No external empirical source was consulted for the original qualitative risk list.
- Agile Manifesto, "Manifesto for Agile Software Development" and "Principles behind the Agile Manifesto": https://agilemanifesto.org/ and https://agilemanifesto.org/principles.html
- Martin Fowler, "Test-Driven Development," including the red-green-refactor description and attribution of TDD's development within XP to Kent Beck: https://martinfowler.com/bliki/TestDrivenDevelopment.html
- Martin Fowler, "Continuous Integration," on self-testing code, frequent integration, and the relationship between CI, XP, and TDD: https://www.martinfowler.com/articles/continuousIntegration.html
- ExtremeProgramming.org, "Refactor Mercilessly": https://www.extremeprogramming.org/rules/refactor.html
- The Scrum Guide, 2020, on empiricism and iterative, incremental delivery: https://scrumguides.org/docs/scrumguide/v2020/2020-Scrum-Guide-US.pdf
- Kanban University, "Principles and General Practices of the Kanban Method": https://kanban.university/principles-general-practices-kanban-method/
- Lean Enterprise Institute, "What is Lean?": https://www.lean.org/explore-lean/what-is-lean/
- Leslie Lamport, "Specifying and Verifying Systems with TLA+," on formal description and correctness checking for concurrent and distributed systems: https://lamport.azurewebsites.net/pubs/spec-and-verifying.pdf
- Alloy Tools, official project description and documentation: https://alloytools.org/

---

G00 Topic T20260611-006: Choosing Dependency Inversion and Injection Across Languages

---

Topic ID: T20260611-006

Asked: 2026-06-11 07:55 America/Los_Angeles

Status: answered

Tags: architecture, dependency-injection, dependency-inversion, inversion-of-control, CSharp, JavaScript, C

Original question:

Why does the agent appear to use dependency injection more often in languages and frameworks such as C# and less often in simple JavaScript projects unless explicitly requested? Dependency injection can be expressed in many languages, including C through function pointers or compile-time selection; for example, `qsort` accepts a comparator. What detailed considerations determine whether dependency inversion, inversion of control, dependency injection, or a DI container should be used?

Published question:

How should a coding agent distinguish dependency inversion, inversion of control, dependency injection, and DI containers, and decide which form of dependency composition is appropriate in C#, JavaScript, C, and other project contexts?

Answer:

Dependency injection is not language-specific, and a DI container is not required for dependency injection. The apparent difference comes from ecosystem conventions, language affordances, application scale, and whether lifecycle and composition problems are large enough to justify visible infrastructure.

The concepts should be separated:

| Concept | Meaning | Example |
| --- | --- | --- |
| Dependency | Something code needs to perform its work | clock, logger, database, comparator, file system, HTTP client |
| Inversion of Control (IoC) | A broad condition in which control is supplied by a framework, caller, or external mechanism rather than entirely chosen inside the component | a framework calls an event handler; a sorting function calls a supplied comparator |
| Dependency Injection (DI) | A component receives a required collaborator from outside instead of constructing or locating it internally | constructor parameter, function parameter, factory argument, property injection |
| Dependency Inversion Principle (DIP) | Source-code dependencies should be arranged so high-level policy does not depend directly on low-level implementation details; both meet at a suitable abstraction or contract | pricing policy depends on a payment-port contract, while a Stripe adapter implements that contract |
| DI container | Infrastructure that registers, constructs, wires, scopes, and disposes object graphs | .NET `IServiceCollection` and `IServiceProvider` |
| Composition root | The boundary where concrete implementations are selected and assembled | `Program.cs`, application bootstrap, `main`, or a JavaScript factory module |

These concepts overlap but are not equivalent. IoC is broader than DI. DI is a wiring technique. DIP is an architectural dependency-direction principle. A container automates one style of DI but can be unnecessary.

Is `qsort` dependency injection?

`qsort` receives comparison behavior through a function pointer and calls it while executing the sort. It is clearly inversion of control and behavior parameterization. It is also reasonable to describe the comparator as an injected strategy or function dependency because the algorithm does not choose the comparison policy internally.

However, calling every callback "dependency injection" can make the term too broad to be useful. In application architecture, DI usually refers to supplying a component's collaborators and separating their construction from their use. The `qsort` comparator demonstrates the same underlying mechanism at function scale, but it does not imply a container, service lifetime, object graph, or application-wide DIP architecture.

Why C# makes DI more visible:

- Modern .NET and ASP.NET Core include a DI container as part of the framework. Registration, constructor injection, scopes, disposal, logging, configuration, hosted services, and request lifetimes are integrated into the host.
- C# applications commonly use classes and explicit interfaces, so constructor signatures and container registrations make dependency relationships visible.
- Server applications have object graphs and lifetimes such as singleton, scoped, and transient services. Central lifecycle management provides concrete value.
- Framework-created controllers, handlers, middleware, and hosted services cannot always be constructed directly by application code; the framework needs a standard composition mechanism.
- The ecosystem establishes a conventional composition root in `Program.cs`, so using the built-in container usually follows the repository rather than adding a novel pattern.

That does not mean every C# class should receive an interface through the container. Value objects, pure helpers, short-lived internal objects, and concrete classes without a meaningful substitution boundary may be constructed directly. Creating `IFoo` for every `Foo` can increase indirection without improving changeability or testing.

Why JavaScript DI is often less visible:

- Functions, closures, objects, and modules are first-class composition tools. Passing a function or object is ordinary JavaScript and may perform DI without being labeled as such.
- Dynamic structural behavior means a collaborator can satisfy a contract without declaring an interface type.
- Small browser scripts often have shallow object graphs and no application host responsible for scoped lifetime or disposal.
- ES modules already separate implementation units. A small composition module or factory can choose concrete imports without a container.
- Containers based on runtime reflection, decorators, or string/symbol registration can add hidden control flow, bundler constraints, metadata, and debugging complexity to a small project.

For example, this JavaScript factory uses manual DI:

```js
export function createUserService({ userStore, clock, logger }) {
  return {
    async register(input) {
      const user = { ...input, createdAt: clock.now() };
      await userStore.save(user);
      logger.info("user registered", { id: user.id });
      return user;
    },
  };
}
```

The dependencies are explicit and replaceable, and the application can wire production or test implementations at its composition root:

```js
const userService = createUserService({
  userStore: postgresUserStore,
  clock: systemClock,
  logger,
});
```

This is dependency injection even though there is no interface keyword, decorator, or container.

Why C uses different forms:

C can inject behavior and resources through:

- function pointers;
- a function pointer plus a context pointer;
- structs containing operation tables;
- opaque handles;
- constructor-like initialization functions;
- caller-provided allocators, I/O functions, clocks, or callbacks;
- compile-time macros or configuration;
- link-time substitution or separately selected object files.

Example:

```c
typedef struct {
    void *context;
    int (*read)(void *context, unsigned char *buffer, size_t size);
    void (*log)(void *context, const char *message);
} parser_dependencies;

int parser_run(parser_dependencies deps);
```

This is explicit manual injection. It can improve portability and testing, but it also introduces pointer validity, lifetime, ownership, ABI, and error-handling obligations. In embedded or performance-sensitive code, static or compile-time composition may be more appropriate than a runtime registry.

Language-neutral decision rule:

I first ask whether there is a dependency boundary worth controlling. I do not begin by asking whether the language has a popular DI framework.

Injection is favored when one or more of these conditions apply:

| Signal | Why injection helps |
| --- | --- |
| The dependency performs I/O or reaches an external system | Tests and alternate environments need controllable implementations |
| Behavior varies by deployment, tenant, platform, or configuration | Composition can select policy without changing the consumer |
| Time, randomness, environment, process state, or global APIs affect determinism | Injected capabilities make behavior explicit and testable |
| A high-level policy should be insulated from a database, UI, vendor SDK, or transport | DIP protects the policy from low-level implementation changes |
| Multiple production implementations already exist or are required | A stable contract has demonstrated value |
| The framework creates the consumer | A framework-supported injection mechanism may be the natural construction path |
| Resource lifetime is nontrivial | Central composition can manage scopes, cleanup, pooling, and ownership |
| A module is difficult to test because it constructs collaborators internally | Moving construction outward creates a test seam |

Direct construction or a simple import is favored when:

- the collaborator is a stable, deterministic value or pure implementation;
- there is one local implementation and no meaningful policy boundary;
- the object is an internal implementation detail with simple ownership;
- substitution would expose internals or require brittle mocks;
- injecting it would only move `new Foo()` from one obvious line into registration boilerplate;
- the repository deliberately uses direct module composition;
- the added abstraction would have one implementation and no identified reason to change independently.

Manual DI versus a container:

| Situation | Preferred composition |
| --- | --- |
| Small JavaScript module or command-line tool | Parameters, factories, closures, and an explicit bootstrap module |
| ASP.NET Core application using framework-created services | Built-in .NET container and constructor injection |
| Medium application with a manageable object graph | Manual constructor/factory injection unless the existing framework already provides a container |
| Large application with many lifetimes, decorators, cross-cutting services, and framework integration | Container may reduce composition and lifecycle boilerplate |
| Reusable library | Accept dependencies through its public API; do not normally require the consumer to adopt the library author's container |
| Embedded C or strict-resource system | Explicit operation tables, handles, and static or compile-time composition |
| Plugin architecture | Registry, factory, module loading, or container according to lifecycle and discovery requirements |

When I would apply DIP:

DIP is most valuable at architectural boundaries, not mechanically between every pair of functions. I look for a high-level policy that should remain stable while a lower-level detail changes. Examples include domain logic versus persistence, application use cases versus web transport, authorization policy versus identity provider, or business rules versus vendor SDKs.

The abstraction should normally be owned or shaped by the consumer's needs. A broad interface copied from a low-level implementation does not invert much; it can simply reproduce the same coupling through another file.

When I would avoid or postpone DI:

- A new interface would exist only to satisfy a style rule and would mirror one concrete class exactly.
- The dependency is pure, stable, local, and cheaper to construct than to configure.
- A container would hide a simple call graph and make runtime resolution failures possible.
- Service locator or global container access would conceal dependencies instead of placing them in signatures.
- Tests would mock every internal call and become coupled to implementation rather than behavior.
- Construction requires runtime data that is not an application service; ordinary parameters or factories are clearer.
- The design is still exploratory and the true variation boundary is not known.

Testing is evidence, but testability alone does not mean "inject everything." Good injection exposes unstable effects and policy boundaries. Excessive injection can fragment straightforward logic and encourage interaction-heavy mocks. A pure function taking data often needs no service abstraction at all.

What I inspect before deciding:

1. Repository instructions and existing composition conventions.
2. Language and framework lifecycle rules.
3. Who constructs the consumer: application code, framework, plugin host, or external caller.
4. Whether the dependency is policy, mechanism, data, or environmental capability.
5. Existing and credible future implementations.
6. Required lifetimes, ownership, cleanup, thread safety, and concurrency.
7. Testing strategy and whether substitution verifies behavior rather than implementation details.
8. Whether manual injection remains clear as the object graph grows.
9. Whether a container would reduce real complexity or merely relocate it into registrations.
10. Whether dependency direction across an architectural boundary is correct.

Default by context:

| Context | Default |
| --- | --- |
| Existing ASP.NET Core application | Use its built-in DI conventions for application services; avoid unnecessary interfaces and service location |
| Existing JavaScript/TypeScript project with a DI framework | Continue its established framework when the affected area uses it |
| Small JavaScript project without a DI framework | Use explicit parameters, factories, higher-order functions, and module composition when substitution is useful; do not add a container by default |
| Node.js service with a growing object graph | Start with a clear composition root and manual injection; consider the project's established container when lifecycle or wiring complexity warrants it |
| C library | Accept callbacks, operation tables, allocators, handles, or context pointers where the caller must supply policy or platform behavior |
| Pure computation | Pass data and functions directly; avoid service abstractions without a boundary |

Therefore, the difference should not be "use DI in C# but avoid DI in JavaScript." The better rule is:

```text
Use dependency inversion at important policy boundaries.
Inject collaborators whose implementation, effects, environment, or lifetime must vary.
Prefer the language's simplest explicit composition mechanism.
Use a container when framework integration or object-graph lifecycle makes it valuable.
Do not create abstractions or registrations merely to make the code look architecturally sophisticated.
```

If I fail to consider injection when code directly constructs a database client, clock, network transport, vendor SDK, or other unstable effect inside business logic, that can be the same task-local design failure discussed earlier. Conversely, if I introduce a container and interfaces into a small JavaScript page with no meaningful variation or lifecycle problem, that can be speculative architecture. The required review question is not "Did I use DI?" but "Are construction, policy, effects, and dependency direction explicit at the boundaries where they matter?"

References:

- Microsoft Learn, ".NET dependency injection": https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/overview
- Microsoft Learn, "Dependency injection guidelines": https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/guidelines
- Martin Fowler, "Inversion of Control Containers and the Dependency Injection pattern": https://martinfowler.com/articles/injection.html
- Martin Fowler, "Inversion Of Control": https://www.martinfowler.com/bliki/InversionOfControl.html
- Martin Fowler, "Dependency Composition," describing function-oriented composition through partial application: https://martinfowler.com/articles/dependency-composition.html
- Robert C. Martin, "A Little Architecture," discussing source-code dependency inversion across architectural boundaries: https://blog.cleancoder.com/uncle-bob/2016/01/04/ALittleArchitecture.html
- The Open Group, POSIX `qsort`: https://pubs.opengroup.org/onlinepubs/009696899/functions/qsort.html
- General coding-agent engineering instructions concerning existing repository patterns, justified abstractions, scoped changes, and test coverage proportional to risk.
