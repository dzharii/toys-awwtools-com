# Agent Instructions

## A00. Mission

Implement the project described in `suggestions001.md`, `suggestions002.md`, and `suggestions003.md`. Treat those files as the current source of truth for product behavior, acceptance scope, and user experience. The application is a static, browser-only, LeetCode-like C99 coding platform built with Bun, using a worker-based architecture, a harness-driven problem model, and a TCC-first research path with a WebAssembly-first execution goal. :contentReference[oaicite:0]{index=0} :contentReference[oaicite:1]{index=1} :contentReference[oaicite:2]{index=2}

The objective is full project completion, not partial scaffolding. Read the specifications repeatedly during implementation. Reconcile product requirements, to-do requirements, and user-facing interaction requirements continuously. Do not optimize for elegance at the expense of shipping a working system. Do not optimize for speed at the expense of documented reasoning when major technical uncertainty exists.

## B00. Authority and operating freedom

You have broad authority to work inside this repository and its parent working environment as needed to complete the project. You may create, edit, move, rename, and delete project files when necessary, except for the immutable research record described below.

You may install software required to complete the work. You may use `apt`, language-specific tooling, compiler toolchains, browser tooling, shell scripts, download utilities, and build dependencies. You may download source code, releases, reference implementations, test assets, and documentation needed for implementation, evaluation, and experimentation.

You may compile, run, benchmark, bundle, inspect, and validate software locally. You may create prototypes, temporary branches of implementation inside the working tree, and focused experiments. Use your best judgment to resolve ambiguity without waiting for clarification unless a decision would permanently contradict an explicit specification.

## C00. Required mindset

Use initiative. Resolve ambiguity with evidence. Prefer progress over hesitation. When the specification leaves room for implementation judgment, choose the option that best preserves the product goals.

Treat this as an iterative engineering and research task. Some approaches will fail. Failure is acceptable when it is discovered early, documented clearly, and used to improve the next attempt. Do not stop at the first obstacle. Investigate, test alternatives, and continue.

Assume that some core technical choices, especially around TCC and browser-side WebAssembly emission, may require experimentation and may fail in practice. The specification already recognizes this risk and requires evidence-driven checkpoints and fallback planning rather than blind commitment. :contentReference[oaicite:3]{index=3} :contentReference[oaicite:4]{index=4}

## D00. Source documents and their roles

`suggestions001.md` is the general product specification. It defines the product boundary, architecture direction, compiler direction, harness model, runtime expectations, fallback expectations, and acceptance criteria. Re-read it before making major architectural decisions. :contentReference[oaicite:5]{index=5} :contentReference[oaicite:6]{index=6}

`suggestions002.md` is the implementation to-do list and acceptance checklist. It defines concrete work items and verification expectations across UX, editor behavior, workers, compiler integration, runtime support, diagnostics, caching, persistence, documentation, fallback behavior, and milestones. Re-read it during implementation and before considering any subsystem complete. :contentReference[oaicite:7]{index=7} :contentReference[oaicite:8]{index=8}

`suggestions003.md` is the user interaction and perception specification. It defines how the product should feel from the perspective of the person using it: readable, stable, responsive, confidence-building, fair, and supportive of iterative problem solving. Use it to judge UI and feedback quality, not just technical correctness. :contentReference[oaicite:9]{index=9} :contentReference[oaicite:10]{index=10} :contentReference[oaicite:11]{index=11}

## E00. Core implementation directives

Build the full product as a static site with Bun. Keep the system browser-only for compile and run behavior. Preserve the single-file C99 model, the LeetCode-like layout, the harness-driven function-call model, the worker-based compile and execution model, and the TCC-first research direction. :contentReference[oaicite:12]{index=12} :contentReference[oaicite:13]{index=13}

Implement the user-facing shell early, but do not mistake UI completion for product completion. The application is not complete until a person can read a problem, edit a C99 solution, run it entirely in the browser, and receive meaningful deterministic feedback. :contentReference[oaicite:14]{index=14} :contentReference[oaicite:15]{index=15}

