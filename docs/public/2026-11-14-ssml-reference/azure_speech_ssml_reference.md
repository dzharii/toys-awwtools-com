# Azure Speech SSML: Narration, Acting, and Production Reference

**Printable, copyable technical reference | Researched 14 November 2026 | Microsoft Foundry / Azure AI Speech**

This guide covers Azure Speech SSML 1.0 and Microsoft `mstts:` extensions, including model-specific availability, natural narration techniques, expected acoustic effects, practical caution, and complete test samples. All examples use one physical line per spoken paragraph to avoid accidental input-newline artifacts in Foundry. Most samples are runnable independently. Features that require an external asset, personalized voice, supported SDK events, or preview service are marked explicitly.

## Important: choose the model first

**Dragon HD Omni (`en-US-Andrew:DragonHDOmniLatestNeural`)**: best target for the acting-style examples. Supports voice changes, expressive delivery, paragraph/sentence organization, `<sub>`, `<say-as>`, `<lang>`, and alias lexicons; does **not** support conventional `<break>`, `<prosody>`, `<emphasis>`, or `<phoneme>`.

**Dragon HD (`en-US-Jane:DragonHDLatestNeural`)**: supports `<break>` and `<phoneme>`, but not general prosody. Official documents conflict on direct `<mstts:express-as>` support in Dragon HD, although inline style markers are described; audition rather than assuming consistency.

**Standard neural (`en-US-JennyNeural`)**: broadest SSML functionality, though emotion styles, roles, and word-level emphasis are voice-specific.

**MAI Voice 2.1 / Flash**: distinct model family using SSML and model-specific expressive styles; preview status and availability must be checked. Do not transfer Dragon Omni style tokens blindly.

## Vocabulary for evaluating the result

**Timbre** is the color of the voice (warm, airy, dark, metallic). **Register** is the habitual pitch region and vocal placement. **Prosody** combines pitch variation, loudness, timing, stress, and phrasing. **Cadence** is the rhythmic trajectory of phrases. **Subtext** is the attitude beneath the literal words. **Dynamic range** is variation in intensity across a scene. **Breath group** is a phrase that sounds naturally spoken on one breath. **Rhetorical pivot** is a change from evidence to inference, or concern to resolution. **Acoustic contrast** is the difference that makes emphasis meaningful. **Underplaying** is intentionally withholding overt emotion to convey authority and sincerity.

## 01. `<speak>` and namespaces

**Compatibility:** All Azure Speech SSML-capable models.

The document root establishes XML/SSML syntax and the default speaking locale. The default SSML namespace gives ordinary tags their meaning; the `mstts` namespace enables Microsoft extensions. The namespace URI is an identifier and is not fetched over the network. Missing namespaces, unclosed tags, unescaped ampersands, or invalid XML attributes cause parsing errors.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-Andrew:DragonHDOmniLatestNeural">
    The first rule is to make the XML valid.
  </voice>
</speak>
```

**When not to use it.** Do not confuse a bare text input with SSML mode. Avoid HTML formatting tags such as `<b>` or `<strong>`; they are not SSML prosody controls.

## 02. `<voice name>`

**Compatibility:** Dragon HD Omni and Dragon HD; standard neural also supports it.

The largest audible change: it selects voice identity and model. Switching voices changes vocal timbre, register, accent, diction, and habitual cadence. A second voice can distinguish testimony from policy proposals, but too many changes create a staged or synthetic ensemble.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
  <voice name="en-US-Andrew:DragonHDOmniLatestNeural">We need to explain why this matters.</voice>
  <voice name="en-US-Caleb:DragonHDOmniLatestNeural">And then we need to decide what to do.</voice>
</speak>
```

**When not to use it.** Do not switch voices in the middle of a continuous sentence, or only to underline one adjective. Adjacent voices can sound like a hard edit.

## 03. `<p>`

**Compatibility:** Omni, HD, and standard.

A paragraph boundary tells the engine this is a new thought. Expect a discourse reset or meaningful pause, sometimes more pronounced than plain punctuation. Use for section transitions and a change of rhetorical purpose, not after every assertion.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-Andrew:DragonHDOmniLatestNeural">
    <p>We have heard the concerns. We understand their consequences.</p>
    <p>Now we need to decide what comes next.</p>
  </voice>
</speak>
```

**When not to use it.** Avoid for every sentence. Two paragraph elements can create a larger pause than expected.

## 04. `<s>`

**Compatibility:** Omni, HD, and standard.

Explicitly marks a sentence inside a paragraph. It can help where punctuation is ambiguous or text is generated, but usually automatic sentence detection is sufficient. It is a syntactic boundary rather than a dramatic emotion instruction.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-Andrew:DragonHDOmniLatestNeural">
    <p><s>This is the problem.</s><s>Here is what we can change.</s></p>
  </voice>
</speak>
```

**When not to use it.** Do not wrap every sentence if the natural parser already reads it well.

## 05. Physical source newlines and punctuation

**Compatibility:** All models; exact behavior is engine-dependent.

SSML does not define a bare XML newline as an explicit pause. However, a particular Foundry input path or preprocessing implementation can react to newlines or sentence segmentation. For predictable narration, keep each spoken paragraph on one physical source line, use punctuation for microtiming, and use `<p>` only for deliberate structural breaks. A comma suggests continuance; a period establishes resolution; a semicolon connects related independent thoughts; a colon creates anticipation; a question mark encourages a rising or interrogative contour. An ellipsis may create hesitation, but it is less deterministic than a supported pause tag.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-Andrew:DragonHDOmniLatestNeural">
    <p>We have a responsibility to act. Not because it is convenient, but because it matters.</p>
    <p>What happens next depends on us.</p>
  </voice>
</speak>
```

**When not to use it.** Avoid mechanically adding ellipses for every dramatic beat. They can make a sincere letter sound melodramatic.

## 06. XML comments and escaped characters

**Compatibility:** All models.

An XML comment is ignored by synthesis and can carry actor direction for people reading the source. Escape `&` as `&amp;` and `<` as `&lt;` in speech text. XML comments do not instruct the voice; their contents cannot replace proper SSML control.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-Andrew:DragonHDOmniLatestNeural">
    <!-- Direction for editors: composed opening, no theatrical urgency. -->
    <p>Research &amp; engineering should serve people, not the other way around.</p>
  </voice>
</speak>
```

**When not to use it.** Never place a literal `<` or unescaped `&` in text.

## 07. `mstts:express-as style`

**Compatibility:** Dragon HD Omni; individual standard neural and MAI voices when documented. Dragon HD compatibility documentation conflicts.

