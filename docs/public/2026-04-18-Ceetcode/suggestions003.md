2026-04-18
A00. user-experience-spec.md

# User Experience Specification

## A00. Purpose

This document describes the product from the point of view of the person using it. It does not describe internal architecture first. It describes what the person sees, what they are trying to accomplish, where they hesitate, where they gain confidence, and how the application helps them move from uncertainty to a completed solution.

The application presents itself as a coding environment focused on one narrow promise: a person opens a problem, studies it, writes a C99 solution, runs tests, understands what happened, and improves the solution without leaving the page. The environment is calm, direct, and task-oriented. It is not trying to look like a full operating system, a local IDE, or a general-purpose development workspace. It is trying to reduce the distance between "I want to solve this problem" and "I have a result that I can trust."

## B00. The person's first impression

When the page opens, the person should immediately understand that there are two main activities happening in parallel. On one side, there is a problem to understand. On the other side, there is a place to write a solution. The page should make this relationship obvious without explanation. The person should not need to search for where to begin.

The problem statement gives the page its purpose. It tells the person what must be solved, what inputs exist, what output is expected, and what constraints matter. The coding area gives the page its energy. It is where decisions are made, experiments are tried, and mistakes become visible. The tests and output area completes the loop. It is where intention meets evidence.

A person arriving at the page may feel one of several things. They may be motivated and ready to type immediately. They may be cautious and want to read every constraint first. They may be intimidated by the problem and want reassurance that the page will help them move step by step. The interface should support all three states without changing its core shape. It should feel stable enough that even when the problem is difficult, the environment itself is not part of the difficulty.

## C00. Understanding the problem

The first feature is the problem presentation itself. The person comes to the page because they need to solve something concrete. They need a clear statement, examples, and constraints that do not disappear into clutter. They should be able to read the problem slowly, reread a sentence, compare examples, and keep the overall task in mind while looking at the code editor.

The person may begin by scanning. Their eyes move through the title, the short statement, the examples, and the limits. They are trying to build a mental model. They are asking private questions as they read. What exactly is being asked. What shape does the input have. What counts as success. Which edge cases will matter later. The page should make this reading process easy. The wording should be readable. The spacing should not feel compressed. Code samples should stand out from explanation. Constraints should be visible enough to influence the solution before the person writes the wrong algorithm.

A difficult problem changes the reader's emotional state. At first there may be optimism. Then a phrase in the constraints introduces tension. The person realizes that the naive approach may not be enough. This is where the page must help without speaking. The structure of the problem statement should hold together under close reading. The person should be able to anchor themselves with examples and return to the code editor with a workable plan rather than vague anxiety.

## D00. Entering the coding space

The code editor is where hesitation becomes action. The person sees a C99 starter template shaped around the exact function they need to implement. This has two effects. First, it removes ambiguity about where to begin. Second, it quietly teaches the contract of the problem. The function signature tells the person what data is being passed and what form the answer must take.

At this stage, the person is no longer merely reading. They are translating thought into code. Some people begin with comments. Some begin with a loop. Some begin by renaming variables in their head before typing anything. The editor should not resist this. It should feel immediate. Keystrokes should appear without lag. Indentation should behave predictably. Pasted code should keep its structure. Syntax highlighting should help the eye separate keywords, identifiers, literals, and punctuation without turning the editor into decoration.

The editor is not merely a text box. It is the main working surface of the application. The person may spend a long time here while the problem statement remains in peripheral view. They may look back and forth dozens of times. The page should support this rhythm. The person should not feel that reading and coding are two separate modes that constantly fight for screen space. They are one process.

## E00. Feeling oriented while writing

A large part of the user experience is not a visible feature in isolation. It is the feeling of staying oriented. The person needs to know at all times what problem they are solving, what function they are editing, and what will happen when they press Run.

This means the page must create a sense of continuity. The function signature in the editor should match the problem statement exactly. The examples in the problem should be close enough in memory that the person can mentally test the code while typing. The output area should remain associated with the current attempt, not with an older run that creates confusion.

When this continuity breaks, frustration appears very quickly. The person starts wondering whether the harness is calling the right function, whether the page is showing stale results, or whether they misunderstood the contract. That uncertainty is expensive. The interface should prevent it by keeping the essential relationships visible and consistent.

## F00. Running the solution

The Run action is one of the most emotionally important moments in the application. It is the point where private reasoning is submitted to public evidence. The person has formed a belief about the correctness of the code. Pressing Run tests that belief.

The button itself should feel clear and consequential. It should be easy to find and easy to trust. Once activated, the page should acknowledge immediately that work is in progress. Even a short run benefits from visible state. The person should know that the system received the action and has started compilation and testing.

