<!-- RetroOS UI v001 editable vendored framework source.
This file may be changed inside this repository, but changes should remain
generic, reusable, and suitable to merge back into the standalone RetroOS UI
framework. Do not add this browser extension's feature-specific business
logic here. Put project-specific integration in an adapter or bridge layer
outside src/vendor/retroos-ui-v001/. -->

2026-04-23

A00

# Meta summary: how we write specifications in this workflow

This is a reusable summary of the way we have been working across this conversation. It is not only a recap of topics. It is a writing model, a product-thinking model, and a specification-writing model. Its purpose is to let you open a new chat later and reproduce the same style, structure, quality bar, and engineering intent.

At a high level, what we do here is this:

we take a feature idea that is usually still half-formed, emotionally obvious to the product author, but not yet operationally precise;

we turn it into a structured specification that a coding agent can implement without visual access, without product intuition, and without relying on follow-up clarification for every gap;

we improve the idea while documenting it, not only describing it;

we repeatedly move between brainstorming, user scenarios, architecture shaping, formal PRD writing, appendices, acceptance checklists, and change requests;

and we keep the text readable, human, grounded in user value, and specific enough for implementation.

The work is not just "write requirements." The work is "translate intent into a form that survives implementation."

B00

## The central philosophy

The strongest recurring principle in our work is that a specification is not merely a list of requirements. It is a transfer of product intent from a human who can imagine the whole experience into an implementation agent that cannot.

A strong recurring quote from the work is this:

> "The purpose of this feature is to evolve the minibuffer from a flat command launcher into a structured interactive command surface."

This is a good example of what we do well. We do not begin by enumerating methods or files. We begin by naming the product shift. We describe what the thing is becoming. That creates orientation.

Another strong quote is this:

> "The goal is not to change the code yet. The goal is to inspect the current implementation carefully, assess its quality from several engineering angles, and produce a descriptive, evidence-based report that can later be used for decision-making, refactoring planning, cleanup planning, and product-improvement brainstorming."

This shows another important habit: we define the nature of the document itself. Is it a PRD? A change request? A report task? A maintenance appendix? A help page? We always say what kind of document it is and what it is not. That reduces drift immediately.

C00

## What kinds of documents we write

We do not write one generic "spec." We write several distinct document types, each with a different purpose.

The first type is the full PRD. This is the main specification for a feature or subsystem. It explains the product direction, goals, non-goals, architecture, interaction model, state model, error handling, testing, and acceptance criteria.

A representative quote is:

> "This document defines the next major evolution of the existing minibuffer feature."

That sentence works because it places the feature in time and context. It says whether this is greenfield or an iteration.

The second type is the change request PRD. This is used when a feature already exists and we are refining, correcting, or redirecting it. This is an important distinction because implementation constraints and user expectations are different once the feature is already real.

A representative quote is:

> "This is not a fresh feature PRD from zero. This is an iteration document."

That sentence is valuable because it tells the implementation agent not to reimagine the whole system.

The third type is the appendix. Appendices are where we move from product intent into execution guidance, engineering discipline, milestone planning, maintenance notes, telemetry instructions, or required follow-up commands.

A representative quote is:

> "This appendix provides additional implementation instructions for Codex. It supplements the main specification and should be treated as execution guidance, not as a replacement for the product requirements."

This is exactly the right role for an appendix: secondary, practical, and scoped.

The fourth type is the acceptance to-do list. This is not a prose PRD. It is a chunked implementation plan with verification statements. This is used when the feature is already well understood and we want Codex to work iteratively, safely, and with explicit checkpoints.

A representative quote is:

> "For every chunk, Codex should follow the same execution discipline: Understand the chunk in the context of the existing codebase. Decide how the chunk fits the current architecture in the cleanest way. Implement only that chunk. Review the implementation statically. Refactor if needed."

That is not product prose. It is execution discipline.

The fifth type is the internal report task specification. This is for engineering reviews, code-health reports, architecture reviews, and diagnostics-oriented work.

