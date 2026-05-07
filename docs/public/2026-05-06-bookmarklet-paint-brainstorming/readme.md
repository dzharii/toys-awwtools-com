# Autonomous Iteration Directive For Quick Sketch Bookmarklet

You are participating in an experiment. Your work will be evaluated based on your ability to use creativity, product judgment, engineering judgment, UI/UX taste, code quality, and autonomous iteration to improve an existing browser bookmarklet product.

You are given an existing product specification and an existing JavaScript bookmarklet implementation.

The current saved files are:

```text
001_initial_bookmarklet-spec.md
001_initial_bookmarklet.js
```

These files represent iteration `001`, the original baseline. They are the starting point for your work.

Your task is to autonomously evolve this product through five additional iterations:

```text
002
003
004
005
006
```

Iteration `006` is the final version.

You must not stop after one improvement. You must continue iterating until all required iterations are complete.

---

# Product Context

The product is a browser bookmarklet called Quick Sketch Bookmarklet.

It injects a compact floating sketch and annotation window into the current web page. It already supports local drawing, image annotation, shapes, filled shapes, text, selection, copy, cut, download, undo/redo, dragging, resizing, and internal scrolling.

The project must remain a self-contained bookmarklet. It must stay local-first. It must not use a backend, external scripts, external CSS, external fonts, analytics, accounts, cloud storage, or hosted assets.

Your goal is to make the product significantly better through thoughtful, incremental improvements.

You should use your own best judgment. You should not merely make cosmetic changes. Each iteration should add meaningful value while respecting the product’s scope: a compact, fast, Paint-like browser sketch and annotation utility.

---

# Critical Iteration Rule

Every new iteration must be based on the immediately previous iteration, not on the original baseline.

This is mandatory.

The chain is:

```text
001 is the original baseline.
002 is built on top of 001.
003 is built on top of 002.
004 is built on top of 003.
005 is built on top of 004.
006 is built on top of 005.
```

Do not skip iterations.

Do not rebuild from scratch.

Do not go back to `001` after you have created `002`.

Each iteration must preserve the useful work from all previous iterations unless you have a strong product or engineering reason to refactor or replace something. If you do replace something, explain it clearly in that iteration’s delta file.

---

# Read-Only Rule For Previous Iterations

Previous iteration files are read-only.

This is extremely important.

When working on iteration `002`, you may read:

```text
001_initial_bookmarklet-spec.md
001_initial_bookmarklet.js
```

But you must not modify them.

When working on iteration `003`, you may read:

```text
002_initial_bookmarklet-spec.md
002_initial_bookmarklet.js
002_delta.md
```

But you must not modify any `001` or `002` files.

When working on iteration `004`, you may read `003` files, but you must not modify `001`, `002`, or `003`.

This pattern continues through `006`.

Only the files for the currently active iteration may be created or edited.

Once an iteration is complete and you move to the next iteration, the previous iteration becomes read-only forever.

---

# Required Files Per Iteration

For every new iteration, create exactly these three files using the current iteration number.

For iteration `002`, create:

```text
002_initial_bookmarklet-spec.md
002_delta.md
002_initial_bookmarklet.js
```

For iteration `003`, create:

```text
003_initial_bookmarklet-spec.md
003_delta.md
003_initial_bookmarklet.js
```

For iteration `004`, create:

```text
004_initial_bookmarklet-spec.md
004_delta.md
004_initial_bookmarklet.js
```

For iteration `005`, create:

```text
005_initial_bookmarklet-spec.md
005_delta.md
005_initial_bookmarklet.js
```

For iteration `006`, create:

```text
006_initial_bookmarklet-spec.md
006_delta.md
006_initial_bookmarklet.js
```

---

# Specification File Rule

For each iteration, create a full updated specification file.

Example for iteration `002`:

```text
002_initial_bookmarklet-spec.md
```

This file must contain the full specification, not just the changes.

It should be based on the previous iteration’s specification, with the new features and behavior merged into it.

For example:

```text
002_initial_bookmarklet-spec.md is based on 001_initial_bookmarklet-spec.md.
003_initial_bookmarklet-spec.md is based on 002_initial_bookmarklet-spec.md.
004_initial_bookmarklet-spec.md is based on 003_initial_bookmarklet-spec.md.
005_initial_bookmarklet-spec.md is based on 004_initial_bookmarklet-spec.md.
006_initial_bookmarklet-spec.md is based on 005_initial_bookmarklet-spec.md.
```

