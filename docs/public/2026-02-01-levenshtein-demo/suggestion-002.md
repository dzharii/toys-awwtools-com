2026-02-01
A00 v00 Follow-up fixes document scope
This document lists only changes and fixes required to improve the current Levenshtein distance tutorial page and simulator shown in the screenshot. It is a follow-up to the existing implementation and does not restate baseline requirements.

B00 v00 Move full article content into the HTML page
B00 v00.1 Integrate the complete explanatory article directly into index.html as first-class content, not as placeholders or abbreviated sections. The resulting page must read as a full standalone article that teaches Levenshtein distance from start to finish and embeds the simulator in-context.

B00 v00.2 Ensure the article sections are not generated at runtime from JavaScript except for strictly interactive widgets. The narrative text should exist as semantic HTML (headings, paragraphs, figures) so it is readable, searchable, and printable.

B00 v00.3 Ensure anchor links and a compact table-of-contents work across the full article. The simulator should be linked from relevant sections (initialization, recurrence, examples) without forcing the reader to scroll excessively.

C00 v00 Use C99 reference code in the demo (preferred) with a safe fallback
C00 v00.1 Prefer showing C99 reference code in the read-only code panel. The code panel must remain non-editable and line-highlightable.

C00 v00.2 The simulator execution may remain JavaScript internally, but the displayed code should match the algorithm structure and line mapping used by the simulator trace. If C99 code is displayed while JavaScript executes, the trace line mapping must correspond to the C99 listing, not the JS listing.

C00 v00.3 If maintaining exact line-level mapping between C99 display and JS execution becomes too error-prone, keep JavaScript as both display and execution for correctness. In that case, still provide a secondary, static C99 listing below the simulator as "C99 reference implementation" (read-only, copyable, not highlighted), so students can learn C syntax without breaking the debugger illusion.

C00 v00.4 If C99 is used as the primary displayed code, ensure the code uses C99 style (for example, declarations close to use, size_t for lengths, explicit allocation/free). The UI must clarify that the simulator is a visualization of the algorithm rather than an actual compiled C runtime.

D00 v00 Layout rework for wide monitors and reduce cramped density
D00 v00.1 Add a true wide-screen layout. On wide viewports, the simulator must expand and use available horizontal space so code and matrix are legible without constant scrolling.

D00 v00.2 Add resizable panes. The code panel, matrix panel, and watch/explanation panel should support drag-to-resize (CSS resize handles or a custom splitter). Resizing must persist during the session.

D00 v00.3 Avoid nested scroll traps. The current experience shows a scrollbar in the table and insufficient code visibility. Reduce or eliminate internal scrollbars when space is available by allowing the overall simulator container to grow. If internal scroll is unavoidable, only one primary scroll area should exist per panel, and it must be visually obvious.

D00 v00.4 Improve minimum sizes. The code panel must show enough lines and width by default to avoid horizontal scrolling for common examples. The matrix must show at least the full header labels and current cell region without clipping.

D00 v00.5 Add a "Focus mode" toggle that temporarily enlarges one panel at a time (Code focus, Matrix focus, Explanation focus). This is a quick fix for attention and readability even when resizing is not used.

D00 v00.6 Rebalance typography. Increase base font size slightly for simulator labels and matrix values, and increase line height in the code panel. Keep headings readable but reduce excessive vertical spacing so the simulator remains connected to the section that introduces it.

E00 v00 Simplify controls and reduce visual distraction
E00 v00.1 Reduce the number of always-visible controls. Move advanced options (granularity, stop points, max length, developer checks) into a collapsible "Advanced" area so the default view is calmer.

E00 v00.2 Make the primary learning path obvious. The default controls visible should be: String A, String B, Examples dropdown, Start/Reset, Step, Play/Pause, Speed.

E00 v00.3 Improve control grouping and alignment. Inputs and stepping controls should not compete for attention. Place inputs on a single row on wide screens, and stack them cleanly on narrow screens.