A representative quote is:

> "Create a full engineering health report for the minibuffer and Text Expander feature set as one connected command platform."

That sentence is good because it names the unit of review. Not just the minibuffer. Not just Text Expander. The connected platform.

The sixth type is user-facing help content. This is neither a PRD nor an appendix. It is production copy. It must be written differently: clearer, shorter, more task-oriented, and focused on what the user needs to act.

A representative quote from that style is:

> "The minibuffer is the extension's keyboard-first command surface. It lets you run utilities, page actions, tools, and integrations without opening menus or hunting through the interface."

That is product help language, not engineering language.

D00

## How we begin: always frame the feature first

One of the most important recurring patterns in our work is that we begin by describing the product shape before listing details. We ask: what is this becoming?

Examples:

> "The minibuffer is not a replacement for the existing Text Expander field-trigger workflow. It is a second interaction mode built on the same command system."

> "The minibuffer should become a unified command surface over three command families."

> "The minibuffer should no longer feel like a flat searchable launcher. It should feel like a structured interactive command surface."

These are strong because they are not implementation details. They are product definitions. When later sections become detailed, this framing continues to guide decisions.

This is a major part of our style. We do not start with "add a field" or "create a file." We start with what changes in the product's identity.

E00

## How we write good objectives

Our goals are always practical, and our non-goals are just as important.

Examples of good goals:

> "The first goal is to allow commands to declare structured signatures in the command registry."

> "The second goal is to allow the minibuffer to parse inline parameters in a simple, command-line-like syntax."

> "The third goal is to support guided prompting for missing required parameters after parsing and fallback resolution."

These goals are strong because each one is precise and implementable.

Examples of strong non-goals:

> "This feature does not attempt full PowerShell compatibility."

> "This feature does not expose arbitrary JavaScript execution."

> "This feature does not replace ordinary command-first syntax."

These non-goals matter because they prevent the implementation agent from overbuilding. In our style, non-goals are not filler. They are guardrails.

F00

## How we use user value in the specification

A recurring preference in this conversation is that every important feature detail should connect back to user value. Not every sentence must mention "user value," but many sections do, and that makes the document more readable and less mechanical.

Examples:

> "The user value is clarity. The user can either front-load the information or let the system guide them."

> "The user value is not just convenience. It is a more natural command style."

> "The user is not asking the product to report parser correctness. The user is asking it to help them succeed after they make a mistake."

This is a signature of our style. We do not stop at "what it does." We also explain why it matters to the human using it.

That helps in two ways. It makes the document more readable, and it also helps Codex decide what to preserve when there is implementation ambiguity.

G00

## How we write architecture sections

Our architecture writing is practical and layered. We do not dump technical jargon. We split the system into conceptual layers and name what each layer owns.

A very strong example is:

> "The architecture should therefore be organized into three conceptual layers: First, the existing field-trigger engine remains in place for page editing workflows. Second, a shared command registry defines canonical invocable commands, independent of whether they are triggered from field text or from the minibuffer. Third, the new minibuffer UI controller handles global command entry, suggestion rendering, history navigation, execution, and output display."

This is excellent specification writing because it maps responsibilities clearly and gives the implementation agent the right boundary intuition.

Another strong architecture pattern is separation of phases:

> "The execution model should have three phases. Phase one is parse. Phase two is resolve and collect. Phase three is execute."

This is especially valuable in command systems. It prevents "UI does everything" architectures.

H00

## How we handle interaction models

We repeatedly formalize interaction models into distinct phases or modes.

Examples:

> "The system should therefore behave like this: the user may provide as much explicit input as they want inline; the system parses and validates what was provided; if required input is still missing, the system asks only for the missing required pieces; the command runs only after final validation passes."

> "Normal command mode: the line begins with a command and is parsed command-first. Suffix text mode: the line ends with `@...`, and the parser treats preceding content as raw text candidate input."

