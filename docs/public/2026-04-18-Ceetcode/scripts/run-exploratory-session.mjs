import fs from "node:fs/promises";
import path from "node:path";

const sessionDir = path.join(process.cwd(), "tests", "exploratory", "sessions");
await fs.mkdir(sessionDir, { recursive: true });

const now = new Date();
const stamp = now.toISOString().replace(/[:.]/g, "-");
const file = path.join(sessionDir, `${stamp}.md`);

const template = `# Exploratory Session ${now.toISOString()}\n\n## Charter\n- Evaluate user confidence in the edit-run-debug loop.\n- Look for unclear compile/runtime/test messaging.\n- Confirm mobile view switching keeps editor/problem access.\n\n## Environment\n- Browser:\n- URL:\n- Commit:\n\n## Observations\n- \n\n## Risks / Follow-up\n- \n`;

await fs.writeFile(file, template, "utf8");
console.log(`Created exploratory session note: ${file}`);
