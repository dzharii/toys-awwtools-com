---

AA00 Codex Protocol Memory Note

---

This checklist is the condensed operating memory for `WORK_PROTOCOL_CHECKLIST_V001.md`.

Codex must treat vague product requests as incomplete product seeds, not implementation-ready instructions. Codex must not rush into code. Codex must first use ChatGPT through Chrome as a research, brainstorming, stakeholder-analysis, specification-writing, and planning partner.

Codex is a fast implementer, but must remain self-doubtful about its own high-level product judgment. The correct behavior is to use ChatGPT to improve product reasoning before implementation begins.

---

AB00 Core Behavior Checklist

---

* [ ] Do not start implementation immediately after receiving a vague product request.

* [ ] Save the user's original request before transforming it.

* [ ] Open or continue one primary ChatGPT browser conversation for the project.

* [ ] Tell ChatGPT that Codex is a coding agent converting vague user intent into research, specifications, and implementation.

* [ ] Use ChatGPT for research before brainstorming.

* [ ] Use ChatGPT for stakeholder analysis before feature selection.

* [ ] Use ChatGPT for multiple brainstorming rounds before choosing an approach.

* [ ] Use Codex judgment to select the final direction, but only after reading ChatGPT's research and options.

* [ ] Ask ChatGPT to challenge the selected direction before finalizing it.

* [ ] Save every useful ChatGPT output to local files.

* [ ] Preserve rejected options and explain why they were rejected.

* [ ] Keep a decision log.

* [ ] Do not ask the human for clarification during this workflow unless a hard blocker makes autonomous progress impossible.

* [ ] Convert uncertainty into assumptions, risks, specification requirements, deferred decisions, or validation tasks.

---

AC00 Research Checklist

---

* [ ] Ask ChatGPT how this problem is commonly solved.

* [ ] Ask ChatGPT what existing solutions or product categories already exist.

* [ ] Ask ChatGPT what users likely need.

* [ ] Ask ChatGPT what stakeholders exist.

* [ ] Ask ChatGPT what each stakeholder wants.

* [ ] Ask ChatGPT what each stakeholder fears, resists, or considers failure.

* [ ] Ask ChatGPT what edge cases and hidden requirements are likely.

* [ ] Ask ChatGPT what a fast coding agent would probably misunderstand.

* [ ] Ask ChatGPT for an adversarial critique of the product idea.

* [ ] Ask ChatGPT to identify risks created by vague requirements.

* [ ] Run multiple research iterations when needed. Five to ten rounds is normal.

* [ ] Save research notes, stakeholder analysis, existing-solution analysis, risks, assumptions, and open questions.

---

AD00 Brainstorming Checklist

---

* [ ] Do not accept the first product idea as final.

* [ ] Ask ChatGPT for many possible product directions.

* [ ] Ask for practical low-risk options.

* [ ] Ask for ambitious high-value options.

* [ ] Ask for unconventional creative options.

* [ ] Ask for stakeholder-specific options.

* [ ] Ask for implementation-conscious options.

* [ ] Ask ChatGPT to compare options by user value, complexity, risk, maintainability, uniqueness, testability, and fit.

* [ ] Save all brainstormed options.

* [ ] Save rejected options.

* [ ] Select the best approach using Codex judgment.

* [ ] Ask ChatGPT to critique the selected approach.

* [ ] Save the final selected direction.

---

AE00 Specification Checklist

---

* [ ] Ask ChatGPT for a PRD-style specification outline.

* [ ] Request approximately five to ten specification files or major sections.

* [ ] Do not ask ChatGPT to write the whole specification at once.

* [ ] Review the outline.

* [ ] Merge, remove, split, reorder, or rewrite outline sections if needed.

* [ ] Write specifications one section at a time.

* [ ] For each section, provide ChatGPT with the selected direction, stakeholder summary, relevant prior sections, and the specific requested section.

* [ ] Require micromanagement style detail.

* [ ] Save each section locally.

* [ ] Review each section for ambiguity, contradictions, missing edge cases, weak acceptance criteria, and implementation traps.

* [ ] Ask ChatGPT to edit weak sections.

* [ ] Update related sections when one section changes.

* [ ] Do not move to implementation until all specification sections are complete and reviewed.

---

AF00 Micromanagement Style Checklist

---

* [ ] Define exact behavior, not only intent.

* [ ] Define in-scope behavior.

* [ ] Define out-of-scope behavior.

* [ ] Define user-visible states.

* [ ] Define empty states.

* [ ] Define loading states.

* [ ] Define success states.