Preserve replaceability at the compiler boundary. The product must remain stable if the backend changes. Do not entangle the UI, harness, and runtime with TCC internals in a way that prevents fallback. :contentReference[oaicite:16]{index=16} :contentReference[oaicite:17]{index=17}

## F00. Experimentation policy

You are explicitly allowed and expected to experiment.

When facing a major technical uncertainty, especially around TCC integration, browser execution strategy, WebAssembly emission, runtime emulation, or dependency strategy, you should create experiments and test competing approaches. Do not rely on intuition alone where code evidence is possible.

A valid experiment may include a prototype, a stripped-down reproduction, a benchmark, a build attempt, a compatibility check, a small browser demo, a worker proof of concept, or a toolchain feasibility test.

Choose the best approach based on observed results, not preference. Record why one approach was selected and why another was abandoned.

## G00. Backtracking policy

Backtracking is allowed and expected.

If an approach proves unworkable, too fragile, incompatible with the specifications, or meaningfully worse than an alternative, backtrack. Do not continue defending a weak path only because code has already been written.

Before major refactoring caused by a strategic change, create a source backup checkpoint as described below. Then proceed with the new direction. Preserve momentum. A failed path is still useful if it is documented and recoverable.

## H00. Backup policy

Create a `backups/` directory in the repository if it does not already exist.

Create backup checkpoints only before major refactors, architectural reversals, or high-risk rewrites. Do not create noisy backups for every minor edit.

Each backup checkpoint must use the current Unix timestamp as its directory name. Example: `backups/1713478123/`.

A backup checkpoint should preserve source and project-defining files only. Prefer copying source code, configuration, scripts, documentation, and other editable project artifacts. Avoid copying bulky build output, caches, binary blobs, dependency install trees, and other reproducible generated artifacts unless they are essential to preserve the state being abandoned.

The purpose of backups is human review and possible recovery. Organize them so the prior approach is inspectable.

## I00. Research log policy

Create and maintain a `research/` directory.

The `research/` directory is append-only in practice. Do not delete prior research records. Do not rewrite old conclusions just because the direction changed later. If a prior conclusion becomes outdated, create a new file describing the updated understanding and explicitly supersede the old one through the new file rather than erasing history.

Prefer one research file per decision group, feature group, or major technical investigation. Examples include TCC feasibility, worker architecture decisions, editor selection, harness format design, runtime emulation, caching strategy, or fallback backend evaluation.

Each research file should contain enough context to make sense on its own. State the problem being investigated, why it matters to this project, what was tried, what happened, what was learned, what decision follows, and what remains uncertain.

Research files should help a reviewer understand not just what was decided, but why.

## J00. Decision discipline

Make decisions using the following order of precedence.

First, obey explicit product requirements from the three suggestion files.

Second, preserve the end-user experience goals: clarity, responsiveness, fairness, recoverability, and confidence during the edit-run-debug loop. :contentReference[oaicite:18]{index=18} :contentReference[oaicite:19]{index=19}

Third, preserve architecture flexibility where the compiler path remains uncertain.

Fourth, prefer simpler solutions that do not compromise the product goals.

When two choices are both plausible, choose the one that improves shipping odds and preserves future replacement flexibility.

## K00. Iteration loop

Work in repeated cycles.

Start by reviewing the current specifications and the current repository state.

Pick the next highest-value unfinished item from the to-do specification.

Implement it to a real, testable state.

Verify it against the acceptance criteria written in the to-do specification.

Record any important decisions or blockers in `research/`.

Then review the to-do specification again and choose the next item.

Repeat this until the project is complete.

Do not drift for long periods without comparing progress against the to-do file. Revisit the checklist several times during execution. The checklist is not optional bookkeeping. It is part of the implementation contract. :contentReference[oaicite:20]{index=20} :contentReference[oaicite:21]{index=21}

## L00. TCC and WebAssembly directive

Treat TCC as the primary research path, not as an unquestionable final answer.

You must investigate whether TCC can run in the browser-facing toolchain and whether it can produce a browser-executable artifact, ideally WebAssembly, within the product constraints. The specification explicitly requires an evidence-based answer to this question. :contentReference[oaicite:22]{index=22} :contentReference[oaicite:23]{index=23}

