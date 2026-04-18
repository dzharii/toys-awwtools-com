const readline = require("readline/promises");
const { stdin, stdout } = require("process");
const path = require("path");
const { sanitizeSegment } = require("../utils/logger");
const { ExploratorySession } = require("../utils/exploratory-session");

async function main() {
  const projectRoot = path.resolve(__dirname, "..", "..");
  const args = parseArgs(process.argv.slice(2));
  const runId = sanitizeSegment(new Date().toISOString());
  const session = new ExploratorySession({
    projectRoot,
    runId,
    sessionSlug: "exploratory-repl",
  });

  await session.start({
    title: "Exploratory REPL",
    intent: args.intent || "",
    headless: false,
  });
  session.initializeReport({
    title: "Exploratory REPL",
    startedAt: new Date().toISOString(),
    goal: "Ad hoc browser exploration with reproducible screenshots and explicit notes.",
    intent: args.intent || "Manual browsing after acceptance, with screenshots and notes tied to specific observations.",
    reviewQuestions: normalizeList(args.question),
    reminders: [
      "Do not stare only at the control you just clicked.",
      "Scan for unrelated regressions after every interaction.",
      "Write observations as concrete evidence tied to a screenshot or state snapshot.",
    ],
    baseline: ["Use this after acceptance passes unless you are explicitly chasing a failure state."],
  });

  const rl = readline.createInterface({ input: stdin, output: stdout });

  try {
    await session.explorer.open();
    console.log(`Exploratory REPL started. Report: ${session.reportPath}`);
    console.log("Commands: help, snapshot, checkpoint <label>, screenshot <label>, note <text>, select <problem id>, search <text>, quick <view id>, reset, roadmap, roadmap-select <problem id>, solutions, solution-language <label>, guide, back, exit");

    while (true) {
      const line = (await rl.question("> ")).trim();
      if (!line) continue;
      const [command, ...rest] = line.split(" ");
      const payload = rest.join(" ").trim();

      if (command === "exit" || command === "quit") break;
      if (command === "help") {
        console.log("help | snapshot | checkpoint <label> | screenshot <label> | note <text> | select <problem id> | search <text> | quick <view id> | reset | roadmap | roadmap-select <problem id> | solutions | solution-language <label> | guide | back | exit");
        continue;
      }
      if (command === "snapshot") {
        console.log(await session.explorer.collectSnapshot());
        continue;
      }
      if (command === "checkpoint") {
        await session.captureStep({
          id: payload || "manual-checkpoint",
          title: payload || "Manual checkpoint",
          intent: "Pause, capture the current state, and review the surrounding interface before continuing.",
          focus: "Manual exploratory checkpoint",
          actions: [],
          lookAround: [
            "Look past the last clicked control and inspect nearby spacing, selection state, and copy tone.",
            "Check whether the current screen still feels coherent as a tool, not just technically functional.",
          ],
          reviewQuestions: ["Would I trust this state if I were choosing the next problem right now?"],
        });
        continue;
      }
      if (command === "screenshot") {
        await session.captureStep({
          id: payload || "manual-shot",
          title: payload || "Manual screenshot",
          intent: "Capture reproducible evidence for a manual review point.",
          focus: "Manual exploratory capture",
          actions: [],
          lookAround: ["Scan the rest of the visible frame, not only the intended widget."],
          reviewQuestions: [],
        });
        continue;
      }
      if (command === "note") {
        session.addObservation(payload || "Manual note", { source: "repl" });
        continue;
      }
      if (command === "select") {
        await session.explorer.selectProblemById(payload);
        continue;
      }
      if (command === "search") {
        await session.explorer.searchFor(payload);
        continue;
      }
      if (command === "quick") {
        await session.explorer.clickQuickView(payload);
        continue;
      }
      if (command === "reset") {
        await session.explorer.resetFilters();
        continue;
      }
      if (command === "roadmap") {
        await session.explorer.openRoadmap();
        continue;
      }
      if (command === "roadmap-select") {
        await session.explorer.selectRoadmapProblem(payload);
        continue;
      }
      if (command === "solutions") {
        await session.explorer.openSolutions();
        continue;
      }
      if (command === "solution-language") {
        await session.explorer.selectSolutionLanguage(payload);
        continue;
      }
      if (command === "guide") {
        await session.explorer.openFirstGuideFromOverview();
        continue;
      }
      if (command === "back") {
        await session.explorer.goBackToExplorer();
        continue;
      }

      console.log(`Unknown command: ${command}`);
    }
  } finally {
    rl.close();
    await session.stop();
  }
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

function normalizeList(value) {
  if (!value || typeof value !== "string") return [];
  return value
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
