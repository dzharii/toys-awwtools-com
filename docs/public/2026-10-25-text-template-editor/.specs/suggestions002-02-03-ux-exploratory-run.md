# File: `.specs/suggestions002-02-03-visual-ux-audit.md`

# Guided UI Regression Suite - Ad Hoc Visual UX Audit

Specification: `suggestions002-02-03`\
Revision: 00\
Status: Ad hoc analysis task\
Scope: Screenshot collection, independent UX assessment, comparative review, and improvement recommendations\
Implementation changes: Not authorized by this task\
Output location: `temporary`

## A00. Purpose and expected outcome

Conduct an independent, systematic UX review of the current Guided application using the existing Playwright Page Object smoke-testing and screenshot-capture framework.

Run the application under multiple appearance configurations, collect screenshots of every registered Page Object, and evaluate each screenshot against a comprehensive set of usability questions.

The objective is to discover UX problems independently, not to verify a predetermined list of known defects.

The reviewer must examine the actual interface as a user would experience it, identify inconvenient or confusing interactions, assess the coherence of the visual design, and recommend concrete improvements.

The analysis must consider both individual UI elements and the application as a complete product.

| Objective                 | Required outcome                                                               |
| ------------------------- | ------------------------------------------------------------------------------ |
| Independent observation   | Discover problems without relying on previous UX findings                      |
| Comprehensive inspection  | Examine all visible regions, controls, and relevant details                    |
| Multiple configurations   | Evaluate themes, backgrounds, and visual density                               |
| Consistent methodology    | Apply the same review questions to every run                                   |
| Fresh assessment          | Analyze and finalize each run before consulting earlier findings               |
| Evidence                  | Associate observations with specific screenshots and UI regions                |
| Actionability             | Describe what should change and why                                            |
| Comparative analysis      | Identify issues common across configurations and configuration-specific issues |
| Temporary documentation   | Preserve screenshots, observations, and recommendations under `temporary`      |
| Non-destructive execution | Do not modify Guided implementation during the audit                           |

The existing Page Object registry is the authoritative inventory of application surfaces. Reuse the current smoke runner, readiness assertions, and screenshot extension.

Do not rebuild the framework or create separate screenshot logic for this task.

The audit is observational, not an implementation cycle. Collect findings first, complete all configured runs, consolidate recommendations, and only then propose code changes.

## B00. Execution matrix and independent runs

Each audit run must begin from an isolated, deterministic browser state and use the existing screenshot-collection mechanism.

The appearance variables in scope are:

| Variable       | Values                                                            |
| -------------- | ----------------------------------------------------------------- |
| Theme          | Light, Dark                                                       |
| Background     | Every available background option supported by the selected theme |
| Visual density | Comfortable, Compact                                              |

Do not include unrelated Settings combinations in this task.

Run coverage: Evaluate each supported combination of theme, background, and visual density. Enumerate the actual available background options from the running application rather than assuming a fixed list.

For each theme, capture every applicable background in both Comfortable and Compact density.

Total planned runs:

\\[ N = 2 \times \sum\_{\text{theme}} B\_{\text{theme}} \\]

where \\(B\_{\text{theme}}\\) is the number of available background choices for that theme. If both themes offer the same \\(B\\) backgrounds, the total is \\(4B\\).

A run consists of one appearance configuration and screenshots of every registered Page Object.

Run lifecycle:

| Stage | Action                                                        |
| ----- | ------------------------------------------------------------- |
| 1     | Start a fresh isolated browser context                        |
| 2     | Apply the run's theme, background, and density                |
| 3     | Verify the effective setting values                           |
| 4     | Execute the existing Page Object screenshot suite             |
| 5     | Validate screenshot inventory and capture quality             |
| 6     | Analyze every screenshot against the UX checklist             |
| 7     | Record observations and conclusions for this run              |
| 8     | Finalize the run's notes before opening previous-run analyses |
| 9     | Close the context and proceed to the next configuration       |

Use the same viewport, browser version, synthetic content, and representative UI states wherever possible so comparisons remain meaningful.

The screenshot-capture suite must retain normal Page Object readiness checks. A failed Page Object or missing screenshot is recorded as a coverage failure, not silently skipped.

Fresh-analysis rule: During an individual run, the reviewer must not consult findings or conclusions from previous runs. Review the current screenshots, answer the checklist, and save the run's observations independently.

Previous-run findings may be consulted only during the final cross-run synthesis.

This separation reduces anchoring and confirmation bias. It does not imply that a model can literally erase its prior knowledge.

