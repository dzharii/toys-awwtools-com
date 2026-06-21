This specification describes the article file format for a Japanese writing guidance app. The app helps a learner practice Japanese by rewriting an article shown on the screen. The learner loads one prepared article file, the app breaks the article into sentences and typing tokens, and the learner types each highlighted token using romaji. The app shows the previous sentence for context, magnifies the current sentence, highlights the current token, and shows small romaji and meaning hints near the caret.

The file format exists to make that experience possible. It is not a general publishing format, not a flashcard format, and not a full HTML page. It is a compact lesson format that describes Japanese text, token boundaries, readings, romaji, meanings, timing hints, and optional embedded images. The format should be easy enough for a human or language model to author, and strict enough for the app to parse reliably.

---

A00 Japanese Article File Format Specification

---

This document defines the article file format supported by the Japanese typing and writing guidance app.

The article file is a self-contained lesson document. It contains the Japanese article, the typing tokens, romaji, meanings, optional readings, optional image anchors, and optional embedded image assets.

The format is HTML-compatible custom markup. It uses custom elements such as `jp-lesson`, `jp-section`, `jp-sentence`, and `jp-token`. The file can be parsed with normal browser DOM APIs, but the app must treat the file as data, not as executable HTML.

Recommended file extension:

```txt
.jp-lesson.xml
```

Example filename:

```txt
ueno-cinema-2026-06-19.jp-lesson.xml
```

The format intentionally does not require `id` attributes on lessons, sections, sentences, or tokens. This is an important authoring decision. Manually writing IDs for every token is too tedious and makes article creation harder than necessary. The app should generate internal identifiers automatically from document order.

---

B00 Core Design Rule: No Required IDs

---

The article format does not require authors to write IDs.

These elements must work without IDs:

```txt
jp-lesson
jp-section
jp-paragraph
jp-sentence
jp-token
```

The parser should auto-generate internal IDs after loading the file. For example, the first section can become internal section `section-0`, the first sentence can become `sentence-0`, and the first token can become `token-0`.

The app may support optional `id` attributes for diagnostics or advanced authoring, but they are never required for a valid lesson. If present, optional IDs should be treated as source metadata, not as required application state.

Valid token without ID:

```html
<jp-token text="映画館" reading="えいがかん" romaji="eigakan" meaning="movie theater" type="word" delay="medium"></jp-token>
```

Valid sentence without ID:

```html
<jp-sentence>
  <jp-token text="映画館" reading="えいがかん" romaji="eigakan" meaning="movie theater" type="word" delay="medium"></jp-token>
  <jp-token text="は" reading="は" romaji="wa" aliases="ha" meaning="topic marker" type="particle" delay="short"></jp-token>
  <jp-token text="駅" reading="えき" romaji="eki" meaning="station" type="word" delay="medium"></jp-token>
  <jp-token text="から" reading="から" romaji="kara" meaning="from" type="particle" delay="short"></jp-token>
  <jp-token text="近い" reading="ちかい" romaji="chikai" meaning="near" type="adjective" delay="medium"></jp-token>
  <jp-token text="です" reading="です" romaji="desu" meaning="is" type="word" delay="short"></jp-token>
  <jp-token text="。" type="punctuation" delay="short"></jp-token>
</jp-sentence>
```

The app renders this as:

```txt
映画館は駅から近いです。
```

The parser should preserve the written order and generate stable internal references from that order.

---

C00 Top-Level File Structure

---

The root element is `jp-lesson`.

A valid lesson must contain at least one `jp-section`, at least one `jp-sentence`, and at least one `jp-token`.

Minimal valid lesson:

```html
<jp-lesson title="上野の映画館" lang="ja" version="1.0">
  <jp-section title="はじめに">
    <jp-sentence>
      <jp-token text="上野" reading="うえの" romaji="ueno" meaning="Ueno" type="place" delay="medium"></jp-token>
      <jp-token text="で" reading="で" romaji="de" meaning="in / at" type="particle" delay="short"></jp-token>
      <jp-token text="映画" reading="えいが" romaji="eiga" meaning="movie" type="word" delay="medium"></jp-token>
      <jp-token text="を" reading="を" romaji="wo" aliases="o" meaning="object marker" type="particle" delay="short"></jp-token>
      <jp-token text="見ます" reading="みます" romaji="mimasu" meaning="watch" type="verb" delay="medium"></jp-token>
      <jp-token text="。" type="punctuation" delay="short"></jp-token>
    </jp-sentence>
  </jp-section>
</jp-lesson>
```

The app renders:

```txt
上野で映画を見ます。
```

Recommended `jp-lesson` attributes:

| Attribute |    Required | Meaning                              |
| --------- | ----------: | ------------------------------------ |
| `title`   | Recommended | Lesson title shown in the app header |
| `lang`    | Recommended | Lesson language; should be `ja`      |
| `version` | Recommended | Lesson format or authoring version   |

If `title` is missing, the app may show a default title such as `Untitled Article`.

If `lang` is missing, the app may assume `ja`.

If `version` is missing, the app may assume the current supported format version.

Invalid lesson:

```html
<jp-lesson>
  <jp-section>
    <jp-sentence>
      上野で映画を見ます。
    </jp-sentence>
  </jp-section>
</jp-lesson>
```

This is invalid because the sentence has no tokens.

---

D00 `jp-section`

---

`jp-section` groups related sentences.

A section can have a title, but it does not need an ID.

Example:

```html
<jp-section title="上野の映画館">
  <jp-sentence>
    ...
  </jp-sentence>
</jp-section>
```

Recommended attributes:

| Attribute | Required | Meaning                      |
| --------- | -------: | ---------------------------- |
| `title`   |       No | Human-readable section title |

Sections are useful for article organization and image anchoring. The app should preserve section order as written.

A lesson can contain multiple sections:

```html
<jp-lesson title="上野の映画館" lang="ja" version="1.0">
  <jp-section title="場所">
    ...
  </jp-section>

  <jp-section title="チケット">
    ...
  </jp-section>
</jp-lesson>
```

The app should treat all sections as one ordered article.

---

E00 `jp-paragraph`

---

`jp-paragraph` is optional.

It groups sentences into paragraphs. This is useful for exporting plain text and for aligning images with a specific part of the article.

Example:

```html
<jp-section title="上野の映画館">
  <jp-paragraph>
    <jp-sentence>
      ...
    </jp-sentence>

    <jp-sentence>
      ...
    </jp-sentence>
  </jp-paragraph>

  <jp-paragraph>
    <jp-sentence>
      ...
    </jp-sentence>
  </jp-paragraph>
</jp-section>
```

The app should support sentences directly inside `jp-section` and sentences inside `jp-paragraph`.

Both forms are valid:

```html
<jp-section title="映画">
  <jp-sentence>
    ...
  </jp-sentence>
</jp-section>
```

```html
<jp-section title="映画">
  <jp-paragraph>
    <jp-sentence>
      ...
    </jp-sentence>
  </jp-paragraph>
</jp-section>
```

If `jp-paragraph` exists, Tango export should preserve paragraph breaks when creating plain text.

---

F00 `jp-sentence`

---

`jp-sentence` defines one sentence-level practice unit.

The active sentence in the app is one `jp-sentence`. The app magnifies this sentence and moves through its tokens one by one.

Example:

```html
<jp-sentence>
  <jp-token text="今日は" reading="きょうは" romaji="kyou wa" meaning="today" type="phrase" delay="medium"></jp-token>
  <jp-token text="上野" reading="うえの" romaji="ueno" meaning="Ueno" type="place" delay="medium"></jp-token>
  <jp-token text="で" reading="で" romaji="de" meaning="in / at" type="particle" delay="short"></jp-token>
  <jp-token text="映画" reading="えいが" romaji="eiga" meaning="movie" type="word" delay="medium"></jp-token>
  <jp-token text="を" reading="を" romaji="wo" aliases="o" meaning="object marker" type="particle" delay="short"></jp-token>
  <jp-token text="見ます" reading="みます" romaji="mimasu" meaning="watch" type="verb" delay="medium"></jp-token>
  <jp-token text="。" type="punctuation" delay="short"></jp-token>
</jp-sentence>
```

The app renders:

```txt
今日は上野で映画を見ます。
```

Do not put plain sentence text directly inside `jp-sentence`.

Invalid:

```html
<jp-sentence>
  今日は上野で映画を見ます。
</jp-sentence>
```

The app cannot use this for guided typing because there are no token boundaries, no romaji, and no meanings.

---

G00 `jp-token`

---

`jp-token` is the main element of the format.

Each token represents one typing unit. A typing unit can be a word, a particle, punctuation, date, name, phrase, or other meaningful unit.

Required token attributes:

| Attribute | Required | Meaning               |
| --------- | -------: | --------------------- |
| `text`    |      Yes | Visible Japanese text |
| `type`    |      Yes | Token type            |

Conditionally required attributes:

| Attribute | Required when                             | Meaning               |
| --------- | ----------------------------------------- | --------------------- |
| `romaji`  | Required for typed non-punctuation tokens | Expected romaji input |

Strongly recommended attributes:

| Attribute | Meaning                                   |
| --------- | ----------------------------------------- |
| `reading` | Kana reading, especially useful for kanji |
| `meaning` | Short English gloss                       |
| `delay`   | Pacing hint: `short`, `medium`, or `long` |

Optional attributes:

| Attribute  | Meaning                                      |
| ---------- | -------------------------------------------- |
| `aliases`  | Comma-separated accepted romaji alternatives |
| `delay-ms` | Exact delay override in milliseconds         |
| `tags`     | Comma-separated metadata tags                |
| `note`     | Author note, not shown in normal practice    |

Example:

```html
<jp-token
  text="映画館"
  reading="えいがかん"
  romaji="eigakan"
  meaning="movie theater"
  type="word"
  delay="medium"
  tags="cinema,noun,beginner">
</jp-token>
```

Rendered token:

```txt
映画館
```

Active token display:

```txt
eigakan
映画館
movie theater
```

The default app UI should show romaji above the active token and meaning below it.

---

H00 Token Boundaries

---

The app must respect the token boundaries written by the author.

This is one token:

```html
<jp-token text="日本" reading="にほん" romaji="nihon" meaning="Japan" type="place" delay="medium"></jp-token>
```

The app should not split it into `日` and `本`.

This is also one token:

```html
<jp-token text="二枚ください" reading="にまいください" romaji="nimai kudasai" meaning="two tickets, please" type="phrase" delay="long"></jp-token>
```

Phrase tokens are allowed. They are useful when the learner should practice a common expression as one unit.

For grammar learning, particles should usually be separate tokens:

```html
<jp-token text="映画" reading="えいが" romaji="eiga" meaning="movie" type="word" delay="medium"></jp-token>
<jp-token text="を" reading="を" romaji="wo" aliases="o" meaning="object marker" type="particle" delay="short"></jp-token>
<jp-token text="見ます" reading="みます" romaji="mimasu" meaning="watch" type="verb" delay="medium"></jp-token>
```

Avoid over-tokenizing kanji compounds for normal practice.

Prefer:

```html
<jp-token text="映画館" reading="えいがかん" romaji="eigakan" meaning="movie theater" type="word" delay="medium"></jp-token>
```

Avoid:

```html
<jp-token text="映" reading="えい" romaji="ei" meaning="reflect" type="word" delay="short"></jp-token>
<jp-token text="画" reading="が" romaji="ga" meaning="picture" type="word" delay="short"></jp-token>
<jp-token text="館" reading="かん" romaji="kan" meaning="building" type="word" delay="short"></jp-token>
```

The second form may be useful for a kanji-component lesson, but it is not appropriate for normal article typing practice.

---

I00 Token Types

---

The `type` attribute describes the token's role.

Supported MVP token types:

| Type          | Meaning                               | Romaji required |
| ------------- | ------------------------------------- | --------------: |
| `word`        | Normal word                           |             Yes |
| `particle`    | Japanese particle                     |             Yes |
| `punctuation` | Punctuation mark                      |              No |
| `phrase`      | Multi-word or multi-part phrase       |             Yes |
| `name`        | Person, movie, place, brand, or title |     Usually yes |
| `date`        | Date expression                       |             Yes |
| `number`      | Number or counter expression          |             Yes |
| `place`       | Location name                         |             Yes |
| `verb`        | Verb or verb phrase                   |             Yes |
| `adjective`   | Adjective                             |             Yes |

Good examples:

```html
<jp-token text="を" reading="を" romaji="wo" aliases="o" meaning="object marker" type="particle" delay="short"></jp-token>
```

```html
<jp-token text="。" type="punctuation" delay="short"></jp-token>
```

```html
<jp-token text="2026年6月19日" reading="にせんにじゅうろくねんろくがつじゅうくにち" romaji="nisen nijuuroku nen rokugatsu juuku nichi" meaning="June 19, 2026" type="date" delay="long"></jp-token>
```

Invalid:

```html
<jp-token text="映画館"></jp-token>
```

This is invalid because it has no type and no typing metadata.

---

J00 Romaji and Aliases

---

`romaji` defines the expected input.

For kanji, romaji should match the intended reading.

Example:

```html
<jp-token text="東京" reading="とうきょう" romaji="toukyou" meaning="Tokyo" type="place" delay="medium"></jp-token>
```

Aliases should be comma-separated:

```html
<jp-token text="を" reading="を" romaji="wo" aliases="o" meaning="object marker" type="particle" delay="short"></jp-token>
```

Multiple aliases:

```html
<jp-token text="し" reading="し" romaji="shi" aliases="si" meaning="shi" type="word" delay="short"></jp-token>
```

Recommended common aliases:

| Japanese | Main romaji | Alias examples |
| -------- | ----------- | -------------- |
| し        | `shi`       | `si`           |
| ち        | `chi`       | `ti`           |
| つ        | `tsu`       | `tu`           |
| ふ        | `fu`        | `hu`           |
| じ        | `ji`        | `zi`           |
| を        | `wo`        | `o`            |
| ん        | `n`         | `nn,n'`        |