The specification should remain coherent and complete. Do not merely append random notes at the bottom. Integrate new behavior into the correct sections.

The final `006_initial_bookmarklet-spec.md` should describe the complete final product.

---

# Delta File Rule

For each iteration, create a delta file.

Example for iteration `002`:

```text
002_delta.md
```

The delta file should describe only what changed in that iteration.

It is for review convenience. The user should be able to read the delta file and quickly understand what was added, removed, refactored, improved, fixed, or intentionally deferred.

The delta file should include:

```text
Iteration number
Previous iteration used as input
Summary of product improvements
New UI/UX behavior
New technical behavior
Files created
Important implementation notes
Manual review checklist
Known limitations, if any
```

The delta content must also be reflected in the full updated specification for that iteration.

Do not rely on the delta file alone. The specification must also be updated.

---

# JavaScript File Rule

For each iteration, create a JavaScript bookmarklet file.

Example for iteration `002`:

```text
002_initial_bookmarklet.js
```

This file must be based on the previous iteration’s JavaScript file.

For example:

```text
002_initial_bookmarklet.js starts from 001_initial_bookmarklet.js.
003_initial_bookmarklet.js starts from 002_initial_bookmarklet.js.
004_initial_bookmarklet.js starts from 003_initial_bookmarklet.js.
005_initial_bookmarklet.js starts from 004_initial_bookmarklet.js.
006_initial_bookmarklet.js starts from 005_initial_bookmarklet.js.
```

The JavaScript should remain a self-contained bookmarklet. It should start with the bookmarklet form:

```text
javascript:(function quickSketchBookmarklet() {
```

The code should remain readable. Do not minify the implementation.

Do not add external dependencies.

Do not use placeholders.

Do not leave TODOs.

Do not produce partial code.

Every JavaScript file must be complete and executable.

---

# Required Process For Every Iteration

For each iteration from `002` through `006`, perform the following steps.

## Step 1: Read Previous Iteration

Read the previous iteration’s specification and JavaScript implementation.

For `002`, read:

```text
001_initial_bookmarklet-spec.md
001_initial_bookmarklet.js
```

For `003`, read:

```text
002_initial_bookmarklet-spec.md
002_initial_bookmarklet.js
002_delta.md
```

Continue this pattern.

## Step 2: Think Creatively And Choose Improvements

Use your own product judgment to decide what would make the product better.

Improvements should be meaningful and within the scope of a compact bookmarklet sketch utility.

Good improvements may include:

```text
Better toolbar organization
Better shape behavior
Better export behavior
Better selection behavior
Better text behavior
Better usability feedback
Better keyboard accessibility
Better image annotation workflows
Better local editing tools
Better performance
Better undo/redo reliability
Better mobile or touch handling
Better visual polish
Better help/discoverability
Better state safety
Better clipboard fallback behavior
Better error handling
```

Avoid changes that would violate the product scope, such as:

```text
Accounts
Cloud sync
Backend services
Collaboration
Large sidebars
Complex object inspectors
Project files
Remote assets
Analytics
Heavy frameworks
External dependencies
```

## Step 3: Update Full Specification

Create the new full specification file for the current iteration.

It must include the previous specification plus the new changes integrated into the correct sections.

## Step 4: Create Delta File

Create the current iteration delta file.

Describe only what changed in this iteration.

The delta should make review easy.

## Step 5: Create Updated JavaScript Bookmarklet

Copy the previous iteration’s JavaScript into the new current iteration file, then implement the new changes on top of it.

Do not modify the previous iteration file.

## Step 6: Perform Code Review

After implementing the iteration, perform a code review of the current iteration’s JavaScript.

This is mandatory.

You must inspect the code for:

```text
Correctness
Runtime errors
Broken event handlers
Broken undo/redo
Broken export
Broken copy/cut behavior
Broken selection behavior
Broken pointer handling
Broken text behavior
Broken shape behavior
Host page interference
Memory leaks
Object URL cleanup
Shadow DOM isolation
Accessibility regressions
Toolbar overflow
Security/privacy mistakes
Accidental external dependencies
Unintended modification of previous iteration files
```

## Step 7: Fix Issues Before Moving On

If you find issues during the code review, fix them in the current iteration files before moving to the next iteration.

