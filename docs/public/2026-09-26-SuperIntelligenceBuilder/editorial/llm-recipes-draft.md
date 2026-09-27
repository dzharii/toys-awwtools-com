# R00 LLM recipes

## Motivation

This page records a reusable method for researching, building, documenting, and validating an agent-assisted software project.

The method was developed while turning SuperIntelligenceBuilder from an unvalidated C# experiment into a runnable project with three examples, guarded execution, connected documentation, and browser-tested pages.

It is a working reference rather than a conversation transcript.

Each recipe names the input, action, evidence, and stopping condition that made the work dependable.

The page keeps project-specific details where they make the method concrete and separates them from rules that transfer to another repository.

## Reference shelf

The review used four skill repositories as temporary reading material.

They were discovery and review inputs, not runtime dependencies, copied policy, or proof that a result was correct.

### Technical Writer

Repository: [riekelt/technical-writer](https://github.com/riekelt/technical-writer)

Reviewed revision: `85e53729dd959a2795d593d6769068e342cf3486`

Files used: `technical-writing/SKILL.md`, `technical-writing/references/style.md`, `technical-writing/references/truth.md`, and `reviewing-technical-prose/SKILL.md`.

The document checkpoint was useful: classify the document, name its audience, state the reader's task, and set non-goals before drafting.

The document-kind distinction prevented one edit rule from being applied everywhere.

Descriptive documentation was updated to match the implementation, historical records were preserved, and reference tables were checked for completeness.

The truth rules separated facts observed in source, facts observed in tests, statements reported by an agent, and conclusions drawn by the reviewer.

The style rules supplied two practical tests: read the text aloud and remove the product name to see whether the remaining sentence still says anything specific.

The final-review skill supplied the last pass for claims, links, terminology, heading structure, and cold readability.

### Cursor technical-writing and unslop skills

Repository: [cursor/plugins](https://github.com/cursor/plugins)

Reviewed revision: `ecc249f1e306fc64ddf83c7bed16cacf7c2239db`

Files used: `pstack/skills/technical-writing/SKILL.md` and `pstack/skills/unslop/SKILL.md`.

The technical-writing skill helped separate tutorial, how-to, reference, and explanation content instead of asking one page to perform every job.

Its sentence rules favored direct actors, conditions before actions, real symbols and flags, and one stable term for each concept.

The unslop pass removed generic claims, throat clearing, synonym cycling, decorative conclusions, inflated adjectives, and wording that could fit any software project.

The most useful test was concrete: if a sentence did not change what a reader could know or do, it was removed or rewritten.

### Vercel web and writing guidelines

Repository: [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills)

Reviewed revision: `063bee94c3f4df8453406c830b0a7df0f2860278`

Files used: `skills/web-design-guidelines/SKILL.md` and `skills/writing-guidelines/SKILL.md`.

These skills point reviewers to current upstream rule sets, so the current source should be fetched again before a later audit.

The web review contributed checks for semantic controls, keyboard focus, visible focus, navigation state, target size, responsive overflow, and honest loading or empty states.

The writing review reinforced descriptive headings, direct link labels, compact prose, and consistent naming.

The guidelines were treated as prompts for judgment when their general style differed from the established documentation design.

### Web quality and accessibility skills

Repository: [addyosmani/web-quality-skills](https://github.com/addyosmani/web-quality-skills)

Reviewed revision: `afa8da942115f2961fdbfa80807ea0b232ff6c00`

Files used: `web-quality-audit/SKILL.md`, `accessibility/SKILL.md`, `accessibility/references/A11Y-PATTERNS.md`, and `accessibility/references/WCAG.md`.

The evidence-led audit order was the useful part: define representative routes and states, measure the rendered page, use failures to localize source review, fix the source, and rerun the same checks.

The accessibility material supplied concrete checks for 320-pixel reflow, 4.5:1 normal-text contrast, 24-by-24-pixel minimum targets, native semantics, labels, status regions, logical focus order, and consistent navigation.

The audit explicitly warns that an automated score does not prove accessibility, so keyboard interaction and direct screenshot review remained separate checks.

### Project and voice references

[skills.sh](https://skills.sh/) was used to discover candidate skills and compare adoption signals.

Popularity narrowed the search; source quality, scope, license, and applicability determined whether a rule was used.

[Bespoke: A Programming Language for People Who Say Please](https://blog.hofstede.it/bespoke-a-programming-language-for-people-who-say-please/) supplied the civil diagnostic voice and the deliberately exact confirmation phrase.

The implementation remained ordinary C#, and the documentation states that boundary directly.

[DreamBerd](https://github.com/gabenugget/DreamBerd), [Rockstar](https://codewithrockstar.com/docs/), and an [English programming-language documentation experiment](https://passo.uno/experiment-humour-documentation/) showed a useful editorial pattern.

The premise can be playful while setup, behavior, errors, and limitations are written as serious technical documentation.

[GitHub Spec Kit](https://github.com/github/spec-kit) informed the separation of constitution, specification, plan, and tasks in the specification example.

[Warp's write-product-spec skill](https://skills.sh/warpdotdev/common-skills/write-product-spec) informed the separation of user-visible behavior from technical planning.

[Anthropic's frontend-design skill](https://skills.sh/anthropics/skills/frontend-design) informed the requirement for a specific visual direction rather than a generic card layout.

[Vercel's web-design-guidelines skill](https://skills.sh/vercel-labs/agent-skills/web-design-guidelines) informed the static-site accessibility and interaction review.

[Microsoft C# coding conventions](https://learn.microsoft.com/dotnet/csharp/fundamentals/coding-style/coding-conventions) and [Microsoft architectural principles](https://learn.microsoft.com/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles) were the technical basis for the enterprise C# example.

[GitHub's dotnet-best-practices skill](https://skills.sh/github/awesome-copilot/dotnet-best-practices) was used only as a research pointer, not as copied policy or a substitute for Microsoft documentation.

Official vendor documentation remained the authority for .NET, Codex, Claude Code, GitHub Copilot CLI, and every cataloged command-line tool.

## Clone convention

Keep research repositories outside the product checkout unless the project intentionally vendors them.

Use `skills__OWNER__REPOSITORY` for skill collections so search results group by purpose and preserve provenance.

Use a disposable root with an explicit name rather than an ambiguous directory such as `tmp` or `misc`.

```sh
research_root="${TMPDIR:-/tmp}/sib-llm-references"
mkdir -p "$research_root"

git clone --depth 1 https://github.com/riekelt/technical-writer.git \
  "$research_root/skills__riekelt__technical-writer"
git clone --depth 1 https://github.com/cursor/plugins.git \
  "$research_root/skills__cursor__plugins"
git clone --depth 1 https://github.com/vercel-labs/agent-skills.git \
  "$research_root/skills__vercel-labs__agent-skills"
git clone --depth 1 https://github.com/addyosmani/web-quality-skills.git \
  "$research_root/skills__addyosmani__web-quality-skills"
```

`--depth 1` fetches the current commit and omits older history, which is enough for a review that reads current files.

Record the reviewed commit before using any rule in a durable decision record.

```sh
for repo in "$research_root"/skills__*; do
  printf '%s\t' "$(basename "$repo")"
  git -C "$repo" rev-parse HEAD
done
```

Find the instruction files before reading adjacent material.

```sh
find "$research_root" -name SKILL.md -o -path '*/references/*.md' | sort
```

Read only the skill and references that answer the current task, but read each selected instruction file completely.

Refresh a disposable clone by deleting and cloning it again, or update a retained clone with an explicit fast-forward pull.

```sh
git -C "$research_root/skills__riekelt__technical-writer" pull --ff-only
```

These repositories contain guidance rather than a project executable, so there is no shared run command.

## Work contract

Start by converting the request into a work contract.

The contract identifies the objective, editable files, preserved files, permitted tools, required artifacts, destructive boundaries, and proof of completion.

Read the nearest `AGENTS.md` and every applicable parent instruction before editing.

Translate explicit sequencing words such as "first," "only after," and "do not skip" into ordered checklist dependencies.

Separate read-only diagnosis from implementation so the evidence exists before a proposed fix can change it.

Write down exceptions that must survive the change, such as a page that must remain byte-for-byte unchanged.

Define the audience as a person with a task, not as the generic word "users."

For this project, the primary readers were a curious developer, a developer considering a local run, a developer inspecting generated outputs, and a maintainer integrating the single-file builder.

The page quality bar followed from those reader jobs: explain the project, show a safe first action, expose the real task, describe the outputs, and state the evidence limits.

## Repository inventory

Inspect before installing or editing.

Map the entry point, reusable source, project files, instructions, generated outputs, documentation, ignored artifacts, and parent-site integration.

Use fast repository searches to find files and concepts.

```sh
rg --files
rg -n "WithFile|Proceed|Preview|ConfirmationRequired|AgentKind" .
git status --short
```

Read the implementation behind every public behavior claim.

For SuperIntelligenceBuilder, that meant tracing the call-site source read, dry-run return, existing-file confirmation, adapter discovery, compatibility probes, workspace lock, process launch, and completion-report parser.

Distinguish the builder's own writes from edits requested of the coding agent.

The builder preserves an existing instruction file, while a source-defined task may explicitly ask the agent to replace that file.

Inspect `.gitignore` before building so generated binaries, run reports, and evidence images do not become accidental deliverables.

Track useful source artifacts such as `AGENTS.md`, specifications, design decisions, policies, HTML, CSS, and JavaScript.

Ignore reproducible build output, runtime reports, workspace locks, and binary screenshots when the repository keeps only an evidence manifest.

## Research ledger

Research starts with questions, not browsing.

Create one ledger row for each unstable or unfamiliar claim: question, preferred source, observed answer, project decision, and verification date.

Use primary sources for installation commands, CLI flags, framework behavior, language versions, and accessibility standards.

Use skills and example projects for review heuristics, structure, and vocabulary rather than as authority for another product's behavior.

Use popularity only to select what to inspect first.

Read the source and decide which exact rule transfers to the project.

Keep copied text out of the deliverable unless quotation is necessary and licensed.

Link the source, state the borrowed idea, and explain the project-specific application.

Date facts that can change, such as vendor CLI installation steps.

Keep stable implementation facts tied to source or tests rather than a web page.

## Detailed task plan

Create a change-request file before implementation when the work spans design, copy, behavior, and validation.

The plan should name where to look, what question to ask, the decision to make, the file to change, and the check that will prove the result.

Use one checklist item per observable outcome.

Do not combine independent defects into a single item merely because one patch could change both.

Freeze the issue list before editing so the final report can map each change back to evidence.

Record non-goals to stop adjacent improvements from expanding the task silently.

Mark an item complete only after its matching validation passes.

For the website redesign, the issue list covered visual-system drift, navigation order, Guardrails ownership, joke-forward copy, hidden tasks, incomplete output descriptions, incorrect first-run instructions, mobile layout, and evidence handling.

## Safe execution contract

Make the default command observational when an agent can edit a workspace.

The default SuperIntelligenceBuilder run reads the caller and instruction file, selects a candidate harness when discoverable, and prints the exact statement.

It does not probe the CLI, launch a child process, create a file, or edit the workspace.

Format the dry-run output as plain aligned text so logs remain readable without terminal color support.

Name the selected harness, executable, model choice, workspace, instruction state, source location, statement, non-actions, and live-run command.

Use a conspicuous live-execution flag that cannot be supplied accidentally: `--yes,please,proceed`.

Pass the flag into the core option that authorizes live execution rather than handling permission only in the sample program.

Use a second gate when the instruction file already exists.

Continue only for the exact terminal reply `yes, please proceed`.

Stop only for the exact terminal reply `no`.

Reject abbreviations, capitalization changes, added whitespace, end-of-input, and near matches.

Place confirmation before agent discovery or probing so refusal launches nothing.

State the consent scope beside the prompt: one run may edit workspace files, approval does not approve every edit, and the builder provides no rollback.

Keep the civil voice in human-readable diagnostics while retaining stable machine-readable error codes.

Treat a zero process exit and a valid run-specific completion report as required protocol evidence.

Treat the report as the agent's assertion, not as proof that the files are correct.

## Example design

Use examples to demonstrate distinct reader jobs rather than superficial syntax variants.

Each example should be a small runnable project that references the same reusable source and keeps its useful generated outputs available for inspection.

Show the real fluent statement on the example page so a reader can evaluate the task before downloading or running it.

State whether the example implements a feature, documents a feature, creates policy, or builds a demonstration.

Describe every output by reader purpose rather than by a one-word tag.

Keep shared execution behavior on the examples landing page and in the manual.

Keep workflow-specific paths, warnings, and adoption advice on each detail page.

The specification example separated project principles, product behavior, technical decisions, and dependency-ordered work.

The static web-design example separated the brief, competing directions, recorded decision, visual system, review checklist, and generated site.

The enterprise C# example separated compiler and analyzer defaults from architecture, coding, testing, migration, rollback, and review guidance.

Run each example through the builder when authenticated execution is part of the claim.

Build and inspect the generated files independently after the agent reports completion.

## Editorial pipeline

Write in three distinct passes.

Pass one is expansive: capture every verified fact, decision, command, caveat, and route a reader may need.

Pass two is analytical: quote each sentence or logical unit in a separate review file and decide whether to keep, rewrite, remove, combine, move, or extend it.

Pass three applies only accepted edits and produces the reader-facing page.

For every content unit, ask five questions.

1. What reader task does this support?
2. What new fact, instruction, constraint, choice, or route does it add?
3. What source or observed behavior supports it?
4. Is this the correct page and position?
5. Should it stay, change, move, or disappear?

Keep a sentence only when its usefulness answer is specific.

Use one term for each concept throughout the site.

For this project, "coding agent" names the external CLI, "adapter" names its integration, "builder" names the C# file, and "dry run" names the non-executing path.

Put conditions before actions in procedures.

Use exact file names, flags, replies, error codes, and expected outputs.

Remove words that announce importance without adding a consequence.

Remove popularity claims from technical justification after discovery is complete.

Keep the humor in the mechanism and diagnostic voice.

Write the surrounding setup, permissions, failures, and limits in calm literal language.

Do not tell readers that the project is a joke.

Use descriptive headings instead of slogans where a reader is scanning for an answer.

End on the last useful fact rather than a generic conclusion.

## Documentation architecture

Give each fact one canonical owner.

The manual owns setup, behavior, configuration, permissions, failure handling, and limits.

The examples landing page owns shared example prerequisites and run steps.

Each example detail page owns its task, output guide, workflow-specific warnings, and evidence.

The About page owns the historical environment and development decisions.

The LLM Recipes page owns the reusable working method and its external review sources.

When content moves, keep an old URL as a small redirect with a visible fallback link instead of maintaining duplicate prose.

Use the same global navigation order, current-page state, typography, spacing, rules, tables, and code panels across documentation pages.

Use local section navigation for long reference pages.

Let a generated design artifact use its own visual system when that difference is the content being demonstrated.

Explain that distinction on the enclosing example page so visitors do not mistake a demonstration for a live service.

Keep static pages hand-editable and self-contained when the repository requires manual maintenance.

Update the parent project index and RSS feed together when the public project listing changes.

## Web implementation recipe

Copy the established page shell before inventing a new layout.

Preserve the design tokens, masthead, global navigation, two-column desktop grid, compact contents rail, section codes, code panels, tables, focus treatment, mobile transformation, and print behavior.

Add only the styles required by the new content.

Use native headings, links, buttons, tables, and landmarks before adding ARIA.

Give the page one descriptive `h1` and preserve heading order.

Give external links descriptive text and keep raw commands inside code blocks.

Expose the current global page with `aria-current="page"`.

Add a skip link and visible keyboard focus.

Allow prose and inline code to wrap without causing page overflow.

Keep commands unwrapped when line breaks would change their meaning.

Wrap long illustrative source excerpts at narrow widths when horizontal scrolling hides the instruction.

Stack dense comparison rows at 320 pixels when fixed columns make descriptions unreadable.

Implement syntax highlighting with local CSS classes so the page works without a script or remote asset.

Use color to support syntax categories, and keep the uncolored text understandable.

## Social preview recipe

Write the social description in a separate three-stage record.

Start with one accurate sentence that names the technical shape, mechanism, and execution boundary.

Write five alternatives that vary emphasis without changing facts.

Compare the alternatives for clarity, specificity, length, and suitability for Telegram, X, and Facebook.

Select one sentence and record why it wins.

Use the selected sentence in standard description, Open Graph, and X metadata.

Create a 1200-by-630 local preview image that states the project name and central mechanism without filling the card with documentation text.

Render the SVG to PNG with ImageMagick, verify its dimensions, and inspect the raster rather than trusting the source alone.

```sh
magick social-card.svg social-card.png
identify social-card.png
```

## Evidence-first website review

Capture the current deployed and local pages before changing them.

Crawl every important link and interaction so the review covers the site rather than a favorite page.

Save full-page screenshots at desktop and mobile widths.

Read the screenshots directly and compare related pages side by side.

Define what a good page must let a first-time visitor understand, decide, and do.

Ask for independent read-only opinions after evidence collection and before implementation.

Give the reviewer the screenshots, relevant source, audience, quality bar, and exact questions.

Separate observed evidence from the reviewer's interpretation.

Turn each quirk into one decision: expand, rewrite, remove, rearrange, research further, or keep.

Write the detailed change request before editing the website.

After implementation, capture equivalent screenshots and compare the same routes, viewports, and states.

Use 1440 by 900 for desktop, 390 by 844 for a common mobile viewport, and 320 by 720 for WCAG reflow inspection.

Keep binary screenshots out of Git when the project wants a source-only history, but track a manifest that records target, viewport, browser, purpose, and result.

## Rendered-page questions

Ask these questions for every page and breakpoint.

1. Does the first viewport identify the page, its purpose, and the next useful route?
2. Are global navigation, local navigation, and current-page state consistent?
3. Does the content column remain readable without unused space or cramped measures?
4. Do headings, section spacing, rules, tables, and code panels match neighboring documentation pages?
5. Does a breakpoint create overflow, hidden source, a stranded label, or an unintended visual-system change?
6. Can a keyboard user see focus and reach controls in visual order?
7. Do links remain distinguishable without color alone?
8. Are non-inline targets large enough and spaced safely?
9. Does any copy sound interchangeable with another project?
10. Does the page repeat behavior that belongs to a canonical owner?
11. Is every visual difference explained by the artifact's purpose?
12. Do loading, empty, error, long-content, no-JavaScript, and reduced-motion states remain usable where they apply?

Automated accessibility output is an issue finder, not a completion certificate.

Fix the source node named by the result and rerun the equivalent browser check.

## Validation ladder

Run cheaper deterministic checks before expensive or state-changing checks.

1. Inspect the diff and run whitespace checks.
2. Parse HTML, XML, JavaScript, CSS, Markdown links, and project configuration.
3. Build the root project and every example with warnings treated as errors.
4. Run the root project and examples in default dry-run mode.
5. Test exact live flags, refusal replies, approval replies, near matches, and end-of-input without launching a paid agent when a controlled failure can prove the gate.
6. Run authenticated agent integration only when the claim requires real provider execution.
7. Inspect generated files and validate their format, links, and internal traceability independently of the agent report.
8. Serve the website over local HTTP and test rendered routes with Playwright.
9. Run axe, keyboard flows, forms, copy controls, anchors, redirects, console checks, and overflow assertions.
10. Capture and inspect screenshots at the same viewports used for the baseline.
11. Run parent-site index, preview-target, RSS XML, and item-count checks.
12. Record only observed results and remaining platform limits.

Use the repository's normal commands where they exist.

```sh
dotnet build --configuration Release
dotnet run
dotnet run -- --yes,please,proceed
```

Serve static pages through HTTP because browser behavior can differ from `file://` loading.

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Use a disposable browser harness when Playwright and axe are not project dependencies.

```sh
browser_root="${TMPDIR:-/tmp}/sib-browser-audit"
mkdir -p "$browser_root"
cd "$browser_root"
npm init -y
npm install --no-save @playwright/test@1.55.0 @axe-core/playwright@4.10.2
npx playwright install chromium
```

Validate editable HTML with explicit project style exceptions rather than rewriting the entire repository to satisfy a default formatter.

```sh
npx --yes html-validate@10.4.0 \
  --rule doctype-style:off \
  --rule void-style:off \
  --rule prefer-native-element:off \
  index.html llm-recipes.html examples/index.html
```

Use `git diff --check`, local link resolution, `node --check`, XML parsing, checksum comparison, and the parent repository's documented checks as separate evidence.

## Tool map

`.NET SDK` compiled the builder and all examples and ran the dry-run and guardrail paths.

`Codex CLI` provided the authenticated coding-agent runs that produced the checked-in example outputs.

`git` exposed repository state, diffs, source revisions, and preservation checks.

`ripgrep` located files, symbols, copy patterns, links, headings, and stale terms quickly.

`Node.js` ran link checks, JavaScript syntax checks, Playwright, axe, and small deterministic repository assertions.

`Python` served the static site and parsed XML where a standard-library check was sufficient.

`Playwright Chromium` loaded real pages, exercised navigation and controls, measured overflow and target geometry, and captured screenshots.

`axe-core` localized rendered accessibility violations such as insufficient contrast and nested landmarks.

`html-validate` caught invalid or unnecessary ARIA attributes that a visual pass did not expose.

`ImageMagick` rendered and inspected the social preview image and reported image dimensions.

`sha256sum` proved that a protected file remained byte-for-byte unchanged during a scoped redesign.

Read-only reviewer agents supplied independent editorial and visual opinions after they received the same evidence and constraints.

The primary reviewer checked every accepted finding against source or rendered behavior before adding it to the plan.

## Evidence records

Keep planning, editorial, and validation evidence separate because they answer different questions.

The change request records what was wrong, what decision was made, which files would change, and how each change would be tested.

The sentence review records why each content unit was kept, rewritten, moved, combined, extended, or removed.

The validation record states commands, environments, observed results, and limits.

The screenshot manifest describes binary evidence without requiring the binaries to be committed.

The generated output files are deliverables, while build products and transient run reports are reproducible evidence and remain ignored.

Agent completion reports remain provenance, not independent validation.

Use counts only when the counting method and scope are named.

Keep "not tested" separate from "failed."

Keep a historical page unchanged when the task requires historical integrity, even if a later page uses a newer navigation system.

## Reusable pseudocode

```text
recipe DeliverAgentAssistedProject(request, repository):
    contract := read_instructions_and_define_scope(request, repository)
    inventory := map_source_docs_outputs_and_ignored_artifacts(repository)
    questions := list_unstable_unfamiliar_and_high_risk_claims(inventory)
    sources := research_primary_sources_and_selected_skills(questions)
    plan := write_evidence_linked_checklist(contract, inventory, sources)

    validate_existing_state(plan)
    implement_one_bounded_change_at_a_time(plan)
    build_and_run_default_dry_paths()

    if real_agent_output_is_part_of_the_claim:
        require_explicit_execution_flag()
        require_exact_existing_file_confirmation_when_applicable()
        run_authenticated_agent()
        inspect_outputs_independently_of_agent_report()

    draft := write_complete_reader_facing_content()
    review := quote_and_decide_every_content_unit(draft)
    page := apply_only_accepted_editorial_decisions(review)

    before := capture_routes_viewports_states()
    implement_documentation_shell_and_content(page)
    after := capture_equivalent_routes_viewports_states()
    compare(before, after)

    run_static_build_runtime_browser_accessibility_and_parent_checks()
    record_observed_results_and_limits()
    remove_temporary_tools_and_keep_reproducible_evidence()

    return source_files, generated_outputs, documentation, review_records, validation_record
```

The stopping condition is evidence, not the absence of visible errors.

Every requested artifact must exist, every planned check must have a recorded result, every accepted issue must map to a change, and every behavior claim must map to source or observation.