Screenshot limitations: Full-page screenshots do not necessarily reveal content inside independently scrolling panels, transient menus, dialogs, or hidden states. Where necessary, use a focused additional browser inspection or screenshot, clearly labeled as supplementary evidence. Do not infer unseen behavior from a static image.

## C00. Universal UX review checklist

Apply the following questions to every relevant screenshot. Questions are diagnostic prompts, not assumptions that the corresponding problem exists.

The checklist draws on the earlier Guided review methodology and established principles of usability heuristics, accessibility, reflow, and component-responsive design.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.nngroup.com\&sz=32)

NN/G

+2



For each category, record Pass, Issue, Uncertain, or Not applicable. Add a brief explanation where necessary. Do not manufacture a finding merely to fill a category.

### Product purpose and user perspective

| Area                 | Questions to ask                                                                                                                                                                          |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First impression     | Can a first-time user understand what this screen is for? Is the primary task immediately apparent? Does the interface look approachable or unnecessarily complex?                        |
| User priorities      | What is the user trying to accomplish here? Does the layout prioritize that activity? Which visible elements directly support the task, and which compete for attention?                  |
| Natural expectations | What would a user reasonably expect to happen next? Is that action obvious? Does anything appear surprising, unnecessarily restrictive, or contrary to conventional application behavior? |
| Workflow efficiency  | How many steps would a user need to accomplish the apparent task? Are there avoidable actions, clicks, navigation changes, or scrolling operations?                                       |
| Cognitive load       | Must the user remember information from another surface? Are too many decisions or controls presented simultaneously? Could the workflow be simplified without losing functionality?      |
| User control         | Can users understand and change the current state? Are actions reversible where appropriate? Are users forced into a workflow that could be more flexible?                                |

### Information architecture and navigation

| Area                   | Questions to ask                                                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Navigation structure   | Can users identify their current workspace and location? Is navigation logically organized? Are related destinations grouped appropriately? |
| Navigation consistency | Do similar navigation elements behave and appear consistently? Are the same destinations repeated unnecessarily?                            |
| Discoverability        | Can users find primary actions without searching through unrelated menus? Are important destinations hidden behind ambiguous controls?      |
| Current context        | Does the main heading correctly represent what the user is doing? Do breadcrumbs, tabs, titles, and selected states agree?                  |
| Information hierarchy  | Which element attracts attention first, second, and third? Is this ordering appropriate for the user's task?                                |
| Redundancy             | Are labels, titles, status indicators, or navigation controls repeated without adding information? Could they be consolidated?              |
| Context switching      | If users move to another panel or workspace, can they understand how to return? Is their previous work preserved and recognizable?          |

### Layout, geometry, and space utilization

| Area                 | Questions to ask                                                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Space allocation     | Is screen space distributed according to the importance of each activity? Is useful space being reserved for elements with little content? |
| Alignment            | Do related elements share consistent alignment and spacing? Are visual relationships obvious?                                              |
| Proportions          | Are panels, cards, inputs, and other regions appropriately sized for their contents and purpose?                                           |
| Whitespace           | Does whitespace improve readability and grouping, or create unnecessary distance between related information?                              |
| Container adaptation | Does each component fit its actual available width? Would the same component remain usable inside a narrower or wider panel?               |
| Content visibility   | Is important content visible without unnecessary scrolling? Are important actions separated from the content they affect?                  |
| Overflow             | Is anything clipped, overflowing, overlapping, or forcing unexpected horizontal scrolling?                                                 |
| Layout alternatives  | Would stacking, grouping, collapsing, resizing, or repositioning content improve the experience? What tradeoffs would that introduce?      |

### Panels, floating surfaces, and scrolling

| Area               | Questions to ask                                                                                                                                           |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Panel necessity    | Does each visible panel contribute useful information to the current task? Should it be expanded, collapsed, or available on demand?                       |
| Panel identity     | Can users identify the purpose of each panel? Is its title repeated unnecessarily?                                                                         |
| Window controls    | Are movement, resizing, docking, collapsing, restoring, and closing operations discoverable where applicable?                                              |
| Panel content      | Is the content organized for the panel's current dimensions, or does it appear designed for a different layout?                                            |
| Panel coordination | Do multiple panels coexist without competing unnecessarily for space or obscuring important work?                                                          |
| Scrolling          | Are scrollable regions identifiable? Is it clear which surface will scroll? Are essential controls still reachable?                                        |
| Empty panels       | Does an empty panel communicate something useful? Could its presentation be less intrusive without overriding the user's preferences?                      |
| Restoration        | Can a user reasonably discover how to restore or reopen a hidden panel? Can this be confirmed from the screenshot, or does it require interaction testing? |

