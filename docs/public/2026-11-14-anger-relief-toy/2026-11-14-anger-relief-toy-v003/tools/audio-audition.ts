import { mkdir, writeFile } from "node:fs/promises";
await mkdir("evidence/004/audio-audition", { recursive: true });
const result = await Bun.build({
  entrypoints: ["tools/audition/main.ts"],
  outdir: "evidence/004/audio-audition",
  naming: "audition.js",
  target: "browser",
  minify: true,
});
if (!result.success) throw new AggregateError(result.logs, "Audition build failed");
await writeFile(
  "evidence/004/audio-audition/index.html",
  `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Anger Relief Toy sound audition</title><style>body{font:16px/1.5 system-ui;max-width:900px;margin:32px auto;padding:20px;background:#f4f8fa;color:#26323c}section{padding:16px;background:white;margin:12px 0;border-radius:12px}button{font:inherit;padding:8px;margin:4px;border:1px solid #b8cbd4;border-radius:8px;background:#f7fafb}h2{margin:0 0 8px;font-size:18px}pre{white-space:pre-wrap}</style><h1>Sound audition</h1><p>Development review. Start with low speaker volume. These controls use the extension's actual profiles and shared Web Audio service. Listening and native offline metrics have not been verified in the restricted build environment.</p><label>Volume <input id="volume" type="range" min="0" max="100" value="20"></label><button id="mute">Mute</button><pre role="status"></pre><main></main><script src="audition.js"></script></html>`,
);
