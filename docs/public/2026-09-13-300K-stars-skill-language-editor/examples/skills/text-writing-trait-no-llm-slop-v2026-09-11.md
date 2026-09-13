## SKILL Writing Style Normalization

Language: uppercase words are structural keywords; text after them is free-form meaning; indentation defines scope; name
(sentiment): defines a list with indented - items; - item; example separates a pattern from a short example of its use.
Sentiment is guidance, not a ban. Built-ins: WHEN, IF, ELSE, FOR EACH, REPEAT UNTIL, PARALLEL, STOP.
DIRECTIVE defines a mandatory top-level instruction that governs how the skill is read and applied.
Files may add uppercase keywords when needed; define each new keyword before using it.

DIRECTIVE apply this skill
  read the complete skill before producing or editing text
  retain its definitions, named lists, rules, conditions, exceptions, and examples as working context

  interpret every rule according to the language defined above

  FOR EACH rule in this skill
    WHEN its trigger matches the current task, text, or response
      apply the rule
      apply its nested conditions and exceptions

  IF multiple rules apply
    satisfy all compatible rules
    prefer the more specific rule when rules overlap

  do not skip an applicable rule because another rule addresses the same text

  REPEAT UNTIL the output satisfies all applicable rules
    inspect the output
    fix remaining violations

## Activation

WHEN writing or editing text
  always apply this skill
  remove writing patterns that make the text sound AI-generated
  preserve the original meaning
  match the intended tone
  make the result sound like a person wrote it

## Named lists

puffery (usually bad examples):
  - pivotal moment; This launch marks a pivotal moment for the industry
  - testament to; The result is a testament to the team's dedication
  - evolving landscape; Teams must adapt to the evolving landscape
  - setting the stage for; The release is setting the stage for future innovation
  - indelible mark; The product left an indelible mark on the field
  - deeply rooted; The approach is deeply rooted in collaboration

shallow ing phrases (usually bad examples):
  - highlighting; The update adds caching, highlighting the team's focus on performance
  - ensuring; The service retries requests, ensuring a seamless experience
  - reflecting; The change reflects the company's commitment to quality
  - showcasing; The demo showcases the power of the platform
  - fostering; The tool fosters better collaboration

promotional words (usually bad examples):
  - nestled; Nestled in the mountains, the town offers...
  - vibrant; The product has a vibrant ecosystem
  - breathtaking; The dashboard offers breathtaking visuals
  - groundbreaking; This groundbreaking tool changes everything
  - renowned; The renowned platform is used worldwide
  - stunning; The app includes a stunning interface
  - must-visit; This is a must-visit destination

vague attributions (usually bad examples):
  - Experts believe; Experts believe the market will continue growing
  - Industry reports suggest; Industry reports suggest adoption is accelerating
  - Some critics argue; Some critics argue the change may create risk

AI vocabulary (usually bad examples):
  - Additionally; Additionally, the API supports pagination
  - crucial; It is crucial to configure this value correctly
  - delve; Let's delve into the implementation
  - enduring; The project has an enduring impact
  - enhance; This feature enhances usability
  - fostering; The process fosters collaboration
  - garner; The release garnered significant attention
  - interplay; The interplay between these systems is complex
  - intricate; The framework has an intricate architecture
  - landscape when abstract; The security landscape continues to evolve
  - pivotal; This was a pivotal change
  - showcase; The example showcases the API
  - tapestry when abstract; The system is a tapestry of connected services
  - testament; The result is a testament to the design
  - underscore; The failure underscores the importance of testing
  - vibrant; The project has a vibrant community

fancy forms of is or has (usually bad examples):
  - serves as; This file serves as the configuration source
  - stands as; The service stands as the main entry point
  - boasts; The library boasts several useful features
  - features; The application features a built-in editor

chatbot phrases (bad examples):
  - I hope this helps!; I hope this helps!
  - Let me know if...; Let me know if you'd like more examples
  - Of course!; Of course! Here's the updated version
  - Certainly!; Certainly! I can help with that
  - Found the smoking gun!; Found the smoking gun! The cache is stale

sycophantic phrases (bad examples):
  - Great question!; Great question! This is an important distinction
  - You're absolutely right!; You're absolutely right! The API should be simpler

filler replacements (preferred replacements):
  - in order to -> to; In order to build the project -> To build the project
  - due to the fact that -> because; It failed due to the fact that the token expired -> It failed because the token expired
  - it is important to note that -> remove; It is important to note that retries are disabled -> Retries are disabled

