2025-12-21

A00. Document purpose and scope

This specification defines a single static HTML, CSS, and vanilla JavaScript web application page that teaches Dynamic Programming through 15 curated problems, interactive visualizations, guided hints, and companion offline test templates. The page must run fully offline after load and must not use external dependencies, CDNs, fonts, analytics, or network calls.

The implementer is a coding agent. This document is the source of truth for UI, UX, behavior, validation, visualization mechanics, and the required test and starter-code deliverables. The coding agent may derive problem solutions, but must not invent product behaviors that conflict with this specification.

B00. Non-goals and out-of-scope

The app does not include user accounts, cloud sync, telemetry, or backend services.

The app does not include multiple algorithm pages. Only the Dynamic Programming page is in scope.

The app does not include advanced DP optimizations (convex hull trick, divide-and-conquer optimization, Knuth optimization), and does not include bitmask DP beyond basic subset DP.

The app does not attempt to reproduce LeetCode UI or accept submissions. It is an educational visualization.

C00. Deliverable structure

C00.1 Web app deliverables

The web app deliverable is a single folder with these files.

index.html is the only page. It contains the DP module and all lessons.

styles.css contains all styling.

app.js contains application state, rendering, event handling, validation, and simulation.

lessons.js contains the problem catalog (problem statements, hints, example sets, default inputs, and visualization configuration).

All assets are local. If icons are used, they must be inline SVG inside index.html or embedded as data URLs in CSS.

C00.2 Starter-code and test deliverables

The implementer must also deliver a separate folder named templates containing starter files and tests for each of the 15 problems in two languages: JavaScript and C (C99).

Folder structure is fixed.

templates/
js/
dp-01-climbing-stairs.js
dp-02-min-cost-climbing-stairs.js
...
dp-15-word-break.js
c99/
dp-01-climbing-stairs.c
dp-02-min-cost-climbing-stairs.c
...
dp-15-word-break.c
README.md

Each per-problem file is a single compilation or execution unit. It contains: problem statement in header comments, examples, a function stub to implement, an ad hoc test runner, and a test suite. No external test frameworks are allowed.

templates/README.md must explain how to run all tests in each language using only standard tooling available on a typical developer machine.

D00. User experience goals and UX rules

The user experience must be fast, stable, and predictable. Every action must have immediate visible feedback.

The page must work well on a laptop viewport width 1024px and above, and must remain usable down to 375px wide with responsive layout. On small widths, panels stack vertically.

The learning flow is driven by progressive disclosure. Hints are hidden by default and revealed by explicit user action. Revealing a hint must not reveal full solutions; it reveals structured guidance only.

The user must be able to run, step, and reset visualizations without editing code.

The user must be able to edit inputs and immediately see the effects when rerunning.

The user must be able to switch between Tabulation and Memoization modes for each lesson. The default mode is Tabulation.

E00. Visual design and typography

No external fonts. Use system font stack: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial.

Use a clean, high-contrast theme. Provide a light theme by default and a manual dark theme toggle. Theme selection persists in localStorage.

Spacing uses an 8px base scale. Body line length is capped at 80 characters for readability by constraining content max-width.

Typography rules: h1 is used once for page title. h2 for lesson title. h3 for panel titles. Paragraph font-size 16px or 17px. Code font uses ui-monospace, SFMono-Regular, Menlo, Consolas, monospace.

Color usage is functional. Colors are used only to convey state in visualization: current write, dependencies read, base case, computed, unreachable, error. Do not rely on color alone; also use icons or patterns (border style or glyphs).

F00. Information architecture and layout

The page uses a two-column layout for wide screens.

Left column is the Lesson Navigator and Lesson Outline.

Right column is the Lesson Workspace.

Lesson Navigator shows the list of 15 problems with progress markers: Not Started, In Progress, Completed. Progress is per lesson and stored in localStorage.

Lesson Workspace contains panels in a fixed order.

F00.1 Panel order in Lesson Workspace

