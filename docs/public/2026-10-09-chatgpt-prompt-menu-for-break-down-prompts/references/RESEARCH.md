# Research notes

Consulted October 10, 2026 (UTC). Primary references were read through web retrieval. This is a design interpretation for an independent static app, not a claim that the previous menu used an official component package.

| Source | Verified guidance used | Application here |
| --- | --- | --- |
| [OpenAI UI guidelines](https://developers.openai.com/plugins/concepts/ui-guidelines) | The optional `@openai/apps-sdk-ui` library provides design tokens and accessible components; guidance covers native fonts, neutral colors, consistent spacing, restrained imagery, and contrast | System fonts, neutral surfaces, outlined SVGs, rounded cards, small green accents, labeled native controls |
| [OpenAI Apps SDK UI](https://openai.github.io/apps-sdk-ui/) | The component library is linked by the official UI guidelines | Identified as the closest public framework reference; not imported into the app |
| [OpenAI prompt engineering](https://developers.openai.com/api/docs/guides/prompt-engineering) | Explicit instruction/context boundaries and readable section structure help organize prompts; source-controlled prompt builders and representative checks support maintenance | A small pure prompt builder, explicit task/audience/instruction sections, source-controlled examples and regression checks |

The screenshot style aligns with OpenAI's documented visual language, but screenshots alone do not identify its implementation framework. The design therefore reproduces visible evidence, using dependency-free HTML/CSS/JavaScript. Exact private fonts, internal tokens, hidden prompts, and complete prior source cannot be inferred or recovered from the supplied material.

The UI guidelines apply to plugin surfaces inside ChatGPT. Their visual principles are adapted here, not copied as runtime integration requirements. This standalone page has its own navigation, downloads, storage preference, and hosting instructions. Chat submission is replaced by Copy prompt and an ordinary Open ChatGPT link because a portable static page has no access to a conversation's submission interface.

The product/design research framework is: source observations, user needs, separate decision dimensions, traceable interaction decisions, explicit constraints, testable acceptance criteria, and transparent verification limits. It is a framework organized for this task, not an attributed or branded OpenAI research method. The specification records that chain.

The seven original screenshots establish a useful visual vocabulary: a white canvas, thin dividers, line drawings in three cards, pill-shaped selections, muted helper copy, bordered textareas, grouped checklists, badges, and a black primary action. They are recommendations, not a source of truth requiring defects to remain.

The live-preview revision also consulted [MDN box alignment in flexbox](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Box_alignment/In_flexbox) on October 10, 2026. Heading/button icon alignment uses explicit flex containers, `align-items`, `gap`, and consistent nonshrinking SVG boxes rather than baseline offsets. The Why-first SVG connectors and Trace-first arrow spacing are corrected geometrically; their source-reference defects are not reproduced. The complete interaction decisions are in `../CHANGE_REQUEST.md`.