The central expressive extension. It asks the neural model to deliver selected words with an attitude such as `concerned`, `reflective`, or `determined`. The audible changes can include vocal energy, intonation contour, phrase endings, perceived urgency, and degree of warmth. It is not a guaranteed effect: semantics and voice identity influence the result. A small span can create a sharp acoustic edit; a full sentence usually blends more naturally.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-Andrew:DragonHDOmniLatestNeural">
    <p>We have heard the concerns. <mstts:express-as style="determined">We cannot ignore them.</mstts:express-as> The next step is to act responsibly.</p>
  </voice>
</speak>
```

**When not to use it.** Do not wrap almost every sentence or stack several incompatible emotional styles. Prefer untagged natural delivery most of the time.

## 08. `mstts:express-as styledegree`

**Compatibility:** Only voices whose voice-specific style and styledegree capabilities are documented; JennyNeural explicitly supports cheerful; this illustrates reducing the intensity below the default.

In supported neural voices, `styledegree` scales the strength of the selected style between `0.01` and `2`, with `1` as the nominal strength. In perceptual terms, a gentle style degree may sound like a hint of concern; a high degree may feel stylized or theatrical. **Voice-specific caution:** the attribute can be ignored where unsupported; do not assume Dragon Omni obeys degree precisely.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-JennyNeural">
    <mstts:express-as style="cheerful" styledegree="0.5">We are glad to see steady progress.</mstts:express-as>
  </voice>
</speak>
```

**When not to use it.** Do not depend on a specific numerical degree to achieve repeatable emotion without auditioning the selected voice.

## 09. `mstts:express-as role`

**Compatibility:** Model/voice-specific; Microsoft documents role support for selected standard neural voices.

On specific standard neural voices, role-play changes apparent age and gender, primarily through pitch and intonation, while preserving the core voice identity. Recognized roles include `Girl`, `Boy`, `YoungAdultFemale`, `YoungAdultMale`, `OlderAdultFemale`, `OlderAdultMale`, `SeniorFemale`, and `SeniorMale`. This is more like one actor impersonating a character than casting a new actor.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="zh-CN">
  <voice name="zh-CN-XiaomoNeural">
    <mstts:express-as style="calm" role="OlderAdultMale">我知道这并不容易。</mstts:express-as>
  </voice>
</speak>
```

**When not to use it.** Do not assume role support for Andrew Omni or Jane Dragon HD. Use actual voice switches for a truly different character.

## 10. Inline `[style]` markers and `[Neutral]`

**Compatibility:** Documented for Dragon HD voice families; audition exact model.

HD voice implementations also document square-bracket performance markers in SSML or plain text, such as `[reflective]` and `[determined]`. They can be useful when an HD model does not support a particular XML tag. A marker can persist until reset, but the documentation notes paragraph and sentence boundary behavior that may return to default. Treat the square brackets as voice-model syntax, not generic SSML.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-Jane:DragonHDLatestNeural">
    [reflective] We had hoped for a better outcome. [Neutral] Yet there is still work we can do.
  </voice>
</speak>
```

**When not to use it.** Never assume arbitrary `[my-emotion]` syntax is recognized. Avoid using bracket tags inside a model family that might read them aloud.

## 11. `voice parameters`: temperature

**Compatibility:** Dragon HD Omni: documented 0.3–1.0, default 0.7; other HD defaults differ.

`temperature` controls randomness of acoustic generation. Lower values tend toward repeatable, stable phrasing, while higher values can introduce more spontaneous variation. It does not mean “more warmth” or “more sadness.” For a formal statement, a moderate value can preserve steadiness without flattening expression.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-Andrew:DragonHDOmniLatestNeural" parameters="temperature=0.65">
    <p>We need a response that is thoughtful, credible, and humane.</p>
  </voice>
</speak>
```

**When not to use it.** Avoid treating the parameter as an emotion knob. Very low settings may reduce expressive variation; high settings can damage consistency.

## 12. `voice parameters`: top_p and top_k

**Compatibility:** Dragon HD Omni: top_p 0.3–1.0 (default 0.7), top_k 1–50 (default 22).

`top_p` limits the probability mass from which generation samples; `top_k` caps the number of candidate options. At higher values, intonation and phrasing can vary more between renders; at lower values, output tends to be more deterministic. The exact audible difference depends on text, voice, and the seed-like internal generation conditions.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-Andrew:DragonHDOmniLatestNeural" parameters="temperature=0.7;top_p=0.7;top_k=22">
    <p>Change is difficult, but responsible leadership makes it possible.</p>
  </voice>
</speak>
```

**When not to use it.** Do not change all three parameters simultaneously when making a controlled comparison.

## 13. `voice parameters`: cfg_scale

**Compatibility:** Dragon HD Omni: documented 1.0–2.0, default 1.4.

This parameter affects adherence to textual context and speech speed in Dragon HD Omni. Higher values can be faster and more tightly aligned with the text; lower values can be slower but less context-aligned. This is not equivalent to conventional SSML rate control because changing it may also affect interpretation.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-Andrew:DragonHDOmniLatestNeural" parameters="temperature=0.7;top_p=0.7;cfg_scale=1.2">
    <p>We should proceed carefully, with confidence, and without unnecessary urgency.</p>
  </voice>
</speak>
```

**When not to use it.** Do not expect an exact percentage change in speaking speed.

## 14. `<lang xml:lang>`

**Compatibility:** Omni and HD support lang; multilingual standard voices do too.

Changes the intended language or accent for a passage within a multilingual voice. It should feel like the *same speaker* changing language rather than a new actor appearing. The accent result depends on the voice and whether that locale is supported.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-Andrew:DragonHDOmniLatestNeural">
    Thank you for your time. <lang xml:lang="es-ES">Muchas gracias por escuchar.</lang> Now we can continue.
  </voice>
</speak>
```

**When not to use it.** Do not apply an unsupported locale or use a monolingual standard voice.

## 15. `<sub alias>`

**Compatibility:** Omni, HD, standard.

Exact substitution for speech. Use it for acronyms, company names, jargon, difficult initialisms, or a display form whose natural reading is ambiguous. The listener hears the alias rather than the inner text. This is the safest pronunciation override in Dragon HD Omni.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-Andrew:DragonHDOmniLatestNeural">
    <p>The <sub alias="S and P five hundred">S&amp;P 500</sub> is one way of describing the market. Our <sub alias="O K R S">OKRs</sub> should not replace clear judgment.</p>
  </voice>
