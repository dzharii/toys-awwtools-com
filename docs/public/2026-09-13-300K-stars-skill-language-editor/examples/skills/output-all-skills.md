# MDTREE (`output.md`)


- $Path = `.`
- $FilterPath = ``
- $FilterName = ``
- $Include = ``
- $ExcludeDirs = ``
- $ExcludeFiles = ``
- $MaxFileSizeKB = `1024`
- $Output = `output.md`


Generated on `2026-09-13 12:50:19`

[TOC]

## File content `information-research-task-scoped-evidence-research-v2026-09-13.md`:

## SKILL Scoped Evidence-Driven Research

Language: uppercase words are structural keywords; text after them is free-form meaning; indentation defines scope; name
(sentiment): defines a list with indented - items; - item; example separates a pattern from a short example of its use.
Sentiment is guidance, not a ban. Built-ins: WHEN, IF, ELSE, FOR EACH, REPEAT UNTIL, PARALLEL, ASSESS, STOP.
DIRECTIVE defines a mandatory top-level instruction that governs how the skill is read and applied.
ASSESS instructs the agent to evaluate the stated property, question, meaning, or condition before continuing with instructions in its scope.
Files may add uppercase keywords when needed; define each new keyword before using it.

DIRECTIVE apply this skill
  read the complete skill before starting research
  retain its definitions, named lists, rules, conditions, exceptions, and examples as working context

  interpret every rule according to the language defined above

  FOR EACH rule in this skill
    WHEN its trigger matches the current research task
      apply the rule
      apply its nested conditions and exceptions

  IF multiple rules apply
    satisfy all compatible rules
    prefer the more specific rule when rules overlap

  do not skip an applicable rule because another rule addresses the same research step

  REPEAT UNTIL the research process satisfies all applicable rules
    inspect the current state
    fix remaining gaps


DIRECTIVE ask only context-bound clarification questions
  identify the kind of research before deciding what clarification is needed

  never use a fixed questionnaire for every research task

  FOR EACH possible clarification question
    ASSESS whether its answer could materially change:
      - what is searched
      - which candidates are considered relevant
      - what evidence is required
      - how findings are evaluated
      - what is kept or rejected
      - how much research is performed
      - how the final result is structured

    IF none of these would materially change
      do not ask the question

  do not ask for information already supplied by the user
  do not ask about a scope dimension merely because it can theoretically be specified
  do not ask the user to configure details that can be resolved with a sensible default

  IF uncertainty is minor
    use best judgment
    continue without asking

  IF a reasonable default is available
    prefer the default when asking would add little value

  IF an assumption could materially change research quality
    ask a clarification question

  limit normal clarification to two focused rounds
  ask beyond two rounds only when a newly discovered contradiction or blocker prevents responsible continuation


## Purpose

WHEN researching an information topic
  investigate broadly enough to find useful, credible, distinct, and decision-relevant findings
  keep the research within a defined scope
  allow nearby findings when their connection to the topic is defensible
  collect enough evidence to evaluate retained findings
  look for alternatives, contradictions, limitations, and missing areas
  produce a structured synthesis rather than a collection of links


## Concepts

research type:
  the kind of investigation implied by the user's request and intended use

scope:
  the working definition of what the research includes, excludes, and tries to accomplish

scope dimension:
  one property of the scope that may affect how the research is performed

context-bound question:
  a clarification question whose answer could materially affect this specific research task

material ambiguity:
  missing or conflicting information where different reasonable interpretations would lead to meaningfully different research

default:
  an assumption selected using best judgment when asking the user would add less value than proceeding

candidate:
  a potentially useful claim, idea, approach, example, event, observation, or result discovered during research

finding:
  a candidate retained after enough evaluation to justify its place in the research set

evidence:
  source material and contextual detail that support, qualify, or contradict a finding

counter-evidence:
  evidence that weakens, limits, contradicts, or changes the interpretation of a finding

decision usefulness:
  how much a finding can change understanding, comparison, prioritization, testing, or another practical decision

scope lock:
  the point after clarification where the working scope is considered sufficient and research begins without further routine questioning


## Identify the research type

WHEN research begins
  identify what kind of research the request requires before checking missing scope information

  research types (guidance):
    - exploratory; discover ideas, possibilities, approaches, or patterns
    - comparative; compare known or discovered options
    - explanatory; establish how or why something works
    - historical; reconstruct events, development, or change over time
    - technical; investigate mechanisms, implementations, constraints, or performance
    - investigative; examine claims, events, evidence, explanations, or contradictions
    - decision-oriented; gather information needed to choose or prioritize
    - evidence-focused; establish what can be supported and how strongly
    - mixed; combine the relevant types when the task requires more than one

  do not force the request into one type when several types materially apply

  use the identified research type to determine which scope dimensions matter


## Extract existing scope

WHEN the research type has been identified
  extract every scope decision already present in the user's request

  explicit or strongly implied scope information (use when present):
    - research subject
    - research question
    - intended goal
    - desired findings
    - relevance boundary
    - breadth
    - depth
    - result size
    - evidence requirements
    - time range
    - geographic boundary
    - industry or technical domain
    - population or audience
    - exclusions
    - intended use
    - output requirements

  do not ask the user to repeat information already supplied

  IF a scope value is strongly implied and using it carries little risk
    treat it as part of the working scope

  IF an implication is weak and choosing incorrectly could materially affect the research
    mark it as a possible clarification


## Determine which scope dimensions matter

WHEN checking scope completeness
  evaluate scope dimensions according to the research type and request

  possible scope dimensions (context dependent):
    - subject; what is being researched
    - goal; what the research should discover, explain, compare, verify, or help decide
    - relevance; what qualifies as related enough to include
    - breadth; how widely to explore alternatives and adjacent material
    - depth; how much detail each retained finding needs
    - result size; how many findings or how much material is useful
    - evidence standard; what support a finding needs
    - time; whether age or recency changes relevance
    - geography; whether location changes applicability
    - domain; whether industry, technology, culture, population, or another domain boundary matters
    - exclusions; what should not be included
    - output; what form the final research must take

  FOR EACH possible scope dimension
    ASSESS whether it matters for this specific research task

    IF the dimension does not affect the research
      ignore it

    ELSE IF the user already specified it
      use the supplied value

    ELSE
      ASSESS whether a sensible default can be inferred

      IF a sensible default is available and choosing it has low cost
        use the default

      ELSE
        ASSESS whether different answers would materially change the research

        IF different answers would materially change the research
          mark the dimension as unresolved

        ELSE
          use best judgment
          continue


