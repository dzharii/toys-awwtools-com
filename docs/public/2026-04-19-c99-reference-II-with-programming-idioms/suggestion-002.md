Request: Add a permanently visible informational block at the very bottom of the page (after all rendered reference content). It must explain, in first person, what this project is, how the content was produced, which AI assistants and models were used (including this assistant), that the site was built with OpenAI Codex, and it must acknowledge the syntax-highlighting library.

Text to place in the informational block:
"I built this C99 reference as a single-page, offline-first cheat sheet I can keep open while I code. The goal is fast lookup of signatures, parameter rules, return behavior, and safe usage patterns, without tab switching and without hiding content that breaks browser search.

The content on this page started as structured XML documents generated with AI assistance. I iterated on the structure and wording until each entry had deterministic rules, clear constraints, and copy-pasteable examples. The XML is embedded directly into this HTML file, and a small vanilla JavaScript renderer parses it, builds a navigation index, and renders everything in a consistent layout.

AI tools used: I used ChatGPT (GPT-5.2 Thinking) to design the XML structure and draft the documentation content. I used OpenAI Codex to implement the page itself (HTML, CSS, and vanilla JavaScript) and to integrate the embedded XML into the final single-page reference.

Code blocks are highlighted with microlight.js (ASVD, microlight 0.0.7), a tiny client-side syntax highlighter used to improve code readability without external dependencies. The microlight library is bundled locally with this project so the page works fully offline.

Created: 2026-01-20."