> "Hidden + Alt-X -> Visible and focused. Visible but not focused + Alt-X -> Visible and focused. Visible and focused + Alt-X -> Hidden."

This is very characteristic of our approach. We like to turn vague interaction into explicit state or phase models. It reduces ambiguity and helps testing later.

I00

## How we write precedence rules

One of the strongest stylistic and technical moves in this conversation was the use of a compact precedence statement followed by a precise expanded form.

Example:

> "explicit argument > selection fallback for first parameter > default value > prompt if required > unset if optional > validate > execute"

Then we expanded it:

> "For each parameter, first use an explicitly provided argument if present. If the first parameter is still unresolved and the command supports selection fallback, and the page has a non-empty active selection, use that selection as the first parameter value. If the parameter is still unresolved and it has a declared default value, use the default."

This is an excellent template to reuse in future specifications. First provide the dense one-line rule. Then expand it in readable prose.

That creates both memorability and precision.

J00

## How we write user scenarios

A major recurring request in this conversation was to write usage scenarios in rich, technical prose that behaves almost like narrative writing. This is a very distinctive part of the style.

The scenarios are not dry user stories like "As a user, I want X." They are scenes. They describe the user's environment, intent, emotional state, and the difference between success and failure.

A good example:

> "Mira is staring at a collapsed block of JSON copied from a network panel. It is one dense line, braces and commas pressed together so tightly that meaning has nearly disappeared into syntax."

This is useful because it gives the feature emotional and practical context.

Another example:

> "Jon does not think about parser rules or delimiter strategy. He only feels the more important result: trust."

This is exactly the kind of prose you asked for repeatedly. It translates a parser decision into user experience.

Another good example:

> "The pipeline should stop where meaning stops."

That line is compact and memorable. It turns a technical failure rule into a clear product principle.

This narrative style is not fluff. It is how we surface UX risks that a dry PRD would miss.

K00

## What our user scenarios are for

We do not write these scenarios only to make the text pleasant. They have real functions.

They reveal hidden product risks.

They help evaluate negative scenarios, not only happy paths.

They let us notice unclear terminology, such as selection-based commands that do not actually behave reliably with selection.

They expose where state transitions feel brittle.

They help us understand when a parser rule creates trust or confusion.

This was stated explicitly in your own direction. The idea was to reduce product-author bias and ask, "Where might the user be confused or disappointed even if the feature technically works?"

That is a very important meta-practice to preserve in future chats.

L00

## How we write help content

We also developed a style for production help pages.

The help page is not a PRD. It is not a registry dump. It is not developer documentation. It is user-facing operational help.

A representative example:

> "Open the minibuffer, type a command or part of a command, review the suggestions, and press Enter to run the selected command. Some commands return text. Others open a dialog, launch a tool, change the page, or open an integration target such as ChatGPT."

This works because it teaches without overwhelming.

Another strong help-writing instruction from the conversation was: do not include invented aliases. Only include aliases that actually exist. Do not over-elaborate unimportant side effects. Explain what the user needs to act.

That is another meta rule: when writing user help, prefer accuracy and practical examples over speculative helpfulness.

M00

## How we write implementation guidance for Codex

When the audience is Codex, we do not simply say "build this." We describe how Codex should think and work.

Examples:

> "Codex should preserve the modular structure of the codebase and extract shared logic where it improves clarity."

> "Codex should prefer the smallest coherent implementation that satisfies the user-facing requirements rather than trying to simulate a full shell."

> "Codex should use the precedence rule as a hard contract."

These are strong because they constrain implementation philosophy, not only output.

We also repeatedly tell Codex to use best judgment when the codebase context suggests a better internal boundary, provided the product behavior remains intact. That is a subtle but important practice: specify behavior rigidly, allow internal structure flexibility.

N00

## How we write appendices

Our appendices are not afterthoughts. They carry real engineering policy.

We used appendices for milestone planning, mandatory commands to implement, telemetry and logging guidance, and detailed acceptance lists.

