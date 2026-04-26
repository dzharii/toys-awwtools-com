2026-04-26

see the following file that contains implementation checklists plus some additional instructions for OpenAI Codex: suggestions001-6.md

A00 Usage Scenarios: Topic Research Notepad

---

This document describes ten usage scenarios for the Topic Research Notepad. These scenarios are written to expose the product intent from the user's side: what problem exists before the software is opened, what the user is trying to accomplish, what environment they are working in, what friction they are trying to avoid, and how the notepad features become useful during real research.

The scenarios are not implementation tickets. They are product context. Later, individual requirements, UI flows, and acceptance criteria can be extracted from them.

---

B00 Scenario 1: Maya, a web developer comparing authentication libraries

---

Maya is a web developer working late in a browser with several tabs open. Her current task is to choose an authentication library for a small internal tool. She has a GitHub repository open in one tab, a documentation page in another, a discussion thread in another, and two search results that look temporarily useful but not important enough to bookmark.

Her problem is not that she cannot find information. Her problem is that the useful information is scattered and short-lived. One repository has a good example of middleware usage. Another page has a warning about token refresh behavior. A comment in an issue mentions a bug that may affect her project. If she copies all of this into a normal note-taking app, she has to leave the browser context repeatedly. If she does not copy it, she will probably lose the thread after closing tabs.

Maya opens the Topic Research Notepad and creates a page called `Auth library comparison`. The page appears in the left sidebar immediately. It is not a file she has to save manually. It becomes a local research page as soon as she creates it.

She adds a heading named `Candidates`. Under it, she creates a small table with columns for `Library`, `Pros`, `Risks`, and `Source`. The table is not a spreadsheet. It is just enough structure to compare three libraries while she reads.

When she finds a useful GitHub README section, she copies a small piece of text and pastes it into the editor. The pasted content does not bring GitHub's styles, fonts, layout, or hidden markup into the notepad. The app converts it into clean local blocks. A heading becomes a heading block. A paragraph becomes a paragraph block. A list becomes a local list block. Maya does not need to clean the paste manually.

She inserts a source link block under the table and pastes the repository URL. The block stores the URL, a title, and a short note: `Middleware example is clear, but refresh token section is incomplete.` Later, when she returns to this research page, the source is still attached to the observation. She does not need to reconstruct where the thought came from.

The important feature for Maya is structured capture. She uses tables, source links, paste cleanup, and local autosave heavily. She does not care about task management. She does not need sharing. She needs a stable local place to gather evidence while she evaluates technical options.

---

C00 Scenario 2: Anton, an accountant researching a tax rule

---

Anton is an accountant preparing guidance for a small business client. He is reading government pages, professional articles, and forum discussions about a tax rule that changed recently. The pages are dense. Some are official. Some are commentary. Some are misleading.

Anton needs to separate facts from interpretation. He opens the Topic Research Notepad and creates a page called `2026 equipment deduction research`. In the sidebar, he already has older pages from previous research: `Mileage rates`, `Contractor forms`, and `Quarterly payment penalties`. The sidebar matters because Anton's research is cumulative. He does not want to create another anonymous text file that disappears into a downloads folder.

He starts the page with a heading: `Official sources`. Then he adds source link blocks for the official pages he trusts. Each source link block has a title, URL, domain, note field, and timestamp. Anton writes short notes beside each link: `Primary rule`, `Effective date`, `Client-facing explanation needed`.

When he reads a paragraph that sounds important, he copies it into the notepad. The quote becomes a quote block. The application preserves the text but not the website's formatting. Anton adds an attribution note so he can later distinguish official language from his own explanation.

He uses a list block for open questions: `Does this apply to leased equipment?`, `Check state-level treatment`, `Confirm threshold amount`. He does not need task assignment or due dates. A simple local list is enough.

Later, Anton uses search. He remembers seeing the phrase `leased equipment` but not which page contained it. He types the phrase into the search field. The app finds the matching research page and the block where the phrase appears. He opens the result and continues working.

The important feature for Anton is provenance. He needs source blocks, quote blocks, search, and clean pasted text. The application helps him preserve confidence about where each piece of information came from.

---

D00 Scenario 3: Elena, a graduate student building a literature trail

---

Elena is a graduate student reading articles for a seminar paper. Her browser is full of abstracts, PDF landing pages, library records, and citation pages. She is not ready to write the paper yet. She is still mapping the topic.

Her usual workflow is fragile. She opens tabs, saves PDFs, copies titles into a document, and later realizes she cannot remember which paper supported which idea. Bookmarks preserve links, but they do not preserve her reasoning. A word processor preserves notes, but it is too far away from the active browsing context.

Elena opens the Topic Research Notepad and creates a page called `Urban heat island mitigation`. She uses headings to divide the page into `Key claims`, `Methods`, `Data sources`, and `Papers to read fully`.

For each useful article page, she creates a source link block. She does not need rich link previews from the network. She only needs the title, URL, domain, and her own note. She writes notes like `Good survey, not empirical`, `Useful data table`, and `Check citation trail`.

