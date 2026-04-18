2026-04-18

A00. research-and-to-do.md

# Research and To-Do

This document is the implementation to-do list and acceptance checklist for a static, browser-only, LeetCode-like C99 platform. Every item below is a required task. Every task is followed by explicit verification requirements that define how completion is validated.

## A00. Product foundation

1. Define the product as a static website built with Bun and deployed without any server-side compilation or execution.

Verify that the project can be built into static assets only.
Verify that opening the built site does not require any backend service.
Verify that all compile and run workflows occur entirely in the browser.

2. Define the problem-solving model as LeetCode-like and single-file only.

Verify that each problem accepts exactly one user-editable C source file.
Verify that the UI does not require project creation, file trees, or multi-file editing.
Verify that the product documentation states that the initial version supports single-file solutions only.

3. Define the language target as strict C99.

Verify that the compiler path is configured for C99 behavior.
Verify that the UI and docs consistently describe the platform as C99.
Verify that unsupported extensions are documented or rejected clearly.

4. Define the primary execution target as WebAssembly, with fallback only if the preferred path proves infeasible.

Verify that the architecture documentation identifies WebAssembly as the preferred output and execution format.
Verify that any fallback path is documented as a fallback rather than the primary design.
Verify that the implementation includes a feasibility checkpoint for browser-native Wasm execution.

## B00. User experience and layout

1. Implement a LeetCode-like layout with a problem panel and a code panel.

Verify that the problem description is visible to the user while coding.
Verify that the code editor is visible and usable without leaving the problem page.
Verify that the layout remains understandable on common desktop widths.

2. Implement a readable problem description view.

Verify that the problem title, statement, examples, and constraints are rendered.
Verify that long problem statements remain readable without layout breakage.
Verify that code examples and inline formatting render correctly.
Verify that the user can scroll the problem panel independently when needed.

3. Implement a test and output area associated with the editor.

Verify that the user can see test results after running code.
Verify that console output, if present, is visible in a dedicated output area.
Verify that the test area distinguishes compile errors, runtime errors, and failed assertions.

4. Implement responsive behavior for narrower screens.

Verify that the layout remains usable on tablet-sized screens.
Verify that the editor and problem statement remain accessible even when not shown side by side.
Verify that the user can switch between relevant views without losing work.

## C00. Problem content model

1. Define a machine-readable problem format.

Verify that each problem has an identifier, title, difficulty, statement, examples, and constraints.
Verify that each problem defines a required function signature.
Verify that each problem contains visible test cases or sample tests.

2. Define a harness-driven problem model.

Verify that each problem can call a user-implemented function using a known signature.
Verify that the harness can construct inputs and compare outputs.
Verify that the user is not required to write the harness code manually.

3. Support structured result reporting from the harness.

Verify that the harness can report pass or fail per test.
Verify that expected value and actual value can be shown where relevant.
Verify that harness errors are surfaced separately from compiler errors.

## D00. Editor experience

1. Implement a C editor suitable for algorithm problems.

Verify that the editor supports C syntax highlighting.
Verify that the editor supports basic keyboard input without lag.
Verify that pasted code preserves formatting correctly.

2. Implement a starter template per problem.

Verify that opening a problem populates the editor with the expected function signature or starter code.
Verify that the starter code matches the harness expectations.
Verify that the user can edit only the solution file, not hidden harness internals.

3. Implement local draft persistence.

Verify that the user's code is preserved across page refreshes.
Verify that draft persistence is keyed by problem identifier.
Verify that the user does not lose code on accidental reload.

4. Implement basic editor actions.

Verify that the user can run code with a visible Run action.
Verify that the user can reset to the starter template with a clear action.
Verify that action labels are understandable and consistent.

## E00. Run and test workflow

1. Implement a Run action that starts compilation and testing.

Verify that pressing Run initiates the full compile-and-test pipeline.
Verify that the UI provides visible feedback that a run is in progress.
Verify that the user receives a result without needing to refresh the page.

2. Implement separate states for idle, running, success, and failure.

Verify that the Run action cannot be confused with an inactive UI state.
Verify that the running state is visible during compilation or execution.
Verify that success and failure states are distinguishable at a glance.

3. Implement user-friendly compile error reporting.

Verify that compilation failures are shown clearly and without raw internal noise where avoidable.
Verify that filename, line, and column are shown when available.
Verify that the user can understand whether the issue is syntax, type, or missing symbol related.

4. Implement user-friendly runtime and test reporting.

Verify that runtime errors are shown separately from compilation failures.
Verify that failed tests show enough detail to understand the mismatch.
Verify that passing tests are reported clearly.

## F00. Worker-based architecture

