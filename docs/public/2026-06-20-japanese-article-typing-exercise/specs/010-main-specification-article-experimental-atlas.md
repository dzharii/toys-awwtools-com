---

A00 Visual Vocabulary Atlas Workflow Design Note

---

This design note defines the workflow for creating a visual vocabulary sprite atlas from a Japanese lesson.

The workflow has two stages.

Stage 1 plans the atlas. The user provides lesson text or lesson XML. ChatGPT selects visual vocabulary concepts, assigns cells, writes tile art briefs, and returns XML metadata without base64.

Stage 2 renders the atlas image. The user approves the Stage 1 plan and says `create image`. ChatGPT generates one raster atlas image from the approved plan.

This note is only about atlas planning, atlas image generation, and XML metadata. It does not define app-side hover behavior, popover layout, mobile behavior, or learner interaction.

---

B00 Fixed Atlas Profile

---

Use one fixed atlas profile.

Profile name:

```txt
practical-19x19-66
```

Canvas:

```txt
1254 x 1254 px
```

Grid:

```txt
19 x 19
```

Cell size:

```txt
66 x 66 px
```

Capacity:

```txt
361 cells
```

Cell range:

```txt
0 to 360
```

Reason for this profile:

```txt
The image generation output is currently 1254 x 1254.
1254 divides cleanly by 19.
1254 / 19 = 66.
This gives integer cell geometry and avoids fractional sprite math.
```

Do not choose between multiple atlas profiles in this workflow.

Do not use `2048 x 2048`.

Do not use `8 x 8`.

Do not use `16 x 16`.

The workflow always targets:

```txt
1254 x 1254
19 x 19
66 px cells
361 total cells
```

---

C00 Important Consequence of 66 px Cells

---

A 66 px cell is small.

This changes the image strategy.

Each tile must be icon-like, not a detailed mini-scene.

Use:

```txt
one object
one clear silhouette
one simple action
minimal background
large centered subject
```

Avoid:

```txt
complex scenes
small readable text
multiple tiny objects
busy backgrounds
detailed signs
large character scenes
```

The atlas is for quick visual memory hints, not for detailed illustration.

---

D00 Stage 1 Input

---

The user gives ChatGPT lesson text or lesson XML and asks for the first part of the workflow.

Expected user request:

```txt
Run Stage 1 for this lesson.
Create the visual vocabulary atlas plan.
Do not generate the image yet.
```

Stage 1 must return:

```txt
atlas profile confirmation
selected concept count
sprite manifest
image generation prompt
jp-visual-atlases XML block
jp-image placeholder without base64
token visual mappings
validation summary
```

Stage 1 must not generate the image.

Stage 1 must not include base64.

---

E00 Concept Selection Rules

---

Select concepts that benefit from a picture.

Strong candidates:

```txt
concrete nouns
visible objects
food
drinks
tools
containers
machines
places
signs
simple quantities
clear actions
simple visual adjectives
```

Good examples:

```txt
コンビニ
おにぎり
パン
サンドイッチ
べんとう
サラダ
ケーキ
水
お茶
コーヒー
牛乳
ジュース
レジ
カップ
袋
カード
現金
レシート
ボタン
機械
はし
スプーン
フォーク
```

Clear action examples:

```txt
買う
選ぶ
払う
押す
持つ
見せる
出る
入れる
```

Simple adjective examples:

```txt
あつい
小さい
大きい
無料
```

Weak candidates:

```txt
particles
punctuation
helper words
grammar fragments
very abstract words
words that need a sentence to explain them
```

Do not select every token.

Select useful visual anchors.

---

F00 Selection Quantity Rules

---

The atlas has 361 cells, but the first generated atlas should not fill every cell.

Recommended first-pass limits:

```txt
minimum useful selection: 40 concepts
normal selection: 60 to 140 concepts
large selection: 140 to 240 concepts
upper recommended limit: 300 concepts
absolute capacity: 361 concepts
```

Leave unused cells when possible.

Do not force weak concepts just to fill the atlas.

If a lesson has fewer concepts, use fewer cells. Empty cells are valid.

If a lesson has many repeated forms, map multiple tokens to one sprite.

Example:

```txt
買う
買います
買えます
買ったとき
```

All can map to:

```txt
visual="buy"
```

---

G00 Sprite Key Rules

---

