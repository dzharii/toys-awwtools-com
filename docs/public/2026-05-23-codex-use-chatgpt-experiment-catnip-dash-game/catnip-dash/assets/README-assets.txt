Catnip Dash local asset notes

All gameplay atlases in this folder are local original SVG assets created for this prototype:

- cat-atlas.png: selected ChatGPT-generated raster cat atlas, normalized with ImageMagick to a 4 x 3 grid of 96 px frames.
- cat-atlas-selected-source.png: uncleaned selected source atlas before background transparency processing.
- cat-atlas.svg: original developer-authored prototype cat atlas.
- cat-frames/: individual 96 x 96 PNG frame crops extracted from cat-atlas.png with ImageMagick.
- generated-atlas-candidates/: ten ChatGPT-generated raster atlas candidates and normalized comparison files.
- obstacles-atlas.svg: 5 x 1 grid of 96 px obstacle frames.
- environment-atlas.svg: 4 x 4 grid of 128 px environment frames.
- ui-atlas.svg: small optional UI icons.
- reference-cat.png: local generated cat image copied from the project root for visual reference.

The runtime uses the SVG atlases directly with Canvas drawImage. No external network assets, fonts, CDNs, or dependencies are required.