For words ending in `ん`, add aliases when useful:

```html
<jp-token text="本" reading="ほん" romaji="hon" aliases="honn,hon'" meaning="book" type="word" delay="medium"></jp-token>
```

Spaces are allowed in romaji for phrase tokens:

```html
<jp-token text="この映画をください" reading="このえいがをください" romaji="kono eiga wo kudasai" aliases="kono eiga o kudasai" meaning="this movie, please" type="phrase" delay="long"></jp-token>
```

Recommended input normalization:

| Input aspect                    | Normalization                       |
| ------------------------------- | ----------------------------------- |
| Leading and trailing spaces     | Trim                                |
| Multiple spaces in phrase input | Collapse to one space               |
| Letter case                     | Lowercase                           |
| Full-width Latin letters        | Optionally convert to ASCII         |
| Punctuation                     | Follow punctuation practice setting |

The article author should still write clean romaji.

---

K00 Reading and Meaning

---

`reading` is the kana reading.

It is optional for kana-only words but strongly recommended for kanji, names, dates, and movie titles.

Good examples:

```html
<jp-token text="上野" reading="うえの" romaji="ueno" meaning="Ueno" type="place" delay="medium"></jp-token>
```

```html
<jp-token text="映画" reading="えいが" romaji="eiga" meaning="movie" type="word" delay="medium"></jp-token>
```

`meaning` should be short. It is a hint, not a dictionary article.

Good meanings:

```txt
movie
movie theater
near
today
friend
two tickets, please
```

Avoid long meanings:

```txt
A cultural facility where people gather to watch films, usually with paid admission
```

That is too long for the caret hint.

If a word has multiple meanings, use the meaning that fits the article.

Example:

```html
<jp-token text="高い" reading="たかい" romaji="takai" meaning="expensive" type="adjective" delay="medium"></jp-token>
```

If the context means tall:

```html
<jp-token text="高い" reading="たかい" romaji="takai" meaning="tall" type="adjective" delay="medium"></jp-token>
```

---

L00 Delay

---

The `delay` attribute describes expected pacing.

It is not difficulty. It does not force the caret to move. It only helps the app decide whether a token was slow for reporting.

Supported named delay values:

| Value    | Use                                             |
| -------- | ----------------------------------------------- |
| `short`  | Particles, punctuation, very short common words |
| `medium` | Normal words                                    |
| `long`   | Dates, names, long words, phrases               |

Default app timing:

| Value    | Default |
| -------- | ------: |
| `short`  |  700 ms |
| `medium` | 1400 ms |
| `long`   | 2600 ms |

Example:

```html
<jp-token text="で" reading="で" romaji="de" meaning="in / at" type="particle" delay="short"></jp-token>
```

Exact override:

```html
<jp-token text="2026年6月19日" reading="にせんにじゅうろくねんろくがつじゅうくにち" romaji="nisen nijuuroku nen rokugatsu juuku nichi" meaning="June 19, 2026" type="date" delay="long" delay-ms="5000"></jp-token>
```

If both `delay` and `delay-ms` exist, `delay-ms` wins.

Invalid delay:

```html
<jp-token text="映画" romaji="eiga" type="word" delay="very-hard"></jp-token>
```

Invalid exact delay:

```html
<jp-token text="映画" romaji="eiga" type="word" delay-ms="slow"></jp-token>
```

`delay-ms` must be numeric.

---

M00 Punctuation

---

Punctuation should usually be represented as separate tokens.

Example:

```html
<jp-token text="、" type="punctuation" delay="short"></jp-token>
<jp-token text="。" type="punctuation" delay="short"></jp-token>
```

Punctuation tokens do not require romaji.

The app may auto-advance punctuation when punctuation practice is disabled. That is the default behavior.

If punctuation practice is enabled, the app may require the user to type punctuation. That behavior is an app setting, not a lesson format change.

Common punctuation tokens:

```txt
、
。
？
！
「
」
（
）
・
：
```

Prefer this:

```html
<jp-token text="見ます" reading="みます" romaji="mimasu" meaning="watch" type="verb" delay="medium"></jp-token>
<jp-token text="。" type="punctuation" delay="short"></jp-token>
```

Avoid this:

```html
<jp-token text="見ます。" reading="みます" romaji="mimasu" meaning="watch" type="verb" delay="medium"></jp-token>
```

The second form mixes punctuation into the verb token and makes punctuation behavior harder to control.

---

N00 Image Anchors

---

Images are optional.

The article body should contain short image references. The base64 image data should be stored at the bottom of the document inside `jp-assets`.

Because the format no longer requires IDs for lessons, sections, sentences, or tokens, image references use a separate human-readable asset key.