Each selected concept gets one stable sprite key.

Use lowercase ASCII.

Use underscores.

Good keys:

```txt
onigiri
bento
coffee
hot_coffee
iced_coffee
cash_register
shopping_bag
reusable_bag
receipt
credit_card
buy
pay
press_button
```

The key represents the visual concept, not necessarily one exact token form.

Example:

```xml
<jp-token text="買います" visual="buy" ... />
<jp-token text="買ったとき" visual="buy" ... />
```

---

H00 Cell Numbering

---

Cells use row-major order.

That means:

```txt
left to right
then next row
top to bottom
```

For the fixed `19 x 19` atlas:

```txt
cell 0   = row 0, col 0
cell 1   = row 0, col 1
cell 18  = row 0, col 18
cell 19  = row 1, col 0
cell 360 = row 18, col 18
```

Formula:

```txt
cell = row * 19 + col
row = floor(cell / 19)
col = cell % 19
x = col * 66
y = row * 66
```

Every sprite definition stores:

```txt
cell
row
col
```

---

I00 Tile Art Brief Rules

---

Each selected concept needs one short art brief.

The art brief should describe what to draw inside the 66 px cell.

A good brief is short and concrete.

Good examples:

```txt
triangular rice ball with black seaweed wrap
paper coffee cup with steam
green reusable shopping bag
payment card near reader
finger pressing round button
receipt slip
cash and coins
```

Weak examples:

```txt
show convenience
make it nice
Japanese feeling
shopping experience
```

Each brief should define:

```txt
main subject
clear silhouette
simple action if needed
minimal context
```

Because cells are only 66 px, the brief should usually describe one object or one close-up action.

---

J00 Style Protocol

---

Use one style for the whole atlas.

Style name:

```txt
zen-editorial-icon-v1
```

Style definition:

```txt
calm Japanese editorial icon illustration
warm low-saturation palette
soft line art
watercolor or ink-wash texture
simple centered subject
minimal background
clear silhouette
consistent visual language
```

The style should match the quiet Japanese lesson artwork, but simplified for small cells.

The images should feel hand-drawn and warm, not like generic flat emoji.

The atlas must remain readable as small vocabulary icons.

---

K00 Production Image Rules

---

The Stage 2 atlas image must be:

```txt
1254 x 1254 px
PNG preferred
19 x 19 grid
66 x 66 px cells
one concept per used cell
unused cells blank or quiet parchment
```

The production atlas must contain very shallow grid guidelines.

Grid guideline requirements:

```txt
cell boundaries must be visible
cell boundaries must be thin
cell boundaries must be light gray or warm gray
cell boundaries must be low contrast
cell boundaries must not dominate the image
cell boundaries must help identify exact sprite cells
cell boundaries must align to the 19 x 19 grid
```

Recommended grid appearance:

```txt
1 px hairline grid
light gray or warm gray
approximately 15 percent to 25 percent opacity
no heavy border
no dark black lines
no thick tile frames
```

The production atlas should not contain:

```txt
cell numbers
captions
Japanese labels
English labels
large text
heavy tile borders
decorative frames around cells
```

The XML already stores labels and meanings. The image should contain pictures and shallow cell boundaries only.

If the image generator creates numbers, labels, captions, or heavy borders, treat the result as a review contact sheet, not as the production atlas.

If the image generator creates no cell boundaries at all, treat the result as incomplete because sprite inspection becomes harder.

---

L00 Stage 1 Sprite Manifest Format

---

Stage 1 returns a compact manifest.

Use this format:

```txt
cell 0 | row 0 | col 0 | key=convenience_store | text=コンビニ | reading=こんびに | meaning=convenience store | type=word | kind=place-object | art=small Japanese convenience store front
cell 1 | row 0 | col 1 | key=onigiri | text=おにぎり | reading=おにぎり | meaning=rice ball | type=word | kind=object | art=triangular rice ball with black seaweed wrap
cell 2 | row 0 | col 2 | key=coffee | text=コーヒー | reading=こーひー | meaning=coffee | type=word | kind=object | art=paper coffee cup with dark coffee surface
```

Do not use tables.

The manifest must match the XML sprite definitions.

---

M00 Stage 1 Image Prompt Output

---

Stage 1 must produce the exact Stage 2 image prompt.

Base prompt:

```txt
Create one square production sprite atlas for Japanese vocabulary learning.

Canvas size: 1254 x 1254 pixels.
Grid: 19 x 19.
Cell size: 66 x 66 pixels.
Use row-major order: left to right, top to bottom.

The grid must be visible as very shallow cell guidelines.
Draw thin light gray or warm gray 1 px cell boundary lines across the full atlas.
The grid guidelines must be subtle, low-contrast, and aligned to the 19 x 19 cell structure.
The grid guidelines must help identify cell boundaries without distracting from the illustrations.

Each used cell contains exactly one small vocabulary illustration.
Each illustration must stay inside its own 66 x 66 cell.
Keep the subject large, centered, and readable.
Use simple silhouettes and minimal background.
Use one consistent style across the whole atlas.

Style: calm Japanese editorial icon illustration, warm low-saturation palette, soft line art, watercolor or ink-wash texture, anime-adjacent readability, quiet Zen learning tone.

Production requirements:
Include shallow grid guidelines.
No cell numbers.
No text labels.
No captions.
No Japanese text.
No English text.
No heavy tile borders.
No decorative frames.
No subjects crossing cell boundaries.
Unused cells must be blank warm parchment with the same shallow grid guidelines.

Render these concepts in cell order:
0. ...
1. ...
2. ...
```

The prompt must explicitly say `production sprite atlas`.

The prompt must explicitly say `shallow grid guidelines`.

The prompt must explicitly say `no cell numbers` and `no text labels`.

---

N00 XML Metadata Structure

---

Add one lesson-level atlas block.

Recommended location:

```txt
inside jp-lesson
before jp-section
```

XML structure:

```xml
<jp-visual-atlases>
  <jp-visual-atlas
    key="conbini-visual-atlas-01"
    asset="conbini-visual-atlas-01"
    profile="practical-19x19-66"
    width="1254"
    height="1254"
    columns="19"
    rows="19"
    cell-size="66"
    style="zen-editorial-icon-v1"
    grid-guidelines="shallow"
    title="Conbini visual vocabulary atlas">
    <jp-sprite
      key="onigiri"
      text="おにぎり"
      reading="おにぎり"
      meaning="rice ball"
      type="word"
      concept-kind="object"
      cell="0"
      row="0"
      col="0"
      art="triangular rice ball with black seaweed wrap" />
  </jp-visual-atlas>
</jp-visual-atlases>
```

The `grid-guidelines="shallow"` attribute records that the atlas image is expected to contain light cell boundary lines.

The `art` attribute preserves the rendering intent. It is useful for regeneration and review.

The application can ignore `art` and `grid-guidelines` at runtime.

---

O00 Asset Placeholder

---

Stage 1 adds an image placeholder without base64.

Recommended location:

```txt
inside existing jp-assets
after existing article images
```

Placeholder:

```xml
<jp-image
  asset="conbini-visual-atlas-01"
  mime="image/png"
  alt="Conbini visual vocabulary sprite atlas"
  title="Conbini visual vocabulary atlas">
  <jp-image-data>
    REPLACE_WITH_DATA_URL_AFTER_IMAGE_IS_CREATED
  </jp-image-data>
</jp-image>
```

Stage 2 replaces the placeholder with:

```txt
data:image/png;base64,...
```

---

P00 Token Mapping

---

Tokens point to sprites with the `visual` attribute.

Example:

```xml
<jp-token
  text="おにぎり"
  type="word"
  delay="medium"
  reading="おにぎり"
  romaji="onigiri"
  meaning="rice ball"
  visual="onigiri">
</jp-token>
```

Action example:

```xml
<jp-token
  text="買います"
  type="verb"
  delay="medium"
  reading="かいます"
  romaji="kaimasu"
  meaning="buy"
  visual="buy">
</jp-token>
```

Do not store coordinates on tokens.

Use this on tokens:

```txt
visual="onigiri"
```

Store coordinates in the sprite definition:

```txt
cell="0" row="0" col="0"
```

This keeps token markup small and keeps atlas geometry centralized.

---

Q00 Stage 1 Token Mapping Output

---

Stage 1 should return mappings in this format:

```txt
おにぎり -> visual="onigiri"
コーヒー -> visual="coffee"
買います -> visual="buy"
払います -> visual="pay"
```

If several token forms use one sprite, list them together:

```txt
visual="buy" applies to:
買う
買います
買えます
買ったとき
```

If a token is context-sensitive, say so explicitly:

```txt
入れます -> visual="pour_coffee" when the sentence is about the coffee machine.
入れます -> visual="put_in_bag" when the sentence is about putting items into the reusable bag.
```

---

R00 Stage 2 Trigger

---

Stage 2 begins only after the user approves Stage 1.

Valid user triggers:

```txt
create image
generate atlas
render atlas
use this plan and create image
```

Stage 2 must use the Stage 1 image prompt.

Stage 2 must not add new concepts.

Stage 2 must not change cell assignments.

Stage 2 must not change the atlas profile.

Stage 2 must generate one atlas image.

---

S00 Stage 2 Validation

---

After image generation, verify:

```txt
image width is 1254
image height is 1254
cell size is 66
grid is 19 x 19
cell geometry is integer
shallow grid guidelines are visible
grid guidelines are thin and low contrast
grid guidelines align to the 19 x 19 cell structure
no cell numbers
no labels
no captions
no heavy tile borders
style is consistent
used cells contain recognizable concepts
unused cells are blank or quiet parchment
```

If the image is not `1254 x 1254`, reject it as production.

If the image includes numbers, labels, captions, or heavy borders, reject it as production.

If the image has no visible cell boundaries, reject it as incomplete for this workflow.

If cells are ambiguous, revise the prompt or reduce concept count.

---

T00 Stage 1 Output Template

---

Stage 1 response should use this structure:

```txt
Atlas profile:
profile: practical-19x19-66
canvas: 1254 x 1254
grid: 19 x 19
cell size: 66
capacity: 361
grid guidelines: shallow light-gray cell boundaries

Selected concept count:
selected: N
unused cells: 361 - N

Selected concepts:
cell 0 | row 0 | col 0 | key=... | text=... | reading=... | meaning=... | type=... | kind=... | art=...
cell 1 | row 0 | col 1 | key=... | text=... | reading=... | meaning=... | type=... | kind=... | art=...

Image generation prompt:
[full prompt]

XML metadata:
[jp-visual-atlases block]

Asset placeholder:
[jp-image placeholder]

Token visual mappings:
[mapping list]

Validation:
[validation summary]
```

No tables.

No base64.

No image generation in Stage 1.

---

U00 Validation Rules for XML

---

The XML plan is valid only if:

```txt
profile is practical-19x19-66
width is 1254
height is 1254
columns is 19
rows is 19
cell-size is 66
grid-guidelines is shallow
cell range is 0 to 360
row range is 0 to 18
col range is 0 to 18
every sprite key is unique
every used cell is unique
row and col match cell
atlas asset key exists in jp-assets
token visual values reference existing sprite keys
Stage 1 XML contains no base64
```

Cell consistency rule:

```txt
cell = row * 19 + col
```

---

V00 Final Workflow

---

The complete workflow is:

```txt
1. User provides lesson text or lesson XML.
2. ChatGPT parses tokens.
3. ChatGPT selects imageable concepts.
4. ChatGPT uses fixed profile practical-19x19-66.
5. ChatGPT assigns cells from 0 upward in row-major order.
6. ChatGPT writes one short art brief per selected concept.
7. ChatGPT returns the production image prompt.
8. ChatGPT returns XML metadata without base64.
9. User reviews the Stage 1 plan.
10. User says create image.
11. ChatGPT generates one 1254 x 1254 atlas image with shallow grid guidelines.
12. User verifies the image.
13. User embeds the image data URL in jp-assets.
14. User adds jp-visual-atlases and token visual mappings to the lesson XML.
```

---

W00 Final Directive

---

Use this fixed protocol:

```txt
One atlas profile only.
Profile: practical-19x19-66.
Canvas: 1254 x 1254.
Grid: 19 x 19.
Cell size: 66.
Capacity: 361 cells.
Include shallow light-gray cell boundary guidelines in the final image.
Use small icon-like learning illustrations.
Use calm Japanese editorial icon style.
Generate Stage 1 plan before image generation.
Generate Stage 2 image only after approval.
Do not include base64 until after image generation.
Do not put cell coordinates on tokens.
Use visual="sprite-key" on tokens.
Store atlas geometry and sprite mappings in jp-visual-atlases.
```
