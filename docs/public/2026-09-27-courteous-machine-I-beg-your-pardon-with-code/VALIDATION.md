# QA00 - Completed checks

The three application JavaScript files pass Node syntax checks. A LinkeDOM test harness executed the actual application and constructor code against the supplied HTML and verified initial rendering, search, zero-result reset, form/origin/editorial filters, category selection, pagination, transfer to the constructor, preservation of loaded wording across tone changes, placeholders containing spaces, safe display of markup-like input, reset of old values, uncertain-outcome wording, independent state inclusion, and positive success openings.

The source coverage audit checked all 204 fenced blocks in the visible supplied source, table phrases, complete universal templates and the initial incomplete fragment. Original extracted records remain available alongside the deduplicated final catalog.

# QB00 - Limits

The DOM harness does not implement browser layout, clipboard permissions or native downloads. It is not a substitute for a desktop or mobile browser review. The cloud browser rejected local-file navigation, and no usable local browser executable was available. No rendered-site screenshot is claimed; the design images are generated concepts. Responsive layout, print appearance, and native clipboard/download behavior remain unverified in a real browser.

# QC00 - Offline architecture

The shipped HTML uses local classic scripts and CSS. The catalog is loaded through a script assignment, so it does not depend on `fetch`, ES module imports or a server. There are no remote fonts, application dependencies, trackers, external images, analytics, service workers or network requests. Source links point to local files. Placeholder values are inserted as text, not interpreted as HTML.

# QD00 - Version 2 verification

Verified that all forty follow-up sections BA00-CN00 are present, all 532 previous catalog records remain, and all 572 IDs are unique. Confirmed the catalog script matches the JSON, version-2 filtering returns forty entries, and a newly merged passage loads into the constructor. JavaScript syntax and the existing DOM interaction checks pass.

The social asset was inspected and decoded as a 1200 x 630 RGB JPEG. Open Graph and X/Twitter fields reference that file; all configured favicon assets exist. The ZIP was checked for valid CRCs and complete file references. Social crawler behavior has not been tested against a hosted URL, because this is an offline release.

# QE00 - Version 3 verification

All six JavaScript files pass Node syntax checks, including the three added for code generation.

Generation correctness. Every one of the 572 catalog entries was rendered in all eighteen languages, producing 10,296 snippets with no renderer failure and no empty output. This exercises placeholder extraction, identifier renaming, escaping and every line-break idiom on real catalog wording, including the 95 entries with placeholders and the 85 that span several lines.

Compiled and executed languages. Eight of the eighteen languages were checked by building and running the generated code for the whole catalog, comparing the returned text character by character against the expected message. JavaScript and TypeScript were executed under Node, TypeScript after a strict `tsc` type check. Python was compiled and executed under CPython. C and C++ were compiled with clang under `-Wall -Werror` and executed; the C check calls both the caller-supplied buffer entry point and the allocating one and requires them to agree. Java was compiled and executed under the local JDK, C# under the local .NET SDK, and Rust under `rustc`. Each of those eight reported 572 of 572 matching and zero mismatches.

Positional arguments. A message may name the same placeholder more than once, and three catalog entries do. For the four languages whose format strings are positional, the specifier count and the argument count were compared against the number of placeholder occurrences for every entry: 2,288 renders, none mismatched. The same pass confirmed that every parameter a signature declares is used in the body it belongs to.

Highlighting correctness. The highlighter was run over 1,476 generated snippets covering every language. Stripping its markup and reversing its entity escaping reproduced the original source exactly in every case, and every `span` was balanced. This is the property the editable box depends on: if the highlighted mirror held even one character more or fewer than the textarea above it, the caret would drift.

Interface behaviour. A jsdom harness loaded the real page and the real scripts and confirmed thirty-three behaviours, among them: the tool mark appears on entries but never on counterexamples; the language list holds eighteen entries in alphabetical order from C to TypeScript; opening the panel fills both the editor and the mirror with matching text; changing the language regenerates; typing updates the highlighting; **Restore generated** discards edits while keeping the chosen language; the close button closes the panel; the chosen language persists to the next entry opened; and the constructor's **Generate code** button carries the composed message into the panel.

