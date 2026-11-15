# Feature 005 / Revision 00: implementation and evidence

## Delivered

The root `index.html` is a static editorial guide, with inline CSS, system fonts,
native installation disclosures, and no JavaScript or external runtime assets.
`readme.md` supports the repository preview. The Toys entry and matching RSS item
use the same title, description and project URL; the RSS publication date is
14 November 2026 at noon GMT.

`downloads/anger-relief-toy-v003.zip` contains 29 unchanged files from v003
`dist`, including `manifest.json` at its root. It is an extension-only download.
`downloads/anger-relief-toy-website.zip` is the portable website/project bundle;
it retains all three original version folders, not just the web assets.

## Factual corrections and qualifications

- Enabled catalogs contain 8, 8 and 18 tools. All retain `review-pending`
  status. Deferred candidates are not presented as shipped tools.
- Public releases are 0.0.1, 0.0.2 and 0.0.3; manifests actually report
  0.1.0, 0.2.0 and 0.3.0. Neither source nor binary was relabeled.
- Burn the Page targets one element, despite its name. Celebration Cannon
  also targets an element. Tool groups in the article are editorial groupings,
  not a reproduction of the catalog's category taxonomy.
- The v003 popup still labels its launcher **Open action wheel**, although
  it opens the rotating dial. The article uses that actual label.
- Sound is optional but initially enabled at 20%; it is not silently
  described as off by default. The middle hold, in contrast, is off by default.
- Earlier component results are historical, not rerun or converted into native
  evidence. v001 includes a verification JSON recording 37 passing component
  tests and a blocked browser launch. v002/v003 documentation describes earlier
  checks but their referenced `evidence/003` and `evidence/004` directories are
  absent in the supplied copies. No links to those missing assets were added.
- **Observed existing defect:** after pointer rotation, All tools ignores
  primary clicks. The retained drag-click suppression flag in v003
  `src/ui/wheel.ts` explains this. Keyboard activation works; closing and
  reopening the dial resets the state. This is disclosed beside the usage
  explanation, not hidden by an edited screenshot. Fixing the extension is
  outside this website assignment.

## Screenshot provenance and native browser checks

Playwright **1.61.1**, Node **22.16.0**, and the already-installed
**Chrome for Testing 149.0.7827.55 on Windows**, headless, were used.
No packages or browser binaries were installed. Original untrusted bookmarklets
were not executed. A fresh task-owned persistent profile loaded an extraction
of the delivered extension ZIP, not a modified testing build.

Bun's Windows Playwright launch did not complete; a bounded retry failed with
`launchPersistentContext: Timeout 20000ms exceeded`. The working route bundles
the authored TypeScript runner with Bun and executes it through Node. The
previous Linux socket restriction did not recur.

The browser initially left the shortcut unassigned. The test assigned
Alt+Shift+A through `chrome://extensions/shortcuts` and verified the popup's
display. Headless `page.keyboard.press` did not dispatch the OS accelerator;
that path is not claimed as verified. Instead, the task-owned debugging profile
uses Chromium's `Extensions.triggerAction` on the browser tab target. This
invokes the real browser action and grants normal `activeTab`; it does not add
host permissions. Chromium exposes the real popup as an `other` target, so its
actual packaged controls are operated via Playwright's CDP session. No imitated
popup or page simulator is used.

The successful native journey is recorded in
[`native/result.json`](../evidence/005/native/result.json). It covers:

- Three successive Punch targets, with a measured 640x72 inventory and identical
  button rectangles before, during and after; two successive Text Bomb uses.
- Eighteen distinct dial entries, arrow navigation/Enter selection, pointer
  rotation, the reproduced All tools issue and keyboard recovery.
- Centered catalog, actual search selection, title-bar dragging.
- Flashlight after more than ten seconds, End effect retaining equipment,
  reselecting to restart, Put away and refresh cleanup.
- Real settings opt-in for middle hold, 800ms cancellation, 1.8-second
  stationary completion, and exclusion of an editable field.
- One native Web Audio context, live mute, and zero voices after mute and Put
  away. Playwright mutes output: this is not a listening or sound-comfort test.
- Zero page errors or synthetic host button/form actions during the journey.

Original PNGs and the motion recording are retained under `evidence/005/native`.
The three published figures use seven deterministic **lossless WebP crops**
(including a narrower catalog crop for small screens),
without resizing, generated pixels, retouching or inserted controls. Both lead
panels come from the same dial/inventory frame. The sequence uses identical crop
coordinates on the original first comment. Full before/after PNGs are
pixel-identical. The original tool SVGs come unchanged from v003's generated
catalog. The project-owned fixture and artwork retain their source provenance.

[`image-provenance.json`](../evidence/005/image-provenance.json) records source
hashes, crop rectangles and encoding. Published screenshot files total 95,322
bytes; originals remain separate. The actual popup screenshot is also retained
as evidence but is not an extra main-page figure.

## Website checks

The browser checks passed at 920x720, 1440x900 and 390x844, with both opening
download/install links visible and unobscured, no horizontal overflow, native
disclosure operation, and 34 keyboard focus stops at each size. The primary
download's top edge was 559, 525 and 564 pixels respectively. Header access is
also visible immediately.

