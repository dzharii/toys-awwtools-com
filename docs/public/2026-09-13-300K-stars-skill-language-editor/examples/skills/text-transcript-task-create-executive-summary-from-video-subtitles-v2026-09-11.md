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