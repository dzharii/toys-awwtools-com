/** Renderers for the run-level summary.md and findings.md files. */

interface ManifestTest {
  id: string;
  title: string;
  file: string;
  category: string;
  status: string;
  durationMs: number;
  errors: string[];
  folder: string;
}

interface Manifest {
  runId: string;
  seed: number;
  countRequested: number;
  countSelected: number;
  selectionMode: string;
  summary: { passed: number; failed: number; skipped: number; total: number };
  tests: ManifestTest[];
}

export function renderSummary(m: Manifest): string {
  const lines: string[] = [];
  lines.push(`# Agentic Analysis Run Summary`);
  lines.push("");
  lines.push(`- Run ID: \`${m.runId}\``);
  lines.push(`- Seed: \`${m.seed}\``);
  lines.push(`- Selection mode: ${m.selectionMode}`);
  lines.push(`- Selected: ${m.countSelected} of ${m.countRequested} requested`);
  lines.push(`- Passed: ${m.summary.passed}`);
  lines.push(`- Failed: ${m.summary.failed}`);
  lines.push(`- Skipped: ${m.summary.skipped}`);
  lines.push("");
  lines.push(`## Selected tests`);
  lines.push("");
  lines.push(`| # | ID | Category | Status | ms | Title | Folder |`);
  lines.push(`| - | -- | -------- | ------ | -- | ----- | ------ |`);
  m.tests.forEach((t, i) => {
    lines.push(`| ${i + 1} | ${t.id} | ${t.category} | ${t.status} | ${t.durationMs} | ${t.title.replace(/\|/g, "\\|")} | ${t.folder} |`);
  });
  lines.push("");
  const failing = m.tests.filter((t) => t.status !== "passed" && t.status !== "skipped");
  if (failing.length) {
    lines.push(`## Potential findings requiring review (failures)`);
    lines.push("");
    for (const t of failing) {
      lines.push(`- **${t.id}** (${t.status}): ${t.title}`);
      for (const e of t.errors.slice(0, 2)) lines.push(`  - ${e}`);
    }
    lines.push("");
  } else {
    lines.push(`## Potential findings requiring review`);
    lines.push("");
    lines.push(`No test failures. Review screenshots and layout snapshots for visual/usability findings that assertions cannot catch (spec W00).`);
    lines.push("");
  }
  lines.push(`## Reproduce`);
  lines.push("");
  lines.push("```text");
  lines.push(`cd ui-regression-test-suite`);
  lines.push(`bun run agent:run -- --count=${m.countRequested} --seed=${m.seed}`);
  lines.push("```");
  lines.push("");
  lines.push(`Artifacts: this folder. Open \`manifest.json\` to correlate each test id/step id with its screenshots, layout snapshots, DOM summaries, visible-element inventories, and diagnostics.`);
  return lines.join("\n") + "\n";
}

export function renderFindingsTemplate(runId: string, seed: number): string {
  return `# Agentic Analysis Findings

Run: ${runId}
Seed: ${seed}

---

## Review Checklist

- [ ] Open manifest.json.
- [ ] Review failed tests first.
- [ ] Review screenshots for every selected test.
- [ ] Review layout snapshots for overflow, clipping, stuck overlays, and invalid state.
- [ ] Review console/page/network/storage diagnostics.
- [ ] Review from Frank perspective.
- [ ] Review from Lily perspective.
- [ ] Review from Roman perspective.
- [ ] Classify findings as APP_BUG, TEST_BUG, HARNESS_TIMING, PRODUCT_DECISION, or VISUAL_MANUAL_ONLY.
- [ ] Add real app bugs to bugs-todo.md.
- [ ] Fix application bugs before weakening tests.
- [ ] Fix incorrect tests when tests are wrong.
- [ ] Re-run targeted tests.
- [ ] Re-run full validation when fixes are done.

---

## Findings

### Finding 001

Classification:
Test ID:
Step ID:
Persona:
Evidence:
Decision:
Action:
Status:
`;
}
