Our outlet name is AI Gazette.

Use read-only: `./news_sources.md`

A00 Purpose
This file is the controlling instruction for an automated coding agent that must generate a daily, static "AI Gazette" newspaper page for Seattle, WA by searching the web for recent news, verifying sources, and writing the results into NEWS-YYYY-MM-DD/content.js using the existing DOM-only builder. The agent must not stop after creating news_sources.md. The agent must complete a full daily issue generation run unless the user explicitly requests a narrower task.

A01 Non-negotiable outcome for each run
Unless the user explicitly says "only create news_sources.md" or "do not update content.js", the agent must:
1) search for news on the web,
2) select a diverse set of items,
3) verify the URLs and dates,
4) write the daily issue into NEWS-YYYY-MM-DD/content.js,
5) ensure NEWS-YYYY-MM-DD/index.html renders the issue using local assets,
6) update the root archive index.html to link to the daily issue.

If the agent cannot meet minimum requirements, it must still publish the best-effort issue and force an on-page error banner to appear.

A02 Repository layout and path rules
All paths are relative to repository root.
Template folder is _00_template and is read-only by default.
Daily folder is NEWS-YYYY-MM-DD where YYYY-MM-DD is computed in America/Los_Angeles time.

A03 Safety constraints
The agent must only read and write files inside the repository.
The agent must not run shell commands, modify OS settings, or execute downloaded code.
The agent must not introduce innerHTML.

A04 Template read-only rule
The agent must not edit any files under _00_template unless the user explicitly requests template changes.

B00 Daily run algorithm (do this, in this order)
B01 Determine the day
Compute current date in America/Los_Angeles as YYYY-MM-DD.
Set DAILY_DIR = NEWS-YYYY-MM-DD.

B02 Ensure DAILY_DIR exists and is initialized
If DAILY_DIR does not exist, create it.
Ensure these files exist in DAILY_DIR: index.html, main.js, styles.css, content.js, news_sources.md.
If any of index.html, main.js, styles.css, content.js are missing in DAILY_DIR, copy the missing file(s) from _00_template. Do not overwrite existing files.

B03 Create or update DAILY_DIR/news_sources.md
If news_sources.md does not exist, create it using the default categories and source policies in C00.
If it exists, keep its category list and source policies unless the user explicitly requests changes.

B04 Mandatory web research step (must not be skipped)
For every category defined in DAILY_DIR/news_sources.md:
1) Run multiple web searches using the category seed queries.
2) Prefer the exact Seattle and date window terms first.
3) Open candidate results and extract title, outlet, publication date, and canonical URL.
4) Reject any result if the URL is not accessible, the date is not visible and confirmable, or it is clearly out of scope for Seattle and the category.

This step is mandatory even if the prompt mentions only "create news_sources.md". The agent must still populate the daily issue unless the user explicitly prohibited content generation.

B05 Select items and enforce diversity
The agent must publish at least 12 total items.
Each category must have 2 to 4 items.
The issue must use at least 6 distinct source domains.
No single source domain may contribute more than 35% of total items.
At least 3 categories must include items from at least 2 different domains.

If a category cannot reach 2 items after reasonable effort, publish 1 item and mark the issue incomplete using the error signaling in H00.

B06 Write NEWS-YYYY-MM-DD/content.js
The agent must update DAILY_DIR/content.js to include all selected items and render without code changes to main.js.

Builder constraints: the column builder supports at most two headlines per column. Therefore:
1) Primary headline must be the category name.
2) Secondary headline must be a short category deck, not an item title.
3) Each item must be written using paragraphs only.

Item format must be deterministic and two-paragraph per item:
Paragraph 1: "Title: <title>. <one-sentence factual summary>"
Paragraph 2: "Source: <outlet>, Date: <YYYY-MM-DD>, URL: <url>"

Summaries must be factual, 1 sentence each, no speculation, no editorial language.

Masthead must be:
Title: "AI Gazette"
Subhead format (default):
"Seattle, WA - <Weekday> <Month> <Day>, <Year> - Daily Brief"

Weather is optional and omitted unless the user provides weather data.

B07 Verify daily page renders local assets only
Ensure DAILY_DIR/index.html references only local styles.css, main.js, and content.js using relative paths within DAILY_DIR.
DAILY_DIR/index.html must not reference _00_template.

B08 Update root archive index.html
Update repository root index.html to link to DAILY_DIR/index.html.
The archive must list all NEWS-YYYY-MM-DD folders newest first.
The agent must only rewrite the content between these markers:
<!-- AI_GAZETTE_ARCHIVE_BEGIN -->
<!-- AI_GAZETTE_ARCHIVE_END -->
If the markers do not exist, the agent must add them and then manage only the region between them.

C00 Default categories and default sources (Seattle-focused)
If creating news_sources.md from scratch, use this exact category list in this order and include at least these sources and seeds.

C01 Category: Seattle and Region
Preferred domains: kuow.org, crosscut.com, seattlemet.com, king5.com, kiro7.com
Seeds:
"Seattle news YYYY-MM-DD"
"Seattle WA today YYYY-MM-DD"
"Seattle region yesterday YYYY-MM-DD"
"site:kuow.org Seattle YYYY-MM-DD"
"site:crosscut.com Seattle YYYY-MM-DD"

