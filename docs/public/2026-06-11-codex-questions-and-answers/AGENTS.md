# AGENTS.md

---

A00 Purpose

---

Directive: It is required that this repository be treated as a question-and-answer publication project for conversations with a coding agent.

Directive: It is required that every accepted user question be answered directly and also recorded as a durable entry in both `index.md` and `index.html`.

Directive: It is required that all requirements in this file be treated as mandatory unless the user explicitly overrides a requirement in a later instruction.

Directive: It is required that no requirement in this file be treated as a suggestion, preference, or optional guideline.

---

B00 Maintained Files

---

Directive: It is required that the agent maintain exactly two public log files named `index.md` and `index.html` unless the user explicitly asks for additional output files.

Directive: It is required that `index.md` and `index.html` contain the same substantive question-and-answer content.

Directive: It is required that `index.md` remain readable in plain text, source-control diffs, terminals, and Markdown previewers.

Directive: It is required that `index.html` provide a richer browser presentation using semantic HTML, minimal CSS, internal navigation, and readable visual hierarchy.

Directive: It is required that the agent update both files in the same work session whenever a new question, answer, correction, reference, or topic is added.

Directive: It is required that the agent never update only one of the two files when the update affects shared content.

---

C00 Entry Schema

---

Directive: It is required that each recorded entry include a stable topic identifier.

Directive: It is required that each recorded entry include a concise topic title.

Directive: It is required that each recorded entry include the date and time when the question was asked.

Directive: It is required that each recorded entry include the timezone when the timezone is known.

Directive: It is required that each recorded entry include the original user question or a faithful excerpt when the original question is very long.

Directive: It is required that each recorded entry include a rewritten public question that preserves the user's intent while improving clarity.

Directive: It is required that each recorded entry include an explicit answer written for publication.

Directive: It is required that each recorded entry include references when the answer relies on project files, external sources, commands, code, or prior discussion.

Directive: It is required that each recorded entry include a status such as `answered`, `draft`, `needs-follow-up`, or `corrected`.

Directive: It is required that each recorded entry include tags when tags improve navigation or retrieval.

---

D00 Question Processing

---

Directive: It is required that the agent preserve the meaning and intent of the user's original question.

Directive: It is required that the agent rewrite the public question only to improve readability, specificity, grammar, structure, and publication quality.

Directive: It is required that the agent not add assumptions to the rewritten question unless those assumptions are clearly stated in the answer.

Directive: It is required that the agent keep the original question available so that later readers can compare the source wording with the published wording.

Directive: It is required that the agent split a broad user question into separate topic entries only when doing so improves readability and does not distort the user's request.

---

E00 Answer Requirements

---

Directive: It is required that every answer begin with a direct response to the rewritten public question.

Directive: It is required that every answer be explicit enough that a reader can understand what the agent will do, what the agent did, or what the agent recommends.

Directive: It is required that every answer separate facts, assumptions, decisions, and open questions when that separation affects correctness.

Directive: It is required that every answer include implementation details when the question asks how a task will be performed.

Directive: It is required that every answer avoid vague claims such as `handled`, `fixed`, or `improved` unless the answer explains what changed.

Directive: It is required that every answer state uncertainty, limits, missing data, or failed checks when those details affect trust.

Directive: It is required that every answer include code, commands, file paths, or examples when those details are necessary for the reader to reproduce the work.

---

F00 Thread Model

---

Directive: It is required that the log be organized as a topic discussion thread.

Directive: It is required that each topic be treated as a top-level thread.

Directive: It is required that follow-up questions be recorded under the most relevant existing topic when they continue the same discussion.

Directive: It is required that a new topic be created when the user introduces a distinct subject, project area, decision, or implementation task.

Directive: It is required that the thread layout support chronological reading and direct linking to individual topics.

Directive: It is required that the HTML presentation feel similar to a clean discussion forum: topic cards, metadata, readable answers, and visible relationships between original questions and replies.

Directive: It is required that the design remain original and not copy any specific third-party site's branding, layout, class names, or visual identity.

---

G00 Markdown Formatting

---

Directive: It is required that `index.md` use flat Markdown headings for the document title, table of contents, topics, and replies.

Directive: It is required that `index.md` avoid deep nesting so that the file remains easy to read in raw text.

Directive: It is required that `index.md` use plain Markdown tables only when a compact metadata block is clearer than prose.

Directive: It is required that `index.md` use fenced code blocks for code, commands, HTML fragments, JSON, and other literal content.

Directive: It is required that `index.md` keep each topic self-contained so a reader can copy a topic without needing hidden context.

---

H00 HTML Formatting

---

Directive: It is required that `index.html` be a complete standalone HTML document.

Directive: It is required that `index.html` use semantic elements such as `main`, `nav`, `section`, `article`, `header`, `time`, and `footer` where appropriate.

Directive: It is required that `index.html` include minimal embedded CSS unless the user explicitly asks for a separate stylesheet.

Directive: It is required that `index.html` include a readable page header, a topic navigation area, and separate thread cards for each topic.

