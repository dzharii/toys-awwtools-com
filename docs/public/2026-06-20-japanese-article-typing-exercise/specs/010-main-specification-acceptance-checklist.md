Acceptance criteria for the coding agent: implement the application according to `010-main-specification.md`, then verify every checklist item below before considering the work complete. This list intentionally covers the specification in a micromanagement style so the agent can validate feature coverage, state behavior, UI behavior, and non-goals without relying on unstated assumptions. 

## 1. Project mission and product scope

* [ ] Implement the app as a focused Japanese typing and writing guidance app.

  * [ ] Validate that the app helps the learner rewrite a Japanese article from the screen.
  * [ ] Validate that the app guides the learner sentence by sentence and token by token.
  * [ ] Validate that the app does not behave like a general document editor.
  * [ ] Validate that the app does not behave like a gamified typing game.
  * [ ] Validate that the app does not behave like a course dashboard.

* [ ] Implement the primary experience as one active article at a time.

  * [ ] Validate that only one current article is loaded.
  * [ ] Validate that importing a new article replaces the previous article after confirmation.
  * [ ] Validate that the app does not implement a multi-article library.
  * [ ] Validate that the app does not use accounts, cloud sync, or long-term article history.

* [ ] Implement the app as a static browser application.

  * [ ] Validate that the app works without a build step.
  * [ ] Validate that the app uses normal browser technologies: HTML, CSS, and JavaScript.
  * [ ] Validate that no framework or external runtime is required unless already present in the project.
  * [ ] Validate that core app code is understandable and maintainable.

## 2. Visual design foundation

* [ ] Implement the e-ink editorial Zen visual direction.

  * [ ] Validate that the default theme uses warm off-white or light paper-like background.
  * [ ] Validate that the app uses near-black ink text.
  * [ ] Validate that secondary text uses muted gray.
  * [ ] Validate that accents use muted olive, soft gray, or similar restrained tones.
  * [ ] Validate that the interface avoids bright gamified colors in the default theme.
  * [ ] Validate that the interface avoids heavy dashboards, badges, streaks, or noisy panels.

* [ ] Implement the mandatory visual layout direction.

  * [ ] Validate that the implementation uses `specs/010-main-specification.assets/image-20260620150729224.png` as the main visual reference.
  * [ ] Validate that `specs/010-main-specification.assets/muckup-sample.html` is treated as an implementation aid, not as a strict final implementation.
  * [ ] Validate that the final UI is more production-ready than the mockup sample.
  * [ ] Validate that the app uses the combined design direction: Design 8 as the main foundation and Design 4 for the article illustration concept.

* [ ] Ensure Zen mode has no persistent sidebar.

  * [ ] Validate that there is no left navigation sidebar in practice mode.
  * [ ] Validate that the article image column is not used as navigation.
  * [ ] Validate that the hamburger menu is temporary, not a permanent sidebar.

## 3. Empty state and first-use experience

* [ ] Implement the empty state for first open with no saved article.

  * [ ] Validate that the empty state appears only when no valid article exists in localStorage.
  * [ ] Validate that the empty state does not look broken or blank.
  * [ ] Validate that the empty state explains the purpose of the app.
  * [ ] Validate that the empty state tells the user they practice by rewriting an article from the screen.
  * [ ] Validate that the empty state tells the user to upload or drop an article file.

* [ ] Use the required empty-state message intent.

  * [ ] Validate that the page includes a title similar to `Japanese Writing Practice`.
  * [ ] Validate that the page explains: `Practice Japanese by rewriting an article from the screen.`
  * [ ] Validate that the page explains that the learner follows the highlighted sentence and types each word with romaji.
  * [ ] Validate that the page explains that the app shows small hints and helps the learner notice words while writing.

* [ ] Implement the primary empty-state action.

  * [ ] Validate that the primary button label is `Upload Article`.
  * [ ] Validate that `Upload Article` opens the file picker.
  * [ ] Validate that the empty state accepts drag-and-drop.
  * [ ] Validate that drag-over in the empty state shows a clear drop target.
  * [ ] Validate that the empty-state drop overlay says something equivalent to `Drop article to begin`.

## 4. Lesson document parsing

* [ ] Parse the lesson format as HTML-compatible custom elements.

  * [ ] Validate that `jp-lesson` is recognized as the lesson root.
  * [ ] Validate that `jp-section` elements are parsed.
  * [ ] Validate that `jp-sentence` elements are parsed.
  * [ ] Validate that `jp-token` elements are parsed in order.
  * [ ] Validate that the app does not depend on raw text nodes for typing order.
  * [ ] Validate that sentence text is rendered from token order.

