# LLM recipes line review

This review quotes every prose sentence and treats headings, link records, and code blocks as structural units. Each decision tests reader usefulness, clarity, evidence, placement, and length. Accepted rewrites are applied in `llm-recipes.html`; the expansive draft remains unchanged as editorial evidence.

## Title and motivation

> # R00 LLM recipes

**Keep.** The title matches the requested page name and the navigation label.

> This page records a reusable method for researching, building, documenting, and validating an agent-assisted software project.

**Keep.** It identifies the page and the four kinds of work it covers.

> The method was developed while turning SuperIntelligenceBuilder from an unvalidated C# experiment into a runnable project with three examples, guarded execution, connected documentation, and browser-tested pages.

**Keep.** It supplies concrete project context and names the resulting artifacts.

> It is a working reference rather than a conversation transcript.

**Rewrite.** Avoid contrast framing. Use: “It converts the useful decisions from the work into a reference that can be reused.”

> Each recipe names the input, action, evidence, and stopping condition that made the work dependable.

**Keep.** This defines the page's recurring schema.

> The page keeps project-specific details where they make the method concrete and separates them from rules that transfer to another repository.

**Keep.** It explains why the page contains both project facts and general procedures.

## Reference shelf

> ## Reference shelf

**Keep.** The heading names the lookup section placed near the top by request.

> The review used four skill repositories as temporary reading material.

**Keep.** It states the number and temporary role.

> They were discovery and review inputs, not runtime dependencies, copied policy, or proof that a result was correct.

**Rewrite.** Use positive wording and retain the boundary: “They supplied discovery and review criteria. The project does not depend on them at runtime, and their rules did not replace source or test evidence.”

### Technical Writer

> Repository: `riekelt/technical-writer`

**Keep with link.** The owner and repository make provenance searchable.

> Reviewed revision: `85e53729dd959a2795d593d6769068e342cf3486`

**Keep.** The commit makes the historical review reproducible.

> Files used: `technical-writing/SKILL.md`, `technical-writing/references/style.md`, `technical-writing/references/truth.md`, and `reviewing-technical-prose/SKILL.md`.

**Keep.** A reader can open the exact useful files without searching the repository.

> The document checkpoint was useful: classify the document, name its audience, state the reader's task, and set non-goals before drafting.

**Keep.** It distills the rule that directly shaped the work.

> The document-kind distinction prevented one edit rule from being applied everywhere.

**Keep.** It explains the practical effect of classification.

> Descriptive documentation was updated to match the implementation, historical records were preserved, and reference tables were checked for completeness.

**Keep.** It names how three document kinds changed the edit behavior.

> The truth rules separated facts observed in source, facts observed in tests, statements reported by an agent, and conclusions drawn by the reviewer.

**Keep.** This is central to the project's evidence model.

> The style rules supplied two practical tests: read the text aloud and remove the product name to see whether the remaining sentence still says anything specific.

**Keep.** Both tests are compact, reusable, and explained.

> The final-review skill supplied the last pass for claims, links, terminology, heading structure, and cold readability.

**Keep.** It states the exact final-pass contribution.

### Cursor technical-writing and unslop skills

> Repository: `cursor/plugins`

**Keep with link.** The repository owns both selected skills.

> Reviewed revision: `ecc249f1e306fc64ddf83c7bed16cacf7c2239db`

**Keep.** It pins the reviewed state.

> Files used: `pstack/skills/technical-writing/SKILL.md` and `pstack/skills/unslop/SKILL.md`.

**Keep.** The exact paths prevent unrelated plugin material from entering the recipe.

> The technical-writing skill helped separate tutorial, how-to, reference, and explanation content instead of asking one page to perform every job.

**Keep.** It explains the Diataxis decision in project terms.

> Its sentence rules favored direct actors, conditions before actions, real symbols and flags, and one stable term for each concept.

**Keep.** These are the specific rules used in the edits.

> The unslop pass removed generic claims, throat clearing, synonym cycling, decorative conclusions, inflated adjectives, and wording that could fit any software project.

**Keep.** The list is specific enough to reuse and short enough to scan.

> The most useful test was concrete: if a sentence did not change what a reader could know or do, it was removed or rewritten.

**Keep.** This is the main usefulness test requested for the site audit.

### Vercel web and writing guidelines

> Repository: `vercel-labs/agent-skills`

**Keep with link.** It identifies the source collection.

> Reviewed revision: `063bee94c3f4df8453406c830b0a7df0f2860278`

**Keep.** It pins the reviewed state.

> Files used: `skills/web-design-guidelines/SKILL.md` and `skills/writing-guidelines/SKILL.md`.

**Keep.** These are the two relevant routes.

> These skills point reviewers to current upstream rule sets, so the current source should be fetched again before a later audit.

**Keep.** The skills explicitly require fresh upstream rules, and the sentence prevents stale reuse.