Panel 1: Problem Statement
Panel 2: Input Editor
Panel 3: Hint Drawer
Panel 4: State Builder
Panel 5: Transition Builder
Panel 6: Visualization
Panel 7: Code Playground
Panel 8: Examples and Self-Check

Panel titles and ordering must not change across lessons.

G00. Application state model

The app maintains a single global state object in app.js, serializable to JSON. It includes: selectedLessonId, theme, per-lesson user edits, per-lesson progress, current run state, and visualization playback state.

State is persisted to localStorage on every meaningful change. A Reset All control clears localStorage and reloads to defaults.

Run state is one of: Editing, Ready, Running, Paused, Completed, Error.

Editing means inputs or configuration changed. Visualization is cleared.

Ready means validation passes and run can start.

Running means stepper is active; editing is disabled for inputs and transition.

Paused means stepper is stopped; editing remains disabled until Stop or Reset.

Completed means final result computed and displayed.

Error means validation or runtime error occurred; error details are shown.

H00. Lesson model and content requirements

Each lesson is defined by a lesson descriptor object in lessons.js with these required fields.

id: stable string
title: display title
difficulty: 1 to 5
problemText: full statement including constraints
ioFormat: explicit inputs and outputs
examples: array of example objects with input and expected output
defaultInput: structured input object
inputSchema: defines how to render and validate input editor
hints: array of hint objects with levels
dpModeSupport: tabulation and memoization flags
visualizationSpec: defines table shape, dependency neighborhood, and renderer configuration
codeTemplates: per mode templates with placeholders for user-editable parts
selfCheck: array of deterministic questions with answers

Problem text must be complete. It must not link out. It must include constraints that keep visualization bounded by default.

Hints must be structured into levels and must avoid giving final solutions. Each hint level is one of: Observation, StateSuggestion, TransitionSuggestion, Pitfall, Complexity.

StateSuggestion may propose candidate dp meaning but must not provide the full transition. TransitionSuggestion may propose a template form but must not provide complete final logic with all edge cases.

I00. Input editor specification

The input editor renders controls based on inputSchema.

Supported input types: integer n, integer array, 2D grid of integers, 2D grid of booleans (obstacles), string, set of strings (dictionary), and coin set.

All inputs must have validation rules: type, min, max, length bounds, and additional constraints like non-negative only or dictionary words lowercase only. Invalid inputs show inline error messages and disable Run.

The input editor includes a Randomize button when applicable. Randomize must respect constraints and stay within visualization bounds.

Any input change sets run state to Editing and clears visualization.

J00. Hint Drawer specification

Hints are hidden by default.

The Hint Drawer shows a list of hint levels. Each level has a Reveal button. Revealed hints remain visible until the lesson is reset.

Reveal is one-way per run session; however, the user may reset the lesson to hide all hints.

Each revealed hint is displayed as short paragraphs and may include small diagrams rendered in plain HTML, but must not display full solution code.

K00. State Builder specification

The State Builder is an interactive structured form that produces a dp state signature.

The user selects one of the provided state patterns for the lesson, then can edit variable names and dp meaning text.

For 1D problems, the builder supports dp[i] meaning and base cases dp[0], dp[1] as applicable.

For 2D problems, the builder supports dp[i][j] meaning and base cases along row 0 and column 0.

The builder must show a Dependency preview that highlights which neighboring cells are expected dependencies. This preview is derived from the lesson’s visualizationSpec and does not require the user to write transitions.

Changing the state signature invalidates the current run and clears visualization.

L00. Transition Builder specification

The Transition Builder is a constrained editor, not free-form code.

It provides a template with placeholders and allowed references. Example: dp[i] = combine(dp[i-1], dp[i-2], input[i]).

Allowed operations are limited to: min, max, sum, count, boolean OR, boolean AND, and custom choose-one-predecessor for reconstruction.

The builder must validate that the transition writes exactly one target dp cell and reads only allowed dependency cells defined by visualizationSpec.

If the user creates an invalid transition, the builder shows a specific error, disables Run, and highlights the invalid reference.

The Transition Builder provides a Reset to Default Transition control. This resets only the transition builder content, not inputs or hints.

M00. Visualization system specification

