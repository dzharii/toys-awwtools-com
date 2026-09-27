# R01 - The Courteous Machine

An illustrated, offline reference of courteous software messages. The collection contains 226 selected entries: phrases, complete examples, writing patterns, retained counterexamples, and complete multi-paragraph passages. Every entry is shown at work in a real situation, either through a hand-written worked example or, in the case of a passage, by being one already.

The phrasebook was assembled from 572 distinct wordings found in the supplied draft and follow-up chat sections, then reduced. Every entry was weighed against every other for what it alone contributed, and the 110 that earned their place were kept: the clearest statement of each idea, in each register that idea uses, across all twenty-three categories and every form the collection uses. What went was repetition rather than substance. Twelve entries were then written to cover kinds of message the draft never contained, giving 122. A later submission of 108 complete passages was reviewed the same way, four were set aside as repeating a lesson already told, and the surviving 104 were published word for word, giving the 226 here.

# S00 - Open the reference

Extract the entire ZIP, then open `index.html` in a modern desktop browser. Keep its sibling files and folders together. No server, installation, build step, account, API key or internet connection is required. Opening HTML while it is still inside an archive viewer may prevent adjacent files from loading.

The page uses classic `<script src="...">` tags, a local stylesheet, local images and system fonts. It does not fetch the catalog over the network, use modules, call an API or send data anywhere. The constructor does not save drafts across reloads; copy or download anything you want to keep.

# T01 - Find and adapt wording

Use the category index to browse by purpose. Search matches message text, original wording, editorial notes, situations and source section codes. Press `/` to focus search and Escape to clear it while the search field is focused.

Filter by form, register, origin and editorial status. The default view includes recommended and context-dependent wording. Counterexamples are retained but hidden until you select that form or include them in the editorial filter. "Ready to adapt" still means that the described facts must be true.

Every card carries an **Example in use**: a complete message, with concrete particulars, as a real product might ship it. On a counterexample the same block is labelled **Preferred instead** and shows the courteous form of the same message. The example sits in a panel of its own, set in a monospace face so that alignment and spacing can be read exactly as they will appear, and the editorial note has moved into a collapsed **Ready to adapt** or **Use with context** disclosure beneath it, so the card leads with the writing rather than with advice about the writing.

The example is presented in a text field rather than as inert text. You may put the caret in it, move through it by character, word or line, extend a selection from the keyboard, select any part of it with the pointer, use your own Select All, and copy with your own keyboard shortcut. You cannot alter it: typing, deletion, cutting, pasting, dropping text in, and undo are all refused, and the specimen is restored if anything slips through.

Each card carries two compact copy marks: one beside the phrase, one in the header of the example panel, so that each control plainly governs the text beside it. A successful copy turns the mark briefly into a checkmark in place, without moving anything else on the page, and a copy that fails says so rather than claiming otherwise. The buttons are a convenience; ordinary selection and your own copy command work just as well. "Compose with this" transfers the displayed wording into the constructor, preserving its text and showing any usage condition. More entries are revealed in groups of 30. "Print this selection" expands the entire filtered result before opening the browser print dialog.

The catalogue is set two cards to a row where the width allows it and one where it does not, so the examples are given a generous measure rather than being squeezed into narrow columns.

# U00 - Compose a message

Choose a built-in situation and register, or load an entry from the phrasebook. Edit the courtesy, message body, known state, next step and reference. State and next step have independent inclusion controls.

Placeholders such as `<item>`, `<reason>` and `<status_location>` generate editable value fields. Placeholder names may include letters, numbers, spaces, underscores, periods and hyphens. Repeated instances of one placeholder receive the same value. Empty fields leave their placeholder visible; fill them or deliberately revise the message before use.

The preview updates as you type. Loaded library wording is not rewritten by the register selector. Built-in success messages retain a positive opening. No style selector automatically asserts that data is safe or that a consequential operation may be retried.

Copy the completed message or download a plain text file. If clipboard access is unavailable for local files, a legacy copy fallback is attempted. If that is blocked too, select the preview and copy manually. Reset clears the selected scenario and entered values.

# UA00 - Generate code for a message

Every entry that is not a counterexample carries a small tool mark in its corner, and the message constructor carries a **Generate code** button. Both open the same panel.

Choose one of eighteen languages, listed alphabetically: C, C#, C++, Dart, Elixir, Erlang, Go, Java, JavaScript, Kotlin, PHP, Python, Racket, Ruby, Rust, Scala, Swift and TypeScript. The panel writes a small, self-contained function that composes the message and returns it, together with a commented header and a commented example call using sample arguments.

