# Typewriter Unicode Formatting
Date: 2025-12-05
A00 Purpose and context 00
This specification describes a new set of text transformation helpers to be added to the existing Unicode Formatting pane in the typewriter project. The new helpers target software development use cases: they convert selected text between common identifier styles such as snake_case, kebab-case, camelCase, PascalCase, and normal human readable text, as well as plain upper and lower casing. These helpers are not Unicode “fonts”; they are structural transformations on characters and separators, but they live in the same pane as the Unicode styles because they operate on selected text in the same way.

The goal is to make it easy to move back and forth between prose and code style identifiers without leaving the typewriter. A user should be able to write a phrase, turn it into a snake case identifier, later convert that identifier back into spaced normal text, and move between different cases while keeping the text logically consistent and, where possible, reversible.

B00 UX concept and usage 00
The Unicode Formatting pane already sits to the left of the keyboard and contains buttons that apply Unicode styling to the current selection. This new group appears inside the same pane under a clear subheading, for example “Code casing helpers”. Visually it uses the same button style and layout as the existing Unicode styles so that the whole pane feels consistent.

Each helper acts on the current text selection in the main paper textarea. The user selects text with mouse or keyboard, then clicks one of the helper buttons. The selection is replaced by the transformed version. No transformation is applied if there is no selection. After the operation, the caret and selection stay around the transformed text so the user can immediately see and continue editing.

The button labels show an example of the transformation using their own name. For example the snake case button label is written as “snake_case”, the kebab case button as “kebab-case”, the Pascal case button as “PascalCase”, and the camel case button as “camelCase”. “Normal text” is shown in plain spaced words. This makes the effect discoverable without extra documentation.

Typical usage examples:

A user types “Where are my socks?” in the note, selects that phrase, clicks the snake_case button, and the selection becomes “where_are_my_socks”.

The same user later selects “where_are_my_socks”, clicks the UPPERCASE button, and the result becomes “WHERE_ARE_MY_SOCKS” while the underscores remain.

Another time, the user copies a variable name “someVeryLongVariableName” from code, pastes it into the note, selects it, clicks Normal text, and the result becomes “some very long variable name” as a normal sentence.

If the user selects a run of text like “hellopascal” where there are no separators or case boundaries, Normal text does nothing and leaves the selection unchanged. The system only “undoes” cases when there is enough structure to do so safely.

C00 Set of helpers and intended behavior 00
The following helpers are introduced in this group. All of them act only on the selected text. They work best on languages that use alphabetic letters (Latin, Cyrillic, Greek, etc.), and will mostly act as no-ops on scripts where word boundaries cannot reasonably be inferred (for example continuous Japanese text).

1. Normal text.
   Converts typical identifier styles (snake_case, kebab-case, camelCase, PascalCase, UPPER_SNAKE, lowerCamel, mixed digits) back into spaced text. Separators such as underscores and hyphens become spaces. Transitions in camel and Pascal case are turned into spaces and the following word is lowercased. The helper does nothing if it cannot confidently detect word boundaries.

Example: “hello_world” becomes “hello world”.
Example: “whereAreMySocks” becomes “where are my socks”.
Example: “HelloWorld” becomes “hello world”.
Example: “hellopascal” stays “hellopascal” because there is no safe way to split it.

2. snake_case.
   Builds lower snake case identifiers from words in the selection. Words are defined by sequences of letters or digits. Word separators include spaces, underscores, hyphens, common punctuation, and symbol characters. Non word characters between words are treated as separators; multiple separators collapse into a single underscore.

Example: “Where are my socks?” becomes “where_are_my_socks”.
Example: “ваша_Переменная-счётчик” becomes “ваша_переменная_счётчик”.

3. kebab-case.
   Same logic as snake_case, but using hyphens instead of underscores, producing lower kebab case.

Example: “Where are my socks?” becomes “where-are-my-socks”.

4. camelCase.
   Builds lower camel case identifiers. The first word becomes all lower case; each following word is capitalized (first letter uppercase, rest lowercase) and concatenated. Separators are handled like in snake_case.

