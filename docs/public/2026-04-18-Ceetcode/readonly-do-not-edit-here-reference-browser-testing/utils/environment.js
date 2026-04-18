const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFileSync } = require("child_process");

function tryCommand(command, args = []) {
  try {
    return execFileSync(command, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  } catch (error) {
    return "";
  }
}

function commandPath(command) {
  return tryCommand("bash", ["-lc", `command -v ${command} || true`]);
}

function readOsRelease() {
  const osReleasePath = "/etc/os-release";
  if (!fs.existsSync(osReleasePath)) return {};
  const raw = fs.readFileSync(osReleasePath, "utf8");
  return raw
    .split("\n")
    .filter(Boolean)
    .reduce((acc, line) => {
      const [key, ...rest] = line.split("=");
      acc[key] = rest.join("=").replace(/^"/, "").replace(/"$/, "");
      return acc;
    }, {});
}

function detectEntryPoint(projectRoot) {
  const indexPath = path.join(projectRoot, "index.html");
  const isStatic = fs.existsSync(indexPath);
  let title = "";
  if (isStatic) {
    const html = fs.readFileSync(indexPath, "utf8");
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    title = titleMatch ? titleMatch[1] : "";
  }
  return {
    isStaticSite: isStatic,
    entryPoint: isStatic ? "index.html" : null,
    title,
  };
}

function detectServerTooling(projectRoot) {
  const candidates = [
    "package.json",
    "scripts",
    "playwright.config.js",
    "browser-tests/scripts/static-server.js",
  ];
  return candidates.filter((candidate) => fs.existsSync(path.join(projectRoot, candidate)));
}

function collectEnvironmentSummary(projectRoot) {
  const osRelease = readOsRelease();
  const entry = detectEntryPoint(projectRoot);

  return {
    collectedAt: new Date().toISOString(),
    cwd: projectRoot,
    hostname: os.hostname(),
    platform: process.platform,
    arch: process.arch,
    kernel: tryCommand("uname", ["-a"]),
    osRelease,
    tools: {
      bash: commandPath("bash"),
      rg: commandPath("rg"),
      curl: commandPath("curl"),
      git: commandPath("git"),
      node: commandPath("node"),
      npm: commandPath("npm"),
      python3: commandPath("python3"),
      aptGet: commandPath("apt-get"),
      pgrep: commandPath("pgrep"),
      pkill: commandPath("pkill"),
      ss: commandPath("ss"),
    },
    versions: {
      node: tryCommand("node", ["--version"]),
      npm: tryCommand("npm", ["--version"]),
      python3: tryCommand("python3", ["--version"]),
    },
    browsers: {
      googleChrome: commandPath("google-chrome"),
      chromium: commandPath("chromium"),
      chromiumBrowser: commandPath("chromium-browser"),
    },
    project: {
      ...entry,
      existingServerTooling: detectServerTooling(projectRoot),
    },
  };
}

module.exports = {
  collectEnvironmentSummary,
};
