const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { sanitizeSegment } = require("../utils/logger");
const { ExploratorySession } = require("../utils/exploratory-session");

async function main() {
  const projectRoot = path.resolve(__dirname, "..", "..");
  const args = parseArgs(process.argv.slice(2));
  const charterPath = resolveCharterPath(projectRoot, args.charter || "explorer-desktop-sweep");
  const charter = JSON.parse(fs.readFileSync(charterPath, "utf8"));
  const runId = sanitizeSegment(new Date().toISOString());

  if ((args.baseline || "acceptance") === "acceptance") {
    await runAcceptanceBaseline(projectRoot);
  }

  const session = new ExploratorySession({
    projectRoot,
    runId,
    sessionSlug: args.session || charter.id,
  });

  await session.start({
    title: charter.title,
    charterId: charter.id,
    iteration: args.iteration || charter.iteration || "",
    intent: args.intent || charter.intent || "",
    headless: args.headed ? false : true,
  });

  session.initializeReport({
    title: charter.title,
    startedAt: new Date().toISOString(),
    goal: charter.goal,
    intent: args.intent || charter.intent || "",
    reviewQuestions: normalizeList(args.question, charter.reviewQuestions),
    reminders: charter.reminders,
    baseline: charter.baseline,
  });

  try {
    printIntro(charter, session);
    await executeCharter(session, charter);
  } finally {
    await session.stop();
  }
}

async function executeCharter(session, charter) {
  for (const step of charter.steps || []) {
    for (const action of step.actions || []) {
      await executeAction(session, action);
    }
    await session.captureStep(step);
    if (step.observation) {
      session.addObservation(step.observation, {
        step: step.id,
        verdict: step.verdict || "recorded",
      });
    }
  }
}

async function runAcceptanceBaseline(projectRoot) {
  await new Promise((resolve, reject) => {
    const child = spawn("npm", ["run", "test:browser:acceptance"], {
      cwd: projectRoot,
      stdio: "inherit",
      shell: true,
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Acceptance baseline failed with code ${code}`));
    });
  });
}

function printIntro(charter, session) {
  console.log(`Exploratory charter: ${charter.title}`);
  console.log(`Session report: ${session.reportPath}`);
  if (charter.intent) {
    console.log(`Intent: ${charter.intent}`);
  }
  if ((charter.reviewQuestions || []).length) {
    console.log("Quality questions:");
    charter.reviewQuestions.forEach((item, index) => {
      console.log(`  Q${index + 1}. ${item}`);
    });
  }
  console.log("Anti-tunnel-vision reminders:");
  charter.reminders.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item}`);
  });
}

function resolveCharterPath(projectRoot, charterArg) {
  if (charterArg.endsWith(".json") || charterArg.includes("/")) {
    return path.resolve(projectRoot, charterArg);
  }
  return path.join(projectRoot, "browser-tests", "exploratory", "charters", `${charterArg}.json`);
}

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      result[key] = true;
      continue;
    }
    result[key] = next;
    index += 1;
  }
  return result;
}

function normalizeList(cliValue, charterValues) {
  if (cliValue && typeof cliValue === "string") {
    return cliValue
      .split("|")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return Array.isArray(charterValues) ? charterValues : [];
}

async function executeAction(session, action) {
  switch (action.type) {
    case "open":
      await session.explorer.open();
      return;
    case "selectProblemByTitle":
      await session.explorer.selectProblemByTitle(action.value);
      return;
    case "selectProblemById":
      await session.explorer.selectProblemById(action.value);
      return;
    case "searchFor":
      await session.explorer.searchFor(action.value || "");
      return;
    case "clickQuickView":
      await session.explorer.clickQuickView(action.value);
      return;
    case "resetFilters":
      await session.explorer.resetFilters();
      return;
    case "openRoadmap":
      await session.explorer.openRoadmap();
      return;
    case "selectRoadmapProblem":
      await session.explorer.selectRoadmapProblem(action.value);
      return;
    case "filterRoadmapPhase":
      await session.explorer.filterRoadmapPhase(action.value);
      return;
    case "openSolutions":
      await session.explorer.openSolutions();
      return;
    case "selectSolutionLanguage":
      await session.explorer.selectSolutionLanguage(action.value);
      return;
    case "selectSolutionSource":
      await session.explorer.selectSolutionSource(action.value);
      return;
    case "closeSolutions":
      await session.explorer.closeSolutions();
      return;
    case "toggleDetailWidth":
      await session.explorer.toggleDetailWidth();
      return;
    case "selectInlineSolutionLanguage":
      await session.explorer.selectInlineSolutionLanguage(action.value);
      return;
    case "openInlineSolutionSpoiler":
      await session.explorer.openInlineSolutionSpoiler(action.value);
      return;
    case "openFirstGuideFromOverview":
      await session.explorer.openFirstGuideFromOverview();
      return;
    case "openGuideByTitle":
      await session.explorer.openGuideByTitle(action.value);
      return;
    case "goBackToExplorer":
      await session.explorer.goBackToExplorer();
      return;
    case "markSolved":
      await session.explorer.markSolved();
      return;
    case "togglePinned":
      await session.explorer.togglePinned();
      return;
    case "writeNote":
      await session.explorer.writeNote(action.value || "");
      return;
    case "toggleCompactCatalog":
      await session.explorer.toggleCompactCatalog();
      return;
    case "setSort":
      await session.explorer.setSort(action.value);
      return;
    case "toggleAdvancedFilters":
      await session.explorer.toggleAdvancedFilters();
      return;
    case "clickSidebarToken":
      await session.explorer.clickSidebarToken(action.value);
      return;
    case "scrollSurface":
      await session.explorer.scrollSurface(action.target || action.surface || action.value, action.position || "bottom");
      return;
    case "reload":
      await session.explorer.reload();
      return;
    case "clearSavedState":
      await session.explorer.clearSavedState();
      return;
    case "observe":
      session.addObservation(action.value || "Observation recorded from charter action.", {
        step: action.step || "",
        verdict: action.verdict || "recorded",
      });
      return;
    case "wait":
      await session.explorer.page.waitForTimeout(Number(action.value) || 250);
      return;
    default:
      throw new Error(`Unknown exploratory action type: ${action.type}`);
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