The visualization system renders the dp table and animates computation.

M00.1 DP table renderer

Supports 1D and 2D.

Each cell has a status: Uncomputed, Base, Computed, CurrentWrite, DependencyRead, Unreachable, Error.

Cell content is rendered as: number, boolean (T or F), or Infinity symbol. Infinity must also have a screen-reader label Infinity.

M00.2 Step execution model

A run is decomposed into steps. Each step is a pure record of: stepIndex, targetCell, readCells, writeValue, statusChanges, and optional predecessor pointer.

The visualization must not depend on actual runtime execution order from user code. It must be driven by the step list generated by the engine.

Two run engines must exist.

Engine A is Template Engine. It uses the state builder and transition builder definitions to compute steps deterministically for supported lessons.

Engine B is Code Engine. It runs the user’s code in a sandboxed environment and captures dp writes by instrumented APIs.

By default, all lessons must support Engine A. Engine B is optional and may be implemented if feasible without external dependencies. If Engine B is omitted, the Code Playground becomes read-only with a Copy button, and running uses Engine A.

M00.3 Controls

Controls: Run, Step, Back, Play, Pause, Stop, Reset.

Run starts from step 0 and enters Running.

Step advances one step.

Back moves one step back only if the engine supports reverse playback by stored snapshots. If not supported, Back is disabled and shows tooltip Back requires snapshots.

Play runs steps at 5 steps per second. Speed control allows 1, 2, 5, 10 steps per second.

Pause stops playback.

Stop halts the run and returns to Ready, keeping computed dp values on screen but disabling stepping until Run is pressed again.

Reset clears dp table to Uncomputed and returns to Editing.

M00.4 Reconstruction view

For lessons that support reconstruction, the visualization includes a toggle Show reconstruction. When enabled, it overlays the chosen path or chosen indices.

Reconstruction data must be derived from predecessor pointers stored during step generation.

N00. Code Playground specification

The Code Playground shows code for Tabulation and Memoization in separate tabs.

If Engine B is implemented, the playground is editable and runnable. Running code must update the same visualization and final output panel. The code environment must prevent access to window, document, localStorage, network, timers, and eval. It must expose only a safe API: input, output, writeDP, readDP, setPredecessor.

If Engine B is not implemented, code is still shown, but cannot be run. The user runs Engine A instead. This must be clearly indicated in UI text: Visualization run uses the template engine.

Regardless of Engine B support, the code must use plain JavaScript and be formatted for readability.

O00. Examples and self-check specification

Each lesson includes at least five example sets.

The Examples panel lists examples with a Run Example button. Running an example sets inputs, resets visualization, and sets expected output for comparison.

After completion, the app shows Pass or Fail with exact expected and actual.

Self-check questions are short and deterministic. Answer formats are multiple choice or short numeric or string. The UI provides immediate feedback.

Self-check questions must cover: state meaning, base cases, dependency direction, and time complexity class.

P00. Problem catalog to include

The page must include exactly these 15 lessons, in this order, with stable ids.

dp-01: Climbing Stairs
dp-02: Min Cost Climbing Stairs
dp-03: House Robber
dp-04: Coin Change (min coins)
dp-05: Partition Equal Subset Sum
dp-06: Unique Paths
dp-07: Unique Paths with Obstacles
dp-08: Minimum Path Sum
dp-09: Longest Increasing Subsequence
dp-10: Longest Common Subsequence
dp-11: Edit Distance
dp-12: 0/1 Knapsack
dp-13: Target Sum
dp-14: Decode Ways
dp-15: Word Break

The implementer must write full problem text, constraints, and examples for each. The implementer may use known canonical statements but must rewrite them to be self-contained.

Q00. Per-lesson visualization subspecifications

Each lesson must define visualizationSpec with these fields: tableType (1D or 2D), tableSizeResolver(input) -> dimensions, iterationOrder, dependencyOffsets, baseCaseInitializer, and outputExtractor.

Q00.1 dp-01 Climbing Stairs visualizationSpec

