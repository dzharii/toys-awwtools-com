# Saturation talk field experiments

These ten workflows test whether one shared video-extraction corpus can support materially different, publishable outcomes. Every experiment begins from `source-extraction/saturation-how-software-fails-at-scale`; no experiment reads, copies, or stylistically extends another experiment's output.

## Clean-room protocol

1. Use only the shared transcript, timestamp relationships, media metadata, and sampled frames as local source material.
2. Copy only the specific source frames needed by an experiment into that experiment's `assets` directory.
3. Record the inputs, method, output, review findings, and good-enough decision in `experiment-summary.json` and `review.md`.
4. Treat transcript wording as evidence, not automatically as correct spelling or factual authority. Preserve exact wording only in explicitly marked quotations.
5. Research is allowed only where the experiment says so. Research sources belong to that experiment and are not inherited by later experiments.

## Workflows

| ID | Folder | Independent workflow | Principal deliverable |
|---|---|---|---|
| 01 | `experiment-01-faithful-talk-companion` | Reconstruct the talk's argument as a detailed, illustrated technical article; review every section against timestamped source passages. | Self-contained HTML talk companion |
| 02 | `experiment-02-researched-field-guide` | Rebuild the article from raw source, then investigate the named ideas and operational mechanisms using primary sources; prune research that does not clarify the talk. | Citation-rich HTML field guide |
| 03 | `experiment-03-concept-map` | Code claims and examples into concepts and relations, audit every edge against timestamps, then render an explorable systems map. | Interactive HTML concept map plus relation data |
| 04 | `experiment-04-tabletop-workshop` | Convert failure mechanisms into a staged incident simulation with injects, decisions, evidence, and debrief criteria. | Facilitator-ready tabletop workshop |
| 05 | `experiment-05-saturation-runbook` | Translate the talk into an operational detect-diagnose-mitigate-prevent workflow with observable signals and escalation gates. | Production-oriented HTML runbook |
| 06 | `experiment-06-teaching-kit` | Identify learning objectives, construct a lesson sequence, design exercises, and validate questions and answers against the source. | Instructor lesson, exercises, quiz, and answer key |
| 07 | `experiment-07-executive-brief` | Reframe technical mechanisms as organizational risks, investment decisions, and questions leaders can use in reviews. | Concise engineering-leadership decision brief |
| 08 | `experiment-08-claim-audit` | Extract material claims, distinguish observation/analogy/causal claim, document support and assumptions, and state what would weaken each claim. | Timestamped skeptical peer review and claim matrix |
| 09 | `experiment-09-publishing-kit` | Select source-grounded angles and independently adapt them for multiple publishing surfaces while preventing quote drift and repetition. | Newsletter, short posts, quote cards, and editorial checklist |
| 10 | `experiment-10-transcript-navigator` | Transform raw segments, themes, frames, and timestamp links into a searchable, filterable reading interface. | Self-contained interactive HTML navigator |

## Reusable agent skills

Experiments 01, 02, and 10 have independent, self-contained skills for recreating their successful workflows from an arbitrary Transcript Organizer extraction folder:

- [Create a Faithful Video Companion](../prompts/2026-08-01_create-faithful-video-companion/SKILL.md) generalizes Experiment 01's source-only illustrated article.
- [Build a Researched Video Field Guide](../prompts/2026-08-01_build-researched-video-field-guide/SKILL.md) generalizes Experiment 02's primary-source enrichment and editorial pruning workflow.
- [Build a Searchable Transcript Navigator](../prompts/2026-08-01_build-searchable-transcript-navigator/SKILL.md) generalizes Experiment 10's complete offline search interface.

Each skill includes the full corpus tree and schemas, so it does not depend on this README, this talk, or another experiment folder.

## Good-enough definition of done

An experiment is complete when its primary deliverable opens locally without build tooling, is traceable to the shared corpus, contains no known material misrepresentation, has passed one content review and one presentation review, and would provide real value to its intended audience. The aim is a credible field result, not exhaustive perfection.
