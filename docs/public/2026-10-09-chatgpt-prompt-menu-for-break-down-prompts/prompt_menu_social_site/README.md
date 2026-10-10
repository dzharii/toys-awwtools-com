# Prompt Menu: static social preview reference

This folder can be deployed directly as the root of a static website.
`index.html` has an intentionally empty `<body>` and only metadata in `<head>`.

## Before deployment

Replace every occurrence of `https://example.com/` in `index.html` with your public HTTPS URL, retaining the filenames. Social crawlers need publicly reachable absolute image URLs; local file URLs and relative URLs are not sufficient for reliable preview crawling.

## Assets

| File | Dimensions | Intended use |
| --- | --- | --- |
| `og-1200x630.png` | 1200 x 630 | Open Graph: Facebook, Telegram, LinkedIn, Discord, Slack, etc. (default) |
| `x-1200x600.png` | 1200 x 600 | X/Twitter large summary card |
| `linkedin-1200x627.png` | 1200 x 627 | LinkedIn-specific export or alternate OG image |
| `square-1200x1200.png` | 1200 x 1200 | Square posting / alternate use (not referenced in metadata) |
| `alternate-og-1200x630.png` | 1200 x 630 | Alternate generated Open Graph variation |

LinkedIn uses `og:image`; there is no portable LinkedIn-specific `meta` image override. Therefore `index.html` intentionally uses `og-1200x630.png` as the shared OG image. To choose the LinkedIn-specific artwork as the shared image, change both `og:image` and `og:image:secure_url`, and set `og:image:height` to `627`.

Actual rendering and caching behavior varies between platforms. Once deployed, inspect the public page with sharing debuggers or post inspectors.