A strong appendix-style sentence is:

> "These commands are not only illustrative examples. They are required deliverables for this feature."

That sentence is powerful because it converts examples into scope.

Another good appendix pattern is:

> "The `DEV-NOTE:` comment pass must happen after the main implementation is complete, not before."

That shows that appendices can also encode process timing.

So the meta rule is: appendices are where we put delivery discipline, maintenance rules, required examples, and implementation hygiene that would make the main PRD too heavy.

O00

## How we write acceptance to-do lists

The acceptance to-do lists we produced are a distinct document genre.

They are deeply nested. They are implementation-oriented. And every chunk has verification statements introduced in a consistent form like "Ensure that..."

This structure is excellent for iterative implementation.

A representative excerpt:

> "Ensure that explicit values always override selection fallback."

> "Ensure that unsupported suffix commands do not appear in suffix suggestions."

> "Ensure that the final code fits the current architecture cleanly."

This style is good because it transforms prose requirements into checkable work without losing context.

Another important meta pattern: each chunk also tells Codex to implement, review, refactor, test, and only then proceed. That iterative discipline is part of the specification, not just an afterthought.

P00

## How we write report task specifications

When the task is an engineering health report, our style changes again.

We define the scope of review, required sections, evidence requirements, tone, and examples of good versus weak findings.

A strong example:

> "For each review area, include all of the following: a short summary of the current state; the main strengths; the main weaknesses, risks, or ambiguities; concrete evidence from the codebase; specific improvement suggestions."

This is excellent because it defines the output form.

Another strong sentence is:

> "Do not write a rewrite plan disguised as a review."

That is exactly the kind of clarity that prevents useless output.

This is a meta lesson: whenever the deliverable is analysis rather than implementation, specify the report structure just as rigorously as you would specify a feature.

Q00

## How we evolve features through change requests

We also repeatedly wrote change requests rather than replacing entire specifications.

This means we treat the feature as living. We do not assume every new need requires a brand-new PRD. Often the right thing is a focused change request layered on top of existing behavior.

Examples include:

the three-state Alt-X behavior;

the help command enhancement;

the shift from selection-based ChatGPT commands to text-based ChatGPT commands;

the content-first `@command` suffix mode;

the suffix pipeline and clipboard terminal step.

This is another meta pattern: do not rewrite the world if you only need to revise one meaningful part of it. State clearly that it is a change request, say what is already implemented, and specify only the delta plus the consequences.

R00

## How we handle naming and product honesty

Naming was a recurring theme in the conversation. We often changed names when the original name implied behavior the product could not reliably deliver.

The best example is the ChatGPT command rename.

The reasoning was:

selection is unreliable once the minibuffer takes focus;

therefore "send-selection-chatgpt" is not honest enough as a primary public command;

so "send-text-chatgpt" is a better name because it reflects the explicit input model.

This is a strong meta principle: names should reflect actual reliable behavior, not just the original aspiration of the feature.

S00

## How we use examples

Examples are everywhere in our work, but they serve different purposes.

In PRDs, examples clarify syntax.

In help pages, examples clarify usage.

In appendices, examples clarify what must actually be implemented.

In report tasks, examples clarify what a good finding looks like.

In user scenarios, examples clarify how behavior feels.

This is another important meta lesson: examples are not decoration. They are a translation layer between abstract rule and practical understanding.

T00

## The style rules that repeat across the conversation

There are several style rules that repeated many times and should be considered core to the method.

The first is: be rich, but do not be muddy. The text should be readable and enjoyable, but still technically exact.

The second is: do not make the document dry if the subject is complex. Complex systems become easier to understand when they are described with enough context and rhythm.

The third is: explain what changes in the product, not only what changes in the code.

The fourth is: every major section should tell the reader why that thing matters.

The fifth is: implementation guidance should be concrete without over-constraining the code structure.

The sixth is: when writing for users, remove internal noise. When writing for Codex, add operational precision. When writing reports, demand evidence.

