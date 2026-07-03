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




