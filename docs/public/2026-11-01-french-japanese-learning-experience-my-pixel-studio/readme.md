# French and Japanese learning demos

Six standalone HTML examples for reusing language-learning interface patterns.
Each demo embeds its lesson data, CSS, JavaScript, and artwork. Open
[index.html](index.html) to browse, or open a demo directly. No build step or server is required.

## Contents

| File | Learning content | Implementation to reuse |
| --- | --- | --- |
| [fr-cafe-conversation.html](fr-cafe-conversation.html) | Coffee orders, pastries, recommendations, and directions; 19 main lines plus 16 lines in four optional conversations. | French speech with rate control; IPA and English toggles; side-scene return points; SVG scenery; linked transcript. |
| [ja-cafe-conversation.html](ja-cafe-conversation.html) | Greetings, preferences, hobbies, requesting repetition, and goodbyes; 49 lines across five scenes. | Japanese speech; romaji above word groups; both coffee-answer paths remain in the transcript; autoplay follows the selected path. |
| [ja-electric-day.html](ja-electric-day.html) | The &#38651; (electricity) family: 16 vocabulary entries across 102 slides, including trains, batteries, reception, and appliances. | Shared story engine; interactive SVG scenes; word-to-object links; quizzes; separate Japanese and English speech; boundary-based word emphasis. |
| [ja-blackout-protocol.html](ja-blackout-protocol.html) | The same electricity vocabulary in 14 contextual cases within a fictional interrogation. | Shared story engine; embedded portrait sprites; bilingual character speech; synthesized feedback tones; append-only answer history and mistake-dependent replies. History lasts only while the page is open. |
| [ja-forest-fieldnotes-26.html](ja-forest-fieldnotes-26.html) | Naruto episode 26 story adaptation: introductions, ambitions, techniques, and teamwork; 14 scenes and 42 tasks. | Adaptive choices, cloze, matching, listening, construction, ordering, and response tasks; connected words and scene markers; character voice profiles; local progress and JSON backups. |
| [ja-forest-fieldnotes-27.html](ja-forest-fieldnotes-27.html) | Episode 27 survival-exam adaptation; 19 scenes, 57 tasks, 94 expressions, and 191 usage examples. | Complete sentence segmentation; named SVG features with transformed highlight bounds; inline illustrations, kanji notes, and translated examples; bookmarks; character voices; local progress and JSON backups. |

The Naruto dialogue is a meaning-based learning adaptation, not a verified episode
transcript. The Lily conversation and artwork are illustrative, not an official Duolingo interaction.

## Source map

- **French cafe:** `window.CAFE_STORY` contains `main`, `side`, `branches`, and `chapters`. A branch's `after` field attaches it to a main-story line; the player remembers where to return.
- **Japanese cafe:** `window.LILY_STORY` contains `scenes` and `lines`. Each line's `parts` pairs Japanese with romaji; `branch` determines which coffee path Next traverses, without removing the other path from the transcript.
- **Electric Day:** `window.PIXEL_STORY.initial.overlay.code` stores the vocabulary/gloss inventory as JSON text. Each story step's `patch.overlay.body` stores its lesson record. `PixelStoryEngine` and `PixelStoryPlayer` handle the shared timeline; the final script renders the lesson and audio controls.
- **Blackout Protocol:** the same story container stores scenes, vocabulary, characters, and failure-dialogue templates in `initial.overlay.code`. The final script's `history`, `records`, and `recallMemory` keep attempts and consumed reminders separate from navigation.
- **Fieldnotes:** `SCENES` stores the lesson and three tasks per scene; `WORD_GUIDES` joins words to artwork through shared indices. Episode 27 uses `SCENES[].words` for every spoken expression, `data-scene-feature` names for SVG targets, and `WORD_USAGE` for authored examples. `sceneRegion()` accounts for SVG transforms and visible stroke width.

Episode 27 contains the most detailed reader-guiding comments. Follow
`connectUnitElement()` / `connectWordElement()` through the highlighting functions
to `openUnit()` / `openWord()`: hover or focus highlights silently; activation
pronounces and opens one inline explanation without scrolling to it. There is no floating word panel.

## Browser APIs and behavior

| API / pattern | Where and why |
| --- | --- |
| Web Speech: `speechSynthesis`, `SpeechSynthesisUtterance` | All six demos synthesize speech, not speech recognition. French requests `fr-FR`; Japanese requests `ja-JP`; bilingual demos route English separately to `en-US`. |
| Voice discovery and cancellation | Electric Day, Blackout, and Fieldnotes support separate language voices and browser-default fallback when `getVoices()` is empty. Run/utterance guards keep late callbacks from canceled speech from affecting a new line. Fieldnotes also maintains character pitch and voice preferences. |
| Speech `boundary` events | Electric Day and Fieldnotes use real utterance timing for text emphasis. Timing events depend on the browser and selected voice; scene selection works without them. |
| Web Audio: `AudioContext`, oscillators, gain envelopes | Blackout and both Fieldnotes files synthesize feedback tones without audio files. These controls are separate from speech. |
| SVG and coordinate transforms | Both cafes, Electric Day, and Fieldnotes draw scenes inline. Episode 27 measures named features with SVG bounds and coordinate matrices rather than guessing screen-pixel rectangles. Its `ResizeObserver` refreshes decorative geometry after layout changes. |
| `localStorage` | Both Fieldnotes files save answers, mistakes, bookmarks, and preferences. Other demos keep practice state in memory only. Storage is browser/origin-specific. |
| `Blob`, object URLs, `FileReader.readAsText()` | Fieldnotes exports/imports JSON progress. Back up before changing browsers or moving between a local file and a website. |

No application backend, microphone, analytics, external fonts, or CDN libraries are
used. Page content and artwork work locally. Speech depends on browser/device voices;
installed voices can work offline, while browser voice services may require internet.
If speech is unavailable, the text and activities remain accessible. Audio may require a user gesture.

## Files and previews

Names use `fr-` or `ja-` followed by the topic in lowercase kebab-case. The six demo
files were renamed without changing their contents:

| Previous name | Current name |
| --- | --- |
| `bonjour-cafe-play.html` | `fr-cafe-conversation.html` |
| `lily-cafe-practice.html` | `ja-cafe-conversation.html` |
| `presentation (2).html` | `ja-electric-day.html` |
| `blackout-protocol (1).html` | `ja-blackout-protocol.html` |
| `naruto26-forest-fieldnotes.html` | `ja-forest-fieldnotes-26.html` |
| `naruto27-forest-fieldnotes-reviewed-v2.html` | `ja-forest-fieldnotes-27.html` |

`index.html` is a static directory, with no JavaScript or embedded demo iframes.
`images/*.jpg` are actual browser screenshots, not generated lesson artwork.
`favicon.svg` is the collection icon; `images/social-preview.png` is the 1200 x 630
share image referenced by Open Graph and Twitter card metadata. All index assets are local.

## Learning resources

The final section of `index.html` combines the course, reference, and GitHub links
from `french-learning-resources.html` and `japanese-learning-resources.html`; those
two source pages were removed after merging. It retains all 22 distinct resource
URLs, concise purpose descriptions, and access, pricing, language, and redistribution caveats.

The source notes were compiled November 1, 2026, from four searches attributed to
Claude Haiku 5.5, GPT-6.1 Terra, Gemini 3.8 Flash, and Grok 4.7. Their access checks
covered selected provider pages, not every feature, file, or region; they are not a
new verification of current availability or pricing.