Actual Chromium tab zoom was set to 200%: 1440 physical pixels became 720 CSS
pixels, with devicePixelRatio 2. Installation remained reachable without
overflow. No-JavaScript navigation/disclosures/download, local-file image
loading, reduced motion, and expanded print instructions passed. Page requests
were local only, and no page errors occurred.

The article is approximately 1,134 editorial words, excluding tool descriptions,
captions and collapsed instructions. The final HTML and **all** published
images total about 151 kB, well below the 2 MB initial-transfer target.
Every local href, image reference, anchor and downloaded ZIP was checked.
The actual browser download matched the source ZIP's SHA-256.

See [`website/result.json`](../evidence/005/website/result.json) and
[`package-result.json`](../evidence/005/package-result.json). The final
refinement removed distracting partial headings from the lead crops, kept
inventory labels at native size, and provided a readable narrow catalog crop.
An inline-link focus test was corrected to inspect each line's client rectangle
rather than whitespace inside a wrapped link's bounding box. No website defect
was suppressed. Both new TypeScript verification runners pass strict type
checking with the existing compiler; existing Prettier formatted the new files.

At the owner's request, testing was reduced after these checks: the full native
journey and broad browser suite were not repeated merely for formatting and the
last crop refinement. Final artifact integrity and current page captures were
checked instead. No dependency installation or additional browser matrix was
undertaken.

All 680 original input files, including the supplied specification, remain
byte-identical. The extension ZIP has 29 matching files, its manifest at root,
and eighteen effect bundles. The shared index has zero missing local targets
or bad preview targets; its 156 projects match 156 well-formed RSS items.

## Editorial acceptance / K00

| Handoff question                                           | Answer and evidence                                                                                                                                                                       |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Can a new reader explain the extension?                    | **Yes.** The opening explains local visual tools, followed by concrete controls and the complete enabled collection.                                                                      |
| Is the current download immediately visible?               | **Yes.** Header and opening links are unobscured at all three required sizes; measured coordinates are above.                                                                             |
| Do installation steps match the archive?                   | **Yes.** The delivered ZIP extracts with `manifest.json` at root; the separate full-project `v003/dist` path is explicitly distinguished.                                                 |
| Are release labels and manifest values honest?             | **Yes.** 0.0.1-0.0.3 are public labels; 0.1.0-0.3.0 remain the actual manifests.                                                                                                          |
| Are screenshots authentic and correctly labeled?           | **Yes.** Real unchanged v003, synthetic fixture, recorded source PNG hashes, matching crops, no generated UI.                                                                             |
| Are intended scope and actual testing distinguished?       | **Yes.** The article names the exact Windows Chromium build and separates native observations, historical component evidence and remaining release gates.                                 |
| Are older versions understandable independently?           | **Yes.** Three short historical columns explain foundation, persistence and expanded controls without requiring specifications.                                                           |
| Does it read like an article rather than an advertisement? | **Yes, author review.** Restrained serif prose, three explanatory figures, fine rules, concrete limits; no promotional widgets or invented endorsements.                                  |
| Are any controls, links or claims unfinished?              | **No website placeholders.** Local links and downloads resolve. The existing extension dial defect is explicitly disclosed with recovery; full extension release approval is not claimed. |

The mandatory Y-001 through Y-187 self-review is recorded in
[`acceptance.json`](../evidence/005/acceptance.json). This is author verification
of a static website, not independent approval of the extension release.

## Reproduction

Use the existing installed Playwright module; set `NODE_PATH` to its parent
module directory (or `PLAYWRIGHT_MODULE` to the exact `playwright/test` entry).
Set `EXTENSION_PATH` to a clean extraction of the download, and `TEST_PROFILE`
to a fresh disposable profile. Do not point at a personal browser profile.
From the project root:

```powershell
python .\tools\landing-package.py extension
bun build .\tests\landing\native.ts --target=node --outfile=<temporary-native.mjs>
node <temporary-native.mjs>
python .\tools\landing-package.py images
bun build .\tests\landing\website.ts --target=node --outfile=<temporary-website.mjs>
node <temporary-website.mjs>
python .\tools\landing-package.py verify
python .\tools\landing-review.py
python .\tools\landing-package.py website
```

These are development verification commands, not installation requirements.
The website needs no build step. Test servers bind only to loopback and close
with their browser contexts.

## Genuine limits

This assignment does not approve the extension's outstanding release gates.
Branded stable Chrome/Edge, other Chromium products, other operating systems,
native OS shortcut/middle-button behavior, all-effect subjective visual/audio
quality, performance and heap profiling remain outside these observations.
The v003 control defect is preserved and disclosed, not fixed without
authorization. Original versions, specifications and evidence are checked
against the byte hashes captured before packaging.

Installation prose was checked against Google's Hello World/unpacked guide
and Microsoft's sideloading guide, and the real Chromium extension manager.
No branded-browser installation wizard or native directory picker is claimed
as automated.
