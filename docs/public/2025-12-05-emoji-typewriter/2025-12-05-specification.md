# Typewriter Experience and Emoji Picker
Date: 2025-12-05

A00 Project summary and goals 00
This project creates a new web application that combines the existing Typewriter Experience and Emoji Picker projects into a single tool. The app keeps the visual style and interaction of the Typewriter Experience: background, paper, line numbers, bottom fixed SVG keyboard, and sound profiles. The keyboard is repurposed to act as a rich emoji and Unicode character control panel, inspired by the Emoji Picker project.

The result is an offline, static, local first application where a user can type normal text on a paper like in the original typewriter project, but also search, browse, and insert emoji and selected Unicode control characters. The app should help the user explore what can be done with Unicode based text control and emoji composition, while keeping the UX simple and pleasant.

The coding agent will have full access to all existing source code from both projects and must reuse it as a base. The agent should copy and adapt the Typewriter Experience code and layout, and incorporate the logic and data structures from the Emoji Picker project, instead of rewriting everything from scratch. This specification does not repeat the source code. It focuses on what the new combined app should do and how it should feel.

B00 Existing codebases and reuse requirements 00
There are two source projects available to the coding agent.

The Typewriter Experience project already provides:
A fixed bottom SVG keyboard that looks like a pseudo 3D mechanical keyboard.
A central paper area using a textarea, with line numbers, shadows, and background.
A background layer with a subtle gradient and SVG pattern.
Sound profiles and volume control, implemented with Web Audio API.
Hardware keyboard handling, including key highlight and click on the SVG keys.

The Emoji Picker project already provides:
Emoji data in a global emojiData array, including label, hexcode, emoji value, and tags.
A grid based UI for displaying emojis.
Search logic over emoji labels.
Recent emoji handling using localStorage with a given top level key.

The coding agent must:
Reuse the visual structure and styling of the Typewriter Experience as the base.
Keep the SVG keyboard as the core visual metaphor, but change its behavior and labels to support emoji and Unicode controls.
Reuse the emojiData dataset and recent emoji logic from the Emoji Picker.
Reuse the Web Audio API engine from the Typewriter Experience for key sounds.
Keep the constraints of both projects: vanilla HTML, CSS, JavaScript, no external libraries, no build step, and offline friendly file URLs.

All layout, colors, and general mood should stay close to the Typewriter Experience. The new UI elements for emoji and Unicode controls should feel like part of the same machine.

C00 Target users and use cases 00
The main user is someone who wants to experiment with Unicode and emoji in a playful but practical way. They write notes, snippets, or experiments on the paper, and they want an easy way to:

Insert emoji and find the right symbol quickly.
Insert specific Unicode control characters and sequences to explore how they affect text and emoji.
See guidance about what each control character does and what to expect.

Key use cases:

A user types a normal text note, and occasionally clicks the keyboard to insert an emoji by search or browsing.
A user explores Unicode effects by inserting control characters around or inside text and emoji and reading the help pane.
A user builds a small example, for example a text with directional marks or emoji variation selectors, and then copies it out to another app.
A user uses the first row of the keyboard as a quick palette of the most recently used emoji.

The app is not a full word processor and should stay focused on experimentation, learning, and quick note taking. UX must remain clean.

D00 High level UX flow 00
When the user opens index.html, they see almost the same screen as in the Typewriter Experience: background, paper with line numbers, and the bottom SVG keyboard. The controls panel at the top right (sound profile, volume) remains and may be extended slightly, but it should stay compact.

The user can immediately start typing on the paper using their hardware keyboard. The audio feedback is the same as before, based on the chosen sound profile and volume. The paper scrolls and grows vertically as content increases. Line numbers update in sync.

The SVG keyboard at the bottom no longer acts as a simple physical keyboard. Instead, it represents an Emoji and Unicode Control Palette that uses the same visual grid of keycaps. The user can click keys to insert emoji or Unicode characters at the current caret position on the paper.

The first row of the keyboard is dedicated to recents and search. It always shows the most recently used emoji plus an integrated search field. Lower rows are used for:
Emoji categories or filtered emoji results.
Unicode control characters and other special characters when the user is in a “Unicode control” mode.

A help pane is available on the side of the paper to explain what each control character does, with short examples. When the user hovers a palette key, or selects it, the help pane updates with a human readable explanation and sample text.

