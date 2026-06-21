---

DIRECTIVE - RSS Updates Are User-Facing Only

---

At the end of every application change, consider whether `rss.xml` needs an update.

Update `rss.xml` only for changes that matter to a user of this Japanese writing practice application. User-facing changes include visible features, meaningful UI/UX improvements, new or changed sample lessons, important behavior changes, and bug fixes that users could notice.

Do not update `rss.xml` for developer-only work. Examples that should not create feed entries: AGENTS.md edits, internal refactors with no visible behavior change, test-only updates, validation script changes, formatting-only changes, comments, docs that do not affect app usage, and bug fixes users would not reasonably notice.

RSS update timing rule:

| Latest feed item age | Required action |
|---|---|
| 45 minutes old or newer | Update the existing latest item by adding the new user-facing content to its description. Keep its `pubDate`, `guid`, and `link` unchanged. |
| Older than 45 minutes | Prepend a new `<item>` at the top of the channel and set `lastBuildDate` to the new item's `pubDate`. |

Use the current date and time when deciding whether the latest item is still active. Do not change an existing item's publication date just because more content was added inside the 45-minute active window.

---

A00 Mission

---

Build a production-quality Japanese article typing and writing guidance app. The app lets a learner upload one annotated Japanese article, then rewrite it from the screen while the interface guides them sentence by sentence and token by token.

The product should feel like a calm reading and writing surface, not a dashboard, game, or course platform. Preserve the Zen/e-ink editorial direction: quiet paper-like UI, large Japanese typography, one previous sentence for context, a magnified active sentence, remaining article text below, and a precise caret around the active token with romaji above and meaning below.

---

B00 Repository Structure

---

Current structure:

```txt
D:.
|   index.html
|   styles.css
|   app.js
|   rss.xml
|   favicon.ico
|
\---texts
|       index.xml
|       soccer-event-2026-06-20.jp-lesson.xml
|
\---specs
    |   010-main-specification.md
    |
    \---010-main-specification.assets
            image-20260620150729224.png
            muckup-sample.html
```

GitHub Pages URL:

```txt
https://toys.awwtools.com/public/2026-06-20-japanese-article-typing-exercise/
```

Use `specs/010-main-specification.md` as the main product specification. Use `specs/010-main-specification.assets/image-20260620150729224.png` as the primary visual reference for the final layout. Use `specs/010-main-specification.assets/muckup-sample.html` only as a lower-quality mockup and layout reference. You may reuse ideas from the mockup, but the final implementation should be cleaner, more robust, and production-ready.

---

C00 Implementation Constraints

---

This is a static browser application. Use modern browser technologies only.

Do not add a build step. Do not add a framework. Do not require npm, bundlers, transpilers, servers, or external services.

Implement with plain HTML, CSS, and modern JavaScript. Keep files in the project root unless there is a clear reason to organize them differently. A preferred structure is:

```txt
index.html
styles.css
app.js
```

Existing files may be refactored if that improves quality. Keep the app deployable as static files through GitHub Pages.

Sample lessons live under `texts/`. The built-in sample dropdown reads `texts/index.xml`. When adding a new sample lesson file under `texts/`, add a matching entry to `texts/index.xml` with its title, relative `href`, and short description.

---

C01 RSS Update Feed Rules

---

This project has a local RSS feed:

```txt
rss.xml
```

The feed is for calm application update notes. Users can subscribe to receive notifications when important project features or user-visible behavior changes.

The top app header links to `rss.xml`, and `index.html` must keep RSS discovery in the page head:

```html
<link rel="alternate" type="application/rss+xml" title="Japanese Writing Practice updates" href="rss.xml" />
```

When a feature, important bug fix, new sample set, or meaningful user-facing improvement is added, update `rss.xml`. Do not update it for developer-only changes.

RSS item rules:

| Field | Rule |
|---|---|
| Placement | Prepend a new `<item>` only when the latest feed item is older than 45 minutes |
| Active latest item | If the latest item is 45 minutes old or newer, update its description instead of adding a new item |
| `lastBuildDate` | Set to the new item's `pubDate` only when prepending a new item |
| `title` | Use a calm title such as `Zen Column: Better Manual Typing` |
| `description` | One short readable sentence, or a short calm list when grouping multiple changes in the active item |
| `pubDate` | Use RFC 822 format, preferably noon GMT for deterministic output |
| `link` | Use the project URL with a stable dated fragment |
| `guid` | Same as `link`, with `isPermaLink="true"` |

Use this project URL as the base link:

```txt
https://toys.awwtools.com/public/2026-06-20-japanese-article-typing-exercise/
```

Recommended item shape:

```xml
<item>
  <title>Zen Column: Short Human Update Title</title>
  <link>https://toys.awwtools.com/public/2026-06-20-japanese-article-typing-exercise/#YYYY-MM-DD-short-update-slug</link>
  <guid isPermaLink="true">https://toys.awwtools.com/public/2026-06-20-japanese-article-typing-exercise/#YYYY-MM-DD-short-update-slug</guid>
  <pubDate>Sun, 21 Jun 2026 12:00:00 GMT</pubDate>
  <description>One calm sentence describing the change from the learner's point of view.</description>
</item>
```

Tone rules:

| Do | Avoid |
|---|---|
| Describe visible value to the learner | Internal-only implementation details |
| Keep the update short and readable | Long changelog dumps |
| Use calm Zen-column wording | Marketing language, hype, or noisy labels |
| Mention important behavior changes | Listing every tiny refactor |

Validation after RSS edits:

```bash
python3 - <<'PY'
import xml.etree.ElementTree as ET
ET.parse('rss.xml')
print('rss xml ok')
PY
```