## Question-value test

WHEN considering whether to ask a clarification question
  ASSESS whether the question is necessary for the current research type

  IF the user already answered it
    do not ask

  IF the question concerns an irrelevant scope dimension
    do not ask

  IF the answer can be inferred with enough confidence for the task
    use the inference

  IF a reasonable default produces a useful result with little downside
    use the default

  IF different answers would produce essentially the same research
    do not ask

  IF the question would only satisfy a generic checklist
    do not ask

  IF one broader question can resolve several connected ambiguities
    ask the broader question

  IF choosing the wrong assumption could materially reduce research quality
    keep the question

  prefer fewer high-impact questions over complete questionnaires


## First clarification round

WHEN unresolved scope dimensions remain after the initial scope check
  ask the smallest set of questions needed to make the research direction reliable

  first-round question purposes (ask only when applicable):
    - goal; clarify what the research should help discover, understand, compare, verify, or decide
    - interpretation; resolve materially different meanings of the topic
    - relevance boundary; establish what kinds of findings belong in scope
    - breadth; establish whether adjacent and alternative approaches belong
    - evidence standard; establish the required strength of support when it changes inclusion
    - result size; establish expected breadth when size materially affects research depth
    - time boundary; establish a period when recency or history changes the answer
    - domain boundary; establish geography, industry, technology, population, or another boundary when it changes applicability
    - exclusion; clarify a likely category only when including it could distort the result

  FOR EACH question asked
    explain the choice briefly when the reason is not obvious
    provide a recommended answer or default
    base the recommendation on best judgment
    prefer the option most likely to produce useful research
    use a conservative default when an unsupported assumption could distort the result
    make it easy for the user to accept the recommendation

  do not ask every question in first-round question purposes
  ask only questions triggered by unresolved material ambiguity


## Re-evaluate scope

WHEN answers to the first clarification round are available
  reconstruct the working scope using:
    - the original request
    - information already inferred with confidence
    - first-round answers
    - accepted or implied defaults

  do not treat clarification answers as isolated additions
  reconsider the research task as a whole

  ASSESS whether the answers changed the research type

  IF the research type changed
    update which scope dimensions are relevant

  FOR EACH remaining ambiguity
    ASSESS whether it could still materially change:
      - discovery
      - evidence requirements
      - filtering
      - comparison
      - final synthesis

    IF it would not materially change these
      resolve it with best judgment

    ELSE
      keep it for the second clarification round


## Second clarification round

WHEN material ambiguity remains after re-evaluating the first answers
  ask only adjustment questions that are still necessary

  second-round question purposes (ask only when applicable):
    - breadth versus depth; decide whether to map more distinct approaches or investigate fewer findings more deeply
    - evidence depth; decide how much support each retained finding requires
    - adjacent distance; decide how far related ideas may move from the core topic
    - uncertain findings; decide whether weak but interesting signals should remain visible
    - counter-evidence; decide whether disputed or high-impact findings require stronger adversarial checking
    - comparison criteria; identify dimensions needed to compare findings when they became apparent only after initial clarification
    - result size; adjust the target when the first answers reveal that the original default would be too broad or too narrow
    - output emphasis; adjust the synthesis when the intended decision or use became clearer

  do not repeat questions from the first round
  do not ask adjustment questions that have no effect on the research

  FOR EACH question asked
    provide a recommended answer or default
    use best judgment
    state the recommendation briefly
    prefer continuation over unnecessary configuration


## Avoid annoying clarification

WHEN deciding whether clarification is complete
  unwanted questions (avoid):
    - questions already answered in the request
    - questions answered in an earlier clarification round
    - questions about irrelevant dimensions
    - questions whose answers would not alter the research
    - questions with an obvious low-risk default
    - multiple narrow questions that can be resolved by one broader question
    - requests for arbitrary preferences that the agent can choose competently
    - repeated confirmation of a scope that is already coherent
    - further clarification after two rounds when no real blocker remains

  useful questions (ask when needed):
    - questions that resolve materially different interpretations
    - questions that determine inclusion or exclusion
    - questions that change the evidence threshold
    - questions that materially change search breadth or depth
    - questions that change the decision the research is meant to support
    - questions that prevent a likely category error
    - questions required to resolve a contradiction in the user's instructions

  IF no useful question remains
    stop clarifying
    lock the scope


## Lock the working scope

WHEN clarification is complete
  establish a working scope

  working scope (include applicable values):
    - research question
    - research type
    - research goal
    - inclusion boundary
    - adjacent-search allowance
    - exclusion boundary
    - evidence standard
    - breadth
    - depth
    - result target
    - time boundary
    - geographic or domain boundary
    - intended use
    - output requirements

  use defaults for applicable values that were not worth asking about

  after scope lock
    do not reopen clarification for minor uncertainty

  IF research exposes a real contradiction or blocker that materially changes the task
    ask the minimum additional question required

  ELSE
    use best judgment
    continue


## Discover candidates

WHEN the scope is locked
  search broadly enough to cover the relevant research space

  candidate types (search when relevant):
    - direct approaches
    - alternative approaches
    - competing approaches
    - variations
    - adjacent approaches
    - analogous solutions
    - new mechanisms
    - combinations
    - scenarios
    - edge cases
    - failure modes
    - counterexamples
    - criticisms
    - tradeoffs
    - constraints
    - enabling conditions
    - emerging approaches
    - abandoned approaches
    - successful implementations
    - failed implementations

  use the research type and scope to decide which candidate types matter

  do not search every candidate type mechanically

  prefer coverage of distinct ideas over repeated examples of the same idea


## Extract findings

WHEN useful source material is found
  convert it into candidate findings

  FOR EACH candidate
    state one clear claim, idea, approach, example, event, observation, or result

    IF several sources describe the same underlying mechanism
      treat them as evidence for the same finding when appropriate

    IF a candidate duplicates an existing finding without adding useful evidence
      merge it

    IF a candidate introduces a meaningfully different mechanism, condition, result, or limitation
      keep it separate


## Build evidence

FOR EACH promising candidate
  collect enough evidence to understand the finding

  evidence packet (include when available and relevant):
    - claim
    - source
    - source type
    - specific supporting detail
    - context
    - mechanism
    - observed outcome
    - limitations
    - applicability
    - uncertainty
    - counter-evidence

  preserve concrete details that could affect later evaluation

  IF evidence is too weak to justify a strong claim
    preserve the uncertainty
    do not strengthen the claim


## Verify