Do not assume TCC-to-Wasm is solved. Prove it or disprove it with experiments and documentation. If it works, adopt it. If it does not, preserve the product contract and move to the nearest viable browser-only fallback while documenting the reason and the tradeoffs. :contentReference[oaicite:24]{index=24} :contentReference[oaicite:25]{index=25}

## M00. Verification standard

A task is not complete because code exists. A task is complete when it works and its verification conditions are satisfied.

Use the acceptance language from `suggestions002.md` as the minimum standard. Verify behavior explicitly. Run the application. Trigger the relevant flows. Confirm the UI remains responsive. Confirm failures are reported properly. Confirm persistence works. Confirm the behavior matches the checklist. :contentReference[oaicite:26]{index=26} :contentReference[oaicite:27]{index=27} :contentReference[oaicite:28]{index=28}

For uncertain or high-risk areas, add proof through experiments, logs, and written findings in `research/`.

## N00. Work product expectations

By the end of the project, the repository should contain a working static application, clear source organization, vendored critical dependencies where appropriate, reproducible build instructions, research records, checkpoints for major backtracks when they occurred, and documentation that explains the final chosen compiler and runtime path.

The final repository should make it clear what was implemented, what was researched, what was proven, what fallback was used if necessary, and what remains limited.

## O00. Practical behavior rules

Do not wait passively for perfect certainty.

Do not leave major ambiguity undocumented.

Do not silently abandon difficult requirements.

Do not hide a failed approach; preserve it through backups or research notes when it mattered.

Do not overfit the architecture to TCC if that would damage the product.

Do not treat the research folder as editable history. Add new entries instead.

Do not mark the project complete until the end-to-end product acceptance definition is actually met. :contentReference[oaicite:29]{index=29}

## P00. Immediate startup checklist

Read `suggestions001.md`, `suggestions002.md`, and `suggestions003.md`.

Inspect the repository and identify existing implementation state.

Create `research/` if missing.

Create `backups/` if missing.

Choose the highest-priority unfinished milestone from the to-do specification.

Begin implementation.

Re-check the to-do specification repeatedly until the project is fully completed.

## Q00. Testing and browser validation

Use browser testing as a required part of implementation and verification. The project contains a reusable reference browser-testing setup in `readonly-do-not-edit-here-reference-browser-testing/`. That folder is a read-only reference. Do not modify files in that folder. Do not treat it as the working test directory. Instead, inspect it, learn from it, and copy the necessary structure, configuration patterns, scripts, and testing approach into the actual project-owned testing setup.

The reference folder already demonstrates a working browser-testing approach, including Playwright configuration, page-object structure, static-server helpers, test utilities, and exploratory testing support. Reuse its ideas and patterns where useful, especially for test organization, local static serving, diagnostics, and browser-driven validation. The goal is not to depend on the reference folder forever. The goal is to create a project-native testing setup derived from proven patterns without editing the reference source.

Testing must include both conventional browser tests and exploratory browser testing. Conventional browser tests should cover stable end-to-end behaviors such as loading the application, rendering the problem statement, editing code, triggering Run, receiving results, showing compile failures, showing runtime or test failures, preserving drafts, and maintaining UI responsiveness. These tests should be automated where feasible and should become part of the regular verification workflow.

Exploratory browser testing must also be used intentionally. It should be used to inspect user experience quality, layout stability, confusing flows, failure presentation, state recovery, custom test behavior, and other areas where rigid assertions alone are insufficient. Exploratory testing should be treated as a structured activity rather than random clicking. Reuse the reference approach for charters, session structure, diagnostics, and notes, but store project-specific exploratory assets and findings in the project-owned testing and research areas, not inside the read-only reference folder.

When setting up project testing, create a separate test area owned by this project. That area may borrow layout and conventions from the reference folder, but it must remain independent. The implementation should make it easy to run browser tests locally against the static application, using a local static server and repeatable commands. Diagnostics from failed browser runs should be preserved in a form that helps debugging.

Testing is part of acceptance, not an optional afterthought. Repeatedly use browser testing while implementing UI, workers, harness behavior, persistence, and runtime flows. Validate not only that the application functions, but that it behaves clearly and reliably from the person's point of view.


