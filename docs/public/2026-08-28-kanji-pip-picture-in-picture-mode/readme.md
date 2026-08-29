# Kanji PiP - Final Software Design, Implementation, and Production Specification

## A01. Purpose and Product Definition

Kanji PiP is a self-contained browser application that converts a continuously rendered educational HTML canvas into a video stream and presents that stream through the browser's native Picture-in-Picture mechanism.

The application transforms otherwise unused peripheral screen space into a low-distraction Japanese study surface. Once activated, it slowly presents kanji, kana readings, romaji, English meanings, vocabulary, and occasional sentence examples without requiring routine user interaction.

The application is intentionally not a conventional flashcard system. The user does not start a study session, choose a deck, press "show answer," grade responses, manage progress, or interact with controls between cards.

Time acts as the primary interaction mechanism.

The application begins by displaying Japanese material without explanatory information. Later phases reveal readings and meanings automatically. Vocabulary and sentence examples are introduced similarly. The completed card then recedes before the next target appears.

The application therefore combines characteristics of an ambient information display, a clock, and an automated flashcard.

The fundamental product requirement is:

> Once activated, Kanji PiP shall present a compact, continuously playing, low-distraction Japanese-learning display in browser Picture-in-Picture mode that requires no routine interaction from the user.

The product shall not claim that media playback disables, overrides, circumvents, or guarantees prevention of operating-system locking, browser security, power management, managed-device policies, organizational security controls, or similar platform behavior.

Its explicit function is educational Picture-in-Picture display only.

---

## B01. Product Mental Model

The application behaves like an extremely slow flashcard that turns itself over automatically.

A typical progression is:

```text
鳥
```

followed later by:

```text
鳥

とり
tori
bird
```

The card then changes emphasis and presents vocabulary:

```text
小鳥
```

followed later by:

```text
ことり
小鳥
kotori
small bird
```

A later example may present:

```text
鳥が飛ぶ
```

followed later by:

```text
とり が とぶ
鳥が飛ぶ
tori ga tobu
bird flies
```

The educational content may then disappear temporarily:

```text
                         23:47
```

before the next target appears:

```text
水
```

The user is never required to acknowledge a card.

Missing a card is acceptable.

The application assumes that the user will sometimes look at the PiP surface and sometimes ignore it.

The experience is ambient rather than session-oriented.

---

## C01. User Experience Contract

The normal application interface shall remain intentionally minimal.

The production page shall contain the rendered study canvas, the hidden video transport required for Picture-in-Picture, one principal Picture-in-Picture control, and a small status region for recoverable errors or capability information.

No settings panel is required.

No account is required.

No sign-in is required.

No persistent application state is required.

No backend is required.

No database is required.

No runtime network request is required.

No difficulty selector shall be provided.

No flashcard grading interface shall be provided.

No statistics dashboard shall be provided.

No deck manager shall be provided.

No notification system shall be provided.

No search interface shall be provided.

No configuration modal shall be provided.

No theme picker shall be provided.

No animation picker shall be provided.

The primary user-facing action shall be:

```text
Enter Picture-in-Picture
```

When PiP is active, the same control may become:

```text
Exit Picture-in-Picture
```

If the feature is unavailable, it shall communicate:

```text
Picture-in-Picture unavailable
```

Primary configuration shall exist as readable JavaScript configuration data inside the application source.

The initial production values are conceptually equivalent to:

```js
CARD_DURATION_MINUTES = 20
EXAMPLES_PER_CARD = 2
CAPTURE_FPS = 10
SHOW_SECONDS_IN_CLOCK = false
```

---

## D01. Picture-in-Picture Architecture

The media path shall be:

```text
JavaScript educational state
        |
        v
Canvas renderer
        |
        v
HTMLCanvasElement
        |
        | captureStream(...)
        v
MediaStream
        |
        | video.srcObject
        v
hidden HTMLVideoElement
        |
        | requestPictureInPicture()
        v
browser / operating-system PiP surface
```

The implementation shall use `HTMLCanvasElement.captureStream()` when available.

The initial production path shall use approximately:

```js
canvas.captureStream(10)
```

rather than the 30 FPS rate used by the original Digital Rain experiment.

The generated stream shall be assigned to the hidden HTML video element through `srcObject`.

The video shall be muted.

The video shall use `playsinline`.

The application shall attempt to ensure the generated video is playing before requesting Picture-in-Picture.

Picture-in-Picture capability shall be detected before presenting an enabled PiP control.

The implementation shall account for the following APIs or capabilities being absent:

```text
HTMLCanvasElement.captureStream
document.pictureInPictureEnabled
HTMLVideoElement.requestPictureInPicture
document.exitPictureInPicture
```

`requestPictureInPicture()` shall be treated as asynchronous and fallible.

A PiP rejection shall not stop the educational renderer.

The user shall be able to retry after recoverable failures.

A future implementation may optionally use:

```js
canvas.captureStream(0)
CanvasCaptureMediaStreamTrack.requestFrame()
```

but explicit frame submission shall not be required by the production architecture because browser support is less universal.

---

## E01. Source Resolution and PiP Geometry

The production educational canvas shall use:

```text
480 x 270
```

This produces a 16:9 source video.

The application shall not assume control over the final physical size or position of the operating-system Picture-in-Picture window.

The browser and operating system remain responsible for PiP window geometry.

The source composition shall therefore remain legible when scaled substantially smaller than 480 x 270.

The design shall assume the user may place the PiP surface in a screen corner and reduce its dimensions substantially.

The content shall avoid:

```text
small paragraphs
dense controls
thin decorative lines
complex icons
hover-dependent information
large blocks of explanatory text
```

---

## F01. Visual Hierarchy

The canvas shall contain three conceptual layers.

| Layer                    | Responsibility                                                     |
| ------------------------ | ------------------------------------------------------------------ |
| Memory target            | The kanji, word, or sentence currently being recalled              |
| Answer and example layer | Kana, romaji, English meaning, vocabulary, or sentence explanation |
| Ambient layer            | Black foundation, extremely weak decoration, and clock             |

The memory target shall dominate whenever the application is asking the learner to retrieve information.

Example target state:

```text
+------------------------------------------------+
|                                                |
|                                                |
|                      鳥                        |
|                                                |
|                                                |
|                                      23:14     |
+------------------------------------------------+
```

Example answer state:

```text
+------------------------------------------------+
|                                                |
|                      鳥                        |
|                     とり                       |
|                     tori                       |
|                     bird                       |
|                                                |
|                                      23:14     |
+------------------------------------------------+
```

The clock shall remain present during normal card phases.

The clock shall never become visually dominant.

---

## G01. Typography

The primary kanji shall prefer a Japanese serif or Mincho-style system font.

The conceptual font stack is:

```css
ui-serif,
"Hiragino Mincho ProN",
"Yu Mincho",
"Noto Serif CJK JP",
serif
```

Supporting information shall use a system sans-serif stack equivalent to:

```css
system-ui,
-apple-system,
BlinkMacSystemFont,
"Segoe UI",
"Hiragino Sans",
"Yu Gothic UI",
"Meiryo",
sans-serif
```

The application shall not depend on remote fonts.

The primary target kanji shall normally occupy approximately 35 to 45 percent of canvas height during the question phase.

The kanji may shrink smoothly when answer information becomes visible.

The clock should use approximately 14 to 16 source pixels.

The smallest Japanese text shall remain legible after PiP downscaling.

---

## H01. Clock

The application shall display a local 24-hour clock.

The normal format shall be:

```text
23:14
```

Seconds shall be configurable but disabled by default.

The default shall therefore not display:

```text
23:14:37
```

The clock shall be positioned close to the lower-right corner with safe padding.

The clock shall use a subdued neutral color.

The clock shall not use the strongest active-kanji accent color.

Without seconds enabled, clock content changes only when the minute changes.

---

## I01. Card Duration and Relative Timeline

Card timing shall derive from one configurable card duration rather than scattered independent timers.

The default production card duration shall be approximately:

```text
20 minutes
```

All educational phases shall scale proportionally when this value changes.

The normalized card progress shall be conceptually:

```js
progress = elapsed / cardDuration
```

with progress constrained between `0` and `1`.

The production timeline shall follow:

| Phase               | Interval | Purpose                                              |
| ------------------- | -------: | ---------------------------------------------------- |
| Target              |   0%-20% | Display only the main kanji                          |
| Reading             |  20%-35% | Reveal kana and primary reading                      |
| Meaning             |  35%-45% | Reveal English meaning                               |
| Vocabulary question |  45%-60% | Display first vocabulary item without assistance     |
| Vocabulary reading  |  60%-72% | Reveal kana and romaji                               |
| Vocabulary meaning  |  72%-82% | Reveal English meaning                               |
| Second example      |  82%-91% | Display another retrieval prompt                     |
| Second answer       |  91%-96% | Reveal supporting information                        |
| Transition          | 96%-100% | Remove educational content and prepare the next card |

At a 20-minute duration, the first target-only interval lasts approximately four minutes.

At a 10-minute duration, the same proportional phase lasts approximately two minutes.

Changing the card duration shall not require rewriting phase logic.

---

## J01. Retrieval Before Recognition

The central pedagogical rule is retrieval before recognition.

A new target shall initially display:

```text
鳥
```

and shall not immediately display:

```text
鳥
tori
bird
```

Likewise, vocabulary shall initially display:

```text
小鳥
```

rather than:

```text
ことり
小鳥
kotori
small bird
```

Kana, romaji, and English explanation shall appear later.

Time is therefore equivalent to a conventional flashcard's "show answer" control.

---

## K01. Example Card Progression

A complete visual progression for `鳥` may approximately follow this sequence.

Target:

```text
+------------------------------------------------+
|                                                |
|                                                |
|                      鳥                        |
|                                                |
|                                                |
|                                      09:42     |
+------------------------------------------------+
```

Primary answer:

```text
+------------------------------------------------+
|                                                |
|                      鳥                        |
|                                                |
|                     とり                       |
|                     tori                       |
|                     bird             09:46     |
+------------------------------------------------+
```

Vocabulary retrieval:

```text
+------------------------------------------------+
|                                                |
|                                                |
|                    小鳥                        |
|                                                |
|                                                |
|                                      09:51     |
+------------------------------------------------+
```

Vocabulary answer:

```text
+------------------------------------------------+
|                                                |
|                    ことり                      |
|                     小鳥                       |
|                    kotori                      |
|                  small bird                    |
|                                      09:54     |
+------------------------------------------------+
```

Optional later retrieval prompt:

```text
+------------------------------------------------+
|                                                |
|                                                |
|                   鳥が飛ぶ                     |
|                                                |
|                                                |
|                                      09:58     |
+------------------------------------------------+
```

Sentence answer:

```text
+------------------------------------------------+
|                                                |
|                 とり が とぶ                   |
|                   鳥が飛ぶ                     |
|                tori ga tobu                    |
|                  bird flies                    |
|                                      10:00     |
+------------------------------------------------+
```

Transition:

```text
+------------------------------------------------+
|                                                |
|                                                |
|                                                |
|                                                |
|                                                |
|                                      10:01     |
+------------------------------------------------+
```

Next target:

```text
+------------------------------------------------+
|                                                |
|                                                |
|                      水                        |
|                                                |
|                                                |
|                                      10:01     |
+------------------------------------------------+
```

The intentionally empty transition distinguishes cards without introducing visually aggressive animation.

---

## L01. Animation Philosophy

Animation shall remain restrained enough to be perceived primarily as atmosphere.

Normal interface animation times such as 150 to 300 milliseconds are intentionally shorter than the transition vocabulary used by Kanji PiP.

Representative educational transition durations may include:

```text
2.5 seconds
3 seconds
4 seconds
6 seconds
10 seconds
```

A new kanji may take approximately four seconds to become fully visible.

Answer information may fade in over approximately three seconds.

A background accent transition may take approximately ten seconds.

No educational information shall flash.

No text shall bounce.

No continuously looping effect shall exist solely to attract attention.

No animation shall repeatedly demand visual attention.

Motion shall be justified only when it introduces information, removes information, or provides an exceptionally weak ambient transition.

The application shall respect `prefers-reduced-motion`.

When reduced motion is requested, transition progress may resolve immediately or use substantially reduced animation.

---

## M01. Transition Vocabulary

The internal rendering system may support the following transition vocabulary.

| Transition              | Behavior                             | Distraction |        Cost |
| ----------------------- | ------------------------------------ | ----------: | ----------: |
| Soft fade               | Slow opacity entrance                |    Very low |    Very low |
| Glow bloom              | Weak halo increases temporarily      |         Low |         Low |
| Glow decay              | Luminous glyph settles to crisp text |         Low |         Low |
| Slow focus              | Soft appearance becomes sharper      |         Low |      Medium |
| Vertical drift          | Approximately 3-6 px movement        |    Very low |    Very low |
| Horizontal drift        | Small horizontal settlement          |    Very low |    Very low |
| Scale breathe           | Approximately 0.97 to 1.00 scaling   |    Very low |         Low |
| Character trace         | Progressive character mask           |      Medium | Medium-high |
| Moonlight reveal        | Weak luminance gradient over glyph   |         Low |         Low |
| Ink appearance          | Multiple translucent passes          |         Low |         Low |
| Mist reveal             | Weak surrounding noise disappears    |         Low |      Medium |
| Cross-dissolve          | Previous and next objects overlap    |    Very low |    Very low |
| Color-temperature shift | Accent changes between cards         |    Very low |    Very low |
| Halo pulse              | One slow answer pulse                |         Low |         Low |
| Underline growth        | Small vocabulary underline appears   |    Very low |    Very low |
| Ruby descent            | Reading settles downward slightly    |         Low |    Very low |
| Translation rise        | English rises slightly               |    Very low |    Very low |
| Ghost echo              | Temporary faint duplicate            |         Low |         Low |
| Star emergence          | One or two points brighten           |    Very low |    Very low |
| Constellation shift     | Background changes between cards     |    Very low |    Very low |
| Vignette breathing      | Edge darkness changes slightly       |    Very low |         Low |
| Gradient drift          | Background gradient changes slowly   |    Very low |         Low |
| Accent sweep            | Dim highlight crosses glyph          |         Low |         Low |
| Delayed components      | Answer components arrive separately  |         Low |    Very low |
| Silence frame           | Educational content disappears       |    Very low |     Minimal |

