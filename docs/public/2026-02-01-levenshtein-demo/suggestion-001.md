2026-02-01

I will write a structured, student-focused specification for an LLM coding agent to build a single-page Levenshtein distance tutorial with a fixed-code "debugger-style" simulator, including architecture, UI/UX, data model, animation rules, constraints, testing, and an acceptance checklist plus a prioritized to-do list.


A00 v00 Purpose and scope
This specification defines the requirements for a large language model coding agent to produce a single, self-contained, student-friendly interactive tutorial that explains Levenshtein distance (edit distance) and visualizes a dynamic programming (DP) implementation with a debugger-like simulation. The deliverable is a small static web app consisting of HTML, CSS, and JavaScript files (no build step required) that renders a single article and multiple interactive demonstrations within it.

The app must present a stable, read-only code listing and animate its execution line-by-line while simultaneously updating visible state (inputs, indices, current cell, DP matrix) so the student can observe how Levenshtein distance is computed. Students must not be able to modify the source code, but they must be able to change input strings and simulation parameters, then re-run the simulation and observe how those values flow through the same fixed code.

B00 v00 Key constraints
The code shown to the student is not editable. The UI must not expose any textarea or editor that allows arbitrary code changes. Copy-to-clipboard is allowed.

The simulator must look and behave like a simplified debugger: line highlighting, step controls, visible variable values, and a clear notion of current execution point.

The app must remain a single page containing an article, with embedded interactive elements after each explained concept. The interactive elements must not feel detached from the narrative.

The agent should assume existing files will exist (for example a preexisting Levenshtein implementation and basic page scaffold). If those files are absent at generation time, the agent must still produce working replacements that satisfy this spec without requiring external assets.

C00 v00 Deliverables
C01 v00 Files
index.html
styles.css
app.js

Optional but recommended:
assets/ (only if truly necessary; avoid external downloads)
README.md (short usage notes, but not required if instructions are embedded in the page)