> The web review contributed checks for semantic controls, keyboard focus, visible focus, navigation state, target size, responsive overflow, and honest loading or empty states.

**Keep.** It names the checks adopted from the web rules.

> The writing review reinforced descriptive headings, direct link labels, compact prose, and consistent naming.

**Keep.** It distinguishes the writing contribution from the web contribution.

> The guidelines were treated as prompts for judgment when their general style differed from the established documentation design.

**Keep.** It records that external rules do not override repository context automatically.

### Web quality and accessibility skills

> Repository: `addyosmani/web-quality-skills`

**Keep with link.** It identifies the source collection.

> Reviewed revision: `afa8da942115f2961fdbfa80807ea0b232ff6c00`

**Keep.** It pins the reviewed state.

> Files used: `web-quality-audit/SKILL.md`, `accessibility/SKILL.md`, `accessibility/references/A11Y-PATTERNS.md`, and `accessibility/references/WCAG.md`.

**Keep.** These paths cover the workflow, practical patterns, and criteria used.

> The evidence-led audit order was the useful part: define representative routes and states, measure the rendered page, use failures to localize source review, fix the source, and rerun the same checks.

**Keep.** This sequence governed the browser audit.

> The accessibility material supplied concrete checks for 320-pixel reflow, 4.5:1 normal-text contrast, 24-by-24-pixel minimum targets, native semantics, labels, status regions, logical focus order, and consistent navigation.

**Keep.** The thresholds and behaviors are actionable.

> The audit explicitly warns that an automated score does not prove accessibility, so keyboard interaction and direct screenshot review remained separate checks.

**Keep.** This prevents an axe pass from being overstated.

### Project and voice references

> `skills.sh` was used to discover candidate skills and compare adoption signals.

**Keep with link.** It states the directory's limited discovery role.

> Popularity narrowed the search; source quality, scope, license, and applicability determined whether a rule was used.

**Keep.** This prevents popularity from becoming technical evidence.

> `Bespoke: A Programming Language for People Who Say Please` supplied the civil diagnostic voice and the deliberately exact confirmation phrase.

**Keep with link.** It attributes the project's distinctive language accurately.

> The implementation remained ordinary C#, and the documentation states that boundary directly.

**Keep.** It prevents readers from inferring a new language implementation.

> DreamBerd, Rockstar, and an English programming-language documentation experiment showed a useful editorial pattern.

**Keep with links.** The group explains the precedent research without overstating influence.

> The premise can be playful while setup, behavior, errors, and limitations are written as serious technical documentation.

**Keep.** This is the editorial decision drawn from those references.

> GitHub Spec Kit informed the separation of constitution, specification, plan, and tasks in the specification example.

**Keep with link.** It explains the artifact structure actually generated.

> Warp's write-product-spec skill informed the separation of user-visible behavior from technical planning.

**Keep with link.** It names the exact useful principle.

> Anthropic's frontend-design skill informed the requirement for a specific visual direction rather than a generic card layout.

**Keep with link.** It explains the design brief's art-direction requirement.

> Vercel's web-design-guidelines skill informed the static-site accessibility and interaction review.

**Keep with link.** It connects the skill to its project use.

> Microsoft C# coding conventions and Microsoft architectural principles were the technical basis for the enterprise C# example.

**Keep with links.** It identifies the primary technical sources.

> GitHub's dotnet-best-practices skill was used only as a research pointer, not as copied policy or a substitute for Microsoft documentation.

**Rewrite.** Use positive ordering: “Microsoft documentation remained the technical authority; GitHub's dotnet-best-practices skill supplied additional review prompts.”

> Official vendor documentation remained the authority for .NET, Codex, Claude Code, GitHub Copilot CLI, and every cataloged command-line tool.

**Keep.** It states the source hierarchy for unstable commands and flags.

## Clone convention

> ## Clone convention

**Keep.** This is a high-value lookup section requested explicitly.

> Keep research repositories outside the product checkout unless the project intentionally vendors them.

**Keep.** It prevents temporary research sources from becoming accidental dependencies.

> Use `skills__OWNER__REPOSITORY` for skill collections so search results group by purpose and preserve provenance.

**Keep.** It implements the requested naming convention.

> Use a disposable root with an explicit name rather than an ambiguous directory such as `tmp` or `misc`.

**Rewrite.** Avoid contrast framing: “Use a disposable root whose name identifies the research task, such as `${TMPDIR:-/tmp}/sib-llm-references`.”

> The four-command shallow-clone block uses `--depth 1` and the `skills__OWNER__REPOSITORY` targets.

**Keep as one command unit.** The commands are executable, contain no hidden project paths, and implement the convention.

> `--depth 1` fetches the current commit and omits older history, which is enough for a review that reads current files.

**Keep.** It answers the reader's likely question about the flag.

> Record the reviewed commit before using any rule in a durable decision record.

