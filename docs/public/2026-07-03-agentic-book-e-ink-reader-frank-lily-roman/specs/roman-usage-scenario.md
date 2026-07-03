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




