2026-04-10

AI00

## Appendix: execution standard, acceptance bar, and working method for Codex

Codex must treat this project as a multi-iteration curation and product-design task, not as a one-pass generation task. Codex must spend between 6 and 10 deliberate iterations on the project. An iteration here means a real review-and-improve cycle with changes to content, structure, prioritization, taxonomy, UX, or presentation. Codex must not stop after assembling a first working version. It must repeatedly inspect the result and ask what is still weak, what is missing, what is noisy, what is incoherent, and what should be refined.

The highest quality bar for this project is coherence. The final result must feel like one intentional system. The problem set, the classifications, the progression logic, the wording, the filters, the repository coverage, the SVG path, and the overall UI must all reinforce the same goal: helping the user choose the right Medium problem next without spoiling the problem and without wasting time.

AJ00

## Required iteration count and review rhythm

Codex must complete at least 6 iterations and should aim for up to 10 if meaningful improvements continue to appear. These iterations should not be fake restatements. Each iteration must include actual inspection and real improvement.

A strong iteration rhythm would look like this. The early iterations focus on source gathering, repository inspection, problem normalization, and candidate expansion. The middle iterations focus on content quality, taxonomy, progression logic, and site structure. The later iterations focus on detail quality, coherence, visual polish, and user decision-support value. The final iteration must be a product-level review where Codex checks whether the site genuinely helps the user decide what to solve next faster and better than a raw list.

Codex should record, at least implicitly in its workflow, what improved in each iteration. If an iteration produces no meaningful change, Codex should identify a more useful review axis and continue.

AK00

## Problem-by-problem analysis requirement

Codex must spend real time analyzing each included problem individually. It must not assign labels mechanically from topic lists alone. For each problem, Codex must think about how that specific problem fits into the full picture of the collection.

For every included problem, Codex must evaluate at least these questions. What makes this problem worth including for an Easy-to-Medium transition. What kind of mental work the problem asks for, at a high level. Whether the statement is likely to be clear or annoying. Whether the problem teaches a reusable pattern. Whether the problem belongs earlier or later in the progression. Whether it is more foundational, more exploratory, or more optional. Whether it overlaps too heavily with a stronger problem already present. Whether repository support strengthens its usefulness.

Codex must also analyze how each problem blends into the collection. A problem is not good enough just because it is a well-known Medium. It must earn its place relative to the rest of the set.

AL00

## Content richness standard

This project should bias toward richness of useful content, not minimalism. The more strong problems Codex can uncover and curate well, the better. The limiting factor is not count by itself. The limiting factor is coherence and quality. If more problems can be added without weakening the structure, clarity, and usability of the site, Codex should add them.

Richness here means that the user should have enough breadth to make real choices across patterns, clarity levels, effort levels, and progression phases. The site should not feel sparse. It should feel like a well-stocked but carefully curated library. At the same time, Codex must actively resist filler. A problem that adds noise, duplication, or low-value complexity should be excluded even if it is famous or easy to source.

AM00

## Anti-spoiler content rule

The site must not teach the exact solution. This is a hard rule.

For each problem, the content must explain what the problem is about, what kind of thinking it invites, why it is worth solving, what it practices, and how it fits into the overall journey. The content must not explain exactly how to solve it. It must not provide the algorithm recipe in direct form. It must not reveal the key trick in a way that spoils the solving experience. It must not collapse into editorial guidance.

The correct standard is "what, not how". The user should come away understanding what the task generally asks them to do, what makes it valuable, and whether it is a good next problem, without being told the precise solving method. High-level orientation is required. Solution spoilage is forbidden.

AN00

## Safe level of specificity for problem descriptions

Codex should write problem overviews at a level that is informative but non-spoiling. A good overview says what the problem is asking in general terms, what type of structure or situation it involves, why it is interesting, and what broad family of reasoning it tends to exercise. A bad overview reveals the exact solution pattern in operational form or tells the user the decisive algorithm to apply.

For example, Codex may say that a problem involves navigating a grid under distance-like constraints, reasoning about ordering in a graph-like dependency setting, rearranging pointers in a linked structure, or exploring combinations under constraints. Codex should not say, in the problem description itself, "solve this by doing X algorithm with Y state and Z rule". That would be a failure.

If Codex wants to expose more detail, it should do so through optional references, external URLs, or topic tags, not through direct spoiler prose in the primary description.

AO00

## Suggested content fields for each problem entry

Each problem entry should include enough information for the user to decide whether to solve it now, while remaining safely high level.

A strong content record should include a concise overview of what the problem is asking in general. It should include why the problem matters in the transition from Easy to Medium. It should include what kinds of concepts or patterns the problem tends to exercise, expressed at a broad level. It should include a clarity assessment, an effort assessment, and a transition-friendliness assessment. It should include a note on why the problem is interesting, useful, or respected. It should include repository coverage and supporting URLs.

