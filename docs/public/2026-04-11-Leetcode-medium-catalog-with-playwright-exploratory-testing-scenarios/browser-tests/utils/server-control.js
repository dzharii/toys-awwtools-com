const net = require("net");
const path = require("path");
const { spawn } = require("child_process");
const { sleep } = require("./process-cleanup");

async function findAvailablePort(startPort = 4173) {
  for (let port = startPort; port < startPort + 50; port += 1) {
    const available = await canBind(port);
    if (available) return port;
  }
  throw new Error(`No free port found in range ${startPort}-${startPort + 49}`);
}

function canBind(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.on("error", () => resolve(false));
    server.listen(port, "127.0.0.1", () => {
      server.close(() => resolve(true));
    });
  });
}

function startServer(projectRoot, port, logger) {
  const scriptPath = path.join(projectRoot, "browser-tests", "scripts", "static-server.js");
  const child = spawn(process.execPath, [scriptPath, "--root", projectRoot, "--port", String(port)], {
    cwd: projectRoot,
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.on("data", (chunk) => {
    const message = chunk.toString().trim();
    if (message) logger.log("server stdout", { message });
  });
  child.stderr.on("data", (chunk) => {
    const message = chunk.toString().trim();
    if (message) logger.warn("server stderr", { message });
  });
  child.on("exit", (code, signal) => {
    logger.log("server exited", { code, signal });
  });

  return child;
}

async function waitForServer(baseUrl, logger, timeoutMs = 20_000) {
  const started = Date.now();
  let attempt = 0;
  while (Date.now() - started < timeoutMs) {
    attempt += 1;
    try {
      const response = await fetch(`${baseUrl}/__health`, { redirect: "manual" });
      if (response.ok) {
        logger.log("server reachable", { baseUrl, attempt });
        return;
      }
    } catch (error) {
      logger.log("server not ready yet", { baseUrl, attempt, error: error.message });
    }
    await sleep(250);
  }
  throw new Error(`Timed out waiting for ${baseUrl}`);
}

async function stopServer(child, logger) {
  if (!child || child.killed || child.exitCode !== null) {
    logger.log("No server shutdown needed.");
    return;
  }

  logger.log("Stopping local server.", { pid: child.pid });
  child.kill("SIGTERM");

  const exited = await new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(false), 2_000);
    child.once("exit", () => {
      clearTimeout(timeout);
      resolve(true);
    });
  });

  if (exited) {
    logger.log("Local server stopped cleanly.");
    return;
  }

  logger.warn("Server did not exit after SIGTERM; sending SIGKILL.", { pid: child.pid });
  child.kill("SIGKILL");
}

module.exports = {
  findAvailablePort,
  startServer,
  stopServer,
  waitForServer,
};
