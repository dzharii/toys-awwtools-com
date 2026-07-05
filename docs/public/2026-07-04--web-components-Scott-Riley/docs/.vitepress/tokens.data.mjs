import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const docsConfigDirectory = dirname(fileURLToPath(import.meta.url));
const tokensPath = resolve(docsConfigDirectory, "../../packages/tokens/dist/tokens.json");

export default {
  watch: [tokensPath],
  load() {
    return JSON.parse(readFileSync(tokensPath, "utf8"));
  },
};