</speak>
```

**When not to use it.** Avoid aliases that insert rhetorical emphasis or alter meaning; they should correct pronunciation, not rewrite arguments.

## 16. `<say-as interpret-as>`

**Compatibility:** Omni, HD, and standard.

Interprets the text according to its semantic category. It is valuable for dates, ordinals, quantities, times, account numbers, abbreviations, and units. This changes pronunciation, not acting intensity. On a technical article, it reduces distracting errors that undermine credibility.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-Andrew:DragonHDOmniLatestNeural">
    <p>In <say-as interpret-as="date" format="mdy">11/14/2026</say-as>, we reached our <say-as interpret-as="ordinal">3rd</say-as> milestone. The budget is <say-as interpret-as="currency">199 USD</say-as>.</p>
  </voice>
</speak>
```

**When not to use it.** Do not use without checking the language and its supported interpret-as type; for tricky values an explicit `<sub>` can be more reliable.

### Every documented `say-as` interpretation (compact examples)

**`characters`** — spell letters individually; good for abbreviations. Use: `<say-as interpret-as="characters">AI</say-as>`.

**`spell-out`** — spell letters rather than treat as a word. Use: `<say-as interpret-as="spell-out">NASA</say-as>`.

**`alphanumeric`** — letter/digit sequence, with dash-defined grouping. Use: `<say-as interpret-as="alphanumeric" format="spell">AB-CD-12</say-as>`.

**`cardinal`** — two hundred fifty. Use: `<say-as interpret-as="cardinal">250</say-as>`.

**`number`** — cardinal synonym. Use: `<say-as interpret-as="number">250</say-as>`.

**`ordinal`** — twelfth. Use: `<say-as interpret-as="ordinal">12th</say-as>`.

**`number_digit`** — two zero four eight. Use: `<say-as interpret-as="number_digit">2048</say-as>`.

**`fraction`** — three eighths. Use: `<say-as interpret-as="fraction">3/8</say-as>`.

**`date`** — month, day, year reading. Use: `<say-as interpret-as="date" format="mdy">11/14/2026</say-as>`.

**`time`** — local clock-time reading. Use: `<say-as interpret-as="time" format="hms12">4:30pm</say-as>`.

**`duration`** — hours, minutes, seconds; English/Spanish. Use: `<say-as interpret-as="duration" format="hms">01:02:30</say-as>`.

**`telephone`** — telephone-style digits. Use: `<say-as interpret-as="telephone">(425) 555-0112</say-as>`.

**`currency`** — dollar and cents reading. Use: `<say-as interpret-as="currency">29.99 USD</say-as>`.

**`unit`** — 15 kilometers. Use: `<say-as interpret-as="unit">15 km</say-as>`.

**`address`** — postal address expansion. Use: `<say-as interpret-as="address">1 Microsoft Way, Redmond, WA</say-as>`.

**`name`** — name-specific reading, most relevant for some languages. Use: `<say-as interpret-as="name">ED</say-as>`.

### Copy-and-play pronunciation audition

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
  <voice name="en-US-Andrew:DragonHDOmniLatestNeural">
    <p>The code is <say-as interpret-as="characters">AI</say-as>. The number is <say-as interpret-as="cardinal">250</say-as>. The position is <say-as interpret-as="ordinal">12th</say-as>.</p>
    <p>The code digits are <say-as interpret-as="number_digit">2048</say-as>. The fraction is <say-as interpret-as="fraction">3/8</say-as>. The date is <say-as interpret-as="date" format="mdy">11/14/2026</say-as>.</p>
    <p>The meeting is at <say-as interpret-as="time" format="hms12">4:30pm</say-as>. The price is <say-as interpret-as="currency">29.99 USD</say-as>. The distance is <say-as interpret-as="unit">15 km</say-as>.</p>
  </voice>
</speak>
```

**Format and detail:** `format` clarifies ambiguous dates (`dmy`, `mdy`, `ymd`, `ym`, `my`, `md`, `dm`, `d`, `m`, `y`), times (`hms12`, `hms24`), duration (`hms`, `hm`, `ms`), and special letter handling (`casesensitive`, `spell`). `detail` exists but its values are not standardized; do not invent one. Reading support varies by locale.

## 17. `<phoneme alphabet ph>`

**Compatibility:** Dragon HD and supported standard neural; not Omni.

Specifies exact pronunciation using IPA, SAPI, UPS, or X-SAMPA (depending on locale). Useful when a proper name is repeatedly pronounced incorrectly. This is more precise than an alias but harder to author. The model will articulate the supplied phones, and an invalid phone sequence can cause a request failure.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-Jane:DragonHDLatestNeural">
    <p>I prefer <phoneme alphabet="ipa" ph="tə.ˈmeɪ.toʊ">tomato</phoneme> in this sentence.</p>
  </voice>
</speak>
```

**When not to use it.** Do not use on Dragon HD Omni: Microsoft currently lists phoneme as unsupported. Do not guess IPA values for proper names without confirmation.

## 18. `<lexicon uri>`

**Compatibility:** Standard neural; HD and Omni alias-only; external file required.

References an external pronunciation dictionary in Pronunciation Lexicon Specification format. It applies consistent pronunciation substitutions across a text, useful for long narratives containing repeated names and acronyms. Dragon HD and Omni are documented as supporting only lexicon aliases, not phoneme mappings. This demonstration requires a real publicly accessible lexicon resource; the placeholder URL is not runnable.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-Andrew:DragonHDOmniLatestNeural">
    <lexicon uri="https://YOUR-HOST.example/terms.pls"/><p>Our OKRs must remain understandable.</p>
  </voice>
</speak>
```

**When not to use it.** For one or two corrections, prefer `<sub>`. With a large lexicon, verify cache behavior and locale matches.

A minimal external lexicon file, saved as `terms.pls` and hosted at the `uri` above:

```xml
<?xml version="1.0" encoding="utf-8"?>
<lexicon version="1.0" xmlns="http://www.w3.org/2005/01/pronunciation-lexicon" alphabet="ipa" xml:lang="en-US">
  <lexeme><grapheme>OKRs</grapheme><alias>O K R s</alias></lexeme>
  <lexeme><grapheme>SSML</grapheme><alias>S S M L</alias></lexeme>