The production implementation shall use only a restrained subset.

The production main-kanji entrance shall approximately combine:

```text
soft fade
3 px vertical drift
glow decay
```

Primary answers shall use an opacity fade.

Vocabulary shall use soft fade plus small horizontal drift.

Vocabulary annotations shall use small reading/translation movement.

Card changes shall use cross-dissolve or similarly restrained accent/background transition behavior.

---

## N01. Color and Background System

Every theme shall begin with actual black:

```text
#000000
```

Near-black blue or gray shall not replace the foundational black surface.

Decorative illumination shall remain weak.

The production implementation may rotate between the following internal theme families.

| Theme    | Background accent | Foreground accent |
| -------- | ----------------- | ----------------- |
| Midnight | Deep navy         | Ice blue          |
| Matcha   | Forest green      | Pale green        |
| Sakura   | Dark wine         | Soft pink         |
| Ember    | Dark brown-red    | Amber             |
| Fuji     | Deep violet       | Lavender          |
| Moon     | Charcoal blue     | Silver            |
| Ocean    | Deep teal         | Cyan              |
| Ink      | Neutral black     | Warm white        |

These theme names are internal and shall not require a user-facing theme picker.

Background contrast shall remain substantially weaker than educational foreground text.

Background appearance should change primarily when cards change.

---

## O01. Ambient Detail

Ambient visual geometry shall remain sparse.

A representative background may contain approximately:

```text
7 fixed points
1 extremely slow or effectively static variation
1 cached radial gradient
1 static vignette
```

The product shall not implement hundreds of continuously animated particles.

Random decorative state shall be generated when a new card begins rather than every frame.

The rendering composition shall conceptually be:

```text
cached background
+
dynamic educational content
+
clock
=
final frame
```

Background data may be cached using an offscreen canvas.

---

## P01. Rendering Performance Strategy

Rendering performance is a first-class requirement.

The application shall use approximately 10 FPS canvas capture rather than 30 FPS.

The renderer shall not perform expensive work continuously when the visual state is static.

Redrawing shall primarily be required when:

```text
a phase changes
a transition is active
the clock changes
the card changes
PiP state changes
the source canvas is recreated or resized
```

The renderer shall avoid WebGL unless future profiling demonstrates a need.

The renderer shall avoid continuous particle simulation.

The renderer shall avoid unnecessary per-frame random-number generation.

The renderer shall avoid remote image decoding.

The renderer shall avoid DOM rasterization.

The renderer shall avoid excessive canvas-shadow operations.

The renderer shall avoid expensive blur filters on every captured frame.

A stable rendered frame should require approximately:

```text
copy cached background
draw current target
draw visible annotation
draw clock
```

Scheduling shall remain event-driven where practical rather than using an unrestricted high-frequency animation loop.

---

## Q01. Deterministic Application State

The educational application shall behave as a small deterministic state machine.

Conceptually, runtime state includes:

```js
{
    deck,
    card,
    cardStartedAt,
    selectedExamples,
    secondaryPrompt,
    palette,
    transitionState,
    exampleHistory
}
```

The current educational phase shall be derived from normalized elapsed progress.

Phase calculation shall not contain canvas drawing logic.

The architecture shall conceptually follow:

```js
phase = getPhase(progress)
viewModel = buildViewModel(state, phase)
render(viewModel)
```

The implementation may optimize this structure while preserving the separation between state/timeline logic and visual rendering.

Pure functions shall be preferred for timing, shuffling, selection, formatting, and corpus validation.

---

## R01. Deck and Example Selection

The 100 kanji shall not rotate in fixed numerical order.

A shuffled deck containing every available kanji shall be generated.

Each selected card shall be consumed from the deck.

When the deck becomes empty, a new shuffled deck shall be created.

The first card after a reshuffle shall not immediately repeat the previous card.

The application shall vary vocabulary examples across repeated appearances of the same kanji when sufficient examples are available.

For example, a rich `生` vocabulary pool may contain:

```text
学生
先生
生活
生まれる
人生
生徒
一生
生きる
```

One appearance may select:

```text
学生
生活
```

Another may select:

```text
先生
人生
```

Another may select:

```text
生きる
一生
```

Only a small subset shall be displayed during one card cycle.

---

## S01. Japanese Data Model

Educational data shall be stored as structured machine-readable JavaScript data.

A conceptual card schema is:

```js
{
    kanji: "鳥",
    meanings: ["bird"],

    readings: {
        on: ["チョウ"],
        kun: ["とり"]
    },

    romaji: {
        on: ["chou"],
        kun: ["tori"]
    },

    examples: [
        {
            word: "小鳥",
            reading: "ことり",
            romaji: "kotori",
            meaning: "small bird"
        }
    ],

    sentences: [
        {
            japanese: "鳥が飛ぶ。",
            reading: "とり が とぶ。",
            romaji: "Tori ga tobu.",
            meaning: "A bird flies."
        }
    ]
}
```

Kana shall be stored independently.

The renderer shall not derive kana from romaji.

Kana shall be canonical reading-display data.

Romaji shall be supporting learner data.

English shall be explanatory data.

The conceptual hierarchy shall be:

```text
Japanese
kana
romaji
English
```

The schema shall permit richer vocabulary or sentence collections later without requiring changes to the rendering architecture.

---

## T01. Ruby-Like Canvas Presentation

Because the PiP image is captured from a canvas, native HTML `<ruby>` layout cannot be used inside the PiP surface.

Ruby-like layout shall be drawn manually.

A conceptual arrangement is:

```text
     ことり
      小鳥
     kotori
   small bird
```

A denser arrangement may be used where necessary:

```text
ことり  kotori
     小鳥
  small bird
```

Final dimensions shall prioritize readability at small PiP sizes.

---

## U01. Sentence Examples

Sentence examples shall not permanently coexist with all regular kanji and vocabulary information.

A sentence phase shall replace the existing informational composition rather than append additional content.

Example:

```text
小鳥が木にいます。
```

may reveal:

```text
ことり が き に います。
小鳥が木にいます。
Kotori ga ki ni imasu.
There is a small bird in the tree.
```

Other valid examples include:

```text
今日は雨です。
きょう は あめ です。
Kyou wa ame desu.
It is rainy today.
```