The user can toggle between different palette modes, for example:
Emoji mode.
Unicode controls mode.

The paper and typewriter remain the core visual focus. The palette interaction must feel like operating a panel on the same machine, not like opening a separate app.

E00 Palette modes and mode switching 00
The app needs at least two clear modes for the bottom keyboard: Emoji mode and Unicode controls mode. The mode determines what the keys on the SVG keyboard represent.

In Emoji mode:
Keys show actual emoji glyphs.
The first row shows a mix of recent emoji and a search field.
Other rows show emoji from the emojiData set, filtered by search or by category.
Clicking a key inserts the emoji into the paper and updates the recent list.

In Unicode controls mode:
Keys represent control characters or sequences that are relevant to text and emoji effects.
Each key shows a short label (for example “RLI”, “VS16”, “ZWJ”) and possibly a small icon.
Hovering or focusing a key shows a more detailed explanation in the help pane.
Clicking a key inserts the character or sequence into the paper at the caret position.

Mode switching should be simple and obvious. A compact tab like control or toggle near the keyboard or within the controls panel is acceptable, but it must not clutter the UI. The active mode should be clearly highlighted, so the user always knows whether they are inserting emoji or control characters.

The coding agent should reuse existing event wiring and CSS where possible and extend it to support mode state and mode dependent rendering of the SVG keyboard labels.

F00 First row layout: recent emoji and search 00
The first row of the SVG keyboard is special. It must behave differently from the other rows.

Functional requirements for the first row:

It always displays the most recently used emoji, updated whenever the user inserts an emoji.
Recent emoji are stored in localStorage using the same key structure as in the Emoji Picker project.
The first row also hosts a search input that allows the user to filter the emoji palette.

UX for the search integration:

The search input should visually fit into the key row. It may take the width of one or more “keys” but still look like part of the keyboard.
The placeholder text explains its purpose in simple words, for example “Search emoji”.
Typing into the search field filters the emoji that appear on the remaining keys in the keyboard, using the existing emojiData label search logic.
The recent emoji cells should remain visible even when a search query is active, so the user still has quick access to them.

The exact mapping of SVG key positions in the first row to “recent emoji cells” and “search area” is up to the coding agent, but the end result must feel coherent and usable.

G00 Emoji browsing and selection behavior 00
The Emoji mode needs to be more than a static row of emojis. It should offer a compact version of emoji browsing inside the keyboard grid, inspired by the separate emoji picker project.

Core behaviors:

Search: text entered into the search field filters emojiData by label. Only results are shown in the palette rows (apart from recents).
Recent: clicking any emoji key inserts that emoji at the caret position in the paper and moves it to the front of the recent list, which is displayed in the first row.
Default view: when there is no search query, the palette shows a meaningful selection of emojis. This can be random, by category, or using a simple heuristic, but it should not feel empty.
Click insertion: click on an emoji key inserts the emoji into the paper at the current caret position. Sounds should play similar to a keypress.

Visual rules:

Each key shows a single emoji, centered on the keycap, large enough to recognize.
Hover states and active states should reuse the existing key styling (fill change, drop shadow, slight translation on press).
When the user hovers an emoji key, the help pane may optionally show the emoji name and hex code, but the main focus of the help pane is Unicode controls.

The coding agent should adapt the emoji grid logic of the Emoji Picker to the fixed key layout of the SVG keyboard. If there are more results than keys, a simple paging or “more” behavior can be introduced, but the specification does not require a complex category system.

H00 Unicode control palette behavior 00
In Unicode controls mode, the keyboard must expose a set of Unicode control characters and related mechanisms that are useful for text effects and emoji behavior. These are not visual glyphs like normal emoji. The UX must make this clear and avoid confusion.

When the user switches to Unicode controls mode:

The labels on the keys change to show control names or short codes.
Hovering a key updates the help pane with:
The Unicode code point or sequence.
A short description in plain language.
A small example snippet that the user can copy or recreate on the paper.
Clicking a key inserts the character or sequence at the caret.

The control palette should group controls by type along rows where possible. For example, direction marks on one row, emoji presentation selectors and ZWJ on another, other specials on another.

The user should always understand that some controls affect ordering and presentation in subtle ways and that not all effects will be visible inside this one textarea. The help pane text should explain expectation and limitations.

The list of concrete control characters and sequences to support is defined in appendix M00. The coding agent should map this list to the available keys and design sensible labels.