Also verify that `index.html` still links to the feed:

```bash
node - <<'NODE'
const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
if(!html.includes('href="rss.xml"') || !html.includes('application/rss+xml')) process.exit(1);
console.log('rss link ok');
NODE
```

---

D00 Specification Priority

---

Before implementing, read the main specification and inspect the assets. If behavior is unclear, infer the most polished implementation from the specification, the screenshot asset, and the mockup sample.

If the mockup conflicts with the specification or the screenshot, prefer the specification and the screenshot. The mockup is a helper, not the source of truth.

If a small detail is not specified, use best engineering judgment and implement the option that gives the most coherent, high-quality user experience.

---

E00 Core UX Requirements

---

The practice view must support desktop and mobile deliberately. Do not make mobile an afterthought.

Desktop uses a two-column editorial layout: optional article image on the side, writing flow on the main side. Mobile uses a single-column flow: compact header, article image if available, previous sentence, magnified active sentence, remaining text, and bottom controls.

The active token hint must stay attached to the token. Romaji belongs visually above the active token. Meaning belongs visually below the active token. Do not position these hints relative to the whole card if that causes them to drift.

The app should avoid persistent sidebars, dense dashboards, gamification UI, bright colors, and heavy controls. Keep the practice screen quiet.

---

F00 Main Features to Implement

---

The MVP should support one active article at a time.

Required feature set:

| Feature | Requirement |
|---|---|
| Article upload | Upload from empty state or hamburger menu |
| Drag and drop | Show drop overlay and allow article replacement |
| Replacement confirmation | Custom app dialog before replacing progress |
| Lesson parsing | Parse custom HTML-like lesson elements |
| Image anchors | Support referenced image assets from the lesson document |
| Three-zone reading | Previous sentence, active sentence, remaining text |
| Caret | Highlight current token with romaji and meaning attached |
| Typing | Romaji validation with common aliases |
| Navigation | Previous, pause, next, keyboard arrows |
| Local recovery | Save latest article and current state in localStorage |
| Reset progress | Custom confirmation, keep article but clear progress |
| Export to Tango | Generate hash URL and open in new tab or copy URL |
| Font size | Inline hamburger-menu control with limits |
| Theme | Inline Light/Dark selection |
| Session report | Custom dialog with progress, accuracy, slow and missed tokens |
| Settings | Simple grouped settings dialog |
| Text-to-speech | Browser built-in Japanese speech only, no MP3 files |

---

G00 State and Persistence

---

Use `localStorage`, not IndexedDB, for the current version.

Persist only the latest active article and state needed for refresh recovery. Replacing the article overwrites article state. Resetting progress keeps the article but clears practice state.

Persist at least:

| Key area | Data |
|---|---|
| Article | Raw source and parsed metadata needed to restore |
| Position | Current sentence index, token index, current typed input |
| Session | Timer, pause state, progress, attempt statistics |
| Settings | Font size, theme, delay presets, display options |

Use try/catch around storage operations. If storage is unavailable, keep the app usable and show a calm warning in settings or the menu.

---

H00 Import and Export

---

Import flows must share one implementation path. Upload button, hamburger-menu import, and drag-and-drop all validate the file and then either load it or ask to replace the current article.

Export / Share with Tango must export plain Japanese article text only. Do not export romaji, meanings, images, progress, settings, or lesson metadata.

Tango URL format:

```txt
https://tango-japanese.app/mine#import-japanese-text=BASE64:...]]];
```

Encode the text as UTF-8 before base64. Do not call `btoa()` directly on Japanese text. Open Tango in a new tab with `noopener,noreferrer`. Provide a Copy URL fallback.

---

I00 Quality Bar

---

Write maintainable code. Prefer small functions with clear names. Add comments where they clarify non-obvious behavior, especially parser logic, caret positioning, localStorage recovery, import replacement, and Tango export encoding.

Use semantic HTML where practical. Keep controls keyboard-accessible. Preserve focus behavior in dialogs. Use custom dialogs, not browser `alert`, `confirm`, or `prompt` for normal UX flows.

Handle errors gracefully. Invalid article files, missing images, unavailable localStorage, unavailable Japanese text-to-speech, and clipboard failures should not crash the app.

Use `console.info`, `console.warn`, and `console.error` for lightweight observability. Log enough context to debug import, parsing, state restore, export, and speech failures from the browser console. Do not add a logging framework.

---

J00 Mobile and Responsive Quality

---

Test mobile layout intentionally. The active sentence may wrap across multiple lines, and the active token hint must remain attached to the token after wrapping.

Mobile controls should be touch-friendly. The bottom controls must not cover content. Add safe-area and bottom padding where needed.

Desktop and mobile should share the same state model and rendering logic where possible. Do not implement separate behavior unless the layout truly requires it.

---

K00 Text-to-Speech

---

Use browser built-in text-to-speech through `window.speechSynthesis` and `SpeechSynthesisUtterance`.

Use a Japanese voice if available. The MVP should use the browser default Japanese voice and should not expose voice selection. Hide the audio button if speech synthesis or Japanese voice support is unavailable.

Do not implement MP3 playback, embedded audio assets, or audio file imports.

---

L00 Done Criteria

---

The implementation is acceptable when it can be opened from GitHub Pages, load a valid lesson file, restore after refresh, guide the learner through the article with the three-zone layout, handle desktop and mobile cleanly, import and replace articles safely, export to Tango, and show a basic report.

The final result should look and feel closer to the screenshot asset than to the rough mockup sample. Use the mockup as scaffolding only. Quality, polish, and robust browser behavior matter.
