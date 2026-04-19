2026-01-23

Content preservation and deduplication policy (rev01)
Do not miss, drop, or lose content. The default action is to preserve source material verbatim where the XML schema allows it, and otherwise preserve it by faithful transcription or tight, lossless restructuring (for example, splitting into multiple fields rather than shortening). Deduplication is allowed only when it is clearly redundant. When deduplicating, keep a single canonical copy and link all duplicates to it (by references, aliases, or notes supported by the schema). Never deduplicate by deleting unique details; if two entries look similar but contain different nuances, keep both or merge while retaining all distinct information.

If any schema or application constraint forces removal or shortening, treat that as an exception path: minimize the change, keep the maximum information possible, and record exactly what changed and why in the completion report driven by index.md.

Technical dry summary (rev00)

```md
Task: Migrate idioms listed in index.md into one target XML, preserve existing C99 content, integrate updated XML into app.

Authoritative idiom list:
- index.md (idiom inventory and source pointers)

Idiom source files (read):
- new-data-to-process/*.txt (Markdown content despite .txt extension)
- new-data-to-process/dev-c99-mini-idioms.md
- new-data-to-process/c99-leetcode.h (extract reusable idioms/patterns only; no style guide)

XML schema examples (read only, no edits):
- data-to-process/*.xml (all except target)

XML destination (the only XML file to edit):
- data-to-process/2026-01-23T17-29-14-b800cfeb-732b-4665-8987-5df0fd3aab5b.xml

App integration references (read):
- suggestion-001.md
- suggestion-002.md
- suggestion-003.md

App integration targets (edit as needed):
- index.html (embed/copy updated XML if app expects inline XML)
- app.js (update loader/parsing to use target XML if app expects external load)
- styles.css (edit only if required for new section rendering)

Merge rules:
- Preserve all existing C99 reference content in target XML.
- Add new dedicated "idioms" section in target XML using established schema.
- Every idiom entry title/key must start with a consistent prefix: "idiom: <Name>" (or one chosen convention used everywhere).
- Preserve content: no omissions; store full descriptions/snippets where schema permits.
- Deduplicate only clearly redundant duplicates; keep canonical entry + references/aliases; never drop unique details.

Validation:
- Updated target XML must be well-formed and schema-consistent with examples.
- App must load updated XML and allow searching for "idiom" + idiom name.

Completion report:
- Walk index.md and confirm each idiom is present in target XML.
- Report totals: indexed, migrated, deduplicated/merged, exceptions (with reasons).
```

C00 Specification addendum text to insert into the coding-agent prompt (rev00)
Add these requirements to the existing specification/prompt:

1. Content retention: Every idiom listed in index.md must be migrated with no loss of substantive content. Prefer verbatim preservation. If the XML schema limits formatting, preserve by restructuring rather than shortening.
2. Deduplication: Allowed only for true duplicates. Deduplicate by selecting a canonical entry and mapping duplicates to it while retaining all distinct details. Do not deduplicate away unique information.
3. Exceptions: If any omission or reduction is unavoidable due to schema or app constraints, minimize it and explicitly record what changed and why in the index.md-driven completion report.




A00 History and current state (rev00)
In the previous step of this project, the idioms across the Markdown sources and c99-leetcode.h were already discovered and consolidated into a single idiom index file named index.md. That index.md is now the authoritative inventory of idioms to migrate into the XML-based reference system. This new task is not about re-discovering idioms; it is about using index.md as the control plane to extract each idiom's content from its source location and then merging those idioms into one specific XML file that the application uses as its reference dataset.

The repository already contains a working web application (index.html, app.js, styles.css) and three integration guidance documents (suggestion-001.md, suggestion-002.md, suggestion-003.md). The folder data-to-process contains multiple XML files that collectively serve as examples of the expected XML structure and conventions. Only one XML file is the edit target for this task: data-to-process/2026-01-23T17-29-14-b800cfeb-732b-4665-8987-5df0fd3aab5b.xml.

B00 Goal and vision (rev00)
The goal is to enhance the application's C99 reference dataset by adding a new, clearly separable section that contains all indexed idioms. The existing XML already contains a C99 reference section (existing content). The new work must preserve that existing C99 reference content and merge in a new idioms section that enables searching by a consistent keyword prefix, so developers can quickly find implementation guidance by querying for "idiom" plus the idiom name.