</lexicon>
```

## 19. `<break>`

**Compatibility:** Dragon HD and standard; not Omni.

Explicit silence at a specific point. In Standard neural or Dragon HD, a pause around 250–400 ms can add a natural hesitation; 600–900 ms can mark a rhetorical pivot; a longer pause risks sounding like dead air. Microsoft supports `strength` values `x-weak`, `weak`, `medium`, `strong`, and `x-strong`, or `time` from 0 to 20,000 ms. `time` overrides `strength`.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-Jane:DragonHDLatestNeural">
    <p>We reviewed the evidence.<break time="350ms"/> Now we need to respond.</p>
  </voice>
</speak>
```

**When not to use it.** Do not use in Dragon HD Omni. Do not place after every comma or period: the synthesizer already supplies natural pauses.

## 20. `<mstts:silence>`

**Compatibility:** Standard neural; not Dragon HD or Omni.

Sets a class of silence consistently throughout a `voice` element. `Leading` and `Tailing` add silence to the natural boundary, `Leading-exact` and `Tailing-exact` set absolute silence, and `Sentenceboundary`/`Sentenceboundary-exact` set sentence transitions. There are also `Comma-exact`, `Semicolon-exact`, and `Enumerationcomma-exact`. This sounds like a global pause policy, not an isolated hesitation.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-JennyNeural">
    <mstts:silence type="Sentenceboundary-exact" value="300ms"/><p>Here is the first point. Here is the second point. Both matter.</p>
  </voice>
</speak>
```

**When not to use it.** Do not use for Omni or Dragon HD; fixed pauses at every sentence can become mechanical.

## 21. `<prosody rate>`

**Compatibility:** Standard neural.

Adjusts speaking speed without necessarily changing character or emotion. Around `rate="-8%"` may sound contemplative; `+10%` may sound energetic. Very slow speed can sound condescending or synthetic; very fast speed flattens complex arguments. Rate is not a strict words-per-minute guarantee.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-JennyNeural">
    <p>The normal version is straightforward. <prosody rate="-10%">This slower version gives the thought a little more time.</prosody></p>
  </voice>
</speak>
```

**When not to use it.** Not supported by Dragon HD or Dragon HD Omni.

## 22. `<prosody pitch>`

**Compatibility:** Standard neural.

Shifts baseline pitch relative to the selected voice. Lower pitch can feel weightier or more intimate; higher pitch can feel lighter or more urgent. Pitch alone does not create sincerity or authority.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-JennyNeural">
    <p>This is the baseline. <prosody pitch="-1st">This is slightly lower.</prosody> And this returns to normal.</p>
  </voice>
</speak>
```

**When not to use it.** Large shifts can sound like an unnatural impersonation. Not supported in HD/Omni.

## 23. `<prosody range>`

**Compatibility:** Standard neural.

Changes the extent of pitch movement, influencing how animated or monotone speech feels. A narrower range may sound controlled, understated, or flat. A broader range can sound lively, questioning, or theatrical. Azure documents the same value forms as `pitch`.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-JennyNeural">
    <prosody range="-10%">We should consider the matter with care and without unnecessary drama.</prosody>
  </voice>
</speak>
```

**When not to use it.** Overly narrow ranges produce lifeless delivery; high ranges can sound like commercial voiceover.

## 24. `<prosody contour>`

**Compatibility:** Standard neural.

Describes the pitch trajectory across an utterance using time-position pairs. A descending contour can suggest completion; an upward movement may suggest suspense or questioning. This is a specialist tool, not a generic emotion switch. Microsoft advises applying it to whole sentences rather than isolated words.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-JennyNeural">
    <prosody contour="(0%,+0st) (60%,-1st) (100%,-2st)">This is the conclusion of our argument.</prosody>
  </voice>
</speak>
```

**When not to use it.** Not for Dragon HD or Omni. Do not micromanage the contour before hearing a natural rendering.

## 25. `<prosody volume>`

**Compatibility:** Standard neural.

Adjusts relative loudness. A slight reduction can produce an intimate feel; a slight increase can strengthen audibility. **Loudness is not emotion**: increasing volume does not necessarily create determination. Use audio mastering for final loudness consistency.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-JennyNeural">
    <p>This is spoken normally. <prosody volume="-10%">This feels somewhat more intimate.</prosody> Now we return.</p>
  </voice>
</speak>
```

**When not to use it.** Avoid extreme levels and rapid variation. No Dragon HD or Omni support.

## 26. `<emphasis level>`

**Compatibility:** Only these specific standard neural voices; not HD/Omni.

Adds or reduces lexical stress in a restricted set of standard neural voices. Options: `reduced`, `none`, `moderate`, and `strong`. This is closest to typographic bold, but the effect is acoustic stress, not visual boldness. A shift may be subtle or absent for words whose natural pitch and duration are short.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-JaneNeural">
    <p>We need <emphasis level="strong">worker input</emphasis>, not merely worker compliance.</p>
  </voice>
</speak>
```

**When not to use it.** Do not assume `en-US-Jane:DragonHDLatestNeural` has this support. Microsoft lists `en-US-GuyNeural`, `en-US-DavisNeural`, and `en-US-JaneNeural` for word-level emphasis.

## 27. `<audio src>`

**Compatibility:** Standard neural; external audio required.

Inserts a prerecorded clip between synthesized speech, such as a cue or short recorded quote. A child text string acts as fallback if the clip cannot be played. The resulting listener experience is a media edit, not a single voice performance. **The example requires a real HTTPS-hosted audio asset**.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-JennyNeural">
    <p>Here is the cue. <audio src="https://YOUR-HOST.example/cue.wav">The cue is unavailable.</audio> Let us continue.</p>
  </voice>
</speak>
```

**When not to use it.** Do not use with Dragon HD or Omni; do not reference a fake asset and expect immediate playback. Microsoft documents supported audio formats and a total response-duration limit.

## 28. `<mstts:backgroundaudio>`

**Compatibility:** Standard neural; external audio required.

Mixes a looping audio bed beneath the synthesized speech with optional `volume`, `fadein`, and `fadeout`. It has a cinematic effect, supplying atmosphere and a continuous scene rather than altering the narrator. It must be the first child of `<speak>`. **A real HTTPS file is required**.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <mstts:backgroundaudio src="https://YOUR-HOST.example/ambient.wav" volume="0.7" fadein="1500" fadeout="2000"/>
  <voice name="en-US-JennyNeural"><p>Our story begins with a simple question.</p></voice>
</speak>
```

**When not to use it.** Avoid for documentary or open letters where neutrality matters. Never mask speech. Not HD/Omni.

## 29. `<mstts:audioduration>`

**Compatibility:** Standard neural.

Requests a specific total output length within the containing voice, causing a broad rate adjustment to fit. This is a synchronization tool for a video, advertisement, or presentation slide, not a naturalness control. Supported values are bounded by the original duration and a 300-second setting limit.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-JennyNeural">
    <mstts:audioduration value="12s"/><p>Our organization can become more thoughtful, more transparent, and more responsible when we choose to work together.</p>
  </voice>
</speak>
```

