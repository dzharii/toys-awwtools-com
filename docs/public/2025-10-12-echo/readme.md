# Echo v2 — overview and implementation spec

Date: 2025-10-12

# Purpose

Echo is a single post web page that renders content stored in the URL fragment with transparent compression. It has two modes: compose and view. It uses only index.html, app.css, app.js, and textzip.js. No bundlers. No modules.

# Key Features

- **Transparent Compression**: All data is automatically compressed using BWT+MTF+RLE+HUF pipeline via TextZip
- **Shareable by link only**: Zero server requirements
- **Data privacy by design**: All content stays in the URL fragment
- **No accounts needed**: View and edit without authentication
- **Works offline**: After first load, fully functional offline

# Value

Copy and paste the URL to distribute the post. Compression reduces URL length significantly while maintaining full functionality. Works offline after first load.

# How it will be used

Open with #new to compose. Fill the form. Click Generate link. Share the resulting URL. Anyone who opens it sees the post. Open with #e=... to edit an existing post. Open with #p=... to view a post.

# Specification by example

Scenario: compose a new post
 Given the user opens index.html#new
 When the user enters Name EchoPing, Text Hello world, Theme light, Width 1024, Font 24
 And the user clicks Generate link
 Then the app sets location.hash to #p=
 And Copy Link toast appears
 And the live preview matches the entered values

Scenario: view a post from a link
 Given the URL index.html#p=
 When the app loads
 Then the page shows Name if present
 And the text shows with preserved newlines
 And links are clickable only if they start with https
 And images render only if they use https
 And YouTube renders only if the id is valid

Scenario: edit an existing post
 Given the user has a URL index.html#p=
 When the user clicks Edit
 Then the app navigates to #e=
 And the compose form is prefilled
 When the user changes the text and clicks Generate link
 Then the app updates the URL with a new #p=... value

Scenario: invalid payload
 Given the hash contains #p=not-base64
 When the app decodes the payload
 Then the app shows error Invalid post data in the error area
 And compose mode is shown
 When the user switches to #new
 Then the error area clears

Scenario: fragment length warning
 Given the generated hash length is over 2000
 When the app renders
 Then the app shows warning URL is long; remove media to shorten
 And rendering continues if decode succeeds