The intended experience is that a developer can search within the app for "idiom <name>" (or an equivalent idiom-prefixed identifier) and land on a high-quality entry that contains the idiom description and optionally an illustrative snippet or structured details derived from the original sources. The new idioms section must be explicitly distinct from the existing C99 reference content, so later maintenance and further processing are straightforward and low-risk.

C00 Files and inputs the agent must use (rev00)
The agent must treat index.md as the authoritative task list of idioms, including the mapping from idiom name to source file and approximate location. The agent must use index.md to locate and extract the underlying idiom content from the original source files referenced by the index (for example, the Markdown-in-.txt files, dev-c99-mini-idioms.md, and c99-leetcode.h). The agent must also inspect the XML examples in data-to-process to learn the XML schema and conventions, but must not modify those other XML files.

The agent must read suggestion-001.md, suggestion-002.md, and suggestion-003.md to understand how the application expects XML to be structured, loaded, referenced, or embedded. The agent must read the application code (index.html and app.js at minimum) to ensure the final XML is integrated correctly.

D00 Outputs and required artifacts (rev00)
Artifact 1 is the updated XML file at exactly this path, and only this XML file is allowed to be modified as XML content: data-to-process/2026-01-23T17-29-14-b800cfeb-732b-4665-8987-5df0fd3aab5b.xml.

Artifact 2 is the application integration change that makes the app use the updated XML. The integration mechanism must be derived from the existing project conventions and the suggestion-00x documents. If integration requires editing index.html and/or app.js, those edits are allowed and expected. The XML-edit restriction applies only to which XML file may be changed; it does not forbid changes to the web app files required to load or embed the updated XML.

Artifact 3 is a completion report, driven by index.md, demonstrating that every idiom listed in index.md has been migrated into the updated XML. The completion report can be emitted in the agent's final output as a structured summary, or recorded in a separate markdown file if the repository conventions already support that. If a file is created for reporting, it must not replace index.md unless explicitly required by existing project conventions.

E00 XML schema discovery and constraints (rev00)
Before editing the target XML file, the agent must infer the XML schema by inspecting multiple example XML files in data-to-process. The agent must identify the root element, required attributes, how entries are represented, how sections or categories are encoded, and how search keys or titles are stored. The agent must replicate the established schema and conventions exactly, including ordering, attribute naming, escaping rules, and any required metadata fields.

The agent must validate that the edited target XML remains well-formed and consistent with the schema patterns used by the other XML files. Validation means at minimum: XML parses without errors; required fields present for entries; no broken entities; no structural drift from examples.

F00 Idiom extraction and transformation rules (rev00)
The agent must iterate idiom-by-idiom using index.md as the checklist. For each idiom, the agent must open the referenced source file and extract the idiom content near the referenced location. The extraction should favor: idiom name, a concise but descriptive explanation, and any canonical snippet or pattern that makes the idiom actionable. When the source is c99-leetcode.h, the agent must only extract reusable idioms and commonly used patterns and must not transform the result into a style guide. The focus is on what can be reused across problems, not how the file prefers to format code.

Every idiom entry added to the XML must be clearly separated from the existing C99 reference content by belonging to a new dedicated idioms section. Each idiom entry name must begin with a consistent idiom prefix so it is searchable as a group and individually. Use a single convention everywhere, such as "idiom: <IdiomName>" or "idiom <IdiomName>", and apply it uniformly across all idiom entries. The prefix must be part of the searchable title or key field used by the app.

Content preservation is preferred. The agent should not remove existing C99 reference content from the target XML. For the new idiom entries, the agent should not delete meaningful details present in the source documents. Light editing is allowed when needed to fix obvious issues, improve clarity, normalize terminology, or resolve formatting mismatches with the XML schema. If any content must be removed to satisfy schema constraints or app limitations, the agent must minimize removals, keep a short rationale in the completion report, and prefer summarizing rather than deleting.

G00 Merging strategy inside the target XML (rev00)
The target XML currently contains an existing C99 reference dataset. The agent must add a new section dedicated to idioms without disrupting the existing section(s). The new section must be positioned in a place consistent with the example XML conventions, such as alongside other top-level sections or appended in the schema-approved manner.

Each idiom entry must include, where the schema allows it, at least: the idiom-prefixed name/title, a description, and optionally a code snippet or structured fields. If the schema supports tags, keywords, or aliases, the agent should add the idiom name without the prefix as an additional keyword to improve search while keeping the title prefixed.

