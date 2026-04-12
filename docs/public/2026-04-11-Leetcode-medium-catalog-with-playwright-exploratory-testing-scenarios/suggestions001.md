Date: 2026-04-10

See deep-research-report (1).md

A00

# Codex specification: build a decision-grade Medium LeetCode explorer for Easy-to-Medium transition

This specification defines the task for Codex as an autonomous agent. The end product is not a generic LeetCode page and not a dump of problem names. It is a static single-page decision tool that helps a user who has largely outgrown Easy problems choose the right Medium problem next.

The website must help answer a very specific practical question: "What Medium problem should I solve now if I want useful practice, low statement friction, and a strong pattern payoff?" The site must optimize for clarity, signal, and reusability of learning. It must bias toward Medium problems that train important interview patterns without wasting time on awkward statements, arbitrary trickery, or implementation-heavy problems whose educational return is poor for this stage.

The implementation must be done in the current folder, using vanilla HTML, CSS, and JavaScript only. No framework, no TypeScript, no React, no backend, no build-heavy stack, no visual gimmickry that hurts usefulness.

B00

## What the user is actually looking for

The user is in the transition zone between Easy and Medium. That means the site must not optimize for "famous Mediums" in the abstract. It must optimize for transition-friendly Mediums.

A transition-friendly Medium, for this project, has most of the following properties. The statement is relatively easy to parse. The core idea is usually one dominant pattern, not three patterns chained together. The problem is interesting enough to feel rewarding. The implementation is non-trivial but does not usually require an hour of flailing. The problem teaches something reusable that shows up again elsewhere.

The target concept families are linked list navigation, tree traversal, BFS, DFS, graph traversal, two pointers, sliding window, backtracking, and easier dynamic programming. The site must especially favor problems that teach reusable templates and mental models. It should help the user build confidence and pattern recognition, not just accumulate solved counts.

The user explicitly does not want the main difficulty to be decoding a weird problem statement. The user also does not want a low-value Medium that looks complicated but ends up being trivial after a confusing description. The site must therefore encode not just "topic" and "difficulty", but also "clarity", "transition friendliness", "expected effort", and "why this is worth doing now".

C00

## Product thesis and the standard Codex must meet

Codex must treat this project as a quality product task, not as a content formatting task. The project should feel like a carefully designed study companion for repeated use over time.

The best mental model is this: the user wants a private, well-designed "problem choosing cockpit" that sits between raw LeetCode and messy public curation lists. It should reduce decision fatigue, reduce time wasted on weak picks, and make progression feel intentional.

That means the site must do more than show cards. It must expose why a problem belongs, where it fits in progression, what it practices, whether local solutions exist, whether the problem is a classic or a newer gem, and whether it is a strong candidate for "solve next". The site should make the user feel that the content was curated, not aggregated.

D00

## Sources Codex must combine

Codex must combine three source classes and reconcile them carefully.

The first source class is the earlier research result, which provides the seed direction and many candidate problems that fit the transition-Medium objective.

The second source class is the local repositories already present in the current folder. These are mandatory first-class inputs. They are not optional references and not an afterthought. Codex must actively scan them and use them to improve both problem selection and the usefulness of the final site.

The third source class is fresh web research. Codex must search the web again, confirm problem relevance and difficulty, confirm canonical URLs, and gather supporting sources with full URLs. Codex must not merely repeat the earlier report. It must validate, refine, and expand it.

E00

## Local repositories that must be inspected

The following repositories are available in the current folder and must be inspected directly:

doocs_leetcode
haoel_leetcode
kamyu104_LeetCode-Solutions
neetcode-gh_leetcode
test-123
wisdompeak_LeetCode

Codex must inspect all of them. It must not assume one naming convention. It must not assume one folder layout. It must not stop after checking a README. It must actually scan the repositories for problem presence, metadata cues, topic grouping clues, and useful explanation coverage.

