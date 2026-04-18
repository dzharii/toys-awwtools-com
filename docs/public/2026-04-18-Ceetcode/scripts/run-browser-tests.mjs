import { spawn } from "node:child_process";
import http from "node:http";

const port = Number(process.env.PLAYWRIGHT_PORT || 4173);
const playwrightArgs = process.argv.slice(2);

await run("node", ["./scripts/build-site.mjs"]);
const server = spawn("node", ["./scripts/static-server.mjs", "--root", "dist", "--port", String(port)], { stdio: "inherit" });

try {
  await waitForHealth(`http://127.0.0.1:${port}/__health`, 40_000);
  await run("npx", ["playwright", "test", ...playwrightArgs]);
} finally {
  server.kill("SIGTERM");
}

async function run(command, args) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      env: { ...process.env, PLAYWRIGHT_BASE_URL: `http://127.0.0.1:${port}` }
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
    });
  });
}

async function waitForHealth(url, timeoutMs) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const ok = await new Promise((resolve) => {
      const request = http.get(url, (response) => {
        response.resume();
        resolve(response.statusCode === 200);
      });
      request.on("error", () => resolve(false));
    });

    if (ok) return;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for ${url}`);
}
