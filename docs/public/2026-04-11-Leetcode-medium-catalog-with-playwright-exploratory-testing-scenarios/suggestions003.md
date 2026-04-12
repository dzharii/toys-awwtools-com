2026-04-10

AW00

## Appendix: topic guide pages, teaching standard, and explanatory content quality bar

In addition to the main decision website, Codex must create a parallel set of separate topic-guide pages. These must be standalone HTML pages, linked from the main site, and written in a wiki-like style for learning and reference. Their purpose is different from the problem pages. The problem pages help the user choose what to solve. The topic pages help the user understand the underlying ideas well enough to approach those problems with confidence.

These topic pages are a required part of the project, not an optional enhancement. They must cover the major concept families represented in the curated problem set, especially linked lists, tree traversal, BFS, DFS, graph traversal, two pointers, sliding window, backtracking, and easier dynamic programming. If the final problem collection reveals other recurring concept families that deserve their own teaching page, Codex should add them.

AX00

## Role of the topic pages

The topic pages must behave like a good teacher, not like a code dump and not like a terse cheat sheet.

Each page should start from the simplest understandable framing and then gradually build toward the stronger mental model the user needs for Medium problems. The explanation should move from basic intuition to structured understanding in a controlled progression. A reader who does not use the concept every day should still be able to follow the article.

The goal is not merely to define the topic. The goal is to make the topic feel understandable, navigable, and usable. A good topic page should reduce intimidation, increase pattern recognition, and make the related problems on the main site feel more approachable.

AY00

## Separate-page requirement

Each major topic must have its own separate HTML page. These pages should be interlinked and reachable from the main site through clear navigation. The main site should link to the relevant topic guide from problem detail panels where appropriate. The topic guides should also link back to related problems so the user can move between learning the concept and choosing practice.

This structure must feel intentional. The main site is the decision layer. The topic pages are the teaching layer. The user should be able to move naturally between the two.

AZ00

## Teaching quality standard

Codex must write these topic guides with a very high teaching bar. Before finalizing any explanation, Codex must review it from the perspective of a first-time or rusty reader and ask whether the explanation truly works.

Codex should repeatedly ask questions such as these. Would someone who does not practice this concept daily understand the opening explanation. Does the page assume too much. Is the explanation missing a basic intuition step. Should a small example be added. Should a small output trace be added. Should a diagram or state walkthrough be added. Is the jump from simple explanation to full topic understanding too abrupt. Is there anything confusing that could be reworded or clarified.

These review questions are mandatory. Codex must revise topic pages until they read like serious teaching material rather than rough notes.

BA00

## Scope of each topic guide

Each topic guide should explain the concept from first principles up to the level needed for the curated Medium problems. The page should not try to become a complete textbook chapter, but it must go beyond a shallow summary.

A strong topic page should include a plain-language introduction, the core mental model, when the concept tends to appear, what kinds of problem situations usually involve it, what beginners often misunderstand, and how to recognize when the concept may be relevant. It should also include carefully chosen examples, small state progressions or traces, and connections to the curated problem set.

The page should help the user understand what the topic is, why it matters, how it behaves in practice, and what kinds of tasks it helps with. It must not depend on the user already knowing the trick.

BB00

## Anti-spoiler and problem-separation rule

The topic pages may teach the concept clearly, but they must not spoil the curated problems by turning into disguised solutions for those exact problems.

The teaching content should explain the topic itself, the idea family, and the broad shapes of problems where it appears. It may discuss generic toy examples and small demonstrations. It may show how the concept behaves on simple inputs. It may reference related curated problems by name. But it should not walk through the exact solving path of a listed problem in a way that gives away that problem's answer.

The same rule from the main site still applies here in spirit. Teach the concept deeply, but do not rob the user of the solving experience on the actual curated problem set.

BC00

## Required structure inside each topic page

Each topic page should have a stable internal structure so that the knowledge base feels consistent across topics.

A strong page should begin with a short plain-language summary of what the topic is. It should then present the simplest intuition. After that, it should explain the essential mechanics and the core vocabulary. It should then show one or more carefully chosen examples. After the examples, it should explain common variations, common mistakes, and how the topic usually appears in practice problems. It should then connect the topic to selected problems from the curated site. Finally, it should end with references, related topic pages, and a short "what to read next" or "what to try next" section.

Codex may refine this structure, but each page must feel complete and intentionally organized.

BD00

## Example and sample quality bar

All examples and samples must be chosen with good taste. They must be to the point. They must illustrate exactly what is being explained. They must not be noisy or overcomplicated.

If a small input and output pair explains the idea better than a long paragraph, Codex should use it. If a step-by-step state trace helps, Codex should include it. If a small table, sequence of states, or a compact diagram clarifies the topic, Codex should include it. If an example is cute but not useful, Codex should remove it.

Examples are not decoration. They are teaching tools. Each example should have a clear pedagogical reason to exist.

BE00

## State traces, progressions, and explanatory visuals