For every selected problem, Codex must determine which of these repositories contain that problem. If practical, it should also determine whether the repository contains only code, or code plus explanation, or some especially useful structure such as category grouping or indexed navigation.

The repository scan must not be superficial. It should include at least a high-precision pass and a broad pass. The high-precision pass should use known index files, curated tables, numbered lists, or naming conventions. The broad pass should search the tree for problem numbers, slugs, normalized titles, and common naming variants. Codex must reconcile duplicates and normalize them into a single canonical record per problem.

F00

## What the repository layer is supposed to contribute

The repositories are not there just to show "yes/no" coverage. They add major product value.

They tell the user whether a reference solution already exists locally after finishing the problem. They allow the website to say "solve this now, and you already have local material for comparison later". They can strengthen confidence in selecting a problem. They can also surface strong candidates that the external curation sources under-emphasize.

Codex should therefore use repository presence as one of the ranking signals, though not the only one. A problem should not be included only because it exists in many repositories. It should be included when repository presence combines with user-fit, pattern value, clarity, and external support.

If a repository suggests especially useful local value, for example that a certain repository tends to have stronger explanations, cleaner categorization, or better coverage of modern problems, Codex should expose that in the final content where relevant.

G00

## External research requirements

Codex must perform fresh web research before finalizing the dataset and before designing the final presentation. This research has two separate purposes.

The first purpose is content validation. Codex must confirm canonical LeetCode problem URLs, current difficulty, and whether the problem is commonly treated as valuable practice in transition-friendly pattern learning. Codex must preserve full URLs. The dataset and UI must show real full links, not vague source names and not abbreviated references.

The second purpose is design research. Codex must look at strong UI and UX guidance or strong public examples for dense, filterable, content-heavy interfaces. The goal is to avoid the standard low-effort Codex styling and instead produce a deliberate, polished interface appropriate for a frequently revisited study tool.

Codex should favor reputable or primary sources when validating facts and design decisions. For content curation, that includes LeetCode itself, widely used pattern lists, respected interview prep curation, and credible community sources. For design and frontend behavior, that includes primary documentation and recognized design systems or standards-oriented guidance.

H00

## Research iterations Codex must perform

Codex must work in explicit passes. One pass is not enough.

The first pass must build a seed set from the earlier research and convert that into a structured candidate list with tentative tags.

The second pass must inspect all local repositories and enrich the candidate list with repository coverage, explanation signals, and newly discovered candidates.

The third pass must browse the web to validate canonical URLs, confirm Medium difficulty, confirm external relevance, and search for newer or less obvious strong candidates that still fit the user's clarity and usefulness constraints.

The fourth pass must trim weak candidates, add missing strong ones, correct taxonomy, and normalize metadata so the final set is coherent rather than bloated.

The fifth pass must review the site as a product. That means checking not only correctness, but also whether the content and UI actually make choosing the next problem easier.

Codex must treat iteration as mandatory. If an additional refinement pass is obviously needed, Codex should do it.

I00

## Selection philosophy for the final problem set

The final set must be curated, not maximal.

The most important selection criteria are these. The problem is Medium. The statement is reasonably clear. The problem trains a pattern that matters at this stage. The expected effort is appropriate for transition practice. The problem is interesting or respected enough that solving it feels worthwhile. The problem helps build reusable skill. The problem is not mainly valuable because of obscurity or pain.

The site must balance classic foundational problems with newer or less-discussed gems. It should include classics like Number of Islands or Course Schedule if they still satisfy the project goals. It should also search for newer problems, including higher-numbered problems, when they have a clean statement and high training value.

The site should not flood the user with every Medium in a category. It should prefer a broad but defensible set where each problem has a reason to exist.

J00

## Problem attributes the site must capture

Each problem in the final dataset must carry decision-grade metadata. The point is not just to classify the problem, but to help the user decide whether to solve it now.