The seventh is: whenever possible, avoid asking the implementation agent to infer the important rules from examples alone. State the rules directly.

U00

## What we do in general

What we do in general is specification translation and specification hardening.

We begin from ideas that are usually already vivid in human terms but not yet formal. The human product author knows how the feature should feel, what problem it solves, what bad experience it is correcting, and which analogies matter, such as Emacs, PowerShell, or a command palette.

We then progressively formalize that into several layers:

first, product framing;

then user value;

then architecture;

then interaction model;

then error model;

then state and lifecycle behavior;

then testing and acceptance;

then appendices for execution guidance;

then user-facing help;

then maintenance notes;

then engineering review tasks.

This means we are not merely writing "requirements." We are building a coherent package around a feature so that it can be implemented, tested, maintained, documented, and evolved.

V00

## The meta playbook you can reuse in another chat

If you want to reproduce this style and process in another chat, this is the closest compact playbook.

Start by saying what the feature is becoming.

Then describe the user problem in practical human language.

Then define goals and non-goals.

Then define the interaction model and state transitions.

Then define architecture boundaries and source-of-truth layers.

Then define data or command models.

Then define precedence or execution rules as compact laws plus expanded prose.

Then define failure behavior and recovery.

Then add user scenarios written as real scenes, including negative cases.

Then write the formal PRD.

Then write appendices for implementation process, telemetry, mandatory examples, or developer notes.

Then write the acceptance to-do list with chunked work and "Ensure that..." checks.

Then write the user-facing help content if the feature needs discovery.

Then, when needed, write the report task specification to audit the implemented system.

This is the recurring method that emerged across the conversation.

W00

## Reusable high-quality example lines from our work

These are especially reusable because they capture the style well.

> "This document defines the next major evolution of the existing minibuffer feature."

Use this when a feature is a meaningful expansion of an existing subsystem.

> "The goal is not to change the code yet."

Use this when the deliverable is analysis or a report.

> "The minibuffer should become a unified command surface."

Use this when writing product framing for command-oriented features.

> "The system should therefore behave like this..."

Use this to introduce phased interaction flows.

> "explicit argument > selection fallback for first parameter > default value > prompt if required > unset if optional > validate > execute"

Use this whenever a feature has precedence rules.

> "The user is not asking for parser correctness as an abstract ideal. The user is asking the product to help them succeed after they make a mistake."

Use this whenever error handling matters.

> "The pipeline should stop where meaning stops."

Use this whenever multi-step processing must fail clearly.

> "Do not write a rewrite plan disguised as a review."

Use this when specifying engineering report tasks.

> "These commands are not only illustrative examples. They are required deliverables for this feature."

Use this when examples are actually mandatory scope.

X00

## The most important recurring principle

If I had to compress the whole method into one principle, it would be this:

write the specification so that a strong implementation can emerge from it even when the implementer does not share the original human intuition.

That means the document must carry intent, shape, constraints, user value, and operational rules. It must be good enough to survive distance between product thinking and code writing.

That is what we have been doing throughout this conversation.

Y00

## Final reusable description of our approach

We write specifications as layered product-engineering documents that begin with human intent and end with implementation-grade precision. We do not stop at features. We define behavior, boundaries, failure modes, examples, user value, maintenance obligations, delivery discipline, and help content. We use rich technical prose so the documents remain readable, but we also insist on explicit rules, explicit state transitions, explicit acceptance checks, and explicit guidance for the coding agent. We treat user scenarios as a design tool, not decoration. We treat appendices as execution instruments, not overflow. We treat naming as a product truth issue, not only a code issue. We treat help content, engineering reports, and acceptance plans as first-class companion documents around the feature. And whenever a feature grows large enough, we stop writing isolated requirements and start writing a command platform, a product surface, or a subsystem with a clear internal language.

Z00

That is the meta description of what we did here, how we did it, and how to reproduce it in another chat.
