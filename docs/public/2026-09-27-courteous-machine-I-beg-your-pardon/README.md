# R01 - The Courteous Machine

An illustrated, offline reference of courteous software messages. The collection contains 572 distinct entries: 464 from the visible supplied draft and 108 new additions. Version 2 adds all forty examples from follow-up chat sections BA00-CN00. Entries include phrases, complete examples, writing patterns, vocabulary and retained counterexamples.

# S00 - Open the reference

Extract the entire ZIP, then open `index.html` in a modern desktop browser. Keep its sibling files and folders together. No server, installation, build step, account, API key or internet connection is required. Opening HTML while it is still inside an archive viewer may prevent adjacent files from loading.

The page uses classic `<script src="...">` tags, a local stylesheet, local images and system fonts. It does not fetch the catalog over the network, use modules, call an API or send data anywhere. The constructor does not save drafts across reloads; copy or download anything you want to keep.

# T01 - Find and adapt wording

Use the category index to browse by purpose. Search matches message text, original wording, editorial notes, situations and source section codes. Press `/` to focus search and Escape to clear it while the search field is focused.

Filter by form, register, origin and editorial status. Select "Added in version 2" under Origin to view the forty newly merged chat examples. The default view includes recommended and context-dependent wording. Counterexamples are retained but hidden until you select that form or include them in the editorial filter. "Ready to adapt" still means that the described facts must be true.

"Copy wording" copies the displayed phrase. "Compose with this" transfers the displayed wording into the constructor, preserving its text and showing any usage condition. More entries are revealed in groups of 30. "Print this selection" expands the entire filtered result before opening the browser print dialog.

# U00 - Compose a message

Choose a built-in situation and register, or load an entry from the phrasebook. Edit the courtesy, message body, known state, next step and reference. State and next step have independent inclusion controls.

Placeholders such as `<item>`, `<reason>` and `<status_location>` generate editable value fields. Placeholder names may include letters, numbers, spaces, underscores, periods and hyphens. Repeated instances of one placeholder receive the same value. Empty fields leave their placeholder visible; fill them or deliberately revise the message before use.

The preview updates as you type. Loaded library wording is not rewritten by the register selector. Built-in success messages retain a positive opening. No style selector automatically asserts that data is safe or that a consequential operation may be retried.

Copy the completed message or download a plain text file. If clipboard access is unavailable for local files, a legacy copy fallback is attempted. If that is blocked too, select the preview and copy manually. Reset clears the selected scenario and entered values.

# V01 - Editorial scope and provenance

The source conversation begins mid-example and says earlier content was omitted. This edition covers the visible material only. The coverage review accounts for 204 fenced example blocks across 52 supplied sections, plus the incomplete opening fragment and table entries. It does not reconstruct unseen conversation.

Exact repeats are combined after whitespace normalization; distinct variants and complete examples remain separate. Every catalog entry retains its source section, original text and original extraction identifiers. Display punctuation uses ASCII alternatives. Original source punctuation remains in the archival files.

Four supplied examples receive explicit technical revisions: connection refusal is described without assuming the intended host was reached, non-submission is scoped to the failed connection, uncertain completion remains uncertain, and internal-error retry advice calls for status verification. A new example uses separate ready/review count placeholders. Revised entries expose their original wording.

Theatrical apology remains available, including the exaggerated forgiveness family. It is contextual rather than categorically rejected. Sweeping assurances, figurative retirement, unsupported compliments and outcome-dependent remedies carry conditions. Brief engineering terms are retained as vocabulary; they are not presented as complete polite diagnostics.

`content/editorial-review.md` reports the original 535 extraction records before cross-section deduplication and the final 18 additions. The forty follow-up examples are preserved in `content/chat-additions-v2.md` and `.json`, with additional context notes attached to the catalog records. The final catalog is authoritative for displayed wording and final status. `content/coverage-review.md` reports source coverage independently of editorial selection.

# W01 - Files

| File or folder | Purpose |
| --- | --- |
| `index.html` | Single-page reference, constructor container and writing guide |
| `styles.css` | Responsive letterpress-inspired layout and print styling |
| `app.js` | Search, filters, navigation, pagination, copying and printing |
| `constructor.js` | Offline message composer and placeholder substitution |
| `content.js` | Classic-script copy of the structured catalog |
| `assets/correspondence-plate.png` | Four generated engraving-style vignettes, used as CSS quadrants |
| `content/catalog.json` | Complete final catalog with provenance and editorial status |
| `content/raw-source.md` | Visible supplied draft in reading order |
| `content/extract-*.json` | Original extraction records before cross-section deduplication |
| `content/additions*` | Newly authored examples and prerequisites |
| `content/editorial-review.*` | Editorial decisions and conditions from the review |
| `content/coverage-review.md` | Independent extraction completeness audit |
| `design/mockup-*.png` | Three generated visual reference directions |
| `design/prompts.txt` | Image generation prompts; built-in generation was used |
| `assets/social-preview.jpg` | Generated 1200 x 630 JPEG social preview |
| `assets/favicon.*`, `assets/favicon-32.png`, `assets/apple-touch-icon.png` | Configured vector, ICO, PNG and touch icons |
| `content/chat-additions-v2.*` | Forty follow-up examples with preserved section codes |
| `CHANGELOG.md` | Version 2 changes |
| `VALIDATION.md` | Checks performed and remaining verification limits |

# X00 - Design and maintenance

The selected direction is the ivory-and-coral correspondence desk: serif specimens, a narrow index, restrained red rubric, and engraved mechanical clerks. The other two references explore an oxblood book-cover treatment and a blue editorial index. They are concept images rather than screenshots of the finished page.

All production assets are local. To edit the collection, update `content/catalog.json`, then regenerate `content.js` with the same array assigned to `window.COURTESY_CATALOG`. A one-line Node command from this folder is:

```sh
node -e "const fs=require('fs');fs.writeFileSync('content.js','window.COURTESY_CATALOG = '+fs.readFileSync('content/catalog.json','utf8')+';\n')"
```

No build tool is otherwise needed. Keep entry IDs unique and preserve `originalText`, `originalIds` and `sources` when revising source-derived messages.

# Y00 - Verification limits

JavaScript syntax checks and DOM-based interaction tests pass. They cover search, filters, pagination, empty states, category selection, constructor transfer, tone behavior, placeholder substitution, reset, optional state, and text-only handling of markup-like input. Local dependencies, source coverage and archive contents were checked separately.

A real browser visual review could not be completed in this environment: the cloud browser blocks `file:` URLs, and a local browser executable was unavailable. Responsive and print rules are implemented but have not been visually verified in a browser. Clipboard permissions and download behavior can vary by browser; manual copying remains available.

# Z00 - Social previews and icons

`assets/social-preview.jpg` is a genuine RGB JPEG at 1200 x 630, generated in the same ivory-and-coral engraved style as the reference. The HTML includes the page description, Open Graph title/description/image/type/dimensions/alt text, X/Twitter large-image card title/description/image/alt text, and theme colour. All descriptions follow the courteous phrasebook voice. Generation details are in `design/social-preview-prompt.txt`.

The offline package uses relative image paths because no public site URL has been supplied. Social networks cannot fetch a page opened from a local ZIP or file path. Before sharing a hosted copy, replace `og:image` and `twitter:image` with the actual absolute HTTPS URL of `assets/social-preview.jpg`, then add `og:url` and a canonical link for the actual public page URL. No public URL or account has been invented, and this release does not publish the site.

The favicon is configured through a scalable SVG, a 32-pixel PNG and a multi-size ICO. A 180-pixel touch icon is also linked. These assets are local and work without a network connection.