* [ ] Validate minimum document requirements.

  * [ ] Validate that a lesson must have a lesson root.
  * [ ] Validate that a lesson must have at least one sentence.
  * [ ] Validate that a lesson must have at least one token.
  * [ ] Validate that typed tokens must have romaji or valid aliases.
  * [ ] Validate that punctuation tokens may omit romaji.
  * [ ] Validate that invalid documents are rejected without corrupting current state.

* [ ] Parse token metadata.

  * [ ] Validate that token `id` is read.
  * [ ] Validate that token `text` is read.
  * [ ] Validate that token `reading` is read when present.
  * [ ] Validate that token `romaji` is read when present.
  * [ ] Validate that token `aliases` is read and split into accepted alternatives.
  * [ ] Validate that token `meaning` is read when present.
  * [ ] Validate that token `type` is read.
  * [ ] Validate that token `delay` is read.
  * [ ] Validate that token `delay-ms` or equivalent exact delay override is read.

* [ ] Preserve word and phrase tokenization.

  * [ ] Validate that tokens are treated as author-defined units.
  * [ ] Validate that Japanese text is not split by character unless the lesson explicitly provides character tokens.
  * [ ] Validate that words such as `日本` and `映画館` can be treated as single tokens.
  * [ ] Validate that phrase tokens can be supported.

## 5. Article image system

* [ ] Parse image references in article body.

  * [ ] Validate that `jp-image-ref` elements are recognized.
  * [ ] Validate that `jp-image-ref` can reference an image by ID.
  * [ ] Validate that `placement` is read.
  * [ ] Validate that `scope` is read.
  * [ ] Validate that references remain lightweight in the article body.

* [ ] Parse image assets from the bottom asset section.

  * [ ] Validate that `jp-assets` is parsed.
  * [ ] Validate that `jp-image` is parsed.
  * [ ] Validate that base64 data URLs in `data` attributes are supported.
  * [ ] Validate that nested `jp-image-data` is supported.
  * [ ] Validate that both image forms normalize into the same internal asset model.
  * [ ] Validate that the parser does not require image data inside the article body.

* [ ] Render anchored images.

  * [ ] Validate that desktop renders the current relevant image in the left article image column.
  * [ ] Validate that the image column aligns with the related section, paragraph, sentence, or token scope.
  * [ ] Validate that mobile renders the current relevant image as a compact banner or card near the related text.
  * [ ] Validate that missing or invalid images do not show a broken image icon in Zen mode.
  * [ ] Validate that missing images do not block text practice.
  * [ ] Validate that multiple image anchors do not stack unrelated large images together.
  * [ ] Validate that the closest relevant image to the active sentence wins when multiple anchors are nearby.

## 6. Main practice layout

* [ ] Implement the three-zone article display.

  * [ ] Validate that the previous sentence zone exists.
  * [ ] Validate that the active sentence zone exists.
  * [ ] Validate that the remaining text zone exists.
  * [ ] Validate that only one previous sentence is shown.
  * [ ] Validate that the active sentence is magnified and visually dominant.
  * [ ] Validate that the remaining text is shown below in normal size.
  * [ ] Validate that the active sentence is not duplicated in the remaining text.
  * [ ] Validate that the previous sentence is not duplicated in the remaining text.

* [ ] Implement first sentence behavior.

  * [ ] Validate that when the first sentence is active, there is no fake previous sentence.
  * [ ] Validate that the previous sentence zone is either hidden or empty in a calm way.
  * [ ] Validate that the remaining text begins after the active sentence.

* [ ] Implement sentence advancement.

  * [ ] Validate that completing the final token of a sentence advances to the next sentence.
  * [ ] Validate that the completed sentence becomes the previous sentence.
  * [ ] Validate that the next sentence becomes the active magnified sentence.
  * [ ] Validate that the remaining text recalculates after the sentence transition.
  * [ ] Validate that the transition does not behave like a full page reload.

* [ ] Implement final sentence behavior.

  * [ ] Validate that the final sentence can become the active sentence.
  * [ ] Validate that the previous sentence zone still shows the sentence before the final sentence.
  * [ ] Validate that the remaining text zone may be empty.
  * [ ] Validate that completing the final sentence opens or transitions to the session report.
  * [ ] Validate that the app does not advance into a fake blank sentence.

## 7. Active token and caret behavior

* [ ] Implement the active token caret frame.

  * [ ] Validate that the active token is inside a thin rectangular frame.
  * [ ] Validate that the frame is calm and visually consistent with the theme.
  * [ ] Validate that the frame does not use bright default colors in the Light theme.
  * [ ] Validate that the active token remains readable.

