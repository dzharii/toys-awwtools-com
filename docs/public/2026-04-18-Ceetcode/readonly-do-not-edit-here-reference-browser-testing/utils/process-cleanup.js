const { execFileSync } = require("child_process");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function listBrowserProcesses() {
  let output = "";
  try {
    output = execFileSync("bash", ["-lc", "pgrep -a -f '(chrome|chromium|headless_shell)' || true"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    output = "";
  }

  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const firstSpace = line.indexOf(" ");
      const pid = Number(line.slice(0, firstSpace));
      const command = line.slice(firstSpace + 1);
      return { pid, command };
    })
    .filter((item) => Number.isInteger(item.pid))
    .filter((item) => !/pgrep -a -f/.test(item.command));
}

function diffProcesses(before, after) {
  const beforeIds = new Set(before.map((item) => item.pid));
  return after.filter((item) => !beforeIds.has(item.pid));
}

async function terminateProcesses(processes, logger, label) {
  if (!processes.length) {
    logger.log(`No ${label} processes required cleanup.`);
    return;
  }

  const forceKillEnabled = process.env.BROWSER_TEST_FORCE_KILL_LEFTOVERS === "1";

  logger.warn(`Detected ${label} processes that outlived the current run.`, {
    count: processes.length,
    processes,
    forceKillEnabled,
  });

  if (!forceKillEnabled) {
    logger.warn(
      `Skipping automatic termination for ${label} processes because cross-run cleanup is unsafe by default. Set BROWSER_TEST_FORCE_KILL_LEFTOVERS=1 to re-enable forceful cleanup.`,
    );
    return;
  }

  logger.warn(`Attempting graceful shutdown for ${label} processes.`, {
    count: processes.length,
    processes,
  });

  for (const processInfo of processes) {
    try {
      process.kill(processInfo.pid, "SIGTERM");
    } catch (error) {
      logger.warn(`SIGTERM failed for ${label} process.`, { pid: processInfo.pid, error: error.message });
    }
  }

  await sleep(1_000);

  const remaining = listBrowserProcesses().filter((item) => processes.some((processInfo) => processInfo.pid === item.pid));
  if (!remaining.length) {
    logger.log(`Graceful cleanup completed for ${label} processes.`);
    return;
  }

  logger.warn(`Force killing leftover ${label} processes.`, { remaining });
  for (const processInfo of remaining) {
    try {
      process.kill(processInfo.pid, "SIGKILL");
    } catch (error) {
      logger.error(`SIGKILL failed for ${label} process.`, { pid: processInfo.pid, error: error.message });
    }
  }
}

module.exports = {
  listBrowserProcesses,
  diffProcesses,
  terminateProcesses,
  sleep,
};