Do not move to the next iteration until the current one has been reviewed and corrected.

This is extremely important.

Repeat: after each iteration, you must review the code and fix issues before proceeding.

## Step 8: Proceed To Next Iteration

Only after the current iteration files are complete and reviewed, proceed to the next iteration.

---

# Required Iteration List

You must complete all of these.

## Iteration 001

Already exists.

Input files:

```text
001_initial_bookmarklet-spec.md
001_initial_bookmarklet.js
```

Do not modify these files.

## Iteration 002

Create:

```text
002_initial_bookmarklet-spec.md
002_delta.md
002_initial_bookmarklet.js
```

Base `002` on `001`.

Perform code review and fix issues before moving to `003`.

## Iteration 003

Create:

```text
003_initial_bookmarklet-spec.md
003_delta.md
003_initial_bookmarklet.js
```

Base `003` on `002`.

Perform code review and fix issues before moving to `004`.

## Iteration 004

Create:

```text
004_initial_bookmarklet-spec.md
004_delta.md
004_initial_bookmarklet.js
```

Base `004` on `003`.

Perform code review and fix issues before moving to `005`.

## Iteration 005

Create:

```text
005_initial_bookmarklet-spec.md
005_delta.md
005_initial_bookmarklet.js
```

Base `005` on `004`.

Perform code review and fix issues before moving to `006`.

## Iteration 006

Create:

```text
006_initial_bookmarklet-spec.md
006_delta.md
006_initial_bookmarklet.js
```

Base `006` on `005`.

Perform final code review and fix issues.

This is the final output of the experiment.

---

# Expected Final File Set

At the end, the directory should contain the original files plus the new iteration files.

Expected files:

```text
001_initial_bookmarklet-spec.md
001_initial_bookmarklet.js

002_initial_bookmarklet-spec.md
002_delta.md
002_initial_bookmarklet.js

003_initial_bookmarklet-spec.md
003_delta.md
003_initial_bookmarklet.js

004_initial_bookmarklet-spec.md
004_delta.md
004_initial_bookmarklet.js

005_initial_bookmarklet-spec.md
005_delta.md
005_initial_bookmarklet.js

006_initial_bookmarklet-spec.md
006_delta.md
006_initial_bookmarklet.js
```

The `001` files must remain unchanged.

The `002` files must remain unchanged after moving to `003`.

The `003` files must remain unchanged after moving to `004`.

The `004` files must remain unchanged after moving to `005`.

The `005` files must remain unchanged after moving to `006`.

Only the currently active iteration files may be edited.

---

# Quality Bar

This experiment evaluates whether you can autonomously produce a high-quality product.

Each iteration should show thoughtful improvement.

Do not make trivial changes just to satisfy the iteration count.

Do not add random features that make the product worse.

Do not overcomplicate the product.

Use your best judgment and taste.

Prioritize:

```text
User value
Simplicity
Reliability
Local-first privacy
Compact UI
Fast interaction
Clear visual feedback
Maintainable code
Safe clipboard behavior
Good undo/redo behavior
No host page damage
```

The product should feel better after every iteration.

---

# Code Review Requirement Repeated

After every iteration, you must review your own code and fix problems before continuing.

This is not optional.

For every iteration:

```text
Implement.
Review.
Find issues.
Fix issues.
Only then move to the next iteration.
```

Do not leave known bugs unfixed unless they are explicitly documented as a limitation in the delta and are not critical.

Do not create incomplete code.

Do not leave TODOs.

Do not leave placeholders.

Do not modify previous iteration files to fix bugs. Fix bugs only in the current iteration or later iterations.

---

# Autonomy Requirement

Work autonomously.

Use your creativity.

Use your best engineering judgment.

Use your best product judgment.

Use your best UI/UX judgment.

Do not wait for the user to tell you exactly what feature to add at every iteration.

You are expected to inspect the current product, identify opportunities, and implement valuable improvements.

The improvements should make sense for this product: a compact browser bookmarklet sketch and annotation utility.

---

# Final Deliverable

When complete, provide a concise final summary that lists:

```text
All files created
One-sentence summary of each iteration
Any important final notes
```

The final version is:

```text
006_initial_bookmarklet-spec.md
006_initial_bookmarklet.js
```

The final delta is:

```text
006_delta.md
```

Iteration `006` must represent the best final product you can produce after five autonomous improvement passes.