The header comment is the entry's worked example, wrapped in whatever comment syntax the language ordinarily uses for a documentation block. It is the same complete message shown on the card, so the developer reading the generated function can see at once what the function is for, rather than being told that a message is being composed.

The generated function does one thing: it builds text. Raising it as an exception, logging it, showing it or discarding it stays with the calling program. A template cannot know whether an operation truly failed, so it does not pretend to decide.

Placeholders become the function parameters, renamed to suit the language: `snake_case` for C, C++, Elixir, Erlang, Python, Ruby and Rust; `camelCase` or `lowerCamelCase` for C#, Dart, Java, JavaScript, Kotlin, PHP, Scala, Swift and TypeScript; `MixedCaps` for exported Go functions; `Uppercase` for Erlang variables, which the language requires; and `kebab-case` for Racket. A placeholder whose name is a keyword in any of the eighteen languages, or one of the few names the templates use for themselves, gains the word `value`: `<end>` becomes `end_value`, so the same parameter keeps the same name everywhere rather than breaking Ruby alone. An entry with no placeholders receives a single `reference` parameter, appended as a closing reference line, which is the same convention the message constructor uses.

Line breaks follow each language's ordinary practice rather than one imposed style: `String.join` in Java, an array joined with `\n` in JavaScript and TypeScript, `implode` in PHP, `"\n".join` in Python, a squiggly heredoc in Ruby, a multi-line string literal in Swift, `format!` with escaped line continuations in Rust, `fmt.Sprintf` in Go, `snprintf` in C, `io_lib:format` in Erlang and `format` in Racket. Characters that would otherwise be read as formatting directives are escaped: per cent signs for `printf` and `fmt`, tildes for Erlang and Racket, braces for C# and Python and Rust, dollar signs for Dart, Kotlin, PHP and Scala.

C receives two functions, because allocating inside a message helper is often precisely what a C caller does not want: one writes into a buffer the caller owns and returns the required length in the manner of `snprintf`, and one allocates and returns memory the caller must free.

The code box is editable and highlighted at the same time. Type in it freely; **Copy code** copies exactly what is shown, and **Restore generated** discards your edits and regenerates. Changing the language also regenerates. Nothing is saved between visits.

While the panel is open the page behind it does not scroll, in either direction and at either end of the code box. No scrollbar is hidden to achieve this: the page keeps its own scrollbar, it simply declines to move while you are reading code.

# V01 - Editorial scope and provenance

The source conversation begins mid-example and says earlier content was omitted. This edition covers the visible material only. The coverage review accounts for 204 fenced example blocks across 52 supplied sections, plus the incomplete opening fragment and table entries. It does not reconstruct unseen conversation.

Exact repeats are combined after whitespace normalization; distinct variants and complete examples remain separate. Every catalog entry retains its source section, original text and original extraction identifiers. Display punctuation uses ASCII alternatives. Original source punctuation remains in the archival files.

The 572 deduplicated wordings were then judged one against another and reduced to 110. An entry was kept when it stated an idea better than any other entry stated it, when it was the only member of its category in a given register, or when it exercised a distinct shape of message: no placeholders, one, several, a single line, a labelled table of particulars, a full ASCII banner. An entry was removed when another entry already said the same thing, or when it was a bare vocabulary fragment rather than a message anyone could send. Twenty ways of declaring that nothing had been changed became four; the glossary of failure verbs went entirely. All twenty-three categories, every form, all four registers and both origins survive. The dropped wordings remain in the archival extraction files.

Reading the survivors as a set showed what the source conversation had never discussed. Twelve entries were written to close those gaps: work still in progress, a deprecation notice, payment details about to expire, a retention deletion announced in advance, an unrecognised sign-in, an available update that does not insist, an undo window, a finished background job, escalation to a person, an inactivity sign-out, a temporary lock after repeated attempts, and a request the service simply cannot perform. That gives the 122 published here.

Every published entry then received a hand-written worked example: the entry's wording as a complete message, with concrete particulars, that a real product could send unaltered. The examples were reviewed entry by entry for factual coherence, for stating plainly what was not changed as well as what was, and for ending with one clear next step or an explicit statement that none is required. That review found real faults and each was corrected: claims that ran ahead of the evidence, an ambiguity that was not actually ambiguous, a date that fell on the wrong weekday, an arithmetic slip, two sets of mutually contradictory facts, and several examples that explained the writing instead of demonstrating it. Distinctive particulars reused across unrelated examples were also separated, so no two entries appear connected by accident.