**Keep.** It makes later claims reproducible.

> The `for repo ... git rev-parse HEAD` block prints the directory and commit for every clone.

**Keep as one command unit.** It is a concise provenance command.

> Find the instruction files before reading adjacent material.

**Keep.** It provides a focused first inspection step.

> The `find ... SKILL.md ... references/*.md` block lists relevant instruction and reference files.

**Keep as one command unit.** It works without repository-specific tooling.

> Read only the skill and references that answer the current task, but read each selected instruction file completely.

**Keep.** It balances scope control with instruction completeness.

> Refresh a disposable clone by deleting and cloning it again, or update a retained clone with an explicit fast-forward pull.

**Remove.** The project used fresh shallow clones, and this maintenance branch was not needed for the recorded workflow.

> `git -C ... pull --ff-only`

**Remove with the preceding sentence.** The page already gives the tested fresh-clone convention.

> These repositories contain guidance rather than a project executable, so there is no shared run command.

**Keep.** It answers the request for associated run commands without inventing one.

## Work contract

> Start by converting the request into a work contract.

**Keep.** This is the first reusable action after research setup.

> The contract identifies the objective, editable files, preserved files, permitted tools, required artifacts, destructive boundaries, and proof of completion.

**Keep.** Every listed field affected this project and prevents scope ambiguity.

> Read the nearest `AGENTS.md` and every applicable parent instruction before editing.

**Keep.** Repository instructions controlled both the project page and the parent index/RSS work.

> Translate explicit sequencing words such as "first," "only after," and "do not skip" into ordered checklist dependencies.

**Keep.** This captures the user's required sequential method.

> Separate read-only diagnosis from implementation so the evidence exists before a proposed fix can change it.

**Keep.** It explains the before-evidence requirement.

> Write down exceptions that must survive the change, such as a page that must remain byte-for-byte unchanged.

**Keep.** The About checksum proved the value of an explicit preservation condition.

> Define the audience as a person with a task, not as the generic word "users."

**Keep.** It produces testable page requirements.

> For this project, the primary readers were a curious developer, a developer considering a local run, a developer inspecting generated outputs, and a maintainer integrating the single-file builder.

**Keep.** These are the actual audience profiles used in the change request.

> The page quality bar followed from those reader jobs: explain the project, show a safe first action, expose the real task, describe the outputs, and state the evidence limits.

**Keep.** It turns audience analysis into concrete acceptance criteria.

## Repository inventory

> Inspect before installing or editing.

**Keep.** This is the section's procedure heading and first action.

> Map the entry point, reusable source, project files, instructions, generated outputs, documentation, ignored artifacts, and parent-site integration.

**Keep.** The inventory is complete for this repository shape.

> Use fast repository searches to find files and concepts.

**Keep.** It introduces the commands without repeating their mechanics.

> `rg --files`, the focused `rg -n` symbol search, and `git status --short`.

**Keep as one command unit.** These commands cover file discovery, concept discovery, and change boundaries.

> Read the implementation behind every public behavior claim.

**Keep.** This is the truth rule applied to source documentation.

> For SuperIntelligenceBuilder, that meant tracing the call-site source read, dry-run return, existing-file confirmation, adapter discovery, compatibility probes, workspace lock, process launch, and completion-report parser.

**Keep.** It gives a concrete trace path a maintainer can repeat.

> Distinguish the builder's own writes from edits requested of the coding agent.

**Keep.** The distinction is central to consent and documentation accuracy.

> The builder preserves an existing instruction file, while a source-defined task may explicitly ask the agent to replace that file.

**Keep.** It resolves the apparent contradiction with exact behavior.

> Inspect `.gitignore` before building so generated binaries, run reports, and evidence images do not become accidental deliverables.

**Keep.** It states a practical sequencing reason.

> Track useful source artifacts such as `AGENTS.md`, specifications, design decisions, policies, HTML, CSS, and JavaScript.

**Keep.** The examples establish these as deliverables.

> Ignore reproducible build output, runtime reports, workspace locks, and binary screenshots when the repository keeps only an evidence manifest.

**Keep.** It states the matching repository hygiene rule and its condition.

## Research ledger

> Research starts with questions, not browsing.

**Keep.** It gives the reader a useful order of operations.

> Create one ledger row for each unstable or unfamiliar claim: question, preferred source, observed answer, project decision, and verification date.

**Keep.** The row schema preserves both evidence and consequence.

> Use primary sources for installation commands, CLI flags, framework behavior, language versions, and accessibility standards.

**Keep.** These facts are unstable or normative and need authoritative sources.

> Use skills and example projects for review heuristics, structure, and vocabulary rather than as authority for another product's behavior.

**Rewrite.** Use positive wording: “Use skills and example projects for review heuristics, structure, and vocabulary. Verify product behavior in its source, tests, or primary documentation.”

> Use popularity only to select what to inspect first.

