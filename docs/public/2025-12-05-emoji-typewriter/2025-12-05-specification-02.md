# Typewriter Unicode Formatting
Date: 2025-12-05
A00 Concept and goals 00
This enhancement adds a Unicode Formatting pane to the existing typewriter project so that users can apply Unicode based text styles to selected text, similar in spirit to tools like YayText and other font converters, but integrated directly into the typewriter experience. The pane lives in the same interface as the paper, emoji keyboard, and Unicode controls, and focuses on styles that make sense in a document context: bold, italic, underlined, script, double struck, monospace, and a small number of decorative but still readable styles. All formatting is done by transforming characters into Unicode lookalike alphabets or by adding combining marks, so the resulting text can be copied and used on other sites that support Unicode.

The key idea is that the user works as usual in the typewriter, selects text in the paper, and then clicks a formatting button in the Unicode Formatting pane to transform only the selected text. Each button shows its own name rendered in the style it applies, so users can visually understand what the effect will look like before applying it.

B00 User experience and use cases 00
The main user is someone writing short notes, posts, or experiments who wants richer typography than plain monospaced text, but still within a text only environment. The typewriter already lets the user type with sounds, insert emoji, and insert low level Unicode controls. This enhancement solves the problem of having to leave the app to generate fancy text styles.

Typical use cases include emphasizing a heading or phrase by turning it into a bold or italic Unicode alphabet, visually separating sections using double struck or outlined text, creating pseudo headings inside one note without using markup, and using script or small caps to label parts of the note. Another use case is exploration: the user can quickly test how different Unicode alphabets look in their own text, then copy the result to social media or chat apps.

The user flow is simple. The user types normally on the paper, selects a word or sentence with the mouse or keyboard, then clicks a style button in the Unicode Formatting pane. The selection is replaced with a styled version, and the caret stays near the changed text so they can continue typing. If they select already styled text and apply a different style, the new style is applied on top, within the limits of the mapping rules.

C00 Layout and visual integration 00
The Unicode Formatting pane is placed on the left side of the keyboard area, as shown in the current screenshot where a placeholder panel titled “Unicode Formatting” appears to the left of the keyboard. The pane shares the same bottom strip as the keyboard and the search / Unicode controls area on the right, so all three elements form a consistent lower control band under the paper.

Visually, the pane looks like a vertical panel with a title and a column of style buttons. It uses the same color palette, radiused cards, and typography as the existing control panels: light card on darker background, subtle drop shadow, and monospace or similar fonts. The pane height matches the keyboard height so the lower band feels unified. On narrow screens, the pane may shrink or scroll vertically, but it should stay usable without hiding the keyboard.

D00 Unicode Formatting pane behavior 00
The pane contains a titled header (for example “Unicode Formatting”) and a scrollable list of style buttons. Each button has two roles: it presents a live preview of the style, and it applies that style to the current text selection in the paper.

A style button is active only when there is a non empty selection in the paper textarea. When the selection is empty, clicking a button should do nothing or show a subtle indication that a selection is required. When there is a selection, clicking a button transforms exactly the selected substring and replaces it in place. The pane does not manage focus itself; after clicking a button, focus should return to the paper so the user can keep typing.

Each button shows its style name rendered with the same Unicode transform that will be applied. For example, the “Bold” button label should be drawn using the bold Unicode alphabet, the “Italic” label with the italic alphabet, and so on. If a style uses combining marks, the button label uses the same technique, so the user sees underlines or strikethroughs on the label text. Buttons may optionally have a small secondary plain label for clarity, but the primary label is the styled one.

E00 Supported formatting styles 00
The initial version of the pane focuses on a curated set of styles that work well for document like writing and keep the text reasonably readable. All of them are implemented as text transformations using Unicode characters, not CSS.

Style: Bold (serif)
Letters and digits are mapped to the Mathematical Bold alphabet from the Unicode Mathematical Alphanumeric Symbols block. This gives a strong emphasis effect while remaining readable in most fonts.

Style: Italic (serif)
Letters are mapped to the Mathematical Italic alphabet. This is suitable for emphasis inside paragraphs, label text, or inline quotes.