* [ ] Attach romaji and meaning to the active token.

  * [ ] Validate that romaji appears close above the active token.
  * [ ] Validate that meaning appears close below the active token.
  * [ ] Validate that romaji and meaning are positioned relative to the token, not the whole sentence container.
  * [ ] Validate that romaji and meaning do not drift to the bottom of the active sentence card.
  * [ ] Validate that romaji and meaning remain attached when the active sentence wraps.
  * [ ] Validate that romaji and meaning remain attached on desktop and mobile.

* [ ] Implement caret movement.

  * [ ] Validate that the caret moves to the next token after accepted input.
  * [ ] Validate that caret movement uses a short smooth animation.
  * [ ] Validate that the animation is approximately in the 100 to 180 ms range or a similar short value.
  * [ ] Validate that the caret does not jump harshly.
  * [ ] Validate that delay expiration alone does not force the caret to move.
  * [ ] Validate that the caret remains active until the token is typed, skipped, or manually changed.

## 8. Romaji input validation

* [ ] Implement romaji validation for MVP.

  * [ ] Validate that the learner types Latin letters.
  * [ ] Validate that input is compared to the active token's `romaji`.
  * [ ] Validate that accepted aliases are recognized.
  * [ ] Validate that the exact typed input is recorded.
  * [ ] Validate that incorrect input is handled quietly.

* [ ] Support required common aliases.

  * [ ] Validate that `し` can accept `shi` and `si`.
  * [ ] Validate that `ち` can accept `chi` and `ti`.
  * [ ] Validate that `つ` can accept `tsu` and `tu`.
  * [ ] Validate that `ふ` can accept `fu` and `hu`.
  * [ ] Validate that `じ` can accept `ji` and `zi`.
  * [ ] Validate that `を` can accept `wo` and `o`.
  * [ ] Validate that `ん` can accept `n`, `nn`, and `n'`.

* [ ] Handle punctuation.

  * [ ] Validate that punctuation tokens can exist without romaji.
  * [ ] Validate that punctuation practice can be disabled.
  * [ ] Validate that when punctuation practice is disabled, punctuation does not block the learner.
  * [ ] Validate that when punctuation practice is enabled, punctuation can be required.

## 9. Delay and timing model

* [ ] Implement delay values.

  * [ ] Validate support for `short`.
  * [ ] Validate support for `medium`.
  * [ ] Validate support for `long`.
  * [ ] Validate support for exact millisecond overrides.
  * [ ] Validate that exact millisecond override wins over named delay.

* [ ] Implement default delay values.

  * [ ] Validate that `short` defaults to about 700 ms.
  * [ ] Validate that `medium` defaults to about 1400 ms.
  * [ ] Validate that `long` defaults to about 2600 ms.
  * [ ] Validate that settings can adjust delay presets without modifying the lesson file.

* [ ] Implement timing statistics.

  * [ ] Validate that token elapsed time is recorded.
  * [ ] Validate that expected resolved delay is available for comparison.
  * [ ] Validate that slow tokens can be identified when elapsed time exceeds expected delay.
  * [ ] Validate that paused time is excluded from active typing time.

## 10. Header and session status

* [ ] Implement header identity.

  * [ ] Validate that the article title appears in the header.
  * [ ] Validate that a subtitle such as `Zen タイピング` or lesson mode appears.
  * [ ] Validate that any icon or logo is restrained and decorative only.

* [ ] Implement session status.

  * [ ] Validate that progress percent appears.
  * [ ] Validate that a thin progress bar appears.
  * [ ] Validate that elapsed active time appears.
  * [ ] Validate that character count appears when there is enough room.
  * [ ] Validate that character count can hide on small mobile widths.
  * [ ] Validate that WPM, streaks, badges, and dashboard-style metrics are not shown in Zen mode by default.

* [ ] Implement audio button visibility.

  * [ ] Validate that the audio button appears only when text-to-speech is supported and a Japanese voice is available.
  * [ ] Validate that no dead or disabled audio button appears in the main practice interface when Japanese speech is unavailable.

## 11. Desktop layout

* [ ] Implement desktop two-column layout.

  * [ ] Validate that desktop uses an image column and a reading column.
  * [ ] Validate that the image column is about 25 to 30 percent of the content area.
  * [ ] Validate that the reading column is about 70 to 75 percent of the content area.
  * [ ] Validate that the image column is not a menu.
  * [ ] Validate that the reading column contains previous sentence, active sentence, and remaining text.

