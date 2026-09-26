# Change request: coherent project documentation

Status: approved for implementation by the originating request; implementation follows this document.

Date: 2026-09-26

Scope: the public documentation for SuperIntelligenceBuilder at `https://toys.awwtools.com/public/2026-09-26-SuperIntelligenceBuilder/`.

Explicit constraint: do not modify `about.html`.

## 1. Why this change exists

The project currently presents two different documentation systems.

The manual and About page use a compact reference design: a restrained cream background, dark green type, rust section codes, a thin masthead, a narrow reading column, a contents rail, tables, and quiet code blocks. The Examples landing page, three example detail pages, and Guardrails page switch to a second system with oversized promotional headings, cards, filled buttons, different spacing, different navigation, and a different page width.

The second system is internally consistent, but it is not consistent with the project that contains it. The transition occurs when a reader clicks `Examples`, so it looks like an accidental theme change rather than an intentional distinction between content types.

The copy compounds the visual break. The largest Examples headline calls the project a “fluent joke.” That tells readers to discount the project before the page explains the real source-driven task mechanism, safety behavior, generated outputs, or validation. The premise is humorous, but the implementation and its documentation are real. The invented fluent method names and polite confirmation protocol already carry the humor; the surrounding prose should explain them calmly.

The separate Guardrails page creates another information-architecture problem. Its useful content describes the execution path readers need while following the manual, yet the manual omits the full confirmation sequence and the `ConfirmationRequired` failure. A reader should not have to infer that a separate navigation tab is required to understand the run command.

## 2. Required working method

This change follows the requested sequence without combining discovery, judgment, planning, implementation, and verification.

1. Observe the deployed site before editing.
2. Click through every documentation page and important interaction.
3. Save full-page desktop and mobile screenshots.
4. Inspect the screenshots, not only the source or computed styles.
5. Inventory headings, links, body content, console errors, dimensions, and visual-system values.
6. Obtain independent user-experience and editorial opinions without permitting edits.
7. Define the likely readers, their intent, and the standard for a good page.
8. Research comparable technical projects whose premise carries humor.
9. Review every reader-facing sentence, heading, table row, and output-list item.
10. Record each observed quirk and a specific decision.
11. Record the intended file-by-file redesign and copy changes.
12. Implement only after this change request is complete.
13. Validate each corrected behavior and page individually.
14. Capture matching after screenshots and compare them with the before evidence.
15. Run the repository and parent-site validation checks.

The techniques used are: deployed-site observation, link traversal, Playwright screenshots, desktop/mobile comparison, interaction capture, DOM/content inventory, visual inspection, reader-sentiment review, independent second opinions, rubber-duck explanation, line-by-line editing, table-item review, terminology normalization, external pattern research, information-architecture review, quirk-by-quirk decisions, compatibility preservation, and browser regression testing.

## 3. Evidence collected before implementation

The deployed site was opened with Playwright 1.55 and Chromium. All important documentation links were clicked. Eight pages were captured at 1440 by 900 and 390 by 844:

- Manual
- About
- Guardrails
- Examples landing page
- Specification workflow detail
- Static web design detail
- Enterprise C# detail
- Generated repair-cafe site

Two additional interactions were captured:

- Manual section filtering with `permissions`
- Repair-cafe item check without a selected item type

The screenshots are stored locally under `review-evidence/before/`. The audit produced no browser console or page errors and no horizontal overflow. This is important: the change is not motivated by a broken renderer. It is motivated by a broken presentation system, incomplete guidance, and copy that does not serve the reader.

Observed design values reinforce the visual evidence:

| Page family                     | Body background                  | Header construction                   | Content model                                  |
| ------------------------------- | -------------------------------- | ------------------------------------- | ---------------------------------------------- |
| Manual / About                  | `rgb(250, 249, 245)`             | direct flex masthead with a thin rule | contents rail plus narrow reference column     |
| Examples / details / Guardrails | `rgb(246, 243, 234)`             | wrapper-based top bar                 | wide hero, cards, buttons, full-width sections |
| Generated repair-cafe site      | purpose-built palette and layout | product-specific header               | independent demonstration artifact             |

The generated repair-cafe site is expected to have its own art direction. It is the demonstrated output, not the documentation shell. The inconsistency to fix is among pages that explain SuperIntelligenceBuilder.

## 4. Likely readers and their intentions

### 4.1 Curious developer

