import { spawn } from "node:child_process";

await run("node", ["./scripts/build-site.mjs"]);
await run("node", ["./scripts/static-server.mjs", "--root", "dist", "--port", "4173"]);

async function run(command, args) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} exited with ${code}`));
    });
  });
}