FOR EACH candidate with collected evidence
  check whether the evidence supports the claim

  verification checks (apply when relevant):
    - trace the claim toward the original or near-original source
    - verify dates
    - verify definitions
    - verify measurements
    - verify context
    - distinguish independent sources from repeated reporting
    - compare conflicting sources
    - inspect whether evidence applies to the stated population, environment, or conditions
    - search for evidence that weakens important findings

  IF a source repeats another source without independent evidence
    do not count it as independent confirmation

  IF conflicting evidence remains credible
    preserve the disagreement
    explain the conditions that may account for the difference when supported


## Evaluate

WHEN a candidate has enough evidence for evaluation
  assess it against the dimensions relevant to the task

  evaluation dimensions (guidance):
    - relevance
    - evidence strength
    - source quality
    - distinctness
    - novelty
    - applicability
    - limitations
    - counter-evidence
    - comparison value
    - decision usefulness

  evidence levels (guidance):
    - signal; enough information to justify attention, not enough for a strong conclusion
    - supported; direct evidence establishes that the finding exists
    - substantiated; evidence supports the mechanism and observed outcome
    - decision-grade; evidence is sufficient to support a practical choice within the stated scope

  do not require every useful finding to reach the same evidence level

  preserve early signals when exploratory value justifies them
  label their uncertainty rather than presenting them as established findings


## Filter and group

WHEN candidates have been evaluated
  group findings by underlying meaning or mechanism

  keep a finding when:
    - it is relevant
    - its evidence is adequate for its stated evidence level
    - it adds a distinct idea, mechanism, condition, or useful evidence
    - it can affect understanding, comparison, testing, or a decision

  reject a finding when:
    - its relationship to the topic is too weak
    - its evidence does not support the claim
    - the source cannot be traced enough for the task
    - it duplicates another finding without adding value
    - it cannot affect any plausible research conclusion or decision

  defer a finding when:
    - it appears relevant
    - available evidence is insufficient
    - further research could reasonably change its disposition

  retain a short rejection or deferral reason when repeated rediscovery is likely


## Find gaps

WHEN an initial set of findings survives filtering
  inspect the set for missing research

  gap types (guidance):
    - important scope dimension with little evidence
    - plausible alternative not investigated
    - finding supported by only one weak source
    - missing counter-evidence
    - unresolved contradiction
    - missing failure case
    - missing comparison dimension
    - overrepresentation of one approach
    - unexplained uncertainty that affects a decision

  FOR EACH material gap
    research the gap directly
    update affected findings
    re-run verification and evaluation when new evidence changes them

  REPEAT UNTIL one of these conditions is met
    new searches mostly strengthen existing findings rather than reveal important new classes of findings
    remaining gaps do not materially affect the intended use
    available evidence is sufficient for the requested decision or synthesis
    further research is blocked by unavailable evidence


## Synthesize

WHEN the research set is sufficiently complete
  compare the surviving findings

  final synthesis should make clear, when relevant:
    - what was found
    - what supports each important finding
    - how findings differ
    - where each finding applies
    - what limits or contradicts it
    - which alternatives exist
    - what remains uncertain
    - what conclusions follow
    - what should be investigated, tested, compared, kept, or rejected next

  preserve unresolved uncertainty when the evidence does not support one answer

  do not hide research gaps inside confident prose

  prefer distinct findings with useful evidence over a large volume of repetitive material


## Research quality audit

WHEN synthesis appears complete
  ASSESS the research across applicable quality dimensions

  research quality dimensions (all relevant dimensions should pass):
    - relevance; retained findings stay within the working scope
    - evidence quality; important claims have enough support for their stated strength
    - diversity; the research contains genuinely different findings rather than repeated versions of one idea
    - coverage; important dimensions of the research problem were examined
    - counter-evidence; important findings were tested against conflicting evidence
    - decision usefulness; the research can change understanding or action
    - traceability; important claims can be followed back to supporting sources
    - uncertainty; confidence matches the available evidence

  REPEAT UNTIL material quality gaps are resolved or explicitly reported
    search missing areas
    strengthen weak evidence
    merge duplicates
    remove irrelevant findings
    calibrate claims
    preserve unresolved gaps


## Compact algorithm

WHEN given a research request
  identify the research type
  extract scope already supplied by the user
  determine which scope dimensions actually matter

  FOR EACH relevant missing scope dimension
    ASSESS whether a sensible default is sufficient

    IF a sensible default is sufficient
      use it

    ELSE IF the ambiguity could materially change the research
      mark it for clarification

  IF material ambiguity exists
    ask the smallest useful first clarification set
    provide a recommended default with every question
    reconstruct the scope from the request and answers

  IF material ambiguity still exists
    ask the smallest useful second clarification set
    provide a recommended default with every question
    reconstruct the scope again

  lock the scope
  discover candidates
  extract distinct findings
  build evidence packets
  verify claims and sources
  search for counter-evidence
  evaluate findings
  group duplicates
  keep, reject, or defer findings
  inspect coverage and evidence gaps
  research material gaps
  synthesize the surviving findings

  REPEAT UNTIL the research is sufficient for the intended use
    fill material gaps
    update evidence
    re-evaluate affected findings

  return the synthesis

## File content `text-transcript-task-create-executive-summary-from-video-subtitles-v2026-09-11.md`:

## SKILL Create Executive Summary from Technical Video Transcript

Language: uppercase words are structural keywords; text after them is free-form meaning; indentation defines scope; name
(sentiment): defines a list with indented - items; - item; example separates a pattern from a short example of its use.
Sentiment is guidance, not a ban. Built-ins: WHEN, IF, ELSE, FOR EACH, REPEAT UNTIL, PARALLEL, ASSESS, STOP.
DIRECTIVE defines a mandatory top-level instruction that governs how the skill is read and applied.
ASSESS instructs the agent to evaluate the stated property, question, meaning, or condition before continuing with instructions in its scope.
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

## Purpose

WHEN converting a technical video transcript into an executive summary
  produce a compact summary of the useful content
  let the reader understand the main conclusions, important comparisons, useful evidence, and practical recommendations without watching the source

  do not recap the video as media
  do not describe how the video opens, what the speaker says next, what appears on screen, or how the presentation is organized unless that information changes the meaning

  apply the existing Unslop skill to every intermediate rewrite
  apply the existing Unslop skill again to the final output

## Concepts

source:
  the material provided to this skill

output:
  the final executive summary produced by this skill

claim:
  a conclusion, comparison, judgment, recommendation, or factual assertion made in the transcript