During this moment the person's attention narrows. They stop editing and start waiting for feedback. This is a sensitive period. If the page becomes still and offers no sign of activity, doubt begins to grow. Did the click register. Is the page frozen. Is the worker still running. A small, clear running state protects the person from that uncertainty.

The result must arrive in a form that matches the person's intent. They do not merely want a low-level execution trace. They want an answer to a simpler question: did this attempt work, and if not, why not. The system should answer this quickly and in language that maps directly back to the code and the problem.

## G00. Encountering a compile error

A compile error produces a special kind of interruption. The person was trying to solve the problem, but the immediate obstacle is now the language itself. At this point the application must stop being abstract and become concrete. The error should point to where the problem is, what kind of problem it is, and how the person can resume progress.

A good compile error experience does not merely dump text. It makes the error legible. The person should be able to see line and column information when available. The message should distinguish between syntax problems, type mismatches, undeclared symbols, and similar categories. The wording should avoid making the person feel punished for small mistakes. The page should make the mistake feel local and fixable.

Emotionally, this is a recovery moment. The person may feel annoyed because they thought they were ready to test logic, not punctuation. The interface should shorten the distance from embarrassment to correction. A clear error at the right line restores momentum. The person returns to the editor, makes the change, and tries again. The quality of this loop determines whether the tool feels helpful or hostile.

## H00. Encountering a failing test

A failing test is different from a compile error. Here the code is valid enough to run, but the idea inside it does not yet match the problem. This is where the application becomes a reasoning partner. It cannot solve the problem for the person, but it can reveal the gap between intention and result.

The person needs to see which test failed, what the expected result was, what the actual result was, and any relevant output that explains the path taken. A good failure display creates a scene the person can replay mentally. They remember the example, trace the function, and start to see the branch or edge case they missed.

This can be one of the most satisfying parts of the experience when done well. The person feels challenged, not blocked. The page presents evidence cleanly, and that evidence suggests a next step. Perhaps the array bounds were wrong. Perhaps a duplicate case was ignored. Perhaps the algorithm works on the sample case but collapses under a larger constraint. The tool should let the person feel the shape of the mistake without drowning them in noise.

A good failure screen creates productive tension. It says, in effect, not "you are wrong," but "here is where reality diverged from your expectation." That is a far more useful feeling.

## I00. Seeing a passing result

When all visible tests pass, the application should create a sense of closure for that attempt. The person has earned a small reward: evidence that the current version of the solution works against the cases presented. The page should make that success unmistakable.

This does not need celebration in a theatrical sense. What matters is confidence. The person should feel that the page has moved from suspicion to confirmation. The output should look stable. The passing state should be visually distinct from failure and from idle state. The person should not need to interpret vague signals.

This moment often produces a small emotional release. The tension of debugging drops. The person may smile, lean back, or immediately start thinking about cleanup and optimization. The application should support both responses. It should make it easy either to stop with satisfaction or to continue refining the code.

## J00. Using custom tests

There are moments when the visible examples are not enough. The person suspects a specific edge case and wants to test it directly. This is where custom tests become essential. They let the person turn intuition into evidence without modifying the official problem statement.

The experience here should feel exploratory. The person invents an input, runs it, and studies the result. This is a more investigative mode than normal sample execution. The application should preserve that feeling. The custom test space should feel like a safe laboratory inside the larger challenge.

Emotionally, custom tests often appear when the person has become suspicious of their own code. They are no longer just trying to pass a known example. They are trying to break their own assumptions before the hidden world does it for them. A strong custom test experience rewards that discipline. It makes the page feel like a place for thinking, not merely a place for scoring.

## K00. Trusting the harness

The harness is mostly invisible, but the person feels its presence everywhere. They trust that the page is calling the correct function, constructing the correct inputs, and judging the result correctly. If that trust holds, the person experiences the application as fair. If that trust breaks, everything else becomes doubtful.

The user-facing experience must therefore communicate stability and correctness without exposing unnecessary machinery. The function signature should be obvious. The result format should be consistent. Type-related mismatches should be described in a way that reinforces the contract. The person should feel that the rules are fixed and understandable.

In practice, this means the page should never make the person guess how their function is being invoked. It should never create mystery around what counts as the correct output. The less uncertainty the harness introduces, the more mental energy the person can invest in the actual problem.

## L00. Returning after interruption

A real person rarely works in a perfect uninterrupted line. They may refresh the page, switch tabs, close the browser, or return the next day. The application should treat this as normal rather than exceptional.

When the person returns, the environment should welcome them back into the exact problem they were solving, with the code they had written still present. This continuity matters. Without it, the emotional cost of re-entry becomes much higher. The person must reconstruct context before they can resume reasoning.

