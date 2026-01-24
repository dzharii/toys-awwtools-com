A00 File purpose and scope
This document defines the operational contract for a coding agent that maintains a daily, static, newspaper-style news archive using the repository structure shown by the user. The agent produces one rendered newspaper page per day in a dated NEWS-YYYY-MM-DD folder, while keeping the template folder _00_template as read-only by default. The agent also maintains a top-level index.html that acts as an archive landing page linking to each dated day folder.

A01 Definitions
"Repository root" means the directory that contains index.html and the folders _00_template and NEWS-YYYY-MM-DD.
"Template folder" means the directory named _00_template under repository root. Its files are the canonical baseline implementation and are treated as read-only unless the user explicitly requests a template change.
"Daily folder" means a directory under repository root named NEWS-YYYY-MM-DD where YYYY-MM-DD is the current local date in America/Los_Angeles.
"Archive index" means the file index.html located at repository root.
"Daily page index" means the file index.html inside a daily folder.

A02 Source of truth for "current date"
The current date must be computed in the America/Los_Angeles timezone. The folder name must use zero-padded month and day. The agent must not infer the date from existing folder names if the computed current date differs; it must always use the computed current date.

B00 Repository invariants
The template folder exists at repository root with this exact name: _00_template.
Each daily folder name must start with NEWS- and must match NEWS-YYYY-MM-DD exactly.
The agent must never write files outside repository root, the daily folder for the current date, and the archive index, except when the user explicitly requests template modification.

B01 Template read-only policy
Default rule: the agent must treat all files under _00_template as read-only. Read-only means no edits, no formatting changes, and no automatic fixups.
Override rule: the agent may modify files under _00_template only if the user explicitly requests template modification in the current instruction set. The request must be direct and unambiguous.

B02 Read-only sentinel directives in HTML
The project uses explicit HTML comment sentinels as a machine-readable warning to prevent accidental template edits.

The agent must ensure the following two comment lines exist near the very top of the template folder's index.html (inside the file, before any substantive content). The agent may add these lines exactly once during initial setup, and after that must treat _00_template as read-only unless explicitly instructed otherwise.

Sentinel line 1:
<!-- READONLY: _00_template is a canonical template. Do not modify any files under _00_template unless the user explicitly requests a template change. -->

Sentinel line 2:
<!-- EDITING RULE: Make all daily edits only inside NEWS-YYYY-MM-DD for the current America/Los_Angeles date. -->

The agent must also ensure the same two comment lines exist near the top of the archive index (repository root index.html), placed as the first HTML comments inside the file.

Safety rule: the agent must never add, remove, or modify any other part of _00_template unless explicitly instructed by the user.

C00 Daily folder creation and initialization
On each run, the agent must perform this sequence, in this order.

C01 Verify or create the daily folder
Step 1. Compute the current local date (America/Los_Angeles) and format it as YYYY-MM-DD.
Step 2. Construct the daily folder name NEWS-YYYY-MM-DD.
Step 3. If the folder does not exist under repository root, create it.
Step 4. If it exists, do not rename it and do not create additional folders for the same date.

C02 Ensure daily folder contains required files
The daily folder must contain these files at minimum:
index.html, main.js, styles.css, content.js, and news_sources.md.

If the daily folder was newly created, the agent must copy these files from _00_template into the daily folder as the initial baseline:
index.html, main.js, styles.css, content.js.

The copy must preserve file names exactly and must not change file contents during copying.

If the daily folder already exists, the agent must not overwrite existing files. It may only edit:
content.js, news_sources.md, and the daily folder index.html
as required by this specification.

C03 Daily folder index behavior
The daily folder index.html must render the newspaper page for that day. It must load styles.css and load main.js then content.js using relative paths within the daily folder.

The daily folder index.html must not reference files in _00_template. Each daily folder must be a standalone snapshot.

D00 News sources contract
D01 news_sources.md purpose and placement
news_sources.md is the instruction file that defines what the agent should search and how it should categorize the newspaper content for the current day. It must live inside the current daily folder.

D02 news_sources.md required structure
news_sources.md must be plain markdown written for an agent. It must define all categories that content.js should fill for the day.

Each category entry must include:
1) Category name (stable identifier used as the column primary headline).
2) At least one search query seed phrase.
3) At least one preferred source type, or specific preferred domains.

If a category does not define any sources or seed phrases, the agent must treat the category as not actionable and must surface an error state in the rendered page.

