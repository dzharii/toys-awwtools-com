window.ILUD_DATA = [
  {
    id: "duckduckgo-noai", category: "Search", kind: "alternative", symbol: "⌕",
    title: "Search without AI answers", summary: "Open DuckDuckGo's dedicated no-AI search experience.",
    service: "DuckDuckGo", type: "Alternative · direct search", platform: "Web and mobile",
    url: "https://noai.duckduckgo.com/", queryParam: "q", placeholder: "What do you want to search?",
    action: "Search with no-AI DuckDuckGo", tags: ["search", "noai", "plain results", "instant"],
    steps: ["Type a search above, or open the no-AI homepage.", "Search as usual; DuckDuckGo says AI features are off and generated images are filtered by default."],
    caveat: "Filtering generated images is best-effort, not a guarantee that every result was made by a person.",
    method: "DuckDuckGo documents a dedicated noai.duckduckgo.com search experience.",
    source: "https://duckduckgo.com/duckduckgo-help-pages/ai-features/about-noaiduckduckgocom", checked: "2026-09-28"
  },
  {
    id: "google-web", category: "Search", kind: "workaround", symbol: "↗",
    title: "See Google web links first", summary: "Open Google's Web view instead of the default all-results page.",
    service: "Google Search", type: "Alternative view · direct search", platform: "Web and mobile",
    url: "https://www.google.com/search?udm=14", queryParam: "q", placeholder: "Search the web",
    action: "Search Google's Web view", tags: ["google", "web filter", "results", "overview"],
    steps: ["Enter your query here to open the Web results view.", "If the service changes, choose Web in Google's results filters."],
    caveat: "The udm=14 URL is undocumented and may change. Web is a per-search filter, not an account-wide AI-off switch; ads, layout and availability can differ.",
    method: "Google documents the Web filter as showing text-based website links. The direct udm=14 address is a convenient, unofficial way into that view.",
    source: "https://support.google.com/websearch/answer/2466433?hl=en", checked: "2026-09-28"
  },
  {
    id: "ddg-ai-setting", category: "Search", kind: "setting", symbol: "⚙",
    title: "Turn off DuckDuckGo AI answers", summary: "Keep your existing DuckDuckGo search and change its AI preferences.",
    service: "DuckDuckGo", type: "Setting · manual", platform: "Web and mobile",
    url: "https://duckduckgo.com/settings#ai", action: "Open search settings", tags: ["duckduckgo", "search assist", "settings"],
    steps: ["Open DuckDuckGo settings.", "Under AI Features, set Search Assist to Never and adjust the other optional AI features.", "Save your preferences if prompted."],
    caveat: "Setting names and persistence can change; noai.duckduckgo.com is the simpler direct alternative.",
    method: "DuckDuckGo describes its AI features as optional and documents opting out.",
    source: "https://duckduckgo.com/duckduckgo-help-pages/ai-features/opting-out-of-ai", checked: "2026-09-28"
  },
  {
    id: "mojeek", category: "Search", kind: "alternative", symbol: "◌",
    title: "Try an independent search index", summary: "Search the open web with Mojeek's independently crawled results.",
    service: "Mojeek", type: "Alternative · direct search", platform: "Web and mobile",
    url: "https://www.mojeek.com/search", queryParam: "q", placeholder: "Search the independent web",
    action: "Search with Mojeek", tags: ["independent", "plain search", "web"],
    steps: ["Enter your search and open Mojeek's results.", "Compare with your usual search engine when coverage is thin."],
    caveat: "An independent index can return different or fewer results; no search engine can guarantee that every indexed page is human-written.",
    method: "Mojeek describes operating its own search index.",
    source: "https://www.mojeek.com/about", checked: "2026-09-28"
  },
  {
    id: "brave-ai-setting", category: "Search", kind: "setting", symbol: "⚙",
    title: "Switch off Brave's AI answers", summary: "Keep Brave Search but turn off its Answer with AI preference.",
    service: "Brave Search", type: "Setting · manual", platform: "Brave Search web",
    url: "https://search.brave.com/settings", action: "Open Brave Search settings", tags: ["brave", "search", "answers"],
    steps: ["Open Brave Search settings.", "Find Answer with AI and turn it off.", "Check the setting again later if AI answers return."],
    caveat: "Settings can be browser-specific and have been reported to reset. This is not a promise of permanently AI-free results.",
    method: "Brave provides a preference for AI answers in Search settings.",
    source: "https://safe.search.brave.com/help/index", checked: "2026-09-28"
  },
  {
    id: "reddit-feed", category: "Social", kind: "setting", symbol: "♧",
    title: "See fewer suggested Reddit posts", summary: "Turn off recommendations in your Home feed.",
    service: "Reddit", type: "Setting · manual", platform: "Reddit account",
    url: "https://www.reddit.com/settings/preferences", action: "Open Reddit preferences", tags: ["reddit", "home feed", "recommendations"],
    steps: ["Sign in and open Reddit preferences.", "Find the Home feed recommendations option and turn it off.", "Use your joined communities to shape the feed instead."],
    caveat: "This reduces suggested communities, not AI-written posts inside a community. App menus may differ from the website.",
    method: "Reddit provides a user setting for home-feed recommendations.",
    source: "https://support.reddithelp.com/hc/en-us/articles/4402284777364-How-do-I-enable-or-disable-home-feed-recommendations", checked: "2026-09-28"
  },
  {
    id: "reddit-communities", category: "Social", kind: "workaround", symbol: "☷",
    title: "Read communities directly", summary: "Visit the communities you chose instead of the Home feed.",
    service: "Reddit", type: "Direct destination", platform: "Web and mobile",
    url: "https://www.reddit.com/subreddits/mine/", action: "Open your communities", tags: ["reddit", "subreddits", "following"],
    steps: ["Open your communities list.", "Choose a community directly and sort its posts as you prefer."],
    caveat: "You need a Reddit account and joined communities. Posts themselves may still include synthetic content.",
    method: "A direct route to the communities you joined avoids navigating through Home.",
    source: "https://support.reddithelp.com/hc/en-us/articles/204533569-What-are-communities-or-subreddits", checked: "2026-09-28"
  },
  {
    id: "mastodon-following", category: "Social", kind: "alternative", symbol: "✳",
    title: "Follow people, not a suggested feed", summary: "Use Mastodon's Home timeline for posts from accounts you follow.",
    service: "Mastodon", type: "Alternative · community", platform: "Web and mobile",
    url: "https://joinmastodon.org/", action: "Explore Mastodon", tags: ["social", "following", "chronological", "community"],
    steps: ["Choose a server and create an account.", "Follow people you want to hear from.", "Use the Home timeline to see their posts."],
    caveat: "Mastodon is a different social network, not a filter for an existing account; individual posts can still contain generated material.",
    method: "Mastodon documents its followed-account home timeline.",
    source: "https://docs.joinmastodon.org/user/network/", checked: "2026-09-28"
  },
  {
    id: "bluesky-following", category: "Social", kind: "workaround", symbol: "☼",
    title: "See posts from people you follow", summary: "Switch to the Following feed on Bluesky.",
    service: "Bluesky", type: "Feed choice · manual", platform: "Bluesky account",
    url: "https://bsky.app/", action: "Open Bluesky", tags: ["bluesky", "following", "social"],
    steps: ["Open Bluesky and sign in.", "Select the Following feed rather than a discovery or custom feed."],
    caveat: "The Following feed limits recommendations but cannot identify or remove every generated post.",
    method: "Bluesky offers a Following feed alongside other feed choices.",
    source: "https://bsky.social/about/blog/7-27-2023-custom-feeds", checked: "2026-09-28"
  },
  {
    id: "ddg-images", category: "Images", kind: "alternative", symbol: "▣",
    title: "Look for less synthetic imagery", summary: "Search images with DuckDuckGo's no-AI experience.",
    service: "DuckDuckGo Images", type: "Alternative · direct search", platform: "Web and mobile",
    url: "https://noai.duckduckgo.com/?iax=images&ia=images", queryParam: "q", placeholder: "What images do you need?",
    action: "Search no-AI images", tags: ["images", "photos", "illustration", "human-made"],
    steps: ["Type your subject and open image search.", "Check the source and creator of images you may use."],
    caveat: "DuckDuckGo says it filters out as much AI imagery as it can. This is not authentication of authorship or permission to reuse images.",
    method: "DuckDuckGo documents default AI-image filtering on its no-AI subdomain.",
    source: "https://duckduckgo.com/duckduckgo-help-pages/ai-features/about-noaiduckduckgocom", checked: "2026-09-28"
  },
  {
    id: "adobe-stock-filter", category: "Images", kind: "setting", symbol: "⚙",
    title: "Exclude generated stock images", summary: "Use Adobe Stock's generative-AI search filter.",
    service: "Adobe Stock", type: "Search filter · manual", platform: "Web",
    url: "https://stock.adobe.com/", action: "Open Adobe Stock", tags: ["stock", "images", "photography", "filter"],
    steps: ["Search for an image on Adobe Stock.", "Open the filters and find the generative AI option.", "Choose to exclude generative-AI assets and check each asset's details."],
    caveat: "Filter availability and labeling can vary. Asset licensing and whether an image depicts real events are separate questions.",
    method: "Adobe Stock labels generative-AI content and offers controls for search results.",
    source: "https://community.adobe.com/announcements-30/generative-ai-filter-now-available-for-adobe-stock-search-1495373", checked: "2026-09-28"
  },
  {
    id: "commons-images", category: "Images", kind: "alternative", symbol: "◇",
    title: "Find images with source information", summary: "Search Wikimedia Commons and inspect author and license on each file.",
    service: "Wikimedia Commons", type: "Alternative · direct search", platform: "Web and mobile",
    url: "https://commons.wikimedia.org/w/index.php", queryParam: "search", placeholder: "What image are you looking for?",
    action: "Search Wikimedia Commons", tags: ["photos", "illustrations", "attribution", "open"],
    steps: ["Enter a subject to search Commons.", "Open a file page to inspect its author, source and license before reusing it."],
    caveat: "Commons includes many kinds of images, including some generated ones. Attribution metadata is useful evidence, not a guarantee of human authorship.",
    method: "Commons file description pages record source and license information.",
    source: "https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia", checked: "2026-09-28"
  },
  {
    id: "firefox-ai", category: "Writing", kind: "setting", symbol: "⚙",
    title: "Block AI features in Firefox", summary: "Use Firefox's AI Controls to turn off its built-in generative features.",
    service: "Firefox", type: "Setting · manual", platform: "Current Firefox desktop versions",
    url: "https://support.mozilla.org/en-US/kb/firefox-ai-controls", action: "Read Firefox's instructions", tags: ["browser", "writing", "chatbot", "ai controls"],
    steps: ["Open Firefox Settings.", "Find AI Controls and turn on Block AI enhancements, or configure features individually."],
    caveat: "The documented AI Controls panel is for current Firefox desktop versions. It controls Firefox features, not AI inside websites you visit.",
    method: "Mozilla documents a user-facing AI Controls panel.",
    source: "https://blog.mozilla.org/en/firefox/how-to-use-ai-controls/", checked: "2026-09-28"
  },
  {
    id: "word-copilot", category: "Writing", kind: "setting", symbol: "⚙",
    title: "Turn off Copilot in Word", summary: "Disable the Copilot feature in a supported desktop Word app.",
    service: "Microsoft Word", type: "Setting · manual", platform: "Personal Microsoft account · Windows or Mac",
    url: "https://support.microsoft.com/en-us/privacy/turn-off-copilot-in-microsoft-365-apps",
    action: "Read Microsoft's steps", tags: ["office", "word", "documents", "copilot", "writing"],
    steps: ["In desktop Word on Windows, open File → Options → Copilot.", "Clear Enable Copilot, select OK, then restart Word.", "On Mac, use Word → Preferences → Copilot; consult the linked instructions for your version."],
    caveat: "Microsoft says this control requires a personal account and a supported desktop app version. It is unavailable for work/school accounts and Word on iOS, Android or the web.",
    method: "Microsoft documents a separate Enable Copilot checkbox per supported Microsoft 365 desktop app and device.",
    source: "https://support.microsoft.com/en-us/privacy/turn-off-copilot-in-microsoft-365-apps", checked: "2026-09-28"
  },
  {
    id: "libreoffice", category: "Writing", kind: "alternative", symbol: "✎",
    title: "Write without an assistant in the margin", summary: "Use LibreOffice Writer, a full-featured document editor you control.",
    service: "LibreOffice Writer", type: "Alternative · desktop app", platform: "Windows, macOS, Linux",
    url: "https://www.libreoffice.org/discover/writer/", action: "Explore LibreOffice Writer", tags: ["writing", "documents", "offline", "desktop"],
    steps: ["Visit the Writer page and download LibreOffice for your computer.", "Create a document locally and save it in your preferred format."],
    caveat: "This is a desktop application, not a phone editor. It does not remove assistant features from documents opened in other services.",
    method: "LibreOffice presents Writer as its word processor and supports local documents.",
    source: "https://www.libreoffice.org/discover/writer/", checked: "2026-09-28"
  },
  {
    id: "joplin", category: "Writing", kind: "alternative", symbol: "▤",
    title: "Take notes in your own words", summary: "Keep notes in Joplin without a generated-writing workflow.",
    service: "Joplin", type: "Alternative · app", platform: "Desktop and mobile",
    url: "https://joplinapp.org/", action: "Explore Joplin", tags: ["notes", "writing", "productivity", "open source"],
    steps: ["Install Joplin on the device you use for notes.", "Write notes directly and choose your own sync arrangement if needed."],
    caveat: "Installing a new note app takes setup; check any plugins you add separately for AI features.",
    method: "Joplin is an open-source note-taking application.",
    source: "https://joplinapp.org/help/", checked: "2026-09-28"
  },
  {
    id: "firefox-reader", category: "Writing", kind: "workaround", symbol: "▥",
    title: "Read articles without the clutter", summary: "Use Firefox Reader View to focus on the original article.",
    service: "Firefox Reader View", type: "Browser feature · manual", platform: "Firefox on supported pages",
    url: "https://support.mozilla.org/en-US/kb/firefox-reader-view-clutter-free-web-pages", action: "Learn about Reader View", tags: ["read", "articles", "browser", "news"],
    steps: ["Open an article in Firefox.", "Select the Reader View icon when it appears in the address bar."],
    caveat: "Reader View is not available on every page and does not detect whether the article itself was written by AI.",
    method: "Mozilla documents Reader View as a simplified article reading mode.",
    source: "https://support.mozilla.org/en-US/kb/firefox-reader-view-clutter-free-web-pages", checked: "2026-09-28"
  },
  {
    id: "youtube-subscriptions", category: "Video", kind: "workaround", symbol: "▷",
    title: "Watch creators you chose", summary: "Open your YouTube Subscriptions feed instead of Home.",
    service: "YouTube", type: "Direct destination", platform: "YouTube account",
    url: "https://www.youtube.com/feed/subscriptions", action: "Open subscriptions", tags: ["video", "youtube", "creators", "recommendations"],
    steps: ["Sign in to YouTube and subscribe to channels you enjoy.", "Open the Subscriptions feed directly when you want to watch."],
    caveat: "This changes the feed you browse, not video content, autoplay, or suggestions on watch pages.",
    method: "YouTube provides a dedicated Subscriptions feed.",
    source: "https://support.google.com/youtube/answer/4489286?hl=en", checked: "2026-09-28"
  },
  {
    id: "youtube-autoplay", category: "Video", kind: "setting", symbol: "Ⅱ",
    title: "Stop the next video playing itself", summary: "Turn off autoplay so the next watch is your choice.",
    service: "YouTube", type: "Setting · manual", platform: "YouTube web and app",
    url: "https://support.google.com/youtube/answer/6327615?hl=en", action: "See autoplay instructions", tags: ["video", "autoplay", "recommendations", "youtube"],
    steps: ["Open a YouTube video.", "Turn off Autoplay in the player controls or in YouTube settings."],
    caveat: "This stops automatic playback; it does not remove recommendations or guarantee that videos are human-made.",
    method: "YouTube Help documents the autoplay control.",
    source: "https://support.google.com/youtube/answer/6327615?hl=en", checked: "2026-09-28"
  },
  {
    id: "youtube-shorts-limit", category: "Video", kind: "setting", symbol: "⚙",
    title: "Set a limit for YouTube Shorts", summary: "Ask the YouTube app to stop an endless Shorts session.",
    service: "YouTube", type: "Setting · manual", platform: "YouTube mobile app",
    url: "https://support.google.com/youtube/answer/16671528?hl=en", action: "See YouTube's instructions",
    tags: ["shorts", "video", "time", "feed", "youtube"],
    steps: ["In the YouTube app, tap your profile, then Settings.", "Open Time management → Shorts feed limit and choose a limit, including zero minutes where offered."],
    caveat: "This is a mobile-app time limit, not a filter for generated videos or a desktop setting. Menu names and availability may change.",
    method: "YouTube Help documents a Shorts feed limit under time management.",
    source: "https://support.google.com/youtube/answer/16671528?hl=en", checked: "2026-09-28"
  },
  {
    id: "bandcamp", category: "Video", kind: "alternative", symbol: "♫",
    title: "Discover music from its makers", summary: "Explore artists and labels directly on Bandcamp.",
    service: "Bandcamp", type: "Alternative · music", platform: "Web and mobile",
    url: "https://bandcamp.com/search", queryParam: "q", placeholder: "Artist, album or genre",
    action: "Find artists on Bandcamp", tags: ["music", "artists", "creators", "entertainment"],
    steps: ["Search for an artist, album or genre.", "Visit an artist page to hear and support their work directly."],
    caveat: "Bandcamp is a music platform, not a video substitute or a guarantee that every upload was made without AI.",
    method: "Bandcamp connects listeners with artist pages and music purchases.",
    source: "https://bandcamp.com/about", checked: "2026-09-28"
  },
  {
    id: "weather-noaa", category: "Everyday", kind: "alternative", symbol: "☼",
    title: "Check a straightforward forecast", summary: "Use the US National Weather Service forecast without an AI assistant.",
    service: "National Weather Service", type: "Alternative · weather", platform: "US locations · web",
    url: "https://www.weather.gov/", action: "Open US weather forecasts", tags: ["weather", "forecast", "daily", "travel"],
    steps: ["Open the National Weather Service website.", "Search for a US town, city or ZIP code in its forecast box."],
    caveat: "The National Weather Service covers the United States; it is not a worldwide weather directory.",
    method: "The NWS publishes local forecasts and weather alerts.",
    source: "https://www.weather.gov/", checked: "2026-09-28"
  },
  {
    id: "pixel-weather-brief", category: "Everyday", kind: "setting", symbol: "⚙",
    title: "Turn off Pixel's AI weather brief", summary: "Keep the forecast and remove the generated summary in Pixel Weather.",
    service: "Pixel Weather", type: "Setting · manual", platform: "Supported Pixel devices",
    url: "https://support.google.com/pixelphone/answer/15266029?hl=en",
    action: "Read Pixel Weather help", tags: ["weather", "pixel", "forecast", "summary"],
    steps: ["Open the Pixel Weather app on a supported device.", "Open Saved locations, tap your user icon, select Weather Brief and choose Turn off."],
    caveat: "Weather Brief only appears on supported Pixel models and regions. ILUD cannot change an app setting remotely.",
    method: "Google's Pixel Weather help describes how to disable the AI-generated Weather Brief.",
    source: "https://support.google.com/pixelphone/answer/15266029?hl=en", checked: "2026-09-28"
  },
  {
    id: "osm-maps", category: "Everyday", kind: "alternative", symbol: "⌖",
    title: "Explore a map without a chat layer", summary: "Look up a place on community-maintained OpenStreetMap.",
    service: "OpenStreetMap", type: "Alternative · direct search", platform: "Web and mobile",
    url: "https://www.openstreetmap.org/search", queryParam: "query", placeholder: "Where do you want to go?",
    action: "Find it on OpenStreetMap", tags: ["maps", "travel", "places", "directions"],
    steps: ["Type a place above, or open OpenStreetMap.", "Inspect the map and choose an appropriate result."],
    caveat: "Community map coverage varies. A search is not navigation; verify routes and local conditions before travel.",
    method: "OpenStreetMap is a collaboratively edited map of the world.",
    source: "https://www.openstreetmap.org/about", checked: "2026-09-28"
  },
  {
    id: "organic-maps", category: "Everyday", kind: "alternative", symbol: "◇",
    title: "Navigate with offline maps", summary: "Try Organic Maps for on-device maps and directions.",
    service: "Organic Maps", type: "Alternative · mobile app", platform: "iOS and Android",
    url: "https://organicmaps.app/", action: "Explore Organic Maps", tags: ["travel", "maps", "offline", "navigation"],
    steps: ["Visit Organic Maps and install it from your device's app store.", "Download a map area before you travel."],
    caveat: "This is a separate app and may request location for turn-by-turn navigation; ILUD itself never requests location.",
    method: "Organic Maps publishes an offline, OpenStreetMap-based mobile maps app.",
    source: "https://organicmaps.app/", checked: "2026-09-28"
  },
  {
    id: "wikipedia", category: "Everyday", kind: "alternative", symbol: "W",
    title: "Start with a source you can inspect", summary: "Search Wikipedia articles and follow their citations.",
    service: "Wikipedia", type: "Alternative · direct search", platform: "Web and mobile",
    url: "https://en.wikipedia.org/w/index.php", queryParam: "search", placeholder: "What would you like to learn?",
    action: "Search Wikipedia", tags: ["reference", "learning", "encyclopedia", "research"],
    steps: ["Type a topic to open Wikipedia search.", "Read the article and inspect its citations for important claims."],
    caveat: "Articles are collaboratively edited; citations differ in quality and articles can include machine-assisted edits.",
    method: "Wikipedia is an editable encyclopedia with article source citations.",
    source: "https://en.wikipedia.org/wiki/Wikipedia:About", checked: "2026-09-28"
  },
  {
    id: "wiktionary", category: "Everyday", kind: "alternative", symbol: "A",
    title: "Look up a word without a chatbot", summary: "Use Wiktionary for definitions, etymology and translations.",
    service: "Wiktionary", type: "Alternative · direct search", platform: "Web and mobile",
    url: "https://en.wiktionary.org/w/index.php", queryParam: "search", placeholder: "Enter a word",
    action: "Look up this word", tags: ["dictionary", "translation", "learning", "language"],
    steps: ["Type a word to open the dictionary.", "Check its language, sense and usage notes."],
    caveat: "Community-edited entries vary in completeness; dictionary entries are not a substitute for nuanced translation.",
    method: "Wiktionary is a collaboratively edited multilingual dictionary.",
    source: "https://en.wiktionary.org/wiki/Wiktionary:About", checked: "2026-09-28"
  },
  {
    id: "apertium", category: "Everyday", kind: "alternative", symbol: "⇄",
    title: "Translate without a chat interface", summary: "Try Apertium's rule-based translation for supported language pairs.",
    service: "Apertium", type: "Alternative · translation", platform: "Web",
    url: "https://www.apertium.org/", action: "Open Apertium translator", tags: ["translate", "language", "learning", "rule-based"],
    steps: ["Open Apertium and select a supported source and target language.", "Paste text and read the translation critically."],
    caveat: "Available language pairs and translation quality vary; verify consequential translations with a fluent speaker.",
    method: "Apertium describes itself as a free/open-source rule-based machine translation platform.",
    source: "https://wiki.apertium.org/wiki/Main_Page", checked: "2026-09-28"
  },
  {
    id: "bbc-rss", category: "Everyday", kind: "workaround", symbol: "☷",
    title: "Follow news you picked", summary: "Use BBC News RSS feeds in a reader rather than a recommendation feed.",
    service: "BBC News", type: "RSS feed · direct link", platform: "RSS reader required",
    url: "https://feeds.bbci.co.uk/news/rss.xml", action: "Open BBC News RSS", tags: ["news", "rss", "reading", "headlines"],
    steps: ["Open the feed URL or copy it into your preferred RSS reader.", "Choose more feeds from publishers you trust."],
    caveat: "An RSS feed is not itself an article-quality or human-authorship filter; browsers may display raw XML.",
    method: "BBC News publishes an RSS feed for its headlines.",
    source: "https://www.bbc.co.uk/news/10628494", checked: "2026-09-28"
  },
  {
    id: "gutenberg", category: "Everyday", kind: "alternative", symbol: "▤",
    title: "Read books from a public library", summary: "Search Project Gutenberg's collection of free public-domain ebooks.",
    service: "Project Gutenberg", type: "Alternative · direct search", platform: "Web and mobile",
    url: "https://www.gutenberg.org/ebooks/search/", queryParam: "query", placeholder: "Author or book title",
    action: "Search free ebooks", tags: ["books", "reading", "literature", "learning"],
    steps: ["Search by author or title.", "Open a book's page and choose a reading format."],
    caveat: "Copyright status differs across countries; check your local rules before downloading or redistributing.",
    method: "Project Gutenberg curates free ebooks and documents its public-domain approach.",
    source: "https://www.gutenberg.org/about/", checked: "2026-09-28"
  },
  {
    id: "wikivoyage", category: "Everyday", kind: "alternative", symbol: "⌖",
    title: "Plan a trip with a human-edited guide", summary: "Search Wikivoyage for destination guides and practical travel details.",
    service: "Wikivoyage", type: "Alternative · direct search", platform: "Web and mobile",
    url: "https://en.wikivoyage.org/w/index.php", queryParam: "search", placeholder: "Where are you going?",
    action: "Search Wikivoyage", tags: ["travel", "guides", "places", "learning"],
    steps: ["Search for a destination.", "Check the article's date and verify hours, transport and local rules independently."],
    caveat: "Travel details can become outdated quickly; community editing does not guarantee that no content is machine-assisted.",
    method: "Wikivoyage is a collaboratively edited travel guide.",
    source: "https://en.wikivoyage.org/wiki/Wikivoyage:About", checked: "2026-09-28"
  },
  {
    id: "etsy-vintage", category: "Everyday", kind: "workaround", symbol: "⌑",
    title: "Look for existing vintage goods", summary: "Browse Etsy's vintage marketplace instead of shopping for generated novelty.",
    service: "Etsy", type: "Marketplace view · direct link", platform: "Web and mobile",
    url: "https://www.etsy.com/market/vintage", action: "Browse vintage goods", tags: ["shopping", "vintage", "reuse", "marketplace"],
    steps: ["Browse vintage listings.", "Read the listing, photos and seller information before purchasing."],
    caveat: "A marketplace category does not verify authenticity, seller identity, photography, or freedom from AI-generated descriptions.",
    method: "Etsy provides a vintage marketplace category.",
    source: "https://www.etsy.com/legal/policy/vintage-items-on-etsy/242665563649", checked: "2026-09-28"
  },
  {
    id: "thunderbird", category: "Everyday", kind: "alternative", symbol: "✉",
    title: "Use a familiar email client", summary: "Read and write email in Thunderbird, separate from a webmail assistant.",
    service: "Thunderbird", type: "Alternative · email app", platform: "Desktop and supported mobile",
    url: "https://www.thunderbird.net/", action: "Explore Thunderbird", tags: ["email", "communication", "productivity", "writing"],
    steps: ["Explore Thunderbird for your device.", "Connect your existing email account and compose messages directly."],
    caveat: "Your email provider may still process messages or offer its own AI tools elsewhere; check extensions separately.",
    method: "Thunderbird is an independent email client, not an email provider.",
    source: "https://www.thunderbird.net/about/", checked: "2026-09-28"
  },
  {
    id: "gmail-compose", category: "Everyday", kind: "setting", symbol: "✉",
    title: "Stop Gmail finishing your sentences", summary: "Turn off Smart Compose writing suggestions in Gmail.",
    service: "Gmail", type: "Setting · manual", platform: "Gmail account · web settings",
    url: "https://mail.google.com/", action: "Open Gmail", tags: ["email", "communication", "compose", "writing", "gmail"],
    steps: ["On a computer, open Gmail → Settings → See all settings.", "Under General, find Smart Compose and choose Writing suggestions off.", "Save changes at the bottom of the page."],
    caveat: "Smart Compose is an account-level suggestion setting. This does not switch off every Google AI feature or remove Gemini elsewhere.",
    method: "Gmail Help describes the Smart Compose on/off setting.",
    source: "https://support.google.com/mail/answer/9116836?hl=en", checked: "2026-09-28"
  },
  {
    id: "linkedin-training", category: "Everyday", kind: "setting", symbol: "◌",
    title: "Limit use of LinkedIn data for AI training", summary: "Review LinkedIn's generative-AI improvement preference.",
    service: "LinkedIn", type: "Setting · manual", platform: "LinkedIn account",
    url: "https://www.linkedin.com/help/linkedin/answer/a5538339",
    action: "Read LinkedIn's instructions", tags: ["social", "privacy", "data", "training"],
    steps: ["Sign in to LinkedIn and open Settings & Privacy → Data privacy.", "Find Data for Generative AI Improvement and turn it off if available."],
    caveat: "This controls future data use for model improvement, not AI content in your feed. It is not retroactive and may vary by region.",
    method: "LinkedIn Help describes its data use and related account setting.",
    source: "https://www.linkedin.com/help/linkedin/answer/a5538339", checked: "2026-09-28"
  },
  {
    id: "khanmigo-parent", category: "Everyday", kind: "setting", symbol: "⚙",
    title: "Choose whether your child uses Khanmigo", summary: "A parent can turn the learning assistant off for a connected child.",
    service: "Khan Academy", type: "Setting · manual", platform: "Connected parent and child accounts",
    url: "https://support.khanacademy.org/hc/en-us/articles/14394695651597",
    action: "Read Khan Academy's steps", tags: ["learning", "education", "parent", "khanmigo"],
    steps: ["Sign in to the connected parent account.", "Open Settings → Khanmigo, uncheck the child's account and save changes."],
    caveat: "This is a parent-account control, not a general Khan Academy AI-off switch. District-provided access requires district administrator action.",
    method: "Khan Academy documents a parent's Khanmigo toggle for connected child accounts.",
    source: "https://support.khanacademy.org/hc/en-us/articles/14394695651597", checked: "2026-09-28"
  },
  {
    id: "chrome-ai-settings", category: "Everyday", kind: "setting", symbol: "⚙",
    title: "Review Chrome's AI controls", summary: "Turn off available Gemini-in-Chrome features from the browser settings.",
    service: "Chrome", type: "Setting · manual", platform: "Supported Chrome desktop versions and regions",
    url: "https://support.google.com/chrome/answer/16988996",
    action: "Read Chrome's instructions", tags: ["browser", "chrome", "gemini", "settings"],
    steps: ["In Chrome, open Settings → AI Innovations when it appears.", "Review individual Gemini-in-Chrome controls and turn off the features you do not want."],
    caveat: "AI Innovations rolls out gradually and may not appear for every user. Browser controls cannot remove AI features from external websites.",
    method: "Google documents Chrome AI features and their availability restrictions.",
    source: "https://support.google.com/chrome/answer/16988996", checked: "2026-09-28"
  }
];