```text
学校へ行きます。
がっこう へ いきます。
Gakkou e ikimasu.
I go to school.
```

```text
水を飲みます。
みず を のみます。
Mizu o nomimasu.
I drink water.
```

```text
本を読みます。
ほん を よみます。
Hon o yomimasu.
I read a book.
```

Sentence examples shall remain short enough to read in a small PiP window.

Sentence examples should prefer vocabulary already represented in the corpus.

---

## V01. Content Density

The PiP surface shall not become a miniature textbook.

Only one educational problem should dominate at a time.

| State                | Dominant content                           |
| -------------------- | ------------------------------------------ |
| Target               | One kanji                                  |
| Kanji answer         | One kanji and compact explanation          |
| Vocabulary retrieval | One word                                   |
| Vocabulary answer    | One word and compact explanation           |
| Sentence retrieval   | One short sentence                         |
| Sentence answer      | One short sentence and compact explanation |
| Transition           | Primarily clock and empty space            |

Obsolete information shall be removed before new information causes crowding.

Whitespace shall be functional.

Black empty space is part of the design.

---

## W01. Explicit Product Non-Goals

The application shall not display Digital Rain behind educational material.

The application shall not use continuously moving particle fields.

The application shall not rotate cards in 3D.

The application shall not bounce text.

The application shall not repeatedly pulse the clock.

The application shall not display animated progress bars.

The application shall not apply typewriter animation to every line.

The application shall not use rapid color cycling.

The application shall not apply strong neon glow to all text.

The application shall not use conventional gaming-RGB visual language.

The application shall not fill the screen with controls.

The application shall not display every possible dictionary reading simultaneously.

The application shall not depend exclusively on romaji.

The application shall produce no sound.

The application shall not require microphone permission.

The application shall not require camera permission.

The application shall not require notification permission.

The application shall not require clipboard permission.

The application shall not require geolocation permission.

The intended visual character is closer to:

```text
Japanese dictionary
+
astronomical clock
+
e-ink calmness
+
restrained cyberpunk illumination
```

than:

```text
Matrix animation
+
gaming RGB
+
screensaver
```

---

## X01. Final Production Packaging

The final production release shall consist of exactly one application file:

```text
kanji-pip.html
```

The production artifact shall contain all required application code and data.

The file shall contain inline:

```text
HTML structure
CSS
100-kanji corpus
application configuration
timeline logic
deck logic
theme logic
animation logic
canvas renderer
clock logic
MediaStream logic
Picture-in-Picture controller
error handling
accessibility behavior
```

The production release shall not require separate:

```text
styles.css
script.js
kanji-data.js
kanji-core.js
npm packages
node_modules
build output
backend files
database files
image assets
font assets
network resources
```

The production artifact shall run as an ordinary static HTML file in compatible modern browsers, subject to normal browser restrictions around Picture-in-Picture and media APIs.

Development validation files are not part of the production artifact.

---

## Y01. Final HTML Architecture

The production HTML shall use an HTML5 document.

The document shall include:

```text
UTF-8 metadata
responsive viewport metadata
dark color-scheme metadata
Content Security Policy
application title
minimal user-facing shell
480 x 270 canvas
hidden muted video
Picture-in-Picture button
status output
inline CSS
inline JavaScript
```

Conceptually:

```html
<!doctype html>
<html lang="en">
<head>
    ...
    <style>
        /* complete production styles */
    </style>
</head>

<body>
    <main>
        <canvas
            id="studyCanvas"
            width="480"
            height="270"
        ></canvas>

        <video
            id="pipVideo"
            autoplay
            muted
            playsinline
        ></video>

        <button id="pipButton">
            Enter Picture-in-Picture
        </button>

        <p id="statusMessage"></p>
    </main>

    <script>
        /* complete corpus and application */
    </script>
</body>
</html>
```

The actual production file shall contain the complete executable implementation and shall not contain placeholders.

---

## Z01. Internal Software Modules

Although the production application is packaged into one physical HTML file, its JavaScript shall remain logically modular.

| Internal area     | Responsibility                                   |
| ----------------- | ------------------------------------------------ |
| Configuration     | Canvas dimensions, timing, FPS, example count    |
| Corpus            | Kanji, readings, vocabulary, sentences           |
| Corpus validation | Structural and semantic runtime invariants       |
| Utility/core      | Clamp, easing, formatting, deterministic helpers |
| Deck              | Shuffling and non-repeating selection            |
| Example selection | Vocabulary and sentence variation                |
| Timeline          | Mapping elapsed time to phases                   |
| Theme             | Palette selection and ambient state              |
| Background        | Cached canvas background generation              |
| Transition        | Reveal progress and easing                       |
| Layout            | Font sizes, positions, fit calculations          |
| Renderer          | Canvas drawing                                   |
| Clock             | Local 24-hour formatting                         |
| Scheduler         | Efficient redraw scheduling                      |
| Media             | Canvas capture and video playback                |
| PiP controller    | Capability detection, enter, exit, retry         |
| Error reporting   | User-visible and console diagnostics             |
| Accessibility     | Reduced motion and contrast constraints          |

Classes are not required.

Plain functions and immutable reference data are preferred where practical.

---

## AA01. Rendering Model

Rendering shall be declarative in intent.

The renderer shall receive current state and produce the appropriate visible composition.

A conceptual view model may contain:

```js
{
    mainKanji: "鳥",
    kanjiReading: "とり",
    kanjiRomaji: "tori",
    kanjiMeaning: "bird",

    showKanjiReading: true,
    showKanjiMeaning: true,

    vocabulary: {
        word: "小鳥",
        reading: "ことり",
        romaji: "kotori",
        meaning: "small bird"
    },

    showVocabulary: false,

    clock: "23:14"
}
```

Timeline calculations shall remain separate from individual drawing primitives.

This separation supports deterministic validation and visual reasoning.

---

## AB01. Animation Mathematics

Animation shall use normalized progress.

Conceptually:

```js
t = clamp(
    (currentProgress - startProgress) /
    (endProgress - startProgress),
    0,
    1
)
```

A smoothstep easing function is appropriate:

```js
function smoothstep(t) {
    return t * t * (3 - 2 * t);
}
```

Opacity may use:

```js
alpha = smoothstep(t)
```

Vertical drift may use approximately:

```js
y = baseY + (1 - smoothstep(t)) * 4
```

Scale may use approximately:

```js
scale = 0.97 + smoothstep(t) * 0.03
```

The animation system shall remain deterministic and computationally inexpensive.

No physics engine is required.

---

## AC01. Background Caching

A new background shall be generated when a new card begins.

Background generation may include:

```text
black foundation
weak radial illumination
sparse fixed points
static vignette
```

The completed ambient image shall be cached.

Normal educational rendering shall begin by drawing the cached background.

Random star positions shall not be recomputed at 10 FPS.

Gradient geometry shall not be randomized at 10 FPS.