C02 v00 Runtime
Runs by opening index.html directly in a browser (file://) without a server. Use only browser APIs.

C03 v00 Accessibility
Keyboard operable controls (tab focus, enter/space activation).
Visible focus indicators.
High contrast mode support via CSS variables.
ARIA labels for interactive controls and the matrix.

D00 v00 Student experience goals
The page should teach the concept first, then immediately let the student see it. Each interactive block should correspond to a specific concept:
Initialization of DP matrix.
Recurrence relation (min of delete, insert, substitute).
Walking through a full example.
Optional: backtrace to produce an edit script.

The student should be able to:
Enter two strings.
Choose step mode (manual stepping) or autoplay (with adjustable speed).
Observe which line is executing and why.
See which DP cell is being computed, and which neighbors are referenced.
See intermediate costs (delete, insert, substitute) for the current cell.
Reset, replay, and jump to key milestones (init row, init col, main loops, final answer).

E00 v00 Article content requirements
E01 v00 Narrative sections
The article must include these sections, written clearly and with minimal jargon:
What Levenshtein distance measures.
Allowed operations and costs (insert, delete, substitute; substitution cost is 0 if same char else 1).
Why dynamic programming is used.
DP matrix definition and meaning of dp[i][j].
Initialization rules for first row and column.
Recurrence formula and intuition.
Time and space complexity.
Common pitfalls (off-by-one, indices vs characters, initialization).
Optional: reconstructing operations (edit script).

E02 v00 Visual explanations
Include at least one static diagram-like rendering: for example a small matrix with labeled axes, shown as a table styled to look like a DP grid. This can be a non-interactive figure in HTML.

E03 v00 Examples
Provide at least two canonical examples. One should be short (cat vs cut). Another can be a classic longer example (kitten vs sitting) if performance is acceptable.

F00 v00 Simulator functional requirements
F01 v00 Fixed-code model
The simulator must be driven by a fixed reference implementation of Levenshtein distance. The code displayed and the code executed must correspond exactly in structure and line mapping. The user can change only inputs and simulation settings.

F02 v00 Execution trace generation
The simulator must precompute or stream an execution trace that represents the algorithm stepping through:
Initialization loops (or explicit initialization).
Outer loop over i.
Inner loop over j.
Computation of costs and assignment to dp[i][j].
Final return value.

Each trace step must include:
stepId (monotonic integer).
phase (initRow, initCol, mainLoop, done).
lineId (maps to a displayed line in the code listing).
i, j (current indices; null when not applicable).
chars (a[i-1], b[j-1] when applicable).
dpSnapshotDelta (what changed since previous step; at minimum, the updated cell coordinates and new value).
computedValues (deleteCost, insertCost, substCost, chosenMin) for steps where dp[i][j] is computed.
explanation (short human-readable string describing the step, suitable for a small panel).

F03 v00 Stepping modes
Manual stepping:
Step forward.
Step backward.
Jump to start.
Jump to end.

Autoplay:
Play/pause.
Speed slider (for example 0.25x to 4x).
Option to stop at breakpoints (init done, each new row, final answer).

F04 v00 Breakpoints and milestones
Breakpoints are conceptual and predefined (not user-defined). Provide toggles:
Stop after finishing initialization.
Stop at start of each i iteration.
Stop at each dp cell assignment (this is the default for detailed view).

F05 v00 Matrix visualization
Render dp as a grid with:
Row labels including an empty prefix and characters of string A.
Column labels including an empty prefix and characters of string B.
Highlighted current cell (i, j).
Highlighted dependency cells (i-1, j), (i, j-1), (i-1, j-1) during computation.
Optional: animate the write (fade-in or brief flash) when a cell is set.

For large strings, provide a compact mode:
Either limit max length (recommended default max 20 each) with an inline warning, or provide scrolling within the matrix container.
If a limit is enforced, clearly explain it and allow increasing it with a performance warning.

F06 v00 Variable watch panel
Show current values:
i, j
aChar, bChar
deleteCost, insertCost, substCost
dp[i][j] after assignment
current phase

F07 v00 Code view
Display the code with:
Line numbers.
A highlighted current line corresponding to trace.lineId.
Optional: highlight tokens for variables currently active (purely visual, no editing).

Allow copy-to-clipboard of the code.

F08 v00 Explanation panel
For each step, show a compact explanation:
What the algorithm is doing now.
Why these cells are referenced.
How the chosen min was determined.

Keep this explanation bounded (2-3 sentences). Longer explanation belongs in the article, not the step panel.

G00 v00 UI layout and interaction design
G01 v00 Page structure
Single article page with headings and embedded interactive blocks.

Recommended layout within an interactive block:
Top: input controls (strings, mode, speed).
Middle: three-pane area:
Left: code listing.
Center: DP matrix.
Right: variable watch + step explanation.
Bottom: transport controls (step, play, reset) and a progress indicator.

On narrow screens, panes stack vertically with matrix first or code first (choose one and keep consistent).

G02 v00 Controls
String inputs:
Two text inputs with placeholder examples.
Optional dropdown to load example pairs.

Simulation controls:
Reset.
Step back.
Step.
Play/pause.
Speed.
Granularity (cell-level or row-level stepping).

Progress:
Step counter (current / total).
Phase label.

G03 v00 Styling
Use CSS variables for theme:
--bg, --fg, --muted, --accent, --danger, --border

Use monospace for code and matrix values.
Use subtle animations (200-400ms) for highlighting and cell updates.

H00 v00 Data model and internal architecture
H01 v00 Core modules in app.js
levenshtein(a, b) that returns distance and dp matrix (or at least distance).
traceLevenshtein(a, b) that returns dp matrix plus a trace array as defined above.
renderCode(container, codeLines).
renderMatrix(container, dp, labels, highlightState).
renderWatch(container, state).
renderExplanation(container, step).
controller that binds UI controls and manages current step index.

H02 v00 Line mapping
Define codeLines as an array of objects:
{ lineId, text }

The trace must refer to lineId values. Do not compute mapping by parsing text. Use explicit IDs.

H03 v00 Backward stepping
To support step backward, either:
Store a full dp snapshot per step (heavy but simple for small sizes), or
Store deltas and apply reverse deltas.

Recommended approach:
Store dp as a 2D array and store per step:
{ write: { i, j, prev, next } } when a write occurs.
Backward step sets dp[i][j] = prev.

Also track highlight state (i, j, deps) per step. Backward stepping should restore that state.

H04 v00 Performance guidelines
Default max lengths should keep total steps manageable. For lengths m and n:
init steps: O(m + n)
main steps: O(m*n) with multiple sub-steps if you trace each cost separately.

Recommended: one trace step per dp cell assignment, plus a small number of steps for init and loop headers. Do not create 5-10 steps per cell unless lengths are very small or granularity is optional.

I00 v00 Enhancements to improve polish and learning value
I01 v00 Improve explanation of indices
Students often confuse dp indices with character positions. Add a persistent hint in the simulator: dp[i][j] compares prefixes a[0..i) and b[0..j).

I02 v00 Show operation costs explicitly
During each dp cell compute, show:
delete = dp[i-1][j] + 1
insert = dp[i][j-1] + 1
substitute = dp[i-1][j-1] + (aChar==bChar ? 0 : 1)
Then highlight which one was chosen.

I03 v00 Add an "Edit path" optional view
After computing dp, optionally show a backtrace to list operations. This can be a separate button "Show edits" that displays a small list of steps (substitute, insert, delete, match) and highlights the path in the matrix. This is optional but strongly recommended.

I04 v00 Provide micro-experiments
Within the article, add small interactive toggles:
Toggle substitution cost scheme (0/1 vs custom cost) but keep code fixed by selecting among predefined cost functions. The displayed code can show a placeholder function cost(aChar, bChar) with fixed behavior chosen by UI, but the user cannot type arbitrary code. If included, the code listing should reflect the selected mode by swapping between predefined code snippets, not by allowing edits.

I05 v00 Better error handling and guardrails
Handle empty strings.
Trim overly long strings with warning.
Disallow multi-line input.
Handle non-ASCII input safely (JS strings are unicode; indexing is by UTF-16 code units, so note limitation or use Array.from to handle grapheme clusters). At minimum, state the limitation in the article.

J00 v00 Acceptance criteria checklist
J01 v00 Build and run
Opening index.html renders a readable article and at least one interactive simulator block.
No external network requests are required.

J02 v00 Code immutability
The displayed algorithm code cannot be edited in the UI.
User interactions never modify the code text; only highlighting changes.

J03 v00 Trace correctness
For multiple test pairs (including empty vs non-empty), the final distance matches known correct Levenshtein values.
The dp matrix displayed at end matches the computed distance in dp[m][n].

J04 v00 Debugger-like behavior
Stepping highlights a single code line per step (or clearly defined multi-line highlight for a known step, but keep consistent).
The matrix highlights current cell and dependencies appropriately.
Variable watch updates reflect the current step.

J05 v00 Controls
Reset returns to step 0, clears highlights, and restores initial dp state.
Step backward restores previous dp values and highlights.
Play/pause works and respects speed settings.
Progress indicator updates accurately.

J06 v00 Responsiveness and accessibility
On narrow screens, the simulator remains usable without horizontal scrolling for controls.
Keyboard can operate the simulator without a mouse.
Focus indicators are visible.

J07 v00 Content quality
The article includes definitions, recurrence, initialization, complexity, and at least two examples.
The simulator is embedded near the relevant explanatory section and labeled clearly.

K00 v00 Testing requirements
K01 v00 Unit-like tests (in browser)
Include a small hidden or developer-only test runner in app.js that can be triggered from console or a button in a "Developer" collapsible section. It should validate:
distance("", "") == 0
distance("a", "") == 1
distance("", "abc") == 3
distance("kitten", "sitting") == 3
distance("flaw", "lawn") == 2

K02 v00 Trace invariants
Assert that every step with a dp write has valid indices.
Assert that dp dimensions are (m+1) x (n+1).
Assert that end step returns dp[m][n] equal to distance.

L00 v00 To-do list for the coding agent
L01 v00 Create or normalize the fixed Levenshtein implementation so it is clear, line-addressable, and suitable for tracing.
L02 v00 Implement traceLevenshtein that outputs a compact step trace with explicit lineId mapping and dp write deltas.
L03 v00 Build the code viewer with line numbers, stable text, and highlight capability.
L04 v00 Build the DP matrix renderer with axis labels, current cell highlight, and dependency highlights.
L05 v00 Build the watch panel and step explanation panel, wired to the current step state.
L06 v00 Implement simulator controller: step forward/back, reset, jump, play/pause, speed control, milestone stopping.
L07 v00 Write the article content and insert interactive blocks after the relevant sections.
L08 v00 Add example loader controls and sensible defaults (for example "kitten" vs "sitting").
L09 v00 Add input validation, length limits, and clear warnings.
L10 v00 Add accessibility polish (ARIA labels for controls, keyboard shortcuts optional).
L11 v00 Add optional backtrace visualization (edit script) as an enhancement if time allows.
L12 v00 Add test harness and verify against known examples in multiple browsers.
