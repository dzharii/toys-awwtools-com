import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const docsConfigDirectory = dirname(fileURLToPath(import.meta.url));
const manifestPath = resolve(docsConfigDirectory, "../../packages/components/dist/custom-elements.json");

export default {
  watch: [manifestPath],
  load() {
    return JSON.parse(readFileSync(manifestPath, "utf8"));
  },
};
