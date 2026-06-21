# Implementation Todo and Validation Notes

## Product Surface
- [x] Replace the empty HTML shell with a static no-build application.
- [x] Keep the app to one active article at a time.
- [x] Avoid accounts, cloud sync, multi-article library, and course-dashboard UI.
- [x] Add required title, description, Open Graph, and Twitter metadata.
- [x] Use `img/social_logo.png` project asset for social preview metadata.

## Visual Layout
- [x] Match the provided mockup direction: quiet e-ink paper surface, restrained header, large Japanese type.
- [x] Implement desktop two-column layout with optional image column and reading column.
- [x] Implement mobile single-column flow with safe bottom padding and fixed bottom controls.
- [x] Keep previous sentence, magnified active sentence, and remaining text as distinct zones.
- [x] Hide persistent sidebars and dashboard-style metrics.
- [x] Add Light and Dark themes without neon or game styling.

## Lesson Parsing
- [x] Parse untrusted lesson text with `DOMParser`.
- [x] Read only known custom elements and attributes.
- [x] Support `jp-lesson`, `jp-section`, `jp-paragraph`, `jp-sentence`, and `jp-token`.
- [x] Generate internal IDs from document order when source IDs are absent.
- [x] Preserve author-defined token boundaries.
- [x] Validate root, section, sentence, token, token `text`, token `type`, romaji for non-punctuation, delay values, and `delay-ms`.
- [x] Reject invalid typed tokens before replacing current progress.
- [x] Ignore unknown imported HTML and never insert imported markup into the app UI.

## Images
- [x] Parse `jp-image-ref` using `asset` or `id`.
- [x] Parse `jp-assets` and `jp-image` assets using attribute and nested `jp-image-data` forms.
- [x] Validate PNG, JPEG, and WebP data URLs.
- [x] Omit missing or invalid images without blocking typing.
- [x] Render one closest relevant image, not stacked unrelated images.
- [x] Hide broken image icons and log diagnostics.

## Practice Flow
- [x] Render only one previous sentence.
- [x] Magnify the active sentence and exclude it from remaining text.
- [x] Advance token by token and sentence by sentence.
- [x] Open the session report after the final sentence.
- [x] Keep romaji above and meaning below the active token using token-relative DOM.
- [x] Preserve hint attachment after wrapping on mobile.
- [x] Auto-advance punctuation when punctuation practice is off.
- [x] Require punctuation when punctuation practice is on.

## Input and Navigation
- [x] Validate romaji against primary value and aliases.
- [x] Include common alias support for `し`, `ち`, `つ`, `ふ`, `じ`, `を`, and `ん`.
- [x] Normalize spaces, case, and full-width Latin input.
- [x] Record exact typed input in token statistics.
- [x] Support Previous, Pause, and Next controls.
- [x] Support ArrowLeft, ArrowRight, Shift+arrows, P, Escape, Enter, Backspace, and Space outside the text input.
- [x] Reset token timing after manual navigation.
- [x] Add lock-mistakes backspace behavior option.

## Timing and Statistics
- [x] Implement short, medium, long, and exact `delay-ms` timing values.
- [x] Let settings adjust delay presets without rewriting the lesson.
- [x] Track active typing time excluding pause/dialog/menu time.
- [x] Track completed, correct, missed, skipped, slow, and review-candidate tokens.
- [x] Keep delay expiration from moving the caret automatically.

## Import and Recovery
- [x] Add empty-state upload.
- [x] Add hamburger-menu import.
- [x] Add full-window drag-and-drop import/replacement overlay.
- [x] Validate imported file before replacing current state.
- [x] Use custom replacement confirmation.
- [x] Save latest article source, hash, state, stats, settings, typed input, and last saved timestamp in localStorage.
- [x] Restore latest article after refresh.
- [x] Handle unavailable or corrupt localStorage without crashing.
- [x] Add Settings recovery status and clear saved article confirmation.

## Menu, Dialogs, and Settings
- [x] Build all normal flows with custom app dialogs, not `alert`, `confirm`, or `prompt`.
- [x] Pause timing while menu/dialogs are open.
- [x] Add Resume, Restart Sentence, Reset Current Article Progress, Import Article, Export / Share with Tango, Session Report, and Settings.
- [x] Add inline Font Size control with Small, Normal, Large, and Extra Large.
- [x] Add inline Theme control with Light and Dark.
- [x] Add grouped Practice, Input, Display, Speech, and Recovery settings.
- [x] Add Reset Settings to Defaults confirmation.

## Tango Export
- [x] Export plain Japanese article text only.
- [x] Preserve paragraph/sentence order and useful line breaks.
- [x] Exclude romaji, readings, meanings, image data, settings, and progress.
- [x] Encode with `TextEncoder` before base64 conversion.
- [x] Generate `https://tango-japanese.app/mine#import-japanese-text=BASE64:...]]];`.
- [x] Provide Copy URL and Open Tango actions with clipboard fallback textarea.

## Speech
- [x] Detect `speechSynthesis`.
- [x] Listen for `voiceschanged`.
- [x] Show the audio button only when a Japanese voice is available.
- [x] Speak the active sentence with `lang = "ja-JP"`.
- [x] Stop speech on replacement/reset.
- [x] Avoid MP3, base64 audio, or lesson audio imports.

## Validation Completed
- [x] `node --check app.js`.
- [x] Local asset reference check.
- [x] Forbidden API check for native dialogs and IndexedDB.
- [x] Sample lesson markup sanity check: 1 lesson, 1 section, 23 sentences, 178 tokens, 0 untypeable tokens.
- [x] Headless Chrome restore test with sample lesson.
- [x] Headless Chrome typing progression test with punctuation auto-advance.
- [x] Headless Chrome menu quick-control presence test.
- [x] Headless Chrome image-backed lesson test.
- [x] Headless Chrome desktop layout check.
- [x] Headless Chrome mobile layout check.
- [x] Headless Chrome active-token hint geometry check.