At minimum, each problem must have a stable id, title, problem number when available, difficulty, canonical LeetCode URL, and a set of concept tags. It must also have a plain-language "why solve this" note, a "what this practices" note, a clarity assessment, a transition-friendliness assessment, and an expected effort note.

It must also carry one or more supporting full research URLs, a list of which local repositories contain it, and one or more curation signals such as whether it appears in a major pattern list or major interview prep list.

The metadata should also support the product experience. That means fields for progression phase, classic versus newer-gem status, recommended order, prerequisite concepts, and optional caveats such as "conceptually simple but implementation detail matters" or "very good BFS practice but slightly more bookkeeping".

K00

## Problem record model Codex should implement

Codex should use a clean canonical data structure for each problem. The structure must be explicit and maintainable. A suitable record includes the following fields:

id as a stable key, ideally derived from verified slug
number as integer when available
title as display string
difficulty as string
leetcodeUrl as full canonical URL
concepts as normalized concept tags
phase as a progression bucket
transitionFriendliness as a small ordered label
clarity as a small ordered label
effort as a small ordered label
whySolve as short authored prose
whatYouPractice as short authored prose
interestNote as short authored prose
caveat as optional short authored prose
classic as boolean
newerGem as boolean
recommendedOrder as numeric or grouped sequence field
sourceUrls as list of full URLs
repoCoverage as list of repository entries
memberships as membership flags or list names
prerequisites as concepts or problem ids
statementStyle as optional note such as short, visual, template-driven, or detail-heavy

Codex may adapt field naming, but it must preserve this information level.

L00

## Seed problem universe from the earlier research

Codex must treat the following as seed candidates rather than a frozen final list. These must be validated, refined, and extended.

Warm-up and core mediums include Longest Substring Without Repeating Characters, Longest Repeating Character Replacement, Product of Array Except Self, Container With Most Water, 3Sum, Group Anagrams, Merge Intervals, and Sort Colors.

Linked list candidates include Add Two Numbers, Remove Nth Node From End of List, Linked List Cycle II, Swap Nodes in Pairs, Odd Even Linked List, and Reorder List.

Tree and traversal candidates include Binary Tree Level Order Traversal, Binary Tree Right Side View, Binary Tree Zigzag Level Order Traversal, Validate Binary Search Tree, Lowest Common Ancestor of a Binary Tree, Kth Smallest Element in a BST, Construct Binary Tree from Preorder and Inorder Traversal, and All Nodes Distance K in Binary Tree.

Graph and BFS or DFS candidates include Number of Islands, Rotting Oranges, 01 Matrix, Shortest Path in Binary Matrix, Nearest Exit from Entrance in Maze, Keys and Rooms, Number of Provinces, Clone Graph, Course Schedule, Course Schedule II, Open the Lock, Minimum Genetic Mutation, Reorder Routes to Make All Paths Lead to the City Zero, All Paths From Source to Target, Number of Operations to Make Network Connected, Snakes and Ladders, Shortest Bridge, As Far from Land as Possible, and Shortest Path with Alternating Colors.

Backtracking candidates include Letter Combinations of a Phone Number, Generate Parentheses, Subsets, Permutations, Combination Sum, and Palindrome Partitioning.

Dynamic programming candidates include House Robber, Coin Change, Unique Paths, Longest Increasing Subsequence, Partition Equal Subset Sum, Word Break, Target Sum, Decode Ways, Edit Distance, and Jump Game II.

Codex must use these as high-confidence starting points, then improve the set based on repository evidence and fresh validation.

M00

## Required outcome of the curation process

The final problem set should feel like a study path, not a pile.

There should be enough breadth to cover the user's target concepts meaningfully. At the same time, the user should be able to understand the shape of the collection. The site should make it obvious which problems are good first Mediums, which are slightly richer follow-ups, which are especially good BFS or DFS drills, which linked list problems are clean and worth doing early, and which DP problems are still manageable at this stage.