D03 Default categories
If news_sources.md is missing in the daily folder, the agent must create it with this deterministic default category set, in this order:
World, US, Business, Technology, Science, Culture, Sports.

For each category, the agent must include:
two query seed phrases that include the date string YYYY-MM-DD,
and one seed phrase without the date string.

E00 Web search and selection rules for news items
E01 Recency window
The agent must prioritize items published within the last 48 hours relative to the current America/Los_Angeles time.
Items older than 7 days are disallowed unless the category explicitly requests retrospectives.

E02 Selection constraints per category
Each category must produce between 1 and 3 items.
If fewer than 1 credible item can be found, the agent must still render the category but must show an on-page error banner indicating the category has no items due to insufficient sources.

E03 Source attribution requirements
Every news item rendered into content.js must include:
the item title,
the publishing outlet or author,
the publication date,
and a source URL.

If any of these fields cannot be confidently determined, the item must not be used and the agent must choose a different item.

E04 Link format in newspaper content
Links must be rendered as plain text URLs or as explicit citation lines inside the article body as plain text, because the builder API treats inserted strings as textContent.
The agent must not attempt to inject anchor tags via HTML.

E05 Safety constraints for web content
The agent must not execute downloaded code, must not instruct running shell commands, and must not modify system configuration. The agent's work is limited to editing files in the repository according to this specification.

F00 content.js editing rules
F01 File ownership
content.js inside the current daily folder is the primary editable output. The agent must not edit main.js or styles.css inside the daily folder unless the user explicitly requests layout or API changes.

F02 Content readability requirements
The content.js structure must be easy to scan. Each addColumn block corresponds to exactly one category from news_sources.md, in the same order as listed in news_sources.md, unless explicitly requested otherwise.

Each column must begin with a primary headline that is exactly the category name.

F03 Per-item formatting rules inside a column
For each news item, the agent must add:
a secondary headline containing the item title,
a paragraph containing a 2 to 4 sentence factual summary,
and a paragraph containing the publication date, the source name, and the source URL.

Summaries must be factual and must not speculate.

F04 Error reporting integration
If the agent cannot satisfy the minimum item count per category, cannot attribute sources, or cannot meet recency constraints, the agent must ensure the rendered page enters an error state that is visible on-page.

The preferred mechanism is to rely on the builder's validation rules by producing an incomplete column (for example, missing a required field) such that the page renders an error banner.

The agent must not silently omit categories.

G00 Archive index.html behavior
G01 Purpose
The archive index.html at repository root is a navigation hub to all daily folders. It must not render the newspaper. It lists and links to each daily folder's index.html.

G02 Listing rules
The archive index must enumerate all folders under repository root matching NEWS-YYYY-MM-DD and list them in reverse chronological order (newest first).
Each listed entry must show the date string and link to NEWS-YYYY-MM-DD/index.html using a relative path.

G03 No template coupling
The archive index must not reference _00_template assets. It must be a standalone page.

H00 Agent execution sequence
On each execution, the agent must do all of the following in order:
1) Compute current America/Los_Angeles date.
2) Verify or create the corresponding NEWS-YYYY-MM-DD folder under repository root.
3) If the folder is new, copy index.html, main.js, styles.css, content.js from _00_template into it.
4) Ensure news_sources.md exists in the daily folder (create defaults if missing).
5) Read news_sources.md and perform web search per category.
6) Select 1 to 3 items per category according to constraints.
7) Update daily content.js to reflect the selected items using the builder API.
8) Ensure daily index.html loads local styles.css, main.js, and content.js.
9) Update repository root index.html to link to all daily folders and include the sentinel directives.
10) Ensure the attribution requirements are satisfied for both the daily page and the archive page.

I00 Non-negotiable prohibitions
The agent must not edit any files under _00_template except for the one-time insertion of the sentinel directives if they are missing, or if the user explicitly instructs template modification.
The agent must not use innerHTML in any generated or edited JavaScript.
The agent must not introduce external JavaScript dependencies, bundlers, or module loaders.
The agent must not remove or weaken the on-page error banner behavior.

J00 Attribution requirements
J01 Daily page attribution
Each daily folder index.html must include a readable attribution footer that credits the original inspiration:
"Newspaper Style Design Experiment" on CodePen by user "silkine",
and states that the layout is adapted and rendered via a DOM-based builder.

J02 Archive attribution
The repository root index.html must include the same attribution once.

K00 Output file requirement
The file agents.md must contain the full content of this document. The agent must treat agents.md as the controlling instruction source for the workflow described here.