Browser review. The page was rendered in a local headless Chrome at 1440 and 390 pixels wide, with no page errors and no console errors. The editor and the mirror were measured to agree on font family, size, weight, style, line height, letter spacing, padding, white space, text indent and tab size, to occupy the same position to within half a pixel, and to report identical scroll width and scroll height. Italic comment styling advances by 0.001 pixels per character against upright code, which is rounding rather than drift. The tool mark was measured to sit on the card's meta row without overlapping it.

# QF00 - Version 3 limits

Ten of the eighteen languages are not compiled or executed here, because their toolchains are not present: Dart, Elixir, Erlang, Go, Kotlin, PHP, Racket, Ruby, Scala and Swift are verified by construction, by the shared model that the other eight confirm, and by review against documented language practice, not by running them.

Clipboard permissions still vary by browser, and the legacy fallback cannot be exercised headlessly. The panel was reviewed in Chrome only; Firefox and Safari were not available. Sample arguments are illustrative values chosen to make a snippet runnable, not recommendations about what a caller should say.

# QG00 - Version 4 verification

The counts in QD00 and QE00 describe the catalog as it stood at version 3, when it held all 572 extracted wordings. Version 4 reduced that set to 110 and then added 12 entries the source conversation never covered, so the figures below supersede them: 122 entries.

Catalog integrity. The catalog script and the JSON remain identical, all 122 IDs are unique, all twenty-three categories, all four forms, all four registers and both origins still have members, and no navigation group is left empty. The removed wordings remain in the archival extraction files.

Worked examples. Every one of the 122 entries has a hand-written worked example; the check fails if a single entry is missing one. Each example is plain ASCII, contains no carriage return, has no trailing whitespace on any line, and has no line longer than seventy-four characters, so that the widest comment marker and indentation still leave the generated snippet inside about eighty columns.

Example review. The examples were read line by line against the entry they illustrate. The review found and corrected claims that ran ahead of the evidence, an ambiguity that no value present could actually exhibit, an impossible calendar, a date given the wrong weekday, an arithmetic slip, two pairs of mutually contradictory statements, a suggested workaround that would not have worked, and fourteen examples that explained the writing technique instead of showing a message a product could send. Distinctive particulars that had been reused across unrelated examples were separated.

Generation correctness. Every entry was rendered in all eighteen languages: 2,196 snippets, no renderer failure, no empty output, and an equal count per language.

Compiled and executed languages. The same eight toolchains were re-run over the whole catalog with character-by-character comparison, each reporting 122 of 122 matching and zero mismatches.

Positional arguments. 488 renders across the positional-format languages were checked; none mismatched, and every parameter a signature declares is used in the body it belongs to.

Highlighting correctness. 324 generated snippets were highlighted, stripped and un-escaped, reproducing the original source exactly in every case with every `span` balanced.

Interface behaviour. The jsdom harness now confirms thirty-four behaviours, including the two added here: every catalog entry carries a worked example, and Bespoke is credited in three visible places.

Card layout. The worked example renders on the card as a labelled block, with the editorial note demoted to a collapsed disclosure beneath it. This was confirmed by screenshot at a card width of 588 pixels in a two-column grid.

Scroll containment. Measured rather than assumed. With the panel open and its editor scrolled to its end, further wheel input left the page scroll position unchanged; the page scrolled again once the panel closed. Neither the document element nor the body had its overflow altered, so no scrollbar is hidden at any point.

Site integration. The repository index was re-checked: no missing local `href` target, no `data-index-href` pointing at a folder without an `index.html`, the feed link present, and the feed item count equal to the project item count.

# QH00 - Version 4 limits

The ten languages without a local toolchain are unchanged from QF00 and remain verified by construction rather than by execution.

The worked examples are invented situations. Their particulars - reference codes, file paths, timestamps, addresses - are plausible fabrications chosen to show what a complete message looks like, and describe no real system. Example lines are checked mechanically for width and character set only; their factual coherence rests on review, not on a test.

# QI00 - Version 5 verification