**Keep.** It preserves the useful part of the skills.sh ranking signal.

> Read the source and decide which exact rule transfers to the project.

**Keep.** It requires judgment after discovery.

> Keep copied text out of the deliverable unless quotation is necessary and licensed.

**Keep.** It gives a clear copyright and authorship boundary.

> Link the source, state the borrowed idea, and explain the project-specific application.

**Keep.** This is the provenance pattern used on the example pages.

> Date facts that can change, such as vendor CLI installation steps.

**Keep.** It makes later maintenance safer.

> Keep stable implementation facts tied to source or tests rather than a web page.

**Rewrite.** Use positive ordering: “Tie stable implementation facts to source or tests. Use web pages for the external facts they own.”

## Detailed task plan

> Create a change-request file before implementation when the work spans design, copy, behavior, and validation.

**Keep.** It identifies the threshold for a durable plan.

> The plan should name where to look, what question to ask, the decision to make, the file to change, and the check that will prove the result.

**Keep.** This is the detailed checklist schema the user requested.

> Use one checklist item per observable outcome.

**Keep.** It preserves traceability between request and evidence.

> Do not combine independent defects into a single item merely because one patch could change both.

**Rewrite.** Use positive wording: “Give independent defects separate checklist items, even when one patch can change both.”

> Freeze the issue list before editing so the final report can map each change back to evidence.

**Keep.** The frozen action list prevented post-hoc rationalization.

> Record non-goals to stop adjacent improvements from expanding the task silently.

**Keep.** It protects scope without blocking explicit new requests.

> Mark an item complete only after its matching validation passes.

**Keep.** This defines checklist completion.

> For the website redesign, the issue list covered visual-system drift, navigation order, Guardrails ownership, joke-forward copy, hidden tasks, incomplete output descriptions, incorrect first-run instructions, mobile layout, and evidence handling.

**Keep.** The list makes the abstract planning method concrete.

## Safe execution contract

> Make the default command observational when an agent can edit a workspace.

**Keep.** This is the primary safety design decision.

> The default SuperIntelligenceBuilder run reads the caller and instruction file, selects a candidate harness when discoverable, and prints the exact statement.

**Keep.** It names the dry-run actions accurately.

> It does not probe the CLI, launch a child process, create a file, or edit the workspace.

**Keep.** The negative list is useful here because it defines the execution boundary.

> Format the dry-run output as plain aligned text so logs remain readable without terminal color support.

**Keep.** It records the requested console design.

> Name the selected harness, executable, model choice, workspace, instruction state, source location, statement, non-actions, and live-run command.

**Keep.** These fields make the plan actionable and auditable.

> Use a conspicuous live-execution flag that cannot be supplied accidentally: `--yes,please,proceed`.

**Keep.** It records the exact interface and its rationale.

> Pass the flag into the core option that authorizes live execution rather than handling permission only in the sample program.

**Rewrite.** Use positive wording: “Pass the flag into the core `Proceed` option so the sample and builder enforce the same authorization state.”

> Use a second gate when the instruction file already exists.

**Keep.** It states the condition for interactive confirmation.

> Continue only for the exact terminal reply `yes, please proceed`.

**Keep.** The exact input belongs in a reusable recipe.

> Stop only for the exact terminal reply `no`.

**Keep.** It states the matching refusal input.

> Reject abbreviations, capitalization changes, added whitespace, end-of-input, and near matches.

**Keep.** It defines fail-closed parsing.

> Place confirmation before agent discovery or probing so refusal launches nothing.

**Keep.** It explains the safety consequence of ordering.

> State the consent scope beside the prompt: one run may edit workspace files, approval does not approve every edit, and the builder provides no rollback.

**Keep.** Users need these limits before consenting.

> Keep the civil voice in human-readable diagnostics while retaining stable machine-readable error codes.

**Keep.** It explains how humor and operability coexist.

> Treat a zero process exit and a valid run-specific completion report as required protocol evidence.

**Keep.** It defines successful protocol completion.

> Treat the report as the agent's assertion, not as proof that the files are correct.

**Keep.** The distinction prevents an agent from validating its own work conclusively.

## Example design

> Use examples to demonstrate distinct reader jobs rather than superficial syntax variants.

**Rewrite.** Use positive wording: “Give each example a distinct reader job and deliverable.”

> Each example should be a small runnable project that references the same reusable source and keeps its useful generated outputs available for inspection.

**Keep.** It defines the shared example structure.

> Show the real fluent statement on the example page so a reader can evaluate the task before downloading or running it.

**Keep.** This fixed a specific discoverability problem.

> State whether the example implements a feature, documents a feature, creates policy, or builds a demonstration.

**Keep.** It prevents output scope from being overstated.

> Describe every output by reader purpose rather than by a one-word tag.

**Rewrite.** Use positive wording: “Describe every output by its reader purpose; keep the filename as the linked identifier.”