Example: “where are my socks” becomes “whereAreMySocks”.
Example: “where_are-my socks” also becomes “whereAreMySocks”.

5. PascalCase.
   Builds upper camel case identifiers. Every word is capitalized and concatenated.

Example: “hello pascal” becomes “HelloPascal”.
Example: “hello_pascal” becomes “HelloPascal”.

6. Title Case.
   Turns the selection into a spaced title by capitalizing each word while keeping spaces between them. Word boundaries follow the same rules as Normal text. This is useful when converting from identifiers back to headings.

Example: “where_are_my_socks” becomes “Where Are My Socks”.

7. UPPERCASE and lowercase.
   UPPERCASE turns all letters in the selection into uppercase using Unicode case mapping and leaves digits, underscores, hyphens, and other characters unchanged. lowercase turns letters into lowercase and leaves everything else unchanged.

Example: “where_are_my_socks” with UPPERCASE becomes “WHERE_ARE_MY_SOCKS”.
Example: “HelloWorld” with lowercase becomes “helloworld”.

These helpers are intended to compose. For example, a user can select a phrase, apply snake_case, then apply UPPERCASE to create UPPER_SNAKE, or use PascalCase after Title Case to normalize a heading into a class name.

D00 Selection semantics and scope 00
All helpers operate strictly on the current selection in the main paper textarea. The selection is defined by selectionStart and selectionEnd.

If selectionStart equals selectionEnd, the helper treats this as no selection and returns without changing text. It may optionally flash a brief hint in the Unicode Formatting pane (“select text first”), but it must not change the document.

If selection spans one or more characters, the engine extracts that substring, applies the chosen transformation, and writes it back in the same position. After replacement, the engine sets selectionStart and selectionEnd to cover the transformed substring, so subsequent helper presses work on the same logical segment.

Selections may cross line breaks. Transformations must preserve line breaks in place. For example, if the user selects “first line\nsecond line” and uses snake_case, the result should be “first_line\nsecond_line” with the newline preserved.

Emoji and other non letter symbols inside the selection are treated as word breaks or preserved characters depending on the helper, but they are never removed silently. The goal is to change word structure while not losing non structural characters.

E00 Word detection, language support, and separators 00
Word detection is based on Unicode properties rather than ASCII only rules. For implementation, a “word character” should be any character where the Unicode property “Letter” or “Number” is true (for example \p{L} and \p{N} in JavaScript regular expressions). This makes the helpers work for Latin, Cyrillic, Greek, and other alphabetic scripts, as long as they use letters and digits.

Separators are characters that break words. They include: whitespace; underscores; hyphens; punctuation characters (comma, period, semicolon, colon, question mark, exclamation mark); math and symbol characters such as plus, minus, asterisk, slash, equals; and any other character that is neither a letter nor a digit.

In the forward direction (building snake, kebab, camel, Pascal), separators are treated as boundaries. Multiple consecutive separators are collapsed into a single logical boundary.

When converting identifiers back to Normal text, the engine uses two types of information: explicit separators (underscores and hyphens) and implicit boundaries (case changes and letter/digit transitions).

1. Explicit: any underscore or hyphen between word characters becomes a space. Runs of multiple underscores or hyphens become a single space.

2. Implicit camel or Pascal boundaries: a boundary exists between a lowercase letter followed by an uppercase letter; between a letter followed by a digit; and between a digit followed by a letter. At those boundaries, Normal text inserts a space and lowercases the leading character of the new word unless it is all caps.

If the entire selection consists of letters in one case (all lower or all upper) with no underscores, hyphens, digits, or obvious boundaries, Normal text should treat it as ambiguous and leave it unchanged. This prevents turning “hellopascal” into incorrect guesses like “hellop ascal”.

F00 Transformation rules and examples 00

F01 Normal text 00
Input: arbitrary identifier style string.
Process:

1. Replace sequences of underscores and hyphens between word characters with a single space.
2. Scan left to right to detect implicit boundaries inside contiguous letter/digit runs:
   a) If a lowercase letter is followed by an uppercase letter, insert a space before the uppercase letter and lowercase that uppercase letter.
   b) If a letter is followed by a digit, insert a space before the digit.
   c) If a digit is followed by a letter, insert a space before the letter.