They followed a link or saw a shared preview. They want to know what the project does, whether the fluent methods are real, and whether the project is usable or only a sketch.

They need:

- one plain-language definition;
- a real source example;
- an explanation of what is implemented and what is interpreted;
- an obvious path to runnable examples.

### 4.2 Developer considering a local run

They want prerequisites, a safe inspection command, the exact live-run command, the confirmation behavior, and an honest statement about what may change.

They need:

- the difference between `--yes,please,proceed` and the interactive `yes, please proceed` reply;
- the fact that checked-in `AGENTS.md` files cause confirmation on the first live run from this repository;
- the fact that dry run does not authenticate or compatibility-test the selected CLI;
- the fact that live reruns may replace checked-in example outputs.

### 4.3 Developer evaluating the output

They do not want to download a source file merely to discover what task was asked. They want to inspect the fluent chain, the produced artifacts, the purpose of each file, and the evidence that was actually checked.

They need:

- the representative or complete fluent statement;
- meaningful artifact descriptions rather than one-word tags;
- direct links to output files;
- validation claims whose scope is explicit.

### 4.4 Maintainer integrating the builder

They want the single-file dependency contract, configuration options, agent permissions, failure behavior, limits, and source-path constraints.

They need a compact reference page, not a promotional landing page.

## 5. Definition of a good page for this project

A good page:

1. Answers “what is this?” before asking the reader to appreciate the premise.
2. Uses the same documentation shell as the manual and About page.
3. Gives each page one job and an accurate information title.
4. Lets the concept carry the humor without calling itself a joke.
5. Shows real source and real output before making broad claims.
6. Distinguishes safe inspection from live execution.
7. States consequential behavior beside the command that triggers it.
8. Uses stable terms: builder, coding agent, adapter, dry run, live run, instruction file, completion report.
9. Separates what was generated, what was validated, and what remains an agent assertion.
10. Uses headings, tables, and code blocks to reduce search time rather than to decorate the page.
11. Works at desktop and mobile widths without changing its information hierarchy.
12. Preserves the generated repair-cafe site as an intentionally distinct output while labeling it clearly as a demonstration from its documentation page.

The rubber-duck version is: “This is one C# file. `WithFile` reads the caller’s source. The installed coding agent interprets the invented method names and literal arguments as a task. A dry run shows what would happen. A live run requires an explicit flag, and an existing instruction file requires a second exact reply. The examples show the task, the resulting files, and the checks.” If a page does not help a reader understand one of those facts, it should be shortened, moved, or removed.

## 6. Research and editorial direction

The research was not used to copy visual styles. It was used to decide how a humorous technical premise should be written.

### DreamBerd

Source: <https://github.com/gabenugget/DreamBerd>

DreamBerd documents impossible language features in the structure of a programming-language reference. Its examples, headings, and feature-by-feature explanations make the premise legible. The documentation does not need a large introductory warning that the reader is supposed to laugh; each rule demonstrates the premise.

Decision for this project: use normal technical-documentation structure and let the imaginary method names provide the incongruity.

### Rockstar

Sources: <https://codewithrockstar.com/> and <https://codewithrockstar.com/docs/>

Rockstar separates its landing page, tutorial, reference, interpreter, and examples. Its documentation navigation is task-oriented even when section descriptions use themed language.

Decision for this project: separate overview, running, reference, examples, and validation by reader task. The manual and examples must still share one shell.

### English Programming Language documentation experiment

Source: <https://passo.uno/experiment-humour-documentation/>

The author identifies code examples, familiar README sections, and a serious authoritative tone as ingredients that made the parody credible. The useful principle is not solemnity. It is structural credibility.

Decision for this project: remove self-deprecating labels and improve the ratio of concrete source/output to slogan.

### Bespoke

Source: <https://blog.hofstede.it/bespoke-a-programming-language-for-people-who-say-please/>

Bespoke sustains a polite-computing premise through precise type, mutation, control-flow, concurrency, and diagnostic sections. The themed language remains understandable because each passage describes a recognizable programming construct.

Decision for this project: retain the polite confirmation and diagnostic voice, but explain behavior directly in the manual. Internal themed class names are implementation detail, not primary user guidance.

## 7. Independent opinions

Two read-only reviewers assessed the pages independently.

The user-experience review found that Examples feels like a separate product site, Guardrails is narrower than its title suggests, the repair-cafe artifact needs clearer demonstration context, and the example pages show filenames where a reader needs a guided tour of the output.