Style: Bold Italic (serif)
Letters are mapped to the Mathematical Bold Italic alphabet, combining strong emphasis and slant. This is useful for headings or standout text.

Style: Bold Sans
Letters and digits are mapped to the Mathematical Sans Serif Bold alphabet. This looks more modern and can be used to visually separate labels or UI like text inside the note.

Style: Monospace
Letters and digits are mapped to the Mathematical Monospace alphabet, which looks like a code font. This style is used when the user wants to highlight code like snippets or technical identifiers.

Style: Double Struck
Letters and digits are mapped to the Mathematical Double Struck alphabet. This style is darker and more decorative and is suitable for very short labels or headings.

Style: Script
Letters are mapped to the Mathematical Script or Script Bold alphabets. This adds a handwritten flavor and is best for short signatures or decorative headings, not long paragraphs.

Style: Small Caps
Where Unicode provides small capital letters (for example in the Latin Extended blocks), letters are mapped to those characters; letters without a small caps equivalent remain unchanged or use uppercase as a fallback. This style creates a pseudo small caps heading.

Style: Underline
For this style, the text itself stays in its original characters, but each visible character in the selection receives a combining low line character (U+0332) or a similar underline combining mark. This visually underlines the selection while keeping letter forms unchanged.

Style: Strikethrough
The text keeps its original characters, and each visible character in the selection receives a combining long stroke overlay (for example U+0336). This visually strikes through the selection.

Style: Plain
This style attempts to convert stylized Unicode alphabets back to basic ASCII letters and digits. It is used to undo previous styling where possible, allowing the user to normalize text after experimentation. Characters without a known mapping are passed through unchanged.

The coding agent may add a small number of additional styles from the referenced sites if they fit the document context and remain readable, but the pane must not become overloaded. The listed core set should definitely be present and working.

F00 Selection handling rules 00
The formatting engine works on text selections in the main paper textarea. The selection is defined by the textarea selectionStart and selectionEnd positions at the time the user clicks a style button.

If selectionStart equals selectionEnd, the engine treats this as “no selection” and does not apply formatting. If the selection spans one or more characters, the engine extracts the substring, processes it according to the chosen style mapping, and then writes the transformed substring back between selectionStart and selectionEnd. After replacement, selectionStart and selectionEnd are updated to cover the new substring so the user can immediately see which text was changed.

Mappings for alphabet based styles operate character by character. ASCII letters a to z and A to Z are mapped to their styled equivalents via lookup tables; digits 0 to 9 are mapped when the target block supports them; all other characters (spaces, punctuation, emoji, control characters) are left unchanged.

Combining mark based styles (underline, strikethrough) iterate over each code unit in the selection and decide whether to append the combining character. The engine should not add combining marks after line breaks. Existing combining marks are preserved; if a character already has a similar mark, the engine may add another or skip it, but should avoid creating obviously broken sequences if easy to detect.

The Plain style reverses stylized alphabets back to ASCII by looking up each character in reverse mapping tables. If a character appears in known bold, italic, script, double struck, or monospace sets, it is converted back to the corresponding base letter or digit. Characters that are standard ASCII remain unchanged. Combining underlines and strikethrough characters are removed when applying Plain, effectively clearing those visual effects.

Formatting does not attempt to be context aware beyond the selection. If the selected text contains a mixture of already styled and normal characters, they are all passed through the same mapping. Re applying styles is allowed, and the result is simply the output of applying the mapping again over the current characters.

G00 Interaction with existing keyboard, emoji, and control features 00
The Unicode Formatting pane is independent of the bottom emoji keyboard and the right side Unicode / emoji notes panel. It does not change how the emoji palette or Unicode controls work.

When the user selects text and clicks a Unicode Formatting button, the operation is purely textual; it does not modify emoji palette state or Unicode control state. The sound engine can play a normal key click sound for formatting actions to maintain feedback, but this is optional.

Keyboard input, emoji insertion, and Unicode control insertion continue to work as they do now. The formatting engine simply operates on the text already in the paper. Emoji and control characters inside selections are preserved as is in alphabet mappings; underline and strikethrough styles may visually affect them by adding combining marks, which is acceptable as an experimental effect.

H00 Technical implementation notes 00
All logic is implemented in the existing JavaScript codebase without external libraries. The formatting engine should live in a clearly named module or section of script.js, with a data driven design where each style has a mapping definition and a handler.