If Codex includes many problems, it must preserve strong structure. If Codex includes fewer problems, the quality bar for each included problem becomes even higher.

N00

## The website the user should feel they got

The final site should feel calm, crisp, and dense in a good way. It should reward repeated use. It should not look like a beginner tutorial page and not like an enterprise dashboard. It should feel like a well-made personal tool for someone serious about improving.

The interface should support two dominant modes of use. The first mode is exploratory browsing, where the user wants to scan clusters and discover what is available. The second mode is fast decision-making, where the user already knows they want, for example, a BFS Medium with a clear statement and moderate effort, and they want an answer quickly.

The information architecture must support both.

O00

## UX principles Codex must follow

The user hates wasting time. The UX must reflect that.

The page must be highly scannable. Important metadata should be visible without requiring every card to be opened. At the same time, details must be accessible without navigating away or opening a new page.

The page must support rapid narrowing. Filtering by concept, clarity, effort, progression phase, repository presence, and classic versus newer-gem status should be easy and not feel cluttered.

The page must support confident choice. A selected problem should immediately show why it is a good pick now, what it trains, whether the user already has local solution references, and whether it is likely to be readable and worth the effort.

The page must support progress memory. If the user marks a problem solved, that state must persist and become part of the visual system, not an afterthought.

P00

## Required UI structure

Codex should build the page around a few strong regions instead of many weak ones.

There should be a top region that explains the purpose of the tool very briefly and provides global controls such as search, concept filters, progression filters, clarity filters, effort filters, and reset or saved-state controls.

There should be a visual progression region that contains the SVG roadmap or concept path. This should not be decorative. It should help the user understand how the collection is organized and should connect to filtering or selection.

There should be a main exploration region that displays the curated problems in a highly scannable layout. This could be a dense card list, a split-view arrangement, or a hybrid table-card structure. The layout must favor clarity and quick comparison.

There should be a detail region for the currently selected problem. That region should display the full decision-support information in a clean, calm layout, including URLs and local repository presence.

If a split view is used, the layout should be responsive and still usable on narrower screens.

Q00

## Visual design expectations

Codex must research design before writing the final CSS. The output must not use the default pattern of rounded generic cards, oversized gradients, random shadows, and shallow hierarchy.

The design should be based on deliberate hierarchy, measured spacing, restrained color use, clear typography, and obvious state design. Filters should feel clean and lightweight. The page should support dense information without becoming noisy.

Codex should think in terms of a system, not isolated styles. That means defining design tokens or variables for spacing, typography scale, radii, borders, surfaces, emphasis, muted text, and interaction states. The color system should support solved state, selected state, concept highlighting, and hover or focus feedback without turning the interface into a rainbow.

The visual tone should align with the use case: analytical, polished, serious, and pleasant. It should feel like a tool you would trust.

R00

## Design research requirement

Before implementing the design, Codex must research good-fitting design references from specialized resources or strong public examples for content-dense interfaces. Codex should study patterns for typography hierarchy, lists and tables, split views, dense card layouts, filter chips, focus visibility, spacing systems, and information-heavy dashboards that remain calm.

Codex should not copy any design literally. Instead, it should synthesize a fitting design language for this specific project.

Codex must explicitly use what it learns. That means the final implementation should show evidence of thought in hierarchy, spacing, alignment, interaction state design, and content grouping.

S00

## SVG visualization requirement

The website must contain a meaningful SVG visualization. This is a hard requirement.

The SVG should represent either a learning path, a multi-lane progression, or a concept map. It must help the user understand how the problems relate. It should show progression from easier transition-friendly Mediums toward richer but still useful Mediums. Another acceptable approach is a concept-lane map where linked list, BFS, DFS, backtracking, and DP clusters are visually separated but connected.

The SVG should be interactive. Clicking a node or cluster should filter or focus the corresponding problems. Hovering should reveal useful context. Solved state should be reflected visually. The selected problem should be reflected visually. The SVG should feel like part of the product, not an isolated illustration.