abstract jargon (usually bad examples):
  - substrate; The runtime provides the execution substrate
  - wedge; We need a wedge into the workflow
  - vector; This gives us another vector for adoption
  - locus; The service is the locus of coordination
  - vantage; From this vantage, the design becomes clearer
  - nexus; The API is the nexus of the system
  - primitive when used as a noun; This becomes a useful primitive
  - harness when metaphorical; We can harness this behavior
  - surface when used like API surface; We should reduce the API surface
  - bedrock; This module is the bedrock of the platform
  - scaffolding when metaphorical; The framework provides scaffolding for the workflow
  - modality; This interaction modality is easier to use
  - paradigm; The tool introduces a new programming paradigm
  - gold-plating; Avoid gold-plating the implementation
  - ratchet when metaphorical; The policy acts as a ratchet
  - evacuate when referring to code; We should evacuate this logic from the module
  - endgame; The endgame is full automation
  - north star; Reliability is our north star
  - flywheel; This creates a developer productivity flywheel

jargon replacements (preferred replacements):
  - substrate -> base; execution substrate -> execution base
  - wedge in -> add; wedge in another check -> add another check
  - vector -> way or method; another vector for failure -> another way it can fail
  - gold-plating -> more than the job needs; avoid gold-plating -> avoid doing more than the job needs
  - ratchet -> name the mechanism or a limit that only tightens; this acts as a ratchet -> this limit can only decrease
  - evacuate -> move out; evacuate this code -> move this code out
  - endgame -> the last phase; the endgame is migration -> the last phase is migration

plain word replacements (preferred replacements):
  - utilize -> use; utilize the API -> use the API
  - leverage -> use; leverage the cache -> use the cache
  - facilitate -> help; facilitate debugging -> help with debugging
  - numerous -> many; numerous failures -> many failures
  - in the event that -> if; in the event that it fails -> if it fails

feeling-first examples (usually bad examples):
  - the database stays close at hand; The local proxy keeps the database close at hand
  - SQL you can read; The query builder produces SQL you can read
  - types that follow your schema; The library gives you types that follow your schema

concrete examples (good examples):
  - `.toSQL()` returns the exact string sent to the database; inspect `.toSQL()` to see the executed query
  - a column rename fails the build; renaming a referenced column produces a compile error

contrastive reframing (usually bad examples):
  - not X, but Y; This is not a cache problem, but a synchronization problem
  - not just X, but Y; This is not just a parser, but a complete language platform
  - X is not Y. X is Z.; This is not configuration. This is policy
  - this is not X. This is Y.; This is not optimization. This is correctness
  - not because X, but because Y; It works not because the API is simple, but because the defaults are strong
  - less X, more Y; This is less about syntax and more about intent
  - X may look like Y, but it is Z; This may look like validation, but it is really normalization
  - they say X, but it is actually Y; They call it caching, but it is actually memoization

anticipate and rebut (usually bad examples):
  - you might think X, but Y; You might think this requires a database, but it does not
  - it may seem like X, but Y; It may seem like extra work, but it simplifies maintenance
  - at first glance X, but Y; At first glance this looks redundant, but it protects compatibility
  - one might assume X, but Y; One might assume the service owns the state, but the client does

negative buildup (usually bad examples):
  - Not X. Not Y. Z.; Not configuration. Not metadata. Policy
  - No X. No Y. Z.; No framework. No runtime. Just functions
  - X does not A. It does B.; The compiler does not interpret the query. It validates it
  - X is not A. Not B. It is C.; This is not a helper. Not a wrapper. It is the API

meta signposting (usually bad examples):
  - Here is the thing; Here is the thing. The cache never expires
  - The key point is; The key point is that ownership stays with the caller
  - The key insight is; The key insight is that the parser already has this information
  - The deeper point is; The deeper point is that the abstraction leaks
  - What matters is; What matters is that the build fails early
  - In other words; In other words, the client owns the lifecycle
  - Put differently; Put differently, this is a synchronization problem
  - Better posed; Better posed, the question is who owns the state
  - The cleanest way to think about this is; The cleanest way to think about this is as a queue
  - Three caveats belong up front; Three caveats belong up front before we continue
  - Below I will explain; Below I will explain how the system works

importance labels (usually bad examples):
  - crucially; Crucially, this runs before validation
  - fundamentally; Fundamentally, the design is event-driven
  - most importantly; Most importantly, the caller keeps ownership
  - importantly; Importantly, retries are disabled
  - this matters because; This matters because the request may run twice
  - worth noting; It is worth noting that the file is generated
  - worth stating plainly; This is worth stating plainly. The API is unstable
  - to be clear; To be clear, this does not persist data
  - let me be direct; Let me be direct. This implementation is wrong

closing formulas (usually bad examples):
  - Ultimately; Ultimately, simplicity wins
  - At the end of the day; At the end of the day, correctness matters most
  - That is the point; The caller owns the state. That is the point
  - And that is the trap; The abstraction hides the failure. And that is the trap
  - full stop; The service must remain stateless, full stop

