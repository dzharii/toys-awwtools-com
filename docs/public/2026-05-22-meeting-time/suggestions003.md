2026-05-22

You are Codex working inside the existing meeting-timeline project.

This is a focused bug-fix and quality-repair task. The current implementation is not acceptable because it fails the visual design target, mishandles sprite scaling and alignment, and does not correctly support time-zone editing.

You must treat this as a product-quality repair, not as a small patch. Read the existing files, inspect the assets, inspect the screenshots, and fix the implementation with a high standard.

The main visual target remains website-design.png. The current result must be compared against that design. The current implementation is visibly wrong in several ways: the sprites are poorly aligned, the central card and text are being covered, the scale does not reflect the actual lifecycle of the meeting, the time-zone selector is not practically editable, and edit mode needs better UX.

Your job is to repair these issues carefully.

Do not blindly patch symptoms. First understand the timeline model, then fix the rendering.

---

A01 Files and Assets

The project contains at least these files:

suggestions001.md
website-design.png
index.html
style.css
script.js
img-source/*.png

Read suggestions001.md again. It is the product specification.

Inspect website-design.png again. It is the primary UI reference.

Inspect the current implementation in the browser. Compare the current screen to the intended design. The current result is unacceptable until it looks much closer to the reference.

Inspect img-source. Those images contain sprite atlases generated from ChatGPT images. They are source assets, not raw UI components. Do not display an entire sprite atlas as a participant.

If you use sprite atlases, use them as sliced frames or as CSS background-position atlases. Showing the whole atlas in the timeline is a hard failure.

---

A02 Core Bug: Incorrect Timeline Scaling

The current scaling behavior is wrong.

The implementation appears to use a generic display scale such as 7 days when the meeting is about 2 or 3 days away. That makes the participant positions feel wrong because the characters do not start from the beginning of the timeline when the meeting is created.

The product needs two related but separate concepts:

1. The meeting instant.
2. The meeting journey start instant, which is the time when this countdown link or meeting visualization was created.

The journey start instant must be saved in the URL hash.

Add a new compact URL hash parameter:

ct=2026-05-23T06:36Z

`ct` means created time.

The URL should now look like this:

#v=1&t=Design%20Sync&at=2026-05-26T08:45Z&ct=2026-05-23T06:36Z&dur=60&a=Alice@America~Los_Angeles&b=Bruno@Europe~Berlin&theme=light&anim=1&mode=view

Rules:

`at` is the meeting start time in UTC.
`ct` is the countdown creation time in UTC.
`dur` is meeting duration.
`a` and `b` are participants.
`ct` must be preserved across reloads and shared links.

If the hash has no `ct`, create one in a backward-compatible way. For newly created meetings, use the current time as `ct`. For old links without `ct`, set `ct` to the current time when the link is first opened, then serialize it into the hash. Do not constantly reset it on every reload after it exists.

---

A03 Correct Timeline Progress Formula

Stop using the arbitrary display window as the source of character progress.

The character progress should be based on this:

createdAtMs = Date.parse(hash.ct)
meetingAtMs = Date.parse(hash.at)
nowMs = Date.now()

journeyMs = meetingAtMs - createdAtMs
elapsedMs = nowMs - createdAtMs
progressRatio = clamp(elapsedMs / journeyMs, 0, 1)
remainingRatio = 1 - progressRatio

At `createdAtMs`, progressRatio should be 0.

At `meetingAtMs`, progressRatio should be 1.

The participants must start near the outer sides of the timeline when the meeting is first created.

The participants must meet at the center when the meeting time arrives.

The progress ratio must not be based only on “remaining time divided by 7 days” or another fixed bucket.

The adaptive scale can still be used for tick labels or readable display, but the character motion must use the created-to-meeting journey.

This distinction is important:

Display tick scale may be adaptive.
Character journey scale must be createdAt-to-meetingAt.

---

A04 Timeline Positioning Requirements

Participant positions must be symmetrical.

Use one shared progress value for both participants.

Example:

progressRatio = clamp((nowMs - createdAtMs) / (meetingAtMs - createdAtMs), 0, 1)
remainingRatio = 1 - progressRatio

maxOffset = timelineWidth * 0.42

participantA.x = centerX - remainingRatio * maxOffset
participantB.x = centerX + remainingRatio * maxOffset

Do not calculate Alice and Bruno independently in ways that can desynchronize them.

Do not let a sprite offset, image crop, or frame size make one participant visually appear closer than the other unless intentionally designed.

Both characters must be the same logical distance from the center.

If their actual image content has different whitespace, compensate with anchor offsets in metadata.

---

A05 Sprite Frame Synchronization

The sprite animation must use the same progress ratio as the character movement.

Use:

frameIndex = clamp(round(progressRatio * (frameCount - 1)), 0, frameCount - 1)

Both Alice and Bruno should use the same frameIndex unless there is a deliberate per-character frame mapping.

If Alice and Bruno use different atlases, still synchronize them through the same normalized progress.

The same moment in time should produce matching animation states:

progress 0.00 -> both idle or early stance.
progress 0.25 -> both walking.
progress 0.50 -> both approaching.
progress 0.75 -> both reaching.
progress 1.00 -> both near handshake.

If sprite assets are not properly sliced yet, use intentional SVG/CSS placeholders instead of broken sprite rendering. Broken sprite rendering is worse than placeholder rendering.

---

A06 Sprite Atlas Handling

Do not show the entire sprite atlas.

The current screenshot shows a sprite sheet appearing as a single visual block. That is a hard failure.

The app must show exactly one frame per participant.

Acceptable approaches:

CSS background-position on a sprite atlas.
Canvas drawImage with source rectangle.
Pre-sliced PNG frames.
SVG/CSS placeholder characters.

If using a 32-frame atlas with 8 columns and 4 rows:

columns = 8
rows = 4
frameCount = 32
frameWidth = atlasWidth / 8
frameHeight = atlasHeight / 4
col = frameIndex % 8
row = Math.floor(frameIndex / 8)

For CSS background-position:

background-size must equal the full atlas size scaled to the displayed frame size.
background-position-x = -col * frameDisplayWidth
background-position-y = -row * frameDisplayHeight

For canvas:

ctx.drawImage(
  atlasImage,
  col * frameWidth,
  row * frameHeight,
  frameWidth,
  frameHeight,
  0,
  0,
  displayWidth,
  displayHeight
)

If the source atlas includes title text, frame numbers, grid lines, or large uneven whitespace, do not use it directly in production mode. Either crop/slice it properly or fallback to SVG placeholders.

---

A07 Sprite Baseline and Cropping Bug

The current Bruno sprite is visibly cut off. This must be fixed.

All participant sprites must be aligned to the same timeline baseline.

Define a visual baseline for the timeline.

The character feet should be aligned to that baseline or slightly below it, depending on the visual style. Alice currently looks closer to acceptable because she is placed slightly below the line. Bruno is wrong because he is cropped and not aligned.

Implement a consistent participant frame box:

participant box width: fixed or responsive.
participant box height: fixed or responsive.
sprite image: object-fit contain.
sprite image: object-position center bottom.
participant container: overflow visible if needed.
timeline hero: overflow visible enough to avoid clipping, or provide enough vertical space.

Do not use `overflow: hidden` on the participant container if it clips the sprite.

Do not use `object-fit: cover` for sprites.

Do not set sprite background-size in a way that stretches or crops one character differently from the other.

Add per-character CSS variables if needed:

--sprite-scale
--sprite-x-nudge
--sprite-y-nudge
--sprite-feet-offset

Use these only to fine-tune, not to hide broken layout math.

The final result must show both characters standing naturally on the same visual line.

---

A08 Layering and Z-Index

The current layout allows sprites and central text to collide in confusing ways.

Fix the z-index model.

The character sprites should visually appear on top of passive background elements such as the timeline line and decorative labels.

The central meeting card should remain readable.

If a character approaches the central card, the design should prevent unreadable overlap by one or more of these methods:

Move the central card higher.
Keep the character baseline lower.
Limit participant maximum approach before the card.
Make the card z-index readable but avoid covering character heads awkwardly.
Use spacing that matches website-design.png.

The user specifically wants the sprite to be on top of lower-priority text when they overlap. However, this does not mean the final design should be unreadable. The better solution is to hoist participant time labels and central content upward so the sprites do not cover them.

Set a clear layer order:

background canvas
timeline line
timeline ticks
meeting connector line
central card
participant side cards
sprites
active interaction overlays

Adjust if necessary, but document the final z-index strategy in IMPLEMENTATION_REPORT.md.

---

A09 Hoist Time Cards and Labels

The participant local time cards are currently too close to the sprites and can be covered.

Move the Alice and Bruno side information cards upward, closer to the top sides of the hero area, similar to website-design.png.

The participant side cards should include:

Name.
Time zone.
Local time.
Local date.

They should not be placed directly behind the sprite bodies.

The central meeting card should also be high enough that the walking sprites do not obscure its rows.

The countdown pill can remain under the meeting card, but it must not collide with the character heads or hands.

---

A10 Edit Mode Auto-Scroll

When the user clicks Edit, the app should smoothly scroll to the edit form.

Expected behavior:

Click Edit.
Edit panel opens.
The browser smoothly scrolls so the edit form is visible.
The first relevant input receives focus, preferably the title field or the UTC date field.
The timeline remains visible above or just before the form if possible.

Use:

editPanel.scrollIntoView({ behavior: "smooth", block: "start" })

After the scroll starts, focus the first input with preventScroll if supported:

field.focus({ preventScroll: true })

Make sure this does not cause a jarring double scroll.

---

A11 Time-Zone Editing Bug

The time-zone input currently appears not editable or practically unusable.

Fix this.

The user must be able to edit Participant A and Participant B time zones.

Acceptable implementation:

Use a searchable text input with datalist.
Use a custom combobox.
Use a select element populated with real IANA zones.

Do not use a select with only one available option.

Do not place a transparent overlay over the input.

Do not disable the input.

Do not make pointer-events none.

Do not trap focus.

Do not make the dropdown visually appear but impossible to type into.

The user must be able to change Europe/Berlin to another valid time zone such as Asia/Tokyo or America/New_York.

After changing the time zone, preserve the meeting instant by default. The displayed local time for that participant should update to reflect the same UTC meeting time in the new zone.

This is the default rule:

Changing time zone preserves the meeting instant.

Do not reinterpret the typed wall-clock time unless a separate advanced option is explicitly added.

Test manually:

Change Bruno from Europe/Berlin to Asia/Tokyo.
UTC time should stay the same.
Alice local time should stay equivalent to UTC.
Bruno local time should update to Tokyo time.
The hash should update with b=Bruno@Asia~Tokyo.

---

A12 Time Editing Behavior

The three editable time rows must work:

UTC meeting time.
Alice local time.
Bruno local time.

When editing UTC:

UTC is the source.
Alice and Bruno are derived.

When editing Alice:

Alice is the source.
UTC and Bruno are derived.

When editing Bruno:

Bruno is the source.
UTC and Alice are derived.

The active row should be highlighted.

If input is incomplete, do not destroy the old valid meeting instant.

If input is valid, update the visual timeline and URL hash.

The displayed participant positions should update based on the new meeting time and the existing created time. If changing the meeting time would make createdAt invalid or after the meeting time, fix it safely.

If meetingAt <= createdAt, set createdAt to now or meetingAt minus a small default journey window, and document the behavior.

Recommended behavior:

If edited meeting time is in the future and createdAt is before it, preserve createdAt.
If edited meeting time is before createdAt, set createdAt to now if now is before the meeting.
If edited meeting time is now or in the past, set createdAt to meetingAt - 1 hour as a fallback for visualization.

---

A13 Created Time Editing and Display

The created time does not need to be a prominent user-facing field in phase 1, but it must exist internally and in the hash.

Add a subtle debug or metadata display only if helpful:

Created: May 23, 2026, 06:36 UTC

Do not clutter the main design.

The bottom summary strip can show:

Time until meeting.
Meeting duration.
Participants.
Updated.

It does not need to show created time unless useful for debugging.

However, IMPLEMENTATION_REPORT.md must explain that `ct` is used to anchor timeline progress.

---

A14 Tick Labels

The tick labels should make sense with the journey scale.

If the meeting was created 2 days and 2 hours before the meeting, the timeline should not arbitrarily show a 7-day journey as if that were the actual animation lifecycle.

For the visual journey, use createdAt-to-meetingAt.

Tick labels may show approximate remaining or offset labels.

Acceptable tick examples:

-2d
-1d
Meeting
+1d
+2d

or:

Start
Halfway
Meeting

or adaptive labels based on the total journey.

The important rule is that the visual motion should not imply a 7-day journey when the link was created 2 days before the meeting.

---

A15 URL Serialization Changes

Update hash parsing and serialization.

Add support for:

ct

Keep existing keys:

v
t
at
dur
a
b
theme
anim
mode
spriteA
spriteB

Keep compact query format.

Do not switch to JSON.

The serializer should produce stable key order:

v
t
at
ct
dur
a
b
theme
anim
mode
spriteA
spriteB

If `ct` is missing, generate it once and serialize it.

If user copies link, copied link must include `ct`.

If user reloads the link, the same `ct` must be preserved.

---

A16 Visual Regression Requirements

After fixing, compare visually against the design reference.

The final page should have:

Large polished hero area.
Participant side cards above the sprites.
Alice and Bruno standing on the same baseline.
No cropped Bruno.
No whole sprite sheet visible.
Central card readable.
Countdown pill readable.
Timeline ticks aligned.
Bottom summary strip clean.
Edit form styled and not raw.
Edit form scrolls into view.
Time-zone input usable.

If the result still looks like a broken prototype, keep working.

---

A17 Suggested Code Changes

In script.js, introduce or repair these concepts:

state.createdAtMs
state.meetingAtMs
state.progressRatio
state.remainingRatio

Functions to add or repair:

getCreatedAtMs()
ensureCreatedAt(config)
getJourneyProgress(nowMs, createdAtMs, meetingAtMs)
getParticipantPositions(progressRatio)
getSpriteFrame(progressRatio, frameCount)
parseHash()
serializeHash()
enterEditMode()
handleTimeZoneChange()
renderTimeline()
renderParticipants()
renderEditPanel()

In CSS, introduce a proper hero layout:

.timeline-hero
.timeline-stage
.participant-card
.participant-sprite
.meeting-card
.countdown-pill
.timeline-axis
.summary-strip
.edit-panel

Use CSS variables for positions:

--progress
--remaining
--participant-a-x
--participant-b-x
--timeline-y
--sprite-scale

Do not hardcode random pixel offsets throughout JavaScript. Use calculated variables and CSS layout.

---

A18 Required Manual Tests

Perform these tests before finishing.

Test 1. Load without hash.
Expected: app creates default future meeting and serializes a hash with at and ct.

Test 2. Reload page.
Expected: ct is preserved. Participants do not jump back to the beginning unless the hash was removed.

Test 3. Create meeting 2 days away.
Expected: characters begin near the outer start positions if ct is now.

Test 4. Simulate time progress if possible.
Expected: as now approaches at, both characters move toward center in sync.

Test 5. Sprite mode.
Expected: no full sprite sheet is displayed. If sprite mode is incomplete, SVG fallback appears cleanly.

Test 6. Bruno sprite.
Expected: not cropped, feet align to Alice baseline.

Test 7. Edit button.
Expected: edit form opens and smooth-scrolls into view.

Test 8. Change Bruno time zone.
Expected: field is editable, local time updates, hash updates.

Test 9. Edit Alice time.
Expected: UTC and Bruno update.

Test 10. Edit UTC time.
Expected: Alice and Bruno update.

Test 11. Save.
Expected: edit mode closes, hash remains valid.

Test 12. Cancel.
Expected: previous state and previous hash restored.

Test 13. Copy Link.
Expected: copied URL includes ct and current state.

Test 14. Mobile/narrow width.
Expected: timeline and edit form remain usable.

Document these in IMPLEMENTATION_REPORT.md.

---

A19 Implementation Report Requirement

After the fix, update IMPLEMENTATION_REPORT.md.

Include:

What was broken.
What was changed.
How createdAt/ct now works.
How scaling now works.
How sprite synchronization works.
Whether actual sprite atlas slicing is implemented or placeholder mode is used.
How time-zone editing was fixed.
What manual tests passed.
Known limitations.
Recommended phase 2 steps.

Be honest. Do not claim sprite extraction is complete if it is only a placeholder.

---

A20 Highest-Priority Fixes

If time is limited, prioritize in this order:

1. Fix timeline scaling using createdAt-to-meetingAt progress.
2. Add `ct` to the URL hash and preserve it.
3. Prevent full sprite sheets from appearing in the hero.
4. Fix sprite/placeholder baseline alignment and Bruno cropping.
5. Hoist cards and labels so sprites do not cover important text.
6. Fix time-zone editing.
7. Add smooth scroll to edit form.
8. Polish the visual layout against website-design.png.
9. Update IMPLEMENTATION_REPORT.md.

Do not stop after only one fix. This is a combined quality repair task.