This key is only for connecting an image anchor to an image asset. It is not a required ID system for the whole article.

Image reference example:

```html
<jp-image-ref asset="ueno-theater" placement="side" scope="section"></jp-image-ref>
```

Image reference attributes:

| Attribute   | Required | Meaning                                                              |
| ----------- | -------: | -------------------------------------------------------------------- |
| `asset`     |      Yes | Name of the image asset in `jp-assets`                               |
| `placement` |       No | `side` or `inline`; default is `side`                                |
| `scope`     |       No | `section`, `paragraph`, `sentence`, or `token`; default is `section` |

Recommended placement values:

| Value    | Meaning                                         |
| -------- | ----------------------------------------------- |
| `side`   | Desktop side image column, mobile inline banner |
| `inline` | Inline article image, if supported later        |

Recommended scope values:

| Value       | Meaning                                          |
| ----------- | ------------------------------------------------ |
| `section`   | Image belongs to the current section             |
| `paragraph` | Image belongs near a paragraph                   |
| `sentence`  | Image belongs near a sentence                    |
| `token`     | Image belongs to a specific token, rarely needed |

Image at section start:

```html
<jp-section title="上野の映画館">
  <jp-image-ref asset="ueno-theater" placement="side" scope="section"></jp-image-ref>

  <jp-sentence>
    ...
  </jp-sentence>
</jp-section>
```

Image before a specific sentence:

```html
<jp-image-ref asset="ticket-machine" placement="side" scope="sentence"></jp-image-ref>

<jp-sentence>
  <jp-token text="機械" reading="きかい" romaji="kikai" meaning="machine" type="word" delay="medium"></jp-token>
  ...
</jp-sentence>
```

On desktop, the app should show the image in the side image column. On mobile, it should show the image as a compact banner near the related text.

---

O00 Image Assets

---

Image assets must be placed at the bottom of the lesson document inside `jp-assets`.

Preferred attribute form:

```html
<jp-assets>
  <jp-image
    asset="ueno-theater"
    mime="image/png"
    alt="Ink illustration of an old Ueno theater street"
    title="上野松竹のイメージ"
    data="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...">
  </jp-image>
</jp-assets>
```

Alternative nested form:

```html
<jp-assets>
  <jp-image
    asset="ueno-theater"
    mime="image/png"
    alt="Ink illustration of an old Ueno theater street"
    title="上野松竹のイメージ">
    <jp-image-data>
      data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
    </jp-image-data>
  </jp-image>
</jp-assets>
```

Required image attributes:

| Attribute | Required | Meaning                                |
| --------- | -------: | -------------------------------------- |
| `asset`   |      Yes | Image key referenced by `jp-image-ref` |
| `mime`    |      Yes | Image MIME type                        |
| `alt`     |      Yes | Accessibility and fallback description |

Optional image attributes:

| Attribute | Meaning                            |
| --------- | ---------------------------------- |
| `title`   | Human-readable image title         |
| `data`    | Data URL when using attribute form |

Supported MIME types for MVP:

| MIME         | Use                                                         |
| ------------ | ----------------------------------------------------------- |
| `image/png`  | Preferred for generated illustrations                       |
| `image/jpeg` | Good for photos                                             |
| `image/webp` | Good for compressed images if browser support is acceptable |

SVG should not be required for MVP. If supported later, it must be sanitized carefully.

The app must not execute image-related scripts. Images are data only.

---

P00 Complete Example with Image

---

This example shows one lesson, one section, one image reference, two sentences, and one image asset.

