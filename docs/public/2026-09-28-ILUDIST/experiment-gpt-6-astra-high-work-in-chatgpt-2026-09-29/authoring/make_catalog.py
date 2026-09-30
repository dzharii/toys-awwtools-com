"""Authoritative catalogue. Re-run with Python 3 to emit portable browser data."""
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parent
sources = {}
def source(key, title, url, evidence='Primary documentation'):
    sources[key] = dict(title=title, url=url, evidence=evidence, reviewed='2026-09-29')
source('google','Google: show only web links','https://support.google.com/websearch/answer/14901683?hl=en')
source('udm','udm14: creator documentation','https://udm14.org/','Maintainer documentation; unofficial shortcut')
source('ddg','DuckDuckGo: No-AI search','https://duckduckgo.com/duckduckgo-help-pages/ai-features/about-noaiduckduckgocom')
source('ddg-images','DuckDuckGo: filter AI images','https://safe.duckduckgo.com/duckduckgo-help-pages/results/how-to-filter-out-ai-images-in-duckduckgo-search-results')
source('mojeek','Mojeek: independent search','https://www.mojeek.com/about/why-mojeek')
source('reddit','Reddit: home feed recommendations','https://support.reddithelp.com/hc/en-us/articles/4402284777364-What-are-home-feed-recommendations')
source('instagram','Instagram: Following and Favorites','https://about.fb.com/news/2022/03/two-new-ways-to-control-your-instagram-feed/')
source('mastodon','Mastodon: choose your own feed','https://joinmastodon.org/')
source('pinterest','Pinterest: refine recommendations','https://help.pinterest.com/en/article/tune-your-home-feed')
source('pin-search','Pinterest: search for ideas','https://help.pinterest.com/en/article/search-for-ideas-on-pinterest')
source('gmail','Gmail: Smart Compose','https://support.google.com/mail/answer/9116836?hl=en')
source('docs','Google Docs: Smart Compose and Reply','https://support.google.com/docs/answer/9643962?hl=en')
source('copilot','Microsoft: turn off Copilot','https://support.microsoft.com/en-gb/privacy/turn-off-copilot-in-microsoft-365-apps')
source('libre','LibreOffice: free office suite','https://www.libreoffice.org/')
source('unsplash','Unsplash: submission guidelines','https://help.unsplash.com/en/articles/2534415-unsplash-submission-guidelines')
source('smithsonian','Smithsonian: Open Access','https://www.si.edu/openaccess')
source('flickr','Flickr: the Commons','https://www.flickr.com/commons')
source('books','Bookshop.org: bookseller recommendations','https://bookshop.org/info/about-us')
source('ifixit','iFixit: repair guides','https://www.ifixit.com/Guide')
source('food','Open Food Facts: the product database','https://blog.openfoodfacts.org/en/news/food-transparency-in-the-palm-of-your-hand-explore-the-largest-open-food-database-using-duckdb-%F0%9F%A6%86x%F0%9F%8D%8A')
source('firefox','Mozilla: Firefox AI controls','https://support.mozilla.org/en-US/kb/firefox-ai-controls')
source('firefox-android','Mozilla: Android AI controls','https://support.mozilla.org/en-US/kb/android-ai-controls')
source('apple','Apple: turn off Intelligence features','https://support.apple.com/en-euro/guide/iphone/iph3fed3f2c3/ios')
source('reader','Apple: Safari Reader','https://support.apple.com/en-gb/guide/iphone/iphdc30e3b86/ios')
source('youtube','YouTube: recommendations and search results','https://support.google.com/youtube/answer/6342839?hl=en')
source('autoplay','YouTube: autoplay','https://support.google.com/youtube/answer/6327615?hl=en')
source('unhook','Unhook: developer store listing','https://chromewebstore.google.com/detail/unhook-remove-youtube-rec/khncfooichmfjbepaaaebmommgaepoid?hl=en','Developer-published extension listing')
source('nnw','NetNewsWire: RSS reader','https://netnewswire.com/')
source('feeder','Feeder: RSS reader help','https://feeder.co/help/')
source('weather','National Weather Service: local forecasts','https://www.weather.gov/')
source('osm','OpenStreetMap: about the map','https://www.openstreetmap.org/about?locale=en-GB')
source('organic','Organic Maps: offline maps','https://organicmaps.app/')
source('voyage','Wikivoyage: about the travel guide','https://en.wikivoyage.org/wiki/Wikivoyage:About')
source('wr','WordReference: dictionaries and forums','https://www.wordreference.com/')
source('apertium','Apertium: rule-based translation','https://wiki.apertium.org/wiki/Main_Page')
source('gutenberg','Project Gutenberg: about the library','https://www.gutenberg.org/about/')
source('openstax','OpenStax: peer-reviewed textbooks','https://openstax.org/higher-education')
source('signal','Signal: private messaging','https://signal.org/')