If Codex includes a caution or caveat field, that field should also remain high level. It may say that a problem has more bookkeeping than it first appears, that edge cases matter, or that the problem is conceptually clean but implementation-sensitive. It must not reveal the solution path.

AP00

## To-do list for Codex thought process and analysis flow

Codex should follow a disciplined working process. First, it should build a broad candidate pool from the earlier research and the local repositories. Second, it should normalize titles, numbers, URLs, and repository matches into a clean canonical dataset. Third, it should evaluate each candidate problem individually for user fit, clarity, richness, and role in the progression. Fourth, it should search the web again to validate and enrich the candidates and to discover additional strong problems, including newer or less-discussed ones. Fifth, it should prune weak or redundant entries and strengthen missing areas of coverage.

After the content core is stable, Codex should organize the problems into a coherent progression model and concept taxonomy. It should then design the UI and SVG presentation around that structure, not the other way around. After implementation, Codex should run multiple review passes focused on coherence, usability, clarity of wording, anti-spoiler compliance, and decision-support quality.

This process should be treated as a live curation loop. Codex should keep asking whether the current result feels coherent, whether the content helps the user decide quickly, and whether the site is genuinely more useful than a static list.

AQ00

## To-do list for content creation quality

When writing the content for each problem, Codex should first determine the role of the problem in the study journey. It should then write a compact non-spoiling overview. It should then write a practical note on why it is worth solving. It should then assign the clarity, effort, and transition labels. It should then check that these labels are defensible relative to neighboring problems. It should then verify that the wording does not leak the solution.

Once a cluster of problems is written, Codex should compare entries side by side and remove repetitive phrasing. The notes should feel authored, not templated. Different problems should sound different because they contribute different value. Codex should also review whether the collection overuses vague praise such as "great practice" without actually saying why.

AR00

## To-do list for coherence review

Codex should perform at least one dedicated coherence pass where it ignores implementation details and reviews the project purely as a system.

In that pass, Codex should ask whether the progression feels believable. Whether the problem set has obvious gaps. Whether some included problems are too punishing for the intended stage. Whether classic and newer problems are balanced well. Whether the filters map cleanly to how a user would think. Whether the tags are consistent. Whether the SVG tells the same story as the list view. Whether repository coverage is surfaced meaningfully. Whether the overall result feels curated rather than accumulated.

If the answer is weak on any of those, Codex should revise before considering the project complete.

AS00

## Reachable acceptance criteria

The task should be considered complete only if the result reaches a realistic but high standard.

At minimum, Codex must have performed at least 6 real iterations. It must have inspected all listed local repositories. It must have validated and enriched the earlier research rather than merely copying it. It must have assembled a broad but curated set of Medium problems that fit the user's actual transition goals. It must have written non-spoiling, high-level, decision-support content for the problems. It must have provided full URLs. It must have surfaced repository coverage clearly. It must have implemented a usable static single-page site with persistent solved state. It must have built a meaningful SVG-based view of the problem landscape or progression. It must have reviewed the result for coherence and improved it accordingly.

The acceptance criteria are not satisfied if the site is merely functional. The site must also feel coherent, relevant, and trustworthy.

AT00

## Higher-quality acceptance criteria

A stronger version of success is that the final site lets the user answer practical questions quickly. The user should be able to find a BFS problem that is approachable. The user should be able to find linked list Mediums that are clean and worth doing first. The user should be able to compare classic foundational problems against newer gems. The user should be able to tell whether a problem has local solution coverage. The user should be able to understand what a problem is broadly about without getting spoiled on how to solve it.

If the site does those things well, then it is achieving the real goal of the project. If it fails there, then even a technically correct implementation is not good enough.

AU00

## Best-judgment clause for Codex

Codex should use its best judgment at every stage to improve coherence, relevance, and usefulness. If Codex notices that a category is too broad, it should refine it. If it notices that content is too repetitive, it should rewrite it. If it notices that the site needs another helpful dimension such as recommended order, readiness level, or overlap warnings, it should consider adding it. If it notices that a problem is technically valid but weak for this user, it should exclude it.

The model should not behave narrowly. It should behave like a careful curator and product builder with a strong understanding of the user's request.

AV00

## Final quality expectation

The final result should feel like a rich, coherent, carefully shaped tool for choosing Medium LeetCode problems. It should contain many strong options when possible, but every included option should feel justified. The descriptions should be rich enough for the user to understand what the problem is about and why it is relevant, but never so specific that they spoil the solution. The full collection should present a clear picture of progression, variety, and value.

That is the quality bar Codex should aim for.