* [ ] Implement bottom controls on desktop.

  * [ ] Validate that Previous, Pause, and Next are visible.
  * [ ] Validate that controls are quiet outlined buttons.
  * [ ] Validate that controls do not look like a dashboard.
  * [ ] Validate that the controls do not crowd the article.

## 12. Mobile layout

* [ ] Implement mobile single-column layout.

  * [ ] Validate that mobile uses one column.
  * [ ] Validate that mobile order is header, status, image, previous sentence, active sentence, remaining text, bottom controls.
  * [ ] Validate that the article image appears as a compact banner or card.
  * [ ] Validate that the article image does not dominate the screen.
  * [ ] Validate that the active sentence remains the main focus.

* [ ] Implement mobile responsiveness.

  * [ ] Validate that layout collapses under about 900 px.
  * [ ] Validate that nonessential status details can hide under about 520 px.
  * [ ] Validate that active sentence wraps naturally.
  * [ ] Validate that token hints remain attached when wrapping.
  * [ ] Validate that mobile tap targets are at least about 44 px high.
  * [ ] Validate that bottom controls do not cover important text.
  * [ ] Validate that content has enough bottom padding when bottom controls are fixed or sticky.
  * [ ] Validate that the hamburger menu opens as an overlay or sheet, not a sidebar.

## 13. Practice controls and keyboard behavior

* [ ] Implement visible controls.

  * [ ] Validate that Previous is labeled `← 前へ`.
  * [ ] Validate that Pause is labeled `一時停止`.
  * [ ] Validate that Next is labeled `次へ →`.
  * [ ] Validate that Previous moves backward through the practice target.
  * [ ] Validate that Next moves forward through the practice target.
  * [ ] Validate that Pause pauses timing and input tracking.

* [ ] Implement keyboard controls.

  * [ ] Validate that ArrowLeft moves to the previous token.
  * [ ] Validate that ArrowRight moves to the next token.
  * [ ] Validate that Shift + ArrowLeft moves to the previous sentence.
  * [ ] Validate that Shift + ArrowRight moves to the next sentence.
  * [ ] Validate that P pauses or resumes.
  * [ ] Validate that Escape opens the minimal menu or pause/menu flow.
  * [ ] Validate that Enter confirms current input when needed.
  * [ ] Validate that Backspace edits current typed input.
  * [ ] Validate that Space is not required as the primary pause key.

* [ ] Implement manual navigation state updates.

  * [ ] Validate that moving backward recalculates previous, active, and remaining text.
  * [ ] Validate that moving forward recalculates previous, active, and remaining text.
  * [ ] Validate that manual movement resets the active token timing after a short settle period.
  * [ ] Validate that manual movement does not count as a typing mistake.

## 14. Pause, resume, restart, and reset

* [ ] Implement pause and resume.

  * [ ] Validate that Pause stops active typing time.
  * [ ] Validate that Pause does not clear current input.
  * [ ] Validate that Pause keeps the active article, sentence, and token visible.
  * [ ] Validate that Resume returns to the same article, sentence, token, typed input, and scroll position.
  * [ ] Validate that pause state is saved to localStorage.

* [ ] Implement Restart Sentence.

  * [ ] Validate that Restart Sentence is present in the hamburger menu.
  * [ ] Validate that Restart Sentence does not require confirmation.
  * [ ] Validate that it keeps the current article.
  * [ ] Validate that it keeps the current active sentence.
  * [ ] Validate that it resets the current sentence token position to the first token.
  * [ ] Validate that it clears typed input for the current sentence attempt.
  * [ ] Validate that it does not clear progress from earlier completed sentences.

* [ ] Implement Reset Current Article Progress.

  * [ ] Validate that Reset Current Article Progress is present in the hamburger menu.
  * [ ] Validate that it opens a custom confirmation.
  * [ ] Validate that confirmation text explains that the current article is kept but progress is cleared.
  * [ ] Validate that Cancel keeps progress unchanged.
  * [ ] Validate that Reset Progress returns to the first sentence.
  * [ ] Validate that Reset Progress clears typed input.
  * [ ] Validate that Reset Progress clears current session statistics.
  * [ ] Validate that Reset Progress resets the timer.
  * [ ] Validate that Reset Progress writes reset state to localStorage.
  * [ ] Validate that Reset Progress does not remove the current article source.

## 15. localStorage recovery

* [ ] Implement single-article localStorage recovery.

  * [ ] Validate that IndexedDB is not used in this version.
  * [ ] Validate that the app saves only the latest active article.
  * [ ] Validate that the app does not retain multiple article histories.
  * [ ] Validate that replacing an article overwrites the stored article and article-specific state.

