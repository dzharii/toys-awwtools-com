# A00 - ILUDIST

Ten standalone static applications interpret one researched guide to a quieter internet. The collection page at `index.html` introduces all ten; each named folder is a complete independent deployable site. The supplied reference image for each design is retained as `reference.jpg` inside that folder.

# B00 - Run and deploy

Serve the `Ilude` directory with any static server, for example `python3 -m http.server 8000` from this directory, and visit `http://localhost:8000/`. There is no runtime build, package installation, account, API key, or backend. To deploy the whole collection, upload this directory unchanged to a static host. To deploy one experience alone, upload only its folder as the site root. Its CSS, JavaScript, assets, and researched data are all local to that folder.

For production social crawlers, set absolute `og:image` and `twitter:image` URLs and add canonical/`og:url` values after a final public domain is assigned. The provided relative image paths work for local navigation and are the only host-dependent metadata. Each experience has its own JPEG social card and SVG favicon.

# C00 - The ten experiences

| Folder | Interpretation | Primary interaction |
| --- | --- | --- |
| `cabinet/` | The Cabinet | Pick a tool from a tactile shelf |
| `sanctuary/` | The Sanctuary | Start with a concern |
| `switchyard/` | The Switchyard | Select a route and station |
| `dial/` | The Dial | Turn or tap a task instrument |
| `portals/` | The Portals | Open an approach door |
| `editorial/` | The Index | Browse an editorial side index |
| `contrast/` | The Difference | Drag a comparison divider |
| `constellation/` | The Constellation | Trace a concern to a task |
| `archipelago/` | The Atlas | Explore task islands |
| `folio/` | The Folio | Swipe or use paper tabs |

Every application can search all 20 routes, open step-by-step guidance, follow an official source, and save routes to its own browser storage. Sound in The Cabinet, The Dial, and The Folio is off until the visitor enables it. Reduced motion and keyboard paths are included.

# D00 - Research and maintenance

`research/catalog.json` is the canonical source. `research/README.md` explains verification and limitations. The checked date is 2026-09-28. A route describes what is achievable, whether it is an off switch, reduction, temporary detour, replacement, or privacy control. It also records a caveat and official documentation link. Recheck the sources before treating a dated step as current.

`tools/build.py N` (Python with Pillow and DejaVu fonts) regenerates implementation number `N` (1 through 10) from the catalog and design templates. It copies the reference, catalog data, and generates the local HTML, CSS, JavaScript, icon, and social card. The generated application files are included and can be edited directly. `tools/capture.py` makes static first-viewport catalog captures from the generated page structure using optional WeasyPrint, PyMuPDF, and Pillow; it is a maintenance utility, not a runtime dependency. The captures are representative static renders. Browser engines can differ in layout and motion.

# E00 - Project hygiene

The ten sites never request location, camera, contacts, or personal account access. Source links open in a new tab with `noopener noreferrer`. Saved fixes remain in the current browser's local storage and are separate per implementation. No telemetry or remote runtime requests are included. The catalog is duplicated intentionally so any child directory can be published in isolation.