Directive: It is required that `index.html` use stable element IDs for every topic so internal links remain reliable.

Directive: It is required that `index.html` support rich answer content, including tables, callouts, code blocks, and safe embedded HTML sections.

Directive: It is required that `index.html` place optional rich HTML fragments inside clearly marked containers such as `.html-embed`.

Directive: It is required that `index.html` remain usable without JavaScript unless the user explicitly asks for interactive behavior.

---

I00 Visual Design

---

Directive: It is required that the HTML design use a restrained visual system with readable typography, generous spacing, and clear contrast.

Directive: It is required that topic cards use subtle borders, shadows, spacing, or background differences to separate discussions.

Directive: It is required that tags, status labels, or topic types use color coding only when the color improves scanning.

Directive: It is required that color never be the only way to understand status or meaning.

Directive: It is required that the layout work on narrow and wide screens.

Directive: It is required that code blocks and long questions wrap or scroll safely without breaking the page layout.

---

J00 Accessibility and Usability

---

Directive: It is required that the HTML document include a correct language attribute, character encoding, viewport metadata, and a useful page title.

Directive: It is required that heading levels be logical and not skip levels for decorative reasons.

Directive: It is required that links have meaningful text.

Directive: It is required that timestamps use the `datetime` attribute when practical.

Directive: It is required that the document remain readable in print or saved-page contexts.

---

K00 Synchronization Rules

---

Directive: It is required that the agent compare `index.md` and `index.html` after every content update to confirm that both files contain the same substantive topics.

Directive: It is required that topic IDs, titles, dates, statuses, tags, original questions, rewritten questions, answers, and references match across both files.

Directive: It is required that differences caused only by presentation format be acceptable.

Directive: It is required that differences in meaning, missing topics, missing references, stale answers, or conflicting metadata be corrected before the work is considered complete.

Directive: It is required that the agent preserve prior entries unless the user explicitly asks to remove or rewrite them.

Directive: It is required that corrections be recorded by updating the relevant topic status or by adding a correction note when the historical trail matters.

---

L00 New Topic Procedure

---

Directive: It is required that the agent assign a stable ID before adding a new topic.

Directive: It is required that the stable ID follow the pattern `tYYYYMMDD-NNN-short-slug` unless the project already uses another pattern.

Directive: It is required that the agent capture the asked date and time before writing the answer.

Directive: It is required that the agent write a concise public question before writing the published answer.

Directive: It is required that the agent add or update the topic navigation in both files.

Directive: It is required that the agent add the topic body in both files.

Directive: It is required that the agent verify that both files still open and remain readable after the update.

Directive: It is required that the agent report the changed files and a short summary of the recorded topic when the work is complete.

---

M00 Reference Handling

---

Directive: It is required that references identify the source used by the answer.

Directive: It is required that references to repository files include the file path.

Directive: It is required that references to external material include enough source information for a reader to identify the material.

Directive: It is required that references be omitted only when the answer is self-contained and does not rely on external or project-specific sources.

Directive: It is required that the agent not invent references.

---

N00 Safety and Integrity

---

Directive: It is required that the agent sanitize or avoid unsafe HTML when the content comes from untrusted input.

Directive: It is required that the agent not include secrets, credentials, private keys, tokens, or sensitive personal data in either public log file.

Directive: It is required that the agent redact sensitive values if they appear in the user's question and are not needed for the public record.

Directive: It is required that the agent preserve code correctness over decorative formatting.

Directive: It is required that the agent not claim that a command, test, build, or deployment succeeded unless it actually ran or the user supplied evidence.

---

O00 Minimal File Templates

---

Directive: It is required that `index.md` use this topic structure unless the user asks for a different structure.

```md
## Topic: <title>

Topic ID: <id>
Asked: <YYYY-MM-DD HH:MM timezone>
Status: <status>
Tags: <comma-separated tags>

Original question:
<original question or faithful excerpt>

Published question:
<clear public version of the question>

Answer:
<explicit answer>

References:
<references or `None`>
```

Directive: It is required that `index.html` use this topic structure unless the user asks for a different structure.

```html
<article class="topic-card" id="<id>">
  <header class="topic-header">
    <p class="eyebrow">Topic</p>
    <h2><a href="#<id>"><title></a></h2>
    <p class="meta">
      <time datetime="<iso-datetime>"><human-readable datetime></time>
      <span class="status">answered</span>
      <span class="tag">workflow</span>
    </p>
  </header>
  <section class="question original">
    <h3>Original question</h3>
    <p><original question or faithful excerpt></p>
  </section>
  <section class="question published">
    <h3>Published question</h3>
    <p><clear public version of the question></p>
  </section>
  <section class="answer">
    <h3>Answer</h3>
    <p><explicit answer></p>
  </section>
  <footer class="references">
    <h3>References</h3>
    <p><references or `None`></p>
  </footer>
</article>
```

---

P00 Completion Standard

---

Directive: It is required that the work be considered complete only when `index.md` and `index.html` are both updated, internally consistent, and readable.

Directive: It is required that the agent provide a concise completion note that names the files changed and states what topic was added or updated.