3. Normalize sequences of multiple spaces to a single space.
4. Trim leading and trailing spaces from the result.

Examples:

“hello_world” -> “hello world”.
“HelloWorld” -> “hello world”.
“someVeryLongVariableName” -> “some very long variable name”.
“URLParser2Result” -> “URL parser2 result” (capitalized acronym stays, number is treated as boundary).
“hellopascal” -> “hellopascal” (no change).

F02 snake_case 00
Input: arbitrary text.
Process:

1. Split the selection into tokens of letters/digits and separators using Unicode aware rules.
2. For each token that is letters/digits, lowercase all letters.
3. Join tokens, inserting a single underscore between word tokens, ignoring separator tokens.
4. Do not generate leading or trailing underscores; if the first or last tokens are separators, they are dropped.

Examples:

“Where are my socks?” -> “where_are_my_socks”.
“ваша Переменная-счётчик” -> “ваша_переменная_счётчик”.
“ already_snake_case ” -> “already_snake_case”.

F03 kebab-case 00
Same as snake_case but with hyphen instead of underscore when joining word tokens.

Examples:

“Where are my socks?” -> “where-are-my-socks”.

F04 camelCase 00
Input: arbitrary text or an identifier containing separators.
Process:

1. Tokenize into word tokens as for snake_case.
2. Lowercase all letters in each token first.
3. For the first word token, leave lowercase.
4. For each following word token, uppercase the first letter and keep remaining letters lowercase.
5. Concatenate tokens without separators.

Examples:

“where are my socks” -> “whereAreMySocks”.
“where_are-my socks” -> “whereAreMySocks”.
“HELLO_WORLD” -> “helloWorld”.

F05 PascalCase 00
Same as camelCase, except that the first word is also capitalized.

Examples:

“hello pascal” -> “HelloPascal”.
“hello_pascal” -> “HelloPascal”.

F06 Title Case 00
Input: text that may include identifiers or normal phrases.
Process:

1. Convert using Normal text first to get spaced words.
2. Split by spaces into word list.
3. Capitalize the first letter of each word, keeping the rest lowercase.
4. Join with single spaces.

Examples:

“where_are_my_socks” -> “Where Are My Socks”.

F07 UPPERCASE and lowercase 00
UPPERCASE: for each letter in the selection, apply Unicode uppercase mapping; all other characters, including underscores and hyphens, are left unchanged.

lowercase: same but with Unicode lowercase mapping.

Examples:

“where_are_my_socks” with UPPERCASE -> “WHERE_ARE_MY_SOCKS”.
“HelloWorld” with lowercase -> “helloworld”.

In all conversions that replace separators (for example from punctuation or symbol runs), if multiple separators occur consecutively, they are treated as a single boundary: a cluster of “---__++” becomes one underscore or hyphen or just one boundary for camel/Pascal.

G00 Error handling, idempotence, and reversibility 00
Helpers must be safe to run repeatedly. Applying snake_case to a string that is already in correct snake case should return the same string. Similarly, applying Normal text to already spaced simple text should leave it unchanged.

When the logic cannot determine sensible boundaries (for example plain “hellopascal” with no hints), transformations that rely on boundaries should do nothing rather than produce wrong results. That means Normal text is sometimes a no-op by design.

The transformations should be as reversible as reasonably possible when used in expected flows:

Phrase -> snake_case -> Normal text should round trip to a similar phrase (case may change to lowercase).

Phrase -> Title Case -> PascalCase -> Normal text should give a phrase that is close to the original.

Because information is lost when converting free text to identifiers (punctuation, some capitalization), exact round trips are not required; what matters is that the result is readable and structural decisions are consistent.

H00 UI layout and button labeling 00
Within the Unicode Formatting pane, this new group should have its own label, for example “Case helpers” or “Code identifiers”, so users can see which buttons are typographic and which are code related. Buttons are visually identical to existing Unicode style buttons.

