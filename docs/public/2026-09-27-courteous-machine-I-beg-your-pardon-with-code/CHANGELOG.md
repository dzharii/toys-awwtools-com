# CHG03 - Version 5

Added 104 complete passages, taking the catalog from 122 entries to 226. A passage is a larger form than anything the collection held before: three or four paragraphs that open in a chosen register, state the particulars, name one limit plainly, and close with an instruction referring to controls by name. 108 were supplied; four were set aside because another entry already taught the same lesson, and the rest were published word for word.

Kept the wording untouched and changed the code instead. A passage is stored exactly as written, marks and all: `**Download export**` for a control the reader is asked to select, backticks for a literal value, angle brackets for a blank the sending program will fill. A new file, `passage.js`, is the single place that knows how to read those marks. The card, the search index, the sample reading and the code generator all ask it rather than keeping an opinion of their own, so the stored wording and the displayed wording cannot drift apart.

Gave the passage its own card. The opening line keeps the serif voice used for phrases; the paragraphs that follow step down to reading size. Control labels are set in the interface's own voice and literals as code, so a reader can see at a glance which words the message expects to appear on a button. A passage needs no separate **Example in use** block, being already a complete message; where it contains blanks, a collapsed disclosure offers it filled with sample values that share a single imagined afternoon.

Added **Passages** to the form filter, and taught the generated header comment not to repeat itself: for a passage the function body is already the worked example, so the header says what its shape is instead of printing the message twice.

Made the code panel wrap. A paragraph is one line of the message and must stay one, so a generated literal can run past two hundred characters. The editor and its highlighted mirror now wrap together rather than scroll sideways; they were measured across seventy-two renders in all eighteen languages and reported identical heights every time.

Re-ran the whole verification suite at the new size: 4,068 snippets rendered without failure, eight toolchains each reporting 226 of 226 matching, 904 positional renders, 594 highlighted snippets, and forty-eight interface checks.

# CHG02 - Version 4

Reduced the catalog from 572 entries to 110. Every entry was judged against every other for what it alone contributed, and what went was repetition rather than substance: twenty ways of saying that nothing had been changed became four, ten interruption openers became two, and bare vocabulary fragments went entirely. All twenty-three categories, all four forms, all four registers and both origins survive. The removed wordings remain in the archival extraction files.

Added twelve entries for kinds of message the source conversation never contained: work still in progress, a deprecation notice, payment details about to expire, a retention deletion announced in advance, an unrecognised sign-in, an available update that does not insist, an undo window, a finished background job, escalation to a person, an inactivity sign-out, a temporary lock after repeated attempts, and a request the service cannot perform. The catalog now holds 122 entries.

Gave every entry a hand-written worked example: the same wording as a complete message, with concrete particulars, that a real product could send unaltered. The card now leads with that example under an **Example in use** heading, and the editorial note, which used to sit in the open, is demoted to a collapsed **Ready to adapt** disclosure beneath it. A counterexample shows the courteous form instead, so discouraged wording is never the last word.

Replaced the generated header comment. It used to restate the entry's metadata, which the reader could already see. It now carries the worked example, wrapped and commented in each language's own style, so the generated function arrives with a demonstration of what it is for rather than a description of itself.

Contained scrolling in the code panel. Reaching the end of the code and continuing to scroll no longer moves the page beneath. No scrollbar is hidden to achieve this; the page simply does not receive wheel or touch input while the panel is open, and resumes normally when it closes.

The examples were reviewed entry by entry before release, and the faults that review found - claims running ahead of the evidence, an impossible calendar, a date on the wrong weekday, an arithmetic slip, contradictory particulars, and examples that explained the writing instead of demonstrating it - were corrected.

The generator, the eighteen languages, the highlighting, the constructor and the existing layout are unchanged, apart from the masthead, which now reads V4.
# CHG01 - Version 3

Added code generation. Every entry that is not a counterexample now carries a small tool mark, and the message constructor carries a **Generate code** button. Both open one panel that writes the chosen message as a small, self-contained function in one of eighteen languages: C, C#, C++, Dart, Elixir, Erlang, Go, Java, JavaScript, Kotlin, PHP, Python, Racket, Ruby, Rust, Scala, Swift and TypeScript, listed alphabetically.

The generated function composes message text and returns it, and does nothing else. Raising, logging or displaying the result is left to the calling program, because a template cannot know whether an operation truly failed. Placeholders become parameters, renamed to each language's convention, and line breaks follow each language's ordinary practice rather than one imposed style. Characters that would be read as formatting directives are escaped for every target. C receives both a caller-supplied-buffer function and an allocating one, since allocating inside a message helper is often unwelcome there.

The code box is editable and highlighted at once: a transparent textarea laid exactly over a highlighted copy of the same text. Highlighting uses a modified copy of microlight 0.0.7 by asvd, vendored by hand because this project has no build step and used under the MIT licence. The unmodified upstream file is kept beside it for comparison.

Credited the inspiration for this collection, [Bespoke: A Programming Language for People Who Say Please](https://blog.hofstede.it/bespoke-a-programming-language-for-people-who-say-please/), in three visible places: the index colophon, a new L00 panel in the writing desk, and the footer.

The catalog, the wording, the existing layout and the existing controls are unchanged, apart from the masthead, which now reads V3. The three new scripts load after the existing ones, and the page continues to work with no network connection and no build step.

# CHG00 - Version 2

Added all forty complete examples from chat sections BA00-CN00, including the twenty explicitly Bespoke-style passages. The catalog now contains 572 distinct entries, including 108 authored additions. Existing IDs and entries are preserved. The new records carry source codes, titles, registers, categories and contextual usage notes; a version-2 origin filter makes them easy to find.

Added the generated 1200 x 630 JPEG social preview, matching Open Graph and X/Twitter metadata, and courteous page descriptions. Added SVG, PNG, ICO and touch-icon assets with explicit HTML configuration. Preserved the local-only architecture and documented the absolute URLs needed before public social sharing.

The original release archive is retained separately. No site was published.