The editorial review found incomplete quick-start instructions, inconsistent terminology, an incorrect “on a later run” claim, incomplete individual-download guidance, missing fluent task statements, ambiguous validation claims, and more than one hundred sentence/table-level opportunities for clarification.

Both reviews agreed on the core direction:

- use the manual/About design language;
- merge execution consent into the manual;
- leave About unchanged;
- replace joke-forward headlines with accurate information titles;
- show source tasks and explain outputs;
- distinguish observed validation from assertion;
- keep humor in the mechanism and voice.

## 8. Quirk-by-quirk findings and decisions

Each item below is independently actionable. Implementation and testing must not treat the list as one undifferentiated redesign.

### Q01 — Examples changes visual systems

Before: Examples loads a separate wide editorial theme with an oversized hero, cards, and buttons.

Reader effect: the site appears to change ownership or purpose at the main navigation boundary.

Decision: rebuild Examples with the manual’s masthead, section codes, compact title scale, contents rail, reading width, rules, tables, and code boxes.

Verification: compare computed colors, font family, masthead structure, title scale, maximum reading width, and screenshot composition.

### Q02 — Example details repeat the inconsistent theme

Before: all three details share the second theme rather than the project manual.

Decision: use the same documentation shell on every detail page, with page-specific section navigation.

Verification: capture and inspect each page separately at desktop and mobile widths.

### Q03 — Navigation labels and order change by page

Before: Manual uses Manual / Examples / Guardrails / About; Examples uses Manual / About / Examples / README; details replace About with the current example.

Decision: editable documentation pages use Manual / Examples / About in that order. Detail identity belongs in the title and contents rail, not the global navigation.

Constraint: `about.html` remains unchanged, including its existing Guardrails link.

Verification: assert the global navigation on the manual and all example documentation pages. Verify every About link still resolves.

### Q04 — Guardrails is a separate page

Before: execution consent is removed from the workflow that needs it and presented as a standalone essay.

Decision: merge its functional content into manual quick-start, execution/permissions, diagnostics, and sources. Replace `guardrails.html` with a compatibility redirect to the relevant manual section so the unchanged About link does not break.

Verification: navigate directly to `guardrails.html` and confirm arrival at the manual consent section; confirm no standalone Guardrails navigation tab remains on editable pages.

### Q05 — Examples calls the project a “fluent joke”

Before: self-characterization dominates the largest heading.

Decision: use `Runnable examples` as the information title. Explain that three checked-in projects turn fluent source statements into specification, design, and engineering-policy artifacts.

Verification: search reader-facing HTML for “joke” and inspect the first viewport.

### Q06 — The landing introduction prioritizes process evidence over purpose

Before: the first paragraph says outputs were created by an authenticated run and independently checked before explaining what a reader can learn.

Decision: first explain the three workflows and that outputs are already inspectable; place run provenance and validation after the workflow descriptions.

### Q07 — Specification summary uses abstract “end-to-end traceability”

Decision: say it links requirements and acceptance criteria to the plan, verification, and dependency-ordered work. Explicitly say it produces documents, not the CSV import feature.

### Q08 — Web-design summary is abstract

Decision: name the repair-cafe brief, three compared design directions, chosen direction, design system, review checklist, and generated static site.

### Q09 — Enterprise summary reuses “guardrails” ambiguously

Decision: call it `Enterprise C# practices` or `C# engineering policy`. Reserve execution consent language for the actual confirmation mechanism.

### Q10 — Generic “Open example” links

Decision: use descriptive link text for each workflow. Label the generated artifact `Open repair-cafe demonstration`.

### Q11 — The shared run pattern hides prerequisites and consequences

Decision: present three explicit steps: inspect, execute, confirm. State .NET 10 and authenticated Codex requirements. State that the examples explicitly select Codex and a live run may replace checked-in outputs.

### Q12 — CLI flag and interactive reply are easy to confuse

Decision: show them in separate labeled code blocks or rows:

- command-line flag: `--yes,please,proceed`;
- terminal reply for an existing file: `yes, please proceed`;
- terminal reply to stop: `no`.

### Q13 — First-live-run copy is incorrect

Before: the specification page says confirmation happens “on a later run.”

Fact: `AGENTS.md` is checked in, so confirmation occurs on the first live run from this checkout.

Decision: correct all three example pages.

Verification: inspect each run section and run a text assertion.

### Q14 — Individual downloads imply a complete standalone sample

