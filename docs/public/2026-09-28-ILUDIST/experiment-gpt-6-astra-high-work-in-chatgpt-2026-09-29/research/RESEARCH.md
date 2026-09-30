# A00 / Research scope and evidence

ILUD helps people carry out an everyday task with less unwanted generated content or algorithmic intervention. It is not an AI detector and does not certify entire companies or websites as AI-free.

Research was conducted on September 29, 2026, using primary help pages, project websites, developer-published extension listings, and indexed extracts of those sources. Search retrieval was used to discover and compare options, then the catalogue retained source URLs and narrow claims. Some publisher pages blocked direct retrieval but exposed useful primary-source search extracts. No signed-in account was inspected and no external fix was executed end to end.

The catalogue distinguishes a source review from a successful reproduction. Every entry has `lastTested: null`. The public labels are Documented, Unofficial shortcut, Review due, or Marked for review. There are no invented usage statistics, popularity rankings, efficacy percentages, or recently-verified badges.

## B00 / Coverage and inclusion decisions

The 40 entries cover ordinary search, social feeds, writing, imagery, shopping research, browsing, video, communication, productivity, news, weather, maps, travel, translation, books, reference material, utilities, and learning. Six broad visual groups keep the reference designs understandable; the full catalogue also exposes the narrower task categories.

| Need | Included approach | Important boundary |
| --- | --- | --- |
| Ordinary search links | Google Web mode, DuckDuckGo No-AI, independent Mojeek results | A result page can still link to AI-written pages. |
| Fewer recommended posts | Reddit preferences, Instagram Following, Mastodon | Feed control cannot establish authorship. |
| Less generated writing | Gmail and Docs suggestion settings, Office and Outlook Copilot controls, LibreOffice | Settings are specific to an app, account, device, or version. |
| Original visual material | Unsplash policy, institutional collections, Flickr Commons | A policy or archive record is stronger provenance, not infallible detection. |
| Fewer synthetic images | DuckDuckGo image filtering, Pinterest controls | Filters are incomplete and can make mistakes. |
| Intentional shopping | Web-result product research, bookseller lists, written repair guides, food-label records | No unsupported claim that a marketplace, review, or product is AI-free. |
| Browser and device agency | Firefox AI Controls, iPhone Intelligence and notification controls, Safari Reader | A web page cannot silently change protected browser or OS settings. |
| Quieter video | YouTube autoplay/history guidance, Unhook | History deletion is a separate user choice; extensions do not modify native apps. |
| Chosen news | NetNewsWire and Feeder subscriptions | Feed availability and content remain the publisher's responsibility. |
| Everyday information | NWS, OpenStreetMap, Organic Maps, Wikivoyage | Forecasting and routing still use computation; current local conditions need current sources. |
| Language and learning | WordReference, Apertium, Gutenberg, OpenStax | Rule-based translation remains machine translation; published material still needs context. |

The catalogue does not attach an affiliate tag or commercial incentive to outgoing links. It links to official pages or recognizable source destinations, not arbitrary download mirrors.

## C00 / Mechanisms worth preserving

Google documents its Web filter as a way to show text links without AI Overviews. The `udm=14` URL shortcut is retained because it can prepare that view for a query. The shortcut is labeled unofficial, with the manual Web selection as its fallback. Documentation for the view is not treated as a guarantee about that parameter's future behavior.

Sources: https://support.google.com/websearch/answer/14901683?hl=en and https://udm14.org/ .

DuckDuckGo documents a dedicated No-AI domain. ILUD uses that destination rather than relying on a user's persistent cookies. Its image-search entry also directs users to check provenance, because filtering cannot guarantee that all remaining images were made by people.

Sources: https://duckduckgo.com/duckduckgo-help-pages/ai-features/about-noaiduckduckgocom and https://safe.duckduckgo.com/duckduckgo-help-pages/results/how-to-filter-out-ai-images-in-duckduckgo-search-results .

Native controls are preferable when their scope matches the goal. Research found separate desktop Firefox and Android Firefox controls, as well as separate Word and Outlook Copilot settings. These are separate entries because their instructions and device scope differ.

Sources: https://support.mozilla.org/en-US/kb/firefox-ai-controls , https://support.mozilla.org/en-US/kb/android-ai-controls , and https://support.microsoft.com/en-gb/privacy/turn-off-copilot-in-microsoft-365-apps .

## D00 / Considered but not promoted as dependable fixes

| Technique | Decision and reason |
| --- | --- |
| The exact `-хуй` Google suffix | Retained here as an explicit research question, not silently inserted into user queries. The retrieved evidence did not establish reproducibility for that exact token. Its vulgarity was not the exclusion criterion. |
| General profanity and `-ai` suffixes | First-person reports describe success and failure. Query modification can alter the result set. Without a current reproduction matrix, this is weaker than the documented Web view. |
| Treating a search date cutoff as an AI filter | Rejected as a guarantee. Indexed dates can be misleading and it excludes useful recent work. |
| Claiming an extension detects every synthetic image or video | Rejected. Hiding an interface element is not content-authorship detection. |
| A universal switch to remove AI from Amazon, Google, Meta, or all mobile apps | Not supported by the evidence collected. The catalogue describes specific controls and alternatives instead. |
| Unvetted alternate front ends and rotating public proxy instances | Not included merely to increase coverage. Availability, operator trust, and account behavior need their own review. |
| Disabling broad connected experiences to remove a single feature | Not the default recommendation where a narrower supported toggle exists. Broader switches can affect unrelated functionality. |

Primary firsthand reports considered for the profanity question include https://www.reddit.com/r/google/comments/1jotems/if_you_are_sick_of_ai_overview_just_add_fuck_to/ and the contrary report https://www.reddit.com/r/antiai/comments/1tr536z/adding_ai_or_swears_in_searches_not_working/ . They are evidence of reports, not controlled confirmation. No forum text is reproduced in this delivery.

## E00 / Maintaining the catalogue

Update the authoritative entry in `authoring/make_catalog.py`. Read its source again, check the precise device/account/region scope, inspect any new permissions or pricing, and record the review date. To record an actual successful test, add the device, browser version, account conditions, reproduction steps, observed result, and date to the research notes before replacing `lastTested: null`.

Retest unofficial query shortcuts separately from the underlying documented feature. A changing URL parameter does not automatically invalidate its manual fallback. Keep a record when a mechanism is retired rather than silently converting an unsuccessful check into a verified label.

The 90-day review interval is an editorial maintenance choice, not a guarantee that a feature survives for 90 days. User review flags are local hints only. This static delivery has no unattended update job and no background link checker.

## F00 / Validation limits

There was no visual rendering or end-to-end external-service validation. Mobile interaction behavior was implemented from documented browser capabilities and defensive fallbacks. The limited packaging checks are described in `VALIDATION.md`. The catalogue's usefulness should be evaluated separately from the visual references and separately from service availability.