evidence:
  a concrete example, measurement, experiment, observed result, or case that supports a claim

context:
  information needed to understand a claim

source context:
  information about the video, transcript, speaker, recording, presentation, or delivery rather than the subject itself

technical term:
  a model name, product name, benchmark, API, library, framework, protocol, command, metric, company name, or other domain-specific identifier whose spelling affects meaning

decision value:
  how much a piece of information changes the reader's understanding, choice, or expected action

## Input

WHEN given one technical video transcript

  transcript content (neutral examples):
    - automatic transcription errors
    - repeated words
    - false starts
    - jokes
    - profanity
    - sponsor segments
    - calls to action
    - on-screen narration
    - audience interaction
    - tangents
    - personal anecdotes
    - benchmark results
    - demonstrations
    - opinions
    - technical terminology
    - inconsistent spellings of the same technical term
    - duplicated explanations
    - conclusions that appear only near the end

  do not assume the transcript is technically exact
  do not assume every statement deserves space in the output
  do not add outside facts unless the user explicitly asks for research or verification

## Output

WHEN producing the output
  produce a compact executive summary

  required content (include when supported):
    - main subjects
    - most important conclusions
    - important differences or tradeoffs
    - evidence that materially supports those conclusions
    - practical recommendation when the transcript contains one

  include enough detail for the reader to understand the useful content without consuming the original source
  do not preserve transcript order, pacing, personality, or full coverage

  prefer approximately 5 to 9 substantive paragraphs when the source contains enough meaningful material
  allow a shorter result when the source contains fewer meaningful conclusions

  do not target a fixed percentage of the transcript
  target information density

## Core inclusion rule

WHEN deciding whether something belongs in the output
  ASSESS whether removing it would materially reduce the reader's understanding of the subject, conclusions, evidence, tradeoffs, or recommendation

  IF removing it changes little
    exclude it

  IF removing it makes an important conclusion unsupported or ambiguous
    keep the minimum information needed

## Establish the actual subject

WHEN processing begins
  read enough of the transcript to identify the real subject before summarizing
  do not assume the opening sentences describe the actual subject

  subject signals (important):
    - entities being discussed
    - decisions being evaluated
    - recurring comparison dimensions
    - final recommendation when one exists

  IF the opening contains jokes, fake topics, sponsor material, or conversational setup
    do not treat them as the subject

  REPEAT UNTIL the subject can be stated without referring to the video itself
    refine the subject

subject examples (guidance):
  - weak; The video discusses two new AI models and compares their capabilities.
  - useful; Fable 5.1 is more reliable for production coding, while GPT-6 Astra is stronger at computer use, 3D work, large agent workflows, and token efficiency.

## Normalize technical terminology

WHEN technical terms appear
  collect important variants before writing the summary

  FOR EACH important technical term
    inspect how it appears across the transcript

    IF one spelling is clearly the intended canonical form from the transcript and surrounding context
      normalize all variants to that form

    IF several forms remain genuinely ambiguous
      do not invent a correction
      preserve the most defensible form
      or mark the term as uncertain when the distinction affects the summary

  treat technical naming errors as high-cost errors

  technical values (high risk to rewrite):
    - model names
    - version numbers
    - benchmark names
    - prices
    - percentages
    - token counts
    - API names
    - framework names
    - commands

  IF a number or term cannot be established reliably
    omit it unless it is necessary to understand the conclusion

  IF an unreliable number or term is necessary to understand the conclusion
    qualify the uncertainty explicitly

  do not reproduce obvious transcription variants once the canonical term has been established

## Remove source context

WHEN scanning the transcript
  classify source context separately from subject matter

  source-context phrases (usually remove):
    - in this video
    - today I want to talk about
    - we're going to compare
    - later we'll discuss
    - let's move on
    - as you can see
    - I'm moving this window
    - chat is saying
    - viewers probably came here for
    - subscribe to
    - watch my other video
    - I'll cover that later
    - this section of the video
    - the speaker explains
    - the transcript says

  IF source context does not affect a conclusion
    remove it

  IF the speaker's personal experience is evidence for a conclusion
    keep the experience
    remove the media framing around it

source-context examples (guidance):
  - source-framed; In this video, the speaker explains that Fable pull requests usually require fewer corrections.
  - content-first; Fable pull requests usually require fewer correction rounds before merge.

## Remove presentation mechanics

WHEN the transcript describes what is happening during recording

  presentation mechanics (usually remove):
    - window movement
    - screen arrangement
    - cursor actions
    - searching for something on screen
    - interruptions from chat
    - jokes about editing
    - remarks about the recording
    - transitions between sections
    - commentary about what the audience can currently see

  IF an on-screen action contains actual evidence
    keep the evidence
    remove the narration mechanics

presentation examples (guidance):
  - raw; I'm moving this over so you guys can see it. Look here. This one took 12 seconds and this one took 21 seconds.
  - retained; Two review agents completed their checks in 12 and 21 seconds.

## Remove entertainment and retention material

WHEN scanning the transcript
  remove material whose main purpose is entertainment, personality, pacing, or audience retention

  retention material (usually remove):
    - opening jokes
    - fake-outs
    - exaggerated transitions
    - repeated profanity used only for emphasis
    - suspense before ordinary information
    - podcast promotion
    - channel promotion
    - requests to subscribe
    - references to future videos
    - memes
    - audience banter

  IF a joke contains a real judgment
    keep the judgment
    remove the joke

  IF emotional language communicates the severity of a failure
    translate it into the concrete failure

entertainment examples (guidance):
  - raw; This was one of the stupidest things I've ever seen a model do.
  - retained; Astra ignored the requested revert, changed unrelated configuration, and merged without restoring the requested behavior.

## Isolate sponsored content

WHEN sponsored material appears
  ASSESS whether it contributes to the subject the reader asked to understand

  IF it is independent advertising
    remove it

  IF the sponsored product is itself used as evidence in the main argument
    keep only the relevant mechanism or result
    remove promotional claims and calls to action

  do not give sponsor material space merely because it occupies a large part of the transcript

## Extract claims before writing prose

WHEN the transcript has been cleaned conceptually
  extract claims without trying to preserve transcript order

  FOR EACH candidate claim
    rewrite it as one concrete sentence

  useful claim types (good examples):
    - production reliability; model A is more reliable for production coding
    - token use; model B uses fewer tokens for comparable tasks
    - shared capability; both models understand full-stack applications
    - orchestration; model B is better at multi-agent orchestration
    - UI preservation; model A preserves existing UI more reliably

  remove candidate claims that only express mood
  remove candidate claims that duplicate a stronger claim
  merge claims that describe the same underlying distinction

