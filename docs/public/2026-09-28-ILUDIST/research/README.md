# Research and editorial policy

Reviewed 28 September 2026. The catalogue is an outcome-oriented selection of 31 remedies across 12 everyday activities, not a list of services certified to contain no AI.

`catalogue.json` is the factual master. Every entry has sources, an action, compatibility, cost, steps, mechanism, and limitations. Each application receives its own copy. The interface says **source-reviewed**, never **live verified**: public help pages and public destination pages were researched, but signed-in behavior, all regions, and physical devices were not tested. An entry becomes visibly due for review after 90 days.

## Decisions grounded in the sources

- Google's own [AI Overview documentation](https://support.google.com/websearch/answer/14901683?hl=en) says the Web filter shows text links without Overviews. The prepared action uses `udm=14`, with a manual Web-filter fallback.
- DuckDuckGo's [no-AI documentation](https://duckduckgo.com/duckduckgo-help-pages/ai-features/about-noaiduckduckgocom) confirms its alternate address. Its [image-filter explanation](https://duckduckgo.com/duckduckgo-help-pages/results/how-to-filter-out-ai-images-in-duckduckgo-search-results) explicitly says the underlying blocklists are incomplete.
- [Microsoft's documentation](https://support.microsoft.com/en-us/privacy/turn-off-copilot-in-microsoft-365-apps) distinguishes Word's device-specific desktop checkbox from Outlook's account-level toggle and excludes work/school accounts. The catalogue preserves those restrictions.
- [Wikimedia Commons](https://commons.wikimedia.org/wiki/Commons:AI-generated_media) allows some generated media. It is offered for provenance, not advertised as human-only.
- [Instagram](https://about.instagram.com/blog/announcements/favorites-and-following) documents chronological views. A chronological feed does not filter synthetic posts.
- [YouTube](https://support.google.com/youtube/answer/13339776?hl=en) documents preferred languages and per-video audio selection. No universal viewer-side auto-dubbing off switch is invented.
- Translation, weather modeling, recommendation systems, and generative AI are not interchangeable. Alternative entries promise a task-focused interface, not the absence of every machine-learning process.

## Rejected or qualified ideas

The `-хуй` search exclusion was investigated, along with `-AI` and English profanity variants. Reporting describes an unstable interaction with generated-answer filtering, not a guaranteed setting. No reproducible cross-query, regional, or device evidence was established here. It is omitted in favor of the documented Web mode, not because the text is vulgar. [Independent reporting](https://www.marceldigital.com/blog/the-surprisingly-simple-trick-to-ditch-google-s-ai-overviews) is evidence of the claim, not validation of the mechanism.

No invented Amazon no-AI parameter, universal Meta AI switch, guaranteed YouTube Shorts removal, or human-only Etsy filter is included. Etsy permits seller-prompted AI work. AI detection is not promised.

Mozilla's current AI Controls article was indexed but its full page did not render in the research fetch; that entry explicitly discloses the weaker source access. Museum sites returned access errors and were not used to claim a current museum search workflow. Some public sites required scripts; their homepages establish a resource's purpose, not a site-wide ban on AI.

Etsy's policy page returned an access error during retrieval. Search-index evidence and policy reporting establish that seller-prompted AI creations are permitted; this is not a direct end-to-end verification of the policy interface. The included remedy is to inspect seller process and disclosure, not to trust an invented human-only filter.

## Mobile and publishing research

- [Pointer events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events) and [touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action): pointer capture, cancellation, bounded gestures; ordinary vertical scrolling remains available except inside a dial or map's clearly bounded manipulation surface.
- [Autoplay](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay): audio starts only after explicit opt-in and a user gesture. It is never required.
- [Reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion): eliminate entrance spectacle, inertial settling and path travel when requested.
- [WebKit safe areas](https://webkit.org/blog/7929/designing-websites-for-iphone-x/): viewport-fit=cover and `env(safe-area-inset-*)`; no simulated phone status bars.
- [Native dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog): focus containment and Escape dismissal; every gesture has buttons or native controls.
- [Open Graph](https://ogp.me/) specifies image URL, type, dimensions and alt text, but does not mandate a universal pixel size. We use designed 1200x630 JPEG compositions, 1200x600 X variants, and 1080x1080 square variants. The former X large-card documentation URL redirected to the new developer overview during review; common 1.91:1 and 2:1 rendering guidance was cross-checked against [current consumer guidance](https://opengraphplus.com/consumers/twitter/images). Critical content stays away from crop boundaries. Preview behavior is controlled by each consuming platform.

## Maintenance

Reopen the source, repeat the actual action on the stated platform, correct the entry, and record a new review date only after review. If an action becomes unreliable, withdraw or clearly qualify it rather than leaving a false positive. Update the master and run `node tools/prepare.mjs <folder> --data-only` for each released application to copy revised knowledge. Never silently overwrite app-specific design files.