entries=[]
def add(id, title, summary, service, group, category, route, kind, url, refs, steps, caveat, platforms=('ios','android','desktop'), install='none', query=None, mechanism='', status='Documented'):
    entries.append(dict(id=id,title=title,summary=summary,service=service,group=group,category=category,route=route,kind=kind,url=url,sources=refs.split(),steps=steps,caveat=caveat,platforms=list(platforms),install=install,query=query,mechanism=mechanism,status=status,sourceReviewed='2026-09-29',lastTested=None,reviewAfterDays=90,tags=(title+' '+summary+' '+service+' '+category).lower()))
add('google-web','Search without AI summaries','Keep ordinary web links and skip generated answer boxes.','Google','Search','Search','avoid','query','https://www.google.com/search','google udm',
 ['Enter your search here and open Google Web.','If Google changes the shortcut, run the search normally and choose More > Web.','If you enabled a Search Labs experiment that changes Web results, turn that experiment off.'],
 'This chooses a result view for this search. It does not turn AI off across Google or filter AI-written websites.',query='google',mechanism='Builds a Google search URL with q and udm=14. The Web filter is documented by Google; its URL shortcut is unofficial.',status='Unofficial shortcut')
add('ddg-noai','Use a simpler search experience','Start on DuckDuckGo without Search Assist or Duck.ai entry points.','DuckDuckGo','Search','Search','replace','query','https://noai.duckduckgo.com/','ddg',
 ['Enter a search and open the No-AI domain.','Bookmark that domain to repeat the same experience.'],
 'Search results can still link to generated content. Image filtering is imperfect.',query='duck',mechanism='Uses DuckDuckGo\'s dedicated noai.duckduckgo.com domain.')
add('mojeek','Explore a different search index','Try independent web results instead of another search assistant.','Mojeek','Search','Search','replace','query','https://www.mojeek.com/search','mojeek',
 ['Enter a query and open Mojeek.','Compare another search engine if the results are too sparse.'],
 'Its independent index has different coverage. This is not a human-authorship guarantee.',query='mojeek',mechanism='Opens a conventional query against Mojeek\'s independent index.')
add('reddit-feed','See fewer recommended posts','Keep your Reddit home feed closer to communities you chose.','Reddit','Social','Social','off','guide','https://www.reddit.com/settings/preferences','reddit',
 ['On the web, open Preferences and switch off Show recommendations in home feed.','In the app, open Settings > your account and look under Personalized Recommendations or Privacy.','Turn off Enable home feed recommendations. Labels vary by rollout.'],
 'This does not remove AI posts, ads, or recommendations elsewhere. Signing in is required.',mechanism='Changes the account preference for home-feed recommendations.')
add('instagram-following','Catch up with people you follow','Use a chronological Following feed on Instagram.','Instagram','Social','Social','avoid','guide','https://www.instagram.com/','instagram',
 ['Open the Instagram app and go to Home.','Tap the Instagram title at the top and choose Following.','Use Favorites for a smaller group of accounts.'],
 'You may need to select this view again later. Followed accounts can still post AI content.',platforms=('ios','android'),mechanism='Uses the platform\'s Following feed rather than its default ranked feed.')
add('mastodon','Choose your own social circle','Follow people in a chronological home timeline.','Mastodon','Social','Social','replace','link','https://joinmastodon.org/','mastodon',
 ['Choose a server and review its rules.','Create an account, follow people, and read your Home timeline.'],
 'Moderation varies by server. A chronological timeline does not verify authorship.',install='optional',mechanism='Moves social reading to a user-chosen, chronological home timeline.')
