# ILUDIST

Ten independent interpretations of ILUD: practical ways to use everyday digital tools with less unwanted AI. The collection covers 31 source-reviewed remedies across 12 activities. It does not claim that any service or filter eliminates all AI.

Open `index.html` through a static HTTP server. Every numbered folder is also a complete, independently publishable site.

**Proudly made by OpenAI GPT-6 Astra, powered by Microsoft GitHub Copilot.** I am GPT-6 Astra, the OpenAI model that researched, designed, implemented and refined this collection in GitHub Copilot CLI under the project owner's direction. Each application and the parent catalogue carry a small maker's mark at the lower-right end of the page: a one-time power-up animation, no fixed overlay, and no animation under reduced-motion preferences. Open the mark for the full introduction.

| Application | Primary interaction |
|---|---|
| `01-folio` - The Folio | Turn and swipe layered papers; indexed subjects |
| `02-dial` - The Instrument | Rotate a brass dial with detents, momentum and keyboard control |
| `03-atlas` - The Quiet Atlas | Explore two island charts; bounded pan and zoom |
| `04-routes` - The Wayfinder | Follow approach-based route lines and departure tickets |
| `05-journal` - The Quiet Journal | Turn editorial chapters with a marginal index |
| `06-lens` - The Clearer Lens | Move a before/after seam across explicitly illustrated examples |
| `07-guide` - The Lantern Guide | Follow a concern/activity decision tree |
| `08-cabinet` - The Useful Cabinet | Lift tools, open a drawer and pin saved remedies |
| `09-doors` - The Three Doors | Open architectural rooms organized by approach |
| `10-current` - The Quiet Current | Carry a lantern through a spatial network of activities |

## Run

Node.js 20 or later is sufficient to serve the project; serving has no package dependencies:

```powershell
node tools\server.mjs
```

Open `http://127.0.0.1:4173`. Do not use `file://`: browsers restrict local module and JSON loading. Any ordinary static host works. There is no backend, build requirement, account system, analytics, permission request or third-party runtime fetch.

## Develop and validate

```powershell
npm ci
npx playwright install chromium webkit
npm run check
npm test
```

Run a single application with `$env:APP='02-dial'; npm test`. Remove the variable with `Remove-Item Env:APP` before a full collection run. Tests exercise Chromium desktop, Chromium phone and WebKit phone emulation, not physical iPhones or live signed-in service accounts.

The factual master is `research\catalogue.json`; the editorial decisions and source-access limitations are in `research\README.md`. Each application has its own copy of that knowledge and its own interaction code and artwork. Common low-level search, detail, storage and action utilities are copied from `tools\runtime`, not imported across applications.

After a substantive source review, update the master and copy it to each release:

```powershell
node tools\prepare.mjs 01-folio --data-only
```

Repeat for the other numbered folders. Without `--data-only`, preparation refreshes copied runtime utilities, fonts, licenses, reference and metadata as well. It preserves `app.js`, app-specific `style.css` and original artwork. Do not use it to overwrite intentional changes to an individual runtime copy.

With the preview server running, capture a completed application and recreate its designed social images:

```powershell
node tools\publish.mjs 01-folio
node tools\publish-collection.mjs
```

Each application includes full-page phone and desktop JPEG screenshots, 1200x630 Open Graph, 1200x600 X and 1080x1080 square compositions, an original SVG favicon and a 180px Apple icon. These are actual finished screenshots, not substituted reference images.

`node tools\credit.mjs` refreshes the eleven local maker badges without modifying application behavior. Preparation also preserves that credit when regenerating a numbered application.

## Earlier attempts

The parent catalogue links two earlier runs: a GitHub Copilot run and a ChatGPT-workspace run, both attributed by the owner to "GPT-6 Soul" (their stored directory names use `gpt-6-sol`). The owner described both as unsuccessful because the delivered visual richness and completeness fell short of the approved references.

The short executive summaries are explicitly the owner's assessment, not a technical audit: archived contents were not inspected, and individual missing features, engineering faults or comparative model rankings are not invented. This release's documented response is sequential completion, original artwork, distinct functional metaphors, sourced remedies, end-to-end actions, accessibility alternatives, finished publishing assets and independent archive operation. The archive links use the public deployment address and are not bundled or verified here.

## Publish

Upload this directory, or upload any single numbered directory on its own. Keep that directory's local assets, catalogue, CSS and JavaScript together. There are no sibling runtime dependencies.

Canonical and social URLs target `https://toys.awwtools.com/public/2026-09-28-ILUDIST/`, matching the repository's `docs\CNAME`. If publishing elsewhere, change the origin/path in `tools\prepare.mjs` and root `index.html`, regenerate the metadata and upload the referenced JPEG assets. URLs inside each app remain relative; static deployment works at either a root or a subdirectory.

## Release archive

```powershell
npm run package
npm run verify:archive
```

This checks the deliverable and writes `ILUDIST-2026-09-28.zip` and its SHA-256 file. Verification serves the archive's contents directly, without workspace assets, and opens each application and its remedies in a browser. The archive contains the requested `2026-09-28\Ilude\` tree, including all ten apps, original supplied references, root catalogue, research, source, local fonts/licenses, tests and reproduction tools. It excludes dependencies, test output, ZIPs and all `experiment-*` directories. The working applications live directly beside `AGENTS.md` as required by the local brief.

## Trust, privacy and accessibility

Dates mean **source-reviewed**, not independently live-tested in every region, account and device. Source review becomes visibly due after 90 days. Every remedy explains its limitations; the comparison lens is explicitly illustrative. ILUD opens services or instructions, never pretends to change another application's settings.

Searches within ILUD stay in the browser. Query text goes to the named external service only when the user opens prepared results. Saved fixes, recent choices and sound preferences are separate browser-local state for each interpretation. About includes a two-step local-data clearing control. No personal data is requested.

Native buttons, semantic dialogs, keyboard alternatives, visible focus, reduced-motion support and optional gesture-activated sound accompany the unusual interfaces. Audio is off by default. Clipboard, storage and catalogue errors are surfaced rather than concealed.

## Artwork and fonts

Interface illustrations, icons, terrain, instruments, architecture and celestial paths are original CSS/SVG work created for this implementation. The supplied reference images are retained as design-direction material; no reference is used as an application's interface background. Their inclusion does not confer any additional rights beyond those held by the project owner.

Cormorant Garamond, Cinzel and UnifrakturMaguntia are served locally with their SIL Open Font License files. External service names identify destinations; no affiliation is implied.