Before: details offer `Program.cs` and `.csproj`, but each project links `../../SuperIntelligenceBuilder.cs`.

Decision: say the examples run from the complete repository checkout. Keep source links for inspection without implying that two files form a complete package.

### Q15 — Fluent tasks are hidden

Decision: add the real fluent statement, or a faithful relevant excerpt with a link to the complete source, to each detail page.

Verification: compare the displayed method names and literal output paths with each `Program.cs`.

### Q16 — Output lists use cryptic tags

Decision: replace `product`, `tokens`, `quality`, `boundaries`, and similar tags with a two-column file/purpose table. Every output receives a sentence that says what a reader will find.

### Q17 — Specification headline is a slogan

Decision: H1 becomes `Specification workflow`. “Make intent survive the prompt” may be retained only as secondary copy if it aids explanation.

### Q18 — Specification scope can imply implementation

Decision: state that the example documents a proposed CSV task-import feature and does not implement it.

### Q19 — Specification metrics can imply executed tests

Decision: say the artifacts define named tests and passed link/traceability checks. Put detailed counts behind the validation link.

### Q20 — Web-design headline is a slogan

Decision: H1 becomes `Static web design workflow`. Explain the brief and design-decision process in the lede.

### Q21 — “Visual theses” is unnecessary jargon

Decision: use `design directions`.

### Q22 — Generated site can be mistaken for a real event

Decision: identify it as a generated demonstration on the detail page. Do not alter its visual direction merely to match documentation. Avoid presenting placeholder contact/event details as live.

### Q23 — Web-design output descriptions are incomplete

Decision: describe brief, directions, decision, system, checklist, and generated site in reader terms. Replace `tokens` with `visual rules and reusable values`.

### Q24 — Static validation is presented beside later browser validation

Decision: distinguish checks performed during the original agent run from the later Playwright review. Link to the consolidated validation record.

### Q25 — Enterprise headline overstates enforceability

Before: `Make the quality bar executable.`

Decision: H1 becomes `Enterprise C# practices`. Explain that compiler and analyzer defaults are enforced while architecture and review rules remain documented policy.

### Q26 — “Regular business applications” is vague

Decision: use `a typical business application` and name the concerns: build defaults, dependency direction, async/cancellation, logging, tests, migration, rollback, and review.

### Q27 — “Practical rather than ceremonial” does not describe the section

Decision: use `What the policy covers`.

### Q28 — Research sections rely on popularity language

Decision: remove `popular`. Explain which ideas were used. Treat official documentation as technical authority and skills pages as process inspiration.

### Q29 — Manual opening definition is underspecified

Decision: retain the concise premise, but specify an installed command-line coding agent and explain that `WithFile` sends the exact source statement for interpretation.

### Q30 — “The agent reads their meaning” is vague

Decision: say the agent interprets invented method names and literal arguments as instructions; the dynamic result then accepts those calls when C# execution continues.

### Q31 — Quick start assumes an extracted archive

Decision: say `Open a terminal in the complete project checkout, in the folder containing SuperIntelligenceBuilder.csproj`.

### Q32 — Quick start encourages copying dry and live commands together

Decision: label commands by purpose and explain dry-run output before showing live execution.

### Q33 — Dry-run discovery claim is too strong

Decision: say it identifies the executable it would use when one is discoverable. It does not probe compatibility, authenticate, create files, or launch an agent.

### Q34 — Quick start omits existing-file consent

Decision: add a compact explanation beside the live command and link to the full consent subsection.

### Q35 — “Choose one adapter” tells readers to install the wrong thing

Decision: `Install one supported coding agent.` Adapter is the builder’s internal integration.

### Q36 — Installation commands are not formatted as code

Decision: use `<code>` for commands and CLI names. Keep official links actionable. Keep Node.js requirements in the installation column.

### Q37 — Dependency instructions lack context

Decision: start with `To use the builder in another SDK-style .NET 10 project...` so sample runners do not think copying is required.

### Q38 — Caller source constraints are fragmented

Decision: connect the compile-time path, need for original source, and need to rebuild after moving it.

### Q39 — How-it-works prose does not show execution order

Decision: use a compact ordered sequence: locate source; validate paths; build dry-run plan; require explicit execution; request existing-file consent; discover/probe agent; lock workspace; create missing instruction file; launch; validate report.

### Q40 — Builder preservation and agent replacement are conflated