When she pastes an abstract, the app normalizes it into readable local text. It does not bring the publisher's embedded spans, font sizes, or citation widgets. When she pastes a small table from a report, the app converts it into a simple editable table if possible. If the table is too complex, it falls back to readable text. Elena prefers this because she wants the information, not the original page design.

She later exports the page as Markdown. The export gives her a clean starting point for a writing outline: headings, quotes, links, and notes in a readable file. She is not exporting because she wants to leave the app permanently. She is exporting because research eventually needs to move into another writing environment.

The important feature for Elena is transformation. The notepad turns browsing fragments into clean research material that can later become an outline.

---

E00 Scenario 4: Noah, a support engineer investigating a customer issue

---

Noah is a support engineer investigating an intermittent bug reported by a customer. He has an internal issue page open, a public documentation page, a few code search results, and a browser console snippet. He needs to collect evidence quickly before the thread becomes confusing.

He creates a page called `Customer issue - export timeout`. The title is practical and temporary. He expects to archive the page after the issue is resolved.

He starts with a source link to the customer report. Then he adds a code block containing an error message copied from a log. The code block keeps whitespace and monospaced formatting. It does not try to treat the log as rich text. Under it, he adds a list of hypotheses: `Large export size`, `Expired session token`, `Background job queue delay`, `Network retry missing`.

Noah uses the editor like a live investigation pad. He moves blocks up and down as the investigation changes. A hypothesis that initially seemed important becomes less relevant, so he moves it below the source evidence. A new source link from documentation becomes more important, so he places it near the top.

He uses autosave without thinking about it. When he switches pages or reloads the app, the latest state is still there. This matters because support work is interrupt-driven. A call can start, a Slack message can arrive, or the browser can be closed accidentally. The research page should not depend on Noah remembering to press save.

When the issue is resolved, Noah exports the page as Markdown and pastes the summary into the ticket. The exported document includes code blocks, links, and bullet lists. He then archives the page so it leaves the active sidebar but remains recoverable if the customer reopens the issue.

The important feature for Noah is interruption tolerance. He uses autosave, code blocks, source links, block reorder, Markdown export, and archive.

---

F00 Scenario 5: Priya, a product manager comparing competitor behavior

---

Priya is a product manager studying how several competitor products handle onboarding. She opens marketing pages, help-center articles, screenshots, pricing pages, and release notes. Most of the material is not important enough to save permanently, but some observations are useful.

She creates a page called `Onboarding comparison`. She uses a table as the main structure. The columns are `Product`, `Observed behavior`, `Evidence`, and `Follow-up`. Each row is one competitor or product surface.

As she browses, she creates source link blocks for pages that support specific observations. She copies the important URL into the `Evidence` column or places a source block below the table. She writes short paragraph blocks after each source: `They explain setup through checklist language`, `They avoid technical terms until step three`, `Pricing page links to migration guide earlier than expected`.

Priya does not need the app to be a full document editor. She needs frictionless capture and comparison. She should be able to paste, type, add a row, add a source, and continue browsing.

The sidebar becomes useful after several sessions. Priya has pages for `Onboarding comparison`, `Pricing page language`, and `Activation metrics examples`. She switches between them without hunting through files. The sidebar gives her a working memory of active research topics.

The important feature for Priya is page navigation plus lightweight tables. The app helps her keep competitive observations in a structured form while still moving quickly through websites.

---

G00 Scenario 6: Daniel, a hobbyist repairing a motorcycle

---

Daniel is not a software professional. He is repairing an older motorcycle in his garage and using a tablet browser to look up forum posts, part diagrams, vendor pages, and video descriptions. His hands are dirty, the connection is unreliable, and he keeps finding useful details buried in long threads.

He creates a page called `Carburetor rebuild notes`. The title appears in the sidebar next to other pages: `Battery replacement`, `Paint codes`, and `Torque specs`.

Daniel copies a forum comment that mentions a specific jet size. The paste comes from an old forum with messy HTML. The notepad stores the meaningful text as a quote block and discards the forum's styling. He adds a source link block to the forum thread because he may need to reread the surrounding discussion later.

He uses a simple list block for parts to check: `Float needle`, `Bowl gasket`, `Pilot jet`, `Fuel line`. He uses another list for observations after testing. He does not care about Markdown syntax, component models, or database design. He cares that the page is still there tomorrow.

The app's local-first behavior matters here. Daniel is not signing into anything. He is not syncing across a company account. He is building a local repair notebook in the browser.

The important feature for Daniel is simplicity. He uses pages, lists, quotes, source links, and persistence. The interface should not require him to understand advanced concepts.

---

H00 Scenario 7: Sofia, a lawyer collecting citations for a memo

---

Sofia is a lawyer preparing a short memo. She is reading statutes, case summaries, agency guidance, and prior internal notes. Accuracy matters. She needs to separate quoted material from her own interpretation.

She creates a page called `Vendor classification memo`. She immediately creates headings: `Primary law`, `Agency guidance`, `Cases`, `Open questions`, and `Draft position`.