1. Implement compilation in a dedicated Web Worker.

Verify that compilation does not block typing or scrolling in the main UI.
Verify that worker startup and messaging are encapsulated behind a stable interface.
Verify that compiler diagnostics are returned from the worker to the UI.

2. Implement execution in a worker-managed runtime.

Verify that running code does not freeze the main thread.
Verify that execution results are returned through structured messages.
Verify that a failed run does not crash the whole application.

3. Implement clear worker lifecycle management.

Verify that workers are initialized predictably.
Verify that long-lived workers can be reused across runs when appropriate.
Verify that workers can be reset or recreated after fatal internal errors.

## G00. Compiler integration with TCC

1. Vendor TinyCC into the repository.

Verify that TCC source or build artifacts exist inside a local vendor directory.
Verify that the project does not depend on fetching TCC dynamically at runtime.
Verify that the vendored version is pinned and documented.

2. Investigate running TCC in the browser.

Verify that a documented experiment exists showing whether TCC can run inside the browser environment.
Verify that the experiment records what toolchain or adaptation was required.
Verify that the outcome is captured in the research notes.

3. Determine whether TCC can emit a browser-executable artifact.

Verify that the research explicitly answers whether TCC can emit WebAssembly directly in this architecture.
Verify that the answer includes code evidence or a proof-of-concept result.
Verify that limitations and blockers are written down clearly.

4. Define the backend boundary so TCC can be replaced if needed.

Verify that the UI, harness, and runtime are not tightly coupled to TCC internals.
Verify that a compiler adapter interface exists or is planned.
Verify that changing the backend would not require rewriting the whole product.

## H00. WebAssembly execution path

1. Implement or prototype the preferred Wasm execution path.

Verify that the system can accept a compiled WebAssembly module and instantiate it in the browser.
Verify that execution results can be captured and returned to the UI.
Verify that the implementation documents how imports, exports, and invocation are wired.

2. Validate whether the browser-hosted compiler can produce another Wasm artifact for execution.

Verify that the research clearly states whether a compiler running in the browser can emit a second executable Wasm module.
Verify that the implementation or prototype demonstrates this if feasible.
Verify that the limitation, if any, is attributed to the compiler path rather than to the browser platform.

3. Define the fallback if direct TCC-to-Wasm is not feasible.

Verify that the fallback still preserves browser-only execution.
Verify that the fallback is documented as a temporary or alternative backend strategy.
Verify that the user-facing UX remains unchanged under the fallback.

## I00. Runtime and standard library support

1. Define the browser-hosted C99 runtime surface.

Verify that the supported headers and functions are enumerated.
Verify that emulated behavior is documented where native OS behavior is not available.
Verify that unsupported features are identified clearly.

2. Implement broad C99 library support as a target.

Verify that the runtime plan aims to support standard C99 library behavior rather than an intentionally tiny subset.
Verify that the implementation tracks gaps between desired and actual support.
Verify that the user-facing docs state the current support status honestly.

3. Implement deterministic runtime behavior.

Verify that repeated runs with the same code and test data behave consistently.
Verify that host-provided functions do not introduce accidental nondeterminism.
Verify that the harness result format is stable across runs.

## J00. Harness and test infrastructure

1. Implement a harness system for calling one user-defined function.

Verify that the harness can call the correct function name and signature for a given problem.
Verify that incorrect user signatures result in understandable feedback.
Verify that the harness is not user-editable in normal operation.

2. Support common algorithm-problem input types.

Verify that primitive values can be passed correctly.
Verify that strings and arrays can be passed correctly.
Verify that return values can be captured and compared correctly.

3. Implement visible sample tests and custom tests.

Verify that sample tests from the problem statement can be executed by the user.
Verify that the user can add or edit custom test inputs where the problem model allows it.
Verify that custom test execution does not corrupt official test definitions.

4. Implement structured result comparison.

Verify that the comparison logic can distinguish correct and incorrect outputs.
Verify that mismatches are rendered in a readable format.
Verify that comparison rules are documented for each supported type family.

## K00. Output, diagnostics, and observability

1. Separate compile diagnostics from runtime output.

Verify that compile errors appear in a different category from stdout or stderr.
Verify that runtime traps or failures are not misreported as compile errors.
Verify that the UI labels these cases clearly.

2. Capture stdout and stderr separately.

Verify that both output streams can be surfaced independently.
Verify that the user can read output from the latest run without confusion.
Verify that empty output does not create misleading UI noise.

3. Provide enough diagnostic metadata for debugging.

Verify that line and column data are shown when available.
Verify that test failure output includes expected and actual values where appropriate.
Verify that severe internal failures produce a useful high-level message.

