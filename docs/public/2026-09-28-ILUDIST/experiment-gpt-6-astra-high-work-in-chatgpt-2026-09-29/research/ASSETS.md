# A00 / Supplied references

The ten PNG files under `references/` are the user's supplied design references. They are copied without raster modification. They appear only as labeled reference thumbnails in the collection gallery and as reference links. They are not used as fake interactive screenshots.

The supplied-reference mapping, including the order of `1000065902.png` and `1000065901.png`, is preserved in `design-map.json` and the main README.

## B00 / Generated decorative artwork

Three original raster illustrations were generated with the built-in image generation tool for this project. Exact generation prompts are recorded in `ASSET-PROMPTS.txt`.

| Asset | Dimensions | Applications | Purpose |
| --- | --- | --- | --- |
| `cabinet.png` | 1024 x 1536 | Cabinet | Walnut backboard, brass lighting, and a row of physical tools. |
| `atlas.png` | 1024 x 1536 | Island Atlas | A six-island relief map and central island. |
| `landscape.png` | 1536 x 1024 | Guided Compass, Route Map, Pathways | Dark alpine landscape, moon, and distant castle. |

These illustrations are openly disclosed as AI-generated in each app's Info panel. They express the commissioned visual direction; they are not passed off as examples of human-authored catalogue imagery. No image-generation request occurs while someone uses the apps.

Master assets are in `authoring/assets/`. Standalone apps carry their own copies of the assets they need. The images were not used as a substitute for real interface text, controls, or interactions.

## C00 / Code-native visuals

Icons and route geometry are inline SVG. Metal finishes, paper layers, control housings, dividers, and architectural UI framing use CSS. Comparison panels are explicitly labeled illustrative layouts, not live search results or an efficacy measurement. System serif and sans-serif fonts avoid a remote font dependency.

The code license does not assert ownership of the user's references or apply to third-party destination content. Review those materials' rights before redistributing the reference gallery outside this project.
