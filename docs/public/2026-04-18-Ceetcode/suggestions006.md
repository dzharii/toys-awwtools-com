2026-04-18

A00. social-media-assets-change-request.md

# Social Media Assets and Metadata Change Request

## A00. Purpose

This document defines a focused change request for Codex. The goal is to integrate the prepared logo assets into the website as social-preview media and favicon assets, convert them into the required output formats, place them in the correct output locations, and update the HTML metadata so the website presents correctly in link previews and browser tabs.

Codex should treat this as an implementation task, not just a documentation task. Codex should inspect the existing project, use the provided source images, generate the required derived assets, update the application metadata, and verify the result.

## B00. Source assets

The prepared source images already exist and should be used as the input for this task.

Source files:

`draft-logos/2026-04-18-cc-social-media-logo.png`

`draft-logos/2026-04-18-cc-favicon.png`

Codex should read these files, inspect them, verify that they are usable, and use them as the source material for generating the final site assets.

Codex should not assume the outputs are already correct just because the files exist. It should validate dimensions, visual fit, cropping behavior, and suitability for their intended use.

## C00. Deployment base URL

The deployed website base URL is:

`https://toys.awwtools.com/public/2026-04-18-Ceetcode/dist/`

Codex should use this base URL when constructing absolute social-preview URLs in metadata. Do not leave placeholder domains. Do not leave relative URLs for social preview metadata if absolute URLs can be used.

## D00. Required outcomes

Codex must complete all of the following:

Use the provided social-media logo image as the basis for the final Open Graph and social preview image.

Use the provided favicon source image as the basis for favicon and related icon outputs.

Convert the provided source images into the required web-ready formats and sizes.

Place the generated files into the correct project-owned locations so they are included in the built static site.

Update the website metadata in the HTML entry point so social platforms and browsers can discover the correct assets.

Replace earlier placeholder or draft descriptions with the approved concise product description.

Verify that the resulting metadata and asset files are coherent, correctly linked, and suitable for deployment.

## E00. Description text to use

Codex should use the following concise product description unless the codebase structure requires minor formatting adjustments:

`Practice C99 in the browser with built-in problems, fast runs, and clear feedback.`

Codex should use this text for the standard page description and for social metadata descriptions where appropriate.

Codex should use the following title text unless a slightly different title pattern is already established consistently in the project:

`CeeTCode - C99 in the browser`

Codex should use best judgment to preserve consistency if the project already has a title strategy, but it should not reintroduce references to other platforms or comparative wording.

## F00. Social metadata requirements

Codex must update the main HTML entry point or equivalent generated head metadata so the site includes correct social-preview tags.

At minimum, ensure the following metadata is present and correct:

Standard page description.

Open Graph type.

Open Graph site name.

Open Graph title.

Open Graph description.

Open Graph URL.

Open Graph image.

Open Graph image width.

Open Graph image height.

Open Graph image alt text.

Twitter card type.

Twitter title.

Twitter description.

Twitter image.

Codex should use the deployed base URL and the final generated asset path to build absolute URLs for the social preview image.

Codex should use a clear image alt text such as:

`CeeTCode logo on a dark background`

Codex may refine the wording slightly if needed, but it should remain simple and accurate.

## G00. Favicon and icon requirements

Codex must generate and wire up browser icon assets based on the favicon source image.

At minimum, generate:

A multi-size `favicon.ico`

A `favicon-32.png`

A `favicon-16.png`

If appropriate, also generate:

A `favicon-64.png`

A `favicon-128.png`

An `apple-touch-icon.png`

Codex should determine the best final set based on current project structure and common deployment practice, but the minimum browser favicon set must be present.

Codex must update the HTML head so the correct favicon and icon links are present.

## H00. Asset generation and tooling

Codex may use ImageMagick for image conversion and resizing. If ImageMagick is not available, Codex may install it. It is acceptable to use system package management tools if needed.

Codex should inspect the source images first and choose appropriate conversion commands based on the actual dimensions and visual composition.

Codex should ensure the social-preview image is suitable for chat and social link previews. A typical target is a 1200x630 image. If the provided source image is already suitable, Codex may preserve it directly or normalize it. If it needs resizing or padding adjustment, Codex should perform that work.

Codex should ensure the favicon source is converted into crisp small-size outputs. It should verify that the result remains readable at small sizes and does not become muddy or poorly cropped.

Codex should use best judgment for resampling and conversion settings so the icon outputs remain sharp.

## I00. File placement requirements

Codex should place generated assets in stable project-owned locations that are appropriate for the static build output.

The project should not depend on the `draft-logos/` folder at runtime. That folder is the source storage location, not the final public asset location.

Codex should copy or generate final public assets into the correct source or public directory used by the project build system so they appear in the built `dist` output.

Codex should inspect the repository structure and choose the correct location according to the existing build approach.

Codex should keep naming clear and conventional. Examples of acceptable final naming include:

`social/og-image.png`

`favicon.ico`

`favicon-32.png`

`favicon-16.png`

`apple-touch-icon.png`

If the project uses another public-assets convention, Codex may adapt, but the final metadata must point to the actual deployed asset locations.

## J00. Verification requirements

Codex must verify the following before considering the change complete.

The source logo files exist and can be read.

The generated favicon assets exist and are in the expected sizes.

The generated social image exists and is suitable for preview use.

The HTML metadata points to the correct asset locations.

The metadata uses the deployed base URL rather than placeholders.

The description text is updated to the approved concise wording.

The title text is updated to the approved concise wording or a consistent equivalent.

The build output contains the generated assets.

The generated URLs resolve correctly in the built site structure.

The favicon renders correctly in a browser tab.

The social-preview image is correctly referenced in metadata.

If practical, Codex should also inspect the final built HTML and asset paths directly to confirm correctness.

## K00. Quality expectations

Codex should not treat this as a blind file-copy task. It should review the images and confirm they fit their intended roles.

The social-preview image should look centered, readable, and clean in preview contexts.

The favicon outputs should remain recognizable at small sizes.

The metadata should be concise, professional, and not overloaded.

The result should feel production-ready.

## L00. Directions to Codex

Use the provided files in `draft-logos/` as the source assets.

Inspect the project structure to determine the correct public asset locations.

Use ImageMagick if needed to generate the required sizes and formats.

Update the HTML metadata and icon links.

Use the deployed base URL exactly as provided for absolute social metadata URLs.

Use the approved concise product description.

Verify the final output carefully.

Use your best judgment to resolve project-structure ambiguity, naming decisions, and any minor asset-processing adjustments needed to produce a clean final result.