Codex should use state-by-state walkthroughs where they genuinely improve understanding. These may include changes in pointers, queue contents, recursion tree fragments, dynamic programming table growth, or movement through a graph or grid. The user should be able to see what is happening, not just be told abstractly that something happens.

If visual representation helps, Codex should include diagrams, traced states, or other static visual aids directly in the HTML pages. These may use SVG, semantic HTML blocks, styled tables, sequence layouts, or other lightweight methods. The quality bar is clarity. The visualization must serve the explanation.

Codex should think carefully before adding a visual. The visual should answer a learning need. It should not exist merely to make the page look more elaborate.

BF00

## Use of C language examples

Codex may and should use C language, specifically C99-style code, for explanatory examples where that improves clarity. These examples must be short, focused, and instructional. They should be used to illustrate the concept, not to present full competitive-programming style solutions.

The code should be readable and well chosen. It should highlight the conceptual movement clearly. If a short C snippet can make pointer movement, queue-based processing, array indexing, recursion shape, or state transition more concrete, Codex should use it. If code would distract more than clarify, Codex should use another explanatory form instead.

The code examples must be pedagogical examples, not final-answer implementations for the curated problems.

BG00

## Output examples and expected behavior illustrations

Where appropriate, topic pages should include small output examples or expected-behavior illustrations. These should help a reader understand what the concept does or produces.

For example, a topic page might show how traversal order affects observed output, how a window changes over time, how a recursion branch expands and contracts, how a queue evolves level by level, or how a small DP table accumulates results. These illustrations should be tightly aligned to the idea being taught.

Codex should ask, for each topic, whether the reader would benefit from seeing not just the input and structure, but also the resulting observable behavior. If yes, it should include that material.

BH00

## Depth-of-explanation review loop

Codex must perform an explicit depth review for every topic page. The review must ask whether the page is too thin, too abrupt, too abstract, or too dependent on prior knowledge.

If the page explains the topic too fast, Codex should slow it down and insert a simpler step. If the page is missing a concrete example, Codex should add one. If the page uses terminology before grounding it, Codex should define or motivate it. If the page feels like it explains to someone already fluent in the concept, Codex should rewrite it to better serve the actual user.

This review should happen more than once. Codex should revisit these pages in later iterations and strengthen them.

BI00

## Relationship between topic guides and problem cards

The topic guides and the curated problem entries must reinforce each other.

A problem card or detail panel should be able to link to one or more relevant topic pages. A topic page should link back to selected problems that are good practice for that concept. This should create a loop where the user can either start from the concept and then pick a problem, or start from a problem and then go learn the concept in more depth.

The content relationship should also be consistent. If the topic page explains a concept as a progression from basic to more advanced use, the problems linked from that page should reflect that progression.

BJ00

## Richness and generosity of teaching content

Codex should be generous in these topic guides. It should ask not only what the reader expects from the page, but also what extra context would make the page genuinely more useful than expected.

That may include a compact glossary of core terms, a short section on how to recognize the concept in a problem statement, a section on common traps, a comparison against adjacent concepts, a compact checklist for when the topic might apply, or a short "before you try related problems" note. It may also include references to outside materials with full URLs if they materially help.

The guiding principle is that these pages should feel like someone put real thought into helping the learner, not merely meeting a requirement.

BK00

## Topic-page coherence requirement

The set of topic guides must feel coherent as a mini knowledge base. The pages should have a shared visual language, shared navigation style, shared content structure, and shared teaching tone. A reader moving from one page to another should feel continuity.

The pages should also fit the broader website. They should not look like a different project. Their design should match the visual system of the main site while still being optimized for reading and learning.

BL00

## Additional iteration requirement for topic pages

The topic pages increase the quality burden of the whole project. Codex must therefore include them inside the same multi-iteration standard and review them in later passes, not only when first written.

Codex must revisit the topic pages after the main site exists and ask whether they still make sense in relation to the curated problem set. It should refine cross-links, examples, reading flow, and teaching clarity based on the final shape of the main site.

If the main site evolves during later iterations, the topic pages must be brought into alignment.

BM00

## Reachable acceptance criteria for the topic-guide appendix

This appendix is satisfied only if the final project includes separate HTML topic pages for the major concept families covered by the curated problems. These pages must be linked from the main site and back into it. They must explain the topics from simple intuition toward practical understanding. They must contain carefully chosen examples, traces, outputs, or visuals where appropriate. They must avoid spoiling the exact curated problems. They must use high-level teaching language rather than editorial-style problem solutions. They must show evidence of review and refinement for clarity.

If C code is used, it must be short, focused, and pedagogically justified. If visuals are used, they must improve understanding. If external references are used, they must be full URLs and should genuinely help.

BN00

## Higher-quality acceptance criteria for the topic-guide appendix

A stronger success condition is that a reader who is rusty on a topic can read one of these pages and feel materially more prepared to attempt the related Medium problems. The reader should leave with a clearer mental model, better vocabulary, a better sense of what the topic looks like in practice, and less fear of the concept.

If the pages accomplish that, then they are working as intended. If they merely summarize terms or show code fragments without building understanding, then they have failed the purpose of this appendix.
