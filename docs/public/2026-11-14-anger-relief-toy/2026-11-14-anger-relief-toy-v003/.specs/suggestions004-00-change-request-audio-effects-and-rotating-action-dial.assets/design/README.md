# Dial and stationary separator exploration

These are purpose-built SVG design prototypes over a synthetic discussion page at 920 x 720. They are design references, not screenshots of a working extension and not browser-test evidence. The PNG companions were rendered from the SVGs with the installed Sharp runtime and all three were inspected. Existing project-owned colorful tool icons are embedded as independent SVG images, so their gradients do not collide and the references remain self-contained.

The visual direction follows the user's preference for a lightweight glass interface with recognizable, colored, slightly dimensional tool illustrations. The tool artwork supplies the color. The dial, inventory and controls remain quiet: white glass #F4F9FC, cool edge #C9D6E0, dark labels #263545, restrained cyan selected surface #D1F2F5, light metal #DCE4EB and occasional brass #E5D29D. Labels use a plain sans-serif at 14 pixels or larger. The stable inventory reserves three equal-purpose control positions and has no ordinary instructional subtitle.

| Concept | Geometry and material | Strength | Weakness |
| --- | --- | --- | --- |
| [A - Light metallic arm](concept-a.svg) | A broad retaining shoe follows the concealed annular region, with a diagonal metal arm extending beyond the upper-left rim and two small visible mounting screws. | Best combination of lightness, mounting clarity and material depth. Matches a modern precision selector without imposing a nautical theme on the entire product. | The broad shoe must remain light; a narrow arm alone could not conceal a complete icon and label. |
| [B - Instrument retaining hood](concept-b.svg) | A curved brass hood spans the same region. A small support, inset contour and shallow scale marks suggest an instrument bezel. | Most explicit mechanical/instrument character. The scale marks make rotation feel plausible. | The warm, larger material mass reads heavier and distracts from the colored tool icons. It is a useful comparison, not the preferred direction. |
| [C - Sculpted mechanical cover](concept-c.svg) | A pale ceramic-like shell uses shallow grooves, a mint underside and a round attachment point. | Clean and playful; the coolest, quietest surface. | The shell suggests a toy casing more than a precision mechanism. Grooves add decoration without much navigation value. |

Choose A's restrained metallic mounted cover for implementation. Keep B's coherent rim attachment and C's pale surface restraint. Do not reproduce the brass body or add extra decorative grooves. The final cover should look like one assembly: a small diagonal mounting arm plus a widened retaining shoe, not a thin rectangle pasted across a wheel. A light upper-left highlight, darker lower edge and a close soft shadow establish thickness. The tool illustrations remain the visual focus.

## Reproducible geometry

The circle's diameter is 420 CSS pixels. Nine logical visual positions use 40-degree spacing. At the illustrated settled state, their CSS angles are 315, 355, 35, 75, 115, 155, 195, 235 and 275 degrees. CSS angles here start at the top and increase clockwise. The hidden position is centered at CSS 315 degrees, equivalent to Cartesian -135 degrees in screen coordinates. Eight positions are visible; the ninth provides the concealed replacement position.

The occlusion region spans CSS 291 through 339 degrees, a total of 48 degrees. The prototype mask covers radii 84 through 230 pixels. Its opaque material cover follows radii 86 through 222 pixels. The mounted shoe therefore covers the full icon/name area, not only the thin outer rim. Tool centers sit at radius 149 pixels. At that radius, a 48-degree cover spans approximately 121 pixels across its chord, enough for a 46-pixel icon and the bounded upright two-line label. Mask and shoe need a small overlap so antialiasing cannot expose recycled content at the edges.

Use normalized coordinates relative to the dial diameter in implementation. The mask, opaque shoe, attachment and close shadow must share the same stationary frame. Tool positions move beneath that frame, while their artwork and labels remain upright. The center All tools action is stationary above the moving surface. The mask must be applied to icons, labels, highlights and their hit areas together. A completely occluded slot is neither pointer-selectable nor focusable. The center control and exposed choices must remain unobstructed.

Replace slot identity only when the entire slot is inside the concealed region. That applies in either rotation direction and at slow speeds. Stable logical IDs, not slot DOM indices, drive selection. The physical cover stays opaque even when the surrounding dial surface is translucent. This prevents partially visible old/new artwork and provides a consistent concealment boundary over both light and dark pages.

## Layer order and movement

The intended bottom-to-top order is webpage, soft dial shadow, glass body/rim, moving tool positions, stationary underside shadow, opaque retaining shoe and mounting arm, then stationary center/close controls. The cover casts its shadow down and to the right by a few pixels, matching upper-left illumination. The shadow stays attached to the cover while tools move beneath it. Keep the shadow close, soft and low contrast; a dramatic shadow would defeat the lightweight direction.

A pointer press with insignificant movement remains a click. Meaningful angular movement around the center becomes rotation and suppresses click selection on release. Short detent settling is preferable to momentum: the latter risks carrying a desired tool past the pointer and increases motion without improving discovery. Arrow-key stepping and optional wheel stepping remain deterministic alternatives. This is a design decision, not a claim that a motion prototype or user study compared both implementations.

## Inspection and implementation limits

The rendered prototypes confirm 420-pixel composition, colored-icon legibility, the eight-visible/one-hidden arrangement, complete concealment at the stationary angle, matching inventory proportions and three distinct separator treatments. They cannot prove drag feel, recycling correctness, keyboard focus, hit testing, responsive placement, browser zoom behavior, audio synchronization or cleanup. Those require the functional packaged extension tests. The SVG generator is retained as `build-concepts.py` so the exact prototypes can be reproduced; it is development material and is not runtime extension code.