Button labels use the transformation they represent:

Normal text button label: “normal text” in plain spaced form.
snake_case button label: “snake_case”.
kebab-case button label: “kebab-case”.
camelCase button label: “camelCase”.
PascalCase button label: “PascalCase”.
Title Case button label: “Title Case”.
UPPERCASE button label: “UPPERCASE”.
lowercase button label: “lowercase”.

Hover text (tooltips) should briefly explain “Works on selected text only” and give a short example, such as “Where are my socks -> where_are_my_socks”. This reinforces the selection based nature of the helpers.

I00 Implementation notes 00
The implementation is in plain JavaScript with no external libraries. All transformation logic should be encapsulated in a small module or object mapping helper IDs to functions. Each function accepts the selected string and returns the transformed string.

JavaScript regular expressions with Unicode property escapes (\p{L}, \p{N}) can be used where supported; where not available, a simpler approximation using ranges may be acceptable, but the design assumption is modern browsers.

The module that handles Unicode Formatting actions already knows how to read and write the textarea selection; the new helpers can reuse this mechanism. The main difference is the mapping logic.

Care should be taken to handle surrogate pairs and non BMP characters transparently: the transformations should not attempt to split inside codepoints; using JavaScript strings at code unit level is acceptable as long as separators are defined in terms of characters rather than index arithmetic on emojis. In practice, since the helpers focus on letters and digits, this is sufficient.

J00 Validation to do list 00
This checklist is for implementation and acceptance testing of the new helper group. Each item should be verified manually or via automated tests against the running application.

- [ ] Confirm that the Unicode Formatting pane shows a distinct “case helpers” group with buttons for Normal text, snake_case, kebab-case, camelCase, PascalCase, Title Case, UPPERCASE, and lowercase.
- [ ] Confirm that each button label visually matches the style it represents (for example “snake_case” is displayed as “snake_case”, “camelCase” as “camelCase”).
- [ ] Confirm that clicking any helper button while no text is selected in the paper does not change the text and does not throw JavaScript errors.
- [ ] Confirm that selecting “Where are my socks?” and pressing snake_case produces “where_are_my_socks”.
- [ ] Confirm that selecting “Where are my socks?” and pressing kebab-case produces “where-are-my-socks”.
- [ ] Confirm that selecting “where are my socks” and pressing camelCase produces “whereAreMySocks”.
- [ ] Confirm that selecting “where are my socks” and pressing PascalCase produces “WhereAreMySocks”.
- [ ] Confirm that selecting “where_are_my_socks” and pressing UPPERCASE produces “WHERE_ARE_MY_SOCKS”.
- [ ] Confirm that selecting “HelloWorld” and pressing lowercase produces “helloworld”.
- [ ] Confirm that selecting “where_are_my_socks” and pressing Normal text produces “where are my socks”.
- [ ] Confirm that selecting “someVeryLongVariableName” and pressing Normal text produces “some very long variable name”.
- [ ] Confirm that selecting “HelloWorld” and pressing Normal text produces “hello world”.
- [ ] Confirm that selecting “hellopascal” and pressing Normal text leaves the text unchanged.
- [ ] Confirm that selecting text with mixed Cyrillic letters like “ваша_Переменная-счётчик” and pressing snake_case yields a correct snake case form such as “ваша_переменная_счётчик”.
- [ ] Confirm that multiple punctuation characters between words (for example “word---__++word”) are converted to a single underscore in snake_case and a single hyphen in kebab-case.
- [ ] Confirm that selecting a multi line region and applying snake_case or kebab-case preserves line breaks and converts each line independently.
- [ ] Confirm that running snake_case or kebab-case on text that is already in that case returns an unchanged string.
- [ ] Confirm that the helpers do not remove emoji or unrelated symbols inside selections; they either treat them as separators or leave them untouched.
- [ ] Confirm that after each helper action, the selection remains around the transformed text and focus returns to the paper textarea.
- [ ] Confirm that the helpers coexist with existing Unicode formatting buttons and emoji controls without breaking their behavior or layout.