### Controls, forms, and interaction affordances

| Area                     | Questions to ask                                                                                                                        |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| Control purpose          | Can the user tell what each interactive element does? Are labels specific enough?                                                       |
| Control selection        | Is the chosen control type appropriate: button, checkbox, radio group, select, input, menu, or something else?                          |
| Visual affordance        | Do controls look interactive? Can users distinguish enabled, disabled, hovered, focused, and selected states?                           |
| Placement                | Are controls positioned close to the information or operation they affect?                                                              |
| Size                     | Are controls large enough to read, target, and operate comfortably?                                                                     |
| Conditional relevance    | Are controls shown only when meaningful? Are unnecessary disabled actions consuming attention?                                          |
| Forms                    | Are labels, descriptions, inputs, and validation messages clearly associated? Are instructions proportionate to the input's importance? |
| Interaction alternatives | Is there an obvious path for users who cannot use a particular gesture or interaction method?                                           |

### Editing, content creation, and contextual guidance

| Area                | Questions to ask                                                                                                                         |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Editing priority    | Does the actual content-entry control receive sufficient visual space and attention?                                                     |
| Input usability     | Is the input appropriately sized for expected content length? Does the interface appear comfortable for short and long entries?          |
| Context             | Can users understand what they are editing and how the value relates to the generated document?                                          |
| Guidance            | Is help available where needed? Is it concise enough not to dominate the task?                                                           |
| Examples            | Are examples discoverable, readable, and close to the relevant input? Can users distinguish using an example from copying it?            |
| Navigation          | Are field navigation controls relevant to the current number and arrangement of fields?                                                  |
| Editing continuity  | Would a user expect focus, caret, selection, and entered text to survive the visible workflow? Which parts require browser verification? |
| Output relationship | Can users understand how their input affects the generated result? Are the input and output appropriately connected?                     |

### Typography, color, and visual consistency

| Area                 | Questions to ask                                                                                                                         |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Typography hierarchy | Are headings, body text, hints, metadata, and controls sized according to their actual importance?                                       |
| Text legibility      | Can normal users comfortably read all relevant information at the captured scale? Is text unnecessarily tiny?                            |
| Text scaling         | If larger text is enabled, which elements grow? Does the scaling prioritize the content users need to read or edit?                      |
| Contrast             | Are foreground text, borders, focus indicators, and controls distinguishable from their backgrounds?                                     |
| Color meaning        | Is color used consistently for selection, success, warning, error, and disabled states?                                                  |
| Surface hierarchy    | Can users visually distinguish the main workspace, panels, cards, dialogs, and selected surfaces?                                        |
| Design consistency   | Do components appear to belong to the same design system? Are spacing, borders, radii, typography, and interaction states consistent?    |
| Density              | Does the selected visual density alter spacing coherently? Does the interface remain functional and readable in every density mode?      |
| Backgrounds          | Does the chosen background preserve contrast, legibility, visual hierarchy, and control discoverability? Does it introduce visual noise? |

### Feedback, content correctness, and trust

| Area                | Questions to ask                                                                                                     |
| ------------------- | -------------------------------------------------------------------------------------------------------------------- |
| System status       | Can users understand whether changes are saved, pending, failed, or incomplete?                                      |
| Feedback            | Do actions appear to provide an understandable result? Is success or failure communicated accurately?                |
| Status accuracy     | Do counts, labels, progress indicators, and other displayed values agree with the visible content and current state? |
| Severity            | Are ordinary incomplete states distinguishable from genuine operational failures?                                    |
| Empty states        | Do empty views communicate useful context and an appropriate next action?                                            |
| Error recovery      | If something fails, will users know what happened and what to do next? What cannot be assessed without interaction?  |
| Destructive actions | Are irreversible operations clearly distinguished from reversible ones?                                              |
| Product language    | Is wording clear, concise, consistent, and familiar to users rather than unnecessarily technical?                    |

### Accessibility and adaptable interaction

| Area                     | Questions to ask                                                                                                                    |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Keyboard access          | Is there a plausible keyboard path to important functionality? Which interactions require explicit testing?                         |
| Focus                    | Is the active or focused control visually distinguishable? Could focus become obscured by panels or overlays?                       |
| Touch usability          | Are controls appropriately sized and spaced for touch interaction?                                                                  |
| Reflow                   | Would the layout remain understandable at narrower widths or increased zoom? Are any regions dependent on fixed desktop dimensions? |
| Accessibility semantics  | Do visible controls suggest correct semantic behavior? Which labels, roles, or states require DOM verification?                     |
| Text enlargement         | Could text grow without clipping, overlapping, or hiding controls?                                                                  |
| Color independence       | Can states be understood without relying solely on color?                                                                           |
| Alternative interactions | Are drag-based functions, hover-only help, and other special interactions available through accessible alternatives?                |