add('pinterest-feed','See fewer generated Pins','Reduce AI imagery in supported Pinterest categories.','Pinterest','Social','Images','off','guide','https://www.pinterest.com/settings/','pinterest',
 ['Open Pinterest Settings and find Refine your recommendations.','Open AI content.','Choose to see fewer AI Pins in the categories offered to your account.'],
 'A reduction, not a complete block. Category and account availability vary.',mechanism='Uses Pinterest\'s native AI-content preferences.')
add('gmail-compose','Write email in your own words','Stop Gmail from completing sentences as you type.','Gmail','Writing','Communication','off','guide','https://mail.google.com/mail/u/0/#settings/general','gmail',
 ['Open Gmail on the web, then Settings > See all settings > General.','Under Smart Compose, select Writing suggestions off.','Scroll down and save changes.'],
 'This controls Smart Compose, not every Gemini or Workspace feature. Open the intended account first.',mechanism='Turns off the account-level Smart Compose suggestion setting.')
add('docs-compose','Turn off writing suggestions','Keep suggested prose and comment replies out of Google Docs.','Google Docs','Writing','Writing','off','guide','https://docs.google.com/','docs',
 ['Open a document on a computer.','Choose Tools > Preferences.','Uncheck Show Smart Compose suggestions and, if shown, Show Smart Reply suggestions. Save with OK.'],
 'Availability varies by language and account. This is not a switch for all Gemini features.',platforms=('desktop',),mechanism='Changes the document editor\'s suggestion preferences.')
add('word-copilot','Write without Copilot','Hide Copilot entry points in supported desktop Office apps.','Microsoft Word','Writing','Writing','off','guide','https://support.microsoft.com/en-gb/privacy/turn-off-copilot-in-microsoft-365-apps','copilot',
 ['Windows: open File > Options > Copilot. Mac: open Word > Preferences > Authoring and Proofing Tools > Copilot.','Clear Enable Copilot, accept the change, then close and restart the app.','Repeat in each supported Office app and on each device you want to change.'],
 'Personal-account desktop versions only where the checkbox is available. Work accounts may be managed by an administrator.',platforms=('desktop',),mechanism='Uses the app-specific Enable Copilot control, preserving unrelated account privacy settings.')
add('libreoffice','Give your writing a quieter home','Work on local documents with LibreOffice Writer.','LibreOffice','Writing','Productivity','replace','link','https://www.libreoffice.org/','libre',
 ['Download the version for your computer from the official site.','Open Writer and create or import a document.','Keep the original when checking complex Office formatting.'],
 'Desktop installation. Complex Microsoft Office formatting may change during conversion.',platforms=('desktop',),install='app',mechanism='Uses a local, open-source word processor instead of a cloud assistant workflow.')
add('unsplash','Find photographs made by people','Search a photography collection whose policy excludes generated submissions.','Unsplash','Images','Images','human','query','https://unsplash.com/s/photos/','unsplash',
 ['Search for your subject.','Open the image, inspect its contributor, and check the applicable license.'],
 'A submission policy is not a forensic guarantee. Some results or collections require payment.',query='unsplash',mechanism='Directs the query to a curated photography service, rather than claiming to detect synthetic pixels.')
add('ddg-images','See fewer AI-generated images','Use DuckDuckGo\'s image filter as a practical first pass.','DuckDuckGo Images','Images','Images','avoid','query','https://noai.duckduckgo.com/','ddg ddg-images',
 ['Enter your subject and open filtered image search.','Keep the AI images filter on Hide.','Visit the original source before relying on authorship or reuse rights.'],
 'The filter uses signals and blocklists; it will miss some images and may hide others incorrectly.',query='images',mechanism='Opens the No-AI domain in its Images view. The domain enables AI image filtering by default.')
add('smithsonian','Find art with a provenance trail','Explore collection objects, photographs, and open-access media.','Smithsonian','Images','Reference','human','link','https://www.si.edu/openaccess','smithsonian',
 ['Open the collection and search for a subject.','Use Open Access filters and inspect the item record.','Check the rights statement for the exact asset.'],
 'Not every item or associated image is unrestricted. Historical provenance matters more than an AI-free badge.',mechanism='Uses institutional collection records and item-level rights information.')
add('flickr-commons','Browse historical photographs','Start with photography archives from cultural institutions.','Flickr Commons','Images','Images','human','link','https://www.flickr.com/commons','flickr',
 ['Choose a participating institution or browse its albums.','Open a photograph and read its source and rights notes.'],
 'This applies to the Commons collection, not all Flickr uploads. Check rights for your intended use.',mechanism='Restricts discovery to participating archival collections.')