Decision: explain that the builder itself never truncates an existing instruction file, while the fluent task may explicitly ask the coding agent to replace it.

### Q41 — Completion language is informal

Decision: replace `A real success` with `The builder reports completion only when...`.

### Q42 — “Swallowed” and “sink” are unexplained implementation slang

Decision: explain that the returned dynamic object accepts invented method/property calls without performing the named work. Reserve `sink` for implementation notes if used at all.

### Q43 — Side-effecting argument warning lacks consequence

Decision: explicitly state that ordinary C# argument expressions execute locally after `WithFile` returns, so arguments must not contain writes, network calls, or secrets.

### Q44 — Configuration terminology is inconsistent

Decision: normalize each option row, spell out JavaScript, explain selection priority, name workspace markers, clarify timeout scope, and move `CancellationToken` out of the options table because it is a method argument.

### Q45 — Proceed row omits the second gate

Decision: say `Proceed=true` permits the live path but does not bypass confirmation for an existing instruction file.

### Q46 — Preview priority could be clearer

Decision: say `Preview=true` forces dry-run behavior and takes priority over `Proceed`.

### Q47 — Agent permission differences are hard to compare

Decision: replace consecutive paragraphs with a compact agent/permissions/consequence table, followed by shared caveats.

### Q48 — Confirmation behavior is missing from permissions

Decision: merge the useful Guardrails state explanation before the agent permission table.

### Q49 — Confirmation copy is overly ceremonial in explanatory prose

Decision: retain the literal themed terminal prompt, but use direct documentation language for what the inputs do.

### Q50 — Consent scope is not in the manual

Decision: state that approval permits one run; it does not approve each edit, provide rollback, or replace diff review.

### Q51 — Bespoke attribution is isolated

Decision: add a short source note explaining that only the polite diagnostic voice inspired the implementation. Do not foreground internal class names.

### Q52 — Reports path is plain text

Decision: format it as code and keep the JSON example.

### Q53 — Failure table omits `ConfirmationRequired`

Decision: add a row explaining EOF/noninteractive input, exact consent, and that no agent launches.

### Q54 — Failure actions use internal jargon

Decision: replace `install an adapter`, `inherited diagnostics`, and `JS entry point` with direct reader actions.

### Q55 — Busy provides no resolution

Decision: tell readers to wait for an active run and check lock-directory permissions if no run is active. Do not recommend deleting the lock blindly.

### Q56 — Cancellation behavior is sample-specific

Decision: distinguish library cancellation from the root sample’s Ctrl+C exit code.

### Q57 — Unsupported harness catalog receives primary prominence

Decision: retitle it `Other coding tools` and state before the table that they cannot be launched by this version. Keep it compact and secondary.

### Q58 — Catalog commands are not formatted

Decision: use code formatting and concise descriptions. Do not imply interchangeability or fallback.

### Q59 — Limits use undefined security terms

Decision: retain exact constraints while adding their practical consequence. Explain that containment checks are validation, not a filesystem sandbox.

### Q60 — Validation sentence can imply no validation exists

Decision: say no test binaries are distributed, while the recorded builds, browser checks, and agent-run evidence are in `VALIDATION.md`.

### Q61 — Design-reference prose is maintainer-focused

Decision: keep a brief sources section for vendor documentation, Bespoke attribution, and offline behavior. Put extensive redesign rationale in this change request.

### Q62 — Mobile manual loses desktop rail context

Decision: keep the compact two-column section-link grid already shown on mobile and ensure any new consent content appears in it. Test filtering and anchor navigation separately.

### Q63 — About must remain unchanged

Decision: do not edit, reformat, or regenerate `about.html`. Resolve its Guardrails link through the compatibility redirect.

### Q64 — Before evidence is binary and should not enter the public artifact unintentionally

Decision: keep PNG screenshots locally under `review-evidence/`, ignore the PNGs in Git, and commit a small Markdown manifest describing how they were captured.

## 9. File-by-file implementation plan

### `index.html`

- Keep the established visual system and embedded implementation.
- Remove Guardrails from editable global navigation and secondary links.
- Clarify overview, quick start, installation, dependency use, execution order, fluent-call semantics, configuration, permissions, diagnostics, unsupported tools, limits, and sources.
- Merge existing-file confirmation into quick start and the permissions section.
- Add `ConfirmationRequired` to diagnostics.
- Add the Bespoke attribution to sources.
- Preserve copy/filter interactions and social metadata.