Static decorative state shall not be regenerated at 10 FPS.

A previous background may be retained temporarily for restrained cross-fading.

---

## AD01. Failure Behavior

Picture-in-Picture failure shall never terminate the educational application.

If canvas stream capture is unsupported, the canvas preview shall continue normally.

If Picture-in-Picture is unavailable, the control shall indicate:

```text
Picture-in-Picture unavailable
```

If video playback fails, the application shall remain usable.

If `video.play()` rejects, the failure shall be reported visibly and logged to the developer console.

If `requestPictureInPicture()` rejects, the application shall remain usable.

The user shall be able to retry after recoverable PiP failures.

Errors shall be inserted into the document through safe text APIs such as `textContent`.

---

## AE01. Accessibility and Visual Comfort

Animation intensity shall remain intentionally low.

No effect shall produce rapid flashing.

No state shall repeatedly alternate between extreme luminance values.

Color shall not be the sole indicator that an answer has appeared.

Important educational text shall retain strong contrast against black.

Decorative background content shall remain lower contrast than educational content.

Text motion shall be small and slow.

The application shall honor reduced-motion preferences.

The product is designed to remain visible for long periods.

Any effect that is attractive for seconds but irritating after prolonged use is unsuitable.

---

## AF01. Corpus Philosophy

The initial corpus shall contain exactly 100 kanji.

The set is a practical starter corpus and shall not be presented as an authoritative statistical "top 100 frequency" ranking.

The corpus focuses on broad usefulness across:

```text
numbers
time
movement
locations
education
people
communication
common daily vocabulary
ordinary written Japanese
```

Each character shall contain:

```text
core meaning
representative reading data
romaji learner data
at least two vocabulary examples
```

Some characters may contain richer vocabulary pools.

Only one or two examples shall normally be shown during an individual card appearance.

---

## AG01. Reference Corpus 1-25

|  # | Kanji | Core meaning             | Representative readings | Example vocabulary                                    |
| -: | ----- | ------------------------ | ----------------------- | ----------------------------------------------------- |
|  1 | 日     | day, sun                 | nichi, hi               | 日本 - Japan; 毎日 - every day; 日曜日 - Sunday              |
|  2 | 一     | one                      | ichi, hitotsu           | 一人 - one person; 一日 - one day; 一番 - number one        |
|  3 | 国     | country                  | koku, kuni              | 外国 - foreign country; 中国 - China; 全国 - nationwide     |
|  4 | 人     | person                   | jin, nin, hito          | 日本人 - Japanese person; 人間 - human; 一人 - one person    |
|  5 | 年     | year                     | nen, toshi              | 今年 - this year; 来年 - next year; 毎年 - every year       |
|  6 | 大     | big                      | dai, oo                 | 大学 - university; 大人 - adult; 大切 - important           |
|  7 | 十     | ten                      | juu                     | 十分 - sufficient; 十月 - October; 二十歳 - twenty years old |
|  8 | 二     | two                      | ni, futatsu             | 二人 - two people; 二月 - February; 二回 - twice            |
|  9 | 本     | book, origin             | hon, moto               | 日本 - Japan; 本当 - truth/really; 本屋 - bookstore         |
| 10 | 中     | middle, inside           | chuu, naka              | 中国 - China; 中学校 - junior high school; 一日中 - all day   |
| 11 | 長     | long, leader             | chou, nagai             | 社長 - company president; 長い - long; 成長 - growth        |
| 12 | 出     | exit, emerge             | shutsu, deru            | 出口 - exit; 出来る - can; 出発 - departure                  |
| 13 | 三     | three                    | san, mittsu             | 三人 - three people; 三月 - March; 三回 - three times       |
| 14 | 時     | time, hour               | ji, toki                | 時間 - time; 時計 - clock; 時々 - sometimes                 |
| 15 | 行     | go, conduct              | kou, gyou, iku          | 行く - go; 銀行 - bank; 旅行 - travel                       |
| 16 | 見     | see                      | ken, miru               | 見る - see; 意見 - opinion; 見物 - sightseeing              |
| 17 | 月     | moon, month              | getsu, tsuki            | 今月 - this month; 月曜日 - Monday; 月 - moon               |
| 18 | 分     | part, minute, understand | bun, fun, wakaru        | 自分 - oneself; 分かる - understand; 五分 - five minutes     |
| 19 | 後     | after, behind            | go, ato                 | 午後 - afternoon; 最後 - last; 後で - later                 |
| 20 | 前     | before, front            | zen, mae                | 午前 - morning; 名前 - name; 前に - before                  |
| 21 | 生     | life, birth              | sei, shou, ikiru        | 学生 - student; 先生 - teacher; 生活 - daily life           |
| 22 | 五     | five                     | go, itsutsu             | 五月 - May; 五人 - five people; 五分 - five minutes         |
| 23 | 間     | interval, space          | kan, aida               | 時間 - time; 人間 - human; 間に合う - be in time              |
| 24 | 上     | up, above                | jou, ue, agaru          | 上手 - skillful; 以上 - more than; 上がる - rise             |
| 25 | 東     | east                     | tou, higashi            | 東京 - Tokyo; 東口 - east exit; 関東 - Kanto                |

---

## AH01. Reference Corpus 26-50

|  # | Kanji | Core meaning    | Representative readings | Example vocabulary                                       |
| -: | ----- | --------------- | ----------------------- | -------------------------------------------------------- |
| 26 | 四     | four            | shi, yon                | 四月 - April; 四人 - four people; 四つ - four things           |
| 27 | 今     | now             | kon, ima                | 今日 - today; 今月 - this month; 今度 - next time              |
| 28 | 金     | gold, money     | kin, kane               | お金 - money; 金曜日 - Friday; 金額 - amount of money           |
| 29 | 九     | nine            | kyuu, ku                | 九月 - September; 九人 - nine people; 九時 - nine o'clock      |
| 30 | 入     | enter           | nyuu, hairu             | 入る - enter; 入口 - entrance; 入学 - school admission         |
| 31 | 学     | study           | gaku, manabu            | 学校 - school; 学生 - student; 大学 - university               |
| 32 | 高     | high, expensive | kou, takai              | 高い - high/expensive; 高校 - high school; 最高 - highest/best |
| 33 | 円     | yen, circle     | en, marui               | 百円 - 100 yen; 円形 - circular shape; 円い - round            |
| 34 | 子     | child           | shi, ko                 | 子供 - child; 女子 - girl/female; 椅子 - chair                 |
| 35 | 外     | outside         | gai, soto               | 外国 - foreign country; 外出 - going out; 海外 - overseas      |
| 36 | 八     | eight           | hachi, yattsu           | 八月 - August; 八人 - eight people; 八つ - eight things        |
| 37 | 六     | six             | roku, muttsu            | 六月 - June; 六人 - six people; 六時 - six o'clock             |
| 38 | 下     | below, down     | ka, shita, sagaru       | 下さい - please; 地下 - underground; 下がる - go down            |
| 39 | 来     | come            | rai, kuru               | 来る - come; 来年 - next year; 将来 - future                   |
| 40 | 気     | spirit, feeling | ki                      | 元気 - healthy/energetic; 天気 - weather; 気持ち - feeling      |
| 41 | 小     | small           | shou, chiisai           | 小さい - small; 小学校 - elementary school; 小鳥 - small bird    |
| 42 | 七     | seven           | shichi, nana            | 七月 - July; 七人 - seven people; 七時 - seven o'clock         |
| 43 | 山     | mountain        | san, yama               | 富士山 - Mount Fuji; 山道 - mountain road; 火山 - volcano       |
| 44 | 話     | talk, story     | wa, hanasu              | 話す - speak; 電話 - telephone; 会話 - conversation            |
| 45 | 女     | woman           | jo, onna                | 女性 - woman/female; 女子 - girl/female; 女の子 - girl          |
| 46 | 北     | north           | hoku, kita              | 北海道 - Hokkaido; 北口 - north exit; 東北 - Tohoku             |
| 47 | 午     | noon            | go                      | 午前 - AM; 午後 - PM; 正午 - noon                              |
| 48 | 百     | hundred         | hyaku                   | 百円 - 100 yen; 百人 - 100 people; 数百 - several hundred      |
| 49 | 書     | write, book     | sho, kaku               | 書く - write; 図書館 - library; 辞書 - dictionary               |
| 50 | 先     | ahead, previous | sen, saki               | 先生 - teacher; 先週 - last week; 先に - first/ahead           |