add('pinterest-search','Filter inspiration with Less AI','Use Pinterest\'s Less AI control when it appears.','Pinterest','Images','Images','avoid','guide','https://www.pinterest.com/','pin-search',
 ['Search Pinterest for your subject.','If a Less AI button appears, select it.','Inspect the original source of any image you choose.'],
 'The button only appears for some searches. It reduces, rather than eliminates, AI-modified content.',mechanism='Uses a native search refinement rather than a third-party detector.')
add('shop-web','Research a product without an answer box','Find product pages and reviews as ordinary web links.','Google Web','Shopping','Shopping','avoid','query','https://www.google.com/search','google udm',
 ['Enter a product name or model number.','Compare original manufacturer specifications and independent reviews.'],
 'Web mode does not remove every ad or identify fake reviews. No claim is made that a store is AI-free.',query='google',mechanism='Uses the same unofficial udm=14 shortcut for product research.',status='Unofficial shortcut')
add('bookshop','Choose books with booksellers','Browse named bookseller recommendations and independent shops.','Bookshop.org','Shopping','Shopping','human','link','https://bookshop.org/','books',
 ['Open Bookseller Recommendations or choose an independent shop.','Read the list attribution and choose a book.'],
 'Regional stores, availability, prices, and shipping differ. Commercial listings can still contain generated material.',mechanism='Starts discovery with attributed bookseller lists rather than an AI shopping conversation.')
add('repair','Read the repair guide directly','Start with illustrated instructions before buying a replacement.','iFixit','Shopping','Utilities','human','link','https://www.ifixit.com/Guide','ifixit',
 ['Find the exact device or product in Repair Guides.','Read the tools, difficulty, and safety notes before starting.'],
 'iFixit also offers an AI assistant. This link goes to its guide library; it does not disable that assistant.',mechanism='Deep-links to the written guide collection rather than the FixBot workflow.')
add('food-labels','Look up the actual food label','Inspect ingredients and product records instead of a shopping summary.','Open Food Facts','Shopping','Shopping','human','link','https://world.openfoodfacts.org/','food',
 ['Search by product name or type a barcode on the site.','Compare the label photograph with the product in your hand.'],
 'Community records may be incomplete or stale; the current package is authoritative. The project also uses automation.',mechanism='Prioritizes product data and label evidence; not a guarantee of an AI-free service.')
add('firefox-ai','Turn off Firefox AI features','Block covered generative AI enhancements in desktop Firefox.','Firefox','Browsing','Browsing','off','guide','https://support.mozilla.org/en-US/kb/firefox-ai-controls','firefox',
 ['In desktop Firefox 148 or later, open Settings.','Select AI Controls.','Enable Block AI enhancements.'],
 'This controls Firefox features, not AI on websites you visit. Older or managed versions may differ.',platforms=('desktop',),mechanism='Uses Firefox\'s built-in AI Controls panel. Web pages cannot change this browser setting.')
add('firefox-android','Control AI in Firefox for Android','Review the browser\'s available AI controls on your phone.','Firefox Android','Browsing','Browsing','off','guide','https://support.mozilla.org/en-US/kb/android-ai-controls','firefox-android',
 ['Update Firefox for Android.','Open its menu, then Settings > AI Controls.','Block AI enhancements or adjust the individual features offered.'],
 'Applies to supported Android versions, not Firefox on iPhone. The available switches can change.',platforms=('android',),mechanism='Uses the Android browser\'s settings panel.')
add('apple-ai','Turn off Apple Intelligence','Choose whether supported iPhone Intelligence features run.','iPhone','Browsing','Utilities','off','guide','https://support.apple.com/en-euro/guide/iphone/iph3fed3f2c3/ios','apple',
 ['Open the iPhone Settings app.','Open Apple Intelligence & Siri.','Turn Apple Intelligence off.'],
 'Only supported devices, languages, and regions show these controls. Third-party AI apps are unaffected.',platforms=('ios',),mechanism='Changes a system setting manually; ILUD cannot open or alter protected OS controls.')