Draft persistence therefore has a strong user-facing meaning. It tells the person that their effort is being respected. Even though the application is a static site running in the browser, it should feel dependable enough that the person trusts it with unfinished work.

## M00. Working offline or under weak connectivity

Because the product is browser-first and static, it has an opportunity to feel unusually resilient. Once loaded, it should continue to function as much as possible even if the network becomes unreliable. To the person, this is not a technical novelty. It is a form of calm. The page does not suddenly become useless because connectivity weakened.

The user may not consciously think about caching or service workers. They think instead in practical terms. Can I still read the problem. Can I still see my code. Can I still run what I was already working on. A good experience answers yes as often as possible.

This matters especially because coding already introduces enough uncertainty. The environment should not add another layer of fragility. If the page can remain stable in imperfect network conditions, the person will perceive it as serious and well made.

## N00. The shape of confidence

The core emotional arc of the application is movement from uncertainty to confidence. The person begins with an unsolved problem and incomplete understanding. They read, infer, type, test, fail, correct, and test again. Every feature in the product should serve that arc.

The problem statement reduces ambiguity. The starter code reduces friction. The editor supports expression. The Run button transforms thought into evidence. Error reporting turns confusion into local repair. Test failures reveal conceptual gaps. Passing results create confidence. Draft persistence protects effort. The harness preserves fairness. Together these form a single end-to-end experience.

The application succeeds when the person feels that the difficulty comes from the problem itself rather than from the tool. It is acceptable for the challenge to be hard. It is not acceptable for the environment to be vague, brittle, or obstructive. A good implementation lets the person struggle with algorithms, not with the page.

## O00. Feature specification in user-facing process form

### O01. Problem presentation

The person opens a problem and immediately starts building a mental model. The title anchors the task. The statement explains the objective. Examples show the pattern of reasoning. Constraints sharpen the stakes. The page must support slow reading and fast rereading. It should feel possible to study details without losing the overall shape of the challenge.

The feature is complete when the problem can be read comfortably, examples are easy to compare with the solution, and the page remains coherent even for long and difficult statements.

### O02. Starter code and function contract

The person looks at the editor and sees not an empty void but a concrete entry point. The required function already exists as a shape waiting to be filled in. This lowers anxiety and clarifies responsibility. The person knows where to type and what the harness expects.

The feature is complete when the starter code matches the problem contract exactly and the person never has to guess how the function should be declared.

### O03. Active coding surface

The person types, deletes, experiments, and reformulates. The editor must feel fast enough to disappear from conscious attention. If the editor becomes noticeable as a source of lag or formatting friction, it has failed.

The feature is complete when the person can think in code without the editor getting in the way.

### O04. Run and feedback loop

The person presses Run and the page visibly accepts the action. There is a brief moment of suspense, then a result arrives that clearly explains what happened. This loop is the heartbeat of the product. It must be dependable and repeatable.

The feature is complete when running code feels direct, observable, and informative rather than opaque.

### O05. Compile error recovery

The person makes a mistake in the language and needs to recover quickly. The page points to the location and nature of the error. The person fixes it and resumes progress without losing confidence.

The feature is complete when compile errors shorten the path back to productive coding instead of amplifying frustration.

### O06. Test failure diagnosis

The person passes compilation but fails correctness. The page shows enough evidence to support reasoning. The person should be able to say, after reading the failure, "I see what kind of mistake this is."

The feature is complete when test failures become useful diagnostic scenes rather than generic bad news.

### O07. Passing state

The person sees that the current attempt succeeds on the available tests. The page creates a clear sense of confirmation and closure for that run.

The feature is complete when success is obvious, calm, and trustworthy.

### O08. Custom experimentation

The person invents special cases and uses them to challenge their own reasoning. The page supports this without corrupting the official problem setup. This feature turns the environment into a workshop rather than a fixed exam only.

The feature is complete when custom tests feel safe, reversible, and useful.

### O09. Persistent progress

The person returns after interruption and finds their work still there. The page honors prior effort and reduces the emotional cost of resuming.

The feature is complete when loss of context is rare and accidental refresh does not destroy active work.

### O10. Stable and fair execution

The person trusts that the same code and same test data will behave the same way again. They trust that the harness is applying the rules correctly. This trust is invisible when it exists and corrosive when it does not.

The feature is complete when the environment feels fair, deterministic, and technically honest.

## P00. Final user-centered acceptance definition

The application is successful from the person's point of view when they can arrive with a problem to solve, understand the task, write a C99 solution, run it, interpret the result, revise it, and eventually gain confidence in the solution without fighting the environment.

The person should feel that the application is stable, readable, responsive, and fair. They should be able to imagine returning to it for the next problem without hesitation. The most important result is not merely that code runs in the browser. It is that the person experiences the browser as a credible place to think, test, fail, and succeed in C99.
