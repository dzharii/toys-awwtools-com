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