* [ ] Save required localStorage data.

  * [ ] Validate that `jpTyping.currentArticleSource` is saved.
  * [ ] Validate that `jpTyping.currentArticleHash` or equivalent fingerprint is saved.
  * [ ] Validate that `jpTyping.currentState` is saved.
  * [ ] Validate that `jpTyping.currentStats` is saved.
  * [ ] Validate that `jpTyping.currentSettings` is saved.
  * [ ] Validate that `jpTyping.currentTypedInput` is saved when applicable.

* [ ] Restore required state.

  * [ ] Validate that a valid saved article restores automatically.
  * [ ] Validate that active sentence index restores.
  * [ ] Validate that active token index restores.
  * [ ] Validate that typed input restores.
  * [ ] Validate that pause state restores.
  * [ ] Validate that statistics restore.
  * [ ] Validate that settings restore.
  * [ ] Validate that an invalid saved article does not crash the app.
  * [ ] Validate that invalid saved state leads to a calm recovery path.

## 16. Article import

* [ ] Implement all import entry points.

  * [ ] Validate that Upload Article exists in the empty state.
  * [ ] Validate that Import Article exists in the hamburger menu.
  * [ ] Validate that drag-and-drop works in the empty state.
  * [ ] Validate that drag-and-drop works in the active practice screen.
  * [ ] Validate that all import paths use the same import pipeline.

* [ ] Implement upload sheet.

  * [ ] Validate that Import Article opens a calm upload sheet.
  * [ ] Validate that the upload sheet includes a Choose File action.
  * [ ] Validate that the upload sheet supports drop.
  * [ ] Validate that the upload sheet explains that the app validates the article before replacement.
  * [ ] Validate that the upload sheet itself does not erase progress.

* [ ] Implement drop overlay.

  * [ ] Validate that dragging a file over the app shows a full-window overlay.
  * [ ] Validate that empty-state overlay says `Drop article to begin` or equivalent.
  * [ ] Validate that practice-state overlay says the drop will replace the current article after confirmation.
  * [ ] Validate that the overlay disappears when drag leaves or drop completes.
  * [ ] Validate that dropping a file creates a temporary import buffer before replacement.

* [ ] Implement replacement confirmation.

  * [ ] Validate that replacing an existing article always uses a custom confirmation.
  * [ ] Validate that confirmation does not use `confirm()`.
  * [ ] Validate that confirmation text explains current progress will be erased.
  * [ ] Validate that Cancel discards the temporary imported file.
  * [ ] Validate that Replace Article clears current article-specific state.
  * [ ] Validate that Replace Article loads the new article.
  * [ ] Validate that Replace Article saves new state to localStorage.
  * [ ] Validate that global settings are preserved across replacement.

## 17. Hamburger menu

* [ ] Implement hamburger menu as temporary UI.

  * [ ] Validate that the menu opens as a popover, modal, or sheet.
  * [ ] Validate that the menu is not a sidebar.
  * [ ] Validate that it is compact on desktop.
  * [ ] Validate that it is a bottom sheet or centered sheet on mobile.
  * [ ] Validate that the practice timer pauses while the menu or dialog is open.
  * [ ] Validate that typing input is ignored while the menu is open.
  * [ ] Validate that closing the menu restores the same sentence, token, typed input, and scroll position.

* [ ] Include required menu items.

  * [ ] Validate that Resume exists.
  * [ ] Validate that Restart Sentence exists.
  * [ ] Validate that Reset Current Article Progress exists.
  * [ ] Validate that Import Article exists.
  * [ ] Validate that Export / Share with Tango exists.
  * [ ] Validate that Font Size inline control exists.
  * [ ] Validate that Theme inline control exists.
  * [ ] Validate that Session Report exists.
  * [ ] Validate that Settings exists.
  * [ ] Validate that Exit Practice does not exist.

## 18. Font size control

* [ ] Implement Font Size as inline menu control.

  * [ ] Validate that Font Size does not open a separate dialog.
  * [ ] Validate that the row includes a minus button.
  * [ ] Validate that the row includes a dropdown.
  * [ ] Validate that the row includes a plus button.
  * [ ] Validate that supported values include Small, Normal, Large, and Extra Large.
  * [ ] Validate that minus moves to the previous smaller value.
  * [ ] Validate that plus moves to the next larger value.
  * [ ] Validate that minus is disabled at Small.
  * [ ] Validate that plus is disabled at Extra Large.
  * [ ] Validate that dropdown changes apply immediately.
  * [ ] Validate that font size is saved to localStorage.