## L00. Performance and responsiveness

1. Keep the edit-run loop responsive.

Verify that typing in the editor remains responsive during background compile activity.
Verify that running small programs feels quick enough for iterative work.
Verify that repeated runs do not degrade noticeably over a short session.

2. Reuse expensive initialization where possible.

Verify that compiler assets are not reloaded unnecessarily on every run.
Verify that worker reuse is considered where safe.
Verify that warm runs are faster than full cold starts where possible.

3. Cache static assets and large toolchain assets.

Verify that the app can reuse previously loaded assets after refresh.
Verify that versioned compiler-related assets can be invalidated safely.
Verify that caching behavior is documented for development and production builds.

## M00. Offline and local persistence

1. Support offline use after initial asset load where feasible.

Verify that the app can still open and run previously cached content without network access when supported by the browser.
Verify that local problem metadata and editor assets can be served from cache after first load.
Verify that the limits of offline behavior are documented.

2. Persist user drafts and last-opened context.

Verify that the last-opened problem can be restored.
Verify that the last editor contents can be restored.
Verify that persistence failures do not destroy the active session.

## N00. Dependency and build strategy

1. Use Bun as the build tool for the static application.

Verify that the project can be built with Bun on WSL/Linux.
Verify that local development commands are documented.
Verify that the build output is static and deployable without backend logic.

2. Vendor important runtime dependencies.

Verify that critical dependencies are stored locally in the repository.
Verify that version pinning is recorded.
Verify that fetch or update scripts exist for reproducibility.

3. Avoid unnecessary runtime CDN dependence.

Verify that core editor, runtime, and compiler paths do not break if a third-party CDN is unavailable.
Verify that local builds remain reproducible without remote runtime package resolution.
Verify that the dependency policy is documented.

## O00. Documentation and research outputs

1. Maintain product and technical documentation in the repository.

Verify that the product specification is checked into source control.
Verify that research findings about TCC and Wasm are stored in a readable document.
Verify that implementation decisions are updated when the architecture changes.

2. Record unresolved risks explicitly.

Verify that open technical risks are tracked as unresolved items rather than hidden assumptions.
Verify that TCC-to-Wasm feasibility remains a first-class tracked risk until proven.
Verify that each risk has a next action or research task.

3. Maintain a clear acceptance checklist for each major subsystem.

Verify that UI, editor, compiler, runtime, harness, and caching each have completion criteria.
Verify that the checklist can be used by another engineer without oral context.
Verify that task status can be updated incrementally.

## P00. Fallback planning

1. Preserve the product UX even if the compiler backend changes.

Verify that the page layout, problem model, and harness system do not assume a single compiler forever.
Verify that backend replacement is possible through a bounded adapter layer.
Verify that fallback behavior does not require redesigning the user workflow.

2. Define a browser-only fallback if TCC cannot satisfy the preferred Wasm path.

Verify that the fallback still avoids server-side compilation and execution.
Verify that the fallback is documented with reasons and tradeoffs.
Verify that the fallback keeps the same acceptance goals for the end user.

## Q00. Acceptance milestones

1. Milestone 1: Product shell complete.

Verify that the app shows a problem description, editor, and test area.
Verify that drafts persist locally.
Verify that the page is buildable and deployable as a static site.

2. Milestone 2: Harness and run loop complete.

Verify that a sample problem can execute against a harness.
Verify that pass and fail results are visible in the UI.
Verify that compile and runtime states are distinguishable.

3. Milestone 3: Worker architecture complete.

Verify that compile and execution work happen off the main thread.
Verify that the main UI remains responsive during runs.
Verify that worker failures are handled gracefully.

4. Milestone 4: TCC feasibility checkpoint complete.

Verify that TCC has been vendored and evaluated in-browser.
Verify that the project has a written answer on whether TCC can produce a browser-executable artifact.
Verify that the next implementation decision is based on evidence rather than assumption.

5. Milestone 5: Preferred Wasm path complete or fallback adopted.

Verify that the preferred path is running if TCC-to-Wasm proves feasible.
Verify that a browser-only fallback is in place if the preferred path proves infeasible.
Verify that the end-user experience remains consistent in either case.

## R00. Final acceptance definition

The project is complete for the first version when a user can open a static web page, read a problem, edit a single C99 solution file, press Run, and receive deterministic test results entirely in the browser without any server-side compile or run step.

Verify that the complete flow works from page load to result display on a static deployment.
Verify that the UI remains understandable and readable during the full flow.
Verify that the implementation documents the exact compiler and runtime path used.
Verify that the current level of C99 and library support is written down clearly.
Verify that the TCC and WebAssembly research conclusion is included in the repository.