## Attach evidence

FOR EACH remaining claim
  look for evidence in the transcript

  evidence priority (highest first):
    - measured real-world results
    - repeated observed behavior
    - controlled or near-controlled comparisons
    - concrete failure or success cases
    - benchmark results
    - speaker judgment without supporting example

  IF several examples prove the same point
    keep the strongest one
    or combine them into one short statement

  IF a numeric example materially changes the reader's understanding
    keep the number

  IF the number merely decorates a conclusion already understood
    remove it

  IF the transcript gives a conclusion without enough evidence
    report it as the speaker's assessment when useful
    do not upgrade it into an objective fact

## Separate capability from reliability

WHEN comparing technical systems

  comparison dimensions (keep distinct):
    - best-case capability
    - consistent behavior
    - required supervision
    - cost of obtaining the result
    - safety of using the result

  do not collapse these dimensions into one better-or-worse judgment

  IF one system has a higher ceiling and another has a higher floor
    preserve that distinction

  IF a system produces stronger demonstrations but requires more correction
    state both facts

  IF a system is cheaper but creates more review work
    state both facts when both affect the recommendation

## Rank findings by decision value

WHEN all claims and evidence have been collected
  assign decision value to each

  high decision value (usually keep):
    - final recommendation
    - strongest tradeoff
    - major capability gap
    - major reliability gap
    - major cost difference
    - evidence that changes how the reader should choose

  medium decision value (keep when useful):
    - secondary capability differences
    - representative examples
    - implementation details that explain a major conclusion

  low decision value (usually remove):
    - repeated demonstrations
    - minor preferences
    - speculative explanations
    - entertaining examples
    - historical comparisons
    - side observations
    - details that do not affect the final choice

  keep high decision-value information
  keep medium decision-value information only when needed to understand or support high-value information
  remove low decision-value information

## Compress examples into findings

WHEN an example takes many transcript lines
  identify what the example proves

  information to preserve (important):
    - starting condition
    - relevant behavior
    - result
    - conclusion

  source mechanics (usually remove):
    - every intermediate click
    - every failed command
    - every repeated correction
    - every conversational reaction

compression examples (guidance):
  - long source event; Astra was asked to restore a UI behavior, edited unrelated files, started the wrong server, changed configuration, failed to restore the behavior, and eventually merged the incomplete work. Fable received nearly the same task and restored the original behavior with minimal correction.
  - executive-summary form; Fable handled intent more reliably in a regression test. Astra failed to restore the requested UI behavior despite several corrections, while Fable located the responsible change and restored it from essentially the same request.

## Convert first-person experience into useful evidence

WHEN the transcript relies on personal experience
  preserve the experience only when it supports a useful conclusion
  remove autobiographical details that do not affect the result

  IF first person is needed to preserve the status of a subjective judgment
    use it sparingly

  ELSE
    write the conclusion directly

  IF the desired summary should sound as though the original speaker wrote it
    first person may remain

  IF the desired summary is neutral
    convert first-person experience into attributed evidence only when attribution matters

first-person examples (guidance):
  - raw; I bought another Mac Mini because I've been using computer use so much.
  - compressed; Astra's computer-use capability was useful enough in the speaker's workflow to justify a dedicated machine.

## Remove transcript chronology

WHEN organizing the output
  do not follow the order in which topics appear in the transcript
  group related findings
  prefer an order based on reader value

  typical order (guidance):
    - primary conclusion
    - main tradeoff
    - strongest capability differences
    - reliability or workflow differences
    - cost
    - practical recommendation

  IF another order makes the decision easier to understand
    use that order

## Write the first executive-summary draft

WHEN enough high-value information remains
  write a complete draft
  start with the strongest useful distinction
  state the subject directly

  openings (usually bad examples):
    - In this video
    - This video covers
    - The speaker discusses
    - The transcript compares
    - This content is about
    - Today
    - First
    - The main topic of the video is

opening examples (guidance):
  - weak; In this video, the speaker compares Fable 5.1 and GPT-6 Astra.
  - preferred; Fable 5.1 is the stronger choice for reliable production coding, while GPT-6 Astra is better suited to computer use, 3D work, large agent workflows, and workloads where token efficiency matters.

## Reduce detailed summary into executive summary

WHEN the first draft is complete
  assume it is still too detailed

  FOR EACH paragraph
    ASSESS whether it introduces a major conclusion
    ASSESS whether it explains an important tradeoff
    ASSESS whether it provides necessary evidence
    ASSESS whether it materially affects the recommendation

    IF none apply
      remove the paragraph

  FOR EACH example
    IF the conclusion survives without it
      remove the example

    ELSE
      shorten the example to the minimum evidence required

  FOR EACH number
    IF the number does not change the reader's interpretation
      remove it

  FOR EACH secondary topic
    IF the reader does not need it to understand what is useful in the source
      remove it

  preserve enough evidence that the result does not become a vague list of opinions

## Remove source context introduced during rewriting

WHEN the draft has been compressed
  scan for information introduced during summarization that still describes the source rather than the subject

  source-framing phrases (usually remove):
    - the speaker's conclusion is
    - the video ultimately argues
    - one section covers
    - another example shown in the video
    - later in the discussion
    - throughout the transcript
    - the creator demonstrates

  IF attribution is needed because the claim is subjective
    attribute only that claim
    do not frame the whole paragraph around the source

## Preserve calibrated certainty

WHEN rewriting claims
  preserve the strength of the evidence

  IF the transcript reports personal experience
    do not convert it into a universal fact

  IF a benchmark is cited
    do not imply it proves all real-world performance

  IF the speaker speculates about why something happened
    remove the speculation
    or identify it as speculation

  IF a recommendation depends on the speaker's workload
    preserve that dependency when it affects generalization

certainty examples (guidance):
  - too strong; Astra gives four times more work for the same price.
  - calibrated; In the speaker's workload, Astra and Codex felt roughly four times more productive at the same subscription tier.

## Preserve useful asymmetry

WHEN two systems are being compared
  do not force a balanced structure

  IF one system clearly wins a category
    say so

  IF one category is much more important than another
    give it more space

  IF one side has three important advantages and the other has one
    do not manufacture equal numbers of advantages

  organize around the evidence, not symmetry

## Produce the practical decision rule