* [ ] Apply font size consistently.

  * [ ] Validate that previous sentence changes size proportionally.
  * [ ] Validate that active sentence changes size proportionally.
  * [ ] Validate that remaining text changes size proportionally.
  * [ ] Validate that romaji hints change size proportionally.
  * [ ] Validate that meaning hints change size proportionally.
  * [ ] Validate that active token alignment is not broken after changing font size.

## 19. Theme control

* [ ] Implement Theme as inline menu control.

  * [ ] Validate that Theme does not open a separate dialog.
  * [ ] Validate that Theme uses a dropdown.
  * [ ] Validate that supported MVP values are Light and Dark.
  * [ ] Validate that Light is the default.
  * [ ] Validate that theme changes apply immediately.
  * [ ] Validate that selected theme is saved to localStorage.

* [ ] Implement Dark theme correctly.

  * [ ] Validate that Dark theme preserves the same layout.
  * [ ] Validate that Dark theme preserves the same sentence flow.
  * [ ] Validate that Dark theme preserves the same typography hierarchy.
  * [ ] Validate that Dark theme preserves token and caret behavior.
  * [ ] Validate that Dark theme does not become neon or gamified.

## 20. Export / Share with Tango

* [ ] Implement menu action.

  * [ ] Validate that the menu item is labeled `Export / Share with Tango`.
  * [ ] Validate that it opens a custom export dialog.
  * [ ] Validate that it does not export automatically on menu click.
  * [ ] Validate that the action is available in the MVP.

* [ ] Export correct content.

  * [ ] Validate that exported content is plain Japanese article text.
  * [ ] Validate that exported content is in sentence order.
  * [ ] Validate that exported content includes useful line breaks.
  * [ ] Validate that exported content does not include token metadata.
  * [ ] Validate that exported content does not include romaji.
  * [ ] Validate that exported content does not include meanings.
  * [ ] Validate that exported content does not include images or image base64.
  * [ ] Validate that exported content does not include settings.
  * [ ] Validate that exported content does not include progress or caret position.
  * [ ] Validate that exported content does not include the previous/current/remaining UI split.

* [ ] Build Tango URL correctly.

  * [ ] Validate that the URL starts with `https://tango-japanese.app/mine`.
  * [ ] Validate that the URL hash contains `import-japanese-text`.
  * [ ] Validate that the payload format is `BASE64`.
  * [ ] Validate that the article text is UTF-8 encoded before base64 conversion.
  * [ ] Validate that Japanese text is not passed directly to `btoa()`.
  * [ ] Validate that line endings are normalized to `\n` before encoding.
  * [ ] Validate that the URL ends with `]]];`.

* [ ] Implement export dialog actions.

  * [ ] Validate that Cancel closes the dialog without state changes.
  * [ ] Validate that Copy URL copies the generated URL.
  * [ ] Validate that clipboard failure exposes a read-only URL field.
  * [ ] Validate that Open Tango opens a new tab with `noopener,noreferrer`.
  * [ ] Validate that Open Tango does not replace the practice tab.
  * [ ] Validate that the current session remains saved and unchanged after export.

## 21. Session report

* [ ] Implement report entry points.

  * [ ] Validate that Session Report exists in the hamburger menu.
  * [ ] Validate that the report opens automatically after the final sentence is completed.
  * [ ] Validate that the report can open during practice with current progress so far.
  * [ ] Validate that the report can open after completion with final session data.

* [ ] Implement report as dialog or sheet.

  * [ ] Validate that desktop uses a centered paper-like modal.
  * [ ] Validate that mobile uses a sheet or modal appropriate for the screen.
  * [ ] Validate that the report is not a permanent page.
  * [ ] Validate that the report matches the calm Zen visual style.
  * [ ] Validate that the report does not feel like a game score.

* [ ] Include required report content.

  * [ ] Validate that active typing time is shown.
  * [ ] Validate that progress is shown.
  * [ ] Validate that completed token count is shown.
  * [ ] Validate that accuracy is shown.
  * [ ] Validate that slow tokens are shown.
  * [ ] Validate that missed tokens are shown.
  * [ ] Validate that skipped tokens are shown.
  * [ ] Validate that review candidates or hard-word candidates are shown.
  * [ ] Validate that hard-word candidates are based on performance, not subjective difficulty.

* [ ] Include required report actions.

  * [ ] Validate that Return to Practice exists.
  * [ ] Validate that Restart Article exists and uses reset confirmation.
  * [ ] Validate that Export / Share with Tango exists.
  * [ ] Validate that Close exists.
  * [ ] Validate that unavailable hard words mode is not presented as a fake disabled feature.