For alphabet based styles, the coding agent should define lookup maps from ASCII letters and digits to their styled counterparts using precomputed strings or objects, not dynamic codepoint arithmetic. Reverse maps for Plain can be created by inverting these lookup maps.

For combining styles, the engine should append U+0332 for underline and U+0336 for strikethrough after each non whitespace, non newline character in the selection. The code should ensure that these combining characters are not inserted after newline characters `\n` and preferably not after other control characters.

The pane UI uses normal HTML elements (for example a div containing buttons) rather than SVG, since it sits alongside the existing HTML based notes and search panes. The buttons are styled to look like part of the machine but are standard clickable elements with event listeners.

All formatting actions must be synchronous and operate directly on the textarea value. The implementation should avoid any use of contenteditable elements, keeping the core text model as a simple textarea string to match the existing project design.

I00 Edge cases and limitations 00
The formatting engine depends on the current font in the textarea supporting the relevant Unicode ranges. In most modern browsers the Mathematical Alphanumeric Symbols block is supported, but some environments may show fallback boxes or missing glyphs. The specification accepts this limitation; no font download or external resource is added.

Because the text is stored as raw Unicode, the same string may render differently across platforms. The project does not attempt to normalize for all environments.

Repeated styling on the same text can lead to nested effects that may look busy or odd, especially when combining multiple combining marks. The Plain style provides a way to simplify text back to basic form, but it cannot always perfectly recover the original if the text contained arbitrary Unicode before styling.

Multi line selections are allowed and should work, but underline and strikethrough styles must be careful around line breaks. The implementation is not required to handle grapheme cluster boundaries perfectly; working at the code unit level is acceptable for this project as long as the visible output is reasonable in common cases.

J00 Validation to do list 00
This to do list is for both the coding agent and humans to use as an acceptance checklist to verify that the Unicode Formatting pane behaves as specified and integrates cleanly into the existing project.

- [ ] Confirm that a visible “Unicode Formatting” pane is present on the left side of the bottom keyboard band and matches the overall typewriter style.
- [ ] Confirm that the pane contains a vertical list of style buttons with readable spacing and scrolling if needed.
- [ ] Confirm that each style button label is rendered using the same Unicode style that the button applies to selected text.
- [ ] Confirm that clicking any style button when no text is selected in the paper does not modify the document and does not throw errors.
- [ ] Confirm that selecting a word or phrase and then clicking the Bold style button replaces only the selected text with a bold Unicode alphabet version.
- [ ] Confirm that selecting text and clicking the Italic style button replaces only the selection with a Unicode italic alphabet version.
- [ ] Confirm that Bold Italic, Bold Sans, Monospace, Double Struck, Script, and Small Caps styles each apply their respective Unicode mappings to the selected text.
- [ ] Confirm that alphabet based styles change only letters and digits and leave spaces, punctuation, emoji, and control characters unchanged.
- [ ] Confirm that the Underline style adds combining underline marks to each non newline character in the selection, visually underlining the text.
- [ ] Confirm that the Strikethrough style adds combining strike marks to each non newline character in the selection, visually striking through the text.
- [ ] Confirm that applying the Plain style to styled text converts bold, italic, script, double struck, monospace, and similar letters back to basic ASCII where mappings exist.
- [ ] Confirm that the Plain style removes underline and strikethrough combining marks from the selected text.
- [ ] Confirm that selections spanning multiple lines can be styled and that line breaks are preserved in place.
- [ ] Confirm that after a formatting button is clicked, focus returns to the paper and the user can continue typing without extra clicks.
- [ ] Confirm that formatting actions do not interfere with emoji insertion or Unicode control insertion behavior.
- [ ] Confirm that formatting actions do not break the existing sound system and that optional key sounds do not feel out of place.
- [ ] Confirm that no JavaScript errors appear in the console when repeatedly selecting text, applying styles, and using Plain to clear them.
- [ ] Confirm that the app still works correctly when opened from a file URL with no network connection.
- [ ] Confirm that the layout remains usable and visually coherent on smaller viewports, with the Unicode Formatting pane still accessible alongside the keyboard.
