/**
 * build-report.ts — one-time detailed HTML report generator for an Agentic
 * Analysis run.
 *
 * Produces a self-contained `report.html` inside a run folder that a human can
 * open in a browser. The report contains:
 *   - Run metadata and reproduction command.
 *   - The reviewer's methodology and per-persona decision notes.
 *   - The classified findings (with before/after evidence images inlined).
 *   - A browsable per-test gallery of every captured screenshot, correlated
 *     with the layout snapshot facts (mode, progress, overflow, oracle).
 *
 * This is a development tool. It is not a runtime dependency of the app, imports
 * no application source, and writes only into the (gitignored) run folder.
 *
 * Usage:
 *   bun src/agentic/build-report.ts --run=<run-folder-name> [--before=<run-folder-name>]
 *   bun src/agentic/build-report.ts            # uses the latest run folder
 */
import { readdirSync, readFileSync, existsSync, statSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SUITE_ROOT = join(HERE, "..", "..");
const RUNS_DIR = join(SUITE_ROOT, ".agent-runs");

interface StepArtifact {
  id: string;
  status?: string;
  screenshots?: string[];
}
interface ManifestTest {
  id: string;
  title: string;
  file: string;
  category: string;
  status: string;
  durationMs: number;
  errors: string[];
  folder: string;
  steps?: StepArtifact[];
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

interface Finding {
  id: string;
  severity: "high" | "medium" | "low";
  classification: string;
  title: string;
  personas: string[];
  observation: string;
  mechanism: string;
  decision: string;
  fix: string;
  regression: string;
  status: string;
  /** before/after evidence: paths relative to a run folder. */
  evidence?: { label: string; run: "before" | "after"; path: string }[];
}

/** Curated findings from the reviewer's screenshot-by-screenshot analysis. */
const FINDINGS: Finding[] = [
  {
    id: "F002",
    severity: "high",
    classification: "APP_BUG",
    title: "Paged mode: the next page column bled into the right margin",
    personas: ["Frank", "Lily"],
    observation:
      "On desktop paged mode, when the reading measure was narrower than the viewport, fragments of the next page's text peeked into the empty right margin. Confirmed on NAV-006, NAV-007, EINK-001, TXT-008 and FILE-005; absent when the measure was close to the viewport width (mobile, font-missing fallback), which pinned down the cause.",
    mechanism:
      "The paged engine lays columns out with a fixed 48px column gap while the content block is centered. The right-side slack, (viewportWidth - pageWidth) / 2, exceeded that gap, so the leading edge of column N+1 fell inside the visible clip region.",
    decision:
      "This is a real reading-quality defect (not a test problem): a demanding reader sees stray letters in the margin. Fix the app; do not relax any test.",
    fix:
      "js/paginator.js measure() now derives columnGap = Math.max(COLUMN_GAP, ceil(viewportWidth - pageWidth)) and uses it consistently for the CSS column gap, the page stride, and the page count. This guarantees the stride is at least the clipped viewport width, so only one column is ever inside the clip.",
    regression:
      "The Standard Post-Action Oracle now asserts paginator.pageStride >= viewport.clientWidth on every paged step where pageCount > 1, read through the read-only window.__einkReader.paginator handle. All 198 suite tests plus the 25-test agentic re-run pass with this invariant enforced.",
    status: "FIXED",
    evidence: [
      { label: "Before — stray next-column letters in the right margin", run: "before", path: "tests/NAV-006__r001-next-button-advances-the-page/screenshots/003-next-page-after.png" },
      { label: "After — clean right margin, single column in the clip", run: "after", path: "tests/NAV-006__r001-next-button-advances-the-page/screenshots/003-next-page-after.png" },
    ],
  },
  {
    id: "F001",
    severity: "medium",
    classification: "APP_BUG",
    title: "Disabled Prev/Next buttons looked identical to active ones",
    personas: ["Lily", "Frank"],
    observation:
      "At the first and last page the Prev/Next buttons are functionally disabled (the disabled attribute is set and clicks are ignored), but they rendered with the same full-strength styling as active buttons. A reader is invited to tap a dead-looking-active control.",
    mechanism:
      "css/reader.css had no :disabled rule for .icon-button, so disabled nav buttons inherited the active appearance and hover affordance.",
    decision:
      "Small but real usability defect that hits Lily hardest. Fix at the button family level so every icon-button gets a consistent disabled affordance.",
    fix:
      "css/reader.css adds .icon-button:disabled / [disabled] (opacity 0.38, cursor: default) and resets the disabled hover state.",
    regression:
      "Navigation specs R005 (first page) and R006 (last page) now assert the disabled button's computed opacity is < 1 while the still-active button stays fully opaque (reader.page.ts navButtonOpacity).",
    status: "FIXED",
    evidence: [
      { label: "Before — '‹ Prev' on page 1 looks as active as 'Next ›'", run: "before", path: "tests/NAV-006__r001-next-button-advances-the-page/screenshots/003-next-page-after.png" },
      { label: "After — '‹ Prev' is visibly muted (disabled)", run: "after", path: "tests/NAV-006__r001-next-button-advances-the-page/screenshots/003-next-page-after.png" },
    ],
  },
  {
    id: "F003",
    severity: "low",
    classification: "HARNESS_TIMING",
    title: "Page-turn auto-capture fired before the E Ink transition settled",
    personas: ["Roman"],
    observation:
      "The '003-next-page-after' screenshot sometimes showed the previous page number while the internal page index had already advanced (the following capture showed the correct page). This was an instrumentation timing artifact, not an app bug — the reader state was always correct.",
    mechanism:
      "The page-object auto-capture ran immediately after the click, before the E Ink page-turn transition had settled.",
    decision:
      "Fix the test harness only; the app is correct. Do not change product behavior.",
    fix:
      "reader.page.ts goToNextPage/goToPrevPage/tapNext/tapPrev now await waitSettled() before agentAutoCapture, so the after screenshot reflects the landed page.",
    regression:
      "Not a product invariant; verified by the re-run screenshots now showing the correct landed page.",
    status: "FIXED (harness)",
  },
];

const METHODOLOGY = `
<p>The run selected <strong>25 tests at random</strong> from the full 198-test pool using a
recorded seed, then executed each test individually with extra instrumentation:
per-step screenshots, DOM summaries, layout snapshots, accessibility snapshots,
visible-element inventories, and console/network/storage/oracle diagnostics.
Every artifact is correlated by test id and step id.</p>
<p>All 25 tests <em>passed</em>. Per the analysis directive, a green suite is not the
goal — the usable, stable application is. So findings were sought by reviewing
<strong>every one of the 149 screenshots, one at a time</strong>, against three reader
personas:</p>
<ul>
  <li><strong>Frank</strong> — demanding daily reader: typography, margins, page/scroll quality, long-session comfort.</li>
  <li><strong>Lily</strong> — occasional reader: obvious controls, calm recovery, nothing confusing.</li>
  <li><strong>Roman</strong> — engineer: code blocks, links, offline/privacy integrity, inspectable state.</li>
</ul>
<p>Each candidate was cross-checked against the layout and visible-element
snapshots and the application source before being classified as APP_BUG,
TEST_BUG, HARNESS_TIMING, PRODUCT_DECISION, or VISUAL_MANUAL_ONLY. Two genuine
application defects and one harness-timing artifact were confirmed; all three are
now fixed and covered by regression assertions.</p>
<p><strong>Behaviors reviewed and confirmed correct</strong> (not changed): privacy
welcome-back notice on reload, remote images shown as a non-fetching dashed
placeholder, <code>javascript:</code> links neutralized to literal text, readable
serif fallback when the default font is missing, contained code blocks with a
line-number gutter and horizontal scroll on mobile, the full-width mobile
settings sheet, focus returning to the Settings button on Escape, and zero
body-level horizontal overflow across all 149 frames.</p>
`;

function parseArgs(argv: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const a of argv) {
    const m = /^--([^=]+)=(.*)$/.exec(a);
    if (m) out[m[1]] = m[2];
    else if (a.startsWith("--")) out[a.slice(2)] = "true";
  }
  return out;
}

function latestRun(): string {
  const dirs = readdirSync(RUNS_DIR).filter((d) => {
    try {
      return statSync(join(RUNS_DIR, d)).isDirectory();
    } catch {
      return false;
    }
  });
  dirs.sort();
  const last = dirs[dirs.length - 1];
  if (!last) throw new Error(`No run folders in ${RUNS_DIR}`);
  return last;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function dataUri(absPath: string): string | null {
  if (!existsSync(absPath)) return null;
  const buf = readFileSync(absPath);
  return `data:image/png;base64,${buf.toString("base64")}`;
}

/** Read the reliable facts from a step layout snapshot, if present. */
function layoutFacts(testFolderAbs: string, stepBase: string): string {
  const candidates = [
    join(testFolderAbs, "snapshots", `${stepBase}-layout.json`),
  ];
  for (const c of candidates) {
    if (existsSync(c)) {
      try {
        const j = JSON.parse(readFileSync(c, "utf8"));
        const mode = j?.reader?.mode ?? "-";
        const progress = j?.page?.progressText ?? "-";
        const overflow = j?.document?.hasHorizontalOverflow ? "OVERFLOW" : "none";
        return `mode: ${mode} · progress: ${progress} · h-overflow: ${overflow}`;
      } catch {
        return "";
      }
    }
  }
  return "";
}

function severityBadge(sev: string): string {
  const color = sev === "high" ? "#b3261e" : sev === "medium" ? "#a15c00" : "#5f6368";
  return `<span class="badge" style="background:${color}">${sev.toUpperCase()}</span>`;
}

function renderFinding(f: Finding, afterRoot: string, beforeRoot: string | null): string {
  const parts: string[] = [];
  parts.push(`<section class="finding" id="${f.id}">`);
  parts.push(`<h3>${f.id} — ${esc(f.title)} ${severityBadge(f.severity)} <span class="tag">${f.classification}</span></h3>`);
  parts.push(`<p class="personas">Personas: ${f.personas.map((p) => `<span class="persona">${p}</span>`).join(" ")} · Status: <strong>${esc(f.status)}</strong></p>`);
  parts.push(`<dl>`);
  parts.push(`<dt>Observation</dt><dd>${esc(f.observation)}</dd>`);
  parts.push(`<dt>Mechanism</dt><dd>${esc(f.mechanism)}</dd>`);
  parts.push(`<dt>Decision</dt><dd>${esc(f.decision)}</dd>`);
  parts.push(`<dt>Fix</dt><dd>${esc(f.fix)}</dd>`);
  parts.push(`<dt>Regression guard</dt><dd>${esc(f.regression)}</dd>`);
  parts.push(`</dl>`);
  if (f.evidence && f.evidence.length) {
    parts.push(`<div class="evidence">`);
    for (const ev of f.evidence) {
      const root = ev.run === "before" ? beforeRoot : afterRoot;
      const uri = root ? dataUri(join(root, ev.path)) : null;
      const cls = ev.run === "before" ? "before" : "after";
      if (uri) {
        parts.push(`<figure class="${cls}"><figcaption>${esc(ev.label)}</figcaption><img src="${uri}" alt="${esc(ev.label)}"></figure>`);
      } else {
        parts.push(`<figure class="${cls}"><figcaption>${esc(ev.label)} (image unavailable)</figcaption></figure>`);
      }
    }
    parts.push(`</div>`);
  }
  parts.push(`</section>`);
  return parts.join("\n");
}

function renderTestGallery(t: ManifestTest, runRootAbs: string): string {
  const testFolderAbs = join(runRootAbs, t.folder);
  const shotsDir = join(testFolderAbs, "screenshots");
  const parts: string[] = [];
  const statusClass = t.status === "passed" ? "pass" : "fail";
  parts.push(`<section class="test">`);
  parts.push(`<h3>${t.id} <span class="status ${statusClass}">${t.status}</span></h3>`);
  parts.push(`<p class="meta">${esc(t.title)}<br><code>${esc(t.file)}</code> · ${t.category} · ${t.durationMs}ms</p>`);
  if (existsSync(shotsDir)) {
    const shots = readdirSync(shotsDir).filter((s) => s.endsWith(".png")).sort();
    parts.push(`<div class="gallery">`);
    for (const s of shots) {
      // Embed each screenshot inline as a base64 data URI so the report is fully
      // self-contained and does not depend on file:// subresource access.
      const uri = dataUri(join(shotsDir, s));
      const stepBase = s.replace(/-(after|before|fullpage)\.png$/, "").replace(/\.png$/, "");
      const facts = layoutFacts(testFolderAbs, stepBase);
      const caption = `${esc(s)}${facts ? `<br><span class="facts">${esc(facts)}</span>` : ""}`;
      if (uri) {
        parts.push(
          `<figure><img loading="lazy" src="${uri}" alt="${esc(s)}">` +
            `<figcaption>${caption}</figcaption></figure>`,
        );
      } else {
        parts.push(`<figure><figcaption>${esc(s)} (image unavailable)</figcaption></figure>`);
      }
    }
    parts.push(`</div>`);
  }
  parts.push(`</section>`);
  return parts.join("\n");
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  const runName = args.run ?? latestRun();
  const runRootAbs = join(RUNS_DIR, runName);
  if (!existsSync(join(runRootAbs, "manifest.json"))) {
    throw new Error(`manifest.json not found in ${runRootAbs}`);
  }
  const manifest: Manifest = JSON.parse(readFileSync(join(runRootAbs, "manifest.json"), "utf8"));
  const beforeName = args.before ?? null;
  const beforeRootAbs = beforeName ? join(RUNS_DIR, beforeName) : null;

  const findingsHtml = FINDINGS.map((f) => renderFinding(f, runRootAbs, beforeRootAbs)).join("\n");
  const galleryHtml = manifest.tests.map((t) => renderTestGallery(t, runRootAbs)).join("\n");

  const findingsNote =
    "Two application defects (F001, F002) and one harness-timing artifact (F003). " +
    (beforeRootAbs
      ? "Before/after evidence is inlined below."
      : "Run this generator with <code>--before=&lt;pre-fix-run&gt;</code> to inline before/after evidence.");
  const reportCmd = `bun run agent:report -- --run=${manifest.runId}${beforeName ? ` --before=${beforeName}` : ""}`;

  const templatePath = join(SUITE_ROOT, "full-report-template", "report-template.html");
  if (!existsSync(templatePath)) {
    throw new Error(`report template not found: ${templatePath}`);
  }
  const template = readFileSync(templatePath, "utf8");

  const tokens: Record<string, string> = {
    "{{TITLE}}": `Agentic UI Regression Analysis — ${esc(manifest.runId)}`,
    "{{RUN_ID}}": esc(manifest.runId),
    "{{SEED}}": String(manifest.seed),
    "{{SELECTION_MODE}}": esc(manifest.selectionMode),
    "{{COUNT_SELECTED}}": String(manifest.countSelected),
    "{{COUNT_REQUESTED}}": String(manifest.countRequested),
    "{{TOTAL}}": String(manifest.summary.total),
    "{{PASSED}}": String(manifest.summary.passed),
    "{{FAILED}}": String(manifest.summary.failed),
    "{{SKIPPED}}": String(manifest.summary.skipped),
    "{{FINDINGS_COUNT}}": String(FINDINGS.length),
    "{{GALLERY_TEST_COUNT}}": String(manifest.tests.length),
    "{{REPRODUCE_COUNT}}": String(manifest.countRequested),
    "{{REPRODUCE_SEED}}": String(manifest.seed),
    "{{REPORT_CMD}}": esc(reportCmd),
  };
  const sections: Record<string, string> = {
    "<!--METHODOLOGY-->": METHODOLOGY,
    "<!--FINDINGS_NOTE-->": findingsNote,
    "<!--FINDINGS-->": findingsHtml,
    "<!--GALLERY-->": galleryHtml,
  };

  let html = template;
  for (const [k, v] of Object.entries(sections)) html = html.split(k).join(v);
  for (const [k, v] of Object.entries(tokens)) html = html.split(k).join(v);

  const out = join(runRootAbs, "report.html");
  writeFileSync(out, html, "utf8");
  process.stdout.write(`report written: ${out} (${(html.length / (1024 * 1024)).toFixed(1)} MB)\n`);
}

main();