C02 Category: City and Policy
Preferred domains: seattle.gov, kingcounty.gov, wa.gov, publicola.com, crosscut.com
Seeds:
"Seattle City Council YYYY-MM-DD"
"Seattle mayor announcement YYYY-MM-DD"
"King County policy YYYY-MM-DD"
"site:seattle.gov news release YYYY-MM-DD"
"site:kingcounty.gov news YYYY-MM-DD"

C03 Category: Transit and Infrastructure
Preferred domains: soundtransit.org, wsdot.wa.gov, theurbanist.org, kuow.org, seattletimes.com (use only if accessible)
Seeds:
"Sound Transit announcement YYYY-MM-DD"
"Link light rail service change YYYY-MM-DD"
"WSDOT Seattle traffic closure YYYY-MM-DD"
"site:soundtransit.org news YYYY-MM-DD"
"site:wsdot.wa.gov Seattle YYYY-MM-DD"

C04 Category: Public Safety
Preferred domains: seattle.gov/police, kingcounty.gov, kiro7.com, king5.com, kuow.org
Seeds:
"Seattle police incident YYYY-MM-DD"
"King County court case YYYY-MM-DD"
"Seattle fire response YYYY-MM-DD"
"site:seattle.gov/police news YYYY-MM-DD"
"site:king5.com Seattle police YYYY-MM-DD"

C05 Category: Business and Tech
Preferred domains: geekwire.com, seattleinno.com, bizjournals.com, kuow.org, crosscut.com
Seeds:
"Seattle startup funding YYYY-MM-DD"
"Amazon Seattle announcement YYYY-MM-DD"
"Microsoft Redmond news YYYY-MM-DD"
"site:geekwire.com YYYY-MM-DD Seattle"
"Seattle business opening YYYY-MM-DD"

C06 Category: Environment
Preferred domains: ecy.wa.gov, kingcounty.gov, washington.edu/news, kuow.org, crosscut.com
Seeds:
"Puget Sound environment YYYY-MM-DD"
"Seattle climate program YYYY-MM-DD"
"WA Ecology release YYYY-MM-DD"
"site:ecy.wa.gov news YYYY-MM-DD"
"site:washington.edu/news YYYY-MM-DD Seattle"

C07 Category: Culture and Events
Preferred domains: theevergrey.com, seattlemet.com, stranger.com, crosscut.com, knkx.org
Seeds:
"Seattle events YYYY-MM-DD"
"Seattle arts announcement YYYY-MM-DD"
"Seattle food opening YYYY-MM-DD"
"site:theevergrey.com YYYY-MM-DD"
"site:seattlemet.com YYYY-MM-DD"

C08 Category: Sports
Preferred domains: mlb.com/mariners, seahawks.com, soundersfc.com, mynorthwest.com, espn.com (use only if dates are visible)
Seeds:
"Mariners news YYYY-MM-DD"
"Seahawks report YYYY-MM-DD"
"Sounders match YYYY-MM-DD"
"site:soundersfc.com YYYY-MM-DD"
"site:seahawks.com YYYY-MM-DD"

D00 Web extraction requirements
For each selected item, the agent must extract:
Title (exact),
Outlet name,
Publication date (confirmable, convert to YYYY-MM-DD),
Canonical URL (the final reachable URL).

If any field is missing or cannot be confirmed, reject the item.

E00 Link verification rules
The agent must open each candidate URL and confirm:
1) It loads without obvious blocking.
2) The publication date is visible or present in metadata the agent can reliably read.
3) The URL is stable (not a search result redirect).

F00 Bias and inclusivity controls
The agent must mix source types in the final issue:
At least 2 items from official agencies (city, county, state, transit).
At least 4 items from local journalism outlets.
At least 2 items from public media or non-profit newsroom outlets.

G00 Prohibitions
Do not use a single source for most of the issue.
Do not include items without working URLs.
Do not include items without dates.
Do not include speculative language.

H00 Incomplete issue error signaling (must still publish)
If any of these cannot be satisfied: minimum total items, per-category minimum, source diversity, attribution completeness, URL verification, then:
1) still write content.js with all valid items found,
2) intentionally trigger the on-page error banner by causing a controlled validation failure in one column (for example, omit the primary headline in a dedicated final column titled "ERROR" by leaving it empty), and
3) include in the first paragraph of the first column a short line listing violated constraints using these tokens exactly:
MIN_ITEMS, SOURCE_DIVERSITY, ATTRIBUTION, URL_VERIFY.

I00 Attribution requirements
DAILY_DIR/index.html must include an attribution footer crediting:
"Newspaper Style Design Experiment" on CodePen by user "silkine" and stating the layout is adapted and content rendered via a DOM-based builder.
Root index.html must include the same attribution once.

J00 Success criteria (the agent must verify before stopping)
The agent must not stop until all are true:
1) DAILY_DIR exists and contains index.html, main.js, styles.css, content.js, news_sources.md.
2) content.js contains at least 12 items unless H00 triggered, and includes dates and URLs for every item.
3) Source diversity requirements are met unless H00 triggered.
4) Root index.html links to DAILY_DIR/index.html within the managed region.