add('notification-summary','Read original notifications','Turn off generated notification summaries on iPhone.','iPhone','Browsing','Communication','off','guide','https://support.apple.com/en-euro/guide/iphone/iph3fed3f2c3/ios','apple',
 ['Open Settings > Notifications.','Open Summarize Notifications.','Turn the feature off, or adjust individual apps if offered.'],
 'Requires an iPhone and software version that support Apple Intelligence summaries.',platforms=('ios',),mechanism='Disables summarization while retaining the original app notifications.')
add('safari-reader','Read an article with fewer distractions','Put the article\'s text and images into Safari Reader.','Safari','Browsing','Reading','avoid','guide','https://support.apple.com/en-gb/guide/iphone/iphdc30e3b86/ios','reader',
 ['Open an article in Safari.','Tap the page menu beside the address bar, then Show Reader when available.','Use website settings to prefer Reader on compatible sites.'],
 'Reader is not available on every page and does not identify or remove AI-written article text.',platforms=('ios','desktop'),mechanism='Uses the browser\'s reading view to reduce surrounding interface clutter.')
add('youtube-home','Reduce YouTube home recommendations','Review the history controls that shape your home page.','YouTube','Social','Video','off','guide','https://myactivity.google.com/product/youtube','youtube',
 ['Open your YouTube history controls and review what is stored.','Pause future watch history if you want to stop recording it.','YouTube says Home recommendations are removed when history is off and no significant prior history remains. Deleting prior history is a separate, irreversible choice.'],
 'Pausing alone may not clear recommendations. Do not delete history unless you want to lose it; ILUD does not delete anything.',mechanism='Uses watch-history controls. Recommendations elsewhere and search personalization may remain.')
add('youtube-autoplay','Let a video end quietly','Stop YouTube automatically choosing the next video.','YouTube','Social','Video','off','guide','https://www.youtube.com/','autoplay',
 ['Open a video.','Find the Autoplay switch in or near the player and switch it off.','Repeat on other devices if necessary.'],
 'This does not hide suggested videos or Shorts, and settings can differ by device.',mechanism='Uses the player\'s built-in autoplay preference.')
add('youtube-unhook','Hide Shorts and suggested videos','Choose which parts of desktop YouTube stay visible.','Unhook','Social','Video','avoid','link','https://chromewebstore.google.com/detail/unhook-remove-youtube-rec/khncfooichmfjbepaaaebmommgaepoid?hl=en','unhook',
 ['Review the extension publisher and requested permissions in the store.','Install Unhook in a supported desktop browser.','Open its controls and choose Hide YouTube Shorts and any recommendation panels you want hidden.'],
 'Not for the YouTube native app or iPhone Safari. YouTube layout changes can break an extension; installation is optional.',platforms=('desktop',),install='extension',mechanism='A browser extension hides selected interface elements; it does not detect AI-authored videos.')
add('netnewswire','Read news you subscribed to','Build an RSS reading list from publications you choose.','NetNewsWire','Browsing','News','replace','link','https://netnewswire.com/','nnw',
 ['Install NetNewsWire on a supported Apple device.','Add publication or feed URLs.','Read original articles in your subscription list.'],
 'Publishers decide feed availability and whether full text is included. Subscription choices do not guarantee human authorship.',platforms=('ios','desktop'),install='app',mechanism='Collects RSS feeds instead of relying on a platform\'s recommended home feed.')
add('feeder','Choose a web-based news inbox','Follow your own feeds from a browser or phone.','Feeder','Browsing','News','replace','link','https://feeder.co/','feeder',
 ['Create an account and add a publication or RSS feed.','Read the feeds you chose and open the original articles.'],
 'Free and paid features differ. Feeder also offers AI features such as text-to-speech; this recommendation is for RSS reading.',mechanism='Uses explicitly selected subscriptions for news discovery.')
add('weather','Go straight to the forecast','Read official US forecasts and alerts by city or ZIP.','National Weather Service','Browsing','Weather','replace','link','https://www.weather.gov/','weather',
 ['Type a US city and state or ZIP in the forecast search.','Open the local forecast and read any active alerts.'],
 'US-focused. Forecasting uses computational models; this is a direct forecast source, not a claim of no automation.',mechanism='Opens the forecasting agency directly, avoiding a search assistant\'s paraphrase.')
add('openstreetmap','Look up a place on a community map','Search mapped streets and places without a conversational itinerary.','OpenStreetMap','Browsing','Maps','replace','query','https://www.openstreetmap.org/search','osm',
 ['Enter a place or address.','Choose the matching result and inspect the map.'],
 'Coverage and address quality vary. This does not provide live traffic or guaranteed accessibility information.',query='osm',mechanism='Passes a place query to the community-maintained map search.')