```html
<jp-lesson title="上野の映画館をめぐる" lang="ja" version="1.0">
  <jp-section title="上野の映画館">
    <jp-image-ref asset="ueno-theater" placement="side" scope="section"></jp-image-ref>

    <jp-sentence>
      <jp-token text="上野" reading="うえの" romaji="ueno" meaning="Ueno" type="place" delay="medium"></jp-token>
      <jp-token text="は" reading="は" romaji="wa" aliases="ha" meaning="topic marker" type="particle" delay="short"></jp-token>
      <jp-token text="、" type="punctuation" delay="short"></jp-token>
      <jp-token text="昔" reading="むかし" romaji="mukashi" meaning="long ago" type="word" delay="medium"></jp-token>
      <jp-token text="から" reading="から" romaji="kara" meaning="from" type="particle" delay="short"></jp-token>
      <jp-token text="映画" reading="えいが" romaji="eiga" meaning="movie" type="word" delay="medium"></jp-token>
      <jp-token text="の" reading="の" romaji="no" meaning="of" type="particle" delay="short"></jp-token>
      <jp-token text="街" reading="まち" romaji="machi" meaning="town" type="word" delay="medium"></jp-token>
      <jp-token text="です" reading="です" romaji="desu" meaning="is" type="word" delay="short"></jp-token>
      <jp-token text="。" type="punctuation" delay="short"></jp-token>
    </jp-sentence>

    <jp-sentence>
      <jp-token text="映画館" reading="えいがかん" romaji="eigakan" meaning="movie theater" type="word" delay="medium"></jp-token>
      <jp-token text="は" reading="は" romaji="wa" aliases="ha" meaning="topic marker" type="particle" delay="short"></jp-token>
      <jp-token text="駅" reading="えき" romaji="eki" meaning="station" type="word" delay="medium"></jp-token>
      <jp-token text="から" reading="から" romaji="kara" meaning="from" type="particle" delay="short"></jp-token>
      <jp-token text="近い" reading="ちかい" romaji="chikai" meaning="near" type="adjective" delay="medium"></jp-token>
      <jp-token text="です" reading="です" romaji="desu" meaning="is" type="word" delay="short"></jp-token>
      <jp-token text="。" type="punctuation" delay="short"></jp-token>
    </jp-sentence>
  </jp-section>

  <jp-assets>
    <jp-image
      asset="ueno-theater"
      mime="image/png"
      alt="Ink-style illustration of an old Ueno theater street"
      title="上野の映画館">
      <jp-image-data>
        data:image/png;base64,REPLACE_WITH_REAL_BASE64_DATA
      </jp-image-data>
    </jp-image>
  </jp-assets>
</jp-lesson>
```

Rendered plain article text:

```txt
上野は、昔から映画の街です。
映画館は駅から近いです。
```

---

Q00 Complete Example without Image

---

Images are optional. This is valid:

```html
<jp-lesson title="映画を見る日" lang="ja" version="1.0">
  <jp-section title="映画">
    <jp-sentence>
      <jp-token text="今日" reading="きょう" romaji="kyou" meaning="today" type="date" delay="medium"></jp-token>
      <jp-token text="は" reading="は" romaji="wa" aliases="ha" meaning="topic marker" type="particle" delay="short"></jp-token>
      <jp-token text="映画" reading="えいが" romaji="eiga" meaning="movie" type="word" delay="medium"></jp-token>
      <jp-token text="を" reading="を" romaji="wo" aliases="o" meaning="object marker" type="particle" delay="short"></jp-token>
      <jp-token text="見ます" reading="みます" romaji="mimasu" meaning="watch" type="verb" delay="medium"></jp-token>
      <jp-token text="。" type="punctuation" delay="short"></jp-token>
    </jp-sentence>
  </jp-section>
</jp-lesson>
```

The app should load this lesson and simply show no article image.

---

R00 Whitespace Rules

---

Whitespace between custom elements is allowed and should be ignored for rendering.

This is valid:

```html
<jp-sentence>
  <jp-token text="上野" reading="うえの" romaji="ueno" meaning="Ueno" type="place" delay="medium"></jp-token>
  <jp-token text="で" reading="で" romaji="de" meaning="in / at" type="particle" delay="short"></jp-token>
</jp-sentence>
```

The app renders:

```txt
上野で
```

The parser should not insert spaces because the HTML file has line breaks or indentation.

If the author wants a visible space, the author must make it part of a token or use a dedicated space token.

Rare visible space token:

```html
<jp-token text=" " type="punctuation" delay="short"></jp-token>
```

For normal Japanese lessons, visible spaces should be avoided unless needed for mixed-language titles or special formatting.

---

S00 Mixed Japanese and Foreign Text

---

Foreign names, English words, theater names, and movie titles can be tokens.

Example:

```html
<jp-token text="TOHOシネマズ上野" reading="とうほうしねまずうえの" romaji="touhou shinemazu ueno" meaning="TOHO Cinemas Ueno" type="name" delay="long"></jp-token>
```

Katakana example:

```html
<jp-token text="コーヒー" reading="こーひー" romaji="koohii" meaning="coffee" type="word" delay="medium"></jp-token>
```

English title example:

```html
<jp-token text="Star Wars" romaji="star wars" meaning="Star Wars" type="name" delay="long"></jp-token>
```

If the visible text is English, `reading` may be omitted.

Movie title example with Japanese punctuation:

```html
<jp-token text="「" type="punctuation" delay="short"></jp-token>
<jp-token text="Star Wars" romaji="star wars" meaning="Star Wars" type="name" delay="long"></jp-token>
<jp-token text="」" type="punctuation" delay="short"></jp-token>
```

---

T00 Validation Rules

---

The app should validate the article before replacing the current article.

Required validation:

| Rule                                           | Failure behavior                              |
| ---------------------------------------------- | --------------------------------------------- |
| File is readable as text                       | Reject import                                 |
| Root `jp-lesson` exists                        | Reject import                                 |
| At least one `jp-section` exists               | Reject import                                 |
| At least one `jp-sentence` exists              | Reject import                                 |
| At least one `jp-token` exists                 | Reject import                                 |
| Every token has `text` and `type`              | Reject import                                 |
| Every typed non-punctuation token has `romaji` | Reject import                                 |
| `delay` values are valid if present            | Reject import or fall back with warning       |
| `delay-ms` is numeric if present               | Reject import or ignore override with warning |
| Image reference has missing asset              | Load article, omit image, log warning         |
| Invalid image data                             | Load article, omit image, log warning         |

Recommended strictness:

The app should reject a lesson if a typed token has no romaji.

The app should reject a lesson if the sentence contains no valid tokens.

The app may accept missing `meaning`, but the active token hint will be weaker.

The app may accept missing `reading`, but kanji support will be weaker.

The app should not reject an otherwise usable lesson only because an optional image failed.

The app does not need duplicate ID validation because IDs are not required. If optional IDs are present, duplicate optional IDs should not break the lesson.

For image assets, duplicate `asset` values should be treated as invalid or warned about because image references need clear matching.

---

U00 Generated Internal Identifiers

---

The app should generate internal identifiers after parsing the article.

The source file does not need IDs. The app can derive internal references from document position.

Example generated paths:

| Internal item                  | Example generated reference |
| ------------------------------ | --------------------------- |
| First section                  | `section-0`                 |
| First paragraph                | `paragraph-0`               |
| First sentence                 | `sentence-0`                |
| First token                    | `token-0`                   |
| Third token in second sentence | `sentence-1-token-2`        |

For local storage recovery, the app can save current position by sentence index and token index.

Example saved state:

```json
{
  "sentenceIndex": 1,
  "tokenIndex": 3,
  "typedInput": "kara",
  "paused": false
}
```

If the article file changes, positional recovery may no longer point to the same exact token. This is acceptable for the MVP because only one current article is stored. When a new article is imported, the app resets article-specific state.

If optional source IDs exist, the parser may keep them for diagnostics:

```html
<jp-token source-id="custom-token-name" text="映画" reading="えいが" romaji="eiga" meaning="movie" type="word"></jp-token>
```

This is optional and not required. The app should not require `source-id`.

---

V00 Security and Sanitization

---

Imported article files are untrusted data.

The app must not execute scripts from article files.

Disallowed imported content:

```html
<script>alert("no")</script>
```

```html
<jp-token text="上野" onclick="stealData()" romaji="ueno" type="place"></jp-token>
```

```html
<img src=x onerror="runCode()">
```

The parser should extract only known custom elements and known attributes. Unknown elements should be ignored unless the app explicitly supports them. Unknown attributes should be ignored.

The app should not insert imported HTML directly into the live app UI using unsanitized `innerHTML`.

Recommended safe approach:

```txt
Parse lesson document with DOMParser.
Read known elements and known attributes.
Create internal JavaScript records.
Render app UI from internal records using textContent and safe DOM creation.
```

Base64 image data should be assigned only to image `src` after MIME and data URL validation.

Do not log full base64 image data. Logs should truncate or omit asset payloads.

---

W00 Generating Base64 Image Data

---

Images should be embedded as data URLs in the bottom `jp-assets` section.

Data URL format:

```txt
data:image/png;base64,BASE64_DATA_HERE
```

The base64 data must not contain unrelated text.

Recommended image preparation:

| Step | Action                                                          |
| ---- | --------------------------------------------------------------- |
| 1    | Resize the image before embedding                               |
| 2    | Prefer PNG for illustration or WebP/JPEG for photos             |
| 3    | Keep file size reasonable                                       |
| 4    | Convert image to base64                                         |
| 5    | Paste the data URL into `jp-image-data` or the `data` attribute |

Suggested maximum image size:

| Asset type           | Suggested maximum |
| -------------------- | ----------------: |
| Small illustration   |            300 KB |
| Larger article image |            800 KB |
| Very large image     |             Avoid |

macOS or Linux:

```bash
base64 -w 0 image.png > image.base64
```

Some macOS versions do not support `-w 0`. Use:

```bash
base64 image.png | tr -d '\n' > image.base64
```

PowerShell:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("image.png")) | Set-Content image.base64
```

Node.js:

```js
const fs = require("fs");

const file = "image.png";
const base64 = fs.readFileSync(file).toString("base64");
console.log(`data:image/png;base64,${base64}`);
```

Then paste into the lesson file:

```html
<jp-image asset="ueno-theater" mime="image/png" alt="Ink-style Ueno theater illustration">
  <jp-image-data>
    data:image/png;base64,PASTE_BASE64_DATA_HERE
  </jp-image-data>
