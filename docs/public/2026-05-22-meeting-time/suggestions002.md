Codex Prompt
2026-05-22

You are Codex working inside a WSL/Linux project directory.

Your task is to implement a high-quality static web application prototype for an animated, editable, shareable meeting timeline. Treat this as a product implementation task, not a quick demo.

The current directory contains these important files:

.
|   suggestions001.md
|   website-design.png
|
\---img-source
        ChatGPT Image May 22, 2026, 07_41_38 PM (1).png
        ChatGPT Image May 22, 2026, 07_41_38 PM (2).png
        ChatGPT Image May 22, 2026, 07_41_38 PM (3).png
        ChatGPT Image May 22, 2026, 07_41_38 PM (4).png
        ChatGPT Image May 22, 2026, 07_41_38 PM (5).png
        ChatGPT Image May 22, 2026, 07_41_38 PM (6).png
        ChatGPT Image May 22, 2026, 07_41_38 PM (7).png
        ChatGPT Image May 22, 2026, 07_41_39 PM (8).png
        ChatGPT Image May 22, 2026, 07_41_39 PM (9).png
        ChatGPT Image May 22, 2026, 07_41_40 PM (10).png

You must heavily inspect and use suggestions001.md as the functional/product specification.

You must heavily inspect and use website-design.png as the visual target. This image is the primary UI/UX reference. The final website should look much closer to website-design.png than to any existing prototype. If existing code conflicts with the visual target, ignore the existing code and rebuild.

You must inspect the sprite source images in img-source. These are ChatGPT-generated sprite atlas images. They may contain multiple sheets, text labels, grid lines, and imperfect frame structure. Do not blindly display a whole sprite sheet as a character. That is a failure. You must either use them correctly or create a clean placeholder system that can later be connected to properly sliced frames.

Your output should be a working static website that can be opened locally in a browser. Prefer plain HTML, CSS, and JavaScript unless the repository already clearly uses a framework. Do not introduce a heavy build system unless absolutely necessary. The expected output should be easy to inspect and run.

Before writing final code, read the files and create a short plan in a new file named IMPLEMENTATION_PLAN.md. Keep it concise but specific. Include what you will build, what you will discard, what assets you will use, and what you will postpone.

After implementation, create a short progress report in IMPLEMENTATION_REPORT.md. Include what was implemented, what is incomplete, how to run it, and what to do in phase 2 for sprites.

Your implementation should satisfy the product, UI, and engineering requirements below.

---

A01 Visual Objective

The website must visually target website-design.png.

The target design is a polished SaaS-style desktop app screen. It has a left sidebar, a top control bar, a large clean central timeline canvas, two participants approaching each other, a central meeting time card, participant time cards, timeline ticks, and a bottom summary strip.

The final result must not look like a raw form demo. It must not look like unstyled HTML. It must not show a sprite sheet pasted into the page. It must not place characters directly on top of unreadable text. It must not have a tiny broken layout in the center of a mostly empty page.

Use a light, clean product UI by default. Use plenty of white space, soft borders, rounded cards, subtle shadows, restrained blue-purple accent colors, and readable typography.

The main screen should look like a product screenshot, not an engineering test page.

---

A02 Required Page Structure

Create or rewrite these files as needed:

index.html
style.css
script.js

If useful, also create:

assets/
assets/sprites/
assets/generated/
IMPLEMENTATION_PLAN.md
IMPLEMENTATION_REPORT.md

The HTML should be semantic and accessible. The CSS should own the layout and visual quality. The JavaScript should own state, time-zone conversion, URL hash state, editing behavior, and animation state.

The main page must include these visual regions:

Left sidebar:
Brand name, for example MeetTime.
Navigation items similar to Timeline, Meetings, Participants, Settings, Integrations, Reports.
A small plan/team section near the bottom.
A user/profile footer area.

Top bar:
Main title.
Control chips for theme, scale, animation status.
Copy/share button or icon.
Overflow/more button.

Main timeline hero:
Large white canvas/card.
Participant A on the left.
Participant B on the right.
A horizontal timeline line.
A centered meeting marker.
A centered meeting information card.
A countdown pill.
Readable time-zone rows.
Timeline tick labels.
Participant labels and local time cards.

Bottom summary strip:
Time until meeting.
Meeting duration.
Participants.
Updated status.

Edit panel:
Initially hidden in view mode.
Opened by Edit.
Styled as part of the polished product, not as a raw form.
Allows editing title, duration, participant names, participant time zones, UTC date/time, Participant A date/time, Participant B date/time, theme, and render mode.
Provides Save, Cancel, and Copy Link.