H00 Application integration requirements (rev00)
After producing a valid updated target XML, the agent must integrate it into the application so that the new idiom entries are visible and searchable. The agent must determine the integration method by reading suggestion-001.md, suggestion-002.md, and suggestion-003.md, then inspecting index.html and app.js to see how XML is currently loaded or embedded.

If the app expects XML to be embedded directly in index.html, the agent must copy the updated XML content into the correct location in index.html, following the established pattern (for example, a script tag, a template tag, a literal string, or a separate fetch path). If the app expects to fetch the XML as a file at runtime, the agent must ensure the fetch points to the updated target XML, or that the build/runtime packaging includes it, consistent with existing repo conventions. The agent must not introduce a second competing XML source unless the suggestions explicitly recommend doing so.

The integration must preserve existing functionality and must not break the current C99 reference browsing. The new idioms section must be additive.

I00 Completion reporting driven by index.md (rev00)
The agent must report completion by walking index.md and confirming each idiom is present in the updated XML. The report must at minimum state: total idioms in index.md, total idioms added to XML, and whether any idioms were skipped or merged as duplicates. If duplicates exist (the same idiom appears multiple times in index.md), the agent should still ensure the final XML has one canonical entry per idiom, unless the application schema explicitly requires multiple entries.

If any idiom could not be migrated due to missing source text, ambiguity, or schema limitation, the agent must list it explicitly in the completion report with a brief reason and the corresponding index.md reference.

J00 Hard constraints and safety rails (rev00)
Only this XML file may be edited as an XML file: data-to-process/2026-01-23T17-29-14-b800cfeb-732b-4665-8987-5df0fd3aab5b.xml. The agent may read other XML files for examples, but must not modify them.

The agent may edit index.html and app.js (and other non-XML files if strictly necessary) to integrate the updated XML into the app, guided by suggestion-001.md through suggestion-003.md and existing code conventions.

The agent must keep the existing C99 reference content in the target XML. Additive merge is the default behavior.

K00 Prompt for the coding agent (rev00)
You are a coding agent working in this repository. The idioms have already been indexed in index.md (this file is the authoritative checklist). Your job is to migrate every idiom listed in index.md into the application's XML reference dataset by editing exactly one XML file, then integrate that updated XML into the web app so the idioms are searchable.

Edit target (the only XML file you may modify as XML):
data-to-process/2026-01-23T17-29-14-b800cfeb-732b-4665-8987-5df0fd3aab5b.xml

Steps you must follow:
First, read index.md and treat it as the complete list of idioms to migrate, including source file and approximate location per idiom.
Second, for each idiom in index.md, open the referenced source file and extract the idiom content near the referenced location. Favor a clear idiom name, a descriptive explanation, and a usable snippet or pattern when available. For c99-leetcode.h, extract only reusable idioms and commonly used patterns; do not turn it into a style guide.
Third, learn the XML schema by inspecting multiple example XML files in data-to-process. Do not modify those example XML files. Identify how sections and entries are represented and replicate those conventions exactly.
Fourth, edit the target XML file by preserving the existing C99 reference content and adding a new dedicated idioms section. Every new idiom entry must have a name/title that begins with a consistent prefix, such as "idiom: <IdiomName>" (choose one convention and apply it uniformly). This prefix must be part of the app-searchable identifier so developers can search for "idiom" plus the idiom name.
Fifth, validate that the edited target XML is well-formed and consistent with the schema conventions. Fix escaping and structural issues as needed. Prefer not to remove content; light editing for clarity and schema fit is allowed.
Sixth, integrate the updated XML into the application. Read suggestion-001.md, suggestion-002.md, and suggestion-003.md to understand the intended integration approach, then inspect index.html and app.js to implement it. If the app embeds XML into index.html, copy the updated XML into the correct place in index.html using the existing pattern. If the app loads XML from a file, ensure it loads the updated target XML and that the new idioms are accessible. Preserve existing C99 reference functionality and make the idioms section additive.
Finally, produce a completion report driven by index.md confirming that every idiom listed there has been migrated into the updated XML (with deduplication if needed). Report total idioms, total migrated, and list any exceptions with reasons and index.md references.

Constraints:
Do not modify any XML file except the target XML path listed above.
Do not delete or disrupt the existing C99 reference content in the target XML; add a new idioms section alongside it.
Prefer additive, descriptive entries; do not remove meaningful source content unless required for schema correctness or app constraints, and document any such removals in the completion report.