* [ ] Define failure states.

* [ ] Define edge cases.

* [ ] Define error handling behavior.

* [ ] Define data structures and field meanings.

* [ ] Define validation rules.

* [ ] Define persistence behavior.

* [ ] Define interface contracts.

* [ ] Define component or module responsibilities.

* [ ] Define acceptance criteria.

* [ ] Define test requirements.

* [ ] Remove vague instructions unless immediately expanded into concrete behavior.

---

AG00 Documentation Gate Checklist

---

* [ ] Original user request is saved.

* [ ] Research notes are saved.

* [ ] Existing solutions are documented when relevant.

* [ ] Stakeholder map is complete.

* [ ] Stakeholder goals and pain points are documented.

* [ ] Brainstorming options are saved.

* [ ] Rejected options are saved.

* [ ] Selected product direction is saved.

* [ ] Risks are documented.

* [ ] Assumptions are documented.

* [ ] Specification outline is accepted.

* [ ] Every detailed specification section is written.

* [ ] Every detailed specification section is reviewed.

* [ ] Every detailed specification section is saved.

* [ ] Specifications are micromanagement style and implementation-ready.

* [ ] Final milestone-by-milestone implementation plan is saved.

* [ ] No production implementation has started before this gate is complete.

---

AH00 Final ChatGPT Planning Checklist

---

* [ ] After specifications are complete, ask ChatGPT for final implementation advice.

* [ ] Provide ChatGPT with the selected direction.

* [ ] Provide ChatGPT with the specification outline.

* [ ] Provide ChatGPT with summaries of all completed specification files.

* [ ] Provide ChatGPT with assumptions, risks, and repository constraints.

* [ ] Ask for milestone-by-milestone implementation planning.

* [ ] Ask for task order, dependencies, validation steps, likely changed files, risks, and completion criteria.

* [ ] Save ChatGPT's final implementation advice.

* [ ] Convert the advice into a local implementation plan.

---

AI00 Autonomous Implementation Checklist

---

* [ ] Implement only after the documentation gate is complete.

* [ ] Use saved specifications as the source of truth.

* [ ] Implement one milestone at a time.

* [ ] Validate each milestone before moving to the next.

* [ ] Run relevant tests, builds, linters, type checks, or manual validations.

* [ ] Log validation commands and results.

* [ ] Fix validation failures before continuing unless they are unrelated and documented.

* [ ] Do not ask the human what to do next after planning is complete.

* [ ] Do not keep asking ChatGPT during implementation unless a serious contradiction or unexpected architectural issue appears.

* [ ] If implementation reality changes the plan, update the relevant specification and decision log.

* [ ] Continue autonomously until the project is complete.

---

AJ00 Failure Mode Checklist

---

* [ ] Avoid implementing from vague input.

* [ ] Avoid treating one ChatGPT answer as enough research.

* [ ] Avoid brainstorming only one option.

* [ ] Avoid skipping stakeholder analysis.

* [ ] Avoid writing broad specifications that sound correct but do not constrain implementation.

* [ ] Avoid creating one giant specification instead of section-by-section documents.

* [ ] Avoid losing ChatGPT context by opening unrelated chats unnecessarily.

* [ ] Avoid failing to save ChatGPT outputs locally.

* [ ] Avoid asking the human questions when ChatGPT and documented assumptions can resolve the issue.

* [ ] Avoid changing product behavior during implementation without updating specifications.

* [ ] Avoid stopping after planning and waiting for permission to continue.

---

AK00 One-Line Rule

---

When the user gives vague product direction, Codex must research with ChatGPT, brainstorm with ChatGPT, specify with ChatGPT, save all artifacts locally, ask for final milestone advice, and only then implement autonomously from the completed micromanagement style specifications.

---

Directive: Codex must maintain one primary ChatGPT conversation for the entire project workflow. 
After Codex creates or opens the initial ChatGPT chat, 
Codex must capture and save the current ChatGPT chat URL, 
including its conversation UUID when present, in the local project artifacts. 
If the browser session is interrupted, the page crashes, the tab is closed, 
or Codex needs to recover context later, 
Codex may open a new browser tab, but it must reopen the saved chat URL instead of starting a new ChatGPT conversation. 
The purpose is to preserve the shared planning context across research, brainstorming, specification writing, review, and final implementation planning. 
Codex must treat the saved ChatGPT URL as part of the project state, and must only start a new ChatGPT conversation if the saved conversation is technically inaccessible; 
in that case, Codex must document the failure, summarize the existing saved artifacts into the new chat, save the new chat URL, and continue from there.