## 22. Settings dialog

* [ ] Implement Settings as dialog or sheet.

  * [ ] Validate that Settings exists in the hamburger menu.
  * [ ] Validate that Settings opens a grouped panel.
  * [ ] Validate that Settings resembles a minimal browser settings page.
  * [ ] Validate that settings changes save immediately.
  * [ ] Validate that no separate Save button is required.
  * [ ] Validate that a Close button exists.
  * [ ] Validate that Settings does not become a dashboard.

* [ ] Implement Practice settings group.

  * [ ] Validate that Short delay setting exists.
  * [ ] Validate that Medium delay setting exists.
  * [ ] Validate that Long delay setting exists.
  * [ ] Validate that Start timer setting exists.
  * [ ] Validate that delay changes apply to future timing calculations.
  * [ ] Validate that delay changes do not rewrite the lesson document.

* [ ] Implement Input settings group.

  * [ ] Validate that Romaji aliases toggle exists.
  * [ ] Validate that Romaji aliases default to on.
  * [ ] Validate that Punctuation practice toggle exists.
  * [ ] Validate that Punctuation practice defaults to off.
  * [ ] Validate that Backspace behavior setting exists.
  * [ ] Validate that Manual navigation toggle exists.
  * [ ] Validate that Manual navigation defaults to on.

* [ ] Implement Display settings group.

  * [ ] Validate that Show romaji toggle exists and defaults to on.
  * [ ] Validate that Show meaning toggle exists and defaults to on.
  * [ ] Validate that Show reading toggle exists and defaults to off.
  * [ ] Validate that Show article image toggle exists and defaults to on.
  * [ ] Validate that Caret animation dropdown exists.
  * [ ] Validate that caret animation supports Off, Short, and Normal.
  * [ ] Validate that active token hints remain attached regardless of display settings.

* [ ] Implement Speech settings group.

  * [ ] Validate that Speech status is shown.
  * [ ] Validate that Japanese voice status is shown.
  * [ ] Validate that optional Speak active sentence test action exists if speech is available.
  * [ ] Validate that optional Speech rate setting exists if implemented.
  * [ ] Validate that no MP3 or embedded audio file setting exists.
  * [ ] Validate that no user-facing text-to-speech voice selection is required for MVP.

* [ ] Implement Recovery settings group.

  * [ ] Validate that localStorage recovery status is shown.
  * [ ] Validate that saved article status is shown.
  * [ ] Validate that last saved time is shown if available.
  * [ ] Validate that Clear Saved Article exists in Settings, not the main hamburger menu.
  * [ ] Validate that Clear Saved Article uses custom confirmation.
  * [ ] Validate that Clear Saved Article removes article and progress from localStorage.
  * [ ] Validate that Clear Saved Article returns the app to the empty state.

* [ ] Implement Reset Settings to Defaults.

  * [ ] Validate that Reset Settings to Defaults exists.
  * [ ] Validate that it uses custom confirmation.
  * [ ] Validate that confirmation explains settings will return to defaults.
  * [ ] Validate that article progress is not cleared by resetting settings.

## 23. Browser text-to-speech

* [ ] Implement Web Speech API support.

  * [ ] Validate that the app checks `window.speechSynthesis`.
  * [ ] Validate that the app checks available voices.
  * [ ] Validate that the app listens for `voiceschanged`.
  * [ ] Validate that a Japanese voice is detected by language starting with `ja`.
  * [ ] Validate that utterances use `lang = "ja-JP"` or equivalent Japanese language configuration.
  * [ ] Validate that the default action speaks the active sentence.
  * [ ] Validate that speech can be stopped when another speech action begins.
  * [ ] Validate that speech stops when the article changes.
  * [ ] Validate that speech stops when progress resets.

* [ ] Exclude unsupported audio features.

  * [ ] Validate that lesson `audio-src` is not required.
  * [ ] Validate that MP3 file support is not implemented as a requirement.
  * [ ] Validate that embedded base64 audio assets are not implemented as a requirement.
  * [ ] Validate that no dead audio controls appear when Japanese speech is unavailable.

## 24. Dialogs, overlays, and confirmations

