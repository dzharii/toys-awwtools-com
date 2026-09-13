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