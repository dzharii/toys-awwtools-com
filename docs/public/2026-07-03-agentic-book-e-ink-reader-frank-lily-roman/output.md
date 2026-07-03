# MDTREE (`output.md`)


- $Path = `.`
- $FilterPath = ``
- $FilterName = ``
- $Include = ``
- $ExcludeDirs = ``
- $ExcludeFiles = ``
- $MaxFileSizeKB = `1024`
- $Output = `output.md`


Generated on `2026-07-03 10:37:22`

[TOC]

## File content `AGENTS.md`:

# AGENTS.md

---

A00 Project Mission

---

Build a static, local-first E Ink-style reader for local TXT and Markdown files.

The runtime app must be plain HTML, CSS, JavaScript, and local assets. It must not require npm, a framework, a build step, a server, a database, account login, cloud storage, remote fonts, remote scripts, analytics, or runtime network access.

The app must let a user open one local `.txt`, `.md`, or `.markdown` file through file picker or drag-and-drop. The app must render the file as a calm E Ink-like reading surface with page mode, scroll mode, local fonts, local settings, safe Markdown handling, clear errors, responsive layouts, keyboard and touch input, and a realistic visual refresh effect.

Book contents must not be persisted. User preferences may be persisted. The user must reopen the book file each session.

Work autonomously. Use best judgment. Research when needed. Make decisions. Validate those decisions. Refactor when the result is not clean enough. Do not wait for user approval when the specifications provide enough direction.

---

B00 Source Documents

---

Read these files before implementation begins:

```text
specs/eink-reader-design-note.md
specs/frank-usage-scenario.md
specs/lily-usage-scenario.md
specs/roman-usage-scenario.md
```

These files are the project authority.

The design note defines the required product, constraints, architecture, quality bar, dependency policy, security policy, rendering behavior, visual simulation, testing expectations, and acceptance criteria.

The Frank scenario defines the demanding daily-reader perspective. Frank tests whether the app is good enough for serious long-form reading, typography, privacy, page mode, scroll mode, visual quality, and complete feature coverage.

The Lily scenario defines the occasional-reader perspective. Lily tests smoothness, clarity, calm recovery, nontechnical error messages, obvious controls, minimal confusion, and whether the app works without requiring software expertise.

The Roman scenario defines the experienced software engineer perspective. Roman tests technical Markdown, code blocks, mobile note review, local/offline integrity, inspectable behavior, diagnostics, safe Markdown, reliable settings, and engineering quality.

The agent may read all files at the beginning to build full context. Implementation must still proceed in the sequence defined below.

---

C00 Required Implementation Sequence

---

Implement the project in four passes.

Pass 1 is the design note pass.

Read:

```text
specs/eink-reader-design-note.md
```

Create:

```text
specs/eink-reader-design-note_todo.md
```

The todo file must contain a complete acceptance checklist extracted from the design note. The checklist must be specific enough to drive implementation. It must include product behavior, runtime constraints, dependency vendoring, font vendoring, file loading, TXT parsing, Markdown parsing, security, storage, rendering, page mode, scroll mode, E Ink simulation, settings, accessibility, responsive behavior, logging, error handling, testing, and documentation.

Validate the todo file before implementing. Check whether any requirement from the design note was missed. Add missing items before coding.

Implement the app against this todo list. After implementation, review the todo list item by item. Mark completed items only when they have been implemented and validated. If implementation reveals that a todo item was incomplete or ambiguous, revise the todo item using best judgment, then satisfy the revised item.

Run tests. Inspect the app manually. Refactor. Do not move to the Frank pass until the design note todo is complete or any remaining limitation is explicitly documented with a reason.

Pass 2 is the Frank pass.

Read:

```text
specs/frank-usage-scenario.md
```

Create:

```text
specs/frank-usage-scenario_todo.md
```

Extract Frank-specific acceptance requirements. Focus on serious reading quality, long-form comfort, typography, page and scroll behavior, privacy, full feature coverage, realistic E Ink behavior, desktop/tablet/mobile reading, strong defaults, and recovery from mistakes.

Validate the Frank todo list against the already implemented app. Some items may already be satisfied by the design note pass. Keep them in the todo list and mark them only after validation.

Use Frank's perspective while reviewing the app. Ask whether the software would satisfy a demanding reader who can leave for a better tool. If something was implemented technically but feels weak, generic, visually poor, or inconvenient for real reading, fix it.

If Frank's requirements reveal that an earlier design decision was wrong, go back and change the implementation. Then rerun relevant tests. Refactor after fixes.

Pass 3 is the Lily pass.

Read:

```text
specs/lily-usage-scenario.md
```

Create:

```text
specs/lily-usage-scenario_todo.md
```

Extract Lily-specific acceptance requirements. Focus on smoothness, obvious first use, nontechnical UI copy, calm errors, easy recovery, mobile simplicity, minimal configuration burden, understandable settings, and no confusing intermediate states.

Validate the Lily todo list against the current app. Use Lily's perspective while reviewing. Ask whether an occasional user with less software troubleshooting experience can open a file, read, adjust basics, recover from mistakes, and leave without confusion.

If a feature that worked for Frank feels too technical, too dense, too noisy, or too confusing for Lily, revise the UI while preserving Frank's power-user needs. Prefer progressive disclosure. Keep main paths simple and move technical details into diagnostics or advanced sections.

If Lily's requirements contradict an earlier implementation detail, do not ignore the conflict. Re-evaluate the design. Use best judgment to satisfy both perspectives when possible. If impossible, prioritize the core product constraints, safety, privacy, and reading usability.

Run tests. Add or update tests for Lily-specific error messages and smooth recovery paths. Refactor.

Pass 4 is the Roman pass.

Read:

```text
specs/roman-usage-scenario.md
```

Create:

```text
specs/roman-usage-scenario_todo.md
```

Extract Roman-specific acceptance requirements. Focus on technical Markdown, code-heavy notes, mobile review, links, code block containment, diagnostics, local/offline runtime, inspectable implementation, safe Markdown, preference persistence without content persistence, and engineering quality.

Validate the Roman todo list against the current app. Use Roman's perspective while reviewing. Ask whether an experienced software engineer would trust the app as a serious local reader for code notes and technical documentation.

If Lily-driven simplification removed useful technical detail, restore it through advanced diagnostics or clear optional controls without making the main experience confusing. If Frank-driven visual choices harm code readability, adjust typography, contrast, code block styling, or theme behavior.

Run tests with code-heavy Markdown fixtures. Inspect mobile rendering. Confirm no book or note content is persisted. Confirm no external network requests occur at runtime. Refactor.

---

D00 Todo File Requirements

---

Each generated todo file must be written as Markdown.

Each todo file must start with the source document path and the pass name.

Each todo file must include acceptance items that can be checked manually or by tests.

Each todo item must be concrete. Avoid vague items like "make UI good." Replace them with verifiable items like "default reader uses local Literata, off-white paper background, constrained line width, and readable line height."

Each todo file must include a validation section.

Each todo file must include a risk section for requirements that are easy to miss.

Each todo file must include a final review section.

Suggested todo structure:

```md
# specs/eink-reader-design-note_todo.md

Source: specs/eink-reader-design-note.md
Pass: Design Note

---

A00 Acceptance Checklist

- [ ] Runtime app is static HTML, CSS, JavaScript, and local assets.
- [ ] No npm, framework, bundler, server, or build step is required for runtime.
- [ ] Runtime makes no external network requests.
- [ ] TXT files can be opened through file picker.
- [ ] TXT files can be opened through drag-and-drop.

---

B00 Validation Checklist

- [ ] App was opened locally.
- [ ] Browser console was checked.
- [ ] Runtime network requests were checked.
- [ ] Storage was checked for book content.
- [ ] Desktop viewport was tested.
- [ ] Mobile viewport was tested.

---

C00 Risks And Edge Cases

- [ ] Large files do not freeze the app without feedback.
- [ ] Markdown raw HTML does not render as trusted HTML.
- [ ] Font loading failure falls back safely.

---

D00 Final Review

- [ ] All implemented items were retested after refactoring.
- [ ] Remaining limitations are documented.
```

Do not treat the example as exhaustive. Extract the actual todo items from the source document.

Before coding each pass, inspect the todo file and ask whether it misses any requirement from the source document. Fix the todo file first. Then implement.

After coding each pass, inspect the todo file again. Do not mark an item done just because code exists. Mark it done only when the app behavior was validated.

---

E00 Autonomous Work Standard

---

Work without interactive clarification unless the repository is missing the specification files entirely or a requirement is impossible under the hard constraints.

Use best judgment often. The specifications intentionally define product direction, constraints, personas, and quality criteria without micromanaging every implementation detail.

When there are multiple viable approaches, compare them briefly, choose one, implement it, validate it, and revise if the result is poor.

When the app behavior satisfies one persona but harms another, reconcile the conflict through design. Use progressive disclosure, safer defaults, advanced diagnostics, responsive layout differences, and settings where appropriate.

Do not stop after the first working version. After each pass, refactor the code. Remove duplication. Improve names. Simplify state flow. Strengthen error handling. Add tests for the behavior that was just added or repaired.

The agent must repeatedly use this loop:

```text
Read.
Extract requirements.
Create todo.
Validate todo completeness.
Plan implementation.
Implement.
Test.
Inspect visually.
Compare against persona.
Fix.
Refactor.
Update todo.
Move to next pass.
```

---

F00 Product Quality Priorities

---

Prioritize reading quality.

The app exists to make local TXT and Markdown files feel better to read. Typography, layout, page width, line height, paper tone, code block readability, and visual calm are not optional polish.

Prioritize safety.

Markdown input is untrusted. Raw HTML must not execute. External resources from Markdown must not load automatically. Book contents must not persist.

Prioritize offline integrity.

Every runtime dependency and font must be local and documented. Runtime must not depend on CDN access.

Prioritize recoverability.

Errors must be understandable and actionable. The app must never leave the user behind a stuck overlay, endless spinner, blank page, or raw stack trace.

Prioritize inspectability.

The code should be readable. Dependencies should be readable and unminified. Vendored assets should have license records. Logs should help diagnose failures without leaking book content.

Prioritize responsiveness.

Desktop, tablet, and mobile must be tested. Page mode and scroll mode must both feel intentional.

---

G00 Hard Constraints

---

Do not use npm for runtime.

Do not require `node_modules`.

Do not introduce a framework.

Do not require a bundler.

Do not require a server for runtime.

Do not load runtime scripts from a CDN.

Do not load runtime fonts from a CDN.

Do not use minified-only vendored dependency files.

Do not use source maps as a substitute for readable dependency source.

Do not store book contents.

Do not render raw Markdown HTML as trusted HTML.

Do not automatically load remote images from Markdown.

Do not send telemetry.

Do not add analytics.

Do not convert the app into a note manager, editor, sync system, cloud library, or multi-file document database.

Optional developer scripts may use Bun, Bash, or PowerShell. Optional tests may use Playwright. These tools must not become runtime requirements.

---

H00 Expected Project Files

---

The repository should contain the static app, local assets, vendored dependencies, scripts, tests, and specs.

Expected high-level structure:

```text
AGENTS.md
index.html
README.md
LICENSES.md

assets/
css/
js/
vendor/
scripts/
tests/
specs/
```

Expected specs:

```text
specs/eink-reader-design-note.md
specs/frank-usage-scenario.md
specs/lily-usage-scenario.md
specs/roman-usage-scenario.md
```

Expected generated todo files:

```text
specs/eink-reader-design-note_todo.md
specs/frank-usage-scenario_todo.md
specs/lily-usage-scenario_todo.md
specs/roman-usage-scenario_todo.md
```

The exact app module names may vary if there is a good reason, but the repository must remain simple, static, and inspectable.

---

I00 Dependency And Font Handling

---

Vendor all runtime dependencies.

Vendor all runtime fonts.

Use readable, unminified dependency sources.

Include license files or license notes for every vendored dependency and font.

Track vendored sources in a manifest.

Optional vendor scripts may download missing files from documented upstream locations. If a file already exists, the script should skip it by default and report it. Do not overwrite vendored files silently.

At runtime, the app must use only local vendored files.

The default reading font must be local Literata.

Other font choices must also be local.

If a selected font is missing, fall back safely and show a calm message.

---

J00 Testing Expectations

---

Create test fixtures for TXT, Markdown, code-heavy Markdown, unsafe Markdown, Unicode, long files, empty files, and unsupported files.

Use Playwright if available. If Playwright is not available, document the limitation and still perform manual browser validation.

Test desktop, tablet, and mobile viewports.

Test page mode and scroll mode.

Test file picker and drag-and-drop where practical.

Test Markdown safety.

Test storage to confirm book content is not persisted.

Test offline runtime behavior.

Test reduced motion.

Test settings persistence.

Test error recovery.

Test code block behavior on mobile.

Test missing dependency and missing font behavior if practical.

Manual visual inspection is required. Automated tests cannot decide whether the E Ink simulation feels credible or whether the reading surface is comfortable.

---

K00 Persona Review Rules

---

During the Frank pass, review the app as a serious reader. Ask whether the app is good enough for long reading sessions and whether the E Ink visual experience feels intentional.

During the Lily pass, review the app as an occasional user who dislikes confusion. Ask whether every message is clear, every mistake is recoverable, and the app can be used without technical knowledge.

During the Roman pass, review the app as an experienced software engineer reading code-heavy Markdown notes on mobile and desktop. Ask whether code blocks, links, diagnostics, offline behavior, local assets, and privacy behavior are technically trustworthy.

If a later persona reveals a flaw in an earlier implementation, go back and fix it. Do not preserve a poor decision merely because it came from an earlier pass.

If the personas pull in different directions, use this resolution order:

```text
1. Hard constraints and safety.
2. Privacy and no content persistence.
3. Reading usability.
4. Accessibility and recoverability.
5. Offline/static runtime integrity.
6. Persona-specific comfort.
7. Visual polish.
```

When possible, satisfy multiple personas by using defaults, settings, responsive behavior, and advanced panels.

---

L00 Final Completion Gate

---

The project is not complete until all four todo files exist, all four passes have been implemented and validated, and the final app satisfies the design note plus Frank, Lily, and Roman usage scenarios.

Before finalizing, perform a final review:

```text
Read all four todo files.
Confirm completed items were actually validated.
Run available automated tests.
Perform manual desktop inspection.
Perform manual mobile inspection.
Check browser console.
Check runtime network requests.
Check persistent storage.
Check vendored dependency files.
Check font loading.
Check Markdown safety.
Check page mode.
Check scroll mode.
Check E Ink transitions.
Check reduced motion.
Check error messages.
Refactor any code that is fragile or hard to troubleshoot.
Update README and license notes if needed.
```

If any item remains incomplete, either fix it or document the limitation with a precise reason. Do not hide known gaps.

The final result should be a coherent static E Ink-style reader that can satisfy Frank's seriousness, Lily's need for smooth clarity, and Roman's engineering standards.

---

M00 Social Preview And Update Feed

---

The project ships social preview metadata and a static RSS update feed.

The social preview must make a concise, honest promise: this is a local TXT and Markdown reader with an E Ink-like reading surface, local fonts, page and scroll modes, and no uploads.

All social metadata must be static in the HTML head, not injected by JavaScript. Social crawlers may not run JavaScript, so title, description, canonical URL, RSS discovery link, Open Graph tags, and X/Twitter card tags must appear in the initial HTML of `index.html`.

Canonical product strings (keep in sync with the head, feed, README, and repo index):

```text
Title:       E Ink Reader - Local TXT and Markdown Reading
Description: Read local TXT and Markdown files in a calm E Ink-style browser reader with page mode, scroll mode, local fonts, and no uploads.
```

The social image is a local project asset:

```text
assets/social/social_logo_1200x630.jpg   (1200 x 630, JPG)
```

The image must be `1200 x 630`, PNG or JPG (never SVG for social compatibility). If the image is replaced, update `og:image:type`, `og:image:width`, and `og:image:height` to match the real file.

Deployed base URL for absolute tags (do not use `https://example.com/` placeholders):

```text
https://toys.awwtools.com/public/2026-07-03-agentic-book-e-ink-reader-frank-lily-roman/
```

If the app is not yet deployed at a URL, keep placeholders clearly marked and do not invent a production URL.

---

N00 Required HTML Head Metadata

---

`index.html` head must contain primary metadata (title, description, canonical), RSS discovery, Open Graph tags (type, site_name, title, description, url, image, image:secure_url, image:type, image:width, image:height, image:alt, locale), and X/Twitter card tags (card=summary_large_image, title, description, image, image:alt). Absolute `og:image`/`twitter:image` URLs must point at the deployed image path above. Validate that the metadata is static, in the head, and matches implemented behavior. If a described feature does not exist, either revise the copy or finish the feature.

---

O00 RSS Update Feed

---

The user-facing update feed lives at `feed.xml` at the project root. It is static RSS 2.0 XML, requires no server and no npm, and is maintained manually (an optional developer script may help).

The head must include discovery:

```html
<link rel="alternate" type="application/rss+xml" title="E Ink Reader Updates"
  href="https://toys.awwtools.com/public/2026-07-03-agentic-book-e-ink-reader-frank-lily-roman/feed.xml">
```

A non-intrusive RSS link is also shown on the open screen (`.rss-link`, pointing at `feed.xml`).

The feed contains high-level, user-oriented updates, not a commit log. Do not list internal refactors unless users benefit (reliability, performance, security, accessibility, privacy, maintainability). Each item should answer: what changed, why it matters to a reader, which workflow improves, any visible behavior change, any compatibility/privacy/safety note.

Poor: `Updated parser and fixed bugs.`
Better: `Markdown rendering is safer and clearer. Raw HTML is escaped or removed before display, code blocks stay contained on mobile, and malformed Markdown can be reopened as plain text.`

---

P00 Feed Item Format

---

Use RSS 2.0. Every `<item>` includes `title`, `link`, `guid` (stable, `isPermaLink="false"`, e.g. `eink-reader-update-0001`), `pubDate` (RFC 822, e.g. `Fri, 03 Jul 2026 00:00:00 -0700`), and `description`. If there is no separate update page, link to the homepage with a fragment (e.g. `#updates-safe-markdown`). The channel needs `title`, `link`, `description`, `language`, and `lastBuildDate`. Keep descriptions plain-text (escape any HTML). Replace placeholder dates/URLs with real project values before release.

---

Q00 RSS Update Workflow For New Features

---

Whenever a change affects users â€” a visible feature, user-facing behavior, file handling, accessibility, privacy, security, visual behavior, or a meaningful user-facing bug fix â€” update `feed.xml` in the same implementation pass. Do not defer feed updates.

```text
1. Decide whether the change affects users.
2. If yes, write a high-level, user-oriented update.
3. Give enough detail that a subscriber understands what improved.
4. Avoid internal implementation noise.
5. Add an <item> with title, link, guid, pubDate, description.
6. Update channel lastBuildDate to the newest item's pubDate.
7. Validate that feed.xml is still well-formed XML.
8. Confirm the HTML head still links to feed.xml.
```

Changes that need a feed item include: TXT/Markdown loading, raw-HTML sanitization, page/scroll modes, font settings, E Ink transition controls, reduced-motion support, mobile code-block handling, preference persistence, storage-privacy fixes, offline-dependency fixes, large-file handling, clearer errors. Changes that usually do not: internal renames, code moves without behavior change, CSS reformatting, test-helper or comment-only edits. If unsure, add the item.

---

R00 RSS Writing Style

---

Write for users, not maintainers. Say what the reader can do now or what works better now.

Prefer: `Markdown notes with code blocks now read better on phones. Long code lines stay inside the code block instead of pushing the whole page sideways.`
Avoid: `Refactored Markdown renderer and adjusted CSS overflow handling.`

Prefer: `Book contents are still not stored. Preferences are remembered, but reopening the app asks you to choose the file again.`
Avoid: `Changed localStorage payload.`

Each update should be useful to Frank (serious reading quality), Lily (clarity and calm recovery), or Roman (technical reliability, code readability, local behavior, diagnostics).

---

S00 Social And RSS Validation Checklist

---

```text
HTML title is concise and descriptive.
Meta description is honest and not too long.
Open Graph title, description, url, and image are present.
Open Graph image width and height match the actual image.
Open Graph image alt text is present.
X/Twitter card uses summary_large_image with title, description, image, image alt.
Social image exists at assets/social/social_logo_1200x630.jpg and is 1200 x 630 PNG/JPG.
HTML head links to feed.xml; feed.xml exists.
feed.xml is well-formed RSS 2.0 XML.
Channel has title, link, description, language, lastBuildDate.
Every item has title, link, guid, pubDate, description.
Item descriptions are user-oriented, not commit-style.
No item claims a feature that is not implemented.
No placeholder production URL remains before release.
```

Fix any failed item before final completion.



## File content `assets\fonts\fonts.css`:

```css
/*
  Local @font-face declarations. All fonts are vendored WOFF2 files.
  No font is loaded from a remote host. See assets/fonts/licenses/ for OFL texts.
  font-display: swap keeps text visible; the reader repaginates after
  document.fonts.ready so final layout uses the real font.
*/

/* Literata (default reading serif) â€” variable */
@font-face {
  font-family: "Literata";
  src: url("./literata/Literata-Variable.woff2") format("woff2");
  font-weight: 200 900;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Literata";
  src: url("./literata/Literata-Italic-Variable.woff2") format("woff2");
  font-weight: 200 900;
  font-style: italic;
  font-display: swap;
}

/* Source Serif 4 â€” variable */
@font-face {
  font-family: "Source Serif 4";
  src: url("./source-serif-4/SourceSerif4-Variable.woff2") format("woff2");
  font-weight: 200 900;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Source Serif 4";
  src: url("./source-serif-4/SourceSerif4-Italic-Variable.woff2") format("woff2");
  font-weight: 200 900;
  font-style: italic;
  font-display: swap;
}

/* Charis SIL â€” static weights */
@font-face {
  font-family: "Charis SIL";
  src: url("./charis-sil/CharisSIL-Regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Charis SIL";
  src: url("./charis-sil/CharisSIL-Italic.woff2") format("woff2");
  font-weight: 400;
  font-style: italic;
  font-display: swap;
}
@font-face {
  font-family: "Charis SIL";
  src: url("./charis-sil/CharisSIL-Bold.woff2") format("woff2");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Charis SIL";
  src: url("./charis-sil/CharisSIL-BoldItalic.woff2") format("woff2");
  font-weight: 700;
  font-style: italic;
  font-display: swap;
}

/* Merriweather â€” static weights */
@font-face {
  font-family: "Merriweather";
  src: url("./merriweather/Merriweather-Regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Merriweather";
  src: url("./merriweather/Merriweather-Italic.woff2") format("woff2");
  font-weight: 400;
  font-style: italic;
  font-display: swap;
}
@font-face {
  font-family: "Merriweather";
  src: url("./merriweather/Merriweather-Bold.woff2") format("woff2");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

/* Atkinson Hyperlegible â€” accessibility-focused, used for UI and as a body option */
@font-face {
  font-family: "Atkinson Hyperlegible";
  src: url("./atkinson-hyperlegible/AtkinsonHyperlegible-Regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Atkinson Hyperlegible";
  src: url("./atkinson-hyperlegible/AtkinsonHyperlegible-Italic.woff2") format("woff2");
  font-weight: 400;
  font-style: italic;
  font-display: swap;
}
@font-face {
  font-family: "Atkinson Hyperlegible";
  src: url("./atkinson-hyperlegible/AtkinsonHyperlegible-Bold.woff2") format("woff2");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Atkinson Hyperlegible";
  src: url("./atkinson-hyperlegible/AtkinsonHyperlegible-BoldItalic.woff2") format("woff2");
  font-weight: 700;
  font-style: italic;
  font-display: swap;
}

```

## File content `assets\fonts\licenses\AtkinsonHyperlegible-OFL.txt`:

```txt
Copyright 2020 Braille Institute of America, Inc. AtkinsonHyperlegible-Italic.ttf: Copyright 2020 Braille Institute of America, Inc. AtkinsonHyperlegible-Bold.ttf: Copyright 2020 Braille Institute of America, Inc. AtkinsonHyperlegible-BoldItalic.ttf: Copyright 2020 Braille Institute of America, Inc.

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
http://scripts.sil.org/OFL


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded,
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.

```

## File content `assets\fonts\licenses\CharisSIL-OFL.txt`:

```txt
Copyright (c) 1997-2022 SIL International CharisSIL-Italic.ttf: Copyright (c) 1997-2022 SIL International CharisSIL-Bold.ttf: Copyright (c) 1997-2022 SIL International CharisSIL-BoldItalic.ttf: Copyright (c) 1997-2022 SIL International

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
http://scripts.sil.org/OFL


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded,
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.

```

## File content `assets\fonts\licenses\Literata-OFL.txt`:

```txt
Copyright 2017 The Literata Project Authors (https://github.com/googlefonts/literata) Literata-Italic[opsz,wght].ttf: Copyright 2017 The Literata Project Authors (https://github.com/googlefonts/literata)

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
http://scripts.sil.org/OFL


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded,
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.

```

## File content `assets\fonts\licenses\Merriweather-OFL.txt`:

```txt
Copyright 2024 The Merriweather Project Authors (https://github.com/EbenSorkin/Merriweather4) with Reserved Font Name "Merriweather". Merriweather-Italic[opsz,wdth,wght].ttf: Copyright 2024 The Merriweather Project Authors (https://github.com/EbenSorkin/Merriweather4) with Reserved Font Name "Merriweather".

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
http://scripts.sil.org/OFL


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded,
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.

```

## File content `assets\fonts\licenses\SourceSerif4-OFL.txt`:

```txt
Google Inc.

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
http://scripts.sil.org/OFL


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded,
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.

```

## File content `css\base.css`:

```css
/*
  Design tokens and theming. Grayscale-first, warm-paper default.
  Themes are applied by setting data-theme on <html>. Contrast is a separate
  modifier so it can be combined with any paper tone.
*/

:root {
  /* Paper + ink palette (warm paper default) */
  --paper-bg: #f3f0e8;
  --paper-surface: #f6f3ec;
  --ink: #1f1f1c;
  --ink-soft: #34342f;
  --ink-muted: #686860;
  --line-soft: rgba(31, 31, 28, 0.16);
  --line-strong: rgba(31, 31, 28, 0.32);
  --surface-shadow: rgba(31, 31, 28, 0.10);
  --code-bg: rgba(31, 31, 28, 0.05);
  --accent-underline: rgba(31, 31, 28, 0.35);
  --selection-bg: rgba(31, 31, 28, 0.16);

  /* Typography (driven by preferences via inline custom props on the reader) */
  --ui-font: "Atkinson Hyperlegible", system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  --reader-font: "Literata", Georgia, "Times New Roman", serif;
  --mono-font: ui-monospace, "SFMono-Regular", "Cascadia Code", Menlo, Consolas, "Liberation Mono", monospace;
  --reader-font-size: 20px;
  --reader-line-height: 1.55;
  --reader-measure: 68ch;
  --reader-para-spacing: 0.9em;
  --reader-align: left;

  /* Texture + eink */
  --texture-strength: 0.5;
  --eink-wash-duration: 220ms;
  --eink-settle-duration: 320ms;
  --ghost-opacity: 0.10;

  /* Layout */
  --control-size: 44px;
  --radius: 6px;
}

/* Cool paper theme */
html[data-theme="cool-paper"] {
  --paper-bg: #eef0ed;
  --paper-surface: #f2f4f1;
  --ink: #1d1f1f;
  --ink-soft: #313534;
  --ink-muted: #5f6564;
  --line-soft: rgba(29, 31, 31, 0.16);
  --line-strong: rgba(29, 31, 31, 0.32);
  --code-bg: rgba(29, 31, 31, 0.05);
}

/* High contrast grayscale theme (required for readability) */
html[data-theme="high-contrast"] {
  --paper-bg: #ffffff;
  --paper-surface: #ffffff;
  --ink: #000000;
  --ink-soft: #111111;
  --ink-muted: #333333;
  --line-soft: rgba(0, 0, 0, 0.35);
  --line-strong: rgba(0, 0, 0, 0.6);
  --code-bg: rgba(0, 0, 0, 0.06);
  --accent-underline: rgba(0, 0, 0, 0.6);
  --selection-bg: rgba(0, 0, 0, 0.2);
}

/* Dark inverse theme (optional, useful at night) */
html[data-theme="dark"] {
  --paper-bg: #16171a;
  --paper-surface: #1c1e22;
  --ink: #d7d5cc;
  --ink-soft: #c2c0b8;
  --ink-muted: #8d8b83;
  --line-soft: rgba(215, 213, 204, 0.16);
  --line-strong: rgba(215, 213, 204, 0.3);
  --surface-shadow: rgba(0, 0, 0, 0.4);
  --code-bg: rgba(215, 213, 204, 0.06);
  --accent-underline: rgba(215, 213, 204, 0.4);
  --selection-bg: rgba(215, 213, 204, 0.18);
}

/* Contrast modifier: soft lowers text contrast slightly for the eink feel. */
html[data-contrast="soft"] {
  --ink: color-mix(in srgb, var(--paper-bg) 12%, #1f1f1c);
}
html[data-contrast="normal"] {
  /* use theme defaults */
}

html,
body {
  background-color: var(--paper-bg);
  color: var(--ink);
  font-family: var(--ui-font);
}

::selection {
  background: var(--selection-bg);
}

body {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Visible, grayscale-friendly focus ring used app-wide. */
:focus-visible {
  outline: 2px solid var(--ink-soft);
  outline-offset: 2px;
  border-radius: 3px;
}

/* App root fills the viewport. */
#app {
  position: relative;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* ---------- File-open screen ---------- */

.open-screen {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.dropzone {
  width: min(560px, 100%);
  padding: 48px 40px;
  text-align: center;
  background: var(--paper-surface);
  border: 1px dashed var(--line-strong);
  border-radius: 12px;
  box-shadow: 0 1px 0 var(--surface-shadow);
}

.dropzone.is-dragover {
  border-style: solid;
  border-color: var(--ink-soft);
  background: color-mix(in srgb, var(--paper-surface) 88%, var(--ink) 12%);
}

.dropzone__icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 18px;
  opacity: 0.85;
}

.dropzone__title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--ink);
}

.dropzone__hint {
  font-size: 0.95rem;
  color: var(--ink-muted);
  line-height: 1.5;
  margin-bottom: 22px;
}

.dropzone__formats {
  display: block;
  margin-top: 6px;
  font-size: 0.85rem;
  color: var(--ink-muted);
}

.dropzone__updates {
  margin: 26px auto 0;
  padding-top: 16px;
  border-top: 1px solid var(--line-soft);
  font-size: 0.82rem;
}

.rss-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--ink-muted);
  text-decoration: none;
  transition: color 160ms ease;
}

.rss-link:hover,
.rss-link:focus-visible {
  color: var(--ink-soft);
  text-decoration: underline;
}

.rss-link__icon {
  flex: 0 0 auto;
  opacity: 0.85;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: var(--control-size);
  padding: 10px 20px;
  border: 1px solid var(--line-strong);
  border-radius: var(--radius);
  background: var(--paper-bg);
  color: var(--ink);
  font-weight: 600;
  transition: background-color 160ms ease, border-color 160ms ease;
}

.button:hover {
  background: color-mix(in srgb, var(--paper-bg) 90%, var(--ink) 10%);
}

.button--primary {
  border-color: var(--ink-soft);
}

/* ---------- Notice / warning banner ---------- */

.notice {
  margin: 18px auto 0;
  max-width: 520px;
  padding: 12px 16px;
  border-radius: var(--radius);
  border: 1px solid var(--line-strong);
  background: var(--paper-surface);
  color: var(--ink-soft);
  font-size: 0.92rem;
  line-height: 1.45;
  text-align: left;
}

.notice__actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.notice--error {
  border-color: var(--line-strong);
}

/* Toast for transient, non-blocking warnings (e.g. font fallback). */
.toast {
  position: fixed;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  max-width: min(520px, 92vw);
  padding: 10px 16px;
  background: var(--paper-surface);
  color: var(--ink-soft);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius);
  box-shadow: 0 4px 14px var(--surface-shadow);
  font-size: 0.9rem;
  z-index: 60;
}

/* Busy indicator during read/parse/paginate. */
.busy {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--paper-bg) 70%, transparent);
  z-index: 40;
  pointer-events: none;
}

.busy__label {
  padding: 10px 18px;
  background: var(--paper-surface);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius);
  color: var(--ink-soft);
  font-size: 0.9rem;
  letter-spacing: 0.02em;
}

```

## File content `css\eink.css`:

```css
/*
  E Ink refresh simulation.

  The effect is coordinated by js/eink-effect.js which toggles classes and sets
  a --eink-dir custom property. The visuals here intentionally avoid a plain
  opacity fade: a refresh is a short wash (darken + desaturate, like pigment
  charging) followed by a stepped grayscale settle of the new page, and page
  turns leave a faint residual ghost that a full refresh clears.

  Intensity is controlled by data-eink on the reader root:
    off | reduced | balanced | strong
  Reduced motion (data-motion="reduced") softens everything further.
*/

.reader__stage {
  /* filter is animated during a refresh; default is identity */
  will-change: filter;
}

/* Overlay sits above the paper during a refresh only. */
.eink-overlay {
  position: absolute;
  inset: 0;
  z-index: 20;
  pointer-events: none;
  opacity: 0;
  background: var(--ink);
}

/* Residual ghost layer: a faint imprint left after partial refreshes. */
.eink-ghost {
  position: absolute;
  inset: 0;
  z-index: 19;
  pointer-events: none;
  opacity: 0;
  background:
    repeating-linear-gradient(
      to bottom,
      rgba(31, 31, 28, 0.04) 0,
      rgba(31, 31, 28, 0.04) 1px,
      transparent 1px,
      transparent 3px
    );
  transition: opacity 600ms ease-out;
}

.eink-ghost.is-visible {
  opacity: calc(var(--ghost-opacity) * 1);
}

/* ---------- Full refresh (file load, mode/theme/font change) ---------- */

.reader__stage.eink-full .eink-overlay {
  animation: eink-full-wash var(--eink-wash-duration) steps(3, end) forwards;
}

.reader__stage.eink-full .content {
  animation: eink-settle var(--eink-settle-duration) steps(4, end);
}

.reader__stage.eink-full {
  animation: eink-surface-flash calc(var(--eink-wash-duration) + 40ms) linear;
}

/* ---------- Partial refresh (page turn) ---------- */

.reader__stage.eink-partial .eink-overlay {
  animation: eink-partial-wash calc(var(--eink-wash-duration) * 0.7) steps(2, end) forwards;
}

.reader__stage.eink-partial .content {
  animation: eink-settle calc(var(--eink-settle-duration) * 0.7) steps(3, end);
}

/* ---------- Keyframes ---------- */

@keyframes eink-full-wash {
  0%   { opacity: 0; }
  20%  { opacity: 0.9; }   /* charge: surface darkens */
  45%  { opacity: 0.65; }
  70%  { opacity: 0.25; }  /* discharge */
  100% { opacity: 0; }
}

@keyframes eink-partial-wash {
  0%   { opacity: 0; }
  35%  { opacity: 0.55; }
  100% { opacity: 0; }
}

/* The incoming page resolves through stepped grayscale + contrast. */
@keyframes eink-settle {
  0%   { filter: grayscale(1) contrast(0.6) brightness(1.15); }
  50%  { filter: grayscale(0.6) contrast(0.85) brightness(1.04); }
  100% { filter: none; }
}

/* Brief whole-surface flash suggesting a global electrophoretic update. */
@keyframes eink-surface-flash {
  0%   { filter: none; }
  15%  { filter: invert(0.06) brightness(0.9); }
  40%  { filter: brightness(1.06); }
  100% { filter: none; }
}

/* ---------- Intensity scaling ---------- */

.reader[data-eink="off"] .eink-overlay,
.reader[data-eink="off"] .eink-ghost {
  display: none;
}
.reader[data-eink="off"] .reader__stage.eink-full,
.reader[data-eink="off"] .reader__stage.eink-partial {
  animation: none;
}
.reader[data-eink="off"] .reader__stage.eink-full .content,
.reader[data-eink="off"] .reader__stage.eink-partial .content {
  animation: none;
}

.reader[data-eink="reduced"] {
  --eink-wash-duration: 160ms;
  --eink-settle-duration: 200ms;
  --ghost-opacity: 0.04;
}

.reader[data-eink="balanced"] {
  --eink-wash-duration: 220ms;
  --eink-settle-duration: 320ms;
  --ghost-opacity: 0.10;
}

.reader[data-eink="strong"] {
  --eink-wash-duration: 300ms;
  --eink-settle-duration: 420ms;
  --ghost-opacity: 0.18;
}

/* Strong mode adds a more visible inversion pulse on full refresh. */
.reader[data-eink="strong"] .reader__stage.eink-full {
  animation: eink-surface-flash-strong calc(var(--eink-wash-duration) + 60ms) linear;
}

@keyframes eink-surface-flash-strong {
  0%   { filter: none; }
  12%  { filter: invert(0.14) brightness(0.82); }
  30%  { filter: invert(0.03) brightness(1.1); }
  55%  { filter: brightness(0.96); }
  100% { filter: none; }
}

/* ---------- Reduced motion: keep it calm, no flashing ---------- */

.reader[data-motion="reduced"] .eink-overlay {
  animation: none !important;
}
.reader[data-motion="reduced"] .reader__stage.eink-full,
.reader[data-motion="reduced"] .reader__stage.eink-partial {
  animation: none !important;
}
.reader[data-motion="reduced"] .reader__stage.eink-full .content,
.reader[data-motion="reduced"] .reader__stage.eink-partial .content {
  /* a gentle, brief grayscale settle with no flashing */
  animation: eink-settle-calm 260ms ease-out !important;
}
.reader[data-motion="reduced"] .eink-ghost {
  display: none;
}

@keyframes eink-settle-calm {
  0%   { opacity: 0.55; filter: grayscale(0.5); }
  100% { opacity: 1; filter: none; }
}

```

## File content `css\reader.css`:

```css
/*
  Reader surface: the paper page, typography for prose and Markdown blocks,
  page-mode viewport, scroll-mode column, and the quiet reader controls.
  Typography values come from CSS custom properties set by the settings module.
*/

.reader {
  position: relative;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--paper-bg);
}

/* Top bar: title + minimal controls. Stays quiet. */
.reader__bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-bottom: 1px solid var(--line-soft);
  background: color-mix(in srgb, var(--paper-bg) 92%, var(--paper-surface) 8%);
  flex: 0 0 auto;
}

.reader__title {
  flex: 1 1 auto;
  font-family: var(--ui-font);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--ink-soft);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.reader__bar-actions {
  display: flex;
  gap: 6px;
  flex: 0 0 auto;
}

.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: var(--control-size);
  min-height: var(--control-size);
  padding: 6px 10px;
  border: 1px solid transparent;
  border-radius: var(--radius);
  color: var(--ink-soft);
  font-family: var(--ui-font);
  font-size: 0.9rem;
  font-weight: 600;
  transition: background-color 160ms ease, border-color 160ms ease;
}

.icon-button:hover {
  background: color-mix(in srgb, var(--paper-bg) 88%, var(--ink) 12%);
  border-color: var(--line-soft);
}

/* Stage holds the paper surface centered on desktop. */
.reader__stage {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  justify-content: center;
  align-items: stretch;
  overflow: hidden;
}

/* Paper surface with subtle texture and grain. */
.paper {
  position: relative;
  width: 100%;
  background: var(--paper-surface);
}

.paper::after {
  /* Subtle paper grain overlay. Opacity scales with texture-strength pref. */
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: url("../assets/textures/paper-noise.svg");
  background-size: 180px 180px;
  opacity: calc(0.22 * var(--texture-strength));
  mix-blend-mode: multiply;
  z-index: 1;
}

html[data-theme="dark"] .paper::after {
  mix-blend-mode: screen;
}

/* Content column: the typographic measure lives here. */
.content {
  position: relative;
  z-index: 2;
  max-width: var(--reader-measure);
  margin: 0 auto;
  font-family: var(--reader-font);
  font-size: var(--reader-font-size);
  line-height: var(--reader-line-height);
  color: var(--ink);
  text-align: var(--reader-align);
  hyphens: auto;
}

/* ---------- Prose + Markdown element styling ---------- */

.content p {
  margin: 0 0 var(--reader-para-spacing);
}

.content h1,
.content h2,
.content h3,
.content h4 {
  font-family: var(--reader-font);
  font-weight: 700;
  line-height: 1.25;
  color: var(--ink);
  margin: 1.4em 0 0.5em;
  text-align: left;
}

.content h1 { font-size: 1.6em; }
.content h2 { font-size: 1.35em; }
.content h3 { font-size: 1.15em; }
.content h4 { font-size: 1.02em; }
.content > :first-child { margin-top: 0; }

.content strong { font-weight: 700; }
.content em { font-style: italic; }

.content blockquote {
  margin: var(--reader-para-spacing) 0;
  padding: 0.1em 0 0.1em 1em;
  border-left: 2px solid var(--line-strong);
  color: var(--ink-soft);
  font-style: italic;
}

.content ul,
.content ol {
  margin: 0 0 var(--reader-para-spacing);
  padding-left: 1.4em;
}

.content li {
  margin: 0.2em 0;
}

.content li > ul,
.content li > ol {
  margin: 0.2em 0;
}

.content hr {
  border: none;
  border-top: 1px solid var(--line-strong);
  margin: 1.8em auto;
  width: 40%;
}

.content a {
  color: var(--ink-soft);
  text-decoration: underline;
  text-decoration-color: var(--accent-underline);
  text-underline-offset: 2px;
}

.content a:hover {
  text-decoration-color: var(--ink);
}

/* Inline code: distinct but not loud. */
.content code {
  font-family: var(--mono-font);
  font-size: 0.9em;
  background: var(--code-bg);
  padding: 0.1em 0.35em;
  border-radius: 4px;
}

/* Fenced code blocks: legible, contained, never break the page width. */
.content pre {
  margin: var(--reader-para-spacing) 0;
  padding: 0.9em 1em;
  background: var(--code-bg);
  border: 1px solid var(--line-soft);
  border-radius: var(--radius);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.content pre code {
  display: block;
  background: none;
  padding: 0;
  font-size: 0.82em;
  line-height: 1.5;
  white-space: pre;
  color: var(--ink-soft);
}

/* Tables render readably and stay inside the column. */
.content table {
  width: 100%;
  border-collapse: collapse;
  margin: var(--reader-para-spacing) 0;
  font-size: 0.92em;
}
.content th,
.content td {
  border: 1px solid var(--line-soft);
  padding: 0.4em 0.6em;
  text-align: left;
}
.content th {
  font-weight: 700;
  background: var(--code-bg);
}

/* Image placeholder â€” remote images are never fetched. */
.md-image-placeholder {
  display: inline-block;
  padding: 0.2em 0.6em;
  margin: 0.2em 0;
  border: 1px dashed var(--line-strong);
  border-radius: 4px;
  color: var(--ink-muted);
  font-family: var(--ui-font);
  font-size: 0.82em;
  font-style: normal;
}

/* Escaped raw HTML shown as literal source text. */
.md-raw-html {
  font-family: var(--mono-font);
  font-size: 0.85em;
  color: var(--ink-muted);
}

/* Two mount points inside .paper â€” one per reading mode. */
#reader-scroll,
#page-viewport {
  display: none;
}

/* ---------- Scroll mode ---------- */

.reader[data-mode="scroll"] .reader__stage {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.reader[data-mode="scroll"] .paper {
  min-height: 100%;
}

.reader[data-mode="scroll"] #reader-scroll {
  display: block;
}

.reader[data-mode="scroll"] .content {
  padding: 48px 28px 96px;
}

/* ---------- Page mode ---------- */

.reader[data-mode="paged"] .reader__stage {
  overflow: hidden;
}

.reader[data-mode="paged"] .paper {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.reader[data-mode="paged"] #page-viewport {
  display: block;
}

/* The pane clips overflow; the content is offset by the paginator. */
.page-viewport {
  position: relative;
  flex: 1 1 auto;
  overflow: hidden;
  padding: 40px 28px 8px;
}

.reader[data-mode="paged"] .content {
  height: 100%;
}

/* Column-based pagination: text flows into stacked columns, and we shift
   horizontally to reveal the current page. */
.reader[data-mode="paged"] .content--paged {
  column-fill: auto;
  height: 100%;
}

/* ---------- Reader footer: navigation + progress ---------- */

.reader__footer {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 16px;
  border-top: 1px solid var(--line-soft);
  flex: 0 0 auto;
  font-family: var(--ui-font);
}

.reader__progress {
  flex: 1 1 auto;
  text-align: center;
  font-size: 0.82rem;
  color: var(--ink-muted);
  letter-spacing: 0.02em;
}

.reader[data-mode="scroll"] .page-nav {
  display: none;
}

/* Edge tap/click zones for page turns (page mode only). */
.page-zone {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 22%;
  z-index: 3;
  background: transparent;
  border: none;
  cursor: pointer;
}
.page-zone--prev { left: 0; }
.page-zone--next { right: 0; }
.reader[data-mode="scroll"] .page-zone { display: none; }

/* Progress hidden when the preference is off. */
.reader[data-progress="off"] .reader__progress {
  visibility: hidden;
}

```

## File content `css\reset.css`:

```css
/* Minimal reset â€” tuned for a reading app, not a general site. */

*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
}

body {
  min-height: 100vh;
  min-height: 100dvh;
  height: 100vh;
  height: 100dvh;
  -webkit-text-size-adjust: 100%;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4, h5, h6, p, blockquote, figure, ul, ol, pre {
  margin: 0;
}

button {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  cursor: pointer;
}

a {
  color: inherit;
}

img {
  max-width: 100%;
}

/* Respect reduced motion at the reset layer as a safety net. */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}

.visually-hidden {
  position: absolute !important;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

[hidden] {
  display: none !important;
}

```

## File content `css\responsive.css`:

```css
/*
  Responsive behavior for desktop, tablet, and mobile.
  Base CSS targets desktop; these queries adapt tablet and mobile.
  Viewport height uses dvh where available to survive mobile browser chrome.
*/

/* Desktop: constrain the paper surface and give it presence. */
@media (min-width: 900px) {
  .reader[data-mode="paged"] .paper {
    max-width: 900px;
    width: auto;
    margin: 0 auto;
    border: 1px solid var(--line-soft);
    border-radius: 8px;
    box-shadow: 0 2px 18px var(--surface-shadow);
    inset: 18px 0;
  }

  .reader[data-mode="scroll"] .content {
    padding: 56px 32px 120px;
  }
}

/* Tablet: comfortable touch targets, moderate margins. */
@media (min-width: 600px) and (max-width: 899px) {
  :root {
    --control-size: 46px;
  }
  .page-viewport {
    padding: 36px 32px 8px;
  }
  .reader[data-mode="scroll"] .content {
    padding: 44px 32px 100px;
  }
}

/* Mobile: narrow reading width, larger touch targets, full-screen settings. */
@media (max-width: 599px) {
  :root {
    --control-size: 46px;
  }

  .dropzone {
    padding: 32px 22px;
  }

  .page-viewport {
    padding: 24px 18px 8px;
  }

  .reader[data-mode="scroll"] .content {
    padding: 28px 18px 88px;
  }

  .reader__title {
    font-size: 0.9rem;
  }

  /* Settings becomes a bottom sheet. */
  .settings {
    top: auto;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 88vh;
    height: 88dvh;
    border-left: none;
    border-top: 1px solid var(--line-strong);
    border-radius: 14px 14px 0 0;
    box-shadow: 0 -6px 24px var(--surface-shadow);
  }

  .field {
    flex-wrap: wrap;
  }
  .field__control {
    justify-content: flex-start;
  }
  .field input[type="range"] {
    width: 100%;
  }

  /* Page zones narrower so they don't block text selection. */
  .page-zone {
    width: 18%;
  }
}

/* Very small heights (landscape phones): tighten vertical padding. */
@media (max-height: 480px) {
  .page-viewport {
    padding-top: 16px;
  }
  .reader__bar,
  .reader__footer {
    padding-top: 4px;
    padding-bottom: 4px;
  }
}

```

## File content `css\settings.css`:

```css
/*
  Settings panel. Feels like a device settings sheet, not an admin form.
  Desktop: right-side panel. Mobile: full-height bottom sheet.
*/

.settings-scrim {
  position: fixed;
  inset: 0;
  background: color-mix(in srgb, var(--ink) 22%, transparent);
  z-index: 45;
}

.settings {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(380px, 100%);
  background: var(--paper-surface);
  border-left: 1px solid var(--line-strong);
  box-shadow: -6px 0 24px var(--surface-shadow);
  z-index: 50;
  display: flex;
  flex-direction: column;
  font-family: var(--ui-font);
  color: var(--ink);
}

.settings__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid var(--line-soft);
  flex: 0 0 auto;
}

.settings__title {
  font-size: 1.05rem;
  font-weight: 700;
}

.settings__body {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 8px 18px 24px;
}

.settings__section {
  border-bottom: 1px solid var(--line-soft);
  padding: 14px 0;
}
.settings__section:last-child { border-bottom: none; }

.settings__section > h3 {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ink-muted);
  margin-bottom: 12px;
}

.field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 10px 0;
}

.field label {
  font-size: 0.92rem;
  color: var(--ink-soft);
  flex: 0 0 auto;
}

.field__control {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.field select,
.field input[type="range"] {
  font: inherit;
}

.field select {
  min-height: 38px;
  padding: 6px 10px;
  background: var(--paper-bg);
  color: var(--ink);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius);
  max-width: 190px;
}

.field input[type="range"] {
  width: 150px;
  accent-color: var(--ink-soft);
}

.field__value {
  min-width: 46px;
  text-align: right;
  font-size: 0.85rem;
  color: var(--ink-muted);
  font-variant-numeric: tabular-nums;
}

/* Segmented control for small option sets (mode, intensity, contrast). */
.segmented {
  display: inline-flex;
  border: 1px solid var(--line-strong);
  border-radius: var(--radius);
  overflow: hidden;
}

.segmented button {
  padding: 7px 12px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--ink-soft);
  border-right: 1px solid var(--line-soft);
  background: var(--paper-bg);
  min-height: 38px;
}
.segmented button:last-child { border-right: none; }

.segmented button[aria-pressed="true"] {
  background: var(--ink-soft);
  color: var(--paper-bg);
}

/* Font selector shows each font rendered as a sample line. */
.field select.font-select option {
  font-size: 1rem;
}

/* Advanced diagnostics stays collapsed by default. */
.settings details {
  margin-top: 4px;
}
.settings summary {
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ink-muted);
  list-style: none;
}
.settings summary::-webkit-details-marker { display: none; }
.settings summary::before { content: "â–¸ "; }
.settings details[open] summary::before { content: "â–¾ "; }

.log-view {
  margin-top: 10px;
  max-height: 200px;
  overflow-y: auto;
  padding: 8px;
  background: var(--code-bg);
  border: 1px solid var(--line-soft);
  border-radius: var(--radius);
  font-family: var(--mono-font);
  font-size: 0.72rem;
  line-height: 1.5;
  color: var(--ink-soft);
  white-space: pre-wrap;
  word-break: break-word;
}

.settings__footer {
  display: flex;
  gap: 10px;
  padding: 12px 18px;
  border-top: 1px solid var(--line-soft);
  flex: 0 0 auto;
}

.kbd-ref {
  font-size: 0.82rem;
  line-height: 1.6;
  color: var(--ink-soft);
}
.kbd-ref kbd {
  font-family: var(--mono-font);
  font-size: 0.78em;
  padding: 1px 5px;
  border: 1px solid var(--line-strong);
  border-radius: 4px;
  background: var(--paper-bg);
}

```

## File content `feed.xml`:

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>E Ink Reader Updates</title>
    <link>https://toys.awwtools.com/public/2026-07-03-agentic-book-e-ink-reader-frank-lily-roman/</link>
    <description>High-level updates for the local E Ink-style TXT and Markdown reader.</description>
    <language>en-us</language>
    <lastBuildDate>Fri, 03 Jul 2026 00:00:00 -0700</lastBuildDate>
    <generator>Static project feed</generator>

    <item>
      <title>Initial E Ink Reader release</title>
      <link>https://toys.awwtools.com/public/2026-07-03-agentic-book-e-ink-reader-frank-lily-roman/#updates-initial-reader</link>
      <guid isPermaLink="false">eink-reader-update-0001</guid>
      <pubDate>Fri, 03 Jul 2026 00:00:00 -0700</pubDate>
      <description>You can now read your own local TXT and Markdown files in a calm, paper-like reading surface. Open a file with the button or by dragging it in; nothing is uploaded and book contents are never stored. Choose page mode for a book-like turning experience or scroll mode for continuous reading.</description>
    </item>

    <item>
      <title>Safe Markdown for technical notes</title>
      <link>https://toys.awwtools.com/public/2026-07-03-agentic-book-e-ink-reader-frank-lily-roman/#updates-safe-markdown</link>
      <guid isPermaLink="false">eink-reader-update-0002</guid>
      <pubDate>Fri, 03 Jul 2026 00:00:00 -0700</pubDate>
      <description>Markdown notes with code render clearly and safely. Raw HTML is escaped or removed before display, links open safely in a new tab, remote images are not fetched automatically, and long code lines stay contained inside the code block on phones instead of pushing the page sideways.</description>
    </item>

    <item>
      <title>Comfortable, private reading defaults</title>
      <link>https://toys.awwtools.com/public/2026-07-03-agentic-book-e-ink-reader-frank-lily-roman/#updates-reading-comfort</link>
      <guid isPermaLink="false">eink-reader-update-0003</guid>
      <pubDate>Fri, 03 Jul 2026 00:00:00 -0700</pubDate>
      <description>The reader opens with a warm paper background, a local Literata font, a comfortable line width, and an E Ink-style refresh effect. You can adjust font, size, theme, and the refresh effect; these preferences are remembered, but reopening the app still asks you to choose your file again. Reduced-motion settings are respected and the refresh effect softens automatically.</description>
    </item>
  </channel>
</rss>

```

## File content `index.html`:

```html
<!DOCTYPE html>
<html lang="en" data-theme="warm-paper" data-contrast="soft">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <!--
    Restrictive CSP for a static, local-first app. No remote resources are
    permitted. connect-src 'none' blocks all network requests (fetch/XHR/ws).
    style-src allows inline styles used for typography custom properties.
  -->
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; frame-src 'none'; form-action 'none'; base-uri 'none'">
  <!-- Primary metadata (static; present in initial HTML for social crawlers). -->
  <title>E Ink Reader - Local TXT and Markdown Reading</title>
  <meta name="description" content="Read local TXT and Markdown files in a calm E Ink-style browser reader with page mode, scroll mode, local fonts, and no uploads.">
  <link rel="canonical" href="https://toys.awwtools.com/public/2026-07-03-agentic-book-e-ink-reader-frank-lily-roman/">
  <link rel="icon" href="assets/icons/icon.svg" type="image/svg+xml">

  <!-- RSS update feed discovery. -->
  <link rel="alternate" type="application/rss+xml" title="E Ink Reader Updates" href="https://toys.awwtools.com/public/2026-07-03-agentic-book-e-ink-reader-frank-lily-roman/feed.xml">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="E Ink Reader">
  <meta property="og:title" content="E Ink Reader - Local TXT and Markdown Reading">
  <meta property="og:description" content="Read local TXT and Markdown files in a calm E Ink-style browser reader with page mode, scroll mode, local fonts, and no uploads.">
  <meta property="og:url" content="https://toys.awwtools.com/public/2026-07-03-agentic-book-e-ink-reader-frank-lily-roman/">
  <meta property="og:image" content="https://toys.awwtools.com/public/2026-07-03-agentic-book-e-ink-reader-frank-lily-roman/assets/social/social_logo_1200x630.jpg">
  <meta property="og:image:secure_url" content="https://toys.awwtools.com/public/2026-07-03-agentic-book-e-ink-reader-frank-lily-roman/assets/social/social_logo_1200x630.jpg">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="E Ink Reader preview showing local Markdown text on a warm paper-like reading screen.">
  <meta property="og:locale" content="en_US">

  <!-- X / Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="E Ink Reader - Local TXT and Markdown Reading">
  <meta name="twitter:description" content="Read local TXT and Markdown files in a calm E Ink-style browser reader with page mode, scroll mode, local fonts, and no uploads.">
  <meta name="twitter:image" content="https://toys.awwtools.com/public/2026-07-03-agentic-book-e-ink-reader-frank-lily-roman/assets/social/social_logo_1200x630.jpg">
  <meta name="twitter:image:alt" content="E Ink Reader preview showing local Markdown text on a warm paper-like reading screen.">
  <link rel="stylesheet" href="css/reset.css">
  <link rel="stylesheet" href="assets/fonts/fonts.css">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/reader.css">
  <link rel="stylesheet" href="css/eink.css">
  <link rel="stylesheet" href="css/settings.css">
  <link rel="stylesheet" href="css/responsive.css">
</head>
<body>
  <div id="app">

    <!-- File-open screen -->
    <section id="open-screen" class="open-screen" aria-label="Open a book">
      <div id="dropzone" class="dropzone">
        <img class="dropzone__icon" src="assets/icons/icon.svg" alt="" aria-hidden="true">
        <div class="dropzone__title">Drop a TXT or Markdown book here</div>
        <p class="dropzone__hint">
          The file is read locally in this browser. It is not uploaded or stored.
          <span class="dropzone__formats">Supported formats: .txt, .md, .markdown</span>
        </p>
        <button id="open-button" type="button" class="button button--primary">Open a file</button>
        <input id="file-input" type="file" accept=".txt,.md,.markdown,text/plain,text/markdown" class="visually-hidden" aria-label="Choose a book file">
        <div id="open-notice" class="notice" hidden></div>
        <p class="dropzone__updates">
          <a class="rss-link" href="feed.xml" title="Project updates feed (RSS)">
            <svg class="rss-link__icon" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" focusable="false">
              <circle cx="6.2" cy="17.8" r="2.2" fill="currentColor"></circle>
              <path d="M4 10.2a9.8 9.8 0 0 1 9.8 9.8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"></path>
              <path d="M4 4.6A15.4 15.4 0 0 1 19.4 20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"></path>
            </svg>
            <span>Updates feed (RSS)</span>
          </a>
        </p>
      </div>
    </section>

    <!-- Reader -->
    <main id="reader" class="reader" data-mode="paged" data-eink="balanced" data-motion="full" data-progress="on" hidden>
      <header class="reader__bar">
        <span id="reader-title" class="reader__title">Reader</span>
        <div class="reader__bar-actions">
          <button id="open-button-2" type="button" class="icon-button" aria-label="Open another file">Open</button>
          <button id="settings-button" type="button" class="icon-button" aria-label="Open settings">Settings</button>
        </div>
      </header>

      <div id="reader-stage" class="reader__stage" tabindex="0">
        <div class="eink-ghost" aria-hidden="true"></div>
        <div class="eink-overlay" aria-hidden="true"></div>
        <button id="zone-prev" type="button" class="page-zone page-zone--prev" aria-label="Previous page" tabindex="-1"></button>
        <button id="zone-next" type="button" class="page-zone page-zone--next" aria-label="Next page" tabindex="-1"></button>
        <div id="paper" class="paper">
          <div id="page-viewport" class="page-viewport"></div>
          <div id="reader-scroll"></div>
        </div>
      </div>

      <footer class="reader__footer">
        <button id="prev-page" type="button" class="icon-button page-nav" aria-label="Previous page">â€¹ Prev</button>
        <div id="progress" class="reader__progress" aria-live="polite"></div>
        <button id="next-page" type="button" class="icon-button page-nav" aria-label="Next page">Next â€º</button>
      </footer>
    </main>

    <!-- Settings mount (populated by settings.js) -->
    <div id="settings-mount"></div>

    <!-- Busy indicator -->
    <div id="busy" class="busy" hidden>
      <div id="busy-label" class="busy__label">Workingâ€¦</div>
    </div>

    <!-- Transient toast -->
    <div id="toast" class="toast" role="status" aria-live="polite" hidden></div>

  </div>

  <!-- Vendored dependencies (classic scripts expose window globals). -->
  <script src="vendor/markdown-it/markdown-it.js"></script>
  <script src="vendor/dompurify/purify.js"></script>

  <!-- Application (ES modules). -->
  <script type="module" src="js/app.js"></script>
</body>
</html>

```

## File content `js\accessibility.js`:

```js
// Accessibility helpers: reduced-motion detection, focus trapping for the
// settings dialog, and the keyboard shortcut reference text.

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Current system reduced-motion preference. */
export function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Subscribe to system reduced-motion changes. Returns an unsubscribe fn. */
export function onReducedMotionChange(handler) {
  if (!window.matchMedia) return () => {};
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const listener = (e) => handler(e.matches);
  if (mq.addEventListener) mq.addEventListener("change", listener);
  else if (mq.addListener) mq.addListener(listener);
  return () => {
    if (mq.removeEventListener) mq.removeEventListener("change", listener);
    else if (mq.removeListener) mq.removeListener(listener);
  };
}

export function getFocusable(container) {
  return Array.from(container.querySelectorAll(FOCUSABLE)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement
  );
}

/**
 * Trap focus inside a container (for the settings dialog).
 * Returns a release function that also restores focus to the prior element.
 */
export function trapFocus(container) {
  const previouslyFocused = document.activeElement;
  const focusable = getFocusable(container);
  if (focusable.length) focusable[0].focus();

  const onKeydown = (e) => {
    if (e.key !== "Tab") return;
    const items = getFocusable(container);
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  container.addEventListener("keydown", onKeydown);

  return function release() {
    container.removeEventListener("keydown", onKeydown);
    if (previouslyFocused && typeof previouslyFocused.focus === "function") {
      previouslyFocused.focus();
    }
  };
}

export const KEYBOARD_REFERENCE = [
  ["â†’ / Space", "Next page"],
  ["â† / Shift+Space", "Previous page"],
  ["PageDown / PageUp", "Scroll or page"],
  ["Home / End", "Start / end"],
  ["S", "Open settings"],
  ["O", "Open file"],
  ["Esc", "Close settings"],
];

```

## File content `js\app.js`:

```js
// Application bootstrap and orchestration. Wires file input, parsing,
// rendering, both reading modes, the E Ink controller, settings, keyboard and
// accessibility behavior. Keeps DOM event binding centralized so interactions
// are auditable. Book content lives in memory only for the session.

import { appState, clearDocument } from "./state.js";
import {
  loadPreferences,
  savePreferences,
  validatePreferences,
  clearPreferences,
  hasStoredPreferences,
} from "./preferences.js";
import { log, setDebugEnabled, getLogEntries, formatLogsForCopy, clearLogs } from "./logging.js";
import { AppError, ErrorCode, describe, toAppError } from "./errors.js";
import { initFileOpen } from "./file-open.js";
import { buildDocument } from "./document-model.js";
import { applyPreferences, buildContent } from "./renderer.js";
import { Paginator } from "./paginator.js";
import { ScrollReader } from "./scroll-reader.js";
import { EinkController } from "./eink-effect.js";
import { createSettingsPanel } from "./settings.js";
import { prefersReducedMotion, onReducedMotionChange, trapFocus } from "./accessibility.js";
import { debounce } from "./utils.js";

// Preference keys that require a layout recalculation when changed.
const LAYOUT_KEYS = new Set([
  "fontFamily",
  "fontSize",
  "lineHeight",
  "measure",
  "paraSpacing",
  "align",
  "margin",
  "readerMode",
]);
// Keys that are a visual redraw (full refresh) but need no relayout.
const VISUAL_FULL_KEYS = new Set(["theme", "contrast"]);

class ReaderApp {
  constructor() {
    this.els = {};
    this.currentContent = null;
    this.pendingResult = null; // last file result, for plain-text fallback
    this.settingsPanel = null;
    this.releaseFocusTrap = null;
    this.toastTimer = null;
  }

  init() {
    this.cacheEls();

    // Preferences.
    appState.preferences = loadPreferences();
    appState.ui.debugEnabled = appState.preferences.debugEnabled;
    setDebugEnabled(appState.ui.debugEnabled);

    // Reduced motion.
    appState.ui.reducedMotionSystem = prefersReducedMotion();

    // E Ink controller.
    this.eink = new EinkController(this.els.stage);
    this.applyEinkConfig();

    // Reading views.
    this.paginator = new Paginator(this.els.pageViewport);
    this.scroll = new ScrollReader(this.els.stage, this.els.scrollHost);

    // Apply preferences to the DOM.
    applyPreferences(appState.preferences, { html: this.els.html, reader: this.els.reader }, appState.ui.reducedMotionSystem);

    // Settings panel factory.
    this.settingsPanel = createSettingsPanel({
      getPrefs: () => appState.preferences,
      onChange: (patch) => this.onPreferenceChange(patch),
      diagnostics: {
        getLogs: () => getLogEntries(),
        copyLogs: () => this.copyLogs(),
        clearLogs: () => clearLogs(),
        clearPreferences: () => this.resetPreferences(),
      },
    });

    this.bindFileOpen();
    this.bindReaderControls();
    this.bindKeyboard();
    this.bindResize();
    this.bindReducedMotion();

    // First-run hint: preferences restored, book must be reopened.
    if (hasStoredPreferences()) {
      this.showOpenNotice({
        title: "Welcome back",
        message: "Preferences were restored. Reopen your book file to continue reading.",
        actions: [],
      });
    }

    log.info("app:init", { mode: appState.preferences.readerMode });
  }

  cacheEls() {
    const $ = (id) => document.getElementById(id);
    this.els = {
      html: document.documentElement,
      openScreen: $("open-screen"),
      openNotice: $("open-notice"),
      dropzone: $("dropzone"),
      fileInput: $("file-input"),
      openButton: $("open-button"),
      reader: $("reader"),
      readerTitle: $("reader-title"),
      settingsButton: $("settings-button"),
      openButton2: $("open-button-2"),
      stage: $("reader-stage"),
      paper: $("paper"),
      pageViewport: $("page-viewport"),
      scrollHost: $("reader-scroll"),
      zonePrev: $("zone-prev"),
      zoneNext: $("zone-next"),
      prevPage: $("prev-page"),
      nextPage: $("next-page"),
      progress: $("progress"),
      settingsMount: $("settings-mount"),
      busy: $("busy"),
      busyLabel: $("busy-label"),
      toast: $("toast"),
    };
  }

  applyEinkConfig() {
    const p = appState.preferences;
    this.eink.configure({
      intensity: p.einkIntensity,
      motion: p.motion,
      reducedMotionSystem: appState.ui.reducedMotionSystem,
      fullRefreshInterval: p.fullRefreshInterval,
    });
  }

  // ---------- File open ----------

  bindFileOpen() {
    this.fileOpen = initFileOpen({
      dropzone: this.els.dropzone,
      fileInput: this.els.fileInput,
      onLoad: (result) => this.loadDocument(result),
      onError: (err) => this.handleError(err),
    });
    this.els.openButton.addEventListener("click", () => this.fileOpen.openPicker());
    this.els.openButton2.addEventListener("click", () => this.fileOpen.openPicker());
  }

  async loadDocument(result, opts = {}) {
    this.pendingResult = result;
    this.setBusy(true, "Readingâ€¦");
    try {
      const doc = buildDocument({
        fileName: result.fileName,
        fileType: result.fileType,
        sourceText: result.sourceText,
        forceText: !!opts.forceText,
      });

      // Store in memory only (never persisted).
      appState.document = {
        loaded: true,
        id: doc.id,
        fileName: doc.fileName,
        fileType: doc.fileType,
        title: doc.title,
        characterCount: doc.characterCount,
        wordEstimate: doc.wordEstimate,
        sections: [],
        sourceText: result.sourceText,
      };

      this.currentContent = buildContent(doc);
      this.els.readerTitle.textContent = doc.title || doc.fileName;

      this.enterReader();
      this.clearOpenNotice();

      // Large file warning (non-blocking).
      if (result.largeWarning && !opts.forceText) {
        this.showToast("This file is large and may take longer to paginate.");
      }
      if (doc.hadRawHtml && doc.fileType === "markdown") {
        this.showToast("Some HTML in this file was not rendered for safety.");
      }

      // Enter reader with a full refresh.
      await this.eink.run("full", async () => {
        await this.layoutCurrentMode(true);
      });
      this.setBusy(false);
    } catch (err) {
      this.setBusy(false);
      this.handleError(err);
    }
  }

  enterReader() {
    this.els.openScreen.hidden = true;
    this.els.reader.hidden = false;
  }

  // ---------- Layout ----------

  /** Build/lay out the current reading mode, waiting for fonts on first load. */
  async layoutCurrentMode(waitFonts) {
    const mode = appState.preferences.readerMode;
    this.els.reader.setAttribute("data-mode", mode);

    if (waitFonts && document.fonts && document.fonts.ready) {
      try {
        await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]);
      } catch (_) {
        /* font loading errors fall through to fallback stacks */
      }
    }

    if (mode === "paged") {
      try {
        this.paginator.attach(this.currentContent);
        await this._ensureReaderFontLoaded(this.currentContent);
        this.paginator.measure(appState.preferences.measure);
        appState.reader.pageCount = this.paginator.pageCount;
        appState.reader.currentPageIndex = this.paginator.index;
      } catch (err) {
        // Pagination failed â€” fall back to scroll mode.
        log.error("pagination:error", { reason: (err && err.message) || "layout" });
        appState.preferences.readerMode = "scroll";
        this.els.reader.setAttribute("data-mode", "scroll");
        this.scroll.layout(this.currentContent);
        this.showToast(describe(ErrorCode.PAGINATION_FAILED).message);
      }
    } else {
      this.scroll.layout(this.currentContent);
      await this._ensureReaderFontLoaded(this.currentContent);
    }
    appState.reader.layoutReady = true;
    this.updateProgress();
    this.updateNavState();
  }

  /**
   * Await the specific reader font (family + weight + style + size) used by the
   * given element. document.fonts.ready can resolve before a lazily-requested
   * variable font is applied, which would make the first pagination measure the
   * fallback font and produce a different page count. Loading the exact face
   * first keeps measurements stable. Times out so a missing font never hangs.
   */
  async _ensureReaderFontLoaded(el) {
    if (!el || !document.fonts || !document.fonts.load) return;
    try {
      const cs = getComputedStyle(el);
      const family = (cs.fontFamily || "serif").split(",")[0].trim();
      const spec = `${cs.fontStyle || "normal"} ${cs.fontWeight || "400"} ${cs.fontSize || "20px"} ${family}`;
      await Promise.race([
        document.fonts.load(spec),
        new Promise((resolve) => setTimeout(resolve, 1200)),
      ]);
    } catch (_) {
      /* fall back to whatever metrics are available */
    }
  }

  /** Re-layout preserving reading position, inside a refresh. */
  async relayoutPreserving(type = "full") {
    if (!appState.document.loaded || !this.currentContent) return;
    const mode = appState.preferences.readerMode;
    const anchor = mode === "paged" ? this.paginator.getAnchorFraction() : this.scroll.getAnchorFraction();

    await this.eink.run(type, async () => {
      if (mode === "paged") {
        await this._ensureReaderFontLoaded(this.currentContent);
        this.paginator.measure(appState.preferences.measure);
        this.paginator.setAnchorFraction(anchor);
        appState.reader.pageCount = this.paginator.pageCount;
        appState.reader.currentPageIndex = this.paginator.index;
      } else {
        // Scroll content reflows automatically; restore fraction next frame.
        requestAnimationFrame(() => this.scroll.setAnchorFraction(anchor));
      }
      this.updateProgress();
      this.updateNavState();
    });
  }

  /** Switch reading mode preserving position. */
  async switchMode(newMode, oldMode) {
    // applyPreferences() may have already written the new mode to the DOM and
    // to appState, so the caller passes the previous mode explicitly.
    if (oldMode == null) oldMode = this.els.reader.getAttribute("data-mode");
    if (newMode === oldMode) return;
    const anchor = oldMode === "paged" ? this.paginator.getAnchorFraction() : this.scroll.getAnchorFraction();
    appState.preferences.readerMode = newMode;
    this.persist();

    await this.eink.run("full", async () => {
      this.els.reader.setAttribute("data-mode", newMode);
      await this.layoutCurrentMode(false);
      if (newMode === "paged") this.paginator.setAnchorFraction(anchor);
      else requestAnimationFrame(() => this.scroll.setAnchorFraction(anchor));
      this.updateProgress();
      this.updateNavState();
    });
  }

  // ---------- Navigation ----------

  bindReaderControls() {
    this.els.nextPage.addEventListener("click", () => this.pageNext());
    this.els.prevPage.addEventListener("click", () => this.pagePrev());
    this.els.zoneNext.addEventListener("click", () => this.pageNext());
    this.els.zonePrev.addEventListener("click", () => this.pagePrev());
    this.els.settingsButton.addEventListener("click", () => this.openSettings());
  }

  pageNext() {
    if (!appState.document.loaded) return;
    if (appState.preferences.readerMode === "scroll") {
      this.scroll.scrollByPage(1);
      this.updateProgress();
      return;
    }
    if (this.paginator.atEnd()) return;
    this.eink.runPageTurn(() => {
      this.paginator.next();
      appState.reader.currentPageIndex = this.paginator.index;
      this.updateProgress();
      this.updateNavState();
    });
  }

  pagePrev() {
    if (!appState.document.loaded) return;
    if (appState.preferences.readerMode === "scroll") {
      this.scroll.scrollByPage(-1);
      this.updateProgress();
      return;
    }
    if (this.paginator.atStart()) return;
    this.eink.runPageTurn(() => {
      this.paginator.prev();
      appState.reader.currentPageIndex = this.paginator.index;
      this.updateProgress();
      this.updateNavState();
    });
  }

  goStart() {
    if (appState.preferences.readerMode === "scroll") {
      this.eink.run("full", () => this.scroll.toStart());
    } else {
      this.eink.run("full", () => {
        this.paginator.goToPage(0);
        appState.reader.currentPageIndex = 0;
        this.updateProgress();
        this.updateNavState();
      });
    }
  }

  goEnd() {
    if (appState.preferences.readerMode === "scroll") {
      this.eink.run("full", () => this.scroll.toEnd());
    } else {
      this.eink.run("full", () => {
        this.paginator.goToPage(this.paginator.pageCount - 1);
        appState.reader.currentPageIndex = this.paginator.index;
        this.updateProgress();
        this.updateNavState();
      });
    }
  }

  updateProgress() {
    const p = appState.preferences;
    if (!p.showProgress) return;
    if (p.readerMode === "paged") {
      this.els.progress.textContent = `Page ${this.paginator.index + 1} of ${this.paginator.pageCount}`;
    } else {
      const frac = this.scroll.getAnchorFraction();
      this.els.progress.textContent = `${Math.round(frac * 100)}%`;
    }
  }

  updateNavState() {
    const paged = appState.preferences.readerMode === "paged";
    const disablePrev = paged && this.paginator.atStart();
    const disableNext = paged && this.paginator.atEnd();
    this.els.prevPage.disabled = disablePrev;
    this.els.nextPage.disabled = disableNext;
  }

  // ---------- Preferences / settings ----------

  onPreferenceChange(patch) {
    const before = appState.preferences;
    const merged = validatePreferences({ ...before, ...patch });
    const changedKeys = Object.keys(patch).filter((k) => merged[k] !== before[k] || k in patch);
    appState.preferences = merged;
    this.persist();

    // Debug toggle side effect.
    if ("debugEnabled" in patch) {
      appState.ui.debugEnabled = merged.debugEnabled;
      setDebugEnabled(merged.debugEnabled);
    }

    // Apply visual prefs to the DOM immediately.
    applyPreferences(merged, { html: this.els.html, reader: this.els.reader }, appState.ui.reducedMotionSystem);
    this.applyEinkConfig();

    if (!appState.document.loaded) return;

    const needsLayout = changedKeys.some((k) => LAYOUT_KEYS.has(k));
    const needsFull = changedKeys.some((k) => VISUAL_FULL_KEYS.has(k));

    if (changedKeys.includes("readerMode")) {
      this.switchMode(merged.readerMode, before.readerMode);
    } else if (needsLayout) {
      this.relayoutPreserving("full");
    } else if (needsFull) {
      // Theme/contrast: full refresh reveal without relayout.
      this.eink.run("full", () => {});
    }

    if ("showProgress" in patch) this.updateProgress();
  }

  persist() {
    const ok = savePreferences(appState.preferences);
    if (!ok) {
      // Non-blocking: settings still apply for the session.
      this.showToast(describe(ErrorCode.PREF_SAVE_FAILED).message);
    }
  }

  openSettings() {
    if (appState.ui.settingsOpen) return;
    appState.ui.settingsOpen = true;
    const panel = this.settingsPanel.render(this.els.settingsMount, () => this.closeSettings());
    this.releaseFocusTrap = trapFocus(panel);
    log.debug("settings:open");
  }

  closeSettings() {
    if (!appState.ui.settingsOpen) return;
    appState.ui.settingsOpen = false;
    if (this.releaseFocusTrap) {
      this.releaseFocusTrap();
      this.releaseFocusTrap = null;
    }
    this.els.settingsMount.innerHTML = "";
    log.debug("settings:close");
  }

  resetPreferences() {
    clearPreferences();
    appState.preferences = validatePreferences(null);
    applyPreferences(appState.preferences, { html: this.els.html, reader: this.els.reader }, appState.ui.reducedMotionSystem);
    this.applyEinkConfig();
    setDebugEnabled(appState.preferences.debugEnabled);
    this.closeSettings();
    if (appState.document.loaded) this.relayoutPreserving("full");
    this.showToast("Preferences were reset.");
  }

  copyLogs() {
    const text = formatLogsForCopy();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        () => this.showToast("Diagnostics copied."),
        () => this.showToast("Could not copy diagnostics.")
      );
    } else {
      this.showToast("Clipboard is not available.");
    }
  }

  // ---------- Keyboard ----------

  bindKeyboard() {
    document.addEventListener("keydown", (e) => this.onKeydown(e));
  }

  onKeydown(e) {
    const tag = (e.target && e.target.tagName) || "";
    const inControl = /^(INPUT|SELECT|TEXTAREA)$/.test(tag);

    if (e.key === "Escape") {
      if (appState.ui.settingsOpen) {
        e.preventDefault();
        this.closeSettings();
      }
      return;
    }

    // Shortcuts that must not fire while typing in a control.
    if (!inControl && !appState.ui.settingsOpen) {
      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        this.openSettings();
        return;
      }
      if (e.key === "o" || e.key === "O") {
        e.preventDefault();
        this.fileOpen.openPicker();
        return;
      }
    }

    if (!appState.document.loaded || appState.ui.settingsOpen) return;
    const paged = appState.preferences.readerMode === "paged";

    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        this.pageNext();
        break;
      case "ArrowLeft":
        e.preventDefault();
        this.pagePrev();
        break;
      case " ": // Space
        if (inControl) break;
        e.preventDefault();
        if (e.shiftKey) this.pagePrev();
        else this.pageNext();
        break;
      case "PageDown":
        e.preventDefault();
        this.pageNext();
        break;
      case "PageUp":
        e.preventDefault();
        this.pagePrev();
        break;
      case "Home":
        e.preventDefault();
        this.goStart();
        break;
      case "End":
        e.preventDefault();
        this.goEnd();
        break;
      default:
        break;
    }
  }

  // ---------- Resize / orientation / reduced motion ----------

  bindResize() {
    const onResize = debounce(() => {
      if (!appState.document.loaded) return;
      this.relayoutPreserving("full");
    }, 220);
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
  }

  bindReducedMotion() {
    onReducedMotionChange((matches) => {
      appState.ui.reducedMotionSystem = matches;
      this.applyEinkConfig();
      applyPreferences(appState.preferences, { html: this.els.html, reader: this.els.reader }, matches);
      log.info("motion:system-change", { reduced: matches });
    });
  }

  // ---------- Notices / errors / busy ----------

  handleError(err) {
    const appErr = err instanceof AppError ? err : toAppError(err);
    appState.ui.lastError = appErr.code;
    const info = describe(appErr.code);

    if (appState.document.loaded) {
      // In-reader: show a toast; for parse issues offer plain-text fallback.
      if (this.canFallbackToText(appErr.code) && this.pendingResult) {
        this.showActionToast(info.message, "Open as plain text", () =>
          this.loadDocument(this.pendingResult, { forceText: true })
        );
      } else {
        this.showToast(info.message);
      }
    } else {
      this.showOpenNotice(info, appErr);
    }
  }

  canFallbackToText(code) {
    return (
      code === ErrorCode.PARSE_FAILED ||
      code === ErrorCode.PARSER_UNAVAILABLE ||
      code === ErrorCode.SANITIZER_UNAVAILABLE
    );
  }

  showOpenNotice(info, appErr) {
    const notice = this.els.openNotice;
    notice.innerHTML = "";
    notice.className = "notice" + (appErr ? " notice--error" : "");
    const title = document.createElement("strong");
    title.textContent = info.title;
    const msg = document.createElement("div");
    msg.textContent = info.message;
    notice.append(title, msg);

    const actions = (info.actions || []).filter((a) => a !== "open"); // open button already present
    if (this.canFallbackToText(appErr && appErr.code) && this.pendingResult) {
      const btn = document.createElement("button");
      btn.className = "button";
      btn.textContent = "Open as plain text";
      btn.addEventListener("click", () => this.loadDocument(this.pendingResult, { forceText: true }));
      const wrap = document.createElement("div");
      wrap.className = "notice__actions";
      wrap.appendChild(btn);
      notice.appendChild(wrap);
    }
    notice.hidden = false;
  }

  clearOpenNotice() {
    this.els.openNotice.hidden = true;
    this.els.openNotice.innerHTML = "";
  }

  setBusy(on, label) {
    appState.ui.busy = on;
    this.els.busy.hidden = !on;
    if (label) this.els.busyLabel.textContent = label;
  }

  showToast(message) {
    const t = this.els.toast;
    t.textContent = message;
    t.hidden = false;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      t.hidden = true;
    }, 4200);
  }

  showActionToast(message, actionLabel, onAction) {
    const t = this.els.toast;
    t.textContent = message + "  ";
    const btn = document.createElement("button");
    btn.className = "button";
    btn.style.marginLeft = "10px";
    btn.textContent = actionLabel;
    btn.addEventListener("click", () => {
      t.hidden = true;
      onAction();
    });
    t.appendChild(btn);
    t.hidden = false;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      t.hidden = true;
    }, 8000);
  }
}

// Boot.
const app = new ReaderApp();
window.__einkReader = app; // exposed for Playwright test hooks (no behavior change)
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => app.init());
} else {
  app.init();
}

export { ReaderApp, app };

```

## File content `js\document-model.js`:

```js
// Builds a normalized, session-only document model from raw file text.
// The model separates source input from rendered HTML so pagination/rendering
// never depend on scattered raw strings. Nothing here is persisted.

import { AppError, ErrorCode } from "./errors.js";
import { log } from "./logging.js";
import { generateId, estimateWords } from "./utils.js";
import { parseTxt, guessTxtTitle, normalizeText } from "./parser-txt.js";
import { parseMarkdown } from "./parser-markdown.js";

/** Extract a title from the first heading in an HTML fragment. */
function titleFromHtml(html) {
  const match = /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/i.exec(html);
  if (!match) return null;
  const text = match[1].replace(/<[^>]+>/g, "").trim();
  return text || null;
}

/** Strip an extension for a filename-derived title. */
function titleFromFileName(fileName) {
  return (fileName || "Untitled").replace(/\.(txt|md|markdown)$/i, "");
}

/**
 * Build the normalized document.
 * @param {object} input { fileName, fileType: "text"|"markdown", sourceText, forceText }
 * @returns normalizedDocument
 */
export function buildDocument(input) {
  const { fileName, fileType, sourceText } = input;
  const normalized = normalizeText(sourceText);

  if (!normalized.trim()) {
    throw new AppError(ErrorCode.EMPTY_FILE, "no readable content");
  }

  let html;
  let title;
  let hadRawHtml = false;
  const effectiveType = input.forceText ? "text" : fileType;

  if (effectiveType === "markdown") {
    const result = parseMarkdown(normalized);
    html = result.html;
    hadRawHtml = result.hadRawHtml;
    title = titleFromHtml(html) || titleFromFileName(fileName);
    if (!html.trim()) {
      throw new AppError(ErrorCode.EMPTY_FILE, "markdown rendered empty");
    }
  } else {
    const blocks = parseTxt(normalized);
    if (blocks.length === 0) {
      throw new AppError(ErrorCode.EMPTY_FILE, "no readable content");
    }
    html = blocks.map((b) => b.html).join("\n");
    title = guessTxtTitle(normalized) || titleFromFileName(fileName);
  }

  const headingCount = (html.match(/<h[1-6][^>]*>/gi) || []).length;

  const doc = {
    id: generateId(),
    fileName: fileName || "book",
    fileType: effectiveType,
    title,
    characterCount: normalized.length,
    wordEstimate: estimateWords(normalized),
    headingCount,
    html,
    hadRawHtml,
  };

  log.info("document:normalized", {
    fileType: doc.fileType,
    characterCount: doc.characterCount,
    wordEstimate: doc.wordEstimate,
    headingCount: doc.headingCount,
    forcedText: !!input.forceText,
  });

  return doc;
}

```

## File content `js\eink-effect.js`:

```js
// E Ink refresh controller. Single owner of refresh timing and DOM-swap
// coordination so no other module duplicates refresh logic.
//
// A refresh is: lock -> wash overlay -> swap DOM near the wash peak -> stepped
// grayscale settle -> unlock. Page turns use a partial refresh that leaves a
// faint ghost; after `fullRefreshInterval` turns a full refresh clears it.
// Any error during the swap still unlocks and reveals the new DOM.

import { log } from "./logging.js";
import { nextFrame, wait } from "./utils.js";

const DURATIONS = {
  off: { wash: 0, settle: 0 },
  reduced: { wash: 120, settle: 180 },
  balanced: { wash: 220, settle: 320 },
  strong: { wash: 300, settle: 420 },
};

export class EinkController {
  constructor(stageEl) {
    this.stage = stageEl;
    this.overlay = stageEl.querySelector(".eink-overlay");
    this.ghost = stageEl.querySelector(".eink-ghost");
    this.config = {
      intensity: "balanced",
      motion: "system",
      reducedMotionSystem: false,
      fullRefreshInterval: 6,
    };
    this.partials = 0;
    this.locked = false;
    this._chain = Promise.resolve();
  }

  configure(patch) {
    Object.assign(this.config, patch);
  }

  /** Resolve effective motion: system follows OS preference. */
  effectiveMotion() {
    if (this.config.motion === "reduced") return "reduced";
    if (this.config.motion === "full") return "full";
    return this.config.reducedMotionSystem ? "reduced" : "full";
  }

  isReduced() {
    return this.effectiveMotion() === "reduced";
  }

  durations() {
    if (this.config.intensity === "off") return DURATIONS.off;
    if (this.isReduced()) return DURATIONS.reduced;
    return DURATIONS[this.config.intensity] || DURATIONS.balanced;
  }

  /** True while a refresh is animating; callers may skip rapid re-entry. */
  get busy() {
    return this.locked;
  }

  /**
   * Run a refresh, serialized so rapid calls queue rather than overlap.
   * @param {"full"|"partial"} type
   * @param {Function} updateDom async or sync DOM mutation
   */
  run(type, updateDom) {
    this._chain = this._chain.then(() => this._run(type, updateDom));
    return this._chain;
  }

  async _run(type, updateDom) {
    const off = this.config.intensity === "off";
    if (off) {
      // No visual effect, but still swap the DOM.
      await this._safeUpdate(updateDom);
      return;
    }

    const dur = this.durations();
    const reduced = this.isReduced();
    const cls = type === "full" ? "eink-full" : "eink-partial";

    log.debug("eink:refresh:start", { type, intensity: this.config.intensity, reduced });

    this.locked = true;
    this.stage.classList.remove("eink-full", "eink-partial");
    // Force reflow so re-adding the class restarts the animation.
    void this.stage.offsetWidth;
    this.stage.classList.add(cls);

    try {
      // Let the wash cover the surface before swapping content.
      await wait(reduced ? 10 : Math.round(dur.wash * 0.45));
      await this._safeUpdate(updateDom);
      await nextFrame();

      if (type === "partial" && !reduced) this._showGhost();
      else this._clearGhost();

      await wait(reduced ? 180 : dur.settle);
    } finally {
      this.stage.classList.remove(cls);
      this.locked = false;
      log.debug("eink:refresh:complete", { type });
    }

    // Ghost cleanup cadence.
    if (type === "partial") {
      this.partials += 1;
      if (this.config.fullRefreshInterval > 0 && this.partials >= this.config.fullRefreshInterval) {
        this.partials = 0;
        this._clearGhost();
      }
    } else {
      this.partials = 0;
    }
  }

  async _safeUpdate(updateDom) {
    try {
      await updateDom();
    } catch (err) {
      // Never leave the UI stuck: reveal whatever state exists and report.
      log.error("eink:refresh:update-error", { reason: (err && err.message) || "update" });
    }
  }

  _showGhost() {
    if (!this.ghost) return;
    this.ghost.classList.add("is-visible");
  }

  _clearGhost() {
    if (!this.ghost) return;
    this.ghost.classList.remove("is-visible");
  }

  /** Decide partial vs full for a page turn based on the cleanup interval. */
  runPageTurn(updateDom) {
    const interval = this.config.fullRefreshInterval;
    const useFull = interval > 0 && this.partials + 1 >= interval;
    return this.run(useFull ? "full" : "partial", updateDom);
  }
}

```

## File content `js\errors.js`:

```js
// Central error definitions and user-facing copy.
// User messages are short and factual (see design note AO00). Technical detail
// is logged, never shown as a raw stack trace in the main UI.

import { log } from "./logging.js";

export const ErrorCode = {
  NO_FILE: "no_file",
  MULTIPLE_FILES: "multiple_files",
  UNSUPPORTED_TYPE: "unsupported_type",
  EMPTY_FILE: "empty_file",
  FILE_TOO_LARGE: "file_too_large",
  READ_FAILED: "read_failed",
  DECODE_FAILED: "decode_failed",
  BINARY_CONTENT: "binary_content",
  PARSER_UNAVAILABLE: "parser_unavailable",
  PARSE_FAILED: "parse_failed",
  SANITIZER_UNAVAILABLE: "sanitizer_unavailable",
  FONT_FAILED: "font_failed",
  PAGINATION_FAILED: "pagination_failed",
  PREF_LOAD_FAILED: "pref_load_failed",
  PREF_SAVE_FAILED: "pref_save_failed",
  UNKNOWN: "unknown",
};

// Copy is intentionally plain. `actions` are hints the UI can render as buttons.
const CATALOG = {
  [ErrorCode.NO_FILE]: {
    title: "No file selected",
    message: "Choose a .txt, .md, or .markdown file to start reading.",
    actions: ["open"],
  },
  [ErrorCode.MULTIPLE_FILES]: {
    title: "Open one book at a time",
    message: "Open one book file at a time.",
    actions: ["open"],
  },
  [ErrorCode.UNSUPPORTED_TYPE]: {
    title: "Unsupported file type",
    message: "This file type is not supported. Open a .txt, .md, or .markdown file.",
    actions: ["open"],
  },
  [ErrorCode.EMPTY_FILE]: {
    title: "This file is empty",
    message: "There is nothing to read in this file. Open another book file.",
    actions: ["open"],
  },
  [ErrorCode.FILE_TOO_LARGE]: {
    title: "File is too large",
    message: "This file is too large to open safely. Try a smaller file.",
    actions: ["open"],
  },
  [ErrorCode.READ_FAILED]: {
    title: "Could not read the file",
    message: "The file could not be read. Try reopening it.",
    actions: ["open"],
  },
  [ErrorCode.DECODE_FAILED]: {
    title: "Could not read the text",
    message: "The text in this file could not be decoded. Open a plain UTF-8 text or Markdown file.",
    actions: ["open"],
  },
  [ErrorCode.BINARY_CONTENT]: {
    title: "This does not look like text",
    message: "This file does not appear to be readable text. Open a .txt, .md, or .markdown file.",
    actions: ["open"],
  },
  [ErrorCode.PARSER_UNAVAILABLE]: {
    title: "Markdown rendering is unavailable",
    message: "Markdown support could not load. You can open this file as plain text.",
    actions: ["plaintext", "open"],
  },
  [ErrorCode.PARSE_FAILED]: {
    title: "Markdown could not be rendered",
    message: "Markdown could not be rendered safely. You can reopen this file as plain text.",
    actions: ["plaintext", "open"],
  },
  [ErrorCode.SANITIZER_UNAVAILABLE]: {
    title: "Safe Markdown rendering is unavailable",
    message: "The content sanitizer could not load, so Markdown is shown as plain text for safety.",
    actions: ["open"],
  },
  [ErrorCode.FONT_FAILED]: {
    title: "Font could not load",
    message: "The selected font could not load. A fallback font is being used.",
    actions: [],
  },
  [ErrorCode.PAGINATION_FAILED]: {
    title: "Page layout could not be built",
    message: "This file could not be laid out in page mode, so scroll mode is being used instead.",
    actions: [],
  },
  [ErrorCode.PREF_LOAD_FAILED]: {
    title: "Preferences could not be loaded",
    message: "Your saved settings could not be read, so defaults are being used.",
    actions: [],
  },
  [ErrorCode.PREF_SAVE_FAILED]: {
    title: "Preferences could not be saved",
    message: "Your settings could not be saved in this browser. They will still apply for this session.",
    actions: [],
  },
  [ErrorCode.UNKNOWN]: {
    title: "Something went wrong",
    message: "Something unexpected happened. Try reopening your book file.",
    actions: ["open"],
  },
};

export class AppError extends Error {
  constructor(code, detail) {
    const info = CATALOG[code] || CATALOG[ErrorCode.UNKNOWN];
    super(info.message);
    this.name = "AppError";
    this.code = code in CATALOG ? code : ErrorCode.UNKNOWN;
    this.detail = detail || null;
  }
}

/** Look up user-facing copy for an error code. */
export function describe(code) {
  return CATALOG[code] || CATALOG[ErrorCode.UNKNOWN];
}

/**
 * Normalize any thrown value into an AppError and log its technical detail.
 * Returns the AppError so callers can present user-facing copy.
 */
export function toAppError(err, fallbackCode = ErrorCode.UNKNOWN) {
  if (err instanceof AppError) {
    log.error("error:shown", { code: err.code });
    return err;
  }
  const appErr = new AppError(fallbackCode, err && err.message ? err.message : String(err));
  log.error("error:shown", { code: appErr.code, detail: appErr.detail });
  return appErr;
}

```

## File content `js\file-open.js`:

```js
// File input: file picker and drag-and-drop. Validates before parsing and
// reads the file locally with the File API. No upload, no network.

import { AppError, ErrorCode } from "./errors.js";
import { log } from "./logging.js";
import { fileExtension, looksBinary } from "./utils.js";

const SUPPORTED = new Set(["txt", "md", "markdown"]);
const WARN_BYTES = 2 * 1024 * 1024; // 2 MB â€” warn but allow
const HARD_LIMIT_BYTES = 15 * 1024 * 1024; // 15 MB â€” reject

function typeForExtension(ext) {
  return ext === "txt" ? "text" : "markdown";
}

/**
 * Validate a FileList and read the single accepted file.
 * Resolves to { fileName, fileType, sourceText, largeWarning }.
 * Rejects with an AppError on any validation/read failure.
 */
export async function readFromFileList(fileList) {
  const files = Array.from(fileList || []);
  if (files.length === 0) throw new AppError(ErrorCode.NO_FILE);
  if (files.length > 1) {
    log.info("file:drop", { count: files.length });
    throw new AppError(ErrorCode.MULTIPLE_FILES);
  }

  const file = files[0];
  const ext = fileExtension(file.name);
  log.info("file:select", { name: file.name, size: file.size, ext });

  if (!SUPPORTED.has(ext)) throw new AppError(ErrorCode.UNSUPPORTED_TYPE, ext || "no-extension");
  if (file.size === 0) throw new AppError(ErrorCode.EMPTY_FILE);
  if (file.size > HARD_LIMIT_BYTES) throw new AppError(ErrorCode.FILE_TOO_LARGE, `${file.size} bytes`);

  log.info("file:validated", { fileType: typeForExtension(ext) });

  let text;
  try {
    log.info("file:read:start");
    text = await file.text();
  } catch (err) {
    throw new AppError(ErrorCode.READ_FAILED, (err && err.message) || "read");
  }

  if (typeof text !== "string") throw new AppError(ErrorCode.DECODE_FAILED);
  if (looksBinary(text)) throw new AppError(ErrorCode.BINARY_CONTENT);

  log.info("file:read:success", { size: file.size });

  return {
    fileName: file.name,
    fileType: typeForExtension(ext),
    sourceText: text,
    largeWarning: file.size > WARN_BYTES,
  };
}

/**
 * Wire the file picker and drop zone.
 * @param {object} opts { dropzone, fileInput, onLoad(result), onError(appError) }
 */
export function initFileOpen(opts) {
  const { dropzone, fileInput, onLoad, onError } = opts;

  const handle = async (fileList) => {
    try {
      const result = await readFromFileList(fileList);
      onLoad(result);
    } catch (err) {
      onError(err instanceof AppError ? err : new AppError(ErrorCode.UNKNOWN, String(err)));
    }
  };

  fileInput.addEventListener("change", () => {
    handle(fileInput.files);
    // Reset so selecting the same file again re-triggers change.
    fileInput.value = "";
  });

  // Prevent the browser from navigating to a dropped file anywhere on the page.
  ["dragenter", "dragover", "drop"].forEach((type) => {
    window.addEventListener(type, (e) => {
      if (type !== "drop") e.preventDefault();
    });
  });

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("is-dragover");
  });
  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("is-dragover"));
  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("is-dragover");
    const dt = e.dataTransfer;
    handle(dt ? dt.files : null);
  });

  return {
    openPicker: () => fileInput.click(),
    handleFileList: handle,
  };
}

export const FileLimits = { WARN_BYTES, HARD_LIMIT_BYTES };

```

## File content `js\logging.js`:

```js
// Structured local logging. Never sends anything anywhere.
// Keeps a bounded ring buffer for the optional diagnostics panel.
// Privacy rule: log metadata only (names, sizes, counts) â€” never book text.

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const MAX_ENTRIES = 200;

const state = {
  buffer: [],
  consoleLevel: "info", // verbose logs are gated unless debug is enabled
  listeners: new Set(),
};

function record(level, event, meta) {
  const entry = {
    t: new Date().toISOString(),
    level,
    event,
    meta: meta || null,
  };
  state.buffer.push(entry);
  if (state.buffer.length > MAX_ENTRIES) state.buffer.shift();

  if (LEVELS[level] >= LEVELS[state.consoleLevel]) {
    const line = `[eink ${level}] ${event}`;
    const fn = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
    if (meta) fn(line, meta);
    else fn(line);
  }
  state.listeners.forEach((fn) => {
    try {
      fn(entry);
    } catch (_) {
      /* listener errors must not break logging */
    }
  });
}

export const log = {
  debug: (event, meta) => record("debug", event, meta),
  info: (event, meta) => record("info", event, meta),
  warn: (event, meta) => record("warn", event, meta),
  error: (event, meta) => record("error", event, meta),
};

/** Enable verbose console output (debug mode). */
export function setDebugEnabled(enabled) {
  state.consoleLevel = enabled ? "debug" : "info";
  record("info", "logging:level", { debug: !!enabled });
}

/** Return a copy of recent log entries for the diagnostics panel. */
export function getLogEntries() {
  return state.buffer.slice();
}

/** Format logs as plain text for copying. Contains no book content. */
export function formatLogsForCopy() {
  return state.buffer
    .map((e) => `${e.t} ${e.level.toUpperCase()} ${e.event}${e.meta ? " " + JSON.stringify(e.meta) : ""}`)
    .join("\n");
}

export function onLog(listener) {
  state.listeners.add(listener);
  return () => state.listeners.delete(listener);
}

export function clearLogs() {
  state.buffer = [];
  record("info", "logging:cleared");
}

```

## File content `js\paginator.js`:

```js
// Page-mode pagination using the CSS multi-column technique.
//
// The content element is given a fixed height and a column-width equal to the
// page width. With column-fill:auto, overflow content flows into new columns to
// the right, expanding scrollWidth. We reveal one page by translating the
// content horizontally. This is fast (no per-block DOM measurement loop) and
// stable across fonts and viewports.

import { clamp } from "./utils.js";
import { log } from "./logging.js";

const COLUMN_GAP = 48; // px between page columns
const V_MARGIN = 8; // extra vertical breathing room inside the viewport

export class Paginator {
  constructor(viewportEl) {
    this.viewport = viewportEl;
    this.content = null;
    this.pageWidth = 0;
    this.pageStride = 0;
    this.pageCount = 1;
    this.index = 0;
  }

  /** Attach a freshly built content element and measure pages. */
  layout(contentEl, measureCh) {
    this.attach(contentEl);
    this.measure(measureCh);
    return this.pageCount;
  }

  /** Attach content without measuring (measure once fonts are ready). */
  attach(contentEl) {
    this.content = contentEl;
    contentEl.classList.add("content--paged");
    this.viewport.replaceChildren(contentEl);
  }

  /** Re-measure page geometry, preserving the current reading fraction. */
  measure(measureCh) {
    if (!this.content) return 1;
    const frac = this.getAnchorFraction();

    const vpW = this.viewport.clientWidth;
    const vpH = this.viewport.clientHeight;

    // Determine measure width in px from the ch-based preference, capped to vp.
    // Fall back to 0.5em-per-ch estimate if we cannot measure directly.
    const chPx = this._chWidthPx();
    const desiredW = measureCh ? measureCh * chPx : vpW;
    const pageWidth = Math.max(200, Math.min(desiredW, vpW - 8));
    const pageHeight = Math.max(120, vpH - V_MARGIN * 2);

    this.pageWidth = pageWidth;
    this.pageStride = pageWidth + COLUMN_GAP;

    const c = this.content;
    c.style.position = "absolute";
    c.style.top = `${V_MARGIN}px`;
    c.style.left = `${Math.max(0, (vpW - pageWidth) / 2)}px`;
    c.style.width = `${pageWidth}px`;
    c.style.height = `${pageHeight}px`;
    c.style.columnWidth = `${pageWidth}px`;
    c.style.columnGap = `${COLUMN_GAP}px`;
    c.style.columnFill = "auto";

    // Force layout, then read the flowed width.
    const scrollW = c.scrollWidth;
    const count = Math.max(1, Math.round((scrollW + COLUMN_GAP) / this.pageStride));
    this.pageCount = count;
    this.index = clamp(Math.round(frac * (count - 1)), 0, count - 1);
    this.applyTransform();

    log.info("pagination:complete", { pageCount: count });
    return count;
  }

  _chWidthPx() {
    // Measure the width of a run of characters in the current font.
    const probe = document.createElement("span");
    probe.textContent = "0000000000"; // 10 chars
    probe.style.position = "absolute";
    probe.style.visibility = "hidden";
    probe.style.whiteSpace = "pre";
    probe.style.font = getComputedStyle(this.content).font;
    document.body.appendChild(probe);
    const w = probe.getBoundingClientRect().width / 10;
    document.body.removeChild(probe);
    return w || 10;
  }

  applyTransform() {
    if (!this.content) return;
    const offset = -this.index * this.pageStride;
    this.content.style.transform = `translateX(${offset}px)`;
  }

  goToPage(index) {
    const next = clamp(index, 0, this.pageCount - 1);
    const changed = next !== this.index;
    this.index = next;
    this.applyTransform();
    return changed;
  }

  next() {
    return this.goToPage(this.index + 1);
  }

  prev() {
    return this.goToPage(this.index - 1);
  }

  atStart() {
    return this.index <= 0;
  }

  atEnd() {
    return this.index >= this.pageCount - 1;
  }

  getAnchorFraction() {
    if (this.pageCount <= 1) return 0;
    return this.index / (this.pageCount - 1);
  }

  setAnchorFraction(frac) {
    this.index = clamp(Math.round(frac * (this.pageCount - 1)), 0, this.pageCount - 1);
    this.applyTransform();
  }
}

```

## File content `js\parser-markdown.js`:

```js
// Markdown parser wrapper. Treats Markdown as untrusted input.
//
// Security model:
//  - markdown-it is configured with html: false, so raw HTML in the source is
//    escaped and shown as literal text (never rendered as markup).
//  - Remote images are never emitted; the image rule renders a non-fetching
//    placeholder instead of an <img>.
//  - The rendered HTML is then sanitized with DOMPurify (defense in depth) to a
//    restrictive reading-only tag/attribute set.
//  - If DOMPurify is unavailable we fail closed (caller falls back to plain text).

import { AppError, ErrorCode } from "./errors.js";
import { log } from "./logging.js";
import { escapeHtml } from "./utils.js";
import { normalizeText } from "./parser-txt.js";

// Reading-safe allow-list. No script, style, iframe, object, form, or img.
const ALLOWED_TAGS = [
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "br", "hr", "blockquote",
  "ul", "ol", "li",
  "strong", "em", "b", "i", "s", "del", "mark", "sup", "sub",
  "a", "code", "pre",
  "table", "thead", "tbody", "tr", "th", "td",
  "span",
];
const ALLOWED_ATTR = ["href", "class", "title"];

let mdInstance = null;

function getMarkdownIt() {
  if (mdInstance) return mdInstance;
  const factory = window.markdownit;
  if (typeof factory !== "function") {
    throw new AppError(ErrorCode.PARSER_UNAVAILABLE, "window.markdownit missing");
  }
  const md = factory({
    html: false, // do not allow raw HTML â€” escaped as text instead
    linkify: true,
    typographer: true,
    breaks: false,
  });

  // Replace image rendering with a safe, non-fetching placeholder.
  md.renderer.rules.image = (tokens, idx) => {
    const alt = tokens[idx].content || "";
    const label = alt ? `image: ${alt}` : "image";
    return `<span class="md-image-placeholder">[${escapeHtml(label)}]</span>`;
  };

  mdInstance = md;
  return md;
}

/** True if the raw source contains HTML tags (which we escape, not render). */
function containsRawHtml(text) {
  return /<\/?[a-z][\s\S]*?>/i.test(text) || /<script/i.test(text);
}

/**
 * Parse Markdown into sanitized, reading-safe HTML.
 * Returns { html, hadRawHtml }.
 * Throws AppError(PARSE_FAILED) on parser error and
 * AppError(SANITIZER_UNAVAILABLE) if DOMPurify is missing.
 */
export function parseMarkdown(rawText) {
  const text = normalizeText(rawText);
  const md = getMarkdownIt();

  let rendered;
  try {
    rendered = md.render(text);
  } catch (err) {
    log.error("parser:markdown:error", { reason: (err && err.message) || "render" });
    throw new AppError(ErrorCode.PARSE_FAILED, (err && err.message) || "render");
  }

  const purify = window.DOMPurify;
  if (!purify || typeof purify.sanitize !== "function") {
    // Fail closed: never render unsanitized Markdown HTML.
    throw new AppError(ErrorCode.SANITIZER_UNAVAILABLE, "window.DOMPurify missing");
  }

  const clean = purify.sanitize(rendered, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ["style", "script", "img", "iframe", "object", "embed", "form", "svg", "math"],
    FORBID_ATTR: ["style", "srcset", "src", "onerror", "onload"],
    ADD_ATTR: [], // links get rel/target added post-sanitize
  });

  const removedCount = (purify.removed && purify.removed.length) || 0;
  if (removedCount > 0) {
    log.warn("parser:markdown:sanitized", { removed: removedCount });
  }

  return {
    html: clean,
    hadRawHtml: containsRawHtml(text) || removedCount > 0,
  };
}

export function isMarkdownAvailable() {
  return typeof window.markdownit === "function";
}

export function isSanitizerAvailable() {
  return !!(window.DOMPurify && typeof window.DOMPurify.sanitize === "function");
}

```

## File content `js\parser-txt.js`:

```js
// Plain-text parser. Converts .txt into safe, readable prose HTML.
// Everything is escaped â€” text never becomes trusted markup.

import { escapeHtml } from "./utils.js";

/** Normalize line endings to \n and strip a leading UTF-8 BOM. */
export function normalizeText(text) {
  let out = text || "";
  if (out.charCodeAt(0) === 0xfeff) out = out.slice(1);
  return out.replace(/\r\n?/g, "\n");
}

/**
 * Heuristic: does this text look like preformatted/fixed-width content
 * (code, tables, ASCII art) rather than prose?
 */
function looksPreformatted(lines) {
  const nonEmpty = lines.filter((l) => l.trim().length > 0);
  if (nonEmpty.length === 0) return false;
  let indented = 0;
  for (const line of nonEmpty) {
    if (/^(\t| {2,})/.test(line)) indented += 1;
  }
  return indented / nonEmpty.length > 0.35;
}

/**
 * Parse plain text into an array of block descriptors:
 *   { type: "p" | "pre", html }
 * Prose paragraphs reflow (soft newlines joined); preformatted files keep
 * their layout inside a single <pre>.
 */
export function parseTxt(rawText) {
  const text = normalizeText(rawText);
  const lines = text.split("\n");

  if (looksPreformatted(lines)) {
    // Trim trailing blank lines but keep internal structure verbatim.
    const body = text.replace(/\n{3,}$/g, "\n").replace(/\s+$/g, "");
    return [{ type: "pre", html: `<pre><code>${escapeHtml(body)}</code></pre>` }];
  }

  const blocks = [];
  let paragraph = [];

  const flush = () => {
    if (paragraph.length === 0) return;
    const joined = paragraph.join(" ").replace(/\s+/g, " ").trim();
    if (joined) blocks.push({ type: "p", html: `<p>${escapeHtml(joined)}</p>` });
    paragraph = [];
  };

  for (const line of lines) {
    if (line.trim() === "") {
      flush();
    } else {
      paragraph.push(line.trim());
    }
  }
  flush();

  return blocks;
}

/** Guess a title from the first non-empty line. */
export function guessTxtTitle(rawText) {
  const text = normalizeText(rawText);
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (t) return t.length > 120 ? t.slice(0, 117) + "â€¦" : t;
  }
  return null;
}

```

## File content `js\preferences.js`:

```js
// Preference persistence. localStorage stores ONLY reading preferences.
// Book content is never written here (see design note AA00). Values are
// validated on load and reset safely if corrupt or from an older version.

import { log } from "./logging.js";
import { clamp, toNumber } from "./utils.js";

const STORAGE_KEY = "eink-reader:preferences";
const VERSION = 1;

export const FONT_OPTIONS = [
  { id: "Literata", label: "Literata", stack: '"Literata", Georgia, serif' },
  { id: "Charis SIL", label: "Charis SIL", stack: '"Charis SIL", Georgia, serif' },
  { id: "Source Serif 4", label: "Source Serif 4", stack: '"Source Serif 4", Georgia, serif' },
  { id: "Merriweather", label: "Merriweather", stack: '"Merriweather", Georgia, serif' },
  { id: "Atkinson Hyperlegible", label: "Atkinson Hyperlegible", stack: '"Atkinson Hyperlegible", system-ui, sans-serif' },
];

const FONT_IDS = FONT_OPTIONS.map((f) => f.id);
const THEMES = ["warm-paper", "cool-paper", "high-contrast", "dark"];
const CONTRASTS = ["soft", "normal"];
const EINK = ["off", "reduced", "balanced", "strong"];
const MOTION = ["system", "reduced", "full"];
const MODES = ["paged", "scroll"];
const REFRESH_STYLES = ["adaptive", "flash", "wash"];

export const DEFAULT_PREFERENCES = Object.freeze({
  version: VERSION,
  fontFamily: "Literata",
  fontSize: 20, // px
  lineHeight: 1.55,
  measure: 68, // ch
  paraSpacing: 0.9, // em
  align: "left", // left | justify
  readerMode: "paged",
  theme: "warm-paper",
  contrast: "soft",
  textureStrength: 0.5, // 0..1
  margin: 28, // px, informational for layout
  einkIntensity: "balanced",
  refreshStyle: "adaptive",
  fullRefreshInterval: 6, // partial turns before a cleanup full refresh
  ghosting: 0.5, // 0..1 scales ghost opacity
  motion: "system",
  showProgress: true,
  debugEnabled: false,
});

function oneOf(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

/** Validate an arbitrary object into a safe, complete preferences object. */
export function validatePreferences(raw) {
  const d = DEFAULT_PREFERENCES;
  if (!raw || typeof raw !== "object") return { ...d };
  return {
    version: VERSION,
    fontFamily: oneOf(raw.fontFamily, FONT_IDS, d.fontFamily),
    fontSize: clamp(Math.round(toNumber(raw.fontSize, d.fontSize)), 14, 34),
    lineHeight: clamp(toNumber(raw.lineHeight, d.lineHeight), 1.2, 2.1),
    measure: clamp(Math.round(toNumber(raw.measure, d.measure)), 40, 100),
    paraSpacing: clamp(toNumber(raw.paraSpacing, d.paraSpacing), 0.2, 2),
    align: oneOf(raw.align, ["left", "justify"], d.align),
    readerMode: oneOf(raw.readerMode, MODES, d.readerMode),
    theme: oneOf(raw.theme, THEMES, d.theme),
    contrast: oneOf(raw.contrast, CONTRASTS, d.contrast),
    textureStrength: clamp(toNumber(raw.textureStrength, d.textureStrength), 0, 1),
    margin: clamp(Math.round(toNumber(raw.margin, d.margin)), 8, 80),
    einkIntensity: oneOf(raw.einkIntensity, EINK, d.einkIntensity),
    refreshStyle: oneOf(raw.refreshStyle, REFRESH_STYLES, d.refreshStyle),
    fullRefreshInterval: clamp(Math.round(toNumber(raw.fullRefreshInterval, d.fullRefreshInterval)), 0, 20),
    ghosting: clamp(toNumber(raw.ghosting, d.ghosting), 0, 1),
    motion: oneOf(raw.motion, MOTION, d.motion),
    showProgress: typeof raw.showProgress === "boolean" ? raw.showProgress : d.showProgress,
    debugEnabled: typeof raw.debugEnabled === "boolean" ? raw.debugEnabled : d.debugEnabled,
  };
}

/** Load preferences from localStorage, migrating/resetting safely. */
export function loadPreferences() {
  try {
    const rawStr = localStorage.getItem(STORAGE_KEY);
    if (!rawStr) {
      log.info("preferences:loaded", { source: "defaults" });
      return { ...DEFAULT_PREFERENCES };
    }
    const parsed = JSON.parse(rawStr);
    if (!parsed || parsed.version !== VERSION) {
      log.warn("preferences:invalid", { reason: "version-mismatch-or-empty" });
    }
    const valid = validatePreferences(parsed);
    log.info("preferences:loaded", { source: "storage" });
    return valid;
  } catch (err) {
    log.warn("preferences:invalid", { reason: (err && err.message) || "parse-error" });
    return { ...DEFAULT_PREFERENCES };
  }
}

/**
 * Persist preferences. Returns true on success.
 * Guards against localStorage being unavailable or throwing (private mode).
 */
export function savePreferences(prefs) {
  try {
    const valid = validatePreferences(prefs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
    return true;
  } catch (err) {
    log.warn("preferences:save-failed", { reason: (err && err.message) || "unknown" });
    return false;
  }
}

/** Remove stored preferences (diagnostics: reset). */
export function clearPreferences() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    log.info("preferences:cleared");
    return true;
  } catch (_) {
    return false;
  }
}

/** True if preferences were previously stored (used for the reopen hint). */
export function hasStoredPreferences() {
  try {
    return !!localStorage.getItem(STORAGE_KEY);
  } catch (_) {
    return false;
  }
}

export function fontStackFor(fontId) {
  const found = FONT_OPTIONS.find((f) => f.id === fontId);
  return found ? found.stack : DEFAULT_PREFERENCES.fontFamily;
}

```

## File content `js\renderer.js`:

```js
// Rendering: applies typography/theme preferences to the DOM and turns the
// normalized document HTML into a content element. Document HTML is already
// safe (TXT escaped, Markdown sanitized); links are post-processed so they are
// subdued and never prefetched.

import { fontStackFor } from "./preferences.js";
import { log } from "./logging.js";

/**
 * Apply preferences to CSS custom properties and data attributes.
 * @param {object} prefs
 * @param {object} els { html, reader }
 * @param {boolean} reducedMotionSystem
 */
export function applyPreferences(prefs, els, reducedMotionSystem) {
  const html = els.html;
  const reader = els.reader;

  // Theme + contrast on <html>.
  html.setAttribute("data-theme", prefs.theme);
  html.setAttribute("data-contrast", prefs.contrast);

  // Typography custom properties.
  const root = html.style;
  root.setProperty("--reader-font", fontStackFor(prefs.fontFamily));
  root.setProperty("--reader-font-size", `${prefs.fontSize}px`);
  root.setProperty("--reader-line-height", String(prefs.lineHeight));
  root.setProperty("--reader-measure", `${prefs.measure}ch`);
  root.setProperty("--reader-para-spacing", `${prefs.paraSpacing}em`);
  root.setProperty("--reader-align", prefs.align === "justify" ? "justify" : "left");
  root.setProperty("--texture-strength", String(prefs.textureStrength));
  root.setProperty("--ghost-opacity", String((0.04 + prefs.ghosting * 0.2).toFixed(3)));

  if (reader) {
    reader.setAttribute("data-mode", prefs.readerMode);
    reader.setAttribute("data-eink", prefs.einkIntensity);
    reader.setAttribute("data-progress", prefs.showProgress ? "on" : "off");
    const effectiveMotion =
      prefs.motion === "reduced" || (prefs.motion === "system" && reducedMotionSystem)
        ? "reduced"
        : "full";
    reader.setAttribute("data-motion", effectiveMotion);
  }
}

/** Make links subdued, open on explicit click, and never prefetched. */
export function processLinks(container) {
  const anchors = container.querySelectorAll("a[href]");
  anchors.forEach((a) => {
    const href = a.getAttribute("href") || "";
    // Only allow http(s), mailto and in-page anchors; neutralize anything else.
    if (!/^(https?:|mailto:|#)/i.test(href)) {
      a.removeAttribute("href");
      a.setAttribute("data-blocked-href", "1");
      return;
    }
    if (/^https?:/i.test(href)) {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
      if (!a.getAttribute("title")) a.setAttribute("title", href);
    }
  });
}

/**
 * Build a content element from the document HTML.
 * @param {object} doc normalized document
 * @returns HTMLElement
 */
export function buildContent(doc) {
  const el = document.createElement("div");
  el.className = "content";
  el.setAttribute("lang", "en");
  // Safe: TXT is escaped, Markdown is sanitized by DOMPurify.
  el.innerHTML = doc.html;
  processLinks(el);
  log.info("renderer:complete", { blocks: el.childElementCount });
  return el;
}

```

## File content `js\scroll-reader.js`:

```js
// Scroll-mode reading. A continuous column inside the scrollable stage.
// Position is preserved by scroll fraction across settings changes. Normal
// scrolling never triggers the E Ink flash (only major jumps do, coordinated
// by the app).

import { clamp } from "./utils.js";

export class ScrollReader {
  /**
   * @param {HTMLElement} scrollEl the scrolling container (stage)
   * @param {HTMLElement} hostEl   the element that holds the content column
   */
  constructor(scrollEl, hostEl) {
    this.scrollEl = scrollEl;
    this.host = hostEl;
    this.content = null;
  }

  /** Attach content for scroll reading. */
  layout(contentEl) {
    this.content = contentEl;
    contentEl.classList.remove("content--paged");
    contentEl.style.cssText = ""; // clear any paged inline styles
    this.host.replaceChildren(contentEl);
    this.scrollEl.scrollTop = 0;
  }

  getAnchorFraction() {
    const max = this.scrollEl.scrollHeight - this.scrollEl.clientHeight;
    if (max <= 0) return 0;
    return clamp(this.scrollEl.scrollTop / max, 0, 1);
  }

  setAnchorFraction(frac) {
    const max = this.scrollEl.scrollHeight - this.scrollEl.clientHeight;
    this.scrollEl.scrollTop = clamp(frac, 0, 1) * Math.max(0, max);
  }

  scrollByPage(direction) {
    const amount = this.scrollEl.clientHeight * 0.9 * direction;
    this.scrollEl.scrollBy({ top: amount, behavior: "auto" });
  }

  toStart() {
    this.scrollEl.scrollTop = 0;
  }

  toEnd() {
    this.scrollEl.scrollTop = this.scrollEl.scrollHeight;
  }
}

```

## File content `js\settings.js`:

```js
// Settings panel UI. Builds a device-like settings sheet and reports changes
// through onChange(patch). The panel never needs the network; the font list
// reflects locally bundled fonts only.

import { FONT_OPTIONS } from "./preferences.js";
import { KEYBOARD_REFERENCE } from "./accessibility.js";
import { escapeHtml } from "./utils.js";

function seg(name, current, options) {
  const buttons = options
    .map(
      (o) =>
        `<button type="button" data-seg="${name}" data-value="${o.value}" aria-pressed="${
          o.value === current ? "true" : "false"
        }">${escapeHtml(o.label)}</button>`
    )
    .join("");
  return `<div class="segmented" role="group">${buttons}</div>`;
}

function range(name, current, min, max, step, unit) {
  return `
    <input type="range" data-range="${name}" min="${min}" max="${max}" step="${step}" value="${current}">
    <span class="field__value" data-value-for="${name}">${current}${unit || ""}</span>`;
}

/**
 * @param {object} opts { getPrefs, onChange, diagnostics }
 *   diagnostics: { getLogs(), copyLogs(), clearLogs(), clearPreferences() }
 */
export function createSettingsPanel(opts) {
  const { getPrefs, onChange, diagnostics } = opts;

  function template() {
    const p = getPrefs();
    const fontOpts = FONT_OPTIONS.map(
      (f) =>
        `<option value="${escapeHtml(f.id)}" ${f.id === p.fontFamily ? "selected" : ""} style="font-family:${f.stack}">${escapeHtml(f.label)}</option>`
    ).join("");

    const themeOpts = [
      ["warm-paper", "Warm paper"],
      ["cool-paper", "Cool paper"],
      ["high-contrast", "High contrast"],
      ["dark", "Dark"],
    ]
      .map(([v, l]) => `<option value="${v}" ${p.theme === v ? "selected" : ""}>${l}</option>`)
      .join("");

    const refreshOpts = [
      ["adaptive", "Adaptive"],
      ["flash", "Flash"],
      ["wash", "Wash"],
    ]
      .map(([v, l]) => `<option value="${v}" ${p.refreshStyle === v ? "selected" : ""}>${l}</option>`)
      .join("");

    const kbd = KEYBOARD_REFERENCE.map(
      ([k, d]) => `<div><kbd>${escapeHtml(k)}</kbd> â€” ${escapeHtml(d)}</div>`
    ).join("");

    return `
      <div class="settings-scrim" data-close="scrim"></div>
      <aside class="settings" role="dialog" aria-modal="true" aria-label="Reader settings">
        <div class="settings__header">
          <span class="settings__title">Settings</span>
          <button type="button" class="icon-button" data-close="button" aria-label="Close settings">Close</button>
        </div>
        <div class="settings__body">

          <section class="settings__section">
            <h3>Reading mode</h3>
            <div class="field">
              <label>Mode</label>
              <div class="field__control">${seg("readerMode", p.readerMode, [
                { value: "paged", label: "Page" },
                { value: "scroll", label: "Scroll" },
              ])}</div>
            </div>
          </section>

          <section class="settings__section">
            <h3>Typography</h3>
            <div class="field">
              <label for="set-font">Font</label>
              <div class="field__control"><select id="set-font" class="font-select" data-select="fontFamily">${fontOpts}</select></div>
            </div>
            <div class="field">
              <label>Text size</label>
              <div class="field__control">${range("fontSize", p.fontSize, 14, 34, 1, "px")}</div>
            </div>
            <div class="field">
              <label>Line height</label>
              <div class="field__control">${range("lineHeight", p.lineHeight, 1.2, 2.1, 0.05, "")}</div>
            </div>
            <div class="field">
              <label>Line width</label>
              <div class="field__control">${range("measure", p.measure, 40, 100, 1, "ch")}</div>
            </div>
            <div class="field">
              <label>Paragraph spacing</label>
              <div class="field__control">${range("paraSpacing", p.paraSpacing, 0.2, 2, 0.1, "em")}</div>
            </div>
            <div class="field">
              <label>Alignment</label>
              <div class="field__control">${seg("align", p.align, [
                { value: "left", label: "Left" },
                { value: "justify", label: "Justify" },
              ])}</div>
            </div>
          </section>

          <section class="settings__section">
            <h3>Display</h3>
            <div class="field">
              <label for="set-theme">Paper</label>
              <div class="field__control"><select id="set-theme" data-select="theme">${themeOpts}</select></div>
            </div>
            <div class="field">
              <label>Contrast</label>
              <div class="field__control">${seg("contrast", p.contrast, [
                { value: "soft", label: "Soft" },
                { value: "normal", label: "Normal" },
              ])}</div>
            </div>
            <div class="field">
              <label>Texture</label>
              <div class="field__control">${range("textureStrength", p.textureStrength, 0, 1, 0.1, "")}</div>
            </div>
            <div class="field">
              <label>Margins</label>
              <div class="field__control">${range("margin", p.margin, 8, 80, 2, "px")}</div>
            </div>
          </section>

          <section class="settings__section">
            <h3>E Ink behavior</h3>
            <div class="field">
              <label>Intensity</label>
              <div class="field__control">${seg("einkIntensity", p.einkIntensity, [
                { value: "off", label: "Off" },
                { value: "reduced", label: "Reduced" },
                { value: "balanced", label: "Balanced" },
                { value: "strong", label: "Strong" },
              ])}</div>
            </div>
            <div class="field">
              <label for="set-refresh">Refresh style</label>
              <div class="field__control"><select id="set-refresh" data-select="refreshStyle">${refreshOpts}</select></div>
            </div>
            <div class="field">
              <label>Full refresh every</label>
              <div class="field__control">${range("fullRefreshInterval", p.fullRefreshInterval, 0, 20, 1, " turns")}</div>
            </div>
            <div class="field">
              <label>Ghosting</label>
              <div class="field__control">${range("ghosting", p.ghosting, 0, 1, 0.1, "")}</div>
            </div>
          </section>

          <section class="settings__section">
            <h3>Accessibility</h3>
            <div class="field">
              <label>Motion</label>
              <div class="field__control">${seg("motion", p.motion, [
                { value: "system", label: "System" },
                { value: "reduced", label: "Reduced" },
                { value: "full", label: "Full" },
              ])}</div>
            </div>
            <div class="field">
              <label for="set-progress">Show progress</label>
              <div class="field__control">${seg("showProgress", p.showProgress ? "on" : "off", [
                { value: "on", label: "On" },
                { value: "off", label: "Off" },
              ])}</div>
            </div>
            <div class="kbd-ref">${kbd}</div>
          </section>

          <section class="settings__section">
            <details>
              <summary>Advanced diagnostics</summary>
              <div class="field">
                <label>Debug mode</label>
                <div class="field__control">${seg("debugEnabled", p.debugEnabled ? "on" : "off", [
                  { value: "on", label: "On" },
                  { value: "off", label: "Off" },
                ])}</div>
              </div>
              <div class="log-view" data-log-view>Enable debug mode to view logs.</div>
              <div class="settings__footer" style="padding-left:0;padding-right:0;border-top:none;">
                <button type="button" class="button" data-action="copy-logs">Copy logs</button>
                <button type="button" class="button" data-action="clear-logs">Clear logs</button>
                <button type="button" class="button" data-action="reset-prefs">Reset preferences</button>
              </div>
            </details>
          </section>

        </div>
      </aside>`;
  }

  function wire(container, closeFn) {
    // Segmented controls.
    container.querySelectorAll("[data-seg]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const name = btn.getAttribute("data-seg");
        let value = btn.getAttribute("data-value");
        // Reflect pressed state within the group.
        container
          .querySelectorAll(`[data-seg="${name}"]`)
          .forEach((b) => b.setAttribute("aria-pressed", b === btn ? "true" : "false"));
        const patch = {};
        if (name === "showProgress") patch.showProgress = value === "on";
        else if (name === "debugEnabled") patch.debugEnabled = value === "on";
        else patch[name] = value;
        onChange(patch);
        if (name === "debugEnabled") refreshLogs();
      });
    });

    // Selects.
    container.querySelectorAll("[data-select]").forEach((sel) => {
      sel.addEventListener("change", () => {
        onChange({ [sel.getAttribute("data-select")]: sel.value });
      });
    });

    // Ranges (live update label; commit on input).
    container.querySelectorAll("[data-range]").forEach((rng) => {
      const name = rng.getAttribute("data-range");
      const label = container.querySelector(`[data-value-for="${name}"]`);
      const unit = (label && label.textContent.replace(/^[\d.]+/, "")) || "";
      rng.addEventListener("input", () => {
        const num = Number(rng.value);
        if (label) label.textContent = `${num}${unit}`;
        onChange({ [name]: num });
      });
    });

    // Close actions.
    container.querySelectorAll("[data-close]").forEach((el) => {
      el.addEventListener("click", closeFn);
    });

    // Diagnostics.
    const copyBtn = container.querySelector('[data-action="copy-logs"]');
    const clearBtn = container.querySelector('[data-action="clear-logs"]');
    const resetBtn = container.querySelector('[data-action="reset-prefs"]');
    if (copyBtn) copyBtn.addEventListener("click", () => diagnostics.copyLogs());
    if (clearBtn)
      clearBtn.addEventListener("click", () => {
        diagnostics.clearLogs();
        refreshLogs();
      });
    if (resetBtn) resetBtn.addEventListener("click", () => diagnostics.clearPreferences());
  }

  let logViewEl = null;
  function refreshLogs() {
    if (!logViewEl) return;
    const p = getPrefs();
    if (!p.debugEnabled) {
      logViewEl.textContent = "Enable debug mode to view logs.";
      return;
    }
    const entries = diagnostics.getLogs();
    logViewEl.textContent = entries
      .slice(-60)
      .map((e) => `${e.t.slice(11, 19)} ${e.level} ${e.event}`)
      .join("\n");
  }

  /**
   * Render the panel into container. Returns { close } via closeFn passed by app.
   */
  function render(container, closeFn) {
    container.innerHTML = template();
    logViewEl = container.querySelector("[data-log-view]");
    wire(container, closeFn);
    refreshLogs();
    return container.querySelector(".settings");
  }

  return { render, refreshLogs };
}

```

## File content `js\state.js`:

```js
// Centralized app state and a tiny event bus. Keeps behavior auditable without
// a framework. document.sourceText lives here in memory only for the active
// session and is never persisted.

import { DEFAULT_PREFERENCES } from "./preferences.js";

export const appState = {
  document: {
    loaded: false,
    id: null,
    fileName: null,
    fileType: null, // "text" | "markdown"
    title: null,
    characterCount: 0,
    wordEstimate: 0,
    sections: [], // [{ id, heading, level, html }]
    sourceText: null, // session-only; never persisted
  },
  reader: {
    mode: "paged",
    currentPageIndex: 0,
    pageCount: 0,
    scrollAnchor: 0, // fraction 0..1 for position preservation
    layoutReady: false,
    partialsSinceFull: 0,
  },
  preferences: { ...DEFAULT_PREFERENCES },
  ui: {
    settingsOpen: false,
    busy: false,
    lastError: null,
    debugEnabled: false,
    reducedMotionSystem: false,
  },
};

// Minimal event bus.
const listeners = new Map();

export function on(event, handler) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event).add(handler);
  return () => listeners.get(event).delete(handler);
}

export function emit(event, payload) {
  const set = listeners.get(event);
  if (!set) return;
  set.forEach((handler) => {
    try {
      handler(payload);
    } catch (err) {
      // Surface handler errors without breaking the emit loop.
      console.error(`[eink] listener for "${event}" threw`, err);
    }
  });
}

export const Events = {
  DOCUMENT_LOADED: "document:loaded",
  DOCUMENT_CLEARED: "document:cleared",
  PREFERENCES_CHANGED: "preferences:changed",
  MODE_CHANGED: "mode:changed",
  PAGE_CHANGED: "page:changed",
  SETTINGS_TOGGLED: "settings:toggled",
  ERROR: "error",
};

/** Reset document state without persisting anything. */
export function clearDocument() {
  appState.document = {
    loaded: false,
    id: null,
    fileName: null,
    fileType: null,
    title: null,
    characterCount: 0,
    wordEstimate: 0,
    sections: [],
    sourceText: null,
  };
  appState.reader.currentPageIndex = 0;
  appState.reader.pageCount = 0;
  appState.reader.scrollAnchor = 0;
  appState.reader.layoutReady = false;
}

```

## File content `js\utils.js`:

```js
// Small, dependency-free helpers shared across modules.

/** Clamp a number into an inclusive range. */
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/** Coerce to a finite number or return the fallback. */
export function toNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** Escape text so it can be safely inserted as HTML text content. */
export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Trailing debounce. */
export function debounce(fn, wait) {
  let timer = null;
  return function debounced(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn.apply(this, args);
    }, wait);
  };
}

/** Session-only id. Never used to persist content. */
export function generateId() {
  return "s-" + Math.random().toString(36).slice(2, 10) + "-" + Date.now().toString(36);
}

/** Get a file extension in lower case, without the dot. */
export function fileExtension(name) {
  const match = /\.([a-z0-9]+)$/i.exec(name || "");
  return match ? match[1].toLowerCase() : "";
}

/** Resolve after the next paint (two rAFs) so layout/animation classes apply. */
export function nextFrame() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

/** Wait for a fixed number of milliseconds. */
export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Rough word count without holding onto the text. */
export function estimateWords(text) {
  const trimmed = (text || "").trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/** True if the string looks like binary content (has null/control bytes). */
export function looksBinary(sample) {
  if (!sample) return false;
  let suspicious = 0;
  const len = Math.min(sample.length, 4000);
  for (let i = 0; i < len; i += 1) {
    const code = sample.charCodeAt(i);
    if (code === 0) return true;
    // control chars excluding tab, LF, CR, form feed
    if (code < 9 || (code > 13 && code < 32)) suspicious += 1;
  }
  return suspicious / Math.max(1, len) > 0.02;
}

```

## File content `LICENSES.md`:

# Licenses

This project bundles third-party code and fonts locally so the app runs fully
offline. Each vendored file is recorded in
[`scripts/vendor-manifest.json`](scripts/vendor-manifest.json) with its upstream
source, version, size, and SHA-256 hash. Run `node scripts/vendor-check.mjs` to
verify integrity.

The application's own source code (everything under `css/`, `js/`, `index.html`,
`scripts/`, and `tests/`) is part of this repository and follows the repository
license.

## Runtime dependencies

| Dependency | Version | License | Local files |
| ---------- | ------- | ------- | ----------- |
| [markdown-it](https://github.com/markdown-it/markdown-it) | 14.1.0 | MIT | `vendor/markdown-it/markdown-it.js`, `vendor/markdown-it/LICENSE` |
| [DOMPurify](https://github.com/cure53/DOMPurify) | 3.1.6 | Apache-2.0 OR MPL-2.0 | `vendor/dompurify/purify.js`, `vendor/dompurify/LICENSE` |

Both are vendored as readable, **unminified** source.

## Fonts

All bundled fonts are licensed under the **SIL Open Font License, Version 1.1**.
The full license text for each family is stored under
`assets/fonts/licenses/`.

| Family | Role | License file |
| ------ | ---- | ------------ |
| [Literata](https://fonts.google.com/specimen/Literata) | Default reading serif (variable) | `assets/fonts/licenses/Literata-OFL.txt` |
| [Source Serif 4](https://github.com/adobe-fonts/source-serif) | Alternate serif (variable) | `assets/fonts/licenses/SourceSerif4-OFL.txt` |
| [Charis SIL](https://software.sil.org/charis/) | Alternate serif | `assets/fonts/licenses/CharisSIL-OFL.txt` |
| [Merriweather](https://github.com/SorkinType/Merriweather) | Alternate serif | `assets/fonts/licenses/Merriweather-OFL.txt` |
| [Atkinson Hyperlegible](https://www.brailleinstitute.org/freefont/) | Legible UI / accessibility font | `assets/fonts/licenses/AtkinsonHyperlegible-OFL.txt` |

Font WOFF2 files were obtained from the [Fontsource](https://fontsource.org/)
distributions of these open-licensed families; the exact upstream URLs are
recorded in the vendor manifest.

## SIL Open Font License summary

The OFL permits use, study, modification, and redistribution of the fonts,
including bundling with software, provided the fonts are not sold by themselves
and the license and copyright notice are retained. The retained license texts
under `assets/fonts/licenses/` satisfy this requirement.


## File content `playwright.config.mjs`:

```js
// Playwright configuration for the E Ink reader.
//
// Playwright is an OPTIONAL developer/test dependency â€” it is never required to
// run the app. If Playwright is not installed, skip these tests and validate in
// a browser manually (see README).
//
// The config starts the dependency-free static server (scripts/serve-static.mjs)
// and runs the specs against it in Chromium. Run with:
//   npx playwright test            (if @playwright/test is available)

import { defineConfig, devices } from "@playwright/test";

const PORT = 8123;

export default defineConfig({
  testDir: "./tests/playwright",
  timeout: 30_000,
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "off",
  },
  webServer: {
    command: `node scripts/serve-static.mjs ${PORT}`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: true,
    timeout: 15_000,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1200, height: 800 } } },
    { name: "mobile", use: { ...devices["Pixel 5"] } },
  ],
});

```

## File content `README.md`:

# E Ink Reader

A calm, local-first reading surface for your own `.txt`, `.md`, and `.markdown`
files. It renders plain text and (safe) Markdown as an E Ink-style page, with a
page-turn mode, a scroll mode, local fonts, and a realistic screen-refresh
effect.

Everything runs locally in the browser. There is **no build step, no server, no
account, and no network access at runtime**. Open `index.html` and read.

## Quick start

Open `index.html` directly in a modern browser, or serve the folder statically:

```bash
node scripts/serve-static.mjs 8123
# then visit http://localhost:8123/
```

Then open a file with the **Open** button or by dragging a `.txt`, `.md`, or
`.markdown` file onto the window.

## What it does

- **Local files only.** Open a single text or Markdown file via file picker or
  drag-and-drop. Nothing is uploaded.
- **Two reading modes.** A paginated *page mode* with page turns, and a
  continuous *scroll mode*. Your position is preserved when you switch.
- **E Ink simulation.** Page turns and major changes use a brief grayscale wash
  and ghosting reminiscent of electronic paper. Respects `prefers-reduced-motion`.
- **Reading-first typography.** Local Literata by default, plus other bundled
  serif and legible fonts; adjustable size, line height, measure (line width),
  paragraph spacing, and alignment.
- **Safe Markdown.** Raw HTML is never executed or rendered as trusted markup,
  images are shown as non-fetching placeholders, and links never prefetch.
- **Themes.** Warm paper, cool paper, dark, and high-contrast, with a soft/normal
  contrast toggle.
- **Private by design.** Book content lives in memory only and is never stored.
  Only your preferences are saved (in `localStorage`). Reopen your file each
  session.
- **Accessible + responsive.** Keyboard navigation, focus management, live
  region progress, and tested desktop / tablet / mobile layouts.

## Privacy and storage

- Book/document content is **never** persisted â€” not to `localStorage`, not to
  disk, not to any server.
- Only reading **preferences** are saved, under the single key
  `eink-reader:preferences`. They are validated and clamped on load.
- Because content is not stored, you reopen your file each session by design.

## Offline / static guarantees

- No runtime network requests. The page ships a strict Content-Security-Policy
  with `connect-src 'none'`.
- All dependencies and fonts are **vendored locally** and unminified/readable
  (see `vendor/` and `assets/fonts/`). Nothing loads from a CDN at runtime.
- Runtime dependencies: [markdown-it](https://github.com/markdown-it/markdown-it)
  (Markdown parsing, HTML disabled) and
  [DOMPurify](https://github.com/cure53/DOMPurify) (sanitization).

## Keyboard shortcuts

| Key | Action |
| --- | ------ |
| `â†’` / `PageDown` / `Space` | Next page |
| `â†` / `PageUp` | Previous page |
| `Home` / `End` | First / last page |
| `o` | Open a file |
| `s` | Open settings |
| `Esc` | Close settings |

(In scroll mode, the page keys scroll by a screenful.)

## Project layout

```
index.html            Entry point (loads vendored deps, then app modules)
css/                  reset, base (tokens/themes), reader, eink, settings, responsive
js/                   app + focused modules (parser, renderer, paginator, eink, etc.)
assets/fonts/         Vendored WOFF2 fonts + OFL licenses + @font-face declarations
assets/textures/      Paper-grain SVG
vendor/               markdown-it and DOMPurify (unminified) + LICENSE files
scripts/              serve-static, vendor-manifest.json, vendor-check, vendor-fetch
tests/                fixtures + Playwright specs + a dependency-tolerant smoke runner
specs/                Design note + persona scenarios + generated acceptance todos
```

## Development scripts

These are optional developer tools. They are **not** required to run the app.

```bash
# Serve the folder statically (dependency-free)
node scripts/serve-static.mjs 8123

# Verify every vendored dependency/font matches the manifest (size + sha256)
node scripts/vendor-check.mjs

# Download any missing vendored file from its documented upstream (skips existing)
node scripts/vendor-fetch.mjs
```

## Testing

Automated behavior tests live in `tests/`:

- `tests/playwright/reader.spec.js` â€” the canonical suite written for the
  standard Playwright test runner. Run with:

  ```bash
  npm i -D @playwright/test
  npx playwright test
  ```

- `tests/smoke.mjs` â€” a dependency-tolerant runner that uses whichever
  `playwright` library is resolvable, so the acceptance-critical behaviors can be
  verified even where the `@playwright/test` runner package is not installed:

  ```bash
  node scripts/serve-static.mjs 8123      # in one terminal
  node tests/smoke.mjs                      # in another
  ```

Both cover: local file loading, TXT/Markdown rendering, stable pagination,
page/scroll navigation, Markdown safety (no script execution, no image fetch),
code-block containment, empty/unsupported-file recovery, preference persistence
**without** book-content persistence, reduced motion, and the no-network runtime.

Some qualities â€” whether the E Ink effect feels credible and the reading surface
is comfortable â€” require manual visual inspection on desktop and mobile.

## Licenses

See [LICENSES.md](LICENSES.md) for the license of every vendored dependency and
font. All bundled fonts are under the SIL Open Font License 1.1.


## File content `scripts\serve-static.mjs`:

```js
// Minimal static file server for local development and tests.
// No dependencies. Usage: node scripts/serve-static.mjs [port]
// Not required to run the app â€” you can also open index.html directly.

import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = normalize(join(__dirname, ".."));
const port = Number(process.argv[2]) || 8123;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".markdown": "text/markdown; charset=utf-8",
  ".pdf": "application/pdf",
};

const server = http.createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    let filePath = normalize(join(root, urlPath));
    if (!filePath.startsWith(root)) {
      res.writeHead(403).end("Forbidden");
      return;
    }
    let info;
    try {
      info = await stat(filePath);
    } catch {
      res.writeHead(404).end("Not found");
      return;
    }
    if (info.isDirectory()) filePath = join(filePath, "index.html");
    const data = await readFile(filePath);
    const type = TYPES[extname(filePath)] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    res.end(data);
  } catch (err) {
    res.writeHead(500).end("Server error");
  }
});

server.listen(port, () => {
  console.log(`Static server: http://localhost:${port}/`);
});

```

## File content `scripts\vendor-check.mjs`:

```js
// Verifies that every vendored runtime dependency and font recorded in
// scripts/vendor-manifest.json exists locally and matches its recorded size
// and SHA-256 hash. This guards the offline/static runtime guarantee: the app
// must ship with readable, unmodified local copies of all dependencies.
//
// Usage (from the project root):
//   node scripts/vendor-check.mjs
//
// Exit code 0 = all files present and intact. Non-zero = a problem was found.
// This is an optional developer tool; it is never required at runtime.

import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(here, "..");
const manifestPath = join(here, "vendor-manifest.json");

function sha256(filePath) {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

function main() {
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch (err) {
    console.error(`Could not read manifest at ${manifestPath}: ${err.message}`);
    process.exit(2);
  }

  const problems = [];
  let ok = 0;

  for (const item of manifest.items) {
    const abs = join(projectRoot, item.path);
    let stat;
    try {
      stat = statSync(abs);
    } catch {
      problems.push(`MISSING   ${item.path} (${item.name})`);
      continue;
    }
    if (item.bytes != null && stat.size !== item.bytes) {
      problems.push(`SIZE      ${item.path}: expected ${item.bytes} bytes, found ${stat.size}`);
      continue;
    }
    if (item.sha256) {
      const actual = sha256(abs);
      if (actual !== item.sha256) {
        problems.push(`HASH      ${item.path}: sha256 mismatch`);
        continue;
      }
    }
    // License file presence (recorded per item).
    if (item.licenseFile) {
      try {
        statSync(join(projectRoot, item.licenseFile));
      } catch {
        problems.push(`LICENSE   ${item.path}: missing license file ${item.licenseFile}`);
        continue;
      }
    }
    ok += 1;
  }

  console.log(`vendor-check: ${ok}/${manifest.items.length} vendored files verified.`);
  if (problems.length) {
    console.error(`\n${problems.length} problem(s):`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
  console.log("All vendored dependencies and fonts are present and intact.");
}

main();

```

## File content `scripts\vendor-fetch.mjs`:

```js
// Optional developer helper: downloads any vendored dependency or font listed
// in scripts/vendor-manifest.json that is missing locally, pulling from the
// documented upstreamUrl. Existing files are skipped by default and reported;
// nothing is overwritten silently. This tool is NEVER used at runtime â€” the app
// always loads the local vendored copies only.
//
// Usage (from the project root):
//   node scripts/vendor-fetch.mjs          # download only missing files
//   node scripts/vendor-fetch.mjs --force  # re-download everything (overwrite)

import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { readFileSync } from "node:fs";

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(here, "..");
const force = process.argv.includes("--force");

async function download(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const manifest = JSON.parse(readFileSync(join(here, "vendor-manifest.json"), "utf8"));
  let fetched = 0;
  let skipped = 0;
  for (const item of manifest.items) {
    const abs = join(projectRoot, item.path);
    if (existsSync(abs) && !force) {
      console.log(`skip     ${item.path} (already present)`);
      skipped += 1;
      continue;
    }
    try {
      const buf = await download(item.upstreamUrl);
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, buf);
      console.log(`fetched  ${item.path}  <- ${item.upstreamUrl}`);
      fetched += 1;
    } catch (err) {
      console.error(`FAILED   ${item.path}: ${err.message}`);
    }
  }
  console.log(`\nDone. fetched=${fetched} skipped=${skipped}`);
  console.log("Run 'node scripts/vendor-check.mjs' to verify integrity, then update");
  console.log("the manifest hashes if you intentionally changed a vendored file.");
}

main();

```

## File content `scripts\vendor-manifest.json`:

```json
{
  "note": "Records every vendored runtime dependency and font. Runtime uses only these local files; upstreamUrl documents where each file came from. Verify integrity with scripts/vendor-check.mjs.",
  "generated": "2026-07-03",
  "items": [
    {
      "name": "markdown-it",
      "version": "14.1.0",
      "path": "vendor/markdown-it/markdown-it.js",
      "upstreamUrl": "https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/dist/markdown-it.js",
      "license": "MIT",
      "licenseFile": "vendor/markdown-it/LICENSE",
      "bytes": 298975,
      "sha256": "433ba2a6946e8200c464d8845b98d826022a1836b4a713f01fa2830477c381e8"
    },
    {
      "name": "dompurify",
      "version": "3.1.6",
      "path": "vendor/dompurify/purify.js",
      "upstreamUrl": "https://cdn.jsdelivr.net/npm/dompurify@3.1.6/dist/purify.js",
      "license": "Apache-2.0 OR MPL-2.0",
      "licenseFile": "vendor/dompurify/LICENSE",
      "bytes": 67137,
      "sha256": "94970cb00c8ee97b3cb7d0932c0cb6eb19d3185d5465948ced5fecb9c1cbc99a"
    },
    {
      "name": "Literata",
      "version": "fontsource-variable",
      "path": "assets/fonts/literata/Literata-Variable.woff2",
      "upstreamUrl": "https://cdn.jsdelivr.net/fontsource/fonts/literata:vf@latest/latin-wght-normal.woff2",
      "license": "OFL-1.1",
      "licenseFile": "assets/fonts/licenses/Literata-OFL.txt",
      "bytes": 52496,
      "sha256": "9adbeac5b167fe5ad6c49d9e29aa0c76e2f1bb3b46bf4ebf12a9eca7d3525384"
    },
    {
      "name": "Literata Italic",
      "version": "fontsource-variable",
      "path": "assets/fonts/literata/Literata-Italic-Variable.woff2",
      "upstreamUrl": "https://cdn.jsdelivr.net/fontsource/fonts/literata:vf@latest/latin-wght-italic.woff2",
      "license": "OFL-1.1",
      "licenseFile": "assets/fonts/licenses/Literata-OFL.txt",
      "bytes": 53728,
      "sha256": "ab198d6616c7cc966f26a4a5b28a3977dc47439640f09d9b3361226bd465c404"
    },
    {
      "name": "Source Serif 4",
      "version": "fontsource-variable",
      "path": "assets/fonts/source-serif-4/SourceSerif4-Variable.woff2",
      "upstreamUrl": "https://cdn.jsdelivr.net/fontsource/fonts/source-serif-4:vf@latest/latin-wght-normal.woff2",
      "license": "OFL-1.1",
      "licenseFile": "assets/fonts/licenses/SourceSerif4-OFL.txt",
      "bytes": 50824,
      "sha256": "c1df4596be5029233ed2afbb8b2f6ea20784b3fb1aa5d6b5c6519ccd85eb3dfb"
    },
    {
      "name": "Source Serif 4 Italic",
      "version": "fontsource-variable",
      "path": "assets/fonts/source-serif-4/SourceSerif4-Italic-Variable.woff2",
      "upstreamUrl": "https://cdn.jsdelivr.net/fontsource/fonts/source-serif-4:vf@latest/latin-wght-italic.woff2",
      "license": "OFL-1.1",
      "licenseFile": "assets/fonts/licenses/SourceSerif4-OFL.txt",
      "bytes": 51516,
      "sha256": "663e7ef3037a56dce81dfc33f68c1e6445995ffd8887991b3c0b68a7689c9da5"
    },
    {
      "name": "Charis SIL",
      "version": "fontsource",
      "path": "assets/fonts/charis-sil/CharisSIL-Regular.woff2",
      "upstreamUrl": "https://cdn.jsdelivr.net/fontsource/fonts/charis-sil@latest/latin-400-normal.woff2",
      "license": "OFL-1.1",
      "licenseFile": "assets/fonts/licenses/CharisSIL-OFL.txt",
      "bytes": 22576,
      "sha256": "1bbdc8d4124dc3d8d4bda1c057dea874ceb1298d499b3747c44279c8f288db96"
    },
    {
      "name": "Charis SIL Italic",
      "version": "fontsource",
      "path": "assets/fonts/charis-sil/CharisSIL-Italic.woff2",
      "upstreamUrl": "https://cdn.jsdelivr.net/fontsource/fonts/charis-sil@latest/latin-400-italic.woff2",
      "license": "OFL-1.1",
      "licenseFile": "assets/fonts/licenses/CharisSIL-OFL.txt",
      "bytes": 23776,
      "sha256": "03a2701106f9e0054808d2617cc3b1404a9b1fa69f14130d654e26f412f244be"
    },
    {
      "name": "Charis SIL Bold",
      "version": "fontsource",
      "path": "assets/fonts/charis-sil/CharisSIL-Bold.woff2",
      "upstreamUrl": "https://cdn.jsdelivr.net/fontsource/fonts/charis-sil@latest/latin-700-normal.woff2",
      "license": "OFL-1.1",
      "licenseFile": "assets/fonts/licenses/CharisSIL-OFL.txt",
      "bytes": 22344,
      "sha256": "559166334cfb2548920c55c1922e601c17a4bb34160afac03a4f69fbc6e42279"
    },
    {
      "name": "Charis SIL Bold Italic",
      "version": "fontsource",
      "path": "assets/fonts/charis-sil/CharisSIL-BoldItalic.woff2",
      "upstreamUrl": "https://cdn.jsdelivr.net/fontsource/fonts/charis-sil@latest/latin-700-italic.woff2",
      "license": "OFL-1.1",
      "licenseFile": "assets/fonts/licenses/CharisSIL-OFL.txt",
      "bytes": 24144,
      "sha256": "61e9de4018a1a2535f4862d3fecbc54ae8d8a8f3d905de7e94a245405ac8ac26"
    },
    {
      "name": "Merriweather",
      "version": "fontsource",
      "path": "assets/fonts/merriweather/Merriweather-Regular.woff2",
      "upstreamUrl": "https://cdn.jsdelivr.net/fontsource/fonts/merriweather@latest/latin-400-normal.woff2",
      "license": "OFL-1.1",
      "licenseFile": "assets/fonts/licenses/Merriweather-OFL.txt",
      "bytes": 49168,
      "sha256": "66f5bd22d738a801a9e58d71920559743b0baaced04be299e3c4feca3dce3556"
    },
    {
      "name": "Merriweather Italic",
      "version": "fontsource",
      "path": "assets/fonts/merriweather/Merriweather-Italic.woff2",
      "upstreamUrl": "https://cdn.jsdelivr.net/fontsource/fonts/merriweather@latest/latin-400-italic.woff2",
      "license": "OFL-1.1",
      "licenseFile": "assets/fonts/licenses/Merriweather-OFL.txt",
      "bytes": 51836,
      "sha256": "051559ee0644cd647c8f654cffea1d1a5ce601e573af21d0984528563fb476f6"
    },
    {
      "name": "Merriweather Bold",
      "version": "fontsource",
      "path": "assets/fonts/merriweather/Merriweather-Bold.woff2",
      "upstreamUrl": "https://cdn.jsdelivr.net/fontsource/fonts/merriweather@latest/latin-700-normal.woff2",
      "license": "OFL-1.1",
      "licenseFile": "assets/fonts/licenses/Merriweather-OFL.txt",
      "bytes": 48660,
      "sha256": "4e1ab49396c02be0d9a2a25eed7bc73781c047d85fcb5dfc2889873eaf992b09"
    },
    {
      "name": "Atkinson Hyperlegible",
      "version": "fontsource",
      "path": "assets/fonts/atkinson-hyperlegible/AtkinsonHyperlegible-Regular.woff2",
      "upstreamUrl": "https://cdn.jsdelivr.net/fontsource/fonts/atkinson-hyperlegible@latest/latin-400-normal.woff2",
      "license": "OFL-1.1",
      "licenseFile": "assets/fonts/licenses/AtkinsonHyperlegible-OFL.txt",
      "bytes": 17208,
      "sha256": "d64ba838ef5472bba248620ec4fd8b5aa7cf0db2908e0bb230600caf279ba7bc"
    },
    {
      "name": "Atkinson Hyperlegible Italic",
      "version": "fontsource",
      "path": "assets/fonts/atkinson-hyperlegible/AtkinsonHyperlegible-Italic.woff2",
      "upstreamUrl": "https://cdn.jsdelivr.net/fontsource/fonts/atkinson-hyperlegible@latest/latin-400-italic.woff2",
      "license": "OFL-1.1",
      "licenseFile": "assets/fonts/licenses/AtkinsonHyperlegible-OFL.txt",
      "bytes": 18292,
      "sha256": "bc8825fd435d4aa8e31449937826d583a7daaae15a83832c91b38375131ebf08"
    },
    {
      "name": "Atkinson Hyperlegible Bold",
      "version": "fontsource",
      "path": "assets/fonts/atkinson-hyperlegible/AtkinsonHyperlegible-Bold.woff2",
      "upstreamUrl": "https://cdn.jsdelivr.net/fontsource/fonts/atkinson-hyperlegible@latest/latin-700-normal.woff2",
      "license": "OFL-1.1",
      "licenseFile": "assets/fonts/licenses/AtkinsonHyperlegible-OFL.txt",
      "bytes": 17524,
      "sha256": "140e2bd25a7315c8a062508391426b0d8c3297400c947b8d847be28f73a199f0"
    },
    {
      "name": "Atkinson Hyperlegible Bold Italic",
      "version": "fontsource",
      "path": "assets/fonts/atkinson-hyperlegible/AtkinsonHyperlegible-BoldItalic.woff2",
      "upstreamUrl": "https://cdn.jsdelivr.net/fontsource/fonts/atkinson-hyperlegible@latest/latin-700-italic.woff2",
      "license": "OFL-1.1",
      "licenseFile": "assets/fonts/licenses/AtkinsonHyperlegible-OFL.txt",
      "bytes": 18484,
      "sha256": "73e0c9e1e284128dda599558f7c15bd5f3c056442c31dfae950528a16b3835cf"
    }
  ]
}

```

## File content `specs\eink-reader-design-note.md`:

Date: 2026-07-03

---

A00 E Ink Reader Design Note For Autonomous Coding Agent

---

Build a static, local-first E Ink-style reader for `.txt` and Markdown files.

The app is a plain browser application made from HTML, CSS, JavaScript, and local assets. It must run from static files. It must not require npm, a bundler, a framework, a server, a database, or a build step. It may include optional developer scripts for downloading, verifying, and documenting vendored dependencies, but the runtime app itself must remain static and directly inspectable.

The app lets the user open a local book file through a file picker or by dragging and dropping the file into the page. The supported file formats are plain text and Markdown only. The app does not store imported book contents in IndexedDB, localStorage, sessionStorage, Cache Storage, cookies, or any other persistence layer. The user must reopen the book file each session. The app may persist user preferences, but not the book text.

The experience should imitate a real E Ink reading device as closely as practical on a normal LCD or OLED screen. The target is not a novelty animation. The target is a credible reading surface: grayscale rendering, matte paper tone, lower contrast, typographic calm, page settling, ghosting, flashing refresh, partial refresh behavior, and slow physical-feeling transitions. E Ink displays use charged pigment particles moving inside microcapsules, and that physical model should influence the simulation: changes should feel like pigment settling, not like a standard web fade. E Ink has global and partial update behaviors, and partial update behavior can leave ghosting or residual artifacts. Use this as the conceptual model for the effect. See the official E Ink technology explanation and e-paper refresh references for background.

The default reading font is Literata. Literata is suitable because it is a long-form digital reading serif and is available under the SIL Open Font License. The app must also let the user choose other bundled fonts from settings. All fonts must be downloaded, vendored, loaded locally, and accompanied by license files or license notes. No font may load from Google Fonts, Fontsource, CDN, or any external host at runtime.

The app must include settings for reading mode, typography, E Ink simulation intensity, page/scroll behavior, theme, spacing, and accessibility. The app must behave well on desktop, tablet, and mobile screens. It must be usable with keyboard, mouse, touch, and basic assistive technologies.

The coding agent must work autonomously. Use this design note as the source of direction, then make implementation decisions using best judgment. Do not stop for permission when a reasonable decision can be made from the requirements. When a decision is uncertain, research, compare options, choose the option that best satisfies the product goal, implement it, validate it, and revise if the validation shows the decision was wrong.

---

B00 Product Identity

---

This is an E Ink reading simulator, not a general document editor, not a Markdown authoring tool, not a file manager, and not a cloud reader.

The product should feel like opening a small standalone reading device in the browser. The user opens the page, drops a book file, adjusts the reading surface, and reads. Every interaction should preserve the illusion of a device-like reading environment.

The app should be quiet. The interface should not compete with the text. Controls should be visible when needed and unobtrusive while reading. The default state should prioritize reading immediately after a file is loaded.

The visual design should avoid common web-app cues that break the E Ink illusion. Avoid bright saturated colors, glossy gradients, sharp neon focus rings, heavy shadows, and excessive animation. Use restrained grayscale, paper-like warmth, subtle borders, and slow physical transitions.

The app should not pretend to be a real E Ink display. It should simulate the experience honestly and robustly on a normal screen. If a browser lacks advanced APIs, the app should degrade to a simpler but still readable experience.

The coding agent must treat visual quality as a core requirement, not polish. After implementing a visual feature, inspect it in a browser, test it with sample files, and refine it until it supports reading rather than distracting from reading.

---

C00 User Manual View Of The Finished App

---

The user opens `index.html` in a browser or serves the folder from a local static server.

The first screen shows a calm drop zone and a file picker button. It explains that only `.txt`, `.md`, and `.markdown` files are supported. It also states that the file is read locally in the browser and is not uploaded anywhere. This must be true.

The user drops or selects a file. The app validates the file type, reads the file, detects whether it is TXT or Markdown, parses it, normalizes the content, and enters the reader.

The reader shows the book content in either page mode or scroll mode. Page mode displays one page-like viewport at a time with next and previous navigation. Scroll mode displays a continuous reading column. The user can switch modes in settings.

The reader has an E Ink transition effect. In page mode, moving to the next or previous page should trigger a refresh-like transition. In scroll mode, major content jumps, file load, settings changes, and layout recalculation should also trigger a refresh-like transition. Font changes, theme changes, spacing changes, mode changes, and Markdown re-rendering should all use the E Ink transition unless motion is reduced or disabled.

The user can open settings. Settings allow font selection, font size, line height, page width, margins, theme, contrast, E Ink effect intensity, motion behavior, page mode versus scroll mode, and reading controls.

The user can close settings and continue reading. Preferences persist locally. The imported book content does not persist. If the user reloads the page or opens the app later, the app restores preferences but asks the user to reopen the book file.

The app must provide clear errors. If the file cannot be read, is too large, has an unsupported type, is invalid text, or Markdown parsing fails, the app shows a human-readable error with a safe next action. Do not fail silently. Do not expose raw stack traces to normal users. Keep technical detail available through developer logs and optional debug panel.

The coding agent must build and test the app from this user journey. Every feature should be validated against this flow before it is considered complete.

---

D00 Non-Negotiable Constraints

---

The runtime app must be static HTML, CSS, JavaScript, and assets.

No npm is allowed for the app. Do not create a runtime architecture that depends on `node_modules`, package resolution, bundling, Vite, Webpack, Rollup, Parcel, Next, React, Vue, Svelte, Astro, or any other framework or build tool.

Bun may be used for optional developer scripts. Bash and PowerShell may be used for optional developer scripts. These scripts may help download, verify, hash, or inspect vendored files. They must not be required for the already-vendored runtime app to execute.

All runtime dependencies must be vendored into the repository. Download dependency source files directly from an authoritative upstream, GitHub release, npm package file served by a CDN such as jsDelivr, or another traceable source. jsDelivr supports open-source files from npm and GitHub, which makes it acceptable as a download source for vendoring when the exact upstream file and version are documented.

All vendored JavaScript and CSS dependency files must be readable and unminified. Do not vendor `.min.js`, `.min.css`, obfuscated files, generated bundles with unreadable names, or files that require source maps to understand. If a dependency only provides minified browser builds, choose another dependency or implement the required subset manually.

All fonts must be vendored. Do not load fonts from Google Fonts, Adobe Fonts, Fontsource CDN, jsDelivr, unpkg, or any external URL at runtime. Vendored font files must include license documentation.

No external network requests are allowed during normal runtime use. This includes scripts, fonts, CSS, images, telemetry, analytics, update checks, and remote Markdown assets.

Only `.txt`, `.md`, and `.markdown` files are supported. Reject other file types clearly.

Markdown raw HTML must be stripped or escaped. The app must not render arbitrary raw HTML from the book file into the page. Even though the file is local, treat Markdown as untrusted input.

The app must not store imported book contents. Do not persist the book body in IndexedDB, localStorage, sessionStorage, cookies, Cache Storage, OPFS, or any other storage. Preferences may persist. Book contents may exist only in memory for the current session.

The app must support page mode and scroll mode.

The app must support desktop, tablet, and mobile layouts.

The app must include test documents in a dedicated test folder.

The app must include browser-based validation using Playwright when available. Playwright is acceptable for end-to-end testing because it is a browser testing tool for modern web apps and supports desktop, tablet, and mobile browser contexts.

The coding agent must not treat these constraints as suggestions. If an implementation choice conflicts with these constraints, choose another implementation.

---

E00 Agent Operating Loop

---

The coding agent must use this loop throughout the project: understand, research, compare, decide, implement, validate, refactor, document.

Understand means read the relevant section of this design note and identify the requirement, the user experience goal, the technical constraints, and the acceptance criteria.

Research means inspect local files first, then research external references only when needed for correctness, dependency choice, browser behavior, licensing, or visual fidelity. Research must be purposeful. Do not browse randomly. Use primary sources when possible.

Compare means consider at least two viable approaches when the decision affects architecture, dependencies, security, storage, rendering, animation, parsing, testing, or maintainability. Record the reasoning in concise comments, a development note, or commit-style summary when useful.

Decide means make the choice without waiting for user approval when the requirement provides enough direction. Prefer the option that improves product quality, code maintainability, offline behavior, debuggability, and the realism of the E Ink reading experience.

Implement means write small, inspectable, modular code. Avoid over-engineering. Avoid magic. Avoid hidden dependency chains. Keep names clear.

Validate means run the app, test sample files, inspect visual output, check the console, test errors, test reduced motion, test keyboard paths, test desktop/tablet/mobile viewports, and run Playwright tests when available.

Refactor means improve the code after validation. Remove duplication, clarify boundaries, tighten error handling, and simplify modules. Do not leave obviously messy code merely because it works once.

Document means update local notes, dependency manifests, test descriptions, and comments where they help future troubleshooting. Do not write bloated documentation. Write only what future maintainers need.

This loop is required for every significant feature. The coding agent must work autonomously inside this loop.

---

F00 Project Structure

---

Use a simple static project structure. The exact filenames may vary if the coding agent has a better reason, but the structure must stay inspectable and understandable.

Suggested structure:

```text
/
  index.html
  README.md
  LICENSES.md

  /assets
    /fonts
      /literata
      /charis-sil
      /source-serif-4
      /merriweather
      /atkinson-hyperlegible
      fonts.css
      licenses/
    /textures
      paper-noise.svg
      paper-noise.png
    /icons
      icon.svg

  /css
    reset.css
    base.css
    reader.css
    eink.css
    settings.css
    responsive.css

  /js
    app.js
    state.js
    file-open.js
    parser-txt.js
    parser-markdown.js
    renderer.js
    paginator.js
    scroll-reader.js
    settings.js
    preferences.js
    eink-effect.js
    logging.js
    errors.js
    accessibility.js
    utils.js

  /vendor
    /markdown-it
      markdown-it.js
      LICENSE
      VENDOR.md
    /dompurify
      purify.js
      LICENSE
      VENDOR.md

  /scripts
    vendor-check.mjs
    vendor-fetch.mjs
    vendor-manifest.json
    smoke-test.mjs
    serve-static.mjs

  /tests
    /fixtures
      simple.txt
      long-book.txt
      simple.md
      markdown-edge-cases.md
      large-headings.md
      unicode.txt
      unsupported.pdf
    /playwright
      reader.spec.js
      settings.spec.js
      markdown.spec.js
      responsive.spec.js
      accessibility.spec.js
```

Keep runtime JavaScript in `/js`. Keep third-party vendored code in `/vendor`. Keep fonts in `/assets/fonts`. Keep test documents in `/tests/fixtures`. Keep optional developer scripts in `/scripts`.

Do not put app logic into inline `<script>` blocks except for a tiny boot guard if absolutely necessary. Do not put large CSS blocks into `index.html`. The app should be easy to inspect file by file.

The coding agent may adjust file names and module boundaries, but must preserve the basic separation between app code, vendor code, assets, scripts, and tests. If a different structure is chosen, it must be simpler or more maintainable than the suggested structure.

---

G00 Runtime Architecture

---

Use a small vanilla JavaScript architecture.

The app should have explicit modules for file loading, parsing, document normalization, rendering, reading mode, settings, preferences, E Ink effect, logging, and error handling.

The app state should be centralized enough that behavior is understandable. Avoid scattered global variables. A simple state object is acceptable. A tiny event bus is acceptable if it reduces coupling. Do not introduce a framework.

Suggested state shape:

```js
const appState = {
  document: {
    loaded: false,
    fileName: null,
    fileType: null,
    characterCount: 0,
    lineCount: 0,
    title: null,
    sections: [],
    sourceText: null
  },
  reader: {
    mode: "paged",
    currentPageIndex: 0,
    scrollTop: 0,
    pageCount: 0,
    layoutReady: false
  },
  preferences: {
    fontFamily: "Literata",
    fontSize: 20,
    lineHeight: 1.55,
    measure: 68,
    theme: "warm-paper",
    contrast: "soft",
    einkIntensity: "balanced",
    motion: "system",
    refreshStyle: "adaptive"
  },
  ui: {
    settingsOpen: false,
    busy: false,
    lastError: null,
    debugEnabled: false
  }
};
```

Do not persist `document.sourceText`. It may exist in memory for the current session only.

Use DOM events carefully. Keep event binding centralized enough that reader interactions can be audited. Important events are file selection, drop, page next, page previous, scroll, settings open, settings close, preference change, resize, orientation change, reduced-motion change, and keyboard shortcuts.

The app should handle lifecycle events. On load, initialize preferences, set up UI, check reduced-motion preference, verify vendored dependencies are available, and show the file-open screen. On file load, parse and render. On settings changes, update preferences, re-layout when needed, and run the E Ink transition. On unload or reload, do not save book content.

The coding agent must avoid creating a hidden framework. Keep the architecture small enough that a future developer can troubleshoot it by reading the files directly.

---

H00 Dependency Policy

---

Vendored dependencies are allowed only when they clearly improve quality, safety, or maintainability.

The expected dependency set is small. A Markdown parser is likely needed. A sanitizer may be needed even if raw HTML is disabled, because defense in depth is valuable. `markdown-it` is a strong candidate because it is browser-compatible, configurable, CommonMark-oriented, and safe by default according to its project documentation. `DOMPurify` is a strong candidate for sanitization because it is a browser-side sanitizer for HTML, MathML, and SVG and is maintained as a dedicated security library.

The coding agent must research the current upstream files and choose the best dependency approach. The likely baseline is vendored `markdown-it` plus vendored `DOMPurify`, but this is not mandatory if the agent can implement a simpler, safer Markdown subset without lowering product quality. The decision must respect all constraints: no npm runtime, no build step, unminified vendored source, readable code, documented license, and no runtime external requests.

Do not vendor large libraries for small tasks. Do not add UI libraries, state management libraries, CSS frameworks, icon libraries, animation frameworks, syntax highlighters, analytics libraries, or file manager libraries unless there is a strong reason and the dependency passes the same vendor rules.

Every vendored dependency must have a `VENDOR.md` file containing the package name, upstream project, exact version or commit, download source, downloaded files, license, reason for inclusion, date vendored, and verification notes.

Example `VENDOR.md` content:

```md
# markdown-it

Purpose: Markdown parsing for local `.md` and `.markdown` files.

Version: [exact version]
Source: [exact upstream release or CDN file URL]
License: MIT
Vendored files:
- markdown-it.js
- LICENSE

Runtime network use: none.
Minified files: none.
Source maps: none required.

Verification:
- File is readable and unminified.
- License file included.
- Browser global or module loading tested.
- Raw HTML rendering disabled in app configuration.
```

Use `scripts/vendor-manifest.json` to track dependencies and fonts. The script may download missing dependencies, but it should not overwrite existing vendored files without an explicit flag or clear operator action.

The coding agent must verify dependencies after vendoring. If a file is minified, unreadable, license-missing, or unsuitable for direct browser use, reject it and choose another source.

---

I00 Font Policy

---

All fonts are local runtime assets.

The default body font is Literata. Literata should be used for the first reading experience because it is a long-form digital reading serif and is available under the SIL Open Font License.

The font menu should include a small curated set, not a massive font catalog. Suggested bundled fonts are Literata, Charis SIL, Source Serif 4, Merriweather, Atkinson Hyperlegible, and Noto Serif if file size remains acceptable. Atkinson Hyperlegible is especially useful for UI or accessibility-focused reading because it was designed to make similar characters more distinguishable for low-vision readers and is available under the SIL Open Font License.

The coding agent must research and verify each font before vendoring. Include license files. Prefer WOFF2 for browser delivery. Include regular, italic, bold, and bold italic only when needed. Avoid excessive weights. Variable fonts are acceptable if browser support and rendering quality are good.

Font loading must use local `@font-face` declarations. Use `font-display` deliberately. For a reader, avoid visible font popping after a book is already rendered. Consider loading core fonts before entering reader mode, or using a controlled refresh after font load.

Suggested `fonts.css` pattern:

```css
@font-face {
  font-family: "Literata";
  src: url("./literata/Literata-Variable.woff2") format("woff2");
  font-weight: 200 900;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Literata";
  src: url("./literata/Literata-Italic-Variable.woff2") format("woff2");
  font-weight: 200 900;
  font-style: italic;
  font-display: swap;
}
```

The reading UI should let the user select the body font. UI controls may use Atkinson Hyperlegible, system UI, or another bundled UI font. The font selector should show a sample line for each font if practical.

Do not modify font files unless the license allows it and the modified font name follows license requirements. Some SIL Open Font License families may have reserved font name restrictions, so the agent must verify license details before modification. Google Fonts notes that some OFL fonts use reserved font name requirements. The normal path is to use unmodified font files.

The coding agent must treat font choice as both a design and licensing task. Do not guess.

---

J00 File Input Requirements

---

The app must support file picker input and drag-and-drop input.

The file picker should accept `.txt`, `.md`, `.markdown`, and MIME types where useful. MIME types are not reliable enough by themselves, so validation must use extension, MIME type, and content fallback where reasonable.

Drag-and-drop should accept one file at a time. If the user drops multiple files, show a clear message and use no file unless the UI explicitly asks the user to choose one. Do not silently choose the first file.

Use browser File APIs for local reading. The FileReader API is a standard browser API for reading local user-provided files, and the browser Drag and Drop API supports dragging files from the operating system into a web page. Modern implementations may also use `Blob.text()` when appropriate. The coding agent must choose the cleanest browser-supported approach after checking target compatibility.

File validation must happen before parsing. Reject unsupported files with a readable message.

Suggested validation behavior:

```text
Accepted:
- .txt
- .md
- .markdown

Rejected:
- empty file
- multiple files
- files above configured size limit
- unsupported extension
- binary-looking content
- unreadable text
```

Set a practical file size limit. The exact value is an implementation decision. The agent should research browser memory behavior and test large text fixtures. A reasonable starting point is a warning above 2 MB and a hard limit somewhere around 10 MB to 20 MB unless testing proves larger files are safe. The app is a visual reader, not a bulk text processor.

The file-open screen must state that contents stay local and are not stored after the session. This statement must remain accurate.

The coding agent must test file loading with TXT, Markdown, empty files, large files, Unicode files, unsupported files, and multiple-file drag attempts.

---

K00 Text Parsing And Normalization

---

TXT files should render as readable prose with preserved paragraph structure.

Normalize line endings to `\n`. Remove or ignore a UTF-8 BOM. Preserve meaningful blank lines. Collapse excessive blank lines only where it improves reading and does not corrupt intentional spacing. Convert plain text paragraphs into semantic blocks. Avoid rendering the entire TXT file as a single `<pre>` unless the file appears to be structured code or fixed-width text.

Markdown files should be parsed into safe HTML. Raw HTML must be stripped or escaped. The app must not trust Markdown input.

If using `markdown-it`, configure it to disable raw HTML. Consider settings equivalent to `html: false`, with linkification and typographer behavior chosen based on reading quality. If using another parser, configure equivalent behavior. If implementing a custom parser, document the supported subset and make sure unsupported constructs fail safely.

After parsing Markdown, sanitize the generated HTML as defense in depth if a sanitizer is vendored. Configure sanitizer rules to allow only reading-safe tags and attributes. Do not allow script, style, event handler attributes, iframes, object embeds, remote image loading, external resource injection, or arbitrary inline CSS. Since the product supports text and Markdown reading, not web content rendering, restrictive sanitization is correct.

Images in Markdown require a product decision. The current core requirement is text and Markdown reading. The safest baseline is to ignore remote images, show local image syntax as text, or render a placeholder that says images are not supported in this version. Do not make runtime network requests to load remote images from Markdown. If the agent chooses to support embedded data images, it must validate memory and security impact.

Links in Markdown may render as text links, but the app must not surprise the user. External links should be visually subdued and open only by explicit user action. Consider showing the URL destination on hover or focus. Do not prefetch links.

Tables, code blocks, blockquotes, headings, lists, emphasis, horizontal rules, and inline code should render readably. Code blocks should not dominate the reading experience. Long code lines should wrap or scroll within the reading column depending on the chosen design.

The coding agent must create Markdown fixtures that include headings, paragraphs, emphasis, lists, blockquotes, code blocks, links, raw HTML, script-like content, tables if supported, Unicode, and malformed Markdown. Validate that raw HTML does not execute or render as trusted markup.

---

L00 Internal Document Model

---

Convert loaded files into a normalized internal document model before rendering.

The model should separate source input, metadata, sections, blocks, and layout state. The model does not need to be complex, but it must avoid making pagination and rendering depend on raw source strings scattered through the app.

Suggested document model:

```js
const normalizedDocument = {
  id: "session-only-generated-id",
  fileName: "book.md",
  fileType: "markdown",
  title: "Detected Or File Name Title",
  characterCount: 123456,
  wordEstimate: 20000,
  sections: [
    {
      id: "section-1",
      heading: "Chapter 1",
      level: 1,
      html: "<h1>Chapter 1</h1><p>...</p>",
      plainText: "Chapter 1\n..."
    }
  ]
};
```

The document ID must be session-only and not used to persist contents. It may help with logging and layout.

Detect a title using Markdown first heading, TXT first non-empty line, or filename fallback. Do not overcomplicate title extraction.

For long files, split into sections by Markdown headings or text boundaries. This helps rendering, pagination, and future troubleshooting. The agent should decide exact splitting strategy based on performance testing.

Do not store the source text after it is no longer needed if memory pressure is a concern. Since the content must not persist, it is acceptable to keep source text in memory while the session is active, but the code should be explicit that this is session-only.

The coding agent must validate the document model with both small and large fixtures before building pagination on top of it.

---

M00 Rendering Requirements

---

Render content semantically. Use `<main>`, `<article>`, headings, paragraphs, blockquotes, lists, code blocks, and other appropriate elements. Do not render everything as a flat string of `<div>` elements.

The reading column should default to a book-like measure. Start around 60 to 72 characters per line. The user may adjust page width or measure. Body text should default around 18 to 22 CSS pixels depending on viewport. Line height should default around 1.5 to 1.65.

Use low-contrast colors. Avoid pure black on pure white by default. A reasonable initial theme is warm paper background with dark charcoal text. Offer at least warm paper, cool paper, high contrast grayscale, and dark inverse modes if practical.

The page surface should include subtle paper grain. Use a local SVG or generated CSS texture. Keep the texture subtle. It should be almost invisible during reading and more noticeable only when the reader intentionally inspects the surface. Do not use heavy noise that makes text harder to read.

The renderer must avoid layout shifts during reading. Settings changes may reflow text, but the app should preserve approximate reading position. Page mode should preserve page index or nearest anchor. Scroll mode should preserve position by content anchor where possible.

The app must not depend on remote images, remote CSS, or remote fonts.

The coding agent must visually inspect typography in the browser after implementing rendering. Text should feel like a reader surface, not a generic web article.

---

N00 Page Mode

---

Page mode displays a single page-like reading viewport or spread-like surface depending on viewport size. The baseline should be one page. A two-page spread may be considered for wide desktop screens if it improves quality without creating complexity. The agent should use best judgment.

Page mode requires pagination. Pagination must account for current font, font size, line height, page width, viewport size, margins, and rendered Markdown elements. Pagination must recalculate when relevant settings change, when fonts load, when viewport size changes, and when orientation changes.

Pagination must avoid cutting important elements awkwardly when practical. It is acceptable to split long paragraphs, but avoid leaving headings alone at the bottom of a page. Avoid splitting code blocks in a confusing way unless necessary.

Navigation methods should include clickable/tappable zones, buttons, keyboard shortcuts, and touch gestures where practical. Suggested keyboard controls: ArrowRight or Space for next page, ArrowLeft for previous page, Home for beginning, End for end, Escape to close settings.

The app must show page position. Keep it subtle. Example: `Page 12 of 140` or a small progress indicator.

Page transitions must use the E Ink simulation. Next page and previous page are the most important transition path. The transition should account for direction if practical, but it should not look like a glossy slide animation. It should feel like a screen refresh.

The coding agent must test page mode with short, medium, and long fixtures; different fonts; mobile portrait; tablet landscape; and desktop widths.

---

O00 Scroll Mode

---

Scroll mode displays continuous content in a reading column.

Scroll mode still participates in the E Ink simulation. Since normal scroll movement can become unpleasant if every pixel scroll triggers a flash, do not run a heavy refresh for every scroll event. Use E Ink transitions for major state changes: file load, mode switch, settings changes, jump to top, jump to section, restore position, and possibly page-step navigation inside scroll mode. For normal continuous scrolling, use subtle texture and ghosting only if it does not harm usability.

The scroll surface must remain performant. Avoid expensive per-scroll effects. Do not repaint large canvases on every scroll unless testing proves it is safe.

Scroll mode should preserve reading position across settings changes using an anchor or percentage fallback. Since book content is not persisted, only preserve position within the active session and optional preference state where it does not imply content persistence.

Scroll mode should support keyboard navigation. Arrow keys, PageUp, PageDown, Home, and End should behave naturally.

The coding agent must make scroll mode feel intentionally designed, not a fallback. It should still look like an E Ink reader.

---

P00 E Ink Visual Simulation

---

The E Ink simulation is a core product feature.

The simulation should combine several cues: grayscale palette, matte paper tone, limited contrast, subtle paper texture, slight ghosting, flicker or flash during refresh, delayed settling, and optional dithering or speckle.

The default effect should be balanced. It should be visible enough that the app feels unlike a normal website, but not so aggressive that reading becomes tiring. The user must be able to reduce or disable motion and visual disturbance.

Suggested refresh sequence for page changes:

```text
1. Capture or preserve the outgoing visual state.
2. Begin a low-duration wash phase.
3. Briefly invert, brighten, darken, or desaturate the surface depending on chosen refresh style.
4. Show a faint residual imprint of the outgoing page.
5. Reveal the incoming page through stepped grayscale settling.
6. Leave minimal ghosting for authenticity.
7. Clear or reduce accumulated ghosting after full refresh events.
```

Do not implement this as a simple opacity fade unless no better fallback is available. A fade is not enough to suggest E Ink.

The effect may be implemented with CSS overlays, pseudo-elements, canvas snapshots, View Transition API, Web Animations API, or a hybrid. The View Transition API is relevant because it provides a browser mechanism for animated transitions between DOM states and can support single-page app view transitions. The coding agent must evaluate whether the API provides enough browser support and control. If it is not reliable enough, use a custom overlay transition.

Possible implementation layers:

```text
CSS-only baseline:
- reader overlay
- keyframe animation
- grayscale filters
- opacity flicker
- paper texture layer
- ghost layer

Canvas-enhanced mode:
- snapshot outgoing content
- apply threshold or dither
- blend old and new states
- render speckle or ghosting overlay

Advanced mode:
- View Transition API or Web Animations API
- optional OffscreenCanvas for image processing
```

OffscreenCanvas can run rendering work away from the DOM and in worker contexts, which may help if the agent chooses canvas-based image processing. Use it only if it improves performance or code clarity. Do not add complexity for its own sake.

E Ink simulation intensity should be configurable. Suggested values: off, reduced, balanced, strong. Reduced should keep paper styling but minimize flashing. Strong may include more visible inversion, speckle, and ghosting.

The app should simulate both full refresh and partial refresh. Full refresh should be used for file load, mode switch, theme switch, font switch, large layout recalculation, and periodic cleanup after several partial transitions. Partial refresh should be used for page turns and smaller changes when appropriate. Partial refresh may preserve faint ghosting. Full refresh should clear ghosting.

The coding agent must tune the effect in the browser. If the effect looks broken, flashy, cheap, or distracting, revise it. Visual acceptance matters.

---

Q00 Motion And Accessibility

---

The app must respect `prefers-reduced-motion`. This media feature indicates that the user has requested reduced non-essential motion at the system level.

If reduced motion is active, default to reduced E Ink effects. Do not use aggressive flashing, rapid inversion, shaking, or repeated flicker. The user may explicitly choose stronger effects, but the default must respect the system preference.

Avoid flashing patterns that could be unsafe or uncomfortable. Keep refresh flashes brief, limited, and user-configurable. Never require flashing for core usability.

All controls must be keyboard reachable. Focus states must be visible but visually compatible with the grayscale reader design. Use clear focus outlines. Do not remove outlines without replacement.

Settings must be operable by keyboard and touch. Dialogs must have focus management. Escape should close settings. The file picker and drop zone must have accessible labels.

The reader text must maintain sufficient contrast. Even when simulating low-contrast E Ink, do not make the text unreadable. Provide a higher contrast theme.

The coding agent must test reduced motion, keyboard-only operation, focus visibility, screen size changes, and basic semantic structure.

---

R00 Preferences

---

Preferences may persist locally. Book contents must not persist.

Use localStorage for simple preference persistence unless the agent has a better static-browser reason to choose another lightweight browser storage mechanism. Keep the stored object small and explicit.

Suggested persisted preferences:

```js
{
  "version": 1,
  "fontFamily": "Literata",
  "fontSize": 20,
  "lineHeight": 1.55,
  "measure": 68,
  "readerMode": "paged",
  "theme": "warm-paper",
  "contrast": "soft",
  "einkIntensity": "balanced",
  "refreshStyle": "adaptive",
  "motion": "system",
  "showProgress": true,
  "debugEnabled": false
}
```

Do not persist `sourceText`, parsed HTML, normalized sections, file body, rendered page HTML, or book cache. Do not store enough content to reconstruct the book.

Preference loading must be safe. Validate stored values before applying them. If preferences are corrupt, invalid, or from an older version, migrate or reset safely.

Settings changes should apply immediately when possible. If a change requires re-layout, show a subtle busy state and run the E Ink transition. Avoid losing reading position.

The coding agent must test corrupted localStorage values, missing preferences, preference migration, and reset behavior.

---

S00 Settings Interface

---

Settings should feel like a device settings panel, not an admin dashboard.

The panel should include sections for reading mode, typography, display, E Ink behavior, accessibility, and advanced diagnostics.

Reading mode settings include page mode and scroll mode.

Typography settings include font family, font size, line height, page width or measure, paragraph spacing, and optional text alignment. Avoid full justification by default unless it looks good with the selected font and layout.

Display settings include paper theme, contrast, margin size, texture strength, and dark mode if implemented.

E Ink behavior settings include intensity, refresh style, full refresh interval, ghosting amount, and motion preference. The user should be able to turn the effect off.

Accessibility settings include reduced motion override, high contrast theme, larger controls, and keyboard shortcut reference.

Advanced diagnostics may include debug mode, show layout boxes, show page count recalculation, export logs, or clear preferences. Keep this collapsed or hidden by default.

The settings panel must not require network access. Font choices must reflect locally available fonts.

The coding agent must make settings changes robust. Every setting must have validation, UI state, persistence where appropriate, and a visual update path.

---

T00 Error Handling

---

Errors must be clear, recoverable, and logged.

User-facing errors should explain what happened and what the user can do next. Examples: choose another file, reduce file size, reopen the file, switch to plain text mode, reset preferences, or report diagnostics.

Do not show raw exception objects to normal users. Do not show huge stack traces in the main UI. Log technical details to the console and optional debug panel.

Expected error cases:

```text
No file selected.
Multiple files dropped.
Unsupported file type.
Empty file.
File too large.
File read failed.
Text decoding failed.
Markdown parser unavailable.
Markdown parse failed.
Sanitizer unavailable.
Font failed to load.
Pagination failed.
Layout could not stabilize.
Preference load failed.
Preference save failed.
Browser feature unavailable.
Playwright test fixture failed during development.
```

Each critical path should use `try/catch` or promise rejection handling where appropriate. Errors should flow through a central error module so behavior is consistent.

If an error happens in the middle of a process and user choice is useful, show a safe choice. Example: if Markdown parsing fails, offer to reopen the file as plain text for this session. If pagination fails, offer to switch to scroll mode. If a selected font fails, fall back to Literata or system serif and show a warning.

The coding agent must test error paths intentionally. Do not only test successful loading.

---

U00 Logging And Diagnostics

---

Implement structured local logging for development and troubleshooting.

Logging must not send data anywhere. No analytics. No telemetry network requests. No remote crash reporting.

Use a small logging module with levels such as debug, info, warn, and error. Logs should include timestamps, event names, and relevant metadata. Do not log full book contents. Do not log large content excerpts. It is acceptable to log file name, file size, detected type, character count, section count, page count, preference keys, and error names.

Suggested log events:

```text
app:init
preferences:loaded
preferences:invalid
file:select
file:drop
file:validated
file:read:start
file:read:success
file:read:error
parser:txt:start
parser:markdown:start
parser:markdown:error
document:normalized
renderer:start
renderer:complete
pagination:start
pagination:complete
pagination:error
eink:refresh:start
eink:refresh:complete
settings:change
mode:switch
error:shown
```

Debug mode may expose recent logs in an advanced panel. The panel should allow copying logs. Copying logs must not include book content.

Console logs should be useful during development but not noisy in normal use. Use debug gating for verbose logs.

The coding agent must use logging to make failures diagnosable. If a future developer cannot tell where the loading or rendering pipeline failed, logging is insufficient.

---

V00 Performance Requirements

---

The app should remain responsive on common desktop, tablet, and mobile browsers.

Avoid rendering huge documents into an unnecessarily large DOM all at once if it causes slowdowns. For many books, rendering the full document may be acceptable. For larger documents, section-based rendering, lazy pagination, or chunked layout may be needed. The coding agent must test and choose the practical strategy.

Avoid expensive layout loops. Pagination can easily become slow if it repeatedly measures DOM after every small mutation. Batch DOM writes and reads. Use `requestAnimationFrame` where appropriate. Recalculate only when inputs change.

Avoid heavy canvas effects on every frame. E Ink transitions should be short and bounded. If using canvas snapshots, limit resolution or region size when necessary.

Settings changes should show a busy state if recalculation takes noticeable time. The app should not freeze without feedback.

The agent should define basic performance targets after testing. Suggested targets: small files load nearly instantly, medium files load without noticeable jank, large accepted files show progress or busy state, page turns complete within a comfortable reading-device-like duration, and settings changes recover predictably.

The coding agent must validate performance with long TXT and Markdown fixtures. If performance is poor, simplify the effect, chunk rendering, or refactor layout.

---

W00 Responsive Behavior

---

Desktop, tablet, and mobile behavior must be fully specified by implementation and tested.

Desktop should support keyboard-heavy reading, centered page surface, optional side controls, and comfortable wide margins.

Tablet should support touch page turns, orientation changes, and a page surface sized for hand-held reading. Controls should be touch-friendly but not oversized.

Mobile should support narrow reading width, larger touch targets, stable scroll mode, and page mode that does not feel cramped. Settings should become a full-screen or bottom-sheet style panel if that is more usable.

Orientation changes must trigger re-layout. Preserve the nearest reading position.

Touch controls should avoid accidental navigation. Edge tap zones are acceptable, but they must not block text selection or settings interaction. Swipe gestures are acceptable if they do not interfere with normal scrolling.

Viewport units should account for mobile browser chrome where possible. Avoid layouts that break when the address bar collapses or expands.

The coding agent must run Playwright or browser tests for desktop, tablet, and mobile viewport sizes. Visual inspection is required for at least one narrow mobile viewport and one tablet landscape viewport.

---

X00 Keyboard And Input Behavior

---

Keyboard operation is required.

Suggested shortcuts:

```text
Right Arrow: next page in page mode.
Left Arrow: previous page in page mode.
Space: next page in page mode.
Shift + Space: previous page in page mode.
PageDown: next page or scroll down.
PageUp: previous page or scroll up.
Home: beginning.
End: end.
Escape: close settings or dismiss non-critical overlay.
S: open settings, unless focus is inside an editable control.
O: open file picker, unless focus is inside an editable control.
```

Do not hijack keyboard input when focus is inside a form control, select, slider, text input, or button where default behavior matters.

Mouse behavior should support buttons and optional left/right reading zones.

Touch behavior should support tapping controls and optional page-turn zones. Gestures must be forgiving.

The coding agent must implement input handling centrally enough that conflicts can be debugged.

---

Y00 Markdown Rendering Details

---

Markdown headings should create visible structure without looking like a documentation site. Headings should feel like book chapter headings.

Paragraphs should have comfortable spacing. Avoid excessive Markdown default margins.

Blockquotes should be quiet and readable. Use a subtle border or indentation.

Code blocks should be legible. Use a local monospace fallback or bundled font only if necessary. Code blocks should not cause horizontal page overflow on mobile.

Lists should render readably but not with web-default spacing that looks too loose. Since the user dislikes heavy list formatting, the visual design should keep lists calm and compact.

Horizontal rules can act as section breaks.

Links should be low-key. External URLs should not be fetched by the app. Clicking a link may open it in a new tab only after explicit user action. Consider adding `rel="noopener noreferrer"`.

Raw HTML must not render as trusted HTML. It should either appear escaped as text or be stripped, based on the chosen design. The user's stated preference is strip and escape raw HTML. A practical interpretation is: do not execute or render raw HTML; preserve the user's visible text where safe; escape visible raw tags if preserving them helps the reader understand the source. The agent must choose a consistent behavior and test it.

The coding agent must verify Markdown security with fixtures containing `<script>`, inline event handlers, iframes, style tags, image tags with remote URLs, and malformed HTML.

---

Z00 Security And Privacy

---

The app is local-first and privacy-preserving by design.

Do not upload files. Do not call remote APIs. Do not load remote fonts. Do not load remote scripts. Do not load remote Markdown images. Do not send logs. Do not embed analytics.

Treat local files as untrusted input. A local Markdown file can still contain hostile HTML or confusing markup. Disable raw HTML and sanitize parsed output.

Do not use `innerHTML` with unsanitized content. If using `innerHTML` after Markdown parsing, ensure the output came from a safe parser configuration and sanitizer. For plain text, prefer text nodes or escaped conversion.

Use a restrictive Content Security Policy if practical for a static app. Since the app may run from `file://`, test CSP behavior carefully. If CSP causes local file issues, document the limitation and maintain safe coding practices.

Do not use `eval`, `new Function`, dynamic script injection, or inline event handlers.

The coding agent must inspect all paths where file contents enter the DOM.

---

AA00 Storage Rules

---

Persistent storage is allowed only for preferences and non-content operational state.

Allowed examples:

```text
Selected font name.
Font size.
Line height.
Reader mode.
Theme.
E Ink intensity.
Reduced motion override.
Debug enabled flag.
Last settings panel section.
```

Disallowed examples:

```text
Book source text.
Parsed book HTML.
Normalized book sections.
Page text.
Markdown AST containing book content.
Full-text search index.
Reading excerpts.
Bookmarks containing quoted book text.
Annotations containing copied book text.
```

Reading position is tricky because the book is not stored. In this version, the safest behavior is to preserve reading position only within the active session. If the app stores last position, it must store only generic metadata such as file name, file size, and approximate percentage, and it must not imply the book can be restored without reopening. The coding agent should avoid persisted reading position unless it is implemented with clear privacy and UX safeguards.

When the user reloads the app, show preferences but no book. The UI should say that the book must be reopened.

The coding agent must audit storage writes and ensure no book content is persisted.

---

AB00 Visual Design System

---

Use a grayscale-first design system.

Suggested color tokens:

```css
:root {
  --paper-bg: #f3f0e8;
  --paper-bg-cool: #eef0ed;
  --paper-bg-contrast: #faf9f4;
  --ink: #1f1f1c;
  --ink-soft: #34342f;
  --ink-muted: #686860;
  --line-soft: rgba(31, 31, 28, 0.16);
  --surface-shadow: rgba(31, 31, 28, 0.08);
}
```

Keep tokens centralized. Avoid hard-coded colors scattered throughout CSS.

The default theme should feel like warm paper under ambient light. A cool paper theme may feel closer to some devices. A high-contrast grayscale theme is required for readability. A dark theme is optional but useful.

Use subtle borders and texture. Avoid heavy card shadows. Avoid glossy buttons.

Controls should feel physical but restrained. A reader device can have minimal controls and clear state.

The coding agent must tune visual tokens in browser, not only in code.

---

AC00 E Ink Effect Technical Notes

---

The app should have a single E Ink effect controller.

The controller should expose methods such as:

```js
runFullRefresh(reason, updateDomCallback)
runPartialRefresh(reason, updateDomCallback)
runSettingsRefresh(reason, updateDomCallback)
runReducedRefresh(reason, updateDomCallback)
```

The exact API is up to the agent, but the app should not duplicate refresh logic across modules.

The effect controller should know whether reduced motion is active, whether the effect is disabled, what intensity is selected, and whether the current browser supports the chosen APIs.

A safe implementation pattern is:

```text
1. Lock user navigation briefly.
2. Add refresh overlay.
3. Run outgoing phase.
4. Apply DOM update.
5. Wait for layout or fonts if needed.
6. Run incoming phase.
7. Remove overlay.
8. Unlock navigation.
9. Log completion.
```

If an error occurs during refresh, unlock the UI and show the updated DOM without the effect. Never leave the app stuck behind an overlay.

Use CSS classes and variables for the baseline effect. Use JavaScript to coordinate timing and DOM updates. Canvas or View Transition API can be layered later if they improve realism.

The coding agent must test interruption cases: fast repeated page turns, settings changed during transition, resize during transition, reduced motion toggled, and error thrown inside the DOM update callback.

---

AD00 Pagination Technical Notes

---

Pagination is one of the hardest parts. Treat it as a feature requiring research and validation.

Possible approaches:

```text
CSS columns:
- Can flow text into page-like columns.
- May be simpler.
- Can be difficult for precise page controls and element measurement.

DOM measurement:
- Render content into hidden measuring container.
- Split blocks into pages based on height.
- More control, more complexity.

Hybrid:
- Section-level pagination with measured containers.
- Simpler than line-level splitting.
- Good enough if visual quality is acceptable.
```

The coding agent must evaluate these options and choose the best practical approach. The choice must balance visual quality, code maintainability, performance, and mobile behavior.

Do not spend excessive complexity on perfect print-quality pagination if it harms the product. The page experience should be credible and stable.

Page count must update after fonts load. Font loading affects layout. Use `document.fonts.ready` if appropriate and supported.

If pagination fails, fall back to scroll mode and show a clear warning.

The agent must create tests that verify page count exists, next/previous page changes visible content, settings changes recalculate pages, and page index remains valid after resize.

---

AE00 Font Loading And Layout Stability

---

Font loading is part of layout.

The app should know when the selected font is ready before final pagination. If the selected font is not ready, use a temporary layout state or render with fallback and then repaginate after font load.

Font changes should trigger a full E Ink refresh because real E Ink-like layout changes should feel like a device redraw.

If a font fails to load, fall back to Literata. If Literata fails, fall back to Georgia or generic serif. Log the failure and show a subtle warning.

Do not let font loading cause infinite pagination loops. Track layout generations or use cancellation tokens when recalculating.

The coding agent must test each bundled font with page and scroll modes.

---

AF00 Developer Scripts

---

Developer scripts are allowed as helper tools, not as runtime requirements.

Bun is allowed for scripts. Bash and PowerShell are allowed. Use the simplest script technology that is likely to work in the target environment.

`scripts/vendor-manifest.json` should describe every dependency and font source.

Suggested manifest shape:

```json
{
  "dependencies": [
    {
      "name": "markdown-it",
      "version": "x.y.z",
      "source": "https://cdn.jsdelivr.net/npm/markdown-it@x.y.z/dist/markdown-it.js",
      "target": "vendor/markdown-it/markdown-it.js",
      "licenseSource": "https://raw.githubusercontent.com/markdown-it/markdown-it/master/LICENSE",
      "licenseTarget": "vendor/markdown-it/LICENSE",
      "required": true,
      "unminified": true
    }
  ],
  "fonts": [
    {
      "name": "Literata",
      "versionOrCommit": "exact commit or release",
      "source": "exact font file URL",
      "target": "assets/fonts/literata/Literata-Variable.woff2",
      "licenseSource": "exact license URL",
      "licenseTarget": "assets/fonts/licenses/Literata-OFL.txt",
      "required": true
    }
  ]
}
```

The vendor check script should verify that expected files exist, licenses exist, vendored files are not minified by name, and file sizes are plausible. It should print a clear report.

The vendor fetch script may download missing files. If a file already exists, skip it by default and report that it exists. Add an explicit `--force` option only if useful.

Scripts should not require npm install. If using Bun standard APIs is enough, use Bun. If using shell, keep commands portable or provide Bash and PowerShell variants.

The coding agent must run vendor checks and fix missing vendor metadata before considering the project complete.

---

AG00 Testing Strategy

---

Testing must cover product behavior, visual behavior, accessibility behavior, and error behavior.

Use static fixture files under `/tests/fixtures`. Create at least these files:

```text
simple.txt
A short plain text document with several paragraphs.

long-book.txt
A long plain text file with many paragraphs and chapter-like breaks.

simple.md
Basic Markdown with headings, emphasis, blockquotes, lists, links, and code.

markdown-edge-cases.md
Raw HTML, script-like content, malformed Markdown, tables if supported, nested formatting, and unusual whitespace.

unicode.txt
Unicode text with accented characters, punctuation, non-Latin samples, and long lines.

large-headings.md
Many headings and sections to test navigation and layout.

unsupported.pdf
A small dummy or fixture placeholder used only to test rejection.
```

Use Playwright for browser tests when available. Playwright supports desktop and mobile browser contexts, so use it for responsive and interaction testing. If Playwright is not installed, the project should document how to run tests in the expected environment, but do not add npm as a project requirement.

Suggested Playwright test areas:

```text
App boots with no network dependency.
File picker path can load TXT through test injection if supported.
Drag-and-drop path can load TXT.
Markdown renders expected safe elements.
Raw HTML does not execute.
Unsupported file shows an error.
Settings open and close.
Font setting changes the reader class or CSS variable.
Page mode next/previous works.
Scroll mode switch works.
Reduced motion disables aggressive refresh.
Mobile viewport displays usable controls.
Tablet viewport preserves reader layout.
No book contents are present in localStorage after load.
```

The coding agent must create tests that are practical for a static app. If browser security prevents direct file picker automation, use a testing hook that simulates a File object in development tests without weakening production behavior.

Manual visual testing is also required. Automated tests cannot fully judge whether the E Ink effect feels credible. The agent must inspect the app in a browser.

---

AH00 Acceptance Criteria

---

The app opens from static files and shows a file-open screen.

The app loads `.txt` files through file picker and drag-and-drop.

The app loads `.md` and `.markdown` files through file picker and drag-and-drop.

Unsupported file types are rejected with a clear message.

Markdown raw HTML does not render as trusted HTML and cannot execute scripts.

The app does not store book contents in persistent storage.

Preferences persist across reloads.

Reloading the app restores preferences but not the book.

The default reading font is local Literata.

The user can change the reading font from local bundled fonts.

The reader supports page mode.

The reader supports scroll mode.

The user can switch between page and scroll mode.

The E Ink refresh effect appears on file load, page turn, mode switch, settings changes, and major layout changes.

Reduced motion is respected.

The app works on desktop, tablet, and mobile viewport sizes.

Keyboard navigation works.

Touch or click navigation works.

Settings are accessible and usable.

Errors are logged and user-facing messages are clear.

Vendor dependencies are local, readable, unminified, licensed, and documented.

Fonts are local, licensed, and documented.

No external network requests occur during normal runtime use.

Playwright or equivalent browser validation exists for core flows.

Test fixtures exist.

The code is modular, readable, and refactored after implementation.

The coding agent must not stop at a technically passing but visually poor result. The E Ink reading experience is part of acceptance.

---

AI00 Implementation Order

---

A sensible implementation order is:

```text
1. Create static project skeleton.
2. Add base HTML, CSS, and app bootstrap.
3. Add logging and error modules.
4. Add preference loading and settings state.
5. Vendor and load fonts.
6. Vendor and verify Markdown/sanitizer dependencies.
7. Implement file picker and drag-and-drop.
8. Implement TXT parser.
9. Implement Markdown parser with raw HTML disabled and sanitization.
10. Implement normalized document model.
11. Implement base reader rendering.
12. Implement scroll mode.
13. Implement page mode and pagination.
14. Implement E Ink effect baseline.
15. Apply E Ink effect to page turns and state changes.
16. Implement settings UI.
17. Implement responsive layouts.
18. Implement accessibility behavior and reduced motion.
19. Add fixtures.
20. Add Playwright tests.
21. Run browser inspection.
22. Refactor.
23. Run final vendor, storage, network, and visual checks.
```

The coding agent may reorder steps when there is a good reason. For example, it may prototype the E Ink effect earlier to validate the visual direction. However, do not leave core architecture, security, or storage rules until the end.

At each step, use the operating loop: understand, research, compare, decide, implement, validate, refactor, document.

---

AJ00 Code Quality Requirements

---

Code must be readable.

Prefer clear functions over clever abstractions. Prefer explicit module boundaries over hidden side effects. Prefer a small number of well-named files over one giant script.

Use modern browser JavaScript, but avoid syntax or APIs that unnecessarily reduce compatibility. If using a newer API, provide fallback or graceful degradation.

Do not use global mutable state casually. If state is global, make it intentional and centralized.

Do not mix parsing, rendering, settings, logging, and effects in one module.

Do not leave dead code, commented-out experiments, or console spam.

Use CSS custom properties for themes and typography. Keep animation names and variables clear.

Use comments for non-obvious decisions, especially around pagination, E Ink effect timing, Markdown security, and storage privacy. Avoid comments that restate the code.

The coding agent must refactor after features work. A first pass is not final if it leaves the system hard to debug.

---

AK00 Browser Support

---

Target current stable desktop and mobile browsers. The app should work in current Chrome, Edge, Firefox, and Safari where practical.

Do not require experimental browser flags.

Advanced visual features may degrade when unsupported. For example, if View Transition API is unavailable, use the custom overlay effect. If OffscreenCanvas is unavailable, use main-thread canvas carefully or CSS-only fallback. If a font loading API is unavailable, use timeout and fallback behavior.

Do not break the core reading experience because an advanced effect is unavailable.

The coding agent must test at least Chromium through Playwright or local browser automation. If other browsers are not available, document that limitation in project notes.

---

AL00 Network And Offline Verification

---

Runtime must be offline-capable after files are vendored.

The agent should test with DevTools network throttling or offline mode if available. The app should still load with all required scripts, styles, fonts, and textures.

No runtime request should go to Google Fonts, jsDelivr, unpkg, GitHub, CDN assets, analytics services, or any remote endpoint.

Markdown content must not trigger remote image loads. External links may exist as anchors, but they must not be prefetched or fetched by the app.

The coding agent must inspect network requests during runtime. If any unexpected external request appears, fix it.

---

AM00 Visual Quality Checklist

---

The first loaded book should immediately look like a reading device.

Text should be calm and comfortable.

The paper background should not be pure white.

The text should not be pure black unless high contrast mode is selected.

The reading width should not be too wide on desktop.

The mobile layout should not feel cramped.

Settings should not visually dominate the reader.

The E Ink transition should feel like refresh and settling, not a standard fade.

Ghosting should be subtle.

Strong E Ink mode may be more dramatic, but balanced mode should be usable for real reading.

Reduced motion mode should remain pleasant.

Font changes should visibly affect the reading experience and should not break layout.

The coding agent must inspect this visually. Automated tests are not enough.

---

AN00 Boundary Conditions

---

Test empty files.

Test whitespace-only files.

Test files with one extremely long line.

Test very long paragraphs.

Test many short paragraphs.

Test unusual Unicode.

Test Windows, Unix, and old Mac line endings.

Test Markdown with raw HTML.

Test Markdown with remote images.

Test Markdown with very deep heading structure.

Test repeated page turns.

Test resizing while paginating.

Test changing font while pagination is active.

Test changing settings during an E Ink transition.

Test reduced motion active before app load.

Test corrupted preferences.

Test missing vendor dependency.

Test missing font file.

Test sanitizer unavailable.

Test Markdown parser unavailable.

Test localStorage unavailable or throwing.

The coding agent must add handling for the failures that are realistic and important. Do not ignore boundary conditions that can corrupt the reader state.

---

AO00 UI Copy Requirements

---

UI copy should be short and functional.

Suggested file-open copy:

```text
Drop a TXT or Markdown book here.
The file is read locally in this browser. It is not uploaded or stored.
```

Unsupported file copy:

```text
This file type is not supported. Open a .txt, .md, or .markdown file.
```

Multiple file copy:

```text
Open one book file at a time.
```

Book not restored copy after reload:

```text
Preferences were restored. Reopen your book file to continue reading.
```

Markdown fallback copy:

```text
Markdown could not be rendered safely. You can reopen this file as plain text.
```

Large file warning copy:

```text
This file is large and may take longer to paginate.
```

Keep copy factual. Do not add marketing language.

---

AP00 Developer Documentation

---

Include a concise `README.md`.

The README should explain what the app does, how to run it as static files, supported formats, privacy behavior, dependency vendoring, optional scripts, tests, and known limitations.

Do not write a long marketing README. The README is for developers and testers.

Include `LICENSES.md` or equivalent license documentation for vendored dependencies and fonts.

Include `VENDOR.md` files next to vendored dependencies.

Include comments in `vendor-manifest.json` only if the chosen format allows it. If using JSON, do not include comments. If comments are needed, use a Markdown companion file.

The coding agent must keep documentation accurate. If implementation differs from suggested structure, update docs.

---

AQ00 Completion Definition

---

The project is complete when the app can be opened locally, loads TXT and Markdown books, renders them safely, supports page and scroll reading, simulates E Ink refresh across major interactions, offers local font preferences, persists preferences only, rejects unsupported files, handles errors clearly, works across desktop/tablet/mobile layouts, includes local vendored readable dependencies and fonts with licenses, includes fixtures and browser tests, and has been visually inspected and refactored.

The coding agent must make final quality decisions autonomously. If there are multiple acceptable options, choose the one that better serves the reader experience, security, maintainability, offline operation, and troubleshooting.

Do not deliver a random prototype. Deliver a coherent static reader.







## File content `specs\eink-reader-design-note_todo.md`:

# specs/eink-reader-design-note_todo.md

Source: specs/eink-reader-design-note.md
Pass: Design Note

This checklist was extracted from the design note and validated against the
implementation. Items are marked done only when the behavior was verified in a
real browser (via `tests/smoke.mjs` / Playwright) or by direct inspection.

---

## A00 Acceptance Checklist

### Runtime constraints
- [x] Runtime app is static HTML, CSS, JavaScript, and local assets.
- [x] No npm, framework, bundler, server, or build step is required for runtime.
- [x] App can be opened by loading `index.html` (or any static file server).
- [x] Runtime makes no external network requests (CSP `connect-src 'none'`; verified: 0 external requests during full smoke run).
- [x] A strict Content-Security-Policy is present in `index.html`.

### File loading
- [x] `.txt` files can be opened through the file picker.
- [x] `.md` / `.markdown` files can be opened through the file picker.
- [x] Files can be opened through drag-and-drop onto the window/dropzone.
- [x] Unsupported file types are rejected with a clear, non-technical message.
- [x] Empty / whitespace-only files show a calm "nothing to read" message and do not enter the reader.
- [x] Large files produce a non-blocking warning and still paginate.

### Parsing
- [x] TXT is parsed into paragraphs preserving blank-line breaks; long single lines wrap.
- [x] Markdown is parsed with markdown-it, headings/lists/quotes/code/tables/links supported.
- [x] Unicode content renders correctly.

### Security (untrusted Markdown)
- [x] Raw HTML in Markdown is NOT executed (`html:false`); verified `window.__xssExecuted` stays undefined.
- [x] Raw HTML is not rendered as trusted markup; output is DOMPurify-sanitized.
- [x] `<script>`, `<iframe>`, `<style>`, inline event handlers, and `javascript:` URLs are neutralized.
- [x] Images are rendered as non-fetching placeholders (verified: 0 image requests).
- [x] Sanitizer failure fails closed (throws rather than emitting unsafe HTML).

### Storage / privacy
- [x] Book/document content is never persisted (verified: only `eink-reader:preferences` key exists; no book text in storage).
- [x] Preferences persist across reloads and are validated/clamped on load.
- [x] After reload the book is gone and the user must reopen it.

### Rendering & typography
- [x] Default reading font is local Literata on an off-white paper surface.
- [x] Constrained line width (measure), readable line height, comfortable paragraph spacing.
- [x] Font family, size, line height, measure, paragraph spacing, and alignment are adjustable.
- [x] Subtle paper-grain texture with adjustable strength.

### Page mode
- [x] Content is paginated into pages sized to the viewport.
- [x] Page turns move forward/back; Home/End jump to first/last.
- [x] Page count is stable across re-measure and mode round-trips (font-load race fixed).
- [x] Progress indicator reflects current page.

### Scroll mode
- [x] Continuous scrolling column; position preserved as a fraction across settings changes.
- [x] Normal scrolling does not trigger the E Ink flash.
- [x] Switching modes preserves reading position.

### E Ink simulation
- [x] Page turns and major changes use a grayscale wash + ghosting refresh.
- [x] Partial vs full refresh cadence (full refresh interval) is implemented.
- [x] Refreshes are serialized so the overlay never gets stuck (finally-based unlock).
- [x] Intensity levels (subtle / balanced / strong) supported.
- [x] `prefers-reduced-motion` is honored (verified: `data-motion="reduced"`).

### Settings & accessibility
- [x] Settings panel opens/closes; changes apply live.
- [x] Keyboard navigation for pages and shortcuts (o/s/Esc, arrows, space, Home/End).
- [x] Focus is trapped in settings while open and restored on close.
- [x] Live-region progress announcement.
- [x] Visible focus outline suitable for grayscale.

### Responsive
- [x] Desktop layout (centered paper, max width, shadow).
- [x] Tablet and mobile layouts adapt padding/measure/controls (mobile verified at 390px).
- [x] Uses dvh where available for mobile browser chrome.

### Dependencies & fonts
- [x] markdown-it and DOMPurify vendored locally, unminified, with LICENSE files.
- [x] All fonts vendored locally as WOFF2 with OFL license texts.
- [x] `@font-face` declarations reference only local files.
- [x] Vendor manifest records source URL, version, size, sha256, and license per file.
- [x] `vendor-check.mjs` verifies integrity (17/17 verified).
- [x] Missing selected font falls back safely to the stack.

### Logging & errors
- [x] Structured logging with a debug toggle; logs never include book content.
- [x] Errors are mapped to calm, actionable messages (no raw stack traces to the user).
- [x] No stuck overlay / endless spinner / blank page on error.

### Documentation & testing
- [x] README documents usage, privacy, offline guarantees, and scripts.
- [x] LICENSES.md lists every vendored dependency and font license.
- [x] Fixtures cover TXT, Markdown, code-heavy, unsafe, Unicode, long, empty, whitespace, one-long-line, unsupported.
- [x] Playwright specs + a dependency-tolerant smoke runner cover acceptance behaviors.

---

## B00 Validation Checklist

- [x] App was opened locally via the static server.
- [x] Browser console was checked (no errors across all fixtures).
- [x] Runtime network requests were checked (0 external).
- [x] Storage was checked for book content (none; preferences only).
- [x] Desktop viewport (1200Ã—800) was tested.
- [x] Mobile viewport (Pixel 5 / 390px) was tested.
- [x] Page mode and scroll mode were both tested.
- [x] Markdown safety fixture was tested (XSS blocked).
- [x] Reduced motion was tested.
- [x] Reload was tested (prefs persist, content does not).
- [ ] Manual visual judgement of the E Ink effect credibility (requires human eyes).

---

## C00 Risks And Edge Cases

- [x] Large files do not freeze without feedback (large-file warning + async layout).
- [x] Markdown raw HTML does not render as trusted HTML.
- [x] Remote images from Markdown are not fetched.
- [x] Font-load timing does not produce inconsistent page counts (explicit `document.fonts.load` before measuring).
- [x] Flex height chain is bounded so scroll mode actually scrolls (body fixed to viewport height).
- [x] Paged `.paper` fills the stage via absolute positioning (percentage-height pitfall avoided).
- [x] Sanitizer-unavailable path fails closed.
- [ ] Behavior if a WOFF2 file is corrupted at runtime (falls back to stack; not force-tested).

---

## D00 Final Review

- [x] All implemented items were retested after the layout/pagination fixes.
- [x] Smoke suite: 10/10 checks passing.
- [x] Vendor integrity: 17/17 files verified.
- [ ] Remaining limitation: E Ink credibility and reading comfort require manual human review; automated tests cannot decide this.


## File content `specs\frank-usage-scenario.md`:

Date: 2026-07-03

---

A00 Usage Scenario Test Plan

---

This document describes the E Ink Reader from the perspective of Frank, a serious reader who uses the app as a daily reading surface for local TXT and Markdown files.

The purpose is not to describe implementation internals. The purpose is to describe the complete user experience that the finished application must support. Each scenario shows what Frank wants, what he does, what he sees, how the system should behave, and what would make the experience fail.

Frank is treated as a demanding but realistic user. He reads documentation, essays, exported notes, research files, manuals, and long-form Markdown drafts. He likes minimal software that does not interrupt him. He is comfortable with computers, but he does not want to troubleshoot a reader before he can read. If the reader feels generic, visually noisy, slow, unsafe, or unfinished, he will leave and use another tool.

The application is successful when Frank can open a local TXT or Markdown file, enter a calm reading environment, tune the page to his eyes, move between page and scroll reading, trust that his file is local, and feel that the screen has a credible E Ink-like physical quality. The application fails if it feels like a normal web page with a decorative fade.

---

B00 Frank Reader Persona

---

Frank is a vivid reader. He reads every day, but not only novels. He reads exported technical notes, saved articles, RFC-like documents, Markdown documentation, text manuscripts, meeting notes, legal-looking plain text, old public domain books, and long drafts that friends send him.

He has a folder full of `.txt` and `.md` files. Some are clean. Some are rough. Some have odd line endings. Some have headings written in Markdown. Some have long paragraphs. Some contain raw HTML copied from a website. Frank does not want to edit these files before reading them. He expects the reader to be resilient.

Frank likes modern minimal software. He wants a tool that feels intentional, quiet, and competent. He dislikes visual noise, advertising, unnecessary onboarding, cloud sign-in, and dashboards. He wants to open a file and read.

Frank uses a desktop computer for long sessions, a tablet when sitting away from his desk, and a mobile phone when he wants to read a small excerpt. He expects each device to feel supported. He does not expect all devices to look identical, but he expects each layout to feel designed.

Frank is sensitive to typography. He notices if line length is too wide, if text is too black, if the background is too white, if line spacing is cramped, or if a font feels wrong. He does not always know the technical reason, but he knows when reading becomes tiring.

Frank is curious about the E Ink simulation. He wants the interface to feel like an E Ink device: page refresh, ghosting, paper tone, grayscale calm, and a subtle physical delay. He does not want a cheap animation. He wants the reading surface to feel slower and more material than a normal website.

Frank values privacy. He is willing to open local files in a browser app only if the app clearly behaves locally. He does not want his text uploaded, cached, indexed, or remembered. He accepts that he must reopen the book each session.

Frank also values good error behavior. If something goes wrong, he wants a clear explanation and a next step. He does not want silent failure, a blank page, or a raw stack trace.

---

C00 Frank's First Contact With The App

---

Frank opens the application for the first time on his desktop computer.

He sees a quiet page. The background is not bright white. The center of the screen contains a clear drop area and a file-open button. The text says that he can drop a TXT or Markdown book there. It also says that the file is read locally in the browser, is not uploaded, and is not stored.

Frank pauses for a moment because this message matters. He has private notes in Markdown. The application does not ask him to create an account. It does not show a cloud sync button. It does not advertise a library. It does not ask him to grant broad storage access. The first screen gives him enough trust to proceed.

He sees that supported formats are limited to `.txt`, `.md`, and `.markdown`. This is not presented as a limitation hidden in a help menu. It is visible at the moment when he needs it.

The expected result is that Frank understands the product within seconds. He knows where to drop the file, which files are accepted, and what privacy behavior to expect.

The failure condition is that the first screen looks like a generic upload form, uses bright web styling, hides privacy behavior, or implies that files may be uploaded or stored. Another failure condition is that the first screen is too wordy. Frank should not have to read a policy before opening a book.

---

D00 Opening A Plain Text Book With The File Picker

---

Frank chooses a plain text file from his local folder. The file is an old essay exported as `.txt`. It has a title on the first line, a blank line, then paragraphs.

He clicks the file-open button. The system file picker opens. He selects the file. The reader validates the extension and reads the file locally.

While the file is being processed, Frank sees a brief device-like transition. The empty drop surface fades into a reading surface through an E Ink-like refresh. The screen does not simply crossfade. It feels like the old state is being cleared and a new page is being written. The transition is short enough that it does not feel slow, but visible enough that the reader has a physical character.

The text appears in a centered reading column. The default font is Literata. The page has an off-white paper tone, dark charcoal text, subtle texture, and calm spacing. The first line becomes the visible title or appears naturally as part of the text, depending on the file structure. Paragraphs are readable. Blank lines have been interpreted as paragraph breaks rather than collapsed into one dense wall.

Frank reads the first page. He notices that the line length is not too wide. The app does not use browser-default text rendering. The surface feels intentionally designed.

The expected result is that a TXT file opens without configuration, renders as prose, and enters the reader state. The file content is not uploaded, not stored, and not logged in detail.

The failure condition is that the TXT file appears as one giant preformatted block, as a single paragraph, as tiny browser-default text, or as a raw file dump. Another failure condition is that the app visibly stores or restores the text after reload.

---

E00 Opening A Plain Text Book By Drag And Drop

---

On another day, Frank does not use the file picker. He drags `notes-on-distributed-systems.txt` from his desktop and drops it into the drop zone.

The drop area responds before he releases the file. It should show a restrained visual state that says the app is ready. It must not become bright, animated, or distracting. When Frank releases the file, the app validates that only one file was dropped.

The app reads the file and performs the same transition into the reader. Frank should not be able to tell that this route is less supported than the file picker route. Drag-and-drop is a first-class path.

The expected result is that drag-and-drop works reliably for supported files and shows the same reading experience as file picker input.

The failure condition is that dropping the file does nothing, opens the file in the browser tab directly, navigates away from the app, or chooses a file silently when multiple files are dropped.

---

F00 Rejecting Multiple Dropped Files

---

Frank accidentally selects three files and drops them into the app at once.

The app does not pick the first file silently. It does not try to concatenate the files. It does not enter a broken intermediate state.

The app shows a clear message: open one book file at a time. The file-open screen remains usable. Frank can immediately drop one file or use the file picker again.

The expected result is that Frank understands what happened and can recover without refreshing the page.

The failure condition is silent selection, partial loading, file concatenation, an uncaught console error, or a broken drop zone after the mistake.

---

G00 Rejecting Unsupported File Types

---

Frank drags a PDF into the app because he forgets that this version only supports TXT and Markdown.

The app rejects the file. It explains that the file type is not supported and asks him to open a `.txt`, `.md`, or `.markdown` file.

The error is visible, calm, and recoverable. It does not say "invalid input" without context. It does not show a JavaScript exception. It does not imply that the app tried to parse the PDF.

Frank is not annoyed because the app is direct and honest. He picks a Markdown file instead.

The expected result is that unsupported types are rejected before parsing, with a clear next action.

The failure condition is that the app tries to read unsupported binary files, freezes, shows a blank reader, or logs raw binary-looking content.

---

H00 Opening A Markdown File

---

Frank opens a Markdown file containing headings, paragraphs, lists, blockquotes, inline code, fenced code blocks, links, and horizontal rules.

The app detects Markdown by extension and parses it safely. The resulting reading view feels like a book or a long-form document, not like a GitHub preview page copied into the browser. Headings create structure, but they are not oversized. Paragraph spacing is calm. Lists are compact and readable. Code blocks are legible without overwhelming the page. Blockquotes are quiet and book-like.

The E Ink transition still occurs on file load. Once the Markdown is rendered, Frank sees a reading surface, not a technical preview.

If the Markdown file has a first heading, the app may use it as the document title. If not, the file name may serve as the title. The title behavior should feel natural and not overbearing.

The expected result is that Markdown renders into safe, readable semantic content with typography tuned for reading.

The failure condition is that Markdown appears as raw source, that headings and lists use unstyled browser defaults, that code blocks overflow badly on mobile, or that the app renders raw HTML as trusted markup.

---

I00 Raw HTML In Markdown

---

Frank opens a Markdown file exported from another tool. It contains Markdown paragraphs, but it also contains copied HTML such as `<div>`, `<script>`, inline event handlers, and image tags from a web export.

Frank does not know or care that this content is risky. The app must treat it as untrusted.

The app does not execute scripts. It does not render raw HTML as trusted content. It does not load remote images. It does not apply inline styles from the file. It does not let the file change the reader layout.

The safest visible behavior is that the app strips unsafe markup and preserves readable text where possible, or escapes raw HTML so Frank can see that there was markup in the source. The exact choice should be consistent and understandable.

Frank should be able to keep reading the document. The app may show a small warning if unsafe Markdown content was removed, but it should not panic or make the reading surface feel dangerous.

The expected result is that hostile or messy Markdown cannot execute, cannot fetch remote resources, and cannot damage the reader.

The failure condition is any script execution, raw event handler execution, remote image fetch, iframe rendering, style injection, or persistent storage of unsafe content.

---

J00 Empty And Broken Files

---

Frank opens an empty `.txt` file by mistake.

The app reads the file, recognizes that there is no readable content, and shows a clear message. It does not enter a reader with an empty white page and no explanation.

Frank then opens a whitespace-only file. The same kind of clear recovery occurs.

Frank then opens a malformed Markdown file. The app tries to parse it safely. If parsing succeeds, it renders the best safe reading result. If parsing fails, it offers a fallback such as opening the file as plain text for this session.

The expected result is that malformed or empty inputs do not break the app. Frank always has a next step.

The failure condition is blank screen, endless spinner, parser exception in the UI, or unrecoverable state.

---

K00 Large File Handling

---

Frank opens a long plain text book. It is large enough that pagination may take noticeable time.

The app does not freeze without feedback. It shows a subtle busy state while reading, normalizing, rendering, or paginating. The message should be restrained, but it should make clear that the app is working.

If the file is above a warning threshold but still accepted, Frank sees a warning that large files may take longer to paginate. The warning should not block him unnecessarily.

If the file is above the hard limit, the app rejects it with a clear explanation. The app should not attempt to load a file that risks freezing the browser.

When the file is accepted, the reader eventually appears in a stable state. If page mode cannot paginate the file reliably, the app may fall back to scroll mode and explain that the file is too large or complex for page layout.

The expected result is responsive, recoverable large-file behavior.

The failure condition is browser lockup, silent truncation, broken pagination, incorrect page count, or losing control of the UI.

---

L00 First Reading Session In Page Mode

---

Frank's default mode is page mode.

The reader shows a page-like surface with text sized for comfortable reading. The interface around the page is quiet. Frank sees only the content, subtle progress, and minimal controls. The page does not feel like an article inside a website. It feels like a reader.

Frank presses the Right Arrow key. The next page appears through a partial E Ink refresh. The old page leaves a faint residue during the transition. The new page settles into place. The motion is not a slide. It is not a carousel. It is not a fade. It resembles display refresh.

Frank presses the Left Arrow key. The previous page appears with the same physical behavior. He uses Space to advance. He uses Shift + Space to go back. He uses the visible next and previous controls with the mouse. He taps the page edge on a tablet.

The page count updates correctly. Page position is visible but subtle. Frank can tell where he is without feeling watched by a dashboard.

The expected result is that page mode supports keyboard, mouse, and touch navigation with credible E Ink transitions.

The failure condition is web-like sliding animation, no transition, stuck overlays, page index errors, controls that steal focus, or navigation that fails after resize.

---

M00 E Ink Full Refresh During Major State Changes

---

Frank opens a file and then changes a major setting. He switches from Literata to Charis SIL. The text reflows.

The app treats this like a full device redraw. It does not instantly jump from one layout to another. It uses a full E Ink refresh that clears the old layout, applies the new font, waits for layout stability, and then reveals the updated page.

Frank changes theme from warm paper to cool paper. Again, the surface refreshes. The change feels like the device is repainting itself.

Frank switches from page mode to scroll mode. The transition is more substantial, so the app uses a full refresh. The old paged surface clears. The scroll surface appears. Frank remains near the same content position if possible.

The expected result is that major visual and layout changes use a realistic refresh and preserve orientation.

The failure condition is that settings changes jump abruptly, lose reading position unnecessarily, leave ghost overlays stuck, or make the app look broken during reflow.

---

N00 Partial Refresh And Ghosting During Page Turns

---

After reading several pages, Frank notices a subtle ghosting effect. During page changes, the outgoing page leaves a pale residual impression for a moment. It is visible enough to remind him of E Ink, but not enough to interfere with reading.

After several partial page turns, the app may perform a fuller refresh that clears accumulated ghosting. This should feel intentional. It should not surprise Frank with harsh flashing. If the app supports a full refresh interval setting, Frank can adjust how often it happens.

The expected result is believable partial refresh behavior with controlled ghosting.

The failure condition is excessive ghosting that makes text hard to read, random flashing, no distinction between full and partial refresh, or accumulated visual artifacts that never clear.

---

O00 Scroll Mode Reading

---

Frank opens settings and switches to scroll mode because he wants to skim a long technical document.

The app refreshes into a continuous reading column. Frank scrolls normally. The surface still looks like an E Ink reader: grayscale, low contrast, paper tone, and calm typography. However, the app does not trigger a heavy flash on every small scroll movement. That would be tiring and unusable.

When Frank jumps to the top, changes font, changes theme, or switches back to page mode, the app uses the E Ink transition. Normal scrolling remains smooth and readable.

Frank uses PageDown, PageUp, Home, and End. The behavior feels natural. Mobile scrolling feels stable. The page does not fight his finger.

The expected result is that scroll mode is a first-class reading experience and not a fallback.

The failure condition is heavy animation during scroll, poor scroll performance, lost position after settings change, or a layout that feels like a generic web article.

---

P00 Typography Preferences

---

Frank likes the default Literata font, but he wants to compare reading styles.

He opens settings and sees a typography section. The font list contains a small curated set of local fonts. Literata is selected. Other options may include Charis SIL, Source Serif 4, Merriweather, Atkinson Hyperlegible, and Noto Serif, depending on which fonts are bundled.

The list does not fetch fonts from the network. Switching fonts uses local assets.

Frank selects Charis SIL because he wants an older, book-like feel. The app performs a full E Ink refresh and repaginates. Frank sees the same content in the new font. Page count may change. The app keeps him near the same reading position.

Frank selects Atkinson Hyperlegible because he wants high distinguishability. The text becomes more utilitarian but very clear. He decides whether he prefers it.

Frank increases font size. The app repaginates. The text remains readable. Controls do not overlap the page. Progress remains accurate.

Frank adjusts line height. The page breathes more. The app repaginates again and preserves location.

Frank adjusts measure or page width. The line length changes. On desktop, the page stays centered. On mobile, the app keeps the content usable.

The expected result is that typography settings produce immediate, stable, readable changes.

The failure condition is font loading from network, font menu showing unavailable fonts, layout jumping to the beginning of the book, incorrect page count, or text becoming unreadable.

---

Q00 Display And Theme Preferences

---

Frank reads at his desk during the day. He prefers warm paper, soft contrast, and subtle texture. The default theme fits this use.

At night, he wants less brightness. He opens settings and chooses a darker or lower-brightness theme if available. The transition uses a full refresh. The reading surface changes without feeling like a web theme switch.

Frank tries high contrast mode. The text becomes clearer and stronger. This mode is useful if the soft E Ink simulation becomes tiring. High contrast still stays within a grayscale design language.

Frank adjusts texture strength. Low texture is barely visible. Higher texture makes the surface feel more paper-like, but it should never interfere with reading. If texture becomes too heavy, the app fails Frank's core need.

Frank adjusts margins. On desktop, wider margins make the page feel calm. On mobile, margins must not consume too much space.

The expected result is that display settings let Frank tune comfort without breaking the E Ink identity.

The failure condition is pure white default background, pure black default text, saturated colors, harsh texture, or settings that produce inaccessible combinations without safeguards.

---

R00 E Ink Intensity Preferences

---

Frank is curious about the effect itself.

He opens the E Ink settings. He sees choices such as off, reduced, balanced, and strong. Balanced is the default.

Frank chooses strong. Page turns become more visibly E Ink-like. There may be more flicker, stronger wash, more noticeable ghosting, or a more obvious full refresh. It still must remain controlled and safe.

Frank chooses reduced. The paper surface remains, but flashes are softer and motion is lower. This mode is useful when he wants the reading aesthetic without visual interruption.

Frank chooses off. Page changes become simple and calm, but the app remains a good reader. Turning off the effect should not make layout or navigation worse.

The expected result is that E Ink intensity is user-controlled and all modes are usable.

The failure condition is an effect that cannot be reduced, an off mode that still flashes, a strong mode that becomes visually unsafe, or settings that do not persist.

---

S00 Reduced Motion System Preference

---

Frank's laptop has reduced motion enabled at the operating system level.

When he opens the reader for the first time, the app detects this preference and defaults to reduced motion behavior. It still looks like a paper reader, but it avoids aggressive flashing and rapid transitions.

Frank can open settings and see that motion is set to follow the system. He can explicitly choose another mode if he wants, but the default respects the system.

When he changes pages, the transition is restrained. When he changes settings, the refresh is present but softened.

The expected result is that reduced motion affects the app before the first major animation.

The failure condition is that the app performs full aggressive flashes before reading the system preference, ignores the preference, or requires Frank to hunt for a setting to make the app comfortable.

---

T00 Settings Panel Behavior

---

Frank opens settings while reading.

The settings panel appears without disorienting him. It may be a side panel on desktop, a modal panel, or a bottom sheet on mobile, but it must feel like part of the reader. It must not cover the whole experience in a noisy way unless the screen is too small.

Focus moves into the settings panel. Frank can navigate controls by keyboard. Escape closes the panel. Touch controls are large enough on tablet and mobile.

The panel is organized into reading mode, typography, display, E Ink behavior, accessibility, and advanced diagnostics. It does not feel like an internal developer form. Labels are short. Defaults are understandable.

When Frank changes a setting, the result is visible quickly. When the change requires re-layout, the app shows a subtle busy or refresh state. It does not let him stack multiple broken transitions.

When he closes settings, focus returns to the reader in a sensible place. He continues reading.

The expected result is that settings are powerful but not distracting.

The failure condition is inaccessible focus behavior, cramped controls, settings that lose state, unclear labels, or a panel that feels disconnected from the reader.

---

U00 Preference Persistence Without Book Persistence

---

Frank customizes the app. He chooses Charis SIL, increases font size, selects scroll mode, and uses warm paper with reduced E Ink intensity.

He closes the browser tab.

Later, Frank opens the app again. His preferences are restored. The app uses his chosen font, mode, theme, and effect intensity. However, the book itself is not restored. The screen tells him that preferences were restored and that he must reopen the book file to continue reading.

This behavior is important. Frank trusts the app more because it remembers how he likes to read without storing what he was reading.

Frank opens the same file manually. The app renders it using his restored preferences.

The expected result is preference persistence only. Book contents must not persist.

The failure condition is that the app restores the book body after reload, stores parsed content, caches pages, stores excerpts, or silently forgets preferences.

---

V00 Storage Privacy Verification From Frank's Perspective

---

Frank is technical enough to inspect the browser storage.

After loading a private Markdown file, he opens developer tools and checks localStorage. He sees preference keys. He does not see the text of his document. He does not see paragraphs, page HTML, Markdown source, excerpts, bookmarks with copied text, or a search index.

He reloads the page. The book is gone. Preferences remain.

He closes and reopens the app. The book is still gone. Preferences remain.

The expected result is a privacy model that is technically true, not only stated in UI copy.

The failure condition is any persistent storage of book content.

---

W00 Desktop Reading Environment

---

Frank uses the reader on a large desktop monitor.

The page is centered and calm. The line length is constrained. The app does not stretch text across the full monitor. Controls are nearby but quiet. Keyboard navigation works. Mouse navigation works. Settings can appear without covering the whole page unless necessary.

The paper surface has enough presence to feel separate from the browser background. It may have a subtle border, shadow, or tonal difference, but it should not look like a glossy card.

Frank reads for twenty minutes. The app does not distract him. Page turns are consistent. The UI does not pop in unnecessarily. The cursor and controls do not dominate the reading surface.

The expected result is that desktop reading feels like a focused reader, not a responsive webpage.

The failure condition is overly wide text, web-page chrome, noisy controls, poor keyboard behavior, or decorative effects that become tiring.

---

X00 Tablet Reading Environment

---

Frank opens the reader on a tablet in landscape orientation.

The app adjusts to the tablet screen. Touch targets are comfortable. Page mode feels natural. Frank can tap or swipe to advance if those interactions are implemented. The settings panel is reachable and touch-friendly.

He rotates the tablet to portrait orientation. The app recalculates layout and preserves his approximate reading position. It uses an E Ink-like refresh for the major layout change. Page count may change, but Frank does not lose his place.

The typography remains comfortable. The page is not too narrow in landscape and not too cramped in portrait.

The expected result is tablet support that feels deliberate.

The failure condition is broken orientation handling, controls too small to tap, page content clipped, lost position after rotation, or settings that do not fit the screen.

---

Y00 Mobile Reading Environment

---

Frank opens the reader on a phone.

He does not expect a desktop page. He expects a narrow but readable surface. The file-open screen fits the viewport. The drop zone may be less important than the file picker, but both should remain logically supported where the browser allows.

After opening a file, text is large enough to read. Margins are modest. Controls do not cover the text. Settings open in a mobile-appropriate layout, likely full-screen or sheet-like.

In scroll mode, the page scrolls naturally. In page mode, the page surface is compact but usable. Keyboard shortcuts are less relevant, but touch behavior matters.

Frank changes font size on mobile because the default is slightly small for that screen. The app refreshes and reflows without breaking layout.

The expected result is a complete mobile reading experience, not merely a shrunken desktop app.

The failure condition is horizontal scrolling, clipped controls, page turns that interfere with normal touch scrolling, or settings that are impossible to close.

---

Z00 Keyboard-Only Reading

---

Frank uses the reader without a mouse.

He opens the app, tabs to the file-open button, and opens a file. Once reading, he uses Right Arrow, Left Arrow, Space, Shift + Space, PageDown, PageUp, Home, and End. He opens settings with a keyboard shortcut if implemented. He closes settings with Escape.

Focus is visible. Focus does not disappear into the page. Keyboard shortcuts do not trigger while he is interacting with sliders, selects, buttons, or text inputs.

Frank can complete a reading session using only the keyboard.

The expected result is that keyboard use is complete and predictable.

The failure condition is hidden focus, shortcuts interfering with form controls, no keyboard path to settings, or keyboard navigation that stops working after a transition.

---

AA00 Error Recovery During Reading

---

Frank changes settings rapidly. He switches font, changes line height, switches reader mode, then resizes the browser.

The app may need to cancel and restart layout work. It should not become confused. It should not leave an overlay stuck on screen. It should not show two active settings states. It should not navigate to an invalid page.

If pagination fails, the app should recover. It may switch to scroll mode and show a warning. If a font fails, the app should fall back to another font and continue. If the Markdown parser is unavailable because a vendored file is missing, the app should explain that Markdown rendering is unavailable rather than showing a blank page.

The expected result is that mid-process errors are recoverable.

The failure condition is a stuck busy state, invalid page index, broken controls, blank reader, or repeated uncaught errors.

---

AB00 Missing Dependency Or Missing Font

---

Frank is using a copy of the app where a vendored dependency file is missing.

If the Markdown parser is missing and Frank opens a Markdown file, the app should detect the issue and show a clear error. It should not attempt to call an undefined parser and crash. It may offer to open the file as plain text if safe.

If the sanitizer is missing, the app should not render unsafe Markdown HTML. It should fail closed or use a safe parser mode that does not allow raw HTML. Security must win over convenience.

If a selected font file is missing, the app should fall back to Literata. If Literata is missing, it should fall back to a system serif. It should log the failure and keep the reader usable.

The expected result is graceful degradation with clear diagnostics.

The failure condition is unsafe rendering, blank screen, or unreadable text because a font did not load.

---

AC00 Logging And Diagnostics As Experienced By Frank

---

Frank normally does not see logs. The reader should not expose technical noise during a normal session.

When something goes wrong, Frank sees a clear message. If he enables debug mode in advanced diagnostics, he can see recent local logs. The logs include events such as file selected, file validated, parser started, renderer completed, pagination failed, or font fallback used.

The logs do not include full book text. They do not include paragraphs from the file. They do not send anything to a server. If Frank copies diagnostics, he can share them without accidentally sharing the book content.

The expected result is useful local troubleshooting without privacy leakage.

The failure condition is noisy console spam, user-visible stack traces, remote telemetry, or logs containing private text.

---

AD00 Offline And No-Network Runtime

---

Frank opens the reader while offline.

The app still loads. The fonts work. The Markdown parser works. The E Ink effects work. Textures and icons work. Settings work. No part of the normal reader experience depends on Google Fonts, jsDelivr, GitHub, unpkg, analytics, or any remote host.

Frank opens a Markdown file with a remote image reference. The app does not fetch the image. It either ignores it, shows a placeholder, or displays the syntax safely, depending on the implementation decision.

Frank clicks an external link only if he intentionally chooses to. The app does not prefetch links.

The expected result is a fully offline runtime.

The failure condition is missing fonts offline, missing parser offline, remote image requests, or any unexpected network call during normal use.

---

AE00 Reading Position During Active Session

---

Frank reads halfway through a book in page mode.

He opens settings and switches to scroll mode. The app tries to keep him near the same content, not necessarily the same pixel or exact paragraph, but close enough that he is not disoriented.

He changes font size. The app reflows and keeps him near the same content. He rotates his tablet. The app recalculates and keeps him near the same content.

Within the active session, this behavior matters. Across sessions, the app does not restore the book because the book is not stored. The app should not pretend otherwise.

The expected result is active-session position preservation without persistent content storage.

The failure condition is jumping to the beginning after every setting change, restoring content after reload, or storing text to support position recovery.

---

AF00 Visual Quality During Long Reading

---

Frank reads for an extended period.

The app remains visually stable. The paper tone does not fatigue him. The texture does not shimmer. The E Ink transition does not become annoying. Ghosting stays subtle. Text remains sharp. Page turns do not stutter repeatedly.

If the effect becomes too much, Frank can reduce it. If text contrast is too low, he can raise contrast. If the default font does not fit him, he can change it.

The expected result is a reader that supports actual reading, not only a demo.

The failure condition is an effect that looks impressive for ten seconds but becomes unusable for a real session.

---

AG00 Frank Compares The App To Alternatives

---

Frank has other options. He can open Markdown in an editor, view TXT files in a browser, use a note app, or send the file to an e-reader.

He stays with this app only if it gives him a better reading surface. The app must justify itself through calm presentation, local privacy, reliable parsing, good typography, and credible E Ink behavior.

The first five minutes matter. If the app opens quickly, looks good, respects his file, and gives him useful settings, he will continue. If it feels random, generic, unsafe, or visually broken, he will leave.

The expected result is that Frank chooses the app because it feels like a dedicated reader.

The failure condition is that the app technically loads files but gives no meaningful experience advantage over a default browser tab.

---

AH00 Scenario Coverage Map

---

This usage scenario covers the expected happy paths: first launch, TXT open, Markdown open, page reading, scroll reading, typography changes, display changes, E Ink tuning, desktop use, tablet use, mobile use, keyboard use, and preference persistence.

It also covers expected failure paths: unsupported files, multiple file drops, empty files, malformed Markdown, raw HTML, large files, missing dependencies, missing fonts, pagination failure, reduced motion, offline mode, and storage privacy.

The finished application should be tested against this document as a narrative checklist. A feature is not complete only because a function exists. It is complete when Frank can use it naturally, understand the result, recover from mistakes, and continue reading.

---

AI00 Final Test Narrative

---

Frank starts with a folder of plain text and Markdown books. He opens the app. The app presents a quiet local-first reader, not a cloud product. He opens a TXT file. It becomes a calm page. He turns pages with the keyboard and sees a subtle E Ink refresh. He opens a Markdown file. Headings, paragraphs, lists, blockquotes, and code render safely and readably. Raw HTML does not execute.

Frank changes fonts. Literata is the default, but he can select other local fonts. The app refreshes and repaginates like a device. He changes font size, line height, paper tone, texture, contrast, and E Ink intensity. The reader preserves his place within the active session. He switches between page mode and scroll mode. Each mode feels intentional.

Frank uses the app on desktop, tablet, and mobile. The layouts differ, but each one supports reading. Keyboard operation works on desktop. Touch operation works on tablet and mobile. Reduced motion is respected. Offline runtime works. Preferences persist. Book content does not.

Frank makes mistakes. He drops too many files, opens a PDF, opens an empty file, opens messy Markdown, and changes settings quickly. The app handles these cases without losing control. It shows clear messages, logs useful diagnostics, and keeps private text out of persistent storage and logs.

The best version of the software gives Frank a focused reading environment that feels deliberate, private, and physically calm. It does not merely render text. It creates a credible E Ink-style reading surface for local TXT and Markdown files.






## File content `specs\frank-usage-scenario_todo.md`:

# specs/frank-usage-scenario_todo.md

Source: specs/frank-usage-scenario.md
Pass: Frank (demanding daily long-form reader)

Frank reads for hours and will leave for a better tool if the app feels weak,
generic, or uncomfortable. These items judge serious reading quality, typography,
page/scroll behavior, privacy, full feature coverage, and credible E Ink feel.

---

## A00 Acceptance Checklist

### Serious reading comfort
- [x] Default surface is warm off-white paper with local Literata, not a raw white page.
- [x] Line width (measure) is constrained to a comfortable range, not full-bleed.
- [x] Line height and paragraph spacing default to relaxed, book-like values.
- [x] Subtle paper grain adds texture without harming legibility (adjustable).
- [x] Left alignment by default with optional justification.
- [x] Long single-line text wraps rather than overflowing.

### Page mode as a first-class experience
- [x] Page turns feel intentional, with an E Ink wash + ghost, not a jump-cut.
- [x] Page count is stable â€” the progress readout does not jitter between values.
- [x] Forward/back, first/last, and click zones all work.
- [x] Reading position is preserved across font/size/measure changes.

### Scroll mode as a real alternative
- [x] Scroll mode is smooth and does not flash on ordinary scrolling.
- [x] Position is preserved when switching between page and scroll.

### Typography control that matters to a power reader
- [x] Multiple high-quality serif choices (Literata, Source Serif 4, Charis SIL, Merriweather).
- [x] A legible option (Atkinson Hyperlegible) for tired eyes.
- [x] Size, line height, measure, paragraph spacing, alignment all adjustable and persistent.

### Visual E Ink credibility
- [x] Grayscale wash + ghost image during refresh.
- [x] Occasional full refresh vs frequent partial refresh (configurable interval).
- [x] Intensity levels so Frank can tune the effect.
- [x] Reduced-motion path stays calm and legible.

### Privacy Frank can trust
- [x] No book content is ever stored; only preferences persist.
- [x] No network requests while reading.

### Feature completeness
- [x] Themes (warm/cool/dark/high-contrast) + contrast toggle for different lighting.
- [x] Diagnostics available for the curious without cluttering the main UI.
- [x] Recovers cleanly from bad files without losing the session.

---

## B00 Validation Checklist

- [x] Read a long book fixture end-to-end in page mode; page turns and count are stable.
- [x] Switched to scroll mode mid-book; position preserved; no flashing on scroll.
- [x] Changed font family and size; text reflowed and position was preserved.
- [x] Toggled themes including dark and high-contrast.
- [x] Confirmed no stored book content and no network requests.
- [ ] Manual: judged whether the E Ink effect and paper surface feel good over a long session.

---

## C00 Risks And Edge Cases

- [x] Page-count instability (font-load race) â€” fixed; verified stable across re-measure.
- [x] Paper not filling the screen in page mode â€” fixed (absolute-positioned paper).
- [x] Scroll mode not scrolling â€” fixed (bounded viewport height).
- [ ] Very large books: paginates with a warning; extreme sizes not stress-tested for turn latency.

---

## D00 Final Review

- [x] Earlier design flaws found during Frank review were fixed, not papered over.
- [x] Reading defaults are book-like out of the box.
- [ ] Remaining limitation: subjective comfort/credibility needs a human long-form session.


## File content `specs\lily-usage-scenario.md`:

Date: 2026-07-03

---

A00 Lily Usage Scenario Test Plan

---

This document describes the E Ink Reader through Lily's experience.

Lily is not a daily power user. She reads books, notes, and documentation occasionally. She may use the reader intensely for one afternoon, then not return for several weeks. She does not want to remember how the app works. Each time she comes back, the app should feel obvious again.

The purpose of this usage scenario is to test whether the application feels smooth, calm, predictable, and self-explanatory for a user who does not want to diagnose software behavior. Lily should not need to understand file parsing, Markdown security, browser storage, pagination, local font loading, reduced motion settings, or E Ink simulation internals. The app should handle those details quietly.

The application succeeds for Lily when she can open a local TXT or Markdown file, read or skim what she needs, adjust only the settings she understands, recover from mistakes without stress, and leave the app without worrying that her content was stored or uploaded.

The application fails for Lily when she sees confusing errors, blank states, technical language, broken layouts, hidden controls, unexpected behavior, or too many choices presented too early.

---

B00 Lily Reader Persona

---

Lily reads when she has a reason.

She may open a Markdown document because someone sent her setup instructions. She may open a TXT file because she exported notes from another app. She may read a public domain book for a few evenings, then stop. She may open a technical document only because she needs one paragraph or one command.

She does not spend much time customizing software. She does not want a complex workspace. She does not want to learn a "reader system." She wants the app to understand the simple thing she is trying to do: open the file, make it readable, and stay out of the way.

Lily is capable and thoughtful, but she is not interested in troubleshooting. She does not expect rough edges. If a tool produces a confusing error, she assumes she did something wrong. A good application should not make her feel that way.

Lily prefers applications that feel complete. She likes soft visual design, clear labels, minimal decisions, and interfaces that do not punish mistakes. She appreciates small animations when they make the app feel polished, but she does not want motion that calls attention to itself.

Lily has less tolerance for unclear software than Frank. Frank may inspect logs or test storage behavior. Lily will not. Lily judges the app by whether it calmly guides her.

---

C00 Lily's Situation Before Using The App

---

Lily receives a Markdown file named `onboarding-notes.md`.

She does not normally read Markdown. She knows it is a text document, but she is not certain how it should look. Opening it in a basic editor shows punctuation, hashes, backticks, and links. It feels messy.

She wants to read the file as a normal document. She does not want to install a full editor. She does not want to create an account. She does not want the file uploaded to a service. She wants a simple reading screen.

She opens the E Ink Reader.

The app should immediately reduce uncertainty. The first screen should not assume she knows what Markdown is. It should say, in plain language:

"Drop a TXT or Markdown file here."

Below that, it should say:

"Your file is read locally in this browser. It is not uploaded or stored."

A button should say:

"Open file"

The supported formats should be visible:

"Supported files: .txt, .md, .markdown"

The expected result is that Lily knows what to do without reading documentation.

The failure condition is that the app starts with a technical dashboard, hidden upload control, unclear drag area, or unexplained empty screen.

---

D00 First Launch Feeling

---

The first launch should feel quiet.

Lily sees an off-white surface, soft dark text, and a centered opening area. The interface does not use loud colors. It does not use developer terminology. It does not mention parsing, dependencies, localStorage, sanitization, or browser APIs.

The app should feel like a small reading device. It should not feel like a form.

Lily should not be asked to choose a font, choose a mode, accept terms, configure storage, or read a setup guide before opening her first file. The default experience should be good enough.

If the app needs to show any explanation, it should be short and placed near the action.

Acceptable first-screen copy:

"Open a TXT or Markdown file to start reading."

"Your file stays on this device for this session."

"Preferences are remembered. Book contents are not."

The expected result is confidence without instruction overload.

The failure condition is onboarding bloat, excessive settings before use, or privacy behavior hidden behind a link.

---

E00 Opening A File From The File Picker

---

Lily clicks "Open file."

The browser file picker opens. She chooses `onboarding-notes.md`.

The app validates the file and reads it locally. If the file is accepted, the opening screen changes into the reader with a soft E Ink refresh. The transition should feel smooth and deliberate, not flashy. Lily should understand that the app is moving from "open a file" to "read the file."

The Markdown appears as a readable document. The headings become headings. Paragraphs become paragraphs. Lists look like lists. Code blocks are visible but not intimidating. Links are readable. The text is centered in a comfortable reading column.

Lily does not need to know that the default font is Literata. She only needs to feel that the text is readable.

The expected result is that Lily goes from file selection to reading with no intermediate decisions.

The failure condition is that the file opens as raw Markdown, a blank page, a browser download, or a technical preview with poor spacing.

---

F00 Opening A File By Drag And Drop

---

A week later, Lily opens the app again and drags a file named `travel-checklist.txt` onto the page.

The drop zone should respond gently. It might darken slightly, show a border, or display:

"Drop to open this file"

When she releases the file, the app should load it if it is supported.

The TXT file should not appear as a dense block. It should be converted into readable paragraphs. If the file contains blank lines, the app should use them as paragraph breaks. If the file has a clear first line, the reader may use it as a title or render it prominently.

The expected result is that Lily sees drag-and-drop as natural and safe.

The failure condition is that dropping a file navigates away from the app, opens the file directly in the browser, or does nothing.

---

G00 When Lily Drops Too Many Files

---

Lily selects two files by mistake and drops both into the app.

The app should not behave unpredictably. It should not open one of them silently. It should not merge them. It should not show a technical error.

The message should be calm:

"Open one file at a time."

A second line should explain the next action:

"Choose a single .txt, .md, or .markdown file to continue."

The app should keep the file-open area visible. Lily should not have to reload.

The expected result is that Lily understands the mistake and can immediately correct it.

The failure condition is silent first-file selection, file merging, a red technical error, or a stuck drop state.

---

H00 When Lily Opens The Wrong File Type

---

Lily accidentally selects a PDF.

The app should reject it before attempting to render it. The message should be clear and nonjudgmental:

"This file type is not supported."

Then:

"Open a .txt, .md, or .markdown file."

The button should remain available:

"Choose another file"

The app should not say "invalid MIME type" or "unsupported binary input." Lily does not need that language.

The expected result is that Lily knows exactly what kind of file to choose next.

The failure condition is a vague error such as "Something went wrong," a stack trace, or an attempt to process the PDF.

---

I00 When Lily Opens An Empty File

---

Lily opens a notes file that turns out to be empty.

The app should not show an empty reader and leave her wondering whether loading failed. It should say:

"This file is empty."

Then:

"Choose another TXT or Markdown file to read."

The page should remain calm. The file-open button should be easy to find.

The expected result is that an empty file feels like a simple file issue, not an app failure.

The failure condition is a blank page, spinner, or console-only error.

---

J00 When Lily Opens A Very Large File

---

Lily opens a large TXT export from another app. She does not know whether it is unusually large.

If the app can read it safely but needs time, it should show a short message:

"This file is large. Preparing the reading view may take a moment."

If pagination takes longer than expected, the app should continue to show that it is working. It should not freeze silently.

If the file is too large for this version, the app should stop early and say:

"This file is too large for this reader."

Then:

"Try a smaller TXT or Markdown file."

If the app can offer scroll mode as a fallback, the message should be:

"This file is large, so page mode may be slow. You can read it in scroll mode instead."

Buttons may say:

"Use scroll mode"

"Choose another file"

The expected result is that Lily never has to guess whether the app is broken.

The failure condition is browser freezing, an endless spinner, partial rendering with missing text, or an unexplained crash.

---

K00 Reading A Markdown Document Smoothly

---

Lily's onboarding Markdown file has headings, numbered steps, bullet points, links, and short code snippets.

The rendered document should make the content easier to read than the source file. The app should hide Markdown syntax where appropriate and show a clean reading result.

A heading such as `## Installation` should appear as a calm section heading.

A list of steps should be compact and readable.

A code block should appear in a simple monospace style, but it should not dominate the page.

Links should look clickable without becoming bright blue browser defaults that break the E Ink visual style.

Lily should be able to skim the document and find the section she needs. If headings are available, the reader may provide subtle section navigation, but it should not overwhelm her. This is optional. The core requirement is that the document itself is easy to scan.

The expected result is that Markdown becomes approachable.

The failure condition is raw Markdown, oversized headings, poor list spacing, code blocks that overflow on mobile, or links that look visually inconsistent.

---

L00 Raw HTML In Lily's Markdown File

---

Lily opens a Markdown file copied from a web page. It contains raw HTML, style tags, and image tags.

She does not know this. She expects a document.

The app should protect her without making the experience frightening. It should not execute raw HTML. It should not load remote images. It should not let the file change the reader interface.

If the app removes unsafe content, it may show a small message:

"Some unsafe formatting was removed."

If more explanation is useful:

"The readable text was kept where possible."

The message should not say "XSS," "sanitizer," "DOMPurify," or "script injection" in the normal UI. That belongs in diagnostics, not in Lily's reading path.

The expected result is that Lily can continue reading safely.

The failure condition is script execution, unexpected external loading, scary technical errors, or broken document rendering because of raw HTML.

---

M00 Lily's First Page Turn

---

Lily starts in page mode.

She reads the first page and clicks the next control. The page refreshes with a soft E Ink-like effect. It should feel like the surface is being redrawn. The motion should be short and calm.

Lily should not have to understand page controls. The next and previous controls should be visible enough to discover, but not so prominent that they distract.

The page indicator should be simple:

"Page 2 of 18"

If page count is still being calculated, the app may show:

"Page 2"

Then update when ready.

The expected result is that Lily turns pages without thinking about the mechanism.

The failure condition is hidden navigation, accidental page turns, animation that feels like a slideshow, or page count that jumps strangely without explanation.

---

N00 Lily Uses Scroll Mode To Skim

---

Lily does not always want a book-like page. Sometimes she wants to skim.

She opens settings and switches from page mode to scroll mode. The label should be plain:

"Reading style"

Options:

"Pages"

"Scroll"

She chooses "Scroll."

The app redraws the document with a full E Ink-style refresh. The content remains near the same section. Lily can now scroll naturally.

Normal scrolling should not flash on every movement. Lily would find that confusing and uncomfortable. The E Ink feel should remain in the paper tone, typography, and major transitions, not in constant scroll effects.

The expected result is that Lily can choose between focused reading and quick browsing.

The failure condition is scroll mode feeling like an afterthought, heavy animation during scrolling, or loss of place after switching.

---

O00 Lily Opens Settings For The First Time

---

Lily opens settings because the text is slightly small.

The settings panel should not expose every advanced option at once. It should show the most understandable controls first.

The first visible settings should be reading style, text size, font, line spacing, theme, and E Ink effect.

Advanced diagnostics should not be visible unless Lily explicitly opens an advanced section.

The panel should use clear labels:

"Text size"

"Line spacing"

"Font"

"Paper color"

"Page or scroll"

"E Ink effect"

"Motion"

Avoid labels such as "measure," "render pipeline," "partial refresh interval," or "typographic scale" in the main UI. Those may exist internally or in advanced mode, but not in Lily's default settings view.

The expected result is that Lily can change one setting without understanding the full system.

The failure condition is a dense settings panel, technical labels, too many sliders, or controls that require explanation.

---

P00 Lily Changes Text Size

---

Lily increases text size.

The reader responds immediately or after a short refresh. The text becomes larger. Page count may change. The app should keep her near the same content.

If the app needs a moment, it should show:

"Updating the reading view..."

The message should disappear when complete.

Lily should not see text jump through several unstable states. She should not end up back at the beginning of the document.

The expected result is that text size adjustment feels safe and reversible.

The failure condition is lost position, broken page layout, controls overlapping text, or an app freeze.

---

Q00 Lily Changes Font

---

Lily notices the font menu.

The default is Literata. She does not need to know why it was chosen, but the default should look polished.

The font menu should contain a small number of options. Too many fonts would create uncertainty. Each option should be local and already available.

The menu may show names such as:

"Literata"

"Charis SIL"

"Source Serif 4"

"Merriweather"

"Atkinson Hyperlegible"

"Noto Serif"

If a font has a simple helper description, it should be short:

"Literata - book-like"

"Atkinson Hyperlegible - clearer letter shapes"

Lily selects Atkinson Hyperlegible because she wants clearer text. The app performs a controlled refresh and reflows the document. The selected font remains active.

The expected result is that font choice helps Lily read without turning into a typography lesson.

The failure condition is a long confusing font list, fonts loading from the network, missing fonts, or a change that breaks pagination.

---

R00 Lily Changes Paper And Contrast

---

Lily reads in a bright room. The default warm paper theme feels good.

Later, she reads at night and wants the page to feel softer. She opens settings and chooses a lower-brightness or darker paper option if available.

The theme names should be understandable:

"Warm paper"

"Cool paper"

"High contrast"

"Dark"

If the app includes texture strength, it should be framed simply:

"Paper texture"

Options:

"Off"

"Subtle"

"Visible"

The default should be subtle. Lily should not have to tune texture to avoid visual noise.

If contrast becomes too low, the app should prevent an unreadable combination or make high contrast easy to choose.

The expected result is that visual settings improve comfort without creating confusion.

The failure condition is pure white default, harsh black default, loud color themes, heavy texture, or inaccessible low-contrast combinations.

---

S00 Lily Changes The E Ink Effect

---

Lily likes the E Ink transition at first, but after a few minutes she wants it softer.

She opens settings and sees:

"E Ink effect"

Options:

"Off"

"Reduced"

"Balanced"

"Strong"

The current selection is "Balanced."

She selects "Reduced." Page turns become gentler. The reader still looks like paper, but the transition is less noticeable.

Later she chooses "Off." The app should stop flashing or ghosting while still keeping the reading surface attractive.

The expected result is that Lily controls the effect with language she understands.

The failure condition is an effect that cannot be disabled, settings that do not match behavior, or options named with technical terms such as "waveform mode."

---

T00 Lily Has Reduced Motion Enabled

---

Lily's phone has reduced motion enabled at the system level.

When she opens the app, the reader should detect this and use reduced motion by default. She should not see strong flashes before the app checks the setting.

If she opens settings, the motion option may say:

"Motion: follow system"

A helper line may say:

"Strong refresh effects are reduced because your device requests less motion."

This should be calm and informative. It should not sound like a warning.

The expected result is that the app respects Lily's device preference automatically.

The failure condition is aggressive animation on first load, hidden reduced-motion handling, or requiring Lily to know what reduced motion means.

---

U00 Lily Leaves And Comes Back Weeks Later

---

Lily reads a Markdown document, changes text size, chooses Atkinson Hyperlegible, and switches to scroll mode.

She closes the app.

Several weeks later, she opens the app again.

The app remembers her preferences. It does not remember her book. The opening screen should make this clear:

"Your reading preferences were restored."

Then:

"Open a TXT or Markdown file to start reading."

This is important because Lily may not remember what she changed. The app should feel familiar without being mysterious.

It should not say:

"Previous document unavailable due to storage policy."

It should not show a broken recent-file entry.

The expected result is that Lily feels the app remembered comfort settings, not private content.

The failure condition is restoring book content, showing a missing-book error, or forgetting all preferences.

---

V00 Lily Reopens A Book Manually

---

Lily wants to continue reading the same file from weeks ago.

The app cannot reopen it automatically because book contents are not stored. It should not pretend otherwise.

Lily clicks "Open file" and chooses the file again. The app renders it using her saved preferences.

If the app stores no reading position, it should start at the beginning without apology. If it stores only non-content session hints, it may help her find her place only after she reopens the file, but it must not rely on stored text.

The expected result is a privacy-respecting return flow that Lily understands.

The failure condition is a confusing "file missing" message or a restored document body from persistent storage.

---

W00 Lily Uses The App On Desktop

---

On desktop, Lily has enough space for a centered reading surface.

The app should not stretch text across the full window. It should keep a comfortable column. Settings may open as a side panel or modal. Controls should be easy to find but not distracting.

Lily uses the mouse. She clicks next and previous controls. She may also press Space by accident or intentionally. The behavior should be sensible.

The desktop experience should feel stable and polished. Lily should not notice layout measurements, font loading, or pagination work.

The expected result is a calm desktop reader that requires no learning.

The failure condition is excessive width, tiny text, distracting controls, or visible layout instability.

---

X00 Lily Uses The App On Tablet

---

On a tablet, Lily reads while sitting on a couch.

The page should be touch-friendly. Buttons should not be too small. Page turns should not require precise clicks. Settings should be reachable and readable.

When she rotates the tablet, the app should re-layout the document and keep her near the same place. The transition should feel like a controlled redraw.

If the tablet is in portrait orientation, the app should avoid cramped margins. If it is in landscape, the app should avoid overly wide text.

The expected result is a tablet experience that feels designed for touch.

The failure condition is clipped text, tiny controls, lost reading position, or orientation changes that break pagination.

---

Y00 Lily Uses The App On Mobile

---

On mobile, Lily wants to read a short section quickly.

The opening screen should fit. The file picker should be prominent. Drag-and-drop may be less relevant, but the app should not look broken.

After the file opens, text should be readable without zooming. The page should not require horizontal scrolling. Settings should open in a mobile-appropriate panel, probably full-screen or sheet-like.

Lily may prefer scroll mode on mobile. The app should make that switch easy. Normal touch scrolling should feel native.

If Lily opens a code-heavy Markdown document, code blocks should wrap or scroll safely inside the content area without breaking the whole page.

The expected result is that mobile reading is practical, even if desktop remains the best long-session experience.

The failure condition is horizontal page overflow, controls covering text, impossible settings navigation, or page mode that feels unusable.

---

Z00 Lily Uses Keyboard By Accident Or Lightly

---

Lily is not a keyboard-power user, but she may press keys.

If she presses Space in page mode, the page advances. If she presses Shift + Space, it goes back. If she presses Escape while settings are open, settings close.

If she is using a select menu or slider, keyboard shortcuts should not interfere. The app should respect normal form behavior.

Focus should be visible but not visually harsh.

The expected result is that keyboard behavior helps without surprising her.

The failure condition is shortcuts triggering while she is changing settings, invisible focus, or a keyboard action that breaks navigation.

---

AA00 Lily Sees A Recoverable Markdown Error

---

Lily opens a Markdown file that cannot be rendered safely.

The app should not show raw parser details. It should offer a clear path:

"Markdown could not be shown safely."

Then:

"You can open this file as plain text instead."

Buttons:

"Open as plain text"

"Choose another file"

If Lily chooses plain text, the app should render the source as readable text with safe escaping. It should not execute anything.

The expected result is a calm recovery path.

The failure condition is a parser stack trace, blank page, or unsafe fallback.

---

AB00 Lily Sees A Missing Font Fallback

---

Lily previously selected a font that is no longer available because the app folder is incomplete.

When she opens a file, the app should not fail. It should use another readable font and show a subtle message:

"That font is not available, so the reader used Literata."

If Literata is also unavailable, the app may say:

"A built-in browser font is being used because reader fonts are missing."

The message should not block reading unless the page is unreadable.

The expected result is graceful font fallback.

The failure condition is invisible text, broken layout, endless font loading, or a technical font error.

---

AC00 Lily Sees A Missing Markdown Dependency Error

---

Lily opens a Markdown file, but the local Markdown parser file is missing from the app.

The app should detect the missing dependency and fail calmly.

Message:

"Markdown support is not available in this copy of the reader."

Then:

"You can open this file as plain text, or use a complete copy of the app."

Buttons:

"Open as plain text"

"Choose another file"

This message tells Lily what happened without exposing implementation details. It does not say "markdownIt is undefined."

The expected result is that Lily can still read the file as plain text.

The failure condition is a blank page, JavaScript error, or unsafe attempt to render Markdown without the proper safety path.

---

AD00 Lily Sees A Pagination Failure

---

Lily opens a complex Markdown file. Page mode cannot paginate it reliably.

The app should not leave her in a broken page view. It should switch or offer to switch to scroll mode.

Message:

"Page layout could not be prepared for this file."

Then:

"You can read it in scroll mode instead."

Button:

"Use scroll mode"

If the app switches automatically, it should say:

"Switched to scroll mode so you can keep reading."

The expected result is that Lily keeps access to the content.

The failure condition is missing pages, overlapping text, page count of zero, or a stuck loading state.

---

AE00 Lily Sees A Local Storage Preference Error

---

Lily's browser blocks localStorage, or saved preferences are corrupted.

The app should still work. It should use defaults.

Message:

"Reader preferences could not be restored."

Then:

"The default settings are being used for this session."

This should not prevent file opening.

If preferences cannot be saved after Lily changes them, the app may say:

"These settings will apply for now, but they may not be remembered after you close the app."

The expected result is that Lily can continue reading even when preference storage fails.

The failure condition is app startup failure, repeated alerts, or settings that appear saved but are silently lost without explanation.

---

AF00 Lily's Error Message Style

---

Every user-facing error should help Lily answer three questions: what happened, whether she can continue, and what to do next.

Good Lily-facing messages are short, specific, and calm.

Examples:

"This file is empty. Choose another TXT or Markdown file to read."

"This file type is not supported. Open a .txt, .md, or .markdown file."

"Open one file at a time. Choose a single file to continue."

"Markdown could not be shown safely. You can open this file as plain text instead."

"Page layout could not be prepared for this file. You can read it in scroll mode instead."

"This file is too large for this reader. Try a smaller TXT or Markdown file."

"That font is not available, so the reader used Literata."

"Reader preferences could not be restored. The default settings are being used for this session."

Poor Lily-facing messages are vague, technical, or blaming.

Avoid:

"Unhandled exception."

"Invalid input."

"Parser failed."

"DOMPurify unavailable."

"Cannot read property of undefined."

"Unsupported MIME type."

"Fatal layout error."

"Storage quota exceeded."

Technical details may exist in diagnostics, but they should not be Lily's main experience.

---

AG00 Diagnostics Hidden From Normal Use

---

Lily should not see logs during normal reading.

If something goes wrong, the app may include a small "Details" area or advanced diagnostics option, but the primary message should be enough.

If Lily opens details, she may see:

"File validation failed: unsupported extension."

"Markdown rendering unavailable: parser file missing."

"Font fallback used: selected font unavailable."

These details are acceptable only when separated from the main message.

Logs must not include her document text. Lily will not inspect this, but the product must protect her anyway.

The expected result is that diagnostics help without making the normal app feel technical.

The failure condition is console-like output in the main UI, private text in logs, or remote telemetry.

---

AH00 Lily Reads Offline

---

Lily opens the reader while offline.

She may not know she is offline. The app should still work because all runtime assets are local. Fonts, scripts, textures, and Markdown support should load from the app folder.

If she opens a Markdown document with a remote image, the app should not try to fetch it. It may show:

"External images are not loaded in this reader."

This should be a small placeholder, not a blocking error.

The expected result is that offline use feels normal.

The failure condition is missing fonts, broken Markdown rendering, blank icons, or remote resource errors visible to Lily.

---

AI00 Lily's Trust In Local Privacy

---

Lily notices the privacy line on the first screen. She does not verify it technically, but she remembers it.

The app must behave consistently with that line. It should not show a recent documents list. It should not reopen her book later. It should not ask to sync files. It should not show cloud features.

When she returns weeks later, the app may say:

"Your reading preferences were restored."

It should not say:

"Your last book is ready."

That would contradict the privacy model.

The expected result is that Lily's trust is maintained through behavior, not only wording.

The failure condition is any feature that implies book content was stored.

---

AJ00 Lily Skims For One Section

---

Lily opens a documentation file because she needs one section.

She does not want to read from the beginning. She wants to skim.

The reader should make headings visible enough that she can scan. In scroll mode, she should be able to move through the document quickly. In page mode, next-page navigation should be smooth enough that she can browse without frustration.

If the app includes a simple section list, it should be optional and subdued. It should not make the reader feel like a complex documentation portal. Lily should be able to ignore it.

The expected result is that the app supports both reading and quick browsing.

The failure condition is a beautiful page mode that makes skimming painful, or a scroll mode that loses the E Ink reading identity.

---

AK00 Lily Reads A Short Book

---

Lily opens a short public domain TXT book.

She uses the app in page mode. The E Ink effect makes the reading feel slower and calmer than a normal web page. She reads a few pages, closes the app, and returns the next evening.

Since the app does not store the book, she reopens the file. Her text size and font are remembered. This is acceptable because she understands that the app remembers preferences, not content.

The reading experience should be pleasant enough that reopening the file is not frustrating.

The expected result is that occasional reading feels comfortable.

The failure condition is that the app over-optimizes for technical documents and neglects book-like reading comfort.

---

AL00 Lily's Minimal Customization Path

---

Lily should be able to use the app well without changing anything.

The default path is:

Open app.

Open file.

Read.

Turn pages or scroll.

Close app.

This path must be excellent.

Settings are for comfort, not required setup. The default font, size, line height, theme, contrast, and E Ink intensity should be good enough for a typical user.

The expected result is that Lily can ignore settings.

The failure condition is that the app requires setup before reading, starts with poor defaults, or hides essential readability behind settings.

---

AM00 Lily's Full Customization Path

---

When Lily does customize, the path should still be simple.

She opens settings.

She changes text size.

She changes font.

She changes reading style from pages to scroll.

She reduces the E Ink effect.

She closes settings.

The app applies each change with clear visual feedback. It preserves her place. It remembers her preferences. It does not ask her to save.

The expected result is a smooth customization session that does not feel technical.

The failure condition is apply buttons that are unclear, settings that reset unexpectedly, reflows that jump to the beginning, or controls that use implementation terms.

---

AN00 Lily's Mobile Documentation Task

---

Lily is away from her desk. She needs to check one command from a Markdown setup file on her phone.

She opens the app, chooses the file, and switches to scroll mode if not already selected. The text is readable. Code blocks do not break the viewport. She scrolls to the heading she needs.

If she taps a link by mistake, the app should not navigate unexpectedly inside the same reading session. External links should open only through clear user action. If opened, they should not corrupt the reader state.

She finds the command, reads it, and closes the app.

The expected result is a fast mobile lookup path.

The failure condition is tiny text, horizontal scrolling, broken code blocks, or accidental navigation away from the app.

---

AO00 Lily's Tablet Comfort Task

---

Lily reads a long note on a tablet.

She starts in page mode. She taps the right side to advance if tap zones are implemented. If not, she uses visible controls. The controls should be large enough and placed naturally.

She rotates the tablet. The app performs a controlled refresh and keeps her near the same content.

She opens settings and increases line spacing. The text becomes easier to read. She closes settings and continues.

The expected result is tablet reading that feels natural and low-effort.

The failure condition is controls that are too small, rotation that restarts the book, or settings that are hard to close.

---

AP00 Lily's Calm Failure Recovery Sequence

---

A strong test for Lily is a sequence of mistakes.

She opens the app.

She drops two files.

The app says:

"Open one file at a time. Choose a single file to continue."

She then chooses a PDF.

The app says:

"This file type is not supported. Open a .txt, .md, or .markdown file."

She then chooses an empty TXT file.

The app says:

"This file is empty. Choose another TXT or Markdown file to read."

She then chooses a valid Markdown file with unsafe HTML.

The app renders the readable content and may say:

"Some unsafe formatting was removed. The readable text was kept where possible."

At every step, Lily remains oriented. The file-open button remains available. The app does not require reload. She never sees a raw exception.

The expected result is that the app absorbs mistakes gracefully.

The failure condition is that one mistake poisons the next action.

---

AQ00 Lily's Smoothness Standard

---

For Lily, smoothness means fewer visible seams.

The app should not expose intermediate states unless they help her. It should not show unstyled content before fonts load. It should not flash raw Markdown before rendering. It should not show controls jumping around while pagination finishes. It should not leave transition overlays visible. It should not show a page count changing wildly.

Smoothness does not mean hiding all work. If the app needs time, it should say so calmly. Smoothness means Lily always knows whether the app is ready, working, or asking her to choose another action.

The expected result is a guided experience.

The failure condition is invisible work, sudden jumps, unexplained delays, or UI states that look broken.

---

AR00 Lily's Visual Expectations

---

Lily wants the reader to look nice, but she does not think in design terminology.

She wants the page to feel soft. She wants the text to be clear. She wants the app to look finished. She wants the controls to be easy to understand. She wants the animation to feel polished, not like a gimmick.

The E Ink simulation should support this. It should make the reader feel calmer and more physical. It should not become the main attraction.

The paper surface should be subtle. The background should not glare. The text should not be too faint. The font should look intentional. The line spacing should let her breathe.

The expected result is a reading surface that feels pleasant immediately.

The failure condition is either a generic web page or an overdone fake E Ink demo.

---

AS00 Lily's Acceptance Criteria

---

Lily can understand the first screen without instructions.

Lily can open TXT and Markdown files through the file picker.

Lily can use drag-and-drop without risk of navigation away from the app.

Lily sees clear messages for unsupported files, empty files, multiple files, large files, broken Markdown, missing fonts, missing Markdown support, and pagination failure.

Lily can read TXT files as prose.

Lily can read Markdown files as safe formatted documents.

Raw HTML in Markdown does not execute or load remote resources.

The default typography is comfortable.

The default E Ink effect is visible but not disruptive.

Lily can reduce or disable the E Ink effect.

Lily can change text size, font, theme, and reading mode with understandable controls.

Lily can switch between pages and scroll.

The app respects reduced motion.

The app works on desktop, tablet, and mobile.

The app remembers preferences but not book contents.

The app works offline after all assets are vendored.

The app does not show technical errors in the normal UI.

The app does not require Lily to learn the system before reading.

---

AT00 Final Lily Test Narrative

---

Lily opens the app because she wants to read a file, not because she wants to configure software.

The app tells her what it accepts, where her file goes, and what will not happen to it. She opens a Markdown file. It becomes readable. The surface is calm, soft, and minimal. She turns a page and sees a gentle E Ink refresh. She switches to scroll mode when she wants to skim. She increases text size when the text feels small. She reduces the E Ink effect when she wants less motion. She closes the app.

Weeks later, she returns. Her reading preferences are still there. Her book is not. The app tells her to reopen a file. This feels honest.

When Lily makes mistakes, the app does not punish her. It says what happened and what to do next. "Open one file at a time." "This file type is not supported." "This file is empty." "Markdown could not be shown safely." "You can read it in scroll mode instead."

The best version of the software gives Lily a smooth and coherent reading path. It lets her read without becoming a software operator. It protects her from confusing states, technical language, unsafe Markdown, broken layouts, and unnecessary decisions. It feels calm enough that she can forget the app exists and focus on the text.






## File content `specs\lily-usage-scenario_todo.md`:

# specs/lily-usage-scenario_todo.md

Source: specs/lily-usage-scenario.md
Pass: Lily (occasional reader who dislikes confusion)

Lily is not a software troubleshooter. She wants to open a file, read, adjust a
couple of basics, recover from mistakes, and never get stuck. Every message must
be plain language and every state must be obvious.

---

## A00 Acceptance Checklist

### Obvious first use
- [x] The open screen clearly invites opening or dragging a file.
- [x] Both a visible Open button and drag-and-drop work.
- [x] Supported file types are stated in plain language.

### Smoothness and clarity
- [x] Loading shows a brief "Readingâ€¦" busy state, not a frozen screen.
- [x] The reader appears with a calm refresh, not a jarring flash.
- [x] Controls (Open, Settings, Prev/Next, progress) are labelled and easy to find.

### Calm, non-technical messages
- [x] Empty file: "This file is empty â€¦ Open another book file." (no jargon).
- [x] Unsupported file: explains which types are supported. (no error codes shown).
- [x] Markdown-with-HTML: a gentle note that some HTML was skipped for safety.
- [x] No raw stack traces or technical error codes are shown to the user.

### Easy recovery from mistakes
- [x] Opening a wrong file returns to the open screen with a clear message.
- [x] Opening a new file replaces the current one cleanly.
- [x] No stuck overlay, endless spinner, or blank page after any error.

### Minimal configuration burden
- [x] Sensible defaults mean Lily can read without touching settings.
- [x] Settings are grouped and understandable; advanced/technical items are tucked away (progressive disclosure).
- [x] Font size and theme are easy to change and take effect immediately.

### Mobile simplicity
- [x] On mobile the layout is single-column with large touch targets.
- [x] Settings becomes a full/bottom sheet that is easy to dismiss.
- [x] Tap zones turn pages without needing precise aiming.

---

## B00 Validation Checklist

- [x] Opened a file via the button and via drag-and-drop.
- [x] Triggered empty and unsupported files; confirmed plain-language messages and clean return to the open screen.
- [x] Changed theme and font size; changes applied instantly and persisted.
- [x] Verified no console errors that might surface as confusing behavior.
- [x] Verified mobile viewport layout and settings sheet.
- [ ] Manual: judged whether wording feels friendly and non-intimidating.

---

## C00 Risks And Edge Cases

- [x] A technical toast could confuse Lily â€” safety/large-file notes are phrased plainly.
- [x] Getting "stuck" mid-refresh â€” refreshes are serialized and always unlock.
- [x] Losing her place after changing a setting â€” position is preserved.
- [ ] First-time discoverability of tap zones â€” zones exist; on-screen hinting is minimal by design.

---

## D00 Final Review

- [x] Power-user detail from the Frank pass did not make the main path noisier for Lily (diagnostics are opt-in).
- [x] All error paths lead back to a usable state.
- [ ] Remaining limitation: tone/wording friendliness is a subjective human judgement.


## File content `specs\roman-usage-scenario.md`:

Date: 2026-07-03

---

A00 Roman Usage Scenario Test Plan

---

This document describes the E Ink Reader through Roman's experience.

Roman is an experienced software engineer from Belarus. He grew up in a post-Soviet technical environment where practical engineering, local files, text editors, offline references, and personal archives matter. He now lives in the United States. English is not his first language, but he reads and writes technical English every day. He is comfortable with software, but he has strong opinions about whether software is actually useful.

Roman is not looking for a decorative reader. He wants a focused tool for reading local TXT and Markdown notes with better typography and a credible E Ink-like visual experience. He writes many Markdown notes. He stores code snippets, explanations, links, quotes, jokes, interview notes, LeetCode solutions, API reminders, and fragments of technical documentation. He wants those files to feel readable on desktop and especially on his mobile phone.

Roman is a power user, but not in the same way as someone who wants a complicated interface. He likes direct tools. He notices implementation quality. He notices bad defaults, missing keyboard behavior, weak error handling, broken mobile code blocks, unsafe Markdown, fake offline support, and noisy logs. If the reader feels unserious, he will not use it.

The application succeeds for Roman when it lets him open a local Markdown or TXT file, read code-heavy notes comfortably, review snippets on mobile, skim headings, follow or inspect links intentionally, change typography and E Ink settings, and trust that the app remains local, inspectable, and technically coherent.

The application fails for Roman when code blocks are unreadable, Markdown is unsafe, links behave unexpectedly, fonts load from the network, page transitions look cheap, settings are shallow, errors hide useful detail, or the app stores his notes after promising not to.

---

B00 Roman Reader Persona

---

Roman writes notes as part of how he thinks.

He may solve a LeetCode problem, then create a Markdown file with the problem title, the link, the constraints, the final solution, an explanation, complexity notes, failed attempts, and one or two alternative approaches. He may add a small joke or a quote because that helps him remember the idea.

He also keeps notes about JavaScript behavior, browser APIs, command-line tools, data structures, distributed systems, debugging patterns, and old lessons from production incidents. Some files are polished. Many are not. They may contain fenced code blocks, inline code, links, tables, headings, raw HTML copied by accident, long lines, Unicode, and mixed English with occasional Russian words or Belarusian names.

Roman reads these notes differently depending on context. At his desk, he may read carefully and compare two approaches. On the train, he may open one file on his phone and quickly review a solution pattern. Before an interview, he may skim several notes. Before debugging something, he may reread an old explanation.

Roman values smooth visual experience, but he also values correctness. He will forgive a simple UI if it is reliable. He will not forgive a beautiful UI that corrupts Markdown, runs unsafe HTML, loses code formatting, or hides errors.

Roman likes local tools because they are predictable. He expects the app to work offline after vendoring. He expects no npm runtime, no hidden network dependency, and no surprise upload. He appreciates that the app is static and inspectable.

---

C00 Roman's Technical Environment

---

Roman uses several devices.

At his desk, he uses a laptop or desktop with a large monitor. He has a folder of notes synced from his own system. The sync mechanism is outside the app. The reader does not manage syncing, libraries, or file organization.

On mobile, Roman has access to the same files through his phone's file system, cloud drive provider, or local synchronization workflow. The reader only needs to let him select a file from the browser file picker. How the file arrived on the phone is outside the product.

On tablet, Roman may read longer notes or technical essays. He expects tablet layout to be touch-friendly and stable.

Roman may open the app from a local static folder or from a simple static host. He expects the runtime app to be plain HTML, CSS, JavaScript, and local assets. He understands what that implies. He will notice if the app secretly depends on remote fonts or CDN scripts.

The expected result is that Roman can use the app as a local reader across devices without changing his note organization.

The failure condition is that the app assumes a cloud library, requires account login, requires npm to run, requires network for runtime dependencies, or tries to manage his files.

---

D00 Roman's First Use Case

---

Roman has a Markdown file named `binary-search-patterns.md`.

The file contains a heading, a short explanation, a link to a LeetCode problem, several code blocks, a complexity section, and notes about edge cases.

He opens the E Ink Reader. The first screen is quiet and direct. It says:

"Drop a TXT or Markdown file here."

It also says:

"Your file is read locally in this browser. It is not uploaded or stored."

Roman respects this statement because it is specific. He does not want marketing copy about privacy. He wants behavior that matches the claim.

He selects the Markdown file.

The app validates the file, reads it locally, parses Markdown safely, and opens the reader. The screen refreshes like an E Ink display. The first visual impression should be restrained, technical, and polished. It should not feel like a toy.

The expected result is that Roman reaches a readable technical note quickly.

The failure condition is that the app opens raw Markdown, fails on code blocks, loads external assets, or asks him to configure a project before reading.

---

E00 Roman Opens A Markdown Note With Code

---

Roman's note starts like this:

````md id="yld3xz"
# Binary Search Patterns

Problem:
https://leetcode.com/problems/search-in-rotated-sorted-array/

Key idea:
Use the sorted half to decide where the target can still exist.

```js
function search(nums, target) {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);

    if (nums[mid] === target) return mid;

    if (nums[left] <= nums[mid]) {
      if (nums[left] <= target && target < nums[mid]) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    } else {
      if (nums[mid] < target && target <= nums[right]) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
  }

  return -1;
}
````

```

The rendered page must preserve the structure of the note. The heading should look like a document heading. The problem link should be readable. Inline code should be distinct but not loud. The fenced JavaScript block should remain readable on desktop, tablet, and mobile.

The code block does not need syntax highlighting in this version unless the implementation chooses to add it without violating dependency rules. The more important requirement is that code remains readable, aligned, and contained. Long code lines must not break the entire layout. On mobile, code blocks may wrap, horizontally scroll inside the block, or use another safe presentation chosen by the coding agent. The whole page must not become horizontally scrollable.

Roman reads the code and explanation. He should not have to switch to a code editor just to understand the snippet.

The expected result is that Markdown code notes become comfortable reading material.

The failure condition is broken indentation, clipped code, global horizontal scrolling, unreadably small monospace text, or code blocks that visually overpower the note.

---

F00 Roman Reviews Notes On The Train

---

Roman is on a train. He has ten spare minutes.

He opens the app on his phone and selects `two-pointers.md` from the phone file picker. The app must work with mobile file selection. Drag-and-drop is not the primary mobile path, but the app should not look broken because drag-and-drop is unavailable or awkward.

The reading surface appears with a mobile-appropriate layout. Text is large enough. The line length is narrow but comfortable. Margins are not wasteful. Controls do not cover the note. The settings panel is reachable and usable on a small screen.

Roman scrolls through the note because on the phone he wants quick review more than page-by-page reading. If his preference was saved as scroll mode, the app starts in scroll mode. If it starts in page mode, switching to scroll mode should be obvious.

The scroll mode should retain the E Ink identity through grayscale, paper texture, font choice, and controlled major refreshes. It should not flash on every scroll movement.

Roman finds the section titled "Mistakes I made." He reads it, closes the app, and returns to whatever he was doing.

The expected result is that mobile use is fast, readable, and low friction.

The failure condition is tiny text, horizontal overflow, settings that do not fit, code blocks breaking the viewport, or heavy scroll animation.

---

G00 Roman Uses Page Mode For Careful Reading

---

At home, Roman opens a longer note called `event-loop-deep-dive.md`.

He uses page mode because he wants to read slowly. The document appears as a page-like surface. The default body font is Literata. Code blocks use a readable monospace fallback or bundled monospace if provided. The paper tone is warm or neutral. The text is not pure black on pure white.

Roman presses the Right Arrow key. The next page appears through a partial E Ink refresh. The outgoing page leaves a faint ghost during the transition. The incoming page settles into place. The effect should remind him of an E Ink device without getting in the way.

He presses Space to advance. He presses Shift + Space to go back. He uses PageDown and PageUp. He expects keyboard behavior to be consistent because he is a software engineer and uses keyboard navigation naturally.

The page indicator is subtle. It may say:

"Page 4 of 37"

Roman does not want a large progress dashboard. He wants enough information to orient himself.

The expected result is that page mode supports careful technical reading and keyboard navigation.

The failure condition is generic slide animation, no keyboard support, incorrect page count, transitions that leave stuck overlays, or page turns that lose content.

---

H00 Roman Uses Scroll Mode For Technical Skimming

---

Roman opens `node-streams-notes.md`.

He wants to find one section quickly. Scroll mode is better for this.

He opens settings and changes "Reading style" from "Pages" to "Scroll." The app performs a full E Ink refresh because the layout mode changes substantially. The content remains near the same section if possible.

In scroll mode, headings are visible enough to skim. Code blocks remain contained. Lists and tables, if supported, do not explode the layout. Roman can use browser find or an in-app current-document find if the implementation provides one. The app must not create a persistent full-text index because book and note contents must not be stored.

The app should not become a note database. It is a reader for a currently opened file. Roman's external sync and organization system remains outside the app.

The expected result is that Roman can skim technical notes without leaving the reader.

The failure condition is scroll mode that loses the E Ink visual identity, code-heavy documents that become unreadable, or any search/index behavior that persists note contents.

---

I00 Roman Opens Plain Text Notes

---

Not all of Roman's files are Markdown.

He has old `.txt` files with snippets, quotes, and rough explanations. Some have blank lines. Some use headings made from all caps. Some contain old command output.

He opens a TXT file. The app should render it as readable prose, not as one dense blob. Paragraph breaks should be respected. Long lines should be handled without breaking the mobile viewport. If the file looks like prose, it should feel like prose. If parts look preformatted, the app may preserve them carefully, but it should not default every TXT file to a raw terminal dump.

Roman appreciates that old notes become readable without editing them.

The expected result is readable TXT rendering with sane paragraph handling.

The failure condition is a single giant paragraph, tiny preformatted text, broken line wrapping, or loss of meaningful spacing.

---

J00 Roman's Markdown Links

---

Roman's Markdown notes contain many links.

Some links point to LeetCode problems. Some point to documentation. Some point to GitHub issues. Some are reminders to search later.

The reader should render links in a subdued style that fits the E Ink interface. Links should not use bright browser-blue defaults unless the selected theme explicitly allows that. They should be recognizable but not distracting.

External links should open only when Roman intentionally activates them. The app should not prefetch, preview, expand, or request link targets. Clicking a link may open a new tab with safe attributes such as `noopener` and `noreferrer`, depending on the implementation.

On mobile, accidental taps should not easily throw Roman out of the reader. Link hit areas should be normal, not oversized. If a link opens, the reader state should remain available when Roman returns.

The expected result is intentional, safe link behavior.

The failure condition is automatic network fetch, embedded previews, accidental navigation in the same tab, or link styling that breaks the reader aesthetic.

---

K00 Roman's Raw HTML And Unsafe Markdown Case

---

Roman sometimes copies snippets from webpages into Markdown. A file may contain raw HTML, an image tag, a style tag, or script-like content.

Roman knows this can be messy. He expects a serious reader to fail safely.

The app must not render raw HTML as trusted markup. It must not execute scripts. It must not load remote images. It must not allow inline event handlers. It must not allow the file to change the reader's style or layout.

If unsafe formatting is removed, Roman can accept a concise message:

"Some unsafe Markdown formatting was removed."

If he opens diagnostics, more technical detail may be available:

"Raw HTML was not rendered."

"Remote images are not loaded by this reader."

"Unsafe attributes were removed."

Normal reading should continue where possible.

The expected result is safe Markdown rendering with useful diagnostics.

The failure condition is any script execution, remote image fetch, layout injection, or unsafe fallback.

---

L00 Roman's Quotes And Jokes Notes

---

Roman also has files that are not purely technical.

He keeps a Markdown file with quotes, jokes, short fragments, and small observations. These files rely on rhythm, spacing, blockquotes, and typography.

The reader should make this kind of document pleasant. Blockquotes should be visually distinct but quiet. Short lines should not look broken. Horizontal rules should work as separators. Emphasis should be visible without becoming loud.

The E Ink visual style should help these notes feel like a small personal notebook. The interface should not assume every Markdown file is corporate documentation.

The expected result is that mixed personal notes feel readable and intentional.

The failure condition is a design that only handles long technical prose and makes short fragments awkward.

---

M00 Roman Changes Font For Different Material

---

Roman uses different fonts for different moods.

For long technical explanation, he may keep Literata because it feels like a serious reading face. For old notes, he may choose Charis SIL because it feels more book-like. For quick mobile review, he may choose Atkinson Hyperlegible because the letter shapes are clearer. For modern documentation, he may try Source Serif 4 or Merriweather.

The font menu should be small and curated. Every font must be local. Roman may inspect network requests, so remote font loading is unacceptable.

When Roman changes font, the app should perform a full E Ink refresh and repaginate. The current content position should remain nearby. If the selected font fails, the app should fall back cleanly and explain:

"That font is not available, so the reader used Literata."

Roman expects this because he understands missing assets can happen. He will judge the app by whether it handles the problem cleanly.

The expected result is meaningful local font choice with stable layout.

The failure condition is network font loading, broken font fallback, excessive font list, or reflow that loses position.

---

N00 Roman Adjusts Code Readability

---

Roman cares about code readability.

The main settings may not expose a separate code font in the first version, but the app should still make code blocks readable. If an advanced setting exists for code block behavior, Roman may use it.

Possible code-related controls include code font size, wrap long lines, allow horizontal scroll inside code blocks, or compact code blocks. These are optional unless implemented, but the product should still handle code well by default.

Roman increases body text size on mobile. Code should not become microscopic compared to body text. If code wraps, indentation should remain understandable. If code scrolls horizontally, the code block should clearly indicate its boundary and not move the whole page.

The expected result is that code-heavy Markdown remains readable across devices.

The failure condition is code clipping, unreadable indentation, body-level horizontal overflow, or code blocks that cannot be navigated on touch.

---

O00 Roman Changes E Ink Intensity

---

Roman likes the E Ink effect but wants control.

He opens settings and sees an "E Ink effect" control with understandable choices:

"Off"

"Reduced"

"Balanced"

"Strong"

Balanced is the default. It gives the app character without making it slow.

Roman tries Strong. He expects more visible refresh, stronger ghosting, and a more device-like redraw. It should feel deliberate, not random.

He tries Reduced for train reading. It keeps the paper-like surface but reduces flashing.

He tries Off while comparing code snippets, because sometimes motion distracts him. The app should remain a good reader without the animation.

The expected result is E Ink control that supports different reading contexts.

The failure condition is an effect that cannot be disabled, strong mode that becomes unsafe or annoying, or reduced mode that still flashes aggressively.

---

P00 Roman Tests Reduced Motion Behavior

---

Roman may not personally use reduced motion, but he expects the app to respect it.

If the system setting requests reduced motion, the app should default to reduced E Ink transitions before the first heavy animation. The setting may say:

"Motion: follow system"

If Roman manually changes it, the app should honor the override.

This matters because Roman evaluates the app as an engineer. Accessibility support is not decorative.

The expected result is correct reduced-motion behavior across file load, page turn, settings changes, and mode changes.

The failure condition is strong flashing before the preference is checked, hidden motion behavior, or inconsistent settings.

---

Q00 Roman Uses Theme And Contrast Settings

---

Roman reads in different environments.

On desktop during the day, he uses warm paper with soft contrast. On mobile at night, he may choose dark mode or a lower-brightness paper. Before reviewing code, he may choose high contrast so punctuation and braces are clearer.

The theme names should be direct:

"Warm paper"

"Cool paper"

"High contrast"

"Dark"

Texture should remain subtle. Roman does not want fake paper noise that makes code harder to read. Strong texture may be available, but it should not be the default.

When the theme changes, the app should perform a full refresh. This reinforces the E Ink device model.

The expected result is that display settings support both comfort and technical clarity.

The failure condition is pure white default, low contrast code, noisy texture, saturated colors, or theme changes that create unreadable combinations.

---

R00 Roman Uses Settings Without Losing Flow

---

Roman opens settings frequently during the first few sessions.

He changes reading style, font, text size, line height, paper color, contrast, E Ink intensity, and motion behavior. He may open advanced diagnostics if something looks wrong.

The settings panel should be efficient. Roman does not need overly simplified onboarding text in every section. He wants controls to be named clearly and grouped logically.

The main settings should remain human-readable. Advanced diagnostics can be more technical. Roman appreciates seeing that the app has internal logging, but he does not want logs in the normal reading surface.

When settings change, the app should apply changes immediately or clearly indicate that it is updating. It should not require a hidden save button. Preferences should persist.

The expected result is that Roman can tune the reader quickly and return to the note.

The failure condition is settings bloat, unclear controls, lost position, unsaved preferences, or technical options mixed into the main path.

---

S00 Roman's Preference Persistence Model

---

Roman expects preference persistence.

If he selects scroll mode, Atkinson Hyperlegible, high contrast, and reduced E Ink effect on mobile, those preferences should be there the next time he opens the app.

He also expects the app not to store his notes. This distinction is important to him.

When he returns later, the app may say:

"Your reading preferences were restored."

Then:

"Open a TXT or Markdown file to start reading."

It should not say:

"Continue reading binary-search-patterns.md"

unless it can do so without storing content and without creating a misleading privacy model. The safer version is no recent documents and no book restoration.

Roman may inspect localStorage. He should find preference values but not note content, parsed HTML, code snippets, excerpts, or indexes.

The expected result is preference persistence without document persistence.

The failure condition is any persistent storage of note content or a UI that implies stored document history.

---

T00 Roman Uses Diagnostics

---

Roman is more likely than Lily to open diagnostics.

If Markdown rendering fails, he wants a clear user message and optional technical detail. The main message may say:

"Markdown could not be shown safely."

The details panel may say:

"Parser completed, but sanitizer removed unsafe content."

or:

"Markdown parser file is missing."

or:

"Raw HTML rendering is disabled."

Logs should use structured local events. Roman may want to copy them. The logs should include file metadata such as file name, extension, size, parser path, page count, selected font, and error names. Logs must not include his note content or code snippets.

Roman expects no remote telemetry. If logs are sent anywhere, the app violates his trust.

The expected result is useful local troubleshooting without privacy leakage.

The failure condition is no diagnostics, raw stack traces in the main UI, logs containing note text, or remote analytics.

---

U00 Roman Opens A Broken Markdown File

---

Roman opens `draft-notes.md`, a file he edited quickly.

The Markdown contains an unclosed code fence and raw HTML.

The app should render what it safely can. Markdown parsers are often tolerant, so a malformed file may still display. If safe rendering is not possible, the app should offer a plain text fallback.

User-facing message:

"Markdown could not be shown safely."

Action:

"Open as plain text"

If Roman opens it as plain text, all content must be escaped and safe. Code and raw markup may appear as source text. That is acceptable because Roman can understand it.

The expected result is safe recovery with a useful fallback.

The failure condition is script execution, blank page, parser crash, or no way to inspect the file as plain text.

---

V00 Roman Opens An Unsupported File

---

Roman accidentally opens a `.json` export or a `.pdf`.

The app should reject it based on the supported format rules. It should not try to become a universal document viewer.

Message:

"This file type is not supported."

Then:

"Open a .txt, .md, or .markdown file."

Roman appreciates strict scope when it is explained clearly.

The expected result is fast rejection and easy recovery.

The failure condition is trying to parse unsupported formats, vague errors, or scope creep.

---

W00 Roman Opens A Large Notes Export

---

Roman exports a large Markdown file from his notes system.

The app warns him if it may take time:

"This file is large. Preparing the reading view may take a moment."

If page mode cannot handle it efficiently, the app may offer scroll mode:

"This file is large, so page mode may be slow. You can read it in scroll mode instead."

Roman will accept this because it is honest. He cares more about access to content than perfect page layout.

If the file exceeds a hard safety limit, the app should reject it calmly:

"This file is too large for this reader."

Then:

"Try a smaller TXT or Markdown file."

The expected result is that large file handling is predictable and does not freeze the browser.

The failure condition is browser lockup, silent truncation, broken page count, or lost UI control.

---

X00 Roman's Mobile Code Review Session

---

Roman is on a train and opens `sliding-window.md`.

The note has several JavaScript code blocks and explanations. He holds the phone in one hand.

The app should default to his saved mobile-friendly preferences if those are stored globally. If he previously chose scroll mode and Atkinson Hyperlegible, those apply. The content opens with readable text and contained code blocks.

Roman scrolls to a section. He reads the explanation. He looks at the code. He may copy a small idea mentally, not through the app. The reader does not need editing or annotation.

If a code block is wider than the screen, the app should contain the overflow inside the code block. The rest of the page should remain stable. Roman should not have to pinch zoom.

He closes the app after five minutes.

The expected result is quick, reliable mobile review of technical Markdown.

The failure condition is horizontal overflow, tiny code, accidental page turns while scrolling, or settings too hard to use one-handed.

---

Y00 Roman's Desktop Deep Reading Session

---

Roman opens `browser-rendering-pipeline.md` on desktop.

He wants to read carefully. Page mode is appropriate. The app paginates the document after fonts load. The reader shows the first page. The page turns feel like E Ink partial refresh. After several turns, a full refresh may clear ghosting.

Roman changes to high contrast because the note contains many small code fragments. The app redraws the page. He changes line height to improve scanning. The app repaginates and keeps him near the same section.

He reads for an hour. The page surface remains stable. There are no memory leaks visible as progressive slowdown. The E Ink effect does not accumulate artifacts permanently. Keyboard navigation remains consistent.

The expected result is that the app supports long technical reading.

The failure condition is cumulative jank, growing ghost artifacts, keyboard failure after many transitions, or degraded code readability.

---

Z00 Roman's Tablet Review Session

---

Roman uses a tablet to review system design notes.

He opens a Markdown file with headings, diagrams described as text, lists, and code blocks.

The tablet layout should support touch. If page mode is active, next and previous controls should be easy to tap. If scroll mode is active, scrolling should be natural. The settings panel should not be cramped.

When Roman rotates the tablet, the app recalculates layout and keeps him near the same content. The transition should feel like a device redraw, not a broken responsive jump.

The expected result is that tablet reading works for medium and long technical documents.

The failure condition is clipped content, tiny controls, orientation loss, or broken pagination after rotation.

---

AA00 Roman Tests Offline Behavior

---

Roman disconnects from the network or opens the app in an offline environment.

The app still loads. Fonts are present. Markdown support is present. Textures are present. E Ink effects are present. Settings are present.

He opens a Markdown note containing remote image syntax. The app does not load the image. It may show a placeholder such as:

"External images are not loaded in this reader."

He opens a note with links. The app does not prefetch them.

The expected result is that runtime is truly offline after vendoring.

The failure condition is missing fonts, broken parser, remote requests, failed texture loading, or network errors in normal use.

---

AB00 Roman Checks Error Language

---

Roman values precise errors.

For normal users, messages should be clear and calm. For Roman, they should also be specific enough to diagnose the category of problem.

Good main messages:

"This file type is not supported. Open a .txt, .md, or .markdown file."

"Markdown could not be shown safely. You can open this file as plain text instead."

"Page layout could not be prepared for this file. You can read it in scroll mode instead."

"That font is not available, so the reader used Literata."

"Reader preferences could not be restored. The default settings are being used for this session."

Good diagnostic details:

"Unsupported extension: .json."

"Markdown parser unavailable."

"Sanitizer unavailable, unsafe Markdown was not rendered."

"Pagination failed after layout recalculation."

"Selected font failed to load."

Poor messages:

"Something went wrong."

"Invalid."

"Fatal error."

"Cannot read property of undefined."

"Parser exploded."

The expected result is that Roman can distinguish user action errors, missing asset errors, parsing errors, pagination errors, and preference errors.

The failure condition is vague error handling or technical stack traces shown as the main UI.

---

AC00 Roman's Boundary Case Files

---

Roman's notes are not clean enough for happy-path testing only.

The app must handle files with one extremely long line, long paragraphs, many headings, deeply nested lists, code fences, raw HTML, Unicode, mixed punctuation, malformed Markdown, and very short content.

Roman may open a file containing Cyrillic text. The reader should not corrupt encoding. If selected font coverage is insufficient, fallback behavior should preserve readable text.

Roman may open a file with old Windows line endings. Paragraphs should still render.

Roman may open a file with command output. Spacing should remain understandable.

The expected result is robust text handling.

The failure condition is mojibake, collapsed structure, broken layout, or unreadable fallback fonts.

---

AD00 Roman's View Of Implementation Quality

---

Roman is not only a reader. He is an engineer.

He will infer implementation quality from the surface. If page turns are inconsistent, he assumes the state model is weak. If settings produce broken layout, he assumes pagination was not tested. If raw HTML renders, he assumes security was ignored. If fonts load from the network, he assumes offline claims are false. If errors are vague, he assumes debugging will be painful.

The app should therefore behave like a well-engineered small tool.

The runtime should be static.

Dependencies should be vendored.

Vendored files should be readable.

Fonts should be local.

Errors should be structured.

Preferences should be validated.

Book contents should not persist.

Visual behavior should be tested.

Mobile code blocks should be tested.

Roman does not need the app to expose all of this. He needs the app to act as though it was built with these constraints seriously.

The expected result is confidence.

The failure condition is any contradiction between stated constraints and actual behavior.

---

AE00 Roman's Acceptance Criteria

---

Roman can open local Markdown notes with code blocks.

Roman can open local TXT notes.

Roman can use the app on mobile for quick review.

Roman can use the app on desktop for careful reading.

Roman can use the app on tablet for touch reading.

Roman can switch between page mode and scroll mode.

Roman can read code blocks without layout breakage.

Roman can read links without automatic network activity.

Roman can open malformed Markdown safely or fall back to plain text.

Raw HTML does not execute.

Remote images are not fetched.

The default font is local Literata.

Other bundled fonts are local and selectable.

Typography settings apply predictably.

Theme and contrast settings support code readability.

E Ink effect settings support off, reduced, balanced, and strong behavior.

Reduced motion is respected.

Preferences persist.

Book and note contents do not persist.

Diagnostics exist but do not leak note content.

Errors are clear in the main UI and more specific in diagnostics.

The app works offline after vendoring.

The app remains static and inspectable.

The app does not become a note manager, sync system, editor, or cloud library.

---

AF00 Final Roman Test Narrative

---

Roman has a personal archive of Markdown and TXT files. Some are polished technical notes. Some are rough LeetCode explanations. Some contain code snippets, links, quotes, jokes, and old debugging reminders. He keeps them organized outside the app and opens them when he wants to read or review.

On desktop, he opens a long Markdown note and reads it in page mode. The typography is calm. The code blocks are readable. The page turns feel like an E Ink refresh. He changes font, contrast, line height, and E Ink intensity. The app redraws and preserves his place.

On mobile, he opens a short algorithm note on the train. He uses scroll mode, finds the section he needs, reads the code, and closes the app. The layout does not break. The code does not force horizontal page scrolling. The interface does not ask him to manage a library.

On tablet, he reads a system design note. Rotation triggers a controlled redraw. Touch controls work. Settings fit the screen.

When Roman opens messy Markdown, the app renders safely. When he opens the wrong file type, the app rejects it clearly. When a font or dependency is missing, the app degrades safely and explains the problem. When he checks storage, his preferences are there, but his notes are not.

The best version of the software gives Roman a serious local reading tool for technical Markdown and TXT files. It respects his workflow, his privacy, his engineering standards, and his need to review code-heavy notes on the devices he actually uses.

```






## File content `specs\roman-usage-scenario_todo.md`:

# specs/roman-usage-scenario_todo.md

Source: specs/roman-usage-scenario.md
Pass: Roman (experienced software engineer reading code-heavy notes)

Roman reviews technical Markdown and code notes on mobile and desktop. He trusts
the app only if code renders well, links behave, the runtime is genuinely local
and inspectable, Markdown is safe, and diagnostics are available.

---

## A00 Acceptance Checklist

### Technical Markdown & code
- [x] Fenced code blocks render in a monospace block, visually distinct from prose.
- [x] Inline code is distinct but not loud.
- [x] Code blocks contain overflow (horizontal scroll) instead of breaking the page/measure (verified `overflow-x: auto`).
- [x] Long code lines do not force the whole page wider or clip content.
- [x] Headings, lists, blockquotes, and tables render correctly.

### Links
- [x] Links are subdued and clearly styled.
- [x] Links are not prefetched.
- [x] External links open with `rel="noopener"`-style safety and only on explicit click.
- [x] `javascript:` URLs are neutralized.

### Safe Markdown (engineer-level scrutiny)
- [x] Raw HTML is escaped/sanitized, never executed (`html:false` + DOMPurify).
- [x] Images are placeholders and never fetched.
- [x] `<script>/<iframe>/<style>` and inline handlers are stripped.
- [x] Sanitizer failure fails closed.

### Local / offline integrity
- [x] No runtime network requests (CSP `connect-src 'none'`, verified 0 external).
- [x] All dependencies and fonts are local, unminified, and readable.
- [x] Vendor manifest with sha256 + `vendor-check.mjs` for integrity auditing.
- [x] The app runs from `file://` or a trivial static server with no backend.

### Inspectability & diagnostics
- [x] Source is plain, modular ES modules with clear names (no bundler/minifier).
- [x] Advanced diagnostics panel: debug-mode toggle, log view, copy logs, clear logs.
- [x] Logs are structured and never contain book/note content.
- [x] Reset preferences action available.

### Preference persistence without content persistence
- [x] Preferences persist (validated/versioned) under a single namespaced key.
- [x] Note/book content is never persisted (verified across reload).

### Mobile technical review
- [x] Code-heavy Markdown is readable on mobile; code blocks scroll horizontally rather than overflow the layout.
- [x] Touch targets and single-column layout work on a phone viewport.

---

## B00 Validation Checklist

- [x] Loaded code-heavy Markdown on desktop and mobile; verified code containment.
- [x] Confirmed images are not fetched and scripts do not execute.
- [x] Confirmed 0 external network requests during the session.
- [x] Verified vendored deps/fonts are unminified and license-tracked; `vendor-check` passes 17/17.
- [x] Opened Advanced diagnostics, enabled debug mode, confirmed logs render and can be copied/cleared.
- [x] Confirmed only `eink-reader:preferences` is stored and it contains no note text.
- [ ] Manual: read a real technical note to judge code/prose balance and contrast.

---

## C00 Risks And Edge Cases

- [x] Code blocks breaking pagination â€” contained via horizontal scroll.
- [x] Log leakage of content â€” logs carry event names/metadata only, not text.
- [x] Diagnostics cluttering the main UI for non-engineers â€” hidden behind a disclosure (reconciles with Lily).
- [ ] Extremely wide code with no spaces â€” scrolls horizontally; not visually stress-tested at extreme widths.

---

## D00 Final Review

- [x] Lily-driven simplification did not remove Roman's technical diagnostics (they are opt-in, not absent).
- [x] Frank-driven visual choices do not harm code readability (monospace block, contained overflow, high-contrast theme available).
- [x] No note content persisted; no runtime network access.
- [ ] Remaining limitation: final code/prose readability judgement is a human task.


## File content `tests\fixtures\code-heavy.md`:

# Binary Search Patterns

Problem: https://example.com/problems/search

Key idea: use the sorted half.

```js
function search(nums, target) {
  let left = 0;
  let right = nums.length - 1;
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    if (nums[mid] === target) return mid;
    if (nums[left] <= nums[mid]) { if (nums[left] <= target && target < nums[mid]) right = mid - 1; else left = mid + 1; }
    else { if (nums[mid] < target && target <= nums[right]) left = mid + 1; else right = mid - 1; }
  }
  return -1;
}
```

A very long single code line:

```
const url = "https://example.com/very/long/path/that/keeps/going/and/going/and/should/not/break/the/whole/page/layout/horizontally?query=1&more=2&evenmore=3";
```

Inline `code` and a [link](https://example.com/).


## File content `tests\fixtures\empty.txt`:

```txt

```

## File content `tests\fixtures\large-headings.md`:

# Large Heading Structure

## Section 1

A short paragraph under section 1. It exists to test navigation and layout across many headings.

### Subsection 1.1

Another short paragraph, slightly nested, to test heading hierarchy.

## Section 2

A short paragraph under section 2. It exists to test navigation and layout across many headings.

### Subsection 2.1

Another short paragraph, slightly nested, to test heading hierarchy.

## Section 3

A short paragraph under section 3. It exists to test navigation and layout across many headings.

### Subsection 3.1

Another short paragraph, slightly nested, to test heading hierarchy.

## Section 4

A short paragraph under section 4. It exists to test navigation and layout across many headings.

### Subsection 4.1

Another short paragraph, slightly nested, to test heading hierarchy.

## Section 5

A short paragraph under section 5. It exists to test navigation and layout across many headings.

### Subsection 5.1

Another short paragraph, slightly nested, to test heading hierarchy.

## Section 6

A short paragraph under section 6. It exists to test navigation and layout across many headings.

### Subsection 6.1

Another short paragraph, slightly nested, to test heading hierarchy.

## Section 7

A short paragraph under section 7. It exists to test navigation and layout across many headings.

### Subsection 7.1

Another short paragraph, slightly nested, to test heading hierarchy.

## Section 8

A short paragraph under section 8. It exists to test navigation and layout across many headings.

### Subsection 8.1

Another short paragraph, slightly nested, to test heading hierarchy.

## Section 9

A short paragraph under section 9. It exists to test navigation and layout across many headings.

### Subsection 9.1

Another short paragraph, slightly nested, to test heading hierarchy.

## Section 10

A short paragraph under section 10. It exists to test navigation and layout across many headings.

### Subsection 10.1

Another short paragraph, slightly nested, to test heading hierarchy.

## Section 11

A short paragraph under section 11. It exists to test navigation and layout across many headings.

### Subsection 11.1

Another short paragraph, slightly nested, to test heading hierarchy.

## Section 12

A short paragraph under section 12. It exists to test navigation and layout across many headings.

### Subsection 12.1

Another short paragraph, slightly nested, to test heading hierarchy.

## Section 13

A short paragraph under section 13. It exists to test navigation and layout across many headings.

### Subsection 13.1

Another short paragraph, slightly nested, to test heading hierarchy.

## Section 14

A short paragraph under section 14. It exists to test navigation and layout across many headings.

### Subsection 14.1

Another short paragraph, slightly nested, to test heading hierarchy.

## Section 15

A short paragraph under section 15. It exists to test navigation and layout across many headings.

### Subsection 15.1

Another short paragraph, slightly nested, to test heading hierarchy.

## Section 16

A short paragraph under section 16. It exists to test navigation and layout across many headings.

### Subsection 16.1

Another short paragraph, slightly nested, to test heading hierarchy.

## Section 17

A short paragraph under section 17. It exists to test navigation and layout across many headings.

### Subsection 17.1

Another short paragraph, slightly nested, to test heading hierarchy.

## Section 18

A short paragraph under section 18. It exists to test navigation and layout across many headings.

### Subsection 18.1

Another short paragraph, slightly nested, to test heading hierarchy.

## Section 19

A short paragraph under section 19. It exists to test navigation and layout across many headings.

### Subsection 19.1

Another short paragraph, slightly nested, to test heading hierarchy.

## Section 20

A short paragraph under section 20. It exists to test navigation and layout across many headings.

### Subsection 20.1

Another short paragraph, slightly nested, to test heading hierarchy.

## Section 21

A short paragraph under section 21. It exists to test navigation and layout across many headings.

### Subsection 21.1

Another short paragraph, slightly nested, to test heading hierarchy.

## Section 22

A short paragraph under section 22. It exists to test navigation and layout across many headings.

### Subsection 22.1

Another short paragraph, slightly nested, to test heading hierarchy.

## Section 23

A short paragraph under section 23. It exists to test navigation and layout across many headings.

### Subsection 23.1

Another short paragraph, slightly nested, to test heading hierarchy.

## Section 24

A short paragraph under section 24. It exists to test navigation and layout across many headings.

### Subsection 24.1

Another short paragraph, slightly nested, to test heading hierarchy.

## Section 25

A short paragraph under section 25. It exists to test navigation and layout across many headings.

### Subsection 25.1

Another short paragraph, slightly nested, to test heading hierarchy.

## Section 26

A short paragraph under section 26. It exists to test navigation and layout across many headings.

### Subsection 26.1

Another short paragraph, slightly nested, to test heading hierarchy.

## Section 27

A short paragraph under section 27. It exists to test navigation and layout across many headings.

### Subsection 27.1

Another short paragraph, slightly nested, to test heading hierarchy.

## Section 28

A short paragraph under section 28. It exists to test navigation and layout across many headings.

### Subsection 28.1

Another short paragraph, slightly nested, to test heading hierarchy.

## Section 29

A short paragraph under section 29. It exists to test navigation and layout across many headings.

### Subsection 29.1

Another short paragraph, slightly nested, to test heading hierarchy.

## Section 30

A short paragraph under section 30. It exists to test navigation and layout across many headings.

### Subsection 30.1

Another short paragraph, slightly nested, to test heading hierarchy.



## File content `tests\fixtures\long-book.txt`:

```txt
The Long Quiet

Chapter 1

This is sentence 1 of paragraph 1 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 1 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 1 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 1 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 1 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 1 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 2 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 2 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 2 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 2 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 2 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 2 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 3 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 3 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 3 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 3 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 3 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 3 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 4 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 4 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 4 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 4 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 4 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 4 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 5 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 5 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 5 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 5 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 5 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 5 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 6 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 6 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 6 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 6 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 6 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 6 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 7 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 7 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 7 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 7 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 7 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 7 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 8 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 8 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 8 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 8 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 8 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 8 in chapter 1, written to give the paginator enough material to flow across many pages while staying calm and readable.

Chapter 2

This is sentence 1 of paragraph 1 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 1 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 1 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 1 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 1 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 1 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 2 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 2 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 2 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 2 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 2 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 2 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 3 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 3 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 3 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 3 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 3 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 3 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 4 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 4 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 4 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 4 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 4 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 4 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 5 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 5 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 5 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 5 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 5 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 5 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 6 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 6 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 6 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 6 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 6 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 6 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 7 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 7 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 7 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 7 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 7 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 7 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 8 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 8 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 8 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 8 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 8 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 8 in chapter 2, written to give the paginator enough material to flow across many pages while staying calm and readable.

Chapter 3

This is sentence 1 of paragraph 1 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 1 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 1 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 1 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 1 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 1 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 2 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 2 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 2 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 2 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 2 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 2 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 3 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 3 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 3 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 3 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 3 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 3 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 4 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 4 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 4 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 4 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 4 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 4 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 5 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 5 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 5 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 5 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 5 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 5 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 6 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 6 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 6 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 6 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 6 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 6 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 7 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 7 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 7 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 7 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 7 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 7 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 8 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 8 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 8 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 8 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 8 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 8 in chapter 3, written to give the paginator enough material to flow across many pages while staying calm and readable.

Chapter 4

This is sentence 1 of paragraph 1 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 1 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 1 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 1 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 1 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 1 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 2 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 2 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 2 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 2 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 2 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 2 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 3 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 3 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 3 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 3 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 3 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 3 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 4 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 4 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 4 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 4 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 4 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 4 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 5 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 5 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 5 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 5 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 5 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 5 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 6 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 6 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 6 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 6 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 6 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 6 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 7 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 7 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 7 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 7 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 7 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 7 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 8 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 8 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 8 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 8 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 8 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 8 in chapter 4, written to give the paginator enough material to flow across many pages while staying calm and readable.

Chapter 5

This is sentence 1 of paragraph 1 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 1 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 1 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 1 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 1 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 1 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 2 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 2 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 2 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 2 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 2 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 2 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 3 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 3 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 3 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 3 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 3 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 3 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 4 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 4 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 4 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 4 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 4 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 4 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 5 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 5 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 5 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 5 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 5 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 5 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 6 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 6 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 6 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 6 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 6 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 6 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 7 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 7 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 7 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 7 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 7 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 7 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 8 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 8 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 8 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 8 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 8 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 8 in chapter 5, written to give the paginator enough material to flow across many pages while staying calm and readable.

Chapter 6

This is sentence 1 of paragraph 1 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 1 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 1 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 1 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 1 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 1 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 2 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 2 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 2 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 2 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 2 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 2 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 3 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 3 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 3 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 3 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 3 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 3 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 4 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 4 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 4 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 4 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 4 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 4 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 5 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 5 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 5 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 5 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 5 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 5 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 6 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 6 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 6 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 6 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 6 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 6 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 7 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 7 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 7 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 7 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 7 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 7 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 8 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 8 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 8 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 8 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 8 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 8 in chapter 6, written to give the paginator enough material to flow across many pages while staying calm and readable.

Chapter 7

This is sentence 1 of paragraph 1 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 1 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 1 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 1 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 1 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 1 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 2 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 2 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 2 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 2 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 2 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 2 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 3 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 3 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 3 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 3 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 3 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 3 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 4 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 4 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 4 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 4 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 4 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 4 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 5 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 5 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 5 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 5 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 5 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 5 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 6 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 6 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 6 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 6 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 6 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 6 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 7 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 7 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 7 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 7 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 7 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 7 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 8 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 8 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 8 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 8 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 8 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 8 in chapter 7, written to give the paginator enough material to flow across many pages while staying calm and readable.

Chapter 8

This is sentence 1 of paragraph 1 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 1 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 1 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 1 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 1 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 1 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 2 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 2 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 2 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 2 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 2 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 2 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 3 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 3 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 3 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 3 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 3 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 3 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 4 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 4 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 4 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 4 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 4 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 4 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 5 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 5 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 5 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 5 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 5 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 5 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 6 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 6 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 6 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 6 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 6 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 6 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 7 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 7 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 7 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 7 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 7 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 7 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 8 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 8 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 8 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 8 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 8 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 8 in chapter 8, written to give the paginator enough material to flow across many pages while staying calm and readable.

Chapter 9

This is sentence 1 of paragraph 1 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 1 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 1 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 1 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 1 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 1 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 2 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 2 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 2 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 2 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 2 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 2 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 3 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 3 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 3 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 3 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 3 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 3 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 4 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 4 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 4 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 4 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 4 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 4 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 5 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 5 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 5 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 5 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 5 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 5 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 6 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 6 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 6 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 6 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 6 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 6 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 7 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 7 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 7 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 7 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 7 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 7 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 8 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 8 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 8 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 8 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 8 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 8 in chapter 9, written to give the paginator enough material to flow across many pages while staying calm and readable.

Chapter 10

This is sentence 1 of paragraph 1 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 1 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 1 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 1 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 1 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 1 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 2 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 2 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 2 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 2 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 2 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 2 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 3 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 3 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 3 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 3 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 3 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 3 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 4 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 4 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 4 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 4 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 4 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 4 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 5 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 5 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 5 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 5 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 5 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 5 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 6 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 6 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 6 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 6 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 6 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 6 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 7 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 7 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 7 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 7 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 7 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 7 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 8 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 8 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 8 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 8 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 8 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 8 in chapter 10, written to give the paginator enough material to flow across many pages while staying calm and readable.

Chapter 11

This is sentence 1 of paragraph 1 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 1 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 1 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 1 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 1 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 1 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 2 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 2 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 2 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 2 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 2 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 2 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 3 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 3 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 3 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 3 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 3 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 3 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 4 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 4 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 4 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 4 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 4 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 4 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 5 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 5 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 5 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 5 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 5 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 5 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 6 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 6 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 6 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 6 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 6 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 6 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 7 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 7 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 7 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 7 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 7 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 7 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 8 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 8 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 8 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 8 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 8 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 8 in chapter 11, written to give the paginator enough material to flow across many pages while staying calm and readable.

Chapter 12

This is sentence 1 of paragraph 1 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 1 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 1 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 1 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 1 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 1 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 2 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 2 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 2 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 2 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 2 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 2 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 3 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 3 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 3 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 3 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 3 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 3 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 4 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 4 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 4 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 4 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 4 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 4 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 5 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 5 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 5 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 5 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 5 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 5 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 6 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 6 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 6 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 6 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 6 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 6 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 7 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 7 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 7 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 7 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 7 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 7 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 8 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 8 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 8 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 8 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 8 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 8 in chapter 12, written to give the paginator enough material to flow across many pages while staying calm and readable.

Chapter 13

This is sentence 1 of paragraph 1 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 1 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 1 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 1 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 1 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 1 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 2 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 2 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 2 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 2 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 2 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 2 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 3 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 3 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 3 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 3 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 3 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 3 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 4 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 4 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 4 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 4 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 4 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 4 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 5 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 5 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 5 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 5 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 5 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 5 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 6 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 6 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 6 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 6 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 6 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 6 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 7 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 7 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 7 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 7 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 7 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 7 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 8 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 8 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 8 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 8 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 8 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 8 in chapter 13, written to give the paginator enough material to flow across many pages while staying calm and readable.

Chapter 14

This is sentence 1 of paragraph 1 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 1 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 1 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 1 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 1 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 1 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 2 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 2 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 2 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 2 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 2 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 2 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 3 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 3 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 3 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 3 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 3 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 3 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 4 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 4 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 4 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 4 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 4 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 4 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 5 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 5 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 5 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 5 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 5 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 5 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 6 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 6 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 6 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 6 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 6 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 6 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 7 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 7 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 7 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 7 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 7 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 7 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 8 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 8 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 8 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 8 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 8 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 8 in chapter 14, written to give the paginator enough material to flow across many pages while staying calm and readable.

Chapter 15

This is sentence 1 of paragraph 1 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 1 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 1 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 1 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 1 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 1 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 2 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 2 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 2 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 2 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 2 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 2 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 3 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 3 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 3 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 3 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 3 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 3 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 4 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 4 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 4 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 4 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 4 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 4 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 5 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 5 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 5 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 5 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 5 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 5 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 6 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 6 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 6 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 6 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 6 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 6 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 7 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 7 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 7 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 7 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 7 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 7 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 8 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 8 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 8 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 8 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 8 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 8 in chapter 15, written to give the paginator enough material to flow across many pages while staying calm and readable.

Chapter 16

This is sentence 1 of paragraph 1 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 1 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 1 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 1 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 1 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 1 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 2 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 2 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 2 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 2 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 2 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 2 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 3 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 3 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 3 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 3 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 3 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 3 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 4 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 4 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 4 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 4 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 4 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 4 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 5 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 5 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 5 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 5 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 5 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 5 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 6 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 6 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 6 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 6 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 6 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 6 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 7 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 7 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 7 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 7 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 7 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 7 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 8 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 8 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 8 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 8 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 8 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 8 in chapter 16, written to give the paginator enough material to flow across many pages while staying calm and readable.

Chapter 17

This is sentence 1 of paragraph 1 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 1 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 1 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 1 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 1 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 1 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 2 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 2 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 2 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 2 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 2 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 2 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 3 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 3 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 3 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 3 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 3 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 3 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 4 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 4 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 4 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 4 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 4 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 4 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 5 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 5 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 5 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 5 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 5 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 5 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 6 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 6 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 6 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 6 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 6 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 6 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 7 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 7 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 7 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 7 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 7 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 7 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 8 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 8 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 8 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 8 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 8 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 8 in chapter 17, written to give the paginator enough material to flow across many pages while staying calm and readable.

Chapter 18

This is sentence 1 of paragraph 1 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 1 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 1 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 1 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 1 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 1 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 2 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 2 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 2 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 2 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 2 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 2 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 3 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 3 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 3 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 3 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 3 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 3 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 4 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 4 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 4 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 4 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 4 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 4 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 5 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 5 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 5 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 5 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 5 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 5 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 6 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 6 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 6 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 6 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 6 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 6 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 7 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 7 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 7 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 7 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 7 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 7 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 8 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 8 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 8 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 8 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 8 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 8 in chapter 18, written to give the paginator enough material to flow across many pages while staying calm and readable.

Chapter 19

This is sentence 1 of paragraph 1 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 1 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 1 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 1 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 1 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 1 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 2 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 2 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 2 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 2 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 2 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 2 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 3 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 3 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 3 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 3 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 3 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 3 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 4 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 4 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 4 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 4 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 4 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 4 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 5 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 5 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 5 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 5 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 5 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 5 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 6 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 6 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 6 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 6 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 6 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 6 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 7 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 7 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 7 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 7 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 7 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 7 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 8 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 8 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 8 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 8 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 8 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 8 in chapter 19, written to give the paginator enough material to flow across many pages while staying calm and readable.

Chapter 20

This is sentence 1 of paragraph 1 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 1 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 1 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 1 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 1 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 1 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 2 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 2 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 2 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 2 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 2 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 2 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 3 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 3 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 3 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 3 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 3 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 3 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 4 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 4 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 4 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 4 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 4 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 4 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 5 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 5 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 5 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 5 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 5 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 5 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 6 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 6 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 6 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 6 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 6 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 6 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 7 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 7 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 7 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 7 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 7 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 7 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable.

This is sentence 1 of paragraph 8 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 2 of paragraph 8 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 3 of paragraph 8 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 4 of paragraph 8 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 5 of paragraph 8 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable. This is sentence 6 of paragraph 8 in chapter 20, written to give the paginator enough material to flow across many pages while staying calm and readable.


```

## File content `tests\fixtures\markdown-edge-cases.md`:

# Markdown Edge Cases

This file intentionally contains hostile and messy content. The reader must
never execute scripts, load remote images, or render raw HTML as trusted markup.

## Raw HTML that must not execute

<script>window.__xssExecuted = true; alert("xss");</script>

<div onclick="window.__xssExecuted = true">A div with an inline handler.</div>

<img src="https://example.com/tracker.gif" onerror="window.__xssExecuted = true">

<iframe src="https://example.com/"></iframe>

<style>body { background: red !important; }</style>

## A link with a javascript URL

[do not run me](javascript:window.__xssExecuted=true)

## Malformed and unusual Markdown

*unterminated emphasis and `unterminated code

####### too many hashes to be a heading

A table if supported:

| Feature | State |
| ------- | ----- |
| Scripts | blocked |
| Images  | placeholder |

## Nested formatting

> A quote containing **bold**, *italic*, and `code`, plus a nested list:
>
> - one
> - two

Trailing whitespace and	tabs	should	not	break	the	layout.


## File content `tests\fixtures\one-long-line.txt`:

```txt
word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word
```

## File content `tests\fixtures\simple.md`:

# A Small Field Guide to Calm Reading

A calm reader should feel like paper. This document exercises common Markdown
so the reading surface can be judged against real content.

## Paragraphs and Emphasis

Reading is easier when paragraphs breathe. Some words deserve *emphasis*, and a
few deserve **strong emphasis**. Occasionally we combine ***both***.

Inline code such as `const x = 42;` should be distinct but never loud.

## Lists

An unordered list:

- First a calm point.
- Then a second point.
- And a nested idea:
  - a smaller detail,
  - and another.

An ordered list:

1. Open a file.
2. Read a while.
3. Adjust the page to your eyes.

## Blockquote

> A quiet interface disappears, and only the text remains.
> That is the whole ambition of this reader.

## A Short Code Block

```js
function greet(name) {
  return `Hello, ${name}`;
}
```

## Links and Rules

Here is a [link to an external site](https://example.com/) that should be
subdued and must not be prefetched.

---

That horizontal rule marks a section break. The reader should treat it as a
gentle pause rather than a heavy divider.


## File content `tests\fixtures\simple.txt`:

```txt
On Reading Quietly

There is a particular calm that comes from reading a plain text file. No menus
compete for attention. No colors shout. The words simply arrive.

This short document exists to test the reader. It has a title on the first line,
a blank line, and then several paragraphs of ordinary prose. The reader should
present it as comfortable, book-like text rather than a raw file dump.

A second paragraph follows. It is long enough to wrap across several lines at a
typical reading width, which lets us check that line length stays comfortable
and that hyphenation and spacing feel intentional rather than accidental.

A third paragraph closes the piece. When the reader turns to the next page, the
transition should feel like a screen refresh settling into place, not a glossy
slide. When the reader scrolls, the surface should stay quiet and legible.

```

## File content `tests\fixtures\unicode.txt`:

```txt
Unicode and Punctuation Sample

Accented Latin: cafÃ©, naÃ¯ve, faÃ§ade, jalapeÃ±o, ZÃ¼rich, MÃ¡laga, ÄÃ  Náºµng.
Smart punctuation: â€œcurly quotes,â€ â€˜single quotes,â€™ emâ€”dashes, and ellipsesâ€¦
Symbols: Â© Â® â„¢ Â§ Â¶ â€  â€¡ â€¢ Â° â‚¬ Â£ Â¥ â‚¹ â† â†’ â†‘ â†“ â‰ˆ â‰  â‰¤ â‰¥ âˆ‘ âˆ†.

Greek: á½‰ Î²Î¯Î¿Ï‚ Î²ÏÎ±Ï‡ÏÏ‚, á¼¡ Î´á½² Ï„Î­Ï‡Î½Î· Î¼Î±ÎºÏÎ®.
Cyrillic: Ð¡ÑŠÐµÑˆÑŒ Ð¶Ðµ ÐµÑ‰Ñ‘ ÑÑ‚Ð¸Ñ… Ð¼ÑÐ³ÐºÐ¸Ñ… Ñ„Ñ€Ð°Ð½Ñ†ÑƒÐ·ÑÐºÐ¸Ñ… Ð±ÑƒÐ»Ð¾Ðº Ð´Ð° Ð²Ñ‹Ð¿ÐµÐ¹ Ñ‡Ð°ÑŽ.
Japanese: æ˜¥ã¯ã‚ã‘ã¼ã®ã€‚ã‚„ã†ã‚„ã†ç™½ããªã‚Šã‚†ãå±±ãŽã¯ã€å°‘ã—æ˜Žã‹ã‚Šã¦ã€‚
Arabic: Ø§Ù„Ø®Ø· Ø§Ù„Ø¹Ø±Ø¨ÙŠ ÙŠØªØ¯ÙÙ‚ Ù…Ù† Ø§Ù„ÙŠÙ…ÙŠÙ† Ø¥Ù„Ù‰ Ø§Ù„ÙŠØ³Ø§Ø±.
Emoji: ðŸ“– ðŸ–‹ï¸ ðŸŒ™ â˜• â€” these should render or degrade without breaking layout.

A very long line follows to test wrapping and horizontal overflow handling within the reading column, and it keeps going without any hard breaks so that the paginator and the scroll surface both have to decide how to wrap this single continuous line of text gracefully across the available measure.

```

## File content `tests\fixtures\whitespace.txt`:

```txt
   

		
   

```

## File content `tests\playwright\reader.spec.js`:

```js
// End-to-end behavior tests for the E Ink reader.
//
// These cover the acceptance-critical behaviors: local file loading, TXT and
// Markdown rendering, page/scroll modes, Markdown safety, offline/no-network
// runtime, preference persistence WITHOUT book-content persistence, error
// recovery, code-block containment, and reduced motion.
//
// The app exposes `window.__einkReader` for test hooks only; it holds no
// persisted state. Malicious fixtures set window.__xssExecuted if script runs.

import { test, expect } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const FX = join(here, "..", "fixtures");
const fx = (name) => join(FX, name);

async function openFile(page, name) {
  await page.goto("/");
  await page.waitForFunction(() => !!window.__einkReader);
  await page.setInputFiles("#file-input", fx(name));
}

test("no external network requests occur at runtime", async ({ page }) => {
  const external = [];
  page.on("request", (r) => {
    const u = r.url();
    if (!u.startsWith("http://localhost") && !u.startsWith("data:") && !u.startsWith("blob:")) {
      external.push(u);
    }
  });
  await openFile(page, "simple.md");
  await page.waitForTimeout(800);
  expect(external).toEqual([]);
});

test("opens a TXT file and shows the reader", async ({ page }) => {
  await openFile(page, "simple.txt");
  await expect(page.locator("#reader")).toBeVisible();
  await expect(page.locator("#open-screen")).toBeHidden();
});

test("paginates a long book with stable page count", async ({ page }) => {
  await openFile(page, "long-book.txt");
  await page.waitForTimeout(1200);
  const first = await page.evaluate(() => window.__einkReader.paginator.pageCount);
  expect(first).toBeGreaterThan(5);
  // Re-measuring must give the same result (no font-load drift).
  await page.evaluate(() => window.__einkReader.relayoutPreserving("full"));
  await page.waitForTimeout(700);
  const second = await page.evaluate(() => window.__einkReader.paginator.pageCount);
  expect(second).toBe(first);
});

test("page navigation moves forward and back", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "keyboard nav is a desktop path");
  await openFile(page, "long-book.txt");
  await page.waitForTimeout(1000);
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => window.__einkReader.paginator.index)).toBe(1);
  await page.keyboard.press("ArrowLeft");
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => window.__einkReader.paginator.index)).toBe(0);
});

test("switches to scroll mode and the content scrolls", async ({ page }) => {
  await openFile(page, "long-book.txt");
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.__einkReader.onPreferenceChange({ readerMode: "scroll" }));
  await page.waitForTimeout(800);
  await expect(page.locator("#reader")).toHaveAttribute("data-mode", "scroll");
  const scrolled = await page.evaluate(() => {
    const stage = document.getElementById("reader-stage");
    stage.scrollTop = 2000;
    return stage.scrollTop;
  });
  expect(scrolled).toBeGreaterThan(0);
});

test("Markdown raw HTML never executes and is not rendered as trusted HTML", async ({ page }) => {
  await openFile(page, "markdown-edge-cases.md");
  await page.waitForTimeout(900);
  const xss = await page.evaluate(() => window.__xssExecuted === true);
  expect(xss).toBe(false);
  const scriptInContent = await page.evaluate(
    () => !!document.querySelector("#page-viewport script, #reader-scroll script")
  );
  expect(scriptInContent).toBe(false);
});

test("Markdown images are not fetched (rendered as placeholders)", async ({ page }) => {
  const imageRequests = [];
  page.on("request", (r) => {
    if (r.resourceType() === "image") imageRequests.push(r.url());
  });
  await openFile(page, "markdown-edge-cases.md");
  await page.waitForTimeout(900);
  expect(imageRequests).toEqual([]);
});

test("code blocks contain overflow instead of breaking the page", async ({ page }) => {
  await openFile(page, "code-heavy.md");
  await page.waitForTimeout(900);
  const pre = await page.evaluate(() => {
    const el = document.querySelector("pre");
    if (!el) return null;
    return { overflowX: getComputedStyle(el).overflowX };
  });
  expect(pre).not.toBeNull();
  expect(["auto", "scroll"]).toContain(pre.overflowX);
});

test("empty file shows a calm, non-technical message and no reader", async ({ page }) => {
  await openFile(page, "empty.txt");
  await page.waitForTimeout(500);
  await expect(page.locator("#reader")).toBeHidden();
  const notice = (await page.locator("#open-notice").textContent()) || "";
  expect(notice.toLowerCase()).toContain("empty");
});

test("unsupported file type is rejected with guidance", async ({ page }) => {
  await openFile(page, "unsupported.pdf");
  await page.waitForTimeout(500);
  await expect(page.locator("#reader")).toBeHidden();
  const notice = (await page.locator("#open-notice").textContent()) || "";
  expect(notice.toLowerCase()).toContain("supported");
});

test("preferences persist but book content does NOT persist across reload", async ({ page }) => {
  await openFile(page, "simple.md");
  await page.waitForTimeout(700);
  await page.evaluate(() => window.__einkReader.onPreferenceChange({ theme: "dark", fontSize: 22 }));
  await page.waitForTimeout(300);

  // Only the preferences key may exist; it must not contain book text.
  const store = await page.evaluate(() => JSON.stringify(localStorage));
  expect(store).not.toContain("Calm Reading");
  const keys = await page.evaluate(() => Object.keys(localStorage));
  expect(keys).toEqual(["eink-reader:preferences"]);

  await page.reload();
  await page.waitForTimeout(400);
  // Theme preference survives.
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  // The book is gone â€” the user must reopen it.
  await expect(page.locator("#reader")).toBeHidden();
  await expect(page.locator("#open-screen")).toBeVisible();
});

test("reduced-motion preference is reflected on the reader", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/");
  await page.waitForFunction(() => !!window.__einkReader);
  await page.setInputFiles("#file-input", fx("simple.txt"));
  await page.waitForTimeout(700);
  await expect(page.locator("#reader")).toHaveAttribute("data-motion", "reduced");
  await ctx.close();
});

test("settings panel opens and closes", async ({ page }) => {
  await openFile(page, "simple.txt");
  await page.waitForTimeout(600);
  await page.click("#settings-button");
  await page.waitForTimeout(300);
  await expect(page.locator(".settings")).toBeVisible();
});

```

## File content `tests\smoke.mjs`:

```js
// Dependency-tolerant smoke runner for the E Ink reader.
//
// Why this exists alongside tests/playwright/reader.spec.js:
//   The Playwright specs use the standard `@playwright/test` runner, which is
//   the portable, canonical way to run the suite (npm i -D @playwright/test &&
//   npx playwright test). Some environments only have the `playwright` LIBRARY
//   available (not the test-runner package). This script drives the same core
//   assertions using whichever `playwright` build can be resolved, so the
//   acceptance-critical behaviors can always be verified without installing
//   extra packages or adding node_modules to this static project.
//
// Usage (from the project root):
//   node scripts/serve-static.mjs 8123        # in one terminal
//   node tests/smoke.mjs                       # in another
// Or point at an existing server:
//   BASE_URL=http://localhost:8123 node tests/smoke.mjs

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import { execSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const FX = join(here, "fixtures");
const fx = (n) => join(FX, n);
const BASE = process.env.BASE_URL || "http://localhost:8123";

async function loadPlaywright() {
  // Try normal resolution first, then the global npm root.
  try {
    return await import("playwright");
  } catch (_) {
    try {
      const root = execSync("npm root -g").toString().trim();
      const req = createRequire(join(root, "noop.js"));
      return req("playwright");
    } catch (err) {
      console.error("Playwright library not found. Install it or run the");
      console.error("standard suite with @playwright/test. Skipping smoke run.");
      process.exit(3);
    }
  }
}

const results = [];
function check(name, cond, detail) {
  results.push({ name, ok: !!cond, detail });
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${cond ? "" : "  -> " + JSON.stringify(detail)}`);
}

async function open(page, name) {
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForFunction(() => !!window.__einkReader);
  await page.setInputFiles("#file-input", fx(name));
}

async function main() {
  const { chromium } = await loadPlaywright();
  const external = [];
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  page.on("request", (r) => {
    const u = r.url();
    if (!u.startsWith(BASE) && !u.startsWith("data:") && !u.startsWith("blob:")) external.push(u);
  });

  // TXT + reader visible
  await open(page, "simple.txt");
  check("TXT opens and shows reader", await page.isVisible("#reader"));

  // Stable pagination
  await open(page, "long-book.txt");
  await page.waitForTimeout(1200);
  const c1 = await page.evaluate(() => window.__einkReader.paginator.pageCount);
  await page.evaluate(() => window.__einkReader.relayoutPreserving("full"));
  await page.waitForTimeout(700);
  const c2 = await page.evaluate(() => window.__einkReader.paginator.pageCount);
  check("Pagination is stable across re-measure", c1 > 5 && c1 === c2, { c1, c2 });

  // Page navigation
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(500);
  const fwd = await page.evaluate(() => window.__einkReader.paginator.index);
  await page.keyboard.press("ArrowLeft");
  await page.waitForTimeout(500);
  const back = await page.evaluate(() => window.__einkReader.paginator.index);
  check("Page navigation forward/back", fwd === 1 && back === 0, { fwd, back });

  // Scroll mode
  await page.evaluate(() => window.__einkReader.onPreferenceChange({ readerMode: "scroll" }));
  await page.waitForTimeout(800);
  const scrolled = await page.evaluate(() => {
    const s = document.getElementById("reader-stage");
    s.scrollTop = 2000;
    return s.scrollTop;
  });
  check("Scroll mode scrolls", scrolled > 0, { scrolled });

  // Markdown safety
  await open(page, "markdown-edge-cases.md");
  await page.waitForTimeout(900);
  const xss = await page.evaluate(() => window.__xssExecuted === true);
  const scriptEl = await page.evaluate(() => !!document.querySelector("#page-viewport script, #reader-scroll script"));
  check("Markdown XSS blocked, no script element", !xss && !scriptEl, { xss, scriptEl });

  // Code block containment
  await open(page, "code-heavy.md");
  await page.waitForTimeout(900);
  const overflowX = await page.evaluate(() => { const p = document.querySelector("pre"); return p ? getComputedStyle(p).overflowX : null; });
  check("Code blocks contain overflow", overflowX === "auto" || overflowX === "scroll", { overflowX });

  // Empty file message
  await open(page, "empty.txt");
  await page.waitForTimeout(500);
  const emptyNotice = (await page.textContent("#open-notice")) || "";
  check("Empty file shows calm message", /empty/i.test(emptyNotice) && (await page.evaluate(() => document.getElementById("reader").hidden)), { emptyNotice });

  // Unsupported file message
  await open(page, "unsupported.pdf");
  await page.waitForTimeout(500);
  const unsupNotice = (await page.textContent("#open-notice")) || "";
  check("Unsupported file rejected with guidance", /supported/i.test(unsupNotice), { unsupNotice });

  // Persistence: prefs persist, book does not
  await open(page, "simple.md");
  await page.waitForTimeout(700);
  await page.evaluate(() => window.__einkReader.onPreferenceChange({ theme: "dark" }));
  await page.waitForTimeout(300);
  const keys = await page.evaluate(() => Object.keys(localStorage));
  const store = await page.evaluate(() => JSON.stringify(localStorage));
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const themeAfter = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
  const readerHidden = await page.evaluate(() => document.getElementById("reader").hidden);
  check(
    "Prefs persist, book content does not",
    keys.length === 1 && keys[0] === "eink-reader:preferences" && !store.includes("Calm Reading") && themeAfter === "dark" && readerHidden,
    { keys, themeAfter, readerHidden }
  );

  // No external network requests across the whole run
  check("No external network requests", external.length === 0, { external });

  await browser.close();

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
  if (failed.length) process.exit(1);
}

main().catch((e) => {
  console.error("Smoke run error:", e);
  process.exit(1);
});

```

## File content `vendor\dompurify\purify.js`:

```js
/*! @license DOMPurify 3.1.6 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.1.6/LICENSE */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.DOMPurify = factory());
})(this, (function () { 'use strict';

  const {
    entries,
    setPrototypeOf,
    isFrozen,
    getPrototypeOf,
    getOwnPropertyDescriptor
  } = Object;
  let {
    freeze,
    seal,
    create
  } = Object; // eslint-disable-line import/no-mutable-exports
  let {
    apply,
    construct
  } = typeof Reflect !== 'undefined' && Reflect;
  if (!freeze) {
    freeze = function freeze(x) {
      return x;
    };
  }
  if (!seal) {
    seal = function seal(x) {
      return x;
    };
  }
  if (!apply) {
    apply = function apply(fun, thisValue, args) {
      return fun.apply(thisValue, args);
    };
  }
  if (!construct) {
    construct = function construct(Func, args) {
      return new Func(...args);
    };
  }
  const arrayForEach = unapply(Array.prototype.forEach);
  const arrayPop = unapply(Array.prototype.pop);
  const arrayPush = unapply(Array.prototype.push);
  const stringToLowerCase = unapply(String.prototype.toLowerCase);
  const stringToString = unapply(String.prototype.toString);
  const stringMatch = unapply(String.prototype.match);
  const stringReplace = unapply(String.prototype.replace);
  const stringIndexOf = unapply(String.prototype.indexOf);
  const stringTrim = unapply(String.prototype.trim);
  const objectHasOwnProperty = unapply(Object.prototype.hasOwnProperty);
  const regExpTest = unapply(RegExp.prototype.test);
  const typeErrorCreate = unconstruct(TypeError);

  /**
   * Creates a new function that calls the given function with a specified thisArg and arguments.
   *
   * @param {Function} func - The function to be wrapped and called.
   * @returns {Function} A new function that calls the given function with a specified thisArg and arguments.
   */
  function unapply(func) {
    return function (thisArg) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      return apply(func, thisArg, args);
    };
  }

  /**
   * Creates a new function that constructs an instance of the given constructor function with the provided arguments.
   *
   * @param {Function} func - The constructor function to be wrapped and called.
   * @returns {Function} A new function that constructs an instance of the given constructor function with the provided arguments.
   */
  function unconstruct(func) {
    return function () {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      return construct(func, args);
    };
  }

  /**
   * Add properties to a lookup table
   *
   * @param {Object} set - The set to which elements will be added.
   * @param {Array} array - The array containing elements to be added to the set.
   * @param {Function} transformCaseFunc - An optional function to transform the case of each element before adding to the set.
   * @returns {Object} The modified set with added elements.
   */
  function addToSet(set, array) {
    let transformCaseFunc = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : stringToLowerCase;
    if (setPrototypeOf) {
      // Make 'in' and truthy checks like Boolean(set.constructor)
      // independent of any properties defined on Object.prototype.
      // Prevent prototype setters from intercepting set as a this value.
      setPrototypeOf(set, null);
    }
    let l = array.length;
    while (l--) {
      let element = array[l];
      if (typeof element === 'string') {
        const lcElement = transformCaseFunc(element);
        if (lcElement !== element) {
          // Config presets (e.g. tags.js, attrs.js) are immutable.
          if (!isFrozen(array)) {
            array[l] = lcElement;
          }
          element = lcElement;
        }
      }
      set[element] = true;
    }
    return set;
  }

  /**
   * Clean up an array to harden against CSPP
   *
   * @param {Array} array - The array to be cleaned.
   * @returns {Array} The cleaned version of the array
   */
  function cleanArray(array) {
    for (let index = 0; index < array.length; index++) {
      const isPropertyExist = objectHasOwnProperty(array, index);
      if (!isPropertyExist) {
        array[index] = null;
      }
    }
    return array;
  }

  /**
   * Shallow clone an object
   *
   * @param {Object} object - The object to be cloned.
   * @returns {Object} A new object that copies the original.
   */
  function clone(object) {
    const newObject = create(null);
    for (const [property, value] of entries(object)) {
      const isPropertyExist = objectHasOwnProperty(object, property);
      if (isPropertyExist) {
        if (Array.isArray(value)) {
          newObject[property] = cleanArray(value);
        } else if (value && typeof value === 'object' && value.constructor === Object) {
          newObject[property] = clone(value);
        } else {
          newObject[property] = value;
        }
      }
    }
    return newObject;
  }

  /**
   * This method automatically checks if the prop is function or getter and behaves accordingly.
   *
   * @param {Object} object - The object to look up the getter function in its prototype chain.
   * @param {String} prop - The property name for which to find the getter function.
   * @returns {Function} The getter function found in the prototype chain or a fallback function.
   */
  function lookupGetter(object, prop) {
    while (object !== null) {
      const desc = getOwnPropertyDescriptor(object, prop);
      if (desc) {
        if (desc.get) {
          return unapply(desc.get);
        }
        if (typeof desc.value === 'function') {
          return unapply(desc.value);
        }
      }
      object = getPrototypeOf(object);
    }
    function fallbackValue() {
      return null;
    }
    return fallbackValue;
  }

  const html$1 = freeze(['a', 'abbr', 'acronym', 'address', 'area', 'article', 'aside', 'audio', 'b', 'bdi', 'bdo', 'big', 'blink', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'center', 'cite', 'code', 'col', 'colgroup', 'content', 'data', 'datalist', 'dd', 'decorator', 'del', 'details', 'dfn', 'dialog', 'dir', 'div', 'dl', 'dt', 'element', 'em', 'fieldset', 'figcaption', 'figure', 'font', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'img', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'main', 'map', 'mark', 'marquee', 'menu', 'menuitem', 'meter', 'nav', 'nobr', 'ol', 'optgroup', 'option', 'output', 'p', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'section', 'select', 'shadow', 'small', 'source', 'spacer', 'span', 'strike', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'tr', 'track', 'tt', 'u', 'ul', 'var', 'video', 'wbr']);

  // SVG
  const svg$1 = freeze(['svg', 'a', 'altglyph', 'altglyphdef', 'altglyphitem', 'animatecolor', 'animatemotion', 'animatetransform', 'circle', 'clippath', 'defs', 'desc', 'ellipse', 'filter', 'font', 'g', 'glyph', 'glyphref', 'hkern', 'image', 'line', 'lineargradient', 'marker', 'mask', 'metadata', 'mpath', 'path', 'pattern', 'polygon', 'polyline', 'radialgradient', 'rect', 'stop', 'style', 'switch', 'symbol', 'text', 'textpath', 'title', 'tref', 'tspan', 'view', 'vkern']);
  const svgFilters = freeze(['feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feDropShadow', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence']);

  // List of SVG elements that are disallowed by default.
  // We still need to know them so that we can do namespace
  // checks properly in case one wants to add them to
  // allow-list.
  const svgDisallowed = freeze(['animate', 'color-profile', 'cursor', 'discard', 'font-face', 'font-face-format', 'font-face-name', 'font-face-src', 'font-face-uri', 'foreignobject', 'hatch', 'hatchpath', 'mesh', 'meshgradient', 'meshpatch', 'meshrow', 'missing-glyph', 'script', 'set', 'solidcolor', 'unknown', 'use']);
  const mathMl$1 = freeze(['math', 'menclose', 'merror', 'mfenced', 'mfrac', 'mglyph', 'mi', 'mlabeledtr', 'mmultiscripts', 'mn', 'mo', 'mover', 'mpadded', 'mphantom', 'mroot', 'mrow', 'ms', 'mspace', 'msqrt', 'mstyle', 'msub', 'msup', 'msubsup', 'mtable', 'mtd', 'mtext', 'mtr', 'munder', 'munderover', 'mprescripts']);

  // Similarly to SVG, we want to know all MathML elements,
  // even those that we disallow by default.
  const mathMlDisallowed = freeze(['maction', 'maligngroup', 'malignmark', 'mlongdiv', 'mscarries', 'mscarry', 'msgroup', 'mstack', 'msline', 'msrow', 'semantics', 'annotation', 'annotation-xml', 'mprescripts', 'none']);
  const text = freeze(['#text']);

  const html = freeze(['accept', 'action', 'align', 'alt', 'autocapitalize', 'autocomplete', 'autopictureinpicture', 'autoplay', 'background', 'bgcolor', 'border', 'capture', 'cellpadding', 'cellspacing', 'checked', 'cite', 'class', 'clear', 'color', 'cols', 'colspan', 'controls', 'controlslist', 'coords', 'crossorigin', 'datetime', 'decoding', 'default', 'dir', 'disabled', 'disablepictureinpicture', 'disableremoteplayback', 'download', 'draggable', 'enctype', 'enterkeyhint', 'face', 'for', 'headers', 'height', 'hidden', 'high', 'href', 'hreflang', 'id', 'inputmode', 'integrity', 'ismap', 'kind', 'label', 'lang', 'list', 'loading', 'loop', 'low', 'max', 'maxlength', 'media', 'method', 'min', 'minlength', 'multiple', 'muted', 'name', 'nonce', 'noshade', 'novalidate', 'nowrap', 'open', 'optimum', 'pattern', 'placeholder', 'playsinline', 'popover', 'popovertarget', 'popovertargetaction', 'poster', 'preload', 'pubdate', 'radiogroup', 'readonly', 'rel', 'required', 'rev', 'reversed', 'role', 'rows', 'rowspan', 'spellcheck', 'scope', 'selected', 'shape', 'size', 'sizes', 'span', 'srclang', 'start', 'src', 'srcset', 'step', 'style', 'summary', 'tabindex', 'title', 'translate', 'type', 'usemap', 'valign', 'value', 'width', 'wrap', 'xmlns', 'slot']);
  const svg = freeze(['accent-height', 'accumulate', 'additive', 'alignment-baseline', 'ascent', 'attributename', 'attributetype', 'azimuth', 'basefrequency', 'baseline-shift', 'begin', 'bias', 'by', 'class', 'clip', 'clippathunits', 'clip-path', 'clip-rule', 'color', 'color-interpolation', 'color-interpolation-filters', 'color-profile', 'color-rendering', 'cx', 'cy', 'd', 'dx', 'dy', 'diffuseconstant', 'direction', 'display', 'divisor', 'dur', 'edgemode', 'elevation', 'end', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'filterunits', 'flood-color', 'flood-opacity', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'fx', 'fy', 'g1', 'g2', 'glyph-name', 'glyphref', 'gradientunits', 'gradienttransform', 'height', 'href', 'id', 'image-rendering', 'in', 'in2', 'k', 'k1', 'k2', 'k3', 'k4', 'kerning', 'keypoints', 'keysplines', 'keytimes', 'lang', 'lengthadjust', 'letter-spacing', 'kernelmatrix', 'kernelunitlength', 'lighting-color', 'local', 'marker-end', 'marker-mid', 'marker-start', 'markerheight', 'markerunits', 'markerwidth', 'maskcontentunits', 'maskunits', 'max', 'mask', 'media', 'method', 'mode', 'min', 'name', 'numoctaves', 'offset', 'operator', 'opacity', 'order', 'orient', 'orientation', 'origin', 'overflow', 'paint-order', 'path', 'pathlength', 'patterncontentunits', 'patterntransform', 'patternunits', 'points', 'preservealpha', 'preserveaspectratio', 'primitiveunits', 'r', 'rx', 'ry', 'radius', 'refx', 'refy', 'repeatcount', 'repeatdur', 'restart', 'result', 'rotate', 'scale', 'seed', 'shape-rendering', 'specularconstant', 'specularexponent', 'spreadmethod', 'startoffset', 'stddeviation', 'stitchtiles', 'stop-color', 'stop-opacity', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke', 'stroke-width', 'style', 'surfacescale', 'systemlanguage', 'tabindex', 'targetx', 'targety', 'transform', 'transform-origin', 'text-anchor', 'text-decoration', 'text-rendering', 'textlength', 'type', 'u1', 'u2', 'unicode', 'values', 'viewbox', 'visibility', 'version', 'vert-adv-y', 'vert-origin-x', 'vert-origin-y', 'width', 'word-spacing', 'wrap', 'writing-mode', 'xchannelselector', 'ychannelselector', 'x', 'x1', 'x2', 'xmlns', 'y', 'y1', 'y2', 'z', 'zoomandpan']);
  const mathMl = freeze(['accent', 'accentunder', 'align', 'bevelled', 'close', 'columnsalign', 'columnlines', 'columnspan', 'denomalign', 'depth', 'dir', 'display', 'displaystyle', 'encoding', 'fence', 'frame', 'height', 'href', 'id', 'largeop', 'length', 'linethickness', 'lspace', 'lquote', 'mathbackground', 'mathcolor', 'mathsize', 'mathvariant', 'maxsize', 'minsize', 'movablelimits', 'notation', 'numalign', 'open', 'rowalign', 'rowlines', 'rowspacing', 'rowspan', 'rspace', 'rquote', 'scriptlevel', 'scriptminsize', 'scriptsizemultiplier', 'selection', 'separator', 'separators', 'stretchy', 'subscriptshift', 'supscriptshift', 'symmetric', 'voffset', 'width', 'xmlns']);
  const xml = freeze(['xlink:href', 'xml:id', 'xlink:title', 'xml:space', 'xmlns:xlink']);

  // eslint-disable-next-line unicorn/better-regex
  const MUSTACHE_EXPR = seal(/\{\{[\w\W]*|[\w\W]*\}\}/gm); // Specify template detection regex for SAFE_FOR_TEMPLATES mode
  const ERB_EXPR = seal(/<%[\w\W]*|[\w\W]*%>/gm);
  const TMPLIT_EXPR = seal(/\${[\w\W]*}/gm);
  const DATA_ATTR = seal(/^data-[\-\w.\u00B7-\uFFFF]/); // eslint-disable-line no-useless-escape
  const ARIA_ATTR = seal(/^aria-[\-\w]+$/); // eslint-disable-line no-useless-escape
  const IS_ALLOWED_URI = seal(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i // eslint-disable-line no-useless-escape
  );
  const IS_SCRIPT_OR_DATA = seal(/^(?:\w+script|data):/i);
  const ATTR_WHITESPACE = seal(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g // eslint-disable-line no-control-regex
  );
  const DOCTYPE_NAME = seal(/^html$/i);
  const CUSTOM_ELEMENT = seal(/^[a-z][.\w]*(-[.\w]+)+$/i);

  var EXPRESSIONS = /*#__PURE__*/Object.freeze({
    __proto__: null,
    MUSTACHE_EXPR: MUSTACHE_EXPR,
    ERB_EXPR: ERB_EXPR,
    TMPLIT_EXPR: TMPLIT_EXPR,
    DATA_ATTR: DATA_ATTR,
    ARIA_ATTR: ARIA_ATTR,
    IS_ALLOWED_URI: IS_ALLOWED_URI,
    IS_SCRIPT_OR_DATA: IS_SCRIPT_OR_DATA,
    ATTR_WHITESPACE: ATTR_WHITESPACE,
    DOCTYPE_NAME: DOCTYPE_NAME,
    CUSTOM_ELEMENT: CUSTOM_ELEMENT
  });

  // https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
  const NODE_TYPE = {
    element: 1,
    attribute: 2,
    text: 3,
    cdataSection: 4,
    entityReference: 5,
    // Deprecated
    entityNode: 6,
    // Deprecated
    progressingInstruction: 7,
    comment: 8,
    document: 9,
    documentType: 10,
    documentFragment: 11,
    notation: 12 // Deprecated
  };
  const getGlobal = function getGlobal() {
    return typeof window === 'undefined' ? null : window;
  };

  /**
   * Creates a no-op policy for internal use only.
   * Don't export this function outside this module!
   * @param {TrustedTypePolicyFactory} trustedTypes The policy factory.
   * @param {HTMLScriptElement} purifyHostElement The Script element used to load DOMPurify (to determine policy name suffix).
   * @return {TrustedTypePolicy} The policy created (or null, if Trusted Types
   * are not supported or creating the policy failed).
   */
  const _createTrustedTypesPolicy = function _createTrustedTypesPolicy(trustedTypes, purifyHostElement) {
    if (typeof trustedTypes !== 'object' || typeof trustedTypes.createPolicy !== 'function') {
      return null;
    }

    // Allow the callers to control the unique policy name
    // by adding a data-tt-policy-suffix to the script element with the DOMPurify.
    // Policy creation with duplicate names throws in Trusted Types.
    let suffix = null;
    const ATTR_NAME = 'data-tt-policy-suffix';
    if (purifyHostElement && purifyHostElement.hasAttribute(ATTR_NAME)) {
      suffix = purifyHostElement.getAttribute(ATTR_NAME);
    }
    const policyName = 'dompurify' + (suffix ? '#' + suffix : '');
    try {
      return trustedTypes.createPolicy(policyName, {
        createHTML(html) {
          return html;
        },
        createScriptURL(scriptUrl) {
          return scriptUrl;
        }
      });
    } catch (_) {
      // Policy creation failed (most likely another DOMPurify script has
      // already run). Skip creating the policy, as this will only cause errors
      // if TT are enforced.
      console.warn('TrustedTypes policy ' + policyName + ' could not be created.');
      return null;
    }
  };
  function createDOMPurify() {
    let window = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : getGlobal();
    const DOMPurify = root => createDOMPurify(root);

    /**
     * Version label, exposed for easier checks
     * if DOMPurify is up to date or not
     */
    DOMPurify.version = '3.1.6';

    /**
     * Array of elements that DOMPurify removed during sanitation.
     * Empty if nothing was removed.
     */
    DOMPurify.removed = [];
    if (!window || !window.document || window.document.nodeType !== NODE_TYPE.document) {
      // Not running in a browser, provide a factory function
      // so that you can pass your own Window
      DOMPurify.isSupported = false;
      return DOMPurify;
    }
    let {
      document
    } = window;
    const originalDocument = document;
    const currentScript = originalDocument.currentScript;
    const {
      DocumentFragment,
      HTMLTemplateElement,
      Node,
      Element,
      NodeFilter,
      NamedNodeMap = window.NamedNodeMap || window.MozNamedAttrMap,
      HTMLFormElement,
      DOMParser,
      trustedTypes
    } = window;
    const ElementPrototype = Element.prototype;
    const cloneNode = lookupGetter(ElementPrototype, 'cloneNode');
    const remove = lookupGetter(ElementPrototype, 'remove');
    const getNextSibling = lookupGetter(ElementPrototype, 'nextSibling');
    const getChildNodes = lookupGetter(ElementPrototype, 'childNodes');
    const getParentNode = lookupGetter(ElementPrototype, 'parentNode');

    // As per issue #47, the web-components registry is inherited by a
    // new document created via createHTMLDocument. As per the spec
    // (http://w3c.github.io/webcomponents/spec/custom/#creating-and-passing-registries)
    // a new empty registry is used when creating a template contents owner
    // document, so we use that as our parent document to ensure nothing
    // is inherited.
    if (typeof HTMLTemplateElement === 'function') {
      const template = document.createElement('template');
      if (template.content && template.content.ownerDocument) {
        document = template.content.ownerDocument;
      }
    }
    let trustedTypesPolicy;
    let emptyHTML = '';
    const {
      implementation,
      createNodeIterator,
      createDocumentFragment,
      getElementsByTagName
    } = document;
    const {
      importNode
    } = originalDocument;
    let hooks = {};

    /**
     * Expose whether this browser supports running the full DOMPurify.
     */
    DOMPurify.isSupported = typeof entries === 'function' && typeof getParentNode === 'function' && implementation && implementation.createHTMLDocument !== undefined;
    const {
      MUSTACHE_EXPR,
      ERB_EXPR,
      TMPLIT_EXPR,
      DATA_ATTR,
      ARIA_ATTR,
      IS_SCRIPT_OR_DATA,
      ATTR_WHITESPACE,
      CUSTOM_ELEMENT
    } = EXPRESSIONS;
    let {
      IS_ALLOWED_URI: IS_ALLOWED_URI$1
    } = EXPRESSIONS;

    /**
     * We consider the elements and attributes below to be safe. Ideally
     * don't add any new ones but feel free to remove unwanted ones.
     */

    /* allowed element names */
    let ALLOWED_TAGS = null;
    const DEFAULT_ALLOWED_TAGS = addToSet({}, [...html$1, ...svg$1, ...svgFilters, ...mathMl$1, ...text]);

    /* Allowed attribute names */
    let ALLOWED_ATTR = null;
    const DEFAULT_ALLOWED_ATTR = addToSet({}, [...html, ...svg, ...mathMl, ...xml]);

    /*
     * Configure how DOMPUrify should handle custom elements and their attributes as well as customized built-in elements.
     * @property {RegExp|Function|null} tagNameCheck one of [null, regexPattern, predicate]. Default: `null` (disallow any custom elements)
     * @property {RegExp|Function|null} attributeNameCheck one of [null, regexPattern, predicate]. Default: `null` (disallow any attributes not on the allow list)
     * @property {boolean} allowCustomizedBuiltInElements allow custom elements derived from built-ins if they pass CUSTOM_ELEMENT_HANDLING.tagNameCheck. Default: `false`.
     */
    let CUSTOM_ELEMENT_HANDLING = Object.seal(create(null, {
      tagNameCheck: {
        writable: true,
        configurable: false,
        enumerable: true,
        value: null
      },
      attributeNameCheck: {
        writable: true,
        configurable: false,
        enumerable: true,
        value: null
      },
      allowCustomizedBuiltInElements: {
        writable: true,
        configurable: false,
        enumerable: true,
        value: false
      }
    }));

    /* Explicitly forbidden tags (overrides ALLOWED_TAGS/ADD_TAGS) */
    let FORBID_TAGS = null;

    /* Explicitly forbidden attributes (overrides ALLOWED_ATTR/ADD_ATTR) */
    let FORBID_ATTR = null;

    /* Decide if ARIA attributes are okay */
    let ALLOW_ARIA_ATTR = true;

    /* Decide if custom data attributes are okay */
    let ALLOW_DATA_ATTR = true;

    /* Decide if unknown protocols are okay */
    let ALLOW_UNKNOWN_PROTOCOLS = false;

    /* Decide if self-closing tags in attributes are allowed.
     * Usually removed due to a mXSS issue in jQuery 3.0 */
    let ALLOW_SELF_CLOSE_IN_ATTR = true;

    /* Output should be safe for common template engines.
     * This means, DOMPurify removes data attributes, mustaches and ERB
     */
    let SAFE_FOR_TEMPLATES = false;

    /* Output should be safe even for XML used within HTML and alike.
     * This means, DOMPurify removes comments when containing risky content.
     */
    let SAFE_FOR_XML = true;

    /* Decide if document with <html>... should be returned */
    let WHOLE_DOCUMENT = false;

    /* Track whether config is already set on this instance of DOMPurify. */
    let SET_CONFIG = false;

    /* Decide if all elements (e.g. style, script) must be children of
     * document.body. By default, browsers might move them to document.head */
    let FORCE_BODY = false;

    /* Decide if a DOM `HTMLBodyElement` should be returned, instead of a html
     * string (or a TrustedHTML object if Trusted Types are supported).
     * If `WHOLE_DOCUMENT` is enabled a `HTMLHtmlElement` will be returned instead
     */
    let RETURN_DOM = false;

    /* Decide if a DOM `DocumentFragment` should be returned, instead of a html
     * string  (or a TrustedHTML object if Trusted Types are supported) */
    let RETURN_DOM_FRAGMENT = false;

    /* Try to return a Trusted Type object instead of a string, return a string in
     * case Trusted Types are not supported  */
    let RETURN_TRUSTED_TYPE = false;

    /* Output should be free from DOM clobbering attacks?
     * This sanitizes markups named with colliding, clobberable built-in DOM APIs.
     */
    let SANITIZE_DOM = true;

    /* Achieve full DOM Clobbering protection by isolating the namespace of named
     * properties and JS variables, mitigating attacks that abuse the HTML/DOM spec rules.
     *
     * HTML/DOM spec rules that enable DOM Clobbering:
     *   - Named Access on Window (Â§7.3.3)
     *   - DOM Tree Accessors (Â§3.1.5)
     *   - Form Element Parent-Child Relations (Â§4.10.3)
     *   - Iframe srcdoc / Nested WindowProxies (Â§4.8.5)
     *   - HTMLCollection (Â§4.2.10.2)
     *
     * Namespace isolation is implemented by prefixing `id` and `name` attributes
     * with a constant string, i.e., `user-content-`
     */
    let SANITIZE_NAMED_PROPS = false;
    const SANITIZE_NAMED_PROPS_PREFIX = 'user-content-';

    /* Keep element content when removing element? */
    let KEEP_CONTENT = true;

    /* If a `Node` is passed to sanitize(), then performs sanitization in-place instead
     * of importing it into a new Document and returning a sanitized copy */
    let IN_PLACE = false;

    /* Allow usage of profiles like html, svg and mathMl */
    let USE_PROFILES = {};

    /* Tags to ignore content of when KEEP_CONTENT is true */
    let FORBID_CONTENTS = null;
    const DEFAULT_FORBID_CONTENTS = addToSet({}, ['annotation-xml', 'audio', 'colgroup', 'desc', 'foreignobject', 'head', 'iframe', 'math', 'mi', 'mn', 'mo', 'ms', 'mtext', 'noembed', 'noframes', 'noscript', 'plaintext', 'script', 'style', 'svg', 'template', 'thead', 'title', 'video', 'xmp']);

    /* Tags that are safe for data: URIs */
    let DATA_URI_TAGS = null;
    const DEFAULT_DATA_URI_TAGS = addToSet({}, ['audio', 'video', 'img', 'source', 'image', 'track']);

    /* Attributes safe for values like "javascript:" */
    let URI_SAFE_ATTRIBUTES = null;
    const DEFAULT_URI_SAFE_ATTRIBUTES = addToSet({}, ['alt', 'class', 'for', 'id', 'label', 'name', 'pattern', 'placeholder', 'role', 'summary', 'title', 'value', 'style', 'xmlns']);
    const MATHML_NAMESPACE = 'http://www.w3.org/1998/Math/MathML';
    const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
    const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
    /* Document namespace */
    let NAMESPACE = HTML_NAMESPACE;
    let IS_EMPTY_INPUT = false;

    /* Allowed XHTML+XML namespaces */
    let ALLOWED_NAMESPACES = null;
    const DEFAULT_ALLOWED_NAMESPACES = addToSet({}, [MATHML_NAMESPACE, SVG_NAMESPACE, HTML_NAMESPACE], stringToString);

    /* Parsing of strict XHTML documents */
    let PARSER_MEDIA_TYPE = null;
    const SUPPORTED_PARSER_MEDIA_TYPES = ['application/xhtml+xml', 'text/html'];
    const DEFAULT_PARSER_MEDIA_TYPE = 'text/html';
    let transformCaseFunc = null;

    /* Keep a reference to config to pass to hooks */
    let CONFIG = null;

    /* Ideally, do not touch anything below this line */
    /* ______________________________________________ */

    const formElement = document.createElement('form');
    const isRegexOrFunction = function isRegexOrFunction(testValue) {
      return testValue instanceof RegExp || testValue instanceof Function;
    };

    /**
     * _parseConfig
     *
     * @param  {Object} cfg optional config literal
     */
    // eslint-disable-next-line complexity
    const _parseConfig = function _parseConfig() {
      let cfg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      if (CONFIG && CONFIG === cfg) {
        return;
      }

      /* Shield configuration object from tampering */
      if (!cfg || typeof cfg !== 'object') {
        cfg = {};
      }

      /* Shield configuration object from prototype pollution */
      cfg = clone(cfg);
      PARSER_MEDIA_TYPE =
      // eslint-disable-next-line unicorn/prefer-includes
      SUPPORTED_PARSER_MEDIA_TYPES.indexOf(cfg.PARSER_MEDIA_TYPE) === -1 ? DEFAULT_PARSER_MEDIA_TYPE : cfg.PARSER_MEDIA_TYPE;

      // HTML tags and attributes are not case-sensitive, converting to lowercase. Keeping XHTML as is.
      transformCaseFunc = PARSER_MEDIA_TYPE === 'application/xhtml+xml' ? stringToString : stringToLowerCase;

      /* Set configuration parameters */
      ALLOWED_TAGS = objectHasOwnProperty(cfg, 'ALLOWED_TAGS') ? addToSet({}, cfg.ALLOWED_TAGS, transformCaseFunc) : DEFAULT_ALLOWED_TAGS;
      ALLOWED_ATTR = objectHasOwnProperty(cfg, 'ALLOWED_ATTR') ? addToSet({}, cfg.ALLOWED_ATTR, transformCaseFunc) : DEFAULT_ALLOWED_ATTR;
      ALLOWED_NAMESPACES = objectHasOwnProperty(cfg, 'ALLOWED_NAMESPACES') ? addToSet({}, cfg.ALLOWED_NAMESPACES, stringToString) : DEFAULT_ALLOWED_NAMESPACES;
      URI_SAFE_ATTRIBUTES = objectHasOwnProperty(cfg, 'ADD_URI_SAFE_ATTR') ? addToSet(clone(DEFAULT_URI_SAFE_ATTRIBUTES),
      // eslint-disable-line indent
      cfg.ADD_URI_SAFE_ATTR,
      // eslint-disable-line indent
      transformCaseFunc // eslint-disable-line indent
      ) // eslint-disable-line indent
      : DEFAULT_URI_SAFE_ATTRIBUTES;
      DATA_URI_TAGS = objectHasOwnProperty(cfg, 'ADD_DATA_URI_TAGS') ? addToSet(clone(DEFAULT_DATA_URI_TAGS),
      // eslint-disable-line indent
      cfg.ADD_DATA_URI_TAGS,
      // eslint-disable-line indent
      transformCaseFunc // eslint-disable-line indent
      ) // eslint-disable-line indent
      : DEFAULT_DATA_URI_TAGS;
      FORBID_CONTENTS = objectHasOwnProperty(cfg, 'FORBID_CONTENTS') ? addToSet({}, cfg.FORBID_CONTENTS, transformCaseFunc) : DEFAULT_FORBID_CONTENTS;
      FORBID_TAGS = objectHasOwnProperty(cfg, 'FORBID_TAGS') ? addToSet({}, cfg.FORBID_TAGS, transformCaseFunc) : {};
      FORBID_ATTR = objectHasOwnProperty(cfg, 'FORBID_ATTR') ? addToSet({}, cfg.FORBID_ATTR, transformCaseFunc) : {};
      USE_PROFILES = objectHasOwnProperty(cfg, 'USE_PROFILES') ? cfg.USE_PROFILES : false;
      ALLOW_ARIA_ATTR = cfg.ALLOW_ARIA_ATTR !== false; // Default true
      ALLOW_DATA_ATTR = cfg.ALLOW_DATA_ATTR !== false; // Default true
      ALLOW_UNKNOWN_PROTOCOLS = cfg.ALLOW_UNKNOWN_PROTOCOLS || false; // Default false
      ALLOW_SELF_CLOSE_IN_ATTR = cfg.ALLOW_SELF_CLOSE_IN_ATTR !== false; // Default true
      SAFE_FOR_TEMPLATES = cfg.SAFE_FOR_TEMPLATES || false; // Default false
      SAFE_FOR_XML = cfg.SAFE_FOR_XML !== false; // Default true
      WHOLE_DOCUMENT = cfg.WHOLE_DOCUMENT || false; // Default false
      RETURN_DOM = cfg.RETURN_DOM || false; // Default false
      RETURN_DOM_FRAGMENT = cfg.RETURN_DOM_FRAGMENT || false; // Default false
      RETURN_TRUSTED_TYPE = cfg.RETURN_TRUSTED_TYPE || false; // Default false
      FORCE_BODY = cfg.FORCE_BODY || false; // Default false
      SANITIZE_DOM = cfg.SANITIZE_DOM !== false; // Default true
      SANITIZE_NAMED_PROPS = cfg.SANITIZE_NAMED_PROPS || false; // Default false
      KEEP_CONTENT = cfg.KEEP_CONTENT !== false; // Default true
      IN_PLACE = cfg.IN_PLACE || false; // Default false
      IS_ALLOWED_URI$1 = cfg.ALLOWED_URI_REGEXP || IS_ALLOWED_URI;
      NAMESPACE = cfg.NAMESPACE || HTML_NAMESPACE;
      CUSTOM_ELEMENT_HANDLING = cfg.CUSTOM_ELEMENT_HANDLING || {};
      if (cfg.CUSTOM_ELEMENT_HANDLING && isRegexOrFunction(cfg.CUSTOM_ELEMENT_HANDLING.tagNameCheck)) {
        CUSTOM_ELEMENT_HANDLING.tagNameCheck = cfg.CUSTOM_ELEMENT_HANDLING.tagNameCheck;
      }
      if (cfg.CUSTOM_ELEMENT_HANDLING && isRegexOrFunction(cfg.CUSTOM_ELEMENT_HANDLING.attributeNameCheck)) {
        CUSTOM_ELEMENT_HANDLING.attributeNameCheck = cfg.CUSTOM_ELEMENT_HANDLING.attributeNameCheck;
      }
      if (cfg.CUSTOM_ELEMENT_HANDLING && typeof cfg.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements === 'boolean') {
        CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements = cfg.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements;
      }
      if (SAFE_FOR_TEMPLATES) {
        ALLOW_DATA_ATTR = false;
      }
      if (RETURN_DOM_FRAGMENT) {
        RETURN_DOM = true;
      }

      /* Parse profile info */
      if (USE_PROFILES) {
        ALLOWED_TAGS = addToSet({}, text);
        ALLOWED_ATTR = [];
        if (USE_PROFILES.html === true) {
          addToSet(ALLOWED_TAGS, html$1);
          addToSet(ALLOWED_ATTR, html);
        }
        if (USE_PROFILES.svg === true) {
          addToSet(ALLOWED_TAGS, svg$1);
          addToSet(ALLOWED_ATTR, svg);
          addToSet(ALLOWED_ATTR, xml);
        }
        if (USE_PROFILES.svgFilters === true) {
          addToSet(ALLOWED_TAGS, svgFilters);
          addToSet(ALLOWED_ATTR, svg);
          addToSet(ALLOWED_ATTR, xml);
        }
        if (USE_PROFILES.mathMl === true) {
          addToSet(ALLOWED_TAGS, mathMl$1);
          addToSet(ALLOWED_ATTR, mathMl);
          addToSet(ALLOWED_ATTR, xml);
        }
      }

      /* Merge configuration parameters */
      if (cfg.ADD_TAGS) {
        if (ALLOWED_TAGS === DEFAULT_ALLOWED_TAGS) {
          ALLOWED_TAGS = clone(ALLOWED_TAGS);
        }
        addToSet(ALLOWED_TAGS, cfg.ADD_TAGS, transformCaseFunc);
      }
      if (cfg.ADD_ATTR) {
        if (ALLOWED_ATTR === DEFAULT_ALLOWED_ATTR) {
          ALLOWED_ATTR = clone(ALLOWED_ATTR);
        }
        addToSet(ALLOWED_ATTR, cfg.ADD_ATTR, transformCaseFunc);
      }
      if (cfg.ADD_URI_SAFE_ATTR) {
        addToSet(URI_SAFE_ATTRIBUTES, cfg.ADD_URI_SAFE_ATTR, transformCaseFunc);
      }
      if (cfg.FORBID_CONTENTS) {
        if (FORBID_CONTENTS === DEFAULT_FORBID_CONTENTS) {
          FORBID_CONTENTS = clone(FORBID_CONTENTS);
        }
        addToSet(FORBID_CONTENTS, cfg.FORBID_CONTENTS, transformCaseFunc);
      }

      /* Add #text in case KEEP_CONTENT is set to true */
      if (KEEP_CONTENT) {
        ALLOWED_TAGS['#text'] = true;
      }

      /* Add html, head and body to ALLOWED_TAGS in case WHOLE_DOCUMENT is true */
      if (WHOLE_DOCUMENT) {
        addToSet(ALLOWED_TAGS, ['html', 'head', 'body']);
      }

      /* Add tbody to ALLOWED_TAGS in case tables are permitted, see #286, #365 */
      if (ALLOWED_TAGS.table) {
        addToSet(ALLOWED_TAGS, ['tbody']);
        delete FORBID_TAGS.tbody;
      }
      if (cfg.TRUSTED_TYPES_POLICY) {
        if (typeof cfg.TRUSTED_TYPES_POLICY.createHTML !== 'function') {
          throw typeErrorCreate('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
        }
        if (typeof cfg.TRUSTED_TYPES_POLICY.createScriptURL !== 'function') {
          throw typeErrorCreate('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
        }

        // Overwrite existing TrustedTypes policy.
        trustedTypesPolicy = cfg.TRUSTED_TYPES_POLICY;

        // Sign local variables required by `sanitize`.
        emptyHTML = trustedTypesPolicy.createHTML('');
      } else {
        // Uninitialized policy, attempt to initialize the internal dompurify policy.
        if (trustedTypesPolicy === undefined) {
          trustedTypesPolicy = _createTrustedTypesPolicy(trustedTypes, currentScript);
        }

        // If creating the internal policy succeeded sign internal variables.
        if (trustedTypesPolicy !== null && typeof emptyHTML === 'string') {
          emptyHTML = trustedTypesPolicy.createHTML('');
        }
      }

      // Prevent further manipulation of configuration.
      // Not available in IE8, Safari 5, etc.
      if (freeze) {
        freeze(cfg);
      }
      CONFIG = cfg;
    };
    const MATHML_TEXT_INTEGRATION_POINTS = addToSet({}, ['mi', 'mo', 'mn', 'ms', 'mtext']);
    const HTML_INTEGRATION_POINTS = addToSet({}, ['foreignobject', 'annotation-xml']);

    // Certain elements are allowed in both SVG and HTML
    // namespace. We need to specify them explicitly
    // so that they don't get erroneously deleted from
    // HTML namespace.
    const COMMON_SVG_AND_HTML_ELEMENTS = addToSet({}, ['title', 'style', 'font', 'a', 'script']);

    /* Keep track of all possible SVG and MathML tags
     * so that we can perform the namespace checks
     * correctly. */
    const ALL_SVG_TAGS = addToSet({}, [...svg$1, ...svgFilters, ...svgDisallowed]);
    const ALL_MATHML_TAGS = addToSet({}, [...mathMl$1, ...mathMlDisallowed]);

    /**
     * @param  {Element} element a DOM element whose namespace is being checked
     * @returns {boolean} Return false if the element has a
     *  namespace that a spec-compliant parser would never
     *  return. Return true otherwise.
     */
    const _checkValidNamespace = function _checkValidNamespace(element) {
      let parent = getParentNode(element);

      // In JSDOM, if we're inside shadow DOM, then parentNode
      // can be null. We just simulate parent in this case.
      if (!parent || !parent.tagName) {
        parent = {
          namespaceURI: NAMESPACE,
          tagName: 'template'
        };
      }
      const tagName = stringToLowerCase(element.tagName);
      const parentTagName = stringToLowerCase(parent.tagName);
      if (!ALLOWED_NAMESPACES[element.namespaceURI]) {
        return false;
      }
      if (element.namespaceURI === SVG_NAMESPACE) {
        // The only way to switch from HTML namespace to SVG
        // is via <svg>. If it happens via any other tag, then
        // it should be killed.
        if (parent.namespaceURI === HTML_NAMESPACE) {
          return tagName === 'svg';
        }

        // The only way to switch from MathML to SVG is via`
        // svg if parent is either <annotation-xml> or MathML
        // text integration points.
        if (parent.namespaceURI === MATHML_NAMESPACE) {
          return tagName === 'svg' && (parentTagName === 'annotation-xml' || MATHML_TEXT_INTEGRATION_POINTS[parentTagName]);
        }

        // We only allow elements that are defined in SVG
        // spec. All others are disallowed in SVG namespace.
        return Boolean(ALL_SVG_TAGS[tagName]);
      }
      if (element.namespaceURI === MATHML_NAMESPACE) {
        // The only way to switch from HTML namespace to MathML
        // is via <math>. If it happens via any other tag, then
        // it should be killed.
        if (parent.namespaceURI === HTML_NAMESPACE) {
          return tagName === 'math';
        }

        // The only way to switch from SVG to MathML is via
        // <math> and HTML integration points
        if (parent.namespaceURI === SVG_NAMESPACE) {
          return tagName === 'math' && HTML_INTEGRATION_POINTS[parentTagName];
        }

        // We only allow elements that are defined in MathML
        // spec. All others are disallowed in MathML namespace.
        return Boolean(ALL_MATHML_TAGS[tagName]);
      }
      if (element.namespaceURI === HTML_NAMESPACE) {
        // The only way to switch from SVG to HTML is via
        // HTML integration points, and from MathML to HTML
        // is via MathML text integration points
        if (parent.namespaceURI === SVG_NAMESPACE && !HTML_INTEGRATION_POINTS[parentTagName]) {
          return false;
        }
        if (parent.namespaceURI === MATHML_NAMESPACE && !MATHML_TEXT_INTEGRATION_POINTS[parentTagName]) {
          return false;
        }

        // We disallow tags that are specific for MathML
        // or SVG and should never appear in HTML namespace
        return !ALL_MATHML_TAGS[tagName] && (COMMON_SVG_AND_HTML_ELEMENTS[tagName] || !ALL_SVG_TAGS[tagName]);
      }

      // For XHTML and XML documents that support custom namespaces
      if (PARSER_MEDIA_TYPE === 'application/xhtml+xml' && ALLOWED_NAMESPACES[element.namespaceURI]) {
        return true;
      }

      // The code should never reach this place (this means
      // that the element somehow got namespace that is not
      // HTML, SVG, MathML or allowed via ALLOWED_NAMESPACES).
      // Return false just in case.
      return false;
    };

    /**
     * _forceRemove
     *
     * @param  {Node} node a DOM node
     */
    const _forceRemove = function _forceRemove(node) {
      arrayPush(DOMPurify.removed, {
        element: node
      });
      try {
        // eslint-disable-next-line unicorn/prefer-dom-node-remove
        getParentNode(node).removeChild(node);
      } catch (_) {
        remove(node);
      }
    };

    /**
     * _removeAttribute
     *
     * @param  {String} name an Attribute name
     * @param  {Node} node a DOM node
     */
    const _removeAttribute = function _removeAttribute(name, node) {
      try {
        arrayPush(DOMPurify.removed, {
          attribute: node.getAttributeNode(name),
          from: node
        });
      } catch (_) {
        arrayPush(DOMPurify.removed, {
          attribute: null,
          from: node
        });
      }
      node.removeAttribute(name);

      // We void attribute values for unremovable "is"" attributes
      if (name === 'is' && !ALLOWED_ATTR[name]) {
        if (RETURN_DOM || RETURN_DOM_FRAGMENT) {
          try {
            _forceRemove(node);
          } catch (_) {}
        } else {
          try {
            node.setAttribute(name, '');
          } catch (_) {}
        }
      }
    };

    /**
     * _initDocument
     *
     * @param  {String} dirty a string of dirty markup
     * @return {Document} a DOM, filled with the dirty markup
     */
    const _initDocument = function _initDocument(dirty) {
      /* Create a HTML document */
      let doc = null;
      let leadingWhitespace = null;
      if (FORCE_BODY) {
        dirty = '<remove></remove>' + dirty;
      } else {
        /* If FORCE_BODY isn't used, leading whitespace needs to be preserved manually */
        const matches = stringMatch(dirty, /^[\r\n\t ]+/);
        leadingWhitespace = matches && matches[0];
      }
      if (PARSER_MEDIA_TYPE === 'application/xhtml+xml' && NAMESPACE === HTML_NAMESPACE) {
        // Root of XHTML doc must contain xmlns declaration (see https://www.w3.org/TR/xhtml1/normative.html#strict)
        dirty = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + dirty + '</body></html>';
      }
      const dirtyPayload = trustedTypesPolicy ? trustedTypesPolicy.createHTML(dirty) : dirty;
      /*
       * Use the DOMParser API by default, fallback later if needs be
       * DOMParser not work for svg when has multiple root element.
       */
      if (NAMESPACE === HTML_NAMESPACE) {
        try {
          doc = new DOMParser().parseFromString(dirtyPayload, PARSER_MEDIA_TYPE);
        } catch (_) {}
      }

      /* Use createHTMLDocument in case DOMParser is not available */
      if (!doc || !doc.documentElement) {
        doc = implementation.createDocument(NAMESPACE, 'template', null);
        try {
          doc.documentElement.innerHTML = IS_EMPTY_INPUT ? emptyHTML : dirtyPayload;
        } catch (_) {
          // Syntax error if dirtyPayload is invalid xml
        }
      }
      const body = doc.body || doc.documentElement;
      if (dirty && leadingWhitespace) {
        body.insertBefore(document.createTextNode(leadingWhitespace), body.childNodes[0] || null);
      }

      /* Work on whole document or just its body */
      if (NAMESPACE === HTML_NAMESPACE) {
        return getElementsByTagName.call(doc, WHOLE_DOCUMENT ? 'html' : 'body')[0];
      }
      return WHOLE_DOCUMENT ? doc.documentElement : body;
    };

    /**
     * Creates a NodeIterator object that you can use to traverse filtered lists of nodes or elements in a document.
     *
     * @param  {Node} root The root element or node to start traversing on.
     * @return {NodeIterator} The created NodeIterator
     */
    const _createNodeIterator = function _createNodeIterator(root) {
      return createNodeIterator.call(root.ownerDocument || root, root,
      // eslint-disable-next-line no-bitwise
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT | NodeFilter.SHOW_PROCESSING_INSTRUCTION | NodeFilter.SHOW_CDATA_SECTION, null);
    };

    /**
     * _isClobbered
     *
     * @param  {Node} elm element to check for clobbering attacks
     * @return {Boolean} true if clobbered, false if safe
     */
    const _isClobbered = function _isClobbered(elm) {
      return elm instanceof HTMLFormElement && (typeof elm.nodeName !== 'string' || typeof elm.textContent !== 'string' || typeof elm.removeChild !== 'function' || !(elm.attributes instanceof NamedNodeMap) || typeof elm.removeAttribute !== 'function' || typeof elm.setAttribute !== 'function' || typeof elm.namespaceURI !== 'string' || typeof elm.insertBefore !== 'function' || typeof elm.hasChildNodes !== 'function');
    };

    /**
     * Checks whether the given object is a DOM node.
     *
     * @param  {Node} object object to check whether it's a DOM node
     * @return {Boolean} true is object is a DOM node
     */
    const _isNode = function _isNode(object) {
      return typeof Node === 'function' && object instanceof Node;
    };

    /**
     * _executeHook
     * Execute user configurable hooks
     *
     * @param  {String} entryPoint  Name of the hook's entry point
     * @param  {Node} currentNode node to work on with the hook
     * @param  {Object} data additional hook parameters
     */
    const _executeHook = function _executeHook(entryPoint, currentNode, data) {
      if (!hooks[entryPoint]) {
        return;
      }
      arrayForEach(hooks[entryPoint], hook => {
        hook.call(DOMPurify, currentNode, data, CONFIG);
      });
    };

    /**
     * _sanitizeElements
     *
     * @protect nodeName
     * @protect textContent
     * @protect removeChild
     *
     * @param   {Node} currentNode to check for permission to exist
     * @return  {Boolean} true if node was killed, false if left alive
     */
    const _sanitizeElements = function _sanitizeElements(currentNode) {
      let content = null;

      /* Execute a hook if present */
      _executeHook('beforeSanitizeElements', currentNode, null);

      /* Check if element is clobbered or can clobber */
      if (_isClobbered(currentNode)) {
        _forceRemove(currentNode);
        return true;
      }

      /* Now let's check the element's type and name */
      const tagName = transformCaseFunc(currentNode.nodeName);

      /* Execute a hook if present */
      _executeHook('uponSanitizeElement', currentNode, {
        tagName,
        allowedTags: ALLOWED_TAGS
      });

      /* Detect mXSS attempts abusing namespace confusion */
      if (currentNode.hasChildNodes() && !_isNode(currentNode.firstElementChild) && regExpTest(/<[/\w]/g, currentNode.innerHTML) && regExpTest(/<[/\w]/g, currentNode.textContent)) {
        _forceRemove(currentNode);
        return true;
      }

      /* Remove any occurrence of processing instructions */
      if (currentNode.nodeType === NODE_TYPE.progressingInstruction) {
        _forceRemove(currentNode);
        return true;
      }

      /* Remove any kind of possibly harmful comments */
      if (SAFE_FOR_XML && currentNode.nodeType === NODE_TYPE.comment && regExpTest(/<[/\w]/g, currentNode.data)) {
        _forceRemove(currentNode);
        return true;
      }

      /* Remove element if anything forbids its presence */
      if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
        /* Check if we have a custom element to handle */
        if (!FORBID_TAGS[tagName] && _isBasicCustomElement(tagName)) {
          if (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, tagName)) {
            return false;
          }
          if (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(tagName)) {
            return false;
          }
        }

        /* Keep content except for bad-listed elements */
        if (KEEP_CONTENT && !FORBID_CONTENTS[tagName]) {
          const parentNode = getParentNode(currentNode) || currentNode.parentNode;
          const childNodes = getChildNodes(currentNode) || currentNode.childNodes;
          if (childNodes && parentNode) {
            const childCount = childNodes.length;
            for (let i = childCount - 1; i >= 0; --i) {
              const childClone = cloneNode(childNodes[i], true);
              childClone.__removalCount = (currentNode.__removalCount || 0) + 1;
              parentNode.insertBefore(childClone, getNextSibling(currentNode));
            }
          }
        }
        _forceRemove(currentNode);
        return true;
      }

      /* Check whether element has a valid namespace */
      if (currentNode instanceof Element && !_checkValidNamespace(currentNode)) {
        _forceRemove(currentNode);
        return true;
      }

      /* Make sure that older browsers don't get fallback-tag mXSS */
      if ((tagName === 'noscript' || tagName === 'noembed' || tagName === 'noframes') && regExpTest(/<\/no(script|embed|frames)/i, currentNode.innerHTML)) {
        _forceRemove(currentNode);
        return true;
      }

      /* Sanitize element content to be template-safe */
      if (SAFE_FOR_TEMPLATES && currentNode.nodeType === NODE_TYPE.text) {
        /* Get the element's text content */
        content = currentNode.textContent;
        arrayForEach([MUSTACHE_EXPR, ERB_EXPR, TMPLIT_EXPR], expr => {
          content = stringReplace(content, expr, ' ');
        });
        if (currentNode.textContent !== content) {
          arrayPush(DOMPurify.removed, {
            element: currentNode.cloneNode()
          });
          currentNode.textContent = content;
        }
      }

      /* Execute a hook if present */
      _executeHook('afterSanitizeElements', currentNode, null);
      return false;
    };

    /**
     * _isValidAttribute
     *
     * @param  {string} lcTag Lowercase tag name of containing element.
     * @param  {string} lcName Lowercase attribute name.
     * @param  {string} value Attribute value.
     * @return {Boolean} Returns true if `value` is valid, otherwise false.
     */
    // eslint-disable-next-line complexity
    const _isValidAttribute = function _isValidAttribute(lcTag, lcName, value) {
      /* Make sure attribute cannot clobber */
      if (SANITIZE_DOM && (lcName === 'id' || lcName === 'name') && (value in document || value in formElement)) {
        return false;
      }

      /* Allow valid data-* attributes: At least one character after "-"
          (https://html.spec.whatwg.org/multipage/dom.html#embedding-custom-non-visible-data-with-the-data-*-attributes)
          XML-compatible (https://html.spec.whatwg.org/multipage/infrastructure.html#xml-compatible and http://www.w3.org/TR/xml/#d0e804)
          We don't need to check the value; it's always URI safe. */
      if (ALLOW_DATA_ATTR && !FORBID_ATTR[lcName] && regExpTest(DATA_ATTR, lcName)) ; else if (ALLOW_ARIA_ATTR && regExpTest(ARIA_ATTR, lcName)) ; else if (!ALLOWED_ATTR[lcName] || FORBID_ATTR[lcName]) {
        if (
        // First condition does a very basic check if a) it's basically a valid custom element tagname AND
        // b) if the tagName passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
        // and c) if the attribute name passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.attributeNameCheck
        _isBasicCustomElement(lcTag) && (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, lcTag) || CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(lcTag)) && (CUSTOM_ELEMENT_HANDLING.attributeNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.attributeNameCheck, lcName) || CUSTOM_ELEMENT_HANDLING.attributeNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.attributeNameCheck(lcName)) ||
        // Alternative, second condition checks if it's an `is`-attribute, AND
        // the value passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
        lcName === 'is' && CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements && (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, value) || CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(value))) ; else {
          return false;
        }
        /* Check value is safe. First, is attr inert? If so, is safe */
      } else if (URI_SAFE_ATTRIBUTES[lcName]) ; else if (regExpTest(IS_ALLOWED_URI$1, stringReplace(value, ATTR_WHITESPACE, ''))) ; else if ((lcName === 'src' || lcName === 'xlink:href' || lcName === 'href') && lcTag !== 'script' && stringIndexOf(value, 'data:') === 0 && DATA_URI_TAGS[lcTag]) ; else if (ALLOW_UNKNOWN_PROTOCOLS && !regExpTest(IS_SCRIPT_OR_DATA, stringReplace(value, ATTR_WHITESPACE, ''))) ; else if (value) {
        return false;
      } else ;
      return true;
    };

    /**
     * _isBasicCustomElement
     * checks if at least one dash is included in tagName, and it's not the first char
     * for more sophisticated checking see https://github.com/sindresorhus/validate-element-name
     *
     * @param {string} tagName name of the tag of the node to sanitize
     * @returns {boolean} Returns true if the tag name meets the basic criteria for a custom element, otherwise false.
     */
    const _isBasicCustomElement = function _isBasicCustomElement(tagName) {
      return tagName !== 'annotation-xml' && stringMatch(tagName, CUSTOM_ELEMENT);
    };

    /**
     * _sanitizeAttributes
     *
     * @protect attributes
     * @protect nodeName
     * @protect removeAttribute
     * @protect setAttribute
     *
     * @param  {Node} currentNode to sanitize
     */
    const _sanitizeAttributes = function _sanitizeAttributes(currentNode) {
      /* Execute a hook if present */
      _executeHook('beforeSanitizeAttributes', currentNode, null);
      const {
        attributes
      } = currentNode;

      /* Check if we have attributes; if not we might have a text node */
      if (!attributes) {
        return;
      }
      const hookEvent = {
        attrName: '',
        attrValue: '',
        keepAttr: true,
        allowedAttributes: ALLOWED_ATTR
      };
      let l = attributes.length;

      /* Go backwards over all attributes; safely remove bad ones */
      while (l--) {
        const attr = attributes[l];
        const {
          name,
          namespaceURI,
          value: attrValue
        } = attr;
        const lcName = transformCaseFunc(name);
        let value = name === 'value' ? attrValue : stringTrim(attrValue);

        /* Execute a hook if present */
        hookEvent.attrName = lcName;
        hookEvent.attrValue = value;
        hookEvent.keepAttr = true;
        hookEvent.forceKeepAttr = undefined; // Allows developers to see this is a property they can set
        _executeHook('uponSanitizeAttribute', currentNode, hookEvent);
        value = hookEvent.attrValue;

        /* Work around a security issue with comments inside attributes */
        if (SAFE_FOR_XML && regExpTest(/((--!?|])>)|<\/(style|title)/i, value)) {
          _removeAttribute(name, currentNode);
          continue;
        }

        /* Did the hooks approve of the attribute? */
        if (hookEvent.forceKeepAttr) {
          continue;
        }

        /* Remove attribute */
        _removeAttribute(name, currentNode);

        /* Did the hooks approve of the attribute? */
        if (!hookEvent.keepAttr) {
          continue;
        }

        /* Work around a security issue in jQuery 3.0 */
        if (!ALLOW_SELF_CLOSE_IN_ATTR && regExpTest(/\/>/i, value)) {
          _removeAttribute(name, currentNode);
          continue;
        }

        /* Sanitize attribute content to be template-safe */
        if (SAFE_FOR_TEMPLATES) {
          arrayForEach([MUSTACHE_EXPR, ERB_EXPR, TMPLIT_EXPR], expr => {
            value = stringReplace(value, expr, ' ');
          });
        }

        /* Is `value` valid for this attribute? */
        const lcTag = transformCaseFunc(currentNode.nodeName);
        if (!_isValidAttribute(lcTag, lcName, value)) {
          continue;
        }

        /* Full DOM Clobbering protection via namespace isolation,
         * Prefix id and name attributes with `user-content-`
         */
        if (SANITIZE_NAMED_PROPS && (lcName === 'id' || lcName === 'name')) {
          // Remove the attribute with this value
          _removeAttribute(name, currentNode);

          // Prefix the value and later re-create the attribute with the sanitized value
          value = SANITIZE_NAMED_PROPS_PREFIX + value;
        }

        /* Handle attributes that require Trusted Types */
        if (trustedTypesPolicy && typeof trustedTypes === 'object' && typeof trustedTypes.getAttributeType === 'function') {
          if (namespaceURI) ; else {
            switch (trustedTypes.getAttributeType(lcTag, lcName)) {
              case 'TrustedHTML':
                {
                  value = trustedTypesPolicy.createHTML(value);
                  break;
                }
              case 'TrustedScriptURL':
                {
                  value = trustedTypesPolicy.createScriptURL(value);
                  break;
                }
            }
          }
        }

        /* Handle invalid data-* attribute set by try-catching it */
        try {
          if (namespaceURI) {
            currentNode.setAttributeNS(namespaceURI, name, value);
          } else {
            /* Fallback to setAttribute() for browser-unrecognized namespaces e.g. "x-schema". */
            currentNode.setAttribute(name, value);
          }
          if (_isClobbered(currentNode)) {
            _forceRemove(currentNode);
          } else {
            arrayPop(DOMPurify.removed);
          }
        } catch (_) {}
      }

      /* Execute a hook if present */
      _executeHook('afterSanitizeAttributes', currentNode, null);
    };

    /**
     * _sanitizeShadowDOM
     *
     * @param  {DocumentFragment} fragment to iterate over recursively
     */
    const _sanitizeShadowDOM = function _sanitizeShadowDOM(fragment) {
      let shadowNode = null;
      const shadowIterator = _createNodeIterator(fragment);

      /* Execute a hook if present */
      _executeHook('beforeSanitizeShadowDOM', fragment, null);
      while (shadowNode = shadowIterator.nextNode()) {
        /* Execute a hook if present */
        _executeHook('uponSanitizeShadowNode', shadowNode, null);

        /* Sanitize tags and elements */
        if (_sanitizeElements(shadowNode)) {
          continue;
        }

        /* Deep shadow DOM detected */
        if (shadowNode.content instanceof DocumentFragment) {
          _sanitizeShadowDOM(shadowNode.content);
        }

        /* Check attributes, sanitize if necessary */
        _sanitizeAttributes(shadowNode);
      }

      /* Execute a hook if present */
      _executeHook('afterSanitizeShadowDOM', fragment, null);
    };

    /**
     * Sanitize
     * Public method providing core sanitation functionality
     *
     * @param {String|Node} dirty string or DOM node
     * @param {Object} cfg object
     */
    // eslint-disable-next-line complexity
    DOMPurify.sanitize = function (dirty) {
      let cfg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      let body = null;
      let importedNode = null;
      let currentNode = null;
      let returnNode = null;
      /* Make sure we have a string to sanitize.
        DO NOT return early, as this will return the wrong type if
        the user has requested a DOM object rather than a string */
      IS_EMPTY_INPUT = !dirty;
      if (IS_EMPTY_INPUT) {
        dirty = '<!-->';
      }

      /* Stringify, in case dirty is an object */
      if (typeof dirty !== 'string' && !_isNode(dirty)) {
        if (typeof dirty.toString === 'function') {
          dirty = dirty.toString();
          if (typeof dirty !== 'string') {
            throw typeErrorCreate('dirty is not a string, aborting');
          }
        } else {
          throw typeErrorCreate('toString is not a function');
        }
      }

      /* Return dirty HTML if DOMPurify cannot run */
      if (!DOMPurify.isSupported) {
        return dirty;
      }

      /* Assign config vars */
      if (!SET_CONFIG) {
        _parseConfig(cfg);
      }

      /* Clean up removed elements */
      DOMPurify.removed = [];

      /* Check if dirty is correctly typed for IN_PLACE */
      if (typeof dirty === 'string') {
        IN_PLACE = false;
      }
      if (IN_PLACE) {
        /* Do some early pre-sanitization to avoid unsafe root nodes */
        if (dirty.nodeName) {
          const tagName = transformCaseFunc(dirty.nodeName);
          if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
            throw typeErrorCreate('root node is forbidden and cannot be sanitized in-place');
          }
        }
      } else if (dirty instanceof Node) {
        /* If dirty is a DOM element, append to an empty document to avoid
           elements being stripped by the parser */
        body = _initDocument('<!---->');
        importedNode = body.ownerDocument.importNode(dirty, true);
        if (importedNode.nodeType === NODE_TYPE.element && importedNode.nodeName === 'BODY') {
          /* Node is already a body, use as is */
          body = importedNode;
        } else if (importedNode.nodeName === 'HTML') {
          body = importedNode;
        } else {
          // eslint-disable-next-line unicorn/prefer-dom-node-append
          body.appendChild(importedNode);
        }
      } else {
        /* Exit directly if we have nothing to do */
        if (!RETURN_DOM && !SAFE_FOR_TEMPLATES && !WHOLE_DOCUMENT &&
        // eslint-disable-next-line unicorn/prefer-includes
        dirty.indexOf('<') === -1) {
          return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(dirty) : dirty;
        }

        /* Initialize the document to work on */
        body = _initDocument(dirty);

        /* Check we have a DOM node from the data */
        if (!body) {
          return RETURN_DOM ? null : RETURN_TRUSTED_TYPE ? emptyHTML : '';
        }
      }

      /* Remove first element node (ours) if FORCE_BODY is set */
      if (body && FORCE_BODY) {
        _forceRemove(body.firstChild);
      }

      /* Get node iterator */
      const nodeIterator = _createNodeIterator(IN_PLACE ? dirty : body);

      /* Now start iterating over the created document */
      while (currentNode = nodeIterator.nextNode()) {
        /* Sanitize tags and elements */
        if (_sanitizeElements(currentNode)) {
          continue;
        }

        /* Shadow DOM detected, sanitize it */
        if (currentNode.content instanceof DocumentFragment) {
          _sanitizeShadowDOM(currentNode.content);
        }

        /* Check attributes, sanitize if necessary */
        _sanitizeAttributes(currentNode);
      }

      /* If we sanitized `dirty` in-place, return it. */
      if (IN_PLACE) {
        return dirty;
      }

      /* Return sanitized string or DOM */
      if (RETURN_DOM) {
        if (RETURN_DOM_FRAGMENT) {
          returnNode = createDocumentFragment.call(body.ownerDocument);
          while (body.firstChild) {
            // eslint-disable-next-line unicorn/prefer-dom-node-append
            returnNode.appendChild(body.firstChild);
          }
        } else {
          returnNode = body;
        }
        if (ALLOWED_ATTR.shadowroot || ALLOWED_ATTR.shadowrootmode) {
          /*
            AdoptNode() is not used because internal state is not reset
            (e.g. the past names map of a HTMLFormElement), this is safe
            in theory but we would rather not risk another attack vector.
            The state that is cloned by importNode() is explicitly defined
            by the specs.
          */
          returnNode = importNode.call(originalDocument, returnNode, true);
        }
        return returnNode;
      }
      let serializedHTML = WHOLE_DOCUMENT ? body.outerHTML : body.innerHTML;

      /* Serialize doctype if allowed */
      if (WHOLE_DOCUMENT && ALLOWED_TAGS['!doctype'] && body.ownerDocument && body.ownerDocument.doctype && body.ownerDocument.doctype.name && regExpTest(DOCTYPE_NAME, body.ownerDocument.doctype.name)) {
        serializedHTML = '<!DOCTYPE ' + body.ownerDocument.doctype.name + '>\n' + serializedHTML;
      }

      /* Sanitize final string template-safe */
      if (SAFE_FOR_TEMPLATES) {
        arrayForEach([MUSTACHE_EXPR, ERB_EXPR, TMPLIT_EXPR], expr => {
          serializedHTML = stringReplace(serializedHTML, expr, ' ');
        });
      }
      return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(serializedHTML) : serializedHTML;
    };

    /**
     * Public method to set the configuration once
     * setConfig
     *
     * @param {Object} cfg configuration object
     */
    DOMPurify.setConfig = function () {
      let cfg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      _parseConfig(cfg);
      SET_CONFIG = true;
    };

    /**
     * Public method to remove the configuration
     * clearConfig
     *
     */
    DOMPurify.clearConfig = function () {
      CONFIG = null;
      SET_CONFIG = false;
    };

    /**
     * Public method to check if an attribute value is valid.
     * Uses last set config, if any. Otherwise, uses config defaults.
     * isValidAttribute
     *
     * @param  {String} tag Tag name of containing element.
     * @param  {String} attr Attribute name.
     * @param  {String} value Attribute value.
     * @return {Boolean} Returns true if `value` is valid. Otherwise, returns false.
     */
    DOMPurify.isValidAttribute = function (tag, attr, value) {
      /* Initialize shared config vars if necessary. */
      if (!CONFIG) {
        _parseConfig({});
      }
      const lcTag = transformCaseFunc(tag);
      const lcName = transformCaseFunc(attr);
      return _isValidAttribute(lcTag, lcName, value);
    };

    /**
     * AddHook
     * Public method to add DOMPurify hooks
     *
     * @param {String} entryPoint entry point for the hook to add
     * @param {Function} hookFunction function to execute
     */
    DOMPurify.addHook = function (entryPoint, hookFunction) {
      if (typeof hookFunction !== 'function') {
        return;
      }
      hooks[entryPoint] = hooks[entryPoint] || [];
      arrayPush(hooks[entryPoint], hookFunction);
    };

    /**
     * RemoveHook
     * Public method to remove a DOMPurify hook at a given entryPoint
     * (pops it from the stack of hooks if more are present)
     *
     * @param {String} entryPoint entry point for the hook to remove
     * @return {Function} removed(popped) hook
     */
    DOMPurify.removeHook = function (entryPoint) {
      if (hooks[entryPoint]) {
        return arrayPop(hooks[entryPoint]);
      }
    };

    /**
     * RemoveHooks
     * Public method to remove all DOMPurify hooks at a given entryPoint
     *
     * @param  {String} entryPoint entry point for the hooks to remove
     */
    DOMPurify.removeHooks = function (entryPoint) {
      if (hooks[entryPoint]) {
        hooks[entryPoint] = [];
      }
    };

    /**
     * RemoveAllHooks
     * Public method to remove all DOMPurify hooks
     */
    DOMPurify.removeAllHooks = function () {
      hooks = {};
    };
    return DOMPurify;
  }
  var purify = createDOMPurify();

  return purify;

}));
//# sourceMappingURL=purify.js.map

```

## File content `vendor\markdown-it\markdown-it.js`:

```js
/*! markdown-it 14.1.0 https://github.com/markdown-it/markdown-it @license MIT */
(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, 
  global.markdownit = factory());
})(this, (function() {
  "use strict";
  /* eslint-disable no-bitwise */  const decodeCache = {};
  function getDecodeCache(exclude) {
    let cache = decodeCache[exclude];
    if (cache) {
      return cache;
    }
    cache = decodeCache[exclude] = [];
    for (let i = 0; i < 128; i++) {
      const ch = String.fromCharCode(i);
      cache.push(ch);
    }
    for (let i = 0; i < exclude.length; i++) {
      const ch = exclude.charCodeAt(i);
      cache[ch] = "%" + ("0" + ch.toString(16).toUpperCase()).slice(-2);
    }
    return cache;
  }
  // Decode percent-encoded string.
  
    function decode$1(string, exclude) {
    if (typeof exclude !== "string") {
      exclude = decode$1.defaultChars;
    }
    const cache = getDecodeCache(exclude);
    return string.replace(/(%[a-f0-9]{2})+/gi, (function(seq) {
      let result = "";
      for (let i = 0, l = seq.length; i < l; i += 3) {
        const b1 = parseInt(seq.slice(i + 1, i + 3), 16);
        if (b1 < 128) {
          result += cache[b1];
          continue;
        }
        if ((b1 & 224) === 192 && i + 3 < l) {
          // 110xxxxx 10xxxxxx
          const b2 = parseInt(seq.slice(i + 4, i + 6), 16);
          if ((b2 & 192) === 128) {
            const chr = b1 << 6 & 1984 | b2 & 63;
            if (chr < 128) {
              result += "\ufffd\ufffd";
            } else {
              result += String.fromCharCode(chr);
            }
            i += 3;
            continue;
          }
        }
        if ((b1 & 240) === 224 && i + 6 < l) {
          // 1110xxxx 10xxxxxx 10xxxxxx
          const b2 = parseInt(seq.slice(i + 4, i + 6), 16);
          const b3 = parseInt(seq.slice(i + 7, i + 9), 16);
          if ((b2 & 192) === 128 && (b3 & 192) === 128) {
            const chr = b1 << 12 & 61440 | b2 << 6 & 4032 | b3 & 63;
            if (chr < 2048 || chr >= 55296 && chr <= 57343) {
              result += "\ufffd\ufffd\ufffd";
            } else {
              result += String.fromCharCode(chr);
            }
            i += 6;
            continue;
          }
        }
        if ((b1 & 248) === 240 && i + 9 < l) {
          // 111110xx 10xxxxxx 10xxxxxx 10xxxxxx
          const b2 = parseInt(seq.slice(i + 4, i + 6), 16);
          const b3 = parseInt(seq.slice(i + 7, i + 9), 16);
          const b4 = parseInt(seq.slice(i + 10, i + 12), 16);
          if ((b2 & 192) === 128 && (b3 & 192) === 128 && (b4 & 192) === 128) {
            let chr = b1 << 18 & 1835008 | b2 << 12 & 258048 | b3 << 6 & 4032 | b4 & 63;
            if (chr < 65536 || chr > 1114111) {
              result += "\ufffd\ufffd\ufffd\ufffd";
            } else {
              chr -= 65536;
              result += String.fromCharCode(55296 + (chr >> 10), 56320 + (chr & 1023));
            }
            i += 9;
            continue;
          }
        }
        result += "\ufffd";
      }
      return result;
    }));
  }
  decode$1.defaultChars = ";/?:@&=+$,#";
  decode$1.componentChars = "";
  const encodeCache = {};
  // Create a lookup array where anything but characters in `chars` string
  // and alphanumeric chars is percent-encoded.
  
    function getEncodeCache(exclude) {
    let cache = encodeCache[exclude];
    if (cache) {
      return cache;
    }
    cache = encodeCache[exclude] = [];
    for (let i = 0; i < 128; i++) {
      const ch = String.fromCharCode(i);
      if (/^[0-9a-z]$/i.test(ch)) {
        // always allow unencoded alphanumeric characters
        cache.push(ch);
      } else {
        cache.push("%" + ("0" + i.toString(16).toUpperCase()).slice(-2));
      }
    }
    for (let i = 0; i < exclude.length; i++) {
      cache[exclude.charCodeAt(i)] = exclude[i];
    }
    return cache;
  }
  // Encode unsafe characters with percent-encoding, skipping already
  // encoded sequences.
  
  //  - string       - string to encode
  //  - exclude      - list of characters to ignore (in addition to a-zA-Z0-9)
  //  - keepEscaped  - don't encode '%' in a correct escape sequence (default: true)
  
    function encode$1(string, exclude, keepEscaped) {
    if (typeof exclude !== "string") {
      // encode(string, keepEscaped)
      keepEscaped = exclude;
      exclude = encode$1.defaultChars;
    }
    if (typeof keepEscaped === "undefined") {
      keepEscaped = true;
    }
    const cache = getEncodeCache(exclude);
    let result = "";
    for (let i = 0, l = string.length; i < l; i++) {
      const code = string.charCodeAt(i);
      if (keepEscaped && code === 37 /* % */ && i + 2 < l) {
        if (/^[0-9a-f]{2}$/i.test(string.slice(i + 1, i + 3))) {
          result += string.slice(i, i + 3);
          i += 2;
          continue;
        }
      }
      if (code < 128) {
        result += cache[code];
        continue;
      }
      if (code >= 55296 && code <= 57343) {
        if (code >= 55296 && code <= 56319 && i + 1 < l) {
          const nextCode = string.charCodeAt(i + 1);
          if (nextCode >= 56320 && nextCode <= 57343) {
            result += encodeURIComponent(string[i] + string[i + 1]);
            i++;
            continue;
          }
        }
        result += "%EF%BF%BD";
        continue;
      }
      result += encodeURIComponent(string[i]);
    }
    return result;
  }
  encode$1.defaultChars = ";/?:@&=+$,-_.!~*'()#";
  encode$1.componentChars = "-_.!~*'()";
  function format(url) {
    let result = "";
    result += url.protocol || "";
    result += url.slashes ? "//" : "";
    result += url.auth ? url.auth + "@" : "";
    if (url.hostname && url.hostname.indexOf(":") !== -1) {
      // ipv6 address
      result += "[" + url.hostname + "]";
    } else {
      result += url.hostname || "";
    }
    result += url.port ? ":" + url.port : "";
    result += url.pathname || "";
    result += url.search || "";
    result += url.hash || "";
    return result;
  }
  // Copyright Joyent, Inc. and other Node contributors.
  
  // Permission is hereby granted, free of charge, to any person obtaining a
  // copy of this software and associated documentation files (the
  // "Software"), to deal in the Software without restriction, including
  // without limitation the rights to use, copy, modify, merge, publish,
  // distribute, sublicense, and/or sell copies of the Software, and to permit
  // persons to whom the Software is furnished to do so, subject to the
  // following conditions:
  
  // The above copyright notice and this permission notice shall be included
  // in all copies or substantial portions of the Software.
  
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
  // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
  // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
  // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
  // USE OR OTHER DEALINGS IN THE SOFTWARE.
  
  // Changes from joyent/node:
  
  // 1. No leading slash in paths,
  //    e.g. in `url.parse('http://foo?bar')` pathname is ``, not `/`
  
  // 2. Backslashes are not replaced with slashes,
  //    so `http:\\example.org\` is treated like a relative path
  
  // 3. Trailing colon is treated like a part of the path,
  //    i.e. in `http://example.org:foo` pathname is `:foo`
  
  // 4. Nothing is URL-encoded in the resulting object,
  //    (in joyent/node some chars in auth and paths are encoded)
  
  // 5. `url.parse()` does not have `parseQueryString` argument
  
  // 6. Removed extraneous result properties: `host`, `path`, `query`, etc.,
  //    which can be constructed using other parts of the url.
  
    function Url() {
    this.protocol = null;
    this.slashes = null;
    this.auth = null;
    this.port = null;
    this.hostname = null;
    this.hash = null;
    this.search = null;
    this.pathname = null;
  }
  // Reference: RFC 3986, RFC 1808, RFC 2396
  // define these here so at least they only have to be
  // compiled once on the first module load.
    const protocolPattern = /^([a-z0-9.+-]+:)/i;
  const portPattern = /:[0-9]*$/;
  // Special case for a simple path URL
  /* eslint-disable-next-line no-useless-escape */  const simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/;
  // RFC 2396: characters reserved for delimiting URLs.
  // We actually just auto-escape these.
    const delims = [ "<", ">", '"', "`", " ", "\r", "\n", "\t" ];
  // RFC 2396: characters not allowed for various reasons.
    const unwise = [ "{", "}", "|", "\\", "^", "`" ].concat(delims);
  // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    const autoEscape = [ "'" ].concat(unwise);
  // Characters that are never ever allowed in a hostname.
  // Note that any invalid chars are also handled, but these
  // are the ones that are *expected* to be seen, so we fast-path
  // them.
    const nonHostChars = [ "%", "/", "?", ";", "#" ].concat(autoEscape);
  const hostEndingChars = [ "/", "?", "#" ];
  const hostnameMaxLen = 255;
  const hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/;
  const hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/;
  // protocols that can allow "unsafe" and "unwise" chars.
  // protocols that never have a hostname.
    const hostlessProtocol = {
    javascript: true,
    "javascript:": true
  };
  // protocols that always contain a // bit.
    const slashedProtocol = {
    http: true,
    https: true,
    ftp: true,
    gopher: true,
    file: true,
    "http:": true,
    "https:": true,
    "ftp:": true,
    "gopher:": true,
    "file:": true
  };
  function urlParse(url, slashesDenoteHost) {
    if (url && url instanceof Url) return url;
    const u = new Url;
    u.parse(url, slashesDenoteHost);
    return u;
  }
  Url.prototype.parse = function(url, slashesDenoteHost) {
    let lowerProto, hec, slashes;
    let rest = url;
    // trim before proceeding.
    // This is to support parse stuff like "  http://foo.com  \n"
        rest = rest.trim();
    if (!slashesDenoteHost && url.split("#").length === 1) {
      // Try fast path regexp
      const simplePath = simplePathPattern.exec(rest);
      if (simplePath) {
        this.pathname = simplePath[1];
        if (simplePath[2]) {
          this.search = simplePath[2];
        }
        return this;
      }
    }
    let proto = protocolPattern.exec(rest);
    if (proto) {
      proto = proto[0];
      lowerProto = proto.toLowerCase();
      this.protocol = proto;
      rest = rest.substr(proto.length);
    }
    // figure out if it's got a host
    // user@server is *always* interpreted as a hostname, and url
    // resolution will treat //foo/bar as host=foo,path=bar because that's
    // how the browser resolves relative URLs.
    /* eslint-disable-next-line no-useless-escape */    if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
      slashes = rest.substr(0, 2) === "//";
      if (slashes && !(proto && hostlessProtocol[proto])) {
        rest = rest.substr(2);
        this.slashes = true;
      }
    }
    if (!hostlessProtocol[proto] && (slashes || proto && !slashedProtocol[proto])) {
      // there's a hostname.
      // the first instance of /, ?, ;, or # ends the host.
      // If there is an @ in the hostname, then non-host chars *are* allowed
      // to the left of the last @ sign, unless some host-ending character
      // comes *before* the @-sign.
      // URLs are obnoxious.
      // ex:
      // http://a@b@c/ => user:a@b host:c
      // http://a@b?@c => user:a host:c path:/?@c
      // v0.12 TODO(isaacs): This is not quite how Chrome does things.
      // Review our test case against browsers more comprehensively.
      // find the first instance of any hostEndingChars
      let hostEnd = -1;
      for (let i = 0; i < hostEndingChars.length; i++) {
        hec = rest.indexOf(hostEndingChars[i]);
        if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) {
          hostEnd = hec;
        }
      }
      // at this point, either we have an explicit point where the
      // auth portion cannot go past, or the last @ char is the decider.
            let auth, atSign;
      if (hostEnd === -1) {
        // atSign can be anywhere.
        atSign = rest.lastIndexOf("@");
      } else {
        // atSign must be in auth portion.
        // http://a@b/c@d => host:b auth:a path:/c@d
        atSign = rest.lastIndexOf("@", hostEnd);
      }
      // Now we have a portion which is definitely the auth.
      // Pull that off.
            if (atSign !== -1) {
        auth = rest.slice(0, atSign);
        rest = rest.slice(atSign + 1);
        this.auth = auth;
      }
      // the host is the remaining to the left of the first non-host char
            hostEnd = -1;
      for (let i = 0; i < nonHostChars.length; i++) {
        hec = rest.indexOf(nonHostChars[i]);
        if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) {
          hostEnd = hec;
        }
      }
      // if we still have not hit it, then the entire thing is a host.
            if (hostEnd === -1) {
        hostEnd = rest.length;
      }
      if (rest[hostEnd - 1] === ":") {
        hostEnd--;
      }
      const host = rest.slice(0, hostEnd);
      rest = rest.slice(hostEnd);
      // pull out port.
            this.parseHost(host);
      // we've indicated that there is a hostname,
      // so even if it's empty, it has to be present.
            this.hostname = this.hostname || "";
      // if hostname begins with [ and ends with ]
      // assume that it's an IPv6 address.
            const ipv6Hostname = this.hostname[0] === "[" && this.hostname[this.hostname.length - 1] === "]";
      // validate a little.
            if (!ipv6Hostname) {
        const hostparts = this.hostname.split(/\./);
        for (let i = 0, l = hostparts.length; i < l; i++) {
          const part = hostparts[i];
          if (!part) {
            continue;
          }
          if (!part.match(hostnamePartPattern)) {
            let newpart = "";
            for (let j = 0, k = part.length; j < k; j++) {
              if (part.charCodeAt(j) > 127) {
                // we replace non-ASCII char with a temporary placeholder
                // we need this to make sure size of hostname is not
                // broken by replacing non-ASCII by nothing
                newpart += "x";
              } else {
                newpart += part[j];
              }
            }
            // we test again with ASCII char only
                        if (!newpart.match(hostnamePartPattern)) {
              const validParts = hostparts.slice(0, i);
              const notHost = hostparts.slice(i + 1);
              const bit = part.match(hostnamePartStart);
              if (bit) {
                validParts.push(bit[1]);
                notHost.unshift(bit[2]);
              }
              if (notHost.length) {
                rest = notHost.join(".") + rest;
              }
              this.hostname = validParts.join(".");
              break;
            }
          }
        }
      }
      if (this.hostname.length > hostnameMaxLen) {
        this.hostname = "";
      }
      // strip [ and ] from the hostname
      // the host field still retains them, though
            if (ipv6Hostname) {
        this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      }
    }
    // chop off from the tail first.
        const hash = rest.indexOf("#");
    if (hash !== -1) {
      // got a fragment string.
      this.hash = rest.substr(hash);
      rest = rest.slice(0, hash);
    }
    const qm = rest.indexOf("?");
    if (qm !== -1) {
      this.search = rest.substr(qm);
      rest = rest.slice(0, qm);
    }
    if (rest) {
      this.pathname = rest;
    }
    if (slashedProtocol[lowerProto] && this.hostname && !this.pathname) {
      this.pathname = "";
    }
    return this;
  };
  Url.prototype.parseHost = function(host) {
    let port = portPattern.exec(host);
    if (port) {
      port = port[0];
      if (port !== ":") {
        this.port = port.substr(1);
      }
      host = host.substr(0, host.length - port.length);
    }
    if (host) {
      this.hostname = host;
    }
  };
  var mdurl =  Object.freeze({
    __proto__: null,
    decode: decode$1,
    encode: encode$1,
    format: format,
    parse: urlParse
  });
  var Any = /[\0-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
  var Cc = /[\0-\x1F\x7F-\x9F]/;
  var regex$1 = /[\xAD\u0600-\u0605\u061C\u06DD\u070F\u0890\u0891\u08E2\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF\uFFF9-\uFFFB]|\uD804[\uDCBD\uDCCD]|\uD80D[\uDC30-\uDC3F]|\uD82F[\uDCA0-\uDCA3]|\uD834[\uDD73-\uDD7A]|\uDB40[\uDC01\uDC20-\uDC7F]/;
  var P = /[!-#%-\*,-\/:;\?@\[-\]_\{\}\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061D-\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C77\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1B7D\u1B7E\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4F\u2E52-\u2E5D\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD803[\uDEAD\uDF55-\uDF59\uDF86-\uDF89]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC8\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9]|\uD805[\uDC4B-\uDC4F\uDC5A\uDC5B\uDC5D\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDE60-\uDE6C\uDEB9\uDF3C-\uDF3E]|\uD806[\uDC3B\uDD44-\uDD46\uDDE2\uDE3F-\uDE46\uDE9A-\uDE9C\uDE9E-\uDEA2\uDF00-\uDF09]|\uD807[\uDC41-\uDC45\uDC70\uDC71\uDEF7\uDEF8\uDF43-\uDF4F\uDFFF]|\uD809[\uDC70-\uDC74]|\uD80B[\uDFF1\uDFF2]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD81B[\uDE97-\uDE9A\uDFE2]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]|\uD83A[\uDD5E\uDD5F]/;
  var regex = /[\$\+<->\^`\|~\xA2-\xA6\xA8\xA9\xAC\xAE-\xB1\xB4\xB8\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u02FF\u0375\u0384\u0385\u03F6\u0482\u058D-\u058F\u0606-\u0608\u060B\u060E\u060F\u06DE\u06E9\u06FD\u06FE\u07F6\u07FE\u07FF\u0888\u09F2\u09F3\u09FA\u09FB\u0AF1\u0B70\u0BF3-\u0BFA\u0C7F\u0D4F\u0D79\u0E3F\u0F01-\u0F03\u0F13\u0F15-\u0F17\u0F1A-\u0F1F\u0F34\u0F36\u0F38\u0FBE-\u0FC5\u0FC7-\u0FCC\u0FCE\u0FCF\u0FD5-\u0FD8\u109E\u109F\u1390-\u1399\u166D\u17DB\u1940\u19DE-\u19FF\u1B61-\u1B6A\u1B74-\u1B7C\u1FBD\u1FBF-\u1FC1\u1FCD-\u1FCF\u1FDD-\u1FDF\u1FED-\u1FEF\u1FFD\u1FFE\u2044\u2052\u207A-\u207C\u208A-\u208C\u20A0-\u20C0\u2100\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F\u218A\u218B\u2190-\u2307\u230C-\u2328\u232B-\u2426\u2440-\u244A\u249C-\u24E9\u2500-\u2767\u2794-\u27C4\u27C7-\u27E5\u27F0-\u2982\u2999-\u29D7\u29DC-\u29FB\u29FE-\u2B73\u2B76-\u2B95\u2B97-\u2BFF\u2CE5-\u2CEA\u2E50\u2E51\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u2FF0-\u2FFF\u3004\u3012\u3013\u3020\u3036\u3037\u303E\u303F\u309B\u309C\u3190\u3191\u3196-\u319F\u31C0-\u31E3\u31EF\u3200-\u321E\u322A-\u3247\u3250\u3260-\u327F\u328A-\u32B0\u32C0-\u33FF\u4DC0-\u4DFF\uA490-\uA4C6\uA700-\uA716\uA720\uA721\uA789\uA78A\uA828-\uA82B\uA836-\uA839\uAA77-\uAA79\uAB5B\uAB6A\uAB6B\uFB29\uFBB2-\uFBC2\uFD40-\uFD4F\uFDCF\uFDFC-\uFDFF\uFE62\uFE64-\uFE66\uFE69\uFF04\uFF0B\uFF1C-\uFF1E\uFF3E\uFF40\uFF5C\uFF5E\uFFE0-\uFFE6\uFFE8-\uFFEE\uFFFC\uFFFD]|\uD800[\uDD37-\uDD3F\uDD79-\uDD89\uDD8C-\uDD8E\uDD90-\uDD9C\uDDA0\uDDD0-\uDDFC]|\uD802[\uDC77\uDC78\uDEC8]|\uD805\uDF3F|\uD807[\uDFD5-\uDFF1]|\uD81A[\uDF3C-\uDF3F\uDF45]|\uD82F\uDC9C|\uD833[\uDF50-\uDFC3]|\uD834[\uDC00-\uDCF5\uDD00-\uDD26\uDD29-\uDD64\uDD6A-\uDD6C\uDD83\uDD84\uDD8C-\uDDA9\uDDAE-\uDDEA\uDE00-\uDE41\uDE45\uDF00-\uDF56]|\uD835[\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3]|\uD836[\uDC00-\uDDFF\uDE37-\uDE3A\uDE6D-\uDE74\uDE76-\uDE83\uDE85\uDE86]|\uD838[\uDD4F\uDEFF]|\uD83B[\uDCAC\uDCB0\uDD2E\uDEF0\uDEF1]|\uD83C[\uDC00-\uDC2B\uDC30-\uDC93\uDCA0-\uDCAE\uDCB1-\uDCBF\uDCC1-\uDCCF\uDCD1-\uDCF5\uDD0D-\uDDAD\uDDE6-\uDE02\uDE10-\uDE3B\uDE40-\uDE48\uDE50\uDE51\uDE60-\uDE65\uDF00-\uDFFF]|\uD83D[\uDC00-\uDED7\uDEDC-\uDEEC\uDEF0-\uDEFC\uDF00-\uDF76\uDF7B-\uDFD9\uDFE0-\uDFEB\uDFF0]|\uD83E[\uDC00-\uDC0B\uDC10-\uDC47\uDC50-\uDC59\uDC60-\uDC87\uDC90-\uDCAD\uDCB0\uDCB1\uDD00-\uDE53\uDE60-\uDE6D\uDE70-\uDE7C\uDE80-\uDE88\uDE90-\uDEBD\uDEBF-\uDEC5\uDECE-\uDEDB\uDEE0-\uDEE8\uDEF0-\uDEF8\uDF00-\uDF92\uDF94-\uDFCA]/;
  var Z = /[ \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/;
  var ucmicro =  Object.freeze({
    __proto__: null,
    Any: Any,
    Cc: Cc,
    Cf: regex$1,
    P: P,
    S: regex,
    Z: Z
  });
  // Generated using scripts/write-decode-map.ts
    var htmlDecodeTree = new Uint16Array(
  // prettier-ignore
  '\u1d41<\xd5\u0131\u028a\u049d\u057b\u05d0\u0675\u06de\u07a2\u07d6\u080f\u0a4a\u0a91\u0da1\u0e6d\u0f09\u0f26\u10ca\u1228\u12e1\u1415\u149d\u14c3\u14df\u1525\0\0\0\0\0\0\u156b\u16cd\u198d\u1c12\u1ddd\u1f7e\u2060\u21b0\u228d\u23c0\u23fb\u2442\u2824\u2912\u2d08\u2e48\u2fce\u3016\u32ba\u3639\u37ac\u38fe\u3a28\u3a71\u3ae0\u3b2e\u0800EMabcfglmnoprstu\\bfms\x7f\x84\x8b\x90\x95\x98\xa6\xb3\xb9\xc8\xcflig\u803b\xc6\u40c6P\u803b&\u4026cute\u803b\xc1\u40c1reve;\u4102\u0100iyx}rc\u803b\xc2\u40c2;\u4410r;\uc000\ud835\udd04rave\u803b\xc0\u40c0pha;\u4391acr;\u4100d;\u6a53\u0100gp\x9d\xa1on;\u4104f;\uc000\ud835\udd38plyFunction;\u6061ing\u803b\xc5\u40c5\u0100cs\xbe\xc3r;\uc000\ud835\udc9cign;\u6254ilde\u803b\xc3\u40c3ml\u803b\xc4\u40c4\u0400aceforsu\xe5\xfb\xfe\u0117\u011c\u0122\u0127\u012a\u0100cr\xea\xf2kslash;\u6216\u0176\xf6\xf8;\u6ae7ed;\u6306y;\u4411\u0180crt\u0105\u010b\u0114ause;\u6235noullis;\u612ca;\u4392r;\uc000\ud835\udd05pf;\uc000\ud835\udd39eve;\u42d8c\xf2\u0113mpeq;\u624e\u0700HOacdefhilorsu\u014d\u0151\u0156\u0180\u019e\u01a2\u01b5\u01b7\u01ba\u01dc\u0215\u0273\u0278\u027ecy;\u4427PY\u803b\xa9\u40a9\u0180cpy\u015d\u0162\u017aute;\u4106\u0100;i\u0167\u0168\u62d2talDifferentialD;\u6145leys;\u612d\u0200aeio\u0189\u018e\u0194\u0198ron;\u410cdil\u803b\xc7\u40c7rc;\u4108nint;\u6230ot;\u410a\u0100dn\u01a7\u01adilla;\u40b8terDot;\u40b7\xf2\u017fi;\u43a7rcle\u0200DMPT\u01c7\u01cb\u01d1\u01d6ot;\u6299inus;\u6296lus;\u6295imes;\u6297o\u0100cs\u01e2\u01f8kwiseContourIntegral;\u6232eCurly\u0100DQ\u0203\u020foubleQuote;\u601duote;\u6019\u0200lnpu\u021e\u0228\u0247\u0255on\u0100;e\u0225\u0226\u6237;\u6a74\u0180git\u022f\u0236\u023aruent;\u6261nt;\u622fourIntegral;\u622e\u0100fr\u024c\u024e;\u6102oduct;\u6210nterClockwiseContourIntegral;\u6233oss;\u6a2fcr;\uc000\ud835\udc9ep\u0100;C\u0284\u0285\u62d3ap;\u624d\u0580DJSZacefios\u02a0\u02ac\u02b0\u02b4\u02b8\u02cb\u02d7\u02e1\u02e6\u0333\u048d\u0100;o\u0179\u02a5trahd;\u6911cy;\u4402cy;\u4405cy;\u440f\u0180grs\u02bf\u02c4\u02c7ger;\u6021r;\u61a1hv;\u6ae4\u0100ay\u02d0\u02d5ron;\u410e;\u4414l\u0100;t\u02dd\u02de\u6207a;\u4394r;\uc000\ud835\udd07\u0100af\u02eb\u0327\u0100cm\u02f0\u0322ritical\u0200ADGT\u0300\u0306\u0316\u031ccute;\u40b4o\u0174\u030b\u030d;\u42d9bleAcute;\u42ddrave;\u4060ilde;\u42dcond;\u62c4ferentialD;\u6146\u0470\u033d\0\0\0\u0342\u0354\0\u0405f;\uc000\ud835\udd3b\u0180;DE\u0348\u0349\u034d\u40a8ot;\u60dcqual;\u6250ble\u0300CDLRUV\u0363\u0372\u0382\u03cf\u03e2\u03f8ontourIntegra\xec\u0239o\u0274\u0379\0\0\u037b\xbb\u0349nArrow;\u61d3\u0100eo\u0387\u03a4ft\u0180ART\u0390\u0396\u03a1rrow;\u61d0ightArrow;\u61d4e\xe5\u02cang\u0100LR\u03ab\u03c4eft\u0100AR\u03b3\u03b9rrow;\u67f8ightArrow;\u67faightArrow;\u67f9ight\u0100AT\u03d8\u03derrow;\u61d2ee;\u62a8p\u0241\u03e9\0\0\u03efrrow;\u61d1ownArrow;\u61d5erticalBar;\u6225n\u0300ABLRTa\u0412\u042a\u0430\u045e\u047f\u037crrow\u0180;BU\u041d\u041e\u0422\u6193ar;\u6913pArrow;\u61f5reve;\u4311eft\u02d2\u043a\0\u0446\0\u0450ightVector;\u6950eeVector;\u695eector\u0100;B\u0459\u045a\u61bdar;\u6956ight\u01d4\u0467\0\u0471eeVector;\u695fector\u0100;B\u047a\u047b\u61c1ar;\u6957ee\u0100;A\u0486\u0487\u62a4rrow;\u61a7\u0100ct\u0492\u0497r;\uc000\ud835\udc9frok;\u4110\u0800NTacdfglmopqstux\u04bd\u04c0\u04c4\u04cb\u04de\u04e2\u04e7\u04ee\u04f5\u0521\u052f\u0536\u0552\u055d\u0560\u0565G;\u414aH\u803b\xd0\u40d0cute\u803b\xc9\u40c9\u0180aiy\u04d2\u04d7\u04dcron;\u411arc\u803b\xca\u40ca;\u442dot;\u4116r;\uc000\ud835\udd08rave\u803b\xc8\u40c8ement;\u6208\u0100ap\u04fa\u04fecr;\u4112ty\u0253\u0506\0\0\u0512mallSquare;\u65fberySmallSquare;\u65ab\u0100gp\u0526\u052aon;\u4118f;\uc000\ud835\udd3csilon;\u4395u\u0100ai\u053c\u0549l\u0100;T\u0542\u0543\u6a75ilde;\u6242librium;\u61cc\u0100ci\u0557\u055ar;\u6130m;\u6a73a;\u4397ml\u803b\xcb\u40cb\u0100ip\u056a\u056fsts;\u6203onentialE;\u6147\u0280cfios\u0585\u0588\u058d\u05b2\u05ccy;\u4424r;\uc000\ud835\udd09lled\u0253\u0597\0\0\u05a3mallSquare;\u65fcerySmallSquare;\u65aa\u0370\u05ba\0\u05bf\0\0\u05c4f;\uc000\ud835\udd3dAll;\u6200riertrf;\u6131c\xf2\u05cb\u0600JTabcdfgorst\u05e8\u05ec\u05ef\u05fa\u0600\u0612\u0616\u061b\u061d\u0623\u066c\u0672cy;\u4403\u803b>\u403emma\u0100;d\u05f7\u05f8\u4393;\u43dcreve;\u411e\u0180eiy\u0607\u060c\u0610dil;\u4122rc;\u411c;\u4413ot;\u4120r;\uc000\ud835\udd0a;\u62d9pf;\uc000\ud835\udd3eeater\u0300EFGLST\u0635\u0644\u064e\u0656\u065b\u0666qual\u0100;L\u063e\u063f\u6265ess;\u62dbullEqual;\u6267reater;\u6aa2ess;\u6277lantEqual;\u6a7eilde;\u6273cr;\uc000\ud835\udca2;\u626b\u0400Aacfiosu\u0685\u068b\u0696\u069b\u069e\u06aa\u06be\u06caRDcy;\u442a\u0100ct\u0690\u0694ek;\u42c7;\u405eirc;\u4124r;\u610clbertSpace;\u610b\u01f0\u06af\0\u06b2f;\u610dizontalLine;\u6500\u0100ct\u06c3\u06c5\xf2\u06a9rok;\u4126mp\u0144\u06d0\u06d8ownHum\xf0\u012fqual;\u624f\u0700EJOacdfgmnostu\u06fa\u06fe\u0703\u0707\u070e\u071a\u071e\u0721\u0728\u0744\u0778\u078b\u078f\u0795cy;\u4415lig;\u4132cy;\u4401cute\u803b\xcd\u40cd\u0100iy\u0713\u0718rc\u803b\xce\u40ce;\u4418ot;\u4130r;\u6111rave\u803b\xcc\u40cc\u0180;ap\u0720\u072f\u073f\u0100cg\u0734\u0737r;\u412ainaryI;\u6148lie\xf3\u03dd\u01f4\u0749\0\u0762\u0100;e\u074d\u074e\u622c\u0100gr\u0753\u0758ral;\u622bsection;\u62c2isible\u0100CT\u076c\u0772omma;\u6063imes;\u6062\u0180gpt\u077f\u0783\u0788on;\u412ef;\uc000\ud835\udd40a;\u4399cr;\u6110ilde;\u4128\u01eb\u079a\0\u079ecy;\u4406l\u803b\xcf\u40cf\u0280cfosu\u07ac\u07b7\u07bc\u07c2\u07d0\u0100iy\u07b1\u07b5rc;\u4134;\u4419r;\uc000\ud835\udd0dpf;\uc000\ud835\udd41\u01e3\u07c7\0\u07ccr;\uc000\ud835\udca5rcy;\u4408kcy;\u4404\u0380HJacfos\u07e4\u07e8\u07ec\u07f1\u07fd\u0802\u0808cy;\u4425cy;\u440cppa;\u439a\u0100ey\u07f6\u07fbdil;\u4136;\u441ar;\uc000\ud835\udd0epf;\uc000\ud835\udd42cr;\uc000\ud835\udca6\u0580JTaceflmost\u0825\u0829\u082c\u0850\u0863\u09b3\u09b8\u09c7\u09cd\u0a37\u0a47cy;\u4409\u803b<\u403c\u0280cmnpr\u0837\u083c\u0841\u0844\u084dute;\u4139bda;\u439bg;\u67ealacetrf;\u6112r;\u619e\u0180aey\u0857\u085c\u0861ron;\u413ddil;\u413b;\u441b\u0100fs\u0868\u0970t\u0500ACDFRTUVar\u087e\u08a9\u08b1\u08e0\u08e6\u08fc\u092f\u095b\u0390\u096a\u0100nr\u0883\u088fgleBracket;\u67e8row\u0180;BR\u0899\u089a\u089e\u6190ar;\u61e4ightArrow;\u61c6eiling;\u6308o\u01f5\u08b7\0\u08c3bleBracket;\u67e6n\u01d4\u08c8\0\u08d2eeVector;\u6961ector\u0100;B\u08db\u08dc\u61c3ar;\u6959loor;\u630aight\u0100AV\u08ef\u08f5rrow;\u6194ector;\u694e\u0100er\u0901\u0917e\u0180;AV\u0909\u090a\u0910\u62a3rrow;\u61a4ector;\u695aiangle\u0180;BE\u0924\u0925\u0929\u62b2ar;\u69cfqual;\u62b4p\u0180DTV\u0937\u0942\u094cownVector;\u6951eeVector;\u6960ector\u0100;B\u0956\u0957\u61bfar;\u6958ector\u0100;B\u0965\u0966\u61bcar;\u6952ight\xe1\u039cs\u0300EFGLST\u097e\u098b\u0995\u099d\u09a2\u09adqualGreater;\u62daullEqual;\u6266reater;\u6276ess;\u6aa1lantEqual;\u6a7dilde;\u6272r;\uc000\ud835\udd0f\u0100;e\u09bd\u09be\u62d8ftarrow;\u61daidot;\u413f\u0180npw\u09d4\u0a16\u0a1bg\u0200LRlr\u09de\u09f7\u0a02\u0a10eft\u0100AR\u09e6\u09ecrrow;\u67f5ightArrow;\u67f7ightArrow;\u67f6eft\u0100ar\u03b3\u0a0aight\xe1\u03bfight\xe1\u03caf;\uc000\ud835\udd43er\u0100LR\u0a22\u0a2ceftArrow;\u6199ightArrow;\u6198\u0180cht\u0a3e\u0a40\u0a42\xf2\u084c;\u61b0rok;\u4141;\u626a\u0400acefiosu\u0a5a\u0a5d\u0a60\u0a77\u0a7c\u0a85\u0a8b\u0a8ep;\u6905y;\u441c\u0100dl\u0a65\u0a6fiumSpace;\u605flintrf;\u6133r;\uc000\ud835\udd10nusPlus;\u6213pf;\uc000\ud835\udd44c\xf2\u0a76;\u439c\u0480Jacefostu\u0aa3\u0aa7\u0aad\u0ac0\u0b14\u0b19\u0d91\u0d97\u0d9ecy;\u440acute;\u4143\u0180aey\u0ab4\u0ab9\u0aberon;\u4147dil;\u4145;\u441d\u0180gsw\u0ac7\u0af0\u0b0eative\u0180MTV\u0ad3\u0adf\u0ae8ediumSpace;\u600bhi\u0100cn\u0ae6\u0ad8\xeb\u0ad9eryThi\xee\u0ad9ted\u0100GL\u0af8\u0b06reaterGreate\xf2\u0673essLes\xf3\u0a48Line;\u400ar;\uc000\ud835\udd11\u0200Bnpt\u0b22\u0b28\u0b37\u0b3areak;\u6060BreakingSpace;\u40a0f;\u6115\u0680;CDEGHLNPRSTV\u0b55\u0b56\u0b6a\u0b7c\u0ba1\u0beb\u0c04\u0c5e\u0c84\u0ca6\u0cd8\u0d61\u0d85\u6aec\u0100ou\u0b5b\u0b64ngruent;\u6262pCap;\u626doubleVerticalBar;\u6226\u0180lqx\u0b83\u0b8a\u0b9bement;\u6209ual\u0100;T\u0b92\u0b93\u6260ilde;\uc000\u2242\u0338ists;\u6204reater\u0380;EFGLST\u0bb6\u0bb7\u0bbd\u0bc9\u0bd3\u0bd8\u0be5\u626fqual;\u6271ullEqual;\uc000\u2267\u0338reater;\uc000\u226b\u0338ess;\u6279lantEqual;\uc000\u2a7e\u0338ilde;\u6275ump\u0144\u0bf2\u0bfdownHump;\uc000\u224e\u0338qual;\uc000\u224f\u0338e\u0100fs\u0c0a\u0c27tTriangle\u0180;BE\u0c1a\u0c1b\u0c21\u62eaar;\uc000\u29cf\u0338qual;\u62ecs\u0300;EGLST\u0c35\u0c36\u0c3c\u0c44\u0c4b\u0c58\u626equal;\u6270reater;\u6278ess;\uc000\u226a\u0338lantEqual;\uc000\u2a7d\u0338ilde;\u6274ested\u0100GL\u0c68\u0c79reaterGreater;\uc000\u2aa2\u0338essLess;\uc000\u2aa1\u0338recedes\u0180;ES\u0c92\u0c93\u0c9b\u6280qual;\uc000\u2aaf\u0338lantEqual;\u62e0\u0100ei\u0cab\u0cb9verseElement;\u620cghtTriangle\u0180;BE\u0ccb\u0ccc\u0cd2\u62ebar;\uc000\u29d0\u0338qual;\u62ed\u0100qu\u0cdd\u0d0cuareSu\u0100bp\u0ce8\u0cf9set\u0100;E\u0cf0\u0cf3\uc000\u228f\u0338qual;\u62e2erset\u0100;E\u0d03\u0d06\uc000\u2290\u0338qual;\u62e3\u0180bcp\u0d13\u0d24\u0d4eset\u0100;E\u0d1b\u0d1e\uc000\u2282\u20d2qual;\u6288ceeds\u0200;EST\u0d32\u0d33\u0d3b\u0d46\u6281qual;\uc000\u2ab0\u0338lantEqual;\u62e1ilde;\uc000\u227f\u0338erset\u0100;E\u0d58\u0d5b\uc000\u2283\u20d2qual;\u6289ilde\u0200;EFT\u0d6e\u0d6f\u0d75\u0d7f\u6241qual;\u6244ullEqual;\u6247ilde;\u6249erticalBar;\u6224cr;\uc000\ud835\udca9ilde\u803b\xd1\u40d1;\u439d\u0700Eacdfgmoprstuv\u0dbd\u0dc2\u0dc9\u0dd5\u0ddb\u0de0\u0de7\u0dfc\u0e02\u0e20\u0e22\u0e32\u0e3f\u0e44lig;\u4152cute\u803b\xd3\u40d3\u0100iy\u0dce\u0dd3rc\u803b\xd4\u40d4;\u441eblac;\u4150r;\uc000\ud835\udd12rave\u803b\xd2\u40d2\u0180aei\u0dee\u0df2\u0df6cr;\u414cga;\u43a9cron;\u439fpf;\uc000\ud835\udd46enCurly\u0100DQ\u0e0e\u0e1aoubleQuote;\u601cuote;\u6018;\u6a54\u0100cl\u0e27\u0e2cr;\uc000\ud835\udcaaash\u803b\xd8\u40d8i\u016c\u0e37\u0e3cde\u803b\xd5\u40d5es;\u6a37ml\u803b\xd6\u40d6er\u0100BP\u0e4b\u0e60\u0100ar\u0e50\u0e53r;\u603eac\u0100ek\u0e5a\u0e5c;\u63deet;\u63b4arenthesis;\u63dc\u0480acfhilors\u0e7f\u0e87\u0e8a\u0e8f\u0e92\u0e94\u0e9d\u0eb0\u0efcrtialD;\u6202y;\u441fr;\uc000\ud835\udd13i;\u43a6;\u43a0usMinus;\u40b1\u0100ip\u0ea2\u0eadncareplan\xe5\u069df;\u6119\u0200;eio\u0eb9\u0eba\u0ee0\u0ee4\u6abbcedes\u0200;EST\u0ec8\u0ec9\u0ecf\u0eda\u627aqual;\u6aaflantEqual;\u627cilde;\u627eme;\u6033\u0100dp\u0ee9\u0eeeuct;\u620fortion\u0100;a\u0225\u0ef9l;\u621d\u0100ci\u0f01\u0f06r;\uc000\ud835\udcab;\u43a8\u0200Ufos\u0f11\u0f16\u0f1b\u0f1fOT\u803b"\u4022r;\uc000\ud835\udd14pf;\u611acr;\uc000\ud835\udcac\u0600BEacefhiorsu\u0f3e\u0f43\u0f47\u0f60\u0f73\u0fa7\u0faa\u0fad\u1096\u10a9\u10b4\u10bearr;\u6910G\u803b\xae\u40ae\u0180cnr\u0f4e\u0f53\u0f56ute;\u4154g;\u67ebr\u0100;t\u0f5c\u0f5d\u61a0l;\u6916\u0180aey\u0f67\u0f6c\u0f71ron;\u4158dil;\u4156;\u4420\u0100;v\u0f78\u0f79\u611cerse\u0100EU\u0f82\u0f99\u0100lq\u0f87\u0f8eement;\u620builibrium;\u61cbpEquilibrium;\u696fr\xbb\u0f79o;\u43a1ght\u0400ACDFTUVa\u0fc1\u0feb\u0ff3\u1022\u1028\u105b\u1087\u03d8\u0100nr\u0fc6\u0fd2gleBracket;\u67e9row\u0180;BL\u0fdc\u0fdd\u0fe1\u6192ar;\u61e5eftArrow;\u61c4eiling;\u6309o\u01f5\u0ff9\0\u1005bleBracket;\u67e7n\u01d4\u100a\0\u1014eeVector;\u695dector\u0100;B\u101d\u101e\u61c2ar;\u6955loor;\u630b\u0100er\u102d\u1043e\u0180;AV\u1035\u1036\u103c\u62a2rrow;\u61a6ector;\u695biangle\u0180;BE\u1050\u1051\u1055\u62b3ar;\u69d0qual;\u62b5p\u0180DTV\u1063\u106e\u1078ownVector;\u694feeVector;\u695cector\u0100;B\u1082\u1083\u61bear;\u6954ector\u0100;B\u1091\u1092\u61c0ar;\u6953\u0100pu\u109b\u109ef;\u611dndImplies;\u6970ightarrow;\u61db\u0100ch\u10b9\u10bcr;\u611b;\u61b1leDelayed;\u69f4\u0680HOacfhimoqstu\u10e4\u10f1\u10f7\u10fd\u1119\u111e\u1151\u1156\u1161\u1167\u11b5\u11bb\u11bf\u0100Cc\u10e9\u10eeHcy;\u4429y;\u4428FTcy;\u442ccute;\u415a\u0280;aeiy\u1108\u1109\u110e\u1113\u1117\u6abcron;\u4160dil;\u415erc;\u415c;\u4421r;\uc000\ud835\udd16ort\u0200DLRU\u112a\u1134\u113e\u1149ownArrow\xbb\u041eeftArrow\xbb\u089aightArrow\xbb\u0fddpArrow;\u6191gma;\u43a3allCircle;\u6218pf;\uc000\ud835\udd4a\u0272\u116d\0\0\u1170t;\u621aare\u0200;ISU\u117b\u117c\u1189\u11af\u65a1ntersection;\u6293u\u0100bp\u118f\u119eset\u0100;E\u1197\u1198\u628fqual;\u6291erset\u0100;E\u11a8\u11a9\u6290qual;\u6292nion;\u6294cr;\uc000\ud835\udcaear;\u62c6\u0200bcmp\u11c8\u11db\u1209\u120b\u0100;s\u11cd\u11ce\u62d0et\u0100;E\u11cd\u11d5qual;\u6286\u0100ch\u11e0\u1205eeds\u0200;EST\u11ed\u11ee\u11f4\u11ff\u627bqual;\u6ab0lantEqual;\u627dilde;\u627fTh\xe1\u0f8c;\u6211\u0180;es\u1212\u1213\u1223\u62d1rset\u0100;E\u121c\u121d\u6283qual;\u6287et\xbb\u1213\u0580HRSacfhiors\u123e\u1244\u1249\u1255\u125e\u1271\u1276\u129f\u12c2\u12c8\u12d1ORN\u803b\xde\u40deADE;\u6122\u0100Hc\u124e\u1252cy;\u440by;\u4426\u0100bu\u125a\u125c;\u4009;\u43a4\u0180aey\u1265\u126a\u126fron;\u4164dil;\u4162;\u4422r;\uc000\ud835\udd17\u0100ei\u127b\u1289\u01f2\u1280\0\u1287efore;\u6234a;\u4398\u0100cn\u128e\u1298kSpace;\uc000\u205f\u200aSpace;\u6009lde\u0200;EFT\u12ab\u12ac\u12b2\u12bc\u623cqual;\u6243ullEqual;\u6245ilde;\u6248pf;\uc000\ud835\udd4bipleDot;\u60db\u0100ct\u12d6\u12dbr;\uc000\ud835\udcafrok;\u4166\u0ae1\u12f7\u130e\u131a\u1326\0\u132c\u1331\0\0\0\0\0\u1338\u133d\u1377\u1385\0\u13ff\u1404\u140a\u1410\u0100cr\u12fb\u1301ute\u803b\xda\u40dar\u0100;o\u1307\u1308\u619fcir;\u6949r\u01e3\u1313\0\u1316y;\u440eve;\u416c\u0100iy\u131e\u1323rc\u803b\xdb\u40db;\u4423blac;\u4170r;\uc000\ud835\udd18rave\u803b\xd9\u40d9acr;\u416a\u0100di\u1341\u1369er\u0100BP\u1348\u135d\u0100ar\u134d\u1350r;\u405fac\u0100ek\u1357\u1359;\u63dfet;\u63b5arenthesis;\u63ddon\u0100;P\u1370\u1371\u62c3lus;\u628e\u0100gp\u137b\u137fon;\u4172f;\uc000\ud835\udd4c\u0400ADETadps\u1395\u13ae\u13b8\u13c4\u03e8\u13d2\u13d7\u13f3rrow\u0180;BD\u1150\u13a0\u13a4ar;\u6912ownArrow;\u61c5ownArrow;\u6195quilibrium;\u696eee\u0100;A\u13cb\u13cc\u62a5rrow;\u61a5own\xe1\u03f3er\u0100LR\u13de\u13e8eftArrow;\u6196ightArrow;\u6197i\u0100;l\u13f9\u13fa\u43d2on;\u43a5ing;\u416ecr;\uc000\ud835\udcb0ilde;\u4168ml\u803b\xdc\u40dc\u0480Dbcdefosv\u1427\u142c\u1430\u1433\u143e\u1485\u148a\u1490\u1496ash;\u62abar;\u6aeby;\u4412ash\u0100;l\u143b\u143c\u62a9;\u6ae6\u0100er\u1443\u1445;\u62c1\u0180bty\u144c\u1450\u147aar;\u6016\u0100;i\u144f\u1455cal\u0200BLST\u1461\u1465\u146a\u1474ar;\u6223ine;\u407ceparator;\u6758ilde;\u6240ThinSpace;\u600ar;\uc000\ud835\udd19pf;\uc000\ud835\udd4dcr;\uc000\ud835\udcb1dash;\u62aa\u0280cefos\u14a7\u14ac\u14b1\u14b6\u14bcirc;\u4174dge;\u62c0r;\uc000\ud835\udd1apf;\uc000\ud835\udd4ecr;\uc000\ud835\udcb2\u0200fios\u14cb\u14d0\u14d2\u14d8r;\uc000\ud835\udd1b;\u439epf;\uc000\ud835\udd4fcr;\uc000\ud835\udcb3\u0480AIUacfosu\u14f1\u14f5\u14f9\u14fd\u1504\u150f\u1514\u151a\u1520cy;\u442fcy;\u4407cy;\u442ecute\u803b\xdd\u40dd\u0100iy\u1509\u150drc;\u4176;\u442br;\uc000\ud835\udd1cpf;\uc000\ud835\udd50cr;\uc000\ud835\udcb4ml;\u4178\u0400Hacdefos\u1535\u1539\u153f\u154b\u154f\u155d\u1560\u1564cy;\u4416cute;\u4179\u0100ay\u1544\u1549ron;\u417d;\u4417ot;\u417b\u01f2\u1554\0\u155boWidt\xe8\u0ad9a;\u4396r;\u6128pf;\u6124cr;\uc000\ud835\udcb5\u0be1\u1583\u158a\u1590\0\u15b0\u15b6\u15bf\0\0\0\0\u15c6\u15db\u15eb\u165f\u166d\0\u1695\u169b\u16b2\u16b9\0\u16becute\u803b\xe1\u40e1reve;\u4103\u0300;Ediuy\u159c\u159d\u15a1\u15a3\u15a8\u15ad\u623e;\uc000\u223e\u0333;\u623frc\u803b\xe2\u40e2te\u80bb\xb4\u0306;\u4430lig\u803b\xe6\u40e6\u0100;r\xb2\u15ba;\uc000\ud835\udd1erave\u803b\xe0\u40e0\u0100ep\u15ca\u15d6\u0100fp\u15cf\u15d4sym;\u6135\xe8\u15d3ha;\u43b1\u0100ap\u15dfc\u0100cl\u15e4\u15e7r;\u4101g;\u6a3f\u0264\u15f0\0\0\u160a\u0280;adsv\u15fa\u15fb\u15ff\u1601\u1607\u6227nd;\u6a55;\u6a5clope;\u6a58;\u6a5a\u0380;elmrsz\u1618\u1619\u161b\u161e\u163f\u164f\u1659\u6220;\u69a4e\xbb\u1619sd\u0100;a\u1625\u1626\u6221\u0461\u1630\u1632\u1634\u1636\u1638\u163a\u163c\u163e;\u69a8;\u69a9;\u69aa;\u69ab;\u69ac;\u69ad;\u69ae;\u69aft\u0100;v\u1645\u1646\u621fb\u0100;d\u164c\u164d\u62be;\u699d\u0100pt\u1654\u1657h;\u6222\xbb\xb9arr;\u637c\u0100gp\u1663\u1667on;\u4105f;\uc000\ud835\udd52\u0380;Eaeiop\u12c1\u167b\u167d\u1682\u1684\u1687\u168a;\u6a70cir;\u6a6f;\u624ad;\u624bs;\u4027rox\u0100;e\u12c1\u1692\xf1\u1683ing\u803b\xe5\u40e5\u0180cty\u16a1\u16a6\u16a8r;\uc000\ud835\udcb6;\u402amp\u0100;e\u12c1\u16af\xf1\u0288ilde\u803b\xe3\u40e3ml\u803b\xe4\u40e4\u0100ci\u16c2\u16c8onin\xf4\u0272nt;\u6a11\u0800Nabcdefiklnoprsu\u16ed\u16f1\u1730\u173c\u1743\u1748\u1778\u177d\u17e0\u17e6\u1839\u1850\u170d\u193d\u1948\u1970ot;\u6aed\u0100cr\u16f6\u171ek\u0200ceps\u1700\u1705\u170d\u1713ong;\u624cpsilon;\u43f6rime;\u6035im\u0100;e\u171a\u171b\u623dq;\u62cd\u0176\u1722\u1726ee;\u62bded\u0100;g\u172c\u172d\u6305e\xbb\u172drk\u0100;t\u135c\u1737brk;\u63b6\u0100oy\u1701\u1741;\u4431quo;\u601e\u0280cmprt\u1753\u175b\u1761\u1764\u1768aus\u0100;e\u010a\u0109ptyv;\u69b0s\xe9\u170cno\xf5\u0113\u0180ahw\u176f\u1771\u1773;\u43b2;\u6136een;\u626cr;\uc000\ud835\udd1fg\u0380costuvw\u178d\u179d\u17b3\u17c1\u17d5\u17db\u17de\u0180aiu\u1794\u1796\u179a\xf0\u0760rc;\u65efp\xbb\u1371\u0180dpt\u17a4\u17a8\u17adot;\u6a00lus;\u6a01imes;\u6a02\u0271\u17b9\0\0\u17becup;\u6a06ar;\u6605riangle\u0100du\u17cd\u17d2own;\u65bdp;\u65b3plus;\u6a04e\xe5\u1444\xe5\u14adarow;\u690d\u0180ako\u17ed\u1826\u1835\u0100cn\u17f2\u1823k\u0180lst\u17fa\u05ab\u1802ozenge;\u69ebriangle\u0200;dlr\u1812\u1813\u1818\u181d\u65b4own;\u65beeft;\u65c2ight;\u65b8k;\u6423\u01b1\u182b\0\u1833\u01b2\u182f\0\u1831;\u6592;\u65914;\u6593ck;\u6588\u0100eo\u183e\u184d\u0100;q\u1843\u1846\uc000=\u20e5uiv;\uc000\u2261\u20e5t;\u6310\u0200ptwx\u1859\u185e\u1867\u186cf;\uc000\ud835\udd53\u0100;t\u13cb\u1863om\xbb\u13cctie;\u62c8\u0600DHUVbdhmptuv\u1885\u1896\u18aa\u18bb\u18d7\u18db\u18ec\u18ff\u1905\u190a\u1910\u1921\u0200LRlr\u188e\u1890\u1892\u1894;\u6557;\u6554;\u6556;\u6553\u0280;DUdu\u18a1\u18a2\u18a4\u18a6\u18a8\u6550;\u6566;\u6569;\u6564;\u6567\u0200LRlr\u18b3\u18b5\u18b7\u18b9;\u655d;\u655a;\u655c;\u6559\u0380;HLRhlr\u18ca\u18cb\u18cd\u18cf\u18d1\u18d3\u18d5\u6551;\u656c;\u6563;\u6560;\u656b;\u6562;\u655fox;\u69c9\u0200LRlr\u18e4\u18e6\u18e8\u18ea;\u6555;\u6552;\u6510;\u650c\u0280;DUdu\u06bd\u18f7\u18f9\u18fb\u18fd;\u6565;\u6568;\u652c;\u6534inus;\u629flus;\u629eimes;\u62a0\u0200LRlr\u1919\u191b\u191d\u191f;\u655b;\u6558;\u6518;\u6514\u0380;HLRhlr\u1930\u1931\u1933\u1935\u1937\u1939\u193b\u6502;\u656a;\u6561;\u655e;\u653c;\u6524;\u651c\u0100ev\u0123\u1942bar\u803b\xa6\u40a6\u0200ceio\u1951\u1956\u195a\u1960r;\uc000\ud835\udcb7mi;\u604fm\u0100;e\u171a\u171cl\u0180;bh\u1968\u1969\u196b\u405c;\u69c5sub;\u67c8\u016c\u1974\u197el\u0100;e\u1979\u197a\u6022t\xbb\u197ap\u0180;Ee\u012f\u1985\u1987;\u6aae\u0100;q\u06dc\u06db\u0ce1\u19a7\0\u19e8\u1a11\u1a15\u1a32\0\u1a37\u1a50\0\0\u1ab4\0\0\u1ac1\0\0\u1b21\u1b2e\u1b4d\u1b52\0\u1bfd\0\u1c0c\u0180cpr\u19ad\u19b2\u19ddute;\u4107\u0300;abcds\u19bf\u19c0\u19c4\u19ca\u19d5\u19d9\u6229nd;\u6a44rcup;\u6a49\u0100au\u19cf\u19d2p;\u6a4bp;\u6a47ot;\u6a40;\uc000\u2229\ufe00\u0100eo\u19e2\u19e5t;\u6041\xee\u0693\u0200aeiu\u19f0\u19fb\u1a01\u1a05\u01f0\u19f5\0\u19f8s;\u6a4don;\u410ddil\u803b\xe7\u40e7rc;\u4109ps\u0100;s\u1a0c\u1a0d\u6a4cm;\u6a50ot;\u410b\u0180dmn\u1a1b\u1a20\u1a26il\u80bb\xb8\u01adptyv;\u69b2t\u8100\xa2;e\u1a2d\u1a2e\u40a2r\xe4\u01b2r;\uc000\ud835\udd20\u0180cei\u1a3d\u1a40\u1a4dy;\u4447ck\u0100;m\u1a47\u1a48\u6713ark\xbb\u1a48;\u43c7r\u0380;Ecefms\u1a5f\u1a60\u1a62\u1a6b\u1aa4\u1aaa\u1aae\u65cb;\u69c3\u0180;el\u1a69\u1a6a\u1a6d\u42c6q;\u6257e\u0261\u1a74\0\0\u1a88rrow\u0100lr\u1a7c\u1a81eft;\u61baight;\u61bb\u0280RSacd\u1a92\u1a94\u1a96\u1a9a\u1a9f\xbb\u0f47;\u64c8st;\u629birc;\u629aash;\u629dnint;\u6a10id;\u6aefcir;\u69c2ubs\u0100;u\u1abb\u1abc\u6663it\xbb\u1abc\u02ec\u1ac7\u1ad4\u1afa\0\u1b0aon\u0100;e\u1acd\u1ace\u403a\u0100;q\xc7\xc6\u026d\u1ad9\0\0\u1ae2a\u0100;t\u1ade\u1adf\u402c;\u4040\u0180;fl\u1ae8\u1ae9\u1aeb\u6201\xee\u1160e\u0100mx\u1af1\u1af6ent\xbb\u1ae9e\xf3\u024d\u01e7\u1afe\0\u1b07\u0100;d\u12bb\u1b02ot;\u6a6dn\xf4\u0246\u0180fry\u1b10\u1b14\u1b17;\uc000\ud835\udd54o\xe4\u0254\u8100\xa9;s\u0155\u1b1dr;\u6117\u0100ao\u1b25\u1b29rr;\u61b5ss;\u6717\u0100cu\u1b32\u1b37r;\uc000\ud835\udcb8\u0100bp\u1b3c\u1b44\u0100;e\u1b41\u1b42\u6acf;\u6ad1\u0100;e\u1b49\u1b4a\u6ad0;\u6ad2dot;\u62ef\u0380delprvw\u1b60\u1b6c\u1b77\u1b82\u1bac\u1bd4\u1bf9arr\u0100lr\u1b68\u1b6a;\u6938;\u6935\u0270\u1b72\0\0\u1b75r;\u62dec;\u62dfarr\u0100;p\u1b7f\u1b80\u61b6;\u693d\u0300;bcdos\u1b8f\u1b90\u1b96\u1ba1\u1ba5\u1ba8\u622arcap;\u6a48\u0100au\u1b9b\u1b9ep;\u6a46p;\u6a4aot;\u628dr;\u6a45;\uc000\u222a\ufe00\u0200alrv\u1bb5\u1bbf\u1bde\u1be3rr\u0100;m\u1bbc\u1bbd\u61b7;\u693cy\u0180evw\u1bc7\u1bd4\u1bd8q\u0270\u1bce\0\0\u1bd2re\xe3\u1b73u\xe3\u1b75ee;\u62ceedge;\u62cfen\u803b\xa4\u40a4earrow\u0100lr\u1bee\u1bf3eft\xbb\u1b80ight\xbb\u1bbde\xe4\u1bdd\u0100ci\u1c01\u1c07onin\xf4\u01f7nt;\u6231lcty;\u632d\u0980AHabcdefhijlorstuwz\u1c38\u1c3b\u1c3f\u1c5d\u1c69\u1c75\u1c8a\u1c9e\u1cac\u1cb7\u1cfb\u1cff\u1d0d\u1d7b\u1d91\u1dab\u1dbb\u1dc6\u1dcdr\xf2\u0381ar;\u6965\u0200glrs\u1c48\u1c4d\u1c52\u1c54ger;\u6020eth;\u6138\xf2\u1133h\u0100;v\u1c5a\u1c5b\u6010\xbb\u090a\u016b\u1c61\u1c67arow;\u690fa\xe3\u0315\u0100ay\u1c6e\u1c73ron;\u410f;\u4434\u0180;ao\u0332\u1c7c\u1c84\u0100gr\u02bf\u1c81r;\u61catseq;\u6a77\u0180glm\u1c91\u1c94\u1c98\u803b\xb0\u40b0ta;\u43b4ptyv;\u69b1\u0100ir\u1ca3\u1ca8sht;\u697f;\uc000\ud835\udd21ar\u0100lr\u1cb3\u1cb5\xbb\u08dc\xbb\u101e\u0280aegsv\u1cc2\u0378\u1cd6\u1cdc\u1ce0m\u0180;os\u0326\u1cca\u1cd4nd\u0100;s\u0326\u1cd1uit;\u6666amma;\u43ddin;\u62f2\u0180;io\u1ce7\u1ce8\u1cf8\u40f7de\u8100\xf7;o\u1ce7\u1cf0ntimes;\u62c7n\xf8\u1cf7cy;\u4452c\u026f\u1d06\0\0\u1d0arn;\u631eop;\u630d\u0280lptuw\u1d18\u1d1d\u1d22\u1d49\u1d55lar;\u4024f;\uc000\ud835\udd55\u0280;emps\u030b\u1d2d\u1d37\u1d3d\u1d42q\u0100;d\u0352\u1d33ot;\u6251inus;\u6238lus;\u6214quare;\u62a1blebarwedg\xe5\xfan\u0180adh\u112e\u1d5d\u1d67ownarrow\xf3\u1c83arpoon\u0100lr\u1d72\u1d76ef\xf4\u1cb4igh\xf4\u1cb6\u0162\u1d7f\u1d85karo\xf7\u0f42\u026f\u1d8a\0\0\u1d8ern;\u631fop;\u630c\u0180cot\u1d98\u1da3\u1da6\u0100ry\u1d9d\u1da1;\uc000\ud835\udcb9;\u4455l;\u69f6rok;\u4111\u0100dr\u1db0\u1db4ot;\u62f1i\u0100;f\u1dba\u1816\u65bf\u0100ah\u1dc0\u1dc3r\xf2\u0429a\xf2\u0fa6angle;\u69a6\u0100ci\u1dd2\u1dd5y;\u445fgrarr;\u67ff\u0900Dacdefglmnopqrstux\u1e01\u1e09\u1e19\u1e38\u0578\u1e3c\u1e49\u1e61\u1e7e\u1ea5\u1eaf\u1ebd\u1ee1\u1f2a\u1f37\u1f44\u1f4e\u1f5a\u0100Do\u1e06\u1d34o\xf4\u1c89\u0100cs\u1e0e\u1e14ute\u803b\xe9\u40e9ter;\u6a6e\u0200aioy\u1e22\u1e27\u1e31\u1e36ron;\u411br\u0100;c\u1e2d\u1e2e\u6256\u803b\xea\u40ealon;\u6255;\u444dot;\u4117\u0100Dr\u1e41\u1e45ot;\u6252;\uc000\ud835\udd22\u0180;rs\u1e50\u1e51\u1e57\u6a9aave\u803b\xe8\u40e8\u0100;d\u1e5c\u1e5d\u6a96ot;\u6a98\u0200;ils\u1e6a\u1e6b\u1e72\u1e74\u6a99nters;\u63e7;\u6113\u0100;d\u1e79\u1e7a\u6a95ot;\u6a97\u0180aps\u1e85\u1e89\u1e97cr;\u4113ty\u0180;sv\u1e92\u1e93\u1e95\u6205et\xbb\u1e93p\u01001;\u1e9d\u1ea4\u0133\u1ea1\u1ea3;\u6004;\u6005\u6003\u0100gs\u1eaa\u1eac;\u414bp;\u6002\u0100gp\u1eb4\u1eb8on;\u4119f;\uc000\ud835\udd56\u0180als\u1ec4\u1ece\u1ed2r\u0100;s\u1eca\u1ecb\u62d5l;\u69e3us;\u6a71i\u0180;lv\u1eda\u1edb\u1edf\u43b5on\xbb\u1edb;\u43f5\u0200csuv\u1eea\u1ef3\u1f0b\u1f23\u0100io\u1eef\u1e31rc\xbb\u1e2e\u0269\u1ef9\0\0\u1efb\xed\u0548ant\u0100gl\u1f02\u1f06tr\xbb\u1e5dess\xbb\u1e7a\u0180aei\u1f12\u1f16\u1f1als;\u403dst;\u625fv\u0100;D\u0235\u1f20D;\u6a78parsl;\u69e5\u0100Da\u1f2f\u1f33ot;\u6253rr;\u6971\u0180cdi\u1f3e\u1f41\u1ef8r;\u612fo\xf4\u0352\u0100ah\u1f49\u1f4b;\u43b7\u803b\xf0\u40f0\u0100mr\u1f53\u1f57l\u803b\xeb\u40ebo;\u60ac\u0180cip\u1f61\u1f64\u1f67l;\u4021s\xf4\u056e\u0100eo\u1f6c\u1f74ctatio\xee\u0559nential\xe5\u0579\u09e1\u1f92\0\u1f9e\0\u1fa1\u1fa7\0\0\u1fc6\u1fcc\0\u1fd3\0\u1fe6\u1fea\u2000\0\u2008\u205allingdotse\xf1\u1e44y;\u4444male;\u6640\u0180ilr\u1fad\u1fb3\u1fc1lig;\u8000\ufb03\u0269\u1fb9\0\0\u1fbdg;\u8000\ufb00ig;\u8000\ufb04;\uc000\ud835\udd23lig;\u8000\ufb01lig;\uc000fj\u0180alt\u1fd9\u1fdc\u1fe1t;\u666dig;\u8000\ufb02ns;\u65b1of;\u4192\u01f0\u1fee\0\u1ff3f;\uc000\ud835\udd57\u0100ak\u05bf\u1ff7\u0100;v\u1ffc\u1ffd\u62d4;\u6ad9artint;\u6a0d\u0100ao\u200c\u2055\u0100cs\u2011\u2052\u03b1\u201a\u2030\u2038\u2045\u2048\0\u2050\u03b2\u2022\u2025\u2027\u202a\u202c\0\u202e\u803b\xbd\u40bd;\u6153\u803b\xbc\u40bc;\u6155;\u6159;\u615b\u01b3\u2034\0\u2036;\u6154;\u6156\u02b4\u203e\u2041\0\0\u2043\u803b\xbe\u40be;\u6157;\u615c5;\u6158\u01b6\u204c\0\u204e;\u615a;\u615d8;\u615el;\u6044wn;\u6322cr;\uc000\ud835\udcbb\u0880Eabcdefgijlnorstv\u2082\u2089\u209f\u20a5\u20b0\u20b4\u20f0\u20f5\u20fa\u20ff\u2103\u2112\u2138\u0317\u213e\u2152\u219e\u0100;l\u064d\u2087;\u6a8c\u0180cmp\u2090\u2095\u209dute;\u41f5ma\u0100;d\u209c\u1cda\u43b3;\u6a86reve;\u411f\u0100iy\u20aa\u20aerc;\u411d;\u4433ot;\u4121\u0200;lqs\u063e\u0642\u20bd\u20c9\u0180;qs\u063e\u064c\u20c4lan\xf4\u0665\u0200;cdl\u0665\u20d2\u20d5\u20e5c;\u6aa9ot\u0100;o\u20dc\u20dd\u6a80\u0100;l\u20e2\u20e3\u6a82;\u6a84\u0100;e\u20ea\u20ed\uc000\u22db\ufe00s;\u6a94r;\uc000\ud835\udd24\u0100;g\u0673\u061bmel;\u6137cy;\u4453\u0200;Eaj\u065a\u210c\u210e\u2110;\u6a92;\u6aa5;\u6aa4\u0200Eaes\u211b\u211d\u2129\u2134;\u6269p\u0100;p\u2123\u2124\u6a8arox\xbb\u2124\u0100;q\u212e\u212f\u6a88\u0100;q\u212e\u211bim;\u62e7pf;\uc000\ud835\udd58\u0100ci\u2143\u2146r;\u610am\u0180;el\u066b\u214e\u2150;\u6a8e;\u6a90\u8300>;cdlqr\u05ee\u2160\u216a\u216e\u2173\u2179\u0100ci\u2165\u2167;\u6aa7r;\u6a7aot;\u62d7Par;\u6995uest;\u6a7c\u0280adels\u2184\u216a\u2190\u0656\u219b\u01f0\u2189\0\u218epro\xf8\u209er;\u6978q\u0100lq\u063f\u2196les\xf3\u2088i\xed\u066b\u0100en\u21a3\u21adrtneqq;\uc000\u2269\ufe00\xc5\u21aa\u0500Aabcefkosy\u21c4\u21c7\u21f1\u21f5\u21fa\u2218\u221d\u222f\u2268\u227dr\xf2\u03a0\u0200ilmr\u21d0\u21d4\u21d7\u21dbrs\xf0\u1484f\xbb\u2024il\xf4\u06a9\u0100dr\u21e0\u21e4cy;\u444a\u0180;cw\u08f4\u21eb\u21efir;\u6948;\u61adar;\u610firc;\u4125\u0180alr\u2201\u220e\u2213rts\u0100;u\u2209\u220a\u6665it\xbb\u220alip;\u6026con;\u62b9r;\uc000\ud835\udd25s\u0100ew\u2223\u2229arow;\u6925arow;\u6926\u0280amopr\u223a\u223e\u2243\u225e\u2263rr;\u61fftht;\u623bk\u0100lr\u2249\u2253eftarrow;\u61a9ightarrow;\u61aaf;\uc000\ud835\udd59bar;\u6015\u0180clt\u226f\u2274\u2278r;\uc000\ud835\udcbdas\xe8\u21f4rok;\u4127\u0100bp\u2282\u2287ull;\u6043hen\xbb\u1c5b\u0ae1\u22a3\0\u22aa\0\u22b8\u22c5\u22ce\0\u22d5\u22f3\0\0\u22f8\u2322\u2367\u2362\u237f\0\u2386\u23aa\u23b4cute\u803b\xed\u40ed\u0180;iy\u0771\u22b0\u22b5rc\u803b\xee\u40ee;\u4438\u0100cx\u22bc\u22bfy;\u4435cl\u803b\xa1\u40a1\u0100fr\u039f\u22c9;\uc000\ud835\udd26rave\u803b\xec\u40ec\u0200;ino\u073e\u22dd\u22e9\u22ee\u0100in\u22e2\u22e6nt;\u6a0ct;\u622dfin;\u69dcta;\u6129lig;\u4133\u0180aop\u22fe\u231a\u231d\u0180cgt\u2305\u2308\u2317r;\u412b\u0180elp\u071f\u230f\u2313in\xe5\u078ear\xf4\u0720h;\u4131f;\u62b7ed;\u41b5\u0280;cfot\u04f4\u232c\u2331\u233d\u2341are;\u6105in\u0100;t\u2338\u2339\u621eie;\u69dddo\xf4\u2319\u0280;celp\u0757\u234c\u2350\u235b\u2361al;\u62ba\u0100gr\u2355\u2359er\xf3\u1563\xe3\u234darhk;\u6a17rod;\u6a3c\u0200cgpt\u236f\u2372\u2376\u237by;\u4451on;\u412ff;\uc000\ud835\udd5aa;\u43b9uest\u803b\xbf\u40bf\u0100ci\u238a\u238fr;\uc000\ud835\udcben\u0280;Edsv\u04f4\u239b\u239d\u23a1\u04f3;\u62f9ot;\u62f5\u0100;v\u23a6\u23a7\u62f4;\u62f3\u0100;i\u0777\u23aelde;\u4129\u01eb\u23b8\0\u23bccy;\u4456l\u803b\xef\u40ef\u0300cfmosu\u23cc\u23d7\u23dc\u23e1\u23e7\u23f5\u0100iy\u23d1\u23d5rc;\u4135;\u4439r;\uc000\ud835\udd27ath;\u4237pf;\uc000\ud835\udd5b\u01e3\u23ec\0\u23f1r;\uc000\ud835\udcbfrcy;\u4458kcy;\u4454\u0400acfghjos\u240b\u2416\u2422\u2427\u242d\u2431\u2435\u243bppa\u0100;v\u2413\u2414\u43ba;\u43f0\u0100ey\u241b\u2420dil;\u4137;\u443ar;\uc000\ud835\udd28reen;\u4138cy;\u4445cy;\u445cpf;\uc000\ud835\udd5ccr;\uc000\ud835\udcc0\u0b80ABEHabcdefghjlmnoprstuv\u2470\u2481\u2486\u248d\u2491\u250e\u253d\u255a\u2580\u264e\u265e\u2665\u2679\u267d\u269a\u26b2\u26d8\u275d\u2768\u278b\u27c0\u2801\u2812\u0180art\u2477\u247a\u247cr\xf2\u09c6\xf2\u0395ail;\u691barr;\u690e\u0100;g\u0994\u248b;\u6a8bar;\u6962\u0963\u24a5\0\u24aa\0\u24b1\0\0\0\0\0\u24b5\u24ba\0\u24c6\u24c8\u24cd\0\u24f9ute;\u413amptyv;\u69b4ra\xee\u084cbda;\u43bbg\u0180;dl\u088e\u24c1\u24c3;\u6991\xe5\u088e;\u6a85uo\u803b\xab\u40abr\u0400;bfhlpst\u0899\u24de\u24e6\u24e9\u24eb\u24ee\u24f1\u24f5\u0100;f\u089d\u24e3s;\u691fs;\u691d\xeb\u2252p;\u61abl;\u6939im;\u6973l;\u61a2\u0180;ae\u24ff\u2500\u2504\u6aabil;\u6919\u0100;s\u2509\u250a\u6aad;\uc000\u2aad\ufe00\u0180abr\u2515\u2519\u251drr;\u690crk;\u6772\u0100ak\u2522\u252cc\u0100ek\u2528\u252a;\u407b;\u405b\u0100es\u2531\u2533;\u698bl\u0100du\u2539\u253b;\u698f;\u698d\u0200aeuy\u2546\u254b\u2556\u2558ron;\u413e\u0100di\u2550\u2554il;\u413c\xec\u08b0\xe2\u2529;\u443b\u0200cqrs\u2563\u2566\u256d\u257da;\u6936uo\u0100;r\u0e19\u1746\u0100du\u2572\u2577har;\u6967shar;\u694bh;\u61b2\u0280;fgqs\u258b\u258c\u0989\u25f3\u25ff\u6264t\u0280ahlrt\u2598\u25a4\u25b7\u25c2\u25e8rrow\u0100;t\u0899\u25a1a\xe9\u24f6arpoon\u0100du\u25af\u25b4own\xbb\u045ap\xbb\u0966eftarrows;\u61c7ight\u0180ahs\u25cd\u25d6\u25derrow\u0100;s\u08f4\u08a7arpoon\xf3\u0f98quigarro\xf7\u21f0hreetimes;\u62cb\u0180;qs\u258b\u0993\u25falan\xf4\u09ac\u0280;cdgs\u09ac\u260a\u260d\u261d\u2628c;\u6aa8ot\u0100;o\u2614\u2615\u6a7f\u0100;r\u261a\u261b\u6a81;\u6a83\u0100;e\u2622\u2625\uc000\u22da\ufe00s;\u6a93\u0280adegs\u2633\u2639\u263d\u2649\u264bppro\xf8\u24c6ot;\u62d6q\u0100gq\u2643\u2645\xf4\u0989gt\xf2\u248c\xf4\u099bi\xed\u09b2\u0180ilr\u2655\u08e1\u265asht;\u697c;\uc000\ud835\udd29\u0100;E\u099c\u2663;\u6a91\u0161\u2669\u2676r\u0100du\u25b2\u266e\u0100;l\u0965\u2673;\u696alk;\u6584cy;\u4459\u0280;acht\u0a48\u2688\u268b\u2691\u2696r\xf2\u25c1orne\xf2\u1d08ard;\u696bri;\u65fa\u0100io\u269f\u26a4dot;\u4140ust\u0100;a\u26ac\u26ad\u63b0che\xbb\u26ad\u0200Eaes\u26bb\u26bd\u26c9\u26d4;\u6268p\u0100;p\u26c3\u26c4\u6a89rox\xbb\u26c4\u0100;q\u26ce\u26cf\u6a87\u0100;q\u26ce\u26bbim;\u62e6\u0400abnoptwz\u26e9\u26f4\u26f7\u271a\u272f\u2741\u2747\u2750\u0100nr\u26ee\u26f1g;\u67ecr;\u61fdr\xeb\u08c1g\u0180lmr\u26ff\u270d\u2714eft\u0100ar\u09e6\u2707ight\xe1\u09f2apsto;\u67fcight\xe1\u09fdparrow\u0100lr\u2725\u2729ef\xf4\u24edight;\u61ac\u0180afl\u2736\u2739\u273dr;\u6985;\uc000\ud835\udd5dus;\u6a2dimes;\u6a34\u0161\u274b\u274fst;\u6217\xe1\u134e\u0180;ef\u2757\u2758\u1800\u65cange\xbb\u2758ar\u0100;l\u2764\u2765\u4028t;\u6993\u0280achmt\u2773\u2776\u277c\u2785\u2787r\xf2\u08a8orne\xf2\u1d8car\u0100;d\u0f98\u2783;\u696d;\u600eri;\u62bf\u0300achiqt\u2798\u279d\u0a40\u27a2\u27ae\u27bbquo;\u6039r;\uc000\ud835\udcc1m\u0180;eg\u09b2\u27aa\u27ac;\u6a8d;\u6a8f\u0100bu\u252a\u27b3o\u0100;r\u0e1f\u27b9;\u601arok;\u4142\u8400<;cdhilqr\u082b\u27d2\u2639\u27dc\u27e0\u27e5\u27ea\u27f0\u0100ci\u27d7\u27d9;\u6aa6r;\u6a79re\xe5\u25f2mes;\u62c9arr;\u6976uest;\u6a7b\u0100Pi\u27f5\u27f9ar;\u6996\u0180;ef\u2800\u092d\u181b\u65c3r\u0100du\u2807\u280dshar;\u694ahar;\u6966\u0100en\u2817\u2821rtneqq;\uc000\u2268\ufe00\xc5\u281e\u0700Dacdefhilnopsu\u2840\u2845\u2882\u288e\u2893\u28a0\u28a5\u28a8\u28da\u28e2\u28e4\u0a83\u28f3\u2902Dot;\u623a\u0200clpr\u284e\u2852\u2863\u287dr\u803b\xaf\u40af\u0100et\u2857\u2859;\u6642\u0100;e\u285e\u285f\u6720se\xbb\u285f\u0100;s\u103b\u2868to\u0200;dlu\u103b\u2873\u2877\u287bow\xee\u048cef\xf4\u090f\xf0\u13d1ker;\u65ae\u0100oy\u2887\u288cmma;\u6a29;\u443cash;\u6014asuredangle\xbb\u1626r;\uc000\ud835\udd2ao;\u6127\u0180cdn\u28af\u28b4\u28c9ro\u803b\xb5\u40b5\u0200;acd\u1464\u28bd\u28c0\u28c4s\xf4\u16a7ir;\u6af0ot\u80bb\xb7\u01b5us\u0180;bd\u28d2\u1903\u28d3\u6212\u0100;u\u1d3c\u28d8;\u6a2a\u0163\u28de\u28e1p;\u6adb\xf2\u2212\xf0\u0a81\u0100dp\u28e9\u28eeels;\u62a7f;\uc000\ud835\udd5e\u0100ct\u28f8\u28fdr;\uc000\ud835\udcc2pos\xbb\u159d\u0180;lm\u2909\u290a\u290d\u43bctimap;\u62b8\u0c00GLRVabcdefghijlmoprstuvw\u2942\u2953\u297e\u2989\u2998\u29da\u29e9\u2a15\u2a1a\u2a58\u2a5d\u2a83\u2a95\u2aa4\u2aa8\u2b04\u2b07\u2b44\u2b7f\u2bae\u2c34\u2c67\u2c7c\u2ce9\u0100gt\u2947\u294b;\uc000\u22d9\u0338\u0100;v\u2950\u0bcf\uc000\u226b\u20d2\u0180elt\u295a\u2972\u2976ft\u0100ar\u2961\u2967rrow;\u61cdightarrow;\u61ce;\uc000\u22d8\u0338\u0100;v\u297b\u0c47\uc000\u226a\u20d2ightarrow;\u61cf\u0100Dd\u298e\u2993ash;\u62afash;\u62ae\u0280bcnpt\u29a3\u29a7\u29ac\u29b1\u29ccla\xbb\u02deute;\u4144g;\uc000\u2220\u20d2\u0280;Eiop\u0d84\u29bc\u29c0\u29c5\u29c8;\uc000\u2a70\u0338d;\uc000\u224b\u0338s;\u4149ro\xf8\u0d84ur\u0100;a\u29d3\u29d4\u666el\u0100;s\u29d3\u0b38\u01f3\u29df\0\u29e3p\u80bb\xa0\u0b37mp\u0100;e\u0bf9\u0c00\u0280aeouy\u29f4\u29fe\u2a03\u2a10\u2a13\u01f0\u29f9\0\u29fb;\u6a43on;\u4148dil;\u4146ng\u0100;d\u0d7e\u2a0aot;\uc000\u2a6d\u0338p;\u6a42;\u443dash;\u6013\u0380;Aadqsx\u0b92\u2a29\u2a2d\u2a3b\u2a41\u2a45\u2a50rr;\u61d7r\u0100hr\u2a33\u2a36k;\u6924\u0100;o\u13f2\u13f0ot;\uc000\u2250\u0338ui\xf6\u0b63\u0100ei\u2a4a\u2a4ear;\u6928\xed\u0b98ist\u0100;s\u0ba0\u0b9fr;\uc000\ud835\udd2b\u0200Eest\u0bc5\u2a66\u2a79\u2a7c\u0180;qs\u0bbc\u2a6d\u0be1\u0180;qs\u0bbc\u0bc5\u2a74lan\xf4\u0be2i\xed\u0bea\u0100;r\u0bb6\u2a81\xbb\u0bb7\u0180Aap\u2a8a\u2a8d\u2a91r\xf2\u2971rr;\u61aear;\u6af2\u0180;sv\u0f8d\u2a9c\u0f8c\u0100;d\u2aa1\u2aa2\u62fc;\u62facy;\u445a\u0380AEadest\u2ab7\u2aba\u2abe\u2ac2\u2ac5\u2af6\u2af9r\xf2\u2966;\uc000\u2266\u0338rr;\u619ar;\u6025\u0200;fqs\u0c3b\u2ace\u2ae3\u2aeft\u0100ar\u2ad4\u2ad9rro\xf7\u2ac1ightarro\xf7\u2a90\u0180;qs\u0c3b\u2aba\u2aealan\xf4\u0c55\u0100;s\u0c55\u2af4\xbb\u0c36i\xed\u0c5d\u0100;r\u0c35\u2afei\u0100;e\u0c1a\u0c25i\xe4\u0d90\u0100pt\u2b0c\u2b11f;\uc000\ud835\udd5f\u8180\xac;in\u2b19\u2b1a\u2b36\u40acn\u0200;Edv\u0b89\u2b24\u2b28\u2b2e;\uc000\u22f9\u0338ot;\uc000\u22f5\u0338\u01e1\u0b89\u2b33\u2b35;\u62f7;\u62f6i\u0100;v\u0cb8\u2b3c\u01e1\u0cb8\u2b41\u2b43;\u62fe;\u62fd\u0180aor\u2b4b\u2b63\u2b69r\u0200;ast\u0b7b\u2b55\u2b5a\u2b5flle\xec\u0b7bl;\uc000\u2afd\u20e5;\uc000\u2202\u0338lint;\u6a14\u0180;ce\u0c92\u2b70\u2b73u\xe5\u0ca5\u0100;c\u0c98\u2b78\u0100;e\u0c92\u2b7d\xf1\u0c98\u0200Aait\u2b88\u2b8b\u2b9d\u2ba7r\xf2\u2988rr\u0180;cw\u2b94\u2b95\u2b99\u619b;\uc000\u2933\u0338;\uc000\u219d\u0338ghtarrow\xbb\u2b95ri\u0100;e\u0ccb\u0cd6\u0380chimpqu\u2bbd\u2bcd\u2bd9\u2b04\u0b78\u2be4\u2bef\u0200;cer\u0d32\u2bc6\u0d37\u2bc9u\xe5\u0d45;\uc000\ud835\udcc3ort\u026d\u2b05\0\0\u2bd6ar\xe1\u2b56m\u0100;e\u0d6e\u2bdf\u0100;q\u0d74\u0d73su\u0100bp\u2beb\u2bed\xe5\u0cf8\xe5\u0d0b\u0180bcp\u2bf6\u2c11\u2c19\u0200;Ees\u2bff\u2c00\u0d22\u2c04\u6284;\uc000\u2ac5\u0338et\u0100;e\u0d1b\u2c0bq\u0100;q\u0d23\u2c00c\u0100;e\u0d32\u2c17\xf1\u0d38\u0200;Ees\u2c22\u2c23\u0d5f\u2c27\u6285;\uc000\u2ac6\u0338et\u0100;e\u0d58\u2c2eq\u0100;q\u0d60\u2c23\u0200gilr\u2c3d\u2c3f\u2c45\u2c47\xec\u0bd7lde\u803b\xf1\u40f1\xe7\u0c43iangle\u0100lr\u2c52\u2c5ceft\u0100;e\u0c1a\u2c5a\xf1\u0c26ight\u0100;e\u0ccb\u2c65\xf1\u0cd7\u0100;m\u2c6c\u2c6d\u43bd\u0180;es\u2c74\u2c75\u2c79\u4023ro;\u6116p;\u6007\u0480DHadgilrs\u2c8f\u2c94\u2c99\u2c9e\u2ca3\u2cb0\u2cb6\u2cd3\u2ce3ash;\u62adarr;\u6904p;\uc000\u224d\u20d2ash;\u62ac\u0100et\u2ca8\u2cac;\uc000\u2265\u20d2;\uc000>\u20d2nfin;\u69de\u0180Aet\u2cbd\u2cc1\u2cc5rr;\u6902;\uc000\u2264\u20d2\u0100;r\u2cca\u2ccd\uc000<\u20d2ie;\uc000\u22b4\u20d2\u0100At\u2cd8\u2cdcrr;\u6903rie;\uc000\u22b5\u20d2im;\uc000\u223c\u20d2\u0180Aan\u2cf0\u2cf4\u2d02rr;\u61d6r\u0100hr\u2cfa\u2cfdk;\u6923\u0100;o\u13e7\u13e5ear;\u6927\u1253\u1a95\0\0\0\0\0\0\0\0\0\0\0\0\0\u2d2d\0\u2d38\u2d48\u2d60\u2d65\u2d72\u2d84\u1b07\0\0\u2d8d\u2dab\0\u2dc8\u2dce\0\u2ddc\u2e19\u2e2b\u2e3e\u2e43\u0100cs\u2d31\u1a97ute\u803b\xf3\u40f3\u0100iy\u2d3c\u2d45r\u0100;c\u1a9e\u2d42\u803b\xf4\u40f4;\u443e\u0280abios\u1aa0\u2d52\u2d57\u01c8\u2d5alac;\u4151v;\u6a38old;\u69bclig;\u4153\u0100cr\u2d69\u2d6dir;\u69bf;\uc000\ud835\udd2c\u036f\u2d79\0\0\u2d7c\0\u2d82n;\u42dbave\u803b\xf2\u40f2;\u69c1\u0100bm\u2d88\u0df4ar;\u69b5\u0200acit\u2d95\u2d98\u2da5\u2da8r\xf2\u1a80\u0100ir\u2d9d\u2da0r;\u69beoss;\u69bbn\xe5\u0e52;\u69c0\u0180aei\u2db1\u2db5\u2db9cr;\u414dga;\u43c9\u0180cdn\u2dc0\u2dc5\u01cdron;\u43bf;\u69b6pf;\uc000\ud835\udd60\u0180ael\u2dd4\u2dd7\u01d2r;\u69b7rp;\u69b9\u0380;adiosv\u2dea\u2deb\u2dee\u2e08\u2e0d\u2e10\u2e16\u6228r\xf2\u1a86\u0200;efm\u2df7\u2df8\u2e02\u2e05\u6a5dr\u0100;o\u2dfe\u2dff\u6134f\xbb\u2dff\u803b\xaa\u40aa\u803b\xba\u40bagof;\u62b6r;\u6a56lope;\u6a57;\u6a5b\u0180clo\u2e1f\u2e21\u2e27\xf2\u2e01ash\u803b\xf8\u40f8l;\u6298i\u016c\u2e2f\u2e34de\u803b\xf5\u40f5es\u0100;a\u01db\u2e3as;\u6a36ml\u803b\xf6\u40f6bar;\u633d\u0ae1\u2e5e\0\u2e7d\0\u2e80\u2e9d\0\u2ea2\u2eb9\0\0\u2ecb\u0e9c\0\u2f13\0\0\u2f2b\u2fbc\0\u2fc8r\u0200;ast\u0403\u2e67\u2e72\u0e85\u8100\xb6;l\u2e6d\u2e6e\u40b6le\xec\u0403\u0269\u2e78\0\0\u2e7bm;\u6af3;\u6afdy;\u443fr\u0280cimpt\u2e8b\u2e8f\u2e93\u1865\u2e97nt;\u4025od;\u402eil;\u6030enk;\u6031r;\uc000\ud835\udd2d\u0180imo\u2ea8\u2eb0\u2eb4\u0100;v\u2ead\u2eae\u43c6;\u43d5ma\xf4\u0a76ne;\u660e\u0180;tv\u2ebf\u2ec0\u2ec8\u43c0chfork\xbb\u1ffd;\u43d6\u0100au\u2ecf\u2edfn\u0100ck\u2ed5\u2eddk\u0100;h\u21f4\u2edb;\u610e\xf6\u21f4s\u0480;abcdemst\u2ef3\u2ef4\u1908\u2ef9\u2efd\u2f04\u2f06\u2f0a\u2f0e\u402bcir;\u6a23ir;\u6a22\u0100ou\u1d40\u2f02;\u6a25;\u6a72n\u80bb\xb1\u0e9dim;\u6a26wo;\u6a27\u0180ipu\u2f19\u2f20\u2f25ntint;\u6a15f;\uc000\ud835\udd61nd\u803b\xa3\u40a3\u0500;Eaceinosu\u0ec8\u2f3f\u2f41\u2f44\u2f47\u2f81\u2f89\u2f92\u2f7e\u2fb6;\u6ab3p;\u6ab7u\xe5\u0ed9\u0100;c\u0ece\u2f4c\u0300;acens\u0ec8\u2f59\u2f5f\u2f66\u2f68\u2f7eppro\xf8\u2f43urlye\xf1\u0ed9\xf1\u0ece\u0180aes\u2f6f\u2f76\u2f7approx;\u6ab9qq;\u6ab5im;\u62e8i\xed\u0edfme\u0100;s\u2f88\u0eae\u6032\u0180Eas\u2f78\u2f90\u2f7a\xf0\u2f75\u0180dfp\u0eec\u2f99\u2faf\u0180als\u2fa0\u2fa5\u2faalar;\u632eine;\u6312urf;\u6313\u0100;t\u0efb\u2fb4\xef\u0efbrel;\u62b0\u0100ci\u2fc0\u2fc5r;\uc000\ud835\udcc5;\u43c8ncsp;\u6008\u0300fiopsu\u2fda\u22e2\u2fdf\u2fe5\u2feb\u2ff1r;\uc000\ud835\udd2epf;\uc000\ud835\udd62rime;\u6057cr;\uc000\ud835\udcc6\u0180aeo\u2ff8\u3009\u3013t\u0100ei\u2ffe\u3005rnion\xf3\u06b0nt;\u6a16st\u0100;e\u3010\u3011\u403f\xf1\u1f19\xf4\u0f14\u0a80ABHabcdefhilmnoprstux\u3040\u3051\u3055\u3059\u30e0\u310e\u312b\u3147\u3162\u3172\u318e\u3206\u3215\u3224\u3229\u3258\u326e\u3272\u3290\u32b0\u32b7\u0180art\u3047\u304a\u304cr\xf2\u10b3\xf2\u03ddail;\u691car\xf2\u1c65ar;\u6964\u0380cdenqrt\u3068\u3075\u3078\u307f\u308f\u3094\u30cc\u0100eu\u306d\u3071;\uc000\u223d\u0331te;\u4155i\xe3\u116emptyv;\u69b3g\u0200;del\u0fd1\u3089\u308b\u308d;\u6992;\u69a5\xe5\u0fd1uo\u803b\xbb\u40bbr\u0580;abcfhlpstw\u0fdc\u30ac\u30af\u30b7\u30b9\u30bc\u30be\u30c0\u30c3\u30c7\u30cap;\u6975\u0100;f\u0fe0\u30b4s;\u6920;\u6933s;\u691e\xeb\u225d\xf0\u272el;\u6945im;\u6974l;\u61a3;\u619d\u0100ai\u30d1\u30d5il;\u691ao\u0100;n\u30db\u30dc\u6236al\xf3\u0f1e\u0180abr\u30e7\u30ea\u30eer\xf2\u17e5rk;\u6773\u0100ak\u30f3\u30fdc\u0100ek\u30f9\u30fb;\u407d;\u405d\u0100es\u3102\u3104;\u698cl\u0100du\u310a\u310c;\u698e;\u6990\u0200aeuy\u3117\u311c\u3127\u3129ron;\u4159\u0100di\u3121\u3125il;\u4157\xec\u0ff2\xe2\u30fa;\u4440\u0200clqs\u3134\u3137\u313d\u3144a;\u6937dhar;\u6969uo\u0100;r\u020e\u020dh;\u61b3\u0180acg\u314e\u315f\u0f44l\u0200;ips\u0f78\u3158\u315b\u109cn\xe5\u10bbar\xf4\u0fa9t;\u65ad\u0180ilr\u3169\u1023\u316esht;\u697d;\uc000\ud835\udd2f\u0100ao\u3177\u3186r\u0100du\u317d\u317f\xbb\u047b\u0100;l\u1091\u3184;\u696c\u0100;v\u318b\u318c\u43c1;\u43f1\u0180gns\u3195\u31f9\u31fcht\u0300ahlrst\u31a4\u31b0\u31c2\u31d8\u31e4\u31eerrow\u0100;t\u0fdc\u31ada\xe9\u30c8arpoon\u0100du\u31bb\u31bfow\xee\u317ep\xbb\u1092eft\u0100ah\u31ca\u31d0rrow\xf3\u0feaarpoon\xf3\u0551ightarrows;\u61c9quigarro\xf7\u30cbhreetimes;\u62ccg;\u42daingdotse\xf1\u1f32\u0180ahm\u320d\u3210\u3213r\xf2\u0feaa\xf2\u0551;\u600foust\u0100;a\u321e\u321f\u63b1che\xbb\u321fmid;\u6aee\u0200abpt\u3232\u323d\u3240\u3252\u0100nr\u3237\u323ag;\u67edr;\u61fer\xeb\u1003\u0180afl\u3247\u324a\u324er;\u6986;\uc000\ud835\udd63us;\u6a2eimes;\u6a35\u0100ap\u325d\u3267r\u0100;g\u3263\u3264\u4029t;\u6994olint;\u6a12ar\xf2\u31e3\u0200achq\u327b\u3280\u10bc\u3285quo;\u603ar;\uc000\ud835\udcc7\u0100bu\u30fb\u328ao\u0100;r\u0214\u0213\u0180hir\u3297\u329b\u32a0re\xe5\u31f8mes;\u62cai\u0200;efl\u32aa\u1059\u1821\u32ab\u65b9tri;\u69celuhar;\u6968;\u611e\u0d61\u32d5\u32db\u32df\u332c\u3338\u3371\0\u337a\u33a4\0\0\u33ec\u33f0\0\u3428\u3448\u345a\u34ad\u34b1\u34ca\u34f1\0\u3616\0\0\u3633cute;\u415bqu\xef\u27ba\u0500;Eaceinpsy\u11ed\u32f3\u32f5\u32ff\u3302\u330b\u330f\u331f\u3326\u3329;\u6ab4\u01f0\u32fa\0\u32fc;\u6ab8on;\u4161u\xe5\u11fe\u0100;d\u11f3\u3307il;\u415frc;\u415d\u0180Eas\u3316\u3318\u331b;\u6ab6p;\u6abaim;\u62e9olint;\u6a13i\xed\u1204;\u4441ot\u0180;be\u3334\u1d47\u3335\u62c5;\u6a66\u0380Aacmstx\u3346\u334a\u3357\u335b\u335e\u3363\u336drr;\u61d8r\u0100hr\u3350\u3352\xeb\u2228\u0100;o\u0a36\u0a34t\u803b\xa7\u40a7i;\u403bwar;\u6929m\u0100in\u3369\xf0nu\xf3\xf1t;\u6736r\u0100;o\u3376\u2055\uc000\ud835\udd30\u0200acoy\u3382\u3386\u3391\u33a0rp;\u666f\u0100hy\u338b\u338fcy;\u4449;\u4448rt\u026d\u3399\0\0\u339ci\xe4\u1464ara\xec\u2e6f\u803b\xad\u40ad\u0100gm\u33a8\u33b4ma\u0180;fv\u33b1\u33b2\u33b2\u43c3;\u43c2\u0400;deglnpr\u12ab\u33c5\u33c9\u33ce\u33d6\u33de\u33e1\u33e6ot;\u6a6a\u0100;q\u12b1\u12b0\u0100;E\u33d3\u33d4\u6a9e;\u6aa0\u0100;E\u33db\u33dc\u6a9d;\u6a9fe;\u6246lus;\u6a24arr;\u6972ar\xf2\u113d\u0200aeit\u33f8\u3408\u340f\u3417\u0100ls\u33fd\u3404lsetm\xe9\u336ahp;\u6a33parsl;\u69e4\u0100dl\u1463\u3414e;\u6323\u0100;e\u341c\u341d\u6aaa\u0100;s\u3422\u3423\u6aac;\uc000\u2aac\ufe00\u0180flp\u342e\u3433\u3442tcy;\u444c\u0100;b\u3438\u3439\u402f\u0100;a\u343e\u343f\u69c4r;\u633ff;\uc000\ud835\udd64a\u0100dr\u344d\u0402es\u0100;u\u3454\u3455\u6660it\xbb\u3455\u0180csu\u3460\u3479\u349f\u0100au\u3465\u346fp\u0100;s\u1188\u346b;\uc000\u2293\ufe00p\u0100;s\u11b4\u3475;\uc000\u2294\ufe00u\u0100bp\u347f\u348f\u0180;es\u1197\u119c\u3486et\u0100;e\u1197\u348d\xf1\u119d\u0180;es\u11a8\u11ad\u3496et\u0100;e\u11a8\u349d\xf1\u11ae\u0180;af\u117b\u34a6\u05b0r\u0165\u34ab\u05b1\xbb\u117car\xf2\u1148\u0200cemt\u34b9\u34be\u34c2\u34c5r;\uc000\ud835\udcc8tm\xee\xf1i\xec\u3415ar\xe6\u11be\u0100ar\u34ce\u34d5r\u0100;f\u34d4\u17bf\u6606\u0100an\u34da\u34edight\u0100ep\u34e3\u34eapsilo\xee\u1ee0h\xe9\u2eafs\xbb\u2852\u0280bcmnp\u34fb\u355e\u1209\u358b\u358e\u0480;Edemnprs\u350e\u350f\u3511\u3515\u351e\u3523\u352c\u3531\u3536\u6282;\u6ac5ot;\u6abd\u0100;d\u11da\u351aot;\u6ac3ult;\u6ac1\u0100Ee\u3528\u352a;\u6acb;\u628alus;\u6abfarr;\u6979\u0180eiu\u353d\u3552\u3555t\u0180;en\u350e\u3545\u354bq\u0100;q\u11da\u350feq\u0100;q\u352b\u3528m;\u6ac7\u0100bp\u355a\u355c;\u6ad5;\u6ad3c\u0300;acens\u11ed\u356c\u3572\u3579\u357b\u3326ppro\xf8\u32faurlye\xf1\u11fe\xf1\u11f3\u0180aes\u3582\u3588\u331bppro\xf8\u331aq\xf1\u3317g;\u666a\u0680123;Edehlmnps\u35a9\u35ac\u35af\u121c\u35b2\u35b4\u35c0\u35c9\u35d5\u35da\u35df\u35e8\u35ed\u803b\xb9\u40b9\u803b\xb2\u40b2\u803b\xb3\u40b3;\u6ac6\u0100os\u35b9\u35bct;\u6abeub;\u6ad8\u0100;d\u1222\u35c5ot;\u6ac4s\u0100ou\u35cf\u35d2l;\u67c9b;\u6ad7arr;\u697bult;\u6ac2\u0100Ee\u35e4\u35e6;\u6acc;\u628blus;\u6ac0\u0180eiu\u35f4\u3609\u360ct\u0180;en\u121c\u35fc\u3602q\u0100;q\u1222\u35b2eq\u0100;q\u35e7\u35e4m;\u6ac8\u0100bp\u3611\u3613;\u6ad4;\u6ad6\u0180Aan\u361c\u3620\u362drr;\u61d9r\u0100hr\u3626\u3628\xeb\u222e\u0100;o\u0a2b\u0a29war;\u692alig\u803b\xdf\u40df\u0be1\u3651\u365d\u3660\u12ce\u3673\u3679\0\u367e\u36c2\0\0\0\0\0\u36db\u3703\0\u3709\u376c\0\0\0\u3787\u0272\u3656\0\0\u365bget;\u6316;\u43c4r\xeb\u0e5f\u0180aey\u3666\u366b\u3670ron;\u4165dil;\u4163;\u4442lrec;\u6315r;\uc000\ud835\udd31\u0200eiko\u3686\u369d\u36b5\u36bc\u01f2\u368b\0\u3691e\u01004f\u1284\u1281a\u0180;sv\u3698\u3699\u369b\u43b8ym;\u43d1\u0100cn\u36a2\u36b2k\u0100as\u36a8\u36aeppro\xf8\u12c1im\xbb\u12acs\xf0\u129e\u0100as\u36ba\u36ae\xf0\u12c1rn\u803b\xfe\u40fe\u01ec\u031f\u36c6\u22e7es\u8180\xd7;bd\u36cf\u36d0\u36d8\u40d7\u0100;a\u190f\u36d5r;\u6a31;\u6a30\u0180eps\u36e1\u36e3\u3700\xe1\u2a4d\u0200;bcf\u0486\u36ec\u36f0\u36f4ot;\u6336ir;\u6af1\u0100;o\u36f9\u36fc\uc000\ud835\udd65rk;\u6ada\xe1\u3362rime;\u6034\u0180aip\u370f\u3712\u3764d\xe5\u1248\u0380adempst\u3721\u374d\u3740\u3751\u3757\u375c\u375fngle\u0280;dlqr\u3730\u3731\u3736\u3740\u3742\u65b5own\xbb\u1dbbeft\u0100;e\u2800\u373e\xf1\u092e;\u625cight\u0100;e\u32aa\u374b\xf1\u105aot;\u65ecinus;\u6a3alus;\u6a39b;\u69cdime;\u6a3bezium;\u63e2\u0180cht\u3772\u377d\u3781\u0100ry\u3777\u377b;\uc000\ud835\udcc9;\u4446cy;\u445brok;\u4167\u0100io\u378b\u378ex\xf4\u1777head\u0100lr\u3797\u37a0eftarro\xf7\u084fightarrow\xbb\u0f5d\u0900AHabcdfghlmoprstuw\u37d0\u37d3\u37d7\u37e4\u37f0\u37fc\u380e\u381c\u3823\u3834\u3851\u385d\u386b\u38a9\u38cc\u38d2\u38ea\u38f6r\xf2\u03edar;\u6963\u0100cr\u37dc\u37e2ute\u803b\xfa\u40fa\xf2\u1150r\u01e3\u37ea\0\u37edy;\u445eve;\u416d\u0100iy\u37f5\u37farc\u803b\xfb\u40fb;\u4443\u0180abh\u3803\u3806\u380br\xf2\u13adlac;\u4171a\xf2\u13c3\u0100ir\u3813\u3818sht;\u697e;\uc000\ud835\udd32rave\u803b\xf9\u40f9\u0161\u3827\u3831r\u0100lr\u382c\u382e\xbb\u0957\xbb\u1083lk;\u6580\u0100ct\u3839\u384d\u026f\u383f\0\0\u384arn\u0100;e\u3845\u3846\u631cr\xbb\u3846op;\u630fri;\u65f8\u0100al\u3856\u385acr;\u416b\u80bb\xa8\u0349\u0100gp\u3862\u3866on;\u4173f;\uc000\ud835\udd66\u0300adhlsu\u114b\u3878\u387d\u1372\u3891\u38a0own\xe1\u13b3arpoon\u0100lr\u3888\u388cef\xf4\u382digh\xf4\u382fi\u0180;hl\u3899\u389a\u389c\u43c5\xbb\u13faon\xbb\u389aparrows;\u61c8\u0180cit\u38b0\u38c4\u38c8\u026f\u38b6\0\0\u38c1rn\u0100;e\u38bc\u38bd\u631dr\xbb\u38bdop;\u630eng;\u416fri;\u65f9cr;\uc000\ud835\udcca\u0180dir\u38d9\u38dd\u38e2ot;\u62f0lde;\u4169i\u0100;f\u3730\u38e8\xbb\u1813\u0100am\u38ef\u38f2r\xf2\u38a8l\u803b\xfc\u40fcangle;\u69a7\u0780ABDacdeflnoprsz\u391c\u391f\u3929\u392d\u39b5\u39b8\u39bd\u39df\u39e4\u39e8\u39f3\u39f9\u39fd\u3a01\u3a20r\xf2\u03f7ar\u0100;v\u3926\u3927\u6ae8;\u6ae9as\xe8\u03e1\u0100nr\u3932\u3937grt;\u699c\u0380eknprst\u34e3\u3946\u394b\u3952\u395d\u3964\u3996app\xe1\u2415othin\xe7\u1e96\u0180hir\u34eb\u2ec8\u3959op\xf4\u2fb5\u0100;h\u13b7\u3962\xef\u318d\u0100iu\u3969\u396dgm\xe1\u33b3\u0100bp\u3972\u3984setneq\u0100;q\u397d\u3980\uc000\u228a\ufe00;\uc000\u2acb\ufe00setneq\u0100;q\u398f\u3992\uc000\u228b\ufe00;\uc000\u2acc\ufe00\u0100hr\u399b\u399fet\xe1\u369ciangle\u0100lr\u39aa\u39afeft\xbb\u0925ight\xbb\u1051y;\u4432ash\xbb\u1036\u0180elr\u39c4\u39d2\u39d7\u0180;be\u2dea\u39cb\u39cfar;\u62bbq;\u625alip;\u62ee\u0100bt\u39dc\u1468a\xf2\u1469r;\uc000\ud835\udd33tr\xe9\u39aesu\u0100bp\u39ef\u39f1\xbb\u0d1c\xbb\u0d59pf;\uc000\ud835\udd67ro\xf0\u0efbtr\xe9\u39b4\u0100cu\u3a06\u3a0br;\uc000\ud835\udccb\u0100bp\u3a10\u3a18n\u0100Ee\u3980\u3a16\xbb\u397en\u0100Ee\u3992\u3a1e\xbb\u3990igzag;\u699a\u0380cefoprs\u3a36\u3a3b\u3a56\u3a5b\u3a54\u3a61\u3a6airc;\u4175\u0100di\u3a40\u3a51\u0100bg\u3a45\u3a49ar;\u6a5fe\u0100;q\u15fa\u3a4f;\u6259erp;\u6118r;\uc000\ud835\udd34pf;\uc000\ud835\udd68\u0100;e\u1479\u3a66at\xe8\u1479cr;\uc000\ud835\udccc\u0ae3\u178e\u3a87\0\u3a8b\0\u3a90\u3a9b\0\0\u3a9d\u3aa8\u3aab\u3aaf\0\0\u3ac3\u3ace\0\u3ad8\u17dc\u17dftr\xe9\u17d1r;\uc000\ud835\udd35\u0100Aa\u3a94\u3a97r\xf2\u03c3r\xf2\u09f6;\u43be\u0100Aa\u3aa1\u3aa4r\xf2\u03b8r\xf2\u09eba\xf0\u2713is;\u62fb\u0180dpt\u17a4\u3ab5\u3abe\u0100fl\u3aba\u17a9;\uc000\ud835\udd69im\xe5\u17b2\u0100Aa\u3ac7\u3acar\xf2\u03cer\xf2\u0a01\u0100cq\u3ad2\u17b8r;\uc000\ud835\udccd\u0100pt\u17d6\u3adcr\xe9\u17d4\u0400acefiosu\u3af0\u3afd\u3b08\u3b0c\u3b11\u3b15\u3b1b\u3b21c\u0100uy\u3af6\u3afbte\u803b\xfd\u40fd;\u444f\u0100iy\u3b02\u3b06rc;\u4177;\u444bn\u803b\xa5\u40a5r;\uc000\ud835\udd36cy;\u4457pf;\uc000\ud835\udd6acr;\uc000\ud835\udcce\u0100cm\u3b26\u3b29y;\u444el\u803b\xff\u40ff\u0500acdefhiosw\u3b42\u3b48\u3b54\u3b58\u3b64\u3b69\u3b6d\u3b74\u3b7a\u3b80cute;\u417a\u0100ay\u3b4d\u3b52ron;\u417e;\u4437ot;\u417c\u0100et\u3b5d\u3b61tr\xe6\u155fa;\u43b6r;\uc000\ud835\udd37cy;\u4436grarr;\u61ddpf;\uc000\ud835\udd6bcr;\uc000\ud835\udccf\u0100jn\u3b85\u3b87;\u600dj;\u600c'.split("").map((c => c.charCodeAt(0))));
  // Generated using scripts/write-decode-map.ts
    var xmlDecodeTree = new Uint16Array(
  // prettier-ignore
  "\u0200aglq\t\x15\x18\x1b\u026d\x0f\0\0\x12p;\u4026os;\u4027t;\u403et;\u403cuot;\u4022".split("").map((c => c.charCodeAt(0))));
  // Adapted from https://github.com/mathiasbynens/he/blob/36afe179392226cf1b6ccdb16ebbb7a5a844d93a/src/he.js#L106-L134
    var _a;
  const decodeMap = new Map([ [ 0, 65533 ], 
  // C1 Unicode control character reference replacements
  [ 128, 8364 ], [ 130, 8218 ], [ 131, 402 ], [ 132, 8222 ], [ 133, 8230 ], [ 134, 8224 ], [ 135, 8225 ], [ 136, 710 ], [ 137, 8240 ], [ 138, 352 ], [ 139, 8249 ], [ 140, 338 ], [ 142, 381 ], [ 145, 8216 ], [ 146, 8217 ], [ 147, 8220 ], [ 148, 8221 ], [ 149, 8226 ], [ 150, 8211 ], [ 151, 8212 ], [ 152, 732 ], [ 153, 8482 ], [ 154, 353 ], [ 155, 8250 ], [ 156, 339 ], [ 158, 382 ], [ 159, 376 ] ]);
  /**
   * Polyfill for `String.fromCodePoint`. It is used to create a string from a Unicode code point.
   */  const fromCodePoint$1 = 
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, node/no-unsupported-features/es-builtins
  (_a = String.fromCodePoint) !== null && _a !== void 0 ? _a : function(codePoint) {
    let output = "";
    if (codePoint > 65535) {
      codePoint -= 65536;
      output += String.fromCharCode(codePoint >>> 10 & 1023 | 55296);
      codePoint = 56320 | codePoint & 1023;
    }
    output += String.fromCharCode(codePoint);
    return output;
  };
  /**
   * Replace the given code point with a replacement character if it is a
   * surrogate or is outside the valid range. Otherwise return the code
   * point unchanged.
   */  function replaceCodePoint(codePoint) {
    var _a;
    if (codePoint >= 55296 && codePoint <= 57343 || codePoint > 1114111) {
      return 65533;
    }
    return (_a = decodeMap.get(codePoint)) !== null && _a !== void 0 ? _a : codePoint;
  }
  var CharCodes;
  (function(CharCodes) {
    CharCodes[CharCodes["NUM"] = 35] = "NUM";
    CharCodes[CharCodes["SEMI"] = 59] = "SEMI";
    CharCodes[CharCodes["EQUALS"] = 61] = "EQUALS";
    CharCodes[CharCodes["ZERO"] = 48] = "ZERO";
    CharCodes[CharCodes["NINE"] = 57] = "NINE";
    CharCodes[CharCodes["LOWER_A"] = 97] = "LOWER_A";
    CharCodes[CharCodes["LOWER_F"] = 102] = "LOWER_F";
    CharCodes[CharCodes["LOWER_X"] = 120] = "LOWER_X";
    CharCodes[CharCodes["LOWER_Z"] = 122] = "LOWER_Z";
    CharCodes[CharCodes["UPPER_A"] = 65] = "UPPER_A";
    CharCodes[CharCodes["UPPER_F"] = 70] = "UPPER_F";
    CharCodes[CharCodes["UPPER_Z"] = 90] = "UPPER_Z";
  })(CharCodes || (CharCodes = {}));
  /** Bit that needs to be set to convert an upper case ASCII character to lower case */  const TO_LOWER_BIT = 32;
  var BinTrieFlags;
  (function(BinTrieFlags) {
    BinTrieFlags[BinTrieFlags["VALUE_LENGTH"] = 49152] = "VALUE_LENGTH";
    BinTrieFlags[BinTrieFlags["BRANCH_LENGTH"] = 16256] = "BRANCH_LENGTH";
    BinTrieFlags[BinTrieFlags["JUMP_TABLE"] = 127] = "JUMP_TABLE";
  })(BinTrieFlags || (BinTrieFlags = {}));
  function isNumber(code) {
    return code >= CharCodes.ZERO && code <= CharCodes.NINE;
  }
  function isHexadecimalCharacter(code) {
    return code >= CharCodes.UPPER_A && code <= CharCodes.UPPER_F || code >= CharCodes.LOWER_A && code <= CharCodes.LOWER_F;
  }
  function isAsciiAlphaNumeric(code) {
    return code >= CharCodes.UPPER_A && code <= CharCodes.UPPER_Z || code >= CharCodes.LOWER_A && code <= CharCodes.LOWER_Z || isNumber(code);
  }
  /**
   * Checks if the given character is a valid end character for an entity in an attribute.
   *
   * Attribute values that aren't terminated properly aren't parsed, and shouldn't lead to a parser error.
   * See the example in https://html.spec.whatwg.org/multipage/parsing.html#named-character-reference-state
   */  function isEntityInAttributeInvalidEnd(code) {
    return code === CharCodes.EQUALS || isAsciiAlphaNumeric(code);
  }
  var EntityDecoderState;
  (function(EntityDecoderState) {
    EntityDecoderState[EntityDecoderState["EntityStart"] = 0] = "EntityStart";
    EntityDecoderState[EntityDecoderState["NumericStart"] = 1] = "NumericStart";
    EntityDecoderState[EntityDecoderState["NumericDecimal"] = 2] = "NumericDecimal";
    EntityDecoderState[EntityDecoderState["NumericHex"] = 3] = "NumericHex";
    EntityDecoderState[EntityDecoderState["NamedEntity"] = 4] = "NamedEntity";
  })(EntityDecoderState || (EntityDecoderState = {}));
  var DecodingMode;
  (function(DecodingMode) {
    /** Entities in text nodes that can end with any character. */
    DecodingMode[DecodingMode["Legacy"] = 0] = "Legacy";
    /** Only allow entities terminated with a semicolon. */    DecodingMode[DecodingMode["Strict"] = 1] = "Strict";
    /** Entities in attributes have limitations on ending characters. */    DecodingMode[DecodingMode["Attribute"] = 2] = "Attribute";
  })(DecodingMode || (DecodingMode = {}));
  /**
   * Token decoder with support of writing partial entities.
   */  class EntityDecoder {
    constructor(/** The tree used to decode entities. */
    decodeTree, 
    /**
     * The function that is called when a codepoint is decoded.
     *
     * For multi-byte named entities, this will be called multiple times,
     * with the second codepoint, and the same `consumed` value.
     *
     * @param codepoint The decoded codepoint.
     * @param consumed The number of bytes consumed by the decoder.
     */
    emitCodePoint, /** An object that is used to produce errors. */
    errors) {
      this.decodeTree = decodeTree;
      this.emitCodePoint = emitCodePoint;
      this.errors = errors;
      /** The current state of the decoder. */      this.state = EntityDecoderState.EntityStart;
      /** Characters that were consumed while parsing an entity. */      this.consumed = 1;
      /**
       * The result of the entity.
       *
       * Either the result index of a numeric entity, or the codepoint of a
       * numeric entity.
       */      this.result = 0;
      /** The current index in the decode tree. */      this.treeIndex = 0;
      /** The number of characters that were consumed in excess. */      this.excess = 1;
      /** The mode in which the decoder is operating. */      this.decodeMode = DecodingMode.Strict;
    }
    /** Resets the instance to make it reusable. */    startEntity(decodeMode) {
      this.decodeMode = decodeMode;
      this.state = EntityDecoderState.EntityStart;
      this.result = 0;
      this.treeIndex = 0;
      this.excess = 1;
      this.consumed = 1;
    }
    /**
     * Write an entity to the decoder. This can be called multiple times with partial entities.
     * If the entity is incomplete, the decoder will return -1.
     *
     * Mirrors the implementation of `getDecoder`, but with the ability to stop decoding if the
     * entity is incomplete, and resume when the next string is written.
     *
     * @param string The string containing the entity (or a continuation of the entity).
     * @param offset The offset at which the entity begins. Should be 0 if this is not the first call.
     * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
     */    write(str, offset) {
      switch (this.state) {
       case EntityDecoderState.EntityStart:
        {
          if (str.charCodeAt(offset) === CharCodes.NUM) {
            this.state = EntityDecoderState.NumericStart;
            this.consumed += 1;
            return this.stateNumericStart(str, offset + 1);
          }
          this.state = EntityDecoderState.NamedEntity;
          return this.stateNamedEntity(str, offset);
        }

       case EntityDecoderState.NumericStart:
        {
          return this.stateNumericStart(str, offset);
        }

       case EntityDecoderState.NumericDecimal:
        {
          return this.stateNumericDecimal(str, offset);
        }

       case EntityDecoderState.NumericHex:
        {
          return this.stateNumericHex(str, offset);
        }

       case EntityDecoderState.NamedEntity:
        {
          return this.stateNamedEntity(str, offset);
        }
      }
    }
    /**
     * Switches between the numeric decimal and hexadecimal states.
     *
     * Equivalent to the `Numeric character reference state` in the HTML spec.
     *
     * @param str The string containing the entity (or a continuation of the entity).
     * @param offset The current offset.
     * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
     */    stateNumericStart(str, offset) {
      if (offset >= str.length) {
        return -1;
      }
      if ((str.charCodeAt(offset) | TO_LOWER_BIT) === CharCodes.LOWER_X) {
        this.state = EntityDecoderState.NumericHex;
        this.consumed += 1;
        return this.stateNumericHex(str, offset + 1);
      }
      this.state = EntityDecoderState.NumericDecimal;
      return this.stateNumericDecimal(str, offset);
    }
    addToNumericResult(str, start, end, base) {
      if (start !== end) {
        const digitCount = end - start;
        this.result = this.result * Math.pow(base, digitCount) + parseInt(str.substr(start, digitCount), base);
        this.consumed += digitCount;
      }
    }
    /**
     * Parses a hexadecimal numeric entity.
     *
     * Equivalent to the `Hexademical character reference state` in the HTML spec.
     *
     * @param str The string containing the entity (or a continuation of the entity).
     * @param offset The current offset.
     * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
     */    stateNumericHex(str, offset) {
      const startIdx = offset;
      while (offset < str.length) {
        const char = str.charCodeAt(offset);
        if (isNumber(char) || isHexadecimalCharacter(char)) {
          offset += 1;
        } else {
          this.addToNumericResult(str, startIdx, offset, 16);
          return this.emitNumericEntity(char, 3);
        }
      }
      this.addToNumericResult(str, startIdx, offset, 16);
      return -1;
    }
    /**
     * Parses a decimal numeric entity.
     *
     * Equivalent to the `Decimal character reference state` in the HTML spec.
     *
     * @param str The string containing the entity (or a continuation of the entity).
     * @param offset The current offset.
     * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
     */    stateNumericDecimal(str, offset) {
      const startIdx = offset;
      while (offset < str.length) {
        const char = str.charCodeAt(offset);
        if (isNumber(char)) {
          offset += 1;
        } else {
          this.addToNumericResult(str, startIdx, offset, 10);
          return this.emitNumericEntity(char, 2);
        }
      }
      this.addToNumericResult(str, startIdx, offset, 10);
      return -1;
    }
    /**
     * Validate and emit a numeric entity.
     *
     * Implements the logic from the `Hexademical character reference start
     * state` and `Numeric character reference end state` in the HTML spec.
     *
     * @param lastCp The last code point of the entity. Used to see if the
     *               entity was terminated with a semicolon.
     * @param expectedLength The minimum number of characters that should be
     *                       consumed. Used to validate that at least one digit
     *                       was consumed.
     * @returns The number of characters that were consumed.
     */    emitNumericEntity(lastCp, expectedLength) {
      var _a;
      // Ensure we consumed at least one digit.
            if (this.consumed <= expectedLength) {
        (_a = this.errors) === null || _a === void 0 ? void 0 : _a.absenceOfDigitsInNumericCharacterReference(this.consumed);
        return 0;
      }
      // Figure out if this is a legit end of the entity
            if (lastCp === CharCodes.SEMI) {
        this.consumed += 1;
      } else if (this.decodeMode === DecodingMode.Strict) {
        return 0;
      }
      this.emitCodePoint(replaceCodePoint(this.result), this.consumed);
      if (this.errors) {
        if (lastCp !== CharCodes.SEMI) {
          this.errors.missingSemicolonAfterCharacterReference();
        }
        this.errors.validateNumericCharacterReference(this.result);
      }
      return this.consumed;
    }
    /**
     * Parses a named entity.
     *
     * Equivalent to the `Named character reference state` in the HTML spec.
     *
     * @param str The string containing the entity (or a continuation of the entity).
     * @param offset The current offset.
     * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
     */    stateNamedEntity(str, offset) {
      const {decodeTree: decodeTree} = this;
      let current = decodeTree[this.treeIndex];
      // The mask is the number of bytes of the value, including the current byte.
            let valueLength = (current & BinTrieFlags.VALUE_LENGTH) >> 14;
      for (;offset < str.length; offset++, this.excess++) {
        const char = str.charCodeAt(offset);
        this.treeIndex = determineBranch(decodeTree, current, this.treeIndex + Math.max(1, valueLength), char);
        if (this.treeIndex < 0) {
          return this.result === 0 || 
          // If we are parsing an attribute
          this.decodeMode === DecodingMode.Attribute && (
          // We shouldn't have consumed any characters after the entity,
          valueLength === 0 || 
          // And there should be no invalid characters.
          isEntityInAttributeInvalidEnd(char)) ? 0 : this.emitNotTerminatedNamedEntity();
        }
        current = decodeTree[this.treeIndex];
        valueLength = (current & BinTrieFlags.VALUE_LENGTH) >> 14;
        // If the branch is a value, store it and continue
                if (valueLength !== 0) {
          // If the entity is terminated by a semicolon, we are done.
          if (char === CharCodes.SEMI) {
            return this.emitNamedEntityData(this.treeIndex, valueLength, this.consumed + this.excess);
          }
          // If we encounter a non-terminated (legacy) entity while parsing strictly, then ignore it.
                    if (this.decodeMode !== DecodingMode.Strict) {
            this.result = this.treeIndex;
            this.consumed += this.excess;
            this.excess = 0;
          }
        }
      }
      return -1;
    }
    /**
     * Emit a named entity that was not terminated with a semicolon.
     *
     * @returns The number of characters consumed.
     */    emitNotTerminatedNamedEntity() {
      var _a;
      const {result: result, decodeTree: decodeTree} = this;
      const valueLength = (decodeTree[result] & BinTrieFlags.VALUE_LENGTH) >> 14;
      this.emitNamedEntityData(result, valueLength, this.consumed);
      (_a = this.errors) === null || _a === void 0 ? void 0 : _a.missingSemicolonAfterCharacterReference();
      return this.consumed;
    }
    /**
     * Emit a named entity.
     *
     * @param result The index of the entity in the decode tree.
     * @param valueLength The number of bytes in the entity.
     * @param consumed The number of characters consumed.
     *
     * @returns The number of characters consumed.
     */    emitNamedEntityData(result, valueLength, consumed) {
      const {decodeTree: decodeTree} = this;
      this.emitCodePoint(valueLength === 1 ? decodeTree[result] & ~BinTrieFlags.VALUE_LENGTH : decodeTree[result + 1], consumed);
      if (valueLength === 3) {
        // For multi-byte values, we need to emit the second byte.
        this.emitCodePoint(decodeTree[result + 2], consumed);
      }
      return consumed;
    }
    /**
     * Signal to the parser that the end of the input was reached.
     *
     * Remaining data will be emitted and relevant errors will be produced.
     *
     * @returns The number of characters consumed.
     */    end() {
      var _a;
      switch (this.state) {
       case EntityDecoderState.NamedEntity:
        {
          // Emit a named entity if we have one.
          return this.result !== 0 && (this.decodeMode !== DecodingMode.Attribute || this.result === this.treeIndex) ? this.emitNotTerminatedNamedEntity() : 0;
        }

        // Otherwise, emit a numeric entity if we have one.
               case EntityDecoderState.NumericDecimal:
        {
          return this.emitNumericEntity(0, 2);
        }

       case EntityDecoderState.NumericHex:
        {
          return this.emitNumericEntity(0, 3);
        }

       case EntityDecoderState.NumericStart:
        {
          (_a = this.errors) === null || _a === void 0 ? void 0 : _a.absenceOfDigitsInNumericCharacterReference(this.consumed);
          return 0;
        }

       case EntityDecoderState.EntityStart:
        {
          // Return 0 if we have no entity.
          return 0;
        }
      }
    }
  }
  /**
   * Creates a function that decodes entities in a string.
   *
   * @param decodeTree The decode tree.
   * @returns A function that decodes entities in a string.
   */  function getDecoder(decodeTree) {
    let ret = "";
    const decoder = new EntityDecoder(decodeTree, (str => ret += fromCodePoint$1(str)));
    return function decodeWithTrie(str, decodeMode) {
      let lastIndex = 0;
      let offset = 0;
      while ((offset = str.indexOf("&", offset)) >= 0) {
        ret += str.slice(lastIndex, offset);
        decoder.startEntity(decodeMode);
        const len = decoder.write(str, 
        // Skip the "&"
        offset + 1);
        if (len < 0) {
          lastIndex = offset + decoder.end();
          break;
        }
        lastIndex = offset + len;
        // If `len` is 0, skip the current `&` and continue.
                offset = len === 0 ? lastIndex + 1 : lastIndex;
      }
      const result = ret + str.slice(lastIndex);
      // Make sure we don't keep a reference to the final string.
            ret = "";
      return result;
    };
  }
  /**
   * Determines the branch of the current node that is taken given the current
   * character. This function is used to traverse the trie.
   *
   * @param decodeTree The trie.
   * @param current The current node.
   * @param nodeIdx The index right after the current node and its value.
   * @param char The current character.
   * @returns The index of the next node, or -1 if no branch is taken.
   */  function determineBranch(decodeTree, current, nodeIdx, char) {
    const branchCount = (current & BinTrieFlags.BRANCH_LENGTH) >> 7;
    const jumpOffset = current & BinTrieFlags.JUMP_TABLE;
    // Case 1: Single branch encoded in jump offset
        if (branchCount === 0) {
      return jumpOffset !== 0 && char === jumpOffset ? nodeIdx : -1;
    }
    // Case 2: Multiple branches encoded in jump table
        if (jumpOffset) {
      const value = char - jumpOffset;
      return value < 0 || value >= branchCount ? -1 : decodeTree[nodeIdx + value] - 1;
    }
    // Case 3: Multiple branches encoded in dictionary
    // Binary search for the character.
        let lo = nodeIdx;
    let hi = lo + branchCount - 1;
    while (lo <= hi) {
      const mid = lo + hi >>> 1;
      const midVal = decodeTree[mid];
      if (midVal < char) {
        lo = mid + 1;
      } else if (midVal > char) {
        hi = mid - 1;
      } else {
        return decodeTree[mid + branchCount];
      }
    }
    return -1;
  }
  const htmlDecoder = getDecoder(htmlDecodeTree);
  getDecoder(xmlDecodeTree);
  /**
   * Decodes an HTML string.
   *
   * @param str The string to decode.
   * @param mode The decoding mode.
   * @returns The decoded string.
   */  function decodeHTML(str, mode = DecodingMode.Legacy) {
    return htmlDecoder(str, mode);
  }
  // Utilities
  
    function _class$1(obj) {
    return Object.prototype.toString.call(obj);
  }
  function isString$1(obj) {
    return _class$1(obj) === "[object String]";
  }
  const _hasOwnProperty = Object.prototype.hasOwnProperty;
  function has(object, key) {
    return _hasOwnProperty.call(object, key);
  }
  // Merge objects
  
    function assign$1(obj /* from1, from2, from3, ... */) {
    const sources = Array.prototype.slice.call(arguments, 1);
    sources.forEach((function(source) {
      if (!source) {
        return;
      }
      if (typeof source !== "object") {
        throw new TypeError(source + "must be object");
      }
      Object.keys(source).forEach((function(key) {
        obj[key] = source[key];
      }));
    }));
    return obj;
  }
  // Remove element from array and put another array at those position.
  // Useful for some operations with tokens
    function arrayReplaceAt(src, pos, newElements) {
    return [].concat(src.slice(0, pos), newElements, src.slice(pos + 1));
  }
  function isValidEntityCode(c) {
    /* eslint no-bitwise:0 */
    // broken sequence
    if (c >= 55296 && c <= 57343) {
      return false;
    }
    // never used
        if (c >= 64976 && c <= 65007) {
      return false;
    }
    if ((c & 65535) === 65535 || (c & 65535) === 65534) {
      return false;
    }
    // control codes
        if (c >= 0 && c <= 8) {
      return false;
    }
    if (c === 11) {
      return false;
    }
    if (c >= 14 && c <= 31) {
      return false;
    }
    if (c >= 127 && c <= 159) {
      return false;
    }
    // out of range
        if (c > 1114111) {
      return false;
    }
    return true;
  }
  function fromCodePoint(c) {
    /* eslint no-bitwise:0 */
    if (c > 65535) {
      c -= 65536;
      const surrogate1 = 55296 + (c >> 10);
      const surrogate2 = 56320 + (c & 1023);
      return String.fromCharCode(surrogate1, surrogate2);
    }
    return String.fromCharCode(c);
  }
  const UNESCAPE_MD_RE = /\\([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/g;
  const ENTITY_RE = /&([a-z#][a-z0-9]{1,31});/gi;
  const UNESCAPE_ALL_RE = new RegExp(UNESCAPE_MD_RE.source + "|" + ENTITY_RE.source, "gi");
  const DIGITAL_ENTITY_TEST_RE = /^#((?:x[a-f0-9]{1,8}|[0-9]{1,8}))$/i;
  function replaceEntityPattern(match, name) {
    if (name.charCodeAt(0) === 35 /* # */ && DIGITAL_ENTITY_TEST_RE.test(name)) {
      const code = name[1].toLowerCase() === "x" ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
      if (isValidEntityCode(code)) {
        return fromCodePoint(code);
      }
      return match;
    }
    const decoded = decodeHTML(match);
    if (decoded !== match) {
      return decoded;
    }
    return match;
  }
  /* function replaceEntities(str) {
    if (str.indexOf('&') < 0) { return str; }

    return str.replace(ENTITY_RE, replaceEntityPattern);
  } */  function unescapeMd(str) {
    if (str.indexOf("\\") < 0) {
      return str;
    }
    return str.replace(UNESCAPE_MD_RE, "$1");
  }
  function unescapeAll(str) {
    if (str.indexOf("\\") < 0 && str.indexOf("&") < 0) {
      return str;
    }
    return str.replace(UNESCAPE_ALL_RE, (function(match, escaped, entity) {
      if (escaped) {
        return escaped;
      }
      return replaceEntityPattern(match, entity);
    }));
  }
  const HTML_ESCAPE_TEST_RE = /[&<>"]/;
  const HTML_ESCAPE_REPLACE_RE = /[&<>"]/g;
  const HTML_REPLACEMENTS = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;"
  };
  function replaceUnsafeChar(ch) {
    return HTML_REPLACEMENTS[ch];
  }
  function escapeHtml(str) {
    if (HTML_ESCAPE_TEST_RE.test(str)) {
      return str.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar);
    }
    return str;
  }
  const REGEXP_ESCAPE_RE = /[.?*+^$[\]\\(){}|-]/g;
  function escapeRE$1(str) {
    return str.replace(REGEXP_ESCAPE_RE, "\\$&");
  }
  function isSpace(code) {
    switch (code) {
     case 9:
     case 32:
      return true;
    }
    return false;
  }
  // Zs (unicode class) || [\t\f\v\r\n]
    function isWhiteSpace(code) {
    if (code >= 8192 && code <= 8202) {
      return true;
    }
    switch (code) {
     case 9:
 // \t
           case 10:
 // \n
           case 11:
 // \v
           case 12:
 // \f
           case 13:
 // \r
           case 32:
     case 160:
     case 5760:
     case 8239:
     case 8287:
     case 12288:
      return true;
    }
    return false;
  }
  /* eslint-disable max-len */
  // Currently without astral characters support.
    function isPunctChar(ch) {
    return P.test(ch) || regex.test(ch);
  }
  // Markdown ASCII punctuation characters.
  
  // !, ", #, $, %, &, ', (, ), *, +, ,, -, ., /, :, ;, <, =, >, ?, @, [, \, ], ^, _, `, {, |, }, or ~
  // http://spec.commonmark.org/0.15/#ascii-punctuation-character
  
  // Don't confuse with unicode punctuation !!! It lacks some chars in ascii range.
  
    function isMdAsciiPunct(ch) {
    switch (ch) {
     case 33 /* ! */ :
     case 34 /* " */ :
     case 35 /* # */ :
     case 36 /* $ */ :
     case 37 /* % */ :
     case 38 /* & */ :
     case 39 /* ' */ :
     case 40 /* ( */ :
     case 41 /* ) */ :
     case 42 /* * */ :
     case 43 /* + */ :
     case 44 /* , */ :
     case 45 /* - */ :
     case 46 /* . */ :
     case 47 /* / */ :
     case 58 /* : */ :
     case 59 /* ; */ :
     case 60 /* < */ :
     case 61 /* = */ :
     case 62 /* > */ :
     case 63 /* ? */ :
     case 64 /* @ */ :
     case 91 /* [ */ :
     case 92 /* \ */ :
     case 93 /* ] */ :
     case 94 /* ^ */ :
     case 95 /* _ */ :
     case 96 /* ` */ :
     case 123 /* { */ :
     case 124 /* | */ :
     case 125 /* } */ :
     case 126 /* ~ */ :
      return true;

     default:
      return false;
    }
  }
  // Hepler to unify [reference labels].
  
    function normalizeReference(str) {
    // Trim and collapse whitespace
    str = str.trim().replace(/\s+/g, " ");
    // In node v10 'áºž'.toLowerCase() === 'á¹¾', which is presumed to be a bug
    // fixed in v12 (couldn't find any details).
    
    // So treat this one as a special case
    // (remove this when node v10 is no longer supported).
    
        if ("\u1e9e".toLowerCase() === "\u1e7e") {
      str = str.replace(/\u1e9e/g, "\xdf");
    }
    // .toLowerCase().toUpperCase() should get rid of all differences
    // between letter variants.
    
    // Simple .toLowerCase() doesn't normalize 125 code points correctly,
    // and .toUpperCase doesn't normalize 6 of them (list of exceptions:
    // Ä°, Ï´, áºž, â„¦, â„ª, â„« - those are already uppercased, but have differently
    // uppercased versions).
    
    // Here's an example showing how it happens. Lets take greek letter omega:
    // uppercase U+0398 (Î˜), U+03f4 (Ï´) and lowercase U+03b8 (Î¸), U+03d1 (Ï‘)
    
    // Unicode entries:
    // 0398;GREEK CAPITAL LETTER THETA;Lu;0;L;;;;;N;;;;03B8;
    // 03B8;GREEK SMALL LETTER THETA;Ll;0;L;;;;;N;;;0398;;0398
    // 03D1;GREEK THETA SYMBOL;Ll;0;L;<compat> 03B8;;;;N;GREEK SMALL LETTER SCRIPT THETA;;0398;;0398
    // 03F4;GREEK CAPITAL THETA SYMBOL;Lu;0;L;<compat> 0398;;;;N;;;;03B8;
    
    // Case-insensitive comparison should treat all of them as equivalent.
    
    // But .toLowerCase() doesn't change Ï‘ (it's already lowercase),
    // and .toUpperCase() doesn't change Ï´ (already uppercase).
    
    // Applying first lower then upper case normalizes any character:
    // '\u0398\u03f4\u03b8\u03d1'.toLowerCase().toUpperCase() === '\u0398\u0398\u0398\u0398'
    
    // Note: this is equivalent to unicode case folding; unicode normalization
    // is a different step that is not required here.
    
    // Final result should be uppercased, because it's later stored in an object
    // (this avoid a conflict with Object.prototype members,
    // most notably, `__proto__`)
    
        return str.toLowerCase().toUpperCase();
  }
  // Re-export libraries commonly used in both markdown-it and its plugins,
  // so plugins won't have to depend on them explicitly, which reduces their
  // bundled size (e.g. a browser build).
  
    const lib = {
    mdurl: mdurl,
    ucmicro: ucmicro
  };
  var utils =  Object.freeze({
    __proto__: null,
    arrayReplaceAt: arrayReplaceAt,
    assign: assign$1,
    escapeHtml: escapeHtml,
    escapeRE: escapeRE$1,
    fromCodePoint: fromCodePoint,
    has: has,
    isMdAsciiPunct: isMdAsciiPunct,
    isPunctChar: isPunctChar,
    isSpace: isSpace,
    isString: isString$1,
    isValidEntityCode: isValidEntityCode,
    isWhiteSpace: isWhiteSpace,
    lib: lib,
    normalizeReference: normalizeReference,
    unescapeAll: unescapeAll,
    unescapeMd: unescapeMd
  });
  // Parse link label
  
  // this function assumes that first character ("[") already matches;
  // returns the end of the label
  
    function parseLinkLabel(state, start, disableNested) {
    let level, found, marker, prevPos;
    const max = state.posMax;
    const oldPos = state.pos;
    state.pos = start + 1;
    level = 1;
    while (state.pos < max) {
      marker = state.src.charCodeAt(state.pos);
      if (marker === 93 /* ] */) {
        level--;
        if (level === 0) {
          found = true;
          break;
        }
      }
      prevPos = state.pos;
      state.md.inline.skipToken(state);
      if (marker === 91 /* [ */) {
        if (prevPos === state.pos - 1) {
          // increase level if we find text `[`, which is not a part of any token
          level++;
        } else if (disableNested) {
          state.pos = oldPos;
          return -1;
        }
      }
    }
    let labelEnd = -1;
    if (found) {
      labelEnd = state.pos;
    }
    // restore old state
        state.pos = oldPos;
    return labelEnd;
  }
  // Parse link destination
  
    function parseLinkDestination(str, start, max) {
    let code;
    let pos = start;
    const result = {
      ok: false,
      pos: 0,
      str: ""
    };
    if (str.charCodeAt(pos) === 60 /* < */) {
      pos++;
      while (pos < max) {
        code = str.charCodeAt(pos);
        if (code === 10 /* \n */) {
          return result;
        }
        if (code === 60 /* < */) {
          return result;
        }
        if (code === 62 /* > */) {
          result.pos = pos + 1;
          result.str = unescapeAll(str.slice(start + 1, pos));
          result.ok = true;
          return result;
        }
        if (code === 92 /* \ */ && pos + 1 < max) {
          pos += 2;
          continue;
        }
        pos++;
      }
      // no closing '>'
            return result;
    }
    // this should be ... } else { ... branch
        let level = 0;
    while (pos < max) {
      code = str.charCodeAt(pos);
      if (code === 32) {
        break;
      }
      // ascii control characters
            if (code < 32 || code === 127) {
        break;
      }
      if (code === 92 /* \ */ && pos + 1 < max) {
        if (str.charCodeAt(pos + 1) === 32) {
          break;
        }
        pos += 2;
        continue;
      }
      if (code === 40 /* ( */) {
        level++;
        if (level > 32) {
          return result;
        }
      }
      if (code === 41 /* ) */) {
        if (level === 0) {
          break;
        }
        level--;
      }
      pos++;
    }
    if (start === pos) {
      return result;
    }
    if (level !== 0) {
      return result;
    }
    result.str = unescapeAll(str.slice(start, pos));
    result.pos = pos;
    result.ok = true;
    return result;
  }
  // Parse link title
  
  // Parse link title within `str` in [start, max] range,
  // or continue previous parsing if `prev_state` is defined (equal to result of last execution).
  
    function parseLinkTitle(str, start, max, prev_state) {
    let code;
    let pos = start;
    const state = {
      // if `true`, this is a valid link title
      ok: false,
      // if `true`, this link can be continued on the next line
      can_continue: false,
      // if `ok`, it's the position of the first character after the closing marker
      pos: 0,
      // if `ok`, it's the unescaped title
      str: "",
      // expected closing marker character code
      marker: 0
    };
    if (prev_state) {
      // this is a continuation of a previous parseLinkTitle call on the next line,
      // used in reference links only
      state.str = prev_state.str;
      state.marker = prev_state.marker;
    } else {
      if (pos >= max) {
        return state;
      }
      let marker = str.charCodeAt(pos);
      if (marker !== 34 /* " */ && marker !== 39 /* ' */ && marker !== 40 /* ( */) {
        return state;
      }
      start++;
      pos++;
      // if opening marker is "(", switch it to closing marker ")"
            if (marker === 40) {
        marker = 41;
      }
      state.marker = marker;
    }
    while (pos < max) {
      code = str.charCodeAt(pos);
      if (code === state.marker) {
        state.pos = pos + 1;
        state.str += unescapeAll(str.slice(start, pos));
        state.ok = true;
        return state;
      } else if (code === 40 /* ( */ && state.marker === 41 /* ) */) {
        return state;
      } else if (code === 92 /* \ */ && pos + 1 < max) {
        pos++;
      }
      pos++;
    }
    // no closing marker found, but this link title may continue on the next line (for references)
        state.can_continue = true;
    state.str += unescapeAll(str.slice(start, pos));
    return state;
  }
  // Just a shortcut for bulk export
    var helpers =  Object.freeze({
    __proto__: null,
    parseLinkDestination: parseLinkDestination,
    parseLinkLabel: parseLinkLabel,
    parseLinkTitle: parseLinkTitle
  });
  /**
   * class Renderer
   *
   * Generates HTML from parsed token stream. Each instance has independent
   * copy of rules. Those can be rewritten with ease. Also, you can add new
   * rules if you create plugin and adds new token types.
   **/  const default_rules = {};
  default_rules.code_inline = function(tokens, idx, options, env, slf) {
    const token = tokens[idx];
    return "<code" + slf.renderAttrs(token) + ">" + escapeHtml(token.content) + "</code>";
  };
  default_rules.code_block = function(tokens, idx, options, env, slf) {
    const token = tokens[idx];
    return "<pre" + slf.renderAttrs(token) + "><code>" + escapeHtml(tokens[idx].content) + "</code></pre>\n";
  };
  default_rules.fence = function(tokens, idx, options, env, slf) {
    const token = tokens[idx];
    const info = token.info ? unescapeAll(token.info).trim() : "";
    let langName = "";
    let langAttrs = "";
    if (info) {
      const arr = info.split(/(\s+)/g);
      langName = arr[0];
      langAttrs = arr.slice(2).join("");
    }
    let highlighted;
    if (options.highlight) {
      highlighted = options.highlight(token.content, langName, langAttrs) || escapeHtml(token.content);
    } else {
      highlighted = escapeHtml(token.content);
    }
    if (highlighted.indexOf("<pre") === 0) {
      return highlighted + "\n";
    }
    // If language exists, inject class gently, without modifying original token.
    // May be, one day we will add .deepClone() for token and simplify this part, but
    // now we prefer to keep things local.
        if (info) {
      const i = token.attrIndex("class");
      const tmpAttrs = token.attrs ? token.attrs.slice() : [];
      if (i < 0) {
        tmpAttrs.push([ "class", options.langPrefix + langName ]);
      } else {
        tmpAttrs[i] = tmpAttrs[i].slice();
        tmpAttrs[i][1] += " " + options.langPrefix + langName;
      }
      // Fake token just to render attributes
            const tmpToken = {
        attrs: tmpAttrs
      };
      return `<pre><code${slf.renderAttrs(tmpToken)}>${highlighted}</code></pre>\n`;
    }
    return `<pre><code${slf.renderAttrs(token)}>${highlighted}</code></pre>\n`;
  };
  default_rules.image = function(tokens, idx, options, env, slf) {
    const token = tokens[idx];
    // "alt" attr MUST be set, even if empty. Because it's mandatory and
    // should be placed on proper position for tests.
    
    // Replace content with actual value
        token.attrs[token.attrIndex("alt")][1] = slf.renderInlineAsText(token.children, options, env);
    return slf.renderToken(tokens, idx, options);
  };
  default_rules.hardbreak = function(tokens, idx, options /*, env */) {
    return options.xhtmlOut ? "<br />\n" : "<br>\n";
  };
  default_rules.softbreak = function(tokens, idx, options /*, env */) {
    return options.breaks ? options.xhtmlOut ? "<br />\n" : "<br>\n" : "\n";
  };
  default_rules.text = function(tokens, idx /*, options, env */) {
    return escapeHtml(tokens[idx].content);
  };
  default_rules.html_block = function(tokens, idx /*, options, env */) {
    return tokens[idx].content;
  };
  default_rules.html_inline = function(tokens, idx /*, options, env */) {
    return tokens[idx].content;
  };
  /**
   * new Renderer()
   *
   * Creates new [[Renderer]] instance and fill [[Renderer#rules]] with defaults.
   **/  function Renderer() {
    /**
     * Renderer#rules -> Object
     *
     * Contains render rules for tokens. Can be updated and extended.
     *
     * ##### Example
     *
     * ```javascript
     * var md = require('markdown-it')();
     *
     * md.renderer.rules.strong_open  = function () { return '<b>'; };
     * md.renderer.rules.strong_close = function () { return '</b>'; };
     *
     * var result = md.renderInline(...);
     * ```
     *
     * Each rule is called as independent static function with fixed signature:
     *
     * ```javascript
     * function my_token_render(tokens, idx, options, env, renderer) {
     *   // ...
     *   return renderedHTML;
     * }
     * ```
     *
     * See [source code](https://github.com/markdown-it/markdown-it/blob/master/lib/renderer.mjs)
     * for more details and examples.
     **/
    this.rules = assign$1({}, default_rules);
  }
  /**
   * Renderer.renderAttrs(token) -> String
   *
   * Render token attributes to string.
   **/  Renderer.prototype.renderAttrs = function renderAttrs(token) {
    let i, l, result;
    if (!token.attrs) {
      return "";
    }
    result = "";
    for (i = 0, l = token.attrs.length; i < l; i++) {
      result += " " + escapeHtml(token.attrs[i][0]) + '="' + escapeHtml(token.attrs[i][1]) + '"';
    }
    return result;
  };
  /**
   * Renderer.renderToken(tokens, idx, options) -> String
   * - tokens (Array): list of tokens
   * - idx (Numbed): token index to render
   * - options (Object): params of parser instance
   *
   * Default token renderer. Can be overriden by custom function
   * in [[Renderer#rules]].
   **/  Renderer.prototype.renderToken = function renderToken(tokens, idx, options) {
    const token = tokens[idx];
    let result = "";
    // Tight list paragraphs
        if (token.hidden) {
      return "";
    }
    // Insert a newline between hidden paragraph and subsequent opening
    // block-level tag.
    
    // For example, here we should insert a newline before blockquote:
    //  - a
    //    >
    
        if (token.block && token.nesting !== -1 && idx && tokens[idx - 1].hidden) {
      result += "\n";
    }
    // Add token name, e.g. `<img`
        result += (token.nesting === -1 ? "</" : "<") + token.tag;
    // Encode attributes, e.g. `<img src="foo"`
        result += this.renderAttrs(token);
    // Add a slash for self-closing tags, e.g. `<img src="foo" /`
        if (token.nesting === 0 && options.xhtmlOut) {
      result += " /";
    }
    // Check if we need to add a newline after this tag
        let needLf = false;
    if (token.block) {
      needLf = true;
      if (token.nesting === 1) {
        if (idx + 1 < tokens.length) {
          const nextToken = tokens[idx + 1];
          if (nextToken.type === "inline" || nextToken.hidden) {
            // Block-level tag containing an inline tag.
            needLf = false;
          } else if (nextToken.nesting === -1 && nextToken.tag === token.tag) {
            // Opening tag + closing tag of the same type. E.g. `<li></li>`.
            needLf = false;
          }
        }
      }
    }
    result += needLf ? ">\n" : ">";
    return result;
  };
  /**
   * Renderer.renderInline(tokens, options, env) -> String
   * - tokens (Array): list on block tokens to render
   * - options (Object): params of parser instance
   * - env (Object): additional data from parsed input (references, for example)
   *
   * The same as [[Renderer.render]], but for single token of `inline` type.
   **/  Renderer.prototype.renderInline = function(tokens, options, env) {
    let result = "";
    const rules = this.rules;
    for (let i = 0, len = tokens.length; i < len; i++) {
      const type = tokens[i].type;
      if (typeof rules[type] !== "undefined") {
        result += rules[type](tokens, i, options, env, this);
      } else {
        result += this.renderToken(tokens, i, options);
      }
    }
    return result;
  };
  /** internal
   * Renderer.renderInlineAsText(tokens, options, env) -> String
   * - tokens (Array): list on block tokens to render
   * - options (Object): params of parser instance
   * - env (Object): additional data from parsed input (references, for example)
   *
   * Special kludge for image `alt` attributes to conform CommonMark spec.
   * Don't try to use it! Spec requires to show `alt` content with stripped markup,
   * instead of simple escaping.
   **/  Renderer.prototype.renderInlineAsText = function(tokens, options, env) {
    let result = "";
    for (let i = 0, len = tokens.length; i < len; i++) {
      switch (tokens[i].type) {
       case "text":
        result += tokens[i].content;
        break;

       case "image":
        result += this.renderInlineAsText(tokens[i].children, options, env);
        break;

       case "html_inline":
       case "html_block":
        result += tokens[i].content;
        break;

       case "softbreak":
       case "hardbreak":
        result += "\n";
        break;
        // all other tokens are skipped
            }
    }
    return result;
  };
  /**
   * Renderer.render(tokens, options, env) -> String
   * - tokens (Array): list on block tokens to render
   * - options (Object): params of parser instance
   * - env (Object): additional data from parsed input (references, for example)
   *
   * Takes token stream and generates HTML. Probably, you will never need to call
   * this method directly.
   **/  Renderer.prototype.render = function(tokens, options, env) {
    let result = "";
    const rules = this.rules;
    for (let i = 0, len = tokens.length; i < len; i++) {
      const type = tokens[i].type;
      if (type === "inline") {
        result += this.renderInline(tokens[i].children, options, env);
      } else if (typeof rules[type] !== "undefined") {
        result += rules[type](tokens, i, options, env, this);
      } else {
        result += this.renderToken(tokens, i, options, env);
      }
    }
    return result;
  };
  /**
   * class Ruler
   *
   * Helper class, used by [[MarkdownIt#core]], [[MarkdownIt#block]] and
   * [[MarkdownIt#inline]] to manage sequences of functions (rules):
   *
   * - keep rules in defined order
   * - assign the name to each rule
   * - enable/disable rules
   * - add/replace rules
   * - allow assign rules to additional named chains (in the same)
   * - cacheing lists of active rules
   *
   * You will not need use this class directly until write plugins. For simple
   * rules control use [[MarkdownIt.disable]], [[MarkdownIt.enable]] and
   * [[MarkdownIt.use]].
   **/
  /**
   * new Ruler()
   **/  function Ruler() {
    // List of added rules. Each element is:
    // {
    //   name: XXX,
    //   enabled: Boolean,
    //   fn: Function(),
    //   alt: [ name2, name3 ]
    // }
    this.__rules__ = [];
    // Cached rule chains.
    
    // First level - chain name, '' for default.
    // Second level - diginal anchor for fast filtering by charcodes.
    
        this.__cache__ = null;
  }
  // Helper methods, should not be used directly
  // Find rule index by name
  
    Ruler.prototype.__find__ = function(name) {
    for (let i = 0; i < this.__rules__.length; i++) {
      if (this.__rules__[i].name === name) {
        return i;
      }
    }
    return -1;
  };
  // Build rules lookup cache
  
    Ruler.prototype.__compile__ = function() {
    const self = this;
    const chains = [ "" ];
    // collect unique names
        self.__rules__.forEach((function(rule) {
      if (!rule.enabled) {
        return;
      }
      rule.alt.forEach((function(altName) {
        if (chains.indexOf(altName) < 0) {
          chains.push(altName);
        }
      }));
    }));
    self.__cache__ = {};
    chains.forEach((function(chain) {
      self.__cache__[chain] = [];
      self.__rules__.forEach((function(rule) {
        if (!rule.enabled) {
          return;
        }
        if (chain && rule.alt.indexOf(chain) < 0) {
          return;
        }
        self.__cache__[chain].push(rule.fn);
      }));
    }));
  };
  /**
   * Ruler.at(name, fn [, options])
   * - name (String): rule name to replace.
   * - fn (Function): new rule function.
   * - options (Object): new rule options (not mandatory).
   *
   * Replace rule by name with new function & options. Throws error if name not
   * found.
   *
   * ##### Options:
   *
   * - __alt__ - array with names of "alternate" chains.
   *
   * ##### Example
   *
   * Replace existing typographer replacement rule with new one:
   *
   * ```javascript
   * var md = require('markdown-it')();
   *
   * md.core.ruler.at('replacements', function replace(state) {
   *   //...
   * });
   * ```
   **/  Ruler.prototype.at = function(name, fn, options) {
    const index = this.__find__(name);
    const opt = options || {};
    if (index === -1) {
      throw new Error("Parser rule not found: " + name);
    }
    this.__rules__[index].fn = fn;
    this.__rules__[index].alt = opt.alt || [];
    this.__cache__ = null;
  };
  /**
   * Ruler.before(beforeName, ruleName, fn [, options])
   * - beforeName (String): new rule will be added before this one.
   * - ruleName (String): name of added rule.
   * - fn (Function): rule function.
   * - options (Object): rule options (not mandatory).
   *
   * Add new rule to chain before one with given name. See also
   * [[Ruler.after]], [[Ruler.push]].
   *
   * ##### Options:
   *
   * - __alt__ - array with names of "alternate" chains.
   *
   * ##### Example
   *
   * ```javascript
   * var md = require('markdown-it')();
   *
   * md.block.ruler.before('paragraph', 'my_rule', function replace(state) {
   *   //...
   * });
   * ```
   **/  Ruler.prototype.before = function(beforeName, ruleName, fn, options) {
    const index = this.__find__(beforeName);
    const opt = options || {};
    if (index === -1) {
      throw new Error("Parser rule not found: " + beforeName);
    }
    this.__rules__.splice(index, 0, {
      name: ruleName,
      enabled: true,
      fn: fn,
      alt: opt.alt || []
    });
    this.__cache__ = null;
  };
  /**
   * Ruler.after(afterName, ruleName, fn [, options])
   * - afterName (String): new rule will be added after this one.
   * - ruleName (String): name of added rule.
   * - fn (Function): rule function.
   * - options (Object): rule options (not mandatory).
   *
   * Add new rule to chain after one with given name. See also
   * [[Ruler.before]], [[Ruler.push]].
   *
   * ##### Options:
   *
   * - __alt__ - array with names of "alternate" chains.
   *
   * ##### Example
   *
   * ```javascript
   * var md = require('markdown-it')();
   *
   * md.inline.ruler.after('text', 'my_rule', function replace(state) {
   *   //...
   * });
   * ```
   **/  Ruler.prototype.after = function(afterName, ruleName, fn, options) {
    const index = this.__find__(afterName);
    const opt = options || {};
    if (index === -1) {
      throw new Error("Parser rule not found: " + afterName);
    }
    this.__rules__.splice(index + 1, 0, {
      name: ruleName,
      enabled: true,
      fn: fn,
      alt: opt.alt || []
    });
    this.__cache__ = null;
  };
  /**
   * Ruler.push(ruleName, fn [, options])
   * - ruleName (String): name of added rule.
   * - fn (Function): rule function.
   * - options (Object): rule options (not mandatory).
   *
   * Push new rule to the end of chain. See also
   * [[Ruler.before]], [[Ruler.after]].
   *
   * ##### Options:
   *
   * - __alt__ - array with names of "alternate" chains.
   *
   * ##### Example
   *
   * ```javascript
   * var md = require('markdown-it')();
   *
   * md.core.ruler.push('my_rule', function replace(state) {
   *   //...
   * });
   * ```
   **/  Ruler.prototype.push = function(ruleName, fn, options) {
    const opt = options || {};
    this.__rules__.push({
      name: ruleName,
      enabled: true,
      fn: fn,
      alt: opt.alt || []
    });
    this.__cache__ = null;
  };
  /**
   * Ruler.enable(list [, ignoreInvalid]) -> Array
   * - list (String|Array): list of rule names to enable.
   * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
   *
   * Enable rules with given names. If any rule name not found - throw Error.
   * Errors can be disabled by second param.
   *
   * Returns list of found rule names (if no exception happened).
   *
   * See also [[Ruler.disable]], [[Ruler.enableOnly]].
   **/  Ruler.prototype.enable = function(list, ignoreInvalid) {
    if (!Array.isArray(list)) {
      list = [ list ];
    }
    const result = [];
    // Search by name and enable
        list.forEach((function(name) {
      const idx = this.__find__(name);
      if (idx < 0) {
        if (ignoreInvalid) {
          return;
        }
        throw new Error("Rules manager: invalid rule name " + name);
      }
      this.__rules__[idx].enabled = true;
      result.push(name);
    }), this);
    this.__cache__ = null;
    return result;
  };
  /**
   * Ruler.enableOnly(list [, ignoreInvalid])
   * - list (String|Array): list of rule names to enable (whitelist).
   * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
   *
   * Enable rules with given names, and disable everything else. If any rule name
   * not found - throw Error. Errors can be disabled by second param.
   *
   * See also [[Ruler.disable]], [[Ruler.enable]].
   **/  Ruler.prototype.enableOnly = function(list, ignoreInvalid) {
    if (!Array.isArray(list)) {
      list = [ list ];
    }
    this.__rules__.forEach((function(rule) {
      rule.enabled = false;
    }));
    this.enable(list, ignoreInvalid);
  };
  /**
   * Ruler.disable(list [, ignoreInvalid]) -> Array
   * - list (String|Array): list of rule names to disable.
   * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
   *
   * Disable rules with given names. If any rule name not found - throw Error.
   * Errors can be disabled by second param.
   *
   * Returns list of found rule names (if no exception happened).
   *
   * See also [[Ruler.enable]], [[Ruler.enableOnly]].
   **/  Ruler.prototype.disable = function(list, ignoreInvalid) {
    if (!Array.isArray(list)) {
      list = [ list ];
    }
    const result = [];
    // Search by name and disable
        list.forEach((function(name) {
      const idx = this.__find__(name);
      if (idx < 0) {
        if (ignoreInvalid) {
          return;
        }
        throw new Error("Rules manager: invalid rule name " + name);
      }
      this.__rules__[idx].enabled = false;
      result.push(name);
    }), this);
    this.__cache__ = null;
    return result;
  };
  /**
   * Ruler.getRules(chainName) -> Array
   *
   * Return array of active functions (rules) for given chain name. It analyzes
   * rules configuration, compiles caches if not exists and returns result.
   *
   * Default chain name is `''` (empty string). It can't be skipped. That's
   * done intentionally, to keep signature monomorphic for high speed.
   **/  Ruler.prototype.getRules = function(chainName) {
    if (this.__cache__ === null) {
      this.__compile__();
    }
    // Chain can be empty, if rules disabled. But we still have to return Array.
        return this.__cache__[chainName] || [];
  };
  // Token class
  /**
   * class Token
   **/
  /**
   * new Token(type, tag, nesting)
   *
   * Create new token and fill passed properties.
   **/  function Token(type, tag, nesting) {
    /**
     * Token#type -> String
     *
     * Type of the token (string, e.g. "paragraph_open")
     **/
    this.type = type;
    /**
     * Token#tag -> String
     *
     * html tag name, e.g. "p"
     **/    this.tag = tag;
    /**
     * Token#attrs -> Array
     *
     * Html attributes. Format: `[ [ name1, value1 ], [ name2, value2 ] ]`
     **/    this.attrs = null;
    /**
     * Token#map -> Array
     *
     * Source map info. Format: `[ line_begin, line_end ]`
     **/    this.map = null;
    /**
     * Token#nesting -> Number
     *
     * Level change (number in {-1, 0, 1} set), where:
     *
     * -  `1` means the tag is opening
     * -  `0` means the tag is self-closing
     * - `-1` means the tag is closing
     **/    this.nesting = nesting;
    /**
     * Token#level -> Number
     *
     * nesting level, the same as `state.level`
     **/    this.level = 0;
    /**
     * Token#children -> Array
     *
     * An array of child nodes (inline and img tokens)
     **/    this.children = null;
    /**
     * Token#content -> String
     *
     * In a case of self-closing tag (code, html, fence, etc.),
     * it has contents of this tag.
     **/    this.content = "";
    /**
     * Token#markup -> String
     *
     * '*' or '_' for emphasis, fence string for fence, etc.
     **/    this.markup = "";
    /**
     * Token#info -> String
     *
     * Additional information:
     *
     * - Info string for "fence" tokens
     * - The value "auto" for autolink "link_open" and "link_close" tokens
     * - The string value of the item marker for ordered-list "list_item_open" tokens
     **/    this.info = "";
    /**
     * Token#meta -> Object
     *
     * A place for plugins to store an arbitrary data
     **/    this.meta = null;
    /**
     * Token#block -> Boolean
     *
     * True for block-level tokens, false for inline tokens.
     * Used in renderer to calculate line breaks
     **/    this.block = false;
    /**
     * Token#hidden -> Boolean
     *
     * If it's true, ignore this element when rendering. Used for tight lists
     * to hide paragraphs.
     **/    this.hidden = false;
  }
  /**
   * Token.attrIndex(name) -> Number
   *
   * Search attribute index by name.
   **/  Token.prototype.attrIndex = function attrIndex(name) {
    if (!this.attrs) {
      return -1;
    }
    const attrs = this.attrs;
    for (let i = 0, len = attrs.length; i < len; i++) {
      if (attrs[i][0] === name) {
        return i;
      }
    }
    return -1;
  };
  /**
   * Token.attrPush(attrData)
   *
   * Add `[ name, value ]` attribute to list. Init attrs if necessary
   **/  Token.prototype.attrPush = function attrPush(attrData) {
    if (this.attrs) {
      this.attrs.push(attrData);
    } else {
      this.attrs = [ attrData ];
    }
  };
  /**
   * Token.attrSet(name, value)
   *
   * Set `name` attribute to `value`. Override old value if exists.
   **/  Token.prototype.attrSet = function attrSet(name, value) {
    const idx = this.attrIndex(name);
    const attrData = [ name, value ];
    if (idx < 0) {
      this.attrPush(attrData);
    } else {
      this.attrs[idx] = attrData;
    }
  };
  /**
   * Token.attrGet(name)
   *
   * Get the value of attribute `name`, or null if it does not exist.
   **/  Token.prototype.attrGet = function attrGet(name) {
    const idx = this.attrIndex(name);
    let value = null;
    if (idx >= 0) {
      value = this.attrs[idx][1];
    }
    return value;
  };
  /**
   * Token.attrJoin(name, value)
   *
   * Join value to existing attribute via space. Or create new attribute if not
   * exists. Useful to operate with token classes.
   **/  Token.prototype.attrJoin = function attrJoin(name, value) {
    const idx = this.attrIndex(name);
    if (idx < 0) {
      this.attrPush([ name, value ]);
    } else {
      this.attrs[idx][1] = this.attrs[idx][1] + " " + value;
    }
  };
  // Core state object
  
    function StateCore(src, md, env) {
    this.src = src;
    this.env = env;
    this.tokens = [];
    this.inlineMode = false;
    this.md = md;
 // link to parser instance
    }
  // re-export Token class to use in core rules
    StateCore.prototype.Token = Token;
  // Normalize input string
  // https://spec.commonmark.org/0.29/#line-ending
    const NEWLINES_RE = /\r\n?|\n/g;
  const NULL_RE = /\0/g;
  function normalize(state) {
    let str;
    // Normalize newlines
        str = state.src.replace(NEWLINES_RE, "\n");
    // Replace NULL characters
        str = str.replace(NULL_RE, "\ufffd");
    state.src = str;
  }
  function block(state) {
    let token;
    if (state.inlineMode) {
      token = new state.Token("inline", "", 0);
      token.content = state.src;
      token.map = [ 0, 1 ];
      token.children = [];
      state.tokens.push(token);
    } else {
      state.md.block.parse(state.src, state.md, state.env, state.tokens);
    }
  }
  function inline(state) {
    const tokens = state.tokens;
    // Parse inlines
        for (let i = 0, l = tokens.length; i < l; i++) {
      const tok = tokens[i];
      if (tok.type === "inline") {
        state.md.inline.parse(tok.content, state.md, state.env, tok.children);
      }
    }
  }
  // Replace link-like texts with link nodes.
  
  // Currently restricted by `md.validateLink()` to http/https/ftp
  
    function isLinkOpen$1(str) {
    return /^<a[>\s]/i.test(str);
  }
  function isLinkClose$1(str) {
    return /^<\/a\s*>/i.test(str);
  }
  function linkify$1(state) {
    const blockTokens = state.tokens;
    if (!state.md.options.linkify) {
      return;
    }
    for (let j = 0, l = blockTokens.length; j < l; j++) {
      if (blockTokens[j].type !== "inline" || !state.md.linkify.pretest(blockTokens[j].content)) {
        continue;
      }
      let tokens = blockTokens[j].children;
      let htmlLinkLevel = 0;
      // We scan from the end, to keep position when new tags added.
      // Use reversed logic in links start/end match
            for (let i = tokens.length - 1; i >= 0; i--) {
        const currentToken = tokens[i];
        // Skip content of markdown links
                if (currentToken.type === "link_close") {
          i--;
          while (tokens[i].level !== currentToken.level && tokens[i].type !== "link_open") {
            i--;
          }
          continue;
        }
        // Skip content of html tag links
                if (currentToken.type === "html_inline") {
          if (isLinkOpen$1(currentToken.content) && htmlLinkLevel > 0) {
            htmlLinkLevel--;
          }
          if (isLinkClose$1(currentToken.content)) {
            htmlLinkLevel++;
          }
        }
        if (htmlLinkLevel > 0) {
          continue;
        }
        if (currentToken.type === "text" && state.md.linkify.test(currentToken.content)) {
          const text = currentToken.content;
          let links = state.md.linkify.match(text);
          // Now split string to nodes
                    const nodes = [];
          let level = currentToken.level;
          let lastPos = 0;
          // forbid escape sequence at the start of the string,
          // this avoids http\://example.com/ from being linkified as
          // http:<a href="//example.com/">//example.com/</a>
                    if (links.length > 0 && links[0].index === 0 && i > 0 && tokens[i - 1].type === "text_special") {
            links = links.slice(1);
          }
          for (let ln = 0; ln < links.length; ln++) {
            const url = links[ln].url;
            const fullUrl = state.md.normalizeLink(url);
            if (!state.md.validateLink(fullUrl)) {
              continue;
            }
            let urlText = links[ln].text;
            // Linkifier might send raw hostnames like "example.com", where url
            // starts with domain name. So we prepend http:// in those cases,
            // and remove it afterwards.
            
                        if (!links[ln].schema) {
              urlText = state.md.normalizeLinkText("http://" + urlText).replace(/^http:\/\//, "");
            } else if (links[ln].schema === "mailto:" && !/^mailto:/i.test(urlText)) {
              urlText = state.md.normalizeLinkText("mailto:" + urlText).replace(/^mailto:/, "");
            } else {
              urlText = state.md.normalizeLinkText(urlText);
            }
            const pos = links[ln].index;
            if (pos > lastPos) {
              const token = new state.Token("text", "", 0);
              token.content = text.slice(lastPos, pos);
              token.level = level;
              nodes.push(token);
            }
            const token_o = new state.Token("link_open", "a", 1);
            token_o.attrs = [ [ "href", fullUrl ] ];
            token_o.level = level++;
            token_o.markup = "linkify";
            token_o.info = "auto";
            nodes.push(token_o);
            const token_t = new state.Token("text", "", 0);
            token_t.content = urlText;
            token_t.level = level;
            nodes.push(token_t);
            const token_c = new state.Token("link_close", "a", -1);
            token_c.level = --level;
            token_c.markup = "linkify";
            token_c.info = "auto";
            nodes.push(token_c);
            lastPos = links[ln].lastIndex;
          }
          if (lastPos < text.length) {
            const token = new state.Token("text", "", 0);
            token.content = text.slice(lastPos);
            token.level = level;
            nodes.push(token);
          }
          // replace current node
                    blockTokens[j].children = tokens = arrayReplaceAt(tokens, i, nodes);
        }
      }
    }
  }
  // Simple typographic replacements
  
  // (c) (C) â†’ Â©
  // (tm) (TM) â†’ â„¢
  // (r) (R) â†’ Â®
  // +- â†’ Â±
  // ... â†’ â€¦ (also ?.... â†’ ?.., !.... â†’ !..)
  // ???????? â†’ ???, !!!!! â†’ !!!, `,,` â†’ `,`
  // -- â†’ &ndash;, --- â†’ &mdash;
  
  // TODO:
  // - fractionals 1/2, 1/4, 3/4 -> Â½, Â¼, Â¾
  // - multiplications 2 x 4 -> 2 Ã— 4
    const RARE_RE = /\+-|\.\.|\?\?\?\?|!!!!|,,|--/;
  // Workaround for phantomjs - need regex without /g flag,
  // or root check will fail every second time
    const SCOPED_ABBR_TEST_RE = /\((c|tm|r)\)/i;
  const SCOPED_ABBR_RE = /\((c|tm|r)\)/gi;
  const SCOPED_ABBR = {
    c: "\xa9",
    r: "\xae",
    tm: "\u2122"
  };
  function replaceFn(match, name) {
    return SCOPED_ABBR[name.toLowerCase()];
  }
  function replace_scoped(inlineTokens) {
    let inside_autolink = 0;
    for (let i = inlineTokens.length - 1; i >= 0; i--) {
      const token = inlineTokens[i];
      if (token.type === "text" && !inside_autolink) {
        token.content = token.content.replace(SCOPED_ABBR_RE, replaceFn);
      }
      if (token.type === "link_open" && token.info === "auto") {
        inside_autolink--;
      }
      if (token.type === "link_close" && token.info === "auto") {
        inside_autolink++;
      }
    }
  }
  function replace_rare(inlineTokens) {
    let inside_autolink = 0;
    for (let i = inlineTokens.length - 1; i >= 0; i--) {
      const token = inlineTokens[i];
      if (token.type === "text" && !inside_autolink) {
        if (RARE_RE.test(token.content)) {
          token.content = token.content.replace(/\+-/g, "\xb1").replace(/\.{2,}/g, "\u2026").replace(/([?!])\u2026/g, "$1..").replace(/([?!]){4,}/g, "$1$1$1").replace(/,{2,}/g, ",").replace(/(^|[^-])---(?=[^-]|$)/gm, "$1\u2014").replace(/(^|\s)--(?=\s|$)/gm, "$1\u2013").replace(/(^|[^-\s])--(?=[^-\s]|$)/gm, "$1\u2013");
        }
      }
      if (token.type === "link_open" && token.info === "auto") {
        inside_autolink--;
      }
      if (token.type === "link_close" && token.info === "auto") {
        inside_autolink++;
      }
    }
  }
  function replace(state) {
    let blkIdx;
    if (!state.md.options.typographer) {
      return;
    }
    for (blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {
      if (state.tokens[blkIdx].type !== "inline") {
        continue;
      }
      if (SCOPED_ABBR_TEST_RE.test(state.tokens[blkIdx].content)) {
        replace_scoped(state.tokens[blkIdx].children);
      }
      if (RARE_RE.test(state.tokens[blkIdx].content)) {
        replace_rare(state.tokens[blkIdx].children);
      }
    }
  }
  // Convert straight quotation marks to typographic ones
  
    const QUOTE_TEST_RE = /['"]/;
  const QUOTE_RE = /['"]/g;
  const APOSTROPHE = "\u2019";
 /* â€™ */  function replaceAt(str, index, ch) {
    return str.slice(0, index) + ch + str.slice(index + 1);
  }
  function process_inlines(tokens, state) {
    let j;
    const stack = [];
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const thisLevel = tokens[i].level;
      for (j = stack.length - 1; j >= 0; j--) {
        if (stack[j].level <= thisLevel) {
          break;
        }
      }
      stack.length = j + 1;
      if (token.type !== "text") {
        continue;
      }
      let text = token.content;
      let pos = 0;
      let max = text.length;
      /* eslint no-labels:0,block-scoped-var:0 */      OUTER: while (pos < max) {
        QUOTE_RE.lastIndex = pos;
        const t = QUOTE_RE.exec(text);
        if (!t) {
          break;
        }
        let canOpen = true;
        let canClose = true;
        pos = t.index + 1;
        const isSingle = t[0] === "'";
        // Find previous character,
        // default to space if it's the beginning of the line
        
                let lastChar = 32;
        if (t.index - 1 >= 0) {
          lastChar = text.charCodeAt(t.index - 1);
        } else {
          for (j = i - 1; j >= 0; j--) {
            if (tokens[j].type === "softbreak" || tokens[j].type === "hardbreak") break;
 // lastChar defaults to 0x20
                        if (!tokens[j].content) continue;
 // should skip all tokens except 'text', 'html_inline' or 'code_inline'
                        lastChar = tokens[j].content.charCodeAt(tokens[j].content.length - 1);
            break;
          }
        }
        // Find next character,
        // default to space if it's the end of the line
        
                let nextChar = 32;
        if (pos < max) {
          nextChar = text.charCodeAt(pos);
        } else {
          for (j = i + 1; j < tokens.length; j++) {
            if (tokens[j].type === "softbreak" || tokens[j].type === "hardbreak") break;
 // nextChar defaults to 0x20
                        if (!tokens[j].content) continue;
 // should skip all tokens except 'text', 'html_inline' or 'code_inline'
                        nextChar = tokens[j].content.charCodeAt(0);
            break;
          }
        }
        const isLastPunctChar = isMdAsciiPunct(lastChar) || isPunctChar(String.fromCharCode(lastChar));
        const isNextPunctChar = isMdAsciiPunct(nextChar) || isPunctChar(String.fromCharCode(nextChar));
        const isLastWhiteSpace = isWhiteSpace(lastChar);
        const isNextWhiteSpace = isWhiteSpace(nextChar);
        if (isNextWhiteSpace) {
          canOpen = false;
        } else if (isNextPunctChar) {
          if (!(isLastWhiteSpace || isLastPunctChar)) {
            canOpen = false;
          }
        }
        if (isLastWhiteSpace) {
          canClose = false;
        } else if (isLastPunctChar) {
          if (!(isNextWhiteSpace || isNextPunctChar)) {
            canClose = false;
          }
        }
        if (nextChar === 34 /* " */ && t[0] === '"') {
          if (lastChar >= 48 /* 0 */ && lastChar <= 57 /* 9 */) {
            // special case: 1"" - count first quote as an inch
            canClose = canOpen = false;
          }
        }
        if (canOpen && canClose) {
          // Replace quotes in the middle of punctuation sequence, but not
          // in the middle of the words, i.e.:
          // 1. foo " bar " baz - not replaced
          // 2. foo-"-bar-"-baz - replaced
          // 3. foo"bar"baz     - not replaced
          canOpen = isLastPunctChar;
          canClose = isNextPunctChar;
        }
        if (!canOpen && !canClose) {
          // middle of word
          if (isSingle) {
            token.content = replaceAt(token.content, t.index, APOSTROPHE);
          }
          continue;
        }
        if (canClose) {
          // this could be a closing quote, rewind the stack to get a match
          for (j = stack.length - 1; j >= 0; j--) {
            let item = stack[j];
            if (stack[j].level < thisLevel) {
              break;
            }
            if (item.single === isSingle && stack[j].level === thisLevel) {
              item = stack[j];
              let openQuote;
              let closeQuote;
              if (isSingle) {
                openQuote = state.md.options.quotes[2];
                closeQuote = state.md.options.quotes[3];
              } else {
                openQuote = state.md.options.quotes[0];
                closeQuote = state.md.options.quotes[1];
              }
              // replace token.content *before* tokens[item.token].content,
              // because, if they are pointing at the same token, replaceAt
              // could mess up indices when quote length != 1
                            token.content = replaceAt(token.content, t.index, closeQuote);
              tokens[item.token].content = replaceAt(tokens[item.token].content, item.pos, openQuote);
              pos += closeQuote.length - 1;
              if (item.token === i) {
                pos += openQuote.length - 1;
              }
              text = token.content;
              max = text.length;
              stack.length = j;
              continue OUTER;
            }
          }
        }
        if (canOpen) {
          stack.push({
            token: i,
            pos: t.index,
            single: isSingle,
            level: thisLevel
          });
        } else if (canClose && isSingle) {
          token.content = replaceAt(token.content, t.index, APOSTROPHE);
        }
      }
    }
  }
  function smartquotes(state) {
    /* eslint max-depth:0 */
    if (!state.md.options.typographer) {
      return;
    }
    for (let blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {
      if (state.tokens[blkIdx].type !== "inline" || !QUOTE_TEST_RE.test(state.tokens[blkIdx].content)) {
        continue;
      }
      process_inlines(state.tokens[blkIdx].children, state);
    }
  }
  // Join raw text tokens with the rest of the text
  
  // This is set as a separate rule to provide an opportunity for plugins
  // to run text replacements after text join, but before escape join.
  
  // For example, `\:)` shouldn't be replaced with an emoji.
  
    function text_join(state) {
    let curr, last;
    const blockTokens = state.tokens;
    const l = blockTokens.length;
    for (let j = 0; j < l; j++) {
      if (blockTokens[j].type !== "inline") continue;
      const tokens = blockTokens[j].children;
      const max = tokens.length;
      for (curr = 0; curr < max; curr++) {
        if (tokens[curr].type === "text_special") {
          tokens[curr].type = "text";
        }
      }
      for (curr = last = 0; curr < max; curr++) {
        if (tokens[curr].type === "text" && curr + 1 < max && tokens[curr + 1].type === "text") {
          // collapse two adjacent text nodes
          tokens[curr + 1].content = tokens[curr].content + tokens[curr + 1].content;
        } else {
          if (curr !== last) {
            tokens[last] = tokens[curr];
          }
          last++;
        }
      }
      if (curr !== last) {
        tokens.length = last;
      }
    }
  }
  /** internal
   * class Core
   *
   * Top-level rules executor. Glues block/inline parsers and does intermediate
   * transformations.
   **/  const _rules$2 = [ [ "normalize", normalize ], [ "block", block ], [ "inline", inline ], [ "linkify", linkify$1 ], [ "replacements", replace ], [ "smartquotes", smartquotes ], 
  // `text_join` finds `text_special` tokens (for escape sequences)
  // and joins them with the rest of the text
  [ "text_join", text_join ] ];
  /**
   * new Core()
   **/  function Core() {
    /**
     * Core#ruler -> Ruler
     *
     * [[Ruler]] instance. Keep configuration of core rules.
     **/
    this.ruler = new Ruler;
    for (let i = 0; i < _rules$2.length; i++) {
      this.ruler.push(_rules$2[i][0], _rules$2[i][1]);
    }
  }
  /**
   * Core.process(state)
   *
   * Executes core chain rules.
   **/  Core.prototype.process = function(state) {
    const rules = this.ruler.getRules("");
    for (let i = 0, l = rules.length; i < l; i++) {
      rules[i](state);
    }
  };
  Core.prototype.State = StateCore;
  // Parser state class
    function StateBlock(src, md, env, tokens) {
    this.src = src;
    // link to parser instance
        this.md = md;
    this.env = env;
    
    // Internal state vartiables
    
        this.tokens = tokens;
    this.bMarks = [];
 // line begin offsets for fast jumps
        this.eMarks = [];
 // line end offsets for fast jumps
        this.tShift = [];
 // offsets of the first non-space characters (tabs not expanded)
        this.sCount = [];
 // indents for each line (tabs expanded)
    // An amount of virtual spaces (tabs expanded) between beginning
    // of each line (bMarks) and real beginning of that line.
    
    // It exists only as a hack because blockquotes override bMarks
    // losing information in the process.
    
    // It's used only when expanding tabs, you can think about it as
    // an initial tab length, e.g. bsCount=21 applied to string `\t123`
    // means first tab should be expanded to 4-21%4 === 3 spaces.
    
        this.bsCount = [];
    // block parser variables
    // required block content indent (for example, if we are
    // inside a list, it would be positioned after list marker)
        this.blkIndent = 0;
    this.line = 0;
 // line index in src
        this.lineMax = 0;
 // lines count
        this.tight = false;
 // loose/tight mode for lists
        this.ddIndent = -1;
 // indent of the current dd block (-1 if there isn't any)
        this.listIndent = -1;
 // indent of the current list block (-1 if there isn't any)
    // can be 'blockquote', 'list', 'root', 'paragraph' or 'reference'
    // used in lists to determine if they interrupt a paragraph
        this.parentType = "root";
    this.level = 0;
    // Create caches
    // Generate markers.
        const s = this.src;
    for (let start = 0, pos = 0, indent = 0, offset = 0, len = s.length, indent_found = false; pos < len; pos++) {
      const ch = s.charCodeAt(pos);
      if (!indent_found) {
        if (isSpace(ch)) {
          indent++;
          if (ch === 9) {
            offset += 4 - offset % 4;
          } else {
            offset++;
          }
          continue;
        } else {
          indent_found = true;
        }
      }
      if (ch === 10 || pos === len - 1) {
        if (ch !== 10) {
          pos++;
        }
        this.bMarks.push(start);
        this.eMarks.push(pos);
        this.tShift.push(indent);
        this.sCount.push(offset);
        this.bsCount.push(0);
        indent_found = false;
        indent = 0;
        offset = 0;
        start = pos + 1;
      }
    }
    // Push fake entry to simplify cache bounds checks
        this.bMarks.push(s.length);
    this.eMarks.push(s.length);
    this.tShift.push(0);
    this.sCount.push(0);
    this.bsCount.push(0);
    this.lineMax = this.bMarks.length - 1;
 // don't count last fake line
    }
  // Push new token to "stream".
  
    StateBlock.prototype.push = function(type, tag, nesting) {
    const token = new Token(type, tag, nesting);
    token.block = true;
    if (nesting < 0) this.level--;
 // closing tag
        token.level = this.level;
    if (nesting > 0) this.level++;
 // opening tag
        this.tokens.push(token);
    return token;
  };
  StateBlock.prototype.isEmpty = function isEmpty(line) {
    return this.bMarks[line] + this.tShift[line] >= this.eMarks[line];
  };
  StateBlock.prototype.skipEmptyLines = function skipEmptyLines(from) {
    for (let max = this.lineMax; from < max; from++) {
      if (this.bMarks[from] + this.tShift[from] < this.eMarks[from]) {
        break;
      }
    }
    return from;
  };
  // Skip spaces from given position.
    StateBlock.prototype.skipSpaces = function skipSpaces(pos) {
    for (let max = this.src.length; pos < max; pos++) {
      const ch = this.src.charCodeAt(pos);
      if (!isSpace(ch)) {
        break;
      }
    }
    return pos;
  };
  // Skip spaces from given position in reverse.
    StateBlock.prototype.skipSpacesBack = function skipSpacesBack(pos, min) {
    if (pos <= min) {
      return pos;
    }
    while (pos > min) {
      if (!isSpace(this.src.charCodeAt(--pos))) {
        return pos + 1;
      }
    }
    return pos;
  };
  // Skip char codes from given position
    StateBlock.prototype.skipChars = function skipChars(pos, code) {
    for (let max = this.src.length; pos < max; pos++) {
      if (this.src.charCodeAt(pos) !== code) {
        break;
      }
    }
    return pos;
  };
  // Skip char codes reverse from given position - 1
    StateBlock.prototype.skipCharsBack = function skipCharsBack(pos, code, min) {
    if (pos <= min) {
      return pos;
    }
    while (pos > min) {
      if (code !== this.src.charCodeAt(--pos)) {
        return pos + 1;
      }
    }
    return pos;
  };
  // cut lines range from source.
    StateBlock.prototype.getLines = function getLines(begin, end, indent, keepLastLF) {
    if (begin >= end) {
      return "";
    }
    const queue = new Array(end - begin);
    for (let i = 0, line = begin; line < end; line++, i++) {
      let lineIndent = 0;
      const lineStart = this.bMarks[line];
      let first = lineStart;
      let last;
      if (line + 1 < end || keepLastLF) {
        // No need for bounds check because we have fake entry on tail.
        last = this.eMarks[line] + 1;
      } else {
        last = this.eMarks[line];
      }
      while (first < last && lineIndent < indent) {
        const ch = this.src.charCodeAt(first);
        if (isSpace(ch)) {
          if (ch === 9) {
            lineIndent += 4 - (lineIndent + this.bsCount[line]) % 4;
          } else {
            lineIndent++;
          }
        } else if (first - lineStart < this.tShift[line]) {
          // patched tShift masked characters to look like spaces (blockquotes, list markers)
          lineIndent++;
        } else {
          break;
        }
        first++;
      }
      if (lineIndent > indent) {
        // partially expanding tabs in code blocks, e.g '\t\tfoobar'
        // with indent=2 becomes '  \tfoobar'
        queue[i] = new Array(lineIndent - indent + 1).join(" ") + this.src.slice(first, last);
      } else {
        queue[i] = this.src.slice(first, last);
      }
    }
    return queue.join("");
  };
  // re-export Token class to use in block rules
    StateBlock.prototype.Token = Token;
  // GFM table, https://github.github.com/gfm/#tables-extension-
  // Limit the amount of empty autocompleted cells in a table,
  // see https://github.com/markdown-it/markdown-it/issues/1000,
  
  // Both pulldown-cmark and commonmark-hs limit the number of cells this way to ~200k.
  // We set it to 65k, which can expand user input by a factor of x370
  // (256x256 square is 1.8kB expanded into 650kB).
    const MAX_AUTOCOMPLETED_CELLS = 65536;
  function getLine(state, line) {
    const pos = state.bMarks[line] + state.tShift[line];
    const max = state.eMarks[line];
    return state.src.slice(pos, max);
  }
  function escapedSplit(str) {
    const result = [];
    const max = str.length;
    let pos = 0;
    let ch = str.charCodeAt(pos);
    let isEscaped = false;
    let lastPos = 0;
    let current = "";
    while (pos < max) {
      if (ch === 124 /* | */) {
        if (!isEscaped) {
          // pipe separating cells, '|'
          result.push(current + str.substring(lastPos, pos));
          current = "";
          lastPos = pos + 1;
        } else {
          // escaped pipe, '\|'
          current += str.substring(lastPos, pos - 1);
          lastPos = pos;
        }
      }
      isEscaped = ch === 92 /* \ */;
      pos++;
      ch = str.charCodeAt(pos);
    }
    result.push(current + str.substring(lastPos));
    return result;
  }
  function table(state, startLine, endLine, silent) {
    // should have at least two lines
    if (startLine + 2 > endLine) {
      return false;
    }
    let nextLine = startLine + 1;
    if (state.sCount[nextLine] < state.blkIndent) {
      return false;
    }
    // if it's indented more than 3 spaces, it should be a code block
        if (state.sCount[nextLine] - state.blkIndent >= 4) {
      return false;
    }
    // first character of the second line should be '|', '-', ':',
    // and no other characters are allowed but spaces;
    // basically, this is the equivalent of /^[-:|][-:|\s]*$/ regexp
        let pos = state.bMarks[nextLine] + state.tShift[nextLine];
    if (pos >= state.eMarks[nextLine]) {
      return false;
    }
    const firstCh = state.src.charCodeAt(pos++);
    if (firstCh !== 124 /* | */ && firstCh !== 45 /* - */ && firstCh !== 58 /* : */) {
      return false;
    }
    if (pos >= state.eMarks[nextLine]) {
      return false;
    }
    const secondCh = state.src.charCodeAt(pos++);
    if (secondCh !== 124 /* | */ && secondCh !== 45 /* - */ && secondCh !== 58 /* : */ && !isSpace(secondCh)) {
      return false;
    }
    // if first character is '-', then second character must not be a space
    // (due to parsing ambiguity with list)
        if (firstCh === 45 /* - */ && isSpace(secondCh)) {
      return false;
    }
    while (pos < state.eMarks[nextLine]) {
      const ch = state.src.charCodeAt(pos);
      if (ch !== 124 /* | */ && ch !== 45 /* - */ && ch !== 58 /* : */ && !isSpace(ch)) {
        return false;
      }
      pos++;
    }
    let lineText = getLine(state, startLine + 1);
    let columns = lineText.split("|");
    const aligns = [];
    for (let i = 0; i < columns.length; i++) {
      const t = columns[i].trim();
      if (!t) {
        // allow empty columns before and after table, but not in between columns;
        // e.g. allow ` |---| `, disallow ` ---||--- `
        if (i === 0 || i === columns.length - 1) {
          continue;
        } else {
          return false;
        }
      }
      if (!/^:?-+:?$/.test(t)) {
        return false;
      }
      if (t.charCodeAt(t.length - 1) === 58 /* : */) {
        aligns.push(t.charCodeAt(0) === 58 /* : */ ? "center" : "right");
      } else if (t.charCodeAt(0) === 58 /* : */) {
        aligns.push("left");
      } else {
        aligns.push("");
      }
    }
    lineText = getLine(state, startLine).trim();
    if (lineText.indexOf("|") === -1) {
      return false;
    }
    if (state.sCount[startLine] - state.blkIndent >= 4) {
      return false;
    }
    columns = escapedSplit(lineText);
    if (columns.length && columns[0] === "") columns.shift();
    if (columns.length && columns[columns.length - 1] === "") columns.pop();
    // header row will define an amount of columns in the entire table,
    // and align row should be exactly the same (the rest of the rows can differ)
        const columnCount = columns.length;
    if (columnCount === 0 || columnCount !== aligns.length) {
      return false;
    }
    if (silent) {
      return true;
    }
    const oldParentType = state.parentType;
    state.parentType = "table";
    // use 'blockquote' lists for termination because it's
    // the most similar to tables
        const terminatorRules = state.md.block.ruler.getRules("blockquote");
    const token_to = state.push("table_open", "table", 1);
    const tableLines = [ startLine, 0 ];
    token_to.map = tableLines;
    const token_tho = state.push("thead_open", "thead", 1);
    token_tho.map = [ startLine, startLine + 1 ];
    const token_htro = state.push("tr_open", "tr", 1);
    token_htro.map = [ startLine, startLine + 1 ];
    for (let i = 0; i < columns.length; i++) {
      const token_ho = state.push("th_open", "th", 1);
      if (aligns[i]) {
        token_ho.attrs = [ [ "style", "text-align:" + aligns[i] ] ];
      }
      const token_il = state.push("inline", "", 0);
      token_il.content = columns[i].trim();
      token_il.children = [];
      state.push("th_close", "th", -1);
    }
    state.push("tr_close", "tr", -1);
    state.push("thead_close", "thead", -1);
    let tbodyLines;
    let autocompletedCells = 0;
    for (nextLine = startLine + 2; nextLine < endLine; nextLine++) {
      if (state.sCount[nextLine] < state.blkIndent) {
        break;
      }
      let terminate = false;
      for (let i = 0, l = terminatorRules.length; i < l; i++) {
        if (terminatorRules[i](state, nextLine, endLine, true)) {
          terminate = true;
          break;
        }
      }
      if (terminate) {
        break;
      }
      lineText = getLine(state, nextLine).trim();
      if (!lineText) {
        break;
      }
      if (state.sCount[nextLine] - state.blkIndent >= 4) {
        break;
      }
      columns = escapedSplit(lineText);
      if (columns.length && columns[0] === "") columns.shift();
      if (columns.length && columns[columns.length - 1] === "") columns.pop();
      // note: autocomplete count can be negative if user specifies more columns than header,
      // but that does not affect intended use (which is limiting expansion)
            autocompletedCells += columnCount - columns.length;
      if (autocompletedCells > MAX_AUTOCOMPLETED_CELLS) {
        break;
      }
      if (nextLine === startLine + 2) {
        const token_tbo = state.push("tbody_open", "tbody", 1);
        token_tbo.map = tbodyLines = [ startLine + 2, 0 ];
      }
      const token_tro = state.push("tr_open", "tr", 1);
      token_tro.map = [ nextLine, nextLine + 1 ];
      for (let i = 0; i < columnCount; i++) {
        const token_tdo = state.push("td_open", "td", 1);
        if (aligns[i]) {
          token_tdo.attrs = [ [ "style", "text-align:" + aligns[i] ] ];
        }
        const token_il = state.push("inline", "", 0);
        token_il.content = columns[i] ? columns[i].trim() : "";
        token_il.children = [];
        state.push("td_close", "td", -1);
      }
      state.push("tr_close", "tr", -1);
    }
    if (tbodyLines) {
      state.push("tbody_close", "tbody", -1);
      tbodyLines[1] = nextLine;
    }
    state.push("table_close", "table", -1);
    tableLines[1] = nextLine;
    state.parentType = oldParentType;
    state.line = nextLine;
    return true;
  }
  // Code block (4 spaces padded)
    function code(state, startLine, endLine /*, silent */) {
    if (state.sCount[startLine] - state.blkIndent < 4) {
      return false;
    }
    let nextLine = startLine + 1;
    let last = nextLine;
    while (nextLine < endLine) {
      if (state.isEmpty(nextLine)) {
        nextLine++;
        continue;
      }
      if (state.sCount[nextLine] - state.blkIndent >= 4) {
        nextLine++;
        last = nextLine;
        continue;
      }
      break;
    }
    state.line = last;
    const token = state.push("code_block", "code", 0);
    token.content = state.getLines(startLine, last, 4 + state.blkIndent, false) + "\n";
    token.map = [ startLine, state.line ];
    return true;
  }
  // fences (``` lang, ~~~ lang)
    function fence(state, startLine, endLine, silent) {
    let pos = state.bMarks[startLine] + state.tShift[startLine];
    let max = state.eMarks[startLine];
    // if it's indented more than 3 spaces, it should be a code block
        if (state.sCount[startLine] - state.blkIndent >= 4) {
      return false;
    }
    if (pos + 3 > max) {
      return false;
    }
    const marker = state.src.charCodeAt(pos);
    if (marker !== 126 /* ~ */ && marker !== 96 /* ` */) {
      return false;
    }
    // scan marker length
        let mem = pos;
    pos = state.skipChars(pos, marker);
    let len = pos - mem;
    if (len < 3) {
      return false;
    }
    const markup = state.src.slice(mem, pos);
    const params = state.src.slice(pos, max);
    if (marker === 96 /* ` */) {
      if (params.indexOf(String.fromCharCode(marker)) >= 0) {
        return false;
      }
    }
    // Since start is found, we can report success here in validation mode
        if (silent) {
      return true;
    }
    // search end of block
        let nextLine = startLine;
    let haveEndMarker = false;
    for (;;) {
      nextLine++;
      if (nextLine >= endLine) {
        // unclosed block should be autoclosed by end of document.
        // also block seems to be autoclosed by end of parent
        break;
      }
      pos = mem = state.bMarks[nextLine] + state.tShift[nextLine];
      max = state.eMarks[nextLine];
      if (pos < max && state.sCount[nextLine] < state.blkIndent) {
        // non-empty line with negative indent should stop the list:
        // - ```
        //  test
        break;
      }
      if (state.src.charCodeAt(pos) !== marker) {
        continue;
      }
      if (state.sCount[nextLine] - state.blkIndent >= 4) {
        // closing fence should be indented less than 4 spaces
        continue;
      }
      pos = state.skipChars(pos, marker);
      // closing code fence must be at least as long as the opening one
            if (pos - mem < len) {
        continue;
      }
      // make sure tail has spaces only
            pos = state.skipSpaces(pos);
      if (pos < max) {
        continue;
      }
      haveEndMarker = true;
      // found!
            break;
    }
    // If a fence has heading spaces, they should be removed from its inner block
        len = state.sCount[startLine];
    state.line = nextLine + (haveEndMarker ? 1 : 0);
    const token = state.push("fence", "code", 0);
    token.info = params;
    token.content = state.getLines(startLine + 1, nextLine, len, true);
    token.markup = markup;
    token.map = [ startLine, state.line ];
    return true;
  }
  // Block quotes
    function blockquote(state, startLine, endLine, silent) {
    let pos = state.bMarks[startLine] + state.tShift[startLine];
    let max = state.eMarks[startLine];
    const oldLineMax = state.lineMax;
    // if it's indented more than 3 spaces, it should be a code block
        if (state.sCount[startLine] - state.blkIndent >= 4) {
      return false;
    }
    // check the block quote marker
        if (state.src.charCodeAt(pos) !== 62 /* > */) {
      return false;
    }
    // we know that it's going to be a valid blockquote,
    // so no point trying to find the end of it in silent mode
        if (silent) {
      return true;
    }
    const oldBMarks = [];
    const oldBSCount = [];
    const oldSCount = [];
    const oldTShift = [];
    const terminatorRules = state.md.block.ruler.getRules("blockquote");
    const oldParentType = state.parentType;
    state.parentType = "blockquote";
    let lastLineEmpty = false;
    let nextLine;
    // Search the end of the block
    
    // Block ends with either:
    //  1. an empty line outside:
    //     ```
    //     > test
    
    //     ```
    //  2. an empty line inside:
    //     ```
    //     >
    //     test
    //     ```
    //  3. another tag:
    //     ```
    //     > test
    //      - - -
    //     ```
        for (nextLine = startLine; nextLine < endLine; nextLine++) {
      // check if it's outdented, i.e. it's inside list item and indented
      // less than said list item:
      // ```
      // 1. anything
      //    > current blockquote
      // 2. checking this line
      // ```
      const isOutdented = state.sCount[nextLine] < state.blkIndent;
      pos = state.bMarks[nextLine] + state.tShift[nextLine];
      max = state.eMarks[nextLine];
      if (pos >= max) {
        // Case 1: line is not inside the blockquote, and this line is empty.
        break;
      }
      if (state.src.charCodeAt(pos++) === 62 /* > */ && !isOutdented) {
        // This line is inside the blockquote.
        // set offset past spaces and ">"
        let initial = state.sCount[nextLine] + 1;
        let spaceAfterMarker;
        let adjustTab;
        // skip one optional space after '>'
                if (state.src.charCodeAt(pos) === 32 /* space */) {
          // ' >   test '
          //     ^ -- position start of line here:
          pos++;
          initial++;
          adjustTab = false;
          spaceAfterMarker = true;
        } else if (state.src.charCodeAt(pos) === 9 /* tab */) {
          spaceAfterMarker = true;
          if ((state.bsCount[nextLine] + initial) % 4 === 3) {
            // '  >\t  test '
            //       ^ -- position start of line here (tab has width===1)
            pos++;
            initial++;
            adjustTab = false;
          } else {
            // ' >\t  test '
            //    ^ -- position start of line here + shift bsCount slightly
            //         to make extra space appear
            adjustTab = true;
          }
        } else {
          spaceAfterMarker = false;
        }
        let offset = initial;
        oldBMarks.push(state.bMarks[nextLine]);
        state.bMarks[nextLine] = pos;
        while (pos < max) {
          const ch = state.src.charCodeAt(pos);
          if (isSpace(ch)) {
            if (ch === 9) {
              offset += 4 - (offset + state.bsCount[nextLine] + (adjustTab ? 1 : 0)) % 4;
            } else {
              offset++;
            }
          } else {
            break;
          }
          pos++;
        }
        lastLineEmpty = pos >= max;
        oldBSCount.push(state.bsCount[nextLine]);
        state.bsCount[nextLine] = state.sCount[nextLine] + 1 + (spaceAfterMarker ? 1 : 0);
        oldSCount.push(state.sCount[nextLine]);
        state.sCount[nextLine] = offset - initial;
        oldTShift.push(state.tShift[nextLine]);
        state.tShift[nextLine] = pos - state.bMarks[nextLine];
        continue;
      }
      // Case 2: line is not inside the blockquote, and the last line was empty.
            if (lastLineEmpty) {
        break;
      }
      // Case 3: another tag found.
            let terminate = false;
      for (let i = 0, l = terminatorRules.length; i < l; i++) {
        if (terminatorRules[i](state, nextLine, endLine, true)) {
          terminate = true;
          break;
        }
      }
      if (terminate) {
        // Quirk to enforce "hard termination mode" for paragraphs;
        // normally if you call `tokenize(state, startLine, nextLine)`,
        // paragraphs will look below nextLine for paragraph continuation,
        // but if blockquote is terminated by another tag, they shouldn't
        state.lineMax = nextLine;
        if (state.blkIndent !== 0) {
          // state.blkIndent was non-zero, we now set it to zero,
          // so we need to re-calculate all offsets to appear as
          // if indent wasn't changed
          oldBMarks.push(state.bMarks[nextLine]);
          oldBSCount.push(state.bsCount[nextLine]);
          oldTShift.push(state.tShift[nextLine]);
          oldSCount.push(state.sCount[nextLine]);
          state.sCount[nextLine] -= state.blkIndent;
        }
        break;
      }
      oldBMarks.push(state.bMarks[nextLine]);
      oldBSCount.push(state.bsCount[nextLine]);
      oldTShift.push(state.tShift[nextLine]);
      oldSCount.push(state.sCount[nextLine]);
      // A negative indentation means that this is a paragraph continuation
      
            state.sCount[nextLine] = -1;
    }
    const oldIndent = state.blkIndent;
    state.blkIndent = 0;
    const token_o = state.push("blockquote_open", "blockquote", 1);
    token_o.markup = ">";
    const lines = [ startLine, 0 ];
    token_o.map = lines;
    state.md.block.tokenize(state, startLine, nextLine);
    const token_c = state.push("blockquote_close", "blockquote", -1);
    token_c.markup = ">";
    state.lineMax = oldLineMax;
    state.parentType = oldParentType;
    lines[1] = state.line;
    // Restore original tShift; this might not be necessary since the parser
    // has already been here, but just to make sure we can do that.
        for (let i = 0; i < oldTShift.length; i++) {
      state.bMarks[i + startLine] = oldBMarks[i];
      state.tShift[i + startLine] = oldTShift[i];
      state.sCount[i + startLine] = oldSCount[i];
      state.bsCount[i + startLine] = oldBSCount[i];
    }
    state.blkIndent = oldIndent;
    return true;
  }
  // Horizontal rule
    function hr(state, startLine, endLine, silent) {
    const max = state.eMarks[startLine];
    // if it's indented more than 3 spaces, it should be a code block
        if (state.sCount[startLine] - state.blkIndent >= 4) {
      return false;
    }
    let pos = state.bMarks[startLine] + state.tShift[startLine];
    const marker = state.src.charCodeAt(pos++);
    // Check hr marker
        if (marker !== 42 /* * */ && marker !== 45 /* - */ && marker !== 95 /* _ */) {
      return false;
    }
    // markers can be mixed with spaces, but there should be at least 3 of them
        let cnt = 1;
    while (pos < max) {
      const ch = state.src.charCodeAt(pos++);
      if (ch !== marker && !isSpace(ch)) {
        return false;
      }
      if (ch === marker) {
        cnt++;
      }
    }
    if (cnt < 3) {
      return false;
    }
    if (silent) {
      return true;
    }
    state.line = startLine + 1;
    const token = state.push("hr", "hr", 0);
    token.map = [ startLine, state.line ];
    token.markup = Array(cnt + 1).join(String.fromCharCode(marker));
    return true;
  }
  // Lists
  // Search `[-+*][\n ]`, returns next pos after marker on success
  // or -1 on fail.
    function skipBulletListMarker(state, startLine) {
    const max = state.eMarks[startLine];
    let pos = state.bMarks[startLine] + state.tShift[startLine];
    const marker = state.src.charCodeAt(pos++);
    // Check bullet
        if (marker !== 42 /* * */ && marker !== 45 /* - */ && marker !== 43 /* + */) {
      return -1;
    }
    if (pos < max) {
      const ch = state.src.charCodeAt(pos);
      if (!isSpace(ch)) {
        // " -test " - is not a list item
        return -1;
      }
    }
    return pos;
  }
  // Search `\d+[.)][\n ]`, returns next pos after marker on success
  // or -1 on fail.
    function skipOrderedListMarker(state, startLine) {
    const start = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];
    let pos = start;
    // List marker should have at least 2 chars (digit + dot)
        if (pos + 1 >= max) {
      return -1;
    }
    let ch = state.src.charCodeAt(pos++);
    if (ch < 48 /* 0 */ || ch > 57 /* 9 */) {
      return -1;
    }
    for (;;) {
      // EOL -> fail
      if (pos >= max) {
        return -1;
      }
      ch = state.src.charCodeAt(pos++);
      if (ch >= 48 /* 0 */ && ch <= 57 /* 9 */) {
        // List marker should have no more than 9 digits
        // (prevents integer overflow in browsers)
        if (pos - start >= 10) {
          return -1;
        }
        continue;
      }
      // found valid marker
            if (ch === 41 /* ) */ || ch === 46 /* . */) {
        break;
      }
      return -1;
    }
    if (pos < max) {
      ch = state.src.charCodeAt(pos);
      if (!isSpace(ch)) {
        // " 1.test " - is not a list item
        return -1;
      }
    }
    return pos;
  }
  function markTightParagraphs(state, idx) {
    const level = state.level + 2;
    for (let i = idx + 2, l = state.tokens.length - 2; i < l; i++) {
      if (state.tokens[i].level === level && state.tokens[i].type === "paragraph_open") {
        state.tokens[i + 2].hidden = true;
        state.tokens[i].hidden = true;
        i += 2;
      }
    }
  }
  function list(state, startLine, endLine, silent) {
    let max, pos, start, token;
    let nextLine = startLine;
    let tight = true;
    // if it's indented more than 3 spaces, it should be a code block
        if (state.sCount[nextLine] - state.blkIndent >= 4) {
      return false;
    }
    // Special case:
    //  - item 1
    //   - item 2
    //    - item 3
    //     - item 4
    //      - this one is a paragraph continuation
        if (state.listIndent >= 0 && state.sCount[nextLine] - state.listIndent >= 4 && state.sCount[nextLine] < state.blkIndent) {
      return false;
    }
    let isTerminatingParagraph = false;
    // limit conditions when list can interrupt
    // a paragraph (validation mode only)
        if (silent && state.parentType === "paragraph") {
      // Next list item should still terminate previous list item;
      // This code can fail if plugins use blkIndent as well as lists,
      // but I hope the spec gets fixed long before that happens.
      if (state.sCount[nextLine] >= state.blkIndent) {
        isTerminatingParagraph = true;
      }
    }
    // Detect list type and position after marker
        let isOrdered;
    let markerValue;
    let posAfterMarker;
    if ((posAfterMarker = skipOrderedListMarker(state, nextLine)) >= 0) {
      isOrdered = true;
      start = state.bMarks[nextLine] + state.tShift[nextLine];
      markerValue = Number(state.src.slice(start, posAfterMarker - 1));
      // If we're starting a new ordered list right after
      // a paragraph, it should start with 1.
            if (isTerminatingParagraph && markerValue !== 1) return false;
    } else if ((posAfterMarker = skipBulletListMarker(state, nextLine)) >= 0) {
      isOrdered = false;
    } else {
      return false;
    }
    // If we're starting a new unordered list right after
    // a paragraph, first line should not be empty.
        if (isTerminatingParagraph) {
      if (state.skipSpaces(posAfterMarker) >= state.eMarks[nextLine]) return false;
    }
    // For validation mode we can terminate immediately
        if (silent) {
      return true;
    }
    // We should terminate list on style change. Remember first one to compare.
        const markerCharCode = state.src.charCodeAt(posAfterMarker - 1);
    // Start list
        const listTokIdx = state.tokens.length;
    if (isOrdered) {
      token = state.push("ordered_list_open", "ol", 1);
      if (markerValue !== 1) {
        token.attrs = [ [ "start", markerValue ] ];
      }
    } else {
      token = state.push("bullet_list_open", "ul", 1);
    }
    const listLines = [ nextLine, 0 ];
    token.map = listLines;
    token.markup = String.fromCharCode(markerCharCode);
    
    // Iterate list items
    
        let prevEmptyEnd = false;
    const terminatorRules = state.md.block.ruler.getRules("list");
    const oldParentType = state.parentType;
    state.parentType = "list";
    while (nextLine < endLine) {
      pos = posAfterMarker;
      max = state.eMarks[nextLine];
      const initial = state.sCount[nextLine] + posAfterMarker - (state.bMarks[nextLine] + state.tShift[nextLine]);
      let offset = initial;
      while (pos < max) {
        const ch = state.src.charCodeAt(pos);
        if (ch === 9) {
          offset += 4 - (offset + state.bsCount[nextLine]) % 4;
        } else if (ch === 32) {
          offset++;
        } else {
          break;
        }
        pos++;
      }
      const contentStart = pos;
      let indentAfterMarker;
      if (contentStart >= max) {
        // trimming space in "-    \n  3" case, indent is 1 here
        indentAfterMarker = 1;
      } else {
        indentAfterMarker = offset - initial;
      }
      // If we have more than 4 spaces, the indent is 1
      // (the rest is just indented code block)
            if (indentAfterMarker > 4) {
        indentAfterMarker = 1;
      }
      // "  -  test"
      //  ^^^^^ - calculating total length of this thing
            const indent = initial + indentAfterMarker;
      // Run subparser & write tokens
            token = state.push("list_item_open", "li", 1);
      token.markup = String.fromCharCode(markerCharCode);
      const itemLines = [ nextLine, 0 ];
      token.map = itemLines;
      if (isOrdered) {
        token.info = state.src.slice(start, posAfterMarker - 1);
      }
      // change current state, then restore it after parser subcall
            const oldTight = state.tight;
      const oldTShift = state.tShift[nextLine];
      const oldSCount = state.sCount[nextLine];
      //  - example list
      // ^ listIndent position will be here
      //   ^ blkIndent position will be here
      
            const oldListIndent = state.listIndent;
      state.listIndent = state.blkIndent;
      state.blkIndent = indent;
      state.tight = true;
      state.tShift[nextLine] = contentStart - state.bMarks[nextLine];
      state.sCount[nextLine] = offset;
      if (contentStart >= max && state.isEmpty(nextLine + 1)) {
        // workaround for this case
        // (list item is empty, list terminates before "foo"):
        // ~~~~~~~~
        //   -
        //     foo
        // ~~~~~~~~
        state.line = Math.min(state.line + 2, endLine);
      } else {
        state.md.block.tokenize(state, nextLine, endLine, true);
      }
      // If any of list item is tight, mark list as tight
            if (!state.tight || prevEmptyEnd) {
        tight = false;
      }
      // Item become loose if finish with empty line,
      // but we should filter last element, because it means list finish
            prevEmptyEnd = state.line - nextLine > 1 && state.isEmpty(state.line - 1);
      state.blkIndent = state.listIndent;
      state.listIndent = oldListIndent;
      state.tShift[nextLine] = oldTShift;
      state.sCount[nextLine] = oldSCount;
      state.tight = oldTight;
      token = state.push("list_item_close", "li", -1);
      token.markup = String.fromCharCode(markerCharCode);
      nextLine = state.line;
      itemLines[1] = nextLine;
      if (nextLine >= endLine) {
        break;
      }
      
      // Try to check if list is terminated or continued.
      
            if (state.sCount[nextLine] < state.blkIndent) {
        break;
      }
      // if it's indented more than 3 spaces, it should be a code block
            if (state.sCount[nextLine] - state.blkIndent >= 4) {
        break;
      }
      // fail if terminating block found
            let terminate = false;
      for (let i = 0, l = terminatorRules.length; i < l; i++) {
        if (terminatorRules[i](state, nextLine, endLine, true)) {
          terminate = true;
          break;
        }
      }
      if (terminate) {
        break;
      }
      // fail if list has another type
            if (isOrdered) {
        posAfterMarker = skipOrderedListMarker(state, nextLine);
        if (posAfterMarker < 0) {
          break;
        }
        start = state.bMarks[nextLine] + state.tShift[nextLine];
      } else {
        posAfterMarker = skipBulletListMarker(state, nextLine);
        if (posAfterMarker < 0) {
          break;
        }
      }
      if (markerCharCode !== state.src.charCodeAt(posAfterMarker - 1)) {
        break;
      }
    }
    // Finalize list
        if (isOrdered) {
      token = state.push("ordered_list_close", "ol", -1);
    } else {
      token = state.push("bullet_list_close", "ul", -1);
    }
    token.markup = String.fromCharCode(markerCharCode);
    listLines[1] = nextLine;
    state.line = nextLine;
    state.parentType = oldParentType;
    // mark paragraphs tight if needed
        if (tight) {
      markTightParagraphs(state, listTokIdx);
    }
    return true;
  }
  function reference(state, startLine, _endLine, silent) {
    let pos = state.bMarks[startLine] + state.tShift[startLine];
    let max = state.eMarks[startLine];
    let nextLine = startLine + 1;
    // if it's indented more than 3 spaces, it should be a code block
        if (state.sCount[startLine] - state.blkIndent >= 4) {
      return false;
    }
    if (state.src.charCodeAt(pos) !== 91 /* [ */) {
      return false;
    }
    function getNextLine(nextLine) {
      const endLine = state.lineMax;
      if (nextLine >= endLine || state.isEmpty(nextLine)) {
        // empty line or end of input
        return null;
      }
      let isContinuation = false;
      // this would be a code block normally, but after paragraph
      // it's considered a lazy continuation regardless of what's there
            if (state.sCount[nextLine] - state.blkIndent > 3) {
        isContinuation = true;
      }
      // quirk for blockquotes, this line should already be checked by that rule
            if (state.sCount[nextLine] < 0) {
        isContinuation = true;
      }
      if (!isContinuation) {
        const terminatorRules = state.md.block.ruler.getRules("reference");
        const oldParentType = state.parentType;
        state.parentType = "reference";
        // Some tags can terminate paragraph without empty line.
                let terminate = false;
        for (let i = 0, l = terminatorRules.length; i < l; i++) {
          if (terminatorRules[i](state, nextLine, endLine, true)) {
            terminate = true;
            break;
          }
        }
        state.parentType = oldParentType;
        if (terminate) {
          // terminated by another block
          return null;
        }
      }
      const pos = state.bMarks[nextLine] + state.tShift[nextLine];
      const max = state.eMarks[nextLine];
      // max + 1 explicitly includes the newline
            return state.src.slice(pos, max + 1);
    }
    let str = state.src.slice(pos, max + 1);
    max = str.length;
    let labelEnd = -1;
    for (pos = 1; pos < max; pos++) {
      const ch = str.charCodeAt(pos);
      if (ch === 91 /* [ */) {
        return false;
      } else if (ch === 93 /* ] */) {
        labelEnd = pos;
        break;
      } else if (ch === 10 /* \n */) {
        const lineContent = getNextLine(nextLine);
        if (lineContent !== null) {
          str += lineContent;
          max = str.length;
          nextLine++;
        }
      } else if (ch === 92 /* \ */) {
        pos++;
        if (pos < max && str.charCodeAt(pos) === 10) {
          const lineContent = getNextLine(nextLine);
          if (lineContent !== null) {
            str += lineContent;
            max = str.length;
            nextLine++;
          }
        }
      }
    }
    if (labelEnd < 0 || str.charCodeAt(labelEnd + 1) !== 58 /* : */) {
      return false;
    }
    // [label]:   destination   'title'
    //         ^^^ skip optional whitespace here
        for (pos = labelEnd + 2; pos < max; pos++) {
      const ch = str.charCodeAt(pos);
      if (ch === 10) {
        const lineContent = getNextLine(nextLine);
        if (lineContent !== null) {
          str += lineContent;
          max = str.length;
          nextLine++;
        }
      } else if (isSpace(ch)) ; else {
        break;
      }
    }
    // [label]:   destination   'title'
    //            ^^^^^^^^^^^ parse this
        const destRes = state.md.helpers.parseLinkDestination(str, pos, max);
    if (!destRes.ok) {
      return false;
    }
    const href = state.md.normalizeLink(destRes.str);
    if (!state.md.validateLink(href)) {
      return false;
    }
    pos = destRes.pos;
    // save cursor state, we could require to rollback later
        const destEndPos = pos;
    const destEndLineNo = nextLine;
    // [label]:   destination   'title'
    //                       ^^^ skipping those spaces
        const start = pos;
    for (;pos < max; pos++) {
      const ch = str.charCodeAt(pos);
      if (ch === 10) {
        const lineContent = getNextLine(nextLine);
        if (lineContent !== null) {
          str += lineContent;
          max = str.length;
          nextLine++;
        }
      } else if (isSpace(ch)) ; else {
        break;
      }
    }
    // [label]:   destination   'title'
    //                          ^^^^^^^ parse this
        let titleRes = state.md.helpers.parseLinkTitle(str, pos, max);
    while (titleRes.can_continue) {
      const lineContent = getNextLine(nextLine);
      if (lineContent === null) break;
      str += lineContent;
      pos = max;
      max = str.length;
      nextLine++;
      titleRes = state.md.helpers.parseLinkTitle(str, pos, max, titleRes);
    }
    let title;
    if (pos < max && start !== pos && titleRes.ok) {
      title = titleRes.str;
      pos = titleRes.pos;
    } else {
      title = "";
      pos = destEndPos;
      nextLine = destEndLineNo;
    }
    // skip trailing spaces until the rest of the line
        while (pos < max) {
      const ch = str.charCodeAt(pos);
      if (!isSpace(ch)) {
        break;
      }
      pos++;
    }
    if (pos < max && str.charCodeAt(pos) !== 10) {
      if (title) {
        // garbage at the end of the line after title,
        // but it could still be a valid reference if we roll back
        title = "";
        pos = destEndPos;
        nextLine = destEndLineNo;
        while (pos < max) {
          const ch = str.charCodeAt(pos);
          if (!isSpace(ch)) {
            break;
          }
          pos++;
        }
      }
    }
    if (pos < max && str.charCodeAt(pos) !== 10) {
      // garbage at the end of the line
      return false;
    }
    const label = normalizeReference(str.slice(1, labelEnd));
    if (!label) {
      // CommonMark 0.20 disallows empty labels
      return false;
    }
    // Reference can not terminate anything. This check is for safety only.
    /* istanbul ignore if */    if (silent) {
      return true;
    }
    if (typeof state.env.references === "undefined") {
      state.env.references = {};
    }
    if (typeof state.env.references[label] === "undefined") {
      state.env.references[label] = {
        title: title,
        href: href
      };
    }
    state.line = nextLine;
    return true;
  }
  // List of valid html blocks names, according to commonmark spec
  // https://spec.commonmark.org/0.30/#html-blocks
    var block_names = [ "address", "article", "aside", "base", "basefont", "blockquote", "body", "caption", "center", "col", "colgroup", "dd", "details", "dialog", "dir", "div", "dl", "dt", "fieldset", "figcaption", "figure", "footer", "form", "frame", "frameset", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hr", "html", "iframe", "legend", "li", "link", "main", "menu", "menuitem", "nav", "noframes", "ol", "optgroup", "option", "p", "param", "search", "section", "summary", "table", "tbody", "td", "tfoot", "th", "thead", "title", "tr", "track", "ul" ];
  // Regexps to match html elements
    const attr_name = "[a-zA-Z_:][a-zA-Z0-9:._-]*";
  const unquoted = "[^\"'=<>`\\x00-\\x20]+";
  const single_quoted = "'[^']*'";
  const double_quoted = '"[^"]*"';
  const attr_value = "(?:" + unquoted + "|" + single_quoted + "|" + double_quoted + ")";
  const attribute = "(?:\\s+" + attr_name + "(?:\\s*=\\s*" + attr_value + ")?)";
  const open_tag = "<[A-Za-z][A-Za-z0-9\\-]*" + attribute + "*\\s*\\/?>";
  const close_tag = "<\\/[A-Za-z][A-Za-z0-9\\-]*\\s*>";
  const comment = "\x3c!---?>|\x3c!--(?:[^-]|-[^-]|--[^>])*--\x3e";
  const processing = "<[?][\\s\\S]*?[?]>";
  const declaration = "<![A-Za-z][^>]*>";
  const cdata = "<!\\[CDATA\\[[\\s\\S]*?\\]\\]>";
  const HTML_TAG_RE = new RegExp("^(?:" + open_tag + "|" + close_tag + "|" + comment + "|" + processing + "|" + declaration + "|" + cdata + ")");
  const HTML_OPEN_CLOSE_TAG_RE = new RegExp("^(?:" + open_tag + "|" + close_tag + ")");
  // HTML block
  // An array of opening and corresponding closing sequences for html tags,
  // last argument defines whether it can terminate a paragraph or not
  
    const HTML_SEQUENCES = [ [ /^<(script|pre|style|textarea)(?=(\s|>|$))/i, /<\/(script|pre|style|textarea)>/i, true ], [ /^<!--/, /-->/, true ], [ /^<\?/, /\?>/, true ], [ /^<![A-Z]/, />/, true ], [ /^<!\[CDATA\[/, /\]\]>/, true ], [ new RegExp("^</?(" + block_names.join("|") + ")(?=(\\s|/?>|$))", "i"), /^$/, true ], [ new RegExp(HTML_OPEN_CLOSE_TAG_RE.source + "\\s*$"), /^$/, false ] ];
  function html_block(state, startLine, endLine, silent) {
    let pos = state.bMarks[startLine] + state.tShift[startLine];
    let max = state.eMarks[startLine];
    // if it's indented more than 3 spaces, it should be a code block
        if (state.sCount[startLine] - state.blkIndent >= 4) {
      return false;
    }
    if (!state.md.options.html) {
      return false;
    }
    if (state.src.charCodeAt(pos) !== 60 /* < */) {
      return false;
    }
    let lineText = state.src.slice(pos, max);
    let i = 0;
    for (;i < HTML_SEQUENCES.length; i++) {
      if (HTML_SEQUENCES[i][0].test(lineText)) {
        break;
      }
    }
    if (i === HTML_SEQUENCES.length) {
      return false;
    }
    if (silent) {
      // true if this sequence can be a terminator, false otherwise
      return HTML_SEQUENCES[i][2];
    }
    let nextLine = startLine + 1;
    // If we are here - we detected HTML block.
    // Let's roll down till block end.
        if (!HTML_SEQUENCES[i][1].test(lineText)) {
      for (;nextLine < endLine; nextLine++) {
        if (state.sCount[nextLine] < state.blkIndent) {
          break;
        }
        pos = state.bMarks[nextLine] + state.tShift[nextLine];
        max = state.eMarks[nextLine];
        lineText = state.src.slice(pos, max);
        if (HTML_SEQUENCES[i][1].test(lineText)) {
          if (lineText.length !== 0) {
            nextLine++;
          }
          break;
        }
      }
    }
    state.line = nextLine;
    const token = state.push("html_block", "", 0);
    token.map = [ startLine, nextLine ];
    token.content = state.getLines(startLine, nextLine, state.blkIndent, true);
    return true;
  }
  // heading (#, ##, ...)
    function heading(state, startLine, endLine, silent) {
    let pos = state.bMarks[startLine] + state.tShift[startLine];
    let max = state.eMarks[startLine];
    // if it's indented more than 3 spaces, it should be a code block
        if (state.sCount[startLine] - state.blkIndent >= 4) {
      return false;
    }
    let ch = state.src.charCodeAt(pos);
    if (ch !== 35 /* # */ || pos >= max) {
      return false;
    }
    // count heading level
        let level = 1;
    ch = state.src.charCodeAt(++pos);
    while (ch === 35 /* # */ && pos < max && level <= 6) {
      level++;
      ch = state.src.charCodeAt(++pos);
    }
    if (level > 6 || pos < max && !isSpace(ch)) {
      return false;
    }
    if (silent) {
      return true;
    }
    // Let's cut tails like '    ###  ' from the end of string
        max = state.skipSpacesBack(max, pos);
    const tmp = state.skipCharsBack(max, 35, pos);
 // #
        if (tmp > pos && isSpace(state.src.charCodeAt(tmp - 1))) {
      max = tmp;
    }
    state.line = startLine + 1;
    const token_o = state.push("heading_open", "h" + String(level), 1);
    token_o.markup = "########".slice(0, level);
    token_o.map = [ startLine, state.line ];
    const token_i = state.push("inline", "", 0);
    token_i.content = state.src.slice(pos, max).trim();
    token_i.map = [ startLine, state.line ];
    token_i.children = [];
    const token_c = state.push("heading_close", "h" + String(level), -1);
    token_c.markup = "########".slice(0, level);
    return true;
  }
  // lheading (---, ===)
    function lheading(state, startLine, endLine /*, silent */) {
    const terminatorRules = state.md.block.ruler.getRules("paragraph");
    // if it's indented more than 3 spaces, it should be a code block
        if (state.sCount[startLine] - state.blkIndent >= 4) {
      return false;
    }
    const oldParentType = state.parentType;
    state.parentType = "paragraph";
 // use paragraph to match terminatorRules
    // jump line-by-line until empty one or EOF
        let level = 0;
    let marker;
    let nextLine = startLine + 1;
    for (;nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
      // this would be a code block normally, but after paragraph
      // it's considered a lazy continuation regardless of what's there
      if (state.sCount[nextLine] - state.blkIndent > 3) {
        continue;
      }
      
      // Check for underline in setext header
      
            if (state.sCount[nextLine] >= state.blkIndent) {
        let pos = state.bMarks[nextLine] + state.tShift[nextLine];
        const max = state.eMarks[nextLine];
        if (pos < max) {
          marker = state.src.charCodeAt(pos);
          if (marker === 45 /* - */ || marker === 61 /* = */) {
            pos = state.skipChars(pos, marker);
            pos = state.skipSpaces(pos);
            if (pos >= max) {
              level = marker === 61 /* = */ ? 1 : 2;
              break;
            }
          }
        }
      }
      // quirk for blockquotes, this line should already be checked by that rule
            if (state.sCount[nextLine] < 0) {
        continue;
      }
      // Some tags can terminate paragraph without empty line.
            let terminate = false;
      for (let i = 0, l = terminatorRules.length; i < l; i++) {
        if (terminatorRules[i](state, nextLine, endLine, true)) {
          terminate = true;
          break;
        }
      }
      if (terminate) {
        break;
      }
    }
    if (!level) {
      // Didn't find valid underline
      return false;
    }
    const content = state.getLines(startLine, nextLine, state.blkIndent, false).trim();
    state.line = nextLine + 1;
    const token_o = state.push("heading_open", "h" + String(level), 1);
    token_o.markup = String.fromCharCode(marker);
    token_o.map = [ startLine, state.line ];
    const token_i = state.push("inline", "", 0);
    token_i.content = content;
    token_i.map = [ startLine, state.line - 1 ];
    token_i.children = [];
    const token_c = state.push("heading_close", "h" + String(level), -1);
    token_c.markup = String.fromCharCode(marker);
    state.parentType = oldParentType;
    return true;
  }
  // Paragraph
    function paragraph(state, startLine, endLine) {
    const terminatorRules = state.md.block.ruler.getRules("paragraph");
    const oldParentType = state.parentType;
    let nextLine = startLine + 1;
    state.parentType = "paragraph";
    // jump line-by-line until empty one or EOF
        for (;nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
      // this would be a code block normally, but after paragraph
      // it's considered a lazy continuation regardless of what's there
      if (state.sCount[nextLine] - state.blkIndent > 3) {
        continue;
      }
      // quirk for blockquotes, this line should already be checked by that rule
            if (state.sCount[nextLine] < 0) {
        continue;
      }
      // Some tags can terminate paragraph without empty line.
            let terminate = false;
      for (let i = 0, l = terminatorRules.length; i < l; i++) {
        if (terminatorRules[i](state, nextLine, endLine, true)) {
          terminate = true;
          break;
        }
      }
      if (terminate) {
        break;
      }
    }
    const content = state.getLines(startLine, nextLine, state.blkIndent, false).trim();
    state.line = nextLine;
    const token_o = state.push("paragraph_open", "p", 1);
    token_o.map = [ startLine, state.line ];
    const token_i = state.push("inline", "", 0);
    token_i.content = content;
    token_i.map = [ startLine, state.line ];
    token_i.children = [];
    state.push("paragraph_close", "p", -1);
    state.parentType = oldParentType;
    return true;
  }
  /** internal
   * class ParserBlock
   *
   * Block-level tokenizer.
   **/  const _rules$1 = [ 
  // First 2 params - rule name & source. Secondary array - list of rules,
  // which can be terminated by this one.
  [ "table", table, [ "paragraph", "reference" ] ], [ "code", code ], [ "fence", fence, [ "paragraph", "reference", "blockquote", "list" ] ], [ "blockquote", blockquote, [ "paragraph", "reference", "blockquote", "list" ] ], [ "hr", hr, [ "paragraph", "reference", "blockquote", "list" ] ], [ "list", list, [ "paragraph", "reference", "blockquote" ] ], [ "reference", reference ], [ "html_block", html_block, [ "paragraph", "reference", "blockquote" ] ], [ "heading", heading, [ "paragraph", "reference", "blockquote" ] ], [ "lheading", lheading ], [ "paragraph", paragraph ] ];
  /**
   * new ParserBlock()
   **/  function ParserBlock() {
    /**
     * ParserBlock#ruler -> Ruler
     *
     * [[Ruler]] instance. Keep configuration of block rules.
     **/
    this.ruler = new Ruler;
    for (let i = 0; i < _rules$1.length; i++) {
      this.ruler.push(_rules$1[i][0], _rules$1[i][1], {
        alt: (_rules$1[i][2] || []).slice()
      });
    }
  }
  // Generate tokens for input range
  
    ParserBlock.prototype.tokenize = function(state, startLine, endLine) {
    const rules = this.ruler.getRules("");
    const len = rules.length;
    const maxNesting = state.md.options.maxNesting;
    let line = startLine;
    let hasEmptyLines = false;
    while (line < endLine) {
      state.line = line = state.skipEmptyLines(line);
      if (line >= endLine) {
        break;
      }
      // Termination condition for nested calls.
      // Nested calls currently used for blockquotes & lists
            if (state.sCount[line] < state.blkIndent) {
        break;
      }
      // If nesting level exceeded - skip tail to the end. That's not ordinary
      // situation and we should not care about content.
            if (state.level >= maxNesting) {
        state.line = endLine;
        break;
      }
      // Try all possible rules.
      // On success, rule should:
      
      // - update `state.line`
      // - update `state.tokens`
      // - return true
            const prevLine = state.line;
      let ok = false;
      for (let i = 0; i < len; i++) {
        ok = rules[i](state, line, endLine, false);
        if (ok) {
          if (prevLine >= state.line) {
            throw new Error("block rule didn't increment state.line");
          }
          break;
        }
      }
      // this can only happen if user disables paragraph rule
            if (!ok) throw new Error("none of the block rules matched");
      // set state.tight if we had an empty line before current tag
      // i.e. latest empty line should not count
            state.tight = !hasEmptyLines;
      // paragraph might "eat" one newline after it in nested lists
            if (state.isEmpty(state.line - 1)) {
        hasEmptyLines = true;
      }
      line = state.line;
      if (line < endLine && state.isEmpty(line)) {
        hasEmptyLines = true;
        line++;
        state.line = line;
      }
    }
  };
  /**
   * ParserBlock.parse(str, md, env, outTokens)
   *
   * Process input string and push block tokens into `outTokens`
   **/  ParserBlock.prototype.parse = function(src, md, env, outTokens) {
    if (!src) {
      return;
    }
    const state = new this.State(src, md, env, outTokens);
    this.tokenize(state, state.line, state.lineMax);
  };
  ParserBlock.prototype.State = StateBlock;
  // Inline parser state
    function StateInline(src, md, env, outTokens) {
    this.src = src;
    this.env = env;
    this.md = md;
    this.tokens = outTokens;
    this.tokens_meta = Array(outTokens.length);
    this.pos = 0;
    this.posMax = this.src.length;
    this.level = 0;
    this.pending = "";
    this.pendingLevel = 0;
    // Stores { start: end } pairs. Useful for backtrack
    // optimization of pairs parse (emphasis, strikes).
        this.cache = {};
    // List of emphasis-like delimiters for current tag
        this.delimiters = [];
    // Stack of delimiter lists for upper level tags
        this._prev_delimiters = [];
    // backtick length => last seen position
        this.backticks = {};
    this.backticksScanned = false;
    // Counter used to disable inline linkify-it execution
    // inside <a> and markdown links
        this.linkLevel = 0;
  }
  // Flush pending text
  
    StateInline.prototype.pushPending = function() {
    const token = new Token("text", "", 0);
    token.content = this.pending;
    token.level = this.pendingLevel;
    this.tokens.push(token);
    this.pending = "";
    return token;
  };
  // Push new token to "stream".
  // If pending text exists - flush it as text token
  
    StateInline.prototype.push = function(type, tag, nesting) {
    if (this.pending) {
      this.pushPending();
    }
    const token = new Token(type, tag, nesting);
    let token_meta = null;
    if (nesting < 0) {
      // closing tag
      this.level--;
      this.delimiters = this._prev_delimiters.pop();
    }
    token.level = this.level;
    if (nesting > 0) {
      // opening tag
      this.level++;
      this._prev_delimiters.push(this.delimiters);
      this.delimiters = [];
      token_meta = {
        delimiters: this.delimiters
      };
    }
    this.pendingLevel = this.level;
    this.tokens.push(token);
    this.tokens_meta.push(token_meta);
    return token;
  };
  // Scan a sequence of emphasis-like markers, and determine whether
  // it can start an emphasis sequence or end an emphasis sequence.
  
  //  - start - position to scan from (it should point at a valid marker);
  //  - canSplitWord - determine if these markers can be found inside a word
  
    StateInline.prototype.scanDelims = function(start, canSplitWord) {
    const max = this.posMax;
    const marker = this.src.charCodeAt(start);
    // treat beginning of the line as a whitespace
        const lastChar = start > 0 ? this.src.charCodeAt(start - 1) : 32;
    let pos = start;
    while (pos < max && this.src.charCodeAt(pos) === marker) {
      pos++;
    }
    const count = pos - start;
    // treat end of the line as a whitespace
        const nextChar = pos < max ? this.src.charCodeAt(pos) : 32;
    const isLastPunctChar = isMdAsciiPunct(lastChar) || isPunctChar(String.fromCharCode(lastChar));
    const isNextPunctChar = isMdAsciiPunct(nextChar) || isPunctChar(String.fromCharCode(nextChar));
    const isLastWhiteSpace = isWhiteSpace(lastChar);
    const isNextWhiteSpace = isWhiteSpace(nextChar);
    const left_flanking = !isNextWhiteSpace && (!isNextPunctChar || isLastWhiteSpace || isLastPunctChar);
    const right_flanking = !isLastWhiteSpace && (!isLastPunctChar || isNextWhiteSpace || isNextPunctChar);
    const can_open = left_flanking && (canSplitWord || !right_flanking || isLastPunctChar);
    const can_close = right_flanking && (canSplitWord || !left_flanking || isNextPunctChar);
    return {
      can_open: can_open,
      can_close: can_close,
      length: count
    };
  };
  // re-export Token class to use in block rules
    StateInline.prototype.Token = Token;
  // Skip text characters for text token, place those to pending buffer
  // and increment current pos
  // Rule to skip pure text
  // '{}$%@~+=:' reserved for extentions
  // !, ", #, $, %, &, ', (, ), *, +, ,, -, ., /, :, ;, <, =, >, ?, @, [, \, ], ^, _, `, {, |, }, or ~
  // !!!! Don't confuse with "Markdown ASCII Punctuation" chars
  // http://spec.commonmark.org/0.15/#ascii-punctuation-character
    function isTerminatorChar(ch) {
    switch (ch) {
     case 10 /* \n */ :
     case 33 /* ! */ :
     case 35 /* # */ :
     case 36 /* $ */ :
     case 37 /* % */ :
     case 38 /* & */ :
     case 42 /* * */ :
     case 43 /* + */ :
     case 45 /* - */ :
     case 58 /* : */ :
     case 60 /* < */ :
     case 61 /* = */ :
     case 62 /* > */ :
     case 64 /* @ */ :
     case 91 /* [ */ :
     case 92 /* \ */ :
     case 93 /* ] */ :
     case 94 /* ^ */ :
     case 95 /* _ */ :
     case 96 /* ` */ :
     case 123 /* { */ :
     case 125 /* } */ :
     case 126 /* ~ */ :
      return true;

     default:
      return false;
    }
  }
  function text(state, silent) {
    let pos = state.pos;
    while (pos < state.posMax && !isTerminatorChar(state.src.charCodeAt(pos))) {
      pos++;
    }
    if (pos === state.pos) {
      return false;
    }
    if (!silent) {
      state.pending += state.src.slice(state.pos, pos);
    }
    state.pos = pos;
    return true;
  }
  // Alternative implementation, for memory.
  
  // It costs 10% of performance, but allows extend terminators list, if place it
  // to `ParserInline` property. Probably, will switch to it sometime, such
  // flexibility required.
  /*
  var TERMINATOR_RE = /[\n!#$%&*+\-:<=>@[\\\]^_`{}~]/;

  module.exports = function text(state, silent) {
    var pos = state.pos,
        idx = state.src.slice(pos).search(TERMINATOR_RE);

    // first char is terminator -> empty text
    if (idx === 0) { return false; }

    // no terminator -> text till end of string
    if (idx < 0) {
      if (!silent) { state.pending += state.src.slice(pos); }
      state.pos = state.src.length;
      return true;
    }

    if (!silent) { state.pending += state.src.slice(pos, pos + idx); }

    state.pos += idx;

    return true;
  }; */
  // Process links like https://example.org/
  // RFC3986: scheme = ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )
    const SCHEME_RE = /(?:^|[^a-z0-9.+-])([a-z][a-z0-9.+-]*)$/i;
  function linkify(state, silent) {
    if (!state.md.options.linkify) return false;
    if (state.linkLevel > 0) return false;
    const pos = state.pos;
    const max = state.posMax;
    if (pos + 3 > max) return false;
    if (state.src.charCodeAt(pos) !== 58 /* : */) return false;
    if (state.src.charCodeAt(pos + 1) !== 47 /* / */) return false;
    if (state.src.charCodeAt(pos + 2) !== 47 /* / */) return false;
    const match = state.pending.match(SCHEME_RE);
    if (!match) return false;
    const proto = match[1];
    const link = state.md.linkify.matchAtStart(state.src.slice(pos - proto.length));
    if (!link) return false;
    let url = link.url;
    // invalid link, but still detected by linkify somehow;
    // need to check to prevent infinite loop below
        if (url.length <= proto.length) return false;
    // disallow '*' at the end of the link (conflicts with emphasis)
        url = url.replace(/\*+$/, "");
    const fullUrl = state.md.normalizeLink(url);
    if (!state.md.validateLink(fullUrl)) return false;
    if (!silent) {
      state.pending = state.pending.slice(0, -proto.length);
      const token_o = state.push("link_open", "a", 1);
      token_o.attrs = [ [ "href", fullUrl ] ];
      token_o.markup = "linkify";
      token_o.info = "auto";
      const token_t = state.push("text", "", 0);
      token_t.content = state.md.normalizeLinkText(url);
      const token_c = state.push("link_close", "a", -1);
      token_c.markup = "linkify";
      token_c.info = "auto";
    }
    state.pos += url.length - proto.length;
    return true;
  }
  // Proceess '\n'
    function newline(state, silent) {
    let pos = state.pos;
    if (state.src.charCodeAt(pos) !== 10 /* \n */) {
      return false;
    }
    const pmax = state.pending.length - 1;
    const max = state.posMax;
    // '  \n' -> hardbreak
    // Lookup in pending chars is bad practice! Don't copy to other rules!
    // Pending string is stored in concat mode, indexed lookups will cause
    // convertion to flat mode.
        if (!silent) {
      if (pmax >= 0 && state.pending.charCodeAt(pmax) === 32) {
        if (pmax >= 1 && state.pending.charCodeAt(pmax - 1) === 32) {
          // Find whitespaces tail of pending chars.
          let ws = pmax - 1;
          while (ws >= 1 && state.pending.charCodeAt(ws - 1) === 32) ws--;
          state.pending = state.pending.slice(0, ws);
          state.push("hardbreak", "br", 0);
        } else {
          state.pending = state.pending.slice(0, -1);
          state.push("softbreak", "br", 0);
        }
      } else {
        state.push("softbreak", "br", 0);
      }
    }
    pos++;
    // skip heading spaces for next line
        while (pos < max && isSpace(state.src.charCodeAt(pos))) {
      pos++;
    }
    state.pos = pos;
    return true;
  }
  // Process escaped chars and hardbreaks
    const ESCAPED = [];
  for (let i = 0; i < 256; i++) {
    ESCAPED.push(0);
  }
  "\\!\"#$%&'()*+,./:;<=>?@[]^_`{|}~-".split("").forEach((function(ch) {
    ESCAPED[ch.charCodeAt(0)] = 1;
  }));
  function escape(state, silent) {
    let pos = state.pos;
    const max = state.posMax;
    if (state.src.charCodeAt(pos) !== 92 /* \ */) return false;
    pos++;
    // '\' at the end of the inline block
        if (pos >= max) return false;
    let ch1 = state.src.charCodeAt(pos);
    if (ch1 === 10) {
      if (!silent) {
        state.push("hardbreak", "br", 0);
      }
      pos++;
      // skip leading whitespaces from next line
            while (pos < max) {
        ch1 = state.src.charCodeAt(pos);
        if (!isSpace(ch1)) break;
        pos++;
      }
      state.pos = pos;
      return true;
    }
    let escapedStr = state.src[pos];
    if (ch1 >= 55296 && ch1 <= 56319 && pos + 1 < max) {
      const ch2 = state.src.charCodeAt(pos + 1);
      if (ch2 >= 56320 && ch2 <= 57343) {
        escapedStr += state.src[pos + 1];
        pos++;
      }
    }
    const origStr = "\\" + escapedStr;
    if (!silent) {
      const token = state.push("text_special", "", 0);
      if (ch1 < 256 && ESCAPED[ch1] !== 0) {
        token.content = escapedStr;
      } else {
        token.content = origStr;
      }
      token.markup = origStr;
      token.info = "escape";
    }
    state.pos = pos + 1;
    return true;
  }
  // Parse backticks
    function backtick(state, silent) {
    let pos = state.pos;
    const ch = state.src.charCodeAt(pos);
    if (ch !== 96 /* ` */) {
      return false;
    }
    const start = pos;
    pos++;
    const max = state.posMax;
    // scan marker length
        while (pos < max && state.src.charCodeAt(pos) === 96 /* ` */) {
      pos++;
    }
    const marker = state.src.slice(start, pos);
    const openerLength = marker.length;
    if (state.backticksScanned && (state.backticks[openerLength] || 0) <= start) {
      if (!silent) state.pending += marker;
      state.pos += openerLength;
      return true;
    }
    let matchEnd = pos;
    let matchStart;
    // Nothing found in the cache, scan until the end of the line (or until marker is found)
        while ((matchStart = state.src.indexOf("`", matchEnd)) !== -1) {
      matchEnd = matchStart + 1;
      // scan marker length
            while (matchEnd < max && state.src.charCodeAt(matchEnd) === 96 /* ` */) {
        matchEnd++;
      }
      const closerLength = matchEnd - matchStart;
      if (closerLength === openerLength) {
        // Found matching closer length.
        if (!silent) {
          const token = state.push("code_inline", "code", 0);
          token.markup = marker;
          token.content = state.src.slice(pos, matchStart).replace(/\n/g, " ").replace(/^ (.+) $/, "$1");
        }
        state.pos = matchEnd;
        return true;
      }
      // Some different length found, put it in cache as upper limit of where closer can be found
            state.backticks[closerLength] = matchStart;
    }
    // Scanned through the end, didn't find anything
        state.backticksScanned = true;
    if (!silent) state.pending += marker;
    state.pos += openerLength;
    return true;
  }
  // ~~strike through~~
  
  // Insert each marker as a separate text token, and add it to delimiter list
  
    function strikethrough_tokenize(state, silent) {
    const start = state.pos;
    const marker = state.src.charCodeAt(start);
    if (silent) {
      return false;
    }
    if (marker !== 126 /* ~ */) {
      return false;
    }
    const scanned = state.scanDelims(state.pos, true);
    let len = scanned.length;
    const ch = String.fromCharCode(marker);
    if (len < 2) {
      return false;
    }
    let token;
    if (len % 2) {
      token = state.push("text", "", 0);
      token.content = ch;
      len--;
    }
    for (let i = 0; i < len; i += 2) {
      token = state.push("text", "", 0);
      token.content = ch + ch;
      state.delimiters.push({
        marker: marker,
        length: 0,
        // disable "rule of 3" length checks meant for emphasis
        token: state.tokens.length - 1,
        end: -1,
        open: scanned.can_open,
        close: scanned.can_close
      });
    }
    state.pos += scanned.length;
    return true;
  }
  function postProcess$1(state, delimiters) {
    let token;
    const loneMarkers = [];
    const max = delimiters.length;
    for (let i = 0; i < max; i++) {
      const startDelim = delimiters[i];
      if (startDelim.marker !== 126 /* ~ */) {
        continue;
      }
      if (startDelim.end === -1) {
        continue;
      }
      const endDelim = delimiters[startDelim.end];
      token = state.tokens[startDelim.token];
      token.type = "s_open";
      token.tag = "s";
      token.nesting = 1;
      token.markup = "~~";
      token.content = "";
      token = state.tokens[endDelim.token];
      token.type = "s_close";
      token.tag = "s";
      token.nesting = -1;
      token.markup = "~~";
      token.content = "";
      if (state.tokens[endDelim.token - 1].type === "text" && state.tokens[endDelim.token - 1].content === "~") {
        loneMarkers.push(endDelim.token - 1);
      }
    }
    // If a marker sequence has an odd number of characters, it's splitted
    // like this: `~~~~~` -> `~` + `~~` + `~~`, leaving one marker at the
    // start of the sequence.
    
    // So, we have to move all those markers after subsequent s_close tags.
    
        while (loneMarkers.length) {
      const i = loneMarkers.pop();
      let j = i + 1;
      while (j < state.tokens.length && state.tokens[j].type === "s_close") {
        j++;
      }
      j--;
      if (i !== j) {
        token = state.tokens[j];
        state.tokens[j] = state.tokens[i];
        state.tokens[i] = token;
      }
    }
  }
  // Walk through delimiter list and replace text tokens with tags
  
    function strikethrough_postProcess(state) {
    const tokens_meta = state.tokens_meta;
    const max = state.tokens_meta.length;
    postProcess$1(state, state.delimiters);
    for (let curr = 0; curr < max; curr++) {
      if (tokens_meta[curr] && tokens_meta[curr].delimiters) {
        postProcess$1(state, tokens_meta[curr].delimiters);
      }
    }
  }
  var r_strikethrough = {
    tokenize: strikethrough_tokenize,
    postProcess: strikethrough_postProcess
  };
  // Process *this* and _that_
  
  // Insert each marker as a separate text token, and add it to delimiter list
  
    function emphasis_tokenize(state, silent) {
    const start = state.pos;
    const marker = state.src.charCodeAt(start);
    if (silent) {
      return false;
    }
    if (marker !== 95 /* _ */ && marker !== 42 /* * */) {
      return false;
    }
    const scanned = state.scanDelims(state.pos, marker === 42);
    for (let i = 0; i < scanned.length; i++) {
      const token = state.push("text", "", 0);
      token.content = String.fromCharCode(marker);
      state.delimiters.push({
        // Char code of the starting marker (number).
        marker: marker,
        // Total length of these series of delimiters.
        length: scanned.length,
        // A position of the token this delimiter corresponds to.
        token: state.tokens.length - 1,
        // If this delimiter is matched as a valid opener, `end` will be
        // equal to its position, otherwise it's `-1`.
        end: -1,
        // Boolean flags that determine if this delimiter could open or close
        // an emphasis.
        open: scanned.can_open,
        close: scanned.can_close
      });
    }
    state.pos += scanned.length;
    return true;
  }
  function postProcess(state, delimiters) {
    const max = delimiters.length;
    for (let i = max - 1; i >= 0; i--) {
      const startDelim = delimiters[i];
      if (startDelim.marker !== 95 /* _ */ && startDelim.marker !== 42 /* * */) {
        continue;
      }
      // Process only opening markers
            if (startDelim.end === -1) {
        continue;
      }
      const endDelim = delimiters[startDelim.end];
      // If the previous delimiter has the same marker and is adjacent to this one,
      // merge those into one strong delimiter.
      
      // `<em><em>whatever</em></em>` -> `<strong>whatever</strong>`
      
            const isStrong = i > 0 && delimiters[i - 1].end === startDelim.end + 1 && 
      // check that first two markers match and adjacent
      delimiters[i - 1].marker === startDelim.marker && delimiters[i - 1].token === startDelim.token - 1 && 
      // check that last two markers are adjacent (we can safely assume they match)
      delimiters[startDelim.end + 1].token === endDelim.token + 1;
      const ch = String.fromCharCode(startDelim.marker);
      const token_o = state.tokens[startDelim.token];
      token_o.type = isStrong ? "strong_open" : "em_open";
      token_o.tag = isStrong ? "strong" : "em";
      token_o.nesting = 1;
      token_o.markup = isStrong ? ch + ch : ch;
      token_o.content = "";
      const token_c = state.tokens[endDelim.token];
      token_c.type = isStrong ? "strong_close" : "em_close";
      token_c.tag = isStrong ? "strong" : "em";
      token_c.nesting = -1;
      token_c.markup = isStrong ? ch + ch : ch;
      token_c.content = "";
      if (isStrong) {
        state.tokens[delimiters[i - 1].token].content = "";
        state.tokens[delimiters[startDelim.end + 1].token].content = "";
        i--;
      }
    }
  }
  // Walk through delimiter list and replace text tokens with tags
  
    function emphasis_post_process(state) {
    const tokens_meta = state.tokens_meta;
    const max = state.tokens_meta.length;
    postProcess(state, state.delimiters);
    for (let curr = 0; curr < max; curr++) {
      if (tokens_meta[curr] && tokens_meta[curr].delimiters) {
        postProcess(state, tokens_meta[curr].delimiters);
      }
    }
  }
  var r_emphasis = {
    tokenize: emphasis_tokenize,
    postProcess: emphasis_post_process
  };
  // Process [link](<to> "stuff")
    function link(state, silent) {
    let code, label, res, ref;
    let href = "";
    let title = "";
    let start = state.pos;
    let parseReference = true;
    if (state.src.charCodeAt(state.pos) !== 91 /* [ */) {
      return false;
    }
    const oldPos = state.pos;
    const max = state.posMax;
    const labelStart = state.pos + 1;
    const labelEnd = state.md.helpers.parseLinkLabel(state, state.pos, true);
    // parser failed to find ']', so it's not a valid link
        if (labelEnd < 0) {
      return false;
    }
    let pos = labelEnd + 1;
    if (pos < max && state.src.charCodeAt(pos) === 40 /* ( */) {
      // Inline link
      // might have found a valid shortcut link, disable reference parsing
      parseReference = false;
      // [link](  <href>  "title"  )
      //        ^^ skipping these spaces
            pos++;
      for (;pos < max; pos++) {
        code = state.src.charCodeAt(pos);
        if (!isSpace(code) && code !== 10) {
          break;
        }
      }
      if (pos >= max) {
        return false;
      }
      // [link](  <href>  "title"  )
      //          ^^^^^^ parsing link destination
            start = pos;
      res = state.md.helpers.parseLinkDestination(state.src, pos, state.posMax);
      if (res.ok) {
        href = state.md.normalizeLink(res.str);
        if (state.md.validateLink(href)) {
          pos = res.pos;
        } else {
          href = "";
        }
        // [link](  <href>  "title"  )
        //                ^^ skipping these spaces
                start = pos;
        for (;pos < max; pos++) {
          code = state.src.charCodeAt(pos);
          if (!isSpace(code) && code !== 10) {
            break;
          }
        }
        // [link](  <href>  "title"  )
        //                  ^^^^^^^ parsing link title
                res = state.md.helpers.parseLinkTitle(state.src, pos, state.posMax);
        if (pos < max && start !== pos && res.ok) {
          title = res.str;
          pos = res.pos;
          // [link](  <href>  "title"  )
          //                         ^^ skipping these spaces
                    for (;pos < max; pos++) {
            code = state.src.charCodeAt(pos);
            if (!isSpace(code) && code !== 10) {
              break;
            }
          }
        }
      }
      if (pos >= max || state.src.charCodeAt(pos) !== 41 /* ) */) {
        // parsing a valid shortcut link failed, fallback to reference
        parseReference = true;
      }
      pos++;
    }
    if (parseReference) {
      // Link reference
      if (typeof state.env.references === "undefined") {
        return false;
      }
      if (pos < max && state.src.charCodeAt(pos) === 91 /* [ */) {
        start = pos + 1;
        pos = state.md.helpers.parseLinkLabel(state, pos);
        if (pos >= 0) {
          label = state.src.slice(start, pos++);
        } else {
          pos = labelEnd + 1;
        }
      } else {
        pos = labelEnd + 1;
      }
      // covers label === '' and label === undefined
      // (collapsed reference link and shortcut reference link respectively)
            if (!label) {
        label = state.src.slice(labelStart, labelEnd);
      }
      ref = state.env.references[normalizeReference(label)];
      if (!ref) {
        state.pos = oldPos;
        return false;
      }
      href = ref.href;
      title = ref.title;
    }
    
    // We found the end of the link, and know for a fact it's a valid link;
    // so all that's left to do is to call tokenizer.
    
        if (!silent) {
      state.pos = labelStart;
      state.posMax = labelEnd;
      const token_o = state.push("link_open", "a", 1);
      const attrs = [ [ "href", href ] ];
      token_o.attrs = attrs;
      if (title) {
        attrs.push([ "title", title ]);
      }
      state.linkLevel++;
      state.md.inline.tokenize(state);
      state.linkLevel--;
      state.push("link_close", "a", -1);
    }
    state.pos = pos;
    state.posMax = max;
    return true;
  }
  // Process ![image](<src> "title")
    function image(state, silent) {
    let code, content, label, pos, ref, res, title, start;
    let href = "";
    const oldPos = state.pos;
    const max = state.posMax;
    if (state.src.charCodeAt(state.pos) !== 33 /* ! */) {
      return false;
    }
    if (state.src.charCodeAt(state.pos + 1) !== 91 /* [ */) {
      return false;
    }
    const labelStart = state.pos + 2;
    const labelEnd = state.md.helpers.parseLinkLabel(state, state.pos + 1, false);
    // parser failed to find ']', so it's not a valid link
        if (labelEnd < 0) {
      return false;
    }
    pos = labelEnd + 1;
    if (pos < max && state.src.charCodeAt(pos) === 40 /* ( */) {
      // Inline link
      // [link](  <href>  "title"  )
      //        ^^ skipping these spaces
      pos++;
      for (;pos < max; pos++) {
        code = state.src.charCodeAt(pos);
        if (!isSpace(code) && code !== 10) {
          break;
        }
      }
      if (pos >= max) {
        return false;
      }
      // [link](  <href>  "title"  )
      //          ^^^^^^ parsing link destination
            start = pos;
      res = state.md.helpers.parseLinkDestination(state.src, pos, state.posMax);
      if (res.ok) {
        href = state.md.normalizeLink(res.str);
        if (state.md.validateLink(href)) {
          pos = res.pos;
        } else {
          href = "";
        }
      }
      // [link](  <href>  "title"  )
      //                ^^ skipping these spaces
            start = pos;
      for (;pos < max; pos++) {
        code = state.src.charCodeAt(pos);
        if (!isSpace(code) && code !== 10) {
          break;
        }
      }
      // [link](  <href>  "title"  )
      //                  ^^^^^^^ parsing link title
            res = state.md.helpers.parseLinkTitle(state.src, pos, state.posMax);
      if (pos < max && start !== pos && res.ok) {
        title = res.str;
        pos = res.pos;
        // [link](  <href>  "title"  )
        //                         ^^ skipping these spaces
                for (;pos < max; pos++) {
          code = state.src.charCodeAt(pos);
          if (!isSpace(code) && code !== 10) {
            break;
          }
        }
      } else {
        title = "";
      }
      if (pos >= max || state.src.charCodeAt(pos) !== 41 /* ) */) {
        state.pos = oldPos;
        return false;
      }
      pos++;
    } else {
      // Link reference
      if (typeof state.env.references === "undefined") {
        return false;
      }
      if (pos < max && state.src.charCodeAt(pos) === 91 /* [ */) {
        start = pos + 1;
        pos = state.md.helpers.parseLinkLabel(state, pos);
        if (pos >= 0) {
          label = state.src.slice(start, pos++);
        } else {
          pos = labelEnd + 1;
        }
      } else {
        pos = labelEnd + 1;
      }
      // covers label === '' and label === undefined
      // (collapsed reference link and shortcut reference link respectively)
            if (!label) {
        label = state.src.slice(labelStart, labelEnd);
      }
      ref = state.env.references[normalizeReference(label)];
      if (!ref) {
        state.pos = oldPos;
        return false;
      }
      href = ref.href;
      title = ref.title;
    }
    
    // We found the end of the link, and know for a fact it's a valid link;
    // so all that's left to do is to call tokenizer.
    
        if (!silent) {
      content = state.src.slice(labelStart, labelEnd);
      const tokens = [];
      state.md.inline.parse(content, state.md, state.env, tokens);
      const token = state.push("image", "img", 0);
      const attrs = [ [ "src", href ], [ "alt", "" ] ];
      token.attrs = attrs;
      token.children = tokens;
      token.content = content;
      if (title) {
        attrs.push([ "title", title ]);
      }
    }
    state.pos = pos;
    state.posMax = max;
    return true;
  }
  // Process autolinks '<protocol:...>'
  /* eslint max-len:0 */  const EMAIL_RE = /^([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)$/;
  /* eslint-disable-next-line no-control-regex */  const AUTOLINK_RE = /^([a-zA-Z][a-zA-Z0-9+.-]{1,31}):([^<>\x00-\x20]*)$/;
  function autolink(state, silent) {
    let pos = state.pos;
    if (state.src.charCodeAt(pos) !== 60 /* < */) {
      return false;
    }
    const start = state.pos;
    const max = state.posMax;
    for (;;) {
      if (++pos >= max) return false;
      const ch = state.src.charCodeAt(pos);
      if (ch === 60 /* < */) return false;
      if (ch === 62 /* > */) break;
    }
    const url = state.src.slice(start + 1, pos);
    if (AUTOLINK_RE.test(url)) {
      const fullUrl = state.md.normalizeLink(url);
      if (!state.md.validateLink(fullUrl)) {
        return false;
      }
      if (!silent) {
        const token_o = state.push("link_open", "a", 1);
        token_o.attrs = [ [ "href", fullUrl ] ];
        token_o.markup = "autolink";
        token_o.info = "auto";
        const token_t = state.push("text", "", 0);
        token_t.content = state.md.normalizeLinkText(url);
        const token_c = state.push("link_close", "a", -1);
        token_c.markup = "autolink";
        token_c.info = "auto";
      }
      state.pos += url.length + 2;
      return true;
    }
    if (EMAIL_RE.test(url)) {
      const fullUrl = state.md.normalizeLink("mailto:" + url);
      if (!state.md.validateLink(fullUrl)) {
        return false;
      }
      if (!silent) {
        const token_o = state.push("link_open", "a", 1);
        token_o.attrs = [ [ "href", fullUrl ] ];
        token_o.markup = "autolink";
        token_o.info = "auto";
        const token_t = state.push("text", "", 0);
        token_t.content = state.md.normalizeLinkText(url);
        const token_c = state.push("link_close", "a", -1);
        token_c.markup = "autolink";
        token_c.info = "auto";
      }
      state.pos += url.length + 2;
      return true;
    }
    return false;
  }
  // Process html tags
    function isLinkOpen(str) {
    return /^<a[>\s]/i.test(str);
  }
  function isLinkClose(str) {
    return /^<\/a\s*>/i.test(str);
  }
  function isLetter(ch) {
    /* eslint no-bitwise:0 */
    const lc = ch | 32;
 // to lower case
        return lc >= 97 /* a */ && lc <= 122 /* z */;
  }
  function html_inline(state, silent) {
    if (!state.md.options.html) {
      return false;
    }
    // Check start
        const max = state.posMax;
    const pos = state.pos;
    if (state.src.charCodeAt(pos) !== 60 /* < */ || pos + 2 >= max) {
      return false;
    }
    // Quick fail on second char
        const ch = state.src.charCodeAt(pos + 1);
    if (ch !== 33 /* ! */ && ch !== 63 /* ? */ && ch !== 47 /* / */ && !isLetter(ch)) {
      return false;
    }
    const match = state.src.slice(pos).match(HTML_TAG_RE);
    if (!match) {
      return false;
    }
    if (!silent) {
      const token = state.push("html_inline", "", 0);
      token.content = match[0];
      if (isLinkOpen(token.content)) state.linkLevel++;
      if (isLinkClose(token.content)) state.linkLevel--;
    }
    state.pos += match[0].length;
    return true;
  }
  // Process html entity - &#123;, &#xAF;, &quot;, ...
    const DIGITAL_RE = /^&#((?:x[a-f0-9]{1,6}|[0-9]{1,7}));/i;
  const NAMED_RE = /^&([a-z][a-z0-9]{1,31});/i;
  function entity(state, silent) {
    const pos = state.pos;
    const max = state.posMax;
    if (state.src.charCodeAt(pos) !== 38 /* & */) return false;
    if (pos + 1 >= max) return false;
    const ch = state.src.charCodeAt(pos + 1);
    if (ch === 35 /* # */) {
      const match = state.src.slice(pos).match(DIGITAL_RE);
      if (match) {
        if (!silent) {
          const code = match[1][0].toLowerCase() === "x" ? parseInt(match[1].slice(1), 16) : parseInt(match[1], 10);
          const token = state.push("text_special", "", 0);
          token.content = isValidEntityCode(code) ? fromCodePoint(code) : fromCodePoint(65533);
          token.markup = match[0];
          token.info = "entity";
        }
        state.pos += match[0].length;
        return true;
      }
    } else {
      const match = state.src.slice(pos).match(NAMED_RE);
      if (match) {
        const decoded = decodeHTML(match[0]);
        if (decoded !== match[0]) {
          if (!silent) {
            const token = state.push("text_special", "", 0);
            token.content = decoded;
            token.markup = match[0];
            token.info = "entity";
          }
          state.pos += match[0].length;
          return true;
        }
      }
    }
    return false;
  }
  // For each opening emphasis-like marker find a matching closing one
  
    function processDelimiters(delimiters) {
    const openersBottom = {};
    const max = delimiters.length;
    if (!max) return;
    // headerIdx is the first delimiter of the current (where closer is) delimiter run
        let headerIdx = 0;
    let lastTokenIdx = -2;
 // needs any value lower than -1
        const jumps = [];
    for (let closerIdx = 0; closerIdx < max; closerIdx++) {
      const closer = delimiters[closerIdx];
      jumps.push(0);
      // markers belong to same delimiter run if:
      //  - they have adjacent tokens
      //  - AND markers are the same
      
            if (delimiters[headerIdx].marker !== closer.marker || lastTokenIdx !== closer.token - 1) {
        headerIdx = closerIdx;
      }
      lastTokenIdx = closer.token;
      // Length is only used for emphasis-specific "rule of 3",
      // if it's not defined (in strikethrough or 3rd party plugins),
      // we can default it to 0 to disable those checks.
      
            closer.length = closer.length || 0;
      if (!closer.close) continue;
      // Previously calculated lower bounds (previous fails)
      // for each marker, each delimiter length modulo 3,
      // and for whether this closer can be an opener;
      // https://github.com/commonmark/cmark/commit/34250e12ccebdc6372b8b49c44fab57c72443460
      /* eslint-disable-next-line no-prototype-builtins */      if (!openersBottom.hasOwnProperty(closer.marker)) {
        openersBottom[closer.marker] = [ -1, -1, -1, -1, -1, -1 ];
      }
      const minOpenerIdx = openersBottom[closer.marker][(closer.open ? 3 : 0) + closer.length % 3];
      let openerIdx = headerIdx - jumps[headerIdx] - 1;
      let newMinOpenerIdx = openerIdx;
      for (;openerIdx > minOpenerIdx; openerIdx -= jumps[openerIdx] + 1) {
        const opener = delimiters[openerIdx];
        if (opener.marker !== closer.marker) continue;
        if (opener.open && opener.end < 0) {
          let isOddMatch = false;
          // from spec:
          
          // If one of the delimiters can both open and close emphasis, then the
          // sum of the lengths of the delimiter runs containing the opening and
          // closing delimiters must not be a multiple of 3 unless both lengths
          // are multiples of 3.
          
                    if (opener.close || closer.open) {
            if ((opener.length + closer.length) % 3 === 0) {
              if (opener.length % 3 !== 0 || closer.length % 3 !== 0) {
                isOddMatch = true;
              }
            }
          }
          if (!isOddMatch) {
            // If previous delimiter cannot be an opener, we can safely skip
            // the entire sequence in future checks. This is required to make
            // sure algorithm has linear complexity (see *_*_*_*_*_... case).
            const lastJump = openerIdx > 0 && !delimiters[openerIdx - 1].open ? jumps[openerIdx - 1] + 1 : 0;
            jumps[closerIdx] = closerIdx - openerIdx + lastJump;
            jumps[openerIdx] = lastJump;
            closer.open = false;
            opener.end = closerIdx;
            opener.close = false;
            newMinOpenerIdx = -1;
            // treat next token as start of run,
            // it optimizes skips in **<...>**a**<...>** pathological case
                        lastTokenIdx = -2;
            break;
          }
        }
      }
      if (newMinOpenerIdx !== -1) {
        // If match for this delimiter run failed, we want to set lower bound for
        // future lookups. This is required to make sure algorithm has linear
        // complexity.
        // See details here:
        // https://github.com/commonmark/cmark/issues/178#issuecomment-270417442
        openersBottom[closer.marker][(closer.open ? 3 : 0) + (closer.length || 0) % 3] = newMinOpenerIdx;
      }
    }
  }
  function link_pairs(state) {
    const tokens_meta = state.tokens_meta;
    const max = state.tokens_meta.length;
    processDelimiters(state.delimiters);
    for (let curr = 0; curr < max; curr++) {
      if (tokens_meta[curr] && tokens_meta[curr].delimiters) {
        processDelimiters(tokens_meta[curr].delimiters);
      }
    }
  }
  // Clean up tokens after emphasis and strikethrough postprocessing:
  // merge adjacent text nodes into one and re-calculate all token levels
  
  // This is necessary because initially emphasis delimiter markers (*, _, ~)
  // are treated as their own separate text tokens. Then emphasis rule either
  // leaves them as text (needed to merge with adjacent text) or turns them
  // into opening/closing tags (which messes up levels inside).
  
    function fragments_join(state) {
    let curr, last;
    let level = 0;
    const tokens = state.tokens;
    const max = state.tokens.length;
    for (curr = last = 0; curr < max; curr++) {
      // re-calculate levels after emphasis/strikethrough turns some text nodes
      // into opening/closing tags
      if (tokens[curr].nesting < 0) level--;
 // closing tag
            tokens[curr].level = level;
      if (tokens[curr].nesting > 0) level++;
 // opening tag
            if (tokens[curr].type === "text" && curr + 1 < max && tokens[curr + 1].type === "text") {
        // collapse two adjacent text nodes
        tokens[curr + 1].content = tokens[curr].content + tokens[curr + 1].content;
      } else {
        if (curr !== last) {
          tokens[last] = tokens[curr];
        }
        last++;
      }
    }
    if (curr !== last) {
      tokens.length = last;
    }
  }
  /** internal
   * class ParserInline
   *
   * Tokenizes paragraph content.
   **/
  // Parser rules
    const _rules = [ [ "text", text ], [ "linkify", linkify ], [ "newline", newline ], [ "escape", escape ], [ "backticks", backtick ], [ "strikethrough", r_strikethrough.tokenize ], [ "emphasis", r_emphasis.tokenize ], [ "link", link ], [ "image", image ], [ "autolink", autolink ], [ "html_inline", html_inline ], [ "entity", entity ] ];
  // `rule2` ruleset was created specifically for emphasis/strikethrough
  // post-processing and may be changed in the future.
  
  // Don't use this for anything except pairs (plugins working with `balance_pairs`).
  
    const _rules2 = [ [ "balance_pairs", link_pairs ], [ "strikethrough", r_strikethrough.postProcess ], [ "emphasis", r_emphasis.postProcess ], 
  // rules for pairs separate '**' into its own text tokens, which may be left unused,
  // rule below merges unused segments back with the rest of the text
  [ "fragments_join", fragments_join ] ];
  /**
   * new ParserInline()
   **/  function ParserInline() {
    /**
     * ParserInline#ruler -> Ruler
     *
     * [[Ruler]] instance. Keep configuration of inline rules.
     **/
    this.ruler = new Ruler;
    for (let i = 0; i < _rules.length; i++) {
      this.ruler.push(_rules[i][0], _rules[i][1]);
    }
    /**
     * ParserInline#ruler2 -> Ruler
     *
     * [[Ruler]] instance. Second ruler used for post-processing
     * (e.g. in emphasis-like rules).
     **/    this.ruler2 = new Ruler;
    for (let i = 0; i < _rules2.length; i++) {
      this.ruler2.push(_rules2[i][0], _rules2[i][1]);
    }
  }
  // Skip single token by running all rules in validation mode;
  // returns `true` if any rule reported success
  
    ParserInline.prototype.skipToken = function(state) {
    const pos = state.pos;
    const rules = this.ruler.getRules("");
    const len = rules.length;
    const maxNesting = state.md.options.maxNesting;
    const cache = state.cache;
    if (typeof cache[pos] !== "undefined") {
      state.pos = cache[pos];
      return;
    }
    let ok = false;
    if (state.level < maxNesting) {
      for (let i = 0; i < len; i++) {
        // Increment state.level and decrement it later to limit recursion.
        // It's harmless to do here, because no tokens are created. But ideally,
        // we'd need a separate private state variable for this purpose.
        state.level++;
        ok = rules[i](state, true);
        state.level--;
        if (ok) {
          if (pos >= state.pos) {
            throw new Error("inline rule didn't increment state.pos");
          }
          break;
        }
      }
    } else {
      // Too much nesting, just skip until the end of the paragraph.
      // NOTE: this will cause links to behave incorrectly in the following case,
      //       when an amount of `[` is exactly equal to `maxNesting + 1`:
      //       [[[[[[[[[[[[[[[[[[[[[foo]()
      // TODO: remove this workaround when CM standard will allow nested links
      //       (we can replace it by preventing links from being parsed in
      //       validation mode)
      state.pos = state.posMax;
    }
    if (!ok) {
      state.pos++;
    }
    cache[pos] = state.pos;
  };
  // Generate tokens for input range
  
    ParserInline.prototype.tokenize = function(state) {
    const rules = this.ruler.getRules("");
    const len = rules.length;
    const end = state.posMax;
    const maxNesting = state.md.options.maxNesting;
    while (state.pos < end) {
      // Try all possible rules.
      // On success, rule should:
      // - update `state.pos`
      // - update `state.tokens`
      // - return true
      const prevPos = state.pos;
      let ok = false;
      if (state.level < maxNesting) {
        for (let i = 0; i < len; i++) {
          ok = rules[i](state, false);
          if (ok) {
            if (prevPos >= state.pos) {
              throw new Error("inline rule didn't increment state.pos");
            }
            break;
          }
        }
      }
      if (ok) {
        if (state.pos >= end) {
          break;
        }
        continue;
      }
      state.pending += state.src[state.pos++];
    }
    if (state.pending) {
      state.pushPending();
    }
  };
  /**
   * ParserInline.parse(str, md, env, outTokens)
   *
   * Process input string and push inline tokens into `outTokens`
   **/  ParserInline.prototype.parse = function(str, md, env, outTokens) {
    const state = new this.State(str, md, env, outTokens);
    this.tokenize(state);
    const rules = this.ruler2.getRules("");
    const len = rules.length;
    for (let i = 0; i < len; i++) {
      rules[i](state);
    }
  };
  ParserInline.prototype.State = StateInline;
  function reFactory(opts) {
    const re = {};
    opts = opts || {};
    re.src_Any = Any.source;
    re.src_Cc = Cc.source;
    re.src_Z = Z.source;
    re.src_P = P.source;
    // \p{\Z\P\Cc\CF} (white spaces + control + format + punctuation)
        re.src_ZPCc = [ re.src_Z, re.src_P, re.src_Cc ].join("|");
    // \p{\Z\Cc} (white spaces + control)
        re.src_ZCc = [ re.src_Z, re.src_Cc ].join("|");
    // Experimental. List of chars, completely prohibited in links
    // because can separate it from other part of text
        const text_separators = "[><\uff5c]";
    // All possible word characters (everything without punctuation, spaces & controls)
    // Defined via punctuation & spaces to save space
    // Should be something like \p{\L\N\S\M} (\w but without `_`)
        re.src_pseudo_letter = "(?:(?!" + text_separators + "|" + re.src_ZPCc + ")" + re.src_Any + ")";
    // The same as abothe but without [0-9]
    // var src_pseudo_letter_non_d = '(?:(?![0-9]|' + src_ZPCc + ')' + src_Any + ')';
        re.src_ip4 = "(?:(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)";
    // Prohibit any of "@/[]()" in user/pass to avoid wrong domain fetch.
        re.src_auth = "(?:(?:(?!" + re.src_ZCc + "|[@/\\[\\]()]).)+@)?";
    re.src_port = "(?::(?:6(?:[0-4]\\d{3}|5(?:[0-4]\\d{2}|5(?:[0-2]\\d|3[0-5])))|[1-5]?\\d{1,4}))?";
    re.src_host_terminator = "(?=$|" + text_separators + "|" + re.src_ZPCc + ")" + "(?!" + (opts["---"] ? "-(?!--)|" : "-|") + "_|:\\d|\\.-|\\.(?!$|" + re.src_ZPCc + "))";
    re.src_path = "(?:" + "[/?#]" + "(?:" + "(?!" + re.src_ZCc + "|" + text_separators + "|[()[\\]{}.,\"'?!\\-;]).|" + "\\[(?:(?!" + re.src_ZCc + "|\\]).)*\\]|" + "\\((?:(?!" + re.src_ZCc + "|[)]).)*\\)|" + "\\{(?:(?!" + re.src_ZCc + "|[}]).)*\\}|" + '\\"(?:(?!' + re.src_ZCc + '|["]).)+\\"|' + "\\'(?:(?!" + re.src_ZCc + "|[']).)+\\'|" + 
    // allow `I'm_king` if no pair found
    "\\'(?=" + re.src_pseudo_letter + "|[-])|" + 
    // google has many dots in "google search" links (#66, #81).
    // github has ... in commit range links,
    // Restrict to
    // - english
    // - percent-encoded
    // - parts of file path
    // - params separator
    // until more examples found.
    "\\.{2,}[a-zA-Z0-9%/&]|" + "\\.(?!" + re.src_ZCc + "|[.]|$)|" + (opts["---"] ? "\\-(?!--(?:[^-]|$))(?:-*)|" : "\\-+|") + 
    // allow `,,,` in paths
    ",(?!" + re.src_ZCc + "|$)|" + 
    // allow `;` if not followed by space-like char
    ";(?!" + re.src_ZCc + "|$)|" + 
    // allow `!!!` in paths, but not at the end
    "\\!+(?!" + re.src_ZCc + "|[!]|$)|" + "\\?(?!" + re.src_ZCc + "|[?]|$)" + ")+" + "|\\/" + ")?";
    // Allow anything in markdown spec, forbid quote (") at the first position
    // because emails enclosed in quotes are far more common
        re.src_email_name = '[\\-;:&=\\+\\$,\\.a-zA-Z0-9_][\\-;:&=\\+\\$,\\"\\.a-zA-Z0-9_]*';
    re.src_xn = "xn--[a-z0-9\\-]{1,59}";
    // More to read about domain names
    // http://serverfault.com/questions/638260/
        re.src_domain_root = 
    // Allow letters & digits (http://test1)
    "(?:" + re.src_xn + "|" + re.src_pseudo_letter + "{1,63}" + ")";
    re.src_domain = "(?:" + re.src_xn + "|" + "(?:" + re.src_pseudo_letter + ")" + "|" + "(?:" + re.src_pseudo_letter + "(?:-|" + re.src_pseudo_letter + "){0,61}" + re.src_pseudo_letter + ")" + ")";
    re.src_host = "(?:" + 
    // Don't need IP check, because digits are already allowed in normal domain names
    //   src_ip4 +
    // '|' +
    "(?:(?:(?:" + re.src_domain + ")\\.)*" + re.src_domain /* _root */ + ")" + ")";
    re.tpl_host_fuzzy = "(?:" + re.src_ip4 + "|" + "(?:(?:(?:" + re.src_domain + ")\\.)+(?:%TLDS%))" + ")";
    re.tpl_host_no_ip_fuzzy = "(?:(?:(?:" + re.src_domain + ")\\.)+(?:%TLDS%))";
    re.src_host_strict = re.src_host + re.src_host_terminator;
    re.tpl_host_fuzzy_strict = re.tpl_host_fuzzy + re.src_host_terminator;
    re.src_host_port_strict = re.src_host + re.src_port + re.src_host_terminator;
    re.tpl_host_port_fuzzy_strict = re.tpl_host_fuzzy + re.src_port + re.src_host_terminator;
    re.tpl_host_port_no_ip_fuzzy_strict = re.tpl_host_no_ip_fuzzy + re.src_port + re.src_host_terminator;
    
    // Main rules
    
    // Rude test fuzzy links by host, for quick deny
        re.tpl_host_fuzzy_test = "localhost|www\\.|\\.\\d{1,3}\\.|(?:\\.(?:%TLDS%)(?:" + re.src_ZPCc + "|>|$))";
    re.tpl_email_fuzzy = "(^|" + text_separators + '|"|\\(|' + re.src_ZCc + ")" + "(" + re.src_email_name + "@" + re.tpl_host_fuzzy_strict + ")";
    re.tpl_link_fuzzy = 
    // Fuzzy link can't be prepended with .:/\- and non punctuation.
    // but can start with > (markdown blockquote)
    "(^|(?![.:/\\-_@])(?:[$+<=>^`|\uff5c]|" + re.src_ZPCc + "))" + "((?![$+<=>^`|\uff5c])" + re.tpl_host_port_fuzzy_strict + re.src_path + ")";
    re.tpl_link_no_ip_fuzzy = 
    // Fuzzy link can't be prepended with .:/\- and non punctuation.
    // but can start with > (markdown blockquote)
    "(^|(?![.:/\\-_@])(?:[$+<=>^`|\uff5c]|" + re.src_ZPCc + "))" + "((?![$+<=>^`|\uff5c])" + re.tpl_host_port_no_ip_fuzzy_strict + re.src_path + ")";
    return re;
  }
  
  // Helpers
  
  // Merge objects
  
    function assign(obj /* from1, from2, from3, ... */) {
    const sources = Array.prototype.slice.call(arguments, 1);
    sources.forEach((function(source) {
      if (!source) {
        return;
      }
      Object.keys(source).forEach((function(key) {
        obj[key] = source[key];
      }));
    }));
    return obj;
  }
  function _class(obj) {
    return Object.prototype.toString.call(obj);
  }
  function isString(obj) {
    return _class(obj) === "[object String]";
  }
  function isObject(obj) {
    return _class(obj) === "[object Object]";
  }
  function isRegExp(obj) {
    return _class(obj) === "[object RegExp]";
  }
  function isFunction(obj) {
    return _class(obj) === "[object Function]";
  }
  function escapeRE(str) {
    return str.replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
  }
  
    const defaultOptions = {
    fuzzyLink: true,
    fuzzyEmail: true,
    fuzzyIP: false
  };
  function isOptionsObj(obj) {
    return Object.keys(obj || {}).reduce((function(acc, k) {
      /* eslint-disable-next-line no-prototype-builtins */
      return acc || defaultOptions.hasOwnProperty(k);
    }), false);
  }
  const defaultSchemas = {
    "http:": {
      validate: function(text, pos, self) {
        const tail = text.slice(pos);
        if (!self.re.http) {
          // compile lazily, because "host"-containing variables can change on tlds update.
          self.re.http = new RegExp("^\\/\\/" + self.re.src_auth + self.re.src_host_port_strict + self.re.src_path, "i");
        }
        if (self.re.http.test(tail)) {
          return tail.match(self.re.http)[0].length;
        }
        return 0;
      }
    },
    "https:": "http:",
    "ftp:": "http:",
    "//": {
      validate: function(text, pos, self) {
        const tail = text.slice(pos);
        if (!self.re.no_http) {
          // compile lazily, because "host"-containing variables can change on tlds update.
          self.re.no_http = new RegExp("^" + self.re.src_auth + 
          // Don't allow single-level domains, because of false positives like '//test'
          // with code comments
          "(?:localhost|(?:(?:" + self.re.src_domain + ")\\.)+" + self.re.src_domain_root + ")" + self.re.src_port + self.re.src_host_terminator + self.re.src_path, "i");
        }
        if (self.re.no_http.test(tail)) {
          // should not be `://` & `///`, that protects from errors in protocol name
          if (pos >= 3 && text[pos - 3] === ":") {
            return 0;
          }
          if (pos >= 3 && text[pos - 3] === "/") {
            return 0;
          }
          return tail.match(self.re.no_http)[0].length;
        }
        return 0;
      }
    },
    "mailto:": {
      validate: function(text, pos, self) {
        const tail = text.slice(pos);
        if (!self.re.mailto) {
          self.re.mailto = new RegExp("^" + self.re.src_email_name + "@" + self.re.src_host_strict, "i");
        }
        if (self.re.mailto.test(tail)) {
          return tail.match(self.re.mailto)[0].length;
        }
        return 0;
      }
    }
  };
  // RE pattern for 2-character tlds (autogenerated by ./support/tlds_2char_gen.js)
  /* eslint-disable-next-line max-len */  const tlds_2ch_src_re = "a[cdefgilmnoqrstuwxz]|b[abdefghijmnorstvwyz]|c[acdfghiklmnoruvwxyz]|d[ejkmoz]|e[cegrstu]|f[ijkmor]|g[abdefghilmnpqrstuwy]|h[kmnrtu]|i[delmnoqrst]|j[emop]|k[eghimnprwyz]|l[abcikrstuvy]|m[acdeghklmnopqrstuvwxyz]|n[acefgilopruz]|om|p[aefghklmnrstwy]|qa|r[eosuw]|s[abcdeghijklmnortuvxyz]|t[cdfghjklmnortvwz]|u[agksyz]|v[aceginu]|w[fs]|y[et]|z[amw]";
  // DON'T try to make PRs with changes. Extend TLDs with LinkifyIt.tlds() instead
    const tlds_default = "biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|\u0440\u0444".split("|");
  function resetScanCache(self) {
    self.__index__ = -1;
    self.__text_cache__ = "";
  }
  function createValidator(re) {
    return function(text, pos) {
      const tail = text.slice(pos);
      if (re.test(tail)) {
        return tail.match(re)[0].length;
      }
      return 0;
    };
  }
  function createNormalizer() {
    return function(match, self) {
      self.normalize(match);
    };
  }
  // Schemas compiler. Build regexps.
  
    function compile(self) {
    // Load & clone RE patterns.
    const re = self.re = reFactory(self.__opts__);
    // Define dynamic patterns
        const tlds = self.__tlds__.slice();
    self.onCompile();
    if (!self.__tlds_replaced__) {
      tlds.push(tlds_2ch_src_re);
    }
    tlds.push(re.src_xn);
    re.src_tlds = tlds.join("|");
    function untpl(tpl) {
      return tpl.replace("%TLDS%", re.src_tlds);
    }
    re.email_fuzzy = RegExp(untpl(re.tpl_email_fuzzy), "i");
    re.link_fuzzy = RegExp(untpl(re.tpl_link_fuzzy), "i");
    re.link_no_ip_fuzzy = RegExp(untpl(re.tpl_link_no_ip_fuzzy), "i");
    re.host_fuzzy_test = RegExp(untpl(re.tpl_host_fuzzy_test), "i");
    
    // Compile each schema
    
        const aliases = [];
    self.__compiled__ = {};
 // Reset compiled data
        function schemaError(name, val) {
      throw new Error('(LinkifyIt) Invalid schema "' + name + '": ' + val);
    }
    Object.keys(self.__schemas__).forEach((function(name) {
      const val = self.__schemas__[name];
      // skip disabled methods
            if (val === null) {
        return;
      }
      const compiled = {
        validate: null,
        link: null
      };
      self.__compiled__[name] = compiled;
      if (isObject(val)) {
        if (isRegExp(val.validate)) {
          compiled.validate = createValidator(val.validate);
        } else if (isFunction(val.validate)) {
          compiled.validate = val.validate;
        } else {
          schemaError(name, val);
        }
        if (isFunction(val.normalize)) {
          compiled.normalize = val.normalize;
        } else if (!val.normalize) {
          compiled.normalize = createNormalizer();
        } else {
          schemaError(name, val);
        }
        return;
      }
      if (isString(val)) {
        aliases.push(name);
        return;
      }
      schemaError(name, val);
    }));
    
    // Compile postponed aliases
    
        aliases.forEach((function(alias) {
      if (!self.__compiled__[self.__schemas__[alias]]) {
        // Silently fail on missed schemas to avoid errons on disable.
        // schemaError(alias, self.__schemas__[alias]);
        return;
      }
      self.__compiled__[alias].validate = self.__compiled__[self.__schemas__[alias]].validate;
      self.__compiled__[alias].normalize = self.__compiled__[self.__schemas__[alias]].normalize;
    }));
    
    // Fake record for guessed links
    
        self.__compiled__[""] = {
      validate: null,
      normalize: createNormalizer()
    };
    
    // Build schema condition
    
        const slist = Object.keys(self.__compiled__).filter((function(name) {
      // Filter disabled & fake schemas
      return name.length > 0 && self.__compiled__[name];
    })).map(escapeRE).join("|");
    // (?!_) cause 1.5x slowdown
        self.re.schema_test = RegExp("(^|(?!_)(?:[><\uff5c]|" + re.src_ZPCc + "))(" + slist + ")", "i");
    self.re.schema_search = RegExp("(^|(?!_)(?:[><\uff5c]|" + re.src_ZPCc + "))(" + slist + ")", "ig");
    self.re.schema_at_start = RegExp("^" + self.re.schema_search.source, "i");
    self.re.pretest = RegExp("(" + self.re.schema_test.source + ")|(" + self.re.host_fuzzy_test.source + ")|@", "i");
    
    // Cleanup
    
        resetScanCache(self);
  }
  /**
   * class Match
   *
   * Match result. Single element of array, returned by [[LinkifyIt#match]]
   **/  function Match(self, shift) {
    const start = self.__index__;
    const end = self.__last_index__;
    const text = self.__text_cache__.slice(start, end);
    /**
     * Match#schema -> String
     *
     * Prefix (protocol) for matched string.
     **/    this.schema = self.__schema__.toLowerCase();
    /**
     * Match#index -> Number
     *
     * First position of matched string.
     **/    this.index = start + shift;
    /**
     * Match#lastIndex -> Number
     *
     * Next position after matched string.
     **/    this.lastIndex = end + shift;
    /**
     * Match#raw -> String
     *
     * Matched string.
     **/    this.raw = text;
    /**
     * Match#text -> String
     *
     * Notmalized text of matched string.
     **/    this.text = text;
    /**
     * Match#url -> String
     *
     * Normalized url of matched string.
     **/    this.url = text;
  }
  function createMatch(self, shift) {
    const match = new Match(self, shift);
    self.__compiled__[match.schema].normalize(match, self);
    return match;
  }
  /**
   * class LinkifyIt
   **/
  /**
   * new LinkifyIt(schemas, options)
   * - schemas (Object): Optional. Additional schemas to validate (prefix/validator)
   * - options (Object): { fuzzyLink|fuzzyEmail|fuzzyIP: true|false }
   *
   * Creates new linkifier instance with optional additional schemas.
   * Can be called without `new` keyword for convenience.
   *
   * By default understands:
   *
   * - `http(s)://...` , `ftp://...`, `mailto:...` & `//...` links
   * - "fuzzy" links and emails (example.com, foo@bar.com).
   *
   * `schemas` is an object, where each key/value describes protocol/rule:
   *
   * - __key__ - link prefix (usually, protocol name with `:` at the end, `skype:`
   *   for example). `linkify-it` makes shure that prefix is not preceeded with
   *   alphanumeric char and symbols. Only whitespaces and punctuation allowed.
   * - __value__ - rule to check tail after link prefix
   *   - _String_ - just alias to existing rule
   *   - _Object_
   *     - _validate_ - validator function (should return matched length on success),
   *       or `RegExp`.
   *     - _normalize_ - optional function to normalize text & url of matched result
   *       (for example, for @twitter mentions).
   *
   * `options`:
   *
   * - __fuzzyLink__ - recognige URL-s without `http(s):` prefix. Default `true`.
   * - __fuzzyIP__ - allow IPs in fuzzy links above. Can conflict with some texts
   *   like version numbers. Default `false`.
   * - __fuzzyEmail__ - recognize emails without `mailto:` prefix.
   *
   **/  function LinkifyIt(schemas, options) {
    if (!(this instanceof LinkifyIt)) {
      return new LinkifyIt(schemas, options);
    }
    if (!options) {
      if (isOptionsObj(schemas)) {
        options = schemas;
        schemas = {};
      }
    }
    this.__opts__ = assign({}, defaultOptions, options);
    // Cache last tested result. Used to skip repeating steps on next `match` call.
        this.__index__ = -1;
    this.__last_index__ = -1;
 // Next scan position
        this.__schema__ = "";
    this.__text_cache__ = "";
    this.__schemas__ = assign({}, defaultSchemas, schemas);
    this.__compiled__ = {};
    this.__tlds__ = tlds_default;
    this.__tlds_replaced__ = false;
    this.re = {};
    compile(this);
  }
  /** chainable
   * LinkifyIt#add(schema, definition)
   * - schema (String): rule name (fixed pattern prefix)
   * - definition (String|RegExp|Object): schema definition
   *
   * Add new rule definition. See constructor description for details.
   **/  LinkifyIt.prototype.add = function add(schema, definition) {
    this.__schemas__[schema] = definition;
    compile(this);
    return this;
  };
  /** chainable
   * LinkifyIt#set(options)
   * - options (Object): { fuzzyLink|fuzzyEmail|fuzzyIP: true|false }
   *
   * Set recognition options for links without schema.
   **/  LinkifyIt.prototype.set = function set(options) {
    this.__opts__ = assign(this.__opts__, options);
    return this;
  };
  /**
   * LinkifyIt#test(text) -> Boolean
   *
   * Searches linkifiable pattern and returns `true` on success or `false` on fail.
   **/  LinkifyIt.prototype.test = function test(text) {
    // Reset scan cache
    this.__text_cache__ = text;
    this.__index__ = -1;
    if (!text.length) {
      return false;
    }
    let m, ml, me, len, shift, next, re, tld_pos, at_pos;
    // try to scan for link with schema - that's the most simple rule
        if (this.re.schema_test.test(text)) {
      re = this.re.schema_search;
      re.lastIndex = 0;
      while ((m = re.exec(text)) !== null) {
        len = this.testSchemaAt(text, m[2], re.lastIndex);
        if (len) {
          this.__schema__ = m[2];
          this.__index__ = m.index + m[1].length;
          this.__last_index__ = m.index + m[0].length + len;
          break;
        }
      }
    }
    if (this.__opts__.fuzzyLink && this.__compiled__["http:"]) {
      // guess schemaless links
      tld_pos = text.search(this.re.host_fuzzy_test);
      if (tld_pos >= 0) {
        // if tld is located after found link - no need to check fuzzy pattern
        if (this.__index__ < 0 || tld_pos < this.__index__) {
          if ((ml = text.match(this.__opts__.fuzzyIP ? this.re.link_fuzzy : this.re.link_no_ip_fuzzy)) !== null) {
            shift = ml.index + ml[1].length;
            if (this.__index__ < 0 || shift < this.__index__) {
              this.__schema__ = "";
              this.__index__ = shift;
              this.__last_index__ = ml.index + ml[0].length;
            }
          }
        }
      }
    }
    if (this.__opts__.fuzzyEmail && this.__compiled__["mailto:"]) {
      // guess schemaless emails
      at_pos = text.indexOf("@");
      if (at_pos >= 0) {
        // We can't skip this check, because this cases are possible:
        // 192.168.1.1@gmail.com, my.in@example.com
        if ((me = text.match(this.re.email_fuzzy)) !== null) {
          shift = me.index + me[1].length;
          next = me.index + me[0].length;
          if (this.__index__ < 0 || shift < this.__index__ || shift === this.__index__ && next > this.__last_index__) {
            this.__schema__ = "mailto:";
            this.__index__ = shift;
            this.__last_index__ = next;
          }
        }
      }
    }
    return this.__index__ >= 0;
  };
  /**
   * LinkifyIt#pretest(text) -> Boolean
   *
   * Very quick check, that can give false positives. Returns true if link MAY BE
   * can exists. Can be used for speed optimization, when you need to check that
   * link NOT exists.
   **/  LinkifyIt.prototype.pretest = function pretest(text) {
    return this.re.pretest.test(text);
  };
  /**
   * LinkifyIt#testSchemaAt(text, name, position) -> Number
   * - text (String): text to scan
   * - name (String): rule (schema) name
   * - position (Number): text offset to check from
   *
   * Similar to [[LinkifyIt#test]] but checks only specific protocol tail exactly
   * at given position. Returns length of found pattern (0 on fail).
   **/  LinkifyIt.prototype.testSchemaAt = function testSchemaAt(text, schema, pos) {
    // If not supported schema check requested - terminate
    if (!this.__compiled__[schema.toLowerCase()]) {
      return 0;
    }
    return this.__compiled__[schema.toLowerCase()].validate(text, pos, this);
  };
  /**
   * LinkifyIt#match(text) -> Array|null
   *
   * Returns array of found link descriptions or `null` on fail. We strongly
   * recommend to use [[LinkifyIt#test]] first, for best speed.
   *
   * ##### Result match description
   *
   * - __schema__ - link schema, can be empty for fuzzy links, or `//` for
   *   protocol-neutral  links.
   * - __index__ - offset of matched text
   * - __lastIndex__ - index of next char after mathch end
   * - __raw__ - matched text
   * - __text__ - normalized text
   * - __url__ - link, generated from matched text
   **/  LinkifyIt.prototype.match = function match(text) {
    const result = [];
    let shift = 0;
    // Try to take previous element from cache, if .test() called before
        if (this.__index__ >= 0 && this.__text_cache__ === text) {
      result.push(createMatch(this, shift));
      shift = this.__last_index__;
    }
    // Cut head if cache was used
        let tail = shift ? text.slice(shift) : text;
    // Scan string until end reached
        while (this.test(tail)) {
      result.push(createMatch(this, shift));
      tail = tail.slice(this.__last_index__);
      shift += this.__last_index__;
    }
    if (result.length) {
      return result;
    }
    return null;
  };
  /**
   * LinkifyIt#matchAtStart(text) -> Match|null
   *
   * Returns fully-formed (not fuzzy) link if it starts at the beginning
   * of the string, and null otherwise.
   **/  LinkifyIt.prototype.matchAtStart = function matchAtStart(text) {
    // Reset scan cache
    this.__text_cache__ = text;
    this.__index__ = -1;
    if (!text.length) return null;
    const m = this.re.schema_at_start.exec(text);
    if (!m) return null;
    const len = this.testSchemaAt(text, m[2], m[0].length);
    if (!len) return null;
    this.__schema__ = m[2];
    this.__index__ = m.index + m[1].length;
    this.__last_index__ = m.index + m[0].length + len;
    return createMatch(this, 0);
  };
  /** chainable
   * LinkifyIt#tlds(list [, keepOld]) -> this
   * - list (Array): list of tlds
   * - keepOld (Boolean): merge with current list if `true` (`false` by default)
   *
   * Load (or merge) new tlds list. Those are user for fuzzy links (without prefix)
   * to avoid false positives. By default this algorythm used:
   *
   * - hostname with any 2-letter root zones are ok.
   * - biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|Ñ€Ñ„
   *   are ok.
   * - encoded (`xn--...`) root zones are ok.
   *
   * If list is replaced, then exact match for 2-chars root zones will be checked.
   **/  LinkifyIt.prototype.tlds = function tlds(list, keepOld) {
    list = Array.isArray(list) ? list : [ list ];
    if (!keepOld) {
      this.__tlds__ = list.slice();
      this.__tlds_replaced__ = true;
      compile(this);
      return this;
    }
    this.__tlds__ = this.__tlds__.concat(list).sort().filter((function(el, idx, arr) {
      return el !== arr[idx - 1];
    })).reverse();
    compile(this);
    return this;
  };
  /**
   * LinkifyIt#normalize(match)
   *
   * Default normalizer (if schema does not define it's own).
   **/  LinkifyIt.prototype.normalize = function normalize(match) {
    // Do minimal possible changes by default. Need to collect feedback prior
    // to move forward https://github.com/markdown-it/linkify-it/issues/1
    if (!match.schema) {
      match.url = "http://" + match.url;
    }
    if (match.schema === "mailto:" && !/^mailto:/i.test(match.url)) {
      match.url = "mailto:" + match.url;
    }
  };
  /**
   * LinkifyIt#onCompile()
   *
   * Override to modify basic RegExp-s.
   **/  LinkifyIt.prototype.onCompile = function onCompile() {};
  /** Highest positive signed 32-bit float value */  const maxInt = 2147483647;
 // aka. 0x7FFFFFFF or 2^31-1
  /** Bootstring parameters */  const base = 36;
  const tMin = 1;
  const tMax = 26;
  const skew = 38;
  const damp = 700;
  const initialBias = 72;
  const initialN = 128;
 // 0x80
    const delimiter = "-";
 // '\x2D'
  /** Regular expressions */  const regexPunycode = /^xn--/;
  const regexNonASCII = /[^\0-\x7F]/;
 // Note: U+007F DEL is excluded too.
    const regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g;
 // RFC 3490 separators
  /** Error messages */  const errors = {
    overflow: "Overflow: input needs wider integers to process",
    "not-basic": "Illegal input >= 0x80 (not a basic code point)",
    "invalid-input": "Invalid input"
  };
  /** Convenience shortcuts */  const baseMinusTMin = base - tMin;
  const floor = Math.floor;
  const stringFromCharCode = String.fromCharCode;
  /*--------------------------------------------------------------------------*/
  /**
   * A generic error utility function.
   * @private
   * @param {String} type The error type.
   * @returns {Error} Throws a `RangeError` with the applicable error message.
   */  function error(type) {
    throw new RangeError(errors[type]);
  }
  /**
   * A generic `Array#map` utility function.
   * @private
   * @param {Array} array The array to iterate over.
   * @param {Function} callback The function that gets called for every array
   * item.
   * @returns {Array} A new array of values returned by the callback function.
   */  function map(array, callback) {
    const result = [];
    let length = array.length;
    while (length--) {
      result[length] = callback(array[length]);
    }
    return result;
  }
  /**
   * A simple `Array#map`-like wrapper to work with domain name strings or email
   * addresses.
   * @private
   * @param {String} domain The domain name or email address.
   * @param {Function} callback The function that gets called for every
   * character.
   * @returns {String} A new string of characters returned by the callback
   * function.
   */  function mapDomain(domain, callback) {
    const parts = domain.split("@");
    let result = "";
    if (parts.length > 1) {
      // In email addresses, only the domain name should be punycoded. Leave
      // the local part (i.e. everything up to `@`) intact.
      result = parts[0] + "@";
      domain = parts[1];
    }
    // Avoid `split(regex)` for IE8 compatibility. See #17.
        domain = domain.replace(regexSeparators, ".");
    const labels = domain.split(".");
    const encoded = map(labels, callback).join(".");
    return result + encoded;
  }
  /**
   * Creates an array containing the numeric code points of each Unicode
   * character in the string. While JavaScript uses UCS-2 internally,
   * this function will convert a pair of surrogate halves (each of which
   * UCS-2 exposes as separate characters) into a single code point,
   * matching UTF-16.
   * @see `punycode.ucs2.encode`
   * @see <https://mathiasbynens.be/notes/javascript-encoding>
   * @memberOf punycode.ucs2
   * @name decode
   * @param {String} string The Unicode input string (UCS-2).
   * @returns {Array} The new array of code points.
   */  function ucs2decode(string) {
    const output = [];
    let counter = 0;
    const length = string.length;
    while (counter < length) {
      const value = string.charCodeAt(counter++);
      if (value >= 55296 && value <= 56319 && counter < length) {
        // It's a high surrogate, and there is a next character.
        const extra = string.charCodeAt(counter++);
        if ((extra & 64512) == 56320) {
          // Low surrogate.
          output.push(((value & 1023) << 10) + (extra & 1023) + 65536);
        } else {
          // It's an unmatched surrogate; only append this code unit, in case the
          // next code unit is the high surrogate of a surrogate pair.
          output.push(value);
          counter--;
        }
      } else {
        output.push(value);
      }
    }
    return output;
  }
  /**
   * Creates a string based on an array of numeric code points.
   * @see `punycode.ucs2.decode`
   * @memberOf punycode.ucs2
   * @name encode
   * @param {Array} codePoints The array of numeric code points.
   * @returns {String} The new Unicode string (UCS-2).
   */  const ucs2encode = codePoints => String.fromCodePoint(...codePoints)
  /**
   * Converts a basic code point into a digit/integer.
   * @see `digitToBasic()`
   * @private
   * @param {Number} codePoint The basic numeric code point value.
   * @returns {Number} The numeric value of a basic code point (for use in
   * representing integers) in the range `0` to `base - 1`, or `base` if
   * the code point does not represent a value.
   */;
  const basicToDigit = function(codePoint) {
    if (codePoint >= 48 && codePoint < 58) {
      return 26 + (codePoint - 48);
    }
    if (codePoint >= 65 && codePoint < 91) {
      return codePoint - 65;
    }
    if (codePoint >= 97 && codePoint < 123) {
      return codePoint - 97;
    }
    return base;
  };
  /**
   * Converts a digit/integer into a basic code point.
   * @see `basicToDigit()`
   * @private
   * @param {Number} digit The numeric value of a basic code point.
   * @returns {Number} The basic code point whose value (when used for
   * representing integers) is `digit`, which needs to be in the range
   * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
   * used; else, the lowercase form is used. The behavior is undefined
   * if `flag` is non-zero and `digit` has no uppercase form.
   */  const digitToBasic = function(digit, flag) {
    //  0..25 map to ASCII a..z or A..Z
    // 26..35 map to ASCII 0..9
    return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
  };
  /**
   * Bias adaptation function as per section 3.4 of RFC 3492.
   * https://tools.ietf.org/html/rfc3492#section-3.4
   * @private
   */  const adapt = function(delta, numPoints, firstTime) {
    let k = 0;
    delta = firstTime ? floor(delta / damp) : delta >> 1;
    delta += floor(delta / numPoints);
    for (;delta > baseMinusTMin * tMax >> 1; k += base) {
      delta = floor(delta / baseMinusTMin);
    }
    return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
  };
  /**
   * Converts a Punycode string of ASCII-only symbols to a string of Unicode
   * symbols.
   * @memberOf punycode
   * @param {String} input The Punycode string of ASCII-only symbols.
   * @returns {String} The resulting string of Unicode symbols.
   */  const decode = function(input) {
    // Don't use UCS-2.
    const output = [];
    const inputLength = input.length;
    let i = 0;
    let n = initialN;
    let bias = initialBias;
    // Handle the basic code points: let `basic` be the number of input code
    // points before the last delimiter, or `0` if there is none, then copy
    // the first basic code points to the output.
        let basic = input.lastIndexOf(delimiter);
    if (basic < 0) {
      basic = 0;
    }
    for (let j = 0; j < basic; ++j) {
      // if it's not a basic code point
      if (input.charCodeAt(j) >= 128) {
        error("not-basic");
      }
      output.push(input.charCodeAt(j));
    }
    // Main decoding loop: start just after the last delimiter if any basic code
    // points were copied; start at the beginning otherwise.
        for (let index = basic > 0 ? basic + 1 : 0; index < inputLength; ) {
      // `index` is the index of the next character to be consumed.
      // Decode a generalized variable-length integer into `delta`,
      // which gets added to `i`. The overflow checking is easier
      // if we increase `i` as we go, then subtract off its starting
      // value at the end to obtain `delta`.
      const oldi = i;
      for (let w = 1, k = base; ;k += base) {
        if (index >= inputLength) {
          error("invalid-input");
        }
        const digit = basicToDigit(input.charCodeAt(index++));
        if (digit >= base) {
          error("invalid-input");
        }
        if (digit > floor((maxInt - i) / w)) {
          error("overflow");
        }
        i += digit * w;
        const t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
        if (digit < t) {
          break;
        }
        const baseMinusT = base - t;
        if (w > floor(maxInt / baseMinusT)) {
          error("overflow");
        }
        w *= baseMinusT;
      }
      const out = output.length + 1;
      bias = adapt(i - oldi, out, oldi == 0);
      // `i` was supposed to wrap around from `out` to `0`,
      // incrementing `n` each time, so we'll fix that now:
            if (floor(i / out) > maxInt - n) {
        error("overflow");
      }
      n += floor(i / out);
      i %= out;
      // Insert `n` at position `i` of the output.
            output.splice(i++, 0, n);
    }
    return String.fromCodePoint(...output);
  };
  /**
   * Converts a string of Unicode symbols (e.g. a domain name label) to a
   * Punycode string of ASCII-only symbols.
   * @memberOf punycode
   * @param {String} input The string of Unicode symbols.
   * @returns {String} The resulting Punycode string of ASCII-only symbols.
   */  const encode = function(input) {
    const output = [];
    // Convert the input in UCS-2 to an array of Unicode code points.
        input = ucs2decode(input);
    // Cache the length.
        const inputLength = input.length;
    // Initialize the state.
        let n = initialN;
    let delta = 0;
    let bias = initialBias;
    // Handle the basic code points.
        for (const currentValue of input) {
      if (currentValue < 128) {
        output.push(stringFromCharCode(currentValue));
      }
    }
    const basicLength = output.length;
    let handledCPCount = basicLength;
    // `handledCPCount` is the number of code points that have been handled;
    // `basicLength` is the number of basic code points.
    // Finish the basic string with a delimiter unless it's empty.
        if (basicLength) {
      output.push(delimiter);
    }
    // Main encoding loop:
        while (handledCPCount < inputLength) {
      // All non-basic code points < n have been handled already. Find the next
      // larger one:
      let m = maxInt;
      for (const currentValue of input) {
        if (currentValue >= n && currentValue < m) {
          m = currentValue;
        }
      }
      // Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
      // but guard against overflow.
            const handledCPCountPlusOne = handledCPCount + 1;
      if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
        error("overflow");
      }
      delta += (m - n) * handledCPCountPlusOne;
      n = m;
      for (const currentValue of input) {
        if (currentValue < n && ++delta > maxInt) {
          error("overflow");
        }
        if (currentValue === n) {
          // Represent delta as a generalized variable-length integer.
          let q = delta;
          for (let k = base; ;k += base) {
            const t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
            if (q < t) {
              break;
            }
            const qMinusT = q - t;
            const baseMinusT = base - t;
            output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0)));
            q = floor(qMinusT / baseMinusT);
          }
          output.push(stringFromCharCode(digitToBasic(q, 0)));
          bias = adapt(delta, handledCPCountPlusOne, handledCPCount === basicLength);
          delta = 0;
          ++handledCPCount;
        }
      }
      ++delta;
      ++n;
    }
    return output.join("");
  };
  /**
   * Converts a Punycode string representing a domain name or an email address
   * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
   * it doesn't matter if you call it on a string that has already been
   * converted to Unicode.
   * @memberOf punycode
   * @param {String} input The Punycoded domain name or email address to
   * convert to Unicode.
   * @returns {String} The Unicode representation of the given Punycode
   * string.
   */  const toUnicode = function(input) {
    return mapDomain(input, (function(string) {
      return regexPunycode.test(string) ? decode(string.slice(4).toLowerCase()) : string;
    }));
  };
  /**
   * Converts a Unicode string representing a domain name or an email address to
   * Punycode. Only the non-ASCII parts of the domain name will be converted,
   * i.e. it doesn't matter if you call it with a domain that's already in
   * ASCII.
   * @memberOf punycode
   * @param {String} input The domain name or email address to convert, as a
   * Unicode string.
   * @returns {String} The Punycode representation of the given domain name or
   * email address.
   */  const toASCII = function(input) {
    return mapDomain(input, (function(string) {
      return regexNonASCII.test(string) ? "xn--" + encode(string) : string;
    }));
  };
  /*--------------------------------------------------------------------------*/
  /** Define the public API */  const punycode = {
    /**
     * A string representing the current Punycode.js version number.
     * @memberOf punycode
     * @type String
     */
    version: "2.3.1",
    /**
     * An object of methods to convert from JavaScript's internal character
     * representation (UCS-2) to Unicode code points, and back.
     * @see <https://mathiasbynens.be/notes/javascript-encoding>
     * @memberOf punycode
     * @type Object
     */
    ucs2: {
      decode: ucs2decode,
      encode: ucs2encode
    },
    decode: decode,
    encode: encode,
    toASCII: toASCII,
    toUnicode: toUnicode
  };
  // markdown-it default options
    var cfg_default = {
    options: {
      // Enable HTML tags in source
      html: false,
      // Use '/' to close single tags (<br />)
      xhtmlOut: false,
      // Convert '\n' in paragraphs into <br>
      breaks: false,
      // CSS language prefix for fenced blocks
      langPrefix: "language-",
      // autoconvert URL-like texts to links
      linkify: false,
      // Enable some language-neutral replacements + quotes beautification
      typographer: false,
      // Double + single quotes replacement pairs, when typographer enabled,
      // and smartquotes on. Could be either a String or an Array.
      // For example, you can use 'Â«Â»â€žâ€œ' for Russian, 'â€žâ€œâ€šâ€˜' for German,
      // and ['Â«\xA0', '\xA0Â»', 'â€¹\xA0', '\xA0â€º'] for French (including nbsp).
      quotes: "\u201c\u201d\u2018\u2019",
      /* â€œâ€â€˜â€™ */
      // Highlighter function. Should return escaped HTML,
      // or '' if the source string is not changed and should be escaped externaly.
      // If result starts with <pre... internal wrapper is skipped.
      // function (/*str, lang*/) { return ''; }
      highlight: null,
      // Internal protection, recursion limit
      maxNesting: 100
    },
    components: {
      core: {},
      block: {},
      inline: {}
    }
  };
  // "Zero" preset, with nothing enabled. Useful for manual configuring of simple
  // modes. For example, to parse bold/italic only.
    var cfg_zero = {
    options: {
      // Enable HTML tags in source
      html: false,
      // Use '/' to close single tags (<br />)
      xhtmlOut: false,
      // Convert '\n' in paragraphs into <br>
      breaks: false,
      // CSS language prefix for fenced blocks
      langPrefix: "language-",
      // autoconvert URL-like texts to links
      linkify: false,
      // Enable some language-neutral replacements + quotes beautification
      typographer: false,
      // Double + single quotes replacement pairs, when typographer enabled,
      // and smartquotes on. Could be either a String or an Array.
      // For example, you can use 'Â«Â»â€žâ€œ' for Russian, 'â€žâ€œâ€šâ€˜' for German,
      // and ['Â«\xA0', '\xA0Â»', 'â€¹\xA0', '\xA0â€º'] for French (including nbsp).
      quotes: "\u201c\u201d\u2018\u2019",
      /* â€œâ€â€˜â€™ */
      // Highlighter function. Should return escaped HTML,
      // or '' if the source string is not changed and should be escaped externaly.
      // If result starts with <pre... internal wrapper is skipped.
      // function (/*str, lang*/) { return ''; }
      highlight: null,
      // Internal protection, recursion limit
      maxNesting: 20
    },
    components: {
      core: {
        rules: [ "normalize", "block", "inline", "text_join" ]
      },
      block: {
        rules: [ "paragraph" ]
      },
      inline: {
        rules: [ "text" ],
        rules2: [ "balance_pairs", "fragments_join" ]
      }
    }
  };
  // Commonmark default options
    var cfg_commonmark = {
    options: {
      // Enable HTML tags in source
      html: true,
      // Use '/' to close single tags (<br />)
      xhtmlOut: true,
      // Convert '\n' in paragraphs into <br>
      breaks: false,
      // CSS language prefix for fenced blocks
      langPrefix: "language-",
      // autoconvert URL-like texts to links
      linkify: false,
      // Enable some language-neutral replacements + quotes beautification
      typographer: false,
      // Double + single quotes replacement pairs, when typographer enabled,
      // and smartquotes on. Could be either a String or an Array.
      // For example, you can use 'Â«Â»â€žâ€œ' for Russian, 'â€žâ€œâ€šâ€˜' for German,
      // and ['Â«\xA0', '\xA0Â»', 'â€¹\xA0', '\xA0â€º'] for French (including nbsp).
      quotes: "\u201c\u201d\u2018\u2019",
      /* â€œâ€â€˜â€™ */
      // Highlighter function. Should return escaped HTML,
      // or '' if the source string is not changed and should be escaped externaly.
      // If result starts with <pre... internal wrapper is skipped.
      // function (/*str, lang*/) { return ''; }
      highlight: null,
      // Internal protection, recursion limit
      maxNesting: 20
    },
    components: {
      core: {
        rules: [ "normalize", "block", "inline", "text_join" ]
      },
      block: {
        rules: [ "blockquote", "code", "fence", "heading", "hr", "html_block", "lheading", "list", "reference", "paragraph" ]
      },
      inline: {
        rules: [ "autolink", "backticks", "emphasis", "entity", "escape", "html_inline", "image", "link", "newline", "text" ],
        rules2: [ "balance_pairs", "emphasis", "fragments_join" ]
      }
    }
  };
  // Main parser class
    const config = {
    default: cfg_default,
    zero: cfg_zero,
    commonmark: cfg_commonmark
  };
  
  // This validator can prohibit more than really needed to prevent XSS. It's a
  // tradeoff to keep code simple and to be secure by default.
  
  // If you need different setup - override validator method as you wish. Or
  // replace it with dummy function and use external sanitizer.
  
    const BAD_PROTO_RE = /^(vbscript|javascript|file|data):/;
  const GOOD_DATA_RE = /^data:image\/(gif|png|jpeg|webp);/;
  function validateLink(url) {
    // url should be normalized at this point, and existing entities are decoded
    const str = url.trim().toLowerCase();
    return BAD_PROTO_RE.test(str) ? GOOD_DATA_RE.test(str) : true;
  }
  const RECODE_HOSTNAME_FOR = [ "http:", "https:", "mailto:" ];
  function normalizeLink(url) {
    const parsed = urlParse(url, true);
    if (parsed.hostname) {
      // Encode hostnames in urls like:
      // `http://host/`, `https://host/`, `mailto:user@host`, `//host/`
      // We don't encode unknown schemas, because it's likely that we encode
      // something we shouldn't (e.g. `skype:name` treated as `skype:host`)
      if (!parsed.protocol || RECODE_HOSTNAME_FOR.indexOf(parsed.protocol) >= 0) {
        try {
          parsed.hostname = punycode.toASCII(parsed.hostname);
        } catch (er) {}
      }
    }
    return encode$1(format(parsed));
  }
  function normalizeLinkText(url) {
    const parsed = urlParse(url, true);
    if (parsed.hostname) {
      // Encode hostnames in urls like:
      // `http://host/`, `https://host/`, `mailto:user@host`, `//host/`
      // We don't encode unknown schemas, because it's likely that we encode
      // something we shouldn't (e.g. `skype:name` treated as `skype:host`)
      if (!parsed.protocol || RECODE_HOSTNAME_FOR.indexOf(parsed.protocol) >= 0) {
        try {
          parsed.hostname = punycode.toUnicode(parsed.hostname);
        } catch (er) {}
      }
    }
    // add '%' to exclude list because of https://github.com/markdown-it/markdown-it/issues/720
        return decode$1(format(parsed), decode$1.defaultChars + "%");
  }
  /**
   * class MarkdownIt
   *
   * Main parser/renderer class.
   *
   * ##### Usage
   *
   * ```javascript
   * // node.js, "classic" way:
   * var MarkdownIt = require('markdown-it'),
   *     md = new MarkdownIt();
   * var result = md.render('# markdown-it rulezz!');
   *
   * // node.js, the same, but with sugar:
   * var md = require('markdown-it')();
   * var result = md.render('# markdown-it rulezz!');
   *
   * // browser without AMD, added to "window" on script load
   * // Note, there are no dash.
   * var md = window.markdownit();
   * var result = md.render('# markdown-it rulezz!');
   * ```
   *
   * Single line rendering, without paragraph wrap:
   *
   * ```javascript
   * var md = require('markdown-it')();
   * var result = md.renderInline('__markdown-it__ rulezz!');
   * ```
   **/
  /**
   * new MarkdownIt([presetName, options])
   * - presetName (String): optional, `commonmark` / `zero`
   * - options (Object)
   *
   * Creates parser instanse with given config. Can be called without `new`.
   *
   * ##### presetName
   *
   * MarkdownIt provides named presets as a convenience to quickly
   * enable/disable active syntax rules and options for common use cases.
   *
   * - ["commonmark"](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/commonmark.mjs) -
   *   configures parser to strict [CommonMark](http://commonmark.org/) mode.
   * - [default](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/default.mjs) -
   *   similar to GFM, used when no preset name given. Enables all available rules,
   *   but still without html, typographer & autolinker.
   * - ["zero"](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/zero.mjs) -
   *   all rules disabled. Useful to quickly setup your config via `.enable()`.
   *   For example, when you need only `bold` and `italic` markup and nothing else.
   *
   * ##### options:
   *
   * - __html__ - `false`. Set `true` to enable HTML tags in source. Be careful!
   *   That's not safe! You may need external sanitizer to protect output from XSS.
   *   It's better to extend features via plugins, instead of enabling HTML.
   * - __xhtmlOut__ - `false`. Set `true` to add '/' when closing single tags
   *   (`<br />`). This is needed only for full CommonMark compatibility. In real
   *   world you will need HTML output.
   * - __breaks__ - `false`. Set `true` to convert `\n` in paragraphs into `<br>`.
   * - __langPrefix__ - `language-`. CSS language class prefix for fenced blocks.
   *   Can be useful for external highlighters.
   * - __linkify__ - `false`. Set `true` to autoconvert URL-like text to links.
   * - __typographer__  - `false`. Set `true` to enable [some language-neutral
   *   replacement](https://github.com/markdown-it/markdown-it/blob/master/lib/rules_core/replacements.mjs) +
   *   quotes beautification (smartquotes).
   * - __quotes__ - `â€œâ€â€˜â€™`, String or Array. Double + single quotes replacement
   *   pairs, when typographer enabled and smartquotes on. For example, you can
   *   use `'Â«Â»â€žâ€œ'` for Russian, `'â€žâ€œâ€šâ€˜'` for German, and
   *   `['Â«\xA0', '\xA0Â»', 'â€¹\xA0', '\xA0â€º']` for French (including nbsp).
   * - __highlight__ - `null`. Highlighter function for fenced code blocks.
   *   Highlighter `function (str, lang)` should return escaped HTML. It can also
   *   return empty string if the source was not changed and should be escaped
   *   externaly. If result starts with <pre... internal wrapper is skipped.
   *
   * ##### Example
   *
   * ```javascript
   * // commonmark mode
   * var md = require('markdown-it')('commonmark');
   *
   * // default mode
   * var md = require('markdown-it')();
   *
   * // enable everything
   * var md = require('markdown-it')({
   *   html: true,
   *   linkify: true,
   *   typographer: true
   * });
   * ```
   *
   * ##### Syntax highlighting
   *
   * ```js
   * var hljs = require('highlight.js') // https://highlightjs.org/
   *
   * var md = require('markdown-it')({
   *   highlight: function (str, lang) {
   *     if (lang && hljs.getLanguage(lang)) {
   *       try {
   *         return hljs.highlight(str, { language: lang, ignoreIllegals: true }).value;
   *       } catch (__) {}
   *     }
   *
   *     return ''; // use external default escaping
   *   }
   * });
   * ```
   *
   * Or with full wrapper override (if you need assign class to `<pre>` or `<code>`):
   *
   * ```javascript
   * var hljs = require('highlight.js') // https://highlightjs.org/
   *
   * // Actual default values
   * var md = require('markdown-it')({
   *   highlight: function (str, lang) {
   *     if (lang && hljs.getLanguage(lang)) {
   *       try {
   *         return '<pre><code class="hljs">' +
   *                hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
   *                '</code></pre>';
   *       } catch (__) {}
   *     }
   *
   *     return '<pre><code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre>';
   *   }
   * });
   * ```
   *
   **/  function MarkdownIt(presetName, options) {
    if (!(this instanceof MarkdownIt)) {
      return new MarkdownIt(presetName, options);
    }
    if (!options) {
      if (!isString$1(presetName)) {
        options = presetName || {};
        presetName = "default";
      }
    }
    /**
     * MarkdownIt#inline -> ParserInline
     *
     * Instance of [[ParserInline]]. You may need it to add new rules when
     * writing plugins. For simple rules control use [[MarkdownIt.disable]] and
     * [[MarkdownIt.enable]].
     **/    this.inline = new ParserInline;
    /**
     * MarkdownIt#block -> ParserBlock
     *
     * Instance of [[ParserBlock]]. You may need it to add new rules when
     * writing plugins. For simple rules control use [[MarkdownIt.disable]] and
     * [[MarkdownIt.enable]].
     **/    this.block = new ParserBlock;
    /**
     * MarkdownIt#core -> Core
     *
     * Instance of [[Core]] chain executor. You may need it to add new rules when
     * writing plugins. For simple rules control use [[MarkdownIt.disable]] and
     * [[MarkdownIt.enable]].
     **/    this.core = new Core;
    /**
     * MarkdownIt#renderer -> Renderer
     *
     * Instance of [[Renderer]]. Use it to modify output look. Or to add rendering
     * rules for new token types, generated by plugins.
     *
     * ##### Example
     *
     * ```javascript
     * var md = require('markdown-it')();
     *
     * function myToken(tokens, idx, options, env, self) {
     *   //...
     *   return result;
     * };
     *
     * md.renderer.rules['my_token'] = myToken
     * ```
     *
     * See [[Renderer]] docs and [source code](https://github.com/markdown-it/markdown-it/blob/master/lib/renderer.mjs).
     **/    this.renderer = new Renderer;
    /**
     * MarkdownIt#linkify -> LinkifyIt
     *
     * [linkify-it](https://github.com/markdown-it/linkify-it) instance.
     * Used by [linkify](https://github.com/markdown-it/markdown-it/blob/master/lib/rules_core/linkify.mjs)
     * rule.
     **/    this.linkify = new LinkifyIt;
    /**
     * MarkdownIt#validateLink(url) -> Boolean
     *
     * Link validation function. CommonMark allows too much in links. By default
     * we disable `javascript:`, `vbscript:`, `file:` schemas, and almost all `data:...` schemas
     * except some embedded image types.
     *
     * You can change this behaviour:
     *
     * ```javascript
     * var md = require('markdown-it')();
     * // enable everything
     * md.validateLink = function () { return true; }
     * ```
     **/    this.validateLink = validateLink;
    /**
     * MarkdownIt#normalizeLink(url) -> String
     *
     * Function used to encode link url to a machine-readable format,
     * which includes url-encoding, punycode, etc.
     **/    this.normalizeLink = normalizeLink;
    /**
     * MarkdownIt#normalizeLinkText(url) -> String
     *
     * Function used to decode link url to a human-readable format`
     **/    this.normalizeLinkText = normalizeLinkText;
    // Expose utils & helpers for easy acces from plugins
    /**
     * MarkdownIt#utils -> utils
     *
     * Assorted utility functions, useful to write plugins. See details
     * [here](https://github.com/markdown-it/markdown-it/blob/master/lib/common/utils.mjs).
     **/    this.utils = utils;
    /**
     * MarkdownIt#helpers -> helpers
     *
     * Link components parser functions, useful to write plugins. See details
     * [here](https://github.com/markdown-it/markdown-it/blob/master/lib/helpers).
     **/    this.helpers = assign$1({}, helpers);
    this.options = {};
    this.configure(presetName);
    if (options) {
      this.set(options);
    }
  }
  /** chainable
   * MarkdownIt.set(options)
   *
   * Set parser options (in the same format as in constructor). Probably, you
   * will never need it, but you can change options after constructor call.
   *
   * ##### Example
   *
   * ```javascript
   * var md = require('markdown-it')()
   *             .set({ html: true, breaks: true })
   *             .set({ typographer, true });
   * ```
   *
   * __Note:__ To achieve the best possible performance, don't modify a
   * `markdown-it` instance options on the fly. If you need multiple configurations
   * it's best to create multiple instances and initialize each with separate
   * config.
   **/  MarkdownIt.prototype.set = function(options) {
    assign$1(this.options, options);
    return this;
  };
  /** chainable, internal
   * MarkdownIt.configure(presets)
   *
   * Batch load of all options and compenent settings. This is internal method,
   * and you probably will not need it. But if you will - see available presets
   * and data structure [here](https://github.com/markdown-it/markdown-it/tree/master/lib/presets)
   *
   * We strongly recommend to use presets instead of direct config loads. That
   * will give better compatibility with next versions.
   **/  MarkdownIt.prototype.configure = function(presets) {
    const self = this;
    if (isString$1(presets)) {
      const presetName = presets;
      presets = config[presetName];
      if (!presets) {
        throw new Error('Wrong `markdown-it` preset "' + presetName + '", check name');
      }
    }
    if (!presets) {
      throw new Error("Wrong `markdown-it` preset, can't be empty");
    }
    if (presets.options) {
      self.set(presets.options);
    }
    if (presets.components) {
      Object.keys(presets.components).forEach((function(name) {
        if (presets.components[name].rules) {
          self[name].ruler.enableOnly(presets.components[name].rules);
        }
        if (presets.components[name].rules2) {
          self[name].ruler2.enableOnly(presets.components[name].rules2);
        }
      }));
    }
    return this;
  };
  /** chainable
   * MarkdownIt.enable(list, ignoreInvalid)
   * - list (String|Array): rule name or list of rule names to enable
   * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
   *
   * Enable list or rules. It will automatically find appropriate components,
   * containing rules with given names. If rule not found, and `ignoreInvalid`
   * not set - throws exception.
   *
   * ##### Example
   *
   * ```javascript
   * var md = require('markdown-it')()
   *             .enable(['sub', 'sup'])
   *             .disable('smartquotes');
   * ```
   **/  MarkdownIt.prototype.enable = function(list, ignoreInvalid) {
    let result = [];
    if (!Array.isArray(list)) {
      list = [ list ];
    }
    [ "core", "block", "inline" ].forEach((function(chain) {
      result = result.concat(this[chain].ruler.enable(list, true));
    }), this);
    result = result.concat(this.inline.ruler2.enable(list, true));
    const missed = list.filter((function(name) {
      return result.indexOf(name) < 0;
    }));
    if (missed.length && !ignoreInvalid) {
      throw new Error("MarkdownIt. Failed to enable unknown rule(s): " + missed);
    }
    return this;
  };
  /** chainable
   * MarkdownIt.disable(list, ignoreInvalid)
   * - list (String|Array): rule name or list of rule names to disable.
   * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
   *
   * The same as [[MarkdownIt.enable]], but turn specified rules off.
   **/  MarkdownIt.prototype.disable = function(list, ignoreInvalid) {
    let result = [];
    if (!Array.isArray(list)) {
      list = [ list ];
    }
    [ "core", "block", "inline" ].forEach((function(chain) {
      result = result.concat(this[chain].ruler.disable(list, true));
    }), this);
    result = result.concat(this.inline.ruler2.disable(list, true));
    const missed = list.filter((function(name) {
      return result.indexOf(name) < 0;
    }));
    if (missed.length && !ignoreInvalid) {
      throw new Error("MarkdownIt. Failed to disable unknown rule(s): " + missed);
    }
    return this;
  };
  /** chainable
   * MarkdownIt.use(plugin, params)
   *
   * Load specified plugin with given params into current parser instance.
   * It's just a sugar to call `plugin(md, params)` with curring.
   *
   * ##### Example
   *
   * ```javascript
   * var iterator = require('markdown-it-for-inline');
   * var md = require('markdown-it')()
   *             .use(iterator, 'foo_replace', 'text', function (tokens, idx) {
   *               tokens[idx].content = tokens[idx].content.replace(/foo/g, 'bar');
   *             });
   * ```
   **/  MarkdownIt.prototype.use = function(plugin /*, params, ... */) {
    const args = [ this ].concat(Array.prototype.slice.call(arguments, 1));
    plugin.apply(plugin, args);
    return this;
  };
  /** internal
   * MarkdownIt.parse(src, env) -> Array
   * - src (String): source string
   * - env (Object): environment sandbox
   *
   * Parse input string and return list of block tokens (special token type
   * "inline" will contain list of inline tokens). You should not call this
   * method directly, until you write custom renderer (for example, to produce
   * AST).
   *
   * `env` is used to pass data between "distributed" rules and return additional
   * metadata like reference info, needed for the renderer. It also can be used to
   * inject data in specific cases. Usually, you will be ok to pass `{}`,
   * and then pass updated object to renderer.
   **/  MarkdownIt.prototype.parse = function(src, env) {
    if (typeof src !== "string") {
      throw new Error("Input data should be a String");
    }
    const state = new this.core.State(src, this, env);
    this.core.process(state);
    return state.tokens;
  };
  /**
   * MarkdownIt.render(src [, env]) -> String
   * - src (String): source string
   * - env (Object): environment sandbox
   *
   * Render markdown string into html. It does all magic for you :).
   *
   * `env` can be used to inject additional metadata (`{}` by default).
   * But you will not need it with high probability. See also comment
   * in [[MarkdownIt.parse]].
   **/  MarkdownIt.prototype.render = function(src, env) {
    env = env || {};
    return this.renderer.render(this.parse(src, env), this.options, env);
  };
  /** internal
   * MarkdownIt.parseInline(src, env) -> Array
   * - src (String): source string
   * - env (Object): environment sandbox
   *
   * The same as [[MarkdownIt.parse]] but skip all block rules. It returns the
   * block tokens list with the single `inline` element, containing parsed inline
   * tokens in `children` property. Also updates `env` object.
   **/  MarkdownIt.prototype.parseInline = function(src, env) {
    const state = new this.core.State(src, this, env);
    state.inlineMode = true;
    this.core.process(state);
    return state.tokens;
  };
  /**
   * MarkdownIt.renderInline(src [, env]) -> String
   * - src (String): source string
   * - env (Object): environment sandbox
   *
   * Similar to [[MarkdownIt.render]] but for single paragraph content. Result
   * will NOT be wrapped into `<p>` tags.
   **/  MarkdownIt.prototype.renderInline = function(src, env) {
    env = env || {};
    return this.renderer.render(this.parseInline(src, env), this.options, env);
  };
  return MarkdownIt;
}));

```