The SVG must also be implemented responsibly. It should scale well, use a proper viewBox, and remain readable across viewport sizes.

T00

## localStorage and persistent progress behavior

The site must use localStorage to persist solved state. The solved state must be visible in the list and in the detail context and in the SVG. The user should be able to check and uncheck problems easily. The site should restore progress on load without friction.

Codex should also consider persisting other useful state if that improves real usage, such as the current filters, view mode, pinned problems, or recently viewed problems. These should remain lightweight and should not create fragility.

The localStorage design should use clear key names and basic resilience. If localStorage is unavailable or fails, the site should degrade gracefully rather than crash.

U00

## Features Codex should add beyond the explicit requirements

Codex should not stop at the literal request. It should add features that materially improve convenience and decision quality while remaining simple and maintainable.

Useful additions include a "pick next" feature that suggests a strong next unsolved problem based on active filters and progression order. Another useful addition is a "pinned" or "shortlist" state so the user can mark candidates they want to do soon. Another useful addition is a compact versus expanded view mode. Another useful addition is a local note field per problem if it can be done lightly and cleanly.

Codex should add only what actually improves the product. It should not add novelty features that distract from the core job.

V00

## How problem cards and problem details should work

The scanning view should be dense and useful. A problem card or row should show the most decision-relevant information at a glance. That includes title, number, concept cluster, progression phase, clarity, effort, transition friendliness, and solved state. It may also show badges such as classic, newer gem, high ROI, or strong starter Medium.

Selecting a problem should reveal a richer panel. That panel should include a short "why this is worth doing now" explanation, what the problem practices, expected mental model, caveats, canonical LeetCode URL, supporting research URLs, and local repository coverage. The detail panel should help the user feel confident about investing time.

The detail text must be authored for utility. It should not feel like generic fluff. It should not repeat the problem statement. It should explain why the problem matters in this specific progression context.

W00

## Repository coverage presentation in the UI

Repository presence is one of the distinctive strengths of this project, so the UI must present it clearly.

For a selected problem, the site should show which local repositories contain the problem. It should also show relative file paths where useful. If possible, it should distinguish between code-only coverage and coverage with useful explanation files or especially readable material.

The presentation should be practical. The user should be able to quickly see whether a reference solution exists locally after solving the problem. If direct linking to local paths is not robust in all environments, the interface should still make it easy to copy paths.

X00

## Content tone and writing style inside the site

All written explanations in the site must be concise, practical, and specific. They should sound like good curation notes, not like marketing and not like academic prose.

A good explanation says why the user should care, what reusable idea the problem trains, what makes it approachable or not, and whether it is a strong next-step problem. A bad explanation is generic praise, vague category labeling, or restating the title in different words.

Codex must write the content so the user can make decisions quickly.

Y00

## Expected implementation structure

A simple, clean file structure is preferred. A suitable structure would include index.html, styles.css, app.js, a canonical dataset file such as data/problems.json, an optional seed file, an optional generation script, and a short README. Codex may adapt the exact names, but the project should remain simple.

The runtime site should be static and lightweight. The code should be readable and maintainable. Semantic HTML, accessible controls, reasonable responsive behavior, and graceful handling of missing data are expected.

If Codex chooses to create a data generation script, that is acceptable and desirable. The final site itself, however, must remain a plain static site without framework dependency.

Z00

## Build and data-generation responsibilities

If Codex builds a script to generate the dataset, that script must load the seed list, scan the repositories, normalize matches, perform URL and difficulty validation, and produce a stable canonical dataset.

The script should also emit a summary report so it is clear what was found, what was excluded, and why. If caching is useful for repeated verification work, Codex should implement it. The process should be deterministic given the same repository state and the same cached validations.

The generated dataset must be clean enough that the frontend can stay simple.

AA00

## Quality criteria for the content layer