WHEN the source contains enough information to support a recommendation
  convert the conclusions into a short decision rule

  decision forms (preferred):
    - use A when...
    - use B when...
    - if only one must be chosen...

  include only conditions supported by the source
  do not invent user personas merely to make the recommendation look complete

decision-rule examples (good examples):
  - model choice; Use Fable 5.1 when the priority is reliable production code and focused pull requests. Use GPT-6 Astra when the priority is computer control, 3D work, large agent workflows, difficult investigations, or lower token consumption.

## Apply the Unslop skill

WHEN the content structure is correct
  apply the existing Unslop skill to the entire draft

  content to preserve (important):
    - technical precision
    - evidence
    - uncertainty
    - useful distinctions
    - numbers that survived the importance filter

  writing patterns to remove (usually bad):
    - generic introductions
    - promotional language
    - AI vocabulary
    - meta signposting
    - rhetorical contrast that adds no information
    - repetitive conclusions
    - filler
    - vague praise
    - manufactured emphasis
    - repeated synonyms
    - mechanical paragraph structure

  do not allow the Unslop transformation to weaken technical distinctions
  do not replace precise terminology with simpler but incorrect terminology

## Final information-density audit

WHEN the rewritten summary appears complete
  read it as someone who has not seen the source

  required audit conditions (all required):
    - the reader can identify the main subject immediately
    - the reader can identify the main conclusion
    - the reader can understand the important tradeoffs
    - enough evidence remains to explain why the conclusions were included
    - the reader can tell what is practically useful
    - every remaining paragraph contributes meaningful understanding

  REPEAT UNTIL each remaining paragraph earns its place
    remove low-value context
    merge overlapping claims
    shorten examples
    remove repeated conclusions
    remove media framing
    correct terminology
    apply the Unslop skill again

## Final technical audit

WHEN the content audit passes
  scan technical terms separately from prose

  FOR EACH technical term
    verify consistent spelling
    verify version number
    verify capitalization
    verify that different products were not accidentally merged
    verify that transcript errors were not copied into the summary

  FOR EACH retained number
    verify it against the transcript
    verify its unit
    verify what it measures
    verify that the comparison is stated correctly

  IF a technical detail cannot be verified from the source
    remove it
    or explicitly qualify it

  never allow stylistic confidence to hide technical uncertainty

## Final output test

WHEN preparing the final output

  output requirements (all required):
    - first sentence contains useful subject matter rather than source framing
    - summary can be understood without knowing that the source was a video
    - sponsor material is absent unless it materially supports the subject
    - jokes, transitions, screen narration, and audience interaction are absent
    - repeated examples have been collapsed
    - most important comparisons remain
    - important evidence remains
    - technical terminology is consistent
    - subjective claims remain calibrated
    - recommendation follows from the retained evidence
    - no paragraph exists merely because the transcript spent a long time on that topic
    - result is substantially shorter than a detailed summary
    - result still contains enough information to understand what is worth knowing from the source
    - Unslop skill has been applied after all substantive compression

## Compact algorithm

WHEN given a technical transcript
  identify the real subject
  normalize reliable technical terms
  remove source context
  remove presentation mechanics
  remove entertainment and sponsor material that does not affect the subject
  extract claims
  attach the strongest evidence
  distinguish capability, consistency, supervision, cost, and safe use
  rank information by decision value
  discard low-value material
  group findings by meaning instead of transcript order
  write a detailed content-first summary
  compress the detailed summary into an executive summary
  remove source framing introduced during rewriting
  preserve uncertainty and technical precision
  derive the practical decision rule
  apply the Unslop skill
  audit terminology and numbers

  REPEAT UNTIL removing another sentence would remove useful understanding
    compress again

  return the output

## File content `text-writing-trait-no-llm-slop-v2026-09-11.md`:

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

## File content `text-writing-trait-no-weasel-words-v2026-09-12.md`:

## SKILL Lexical Padding Reduction

Language: uppercase words are structural keywords; text after them is free-form meaning; indentation defines scope; name
(sentiment): defines a list with indented - items; - item; example separates a pattern from a short example of its use.
Sentiment is guidance, not a ban. Built-ins: WHEN, IF, ELSE, FOR EACH, REPEAT UNTIL, PARALLEL, ASSESS, STOP.
DIRECTIVE defines a mandatory top-level instruction that governs how the skill is read and applied.
ASSESS instructs the agent to evaluate the stated property, question, meaning, or condition before continuing with instructions in its scope.
REMARK defines a non-executable note for attribution, provenance, rationale, or other information that must not be interpreted as a rule.
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
  remove lexical padding that adds little or no information
  remove unsupported intensifiers, judgments, and vague quantities
  remove mechanical filler when the sentence works without it
  preserve meaningful qualification and uncertainty
  preserve the original meaning
  preserve the intended tone
  prefer concrete information over impression

## Definitions

weasel words:
  words or phrases that add emphasis, judgment, quantity, certainty, technical flavor, or rhetorical force without adding enough information to justify them

word padding:
  words or phrases that make a sentence longer without materially changing its meaning, precision, logic, or necessary tone

mechanical filler:
  reusable wording that organizes, emphasizes, introduces, or closes a statement without contributing useful content

beholder words:
  words that instruct the reader how to judge or react to a fact instead of presenting the fact and letting the evidence support the judgment

lazy quantity words:
  approximate quantity or degree words used where a count, percentage, measurement, range, or concrete comparison would communicate more information

intensifiers:
  words that increase apparent strength or degree without necessarily adding measurable information

useful qualifier:
  a word or phrase that preserves real uncertainty, scope, probability, comparison, statistical meaning, or another distinction that would be lost if removed

## Named lists

salt and pepper words (usually bad examples):
  - various; We used various methods to isolate four samples
  - a number of; A number of failures occurred
  - fairly; The operation is fairly expensive
  - quite; It is quite difficult to reproduce

beholder words (usually bad examples):
  - interestingly; Interestingly, the two implementations produce the same result
  - surprisingly; Surprisingly, false positives were low
  - remarkably; Remarkably, the service remained available
  - clearly; Clearly, this approach is better

lazy quantity words (context dependent):
  - very; The outputs are very similar
  - extremely; The operation is extremely expensive
  - exceedingly; The failure is exceedingly rare
  - several; Several requests failed
  - many; Many requests failed
  - most; Most requests succeeded
  - few; Few requests failed
  - vast; The system processes a vast number of records
  - huge; The change produced a huge improvement
  - tiny; The operation has a tiny cost

