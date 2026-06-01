read this @AGENTS.md and proceed with continous and autonomous implementation. 
Do not attempt to implement the entire page at once, rather use append style. So split everything, all the tasks, like for implement 20 or 25 examples for the page into 25 to-do items and work rather on the chunks of the code. This is only a suggestion. Feel free to manage your task as you wish.

---

A00 Project Overview

---

This project is a continuous specification implementation workspace.

The `context` folder contains project background. Read `context/context.txt` before implementing any specification. Use it to understand the purpose of the generated pages, the expected style of work, and the type of extraction-test examples this project is meant to produce.

The `specifications` folder is the task queue. New specification files may appear there at any time.

The `implementation` folder is the only place where implemented output should be created.

Your job is to continuously monitor `specifications`, select the next unimplemented specification, implement it from scratch inside `implementation`, mark the specification as completed, and then return to monitoring for the next specification.

---

B00 Required Operating Loop

---

Run as a continuous worker.

Check the `specifications` folder repeatedly for specification files.

When a specification file is found, determine whether it has already been implemented. Use helper files, status files, manifests, logs, or any other local tracking method you choose. The tracking method must make it clear which specifications are pending, in progress, completed, or failed.

Pick the next pending specification in numeric order when numbering is present. For example, implement `01` before `02`, and `02` before `03`.

If a new lower-numbered pending specification appears while you are working on another task, finish the current implementation first, then rescan the folder and pick the next pending specification in sequence.

After finishing one specification, immediately rescan `specifications`.

Do not stop after completing a specification.

If there are no pending specifications, keep monitoring the folder. A scheduled or repeated check every 30 seconds is acceptable.

The user will manually stop the process when no further work is wanted.

---

C00 Folder Responsibilities

---

Use `context/context.txt` for project understanding.

Use `specifications` only as the source of task instructions.

Use `implementation` only as the destination for created implementations.

Do not place generated implementation files in `context`.

Do not place generated implementation files in `specifications`.

Do not modify the meaning of a specification unless the specification itself instructs you to do so.

Do not ignore new specification files that appear while the loop is running.

---

D00 Specification Tracking

---

You must keep track of which specifications have already been implemented.

Choose a simple and reliable tracking approach. Acceptable approaches include a manifest file, status JSON file, completed marker files, implementation metadata, or another clear local convention.

The tracking must prevent duplicate implementation of the same specification.

The tracking must survive repeated scans of the folder.

The tracking must make it possible to resume work without accidentally reusing or overwriting previous work.

After a specification is implemented successfully, mark it as done.

If a specification cannot be implemented because it is malformed, missing critical information, or impossible to execute, record that failure clearly and continue monitoring for other specifications.

---

E00 Implementation Rules

---

Implement every specification in the `implementation` folder.

Each specification should produce its own standalone implementation output.

When a specification asks for an HTML page, create a self-contained `.html` file.

Use inline HTML, CSS, and JavaScript unless the specification explicitly says otherwise.

Do not use React.

Do not use build tools.

Do not use external libraries.

Do not use external CSS.

Do not use external JavaScript.

Do not depend on shared assets unless the specification explicitly provides them.

Do not make one implementation depend on another implementation.

Each implemented page should be portable and runnable directly from the file system.

---

F00 From-Scratch Requirement

---

Implement each specification from scratch.

Do not copy and paste previous implementations.

Do not clone the structure of an earlier page and only change labels or values.

Do not reuse previous JavaScript components as a template unless the specification explicitly requires shared behavior.

Do not reuse previous HTML layout patterns in a way that makes examples feel repetitive.

Do not inspect earlier implementations for the purpose of copying their structure.

Similar CSS ideas are allowed when they are generic and useful, but each page should still feel unique.

The purpose of this project is to produce varied, realistic, unique extraction-test examples. Repetition reduces the value of the test suite.

---

G00 Uniqueness Requirement

---

Every implementation should create examples that are visibly and structurally different from previous examples.

Vary the layout.

Vary the DOM structure.

Vary the styling.

Vary the interaction patterns.

Vary the realistic scenario being imitated.

Vary the field labels, values, records, metadata, statuses, controls, and visual grouping.

When choosing between a safe familiar approach and a distinct reasonable approach, prefer the distinct approach.

Use judgment. Roll the dice when multiple good implementation choices exist.

The goal is not a uniform design system. The goal is a broad set of realistic extraction surfaces.

---

H00 Expected Implementation Quality

---

The implementations should look reasonably polished, but they should not be over-engineered.

Use enough CSS to make each example readable, visually separated, and realistic.

Use minimal JavaScript only where interaction is required for the extraction scenario.

Examples may include custom dropdowns, accordions, tabs, modal dialogs, cards, tables, sidebars, read-only records, dense forms, hostile UI, masked values, repeated records, and content that is visually clear but difficult to parse.

Prefer realistic examples over toy examples.

Make examples useful for testing extraction of field-value pairs, repeated records, links, metadata, selected options, hidden details, and visually grouped values.

The result should feel like a plain Storybook-style HTML test page: scrollable, labeled, organized, and easy to test manually.

---

I00 Monitoring Behavior

---

Continue monitoring even when the folder is temporarily empty.

Continue monitoring after each completed implementation.

A reasonable loop is:

Scan `specifications`.

Identify pending specification files.

Sort pending files by numeric prefix when present.

Implement the next pending specification.

Write the implementation into `implementation`.

Mark the specification as done.

Rescan immediately.

If no pending specification exists, wait approximately 30 seconds and scan again.

Do not exit the loop simply because no task is currently available.

Only stop when the user manually stops you or the execution environment ends.

---

J00 Safety And Overwrite Rules

---

Do not overwrite an existing implementation unless the current specification clearly requires replacement.

If the target filename already exists, choose a safe unique filename or record the conflict and continue according to the tracking strategy.

Preserve completed work.

Do not delete previous implementations.

Do not delete specification files unless a specification explicitly instructs you to do so.

Do not mark a specification as done until its implementation has actually been written successfully.

---

K00 Completion Criteria

---

A specification is complete only when the requested implementation exists in `implementation`, the file is self-contained when required, the visible examples match the specification, and the tracking system records the specification as done.

After completion, continue the loop.

Do not provide a final stopping message unless the user or environment stops the process.