Scenario: linkify rules
 Given the text contains [https://example.com](https://example.com/) and [http://insecure.com](http://insecure.com/)
 When the app renders
 Then only [https://example.com](https://example.com/) becomes a link
 And [http://insecure.com](http://insecure.com/) stays as plain text

Scenario: image rules
 Given the images list contains https://site/img.jpg and http://site/img.jpg
 When the app renders
 Then only the https image appears
 And the error area notes 1 image blocked for insecure URL

Scenario: YouTube rules
 Given the user enters https://youtu.be/dQw4w9WgXcQ
 When the app parses the URL
 Then y is set to dQw4w9WgXcQ
 And the player uses https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ

Scenario: theme
 Given c is dark
 When the app renders
 Then the page uses the dark color set
 When the user toggles theme
 Then c updates and the page re-renders

Scenario: responsive readability
 Given w is 1024 and f is 24
 When the app renders on desktop
 Then content width does not exceed 1024
 And base font size is at least 24 and scales with clamp for smaller screens

Scenario: copy link
 Given the user is viewing a post
 When the user clicks Copy Link
 Then the current URL is placed in the clipboard
 And a toast confirms Copied

# Examples

Example JSON

```json
{"v":1,"n":"Echo","t":"Hello, world.\nLinks are https only.","i":["https://example.com/pic.jpg"],"y":"dQw4w9WgXcQ","s":"2025-10-12T10:15:00Z","c":"light","w":1024,"f":24}
```

Example view URL shape (compressed)

```
index.html#p=<compressed-token>
```

The compressed token format is: `base64(headerJSON).base64(payloadBytes)`

Where:
- headerJSON contains TextZip metadata: `{ v, alg, n, pi, hbits, rleLen }`
- payloadBytes is the compressed data using BWT+MTF+RLE+HUF pipeline
- The entire token is made URL-safe by replacing `+` with `-`, `/` with `_`, and trimming `=`

Example compose URL

```
index.html#new
```

# Implementation specification: Echo v2

## Files

- index.html - Main HTML structure
- app.css - Styles
- app.js - Application logic
- textzip.js - Compression module (BWT+MTF+RLE+HUF)

## Compression Architecture

Echo v2 uses transparent compression via the TextZip module:

1. **Encoding pipeline**: JSON → UTF-8 bytes → base64 → TextZip.compress() → URL-safe token
2. **Decoding pipeline**: URL-safe token → TextZip.decompress() → base64 → UTF-8 bytes → JSON

### TextZip Algorithm

The compression uses a four-stage pipeline:

1. **BWT (Burrows-Wheeler Transform)**: Reorders bytes to group similar characters together
2. **MTF (Move-To-Front)**: Converts repeated characters to small indices
3. **RLE0 (Run-Length Encoding)**: Compresses runs of zero indices efficiently
4. **Huffman Coding**: Variable-length encoding based on frequency

Benefits:
- Significantly reduces URL length for typical posts
- Completely transparent to the user
- Deterministic and reversible
- No external dependencies

## Modes

- View mode for reading a single post.
- Compose mode for creating or editing a post.

## URL fragments

- View: #p=
- Compose new: #new
- Edit: #e=

## Data model

- v: integer schema version. Use 1.
- n: author display name. Optional string.
- t: text content. Required string.
- i: image URLs. Optional array of strings.
- y: YouTube video id. Optional string.
- s: ISO 8601 timestamp. Optional string.
- c: theme code. Optional string. Values: light or dark.
- w: max content width in px. Optional integer. Default 1024.
- f: base font size in px. Optional integer. Default 24.

## Encoding

- Compress using TextZip: JSON.stringify → UTF-8 bytes → base64 → TextZip.compress() → compressed token
- Make URL-safe: replace + with -, / with _, trim =
- Decompress using TextZip: URL-safe token → restore characters → TextZip.decompress() → base64 → UTF-8 bytes → JSON.parse
- TextZip token format: `base64(headerJSON).base64(payloadBytes)`
- Header contains: `{ v: 1, alg: "BWT+MTF+RLE+HUF", n, pi, hbits, rleLen }`

## Hash parsing

- On load and on hashchange parse location.hash.
- If it starts with #p= then decode and render in View mode.
- If it starts with #e= then decode and load into Compose mode.
- If it is #new or empty or invalid then show Compose mode.

## View rendering

- Page uses a centered container with max width from w or 1024.
- Typography uses f as base. Use CSS clamp for responsive scaling.
- Header shows n if present and s as a relative time with a title holding the ISO time.
- No avatar. No handle.
- Text renders from t. Preserve newlines. Escape HTML. Wrap long words.
- Autolink only https schemes. Convert to  with rel=noopener noreferrer and target=_blank.
- Media block renders after text.
- If one image URL render a responsive image.
- If multiple image URLs render a simple responsive grid.
- If y is present render an iframe to https://www.youtube-nocookie.com/embed/{id} with allowfullscreen.
- Action row has Copy Link, Edit, Theme toggle.
- Copy Link writes location.href to clipboard and shows a transient toast.
- Edit navigates to #e=.
- Theme toggle switches c and re-renders without leaving the page.

## Compose UX

- Two-column layout on wide screens and single-column on small screens.
- Left side is the editor form. Right side is a live preview using the same renderer as View mode.
- Form fields: Name n, Text t, Images i with an input and Add button, YouTube URL mapped to y, Timestamp Now or Custom ISO for s, Theme c radio, Width w number input, Font size f number input.
- Buttons: Generate link, Clear, Load from URL.
- Generate link builds the JSON and sets location.hash to #p=... and shows Copy Link toast.
- Load from URL reads #e payload if present and fills the form.
- No keyboard shortcuts.

## Linkify rules

- Match only https URLs.
- Do not link http, ftp, mailto, javascript, data.
- Do not allow inline HTML in t.

## Media rules

- Images must be https URLs.
- Set loading=lazy and referrerpolicy=no-referrer on images.
- Constrain images with max-height 60vh and object-fit cover.
- Accept YouTube hosts youtube.com or youtu.be only, then extract id. Reject others.

## Error UX

- Do not use alert.
- Show errors in a fixed area below the header.
- Clear the error area when the issue is resolved.
- Error cases include invalid base64, invalid JSON, wrong types, disallowed URL schemes or hosts, and fragment length limit.

## Fragment length limit

- If location.hash length exceeds 2000 characters show a warning in the error area and allow rendering to continue if decoding succeeds.

## Security

- Use textContent for inserting all user strings.
- Validate all URLs. Allow only https for links and images. Allow only the nocookie YouTube embed with a validated id.
- Never set innerHTML from user input.

## Accessibility

- Use semantic elements: header, main, article, time, button.
- Provide aria-labels for buttons.
- Ensure focus styles are visible.
- Maintain WCAG AA contrast.

## Styling

- Font stack: system UI fonts.
- Light theme colors: bg #ffffff, text #111111, muted #666666, border #dddddd.
- Dark theme colors: bg #0f1115, text #e6e6e6, muted #9aa0a6, border #2a2f36.
- Card has 1 px border, 12 px radius, subtle shadow.
- Spacing uses 16 px rhythm. Gap 24 px between major blocks.
- Content width uses w or 1024 with responsive max-width 100vw minus padding.
- Base font size uses f with CSS clamp for readability across breakpoints.

## DOM structure

- Root container id app.
- Error area id err.
- View article id view, hidden by default.
- Compose form id compose, hidden by default.
- Preview area id preview inside compose.

## IDs and classes

- ids: app, err, view, compose, preview.
- classes: btn, field, label, input, grid, image, toast, muted, card.

## Events

- window load initializes router and theme.
- window hashchange routes between modes.
- Form inputs update a local draft object and the live preview.
- Buttons handle generate, clear, and load.

## Minimal feature set

- View a single post from #p.
- Compose a post at #new or empty.
- Edit an existing post via #e.
- Add zero or more https image URLs.
- Add zero or one YouTube video via URL.
- Copy link.
- Light or dark theme.
- Adjustable width and base font size.