**When not to use it.** Do not use on HD/Omni; duration will not be exact if the request is outside supported scaling bounds.

## 30. `<bookmark mark>`

**Compatibility:** Standard neural with event subscription.

Inserts a nonspoken marker for timing. With the Speech SDK, a `BookmarkReached` event reports when the synthesized audio crosses it. The audible track is unchanged. Use for subtitles, synchronized graphics, or downstream editing.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-JennyNeural">
    <p>First, understand the issue. <bookmark mark="start_solution"/> Second, design the response.</p>
  </voice>
</speak>
```

**When not to use it.** Do not expect a visible mark or audible effect in Foundry. Event handling requires the SDK. Not HD/Omni.

## 31. `<mstts:viseme>`

**Compatibility:** Supported standard neural voices and locales.

Requests mouth-shape timing for animation. `redlips_front` provides viseme IDs with offsets; `FacialExpression` requests blend-shape data for supported languages and voices. It changes *metadata*, not the listener-facing audio. Its benefit is lip synchronization.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-AvaNeural">
    <mstts:viseme type="FacialExpression"/><p>Welcome to the presentation.</p>
  </voice>
</speak>
```

**When not to use it.** Not an audible effect; not supported on Dragon HD/Omni. Needs SDK event consumption.

## 32. `<mstts:dialog>` and `<mstts:turn>`

**Compatibility:** Special multi-talker Dragon HD models only.

A special multi-talker voice produces a jointly contextualized conversation between named speakers. Compared with two separate `<voice>` sections, it can preserve more natural conversational timing, emotional continuity, and turn-taking. `speaker` values depend on the selected multi-talker model.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-MultiTalker-Ava-Andrew:DragonHDLatestNeural">
    <mstts:dialog>
      <mstts:turn speaker="ava">I think we should revisit the plan.</mstts:turn>
      <mstts:turn speaker="andrew">Agreed. Let us identify what can actually change.</mstts:turn>
    </mstts:dialog>
  </voice>
</speak>
```

**When not to use it.** Do not use this on an arbitrary single-talker voice such as Jane or Andrew Omni. The feature may be preview/restricted by region.

## 33. `<mstts:markdown>`

**Compatibility:** Documented for Azure Speech standard neural.

Reads the human content of CommonMark rather than speaking formatting syntax. A Markdown heading is rendered as words, and `**bold**` does not become an acoustic emphasis instruction; it is markup stripping. Useful for reading imported posts without cleaning every asterisk.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-JennyNeural">
    <mstts:markdown># The next chapter
This is a **serious** question.</mstts:markdown>
  </voice>
</speak>
```

**When not to use it.** Do not equate Markdown `**bold**` with expressive SSML emphasis. Compatibility is documented generally, but not listed among supported HD/Omni elements; verify before using it there.

## 34. `<mstts:prompt domain="Math"/>`

**Compatibility:** Supported speech math-reading voices/locales; do not assume HD/Omni.

Selects math-oriented normalization for a plain-text mathematical expression. It helps the voice interpret mathematical syntax as mathematics instead of arbitrary punctuation. It is a content-domain prompt, not an emotional actor prompt.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-AvaMultilingualNeural">
    <mstts:prompt domain="Math"/>x = (-b ± √(b² - 4ac)) / 2a
  </voice>
</speak>
```

**When not to use it.** Not a general-purpose natural-language emotion prompt. Voice/model support is narrower than the general SSML vocabulary.

## 35. `<mstts:mathspeechverbosity>`

**Compatibility:** Math-reading supported standard voices.

With math domain enabled, `level="verbose"` asks for more explicit reading of grouping such as parentheses. It improves semantic clarity in educational narration, but can make formulas lengthier and less fluid.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-AvaMultilingualNeural">
    <mstts:prompt domain="Math"/><mstts:mathspeechverbosity level="verbose"/>x = (-b ± √(b² - 4ac)) / 2a
  </voice>
</speak>
```

**When not to use it.** Avoid for fast-moving articles that mention only simple quantities.

## 36. `<math>` with MathML

**Compatibility:** Supported Azure standard neural math voices.

Represents mathematical structure explicitly with MathML. Instead of interpreting flat symbols, the synthesizer can distinguish superscripts, operators, and nested groupings. Useful in tutorials and mathematical audiobooks. This is a family of nested MathML tags; MathML itself is a standard separate from SSML.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
  <voice name="en-US-JennyNeural">
    <math xmlns="http://www.w3.org/1998/Math/MathML"><msup><mi>a</mi><mn>2</mn></msup><mo>+</mo><msup><mi>b</mi><mn>2</mn></msup><mo>=</mo><msup><mi>c</mi><mn>2</mn></msup></math>
  </voice>
</speak>
```

**When not to use it.** MathML is not available on HD/Omni per Microsoft compatibility page.

## 37. `<mstts:ttsembedding speakerProfileId>`

**Compatibility:** Special personal-voice workflow; not Dragon HD/Omni.

Links synthesis to a previously authorized personal voice profile. It changes voice identity based on an enrolled profile and therefore requires consent, setup, a real profile ID, and a compatible base model. This is not a public-voice styling effect.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="PhoenixV2Neural">
    <mstts:ttsembedding speakerProfileId="YOUR-REAL-PROFILE-ID">This is a personal voice test.</mstts:ttsembedding>
  </voice>
</speak>
```

**When not to use it.** Do not paste a fabricated profile ID and expect output. Do not treat this as unrestricted voice cloning.

## 38. `<mstts:voiceconversion>` (preview)

**Compatibility:** Special Azure voice-conversion preview.

Uses a prerecorded, authorized source voice recording for linguistic content, rhythm, pauses, and expressive contour while applying a supported target voice timbre. This is closer to a voice-to-voice performance transfer than text-to-speech narration. Most SSML prosody and pronunciation controls are ignored in conversion mode. **Requires an actual HTTPS audio URL and supported target voice.**

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-AvaMultilingualNeural">
    <mstts:voiceconversion url="https://YOUR-HOST.example/authorized-source.wav"/>
  </voice>