> Keep shared execution behavior on the examples landing page and in the manual.

**Keep.** It names the canonical owners.

> Keep workflow-specific paths, warnings, and adoption advice on each detail page.

**Keep.** It defines what remains local.

> The specification example separated project principles, product behavior, technical decisions, and dependency-ordered work.

**Keep.** It records the first concrete example pattern.

> The static web-design example separated the brief, competing directions, recorded decision, visual system, review checklist, and generated site.

**Keep.** It records the second concrete example pattern.

> The enterprise C# example separated compiler and analyzer defaults from architecture, coding, testing, migration, rollback, and review guidance.

**Keep.** It records the enforceable-policy distinction.

> Run each example through the builder when authenticated execution is part of the claim.

**Keep.** It ties provenance claims to real runs.

> Build and inspect the generated files independently after the agent reports completion.

**Keep.** It separates generation from validation.

## Editorial pipeline

> Write in three distinct passes.

**Keep.** It introduces the required sequential method.

> Pass one is expansive: capture every verified fact, decision, command, caveat, and route a reader may need.

**Keep.** It defines the drafting stage and preserves coverage.

> Pass two is analytical: quote each sentence or logical unit in a separate review file and decide whether to keep, rewrite, remove, combine, move, or extend it.

**Keep.** It exactly captures the requested line-review method.

> Pass three applies only accepted edits and produces the reader-facing page.

**Keep.** It defines the final editorial gate.

> For every content unit, ask five questions.

**Keep.** It introduces the review rubric.

> 1. What reader task does this support?

**Keep.** It tests audience usefulness.

> 2. What new fact, instruction, constraint, choice, or route does it add?

**Keep.** It tests information value.

> 3. What source or observed behavior supports it?

**Keep.** It tests truth and evidence.

> 4. Is this the correct page and position?

**Keep.** It tests information architecture.

> 5. Should it stay, change, move, or disappear?

**Keep.** It turns the review into an action.

> Keep a sentence only when its usefulness answer is specific.

**Keep.** It prevents generic context from surviving by default.

> Use one term for each concept throughout the site.

**Keep.** It states the terminology rule.

> For this project, "coding agent" names the external CLI, "adapter" names its integration, "builder" names the C# file, and "dry run" names the non-executing path.

**Keep.** It provides the actual controlled vocabulary.

> Put conditions before actions in procedures.

**Keep.** It improves safe scanning.

> Use exact file names, flags, replies, error codes, and expected outputs.

**Keep.** It grounds instructions in real interfaces.

> Remove words that announce importance without adding a consequence.

**Keep.** It is a practical editing rule.

> Remove popularity claims from technical justification after discovery is complete.

**Keep.** It distinguishes search ranking from evidence.

> Keep the humor in the mechanism and diagnostic voice.

**Keep.** It preserves the project's character in the correct places.

> Write the surrounding setup, permissions, failures, and limits in calm literal language.

**Keep.** It states the complementary voice rule.

> Do not tell readers that the project is a joke.

**Rewrite.** Use positive wording: “Let the invented API and civil diagnostics carry the humor without labeling the project for the reader.”

> Use descriptive headings instead of slogans where a reader is scanning for an answer.

**Rewrite.** Use positive wording: “Use descriptive headings wherever readers scan for an answer.”

> End on the last useful fact rather than a generic conclusion.

**Rewrite.** Use positive wording: “End on the last useful fact.”

## Documentation architecture

> Give each fact one canonical owner.

**Keep.** This is the governing information-architecture rule.

> The manual owns setup, behavior, configuration, permissions, failure handling, and limits.

**Keep.** It names the manual's scope.

> The examples landing page owns shared example prerequisites and run steps.

**Keep.** It names the landing page's scope.

> Each example detail page owns its task, output guide, workflow-specific warnings, and evidence.

**Keep.** It names the detail page's scope.

> The About page owns the historical environment and development decisions.

**Keep.** It names About's scope.

> The LLM Recipes page owns the reusable working method and its external review sources.

**Keep.** It distinguishes the new page from About.

> When content moves, keep an old URL as a small redirect with a visible fallback link instead of maintaining duplicate prose.

**Rewrite.** Use positive wording: “When content moves, make the old URL a small redirect with a visible fallback link. Keep the full prose at its canonical destination.”

> Use the same global navigation order, current-page state, typography, spacing, rules, tables, and code panels across documentation pages.

**Keep.** This is the site-consistency contract.

> Use local section navigation for long reference pages.

**Keep.** It justifies the contents rail.

> Let a generated design artifact use its own visual system when that difference is the content being demonstrated.

**Keep.** It preserves the repair-cafe design intentionally.

> Explain that distinction on the enclosing example page so visitors do not mistake a demonstration for a live service.

**Keep.** It connects design freedom to honest content.

> Keep static pages hand-editable and self-contained when the repository requires manual maintenance.