tableType is 1D. dp index is 0..n inclusive. dp[0] and dp[1] are Base. dependencyOffsets for dp[i] are [-1, -2]. iterationOrder is increasing i from 2 to n. outputExtractor returns dp[n].

Illustration theme: staircase graph. The DP array is primary; the staircase is a secondary view that highlights the same index i as a node. The user can drag n within bounds 1..30.

Q00.2 dp-06 Unique Paths visualizationSpec

tableType is 2D. dp[r][c] for 0<=r<m, 0<=c<n. base cases set dp[0][c]=1 and dp[r][0]=1. dependencyOffsets are [(-1,0),(0,-1)]. iterationOrder is row-major. outputExtractor returns dp[m-1][n-1].

Illustration theme: grid with start and end fixed. The dependency overlay shows arrows from top and left.

Q00.3 dp-12 0/1 Knapsack visualizationSpec

tableType is 2D by default, with optional 1D optimized view toggle.

2D view: dp[i][w] where i is items processed, w is capacity 0..W. dependencyOffsets are previous row (skip) and previous row shifted by weight (take). iterationOrder is i increasing, w increasing. outputExtractor returns dp[n][W].

1D view: dp[w] with iteration direction control that defaults to descending w. The app must include a built-in demonstration example that fails if ascending is chosen, and must label this as a pitfall.

Q00.4 Requirement for remaining lessons

The implementer must define visualizationSpec for all remaining lessons using the same schema. dependencyOffsets must be limited to local neighborhoods when possible. For LIS, dependencyOffsets is a fan-in to all j<i; this must be rendered as highlighted eligible predecessors rather than arrows to all.

R00. Accessibility and keyboard interaction

All interactive controls must be keyboard reachable with visible focus.

Buttons must have aria-labels when their visible text is not descriptive.

Visualization cells must have accessible text describing: coordinates, value, and status.

The app must support reduced motion. If the user prefers reduced motion, Play must step without animations and only update highlights.

S00. Performance constraints

Visualization must remain smooth for default constraints.

Step generation must be synchronous for small inputs. For larger compute-only inputs, the app may use a Web Worker, but must not require it. If a worker is implemented, it must be local and bundled as a separate file worker.js without external dependencies.

T00. Storage and persistence rules

Persist per-lesson: revealed hints, last used inputs, last selected mode, and completion status.

Completion status becomes Completed when the user successfully runs at least one example and passes it.

A per-lesson Reset clears only that lesson’s persisted state.

Reset All clears all persisted state.

U00. Starter-code and test suite specification (added requirement)

The implementer must generate per-problem starter-code files and an ad hoc unit test suite in JavaScript and C99, as defined in C00.2. These files are required deliverables, not optional.

U00.1 Template file goals

Each file must be suitable as a starting point for practicing that DP problem outside the web app. The user must be able to implement the function and run tests locally with a single command.

Each file must be self-contained and must not require any third-party libraries.

Each file must include clear header comments describing: the problem, constraints, input and output, and at least three worked examples (example input and expected output). These examples are explanatory only; they are also duplicated as runnable tests.

U00.2 Required content and structure for JavaScript template files

Each JavaScript file must be executable in Node.js without flags.

The top of the file contains a header comment block with: title, problem statement, constraints, examples, and notes on edge cases.

The file defines a single exported function solve(...) that matches the problem’s input shape.

The file includes a minimal test runner implemented in the same file. The runner must support: assertEqual, assertDeepEqual (for arrays), and a summary of pass/fail counts. The runner must exit with non-zero code if any test fails.

The file must include deterministic pseudo-random test generation for selected problems, using a small linear congruential generator with a fixed seed. Random tests are used only where a reference implementation can be embedded safely.

For random tests, the file must include a slower but obviously-correct reference implementation where feasible (for example brute force for small n). The random generator must use strict bounds to avoid large runtime.

U00.3 Required content and structure for C99 template files

Each C file must compile under C99 with a single compile command and no external libraries.

The top of the file contains a header comment block with: title, problem statement, constraints, examples, and notes on edge cases.