</speak>
```

**When not to use it.** Do not assume an actor-like result without supplying performed source audio. Not an HD/Omni default SSML feature.

## 39. `voice effect` equalization

**Compatibility:** Azure voice element, support depends on model/output pathway.

`effect="eq_car"` applies a device-oriented equalization for enclosed vehicles; `effect="eq_telecomhp8k"` targets narrowband 8-kHz telephony. This changes spectral clarity/brightness, not emotion or character intent.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-AvaMultilingualNeural" effect="eq_car">
    <p>This signal is optimized for a vehicle listening environment.</p>
  </voice>
</speak>
```

**When not to use it.** For studio mastering and ordinary headphones, avoid coloration unless the destination playback environment requires it.

## Complete emotional style palette for Dragon HD Omni

The following tokens are documented for Dragon HD Omni as of this reference. These descriptions are **listening expectations and performance interpretations**, not measurable guarantees. A style’s effect depends on the content and the selected voice. For ordinary narration, start with `reflective`, `concerned`, `serious`, `determined`, `reassuring`, `confident`, or neutral delivery.

**`amazed`** — genuine wonder; opened vowels, lifted energy.

**`amused`** — small private smile; playful inflection.

**`angry`** — focused irritation or hostility; sharper attack.

**`annoyed`** — controlled impatience; clipped delivery.

**`anxious`** — uncertain, restless tension and anticipatory intonation.

**`appreciative`** — sincere gratitude, warmer cadence.

**`calm`** — steady, relaxed, low-arousal delivery.

**`cautious`** — careful qualifying language, guarded phrasing.

**`concerned`** — empathetic gravity, subtle downturn and attention.

**`confident`** — assured, clean declarative cadence.

**`confused`** — searching pitch contour, uncertainty.

**`defeated`** — spent, reduced energy, resignation.

**`defensive`** — protected stance, slightly sharpened stress.

**`defiant`** — resistance and resolve; sometimes confrontational.

**`determined`** — forward purpose, firmer phrase endings.

**`disappointed`** — subdued regret; emotional withdrawal.

**`disgusted`** — audible distaste; avoid for serious neutral evidence.

**`doubtful`** — skeptical uncertainty and questioning inflection.

**`ecstatic`** — high-arousal excitement, unusually large dynamic range.

**`encouraging`** — supportive upward momentum.

**`excited`** — fast, energized enthusiasm.

**`fast`** — urgency via faster pacing (not a percentage guarantee).

**`fearful`** — audible apprehension and tension.

**`frustrated`** — blocked effort, compressed patience.

**`happy`** — light positive affect.

**`hesitant`** — uncertainty, delayed commitment.

**`hurt`** — vulnerable emotional injury.

**`impatient`** — compressed rhythm and forward pressure.

**`impressed`** — admiration and respectful surprise.

**`intrigued`** — curiosity with contained suspense.

**`joking`** — light comedic intention.

**`laughing`** — a voice colored by laughter.

**`optimistic`** — credible forward-looking possibility.

**`painful`** — physical or emotional strain.

**`panicked`** — intense loss of composure.

**`panting`** — breath-strained delivery.

**`pleading`** — vulnerable request and urgency.

**`proud`** — upright sense of accomplishment.

**`quiet`** — reduced vocal energy without guaranteed whisper.

**`reassuring`** — steady comfort and trust.

**`reflective`** — inward, measured consideration.

**`relieved`** — release of tension.

**`remorseful`** — ownership of harm; weighted regret.

**`resigned`** — acceptance without hope of immediate change.

**`sad`** — low-energy sorrow.

**`sarcastic`** — ironic distance between words and intent.

**`secretive`** — confidential, guarded delivery.

**`serious`** — formal, sober authority.

**`shocked`** — sudden surprise and disbelief.

**`shouting`** — projection, heightened loudness and intensity.

**`shy`** — socially inhibited, soft self-presentation.

**`skeptical`** — critical doubt, testing claims.

**`slow`** — slowed expressive pacing (not deterministic).

**`struggling`** — labored or effortful delivery.

**`surprised`** — immediate, bright reaction.

**`suspicious`** — wariness and guarded interpretation.

**`sympathetic`** — compassion and gentle emotional recognition.

**`terrified`** — extreme fear.

**`upset`** — emotional disturbance or distress.

**`urgent`** — focused time pressure.

**`whispering`** — intimate, breathy, low-projection speech; quieter in character rather than a guaranteed decibel reduction.

### Audition sample A — restraint and credibility

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-Andrew:DragonHDOmniLatestNeural">
    <p><mstts:express-as style="reflective">We believe that responsible decisions can change the future.</mstts:express-as></p>
    <p><mstts:express-as style="concerned">We believe that responsible decisions can change the future.</mstts:express-as></p>
    <p><mstts:express-as style="serious">We believe that responsible decisions can change the future.</mstts:express-as></p>
    <p><mstts:express-as style="determined">We believe that responsible decisions can change the future.</mstts:express-as></p>
    <p><mstts:express-as style="reassuring">We believe that responsible decisions can change the future.</mstts:express-as></p>
    <p><mstts:express-as style="confident">We believe that responsible decisions can change the future.</mstts:express-as></p>
    <p><mstts:express-as style="optimistic">We believe that responsible decisions can change the future.</mstts:express-as></p>
  </voice>
</speak>
```

### Audition sample B — tension, doubt, and vulnerability

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-Andrew:DragonHDOmniLatestNeural">
    <p><mstts:express-as style="hesitant">I thought we had a better plan than this.</mstts:express-as></p>
    <p><mstts:express-as style="cautious">I thought we had a better plan than this.</mstts:express-as></p>
    <p><mstts:express-as style="skeptical">I thought we had a better plan than this.</mstts:express-as></p>
    <p><mstts:express-as style="doubtful">I thought we had a better plan than this.</mstts:express-as></p>
    <p><mstts:express-as style="anxious">I thought we had a better plan than this.</mstts:express-as></p>
    <p><mstts:express-as style="disappointed">I thought we had a better plan than this.</mstts:express-as></p>
    <p><mstts:express-as style="resigned">I thought we had a better plan than this.</mstts:express-as></p>
  </voice>
</speak>
```

### Audition sample C — high arousal (mostly unsuitable for formal letters)

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-Andrew:DragonHDOmniLatestNeural">
    <p><mstts:express-as style="amazed">I cannot believe this is happening.</mstts:express-as></p>
    <p><mstts:express-as style="angry">I cannot believe this is happening.</mstts:express-as></p>
    <p><mstts:express-as style="excited">I cannot believe this is happening.</mstts:express-as></p>
    <p><mstts:express-as style="panicked">I cannot believe this is happening.</mstts:express-as></p>
    <p><mstts:express-as style="shouting">I cannot believe this is happening.</mstts:express-as></p>
    <p><mstts:express-as style="sarcastic">I cannot believe this is happening.</mstts:express-as></p>
    <p><mstts:express-as style="terrified">I cannot believe this is happening.</mstts:express-as></p>
  </voice>