The counts in QG00 describe the catalog at version 4, when it held 122 entries. Version 5 added 104 complete passages, so the figures below supersede them: 226 entries.

Uniqueness review. The 108 supplied passages were compared with each other and with the whole published catalog. Lexical comparison was inconclusive by design: the closest new pair shared 0.150 of its content words and the closest new-to-existing pair 0.191, with no pair above 0.30, because these messages describe unlike occasions in a shared courteous vocabulary. The review was therefore conducted by occasion and by lesson. Four passages were excluded because another entry already taught the same lesson: `EJ00`, a replacement service carrying traffic, against `CT00`, a verified deployment; `FF00`, using a compressed image, against `DS00`, an image optimisation; `FE00`, accepting editorial changes, against `GE00`, a machine-drafted revision offered for approval; and `GK00`, a format retirement, against the published `ext002` deprecation notice. Families sharing only a subject were kept whole. 104 passages were integrated.

Transcription fidelity. The supplied text was transcribed verbatim into three source files and the transcription verified by reparsing: 108 entries, 36 Success, 36 Confirmation and 36 Information, 100 of four paragraphs and 8 of three, every passage identical to its source, every character within printable ASCII, no stray angle bracket, 59 distinct blanks across 57 entries, passages between 409 and 610 characters and no paragraph longer than 233 characters.

Mark integrity. A passage is stored exactly as written, and every other reading of it is derived by `passage.js`. For all 104: the runs concatenate exactly to the plain reading, no run carries a mark character, every paragraph break survives, the plain reading contains no `**` or backtick and still carries its blanks in angle brackets, every blank has a sample value, and the filled reading leaves no blank behind.

Catalog integrity. The catalog script and the JSON remain identical, all 226 IDs are unique, every category, form, register and origin still has members, and no navigation group is left empty.

Worked examples. Every one of the 226 entries either carries a hand-written worked example or is itself a passage; the check fails if an entry is neither.

Generation correctness. Every entry was rendered in all eighteen languages: 4,068 snippets, no renderer failure, no empty output, and an equal count per language.

Compiled and executed languages. The same eight toolchains were re-run over the whole catalog with character-by-character comparison, each reporting 226 of 226 matching and zero mismatches. The paragraph breaks inside a passage survive that round trip, which is the point of the check: a blank line in a message is a blank line in the returned string.

Positional arguments. 904 renders across the positional-format languages were checked; none mismatched, and every parameter a signature declares is used in the body it belongs to.

Highlighting correctness. 594 generated snippets were highlighted, stripped and un-escaped, reproducing the original source exactly in every case with every `span` balanced.

Wrapping fidelity. A paragraph is one line of the message and must remain one, so generated literals can exceed two hundred characters. The editor and its highlighted mirror now wrap rather than scroll sideways, and the two layers were measured to agree: across seventy-two renders of the worst cases in all eighteen languages, both reported identical heights and no render required horizontal scrolling.

Interface behaviour. The headless harness now confirms forty-eight behaviours, fourteen of them about passages: that the entries are present and hydrated, that the marks survive storage, that a passage card sets its paragraphs as paragraphs, marks its control labels and literals, shows no separate worked example, offers a sample reading where it has blanks, and keeps its tool button.

Card layout. Confirmed by screenshot at 1440 pixels in the two-column grid. A passage card leads with its occasion, sets the opening line in the serif voice used elsewhere and the remaining paragraphs at reading size, and closes with the same actions as every other card.

Site integration. The repository index was re-checked: no missing local `href` target, no `data-index-href` pointing at a folder without an `index.html`, the feed link present, and the feed item count equal to the project item count.

# QJ00 - Version 5 limits

The ten languages without a local toolchain are unchanged from QF00 and remain verified by construction rather than by execution.

The passages were published without any change to their wording, line breaks or layout, which was the condition under which they were accepted. Their particulars - reference codes, file names, quantities, timestamps - are fabrications belonging to the messages, and describe no real system. The sample values offered for their blanks share one imagined afternoon so that a reader moving between entries is not asked to believe in several presents at once; they are illustrations, not recommendations.