Before finalizing the dataset, Codex must confirm that all published problems are Medium. It must confirm that URLs are full and valid-looking. It must ensure there are no duplicate entries. It must check that concept coverage is balanced enough for the project's target patterns. It must confirm that problem notes are actually useful and not empty filler.

It must also check that the set is not too skewed toward only one family such as sliding window or only famous classics. The final set should reflect the user's actual goals, especially BFS, DFS, linked list navigation, backtracking, and easier DP.

AB00

## Quality criteria for the product layer

Before finalizing the site, Codex must review the experience as a user would.

Can a user quickly find a good BFS Medium that is not too painful? Can a user quickly find clean linked list Mediums worth doing first? Can a user quickly surface newer graph Mediums that are still readable? Can a user confidently choose a next problem without opening ten tabs? Can a user see whether local solutions already exist?

If the answer to those questions is weak, the site is not done yet.

AC00

## Accessibility and interaction quality

The final site should meet a sensible baseline of keyboard usability and readable contrast. Interactive controls must have visible focus states. The filter system should be usable without a mouse. The SVG interactions should not break keyboard use. Labels should be clear. The layout should not rely on tiny low-contrast text or vague affordances.

This is not because the project is primarily about accessibility compliance. It is because a crisp, keyboard-friendly, readable interface is a better tool.

AD00

## Required refinement loop before completion

Codex must perform a final self-review after the first fully working version exists.

In that review, it must check content quality, structural clarity, visual polish, state persistence, filter usefulness, SVG usefulness, and whether the site genuinely feels like a well-made personal study tool rather than a rushed generated page.

Codex should then make improvements where the result is obviously weak. This refinement step is mandatory.

AE00

## Deliverables

The final deliverables must include the static website files in the current folder, the canonical dataset consumed by the site, and a short README explaining how to open and use it. If Codex used a generation script, that script should also be included.

The website must open locally and function as a static single-page site. The result should be maintainable and inspectable.

AF00

## Acceptance criteria

This task is complete only if the following are all true.

The local repositories were actually inspected and incorporated into the dataset and UI. The earlier research was used as an input but the final result goes beyond it. Additional web research was performed. Full URLs are preserved. The site includes curated transition-friendly Medium problems rather than a raw list. The site includes genuinely useful decision-support explanations. The site contains a meaningful interactive SVG visualization. The site uses localStorage for persistent solved state. The site reflects deliberate UI and UX thought rather than generic default styling. The result has gone through multiple refinement passes. The final product feels useful for choosing what to solve next.

AG00

## Operational instructions for Codex as an autonomous agent

Codex should execute the work in a disciplined order.

First, inspect all local repositories and build a raw index of candidate problems and file locations. Second, normalize the earlier research seed list into structured candidate records. Third, validate and enrich those records with fresh web research and full URLs. Fourth, reconcile the final curated set using the project's selection philosophy. Fifth, research design references and establish a visual direction. Sixth, implement the site structure and visual system. Seventh, implement filtering, detail presentation, localStorage persistence, and the SVG roadmap. Eighth, perform a product-level self-review and refine weak areas. Ninth, verify the acceptance criteria before stopping.

Codex should proactively improve weak content, weak taxonomy, weak UX, and weak visual hierarchy whenever it sees them. It should behave like an agent responsible for product quality, not like a script that merely satisfies surface requirements.

AH00

## Non-goals and things Codex must avoid

Codex must not build a framework application. It must not turn this into a generic LeetCode encyclopedia. It must not include every Medium problem it can find. It must not overcomplicate the site with flashy effects. It must not write long editorial solutions. It must not optimize for novelty instead of usefulness. It must not produce a default bland generated design. It must not ignore repository value. It must not ignore newer strong problems. It must not ignore foundational classics that still have high transition value.

The correct balance is a research-backed, repository-aware, carefully designed, decision-oriented static website for selecting the right Medium problems at the right time.