</speak>
```

### Paralinguistic effects

**`laughter`** — a laugh or laughter-like vocal event. **`coughing`** — a cough. **`throat_clearing`** — clearing the throat. **`breathing`** — audible breath. **`sighing`** — a sigh. **`yawning`** — a yawn. These are performance events, not merely adjectives. For serious factual text, they usually reduce credibility unless dramaturgically justified. Their exact realization varies by voice and context.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-Andrew:DragonHDOmniLatestNeural">
    <p><mstts:express-as style="sighing">I suppose we have more work to do.</mstts:express-as></p>
    <p><mstts:express-as style="throat_clearing">May I have your attention for a moment?</mstts:express-as></p>
  </voice>
</speak>
```

## Combining tags: patterns that usually work

## 40. `<p>` + `<mstts:express-as>`: a rhetorical turning point

**Compatibility:** Omni.

Place an emotional span within a normal paragraph to preserve continuity while adding a small change in conviction. This gives the listener a normal context, then a short accented conclusion. Compared with isolating the emphasized sentence in a new paragraph, it avoids unnecessary silence.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-Andrew:DragonHDOmniLatestNeural">
    <p>We have studied the consequences, listened to concerns, and reviewed our options. <mstts:express-as style="determined">Now we need to make a decision.</mstts:express-as> Our next steps must be transparent.</p>
  </voice>
</speak>
```

**When not to use it.** Do not wrap all three sentences with different styles.

## 41. `<voice>` + `<p>`: ensemble narration with clear structural boundaries

**Compatibility:** Omni.

Switch voice only at a subject transition, and place a paragraph boundary within the new voice when moving to another topic. This feels like separate witnesses contributing to the same statement. It works best when voices share register and overall intensity.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
  <voice name="en-US-Andrew:DragonHDOmniLatestNeural"><p>We begin by explaining the problem.</p></voice>
  <voice name="en-US-Caleb:DragonHDOmniLatestNeural"><p>Next, we offer a practical solution.</p></voice>
</speak>
```

**When not to use it.** Do not rotate speakers on every sentence.

## 42. `<sub>` inside `mstts:express-as`: emotional delivery with correct terminology

**Compatibility:** Omni.

Acronym correction and emotion are different controls and can serve the same phrase. The pronunciation is stabilized while the surrounding passage gets a confident or serious contour.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-Andrew:DragonHDOmniLatestNeural">
    <p><mstts:express-as style="serious">Our <sub alias="O K R S">OKRs</sub> should never become more important than the people affected by them.</mstts:express-as></p>
  </voice>
</speak>
```

**When not to use it.** One pronunciation substitution should not change the meaning.

## 43. `<lang>` with expressive reading: bilingual but coherent persona

**Compatibility:** Omni multilingual.

Use the same multilingual actor for a quote in another language, then return to the main language. If the model permits style nested with `lang`, preserve a single emotional intent across the language switch, not a sudden character change.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-Andrew:DragonHDOmniLatestNeural">
    <p><mstts:express-as style="appreciative">Thank you for listening. <lang xml:lang="es-ES">Gracias por escuchar.</lang> We are grateful for your time.</mstts:express-as></p>
  </voice>
</speak>
```

**When not to use it.** Voice/locale support and nested handling can vary. Test a single language change before using it in a public production.

## 44. `<say-as>` with narrative structure

**Compatibility:** Omni and standard.

Use `say-as` where semantic errors would pull the listener out of the story, such as year numbers or large financial quantities. A correct, effortless pronunciation is more powerful than emotional exaggeration.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-Andrew:DragonHDOmniLatestNeural">
    <p>Our goal is to reach this commitment by <say-as interpret-as="date" format="y">2030</say-as>. We have already completed the <say-as interpret-as="ordinal">2nd</say-as> phase.</p>
  </voice>
</speak>
```

**When not to use it.** For plain years such as 2030, the default model may already pronounce correctly; add tags only if needed.

## 45. `<break>` + `<prosody>`: conventional neural voice only

**Compatibility:** Standard neural only.

In standard neural voices, timing and speed can work together. A slight slowdown before a conclusion plus a modest pause can make the argument feel considered and deliberate. This combination is **not supported on Dragon HD or Omni**, regardless of whether the XML parses.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-JennyNeural">
    <p>We have considered the alternatives. <break time="250ms"/><prosody rate="-8%">And this is the decision we reached.</prosody></p>
  </voice>
</speak>
```

**When not to use it.** Too much slow speech plus a long pause sounds artificially solemn.

## 46. `<prosody>` + `<emphasis>`: conventional neural voice with word stress

**Compatibility:** Supported standard neural voices only.

You can reduce the overall rate while emphasizing one critical expression, but only on the few standard voices where emphasis works. The effect resembles an actor deliberately weighting a phrase. A silent markdown `**bold**` cannot achieve this.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-JaneNeural">
    <p><prosody rate="-8%">We need <emphasis level="strong">real protections</emphasis>, not another slogan.</prosody></p>
  </voice>
</speak>
```

**When not to use it.** Not on Dragon HD Jane, and not on Dragon Omni.

## 47. `<mstts:express-as>` + many nested emotional tags: avoid

**Compatibility:** Omni.

Do not attempt to layer multiple conflicting styles by nesting `express-as` elements. Microsoft lists limited allowed child elements and this is not a reliable supported composition. Split adjacent spans if absolutely necessary, but prefer a single coherent style and allow the model to interpret the sentence naturally.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-Andrew:DragonHDOmniLatestNeural">
    <p><mstts:express-as style="reflective">We thought we understood the consequences.</mstts:express-as> <mstts:express-as style="determined">Now we know what must change.</mstts:express-as></p>
  </voice>
</speak>
```

**When not to use it.** Avoid a style change on every clause.

## 48. Emotion-free control: punctuation and contrast

**Compatibility:** Omni, HD, standard.

Often the most human effect comes from plain text with a clear argument. A question invites openness. A short sentence makes its point. A longer subordinate clause creates anticipation. The final short statement can feel decisive without an emotion label.

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-Andrew:DragonHDOmniLatestNeural">
    <p>We have reviewed the evidence. We have listened to people who disagree with us. We have considered the costs of acting and the costs of doing nothing. So what remains? A decision.</p>
  </voice>