The file defines a function solve(...) that matches the problem’s input shape. If the input is an array, the function takes pointer and length. If the input is a grid, the function takes a pointer to a flat buffer and dimensions. If the input is strings or dictionaries, the function takes const char pointers and lengths. Dictionary inputs must be represented in a simple way, for example array of const char pointers and count.

The file includes a minimal test runner in the same file. The runner must support: ASSERT_INT_EQ, ASSERT_BOOL_EQ, and ASSERT_STR_EQ where applicable. It must print a concise summary and return non-zero from main on failure.

The file must include careful memory handling. Any heap allocations must be freed. The tests must not leak memory in typical runs.

U00.4 Test design technique requirements

The implementer must design tests using explicit test design techniques rather than ad hoc examples. Each problem’s test suite must include, at minimum, these categories.

Boundary tests: smallest valid inputs, largest inputs within safe limits, and off-by-one edges (for example n=0, n=1, n=2 where applicable; empty string; 1x1 grid).

Equivalence class tests: representative cases for each meaningful behavior category (for example reachable vs unreachable for Coin Change; contains zeros vs no zeros for Decode Ways).

Negative or invalid behavior tests: only where the problem definition allows invalid inputs. If invalid inputs are out of scope for the problem, the test suite must not include them.

Regression tests for known pitfalls: at least one test that fails a common wrong approach (for example forward-iteration reuse bug for 0/1 Knapsack and subset sum).

Randomized small tests with oracle: for problems where a brute-force oracle is feasible at small size, generate multiple random test cases within a strict small bound and compare solve against the oracle.

U00.5 Test generation limits and safety

Randomized tests must be bounded to avoid freezing or excessive memory usage on a typical Windows machine.

Default limits for randomized tests are fixed unless overridden per problem.

Maximum random iterations per file: 200.

Maximum n for brute-force oracle: 20 for subset enumeration style problems, 12 for grid path brute force, 18 for string segmentation brute force, unless a tighter bound is necessary.

Maximum string length for random generation: 60.

Maximum grid size for random generation: 12x12.

Maximum capacity or amount for random generation: 200.

U00.6 Per-problem test coverage requirements

Each per-problem file must include at least 12 tests total. At least 6 are deterministic hand-picked tests and at least 6 are randomized-oracle tests when feasible. If randomized-oracle tests are not feasible, replace them with additional deterministic tests covering more equivalence classes.

Each file must include an explicit section in comments describing what equivalence classes and boundaries are covered and which are intentionally not covered.

U00.7 templates README requirements

templates/README.md must include exact commands to run tests.

For JavaScript, it must specify node dp-01-climbing-stairs.js and similar.

For C99, it must specify a gcc or clang command line, for example gcc -std=c99 -O2 -Wall -Wextra -pedantic dp-01-climbing-stairs.c -o dp01 && ./dp01.

The README must clarify that no external dependencies are required and list the tested compiler assumptions.

V00. Acceptance criteria checklist

The deliverable opens index.html locally with no errors and no network calls.

All 15 lessons are present and navigable.

Each lesson has: full problem text, input editor, at least five examples, hint drawer with at least four hint levels, state builder, transition builder, visualization, and code view.

Template Engine runs all lessons and produces correct outputs for all built-in examples.

Visualization highlights current write cell and read dependency cells for each step.

Run controls behave exactly as specified, including disabled states and error messages.

Theme toggle works and persists.

All inputs validate and block run when invalid with specific messages.

Hints are hidden by default and reveal progressively.

No external dependencies are present in the delivered files.

templates folder exists and contains 30 files: 15 JavaScript and 15 C99.

Each template file contains: problem header comment, function stub, ad hoc test runner, and a test suite satisfying U00 requirements.

All JavaScript template files run with Node.js and fail with non-zero exit code on test failures.

All C99 template files compile and run and fail with non-zero exit code on test failures.

W00. Next specification increment

The next revision should fully define lessons.js content for dp-01 through dp-05, including exact problem text, exact default inputs, exact example sets with expected outputs, exact self-check questions, and the initial set of template test files for dp-01 through dp-03 in both languages.