When she finds important text, she pastes it as a quote block. The visual distinction between quote blocks and paragraph blocks matters. Sofia needs to look at the page later and immediately know which words are copied from a source and which words are her own.

She adds source link blocks near quotes. Each source block stores URL, title, domain, and timestamp. She writes notes like `Use cautiously`, `Check currentness`, and `Strong support for section 2`.

The app's paste cleanup is important because legal and government websites often contain complex markup. Sofia does not want pasted content to carry hidden layout or strange formatting. She wants clean, readable, locally styled material.

Before sending anything to a colleague, she exports the page as Markdown and reviews the result. The export is not a legal citation manager. It is a clean research transfer: headings, quotes, source URLs, and her notes.

The important feature for Sofia is separation of evidence and analysis. Quote blocks, source link blocks, clean paste, headings, and export support this workflow.

---

I00 Scenario 8: Marcus, a developer debugging an unfamiliar API

---

Marcus is integrating with an API he has not used before. He has the official docs open, a code sample, a GitHub issue, a Stack Overflow answer, and a local test script. He keeps discovering small details that are easy to forget: header names, endpoint quirks, rate-limit notes, and error response examples.

He creates a page called `Payment API integration notes`. He adds a heading for `Authentication`, another for `Webhook verification`, and another for `Error handling`.

He copies a code sample into a code block. Then he adds a source link block under it pointing to the documentation page. He writes a note: `Official example uses old SDK method; check issue below.` Then he pastes the GitHub issue link into another source block and records the workaround.

Marcus frequently uses search. A day later, he remembers that one source mentioned `idempotency`, but he does not remember whether it was in the docs or an issue. Search finds the matching block. Because source link blocks index title, URL, note, and captured text, he can recover the context quickly.

He also uses JSON backup because he is experimenting with the app itself. He wants a way to protect his local data before updating the proof-of-concept build.

The important feature for Marcus is technical fidelity. Code blocks, source links, search, autosave, and backup are the main value.

---

J00 Scenario 9: Claire, a journalist assembling background research

---

Claire is a journalist preparing for an interview. She is reading company pages, archived press releases, public filings, old interviews, and social media links. She is not drafting the article yet. She is assembling a background file.

She creates a page called `Interview background - renewable startup`. The page starts as a loose collection. She adds source links first, then quotes, then her own questions.

A key part of her workflow is speed. When she sees a useful passage, she wants to capture it immediately before the page changes or she gets pulled into another source. The notepad lets her paste the passage, normalize it, and keep going. She adds a note under the quote: `Ask whether this target was met.`

Claire uses block movement as the page develops. At first, the page is chronological. Later, she reorganizes it into themes: `Funding`, `Technology claims`, `Regulatory risk`, and `Interview questions`. She moves blocks under the relevant headings. The editor does not need complex drag nesting. Simple move controls or straightforward reorder behavior are enough.

Before the interview, she exports a Markdown version of the page. It becomes a compact briefing document containing links, quotes, and questions.

The important feature for Claire is turning chaotic browsing into an interview-ready briefing. She uses fast insertion, quote blocks, source links, headings, reorder, and Markdown export.

---

K00 Scenario 10: Owen, a small business owner researching software tools

---

Owen owns a small landscaping business. He is choosing scheduling software. He is not technical, but he is comfortable with the browser. He opens review pages, pricing pages, help articles, and vendor comparison posts. Every page claims something different.

He creates a page called `Scheduling software options`. He makes a simple table with columns for `Tool`, `Price`, `Mobile app`, `Crew scheduling`, and `Concern`. He fills it gradually as he reads.

When he sees a pricing page, he creates a source link block. When he sees a review mentioning poor mobile performance, he pastes the relevant sentence into a quote block. When he notices a question he needs to ask a sales representative, he adds it to a list.

Owen's main fear is losing track. He does not want a complex research system. He wants the browser to remember what he found. The sidebar gives him confidence that the page exists. Autosave gives him confidence that he does not need to manage files. Search helps when he remembers a product name but not where he wrote it.

The visual style matters for Owen in a practical way. The app should feel like a tool with visible controls, not an invisible canvas that hides actions behind gestures. Buttons, panels, and status text help him understand what the app is doing.

The important feature for Owen is approachable structure. He uses the sidebar, table, list, quote, source link, autosave, and search, without needing advanced editor knowledge.

---

L00 Cross-Scenario Feature Coverage

---

Across these scenarios, the same product pattern repeats in different environments. The user is already inside the browser. The useful information is distributed across pages. The user does not want to switch applications or manage files manually. The notepad provides a local topic page, clean capture, structured blocks, source preservation, autosave, search, and export.

Different users emphasize different features. Technical users rely more on code blocks, source links, search, and backup. Research-heavy users rely more on quote blocks, headings, source provenance, and export. Comparison workflows rely on tables. Everyday users rely on lists, persistence, and visible navigation. The product should support all of these without becoming a full office suite.

The central requirement is that the application stays close to the research moment. It should reduce the distance between finding something useful and preserving it in a meaningful local structure.