add('organic-maps','Take a quiet map offline','Use downloaded maps for walks, rides, and trips.','Organic Maps','Browsing','Maps','replace','link','https://organicmaps.app/','organic',
 ['Install Organic Maps from its official download links.','Download your destination region before traveling.','Search places and plan routes in the downloaded map.'],
 'A separate app. Its navigation may ask for location; ILUD does not. Map conditions can change.',platforms=('ios','android'),install='app',mechanism='Uses offline OpenStreetMap-based maps in an ad-free application.')
add('wikivoyage','Read a travel guide people can edit','Explore destination advice with page history and contributors.','Wikivoyage','Browsing','Travel','human','query','https://en.wikivoyage.org/w/index.php','voyage',
 ['Enter your destination.','Read the guide and inspect page history for freshness.','Confirm opening hours and booking details with the venue.'],
 'Community-edited advice can be stale or wrong. No claim is made that all text is human-authored.',query='voyage',mechanism='Searches an editable travel guide rather than generating an itinerary.')
add('wordreference','Look up a word without a chat','Use dictionary entries and language discussions.','WordReference','Writing','Translation','replace','query','https://www.wordreference.com/definition/','wr',
 ['Enter an English word for a definition.','On WordReference, choose a language pair for translations or visit the forums for context.'],
 'A dictionary and discussion resource, not whole-document translation. Ads may appear.',query='wordreference',mechanism='Opens an English dictionary entry directly; language pairs are chosen on the destination.')
add('apertium','Translate with a rule-based tool','Try open-source translation without a chat assistant.','Apertium','Writing','Translation','replace','link','https://www.apertium.org/','apertium',
 ['Select a supported language pair.','Enter your text and compare the output with the source.'],
 'Still machine translation. Supported language pairs and quality are limited; avoid entering confidential text.',mechanism='Uses rule-based language processing instead of a large-language-model conversation.')
add('gutenberg','Read a book, not a summary','Open full classic texts from a volunteer digital library.','Project Gutenberg','Browsing','Reading','human','link','https://www.gutenberg.org/','gutenberg',
 ['Search for a title or author.','Read online or choose an ebook format.','Check the book\'s copyright notice for your country.'],
 'The collection emphasizes older works; public-domain status differs by jurisdiction.',mechanism='Goes directly to complete editions rather than generated synopses.')
add('openstax','Learn from a complete textbook','Choose a peer-reviewed text you can read or download.','OpenStax','Browsing','Learning','human','link','https://openstax.org/higher-education','openstax',
 ['Choose a subject and textbook.','Open the free web version or PDF.','Use the contents, examples, and references to work through the topic.'],
 'This entry recommends the textbooks, not every OpenStax learning product or optional AI feature.',mechanism='Uses published, reviewed course material with a defined edition.')
add('signal','Keep conversation between people','Use a dedicated messaging app for direct conversations.','Signal','Social','Communication','replace','link','https://signal.org/','signal',
 ['Install Signal using the official links.','Register and invite contacts who want to use it.','Start a conversation or call.'],
 'Both parties need Signal. Device keyboards can still supply writing suggestions independently of the app.',platforms=('ios','android','desktop'),install='app',mechanism='Uses a dedicated private messenger rather than a social recommendation feed.')
add('outlook-copilot','Keep Copilot out of your inbox','Turn off Outlook\'s Copilot features for a supported account.','Outlook','Writing','Communication','off','guide','https://outlook.live.com/mail/','copilot',
 ['On the web or in new Outlook for Windows, open Settings > Copilot.','On iPhone, Android, or Mac, open Quick Settings > Copilot.','Switch Turn on Copilot off.'],
 'Applies to supported personal-account versions. Classic Outlook for Windows and organization-managed accounts may differ.',mechanism='Uses Outlook\'s account-level Copilot toggle; the preference follows that account across supported devices.')

data={'version':1,'researchDate':'2026-09-29','sources':sources,'entries':entries}
(ROOT/'catalog.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
(ROOT/'base'/'catalog.js').write_text('window.ILUD_DATA = '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n')
print(f'{len(entries)} entries, {len(sources)} source records')
