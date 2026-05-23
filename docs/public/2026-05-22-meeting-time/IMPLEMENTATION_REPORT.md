# Implementation Report

## What Was Broken
- Character motion used adaptive remaining-time buckets instead of the created-to-meeting journey, so a newly shared meeting could render as partly progressed immediately.
- The URL hash did not include a persistent countdown creation time, so reload/share behavior could not preserve journey progress.
- Sprite frame progression was tied to the wrong progress value and could desynchronize visually from the timeline lifecycle.
- Several male source sheets had unusable bottom-row reaching frames that made Bruno appear cropped.
- Participant time cards were too low and could collide with sprites.
- The center tick label sat under the meeting marker.
- Time-zone text inputs were overwritten during render while focused, making them feel difficult to edit.
- Edit mode opened without scrolling the form into view or focusing a useful input.

## What Changed
- Added compact hash parameter `ct` for countdown creation time.
- Added `createdAtUtc` to app state/config and preserved it across save, reload, and copy-link flows.
- Migrated old links without `ct` by generating `ct` once and serializing it back into the hash.
- Replaced character movement math with journey progress:
  `progressRatio = clamp((nowMs - createdAtMs) / (meetingAtMs - createdAtMs), 0, 1)`.
- Kept adaptive/readable display text, but stopped using adaptive buckets as the source of character movement.
- Synchronized both participant positions and sprite frame index from the same journey progress ratio.
- Remapped male bottom-row sprite frames in the slicer to avoid cropped source frames while preserving full-body reaching states.
- Hoisted participant cards above sprites and moved the center tick label below the marker.
- Made time-zone editing preserve the meeting instant and update derived local time rows immediately.
- Added smooth scroll and focus behavior when entering edit mode.

## Created Time / `ct`
- `at` is the meeting start UTC instant.
- `ct` is the UTC instant when the countdown journey starts.
- New no-hash loads create both `at` and `ct` and serialize both into the hash.
- Old hashes without `ct` generate `ct` once on load and immediately replace the hash.
- If an edited meeting time would make `meetingAt <= createdAt`, `createdAt` is repaired safely: future meetings use now as `ct`; past/current meetings use `meetingAt - 1 hour` for visualization.

## Scaling
- Character progress is now based only on `ct -> at` journey duration.
- Tick labels use the actual journey duration instead of implying arbitrary 7-day or 30-day movement windows.
- The scale chip now reports the journey duration, for example `Journey 2h`.

## Sprite Synchronization
- Runtime uses cleaned 8x4 atlases from `assets/sprites/atlases/`.
- The app renders exactly one 256x256 frame per participant through CSS background-position.
- Frame index is computed as `round(progressRatio * 31)`.
- Alice and Bruno use the same normalized frame index unless a different sprite is selected.
- Raw `img-source` sheets are not displayed in the UI.

## Z-Index Strategy
- Background and decorative orbs: lowest layer.
- Timeline axis and connector: passive lower layers.
- Sprites: above timeline/ticks so characters feel grounded and active.
- Meeting card, countdown pill, and participant cards: higher content layers to keep text readable.
- Edit panel and controls: normal document flow above the timeline after opening.

## Time-Zone Editing
- Participant timezone fields remain editable while focused and are no longer overwritten by render.
- Changing a timezone preserves the UTC meeting instant and recalculates that participant's local date/time.
- Example verified: changing Bruno from `Europe/Berlin` to `Asia/Tokyo` preserved UTC and updated Bruno local time.

## How To Run
```bash
python3 -m http.server 5500
```

Open:
```text
http://127.0.0.1:5500/
```

## Sprite Pipeline
Regenerate production atlases:
```bash
node scripts/slice-sprites.mjs
```

Keep intermediate frame PNGs for inspection:
```bash
KEEP_SPRITE_FRAMES=1 node scripts/slice-sprites.mjs
```

## Manual Tests Passed
- Test 1: Load without hash creates a default future meeting and serializes `at` and `ct`.
- Test 2: Reload preserves `ct`.
- Test 3: Meeting 2 days away with `ct=now` starts characters near the outer positions.
- Test 4: Simulated halfway journey moves both characters toward center in sync.
- Test 5: Sprite mode renders one frame per participant, not a full sheet.
- Test 6: Bruno sprite is not cropped in the runtime frame path and aligns to Alice baseline.
- Test 7: Edit opens, smooth-scrolls to the form, and focuses the title input.
- Test 8: Bruno timezone changes to `Asia/Tokyo`, local time updates, hash updates.
- Test 9: Editing Alice time updates UTC and Bruno.
- Test 10: Editing UTC time updates Alice and Bruno.
- Test 11: Save closes edit mode and keeps a valid hash with `ct`.
- Test 12: Cancel restores previous state and previous hash.
- Test 13: Copy Link includes `ct` and current state.
- Test 14: Mobile/narrow viewport remains usable.

## Verification Commands
- `node --check script.js`: passed.
- `node scripts/slice-sprites.mjs`: passed.
- `curl -I http://127.0.0.1:5500/`: passed with HTTP 200.
- Headless Chromium visual screenshot: passed smoke check.
- Puppeteer regression suite covering all manual tests above: passed.

## Known Limitations
- DST ambiguous-time disambiguation UI is not implemented; earliest matching instant is selected.
- The ChatGPT-generated source sprites are imperfect, so the slicer includes production repair rules for cropped male reaching frames.
- Calendar integration, recurring meetings, authentication, and more than two participants remain out of scope.

## Recommended Next Steps
- Add a committed Playwright test file for CI if this project will be maintained long-term.
- Replace generated source sprites with professionally trimmed transparent frame assets when available.