E00 v00.4 Ensure the student sees the code and matrix first, not a dense control block. The controls should be compact, the visualization should dominate.

E00 v00.5 Improve visual hierarchy inside the simulator. The currently executing line highlight, current dp cell highlight, and explanation text should be the strongest cues. Secondary UI chrome (borders, pills, small labels) should be toned down.

F00 v00 Improve matrix readability and interaction
F00 v00.1 Increase matrix cell size slightly on desktop, with an optional compact toggle for smaller screens.

F00 v00.2 Make headers and current row/column sticky within the matrix viewport so students do not lose context when scrolling larger examples.

F00 v00.3 Add clear dependency highlighting for (i-1,j), (i,j-1), (i-1,j-1) during computation, and show the three candidate costs near the matrix (not only in a side panel) to connect formula to grid.

F00 v00.4 Add a small inline legend for colors/markers used in the matrix (current cell, dependencies, final path). Keep it minimal and consistent.

G00 v00 Add an educational SVG animation block
G00 v00.1 Add at least one SVG-based explainer figure embedded in the article, not inside the debugger panel. The SVG should visualize the idea of edits transforming one string to another and how the DP grid accumulates costs.

G00 v00.2 Keep SVG animation simple and instructive. For example, animate a pointer moving across the grid and highlight the three neighbor cells feeding the min calculation, synchronized with a short caption.

G00 v00.3 The SVG must be purely supplemental and must not replace the interactive debugger. It should load instantly and should not rely on external libraries.

H00 v00 Content presentation fixes for the article
H00 v00.1 Ensure the article text is complete and consistent in terminology. Use "Levenshtein" spelling consistently across headings, text, and UI labels.

H00 v00.2 Add clearer bridges between sections and the simulator. After the recurrence explanation, add a short prompt like "Run the simulator to see dp[i][j] computed" followed by the embedded simulator.

H00 v00.3 Add a short note about indexing and prefixes near the simulator, because this is a common confusion point. The hint should be visible but unobtrusive.

I00 v00 Optional: reconcile mobile and desktop goals without sacrificing either
I00 v00.1 Keep the current compact layout behavior for narrow screens, but add explicit desktop enhancements rather than using the same cramped layout everywhere.

I00 v00.2 Add a responsive breakpoint strategy: stacked panes on small screens, two columns on medium screens, three resizable panes on large screens.

J00 v00 Acceptance checklist for this follow-up
J00 v00.1 The full explanatory article content exists in index.html as semantic HTML and reads as a complete standalone tutorial.

J00 v00.2 On a wide monitor, the simulator uses horizontal space effectively and the code panel shows substantially more code without forcing constant scrolling.

J00 v00.3 The matrix is legible on desktop, and when the matrix scrolls, its labels remain visible (sticky headers).

J00 v00.4 The simulator UI feels less dense: default view shows only essential controls, with advanced options tucked away.

J00 v00.5 The code display is read-only, copyable, and line highlighting remains accurate to the execution trace.

J00 v00.6 The demo uses C99 code as the primary displayed listing or provides a clearly labeled C99 reference listing with a justified fallback to JavaScript for the highlighted execution.

J00 v00.7 At least one SVG explainer animation exists in the article and reinforces understanding of dependencies and the min recurrence.

K00 v00 To-do list for implementation
K00 v00.1 Embed the complete article narrative into index.html and wire table-of-contents anchors.

K00 v00.2 Implement desktop-first layout improvements: wide breakpoint, resizable panes, focus mode.

K00 v00.3 Refactor simulator controls into essential vs advanced, and update styling to reduce chrome.

K00 v00.4 Improve matrix rendering: sticky headers, clearer highlights, better default sizing.

K00 v00.5 Add C99 code listing support with stable line IDs. Decide: C99 primary with mapped trace, or JS primary with C99 reference fallback.

K00 v00.6 Add one SVG animation block tied to the recurrence explanation section.

K00 v00.7 Run a usability pass on wide monitors to confirm no critical information is hidden behind small scroll areas by default.