---

## AI01. Reference Corpus 51-75

|  # | Kanji | Core meaning   | Representative readings | Example vocabulary                                           |
| -: | ----- | -------------- | ----------------------- | ------------------------------------------------------------ |
| 51 | 名     | name           | mei, na                 | 名前 - name; 有名 - famous; 名字 - surname                         |
| 52 | 川     | river          | kawa                    | 川 - river; 河川 - waterways; 川口 - river mouth                  |
| 53 | 千     | thousand       | sen                     | 千円 - 1,000 yen; 千人 - 1,000 people; 数千 - several thousand     |
| 54 | 水     | water          | sui, mizu               | 水 - water; 水曜日 - Wednesday; 水泳 - swimming                    |
| 55 | 半     | half           | han                     | 半分 - half; 一時半 - 1:30; 半年 - half a year                      |
| 56 | 男     | man            | dan, otoko              | 男性 - male; 男の子 - boy; 男女 - men and women                     |
| 57 | 西     | west           | sei, nishi              | 西口 - west exit; 関西 - Kansai; 西日本 - western Japan             |
| 58 | 電     | electricity    | den                     | 電話 - telephone; 電車 - train; 電気 - electricity                 |
| 59 | 校     | school         | kou                     | 学校 - school; 高校 - high school; 校長 - principal                |
| 60 | 語     | language, word | go, kataru              | 日本語 - Japanese; 英語 - English; 単語 - vocabulary word           |
| 61 | 土     | earth, soil    | do, tsuchi              | 土曜日 - Saturday; 土地 - land; 土 - soil                          |
| 62 | 木     | tree, wood     | moku, ki                | 木曜日 - Thursday; 木 - tree; 木材 - lumber                        |
| 63 | 聞     | hear, ask      | bun, kiku               | 聞く - hear/ask; 新聞 - newspaper; 聞こえる - be audible             |
| 64 | 食     | eat, food      | shoku, taberu           | 食べる - eat; 食事 - meal; 食品 - food product                      |
| 65 | 車     | vehicle        | sha, kuruma             | 電車 - train; 車 - car; 自転車 - bicycle                           |
| 66 | 何     | what           | ka, nani, nan           | 何 - what; 何時 - what time; 何人 - how many people               |
| 67 | 南     | south          | nan, minami             | 南口 - south exit; 東南 - southeast; 南米 - South America          |
| 68 | 万     | ten thousand   | man                     | 一万 - ten thousand; 万円 - 10,000 yen; 万人 - ten thousand people |
| 69 | 毎     | every          | mai                     | 毎日 - every day; 毎週 - every week; 毎年 - every year             |
| 70 | 白     | white          | haku, shiro             | 白い - white; 面白い - interesting; 白紙 - blank paper              |
| 71 | 天     | heaven, sky    | ten                     | 天気 - weather; 天国 - heaven; 天才 - genius                       |
| 72 | 母     | mother         | bo, haha                | 母 - one's mother; お母さん - mother; 母国 - mother country         |
| 73 | 火     | fire           | ka, hi                  | 火曜日 - Tuesday; 火事 - fire; 花火 - fireworks                     |
| 74 | 右     | right          | u, migi                 | 右 - right; 右手 - right hand; 左右 - left and right              |
| 75 | 読     | read           | doku, yomu              | 読む - read; 読書 - reading; 読者 - reader                         |

---

## AJ01. Reference Corpus 76-100

|   # | Kanji | Core meaning             | Representative readings | Example vocabulary                                 |
| --: | ----- | ------------------------ | ----------------------- | -------------------------------------------------- |
|  76 | 友     | friend                   | yuu, tomo               | 友達 - friend; 友人 - friend; 親友 - close friend        |
|  77 | 左     | left                     | sa, hidari              | 左 - left; 左手 - left hand; 左右 - left and right      |
|  78 | 休     | rest                     | kyuu, yasumu            | 休む - rest; 休日 - holiday; 夏休み - summer vacation     |
|  79 | 父     | father                   | fu, chichi              | 父 - one's father; お父さん - father; 父親 - father       |
|  80 | 雨     | rain                     | u, ame                  | 雨 - rain; 大雨 - heavy rain; 梅雨 - rainy season       |
|  81 | 会     | meet, association        | kai, au                 | 会う - meet; 会社 - company; 会話 - conversation         |
|  82 | 同     | same                     | dou, onaji              | 同じ - same; 同時 - simultaneous; 同意 - agreement       |
|  83 | 事     | thing, matter            | ji, koto                | 仕事 - work; 大事 - important; 食事 - meal               |
|  84 | 自     | self                     | ji, mizukara            | 自分 - oneself; 自動 - automatic; 自由 - freedom         |
|  85 | 社     | company, shrine, society | sha                     | 会社 - company; 社会 - society; 神社 - shrine            |
|  86 | 発     | departure, emit          | hatsu, hotsu            | 出発 - departure; 発見 - discovery; 発音 - pronunciation |
|  87 | 者     | person                   | sha, mono               | 医者 - doctor; 若者 - young person; 読者 - reader        |
|  88 | 地     | ground, place            | chi, ji                 | 地図 - map; 地下 - underground; 地球 - Earth             |
|  89 | 業     | work, business           | gyou                    | 授業 - lesson; 工業 - industry; 営業 - business/sales    |
|  90 | 方     | direction, way, person   | hou, kata               | 方法 - method; 地方 - region; 方 - person/way           |
|  91 | 新     | new                      | shin, atarashii         | 新しい - new; 新聞 - newspaper; 新年 - New Year           |
|  92 | 場     | place                    | jou, ba                 | 場所 - place; 工場 - factory; 会場 - venue               |
|  93 | 員     | member, employee         | in                      | 会社員 - company employee; 店員 - clerk; 全員 - everyone  |
|  94 | 立     | stand                    | ritsu, tatsu            | 立つ - stand; 国立 - national; 立場 - standpoint         |
|  95 | 開     | open                     | kai, hiraku, akeru      | 開く - open; 開始 - start; 開発 - development            |
|  96 | 手     | hand                     | shu, te                 | 手 - hand; 上手 - skillful; 相手 - partner/opponent     |
|  97 | 力     | power                    | ryoku, chikara          | 力 - strength; 能力 - ability; 努力 - effort            |
|  98 | 問     | question, problem        | mon, tou                | 問題 - problem; 質問 - question; 問う - ask              |
|  99 | 代     | generation, substitute   | dai, kawari             | 時代 - era; 代わり - substitute; 現代 - modern era        |
| 100 | 明     | bright, clear            | mei, akaru              | 明日 - tomorrow; 説明 - explanation; 明るい - bright      |