I00 Help pane and learning experience 00
A key part of the project is to teach or guide the user about Unicode controls and emoji composition. The help pane is the main vehicle for this.

Placement and style:

The help pane should appear as a sidebar or panel adjacent to the paper, for example on the right side of the paper container.
Its style should match the typewriter theme: light background, subtle borders, and simple type.
It should not distract from the paper but should be easy to glance at while typing.

Behavior:

When the user hovers or focuses a Unicode control key, the help pane updates with the explanation for that key.
When the user clicks a Unicode control key, the help pane can briefly highlight or keep the description visible.
For emoji keys, the help pane may show the emoji name and codepoint but this is optional; the focus is on controls.

Content:

For each control or sequence, the pane should show:
A short name in simple English.
The Unicode code point or sequence in U+ notation.
A short one or two sentence description of what it does.
One minimal example line, typed as normal text, that uses the control or explains its effect in natural words.

The help content can be hard coded in a data structure that the coding agent defines, using appendix M00 as reference.

J00 Text input behavior and paper interaction 00
The paper must continue to behave like in the original Typewriter Experience:

The user types with their hardware keyboard.
Key sounds play based on the selected sound profile.
Enter adds a new line and plays the “ding” sound.
Tab inserts spaces.
Backspace works as normal.
Line numbers update and scroll in sync with the content.

The presence of emoji and control characters should not break any of this behavior. The textarea must accept these characters and keep caret handling consistent.

When the user inserts emoji or control characters via the SVG keyboard:

The insertion happens at the current caret position in the paper.
If there is a selection, that selection can be replaced by the inserted character or sequence.
The paper keeps focus so that the user can continue typing with hardware keys.

All audio and visual feedback for palette clicks should reuse the existing typewriter key feedback patterns.

K00 Technical constraints and architecture notes 00
The project must follow the same constraints as the existing Typewriter Experience and Emoji Picker:

No external dependencies or CDNs.
No bundlers or module loaders.
Must run correctly from a file URL.
Use only vanilla JavaScript, HTML, and CSS.

The coding agent should:

Keep the overall HTML structure close to the existing files, changing only where needed.
Reuse IDs and class names where possible to simplify CSS updates.
Extend the existing JavaScript file to manage the new modes, palette state, recent emoji, and help content.
Reuse the emojiData global array from the Emoji Picker project instead of introducing a new data source.

Data such as recent emoji and possibly user preferences can reuse the same localStorage key from the Emoji Picker project, in a way that does not break that project if both are opened in the same browser.

L00 Acceptance criteria 00
The new app should be considered complete when the following are true.

The app loads as a single page, looks like the Typewriter Experience, and has the same background, paper, and keyboard style.
Typing on the hardware keyboard produces sounds and writes on the paper like the original.
The bottom keyboard can switch between Emoji mode and Unicode controls mode.
In Emoji mode, the first row shows recent emoji and search, and lower rows show emoji from emojiData, filtered by search when needed.
Clicking an emoji inserts it into the paper and updates the recent list, and plays a sound.
In Unicode controls mode, the keys show control codes; clicking inserts the appropriate character or sequence; hovering shows details in the help pane.
The help pane updates correctly and remains readable and visually integrated with the design.
LocalStorage persists recent emoji between sessions.
The app stays responsive on different viewport sizes as in the original Typewriter Experience.

M00 Appendix: Unicode mechanisms and controls to support 00
This list describes the Unicode related controls and sequences that the Unicode controls mode should expose. The coding agent can adjust names and groupings, but these items should be represented.

Directional marks and bidi isolates.
Left to Right Mark - LRM - U+200E. Insertion mark that nudges surrounding text to left to right direction.
Right to Left Mark - RLM - U+200F. Similar but for right to left scripts.
Left to Right Isolate - LRI - U+2066. Starts a left to right isolated run.
Right to Left Isolate - RLI - U+2067. Starts a right to left isolated run.
First Strong Isolate - FSI - U+2068. Starts a run whose direction is decided by the first strong character.
Pop Directional Isolate - PDI - U+2069. Ends an isolate started by LRI, RLI, or FSI.

These do not rotate characters or emoji. They affect ordering when mixed scripts are used. The help pane should explain that the effect will be visible mainly when mixing left to right and right to left scripts, and may not show obvious changes in a simple Latin text line.