**Keep.** It follows the parent repository's maintenance model.

> Update the parent project index and RSS feed together when the public project listing changes.

**Keep.** It records the parent-site consistency requirement.

## Web implementation recipe

> Copy the established page shell before inventing a new layout.

**Rewrite.** Use positive wording: “Start from the established page shell so the new page inherits the site's layout and behavior.”

> Preserve the design tokens, masthead, global navigation, two-column desktop grid, compact contents rail, section codes, code panels, tables, focus treatment, mobile transformation, and print behavior.

**Keep.** The list defines what visual consistency means in this site.

> Add only the styles required by the new content.

**Keep.** It limits design drift.

> Use native headings, links, buttons, tables, and landmarks before adding ARIA.

**Keep.** This is the semantic implementation rule.

> Give the page one descriptive `h1` and preserve heading order.

**Keep.** It defines the page outline.

> Give external links descriptive text and keep raw commands inside code blocks.

**Keep.** It supports scanning and accessibility.

> Expose the current global page with `aria-current="page"`.

**Keep.** It records the active-navigation requirement.

> Add a skip link and visible keyboard focus.

**Keep.** Both are required interaction affordances.

> Allow prose and inline code to wrap without causing page overflow.

**Keep.** It protects mobile reflow.

> Keep commands unwrapped when line breaks would change their meaning.

**Keep.** It preserves copy accuracy.

> Wrap long illustrative source excerpts at narrow widths when horizontal scrolling hides the instruction.

**Keep.** This rule came directly from screenshot evidence.

> Stack dense comparison rows at 320 pixels when fixed columns make descriptions unreadable.

**Keep.** It records the responsive table fix.

> Implement syntax highlighting with local CSS classes so the page works without a script or remote asset.

**Keep.** It answers the current page's highlighting requirement.

> Use color to support syntax categories, and keep the uncolored text understandable.

**Keep.** It prevents color-only meaning.

## Social preview recipe

> Write the social description in a separate three-stage record.

**Keep.** It identifies a successful independent editing workflow.

> Start with one accurate sentence that names the technical shape, mechanism, and execution boundary.

**Keep.** It gives the initial draft a concrete job.

> Write five alternatives that vary emphasis without changing facts.

**Keep.** It records the requested option-generation step.

> Compare the alternatives for clarity, specificity, length, and suitability for Telegram, X, and Facebook.

**Keep.** It names the actual decision criteria.

> Select one sentence and record why it wins.

**Keep.** It prevents an unexplained final choice.

> Use the selected sentence in standard description, Open Graph, and X metadata.

**Keep.** It maps the decision to implementation.

> Create a 1200-by-630 local preview image that states the project name and central mechanism without filling the card with documentation text.

**Rewrite.** Use positive wording: “Create a 1200-by-630 local preview image with the project name, central mechanism, and enough empty space for small previews.”

> Render the SVG to PNG with ImageMagick, verify its dimensions, and inspect the raster rather than trusting the source alone.

**Rewrite.** Use positive wording: “Render the SVG to PNG with ImageMagick, verify its dimensions, and inspect the raster output.”

> `magick social-card.svg social-card.png` and `identify social-card.png`.

**Keep as one command unit.** The commands reproduce rendering and dimension inspection.

## Evidence-first website review

> Capture the current deployed and local pages before changing them.

**Keep.** It establishes a baseline before implementation changes the evidence.

> Crawl every important link and interaction so the review covers the site rather than a favorite page.

**Rewrite.** Remove the conversational contrast: “Crawl every important link and interaction so the review covers the complete site.”

> Save full-page screenshots at desktop and mobile widths.

**Keep.** It states the minimum visual evidence.

> Read the screenshots directly and compare related pages side by side.

**Keep.** It distinguishes visual inspection from capture alone.

> Define what a good page must let a first-time visitor understand, decide, and do.

**Keep.** This is the reader-centered quality bar.

> Ask for independent read-only opinions after evidence collection and before implementation.

**Keep.** It records when independent review contributed useful judgment without granting edit authority.

> Give the reviewer the screenshots, relevant source, audience, quality bar, and exact questions.

**Keep.** It makes the second opinion reproducible and scoped.

> Separate observed evidence from the reviewer's interpretation.

**Keep.** It is an important evidence-discipline rule.

> Turn each quirk into one decision: expand, rewrite, remove, rearrange, research further, or keep.

**Rewrite.** Replace “quirk” with the more precise term “finding”: “Turn each finding into one decision: expand, rewrite, remove, rearrange, research further, or keep.”

> Write the detailed change request before editing the website.

**Keep.** It preserves the requested decision-before-implementation sequence.

> After implementation, capture equivalent screenshots and compare the same routes, viewports, and states.

**Keep.** It makes the before-and-after comparison meaningful.