---

## AK01. Rich Vocabulary Example: 生

`生` shall demonstrate that individual cards may contain vocabulary pools richer than what is displayed during a single card cycle.

| Japanese | Reading | Romaji   | Meaning            |
| -------- | ------- | -------- | ------------------ |
| 学生       | がくせい    | gakusei  | student            |
| 先生       | せんせい    | sensei   | teacher            |
| 生活       | せいかつ    | seikatsu | daily life, living |
| 生まれる     | うまれる    | umareru  | to be born         |
| 人生       | じんせい    | jinsei   | life               |
| 生徒       | せいと     | seito    | pupil              |
| 一生       | いっしょう   | isshou   | lifetime           |
| 生きる      | いきる     | ikiru    | to live            |

A card appearance shall normally choose only two.

---

## AL01. Rich Card Example: 鳥

A representative rich card schema is:

```js
{
    kanji: "鳥",
    meanings: ["bird"],

    readings: {
        on: ["チョウ"],
        kun: ["とり"]
    },

    romaji: {
        on: ["chou"],
        kun: ["tori"]
    },

    examples: [
        {
            word: "小鳥",
            reading: "ことり",
            romaji: "kotori",
            meaning: "small bird"
        },
        {
            word: "鳥類",
            reading: "ちょうるい",
            romaji: "chourui",
            meaning: "birds; class Aves"
        },
        {
            word: "野鳥",
            reading: "やちょう",
            romaji: "yachou",
            meaning: "wild bird"
        }
    ],

    sentences: [
        {
            japanese: "小鳥が木にいます。",
            reading: "ことり が き に います。",
            romaji: "Kotori ga ki ni imasu.",
            meaning: "There is a small bird in the tree."
        },
        {
            japanese: "鳥が飛ぶ。",
            reading: "とり が とぶ。",
            romaji: "Tori ga tobu.",
            meaning: "A bird flies."
        }
    ]
}
```

The schema shall support future expansion without requiring a rendering-architecture rewrite.

---

## AM01. Screen Composition

Target composition:

```text
0 ------------------------------------------------ 480
|
|                    subtle halo
|
|                       鳥
|
|
|
|
|                                     23:14
270
```

Answered composition:

```text
0 ------------------------------------------------ 480
|
|                       鳥
|
|                      とり
|                      tori
|                      bird
|
|
|                                     23:14
270
```

Vocabulary retrieval:

```text
0 ------------------------------------------------ 480
|
|
|                     小鳥
|
|
|
|
|                                     23:14
270
```

Vocabulary answer:

```text
0 ------------------------------------------------ 480
|
|                    ことり
|                     小鳥
|                    kotori
|                  small bird
|
|
|                                     23:14
270
```

The apparent simplicity is intentional.

---

## AN01. Final Requirements Matrix

| ID      | Requirement                                                                                                              |
| ------- | ------------------------------------------------------------------------------------------------------------------------ |
| KPP-001 | Educational content shall be rendered to an HTML canvas.                                                                 |
| KPP-002 | The canvas shall be convertible into a video-compatible `MediaStream`.                                                   |
| KPP-003 | The stream shall be assigned to a muted HTML video element.                                                              |
| KPP-004 | One explicit user control shall request Picture-in-Picture.                                                              |
| KPP-005 | The ordinary canvas application shall continue if PiP is unavailable.                                                    |
| KPP-006 | The source canvas shall be 480 x 270.                                                                                    |
| KPP-007 | PiP composition shall prioritize small-window readability.                                                               |
| KPP-008 | The visual foundation shall be actual black.                                                                             |
| KPP-009 | Ambient backgrounds shall remain low-luminance and low-motion.                                                           |
| KPP-010 | A 24-hour clock shall remain visible during normal educational phases.                                                   |
| KPP-011 | Clock seconds shall be disabled by default.                                                                              |
| KPP-012 | A kanji shall initially appear without its answer.                                                                       |
| KPP-013 | Reading and meaning shall be revealed later.                                                                             |
| KPP-014 | Vocabulary shall initially appear without explanation.                                                                   |
| KPP-015 | Vocabulary kana, romaji, and meaning shall appear later.                                                                 |
| KPP-016 | Sentence layouts shall replace rather than accumulate beneath the main layout.                                           |
| KPP-017 | Card timing shall derive from one configurable cycle duration.                                                           |
| KPP-018 | The default card duration shall be approximately 20 minutes.                                                             |
| KPP-019 | Shorter durations shall require no phase-logic rewrite.                                                                  |
| KPP-020 | The initial corpus shall contain exactly 100 kanji.                                                                      |
| KPP-021 | Kanji order shall be shuffled.                                                                                           |
| KPP-022 | Immediate repetition across shuffle boundaries shall be avoided.                                                         |
| KPP-023 | Vocabulary examples shall vary between repeat appearances where possible.                                                |
| KPP-024 | Kana shall be canonical display reading data.                                                                            |
| KPP-025 | Romaji shall be supporting learner data.                                                                                 |
| KPP-026 | Animation shall remain slow and restrained.                                                                              |
| KPP-027 | Main transitions shall ordinarily last multiple seconds.                                                                 |
| KPP-028 | Static phases shall avoid unnecessary redraw work.                                                                       |
| KPP-029 | Canvas stream capture shall use approximately 10 FPS.                                                                    |
| KPP-030 | Explicit `requestFrame()` capture may remain a future optimization.                                                      |
| KPP-031 | Background randomness shall be generated primarily at card boundaries.                                                   |
| KPP-032 | Ambient background components shall be cached.                                                                           |
| KPP-033 | No backend shall be required.                                                                                            |
| KPP-034 | No database shall be required.                                                                                           |
| KPP-035 | No application framework shall be required.                                                                              |
| KPP-036 | No runtime package dependency shall be required.                                                                         |
| KPP-037 | No settings UI shall be required.                                                                                        |
| KPP-038 | Primary configuration shall remain readable JavaScript data.                                                             |
| KPP-039 | No sound shall be produced.                                                                                              |
| KPP-040 | The application shall not claim to override system locking or policy.                                                    |
| KPP-041 | The production release shall consist of one HTML file.                                                                   |
| KPP-042 | The production HTML shall contain its CSS inline.                                                                        |
| KPP-043 | The production HTML shall contain its JavaScript inline.                                                                 |
| KPP-044 | The production HTML shall contain the complete 100-kanji corpus inline.                                                  |
| KPP-045 | The production artifact shall have no external script dependency.                                                        |
| KPP-046 | The production artifact shall have no external stylesheet dependency.                                                    |
| KPP-047 | The production artifact shall have no remote-font dependency.                                                            |
| KPP-048 | The production artifact shall require no runtime network connection.                                                     |
| KPP-049 | The production artifact shall use a restrictive Content Security Policy.                                                 |
| KPP-050 | Inline production code shall be authorized by exact CSP hashes rather than unrestricted `unsafe-inline` where practical. |
| KPP-051 | Recoverable errors shall be displayed using safe text insertion.                                                         |
| KPP-052 | Production code shall avoid `eval` and equivalent dynamic code execution.                                                |
| KPP-053 | The application shall honor `prefers-reduced-motion`.                                                                    |
| KPP-054 | Corpus structure shall be validated before normal execution.                                                             |
| KPP-055 | The production application shall not contain development TODO placeholders.                                              |
| KPP-056 | The production application shall not contain test harnesses or development-only validation UI.                           |
| KPP-057 | Production rendering and state transitions shall remain plain JavaScript.                                                |
| KPP-058 | JavaScript source shall remain compatible with static JSDoc/TypeScript checking during development.                      |
| KPP-059 | Browser API failures shall not stop the educational timeline.                                                            |
| KPP-060 | The final application shall remain understandable and maintainable despite single-file packaging.                        |