Emoji presentation selectors.
Variation Selector 15 - VS15 - U+FE0E. Requests text style for characters that support both text and emoji style, for example some hearts or symbols.
Variation Selector 16 - VS16 - U+FE0F. Requests emoji style.

Help content should show examples such as a heart symbol with and without VS16, and explain that the effect depends on the font and platform.

Zero Width Joiner and related composition.
Zero Width Joiner - ZWJ - U+200D. Joins adjacent emoji into a single composite glyph when the platform supports that sequence, for example family, profession, or multi person emoji.
Zero Width Non Joiner - ZWNJ - U+200C. Prevents joining in scripts where joining is otherwise automatic.

The pane should explain that ZWJ based sequences only work for defined combinations and that arbitrary combinations may fall back to separate symbols.

Emoji modifiers.
Skin tone modifiers - U+1F3FB through U+1F3FF. Applied after certain person and hand emoji to change skin tone. The palette might not expose all of them as separate keys, but at least one example and an explanation is useful.

The help pane should clarify that modifiers must follow a suitable base emoji and cannot be applied to arbitrary characters.

Space and separator characters.
No Break Space - NBSP - U+00A0. Space that prevents line breaks.
Narrow No Break Space - U+202F. Narrow version where supported.
Line Separator - U+2028. Line break character.
Paragraph Separator - U+2029. Paragraph level break.

These can be presented as special spacing keys that behave differently from normal spaces and line breaks. The help pane must explain their semantic roles and that some editors treat them as normal line breaks.

General special marks relevant to layout.
Soft Hyphen - SHY - U+00AD. Optional hyphen that is visible at line breaks.
Zero Width Space - ZWSP - U+200B. Invisible break opportunity without a visible space.

These are useful to show fine control of line breaks in some environments. In the textarea environment, the effect may be limited; the help pane must state that.

Other emoji related indicators.
Keycap combining mechanism: Combining Enclosing Keycap - U+20E3. In combination with digits “0” through “9”, “#”, and “*”, forms keycap emoji on some platforms.
Regional Indicator symbols U+1F1E6 through U+1F1FF. Used in pairs to form country flags.

These can be described as building blocks rather than single click solutions. The palette may provide a “Keycap builder” key that inserts a guide or example sequence.

The coding agent should store the help text and metadata for these items in a structured form in the JavaScript code and bind them to the key labels in Unicode controls mode. The help pane content must use simple language, similar to this appendix, and avoid deep theory while still being accurate enough for a curious user.

## TODO

This to-do list is both an implementation checklist for the coding agent and an acceptance-testing checklist; the agent should complete and then re-run this list to verify that all functional, UX, and technical requirements from the specification are fulfilled.

- [ ] Keep overall layout and visual style identical in spirit to the existing Typewriter Experience project.

  - [ ] Reuse the background gradient and SVG-based pattern layer to maintain the same atmosphere as the original typewriter app.
  - [ ] Reuse the central paper container with line numbers and the same basic typography and spacing.
  - [ ] Reuse the bottom fixed SVG keyboard as the main visual palette element, preserving the pseudo-3D styling of keys.
  - [ ] Reuse the top-right controls panel for sound profile selection and volume adjustment, extending it only where strictly necessary.

- [ ] Reuse and integrate source code from both the Typewriter Experience and Emoji Picker projects rather than rewriting functionality.

  - [ ] Copy the Typewriter Experience HTML, CSS, and JS as the structural and interaction base for the new app.
  - [ ] Copy the Emoji Picker emojiData dataset and any related search/filter logic into the new app.
  - [ ] Reuse the localStorage key and structure from the Emoji Picker for recent emojis, extending it safely as needed.
  - [ ] Reuse the Web Audio API sound engine implementation from the Typewriter Experience for key and ding sounds.

- [ ] Maintain the core typewriter behavior on the paper for normal text input.

  - [ ] Ensure hardware keyboard input types into the textarea without interference from the emoji and control palettes.
  - [ ] Keep Enter behavior as in the original, inserting a newline, playing a ding, and adjusting paper size/scrolling.
  - [ ] Keep Tab inserting spaces rather than losing focus or moving between controls.
  - [ ] Keep Backspace behavior unchanged for normal text editing.
  - [ ] Ensure line numbers update correctly on every input and scroll event.

