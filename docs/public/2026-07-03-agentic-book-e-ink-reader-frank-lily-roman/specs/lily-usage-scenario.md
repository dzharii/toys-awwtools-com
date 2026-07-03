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