> Use 1440 by 900 for desktop, 390 by 844 for a common mobile viewport, and 320 by 720 for WCAG reflow inspection.

**Keep.** The exact viewports make the method reproducible.

> Keep binary screenshots out of Git when the project wants a source-only history, but track a manifest that records target, viewport, browser, purpose, and result.

**Keep.** It explains how this repository retained review provenance without versioning generated binaries.

## Rendered-page questions

> Ask these questions for every page and breakpoint.

**Keep.** It introduces a reusable checklist.

> 1. Does the first viewport identify the page, its purpose, and the next useful route?

**Keep.** It tests orientation and progression.

> 2. Are global navigation, local navigation, and current-page state consistent?

**Keep.** It tests wayfinding across pages.

> 3. Does the content column remain readable without unused space or cramped measures?

**Keep.** It tests desktop and narrow-width composition.

> 4. Do headings, section spacing, rules, tables, and code panels match neighboring documentation pages?

**Keep.** It makes visual consistency concrete.

> 5. Does a breakpoint create overflow, hidden source, a stranded label, or an unintended visual-system change?

**Keep.** It covers common responsive failures observed during this project.

> 6. Can a keyboard user see focus and reach controls in visual order?

**Keep.** It tests keyboard operability and focus visibility.

> 7. Do links remain distinguishable without color alone?

**Keep.** It tests a specific accessibility requirement.

> 8. Are non-inline targets large enough and spaced safely?

**Keep.** It tests touch usability.

> 9. Does any copy sound interchangeable with another project?

**Keep.** It catches generic writing.

> 10. Does the page repeat behavior that belongs to a canonical owner?

**Keep.** It detects documentation drift.

> 11. Is every visual difference explained by the artifact's purpose?

**Keep.** It distinguishes intentional artifact design from accidental site inconsistency.

> 12. Do loading, empty, error, long-content, no-JavaScript, and reduced-motion states remain usable where they apply?

**Keep.** It broadens review beyond the default screenshot while limiting the states to pages where they apply.

> Automated accessibility output is an issue finder, not a completion certificate.

**Keep.** It correctly bounds automated-test evidence.

> Fix the source node named by the result and rerun the equivalent browser check.

**Keep.** It ties diagnosis, correction, and regression testing together.

## Validation ladder

> Run cheaper deterministic checks before expensive or state-changing checks.

**Keep.** It explains the order of the ladder.

> 1. Inspect the diff and run whitespace checks.

**Keep.** It catches inexpensive repository errors first.

> 2. Parse HTML, XML, JavaScript, CSS, Markdown links, and project configuration.

**Keep.** It identifies the static formats in scope.

> 3. Build the root project and every example with warnings treated as errors.

**Keep.** It defines compilation coverage and strictness.

> 4. Run the root project and examples in default dry-run mode.

**Keep.** It verifies the safe default at every executable entry point.

> 5. Test exact live flags, refusal replies, approval replies, near matches, and end-of-input without launching a paid agent when a controlled failure can prove the gate.

**Keep.** It is a precise guardrail test matrix.

> 6. Run authenticated agent integration only when the claim requires real provider execution.

**Keep.** It scopes costly external execution to claims that need it.

> 7. Inspect generated files and validate their format, links, and internal traceability independently of the agent report.

**Keep.** It prevents completion messages from serving as their own proof.

> 8. Serve the website over local HTTP and test rendered routes with Playwright.

**Keep.** It states the browser-test environment.

> 9. Run axe, keyboard flows, forms, copy controls, anchors, redirects, console checks, and overflow assertions.

**Keep.** It names the rendered behavior coverage.

> 10. Capture and inspect screenshots at the same viewports used for the baseline.

**Keep.** It preserves comparison symmetry.

> 11. Run parent-site index, preview-target, RSS XML, and item-count checks.

**Keep.** It protects the containing GitHub Pages repository.

> 12. Record only observed results and remaining platform limits.

**Keep.** It keeps the validation record honest.

> Use the repository's normal commands where they exist.

**Keep.** It prevents an explanatory page from inventing a parallel build interface.

> `dotnet build --configuration Release`, `dotnet run`, and `dotnet run -- --yes,please,proceed`.

**Keep as one command unit.** These commands cover compilation, safe default execution, and the explicit live flag.

> Serve static pages through HTTP because browser behavior can differ from `file://` loading.

**Keep.** It gives the local-server command a reason.

> `python3 -m http.server 4173 --bind 127.0.0.1`.

**Keep as one command unit.** It is the exact local preview command used by the browser harness.

> Use a disposable browser harness when Playwright and axe are not project dependencies.

**Keep.** It explains how the audit avoided adding runtime or project dependencies.

> Create a temporary npm package, install `@playwright/test@1.55.0` and `@axe-core/playwright@4.10.2` with `--no-save`, and install Chromium.

**Keep as one command unit.** The shell block is reproducible and belongs together; displaying each continuation as separate advice would be less clear.