Use WCAG 2.2 as a verification reference where applicable, including text contrast, text resizing, reflow, target size, and alternatives to dragging. A screenshot can reveal possible violations but cannot establish full accessibility conformance.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.w3.org\&sz=32)

w3.org

+1



### Overall coherence and improvement potential

| Area                      | Questions to ask                                                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Coherent experience       | Does the screen feel like one deliberately designed application rather than unrelated components?                                                 |
| Design approach           | Is the underlying interaction model appropriate, or is a different arrangement better suited to the task?                                         |
| Complexity                | Could the same functionality be delivered with fewer controls, less repetition, or clearer grouping?                                              |
| Tradeoffs                 | Would a proposed improvement create a new problem elsewhere? What behavior must be preserved?                                                     |
| Configuration sensitivity | Does this issue occur because of the current theme, background, density, panel arrangement, or application state?                                 |
| User impact               | How frequently would a user encounter this problem? How much effort, confusion, or risk would it create?                                          |
| Improvement               | What specific change would provide the greatest benefit? Can it be described as an observable acceptance outcome?                                 |
| Evidence quality          | Is the conclusion directly supported by the screenshot, inferred from design principles, or dependent on a browser interaction not yet performed? |

## D00. Analysis procedure and independence rules

The reviewer must not treat screenshot capture as completion of the task. Every run requires a substantive analysis immediately after capture.

Two-pass analysis:

| Pass                          | Method                                                                        | Purpose                                                              |
| ----------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 1. Independent UX inspection  | Examine screenshots using the checklist, without consulting previous findings | Discover usability problems from the current UI                      |
| 2. Specification verification | Compare observations with Guided's documented UX and interaction requirements | Distinguish design weaknesses from explicit specification violations |

The first pass must not be guided by a predetermined defect inventory.

Do not read the earlier Guided UX review as a list of expected problems before forming conclusions.

Detailed procedure per run:

| Step      | Required activity                                                                              |
| --------- | ---------------------------------------------------------------------------------------------- |
| Inspect   | Open every captured screenshot, not merely filenames or thumbnails                             |
| Describe  | Identify major regions, controls, content, state, and visual relationships                     |
| Examine   | Inspect small details such as labels, spacing, alignment, affordances, and text                |
| Question  | Apply every relevant checklist category                                                        |
| Evaluate  | Consider the screen from the perspective of a new user and an experienced user                 |
| Identify  | Record observed defects, friction, confusion, inconsistencies, and improvement opportunities   |
| Challenge | Consider whether an apparent problem has a valid design purpose                                |
| Verify    | Use targeted browser inspection when a conclusion depends on behavior not visible in the image |
| Recommend | Explain what should change and the observable benefit                                          |
| Finalize  | Save the complete independent run analysis before proceeding                                   |

Review discipline:

A screenshot must not be declared correct merely because required controls exist.

Equally, do not label a deliberate design choice defective solely because another arrangement is possible.

Consider usability, frequency of interaction, user expectations, available space, consistency, and accessibility before recommending a change.

Evidence classification:

| Classification | Meaning                                                   |
| -------------- | --------------------------------------------------------- |
| Observed       | Directly visible in screenshot                            |
| Inferred       | Reasonable UX concern derived from visible evidence       |
| Verified       | Confirmed through browser interaction or DOM inspection   |
| Unverified     | Requires an interaction or application state not captured |

Do not claim that dragging, focus, persistence, keyboard navigation, or another interaction works or fails solely from a static screenshot.

Independent-run rule:

Every run starts with an empty observation record. Prior findings must not be supplied as review prompts.

The reviewer must be willing to conclude that a screen is well designed, even when another configuration produced defects.

If a problem is encountered repeatedly, record it independently and consolidate duplicates only after all runs are complete.

## E00. Temporary evidence and observation records

Store all audit artifacts inside `temporary`. Organize them by run to prevent overwrites and allow independent review.

Recommended structure:

```
temporary/
  ux-audit/
    run-001/
      configuration.json
      screenshots/
      observations.md
      summary.md

    run-002/
      configuration.json
      screenshots/
      observations.md
      summary.md

    ...

    consolidated-review.md
    improvement-backlog.md
```

Run numbers are stable. Configuration metadata must identify theme, background, density, viewport, and execution outcome.

Preserve original screenshot filenames and references. Do not rename files in ways that make them impossible to match to their Page Objects.