### `guardrails.html`

- Remove the standalone content page.
- Preserve the URL as a compatibility redirect to `index.html#h` because About cannot be edited.
- Include a visible manual link if automatic navigation is unavailable.

### `examples/style.css`

- Replace the wide landing-page system with a faithful reusable version of the manual design.
- Provide masthead, page tabs, contents rail, compact typography, section codes, code boxes, reference tables, notes, file-purpose tables, responsive layout, focus treatment, and print rules.
- Do not style or affect `examples/static-web-design/site/`.

### `examples/index.html`

- Use the manual-compatible shell.
- H1: `Runnable examples`.
- Explain the shared mechanism and immediately inspectable checked-in outputs.
- Replace cards with a compact workflow comparison table or stacked reference sections.
- Replace generic links with descriptive ones.
- Explain inspect / execute / confirm accurately.
- Link source and validation as secondary references.

### `examples/specification-workflow/index.html`

- Use the shared documentation shell.
- H1: `Specification workflow`.
- State that the output is documentation for a proposed CSV import, not the implementation.
- Show the actual task chain or a faithful excerpt.
- Explain repository-layout requirements and both execution gates.
- Replace tags with a file/purpose table.
- Explain research influences without popularity claims.
- Scope validation claims accurately.

### `examples/static-web-design/index.html`

- Use the shared documentation shell.
- H1: `Static web design workflow`.
- Describe the repair-cafe brief and design-direction process.
- Label the generated site as a demonstration with placeholder event/contact details.
- Show the task chain or a faithful excerpt.
- Replace tags with a file/purpose table.
- Distinguish original static checks from later browser validation.

### `examples/enterprise-csharp/index.html`

- Use the shared documentation shell.
- H1: `Enterprise C# practices`.
- Distinguish enforced build/analyzer configuration from documented review policy.
- Show the task chain or a faithful excerpt.
- Replace tags with a file/purpose table.
- Present Microsoft sources as technical grounding and skill material as process inspiration.

### `review-evidence/README.md`

- Record URL, viewport sizes, date, page list, interaction list, and screenshot naming.
- Keep PNG evidence local and ignored.

### `.gitignore`

- Ignore `review-evidence/**/*.png` while retaining the Markdown manifest.

### `VALIDATION.md`

- Record this deployed-site audit, the redesign checks, exact screenshot set, visual consistency assertions, redirect behavior, and browser results.

## 10. Detailed implementation checklist

The checklist is intentionally itemized so that completion cannot be inferred from a broad “redesign done” statement.

### Manual

- [x] Preserve existing social metadata.
- [x] Preserve the existing overall manual design.
- [x] Remove editable Guardrails navigation links.
- [x] Verify About remains linked.
- [x] Refine overview sentence-by-sentence.
- [x] Split dry-run and live-run commands by purpose.
- [x] Add first-live-run confirmation explanation.
- [x] Normalize installation terminology and command formatting.
- [x] Clarify integration/copy instructions.
- [x] Replace How it works prose with correct sequence.
- [x] Clarify dynamic-call behavior and argument evaluation.
- [x] Review every configuration row.
- [x] Move `CancellationToken` outside option rows.
- [x] Add execution-state table.
- [x] Add exact consent inputs.
- [x] Add consent scope.
- [x] Add comparative agent permission table.
- [x] Review every failure row.
- [x] Add `ConfirmationRequired`.
- [x] Retitle unsupported harness section.
- [x] Review every unsupported-tool row.
- [x] Clarify every limit paragraph.
- [x] Add Bespoke source note.
- [x] Confirm filter and copy controls still work.

### Examples landing

- [x] Replace HTML shell.
- [x] Replace navigation.
- [x] Add contents rail.
- [x] Replace joke-forward title.
- [x] Reorder purpose before provenance.
- [x] Review every workflow name and description.
- [x] Replace generic link text.
- [x] Explain safe inspection.
- [x] Explain explicit execution.
- [x] Explain confirmation.
- [x] Explain checked-in output replacement.
- [x] Preserve validation and source links.

### Specification detail

- [x] Replace shell and navigation.
- [x] Use accurate information title.
- [x] State non-implementation scope.
- [x] Show task source.
- [x] Correct first-live-run confirmation.
- [x] Explain repository checkout requirement.
- [x] Describe every output file.
- [x] Rewrite research paragraph.
- [x] Scope validation statement.

### Static web-design detail