The uniqueness review rests on reading rather than on a metric. The lexical comparison is recorded above because it was performed and found nothing, not because it decided anything. Another editor might keep one of the four excluded passages or remove a fifth.

Generated source lines for a passage are long, because folding a paragraph would put a line break into the message. The code is valid and compiles unchanged in every toolchain available here, and the panel wraps it for reading, but a reader who pastes it into an editor configured for eighty columns will see it wrapped there too.

# QK00 - Version 6 verification

Card layout. The catalogue grid was measured in a local headless Chrome at nine widths - 1920, 1600, 1440, 1280, 1100, 1024, 900, 768 and 390 pixels - and the computed track count read directly from the grid container. Two columns appear at 1100 pixels and above, one at 1050 and below, and three at no width. The three-column rule that formerly applied above 1450 pixels was removed rather than overridden. Cards no longer stretch to the height of their tallest neighbour, so each occupies only the sheet its contents require.

Specimen fidelity. Every rendered example was compared character by character against the stored entry and matched exactly. This is the check that matters most, because 117 of the 122 examples contain deliberate leading spaces that align a small table, and any indentation introduced by the markup would be indistinguishable from them on the page. A newline is emitted immediately after the opening tag precisely because the parser discards one, so the stored text begins where it is meant to whatever its first character happens to be. No specimen required an internal scrollbar at any width tested, including the longest in the collection at thirty-seven lines, and none scrolled horizontally.

Read-only behaviour. This was driven by real input rather than inferred. With the caret placed by a pointer click, the arrow keys moved it by character and by line, Home returned it to the start, Shift extended a selection, Control and Shift extended it by word, and the platform's Select All selected the field's whole contents and nothing beyond them. Typing, Backspace, Delete, Enter, cut and paste were then attempted with the entire text selected; a paste event, a cut event, an insert command, a delete command, a dropped payload, a composed character from an input method, undo, and a direct assignment to the field were attempted in turn. The specimen was unchanged after every one of them, and the field kept its focus throughout.

Copy controls. Each control was confirmed to copy exactly the text beside it: the phrase control the entry's wording, the example control the contents of its own field. The pressed control marked itself and the other did not; the button's measured width and height were identical before and after, so nothing on the page moved; focus stayed on the control; the mark returned to rest; and the success was announced through a silent live region rather than by moving focus. With the clipboard made to reject and the fallback made to fail, no success mark appeared, nothing was announced, and the page's ordinary error notice was shown instead. The hit target was confirmed to extend beyond the visible mark, both controls are reachable by ordinary focus navigation, and a focused control draws a visible ring.

Interface behaviour. The headless harness now confirms seventy-nine behaviours. The generated code panel, the code generator, composing from a card and the catalogue's extent were re-checked after these changes and are undisturbed. The code generation suite was re-run in full: 4,068 snippets with no failures, 226 of 226 under the Python comparison, 904 positional renders, 594 highlighted snippets with no drift, and the editor and its mirror still identical in height across seventy-two worst-case renders after the shared monospace stack was changed.

# QL00 - Version 6 limits

A plain eadonly text field was the first choice and was rejected on evidence. Measured directly in Chrome, a readonly textarea accepts focus and Select All but will not move the caret, will not respond to Home, and will not extend a selection; a read-write field in the same page did all three. Since the commission requires the complete native repertoire, the specimen is an ordinary text field whose every attempted modification is refused by a single rule at the input level, with a restoring backstop for anything that rule cannot cancel, and `aria-readonly` reporting its nature. This is a departure from the preferred arrangement, made for a stated reason.

All interface measurements above were taken in one local headless Chrome. Other browsers were not tested. Touch input, screen readers and input-method editors were not exercised; the arrangements made for them - the touch hit target, the accessible names, the live region, `aria-readonly`, and the suppression of the on-screen keyboard - are reasoned rather than observed. The claim that a single input-level refusal is more durable across keyboards, layouts and input methods than a list of individual keystrokes rests on the specification rather than on measurement here.

The document still overflows its viewport horizontally at 390 pixels by twenty-eight pixels. This was present before these changes and is caused by the category strip and filter labels, not by any card; no card or specimen exceeds the viewport at that width. It was left alone as outside this commission.