additional weasel candidates (context dependent):
  - mostly; The implementation is mostly correct
  - largely; The behavior is largely unchanged
  - relatively; The operation is relatively fast
  - completely; The implementations are completely different
  - significantly; Performance improved significantly
  - substantially; Memory usage decreased substantially
  - excellent; The system provides excellent performance

weak intensifiers (usually bad examples):
  - very; very slow
  - extremely; extremely important
  - exceedingly; exceedingly difficult
  - quite; quite large
  - fairly; fairly simple
  - remarkably; remarkably effective
  - substantially when unmeasured; substantially faster
  - significantly when unmeasured; significantly better
  - completely when unnecessary; completely different

reader-directed judgments (usually bad examples):
  - clearly; Clearly, this is incorrect
  - obviously; Obviously, the caller owns the state
  - naturally; Naturally, this produces a faster result
  - evidently; Evidently, the cache is stale
  - unsurprisingly; Unsurprisingly, latency increased
  - interestingly; Interestingly, both values are equal
  - surprisingly; Surprisingly, both values are equal
  - remarkably; Remarkably, no requests failed

importance padding (usually bad examples):
  - importantly; Importantly, retries are disabled
  - crucially; Crucially, validation runs first
  - most importantly; Most importantly, the caller owns the state
  - it is important to note that; It is important to note that retries are disabled
  - it should be noted that; It should be noted that this file is generated
  - worth noting; It is worth noting that this value is optional
  - worth mentioning; It is worth mentioning that the API is unstable
  - worth stating; It is worth stating that the operation is destructive
  - note that; Note that the file is generated
  - notice that; Notice that both values are equal

meta padding (usually bad examples):
  - the key point is; The key point is that ownership remains with the caller
  - the important point is; The important point is that validation runs first
  - the main thing is; The main thing is that the cache never expires
  - the thing to remember is; The thing to remember is that retries are disabled
  - to be clear; To be clear, this does not persist data
  - in other words when merely repeating; In other words, the caller owns the state
  - put differently when merely repeating; Put differently, the caller owns the lifecycle
  - as mentioned above; As mentioned above, the file is generated
  - as previously noted; As previously noted, retries are disabled

purpose padding (preferred replacements):
  - in order to -> to; in order to reduce latency -> to reduce latency
  - for the purpose of -> to; for the purpose of validating input -> to validate input
  - with the goal of -> to when purpose is direct; with the goal of reducing allocations -> to reduce allocations

causal padding (preferred replacements):
  - due to the fact that -> because; it failed due to the fact that the token expired -> it failed because the token expired
  - owing to the fact that -> because; owing to the fact that the file was missing -> because the file was missing
  - on account of the fact that -> because; on account of the fact that validation failed -> because validation failed

conditional padding (preferred replacements):
  - in the event that -> if; in the event that the request fails -> if the request fails
  - in cases where -> when or if; in cases where the value is absent -> when the value is absent
  - under circumstances in which -> when; under circumstances in which retries are disabled -> when retries are disabled

quantity padding (preferred replacements):
  - a number of -> name the number when known; a number of tests failed -> 4 tests failed
  - many -> name the count or percentage when known; many requests failed -> 38% of requests failed
  - most -> name the percentage when known; most requests succeeded -> 94% of requests succeeded
  - few -> name the count or percentage when known; few requests failed -> 3 of 800 requests failed
  - several -> name the count when known; several workers restarted -> 6 workers restarted

degree padding (preferred replacements):
  - very -> remove or measure; very slow -> 420 ms slower
  - extremely -> remove or measure; extremely rare -> occurred in 2 of 1,000,000 requests
  - significantly -> measure when the meaning is magnitude; significantly faster -> 31% faster
  - substantially -> measure when possible; substantially less memory -> 180 MB less memory
  - relatively -> name the comparison; relatively fast -> faster than the previous implementation
  - huge -> measure; huge reduction -> 68% reduction
  - tiny -> measure; tiny increase -> 0.3% increase

filler replacements (preferred replacements):
  - utilize -> use; utilize the cache -> use the cache
  - leverage when it only means use -> use; leverage the API -> use the API
  - numerous -> many or a number when known; numerous failures -> 14 failures
  - it is important to note that -> remove; It is important to note that retries are disabled -> Retries are disabled
  - it should be noted that -> remove; It should be noted that this file is generated -> This file is generated
  - note that -> remove when it only introduces a fact; Note that retries are disabled -> Retries are disabled
  - notice that -> remove when it only introduces a fact; Notice that both values are equal -> Both values are equal

concrete replacements (good examples):
  - false positives were low (3%); replaces surprisingly low
  - median latency fell from 240 ms to 165 ms; replaces significantly faster
  - 17 of 20 tests passed; replaces most tests passed
  - 4 workers restarted; replaces several workers restarted
  - the cache reduced database reads by 42%; replaces the cache helped substantially
  - the two outputs differ in 3 fields; replaces the outputs are very different

## Process

WHEN editing begins
  read the complete text before changing individual sentences
  scan for every named list and pattern in this skill

  FOR EACH candidate found
    ASSESS what information the word or phrase contributes

    IF removing it preserves the same claim, scope, uncertainty, and tone
      remove it

    ELSE
      ASSESS whether a concrete replacement communicates the same meaning more precisely

      IF a concrete replacement is available
        use the concrete replacement

      ELSE
        keep the wording when it carries necessary meaning

  inspect the complete result again

  REPEAT UNTIL no unnecessary lexical padding remains
    remove remaining filler
    preserve useful qualifiers
    preserve necessary uncertainty
    preserve concrete details

## Information test

WHEN deciding whether a word is padding

  IF removing the word does not change the factual claim, scope, uncertainty, or intended tone
    treat the word as a candidate for removal

  ASSESS whether the word communicates measurable quantity or degree

  IF a measurement is available
    prefer the measurement

  ASSESS whether the word communicates necessary uncertainty

  IF removing the word would make the claim more certain than the evidence allows
    keep or replace the qualifier with the smallest accurate qualifier

  ASSESS whether the word identifies a real comparison

  IF the comparison is meaningful
    name the comparison explicitly when practical

  ASSESS whether the word carries domain-specific meaning

  IF the word has a precise technical, statistical, legal, scientific, or other domain meaning
    preserve that meaning
    do not remove it merely because the same word can be filler elsewhere

## Salt and pepper patterns

WHEN scanning for salt and pepper words

  FOR EACH matching phrase in salt and pepper words
    ASSESS whether it contributes necessary information

    IF it contributes no necessary information
      remove it

  IF various modifies a set whose members can be named
    name the relevant members

  IF various adds nothing beyond plurality
    remove it

  IF a number of refers to a known number
    state the number

  IF fairly or quite only weakens or strengthens an adjective
    remove it

  IF the degree matters
    replace the modifier with a measurement or concrete comparison when available