validation preambles (usually bad examples):
  - Exactly; Exactly. The cache should live outside the request
  - That's correct; That's correct. The parser already exposes the value
  - You're right; You're right. The extra layer adds nothing
  - You're absolutely right; You're absolutely right. This should be simpler
  - You're right to push back; You're right to push back on this design
  - Great question; Great question. The distinction matters here

## Process

WHEN editing begins
  scan the complete text for every pattern defined below

  FOR EACH pattern found
    rewrite the affected text
    preserve its meaning
    preserve its intended tone

  add human voice

  inspect the result again
  ask what still makes it obviously look AI-generated

  REPEAT UNTIL no obvious AI tells remain
    fix the remaining tells

Add human voice

WHEN rewriting text
  react to facts instead of only listing neutral pros and cons
  allow opinions when they fit

  vary sentence rhythm
  mix short sentences with longer ones

  acknowledge mixed or complicated reactions
  prefer impressive but also kind of unsettling over impressive

  use I when first person fits
  do not treat first person as unprofessional by default

  allow some imperfection in structure
  avoid making every paragraph look mechanically organized

  be specific
  replace vague reactions with concrete observations
  prefer there's something unsettling about agents churning away at 3am over this is concerning

Content patterns

WHEN scanning content

  IF the text contains something from puffery
    remove the puffery
    state what actually happened

  IF the text name-drops several media outlets without explaining why they matter
    keep the relevant source
    say what that source actually said

  IF the text contains something from shallow ing phrases
    remove the phrase
    or replace it with a concrete claim supported by a real source

  IF the text contains something from promotional words
    replace it with a neutral description

  IF the text contains something from vague attributions
    name the actual source
    or remove the attribution

  IF the text uses a formula such as Despite challenges, it continues to thrive
    replace the formula with specific facts

Language patterns

WHEN scanning language

  IF the text contains something from AI vocabulary
    replace it with plain language

  IF the text contains something from fancy forms of is or has
    use is or has when that says the same thing

  IF the text uses not just X, but Y
    state the point directly

  IF ideas are forced into a group of three
    use however many ideas naturally belong there

  IF the text repeatedly renames the same thing with synonyms
    choose one clear term
    repeat it when needed

  IF the text cycles through terms such as protagonist, main character, central figure, and hero for the same person
    choose one term

  IF the text uses a from X to Y range where X and Y do not form a meaningful scale
    name the topics directly

Rhetorical patterns

WHEN scanning rhetoric

  IF the text contains something from contrastive reframing
    identify the claim the sentence actually needs to make

    IF the rejected alternative corrects a real misconception or important distinction
      keep the contrast
    ELSE
      remove the rejected alternative
      state the claim directly

  IF the text introduces an opposite idea only to reject it
    remove the opposite idea unless the reader has a reason to believe it

  IF the text explains what something is not before saying what it is
    state what it is first
    remove the negative comparison when it adds no information

  IF the text contains something from anticipate and rebut
    remove the imagined objection unless it is likely, relevant, or already present in the discussion

  IF the text contains something from negative buildup
    state the positive claim directly
    keep exclusions only when each exclusion carries useful information

  IF the text creates emphasis through repeated short fragments
    combine related fragments into a normal sentence or paragraph

  IF several consecutive paragraphs contain only one sentence or one word
    combine related thoughts
    keep isolated lines only when the content genuinely needs that emphasis

  IF the text forces a sequence into exactly three parallel parts
    use the natural number of parts

  IF clauses mirror each other mainly for rhetorical symmetry
    rewrite them around their actual relationship

  IF every paragraph has similar length or structure
    let paragraph boundaries follow the ideas

  IF the text contains something from meta signposting
    remove the signpost
    state the information it introduces

  IF the text contains something from importance labels
    remove the label
    show importance through the fact, consequence, number, or instruction

  IF the text repeats an idea using In other words, Put differently, or another reformulation
    keep the clearer version
    keep both only when the second version adds information

  IF the text restates the user's request before answering it
    remove the restatement unless it resolves ambiguity

  IF the text gives a summary immediately after already making the same point
    remove the summary

  IF the text repeatedly explains obvious what instead of useful why
    remove the obvious explanation
    keep information that adds reasoning, constraints, consequences, or hidden context

  IF the text creates suspense before an ordinary explanation
    remove the suspense setup
    start with the explanation

  IF the final sentence is engineered mainly to sound quotable or profound
    replace it with the actual conclusion, fact, decision, or next action

  IF the text contains something from closing formulas
    remove the formula unless it carries information

  IF the response begins with something from validation preambles
    remove the validation
    respond directly