Four supplied examples receive explicit technical revisions: connection refusal is described without assuming the intended host was reached, non-submission is scoped to the failed connection, uncertain completion remains uncertain, and internal-error retry advice calls for status verification. A new example uses separate ready/review count placeholders. Revised entries expose their original wording.

Theatrical apology remains available, including the exaggerated forgiveness family. It is contextual rather than categorically rejected. Sweeping assurances, figurative retirement, unsupported compliments and outcome-dependent remedies carry conditions. Brief engineering terms are retained as vocabulary; they are not presented as complete polite diagnostics.

`content/editorial-review.md` reports the original 535 extraction records before cross-section deduplication and the final 18 additions. The forty follow-up examples are preserved in `content/chat-additions-v2.md` and `.json`, with additional context notes attached to the catalog records. The final catalog is authoritative for displayed wording and final status. `content/coverage-review.md` reports source coverage independently of editorial selection.

# W01 - Files

| File or folder | Purpose |
| --- | --- |
| `index.html` | Single-page reference, constructor container and writing guide |
| `styles.css` | Responsive letterpress-inspired layout and print styling |
| `app.js` | Search, filters, navigation, pagination, copying and printing |
| `passage.js` | Reads the marks in a multi-paragraph passage: runs, plain text, blanks and sample values |
| `constructor.js` | Offline message composer and placeholder substitution |
| `codegen.js` | Message model, category shapes, sample arguments and the code panel |
| `codegen-languages.js` | One renderer per language: naming, escaping and line-break idiom |
| `codegen-highlight.js` | Modified copy of microlight, used for the editable highlighted box |
| `lib/lib-asvd-microlight-0.0.7/` | Unmodified upstream microlight 0.0.7 with its MIT licence, kept for reference |
| `content.js` | Classic-script copy of the structured catalog |
| `assets/correspondence-plate.png` | Four generated engraving-style vignettes, used as CSS quadrants |
| `content/catalog.json` | Complete final catalog with provenance and editorial status |
| `content/raw-source.md` | Visible supplied draft in reading order |
| `content/passages-v5.md` | The 108 supplied passages as received, with the four exclusions noted |
| `content/extract-*.json` | Original extraction records before cross-section deduplication |
| `content/additions*` | Newly authored examples and prerequisites |
| `content/editorial-review.*` | Editorial decisions and conditions from the review |
| `content/coverage-review.md` | Independent extraction completeness audit |
| `design/mockup-*.png` | Three generated visual reference directions |
| `design/prompts.txt` | Image generation prompts; built-in generation was used |
| `assets/social-preview.jpg` | Generated 1200 x 630 JPEG social preview |
| `assets/favicon.*`, `assets/favicon-32.png`, `assets/apple-touch-icon.png` | Configured vector, ICO, PNG and touch icons |
| `content/chat-additions-v2.*` | Forty follow-up examples with preserved section codes |
| `CHANGELOG.md` | Version 2 and version 3 changes |
| `VALIDATION.md` | Checks performed and remaining verification limits |

# X00 - Design and maintenance

The selected direction is the ivory-and-coral correspondence desk: serif specimens, a narrow index, restrained red rubric, and engraved mechanical clerks. The other two references explore an oxblood book-cover treatment and a blue editorial index. They are concept images rather than screenshots of the finished page.

All production assets are local. To edit the collection, update `content/catalog.json`, then regenerate `content.js` with the same array assigned to `window.COURTESY_CATALOG`. A one-line Node command from this folder is:

```sh
node -e "const fs=require('fs');fs.writeFileSync('content.js','window.COURTESY_CATALOG = '+fs.readFileSync('content/catalog.json','utf8')+';\n')"
```

No build tool is otherwise needed. Keep entry IDs unique and preserve `originalText`, `originalIds` and `sources` when revising source-derived messages.

# Y00 - Verification limits

JavaScript syntax checks and DOM-based interaction tests pass. Seventy-nine behaviours are confirmed, covering search, filters, pagination, empty states, category selection, constructor transfer, tone behavior, placeholder substitution, reset, text-only handling of markup-like input, passages, and the example panels and copy controls described below. Local dependencies, source coverage and archive contents were checked separately.

Code generation is checked further. All 226 entries were generated in every one of the eighteen languages, 4,068 snippets in total, with no failures and an equal count per language. Eight of those languages were then compiled and executed over the whole catalog, with the returned text compared character by character against the expected message: JavaScript and TypeScript under Node, TypeScript after a strict `tsc` type check; Python under CPython; C and C++ with clang under `-Wall -Werror`, the C case calling both the buffer and the allocating entry point and requiring them to agree; Java under the local JDK; C# under the local .NET SDK; and Rust under `rustc`. Each reported 226 of 226 matching. The remaining ten languages have no toolchain here and rest on the shared model those eight confirm. Positional and named parameters were also checked to reach every function body: 904 renders, none missing a parameter. The highlighter was run over 594 generated snippets and its output verified to contain exactly the original characters with balanced markup, so the highlighted mirror cannot drift away from the editable text beneath it.