---

A03 Core Product Behavior

The meeting is one absolute instant internally.

The app must display that same instant in three zones:

UTC.
Participant A time zone.
Participant B time zone.

Default participant values:

Participant A name: Alice.
Participant A time zone: America/Los_Angeles.
Participant B name: Bruno.
Participant B time zone: Europe/Berlin.
Meeting title: Design Sync or Meeting.
Duration: 60 or 30 minutes. Choose one and be consistent.
Default meeting time: a future time if no hash exists.

The timeline should show the time remaining before the meeting.

The characters should move toward the center based on remaining time.

The center point is the meeting.

When the meeting is far away, characters are farther from the center.

When the meeting is near, characters are closer to the center and their near arms should appear more extended.

When the meeting starts, characters should be near the center in a handshake-ready state.

Use smooth CSS transitions and avoid chaotic motion.

---

A04 Edit Mode Behavior

The app should open in read-only view mode by default.

There must be an Edit button.

Clicking Edit opens edit mode.

In edit mode, the user can change any time field:

UTC date and time.
Participant A local date and time.
Participant B local date and time.

When the user edits UTC, the Participant A and Participant B fields must update automatically.

When the user edits Participant A local time, UTC and Participant B must update automatically.

When the user edits Participant B local time, UTC and Participant A must update automatically.

This conversion must happen on input or change while editing, not only after Save.

The active edited row should be visually highlighted.

Partial or invalid input should not destroy the previous valid meeting instant. If the user is halfway through typing, keep the field value and show a gentle validation state only when necessary.

Save commits the draft and returns to view mode.

Cancel restores the state from before entering edit mode and returns to view mode.

Copy Link copies the current URL with the hash.

---

A05 URL Hash State

The app must encode state in the URL hash using a compact query-style format, not raw JSON.

Use this format:

#v=1&t=Design%20Sync&at=2026-05-22T18:00Z&dur=60&a=Alice@America~Los_Angeles&b=Bruno@Europe~Berlin&theme=light&anim=1&mode=view

Rules:

v is schema version.
t is meeting title.
at is UTC start time.
dur is duration in minutes.
a is Participant A name and time zone using name@timezone.
b is Participant B name and time zone using name@timezone.
theme is light, dark, neutral, or auto.
anim is 1 or 0.
mode is view or edit.

For time zones in hash, replace "/" with "~". For parsing, convert "~" back to "/".

The app must parse the hash on page load.

The app must update the hash while valid edits are made.

During typing, use history.replaceState rather than pushing every keystroke into browser history.

On Save, it is acceptable to push a single committed state.

On Cancel, restore the previous hash.

Unknown hash keys should not break the app.

---

A06 Time-Zone Requirements

Use IANA time zones.

Valid examples:

UTC.
America/Los_Angeles.
America/New_York.
Europe/Berlin.
Europe/London.
Asia/Tokyo.

Do not rely on ambiguous short names like PST, CET, or IST as configuration values.

Use Intl.DateTimeFormat for display and conversion where possible.

If you implement local-to-UTC conversion manually with Intl, be careful. Test Participant A and Participant B conversions. If you install a lightweight date library because it makes this safer, document that decision in IMPLEMENTATION_REPORT.md. Prefer no dependency if the implementation remains correct.

At minimum, the following conversions must work:

UTC -> America/Los_Angeles.
UTC -> Europe/Berlin.
America/Los_Angeles local input -> UTC and Europe/Berlin.
Europe/Berlin local input -> UTC and America/Los_Angeles.

---

A07 Sprite and Character Handling

Do not display an entire sprite atlas image as the character. That is explicitly wrong.

The img-source files are source material, not directly usable character DOM images unless properly sliced or background-positioned.

Phase 1 may use polished SVG/CSS placeholder characters if sprite extraction is not clean enough. This is acceptable and preferred over displaying broken sprite sheets.

The placeholder characters must be visually aligned with the design reference:

Female character on the left, facing right.
Male character on the right, facing left.
Full body or simplified full-body avatar.
Arms extend toward the center.
Characters should stand on the timeline.
Characters should not overlap the central card in a way that makes text unreadable.

If you attempt sprite support in phase 1, do it properly:

Create an assets/sprites directory.
Use ImageMagick or another image tool to inspect dimensions.
Use a repeatable script or documented command to crop frames.
Create metadata for frame width, frame height, columns, rows, and frame order.
Use CSS background-position or canvas drawing to show exactly one frame at a time.
Do not use image maps for the animation unless there is a strong reason.
Do not render the full atlas image as a character.

Recommended phase 1 decision:

Use CSS/SVG placeholder characters for the app UI.
Add a render mode selector with svg and sprite.
If sprite mode is selected but clean frame assets are not available, show a controlled placeholder message or fallback to SVG.
Document phase 2 sprite extraction steps in IMPLEMENTATION_REPORT.md.

---

A08 Suggested Sprite Extraction Investigation

Use WSL/Linux tools.

Start with:

file "website-design.png"
identify "website-design.png"
identify "img-source"/*.png

If ImageMagick is available, use:

magick identify "img-source/ChatGPT Image May 22, 2026, 07_41_38 PM (1).png"

If ImageMagick is not available and needed, install it or use another available tool. Document what you used.

Inspect whether the sprite sheets contain title text, frame numbers, grid lines, and whitespace. If they do, do not use the raw sheet in production UI.

If a sheet is 8 columns by 4 rows, the approximate frame structure is:

columns: 8.
rows: 4.
frames: 32.
frame index = row * 8 + column.

If using a CSS atlas, the formula is:

frameIndex = clamp(round(progressRatio * 31), 0, 31)
column = frameIndex % 8
row = floor(frameIndex / 8)

Then set background-position to:

x = -column * frameWidth
y = -row * frameHeight

But only do this if the asset is truly clean enough. Otherwise keep placeholder characters and document the next step.

---

A09 UI Quality Requirements

The target quality is close to website-design.png.

Use a polished layout:

App frame centered on page.
Left sidebar width around 240px to 260px.
Main content max width around 1300px to 1500px.
Header with top controls.
Timeline hero large enough to breathe.
Characters large and readable.
Central meeting card prominent but not too large.
Bottom summary strip aligned and clean.

Use consistent spacing:

8px, 12px, 16px, 24px, 32px increments.
Avoid random margins.
Avoid giant empty gaps.
Avoid cramped form rows.

Use polished typography:

System UI stack is fine.
Use large page heading.
Use medium card headings.
Use small muted labels.
Use strong contrast.

Use high-quality controls:

Buttons should have hover and focus states.
Inputs should be readable.
Edit panel should feel like a controlled product surface.
The active time row should be highlighted.
Errors should be visible but not loud.

Use responsive behavior:

Desktop should look like the reference.
Tablet should still look coherent.
Mobile can stack sidebar/top sections, but the timeline should remain usable.

---

A10 Implementation Details

Recommended JavaScript structure:

Create a single state object:

state = {
  config,
  draft,
  isEditing,
  baselineConfig,
  baselineHash,
  lastValidMeetingMs
}

Create separate functions for:

parseHash
serializeHash
applyHashToConfig
formatZonedTime
getLocalParts
localTimeToUtc
getCountdownText
chooseScale
getTimelineProgress
render
renderTimeline
renderTimeFields
enterEditMode
saveEditMode
cancelEditMode
copyLink
scheduleHashUpdate

Do not put all behavior inside one enormous unreadable event handler.

Keep functions small and testable.

Use data attributes and CSS custom properties where they simplify rendering.

For characters, set CSS variables:

--participant-a-x
--participant-b-x
--hand-extension
--progress

Then CSS can render positions and arm transforms.

---

A11 Design Specifics to Match

The visual target has these details. Recreate the spirit, not every pixel.

Left sidebar:
White or very light background.
Brand logo area.
Selected Timeline item with soft blue/purple highlight.
Navigation icons can be simple text symbols or inline SVG.
Bottom team/profile area.

Top:
Large title.
Control chips for Theme, Scale, Animation Running.
Small icon buttons for share and more.

Timeline:
Large central white space.
Thin gray horizontal line.
Center marker with a ring/dot.
Timeline labels such as -6h, -4h, -2h, +2h, +4h, +6h or adaptive equivalents.
Two characters moving toward the center.
Participant cards with avatar, name, zone, and local time.
Central meeting card with title and UTC/Alice/Bruno times.
Countdown pill under the central card.

Bottom summary:
Four segments:
Time until meeting.
Meeting duration.
Participants.
Updated status.

Edit mode:
Do not destroy the primary layout.
Show edit panel below the timeline or as a polished card.
Keep the timeline visible while editing.
The user should see live conversion and live timeline response.

---

A12 Animation and Timeline Math

Use this idea:

remainingMs = meetingMs - nowMs

Choose display window:

More than 7 days -> 30 days.
2 to 7 days -> 7 days.
12 hours to 2 days -> 48 hours.
1 to 12 hours -> 12 hours.
10 minutes to 1 hour -> 1 hour.
1 to 10 minutes -> 10 minutes.
Less than 1 minute -> 60 seconds.

Then:

remainingRatio = clamp(remainingMs / displayWindowMs, 0, 1)
progressRatio = 1 - remainingRatio

The center is always the meeting.

Participant A x position moves from left toward center.

Participant B x position moves from right toward center.

The participants should not visually collide with the center card. Use offset constraints and z-index layering.

Hand extension should use easing:

easeOutCubic(x) = 1 - (1 - x)^3

Use CSS transforms for arm extension if using SVG/CSS characters.

---

A13 Accessibility Requirements

Use semantic HTML.

The timeline section should have an accessible label.

The meeting title should be a real heading.

Buttons must be real buttons.

Inputs must have labels.

Do not rely on color only.

Add aria-live for countdown/status updates.

Respect prefers-reduced-motion.

If reduced motion is enabled, reduce transitions and disable unnecessary animation.

---

A14 Testing and Self-Verification

You must self-check your work before finishing.

Run the app locally if possible.

Use one of these approaches:

python3 -m http.server 5500
npx serve .
npx http-server .

Open the page in a browser if possible, or at least verify the files are valid and can load.

Use available tools to inspect generated files.

Run these checks:

The page loads with no JavaScript console-blocking syntax errors.
The layout resembles website-design.png.
The sidebar exists.
The top controls exist.
The central timeline exists.
The participants do not overlap unreadable text.
The whole sprite sheet is not displayed as a character.
View mode is the default unless hash mode says edit.
Edit mode opens.
UTC edit updates Alice and Bruno.
Alice edit updates UTC and Bruno.
Bruno edit updates UTC and Alice.
Copy Link produces a hash URL.
Reloading the hash restores the same meeting.
Theme selector changes visual theme.
Render mode selector does not break layout.
Mobile width does not completely collapse.

Write these results into IMPLEMENTATION_REPORT.md.

If a check fails, fix the implementation before finalizing. Do not leave obvious broken UI.

---

A15 Strict Failure Conditions

Do not submit a page that looks like raw HTML controls with a tiny broken timeline.

Do not paste a full sprite sheet into the central canvas as if it were a character.

Do not let characters cover the central meeting text.

Do not ignore website-design.png.

Do not ignore suggestions001.md.

Do not create a design that is only technically functional but visually unacceptable.

Do not use JSON as the primary URL hash format.

Do not require a backend.

Do not require a build step unless clearly documented and justified.

Do not leave edit mode broken.

Do not leave time-zone conversion broken.

---

A16 Recommended Work Plan

Step 1. Inspect files.

Read suggestions001.md.

Open or inspect website-design.png.

Run identify on website-design.png and img-source images.

Check whether existing index.html, style.css, or script.js exist. If they exist and are poor, salvage only useful logic.

Step 2. Write IMPLEMENTATION_PLAN.md.

Mention the intended UI structure, time-zone implementation, hash format, and sprite decision.

Step 3. Implement index.html.

Build the app shell, sidebar, topbar, timeline hero, center card, participant cards, summary strip, edit panel, and datalist for time zones.

Step 4. Implement style.css.

Recreate the design quality of website-design.png. Focus on layout, scale, spacing, typography, card polish, character placement, and responsive behavior.

Step 5. Implement script.js.

Implement state, hash parsing, hash serialization, time-zone formatting, edit mode, live conversion, timeline math, character positioning, theme switching, copy link, and render loop.

Step 6. Add placeholder characters.

Use CSS/SVG/HTML shapes that look intentional and match the meeting-timeline concept. Do not use broken sprite sheets. If you use sprite mode, do it as a safe optional path.

Step 7. Test.

Use local server and manual checks.

Step 8. Write IMPLEMENTATION_REPORT.md.

Be honest. Document implemented features, known limitations, and phase 2 sprite work.

---

A17 Expected Final Deliverables

At the end, the directory should contain at least:

index.html
style.css
script.js
IMPLEMENTATION_PLAN.md
IMPLEMENTATION_REPORT.md

The app should be usable by opening index.html through a local server.

The app should visually resemble website-design.png.

The app should implement the meeting timeline product described in suggestions001.md.

The app should be ready for phase 2 sprite work without needing to redesign the whole UI again.

---

A18 Final Response Format From Codex

When done, do not provide a vague summary.

Provide this exact structure:

Implemented:
A concise list of completed features.

Files changed:
List the files changed or created.

How to run:
Exact command, for example python3 -m http.server 5500, and the URL.

Verification:
List the manual checks performed and whether they passed.

Known limitations:
List remaining limitations, especially sprite extraction if not fully implemented.

Next phase:
Describe the next concrete step for sprite slicing and animation.