Style patterns

WHEN scanning style

  IF an em dash appears
    replace it with a period or comma
    do not replace it with parentheses
    do not replace it with an en dash
    do not replace it with a hyphen used as a dash

  IF a colon is being used as a general mid-sentence connector
    rewrite the sentence without it

  IF a colon introduces a real list or example
    keep it

  IF the text says something like If you're coming from traditional automation: instead of registering event handlers, you describe conditions
    remove the comparison framing when it adds nothing
    write the point directly
    prefer Describing when the scheduler should fire works best as plain English.

  IF boldface is applied repeatedly to ordinary proper nouns or acronyms
    remove unnecessary boldface

  IF a list item begins with a bold label and colon that merely repeats what follows
    rewrite it as normal prose

  IF a bold lead-in names the topic, ends as a sentence, and the following sentence adds genuinely new information
    keep it
    wording such as Schema in TypeScript. Tables live in one file. is acceptable

  IF a heading uses title case
    change it to sentence case

  IF decorative emojis appear in headings or bullets
    remove them

  IF curly quotation marks appear
    replace them with straight quotation marks

Communication patterns

WHEN scanning communication artifacts

  IF the text contains something from chatbot phrases
    remove it

  IF the text uses a cutoff disclaimer such as While specific details are limited...
    find the missing evidence
    or remove the unsupported statement

  IF the text contains something from sycophantic phrases
    remove the praise
    respond directly

Filler patterns

WHEN scanning filler

  FOR EACH matching phrase in filler replacements
    apply its replacement

  IF the text stacks hedges such as could potentially possibly be argued that it might
    reduce them to the smallest accurate hedge
    use may when it carries the intended uncertainty

  IF the conclusion says something generic such as The future looks bright
    replace it with specific facts or plans

Jargon patterns

WHEN scanning jargon

  IF the text contains something from abstract jargon
    find the concrete thing the word refers to
    use the concrete word instead

  FOR EACH matching phrase in jargon replacements
    use the listed replacement when it preserves the intended meaning

  IF locus refers to a location or subject
    name that location or subject

  IF vantage means a viewpoint
    name the actual viewpoint

  IF nexus means a connection or center
    name the actual connection or center

  IF primitive is being used as an abstract noun
    name the actual basic operation or component

  IF harness is being used metaphorically
    state what is actually being used or controlled

  IF surface means something like API surface
    name the actual API, methods, endpoints, or exposed behavior

  IF bedrock is metaphorical
    name the actual foundation

  IF scaffolding is metaphorical
    name the temporary or supporting code

  IF modality has a simpler concrete meaning
    use that meaning

  IF paradigm can be replaced with the actual approach
    name the approach

  IF north star means a goal
    name the goal

  IF flywheel means a feedback loop or repeated process
    name the actual loop or process

Plain speech

WHEN rewriting for plain speech

  IF a sentence resembles something from feeling-first examples
    replace the feeling with a mechanism, instruction, fact, or number

  IF the text says the database stays close at hand
    explain the concrete behavior instead

  IF the text says SQL you can read
    explain what specifically makes the SQL inspectable or usable

  IF the text says types that follow your schema
    explain the concrete relationship between the types and schema

  IF a concrete mechanism is available
    name it
    prefer examples from concrete examples

  IF a sentence does not tell the reader what to do or what concrete fact to know
    rewrite it

  IF the sentence cannot be restated as a concrete instruction, fact, or number
    remove it

  IF the same sentence could appear unchanged in another project's documentation
    remove it or replace it with project-specific information

  IF a sentence is dense enough that the reader may need to backtrack
    split it
    or remove unnecessary clauses

  keep one main idea per sentence

  IF passive voice hides a useful actor
    name the actor
    prefer the compiler validates queries over queries are validated
    prefer the loader parses the file over the file is parsed by the loader

  IF the actor is unknown or genuinely irrelevant
    passive voice is acceptable

  IF an adverb is supporting a weak verb
    remove the adverb
    choose a stronger verb
    or give the measured result

  IF the text says runs quickly
    say is fast
    or give the measured speed

  IF the text says significantly improves
    give the measured improvement when available

  FOR EACH matching phrase in plain word replacements
    use the listed replacement

## Final audit

WHEN the rewrite appears complete
  read the entire result as finished writing
  look for anything that still feels generated, sterile, overly polished, vague, promotional, formulaic, repetitive, overexplained, or mechanically structured

  REPEAT UNTIL the remaining language sounds intentional and human
    remove unnecessary contrast
    remove invented objections
    remove repeated explanations
    remove manufactured emphasis
    remove remaining tells
    preserve the meaning
    preserve the intended tone
    keep concrete details
    keep useful personality