## Beholder patterns

WHEN scanning for beholder words

  FOR EACH matching phrase in beholder words
    do not instruct the reader how to react to the fact

  IF the word can be removed without changing the factual statement
    remove it

  IF the reaction genuinely belongs to the author
    express the reaction as the author's reaction only when the intended tone permits it

  IF a fact explains the reaction
    include the fact

  prefer false positives were 3% over surprisingly, false positives were low

  prefer both implementations return the same value over interestingly, both implementations return the same value

  IF clearly or obviously introduces a claim
    remove the judgment
    provide the reasoning or evidence when the claim is not self-evident

## Quantity patterns

WHEN scanning vague quantities

  FOR EACH matching phrase in lazy quantity words
    ASSESS whether an available count, percentage, rate, range, distribution, or measurement expresses the quantity more precisely

    IF a concrete value is available
      use it

    ELSE
      keep the smallest accurate quantity word when approximation is necessary

  IF many refers to a known count
    state the count

  IF most refers to a known proportion
    state the proportion

  IF few refers to a known count or rate
    state the count or rate

  IF several refers to a known count
    state the count

  IF vast, huge, or tiny describes measurable scale
    give the scale when available

  do not invent measurements that the source does not provide

## Intensifier patterns

WHEN scanning intensifiers

  FOR EACH matching phrase in weak intensifiers
    ASSESS whether the intensifier changes useful meaning

    IF it only adds emotional force
      remove it

    IF degree matters and can be measured
      give the measurement

  IF very modifies an adjective or adverb
    remove very
    or replace the phrase with a more precise fact

  IF extremely modifies an adjective or adverb
    remove extremely
    or quantify the extreme condition

  IF completely means total coverage or a true binary state
    keep it when the distinction matters

  ELSE
    remove it when it only intensifies

## Adverb patterns

WHEN scanning adverbs
  treat adverbs as review candidates, not automatic errors

  IF an adverb merely intensifies a weak adjective or verb
    remove the adverb
    strengthen the statement with a concrete fact when possible

  IF an adverb communicates manner, timing, probability, scope, or another necessary distinction
    keep it

  IF removing an adverb changes the claim
    do not remove it solely because it is an adverb

  IF an adverb expresses an unmeasured judgment
    replace it with evidence when available

## Statistical language

WHEN scanning words that can have statistical meaning

  IF significantly refers to statistical significance
    preserve the statistical meaning
    include the relevant statistical result when available

  ELSE IF significantly only means by a large amount
    provide the measured change when available
    otherwise use a more accurate description

  IF relatively identifies a defined comparison or mathematical relation
    preserve it

  ELSE IF relatively merely weakens an adjective
    name the comparison
    or remove it

## Mechanical filler patterns

WHEN scanning mechanical filler

  IF the text contains something from importance padding
    remove the introductory label
    state the information directly

  IF the text contains something from meta padding
    remove the framing when the following statement works without it

  IF the text says note that or notice that only to introduce information
    remove the phrase

  IF a reformulation repeats the previous sentence without adding information
    keep the clearer version

  IF a transition exists only to make the prose appear formally connected
    remove it when the logical relationship remains clear

  IF a sentence announces that a point is important
    show the importance through its consequence, measurement, constraint, or instruction instead

## Hedge patterns

WHEN scanning uncertainty

  IF multiple hedges express the same uncertainty
    reduce them to the smallest accurate hedge

  prefer may over may possibly when both mean the same thing

  prefer can over can potentially when potentiality adds nothing

  IF approximately, about, roughly, or nearly communicates real measurement uncertainty
    keep it

  IF removing a hedge would strengthen the claim beyond available evidence
    keep the hedge

  never trade concision for false certainty

## Replacement safety

WHEN replacing or removing a candidate

  preserve negation
  preserve modality
  preserve uncertainty
  preserve comparison
  preserve quantity when known
  preserve statistical meaning
  preserve causal meaning
  preserve domain-specific terminology

  IF the replacement changes the strength of the claim
    do not use it

  IF removing a word changes who, what, when, where, why, how much, how often, or how certain
    ASSESS whether that information is necessary

    IF necessary
      keep it
      or express it more concretely

## Plain speech

WHEN rewriting after padding removal

  prefer the shortest wording that preserves the complete meaning

  IF a phrase can be replaced by one ordinary word without losing meaning
    use the ordinary word

  FOR EACH matching phrase in purpose padding
    apply its replacement when meaning is preserved

  FOR EACH matching phrase in causal padding
    apply its replacement when meaning is preserved

  FOR EACH matching phrase in conditional padding
    apply its replacement when meaning is preserved

  FOR EACH matching phrase in filler replacements
    apply its replacement when meaning is preserved

  IF an adjective or adverb makes a measurable claim
    provide the measurement when available

  IF a vague quantity can be made concrete
    make it concrete

  IF the source does not provide enough information to make the statement more concrete
    do not invent precision

## Final audit

WHEN the rewrite appears complete
  read the entire result as finished writing

  ASSESS whether any remaining words add apparent authority, certainty, importance, magnitude, judgment, or technical sophistication without adding corresponding information

  ASSESS whether vague quantities can be replaced with available measurements

  ASSESS whether introductory phrases can be deleted without changing the sentence

  ASSESS whether intensifiers strengthen tone without strengthening meaning

  ASSESS whether judgments tell the reader how to react instead of presenting evidence

  ASSESS whether repeated hedges remain
  ASSESS whether mechanical transitions remain
  ASSESS whether unnecessary adverbs remain

  REPEAT UNTIL the remaining wording is concise and information-dense
    remove unnecessary padding
    replace vague wording with concrete facts when available
    preserve useful qualifiers
    preserve necessary uncertainty
    preserve domain-specific meaning
    preserve the intended tone
    preserve the original claim
    do not invent precision

REMARK source and attribution
  this skill is based in part on Matt Might's article "Kill weasel words, avoid the passive, eliminate duplicates"
  source: https://matt.might.net/articles/shell-scripts-for-passive-voice-weasel-words-duplicates/
  the article defines weasel words as wording that sounds useful without conveying enough information and identifies salt and pepper words, beholder words, and lazy words as recurring categories
  the source list and examples were adapted and extended here into a self-contained rule system for detecting lexical padding while preserving meaningful qualification