- [ ] Keep the typewriter paper growing and scrolling behavior intact.

  - [ ] Preserve the dynamic height/scroll behavior so the textarea can hold long content while the keyboard stays fixed at the bottom.
  - [ ] Preserve the line-like background on the paper to keep the look of ruled paper.

- [ ] Preserve and extend the sound system with profiles and volume levels.

  - [ ] Keep all existing sound profiles and their behavior when keys are pressed or Enter is pressed.
  - [ ] Ensure the volume buttons (low, medium, high) adjust a multiplier used for all sounds.
  - [ ] Ensure a sound plays when emoji keys or Unicode control keys are clicked, consistent with normal key sounds.
  - [ ] Ensure sound profile changes via the dropdown are applied to all subsequent key and palette sounds.

- [ ] Introduce a clear concept of palette modes for the bottom keyboard: Emoji mode and Unicode controls mode.

  - [ ] Add a mode switch UI element that allows the user to toggle between Emoji mode and Unicode controls mode.
  - [ ] Make the active mode visually obvious so the user always knows what kind of symbols will be inserted.
  - [ ] Ensure mode state is reflected in how keys are labeled and what they insert.

- [ ] Redefine the function of the bottom SVG keyboard so it acts as an Emoji and Unicode Control Palette instead of a literal hardware keyboard.

  - [ ] Keep the physical layout and pseudo-3D rendering of keys while changing labels and semantics.
  - [ ] Remove or override the previous per-key character mappings so keys now represent emoji or Unicode controls.
  - [ ] Ensure clicking on any key inserts the correct symbol or sequence at the current caret in the paper.

- [ ] Implement Emoji mode on the keyboard palette.

  - [ ] In Emoji mode, render emoji glyphs on the keys instead of letter or symbol labels.
  - [ ] Use emojiData to populate keys with emojis based on default selection and any active search query.
  - [ ] Ensure clicking an emoji key inserts that emoji at the caret in the paper.
  - [ ] Ensure emoji insertion plays the same or similar key sound as normal typing.
  - [ ] Ensure emoji insertion updates the list of recent emojis.

- [ ] Implement Unicode controls mode on the keyboard palette.

  - [ ] In Unicode controls mode, render concise labels for each control or sequence (for example “LRM”, “VS16”, “ZWJ”).
  - [ ] Map each key to a specific Unicode control character or sequence defined in the appendix.
  - [ ] Ensure clicking a Unicode control key inserts the correct codepoint(s) at the caret in the paper.
  - [ ] Group related controls by row where possible (for example directional controls on one row, emoji presentation/ZWJ on another).
  - [ ] Ensure Unicode control insertion plays an appropriate key sound.

- [ ] Design and implement the special first row of the keyboard as “Recent + Search” for Emoji mode.

  - [ ] Dedicate the first row’s positions to showing most recently used emojis and a search input integrated into that row.
  - [ ] Ensure recent emojis are always visible in the first row, even when a search query is active.
  - [ ] Style the search input to visually fit within the row of keys, looking like it belongs to the keyboard surface.
  - [ ] Wire the search input so it filters the emojis drawn on the remaining palette keys using emojiData labels.
  - [ ] Ensure the recent emoji row updates immediately when an emoji is inserted, with the most recent at the front.

- [ ] Implement emoji search behavior using the emojiData dataset.

  - [ ] Use a case-insensitive search over emoji labels based on text typed into the integrated search field.
  - [ ] When the search field is empty, show a default selection of emojis (for example random or simple curated set) on the lower rows.
  - [ ] When the search field is non-empty, show search results mapped onto the available keys in the lower rows.
  - [ ] Handle situations where there are more results than keys, either by simple paging or a reasonable fallback strategy.

- [ ] Implement persistent recent emojis using localStorage as in the Emoji Picker.

  - [ ] Read recent emojis from localStorage using the existing top level key when the app loads.
  - [ ] If there is no stored data, initialize the recent list to an empty list or reasonable default.
  - [ ] Update localStorage whenever the recent emojis list changes after an insertion.
  - [ ] Show the recent emojis visually in the first row of the palette in Emoji mode.

- [ ] Implement a help pane to explain Unicode controls and optionally emoji metadata.

  - [ ] Add a help pane element in the layout adjacent to the paper (for example to the right of the paper).
  - [ ] Style the help pane to match the typewriter theme, with subtle borders and a light background.
  - [ ] Ensure the help pane does not overlap core content and remains readable on normal screen sizes.
  - [ ] Populate the help pane content dynamically based on which Unicode control key is hovered or selected.