</speak>
```

**When not to use it.** Do not turn every sentence into a single-word declaration; contrast needs normal cadence.

## Best-practice performance recipes

**Thoughtful opening:** choose Andrew Omni; normal paragraph containing one or two measured sentences. Add `reflective` only to the pivotal insight. Expected feel: listener hears a credible internal monologue, not a presenter trying to impress.

**Concerned testimony:** choose a voice naturally warm and composed. Let personal detail do the emotional work; add `concerned` only to one high-stakes assertion. Expected feel: proximity and vulnerability without sentimentality.

**Firm policy demands:** switch to a steady narrator at a major section boundary. Prefer natural statements plus at most one `determined` sentence at the section start. Expected feel: grounded accountability, not shouting.

**Hopeful ending:** return to the opening narrator. Use `optimistic` or `reassuring` sparingly, and end with a plain signature. Expected feel: earned possibility, not triumph.

**Technical article:** avoid all emotional tags for explanatory passages, use `<sub>` for terms and `<say-as>` for ambiguous numbers, and add just occasional `reflective` for interpretation. Expected feel: a smart colleague explaining something carefully.

### Reusable 60-second ensemble test

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-Andrew:DragonHDOmniLatestNeural"><p>We have a responsibility to understand how our decisions affect the people who use our products. <mstts:express-as style="reflective">That responsibility should change how we work.</mstts:express-as></p></voice>
  <voice name="en-US-Caleb:DragonHDOmniLatestNeural"><p><mstts:express-as style="determined">We can protect workers, respect communities, and act more transparently.</mstts:express-as> These should be practical commitments, not slogans.</p></voice>
  <voice name="en-US-Andrew:DragonHDOmniLatestNeural"><p>Change will take time. <mstts:express-as style="optimistic">But it is still within our reach.</mstts:express-as></p></voice>
</speak>
```

## Testing protocol: how to compare changes intelligently

**Baseline:** synthesize the exact same passage with no emotion tags, the same voice, and default model parameters. Listen for whether the default model already performs the semantics effectively.

**Single-variable tests:** keep the exact words, model, and voice constant while changing only one style, one paragraph boundary, or one parameter. This makes the result interpretable.

**A/B comparison:** render one passage with `concerned`, then with `reflective`, using identical wording. Compare how phrase endings, vocal energy, and stress placement change; do not choose solely by perceived drama.

**Continuity audition:** after selecting styles for individual sentences, listen to the entire paragraph. Short snippets can sound persuasive alone while producing an abrupt tonal jump in context.

**Headphone and speaker test:** check both. A close, breathy voice can sound intimate on headphones but muddy on phone speakers.

**Normalization:** use a consistent audio format and postproduction loudness target across independently synthesized acts. SSML cannot fix every mismatched voice level, room impression, or perceived distance.

**Regenerate carefully:** HD voices may vary slightly between synthesis runs. Prefer consistent settings and avoid comparing unrelated takes as if all differences came from a style tag.

## Troubleshooting and anti-patterns

**Tags are spoken aloud:** check that you selected SSML input mode. If using raw plain-text mode, the model may pronounce brackets or XML-like text.

**No audible change from `styledegree`:** the voice may ignore the attribute or the phrase may not naturally fit the style. Compare a compatible standard voice or use a more appropriate single style.

**The narrator pauses after every line:** move related sentences onto one source line, remove unnecessary `<p>` boundaries, and test direct SSML rather than copying Markdown-formatted paragraphs.

**A voice sounds fake:** try removing style tags before increasing them. Overacting often originates from abrupt style changes and unsuitable casting, not lack of control.

**`<prosody>` ignored:** check model family. Omni and Dragon HD do not support it.

**`<break>` ignored:** not supported on Omni. On HD or standard neural, test a short explicit pause and confirm the input is in SSML mode.

**`<emphasis>` ignored:** word-level stress is voice-specific and does not apply to HD/Omni.

**Invalid XML / HTTP 400:** check quote delimiters, namespace declaration, escaping, attribute names, and phonetic-phone validity.

**Different voice families fail in one request:** synthesize the sections separately and concatenate or verify that the chosen endpoint accepts both models.

**Markdown bold does not sound bold:** because bold is typographic notation, not an acoustic instruction. `mstts:markdown` strips syntax; it is not a stress control.

**Unwanted emotion in a factual letter:** reduce tag density; keep high-stakes factual claims neutral or serious and reserve explicit optimism for the conclusion.

## Feature inventory: all documented SSML and Azure-specific elements in scope

**Standard SSML:** `speak`, `voice`, `p`, `s`, `break`, `emphasis`, `lang`, `lexicon`, `math` (MathML), `audio`, `bookmark`, `phoneme`, `prosody`, `say-as`, `sub`.

**Microsoft-specific elements:** `mstts:express-as`, `mstts:silence`, `mstts:audioduration`, `mstts:backgroundaudio`, `mstts:ttsembedding`, `mstts:viseme`, `mstts:voiceconversion`, `mstts:dialog`, `mstts:turn`, `mstts:markdown`, `mstts:prompt`, `mstts:mathspeechverbosity`.

**Attributes and auxiliary controls:** `voice name`, `voice effect`, `voice parameters` (`temperature`, `top_p`, `top_k`, `cfg_scale`); `express-as style`, `styledegree`, `role`; `speak version`, `xml:lang`, namespaces; `say-as interpret-as`, `format`, `detail`; `prosody rate`, `pitch`, `range`, `contour`, `volume`; `break time`, `strength`; `phoneme alphabet`, `ph`; `audio src`; `lexicon uri`; `bookmark mark`; `viseme type`; `ttsembedding speakerProfileId`; `voiceconversion url`; `dialog turn speaker`.

**Not SSML:** `<b>`, `<strong>`, `<i>`, `<h1>`, `<div>`, and `<br>`; CSS styles; arbitrary invented `mstts:` names; unrecognized custom emotional words; XML comments as actor commands.

## Primary sources

https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup-structure

https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup-voice

https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup-pronunciation

https://learn.microsoft.com/en-us/azure/ai-services/speech-service/high-definition-voices

https://learn.microsoft.com/en-us/azure/ai-services/speech-service/mai-voices

https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support

**Scope and accuracy:** This covers the Azure Speech tags in the current published structure, pronunciation, voice, HD and MAI documentation, plus newer documented extensions that are not all shown in the simplified structure tree. It does not promise those tags are universally supported by every voice, model, region, API, or playground mode. Descriptions of how the result *feels* are informed editorial expectations, not results of audio audition in this session. Product documentation may change.

