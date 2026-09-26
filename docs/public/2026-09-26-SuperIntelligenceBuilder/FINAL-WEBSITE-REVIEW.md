# Final website review

> Status: complete. The audit and action list were written before implementation; the final outcome was appended after validation.

## Review contract

Kind: descriptive review record. Audience: the project maintainer and a future editing agent. Purpose: decide whether each visible content unit should be kept, rewritten, removed, or rearranged. Non-goals: redesign `about.html`, restyle the generated repair-cafe demonstration to match the documentation shell, or repeat facts that already have an authoritative home.

## Scope

The review covers every HTML page in the project:

- the source manual (`index.html`);
- About (`about.html`), which remains a read-only comparison page;
- the Guardrails compatibility URL (`guardrails.html`);
- the examples landing page (`examples/index.html`);
- the specification workflow;
- the static web-design workflow;
- the enterprise C# workflow; and
- the generated repair-cafe demonstration.

The review treats headings, paragraphs, code samples, table rows, navigation labels, link labels, form labels, status messages, metadata descriptions, and footer text as content. Repeated structural labels are reviewed once when their wording and function are identical across pages.

## Production quality bar

A production-ready page in this project must meet all of these expectations:

1. A first-time visitor can identify the page, its purpose, and the next useful action from the first viewport.
2. Each sentence changes what the visitor can understand, decide, or do.
3. Each behavior claim matches the current C# source or an observed validation result.
4. The manual owns shared behavior; example pages describe only example-specific choices and link back for shared behavior.
5. Navigation order, naming, typography, spacing, color, and section markers remain consistent across documentation pages.
6. A page may differ visually only when the difference communicates a different artifact, as the repair-cafe demonstration does.
7. Headings name their content. Links name their destination. Instructions name the actor, condition, action, and expected result.
8. The page remains understandable without marketing language, conversation residue, or explanations of the editing process.
9. The rendered page has semantic landmarks, a logical heading order, visible focus, keyboard-operable controls, 320 px reflow, and no console errors.
10. Evidence states what was checked and does not turn an agent report into independent proof.

## Questions for every content unit

For each quoted unit, answer:

- **Visitor job:** What question or task does this help with?
- **Usefulness:** Does it add a fact, instruction, constraint, choice, or route the visitor needs?
- **Accuracy:** What source or observed behavior supports it?
- **Fit:** Is this the right page and position for it?
- **Decision:** Keep, rewrite, remove, or rearrange.

A unit is kept only when the usefulness answer is specific. “Adds context” is not sufficient without naming the decision or action that context supports.

## Design and organization questions

Each rendered page is also reviewed against these questions:

- Does the first viewport establish identity, purpose, and a useful route?
- Do global navigation, local navigation, and current-page state look and behave consistently?
- Does the content column use the available space without becoming too wide or cramped?
- Are heading size, section spacing, rules, tables, and code panels consistent with neighboring pages?
- Does any breakpoint create an unintended style change, overflow, stranded label, or narrow table column?
- Can a keyboard user see focus and reach controls in the same order as the visual layout?
- Are links distinguishable without relying on color alone, and are tap targets adequate where links are not inline prose?
- Does any content look templated, over-produced, or interchangeable with another project?
- Does the page repeat shared material that belongs in the manual?
- Is every visual difference intentional and explained by the artifact's purpose?

## Research inputs

The audit uses the following cloned skill repositories as review checklists, not as project dependencies:

- [`riekelt/technical-writer`](https://github.com/riekelt/technical-writer): technical truth, sentence-level review, and final-pass controls;
- [`cursor/plugins`](https://github.com/cursor/plugins): plain technical writing and AI-pattern removal;
- [`vercel-labs/agent-skills`](https://github.com/vercel-labs/agent-skills): current web-interface and documentation review rules; and
- [`addyosmani/web-quality-skills`](https://github.com/addyosmani/web-quality-skills): rendered accessibility and web-quality checks.

The repositories were shallow-cloned to a temporary directory and are not part of this project. Rules that conflict with the established project voice are treated as prompts for judgment, not automatic lint failures.

## Content decisions

The units below are paragraphs, tables, code panels, navigation groups, or complete form/status interactions. A table is treated as one logical unit only after every cell has been read. Repeated shell text is reviewed once and then checked for exact consistency on every page. The earlier [135-line editorial review](editorial/line-review.md) remains the physical-line audit of the manual draft; this pass reviews the current rendered copy after the guardrail and example-page changes.

### Shared documentation shell

> `Manual` / `Examples` / `About`  
> `Version 1.0 / .NET 10 / C# 14`

- **Visitor job and usefulness:** The three links answer where the primary guide, demonstrations, and development record live. The version strip gives the language/runtime context needed to judge compatibility.
- **Accuracy and fit:** The destinations exist, the runtime values match the project files, and this belongs in the global masthead.
- **Decision:** **Keep**, but add the missing `aria-current="page"` to the Examples link on all three detail pages. About keeps its older fourth tab because it is explicitly read-only in this change.

> `Contents` followed by coded section links, then source, README, examples, validation, and change-record links.

- **Visitor job and usefulness:** This is both an on-page map and a route to primary evidence. Every label names its destination rather than saying “learn more.”
- **Accuracy and fit:** Every anchor and local target resolved in the browser/link audit.
- **Decision:** **Keep**. At small widths the rail becomes a two-column contents menu; that is an intentional layout change, not a second design.

### Manual (`index.html`)

#### A01 — project identity

> **SuperIntelligenceBuilder**  
> One real method. An imaginary API. A real coding agent.  
> A single C# file that sends one source-defined task to an installed command-line coding agent.  
> No NuGet packages. .NET 10. C# 14. Three built-in adapters.

- **Visitor job and usefulness:** This answers what the project is, what is real, what runs the task, and what it requires. Each sentence removes a likely ambiguity created by the unusual fluent syntax.
- **Accuracy and fit:** `SuperIntelligenceBuilder.cs` contains the single real entry method, dynamic sink, and three adapters; the project builds for .NET 10 without package references. This is the right first-viewport material.
- **Decision:** **Keep**.

> `SuperIntelligenceBuilder.WithFile("AGENTS.md")` followed by invented `CreateOrReplaceUtf8File(...)` and `WithConciseOutput()` calls.  
> Only `WithFile` is implemented. It gives the coding agent the exact source statement; the agent interprets the invented method names and literal arguments as instructions. When C# execution resumes, the returned dynamic object accepts those invented calls without performing the named work again.

- **Visitor job and usefulness:** The code makes the premise inspectable; the paragraph explains execution order and prevents readers from assuming a hidden fixed API.
- **Accuracy and fit:** The dynamic implementation and prompt construction support the explanation. This belongs immediately after the definition.
- **Decision:** **Keep**.

#### B01 — run the sample

> A dry run needs only the .NET 10 SDK. A live run also needs one installed and authenticated coding agent.  
> Open a terminal in the complete project checkout, in the folder containing `SuperIntelligenceBuilder.csproj`.

- **Visitor job and usefulness:** These sentences establish the two prerequisite levels and the required working directory before commands appear.
- **Accuracy and fit:** Confirmed by successful clean builds and dry runs; live runs use an external authenticated CLI.
- **Decision:** **Keep**.

> `dotnet build`  
> `dotnet run`  
> The default is a dry run. It reads the caller and instruction file, identifies the coding-agent executable it would use when one is discoverable, and prints the exact fluent statement. It does not test authentication or CLI compatibility, launch a process, create a file, or edit the workspace.

- **Visitor job and usefulness:** This gives the safe first action and defines both its output and its limits.
- **Accuracy and fit:** Observed in the root project and all three examples. Source review confirms that preview returns before CLI probing and process launch.
- **Decision:** **Keep**.

> `dotnet run -- --yes,please,proceed`  
> The flag permits the live execution path. If `AGENTS.md` already exists, type exactly `yes, please proceed` to continue or `no` to stop. The comma-bearing CLI flag and spaced terminal reply are different inputs.

- **Visitor job and usefulness:** The block tells the reader how to cross each of two deliberately separate gates without confusing their spelling.
- **Accuracy and fit:** Parser and confirmation tests cover the exact tokens and rejection cases. This is the minimum safety context needed beside the live command.
- **Decision:** **Keep**.

> A successful run prints the agent summary and JSON report path. A missing agent is reported in dry-run output; a permitted live run returns `AgentNotFound` and sample exit code 3.

- **Visitor job and usefulness:** This defines observable success and the most common setup failure.
- **Accuracy and fit:** Matches `Program.cs`, `RunResult`, and validated output.
- **Decision:** **Keep**.

#### C00 — install an agent

> Install one supported command-line coding agent. You do not need all three; the builder contains the adapters.

- **Visitor job and usefulness:** It prevents unnecessary installation work and distinguishes an agent CLI from an in-process adapter.
- **Accuracy and fit:** The builder includes Codex, Claude Code, and GitHub Copilot CLI adapters.
- **Decision:** **Keep**.

> Codex — `npm install -g @openai/codex`; run `codex` and sign in.  
> Claude Code — use the official native installer; run `claude` and sign in.  
> GitHub Copilot CLI — with Node.js 22 or later, `npm install -g @github/copilot`; run `copilot` and sign in.

- **Visitor job and usefulness:** Each row provides one supported route from no agent to an authenticated executable.
- **Accuracy and fit:** The linked vendor pages were rechecked during the documentation pass; the date is disclosed under Sources because vendor requirements can change.
- **Decision:** **Keep**.

> Use vendor pages for current operating-system and authentication requirements. The builder never installs software, signs in, or switches agents after a task starts.

- **Visitor job and usefulness:** This identifies the authoritative maintenance source and bounds builder side effects/fallback behavior.
- **Accuracy and fit:** Matches discovery and execution source paths.
- **Decision:** **Keep**.

#### D00 — copy the dependency

> Copy `SuperIntelligenceBuilder.cs` into another SDK-style .NET 10 project. The sample `Program.cs`, project file, and `index.html` are not dependencies. Keep the opening comment as the offline reference.

- **Visitor job and usefulness:** This tells consumers exactly what to copy and what not to copy.
- **Accuracy and fit:** The SDK includes the source automatically and the file has no local project dependency.
- **Decision:** **Keep**.

> `CallerFilePath` stores the caller path at compile time; the builder reads that source at runtime. The original source must still exist. Rebuild after moving it; a deployed binary alone cannot reconstruct the fluent statement.

- **Visitor job and usefulness:** This prevents a subtle deployment failure and explains why it happens.
- **Accuracy and fit:** Matches the method signature and runtime source read.
- **Decision:** **Keep**.

#### E01 — how it works

> 1. Resolve and read safe caller/instruction paths.  
> 2. Return a dry-run plan unless execution was explicitly permitted.  
> 3. Require the exact reply for an existing instruction file.  
> 4. Discover and probe the selected agent and confirm unchanged source.  
> 5. Lock the workspace and atomically create a missing instruction file.  
> 6. Send call-site context, instructions, permissions, and run ID through UTF-8 standard input.  
> 7. Report completion only for exit code 0 plus a valid run-specific `completed` report.

- **Visitor job and usefulness:** The ordered list explains the execution sequence, where writes begin, and what completion actually means.
- **Accuracy and fit:** Each step maps to the source flow and test matrix. This is the canonical behavior description linked from examples.
- **Decision:** **Keep**.

> The coding agent interprets only the fluent statement at the `WithFile` call site. After `WithFile` returns, the dynamic result accepts invented calls without performing the named work a second time.

- **Visitor job and usefulness:** This resolves the most important timing and scope question left by the ordered list.
- **Accuracy and fit:** Matches call-site extraction and the dynamic sink.
- **Decision:** **Keep**.

#### F00 — write useful instructions

> Use legal C# identifiers, literal arguments, and an explicit output path. The invented method names are instructions, not members of a fixed API.  
> `WriteMarkdownFile("generated/review.md")`, summarize public types, include known limitations, and do not modify source code.

- **Visitor job and usefulness:** The prose provides the authoring rule; the example shows a bounded documentation-only task.
- **Accuracy and fit:** Source extraction sees text rather than evaluated runtime meaning, so identifiers and literals are the useful form.
- **Decision:** **Keep**.

> Ambiguity stays ambiguous. Runtime secrets, computed values, and side-effecting expressions must not be used. Ordinary C# argument expressions still execute locally after `WithFile` returns. Unknown dynamic members perform no named operation; real object members behave normally; `Execution` exposes the structured result; awaiting or arithmetic is unsupported.

- **Visitor job and usefulness:** These paragraphs identify four failure/safety boundaries that are otherwise easy to miss.
- **Accuracy and fit:** All are direct consequences of source interpretation and C# dynamic evaluation.
- **Decision:** **Keep** as separate paragraphs in the page; they are grouped only for this review because they answer one visitor question: “What does this syntax not guarantee?”

#### G00 — configure a run

> An options example selects Codex, permits execution, sets a five-minute task timeout, retrieves `task.Execution`, and prints its summary.

- **Visitor job and usefulness:** It shows the typed configuration/result path that the minimal sample omits.
- **Accuracy and fit:** The displayed members compile in the root project.
- **Decision:** **Keep**.

> `Agent` — explicit adapter, environment override, then Codex/Claude/Copilot discovery order.  
> `ExecutablePath` — absolute executable or JavaScript entry file; explicit agent required.  
> `WorkingDirectory` — nearest project, solution, `global.json`, or Git ancestor.  
> `Model` — selected-agent identifier, environment value, or CLI default.  
> `Timeout` / `ProbeTimeout` — bounded task and probe deadlines.  
> `Proceed` — permits the live path but not the existing-file confirmation.  
> `Preview` — forces dry-run behavior and overrides `Proceed`.

- **Visitor job and usefulness:** Every row answers what a public setting changes, its default/precedence, or its boundary.
- **Accuracy and fit:** Values and precedence were checked against `Options`, validation, and adapter discovery.
- **Decision:** **Keep every row**.

> `CancellationToken` is a `WithFile` argument. Windows npm shims are resolved without a command shell. Only absolute `PATH` entries are searched; configure an explicit executable when normal discovery cannot see it.

- **Visitor job and usefulness:** These notes cover integration, Windows launch behavior, and a concrete discovery remedy.
- **Accuracy and fit:** Matches the method signature and executable resolver.
- **Decision:** **Keep**.

#### H02 — execution and completion

> A live run needs `Proceed=true`; the supplied programs map only `--yes,please,proceed` to it. An existing Markdown instruction file then requires one exact reply before agent discovery.  
> Continue: `yes, please proceed`  
> Stop: `no`  
> `y`, `yes`, capitalization changes, whitespace changes, and other approximations do not continue. End-of-input yields `ConfirmationRequired`. Dry runs never ask.

- **Visitor job and usefulness:** This is the canonical, actionable guardrail specification. It says when the prompt appears, what input works, what fails, and whether an agent has started.
- **Accuracy and fit:** Exact-phrase cases were run against the executable. The manual is the correct owner; the old Guardrails URL redirects here.
- **Decision:** **Keep**.

> Default dry run — report only.  
> Missing instruction file — continue after the execution flag and create after preflight.  
> Existing instruction file — wait for exact reply before discovery/probing.  
> Reply `no` — decline without launch or report.  
> End-of-input — fail closed without launch.

- **Visitor job and usefulness:** The state table lets a user predict behavior from file state and input without reconstructing it from prose.
- **Accuracy and fit:** Matches the tested state machine.
- **Decision:** **Keep every row**.

> Approval permits one run and acknowledges possible workspace edits. It does not approve every edit, provide rollback, or replace diff/evidence review.

- **Visitor job and usefulness:** It defines the scope of consent and removes a dangerous inference.
- **Accuracy and fit:** The runner neither records broad consent nor implements rollback.
- **Decision:** **Keep**.

> Codex — workspace-write sandbox, no approvals, command networking disabled.  
> Claude Code — Read/Glob/Grep/Edit/Write only; empty and denied MCP.  
> GitHub Copilot CLI — file-tool allowlist; shell, URL, and built-in MCP denied.  
> Existing policies and hooks still apply; this is not an OS sandbox. Standard input avoids shell interpolation but not prompt injection from untrusted source.

- **Visitor job and usefulness:** The matrix tells readers which tasks each adapter can perform and what the restrictions cannot guarantee.
- **Accuracy and fit:** Adapter arguments and prompt transport support these claims.
- **Decision:** **Keep every row and the caveat**.

> Reports live at `.superintelligence/runs/<run-id>/result.json` and contain protocol, run ID, status, summary, and self-reported changed files. A report is an agent assertion, not proof; inspect actual files. Failures, cancellation, and timeouts can leave changes, and the builder does not roll them back.

- **Visitor job and usefulness:** This identifies the evidence location and prevents treating it as a filesystem diff or transaction.
- **Accuracy and fit:** Matches report parsing and non-rollback behavior.
- **Decision:** **Keep**.

#### I01 — diagnose failures

> `AgentNotFound`, `IncompatibleAgent`, `LaunchFailed`, `AgentFailed`, `TimedOut`, `ConfirmationRequired`, `TaskBlocked / TaskFailed`, `InvalidReport`, `Busy`, `InvalidInput / FileAccess`, and cancellation — each paired with a concrete check or next action.

- **Visitor job and usefulness:** Every row converts a stable failure category into an action: install/sign in, update/probe, check launch prerequisites, inspect agent output, review partial edits, provide exact confirmation, read the report, distrust missing reports, wait/check lock permissions, check encoding/paths, or handle cancellation.
- **Accuracy and fit:** Error names and remedies align with `ErrorCode`, sample exit mapping, and observed guardrail behavior.
- **Decision:** **Keep every row**. The `ConfirmationRequired` row is necessary because it is the exact failure a noninteractive live invocation can encounter.

> Library failures use `BuilderException` with typed `Error` and optional `AgentExitCode`; cancellation uses `OperationCanceledException`.

- **Visitor job and usefulness:** This gives library callers the programmatic handling contract.
- **Accuracy and fit:** Matches public exception types.
- **Decision:** **Keep**.

#### J00 — other coding tools

> Only Codex, Claude Code, and GitHub Copilot CLI have adapters. Gemini CLI, OpenCode, Aider, Cursor CLI, Cline, Continue CLI, OpenHands, Pi, Roo Code, and Cascade are a research catalog; this builder cannot launch or fall back to them.

- **Visitor job and usefulness:** The opening prevents a list of related tools from being mistaken for compatibility. Each row gives a concise reason it might matter to a future adapter author.
- **Accuracy and fit:** Links target the relevant primary documentation; no unsupported tool enters discovery.
- **Decision:** **Keep**, because the source file itself carries this catalog and adapter selection was part of the project brief. Its secondary position after troubleshooting is appropriate.

> A new adapter needs separate review of discovery, arguments, working directory, permissions, cancellation, and completion reporting.

- **Visitor job and usefulness:** This identifies the integration dimensions rather than implying that a command substitution is sufficient.
- **Accuracy and fit:** Those dimensions differ across the existing adapters.
- **Decision:** **Keep**.

#### K00 — limits and verification

> 1 MiB source, 256 KiB instruction, 64 KiB report; UTF-8 only. Reject symlinks/reparse points within the selected path, but do not claim an OS sandbox or elimination of path races. Coordinate overlapping workspaces externally. Child processes inherit a recursion guard. Use ordinary JIT builds; NativeAOT, trimming, and source-less deployments are outside the design. Provider output is nondeterministic.

- **Visitor job and usefulness:** Every sentence identifies a hard input limit, containment boundary, concurrency boundary, deployment boundary, or correctness boundary.
- **Accuracy and fit:** Constants and checks exist in source; the caveats prevent stronger security/reproducibility claims than the implementation supports.
- **Decision:** **Keep every limit**.

> `VALIDATION.md` records builds, browser checks, guardrail cases, and authenticated runs. No test binaries are distributed.

- **Visitor job and usefulness:** This routes readers to evidence while distinguishing a record from shipped executable tests.
- **Accuracy and fit:** The record exists and names its commands/limits.
- **Decision:** **Keep**.

#### L01 — sources

> Vendor installation and CLI switches were checked on 2026-09-26. The exact-phrase confirmation and civil diagnostic voice are inspired by *Bespoke: A Programming Language for People Who Say Please*; the project remains ordinary C#. The manual renders offline, while external links and live providers may need network access.

- **Visitor job and usefulness:** This dates unstable vendor facts, attributes the tone, and states the actual offline boundary.
- **Accuracy and fit:** The research and local asset checks support all three statements.
- **Decision:** **Keep**.

### About (`about.html`, read-only)

The following units were reviewed for usefulness and visual comparison, but the explicit project constraint is to leave this page byte-for-byte unchanged. Its SHA-256 remains the recorded baseline.

> **About this development run**  
> What was available. What was blocked. What was decided.  
> This page records the environment and implementation choices behind this experimental project on 2026-09-26.

- **Visitor job and usefulness:** It defines this as a development record rather than product guidance.
- **Accuracy and fit:** The date and scope match the recorded run.
- **Decision:** **Keep unchanged**.

> **Environment and model:** agent identity, requested and verified model, operating environment, observed runtimes and utilities, .NET state, agent installations, working files, and network.

- **Visitor job and usefulness:** The table separates observed environment facts from assumptions, allowing reproduction limits to be judged.
- **Accuracy and fit:** Every cell is framed as requested, verified, installed, or unavailable; no unsupported capability is claimed.
- **Decision:** **Keep unchanged**.

> **Tools actually used:** shell execution, file patching, web research, browser control, local image inspection, Python, Node.js, C# syntax parsing, static HTML rendering, library upload, and workflow guidance.

- **Visitor job and usefulness:** This distinguishes exposed capability from tools actually used in the run.
- **Accuracy and fit:** The row descriptions are concrete and belong in a development record.
- **Decision:** **Keep unchanged**.

> **Other exposed capabilities:** image generation, video building/testing, documents/spreadsheets/presentations, automation scheduling, agent collaboration, plugin management, user-input/planning tools, and capability caveats.

- **Visitor job and usefulness:** This records what could have been used and prevents “available” from being read as “used.”
- **Accuracy and fit:** The introductory and closing caveats make that distinction explicit.
- **Decision:** **Keep unchanged**.

> **Observed blockers and limitations:** CoreCLR startup, installer temporary directory, archive metadata, process filesystem visibility, native tracing, local browser preview, browser JavaScript checks, separate browser runtime, restricted browser-side JavaScript, agent execution, other operating systems, and model identity.

- **Visitor job and usefulness:** The table explains why validation used fallbacks and where evidence is incomplete.
- **Accuracy and fit:** Limitations are labeled as observations rather than universal claims.
- **Decision:** **Keep unchanged**.

> **Architectural decisions:** one distributable C# file, .NET 10/C# 14, DynamicObject sink, immediate execution, source-defined task, exact call-site context, three reviewed adapters, and no provider SDK.

- **Visitor job and usefulness:** These rows preserve the major design choices and their consequences.
- **Accuracy and fit:** They match the implementation architecture.
- **Decision:** **Keep unchanged**.

> **Behavioral decisions:** preserve instructions, deterministic selection, no shell-string construction, bounded operations, workspace containment and lock, recursion guard, permission boundaries, completion protocol, no automatic retries, live diagnostics, model opt-in, and preview before execution.

- **Visitor job and usefulness:** This is the rationale record for safety and runtime semantics.
- **Accuracy and fit:** The current manual and source retain the decisions.
- **Decision:** **Keep unchanged**.

> **Documentation and delivery decisions:** portable manual, compact documentation, self-contained pages, editorial sequence, source-only zip, no internet validation, and static visual fallback.  
> **Findings and future expectations:** review-browser and local-validation observations, future browser checks, and the implementation-not-production disclaimer.

- **Visitor job and usefulness:** These units explain how the documentation was delivered and what confidence not to infer.
- **Accuracy and fit:** They are historical context, not current run instructions.
- **Decision:** **Keep unchanged**. The older Guardrails tab and narrow two-column mobile tables are accepted debt under the no-edit constraint; the Guardrails URL still resolves to the manual owner.

### Guardrails compatibility URL (`guardrails.html`)

> **Guardrails moved**  
> The execution gates, exact confirmation phrases, consent scope, permissions, and completion-report guidance now live in Execution and completion.  
> Open Execution and completion.

- **Visitor job and usefulness:** This preserves old bookmarks without maintaining a second source of safety truth.
- **Accuracy and fit:** The page redirects to `index.html#h`, and its fallback link says where it goes.
- **Decision:** **Keep** as a compatibility redirect, not a navigable documentation page.

### Examples landing page (`examples/index.html`)

#### X01 — overview

> **Runnable examples**  
> Three source-defined workflows. One single-file builder.  
> Each example is a small .NET project that links the same `SuperIntelligenceBuilder.cs`, declares a task as a fluent C# statement, and keeps generated files in the repository for immediate inspection.  
> Specifications / static web design / enterprise C# practices.  
> You can read every task and output without running a coding agent. A live rerun is optional and may replace the checked-in outputs named by that task.

- **Visitor job and usefulness:** The title, lede, and final paragraph explain what can be inspected safely and what a rerun changes. The short specs strip merely repeats the next section.
- **Accuracy and fit:** Relative compile links and checked-in outputs confirm the architecture.
- **Decision:** **Remove** the redundant “Specifications / …” strip. **Keep** the remaining copy.

#### X02 — three workflows

> Specification workflow — agent instructions, principles, specification, plan, and dependency-ordered tasks; documents rather than implements the CSV feature.  
> Static web design workflow — repair-cafe brief, three directions, selected design, visual rules, checklist, and local HTML/CSS/JavaScript demonstration.  
> Enterprise C# practices — agent instructions, EditorConfig, shared MSBuild defaults, architecture/coding guidance, risk-based gates, and review checklist.

- **Visitor job and usefulness:** Every row lets a visitor choose a workflow based on concrete outputs, not a marketing category.
- **Accuracy and fit:** Every named output exists at its linked path.
- **Decision:** **Keep every row**.

#### X03 — run an example

> Use the complete checkout; the project files reference the shared builder, so two downloaded source/project files are not a runnable bundle.  
> `dotnet build`, `dotnet run` for dry run, then `dotnet run -- --yes,please,proceed` for live execution.  
> All examples explicitly select Codex. Every checked-in example already has `AGENTS.md`, so the first live run also requires `yes, please proceed`; `no` stops. Approval covers one run and does not provide rollback.

- **Visitor job and usefulness:** This prevents an incomplete download, gives the safe/live sequence, names the additional dependency, and discloses the existing-file gate.
- **Accuracy and fit:** All three projects build and dry-run with these commands; their options select Codex.
- **Decision:** **Keep** as the shared execution owner for examples.

#### X04 — recorded evidence

> Checked-in outputs came from three authenticated builder-driven Codex runs. Programs were built and documents, configuration, and the website were checked according to format. These facts do not make an agent report independent proof. See the validation record for commands, counts, browser checks, and limits.

- **Visitor job and usefulness:** This states provenance without turning it into a correctness claim.
- **Accuracy and fit:** `VALIDATION.md` records the runs and independent local/browser checks.
- **Decision:** **Keep**.

### Specification workflow

> **Specification workflow**  
> Define behavior first. Preserve the path to delivery.  
> This runnable example asks a coding agent to document a proposed CSV task-import feature as a specification, technical plan, and dependency-ordered task list.

- **Visitor job and usefulness:** The page identity and result are useful, but the sentence shares a visible template with the other two pages.
- **Accuracy and fit:** The output documents the feature and explicitly does not implement it.
- **Decision:** **Rewrite** only the lede in direct form: “This example documents a proposed CSV task-import feature as a specification, technical plan, and dependency-ordered task list.”

> The generated documents do not implement the feature. Stable identifiers connect requirements and acceptance criteria to decisions, tasks, and named tests without merging those concerns.

- **Visitor job and usefulness:** This prevents readers from mistaking plans/tests named in prose for implemented code and explains the traceability design.
- **Accuracy and fit:** The Markdown artifacts contain the linked identifiers.
- **Decision:** **Keep**.

> **Source-defined task:** the displayed `Program.cs` chain requires behavior-first scope, explicit assumptions/edge cases, traceability, constitution/index/spec/plan/tasks outputs, source citation, local validation, and concise output.

- **Visitor job and usefulness:** Readers can understand the actual instruction without downloading source.
- **Accuracy and fit:** The excerpt is copied from `Program.cs`; the note links the complete briefs.
- **Decision:** **Keep**. At 320 px, wrap only these long task excerpts so the method names remain readable without hidden horizontal scrolling.

> **Run safely:** complete checkout; workflow-specific `cd`; build and dry run; live flag; existing `AGENTS.md`; exact continue/stop replies; review the diff because consent covers one run and no rollback.

- **Visitor job and usefulness:** The workflow path is necessary, but most live-run semantics repeat the examples landing and manual.
- **Accuracy and fit:** The statements are correct.
- **Decision:** **Condense** to the workflow-specific directory/commands and one sentence linking the shared execution instructions. Retain the existing-file warning because it changes what happens on the first run from this checkout.

> `AGENTS.md`, `constitution.md`, `specifications/README.md`, `spec.md`, `plan.md`, and `tasks.md`, each paired with its reader purpose.

- **Visitor job and usefulness:** Every row explains which artifact to open for instructions, principles, reading order, behavior, decisions, or work sequencing.
- **Accuracy and fit:** Files and links exist.
- **Decision:** **Keep every row**; improve 320 px table reflow so filenames do not squeeze descriptions.

> **Basis and evidence:** GitHub Spec Kit separation and Warp product-behavior influence are named without claiming objective superiority. The checked-in result came from an authenticated run; local checks report link and traceability counts with a link to their limitations.

- **Visitor job and usefulness:** This attributes design influence and states concrete evidence/limits.
- **Accuracy and fit:** Sources and counts are recorded in validation.
- **Decision:** **Keep**.

### Static web design workflow

> **Static web design workflow**  
> Compare the directions. Record the choice. Build the page.  
> This runnable example asks a coding agent to plan and build a one-page site for a neighborhood repair cafe with no build step or remote dependencies.

- **Visitor job and usefulness:** The title/tagline describe the workflow; the lede supplies deliverable, scenario, and constraints but repeats the shared “This runnable example asks…” template.
- **Accuracy and fit:** The result is local HTML/CSS/JavaScript with no remote asset.
- **Decision:** **Rewrite** the lede directly: “This example plans and builds a one-page neighborhood repair-cafe site with no build step or remote dependencies.”

> Direction is separated from implementation: define audience/content, compare three approaches, record the selected fit, then implement. The repair-cafe demonstration keeps unknown event facts visibly marked and does not present them as real details.

- **Visitor job and usefulness:** This explains the design method and the honesty boundary of the demo.
- **Accuracy and fit:** The design documents and site support both claims.
- **Decision:** **Keep**.

> **Source-defined task:** the displayed chain requires a brief, three directions, decision, visual system, review checklist, chosen-direction site, semantic local assets, and validation.

- **Visitor job and usefulness:** It exposes the actual design-quality constraints instead of merely claiming that the site is polished.
- **Accuracy and fit:** The excerpt matches `Program.cs`.
- **Decision:** **Keep**, with narrow-screen wrapping for this task excerpt.

> **Run safely:** workflow-specific checkout path, dry run, live flag, existing-file exact reply, possible partial edits, and diff review.

- **Visitor job and usefulness:** The project path and first-run warning are useful; the remaining behavior has a canonical shared explanation.
- **Accuracy and fit:** Correct for this project.
- **Decision:** **Condense** and link to the examples execution instructions and manual section.

> `AGENTS.md`, `brief.md`, `directions.md`, `decision.md`, `system.md`, `review-checklist.md`, and `site/`, each with its concrete reader purpose.

- **Visitor job and usefulness:** The table turns filenames into a guided inspection path.
- **Accuracy and fit:** Every output exists.
- **Decision:** **Keep every row**, but change “visual theses” in the directions description to the plainer “visual directions,” and improve 320 px reflow.

> **Basis and evidence:** Anthropic frontend-design and Vercel web-design guidance are named as influences, not copied templates. The recorded run corrected one initial contrast result; local checks and a later browser audit are distinguished from a complete usability/accessibility evaluation.

- **Visitor job and usefulness:** This explains design provenance and calibrates evidence.
- **Accuracy and fit:** Records and files support the claims.
- **Decision:** **Keep**, then update the validation link after the newly discovered axe defects are fixed and rerun.

### Enterprise C# practices

> **Enterprise C# practices**  
> Enforce the defaults. Explain the judgment calls.  
> This runnable example asks a coding agent to create a modest engineering baseline for ordinary C# business applications.

- **Visitor job and usefulness:** The title/tagline distinguish mechanical defaults from review judgment. The lede gives scope but repeats the same page template.
- **Accuracy and fit:** The outputs contain both enforceable configuration and written policy.
- **Decision:** **Rewrite** the lede directly: “This example creates a modest engineering baseline for ordinary C# business applications.”

> The result separates compiler/analyzer defaults in `Directory.Build.props` and `.editorconfig` from architecture, failure semantics, testing depth, migration, rollback, and review guidance.

- **Visitor job and usefulness:** This tells a reader what is enforced and what still requires judgment.
- **Accuracy and fit:** The linked artifacts follow that split.
- **Decision:** **Keep**.

> **Source-defined task:** the displayed chain calls for nullable/analyzer/warning defaults, simple architecture, async/cancellation/logging/failure rules, testing/security/compatibility review, bounded retries, six named outputs, and no application-code edits.

- **Visitor job and usefulness:** This makes the policy scope and non-goal inspectable.
- **Accuracy and fit:** The excerpt matches `Program.cs`.
- **Decision:** **Keep**, with narrow-screen wrapping for this task excerpt.

> **Run safely:** workflow directory, dry run, live flag, exact existing-file reply, and instruction to review policies before adoption.

- **Visitor job and usefulness:** The directory and adoption warning are specific; the rest is shared behavior.
- **Accuracy and fit:** Correct.
- **Decision:** **Condense** and link to shared execution guidance while keeping the policy-review warning.

> `AGENTS.md`, `.editorconfig`, `Directory.Build.props`, `architecture.md`, `coding-standards.md`, `quality-gates.md`, and `pull-request-checklist.md`, each paired with what it governs.

- **Visitor job and usefulness:** Every row tells maintainers which file enforces or explains which part of the baseline.
- **Accuracy and fit:** Files and links exist.
- **Decision:** **Keep every row** and improve 320 px reflow.

> **Basis and evidence:** Microsoft coding and architectural guidance is the technical basis; GitHub’s skill is a research pointer, not policy. XML, EditorConfig, link, consistency, and zero-warning/error build checks are reported without claiming universal suitability.

- **Visitor job and usefulness:** This separates authoritative basis, inspiration, observed checks, and limits.
- **Accuracy and fit:** The validation record supports the check claims.
- **Decision:** **Keep**.

### Generated repair-cafe demonstration

> **Juniper Street Repair Cafe**  
> Neighbors helping neighbors keep useful things in use.  
> Navigation: What to bring / How it works / Access / Volunteer.

- **Visitor job and usefulness:** The masthead identifies the fictional service and gives four task-oriented routes.
- **Accuracy and fit:** All four anchors resolve. The separate visual system is intentional because this page is the generated artifact, not project documentation.
- **Decision:** **Keep**. Slightly reduce small-screen nav spacing so the wrapped 320 px menu looks deliberate.

> **Bring the thing you thought was done.**  
> Repairs are collaborative, practical, and never guaranteed.  
> The next bench day is taking shape; date, time, and venue are to be announced while an accessible space, tools, and fixers are matched.

- **Visitor job and usefulness:** This explains the service and honestly states that no real event details exist.
- **Accuracy and fit:** The demo brief deliberately leaves event facts unknown.
- **Decision:** **Keep**.

> **What belongs on the bench?** Bring one clean, portable item and its cord/parts. Lamps, toys, clothing, and small appliances each have concrete examples. The quick checker asks for the nearest category and reports a likely fit or directs uncertain items to contact first. Unsafe categories include leaking, contaminated, fuel-powered, pressurized, or licensed-trade work.

- **Visitor job and usefulness:** This section lets a prospective visitor decide whether to transport an item and demonstrates a progressively enhanced interaction.
- **Accuracy and fit:** Labels, status messages, no-script guidance, and surrounding complete guidance agree.
- **Decision:** **Keep every category, label, and status**.

> **How a repair visit works:** Check in, look closely, try a safe repair when possible, then test and choose a next step.  
> **Bring the clues, too:** one item, loose parts/cord, fault notes, and time/curiosity. The optional enhanced checklist lasts for the current tab only.

- **Visitor job and usefulness:** The route sets expectations; the checklist helps preparation. The storage sentence is useful but uses implementation-flavored wording.
- **Accuracy and fit:** Script review confirms `sessionStorage` and a functional reset.
- **Decision:** **Keep** the route and labels; **rewrite** the persistence sentence to “If JavaScript is available, your checked items stay selected until you close this tab.”

> **Access is part of the setup.** Venue-specific routes and facilities will be posted with event details. The team will confirm step-free access/toilet details, seating and pace, quieter conditions where possible, and communication support. The currently linked contact is a clearly marked demonstration address.

- **Visitor job and usefulness:** This gives disabled visitors a concrete list of facts that must exist before attending and does not invent venue details.
- **Accuracy and fit:** The placeholder status is explicit both here and in the volunteer section.
- **Decision:** **Keep**.

> **Bring what you know. Learn what you do not.** Fixers, stitchers, explainers, greeters, tea makers, organizers, and note-takers can volunteer. The mail action uses `volunteer@example.com`, visibly labeled as a demonstration address that must be replaced before publication.

- **Visitor job and usefulness:** This demonstrates volunteer recruitment copy and discloses that the contact route is not live.
- **Accuracy and fit:** The design checklist explicitly requires the placeholder disclosure.
- **Decision:** **Keep** as demonstration content.

> Footer: `Repair is a conversation between people, tools, and time.` / `Local page · No tracking · No remote assets`.

- **Visitor job and usefulness:** The first line closes the cooperative theme; the second states privacy/dependency facts relevant to this static build.
- **Accuracy and fit:** Network/resource inspection confirms local assets and no tracking.
- **Decision:** **Keep**.

## Visual and interaction findings

### Evidence collected before edits

- Fresh full-page screenshots were captured for all seven rendered destinations at 1440×900, 390×844, and 320×720: 21 images under `review-evidence/final-pass/`.
- Every page returned successfully, produced no page or console error, and stayed within the viewport at all three widths.
- The manual, examples landing, and three detail pages have identical body background, text color, font family, masthead rule, and main-width tokens. Their desktop hierarchy and small-screen transformation are recognizably one documentation system.
- The generated repair-cafe page intentionally retains its own ledger/workshop visual system. Making it look like the manual would erase the design deliverable being demonstrated.
- Manual keyboard order begins with the skip link, then global navigation, filter, section links, and resources. The repair-cafe fit checker works from the keyboard.
- Axe reported zero violations on the manual, About, examples landing, and all three workflow pages.
- Axe found one serious contrast failure in the repair-cafe volunteer eyebrow: `#17352f` on `#cc4525`, 2.8:1 where 4.5:1 is required.
- Axe found two moderate nested-complementary-landmark failures. The event ticket and access note are local callouts nested in named sections; they do not need page-level `aside` semantics.

### Cross-page comparison

- **Consistent:** documentation color, typography, rules, maximum width, section codes, code-panel treatment, tables, local rails, global link order, footer treatment, and breakpoint behavior.
- **Unintended:** the three detail pages fail to mark the global Examples tab current even though the landing page does.
- **Unintended at 320 px:** fluent task excerpts preserve long unbroken source lines inside a horizontally scrollable region with no visible scroll cue. A reader sees only fragments of the invented instructions.
- **Unintended at 320 px:** example output-table row headers reserve 31% with a 108 px minimum, leaving narrow description columns. The content remains present but is needlessly hard to scan.
- **Minor:** documentation top-nav links render about 23 px high and manual Copy buttons about 19 px high. They pass axe and adjacent-link spacing can satisfy the target-size exception, but explicit 24 px minimum heights make the intended controls less fragile.
- **Accepted exception:** About retains its historical Guardrails tab and narrow two-column mobile tables because the page is byte-for-byte frozen. The redirect preserves the link destination.
- **Intentional difference:** repair-cafe content, palette, type, motifs, and single-column mobile transformation belong to the example’s recorded design decision.

### Independent rubber-duck assessment

The read-only screenshot reviewer agreed that the shell is now coherent and the repair-cafe design should remain separate. It independently identified the missing current tab, cramped task excerpts and tables, redundant landing strip, formulaic ledes, repeated execution prose, and frozen About debt. Its observations were compared against source and browser measurements before being accepted here; they were not applied automatically.

## Final actions

The following list is frozen before implementation so the final diff can be checked against a stated reason rather than revised after the fact.

1. **Repair the serious contrast failure.** Give `.volunteer .eyebrow` a light foreground with a measured ratio of at least 4.5:1 on the orange panel. Re-run axe and a direct ratio calculation.
2. **Repair landmark semantics.** Change the event ticket and access note from `aside` to neutral containers because they are local layout callouts inside named section landmarks. Re-run axe and heading/landmark inspection.
3. **Expose the current global page.** Add `aria-current="page"` to Examples on each detail page. Verify underline styling and accessible state in Playwright.
4. **Make task excerpts readable at 320 px.** Add a distinct task-excerpt class and wrap its source lines on narrow screens; leave shell command blocks unwrapped. Re-capture and inspect all three 320 px detail pages.
5. **Make output tables readable at 320 px.** Stack example table headers/cells below a narrow breakpoint, retaining row and column semantics in HTML. Re-capture and check for overflow.
6. **Remove one repeated landing unit.** Delete the X01 specs strip because X02 immediately names and explains the same three workflows.
7. **Remove visible copy templates.** Rewrite only the three “This runnable example asks…” ledes in direct language.
8. **Put shared execution behavior in one place.** Shorten the three detail-page run sections to their workflow path, commands, existing-file condition, workflow-specific review warning, and links to the examples shared steps/manual behavior. Do not remove safety facts needed before the first live run.
9. **Clarify one output label.** Replace “visual theses” with “visual directions.”
10. **Clarify checklist persistence.** Replace “optional enhanced checklist lasts for the current tab only” with direct user-facing behavior.
11. **Stabilize explicit control sizes.** Give documentation global tabs and manual Copy buttons a minimum 24 px height without changing the visual design.
12. **Tidy the 320 px demo masthead.** Reduce repair-cafe nav gap at the existing small-screen breakpoint; do not redesign the masthead.
13. **Revalidate the whole site.** Re-run builds, dry runs, local links/fragments, static syntax checks, three-viewport Playwright screenshots, axe, keyboard/form behavior, exhaustive documentation navigation, parent index/RSS checks, and the About hash. Update `VALIDATION.md` and this record with outcomes.

## Final outcome

All 13 actions were completed. One additional markup issue appeared during final `html-validate`: four neutral repair-cafe layout containers still carried ARIA naming attributes that had no corresponding widget or landmark role. Those unnecessary attributes were removed, then the HTML and browser suites were rerun.

The implemented result now has:

- a visible current Examples tab on all three workflow pages;
- readable wrapped task excerpts and stacked output rows at 320 px without changing desktop presentation;
- one fewer redundant landing-page unit and three direct, non-templated ledes;
- shorter detail-page execution guidance with canonical links to shared behavior;
- a direct checklist-persistence explanation and a plain “visual directions” label;
- documentation tabs and Copy controls with explicit 24 px minimum heights;
- a 4.72:1 volunteer-eyebrow contrast ratio and no nested complementary landmarks; and
- the original repair-cafe art direction, manual design system, and byte-for-byte About page preserved.

Final validation produced these results:

- four Release builds: 0 warnings, 0 errors;
- four default dry runs: exit 0, no process launch or write;
- `html-validate` 10.4.0: 7 editable HTML pages, 0 errors under the project's documented style exceptions;
- local links and fragments: 8 pages, 0 failures;
- Playwright rendered-page suite: 7/7 groups passed at 1440, 390, and 320 px;
- axe: 0 violations on all 7 rendered destinations;
- Playwright interaction suite: 3/3 passed, covering 6 copy controls, 12 manual anchors, 15 global-navigation clicks, 5 fit-checker outcomes, and checklist persistence/reset;
- JavaScript syntax and CSS brace checks: passed;
- About SHA-256: `8218fb7a8df3324cd7d534a7ba934d8b2879e1e15ffb96feea9f18a09fc6219f` (unchanged); and
- parent GitHub Pages index/RSS checks: 0 missing links, 0 bad preview targets, valid XML, and 139 project items matched by 139 RSS items.

The post-fix screenshots were inspected at all three widths. No new theme, hierarchy, overflow, or navigation discontinuity was introduced. The remaining About navigation/table differences are accepted historical debt under the explicit no-edit constraint, with its Guardrails link kept functional by the compatibility redirect.