---

## AO01. Final Production Implementation

The final production implementation shall use the following baseline:

| Area                 | Production decision                                                   |
| -------------------- | --------------------------------------------------------------------- |
| Packaging            | One self-contained HTML file                                          |
| Filename             | `kanji-pip.html`                                                      |
| Canvas               | 480 x 270                                                             |
| Capture rate         | Approximately 10 FPS                                                  |
| Corpus               | 100 hardcoded kanji                                                   |
| Deck                 | Shuffled                                                              |
| Examples             | Two vocabulary examples per appearance where possible                 |
| Timeline             | 20-minute relative cycle                                              |
| Themes               | Black-based internal palette selection                                |
| Background           | Cached                                                                |
| Main transitions     | Soft fade, small drift, glow decay, cross-dissolve, slow accent shift |
| Kanji font           | System Mincho-style fallback stack                                    |
| Supporting font      | System sans-serif                                                     |
| Clock                | Local 24-hour time                                                    |
| Seconds              | Disabled by default                                                   |
| Main user action     | Enter/exit Picture-in-Picture                                         |
| Backend              | None                                                                  |
| Database             | None                                                                  |
| Build step           | None required for runtime                                             |
| Framework            | None                                                                  |
| Runtime dependencies | None                                                                  |
| External fonts       | None                                                                  |
| External images      | None                                                                  |
| Network requests     | None                                                                  |

Everything following activation shall proceed automatically.

---

## AP01. Intended Final Experience

The finished application shall not feel like a conventional website squeezed into a Picture-in-Picture window.

It shall behave like a small autonomous ambient object.

At one moment:

```text
鳥
```

Several minutes later:

```text
鳥
とり
tori
bird
```

Later:

```text
小鳥
```

Then:

```text
ことり
小鳥
kotori
small bird
```

Then nearly empty:

```text
                         14:28
```

Then:

```text
水
```

The user should be able to return attention to ordinary work and forget that the application is running.

When the user happens to look toward the PiP window, a small Japanese retrieval problem should be waiting there.

The application does not demand study time.

It converts peripheral screen space into repeated low-intensity exposure to useful Japanese.

That is the defining design principle of Kanji PiP.

---

## AQ00. Development Validation Specification

The production runtime shall remain plain JavaScript, but development validation should apply stricter tooling.

JavaScript may use TypeScript-compatible JSDoc annotations.

Development type checking should use TypeScript `checkJs`.

Recommended compiler validation includes:

```text
strict type checking
noImplicitAny
noImplicitReturns
unused-variable checking
unused-parameter checking where practical
switch fallthrough checking
DOM type validation
nullable-state validation
```

Behavioral validation shall cover at minimum:

```text
exactly 100 unique kanji
corpus schema validity
timeline boundary mapping
clock formatting
shuffling without source mutation
shuffle-boundary non-repetition
example variation
kana/romaji independence
selection invariants
```

Property-style tests should execute shuffle and selection behavior across thousands of iterations.

JavaScript syntax shall be checked using Node.js parser validation.

CSS shall be syntactically parsed during development.

Static security validation should verify that production code does not introduce:

```text
unexpected remote dependencies
eval
dynamic script loading
unrequired browser permissions
persistent tracking state
unsafe HTML injection
development TODO placeholders
```

Optional third-party development tooling may include:

```text
ESLint
TypeScript
Prettier
Stylelint
HTML Validate
PostCSS
```

These tools are development-only and shall not be included in the production release.

---

## AR00. Production Security and Release Specification

The final release artifact shall be:

```text
kanji-pip.html
```

It shall be directly distributable as one file.

The file shall contain no production dependency on Node.js or npm.

Node.js tooling is used only for development and release validation.

The final artifact shall use a restrictive Content Security Policy.

Because CSS and JavaScript are embedded directly inside the file, the production CSP should authorize the exact embedded content through cryptographic hashes rather than globally enabling arbitrary inline execution.

The final artifact shall not require:

```text
connect-src network access
remote scripts
remote CSS
remote fonts
remote images
remote APIs
analytics services
tracking services
service accounts
application accounts
cloud storage
```

The application shall avoid dynamic code evaluation.

The application shall avoid inserting untrusted strings as HTML.

User-visible errors shall use `textContent` or equivalent safe text rendering.

The application shall request no unnecessary browser permissions.

The production release shall exclude:

```text
tests
test pages
Node.js scripts
lint configurations
TypeScript configurations
package manifests
validation documentation
source maps
development artifacts
temporary files
```

Those files may exist in the development repository but are not part of the production distribution.

The production release is complete when the single HTML artifact contains the full application, the full educational corpus, the required styles, runtime logic, media transport, Picture-in-Picture handling, accessibility behavior, security policy, and all functionality described by this specification.