> Validate editable HTML with explicit project style exceptions rather than rewriting the entire repository to satisfy a default formatter.

**Keep.** It preserves local source style while still applying structural validation.

> Run `html-validate` against `index.html`, `llm-recipes.html`, and `examples/index.html` with the documented rule exceptions.

**Keep as one command unit.** The multiline command records the exact validation scope and configuration.

> Use `git diff --check`, local link resolution, `node --check`, XML parsing, checksum comparison, and the parent repository's documented checks as separate evidence.

**Keep.** It distinguishes several independent proof types instead of collapsing them into a generic “tests passed” claim.

## Tool map

> `.NET SDK` compiled the builder and all examples and ran the dry-run and guardrail paths.

**Keep.** It states the tool's verified role.

> `Codex CLI` provided the authenticated coding-agent runs that produced the checked-in example outputs.

**Keep.** It records how the agent-authored deliverables were generated.

> `git` exposed repository state, diffs, source revisions, and preservation checks.

**Keep.** It accurately describes the version-control evidence.

> `ripgrep` located files, symbols, copy patterns, links, headings, and stale terms quickly.

**Keep.** It records the repository-search role.

> `Node.js` ran link checks, JavaScript syntax checks, Playwright, axe, and small deterministic repository assertions.

**Keep.** It consolidates related JavaScript-based tooling without losing detail.

> `Python` served the static site and parsed XML where a standard-library check was sufficient.

**Keep.** It states two specific uses.

> `Playwright Chromium` loaded real pages, exercised navigation and controls, measured overflow and target geometry, and captured screenshots.

**Keep.** It explains why source inspection alone was insufficient.

> `axe-core` localized rendered accessibility violations such as insufficient contrast and nested landmarks.

**Keep.** It names the actionable contribution.

> `html-validate` caught invalid or unnecessary ARIA attributes that a visual pass did not expose.

**Keep.** It records a complementary static check.

> `ImageMagick` rendered and inspected the social preview image and reported image dimensions.

**Keep.** It states the complete image verification role.

> `sha256sum` proved that a protected file remained byte-for-byte unchanged during a scoped redesign.

**Keep.** It gives a concrete preservation use rather than listing the tool without context.

> Read-only reviewer agents supplied independent editorial and visual opinions after they received the same evidence and constraints.

**Keep.** It records how second opinions were controlled and comparable.

> The primary reviewer checked every accepted finding against source or rendered behavior before adding it to the plan.

**Keep.** It explains that independent opinions were inputs, not automatic decisions.

## Evidence records

> Keep planning, editorial, and validation evidence separate because they answer different questions.

**Keep.** It introduces a useful records model.

> The change request records what was wrong, what decision was made, which files would change, and how each change would be tested.

**Keep.** It defines the planning record.

> The sentence review records why each content unit was kept, rewritten, moved, combined, extended, or removed.

**Keep.** It defines this editorial record.

> The validation record states commands, environments, observed results, and limits.

**Keep.** It defines the verification record.

> The screenshot manifest describes binary evidence without requiring the binaries to be committed.

**Keep.** It explains the source-only screenshot policy.

> The generated output files are deliverables, while build products and transient run reports are reproducible evidence and remain ignored.

**Keep.** It distinguishes checked-in outputs from disposable artifacts.

> Agent completion reports remain provenance, not independent validation.

**Keep.** It is an essential evidence boundary.

> Use counts only when the counting method and scope are named.

**Keep.** It prevents ambiguous metrics.

> Keep “not tested” separate from “failed.”

**Keep.** It prevents two different validation states from being conflated.

> Keep a historical page unchanged when the task requires historical integrity, even if a later page uses a newer navigation system.

**Keep.** It records the preservation decision used during the earlier redesign. The new Recipes request now authorizes a narrow global-navigation addition, but does not invalidate the earlier method.

## Reusable pseudocode

> `recipe DeliverAgentAssistedProject(request, repository):` followed by the full staged pseudocode block.

**Keep as one structural unit with one rewrite.** The block compresses the method without losing stage order. Replace `remove_temporary_tools_and_keep_reproducible_evidence()` with `keep_temporary_tools_outside_the_product_checkout()` because the successful practice was isolation, not removal as a universal requirement.

> The stopping condition is evidence, not the absence of visible errors.

**Remove.** It is a slogan immediately followed by a more useful and testable stopping condition.

> Every requested artifact must exist, every planned check must have a recorded result, every accepted issue must map to a change, and every behavior claim must map to source or observation.

**Keep.** It is the concrete definition of completion.

## Review outcome

The draft covers the complete successful method at useful depth. The final page will preserve that coverage while applying the targeted rewrites above, omitting the unused disposable-clone refresh branch, and organizing the material for scanning. The expansive draft remains unchanged as the stage-one record; the HTML page will be the edited reader-facing result.