* [ ] Use custom app UI for dialogs.

  * [ ] Validate that normal user flows do not use native `confirm()`.
  * [ ] Validate that normal user flows do not use native `alert()`.
  * [ ] Validate that normal user flows do not use native `prompt()`.
  * [ ] Validate that dialogs use a soft overlay over the practice screen.
  * [ ] Validate that dialog surfaces are paper-like cards or sheets.
  * [ ] Validate that dialog text is clear and short.
  * [ ] Validate that destructive actions are visually distinct but not loud.
  * [ ] Validate that action labels are explicit.
  * [ ] Validate that non-destructive dialogs can close with Escape.
  * [ ] Validate that focus moves into dialogs while open.
  * [ ] Validate that timer pauses while dialogs are open.
  * [ ] Validate that closing a dialog returns to the same sentence, token, typed input, and scroll position.

* [ ] Use custom confirmations for destructive actions.

  * [ ] Validate that Replace Article uses confirmation.
  * [ ] Validate that Reset Current Article Progress uses confirmation.
  * [ ] Validate that Restart Article from report uses confirmation.
  * [ ] Validate that Clear Saved Article uses confirmation.
  * [ ] Validate that Reset Settings to Defaults uses confirmation.

## 25. Error and edge handling

* [ ] Handle invalid imports.

  * [ ] Validate that unsupported files show a calm error.
  * [ ] Validate that invalid lesson documents show a calm error.
  * [ ] Validate that missing required tokens prevents import.
  * [ ] Validate that untypeable tokens are reported as validation issues.
  * [ ] Validate that current article remains intact after failed replacement import.
  * [ ] Validate that localStorage is not overwritten by failed imports.

* [ ] Handle optional image failures.

  * [ ] Validate that missing image asset does not block article load.
  * [ ] Validate that invalid image data does not block text practice.
  * [ ] Validate that image errors do not show broken image icons in Zen mode.
  * [ ] Validate that diagnostics can be logged for image failures.

* [ ] Handle localStorage failures.

  * [ ] Validate that the app can still run if localStorage is unavailable.
  * [ ] Validate that the app shows a calm warning in Settings or menu when recovery is unavailable.
  * [ ] Validate that localStorage write failures are handled without crashing.
  * [ ] Validate that localStorage parse failures are handled without crashing.

* [ ] Handle text-to-speech failures.

  * [ ] Validate that speech failures do not interrupt typing flow.
  * [ ] Validate that speech errors produce a small non-blocking message or logged diagnostic.
  * [ ] Validate that unavailable speech hides main audio controls.

## 26. Logging and observability

* [ ] Add useful console diagnostics without external logging frameworks.

  * [ ] Validate that import validation failures log useful detail.
  * [ ] Validate that parse failures log useful detail.
  * [ ] Validate that localStorage restore failures log useful detail.
  * [ ] Validate that localStorage save failures log useful detail.
  * [ ] Validate that text-to-speech detection results can be inspected.
  * [ ] Validate that text-to-speech failures log useful detail.
  * [ ] Validate that image parsing failures log useful detail.
  * [ ] Validate that logs do not leak huge base64 image payloads.
  * [ ] Validate that logs do not spam on every normal keystroke.

## 27. Non-goals and exclusions

* [ ] Exclude unsupported storage and account features.

  * [ ] Validate that IndexedDB is not used for this version.
  * [ ] Validate that no multi-article library is implemented.
  * [ ] Validate that no user account feature is implemented.
  * [ ] Validate that no cloud sync feature is implemented.

* [ ] Exclude unsupported audio features.

  * [ ] Validate that MP3 import is not required.
  * [ ] Validate that base64 audio assets are not required.
  * [ ] Validate that `audio-src` is not part of the MVP lesson model.

* [ ] Exclude unsupported UI patterns.

  * [ ] Validate that no persistent sidebar appears in practice mode.
  * [ ] Validate that no large dashboard appears in practice mode.
  * [ ] Validate that no gamified scoring UI appears in practice mode.
  * [ ] Validate that no Exit Practice item appears in the hamburger menu.

## 28. Final completion gate

* [ ] Complete the MVP journey end to end in implementation logic.

  * [ ] Validate that a user can start with no article.
  * [ ] Validate that a user receives clear empty-state instructions.
  * [ ] Validate that a user can upload one article.
  * [ ] Validate that a user can practice through previous/current/remaining sentence zones.
  * [ ] Validate that a user can pause and resume.
  * [ ] Validate that a user can navigate backward and forward.
  * [ ] Validate that a user can replace an article after confirmation.
  * [ ] Validate that a user can recover the latest article and state through localStorage.
  * [ ] Validate that a user can reset progress after confirmation.
  * [ ] Validate that a user can export plain article text to Tango.
  * [ ] Validate that a user can complete the article and see a basic session report.
  * [ ] Validate that desktop and mobile layouts are both treated as first-class implementation targets.
