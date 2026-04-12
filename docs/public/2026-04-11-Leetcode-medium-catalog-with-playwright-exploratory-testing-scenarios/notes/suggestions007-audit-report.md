# Suggestions007 Audit Report

Date: 2026-04-11

## Scope

This audit verified the `suggestions007.md` requirements against the current explorer build, using both the stable acceptance suite and a dedicated Playwright exploratory charter.

The audit covered:

- widened reading mode for the selected problem
- embedded spoiler-gated source inside the site
- collapsed spoiler visibility and clarity
- multi-language solution switching
- explicit repository and source-file attribution
- focused deep-inspection workspace behavior
- preservation of the non-spoiling field-guide-first default state

## Evidence

- Acceptance log: [2026-04-11t23-54-46.376z.log](/mnt/d/git-repos-leetcode-codex-research-2026-02-27/browser-tests/logs/2026-04-11t23-54-46.376z.log)
- Exploratory session report: [report.md](</mnt/d/git-repos-leetcode-codex-research-2026-02-27/browser-tests/exploratory/sessions/2026-04-11t23-54-56.184z-explorer-suggestions007-audit/report.md>)
- Exploratory screenshots: [session screenshots](</mnt/d/git-repos-leetcode-codex-research-2026-02-27/browser-tests/exploratory/sessions/2026-04-11t23-54-56.184z-explorer-suggestions007-audit/screenshots>)
- Manual review screenshots:
  - [detail-default.png](/mnt/d/git-repos-leetcode-codex-research-2026-02-27/browser-tests/manual-review/detail-default.png)
  - [detail-widened.png](/mnt/d/git-repos-leetcode-codex-research-2026-02-27/browser-tests/manual-review/detail-widened.png)
  - [inline-solution-list-clean.png](/mnt/d/git-repos-leetcode-codex-research-2026-02-27/browser-tests/manual-review/inline-solution-list-clean.png)
  - [solution-workspace-modal.png](/mnt/d/git-repos-leetcode-codex-research-2026-02-27/browser-tests/manual-review/solution-workspace-modal.png)

## Tooling Changes Made During This Audit

The exploratory runner was extended so this audit is reusable:

- added charter `browser-tests/exploratory/charters/explorer-suggestions007-audit.json`
- added runner actions for:
  - `toggleDetailWidth`
  - `selectInlineSolutionLanguage`
  - `openInlineSolutionSpoiler`
  - `selectSolutionLanguage`
  - `selectSolutionSource`
  - `observe`
- expanded exploratory report snapshots to include:
  - `detailExpanded`
  - `solutionOpen`
  - `solutionLanguages`
- added script:
  - `npm run test:browser:explore:suggestions007`

## Issues Found And Fixed

### 1. Inline spoiler attribution was incomplete inside the reveal

Problem:

- The inline spoiler card header identified the repository, but the revealed spoiler body did not restate repository attribution clearly enough.
- This failed the acceptance test and also fell short of the requirement that attribution remain explicit inside the source reveal.

Fix:

- Added repository identity inside the spoiler body.
- Added repository and original-file links inside the reveal itself.
- Kept the attribution note adjacent to the code block.

Files:

- [app.js](/mnt/d/git-repos-leetcode-codex-research-2026-02-27/app.js)
- [styles.css](/mnt/d/git-repos-leetcode-codex-research-2026-02-27/styles.css)

### 2. Supporting writeup links rendered raw markdown link text

Problem:

- The exploratory screenshot review exposed writeup labels such as `[91. Decode Ways](...)` rendering as literal text inside the inline solution cards.
- This looked low quality and weakened the solution workspace polish.

Fix:

- Added `formatWriteupTitle(...)` in the UI layer to strip markdown-link wrappers and leading markdown heading markers before rendering.

Files:

- [app.js](/mnt/d/git-repos-leetcode-codex-research-2026-02-27/app.js)

## Acceptance Criteria Status

### 1. Wider or focused reading mode

Status: implemented and verified.

Evidence:

- acceptance test: `inspection panel can widen for deeper reading`
- visual comparison between [detail-default.png](/mnt/d/git-repos-leetcode-codex-research-2026-02-27/browser-tests/manual-review/detail-default.png) and [detail-widened.png](/mnt/d/git-repos-leetcode-codex-research-2026-02-27/browser-tests/manual-review/detail-widened.png)

Assessment:

- the widened state is clear, reversible, and materially improves the right-hand reading surface
- orientation is preserved because the catalog remains visible beside the expanded detail pane

### 2. Embedded full source code, not just path references

Status: implemented and verified.

Evidence:

- inline spoiler reveal path
- focused modal solution workspace
- generated solution payloads in [data/solutions](/mnt/d/git-repos-leetcode-codex-research-2026-02-27/data/solutions)

Assessment:

- the site now embeds actual source content locally and does not depend on local repo paths being available after publication

### 3. Spoiler-gated by default

Status: implemented and verified.

Evidence:

- exploratory step 1 shows implementations advertised but closed by default
- exploratory step 3 verifies collapsed spoiler visibility without source exposure

Assessment:

- the product still behaves like a field guide first
- solutions are clearly available but not shown accidentally

### 4. Multiple languages where available

Status: implemented and verified.

Evidence:

- acceptance test: `solution workspace opens with attributed languages and annotated code`
- exploratory step 5 recorded languages for `Decode Ways`:
  - Python
  - C++
  - Java
  - Go
  - TypeScript
  - JavaScript
  - C#
  - C

Assessment:

- multi-language coverage is surfaced in a readable way in both inline and focused inspection flows

### 5. Explicit attribution

Status: implemented and verified.

Evidence:

- inline cards show repository and original path
- spoiler body now repeats repository identity and upstream links
- focused workspace shows repository, file URL, repository URL, and enhancement note

Assessment:

- attribution is visible at both summary and reveal levels, which matches the requirement

### 6. Correct upstream repository linkage from Git metadata

Status: implemented and carried through the data layer.

Evidence:

- solution payloads include `repositoryUrl` and `sourceUrl`
- generator resolves repository remotes from local git metadata rather than hardcoded guesses

Assessment:

- the published site can point to the real upstream repository and exact file URL even when local clones are absent

### 7. Reviewed and enhanced code

Status: implemented and verified.

Evidence:

- inline spoiler shows reviewed code with `[Reader note]` comments
- focused workspace shows reviewed commentary plus line annotations

Assessment:

- the embedded code is not raw text only; it is explicitly presented as an attributed source with reader-oriented explanatory enhancement

### 8. Coherent detail experience

Status: implemented and verified.

Evidence:

- exploratory session showed no product-level breakage after adding the richer solution layer
- the detail pane still prioritizes overview, placement, and practice framing above solutions

Assessment:

- the solution workspace now follows naturally from repository support instead of replacing the field-guide behavior

## Final Judgment

`suggestions007.md` is implemented at the required product level.

The final validated state is:

- 9 acceptance tests passed
- dedicated `suggestions007` exploratory audit completed successfully
- the audit found 2 real issues
- both issues were fixed and revalidated

No remaining blocking defects were found in the final pass.

## Run Commands

```bash
npm run test:browser:acceptance
npm run test:browser:explore:suggestions007 -- --baseline skip
```