### Finding record

Each meaningful issue or recommendation should be recorded using the following compact structure.

| Field          | Content                                               |
| -------------- | ----------------------------------------------------- |
| ID             | Unique finding identifier                             |
| Screenshot     | Relative path and Page Object                         |
| Region         | Specific panel, control, or screen area               |
| Observation    | What is actually visible                              |
| UX impact      | Why it may inconvenience, confuse, or obstruct a user |
| Recommendation | Concrete proposed improvement                         |
| Priority       | P0, P1, or P2                                         |
| Evidence       | Observed, Inferred, Verified, or Unverified           |
| Configuration  | Theme, background, density                            |
| Verification   | Further browser check required, if any                |

Example structure, without prescribing a particular finding:

```
Finding: UX-R001-03
Screenshot: run-001/screenshots/<surface>.png
Region: <specific control or area>
Observation: <visible evidence>
Impact: <user-facing consequence>
Recommendation: <specific improvement>
Priority: P1
Evidence: Observed
Verification: <none or required browser check>
```

Per-run summary:

Each run must finish with a concise summary covering overall usability, strongest design aspects, most important problems, configuration-specific concerns, unresolved questions, and prioritized recommendations.

Use the checklist to ensure coverage, but do not repeat dozens of Pass statements in the report when no actionable observation exists.

Record the checklist categories reviewed and explicitly identify any categories that could not be assessed.

## F00. Cross-run comparison and final recommendations

Only after every independent run is finalized should the reviewer compare results.

Comparison questions:

| Dimension            | Questions                                                                            |
| -------------------- | ------------------------------------------------------------------------------------ |
| Theme                | Does the interface remain equally readable and coherent in Light and Dark?           |
| Background           | Do background choices affect legibility, attention, contrast, or surface separation? |
| Density              | Do Comfortable and Compact preserve the same essential usability?                    |
| Repeated findings    | Which problems occur independently across several configurations?                    |
| Conditional findings | Which problems occur only under particular setting combinations?                     |
| Design consistency   | Are components and interactions consistent across Page Objects?                      |
| Systemic causes      | Could several visible problems originate from one shared layout or design rule?      |
| Priorities           | Which changes would improve the greatest number of surfaces or configurations?       |
| Tradeoffs            | Could a proposed change improve one configuration while degrading another?           |
| Verification         | Which conclusions still require actual browser interaction?                          |

Consolidate repeated findings into one recommendation, retaining references to every supporting screenshot and configuration.

Do not interpret repeated observations as independent evidence when they are merely duplicate captures of an unchanged screen.

Priority model:

| Priority | Criteria                                                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------------------------------ |
| P0       | Severe obstruction, unreadable content, inaccessible primary action, significant overflow, or misleading critical state  |
| P1       | Substantial workflow friction, poor hierarchy, discoverability problems, inefficient layout, or inconsistent interaction |
| P2       | Visual refinement, secondary readability, polish, or lower-impact usability improvement                                  |

The final improvement backlog must contain concrete changes, affected surfaces, user-facing rationale, evidence references, and observable acceptance criteria.

Prioritize shared architectural/design corrections over isolated CSS adjustments when one underlying issue affects multiple surfaces.

## G00. Completion criteria and deliverables

The task is complete when every supported appearance combination has been captured, every registered Page Object has been reviewed, and independent notes have been finalized for each run.

| Deliverable          | Required content                                                |
| -------------------- | --------------------------------------------------------------- |
| Screenshot inventory | All captures organized by configuration and Page Object         |
| Run configurations   | Effective theme, background, density, and viewport              |
| Individual analyses  | Independent checklist-based UX assessment for every run         |
| Evidence records     | Findings tied to screenshots and specific UI regions            |
| Consolidated review  | Cross-run similarities, differences, and systemic observations  |
| Improvement backlog  | Prioritized, actionable recommendations                         |
| Verification gaps    | Behaviors requiring interactive testing rather than screenshots |
| Final summary        | Overall assessment of design coherence and user experience      |

The reviewer must report missing screenshots, failed captures, unsupported configurations, and incomplete observations instead of silently claiming comprehensive coverage.

Execution boundary: Do not fix the discovered problems during this task. Do not repeatedly modify Guided and rerun screenshots until the interface looks satisfactory. This audit must first produce an independent snapshot of the current user experience.

Expected final outcome: A screenshot-grounded UX assessment that independently discovers design weaknesses, explains their consequences for users, and produces a prioritized set of improvements. The conclusions must emerge from the actual captured interface and systematic questioning, not from a supplied list of known Guided defects.