- [x] Replace shell and navigation.
- [x] Use accurate information title.
- [x] Explain brief and three directions.
- [x] Label site as generated demonstration.
- [x] Show task source.
- [x] Correct first-live-run confirmation.
- [x] Explain repository checkout requirement.
- [x] Describe every output file.
- [x] Rewrite research paragraph.
- [x] Separate static and browser checks.

### Enterprise C# detail

- [x] Replace shell and navigation.
- [x] Use accurate information title.
- [x] Separate enforceable settings from guidance.
- [x] Show task source.
- [x] Correct first-live-run confirmation.
- [x] Explain repository checkout requirement.
- [x] Describe every output file.
- [x] Rewrite research paragraph.
- [x] Scope validation statement.

### Guardrails compatibility

- [x] Remove standalone content.
- [x] Redirect to manual consent section.
- [x] Provide visible fallback link.
- [x] Verify unchanged About link resolves.

### Evidence and validation

- [x] Add evidence manifest.
- [x] Ignore PNG evidence without deleting it.
- [x] Start a local HTTP server.
- [x] Run every new page at desktop width.
- [x] Inspect and save every desktop after screenshot.
- [x] Run every new page at mobile width.
- [x] Inspect and save every mobile after screenshot.
- [x] Test manual filter.
- [x] Test every copy button.
- [x] Test manual section anchors.
- [x] Test all global navigation links.
- [x] Test every local file/output link.
- [x] Test Guardrails compatibility redirect.
- [x] Assert no console/page errors.
- [x] Assert no horizontal overflow.
- [x] Assert documentation visual-system values.
- [x] Confirm generated repair-cafe design remains independent.
- [x] Run HTML/link/XML checks.
- [x] Run all .NET Release builds.
- [x] Run parent index and RSS checks from `docs/`.
- [x] Confirm `about.html` is unchanged from its pre-change state.
- [x] Update `VALIDATION.md` with only observed results.

## 11. Acceptance criteria

1. Manual, Examples, and all three example details visibly belong to the same documentation site.
2. About is byte-for-byte unchanged during this change.
3. No editable global navigation includes a standalone Guardrails page.
4. The old Guardrails URL resolves to the manual consent section.
5. The manual explains both execution gates and includes `ConfirmationRequired`.
6. The Examples landing page contains no self-deprecating “joke” headline.
7. Each example detail shows its source-defined task and explains every generated output.
8. Each example states that the complete repository layout is required.
9. Each example correctly says checked-in `AGENTS.md` triggers confirmation on the first live run.
10. The static-site artifact is identified as a demonstration without forcing its design to match the documentation shell.
11. Every edited page works at desktop and mobile widths with no horizontal overflow.
12. All local links resolve.
13. Manual filter/copy interactions continue to work.
14. Browser console and page-error collections are empty.
15. Before and after screenshot manifests exist; PNG evidence remains local and ignored.
16. All existing build, RSS, and parent-index validations remain green.

## 12. Non-goals

- Do not redesign or reformat `about.html`.
- Do not change the core C# builder behavior.
- Do not make the generated repair-cafe artifact visually match the documentation.
- Do not add a site generator, framework, external font, or runtime dependency.
- Do not claim user research, accessibility certification, or production readiness.
- Do not replace direct technical explanations with marketing copy.

## 13. Implementation outcome

The change was implemented after this review and plan were completed. The final source follows the decisions above:

- the manual now contains the consent and execution material formerly isolated on Guardrails;
- the former Guardrails URL is a compatibility redirect to the manual section;
- the examples landing page and all three example detail pages use the manual's reference-page design system;
- each detail page exposes the source-defined task, safe-run behavior, output inventory, research basis, and evidence limits;
- the repair-cafe artifact remains a deliberately independent demonstration rather than inheriting the documentation shell;
- About remains byte-for-byte unchanged; and
- local screenshots are retained as ignored audit evidence with a tracked manifest.

Implementation produced two additional findings during verification. Converting the top page tabs to a semantic navigation landmark initially exposed a generic mobile `nav` selector and a broad filter selector; both were narrowed to the documentation rail. Direct screenshot review also found the examples table's third column too narrow, so the workflow names became the links and the table was reduced to two useful columns.

The completed commands, counts, browser coverage, screenshot review, build results, and remaining platform limits are recorded in [`VALIDATION.md`](VALIDATION.md). The checked checklist above is the implementation record; the earlier findings remain the rationale for those changes.