The worked examples carry their own checks. Every entry must have one; each is plain ASCII, free of carriage returns and trailing spaces, and no line exceeds seventy-four characters, which keeps every generated snippet inside about eighty columns once a comment marker and indentation are added.

The version 5 interface was reviewed in a local headless Chrome at 1440 and 390 pixels wide. The editor and its highlighted mirror were measured to share identical font, size, line height, letter spacing, padding, white space and tab size, to be positioned identically, and to report the same scroll width and height. Italic comment styling was measured against upright code and advances by 0.001 pixels per character, which is rounding rather than drift. Scroll containment was measured rather than assumed: with the panel open and its editor scrolled to the end, further wheel input left the page scroll position unchanged, the page scrolled again once the panel closed, and no scrollbar was hidden on either the document or the body.

The example panels were verified in the same way. The grid was measured at 1920, 1600, 1440, 1280, 1100, 1024, 900, 768 and 390 pixels and never produced more than two columns, retiring to one at 1050. Every rendered specimen was compared character by character against the stored example and matched exactly, including the leading spaces that align the small tables, and none required an internal scrollbar. Caret movement, line movement, keyboard selection, word-wise selection, Select All and pointer selection were each driven by real input and confirmed. Typing, deletion, cut, paste, a dropped payload, an editing command, a composed character, undo and a direct assignment to the field were each attempted and left the specimen unchanged. Each copy control was confirmed to copy exactly its own text, to mark only itself without shifting the page, to keep focus, to return to rest, and - with the clipboard forced to fail - to show no success and fall back to the page's ordinary error notice instead.

Clipboard permissions and download behavior can vary by browser; manual copying remains available. A plain `readonly` text field was tried first and rejected on evidence: Chrome accepts focus and Select All in such a field but will not move the caret or extend a selection within it, so the specimen is an ordinary text field whose every attempted modification is refused in one place, with `aria-readonly` reporting its nature. This was measured in Chrome only; other browsers, touch input, screen readers and input-method editors were not tested here. The earlier releases' responsive and print rules for the original page were not re-verified beyond the new panel.

# Z00 - Social previews and icons

`assets/social-preview.jpg` is a genuine RGB JPEG at 1200 x 630, generated in the same ivory-and-coral engraved style as the reference. The HTML includes the page description, Open Graph title/description/image/type/dimensions/alt text, X/Twitter large-image card title/description/image/alt text, and theme colour. All descriptions follow the courteous phrasebook voice. Generation details are in `design/social-preview-prompt.txt`.

The offline package uses relative image paths because no public site URL has been supplied. Social networks cannot fetch a page opened from a local ZIP or file path. Before sharing a hosted copy, replace `og:image` and `twitter:image` with the actual absolute HTTPS URL of `assets/social-preview.jpg`, then add `og:url` and a canonical link for the actual public page URL. No public URL or account has been invented, and this release does not publish the site.

The favicon is configured through a scalable SVG, a 32-pixel PNG and a multi-size ICO. A 180-pixel touch icon is also linked. These assets are local and work without a network connection.

# ZB00 - Credits and licences

This reference was inspired by [Bespoke: A Programming Language for People Who Say Please](https://blog.hofstede.it/bespoke-a-programming-language-for-people-who-say-please/) on the Larvitz Blog, which imagined a language that refuses to compile without courtesy. The joke there is the argument here: politeness costs a program almost nothing, and the reader is owed both the manners and the facts. The credit appears on the page in the index colophon, in section L00 of the writing desk, and in the footer.

Syntax highlighting uses a modified copy of [microlight](https://github.com/asvd/microlight) 0.0.7 by asvd, used under the MIT licence. The modification is `codegen-highlight.js`; its header records the original copyright, the full licence notice and what was changed. Because this project has no build step, the library is vendored by hand rather than installed. The unmodified upstream file and its `LICENSE` are kept alongside it in `lib/lib-asvd-microlight-0.0.7/` so the two can be compared.

```
The MIT License (MIT)

Copyright (c) 2016 asvd <dfsdfg@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

The language list is the set offered by LeetCode. LeetCode lists Python and Python 3 separately; this generator emits one modern Python, since a phrasebook has no reason to produce wording for an unsupported interpreter.
