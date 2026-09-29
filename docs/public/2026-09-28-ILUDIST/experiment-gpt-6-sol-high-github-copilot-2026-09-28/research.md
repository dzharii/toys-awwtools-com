# Research notes and maintenance ledger

**Source review: 2026-09-28.** The 37 published routes span search, social feeds, images, writing, video/music and everyday needs (weather, maps, travel, translation, news, books, shopping, email and reference). Each route's `source`, `method`, `checked`, `platform`, `steps` and `caveat` fields are in `shared\catalog.js`. They are copied into each app so every app works alone.

The strongest direct remedy is [DuckDuckGo's documented no-AI domain](https://duckduckgo.com/duckduckgo-help-pages/ai-features/about-noaiduckduckgocom), which says it turns off its AI features and filters generated images *as best it can*. Google's [Web filter](https://blog.google/products/search/google-search-update-may-2024/) selects web links but is **not** an official permanent off switch for AI across Google products; results, account behavior and region can vary. The direct `udm=14` URL opens that view, but should be retested when Google changes its interface. Neither `-хуй`, `-AI` nor other negative keywords are presented as a reliable, universal way to suppress AI Overviews: an anecdotal absence on one query does not establish repeatability across languages, accounts and dates. No third-party search frontend is recommended as though it were guaranteed to remain available.

Other high-value sources include [Mozilla AI Controls](https://support.mozilla.org/en-US/kb/firefox-ai-controls), [YouTube autoplay help](https://support.google.com/youtube/answer/6327615?hl=en), [YouTube history controls](https://support.google.com/youtube/answer/95725?hl=en), [OpenStreetMap](https://www.openstreetmap.org/about), [Apertium](https://wiki.apertium.org/wiki/Main_Page) and [Project Gutenberg](https://www.gutenberg.org/about/). A setting on one platform never implies that other apps or websites stop generating content. Alternatives are honestly labeled as different tools, not as modifications to a familiar service. A sourced listing's human authorship is never guaranteed merely by its category or platform.

Mobile implementation follows [MDN touch-action guidance](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action) to preserve vertical scrolling while allowing horizontal page gestures, [MDN reduced-motion guidance](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion), and [MDN Web Audio best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices). Audio is initialized only by the dial's user-initiated sound control, never by autoplay. Category selection always has a button alternative to dragging.

Social previews are original 1200 × 630 JPEG compositions. The metadata uses `og:image` with an absolute URL and `twitter:card=summary_large_image`; current platforms may crop or cache images differently. The reference PNG inside each app is the supplied creative reference, **not** the image shown as the finished app in the collection.

## Recheck protocol

1. Open the source and inspect the exact feature and current navigation.
2. Test direct search links with and without a query on mobile and desktop; test any affected setting in a representative current account when possible.
3. Update the route's `checked` field only to describe the verification actually performed. A documentation review does not equal an account-level live test.
4. If a source disappears, the path changes or reliability becomes uncertain, revise the caveat or retire the route instead of silently redirecting to a different product.
5. Rebuild copies, run browser checks, capture screenshots and regenerate the archive.