- [ ] Define structured metadata for Unicode controls so the help pane can show rich information.

  - [ ] Create a JavaScript data structure that lists each control key with its name, codepoint(s), short description, and example text.
  - [ ] Ensure each entry has a simple human readable name (for example “Left-to-Right Mark”).
  - [ ] Store codepoints in U+ notation for display in the help pane.
  - [ ] Store a brief example snippet that illustrates usage or intent, even if the effect is not always visible in the textarea.

- [ ] Wire the help pane to keyboard interactions.

  - [ ] On hover or focus of a Unicode control key, update the help pane with that key’s metadata from the data structure.
  - [ ] On click of a Unicode control key, keep the help pane showing that key’s information so the user can read while typing.
  - [ ] Optionally show basic emoji information (name, codepoint) when hovering emoji keys, without overshadowing the control content.

- [ ] Implement the list of Unicode controls described in the specification appendix.

  - [ ] Implement directional marks LRM (U+200E) and RLM (U+200F) as selectable keys.
  - [ ] Implement directional isolates LRI (U+2066), RLI (U+2067), FSI (U+2068), and PDI (U+2069) as selectable keys.
  - [ ] Implement emoji presentation selectors VS15 (U+FE0E) and VS16 (U+FE0F) as selectable keys.
  - [ ] Implement Zero Width Joiner ZWJ (U+200D) and Zero Width Non-Joiner ZWNJ (U+200C) as selectable keys.
  - [ ] Implement one or more skin tone modifiers U+1F3FB through U+1F3FF as selectable keys or include them via a compact mechanism.
  - [ ] Implement NBSP (U+00A0), Narrow NBSP (U+202F), Line Separator (U+2028), and Paragraph Separator (U+2029) as selectable keys.
  - [ ] Implement Soft Hyphen (U+00AD) and Zero Width Space (U+200B) as selectable keys.
  - [ ] Implement a key or approach to illustrate Keycap combining using U+20E3 with digits and symbols.
  - [ ] Implement an explanation and, if reasonable, keys related to regional indicator symbols U+1F1E6 to U+1F1FF as building blocks for flags.

- [ ] Make sure the textarea can accept and display all inserted emoji and control characters.

  - [ ] Confirm that inserting emoji and control characters via clicks or typing does not cause errors or broken characters.
  - [ ] Confirm that the caret position is preserved and updated correctly after each insertion.
  - [ ] Confirm that control characters that may not have visible glyphs still exist in the text and can be copied out.

- [ ] Ensure the palette and help features do not break hardware keyboard typing.

  - [ ] Ensure that focus remains on the paper after clicking any palette key so the user can keep typing.
  - [ ] Ensure the search field has predictable focus behavior and does not trap the user away from the paper.
  - [ ] Ensure that the mode switch controls and help pane are keyboard accessible without disrupting normal typing too much.

- [ ] Keep the application fully offline and dependency free.

  - [ ] Ensure the app runs correctly when index.html is opened via file:// without a server.
  - [ ] Avoid any external fonts, CSS, or JS dependencies loaded from the network.
  - [ ] Avoid module systems, bundlers, and imports that would require a build step.

- [ ] Maintain and test responsive layout behavior.

  - [ ] Ensure the keyboard remains fixed at the bottom on different viewport widths and heights.
  - [ ] Ensure the paper area and help pane adapt gracefully to smaller screens.
  - [ ] Ensure the controls panel remains usable on narrow screens (for example collapsing or adjusting spacing).

- [ ] Provide a clean visual integration of all new elements with the existing typewriter aesthetic.

  - [ ] Ensure new UI elements (search field, help pane, mode switch) share fonts, colors, and shadows consistent with the typewriter style.
  - [ ] Avoid cluttering the screen with excessive controls, prioritizing clarity and simplicity.
  - [ ] Verify that the Emojis and Unicode control keys still look like part of the same physical machine keyboard.

- [ ] Perform end-to-end acceptance testing using this list.

  - [ ] Walk through all main user flows (typing, emoji insertion, control insertion, help reading) and verify each requirement above holds.
  - [ ] Check that no console errors occur during normal usage.
  - [ ] Confirm that all necessary functions work after a page reload, including persisted recents and settings where applicable.
  - [ ] Adjust implementation details where needed to satisfy both functional correctness and UX clarity described in the specification.