</jp-image>
```

---

X00 Plain Text Export Behavior

---

The article file contains metadata, but Tango export must export only plain Japanese article text.

The app should create plain text from token `text` values in sentence order.

Example lesson:

```html
<jp-sentence>
  <jp-token text="上野" reading="うえの" romaji="ueno" meaning="Ueno" type="place"></jp-token>
  <jp-token text="で" reading="で" romaji="de" meaning="in / at" type="particle"></jp-token>
  <jp-token text="映画" reading="えいが" romaji="eiga" meaning="movie" type="word"></jp-token>
  <jp-token text="を" reading="を" romaji="wo" aliases="o" meaning="object marker" type="particle"></jp-token>
  <jp-token text="見ます" reading="みます" romaji="mimasu" meaning="watch" type="verb"></jp-token>
  <jp-token text="。" type="punctuation"></jp-token>
</jp-sentence>
```

Plain text output:

```txt
上野で映画を見ます。
```

The export must not include:

```txt
romaji
meaning
reading
token metadata
image data
image references
settings
progress
current caret position
previous/current/remaining UI split
```

If paragraphs exist, preserve paragraph breaks. If only sentences exist, separate sentences naturally.

---

Y00 LLM Authoring Guidelines

---

When a large language model creates a lesson file, it should follow this order:

| Step | Action                                            |
| ---- | ------------------------------------------------- |
| 1    | Write natural Japanese                            |
| 2    | Split the article into sentences                  |
| 3    | Split each sentence into meaningful typing tokens |
| 4    | Add readings                                      |
| 5    | Add romaji                                        |
| 6    | Add short meanings                                |
| 7    | Add token types                                   |
| 8    | Add delay values                                  |
| 9    | Add optional image anchors and image assets       |

The model should not add IDs unless specifically asked.

The model should not create IDs for every token.

The model should use clean, readable markup.

Good token:

```html
<jp-token text="映画館" reading="えいがかん" romaji="eigakan" meaning="movie theater" type="word" delay="medium"></jp-token>
```

Good phrase:

```html
<jp-token text="すみません" reading="すみません" romaji="sumimasen" meaning="excuse me" type="phrase" delay="medium"></jp-token>
```

Good particle:

```html
<jp-token text="を" reading="を" romaji="wo" aliases="o" meaning="object marker" type="particle" delay="short"></jp-token>
```

Good punctuation:

```html
<jp-token text="。" type="punctuation" delay="short"></jp-token>
```

Keep meanings short.

Use image asset keys only when images are needed:

```html
<jp-image-ref asset="ueno-theater" placement="side" scope="section"></jp-image-ref>
```

Do not include scripts, external CSS, arbitrary HTML widgets, remote image URLs, or event handlers.

---

Z00 Invalid Examples and Implementation Summary

---

Invalid because sentence has no tokens:

```html
<jp-sentence>
  上野で映画を見ます。
</jp-sentence>
```

Invalid because token has no text:

```html
<jp-token romaji="ueno" meaning="Ueno" type="place"></jp-token>
```

Invalid because typed token has no romaji:

```html
<jp-token text="上野" reading="うえの" meaning="Ueno" type="place"></jp-token>
```

Invalid because image data is placed directly in the article body instead of the assets section:

```html
<jp-section title="Bad Image Placement">
  <jp-image asset="ueno-theater" data="data:image/png;base64,VERY_LONG_DATA"></jp-image>
  <jp-sentence>
    ...
  </jp-sentence>
</jp-section>
```

Invalid because it includes script:

```html
<jp-lesson title="Bad" lang="ja" version="1.0">
  <script>console.log("bad")</script>
</jp-lesson>
```

Invalid because delay value is unsupported:

```html
<jp-token text="映画" romaji="eiga" type="word" delay="hard"></jp-token>
```

Invalid as a complete image reference because the referenced asset is missing:

```html
<jp-image-ref asset="missing-image" placement="side" scope="section"></jp-image-ref>
```

This image error should not block article loading if the text is otherwise valid. The app should omit the image and log a warning.

Implementation summary:

```txt
Read UTF-8 text.
Parse with DOMParser.
Find jp-lesson.
Read lesson metadata.
Read sections.
Read optional paragraphs.
Read optional image references.
Read sentences.
Read tokens in order.
Generate internal IDs from document order.
Read image assets from jp-assets at the bottom.
Normalize parsed data into internal records.
Render UI from internal records.
Never execute imported scripts or event handlers.
```

The most important rules are:

```txt
Authors do not need to write IDs.
Tokens define typing units.
Sentences define active practice units.
Images are referenced in the article body but stored as assets at the bottom.
Image references use asset keys, not token IDs.
The app renders article text from token text.
The app exports plain Japanese text from token text.
The app treats imported article files as untrusted data.
```
